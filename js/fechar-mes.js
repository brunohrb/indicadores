// ==================== FECHAR MÊS ====================
    async function fecharMes() {
      const mesIdx = parseInt(document.getElementById('comissaoMesFiltro')?.value ?? 0);
      const ano    = document.getElementById('comissaoAnoFiltro')?.value ?? '2026';
      const mesNome = MESES_NOME[mesIdx];
      const mesKey  = MESES_KEY[mesIdx];

      const conf = confirm(`Fechar ${mesNome}/${ano}?\n\nIsso irá CONGELAR todos os dados e cálculos deste mês.\nMesmo que os parâmetros mudem no futuro, este mês não será afetado.\n\nEsta ação pode ser desfeita clicando em "Reabrir".`);
      if (!conf) return;

      // Coleta snapshot completo dos dados e cálculos atuais
      const params = {};
      ['param_metaJuros','param_txComissaoJuros','param_txRecorrencia','param_limTarifas',
       'param_txEficiencia','param_txEbitdaMensal','param_txBonusTrim',
       'metaEbitda_'+mesKey,'metaTrim_q1','metaTrim_q2','metaTrim_q3','metaTrim_q4'
      ].forEach(id => {
        const el = document.getElementById(id);
        if (el) params[id] = parseFloat(el.value) || 0;
      });

      const fat      = getFaturamento(mesKey);
      const fatTotal = getFaturamentoTotal(mesKey);
      const tarifas  = getTarifas(mesKey);
      const ebitda   = getEbitda(mesKey);
      const dirDados = await getDiretoriaDados(mesIdx, ano);
      const reajuste = dirDados?.dados
        ? ((dirDados.dados.reajuste_pf || 0) + (dirDados.dados.reajuste_pj || 0)) || dirDados.dados.reajuste || 0
        : 0;
      // Juros: prefere PDF (juros45 + juros45m); fallback para Excel se PDF não disponível
      const _j45  = dirDados?.dados?.juros45  ?? null;
      const _j45m = dirDados?.dados?.juros45m ?? null;
      const juros = (_j45 !== null || _j45m !== null)
        ? (_j45 || 0) + (_j45m || 0)
        : getJuros(mesKey);

      const metaJurosPerc   = params['param_metaJuros'] / 100;
      const txComissaoJuros = params['param_txComissaoJuros'] / 100;
      const txRecorrencia   = params['param_txRecorrencia'] / 100;
      const limTarifas      = params['param_limTarifas'] / 100;
      const txBancaria      = params['param_txEficiencia'] / 100;
      const txEbitdaMensal  = params['param_txEbitdaMensal'] / 100;
      const txBonusTrim     = params['param_txBonusTrim'] / 100;
      const metaEbitdaPerc  = params['metaEbitda_'+mesKey] / 100;

      const jurosPerc    = fat > 0 ? juros / fat : 0;
      const jurosOk      = jurosPerc >= metaJurosPerc;
      const comissaoJuros = jurosOk ? juros * txComissaoJuros : 0;
      const comissaoRec  = reajuste * txRecorrencia;
      const tarifasPerc  = fat > 0 ? tarifas / fat : 0;
      const tarifasOk    = tarifasPerc <= limTarifas;
      const comissaoTar  = tarifasOk ? fat * txBancaria : 0;
      const ebitdaPerc   = fat > 0 ? ebitda / fat : 0;
      const ebitdaOk     = ebitdaPerc >= metaEbitdaPerc;
      const comissaoEbitda = ebitdaOk ? ebitda * txEbitdaMensal : 0;
      const totalMensal  = comissaoJuros + comissaoRec + comissaoTar + comissaoEbitda;

      const snapshot = {
        fechadoEm: new Date().toISOString(),
        mesIdx, ano, mesKey,
        params,
        dados: { fat, fatTotal, juros, tarifas, ebitda, reajuste },
        calculos: {
          jurosPerc, jurosOk, comissaoJuros,
          comissaoRec,
          tarifasPerc, tarifasOk, comissaoTar,
          ebitdaPerc, ebitdaOk, comissaoEbitda,
          totalMensal
        }
      };

      const key = `mes_fechado_${ano}_${String(mesIdx+1).padStart(2,'0')}`;
      await sbStorage.set(key, JSON.stringify(snapshot));

      alert(`✅ ${mesNome}/${ano} fechado com sucesso!\nDados congelados em ${new Date().toLocaleString('pt-BR')}.`);
      renderComissao();
    }

    async function reabrirMes() {
      const mesIdx = parseInt(document.getElementById('comissaoMesFiltro')?.value ?? 0);
      const ano    = document.getElementById('comissaoAnoFiltro')?.value ?? '2026';
      const mesNome = MESES_NOME[mesIdx];
      const conf = confirm(`Reabrir ${mesNome}/${ano}?\nOs cálculos voltarão a usar os parâmetros atuais.`);
      if (!conf) return;
      const key = `mes_fechado_${ano}_${String(mesIdx+1).padStart(2,'0')}`;
      await sbStorage.remove(key);
      renderComissao();
    }

    async function getMesFechado(mesIdx, ano) {
      const key = `mes_fechado_${ano}_${String(mesIdx+1).padStart(2,'0')}`;
      try {
        const raw = await sbStorage.get(key);
        return raw ? JSON.parse(raw) : null;
      } catch(e) { return null; }
    }
    // =====================================================

    // Renderiza a view de comissão a partir de um snapshot congelado
    function renderComissaoComDados(mesIdx, ano, mesKey, mesNome, dados, params, calc, fechadoEm) {
      const { fat, fatTotal, juros, tarifas, ebitda, reajuste } = dados;
      const { jurosPerc, jurosOk, comissaoJuros, comissaoRec,
              tarifasPerc, tarifasOk, comissaoTar,
              ebitdaPerc, ebitdaOk, comissaoEbitda, totalMensal } = calc;

      const txComissaoJuros = params['param_txComissaoJuros'] / 100;
      const txRecorrencia   = params['param_txRecorrencia'] / 100;
      const limTarifas      = params['param_limTarifas'] / 100;
      const txBancaria      = params['param_txEficiencia'] / 100;
      const txEbitdaMensal  = params['param_txEbitdaMensal'] / 100;
      const txBonusTrim     = params['param_txBonusTrim'] / 100;
      const metaJurosPerc   = params['param_metaJuros'] / 100;
      const metaEbitdaPerc  = params['metaEbitda_'+mesKey] / 100 || 0;
      const metaTrimQ1 = params['metaTrim_q1'] || 0;
      const metaTrimQ2 = params['metaTrim_q2'] || 0;
      const metaTrimQ3 = params['metaTrim_q3'] || 0;
      const metaTrimQ4 = params['metaTrim_q4'] || 0;

      const dtFechado = fechadoEm ? new Date(fechadoEm).toLocaleString('pt-BR') : '';
      const isFechado = !!fechadoEm;

      // Atualiza label do mês no título da matriz: cadeado se fechado
      const lbl = document.getElementById('comissaoMesLabel');
      if (lbl) {
        if (isFechado) {
          lbl.innerHTML = `🔒 ${mesNome}/${ano} <span style="font-size:0.7rem;font-weight:500;opacity:0.8">fechado em ${dtFechado}</span>`;
          lbl.style.background = '#fef3c7';
          lbl.style.color = '#92400e';
        } else {
          lbl.textContent = `${mesNome}/${ano}`;
          lbl.style.background = '#dbeafe';
          lbl.style.color = '#1e40af';
        }
      }

      const aviso = document.getElementById('comissaoAvisoDiretoria');
      if (aviso) aviso.style.display = reajuste > 0 ? 'none' : 'block';

      const cards = [
        { icon:'💰', label:'Faturamento Base',   val: fatTotal,  cor:'#2563eb', sub:'Total Receitas (Fluxo de Caixa)' },
        { icon:'📋', label:'Juros/Multa',         val: juros,     cor:'#10b981', sub:'Receita de juros' },
        { icon:'🏦', label:'Tarifas Bancárias',   val: tarifas,   cor:'#f59e0b', sub:'Despesas Operac. / Taxas Boleto' },
        { icon:'🔵', label:'Reajuste Contratual', val: reajuste,  cor:'#8b5cf6', sub:'Fonte: PDF Diretoria' },
        { icon:'📊', label:'EBITDA (Ajustado)',   val: ebitda,    cor:'#059669', sub:'EBITDA c/ ajustes' },
      ];
      const cardsEl = document.getElementById('comissaoCardsResumo');
      if (cardsEl) cardsEl.innerHTML = cards.map(c => `
        <div style="background:white;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.08);padding:1.25rem;border-top:4px solid ${c.cor}">
          <div style="font-size:0.78rem;color:#64748b;font-weight:500;margin-bottom:0.75rem">${c.icon} ${c.label}</div>
          <div style="font-size:1.4rem;font-weight:800;color:${c.val<0?'#b91c1c':c.cor}">${c.val!==0?formatCurrency(c.val):'<span style="color:#cbd5e1;font-size:1rem">Sem dados</span>'}</div>
          <div style="font-size:0.72rem;color:#94a3b8;margin-top:0.35rem">${c.sub} · ${mesNome}/${ano}</div>
        </div>`).join('');

      const pct = v => {
        const n = v * 100;
        if (n === 0) return '0%';
        if (Math.abs(n) < 0.01) return n.toFixed(4) + '%';
        if (Math.abs(n) < 0.1)  return n.toFixed(3) + '%';
        if (Math.abs(n) < 1)    return n.toFixed(3) + '%';
        return n.toFixed(2) + '%';
      };
      const tip = (txt) => `<span style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;background:#e2e8f0;border-radius:50%;font-size:0.65rem;color:#475569;cursor:help;margin-left:4px;vertical-align:middle;font-style:normal" title="${txt}">?</span>`;

      const matrizEl = document.getElementById('comissaoMatriz');
      if (matrizEl) matrizEl.innerHTML =
        indicadorRow('📋','Juros / Comissão',
          `Juros: <b>${formatCurrency(juros)}</b> | Juros/Fat: <b>${pct(jurosPerc)}</b>${tip('Juros ÷ Faturamento Base')} | Meta mín.: <b>${pct(metaJurosPerc)}</b> | Taxa: <b>${pct(txComissaoJuros)}</b>`,
          badgeStatus(jurosOk,'Meta atingida','Abaixo da meta'), comissaoJuros)
        + indicadorRow('🔵','Reajuste Contratual',
          `Reajuste: <b>${reajuste ? formatCurrency(reajuste) : 'Sem dados PDF'}</b> | Taxa Recorrência: <b>${pct(txRecorrencia)}</b>`,
          reajuste > 0 ? badgeStatus(true,'PDF carregado','') : `<span style="background:#fef3c7;color:#92400e;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.78rem;font-weight:700">⚠️ PDF não carregado</span>`,
          comissaoRec)
        + indicadorRow('🏦','Eficiência Bancária (Tarifas)',
          `Tarifas: <b>${formatCurrency(tarifas)}</b> | Tarifas/Fat: <b>${pct(tarifasPerc)}</b> | Limite máx.: <b>${pct(limTarifas)}</b> | Taxa: <b>${pct(txBancaria)}</b>`,
          badgeStatus(tarifasOk,'Eficiente','Acima do limite'), comissaoTar)
        + indicadorRow('📊','EBITDA Mensal',
          `EBITDA: <b>${formatCurrency(ebitda)}</b> | EBITDA%: <b>${pct(ebitdaPerc)}</b> | Meta: <b>${pct(metaEbitdaPerc)}</b> | Taxa: <b>${pct(txEbitdaMensal)}</b>`,
          badgeStatus(ebitdaOk,'Meta atingida','Abaixo da meta'), comissaoEbitda)
        + `<div style="display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:1rem;padding:1rem 1.25rem;background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:12px;color:white;margin-top:0.5rem">
            <div style="font-weight:700;font-size:1rem">💼 Total Mensal — ${mesNome}/${ano}</div>
            <div style="font-size:1.4rem;font-weight:800">${formatCurrency(totalMensal)}</div>
            ${isFechado
              ? `<button onclick="reabrirMes()" title="Reabrir mês para edição" style="padding:0.45rem 1rem;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.5);color:white;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;white-space:nowrap">🔓 Reabrir</button>`
              : `<button onclick="fecharMes()" title="Congelar dados deste mês" style="padding:0.45rem 1rem;background:#dc2626;border:none;color:white;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;white-space:nowrap">🔒 Fechar Mês</button>`
            }
          </div>`;

      const trim = [
        { nome:'Q1 (Jan-Mar)', meses:['jan','fev','mar'], meta: metaTrimQ1 },
        { nome:'Q2 (Abr-Jun)', meses:['abr','mai','jun'], meta: metaTrimQ2 },
        { nome:'Q3 (Jul-Set)', meses:['jul','ago','set'], meta: metaTrimQ3 },
        { nome:'Q4 (Out-Dez)', meses:['out','nov','dez'], meta: metaTrimQ4 },
      ];
      const bonusEl = document.getElementById('comissaoBonusTrim');
      if (bonusEl) {
        bonusEl.innerHTML = trim.map((q, qi) => {
          const ebitdaAcum = q.meses.reduce((s, m) => s + getEbitda(m), 0);
          const trimOk     = q.meta > 0 && ebitdaAcum >= q.meta;
          const bonus      = trimOk ? ebitdaAcum * txBonusTrim : 0;
          const progresso  = q.meta > 0 ? Math.min(100, (ebitdaAcum / q.meta) * 100) : 0;
          const corProg    = trimOk ? '#059669' : progresso > 60 ? '#f59e0b' : '#e2e8f0';
          const temDados   = ebitdaAcum > 0;
          return `<div style="border:1px solid #e2e8f0;border-radius:14px;padding:1.25rem;${trimOk?'border-color:#86efac;background:#f0fdf4;':''}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
              <div style="font-weight:700;color:#1e293b;font-size:0.9rem">${q.nome}</div>
              ${trimOk ? '<span style="background:#dcfce7;color:#166534;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.75rem;font-weight:700">✓ Atingido</span>'
                        : q.meta===0 ? '<span style="background:#f1f5f9;color:#94a3b8;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.75rem">Sem meta</span>'
                        : '<span style="background:#fef3c7;color:#92400e;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.75rem;font-weight:700">Em andamento</span>'}
            </div>
            <div style="margin-bottom:0.6rem">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:#64748b;margin-bottom:0.3rem"><span>EBITDA Acumulado</span><span style="font-weight:700;color:#1e293b">${temDados ? formatCurrency(ebitdaAcum) : '—'}</span></div>
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:#64748b;margin-bottom:0.6rem"><span>Meta</span><span style="font-weight:700;color:#1e293b">${q.meta>0 ? formatCurrency(q.meta) : 'Não definida'}</span></div>
              ${q.meta>0 ? `<div style="background:#e2e8f0;border-radius:99px;height:8px;overflow:hidden"><div style="background:${corProg};height:100%;width:${progresso.toFixed(1)}%;transition:width 0.5s;border-radius:99px"></div></div><div style="font-size:0.72rem;color:#94a3b8;margin-top:0.25rem;text-align:right">${progresso.toFixed(1)}% da meta</div>` : ''}
            </div>
            <div style="border-top:1px solid #e2e8f0;padding-top:0.75rem;display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:0.78rem;color:#64748b">Bônus (${(txBonusTrim*100).toFixed(2)}%)</span>
              <span style="font-size:1.1rem;font-weight:800;color:${bonus>0?'#059669':'#94a3b8'}">${bonus>0?formatCurrency(bonus):'—'}</span>
            </div>
          </div>`;
        }).join('');
      }

      const trimAtual = Math.floor(mesIdx / 3);
      const metasTrim = [metaTrimQ1, metaTrimQ2, metaTrimQ3, metaTrimQ4];
      const ebitdaAcumTrimAtual = trim[trimAtual].meses.reduce((s,m)=>s+getEbitda(m),0);
      const bonusTrimAtual = metasTrim[trimAtual]>0 && ebitdaAcumTrimAtual>=metasTrim[trimAtual] ? ebitdaAcumTrimAtual * txBonusTrim : 0;
      const totalGeral = totalMensal + bonusTrimAtual;
      const totalEl = document.getElementById('comissaoTotalGeral');
      if (totalEl) totalEl.innerHTML = `
        <div style="background:linear-gradient(135deg,#059669,#047857);border-radius:16px;padding:2rem;color:white">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;align-items:center">
            <div><div style="font-size:0.85rem;opacity:0.85;margin-bottom:0.25rem">💼 Total Mensal</div><div style="font-size:1.6rem;font-weight:800">${formatCurrency(totalMensal)}</div><div style="font-size:0.75rem;opacity:0.75;margin-top:0.25rem">${mesNome}/${ano}</div></div>
            <div><div style="font-size:0.85rem;opacity:0.85;margin-bottom:0.25rem">🏆 Bônus Trimestral Q${trimAtual+1}</div><div style="font-size:1.6rem;font-weight:800">${bonusTrimAtual>0?formatCurrency(bonusTrimAtual):'—'}</div><div style="font-size:0.75rem;opacity:0.75;margin-top:0.25rem">${bonusTrimAtual>0?'Meta atingida':'Em andamento'}</div></div>
            <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:1.25rem;text-align:center"><div style="font-size:0.85rem;opacity:0.85;margin-bottom:0.5rem">🎯 TOTAL GERAL</div><div style="font-size:2rem;font-weight:900">${formatCurrency(totalGeral)}</div><div style="font-size:0.75rem;opacity:0.75;margin-top:0.25rem">Mensal + Bônus Q${trimAtual+1}</div></div>
          </div>
        </div>`;
    }

    async function renderComissao() {
      const mesIdx  = parseInt(document.getElementById('comissaoMesFiltro')?.value ?? 0);
      const ano     = document.getElementById('comissaoAnoFiltro')?.value ?? '2026';
      const mesKey  = MESES_KEY[mesIdx];
      const mesNome = MESES_NOME[mesIdx];

      // Atualiza label
      const lbl = document.getElementById('comissaoMesLabel');
      if (lbl) lbl.textContent = `${mesNome}/${ano}`;

      // Verifica se mês está fechado
      const frozen = await getMesFechado(mesIdx, ano);

      if (frozen) {
        // Usa dados congelados do Supabase
        renderComissaoComDados(mesIdx, ano, mesKey, mesNome, frozen.dados, frozen.params, frozen.calculos, frozen.fechadoEm);
        return;
      }

      // === PARÂMETROS AO VIVO ===
      const metaJurosPerc    = getParam('param_metaJuros', 1.90) / 100;       // 1.9%
      const txComissaoJuros  = getParam('param_txComissaoJuros', 1.10) / 100; // 1.1%
      const txRecorrencia    = getParam('param_txRecorrencia', 14) / 100;      // 14%
      const limTarifas       = getParam('param_limTarifas', 0.38) / 100;      // 0.38%
      const txBancaria       = getParam('param_txEficiencia', 0.015) / 100;   // 0.015%
      const txEbitdaMensal   = getParam('param_txEbitdaMensal', 0.10) / 100;  // 0.1%
      const txBonusTrim      = getParam('param_txBonusTrim', 0.20) / 100;     // 0.2%
      const metaEbitdaPerc   = getParam('metaEbitda_'+mesKey, 0) / 100;
      const metaTrimQ1       = getParam('metaTrim_q1', 0);
      const metaTrimQ2       = getParam('metaTrim_q2', 0);
      const metaTrimQ3       = getParam('metaTrim_q3', 0);
      const metaTrimQ4       = getParam('metaTrim_q4', 0);

      // === DADOS DO MÊS ===
      const fat      = getFaturamento(mesKey);       // PF+PJ apenas (para cálculos de comissão)
      const fatTotal = getFaturamentoTotal(mesKey);   // todas receitas (para exibição nos cards)
      const tarifas  = getTarifas(mesKey);
      const ebitda   = getEbitda(mesKey);

      // Diretoria (PDF Supabase)
      const dirDados = await getDiretoriaDados(mesIdx, ano);
      const hasDiretoria = !!(dirDados && dirDados.dados);
      const resultadoLiq = hasDiretoria ? (dirDados.dados.resultado || 0) : 0;
      // Juros: prefere PDF (juros45 + juros45m); fallback para Excel se PDF não disponível
      const _j45r  = hasDiretoria ? (dirDados.dados.juros45  ?? null) : null;
      const _j45mr = hasDiretoria ? (dirDados.dados.juros45m ?? null) : null;
      const juros  = (_j45r !== null || _j45mr !== null)
        ? (_j45r || 0) + (_j45mr || 0)
        : getJuros(mesKey);
      const reajuste     = hasDiretoria
        ? ((dirDados.dados.reajuste_pf || 0) + (dirDados.dados.reajuste_pj || 0)) || dirDados.dados.reajuste || 0
        : 0;

      // Aviso diretoria
      const aviso = document.getElementById('comissaoAvisoDiretoria');
      if (aviso) aviso.style.display = hasDiretoria ? 'none' : 'block';

      // Monta params e calculos no mesmo formato do snapshot para reusar renderComissaoComDados
      const params = {
        'param_metaJuros': metaJurosPerc * 100, 'param_txComissaoJuros': txComissaoJuros * 100,
        'param_txRecorrencia': txRecorrencia * 100, 'param_limTarifas': limTarifas * 100,
        'param_txEficiencia': txBancaria * 100, 'param_txEbitdaMensal': txEbitdaMensal * 100,
        'param_txBonusTrim': txBonusTrim * 100, ['metaEbitda_'+mesKey]: metaEbitdaPerc * 100,
        'metaTrim_q1': metaTrimQ1, 'metaTrim_q2': metaTrimQ2,
        'metaTrim_q3': metaTrimQ3, 'metaTrim_q4': metaTrimQ4,
      };

      const jurosPerc    = fat > 0 ? juros / fat : 0;
      const jurosOk      = jurosPerc >= metaJurosPerc;
      const comissaoJuros = jurosOk ? juros * txComissaoJuros : 0;
      const comissaoRec  = reajuste * txRecorrencia;
      const tarifasPerc  = fat > 0 ? tarifas / fat : 0;
      const tarifasOk    = tarifasPerc <= limTarifas;
      const comissaoTar  = tarifasOk ? fat * txBancaria : 0;
      const ebitdaPerc   = fat > 0 ? ebitda / fat : 0;
      const ebitdaOk     = ebitdaPerc >= metaEbitdaPerc;
      const comissaoEbitda = ebitdaOk ? ebitda * txEbitdaMensal : 0;
      const totalMensal  = comissaoJuros + comissaoRec + comissaoTar + comissaoEbitda;

      const calculos = { jurosPerc, jurosOk, comissaoJuros, comissaoRec,
                         tarifasPerc, tarifasOk, comissaoTar,
                         ebitdaPerc, ebitdaOk, comissaoEbitda, totalMensal };

      renderComissaoComDados(mesIdx, ano, mesKey, mesNome,
        { fat, fatTotal, juros, tarifas, ebitda, reajuste },
        params, calculos, null);
    }


    async function salvarParams() {
      const ids = [
        'param_metaJuros','param_txComissaoJuros','param_txRecorrencia',
        'param_limTarifas','param_txEficiencia','param_txEbitdaMensal','param_txBonusTrim',
        'metaEbitda_jan','metaEbitda_fev','metaEbitda_mar','metaEbitda_abr',
        'metaEbitda_mai','metaEbitda_jun','metaEbitda_jul','metaEbitda_ago',
        'metaEbitda_set','metaEbitda_out','metaEbitda_nov','metaEbitda_dez',
        'metaTrim_q1','metaTrim_q2','metaTrim_q3','metaTrim_q4',
        'op_metaOsPf','op_metaOsPj','op_metaChurnPf','op_metaChurnPj','op_metaRetiradas',
        'op_ticketPf','op_ticketPj',
        'op_premioOsPf','op_premioOsPj','op_premioChurnPf','op_premioChurnPj',
        'op_premioRetiradas','op_premioResPos','op_premioResNeg','op_premioEbitdaMov',
        'op_metaResultTrim','op_metaChurnFinTrim',
        'op_metaMatEquip_q1','op_metaMatEquip_q2','op_metaMatEquip_q3','op_metaMatEquip_q4',
        'op_metaFolha_q1','op_metaFolha_q2','op_metaFolha_q3','op_metaFolha_q4',
        'op_premioResultTrim','op_premioChurnFinTrim','op_premioMatEquipTrim',
        'op_premioFolhaTrim','op_premioEbitdaTrim','op_equipamento'
      ];
      const params = {};
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) params[id] = parseParamValue(el);
      });
      await sbStorage.set('app_params_v2', JSON.stringify(params));
      const msg = document.getElementById('paramSalvoMsg');
      if (msg) { msg.style.display='block'; setTimeout(()=>msg.style.display='none', 3000); }
    }

    async function carregarParams() {
      try {
        const raw = await sbStorage.get('app_params_v2');
        if (!raw) return;
        const params = JSON.parse(raw);
        Object.entries(params).forEach(([id, val]) => {
          const el = document.getElementById(id);
          if (el) {
            // val pode ser string formatada (legado) ou número
            const num = typeof val === 'string' ? parseFloat(val.replace(/\./g,'').replace(',','.')) : parseFloat(val);
            if (!isNaN(num)) {
              el.value = num;  // temporário — formatParamInput vai formatar logo abaixo
              formatParamInput(el);
            }
          }
        });
        console.log('✅ Parâmetros carregados do Supabase');
        initParamFormatting();
      } catch(e) { console.warn('carregarParams falhou:', e); }
      await reajusteCarregar();
    }