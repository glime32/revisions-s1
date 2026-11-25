/* Générateurs d'Automates (HAI104I, examen de janvier en 1 h, sujets d'A.-E. Baert).
   Les réponses sont jugées par le calcul : un automate ou une expression tapés sont comparés au langage attendu,
   et le premier mot (le plus court) qui les sépare est montré. */
(function(){
"use strict";
const G=window.GEN,O=G.outils;
const AB=["a","b"];
const mot=w=>w===""?"ε":w;
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];
const nbA=(w,c)=>[...w].filter(x=>x===c).length;

/* ---------- automates : états 0..n-1, d[q][lettre] = liste des états d'arrivée ---------- */
function auto(noms,init,fin,T){noms=noms.map(String);const ix=x=>noms.indexOf(String(x)),d=noms.map(()=>({}));
  T.forEach(([p,c,q])=>{const L=d[ix(p)][c]=d[ix(p)][c]||[];if(!L.includes(ix(q)))L.push(ix(q));});
  return {n:noms.length,noms,init:init.map(ix),fin:noms.map(x=>fin.map(String).includes(x)),d};}
const tri=E=>[...new Set(E)].sort((x,y)=>x-y);
function clos(A,E){const S=new Set(E),P=[...E];while(P.length){const q=P.pop();(A.d[q]["ε"]||[]).forEach(r=>{if(!S.has(r)){S.add(r);P.push(r);}});}return tri([...S]);}
const pas=(A,E,c)=>clos(A,E.flatMap(q=>A.d[q][c]||[]));
function lit(A,w,E){E=E||clos(A,A.init);for(const c of w)E=pas(A,E,c);return E;}
const accepte=(A,w)=>lit(A,w).some(q=>A.fin[q]);
/* déterminisation par les ensembles d'états, dans l'ordre où on les découvre (lettre a d'abord) */
function det(A,dep){const k=E=>E.join(","),d0=dep||clos(A,A.init),V=new Map([[k(d0),0]]),E=[d0],T=[];
  for(let i=0;i<E.length;i++){T.push({});AB.forEach(c=>{const F=pas(A,E[i],c);if(!V.has(k(F))){V.set(k(F),E.length);E.push(F);}T[i][c]=V.get(k(F));});}
  return {E,T,fin:E.map(S=>S.some(q=>A.fin[q]))};}
/* le plus court mot sur lequel deux automates ne sont pas d'accord, ou null s'ils reconnaissent le même langage */
function difference(A,B,depA,depB){const k=(x,y)=>x.join(",")+"|"+y.join(","),a0=depA||clos(A,A.init),b0=depB||clos(B,B.init),vu=new Set([k(a0,b0)]),F=[[a0,b0,""]];
  for(let i=0;i<F.length;i++){const [x,y,w]=F[i],ax=x.some(q=>A.fin[q]),by=y.some(q=>B.fin[q]);if(ax!==by)return {w,dansA:ax};
    for(const c of AB){const nx=pas(A,x,c),ny=pas(B,y,c),kk=k(nx,ny);if(!vu.has(kk)){vu.add(kk);F.push([nx,ny,w+c]);}}}
  return null;}
/* l'automate déterministe complet minimal, états dans l'ordre du parcours depuis l'état initial, avec un mot qui mène à chacun */
function minimal(A,dep){const D=det(A,dep);let cl=D.fin.map(f=>f?1:0),nb=new Set(cl).size;
  for(;;){const m=new Map(),ncl=D.E.map((_,i)=>{const s=cl[i]+"/"+AB.map(c=>cl[D.T[i][c]]).join("/");if(!m.has(s))m.set(s,m.size);return m.get(s);});
    if(m.size===nb){cl=ncl;break;}nb=m.size;cl=ncl;}
  const num=new Map([[cl[0],0]]),rep=[0],acces=[""];
  for(let i=0;i<rep.length;i++)AB.forEach(c=>{const j=D.T[rep[i]][c];if(!num.has(cl[j])){num.set(cl[j],rep.length);rep.push(j);acces.push(acces[i]+c);}});
  return {n:rep.length,T:rep.map(r=>({a:num.get(cl[D.T[r].a]),b:num.get(cl[D.T[r].b])})),fin:rep.map(r=>D.fin[r]),acces};}
const versAuto=(M,noms)=>auto(noms,[noms[0]],noms.filter((_,i)=>M.fin[i]),M.T.flatMap((t,i)=>AB.map(c=>[noms[i],c,noms[t[c]]])));
const qn=n=>[...Array(n)].map((_,i)=>"q"+i);

/* ---------- expressions régulières : + union, juxtaposition, * étoile, ⁺, ε, ∅ ---------- */
function lisER(src){const s=String(src==null?"":src).toLowerCase().replace(/\^\s*\{?\s*\+\s*\}?|⁺/g,"⁺").replace(/\^\s*\{?\s*\*\s*\}?|[∗⋆*]/g,"*")
    .replace(/∅|ø|vide|\{\s*\}/g,"∅").replace(/epsilon|eps|ϵ|ε|e|\(\s*\)/g,"ε").replace(/[·.\s]/g,"").replace(/\|/g,"+");
  let p=0;if(!s)return null;
  function atome(){const c=s[p];
    if(c==="a"||c==="b"){p++;return {t:"c",c};}
    if(c==="ε"){p++;return {t:"e"};}
    if(c==="∅"){p++;return {t:"0"};}
    if(c==="("){p++;const x=union();if(!x||s[p]!==")")return null;p++;return x;}
    return null;}
  function facteur(){let x=atome();while(x&&(s[p]==="*"||s[p]==="⁺")){x={t:s[p]==="*"?"s":"+",x};p++;}return x;}
  function produit(){let x=facteur();while(x&&p<s.length&&s[p]!=="+"&&s[p]!==")"){const y=facteur();x=y&&{t:"p",l:x,r:y};}return x;}
  function union(){let x=produit();while(x&&s[p]==="+"){p++;const y=produit();x=y&&{t:"u",l:x,r:y};}return x;}
  const r=union();return r&&p===s.length?r:null;}
function deER(T){const d=[],nv=()=>{d.push({});return d.length-1;},arc=(p,c,q)=>{(d[p][c]=d[p][c]||[]).push(q);};
  function f(t){const i=nv(),o=nv();
    if(t.t==="c")arc(i,t.c,o);else if(t.t==="e")arc(i,"ε",o);
    else if(t.t==="u"||t.t==="p"){const L=f(t.l),R=f(t.r);arc(i,"ε",L[0]);if(t.t==="u"){arc(i,"ε",R[0]);arc(L[1],"ε",o);}else arc(L[1],"ε",R[0]);arc(R[1],"ε",o);}
    else if(t.t!=="0"){const X=f(t.x);arc(i,"ε",X[0]);arc(X[1],"ε",o);arc(X[1],"ε",X[0]);if(t.t==="s")arc(i,"ε",o);}
    return [i,o];}
  const [i,o]=f(T);return {n:d.length,noms:d.map((_,k)=>String(k)),init:[i],fin:d.map((_,k)=>k===o),d};}
const erA=s=>{const t=lisER(s);return t?deER(t):null;};
function ecrit(t,html,p){p=p||0;let s,q;
  if(t.t==="c"){s=t.c;q=3;}else if(t.t==="e"){s="ε";q=3;}else if(t.t==="0"){s="∅";q=3;}
  else if(t.t==="u"){s=ecrit(t.l,html,0)+" + "+ecrit(t.r,html,0);q=0;}
  else if(t.t==="p"){s=ecrit(t.l,html,1)+ecrit(t.r,html,1);q=1;}
  else {s=ecrit(t.x,html,3)+(html?(t.t==="s"?"<sup>∗</sup>":"<sup>+</sup>"):(t.t==="s"?"*":"⁺"));q=2;}
  return q<p?"("+s+")":s;}
const erH=s=>`<span class="nf">${ecrit(lisER(s),true)}</span>`,erT=s=>ecrit(lisER(s),false);
const SYM=[["ε","ε"],["∅","∅"],["*","*"],["⁺","⁺"],["+"," + "],["(","("],[")",")"]];
const AIDE_ER="Tape + pour « ou », * pour l'étoile, ⁺ (ou ^+) pour « au moins une fois », e ou ε pour le mot vide, ∅ pour le langage vide. Par exemple : (a + b)*bb.";

/* ---------- dessin d'un automate (états en ligne, arcs courbes) ---------- */
function dessin(A){const n=A.n,dx=88,R=17,X=i=>40+dx*i,Y=0,arcs=new Map();
  A.d.forEach((t,p)=>Object.keys(t).forEach(c=>t[c].forEach(q=>{const k=p+">"+q;arcs.set(k,(arcs.get(k)||[]).concat(c));})));
  let haut=-30,bas=30;const P=[],pt=(x,y)=>Math.round(x*10)/10+","+Math.round(y*10)/10;
  const fleche=(x,y,ux,uy)=>{const L=8,W=4.5;return `<path d="M${pt(x,y)} L${pt(x-L*ux-W*uy,y-L*uy+W*ux)} L${pt(x-L*ux+W*uy,y-L*uy-W*ux)} Z" fill="currentColor" stroke="none"/>`;};
  arcs.forEach((L,k)=>{const [p,q]=k.split(">").map(Number),lab=L.slice().sort().join(", ");
    if(p===q){const x=X(p),y=Y-R;P.push(`<path d="M${pt(x-8,y+3)} C${pt(x-22,y-30)} ${pt(x+22,y-30)} ${pt(x+8,y+3)}" fill="none" stroke="currentColor" stroke-width="1.4"/>`+fleche(x+8,y+3,0.35,0.94)+`<text x="${x}" y="${y-27}" text-anchor="middle">${lab}</text>`);haut=Math.min(haut,y-42);return;}
    const ret=arcs.has(q+">"+p),dist=Math.abs(q-p),x1=X(p),x2=X(q);
    const hgt=dist===1&&!ret?0:(q>p?-1:1)*(dist===1?20:(q>p&&A.d.slice(Math.min(p,q)+1,Math.max(p,q)).some((t,k)=>Object.values(t).some(L=>L.includes(Math.min(p,q)+1+k)))?44:24)+18*dist);
    const cx=(x1+x2)/2,cy=Y+2*hgt;
    const vx=cx-x1,vy=cy-Y,nv=Math.hypot(vx,vy),wx=x2-cx,wy=Y-cy,nw=Math.hypot(wx,wy);
    const sx=x1+R*vx/nv,sy=Y+R*vy/nv,ex=x2-R*wx/nw,ey=Y-R*wy/nw;
    const mx=(sx+2*cx+ex)/4,my=(sy+2*cy+ey)/4,ly=hgt<0?my-6:hgt>0?my+15:Y-7;
    P.push(`<path d="M${pt(sx,sy)} Q${pt(cx,cy)} ${pt(ex,ey)}" fill="none" stroke="currentColor" stroke-width="1.4"/>`+fleche(ex,ey,wx/nw,wy/nw)+`<text x="${Math.round(mx)}" y="${Math.round(ly)}" text-anchor="middle">${lab}</text>`);
    haut=Math.min(haut,my-22);bas=Math.max(bas,my+22);});
  const etats=A.noms.map((nm,i)=>`<circle cx="${X(i)}" cy="${Y}" r="${R}" fill="var(--bg, transparent)" stroke="currentColor" stroke-width="1.5"/>${A.fin[i]?`<circle cx="${X(i)}" cy="${Y}" r="${R-4}" fill="none" stroke="currentColor" stroke-width="1.2"/>`:""}<text x="${X(i)}" y="${Y+5}" text-anchor="middle">${nm}</text>`).join("");
  const init=A.init.map(i=>`<path d="M${X(i)-R-22},${Y} L${X(i)-R},${Y}" stroke="currentColor" stroke-width="1.4"/>`+fleche(X(i)-R,Y,1,0)).join("");
  const W=X(n-1)+40,H=bas-haut;
  return `<svg class="aut-dessin" viewBox="0 ${Math.round(haut)} ${W} ${Math.round(H)}" width="${W}" style="max-width:100%;height:auto;font-size:14px;display:block;margin:8px 0" role="img" aria-label="Automate dessiné : ${et(A.noms)}">${P.join("")}${etats}${init}</svg>`;}
function tableau(A){const cel=(p,c)=>{const L=(A.d[p][c]||[]).map(q=>A.noms[q]);return L.length?L.join(", "):"—";};
  return `<details class="aut-tab"><summary>Le même automate en tableau</summary><table class="tbl"><thead><tr><th>état</th><th>a</th><th>b</th></tr></thead><tbody>${A.noms.map((nm,p)=>`<tr><td>${A.init.includes(p)?"→ ":""}${nm}${A.fin[p]?" (acceptant)":""}</td><td>${cel(p,"a")}</td><td>${cel(p,"b")}</td></tr>`).join("")}</tbody></table></details>`;}
const montre=A=>dessin(A)+tableau(A);

/* ---------- lire ce qui est tapé ---------- */
const nettoie=s=>String(s==null?"":s).normalize("NFC").trim();
function lisMots(src){let s=nettoie(src);if(!s)return null;if(/^(∅|ø|vide|\{\s*\}|aucun)$/i.test(s))return [];
  s=s.replace(/^\{|\}$/g,"").trim();if(!s)return [];
  const P=s.split(/[\s,;]+/).filter(Boolean).map(x=>/^(ε|ϵ|e|eps|epsilon)$/i.test(x)?"":x.toLowerCase());
  return P.every(x=>/^[ab]*$/.test(x))?[...new Set(P)].sort():null;}
const ensMots=L=>L.length?"{"+L.slice().sort((x,y)=>x.length-y.length||(x<y?-1:1)).map(mot).join(", ")+"}":"∅";
const OUI=/^(oui|o|x|✓|✔|1|v|vrai|y|yes|acc|acceptant|f|final|terminal|t)$/i,NON=/^(non|n|0|-|—|faux|)$/i;
function lisEns(src,noms){const s=nettoie(src);if(!s)return null;if(/^(∅|ø|vide|\{\s*\}|aucun|puits)$/i.test(s))return [];
  const c=s.replace(/^\{|\}$/g,"").trim();if(!c)return [];
  const P=/[\s,;]/.test(c)?c.split(/[\s,;]+/).filter(Boolean):c.split("");
  const I=P.map(x=>noms.indexOf(x.toLowerCase().replace(/^q/,"")));return I.some(i=>i<0)?null:tri(I);}
const ensE=(E,noms)=>E.length?"{"+E.map(q=>noms[q]).join(", ")+"}":"∅";

/* ---------- les langages des sujets et des TD, sur {a, b} ---------- */
const L_={
 pa:["les mots ayant un nombre pair de a","b*(ab*ab*)*","On retient la parité du nombre de a lus : deux états, pair (acceptant) et impair."],
 ia:["les mots ayant un nombre impair de a","b*ab*(ab*ab*)*","On retient la parité du nombre de a lus : deux états, pair et impair (acceptant)."],
 m3:["les mots dont le nombre de a est un multiple de 3","b*(ab*ab*ab*)*","On retient le reste du nombre de a dans la division par 3 : trois états 0, 1, 2 ; seul 0 est acceptant."],
 a3:["les mots contenant au moins trois a","(a + b)*a(a + b)*a(a + b)*a(a + b)*","On compte les a jusqu'à trois : 0, 1, 2, puis « 3 ou plus », qui boucle sur a et b."],
 b2:["les mots contenant au moins deux b, pas forcément consécutifs","(a + b)*b(a + b)*b(a + b)*","On compte les b jusqu'à deux : q0 (aucun b), q1 (un b), q2 (deux b ou plus, acceptant, boucle sur a et b)."],
 u1a:["les mots ayant au plus un a","b*(ε + a)b*","On compte les a : 0, 1, puis un état puits dès le deuxième a."],
 x2a:["les mots ayant exactement deux a","b*ab*ab*","On compte les a : 0, 1, 2 (acceptant), puis un puits au troisième a."],
 da:["les mots commençant par a","a(a + b)*","La première lettre décide : a mène à un état acceptant qui boucle, b mène au puits."],
 fb:["les mots se terminant par b","(a + b)*b","On retient seulement la dernière lettre lue : l'état « dernière lettre b » est acceptant."],
 aa:["les mots contenant le facteur aa","(a + b)*aa(a + b)*","On retient le début du facteur déjà lu : rien, « a », puis « aa trouvé » (acceptant, boucle sur tout)."],
 abf:["les mots contenant le facteur ab","(a + b)*ab(a + b)*","On retient le début du facteur déjà lu : rien, « a », puis « ab trouvé » (acceptant, boucle sur tout). Un b lu après rien ne fait pas avancer."],
 nab:["les mots ne contenant pas le facteur ab","b*a*","Des b, puis des a : dès qu'un b suit un a, c'est perdu (puits)."],
 bbs:["les mots ayant bb comme suffixe","(a + b)*bb","On retient la fin du mot : rien d'utile, « b », « bb » (acceptant). Un a ramène au début."],
 aea:["les mots commençant et terminant par a","a + a(a + b)*a","Le mot a seul compte. Après un premier a, on retient la dernière lettre ; un mot qui commence par b va au puits."],
 pre:["les mots ayant ab ou ba comme préfixe","(ab + ba)(a + b)*","On lit les deux premières lettres : ab ou ba mènent à un état acceptant qui boucle, aa ou bb au puits."],
 lp:["les mots de longueur paire","((a + b)(a + b))*","On retient la parité de la longueur : deux états, chaque lettre fait changer d'état."],
 li:["les mots de longueur impaire","(a + b)((a + b)(a + b))*","On retient la parité de la longueur : deux états, chaque lettre fait changer d'état."],
 asb:["les mots dont chaque a est suivi immédiatement d'un b","(b + ab)*","Après un a, on attend un b : un a de plus ou la fin du mot font perdre."],
 nbb:["les mots ne contenant pas deux b consécutifs","(a + ba)*(ε + b)","On retient si la dernière lettre est un b : un second b de suite mène au puits."],
 ab1:["les mots contenant au moins un a et au moins un b","(a + b)*(ab + ba)(a + b)*","On retient les lettres déjà vues : aucune, seulement des a, seulement des b, puis les deux (acceptant)."],
 f2:["les mots se terminant par ab ou par ba","(a + b)*(ab + ba)","On retient les deux dernières lettres lues : il suffit qu'elles soient différentes."],
 imp:["les mots où, entre deux b successifs, il y a un nombre impair de a (exemple de janvier 2026 : aabaaa et baaababaaaa sont dans L, bb et baaabaab n'y sont pas)","a*(ε + b(a(aa)*b)*)a*","Avant le premier b, tout va. Après un b, on retient la parité des a lus depuis ce b : un b après un nombre pair de a mène au puits."],
 un:["les mots contenant une et une seule fois le facteur ab","b*a⁺b⁺a*","Des b, puis des a, puis des b, puis des a : un second « ab » mène au puits."],
 abba:["les mots commençant par ab et se terminant par ba","aba + ab(a + b)*ba","On vérifie le début ab, puis on retient les deux dernières lettres. Attention : aba est dans L (le a du milieu sert deux fois)."],
 papb:["les mots ayant un nombre pair de a ou un nombre pair de b (janvier 2025, question 1)","(b + ab*a)* + (a + ba*b)*","On retient la parité des a et celle des b : 4 états (pair-pair, impair-pair, pair-impair, impair-impair), tous acceptants sauf impair-impair. C'est l'automate combiné des deux automates de parité, avec les états d'arrivée de l'union."],
 lex:["les mots inférieurs ou égaux à baba dans l'ordre du dictionnaire","ε + b + ba + bab + baba + (a + baa)(a + b)*","On suit baba lettre à lettre : une lettre plus petite (a au lieu de b) mène à un état acceptant qui boucle, une lettre plus grande au puits. Les préfixes de baba sont acceptés."]};
const LANG=id=>({id,d:L_[id][0],er:L_[id][1],idee:L_[id][2]});
const A_=new Map();const autoDe=er=>{if(!A_.has(er))A_.set(er,erA(er));return A_.get(er);};
const minDe=er=>minimal(autoDe(er));

G.aut={AB,auto,clos,pas,lit,accepte,det,difference,minimal,versAuto,qn,lisER,deER,erA,ecrit,erH,erT,dessin,tableau,lisMots,ensMots,lisEns,ensE,L_,LANG,mot};

/* ---------- AU1 : mots ---------- */
function motHasard(R,n,S){let w="";for(let i=0;i<n;i++)w+=R.choix(S||AB);return w;}
const facteurs=w=>{const F=new Set();for(let i=0;i<=w.length;i++)for(let j=i;j<=w.length;j++)F.add(w.slice(i,j));return F;};
function sousMot(u,w){let i=0;for(const c of w)if(i<u.length&&u[i]===c)i++;return i===u.length;}
const RELS={pre:["préfixes",(u,w)=>w.startsWith(u),"Un préfixe est un début du mot : on compare lettre à lettre depuis la gauche."],suf:["suffixes",(u,w)=>w.endsWith(u),"Un suffixe est une fin du mot : on compare lettre à lettre depuis la droite."],
  fac:["facteurs",(u,w)=>w.includes(u),"Un facteur est un morceau d'un seul tenant : les lettres doivent se suivre dans le mot."],sm:["sous-mots",sousMot,"Un sous-mot s'obtient en effaçant des lettres sans changer l'ordre : on cherche chaque lettre plus loin que la précédente."]};
function choixMots(o){const ok=o.C.filter(u=>o.vrai(u)),juge=rep=>{const T=(rep.v||[]).map(Number);if(!T.length)return {incomplet:"Coche au moins une case."};
    const manque=ok.filter(u=>!T.includes(o.C.indexOf(u))),trop=T.map(i=>o.C[i]).filter(u=>!ok.includes(u));if(!manque.length&&!trop.length)return {ok:true};
    const u=trop[0]!=null?trop[0]:manque[0],i=o.C.indexOf(u);
    return {ok:false,resume:`Pas tout à fait : ${trop.length?`${et(trop.map(mot))} ${trop.length>1?"ne conviennent pas":"ne convient pas"}`:""}${trop.length&&manque.length?", et ":""}${manque.length?`il manque ${et(manque.map(mot))}`:""}.`,
      diag:{etape:i,type:trop.includes(u)?o.typeTrop:o.typeManque,titre:`Regarde ${mot(u)}.`,msg:o.pourquoi(u)}};};
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte+" ; choix : "+o.C.map(mot).join(", "),champs:[{k:"multi",id:"v",o:o.C.map((u,i)=>[String(i),mot(u)])}],juge,
    etapes:o.C.map(u=>({w:`<b>${mot(u)}</b> : ${o.vrai(u)?"oui":"non"}.`,why:o.pourquoi(u),pts:1})),bonne:ok.map(mot).join(" ; "),bonneTxt:ok.map(mot).join(", "),
    repBonne:{v:ok.map(u=>String(o.C.indexOf(u)))},repFausse:ok.length<o.C.length?{v:o.C.filter(u=>!ok.includes(u)).slice(0,1).map(u=>String(o.C.indexOf(u)))}:undefined,nature:o.nature,ens:o.ens};}
function presque(R,w,n,S){const C=new Set();let t=0;while(C.size<n&&t++<200){const k=R.ent(0,3),L=R.ent(2,Math.min(5,w.length));let u;
    if(k===0){const i=R.ent(0,w.length-L);u=w.slice(i,i+L);}
    else if(k===1){const i=R.ent(0,w.length-L);u=w.slice(i,i+L).split("");const j=R.ent(0,u.length-1);u[j]=R.choix((S||AB).filter(c=>c!==u[j]));u=u.join("");}
    else if(k===2){const I=R.mel([...Array(w.length).keys()]).slice(0,L).sort((x,y)=>x-y);u=I.map(i=>w[i]).join("");}
    else u=w.slice(0,R.ent(1,4))+(R()<0.5?"":R.choix(S||AB));
    if(u&&u!==w)C.add(u);}
  return [...C];}
function relMots(R){const w=motHasard(R,R.ent(7,9)),k=R.choix(["pre","suf","fac","sm"]),[nom,f,rappel]=RELS[k];let C;
  for(let t=0;;t++){C=R.mel(presque(R,w,6));const n=C.filter(u=>f(u,w)).length;if(n>=1&&n<=4||t>50)break;}
  if(!C.some(u=>f(u,w)))C[0]=k==="pre"?w.slice(0,3):k==="suf"?w.slice(-3):w.slice(2,5);
  return choixMots({sig:"R"+k+w+C,q:`Parmi ces mots, lesquels sont des ${nom} de <b>${w}</b> ?`,corps:`<p class="muted">${rappel}</p>`,texte:`${nom} de ${w}`,C,vrai:u=>f(u,w),
    pourquoi:u=>{if(k==="sm"){return sousMot(u,w)?`On trouve les lettres de ${u} dans l'ordre dans ${w}.`:`On ne trouve pas les lettres de ${u} dans cet ordre dans ${w}.`;}
      const i=w.indexOf(u);return f(u,w)?(k==="pre"?`${w} commence par ${u}.`:k==="suf"?`${w} finit par ${u}.`:`${u} se lit d'un seul tenant dans ${w}, à partir de la lettre ${i+1}.`):
        k==="fac"&&sousMot(u,w)?`Les lettres de ${u} sont bien dans ${w} dans cet ordre, mais pas collées : c'est un sous-mot, pas un facteur.`:k==="pre"?`${w} ne commence pas par ${u}.`:k==="suf"?`${w} ne finit pas par ${u}.`:`${u} ne se lit pas d'un seul tenant dans ${w}.`;},
    typeTrop:k==="fac"?"sous-mot pris pour un facteur":"définition mal appliquée",typeManque:"mot oublié",nature:nom,ens:{type:"rel",k,w,C}});}
function sousMotsQcm(R){const S=R()<0.5?["a","b","c"]:AB,w=S.length===3?R.choix(["abcabcabc","abcbacabc","acbacbacb","abacabcab","cabcabcab"]):motHasard(R,9);let C;
  for(let t=0;;t++){C=[];while(C.length<4){const k=R.ent(0,2),L=R.ent(5,7);let u;
      if(k===0){const I=R.mel([...Array(w.length).keys()]).slice(0,L).sort((x,y)=>x-y);u=I.map(i=>w[i]).join("");}
      else if(k===1){u=[...w].sort().join("").slice(0,L);u=R.mel(u.split("")).join("");}
      else {const I=R.mel([...Array(w.length).keys()]).slice(0,L).sort((x,y)=>x-y);u=I.map(i=>w[i]).join("");const j=R.ent(0,u.length-2);u=u.slice(0,j)+u[j+1]+u[j]+u.slice(j+2);}
      if(!C.includes(u)&&u!==w)C.push(u);}
    const n=C.filter(u=>sousMot(u,w)).length;if(n>=1&&n<=2||t>60)break;}
  if(!C.some(u=>sousMot(u,w)))C[0]=w.slice(0,2)+w.slice(4,8);
  return choixMots({sig:"S"+w+C,q:`Lesquels de ces mots sont des sous-mots de <b>${w}</b> ?`,corps:`<p class="muted">Comme au QCM de janvier 2026 (question 1).</p>`,texte:`sous-mots de ${w}`,C,vrai:u=>sousMot(u,w),
    pourquoi:u=>{let i=0,P=[];for(let k=0;k<w.length&&i<u.length;k++)if(w[k]===u[i]){P.push(k+1);i++;}
      return i===u.length?`On prend dans ${w} les lettres n° ${P.join(", ")} : elles donnent ${u}, dans l'ordre.`:`En cherchant les lettres de ${u} de gauche à droite dans ${w}, on trouve ${u.slice(0,i)||"rien"} (lettres n° ${P.join(", ")||"—"}), puis plus de ${u[i]} après : impossible.`;},
    typeTrop:"ordre des lettres pas respecté",typeManque:"sous-mot pas reconnu",nature:S.length===3?"abc":"ab",ens:{type:"rel",k:"sm",w,C}});}
const lexInf=(u,v)=>{for(let i=0;i<Math.min(u.length,v.length);i++)if(u[i]!==v[i])return u[i]<v[i];return u.length<v.length;};
function ordreLex(R){let C;do{C=[...new Set([...Array(5)].map(()=>motHasard(R,R.ent(1,5))))];}while(C.length<5||!C.some((u,i)=>C.some((v,j)=>i!==j&&v.startsWith(u))));
  const T=C.slice().sort((u,v)=>lexInf(u,v)?-1:1);
  function juge(rep){const L=nettoie(rep.o).split(/[\s,;<≺]+/).filter(Boolean).map(x=>x.toLowerCase());if(!L.length)return {incomplet:"Écris les cinq mots, du plus petit au plus grand, séparés par des espaces."};
    if(L.length!==5||!L.every(x=>C.includes(x))||new Set(L).size!==5)return {incomplet:"Écris exactement les cinq mots de l'énoncé, chacun une fois, séparés par des espaces."};
    const i=L.findIndex((x,k)=>x!==T[k]);if(i<0)return {ok:true};
    return {ok:false,resume:`Pas tout à fait : à la place ${i+1}, il faut ${T[i]}.`,diag:{etape:Math.min(i,3),type:T[i].length<L[i].length&&L[i].startsWith(T[i])?"le préfixe n'est pas mis avant":"comparaison à la première lettre différente",titre:`Compare ${T[i]} et ${L[i]}.`,msg:pourquoi(T[i],L[i])}};}
  const pourquoi=(u,v)=>{let i=0;while(i<u.length&&i<v.length&&u[i]===v[i])i++;return i===u.length?`${u} est un préfixe de ${v} : le plus court passe avant.`:`${u} et ${v} ont ${i?`le même début ${u.slice(0,i)}, puis`:"pour première lettre"} ${u[i]} et ${v[i]} : a passe avant b.`;};
  return {sig:"O"+C,q:`Range ces mots dans l'ordre lexicographique (celui du dictionnaire, avec a avant b) : <b>${C.join(", ")}</b>.`,corps:`<p class="muted">On compare à la première lettre différente ; si un mot est le début de l'autre, le plus court passe avant (TD 1, exercice 5).</p>`,texte:"ordre de "+C.join(", "),
    champs:[{k:"champ",id:"o",label:"Du plus petit au plus grand :",ex:"ab abb b …",aide:"Les cinq mots séparés par des espaces."}],juge,
    etapes:[0,1,2,3].map(k=>({w:`${T[k]} avant ${T[k+1]}.`,why:pourquoi(T[k],T[k+1]),pts:1})),bonne:T.join(" ≺ "),bonneTxt:T.join(" "),repBonne:{o:T.join(" ")},repFausse:{o:T.slice().reverse().join(" ")},nature:"ordre",ens:{type:"lex",C,T}};}

/* ---------- AU2 : lire un automate ---------- */
function auHasard(R,n,deterministe){const noms=[...Array(n)].map((_,i)=>String(i+1));
  for(let t=0;t<500;t++){const T=[];
    for(let p=0;p<n;p++)for(const c of AB){if(deterministe)T.push([noms[p],c,noms[R.ent(0,n-1)]]);
      else {const k=R()<0.25?0:R()<0.7?1:2;R.mel(noms).slice(0,k).forEach(q=>T.push([noms[p],c,q]));}}
    const F=noms.filter(()=>R()<0.4);if(!F.length||F.length===n)continue;
    const A=auto(noms,["1"],F,T),acc=new Set([0]),P=[0];while(P.length){const p=P.pop();AB.forEach(c=>(A.d[p][c]||[]).forEach(q=>{if(!acc.has(q)){acc.add(q);P.push(q);}}));}
    if(acc.size<n)continue;
    if(!deterministe&&!A.d.some(t=>AB.some(c=>(t[c]||[]).length>1)))continue;
    return A;}
  return auto(noms,["1"],[noms[n-1]],noms.flatMap((x,i)=>AB.map(c=>[x,c,noms[(i+(c==="a"?1:0))%n]])));}
function chemin(A,w){let E=clos(A,A.init);const L=[ensE(E,A.noms)];for(const c of w){E=pas(A,E,c);L.push(ensE(E,A.noms));}return {E,L};}
function motsAcceptes(R,deterministe){const n=R.ent(3,4);let A,C;
  for(let t=0;;t++){A=auHasard(R,n,deterministe);const vus=new Set();C=[];while(C.length<6){const w=motHasard(R,R.ent(0,5));if(!vus.has(w)){vus.add(w);C.push(w);}}
    const k=C.filter(w=>accepte(A,w)).length;if(k>=2&&k<=4||t>40)break;}
  if(!C.some(w=>accepte(A,w))){const M=minimal(A),w=M.acces.find((_,i)=>M.fin[i]);if(w!=null&&!C.includes(w))C[0]=w;}
  return choixMots({sig:"M"+deterministe+JSON.stringify(A.d)+A.fin+C,q:`Quels mots sont acceptés par cet automate${deterministe?"":" (il n'est pas déterministe)"} ?`,corps:montre(A),texte:"mots acceptés ; automate "+JSON.stringify(A.d),C,vrai:w=>accepte(A,w),
    pourquoi:w=>{const c=chemin(A,w),ok=accepte(A,w);return w===""?`Le mot vide ne fait pas bouger : on reste sur l'état initial ${ensE(clos(A,A.init),A.noms)}, qui ${ok?"est":"n'est pas"} acceptant.`:
      deterministe?`On suit les flèches : ${c.L.map(x=>x.replace(/[{}]/g,"")).join(" → ")}. On finit en ${c.L[c.L.length-1].replace(/[{}]/g,"")}, qui ${ok?"est":"n'est pas"} acceptant.`:
      `Les états possibles, lettre après lettre : ${c.L.join(" → ")}. ${ok?"Il y a un état acceptant à la fin : un chemin réussit.":c.E.length?"Aucun de ces états n'est acceptant.":"Plus aucun chemin possible : le mot est refusé."}`;},
    typeTrop:deterministe?"flèche mal suivie":"un seul chemin essayé",typeManque:deterministe?"flèche mal suivie":"un seul chemin essayé",nature:deterministe?"déterministe":"non déterministe",ens:{type:"lire",A,C}});}
function etatsAtteints(R){let A,w;
  for(let t=0;;t++){A=auHasard(R,R.ent(3,4),false);w=motHasard(R,R.ent(3,4));if(lit(A,w).length>=1||t>30)break;}
  const c=chemin(A,w),noms=A.noms;
  function juge(rep){const E=lisEns(rep.e,noms);if(E===null)return {incomplet:`Écris un ensemble d'états entre accolades, par exemple {1, 3}, ou ∅.`};
    if(E.join()===c.E.join())return {ok:true};
    return {ok:false,resume:`Pas tout à fait : on arrive dans ${ensE(c.E,noms)}.`,diag:{etape:w.length-1,type:E.length===1&&c.E.length>1?"un seul chemin suivi":"flèche oubliée",titre:"Refais le calcul lettre à lettre.",msg:`Lettre après lettre : ${c.L.join(" → ")}. À chaque lettre, on part de tous les états de l'ensemble à la fois.`}};}
  return {sig:"E"+JSON.stringify(A.d)+w,q:`Dans quels états peut-on être après avoir lu <b>${w}</b> depuis l'état initial 1 ?`,corps:montre(A)+`<p class="muted">C'est le calcul de la déterminisation : à chaque lettre, on part de tous les états de l'ensemble à la fois.</p>`,texte:`états après ${w} ; automate ${JSON.stringify(A.d)}`,
    champs:[{k:"champ",id:"e",label:"Ensemble des états :",ex:"{1, 3}",aide:"Entre accolades, avec des virgules. Aucun état : ∅."}],juge,
    etapes:[...w].map((ch,k)=>({w:`Après ${w.slice(0,k+1)} : ${c.L[k+1]}.`,why:`Depuis ${c.L[k]}, on suit toutes les flèches ${ch}.`,pts:1})),bonne:ensE(c.E,noms),bonneTxt:ensE(c.E,noms),repBonne:{e:ensE(c.E,noms)},repFausse:{e:c.E.length?"∅":"{1}"},nature:"ensemble",ens:{type:"atteint",A,w,E:c.E}};}

/* ---------- AU3 : expressions régulières ---------- */
const QCM_ER={
 b2:["(a + b)*(ba*b)*","(a + b)*b(a + ε)*b(a + b)*","(ba*b)*","(b*a*b*)*","(a + b)*b(a + b)*b(a + b)*","(a + b)*ba*b(a + b)*"],
 lp:["(a + b)*","(a + b)(a + b)","(aa + ab + ba + bb)*","((a + b)(a + b))*","(a + b)(a + b)*"],
 aea:["a(a + b)*a","a + a(a + b)*a","a(a + b)* + (a + b)*a","a((a + b)*a + ε)","a*(a + b)*a*"],
 aa:["(a + b)*aa(a + b)*","(b + ab)*aa(a + b)*","(a + b)*a(a + b)*a(a + b)*","(aa)*","(a + b)*a⁺a(a + b)*"],
 pa:["b*(ab*ab*)*","(b + ab*a)*","(aa)*b*","(b*ab*a)*","(a + b)*aa(a + b)*"],
 nbb:["(a + ba)*(ε + b)","(ε + b)(a + ab)*","(a + ba)*","(ab + a)*","a*(ba⁺)*(ε + b)"],
 asb:["(b + ab)*","(ab)*","(a + b)*b","b*(abb*)*","(b*ab)*"],
 ab1:["(a + b)*(ab + ba)(a + b)*","(a + b)*a(a + b)*b(a + b)*","a⁺b⁺","(a + b)*a(a + b)*b(a + b)* + (a + b)*b(a + b)*a(a + b)*","(a + b)⁺"],
 fb:["(a + b)*b","b*","(a*b)⁺","(a + b)⁺b","(a + b)*b(a + b)*"],
 da:["a(a + b)*","a⁺b*","a(a* + b*)","(a + b)*a","a + a(a + b)⁺"]};
const memeL=(e,f)=>!difference(autoDe(e),autoDe(f));
function motsER(R){const L=R.choix(Object.keys(QCM_ER)),er=R.choix(QCM_ER[L]),A=autoDe(er);let C;
  for(let t=0;;t++){const vus=new Set();C=[];while(C.length<6){const w=motHasard(R,R.ent(0,6));if(!vus.has(w)){vus.add(w);C.push(w);}}const k=C.filter(w=>accepte(A,w)).length;if(k>=1&&k<=4||t>60)break;}
  if(!C.some(w=>accepte(A,w))){const M=minimal(A),w=M.acces.find((_,i)=>M.fin[i]);if(w!=null&&!C.includes(w))C[0]=w;}
  return choixMots({sig:"W"+er+C,q:`Quels mots sont décrits par l'expression ${erH(er)} ?`,corps:`<p class="muted">+ veut dire « ou », l'étoile « autant de fois qu'on veut, même zéro », ⁺ « au moins une fois ».</p>`,texte:`mots de ${erT(er)}`,C,vrai:w=>accepte(A,w),
    pourquoi:w=>accepte(A,w)?`${mot(w)} se découpe selon l'expression.`:`Aucun découpage de ${mot(w)} ne suit l'expression.`,typeTrop:"étoile ou union mal lue",typeManque:"étoile ou union mal lue",nature:L,ens:{type:"er",er,C}});}
function qcmER(R){const id=R.choix(Object.keys(QCM_ER)),G0=LANG(id);let C;
  for(let t=0;;t++){C=R.mel(QCM_ER[id]).slice(0,R.ent(4,Math.min(6,QCM_ER[id].length)));const k=C.filter(e=>memeL(e,G0.er)).length;if(k>=1&&k<C.length||t>40)break;}
  const ok=C.filter(e=>memeL(e,G0.er));
  const juge=rep=>{const T=(rep.v||[]).map(Number);if(!T.length)return {incomplet:"Coche au moins une expression."};
    const trop=T.filter(i=>!ok.includes(C[i])),manque=C.map((_,i)=>i).filter(i=>ok.includes(C[i])&&!T.includes(i));if(!trop.length&&!manque.length)return {ok:true};
    const i=trop.length?trop[0]:manque[0],d=difference(autoDe(C[i]),autoDe(G0.er));
    return {ok:false,resume:`Pas tout à fait : l'expression ${i+1} ${trop.length?"ne décrit pas":"décrit bien"} ce langage.`,diag:{etape:i,type:trop.length?"expression trop large ou trop étroite":"expression juste écartée",titre:`Expression ${i+1}.`,msg:raison(C[i],d)}};};
  const raison=(e,d)=>!d?`${erH(e)} décrit bien ${G0.d}.`:d.dansA?`${erH(e)} contient ${mot(d.w)}, qui n'est pas dans le langage : elle est trop large.`:`${erH(e)} ne contient pas ${mot(d.w)}, qui est dans le langage : elle est trop étroite.`;
  return {sig:"Q"+id+C,q:`Sur l'alphabet {a, b}, quelles expressions décrivent ${G0.d} ?`,corps:`<ol>${C.map(e=>`<li>${erH(e)}</li>`).join("")}</ol><p class="muted">Comme aux questions 2 et 3 du QCM de janvier 2026. Pour écarter une expression, il suffit d'un mot de trop ou d'un mot qui manque.</p>`,texte:`ER de ${G0.d} parmi ${C.map(erT).join(" | ")}`,
    champs:[{k:"multi",id:"v",o:C.map((_,i)=>[String(i),"Expression "+(i+1)])}],juge,
    etapes:C.map((e,i)=>({w:`Expression ${i+1} : ${ok.includes(e)?"oui":"non"}.`,why:raison(e,difference(autoDe(e),autoDe(G0.er))),pts:1})),bonne:ok.map(e=>"expression "+(C.indexOf(e)+1)).join(", "),bonneTxt:ok.map(e=>erT(e)).join(" ; "),
    repBonne:{v:ok.map(e=>String(C.indexOf(e)))},repFausse:{v:C.filter(e=>!ok.includes(e)).slice(0,1).map(e=>String(C.indexOf(e)))},nature:id,ens:{type:"qcmER",id,C}};}
/* juge une expression tapée contre un automate de référence (ou une expression) */
function jugeER(src,ref,dep,quoi){const t=lisER(src);if(!t)return {incomplet:"Cette expression ne se lit pas. "+AIDE_ER};
  const d=difference(deER(t),ref,null,dep);if(!d)return {ok:true};
  return {ok:false,d,msg:d.dansA?`ton expression contient ${mot(d.w)}, qui n'est pas dans ${quoi} : elle est trop large`:`ton expression ne contient pas ${mot(d.w)}, qui est dans ${quoi} : elle est trop étroite`};}
const Maj=s=>s.charAt(0).toUpperCase()+s.slice(1);
const BANQUE_ER=["pa","ia","m3","b2","u1a","x2a","da","fb","aa","abf","nab","bbs","aea","pre","lp","li","asb","nbb","ab1","f2","imp","un"];
function ecrireER(R,banque){const L=LANG(R.choix(banque||BANQUE_ER)),ref=autoDe(L.er);
  const juge=rep=>{const j=jugeER(rep.e,ref,null,"le langage");if(j.ok||j.incomplet)return j;return {ok:false,resume:"Pas tout à fait : "+j.msg+".",diag:{etape:0,type:j.d.dansA?"expression trop large":"expression trop étroite",titre:`Essaie ton expression sur ${mot(j.d.w)}.`,msg:Maj(j.msg)+"."}};};
  return {sig:"X"+L.id,q:`Donne une expression régulière pour ${L.d}.`,corps:"",texte:"ER de "+L.d,champs:[{k:"champ",id:"e",label:"L =",sym:SYM,apercu:false,ex:"(a + b)*bb",aide:AIDE_ER}],juge,
    etapes:[{w:`Par exemple ${erH(L.er)}.`,why:L.idee+" Une autre expression juste est acceptée : le site compare les deux langages mot par mot.",pts:1}],bonne:erH(L.er),bonneTxt:erT(L.er),repBonne:{e:erT(L.er)},repFausse:{e:"(a + b)*"},nature:L.id,ens:{type:"ecrireER",id:L.id,er:L.er}};}

/* ---------- AU4 : construire un automate déterministe complet ---------- */
const VARS_AFD=["état","avec a","avec b","acceptant ?"];
const AIDE_AFD="Une ligne par état ; la première ligne est l'état initial. Dans « avec a » et « avec b », le nom de l'état d'arrivée. Acceptant : oui ou non. L'automate doit être complet : aucune case vide (ajoute un état puits s'il le faut).";
function lisAFD(T){const L=(T||[]).filter(r=>r.some(x=>nettoie(x)));if(!L.length)return {incomplet:"Remplis au moins une ligne du tableau."};
  const noms=L.map(r=>nettoie(r[0]).toLowerCase());if(noms.some(x=>!x))return {incomplet:"Chaque ligne commence par le nom de son état."};
  if(new Set(noms).size<noms.length)return {incomplet:"Deux lignes ont le même nom d'état."};
  const T2=[],F=[];for(let i=0;i<L.length;i++){for(let k=1;k<=2;k++){const x=nettoie(L[i][k]).toLowerCase();
      if(!x)return {incomplet:`Ligne ${i+1} (${noms[i]}) : la case « avec ${AB[k-1]} » est vide. L'automate doit être complet : envoie-la vers un état puits.`};
      if(!noms.includes(x))return {incomplet:`Ligne ${i+1} : l'état « ${x} » n'a pas de ligne dans le tableau.`};T2.push([noms[i],AB[k-1],x]);}
    const a=nettoie(L[i][3]);if(OUI.test(a))F.push(noms[i]);else if(!NON.test(a))return {incomplet:`Ligne ${i+1} : écris oui ou non dans « acceptant ? ».`};}
  return {A:auto(noms,[noms[0]],F,T2)};}
function jugeAFD(rep,ref,dep,o){const r=lisAFD(rep.t);if(r.incomplet)return r;
  const d=difference(r.A,ref,null,dep);
  if(d)return {ok:false,resume:`Pas tout à fait : ton automate ${d.dansA?"accepte":"refuse"} ${mot(d.w)}.`,diag:{etape:0,type:d.dansA?"automate trop large":"automate trop étroit",titre:`Lis ${mot(d.w)} dans ton automate.`,
    msg:`${mot(d.w)} ${d.dansA?"n'est pas":"est"} dans ${o.quoi}, mais ton automate ${d.dansA?"l'accepte":"le refuse"} (chemin : ${chemin(r.A,d.w).L.map(x=>x.replace(/[{}]/g,"")).join(" → ")}).`}};
  if(o.max&&r.A.n>o.n)return {ok:false,resume:`Ton automate reconnaît le bon langage, mais il a ${r.A.n} états : ${o.max?"l'énoncé en demande":"il en suffit de"} ${o.n}.`,diag:{etape:0,type:"états en trop",titre:"Deux de tes états font le même travail.",msg:o.trop||`Cherche deux états qui ont le même avenir (les mêmes mots les mènent à l'acceptation) : on peut les fusionner.`}};
  return {ok:true};}
function etapesAFD(M,noms,pourquoi){return [{w:`Un automate qui convient (${M.n} états, ${noms[0]} initial) :`+dessin(versAuto(M,noms)),why:pourquoi,pts:1},
  ...M.T.map((t,i)=>({w:`${noms[i]}${M.fin[i]?" (acceptant)":""} : avec a → ${noms[t.a]}, avec b → ${noms[t.b]}.`,why:i?`On arrive en ${noms[i]} par ${M.acces[i]}.`:"C'est l'état initial : rien n'est encore lu.",pts:1}))];}
function construire(R,banque,avecN){const L=LANG(R.choix(banque)),M=minDe(L.er),noms=qn(M.n),ref=autoDe(L.er);
  return {sig:"C"+L.id+avecN,q:`Donne un automate déterministe et complet${avecN?` avec ${M.n} états`:""} qui reconnaît ${L.d}.`,corps:`<p class="muted">${AIDE_AFD}</p>`,texte:"AFD de "+L.d,
    champs:[{k:"trace",id:"t",vars:VARS_AFD,rangs:true,serre:true,lignes:Math.min(3,M.n)}],juge:rep=>jugeAFD(rep,ref,null,{quoi:"le langage",n:M.n,max:avecN}),etapes:etapesAFD(M,noms,L.idee),
    bonne:"voir l'automate de la correction",bonneTxt:M.T.map((t,i)=>`${noms[i]}: a→${noms[t.a]} b→${noms[t.b]}${M.fin[i]?" acceptant":""}`).join(" ; "),
    repBonne:{t:M.T.map((t,i)=>[noms[i],noms[t.a],noms[t.b],M.fin[i]?"oui":"non"])},repFausse:{t:M.T.map((t,i)=>[noms[i],noms[t.a],noms[t.b],M.fin[i]?"non":"oui"])},nature:L.id,ens:{type:"afd",id:L.id,er:L.er,n:M.n}};}

/* ---------- AU5 : déterminiser ---------- */
const VARS_DET=["ensemble","avec a","avec b","acceptant ?"];
function afnDet(R,n,lo,hi){for(let t=0;;t++){const A=auHasard(R,n,false),D=det(A);if(D.E.length>=lo&&D.E.length<=hi&&D.fin.some(Boolean)&&!D.fin.every(Boolean)||t>300)return {A,D};}}
function determiniser(R,n,compl){const {A,D}=afnDet(R,n,n===3?4:5,n===3?6:8),noms=A.noms,F=D.fin.map(f=>compl?!f:f),E=S=>ensE(S,noms);
  function juge(rep){const L=(rep.t||[]).filter(r=>r.some(x=>nettoie(x)));if(!L.length)return {incomplet:"Remplis au moins la première ligne : l'état initial."};
    const P=[];for(let i=0;i<L.length;i++){const r=[0,1,2].map(k=>lisEns(L[i][k],noms));const k=r.indexOf(null);
      if(k>=0)return {incomplet:`Ligne ${i+1}, case « ${VARS_DET[k]} » : écris un ensemble d'états, par exemple {1, 2}, ou ∅.`};
      const a=nettoie(L[i][3]);if(!OUI.test(a)&&!NON.test(a))return {incomplet:`Ligne ${i+1} : écris oui ou non dans « acceptant ? ».`};P.push({S:r[0],a:r[1],b:r[2],f:OUI.test(a)});}
    const ix=S=>D.E.findIndex(x=>x.join()===S.join()),faute=(i,type,titre,msg)=>({ok:false,resume:"Pas tout à fait : "+titre,diag:{etape:Math.max(0,i),type,titre,msg}});
    if(ix(P[0].S)!==0)return faute(0,"état initial","la première ligne est l'état initial.",`L'état initial du déterminisé est l'ensemble des états initiaux : ${E(D.E[0])}.`);
    for(const p of P){const i=ix(p.S);
      if(i<0)return faute(0,"ensemble pas atteint",`${E(p.S)} n'est pas atteint.`,`On ne garde que les ensembles qu'on atteint depuis ${E(D.E[0])} en suivant a et b. ${E(p.S)} n'en fait pas partie.`);
      for(const c of AB){const v=D.E[D.T[i][c]];if(p[c].join()!==v.join())return faute(i,"flèche oubliée dans un ensemble",`depuis ${E(p.S)} avec ${c}, on arrive dans ${E(v)}.`,`Depuis ${E(p.S)}, on réunit les arrivées par ${c} de chaque état : ${p.S.map(q=>`${noms[q]} → ${E((A.d[q][c]||[]).slice().sort())}`).join(", ")||"aucun état"}. Total : ${E(v)}.`);}}
    if(new Set(P.map(p=>p.S.join())).size<P.length)return faute(0,"ligne en double","un ensemble est écrit deux fois.","Chaque ensemble n'a qu'une ligne.");
    const manque=D.E.filter(S=>!P.some(p=>p.S.join()===S.join()));
    if(manque.length){const i=ix(manque[0]),j=D.T.findIndex((t,k)=>AB.some(c=>t[c]===i)&&P.some(p=>p.S.join()===D.E[k].join())),c=j>=0?AB.find(c=>D.T[j][c]===i):"a";
      return faute(i,manque[0].length?"ensemble oublié":"état puits ∅ oublié",`il manque la ligne de ${E(manque[0])}.`,`On atteint ${E(manque[0])} depuis ${j>=0?E(D.E[j]):"un autre ensemble"} avec ${c} : il lui faut sa ligne${manque[0].length?"":" (c'est l'état puits : il boucle sur lui-même)"}.`);}
    for(const p of P){const i=ix(p.S);if(p.f!==F[i])return faute(D.E.length,"états acceptants",`${E(p.S)} ${F[i]?"est":"n'est pas"} acceptant.`,compl?`Pour le complémentaire, on échange acceptant et non acceptant dans le déterminisé complet : ${E(p.S)} ${D.fin[i]?"contient":"ne contient pas"} d'état acceptant de A, donc il ${F[i]?"devient acceptant":"ne l'est plus"}.`:`Un ensemble est acceptant s'il contient au moins un état acceptant de l'automate (${et(noms.filter((_,q)=>A.fin[q]))}).`);}
    return {ok:true};}
  const fins=noms.filter((_,q)=>A.fin[q]);
  const etapes=D.E.map((S,i)=>({w:`${E(S)} : avec a → ${E(D.E[D.T[i].a])}, avec b → ${E(D.E[D.T[i].b])}.`,why:S.length?`On réunit les arrivées de chaque état de ${E(S)}. ${AB.map(c=>S.map(q=>`${noms[q]} —${c}→ ${E((A.d[q][c]||[]).slice().sort())}`).join(", ")).join(" ; ")}.`:"L'ensemble vide est l'état puits : il reste vide.",pts:1}));
  etapes.push({w:`États acceptants : ${et(D.E.filter((_,i)=>F[i]).map(E))}.`,why:compl?`Dans le déterminisé complet, ce sont les ensembles qui ne contiennent aucun état acceptant de A (${et(fins)}) : on a échangé acceptant et non acceptant. Le puits ∅ devient donc acceptant.`:`Ce sont les ensembles qui contiennent un état acceptant de l'automate (${et(fins)}).`,pts:1});
  const MD={n:D.E.length,T:D.T,fin:F},nomsD=D.E.map(E);
  etapes.push({w:"Le dessin de l'automate obtenu :"+dessin(versAuto(MD,nomsD)),why:"C'est le tableau dessiné, avec "+E(D.E[0])+" comme état initial.",pts:0.5});
  return {sig:"D"+compl+JSON.stringify(A.d)+A.fin,q:compl?`Donne un automate déterministe complet qui reconnaît le complémentaire du langage de cet automate : déterminise-le (tableau des ensembles d'états), puis dis quels états sont acceptants pour le complémentaire.`:`Déterminise cet automate : écris le tableau des ensembles d'états atteints depuis l'état initial, avec leurs transitions, et dis lesquels sont acceptants.`,
    corps:montre(A)+`<p class="muted">Une ligne par ensemble ; la première est l'état initial ${E(D.E[0])}. Écris les ensembles entre accolades : {1, 2}. L'ensemble vide (le puits) s'écrit ∅ et a sa ligne.</p>`,texte:`déterminiser ${JSON.stringify(A.d)} finaux ${fins}`,
    champs:[{k:"trace",id:"t",vars:VARS_DET,rangs:true,serre:true,lignes:3}],juge,etapes,bonne:"voir le tableau de la correction",bonneTxt:D.E.map((S,i)=>`${E(S)}: a→${E(D.E[D.T[i].a])} b→${E(D.E[D.T[i].b])}${F[i]?" acceptant":""}`).join(" ; "),
    repBonne:{t:D.E.map((S,i)=>[E(S),E(D.E[D.T[i].a]),E(D.E[D.T[i].b]),F[i]?"oui":"non"])},repFausse:{t:D.E.slice(0,-1).map((S,i)=>[E(S),E(D.E[D.T[i].a]),E(D.E[D.T[i].b]),F[i]?"oui":"non"])},nature:compl?"complémentaire":n+" états",ens:{type:"det",A,compl,D}};}

/* ---------- AU6 : quotients à gauche ---------- */
const Lu=u=>u?`L<sub>${u}</sub>`:"L";
const quotFini=(L,u)=>L.filter(w=>w.startsWith(u)).map(w=>w.slice(u.length)).sort();
function quotientsFinis(R,deux){let L,U;
  for(let t=0;;t++){L=[...new Set([...Array(R.ent(4,5))].map(()=>motHasard(R,R.ent(0,4))))];
    U=deux?R.mel(["aa","ab","ba","bb"]).slice(0,2):["a","b"];const Q=U.map(u=>quotFini(L,u));if(L.length>=4&&Q.some(x=>x.length)&&Q.reduce((s,x)=>s+x.length,0)>=2||t>80)break;}
  const Q=U.map(u=>quotFini(L,u)),ids=U.map(u=>"L"+u);
  function juge(rep){const T=ids.map(k=>lisMots((rep.c||{})[k]));const k=T.indexOf(null);if(k>=0)return {incomplet:`${Lu(U[k])} : écris un ensemble de mots entre accolades, par exemple {bb, ε}, ou ∅.`};
    const i=T.findIndex((x,j)=>x.join()!==Q[j].join());if(i<0)return {ok:true};
    const manque=Q[i].filter(w=>!T[i].includes(w)),trop=T[i].filter(w=>!Q[i].includes(w));
    return {ok:false,resume:`Pas tout à fait : ${Lu(U[i])} = ${ensMots(Q[i])}.`,diag:{etape:i,type:trop.some(w=>L.includes(w))?"mot de L recopié sans enlever le début":manque.includes("")?"ε oublié":"mot oublié ou en trop",titre:`Regarde ${Lu(U[i])}.`,
      msg:`${manque.length?`Il manque ${et(manque.map(mot))}${manque.includes("")?` : ${U[i]} est lui-même dans L, et ${U[i]}·ε = ${U[i]}`:""}. `:""}${trop.length?`${et(trop.map(mot))} ${trop.length>1?"sont":"est"} en trop : ${U[i]}${trop[0]} n'est pas dans L. `:""}On garde les mots de L qui commencent par ${U[i]}, et on enlève ce début.`}};}
  return {sig:"F"+L+U,q:`On pose L = ${ensMots(L)}. Calcule ${et(U.map(Lu))}.`,corps:`<p class="muted">Le quotient à gauche : ${Lu("u")} = { v | uv ∈ L }. On garde les mots de L qui commencent par u, et on enlève ce début (janvier 2026, exercice 4).</p>`,texte:`L = ${ensMots(L)} ; quotients par ${U.join(", ")}`,
    champs:[{k:"cases",id:"c",noms:ids,large:true,aide:"Des mots entre accolades, séparés par des virgules : {bb, ε}. Le mot vide : ε (ou e). Aucun mot : ∅."}],juge,
    etapes:U.map((u,i)=>({w:`${Lu(u)} = ${ensMots(Q[i])}.`,why:L.filter(w=>w.startsWith(u)).length?`Les mots de L qui commencent par ${u} : ${et(L.filter(w=>w.startsWith(u)))}. On enlève ${u} : ${et(Q[i].map(mot))}.`:`Aucun mot de L ne commence par ${u} : le quotient est vide.`,pts:1})),
    bonne:U.map((u,i)=>`${Lu(u)} = ${ensMots(Q[i])}`).join(" ; "),bonneTxt:U.map((u,i)=>`L${u} = ${ensMots(Q[i])}`).join(" ; "),
    repBonne:{c:Object.fromEntries(ids.map((k,i)=>[k,ensMots(Q[i])]))},repFausse:{c:Object.fromEntries(ids.map((k,i)=>[k,i?ensMots(Q[i]):ensMots(L)]))},nature:deux?"deux lettres":"une lettre",ens:{type:"qfini",L,U,Q}};}
/* langages décrits, avec leurs quotients écrits à la main (comparés au calcul par le contrôle) */
const QUOT_D={
 abf:{a:"(a + b)*b(a + b)*",b:"(a + b)*ab(a + b)*",dit:{a:"Après un a, il suffit de lire un b plus loin : le premier b du reste suit forcément un a.",b:"Un b au début ne commence pas de facteur ab : il reste à trouver ab."}},
 aea:{a:"ε + (a + b)*a",b:"∅",dit:{a:"av commence par a ; il faut encore que av finisse par a : v est vide (le mot a) ou finit par a.",b:"Aucun mot de L ne commence par b."}},
 da:{a:"(a + b)*",b:"∅",dit:{a:"Tout mot qui commence par a est dans L : v est quelconque.",b:"Aucun mot de L ne commence par b."}},
 fb:{a:"(a + b)*b",b:"ε + (a + b)*b",dit:{a:"av finit par b si et seulement si v finit par b (v ne peut pas être vide).",b:"bv finit par b si v est vide, ou si v finit par b."}},
 pa:{a:"b*ab*(ab*ab*)*",b:"b*(ab*ab*)*",dit:{a:"Le a du début compte : il faut un nombre impair de a dans v.",b:"Un b ne change pas le nombre de a : Lb = L."}},
 b2:{a:"(a + b)*b(a + b)*b(a + b)*",b:"(a + b)*b(a + b)*",dit:{a:"Un a ne compte pas : La = L.",b:"Il reste un seul b à trouver."}},
 aa:{a:"a(a + b)* + (a + b)*aa(a + b)*",b:"(a + b)*aa(a + b)*",dit:{a:"Soit v commence par a (le facteur aa est déjà là), soit v contient aa.",b:"Un b ne commence pas de facteur aa : Lb = L."}},
 lp:{a:"(a + b)((a + b)(a + b))*",b:"(a + b)((a + b)(a + b))*",dit:{a:"Il faut une longueur impaire pour v.",b:"Il faut une longueur impaire pour v."}},
 nab:{a:"a*",b:"b*a*",dit:{a:"Après un a, plus de b possible : v n'a que des a.",b:"Un b au début ne gêne pas : Lb = L."}},
 u1a:{a:"b*",b:"b*(ε + a)b*",dit:{a:"Le seul a permis est déjà lu : v n'a que des b.",b:"Un b ne compte pas : Lb = L."}},
 bbs:{a:"(a + b)*bb",b:"b + (a + b)*bb",dit:{a:"av finit par bb si et seulement si v finit par bb.",b:"bv finit par bb si v = b, ou si v finit lui-même par bb."}}};
const QUOT_E=[
 {L:"(b + aba)*",q:{a:"ba(b + aba)*",ab:"a(b + aba)*",b:"(b + aba)*",aba:"(b + aba)*"},src:"janvier 2026, exercice 4, question 8"},
 {L:"(ab)*",q:{a:"b(ab)*",b:"∅",ab:"(ab)*",aa:"∅"}},
 {L:"a*b*",q:{a:"a*b*",b:"b*",ab:"b*",ba:"∅"}},
 {L:"(ab + b)*a",q:{a:"ε + b(ab + b)*a",b:"(ab + b)*a",ab:"(ab + b)*a"}},
 {L:"(a + bb)*",q:{a:"(a + bb)*",b:"b(a + bb)*",bb:"(a + bb)*",ba:"∅"}},
 {L:"a(a + b)*b",q:{a:"(a + b)*b",b:"∅",ab:"ε + (a + b)*b",aa:"(a + b)*b"}},
 {L:"(ba)*b",q:{b:"(ab)*",a:"∅",ba:"(ba)*b",bb:"∅"}},
 {L:"(aa + b)*a",q:{a:"ε + a(aa + b)*a",b:"(aa + b)*a",aa:"(aa + b)*a"}}];
function quotientsER(R,o){const champs=[],att=[];let qs,src="";
  if(o.decrit){const id=R.choix(Object.keys(QUOT_D)),L=LANG(id);qs=AB.map(u=>({u,er:QUOT_D[id][u],dit:QUOT_D[id].dit[u]}));o.L=L;o.enonce=`On note L l'ensemble des ${L.d.replace(/^les /,"")}. Décris ${et(AB.map(Lu))} par des expressions régulières.`;o.er=L.er;o.sig="Q"+id;}
  else {const B=R.choix(QUOT_E),U=R.mel(Object.keys(B.q)).slice(0,2).sort((x,y)=>x.length-y.length);qs=U.map(u=>({u,er:B.q[u]}));o.er=B.L;o.enonce=`Soit L le langage décrit par l'expression ${erH(B.L)}. Décris ${et(U.map(Lu))} par des expressions régulières.`;o.sig="E"+B.L+U;src=B.src||"";}
  const A=autoDe(o.er);
  qs.forEach(x=>{x.dep=lit(A,x.u);champs.push({k:"champ",id:"L"+x.u,label:Lu(x.u)+" =",sym:SYM,apercu:false,ex:"(a + b)*b"});});
  champs[champs.length-1].aide=AIDE_ER;
  function juge(rep){for(let i=0;i<qs.length;i++){const j=jugeER(rep["L"+qs[i].u],A,qs[i].dep,Lu(qs[i].u));if(j.incomplet)return {incomplet:`${Lu(qs[i].u)} : ${j.incomplet}`};
      if(!j.ok)return {ok:false,resume:`Pas tout à fait pour ${Lu(qs[i].u)} : ${j.msg}.`,diag:{etape:i,type:j.d.dansA?"quotient trop large":"quotient trop étroit",titre:`Essaie ${mot(j.d.w)} : ${qs[i].u}${j.d.w} est-il dans L ?`,msg:`${Maj(j.msg)}. En effet, ${qs[i].u}${j.d.w} ${j.d.dansA?"n'est pas":"est"} dans L.`}};}
    return {ok:true};}
  return {sig:o.sig,q:o.enonce,corps:`<p class="muted">${Lu("u")} = { v | uv ∈ L } : ce qui peut suivre u pour former un mot de L.${src?` (${src}.)`:""}</p>`,texte:o.enonce.replace(/<[^>]+>/g,""),champs,juge,
    etapes:qs.map(x=>({w:`${Lu(x.u)} = ${erH(x.er)}.`,why:(x.dit||`On cherche les v tels que ${x.u}v soit dans L : on découpe ${x.u}v selon l'expression de L.`)+" Une autre expression du même langage est acceptée.",pts:1})),
    bonne:qs.map(x=>`${Lu(x.u)} = ${erH(x.er)}`).join(" ; "),bonneTxt:qs.map(x=>`L${x.u} = ${erT(x.er)}`).join(" ; "),repBonne:Object.fromEntries(qs.map(x=>["L"+x.u,erT(x.er)])),repFausse:Object.fromEntries(qs.map(x=>["L"+x.u,o.decrit?erT(o.er):"∅ + a"])),nature:o.decrit?"décrit":"expression",ens:{type:"quotER",er:o.er,qs:qs.map(x=>({u:x.u,er:x.er}))}};}
/* tous les quotients et l'automate qu'ils forment */
const QUOT_TOUS=[
 [{L:"a*b*",q:[["ε","a*b*"],["b","b*"],["ba","∅"]],src:"janvier 2026, exercice 4, question 3"},{L:"(ab)*",q:[["ε","(ab)*"],["a","b(ab)*"],["b","∅"]]},{L:"a(a + b)*",q:[["ε","a(a + b)*"],["a","(a + b)*"],["b","∅"]]},
  {L:"(a + b)*a",q:[["ε","(a + b)*a"],["a","ε + (a + b)*a"]]},{L:"b*a",q:[["ε","b*a"],["a","ε"],["aa","∅"]]},{L:"(a + b)*b(a + b)*",q:[["ε","(a + b)*b(a + b)*"],["b","(a + b)*"]]}],
 [{L:"(a + b)*ab",q:[["ε","(a + b)*ab"],["a","b + (a + b)*ab"],["ab","ε + (a + b)*ab"]]},{L:"aa*b",q:[["ε","aa*b"],["a","a*b"],["ab","ε"],["b","∅"]]},
  {L:"a*ba*",q:[["ε","a*ba*"],["b","a*"],["bb","∅"]]},{L:"(aa)*b",q:[["ε","(aa)*b"],["a","a(aa)*b"],["b","ε"],["bb","∅"]]},{L:"b(a + b)*a",q:[["ε","b(a + b)*a"],["a","∅"],["b","(a + b)*a"],["ba","ε + (a + b)*a"]]},
  {L:"(ab + ba)*",q:[["ε","(ab + ba)*"],["a","b(ab + ba)*"],["b","a(ab + ba)*"],["aa","∅"]]}]];
function tousQuotients(R,k){const B=R.choix(QUOT_TOUS[k]),A=autoDe(B.L),M=minimal(A),noms=B.q.map((_,i)=>"q"+i);
  const ordre=M.acces.map(w=>B.q.findIndex(x=>!difference(autoDe(x[1]),A,null,lit(A,w)))),Mq=ordre.every(i=>i>=0)&&new Set(ordre).size===B.q.length&&M.n===B.q.length;
  const nomDe=i=>noms[ordre[i]];
  return {sig:"T"+B.L,q:`Soit L = ${erH(B.L)}. Détermine tous ses quotients à gauche ${Lu("u")} distincts, associe un état à chacun, et donne le tableau de l'automate déterministe complet qu'ils forment.`,
    corps:`<p class="muted">L'état du quotient ${Lu("u")} va, avec la lettre x, vers l'état du quotient ${Lu("ux")}. Il est acceptant si ε ∈ ${Lu("u")}. Le premier état est L lui-même (${Lu("ε")} = L).${B.src?` (${B.src}.)`:""}</p><p class="muted">${AIDE_AFD}</p>`,texte:"automate des quotients de "+erT(B.L),
    champs:[{k:"trace",id:"t",vars:VARS_AFD,rangs:true,serre:true,lignes:Math.min(3,M.n)}],
    juge:rep=>jugeAFD(rep,A,null,{quoi:"L",n:M.n,max:true,trop:`L a ${M.n} quotients distincts : un état par quotient. Deux de tes états ont le même quotient (les mêmes mots les mènent à l'acceptation).`}),
    etapes:[{w:`Les quotients distincts : ${B.q.map((x,i)=>`${noms[i]} = ${Lu(x[0])} = ${erH(x[1])}`).join(" ; ")}.`,why:`On calcule ${Lu("a")}, ${Lu("b")}, puis les quotients de ceux-là, jusqu'à ne plus en trouver de nouveau. Les autres sont égaux à l'un d'eux.`,pts:1},
      ...M.T.map((t,i)=>({w:`${nomDe(i)}${M.fin[i]?" (acceptant)":""} : avec a → ${nomDe(t.a)}, avec b → ${nomDe(t.b)}.`,why:`${M.fin[i]?"ε est dans ce quotient : l'état est acceptant.":"ε n'est pas dans ce quotient."} ${i?`On y arrive par ${M.acces[i]}.`:""}`,pts:1})),
      {w:"Le graphe de l'automate :"+dessin(versAuto(M,M.T.map((_,i)=>nomDe(i)))),why:"Le tableau dessiné : un état par quotient.",pts:0.5}],
    bonne:"voir le tableau de la correction",bonneTxt:M.T.map((t,i)=>`${nomDe(i)}: a→${nomDe(t.a)} b→${nomDe(t.b)}${M.fin[i]?" acceptant":""}`).join(" ; "),
    repBonne:{t:M.T.map((t,i)=>[nomDe(i),nomDe(t.a),nomDe(t.b),M.fin[i]?"oui":"non"])},repFausse:{t:M.T.map((t,i)=>[nomDe(i),nomDe(t.a),nomDe(t.b),M.fin[i]!==(i===0)?"oui":"non"])},nature:"quotients",ens:{type:"tousQ",L:B.L,q:B.q,n:M.n,ok:Mq}};}
/* les démonstrations des sujets : l'opération garde les langages reconnaissables */
const PREUVES=[
 {op:"le quotient à gauche",def:`${Lu("u")} = { v ∈ A* | uv ∈ L }`,src:"janvier 2026, exercice 4, questions 6 et 7 (corrigé officiel)",
  auto:"le même automate, avec q<sub>u</sub> = δ*(q<sub>0</sub>, u) comme état initial : A<sub>u</sub> = ⟨A, Q, q<sub>u</sub>, F, δ⟩",
  eq:"v ∈ L(A<sub>u</sub>) ⟺ δ*(q<sub>u</sub>, v) ∈ F ⟺ δ*(q<sub>0</sub>, uv) ∈ F ⟺ uv ∈ L ⟺ v ∈ L<sub>u</sub>",
  regles:"(L<sub>1</sub> ∪ L<sub>2</sub>)<sub>u</sub> = (L<sub>1</sub>)<sub>u</sub> ∪ (L<sub>2</sub>)<sub>u</sub> ; (L<sub>1</sub> ∩ L<sub>2</sub>)<sub>u</sub> = (L<sub>1</sub>)<sub>u</sub> ∩ (L<sub>2</sub>)<sub>u</sub> ; (complémentaire de L)<sub>u</sub> = complémentaire de L<sub>u</sub>",cle:"Lire u depuis q<sub>0</sub>, c'est arriver en q<sub>u</sub> : on démarre directement là."},
 {op:"a⁻¹L (les fins des mots de L qui commencent par a)",def:"a⁻¹L = { m | a·m ∈ L }",src:"juin 2024, questions 5 et 6 (corrigé écrit par moi, sur le modèle de 2026)",
  auto:"le même automate, avec δ(q<sub>d</sub>, a) comme état initial",eq:"m ∈ L(A′) ⟺ δ*(δ(q<sub>d</sub>, a), m) ∈ A ⟺ δ*(q<sub>d</sub>, am) ∈ A ⟺ am ∈ L ⟺ m ∈ a⁻¹L",
  regles:"a⁻¹(L<sub>1</sub> ∪ L<sub>2</sub>) = a⁻¹L<sub>1</sub> ∪ a⁻¹L<sub>2</sub> ; a⁻¹(L*) = (a⁻¹L)·L* ; a⁻¹(L<sub>1</sub>L<sub>2</sub>) = (a⁻¹L<sub>1</sub>)L<sub>2</sub> si ε ∉ L<sub>1</sub>, et (a⁻¹L<sub>1</sub>)L<sub>2</sub> ∪ a⁻¹L<sub>2</sub> si ε ∈ L<sub>1</sub>",cle:"C'est le quotient par le mot u = a."},
 {op:"L<sup>−p</sup> (enlever la première lettre)",def:"L<sup>−p</sup> = { m | am ∈ L ou bm ∈ L }",src:"janvier 2023, questions 6 et 7 (corrigé officiel)",
  auto:"mêmes états, mêmes états d'arrivée, mêmes transitions ; seuls les états de départ changent : D = {δ(q<sub>d</sub>, a), δ(q<sub>d</sub>, b)} (l'automate peut ne plus être déterministe)",
  eq:"m ∈ L(A′) ⟺ δ*(δ(q<sub>d</sub>, a), m) ∈ A ou δ*(δ(q<sub>d</sub>, b), m) ∈ A ⟺ am ∈ L ou bm ∈ L ⟺ m ∈ L<sup>−p</sup>",
  regles:"(L<sub>1</sub> ∪ L<sub>2</sub>)<sup>−p</sup> = L<sub>1</sub><sup>−p</sup> ∪ L<sub>2</sub><sup>−p</sup> ; (L*)<sup>−p</sup> = L<sup>−p</sup>·L* ; (L<sub>1</sub>L<sub>2</sub>)<sup>−p</sup> = L<sub>1</sub><sup>−p</sup>L<sub>2</sub> si ε ∉ L<sub>1</sub>, et L<sub>1</sub><sup>−p</sup>L<sub>2</sub> ∪ L<sub>2</sub><sup>−p</sup> si ε ∈ L<sub>1</sub>",cle:"Deux départs possibles : après un a, ou après un b."},
 {op:"le miroir mir(L)",def:"mir(L) = { m<sup>R</sup> | m ∈ L }",src:"janvier 2024, questions 5 et 6 (corrigé officiel)",
  auto:"mêmes états ; on inverse le sens de toutes les transitions ; les états initiaux sont les états d'arrivée de A, et le seul état d'arrivée est q<sub>d</sub> (l'automate peut ne plus être déterministe)",
  eq:"un chemin de q<sub>d</sub> à un état d'arrivée qui lit m dans A, c'est, à l'envers, un chemin de cet état à q<sub>d</sub> qui lit m<sup>R</sup> dans A′ : m ∈ L ⟺ m<sup>R</sup> ∈ L(A′)",
  regles:"mir(L<sub>1</sub> ∪ L<sub>2</sub>) = mir(L<sub>1</sub>) ∪ mir(L<sub>2</sub>) ; mir(L<sub>1</sub>L<sub>2</sub>) = mir(L<sub>2</sub>)·mir(L<sub>1</sub>) ; mir(L*) = mir(L)*",cle:"On lit le mot à l'envers en suivant les flèches à l'envers."},
 {op:"L<sup>−d</sup> (enlever la dernière lettre)",def:"L<sup>−d</sup> = { m | ma ∈ L ou mb ∈ L }",src:"juin 2023, questions 5 et 6 (pas de corrigé officiel : corrigé écrit par moi)",
  auto:"mêmes états, même état initial, mêmes transitions ; les nouveaux états d'arrivée sont les états q tels que δ(q, a) ∈ A ou δ(q, b) ∈ A",
  eq:"m ∈ L(A′) ⟺ δ*(q<sub>d</sub>, m) = q avec δ(q, a) ∈ A ou δ(q, b) ∈ A ⟺ ma ∈ L ou mb ∈ L ⟺ m ∈ L<sup>−d</sup>",
  regles:"(L<sub>1</sub> ∪ L<sub>2</sub>)<sup>−d</sup> = L<sub>1</sub><sup>−d</sup> ∪ L<sub>2</sub><sup>−d</sup> ; (L*)<sup>−d</sup> = L*·L<sup>−d</sup> ; (L<sub>1</sub>L<sub>2</sub>)<sup>−d</sup> = L<sub>1</sub>L<sub>2</sub><sup>−d</sup> si ε ∉ L<sub>2</sub>, et L<sub>1</sub>L<sub>2</sub><sup>−d</sup> ∪ L<sub>1</sub><sup>−d</sup> si ε ∈ L<sub>2</sub>",cle:"Un mot est accepté s'il ne lui manque qu'une lettre pour arriver."},
 {op:"la fermeture préfixe Pref(L)",def:"Pref(L) = { m | il existe u tel que mu ∈ L } (les préfixes des mots de L)",src:"feuille 4 de cette année, exercice 4 (corrigé écrit par moi)",
  auto:"mêmes états, même état initial, mêmes transitions ; les nouveaux états d'arrivée sont tous les états depuis lesquels un chemin mène à un état d'arrivée de A",
  eq:"m ∈ Pref(L) ⟺ il existe u avec δ*(q<sub>d</sub>, mu) ∈ A ⟺ il existe u avec δ*(δ*(q<sub>d</sub>, m), u) ∈ A ⟺ δ*(q<sub>d</sub>, m) est un nouvel état d'arrivée ⟺ m ∈ L(A′)",
  regles:"Pref(L<sub>1</sub> ∪ L<sub>2</sub>) = Pref(L<sub>1</sub>) ∪ Pref(L<sub>2</sub>) ; Pref(L<sub>1</sub>L<sub>2</sub>) = Pref(L<sub>1</sub>) ∪ L<sub>1</sub>·Pref(L<sub>2</sub>) si L<sub>2</sub> ≠ ∅ ; Pref(L*) = L*·Pref(L) si L ≠ ∅",cle:"Un mot est un préfixe s'il reste un moyen de finir sur un état d'arrivée."}];
function preuve(R){const P=R.choix(PREUVES);
  return {sig:"P"+P.op,q:`Montre que si L est un langage reconnaissable, alors ${P.op.replace(/ \(.*\)$/,"")} est aussi reconnaissable. Puis exprime les règles de calcul.`,
    corps:`<p>Définition : ${P.def}. L est reconnu par un automate déterministe A = ⟨Σ, Q, q<sub>d</sub>, A, δ⟩ : définis précisément l'automate qui reconnaît le nouveau langage, puis justifie par une suite d'équivalences.</p><p class="muted">Sur ta feuille, puis compare avec la correction (${P.src}).</p>`,
    texte:"preuve : "+P.op.replace(/<[^>]+>/g,""),champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
    etapes:[{w:`On part d'un automate déterministe A qui reconnaît L (il existe, car L est reconnaissable).`,why:"C'est la définition de « reconnaissable » : un automate fini reconnaît L.",pts:0.5},
      {w:`L'automate A′ : ${P.auto}.`,why:P.cle,pts:1.5},{w:`Pour tout mot : ${P.eq}.`,why:"Chaque équivalence se justifie par une seule chose : la définition de δ*, puis celle du langage.",pts:1.5},
      {w:"Donc le nouveau langage est reconnu par A′ : il est reconnaissable.",why:"La phrase de conclusion est attendue.",pts:0.5},{w:`Les règles : ${P.regles}.`,why:"À savoir par cœur ; pour le produit, le cas ε ∈ L₁ (ou L₂) est celui qu'on oublie.",pts:1}],
    bonne:"voir la correction",bonneTxt:"à écrire sur papier (voir la correction)",repBonne:{},nature:P.op.replace(/<[^>]+>/g,""),ens:{type:"preuve",op:P.op}};}

/* ---------- AU7 : équations de langages (2023 à 2025, pas en 2026) ---------- */
const NUL={t:"0"},EPS={t:"e"},cle=t=>ecrit(t,false);
const Un=(x,y)=>x.t==="0"?y:y.t==="0"?x:cle(x)===cle(y)?x:x.t==="e"&&y.t==="s"?y:y.t==="e"&&x.t==="s"?x:{t:"u",l:x,r:y};
const Pr=(x,y)=>x.t==="0"||y.t==="0"?NUL:x.t==="e"?y:y.t==="e"?x:{t:"p",l:x,r:y};
const Et=x=>x.t==="0"||x.t==="e"?EPS:x.t==="s"?x:{t:"s",x};
const Li=i=>`L<sub>${i+1}</sub>`;
/* système : eq[i] = {c: {j: coefficient}, k: constante} */
function eqH(eq,i){const T=Object.keys(eq[i].c).map(Number).sort((x,y)=>x-y).map(j=>ecrit(eq[i].c[j],true,1)+"."+Li(j));
  if(eq[i].k.t!=="0")T.push(ecrit(eq[i].k,true,0));return `${Li(i)} = ${T.length?T.join(" + "):"∅"}`;}
const sysH=eq=>`<div class="formula">${eq.map((_,i)=>eqH(eq,i)).join("<br>")}</div>`;
const copie=eq=>eq.map(e=>({c:Object.assign({},e.c),k:e.k}));
function systeme(n,T,F){return [...Array(n)].map((_,i)=>{const c={};T.filter(t=>t[0]===i).forEach(([,l,j])=>{c[j]=c[j]?Un(c[j],{t:"c",c:l}):{t:"c",c:l};});return {c,k:F.includes(i)?EPS:NUL};});}
function pointFixe(eq,i){const a=eq[i].c[i];if(!a)return false;delete eq[i].c[i];const s=Et(a);Object.keys(eq[i].c).forEach(j=>{eq[i].c[j]=Pr(s,eq[i].c[j]);});eq[i].k=Pr(s,eq[i].k);return cle(a);}
function remplace(eq,k){eq.forEach((e,i)=>{if(i===k||!e.c[k])return;const g=e.c[k];delete e.c[k];Object.keys(eq[k].c).forEach(j=>{e.c[j]=e.c[j]?Un(e.c[j],Pr(g,eq[k].c[j])):Pr(g,eq[k].c[j]);});e.k=Un(e.k,Pr(g,eq[k].k));});}
function resous(eq0){const eq=copie(eq0),n=eq.length,E=[];
  for(let k=n-1;k>=1;k--){const a=pointFixe(eq,k);if(a)E.push({w:`Point fixe pour ${Li(k)} : ${eqH(eq,k)}.`,why:`L'équation est de la forme ${Li(k)} = α.${Li(k)} + β avec α = ${erH(a)} : sa solution est α*β.`,pts:1});
    remplace(eq,k);E.push({w:`On remplace ${Li(k)} : ${eq.slice(0,k).map((_,i)=>eqH(eq,i)).join(" ; ")}.`,why:`${Li(k)} ne dépend plus que des autres inconnues : on le remplace par son expression partout où il apparaît.`,pts:1});}
  const a=pointFixe(eq,0);E.push({w:`${a?"Point fixe pour L<sub>1</sub> : ":""}${eqH(eq,0)}.`,why:a?`L<sub>1</sub> = α.L<sub>1</sub> + β avec α = ${erH(a)}, donc L<sub>1</sub> = α*β.`:"Il ne reste plus d'inconnue à droite : c'est le résultat.",pts:1});
  return {t:eq[0].k,E};}
const RAPPEL_EQ=`<p class="muted">Méthode du cours (corrigé de janvier 2023) : on élimine les inconnues une à une, en remplaçant chacune par son expression. Une équation L = α.L + β, où α ne contient pas ε, a pour solution L = α*β (le « point fixe »). Tape + pour « ou », * pour l'étoile, e pour ε.</p>`;
const par=s=>s.includes("+")?"("+s+")":s;
function uneEquation(R){let al,be,droite,sol,autre;
  for(let t=0;;t++){al=R.choix(["a","b","ab","a + b","ba","aa","(a + b)b","bb"]);be=R.choix(["b","a","ba","bb","a + b","ab","ε"]);droite=R()<0.5;
    const A=lisER(al),B=lisER(be),g=cle(Pr(B,Et(A))),d=cle(Pr(Et(A),B));sol=droite?g:d;autre=droite?d:g;if(!memeL(sol,autre)||t>50)break;}
  const ref=autoDe(sol),eq=droite?`L = L.${erH(par(al))} + ${erH(be)}`:`L = ${erH(par(al))}.L + ${erH(be)}`;
  const juge=rep=>{const j=jugeER(rep.e,ref,null,"la solution");if(j.ok||j.incomplet)return j;return {ok:false,resume:"Pas tout à fait : "+j.msg+".",diag:{etape:0,type:"point fixe mal appliqué",titre:droite?"Ici, l'inconnue L est à gauche de α.":"Ici, l'inconnue L est à droite de α.",msg:Maj(j.msg)+`. ${droite?"Pour L = L.α + β, la solution est βα* (janvier 2023).":"Pour L = α.L + β, la solution est α*β."}`}};};
  return {sig:"EQ1"+al+be+droite,q:`Donne une expression régulière de L, solution de l'équation ${eq}.`,corps:RAPPEL_EQ+(droite?`<p class="muted">Ici L est à gauche du coefficient : c'est la forme de janvier 2023.</p>`:""),texte:`${droite?"L = Lα + β":"L = αL + β"}, α = ${al}, β = ${be}`,champs:[{k:"champ",id:"e",label:"L =",sym:SYM,apercu:false,ex:"a*b",aide:AIDE_ER}],juge,
    etapes:[{w:`L = ${erH(sol)}.`,why:droite?"Pour L = L.α + β, la solution est L = βα* : β, puis des α à droite.":"Pour L = α.L + β, la solution est L = α*β : des α, puis un β pour finir.",pts:1},
      {w:droite?`Vérification : L.α + β = β.α*.α + β = β.(α*.α + ε) = β.α* = L.`:`Vérification : α.L + β = α.α*.β + β = (α.α* + ε).β = α*.β = L.`,why:"C'est la preuve du corrigé de janvier 2023 : α*.α + ε = α*.",pts:1}],
    bonne:erH(sol),bonneTxt:erT(sol),repBonne:{e:erT(sol)},repFausse:{e:autre},nature:"équation",ens:{type:"eq1",al,be,droite,sol:erT(sol)}};}
const SYS_SUJETS=[
 {src:"juin 2024, question 3",n:3,T:[[0,"a",2],[1,"b",0],[1,"a",1],[2,"a",1],[2,"b",1]],F:[0,2]},
 {src:"janvier 2024, question 3",n:3,T:[[0,"a",0],[0,"a",1],[0,"b",2],[1,"a",0],[1,"a",1],[2,"b",0],[2,"a",1]],F:[2]},
 {src:"janvier 2023, question 4",n:3,T:[[0,"b",0],[0,"a",1],[1,"a",1],[1,"b",2],[2,"b",0]],F:[0,1,2]},
 {src:"janvier 2025, question 2",n:3,T:[[0,"a",0],[0,"a",1],[0,"b",1],[1,"a",0],[1,"b",2],[2,"a",1],[2,"b",2]],F:[0]}];
const autoSys=S=>auto([...Array(S.n)].map((_,i)=>String(i+1)),["1"],S.F.map(i=>String(i+1)),S.T.map(([p,c,q])=>[String(p+1),c,String(q+1)]));
function sysHasard(R,n,det){for(let t=0;;t++){const T=[];
  for(let p=0;p<n;p++)for(const c of AB){const k=det?(R()<0.2?0:1):(R()<0.2?0:R()<0.75?1:2);R.mel([...Array(n).keys()]).slice(0,k).forEach(q=>T.push([p,c,q]));}
  const F=[...Array(n).keys()].filter(()=>R()<0.4);if(!F.length&&t<200)continue;
  const S={n,T,F},A=autoSys(S),vu=new Set([0]),P=[0];while(P.length){const p=P.pop();AB.forEach(c=>(A.d[p][c]||[]).forEach(q=>{if(!vu.has(q)){vu.add(q);P.push(q);}}));}
  const M=minimal(A);if((vu.size<n||M.n<2||!M.fin.some(Boolean)||!det&&!A.d.some(x=>AB.some(c=>(x[c]||[]).length>1)))&&t<300)continue;
  const L=cle(resous(systeme(n,T,F)).t).length;if((L>(n===2?28:46)||L<4)&&t<300)continue;return S;}}
function resoudre(R,n,sujets){const S=sujets&&R()<0.35?R.choix(SYS_SUJETS):sysHasard(R,n,R()<0.6),A=autoSys(S),eq=systeme(S.n,S.T,S.F),r=resous(eq),sol=cle(r.t);
  const juge=rep=>{const j=jugeER(rep.e,A,null,"L<sub>1</sub>");if(j.ok||j.incomplet)return j;return {ok:false,resume:"Pas tout à fait : "+j.msg+".",diag:{etape:0,type:j.d.dansA?"expression trop large":"expression trop étroite",titre:`Vérifie ${mot(j.d.w)} dans le système.`,msg:Maj(j.msg)+`. Un mot est dans L<sub>1</sub> quand on peut le lire en suivant les équations depuis L<sub>1</sub> (a.L<sub>2</sub> : lire a, puis un mot de L<sub>2</sub>) jusqu'à un « + ε ».`}};};
  return {sig:"EQ"+S.n+JSON.stringify(S.T)+S.F,q:`Soit L<sub>1</sub> le langage défini par les ${S.n===2?"deux":"trois"} équations ci-dessous. Décris L<sub>1</sub> par une expression régulière.`,corps:sysH(eq)+(S.src?`<p class="muted">Le système de ${S.src}.</p>`:"")+RAPPEL_EQ,texte:"système : "+eq.map((_,i)=>eqH(eq,i)).join(" ; ").replace(/<[^>]+>/g,""),
    champs:[{k:"champ",id:"e",label:"L₁ =",sym:SYM,apercu:false,ex:"(a + ab)*b",aide:AIDE_ER}],juge,
    etapes:[...r.E,{w:`Donc L<sub>1</sub> = ${erH(sol)}.`,why:"Une autre expression du même langage est acceptée : le site compare les langages mot par mot.",pts:1}],
    bonne:erH(sol),bonneTxt:sol,repBonne:{e:sol},repFausse:{e:sol==="(a + b)*"?"a*":"(a + b)*"},nature:S.src||"système",ens:{type:"sys",n:S.n,T:S.T,F:S.F,sol}};}
function versAFD(R,det){const S=det?(R()<0.3?SYS_SUJETS[0]:sysHasard(R,3,true)):(R()<0.3?R.choix([SYS_SUJETS[1],SYS_SUJETS[3]]):sysHasard(R,3,false)),A=autoSys(S),eq=systeme(S.n,S.T,S.F),M=minimal(A),noms=qn(M.n);
  return {sig:"EA"+det+JSON.stringify(S.T)+S.F,q:`Soit L<sub>1</sub> le langage défini par les ${S.n} équations ci-dessous. Décris L<sub>1</sub> par un automate déterministe et complet.`,
    corps:sysH(eq)+(S.src?`<p class="muted">Le système de ${S.src}.</p>`:"")+`<p class="muted">Une équation par état : a.L<sub>j</sub> dans l'équation de L<sub>i</sub> veut dire une flèche a de l'état i vers l'état j, et « + ε » veut dire que l'état i est acceptant ; L<sub>1</sub> est l'état de départ. ${det?"Une lettre absente d'une équation mène au puits.":"Ici, une lettre mène parfois à deux inconnues : l'automate direct n'est pas déterministe, il faut le déterminiser."} ${AIDE_AFD}</p>`,
    texte:"automate du système : "+eq.map((_,i)=>eqH(eq,i)).join(" ; ").replace(/<[^>]+>/g,""),
    champs:[{k:"trace",id:"t",vars:VARS_AFD,rangs:true,serre:true,lignes:3}],juge:rep=>jugeAFD(rep,A,null,{quoi:"L<sub>1</sub>"}),
    etapes:[{w:"L'automate direct, un état par équation :"+dessin(A),why:det?"a.L<sub>j</sub> dans l'équation de L<sub>i</sub> : flèche a de i vers j ; « + ε » : état acceptant.":"Même lecture des équations ; une lettre qui mène à deux inconnues donne deux flèches : l'automate n'est pas déterministe.",pts:1},
      ...(det?[]:[{w:"On le déterminise par la méthode des ensembles (leçon « Déterminiser »), et on fusionne les états qui ont le même avenir.",why:"Janvier 2024 demande d'abord l'automate non déterministe, puis le déterministe.",pts:1}]),
      ...etapesAFD(M,noms,det?"Les lettres absentes vont dans un puits, pour que l'automate soit complet.":"Chaque état regroupe des états de l'automate direct.")],
    bonne:"voir l'automate de la correction",bonneTxt:M.T.map((t,i)=>`${noms[i]}: a→${noms[t.a]} b→${noms[t.b]}${M.fin[i]?" acceptant":""}`).join(" ; "),
    repBonne:{t:M.T.map((t,i)=>[noms[i],noms[t.a],noms[t.b],M.fin[i]?"oui":"non"])},repFausse:{t:M.T.map((t,i)=>[noms[i],noms[t.a],noms[t.b],M.fin[i]?"non":"oui"])},nature:S.src||"système",ens:{type:"sysA",n:S.n,T:S.T,F:S.F}};}
function preuveEq(R){const gauche=R()<0.5;
  return {sig:"EQP"+gauche,q:gauche?"Soit l'équation L = L.α + β où α et β sont des expressions régulières ne contenant pas d'occurrence de L. Donnez une valeur de L (dépendant de α et β) qui satisfait cette équation. Prouvez votre réponse.":"Montrez que L = α*β est solution de l'équation L = α.L + β, où α et β sont des expressions régulières.",
    corps:`<p class="muted">${gauche?"Janvier 2023, question 3 (2 points), corrigé officiel":"Feuille 4 de cette année, exercice 2 (corrigé écrit par moi, sur le modèle de janvier 2023)"}. Sur ta feuille, puis compare.</p>`,texte:gauche?"preuve L = Lα + β":"preuve L = αL + β",champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
    etapes:gauche?[{w:"Une solution : L = β.α*.",why:"β d'abord, puis des α : l'inconnue L est à gauche de α dans l'équation.",pts:0.5},{w:"On remplace L par β.α* dans le membre de droite : L.α + β = β.α*.α + β.",why:"On vérifie que la valeur proposée satisfait l'équation.",pts:0.5},{w:"= β.(α*.α + ε) = β.α* = L.",why:"On met β en facteur à gauche (β = β.ε), puis α*.α + ε = α* : zéro α, ou au moins un.",pts:1}]
      :[{w:"On remplace L par α*β dans le membre de droite : α.L + β = α.α*.β + β.",why:"Montrer qu'une valeur est solution, c'est la remettre dans l'équation.",pts:0.5},{w:"= (α.α* + ε).β",why:"On met β en facteur à droite (β = ε.β).",pts:0.5},{w:"= α*.β = L, car α.α* + ε = α* (au moins un α, ou aucun).",why:"Donc α*β est bien solution.",pts:1}],
    bonne:"voir la correction",bonneTxt:"à écrire sur papier (voir la correction)",repBonne:{},nature:"preuve du point fixe",ens:{type:"preuveEq",gauche}};}

/* ---------- AU8 : l'automate combiné (janvier 2025 : union, intersection, différence, inclusion, égalité) ---------- */
const OPS={u:["L(A<sub>1</sub>) ∪ L(A<sub>2</sub>)",(x,y)=>x||y,"un des deux états est d'arrivée (dans A<sub>1</sub> ou dans A<sub>2</sub>)"],i:["L(A<sub>1</sub>) ∩ L(A<sub>2</sub>)",(x,y)=>x&&y,"les deux états sont d'arrivée"],d:["L(A<sub>1</sub>) \\ L(A<sub>2</sub>)",(x,y)=>x&&!y,"l'état de A<sub>1</sub> est d'arrivée et celui de A<sub>2</sub> ne l'est pas"]};
let PETITS=null;const petits=()=>PETITS||(PETITS=["pa","ia","da","fb","aa","abf","nab","bbs","lp","li","b2","u1a","nbb","asb","x2a","m3","f2"].filter(id=>minDe(L_[id][1]).n<=3));
function combine(M1,M2){const k=(i,j)=>i+","+j,V=new Map([[k(0,0),0]]),E=[[0,0]],acc=[""],T=[];
  for(let x=0;x<E.length;x++){const [i,j]=E[x],t={};for(const c of AB){const p=[M1.T[i][c],M2.T[j][c]];if(!V.has(k(...p))){V.set(k(...p),E.length);E.push(p);acc.push(acc[x]+c);}t[c]=V.get(k(...p));}T.push(t);}
  return {E,T,acc};}
const nomsC=(C,n1)=>C.E.map(([i,j])=>`${i+1},${j+n1+1}`);
const autoC=(C,n1,fin)=>{const N=nomsC(C,n1);return auto(N,[N[0]],N.filter((_,x)=>fin[x]),C.T.flatMap((t,x)=>AB.map(c=>[N[x],c,N[t[c]]])));};
const dessinM=(M,off)=>dessin(versAuto(M,[...Array(M.n)].map((_,i)=>String(i+1+off))));
const DEF_C=`<p class="muted">Définition de janvier 2025 : l'automate combiné de deux automates déterministes et complets A<sub>1</sub> et A<sub>2</sub> a pour états les couples (q<sub>1</sub>, q<sub>2</sub>), pour départ (d<sub>1</sub>, d<sub>2</sub>), et δ<sub>3</sub>((q<sub>1</sub>, q<sub>2</sub>), a) = (δ<sub>1</sub>(q<sub>1</sub>, a), δ<sub>2</sub>(q<sub>2</sub>, a)) : on lit le mot dans les deux automates en même temps. Seuls ses états d'arrivée changent selon l'opération. Un état « 1,4 » veut dire : en 1 dans A<sub>1</sub> et en 4 dans A<sub>2</sub>.</p>`;
function deuxAuto(R){const ids=R.mel(petits()).slice(0,2),M1=minDe(L_[ids[0]][1]),M2=minDe(L_[ids[1]][1]);return {ids,M1,M2};}
function etatsArrivee(R){let ids,M1,M2,C,op,fin;for(let t=0;;t++){({ids,M1,M2}=deuxAuto(R));C=combine(M1,M2);op=R.choix(["u","i","d"]);fin=C.E.map(([i,j])=>OPS[op][1](M1.fin[i],M2.fin[j]));
    if(C.E.length>=3&&C.E.length<=6&&fin.some(Boolean)&&!fin.every(Boolean)||t>80)break;}
  const [nomOp,f,regle]=OPS[op],N=nomsC(C,M1.n),ok=N.filter((_,x)=>fin[x]);
  const juge=rep=>{const T=(rep.v||[]).map(Number);if(!T.length&&ok.length)return {incomplet:"Coche au moins un état."};
    const trop=T.filter(x=>!fin[x]),manque=fin.map((v,x)=>v?x:-1).filter(x=>x>=0&&!T.includes(x));if(!trop.length&&!manque.length)return {ok:true};
    const x=trop.length?trop[0]:manque[0],[i,j]=C.E[x];
    return {ok:false,resume:`Pas tout à fait : l'état ${N[x]} ${trop.length?"ne doit pas":"doit"} être d'arrivée.`,diag:{etape:0,type:trop.length?"état d'arrivée en trop":"état d'arrivée oublié",titre:`L'état ${N[x]}.`,msg:`${i+1} ${M1.fin[i]?"est":"n'est pas"} d'arrivée dans A<sub>1</sub>, ${j+M1.n+1} ${M2.fin[j]?"est":"n'est pas"} d'arrivée dans A<sub>2</sub>. Pour ${nomOp}, il faut que ${regle}.`}};};
  return {sig:"C1"+ids+op,q:`Voici A<sub>1</sub>, A<sub>2</sub> et leur automate combiné. Quels états du combiné doivent être d'arrivée pour qu'il reconnaisse ${nomOp} ?`,
    corps:`<p>A<sub>1</sub> (${L_[ids[0]][0]}) :</p>${dessinM(M1,0)}<p>A<sub>2</sub> (${L_[ids[1]][0]}) :</p>${dessinM(M2,M1.n)}<p>L'automate combiné, sans ses états d'arrivée :</p>${dessin(autoC(C,M1.n,fin.map(()=>false)))}${DEF_C}`,
    texte:`combiné ${ids.join("×")} pour ${op}`,champs:[{k:"multi",id:"v",o:N.map((n,x)=>[String(x),n])}],juge,
    etapes:[{w:`États d'arrivée : ${ok.length?ok.join(" ; "):"aucun"}.`,why:`Pour ${nomOp}, (q<sub>1</sub>, q<sub>2</sub>) est d'arrivée quand ${regle} (corrigé de janvier 2025, question 3).`,pts:1},
      ...N.map((n,x)=>({w:`${n} : ${fin[x]?"oui":"non"}.`,why:`${C.E[x][0]+1} ${M1.fin[C.E[x][0]]?"est":"n'est pas"} d'arrivée dans A<sub>1</sub> ; ${C.E[x][1]+M1.n+1} ${M2.fin[C.E[x][1]]?"est":"n'est pas"} d'arrivée dans A<sub>2</sub>.`,pts:1}))],
    bonne:ok.join(" ; ")||"aucun",bonneTxt:ok.join(" ; ")||"aucun",repBonne:{v:fin.map((v,x)=>v?String(x):null).filter(x=>x!==null)},repFausse:{v:fin.map((v,x)=>v?null:String(x)).filter(x=>x!==null).slice(0,1)},nature:"états d'arrivée "+op,
    ens:{type:"arrivee",op,A1:M1.T.map(t=>[t.a,t.b]),F1:M1.fin,A2:M2.T.map(t=>[t.a,t.b]),F2:M2.fin,acc:C.acc,fin}};}
function construireC(R){let ids,M1,M2,C;for(let t=0;;t++){({ids,M1,M2}=deuxAuto(R));C=combine(M1,M2);if(C.E.length>=3&&C.E.length<=6||t>40)break;}
  const op=R.choix(["u","i","d"]),[nomOp,f,regle]=OPS[op],N=nomsC(C,M1.n),fin=C.E.map(([i,j])=>f(M1.fin[i],M2.fin[j])),A=autoC(C,M1.n,fin);
  return {sig:"C2"+ids+op,q:`Construis l'automate combiné de A<sub>1</sub> et A<sub>2</sub>, avec les états d'arrivée qui lui font reconnaître ${nomOp}.`,
    corps:`<p>A<sub>1</sub> (${L_[ids[0]][0]}) :</p>${dessinM(M1,0)}<p>A<sub>2</sub> (${L_[ids[1]][0]}) :</p>${dessinM(M2,M1.n)}${DEF_C}<p class="muted">Pars de « 1,${M1.n+1} » et ne garde que les couples atteints. ${AIDE_AFD}</p>`,
    texte:`construire combiné ${ids.join("×")} pour ${op}`,champs:[{k:"trace",id:"t",vars:VARS_AFD,rangs:true,serre:true,lignes:3}],juge:rep=>jugeAFD(rep,A,null,{quoi:nomOp}),
    etapes:[{w:"L'automate combiné :"+dessin(A),why:`On lit chaque lettre dans A<sub>1</sub> et dans A<sub>2</sub> à la fois. Un couple est d'arrivée quand ${regle}.`,pts:1},
      ...C.T.map((t,x)=>({w:`${N[x]}${fin[x]?" (arrivée)":""} : avec a → ${N[t.a]}, avec b → ${N[t.b]}.`,why:x?`Atteint par ${C.acc[x]}.`:"Le départ : les deux états de départ.",pts:1}))],
    bonne:"voir l'automate de la correction",bonneTxt:C.T.map((t,x)=>`${N[x]}: a→${N[t.a]} b→${N[t.b]}${fin[x]?" arrivée":""}`).join(" ; "),
    repBonne:{t:C.T.map((t,x)=>[N[x],N[t.a],N[t.b],fin[x]?"oui":"non"])},repFausse:{t:C.T.map((t,x)=>[N[x],N[t.a],N[t.b],fin[x]?"non":"oui"])},nature:"construire "+op,
    ens:{type:"combine",op,A1:M1.T.map(t=>[t.a,t.b]),F1:M1.fin,A2:M2.T.map(t=>[t.a,t.b]),F2:M2.fin}};}
/* un automate du même langage, mais avec un état dédoublé : il ne se reconnaît pas à l'œil */
function dedouble(R,M){const T=M.T.map(t=>({a:t.a,b:t.b})),fin=M.fin.slice(),arr=[];T.forEach((t,p)=>AB.forEach(c=>{if(p!==t[c]||M.n===1)arr.push([p,c]);}));
  if(!arr.length)return M;const [p,c]=R.choix(arr),q=T[p][c];T.push({a:T[q].a,b:T[q].b});fin.push(fin[q]);T[p][c]=M.n;return {n:M.n+1,T,fin};}
let INCL=null;const inclus=()=>INCL||(INCL=petits().flatMap(x=>petits().filter(y=>{if(x===y)return false;const A=minDe(L_[x][1]),B=minDe(L_[y][1]),C=combine(A,B);return C.E.every(([i,j])=>!A.fin[i]||B.fin[j]);}).map(y=>[x,y])));
function lisReponse(src){const s=nettoie(src).toLowerCase();if(!s)return null;if(/^(oui|o|vrai|inclus|égaux|egaux)$/.test(s))return true;if(/^(ε|e|eps|epsilon|mot vide)$/.test(s))return "";if(/^[ab]+$/.test(s))return s;return null;}
const litM=(M,w)=>{let q=0;for(const c of w)q=M.T[q][c];return M.fin[q];};
function testeC(R,egal){let ids,M1,M2,C,F,vrai;
  for(let t=0;;t++){({ids,M1,M2}=deuxAuto(R));if(egal&&R()<0.45){M2=dedouble(R,M1);ids=[ids[0],ids[0]+"′"];}
    else if(!egal&&R()<0.5){const inc=inclus();if(inc.length){ids=R.choix(inc);M1=minDe(L_[ids[0]][1]);M2=minDe(L_[ids[1]][1]);}}
    C=combine(M1,M2);if(C.E.length<=6||t>40)break;}
  F=C.E.map(([i,j])=>egal?M1.fin[i]!==M2.fin[j]:M1.fin[i]&&!M2.fin[j]);const x=F.findIndex(Boolean);vrai=x<0;const N=nomsC(C,M1.n),temoin=vrai?null:C.acc[x];
  const quoi=egal?"L(A<sub>1</sub>) = L(A<sub>2</sub>)":"L(A<sub>1</sub>) ⊆ L(A<sub>2</sub>)";
  const juge=rep=>{const r=lisReponse(rep.e);if(r===null)return {incomplet:`Écris « oui », ou un mot qui montre que non (ε pour le mot vide).`};
    if(r===true)return vrai?{ok:true}:{ok:false,resume:`Non : ${mot(temoin)} ${egal?"est dans un seul des deux langages":"est dans L(A<sub>1</sub>) mais pas dans L(A<sub>2</sub>)"}.`,diag:{etape:1,type:"mauvaise conclusion",titre:`L'état ${N[x]} est atteint.`,msg:`Dans le combiné, ${mot(temoin)} mène de ${N[0]} à ${N[x]}, qui est d'arrivée pour ${egal?"la différence dans un sens ou dans l'autre":"L(A<sub>1</sub>) \\ L(A<sub>2</sub>)"} : la différence n'est pas vide.`}};
    const a=litM(M1,r),b=litM(M2,r);if(egal?a!==b:a&&!b)return {ok:true};
    return {ok:false,resume:vrai?`Ici la réponse est oui : aucun mot ne sépare les deux langages.`:`${mot(r)} ne le montre pas : il est ${a?"":"refusé "}${a?"accepté ":""}par A<sub>1</sub> et ${b?"accepté":"refusé"} par A<sub>2</sub>.`,diag:{etape:1,type:vrai?"mauvaise conclusion":"mauvais témoin",titre:`Lis ${mot(r)} dans les deux automates.`,msg:vrai?`Aucun état atteint du combiné n'est d'arrivée pour ${egal?"les deux différences":"L(A<sub>1</sub>) \\ L(A<sub>2</sub>)"} : la réponse est oui.`:`Il faut un mot ${egal?"accepté par un seul des deux":"accepté par A<sub>1</sub> et refusé par A<sub>2</sub>"}, par exemple ${mot(temoin)}.`}};};
  return {sig:"C"+(egal?4:3)+ids+M2.n+JSON.stringify(M2.T),q:`A-t-on ${quoi} ? Réponds en utilisant l'automate combiné : écris « oui », ou un mot qui montre que non.`,
    corps:`<p>A<sub>1</sub> :</p>${dessinM(M1,0)}<p>A<sub>2</sub> :</p>${dessin(versAuto(M2,[...Array(M2.n)].map((_,i)=>String(i+M1.n+1))))}${DEF_C}<p class="muted">${egal?"Janvier 2025, question 5 : L(A<sub>1</sub>) = L(A<sub>2</sub>) quand les deux différences L(A<sub>1</sub>) \\ L(A<sub>2</sub>) et L(A<sub>2</sub>) \\ L(A<sub>1</sub>) sont vides.":"Janvier 2025, question 4 : L(A<sub>1</sub>) ⊆ L(A<sub>2</sub>) quand L(A<sub>1</sub>) \\ L(A<sub>2</sub>) est vide."}</p>`,
    texte:`${egal?"égalité":"inclusion"} ${ids.join(" ")}`,champs:[{k:"champ",id:"e",label:"Réponse :",sym:[["ε","ε"]],apercu:false,ex:"oui, ou ab",aide:"« oui », ou un mot (ε pour le mot vide)."}],juge,
    etapes:[{w:"L'automate combiné (couples atteints) :"+dessin(autoC(C,M1.n,F)),why:egal?"États d'arrivée : les couples où un seul des deux états est d'arrivée (les deux différences à la fois).":"États d'arrivée : ceux de L(A<sub>1</sub>) \\ L(A<sub>2</sub>), état de A<sub>1</sub> d'arrivée et état de A<sub>2</sub> non.",pts:1.5},
      {w:vrai?`Aucun état atteint n'est d'arrivée : la différence est vide, donc oui, ${quoi}.`:`L'état ${N[x]} est atteint par ${mot(temoin)} : la différence n'est pas vide, donc non.`,why:vrai?"Il n'y a pas de chemin du départ à un état d'arrivée (corrigé de janvier 2025).":`${mot(temoin)} est accepté par ${M1.fin[C.E[x][0]]?"A<sub>1</sub> et refusé par A<sub>2</sub>":"A<sub>2</sub> et refusé par A<sub>1</sub>"}.`,pts:1.5}],
    bonne:vrai?"oui":mot(temoin),bonneTxt:vrai?"oui":mot(temoin),repBonne:{e:vrai?"oui":temoin===""?"ε":temoin},repFausse:{e:vrai?"ab":"oui"},nature:egal?"égalité":"inclusion",
    ens:{type:egal?"egal":"inclus",A1:M1.T.map(t=>[t.a,t.b]),F1:M1.fin,A2:M2.T.map(t=>[t.a,t.b]),F2:M2.fin,vrai}};}
function methodeC(){const A3=dessin(auto(["1","2","3"],["1"],["3"],[["1","a","2"],["1","b","1"],["2","a","2"],["2","b","3"],["3","a","2"],["3","b","1"]])),A4=dessin(auto(["4","5"],["4"],["4"],[["4","b","4"],["4","a","5"],["5","a","5"],["5","b","4"]]));
  return {sig:"C5",q:"Janvier 2025, questions 3 à 5 : l'automate combiné pour l'union, l'intersection, la différence, l'inclusion et l'égalité.",
    corps:`${DEF_C}<p><b>Question 3 (1,5 point).</b> Rappelez comment définir les états d'arrivée A<sub>3</sub> de l'automate combiné pour qu'il reconnaisse : 1. L(A<sub>1</sub>) ∪ L(A<sub>2</sub>) ; 2. L(A<sub>1</sub>) ∩ L(A<sub>2</sub>) ; 3. L(A<sub>1</sub>) \\ L(A<sub>2</sub>) = {m ∈ L(A<sub>1</sub>) | m ∉ L(A<sub>2</sub>)}.</p>
<p><b>Question 4 (3 points).</b> Expliquez précisément comment utiliser l'automate combiné de A<sub>1</sub> et A<sub>2</sub> pour vérifier si L(A<sub>1</sub>) ⊆ L(A<sub>2</sub>). Indiquez en particulier quelle opération parmi les trois ci-dessus vous utilisez. Appliquez cette méthode pour vérifier si L(A<sub>3</sub>) ⊆ L(A<sub>4</sub>), où A<sub>3</sub> et A<sub>4</sub> sont les automates ci-dessous. Toute réponse n'utilisant pas l'automate combiné sera ignorée.</p><p>A<sub>3</sub> :</p>${A3}<p>A<sub>4</sub> :</p>${A4}
<p><b>Question 5 (3 points).</b> Décrivez une méthode basée sur l'automate combiné permettant de vérifier si les langages reconnus par deux automates sont identiques. Appliquez-la pour vérifier si L(A<sub>3</sub>) = L(A<sub>4</sub>).</p><p class="muted">Sur ta feuille, puis compare avec le corrigé officiel.</p>`,
    texte:"janvier 2025 questions 3 à 5",champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
    etapes:[{w:"Q3 : union, A<sub>3</sub> = (A<sub>1</sub> × Q<sub>2</sub>) ∪ (Q<sub>1</sub> × A<sub>2</sub>) ; intersection, A<sub>3</sub> = A<sub>1</sub> × A<sub>2</sub> ; différence, A<sub>3</sub> = A<sub>1</sub> × (Q<sub>2</sub> \\ A<sub>2</sub>).",why:"Un couple est d'arrivée quand le mot lu est accepté par l'un, par les deux, ou par le premier seulement.",pts:1.5},
      {w:"Q4 : L(A<sub>1</sub>) ⊆ L(A<sub>2</sub>) ⟺ L(A<sub>1</sub>) \\ L(A<sub>2</sub>) = ∅. On construit le combiné avec les états d'arrivée de la différence, et on vérifie qu'aucun chemin ne mène du départ à un état d'arrivée.",why:"C'est l'opération « différence » de la question 3.",pts:1},
      {w:"Sur l'exemple : depuis (1,4), on atteint seulement (1,4), (2,5) et (3,4). L'état d'arrivée de la différence est (3,5), jamais atteint : L(A<sub>3</sub>) \\ L(A<sub>4</sub>) = ∅, donc L(A<sub>3</sub>) ⊆ L(A<sub>4</sub>).",why:"A<sub>3</sub> reconnaît les mots qui finissent par ab, A<sub>4</sub> ceux qui finissent par b (et ε). Autre solution du corrigé : vérifier que L(A<sub>3</sub>) ∩ L(A<sub>4</sub>) = L(A<sub>3</sub>).",pts:2},
      {w:"Q5 : L(A<sub>1</sub>) = L(A<sub>2</sub>) ⟺ L(A<sub>1</sub>) ⊆ L(A<sub>2</sub>) et L(A<sub>2</sub>) ⊆ L(A<sub>1</sub>). Il reste L(A<sub>4</sub>) ⊆ L(A<sub>3</sub>) : états d'arrivée (1,4) et (2,4).",why:"Deux inclusions, donc deux différences vides.",pts:1.5},
      {w:"(1,4) est le départ et il est d'arrivée : L(A<sub>4</sub>) \\ L(A<sub>3</sub>) ≠ ∅ (le mot ε), donc L(A<sub>3</sub>) ≠ L(A<sub>4</sub>).",why:"ε est accepté par A<sub>4</sub> et refusé par A<sub>3</sub>.",pts:1.5}],
    bonne:"voir la correction",bonneTxt:"à écrire sur papier (voir la correction)",repBonne:{},nature:"janvier 2025",ens:{type:"methodeC"}};}

G.add("aut",[
 {id:"AU6",lecons:["au-quotients"],t:"Quotients à gauche (et les autres opérations sur les langages)",tache:"quotients à gauche",th:"quotients",pts:9,
  paliers:[
   {t:"un langage fini : La et Lb",cc:3,gen:R=>quotientsFinis(R,false)},
   {t:"un langage décrit en français : La et Lb en expressions",cc:4,gen:R=>quotientsER(R,{decrit:true}),min:11},
   {t:"le quotient d'une expression régulière",cc:3,gen:R=>quotientsER(R,{}),min:30},
   {t:"tous les quotients, puis l'automate qu'ils forment",cc:5,gen:R=>tousQuotients(R,0),min:6},
   {t:"la démonstration « reconnaissable » et les règles, sur papier",cc:5,gen:preuve,min:5},
   {t:"un langage fini : quotients par deux lettres",cc:3,gen:R=>quotientsFinis(R,true)},
   {t:"tous les quotients, d'autres langages",cc:5,gen:R=>tousQuotients(R,1),min:6}]},
 {id:"AU5",lecons:["au-det"],t:"Déterminiser un automate",tache:"déterminisation",th:"det",pts:3,
  paliers:[
   {t:"trois états, comme en janvier 2026",cc:5,gen:R=>determiniser(R,3,false)},
   {t:"quatre états",cc:6,gen:R=>determiniser(R,4,false)},
   {t:"déterminiser, puis le complémentaire",cc:6,gen:R=>determiniser(R,R.ent(3,4),true)}]},
 {id:"AU3",lecons:["au-er"],t:"Expressions régulières",tache:"expressions régulières",th:"er",pts:3.5,
  paliers:[
   {t:"les mots d'une expression",cc:2,gen:motsER},
   {t:"QCM : quelles expressions décrivent ce langage ?",cc:3,gen:qcmER},
   {t:"écrire l'expression d'un langage décrit",cc:3,gen:R=>ecrireER(R),min:22}]},
 {id:"AU4",lecons:["au-construire"],t:"Construire un automate déterministe complet",tache:"construire un automate",th:"construire",pts:2,
  paliers:[
   {t:"un langage simple",cc:3,gen:R=>construire(R,["pa","ia","da","fb","aa","abf","bbs","lp","nab","asb"],false),min:10},
   {t:"avec le nombre d'états imposé",cc:3,gen:R=>construire(R,["b2","m3","a3","x2a","u1a","aea","nbb","li"],true),min:8},
   {t:"les langages des sujets (2023 à 2026)",cc:5,gen:R=>construire(R,["imp","un","abba","lex","ab1","pre","f2","papb"],false),min:8}]},
 {id:"AU2",lecons:["au-lire"],t:"Lire un automate",tache:"lire un automate",th:"lire",pts:1.25,
  paliers:[
   {t:"les mots acceptés par un automate déterministe",cc:2,gen:R=>motsAcceptes(R,true)},
   {t:"les mots acceptés par un automate non déterministe",cc:3,gen:R=>motsAcceptes(R,false)},
   {t:"les états atteints en lisant un mot",cc:2,gen:etatsAtteints}]},
 {id:"AU1",lecons:["au-mots"],t:"Mots : préfixe, suffixe, facteur, sous-mot, ordre",tache:"mots",th:"mots",pts:1.25,
  paliers:[
   {t:"préfixes, suffixes, facteurs, sous-mots",cc:2,gen:relMots},
   {t:"QCM : les sous-mots, comme en janvier 2026",cc:2,gen:sousMotsQcm},
   {t:"l'ordre lexicographique",cc:2,gen:ordreLex}]},
 {id:"AU7",t:"Équations de langages (2023 à 2025, pas en 2026)",tache:"équations de langages",pts:0,blanc:false,
  paliers:[
   {t:"une équation L = α.L + β",cc:2,gen:uneEquation,min:40},
   {t:"un système de deux équations",cc:4,gen:R=>resoudre(R,2,false),min:150},
   {t:"trois équations, comme de 2023 à 2025",cc:6,gen:R=>resoudre(R,3,true),min:150},
   {t:"des équations à l'automate déterministe complet",cc:5,gen:R=>versAFD(R,true),min:150},
   {t:"des équations non déterministes à l'automate déterministe",cc:7,gen:R=>versAFD(R,false),min:150},
   {t:"la preuve du point fixe, sur papier",cc:4,gen:preuveEq,min:2}]},
 {id:"AU8",lecons:["au-combine"],t:"L'automate combiné : union, intersection, inclusion, égalité",tache:"automate combiné",th:"det",pts:3,
  paliers:[
   {t:"les états d'arrivée pour ∪, ∩ et \\",cc:3,gen:etatsArrivee,min:60},
   {t:"construire l'automate combiné",cc:5,gen:construireC,min:60},
   {t:"L(A₁) ⊆ L(A₂) ? (janvier 2025, question 4)",cc:5,gen:R=>testeC(R,false),min:40},
   {t:"L(A₁) = L(A₂) ? (janvier 2025, question 5)",cc:5,gen:R=>testeC(R,true),min:40},
   {t:"janvier 2025, questions 3 à 5, sur papier",cc:10,gen:methodeC,min:1}]}
]);
})();
