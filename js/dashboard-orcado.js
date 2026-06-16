// ==================== DASHBOARD REALIZADO x ORÇADO ====================
// SIMPLES: renderiza dados. Sem Supabase, sem hooks complexos.

const DASHBOARD_ORCADO = {
  orcamento: null,
  categoria_selecionada: 'receitas',
  meses: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  meses_label: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  categorias: ['receitas', 'impostos', 'custos', 'despesas', 'ebitda', 'ebitda_ajustado'],
  categorias_label: { receitas: 'Receitas', impostos: 'Impostos', custos: 'Custos', despesas: 'Despesas', ebitda: 'EBITDA', ebitda_ajustado: 'EBITDA Ajustado' },
};

// RENDERIZAÇÃO: simples e direto
function renderDashboardOrcado() {
  const el = document.getElementById('orcadoView');
  if (!el || typeof dadosFinanceiros === 'undefined') return;

  const real = dadosFinanceiros;
  const orcado = DASHBOARD_ORCADO.orcamento;
  const cat = DASHBOARD_ORCADO.categoria_selecionada;

  if (!real[cat] || real[cat].length === 0) return;

  let html = '<div style="background:white;border-radius:8px;padding:1.5rem;margin-top:1.5rem;border:1px solid #e2e8f0;">';
  html += '<h3 style="margin:0 0 1rem 0;color:#0f3460;">📊 Realizado × Orçado</h3>';

  // Abas de categoria
  html += '<div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">';
  DASHBOARD_ORCADO.categorias.forEach(function(c) {
    const isActive = c === cat;
    html += '<button onclick="DASHBOARD_ORCADO.categoria_selecionada=\'' + c + '\';renderDashboardOrcado()" style="padding:0.4rem 0.8rem;background:' + (isActive ? '#0f3460' : '#e2e8f0') + ';color:' + (isActive ? 'white' : '#1e293b') + ';border:none;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">' + DASHBOARD_ORCADO.categorias_label[c] + '</button>';
  });
  html += '</div>';

  // Tabela
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
  html += '<thead style="background:#f1f5f9;"><tr><th style="padding:0.6rem;text-align:left;border:1px solid #e2e8f0;">Mês</th><th style="padding:0.6rem;text-align:right;border:1px solid #e2e8f0;">Realizado</th>';
  if (orcado && orcado[cat]) {
    html += '<th style="padding:0.6rem;text-align:right;border:1px solid #e2e8f0;">Orçado</th><th style="padding:0.6rem;text-align:right;border:1px solid #e2e8f0;">Desvio %</th><th style="padding:0.6rem;text-align:center;border:1px solid #e2e8f0;">Status</th>';
  }
  html += '</tr></thead><tbody>';

  DASHBOARD_ORCADO.meses.forEach(function(mes, idx) {
    const realizado = (real[cat] || []).reduce(function(s, item) { return s + (item[mes] || 0); }, 0);
    const orcad = (orcado && orcado[cat] && orcado[cat][mes]) || 0;
    const desvio = orcad !== 0 ? ((realizado - orcad) / orcad) * 100 : 0;

    let bgColor = '#ffffff';
    let status = '';
    if (orcad > 0) {
      if (Math.abs(desvio) <= 10) { bgColor = '#d1fae5'; status = '✅'; }
      else if (Math.abs(desvio) <= 20) { bgColor = '#fed7aa'; status = '🟡'; }
      else { bgColor = '#fee2e2'; status = '🔴'; }
    }

    const fc = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    html += '<tr style="background:' + bgColor + ';border-bottom:1px solid #e2e8f0;"><td style="padding:0.6rem;border:1px solid #e2e8f0;">' + DASHBOARD_ORCADO.meses_label[idx] + '</td>';
    html += '<td style="padding:0.6rem;text-align:right;border:1px solid #e2e8f0;font-weight:600;">' + fc(realizado) + '</td>';
    if (orcado && orcado[cat]) {
      html += '<td style="padding:0.6rem;text-align:right;border:1px solid #e2e8f0;">' + fc(orcad) + '</td>';
      html += '<td style="padding:0.6rem;text-align:right;border:1px solid #e2e8f0;font-weight:600;">' + (desvio >= 0 ? '+' : '') + desvio.toFixed(1) + '%</td>';
      html += '<td style="padding:0.6rem;text-align:center;border:1px solid #e2e8f0;">' + status + '</td>';
    }
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

// CARREGA ORÇAMENTO DO XLSX (quando sync roda)
async function carregarOrcadoDoXLSXBytes(arrayBuffer) {
  try {
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = wb.Sheets['Orçamento'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: 0 });
    const headerRow = data[3];
    const colMeses = {};
    const mesesMap = { jan: ['jan'], fev: ['fev'], mar: ['mar'], abr: ['abr'], mai: ['mai'], jun: ['jun'], jul: ['jul'], ago: ['ago'], set: ['set'], out: ['out'], nov: ['nov'], dez: ['dez'] };

    for (let i = 1; i < headerRow.length; i++) {
      const h = (headerRow[i] || '').toString().toLowerCase().trim();
      for (const [mes, aliases] of Object.entries(mesesMap)) {
        for (const alias of aliases) {
          if (h.includes(alias) && !colMeses[mes]) {
            colMeses[mes] = i;
            break;
          }
        }
      }
    }

    const linhasCategoria = { receitas: 4, impostos: 16, custos: 26, despesas: 46, ebitda: 67, ebitda_ajustado: 76 };
    const orcamento = { receitas: {}, impostos: {}, custos: {}, despesas: {}, ebitda: {}, ebitda_ajustado: {} };

    for (const [cat, lineaIdx] of Object.entries(linhasCategoria)) {
      if (data[lineaIdx]) {
        const row = data[lineaIdx];
        for (const [mes, colIdx] of Object.entries(colMeses)) {
          const val = row[colIdx];
          let valNum = 0;
          if (typeof val === 'number') valNum = val;
          else if (typeof val === 'string') {
            const cleaned = val.replace(/[^\d.,\-]/g, '').replace(',', '.');
            valNum = parseFloat(cleaned) || 0;
          }
          if (valNum !== 0) orcamento[cat][mes] = parseFloat((valNum).toFixed(2));
        }
      }
    }

    DASHBOARD_ORCADO.orcamento = orcamento;
    renderDashboardOrcado();
  } catch(e) {
    console.warn('Erro ao carregar orçamento:', e);
  }
}

// Renderiza quando consolidadoInicializar() completa
// (showTab é chamado automaticamente com 'receitas' por padrão)
setTimeout(() => {
  if (typeof showTab === 'function') {
    showTab('receitas');
  }
}, 1000);
