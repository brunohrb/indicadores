// Service Worker — TEXNET Indicadores PWA
// Estratégia: index.html SEMPRE vai pra rede (nunca cacheado).
// Restante (assets) é network-first, cache como fallback offline.
const CACHE = 'texnet-v6';
const SHELL = [
  './logotexnet.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // só same-origin

  // consulta-cliente.html é página standalone (PWA própria) — SW principal
  // não intercepta. Evita fallback acidental pro login do dashboard.
  if (url.pathname.endsWith('/consulta-cliente.html') ||
      url.pathname.endsWith('/consulta-cliente.webmanifest')) {
    return; // deixa o browser cuidar direto
  }

  // index.html e raiz: SEMPRE rede, nunca cache (evita app travado em versão velha)
  const isHtml = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || req.mode === 'navigate';
  if (isHtml) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((r) => r || caches.match('./index.html'))
      )
  );
});
