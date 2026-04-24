#!/usr/bin/env node
// Testa variações novas do Valor Canc. 1 Men. baseadas no print da tabela
// fCancelamentos enviado pelo BI: colunas valor_liquido (ativa), Total Cancelado,
// VALOR_BRUTO. Hipótese: o valor sai DIRETO da fCancelamentos, não da FnAReceber.
//
// Alvo: R$ 5.892,30 (abril/2026)

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
    const row = data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
    return { ok: true, valor: row['[v]'], rows: data.results?.[0]?.tables?.[0]?.rows };
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
  console.log('=== Valor Canc. 1 Men. v2 — fCancelamentos direto ===\n');
  console.log('Alvo: R$ 5.892,30 (abril/2026)\n');
  const token = await obterToken();

  const motivos = `"CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE PJ"`;
  const filtroMes = `'dCalendario'[Mês numero] = 4, 'dCalendario'[Ano] = 2026`;
  const ALVO = 5892.30;

  // ─── PARTE 1: descobrir nome real da tabela e colunas ───
  console.log('— Parte 1: probe de tabelas/colunas —\n');
  const probes = [
    { nome: "tabela 'fCancelamentos' acessível", dax: `COUNTROWS('fCancelamentos')` },
    { nome: "tabela 'dCancelamentos' acessível", dax: `COUNTROWS('dCancelamentos')` },
    { nome: "fCancelamentos[valor_liquido] existe", dax: `CALCULATE(SUM('fCancelamentos'[valor_liquido]), ${filtroMes})` },
    { nome: "fCancelamentos[Total Cancelado] existe", dax: `CALCULATE(SUM('fCancelamentos'[Total Cancelado]), ${filtroMes})` },
    { nome: "fCancelamentos[VALOR_BRUTO] existe", dax: `CALCULATE(SUM('fCancelamentos'[VALOR_BRUTO]), ${filtroMes})` },
    { nome: "dCancelamentos[valor_liquido] existe", dax: `CALCULATE(SUM('dCancelamentos'[valor_liquido]), ${filtroMes})` },
    { nome: "dCancelamentos[Total Cancelado] existe", dax: `CALCULATE(SUM('dCancelamentos'[Total Cancelado]), ${filtroMes})` },
    { nome: "dCancelamentos[VALOR_BRUTO] existe", dax: `CALCULATE(SUM('dCancelamentos'[VALOR_BRUTO]), ${filtroMes})` },
  ];
  for (const p of probes) {
    const r = await dax(token, `EVALUATE ROW("v", ${p.dax})`);
    if (r.ok) {
      const v = typeof r.valor === 'number'
        ? r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : JSON.stringify(r.valor);
      console.log(`  ✅ ${p.nome.padEnd(50)} → ${v}`);
    } else {
      console.log(`  ❌ ${p.nome.padEnd(50)} → ${String(r.erro).slice(0, 70)}`);
    }
  }

  // ─── PARTE 2: variações com SOMA direta na fCancelamentos ───
  console.log('\n— Parte 2: variações de fórmula —\n');
  // Vou montar com placeholder TBL e VAL pra reusar
  const formulas = (TBL, VAL, dataCol) => ([
    {
      nome: `A: SUM(${TBL}[${VAL}]) + motivos + USEREL(${dataCol})`,
      dax: `CALCULATE(SUM('${TBL}'[${VAL}]), ${filtroMes}, '${TBL}'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], '${TBL}'[${dataCol}]))`
    },
    {
      nome: `B: SUM(${TBL}[${VAL}]) + motivos (rel ATIVA)`,
      dax: `CALCULATE(SUM('${TBL}'[${VAL}]), ${filtroMes}, '${TBL}'[motivo] IN {${motivos}})`
    },
    {
      nome: `C: SUM(${TBL}[${VAL}]) + motivos + filtro data inline`,
      dax: `CALCULATE(SUM('${TBL}'[${VAL}]), '${TBL}'[motivo] IN {${motivos}}, FILTER(ALL('${TBL}'), YEAR('${TBL}'[${dataCol}])=2026 && MONTH('${TBL}'[${dataCol}])=4))`
    },
  ]);

  // Combinações: tabela × coluna de valor × coluna de data
  const combos = [];
  const tbls = ['fCancelamentos', 'dCancelamentos'];
  const vals = ['valor_liquido', 'Total Cancelado', 'VALOR_BRUTO'];
  const dts  = ['Data de Cancelamento Correta', 'data_cancelamento'];
  for (const t of tbls) {
    for (const v of vals) {
      for (const d of dts) {
        for (const f of formulas(t, v, d)) {
          combos.push({
            nome: `[${t}/${v}/${d}] ${f.nome.split('] ')[0].slice(1)} ${f.nome.split(' ').slice(-1)[0]}`,
            tag:  `${t.slice(0,1)}.${v.slice(0,5)}/${d.slice(0,4)}`,
            modo: f.nome.split(':')[0],
            dax:  f.dax,
          });
        }
      }
    }
  }

  // Roda só os modos A e B (mais provável). Vou imprimir compacto.
  let melhorDelta = Infinity;
  let melhorNome = null;
  let melhorVal = null;
  for (const c of combos) {
    if (c.modo !== 'A' && c.modo !== 'B') continue;
    const r = await dax(token, `EVALUATE ROW("v", ${c.dax})`);
    if (r.ok) {
      const num = typeof r.valor === 'number' ? r.valor : null;
      const str = num !== null
        ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : String(r.valor);
      const delta = num !== null ? Math.abs(num - ALVO) : Infinity;
      const marca = delta < 1 ? '🎯 BATEU!' : (delta < 100 ? '🔥 perto' : '');
      if (delta < melhorDelta) { melhorDelta = delta; melhorNome = c.nome; melhorVal = num; }
      console.log(`  ${marca ? '✅' : '  '} [${c.modo}] ${c.tag.padEnd(28)} → R$ ${str.padStart(12)} ${marca}`);
    } else {
      console.log(`  ❌ [${c.modo}] ${c.tag.padEnd(28)} → ${String(r.erro).slice(0, 70)}`);
    }
  }

  console.log(`\n— Melhor resultado: ${melhorNome} = R$ ${melhorVal} (delta R$ ${melhorDelta.toFixed(2)})`);
  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
