// ================================================================
// Consulta de Cliente (IXC) — busca na lista sincronizada do Supabase
// Lê via Edge Function buscar-cliente (sem IA, grátis). Mostra valor mensal.
// ================================================================
(function () {
  const URL_FN = SB_URL + '/functions/v1/buscar-cliente';

  function el(id) { return document.getElementById(id); }

  function abrirClienteIxcView(navEl) {
    if (typeof selectMenu === 'function') selectMenu(navEl, 'cliente-ixc');
    clienteIxcStatusSync();
    setTimeout(() => el('cliIxcInput')?.focus(), 100);
  }

  function brl(v) {
    if (v === null || v === undefined || v === '') return '—';
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  async function clienteIxcStatusSync() {
    const box = el('cliIxcSync');
    if (!box) return;
    try {
      const r = await sb.from('app_storage').select('value').eq('key', 'ixc_clientes_sync').maybeSingle();
      const v = r?.data?.value ? (typeof r.data.value === 'string' ? JSON.parse(r.data.value) : r.data.value) : null;
      if (v && v.timestamp) {
        const d = new Date(v.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        box.innerHTML = `🟢 Última sincronização: <b>${d}</b> · ${v.total || '?'} clientes`;
      } else {
        box.innerHTML = '⚪ Ainda não sincronizado. Rode o <b>SINCRONIZAR-CLIENTES</b> no PC do escritório.';
      }
    } catch (e) { box.textContent = ''; }
  }

  async function clienteIxcBuscar() {
    const termo = (el('cliIxcInput')?.value || '').trim();
    const res = el('cliIxcResultado');
    if (!termo) { res.innerHTML = '<p style="color:#94a3b8">Digite um nome, CPF ou ID.</p>'; return; }
    res.innerHTML = '<p style="color:#64748b">🔎 Buscando…</p>';
    try {
      const r = await fetch(URL_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SB_KEY, 'apikey': SB_KEY },
        body: JSON.stringify({ busca: termo }),
      });
      const data = await r.json();
      if (data.erro) { res.innerHTML = `<p style="color:#b91c1c">${escapar(data.erro)}</p>`; return; }
      if (!data.encontrado || !data.clientes.length) {
        res.innerHTML = `<p style="color:#b91c1c">Nenhum cliente encontrado para "${escapar(termo)}".</p>`;
        return;
      }
      let html = `<p style="color:#64748b;font-size:0.85rem;margin-bottom:0.75rem">${data.total} resultado(s)${data.total > 30 ? ' (mostrando 30)' : ''}</p>`;
      html += '<div style="display:flex;flex-direction:column;gap:0.8rem">';
      for (const c of data.clientes) {
        const ativo = String(c.ativo).toUpperCase() === 'S';
        const contratos = Array.isArray(c.contratos) ? c.contratos : [];
        let pontosHtml = '';
        if (contratos.length) {
          pontosHtml = '<div style="margin-top:0.6rem;display:flex;flex-direction:column;gap:0.35rem">';
          for (const ct of contratos) {
            const ctAtivo = String(ct.status).toUpperCase() === 'A';
            pontosHtml += `
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;padding:0.45rem 0.7rem;background:#f8fafc;border-radius:8px;font-size:0.83rem">
                <span style="color:#334155">📍 ${escapar(ct.plano || 'sem plano')} <span style="color:#94a3b8">#${escapar(ct.id)}</span></span>
                <span style="display:flex;align-items:center;gap:0.5rem">
                  <span style="font-size:0.65rem;padding:0.05rem 0.4rem;border-radius:20px;background:${ctAtivo ? '#dcfce7' : '#fee2e2'};color:${ctAtivo ? '#166534' : '#991b1b'}">${ctAtivo ? 'ativo' : ct.status}</span>
                  <b style="color:#0f3460">${brl(ct.valor)}</b>
                </span>
              </div>`;
          }
          pontosHtml += '</div>';
        } else {
          pontosHtml = '<div style="margin-top:0.5rem;font-size:0.8rem;color:#94a3b8">Sem contratos cadastrados.</div>';
        }
        html += `
          <div style="border:1px solid #e2e8f0;border-radius:12px;padding:0.9rem 1.1rem;background:#fff">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap">
              <div>
                <div style="font-weight:700;color:#1e293b">${escapar(c.nome || '—')}</div>
                <div style="font-size:0.78rem;color:#64748b">ID ${escapar(c.id)} · ${escapar(c.cpf || '—')} · ${contratos.length} ponto(s)</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:0.68rem;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Total mensal</div>
                <div style="font-weight:800;font-size:1.2rem;color:#0f3460">${brl(c.total_mensal)}</div>
                <span style="font-size:0.7rem;padding:0.1rem 0.5rem;border-radius:20px;background:${ativo ? '#dcfce7' : '#fee2e2'};color:${ativo ? '#166534' : '#991b1b'}">${ativo ? 'Cliente ativo' : 'Inativo/Cancelado'}</span>
              </div>
            </div>
            ${pontosHtml}
          </div>`;
      }
      html += '</div>';
      res.innerHTML = html;
    } catch (e) {
      res.innerHTML = `<p style="color:#b91c1c">Erro: ${escapar(e.message || String(e))}</p>`;
    }
  }

  function escapar(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  window.abrirClienteIxcView = abrirClienteIxcView;
  window.clienteIxcBuscar = clienteIxcBuscar;
  window.clienteIxcStatusSync = clienteIxcStatusSync;
})();
