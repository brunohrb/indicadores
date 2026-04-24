#!/usr/bin/env node
// Dump das colunas de fVendas, FnAReceber e Recebimentos, e procura
// qual coluna numérica somada pros 47 ids Canc. 1 Men. de abril bate R$ 5.892,30.

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

const ALVO = 5892.30;
const filtroMes = `'dCalendario'[Mês numero] = 4, 'dCalendario'[Ano] = 2026`;
const motivos = `"CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE PJ"`;

// CALCULATETABLE dos 47 ids (mesma lógica da QTD que bate 47=47)
const subqueryIds = `CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]),
  ${filtroMes},
  'dCancelamentos'[motivo] IN {${motivos}},
  USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta]))`;

async function dumpSchema(token, tabela) {
  console.log(`\n── '${tabela}' ──`);
  const r = await dax(token, `EVALUATE TOPN(1, '${tabela}')`);
  if (!r.ok) { console.log(`  ❌ ${String(r.erro).slice(0, 100)}`); return []; }
  const row = r.rows[0] || {};
  const cols = Object.keys(row).sort();
  console.log(`  ✅ ${cols.length} colunas:`);
  const numericas = [];
  for (const col of cols) {
    const v = row[col];
    const t = typeof v;
    const amostra = v === null ? 'null' : (typeof v === 'string' ? `"${v.slice(0, 40)}"` : String(v));
    console.log(`     ${col.padEnd(50)} [${t.padEnd(7)}] → ${amostra}`);
    if (t === 'number' && !col.toLowerCase().includes('id')) {
      // extrai nome da coluna do formato "fVendas[col]"
      const m = col.match(/\[([^\]]+)\]/);
      if (m) numericas.push(m[1]);
    }
  }
  return numericas;
}

async function testarSum(token, tabela, col, idCol) {
  // Soma coluna filtrando pelos 47 id_contrato via TREATAS
  const q = `EVALUATE ROW("v", CALCULATE(
    SUM('${tabela}'[${col}]),
    TREATAS(${subqueryIds}, '${tabela}'[${idCol}])
  ))`;
  const r = await dax(token, q);
  if (!r.ok) return { ok: false, erro: String(r.erro).slice(0, 70) };
  const v = r.rows[0]?.['[v]'];
  return { ok: true, valor: v };
}

async function rodar() {
  carregarEnv();
  const token = await obterToken();

  console.log('=== Schema tabelas de valor ===');
  const schemas = {};
  for (const t of ['fVendas', 'FnAReceber', 'fFn_Areceber', 'Recebimentos', 'fContratos', 'dContratos']) {
    schemas[t] = await dumpSchema(token, t);
  }

  // Lista tabelas/colunas numéricas candidatas
  const candidatos = [];
  for (const [t, cols] of Object.entries(schemas)) {
    for (const c of cols) {
      // Ignora colunas obviamente não-valor
      if (/qtd|quant|dia|mes|ano|parcela|numero|num_|count|_id|idade/i.test(c)) continue;
      candidatos.push({ tabela: t, col: c });
    }
  }

  console.log(`\n=== SOMA de cada candidata pros 47 ids (alvo R$ 5.892,30) ===\n`);
  console.log(`${candidatos.length} candidatas\n`);

  // Pra cada candidata, tenta com id_contrato (nome mais comum)
  const idCols = ['id_contrato', 'ID_Contrato', 'ID_CONTRATO', 'contrato_id'];

  const resultados = [];
  for (const cand of candidatos) {
    let deu = false;
    for (const idCol of idCols) {
      const r = await testarSum(token, cand.tabela, cand.col, idCol);
      if (r.ok) {
        const v = typeof r.valor === 'number' ? r.valor : 0;
        const delta = Math.abs(v - ALVO);
        const marca = delta < 1 ? ' 🎯 BATEU!' : (delta < 200 ? ' 🔥 perto' : (delta < 1000 ? ' ~' : ''));
        resultados.push({ ...cand, idCol, valor: v, delta });
        const str = v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        console.log(`  ${marca.includes('BATEU') ? '🎯' : '  '} ${cand.tabela}.${cand.col} (${idCol}) = R$ ${str.padStart(15)}${marca}`);
        deu = true;
        break;
      }
    }
    if (!deu) {
      console.log(`  ❌ ${cand.tabela}.${cand.col}: nenhum id_contrato funcionou`);
    }
  }

  console.log(`\n=== Top 5 mais próximos de R$ 5.892,30 ===`);
  resultados.sort((a, b) => a.delta - b.delta);
  for (const r of resultados.slice(0, 5)) {
    const str = r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    console.log(`  ${r.tabela}.${r.col} (${r.idCol}) = R$ ${str} (delta R$ ${r.delta.toFixed(2)})`);
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
