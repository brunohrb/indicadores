// ================================================================
// PRB — PAINEL DO SÓCIO (Lucro Real)
// Texnet — acesso restrito ao perfil 'edicao' + PIN
// ================================================================

const PRB_PIN_KEY  = 'texnet_prb_pin';     // chave no Supabase/localStorage
const PRB_SESSION  = 'texnet_prb_sess';    // flag de sessão (sessionStorage)
let   prbPinOk     = false;
let   prbChart     = null;
let   prbAno       = '2026';

const PRB_MESES_K = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const PRB_MESES_N = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const PRB_MESES_F = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ── Utilidades ───────────────────────────────────────────────────
function prbFC(v) {
  if (v == null || isNaN(v)) return '—';
  const a = Math.abs(v);
  if (a >= 1e6) return (v < 0 ? '-' : '') + 'R$ ' + (a / 1e6).toFixed(2).replace('.', ',') + 'M';
  if (a >= 1e3) return (v < 0 ? '-' : '') + 'R$ ' + (a / 1e3).toFixed(1).replace('.', ',') + 'k';
  return (v < 0 ? '-' : '') + 'R$ ' + a.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function prbFull(v) {
  if (v == null || isNaN(v)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}
function prbSum(arr, key) {
  if (!arr || !arr.length) return 0;
  return arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
}
function prbData(ano) {
  const map = {
    '2023': typeof dadosFinanceiros2023 !== 'undefined' ? dadosFinanceiros2023 : null,
    '2024': typeof dadosFinanceiros2024 !== 'undefined' ? dadosFinanceiros2024 : null,
    '2025': typeof dadosFinanceiros2025 !== 'undefined' ? dadosFinanceiros2025 : null,
    '2026': typeof dadosFinanceiros    !== 'undefined' ? dadosFinanceiros    : null,
  };
  return map[ano] || null;
}

// ── Calcular indicadores PRB para um mês/ano ────────────────────
function prbCalc(ano, mesKey) {
  const d = prbData(ano);
  if (!d) return null;

  const isTotal = (mesKey === 'total');
  const keys    = isTotal ? PRB_MESES_K : [mesKey];

  const soma = (arr) => keys.reduce((s, k) => s + prbSum(arr, k), 0);

  const faturamento = soma(d.receitas);
  const impostos    = soma(d.impostos);
  const custos      = soma(d.custos);
  const despesas    = soma(d.despesas);

  // Pró-Labore separado das despesas
  const proLaboreArr = (d.despesas || []).filter(r => r.nome && r.nome.includes('Pró-Labore'));
  const proLabore    = keys.reduce((s, k) => s + prbSum(proLaboreArr, k), 0);

  // Gastos = custos + despesas (sem pro-labore)
  const gastos = custos + (despesas - proLabore);

  // EBITDA vem do array calculado
  const eaItem = (d.ebitda_ajustado || []).find(r => r.nome && r.nome.includes('Ajustado')) || (d.ebitda_ajustado || [])[0];
  const eItem  = (d.ebitda || [])[0];
  const sumArr = (item) => item ? keys.reduce((s, k) => s + (Number(item[k]) || 0), 0) : 0;

  const ebitda    = eaItem ? sumArr(eaItem) : (eItem ? sumArr(eItem) : (faturamento - impostos - custos - despesas));
  const ebitdaAdj = eaItem ? sumArr(eaItem) : ebitda;

  const caixaMaisProLabore = ebitdaAdj + proLabore;
  const lucroSocio         = ebitdaAdj + proLabore;

  const margem = faturamento > 0 ? (ebitdaAdj / faturamento) : 0;

  return {
    faturamento, impostos, custos, despesas, gastos,
    proLabore, ebitda, ebitdaAdj,
    caixaMaisProLabore, lucroSocio, margem
  };
}

// ────────────────────────────────────────────────────────────────
// PIN — verificação
// ────────────────────────────────────────────────────────────────
async function prbVerificarPin(inputId, erroId) {
  const pin   = document.getElementById(inputId).value.trim();
  const erroEl = document.getElementById(erroId);
  if (!pin) { erroEl.textContent = 'Digite o PIN.'; erroEl.style.display = 'block'; return; }

  erroEl.style.display = 'none';

  // Busca PIN salvo (Supabase via sbStorage, fallback localStorage)
  let pinSalvo = null;
  try { pinSalvo = await sbStorage.get(PRB_PIN_KEY); } catch(e) {}
  if (!pinSalvo) pinSalvo = localStorage.getItem(PRB_PIN_KEY);

  // Se não há PIN cadastrado, aceita qualquer coisa na primeira vez (admin define)
  if (!pinSalvo) {
    // Primeira vez: salva o PIN digitado como padrão
    try { await sbStorage.set(PRB_PIN_KEY, pin); } catch(e) { localStorage.setItem(PRB_PIN_KEY, pin); }
    pinSalvo = pin;
  }

  if (pin === pinSalvo) {
    prbPinOk = true;
    sessionStorage.setItem(PRB_SESSION, '1');
    document.getElementById('prbPinOverlay').style.display = 'none';
    document.getElementById('prbContent').style.display    = 'block';
    prbRender();
  } else {
    erroEl.textContent = '❌ PIN incorreto. Tente novamente.';
    erroEl.style.display = 'block';
    document.getElementById(inputId).value = '';
    document.getElementById(inputId).focus();
  }
}

async function prbAlterarPin() {
  const atual = document.getElementById('prbPinAtual')?.value?.trim();
  const novo  = document.getElementById('prbPinNovo')?.value?.trim();
  const conf  = document.getElementById('prbPinConf')?.value?.trim();
  const erroEl = document.getElementById('prbPinAlterarErro');

  if (!atual || !novo || !conf) { erroEl.textContent = 'Preencha todos os campos.'; erroEl.style.display='block'; return; }
  if (novo !== conf)             { erroEl.textContent = 'Novo PIN e confirmação não coincidem.'; erroEl.style.display='block'; return; }
  if (novo.length < 4)          { erroEl.textContent = 'PIN deve ter pelo menos 4 caracteres.'; erroEl.style.display='block'; return; }

  let pinSalvo = null;
  try { pinSalvo = await sbStorage.get(PRB_PIN_KEY); } catch(e) {}
  if (!pinSalvo) pinSalvo = localStorage.getItem(PRB_PIN_KEY);

  if (pinSalvo && atual !== pinSalvo) { erroEl.textContent = 'PIN atual incorreto.'; erroEl.style.display='block'; return; }

  try { await sbStorage.set(PRB_PIN_KEY, novo); } catch(e) { localStorage.setItem(PRB_PIN_KEY, novo); }

  erroEl.style.color = '#10b981';
  erroEl.textContent = '✅ PIN alterado com sucesso!';
  erroEl.style.display = 'block';
  setTimeout(() => {
    erroEl.style.display = 'none';
    erroEl.style.color = '#dc2626';
    document.getElementById('prbModalPin').style.display = 'none';
    ['prbPinAtual','prbPinNovo','prbPinConf'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  }, 1800);
}

// ────────────────────────────────────────────────────────────────
// RENDER — Dashboard PRB
// ────────────────────────────────────────────────────────────────
function prbRender() {
  // Verifica se sessão ainda está válida
  if (!prbPinOk && !sessionStorage.getItem(PRB_SESSION)) {
    document.getElementById('prbPinOverlay').style.display = 'flex';
    document.getElementById('prbContent').style.display    = 'none';
    return;
  }
  prbPinOk = true;
  document.getElementById('prbPinOverlay').style.display = 'none';
  document.getElementById('prbContent').style.display    = 'block';

  const mesIdx  = parseInt(document.getElementById('prbMesFiltro')?.value ?? '0');
  const mesKey  = PRB_MESES_K[mesIdx];
  const mesNome = PRB_MESES_F[mesIdx];
  const ano     = document.getElementById('prbAnoFiltro')?.value ?? '2026';
  prbAno = ano;

  const calc = prbCalc(ano, mesKey);
  if (!calc) {
    document.getElementById('prbContent').innerHTML = `<div style="padding:3rem;text-align:center;color:#64748b">Dados de ${ano} não disponíveis.</div>`;
    return;
  }

  // ── Label período ──
  const lbl = document.getElementById('prbPeriodoLabel');
  if (lbl) lbl.textContent = mesNome + ' / ' + ano;

  // ── KPIs ──
  const kpis = [
    { id:'prbKpiFat',  val: calc.faturamento,        pct: null },
    { id:'prbKpiGas',  val: calc.gastos,              pct: calc.faturamento > 0 ? calc.gastos/calc.faturamento : null },
    { id:'prbKpiImp',  val: calc.impostos,            pct: calc.faturamento > 0 ? calc.impostos/calc.faturamento : null },
    { id:'prbKpiPL',   val: calc.proLabore,           pct: null },
    { id:'prbKpiEbt',  val: calc.ebitdaAdj,           pct: null },
    { id:'prbKpiLuc',  val: calc.lucroSocio,          pct: calc.faturamento > 0 ? calc.lucroSocio/calc.faturamento : null },
  ];
  kpis.forEach(k => {
    const el = document.getElementById(k.id);
    if (el) el.textContent = prbFull(k.val);
    if (k.pct !== null) {
      const pEl = document.getElementById(k.id + 'Pct');
      if (pEl) pEl.textContent = (k.pct * 100).toFixed(1).replace('.', ',') + '% da receita';
    }
  });

  // ── Margem badge ──
  const margEl = document.getElementById('prbMargem');
  if (margEl) {
    const pct = (calc.margem * 100);
    const color = pct >= 35 ? '#10b981' : pct >= 25 ? '#f59e0b' : '#ef4444';
    margEl.innerHTML = `<span style="color:${color};font-weight:700">Margem EBITDA: ${pct.toFixed(1).replace('.',',')}%</span>`;
  }

  // ── Tabela mensal ──
  prbRenderTabela(ano);

  // ── Gráfico ──
  prbRenderChart(ano);
}

function prbRenderTabela(ano) {
  const tbl = document.getElementById('prbTabelaBody');
  if (!tbl) return;

  const d = prbData(ano);
  if (!d) { tbl.innerHTML = '<tr><td colspan="14" style="text-align:center;color:#94a3b8">Sem dados</td></tr>'; return; }

  const rows = [
    { label: '💰 Faturamento',        key: 'faturamento', color: '#2563eb', bold: true },
    { label: '📉 Gastos (Cust+Desp)', key: 'gastos',      color: '#ef4444', bold: false },
    { label: '🏛️ Impostos',           key: 'impostos',    color: '#f97316', bold: false },
    { label: '👔 Pró-Labore',         key: 'proLabore',   color: '#06b6d4', bold: false },
    { label: '📊 EBITDA Ajustado',    key: 'ebitdaAdj',   color: '#10b981', bold: true },
    { label: '🏆 Lucro Sócio',        key: 'lucroSocio',  color: '#8b5cf6', bold: true },
  ];

  tbl.innerHTML = rows.map(row => {
    const cells = PRB_MESES_K.map(mk => {
      const c = prbCalc(ano, mk);
      if (!c) return '<td class="prb-td-val">—</td>';
      const v = c[row.key];
      const colored = v < 0 ? 'color:#ef4444' : (row.bold ? `color:${row.color}` : '');
      return `<td class="prb-td-val" style="${colored}">${prbFC(v)}</td>`;
    }).join('');

    const total = prbCalc(ano, 'total');
    const totalV = total ? total[row.key] : 0;
    const totalColor = totalV < 0 ? 'color:#ef4444' : `color:${row.color}`;
    const fw = row.bold ? 'font-weight:700' : '';

    return `<tr class="prb-tr">
      <td class="prb-td-label" style="color:${row.color};${fw}">${row.label}</td>
      ${cells}
      <td class="prb-td-total" style="${totalColor};${fw}">${prbFull(totalV)}</td>
    </tr>`;
  }).join('');
}

function prbRenderChart(ano) {
  const ctx = document.getElementById('prbChartCanvas');
  if (!ctx) return;

  const d = prbData(ano);
  if (!d) return;

  const fatMensal  = PRB_MESES_K.map(mk => prbCalc(ano, mk)?.faturamento  || 0);
  const gasMensal  = PRB_MESES_K.map(mk => prbCalc(ano, mk)?.gastos       || 0);
  const lucMensal  = PRB_MESES_K.map(mk => prbCalc(ano, mk)?.lucroSocio   || 0);

  if (prbChart) { prbChart.destroy(); prbChart = null; }

  prbChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: PRB_MESES_N,
      datasets: [
        { label: 'Faturamento',   data: fatMensal, backgroundColor: 'rgba(37,99,235,0.65)',  order: 2, borderRadius: 4 },
        { label: 'Gastos+Impos.', data: gasMensal, backgroundColor: 'rgba(239,68,68,0.65)',  order: 2, borderRadius: 4 },
        { label: 'Lucro Sócio',   data: lucMensal, type: 'line', borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)', pointRadius: 5, pointBackgroundColor: '#10b981',
          tension: 0.35, fill: true, order: 1, borderWidth: 2.5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ' ' + prbFull(ctx.raw) } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => 'R$' + Math.round(v / 1000) + 'k', font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// ── Filtros disparam re-render ────────────────────────────────────
window.prbFiltrar = function() { prbRender(); };

// ── Logout da sessão PRB (mas não do sistema) ──────────────────────
window.prbLock = function() {
  prbPinOk = false;
  sessionStorage.removeItem(PRB_SESSION);
  if (prbChart) { prbChart.destroy(); prbChart = null; }
  document.getElementById('prbPinInput').value = '';
  document.getElementById('prbPinErro').style.display = 'none';
  document.getElementById('prbPinOverlay').style.display = 'flex';
  document.getElementById('prbContent').style.display    = 'none';
};

// ── Exportar CSV ───────────────────────────────────────────────────
window.prbExportarCSV = function() {
  const ano = document.getElementById('prbAnoFiltro')?.value ?? '2026';
  const headers = ['Indicador', ...PRB_MESES_N, 'Total'];
  const rows = [
    ['Faturamento',  ...PRB_MESES_K.map(k => prbCalc(ano,k)?.faturamento||0), prbCalc(ano,'total')?.faturamento||0],
    ['Gastos',       ...PRB_MESES_K.map(k => prbCalc(ano,k)?.gastos||0),      prbCalc(ano,'total')?.gastos||0],
    ['Impostos',     ...PRB_MESES_K.map(k => prbCalc(ano,k)?.impostos||0),    prbCalc(ano,'total')?.impostos||0],
    ['Pro-Labore',   ...PRB_MESES_K.map(k => prbCalc(ano,k)?.proLabore||0),   prbCalc(ano,'total')?.proLabore||0],
    ['EBITDA Aj.',   ...PRB_MESES_K.map(k => prbCalc(ano,k)?.ebitdaAdj||0),   prbCalc(ano,'total')?.ebitdaAdj||0],
    ['Lucro Socio',  ...PRB_MESES_K.map(k => prbCalc(ano,k)?.lucroSocio||0),  prbCalc(ano,'total')?.lucroSocio||0],
  ];
  const csv = [headers, ...rows].map(r => r.map(v => typeof v === 'number' ? v.toFixed(2).replace('.',',') : v).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `PRB_Texnet_${ano}.csv`; a.click();
};