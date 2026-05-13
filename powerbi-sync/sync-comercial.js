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

async function executarDAX(token, dax, tentativa = 1) {
  const { PBI_WORKSPACE_COMERCIAL, PBI_DATASET_COMERCIAL } = process.env;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${PBI_WORKSPACE_COMERCIAL}/datasets/${PBI_DATASET_COMERCIAL}/executeQueries`;
  try {
    const { data } = await axios.post(
      url,
      { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 }
    );
    return data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
  } catch (e) {
    if (e.response?.status === 429 && tentativa <= 5) {
      const espera = Math.min(60, 5 * Math.pow(2, tentativa - 1));
      log(`  Rate limit (429), aguardando ${espera}s — tentativa ${tentativa + 1}/6`, 'warn');
      await new Promise(r => setTimeout(r, espera * 1000));
      return executarDAX(token, dax, tentativa + 1);
    }
    throw e;
  }
}

async function dormir(ms) { return new Promise(r => setTimeout(r, ms)); }

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

    // ─── Reajuste (testando — usuário acha que tá no dataset Comercial PF) ──
    // Dashboard de Reajustes tem coluna Tipo_Pessoa filtrável. Tenta direto.
    // Se a tabela 'Reajustes' não existir aqui, o batch falha → fallback one-by-one
    // → essa medida vira null mas as outras seguem.
    { card: 'Reajuste Contratos PF',
      dax: `CALCULATE(SUM('Reajustes'[Valor_Reajustado]), ${filtroMes}, 'Reajustes'[Tipo_Pessoa] = "Física")` },
    { card: 'Reajuste Contratos PJ',
      dax: `CALCULATE(SUM('Reajustes'[Valor_Reajustado]), ${filtroMes}, 'Reajustes'[Tipo_Pessoa] IN {"Jurídica", "E"})` },
  ];
}

function resolverMeses() {
  const arg = process.argv.find(a => a.startsWith('--mes=') || a.startsWith('--meses='));
  const v = arg ? arg.split('=')[1] : '';
  if (!v) {
    const d = new Date();
    return [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`];
  }
  if (v.startsWith('last:')) {
    const n = parseInt(v.split(':')[1], 10) || 1;
    const out = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
      out.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`);
    }
    return out;
  }
  if (v.startsWith('since:')) {
    const inicio = v.split(':')[1];
    if (!/^\d{4}-\d{2}$/.test(inicio)) throw new Error(`since: precisa de YYYY-MM, recebi "${inicio}"`);
    const [anoIni, mesIni] = inicio.split('-').map(Number);
    const hoje = new Date();
    const out = [];
    let cur = new Date(anoIni, mesIni - 1, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    while (cur <= fim) {
      out.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return out;
  }
  const lista = v.split(',').map(s => s.trim()).filter(Boolean);
  for (const m of lista) {
    if (!/^\d{4}-\d{2}$/.test(m)) {
      throw new Error(`Mês inválido: "${m}". Use YYYY-MM, lista, last:N, ou since:YYYY-MM.`);
    }
  }
  return lista;
}

async function rodar() {
  carregarEnv();
  const { SB_URL, SB_KEY } = process.env;
  if (!SB_URL || !SB_KEY) throw new Error('Faltam SB_URL / SB_KEY.');

  const meses = resolverMeses();
  log(`Sync Comercial PF de ${meses.length} mês(es): ${meses.join(', ')}`);

  log('Autenticando...');
  const token = await obterToken();
  log('Token OK', 'ok');

  const sb = createClient(SB_URL, SB_KEY);

  // Lê meses fechados
  let mesesFechados = [];
  try {
    const { data } = await sb.from('app_storage').select('value').eq('key', 'powerbi_comercial_pf_meses_fechados').maybeSingle();
    if (data && data.value) {
      const v = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      mesesFechados = Array.isArray(v) ? v : [];
    }
  } catch (e) { log(`Aviso lendo meses_fechados: ${e.message}`, 'warn'); }
  if (mesesFechados.length) log(`Meses fechados (não sobrescritos): ${mesesFechados.join(', ')}`);

  // Lê + filtra meses disponíveis
  let mesesDisponiveis = [];
  try {
    const { data } = await sb.from('app_storage').select('value').eq('key', 'powerbi_comercial_pf_meses_disponiveis').maybeSingle();
    if (data && data.value) {
      const v = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      mesesDisponiveis = (Array.isArray(v) ? v : []).filter(m => /^\d{4}-\d{2}$/.test(m));
    }
  } catch (e) { /* ignore */ }

  // Limpa rows lixo
  try {
    const { data: rows } = await sb.from('app_storage').select('key').like('key', 'powerbi_comercial_pf_%');
    if (rows) {
      const lixo = rows.map(r => r.key).filter(k => {
        if (k === 'powerbi_comercial_pf_meses_fechados') return false;
        if (k === 'powerbi_comercial_pf_meses_disponiveis') return false;
        if (k.startsWith('powerbi_comercial_pf_fechado_')) return !/^powerbi_comercial_pf_fechado_\d{4}-\d{2}$/.test(k);
        return !/^powerbi_comercial_pf_\d{4}-\d{2}$/.test(k);
      });
      if (lixo.length) {
        log(`Limpando ${lixo.length} chave(s) lixo: ${lixo.join(', ')}`, 'warn');
        await sb.from('app_storage').delete().in('key', lixo);
      }
    }
  } catch (e) { log(`Aviso limpando lixo: ${e.message}`, 'warn'); }

  let valoresMaisRecente = null;
  let mesMaisRecente = null;

  for (let i = 0; i < meses.length; i++) {
    const mesAno = meses[i];
    if (mesesFechados.includes(mesAno)) {
      log(`Mês ${mesAno} já está FECHADO — pulando.`, 'warn');
      continue;
    }
    if (i > 0) await dormir(1500);
    const [ano, mesNum] = mesAno.split('-').map(Number);
    log(`─── ${mesAno} ───`);
    const cards = daxDeCard(mesNum, ano);

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
      log(`  Batch OK ✓`, 'ok');
    } catch (err) {
      log('Batch falhou — caindo pra 1-a-1...', 'warn');
      valores = {};
      for (const c of cards) {
        try {
          const row = await executarDAX(token, `EVALUATE ROW("v", ${c.dax})`);
          valores[c.card] = row['[v]'] ?? null;
        } catch (e) {
          valores[c.card] = null;
          log(`  ✗ ${c.card} — ${e.response?.data?.error?.code || e.message}`, 'erro');
        }
      }
    }

    const payload = {
      atualizado_em: new Date().toISOString(),
      mes_referencia: mesAno,
      valores,
    };
    const { error: ePm } = await sb.from('app_storage').upsert({ key: `powerbi_comercial_pf_${mesAno}`, value: payload }, { onConflict: 'key' });
    if (ePm) throw new Error(`Supabase ${mesAno}: ${ePm.message}`);
    log(`  Gravado em powerbi_comercial_pf_${mesAno} ✓`, 'ok');

    if (!mesesDisponiveis.includes(mesAno)) mesesDisponiveis.push(mesAno);
    valoresMaisRecente = payload;
    mesMaisRecente = mesAno;
  }

  // Atalho compat
  if (valoresMaisRecente) {
    const { error } = await sb.from('app_storage').upsert({ key: 'powerbi_comercial_pf', value: valoresMaisRecente }, { onConflict: 'key' });
    if (error) throw new Error(`Supabase (compat): ${error.message}`);
    log(`Atalho powerbi_comercial_pf → ${mesMaisRecente} ✓`, 'ok');
  }

  mesesDisponiveis.sort();
  await sb.from('app_storage').upsert({
    key: 'powerbi_comercial_pf_meses_disponiveis',
    value: JSON.stringify(mesesDisponiveis),
  }, { onConflict: 'key' });

  log('Sync Comercial PF concluído 🎉', 'ok');
}

rodar().catch((e) => {
  log(`FALHOU: ${e.message}`, 'erro');
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`, 'erro');
  process.exit(1);
});
