#!/usr/bin/env node
// =====================================================
// Power BI Reajustes → Supabase Sync
// Dataset DEDICADO: "Dashboard de Reajustes" — workspace Diretoria.
// Tem tabela fReajustes com Valor_Reajustado + dFilial[Tipo_Pessoa].
// Grava em powerbi_reajustes_YYYY-MM e powerbi_reajustes (atalho).
// Frontend já lê e mescla com Diretoria.
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
  const workspace = process.env.PBI_WORKSPACE_REAJUSTES || process.env.PBI_WORKSPACE_ID;
  const dataset = process.env.PBI_DATASET_REAJUSTES;
  const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspace}/datasets/${dataset}/executeQueries`;
  const { data } = await axios.post(
    url,
    { queries: [{ query: dax }], serializerSettings: { includeNulls: true } },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  return data.results?.[0]?.tables?.[0]?.rows?.[0] || {};
}

function daxDeCard(mesNum, ano) {
  // PB Diretoria mostra o reajuste com OFFSET de -1 mês:
  // - Sync direto de março ([Reajuste - Valor Aplicado]) → PF 3.895,33 / PJ 351,86
  // - PB Diretoria abril → PF 3.895,88 / PJ 354,02 (BATE!)
  // Então quando o user pede X, consultamos a aplicação do mês X-1.
  // (Tentamos [Reajuste Recebido no Mes] + dCalendario Pagamento — não bateu.)
  let mesAplicacao = mesNum - 1;
  let anoAplicacao = ano;
  if (mesAplicacao < 1) { mesAplicacao = 12; anoAplicacao = ano - 1; }
  const filtroMes = `'dCalendário'[Ano] = ${anoAplicacao}, 'dCalendário'[NumeroMes] = ${mesAplicacao}`;
  // Listas de filial_id confirmadas (mesmas usadas no sync Diretoria)
  const FILIAIS_PF = '{1, 2, 3, 5, 10, 20, 22, 26, 27, 28, 29, 43, 45, 47}';
  const FILIAIS_PJ = '{12, 13, 14, 16, 17, 18, 19, 21, 31, 33, 35, 37, 39}';

  return [
    // [Reajuste - Valor Aplicado] do mês ANTERIOR. Valor segmentado por filial_id.
    { card: 'Reajuste Contratos PF',
      dax: `CALCULATE([Reajuste - Valor Aplicado], ${filtroMes}, FILTER('fReajustes', 'fReajustes'[filial_id] IN ${FILIAIS_PF}))` },
    { card: 'Reajuste Contratos PJ',
      dax: `CALCULATE([Reajuste - Valor Aplicado], ${filtroMes}, FILTER('fReajustes', 'fReajustes'[filial_id] IN ${FILIAIS_PJ}))` },
    { card: 'Reajuste Valor Aplicado Total',
      dax: `CALCULATE([Reajuste - Valor Aplicado], ${filtroMes})` },
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
  const lista = v.split(',').map(s => s.trim()).filter(Boolean);
  for (const m of lista) {
    if (!/^\d{4}-\d{2}$/.test(m)) {
      throw new Error(`Mês inválido: "${m}". Use YYYY-MM, lista, ou last:N.`);
    }
  }
  return lista;
}

async function rodar() {
  carregarEnv();
  const { SB_URL, SB_KEY } = process.env;
  if (!SB_URL || !SB_KEY) throw new Error('Faltam SB_URL / SB_KEY.');

  const meses = resolverMeses();
  log(`Sync Reajustes de ${meses.length} mês(es): ${meses.join(', ')}`);

  log('Autenticando...');
  const token = await obterToken();
  log('Token OK', 'ok');

  const sb = createClient(SB_URL, SB_KEY);

  // Lê meses fechados (compartilha com Diretoria — usa mesmo "fechar mês")
  let mesesFechados = [];
  try {
    const { data } = await sb.from('app_storage').select('value').eq('key', 'powerbi_diretoria_meses_fechados').maybeSingle();
    if (data && data.value) {
      const v = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      mesesFechados = Array.isArray(v) ? v : [];
    }
  } catch (e) { log(`Aviso lendo meses_fechados: ${e.message}`, 'warn'); }
  if (mesesFechados.length) log(`Meses fechados (não sobrescritos): ${mesesFechados.join(', ')}`);

  let mesesDisponiveis = [];
  try {
    const { data } = await sb.from('app_storage').select('value').eq('key', 'powerbi_reajustes_meses_disponiveis').maybeSingle();
    if (data && data.value) {
      const v = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      mesesDisponiveis = (Array.isArray(v) ? v : []).filter(m => /^\d{4}-\d{2}$/.test(m));
    }
  } catch (e) { /* ignore */ }

  // Limpa rows lixo
  try {
    const { data: rows } = await sb.from('app_storage').select('key').like('key', 'powerbi_reajustes_%');
    if (rows) {
      const lixo = rows.map(r => r.key).filter(k => {
        if (k === 'powerbi_reajustes_meses_disponiveis') return false;
        return !/^powerbi_reajustes_\d{4}-\d{2}$/.test(k);
      });
      if (lixo.length) {
        log(`Limpando ${lixo.length} chave(s) lixo: ${lixo.join(', ')}`, 'warn');
        await sb.from('app_storage').delete().in('key', lixo);
      }
    }
  } catch (e) { log(`Aviso limpando lixo: ${e.message}`, 'warn'); }

  let valoresMaisRecente = null;
  let mesMaisRecente = null;

  for (const mesAno of meses) {
    if (mesesFechados.includes(mesAno)) {
      log(`Mês ${mesAno} já está FECHADO — pulando.`, 'warn');
      continue;
    }
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
          log(`  ✓ ${c.card}`, 'ok');
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
    const { error: ePm } = await sb.from('app_storage').upsert({ key: `powerbi_reajustes_${mesAno}`, value: payload }, { onConflict: 'key' });
    if (ePm) throw new Error(`Supabase ${mesAno}: ${ePm.message}`);
    log(`  Gravado em powerbi_reajustes_${mesAno} ✓`, 'ok');

    if (!mesesDisponiveis.includes(mesAno)) mesesDisponiveis.push(mesAno);
    valoresMaisRecente = payload;
    mesMaisRecente = mesAno;

    log('  ─── RESUMO ───');
    for (const c of cards) {
      const v = valores[c.card];
      const fmt = v === null || v === undefined
        ? '—'
        : (typeof v === 'number' ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : v);
      log(`    ${c.card.padEnd(30)} ${String(fmt).padStart(16)}`);
    }
  }

  if (valoresMaisRecente) {
    const { error } = await sb.from('app_storage').upsert({ key: 'powerbi_reajustes', value: valoresMaisRecente }, { onConflict: 'key' });
    if (error) throw new Error(`Supabase (compat): ${error.message}`);
    log(`Atalho powerbi_reajustes → ${mesMaisRecente} ✓`, 'ok');
  }

  mesesDisponiveis.sort();
  await sb.from('app_storage').upsert({
    key: 'powerbi_reajustes_meses_disponiveis',
    value: JSON.stringify(mesesDisponiveis),
  }, { onConflict: 'key' });

  log('Sync Reajustes concluído 🎉', 'ok');
}

rodar().catch((e) => {
  log(`FALHOU: ${e.message}`, 'erro');
  if (e.response?.data) log(`Resposta: ${JSON.stringify(e.response.data, null, 2)}`, 'erro');
  process.exit(1);
});
