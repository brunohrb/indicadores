// ================================================================
// IXC DADOS — Integração IXC → Dashboard Texnet
// Lê dados sincronizados do Supabase e expõe para o dashboard
// ================================================================

const IXCDados = (() => {

  // Cache local de dados já carregados
  const _cache = {};
  let _ultimaSync = null;
  let _operacional = null;

  // ── Utilitários ─────────────────────────────────────────────

  function _chave(tipo, anoMes) {
    return `ixc_${tipo}_${anoMes}`;
  }

  async function _lerSB(chave) {
    if (_cache[chave] !== undefined) return _cache[chave];
    try {
      const { data, error } = await sb.from('app_storage')
        .select('value, updated_at')
        .eq('key', chave)
        .maybeSingle();
      if (error || !data) { _cache[chave] = null; return null; }
      const valor = JSON.parse(data.value);
      _cache[chave] = valor;
      return valor;
    } catch (e) {
      _cache[chave] = null;
      return null;
    }
  }

  // ── API Pública ──────────────────────────────────────────────

  /**
   * Retorna dados de receitas do mês via IXC.
   * @param {string} anoMes - ex: "2026-03"
   */
  async function getReceitas(anoMes) {
    return await _lerSB(_chave('receitas', anoMes));
  }

  /**
   * Retorna dados de despesas do mês via IXC.
   */
  async function getDespesas(anoMes) {
    return await _lerSB(_chave('despesas', anoMes));
  }

  /**
   * Retorna fluxo de caixa diário do mês.
   */
  async function getFluxoCaixa(anoMes) {
    return await _lerSB(_chave('fluxo', anoMes));
  }

  /**
   * Retorna indicadores operacionais (clientes, usuários).
   */
  async function getOperacional() {
    if (_operacional) return _operacional;
    _operacional = await _lerSB('ixc_operacional');
    return _operacional;
  }

  /**
   * Retorna metadados da última sincronização.
   */
  async function getUltimaSync() {
    if (_ultimaSync) return _ultimaSync;
    _ultimaSync = await _lerSB('ixc_ultima_sync');
    return _ultimaSync;
  }

  /**
   * Verifica se os dados do mês estão disponíveis e recentes.
   * @param {string} anoMes
   * @returns {boolean}
   */
  async function dadosDisponiveis(anoMes) {
    const r = await getReceitas(anoMes);
    return r !== null;
  }

  /**
   * Retorna resumo financeiro do mês (receitas + despesas).
   */
  async function getResumoMes(anoMes) {
    const [rec, desp, fluxo] = await Promise.all([
      getReceitas(anoMes),
      getDespesas(anoMes),
      getFluxoCaixa(anoMes),
    ]);

    if (!rec && !desp) return null;

    return {
      anoMes,
      receitas: rec ? {
        totalRecebido: rec.totalRecebido,
        totalEmitido: rec.totalEmitido,
        totalJurosMulta: rec.totalJurosMulta,
        countRecebido: rec.countRecebido,
      } : null,
      despesas: desp ? {
        totalPago: desp.totalPago,
        countPago: desp.countPago,
        porConta: desp.porConta || [],
      } : null,
      fluxo: fluxo ? fluxo.dias : null,
      saldoMes: (rec?.totalRecebido || 0) - (desp?.totalPago || 0),
    };
  }

  /**
   * Retorna dados de múltiplos meses (para gráficos anuais).
   * @param {number} ano - ex: 2026
   */
  async function getDadosAno(ano) {
    const meses = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const promises = meses.map(m => getResumoMes(`${ano}-${m}`));
    const resultados = await Promise.all(promises);

    return {
      ano,
      meses: resultados,
      totalRecebido: resultados.reduce((s, r) => s + (r?.receitas?.totalRecebido || 0), 0),
      totalPago: resultados.reduce((s, r) => s + (r?.despesas?.totalPago || 0), 0),
    };
  }

  /**
   * Cria badge "Dados IXC — atualizado HH:MM" para exibição no dashboard.
   */
  async function criarBadgeSync() {
    const sync = await getUltimaSync();
    const div = document.createElement('div');
    div.id = 'ixc-sync-badge';
    div.style.cssText = `
      position: fixed; bottom: 16px; left: 16px;
      background: #1e40af; color: white;
      padding: 6px 14px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 9999; display: flex; align-items: center; gap: 6px;
      cursor: pointer;
    `;

    if (sync) {
      const dt = new Date(sync.timestamp);
      const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const data = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      div.innerHTML = `<span>🔄</span> IXC sincronizado: ${data} ${hora}`;
      div.title = `Meses: ${(sync.meses || []).join(', ')}`;
    } else {
      div.style.background = '#dc2626';
      div.innerHTML = `<span>⚠️</span> IXC: sem dados sync`;
      div.title = 'Execute: node ixc-sync/sync.js';
    }

    // Remover badge anterior se existir
    const old = document.getElementById('ixc-sync-badge');
    if (old) old.remove();
    document.body.appendChild(div);

    return div;
  }

  /**
   * Atualiza os cards de KPI do dashboard com dados reais do IXC.
   * Chame esta função após carregar a página.
   */
  async function atualizarKPIs(anoMes) {
    try {
      const [resumo, op] = await Promise.all([
        getResumoMes(anoMes),
        getOperacional(),
      ]);

      // Clientes ativos
      if (op && op.clientesAtivos) {
        const els = document.querySelectorAll('[data-ixc="clientes-ativos"]');
        els.forEach(el => {
          el.textContent = op.clientesAtivos.toLocaleString('pt-BR');
          el.closest?.('.stat-card')?.classList.add('ixc-atualizado');
        });
      }

      // Receita recebida do mês
      if (resumo?.receitas?.totalRecebido) {
        const v = resumo.receitas.totalRecebido;
        const els = document.querySelectorAll('[data-ixc="receita-mes"]');
        els.forEach(el => {
          el.textContent = `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          el.closest?.('.stat-card')?.classList.add('ixc-atualizado');
        });
      }

      // Despesas do mês
      if (resumo?.despesas?.totalPago) {
        const v = resumo.despesas.totalPago;
        const els = document.querySelectorAll('[data-ixc="despesas-mes"]');
        els.forEach(el => {
          el.textContent = `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        });
      }

      await criarBadgeSync();
    } catch (e) {
      console.warn('[IXCDados] Erro ao atualizar KPIs:', e.message);
    }
  }

  /**
   * Renderiza gráfico de fluxo de caixa com dados reais do IXC.
   * @param {string} canvasId - ID do elemento canvas
   * @param {string} anoMes   - ex: "2026-03"
   */
  async function renderizarFluxoCaixa(canvasId, anoMes) {
    const fluxo = await getFluxoCaixa(anoMes);
    if (!fluxo || !fluxo.length) {
      console.warn(`[IXCDados] Fluxo de caixa ${anoMes} não disponível`);
      return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const labels = fluxo.map(d => d.data.substring(8, 10) + '/' + d.data.substring(5, 7));
    const entradas = fluxo.map(d => d.entrada);
    const saidas = fluxo.map(d => d.saida);
    const saldo = fluxo.map(d => d.saldo);

    // Destruir chart anterior se existir
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Entradas',
            data: entradas,
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderColor: '#10b981',
            borderWidth: 1,
          },
          {
            label: 'Saídas',
            data: saidas,
            backgroundColor: 'rgba(239,68,68,0.7)',
            borderColor: '#ef4444',
            borderWidth: 1,
          },
          {
            label: 'Saldo Acumulado',
            data: saldo,
            type: 'line',
            borderColor: '#2563eb',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 3,
            yAxisID: 'saldo',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Fluxo de Caixa — ${anoMes.substring(5, 7)}/${anoMes.substring(0, 4)} (Dados IXC)`,
            font: { size: 14, weight: 'bold' },
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const v = ctx.parsed.y;
                return `${ctx.dataset.label}: R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          x: { stacked: false },
          y: {
            beginAtZero: true,
            ticks: {
              callback: v => 'R$ ' + (v / 1000).toFixed(0) + 'k',
            },
          },
          saldo: {
            position: 'right',
            grid: { display: false },
            ticks: {
              callback: v => 'R$ ' + (v / 1000).toFixed(0) + 'k',
            },
          },
        },
      },
    });
  }

  // Inicialização automática
  window.addEventListener('load', async () => {
    try {
      await criarBadgeSync();
    } catch (e) {
      // silencioso
    }
  });

  function limparCache() {
    Object.keys(_cache).forEach(k => delete _cache[k]);
    _ultimaSync = null;
    _operacional = null;
  }

  return {
    getReceitas,
    getDespesas,
    getFluxoCaixa,
    getOperacional,
    getUltimaSync,
    dadosDisponiveis,
    getResumoMes,
    getDadosAno,
    criarBadgeSync,
    atualizarKPIs,
    renderizarFluxoCaixa,
    limparCache,
  };

})();

// Disponibilizar globalmente
window.IXCDados = IXCDados;
