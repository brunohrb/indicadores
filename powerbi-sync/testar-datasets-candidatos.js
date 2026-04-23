#!/usr/bin/env node
// Testa as 3 medidas problemáticas em cada dataset candidato
// pra achar onde estão publicadas [Ticket Medio Base], [Cancelamento
// 1a Mensalidade Qtd], [Cancelamento 1a Mensalidade Valor] + fReajustes.

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

async function dax(token, datasetId, query) {
  const { PBI_WORKSPACE_ID } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_ID}/datasets/${datasetId}/executeQueries`;
  try {
    const { data } = await axios.post(
      url,
      { queries: [{ query }], serializerSettings: { includeNulls: true } },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    const row = data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
    return { ok: true, valor: row['[v]'] };
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

  const datasets = [
    { nome: 'Diretoria (atual)',          id: 'a05016d1-ec5c-4d9d-9e74-1592bcd165f9' },
    { nome: 'DIretoria Visão de Tabela', id: '03c4c346-6e77-4893-a9e7-430895563016' },
    { nome: 'Dashboard de Reajustes',     id: 'e97a6d33-6761-49f3-8869-3635fb107219' },
    { nome: 'Dashboard de Reajustes (1)', id: '3698b253-6488-4109-b0b3-5864021456f3' },
    { nome: 'Analitico Reajuste',         id: '378db1da-0dd4-4d46-ab69-4739a8c1c140' },
    { nome: 'Faturamento Diretoria',      id: '0273687d-92ff-420c-879b-158b616adae0' },
  ];

  // O que testar em cada dataset
  const testes = [
    { nome: '[Ticket Medio Base]',                   dax: `ROW("v", [Ticket Medio Base])` },
    { nome: '[Cancelamento 1a Mensalidade Qtd]',     dax: `ROW("v", [Cancelamento 1a Mensalidade Qtd])` },
    { nome: '[Cancelamento 1a Mensalidade Valor]',   dax: `ROW("v", [Cancelamento 1a Mensalidade Valor])` },
    { nome: '[New Can.]',                            dax: `ROW("v", [New Can.])` }, // sanity check — existe no Diretoria
    { nome: 'fReajustes (tabela)',                   dax: `TOPN(1, 'fReajustes')` },
    { nome: 'FnAReceber (tabela)',                   dax: `TOPN(1, 'FnAReceber')` },
    { nome: 'fFn_Areceber (tabela, com _)',          dax: `TOPN(1, 'fFn_Areceber')` },
  ];

  for (const ds of datasets) {
    console.log(`\n╔══ ${ds.nome.padEnd(50)} ══╗`);
    console.log(`   ID: ${ds.id}\n`);
    for (const t of testes) {
      const r = await dax(token, ds.id, `EVALUATE ${t.dax}`);
      if (r.ok) {
        const v = typeof r.valor === 'number'
          ? r.valor.toFixed(2)
          : (r.valor === undefined ? '(tabela acessível)' : JSON.stringify(r.valor));
        console.log(`  ✅ ${t.nome.padEnd(42)} → ${v}`);
      } else {
        const msg = String(r.erro).slice(0, 70);
        console.log(`  ❌ ${t.nome.padEnd(42)} → ${msg}`);
      }
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
