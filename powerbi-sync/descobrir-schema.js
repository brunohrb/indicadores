#!/usr/bin/env node
// =====================================================
// Power BI — Descobre schema (colunas + valores únicos)
// Uso: node descobrir-schema.js [tabela]   (padrão: dContratos)
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

const cor = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', erro: '\x1b[31m', reset: '\x1b[0m' };
function log(msg, tipo = 'info') {
  console.log(`${cor[tipo] || ''}${msg}${cor.reset}`);
}

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

async function rodar() {
  carregarEnv();
  const tabela = process.argv[2] || 'dContratos';

  log(`\n=== Descoberta de schema: '${tabela}' ===\n`, 'info');
  const token = await obterToken();

  // 1. Pega 3 linhas de amostra — revela nomes de coluna + tipo de valor
  log('→ Amostra de 3 linhas:', 'info');
  try {
    const rows = await dax(token, `EVALUATE TOPN(3, '${tabela}')`);
    if (!rows.length) {
      log('   (tabela vazia ou sem acesso)', 'warn');
    } else {
      const cols = Object.keys(rows[0]);
      log(`   Colunas (${cols.length}):`, 'ok');
      for (const c of cols) log(`     • ${c}`);
      log('\n   Primeira linha (valores):');
      for (const c of cols) {
        const v = rows[0][c];
        log(`     ${c.padEnd(45)} ${JSON.stringify(v)}`);
      }
    }
  } catch (e) {
    log(`   ERRO: ${e.response?.data?.error?.code || e.message}`, 'erro');
    if (e.response?.data) log(`   Detalhe: ${JSON.stringify(e.response.data).slice(0, 300)}`, 'erro');
  }

  // 2. Descobre colunas candidatas a "tipo pessoa" e mostra valores únicos
  log('\n→ Procurando colunas que parecem PF/PJ:', 'info');
  const rows = await dax(token, `EVALUATE TOPN(1, '${tabela}')`).catch(() => []);
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const candidatas = cols.filter(c =>
    /pessoa|tipo|pf|pj|segmento|categoria/i.test(c)
  );

  if (!candidatas.length) {
    log('   Nenhuma coluna com nome óbvio encontrada.', 'warn');
    log('   Revise a lista acima e rode: node descobrir-schema.js ' + tabela);
  }

  for (const cRaw of candidatas) {
    const c = cRaw.replace(/^\[|\]$/g, '').replace(new RegExp(`^${tabela}\\[|\\]$`, 'g'), '');
    log(`\n   Coluna: ${cRaw}`, 'ok');
    try {
      const valores = await dax(
        token,
        `EVALUATE TOPN(20, VALUES('${tabela}'[${c}]))`
      );
      if (!valores.length) {
        log('     (sem valores)', 'warn');
        continue;
      }
      const key = Object.keys(valores[0])[0];
      for (const v of valores) log(`     → ${JSON.stringify(v[key])}`);
    } catch (e) {
      log(`     ERRO ao listar valores: ${e.response?.data?.error?.code || e.message}`, 'erro');
    }
  }

  log('\n=== Fim ===\n', 'info');
}

rodar().catch(e => {
  log(`FALHOU: ${e.message}`, 'erro');
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`, 'erro');
  process.exit(1);
});
