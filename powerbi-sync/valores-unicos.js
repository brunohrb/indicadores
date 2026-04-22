#!/usr/bin/env node
// =====================================================
// Power BI — Lista valores únicos das colunas-chave
// pra confirmar filtros do sync.
// Uso: node valores-unicos.js
// =====================================================

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

function log(msg) { console.log(msg); }

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

async function dax(token, query) {
  const { PBI_WORKSPACE_ID, PBI_DATASET_ID } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_ID}/datasets/${PBI_DATASET_ID}/executeQueries`;
  const { data } = await axios.post(
    url,
    { queries: [{ query }], serializerSettings: { includeNulls: true } },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return data.results?.[0]?.tables?.[0]?.rows || [];
}

async function listarValores(token, tabela, coluna) {
  log(`\n▸ '${tabela}'[${coluna}]`);
  try {
    const rows = await dax(token, `EVALUATE TOPN(30, VALUES('${tabela}'[${coluna}]))`);
    if (!rows.length) {
      log('   (sem valores)');
      return;
    }
    const key = Object.keys(rows[0])[0];
    for (const r of rows) log(`   → ${JSON.stringify(r[key])}`);
  } catch (e) {
    log(`   ERRO: ${e.response?.data?.error?.code || e.message}`);
  }
}

async function contarPor(token, tabela, coluna) {
  log(`\n▸ Contagem por '${tabela}'[${coluna}]:`);
  try {
    const rows = await dax(token,
      `EVALUATE
      SUMMARIZECOLUMNS(
        '${tabela}'[${coluna}],
        "Qtd", COUNTROWS('${tabela}')
      )`
    );
    if (!rows.length) {
      log('   (sem dados)');
      return;
    }
    const col1 = `[${coluna}]`;
    for (const r of rows) {
      log(`   ${String(r[col1] ?? 'null').padEnd(40)} ${r['[Qtd]']}`);
    }
  } catch (e) {
    log(`   ERRO: ${e.response?.data?.error?.code || e.message}`);
  }
}

async function rodar() {
  carregarEnv();
  log('=== Valores únicos das colunas-chave ===');

  const token = await obterToken();

  log('\n╔═══ SEGMENTAÇÃO PF/PJ (3 tabelas diferentes) ═══╗');
  await listarValores(token, 'dContratos', 'Tipo_Pessoa');
  await listarValores(token, 'dCancelamentos', 'tipo_cliente');
  await listarValores(token, 'dCancelamentos', 'tipo_cliente2');
  await listarValores(token, 'fVendas', 'tipo_pessoa');
  await listarValores(token, 'fVendas', 'tipo_cliente');

  log('\n╔═══ PAGAMENTO (pra Pós Pago) ═══╗');
  await listarValores(token, 'fVendas', 'tipo_pagamento');
  await listarValores(token, 'dCancelamentos', 'tipo_pagamento');
  await listarValores(token, 'fVendas', 'tipo_cobranca');

  log('\n╔═══ CONTAGEM POR SEGMENTO (pra sanity check) ═══╗');
  await contarPor(token, 'dContratos', 'Tipo_Pessoa');
  await contarPor(token, 'dCancelamentos', 'tipo_cliente');
  await contarPor(token, 'fVendas', 'tipo_pagamento');

  log('\n=== Fim ===');
}

rodar().catch(e => {
  log(`FALHOU: ${e.message}`);
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`);
  process.exit(1);
});
