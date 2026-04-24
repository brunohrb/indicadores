#!/usr/bin/env node
// v5: corrige o filtro de mês (coluna de data se chama [Calendario],
// e há também [Ano] e [Mês numero] na dCalendario). Testa duas formas
// de filtrar, espera-se que [Cancelamento 1a Mensalidade] dê 47 em abril/2026.

const fs = require('fs');
const path = require('path');
const axios = require('axios');

function carregarEnv() {
  if (process.env.PBI_CLIENT_SECRET) return;
  const caminho = path.join(__dirname, '.env.local');
  if (!fs.existsSync(caminho)) return;
  for (const linha of fs.readFileSync(caminho, 'utf8').split('\n')) {
    const m = linha.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

async function obterToken() {
  const { PBI_TENANT_ID, PBI_CLIENT_ID, PBI_CLIENT_SECRET } = process.env;
  const url = `https://login.microsoftonline.com/${PBI_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: PBI_CLIENT_ID, client_secret: PBI_CLIENT_SECRET,
    scope: 'https://analysis.windows.net/powerbi/api/.default',
    grant_type: 'client_credentials',
  });
  const { data } = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000,
  });
  return data.access_token;
}

async function dax(token, workspaceId, datasetId, query) {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/executeQueries`;
  try {
    const { data } = await axios.post(
      url,
      { queries: [{ query }], serializerSettings: { includeNulls: true } },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    return { ok: true, rows: data.results?.[0]?.tables?.[0]?.rows || [] };
  } catch (e) {
    const detalhe = e.response?.data?.error?.['pbi.error']?.details?.[0]?.detail?.value
      || e.response?.data?.error?.message
      || e.response?.data?.error?.code
      || e.message;
    return { ok: false, erro: String(detalhe).slice(0, 200) };
  }
}

async function rodar() {
  carregarEnv();
  const { PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL } = process.env;
  if (!PBI_WORKSPACE_COMERCIAL || !PBI_DATASET_COMERCIAL) {
    console.error('⚠  Faltando env.'); process.exit(1);
  }
  const hoje = new Date();
  const ano = hoje.getUTCFullYear();
  const mes = hoje.getUTCMonth() + 1;
  const ws = PBI_WORKSPACE_COMERCIAL;
  const ds = PBI_DATASET_COMERCIAL;
  const token = await obterToken();

  console.log('=== Canc 1a Mens v5 — filtro de mês corrigido ===');
  console.log(`Mês alvo: ${ano}-${String(mes).padStart(2, '0')}`);
  console.log('Alvo Power BI: QTD=47, Valor=R$ 5.892,30\n');

  const medidas = [
    'Cancelamento 1a Mensalidade',
    'Cancelamento 1a Mensalidade White',
    'Cancelamento',
    'Valor Cancelamento (Antigo)',
    'Valor Cancelamento Novo',
    'Cancelamento s/ Filtro',
    '% Churn',
    'Contratos Ativos',
    'BASE GERAL',
    'Novos Negócios',
    'Novos Clientes',
    'Base PF',
    'Base PJ',
    'Isentos',
    'Base Dual Net',
    'Base Planet',
    'Permuta',
  ];

  // Filtro via [Ano] + [Mês numero] (ambas existem)
  const filtroAnoMes = (m) => `
    EVALUATE
    ROW("v",
      CALCULATE(
        [${m}],
        'dCalendario'[Ano] = ${ano},
        'dCalendario'[Mês numero] = ${mes}
      )
    )`;

  // Filtro via [Calendario] com YEAR/MONTH
  const filtroCalendario = (m) => `
    EVALUATE
    ROW("v",
      CALCULATE(
        [${m}],
        FILTER(ALL('dCalendario'),
          YEAR('dCalendario'[Calendario]) = ${ano} &&
          MONTH('dCalendario'[Calendario]) = ${mes}
        )
      )
    )`;

  console.log(`▸ Medidas no mês ${ano}-${String(mes).padStart(2, '0')} [filtro via Ano+Mês numero]:`);
  for (const m of medidas) {
    const r = await dax(token, ws, ds, filtroAnoMes(m));
    const v = r.ok ? r.rows[0]?.['[v]'] : (r.erro || 'err').slice(0, 100);
    console.log(`  ${r.ok ? '✅' : '❌'} [${m}] = ${JSON.stringify(v)}`);
  }

  console.log(`\n▸ Medidas no mês ${ano}-${String(mes).padStart(2, '0')} [filtro via YEAR/MONTH(Calendario)]:`);
  for (const m of medidas) {
    const r = await dax(token, ws, ds, filtroCalendario(m));
    const v = r.ok ? r.rows[0]?.['[v]'] : (r.erro || 'err').slice(0, 100);
    console.log(`  ${r.ok ? '✅' : '❌'} [${m}] = ${JSON.stringify(v)}`);
  }

  // Valor: procurar qual medida dá R$ 5.892,30 no mês
  console.log('\n▸ Procurando medida de valor pra 1a mensalidade (R$ 5.892,30):');
  const medidasValor = [
    'Valor Cancelamento (Antigo)',
    'Valor Cancelamento Novo',
    'Valor Cancelamento 1a Mensalidade',
    'Valor 1a Mensalidade',
    'Valor Canc. 1 Men.',
    'Cancelamento 1a Mensalidade Valor',
  ];
  for (const m of medidasValor) {
    const r = await dax(token, ws, ds, filtroAnoMes(m));
    const v = r.ok ? r.rows[0]?.['[v]'] : (r.erro || 'err').slice(0, 80);
    console.log(`  ${r.ok ? '✅' : '❌'} [${m}] = ${JSON.stringify(v)}`);
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
