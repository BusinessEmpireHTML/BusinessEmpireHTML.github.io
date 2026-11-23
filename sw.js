/* ============================================================
   BUSINESS EMPIRE — sw.js (service worker)
   Network first, cache as fallback: when online you always get the
   latest version of the game, and every file fetched is saved so the
   game still opens with no connection.
   ============================================================ */

const CACHE_NAME = 'business-empire-v1';

// Pre-cached on install so the very first offline launch works.
const APP_SHELL = [
  './',
  'index.html',
  'styles.css',
  'settings.js',
  'main.js',
  'bank.js',
  'business.js',
  'properties.js',
  'trophies.js',
  'markets.js',
  'merger.js',
  'planets.js',
  'research.js',
  'golden.js',
  'achievements.js',
  'save.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'images/Bank.jpg',
  'images/CarDealership.jpg',
  'images/CarWash.jpg',
  'images/ChainOfRestaurants.jpg',
  'images/Factory.jpg',
  'images/LawFirm.jpg',
  'images/LegalClinic.jpg',
  'images/LemonadeFactory.jpg',
  'images/LemonadeStand.jpg',
  'images/LocalShop.jpg',
  'images/Restaurant.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Cache files one by one so a single missing file can't break install.
      Promise.all(APP_SHELL.map(url => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // Save a copy of anything that loaded (including Google Fonts).
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('index.html');
          return Response.error();
        })
      )
  );
});
