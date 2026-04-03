/**
 * BrajYatra Service Worker
 * Provides offline support and static asset caching.
 */

const CACHE_NAME = 'brajyatra-v1';
const OFFLINE_URL = '/offline.html';

// Assets to precache (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests (always network)
  if (url.pathname.startsWith('/api/')) return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    // Try network first
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.ok && (
          url.pathname.endsWith('.js') ||
          url.pathname.endsWith('.css') ||
          url.pathname.endsWith('.woff2') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.jpg') ||
          url.pathname.endsWith('.jpeg') ||
          url.pathname.endsWith('.webp') ||
          url.pathname.endsWith('.avif') ||
          url.pathname.endsWith('.svg')
        )) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;

          // For navigation requests, show offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }

          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
