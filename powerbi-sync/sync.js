#!/usr/bin/env node
// =====================================================
// Power BI → Supabase Sync
// Roda no GitHub Actions (agendado) ou manualmente.
// Busca os 36 indicadores da tela "Diretoria" e grava no
// Supabase app_storage sob a chave "powerbi_diretoria".
// =====================================================

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// ─── .env.local (modo local) ──────────────────────────
function carregarEnv() {
  if (process.env.PBI_CLIENT_SECRET) return;
  const caminho = path.join(__dirname, '.env.local');
  if (!fs.existsSync(caminho)) return;
  for (const linha of fs.readFileSync(caminho, 'utf8').split('\n')) {
    const m = linha.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const cor = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', erro: '\x1b[31m', reset: '\x1b[0m' };
function log(msg, tipo = 'info') {
  console.log(`${cor[tipo] || ''}[${new Date().toLocaleTimeString('pt-BR')}] ${msg}${cor.reset}`);
}

// ─── OAuth2 ───────────────────────────────────────────
async function obterToken() {
  const { PBI_TENANT_ID, PBI_CLIENT_ID, PBI_CLIENT_SECRET } = process.env;
  const url = `https://login.microsoftonline.com/${PBI_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: PBI_CLIENT_ID,
    client_secret: PBI_CLIENT_SECRET,
    scope: 'https://analysis.windows.net/powerbi/api/.default',
    grant_type: 'client_credentials',
  });
  const { data } = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  });
  return data.access_token;
}

// ─── Execute Queries ──────────────────────────────────
async function executarDAX(token, dax) {
  const { PBI_WORKSPACE_ID, PBI_DATASET_ID } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_ID}/datasets/${PBI_DATASET_ID}/executeQueries`;
  const { data } = await axios.post(
    url,
    { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
}

// ─── Mapeamento dos 36 cards ──────────────────────────
//
//   VERDE   → medida existe no modelo, nome bate → usa direto
//   AMARELO → medida existe, card usa com filtro PF/PJ → CALCULATE
//   VERMELHO→ chute baseado nos nomes de colunas do modelo
//             se não bater, ajustar o DAX aqui
//
// Os filtros de mês/ano (parametrizáveis) são aplicados por fora em CALCULATE.

function daxDeCard(mesNum, ano) {
  const filtroMes = `'dCalendario'[Mês numero] = ${mesNum}, 'dCalendario'[Ano] = ${ano}`;
  const comMes = (expr) => `CALCULATE(${expr}, ${filtroMes})`;

  // Segmentação descoberta via prints do painel real (filtros do visual):
  //   PF       = dContratos[ID_Filial] IN {14 filiais específicas}
  //   PJ+PME   = dContratos[ID_Filial] IN {13 filiais específicas}
  //   Isentos  = ID_Filial = 11
  // (não é por Tipo_Pessoa, como estava chutado antes)
  // Segmentação: lista dos FILTROS REAIS dos cards do painel Power BI,
  // confirmada por prints de Filtros deste visual. A tabela dFilial do BI
  // tem mapeamento diferente (inclui filial 21 em PF, exclui 39 de PJ)
  // que resulta em Base PF +447/PJ -450 — não bate com o painel.
  // Os cards específicos do relatório usam:
  //   PF:  1, 2, 3, 5, 10, 20, 22, 26, 27, 28, 29, 43, 45, 47
  //   PJ:  12, 13, 14, 16, 17, 18, 19, 21, 31, 33, 35, 37, 39
  //   Isentos: ID_Filial = 11
  const FILIAIS_PF = '{1, 2, 3, 5, 10, 20, 22, 26, 27, 28, 29, 43, 45, 47}';
  const FILIAIS_PJ = '{12, 13, 14, 16, 17, 18, 19, 21, 31, 33, 35, 37, 39}';

  // As medidas do modelo [Novos Clientes], [Novos Negócios], [Cancelamento],
  // [New Can.] JÁ EXCLUEM internamente os motivos administrativos, filiais
  // 11/15/26 e vendedores 1/107 (ver doc Thribus Tech 22/04/2026).
  // Então o sync só precisa filtrar mês + ID_Filial PF ou PJ.

  // Usa FILTER(tabela, ...) em vez de filtro de coluna direto porque as
  // medidas do modelo filtram filial_id internamente (<> 11, 15, 26) — se eu
  // usar `fVendas[filial_id] IN PF`, o CALCULATE interno sobrescreve. Com
  // FILTER crio um filtro de linha que não é sobrescrito.
  const baseContrato = (expr, filiais) =>
    `CALCULATE(${expr}, ${filtroMes}, FILTER('dContratos', 'dContratos'[ID_Filial] IN ${filiais}))`;

  const venda = (expr, filiais) =>
    `CALCULATE(${expr}, ${filtroMes}, FILTER('fVendas', 'fVendas'[filial_id] IN ${filiais}))`;

  const cancel = (expr, filiais) =>
    `CALCULATE(${expr}, ${filtroMes}, FILTER('dCancelamentos', 'dCancelamentos'[id_filial] IN ${filiais}))`;

  const cards = [
    // ─── VERDE ────────────────────────────────────────
    { card: 'Retiradas',                       dax: comMes('[Eqp. Retirados Real]') },
    { card: 'Cancelamento s/ equip. retirado', dax: comMes('[Eqp. Retirados s/equip]') },
    { card: 'OS Suporte PF',                   dax: comMes('[PF - Qtd. OS Suporte PF]') },
    { card: 'OS Suporte PJ',                   dax: comMes('[Qtd. Suporte PJ]') },
    { card: 'Valor Upgrade',                   dax: comMes('[Valor Upgrade]') },
    { card: 'Valor Downgrade',                 dax: comMes('[Valor Downgrade]') },
    { card: 'Valor Reativações',               dax: comMes('[Valor Reativacoes 30 dias]') },
    { card: 'Reativações Retiradas',           dax: comMes('[Reativados]') },
    { card: 'Ticket Médio da Venda',
      dax: `DIVIDE(CALCULATE([Novos Negócios], ${filtroMes}), CALCULATE([Novos Clientes], ${filtroMes}))` },
    { card: 'Base de Contratos',               dax: comMes('[BASE GERAL]') },
    { card: 'Novos Negócios',                  dax: comMes('[Novos Negócios]') },
    { card: 'Valor Cancelamento',              dax: comMes('[New Can.]') },
    { card: 'Receita',                         dax: comMes('[Receita]') },

    // ─── AMARELO (segmentação PF/PJ+PME via id_filial) ──
    { card: 'Base de Cliente PF',              dax: baseContrato('[BASE GERAL]', FILIAIS_PF) },
    { card: 'Base Clientes PJ +PME',           dax: baseContrato('[BASE GERAL]', FILIAIS_PJ) },
    { card: 'Novos Clientes PF',               dax: venda('[Novos Clientes]', FILIAIS_PF) },
    { card: 'Novos Clientes PJ',               dax: venda('[Novos Clientes]', FILIAIS_PJ) },
    { card: 'Cancelamento PF',                 dax: cancel('[Cancelamento]', FILIAIS_PF) },
    { card: 'Cancelam. PME + PJ',              dax: cancel('[Cancelamento]', FILIAIS_PJ) },
    { card: 'Novos Negócios PF',               dax: venda('[Novos Negócios]', FILIAIS_PF) },
    { card: 'Novos Negócios PJ',               dax: venda('[Novos Negócios]', FILIAIS_PJ) },
    { card: 'Valor Cancelamento PF',           dax: cancel('[New Can.]', FILIAIS_PF) },
    { card: 'Valor Canc. PJ + PME',            dax: cancel('[New Can.]', FILIAIS_PJ) },
    // Ticket Medio segmentado: calculamos manualmente
    // (DIVIDE([Novos Negócios], [Novos Clientes])) porque [Ticket Medio]
    // não respeita filtros externos de filial por causa dos CALCULATEs internos.
    { card: 'Ticket Médio PF',
      dax: `DIVIDE(${venda('[Novos Negócios]', FILIAIS_PF)}, ${venda('[Novos Clientes]', FILIAIS_PF)})` },
    { card: 'Ticket Médio PJ',
      dax: `DIVIDE(${venda('[Novos Negócios]', FILIAIS_PJ)}, ${venda('[Novos Clientes]', FILIAIS_PJ)})` },
    // Reajuste — vem do dataset DEDICADO "Dashboard de Reajustes" via sync-reajustes.js.
    // Este sync (Diretoria) não consulta mais reajuste — a tabela fReajustes não existe
    // aqui e [$ Valor Reajuste] não segmenta. Frontend mescla os 3 datasets.

    // ─── VERMELHO (chutes — ajustar se não bater) ─────
    // Base de Isentos — só id_filial = 11 (confirmado via print do painel)
    { card: 'Base de Isentos',
      dax: `CALCULATE([BASE GERAL], ${filtroMes}, 'dContratos'[ID_Filial] = 11)` },

    // Resultado Líquido = Receita - Cancelamento (diferença líquida de novos vs perdidos)
    { card: 'Resultado Liquido',
      dax: `CALCULATE([Diferença Nv. Negocios e Cancelalemnto], ${filtroMes})` },

    // Juros — assumindo coluna Aging_Pagamento na tabela Recebimentos
    { card: 'Juros < 45',
      dax: `CALCULATE([Juros1], ${filtroMes}, FILTER(ALL('Recebimentos'), 'Recebimentos'[dias_pagamento] <= 45))` },
    { card: 'Juros > 45',
      dax: `CALCULATE([Juros1], ${filtroMes}, FILTER(ALL('Recebimentos'), 'Recebimentos'[dias_pagamento] > 45))` },

    // QTD / Valor Canc. 1 Men. — cancelamento até 30 dias após ativação
    // (versão DATEDIFF: bate ~42 vs 41 do Power BI — próximo. Substituiu
    // versão com filtro por motivo que quebrava em R$ 269 vs R$ 6.172 do PB.
    // dCancelamentos[TempoNaBase] é STRING ("3 ano(s)...") não serve pra comparar.)
    { card: 'QTD. Canc. 1 Men.',
      dax: `CALCULATE([Cancelamento], ${filtroMes}, FILTER('dCancelamentos', DATEDIFF('dCancelamentos'[data_ativacao], 'dCancelamentos'[data_cancelamento], DAY) <= 30))` },
    { card: 'Valor Canc. 1 Men.',
      dax: `CALCULATE([New Can.], ${filtroMes}, FILTER('dCancelamentos', DATEDIFF('dCancelamentos'[data_ativacao], 'dCancelamentos'[data_cancelamento], DAY) <= 30))` },

    // Pós Pago — usa [Novos Clientes] filtrando tipo_pagamento="Pos" via FILTER
    // pra não ser sobrescrito pelos filtros internos da medida
    { card: 'Pós Pago Qtd. de Venda',
      dax: `CALCULATE([Novos Clientes], ${filtroMes}, FILTER('fVendas', 'fVendas'[tipo_pagamento] = "Pos"))` },
    { card: 'Pós Pago Novos Negocios',
      dax: `CALCULATE([Novos Negócios], ${filtroMes}, FILTER('fVendas', 'fVendas'[tipo_pagamento] = "Pos"))` },
    // Pós Pago QTD. Canc. 1 Men. — filtra pelo motivo específico de
    // cancelamento de 1a mensalidade pós-pago. DATEDIFF dava 1 vs PB 41.
    { card: 'Pós Pago QTD. Canc. 1 Men.',
      dax: `CALCULATE(DISTINCTCOUNT('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] = "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)", USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta]))` },

    // Ticket médio da Base — [Ticket Medio Base] não está publicada no
    // dataset, replica inline a fórmula documentada pelo BI:
    //   [Ticket Medio Base] = DIVIDE([Total Recebido], [BASE GERAL])
    //   [Total Recebido]    = SUMX(Recebimentos, Recebimentos[valor_pago])
    { card: 'Ticket médio da Base',
      dax: `DIVIDE(CALCULATE(SUMX('Recebimentos', 'Recebimentos'[valor_pago]), ${filtroMes}), CALCULATE([BASE GERAL], ${filtroMes}))` },
  ];

  return cards;
}

// ─── Sync ─────────────────────────────────────────────
function resolverMeses() {
  // Suporta: --mes=YYYY-MM, --mes=last:N, --meses=YYYY-MM,YYYY-MM,...,
  //         --meses=last:N, sem nada → mês corrente.
  // last:N e listas funcionam em qualquer dos dois flags (ergonomia).
  const arg = process.argv.find(a => a.startsWith('--mes=') || a.startsWith('--meses='));
  const v = arg ? arg.split('=')[1] : '';

  if (!v) {
    const d = new Date();
    return [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`];
  }
  if (v.startsWith('last:')) {
    const n = parseInt(v.split(':')[1], 10) || 1;
    const out = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
      out.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`);
    }
    return out;
  }
  const lista = v.split(',').map(s => s.trim()).filter(Boolean);
  for (const m of lista) {
    if (!/^\d{4}-\d{2}$/.test(m)) {
      throw new Error(`Mês inválido: "${m}". Use formato YYYY-MM (ex: 2026-04), uma lista vírgula-separada, ou last:N (ex: last:3).`);
    }
  }
  return lista;
}

async function rodar() {
  carregarEnv();
  const { SB_URL, SB_KEY } = process.env;
  if (!SB_URL || !SB_KEY) throw new Error('Faltam SB_URL / SB_KEY no ambiente.');

  const meses = resolverMeses();
  log(`Sync de ${meses.length} mês(es): ${meses.join(', ')}`);

  log('Autenticando no Azure AD...');
  const token = await obterToken();
  log('Token OK ✓', 'ok');

  const sb = createClient(SB_URL, SB_KEY);

  // Lê lista atual de meses fechados — não vamos sobrescrever esses
  let mesesFechados = [];
  try {
    const { data } = await sb.from('app_storage').select('value').eq('key', 'powerbi_diretoria_meses_fechados').maybeSingle();
    if (data && data.value) {
      const v = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      mesesFechados = Array.isArray(v) ? v : [];
    }
  } catch (e) { log(`Aviso lendo meses_fechados: ${e.message}`, 'warn'); }
  if (mesesFechados.length) log(`Meses fechados (não serão sobrescritos): ${mesesFechados.join(', ')}`);

  // Lista de meses disponíveis (atualizada ao final). Filtra entradas inválidas.
  let mesesDisponiveis = [];
  try {
    const { data } = await sb.from('app_storage').select('value').eq('key', 'powerbi_diretoria_meses_disponiveis').maybeSingle();
    if (data && data.value) {
      const v = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      mesesDisponiveis = (Array.isArray(v) ? v : []).filter(m => /^\d{4}-\d{2}$/.test(m));
    }
  } catch (e) { /* ignore */ }

  // Limpa rows lixo (qualquer powerbi_diretoria_<algo> que não seja YYYY-MM nem fechado)
  try {
    const { data: rows } = await sb.from('app_storage').select('key').like('key', 'powerbi_diretoria_%');
    if (rows) {
      const lixo = rows
        .map(r => r.key)
        .filter(k => {
          if (k === 'powerbi_diretoria_meses_fechados') return false;
          if (k === 'powerbi_diretoria_meses_disponiveis') return false;
          if (k.startsWith('powerbi_diretoria_fechado_')) return /^powerbi_diretoria_fechado_\d{4}-\d{2}$/.test(k) ? false : true;
          return /^powerbi_diretoria_\d{4}-\d{2}$/.test(k) ? false : true;
        });
      if (lixo.length) {
        log(`Limpando ${lixo.length} chave(s) inválida(s): ${lixo.join(', ')}`, 'warn');
        await sb.from('app_storage').delete().in('key', lixo);
      }
    }
  } catch (e) { log(`Aviso limpando lixo: ${e.message}`, 'warn'); }

  let mesMaisRecente = null;
  let valoresMaisRecente = null;

  for (const mesAno of meses) {
    if (mesesFechados.includes(mesAno)) {
      log(`Mês ${mesAno} já está FECHADO — pulando.`, 'warn');
      continue;
    }

    const [ano, mesNum] = mesAno.split('-').map(Number);
    log(`─── ${mesAno} ───`);
    const cards = daxDeCard(mesNum, ano);

    // Monta uma única query DAX com todos os cards (ROW() único)
    const cols = cards.map((c, i) => `"c${i}", ${c.dax}`).join(',\n    ');
    const daxFull = `EVALUATE ROW(\n    ${cols}\n)`;

    log(`Executando DAX com ${cards.length} medidas...`);
    let valores;
    try {
      const row = await executarDAX(token, daxFull);
      valores = {};
      cards.forEach((c, i) => {
        const val = row[`[c${i}]`];
        valores[c.card] = val === undefined ? null : val;
      });
      log(`  Batch OK ✓`, 'ok');
    } catch (err) {
      log('Batch falhou — tentando uma por uma...', 'warn');
      valores = {};
      for (const c of cards) {
        try {
          const row = await executarDAX(token, `EVALUATE ROW("v", ${c.dax})`);
          valores[c.card] = row['[v]'] ?? null;
        } catch (e) {
          valores[c.card] = null;
          log(`  ✗ ${c.card} — ${e.response?.data?.error?.code || e.message}`, 'erro');
        }
      }
    }

    const payload = {
      atualizado_em: new Date().toISOString(),
      mes_referencia: mesAno,
      valores,
    };
    // Grava por-mês (snapshot mutável até ser fechado)
    const { error: ePm } = await sb
      .from('app_storage')
      .upsert({ key: `powerbi_diretoria_${mesAno}`, value: payload }, { onConflict: 'key' });
    if (ePm) throw new Error(`Supabase ${mesAno}: ${ePm.message}`);
    log(`  Gravado em powerbi_diretoria_${mesAno} ✓`, 'ok');

    if (!mesesDisponiveis.includes(mesAno)) {
      mesesDisponiveis.push(mesAno);
    }

    mesMaisRecente = mesAno;
    valoresMaisRecente = payload;
  }

  // Compatibilidade: powerbi_diretoria sempre aponta para o mês mais recente sincronizado nesta execução
  if (valoresMaisRecente) {
    const { error } = await sb
      .from('app_storage')
      .upsert({ key: 'powerbi_diretoria', value: valoresMaisRecente }, { onConflict: 'key' });
    if (error) throw new Error(`Supabase (compat): ${error.message}`);
    log(`Atalho powerbi_diretoria → ${mesMaisRecente} ✓`, 'ok');
  }

  // Atualiza lista de meses disponíveis (ordenada)
  mesesDisponiveis.sort();
  const { error: eMd } = await sb
    .from('app_storage')
    .upsert({ key: 'powerbi_diretoria_meses_disponiveis', value: JSON.stringify(mesesDisponiveis) }, { onConflict: 'key' });
  if (eMd) log(`Aviso gravando meses_disponiveis: ${eMd.message}`, 'warn');

  log('Sync concluído 🎉', 'ok');
}

rodar().catch((e) => {
  log(`FALHOU: ${e.message}`, 'erro');
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`, 'erro');
  process.exit(1);
});
