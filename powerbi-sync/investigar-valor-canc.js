#!/usr/bin/env node
// Investigação profunda: onde está o valor dos 40 contratos de 1a mens?

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
      || e.response?.data?.error?.message || e.message;
    return { ok: false, erro: detalhe };
  }
}

async function rodar() {
  carregarEnv();
  const token = await obterToken();
  console.log('=== Investigação do Valor Canc. 1 Men. ===\n');

  // 1. Quantos dos 41 contratos aparecem em cada tabela?
  const motivos = `"CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE PJ"`;
  const filtroMes = `'dCalendario'[Mês numero] = 4, 'dCalendario'[Ano] = 2026`;
  const baseContratos = `CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta]))`;

  console.log('── Presença dos 41 contratos em cada tabela ──');
  const tabelas = [
    { n: 'FnAReceber',    col: 'id_contrato' },
    { n: 'fVendas',       col: 'id_contrato' },
    { n: 'Recebimentos',  col: 'id_contrato' },
    { n: 'dContratos',    col: 'ID_Contrato' },
  ];
  for (const { n, col } of tabelas) {
    const q = `EVALUATE ROW("v", COUNTROWS(FILTER('${n}', '${n}'[${col}] IN ${baseContratos})))`;
    const r = await dax(token, q);
    if (r.ok) console.log(`  ${n.padEnd(15)} → ${JSON.stringify(r.rows[0]?.['[v]'])} linhas p/ os 41 contratos`);
    else console.log(`  ${n.padEnd(15)} → ERRO ${String(r.erro).slice(0, 60)}`);
  }

  // 2. Tabelas menos óbvias que podem ter o valor
  console.log('\n── Teste de existência de tabelas candidatas ──');
  const candidatas = [
    'Reajustes', 'dTaxaInstalacao', 'Retivacoes 30 dias', 'Upgrade/Downgrade (2)',
    'fOS', 'dClientes', 'dPlanos', 'Mensalidades', 'Faturas', 'Contratos',
    'fFaturas', 'Parcelas', 'dPlano', 'Produtos', 'Valores',
  ];
  for (const t of candidatas) {
    const q = `EVALUATE TOPN(1, '${t}')`;
    const r = await dax(token, q);
    if (r.ok && r.rows.length) {
      const cols = Object.keys(r.rows[0]);
      console.log(`\n  ✅ '${t}' existe. Colunas: ${cols.join(', ')}`);
      // mostra valores numéricos
      const linha = r.rows[0];
      for (const c of cols) {
        const v = linha[c];
        if (typeof v === 'number' && v > 50 && v < 500) {
          console.log(`     [VALOR SUSPEITO] ${c} = ${v}`);
        }
      }
    }
  }

  // 3. Testa somar colunas de dContratos que possam ter valor
  console.log('\n── Soma de colunas numéricas p/ os 41 contratos ──');
  const contratoBase = `CALCULATETABLE(VALUES('dContratos'[ID_Contrato]), TREATAS(${baseContratos}, 'dContratos'[ID_Contrato]))`;
  // tenta todos os nomes comuns de valor em dContratos
  const colunasDContratos = ['valor', 'Valor', 'valor_plano', 'valor_mensal', 'valor_mensalidade', 'mensalidade', 'Total Cancelado'];
  for (const c of colunasDContratos) {
    const q = `EVALUATE ROW("v", CALCULATE(SUMX('dContratos', 'dContratos'[${c}]), TREATAS(${baseContratos}, 'dContratos'[ID_Contrato])))`;
    const r = await dax(token, q);
    if (r.ok) {
      const v = r.rows[0]?.['[v]'];
      const str = typeof v === 'number' ? v.toFixed(2) : JSON.stringify(v);
      const marca = typeof v === 'number' && Math.abs(v - 5324.90) < 1 ? ' 🎯 BATEU!' : '';
      console.log(`  dContratos[${c}] → ${str}${marca}`);
    }
  }

  // 4. Testa dCancelamentos[Total Cancelado] como número
  console.log('\n── dCancelamentos numérico ──');
  const colunasDCanc = ['Total Cancelado'];
  for (const c of colunasDCanc) {
    const q = `EVALUATE ROW("v", CALCULATE(SUMX('dCancelamentos', 'dCancelamentos'[${c}]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])))`;
    const r = await dax(token, q);
    if (r.ok) {
      const v = r.rows[0]?.['[v]'];
      const str = typeof v === 'number' ? v.toFixed(2) : JSON.stringify(v);
      const marca = typeof v === 'number' && Math.abs(v - 5324.90) < 1 ? ' 🎯 BATEU!' : '';
      console.log(`  dCancelamentos[${c}] → ${str}${marca}`);
    } else {
      console.log(`  dCancelamentos[${c}] → ERRO: ${String(r.erro).slice(0, 60)}`);
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
