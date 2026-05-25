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
        // GUARD: se o mês está FECHADO, restaura o snapshot (HTML congelado) e sai.
        const _opFechado = await getComissaoOpFechado(mesIdx, ano);
        if (_opFechado) {
          _restaurarComissaoOpFechado(mesIdx, ano, _opFechado);
          return;
        }
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
        // Reajuste: se a fonte é Power BI (Maio/2026+), usa reajuste_pf+pj do PBI.
        // Senão (legado): campo dedicado (Parâmetros) → PDF.
        const _reajPBI = (+D['reajuste_pf']||0) + (+D['reajuste_pj']||0);
        const reajuste_op = D.__fonte === 'powerbi'
          ? _reajPBI
          : (reajusteDedicado > 0 ? reajusteDedicado : (_reajPBI > 0 ? _reajPBI : (D['reajuste'] != null ? +D['reajuste'] : 0)));

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
        const nn_total   = nn_pf + nn_pj + upgrade + reajuste_op;
        const canc_total = val_canc_pf + val_canc_pj + downgrade - reat;
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
        // Status do trimestre baseado na data REAL (não no mês selecionado).
        // Padrão da aba Comissão Financeiro: ended / current / future
        const _hoje = new Date();
        const _hojeAno = _hoje.getFullYear();
        const _hojeTrimIdx = Math.floor(_hoje.getMonth() / 3);
        const trimQi = trim ? trim.qi : -1;
        let trimStatus = 'future';
        if (trim) {
          if (ano < _hojeAno || (ano === _hojeAno && trimQi < _hojeTrimIdx)) trimStatus = 'ended';
          else if (ano === _hojeAno && trimQi === _hojeTrimIdx)              trimStatus = 'current';
          else                                                                trimStatus = 'future';
        }
        const trimEndedReal = trimStatus === 'ended';
        // Avalia bônus se: trim já acabou OU usuário está no último mês do trim atual
        const isTrimFim = trimEndedReal || (trim && trimStatus === 'current' && trim.idx[2] === mesIdx);
        // Se trim acabou, acumula os 3 meses inteiros; senão, só até o mês selecionado
        const mesesAte  = trim
          ? (trimEndedReal ? trim.meses : trim.meses.slice(0, trim.idx.indexOf(mesIdx)+1))
          : [];

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

        // Acumula resultado real de cada mês do trimestre (Novos − Cancelamentos)
        // e cancelamentos brutos (PF+PJ) pra churn fin. acumulado.
        // O mês atual já está calculado em `resultado`; os anteriores são buscados do storage
        const MESES_IDX = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
        let resultadoAcum = resultado; // já inclui o mês atual
        let cancAcumTrim  = val_canc_pf + val_canc_pj; // mês atual
        const mesesAnteriores = mesesAte.filter(mK => mK !== mesKey);
        for (const mK of mesesAnteriores) {
          const mI = MESES_IDX.indexOf(mK);
          const dirM = await getDiretoriaDados(mI, ano);
          const DM = (dirM && dirM.dados) ? dirM.dados : {};
          const getM = (k, fb=0) => (DM[k] !== null && DM[k] !== undefined && DM[k] !== '') ? +DM[k] : fb;
          const reajM = await getReajusteMes(mI);
          const nn_pf_m  = getM('nn_pf');
          const nn_pj_m  = getM('nn_pj');
          const upg_m    = getM('upgrade');
          const reat_m   = getM('reat');
          const _reajPBI_m = (+DM['reajuste_pf']||0)+(+DM['reajuste_pj']||0);
          const raj_m    = DM.__fonte === 'powerbi'
                           ? _reajPBI_m
                           : (reajM > 0 ? reajM : (_reajPBI_m > 0 ? _reajPBI_m : (DM['reajuste'] != null ? +DM['reajuste'] : 0)));
          const cpf_m    = getM('canc_pf');
          const cpj_m    = getM('canc_pj');
          const vcpf_m   = getM('val_canc_pf', cpf_m * TICKET_PF);
          const vcpj_m   = getM('val_canc_pj', cpj_m * TICKET_PJ);
          const dng_m    = Math.abs(getM('downgrade'));
          const nn_tot_m = nn_pf_m + nn_pj_m + upg_m + raj_m;
          const cc_tot_m = vcpf_m + vcpj_m + dng_m - reat_m;
          resultadoAcum += nn_tot_m - cc_tot_m;
          cancAcumTrim  += vcpf_m + vcpj_m;
        }

        const qi = trim ? trim.qi : 0;
        const metaMatEquip  = META_MAT_EQUIP_Q[qi] || 0;
        const metaFolha     = META_FOLHA_Q[qi] || 0;
        const matEquipPct   = fatAcum > 0 ? matEquipAcum / fatAcum : 0;
        const folhaPct      = fatAcum > 0 ? folhaAcum    / fatAcum : 0;

        // Churn Fin acumulado trimestre = total cancelado no trim / total faturamento no trim
        const churnFinAcum = fatAcum > 0 ? cancAcumTrim / fatAcum : 0;

        // Lê metaTrim_q diretamente do DOM com parse BRL (ex: "2.401.769,91" → 2401769.91)
        const _metaTrimEl  = document.getElementById('metaTrim_q' + (qi + 1));
        const _metaTrimRaw = _metaTrimEl ? _metaTrimEl.value.replace(/\./g,'').replace(',','.') : '0';
        const metaEbitdaTrim = parseFloat(_metaTrimRaw) || 0;

        // Avalia meta independente de "trim acabou" — usado no badge (Atingido / Não atingido)
        const bonResMetaOk    = META_RESULT_TRIM     > 0 && resultadoAcum >= META_RESULT_TRIM;
        const bonChurnMetaOk  = META_CHURN_FIN_TRIM  > 0 && churnFinAcum  <= META_CHURN_FIN_TRIM;
        const bonMatMetaOk    = metaMatEquip         > 0 && matEquipPct   <= metaMatEquip;
        const bonFolhaMetaOk  = metaFolha            > 0 && folhaPct      <= metaFolha;
        const bonEbitdaMetaOk = metaEbitdaTrim       > 0 && ebitdaAcum    >= metaEbitdaTrim;

        // Bônus só é pago se trim acabou (isTrimFim) E meta atingida
        const bonRes    = isTrimFim && bonResMetaOk    ? ebitdaAcum * PREMIO_RESULT_TRIM   : 0;
        const bonChurn  = isTrimFim && bonChurnMetaOk  ? ebitdaAcum * PREMIO_CHURN_FIN_TRIM: 0;
        const bonMat    = isTrimFim && bonMatMetaOk    ? ebitdaAcum * PREMIO_MAT_TRIM      : 0;
        const bonFolha  = isTrimFim && bonFolhaMetaOk  ? ebitdaAcum * PREMIO_FOLHA_TRIM    : 0;
        const bonEbitda = isTrimFim && bonEbitdaMetaOk ? ebitdaAcum * PREMIO_EBITDA_TRIM   : 0;
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

        // Padrão de badges igual à aba Comissão Financeiro
        const bonCard = (icon, titulo, metaStr, realStr, premio, metaOk, hasMeta) => {
          let badgeHtml, bgColor, borderColor, valColor;
          if (!hasMeta) {
            badgeHtml   = '<span style="background:#f1f5f9;color:#94a3b8;padding:0.2rem 0.65rem;border-radius:12px;font-size:0.78rem">Sem meta</span>';
            bgColor='#f8fafc'; borderColor='#e2e8f0'; valColor='#94a3b8';
          } else if (isTrimFim) {
            if (metaOk) {
              badgeHtml = '<span style="background:#d1fae5;color:#065f46;padding:0.2rem 0.65rem;border-radius:12px;font-size:0.78rem;font-weight:700">✓ Atingido</span>';
              bgColor='#f0fdf4'; borderColor='#bbf7d0'; valColor='#065f46';
            } else {
              badgeHtml = '<span style="background:#fee2e2;color:#991b1b;padding:0.2rem 0.65rem;border-radius:12px;font-size:0.78rem;font-weight:700">✗ Não atingido</span>';
              bgColor='#fff7f7'; borderColor='#fecaca'; valColor='#94a3b8';
            }
          } else if (trimStatus === 'current') {
            badgeHtml = '<span style="background:#fef3c7;color:#92400e;padding:0.2rem 0.65rem;border-radius:12px;font-size:0.78rem;font-weight:700">⏳ Em andamento</span>';
            bgColor='#fefce8'; borderColor='#fde68a'; valColor='#94a3b8';
          } else {
            badgeHtml = '<span style="background:#f1f5f9;color:#94a3b8;padding:0.2rem 0.65rem;border-radius:12px;font-size:0.78rem">Aguardando trimestre</span>';
            bgColor='#f8fafc'; borderColor='#e2e8f0'; valColor='#94a3b8';
          }
          return `<div style="background:${bgColor};border:1px solid ${borderColor};border-radius:14px;padding:1.25rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
              <span style="font-size:1.1rem">${icon}</span>
              ${badgeHtml}
            </div>
            <div style="font-weight:700;color:#1e293b;margin-bottom:0.35rem;font-size:0.92rem">${titulo}</div>
            <div style="font-size:0.8rem;color:#64748b">Meta: ${metaStr} &nbsp;|&nbsp; Real: ${realStr}</div>
            <div style="margin-top:0.75rem;font-size:1.1rem;font-weight:800;color:${valColor}">${fc(premio)}</div>
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
          (reajuste_op > 0 ? rowLine('Reajuste Contratos', reajuste_op, '#065f46') : '') +
          `<div style="display:flex;justify-content:space-between;padding:0.75rem 0;font-size:0.95rem">
            <strong style="color:#065f46">TOTAL NOVOS</strong>
            <strong style="color:#065f46">${fc(nn_total)}</strong>
          </div>`;

        // ── Cancelamentos (Reativação entra como subtração) ──
        document.getElementById('opCancelamentos').innerHTML =
          rowLine('Cancelamentos PF', val_canc_pf, '#991b1b') +
          rowLine('Cancelamentos PJ', val_canc_pj, '#991b1b') +
          rowLine('DownGrade', downgrade, '#991b1b') +  /* downgrade já é positivo via Math.abs */
          rowLine('Reativação (−)', -reat, '#065f46', 'reduz cancelamento') +
          `<div style="display:flex;justify-content:space-between;padding:0.75rem 0;font-size:0.95rem">
            <strong style="color:#991b1b">TOTAL CANC.</strong>
            <strong style="color:#991b1b">${fc(canc_total)}</strong>
          </div>`;

        // ── Resultado ── (estilo discreto pra não competir com o card de comissão)
        const resOk = resultado > 0;
        const corRes = resOk ? '#065f46' : '#991b1b';
        const bgRes  = resOk ? '#f0fdf4' : '#fef2f2';
        const bordaRes = resOk ? '#86efac' : '#fca5a5';
        document.getElementById('opResultadoCard').innerHTML =
          `<div style="background:${bgRes};border:1px solid ${bordaRes};border-radius:12px;padding:0.85rem 1.25rem;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:0.78rem;color:#64748b;font-weight:600">${resOk?'📈':'📉'} Resultado Líquido (Novos − Cancelamentos)</div>
              <div style="font-size:1.15rem;font-weight:700;color:${corRes};margin-top:0.15rem">${fc(resultado)}</div>
            </div>
            <div style="text-align:right;font-size:0.74rem;color:#64748b">
              <div>Novos: <span style="color:#1e293b;font-weight:600">${fc(nn_total)}</span></div>
              <div>Canc.: <span style="color:#1e293b;font-weight:600">${fc(canc_total)}</span></div>
              <div style="margin-top:0.2rem">Churn Fin.: <strong style="color:#1e293b">${fp(churnFin)}</strong></div>
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
            fc(META_RESULT_TRIM), fc(resultadoAcum), bonRes, bonResMetaOk,    META_RESULT_TRIM    > 0) +
          bonCard('📉','Churn Financeiro Acumulado ≤ '+fp(META_CHURN_FIN_TRIM),
            fp(META_CHURN_FIN_TRIM), fp(churnFinAcum), bonChurn, bonChurnMetaOk,  META_CHURN_FIN_TRIM > 0) +
          bonCard('🔧', 'Mat-Equip % Fat. ≤ '+fp(metaMatEquip),
            fp(metaMatEquip), fp(matEquipPct), bonMat, bonMatMetaOk,    metaMatEquip        > 0) +
          bonCard('👥','Folha % Fat. ≤ '+fp(metaFolha),
            fp(metaFolha), fp(folhaPct), bonFolha, bonFolhaMetaOk,  metaFolha           > 0) +
          bonCard('💹','EBITDA Trim. ≥ Meta',
            fc(metaEbitdaTrim), fc(ebitdaAcum), bonEbitda, bonEbitdaMetaOk, metaEbitdaTrim      > 0);

        if(isTrimFim) {
          document.getElementById('opBonusTrimestral').innerHTML +=
            `<div style="grid-column:1/-1;background:linear-gradient(135deg,#d97706,#f59e0b);border-radius:14px;padding:1.25rem 1.75rem;color:white;display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:0.9rem;font-weight:600;opacity:0.9">🏅 TOTAL BÔNUS TRIMESTRAL — ${trimNome}</div>
              <div style="font-size:1.6rem;font-weight:800">${fc(totalTrim)}</div>
            </div>`;
        }

        // Mês ao vivo (não fechado): mostra botão "Fechar mês"
        _renderOpFecharBtn(mesIdx, ano, false);

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
    // FECHAR / REABRIR MÊS — COMISSÃO OPERACIONAL
    // Snapshot do HTML renderizado (tipo "print"). Congela o cálculo —
    // não muda mais nem se dados/params mudarem. Reabrir só admin.
    // ═══════════════════════════════════════════════════════
    const OP_SECOES_SNAP = ['opIndicadores','opNovosNegocios','opCancelamentos',
      'opResultadoCard','opComissoesMensais','opTotalMensal','opBonusTrimestral'];

    function _opFechadoKey(mesIdx, ano) {
      return `comissao_op_fechado_${ano}_${String(mesIdx+1).padStart(2,'0')}`;
    }

    async function getComissaoOpFechado(mesIdx, ano) {
      try {
        const raw = await sbStorage.get(_opFechadoKey(mesIdx, ano));
        return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      } catch(e) { return null; }
    }

    function _opEhAdmin() {
      return typeof usuarioLogado !== 'undefined' && usuarioLogado && usuarioLogado.perfil === 'edicao';
    }

    // Renderiza o botão Fechar (ao vivo) ou Reabrir (fechado) no header da Operacional
    function _renderOpFecharBtn(mesIdx, ano, fechado, fechadoEm) {
      const wrap = document.getElementById('opFecharBtnWrap');
      if (!wrap) return;
      if (fechado) {
        const dt = fechadoEm ? ' em ' + new Date(fechadoEm).toLocaleDateString('pt-BR') : '';
        const btnReabrir = _opEhAdmin()
          ? `<button onclick="reabrirMesOperacional(${mesIdx},${ano})" style="margin-left:0.5rem;padding:0.35rem 0.8rem;font-size:0.76rem;background:white;color:#b45309;border:1px solid #fbbf24;border-radius:8px;cursor:pointer;font-weight:600" title="Remove o congelamento (só admin)">🔓 Reabrir</button>`
          : '';
        wrap.innerHTML = `<span style="background:#fef3c7;color:#92400e;padding:0.25rem 0.7rem;border-radius:20px;font-size:0.76rem;font-weight:700">🔒 Fechado${dt}</span>${btnReabrir}`;
      } else {
        wrap.innerHTML = `<button onclick="fecharMesOperacional(${mesIdx},${ano})" style="padding:0.4rem 0.9rem;font-size:0.78rem;background:#dc2626;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700" title="Congela o cálculo deste mês — não muda mais">🔒 Fechar Mês</button>`;
      }
    }

    // Restaura o HTML congelado nas seções da Operacional
    function _restaurarComissaoOpFechado(mesIdx, ano, snap) {
      const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const lbl = document.getElementById('opMesLabel');
      if (lbl) {
        lbl.innerHTML = `🔒 ${MESES_N[mesIdx]} ${ano} <span style="font-weight:500;opacity:0.8">congelado</span>`;
        lbl.style.background = '#fef3c7'; lbl.style.color = '#92400e';
      }
      OP_SECOES_SNAP.forEach(id => {
        const el = document.getElementById(id);
        if (el && snap.html && snap.html[id] != null) el.innerHTML = snap.html[id];
      });
      _renderOpFecharBtn(mesIdx, ano, true, snap.fechadoEm);
    }

    async function fecharMesOperacional(mesIdx, ano) {
      const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const ok = confirm(
        `Fechar a Comissão Operacional de ${MESES_N[mesIdx]}/${ano}?\n\n` +
        `Congela um snapshot do cálculo atual — não muda mais, mesmo que dados ou parâmetros mudem depois.\n\n` +
        `Só um admin pode reabrir.`
      );
      if (!ok) return;
      try {
        const snap = { fechadoEm: new Date().toISOString(), mesIdx, ano, html: {} };
        OP_SECOES_SNAP.forEach(id => {
          const el = document.getElementById(id);
          if (el) snap.html[id] = el.innerHTML;
        });
        await sbStorage.set(_opFechadoKey(mesIdx, ano), JSON.stringify(snap));
        alert(`🔒 Comissão Operacional de ${MESES_N[mesIdx]}/${ano} fechada ✓`);
        renderComissaoOp();
      } catch (e) {
        alert('Erro ao fechar: ' + (e.message || e));
      }
    }

    async function reabrirMesOperacional(mesIdx, ano) {
      if (!_opEhAdmin()) { alert('Só um administrador (perfil "edição") pode reabrir.'); return; }
      const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const ok = confirm(`Reabrir a Comissão Operacional de ${MESES_N[mesIdx]}/${ano}?\n\nVolta a recalcular ao vivo com dados/parâmetros atuais.`);
      if (!ok) return;
      try {
        await sbStorage.remove(_opFechadoKey(mesIdx, ano));
        alert(`🔓 Reaberto. Voltou a recalcular ao vivo.`);
        renderComissaoOp();
      } catch (e) {
        alert('Erro ao reabrir: ' + (e.message || e));
      }
    }

    // Expõe globalmente pros onclick inline (estamos dentro do DOMContentLoaded)
    window.fecharMesOperacional = fecharMesOperacional;
    window.reabrirMesOperacional = reabrirMesOperacional;


    // ═══════════════════════════════════════════════════════
    // MARCOS — IA por aba
    // ═══════════════════════════════════════════════════════
    let marcosContext = 'dashboard';
    let marcosHistory = [];