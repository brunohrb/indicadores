// =====================================================
// Coach IA — endpoint de streaming pro navegador
// POST { messages: [{role, content}] }  → SSE com eventos:
//   {type:"text", text}     fragmento de texto do Claude
//   {type:"tool", name}     status: tool sendo executada
//   {type:"done"}           fim
//   {type:"error", error}   erro
// Roda o loop de tool-use no servidor; só o texto é transmitido.
// Deploy com --no-verify-jwt (preflight CORS do navegador não leva token).
// =====================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MODELO, TOOLS, executarTool, systemPrompt } from "../_shared/coach-core.ts";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const sb = createClient(SB_URL, SB_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  if (!ANTHROPIC_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  let body: { messages?: Array<{ role: string; content: unknown }> } = {};
  try { body = await req.json(); } catch { /* vazio */ }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages vazio" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        await rodarLoop(messages, send);
        send({ type: "done" });
      } catch (e) {
        send({ type: "error", error: String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
});

// Loop agêntico com streaming. Cada chamada ao Claude é transmitida;
// se terminar em tool_use, executa as tools e repete.
async function rodarLoop(
  messages: Array<{ role: string; content: unknown }>,
  send: (obj: unknown) => void,
  maxIter = 6,
) {
  const convo = [...messages];

  for (let i = 0; i < maxIter; i++) {
    const { textBlocks, toolUses, stopReason } = await streamUmaVez(convo, send);

    const assistantContent: unknown[] = [];
    for (const t of textBlocks) assistantContent.push({ type: "text", text: t });
    for (const tu of toolUses) assistantContent.push({ type: "tool_use", id: tu.id, name: tu.name, input: tu.input });
    convo.push({ role: "assistant", content: assistantContent });

    if (stopReason !== "tool_use" || toolUses.length === 0) return;

    const toolResults: unknown[] = [];
    for (const tu of toolUses) {
      send({ type: "tool", name: tu.name });
      const resultado = await executarTool(sb, tu.name, tu.input ?? {});
      toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(resultado) });
    }
    convo.push({ role: "user", content: toolResults });
  }
}

// Faz uma chamada streamada ao Claude, encaminha text_delta pro browser
// e acumula os blocos de tool_use (montando o input JSON parcial).
async function streamUmaVez(
  convo: Array<{ role: string; content: unknown }>,
  send: (obj: unknown) => void,
): Promise<{ textBlocks: string[]; toolUses: Array<{ id: string; name: string; input: Record<string, unknown> }>; stopReason: string }> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 2000,
      stream: true,
      system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
      tools: TOOLS,
      messages: convo,
    }),
  });

  if (!res.ok || !res.body) {
    const err = await res.text().catch(() => "");
    throw new Error(`Claude ${res.status}: ${err.slice(0, 300)}`);
  }

  const textBlocks: string[] = [];
  const toolUses: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];
  const blocks: Record<number, { type: string; text?: string; id?: string; name?: string; jsonBuf?: string }> = {};
  let stopReason = "end_turn";

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const partes = buf.split("\n\n");
    buf = partes.pop() ?? "";
    for (const bloco of partes) {
      const linha = bloco.split("\n").find((l) => l.startsWith("data:"));
      if (!linha) continue;
      const json = linha.slice(5).trim();
      if (!json || json === "[DONE]") continue;
      let ev: Record<string, unknown>;
      try { ev = JSON.parse(json); } catch { continue; }

      const tipo = ev.type;
      if (tipo === "content_block_start") {
        const idx = ev.index as number;
        const cb = ev.content_block as Record<string, unknown>;
        if (cb.type === "tool_use") {
          blocks[idx] = { type: "tool_use", id: String(cb.id), name: String(cb.name), jsonBuf: "" };
        } else {
          blocks[idx] = { type: "text", text: "" };
        }
      } else if (tipo === "content_block_delta") {
        const idx = ev.index as number;
        const delta = ev.delta as Record<string, unknown>;
        const b = blocks[idx];
        if (!b) continue;
        if (delta.type === "text_delta") {
          const t = String(delta.text ?? "");
          b.text = (b.text ?? "") + t;
          send({ type: "text", text: t });
        } else if (delta.type === "input_json_delta") {
          b.jsonBuf = (b.jsonBuf ?? "") + String(delta.partial_json ?? "");
        }
      } else if (tipo === "message_delta") {
        const delta = ev.delta as Record<string, unknown>;
        if (delta?.stop_reason) stopReason = String(delta.stop_reason);
      }
    }
  }

  for (const idx of Object.keys(blocks)) {
    const b = blocks[Number(idx)];
    if (b.type === "text") {
      textBlocks.push(b.text ?? "");
    } else if (b.type === "tool_use") {
      let input: Record<string, unknown> = {};
      try { input = b.jsonBuf ? JSON.parse(b.jsonBuf) : {}; } catch { input = {}; }
      toolUses.push({ id: b.id!, name: b.name!, input });
    }
  }

  return { textBlocks, toolUses, stopReason };
}
