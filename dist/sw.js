const BASE_URL = self.registration.scope;
const CACHE_PREFIX = `sbb-finance-suite:${BASE_URL}:`;
const CACHE_NAME = `${CACHE_PREFIX}v26`;
const APP_SHELL = [
  "./", "./index.html", "./styles.css?v=26", "./redesign.css?v=26", "./app.mjs?v=26",
  "./logic.mjs", "./money-logic.mjs", "./export-logic.mjs", "./backup-logic.mjs",
  "./health-logic.mjs", "./digital-logic.mjs", "./suite-logic.mjs", "./catalog.mjs",
  "./manifest.webmanifest", "./sbb-logo.png", "./icon-192.png", "./icon-512.png",
  "./icon-maskable-192.png", "./icon-maskable-512.png", "./apple-touch-icon.png",
  "./business/index.html"
].map(file => new URL(file, BASE_URL).href);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

async function cached(request) {
  const cache = await caches.open(CACHE_NAME);
  return cache.match(request, { ignoreSearch: true });
}

async function networkFirst(request, fallbackURL) {
  let response;
  try {
    response = await fetch(request);
    if (response.ok) {
      try { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); } catch {}
      return response;
    }
  } catch {}
  const backup = await cached(request) || (fallbackURL ? await cached(fallbackURL) : null);
  return backup || response || new Response("Aplikasi belum tersedia offline. Buka kembali saat terhubung internet.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(BASE_URL)) return;
  if (request.mode === "navigate") {
    const businessURL = new URL("./business/index.html", BASE_URL).href;
    const isBusiness = url.pathname === new URL(businessURL).pathname || url.pathname === new URL("./business/", BASE_URL).pathname;
    event.respondWith(networkFirst(request, isBusiness ? businessURL : new URL("./index.html", BASE_URL).href));
    return;
  }
  if (["script", "style"].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cached(request).then(response => response || networkFirst(request)));
});
