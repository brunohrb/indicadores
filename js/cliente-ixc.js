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
      html += '<div style="display:flex;flex-direction:column;gap:0.6rem">';
      for (const c of data.clientes) {
        const ativo = String(c.ativo).toUpperCase() === 'S';
        html += `
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:0.8rem 1rem;background:#fff">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
              <div>
                <div style="font-weight:700;color:#1e293b">${escapar(c.nome || '—')}</div>
                <div style="font-size:0.8rem;color:#64748b">ID ${escapar(c.id)} · ${escapar(c.cpf || '—')} · ${escapar(c.plano || 'sem plano')}</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:800;font-size:1.15rem;color:#0f3460">${brl(c.valor)}</div>
                <span style="font-size:0.72rem;padding:0.1rem 0.5rem;border-radius:20px;background:${ativo ? '#dcfce7' : '#fee2e2'};color:${ativo ? '#166534' : '#991b1b'}">${ativo ? 'Ativo' : 'Inativo/Cancelado'}</span>
              </div>
            </div>
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
