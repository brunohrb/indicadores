#!/usr/bin/env node
// =====================================================
// DESCOBERTA — Dataset correto do relatório de Reajustes
// Usa as credenciais do service principal pra:
//  1. Listar todos os workspaces que o app acessa
//  2. Pegar o datasetId do relatório "Dashboard de Reajustes"
//  3. Listar datasets dos workspaces candidatos
//  4. Testar se [Valor Recebido Total] existe no dataset do relatório
// Script TEMPORÁRIO de diagnóstico — pode ser apagado depois.
// =====================================================

const axios = require('axios');

// Relatório que mostra os cards 2.357,29 / 656,55 (URL passada pelo usuário)
const REPORT_WORKSPACE = '336675a7-6eed-4857-9a5e-7472c77092e1';
const REPORT_ID = '23479955-6cab-42ac-9dc3-a37b723a0296';
// Workspaces candidatos pra listar datasets
const WORKSPACES = [
  ['336675a7 (do relatório)', '336675a7-6eed-4857-9a5e-7472c77092e1'],
  ['e8de7e89 (sync atual)', 'e8de7e89-a44d-4c9b-aebf-ca7e658e1bdb'],
];

function log(msg) { console.log(msg); }
function erroDe(e) {
  return e.response?.data?.error?.code
    || e.response?.data?.error?.['pbi.error']?.code
    || `HTTP ${e.response?.status || '?'}: ${e.message}`;
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

async function get(token, url) {
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }, timeout: 30000,
  });
  return data;
}

async function executeQuery(token, group, dataset, dax) {
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${group}/datasets/${dataset}/executeQueries`;
  const { data } = await axios.post(
    url,
    { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
}

async function rodar() {
  log('========================================');
  log('  DESCOBERTA — Dataset de Reajustes');
  log('========================================\n');

  const token = await obterToken();
  log('✓ Autenticado\n');

  // 1. Workspaces que o app acessa
  log('--- 1. WORKSPACES QUE O APP ACESSA ---');
  try {
    const grupos = await get(token, 'https://api.powerbi.com/v1.0/myorg/groups');
    (grupos.value || []).forEach(g => log(`   ${g.id}  ${g.name}`));
    if (!grupos.value?.length) log('   (nenhum)');
  } catch (e) { log(`   ERRO: ${erroDe(e)}`); }
  log('');

  // 2. Dataset do relatório
  log('--- 2. DATASET DO RELATÓRIO "Dashboard de Reajustes" ---');
  let datasetDoRelatorio = null;
  try {
    const rep = await get(token, `https://api.powerbi.com/v1.0/myorg/groups/${REPORT_WORKSPACE}/reports/${REPORT_ID}`);
    datasetDoRelatorio = rep.datasetId;
    log(`   Relatório: ${rep.name}`);
    log(`   >>> datasetId = ${rep.datasetId}  <<<`);
  } catch (e) { log(`   ERRO ao ler o relatório: ${erroDe(e)}`); }
  log('');

  // 3. Datasets dos workspaces candidatos
  log('--- 3. DATASETS DOS WORKSPACES CANDIDATOS ---');
  for (const [rotulo, ws] of WORKSPACES) {
    log(`   Workspace ${rotulo}:`);
    try {
      const ds = await get(token, `https://api.powerbi.com/v1.0/myorg/groups/${ws}/datasets`);
      (ds.value || []).forEach(d => log(`      ${d.id}  ${d.name}`));
      if (!ds.value?.length) log('      (nenhum)');
    } catch (e) { log(`      ERRO: ${erroDe(e)}`); }
  }
  log('');

  // 4. Testar a medida nos datasets candidatos do workspace Diretoria
  log('--- 4. TESTE DA MEDIDA NOS DATASETS CANDIDATOS (workspace Diretoria) ---');
  const WS_DIRETORIA = 'e8de7e89-a44d-4c9b-aebf-ca7e658e1bdb';
  const CANDIDATOS = [
    ['Analitico Recebidos Reajuste', '5a5d3b72-bed6-4470-831d-5c5846b71c95'],
    ['Dashboard de Reajustes (1)', '3698b253-6488-4109-b0b3-5864021456f3'],
    ['Analitico Reajuste', '378db1da-0dd4-4d46-ab69-4739a8c1c140'],
    ['Dashboard de Reajustes', 'e97a6d33-6761-49f3-8869-3635fb107219'],
  ];
  const FILIAIS_PF = '{1, 2, 3, 5, 10, 20, 22, 26, 27, 28, 29, 43, 45, 47}';
  for (const [nome, ds] of CANDIDATOS) {
    log(`\n   === ${nome}  (${ds}) ===`);
    const testes = [
      ['[Valor Recebido Total] (existe? totalzão)',
        `EVALUATE ROW("v", [Valor Recebido Total])`],
      ['Valor Recebido Total — junho (dCalendario Pagamento)',
        `EVALUATE ROW("v", CALCULATE([Valor Recebido Total], 'dCalendario Pagamento'[Ano Pgto] = 2026, 'dCalendario Pagamento'[NumeroMes Pgto] = 6))`],
      ['Valor Recebido Total — junho + PF (filial)',
        `EVALUATE ROW("v", CALCULATE([Valor Recebido Total], 'dCalendario Pagamento'[Ano Pgto] = 2026, 'dCalendario Pagamento'[NumeroMes Pgto] = 6, FILTER('fReajustes', 'fReajustes'[filial_id] IN ${FILIAIS_PF})))`],
    ];
    for (const [t, dax] of testes) {
      try {
        const row = await executeQuery(token, WS_DIRETORIA, ds, dax);
        log(`      ✓ ${t}: ${row['[v]']}`);
      } catch (e) {
        log(`      ✗ ${t}: ${erroDe(e)}`);
      }
    }
  }
  log('\n========================================');
  log('  FIM');
  log('========================================');
}

rodar().catch(e => { log(`FALHOU: ${e.message}`); process.exit(1); });
