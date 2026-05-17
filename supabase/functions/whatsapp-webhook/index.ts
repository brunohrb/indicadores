// Webhook chamado pela Evolution API quando chega mensagem nova
// Configure no painel Evolution: Events → messages.upsert → URL desta function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enviarMensagem, extrairPhone } from "../_shared/evolution.ts";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Números autorizados a usar comandos (separados por vírgula, ex: "5511999999999,5511888888888")
const PHONES_AUTORIZADOS = (Deno.env.get("WHATSAPP_PHONES_AUTORIZADOS") ?? "").split(",").map((p) => p.trim()).filter(Boolean);

const sb = createClient(SB_URL, SB_KEY);

serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response("ok", { status: 200 });
  }

  // Evolution API envia event = "messages.upsert"
  if (payload.event !== "messages.upsert") return new Response("ok", { status: 200 });

  const data = payload.data as Record<string, unknown>;
  const key = data?.key as Record<string, unknown>;
  const remoteJid = String(key?.remoteJid ?? "");
  const fromMe = Boolean(key?.fromMe);

  // Ignora mensagens enviadas pelo próprio bot
  if (fromMe || !remoteJid) return new Response("ok", { status: 200 });

  // Extrai texto da mensagem
  const msg = data?.message as Record<string, unknown>;
  const texto = String(
    msg?.conversation ?? msg?.extendedTextMessage?.text ?? ""
  ).trim().toLowerCase();

  const phone = extrairPhone(remoteJid);

  // Verifica autorização
  if (PHONES_AUTORIZADOS.length > 0 && !PHONES_AUTORIZADOS.includes(phone)) {
    return new Response("ok", { status: 200 });
  }

  try {
    await processarComando(texto, phone);
  } catch (e) {
    await enviarMensagem(phone, `❌ Erro interno: ${String(e)}`).catch(() => {});
  }

  return new Response("ok", { status: 200 });
});

async function processarComando(texto: string, phone: string) {
  if (texto === "ajuda" || texto === "help" || texto === "menu") {
    await enviarMensagem(phone, `📊 *TEXNET Indicadores Bot*

Comandos disponíveis:

*relatorio* — KPIs do mês atual
*relatorio YYYY-MM* — KPIs de um mês específico
*status* — status dos últimos syncs
*ajuda* — este menu`);
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

  await enviarMensagem(phone, `Comando não reconhecido. Digite *ajuda* para ver os comandos disponíveis.`);
}

async function enviarRelatorio(phone: string, mes: string) {
  const { data: row } = await sb
    .from("app_storage")
    .select("value")
    .eq("key", `powerbi_diretoria_${mes}`)
    .maybeSingle();

  if (!row) {
    await enviarMensagem(phone, `❓ Sem dados para o mês *${mes}*.\n\nMeses disponíveis: use o dashboard ou tente outro mês.`);
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

  await enviarMensagem(phone, msg);
}

async function enviarStatus(phone: string) {
  const chaves = [
    "powerbi_diretoria",
    "powerbi_comercial_pf",
  ];

  const { data: rows } = await sb
    .from("app_storage")
    .select("key, value")
    .in("key", chaves);

  if (!rows || rows.length === 0) {
    await enviarMensagem(phone, "⚠️ Não foi possível obter status dos syncs.");
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

  await enviarMensagem(phone, msg);
}

function mesAtual(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
