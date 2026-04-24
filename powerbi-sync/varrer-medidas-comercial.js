#!/usr/bin/env node
// Varredura completa: invoca TODAS as medidas publicadas no dataset
// "Comercial PF" com filtro do mês corrente (ou --mes=YYYY-MM). Serve pra:
//   1) Validar quais medidas funcionam com service principal
//   2) Decidir quais cards incluir no sync-comercial.js
//   3) Debugar divergências com Power BI
// Lista baseada nas medidas descobertas em testar-canc-1men-v3.

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
    return { ok: false, erro: String(detalhe).slice(0, 150) };
  }
}

const GRUPOS = {
  'Medidas Cancelamento': [
    'Cancelamento', 'Valor Cancelamento (Antigo)', 'Cancelamento 1a Mensalidade',
    'Cancelamento s/ Filtro', 'Tempo Base Cancelados', 'Ativação Data',
    'Acumulado Contrato Ativos', 'Acumulado Contratos Inativos',
    'PLANTA Acumulada', '% Churn', 'Cancelamento 1a Mensalidade White',
  ],
  'Medidas Clientes': [
    'Contratos Ativos', 'Acumulado Ativações PF',
    'Calculo Base Ativos Mês Anterior', 'Calculo Base Cancelados',
    'Qtd. Contratos Ativos Acumulado', 'BASE GERAL', 'Isentos',
    'Novos Clientes', 'Base PJ', 'Acumulado Ativações PJ', 'Base PF',
    'Permuta', 'Base Dual Net', 'Base Planet',
  ],
  'Medidas Financeiro': [
    'Novos Negócios', 'Diferença Nv. Negocios e Cancelalemnto',
    'Valor Cancelamento Novo', '% Cancelamento B PF', '% Cancelamento B PJ',
    'Resultado 2 OP', '% Canc./Novos Clientes', 'Resultado 4 OP',
    'Resultado 5 OP', 'Diferença Mês Anterior',
  ],
  'Medidas (vendas)': [
    'Meta', 'Total Venda', 'best moth', 'Ticket Médio1',
    'Qtd. Taxa Instalacao', 'Valor Taxa Instalacao', 'Qtd. Mesh', 'Valor Mesh',
    'Ticket M', 'Meta Vendedor', 'Performance Meta', 'Meta Vendedor Numérica',
    'Ranking Vendas', 'Valor Melhor Mês', 'MoM', 'BEST MONTH QTD VENDA',
    'MoM QTD VENDA', 'Ranking Top 1 Valor', 'Ranking Top 2 Valor', 'Ranking Top 3 Valor',
    'Best Month Name', 'Best Month Qtd Novos Clientes', 'Mesh Pago', 'Mesh Nao Pago',
  ],
  'Recebimentos': ['Juros1'],
};

async function rodar() {
  carregarEnv();
  const { PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL } = process.env;
  if (!PBI_WORKSPACE_COMERCIAL || !PBI_DATASET_COMERCIAL) {
    console.error('⚠  Faltando PBI_WORKSPACE_COMERCIAL / PBI_DATASET_COMERCIAL.');
    process.exit(1);
  }
  const argMes = process.argv.find(a => a.startsWith('--mes='));
  let ano, mes;
  if (argMes) {
    [ano, mes] = argMes.split('=')[1].split('-').map(Number);
  } else {
    const d = new Date();
    ano = d.getUTCFullYear();
    mes = d.getUTCMonth() + 1;
  }
  const ws = PBI_WORKSPACE_COMERCIAL;
  const ds = PBI_DATASET_COMERCIAL;
  const token = await obterToken();

  console.log('=== Varredura Medidas Comercial PF ===');
  console.log(`Workspace: ${ws}`);
  console.log(`Dataset:   ${ds}`);
  console.log(`Mês alvo:  ${ano}-${String(mes).padStart(2, '0')}\n`);

  const filtroCalc = (m) => `
    EVALUATE
    ROW("v",
      CALCULATE(
        [${m}],
        'dCalendario'[Ano] = ${ano},
        'dCalendario'[Mês numero] = ${mes}
      )
    )`;

  let total = 0, ok = 0;
  for (const [grupo, medidas] of Object.entries(GRUPOS)) {
    console.log(`── ${grupo} (${medidas.length}) ──`);
    for (const m of medidas) {
      total++;
      const r = await dax(token, ws, ds, filtroCalc(m));
      if (r.ok) {
        ok++;
        const v = r.rows[0]?.['[v]'];
        const fmt = typeof v === 'number'
          ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
          : JSON.stringify(v);
        console.log(`  ✅ [${m}]`.padEnd(50) + ` = ${fmt}`);
      } else {
        console.log(`  ❌ [${m}]`.padEnd(50) + ` → ${r.erro}`);
      }
    }
    console.log('');
  }
  console.log(`=== ${ok}/${total} medidas OK ===`);
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
