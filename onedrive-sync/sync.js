// Sync XLSX do OneDrive → Supabase app_storage.consolidado_dados
// Replica a lógica de js/consolidado.js (consolidadoProcessarXlsxBytes).
// Roda em GitHub Actions a cada 2h (07h-21h BRT).

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const SB_URL = process.env.SB_URL;
const SB_KEY = process.env.SB_KEY;
if (!SB_URL || !SB_KEY) {
  console.error('SB_URL e SB_KEY são obrigatórios');
  process.exit(1);
}
const EDGE_URL = SB_URL + '/functions/v1/fluxo-caixa-download';

const sb = createClient(SB_URL, SB_KEY);

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();

const SECTIONS = {
  'receitas':'receitas', 'impostos':'impostos', 'custos':'custos',
  'despesas operac.':'despesas', 'despesas financ.':'despesas', 'ebitda':'ebitda_section'
};
const STOP_SECTIONS = new Set(['ajustes de caixa','saidas','entradas']);
const SKIP_ROWS = new Set(['desembolsos','receitas','custos','impostos','despesas operac.','despesas financ.']);
const EBITDA_AJ_STARTS = ['inclusao','irpj (previsao)','cssl (previsao)','trimestral',
  'compra de provedor','ajuste (postes)','ajuste vtal fora','credito icms',
  'ajuste (mark/equip)','datora','ebitda (ajustado)'];
const AJUSTES_NAMES = new Set(['investimento','compra de veiculos',
  'invest. tecnico e administrativo','aq. de provedor','empr/finac/parcel',
  'investimentos pop','emprestimos para giro','reneg. debitos','socios ou retiradas']);

// Extrai o bloco "Geração de Caixa / Saldos" (Geração de Caixa → Sald Final).
// Espelha js/consolidado.js > parseCaixaBlock.
function parseCaixaBlock(rows, headerIdx, colMeses) {
  const out = [];
  let started = false;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const nomeRaw = typeof row[0] === 'string' ? row[0].trim() : '';
    if (!nomeRaw) continue;
    const n = norm(nomeRaw);
    if (!started) {
      if (n === 'geracao de caixa') started = true;
      else continue;
    }
    const item = { nome: nomeRaw };
    MESES.forEach(m => {
      const v = row[colMeses[m]];
      item[m] = typeof v === 'number' ? Math.round(v * 100) / 100 : 0;
    });
    item.total = Math.round(MESES.reduce((s, m) => s + (item[m] || 0), 0) * 100) / 100;
    out.push(item);
    if (n === 'sald final' || n === 'saldo final') break;
  }
  return out;
}

async function main() {
  console.log('[1/4] Lendo consolidado_dados atual do Supabase...');
  const { data: row, error: errRead } = await sb
    .from('app_storage').select('value').eq('key', 'consolidado_dados').maybeSingle();
  if (errRead) throw errRead;
  if (!row || !row.value) {
    throw new Error('consolidado_dados não existe no Supabase. Use o botão "Sync OneDrive" no dashboard pelo menos 1x antes pra criar a estrutura.');
  }
  const dados = JSON.parse(row.value);

  console.log('[2/4] Baixando XLSX da Edge Function...');
  const resp = await fetch(EDGE_URL, { headers: { 'apikey': SB_KEY } });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '<sem corpo>');
    throw new Error(`Edge function HTTP ${resp.status}: ${body.slice(0, 800)}`);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 100) throw new Error('XLSX vazio (' + buf.length + ' bytes)');
  console.log('  ↓ ' + buf.length + ' bytes');

  console.log('[3/4] Parseando XLSX...');
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames.find(s => s.toLowerCase().includes('anual real')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: 0 });

  let headerIdx = -1;
  const colMeses = {};
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    rows[i].forEach((cel, ci) => {
      if (typeof cel === 'string') {
        const c = norm(cel).slice(0, 3);
        if (MESES.includes(c)) { colMeses[c] = ci; headerIdx = i; }
      }
    });
    if (Object.keys(colMeses).length >= 6) break;
  }
  if (headerIdx < 0) throw new Error('Colunas de meses não encontradas na aba "' + sheetName + '"');
  console.log('  aba: "' + sheetName + '" | meses: ' + Object.keys(colMeses).join(','));

  const itemIdx = {};
  ['receitas','impostos','custos','despesas','ebitda','ebitda_ajustado','ajustes'].forEach(cat => {
    (dados[cat] || []).forEach(item => { itemIdx[item.nome] = item; });
  });

  let cur = null, stopped = false, atualizados = 0;
  const ebitdaValuesRow = {};

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const nomeRaw = typeof r[0] === 'string' ? r[0].trim() : '';
    if (!nomeRaw) continue;
    const n = norm(nomeRaw);

    const v0 = r[Object.values(colMeses)[0]];
    if (typeof v0 === 'number' && v0 !== 0 && Math.abs(v0) < 2) continue;

    if (STOP_SECTIONS.has(n)) { stopped = true; continue; }
    if (stopped) continue;
    if (n in SECTIONS) { cur = SECTIONS[n]; continue; }
    if (!cur || SKIP_ROWS.has(n)) continue;

    if (n === 'ebitda' && cur === 'ebitda_section') {
      const v = r[colMeses['jan']];
      if (typeof v === 'number' && v > 100000) {
        MESES.forEach(m => {
          ebitdaValuesRow[m] = typeof r[colMeses[m]] === 'number' ? Math.round(r[colMeses[m]] * 100) / 100 : 0;
        });
        continue;
      }
    }

    const item = itemIdx[nomeRaw];
    if (!item) continue;

    MESES.forEach(m => {
      const v = r[colMeses[m]];
      item[m] = typeof v === 'number' ? Math.round(v * 100) / 100 : 0;
    });
    item.total = Math.round(MESES.reduce((s, m) => s + (item[m] || 0), 0) * 100) / 100;
    atualizados++;
  }

  const ebitdaItem = itemIdx['EBITDA'];
  if (ebitdaItem && Object.keys(ebitdaValuesRow).length > 0) {
    MESES.forEach(m => { ebitdaItem[m] = ebitdaValuesRow[m] || 0; });
    ebitdaItem.total = Math.round(MESES.reduce((s, m) => s + (ebitdaItem[m] || 0), 0) * 100) / 100;
    atualizados++;
  }

  let inSaidas = false;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    const n = norm(String(r[0]).trim());
    if (n === 'ajustes de caixa' || n === 'saidas') { inSaidas = true; continue; }
    if (n === 'entradas' || n === 'geracao de caixa') { inSaidas = false; continue; }
    if (!inSaidas || !AJUSTES_NAMES.has(n)) continue;
    const item = itemIdx[String(r[0]).trim()];
    if (!item) continue;
    MESES.forEach(m => {
      const v = r[colMeses[m]];
      item[m] = typeof v === 'number' ? Math.round(v * 100) / 100 : 0;
    });
    item.total = Math.round(MESES.reduce((s, m) => s + (item[m] || 0), 0) * 100) / 100;
    atualizados++;
  }

  console.log('  ✓ ' + atualizados + ' itens atualizados');

  // ===== Seção "Geração de Caixa / Saldos" (linhas ~104-129 da Anual Real) =====
  dados.caixa = parseCaixaBlock(rows, headerIdx, colMeses);
  console.log('  ✓ Caixa/Saldos: ' + dados.caixa.length + ' linhas');

  console.log('[4/4] Salvando consolidado_dados no Supabase...');
  const { error: errSet } = await sb.from('app_storage').upsert({
    key: 'consolidado_dados',
    value: JSON.stringify(dados),
    updated_at: new Date().toISOString()
  }, { onConflict: 'key' });
  if (errSet) throw errSet;

  console.log('✅ Sync OneDrive concluído — ' + atualizados + ' itens em ' + new Date().toISOString());
}

main().catch(err => {
  console.error('❌ ERRO:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
