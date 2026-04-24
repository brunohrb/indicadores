#!/usr/bin/env node
// Explora variações de DAX pra achar qual definição de "Cancelamento 1a
// Mensalidade" bate o número do Power BI (abril/2026: QTD=47, Valor=R$ 5.892,30).
// Dataset alvo: Comercial PF. Passamos workspace/dataset via env vars.

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

function fmt(rows) {
  if (!rows || !rows[0]) return '(vazio)';
  return JSON.stringify(rows[0]);
}

async function rodar() {
  carregarEnv();
  const { PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL } = process.env;
  if (!PBI_WORKSPACE_COMERCIAL || !PBI_DATASET_COMERCIAL) {
    console.error('⚠  Faltando PBI_WORKSPACE_COMERCIAL e/ou PBI_DATASET_COMERCIAL.');
    process.exit(1);
  }
  const hoje = new Date();
  const ano = hoje.getUTCFullYear();
  const mes = hoje.getUTCMonth() + 1;
  console.log('=== Variações de "Cancelamento 1a Mensalidade" ===');
  console.log(`Workspace: ${PBI_WORKSPACE_COMERCIAL}`);
  console.log(`Dataset:   ${PBI_DATASET_COMERCIAL}`);
  console.log(`Mês:       ${ano}-${String(mes).padStart(2, '0')}`);
  console.log('Alvo Power BI: QTD=47, Valor=R$ 5.892,30\n');

  const token = await obterToken();
  const ws = PBI_WORKSPACE_COMERCIAL;
  const ds = PBI_DATASET_COMERCIAL;

  // Filtro base de mês (variações trocam a coluna de data de cancelamento)
  const filtroMesCanc = (col) =>
    `YEAR('fCancelamentos'[${col}]) = ${ano} && MONTH('fCancelamentos'[${col}]) = ${mes}`;

  // Monta query de qtd+valor com filtro + predicado de "primeira mensalidade"
  const qtdValor = (colCanc, predicadoPrimeira) => `
    EVALUATE
    ROW(
      "qtd",   COUNTROWS( FILTER('fCancelamentos',
                  ${filtroMesCanc(colCanc)} &&
                  ${predicadoPrimeira}
                )),
      "valor", SUMX(
                  FILTER('fCancelamentos',
                    ${filtroMesCanc(colCanc)} &&
                    ${predicadoPrimeira}
                  ),
                  'fCancelamentos'[valor_liquido]
                )
    )`;

  const variacoes = [
    {
      id: 'v1',
      desc: 'DATEDIFF(raw, raw, DAY) <= 30 (baseline atual = 19 esperado)',
      q: qtdValor('data_cancelamento',
        `DATEDIFF('fCancelamentos'[data_ativacao], 'fCancelamentos'[data_cancelamento], DAY) <= 30`),
    },
    {
      id: 'v2',
      desc: 'DATEDIFF("Correta", "Correta", DAY) <= 30',
      q: qtdValor('Data de Cancelamento Correta',
        `DATEDIFF('fCancelamentos'[Data De Ativação Correta], 'fCancelamentos'[Data de Cancelamento Correta], DAY) <= 30`),
    },
    {
      id: 'v3',
      desc: 'DATEDIFF(raw, raw, DAY) <= 60',
      q: qtdValor('data_cancelamento',
        `DATEDIFF('fCancelamentos'[data_ativacao], 'fCancelamentos'[data_cancelamento], DAY) <= 60`),
    },
    {
      id: 'v4',
      desc: 'DATEDIFF("Correta", "Correta", DAY) <= 60',
      q: qtdValor('Data de Cancelamento Correta',
        `DATEDIFF('fCancelamentos'[Data De Ativação Correta], 'fCancelamentos'[Data de Cancelamento Correta], DAY) <= 60`),
    },
    {
      id: 'v5',
      desc: 'DATEDIFF(raw, raw, MONTH) <= 1 (1 mês calendário)',
      q: qtdValor('data_cancelamento',
        `DATEDIFF('fCancelamentos'[data_ativacao], 'fCancelamentos'[data_cancelamento], MONTH) <= 1`),
    },
    {
      id: 'v6',
      desc: 'DATEDIFF("Correta", "Correta", MONTH) <= 1',
      q: qtdValor('Data de Cancelamento Correta',
        `DATEDIFF('fCancelamentos'[Data De Ativação Correta], 'fCancelamentos'[Data de Cancelamento Correta], MONTH) <= 1`),
    },
    {
      id: 'v7',
      desc: 'Ativação no mesmo ano+mês do cancelamento (raw)',
      q: qtdValor('data_cancelamento',
        `YEAR('fCancelamentos'[data_ativacao]) = ${ano} && MONTH('fCancelamentos'[data_ativacao]) = ${mes}`),
    },
    {
      id: 'v8',
      desc: 'Ativação no mesmo ano+mês do cancelamento ("Correta")',
      q: qtdValor('Data de Cancelamento Correta',
        `YEAR('fCancelamentos'[Data De Ativação Correta]) = ${ano} && MONTH('fCancelamentos'[Data De Ativação Correta]) = ${mes}`),
    },
    {
      id: 'v9',
      desc: '[Tempo na Base] <= 30 (se for numérico em dias)',
      q: qtdValor('data_cancelamento',
        `'fCancelamentos'[Tempo na Base] <= 30`),
    },
    {
      id: 'v10',
      desc: '[Tempo na Base] <= 1 (se for numérico em meses)',
      q: qtdValor('data_cancelamento',
        `'fCancelamentos'[Tempo na Base] <= 1`),
    },
  ];

  for (const v of variacoes) {
    const r = await dax(token, ws, ds, v.q);
    const tag = r.ok ? '✅' : '❌';
    const saida = r.ok ? fmt(r.rows) : r.erro;
    console.log(`${tag} ${v.id.padEnd(3)} ${v.desc}`);
    console.log(`     → ${saida}\n`);
  }

  // Bônus: listar valores distintos da coluna 'Tempo na Base' (amostra)
  console.log('▸ Amostra de [Tempo na Base] (até 20 valores distintos):');
  const rTb = await dax(token, ws, ds,
    `EVALUATE TOPN(20, VALUES('fCancelamentos'[Tempo na Base]))`);
  if (rTb.ok) {
    for (const row of rTb.rows) {
      console.log(`    ${JSON.stringify(row)}`);
    }
  } else {
    console.log(`    ❌ ${rTb.erro}`);
  }

  // Bônus: tenta medidas com nomes variados
  console.log('\n▸ Testando medidas publicadas no dataset (variações de nome):');
  const nomes = [
    'Cancelamento 1a Mensalidade Qtd',
    'Cancelamento 1a Mensalidade Valor',
    'Qtd Cancelamento 1a Mensalidade',
    'Valor Cancelamento 1a Mensalidade',
    'QTD. Canc. 1 Men.',
    'Valor Canc. 1 Men.',
    'Cancelamento Primeira Mensalidade',
    'Canc 1 Mens Qtd',
    'Canc 1 Mens Valor',
  ];
  for (const m of nomes) {
    const r = await dax(token, ws, ds, `EVALUATE ROW("v", [${m}])`);
    const tag = r.ok ? '✅' : '❌';
    const saida = r.ok ? fmt(r.rows) : r.erro.slice(0, 80);
    console.log(`  ${tag} [${m}] → ${saida}`);
  }

  console.log('\n=== Fim ===');
  console.log('Procure acima a variação cujo "qtd":47 e "valor" perto de 5892.3.');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
