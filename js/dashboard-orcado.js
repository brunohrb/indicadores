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

// Parseia o orçamento do XLSX (abas ABR-MAI-JUN, JUL-AGO-SET, Anual - Orçamento 2026)
async function carregarOrcadoDoXLSX(arquivo) {
  try {
    const arrayBuffer = await arquivo.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('📊 Abas encontradas:', wb.SheetNames);

    const orcamento = {
      receitas: {}, impostos: {}, custos: {}, despesas: {}, ebitda: {}
    };

    // Tenta parsear a aba "Anual - Orçamento 2026"
    const abaTarget = 'Anual - Orçamento 2026';
    const sheetAnual = wb.Sheets[abaTarget];

    if (!sheetAnual) {
      console.warn(`⚠️ Aba "${abaTarget}" não encontrada`);
      return null;
    }

    const data = XLSX.utils.sheet_to_json(sheetAnual, { header: 1 });
    console.log(`📋 ${abaTarget} tem ${data.length} linhas`);

    // Encontra a linha do header (tem 'Jan', 'Fev', etc)
    let headerIdx = -1;
    let headerRow = [];
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (!row) continue;
      const hasMonths = row.some(h => h && String(h).toLowerCase().match(/jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez/i));
      if (hasMonths) {
        headerIdx = i;
        headerRow = row;
        console.log(`✅ Header encontrado na linha ${i}:`, headerRow.slice(0, 5));
        break;
      }
    }

    if (headerIdx < 0) {
      console.error('❌ Header com meses não encontrado');
      return null;
    }

    // Mapeia colunas de meses
    const colMeses = {};
    const nomesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    headerRow.forEach((h, colIdx) => {
      if (!h) return;
      const hStr = String(h).toLowerCase().trim();
      nomesAbrev.forEach((abrev, mesIdx) => {
        if (hStr.includes(abrev)) colMeses[DASHBOARD_ORCADO.meses[mesIdx]] = colIdx;
      });
    });
    console.log('📅 Colunas de meses:', colMeses);

    // Itera pelas linhas de dados
    let countLinhas = 0;
    for (let i = headerIdx + 1; i < data.length; i++) {
      const row = data[i];
      const nomeRaw = row?.[0];
      if (!nomeRaw || typeof nomeRaw !== 'string') continue;

      const nome = nomeRaw.toLowerCase().trim();

      // Detecta categoria principal
      let categoria = null;
      if (nome.includes('receita')) categoria = 'receitas';
      else if (nome.includes('imposto') || nome.includes('icms') || nome.includes('cofins') || nome.includes('pis') || nome.includes('irpj') || nome.includes('csll')) categoria = 'impostos';
      else if (nome.includes('custo') || nome.includes('kit') || nome.includes('material') || nome.includes('vtal') || nome.includes('folha') || nome.includes('link')) categoria = 'custos';
      else if (nome.includes('despesa') || nome.includes('marketing') || nome.includes('aluguel') || nome.includes('serv') || nome.includes('pró')) categoria = 'despesas';
      else if (nome.includes('ebitda')) categoria = 'ebitda';

      if (categoria && Object.keys(colMeses).length > 0) {
        // Soma valores do mês
        Object.entries(colMeses).forEach(([mes, col]) => {
          const val = row[col];
          if (typeof val === 'number' && val !== 0) {
            if (!orcamento[categoria][mes]) orcamento[categoria][mes] = 0;
            orcamento[categoria][mes] += val;
            countLinhas++;
          }
        });
      }
    }
    console.log(`✅ ${countLinhas} valores de orçamento carregados`);

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
    document.getElementById('orcadoView').innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #94a3b8;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
        <h2>Nenhum orçamento carregado</h2>
        <p>Use o botão "📁 Carregar Orçamento" para fazer upload do XLSX</p>
      </div>
    `;
    return;
  }

  const real = dadosFinanceiros;
  const orcado = DASHBOARD_ORCADO.orcamento;

  let html = `
    <div style="padding: 2rem; max-width: 100%; overflow-x: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <h1 style="margin: 0; color: #0f3460;">📊 Dashboard — Realizado × Orçado</h1>
        <button onclick="fecharDashboardOrcado()" style="padding: 0.5rem 1rem; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">✕ Fechar</button>
      </div>

      <!-- Resumo Trimestral -->
      <div style="background: linear-gradient(135deg, #0f3460, #1a1a2e); color: white; border-radius: 16px; padding: 2rem; margin-bottom: 2rem;">
        <h2 style="margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem;">💡 Resumo de Desvios (2º e 3º Trimestres)</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          ${DASHBOARD_ORCADO.categorias.map(cat => {
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
            const cor_texto = status === 'ok' ? '#d1fae5' : status === 'alerta' ? '#fed7aa' : '#fee2e2';

            return `
              <div style="background: ${cor_bg}; border-radius: 12px; padding: 1.5rem; border-left: 4px solid ${status === 'ok' ? '#10b981' : status === 'alerta' ? '#fb923c' : '#ef4444'}">
                <div style="font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; opacity: 0.9">${cat.toUpperCase()}</div>
                <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">
                  <div>Real: <strong>${formatCurrencyLocal(somaReal)}</strong></div>
                  <div>Orçado: <strong>${formatCurrencyLocal(somaOrcado)}</strong></div>
                </div>
                <div style="font-size: 1.2rem; font-weight: 700; color: ${status === 'ok' ? '#d1fae5' : status === 'alerta' ? '#fed7aa' : '#fee2e2'}">
                  ${desvio >= 0 ? '↑' : '↓'} ${Math.abs(desvio_pct).toFixed(1)}% (${formatCurrencyLocal(Math.abs(desvio))})
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Tabs de categorias -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;" id="orcadoTabsContainer">
        ${DASHBOARD_ORCADO.categorias.map((cat, idx) => `
          <button class="orcado-tab-btn" data-categoria="${cat}" onclick="renderOrcadoTab('${cat}')"
            style="padding: 0.6rem 1.2rem; background: ${idx === 0 ? '#0f3460' : '#e2e8f0'}; color: ${idx === 0 ? 'white' : '#1e293b'}; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
            ${cat.toUpperCase()}
          </button>
        `).join('')}
      </div>

      <!-- Conteúdo dinâmico -->
      <div id="orcadoTabContent"></div>
    </div>
  `;

  document.getElementById('orcadoView').innerHTML = html;
  renderOrcadoTab('receitas');
}

function renderOrcadoTab(categoria) {
  // Atualiza botões
  const botoes = document.querySelectorAll('.orcado-tab-btn');
  botoes.forEach(function(botao) {
    botao.style.background = '#e2e8f0';
    botao.style.color = '#1e293b';
  });

  // Marca ativo
  const btnAtivo = document.querySelector(`[data-categoria="${categoria}"]`);
  if (btnAtivo) {
    btnAtivo.style.background = '#0f3460';
    btnAtivo.style.color = 'white';
  }

  const real = dadosFinanceiros;
  const orcado = DASHBOARD_ORCADO.orcamento;
  const meses_disponiveis = DASHBOARD_ORCADO.meses.filter((_, idx) => {
    const hasReal = (real[categoria] || []).some(item => item[DASHBOARD_ORCADO.meses[idx]]);
    const hasOrc = orcado[categoria]?.[DASHBOARD_ORCADO.meses[idx]];
    return hasReal || hasOrc;
  });

  let html = `
    <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2rem;">
      <h3 style="margin-top: 0; margin-bottom: 1.5rem; color: #0f3460; text-transform: uppercase; font-size: 1.1rem;">
        📊 ${categoria.toUpperCase()} — Mensal
      </h3>

      <!-- Tabela Comparativa -->
      <div style="overflow-x: auto; margin-bottom: 2rem;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f1f5f9; border-bottom: 2px solid #0f3460;">
            <tr>
              <th style="padding: 1rem; text-align: left; font-weight: 600; color: #0f3460;">Mês</th>
              <th style="padding: 1rem; text-align: right; font-weight: 600; color: #0f3460;">Realizado</th>
              <th style="padding: 1rem; text-align: right; font-weight: 600; color: #0f3460;">Orçado</th>
              <th style="padding: 1rem; text-align: right; font-weight: 600; color: #0f3460;">Desvio R$</th>
              <th style="padding: 1rem; text-align: right; font-weight: 600; color: #0f3460;">Desvio %</th>
              <th style="padding: 1rem; text-align: center; font-weight: 600; color: #0f3460;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${meses_disponiveis.map(mes => {
              const idx = DASHBOARD_ORCADO.meses.indexOf(mes);
              const realizado = (real[categoria] || []).reduce((sum, item) => sum + (item[mes] || 0), 0);
              const orcad = orcado[categoria]?.[mes] || 0;
              const desvio = realizado - orcad;
              const desvio_pct = orcad !== 0 ? ((desvio / orcad) * 100) : 0;

              const status = Math.abs(desvio_pct) <= 5 ? '✅ OK' :
                            Math.abs(desvio_pct) <= 15 ? '🟡 ALERTA' : '🔴 CRÍTICO';
              const cor_linha = Math.abs(desvio_pct) <= 5 ? 'rgba(16, 185, 129, 0.05)' :
                               Math.abs(desvio_pct) <= 15 ? 'rgba(251, 146, 60, 0.05)' : 'rgba(239, 68, 68, 0.05)';

              return `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${cor_linha}; hover {background: #f8fafc}">
                  <td style="padding: 1rem; font-weight: 600; color: #1e293b;">${DASHBOARD_ORCADO.meses_label[idx]}</td>
                  <td style="padding: 1rem; text-align: right; color: #1e293b;">${formatCurrencyLocal(realizado)}</td>
                  <td style="padding: 1rem; text-align: right; color: #64748b;">${formatCurrencyLocal(orcad)}</td>
                  <td style="padding: 1rem; text-align: right; color: ${desvio >= 0 ? '#ef4444' : '#10b981'}; font-weight: 600;">
                    ${desvio >= 0 ? '+' : ''}${formatCurrencyLocal(desvio)}
                  </td>
                  <td style="padding: 1rem; text-align: right; color: ${Math.abs(desvio_pct) <= 5 ? '#10b981' : Math.abs(desvio_pct) <= 15 ? '#fb923c' : '#ef4444'}; font-weight: 600;">
                    ${desvio_pct >= 0 ? '+' : ''}${desvio_pct.toFixed(1)}%
                  </td>
                  <td style="padding: 1rem; text-align: center;">${status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Gráfico de Barras (Chart.js) -->
      <div style="margin-bottom: 2rem;">
        <canvas id="chartOrcado_${categoria}" style="max-height: 300px;"></canvas>
      </div>

      <!-- Heatmap Visual -->
      <div style="margin-top: 2rem;">
        <h4 style="margin-bottom: 1rem; color: #0f3460;">🎨 Heatmap de Desvios</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.5rem;">
          ${meses_disponiveis.map(mes => {
            const idx = DASHBOARD_ORCADO.meses.indexOf(mes);
            const realizado = (real[categoria] || []).reduce((sum, item) => sum + (item[mes] || 0), 0);
            const orcad = orcado[categoria]?.[mes] || 0;
            const desvio_pct = orcad !== 0 ? ((realizado - orcad) / orcad) * 100 : 0;

            let cor = '#d1fae5'; // verde ±5%
            if (Math.abs(desvio_pct) > 5 && Math.abs(desvio_pct) <= 15) cor = '#fed7aa'; // laranja
            if (Math.abs(desvio_pct) > 15) cor = '#fee2e2'; // vermelho

            return `
              <div style="background: ${cor}; border-radius: 8px; padding: 1rem; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 0.8rem; font-weight: 600; color: #1e293b; margin-bottom: 0.3rem;">${DASHBOARD_ORCADO.meses_label[idx].slice(0, 3).toUpperCase()}</div>
                <div style="font-size: 0.9rem; font-weight: 700; color: #0f3460;">${desvio_pct >= 0 ? '+' : ''}${desvio_pct.toFixed(1)}%</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('orcadoTabContent').innerHTML = html;

  // Renderiza gráfico
  setTimeout(() => renderGraficoOrcado(categoria), 100);
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
