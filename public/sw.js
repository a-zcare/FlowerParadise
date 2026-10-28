/* Static files only: customer demo state stays in browser storage. */
const CACHE = 'flower-paradise-__BUILD_VERSION__';
const CORE = __PRECACHE__;
self.addEventListener('install', event => {event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));});
self.addEventListener('activate', event => {event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('flower-paradise-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(self.registration.scope.replace(self.location.origin,'')))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(async()=>await caches.match(new URL('./index.html',self.registration.scope).href)||await caches.match(new URL('./offline.html',self.registration.scope).href)));return;}
if(!/\.(js|css|webp|png|svg|woff2?|webmanifest)$/.test(url.pathname))return;
event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return response;})));
});
