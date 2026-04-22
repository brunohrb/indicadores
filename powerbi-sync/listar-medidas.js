#!/usr/bin/env node
// =====================================================
// Power BI — Lista medidas do modelo + explora tabelas
// relevantes (dCancelamentos, fVendas).
// Uso: node listar-medidas.js
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

function safe(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/\s+/g, ' ').trim();
}

async function listarMedidas(token) {
  log('\n╔══════════════════════════════════════════════════════════╗');
  log('║  MEDIDAS DO MODELO                                       ║');
  log('╚══════════════════════════════════════════════════════════╝\n');

  // Palavras-chave dos cards problemáticos
  const palavras = [
    'receita', 'mrr', 'ticket', 'canc', 'mens', 'primeira',
    'pós', 'pos pago', 'postpago', 'novo', 'cliente',
    'reajuste', 'juros', 'pme', 'pf', 'pj', 'pessoa', 'isento'
  ];

  try {
    const rows = await dax(token,
      `EVALUATE SELECTCOLUMNS(INFO.MEASURES(),
        "Nome", [Name],
        "Tabela", [TableID],
        "Expr", [Expression])`
    );
    log(`→ Total de medidas: ${rows.length}\n`);

    // Lista tudo (nome + tabela) resumidamente
    log('── TODAS AS MEDIDAS (nome) ──');
    const nomes = rows.map(r => safe(r['[Nome]'])).sort();
    nomes.forEach(n => log(`   ${n}`));

    // Detalhado: só as que parecem relevantes pros cards quebrados
    log('\n── MEDIDAS RELEVANTES (com DAX) ──');
    for (const r of rows) {
      const nome = safe(r['[Nome]']);
      const expr = safe(r['[Expr]']);
      const nomeLow = nome.toLowerCase();
      if (palavras.some(p => nomeLow.includes(p))) {
        log(`\n▸ ${nome}`);
        log(`  DAX: ${expr}`);
      }
    }
  } catch (e) {
    log(`  ERRO listar medidas: ${e.response?.data?.error?.code || e.message}`);
  }
}

async function explorarTabela(token, tabela) {
  log(`\n╔══════════════════════════════════════════════════════════╗`);
  log(`║  TABELA: ${tabela.padEnd(48)}║`);
  log(`╚══════════════════════════════════════════════════════════╝\n`);

  try {
    const rows = await dax(token, `EVALUATE TOPN(3, '${tabela}')`);
    if (!rows.length) {
      log('  (tabela vazia ou sem acesso)');
      return;
    }
    const cols = Object.keys(rows[0]);
    log(`  Colunas (${cols.length}):`);
    for (const c of cols) log(`    • ${c}`);
    log('\n  Primeira linha:');
    for (const c of cols) {
      log(`    ${c.padEnd(50)} ${JSON.stringify(rows[0][c])}`);
    }
  } catch (e) {
    log(`  ERRO: ${e.response?.data?.error?.code || e.message}`);
    log(`  (tabela provavelmente não existe com esse nome)`);
  }
}

async function listarTabelas(token) {
  log('\n╔══════════════════════════════════════════════════════════╗');
  log('║  TODAS AS TABELAS DO MODELO                              ║');
  log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    const rows = await dax(token,
      `EVALUATE SELECTCOLUMNS(INFO.TABLES(), "Nome", [Name])`
    );
    const nomes = rows.map(r => safe(r['[Nome]'])).sort();
    log(`→ Total: ${nomes.length}`);
    nomes.forEach(n => log(`   ${n}`));
  } catch (e) {
    log(`  ERRO: ${e.response?.data?.error?.code || e.message}`);
  }
}

async function rodar() {
  carregarEnv();
  log('=== Exploração completa do modelo Power BI ===');

  const token = await obterToken();

  await listarTabelas(token);
  await listarMedidas(token);

  // Explora tabelas candidatas a ter os cards que faltam
  const tabelasInteresse = [
    'dCancelamentos',
    'fVendas',
    'Recebimentos',
    'fFinanceiro',
    'dPlanos',
  ];
  for (const t of tabelasInteresse) {
    await explorarTabela(token, t);
  }

  log('\n=== Fim ===');
}

rodar().catch(e => {
  log(`FALHOU: ${e.message}`);
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`);
  process.exit(1);
});
