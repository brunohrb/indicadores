// Relatório diário automático — chame via GitHub Actions cron ou manualmente
// POST /functions/v1/whatsapp-relatorio
// Body: { mes?: "YYYY-MM" }  (opcional — default: mês atual)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enviarMensagem } from "../_shared/evolution.ts";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WHATSAPP_WEBHOOK_SECRET") ?? "";
// Números que recebem o relatório diário (separados por vírgula)
const PHONES_RELATORIO = (Deno.env.get("WHATSAPP_PHONES_RELATORIO") ?? "").split(",").map((p) => p.trim()).filter(Boolean);

const sb = createClient(SB_URL, SB_KEY);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = req.headers.get("x-webhook-secret") ?? "";
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { mes?: string } = {};
  try { body = await req.json(); } catch { /* sem body é ok */ }

  const mes = body.mes ?? mesAtual();

  if (PHONES_RELATORIO.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: "WHATSAPP_PHONES_RELATORIO não configurado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: row } = await sb
    .from("app_storage")
    .select("value")
    .eq("key", `powerbi_diretoria_${mes}`)
    .maybeSingle();

  if (!row) {
    const erroMsg = `⚠️ Relatório ${mes}: sem dados disponíveis.`;
    await Promise.all(PHONES_RELATORIO.map((p) => enviarMensagem(p, erroMsg)));
    return new Response(JSON.stringify({ ok: false, error: "Sem dados" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
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

  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const msg = `📊 *Relatório Diário TEXNET — ${mes}*
🕐 ${agora}

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
• Ticket Médio Base: ${fmt(v["Ticket Médio da Base"], "R$")}`;

  await Promise.all(PHONES_RELATORIO.map((p) => enviarMensagem(p, msg)));

  return new Response(JSON.stringify({ ok: true, mes, enviado_para: PHONES_RELATORIO.length }), {
    headers: { "Content-Type": "application/json" },
  });
});

function mesAtual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
