// ================================================================
// Coach IA — chat conversacional com Claude (streaming + tools)
// Conversa com a Edge Function coach-ia, que busca dados reais no
// Supabase e responde via Claude. Estilo WHOOP Coach.
// ================================================================
(function () {
  const COACH_URL = SB_URL + '/functions/v1/coach-ia';
  let coachHistory = [];   // [{role:'user'|'assistant', content:'texto'}]
  let coachEnviando = false;

  function el(id) { return document.getElementById(id); }

  function abrirCoachView(navEl) {
    if (typeof selectMenu === 'function') selectMenu(navEl, 'coach-ia');
    if (coachHistory.length === 0) coachBoasVindas();
    setTimeout(() => el('coachInput')?.focus(), 100);
  }

  function coachBoasVindas() {
    coachAddMsg('bot',
      'Olá! Sou o **Coach IA** da TEXNET. 🧠\n\n' +
      'Posso analisar seus números reais — faturamento, base de clientes, cancelamentos, comissões, IXC. ' +
      'Pergunte naturalmente, por exemplo:\n\n' +
      '• *Como foi o faturamento de maio?*\n' +
      '• *O churn está controlado?*\n' +
      '• *Compare os novos clientes de abril e maio*\n' +
      '• *Qual o maior custo do mês?*'
    );
  }

  function coachLimpar() {
    coachHistory = [];
    const c = el('coachMsgs');
    if (c) c.innerHTML = '';
    coachBoasVindas();
  }

  function coachAddMsg(from, text) {
    const container = el('coachMsgs');
    if (!container) return null;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;margin-bottom:0.85rem;' + (from === 'user' ? 'justify-content:flex-end' : 'justify-content:flex-start');
    const bubble = document.createElement('div');
    bubble.style.cssText = 'max-width:80%;padding:0.7rem 1rem;border-radius:14px;font-size:0.9rem;line-height:1.55;' +
      (from === 'user'
        ? 'background:linear-gradient(135deg,#1a1a2e,#0f3460);color:white;border-bottom-right-radius:4px'
        : 'background:#f1f5f9;color:#1e293b;border-bottom-left-radius:4px');
    if (from === 'bot') {
      bubble.innerHTML = (typeof iaMarkdown === 'function') ? iaMarkdown(text) : escaparHtml(text);
    } else {
      bubble.textContent = text;
    }
    wrap.appendChild(bubble);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  function escaparHtml(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function coachStatus(txt) {
    const s = el('coachStatus');
    if (s) s.textContent = txt || '';
  }

  async function coachEnviar() {
    if (coachEnviando) return;
    const input = el('coachInput');
    const pergunta = (input?.value || '').trim();
    if (!pergunta) return;
    input.value = '';
    coachEnviando = true;
    el('coachSendBtn')?.setAttribute('disabled', 'true');

    coachAddMsg('user', pergunta);
    coachHistory.push({ role: 'user', content: pergunta });

    const bubble = coachAddMsg('bot', '');
    bubble.innerHTML = '<span style="opacity:0.5">…</span>';
    let acumulado = '';
    let statusCode = 0;
    coachStatus('Coach pensando…');

    try {
      const res = await fetch(COACH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SB_KEY,
          'apikey': SB_KEY,
        },
        body: JSON.stringify({ messages: coachHistory.slice(-10) }),
      });
      statusCode = res.status;

      if (!res.ok || !res.body) {
        const raw = await res.text().catch(() => '');
        throw new Error(mensagemErro(res.status, raw));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const partes = buf.split('\n\n');
        buf = partes.pop() || '';
        for (const bloco of partes) {
          const linha = bloco.split('\n').find(l => l.startsWith('data:'));
          if (!linha) continue;
          const json = linha.slice(5).trim();
          if (!json) continue;
          let ev;
          try { ev = JSON.parse(json); } catch { continue; }

          if (ev.type === 'text') {
            acumulado += ev.text;
            bubble.innerHTML = (typeof iaMarkdown === 'function') ? iaMarkdown(acumulado) : escaparHtml(acumulado);
            el('coachMsgs').scrollTop = el('coachMsgs').scrollHeight;
          } else if (ev.type === 'tool') {
            coachStatus('🔎 Consultando: ' + nomeTool(ev.name));
          } else if (ev.type === 'error') {
            throw new Error(mensagemErro(200, String(ev.error || '')));
          } else if (ev.type === 'done') {
            coachStatus('');
          }
        }
      }

      if (!acumulado) {
        bubble.innerHTML = '<span style="color:#94a3b8">Sem resposta.</span>';
      } else {
        coachHistory.push({ role: 'assistant', content: acumulado });
      }
    } catch (e) {
      const msg = statusCode === 0 ? '📡 Sem conexão com o servidor. Verifique sua internet e tente de novo.' : (e.message || String(e));
      bubble.innerHTML =
        '<div style="background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:10px;padding:0.7rem 0.9rem;font-size:0.88rem">' +
        escaparHtml(msg) + '</div>';
    } finally {
      coachStatus('');
      coachEnviando = false;
      el('coachSendBtn')?.removeAttribute('disabled');
      input?.focus();
    }
  }

  function mensagemErro(status, raw) {
    const txt = String(raw || '');
    if (status === 404 || /NOT_FOUND|was not found/i.test(txt)) {
      return '⚠️ O Coach IA ainda não foi ativado no servidor. Falta publicar a função "coach-ia" no Supabase.';
    }
    if (status === 401 || status === 403) {
      return '🔒 Sem autorização pra falar com o Coach. Confira a configuração de acesso do Supabase.';
    }
    if (/ANTHROPIC_API_KEY|api[_ ]?key/i.test(txt)) {
      return '🔑 Falta configurar a chave da IA (ANTHROPIC_API_KEY) no Supabase.';
    }
    if (status >= 500) {
      return '🛠️ O servidor do Coach teve um erro. Tente de novo em instantes.';
    }
    return '⚠️ Não consegui falar com o Coach agora. Tente novamente em instantes.';
  }

  function nomeTool(name) {
    const m = {
      listar_dados_disponiveis: 'dados disponíveis',
      get_indicadores_mes: 'indicadores Power BI',
      get_financeiro_mes: 'resultado financeiro',
      get_ixc: 'dados do IXC',
      get_pagamento_cliente: 'cliente no IXC',
    };
    return m[name] || name;
  }

  // expõe global
  window.abrirCoachView = abrirCoachView;
  window.coachEnviar = coachEnviar;
  window.coachLimpar = coachLimpar;
})();
