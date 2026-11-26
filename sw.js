const CACHE = 'google-cloud-master-v2';
const ASSETS = ['./', './index.html', './data.js', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './icon-1024.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  /* HTML・data.js はネットワーク優先（更新が端末に届かないキャッシュ固定を防ぐ）。失敗時だけキャッシュでオフライン継続 */
  const isDoc = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/data.js');
  if (isDoc) {
    e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match('./index.html'))));
});
