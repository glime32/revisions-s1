/* Hors ligne : une copie du site reste sur l'appareil.
   La page est demandée au réseau. Si elle n'est pas arrivée en entier au bout de 5 s (réseau lent, ou qui ne répond plus),
   on sert la copie gardée : jamais de page à moitié chargée ; la page neuve finit d'arriver en fond, pour l'ouverture suivante.
   Sans réseau, on sert la copie. Les autres fichiers viennent de la copie, mise à jour en arrière-plan.
   Quand la copie a été servie et que la page neuve, arrivée ensuite, est différente, la page affichée le sait (message « neuve ») :
   elle propose de recharger. */
const CACHE = "revisions-20261120-122939", PAGE = "revisions-page", DELAI = 5000;
const FICHIERS = ["manifest.webmanifest", "icone-192.png", "icone-512.png", "feuilles/feuille-a4-algo.pdf", "feuilles/feuille-a4-ocaml.pdf"];
const prevenir = (e, copie, neuve) => e.waitUntil(neuve.then(async rep => {
  if (!rep || !rep.ok) return;
  const a = copie.headers.get("etag"), b = rep.headers.get("etag");
  if (a && b ? a === b : await copie.text() === await rep.text()) return;
  const ici = e.resultingClientId && await self.clients.get(e.resultingClientId);
  (ici ? [ici] : await self.clients.matchAll({ type: "window" })).forEach(c => c.postMessage({ k: "neuve" }));
}).catch(() => {}));
const gardePage = async () => {
  const c = await caches.open(PAGE);
  if (await c.match("index.html")) return;
  const ancienne = await caches.match("index.html");
  if (ancienne) await c.put("index.html", ancienne); else await c.add("index.html");
};
self.addEventListener("install", e => { e.waitUntil(Promise.all([caches.open(CACHE).then(c => c.addAll(FICHIERS)), gardePage()])); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE && n !== PAGE).map(n => caches.delete(n))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") {
    const ici = new URL(r.url).pathname, base = new URL("./", location).pathname;
    if (ici !== base && ici !== base + "index.html") return;
    const page = caches.open(PAGE);
    const neuve = page.then(c => fetch(r).then(async rep => { if (rep && rep.ok) await c.put("index.html", rep.clone()); return rep; }));
    e.waitUntil(neuve.catch(() => {}));
    e.respondWith(page.then(c => c.match("index.html")).then(copie => !copie ? neuve : Promise.race([
      neuve.then(rep => rep && rep.ok ? rep : copie, () => copie),
      new Promise(ok => setTimeout(() => ok(copie), DELAI))]).then(rep => { if (rep === copie) prevenir(e, copie.clone(), neuve); return rep; })));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const enCache = await c.match(r, { ignoreSearch: true });
    const reseau = fetch(r).then(rep => { if (rep && rep.ok) c.put(r, rep.clone()); return rep; }).catch(() => enCache);
    return enCache || reseau;
  }));
});
