/* Hors ligne : une copie du site reste sur l'appareil.
   La page elle-même est toujours demandée au réseau d'abord : chaque mise à jour apparaît tout de suite ;
   sans réseau, on sert la copie. Les autres fichiers viennent de la copie, mise à jour en arrière-plan. */
const CACHE = "revisions-20261108-120955";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png", "feuilles/feuille-a4-algo.pdf", "feuilles/feuille-a4-ocaml.pdf"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(rep => { const copie = rep.clone(); caches.open(CACHE).then(c => c.put("index.html", copie)); return rep; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const enCache = await c.match(r, { ignoreSearch: true });
    const reseau = fetch(r).then(rep => { if (rep && rep.ok) c.put(r, rep.clone()); return rep; }).catch(() => enCache);
    return enCache || reseau;
  }));
});
