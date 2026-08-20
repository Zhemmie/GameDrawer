const CACHE = 'gamedrawer-v5';
const ASSETS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' || (req.headers.get('accept')||'').includes('text/html');
  if (isDoc) {
    e.respondWith(
      fetch(req).then(resp => { caches.open(CACHE).then(c => c.put('./index.html', resp.clone())); return resp; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      if (resp.ok) caches.open(CACHE).then(c => c.put(req, resp.clone()));
      return resp;
    }))
  );
});
