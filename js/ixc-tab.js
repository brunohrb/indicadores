// ================================================================
// IXC TAB — Aba detalhada com dados ao vivo do IXC Soft
// ================================================================

// Mapa de nomes amigáveis para id_contas do IXC
const IXC_NOMES_CONTA = {
  '73': 'Equipamentos / Infraestrutura',
  '77': 'Links / Backbone / Starlink',
  '20': 'Imobilizado / Financiamentos',
  '67': 'Folha de Pagamento',
  '18': 'Marketing / Publicidade',
  '4':  'Combustível / Veículos',
  '33': 'Financiamento de Veículos',
  '34': 'Taxas Bancárias',
  '37': 'Aluguel',
  '22': 'Taxas / Maquineta',
};

let _ixcTabChart = null;

async function renderIXCTab() {
  // Guardar referências dos elementos principais
  const elLoading  = document.getElementById('ixcTab_loading');
  const elConteudo = document.getElementById('ixcTab_conteudo');
  const elSemDados = document.getElementById('ixcTab_semDados');
  const elErro     = document.getElementById('ixcTab_erro');

  function mostrarEstado(estado) {
    // estado: 'loading' | 'conteudo' | 'semDados' | 'erro'
    if (elLoading)  elLoading.style.display  = estado === 'loading'  ? 'flex'  : 'none';
    if (elConteudo) elConteudo.style.display  = estado === 'conteudo' ? 'block' : 'none';
    if (elSemDados) elSemDados.style.display  = estado === 'semDados' ? 'block' : 'none';
    if (elErro)     elErro.style.display      = estado === 'erro'     ? 'block' : 'none';
  }

  // Verificar dependências
  if (typeof IXCDados === 'undefined') {
    mostrarEstado('erro');
    const el = document.getElementById('ixcTab_erroMsg');
    if (el) el.textContent = 'Módulo IXCDados não carregado. Verifique se js/ixc-dados.js está na página.';
    return;
  }

  mostrarEstado('loading');

  try {
    const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    // Lê filtros — usa mês/ano atual como padrão seguro
    const _mesRaw = typeof msGetFirst === 'function' ? msGetFirst('ixcMesFiltro') : null;
    const _anoRaw = typeof msGetFirst === 'function' ? msGetFirst('ixcAnoFiltro') : null;
    const mesIdx  = (_mesRaw != null && !isNaN(parseInt(_mesRaw))) ? parseInt(_mesRaw) : new Date().getMonth();
    const ano     = (_anoRaw != null) ? _anoRaw : String(new Date().getFullYear());
    const anoMes  = `${ano}-${String(mesIdx + 1).padStart(2, '0')}`;
    const mesNome = MESES_N[mesIdx] || '';

    const fc  = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const num = v => Number(v).toLocaleString('pt-BR');

    // Atualiza label período
    const lbl = document.getElementById('ixcTabPeriodoLabel');
    if (lbl) lbl.textContent = mesNome + '/' + ano;

    // Buscar dados do Supabase
    const [resumo, op, sync, fluxoRaw] = await Promise.all([
      IXCDados.getResumoMes(anoMes),
      IXCDados.getOperacional(),
      IXCDados.getUltimaSync(),
      IXCDados.getFluxoCaixa(anoMes),
    ]);

    const fluxo = fluxoRaw?.dias || (Array.isArray(fluxoRaw) ? fluxoRaw : null);

    // Sem dados para este período?
    if (!resumo && !op) {
      mostrarEstado('semDados');
      return;
    }

    // ── Hora da última sync ─────────────────────────────
    const elSync = document.getElementById('ixcTabSyncHora');
    if (elSync && sync) {
      const dt = new Date(sync.timestamp);
      elSync.textContent = '🔄 Atualizado: ' + dt.toLocaleDateString('pt-BR')
        + ' às ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // ── CLIENTES ────────────────────────────────────────
    if (op) {
      const pfTotal = op.clientesPF || 0;
      const pjTotal = op.clientesPJ || 0;
      const total   = pfTotal + pjTotal || 1;
      const pctPF   = (pfTotal / total * 100);
      const pctPJ   = (pjTotal / total * 100);

      _setText('ixcTab_pfTotal', num(pfTotal));
      _setText('ixcTab_pjTotal', num(pjTotal));
      _setText('ixcTab_pfPct',   pctPF.toFixed(1) + '%');
      _setText('ixcTab_pjPct',   pctPJ.toFixed(1) + '%');
      _setText('ixcTab_ativos',  num(op.clientesAtivos || 0));
      _setText('ixcTab_radius',  num(op.usuariosAtivos || 0));
      _setText('ixcTab_totalCad',num(total));

      const barPF = document.getElementById('ixcTab_pfBar');
      const barPJ = document.getElementById('ixcTab_pjBar');
      if (barPF) barPF.style.width = pctPF.toFixed(1) + '%';
      if (barPJ) barPJ.style.width = pctPJ.toFixed(1) + '%';
    }

    // ── RECEITAS ────────────────────────────────────────
    if (resumo?.receitas) {
      const rec = resumo.receitas;
      const avgTicket = rec.countRecebido > 0 ? rec.totalRecebido / rec.countRecebido : 0;
      const pctRec    = rec.totalEmitido > 0 ? (rec.totalRecebido / rec.totalEmitido * 100) : 0;

      _setText('ixcTab_recRecebido', fc(rec.totalRecebido));
      _setText('ixcTab_recEmitido',  fc(rec.totalEmitido || 0));
      _setText('ixcTab_recBoletos',  num(rec.countRecebido) + ' boletos');
      _setText('ixcTab_recTicket',   fc(avgTicket));
      _setText('ixcTab_recJuros',    fc(rec.totalJurosMulta || 0));
      _setText('ixcTab_recBarPct',   pctRec.toFixed(1) + '% do faturado');

      const barRec = document.getElementById('ixcTab_recBar');
      if (barRec) barRec.style.width = Math.min(pctRec, 100).toFixed(1) + '%';
    }

    // ── DESPESAS ────────────────────────────────────────
    if (resumo?.despesas) {
      const desp = resumo.despesas;
      _setText('ixcTab_despTotal', fc(desp.totalPago));
      _setText('ixcTab_despCount', num(desp.countPago) + ' lançamentos');

      const lista = document.getElementById('ixcTab_despLista');
      if (lista && desp.porConta && desp.porConta.length) {
        const maiorValor = desp.porConta[0]?.total || 1;
        lista.innerHTML = desp.porConta.map(c => {
          const nome = IXC_NOMES_CONTA[String(c.id)] || ('Conta #' + c.id);
          const pct  = (c.total / desp.totalPago * 100).toFixed(1);
          const barW = (c.total / maiorValor * 100).toFixed(1);
          return `<div style="margin-bottom:0.75rem">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.2rem">
              <span style="font-size:0.82rem;font-weight:600;color:#1e293b">${nome}</span>
              <span style="font-size:0.82rem;font-weight:700;color:#475569">${fc(c.total)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <div style="flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${barW}%;background:#f97316;border-radius:3px"></div>
              </div>
              <span style="font-size:0.72rem;color:#94a3b8;width:3.5rem;text-align:right">${pct}% · ${c.count}x</span>
            </div>
            ${c.obs ? `<div style="font-size:0.7rem;color:#94a3b8;margin-top:0.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Ex: ${c.obs}</div>` : ''}
          </div>`;
        }).join('');
      } else if (lista) {
        lista.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:1rem">Sem detalhamento disponível</div>';
      }
    }

    // ── FLUXO DE CAIXA ──────────────────────────────────
    if (fluxo && fluxo.length) {
      const canvas = document.getElementById('ixcTabFluxoChart');
      if (canvas) {
        if (_ixcTabChart) { _ixcTabChart.destroy(); _ixcTabChart = null; }
        const labels   = fluxo.map(d => d.data.substring(8,10)+'/'+d.data.substring(5,7));
        const entradas = fluxo.map(d => d.entrada);
        const saidas   = fluxo.map(d => d.saida);
        const saldo    = fluxo.map(d => d.saldo);

        _ixcTabChart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label:'Entradas', data:entradas, backgroundColor:'rgba(16,185,129,0.7)', borderColor:'#10b981', borderWidth:1, order:2 },
              { label:'Saídas',   data:saidas,   backgroundColor:'rgba(239,68,68,0.6)',  borderColor:'#ef4444', borderWidth:1, order:2 },
              { label:'Saldo',    data:saldo,    type:'line', borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,0.08)',
                borderWidth:2, pointRadius:2, fill:true, tension:0.3, order:1, yAxisID:'saldo' },
            ],
          },
          options: {
            responsive:true, maintainAspectRatio:false,
            plugins: {
              legend:{ position:'bottom', labels:{ boxWidth:12, font:{ size:10 } } },
              tooltip:{ callbacks:{ label: ctx => ctx.dataset.label+': '+fc(ctx.raw) } },
            },
            scales: {
              x:{ ticks:{ font:{ size:9 } } },
              y:{ beginAtZero:true, ticks:{ callback: v=>'R$'+Math.round(v/1000)+'k' } },
              saldo:{ position:'right', grid:{ display:false }, ticks:{ callback: v=>'R$'+Math.round(v/1000)+'k' } },
            },
          },
        });
      }

      const totalEnt  = fluxo.reduce((s,d)=>s+d.entrada,0);
      const totalSai  = fluxo.reduce((s,d)=>s+d.saida,0);
      const saldoFinal= fluxo[fluxo.length-1]?.saldo || 0;
      _setText('ixcTab_fluxoEntradas', fc(totalEnt));
      _setText('ixcTab_fluxoSaidas',   fc(totalSai));
      _setText('ixcTab_fluxoSaldo',    fc(saldoFinal));
      const elSF = document.getElementById('ixcTab_fluxoSaldo');
      if (elSF) elSF.style.color = saldoFinal >= 0 ? '#059669' : '#dc2626';
    }

    // Exibir conteúdo
    mostrarEstado('conteudo');

  } catch(e) {
    console.error('[IXC Tab] Erro:', e);
    mostrarEstado('erro');
    const el = document.getElementById('ixcTab_erroMsg');
    if (el) el.textContent = 'Erro: ' + e.message;
  }
}

function _setText(id, txt) {
  const e = document.getElementById(id);
  if (e) e.textContent = txt;
}

async function ixcAtualizarAgora() {
  const btn  = document.getElementById('ixcBtnAtualizar');
  const icon = document.getElementById('ixcBtnIcon');
  if (!btn) return;

  // Estado: carregando
  btn.disabled = true;
  btn.style.background = '#94a3b8';
  btn.style.cursor = 'not-allowed';
  if (icon) icon.textContent = '⏳';

  try {
    // Limpa cache do IXCDados para forçar releitura do Supabase
    if (typeof IXCDados !== 'undefined' && typeof IXCDados.limparCache === 'function') {
      IXCDados.limparCache();
    }
    await renderIXCTab();

    // Feedback de sucesso
    if (icon) icon.textContent = '✅';
    btn.style.background = '#059669';
    setTimeout(() => {
      if (icon) icon.textContent = '🔄';
      btn.style.background = '#2563eb';
      btn.disabled = false;
      btn.style.cursor = 'pointer';
    }, 2000);
  } catch(e) {
    if (icon) icon.textContent = '❌';
    btn.style.background = '#dc2626';
    setTimeout(() => {
      if (icon) icon.textContent = '🔄';
      btn.style.background = '#2563eb';
      btn.disabled = false;
      btn.style.cursor = 'pointer';
    }, 2000);
  }
}
