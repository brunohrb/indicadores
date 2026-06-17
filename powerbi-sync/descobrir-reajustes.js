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

  // 4. Fotografar colunas de fReajustes e dCalendario Pagamento (dataset e97a6d33)
  log('--- 4. COLUNAS DAS TABELAS (dataset Dashboard de Reajustes e97a6d33) ---');
  const WS_DIRETORIA = 'e8de7e89-a44d-4c9b-aebf-ca7e658e1bdb';
  const DS = 'e97a6d33-6761-49f3-8869-3635fb107219';

  async function dump(label, dax) {
    log(`\n   === ${label} ===`);
    try {
      const url = `https://api.powerbi.com/v1.0/myorg/groups/${WS_DIRETORIA}/datasets/${DS}/executeQueries`;
      const { data } = await axios.post(
        url,
        { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 }
      );
      const rows = data.results?.[0]?.tables?.[0]?.rows || [];
      if (!rows.length) { log('      (sem linhas)'); return; }
      log(`      COLUNAS: ${Object.keys(rows[0]).join(' | ')}`);
      rows.forEach((r, i) => log(`      linha${i}: ${JSON.stringify(r)}`));
    } catch (e) {
      log(`      ERRO: ${erroDe(e)} ${JSON.stringify(e.response?.data?.error?.['pbi.error']?.details || '')}`);
    }
  }

  // 5. ACHAR O FILTRO QUE BATE 2.357,29 (PF) / 656,55 (PJ) em junho/2026
  log('\n--- 5. SOMA DE Valor_Reajustado (Pago) POR DATA DE PAGAMENTO — junho/2026 ---');
  const PF = '{1, 2, 3, 5, 10, 20, 22, 26, 27, 28, 29, 43, 45, 47}';
  const PJ = '{12, 13, 14, 16, 17, 18, 19, 21, 31, 33, 35, 37, 39}';
  function somaPorData(col, filiais) {
    return `EVALUATE ROW("v", CALCULATE(SUM('fReajustes'[Valor_Reajustado]), FILTER('fReajustes', 'fReajustes'[Status_Reajuste] = "Pago" && YEAR('fReajustes'[${col}]) = 2026 && MONTH('fReajustes'[${col}]) = 6 && 'fReajustes'[filial_id] IN ${filiais})))`;
  }
  async function testar(label, dax) {
    try {
      const url = `https://api.powerbi.com/v1.0/myorg/groups/${WS_DIRETORIA}/datasets/${DS}/executeQueries`;
      const { data } = await axios.post(url,
        { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 });
      const v = data.results?.[0]?.tables?.[0]?.rows?.[0]?.['[v]'];
      log(`   ${label}: ${v}`);
    } catch (e) { log(`   ${label}: ERRO ${erroDe(e)}`); }
  }
  log('   >>> Alvo: PF ~2357.29, PJ ~656.55 — data certa = Data_Pagamento_MINX <<<');

  // 6. Quebra por filial_id (junho-MINX-Pago) pra reconstruir o conjunto PF/PJ exato
  const filtroJunMinxPago = `'fReajustes'[Status_Reajuste] = "Pago" && YEAR('fReajustes'[Data_Pagamento_MINX]) = 2026 && MONTH('fReajustes'[Data_Pagamento_MINX]) = 6`;
  await dump('QUEBRA POR FILIAL (jun-MINX-Pago)',
    `EVALUATE SUMMARIZECOLUMNS('fReajustes'[filial_id], FILTER('fReajustes', ${filtroJunMinxPago}), "soma", SUM('fReajustes'[Valor_Reajustado]))`);

  // 7. Colunas da dCliente (pra ver se ha tipo_pessoa) + quebra por tipo do cliente
  await dump('dCliente (3 linhas)', `EVALUATE TOPN(3, 'dCliente')`);

  // 8. Total geral junho-MINX-Pago (sem split) pra referencia
  await testar('TOTAL junho (MINX, Pago, todas filiais)',
    `EVALUATE ROW("v", CALCULATE(SUM('fReajustes'[Valor_Reajustado]), FILTER('fReajustes', ${filtroJunMinxPago})))`);

  // 10. ACHAR a coluna "Tipo_Pessoa" (PF/PJ/Outros) usada pelo slicer
  log('\n--- 10. PROCURAR coluna Tipo_Pessoa (PF/PJ/Outros) ---');
  // (a) listar todas as colunas que contenham "tipo" no nome
  await dump('Colunas com "tipo" (INFO.VIEW.COLUMNS)',
    `EVALUATE FILTER(INFO.VIEW.COLUMNS(), SEARCH("tipo", [Column], 1, 0) > 0)`);
  // (b) listar todas as tabelas do modelo
  await dump('Tabelas do modelo (INFO.VIEW.TABLES)',
    `EVALUATE SELECTCOLUMNS(INFO.VIEW.TABLES(), "Tabela", [Name])`);

  // 11. Tentar quebra por Tipo_Pessoa em tabelas candidatas (jun-MINX-Pago)
  log('\n--- 11. QUEBRA POR Tipo_Pessoa EM TABELAS CANDIDATAS ---');
  const candCols = [
    "'fReajustes'[Tipo_Pessoa]",
    "'dCliente'[Tipo_Pessoa]",
    "'dCliente_contrato'[Tipo_Pessoa]",
    "'dContratos'[Tipo_Pessoa]",
    "'dFilial'[Tipo_Pessoa]",
  ];
  for (const col of candCols) {
    await dump(`por ${col}`,
      `EVALUATE SUMMARIZECOLUMNS(${col}, FILTER('fReajustes', ${filtroJunMinxPago}), "soma", SUM('fReajustes'[Valor_Reajustado]))`);
  }

  log('\n========================================');
  log('  FIM');
  log('========================================');
}

rodar().catch(e => { log(`FALHOU: ${e.message}`); process.exit(1); });
