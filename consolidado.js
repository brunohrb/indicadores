// ==================== CONSOLIDADO CSV SYNC ====================
    const ONEDRIVE_CSV_URL = 'https://excel.officeapps.live.com/x/_layouts/XlFileHandler.aspx?sheetName=JAN%202026&downloadAsCsvEnabled=1&WacUserType=WOPI&usid=81107527-d1ec-8889-b800-a4c8b76fe6e5&NoAuth=1&waccluster=PBR1';

    // Mapeamento: nome no CSV → chave em dadosFinanceiros + categoria
    const CSV_MAP = {
      // RECEITAS
      'link pessoa física':        { cat:'receitas', nome:'Link Pessoa Física' },
      'link pf':                   { cat:'receitas', nome:'Link Pessoa Física' },
      'link pessoa jurídica':      { cat:'receitas', nome:'Link Pessoa Jurídica' },
      'link pj':                   { cat:'receitas', nome:'Link Pessoa Jurídica' },
      'juros/multa':               { cat:'receitas', nome:'Juros/Multa' },
      'juros':                     { cat:'receitas', nome:'Juros/Multa' },
      'taxa de instalação':        { cat:'receitas', nome:'Taxa de instalação' },
      'eventos':                   { cat:'receitas', nome:'Eventos' },
      'multa fidelidade':          { cat:'receitas', nome:'Multa fidelidade e equipamento' },
      'multa fidelidade e equipamento': { cat:'receitas', nome:'Multa fidelidade e equipamento' },
      'rendimentos financeiros':   { cat:'receitas', nome:'Rendimentos financeiros' },
      'ativos imobilizados': { cat:'receitas', nome:'V. Ativos imobilizados' },
      'ativos imobilizados': { cat:'receitas', nome:'V. Ativos imobilizados' },
      'vendas canceladas e estornos': { cat:'receitas', nome:'Vendas canceladas e estornos' },
      'vendas canceladas':         { cat:'receitas', nome:'Vendas canceladas e estornos' },
      // IMPOSTOS
      'icms':                      { cat:'impostos', nome:'ICMS' },
      'cofins':                    { cat:'impostos', nome:'COFINS' },
      'pis':                       { cat:'impostos', nome:'PIS' },
      'irpj':                      { cat:'impostos', nome:'IRPJ' },
      'csll':                      { cat:'impostos', nome:'CSLL' },
      'iss':                       { cat:'impostos', nome:'ISS' },
      'fust/funttel':              { cat:'impostos', nome:'FUST/FUNTTEL' },
      'fust':                      { cat:'impostos', nome:'FUST/FUNTTEL' },
      // CUSTOS
      'kit instalação':            { cat:'custos', nome:'Kit Instalação' },
      'materiais de rede':         { cat:'custos', nome:'Materiais de Rede' },
      'links de dados':            { cat:'custos', nome:'Links de Dados / Voip' },
      'links de dados / voip':     { cat:'custos', nome:'Links de Dados / Voip' },
      'vtal':                      { cat:'custos', nome:'Vtal' },
      'alugueis de postes':        { cat:'custos', nome:'Alugueis de Postes' },
      'alugueis de torre':         { cat:'custos', nome:'Alugueis de Torre e POP' },
      'alugueis de torre e pop':   { cat:'custos', nome:'Alugueis de Torre e POP' },
      'custo com sva':             { cat:'custos', nome:'Custo com SVA' },
      'energia / pop':             { cat:'custos', nome:'Energia / POP' },
      'comissões de vendas':       { cat:'custos', nome:'Comissões de vendas' },
      'combustível técnico':       { cat:'custos', nome:'Combustível técnico' },
      'manut. veículo':            { cat:'custos', nome:'Manut. Veículo' },
      'manutenção veículo':        { cat:'custos', nome:'Manut. Veículo' },
      'folha - direta':            { cat:'custos', nome:'Folha - Direta' },
      'folha direta':              { cat:'custos', nome:'Folha - Direta' },
      'telefonia':                 { cat:'custos', nome:'Telefonia' },
      'ferramentas':               { cat:'custos', nome:'Ferramentas' },
      'custos lastmile':           { cat:'custos', nome:'Custos Lastmile' },
      // DESPESAS
      'marketing':                 { cat:'despesas', nome:'Marketing' },
      'serv. terceiros':           { cat:'despesas', nome:'Serv. Terceiros, jurídicos e consultorias' },
      'serviços terceiros':        { cat:'despesas', nome:'Serv. Terceiros, jurídicos e consultorias' },
      'aluguel de escritório':     { cat:'despesas', nome:'Desp. Aluguel de escritório' },
      'desp. aluguel':             { cat:'despesas', nome:'Desp. Aluguel de escritório' },
      'pró-labore':                { cat:'despesas', nome:'Pró-Labore' },
      'pro-labore':                { cat:'despesas', nome:'Pró-Labore' },
      'sistema':                   { cat:'despesas', nome:'Sistema' },
      'taxas boleto':              { cat:'despesas', nome:'Taxas Boleto' },
      'tarifas bancárias':         { cat:'despesas', nome:'Tarifas bancárias' },
      'tarifas bancarias':         { cat:'despesas', nome:'Tarifas bancárias' },
      // EBITDA
      'ebitda':                    { cat:'ebitda', nome:'EBITDA' },
      // EBITDA AJUSTADO
      'irpj (previsão)':           { cat:'ebitda_ajustado', nome:'IRPJ (Previsão)' },
      'cssl (previsão)':           { cat:'ebitda_ajustado', nome:'CSSL (Previsão)' },
      'trimestral':                { cat:'ebitda_ajustado', nome:'Trimestral' },
      'compra de provedor':        { cat:'ebitda_ajustado', nome:'Compra de Provedor' },
      'ajuste (postes)':           { cat:'ebitda_ajustado', nome:'Ajuste (Postes)' },
      'ajuste vtal':               { cat:'ebitda_ajustado', nome:'Ajuste Vtal Fora' },
      'ebitda (ajustado)':         { cat:'ebitda_ajustado', nome:'EBITDA (Ajustado)' },
      // AJUSTES DE CAIXA
      'investimento':              { cat:'ajustes', nome:'Investimento' },
      'empr/finac/parcel':         { cat:'ajustes', nome:'Empr/Finac/Parcel' },
      'impostos':                  { cat:'ajustes', nome:'Impostos' },
      'sócios ou retiradas':       { cat:'ajustes', nome:'Sócios ou Retiradas' },
      'retiradas':                 { cat:'ajustes', nome:'Sócios ou Retiradas' },
      // BANCOS
      'mg - itaú':                 { cat:'bancos', nome:'MG - Itaú' },
      'speed - itaú':              { cat:'bancos', nome:'Speed - Itaú + Vinc.' },
      'caixa tesouraria':          { cat:'bancos', nome:'Caixa Tesouraria' },
    };

    const MESES_CSV_KEY = { 'jan':0,'fev':1,'mar':2,'abr':3,'mai':4,'jun':5,'jul':6,'ago':7,'set':8,'out':9,'nov':10,'dez':11,
      'janeiro':0,'fevereiro':1,'março':2,'abril':3,'maio':4,'junho':5,'julho':6,'agosto':7,'setembro':8,'outubro':9,'novembro':10,'dezembro':11 };

    function syncSetStatus(msg, tipo) {
      const el = document.getElementById('syncStatusMsg');
      if (!el) return;
      const cor = tipo==='ok' ? '#059669' : tipo==='erro' ? '#b91c1c' : tipo==='warn' ? '#b45309' : '#64748b';
      el.innerHTML = `<span style="color:${cor}">${msg}</span>`;
    }
    function syncSetProgress(pct, msg) {
      const bar  = document.getElementById('syncProgressBar');
      const fill = document.getElementById('syncProgressFill');
      const txt  = document.getElementById('syncProgressMsg');
      if (!bar) return;
      if (pct === null) { bar.style.display='none'; return; }
      bar.style.display = 'block';
      fill.style.width  = pct + '%';
      txt.textContent   = msg || '';
    }

    // Sync date — mantido em localStorage por performance (não precisa persistir entre dispositivos)
    function syncJaFezHoje() {
      const ultima = localStorage.getItem('consolidado_sync_data');
      return ultima === new Date().toISOString().slice(0,10);
    }
    function syncMarcarFeito() {
      localStorage.setItem('consolidado_sync_data', new Date().toISOString().slice(0,10));
    }

    async function syncAtualizarStatusUI() {
      const raw = await sbStorage.get('consolidado_dados');
      const ultima = localStorage.getItem('consolidado_sync_data');
      if (raw) {
        const hoje = new Date().toISOString().slice(0,10);
        if (ultima === hoje) {
          syncSetStatus(`✅ Dados sincronizados hoje (${new Date().toLocaleDateString('pt-BR')})`, 'ok');
        } else {
          syncSetStatus(`⚠️ Última atualização: ${ultima ? new Date(ultima+'T12:00:00').toLocaleDateString('pt-BR') : 'desconhecida'} — faça upload para atualizar`, 'warn');
        }
      } else {
        syncSetStatus('⚡ Nenhum dado importado ainda. Faça upload do XLSX.', 'info');
      }
    }

    // Tenta buscar CSV do OneDrive automaticamente
    async function consolidadoAutoFetch() {
      const btn = document.getElementById('btnAutoFetch');
      if (btn) { btn.disabled=true; btn.textContent='⏳ Buscando...'; }
      syncSetProgress(10, 'Conectando ao OneDrive...');
      syncSetStatus('Buscando dados do OneDrive...', 'info');
      try {
        const resp = await fetch(ONEDRIVE_CSV_URL, { mode:'cors' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const text = await resp.text();
        if (!text || text.trim().length < 10) throw new Error('Resposta vazia');
        syncSetProgress(50, 'Dados recebidos, processando CSV...');
        await consolidadoProcessarCsv(text, 'OneDrive');
      } catch(e) {
        syncSetProgress(null);
        syncSetStatus(`❌ Não foi possível buscar automaticamente (${e.message}). Use o upload manual.`, 'erro');
        // Destaca o botão de upload
        const label = document.querySelector('label[for="consolidadoCsvInput"], label:has(#consolidadoCsvInput)');
        if (label) label.style.background = '#fef3c7';
      }
      if (btn) { btn.disabled=false; btn.textContent='☁️ Buscar do OneDrive'; }
    }

    async function consolidadoParseXlsx(input) {
      const file = input.files[0];
      if (!file) return;
      syncSetProgress(10, 'Lendo arquivo XLSX...');
      syncSetStatus('Lendo arquivo...', 'info');
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });

          // Usa aba "Anual Real - XXXX"
          const sheetName = wb.SheetNames.find(s => s.toLowerCase().includes('anual real')) || wb.SheetNames[0];
          syncSetProgress(30, `Lendo aba: ${sheetName}`);
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: 0 });

          const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
          const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();

          // Detecta header com meses
          let headerIdx = -1;
          const colMeses = {};
          for (let i = 0; i < Math.min(10, rows.length); i++) {
            rows[i].forEach((cel, ci) => {
              if (typeof cel === 'string') {
                const c = norm(cel).slice(0,3);
                if (MESES.includes(c)) { colMeses[c] = ci; headerIdx = i; }
              }
            });
            if (Object.keys(colMeses).length >= 6) break;
          }
          if (headerIdx < 0) {
            syncSetStatus('❌ Colunas de meses não encontradas. Use a aba "Anual Real".', 'erro');
            syncSetProgress(null); return;
          }

          syncSetProgress(50, `Meses: ${Object.keys(colMeses).join(', ')}`);

          // Seções do fluxo de caixa
          const SECTIONS = { 'receitas':'receitas', 'impostos':'impostos', 'custos':'custos',
            'despesas operac.':'despesas', 'despesas financ.':'despesas', 'ebitda':'ebitda_section' };
          const STOP_SECTIONS = new Set(['ajustes de caixa','saidas','entradas']);
          const SKIP_ROWS = new Set(['desembolsos','receitas','custos','impostos','despesas operac.','despesas financ.']);
          const EBITDA_AJ_STARTS = ['inclusao','irpj (previsao)','cssl (previsao)','trimestral',
            'compra de provedor','ajuste (postes)','ajuste vtal fora','credito icms',
            'ajuste (mark/equip)','datora','ebitda (ajustado)'];
          const AJUSTES_NAMES = new Set(['investimento','compra de veiculos',
            'invest. tecnico e administrativo','aq. de provedor','empr/finac/parcel',
            'investimentos pop','emprestimos para giro','reneg. debitos','socios ou retiradas']);

          // Índice dos itens existentes no dadosFinanceiros
          const itemIdx = {};
          ['receitas','impostos','custos','despesas','ebitda','ebitda_ajustado','ajustes'].forEach(cat => {
            (dadosFinanceiros[cat]||[]).forEach(item => { itemIdx[item.nome] = item; });
          });

          let cur = null, stopped = false, atualizados = 0;
          const ebitdaValuesRow = {}; // store EBITDA real row

          // First pass: main sections (receitas→ebitda_ajustado)
          for (let i = headerIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            const nomeRaw = typeof row[0] === 'string' ? row[0].trim() : '';
            if (!nomeRaw) continue;
            const n = norm(nomeRaw);

            // Skip % rows
            const v0 = row[Object.values(colMeses)[0]];
            if (typeof v0 === 'number' && v0 !== 0 && Math.abs(v0) < 2) continue;

            if (STOP_SECTIONS.has(n)) { stopped = true; continue; }
            if (stopped) continue;

            if (n in SECTIONS) { cur = SECTIONS[n]; continue; }
            if (!cur || SKIP_ROWS.has(n)) continue;

            // Special: capture EBITDA real row
            if (n === 'ebitda' && cur === 'ebitda_section') {
              const v = row[colMeses['jan']];
              if (typeof v === 'number' && v > 100000) {
                MESES.forEach(m => { ebitdaValuesRow[m] = typeof row[colMeses[m]] === 'number' ? Math.round(row[colMeses[m]]*100)/100 : 0; });
                continue;
              }
            }

            const isEbitdaAj = EBITDA_AJ_STARTS.some(s => n.startsWith(s));
            const cat = isEbitdaAj ? 'ebitda_ajustado' : (cur === 'ebitda_section' ? 'ebitda_ajustado' : cur);

            const item = itemIdx[nomeRaw];
            if (!item) continue;

            MESES.forEach(m => {
              const v = row[colMeses[m]];
              item[m] = typeof v === 'number' ? Math.round(v*100)/100 : 0;
            });
            item.total = Math.round(MESES.reduce((s,m) => s+(item[m]||0), 0)*100)/100;
            atualizados++;
          }

          // Update EBITDA row
          const ebitdaItem = itemIdx['EBITDA'];
          if (ebitdaItem && Object.keys(ebitdaValuesRow).length > 0) {
            MESES.forEach(m => { ebitdaItem[m] = ebitdaValuesRow[m] || 0; });
            ebitdaItem.total = Math.round(MESES.reduce((s,m)=>s+(ebitdaItem[m]||0),0)*100)/100;
            atualizados++;
          }

          // Second pass: ajustes from SAÍDAS section
          let inSaidas = false;
          for (let i = headerIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row[0]) continue;
            const n = norm(String(row[0]).trim());
            if (n === 'ajustes de caixa' || n === 'saidas') { inSaidas = true; continue; }
            if (n === 'entradas' || n === 'geracao de caixa') { inSaidas = false; continue; }
            if (!inSaidas || !AJUSTES_NAMES.has(n)) continue;
            const nomeRaw = String(row[0]).trim();
            const item = itemIdx[nomeRaw];
            if (!item) continue;
            MESES.forEach(m => {
              const v = row[colMeses[m]];
              item[m] = typeof v === 'number' ? Math.round(v*100)/100 : 0;
            });
            item.total = Math.round(MESES.reduce((s,m)=>s+(item[m]||0),0)*100)/100;
            atualizados++;
          }

          syncSetProgress(90, 'Salvando no Supabase...');
          await sbStorage.set('consolidado_dados', JSON.stringify(dadosFinanceiros));
          await sbStorage.set('consolidado_versao', DADOS_VERSION);
          syncMarcarFeito();
          showTab(document.querySelector('.tab-btn.active')?.textContent?.toLowerCase().trim() || 'receitas');
          renderComissao();
          syncSetProgress(null);
          input.value = '';
          syncSetStatus(
            atualizados > 0
              ? `✅ ${atualizados} itens importados da aba "${sheetName}"`
              : `⚠️ Nenhum item reconhecido. Verifique o arquivo.`,
            atualizados > 0 ? 'ok' : 'warn'
          );
        } catch(err) {
          syncSetProgress(null);
          syncSetStatus(`❌ Erro ao ler XLSX: ${err.message}`, 'erro');
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(file);
      input.value = '';
    }

    // Parser principal do CSV — versão simples e robusta
    async function consolidadoProcessarCsv(csvText, fonte) {
      try {
        syncSetProgress(40, 'Detectando estrutura...');

        // Normaliza separador (vírgula ou ponto-e-vírgula)
        const linhas = csvText.split(/\r?\n/);
        const sep = linhas[0].includes(';') ? ';' : ',';
        const rows = linhas.map(l => l.split(sep).map(c => c.trim().replace(/^["']|["']$/g, '').trim()));

        // Detecta linha do header buscando meses
        const MESES_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez',
                          'janeiro','fevereiro','março','marco','abril','maio','junho','julho',
                          'agosto','setembro','outubro','novembro','dezembro'];
        let headerIdx = -1;
        let colMeses = {}; // mesKey → colIndex

        for (let i = 0; i < Math.min(15, rows.length); i++) {
          let achou = 0;
          rows[i].forEach((cel, ci) => {
            const c = cel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
            const idx = MESES_PT.indexOf(c);
            if (idx >= 0) {
              const mesKey = MESES_KEY[idx % 12];
              colMeses[mesKey] = ci;
              achou++;
            }
          });
          if (achou >= 2) { headerIdx = i; break; }
        }

        if (headerIdx < 0 || Object.keys(colMeses).length === 0) {
          // Tenta formato alternativo: apenas 2 colunas (nome, valor)
          syncSetStatus('⚠️ Não encontrei colunas de meses no CSV. Formato esperado: linhas com nome + colunas Jan, Fev, etc.', 'warn');
          syncSetProgress(null);
          return;
        }

        syncSetProgress(60, `Header na linha ${headerIdx+1}, meses: ${Object.keys(colMeses).join(', ')}`);

        // Mapeia nome normalizado → item de dadosFinanceiros
        const itemMap = {};
        ['receitas','impostos','custos','despesas','ebitda','ebitda_ajustado','ajustes','bancos'].forEach(cat => {
          (dadosFinanceiros[cat] || []).forEach(item => {
            const chave = item.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
            itemMap[chave] = item;
          });
        });

        let atualizados = 0;
        const log = [];

        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row[0] || row[0].trim() === '') continue;

          const nomeNorm = row[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();

          // Busca exata ou parcial
          let item = itemMap[nomeNorm];
          if (!item) {
            item = Object.entries(itemMap).find(([k]) =>
              nomeNorm.startsWith(k.slice(0,8)) || k.startsWith(nomeNorm.slice(0,8))
            )?.[1];
          }
          if (!item) continue;

          // Aplica valores dos meses
          let algumValor = false;
          Object.entries(colMeses).forEach(([mesKey, ci]) => {
            const raw = (row[ci] || '').replace(/\./g,'').replace(',','.').replace(/[^\d\-\.]/g,'');
            const val = parseFloat(raw);
            if (!isNaN(val)) { item[mesKey] = val; algumValor = true; }
          });

          // Total (última coluna com valor ou coluna 'total')
          if (algumValor) {
            const vals = Object.values(colMeses).map(ci => {
              const raw = (row[ci]||'').replace(/\./g,'').replace(',','.').replace(/[^\d\-\.]/g,'');
              return parseFloat(raw) || 0;
            });
            item.total = vals.reduce((s,v)=>s+v,0);
            atualizados++;
            log.push(item.nome);
          }
        }

        syncSetProgress(90, 'Salvando no Supabase...');
        await sbStorage.set('consolidado_dados', JSON.stringify(dadosFinanceiros));
        syncMarcarFeito();

        // Refresh
        showTab(document.querySelector('.tab-btn.active')?.textContent?.toLowerCase() || 'receitas');
        renderComissao();
        syncSetProgress(null);

        if (atualizados === 0) {
          syncSetStatus(`⚠️ Arquivo lido mas nenhuma categoria foi reconhecida. Verifique se os nomes batem com o sistema.`, 'warn');
        } else {
          syncSetStatus(`✅ ${atualizados} categorias atualizadas via ${fonte}: ${log.slice(0,4).join(', ')}${log.length>4?'...':''}`, 'ok');
        }

      } catch(err) {
        syncSetProgress(null);
        syncSetStatus(`❌ Erro: ${err.message}`, 'erro');
        console.error('CSV parse error:', err);
      }
    }

    // Auto-fetch na primeira visita do dia
    const DADOS_VERSION = '2026-v10'; // Incrementar sempre que os dados hardcoded mudarem

    async function consolidadoInicializar() {
      syncAtualizarStatusUI();

      // Restaura dados salvos do Supabase
      try {
        const savedVersion = await sbStorage.get('consolidado_versao');
        const saved = await sbStorage.get('consolidado_dados');

        if (savedVersion === DADOS_VERSION && saved) {
          const parsed = JSON.parse(saved);
          Object.assign(dadosFinanceiros, parsed);

          // Patch: garante que Parcel. Impostos esteja em ajustes
          if (dadosFinanceiros.ajustes && !dadosFinanceiros.ajustes.find(i => i.nome === 'Parcel. Impostos')) {
            const idxAq = dadosFinanceiros.ajustes.findIndex(i => i.nome === 'Aq. de provedor');
            const novoItem = { nome:"Parcel. Impostos",jan:44979.14,fev:45327.44,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:90306.58 };
            if (idxAq >= 0) dadosFinanceiros.ajustes.splice(idxAq + 1, 0, novoItem);
            else dadosFinanceiros.ajustes.push(novoItem);
          }

          syncSetStatus(`✅ Dados carregados do Supabase (versão ${DADOS_VERSION})`, 'ok');
        } else {
          // Versão nova — salva versão atual, usa dados hardcoded
          await sbStorage.set('consolidado_versao', DADOS_VERSION);
          syncSetStatus('⚡ Dados atualizados. Faça upload do XLSX para sincronizar meses futuros.', 'info');
        }
      } catch(e) {
        console.warn('consolidadoInicializar erro:', e);
      }
    }