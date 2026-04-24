#!/usr/bin/env node
// Lista TODOS os workspaces (groups) que o service principal enxerga,
// e pra cada um lista os datasets. Objetivo: achar o workspace + ID do
// dataset "Comercial PF" (que não está no workspace TEXNET atual).

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

async function listarWorkspaces(token) {
  const { data } = await axios.get(
    'https://api.powerbi.com/v1.0/myorg/groups',
    { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
  );
  return data.value || [];
}

async function listarDatasets(token, workspaceId) {
  try {
    const { data } = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
    );
    return { ok: true, datasets: data.value || [] };
  } catch (e) {
    return {
      ok: false,
      erro: e.response?.data?.error?.code || e.response?.status || e.message,
    };
  }
}

async function rodar() {
  carregarEnv();
  console.log('=== Workspaces + datasets visíveis pro service principal ===\n');
  const token = await obterToken();

  const workspaces = await listarWorkspaces(token);
  console.log(`Total de workspaces: ${workspaces.length}\n`);

  let encontrouComercial = false;
  for (const ws of workspaces) {
    console.log(`\n╔══ Workspace: ${ws.name}`);
    console.log(`   ID: ${ws.id}`);
    const r = await listarDatasets(token, ws.id);
    if (!r.ok) {
      console.log(`  ❌ Erro listando datasets: ${r.erro}`);
      continue;
    }
    if (r.datasets.length === 0) {
      console.log('  (sem datasets)');
      continue;
    }
    for (const d of r.datasets) {
      const marca = /comercial/i.test(d.name) ? ' 🎯' : '';
      console.log(`  ▸ ${d.name}${marca}`);
      console.log(`    Dataset ID: ${d.id}`);
      if (/comercial/i.test(d.name)) encontrouComercial = true;
    }
  }

  console.log('\n=== Fim ===');
  if (!encontrouComercial) {
    console.log('\n⚠  Nenhum dataset com "comercial" no nome foi encontrado.');
    console.log('   → Peça pro time do BI conceder acesso de leitura ao service principal');
    console.log('     750dc66f-367e-4461-9a69-3dd216f0b69d no dataset "Comercial PF".');
  } else {
    console.log('\n✅ Dataset com "comercial" encontrado — copia o Dataset ID acima.');
  }
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.response?.status || ''} ${e.response?.data?.error?.code || e.message}`);
  if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
  process.exit(1);
});
