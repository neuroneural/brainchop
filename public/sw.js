// BrainChop Offline PWA Service Worker
//
// Strategies (matching modern-web-guidance `performance` rules):
//   - HTML navigations: NetworkFirst (latest deploy when online, cached shell offline)
//   - Immutable hashed Vite shell assets & default MRI (t1_crop.nii.gz): CacheFirst in `brainchop-shell-*`
//   - Model weights (.bin) & WASM/Emscripten fallback artifacts: CacheFirst in bounded
//     `brainchop-models-v1` cache (max 32 entries) so models survive shell updates
//   - Other same-origin static files: StaleWhileRevalidate
//   - Non-GET & cross-origin requests: bypassed (never cache POST/opaque responses)
//
// Preserves server COOP/COEP/CORP response headers on cached same-origin basic responses
// so cross-origin isolation survives offline reloads.

const BUILD_VERSION = '__BRAINCHOP_BUILD_VERSION__';
const SHELL_CACHE = `brainchop-shell-${BUILD_VERSION}`;
const MODELS_CACHE = 'brainchop-models-v1';
const MAX_MODEL_ENTRIES = 32;

const PRECACHE_URLS = /*__BRAINCHOP_PRECACHE_URLS__*/ [
  './',
  './index.html',
  './favicon.ico',
  './manifest.webmanifest',
  './t1_crop.nii.gz',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/brainchop-logo.png',
];

function isCacheableBasicResponse(response) {
  return Boolean(response && response.ok && response.status === 200 && response.type === 'basic');
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map(async (relUrl) => {
          const req = new Request(new URL(relUrl, self.registration.scope), { cache: 'reload' });
          const res = await fetch(req);
          if (isCacheableBasicResponse(res)) {
            await cache.put(req, res);
          }
        })
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('brainchop-shell-') && key !== SHELL_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

async function openCacheSafe(cacheName) {
  try {
    return await caches.open(cacheName);
  } catch {
    return null;
  }
}

async function networkFirstNavigation(request, relPath) {
  const cache = await openCacheSafe(SHELL_CACHE);
  const isV3 = relPath === 'v3' || relPath.startsWith('v3/');
  try {
    const response = await fetch(request);
    if (cache && isCacheableBasicResponse(response) && !isV3) {
      cache.put(new URL('./index.html', self.registration.scope), response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return (
      (cache && (await cache.match(request, { ignoreSearch: true, ignoreVary: true }))) ||
      (cache && !isV3 && (await cache.match(new URL('./index.html', self.registration.scope), { ignoreVary: true }))) ||
      (cache && !isV3 && (await cache.match(new URL('./', self.registration.scope), { ignoreVary: true }))) ||
      new Response('BrainChop is offline and not yet cached.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    );
  }
}

async function cacheFirst(request, cacheName, maxEntries = 0) {
  const cache = await openCacheSafe(cacheName);
  const cached = cache ? await cache.match(request, { ignoreVary: true }).catch(() => null) : null;
  if (cached) return cached;
  const response = await fetch(request);
  if (cache && isCacheableBasicResponse(response)) {
    await cache.put(request, response.clone()).catch(() => {});
    if (maxEntries > 0) {
      trimCache(cacheName, maxEntries).catch(() => {});
    }
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await openCacheSafe(cacheName);
  const cached = cache ? await cache.match(request, { ignoreVary: true }).catch(() => null) : null;
  const networkPromise = fetch(request)
    .then((response) => {
      if (cache && isCacheableBasicResponse(response)) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || new Response('', { status: 504 });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const scopePath = new URL(self.registration.scope).pathname;
  const relPath = url.pathname.startsWith(scopePath)
    ? url.pathname.slice(scopePath.length)
    : url.pathname.replace(/^\//, '');

  // Never intercept sw.js itself so browser SW update checks always hit the network.
  if (relPath === 'sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request, relPath));
    return;
  }

  // Model weights (.bin), WebAssembly binaries (.wasm), and lazy Emscripten/model assets
  // live in a bounded model cache so downloaded models survive app-shell deploys.
  if (
    relPath.endsWith('.bin') ||
    relPath.endsWith('.wasm') ||
    /^assets\/brainchop-(mindgrab|mindmap|mindsnap)/.test(relPath)
  ) {
    event.respondWith(cacheFirst(request, MODELS_CACHE, MAX_MODEL_ENTRIES));
    return;
  }

  // Immutable content-hashed Vite chunks and the precached default MRI volume.
  if (relPath.startsWith('assets/') || relPath === 't1_crop.nii.gz') {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // Remaining same-origin static files (icons, manifest, favicon).
  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});
