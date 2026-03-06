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
      const linhas = [];
      for (const w of words.sort((a,b)=>a.y-b.y)) {
        const l = linhas.find(l => Math.abs(l.y - w.y) <= 12);
        if (l) l.ws.push(w);
        else linhas.push({y: w.y, ws: [w]});
      }
      const rows = linhas.map(l => {
        const ws = l.ws.sort((a,b)=>a.x-b.x);
        const LE = ws.filter(w=>w.x<530 && !/\d/.test(w.text) && !['R$','+'].includes(w.text)).map(w=>w.text).join(' ').trim();
        let VE = null;
        for (const w of ws) if (w.x>=530 && w.x<700 && /\d/.test(w.text)) { VE=parseBR(w.text); break; }
        const LD = ws.filter(w=>w.x>=800 && w.x<1080 && !['R$','(Em','branco)'].includes(w.text)).map(w=>w.text).join(' ').trim();
        const negD = ws.some(w=>w.x>=1080 && w.x<1300 && (w.text==='-R$'||w.text.startsWith('-R$')));
        let VD = null;
        for (const w of ws) {
          if (w.x>=1080 && w.x<1300 && w.text!=='R$' && w.text!=='-R$' && !w.text.startsWith('(')) {
            const v = parseBR(w.text);
            if (v!==null) { VD = negD ? -Math.abs(v) : v; break; }
          }
        }
        // Terceira coluna (Reajuste Contratos PJ, QTD. Canc. 1 Men., Valor Canc. 1 Men.)
        const LC = ws.filter(w=>w.x>=1300 && w.x<1600 && !['R$','(Em','branco)'].includes(w.text) && !(w.text[0]>='0'&&w.text[0]<='9'&&(w.text.length>1||/[.,]/.test(w.text)))).map(w=>w.text).join(' ').trim();
        const negC = ws.some(w=>w.x>=1600 && (w.text==='-R$'||w.text.startsWith('-R$')));
        let VC = null;
        for (const w of ws) {
          if (w.x>=1600 && w.text!=='R$' && w.text!=='-R$' && !w.text.startsWith('(')) {
            const v = parseBR(w.text);
            if (v!==null) { VC = negC ? -Math.abs(v) : v; break; }
          }
        }
        return {y:l.y, LE, VE, LD, VD, LC, VC, ws};
      });
      const getVal = (i, side) => {
        const v = rows[i]['V'+side];
        if (v !== null) return v;
        if (i>0 && rows[i].y - rows[i-1].y <= 22) return rows[i-1]['V'+side];
        return null;
      };
      const mapa = {};
      rows.forEach((r,i)=>{
        if (r.LE) mapa[r.LE] = getVal(i,'E');
        if (r.LD) mapa[r.LD] = getVal(i,'D');
        if (r.LC) mapa[r.LC] = getVal(i,'C');
      });
      const n = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
      const get = lbl => {
        for (const [k,v] of Object.entries(mapa)) if (n(k)===n(lbl)) return v;
        for (const [k,v] of Object.entries(mapa)) if (n(k).includes(n(lbl))||n(lbl).includes(n(k))) return v;
        return null;
      };
      // Busca por linha: varre cada row procurando o label e pega o valor mais próximo à direita
      const getProx = lbl => {
        const nl = n(lbl);
        const lblWords = nl.split(' ');
        for (const row of rows) {
          const ws = row.ws || [];  // ws já ordenado por x
          for (let i=0; i<ws.length; i++) {
            let match = true;
            for (let j=0; j<lblWords.length; j++) {
              if (!ws[i+j] || n(ws[i+j].text) !== lblWords[j]) { match=false; break; }
            }
            if (match) {
              // encontrou o label — pega próximo token numérico à direita
              for (let k=i+lblWords.length; k<ws.length; k++) {
                if (ws[k].text === 'R$' || ws[k].text === '-R$') continue;
                const neg = ws[k].text.startsWith('-') || (k>0 && ws[k-1].text==='-R$');
                const v = parseBR(ws[k].text);
                if (v !== null) return neg ? -Math.abs(v) : v;
              }
            }
          }
        }
        return null;
      };
      // Busca por regex no texto completo da linha, retorna o último valor numérico encontrado
      const findInRow = (regex) => {
        for (const row of rows) {
          const rowText = row.ws.map(w => w.text).join(' ');
          if (regex.test(rowText)) {
            // Pega o último valor numérico da linha (que é o valor à direita do label)
            const nums = row.ws
              .map(w => parseBR(w.text))
              .filter(v => v !== null && v > 0);
            if (nums.length > 0) return nums[nums.length - 1];
          }
        }
        // Fallback: busca em linhas adjacentes (±22px) ao label encontrado
        for (let i = 0; i < rows.length; i++) {
          const rowText = rows[i].ws.map(w => w.text).join(' ');
          if (regex.test(rowText)) {
            // Tenta linha seguinte também
            for (let di = 0; di <= 1; di++) {
              const r = rows[i + di];
              if (!r) continue;
              const nums = r.ws.map(w => parseBR(w.text)).filter(v => v !== null && v > 0);
              if (nums.length > 0) return nums[nums.length - 1];
            }
          }
        }
        return null;
      };

      // ── SCAN DE TEXTO PLANO ──────────────────────────────────────────────────
      // Ordena todas as palavras em ordem de leitura (y crescente, x crescente)
      // e junta num único string. Isso torna a extração imune a coordenadas X.
      const flatText = words
        .slice()
        .sort((a,b) => Math.abs(a.y-b.y)<=8 ? a.x-b.x : a.y-b.y)
        .map(w=>w.text)
        .join(' ');

      // Extrai o primeiro número que vem depois de um padrão de label no texto plano
      const scanFlat = (regex) => {
        const m = flatText.match(regex);
        if (!m) return null;
        // pega o grupo de captura 1 (o valor numérico)
        return parseBR(m[1]);
      };

      // Campos da terceira coluna — extraídos exclusivamente via texto plano
      const val_canc_1a_flat = scanFlat(/Valor\s+Canc\.?\s+1\s+M[eê]n\.?\s+(?:R\$\s*)?([\d.,]+)/i);
      const canc_1a_flat     = scanFlat(/QTD\.?\s+Canc\.?\s+1\s+M[eê]n\.?\s+(\d+)/i);
      const reajuste_pf_flat = scanFlat(/Reajuste\s+Contratos\s+PF\s+(?:R\$\s*)?([\d.,]+)/i);
      const reajuste_pj_flat = scanFlat(/Reajuste\s+Contratos\s+PJ\s+(?:R\$\s*)?([\d.,]+)/i);

      // Valor Canc. PJ + PME — label muito específico, sem risco de colisão
      const val_canc_pj_flat = scanFlat(/Valor\s+Canc\.?\s+PJ\s*\+\s*PME\s+(?:R\$\s*)?([\d.,]+)/i)
                            ?? scanFlat(/Valor\s+Canc\.?\s+PJ\s+(?:R\$\s*)?([\d.,]+)/i);

      return {
        base_pf: get('Basse Clientes PF'), base_pj: get('Base Clientes PJ'),
        base_isentos: get('Base Isentos'), contratos: get('Base de Contratos'),
        os_pf: get('OS Suporte PF'), os_pj: get('OS Suporte PJ'),
        nc_pf: get('Novos Clientes PF'), nc_pj: get('Novos Clientes PJ'),
        canc_pf: get('Cancelamento PF'), canc_pj: get('Cancelam.'),
        retiradas: get('Retiradas'), canc_sr: get('Can S/'),
        canc_1a:     canc_1a_flat     ?? getProx('QTD. Canc. 1 Men.') ?? findInRow(/qtd\.?\s+canc\.?\s+1\s+men/i) ?? null,
        reat_ret: get('Reativacoes Retirada'), nn: get('Novos Negócios'),
        nn_pf: get('Novos Negócios PF'), nn_pj: get('Novos Negócios PJ'),
        upgrade: get('Upgrade'), reat: mapa['Reativacoes'] ?? mapa['Reativações'] ?? null,
        val_canc: mapa['Valor Cancelamento'] ?? null,
        val_canc_pf: get('Valor Cancelamento PF'),
        val_canc_pj: val_canc_pj_flat ?? null,
        val_canc_1a: val_canc_1a_flat ?? getProx('Valor Canc. 1 Men.') ?? findInRow(/valor\s+canc\.?\s+1\s+men/i) ?? null,
        downgrade: get('Downgrade'),
        resultado: get('Resultado'), juros45: get('Juros < 45'),
        juros45m: get('Juros >45'),
        reajuste_pf: reajuste_pf_flat ?? getProx('Reajuste Contratos PF') ?? findInRow(/reajuste\s+contratos\s+pf/i) ?? null,
        reajuste_pj: reajuste_pj_flat ?? getProx('Reajuste Contratos PJ') ?? findInRow(/reajuste\s+contratos\s+pj/i) ?? null,
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
        const MESES_NOME = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
        const mes = MESES_NOME.findIndex(m => txt.includes(m) || txt.includes(m.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
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
