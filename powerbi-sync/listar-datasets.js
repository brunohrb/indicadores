#!/usr/bin/env node
// Lista todos os datasets do workspace TEXNET — descobre o ID do
// "Dashboard de Reajustes" pra usar num sync secundário.

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

async function rodar() {
  carregarEnv();
  const { PBI_WORKSPACE_ID } = process.env;
  console.log('=== Datasets do workspace TEXNET ===\n');
  const token = await obterToken();

  try {
    const { data } = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_ID}/datasets`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
    );
    const datasets = data.value || [];
    console.log(`Total: ${datasets.length} datasets\n`);
    for (const d of datasets) {
      console.log(`▸ ${d.name}`);
      console.log(`  ID: ${d.id}`);
      console.log(`  Configurado?: ${d.isRefreshable ? 'refreshável' : 'não-refreshável'}`);
      console.log('');
    }
  } catch (e) {
    console.error(`ERRO: ${e.response?.status} ${e.response?.data?.error?.code || e.message}`);
    if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
    process.exit(1);
  }
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
