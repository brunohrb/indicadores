#!/usr/bin/env node
// Testa variações de DAX pro card Valor Canc. 1 Men.
// Meta: bater 5.324,90 do Power BI (vs 89,90 atual)

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
  console.log('=== Teste de DAX pro Valor Canc. 1 Men. ===\n');
  console.log('Alvo: R$ 5.324,90 (Power BI)\n');
  const token = await obterToken();

  const motivos = `"CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PRÉ-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE (PÓS-PAGO)","CANCELAMENTO INADIMPLENTE - PRIMEIRA MENSALIDADE PJ"`;
  const filtroMes = `'dCalendario'[Mês numero] = 4, 'dCalendario'[Ano] = 2026`;

  const variantes = [
    {
      nome: 'V1: doc BI pura (sem filtroMes no VAR)',
      dax: `VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato]))`
    },
    {
      nome: 'V2: CALCULATE externo + doc BI pura',
      dax: `CALCULATE(VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato])), ${filtroMes})`
    },
    {
      nome: 'V3: filtroMes no VAR + USERELATIONSHIP',
      dax: `VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato]))`
    },
    {
      nome: 'V4: filtro por data inline (sem USERELATIONSHIP)',
      dax: `VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), FILTER(ALL('dCancelamentos'), YEAR('dCancelamentos'[Data de Cancelamento Correta]) = 2026 && MONTH('dCancelamentos'[Data de Cancelamento Correta]) = 4 && 'dCancelamentos'[motivo] IN {${motivos}})) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato]))`
    },
    {
      nome: 'V5: IN em vez de TREATAS',
      dax: `CALCULATE(SUM('FnAReceber'[valor_recebido]), 'FnAReceber'[numero_parcela_recorrente] = 1, 'FnAReceber'[id_contrato] IN CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])))`
    },
    {
      nome: 'V6: SUMX iterando os contratos',
      dax: `SUMX(CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])), CALCULATE(SUM('FnAReceber'[valor_recebido]), 'FnAReceber'[numero_parcela_recorrente] = 1, 'FnAReceber'[id_contrato] = EARLIER('dCancelamentos'[id_contrato])))`
    },
    {
      nome: 'V7: SUMX com variável em vez de EARLIER',
      dax: `SUMX(CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])), VAR _id = 'dCancelamentos'[id_contrato] RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), 'FnAReceber'[numero_parcela_recorrente] = 1, 'FnAReceber'[id_contrato] = _id))`
    },
    {
      nome: 'V8: ALL(dCalendario) pra quebrar propagação',
      dax: `VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), ALL('dCalendario'), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato]))`
    },
    {
      nome: 'V9: REMOVEFILTERS(FnAReceber) antes',
      dax: `VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), REMOVEFILTERS('FnAReceber'), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato]))`
    },
    {
      nome: 'V10: REMOVEFILTERS geral + filtros',
      dax: `VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), REMOVEFILTERS(), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato]))`
    },
    {
      nome: 'V11: ALL(FnAReceber) + filtros',
      dax: `VAR _c = CALCULATETABLE(VALUES('dCancelamentos'[id_contrato]), ${filtroMes}, 'dCancelamentos'[motivo] IN {${motivos}}, USERELATIONSHIP('dCalendario'[Calendario], 'dCancelamentos'[Data de Cancelamento Correta])) RETURN CALCULATE(SUM('FnAReceber'[valor_recebido]), ALL('FnAReceber'), 'FnAReceber'[numero_parcela_recorrente] = 1, TREATAS(_c, 'FnAReceber'[id_contrato]))`
    },
  ];

  for (const v of variantes) {
    const r = await dax(token, `EVALUATE ROW("v", ${v.dax})`);
    if (r.ok) {
      const str = typeof r.valor === 'number'
        ? r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : JSON.stringify(r.valor);
      const marca = Math.abs((r.valor || 0) - 5324.90) < 1 ? '🎯 BATEU!' : '';
      console.log(`${marca ? '✅' : '  '} ${v.nome.padEnd(55)} → R$ ${str} ${marca}`);
    } else {
      console.log(`❌ ${v.nome.padEnd(55)} → ${String(r.erro).slice(0, 80)}`);
    }
  }

  console.log('\n=== Fim ===');
}

rodar().catch(e => {
  console.error(`FALHOU: ${e.message}`);
  process.exit(1);
});
