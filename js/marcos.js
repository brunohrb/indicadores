    function abrirMarcos(context) {
      marcosContext = context;
      const modal = document.getElementById('marcosModal');
      modal.classList.add('open');
      const subtitles = {
        dashboard:    '💰 Analisando Dashboard',
        financeiro:   '💼 Analisando Comissão Financeiro',
        operacional:  '📈 Analisando Comissão Operacional'
      };
      document.getElementById('marcosPanelSubtitle').textContent = subtitles[context] || 'Análise em andamento';
      if(marcosHistory.length === 0) marcosAnalisarAba();
    }

    function fecharMarcos() {
      document.getElementById('marcosModal').classList.remove('open');
    }

    function marcosMontarContexto() {
      const df = dadosFinanceiros;
      const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const MESES_N = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const fc = v => 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
      const fp = v => (Number(v)*100).toFixed(2)+'%';

      if(marcosContext === 'dashboard') {
        const mesIdx = parseInt(document.getElementById('dashMesFiltro')?.value||'0');
        const mesKey = MESES[mesIdx];
        const mesNome = MESES_N[mesIdx];
        const receitas = df.receitas?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
        const custos   = df.custos?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
        const despesas = df.despesas?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
        const impostos = df.impostos?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
        const ebitdaItem = df.ebitda_ajustado?.find(r=>r.nome==='EBITDA (Ajustado)');
        const ebitda = ebitdaItem ? (ebitdaItem[mesKey]||0) : 0;
        const lines = ['=== DASHBOARD FINANCEIRO — '+mesNome+'/2026 ===',
          'Receitas: '+fc(receitas), 'Impostos: '+fc(impostos),
          'Custos: '+fc(custos), 'Despesas: '+fc(despesas),
          'EBITDA Ajustado: '+fc(ebitda)+' ('+fp(receitas>0?ebitda/receitas:0)+')',
          '', '--- RECEITAS DETALHADAS ---'];
        (df.receitas||[]).filter(r=>(r[mesKey]||0)>0).forEach(r=>lines.push(r.nome+': '+fc(r[mesKey])));
        lines.push('', '--- TOP 8 CUSTOS ---');
        [...(df.custos||[])].sort((a,b)=>(b[mesKey]||0)-(a[mesKey]||0)).slice(0,8).forEach(c=>lines.push(c.nome+': '+fc(c[mesKey]||0)));
        return lines.join('\n');
      }

      if(marcosContext === 'financeiro') {
        const mesIdx = parseInt(document.getElementById('comissaoMesFiltro')?.value||'0');
        const mesKey = MESES[mesIdx];
        const mesNome = MESES_N[mesIdx];
        const receitas = df.receitas?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
        const ebitdaItem = df.ebitda_ajustado?.find(r=>r.nome==='EBITDA (Ajustado)');
        const ebitda = ebitdaItem?(ebitdaItem[mesKey]||0):0;
        const lines = ['=== COMISSÃO FINANCEIRO — '+mesNome+'/2026 ===',
          'Faturamento Base: '+fc(receitas),
          'EBITDA Ajustado: '+fc(ebitda)+' (margem '+fp(receitas>0?ebitda/receitas:0)+')',
          '', '--- DADOS DE COMISSÃO ---'];
        // Collect visible comissão rows from DOM
        document.querySelectorAll('#comissaoFinanceiroView .comissao-row, #comissaoFinanceiroView [data-indicador]').forEach(el=>{
          lines.push(el.innerText?.replace(/\s+/g,' ').trim());
        });
        // fallback: get table text
        const tbl = document.querySelector('#comissaoFinanceiroView .comissao-matrix, #comissaoFinanceiroView table');
        if(tbl) lines.push('', '--- MATRIZ ---', tbl.innerText?.replace(/\t/g,' | ').trim());
        return lines.join('\n');
      }

      if(marcosContext === 'operacional') {
        const mesIdx = parseInt(document.getElementById('opMesFiltro')?.value||'0');
        const mesKey = MESES[mesIdx];
        const mesNome = MESES_N[mesIdx];
        const lines = ['=== COMISSÃO OPERACIONAL — '+mesNome+'/2026 ==='];
        const view = document.getElementById('comissaoOperacionalView');
        if(view) lines.push(view.innerText?.replace(/\s{3,}/g,'\n').trim().slice(0,3000));
        return lines.join('\n');
      }

      return 'Contexto não identificado.';
    }

    async function marcosAnalisarAba() {
      const apiKey = localStorage.getItem('openaiKey')||'';
      if(!apiKey || !apiKey.startsWith('sk-')) {
        marcosAddMsg('bot', 'Oi! Para eu funcionar, você precisa configurar sua **API Key do ChatGPT** na aba 🤖 Estratégico. É só colar lá e salvar!');
        return;
      }
      const ctx = marcosMontarContexto();
      const tabNames = {dashboard:'Dashboard Financeiro', financeiro:'Comissão Financeiro', operacional:'Comissão Operacional'};
      const prompts = {
        dashboard: 'Faça uma análise executiva completa do Dashboard Financeiro da TEXNET. Destaque: pontos fortes, pontos de atenção, a margem EBITDA vs benchmark ISP (25-35%), os maiores custos e 3 recomendações práticas. Seja direto e use markdown.',
        financeiro: 'Analise a Comissão Financeiro da TEXNET. Avalie cada indicador de comissão, quais metas foram atingidas ou não, qual o total da comissão calculada e o que poderia ser melhorado para aumentar o resultado. Use markdown com seções claras.',
        operacional: 'Analise a Comissão Operacional da TEXNET. Avalie os indicadores de OS, Churn, Retiradas e resultados. Identifique onde estão os pontos críticos, o que está bem e o que precisa de atenção. Dê recomendações operacionais concretas.'
      };
      const typing = marcosAddTyping();
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
          body: JSON.stringify({
            model:'gpt-4o', max_tokens:1500, temperature:0.7,
            messages:[
              {role:'system', content:'Você é Marcos, analista financeiro senior especialista em ISPs brasileiro. Responda sempre em português do Brasil com markdown formatado. Seja direto, cite os números reais e use emojis com moderação.'},
              {role:'user', content: prompts[marcosContext]+'\n\nDADOS DA ABA:\n'+ctx}
            ]
          })
        });
        typing.remove();
        if(!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.error?.message||'Erro '+res.status); }
        const data = await res.json();
        const texto = data.choices?.[0]?.message?.content||'Sem resposta.';
        marcosHistory.push({role:'assistant',content:texto});
        marcosAddMsg('bot', texto);
      } catch(e) {
        typing.remove();
        marcosAddMsg('bot', 'Erro ao consultar a API: '+e.message);
      }
    }

    async function marcosEnviar() {
      const input = document.getElementById('marcosInput');
      const pergunta = input.value.trim();
      if(!pergunta) return;
      input.value = '';
      const apiKey = localStorage.getItem('openaiKey')||'';
      if(!apiKey || !apiKey.startsWith('sk-')) {
        marcosAddMsg('bot', 'Configure sua API Key na aba 🤖 Estratégico primeiro!');
        return;
      }
      marcosAddMsg('user', pergunta);
      marcosHistory.push({role:'user', content:pergunta});
      const ctx = marcosMontarContexto();
      const typing = marcosAddTyping();
      try {
        const msgs = [
          {role:'system', content:'Você é Marcos, analista financeiro da TEXNET (ISP). Responda em português do Brasil com markdown. Os dados da aba atual:\n\n'+ctx},
          ...marcosHistory.slice(-6)
        ];
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
          body: JSON.stringify({model:'gpt-4o', max_tokens:800, temperature:0.7, messages:msgs})
        });
        typing.remove();
        if(!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.error?.message||'Erro '+res.status); }
        const data = await res.json();
        const texto = data.choices?.[0]?.message?.content||'Sem resposta.';
        marcosHistory.push({role:'assistant',content:texto});
        marcosAddMsg('bot', texto);
      } catch(e) {
        typing.remove();
        marcosAddMsg('bot', 'Erro: '+e.message);
      }
    }

    function marcosAddMsg(from, text) {
      const container = document.getElementById('marcosMsgs');
      const div = document.createElement('div');
      div.className = from==='bot' ? 'msg-marcos' : 'msg-user';
      div.innerHTML = from==='bot' ? iaMarkdown(text) : text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
      return div;
    }

    function marcosAddTyping() {
      const container = document.getElementById('marcosMsgs');
      const div = document.createElement('div');
      div.className = 'msg-typing';
      div.innerHTML = '<div class="dot-typing" style="animation-delay:0s"></div><div class="dot-typing" style="animation-delay:0.2s"></div><div class="dot-typing" style="animation-delay:0.4s"></div>';
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
      return div;
    }


    function toggleSidebar() {
      const sb = document.querySelector('.sidebar');
      const ov = document.getElementById('sidebarOverlay');
      const btn = document.getElementById('menuToggle');
      sb.classList.toggle('open');
      ov.classList.toggle('open');
      btn.textContent = sb.classList.contains('open') ? '✕' : '☰';
    }
    // Close sidebar when nav item clicked on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if(window.innerWidth <= 768) {
          const sb = document.querySelector('.sidebar');
          if(sb.classList.contains('open')) toggleSidebar();
        }
      });
    });

