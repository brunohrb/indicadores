#!/usr/bin/env node
// =====================================================
// Power BI Comercial PF → Supabase Sync
// Puxa as medidas publicadas do dataset "Comercial PF" e
// grava no Supabase app_storage sob a chave "powerbi_comercial_pf".
// Complementa o sync.js principal (Diretoria) — não o substitui.
// =====================================================

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

function carregarEnv() {
  if (process.env.PBI_CLIENT_SECRET) return;
  const caminho = path.join(__dirname, '.env.local');
  if (!fs.existsSync(caminho)) return;
  for (const linha of fs.readFileSync(caminho, 'utf8').split('\n')) {
    const m = linha.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const cor = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', erro: '\x1b[31m', reset: '\x1b[0m' };
function log(msg, tipo = 'info') {
  console.log(`${cor[tipo] || ''}[${new Date().toLocaleTimeString('pt-BR')}] ${msg}${cor.reset}`);
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

async function executarDAX(token, dax) {
  const { PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_COMERCIAL}/datasets/${PBI_DATASET_COMERCIAL}/executeQueries`;
  const { data } = await axios.post(
    url,
    { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
}

function daxDeCard(mesNum, ano) {
  const filtroMes = `'dCalendario'[Ano] = ${ano}, 'dCalendario'[Mês numero] = ${mesNum}`;
  const comMes = (expr) => `CALCULATE(${expr}, ${filtroMes})`;

  // Valor Canc. 1a Mens. — medida não existe no dataset; calcula inline via
  // motivo CONTAINS "PRIMEIRA MENSALIDADE" (confirmado em testar-canc-1men-v3:
  // dá exatamente R$ 5.892,30 que é o que o Power BI mostra).
  const valorCanc1Mens = `
    CALCULATE(
      SUM('fCancelamentos'[valor_liquido]),
      ${filtroMes},
      SEARCH("PRIMEIRA MENSALIDADE", 'fCancelamentos'[motivo], 1, 0) > 0
    )`;

  return [
    // ─── Cancelamentos ──────────────────────────────────────────
    { card: 'Cancelamento (mês)',             dax: comMes('[Cancelamento]') },
    { card: 'Cancelamento 1a Mensalidade',    dax: comMes('[Cancelamento 1a Mensalidade]') },
    { card: 'Valor Canc. 1a Mensalidade',     dax: valorCanc1Mens },
    { card: 'Valor Cancelamento Novo',        dax: comMes('[Valor Cancelamento Novo]') },
    { card: 'Valor Cancelamento (Antigo)',    dax: comMes('[Valor Cancelamento (Antigo)]') },
    { card: 'Cancelamento s/ Filtro',         dax: comMes('[Cancelamento s/ Filtro]') },
    { card: '% Churn',                        dax: comMes('[% Churn]') },
    { card: '% Cancelamento Base PF',         dax: comMes('[% Cancelamento B PF]') },
    { card: '% Cancelamento Base PJ',         dax: comMes('[% Cancelamento B PJ]') },

    // ─── Base de Clientes ───────────────────────────────────────
    { card: 'BASE GERAL',                     dax: comMes('[BASE GERAL]') },
    { card: 'Base PF',                        dax: comMes('[Base PF]') },
    { card: 'Base PJ',                        dax: comMes('[Base PJ]') },
    { card: 'Isentos',                        dax: comMes('[Isentos]') },
    { card: 'Permuta',                        dax: comMes('[Permuta]') },
    { card: 'Base Dual Net',                  dax: comMes('[Base Dual Net]') },
    { card: 'Base Planet',                    dax: comMes('[Base Planet]') },
    { card: 'Contratos Ativos (novos/mês)',   dax: comMes('[Contratos Ativos]') },
    { card: 'Novos Clientes',                 dax: comMes('[Novos Clientes]') },

    // ─── Financeiro ─────────────────────────────────────────────
    { card: 'Novos Negócios',                 dax: comMes('[Novos Negócios]') },
    { card: 'Diferença Novos vs Cancel.',     dax: comMes('[Diferença Nv. Negocios e Cancelalemnto]') },
    { card: 'Diferença Mês Anterior',         dax: comMes('[Diferença Mês Anterior]') },
    { card: '% Canc./Novos Clientes',         dax: comMes('[% Canc./Novos Clientes]') },

    // ─── Vendas ────────────────────────────────────────────────
    { card: 'Meta (Vendas)',                  dax: comMes('[Meta]') },
    { card: 'Total Venda',                    dax: comMes('[Total Venda]') },
    { card: 'Performance Meta',               dax: comMes('[Performance Meta]') },
    { card: 'Ticket Médio1',                  dax: comMes('[Ticket Médio1]') },
    { card: 'Qtd. Taxa Instalação',           dax: comMes('[Qtd. Taxa Instalacao]') },
    { card: 'Valor Taxa Instalação',          dax: comMes('[Valor Taxa Instalacao]') },
    { card: 'Qtd. Mesh',                      dax: comMes('[Qtd. Mesh]') },
    { card: 'Valor Mesh',                     dax: comMes('[Valor Mesh]') },
    { card: 'Mesh Pago',                      dax: comMes('[Mesh Pago]') },
    { card: 'Mesh Não Pago',                  dax: comMes('[Mesh Nao Pago]') },

    // ─── Recebimentos ──────────────────────────────────────────
    { card: 'Juros (Recebimentos)',           dax: comMes('[Juros1]') },
  ];
}

async function rodar() {
  carregarEnv();
  const { SB_URL, SB_KEY } = process.env;
  if (!SB_URL || !SB_KEY) throw new Error('Faltam SB_URL / SB_KEY.');

  const arg = process.argv.find(a => a.startsWith('--mes='));
  let mesAno;
  if (arg) {
    mesAno = arg.split('=')[1];
  } else {
    const d = new Date();
    mesAno = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  const [ano, mesNum] = mesAno.split('-').map(Number);
  log(`Sync Comercial PF para ${mesAno} (mês ${mesNum} / ano ${ano})`);

  log('Autenticando...');
  const token = await obterToken();
  log('Token OK', 'ok');

  const cards = daxDeCard(mesNum, ano);

  // Query batch via ROW()
  const cols = cards.map((c, i) => `"c${i}", ${c.dax}`).join(',\n    ');
  const daxFull = `EVALUATE ROW(\n    ${cols}\n)`;

  log(`Executando DAX com ${cards.length} medidas...`);
  let valores;
  try {
    const row = await executarDAX(token, daxFull);
    valores = {};
    cards.forEach((c, i) => {
      const v = row[`[c${i}]`];
      valores[c.card] = v === undefined ? null : v;
    });
    log(`Batch OK (${cards.length} medidas) ✓`, 'ok');
  } catch (err) {
    log('Batch falhou — caindo pra 1-a-1...', 'warn');
    valores = {};
    for (const c of cards) {
      try {
        const row = await executarDAX(token, `EVALUATE ROW("v", ${c.dax})`);
        valores[c.card] = row['[v]'] ?? null;
        log(`  ✓ ${c.card}`, 'ok');
      } catch (e) {
        valores[c.card] = null;
        log(`  ✗ ${c.card} — ${e.response?.data?.error?.code || e.message}`, 'erro');
      }
    }
  }

  log('Gravando no Supabase (chave: powerbi_comercial_pf)...');
  const sb = createClient(SB_URL, SB_KEY);
  const payload = {
    atualizado_em: new Date().toISOString(),
    mes_referencia: mesAno,
    valores,
  };
  const { error } = await sb
    .from('app_storage')
    .upsert({ key: 'powerbi_comercial_pf', value: payload }, { onConflict: 'key' });
  if (error) throw new Error(`Supabase: ${error.message}`);
  log('Gravado ✓', 'ok');

  log('─── RESUMO ───');
  for (const c of cards) {
    const v = valores[c.card];
    const fmt = v === null || v === undefined
      ? '—'
      : (typeof v === 'number' ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : v);
    log(`  ${c.card.padEnd(38)} ${String(fmt).padStart(16)}`);
  }
  log('Sync Comercial PF concluído 🎉', 'ok');
}

rodar().catch((e) => {
  log(`FALHOU: ${e.message}`, 'erro');
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`, 'erro');
  process.exit(1);
});
