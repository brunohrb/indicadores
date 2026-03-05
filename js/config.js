    // ==================== SUPABASE CONFIG ====================
    const SB_URL  = 'https://rgdagcvpgdlefmiywurz.supabase.co';
    const SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGFnY3ZwZ2RsZWZtaXl3dXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5Mzk3MjUsImV4cCI6MjA4NzUxNTcyNX0.IT0nPkVhOODgFYLqnAwVjdtP_2PTeBPq0Aj0yB7jpKQ';
    const sb = supabase.createClient(SB_URL, SB_KEY);

    // Log visual no canto da tela para debug
    function sbLog(msg, tipo='info') {
      const colors = { ok:'#059669', erro:'#dc2626', info:'#2563eb', warn:'#d97706' };
      const div = document.createElement('div');
      div.style.cssText = `position:fixed;bottom:${10 + document.querySelectorAll('.sb-log').length*42}px;right:10px;background:white;border-left:4px solid ${colors[tipo]};padding:6px 12px;border-radius:6px;font-size:0.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:99999;max-width:320px;word-break:break-all`;
      div.className = 'sb-log';
      div.textContent = `[Supabase] ${msg}`;
      document.body.appendChild(div);
      setTimeout(() => { div.remove(); document.querySelectorAll('.sb-log').forEach((el,i)=>el.style.bottom=(10+i*42)+'px'); }, 6000);
    }

    // Wrapper key→value sobre a tabela app_storage
    const sbStorage = {
      async get(key) {
        try {
          const { data, error } = await sb.from('app_storage').select('value').eq('key', key).maybeSingle();
          if (error) { sbLog(`GET "${key}" erro: ${error.message}`, 'erro'); throw error; }
          return data ? data.value : null;
        } catch(e) {
          sbLog(`GET "${key}" falhou: ${e.message}`, 'erro');
          return localStorage.getItem(key);
        }
      },
      async set(key, value) {
        try {
          const { error } = await sb.from('app_storage').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
          if (error) { sbLog(`SET "${key}" erro: ${error.message}`, 'erro'); throw error; }
          sbLog(`SET "${key}" ✓`, 'ok');
        } catch(e) {
          sbLog(`SET "${key}" falhou: ${e.message} — usando localStorage`, 'warn');
          localStorage.setItem(key, value);
        }
      },
      async remove(key) {
        try {
          const { error } = await sb.from('app_storage').delete().eq('key', key);
          if (error) { sbLog(`DEL "${key}" erro: ${error.message}`, 'erro'); throw error; }
        } catch(e) {
          sbLog(`DEL "${key}" falhou: ${e.message}`, 'warn');
          localStorage.removeItem(key);
        }
      },
      // Testa a conexão e estrutura da tabela
      async testar() {
        sbLog('Testando conexão...', 'info');
        try {
          const { data, error } = await sb.from('app_storage').select('key').limit(1);
          if (error) { sbLog(`Tabela não acessível: ${error.message}`, 'erro'); return false; }
          sbLog('Conexão OK! Tabela app_storage acessível ✓', 'ok');
          return true;
        } catch(e) { sbLog(`Falha de conexão: ${e.message}`, 'erro'); return false; }
      }
    };

    // Testa automaticamente ao carregar
    window.addEventListener('load', () => sbStorage.testar());
    // =========================================================

    let consolidadoMesSelecionado = '01';
    let anoSelecionadoComparativo = 2026;
    let diretoriaDadosExtraidos = null;

