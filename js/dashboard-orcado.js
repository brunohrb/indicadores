// ==================== DASHBOARD REALIZADO x ORÇADO ====================
// Comparativo mensal: visualização caprichada com cards, gráficos e heatmap

const DASHBOARD_ORCADO = {
  orcamento: null,
  modo_resumo: 'mes', // 'mes' ou 'trimestre'
  categoria_selecionada: 'receitas', // categoria ativa
  meses: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  meses_label: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  categorias: ['receitas', 'impostos', 'custos', 'despesas', 'ebitda', 'ebitda_ajustado'],
  categorias_label: { receitas: 'Receitas', impostos: 'Impostos', custos: 'Custos', despesas: 'Despesas', ebitda: 'EBITDA', ebitda_ajustado: 'EBITDA Ajustado' },
};

// Helper: formata moeda (fallback se formatCurrency não estiver disponível)
function formatCurrencyLocal(valor) {
  if (typeof window.formatCurrency === 'function') {
    return window.formatCurrency(valor);
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

// Carrega orçamento do XLSX bytes (usado pelo Sync OneDrive automático)
async function carregarOrcadoDoXLSXBytes(arrayBuffer) {
  try {
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('📊 Abas encontradas:', wb.SheetNames);

    const orcamento = {
      receitas: {}, impostos: {}, custos: {}, despesas: {}, ebitda: {}, ebitda_ajustado: {}
    };

    // Lê aba "Orçamento"
    const abaTarget = 'Orçamento';
    const sheet = wb.Sheets[abaTarget];

    if (!sheet) {
      console.warn(`⚠️ Aba "Orçamento" não encontrada — pulando carregamento`);
      return null;
    }

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: 0 });
    console.log(`📋 Aba "Orçamento" tem ${data.length} linhas`);

    // Linha 4 (índice 3) tem os meses: Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez
    const headerRow = data[3];
    const colMeses = {};

    // Map dos meses esperados
    const mesesMap = {
      'jan': ['jan', 'janeiro'],
      'fev': ['fev', 'fevereiro'],
      'mar': ['mar', 'março'],
      'abr': ['abr', 'abril'],
      'mai': ['mai', 'maio'],
      'jun': ['jun', 'junho'],
      'jul': ['jul', 'julho'],
      'ago': ['ago', 'agosto'],
      'set': ['set', 'setembro'],
      'out': ['out', 'outubro'],
      'nov': ['nov', 'novembro'],
      'dez': ['dez', 'dezembro']
    };

    // Procura os índices das colunas dos meses
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

    console.log('Colunas de mês encontradas:', colMeses);

    // ESTRUTURA DA ABA "ORÇAMENTO" (conforme verificado):
    // Linha 5 (índice 4): Receitas
    // Linha 17 (índice 16): Impostos
    // Linha 27 (índice 26): Custos
    // Linha 47 (índice 46): Despesas
    // Linha 68 (índice 67): EBITDA
    // Linha 77 (índice 76): EBITDA (Ajustado)

    const linhasCategoria = {
      receitas: 4,
      impostos: 16,
      custos: 26,
      despesas: 46,
      ebitda: 67,
      ebitda_ajustado: 76
    };

    let countValores = 0;

    // Lê cada categoria
    for (const [cat, lineaIdx] of Object.entries(linhasCategoria)) {
      if (data[lineaIdx]) {
        const row = data[lineaIdx];

        // Itera pelos meses e coleta valores
        for (const [mes, colIdx] of Object.entries(colMeses)) {
          const val = row[colIdx];

          // Tenta converter para número (pode ser string ou número)
          let valNum = 0;
          if (typeof val === 'number') {
            valNum = val;
          } else if (typeof val === 'string') {
            // Remove caracteres especiais e tenta converter
            const cleaned = val.replace(/[^\d.,\-]/g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed)) valNum = parsed;
          }

          if (valNum !== 0) {
            orcamento[cat][mes] = parseFloat((valNum).toFixed(2));
            countValores++;
          }
        }
      }
    }

    console.log(`✅ ${countValores} valores de orçamento carregados`);
    console.log('Orçamento carregado:', orcamento);
    DASHBOARD_ORCADO.orcamento = orcamento;

    // Salva no Supabase pra reutilizar
    try {
      await sbStorage.set('dashboard_orcado', JSON.stringify(orcamento));
    } catch(e) {
      console.warn('Aviso: não conseguiu salvar orçamento no Supabase:', e);
    }

    // Abre o dashboard automaticamente
    setTimeout(() => abrirDashboardOrcado(), 500);

    return orcamento;
  } catch(e) {
    console.error('❌ Erro ao carregar orçamento:', e);
    return null;
  }
}

// Carrega orçamento do Supabase (para inicializar automaticamente)
async function carregarOrcadoDoSupabase() {
  try {
    const raw = await sbStorage.get('dashboard_orcado');
    if (raw) {
      DASHBOARD_ORCADO.orcamento = JSON.parse(raw);
      console.log('✅ Orçamento carregado do Supabase');
      return DASHBOARD_ORCADO.orcamento;
    }
  } catch(e) {
    console.warn('⚠️ Não conseguiu carregar orçamento do Supabase:', e);
  }
  return null;
}

// Parseia o orçamento do XLSX — aba "Orçamento"
async function carregarOrcadoDoXLSX(arquivo) {
  try {
    const arrayBuffer = await arquivo.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('📊 Abas encontradas:', wb.SheetNames);

    const orcamento = {
      receitas: {}, impostos: {}, custos: {}, despesas: {}, ebitda: {}, ebitda_ajustado: {}
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

// Renderiza dashboard visual: Real vs Orçado (NOVO - organizado por categoria)
function renderDashboardOrcado() {
  try {
    if (!DASHBOARD_ORCADO.orcamento) {
      document.getElementById('orcadoView').innerHTML = '<div style="padding: 2rem; text-align: center; color: #94a3b8;"><div style="font-size: 3rem; margin-bottom: 1rem;">📊</div><h2>Nenhum orçamento carregado</h2><p>Clique em "🔄 Sync OneDrive" para carregar automaticamente</p></div>';
      return;
    }

    const real = dadosFinanceiros;
    const orcado = DASHBOARD_ORCADO.orcamento;
    const cat = DASHBOARD_ORCADO.categoria_selecionada;

    let html = '<div style="padding: 2rem; background: #f8fafc; min-height: 100vh;">';
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">';
    html += '<h1 style="margin: 0; color: #0f3460; font-size: 2rem;">📊 Realizado × Orçado</h1>';
    html += '<button onclick="fecharDashboardOrcado()" style="padding: 0.5rem 1rem; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">✕ Fechar</button>';
    html += '</div>';

    // Seletor de Categoria - ABAS GRANDES
    html += '<div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;">';
    DASHBOARD_ORCADO.categorias.forEach(function(catName) {
      const isActive = catName === DASHBOARD_ORCADO.categoria_selecionada;
      const bgColor = isActive ? '#0f3460' : '#e2e8f0';
      const textColor = isActive ? 'white' : '#1e293b';
      const label = DASHBOARD_ORCADO.categorias_label[catName] || catName.toUpperCase();
      html += '<button onclick="DASHBOARD_ORCADO.categoria_selecionada=\'' + catName + '\'; renderDashboardOrcado()" style="padding: 0.8rem 1.5rem; background: ' + bgColor + '; color: ' + textColor + '; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: all 0.2s;">' + label + '</button>';
    });
    html += '</div>';

    // Tabela da categoria selecionada
    html += '<div style="background: white; border-radius: 12px; padding: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
    html += '<h2 style="margin-top: 0; margin-bottom: 1.5rem; color: #0f3460;">📆 ' + (DASHBOARD_ORCADO.categorias_label[cat] || cat.toUpperCase()) + ' — 2026</h2>';

    // Tabela com todos os meses
    html += '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">';
    html += '<thead style="background: #f1f5f9; border-bottom: 2px solid #0f3460;"><tr>';
    html += '<th style="padding: 1rem; text-align: left; font-weight: 700; color: #0f3460; border: 1px solid #e2e8f0;">MÊS</th>';
    html += '<th style="padding: 1rem; text-align: right; font-weight: 700; color: #0f3460; border: 1px solid #e2e8f0;">REALIZADO</th>';
    html += '<th style="padding: 1rem; text-align: right; font-weight: 700; color: #0f3460; border: 1px solid #e2e8f0;">ORÇADO</th>';
    html += '<th style="padding: 1rem; text-align: right; font-weight: 700; color: #0f3460; border: 1px solid #e2e8f0;">DESVIO %</th>';
    html += '<th style="padding: 1rem; text-align: center; font-weight: 700; color: #0f3460; border: 1px solid #e2e8f0;">STATUS</th>';
    html += '</tr></thead><tbody>';

    DASHBOARD_ORCADO.meses.forEach(function(mes, idx) {
      const items = real[cat] || [];
      const realizado = items.reduce(function(sum, item) { return sum + (item[mes] || 0); }, 0);
      const orcad = (orcado[cat] && orcado[cat][mes]) || 0;
      const desvio_pct = orcad !== 0 ? ((realizado - orcad) / orcad) * 100 : 0;

      let statusIcon, statusText, rowColor;
      if (Math.abs(desvio_pct) <= 10) {
        statusIcon = '✅';
        statusText = 'OK';
        rowColor = '#d1fae5';
      } else if (Math.abs(desvio_pct) <= 20) {
        statusIcon = '🟡';
        statusText = 'ALERTA';
        rowColor = '#fed7aa';
      } else {
        statusIcon = '🔴';
        statusText = 'CRÍTICO';
        rowColor = '#fee2e2';
      }

      html += '<tr style="border-bottom: 1px solid #e2e8f0; background: ' + rowColor + ';">';
      html += '<td style="padding: 1rem; font-weight: 600; color: #1e293b; border: 1px solid #e2e8f0;">' + DASHBOARD_ORCADO.meses_label[idx] + '</td>';
      html += '<td style="padding: 1rem; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #e2e8f0;">' + formatCurrencyLocal(realizado) + '</td>';
      html += '<td style="padding: 1rem; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #e2e8f0;">' + formatCurrencyLocal(orcad) + '</td>';
      html += '<td style="padding: 1rem; text-align: right; font-weight: 700; color: #0f3460; border: 1px solid #e2e8f0;">' + (desvio_pct >= 0 ? '+' : '') + desvio_pct.toFixed(1) + '%</td>';
      html += '<td style="padding: 1rem; text-align: center; border: 1px solid #e2e8f0;">' + statusIcon + ' ' + statusText + '</td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    html += '</div>'; // fecha card
    html += '</div>'; // fecha container

    document.getElementById('orcadoView').innerHTML = html;
  } catch(e) {
    console.error('❌ ERRO em renderDashboardOrcado:', e);
    document.getElementById('orcadoView').innerHTML = '<div style="padding: 2rem; color: #dc2626;"><h2>❌ Erro ao renderizar</h2><p>' + e.message + '</p></div>';
  }
}

function fecharDashboardOrcado() {
  document.getElementById('orcadoView').style.display = 'none';
}

async function abrirDashboardOrcado() {
  document.getElementById('orcadoView').style.display = 'block';

  // Se não tem orçamento em memória, tenta carregar do Supabase
  if (!DASHBOARD_ORCADO.orcamento) {
    await carregarOrcadoDoSupabase();
  }

  renderDashboardOrcado();
}

// Função chamada ao inicializar (quando sbStorage está pronto)
async function initDashboardOrcado() {
  if (typeof sbStorage !== 'undefined' && !DASHBOARD_ORCADO.orcamento) {
    await carregarOrcadoDoSupabase();
    console.log('✅ Dashboard Orçado inicializado');
    // Abre automaticamente o dashboard ao carregar
    if (document.getElementById('orcadoView')) {
      abrirDashboardOrcado();
    }
  }
}

// Tenta inicializar após 1000ms (pra garantir que sbStorage tá pronto)
setTimeout(() => initDashboardOrcado().catch(e => console.warn('⚠️ Erro ao inicializar dashboard orçado:', e)), 1000);
