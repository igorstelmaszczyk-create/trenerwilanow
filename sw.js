/* sw.js – lekki cache “app shell” dla kolejnych wizyt */
const VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

/* Minimalny zestaw zasobów do natychmiastowego cache (install) */
const PRECACHE_URLS = [
  '/',                           // root (jeśli LP na /)
  '/trener-personalny-wilanow',  // ta podstrona (upewnij się co do ścieżki)
  '/umow-konsultacje',
  '/cennik',
  '/lib/IMG_4377-1-mf2g7usc.webp',
  '/lib/1-mf2gfur7.webp',
  '/lib/6-md6a1v5m.svg',
  '/lib/5-md69zcjz.svg',
  '/lib/7-md6ahbnn.svg',
  '/lib/10-md6dcaca.svg',
  '/lib/12-md6dhwga.svg',
  '/lib/13-md6dir7j.svg',
  '/lib/14-md6dsaon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Tylko GET + same-origin
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // Dokumenty HTML: network-first
  if (req.mode === 'navigate' || (req.destination === 'document')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(req) || await caches.match('/');
        return cached || new Response('Offline', {status: 503, statusText: 'Offline'});
      }
    })());
    return;
  }

  // Obrazy/SVG/CSS/JS: cache-first
  if (['image','script','style','font'].includes(req.destination) || /\.(svg|png|jpg|jpeg|webp|gif|css|js)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        return cached || Response.error();
      }
    })());
  }
});
