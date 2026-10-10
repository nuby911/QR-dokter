// MediQR Service Worker - Offline Caching Engine
const CACHE_NAME = 'mediqr-cache-v1';

// Core Application Shell routes and assets for offline use
const PRECACHE_ASSETS = [
  '/',
  '/view',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Install Event: Precache Application Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache core assets gracefully (don't fail install if an individual asset fails)
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Precache failed for ${url}:`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent offline routing & caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET and non-HTTP(S) requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation Requests (Page Visits e.g. /doctor, /view, /pharmacy)
  // Strategy: Network-first with Cache fallback for offline mode
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // OFFLINE FALLBACK:
          // Try matching exact request or stripped path
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          // Match by pathname (e.g. /view?d=... or /doctor)
          const pathOnly = url.pathname;
          const cachedPath = await caches.match(pathOnly);
          if (cachedPath) return cachedPath;

          // Fallback to /view for prescription links, or / for others
          if (pathOnly.startsWith('/view')) {
            return (await caches.match('/view')) || caches.match('/');
          }
          if (pathOnly.startsWith('/doctor')) {
            return (await caches.match('/doctor')) || caches.match('/');
          }
          if (pathOnly.startsWith('/pharmacy')) {
            return (await caches.match('/pharmacy')) || caches.match('/');
          }

          return (await caches.match('/')) || Response.error();
        })
    );
    return;
  }

  // 2. Next.js Static Chunks, CSS, JS, Fonts & Icons
  // Strategy: Stale-While-Revalidate (Fast offline loading + background update)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Default: Network with Cache Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
