/* FrigoChef minimal service worker — app shell cache + network-first navigation */
const CACHE = "frigochef-shell-v1";
const PRECACHE = [
  "/",
  "/favicon.svg",
  "/__grok/manifest.webmanifest",
  "/__grok/icon-192.png",
  "/__grok/icon-512.png",
  "/__grok/icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API / server functions
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.includes("_server") ||
    url.pathname.includes("rpc")
  ) {
    return;
  }

  // Navigation: network first, fallback cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy).catch(() => undefined));
          return res;
        })
        .catch(() => caches.match("/") || caches.match(req)),
    );
    return;
  }

  // Static assets: cache first, then network
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/graphics/") ||
    url.pathname.startsWith("/__grok/") ||
    url.pathname === "/favicon.svg"
  ) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy).catch(() => undefined));
            return res;
          }),
      ),
    );
  }
});
