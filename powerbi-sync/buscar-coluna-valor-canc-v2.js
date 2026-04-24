#!/usr/bin/env node
// v2: testa SUM em TODAS as colunas (inclusive as que sampleram null/object),
// não filtra por tipo. Foco em valor_produto / VALOR_SERVICO que foram puladas antes.
// Alvo: R$ 5.892,30

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

const subqueryIds = `CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]),
  ${filtroMes},
  'dCancelamentos'[motivo] IN {${motivos}},
  USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta]))`;

async function listarColunas(token, tabela) {
  const r = await dax(token, `EVALUATE TOPN(1, '${tabela}')`);
  if (!r.ok) return null;
  const row = r.rows[0] || {};
  return Object.keys(row)
    .map(k => {
      const m = k.match(/^([^[]+)\[(.+)\]$/);
      return m ? { tabela: m[1], col: m[2] } : null;
    })
    .filter(Boolean);
}

async function testarSum(token, tabela, col, idCol) {
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

  const tabelas = ['fVendas', 'FnAReceber', 'Recebimentos', 'dContratos'];
  const todas = [];
  for (const t of tabelas) {
    const cols = await listarColunas(token, t);
    if (cols) todas.push(...cols);
  }

  console.log(`=== Testando SUM em TODAS as ${todas.length} colunas ===`);
  console.log(`Alvo: R$ 5.892,30\n`);

  // Ignora só as que são obviamente não-valor
  const ignorar = /^(id_|ID_|.*_id$|data_|Data_|Data |.*[Dd]ata$|numero_parcela|numero|.*_nome$|nome$|razao|filial$|Filial|cidade|bairro|endereco|cnpj|concorrente|canal_venda|cliente_id|plano|vendedor|Vendedor|servico|bloqueio|tipo_|Tipo_|status|Status|Ano|Nome|PRODUTO|MOTIVO_CANCEL|QTD_SERVICO|TIPO_SERVICO|Aging|baixa|carteira|tipo_recebimento|Consulta|vd_|motivo_cancelamento|Cliente|Motivo)/;

  const idCols = {
    fVendas: 'id_contrato',
    FnAReceber: 'id_contrato',
    Recebimentos: 'id_contrato',
    dContratos: 'ID_Contrato',
  };

  const resultados = [];
  for (const { tabela, col } of todas) {
    if (ignorar.test(col)) continue;
    const idCol = idCols[tabela];
    const r = await testarSum(token, tabela, col, idCol);
    if (r.ok) {
      const v = typeof r.valor === 'number' ? r.valor : 0;
      const delta = Math.abs(v - ALVO);
      const marca = delta < 1 ? ' 🎯 BATEU!' : (delta < 100 ? ' 🔥 perto' : (delta < 1000 ? ' ~' : ''));
      resultados.push({ tabela, col, idCol, valor: v, delta });
      const str = v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      console.log(`  ${marca.includes('BATEU') ? '🎯' : marca.includes('perto') ? '🔥' : '  '} ${tabela}.${col.padEnd(35)} = R$ ${str.padStart(15)}${marca}`);
    } else {
      console.log(`  ❌ ${tabela}.${col.padEnd(35)} ${String(r.erro).slice(0, 50)}`);
    }
  }

  console.log(`\n=== Top 10 mais próximos de R$ 5.892,30 ===`);
  resultados.sort((a, b) => a.delta - b.delta);
  for (const r of resultados.slice(0, 10)) {
    const str = r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const marca = r.delta < 1 ? ' 🎯' : '';
    console.log(`  ${r.tabela}.${r.col.padEnd(35)} = R$ ${str.padStart(15)} (delta R$ ${r.delta.toFixed(2)})${marca}`);
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
