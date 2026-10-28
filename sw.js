/* Static files only: customer demo state stays in browser storage. */
const CACHE = "flower-paradise-b9cae0301926";
const CORE = ["/FlowerParadise/index.html","/FlowerParadise/offline.html","/FlowerParadise/manifest.webmanifest","/FlowerParadise/favicon.svg","/FlowerParadise/icons/icon-192.png","/FlowerParadise/icons/icon-512.png","/FlowerParadise/seasonal/christmas-hero.webp","/FlowerParadise/seasonal/christmas-hero-small.webp","/FlowerParadise/fonts/font-0.woff","/FlowerParadise/fonts/font-1.woff","/FlowerParadise/fonts/font-2.woff","/FlowerParadise/fonts/font-3.woff","/FlowerParadise/fonts/font-4.woff","/FlowerParadise/fonts/font-5.woff","/FlowerParadise/fonts/font-6.woff","/FlowerParadise/fonts/font-7.woff","/FlowerParadise/fonts/font-8.woff","/FlowerParadise/assets/Dashboard-DtoL9aba.js","/FlowerParadise/assets/Discovery-C1CvtfWk.js","/FlowerParadise/assets/Experiences-Dkvglu9O.js","/FlowerParadise/assets/Info-Ced_ny8t.js","/FlowerParadise/assets/Personal-BG6EE__m.js","/FlowerParadise/assets/SeasonalCommerce-mvYkZ06G.js","/FlowerParadise/assets/Shop-Dqk8yyWq.js","/FlowerParadise/assets/Vending-DDXol8J_.js","/FlowerParadise/assets/calendar-days-DnDAvZ_V.js","/FlowerParadise/assets/copy-B1ADEm75.js","/FlowerParadise/assets/index-fi-BLGG4.js","/FlowerParadise/assets/index-te86gxky.css","/FlowerParadise/assets/motion-vendor-COgz9NTN.js","/FlowerParadise/assets/react-vendor-C6cynBEI.js","/FlowerParadise/assets/sliders-horizontal-DizsnEQ8.js"];
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
