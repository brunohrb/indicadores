#!/usr/bin/env node
// v4: invoca direto as medidas encontradas no v3. Espera-se que
// [Cancelamento 1a Mensalidade] dê qtd=47 no mês de abril/2026.
// Também tenta extrair as expressões DAX via INFO.MEASURES (sem VIEW).

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

  console.log('=== Canc 1a Mens v4 — invocar medidas direto ===');
  console.log(`Mês: ${ano}-${String(mes).padStart(2, '0')}\n`);

  // ─── 1) Medidas de cancelamento: invocar sem filtro e com filtro de mês ─
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
  ];

  console.log('▸ Medidas SEM filtro (total histórico):');
  for (const m of medidas) {
    const r = await dax(token, ws, ds, `EVALUATE ROW("v", [${m}])`);
    const v = r.ok ? r.rows[0]?.['[v]'] : r.erro;
    console.log(`  ${r.ok ? '✅' : '❌'} [${m}] = ${JSON.stringify(v)}`);
  }

  console.log(`\n▸ Medidas COM filtro de mês ${ano}-${String(mes).padStart(2, '0')} via CALCULATE + dCalendario:`);
  for (const m of medidas) {
    const q = `
      EVALUATE
      ROW("v",
        CALCULATE(
          [${m}],
          FILTER(ALL('dCalendario'),
            YEAR('dCalendario'[Data]) = ${ano} &&
            MONTH('dCalendario'[Data]) = ${mes}
          )
        )
      )`;
    const r = await dax(token, ws, ds, q);
    const v = r.ok ? r.rows[0]?.['[v]'] : r.erro;
    console.log(`  ${r.ok ? '✅' : '❌'} [${m}] (mês) = ${JSON.stringify(v)}`);
  }

  // ─── 2) Tentar expressões via INFO.MEASURES (API mais crua) ────────────
  console.log('\n▸ INFO.MEASURES — expressões DAX:');
  const rM = await dax(token, ws, ds, `EVALUATE INFO.MEASURES()`);
  if (rM.ok) {
    for (const row of rM.rows) {
      const nome = row['[Name]'];
      const expr = row['[Expression]'];
      if (!nome) continue;
      if (medidas.includes(nome) || String(nome).toLowerCase().includes('cancelamento') || String(nome).toLowerCase().includes('mensalidade')) {
        const exprShort = String(expr || '').replace(/\s+/g, ' ').slice(0, 600);
        console.log(`  • [${nome}]`);
        console.log(`      = ${exprShort}`);
      }
    }
  } else {
    console.log(`  ❌ ${rM.erro}`);
  }

  // ─── 3) Também pegar colunas de dCalendario pra validar nome ────────────
  console.log('\n▸ Colunas de dCalendario (pra validar nome "Data" usado no CALCULATE):');
  const rC = await dax(token, ws, ds, `EVALUATE TOPN(1, 'dCalendario')`);
  if (rC.ok && rC.rows[0]) {
    for (const k of Object.keys(rC.rows[0])) console.log(`    ${k}`);
  } else {
    console.log(`    ❌ ${rC.erro || '(sem linhas)'}`);
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
