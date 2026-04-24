#!/usr/bin/env node
// v3: bate na definição real de "Cancelamento 1a Mensalidade":
//   filtro por motivo CONTAINS "PRIMEIRA MENSALIDADE" (pré + pós-pago).
// Também lista todas as medidas das tabelas de medidas encontradas no v2.

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

  console.log('=== Canc 1a Mens v3 — filtro por motivo + listar medidas ===');
  console.log(`Mês: ${ano}-${String(mes).padStart(2, '0')}`);
  console.log('Alvo: QTD=47, Valor=R$ 5.892,30\n');

  const filtroMes = `YEAR('fCancelamentos'[data_cancelamento])=${ano} && MONTH('fCancelamentos'[data_cancelamento])=${mes}`;

  // ─── 1) Filtros por motivo "PRIMEIRA MENSALIDADE" ───────────────────────
  console.log('▸ Filtros por motivo:');
  const filtrosMotivo = [
    {
      id: 'f1',
      desc: 'motivo = "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)"',
      cond: `'fCancelamentos'[motivo] = "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)"`,
    },
    {
      id: 'f2',
      desc: 'motivo = "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)"',
      cond: `'fCancelamentos'[motivo] = "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)"`,
    },
    {
      id: 'f3',
      desc: 'motivo IN (pré, pós) — união',
      cond: `'fCancelamentos'[motivo] IN {"CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)", "CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)"}`,
    },
    {
      id: 'f4',
      desc: 'motivo CONTAINS "PRIMEIRA MENSALIDADE"',
      cond: `SEARCH("PRIMEIRA MENSALIDADE", 'fCancelamentos'[motivo], 1, 0) > 0`,
    },
  ];

  for (const f of filtrosMotivo) {
    const q = `
      EVALUATE
      ROW(
        "qtd",   COUNTROWS(FILTER('fCancelamentos', ${filtroMes} && ${f.cond})),
        "sqtde", CALCULATE(SUM('fCancelamentos'[qtde]), FILTER('fCancelamentos', ${filtroMes} && ${f.cond})),
        "dcC",   CALCULATE(DISTINCTCOUNT('fCancelamentos'[id_contrato]), FILTER('fCancelamentos', ${filtroMes} && ${f.cond})),
        "vliq",  CALCULATE(SUM('fCancelamentos'[valor_liquido]), FILTER('fCancelamentos', ${filtroMes} && ${f.cond})),
        "vbru",  CALCULATE(SUM('fCancelamentos'[VALOR_BRUTO]), FILTER('fCancelamentos', ${filtroMes} && ${f.cond})),
        "vtot",  CALCULATE(SUM('fCancelamentos'[Total Cancelado]), FILTER('fCancelamentos', ${filtroMes} && ${f.cond}))
      )`;
    const r = await dax(token, ws, ds, q);
    console.log(`  ${r.ok ? '✅' : '❌'} ${f.id} ${f.desc}`);
    console.log(`     → ${r.ok ? JSON.stringify(r.rows[0]) : r.erro}`);
  }
  console.log('');

  // ─── 2) Listar medidas de todas as tabelas ──────────────────────────────
  console.log('▸ Medidas do dataset (INFO.VIEW.MEASURES):');
  const rM = await dax(token, ws, ds, `
    EVALUATE
    SELECTCOLUMNS(
      INFO.VIEW.MEASURES(),
      "Tabela", [Table],
      "Nome",   [Name],
      "Expr",   [Expression]
    )`);
  if (rM.ok) {
    const porTabela = {};
    for (const row of rM.rows) {
      const tab = row['[Tabela]'] || '(sem tabela)';
      (porTabela[tab] ||= []).push(row);
    }
    for (const tab of Object.keys(porTabela).sort()) {
      console.log(`\n  ── ${tab} (${porTabela[tab].length}) ──`);
      for (const m of porTabela[tab]) {
        const nome = m['[Nome]'];
        const expr = String(m['[Expr]'] || '').replace(/\s+/g, ' ').slice(0, 400);
        console.log(`    • [${nome}]`);
        if (expr) console.log(`        = ${expr}`);
      }
    }
  } else {
    console.log(`  ❌ ${rM.erro}`);
    // Fallback: INFO.MEASURES (sem colunas bonitinhas)
    console.log('  Tentando INFO.MEASURES fallback...');
    const rM2 = await dax(token, ws, ds, `EVALUATE INFO.MEASURES()`);
    if (rM2.ok) {
      for (const m of rM2.rows) console.log(`    ${JSON.stringify(m).slice(0, 300)}`);
    } else {
      console.log(`  ❌ (fallback): ${rM2.erro}`);
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
