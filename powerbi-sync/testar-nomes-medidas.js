#!/usr/bin/env node
// =====================================================
// Power BI — Testa variações de nomes de medidas
// pra achar os 3 nomes exatos (1a Mensalidade Qtd/Valor e Ticket Medio Base)
// Uso: node testar-nomes-medidas.js
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

async function tentarMedida(token, nome) {
  const { PBI_WORKSPACE_ID, PBI_DATASET_ID } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_ID}/datasets/${PBI_DATASET_ID}/executeQueries`;
  const dax = `EVALUATE ROW("v", ${nome})`;
  try {
    const { data } = await axios.post(
      url,
      { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    const row = data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
    const valor = row['[v]'];
    return { ok: true, valor };
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
  console.log('=== Teste de variações de nomes ===\n');

  const token = await obterToken();

  const grupos = {
    'Ticket Médio da Base': [
      '[Ticket Medio Base]',
      '[Ticket Médio Base]',
      '[Ticket medio Base]',
      '[Ticket Médio da Base]',
      '[Ticket Medio da Base]',
      '[ticket medio base]',
      '[Ticket_Medio_Base]',
      '[TicketMedioBase]',
    ],
    'QTD Canc. 1 Men.': [
      '[Cancelamento 1a Mensalidade Qtd]',
      '[Cancelamento 1ª Mensalidade Qtd]',
      '[Cancelamento 1a Mensalidade QTD]',
      '[Cancelamento 1ª Mensalidade QTD]',
      '[Cancelamento 1 Mensalidade Qtd]',
      '[Cancelamento 1 Mensalidade QTD]',
      '[Cancelamento 1º Mensalidade Qtd]',
      '[Cancelamento Primeira Mensalidade Qtd]',
      '[QTD. Canc. 1 Men.]',
      '[Qtd Canc 1 Men]',
    ],
    'Valor Canc. 1 Men.': [
      '[Cancelamento 1a Mensalidade Valor]',
      '[Cancelamento 1ª Mensalidade Valor]',
      '[Cancelamento 1 Mensalidade Valor]',
      '[Cancelamento 1 Mensalidade]',
      '[Cancelamento Primeira Mensalidade Valor]',
      '[Valor Canc. 1 Men.]',
      '[Valor 1a Mensalidade]',
    ],
  };

  for (const [titulo, nomes] of Object.entries(grupos)) {
    console.log(`\n━━━ ${titulo} ━━━`);
    for (const nome of nomes) {
      const r = await tentarMedida(token, nome);
      if (r.ok) {
        console.log(`  ✅ ${nome.padEnd(55)} → ${JSON.stringify(r.valor)}`);
      } else {
        const msg = String(r.erro).slice(0, 90);
        console.log(`  ❌ ${nome.padEnd(55)} → ${msg}`);
      }
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
  process.exit(1);
});
