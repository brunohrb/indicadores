// =====================================================
// Coach IA — núcleo compartilhado (Claude + tools)
// Usado pelo endpoint de streaming (coach-ia) e pelo WhatsApp (webhook).
// Tools leem dados reais de negócio do app_storage do Supabase.
// =====================================================
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const MODELO = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_NOME = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function mesAtualYM(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Leitura do app_storage (value é text → JSON) ───────────────
async function lerStorage(sb: SupabaseClient, key: string): Promise<unknown> {
  const { data } = await sb.from("app_storage").select("value").eq("key", key).maybeSingle();
  if (!data || data.value == null) return null;
  try {
    return typeof data.value === "string" ? JSON.parse(data.value) : data.value;
  } catch {
    return data.value;
  }
}

function valoresDe(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object" && "valores" in (payload as Record<string, unknown>)) {
    const v = (payload as Record<string, unknown>).valores;
    return (v && typeof v === "object") ? v as Record<string, unknown> : {};
  }
  return {};
}

// ── Definição das tools (formato Anthropic) ────────────────────
export const TOOLS = [
  {
    name: "listar_dados_disponiveis",
    description:
      "Lista quais meses têm dados disponíveis (Power BI, financeiro/Fluxo de Caixa e IXC) e quando foram sincronizados pela última vez. Use isto primeiro quando o usuário pedir algo e você não souber se há dados para o período.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_indicadores_mes",
    description:
      "Retorna os indicadores do Power BI de um mês: bases de clientes (PF, PJ+PME, isentos, contratos), novos clientes, cancelamentos, OS, novos negócios, ticket médio, reajustes e churn. Use para perguntas sobre clientes, vendas, cancelamentos e crescimento.",
    input_schema: {
      type: "object",
      properties: {
        mes: { type: "string", description: "Mês no formato YYYY-MM. Ex: 2026-05. Se omitido, usa o mês atual." },
      },
    },
  },
  {
    name: "get_financeiro_mes",
    description:
      "Retorna o resultado financeiro de um mês a partir do Fluxo de Caixa consolidado: faturamento (receitas), impostos, custos, despesas, EBITDA estimado e as principais linhas de cada grupo. Use para perguntas sobre faturamento, margem, custos e lucro.",
    input_schema: {
      type: "object",
      properties: {
        mes: { type: "string", description: "Mês no formato YYYY-MM. Ex: 2026-05. Se omitido, usa o mês atual." },
      },
    },
  },
  {
    name: "get_ixc",
    description:
      "Retorna dados sincronizados do IXC para um tipo específico. Tipos: 'operacional' (clientes instalados/ativos), 'receitas', 'despesas', 'fluxo' (fluxo de caixa diário) ou 'comercial' (novos, cancelamentos, OS).",
    input_schema: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["operacional", "receitas", "despesas", "fluxo", "comercial"], description: "Tipo de dado IXC." },
        mes: { type: "string", description: "Mês YYYY-MM (não usado para 'operacional'). Se omitido, usa o mês atual." },
      },
      required: ["tipo"],
    },
  },
  {
    name: "get_pagamento_cliente",
    description:
      "Consulta quanto um cliente específico paga, direto na API do IXC, buscando por nome, CPF/CNPJ ou ID do contrato. Use somente quando o usuário pedir o valor/mensalidade de UM cliente identificável.",
    input_schema: {
      type: "object",
      properties: {
        busca: { type: "string", description: "Nome, CPF/CNPJ ou ID do cliente/contrato a buscar." },
      },
      required: ["busca"],
    },
  },
];

// ── Executor das tools ─────────────────────────────────────────
export async function executarTool(sb: SupabaseClient, nome: string, input: Record<string, unknown>): Promise<unknown> {
  switch (nome) {
    case "listar_dados_disponiveis":
      return await toolListarDisponiveis(sb);
    case "get_indicadores_mes":
      return await toolIndicadores(sb, String(input.mes ?? mesAtualYM()));
    case "get_financeiro_mes":
      return await toolFinanceiro(sb, String(input.mes ?? mesAtualYM()));
    case "get_ixc":
      return await toolIxc(sb, String(input.tipo ?? ""), input.mes ? String(input.mes) : mesAtualYM());
    case "get_pagamento_cliente":
      return await toolPagamentoCliente(String(input.busca ?? ""));
    default:
      return { erro: `Tool desconhecida: ${nome}` };
  }
}

async function toolListarDisponiveis(sb: SupabaseClient) {
  const out: Record<string, unknown> = {};
  const dispDir = await lerStorage(sb, "powerbi_diretoria_meses_disponiveis");
  const fechados = await lerStorage(sb, "powerbi_diretoria_meses_fechados");
  out.meses_powerbi = Array.isArray(dispDir) ? dispDir : [];
  out.meses_fechados = Array.isArray(fechados) ? fechados : [];

  const dir = await lerStorage(sb, "powerbi_diretoria");
  out.powerbi_ultima_sync = (dir as Record<string, unknown>)?.atualizado_em ?? null;

  const ixcSync = await lerStorage(sb, "ixc_ultima_sync");
  out.ixc_ultima_sync = ixcSync ?? null;

  const consolidado = await lerStorage(sb, "consolidado_dados");
  out.financeiro_disponivel = !!consolidado;
  return out;
}

async function toolIndicadores(sb: SupabaseClient, mes: string) {
  const dir = await lerStorage(sb, `powerbi_diretoria_fechado_${mes}`) ?? await lerStorage(sb, `powerbi_diretoria_${mes}`);
  const com = await lerStorage(sb, `powerbi_comercial_pf_fechado_${mes}`) ?? await lerStorage(sb, `powerbi_comercial_pf_${mes}`);
  const rea = await lerStorage(sb, `powerbi_reajustes_fechado_${mes}`) ?? await lerStorage(sb, `powerbi_reajustes_${mes}`);

  if (!dir && !com && !rea) return { mes, erro: "Sem dados do Power BI para este mês." };

  // Comercial PF primeiro, Diretoria sobrescreve (Novos Negócios vence Diretoria)
  const valores = { ...valoresDe(com), ...valoresDe(dir), ...valoresDe(rea) };
  return { mes, fonte: "powerbi", valores };
}

async function toolFinanceiro(sb: SupabaseClient, mes: string) {
  const consolidado = await lerStorage(sb, "consolidado_dados") as Record<string, Array<Record<string, number | string>>> | null;
  if (!consolidado) return { mes, erro: "Fluxo de Caixa consolidado ainda não foi sincronizado." };

  const [ano, mm] = mes.split("-").map(Number);
  const idx = (mm ?? 1) - 1;
  const k = MESES_ABREV[idx];
  if (!k) return { mes, erro: "Mês inválido." };

  const somaGrupo = (grupo?: Array<Record<string, number | string>>) =>
    (grupo ?? []).reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const topLinhas = (grupo?: Array<Record<string, number | string>>, n = 6) =>
    [...(grupo ?? [])]
      .map((r) => ({ nome: String(r.nome), valor: Number(r[k]) || 0 }))
      .filter((r) => r.valor !== 0)
      .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
      .slice(0, n);

  const receitas = somaGrupo(consolidado.receitas);
  const impostos = somaGrupo(consolidado.impostos);
  const custos = somaGrupo(consolidado.custos);
  const despesas = somaGrupo(consolidado.despesas);
  const ebitda = receitas - impostos - custos - despesas;

  return {
    mes,
    mes_nome: `${MESES_NOME[idx]}/${ano}`,
    faturamento: receitas,
    impostos,
    custos,
    despesas,
    ebitda_estimado: ebitda,
    margem_ebitda_pct: receitas > 0 ? Number(((ebitda / receitas) * 100).toFixed(2)) : null,
    principais_receitas: topLinhas(consolidado.receitas),
    maiores_custos: topLinhas(consolidado.custos),
    maiores_despesas: topLinhas(consolidado.despesas),
  };
}

async function toolIxc(sb: SupabaseClient, tipo: string, mes: string) {
  if (tipo === "operacional") {
    const op = await lerStorage(sb, "ixc_operacional");
    return op ?? { erro: "Sem dados operacionais do IXC." };
  }
  const validos = ["receitas", "despesas", "fluxo", "comercial"];
  if (!validos.includes(tipo)) return { erro: `Tipo IXC inválido: ${tipo}` };
  const d = await lerStorage(sb, `ixc_${tipo}_${mes}`);
  return d ?? { mes, tipo, erro: "Sem dados IXC para este tipo/mês." };
}

async function toolPagamentoCliente(busca: string) {
  const IXC_URL = Deno.env.get("IXC_API_URL");
  const IXC_TOKEN = Deno.env.get("IXC_API_TOKEN");
  if (!IXC_URL || !IXC_TOKEN) {
    return {
      erro: "Consulta por cliente na API do IXC ainda não está configurada. Defina os secrets IXC_API_URL e IXC_API_TOKEN no Supabase para habilitar.",
    };
  }
  // IXC: HTTP Basic (token base64) + header ixcsoft: listar. Busca por contratos.
  const auth = "Basic " + btoa(IXC_TOKEN);
  try {
    const res = await fetch(`${IXC_URL.replace(/\/$/, "")}/webservice/v1/cliente_contrato`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth, ixcsoft: "listar" },
      body: JSON.stringify({
        qtype: "cliente_contrato.id",
        query: busca,
        oper: "=",
        page: "1",
        rp: "5",
        sortname: "cliente_contrato.id",
        sortorder: "asc",
      }),
    });
    if (!res.ok) return { erro: `IXC respondeu ${res.status}` };
    const data = await res.json();
    return { resultado: data?.registros ?? data };
  } catch (e) {
    return { erro: `Falha ao consultar IXC: ${String(e)}` };
  }
}

// ── System prompt ──────────────────────────────────────────────
export function systemPrompt(): string {
  const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  return [
    "Você é o Coach IA da TEXNET, um provedor de internet (ISP) brasileiro.",
    `Hoje é ${hoje}.`,
    "Seu papel é ser um copiloto de negócios: conversar de forma direta e amigável, analisar os números reais da empresa e dar recomendações acionáveis — no estilo de um coach (como o WHOOP Coach), não um relatório formal.",
    "",
    "REGRAS:",
    "1) Responda SEMPRE em português do Brasil.",
    "2) Use as ferramentas (tools) para buscar dados reais antes de afirmar números. NUNCA invente valores.",
    "3) Se não houver dados para o período pedido, diga isso claramente e sugira um mês com dados.",
    "4) Seja conciso por padrão. Use markdown leve (negrito, listas curtas) e no máximo 1-2 emojis quando ajudar.",
    "5) Valores em R$ no formato brasileiro (ex: R$ 1.234,56).",
    "6) Benchmarks ISP: margem EBITDA saudável 25-35%, churn saudável abaixo de 2%. Compare quando relevante.",
    "7) Quando o mês pedido for o mês atual, lembre que os dados podem ser parciais.",
    "8) Termine com uma sugestão prática ou uma pergunta de follow-up quando fizer sentido.",
  ].join("\n");
}

// ── Loop agêntico NÃO-streaming (WhatsApp) ─────────────────────
type Msg = { role: "user" | "assistant"; content: unknown };

export async function responderCoach(sb: SupabaseClient, messages: Msg[], maxIter = 6): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return "⚠️ ANTHROPIC_API_KEY não configurada no Supabase.";

  const convo: Msg[] = [...messages];
  let textoFinal = "";

  for (let i = 0; i < maxIter; i++) {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 2000,
        system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        messages: convo,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return `❌ Erro Claude ${res.status}: ${err.slice(0, 300)}`;
    }

    const data = await res.json();
    const content = data.content ?? [];
    convo.push({ role: "assistant", content });

    const textos = content.filter((b) => b.type === "text").map((b) => b.text);
    if (textos.length) textoFinal = textos.join("\n");

    if (data.stop_reason !== "tool_use") break;

    const toolUses = content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    for (const tu of toolUses) {
      const resultado = await executarTool(sb, String(tu.name), (tu.input ?? {}) as Record<string, unknown>);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(resultado),
      });
    }
    convo.push({ role: "user", content: toolResults });
  }

  return textoFinal || "Não consegui gerar uma resposta.";
}
