const CACHE = 'avrento-hub-v5';
const ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // Las páginas HTML (navegación) siempre se piden a la red primero,
  // para no quedarnos con una versión vieja que referencia archivos ya borrados.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('/')))
    );
    return;
  }

  // El resto de archivos (JS/CSS con hash, iconos) son inmutables por build,
  // así que cache-first es seguro y rápido.
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      });
    })
  );
});
