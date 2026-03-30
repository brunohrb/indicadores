// ==================== INIT ====================
    document.addEventListener('DOMContentLoaded', async () => {
      const _hoje   = new Date();
      const _mes    = _hoje.getMonth();     // 0-11
      const _ano    = _hoje.getFullYear();
      const _mesStr = String(_mes + 1).padStart(2, '0');
      const _mesV   = String(_mes);
      const _anoV   = String(_ano);

      const MS_MESES = [
        {value:'0',label:'Janeiro'},{value:'1',label:'Fevereiro'},{value:'2',label:'Março'},
        {value:'3',label:'Abril'},{value:'4',label:'Maio'},{value:'5',label:'Junho'},
        {value:'6',label:'Julho'},{value:'7',label:'Agosto'},{value:'8',label:'Setembro'},
        {value:'9',label:'Outubro'},{value:'10',label:'Novembro'},{value:'11',label:'Dezembro'}
      ];
      const MS_ANOS_4 = [
        {value:'2026',label:'2026'},{value:'2025',label:'2025'},
        {value:'2024',label:'2024'},{value:'2023',label:'2023'}
      ];
      const MS_ANOS_2 = [{value:'2026',label:'2026'},{value:'2025',label:'2025'}];

      // Dashboard (light theme)
      msCreate('dashMesFiltro',  MS_MESES,  renderizarGraficos,  [_mesV], 'ms-btn-light');
      msCreate('dashAnoFiltro',  MS_ANOS_4, renderizarGraficos,  [_anoV], 'ms-btn-light');

      // IXC Tab (light theme)
      msCreate('ixcMesFiltro',   MS_MESES,  () => { if(typeof renderIXCTab==='function') renderIXCTab(); }, [_mesV], 'ms-btn-light');
      msCreate('ixcAnoFiltro',   MS_ANOS_4, () => { if(typeof renderIXCTab==='function') renderIXCTab(); }, [_anoV], 'ms-btn-light');

      // Indicadores (dark theme)
      msCreate('indMesFiltro',   MS_MESES,  carregarIndicadoresMes, [_mesV], 'ms-btn-dark');
      msCreate('indAnoFiltro',   MS_ANOS_4, carregarIndicadoresMes, [_anoV], 'ms-btn-dark');

      // Comissão Financeiro (dark theme)
      msCreate('comissaoMesFiltro', MS_MESES,  () => renderComissao(),    [_mesV], 'ms-btn-dark');
      msCreate('comissaoAnoFiltro', MS_ANOS_2, () => renderComissao(),    [_anoV], 'ms-btn-dark');

      // Comissão Operacional (dark theme)
      msCreate('opMesFiltro',    MS_MESES,  () => renderComissaoOp(),    [_mesV], 'ms-btn-dark');
      msCreate('opAnoFiltro',    MS_ANOS_2, () => renderComissaoOp(),    [_anoV], 'ms-btn-dark');

      // PRB (dark theme) — initialized with current month/year
      msCreate('prbMesFiltro',   MS_MESES,  prbFiltrar, [_mesV], 'ms-btn-dark');
      msCreate('prbAnoFiltro',   MS_ANOS_4, prbFiltrar, [_anoV], 'ms-btn-dark');

      // Consolidado (input type=month: "YYYY-MM")
      const _consEl = document.getElementById('consolidadoPeriodo');
      if (_consEl) _consEl.value = `${_ano}-${_mesStr}`;

      // Parâmetros/Diretoria
      const _dirMes = document.getElementById('dirMes');
      const _dirAno = document.getElementById('dirAno');
      if (_dirMes) _dirMes.value = String(_mes);
      if (_dirAno) _dirAno.value = String(_ano);

      await carregarParams();
      await consolidadoInicializar();
      renderizarGraficos();
      carregarIndicadoresMes();
      initParamFormatting();
    });
    // ==================== COMISSÃO OPERACIONAL ====================
    function renderComissaoOp() {
      const mesIdx  = parseInt(msGetFirst('opMesFiltro') || '0');
      const ano     = parseInt(msGetFirst('opAnoFiltro') || '2026');
      const MESES   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const mesKey  = MESES[mesIdx];
      const mesNome = MESES_N[mesIdx];
      const fc  = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
      const fp  = v => (v*100).toFixed(2).replace('.',',') + '%';
      // getParam usa parseParamValue — lida corretamente com "0,0600%" → 0.06
      const gpPct = id => getParam(id, 0) / 100;  // campo em % (ex: 0.06) → decimal (0.0006)
      const gp    = id => getParam(id, 0);

      const lbl = document.getElementById('opMesLabel');
      if(lbl) lbl.textContent = mesNome + ' ' + ano;

      // === PARÂMETROS (lidos da aba Parâmetros) ===
      const META_OS_PF      = gpPct('op_metaOsPf');
      const META_OS_PJ      = gpPct('op_metaOsPj');
      const META_CHURN_PF   = gpPct('op_metaChurnPf');
      const META_CHURN_PJ   = gpPct('op_metaChurnPj');
      const META_RETIRADAS  = gpPct('op_metaRetiradas');
      const TICKET_PF       = gp('op_ticketPf');
      const TICKET_PJ       = gp('op_ticketPj');
      const EQUIPAMENTO     = gp('op_equipamento') || 250;  // R$ por retirada

      const PREMIO_OS_PF    = gpPct('op_premioOsPf');    // 0.060% → divide by 100 via gpPct
      const PREMIO_OS_PJ    = gpPct('op_premioOsPj');
      const PREMIO_CHURN_PF = gpPct('op_premioChurnPf');
      const PREMIO_CHURN_PJ = gpPct('op_premioChurnPj');
      const PREMIO_RETIRADAS= gpPct('op_premioRetiradas');
      const PREMIO_RES_POS  = gpPct('op_premioResPos');
      const PREMIO_RES_NEG  = gpPct('op_premioResNeg');
      const PREMIO_EBITDA_MOV= gpPct('op_premioEbitdaMov');

      const META_RESULT_TRIM  = gp('op_metaResultTrim');
      const META_CHURN_FIN_TRIM = gpPct('op_metaChurnFinTrim');
      const Q = [1,2,3,4];
      const META_MAT_EQUIP_Q  = Q.map(q => gpPct('op_metaMatEquip_q'+q));
      const META_FOLHA_Q      = Q.map(q => gpPct('op_metaFolha_q'+q));
      const PREMIO_RESULT_TRIM  = gpPct('op_premioResultTrim');
      const PREMIO_CHURN_FIN_TRIM= gpPct('op_premioChurnFinTrim');
      const PREMIO_MAT_TRIM     = gpPct('op_premioMatEquipTrim');
      const PREMIO_FOLHA_TRIM   = gpPct('op_premioFolhaTrim');
      const PREMIO_EBITDA_TRIM  = gpPct('op_premioEbitdaTrim');

      // === FLUXO DE CAIXA ===
      const ebitdaItem = dadosFinanceiros?.ebitda_ajustado?.find(r => r.nome === 'EBITDA (Ajustado)');
      const ebitda = ebitdaItem ? (ebitdaItem[mesKey] || 0) : 0;
      const fat    = dadosFinanceiros?.receitas?.reduce((s,r)=> s + (r[mesKey]||0), 0) || 0;
      // Meta EBITDA Móvel mensal (% — usa metaEbitda_ da aba Parâmetros)
      const metaEbitdaMov = parseFloat(document.getElementById('metaEbitda_'+mesKey)?.value || '0') / 100;
      const ebitdaPct     = fat > 0 ? ebitda / fat : 0;

      // Mat-Equip = Kit Instalação + Materiais de Rede + Man. Equipamento + Moveis e equip. TI
      const MAT_EQUIP_NOMES = ['Kit Instalação','Materiais de Rede','Man. Equipamento','Moveis e equipamentos escritório TI'];
      const matEquip = dadosFinanceiros?.custos?.filter(c=>MAT_EQUIP_NOMES.includes(c.nome))
                        .reduce((s,c)=>s+(c[mesKey]||0),0) || 0;
      const folhaItem = dadosFinanceiros?.custos?.find(c=>c.nome==='Folha - Direta');
      const folha = folhaItem ? (folhaItem[mesKey]||0) : 0;

      (async () => {
        try {
        const dirEntry = await getDiretoriaDados(mesIdx, ano);
        const D = (dirEntry && dirEntry.dados) ? dirEntry.dados : {};
        const get = (k, fb=0) => (D[k] !== null && D[k] !== undefined && D[k] !== '') ? +D[k] : fb;
        // Reajuste: usa campo dedicado (Parâmetros), fallback para PDF
        const reajusteDedicado = await getReajusteMes(mesIdx);

        const base_pf      = get('base_pf');
        const base_pj      = get('base_pj');
        const base_isentos = get('base_isentos');
        const contratos    = get('contratos', base_pf + base_pj);
        const os_pf        = get('os_pf');
        const os_pj        = get('os_pj');
        const canc_pf      = get('canc_pf');
        const canc_pj      = get('canc_pj');
        const retiradas    = get('retiradas');
        const canc_sr      = get('canc_sr');   // Canc. S/ Retirada
        const canc_1a      = get('canc_1a');   // Canc. 1a Mensalidade
        const reat_ret     = get('reat_ret');  // Reativações Retirada
        const nn_pf        = get('nn_pf');
        const nn_pj        = get('nn_pj');
        const upgrade      = get('upgrade');
        const reat         = get('reat');
        const val_canc_pf  = get('val_canc_pf', canc_pf * TICKET_PF);
        const val_canc_pj  = get('val_canc_pj', canc_pj * TICKET_PJ);
        const downgrade    = Math.abs(get('downgrade'));  // sempre positivo
        const reajuste_op  = reajusteDedicado > 0 ? reajusteDedicado : ((+D['reajuste_pf']||0) + (+D['reajuste_pj']||0)) > 0 ? ((+D['reajuste_pf']||0) + (+D['reajuste_pj']||0)) : (D['reajuste'] != null ? +D['reajuste'] : 0);

        // === INDICADORES ===
        const pct_os_pf     = contratos  > 0 ? os_pf   / contratos : 0;
        const pct_os_pj     = base_pj    > 0 ? os_pj   / base_pj   : 0;
        const pct_churn_pf  = base_pf    > 0 ? canc_pf / base_pf   : 0;
        const pct_churn_pj  = base_pj    > 0 ? canc_pj / base_pj   : 0;
        const total_canc_qtd= canc_pf + canc_pj;
        // % Retiradas = Retiradas / (Canc.PF + Canc.PJ - Canc.S/Retirada - Reativação)
        // Fórmula planilha: =IF(B22=0,0,B22/(B18+B20-Base!B18-Base!B19))
        const denom_retiradas = Math.max(total_canc_qtd - canc_sr - reat_ret, 0);
        const pct_retiradas = denom_retiradas > 0 ? retiradas / denom_retiradas : 0;

        // Churn Financeiro = valor cancelado / faturamento base
        const churnFin = fat > 0 ? (val_canc_pf + val_canc_pj) / fat : 0;

        // Resultado R$
        const nn_total   = nn_pf + nn_pj + upgrade + reat + reajuste_op;
        const canc_total = val_canc_pf + val_canc_pj + downgrade;
        const resultado  = nn_total - canc_total;

        // === COMISSÕES MENSAIS ===
        const comOS_PF    = pct_os_pf    <= META_OS_PF    ? ebitda * PREMIO_OS_PF    : 0;
        const comOS_PJ    = pct_os_pj    <= META_OS_PJ    ? ebitda * PREMIO_OS_PJ    : 0;
        const comChurn_PF = pct_churn_pf <= META_CHURN_PF ? ebitda * PREMIO_CHURN_PF : 0;
        const comChurn_PJ = pct_churn_pj <= META_CHURN_PJ ? ebitda * PREMIO_CHURN_PJ : 0;
        // Retiradas: =IF(pct%>=meta, pct%*Premio*Equipamento*qtd, 0)  [planilha: B23*Q11*P12*B22]
        const comRetiradas = pct_retiradas >= META_RETIRADAS
          ? pct_retiradas * PREMIO_RETIRADAS * EQUIPAMENTO * retiradas : 0;
        const comResPOS   = resultado > 0 ? resultado * PREMIO_RES_POS : 0;
        const comResNEG   = resultado < 0 ? Math.abs(resultado) * PREMIO_RES_NEG * -1 : 0;
        // 1a Mensalidade: penalidade se % canc 1a > 2,7% de contratos
        // Planilha: =IF(B25>P13, B25*Q13*B26, 0) onde Q13=-0.05
        const META_1A_MENS  = gpPct('op_meta1aMens') || 0.027;
        const PREMIO_1A_MENS = -0.05;
        const pct_1a  = contratos > 0 ? canc_1a / contratos : 0;
        const com1aMens = pct_1a > META_1A_MENS
          ? pct_1a * PREMIO_1A_MENS * nn_total : 0;
        // EBITDA Móvel: só paga se EBITDA% >= meta mensal  [planilha: IF(B41>=B42, B40*Q16, 0)]
        const comEbitda = (metaEbitdaMov > 0 && ebitdaPct >= metaEbitdaMov)
          ? ebitda * PREMIO_EBITDA_MOV : 0;
        const totalMensal = comOS_PF + comOS_PJ + comChurn_PF + comChurn_PJ +
                            comRetiradas + comResPOS + comResNEG + com1aMens + comEbitda;

        // === BÔNUS TRIMESTRAL ===
        const TRIMS = [
          {n:'1º Trim',meses:['jan','fev','mar'],idx:[0,1,2],qi:0},
          {n:'2º Trim',meses:['abr','mai','jun'],idx:[3,4,5], qi:1},
          {n:'3º Trim',meses:['jul','ago','set'],idx:[6,7,8], qi:2},
          {n:'4º Trim',meses:['out','nov','dez'],idx:[9,10,11],qi:3},
        ];
        const trim = TRIMS.find(t => t.idx.includes(mesIdx));
        const isTrimFim = trim && trim.idx[2] === mesIdx;
        const mesesAte  = trim ? trim.meses.slice(0, trim.idx.indexOf(mesIdx)+1) : [];

        const soma = (cat, nome, ms) => ms.reduce((s,m) => {
          const item = dadosFinanceiros?.[cat]?.find(r=>r.nome===nome);
          return s + (item ? (item[m]||0) : 0);
        }, 0);
        const somaMulti = (cat, nomes, ms) => ms.reduce((s,m) => {
          return s + (dadosFinanceiros?.[cat]?.filter(r=>nomes.includes(r.nome)).reduce((a,r)=>a+(r[m]||0),0)||0);
        }, 0);

        const ebitdaAcum    = soma('ebitda_ajustado','EBITDA (Ajustado)', mesesAte);
        const fatAcum       = mesesAte.reduce((s,m)=>s+(dadosFinanceiros?.receitas?.reduce((a,r)=>a+(r[m]||0),0)||0),0);
        const matEquipAcum  = somaMulti('custos', MAT_EQUIP_NOMES, mesesAte);
        const folhaAcum     = soma('custos','Folha - Direta', mesesAte);

        // Acumula resultado do trimestre lendo PDF de cada mês (simplificado: usa valor do mês atual * nMeses)
        const nMeses        = mesesAte.length;
        const resultadoAcum = resultado * nMeses;  // aproximação; idealmente buscaria cada mês

        const qi = trim ? trim.qi : 0;
        const metaMatEquip  = META_MAT_EQUIP_Q[qi] || 0;
        const metaFolha     = META_FOLHA_Q[qi] || 0;
        const matEquipPct   = fatAcum > 0 ? matEquipAcum / fatAcum : 0;
        const folhaPct      = fatAcum > 0 ? folhaAcum    / fatAcum : 0;

        // Churn Fin acumulado trimestre
        // Simplificado: média dos meses disponíveis
        const churnFinAcum  = churnFin;  // usa o do mês atual

        const bonResOk    = isTrimFim && resultadoAcum >= META_RESULT_TRIM;
        const bonChurnOk  = isTrimFim && churnFinAcum  <= META_CHURN_FIN_TRIM;
        const bonMatOk    = isTrimFim && metaMatEquip > 0 && matEquipPct <= metaMatEquip;
        const bonFolhaOk  = isTrimFim && metaFolha    > 0 && folhaPct    <= metaFolha;
        const bonEbitdaOk = isTrimFim && ebitdaAcum > 0;  // Ebitda sempre pago se positivo no fim do trim

        const bonRes    = bonResOk    ? ebitdaAcum * PREMIO_RESULT_TRIM   : 0;
        const bonChurn  = bonChurnOk  ? ebitdaAcum * PREMIO_CHURN_FIN_TRIM: 0;
        const bonMat    = bonMatOk    ? ebitdaAcum * PREMIO_MAT_TRIM      : 0;
        const bonFolha  = bonFolhaOk  ? ebitdaAcum * PREMIO_FOLHA_TRIM    : 0;
        const bonEbitda = bonEbitdaOk ? ebitdaAcum * PREMIO_EBITDA_TRIM   : 0;
        const totalTrim = bonRes + bonChurn + bonMat + bonFolha + bonEbitda;

        // ======== HELPERS DE RENDER ========
        const badge = (ok, tOk, tNo) =>
          `<span style="background:${ok?'#d1fae5':'#fee2e2'};color:${ok?'#065f46':'#991b1b'};padding:0.2rem 0.65rem;border-radius:12px;font-size:0.78rem;font-weight:700">${ok?'✓ '+tOk:'✗ '+tNo}</span>`;

        const rowInd = (icon, label, qtd, meta, real, ok, isMax=true) => {
          const dir = isMax ? '≤' : '≥';
          return `<div style="background:${ok?'#f0fdf4':'#fff7f7'};border:1px solid ${ok?'#bbf7d0':'#fecaca'};border-radius:12px;padding:1rem 1.25rem;display:flex;justify-content:space-between;align-items:center;gap:1rem">
            <div style="display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:1.4rem">${icon}</span>
              <div>
                <div style="font-weight:700;color:#1e293b;font-size:0.92rem">${label} <span style="font-weight:400;color:#64748b;font-size:0.8rem">(${qtd})</span></div>
                <div style="font-size:0.8rem;color:#64748b;margin-top:0.1rem">Meta ${dir} <strong>${fp(meta)}</strong> &nbsp;|&nbsp; Real: <strong>${fp(real)}</strong></div>
              </div>
            </div>
            ${badge(ok,'Meta atingida','Fora da meta')}
          </div>`;
        };

        const rowComissao = (label, valor, ok, detalhe='') =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 1rem;border-radius:10px;background:${ok?'#f0fdf4':valor<0?'#fff7f7':'#f8fafc'};margin-bottom:0.5rem">
            <div>
              <span style="font-weight:600;color:#1e293b;font-size:0.9rem">${label}</span>
              ${detalhe?`<span style="font-size:0.75rem;color:#64748b;margin-left:0.5rem">${detalhe}</span>`:''}
            </div>
            <strong style="color:${valor===0?'#94a3b8':ok?'#065f46':'#dc2626'};font-size:0.95rem">${fc(valor)}</strong>
          </div>`;

        const rowLine = (label, valor, cor='#374151', hint='') =>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid #f1f5f9">
            <span style="color:#374151;font-size:0.88rem">${label}${hint ? ` <em style="font-size:0.73rem;color:#94a3b8;font-style:italic">${hint}</em>` : ''}</span>
            <strong style="color:${cor}">${fc(valor)}</strong>
          </div>`;

        const bonCard = (icon, titulo, metaStr, realStr, premio, ok) => {
          const wait = !isTrimFim;
          return `<div style="background:${ok?'#f0fdf4':wait?'#fefce8':'#fff7f7'};border:1px solid ${ok?'#bbf7d0':wait?'#fde68a':'#fecaca'};border-radius:14px;padding:1.25rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
              <span style="font-size:1.1rem">${icon}</span>
              ${ok?badge(true,'Atingido',''):wait?'<span style="background:#fef3c7;color:#92400e;padding:0.2rem 0.6rem;border-radius:12px;font-size:0.75rem;font-weight:700">⏳ Aguardando fim do trimestre</span>':badge(false,'','Não atingido')}
            </div>
            <div style="font-weight:700;color:#1e293b;margin-bottom:0.35rem;font-size:0.92rem">${titulo}</div>
            <div style="font-size:0.8rem;color:#64748b">Meta: ${metaStr} &nbsp;|&nbsp; Real: ${realStr}</div>
            <div style="margin-top:0.75rem;font-size:1.1rem;font-weight:800;color:${ok?'#065f46':'#94a3b8'}">${fc(premio)}</div>
          </div>`;
        };

        // ── Indicadores ──
        document.getElementById('opIndicadores').innerHTML =
          rowInd('📞','OS Suporte PF', os_pf+' OS',     META_OS_PF,   pct_os_pf,    pct_os_pf  <=META_OS_PF)  +
          rowInd('📞','OS Suporte PJ', os_pj+' OS',     META_OS_PJ,   pct_os_pj,    pct_os_pj  <=META_OS_PJ)  +
          rowInd('📉','Churn PF',      canc_pf+' canc.',META_CHURN_PF,pct_churn_pf, pct_churn_pf<=META_CHURN_PF)+
          rowInd('📉','Churn PJ',      canc_pj+' canc.',META_CHURN_PJ,pct_churn_pj, pct_churn_pj<=META_CHURN_PJ)+
          rowInd('↩️','Retiradas', retiradas+' ret.',META_RETIRADAS,pct_retiradas,pct_retiradas>=META_RETIRADAS,false)+
          `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:1rem 1.25rem">
            <div style="font-size:0.75rem;color:#64748b;margin-bottom:0.5rem;font-weight:600">📋 BASE DE CLIENTES</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;font-size:0.85rem">
              <span>👤 PF: <strong>${base_pf.toLocaleString('pt-BR')}</strong></span>
              <span>🏢 PJ: <strong>${base_pj.toLocaleString('pt-BR')}</strong></span>
              <span>🆓 Isentos: <strong>${base_isentos.toLocaleString('pt-BR')}</strong></span>
              <span>📋 Contratos: <strong>${contratos.toLocaleString('pt-BR')}</strong></span>
            </div>
          </div>` +
          `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:1rem 1.25rem">
            <div style="font-size:0.75rem;color:#64748b;margin-bottom:0.5rem;font-weight:600">📊 FLUXO DE CAIXA — ${mesNome}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;font-size:0.85rem">
              <span>💰 Faturamento: <strong>${fc(fat)}</strong></span>
              <span>📊 EBITDA Aj.: <strong>${fc(ebitda)}</strong></span>
              <span>🔧 Mat-Equip: <strong>${fc(matEquip)}</strong> <em style="color:#64748b">(${fp(fat>0?matEquip/fat:0)})</em></span>
              <span>👥 Folha: <strong>${fc(folha)}</strong> <em style="color:#64748b">(${fp(fat>0?folha/fat:0)})</em></span>
            </div>
          </div>`;

        // ── Novos Negócios ──
        document.getElementById('opNovosNegocios').innerHTML =
          rowLine('Novos PF', nn_pf, '#065f46') +
          rowLine('Novos PJ', nn_pj, '#065f46') +
          rowLine('UpGrade', upgrade, '#065f46') +
          rowLine('Reativação', reat, '#065f46') +
          (reajuste_op > 0 ? rowLine('Reajuste Contratos', reajuste_op, '#065f46') : '') +
          `<div style="display:flex;justify-content:space-between;padding:0.75rem 0;font-size:0.95rem">
            <strong style="color:#065f46">TOTAL NOVOS</strong>
            <strong style="color:#065f46">${fc(nn_total)}</strong>
          </div>`;

        // ── Cancelamentos ──
        document.getElementById('opCancelamentos').innerHTML =
          rowLine('Cancelamentos PF', val_canc_pf, '#991b1b') +
          rowLine('Cancelamentos PJ', val_canc_pj, '#991b1b') +
          rowLine('DownGrade', downgrade, '#991b1b') +  /* downgrade já é positivo via Math.abs */
          `<div style="display:flex;justify-content:space-between;padding:0.75rem 0;font-size:0.95rem">
            <strong style="color:#991b1b">TOTAL CANC.</strong>
            <strong style="color:#991b1b">${fc(canc_total)}</strong>
          </div>`;

        // ── Resultado ──
        const resOk = resultado > 0;
        document.getElementById('opResultadoCard').innerHTML =
          `<div style="background:${resOk?'linear-gradient(135deg,#065f46,#059669)':'linear-gradient(135deg,#991b1b,#dc2626)'};border-radius:16px;padding:1.25rem 1.75rem;color:white;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:0.85rem;opacity:0.85;font-weight:600">${resOk?'📈':'📉'} RESULTADO LÍQUIDO (Novos − Cancelamentos)</div>
              <div style="font-size:1.75rem;font-weight:800;margin-top:0.25rem">${fc(resultado)}</div>
            </div>
            <div style="text-align:right;font-size:0.82rem;opacity:0.85">
              <div>Novos: ${fc(nn_total)}</div>
              <div>Canc.: ${fc(canc_total)}</div>
              <div style="margin-top:0.35rem">Churn Fin.: <strong>${fp(churnFin)}</strong></div>
            </div>
          </div>`;

        // ── Comissões Mensais ──
        document.getElementById('opComissoesMensais').innerHTML =
          rowComissao('OS Suporte PF',     comOS_PF,    pct_os_pf   <=META_OS_PF,    fp(PREMIO_OS_PF)+'% EBITDA') +
          rowComissao('OS Suporte PJ',     comOS_PJ,    pct_os_pj   <=META_OS_PJ,    fp(PREMIO_OS_PJ)+'% EBITDA') +
          rowComissao('Churn PF',          comChurn_PF, pct_churn_pf<=META_CHURN_PF,  fp(PREMIO_CHURN_PF)+'% EBITDA') +
          rowComissao('Churn PJ',          comChurn_PJ, pct_churn_pj<=META_CHURN_PJ,  fp(PREMIO_CHURN_PJ)+'% EBITDA') +
          rowComissao('Retiradas',         comRetiradas,pct_retiradas>=META_RETIRADAS,fp(PREMIO_RETIRADAS)+'% EBITDA') +
          rowComissao('Resultado Positivo',comResPOS,   comResPOS>0, fp(PREMIO_RES_POS)+'% do resultado') +
          rowComissao('Resultado Negativo',comResNEG,   false,       '-'+fp(PREMIO_RES_NEG)+'% do resultado') +
          rowComissao('1a Mensalidade (penalidade)', com1aMens, com1aMens===0, pct_1a<=META_1A_MENS ? '✓ Dentro do limite ('+fp(META_1A_MENS)+')' : '-5% Novos Negócios') +
          rowComissao('EBITDA Móvel',      comEbitda,   comEbitda>0, fp(PREMIO_EBITDA_MOV)+'% EBITDA');

        // Total geral renderizado DEPOIS do bônus (DOM já existe)
        const _renderTotalGeral = () => {
          const totalGeral = totalMensal + totalTrim;
          const el = document.getElementById('opTotalMensal');
          if (!el) return;
          el.innerHTML =
            `<div style="background:linear-gradient(135deg,#1e3a8a,#7c3aed);border-radius:14px;padding:1.4rem 1.75rem;color:white;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:0.72rem;font-weight:600;opacity:0.7;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:0.3rem">Comissão — ${mesNome} ${ano}</div>
                <div style="font-size:1.8rem;font-weight:900">${fc(totalGeral)}</div>
              </div>
              <div style="display:flex;gap:2rem;font-size:0.82rem;text-align:right">
                <div><div style="opacity:0.65;font-size:0.7rem;margin-bottom:0.2rem">Mensal</div><div style="font-weight:700">${fc(totalMensal)}</div></div>
                ${totalTrim > 0 ? `<div><div style="opacity:0.65;font-size:0.7rem;margin-bottom:0.2rem">🏅 Bônus Trim.</div><div style="font-weight:700;color:#fde68a">${fc(totalTrim)}</div></div>` : ''}
              </div>
            </div>`;
        };
        _renderTotalGeral();

        // ── Bônus Trimestral ──
        const trimNome = trim ? trim.n : '';
        document.getElementById('opBonusTrimestral').innerHTML =
          bonCard('📊','Resultado Acumulado ≥ '+fc(META_RESULT_TRIM),
            fc(META_RESULT_TRIM), fc(resultadoAcum), bonRes, bonResOk) +
          bonCard('📉','Churn Financeiro Acumulado ≤ '+fp(META_CHURN_FIN_TRIM),
            fp(META_CHURN_FIN_TRIM), fp(churnFinAcum), bonChurn, bonChurnOk) +
          bonCard('🔧', 'Mat-Equip % Fat. ≤ '+fp(metaMatEquip),
            fp(metaMatEquip), fp(matEquipPct), bonMat, bonMatOk) +
          bonCard('👥','Folha % Fat. ≤ '+fp(metaFolha),
            fp(metaFolha), fp(folhaPct), bonFolha, bonFolhaOk) +
          bonCard('💹','EBITDA Trim. positivo',
            '> 0', fc(ebitdaAcum), bonEbitda, bonEbitdaOk);

        if(isTrimFim) {
          document.getElementById('opBonusTrimestral').innerHTML +=
            `<div style="grid-column:1/-1;background:linear-gradient(135deg,#d97706,#f59e0b);border-radius:14px;padding:1.25rem 1.75rem;color:white;display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:0.9rem;font-weight:600;opacity:0.9">🏅 TOTAL BÔNUS TRIMESTRAL — ${trimNome}</div>
              <div style="font-size:1.6rem;font-weight:800">${fc(totalTrim)}</div>
            </div>`;
        }

        } catch(err) {
          console.error('renderComissaoOp erro:', err);
          ['opIndicadores','opNovosNegocios','opCancelamentos','opResultadoCard',
           'opComissoesMensais','opTotalMensal','opBonusTrimestral'].forEach(id => {
            const el = document.getElementById(id);
            if(el && !el.innerHTML) el.innerHTML = '<div style="color:#dc2626;padding:1rem">Erro: '+err.message+'</div>';
          });
        }
      })(); // end async
    }


    // ═══════════════════════════════════════════════════════
    // MARCOS — IA por aba
    // ═══════════════════════════════════════════════════════
    let marcosContext = 'dashboard';
    let marcosHistory = [];