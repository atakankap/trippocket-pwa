/**
 * TripPocket Service Worker
 * 
 * Handles offline functionality and caching strategies:
 * - Cache First: Static assets (HTML, CSS, JS, icons)
 * - Network First: API calls (with cache fallback)
 * - Stale While Revalidate: Dynamic content
 * 
 * Version: 1.0.0
 */

const CACHE_NAME = 'trippocket-v26';
const RUNTIME_CACHE = 'trippocket-runtime-v26';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/animations.css',
  '/css/components.css',
  '/css/views.css',
  '/css/profile.css',
  '/css/reviews.css',
  '/css/online.css',
  '/css/dark-mode.css',
  '/css/leaflet-custom.css',
  '/js/app.js',
  '/js/views/explore.js',
  '/js/views/map.js',
  '/js/views/saved.js',
  '/js/views/profile.js',
  '/js/data/offline-data.js',
  '/js/data/online-api.js',
  '/js/utils/db.js',
  '/js/utils/geolocation.js',
  '/js/utils/camera.js',
  '/js/utils/toast.js',
  '/js/utils/loading.js',
  '/js/utils/reviews.js',
  '/icons/logo.png'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Cache OpenStreetMap tiles for offline map
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(cacheMapTiles(request));
    return;
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ offline: true, error: 'No connection' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}
