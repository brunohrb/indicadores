// ==================== DASHBOARD REALIZADO x ORÇADO ====================
// Comparativo mensal: visualização caprichada com cards, gráficos e heatmap

const DASHBOARD_ORCADO = {
  orcamento: null,
  meses: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  meses_label: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  categorias: ['receitas', 'impostos', 'custos', 'despesas', 'ebitda'],
};

// Helper: formata moeda (fallback se formatCurrency não estiver disponível)
function formatCurrencyLocal(valor) {
  if (typeof window.formatCurrency === 'function') {
    return window.formatCurrency(valor);
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

// Função wrapper pra upload
async function uploadOrcadoAndOpen() {
  const fileInput = document.getElementById('uploadOrcado');
  const file = fileInput.files[0];
  if (!file) {
    alert('❌ Nenhum arquivo selecionado');
    return;
  }

  try {
    console.log('📂 Carregando arquivo:', file.name);
    const orcado = await carregarOrcadoDoXLSX(file);

    if (!orcado) {
      alert('❌ Erro ao processar o arquivo - orcado é null');
      return;
    }

    // Verifica se tem dados
    const temDados = Object.values(orcado).some(cat => Object.keys(cat).length > 0);
    if (!temDados) {
      alert('❌ Nenhum dado de orçamento encontrado no arquivo.\n\nVerifique se a aba "Anual - Orçamento 2026" existe e tem dados.');
      return;
    }

    console.log('✅ Orçamento carregado:', orcado);
    document.getElementById('btnDashOrcado').style.display = 'block';
    abrirDashboardOrcado();
    alert('✅ Orçamento carregado com sucesso!');
  } catch(e) {
    console.error('❌ Erro:', e);
    alert('❌ Erro: ' + e.message);
  }
  fileInput.value = '';
}

// Parseia o orçamento do XLSX — aba "Orçamento"
async function carregarOrcadoDoXLSX(arquivo) {
  try {
    const arrayBuffer = await arquivo.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('📊 Abas encontradas:', wb.SheetNames);

    const orcamento = {
      receitas: {}, impostos: {}, custos: {}, despesas: {}, ebitda: {}
    };

    // Lê aba "Orçamento"
    const abaTarget = 'Orçamento';
    const sheet = wb.Sheets[abaTarget];

    if (!sheet) {
      console.error('❌ Aba "Orçamento" não encontrada');
      return null;
    }

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`📋 Aba "Orçamento" tem ${data.length} linhas`);

    // Linha 4 (índice 3) tem os meses: Jan, Fev, Mar, Abr, Mai, Jun, JUL, AGO, SET
    const headerRow = data[3];
    console.log('📅 Header:', headerRow);

    const colMeses = {};
    const mesesEsperados = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    let colIdx = 1; // começa em col B (índice 1)

    for (let i = 1; i < Math.min(13, headerRow.length); i++) {
      const h = headerRow[i];
      if (h && typeof h === 'string') {
        const hLower = h.toLowerCase().trim();
        // Procura o mês correspondente
        for (let m = 0; m < mesesEsperados.length; m++) {
          if (hLower.includes(mesesEsperados[m]) || hLower.includes(mesesEsperados[m].substring(0, 3))) {
            colMeses[DASHBOARD_ORCADO.meses[m]] = i;
            console.log(`  ${DASHBOARD_ORCADO.meses[m]} → col ${i} (${h})`);
            break;
          }
        }
      }
    }

    console.log('✅ Colunas mapeadas:', colMeses);

    // Itera pelas linhas (a partir da linha 5, índice 4)
    let countValores = 0;
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      const nomeRaw = row?.[0];
      if (!nomeRaw || typeof nomeRaw !== 'string') continue;

      const nome = nomeRaw.toLowerCase().trim();

      // Detecta categoria
      let categoria = null;
      if (nome.includes('receita')) categoria = 'receitas';
      else if (nome.includes('imposto') || nome.includes('icms') || nome.includes('cofins') ||
               nome.includes('pis') || nome.includes('irpj') || nome.includes('csll') ||
               nome.includes('iss') || nome.includes('fust')) categoria = 'impostos';
      else if (nome.includes('custo') || nome.includes('kit') || nome.includes('material') ||
               nome.includes('vtal') || nome.includes('folha') || nome.includes('link') ||
               nome.includes('aluguel') || nome.includes('comissão') || nome.includes('combustível')) categoria = 'custos';
      else if (nome.includes('despesa') || nome.includes('marketing') || nome.includes('serv') ||
               nome.includes('pró') || nome.includes('sistema') || nome.includes('tarifa') ||
               nome.includes('taxa')) categoria = 'despesas';
      else if (nome.includes('ebitda')) categoria = 'ebitda';

      if (categoria) {
        // Lê valores dos meses
        Object.entries(colMeses).forEach(([mes, col]) => {
          const val = row[col];
          if (typeof val === 'number' && val !== 0) {
            if (!orcamento[categoria][mes]) orcamento[categoria][mes] = 0;
            orcamento[categoria][mes] += val;
            countValores++;
          }
        });
      }
    }

    console.log(`✅ ${countValores} valores de orçamento carregados`);
    DASHBOARD_ORCADO.orcamento = orcamento;
    return orcamento;
  } catch(e) {
    console.error('❌ Erro ao carregar orçamento:', e);
    throw e;
  }
}

// Renderiza dashboard visual: Real vs Orçado
function renderDashboardOrcado() {
  if (!DASHBOARD_ORCADO.orcamento) {
    document.getElementById('orcadoView').innerHTML = '<div style="padding: 2rem; text-align: center; color: #94a3b8;"><div style="font-size: 3rem; margin-bottom: 1rem;">📊</div><h2>Nenhum orçamento carregado</h2><p>Use o botão "📁 Carregar Orçamento" para fazer upload do XLSX</p></div>';
    return;
  }

  const real = dadosFinanceiros;
  const orcado = DASHBOARD_ORCADO.orcamento;

  let html = '<div style="padding: 2rem;">';
  html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;"><h1 style="margin: 0; color: #0f3460;">📊 Dashboard — Realizado × Orçado</h1><button onclick="fecharDashboardOrcado()" style="padding: 0.5rem 1rem; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">✕ Fechar</button></div>';

  // Resumo Trimestral
  html += '<div style="background: linear-gradient(135deg, #0f3460, #1a1a2e); color: white; border-radius: 16px; padding: 2rem; margin-bottom: 2rem;"><h2 style="margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem;">💡 Resumo Desvios Q2+Q3</h2>';
  html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">';

  DASHBOARD_ORCADO.categorias.forEach(cat => {
    const meses_trim = ['abr', 'mai', 'jun', 'jul', 'ago', 'set'];
    let somaReal = 0, somaOrcado = 0;

    meses_trim.forEach(mes => {
      const items = real[cat] || [];
      const totalMes = items.reduce((sum, item) => sum + (item[mes] || 0), 0);
      somaReal += totalMes;
      somaOrcado += (orcado[cat]?.[mes] || 0);
    });

    const desvio = somaReal - somaOrcado;
    const desvio_pct = somaOrcado !== 0 ? ((desvio / somaOrcado) * 100) : 0;
    const status = Math.abs(desvio_pct) <= 10 ? 'ok' : Math.abs(desvio_pct) <= 20 ? 'alerta' : 'critico';
    const cor_bg = status === 'ok' ? 'rgba(16, 185, 129, 0.15)' : status === 'alerta' ? 'rgba(251, 146, 60, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    const cor_borda = status === 'ok' ? '#10b981' : status === 'alerta' ? '#fb923c' : '#ef4444';

    html += '<div style="background: ' + cor_bg + '; border-radius: 12px; padding: 1.5rem; border-left: 4px solid ' + cor_borda + '">';
    html += '<div style="font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">' + cat.toUpperCase() + '</div>';
    html += '<div style="font-size: 1rem; margin-bottom: 0.5rem;"><div>Real: <strong>' + formatCurrencyLocal(somaReal) + '</strong></div>';
    html += '<div>Orçado: <strong>' + formatCurrencyLocal(somaOrcado) + '</strong></div></div>';
    html += '<div style="font-size: 1.1rem; font-weight: 700;">' + (desvio >= 0 ? '↑ +' : '↓ ') + Math.abs(desvio_pct).toFixed(1) + '%</div>';
    html += '</div>';
  });

  html += '</div></div>';

  // Tabs
  html += '<div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;">';
  DASHBOARD_ORCADO.categorias.forEach((cat, idx) => {
    const bgColor = idx === 0 ? '#0f3460' : '#e2e8f0';
    const textColor = idx === 0 ? 'white' : '#1e293b';
    html += '<button class="orcado-tab-btn" data-categoria="' + cat + '" onclick="renderOrcadoTab(\'' + cat + '\')" style="padding: 0.6rem 1.2rem; background: ' + bgColor + '; color: ' + textColor + '; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">' + cat.toUpperCase() + '</button>';
  });
  html += '</div>';

  html += '<div id="orcadoTabContent"></div>';
  html += '</div>';

  document.getElementById('orcadoView').innerHTML = html;
  renderOrcadoTab('receitas');
}

function renderOrcadoTab(categoria) {
  // Atualiza botões
  const botoes = document.querySelectorAll('.orcado-tab-btn');
  for (let i = 0; i < botoes.length; i++) {
    botoes[i].style.background = '#e2e8f0';
    botoes[i].style.color = '#1e293b';
  }

  const btnAtivo = document.querySelector('[data-categoria="' + categoria + '"]');
  if (btnAtivo) {
    btnAtivo.style.background = '#0f3460';
    btnAtivo.style.color = 'white';
  }

  const real = dadosFinanceiros;
  const orcado = DASHBOARD_ORCADO.orcamento;
  const meses_disponiveis = DASHBOARD_ORCADO.meses.filter(function(m) {
    const idx = DASHBOARD_ORCADO.meses.indexOf(m);
    const hasReal = (real[categoria] || []).some(item => item[m]);
    const hasOrc = orcado[categoria] && orcado[categoria][m];
    return hasReal || hasOrc;
  });

  let html = '<div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2rem;">';
  html += '<h3 style="margin-top: 0; margin-bottom: 1.5rem; color: #0f3460; text-transform: uppercase;">📊 ' + categoria.toUpperCase() + ' — Mensal</h3>';

  // Tabela
  html += '<div style="overflow-x: auto; margin-bottom: 2rem;"><table style="width: 100%; border-collapse: collapse;"><thead style="background: #f1f5f9; border-bottom: 2px solid #0f3460;"><tr>';
  html += '<th style="padding: 1rem; text-align: left; font-weight: 600; color: #0f3460;">Mês</th>';
  html += '<th style="padding: 1rem; text-align: right; font-weight: 600; color: #0f3460;">Realizado</th>';
  html += '<th style="padding: 1rem; text-align: right; font-weight: 600; color: #0f3460;">Orçado</th>';
  html += '<th style="padding: 1rem; text-align: right; font-weight: 600; color: #0f3460;">Desvio %</th>';
  html += '<th style="padding: 1rem; text-align: center; font-weight: 600; color: #0f3460;">Status</th>';
  html += '</tr></thead><tbody>';

  meses_disponiveis.forEach(function(mes) {
    const idx = DASHBOARD_ORCADO.meses.indexOf(mes);
    const realizado = (real[categoria] || []).reduce(function(sum, item) { return sum + (item[mes] || 0); }, 0);
    const orcad = (orcado[categoria] && orcado[categoria][mes]) || 0;
    const desvio_pct = orcad !== 0 ? ((realizado - orcad) / orcad) * 100 : 0;
    const status = Math.abs(desvio_pct) <= 5 ? '✅ OK' : Math.abs(desvio_pct) <= 15 ? '🟡 ALERTA' : '🔴 CRÍTICO';
    const cor_linha = Math.abs(desvio_pct) <= 5 ? 'rgba(16, 185, 129, 0.05)' : Math.abs(desvio_pct) <= 15 ? 'rgba(251, 146, 60, 0.05)' : 'rgba(239, 68, 68, 0.05)';

    html += '<tr style="border-bottom: 1px solid #e2e8f0; background: ' + cor_linha + '">';
    html += '<td style="padding: 1rem; font-weight: 600; color: #1e293b;">' + DASHBOARD_ORCADO.meses_label[idx] + '</td>';
    html += '<td style="padding: 1rem; text-align: right;">' + formatCurrencyLocal(realizado) + '</td>';
    html += '<td style="padding: 1rem; text-align: right;">' + formatCurrencyLocal(orcad) + '</td>';
    html += '<td style="padding: 1rem; text-align: right; font-weight: 600;">' + (desvio_pct >= 0 ? '+' : '') + desvio_pct.toFixed(1) + '%</td>';
    html += '<td style="padding: 1rem; text-align: center;">' + status + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';

  // Heatmap
  html += '<div style="margin-top: 2rem;"><h4 style="margin-bottom: 1rem; color: #0f3460;">🎨 Heatmap de Desvios</h4>';
  html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.5rem;">';

  meses_disponiveis.forEach(function(mes) {
    const idx = DASHBOARD_ORCADO.meses.indexOf(mes);
    const realizado = (real[categoria] || []).reduce(function(sum, item) { return sum + (item[mes] || 0); }, 0);
    const orcad = (orcado[categoria] && orcado[categoria][mes]) || 0;
    const desvio_pct = orcad !== 0 ? ((realizado - orcad) / orcad) * 100 : 0;
    let cor = '#d1fae5';
    if (Math.abs(desvio_pct) > 5 && Math.abs(desvio_pct) <= 15) cor = '#fed7aa';
    if (Math.abs(desvio_pct) > 15) cor = '#fee2e2';

    html += '<div style="background: ' + cor + '; border-radius: 8px; padding: 1rem; text-align: center; border: 1px solid #e2e8f0;">';
    html += '<div style="font-size: 0.8rem; font-weight: 600; color: #1e293b; margin-bottom: 0.3rem;">' + DASHBOARD_ORCADO.meses_label[idx].substring(0, 3).toUpperCase() + '</div>';
    html += '<div style="font-size: 0.9rem; font-weight: 700; color: #0f3460;">' + (desvio_pct >= 0 ? '+' : '') + desvio_pct.toFixed(1) + '%</div>';
    html += '</div>';
  });

  html += '</div></div></div>';

  document.getElementById('orcadoTabContent').innerHTML = html;
}

function renderGraficoOrcado(categoria) {
  const real = dadosFinanceiros;
  const orcado = DASHBOARD_ORCADO.orcamento;

  const meses_plot = [];
  const real_vals = [];
  const orcad_vals = [];

  DASHBOARD_ORCADO.meses.forEach((mes, idx) => {
    const realizado = (real[categoria] || []).reduce((sum, item) => sum + (item[mes] || 0), 0);
    const orcad = orcado[categoria]?.[mes] || 0;

    if (realizado > 0 || orcad > 0) {
      meses_plot.push(DASHBOARD_ORCADO.meses_label[idx].slice(0, 3));
      real_vals.push(parseFloat((realizado / 1000).toFixed(2))); // em milhares pra escala
      orcad_vals.push(parseFloat((orcad / 1000).toFixed(2)));
    }
  });

  const ctx = document.getElementById(`chartOrcado_${categoria}`);
  if (ctx && window.Chart) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses_plot,
        datasets: [
          {
            label: 'Realizado (R$ mil)',
            data: real_vals,
            backgroundColor: '#0f3460',
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: 'Orçado (R$ mil)',
            data: orcad_vals,
            backgroundColor: '#cbd5e1',
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { position: 'top' } },
      },
    });
  }
}

function fecharDashboardOrcado() {
  document.getElementById('orcadoView').style.display = 'none';
}

function abrirDashboardOrcado() {
  document.getElementById('orcadoView').style.display = 'block';
  renderDashboardOrcado();
}
