// =====================================================
// Buscar Cliente — endpoint leve pro dashboard (sem IA)
// Lê a lista 'ixc_clientes' (sincronizada localmente) do app_storage,
// filtra por nome/CPF/ID e devolve só os que batem. CORS liberado.
// POST { busca: "nome|cpf|id" } → { encontrado, clientes:[...], sincronizado_em }
// =====================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SB_URL, SB_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const norm = (s: unknown) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function lerStorage(key: string): Promise<unknown> {
  const { data } = await sb.from("app_storage").select("value").eq("key", key).maybeSingle();
  if (!data || data.value == null) return null;
  try { return typeof data.value === "string" ? JSON.parse(data.value) : data.value; }
  catch { return data.value; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  let body: { busca?: string } = {};
  try { body = await req.json(); } catch { /* vazio */ }
  const termo = String(body.busca ?? "").trim();

  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  if (!termo) return json({ erro: "Informe um nome, CPF ou ID." }, 400);

  const lista = await lerStorage("ixc_clientes");
  const syncInfo = await lerStorage("ixc_clientes_sync") as Record<string, unknown> | null;
  const sincronizadoEm = syncInfo?.timestamp ?? null;

  if (!Array.isArray(lista) || lista.length === 0) {
    return json({ erro: "Lista de clientes ainda não sincronizada. Rode o SINCRONIZAR-CLIENTES no PC.", sincronizado_em: sincronizadoEm });
  }

  const dig = termo.replace(/\D/g, "");
  let matches: Array<Record<string, unknown>> = [];
  if (dig.length >= 11) matches = lista.filter((c) => String(c.cpf ?? "").replace(/\D/g, "") === dig);
  if (matches.length === 0 && /^\d+$/.test(termo)) matches = lista.filter((c) => String(c.id) === termo);
  if (matches.length === 0) {
    const palavras = norm(termo).split(/\s+/).filter((w) => w.length >= 2);
    matches = lista.filter((c) => { const n = norm(c.nome); return palavras.every((w) => n.includes(w)); });
  }

  return json({
    encontrado: matches.length > 0,
    total: matches.length,
    sincronizado_em: sincronizadoEm,
    clientes: matches.slice(0, 30).map((c) => ({
      id: c.id, nome: c.nome, cpf: c.cpf, ativo: c.ativo,
      contratos: Array.isArray(c.contratos) ? c.contratos : [],
      total_mensal: c.total_mensal ?? null,
    })),
  });
});
