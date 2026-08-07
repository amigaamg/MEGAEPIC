const CACHE_NAME = 'amexan-cache-v1';
const DYNAMIC_CACHE = 'amexan-dynamic-v1';
const STATIC_ASSETS = ['/', '/hmis', '/offline.html'];
const API_CACHE_STRATEGIES = {
  '/api/fhir': 'networkFirst',
  '/api/hl7': 'networkOnly',
  '/_next/static': 'cacheFirst',
  '/static': 'cacheFirst',
  '/icons': 'cacheFirst',
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function getStrategy(url) {
  for (const [prefix, strategy] of Object.entries(API_CACHE_STRATEGIES)) {
    if (url.includes(prefix)) return strategy;
  }
  if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/))
    return 'cacheFirst';
  if (url.match(/^https?:\/\/[^/]+\/(_next\/static|static)\//))
    return 'cacheFirst';
  return 'networkFirst';
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const strategy = getStrategy(request.url);
  if (strategy === 'cacheFirst') event.respondWith(cacheFirst(request));
  else if (strategy === 'networkFirst') event.respondWith(networkFirst(request));
  else if (strategy === 'staleWhileRevalidate')
    event.respondWith(staleWhileRevalidate(request));
});

async function cachePut(cache, request, response) {
  try {
    if (!response || !response.ok) return;
    if (request.method !== 'GET') return;
    if (!response.type || response.type === 'opaque' || response.type === 'opaqueredirect') return;
    if (response.redirected) return;
    if (request.mode === 'navigate') return;
    // Only cache same-origin resources reliably; never throw on failure.
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    await cache.put(request, response.clone());
  } catch (e) {
    // Swallow — a failed cache write must never break the request.
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cachePut(cache, request, response);
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cachePut(cache, request, response);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    return new Response(
      JSON.stringify({
        error: 'offline',
        message:
          'You are offline. Data will sync when connection is restored.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) await cachePut(cache, request, response);
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(event.data.urls))
    );
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
