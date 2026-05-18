// Webhook chamado pela Evolution API quando chega mensagem nova
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { enviarMensagem, extrairPhone } from "../_shared/evolution.ts";

const PHONES_AUTORIZADOS = (Deno.env.get("WHATSAPP_PHONES_AUTORIZADOS") ?? "5585991561915")
  .split(",").map((p) => p.trim()).filter(Boolean);

// Usa fetch direto com AbortController — sem supabase-js que trava a edge function
const SB_URL = Deno.env.get("SUPABASE_URL") ?? "https://xuwwgprchhfshrqdhuqn.supabase.co";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

async function sbGet(key: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const url = `${SB_URL}/rest/v1/app_storage?key=eq.${encodeURIComponent(key)}&select=value&limit=1`;
    const res = await fetch(url, {
      headers: {
        "apikey": SB_KEY,
        "Authorization": `Bearer ${SB_KEY}`,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`sbGet ${key}: HTTP ${res.status} ${await res.text()}`);
      return null;
    }
    const rows = await res.json() as Array<{ value: string }>;
    return rows[0]?.value ?? null;
  } catch (e) {
    clearTimeout(timer);
    console.error(`sbGet ${key} error:`, String(e));
    return null;
  }
}

async function sbGetMulti(keys: string[]): Promise<Record<string, string>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const result: Record<string, string> = {};
  try {
    const encoded = keys.map((k) => encodeURIComponent(k)).join(",");
    const url = `${SB_URL}/rest/v1/app_storage?key=in.(${encoded})&select=key,value`;
    const res = await fetch(url, {
      headers: {
        "apikey": SB_KEY,
        "Authorization": `Bearer ${SB_KEY}`,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`sbGetMulti HTTP ${res.status}: ${await res.text()}`);
      return result;
    }
    const rows = await res.json() as Array<{ key: string; value: string }>;
    for (const row of rows) result[row.key] = row.value;
    return result;
  } catch (e) {
    clearTimeout(timer);
    console.error("sbGetMulti error:", String(e));
    return result;
  }
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response("ok", { status: 200 });
  }

  if (payload.event !== "messages.upsert") return new Response("ok", { status: 200 });

  const data = payload.data as Record<string, unknown>;
  const key = data?.key as Record<string, unknown>;
  const remoteJid = String(key?.remoteJid ?? "");
  const fromMe = Boolean(key?.fromMe);

  if (!remoteJid) return new Response("ok", { status: 200 });

  const phone = extrairPhone(remoteJid);

  // Só processa mensagens cujo remoteJid seja o número autorizado
  // Para uso com número pessoal: envie comandos pelo chat "Mensagem pra você mesmo"
  if (PHONES_AUTORIZADOS.length > 0 && !PHONES_AUTORIZADOS.includes(phone)) {
    return new Response("ok", { status: 200 });
  }

  const msg = data?.message as Record<string, unknown>;
  const texto = String(
    msg?.conversation ?? msg?.extendedTextMessage?.text ?? ""
  ).trim().toLowerCase();

  if (!texto) return new Response("ok", { status: 200 });

  try {
    await processarComando(texto, phone);
  } catch (e) {
    await enviarMensagem(phone, `❌ Erro: ${String(e)}`).catch(() => {});
  }

  return new Response("ok", { status: 200 });
});

async function processarComando(texto: string, phone: string) {
  if (["ajuda", "help", "menu"].includes(texto)) {
    await enviarMensagem(phone, menuAjuda());
    return;
  }

  if (texto === "status") {
    await enviarStatus(phone);
    return;
  }

  if (texto === "relatorio" || texto.startsWith("relatorio ")) {
    const partes = texto.split(" ");
    const mes = partes[1] ?? mesAtual();
    await enviarRelatorio(phone, mes);
    return;
  }

  if (texto === "ixc" || texto.startsWith("ixc ")) {
    const partes = texto.split(" ");
    const mes = partes[1] ?? mesAtual();
    await enviarIxc(phone, mes);
    return;
  }

  await enviarMensagem(phone, `Comando não reconhecido.\n\n${menuAjuda()}`);
}

function menuAjuda(): string {
  return `📊 *TEXNET Indicadores Bot*

Comandos disponíveis:

*relatorio* — Power BI do mês atual
*relatorio YYYY-MM* — Power BI de mês específico
*ixc* — dados IXC do mês atual
*ixc YYYY-MM* — dados IXC de mês específico
*status* — status dos últimos syncs
*ajuda* — este menu`;
}

async function enviarRelatorio(phone: string, mes: string) {
  const raw = await sbGet(`powerbi_diretoria_${mes}`);
  if (!raw) {
    await enviarMensagem(phone, `❓ Sem dados Power BI para *${mes}*.\n\nTente: relatorio ${mesAtual()}`);
    return;
  }

  const payload = JSON.parse(String(raw));
  const v = payload?.valores ?? {};

  const fmt = (val: unknown, prefixo = "") => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
      if (prefixo === "R$") return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return val.toLocaleString("pt-BR");
    }
    return String(val);
  };

  const atualizado = payload.atualizado_em
    ? new Date(payload.atualizado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : "—";

  await enviarMensagem(phone, `📊 *Relatório Power BI — ${mes}*

👥 *Bases*
• PF: ${fmt(v["Base de Cliente PF"])}
• PJ+PME: ${fmt(v["Base Clientes PJ +PME"] ?? v["Base PJ+PME"])}
• Isentos: ${fmt(v["Base de Isentos"])}
• Contratos: ${fmt(v["Base de Contratos"])}

🆕 *Novos Clientes*
• PF: ${fmt(v["Novos Clientes PF"])}
• PJ: ${fmt(v["Novos Clientes PJ"])}

❌ *Cancelamentos*
• PF: ${fmt(v["Cancelamento PF"])}
• PJ+PME: ${fmt(v["Cancelam. PME + PJ"] ?? v["Cancelam. PME+PJ"])}

💰 *Financeiro*
• Novos Negócios PF: ${fmt(v["Novos Negócios PF"], "R$")}
• Novos Negócios PJ: ${fmt(v["Novos Negócios PJ"], "R$")}
• Valor Cancelamento: ${fmt(v["Valor Cancelamento"], "R$")}
• Resultado Líquido: ${fmt(v["Resultado Liquido"] ?? v["Resultado Líquido"], "R$")}
• Ticket Médio Base: ${fmt(v["Ticket médio da Base"] ?? v["Ticket Médio da Base"], "R$")}

🕐 ${atualizado}`);
}

async function enviarIxc(phone: string, mes: string) {
  const rows = await sbGetMulti([`ixc_comercial_${mes}`, `ixc_fluxo_${mes}`]);
  const comercialRaw = rows[`ixc_comercial_${mes}`];
  const fluxoRaw = rows[`ixc_fluxo_${mes}`];

  if (!comercialRaw && !fluxoRaw) {
    await enviarMensagem(phone, `❓ Sem dados IXC para *${mes}*.\n\nTente: ixc ${mesAtual()}`);
    return;
  }

  let msg = `📡 *IXC — ${mes}*\n`;

  if (comercialRaw) {
    const c = JSON.parse(comercialRaw);
    const fmt = (v: unknown) => {
      if (v === null || v === undefined) return "—";
      if (typeof v === "number") return v.toLocaleString("pt-BR");
      return String(v);
    };
    msg += `
🆕 *Novos*
• Total: ${fmt(c.novosTotal)}
• PF: ${fmt(c.novosPF)}
• PJ: ${fmt(c.novosPJ)}

❌ *Cancelamentos*
• Total: ${fmt(c.cancelTotal)}
• PF: ${fmt(c.canceladosPF)}`;
  }

  await enviarMensagem(phone, msg);
}

async function enviarStatus(phone: string) {
  const keys = ["powerbi_diretoria", "powerbi_comercial_pf"];
  const rows = await sbGetMulti(keys);

  if (Object.keys(rows).length === 0) {
    await enviarMensagem(phone, "⚠️ Não foi possível obter status (timeout DB).");
    return;
  }

  const labels: Record<string, string> = {
    "powerbi_diretoria": "Diretoria PBI",
    "powerbi_comercial_pf": "Comercial PF",
  };

  let msg = "🔄 *Status dos Syncs*\n";
  for (const [k, raw] of Object.entries(rows)) {
    const payload = JSON.parse(raw);
    const atualizado = payload?.atualizado_em
      ? new Date(payload.atualizado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
      : "desconhecido";
    msg += `\n• *${labels[k] ?? k}*: ${atualizado}`;
  }

  await enviarMensagem(phone, msg);
}

function mesAtual(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
