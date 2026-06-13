// ================================================================
// mobile-fix — melhorias de uso no celular (sem afetar desktop)
// Envolve tabelas num container rolável (.mobtbl) pra não estourar a tela.
// Roda só em telas <= 640px e reage a conteúdo carregado dinamicamente.
// ================================================================
(function () {
  function isMobile() { return window.innerWidth <= 640; }

  function wrapTables() {
    if (!isMobile()) return;
    document.querySelectorAll('table:not([data-mw])').forEach(function (t) {
      t.setAttribute('data-mw', '1');
      const pai = t.parentElement;
      if (pai && pai.classList.contains('mobtbl')) return;
      const box = document.createElement('div');
      box.className = 'mobtbl';
      pai.insertBefore(box, t);
      box.appendChild(t);
    });
  }

  let pendente = false;
  function agendar() {
    if (pendente) return;
    pendente = true;
    setTimeout(function () { pendente = false; wrapTables(); }, 300);
  }

  function iniciar() {
    wrapTables();
    const mo = new MutationObserver(agendar);
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
