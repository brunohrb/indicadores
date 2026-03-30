    // ==================== CHARTS ====================
    let charts = {};
    let _chartsFilter = '';

    // ── Painel IXC no Dashboard ───────────────────────────────────
    async function atualizarPainelIXC() {
      try {
        if (typeof IXCDados === 'undefined') return;

        const mesIdx = parseInt(msGetFirst('dashMesFiltro') ?? 0);
        const ano    = msGetFirst('dashAnoFiltro') ?? '2026';
        const anoMes = `${ano}-${String(mesIdx + 1).padStart(2, '0')}`;
        const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

        const painel = document.getElementById('ixc-dashboard-painel');
        if (!painel) return;

        const [resumo, op, sync] = await Promise.all([
          IXCDados.getResumoMes(anoMes),
          IXCDados.getOperacional(),
          IXCDados.getUltimaSync(),
        ]);

        // Só exibe se tiver dados
        if (!resumo && !op) { painel.style.display = 'none'; return; }
        painel.style.display = 'block';

        const brl = v => v != null
          ? 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          : '—';
        const num = v => v != null ? Number(v).toLocaleString('pt-BR') : '—';

        // Período
        const per = document.getElementById('ixc-dash-periodo');
        if (per) per.textContent = MESES_N[mesIdx] + '/' + ano;

        // Hora sync
        const hora = document.getElementById('ixc-dash-sync-hora');
        if (hora && sync) {
          const dt = new Date(sync.timestamp);
          hora.textContent = '🔄 Atualizado: ' + dt.toLocaleDateString('pt-BR') + ' às ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }

        // Clientes ativos
        const elCli = document.getElementById('ixc-dash-clientes');
        if (elCli) elCli.textContent = op ? num(op.clientesAtivos) : '—';

        // Usuários radius
        const elUsr = document.getElementById('ixc-dash-usuarios');
        if (elUsr) elUsr.textContent = op ? num(op.usuariosAtivos) : '—';

        // Recebido
        const elRec = document.getElementById('ixc-dash-recebido');
        const elRecQtd = document.getElementById('ixc-dash-recebido-qtd');
        if (elRec) elRec.textContent = resumo?.receitas ? brl(resumo.receitas.totalRecebido) : '—';
        if (elRecQtd && resumo?.receitas) elRecQtd.textContent = num(resumo.receitas.countRecebido) + ' boletos pagos';

        // Despesas
        const elDesp = document.getElementById('ixc-dash-despesas');
        const elDespQtd = document.getElementById('ixc-dash-despesas-qtd');
        if (elDesp) elDesp.textContent = resumo?.despesas ? brl(resumo.despesas.totalPago) : '—';
        if (elDespQtd && resumo?.despesas) elDespQtd.textContent = num(resumo.despesas.countPago) + ' contas pagas';

        // Saldo
        const saldo = resumo?.saldoMes;
        const elSaldo = document.getElementById('ixc-dash-saldo');
        if (elSaldo) {
          elSaldo.textContent = brl(saldo);
          elSaldo.style.color = saldo >= 0 ? '#bbf7d0' : '#fca5a5';
        }

      } catch (e) {
        console.warn('[IXC Painel]', e.message);
      }
    }
    // ─────────────────────────────────────────────────────────────

    function renderizarGraficos() {

      const MESES   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const mesIdx  = parseInt(msGetFirst('dashMesFiltro') ?? 0);
      const mesKey  = MESES[mesIdx];
      const mesAnterior = mesIdx > 0 ? MESES[mesIdx-1] : null;
      const mesNome = MESES_N[mesIdx];
      const ano     = msGetFirst('dashAnoFiltro') ?? '2026';
      const fc = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
      const fp = v => (v*100).toFixed(1).replace('.',',')+'%';

      // Label período
      const lbl = document.getElementById('dashPeriodoLabel');
      if(lbl) lbl.textContent = mesNome+'/'+ano;

      // Seleciona dados do ano correto
      const _anoMap = {
        '2023': typeof dadosFinanceiros2023 !== 'undefined' ? dadosFinanceiros2023 : null,
        '2024': typeof dadosFinanceiros2024 !== 'undefined' ? dadosFinanceiros2024 : null,
        '2025': typeof dadosFinanceiros2025 !== 'undefined' ? dadosFinanceiros2025 : null,
        '2026': typeof dadosFinanceiros !== 'undefined' ? dadosFinanceiros : null,
      };
      const df = _anoMap[ano] || dadosFinanceiros;

      // === KPIs ===
      const receitas  = df.receitas?.reduce((s,r)=>s+(r[mesKey]||0),0) || 0;
      const custos    = df.custos?.reduce((s,r)=>s+(r[mesKey]||0),0) || 0;
      const despesas  = df.despesas?.reduce((s,r)=>s+(r[mesKey]||0),0) || 0;
      const impostos  = df.impostos?.reduce((s,r)=>s+(r[mesKey]||0),0) || 0;
      const ebitdaItem= df.ebitda_ajustado?.find(r=>r.nome&&r.nome.includes('Ajustado')) || df.ebitda?.[0];
      const ebitda    = ebitdaItem ? (ebitdaItem[mesKey]||0) : 0;
      const custoTotal= custos + despesas;

      // Vs mês anterior
      const recAnterior = mesAnterior ? (df.receitas?.reduce((s,r)=>s+(r[mesAnterior]||0),0)||0) : 0;
      const custAnterior= mesAnterior ? ((df.custos?.reduce((s,r)=>s+(r[mesAnterior]||0),0)||0)+(df.despesas?.reduce((s,r)=>s+(r[mesAnterior]||0),0)||0)) : 0;

      const setKpi = (id, val) => { const e=document.getElementById(id); if(e) e.textContent=fc(val); };
      const setVar = (id, cur, prev) => {
        const e = document.getElementById(id);
        if(!e) return;
        if(!prev || prev===0) { e.textContent=''; return; }
        const pct = ((cur-prev)/prev)*100;
        e.textContent = (pct>=0?'↑ ':'↓ ')+Math.abs(pct).toFixed(1)+'%';
        e.className = 'stat-change '+(pct>=0?'positive':'negative');
      };

      setKpi('dash_receitas', receitas);
      setKpi('dash_custos', custoTotal);
      setKpi('dash_ebitda', ebitda);
      setKpi('dash_impostos', impostos);

      // Variação vs mês anterior com cor
      const setVarSpan = (id, cur, prev) => {
        const e = document.getElementById(id); if(!e) return;
        if(!prev || prev===0) { e.textContent=''; return; }
        const pct = ((cur-prev)/prev)*100;
        e.style.color = pct>=0 ? '#10b981' : '#ef4444';
        e.textContent = (pct>=0?'↑ ':'↓ ')+Math.abs(pct).toFixed(1)+'%';
      };
      setVarSpan('dash_receitas_var', receitas, recAnterior);
      setVarSpan('dash_custos_var', custoTotal, custAnterior);

      const ep = document.getElementById('dash_ebitda_pct');
      if(ep) ep.textContent = receitas>0 ? fp(ebitda/receitas) : '—';
      const ip = document.getElementById('dash_impostos_pct');
      if(ip) ip.textContent = receitas>0 ? fp(impostos/receitas) : '—';

      // === TOOLTIPS detalhamento ===
      const toRow = (nome, val, bold=false) =>
        `<div class="dash-tooltip-row${bold?' dash-tooltip-total':''}">
          <span style="color:#374151;${bold?'font-weight:700':''}">${nome}</span>
          <span style="color:${bold?'#1e293b':'#475569'};${bold?'font-weight:700':''}">${fc(val)}</span>
        </div>`;

      // Receitas tooltip
      const tooltipRec = document.getElementById('dash_tooltip_receitas');
      if(tooltipRec) {
        tooltipRec.innerHTML = (df.receitas||[])
          .filter(r=>(r[mesKey]||0)!==0)
          .map(r=>toRow(r.nome, r[mesKey]||0))
          .join('') + toRow('TOTAL', receitas, true);
      }

      // Despesas tooltip (Impostos + Custos + Despesas separados com subtotal)
      const tooltipDesp = document.getElementById('dash_tooltip_despesas');
      if(tooltipDesp) {
        let html = '<div style="font-size:0.72rem;color:#ef4444;font-weight:700;margin-bottom:0.25rem">Impostos</div>';
        html += (df.impostos||[]).filter(r=>(r[mesKey]||0)!==0).map(r=>toRow(r.nome,r[mesKey]||0)).join('');
        html += '<div style="font-size:0.72rem;color:#f97316;font-weight:700;margin:0.5rem 0 0.25rem">Custos</div>';
        html += (df.custos||[]).filter(r=>(r[mesKey]||0)!==0).map(r=>toRow(r.nome,r[mesKey]||0)).join('');
        html += '<div style="font-size:0.72rem;color:#8b5cf6;font-weight:700;margin:0.5rem 0 0.25rem">Despesas Operacionais</div>';
        html += (df.despesas||[]).filter(r=>(r[mesKey]||0)!==0).map(r=>toRow(r.nome,r[mesKey]||0)).join('');
        html += toRow('TOTAL', custoTotal, true);
        tooltipDesp.innerHTML = html;
      }

      // EBITDA tooltip
      const tooltipEbitda = document.getElementById('dash_tooltip_ebitda');
      if(tooltipEbitda) {
        tooltipEbitda.innerHTML =
          toRow('Receitas', receitas) +
          toRow('(-) Impostos', -impostos) +
          toRow('(-) Custos', -custos) +
          toRow('(-) Despesas', -despesas) +
          toRow('EBITDA Ajustado', ebitda, true);
      }

      // Impostos tooltip
      const tooltipImp = document.getElementById('dash_tooltip_impostos');
      if(tooltipImp) {
        tooltipImp.innerHTML = (df.impostos||[])
          .filter(r=>(r[mesKey]||0)!==0)
          .map(r=>toRow(r.nome, r[mesKey]||0))
          .join('') + toRow('TOTAL', impostos, true);
      }

      // Subtítulos dos gráficos
      const setSub = (id, txt) => { const e=document.getElementById(id); if(e) e.textContent=txt; };
      setSub('dash_sub_rec',   mesNome+'/'+ano+' — Distribuição por categoria');
      setSub('dash_sub_desp',  mesNome+'/'+ano+' — Por tipo');
      setSub('dash_sub_custos',mesNome+'/'+ano+' — Maiores custos');
      const evoLbl = document.getElementById('dashEvoAnoLbl');
      if(evoLbl) evoLbl.textContent = ano;

      // Rebuild charts only when the mes/ano filter actually changes
      const _filterKey = mesIdx + '_' + ano;
      if (_filterKey === _chartsFilter && charts.receitas) return;
      _chartsFilter = _filterKey;
      Object.values(charts).forEach(c=>c.destroy&&c.destroy());
      charts = {};

      const CORES = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6'];

      // === Gráfico Receitas ===
      const recFiltrado = df.receitas?.filter(r=>(r[mesKey]||0)>0) || [];
      charts.receitas = new Chart(document.getElementById('receitasChart'),{
        type:'doughnut',
        data:{labels:recFiltrado.map(r=>r.nome),datasets:[{data:recFiltrado.map(r=>r[mesKey]||0),backgroundColor:CORES}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:10}}},tooltip:{callbacks:{label:ctx=>' '+fc(ctx.raw)}}}}
      });

      // === Gráfico Despesas ===
      const despFiltrado = df.despesas?.filter(d=>(d[mesKey]||0)>0 && d.nome !== 'Pró-Labore') || [];
      charts.despesas = new Chart(document.getElementById('despesasChart'),{
        type:'pie',
        data:{labels:despFiltrado.map(d=>d.nome),datasets:[{data:despFiltrado.map(d=>d[mesKey]||0),backgroundColor:CORES}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{size:10}}},tooltip:{callbacks:{label:ctx=>' '+fc(ctx.raw)}}}}
      });

      // === Gráfico Evolução Mensal ===
      const recMensal  = MESES.map(m=>df.receitas?.reduce((s,r)=>s+(r[m]||0),0)||0);
      const custMensal = MESES.map(m=>(df.custos?.reduce((s,r)=>s+(r[m]||0),0)||0)+(df.despesas?.reduce((s,r)=>s+(r[m]||0),0)||0));
      const ebitdaMensal = MESES.map(m=>{ const e=df.ebitda_ajustado?.find(r=>r.nome&&r.nome.includes('Ajustado'))||df.ebitda?.[0]; return e?(e[m]||0):0; });
      charts.comp = new Chart(document.getElementById('comparativoReceitasChart'),{
        type:'bar',
        data:{
          labels:MTHS_L,
          datasets:[
            {label:'Receitas',    data:recMensal,    backgroundColor:'rgba(37,99,235,0.75)', order:2},
            {label:'Cust+Desp',   data:custMensal,   backgroundColor:'rgba(239,68,68,0.75)', order:2},
            {label:'EBITDA Aj.',  data:ebitdaMensal, type:'line', borderColor:'#059669', backgroundColor:'rgba(5,150,105,0.1)', pointRadius:4, tension:0.3, fill:true, order:1, yAxisID:'y'}
          ]
        },
        options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,ticks:{callback:v=>'R$'+Math.round(v/1000)+'k'}}},plugins:{tooltip:{callbacks:{label:ctx=>ctx.dataset.label+': '+fc(ctx.raw)}}}}
      });

      // === Top 10 Custos ===
      const top10 = [...(df.custos||[])].filter(c=>(c[mesKey]||0)>0).sort((a,b)=>(b[mesKey]||0)-(a[mesKey]||0)).slice(0,10);
      charts.custos = new Chart(document.getElementById('custosChart'),{
        type:'bar',
        data:{labels:top10.map(c=>c.nome.length>22?c.nome.substr(0,20)+'…':c.nome),datasets:[{label:mesNome+'/'+ano,data:top10.map(c=>c[mesKey]||0),backgroundColor:'rgba(245,158,11,0.75)'}]},
        options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',scales:{x:{beginAtZero:true,ticks:{callback:v=>'R$'+Math.round(v/1000)+'k'}}},plugins:{tooltip:{callbacks:{label:ctx=>fc(ctx.raw)}}}}
      });

      // Atualizar painel IXC junto com os gráficos
      atualizarPainelIXC();
    }

