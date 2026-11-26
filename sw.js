/* Hors ligne : une copie du site reste sur l'appareil.
   La page est demandée au réseau. Si elle n'est pas arrivée en entier au bout de 5 s (réseau lent, ou qui ne répond plus),
   on sert la copie gardée : jamais de page à moitié chargée ; la page neuve finit d'arriver en fond, pour l'ouverture suivante.
   Sans réseau, on sert la copie. Les autres fichiers viennent de la copie, mise à jour en arrière-plan.
   Quand la copie a été servie et que la page neuve, arrivée ensuite, est différente, la page affichée le sait (message « neuve ») :
   elle propose de recharger.
   Les scripts et la feuille de style (r/…) ont un nom qui change avec leur contenu : ils sont gardés à l'installation, servis
   depuis la copie sans passer par le réseau, et seuls ceux d'une version neuve sont téléchargés. */
const CACHE = "revisions-20261126-174123", PAGE = "revisions-page", DELAI = 5000;
const FICHIERS = ["manifest.webmanifest", "icone-192.png", "icone-512.png", "feuilles/feuille-a4-algo.pdf", "feuilles/feuille-a4-ocaml.pdf", "r/style.7d2779d018.css", "r/geo.fcd10db6b6.js", "r/outils.c299d4f6f6.js", "r/geo-c1.22b0f9c5ff.js", "r/geo-c2.705d0324c4.js", "r/geo-c3.53394caef9.js", "r/geo-entrainement.25e1fb3844.js", "r/geo-c5.41a2d3ef59.js", "r/geo-couleurs.2c0627ca1d.js", "r/matiere-geo.6a8d3acf42.js", "r/matiere-algo.ff3066fab9.js", "r/matiere-pf.b7b7b7e361.js", "r/matiere-calc.881c738522.js", "r/matiere-lin.5f485c6627.js", "r/matiere-ana.050c4f57b4.js", "r/matiere-rai.9d0ac2a7cc.js", "r/matiere-usi.5abf3bb5ec.js", "r/matiere-aut.5c1f831cee.js", "r/exos-cc2-api.436ee56172.js", "r/lecons-geo.f0650be2ec.js", "r/lecons-algo.98a98c0622.js", "r/lecons-pf.0e53878626.js", "r/lecons-calc.a4f0ef6024.js", "r/lecons-lin.504406509d.js", "r/lecons-ana.044275a2c2.js", "r/lecons-rai.9b95948355.js", "r/lecons-usi.4cd8f28195.js", "r/lecons-clair.4f7e6b8177.js", "r/lecons-debutant.b779e9025e.js", "r/lexique.de1aa1cfc8.js", "r/generateurs.80f6b815b3.js", "r/gen-lin.ba657bb8c2.js", "r/gen-ana.a77e45c7de.js", "r/gen-algo.14ea2d896d.js", "r/gen-rai.fbe0b3b491.js", "r/gen-geo.bfb7ad8e4a.js", "r/gen-calc.37584c8268.js", "r/gen-pf.969655262c.js", "r/gen-usi.5e3be3a01b.js", "r/gen-aut.7245637439.js", "r/lecons-aut.65b6278ed0.js", "r/apprendre.fbc966ba5b.js", "r/entrainement.34f0972256.js", "r/express-ana.3714cbcde0.js", "r/express-algo.6bc6f4a4b5.js", "r/express-rai.ab9e3c577d.js", "r/express-geo.b19fdee724.js", "r/express-calc.242d696979.js", "r/express-pf.99c6bf68c7.js", "r/express-usi.531ae9b488.js", "r/express-lin.945a21c623.js", "r/express-aut.c7404666e4.js", "r/express-cc2-api.2b8be61cd3.js", "r/express.7842668179.js", "r/app.b45bb7183d.js"];
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
/* la copie de la page doit aller avec les fichiers gardés : à l'installation, on garde la page de cette version */
const pageDeLaVersion = async () => { const rep = await fetch("index.html", { cache: "reload" }); if (rep.ok) await (await caches.open(PAGE)).put("index.html", rep); };
self.addEventListener("install", e => { e.waitUntil(Promise.all([caches.open(CACHE).then(c => c.addAll(FICHIERS)), gardePage()]).then(() => pageDeLaVersion().catch(() => {}))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE && n !== PAGE).map(n => caches.delete(n))))); self.clients.claim(); });
/* une page neuve n'est gardée hors ligne que si tous ses fichiers r/… sont déjà dans la copie */
const versionOk = async rep => { const t = await rep.text(), L = [...t.matchAll(/(?:src|href)="(r\/[^"]+)"/g)].map(m => m[1]), c = await caches.open(CACHE);
  for (const f of L) if (!await c.match(f)) return false; return true; };
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") {
    const ici = new URL(r.url).pathname, base = new URL("./", location).pathname;
    if (ici !== base && ici !== base + "index.html") return;
    const page = caches.open(PAGE);
    const neuve = page.then(c => fetch(r).then(async rep => { if (rep && rep.ok && await versionOk(rep.clone())) await c.put("index.html", rep.clone()); return rep; }));
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
