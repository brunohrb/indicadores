#!/usr/bin/env node
// v2: explora mais variações — SUM(qtde), DISTINCTCOUNT, thresholds
// intermediários, filtros por razao/motivo/status, outras colunas de valor.
// Alvo Power BI abril/2026: QTD=47, Valor=R$ 5.892,30.

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

  console.log('=== Canc 1a Mensalidade v2 ===');
  console.log(`Mês: ${ano}-${String(mes).padStart(2, '0')}`);
  console.log('Alvo: QTD=47, Valor=R$ 5.892,30\n');

  // ─── 1) Amostrar valores distintos de razao/status/motivo ───────────────
  for (const col of ['razao', 'status', 'motivo']) {
    console.log(`▸ Valores distintos de [${col}] (top 20) com count:`);
    const r = await dax(token, ws, ds, `
      EVALUATE TOPN(20,
        SUMMARIZECOLUMNS('fCancelamentos'[${col}],
          "qtd", COUNTROWS('fCancelamentos')
        ),
        [qtd], DESC
      )`);
    if (r.ok) {
      for (const row of r.rows) console.log(`    ${JSON.stringify(row)}`);
    } else {
      console.log(`    ❌ ${r.erro}`);
    }
    console.log('');
  }

  // ─── 2) Distribuição de qtde ────────────────────────────────────────────
  console.log('▸ Distribuição de [qtde] (top 20):');
  const rQtde = await dax(token, ws, ds, `
    EVALUATE TOPN(20,
      SUMMARIZECOLUMNS('fCancelamentos'[qtde],
        "linhas", COUNTROWS('fCancelamentos')
      ),
      [linhas], DESC
    )`);
  if (rQtde.ok) {
    for (const row of rQtde.rows) console.log(`    ${JSON.stringify(row)}`);
  } else {
    console.log(`    ❌ ${rQtde.erro}`);
  }
  console.log('');

  // ─── 3) Totais do mês com MÉTODOS DIFERENTES de contagem ─────────────────
  const filtroMes = `YEAR('fCancelamentos'[data_cancelamento])=${ano} && MONTH('fCancelamentos'[data_cancelamento])=${mes}`;

  const metodos = [
    { id: 'm1', desc: 'COUNTROWS (total do mês, sem filtro de tempo)',
      q: `EVALUATE ROW("v", COUNTROWS(FILTER('fCancelamentos', ${filtroMes})))` },
    { id: 'm2', desc: 'SUM(qtde) do mês',
      q: `EVALUATE ROW("v", CALCULATE(SUM('fCancelamentos'[qtde]), FILTER('fCancelamentos', ${filtroMes})))` },
    { id: 'm3', desc: 'DISTINCTCOUNT(id_contrato) do mês',
      q: `EVALUATE ROW("v", CALCULATE(DISTINCTCOUNT('fCancelamentos'[id_contrato]), FILTER('fCancelamentos', ${filtroMes})))` },
    { id: 'm4', desc: 'DISTINCTCOUNT(id_cliente) do mês',
      q: `EVALUATE ROW("v", CALCULATE(DISTINCTCOUNT('fCancelamentos'[id_cliente]), FILTER('fCancelamentos', ${filtroMes})))` },
  ];
  console.log('▸ Contagens do mês (sem filtro de 1a mens):');
  for (const m of metodos) {
    const r = await dax(token, ws, ds, m.q);
    console.log(`  ${r.ok ? '✅' : '❌'} ${m.id} ${m.desc}: ${r.ok ? JSON.stringify(r.rows[0]) : r.erro}`);
  }
  console.log('');

  // ─── 4) Tentar achar 47: diferentes métodos × diferentes thresholds ─────
  const thresholds = [
    { id: 't30', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],DAY) <= 30` },
    { id: 't31', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],DAY) <= 31` },
    { id: 't35', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],DAY) <= 35` },
    { id: 't40', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],DAY) <= 40` },
    { id: 't45', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],DAY) <= 45` },
    { id: 't50', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],DAY) <= 50` },
    { id: 't55', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],DAY) <= 55` },
    { id: 'tM1', cond: `DATEDIFF('fCancelamentos'[data_ativacao],'fCancelamentos'[data_cancelamento],MONTH) <= 1` },
    { id: 'tTB1', cond: `'fCancelamentos'[Tempo na Base] <= 1` },
    { id: 'tTB30',cond: `'fCancelamentos'[Tempo na Base] <= 30` },
    { id: 'tTB45',cond: `'fCancelamentos'[Tempo na Base] <= 45` },
  ];

  console.log('▸ Buscando qtd=47 (várias métricas × thresholds):');
  const metricas = [
    { id: 'c',   formula: `COUNTROWS('fCancelamentos')` },
    { id: 'qt',  formula: `SUM('fCancelamentos'[qtde])` },
    { id: 'dc',  formula: `DISTINCTCOUNT('fCancelamentos'[id_contrato])` },
    { id: 'dcl', formula: `DISTINCTCOUNT('fCancelamentos'[id_cliente])` },
  ];

  for (const t of thresholds) {
    let linha = `  ${t.id.padEnd(6)}`;
    for (const m of metricas) {
      const q = `EVALUATE ROW("v", CALCULATE(${m.formula}, FILTER('fCancelamentos', ${filtroMes} && ${t.cond})))`;
      const r = await dax(token, ws, ds, q);
      const v = r.ok ? r.rows[0]?.['[v]'] : 'err';
      linha += ` ${m.id}=${String(v).padStart(5)}`;
    }
    console.log(linha);
  }
  console.log('  (procure uma linha com c=47 ou qt=47 ou dc=47)');
  console.log('');

  // ─── 5) Buscar VALOR=5892.3 em diferentes colunas de valor ──────────────
  const colunasValor = ['valor_liquido', 'VALOR_BRUTO', 'Total Cancelado', 'valor_unit'];
  console.log('▸ Buscando valor≈5892.3 (colunas × thresholds):');
  for (const col of colunasValor) {
    let linha = `  ${col.padEnd(18)}`;
    for (const t of ['t30', 't35', 't40', 't45', 't50', 'tM1']) {
      const cond = thresholds.find(x => x.id === t).cond;
      const q = `EVALUATE ROW("v", CALCULATE(SUM('fCancelamentos'[${col}]), FILTER('fCancelamentos', ${filtroMes} && ${cond})))`;
      const r = await dax(token, ws, ds, q);
      const v = r.ok && r.rows[0] ? Number(r.rows[0]['[v]']).toFixed(0) : 'err';
      linha += ` ${t}=${String(v).padStart(6)}`;
    }
    console.log(linha);
  }
  console.log('');

  // ─── 6) Listar tabelas do dataset (talvez tenha fRecebimentos/dParcelas) ─
  console.log('▸ Tabelas visíveis (INFO.VIEW.TABLES):');
  const rTabs = await dax(token, ws, ds, `EVALUATE INFO.VIEW.TABLES()`);
  if (rTabs.ok) {
    for (const row of rTabs.rows) {
      console.log(`    ${JSON.stringify(row)}`);
    }
  } else {
    console.log(`    ❌ ${rTabs.erro}`);
    // Fallback: tenta INFO.TABLES (API antiga)
    const rT2 = await dax(token, ws, ds, `EVALUATE INFO.TABLES()`);
    if (rT2.ok) {
      for (const row of rT2.rows) console.log(`    ${JSON.stringify(row)}`);
    } else {
      console.log(`    ❌ (INFO.TABLES também): ${rT2.erro}`);
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
