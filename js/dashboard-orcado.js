// ==================== DASHBOARD ORÇADO × REALIZADO ====================

const DASHBOARD_ORCADO = {
  orcamento: null,
  categoria_selecionada: 'receitas',
  aba_ativa: 'comparativo', // 'comparativo' | 'radar'
  ano: 2026,            // 2026 (tem orçado) | 2025 | 2024 (só realizado)
  visao: 'mensal',      // 'mensal' | 'trimestral'
  mesFiltro: 'todos',   // 'todos' | 0..11
  triFiltro: 'todos',   // 'todos' | 0..3
  meses: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  meses_label: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  tris: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]],
  tris_label: ['1º Trimestre (Jan–Mar)', '2º Trimestre (Abr–Jun)', '3º Trimestre (Jul–Set)', '4º Trimestre (Out–Dez)'],
  categorias: ['receitas', 'impostos', 'custos', 'despesas', 'ebitda', 'ebitda_ajustado'],
  categorias_label: { receitas: 'Receitas', impostos: 'Impostos', custos: 'Custos', despesas: 'Despesas', ebitda: 'EBITDA', ebitda_ajustado: 'EBITDA Ajustado' },
  linhasExpandidas: {},  // rastreia quais linhas estão expandidas: { 'mes_0': true, 'tri_1': false, ... }
};

// Toggle expand/collapse de uma linha
function _orcadoToggleLinha(chave) {
  DASHBOARD_ORCADO.linhasExpandidas[chave] = !DASHBOARD_ORCADO.linhasExpandidas[chave];
  renderDashboardOrcado();
}

// Cabeçalho com as 2 abas: Orçado × Realizado | Radar de Gastos
function _orcadoGetTabsHeader() {
  let html = '<div style="margin-bottom:1rem;border-bottom:1px solid #e2e8f0;display:flex;gap:0.5rem;">';
  html += '<button onclick="DASHBOARD_ORCADO.aba_ativa=\'comparativo\';renderDashboardOrcado()" style="padding:0.8rem 1.2rem;background:' + (DASHBOARD_ORCADO.aba_ativa !== 'radar' ? '#8b5cf6' : '#e2e8f0') + ';color:' + (DASHBOARD_ORCADO.aba_ativa !== 'radar' ? 'white' : '#666') + ';border:none;border-radius:6px 6px 0 0;cursor:pointer;font-weight:600;">📊 Orçado × Realizado</button>';
  html += '<button onclick="DASHBOARD_ORCADO.aba_ativa=\'radar\';renderDashboardOrcado()" style="padding:0.8rem 1.2rem;background:' + (DASHBOARD_ORCADO.aba_ativa === 'radar' ? '#8b5cf6' : '#e2e8f0') + ';color:' + (DASHBOARD_ORCADO.aba_ativa === 'radar' ? 'white' : '#666') + ';border:none;border-radius:6px 6px 0 0;cursor:pointer;font-weight:600;">🎯 Radar de Gastos</button>';
  html += '</div>';
  return html;
}

// Dataset de realizado conforme o ano selecionado
function _orcadoDatasetAno() {
  const a = DASHBOARD_ORCADO.ano;
  if (a === 2025 && typeof dadosFinanceiros2025 !== 'undefined') return dadosFinanceiros2025;
  if (a === 2024 && typeof dadosFinanceiros2024 !== 'undefined') return dadosFinanceiros2024;
  return dadosFinanceiros;
}
function _orcadoRealMes(real, cat, mesIdx) {
  const mes = DASHBOARD_ORCADO.meses[mesIdx];
  return (real[cat] || []).reduce(function(s, item) { return s + (item[mes] || 0); }, 0);
}
function _orcadoOrcMes(orcado, cat, mesIdx) {
  if (!orcado || !orcado[cat]) return 0;
  const mes = DASHBOARD_ORCADO.meses[mesIdx];
  // Nova estrutura: orcado[cat] = { "item nome": { jan: val, fev: val, ... }, ... }
  // Soma todos os itens deste mês
  let total = 0;
  for (const itemNome in orcado[cat]) {
    const item = orcado[cat][itemNome];
    if (item && item[mes]) total += item[mes];
  }
  return total;
}

function renderDashboardOrcado() {
  const el = document.getElementById('orcadoView');
  if (!el || typeof dadosFinanceiros === 'undefined') return;

  // Cabeçalho de abas sempre no topo
  let html = _orcadoGetTabsHeader();

  // Aba Radar: delega pro radar-gastos.js (ele escreve dentro de #orcadoView)
  if (DASHBOARD_ORCADO.aba_ativa === 'radar') {
    el.innerHTML = html;
    if (typeof renderRadarGastos === 'function') {
      const wrap = document.createElement('div');
      el.appendChild(wrap);
      renderRadarGastos(wrap);
    }
    return;
  }

  // ---------- Aba Comparativo (Orçado × Realizado) ----------
  const real = _orcadoDatasetAno();
  // Orçado só existe para 2026
  const orcado = DASHBOARD_ORCADO.ano === 2026 ? DASHBOARD_ORCADO.orcamento : null;
  const cat = DASHBOARD_ORCADO.categoria_selecionada;
  const temOrcado = !!(orcado && orcado[cat]);
  const fc = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  html += '<div style="background:white;border-radius:8px;padding:1.5rem;border:1px solid #e2e8f0;">';

  // ---------- BARRA DE FILTROS ----------
  html += '<div style="display:flex;gap:1rem;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;padding-bottom:1rem;border-bottom:1px solid #e2e8f0;">';

  // Ano
  html += '<div style="display:flex;align-items:center;gap:0.4rem;"><span style="font-size:0.8rem;font-weight:600;color:#64748b;">Ano:</span>';
  html += '<select onchange="DASHBOARD_ORCADO.ano=+this.value;renderDashboardOrcado()" style="padding:0.35rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;">';
  [2026, 2025, 2024].forEach(function(a) {
    html += '<option value="' + a + '"' + (DASHBOARD_ORCADO.ano === a ? ' selected' : '') + '>' + a + '</option>';
  });
  html += '</select></div>';

  // Visão: Mensal | Trimestral
  html += '<div style="display:flex;align-items:center;gap:0.4rem;"><span style="font-size:0.8rem;font-weight:600;color:#64748b;">Visão:</span>';
  html += '<div style="display:flex;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;">';
  [['mensal', 'Mensal'], ['trimestral', 'Trimestral']].forEach(function(v) {
    const isActive = DASHBOARD_ORCADO.visao === v[0];
    html += '<button onclick="DASHBOARD_ORCADO.visao=\'' + v[0] + '\';renderDashboardOrcado()" style="padding:0.35rem 0.9rem;background:' + (isActive ? '#0f3460' : '#fff') + ';color:' + (isActive ? '#fff' : '#1e293b') + ';border:none;cursor:pointer;font-size:0.8rem;font-weight:600;">' + v[1] + '</button>';
  });
  html += '</div></div>';

  // Filtro específico: Mês (visão mensal) ou Trimestre (visão trimestral)
  if (DASHBOARD_ORCADO.visao === 'mensal') {
    html += '<div style="display:flex;align-items:center;gap:0.4rem;"><span style="font-size:0.8rem;font-weight:600;color:#64748b;">Mês:</span>';
    html += '<select onchange="DASHBOARD_ORCADO.mesFiltro=this.value===\'todos\'?\'todos\':+this.value;renderDashboardOrcado()" style="padding:0.35rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;">';
    html += '<option value="todos"' + (DASHBOARD_ORCADO.mesFiltro === 'todos' ? ' selected' : '') + '>Todos</option>';
    DASHBOARD_ORCADO.meses_label.forEach(function(m, idx) {
      html += '<option value="' + idx + '"' + (DASHBOARD_ORCADO.mesFiltro === idx ? ' selected' : '') + '>' + m + '</option>';
    });
    html += '</select></div>';
  } else {
    html += '<div style="display:flex;align-items:center;gap:0.4rem;"><span style="font-size:0.8rem;font-weight:600;color:#64748b;">Trimestre:</span>';
    html += '<select onchange="DASHBOARD_ORCADO.triFiltro=this.value===\'todos\'?\'todos\':+this.value;renderDashboardOrcado()" style="padding:0.35rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;">';
    html += '<option value="todos"' + (DASHBOARD_ORCADO.triFiltro === 'todos' ? ' selected' : '') + '>Todos</option>';
    ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'].forEach(function(t, idx) {
      html += '<option value="' + idx + '"' + (DASHBOARD_ORCADO.triFiltro === idx ? ' selected' : '') + '>' + t + '</option>';
    });
    html += '</select></div>';
  }

  if (!temOrcado) {
    html += '<span style="font-size:0.75rem;color:#b45309;background:#fef3c7;padding:0.3rem 0.6rem;border-radius:6px;">⚠️ Orçado disponível só para 2026</span>';
  }
  html += '</div>';

  // ---------- TABS DE CATEGORIA ----------
  html += '<div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">';
  DASHBOARD_ORCADO.categorias.forEach(function(c) {
    const isActive = c === cat;
    html += '<button onclick="DASHBOARD_ORCADO.categoria_selecionada=\'' + c + '\';renderDashboardOrcado()" style="padding:0.4rem 0.8rem;background:' + (isActive ? '#0f3460' : '#e2e8f0') + ';color:' + (isActive ? 'white' : '#1e293b') + ';border:none;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">' + DASHBOARD_ORCADO.categorias_label[c] + '</button>';
  });
  html += '</div>';

  // ---------- TABELA ----------
  const col1 = DASHBOARD_ORCADO.visao === 'mensal' ? 'Mês' : 'Trimestre';
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">';
  html += '<thead style="background:#f1f5f9;"><tr><th style="padding:0.8rem;text-align:left;border:1px solid #e2e8f0;font-weight:600;color:#0f3460;width:2%;">▼</th><th style="padding:0.8rem;text-align:left;border:1px solid #e2e8f0;font-weight:600;color:#0f3460;">' + col1 + '</th><th style="padding:0.8rem;text-align:right;border:1px solid #e2e8f0;font-weight:600;color:#0f3460;">Realizado</th>';
  if (temOrcado) {
    html += '<th style="padding:0.8rem;text-align:right;border:1px solid #e2e8f0;font-weight:600;color:#0f3460;">Orçado</th><th style="padding:0.8rem;text-align:right;border:1px solid #e2e8f0;font-weight:600;color:#0f3460;">Desvio %</th><th style="padding:0.8rem;text-align:center;border:1px solid #e2e8f0;font-weight:600;color:#0f3460;">Status</th>';
  }
  html += '</tr></thead><tbody>';

  // Monta a lista de linhas {label, mesesIdx[], chave}
  let linhas = [];
  if (DASHBOARD_ORCADO.visao === 'mensal') {
    DASHBOARD_ORCADO.meses_label.forEach(function(lbl, idx) {
      if (DASHBOARD_ORCADO.mesFiltro === 'todos' || DASHBOARD_ORCADO.mesFiltro === idx) {
        linhas.push({ label: lbl, idxs: [idx], chave: 'mes_' + idx, tipo: 'mes', mesIdx: idx });
      }
    });
  } else {
    DASHBOARD_ORCADO.tris.forEach(function(grupo, idx) {
      if (DASHBOARD_ORCADO.triFiltro === 'todos' || DASHBOARD_ORCADO.triFiltro === idx) {
        linhas.push({ label: DASHBOARD_ORCADO.tris_label[idx], idxs: grupo, chave: 'tri_' + idx, tipo: 'tri', triIdx: idx });
      }
    });
  }

  let totRealizado = 0, totOrcado = 0;
  linhas.forEach(function(linha) {
    let realizado = 0, orcad = 0;
    linha.idxs.forEach(function(mi) {
      realizado += _orcadoRealMes(real, cat, mi);
      orcad += _orcadoOrcMes(orcado, cat, mi);
    });
    totRealizado += realizado;
    totOrcado += orcad;
    const desvio = orcad !== 0 ? ((realizado - orcad) / orcad) * 100 : 0;

    let bgColor = '#ffffff', status = '';
    if (temOrcado && orcad > 0) {
      const isReceita = (cat === 'receitas' || cat === 'ebitda' || cat === 'ebitda_ajustado');

      if (isReceita) {
        // RECEITAS: realizado >= orçado = ✅ BATEU, < = 🔴 NÃO BATEU
        if (desvio >= 0) { bgColor = '#d1fae5'; status = '✅'; }
        else { bgColor = '#fee2e2'; status = '🔴'; }
      } else {
        // CUSTOS/DESPESAS: realizado <= orçado = ✅ BATEU, > = 🔴 NÃO BATEU
        if (desvio <= 0) { bgColor = '#d1fae5'; status = '✅'; }
        else { bgColor = '#fee2e2'; status = '🔴'; }
      }
    }

    const expandido = DASHBOARD_ORCADO.linhasExpandidas[linha.chave];
    const seta = '<span style="cursor:pointer;user-select:none;font-size:0.75rem;" onclick="_orcadoToggleLinha(\'' + linha.chave + '\')">' + (expandido ? '▼' : '▶') + '</span>';

    html += '<tr style="background:' + bgColor + ';border-bottom:1px solid #e2e8f0;cursor:pointer;" onclick="_orcadoToggleLinha(\'' + linha.chave + '\')">';
    html += '<td style="padding:0.8rem;border:1px solid #e2e8f0;text-align:center;">' + seta + '</td>';
    html += '<td style="padding:0.8rem;border:1px solid #e2e8f0;font-weight:600;">' + linha.label + '</td>';
    html += '<td style="padding:0.8rem;text-align:right;border:1px solid #e2e8f0;font-weight:600;">' + fc(realizado) + '</td>';
    if (temOrcado) {
      html += '<td style="padding:0.8rem;text-align:right;border:1px solid #e2e8f0;">' + fc(orcad) + '</td>';
      html += '<td style="padding:0.8rem;text-align:right;border:1px solid #e2e8f0;font-weight:600;">' + (orcad > 0 ? (desvio >= 0 ? '+' : '') + desvio.toFixed(1) + '%' : '—') + '</td>';
      html += '<td style="padding:0.8rem;text-align:center;border:1px solid #e2e8f0;">' + status + '</td>';
    }
    html += '</tr>';

    // Renderizar sub-itens se expandido
    if (expandido) {
      const items = real[cat] || [];
      items.forEach(function(item) {
        let itemRealizado = 0, itemOrcad = 0;
        linha.idxs.forEach(function(mi) {
          const mes = DASHBOARD_ORCADO.meses[mi];
          itemRealizado += item[mes] || 0;
          if (temOrcado && orcado && orcado[cat] && orcado[cat][item.nome]) {
            itemOrcad += orcado[cat][item.nome][mes] || 0;
          }
        });

        // Pular itens com 0 de realizado e 0 de orçado
        if (itemRealizado === 0 && itemOrcad === 0) return;

        const itemDesvio = itemOrcad !== 0 ? ((itemRealizado - itemOrcad) / itemOrcad) * 100 : 0;
        let itemBgColor = '#f8fafc', itemStatus = '';

        if (temOrcado && itemOrcad > 0) {
          const isReceita = (cat === 'receitas' || cat === 'ebitda' || cat === 'ebitda_ajustado');
          if (isReceita) {
            if (itemDesvio >= 0) { itemBgColor = '#ecfdf5'; itemStatus = '✅'; }
            else { itemBgColor = '#fef2f2'; itemStatus = '🔴'; }
          } else {
            if (itemDesvio <= 0) { itemBgColor = '#ecfdf5'; itemStatus = '✅'; }
            else { itemBgColor = '#fef2f2'; itemStatus = '🔴'; }
          }
        }

        html += '<tr style="background:' + itemBgColor + ';border-bottom:1px solid #e2e8f0;"><td style="padding:0.5rem 0.8rem;border:1px solid #e2e8f0;"></td>';
        html += '<td style="padding:0.5rem 0.8rem;border:1px solid #e2e8f0;font-size:0.85rem;padding-left:2.5rem;color:#475569;">└ ' + item.nome + '</td>';
        html += '<td style="padding:0.5rem 0.8rem;text-align:right;border:1px solid #e2e8f0;font-size:0.85rem;">' + fc(itemRealizado) + '</td>';
        if (temOrcado) {
          html += '<td style="padding:0.5rem 0.8rem;text-align:right;border:1px solid #e2e8f0;font-size:0.85rem;">' + fc(itemOrcad) + '</td>';
          html += '<td style="padding:0.5rem 0.8rem;text-align:right;border:1px solid #e2e8f0;font-size:0.85rem;">' + (itemOrcad > 0 ? (itemDesvio >= 0 ? '+' : '') + itemDesvio.toFixed(1) + '%' : '—') + '</td>';
          html += '<td style="padding:0.5rem 0.8rem;text-align:center;border:1px solid #e2e8f0;font-size:0.85rem;">' + itemStatus + '</td>';
        }
        html += '</tr>';
      });
    }
  });

  // Linha de TOTAL (quando há mais de uma linha)
  if (linhas.length > 1) {
    const desvioT = totOrcado !== 0 ? ((totRealizado - totOrcado) / totOrcado) * 100 : 0;
    html += '<tr style="background:#0f3460;color:#fff;font-weight:700;"><td style="padding:0.8rem;border:1px solid #0f3460;">TOTAL</td>';
    html += '<td style="padding:0.8rem;text-align:right;border:1px solid #0f3460;">' + fc(totRealizado) + '</td>';
    if (temOrcado) {
      html += '<td style="padding:0.8rem;text-align:right;border:1px solid #0f3460;">' + fc(totOrcado) + '</td>';
      html += '<td style="padding:0.8rem;text-align:right;border:1px solid #0f3460;">' + (totOrcado > 0 ? (desvioT >= 0 ? '+' : '') + desvioT.toFixed(1) + '%' : '—') + '</td>';
      html += '<td style="padding:0.8rem;text-align:center;border:1px solid #0f3460;"></td>';
    }
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}


// Carrega orçamento do XLSX quando sync roda
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

    // Passo 1: Carregar totais de categoria (compatibilidade)
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

    // Passo 2: Tentar carregar itens individuais procurando pelos nomes na planilha
    const real = _orcadoDatasetAno();
    for (const cat of Object.keys(orcamento)) {
      const items = real[cat] || [];
      orcamento[cat] = {}; // Reinicializa para usar estrutura de itens nomeados

      items.forEach(function(item) {
        orcamento[cat][item.nome] = {};

        // Procurar a linha do item na planilha
        for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
          const row = data[rowIdx];
          if (row && row[0]) {
            const cellVal = (row[0] || '').toString().trim();
            if (cellVal.toLowerCase() === item.nome.toLowerCase()) {
              // Encontrou o item, carregar seus valores mensais
              for (const [mes, colIdx] of Object.entries(colMeses)) {
                const val = row[colIdx];
                let valNum = 0;
                if (typeof val === 'number') valNum = val;
                else if (typeof val === 'string') {
                  const cleaned = val.replace(/[^\d.,\-]/g, '').replace(',', '.');
                  valNum = parseFloat(cleaned) || 0;
                }
                if (valNum !== 0) orcamento[cat][item.nome][mes] = parseFloat((valNum).toFixed(2));
              }
              break;
            }
          }
        }
      });
    }

    DASHBOARD_ORCADO.orcamento = orcamento;
    // Persiste no Supabase pra carregar instantâneo ao abrir (igual o Realizado)
    try {
      if (typeof sbStorage !== 'undefined') await sbStorage.set('orcamento_dados', JSON.stringify(orcamento));
    } catch(e) { console.warn('Não conseguiu salvar orçamento no Supabase:', e); }
    renderDashboardOrcado();
  } catch(e) {
    console.warn('Erro ao carregar orçamento:', e);
  }
}

// Renderiza quando a aba é clicada (via changeView)
