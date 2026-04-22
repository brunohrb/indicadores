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

  // Segmentação no Power BI (PF, PJ+PME, sem isentos) varia conforme
  // a tabela onde a medida vive:
  //
  //   [BASE GERAL]       → dContratos        (filtra dContratos[Tipo_Pessoa])
  //   [Novos Clientes]   → fVendas           (filtra fVendas[tipo_pessoa])
  //   [Novos Negócios]   → fVendas
  //   [Ticket Medio]     → fVendas
  //   [Cancelamento]     → dCancelamentos    (sem tipo_pessoa → TREATAS via id_contrato)
  //   [New Can.]         → dCancelamentos
  //   [$ Valor Reajuste] → fVendas (tentativa)
  //
  // Valores: Tipo_Pessoa tem "Física", "Jurídica", "E" (empresarial/PME).

  // Base em dContratos
  const baseContratoPF = (expr) =>
    `CALCULATE(${expr}, ${filtroMes}, 'dContratos'[Tipo_Pessoa] = "Física", 'dContratos'[Tipo_Cliente] <> "ISENTO")`;
  const baseContratoPJ = (expr) =>
    `CALCULATE(${expr}, ${filtroMes}, 'dContratos'[Tipo_Pessoa] IN {"Jurídica", "E"}, 'dContratos'[Tipo_Cliente] <> "ISENTO")`;

  // Venda em fVendas
  const vendaPF = (expr) =>
    `CALCULATE(${expr}, ${filtroMes}, 'fVendas'[tipo_pessoa] = "Física", 'fVendas'[tipo_cliente] <> "ISENTO")`;
  const vendaPJ = (expr) =>
    `CALCULATE(${expr}, ${filtroMes}, 'fVendas'[tipo_pessoa] IN {"Jurídica", "E"}, 'fVendas'[tipo_cliente] <> "ISENTO")`;

  // Cancelamento em dCancelamentos — sem tipo_pessoa. Usamos TREATAS pra
  // transportar o filtro de dContratos[Tipo_Pessoa] pra dCancelamentos[id_contrato].
  const cancPF = (expr) =>
    `CALCULATE(${expr}, ${filtroMes}, TREATAS(CALCULATETABLE(VALUES('dContratos'[ID_Contrato]), 'dContratos'[Tipo_Pessoa] = "Física", 'dContratos'[Tipo_Cliente] <> "ISENTO"), 'dCancelamentos'[id_contrato]))`;
  const cancPJ = (expr) =>
    `CALCULATE(${expr}, ${filtroMes}, TREATAS(CALCULATETABLE(VALUES('dContratos'[ID_Contrato]), 'dContratos'[Tipo_Pessoa] IN {"Jurídica", "E"}, 'dContratos'[Tipo_Cliente] <> "ISENTO"), 'dCancelamentos'[id_contrato]))`;

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
    { card: 'Ticket Médio da Venda',           dax: comMes('[Ticket Medio]') },
    { card: 'Base de Contratos',               dax: comMes('[BASE GERAL]') },
    { card: 'Novos Negócios',                  dax: comMes('[Novos Negócios]') },
    { card: 'Valor Cancelamento',              dax: comMes('[New Can.]') },
    { card: 'Receita',                         dax: comMes('[Receita]') },

    // ─── AMARELO (segmentação PF/PJ+PME) ──────────────
    { card: 'Base de Cliente PF',              dax: baseContratoPF('[BASE GERAL]') },
    { card: 'Base Clientes PJ +PME',           dax: baseContratoPJ('[BASE GERAL]') },
    { card: 'Novos Clientes PF',               dax: vendaPF('[Novos Clientes]') },
    { card: 'Novos Clientes PJ',               dax: vendaPJ('[Novos Clientes]') },
    { card: 'Cancelamento PF',                 dax: cancPF('[Cancelamento]') },
    { card: 'Cancelam. PME + PJ',              dax: cancPJ('[Cancelamento]') },
    { card: 'Novos Negócios PF',               dax: vendaPF('[Novos Negócios]') },
    { card: 'Novos Negócios PJ',               dax: vendaPJ('[Novos Negócios]') },
    { card: 'Valor Cancelamento PF',           dax: cancPF('[New Can.]') },
    { card: 'Valor Canc. PJ + PME',            dax: cancPJ('[New Can.]') },
    { card: 'Ticket Médio PF',                 dax: vendaPF('[Ticket Medio]') },
    { card: 'Ticket Médio PJ',                 dax: vendaPJ('[Ticket Medio]') },
    { card: 'Reajuste Contratos PF',           dax: vendaPF('[$ Valor Reajuste]') },
    { card: 'Reajuste Contratos PJ',           dax: vendaPJ('[$ Valor Reajuste]') },

    // ─── VERMELHO (chutes — ajustar se não bater) ─────
    // Base de Isentos — Tipo_Cliente "ISENTO" OU filial 11
    { card: 'Base de Isentos',
      dax: `CALCULATE([BASE GERAL], ${filtroMes}, FILTER(ALL('dContratos'), 'dContratos'[Tipo_Cliente] = "ISENTO" || 'dContratos'[ID_Filial] = 11))` },

    // Resultado Líquido = Receita - Cancelamento (diferença líquida de novos vs perdidos)
    { card: 'Resultado Liquido',
      dax: `CALCULATE([Diferença Nv. Negocios e Cancelalemnto], ${filtroMes})` },

    // Juros — assumindo coluna Aging_Pagamento na tabela Recebimentos
    { card: 'Juros < 45',
      dax: `CALCULATE([Juros1], ${filtroMes}, FILTER(ALL('Recebimentos'), 'Recebimentos'[dias_pagamento] <= 45))` },
    { card: 'Juros > 45',
      dax: `CALCULATE([Juros1], ${filtroMes}, FILTER(ALL('Recebimentos'), 'Recebimentos'[dias_pagamento] > 45))` },

    // QTD / Valor Canc. 1 Men. — cancelamento até 30 dias após ativação
    // (dCancelamentos[TempoNaBase] é string tipo "3 ano(s), ..." — não serve pra comparar)
    { card: 'QTD. Canc. 1 Men.',
      dax: `CALCULATE([Cancelamento], ${filtroMes}, FILTER(ALL('dCancelamentos'), DATEDIFF('dCancelamentos'[data_ativacao], 'dCancelamentos'[data_cancelamento], DAY) <= 30))` },
    { card: 'Valor Canc. 1 Men.',
      dax: `CALCULATE([New Can.], ${filtroMes}, FILTER(ALL('dCancelamentos'), DATEDIFF('dCancelamentos'[data_ativacao], 'dCancelamentos'[data_cancelamento], DAY) <= 30))` },

    // Pós Pago — fVendas[tipo_pagamento] = "Pos" (oposto de "Pre")
    { card: 'Pós Pago Qtd. de Venda',
      dax: `CALCULATE([Contratos Ativos], ${filtroMes}, FILTER(ALL('fVendas'), 'fVendas'[tipo_pagamento] = "Pos"))` },
    { card: 'Pós Pago Novos Negocios',
      dax: `CALCULATE([Novos Negócios], ${filtroMes}, FILTER(ALL('fVendas'), 'fVendas'[tipo_pagamento] = "Pos"))` },
    { card: 'Pós Pago QTD. Canc. 1 Men.',
      dax: `CALCULATE([Cancelamento], ${filtroMes}, FILTER(ALL('dCancelamentos'), 'dCancelamentos'[tipo_pagamento] = "Pos"), FILTER(ALL('dCancelamentos'), DATEDIFF('dCancelamentos'[data_ativacao], 'dCancelamentos'[data_cancelamento], DAY) <= 30))` },

    // Ticket médio da Base = Receita / BASE GERAL
    { card: 'Ticket médio da Base',
      dax: `DIVIDE(CALCULATE([Receita], ${filtroMes}), CALCULATE([BASE GERAL], ${filtroMes}))` },
  ];

  return cards;
}

// ─── Sync ─────────────────────────────────────────────
async function rodar() {
  carregarEnv();
  const { SB_URL, SB_KEY } = process.env;
  if (!SB_URL || !SB_KEY) throw new Error('Faltam SB_URL / SB_KEY no ambiente.');

  // Mês-alvo: último mês fechado (padrão) ou --mes YYYY-MM
  const arg = process.argv.find(a => a.startsWith('--mes='));
  let mesAno;
  if (arg) {
    mesAno = arg.split('=')[1]; // "2026-02"
  } else {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1); // mês passado (mais provável de estar fechado)
    mesAno = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  const [ano, mesNum] = mesAno.split('-').map(Number);
  log(`Sync para ${mesAno} (mês ${mesNum} / ano ${ano})`);

  log('Autenticando no Azure AD...');
  const token = await obterToken();
  log('Token OK ✓', 'ok');

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
    log(`Todas as ${cards.length} medidas resolvidas em batch ✓`, 'ok');
  } catch (err) {
    log('Batch falhou — tentando uma por uma para isolar erros...', 'warn');
    valores = {};
    for (const c of cards) {
      try {
        const row = await executarDAX(token, `EVALUATE ROW("v", ${c.dax})`);
        valores[c.card] = row['[v]'] ?? null;
        log(`  ✓ ${c.card}`, 'ok');
      } catch (e) {
        valores[c.card] = null;
        log(`  ✗ ${c.card} — ${e.response?.data?.error?.code || e.message}`, 'erro');
      }
    }
  }

  // Grava no Supabase
  log('Gravando no Supabase...');
  const sb = createClient(SB_URL, SB_KEY);
  const payload = {
    atualizado_em: new Date().toISOString(),
    mes_referencia: mesAno,
    valores,
  };
  const { error } = await sb
    .from('app_storage')
    .upsert({ key: 'powerbi_diretoria', value: payload }, { onConflict: 'key' });
  if (error) throw new Error(`Supabase: ${error.message}`);
  log('Gravado ✓', 'ok');

  // Resumo na tela
  log('─── RESUMO ───');
  for (const c of cards) {
    const v = valores[c.card];
    const fmt = v === null ? '—' : (typeof v === 'number' ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : v);
    log(`  ${c.card.padEnd(40)} ${String(fmt).padStart(16)}`);
  }
  log('Sync concluído 🎉', 'ok');
}

rodar().catch((e) => {
  log(`FALHOU: ${e.message}`, 'erro');
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`, 'erro');
  process.exit(1);
});
