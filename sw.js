// TabNews Service Worker v1.0
// Minimal — satisfies Chrome PWA installability requirement
// Network-first strategy, caches app shell only

var CACHE = 'tabnews-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then(function(keys) {
        return Promise.all(
          keys.filter(function(k) { return k !== CACHE; })
              .map(function(k) { return caches.delete(k); })
        );
      })
    ])
  );
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  if(url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        if(res.ok && (url.pathname === '/' || url.pathname === '/index.html')) {
          var clone = res.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return res;
      })
      .catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || (e.request.mode === 'navigate' ? caches.match('/') : undefined);
        });
      })
  );
});
