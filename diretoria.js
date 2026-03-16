// ==================== DIRETORIA ====================
    const CAMPOS = [
      { key: 'base_pf',      label: 'Base Clientes PF',      tipo: 'int' },
      { key: 'base_pj',      label: 'Base Clientes PJ +PME', tipo: 'int' },
      { key: 'base_isentos', label: 'Base Isentos',          tipo: 'int' },
      { key: 'contratos',    label: 'Base de Contratos',     tipo: 'int' },
      { key: 'os_pf',        label: 'OS Suporte PF',         tipo: 'int' },
      { key: 'os_pj',        label: 'OS Suporte PJ',         tipo: 'int' },
      { key: 'nc_pf',        label: 'Novos Clientes PF',     tipo: 'int' },
      { key: 'nc_pj',        label: 'Novos Clientes PJ',     tipo: 'int' },
      { key: 'canc_pf',      label: 'Cancelamento PF',       tipo: 'int' },
      { key: 'canc_pj',      label: 'Cancelam. PME + PJ',    tipo: 'int' },
      { key: 'retiradas',    label: 'Retiradas',             tipo: 'int' },
      { key: 'canc_sr',      label: 'Can S/ Retirada',       tipo: 'int' },
      { key: 'canc_1a',      label: 'QTD. Canc. 1 Men.',     tipo: 'int' },
      { key: 'val_canc_1a',  label: 'Valor Canc. 1 Men.',    tipo: 'brl' },
      { key: 'reat_ret',     label: 'Reativacoes Retirada',  tipo: 'int' },
      { key: 'nn',           label: 'Novos Negócios',        tipo: 'brl' },
      { key: 'nn_pf',        label: 'Novos Negócios PF',     tipo: 'brl' },
      { key: 'nn_pj',        label: 'Novos Negócios PJ',     tipo: 'brl' },
      { key: 'upgrade',      label: 'Upgrade',               tipo: 'brl' },
      { key: 'reat',         label: 'Reativacoes',           tipo: 'brl' },
      { key: 'val_canc',     label: 'Valor Cancelamento',    tipo: 'brl' },
      { key: 'val_canc_pf',  label: 'Valor Cancelamento PF', tipo: 'brl' },
      { key: 'val_canc_pj',  label: 'Valor Canc. PJ + PME',  tipo: 'brl' },
      { key: 'downgrade',    label: 'Downgrade',             tipo: 'brl' },
      { key: 'resultado',    label: 'Resultado Liquido',     tipo: 'brl' },
      { key: 'juros45',      label: 'Juros < 45',            tipo: 'brl' },
      { key: 'juros45m',     label: 'Juros >45',             tipo: 'brl' },
      { key: 'reajuste_pf',  label: 'Reajuste Contratos PF', tipo: 'brl' },
      { key: 'reajuste_pj',  label: 'Reajuste Contratos PJ', tipo: 'brl' },
    ];

    function parseBR(s) {
      if (!s) return null;
      s = String(s).replace(/R\$\s*/g, '').trim();
      const neg = s.startsWith('-');
      s = s.replace(/-/g, '').trim();
      if (!s || s === '(Em branco)') return null;
      if (/\d\.\d{3},/.test(s)) s = s.replace(/\./g,'').replace(',','.');
      else if (/,\d{1,2}$/.test(s)) s = s.replace(',','.');
      const v = parseFloat(s);
      return isNaN(v) ? null : (neg ? -v : v);
    }

    function lerPdf(words) {
      // Usa a ordem do content stream do PDF (label seguido do valor).
      // O Power BI exporta os cards em sequência: label1 valor1 label2 valor2...
      // NÃO ordenar por coordenadas — o sort por y+x embaralha o layout de 4 colunas.
      const flatText = words.map(w => w.text).join(' ');

      // Extrai o primeiro valor numérico após o label (captura grupo 1)
      const scan = (regex) => {
        const m = flatText.match(regex);
        return m ? parseBR(m[1]) : null;
      };

      // Para valores que podem ser negativos: captura "-R$ 1.234,56" ou "R$ 1.234,56" inteiro
      const scanSigned = (labelRegex) => {
        const re = new RegExp(
          labelRegex.source + String.raw`\s+(-R\$\s*[\d.,]+|R\$\s*[\d.,]+|-[\d.,]+|[\d.,]+)`, 'i'
        );
        const m = flatText.match(re);
        return m ? parseBR(m[1]) : null;
      };

      return {
        base_pf:      scan(/Base\s+de?\s+Clientes?\s+PF\s+(\d[\d.]*)/i),
        base_pj:      scan(/Base\s+Clientes\s+PJ[^0-9]*?(\d[\d.]*)/i),
        base_isentos: scan(/Base\s+de?\s+Isentos?\s+(\d[\d.]*)/i),
        contratos:    scan(/Base\s+de\s+Contratos?\s+(\d[\d.]*)/i),
        os_pf:        scan(/OS?\s+Suporte\s+PF\s+(\d[\d.]*)/i),
        os_pj:        scan(/OS?\s+Suporte\s+PJ\s+(\d[\d.]*)/i),
        nc_pf:        scan(/Novos\s+Clientes\s+PF\s+(\d[\d.]*)/i),
        nc_pj:        scan(/Novos\s+Clientes\s+PJ\s+(\d[\d.]*)/i),
        canc_pf:      scan(/Cancelamento\s+PF\s+(\d[\d.]*)/i),
        canc_pj:      scan(/Cancelam\.\s+PME\s*\+\s*PJ\s+(\d[\d.]*)/i),
        retiradas:    scan(/\bRetiradas\s+(\d[\d.]*)/i),
        canc_sr:      scan(/Cancelamento\s+s\/\s*equip[^0-9]*?(\d+)/i),
        canc_1a:      scan(/QTD\.?\s+Canc\.?\s+1\s+M[eê]n\.?\s+(\d+)/i),
        val_canc_1a:  scan(/Valor\s+Canc\.?\s+1\s+M[eê]n\.?\s+(?:R\$\s*)?([\d.,]+)/i),
        reat_ret:     scan(/Reativa[çc][oõ]es?\s+Retiradas?\s+(\d[\d.]*)/i),
        nn:           scan(/\bNovos\s+Neg[oó]cios\s+(?!PF|PJ)(?:R\$\s*)?([\d.,]+)/i),
        nn_pf:        scan(/Novos\s+Neg[oó]cios\s+PF\s+(?:R\$\s*)?([\d.,]+)/i),
        nn_pj:        scan(/Novos\s+Neg[oó]cios\s+PJ\s+(?:R\$\s*)?([\d.,]+)/i),
        upgrade:      scan(/(?:Valor\s+)?Upgrade\s+(?:R\$\s*)?([\d.,]+)/i),
        reat:         scan(/Valor\s+Reativa[çc][oõ]es?\s+(?:R\$\s*)?([\d.,]+)/i),
        val_canc:     scan(/\bValor\s+Cancelamento\s+(?!PF)(?:R\$\s*)?([\d.,]+)/i),
        val_canc_pf:  scan(/Valor\s+Cancelamento\s+PF\s+(?:R\$\s*)?([\d.,]+)/i),
        val_canc_pj:  scan(/Valor\s+Canc\.?\s+PJ\s*\+\s*PME?\s+(?:R\$\s*)?([\d.,]+)/i),
        downgrade:    scanSigned(/(?:Valor\s+)?Downgrade/),
        resultado:    scanSigned(/Resultado\s+Liquido/),
        juros45:      scan(/Juros\s*<\s*45\s+(?:R\$\s*)?([\d.,]+)/i),
        juros45m:     scan(/Juros\s*>\s*45\s+(?:R\$\s*)?([\d.,]+)/i),
        reajuste_pf:  scan(/Reajuste\s+Contratos\s+PF\s+(?:R\$\s*)?([\d.,]+)/i),
        reajuste_pj:  scan(/Reajuste\s+Contratos\s+PJ\s+(?:R\$\s*)?([\d.,]+)/i),
      };
    }

    async function diretoriaCarregarPdf(input) {
      const file = input.files[0];
      if (!file) return;
      const loading = document.getElementById('diretoriaLoadingOCR');
      const status  = document.getElementById('diretoriaOCRStatus');
      const bar     = document.getElementById('diretoriaOCRBar');
      loading.style.display = 'block';
      status.textContent = 'Lendo PDF...';
      bar.style.width = '20%';
      document.getElementById('diretoriaPreviewSection').style.display = 'none';
      document.getElementById('diretoriaPdfInfo').style.display = 'none';
      try {
        const buf = await file.arrayBuffer();
        const lib = window['pdfjs-dist/build/pdf'];
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await lib.getDocument(new Uint8Array(buf)).promise;
        bar.style.width = '50%';
        let words = [];
        for (let p=1; p<=pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const vp   = page.getViewport({scale:1});
          const ct   = await page.getTextContent();
          ct.items.forEach(item => {
            const x = item.transform[4];
            const y = vp.height - item.transform[5];
            const t = item.str.trim();
            if (t) words.push({x,y,text:t});
          });
        }
        bar.style.width = '80%';
        const dados = lerPdf(words);
        const txt = words.map(w=>w.text).join(' ').toLowerCase();
        const txtNorm = txt.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const MESES_NOME = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
        const mes = MESES_NOME.findIndex(m => {
          const mNorm = m.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
          return txt.includes(m) || txtNorm.includes(mNorm);
        });
        const anoM = txt.match(/20(\d\d)/);
        const ano = anoM ? parseInt('20'+anoM[1]) : 2026;
        bar.style.width = '100%';
        loading.style.display = 'none';
        document.getElementById('diretoriaPdfInfo').style.display = 'block';
        document.getElementById('diretoriaPdfNome').textContent = file.name;
        if (mes>=0) document.getElementById('dirMes').value = mes;
        document.getElementById('dirAno').value = ano;
        diretoriaDadosExtraidos = dados;
        diretoriaMostrarGrid(dados);
        document.getElementById('diretoriaPreviewSection').style.display = 'block';
        // Verifica se já existe registro — só atualiza o aviso, NÃO esconde o grid
        diretoriaAtualizarAviso(mes, ano);
      } catch(e) {
        loading.style.display = 'none';
        alert('Erro: '+e.message);
      }
      input.value='';
    }

    function diretoriaMostrarGrid(dados) {
      const grid = document.getElementById('diretoriaDataGrid');
      grid.innerHTML = '';
      CAMPOS.forEach(c => {
        const val = dados[c.key];
        const div = document.createElement('div');
        div.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center;gap:0.5rem;';
        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:0.85rem;color:#475569;flex-shrink:0;font-weight:500;';
        lbl.textContent = c.label;
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.dataset.key = c.key;
        // Formata o valor de acordo com o tipo do campo
        let displayVal = '';
        if (val !== null && val !== undefined) {
          if (c.tipo === 'brl') {
            displayVal = 'R$ ' + Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (val < 0) displayVal = '-' + displayVal;
          } else {
            displayVal = String(val);
          }
        }
        inp.value = displayVal;
        inp.placeholder = '—';
        const cor = val===null||val===undefined ? '#94a3b8' : (val<0 ? '#b91c1c' : '#166534');
        inp.style.cssText = `width:120px;text-align:right;border:1px solid #cbd5e1;border-radius:6px;padding:0.3rem 0.6rem;font-weight:700;font-size:0.92rem;color:${cor};background:white;`;
        inp.oninput = function() { diretoriaDadosExtraidos[c.key] = parseBR(this.value); };
        div.appendChild(lbl); div.appendChild(inp); grid.appendChild(div);
      });
    }
    // ======= SALVAR / CARREGAR INDICADORES NO SUPABASE =======

    function indChave(mes, ano) {
      const m = String(parseInt(mes)+1).padStart(2,'0');
      return `ind_dados:${ano}:${m}`;
    }

    async function diretoriaVerificarMesAno() {
      const mes = document.getElementById('dirMes')?.value ?? 0;
      const ano = document.getElementById('dirAno')?.value ?? 2026;
      const info = document.getElementById('dirStorageInfo');
      if (!info) return;
      info.textContent = '⏳ Verificando...';
      try {
        const existing = await sbStorage.get(indChave(mes, ano));
        if (existing) {
          const d = JSON.parse(existing);
          const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
          info.innerHTML = `<span style="color:#059669;font-weight:700">✓ Já existe dado salvo para ${meses[mes]}/${ano}</span> — salvar substituirá.`;
        } else {
          info.innerHTML = `<span style="color:#64748b">Nenhum dado salvo ainda para este mês.</span>`;
        }
      } catch(e) {
        info.textContent = '';
      }
    }

    async function diretoriaAtualizarAviso(mes, ano) {
      await diretoriaVerificarMesAno();
    }

    async function diretoriaCarregarInformacoes() {
      const btn = document.getElementById('btnCarregarInfo');
      const msg = document.getElementById('dirSalvoMsg');
      if (!diretoriaDadosExtraidos) {
        // Collect from grid inputs if no extracted data
        diretoriaDadosExtraidos = {};
        document.querySelectorAll('#diretoriaDataGrid input[data-key]').forEach(inp => {
          diretoriaDadosExtraidos[inp.dataset.key] = parseBR(inp.value);
        });
      }
      const mes = document.getElementById('dirMes')?.value ?? 0;
      const ano = document.getElementById('dirAno')?.value ?? 2026;
      const chave = indChave(mes, ano);
      btn.disabled = true;
      btn.textContent = '⏳ Salvando...';
      try {
        await sbStorage.set(chave, JSON.stringify(diretoriaDadosExtraidos));
        msg.style.display = 'block';
        msg.style.background = '#dcfce7';
        msg.style.color = '#166534';
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        msg.innerHTML = `✅ Dados de <strong>${meses[mes]}/${ano}</strong> salvos com sucesso no Supabase!`;
        await diretoriaVerificarMesAno();
        // Atualiza indicadores se a aba estiver visível
        if (typeof carregarIndicadoresMes === 'function') carregarIndicadoresMes();
      } catch(e) {
        msg.style.display = 'block';
        msg.style.background = '#fee2e2';
        msg.style.color = '#991b1b';
        msg.textContent = '❌ Erro ao salvar: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '💾 Carregar Informações';
      }
    }