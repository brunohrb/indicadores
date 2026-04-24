#!/usr/bin/env node
// Testa as medidas exatas do print do BI nos 6 datasets do workspace.
// Medidas visíveis: [Cancelamento], [Cancelamento 1 Mensalidade],
// [Cancelamento 1a Mensalidade Qtd], [Cancelamento 1a Mensalidade Valor],
// [Cancelamento 1a Mensalidade White]

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

async function dax(token, datasetId, query) {
  const { PBI_WORKSPACE_ID } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_ID}/datasets/${datasetId}/executeQueries`;
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
  const ALVO = 5892.30;

  const datasets = [
    { nome: 'Diretoria (atual)',           id: 'a05016d1-ec5c-4d9d-9e74-1592bcd165f9' },
    { nome: 'DIretoria Visão de Tabela',   id: '03c4c346-6e77-4893-a9e7-430895563016' },
    { nome: 'Dashboard de Reajustes',      id: 'e97a6d33-6761-49f3-8869-3635fb107219' },
    { nome: 'Dashboard de Reajustes (1)',  id: '3698b253-6488-4109-b0b3-5864021456f3' },
    { nome: 'Analitico Reajuste',          id: '378db1da-0dd4-4d46-ab69-4739a8c1c140' },
    { nome: 'Faturamento Diretoria',       id: '0273687d-92ff-420c-879b-158b616adae0' },
  ];

  // Nomes exatos do print + variações comuns
  const medidas = [
    '[Cancelamento 1a Mensalidade Valor]',
    '[Cancelamento 1ª Mensalidade Valor]',   // com caractere ª (ordinal)
    '[Cancelamento 1 Mensalidade]',
    '[Cancelamento 1ª Mensalidade]',
    '[Cancelamento 1a Mensalidade Qtd]',
    '[Cancelamento 1a Mensalidade White]',
    '[Cancelamento]',
  ];

  // Filtro: abril/2026
  const filtroMes = `'dCalendario'[Mês numero] = 4, 'dCalendario'[Ano] = 2026`;

  for (const ds of datasets) {
    console.log(`\n╔══ ${ds.nome.padEnd(40)} ══╗`);
    console.log(`   ID: ${ds.id}\n`);
    for (const m of medidas) {
      // Tenta COM filtro de mês
      const query = `EVALUATE ROW("v", CALCULATE(${m}, ${filtroMes}))`;
      const r = await dax(token, ds.id, query);
      if (r.ok) {
        const v = r.rows[0]?.['[v]'];
        const num = typeof v === 'number' ? v : null;
        const str = num !== null
          ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : JSON.stringify(v);
        const delta = num !== null ? Math.abs(num - ALVO) : Infinity;
        const marca = delta < 1 ? ' 🎯 BATEU!' : (delta < 100 ? ' 🔥 perto' : '');
        console.log(`  ✅ ${m.padEnd(45)} → R$ ${String(str).padStart(15)}${marca}`);
      } else {
        console.log(`  ❌ ${m.padEnd(45)} → ${String(r.erro).slice(0, 55)}`);
      }
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
