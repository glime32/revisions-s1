/* Générateurs d'exercices : un énoncé tiré au hasard, une réponse tapée, une correction calculée par le programme.
   Chargé avant app.js : chaque générateur ajoute aussi son étape « Entraînement » au planning de son thème.
   Ce fichier ne touche pas à la page : il tourne aussi dans deno (tools/verifier-generateurs.js). */
(function(){
"use strict";
const SUBJ=window.SUBJ||{};

/* hasard reproductible : la même graine redonne le même exercice sur n'importe quel appareil */
function alea(graine){let a=graine>>>0;
  const f=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
  f.ent=(x,y)=>x+Math.floor(f()*(y-x+1));
  f.nz=(x,y)=>{let v;do v=f.ent(x,y);while(v===0);return v;};
  f.choix=L=>L[Math.floor(f()*L.length)];
  f.mel=L=>{L=L.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(f()*(i+1));[L[i],L[j]]=[L[j],L[i]];}return L;};
  return f;}
const hache=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};

/* fractions exactes */
const pgcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
function Q(n,d){if(d==null)d=1;if(d<0){n=-n;d=-d;}const g=pgcd(n,d);return {n:n/g,d:d/g};}
const q=x=>typeof x==="number"?Q(x,1):x;
const add=(a,b)=>{a=q(a);b=q(b);return Q(a.n*b.d+b.n*a.d,a.d*b.d);};
const sub=(a,b)=>{a=q(a);b=q(b);return Q(a.n*b.d-b.n*a.d,a.d*b.d);};
const mul=(a,b)=>{a=q(a);b=q(b);return Q(a.n*b.n,a.d*b.d);};
const div=(a,b)=>{a=q(a);b=q(b);return Q(a.n*b.d,a.d*b.n);};
const egal=(a,b)=>{a=q(a);b=q(b);return a.n===b.n&&a.d===b.d;};
const nul=a=>q(a).n===0;
const entier=a=>q(a).d===1;

/* écriture : vrai signe moins, fractions a/b (empilées par le site dans une formule $…$) */
const nb=x=>{x=q(x);return (x.n<0?"−":"")+Math.abs(x.n)+(x.d===1?"":"/"+x.d);};
const brut=x=>{x=q(x);return x.n+(x.d===1?"":"/"+x.d);};
const par=x=>q(x).n<0?"("+nb(x)+")":nb(x);
function comb(c,noms){let s="";c.forEach((x,k)=>{x=q(x);if(!x.n)return;const a=Math.abs(x.n),co=x.d===1?(a===1?"":String(a)):"("+a+"/"+x.d+")";
  s+=(s?(x.n<0?" − ":" + "):(x.n<0?"−":""))+co+noms[k];});return s||"0";}
/* expression affine { c, k:{nom:coef} } : « 2 − z », « 1 + 3z », « z » */
function aff(e,ordre){const K=(ordre||Object.keys(e.k)).filter(v=>e.k[v]&&!nul(e.k[v]));if(!K.length)return nb(e.c);
  const t=comb(K.map(v=>e.k[v]),K);if(nul(e.c))return t;return nb(e.c)+(t[0]==="−"?" − "+t.slice(1):" + "+t);}
const f=s=>"$"+s+"$";
const fx=s=>`<span class="en-nb">$${s}$</span>`;
const sys=(A,b,noms)=>`<span class="sys">${A.map((r,i)=>`<span>$${comb(r,noms)} = ${nb(b[i])}$</span>`).join("")}</span>`;
const mat=(R,aug)=>{const c=R[0].length;return `<span class="mat" style="--n:${c}">${R.map(r=>r.map((x,j)=>`<span${aug&&j===c-1?' class="au"':""}>${typeof x==="string"?x:nb(x)}</span>`).join("")).join("")}</span>`;};
const ligne=(i,m,j)=>{m=q(m);const a=Q(Math.abs(m.n),m.d),co=egal(a,1)?"":a.d===1?nb(a):"("+nb(a)+")";return `L_{${i}} ← L_{${i}} ${m.n<0?"+":"−"} ${co}L_{${j}}`;};
const trou=(id,large)=>`<input class="en-in${large===2?" en-large en-tl":large?" en-large":""}" data-c="${id}" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Case à compléter">`;

/* rang, et « cette ligne est-elle une conséquence du système ? » */
function rang(M){M=M.map(r=>r.map(q));const n=M.length,c=M[0].length;let r=0;
  for(let j=0;j<c&&r<n;j++){let p=-1;for(let i=r;i<n;i++)if(!nul(M[i][j])){p=i;break;}if(p<0)continue;[M[r],M[p]]=[M[p],M[r]];
    for(let i=r+1;i<n;i++){if(nul(M[i][j]))continue;const k=div(M[i][j],M[r][j]);M[i]=M[i].map((x,t)=>sub(x,mul(k,M[r][t])));}r++;}
  return r;}
const dansLignes=(M,l)=>rang(M)===rang(M.concat([l]));

/* lecture de ce que l'étudiant tape */
const propre=s=>String(s==null?"":s).normalize("NFKC").replace(/[−–—]/g,"-").replace(/[×·]/g,"*").replace(/\s+/g," ").trim();
function nombre(s){s=propre(s).replace(/ /g,"").replace(/^\+/,"");
  let m=/^(-?\d+)(?:\/(\d+))?$/.exec(s);if(m)return m[2]!=null&&+m[2]===0?null:Q(+m[1],m[2]?+m[2]:1);
  m=/^(-?)(\d*)[.,](\d+)$/.exec(s);if(m){const d=Math.pow(10,m[3].length);return Q((m[1]?-1:1)*(+(m[2]||0)*d+ +m[3]),d);}
  return null;}
/* Une suite de nombres tapée librement (espaces, virgules, points-virgules). « 12345 » pour 1 2 3 4 5 : sans séparateur, elle n'est lisible
   que si chaque nombre attendu a un seul chiffre ; si les nombres collés font la bonne réponse avec des nombres de plusieurs chiffres,
   colle est vrai : on demande de les séparer au lieu de compter faux. */
function suiteNb(s,att){const P=propre(s==null?"":s).split(/[\s,;]+/).filter(Boolean);
  if(!att||!P.length||P.length>=att.length||!P.every(x=>/^\d+$/.test(x)))return {P,colle:false};
  const ch=P.join("");if(att.every(x=>/^\d$/.test(String(x)))&&ch.length===att.length)return {P:ch.split(""),colle:false};
  return {P,colle:ch===att.map(String).join("")};}
function liste(s,n){s=propre(s).replace(/^[(\[{]|[)\]}]$/g,"").trim();if(!s)return null;let P;
  if(s.includes(";"))P=s.split(";");else{const a=s.split(/\s*,\s+|\s+/).filter(Boolean);P=a.length===n||!s.includes(",")?a:s.split(",");}
  if(n>1&&P.length===1&&new RegExp("^\\d{"+n+"}$").test(P[0].trim()))P=P[0].trim().split("");
  P=P.map(x=>nombre(x.trim()));return P.length===n&&P.every(Boolean)?P:null;}
/* « 2 - z », « (1+3t)/2 », « -z » : rend { c, k } ou null si ce n'est pas une expression du premier degré */
function affine(src,permis){const s=propre(src).replace(/ /g,"");let p=0;if(!s)return null;
  const LET=/^[a-zA-Zα-ω]/,cst=c=>({c,k:{}}),estC=a=>!Object.keys(a.k).length;
  const fois=(a,m)=>{const k={};Object.keys(a.k).forEach(v=>{const x=mul(a.k[v],m);if(!nul(x))k[v]=x;});return {c:mul(a.c,m),k};};
  const somme=(a,b,g)=>{const k={};new Set(Object.keys(a.k).concat(Object.keys(b.k))).forEach(v=>{const x=g(a.k[v]||Q(0),b.k[v]||Q(0));if(!nul(x))k[v]=x;});return {c:g(a.c,b.c),k};};
  const prod=(a,b)=>estC(b)?fois(a,b.c):estC(a)?fois(b,a.c):null;
  function fact(){const ch=s[p];
    if(ch==="-"){p++;const a=fact();return a&&fois(a,Q(-1));}
    if(ch==="+"){p++;return fact();}
    if(ch==="("){p++;const a=expr();if(!a||s[p]!==")")return null;p++;return a;}
    let m=/^\d+(?:[.,]\d+)?/.exec(s.slice(p));if(m){p+=m[0].length;return cst(nombre(m[0]));}
    m=LET.exec(s.slice(p));if(m){p++;if(permis&&!permis.includes(m[0]))return null;return {c:Q(0),k:{[m[0]]:Q(1)}};}
    return null;}
  function terme(){let a=fact();
    while(a){const ch=s[p];
      if(ch==="*"){p++;const b=fact();a=b&&prod(a,b);}
      else if(ch==="/"){p++;const b=fact();a=b&&estC(b)&&!nul(b.c)?fois(a,div(1,b.c)):null;}
      else if(ch!==undefined&&(ch==="("||LET.test(ch))){const b=fact();a=b&&prod(a,b);}
      else break;}
    return a;}
  function expr(){let a=terme();
    while(a){const ch=s[p];if(ch!=="+"&&ch!=="-")break;p++;const b=terme();a=b&&somme(a,b,ch==="+"?add:sub);}
    return a;}
  const r=expr();return r&&p===s.length?r:null;}

/* « E(3/ε) + 1 », « 2x^2 - sqrt(x) » : la valeur de la formule pour les valeurs données aux lettres (en minuscules),
   null si elle ne se lit pas. E(…) est la partie entière. */
function calcule(src,vars){let s=propre(String(src==null?"":src).replace(/²/g,"^2").replace(/³/g,"^3")).toLowerCase().replace(/ /g,"").replace(/,/g,".").replace(/epsilon|eps/g,"ε").replace(/alpha/g,"α").replace(/êta|eta/g,"η").replace(/√/g,"sqrt").replace(/racine|rac/g,"sqrt").replace(/\*\*/g,"^").replace(/pi/g,"π"),p=0;
  const FN={sqrt:Math.sqrt,floor:Math.floor,ent:Math.floor,abs:Math.abs,exp:Math.exp,log:Math.log,ln:Math.log,sin:Math.sin,cos:Math.cos,e:Math.floor},NOMS=Object.keys(FN),NUM=/^\d+(\.\d+)?/;
  function prim(){const c=s[p];
    if(c==="("){p++;const v=expr();if(v===null||s[p]!==")")return null;p++;return v;}
    if(c==="|"){p++;const v=expr();if(v===null||s[p]!=="|")return null;p++;return Math.abs(v);}
    let m=NUM.exec(s.slice(p));if(m){p+=m[0].length;return +m[0];}
    for(const f of NOMS)if(s.startsWith(f,p)){const d=s[p+f.length];
      if(d==="("){p+=f.length;const v=prim();return v===null?null:FN[f](v);}
      if(f==="sqrt"&&d!==undefined){p+=f.length;const v=prim();return v===null?null:Math.sqrt(v);}}
    if(c==="π"){p++;return Math.PI;}
    if(c&&vars&&Object.prototype.hasOwnProperty.call(vars,c)){p++;return vars[c];}
    return null;}
  function puis(){let v=prim();if(v===null)return null;if(s[p]==="^"){p++;const e=unaire();if(e===null)return null;v=Math.pow(v,e);}return v;}
  function unaire(){if(s[p]==="-"){p++;const v=unaire();return v===null?null:-v;}if(s[p]==="+"){p++;return unaire();}return puis();}
  function terme(){let v=unaire();
    while(v!==null){const c=s[p];
      if(c==="*"){p++;const w=unaire();v=w===null?null:v*w;}
      else if(c==="/"){p++;const w=unaire();v=w===null?null:v/w;}
      else if(c!==undefined&&(c==="("||/[a-zα-ωπ\d]/.test(c))){const w=puis();v=w===null?null:v*w;}
      else break;}
    return v;}
  function expr(){let v=terme();while(v!==null){const c=s[p];if(c!=="+"&&c!=="-")break;p++;const w=terme();v=w===null?null:c==="+"?v+w:v-w;}return v;}
  if(!s)return null;const r=expr();return r!==null&&p===s.length?r:null;}

/* « |x - 2| < η », « 2 < x < 2 + η », « x ∈ ]2 ; 2 + η[ » : vrai ou faux pour les valeurs données, null si ça ne se lit pas */
function predicat(src,vars){let s=String(src==null?"":src).replace(/f\s*\(\s*x\s*\)/gi,"y").replace(/<=|≦|⩽/g,"≤").replace(/>=|≧|⩾/g,"≥").replace(/!=|<>|=\/=/g,"≠");
  const m=/^\s*x\s*(?:∈|dans|appartient à)\s*([\[\]])(.+?)(?:;|,(?=[^,]*$))(.+?)([\[\]])\s*$/i.exec(s);
  if(m)s=m[2]+(m[1]==="]"?"<":"≤")+"x"+(m[4]==="["?"<":"≤")+m[3];
  const P=s.split(/([<>≤≥≠=])/);if(P.length<3)return null;
  const V=[];for(let i=0;i<P.length;i+=2){const v=calcule(P[i],vars);if(v===null||Number.isNaN(v))return null;V.push(v);}
  for(let i=1;i<P.length;i+=2){const a=V[(i-1)/2],b=V[(i+1)/2],o=P[i];if(!(o==="<"?a<b:o===">"?a>b:o==="≤"?a<=b:o==="≥"?a>=b:o==="="?Math.abs(a-b)<1e-9:Math.abs(a-b)>=1e-9))return false;}
  return true;}

const GEN=window.GEN={defs:{},par:{},
  outils:{alea,hache,Q,q,add,sub,mul,div,egal,nul,entier,nb,brut,par,comb,aff,f,fx,sys,mat,ligne,trou,rang,dansLignes,propre,nombre,suiteNb,liste,affine,calcule,predicat},
  /* un tirage : la graine suffit à retrouver l'exercice */
  tire(d,palier,graine){const R=alea(graine),e=d.paliers[palier].gen(R);e.g=d.id;e.palier=palier;e.gr=graine;e.cle=hache(d.id+"|"+palier+"|"+e.sig);return e;},
  add(sid,defs){const S=SUBJ[sid];GEN.defs[sid]=(GEN.defs[sid]||[]).concat(defs);
    defs.forEach(d=>{d.sid=sid;GEN.par[d.id]=d;if(!S||!S.tasks||d.fixe)return;/* une récitation a déjà son étape dans le planning de la matière */
      const T=(S.themes||[]).find(x=>x.id===d.th),t={id:"en-"+d.id,t:"Entraînement : "+(d.tache||d.t.charAt(0).toLowerCase()+d.t.slice(1)),min:15,p:1,train:d.id,links:[["#/entrainer/"+sid+"/"+d.id,"S'entraîner"]],why:"Des exercices tirés au hasard, du plus simple au niveau du CC, jusqu'à 3 justes de suite."};
      if(d.ex)t.ex=d.ex;S.tasks.push(t);if(T)(T.tasks=T.tasks||[]).push(t.id);});}};
})();
