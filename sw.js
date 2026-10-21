// Service worker: lets the installed app open offline and start fast.
// The page itself is fetched network-first so updates show up right away;
// pictures and icons come from the cache. Google sign-in and Calendar calls are never cached.
const CACHE = 'tozzi-v5';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'img/hop.png', 'img/quarter.png', 'img/banner.png', 'img/sleep.png', 'img/cry.png', 'img/neko/neko.png',
  'img/ui/icon-sound-on.svg', 'img/ui/icon-sound-off.svg',
  'img/app/icon-192.png', 'img/app/icon-512.png', 'img/app/apple-touch-icon.png', 'img/app/favicon-32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // Google, YouTube, fonts: straight to the network
  if (e.request.mode === 'navigate'){
    // page: try the network, fall back to the cached copy when offline
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
