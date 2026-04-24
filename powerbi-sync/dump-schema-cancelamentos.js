#!/usr/bin/env node
// Dump do schema real da dCancelamentos: puxa 1 linha inteira e mostra
// nome de cada coluna + tipo + valor de exemplo. Assim a gente sabe
// qual coluna numérica serve pro Valor Canc. 1 Men.
//
// Também tenta nomes alternativos da tabela (caso fCancelamentos exista
// com outro alias).

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
  const token = await obterToken();

  // ─── PARTE 1: dump de 1 linha de cada tabela candidata ───
  console.log('=== Schema dCancelamentos (+ aliases) ===\n');

  const tabelas = [
    'dCancelamentos',
    'fCancelamentos',
    'Cancelamentos',
    'tbCancelamentos',
    'Cancelamento',
  ];

  for (const t of tabelas) {
    console.log(`\n── Tabela: '${t}' ──`);
    const r = await dax(token, `EVALUATE TOPN(1, '${t}')`);
    if (!r.ok) {
      console.log(`  ❌ ${String(r.erro).slice(0, 100)}`);
      continue;
    }
    const row = r.rows[0] || {};
    const colunas = Object.keys(row).sort();
    console.log(`  ✅ ${colunas.length} colunas:`);
    for (const col of colunas) {
      const v = row[col];
      const tipo = typeof v;
      const amostra = v === null ? 'null' : (typeof v === 'string' ? `"${v.slice(0, 40)}"` : String(v));
      console.log(`     ${col.padEnd(45)} [${tipo.padEnd(7)}] → ${amostra}`);
    }
  }

  // ─── PARTE 2: sample de 3 linhas do motivo "PRIMEIRA MENSALIDADE" ───
  console.log('\n\n=== Sample de 3 linhas Canc. 1 Men. (abril/2026) ===\n');
  const motivos = `"CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE PJ"`;

  const q = `EVALUATE TOPN(3, FILTER('dCancelamentos',
    'dCancelamentos'[motivo] IN {${motivos}}
    && YEAR('dCancelamentos'[Data de Cancelamento Correta]) = 2026
    && MONTH('dCancelamentos'[Data de Cancelamento Correta]) = 4
  ))`;
  const r = await dax(token, q);
  if (r.ok) {
    console.log(`  ${r.rows.length} linhas retornadas\n`);
    for (let i = 0; i < r.rows.length; i++) {
      console.log(`  ── linha ${i+1} ──`);
      const row = r.rows[i];
      for (const col of Object.keys(row).sort()) {
        const v = row[col];
        const amostra = v === null ? 'null' : (typeof v === 'string' ? `"${String(v).slice(0, 60)}"` : String(v));
        console.log(`     ${col.padEnd(45)} → ${amostra}`);
      }
      console.log();
    }
  } else {
    console.log(`  ❌ ${r.erro}`);
  }

  // ─── PARTE 3: testar colunas numéricas candidatas ───
  console.log('\n=== Testa SUM de cada coluna numérica candidata ===');
  console.log('(com filtro motivos + abril/2026 via USERELATIONSHIP)\n');

  const filtroMes = `'dCalendario'[Mês numero] = 4, 'dCalendario'[Ano] = 2026`;
  const candidatas = [
    'valor', 'Valor', 'VALOR',
    'valor_liquido', 'Valor_Liquido', 'valor liquido',
    'valor_bruto', 'Valor_Bruto', 'VALOR_BRUTO',
    'valor_cancelamento', 'Valor_Cancelamento',
    'total_cancelado', 'Total_Cancelado',
    'valor_unit', 'valor_contrato', 'valor_plano',
    'vlr_liquido', 'vlr_bruto', 'vlr_total',
    'ACRESCIMO', 'DESCONTO',
    'qtde',
  ];

  for (const c of candidatas) {
    const query = `EVALUATE ROW("v", CALCULATE(SUM('dCancelamentos'[${c}]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])))`;
    const r = await dax(token, query);
    if (r.ok) {
      const v = r.rows[0]?.['[v]'];
      const str = typeof v === 'number' ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : JSON.stringify(v);
      const delta = typeof v === 'number' ? Math.abs(v - 5892.30) : Infinity;
      const marca = delta < 1 ? ' 🎯 BATEU!' : (delta < 200 ? ' 🔥 perto' : '');
      console.log(`  ✅ ${c.padEnd(25)} → ${String(str).padStart(16)}${marca}`);
    } else {
      console.log(`  ❌ ${c.padEnd(25)} → ${String(r.erro).slice(0, 80)}`);
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
