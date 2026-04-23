#!/usr/bin/env node
// Testa variações de nome da tabela FnAReceber e colunas

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
    return { ok: false, erro: detalhe };
  }
}

async function rodar() {
  carregarEnv();
  console.log('=== Teste de nomes de tabela FnAReceber ===\n');
  const token = await obterToken();

  const nomes = [
    'FnAReceber', 'FnAreceber', 'fnAReceber', 'fnareceber',
    'FNAReceber', 'Fnareceber', 'fnaReceber', 'FNAReceber',
    'FnaReceber', 'FNReceber',
  ];

  let tabelaOK = null;
  for (const t of nomes) {
    const r = await dax(token, `EVALUATE TOPN(1, '${t}')`);
    if (r.ok) {
      console.log(`✅ Tabela '${t}' existe!`);
      console.log(`   Colunas: ${Object.keys(r.rows[0] || {}).join(', ')}`);
      tabelaOK = t;
      break;
    } else {
      console.log(`❌ '${t}' — ${String(r.erro).slice(0, 60)}`);
    }
  }

  if (!tabelaOK) {
    console.log('\n⚠️  Nenhuma variação encontrada. Testando BLANK() pra ver se alguma medida referencia:');
    // Tentativa alternativa: ver se [New Can.] tem sucesso (já confirma que FnAReceber existe interno à medida)
    const r2 = await dax(token, `EVALUATE ROW("v", [New Can.])`);
    console.log(r2.ok ? `[New Can.] existe e retorna: ${JSON.stringify(r2.rows[0])}` : `[New Can.] falhou: ${r2.erro}`);
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
