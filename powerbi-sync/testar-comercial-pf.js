#!/usr/bin/env node
// Testa o acesso ao dataset "Comercial PF" + sanity check da tabela
// fCancelamentos (contagem total, esquema básico, agregação por mês).
// Workspace ID e Dataset ID vêm de env vars — são passados no workflow.

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
    return { ok: false, erro: detalhe };
  }
}

async function rodar() {
  carregarEnv();
  const { PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL } = process.env;
  if (!PBI_WORKSPACE_COMERCIAL || !PBI_DATASET_COMERCIAL) {
    console.error('⚠  Faltando PBI_WORKSPACE_COMERCIAL e/ou PBI_DATASET_COMERCIAL.');
    console.error('   Passa eles como inputs no workflow ou como env vars.');
    process.exit(1);
  }
  console.log('=== Testando dataset Comercial PF ===\n');
  console.log(`Workspace: ${PBI_WORKSPACE_COMERCIAL}`);
  console.log(`Dataset:   ${PBI_DATASET_COMERCIAL}\n`);

  const token = await obterToken();

  // 1) Acesso básico: conta de fCancelamentos
  console.log('▸ Contagem total de fCancelamentos:');
  const r1 = await dax(token, PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL,
    `EVALUATE ROW("total", COUNTROWS('fCancelamentos'))`);
  if (r1.ok) {
    console.log(`  ✅ ${JSON.stringify(r1.rows[0])}`);
  } else {
    console.log(`  ❌ ${r1.erro}`);
    console.log('\n=> Se for "PowerBINotAuthorizedException": pedir acesso de leitura pro');
    console.log(`   service principal 750dc66f-367e-4461-9a69-3dd216f0b69d.`);
    process.exit(1);
  }

  // 2) Schema: primeira linha (mostra as colunas)
  console.log('\n▸ Schema (primeira linha, pra ver colunas disponíveis):');
  const r2 = await dax(token, PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL,
    `EVALUATE TOPN(1, 'fCancelamentos')`);
  if (r2.ok && r2.rows[0]) {
    for (const k of Object.keys(r2.rows[0])) {
      console.log(`    ${k}`);
    }
  } else {
    console.log(`  ❌ ${r2.erro || '(sem linhas)'}`);
  }

  // 3) Tenta agregação por mês (assume coluna data_cancelamento ou similar)
  console.log('\n▸ Por mês (tenta várias colunas de data):');
  const candidatosData = ['data_cancelamento', 'Data Cancelamento', 'DataCancelamento', 'data', 'Data'];
  for (const col of candidatosData) {
    const q = `
      EVALUATE
      TOPN(3,
        SUMMARIZECOLUMNS(
          'fCancelamentos'[${col}],
          "qtd", COUNTROWS('fCancelamentos')
        ),
        'fCancelamentos'[${col}], DESC
      )`;
    const r = await dax(token, PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL, q);
    if (r.ok) {
      console.log(`  ✅ Coluna '${col}' existe. Últimas 3 datas:`);
      for (const row of r.rows) console.log(`     ${JSON.stringify(row)}`);
      break;
    }
  }

  // 4) Testa medidas de cancelamento 1ª mensalidade
  console.log('\n▸ Medidas [Cancelamento 1a Mensalidade Qtd/Valor]:');
  for (const m of ['Cancelamento 1a Mensalidade Qtd', 'Cancelamento 1a Mensalidade Valor']) {
    const r = await dax(token, PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL,
      `EVALUATE ROW("v", [${m}])`);
    if (r.ok) {
      console.log(`  ✅ [${m}] = ${JSON.stringify(r.rows[0])}`);
    } else {
      console.log(`  ❌ [${m}] → ${String(r.erro).slice(0, 100)}`);
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
