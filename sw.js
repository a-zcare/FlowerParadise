/* Static files only: customer demo state stays in browser storage. */
const CACHE = "flower-paradise-ce382d8fd9fd";
const CORE = ["/FlowerParadise/index.html","/FlowerParadise/offline.html","/FlowerParadise/manifest.webmanifest","/FlowerParadise/favicon.svg","/FlowerParadise/icons/icon-192.png","/FlowerParadise/icons/icon-512.png","/FlowerParadise/fonts/font-0.woff","/FlowerParadise/fonts/font-1.woff","/FlowerParadise/fonts/font-2.woff","/FlowerParadise/fonts/font-3.woff","/FlowerParadise/fonts/font-4.woff","/FlowerParadise/fonts/font-5.woff","/FlowerParadise/fonts/font-6.woff","/FlowerParadise/fonts/font-7.woff","/FlowerParadise/fonts/font-8.woff","/FlowerParadise/assets/Dashboard-DbjYxuVY.js","/FlowerParadise/assets/Discovery-IXrGj47z.js","/FlowerParadise/assets/Experiences-DPKITldx.js","/FlowerParadise/assets/Info-DdvwMWrq.js","/FlowerParadise/assets/Personal-CRfvVn7p.js","/FlowerParadise/assets/Shop-CG4VjU-H.js","/FlowerParadise/assets/Vending-CYVrueTJ.js","/FlowerParadise/assets/calendar-days-DRcJxmLs.js","/FlowerParadise/assets/copy-Db8sLdhz.js","/FlowerParadise/assets/index-CxeABUh2.css","/FlowerParadise/assets/index-DDtRQODt.js","/FlowerParadise/assets/sliders-horizontal-BbbzMPHI.js"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("flower-paradise-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(
      self.registration.scope.replace(self.location.origin, ""),
    )
  )
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(
        async () =>
          (await caches.match(
            new URL("./index.html", self.registration.scope).href,
          )) ||
          (await caches.match(
            new URL("./offline.html", self.registration.scope).href,
          )),
      ),
    );
    return;
  }
  if (!/\.(js|css|webp|png|svg|woff2?|webmanifest)$/.test(url.pathname)) return;
  event.respondWith(
    caches.match(event.request, { ignoreVary: true }).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
          }
          return response;
        }),
    ),
  );
});
