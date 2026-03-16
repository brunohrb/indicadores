// ==================== STORAGE DIRETORIA ====================
    // Chave: "diretoria_YYYY_MM" — sobrescreve sempre que mesmo mes/ano é carregado
    const DIRETORIA_STORAGE_PREFIX = 'diretoria_';

    function diretoriaStorageKey(mes, ano) {
      const mm = String(parseInt(mes)+1).padStart(2,'0');
      return DIRETORIA_STORAGE_PREFIX + ano + '_' + mm;
    }

    // Só atualiza o aviso de "já existe", sem tocar no grid
    async function diretoriaAtualizarAviso(mes, ano) {
      const info = document.getElementById('dirStorageInfo');
      if (!info) return;
      const MESES_N = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const existente = await diretoriaLerDados(mes, ano);
      if (existente) {
        const dt = new Date(existente.savedAt);
        const dtStr = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
        info.innerHTML = `<span style="color:#d97706">⚠️ Já existe dados de ${MESES_N[mes]}/${ano} salvos (${dtStr}) — ao salvar irá <strong>substituir</strong></span>`;
      } else {
        info.innerHTML = `<span style="color:#64748b">Nenhum dado salvo para ${MESES_N[mes]}/${ano} ainda</span>`;
      }
    }

    async function diretoriaSalvarDados(mes, ano, dados) {
      const key = diretoriaStorageKey(mes, ano);
      try {
        // Apaga o antigo antes de salvar (garante substituição limpa)
        await sbStorage.remove(key);
        await sbStorage.set(key, JSON.stringify({ mes, ano, dados, savedAt: new Date().toISOString() }));
        return true;
      } catch(e) { return false; }
    }

    async function diretoriaLerDados(mes, ano) {
      const key = diretoriaStorageKey(mes, ano);
      try {
        const raw = await sbStorage.get(key);
        return raw ? JSON.parse(raw) : null;
      } catch(e) { return null; }
    }

    // Ao abrir a aba, busca o mês mais recente salvo no Supabase e exibe automaticamente
    async function diretoriaCarregarUltimoMes() {
      // Se já tem dados na tela, só atualiza aviso
      if (diretoriaDadosExtraidos) {
        await diretoriaVerificarMesAno();
        return;
      }

      const ano = document.getElementById('dirAno')?.value ?? '2026';
      const mesAtual = new Date().getMonth(); // 0-11

      // Tenta do mês atual para trás até encontrar um com dados
      for (let m = mesAtual; m >= 0; m--) {
        const dados = await diretoriaLerDados(m, ano);
        if (dados && dados.dados) {
          // Achou! Seleciona esse mês no dropdown e exibe
          document.getElementById('dirMes').value = m;
          diretoriaDadosExtraidos = dados.dados;
          diretoriaMostrarGrid(dados.dados);
          document.getElementById('diretoriaPreviewSection').style.display = 'block';
          document.getElementById('diretoriaPdfInfo').style.display = 'block';
          document.getElementById('diretoriaPdfNome').textContent = `📦 Carregado do Supabase — ${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m]}/${ano}`;
          const dt = new Date(dados.savedAt);
          const dtStr = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
          const info = document.getElementById('dirStorageInfo');
          if (info) info.innerHTML = `<span style="color:#059669">✅ Dados de ${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][m]}/${ano} carregados (${dtStr})</span>`;
          return;
        }
      }

      // Nenhum mês encontrado — exibe mensagem
      await diretoriaVerificarMesAno();
    }

    async function diretoriaVerificarMesAno() {
      const mes = parseInt(document.getElementById('dirMes')?.value ?? 0);
      const ano = document.getElementById('dirAno')?.value ?? '2026';
      const info = document.getElementById('dirStorageInfo');
      if (!info) return;
      const MESES_N = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

      // Se já tem PDF carregado na tela, só atualiza o aviso sem tocar no grid
      if (diretoriaDadosExtraidos) {
        await diretoriaAtualizarAviso(mes, ano);
        return;
      }

      // Sem PDF carregado — busca do Supabase e exibe
      const existente = await diretoriaLerDados(mes, ano);
      if (existente && existente.dados) {
        const dt = new Date(existente.savedAt);
        const dtStr = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
        info.innerHTML = `<span style="color:#059669">✅ Dados de ${MESES_N[mes]}/${ano} carregados do Supabase (${dtStr})</span>`;
        diretoriaDadosExtraidos = existente.dados;
        diretoriaMostrarGrid(existente.dados);
        document.getElementById('diretoriaPreviewSection').style.display = 'block';
        const pdfInfo = document.getElementById('diretoriaPdfInfo');
        const pdfNome = document.getElementById('diretoriaPdfNome');
        if (pdfInfo) pdfInfo.style.display = 'block';
        if (pdfNome) pdfNome.textContent = `📦 Carregado do Supabase — ${MESES_N[mes]}/${ano}`;
      } else {
        info.innerHTML = `<span style="color:#64748b">Nenhum dado salvo para ${MESES_N[mes]}/${ano} ainda</span>`;
        document.getElementById('diretoriaPreviewSection').style.display = 'none';
        document.getElementById('diretoriaPdfInfo').style.display = 'none';
      }
    }

    async function diretoriaCarregarInformacoes() {
      const dados = diretoriaGetDados();
      const mes = parseInt(document.getElementById('dirMes').value);
      const ano = document.getElementById('dirAno').value;
      const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const foiSubstituicao = !!(await diretoriaLerDados(mes, ano));
      const ok = await diretoriaSalvarDados(mes, ano, dados);
      const msg = document.getElementById('dirSalvoMsg');
      if (ok) {
        await reajusteSincronizarDeDados(mes, dados);
        msg.style.display = 'block';
        if (foiSubstituicao) {
          msg.style.background = '#fef3c7'; msg.style.color = '#92400e'; msg.style.border = '1px solid #fde68a';
          msg.innerHTML = `🔄 Dados de <strong>${MESES_N[mes]}/${ano}</strong> substituídos com sucesso!`;
        } else {
          msg.style.background = '#f0fdf4'; msg.style.color = '#166534'; msg.style.border = '1px solid #86efac';
          msg.innerHTML = `✅ Dados de <strong>${MESES_N[mes]}/${ano}</strong> salvos no Supabase! Disponíveis para dashboards e relatórios.`;
        }
        await diretoriaAtualizarAviso(mes, ano);
        // Garante que o grid permanece visível após salvar
        document.getElementById('diretoriaPreviewSection').style.display = 'block';
        document.getElementById('diretoriaPdfInfo').style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 5000);
      } else {
        msg.style.display = 'block';
        msg.style.background = '#fef2f2'; msg.style.color = '#991b1b'; msg.style.border = '1px solid #fca5a5';
        msg.innerHTML = '❌ Erro ao salvar no Supabase. Verifique a conexão.';
      }
    }

    function diretoriaGetDados() {
      const d = {};
      document.querySelectorAll('#diretoriaDataGrid input[data-key]').forEach(i => {
        d[i.dataset.key] = parseBR(i.value);
      });
      return d;
    }

    // ==================== COMISSÃO FINANCEIRO ====================
    // ==================== COMISSÃO FINANCEIRO ====================
    const MESES_KEY  = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const MESES_ABREV= ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    // Lê parâmetro numérico da aba Parâmetros (DOM)
    // ===== FORMATAÇÃO DE PARÂMETROS =====
    function parseParamValue(el) {
      const fmt = el.dataset?.format;
      const raw = el.value.trim();
      if (!raw) return 0;
      if (fmt === 'brl') {
        // "R$ 2.401.769,91" → 2401769.91
        return parseFloat(raw.replace(/[R$\s]/g,'').replace(/\./g,'').replace(',','.')) || 0;
      } else if (fmt === 'pct') {
        // "1,9000%" → 1.9
        return parseFloat(raw.replace('%','').replace(',','.')) || 0;
      }
      return parseFloat(raw) || 0;
    }

    function formatParamInput(el) {
      const fmt = el.dataset?.format;
      if (!fmt) return;
      const num = parseParamValue(el);
      if (fmt === 'brl') {
        el.value = num.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
      } else if (fmt === 'pct') {
        el.value = num.toLocaleString('pt-BR', {minimumFractionDigits:4, maximumFractionDigits:4}) + '%';
      }
    }

    function paramFocus(el) {
      // ao focar: mostra o número puro para edição
      const num = parseParamValue(el);
      el.value = num === 0 ? '' : String(num).replace('.',',');
      el.select();
    }

    function paramBlur(el) {
      // ao sair: reformata e salva
      const raw = el.value.trim().replace(',','.');
      const num = parseFloat(raw) || 0;
      el.value = num; // temporário
      formatParamInput(el);
      salvarParams();
    }

    function initParamFormatting() {
      document.querySelectorAll('[data-format]').forEach(el => {
        if (el.value && el.value !== '' && !el.value.includes('%') && !el.value.includes('R$')) {
          formatParamInput(el);
        }
      });
    }

    function getParam(id, fallback) {
      const el = document.getElementById(id);
      if (!el) return fallback;
      return parseParamValue(el) || fallback;
    }

    // Lê dados do Diretoria PDF — via Supabase
    // ==================== REAJUSTE CONTRATOS ====================
    const MESES_NOMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const MESES_KEYS  = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const REAJUSTE_KEY = 'reajuste_contratos_2026';

    async function reajusteCarregar() {
      const grid = document.getElementById('reajusteGrid');
      if (!grid) return;
      let dados = {};
      try {
        const raw = await sbStorage.get(REAJUSTE_KEY);
        if (raw) dados = JSON.parse(raw);
      } catch(e) {}
      grid.innerHTML = MESES_NOMES.map((nome, i) => {
        const key = MESES_KEYS[i];
        const val = dados[key] != null ? dados[key] : '';
        return `<div style="display:flex;flex-direction:column;gap:0.3rem">
          <label style="font-size:0.75rem;font-weight:600;color:#475569">${nome}</label>
          <input id="reaj_${key}" type="text" value="${val !== '' ? val.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : ''}"
            placeholder="R$ 0,00"
            style="padding:0.5rem;border:1px solid #e2e8f0;border-radius:6px;font-size:0.85rem;font-weight:700;color:#1e40af;text-align:right;width:100%"
            oninput="this.style.color=this.value?'#1e40af':'#94a3b8'"/>
        </div>`;
      }).join('');
    }

    async function salvarReajuste() {
      const dados = {};
      MESES_KEYS.forEach(key => {
        const el = document.getElementById('reaj_' + key);
        if (el) {
          const raw = el.value.replace(/\./g,'').replace(',','.');
          const n = parseFloat(raw);
          dados[key] = isNaN(n) ? 0 : n;
        }
      });
      try {
        await sbStorage.set(REAJUSTE_KEY, JSON.stringify(dados));
        const msg = document.getElementById('reajusteSaveMsg');
        msg.style.display = 'inline';
        setTimeout(() => msg.style.display = 'none', 2500);
      } catch(e) { alert('Erro ao salvar: ' + e.message); }
    }

    // Sincroniza reajuste de dados já extraídos (do PDF ou do Supabase)
    async function reajusteSincronizarDeDados(mesIdx, dados) {
      if (!dados) return;
      const val_pf = dados.reajuste_pf != null ? +dados.reajuste_pf : 0;
      const val_pj = dados.reajuste_pj != null ? +dados.reajuste_pj : 0;
      const val = (val_pf + val_pj) > 0 ? (val_pf + val_pj) : null;
      if (val == null || val <= 0) return;
      try {
        const raw = await sbStorage.get(REAJUSTE_KEY);
        const rDados = raw ? JSON.parse(raw) : {};
        // Sempre sobrescreve com o valor do PDF (PF + PJ)
        rDados[MESES_KEYS[mesIdx]] = val;
        await sbStorage.set(REAJUSTE_KEY, JSON.stringify(rDados));
        await reajusteCarregar();
        console.log('✅ Reajuste sincronizado:', MESES_KEYS[mesIdx], '=', val);
      } catch(e) { console.warn('Sync reajuste:', e); }
    }

    // Botão "Importar do PDF salvo" — varre todos os meses salvos no Supabase e sincroniza reajuste
    async function reajusteSincronizarDoPdf() {
      const ano = document.getElementById('dirAno')?.value ?? '2026';
      let count = 0;
      const raw = await sbStorage.get(REAJUSTE_KEY);
      const rDados = raw ? JSON.parse(raw) : {};
      for (let m = 0; m <= 11; m++) {
        const dir = await diretoriaLerDados(m, ano);
        if (dir && dir.dados && (dir.dados.reajuste_pf != null || dir.dados.reajuste_pj != null)) {
          const soma = (+dir.dados.reajuste_pf || 0) + (+dir.dados.reajuste_pj || 0);
          if (soma > 0) rDados[MESES_KEYS[m]] = soma;
          else if (dir.dados.reajuste != null && dir.dados.reajuste > 0) rDados[MESES_KEYS[m]] = dir.dados.reajuste; // fallback legado
          count++;
        }
      }
      await sbStorage.set(REAJUSTE_KEY, JSON.stringify(rDados));
      await reajusteCarregar();
      const msg = document.getElementById('reajusteSaveMsg');
      msg.textContent = count > 0 ? `✓ ${count} mês(es) importados do PDF!` : '⚠️ Nenhum valor encontrado nos PDFs salvos';
      msg.style.display = 'inline';
      msg.style.color = count > 0 ? '#166534' : '#92400e';
      setTimeout(() => { msg.style.display = 'none'; msg.style.color = '#166534'; }, 3000);
    }

    // Retorna o reajuste de um mês específico (mesIdx 0-11)
    async function getReajusteMes(mesIdx) {
      try {
        const raw = await sbStorage.get(REAJUSTE_KEY);
        if (!raw) return 0;
        const dados = JSON.parse(raw);
        return dados[MESES_KEYS[mesIdx]] || 0;
      } catch(e) { return 0; }
    }

    async function getDiretoriaDados(mes, ano) {
      const mm = String(mes + 1).padStart(2, '0');
      // Tenta as duas chaves possíveis (nova e legada do diretoria.js)
      const keys = [
        'diretoria_' + ano + '_' + mm,
        'ind_dados:' + ano + ':' + mm,
      ];
      for (const key of keys) {
        try {
          const raw = await sbStorage.get(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          if (!parsed) continue;
          // Normaliza estrutura plana {reajuste_pf,...} para {dados:{...}}
          if (!parsed.dados && (parsed.reajuste_pf !== undefined || parsed.resultado !== undefined || parsed.base_pf !== undefined)) {
            return { dados: parsed };
          }
          return parsed;
        } catch(e) { continue; }
      }
      return null;
    }

    // Soma um campo de receitas para um mês
    // Faturamento BASE = só Link PF + Link PJ (igual à planilha)
    function getFaturamento(mesKey) {
      const nomes = ['Link Pessoa Física', 'Link Pessoa Jurídica'];
      return dadosFinanceiros.receitas
        .filter(r => nomes.includes(r.nome))
        .reduce((s, r) => s + (r[mesKey] || 0), 0);
    }
    // Faturamento TOTAL (todas receitas) — para cards de exibição
    function getFaturamentoTotal(mesKey) {
      return dadosFinanceiros.receitas.reduce((s, r) => s + (r[mesKey] || 0), 0);
    }
    function getJuros(mesKey) {
      const j = dadosFinanceiros.receitas.find(r => r.nome === 'Juros/Multa');
      return j ? (j[mesKey] || 0) : 0;
    }
function getTarifas(mesKey) {
  const t = dadosFinanceiros.despesas.find(r => r.nome === 'Taxas Boleto');
  return t ? (t[mesKey] || 0) : 0;
}
    function getEbitda(mesKey) {
      // Usa o valor direto "EBITDA (Ajustado)" da planilha — não recalcula
      const e = dadosFinanceiros.ebitda_ajustado.find(r => r.nome === 'EBITDA (Ajustado)');
      return e ? (e[mesKey] || 0) : 0;
    }

    // Badge de status
    function badgeStatus(ok, textoOk, textoFail) {
      return ok
        ? `<span style="background:#dcfce7;color:#166534;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.78rem;font-weight:700">✅ Meta Batida</span>`
        : `<span style="background:#fee2e2;color:#991b1b;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.78rem;font-weight:700">❌ Meta não batida</span>`;
    }

    // Linha de indicador da matriz
    function indicadorRow(icon, nome, detalhe, status, comissao) {
      const metaOk = status.includes('Meta Batida') || status.includes('PDF carregado') || status.includes('Eficiente');
      const borderColor = metaOk ? '#059669' : '#ef4444';
      const corComissao = comissao > 0 ? '#059669' : '#94a3b8';
      return `
        <div style="display:grid;grid-template-columns:2fr 3fr auto 1fr;align-items:center;gap:1rem;padding:1rem 1.25rem;background:#f8fafc;border-radius:12px;border-left:4px solid ${borderColor}">
          <div>
            <div style="font-size:0.75rem;color:#64748b;font-weight:600;margin-bottom:0.2rem">${icon} ${nome}</div>
          </div>
          <div style="font-size:0.82rem;color:#334155;line-height:1.7">${detalhe}</div>
          <div>${status}</div>
          <div style="text-align:right">
            <div style="font-size:0.7rem;color:#94a3b8;margin-bottom:0.1rem">Comissão</div>
            <div style="font-size:1.1rem;font-weight:700;color:${corComissao}">${comissao > 0 ? formatCurrency(comissao) : '—'}</div>
          </div>
        </div>`;
    }