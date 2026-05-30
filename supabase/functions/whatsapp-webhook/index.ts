// Webhook chamado pela Evolution API quando chega mensagem nova
// Configure no painel Evolution: Events → messages.upsert → URL desta function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enviarMensagem, extrairPhone } from "../_shared/evolution.ts";
import { responderCoach } from "../_shared/coach-core.ts";

const VERSAO = "wpp-v5";
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Números autorizados a usar o bot (separados por vírgula, ex: "5511999999999,5511888888888")
const PHONES_AUTORIZADOS = (Deno.env.get("WHATSAPP_PHONES_AUTORIZADOS") ?? "").split(",").map((p) => p.trim()).filter(Boolean);

const sb = createClient(SB_URL, SB_KEY);

serve(async (req) => {
  // GET de sanidade — abra a URL da function no navegador pra confirmar
  // que ela está publicada e ver quais secrets estão configurados (sem
  // expor os valores — só true/false).
  if (req.method === "GET") {
    return new Response(
      JSON.stringify(
        {
          ok: true,
          function: "whatsapp-webhook",
          versao: VERSAO,
          ts: new Date().toISOString(),
          secrets: {
            EVOLUTION_URL: !!Deno.env.get("EVOLUTION_URL"),
            EVOLUTION_API_KEY: !!Deno.env.get("EVOLUTION_API_KEY"),
            EVOLUTION_INSTANCE: Deno.env.get("EVOLUTION_INSTANCE") ?? "(default: texnet)",
            ANTHROPIC_API_KEY: !!Deno.env.get("ANTHROPIC_API_KEY"),
            WHATSAPP_PHONES_AUTORIZADOS:
              PHONES_AUTORIZADOS.length > 0 ? `${PHONES_AUTORIZADOS.length} número(s)` : "(vazio = libera geral)",
          },
        },
        null,
        2,
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  if (req.method !== "POST") return new Response("ok", { status: 200 });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    console.log("[wpp] JSON inválido no body");
    return new Response("ok", { status: 200 });
  }

  console.log("[wpp] event recebido:", payload.event);

  // Aceita variações de case (algumas versões da Evolution mandam em CAPS)
  const event = String(payload.event ?? "").toLowerCase();
  if (event !== "messages.upsert") {
    console.log("[wpp] evento ignorado:", event);
    return new Response("ok", { status: 200 });
  }

  const data = payload.data as Record<string, unknown>;
  const key = data?.key as Record<string, unknown>;
  const remoteJid = String(key?.remoteJid ?? "");
  const fromMe = Boolean(key?.fromMe);

  if (fromMe) {
    console.log("[wpp] fromMe=true, ignorando eco do próprio bot");
    return new Response("ok", { status: 200 });
  }
  if (!remoteJid) {
    console.log("[wpp] sem remoteJid no payload");
    return new Response("ok", { status: 200 });
  }

  // Extrai texto da mensagem (cobre tipos comuns: texto simples, extendido, legenda de imagem/vídeo)
  const msg = data?.message as Record<string, unknown>;
  const textoOriginal = String(
    msg?.conversation
      ?? (msg?.extendedTextMessage as Record<string, unknown>)?.text
      ?? (msg?.imageMessage as Record<string, unknown>)?.caption
      ?? (msg?.videoMessage as Record<string, unknown>)?.caption
      ?? "",
  ).trim();
  const texto = textoOriginal.toLowerCase();

  // Multi-device do WhatsApp pode mandar SÓ um LID (ID opaco) em remoteJid
  // — sem o número real em campo nenhum. Coletamos candidatos numéricos
  // de vários lugares pra cobrir as variações.
  const dAny = data as Record<string, unknown>;
  const fontes: unknown[] = [
    remoteJid,
    key?.participant,
    (key as Record<string, unknown>)?.senderPn,
    (dAny?.contact as Record<string, unknown>)?.id,
    (dAny?.contact as Record<string, unknown>)?.number,
    dAny?.sender,
    dAny?.participant,
  ];
  const candidatos = fontes
    .map((v) => String(v ?? ""))
    .filter(Boolean)
    .map(extrairPhone)
    .filter((c) => /^\d{8,}$/.test(c)); // só numéricos com 8+ dígitos
  console.log("[wpp] candidatos:", JSON.stringify(candidatos));
  console.log("[wpp] payload.data:", JSON.stringify(data).slice(0, 2000));

  // Pra RESPONDER preserva o sufixo @lid quando aplica — senão a Evolution
  // tenta fazer lookup do número como telefone e dá "exists:false".
  // Pra storage/auth usa só os dígitos.
  const replyTo = remoteJid.endsWith("@lid") ? remoteJid : extrairPhone(remoteJid);
  const phoneId = extrairPhone(remoteJid);
  console.log(`[wpp] replyTo=${replyTo} phoneId=${phoneId} texto="${textoOriginal.slice(0, 100)}"`);

  // Autorização: aceita se QUALQUER candidato bater com a lista.
  if (PHONES_AUTORIZADOS.length > 0 && !candidatos.some(numeroAutorizado)) {
    console.log(`[wpp] NÃO autorizado. candidatos=${candidatos.join(",")} lista=${PHONES_AUTORIZADOS.join(",")}`);
    // Não tenta responder de volta — pra LIDs o Evolution dá 400 e polui o log.
    return new Response("ok", { status: 200 });
  }

  if (!texto) {
    console.log("[wpp] mensagem sem texto extraível (talvez áudio/sticker/etc), ignorando");
    return new Response("ok", { status: 200 });
  }

  try {
    await processarComando(texto, textoOriginal, replyTo, phoneId);
  } catch (e) {
    console.log("[wpp] erro processando:", String(e));
    await enviarMensagem(replyTo, `❌ Erro interno: ${String(e).slice(0, 200)}`).catch(() => {});
  }

  return new Response("ok", { status: 200 });
});

// ── Normalização de número BR (quirk: 9 extra/faltando, sufixo :device) ──
function normalizar(n: string): string {
  return n.replace(/[^\d]/g, "").split(":")[0];
}
// 13 dígitos (com 9) ↔ 12 dígitos (sem 9). Aceita os dois lados.
function variantes(n: string): string[] {
  const base = normalizar(n);
  const out = new Set<string>([base]);
  if (base.length === 13 && base.startsWith("55") && base[4] === "9") {
    out.add(base.slice(0, 4) + base.slice(5)); // remove o 9
  } else if (base.length === 12 && base.startsWith("55")) {
    out.add(base.slice(0, 4) + "9" + base.slice(4)); // adiciona o 9
  }
  return [...out];
}
function numeroAutorizado(phone: string): boolean {
  const phoneVars = variantes(phone);
  for (const a of PHONES_AUTORIZADOS) {
    const authVars = variantes(a);
    if (phoneVars.some((p) => authVars.includes(p))) return true;
  }
  return false;
}

async function processarComando(texto: string, textoOriginal: string, replyTo: string, phoneId: string) {
  if (!texto) return;
  if (texto === "ajuda" || texto === "help" || texto === "menu") {
    await enviarMensagem(
      replyTo,
      `📊 *TEXNET Indicadores Bot*

💬 *Pode falar comigo naturalmente!* Pergunte qualquer coisa sobre os indicadores, faturamento, clientes, cancelamentos, etc. — eu busco os dados reais e respondo.

Comandos rápidos:
*relatorio* — KPIs do mês atual
*relatorio YYYY-MM* — KPIs de um mês específico
*status* — status dos últimos syncs
*limpar* — reinicia a conversa
*ajuda* — este menu`,
    );
    return;
  }

  if (texto === "status") {
    await enviarStatus(replyTo);
    return;
  }

  if (texto === "relatorio" || texto.startsWith("relatorio ")) {
    const partes = texto.split(" ");
    const mes = partes[1] ?? mesAtual();
    await enviarRelatorio(replyTo, mes);
    return;
  }

  if (texto === "limpar" || texto === "reset" || texto === "novo") {
    await salvarHistorico(phoneId, []);
    await enviarMensagem(replyTo, "🧹 Conversa reiniciada. Pode perguntar o que quiser sobre os indicadores!");
    return;
  }

  // Qualquer outro texto vira conversa com o Coach IA
  await responderComCoach(replyTo, phoneId, textoOriginal);
}

// ── Coach IA via WhatsApp (mantém histórico curto por telefone) ──
async function responderComCoach(replyTo: string, phoneId: string, pergunta: string) {
  const historico = await lerHistorico(phoneId);
  historico.push({ role: "user", content: pergunta });

  console.log(`[wpp] chamando Coach IA pra ${phoneId}...`);
  const resposta = await responderCoach(sb, historico.slice(-10));
  console.log(`[wpp] Coach respondeu (${resposta.length} chars)`);

  historico.push({ role: "assistant", content: resposta });
  await salvarHistorico(phoneId, historico.slice(-10));

  await enviarMensagem(replyTo, resposta);
}

type Turno = { role: "user" | "assistant"; content: string };

async function lerHistorico(phone: string): Promise<Turno[]> {
  const { data } = await sb.from("app_storage").select("value").eq("key", `coach_wpp_${phone}`).maybeSingle();
  if (!data || data.value == null) return [];
  try {
    const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

async function salvarHistorico(phone: string, historico: Turno[]) {
  await sb.from("app_storage").upsert({ key: `coach_wpp_${phone}`, value: JSON.stringify(historico) }, { onConflict: "key" });
}

async function enviarRelatorio(replyTo: string, mes: string) {
  const { data: row } = await sb
    .from("app_storage")
    .select("value")
    .eq("key", `powerbi_diretoria_${mes}`)
    .maybeSingle();

  if (!row) {
    await enviarMensagem(replyTo, `❓ Sem dados para o mês *${mes}*.\n\nMeses disponíveis: use o dashboard ou tente outro mês.`);
    return;
  }

  const payload = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
  const v = payload?.valores ?? {};

  const fmt = (val: unknown, prefixo = "") => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
      if (prefixo === "R$") return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      return val.toLocaleString("pt-BR");
    }
    return String(val);
  };

  const msg = `📊 *Relatório ${mes}*

👥 *Bases*
• PF: ${fmt(v["Base de Cliente PF"])}
• PJ+PME: ${fmt(v["Base PJ+PME"])}
• Isentos: ${fmt(v["Base de Isentos"])}
• Contratos: ${fmt(v["Base de Contratos"])}

🆕 *Novos Clientes*
• PF: ${fmt(v["Novos Clientes PF"])}
• PJ: ${fmt(v["Novos Clientes PJ"])}

❌ *Cancelamentos*
• PF: ${fmt(v["Cancelamento PF"])}
• PJ+PME: ${fmt(v["Cancelam. PME+PJ"])}

💰 *Financeiro*
• Novos Negócios PF: ${fmt(v["Novos Negócios PF"], "R$")}
• Novos Negócios PJ: ${fmt(v["Novos Negócios PJ"], "R$")}
• Valor Cancelamento: ${fmt(v["Valor Cancelamento"], "R$")}
• Resultado Líquido: ${fmt(v["Resultado Líquido"], "R$")}
• Ticket Médio Base: ${fmt(v["Ticket Médio da Base"], "R$")}

🕐 Atualizado: ${payload.atualizado_em ? new Date(payload.atualizado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—"}`;

  await enviarMensagem(replyTo, msg);
}

async function enviarStatus(replyTo: string) {
  const chaves = [
    "powerbi_diretoria",
    "powerbi_comercial_pf",
  ];

  const { data: rows } = await sb
    .from("app_storage")
    .select("key, value")
    .in("key", chaves);

  if (!rows || rows.length === 0) {
    await enviarMensagem(replyTo, "⚠️ Não foi possível obter status dos syncs.");
    return;
  }

  let msg = "🔄 *Status dos Syncs*\n";
  for (const row of rows) {
    const payload = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    const atualizado = payload?.atualizado_em
      ? new Date(payload.atualizado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
      : "desconhecido";
    const label = row.key === "powerbi_diretoria" ? "Diretoria PBI" : "Comercial PF";
    msg += `\n• *${label}*: ${atualizado}`;
  }

  await enviarMensagem(replyTo, msg);
}

function mesAtual(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
