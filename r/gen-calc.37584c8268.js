/* Générateurs de Calculus. CC2 : nombres complexes (TD 3), équations différentielles d'ordre 2 (TD 2, ex. 3 à 5). */
(function(){
"use strict";
const G=window.GEN,O=G.outils,{Q,q,add,sub,mul,div,egal,nul,nb,brut,par,propre}=O;
const fx=s=>s.replace(/&[a-z]+;/g,"x").replace(/[_{}]/g,"").length>30||s.length>36?O.f(s):O.fx(s);

/* ---------- lire une formule tapée ----------
   lis(texte, variables) rend un arbre ou null ; val(arbre, valeurs) rend [partie réelle, partie imaginaire].
   Une lettre qui n'est pas une variable est une constante libre (C1, C2, A, B, λ…). e, i et π sont des nombres. */
const SUP={"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁻":"-","⁺":"+","ⁿ":"n","ˣ":"x","ᵏ":"k"};
const SUB={"₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","ₖ":"k","ₚ":"p"};
function norm(s){s=String(s==null?"":s);
  s=s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿˣᵏ]+/g,m=>"^("+[...m].map(c=>SUP[c]).join("")+")").replace(/[₀₁₂₃₄₅₆₇₈₉ₖₚ]+/g,m=>[...m].map(c=>SUB[c]).join(""));
  return s.normalize("NFKC").replace(/[−–—]/g,"-").replace(/[×·∙]/g,"*").replace(/÷/g,"/").replace(/\*\*/g,"^").replace(/[{]/g,"(").replace(/[}]/g,")").replace(/\s+/g,"");}
const FN=["arctan","atan","sqrt","racine","rac","exp","ln","log","cos","sin","tan","abs"],ALIAS={atan:"arctan",racine:"sqrt",rac:"sqrt",log:"ln"};
function lis(src,vars){const s=norm(src),V=vars||[];let p=0,barres=0;
  const nom=()=>{const r=s.slice(p).toLowerCase();for(const f of FN)if(r.startsWith(f))return f;return r.startsWith("pi")?"pi":null;};
  const estFn=()=>{const n=nom();return !!n&&n!=="pi";};
  function atome(){const c=s[p];if(c===undefined)return null;
    const m=/^\d+(?:[.,]\d+)?/.exec(s.slice(p));if(m){p+=m[0].length;return {t:"n",v:+m[0].replace(",","."),dec:/[.,]/.test(m[0])};}
    if(c==="π"){p++;return {t:"pi"};}
    if(nom()==="pi"){p+=2;return {t:"pi"};}
    if(/[A-Za-zα-ωΑ-Ω]/.test(c)){if(estFn())return null;p++;
      if(c==="i")return {t:"i"};
      if(c==="e")return {t:"e"};
      if(V.includes(c))return {t:"v",n:c};
      const d=/^\d+/.exec(s.slice(p));let n=c;if(d){n+=d[0];p+=d[0].length;}
      return {t:"c",n};}
    return null;}
  const suite=stop=>{const L=[];for(;;){if(L.length&&(estFn()||(s[p]==="e"&&s[p+1]==="^")))break;const q0=p,a=atome();if(!a){p=q0;break;}if(stop&&L.length&&(a.t==="n"||L.length>=2)){p=q0;break;}L.push(a);}
    return L.length?L.reduce((x,y)=>({t:"*",l:x,r:y})):null;};
  /* un exposant sans parenthèses : un signe, un nombre, puis une ou deux lettres (e^2x, e^-3x, x^2) */
  function expo(){if(s[p]==="("){p++;const a=expr();if(!a||s[p]!==")")return null;p++;return a;}
    let neg=false;if(s[p]==="-"){neg=true;p++;}else if(s[p]==="+")p++;
    const a=suite(true);return a&&(neg?{t:"-u",a}:a);}
  function argFn(){if(s[p]==="("){p++;const a=expr();if(!a||s[p]!==")")return null;p++;return a;}
    let neg=false;if(s[p]==="-"){neg=true;p++;}const a=suite(false);return a&&(neg?{t:"-u",a}:a);}
  function prim(){const c=s[p];if(c===undefined)return null;
    if(c==="("){p++;const a=expr();if(!a||s[p]!==")")return null;p++;return a;}
    if(c==="|"){p++;barres++;const a=expr();barres--;if(!a||s[p]!=="|")return null;p++;return {t:"f",f:"abs",a};}
    if(c==="√"){p++;const a=s[p]==="("?prim():atome();return a&&{t:"f",f:"sqrt",a};}
    const f=estFn()&&nom();
    if(f){p+=f.length;const F=ALIAS[f]||f;let ex=null;
      if(s[p]==="^"&&F!=="sqrt"){p++;ex=expo();if(!ex)return null;}
      const a=F==="sqrt"&&s[p]!=="("?atome():argFn();if(!a)return null;const r={t:"f",f:F,a};return ex?{t:"^",l:r,r:ex}:r;}
    return atome();}
  function puis(){const a=prim();if(!a)return null;if(s[p]==="^"){p++;const e=expo();return e&&{t:"^",l:a,r:e};}return a;}
  function unaire(){if(s[p]==="-"){p++;const a=unaire();return a&&{t:"-u",a};}if(s[p]==="+"){p++;return unaire();}return puis();}
  function terme(){let a=unaire();
    while(a){const c=s[p];
      if(c==="*"||c==="/"){p++;const b=unaire();a=b&&{t:c,l:a,r:b};}
      else if(c!==undefined&&/[(√|0-9A-Za-zα-ωΑ-Ωπ]/.test(c)&&!(c==="|"&&barres>0)){const b=puis();a=b&&{t:"*",l:a,r:b};}
      else break;}
    return a;}
  function expr(){let a=terme();while(a){const c=s[p];if(c!=="+"&&c!=="-")break;p++;const b=terme();a=b&&{t:c,l:a,r:b};}return a;}
  if(!s)return null;const a=expr();return a&&p===s.length?a:null;}
/* calcul en nombres complexes flottants */
const cm=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
const cd=(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];if(d<1e-300)throw {zero:1};return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];};
const cexp=a=>{const r=Math.exp(a[0]);return [r*Math.cos(a[1]),r*Math.sin(a[1])];};
const reelV=(a,f)=>{if(Math.abs(a[1])>1e-9*Math.max(1,Math.abs(a[0])))throw {complexe:f};return a[0];};
function val(A,env){const E=env||{};
  const go=a=>{switch(a.t){
    case "n":return [a.v,0];case "pi":return [Math.PI,0];case "e":return [Math.E,0];case "i":return [0,1];
    case "v":case "c":{const v=E[a.n];if(v===undefined)throw {lettre:a.n};return typeof v==="number"?[v,0]:v;}
    case "-u":{const v=go(a.a);return [-v[0],-v[1]];}
    case "+":{const x=go(a.l),y=go(a.r);return [x[0]+y[0],x[1]+y[1]];}
    case "-":{const x=go(a.l),y=go(a.r);return [x[0]-y[0],x[1]-y[1]];}
    case "*":return cm(go(a.l),go(a.r));
    case "/":return cd(go(a.l),go(a.r));
    case "^":{const y=go(a.r);if(a.l.t==="e")return cexp(y);const x=go(a.l);
      if(Math.abs(y[1])<1e-12&&Math.abs(y[0]-Math.round(y[0]))<1e-12&&Math.abs(y[0])<=64){const n=Math.round(y[0]),b=n<0?cd([1,0],x):x;let r=[1,0];for(let k=0;k<Math.abs(n);k++)r=cm(r,b);return r;}
      const b=reelV(x,"^"),e=reelV(y,"^");if(b<0)throw {neg:"^"};return [Math.pow(b,e),0];}
    case "f":{const x=go(a.a);switch(a.f){
      case "exp":return cexp(x);
      case "ln":{const v=reelV(x,"ln");if(v<=0)throw {neg:"ln"};return [Math.log(v),0];}
      case "sqrt":{const v=reelV(x,"√");if(v<-1e-12)throw {neg:"√"};return [Math.sqrt(Math.max(0,v)),0];}
      case "cos":return [Math.cos(x[0])*Math.cosh(x[1]),-Math.sin(x[0])*Math.sinh(x[1])];
      case "sin":return [Math.sin(x[0])*Math.cosh(x[1]),Math.cos(x[0])*Math.sinh(x[1])];
      case "tan":return [Math.tan(reelV(x,"tan")),0];
      case "arctan":return [Math.atan(reelV(x,"arctan")),0];
      case "abs":return [Math.hypot(x[0],x[1]),0];}}}
    throw {inconnu:a.t};};
  return go(A);}
const lettres=(A,o)=>{o=o||new Set();if(!A)return o;if(A.t==="c")o.add(A.n);["a","l","r"].forEach(k=>A[k]&&lettres(A[k],o));return o;};
const aDec=A=>!!A&&(A.dec||["a","l","r"].some(k=>A[k]&&aDec(A[k])));
const pres=(u,v)=>Math.abs(u-v)<=1e-9*Math.max(1,Math.abs(v));
const presC=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1])<=1e-9*Math.max(1,Math.hypot(v[0],v[1]));
/* un nombre réel tapé dans une case */
function lisReel(t){if(!propre(t))return {vide:1};const A=lis(t,[]);if(!A||lettres(A).size)return {illisible:1};
  let v;try{v=val(A,{});}catch(e){return e.neg?{neg:1}:{illisible:1};}
  if(!Number.isFinite(v[0])||!Number.isFinite(v[1]))return {illisible:1};
  if(Math.abs(v[1])>1e-9)return {avecI:1};return {v:v[0],dec:aDec(A)};}
/* un nombre complexe tapé */
function lisCx(t){if(!propre(t))return {vide:1};const A=lis(t,[]);if(!A||lettres(A).size)return {illisible:1};
  let v;try{v=val(A,{});}catch(e){return e.neg?{neg:e.neg}:{illisible:1};}
  if(!Number.isFinite(v[0])||!Number.isFinite(v[1]))return {illisible:1};return {v,dec:aDec(A)};}

/* ---------- complexes exacts : parties réelle et imaginaire en fractions ---------- */
const Z=(a,b)=>({a:q(a),b:q(b||0)});
const zadd=(z,w)=>Z(add(z.a,w.a),add(z.b,w.b)),zsub=(z,w)=>Z(sub(z.a,w.a),sub(z.b,w.b));
const zmul=(z,w)=>Z(sub(mul(z.a,w.a),mul(z.b,w.b)),add(mul(z.a,w.b),mul(z.b,w.a)));
const zconj=z=>Z(z.a,mul(z.b,-1)),zn2=z=>add(mul(z.a,z.a),mul(z.b,z.b));
const zdiv=(z,w)=>{const d=zn2(w),p=zmul(z,zconj(w));return Z(div(p.a,d),div(p.b,d));};
const zpow=(z,n)=>{let r=Z(1,0);for(let k=0;k<n;k++)r=zmul(r,z);return r;};
const zeq=(z,w)=>egal(z.a,w.a)&&egal(z.b,w.b);
const zf=z=>[z.a.n/z.a.d,z.b.n/z.b.d];
const absQ=x=>{x=q(x);return Q(Math.abs(x.n),x.d);};
const coefI=(x,suf)=>{const A=absQ(x);return (egal(A,1)?"":A.d===1?nb(A):"("+nb(A)+")")+suf;};
const bi=b=>(q(b).n<0?"−":"")+coefI(b,"i");
function zt(z){const a=q(z.a),b=q(z.b);if(nul(b))return nb(a);if(nul(a))return bi(b);return nb(a)+(b.n<0?" − ":" + ")+coefI(b,"i");}
const zp=z=>nul(z.b)?(z.a.n<0?"("+zt(z)+")":zt(z)):nul(z.a)&&z.b.n>0?zt(z):"("+zt(z)+")";
/* « + 3 », « − 2i », « + (2 − 3i) » : un complexe ajouté (ou retranché, avec moins) après un premier terme */
const plusZ=(z,moins)=>{const s=moins?-1:1;if(nul(z.b)||nul(z.a)){const c=nul(z.b)?z.a:z.b,neg=(q(c).n<0)!==(s<0);return (neg?" − ":" + ")+(nul(z.b)?nb(absQ(c)):coefI(c,"i"));}return (moins?" − ":" + ")+"("+zt(z)+")";};
/* un facteur devant une lettre : « 2 », « − » (−1), « 3i », « (1 + 2i) » ; facS : le même après un premier terme */
const fac=p=>nul(p.b)?(egal(p.a,1)?"":egal(p.a,-1)?"−":nb(p.a)):nul(p.a)?bi(p.b):"("+zt(p)+")";
const facS=p=>nul(p.b)?(egal(p.a,1)?" + ":egal(p.a,-1)?" − ":(p.a.n<0?" − ":" + ")+nb(absQ(p.a))):nul(p.a)?(p.b.n<0?" − ":" + ")+coefI(p.b,"i"):" + ("+zt(p)+")";
/* une somme de termes [coefficient, suffixe] : « 2 − 6i + i − 3i² » */
function S(T){let s="";T.forEach(([c,suf])=>{c=q(c);if(nul(c))return;const A=absQ(c),co=suf&&egal(A,1)?"":A.d===1||!suf?nb(A):"("+nb(A)+")";
  s+=(s?(c.n<0?" − ":" + "):(c.n<0?"−":""))+co+suf;});return s||"0";}

/* ---------- CA1 : forme algébrique ---------- */
const RAPPEL_I=`<p class="muted">Rappel : i est le nombre complexe dont le carré vaut −1 (${fx("i² = −1")}). La forme algébrique d'un complexe est ${fx("a + ib")}, avec a et b réels : a est la partie réelle, b la partie imaginaire.</p>`;
const IDEUX=`${fx("i² = −1")} : un terme en i² devient un nombre réel, de signe contraire.`;
const AB=z=>`${fx(`a = ${nb(z.a)}`)} et ${fx(`b = ${nb(z.b)}`)}`;
const LIRE_AB="a est la partie réelle (le nombre sans i), b la partie imaginaire (le nombre devant i).";
const casesZ=titre=>({k:"cases",id:"z",noms:["a","b"],titre:`Écris ${titre||"le résultat"} sous la forme $a + ib$, avec $a$ et $b$ réels :`,sym:["/","√"],aide:"Dans la case b, écris seulement le nombre devant i : pour 2 − 3i, a = 2 et b = −3. Pour une fraction, écris 3/2."});
/* o : sig, q, corps, z (le résultat exact), etapes, pieges [[complexe faux, diagnostic]], nature, texte, ens */
function exoZ(o){const z=o.z,dern=o.etapes.length-1,
    pieges=(o.pieges||[]).concat([[Z(z.b,z.a),{etape:dern,type:"partie réelle et partie imaginaire échangées",titre:"Où ça part : lire a et b.",msg:`${LIRE_AB} Ici ${AB(z)}.`}]]).filter(p=>!zeq(p[0],z));
  function juge(rep){const R=rep.z||{},A=lisReel(R.a),B=lisReel(R.b);
    if(A.vide||B.vide)return {incomplet:"Remplis les deux cases a et b."};
    if(A.avecI||B.avecI)return {incomplet:"Dans chaque case, écris un nombre réel, sans i : pour 2 − 3i, a = 2 et b = −3."};
    if(A.illisible||A.neg||B.illisible||B.neg)return {incomplet:"Je n'arrive pas à lire une des cases. Écris un nombre, par exemple −3 ou 5/2."};
    const [za,zb]=zf(z),okA=pres(A.v,za),okB=pres(B.v,zb);
    if(okA&&okB)return {ok:true};
    if((!okA&&A.dec&&Math.abs(A.v-za)<0.02)||(!okB&&B.dec&&Math.abs(B.v-zb)<0.02))return {incomplet:"Écris la valeur exacte, avec une fraction (par exemple 1/3), pas une valeur approchée."};
    const F=[];if(!okA)F.push("a");if(!okB)F.push("b");
    const pg=pieges.find(p=>pres(A.v,zf(p[0])[0])&&pres(B.v,zf(p[0])[1]));
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux cases sont à revoir":"la case "+F[0]+" est à revoir"}.`,
      diag:pg?pg[1]:{etape:o.fin==null?dern:o.fin,type:o.type||"calcul",titre:"Où ça part : le calcul.",msg:`Refais le calcul étape par étape : on trouve ${fx(`z = ${zt(z)}`)}.`}};}
  const f0=pieges.length?pieges[0][0]:zadd(z,Z(1,0));
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[casesZ(o.titre)],juge,etapes:o.etapes,
    bonne:fx(`z = ${zt(z)}`),bonneTxt:`z = ${zt(z)}`,repBonne:{z:{a:brut(z.a),b:brut(z.b)}},repFausse:{z:{a:brut(f0.a),b:brut(f0.b)}},nature:o.nature,ens:Object.assign({z:zf(z)},o.ens)};}
const zr=(R,lo,hi,nz)=>Z(nz?R.nz(lo,hi):R.ent(lo,hi),R.nz(lo,hi));

function produit(R){const t=R();
  if(t<0.2){/* k(a + ib) − i(c + id) */const k=R.choix([2,3,4,-2,-3]),u=zr(R,-6,6,true),v=zr(R,-6,6,true),ku=zmul(Z(k),u),iv=zmul(Z(0,1),v),z=zsub(ku,iv);
    return exoZ({sig:"K"+k+zt(u)+"|"+zt(v),z,nature:"i fois un complexe",texte:`forme algébrique de ${k}(${zt(u)}) − i(${zt(v)})`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = ${k}(${zt(u)}) − i(${zt(v)})`)}.`,corps:RAPPEL_I,
      etapes:[{w:`On développe chaque morceau : ${fx(`${k}(${zt(u)}) = ${zt(ku)}`)} et ${fx(`i(${zt(v)}) = ${S([[v.a,"i"],[v.b,"i²"]])} = ${zt(iv)}`)}.`,why:`On distribue le nombre devant la parenthèse sur chaque terme. ${IDEUX}`,pts:1},
        {w:`On retranche, partie réelle avec partie réelle, partie imaginaire avec partie imaginaire : ${fx(`z = ${zt(ku)}${plusZ(iv,true)} = ${zt(z)}`)}.`,why:`Le signe − devant la seconde parenthèse change le signe de ses deux parties.`,pts:1},
        {w:`Donc ${AB(z)}.`,why:LIRE_AB,pts:0.5}],
      pieges:[[zsub(ku,Z(v.b,v.a)),{etape:0,type:"i × i compté comme +1",titre:"Où ça part : i × i.",msg:`${fx(`i × ${bi(v.b)} = ${S([[v.b,"i²"]])}`)}, et ${fx("i² = −1")} : ce terme vaut ${fx(nb(mul(v.b,-1)))}, pas ${fx(nb(v.b))}.`}]],ens:{type:"k",k,u:zf(u),v:zf(v)}});}
  if(t<0.4){/* (a + ib)² */const u=zr(R,-7,7,true),z=zmul(u,u),a2=mul(u.a,u.a),b2=mul(u.b,u.b);
    return exoZ({sig:"C"+zt(u),z,nature:"carré",texte:`forme algébrique de (${zt(u)})²`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = (${zt(u)})²`)}.`,corps:RAPPEL_I,
      etapes:[{w:`On développe avec ${fx("(x + y)² = x² + 2xy + y²")} : ${fx(`z = ${S([[a2,""],[mul(2,mul(u.a,u.b)),"i"],[b2,"i²"]])}`)}.`,why:`Ici x est la partie réelle ${fx(nb(u.a))} et y le terme ${fx(bi(u.b))}. Le carré de ${fx(bi(u.b))} est ${fx(`${nb(b2)}i²`)}.`,pts:1},
        {w:`Comme ${fx("i² = −1")}, ${fx(`${nb(b2)}i² = ${nb(mul(b2,-1))}`)}. On regroupe : ${fx(`z = ${zt(z)}`)}.`,why:IDEUX,pts:1},
        {w:`Donc ${AB(z)}.`,why:LIRE_AB,pts:0.5}],
      pieges:[[Z(add(a2,b2),z.b),{etape:1,type:"i² compté comme +1",titre:"Où ça part : i².",msg:`${fx("i² = −1")} : le terme ${fx(`${nb(b2)}i²`)} vaut ${fx(nb(mul(b2,-1)))}. La partie réelle est ${fx(`${nb(a2)} − ${nb(b2)} = ${nb(z.a)}`)}.`}],
        [Z(sub(a2,b2),0),{etape:0,type:"double produit oublié",titre:"Où ça part : le double produit.",msg:`${fx("(x + y)²")} n'est pas ${fx("x² + y²")} : il manque ${fx("2xy")}, qui donne ici la partie imaginaire ${fx(bi(z.b))}.`}]],ens:{type:"carre",u:zf(u)}});}
  /* (a + ib)(c + id) */
  let u,v;do{u=zr(R,-6,6,R()<0.85);v=zr(R,-6,6,R()<0.85);}while(nul(u.a)&&nul(v.a));
  const z=zmul(u,v),bd=mul(u.b,v.b),T=[[mul(u.a,v.a),""],[mul(u.a,v.b),"i"],[mul(u.b,v.a),"i"],[bd,"i²"]];
  return exoZ({sig:"P"+zt(u)+"|"+zt(v),z,nature:"produit",texte:`forme algébrique de (${zt(u)})(${zt(v)})`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = ${zp(u)}${zp(v)}`)}.`,corps:RAPPEL_I,
    etapes:[{w:`On développe : ${fx(`z = ${S(T)}`)}.`,why:`Chaque terme de la première parenthèse multiplie chaque terme de la seconde, comme pour ${fx("(x + y)(u + v)")}.`,pts:1},
      {w:`Comme ${fx("i² = −1")}, ${fx(`${S([[bd,"i²"]])} = ${nb(mul(bd,-1))}`)}. On regroupe les nombres sans i, puis les termes en i : ${fx(`z = ${zt(z)}`)}.`,why:`${IDEUX} Partie réelle : ${fx(`${S([[mul(u.a,v.a),""],[mul(bd,-1),""]])} = ${nb(z.a)}`)}. Partie imaginaire : ${fx(`${S([[mul(u.a,v.b),""],[mul(u.b,v.a),""]])} = ${nb(z.b)}`)}.`,pts:1},
      {w:`Donc ${AB(z)}.`,why:LIRE_AB,pts:0.5}],
    pieges:[[Z(add(mul(u.a,v.a),bd),z.b),{etape:1,type:"i² compté comme +1",titre:"Où ça part : i².",msg:`${fx("i² = −1")} : le terme ${fx(S([[bd,"i²"]]))} vaut ${fx(nb(mul(bd,-1)))}. La partie réelle est donc ${fx(nb(z.a))}.`}],
      [Z(mul(u.a,v.a),bd),{etape:0,type:"produit des parties seulement",titre:"Où ça part : le développement.",msg:"On ne multiplie pas seulement les parties réelles entre elles et les parties imaginaires entre elles : il y a quatre produits."}]],ens:{type:"prod",u:zf(u),v:zf(v)}});}

function quotient(R){let N,D;const t=R();
  do D=Z(R.ent(-4,4),R.nz(-4,4));while(zn2(D).n>25);
  if(t<0.4){let z0;do z0=Z(R.ent(-5,5),R.ent(-5,5));while(nul(z0.a)&&nul(z0.b));N=zmul(z0,D);}
  else if(t<0.8){do N=Z(R.ent(-6,6),R.ent(-6,6));while(nul(N.a)&&nul(N.b));}
  else N=R.choix([Z(1),Z(R.choix([2,3,5,-2,-1])),Z(0,1),Z(0,-2)]);
  const z=zdiv(N,D),Dc=zconj(D),n2=zn2(D),num=zmul(N,Dc),c2d2=sub(mul(D.a,D.a),mul(D.b,D.b));
  const Tn=[[mul(N.a,Dc.a),""],[mul(N.a,Dc.b),"i"],[mul(N.b,Dc.a),"i"],[mul(N.b,Dc.b),"i²"]];
  const Nt=nul(N.b)&&N.a.n>0?zt(N):"("+zt(N)+")",Dt=zp(D);
  const E=[{w:`On multiplie le numérateur et le dénominateur par le conjugué du dénominateur, ${fx(zt(Dc))} : ${fx(`z = ${zp(N)}(${zt(Dc)}) / ((${zt(D)})(${zt(Dc)}))`)}.`,why:`Le conjugué de ${fx("c + id")} est ${fx("c − id")}. Le produit ${fx("(c + id)(c − id) = c² + d²")} est un réel : le i disparaît du dénominateur. Multiplier en haut et en bas par le même nombre ne change pas le quotient.`,pts:1},
    {w:`Au dénominateur : ${fx(`(${zt(D)})(${zt(Dc)}) = ${nul(D.a)?S([[mul(D.b,Dc.b),"i²"]]):`${nb(mul(D.a,D.a))} + ${nb(mul(D.b,D.b))}`} = ${nb(n2)}`)}.`,why:`${fx("(c + id)(c − id) = c² − (id)² = c² − d²i² = c² + d²")}.`,pts:1},
    {w:`Au numérateur : ${fx(`${zp(N)}(${zt(Dc)}) = ${S(Tn)} = ${zt(num)}`)}.`,why:IDEUX,pts:1},
    egal(n2,1)?{w:`Le dénominateur vaut 1 : ${fx(`z = ${zt(z)}`)}, donc ${AB(z)}.`,why:LIRE_AB,pts:1}:{w:`${fx(`z = (${zt(num)})/${nb(n2)} = ${zt(z)}`)}, donc ${AB(z)}.`,why:`On divise la partie réelle et la partie imaginaire par ${fx(nb(n2))}, et on simplifie les fractions.`,pts:1}];
  return exoZ({sig:"Q"+zt(N)+"|"+zt(D),z,nature:nul(N.b)&&egal(N.a,1)?"inverse":"quotient",texte:`forme algébrique de ${Nt}/${Dt}`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = ${Nt}/${Dt}`)}.`,corps:RAPPEL_I+`<p class="muted">Le conjugué de ${fx("c + id")} est ${fx("c − id")} : on change le signe de la partie imaginaire.</p>`,etapes:E,
    pieges:[[num,{etape:1,type:"dénominateur oublié",titre:"Où ça part : le dénominateur.",msg:`Le dénominateur a été multiplié lui aussi : il vaut ${fx(nb(n2))}. Il faut diviser ${fx(zt(num))} par ${fx(nb(n2))}.`}],
      ...(nul(c2d2)?[]:[[Z(div(num.a,c2d2),div(num.b,c2d2)),{etape:1,type:"c² − d² au dénominateur",titre:"Où ça part : le dénominateur.",msg:`${fx(`(${zt(D)})(${zt(Dc)})`)} vaut ${fx("c² + d²")}, pas ${fx("c² − d²")} : ${fx("−(id)² = −d²i² = +d²")}. Ici c'est ${fx(nb(n2))}.`}]]),
      [Z(div(add(mul(N.a,Dc.a),mul(N.b,Dc.b)),n2),div(add(mul(N.a,Dc.b),mul(N.b,Dc.a)),n2)),{etape:2,type:"i² compté comme +1",titre:"Où ça part : le numérateur.",msg:`${fx("i² = −1")} : dans le numérateur, ${fx(S([[mul(N.b,Dc.b),"i²"]]))} vaut ${fx(nb(mul(mul(N.b,Dc.b),-1)))}. Le numérateur est ${fx(zt(num))}.`}],
      [zdiv(zmul(N,D),Z(n2)),{etape:0,type:"multiplié par le dénominateur au lieu de son conjugué",titre:"Où ça part : le conjugué.",msg:`On multiplie par le conjugué ${fx(zt(Dc))}, pas par ${fx(zt(D))} lui-même : c'est le conjugué qui rend le dénominateur réel.`}]],
    ens:{type:"quot",N:zf(N),D:zf(D)}});}

const IPUIS=`${fx("i² = −1")}, ${fx("i³ = i² × i = −i")} et ${fx("i⁴ = (i²)² = 1")} : les puissances de i reviennent tous les 4 (1, i, −1, −i).`;
const ipow=n=>[Z(1),Z(0,1),Z(-1),Z(0,-1)][((n%4)+4)%4];
function puissances(R){const t=R();
  if(t<0.45){const n=R.ent(5,199),m=t<0.25?null:R.ent(5,99),sg=R()<0.5?1:-1,un=ipow(n),de=m?ipow(m):null,z=m?(sg>0?zadd(un,de):zsub(un,de)):un;
    const ligne=k=>{const qq=Math.floor(k/4),r=k%4;return `${fx(`${k} = 4 × ${qq}${r?" + "+r:""}`)}, donc ${fx(`i^{${k}} = (i⁴)^{${qq}}${r?` × i^{${r}}`:""} = ${zt(ipow(k))}`)}`;};
    const ex=m?`i^{${n}} ${sg>0?"+":"−"} i^{${m}}`:`i^{${n}}`;
    const E=[{w:IPUIS,why:"On n'a jamais besoin de multiplier i par lui-même des dizaines de fois : il suffit du reste de la division de l'exposant par 4.",pts:1},
      {w:`${ligne(n)}${m?` ; ${ligne(m)}`:""}.`,why:`${fx("i⁴ = 1")}, et 1 à n'importe quelle puissance vaut 1 : il ne reste que i à la puissance du reste.`,pts:1},
      {w:m?`${fx(`z = ${zt(un)}${plusZ(de,sg<0)} = ${zt(z)}`)}, donc ${AB(z)}.`:`Donc ${AB(z)}.`,why:LIRE_AB,pts:0.5}];
    return exoZ({sig:"I"+n+"|"+m+"|"+sg,z,nature:"puissance de i",texte:`forme algébrique de ${ex.replace(/[{}]/g,"").replace(/\^/g,"^")}`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = ${ex}`)}.`,corps:"",etapes:E,
      pieges:[[m?(sg>0?zadd(ipow(n+2),ipow(m+2)):zsub(ipow(n+2),ipow(m+2))):ipow(n+2),{etape:0,type:"puissances de i",titre:"Où ça part : les puissances de i.",msg:`${IPUIS} Ici le reste de ${n} par 4 est ${n%4}${m?`, celui de ${m} est ${m%4}`:""}.`}]],ens:{type:"ipuis",n,m,sg}});}
  if(t<0.8){const u=Z(R.choix([1,-1]),R.choix([1,-1])),n=R.ent(3,16),u2=zmul(u,u),k=Math.floor(n/2),impair=n%2===1,v=zpow(u2,k),z=impair?zmul(v,u):v,c=u2.b.n<0?-2:2;
    const E=[{w:`${fx(`(${zt(u)})² = ${S([[1,""],[mul(2,mul(u.a,u.b)),"i"],[1,"i²"]])} = ${zt(u2)}`)}.`,why:`${fx("(x + y)² = x² + 2xy + y²")}, puis ${fx("i² = −1")} : le 1 et le ${fx("i²")} s'annulent.`,pts:1},
      {w:`${fx(`(${zt(u)})^{${n}} = ((${zt(u)})²)^{${k}}${impair?` × (${zt(u)})`:""}`)}.`,why:`${fx("a^{m} × a^{p} = a^{m + p}")} et ${fx("(a²)^{k} = a^{2k}")} : on regroupe les facteurs deux par deux${impair?", et il en reste un":""}.`,pts:1},
      {w:`${fx(`(${zt(u2)})^{${k}} = (${nb(c)})^{${k}} × i^{${k}} = ${zt(v)}`)}.`,why:`${fx("(ci)^{k} = c^{k} × i^{k}")}. ${IPUIS}`,pts:1},
      {w:impair?`${fx(`z = ${zp(v)}(${zt(u)}) = ${zt(z)}`)}, donc ${AB(z)}.`:`Donc ${AB(z)}.`,why:impair?`On développe ce dernier produit, avec ${fx("i² = −1")}.`:LIRE_AB,pts:impair?1:0.5}];
    return exoZ({sig:"U"+zt(u)+"|"+n,z,nature:"(1 + i) puissance n",texte:`forme algébrique de (${zt(u)})^${n}`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = (${zt(u)})^{${n}}`)}.`,corps:`<p class="muted">Commence par calculer ${fx(`(${zt(u)})²`)}.</p>`,etapes:E,
      pieges:[[impair?zmul(zpow(Z(0,c<0?-1:1),k),u):zpow(Z(0,c<0?-1:1),k),{etape:2,type:"puissance de 2 oubliée",titre:"Où ça part : la puissance de 2.",msg:`${fx(`(${zt(u2)})^{${k}}`)} vaut ${fx(`(${nb(c)})^{${k}} × i^{${k}}`)} : le ${Math.abs(c)} est aussi élevé à la puissance ${k}.`}]],ens:{type:"upuis",u:zf(u),n}});}
  const u=zr(R,-4,4,true),z=zpow(u,3),a=u.a,b=u.b;
  const E=[{w:`On développe avec ${fx("(x + y)³ = x³ + 3x²y + 3xy² + y³")}, où ${fx(`x = ${nb(a)}`)} et ${fx(`y = ${bi(b)}`)} : ${fx(`z = ${S([[mul(a,mul(a,a)),""],[mul(3,mul(mul(a,a),b)),"i"],[mul(3,mul(a,mul(b,b))),"i²"],[mul(b,mul(b,b)),"i³"]])}`)}.`,why:`${fx("y² = b²i²")} et ${fx("y³ = b³i³")}, où b est la partie imaginaire.`,pts:1},
    {w:`Avec ${fx("i² = −1")} et ${fx("i³ = −i")} : ${fx(`z = ${S([[mul(a,mul(a,a)),""],[mul(3,mul(mul(a,a),b)),"i"],[mul(-3,mul(a,mul(b,b))),""],[mul(-1,mul(b,mul(b,b))),"i"]])} = ${zt(z)}`)}.`,why:`${fx("i³ = i² × i = −i")}. On regroupe les nombres sans i, puis les termes en i.`,pts:1},
    {w:`Donc ${AB(z)}.`,why:LIRE_AB,pts:0.5}];
  return exoZ({sig:"T"+zt(u),z,nature:"cube",texte:`forme algébrique de (${zt(u)})³`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = (${zt(u)})³`)}.`,corps:"",etapes:E,
    pieges:[[Z(add(mul(a,mul(a,a)),mul(3,mul(a,mul(b,b)))),add(mul(3,mul(mul(a,a),b)),mul(b,mul(b,b)))),{etape:1,type:"i² et i³ comptés comme 1 et i",titre:"Où ça part : i² et i³.",msg:`${fx("i² = −1")} et ${fx("i³ = −i")} : les termes en ${fx("i²")} et en ${fx("i³")} changent de signe.`}]],ens:{type:"cube",u:zf(u)}});}

function equation(R){const t=R();let z0;do z0=Z(R.ent(-6,6),R.ent(-6,6));while(nul(z0.a)||nul(z0.b));
  if(t<0.35){/* (c + id) z + β = γ */const al=Z(R.nz(-4,4),R.nz(-4,4)),be=Z(R.ent(-6,6),R.ent(-6,6)),ga=zadd(zmul(al,z0),be),dr=zsub(ga,be),sans=nul(be.a)&&nul(be.b);
    const alc=zconj(al),n2=zn2(al),eq=`(${zt(al)})z${sans?"":plusZ(be)} = ${zt(ga)}`;
    const E=[{w:sans?`On divise par le nombre devant z : ${fx(`z = (${zt(ga)})/(${zt(al)})`)}.`:`On isole z : ${fx(`(${zt(al)})z = ${zt(ga)}${plusZ(be,true)} = ${zt(dr)}`)}, donc ${fx(`z = (${zt(dr)})/(${zt(al)})`)}.`,why:"Comme pour une équation du premier degré dans ℝ : on enlève ce qui est ajouté, puis on divise par le nombre devant z.",pts:1},
      {w:`On multiplie en haut et en bas par le conjugué ${fx(zt(alc))} : le dénominateur devient ${fx(`${nb(mul(al.a,al.a))} + ${nb(mul(al.b,al.b))} = ${nb(n2)}`)}.`,why:`${fx("(c + id)(c − id) = c² + d²")} est un réel.`,pts:1},
      {w:`Le numérateur : ${fx(`(${zt(dr)})(${zt(alc)}) = ${zt(zmul(dr,alc))}`)}.`,why:IDEUX,pts:1},
      {w:`${fx(`z = (${zt(zmul(dr,alc))})/${nb(n2)} = ${zt(z0)}`)}.`,why:`On divise chaque partie par ${fx(nb(n2))}. Vérification : ${fx(`(${zt(al)})(${zt(z0)}) = ${zt(zmul(al,z0))}`)}.`,pts:1}];
    return exoZ({sig:"L"+zt(al)+"|"+zt(be)+"|"+zt(z0),z:z0,titre:"la solution",nature:"équation du premier degré",texte:`résoudre ${eq}`,q:`Résous dans ℂ l'équation ${fx(eq)}.`,corps:"",etapes:E,
      pieges:sans?[]:[[zdiv(ga,al),{etape:0,type:"terme constant oublié",titre:"Où ça part : isoler z.",msg:`Il faut d'abord retrancher ${fx(zt(be))} des deux côtés, puis diviser.`}]],ens:{type:"lin",al:zf(al),be:zf(be),ga:zf(ga)}});}
  /* p z + q z̄ = w */
  let p,qq;do{p=Z(R.ent(-3,3),R.ent(-3,3));qq=Z(R.ent(-3,3),R.ent(-3,3));}while(nul(zn2(p))||nul(zn2(qq))||egal(zn2(p),zn2(qq))||(nul(p.b)&&nul(qq.b)));
  const w=zadd(zmul(p,z0),zmul(qq,zconj(z0)));
  const re=[add(p.a,qq.a),sub(qq.b,p.b)],im=[add(p.b,qq.b),sub(p.a,qq.a)];
  const eq=`${fac(p)}z${facS(qq)}z̄ = ${zt(w)}`,sysH=O.sys([re,im],[w.a,w.b],["x","y"]);
  const E=[{w:`On pose ${fx("z = x + iy")}, avec x et y réels. Alors ${fx("z̄ = x − iy")}, et l'équation devient ${fx(`${fac(p)}(x + iy)${facS(qq)}(x − iy) = ${zt(w)}`)}.`,why:"z̄ est le conjugué de z : même partie réelle, partie imaginaire de signe contraire. Quand z et z̄ apparaissent tous les deux, on revient aux deux réels x et y.",pts:1},
    {w:`On développe et on regroupe : ${fx(`(${S([[re[0],"x"],[re[1],"y"]])}) + i(${S([[im[0],"x"],[im[1],"y"]])}) = ${zt(w)}`)}.`,why:IDEUX,pts:1},
    {w:`Deux nombres complexes sont égaux quand ils ont la même partie réelle et la même partie imaginaire : ${sysH}`,why:"C'est ce qui transforme une équation dans ℂ en deux équations dans ℝ.",pts:1},
    {w:`On résout ce système : ${fx(`x = ${nb(z0.a)}`)} et ${fx(`y = ${nb(z0.b)}`)}.`,why:"Par combinaison ou par substitution. En remplaçant x et y dans les deux équations, on retrouve bien les seconds membres.",pts:1},
    {w:`${fx(`z = ${zt(z0)}`)}, donc ${AB(z0)}.`,why:"La solution est z = x + iy.",pts:0.5}];
  const s=zadd(p,qq);
  return exoZ({sig:"B"+zt(p)+"|"+zt(qq)+"|"+zt(z0),z:z0,titre:"la solution",nature:"z et son conjugué",texte:`résoudre ${eq}`,q:`Résous dans ℂ l'équation ${fx(eq)}, où ${fx("z̄")} est le conjugué de z.`,corps:`<p class="muted">Pose ${fx("z = x + iy")} avec x et y réels.</p>`,etapes:E,
    pieges:nul(zn2(s))?[]:[[zdiv(w,s),{etape:0,type:"z̄ traité comme z",titre:"Où ça part : le conjugué.",msg:`${fx("z̄ = x − iy")} n'est pas z : on ne peut pas mettre z en facteur. On pose ${fx("z = x + iy")} et on sépare partie réelle et partie imaginaire.`}]],ens:{type:"conj",p:zf(p),q:zf(qq),w:zf(w)}});}

/* ---------- CA2 : module, argument, forme exponentielle ----------
   Un nombre « c√s » : c fraction, s entier sans carré (1, 2, 3, 6). Les angles sont des fractions de π. */
function simpR(c,s){c=q(c);for(const p of [2,3,5,7])while(s%(p*p)===0){s/=p*p;c=mul(c,p);}if(nul(c))s=1;return {c,s};}
const Rd=(c,s)=>simpR(c,s||1),rmul=(x,y)=>simpR(mul(x.c,y.c),x.s*y.s),rinv=x=>simpR(div(1,mul(x.c,x.s)),x.s);
const rpow=(x,n)=>{let r=Rd(1);for(let k=0;k<n;k++)r=rmul(r,x);return r;};
const rF=x=>x.c.n/x.c.d*Math.sqrt(x.s),r2Q=x=>mul(mul(x.c,x.c),x.s),rRac=N=>{N=q(N);return simpR(Q(1,N.d),N.n*N.d);};
const rT=x=>{const c=x.c;if(nul(c))return "0";const A=absQ(c);return (c.n<0?"−":"")+(x.s>1?(A.n===1?"":A.n)+"√"+x.s:A.n)+(A.d>1?"/"+A.d:"");};
const rI=x=>{const c=x.c,A=absQ(c);return (c.n<0?"−":"")+(A.n===1?"":A.n)+"i"+(x.s>1?"√"+x.s:"")+(A.d>1?"/"+A.d:"");};
const rTape=x=>{const c=x.c;return nul(c)?"0":(c.n<0?"-":"")+Math.abs(c.n)+(x.s>1?"*sqrt("+x.s+")":"")+(c.d>1?"/"+c.d:"");};
const zR=(a,b)=>nul(b.c)?rT(a):nul(a.c)?rI(b):rT(a)+(b.c.n<0?" − ":" + ")+rI({c:absQ(b.c),s:b.s});
const zRp=(a,b)=>nul(b.c)&&a.c.n>0||nul(a.c)&&b.c.n>0?zR(a,b):"("+zR(a,b)+")";
const angP=t=>{t=q(t);while(t.n>t.d)t=sub(t,2);while(t.n<=-t.d)t=add(t,2);return t;};
const angT=t=>{t=q(t);if(nul(t))return "0";const A=absQ(t);return (t.n<0?"−":"")+(A.n===1?"":A.n)+"π"+(A.d>1?"/"+A.d:"");};
const angE=t=>{t=q(t);const A=absQ(t);return (t.n<0?"−":"")+(A.n===1?"":A.n)+"iπ"+(A.d>1?"/"+A.d:"");};
const angTape=t=>{t=q(t);return nul(t)?"0":(t.n<0?"-":"")+Math.abs(t.n)+"*pi"+(t.d>1?"/"+t.d:"");};
const angF=t=>q(t).n/q(t).d*Math.PI;
const expT=(r,t)=>nul(q(t))?rT(r):`${rT(r)==="1"?"":/^[^()]*\/[^()]*$/.test(rT(r))?"("+rT(r)+")":rT(r)}e^{${angE(t)}}`;
/* cos et sin exacts des multiples de π/4 et de π/6 */
const TRIG=(()=>{const T={},h=Q(1,2),mh=Q(-1,2),set=(m,c,s)=>{T[m]={c,s};};
  set(0,Rd(1),Rd(0));set(6,Rd(0),Rd(1));set(12,Rd(-1),Rd(0));set(18,Rd(0),Rd(-1));
  set(3,Rd(h,2),Rd(h,2));set(9,Rd(mh,2),Rd(h,2));set(15,Rd(mh,2),Rd(mh,2));set(21,Rd(h,2),Rd(mh,2));
  set(2,Rd(h,3),Rd(h));set(4,Rd(h),Rd(h,3));set(8,Rd(mh),Rd(h,3));set(10,Rd(mh,3),Rd(h));
  set(14,Rd(mh,3),Rd(mh));set(16,Rd(mh),Rd(mh,3));set(20,Rd(h),Rd(mh,3));set(22,Rd(h,3),Rd(mh));return T;})();
const trig=t=>{const m=mul(q(t),12);if(m.d!==1)return null;return TRIG[((m.n%24)+24)%24]||null;};
/* où est le point, et l'angle connu qui a ces cosinus et sinus */
function quadrant(t){t=angP(t);const v=t.n/t.d,T=trig(t),ref=angT(Q(Math.min(Math.abs(t.n*12/t.d)%12,12-Math.abs(t.n*12/t.d)%12),12));
  if(v===0)return "Le point est sur l'axe des réels, à droite de O : l'argument est 0.";
  if(v===1)return "Le point est sur l'axe des réels, à gauche de O : l'argument principal est π (et pas −π, qui n'est pas dans ]−π, π]).";
  if(Math.abs(v)===0.5)return `Le point est sur l'axe des imaginaires, ${v>0?"en haut : l'argument est π/2":"en bas : l'argument est −π/2"}.`;
  const c=rF(T.c)>0,s=rF(T.s)>0;
  return `${c?"cos θ > 0":"cos θ < 0"} et ${s?"sin θ > 0":"sin θ < 0"} : le point est ${s?"en haut":"en bas"} ${c?"à droite":"à gauche"}, θ est entre ${s?(c?"0 et π/2":"π/2 et π"):(c?"−π/2 et 0":"−π et −π/2")}. L'angle connu dont le cosinus et le sinus valent ${fx(rT({c:absQ(T.c.c),s:T.c.s}))} et ${fx(rT({c:absQ(T.s.c),s:T.s.s}))} est ${fx(ref)}.`;}
const casesRT=()=>({k:"cases",id:"p",noms:["r","θ"],titre:"Écris le module $r$, puis l'argument principal $θ$, dans $]−π, π]$ :",sym:["√","π","/"],aide:"Par exemple r = 2√2 (ou 2sqrt(2)) et θ = −3π/4 (ou -3pi/4)."});
const memeAngle=(u,v)=>{const d=(u-v)/(2*Math.PI);return Math.abs(d-Math.round(d))<1e-9;};
/* o : r (c√s), t (argument principal, fraction de π), etapes, eR et eT (étapes du module et de l'argument), rFaux [[valeur, diag]] */
function exoRT(o){const r=rF(o.r),t=angF(o.t),eR=o.eR||0,eT=o.eT==null?o.etapes.length-2:o.eT;
  const dT=(type,msg)=>({etape:eT,type,titre:"Où ça part : l'argument.",msg});
  function juge(rep){const P=rep.p||{},A=lisReel(P.r),T=lisReel(P["θ"]);
    if(A.vide||T.vide)return {incomplet:"Remplis les deux cases : r, puis θ."};
    if(A.avecI||T.avecI)return {incomplet:"Écris des nombres réels, sans i : le module r et l'angle θ."};
    if(A.illisible||A.neg||T.illisible||T.neg)return {incomplet:"Je n'arrive pas à lire une des cases. Par exemple r = 2√2 et θ = −3π/4."};
    const okR=pres(A.v,r),okT=pres(T.v,t);
    if(okR&&okT)return {ok:true};
    if(!okR&&A.dec&&Math.abs(A.v-r)<0.02)return {incomplet:"Écris la valeur exacte du module (avec √ si besoin), pas une valeur approchée."};
    if(!okT&&T.dec&&Math.abs(T.v-t)<0.02)return {incomplet:"Écris la valeur exacte de l'angle, avec π (par exemple 2π/3), pas une valeur approchée."};
    if(!okT&&Math.abs(T.v)>6.5&&memeAngle(T.v*Math.PI/180,t))return {incomplet:"Écris l'angle en radians, avec π : par exemple 45° s'écrit π/4, et 120° s'écrit 2π/3."};
    const F=[];if(!okR)F.push("r");if(!okT)F.push("θ");
    let d=null;
    if(!okR){const pg=(o.rFaux||[]).find(x=>pres(A.v,x[0]));d=pg?pg[1]:A.v<=0?{etape:eR,type:"module négatif",titre:"Où ça part : le module.",msg:"Un module est une distance : il est toujours positif."}:{etape:eR,type:"calcul du module",titre:"Où ça part : le module.",msg:`Le module vaut ${fx(rT(o.r))}.`};}
    else if(memeAngle(T.v,t))d=dT("argument juste à 2π près, mais pas principal",`${fx(`θ = ${(T.v/Math.PI).toFixed(3).replace(".",",")}π`)} est bien un argument de z, mais l'argument principal est celui de ]−π, π] : on ajoute ou on retranche 2π jusqu'à y tomber. Ici ${fx(angT(o.t))}.`);
    else if(memeAngle(T.v,-t))d=dT("signe de l'argument",`Tu as l'angle du conjugué. Le signe de sin θ décide : ${rF(o.r)&&Math.sin(t)>0?"sin θ > 0, le point est en haut, θ est positif":"sin θ < 0, le point est en bas, θ est négatif"}. L'argument principal est ${fx(angT(o.t))}.`);
    else if(memeAngle(T.v,Math.PI-t))d=dT("cos θ et le quadrant",`${Math.cos(t)>0?"cos θ > 0 : le point est à droite de l'axe des imaginaires":"cos θ < 0 : le point est à gauche de l'axe des imaginaires"}. Place le point : l'argument principal est ${fx(angT(o.t))}.`);
    else if(memeAngle(T.v,t+Math.PI))d=dT("argument décalé de π",`Ton angle donne le point opposé (−z). Rappel : ${fx("−1 = e^{iπ}")}, et l'argument principal ici est ${fx(angT(o.t))}.`);
    else d=dT("calcul de l'argument",`L'argument principal est ${fx(angT(o.t))}.`);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux cases sont à revoir":F[0]==="r"?"le module est à revoir":"l'argument est à revoir"}.`,diag:d};}
  const ff=nul(o.t)||egal(o.t,1)?{r:rTape(o.r)+"+1",θ:angTape(o.t)}:{r:rTape(o.r),θ:angTape(mul(o.t,-1))};
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[casesRT()],juge,etapes:o.etapes,
    bonne:`${fx(`r = ${rT(o.r)}`)} et ${fx(`θ = ${angT(o.t)}`)}, donc ${fx(`z = ${expT(o.r,o.t)}`)}`,bonneTxt:`r = ${rT(o.r)}, θ = ${angT(o.t)}`,repBonne:{p:{r:rTape(o.r),θ:angTape(o.t)}},repFausse:{p:ff},nature:o.nature,ens:Object.assign({r,t},o.ens)};}
/* z donné par son module et son argument (multiple de π/4 ou de π/6) : ses parties réelle et imaginaire exactes */
const algDe=(r,t)=>{const T=trig(t);return {a:rmul(r,T.c),b:rmul(r,T.s)};};
const RACINE_MOD="Le module de a + ib est la distance du point (a ; b) à l'origine : par Pythagore, c'est √(a² + b²).";
function etapesPolaire(r,t,a,b,deb){const T=trig(t),r2=r2Q(r),un=rT(r)==="1";
  const cs=(x,y)=>un?rT(x):`${rT(x).includes("/")||rT(x)[0]==="−"?"("+rT(x)+")":rT(x)}/${rT(r).includes("√")||rT(r).includes("/")?"("+rT(r)+")":rT(r)} = ${rT(y)}`;
  const a2=r2Q(a),b2=r2Q(b),rac=`√${r2.d===1?nb(r2):"("+nb(r2)+")"}`;
  return [{w:`${deb||"Le module"} : ${fx(`|z| = √(${nb(a2)} + ${nb(b2)}) = ${rac}${rac===rT(r)?"":" = "+rT(r)}`)}.`,why:`${RACINE_MOD} Ici ${fx(`a² = ${nb(a2)}`)} et ${fx(`b² = ${nb(b2)}`)}.`,pts:1},
    {w:`${fx(`cos θ = a/r${un?"":" = "+cs(a,T.c)}`)}${un?" = "+fx(rT(T.c)):""} et ${fx(`sin θ = b/r${un?"":" = "+cs(b,T.s)}`)}${un?" = "+fx(rT(T.s)):""}.`,why:"Le point (a ; b) est sur le cercle de centre O et de rayon r : ses coordonnées sont (r cos θ ; r sin θ).",pts:1},
    {w:`${fx(`θ = ${angT(t)}`)}.`,why:quadrant(t),pts:1},
    {w:`${fx(`z = ${expT(r,t)}`)}.`,why:`C'est la forme exponentielle : ${fx("z = r(cos θ + i sin θ) = r e^{iθ}")}.`,pts:0.5}];}
function pointRT(R,axe){let t,r;
  if(axe){t=Q(R.choix([0,3,6,9,12,-3,-6,-9]),12);const m=mul(t,12).n;r=Math.abs(m)%6===0?Rd(R.ent(1,9)):R()<0.8?Rd(R.ent(1,6),2):Rd(R.ent(1,3));}
  else{t=Q(R.choix([2,4,8,10,-2,-4,-8,-10]),12);const u=R();r=u<0.55?Rd(2*R.ent(1,5)):u<0.8?Rd(R.ent(1,4)):Rd(2*R.ent(1,3),2);}
  return {r,t};}
function versPolaire(R,axe){const {r,t}=pointRT(R,axe),{a,b}=algDe(r,t),zs=zR(a,b),E=etapesPolaire(r,t,a,b);
  return exoRT({sig:"V"+zs,r,t,etapes:E,eR:0,eT:2,nature:axe?"axe ou diagonale":"angle π/6 ou π/3",texte:`module et argument de ${zs}`,
    q:`On pose ${fx(`z = ${zs}`)}. Donne son module r et son argument principal θ, puis écris z sous forme exponentielle (le cours dit « forme polaire »).`,corps:axe?`<p class="muted">Le module de ${fx("a + ib")} est ${fx("|z| = √(a² + b²)")}. Un argument θ vérifie ${fx("cos θ = a/r")} et ${fx("sin θ = b/r")} ; l'argument principal est celui qui est dans ]−π, π].</p>`:"",
    rFaux:[[rF(r)*rF(r),{etape:0,type:"racine carrée oubliée",titre:"Où ça part : le module.",msg:`${fx("a² + b²")} est le carré du module : il faut encore prendre la racine carrée. ${fx(`|z| = ${rT(r)}`)}.`}],[Math.abs(rF(a))+Math.abs(rF(b)),{etape:0,type:"module pris comme |a| + |b|",titre:"Où ça part : le module.",msg:`Le module n'est pas ${fx("|a| + |b|")} : c'est ${fx("√(a² + b²)")}, la distance à l'origine.`}]],ens:{type:"pol",a:rF(a),b:rF(b)}});}

/* produits, quotients, puissances, opposé : modules multipliés, arguments ajoutés */
const ANG=[1,2,3,4,6,8,9,10].flatMap(m=>[Q(m,12),Q(-m,12)]);
const ANG_TORDUS=[Q(1,5),Q(2,5),Q(3,5),Q(1,7),Q(2,7),Q(3,7),Q(5,7),Q(1,8),Q(3,8),Q(1,9),Q(4,9)];
function operation(R){const t=R();
  if(t<0.15){/* l'opposé, comme au TD 3 : −2e^{iπ/7} */const r=Rd(R.ent(2,6)),t1=mul(R.choix(ANG_TORDUS),R()<0.5?1:-1),tt=angP(add(t1,1));
    const zs=`−${expT(r,t1)}`;
    const E=[{w:`Le module : ${fx(`|z| = ${rT(r)}`)}. Le signe − n'est pas dans le module : ${fx(`z = ${rT(r)} × (−e^{${angE(t1)}})`)}.`,why:"Un module est une distance, il est toujours positif : on ne peut pas prendre −2 comme module.",pts:1},
      {w:`Comme ${fx("−1 = e^{iπ}")}, ${fx(`z = ${rT(r)}e^{iπ}e^{${angE(t1)}} = ${rT(r)}e^{i(${angT(t1)} + π)}`)}.`,why:`${fx("e^{iπ} = cos π + i sin π = −1")}. Multiplier deux exponentielles, c'est ajouter les angles.`,pts:1},
      {w:`${fx(`${angT(t1)} + π = ${angT(add(t1,1))}`)}${egal(tt,add(t1,1))?" : il est déjà dans ]−π, π].":` : il dépasse π, on retranche 2π : ${fx(`θ = ${angT(tt)}`)}.`}`,why:"L'argument principal est l'unique argument qui est dans ]−π, π] ; deux arguments d'un même nombre diffèrent d'un multiple de 2π.",pts:1},
      {w:`${fx(`z = ${expT(r,tt)}`)}.`,why:"Le module et l'argument principal donnent la forme exponentielle.",pts:0.5}];
    return exoRT({sig:"O"+zs,r,t:tt,etapes:E,eR:0,eT:2,nature:"opposé",texte:`module et argument de ${zs}`,q:`On pose ${fx(`z = ${zs}`)}. Donne son module r et son argument principal θ.`,
      rFaux:[[-rF(r),{etape:0,type:"module négatif",titre:"Où ça part : le module.",msg:`Un module est toujours positif : ${fx(`|z| = ${rT(r)}`)}, et le signe − passe dans l'argument.`}]],ens:{type:"opp",r1:rF(r),t1:angF(t1)}});}
  const r1=Rd(R.ent(1,5)),t1=R.choix(ANG),op=t<0.5?"x":t<0.8?"/":"^";
  if(op==="^"){const n=R.ent(2,r1.c.n>2?4:8),rr=rpow(r1,n),brut=mul(t1,n),tt=angP(brut);
    const E=[{w:`Le module : ${fx(`|z| = ${rT(r1)}^{${n}} = ${rT(rr)}`)}.`,why:`${fx("(r e^{iθ})ⁿ = rⁿ e^{inθ}")} : le module est élevé à la puissance n.`,pts:1},
      {w:`Un argument : ${fx(`${n} × ${angT(t1)} = ${angT(brut)}`)}.`,why:"Les arguments sont multipliés par n (formule de Moivre).",pts:1},
      {w:egal(brut,tt)?`${fx(angT(brut))} est déjà dans ]−π, π] : ${fx(`θ = ${angT(tt)}`)}.`:`On ajoute ou on retranche 2π jusqu'à tomber dans ]−π, π] : ${fx(`θ = ${angT(tt)}`)}.`,why:`Deux arguments d'un même nombre diffèrent d'un multiple de 2π. ${egal(brut,tt)?"":fx(`${angT(brut)} − (${angT(tt)}) = ${angT(sub(brut,tt))}`)+", un multiple de 2π."}`,pts:1},
      {w:`${fx(`z = ${expT(rr,tt)}`)}.`,why:"Le module et l'argument principal donnent la forme exponentielle.",pts:0.5}];
    const z1=expT(r1,t1);
    return exoRT({sig:"N"+z1+"|"+n,r:rr,t:tt,etapes:E,eR:0,eT:2,nature:"puissance",texte:`module et argument de (${z1})^${n}`,q:`On pose ${fx(`z₁ = ${z1}`)} et ${fx(`z = z₁^{${n}}`)}. Donne le module r et l'argument principal θ de z.`,
      rFaux:[[rF(r1)*n,{etape:0,type:"module multiplié par n au lieu d'élevé à la puissance n",titre:"Où ça part : le module.",msg:`${fx(`|z₁^{${n}}| = |z₁|^{${n}} = ${rT(rr)}`)} : le module est élevé à la puissance ${n}, pas multiplié par ${n}.`}]],ens:{type:"pow",r1:rF(r1),t1:angF(t1),n}});}
  /* z₂ donné en exponentielle, ou en forme algébrique (il faut d'abord le convertir) */
  const alg=R()<0.35;let r2,t2,a2=null,b2=null;
  if(alg){const P=pointRT(R,R()<0.5);r2=P.r;t2=P.t;({a:a2,b:b2}=algDe(r2,t2));}else{r2=Rd(R.ent(1,5));t2=R.choix(ANG);}
  const rr=op==="x"?rmul(r1,r2):rmul(r1,rinv(r2)),brut=op==="x"?add(t1,t2):sub(t1,t2),tt=angP(brut);
  const z1=expT(r1,t1),z2=alg?zR(a2,b2):expT(r2,t2),E=[];
  if(alg)E.push({w:`D'abord ${fx("z₂")} en forme exponentielle : ${fx(`|z₂| = ${rT(r2)}`)} et ${fx(`arg z₂ = ${angT(t2)}`)}, donc ${fx(`z₂ = ${expT(r2,t2)}`)}.`,why:`${RACINE_MOD} Puis ${fx(`cos θ₂ = ${rT(trig(t2).c)}`)} et ${fx(`sin θ₂ = ${rT(trig(t2).s)}`)}.`,pts:1});
  E.push({w:rT(r2)==="1"?`Le module : ${fx("|z₂| = 1")}, donc ${fx(`|z| = ${rT(rr)}`)}.`:`Le module : ${fx(`|z| = ${op==="x"?`${rT(r1)} × ${rT(r2)}`:`${rT(r1)}/${rT(r2).length>1?"("+rT(r2)+")":rT(r2)}`} = ${rT(rr)}`)}.`,why:op==="x"?"Le module d'un produit est le produit des modules.":"Le module d'un quotient est le quotient des modules.",pts:1},
    {w:`Un argument : ${fx(`${angT(t1)} ${op==="x"?"+":"−"} ${t2.n<0?"("+angT(t2)+")":angT(t2)} = ${angT(brut)}`)}.`,why:op==="x"?`${fx("e^{ia} × e^{ib} = e^{i(a + b)}")} : les arguments s'ajoutent.`:`${fx("e^{ia}/e^{ib} = e^{i(a − b)}")} : les arguments se retranchent.`,pts:1},
    {w:egal(brut,tt)?`${fx(angT(brut))} est déjà dans ]−π, π] : ${fx(`θ = ${angT(tt)}`)}.`:`${fx(angT(brut))} n'est pas dans ]−π, π] : ${fx(`θ = ${angT(brut)} ${q(brut).n>0?"− 2π":"+ 2π"} = ${angT(tt)}`)}.`,why:"Deux arguments d'un même nombre diffèrent d'un multiple de 2π ; l'argument principal est celui de ]−π, π].",pts:1},
    {w:`${fx(`z = ${expT(rr,tt)}`)}.`,why:"Le module et l'argument principal donnent la forme exponentielle.",pts:0.5});
  const nomOp=op==="x"?"z₁z₂":"z₁/z₂",pre=alg?1:0;
  return exoRT({sig:"M"+z1+"|"+z2+"|"+op,r:rr,t:tt,etapes:E,eR:pre,eT:pre+2,nature:(op==="x"?"produit":"quotient")+(alg?" avec une forme algébrique":""),texte:`module et argument de ${nomOp}, z₁ = ${z1}, z₂ = ${z2}`,
    q:`On pose ${fx(`z₁ = ${z1}`)} et ${fx(`z₂ = ${z2}`)}. Donne le module r et l'argument principal θ de ${fx(`z = ${nomOp}`)}.`,
    rFaux:[[op==="x"?rF(r1)+rF(r2):rF(r1)*rF(r2),{etape:pre,type:op==="x"?"modules ajoutés":"modules multipliés au lieu de divisés",titre:"Où ça part : le module.",msg:op==="x"?"Le module d'un produit est le produit des modules, pas leur somme.":"Le module d'un quotient est le quotient des modules."}]],ens:{type:"op",op,r1:rF(r1),t1:angF(t1),z2:alg?[rF(a2),rF(b2)]:null,r2:rF(r2),t2:angF(t2)}});}

/* (a + ib)ⁿ en forme algébrique, par la forme exponentielle */
const BASES=[[Rd(1,2),3],[Rd(1,2),-3],[Rd(1,2),9],[Rd(1,2),-9],[Rd(2),2],[Rd(2),-2],[Rd(2),10],[Rd(2),-10],[Rd(2),4],[Rd(2),-4],[Rd(2),8],[Rd(2),-8],[Rd(1),2],[Rd(1),-4]];
function exoAB(o){const v=o.v,dern=o.etapes.length-1;
  function juge(rep){const P=rep.z||{},A=lisReel(P.a),B=lisReel(P.b);
    if(A.vide||B.vide)return {incomplet:"Remplis les deux cases a et b."};
    if(A.avecI||B.avecI)return {incomplet:"Dans chaque case, écris un nombre réel, sans i : pour 2 − 3i, a = 2 et b = −3."};
    if(A.illisible||A.neg||B.illisible||B.neg)return {incomplet:"Je n'arrive pas à lire une des cases. Écris un nombre, par exemple −8 ou 4√3."};
    const okA=pres(A.v,v[0]),okB=pres(B.v,v[1]);if(okA&&okB)return {ok:true};
    if((!okA&&A.dec&&Math.abs(A.v-v[0])<0.02)||(!okB&&B.dec&&Math.abs(B.v-v[1])<0.02))return {incomplet:"Écris la valeur exacte (avec √ si besoin), pas une valeur approchée."};
    const F=[];if(!okA)F.push("a");if(!okB)F.push("b");const pg=(o.pieges||[]).find(p=>pres(A.v,p[0][0])&&pres(B.v,p[0][1]));
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux cases sont à revoir":"la case "+F[0]+" est à revoir"}.`,diag:pg?pg[1]:pres(A.v,v[1])&&pres(B.v,v[0])?{etape:dern,type:"partie réelle et partie imaginaire échangées",titre:"Où ça part : lire a et b.",msg:LIRE_AB}:{etape:o.fin==null?dern:o.fin,type:"calcul",titre:"Où ça part : le calcul.",msg:`On trouve ${fx(`z = ${o.zs}`)}.`}};}
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[casesZ()],juge,etapes:o.etapes,bonne:fx(`z = ${o.zs}`),bonneTxt:`z = ${o.zs}`,repBonne:{z:o.rep},repFausse:{z:o.faux},nature:o.nature,ens:Object.assign({v},o.ens)};}
const cis=(r,T)=>{const f=rT(r)==="1"?"":rT(r);if(nul(T.s.c))return f?`${f} × ${rF(T.c)<0?"("+rT(T.c)+")":rT(T.c)}`:rT(T.c);
  if(nul(T.c.c))return f?`${f} × ${rF(T.s)<0?"("+rI(T.s)+")":rI(T.s)}`:rI(T.s);return `${f}(${zR(T.c,T.s)})`;};
function puissanceAlg(R){const [r0,m0]=R.choix(BASES),t0=Q(m0,12),{a:a0,b:b0}=algDe(r0,t0),n=R.ent(3,r0.s===2?14:rT(r0)==="1"?16:9);
  const rn=rpow(r0,n),brut=mul(t0,n),tt=angP(brut),{a,b}=algDe(rn,tt),T=trig(tt),base=zR(a0,b0),zs=zR(a,b);
  const E=[{w:`La base en forme exponentielle : ${fx(`|${base}| = ${rT(r0)}`)} et son argument est ${fx(angT(t0))}, donc ${fx(`${base} = ${expT(r0,t0)}`)}.`,why:`${RACINE_MOD} Puis cos θ et sin θ valent ${fx(rT(trig(t0).c))} et ${fx(rT(trig(t0).s))}.`,pts:1},
    {w:`Par la formule de Moivre : ${fx(`z = ${rT(r0)==="1"?"":(rT(r0)==="√2"?"(√2)":rT(r0))+`^{${n}} `}e^{i × ${n} × ${t0.n<0?"("+angT(t0)+")":angT(t0)}} = ${expT(rn,brut)}`)}.`,why:`${fx("(r e^{iθ})ⁿ = rⁿ e^{inθ}")}.${r0.s===2?` Et ${fx(`(√2)^{${n}} = ${rT(rn)}`)} : ${fx("(√2)² = 2")}.`:""}`,pts:1},
    {w:egal(brut,tt)?`${fx(angT(brut))} est déjà dans ]−π, π].`:`On enlève des tours complets : ${fx(`${angT(brut)} = ${angT(tt)} ${q(sub(brut,tt)).n<0?"−":"+"} ${angT(absQ(sub(brut,tt)))}`)}, et ${fx(`e^{${angE(sub(brut,tt))}} = 1`)} : l'angle est ${fx(angT(tt))}.`,why:"Un tour complet, 2π, ne change pas le point : on garde le reste.",pts:1},
    {w:`On revient à la forme algébrique : ${fx(`z = ${cis(rn,T)} = ${zs}`)}.`,why:`${fx("r e^{iθ} = r(cos θ + i sin θ)")}, avec ${fx(`cos(${angT(tt)}) = ${rT(T.c)}`)} et ${fx(`sin(${angT(tt)}) = ${rT(T.s)}`)}.`,pts:1},
    {w:`Donc ${fx(`a = ${rT(a)}`)} et ${fx(`b = ${rT(b)}`)}.`,why:LIRE_AB,pts:0.5}];
  const v=[rF(a),rF(b)],f=algDe(rn,angP(mul(tt,-1)));
  return exoAB({sig:"A"+base+"|"+n,v,zs,etapes:E,nature:r0.s===2?"base de module √2":"base de module 2",texte:`forme algébrique de (${base})^${n}`,q:`Donne la forme algébrique du nombre complexe ${fx(`z = ${zRp(a0,b0)}^{${n}}`)}.`,corps:`<p class="muted">Développer à la main serait très long : passe par la forme exponentielle de ${fx(base)}.</p>`,
    rep:{a:rTape(a),b:rTape(b)},faux:pres(rF(f.b),v[1])?{a:rTape(a)+"+1",b:rTape(b)}:{a:rTape(f.a),b:rTape(f.b)},
    pieges:[[[rF(f.a),rF(f.b)],{etape:2,type:"signe de l'angle",titre:"Où ça part : l'angle.",msg:`L'angle de ${fx("z")} est ${fx(angT(tt))} : regarde le signe de l'argument de ${fx(base)}, puis multiplie-le par ${n}.`}],
      [[rF(algDe(r0,tt).a),rF(algDe(r0,tt).b)],{etape:1,type:"module pas élevé à la puissance n",titre:"Où ça part : le module.",msg:`Le module de z est ${fx(`${rT(r0)}^{${n}} = ${rT(rn)}`)}.`}]],ens:{type:"puisAlg",base:[rF(a0),rF(b0)],n}});}
/* ---------- CA6 : y″ + ay′ + by = 0 ----------
   Une solution tapée avec des constantes est jugée par le calcul : pour plusieurs valeurs des constantes,
   ses valeurs en 8 points doivent être une combinaison des deux solutions de base (moindres carrés),
   et deux constantes doivent suffire à les obtenir toutes. */
const XS=[-1,-0.7,-0.4,-0.1,0.2,0.5,0.8,1.1];
const dot=(u,v)=>u.reduce((t,x,i)=>t+x*v[i],0),nrm=u=>Math.sqrt(dot(u,u));
function ajuste(Y,B){const n=B.length,M=B.map(f=>B.map(g=>dot(f,g))),b=B.map(f=>dot(f,Y)),c=resout(M,b);if(!c)return null;
  const res=Y.map((y,i)=>y-B.reduce((t,f,k)=>t+c[k]*f[i],0)),ech=B.reduce((t,f)=>t+nrm(f),0);return {c,ok:nrm(res)<=1e-7*Math.max(nrm(Y),ech*1e-3)};}
function resout(M,b){const n=b.length,A=M.map((r,i)=>r.concat([b[i]]));
  for(let j=0;j<n;j++){let p=j;for(let i=j;i<n;i++)if(Math.abs(A[i][j])>Math.abs(A[p][j]))p=i;if(Math.abs(A[p][j])<1e-14)return null;[A[j],A[p]]=[A[p],A[j]];
    for(let i=0;i<n;i++)if(i!==j){const k=A[i][j]/A[j][j];for(let t=j;t<=n;t++)A[i][t]-=k*A[j][t];}}
  return A.map((r,i)=>r[n]/r[i]);}
const rang2=V=>{if(!V.length)return 0;const m=V.reduce((t,v)=>Math.max(t,nrm(v)),0);if(m<1e-9)return 0;
  for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++)if(Math.abs(V[i][0]*V[j][1]-V[i][1]*V[j][0])>1e-6*nrm(V[i])*nrm(V[j]))return 2;return 1;};
/* lit « y = … » : l'arbre et ses constantes */
function lisY(t){const s=String(t==null?"":t),k=s.lastIndexOf("="),src=k>=0?s.slice(k+1):s;if(!propre(src))return {vide:1};
  const A=lis(src,["x"]);if(!A)return {illisible:1};return {A,cst:[...lettres(A)]};}
/* les valeurs aux points XS pour des valeurs des constantes ; null si un calcul échoue */
function valeurs(A,env){try{const V=XS.map(x=>val(A,Object.assign({x},env)));if(V.some(v=>!Number.isFinite(v[0])||!Number.isFinite(v[1])))return null;return V;}catch(e){return null;}}
/* « toutes les solutions » : rend ok, ou la raison */
function famille(Y,B){const cst=Y.cst;if(cst.length<2)return {pb:cst.length?"une":"aucune"};
  const env=v=>Object.fromEntries(cst.map((c,i)=>[c,v[i]])),z=cst.map(()=>0),Fb=B.map(f=>XS.map(f));
  const Vs=[z].concat(cst.map((c,i)=>cst.map((d,j)=>i===j?1:0)),[cst.map((c,i)=>0.7-1.3*i)]).map(v=>valeurs(Y.A,env(v)));
  if(Vs.some(v=>!v))return {pb:"calcul"};
  if(Vs.some(V=>V.some(v=>Math.abs(v[1])>1e-7*Math.max(1,Math.abs(v[0])))))return {pb:"complexe"};
  const R=Vs.map(V=>V.map(v=>v[0])),fits=R.map(Y0=>ajuste(Y0,Fb));
  if(fits.some(f=>!f||!f.ok))return {pb:"pasSolution",R};
  const base=fits[0].c,dir=fits.slice(1,1+cst.length).map(f=>f.c.map((x,k)=>x-base[k])),combo=cst.map((c,i)=>0.7-1.3*i);
  const pred=base.map((x,k)=>x+dir.reduce((t,d,i)=>t+combo[i]*d[k],0)),last=fits[fits.length-1].c;
  if(pred.some((x,k)=>Math.abs(x-last[k])>1e-6*Math.max(1,Math.abs(x))))return {pb:"nonlineaire"};
  if(rang2(dir)<2)return {pb:"rang"};
  return {ok:true};}
/* les nombres tapés dans un champ, séparés par « ; » ou « et » */
function lisListe(t){const s=String(t==null?"":t);if(!propre(s))return {vide:1};
  const L=s.split(/;| et /).map(x=>x.replace(/^[^=]*=/,"").trim()).filter(Boolean).map(lisCx);if(L.some(x=>x.vide||x.illisible))return {illisible:1};if(L.some(x=>x.neg))return {neg:1};return {L:L.map(x=>x.v)};}
function memeListe(L,att){if(L.length!==att.length)return false;const reste=att.slice();for(const v of L){const k=reste.findIndex(w=>presC(v,w));if(k<0)return false;reste.splice(k,1);}return true;}
const rx=r=>{r=q(r);const A=absQ(r),s=r.n<0?"−":"";return A.d===1?s+(A.n===1?"":A.n)+"x":s+(A.n===1?"":A.n)+"x/"+A.d;};
const ex=r=>`e^{${rx(r)}}`,exT=r=>`e^(${brut(r)}*x)`;
const bx=b=>b===1?"x":b+"x",trigT=(f,b)=>`${f}(${bx(b)})`;
const yEq=(k,p,c)=>`${S([[k,"y″"],[mul(k,p),"y′"],[mul(k,c),"y"]])} = 0`,carEq=(k,p,c)=>`${S([[k,"r²"],[mul(k,p),"r"],[mul(k,c),""]])} = 0`;
/* une équation tirée selon le cas : racines r1, r2 réelles distinctes, double, ou α ± iβ */
function tireED(R,cas){const k=R()<0.65?1:R.choix([2,3,-1,4]);let o;
  if(cas==="2"){let r1,r2;do{r1=R.nz(-5,5);r2=R.nz(-5,5);}while(r1===r2);o={cas,r1:Q(Math.min(r1,r2)),r2:Q(Math.max(r1,r2)),p:Q(-(r1+r2)),c:Q(r1*r2)};}
  else if(cas==="1"){const demi=R()<0.2,r=demi?Q(R.choix([1,3,5,-1,-3]),2):Q(R.nz(-6,6));o={cas,r,p:mul(r,-2),c:mul(r,r)};}
  else{const al=R.ent(-3,3),be=R.ent(1,4);o={cas,al:Q(al),be,p:Q(-2*al),c:Q(al*al+be*be)};}
  o.k=o.cas==="1"&&o.r.d===2?4:k;return o;}
function baseED(o){if(o.cas==="2"){const a=o.r1.n/o.r1.d,b=o.r2.n/o.r2.d;return [x=>Math.exp(a*x),x=>Math.exp(b*x)];}
  if(o.cas==="1"){const a=o.r.n/o.r.d;return [x=>Math.exp(a*x),x=>x*Math.exp(a*x)];}
  const a=o.al.n/o.al.d,b=o.be;return [x=>Math.exp(a*x)*Math.cos(b*x),x=>Math.exp(a*x)*Math.sin(b*x)];}
const racines=o=>o.cas==="2"?[[o.r1.n/o.r1.d,0],[o.r2.n/o.r2.d,0]]:o.cas==="1"?[[o.r.n/o.r.d,0],[o.r.n/o.r.d,0]]:[[o.al.n,o.be],[o.al.n,-o.be]];
const racT=o=>o.cas==="2"?`r₁ = ${nb(o.r1)} et r₂ = ${nb(o.r2)}`:o.cas==="1"?`r = ${nb(o.r)}, racine double`:`r = ${zt(Z(o.al,o.be))} et r = ${zt(Z(o.al,-o.be))}`;
const racTape=o=>o.cas==="2"?brut(o.r1)+";"+brut(o.r2):o.cas==="1"?brut(o.r):`${brut(o.al)}+${o.be}*i;${brut(o.al)}-${o.be}*i`.replace(/^0\+/,"").replace(/;0-/,";-");
function genT(o,C){const[c1,c2]=C||["C₁","C₂"];if(o.cas==="2")return `${c1}${ex(o.r1)} + ${c2}${ex(o.r2)}`;if(o.cas==="1")return `(${c1} + ${c2}x)${ex(o.r)}`;
  const tr=`${c1}cos(${bx(o.be)}) + ${c2}sin(${bx(o.be)})`;return nul(o.al)?tr:`${ex(o.al)}(${tr})`;}
function genTape(o){if(o.cas==="2")return `C1*${exT(o.r1)}+C2*${exT(o.r2)}`;if(o.cas==="1")return `(C1+C2*x)*${exT(o.r)}`;
  const tr=`C1*cos(${o.be}*x)+C2*sin(${o.be}*x)`;return nul(o.al)?tr:`${exT(o.al)}*(${tr})`;}
const fr2=r=>`(r ${q(r).n<0?"+":"−"} ${nb(absQ(r))})`;
const DELTA=o=>sub(mul(o.p,o.p),mul(4,o.c));
function etapesCar(o){const d=DELTA(o),E=[{w:`On cherche des solutions de la forme ${fx("y = e^{rx}")}. L'équation caractéristique (le cours dit : les racines du polynôme caractéristique) est ${fx(carEq(o.k,o.p,o.c))}${o.k!==1?`, c'est-à-dire ${fx(carEq(1,o.p,o.c))} après division par ${nb(o.k)}`:""}.`,why:`Avec ${fx("y = e^{rx}")}, ${fx("y′ = re^{rx}")} et ${fx("y″ = r²e^{rx}")} : on remplace y″ par r², y′ par r et y par 1, puis on simplifie par ${fx("e^{rx}")}, qui ne s'annule jamais.`,pts:1}];
  if(o.cas==="2")E.push({w:`${fx(`Δ = ${nb(mul(o.p,o.p))} − ${nb(mul(4,o.c)).replace(/^−/,"(−")+(mul(4,o.c).n<0?")":"")} = ${nb(d)}`)} &gt; 0 : deux racines réelles, ${fx(racT(o))}.`,why:`${fx("r = (−a ± √Δ)/2")}. Vérification : ${fx(`${fr2(o.r1)}${fr2(o.r2)} = ${carEq(1,o.p,o.c).replace(" = 0","")}`)}.`,pts:1});
  else if(o.cas==="1")E.push({w:`${fx(`Δ = ${nb(mul(o.p,o.p))} − ${nb(mul(4,o.c))} = 0`)} : une racine double, ${fx(`r = ${nb(o.r)}`)}.`,why:`${fx("r = −a/2")} quand Δ = 0. Vérification : ${fx(`(r ${o.r.n<0?"+":"−"} ${nb(absQ(o.r))})² = ${carEq(1,o.p,o.c).replace(" = 0","")}`)}.`,pts:1});
  else E.push({w:`${fx(`Δ = ${nb(mul(o.p,o.p))} − ${nb(mul(4,o.c))} = ${nb(d)}`)} &lt; 0 : deux racines complexes conjuguées, ${fx(racT(o))}, c'est-à-dire ${fx(`α = ${nb(o.al)}`)} et ${fx(`β = ${o.be}`)}.`,why:`${fx("r = (−a ± i√(−Δ))/2")}, avec ${fx(`√(${nb(mul(d,-1))}) = ${2*o.be}`)}.`,pts:1});
  E.push({w:`Toutes les solutions : ${fx(`y = ${genT(o)}`)}, où ${fx("C₁")} et ${fx("C₂")} sont deux constantes réelles.`,why:o.cas==="2"?"Deux racines réelles distinctes : une exponentielle pour chacune.":o.cas==="1"?`Racine double : ${fx(ex(o.r))} est solution, et ${fx(`x${ex(o.r)}`)} aussi. Sans le x, il manquerait des solutions.`:`Racines ${fx("α ± iβ")} : ${fx("y = e^{αx}(C₁cos(βx) + C₂sin(βx))")}${nul(o.al)?" ; ici α = 0, donc pas d'exponentielle":""}.`,pts:1});
  return E;}
const RAP_ED=`<p class="muted">Rappel : y″ + ay′ + by = 0 se résout avec l'équation caractéristique r² + ar + b = 0. Écris la solution avec x et deux constantes, par exemple C1*e^(2x) + C2*e^(-x).</p>`;
const SYM_Y=["e^(","x","C1","C2","cos(","sin(","^"];
function diagFamille(o,Y,f,E){const d=(type,msg)=>({etape:E,type,titre:"Où ça part : les solutions.",msg});
  if(f.pb==="aucune"||f.pb==="une")return d("constantes manquantes",`Une équation d'ordre 2 a deux constantes : ${fx(`y = ${genT(o)}`)}.`);
  if(f.pb==="complexe")return d("forme complexe au lieu de la forme réelle",`On attend des solutions réelles : avec des racines ${fx("α ± iβ")}, on écrit ${fx("e^{αx}(C₁cos(βx) + C₂sin(βx))")}.`);
  if(f.pb==="rang"||f.pb==="nonlineaire")return d(o.cas==="1"?"racine double sans le x":"deux constantes qui n'en font qu'une",o.cas==="1"?`Avec une racine double, ${fx(ex(o.r))} ne suffit pas : ${fx(`y = (C₁ + C₂x)${ex(o.r)}`)}.`:`Les deux constantes doivent multiplier deux fonctions différentes : ${fx(`y = ${genT(o)}`)}.`);
  return d(o.cas==="1"?"forme de la racine double":o.cas==="3"?"forme des racines complexes":"solution qui ne vérifie pas l'équation",`Ta formule ne vérifie pas l'équation pour toutes les valeurs des constantes. Avec ${fx(racT(o))} : ${fx(`y = ${genT(o)}`)}.`);}
function generaleED(R,cas){const o=tireED(R,cas),eq=yEq(o.k,o.p,o.c),E=etapesCar(o),att=racines(o),B=baseED(o);
  function juge(rep){const L=lisListe(rep.rac),Y=lisY(rep.y);
    if(L.vide||Y.vide)return {incomplet:"Remplis les deux champs : les racines, puis y."};
    if(L.neg)return {incomplet:"La racine carrée d'un nombre négatif n'existe pas dans ℝ : écris les racines complexes avec i, par exemple −1 + 2i ; −1 − 2i."};
    if(L.illisible)return {incomplet:"Je n'arrive pas à lire les racines. Sépare-les par « ; », par exemple 1 ; −3, ou 2 + i ; 2 − i."};
    if(Y.illisible)return {incomplet:"Je n'arrive pas à lire y. Écris par exemple C1*e^(2x) + C2*e^(-x), avec des parenthèses après e^."};
    const okR=memeListe(L.L,att)||(o.cas==="1"&&L.L.length===1&&presC(L.L[0],att[0])),f=famille(Y,B);
    if(f.pb==="calcul")return {incomplet:"Je n'arrive pas à calculer ta formule pour toutes les valeurs de x : vérifie les parenthèses."};
    if(okR&&f.ok)return {ok:true};
    const F=[];if(!okR)F.push("rac");if(!f.ok)F.push("y");
    const opp=memeListe(L.L.map(v=>[-v[0],-v[1]]),att)||(o.cas==="1"&&L.L.length===1&&presC([-L.L[0][0],-L.L[0][1]],att[0]));
    const d=!okR?(opp?{etape:0,type:"signes de l'équation caractéristique",titre:"Où ça part : l'équation caractéristique.",msg:`Tes racines ont le mauvais signe. On remplace y″ par r², y′ par r, y par 1, sans changer les signes : ${fx(carEq(1,o.p,o.c))}.`}
      :{etape:1,type:"racines de l'équation caractéristique",titre:"Où ça part : les racines.",msg:`Les racines de ${fx(carEq(1,o.p,o.c))} sont ${fx(racT(o))}.`}):diagFamille(o,Y,f,2);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les racines et la solution sont à revoir":F[0]==="rac"?"les racines sont à revoir":"la solution y est à revoir"}.`,diag:d};}
  const neg={cas:o.cas,k:o.k,p:mul(o.p,-1),c:o.c,r1:o.r1&&mul(o.r2,-1),r2:o.r1&&mul(o.r1,-1),r:o.r&&mul(o.r,-1),al:o.al&&mul(o.al,-1),be:o.be};
  return {sig:"H"+eq,q:`Résous l'équation différentielle ${fx(eq)} : donne les racines de son équation caractéristique, puis toutes ses solutions.`,corps:cas==="2"?RAP_ED:"",texte:`racines et solutions de ${eq}`,
    champs:[{k:"champ",id:"rac",nom:"racines",label:"Les racines :",ex:"séparées par ; par exemple 1 ; -3",sym:["i","√","/"],apercu:false},{k:"champ",id:"y",nom:"solutions",label:"$y =$",ex:"avec x et deux constantes C1 et C2",sym:SYM_Y,aide:"Écris e^(2x) avec des parenthèses. Les constantes peuvent s'appeler C1 et C2, ou A et B."}],
    juge,etapes:E,bonne:`${fx(racT(o))} ; ${fx(`y = ${genT(o)}`)}`,bonneTxt:`${racT(o)} ; y = ${genT(o)}`,repBonne:{rac:racTape(o),y:genTape(o)},repFausse:o.cas==="3"&&nul(o.al)?{rac:racTape(o),y:`C1*cos(${o.be}*x)`}:o.cas==="2"&&egal(o.r1,mul(o.r2,-1))?{rac:racTape(o),y:`C1*${exT(o.r1)}`}:{rac:racTape(neg),y:genTape(neg)},
    nature:{"2":"deux racines réelles","1":"racine double","3":"racines complexes"}[cas],ens:{type:"gen",k:o.k,p:o.p.n/o.p.d,c:o.c.n/o.c.d,rac:att}};}
/* avec y(0) et y′(0) : les deux constantes */
function conditionsED(R){const cas=R.choix(["2","2","1","3"]),o=tireED(R,cas),eq=yEq(o.k,o.p,o.c),E=etapesCar(o);let y0,y1;do{y0=R.ent(-3,3);y1=R.ent(-4,4);}while(!y0&&!y1);
  let C1,C2,dT,sysT,f1T,f2T;
  if(cas==="2"){C2=div(sub(y1,mul(o.r1,y0)),sub(o.r2,o.r1));C1=sub(y0,C2);dT=S([[o.r1,"C₁"+ex(o.r1)],[o.r2,"C₂"+ex(o.r2)]]);sysT=O.sys([[1,1],[o.r1,o.r2]],[y0,y1],["C₁","C₂"]);}
  else if(cas==="1"){C1=Q(y0);C2=sub(y1,mul(o.r,y0));dT=`(${S([[1,"C₂"],[o.r,"C₁"],[o.r,"C₂x"]])})${ex(o.r)}`;sysT=O.sys([[1,0],[o.r,1]],[y0,y1],["C₁","C₂"]);}
  else{C1=Q(y0);C2=div(sub(y1,mul(o.al,y0)),o.be);const cb=`cos(${bx(o.be)})`,sb=`sin(${bx(o.be)})`;
    dT=nul(o.al)?S([[-o.be,"C₁"+sb],[o.be,"C₂"+cb]]):`${ex(o.al)}((${S([[o.al,"C₁"],[o.be,"C₂"]])})${cb} + (${S([[o.al,"C₂"],[-o.be,"C₁"]])})${sb})`;sysT=O.sys([[1,0],[o.al,o.be]],[y0,y1],["C₁","C₂"]);}
  const B=baseED(o),yf=x=>(C1.n/C1.d)*B[0](x)+(C2.n/C2.d)*B[1](x);
  const solT=cas==="2"?S([[C1,ex(o.r1)],[C2,ex(o.r2)]]):cas==="1"?(nul(C2)?S([[C1,ex(o.r)]]):nul(C1)?S([[C2,"x"+ex(o.r)]]):`(${S([[C1,""],[C2,"x"]])})${ex(o.r)}`):(()=>{const tr=S([[C1,`cos(${bx(o.be)})`],[C2,`sin(${bx(o.be)})`]]);return nul(o.al)?tr:`${ex(o.al)}(${tr})`;})();
  const B1=cas==="2"?[exT(o.r1),exT(o.r2)]:cas==="1"?[exT(o.r),`x*${exT(o.r)}`]:[`${nul(o.al)?"":exT(o.al)+"*"}cos(${o.be}*x)`,`${nul(o.al)?"":exT(o.al)+"*"}sin(${o.be}*x)`];
  const solTape=`(${brut(C1)})*${B1[0]}+(${brut(C2)})*${B1[1]}`;
  E.push({w:`On dérive : ${fx(`y′ = ${dT}`)}.`,why:"Les conditions portent sur y et sur y′ : on calcule y′ avant de remplacer x par 0.",pts:1},
    {w:`${fx(`y(0) = ${nb(y0)}`)} et ${fx(`y′(0) = ${nb(y1)}`)} donnent le système ${sysT} Donc ${fx(`C₁ = ${nb(C1)}`)} et ${fx(`C₂ = ${nb(C2)}`)}.`,why:`En x = 0 : ${fx("e^{0} = 1")}, ${fx("cos 0 = 1")} et ${fx("sin 0 = 0")}.`,pts:1},
    {w:`${fx(`y = ${solT}`)}.`,why:"On remplace C₁ et C₂ dans la solution générale. Vérification : en x = 0, on retrouve y(0) et y′(0).",pts:1});
  function juge(rep){const Y=lisY(rep.y);if(Y.vide)return {incomplet:"Écris la solution y."};if(Y.illisible)return {incomplet:"Je n'arrive pas à lire y. Écris par exemple 2*e^(2x) - e^(3x), avec des parenthèses après e^."};
    if(Y.cst.length)return {incomplet:`Il reste ${Y.cst.length>1?"des constantes":"une constante"} (${Y.cst.join(", ")}) : utilise y(0) = ${nb(y0)} et y′(0) = ${nb(y1)} pour les calculer.`};
    const V=valeurs(Y.A,{});if(!V)return {incomplet:"Je n'arrive pas à calculer ta formule pour toutes les valeurs de x : vérifie les parenthèses."};
    if(V.every((v,i)=>Math.abs(v[1])<1e-9&&Math.abs(v[0]-yf(XS[i]))<=1e-7*Math.max(1,Math.abs(yf(XS[i])))))return {ok:true};
    const dans=ajuste(V.map(v=>v[0]),B.map(f=>XS.map(f)));let d;
    if(dans&&dans.ok){const c=dans.c,a0=c[0]*B[0](0)+c[1]*B[1](0);d=Math.abs(a0-y0)>1e-7?{etape:4,type:"condition y(0)",titre:"Où ça part : les constantes.",msg:`Ta fonction est bien solution de l'équation, mais elle ne vaut pas ${nb(y0)} en 0 : refais le système en C₁ et C₂.`}
      :{etape:3,type:"condition y′(0)",titre:"Où ça part : la dérivée.",msg:`Ta fonction vaut bien ${nb(y0)} en 0, mais sa dérivée en 0 n'est pas ${nb(y1)} : dérive la solution complète avant de remplacer x par 0.`};}
    else d={etape:2,type:"solution générale",titre:"Où ça part : les solutions.",msg:`Ta fonction ne vérifie pas l'équation. Les solutions sont ${fx(`y = ${genT(o)}`)}.`};
    return {ok:false,faux:["y"],resume:"Pas tout à fait : cette fonction n'est pas la bonne.",diag:d};}
  return {sig:"I"+eq+"|"+y0+"|"+y1,q:`Résous l'équation différentielle ${fx(eq)} avec les conditions initiales ${fx(`y(0) = ${nb(y0)}`)} et ${fx(`y′(0) = ${nb(y1)}`)}.`,corps:"",texte:`${eq}, y(0) = ${nb(y0)}, y′(0) = ${nb(y1)}`,
    champs:[{k:"champ",id:"y",nom:"solution",label:"$y =$",ex:"une fonction de x, sans constante",sym:SYM_Y.slice(0,2).concat(["cos(","sin(","/"]),aide:"Écris e^(2x) avec des parenthèses, et les fractions avec /."}],juge,etapes:E,
    bonne:fx(`y = ${solT}`),bonneTxt:`y = ${solT}`,repBonne:{y:solTape},repFausse:{y:`(${brut(C1)})*${B1[0]}+(${brut(add(C2,1))})*${B1[1]}`},nature:{"2":"deux racines réelles","1":"racine double","3":"racines complexes"}[cas],ens:{type:"ci",k:o.k,p:o.p.n/o.p.d,c:o.c.n/o.c.d,y0,y1}};}
/* ---------- CA7 : ordre 2 avec second membre ----------
   Une solution particulière exacte : polynôme, B xᵐ e^{kx}, (ax + b)e^{kx} ou α cos ωx + β sin ωx. */
const plusT=(a,b)=>b[0]==="−"?a+" − "+b.slice(1):a+" + "+b;
const ypT=y=>y.f==="poly"?S([[y.c[2],"x²"],[y.c[1],"x"],[y.c[0],""]]):y.f==="exp"?S([[y.B,(y.m===2?"x²":y.m===1?"x":"")+ex(y.k)]]):y.f==="lin"?`(${S([[y.a,"x"],[y.b,""]])})${ex(y.k)}`:S([[y.al,`cos(${bx(y.w)})`],[y.be,`sin(${bx(y.w)})`]]);
const ypTape=y=>y.f==="poly"?`(${brut(y.c[2])})*x^2+(${brut(y.c[1])})*x+(${brut(y.c[0])})`:y.f==="exp"?`(${brut(y.B)})*${y.m===2?"x^2*":y.m===1?"x*":""}${exT(y.k)}`:y.f==="lin"?`((${brut(y.a)})*x+(${brut(y.b)}))*${exT(y.k)}`:`(${brut(y.al)})*cos(${y.w}*x)+(${brut(y.be)})*sin(${y.w}*x)`;
const ypF=y=>{const F=v=>v.n/v.d;return y.f==="poly"?x=>F(y.c[0])+F(y.c[1])*x+F(y.c[2])*x*x:y.f==="exp"?x=>F(y.B)*Math.pow(x,y.m)*Math.exp(F(y.k)*x):y.f==="lin"?x=>(F(y.a)*x+F(y.b))*Math.exp(F(y.k)*x):x=>F(y.al)*Math.cos(y.w*x)+F(y.be)*Math.sin(y.w*x);};
/* y_p(0) et y_p′(0), exacts */
const yp0=y=>y.f==="poly"?[y.c[0],y.c[1]]:y.f==="exp"?(y.m===0?[y.B,mul(y.B,y.k)]:y.m===1?[Q(0),y.B]:[Q(0),Q(0)]):y.f==="lin"?[y.b,add(y.a,mul(y.b,y.k))]:[y.al,mul(y.be,y.w)];
function tireH(R,cas){let o;do o=tireED(R,cas);while(cas==="1"&&o.r.d!==1);o.k=1;return o;}
const Pk=(o,k)=>add(add(mul(k,k),mul(o.p,k)),o.c);
const estRacine=(o,k)=>nul(Pk(o,k));
/* le second membre et sa solution particulière, selon la sorte demandée */
function secondMembre(R,o,sorte){const P=k=>Pk(o,k);
  if(sorte==="cst"){const K=R.nz(-9,9),y={f:"poly",c:[div(K,o.c),Q(0),Q(0)]};return {f:nb(K),y,forme:"une constante c",why0:"Le second membre est une constante : on essaie une constante.",
    det:`${fx("y_{p}′ = y_{p}″ = 0")}, donc l'équation devient ${fx(`${S([[o.c,"c"]])} = ${nb(K)}`)} : ${fx(`c = ${nb(div(K,o.c))}`)}.`,piege:[{f:"poly",c:[Q(K),Q(0),Q(0)]},"second membre recopié sans diviser"]};}
  if(sorte==="poly"){const d=R()<0.5?1:2,a2=d===2?Q(R.nz(-3,3)):Q(0),a1=Q(d===2?R.ent(-4,4):R.nz(-4,4)),a0=Q(R.ent(-5,5)),p=o.p,c=o.c;
    const F2=mul(c,a2),F1=add(mul(c,a1),mul(mul(2,p),a2)),F0=add(add(mul(c,a0),mul(p,a1)),mul(2,a2)),y={f:"poly",c:[a0,a1,a2]};
    const lettre=d===2?"ax² + bx + c":"ax + b",der=d===2?`${fx("y_{p}′ = 2ax + b")} et ${fx("y_{p}″ = 2a")}`:`${fx("y_{p}′ = a")} et ${fx("y_{p}″ = 0")}`;
    const ident=d===2?`${fx(`${S([[c,"a"]])} = ${nb(F2)}`)}, ${fx(`${S([[c,"b"],[mul(2,p),"a"]])} = ${nb(F1)}`)} et ${fx(`${S([[c,"c"],[p,"b"],[2,"a"]])} = ${nb(F0)}`)}`:`${fx(`${S([[c,"a"]])} = ${nb(F1)}`)} et ${fx(`${S([[c,"b"],[p,"a"]])} = ${nb(F0)}`)}`;
    return {f:S([[F2,"x²"],[F1,"x"],[F0,""]]),y,forme:lettre,why0:`Le second membre est un polynôme de degré ${d} : on essaie un polynôme du même degré (0 n'est pas racine de l'équation caractéristique).`,
      det:`${der}. On remplace et on identifie les coefficients de chaque puissance de x : ${ident}. Donc ${d===2?`${fx(`a = ${nb(a2)}`)}, ${fx(`b = ${nb(a1)}`)}, ${fx(`c = ${nb(a0)}`)}`:`${fx(`a = ${nb(a1)}`)}, ${fx(`b = ${nb(a0)}`)}`}.`,piege:null};}
  if(sorte==="exp"){let k;do k=R.nz(-3,3);while(estRacine(o,k));const A=Q(R.nz(-6,6)),B=div(A,P(k)),y={f:"exp",B,m:0,k:Q(k)};
    return {f:S([[A,ex(Q(k))]]),y,forme:`B${ex(Q(k))}`,why0:`Le second membre est ${fx(S([[A,ex(Q(k))]]))}, et ${k} n'est pas racine de l'équation caractéristique : on essaie ${fx(`B${ex(Q(k))}`)}.`,
      det:`${fx(`y_{p}′ = ${S([[k,"B"+ex(Q(k))]])}`)} et ${fx(`y_{p}″ = ${S([[k*k,"B"+ex(Q(k))]])}`)}. En remplaçant : ${fx(`(${S([[k*k,""],[mul(o.p,k),""],[o.c,""]])})B = ${nb(A)}`)}, soit ${fx(`${nb(P(k))}B = ${nb(A)}`)} et ${fx(`B = ${nb(B)}`)}.`,piege:[{f:"exp",B:A,m:0,k:Q(k)},"B pris égal au coefficient du second membre"]};}
  if(sorte==="res"){/* k racine de l'équation caractéristique */const k=o.cas==="1"?o.r:R.choix([o.r1,o.r2]),m=o.cas==="1"?2:1,A=Q(R.nz(-6,6)),dd=o.cas==="1"?Q(2):add(mul(2,k),o.p),B=div(A,dd),y={f:"exp",B,m,k};
    return {f:S([[A,ex(k)]]),y,forme:`B${m===2?"x²":"x"}${ex(k)}`,why0:`${nb(k)} est racine ${m===2?"double":"simple"} de l'équation caractéristique : ${fx(`B${ex(k)}`)} est déjà solution de l'équation homogène et ne peut pas donner ${fx(S([[A,ex(k)]]))}. On multiplie par ${m===2?"x²":"x"}.`,
      det:m===2?`En remplaçant ${fx(`y_{p} = Bx²${ex(k)}`)}, tous les termes s'annulent sauf ${fx(`2B${ex(k)}`)} : ${fx(`2B = ${nb(A)}`)}, donc ${fx(`B = ${nb(B)}`)}.`:`En remplaçant ${fx(`y_{p} = Bx${ex(k)}`)}, les termes en x s'annulent (${fx(nb(k))} est racine) et il reste ${fx(`(${S([[mul(2,k),""],[o.p,""]])})B${ex(k)}`)} : ${fx(`${nb(dd)}B = ${nb(A)}`)}, donc ${fx(`B = ${nb(B)}`)}.`,piege:[{f:"exp",B,m:m===2?1:0,k},m===2?"racine double : x au lieu de x²":"x oublié"]};}
  if(sorte==="lin"){let k;do k=R.nz(-2,2);while(estRacine(o,k));const a=Q(R.nz(-3,3)),b=Q(R.ent(-3,3)),Pq=P(k),m1=mul(Pq,a),n1=add(mul(Pq,b),mul(add(mul(2,k),o.p),a)),y={f:"lin",a,b,k:Q(k)};
    return {f:`(${S([[m1,"x"],[n1,""]])})${ex(Q(k))}`,y,forme:`(ax + b)${ex(Q(k))}`,why0:`Le second membre est un polynôme de degré 1 fois ${fx(ex(Q(k)))}, et ${k} n'est pas racine : on essaie ${fx(`(ax + b)${ex(Q(k))}`)}.`,
      det:`En remplaçant et en simplifiant par ${fx(ex(Q(k)))} : ${fx(`${S([[Pq,"(ax + b)"],[add(mul(2,k),o.p),"a"]])} = ${S([[m1,"x"],[n1,""]])}`)}. Donc ${fx(`a = ${nb(a)}`)} et ${fx(`b = ${nb(b)}`)}.`,piege:null};}
  /* cos ou sin */const w=R.ent(1,3),A=Q(R.nz(-5,5)),cosi=R()<0.5,u=sub(o.c,w*w),D=add(mul(u,u),mul(mul(o.p,o.p),w*w));
  let al,be;if(cosi){al=div(mul(A,u),D);be=div(mul(mul(A,o.p),w),D);}else{al=div(mul(mul(A,o.p),-w),D);be=div(mul(A,u),D);}
  return {f:S([[A,`${cosi?"cos":"sin"}(${bx(w)})`]]),y:{f:"trig",al,be,w},forme:`α cos(${bx(w)}) + β sin(${bx(w)})`,why0:`Le second membre est ${cosi?"un cosinus":"un sinus"} : on essaie ${fx(`α cos(${bx(w)}) + β sin(${bx(w)})`)}, les deux à la fois.`,
    det:`En remplaçant, et en identifiant les coefficients de ${fx(`cos(${bx(w)})`)} et de ${fx(`sin(${bx(w)})`)} : ${fx(`${S([[u,"α"],[mul(o.p,w),"β"]])} = ${cosi?nb(A):"0"}`)} et ${fx(`${S([[u,"β"],[mul(o.p,-w),"α"]])} = ${cosi?"0":nb(A)}`)}. Donc ${fx(`α = ${nb(al)}`)} et ${fx(`β = ${nb(be)}`)}.`,piege:null};}
function exoSM(R,cas,sorte){let o,M;for(;;){o=tireH(R,cas);if(sorte!=="cst"&&sorte!=="poly"||!nul(o.c)){if(sorte==="trig"&&nul(o.p))continue;M=secondMembre(R,o,sorte);break;}}
  const eq=`${S([[1,"y″"],[o.p,"y′"],[o.c,"y"]])} = ${M.f}`,B=baseED(o),yf=ypF(M.y),yh=genT(o),gen=plusT(yh,ypT(M.y));
  const E=[{w:`L'équation homogène ${fx(yEq(1,o.p,o.c))} : l'équation caractéristique ${fx(carEq(1,o.p,o.c))} a pour racines ${fx(racT(o))}, donc ${fx(`y_{h} = ${yh}`)}.`,why:`Toutes les solutions s'écrivent ${fx("y = y_{h} + y_{p}")} : les solutions de l'équation sans second membre, plus une solution particulière.`,pts:1},
    {w:`On cherche ${fx("y_{p}")} de la forme ${fx(M.forme)}.`,why:M.why0,pts:1},
    {w:M.det,why:`On remplace ${fx("y_{p}")}, ${fx("y_{p}′")} et ${fx("y_{p}″")} dans l'équation, puis on identifie les deux membres.`,pts:1},
    {w:`${fx(`y_{p} = ${ypT(M.y)}`)}, et toutes les solutions : ${fx(`y = ${gen}`)}.`,why:"On ajoute la solution particulière aux solutions de l'équation homogène.",pts:1}];
  return {o,M,eq,B,yf,E,gen};}
function familleP(Y,B,yf){const V=valeurs(Y.A,Object.fromEntries(Y.cst.map(c=>[c,0])));if(!V)return {pb:"calcul"};
  const D=V.map((v,i)=>v[0]-yf(XS[i])),f=ajuste(D,B.map(g=>XS.map(g)));if(!f||!f.ok)return {pb:"pasSolution"};
  const dir=Y.cst.map((c,i)=>{const W=valeurs(Y.A,Object.fromEntries(Y.cst.map((d,j)=>[d,i===j?1:0])));return W&&W.map((w,k)=>w[0]-V[k][0]);});
  if(dir.some(x=>!x))return {pb:"calcul"};const C=dir.map(d=>{const g=ajuste(d,B.map(h=>XS.map(h)));return g&&g.ok?g.c:null;});
  if(C.some(x=>!x))return {pb:"pasSolution"};if(Y.cst.length<2)return {pb:Y.cst.length?"une":"aucune"};if(rang2(C)<2)return {pb:"rang"};return {ok:true};}
function particuliere(R,cas,sorte){const X=exoSM(R,cas,sorte),{o,M,eq,B,yf,E,gen}=X;
  function juge(rep){const P=lisY(rep.yp),Y=lisY(rep.y);
    if(P.vide||Y.vide)return {incomplet:"Remplis les deux champs : une solution particulière, puis toutes les solutions."};
    if(P.illisible||Y.illisible)return {incomplet:"Je n'arrive pas à lire une des formules. Écris par exemple 2*x*e^(3x), avec des parenthèses après e^."};
    if(P.cst.length)return {incomplet:"Une solution particulière n'a pas de constante C1 ou C2 : c'est une seule fonction."};
    const V=valeurs(P.A,{});if(!V)return {incomplet:"Je n'arrive pas à calculer ta formule pour toutes les valeurs de x : vérifie les parenthèses."};
    const Dp=V.map((v,i)=>v[0]-yf(XS[i])),fp=V.every(v=>Math.abs(v[1])<1e-9)&&ajuste(Dp,B.map(g=>XS.map(g))),okP=!!(fp&&fp.ok),fy=familleP(Y,B,yf);
    if(fy.pb==="calcul")return {incomplet:"Je n'arrive pas à calculer la formule de y pour toutes les valeurs de x : vérifie les parenthèses."};
    if(okP&&fy.ok)return {ok:true};
    const F=[];if(!okP)F.push("yp");if(!fy.ok)F.push("y");let d;
    if(!okP){const pg=M.piege&&ypF(M.piege[0]),ressemble=pg&&V.every((v,i)=>Math.abs(v[0]-pg(XS[i]))<1e-7*Math.max(1,Math.abs(pg(XS[i]))));
      const homog=ajuste(V.map(v=>v[0]),B.map(g=>XS.map(g)));
      d=ressemble?{etape:M.piege[1].includes("x")?1:2,type:M.piege[1],titre:"Où ça part : la solution particulière.",msg:`Ta fonction ne vérifie pas l'équation. ${M.why0}`}
        :homog&&homog.ok?{etape:1,type:"solution de l'équation homogène prise pour y_p",titre:"Où ça part : la solution particulière.",msg:`Ta fonction est solution de l'équation sans second membre : elle donne 0, pas ${fx(M.f)}. ${M.why0}`}
        :{etape:2,type:"calcul de la solution particulière",titre:"Où ça part : les coefficients.",msg:`Ta fonction ne vérifie pas l'équation. On trouve ${fx(`y_{p} = ${ypT(M.y)}`)}.`};}
    else d=fy.pb==="pasSolution"?{etape:3,type:"y_p oubliée dans la solution générale",titre:"Où ça part : toutes les solutions.",msg:`Toutes les solutions s'écrivent ${fx("y_{h} + y_{p}")} : ${fx(`y = ${gen}`)}.`}:{etape:0,type:"deux constantes",titre:"Où ça part : l'équation homogène.",msg:`Il faut les deux constantes de l'équation homogène : ${fx(`y = ${gen}`)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux réponses sont à revoir":F[0]==="yp"?"la solution particulière est à revoir":"la solution générale est à revoir"}.`,diag:d};}
  const pgF=M.piege&&ypF(M.piege[0]),pgMeme=pgF&&XS.every(x=>Math.abs(pgF(x)-yf(x))<1e-9),fauxP=M.piege&&!pgMeme?ypTape(M.piege[0]):`(${ypTape(M.y)})+1`;
  return {sig:"S"+eq,q:`Résous l'équation différentielle ${fx(eq)} : donne une solution particulière ${fx("y_{p}")}, puis toutes les solutions.`,corps:sorte==="cst"?`<p class="muted">Rappel : toutes les solutions = les solutions de l'équation sans second membre + une solution particulière. Pour un second membre constant, essaie une constante.</p>`:"",texte:`solution particulière et solutions de ${eq}`,
    champs:[{k:"champ",id:"yp",nom:"solution particulière",label:"$y_{p} =$",ex:"une fonction de x, sans constante",sym:SYM_Y.slice(0,2).concat(["cos(","sin(","/"])},{k:"champ",id:"y",nom:"solutions",label:"$y =$",ex:"avec x et deux constantes C1 et C2",sym:SYM_Y,aide:"Écris e^(2x) avec des parenthèses, les fractions avec /."}],
    juge,etapes:E,bonne:`${fx(`y_{p} = ${ypT(M.y)}`)} ; ${fx(`y = ${gen}`)}`,bonneTxt:`yp = ${ypT(M.y)} ; y = ${gen}`,repBonne:{yp:ypTape(M.y),y:`${genTape(o)}+${ypTape(M.y)}`},repFausse:{yp:fauxP,y:`${genTape(o)}+${fauxP}`},
    nature:{cst:"second membre constant",poly:"polynôme",exp:"exponentielle",res:"exponentielle déjà solution",lin:"polynôme fois exponentielle",trig:"cosinus ou sinus"}[sorte],ens:{type:"sm",p:o.p.n/o.p.d,c:o.c.n/o.c.d,f:M.f,yp:ypTape(M.y)}};}
const SORTES5=[["2","cst"],["2","poly"],["2","exp"],["3","exp"],["1","exp"],["2","res"],["1","res"],["2","lin"],["3","lin"],["2","trig"],["1","trig"]];
function conditionsSM(R){const [cas,sorte]=R.choix(SORTES5),X=exoSM(R,cas,sorte),{o,M,eq,B,yf,E,gen}=X;let y0,y1;do{y0=R.ent(-2,3);y1=R.ent(-3,3);}while(!y0&&!y1);
  const [p0,p1]=yp0(M.y),A=o.cas==="2"?[[1,1],[o.r1,o.r2]]:o.cas==="1"?[[1,0],[o.r,1]]:[[1,0],[o.al,o.be]],b=[sub(y0,p0),sub(y1,p1)];
  const det=sub(mul(A[0][0],A[1][1]),mul(A[0][1],A[1][0])),C1=div(sub(mul(b[0],A[1][1]),mul(A[0][1],b[1])),det),C2=div(sub(mul(A[0][0],b[1]),mul(A[1][0],b[0])),det);
  const Bf=B,full=x=>(C1.n/C1.d)*Bf[0](x)+(C2.n/C2.d)*Bf[1](x)+yf(x);
  const hT=o.cas==="2"?S([[C1,ex(o.r1)],[C2,ex(o.r2)]]):o.cas==="1"?(nul(C2)?S([[C1,ex(o.r)]]):nul(C1)?S([[C2,"x"+ex(o.r)]]):`(${S([[C1,""],[C2,"x"]])})${ex(o.r)}`):(()=>{const tr=S([[C1,`cos(${bx(o.be)})`],[C2,`sin(${bx(o.be)})`]]);return nul(o.al)?tr:`${ex(o.al)}(${tr})`;})();
  const solT=nul(C1)&&nul(C2)?ypT(M.y):plusT(hT,ypT(M.y)),B1=o.cas==="2"?[exT(o.r1),exT(o.r2)]:o.cas==="1"?[exT(o.r),`x*${exT(o.r)}`]:[`${nul(o.al)?"":exT(o.al)+"*"}cos(${o.be}*x)`,`${nul(o.al)?"":exT(o.al)+"*"}sin(${o.be}*x)`];
  E.push({w:`On dérive la solution complète, puis ${fx(`y(0) = ${nb(y0)}`)} et ${fx(`y′(0) = ${nb(y1)}`)} donnent : ${O.sys(A,b,["C₁","C₂"])} Donc ${fx(`C₁ = ${nb(C1)}`)} et ${fx(`C₂ = ${nb(C2)}`)}.`,why:`Les conditions portent sur la solution complète ${fx("y_{h} + y_{p}")}, pas sur ${fx("y_{h}")} seule : ici ${fx(`y_{p}(0) = ${nb(p0)}`)} et ${fx(`y_{p}′(0) = ${nb(p1)}`)} passent de l'autre côté.`,pts:1.5},
    {w:`${fx(`y = ${solT}`)}.`,why:"On remplace C₁ et C₂. Vérification : en x = 0, on retrouve y(0) et y′(0).",pts:1});
  function juge(rep){const Y=lisY(rep.y);if(Y.vide)return {incomplet:"Écris la solution y."};if(Y.illisible)return {incomplet:"Je n'arrive pas à lire y. Écris par exemple 2*e^(2x) - x*e^(x), avec des parenthèses après e^."};
    if(Y.cst.length)return {incomplet:`Il reste ${Y.cst.length>1?"des constantes":"une constante"} (${Y.cst.join(", ")}) : utilise y(0) = ${nb(y0)} et y′(0) = ${nb(y1)} pour les calculer.`};
    const V=valeurs(Y.A,{});if(!V)return {incomplet:"Je n'arrive pas à calculer ta formule pour toutes les valeurs de x : vérifie les parenthèses."};
    if(V.every((v,i)=>Math.abs(v[1])<1e-9&&Math.abs(v[0]-full(XS[i]))<=1e-7*Math.max(1,Math.abs(full(XS[i])))))return {ok:true};
    const Dp=V.map((v,i)=>v[0]-yf(XS[i])),f=ajuste(Dp,B.map(g=>XS.map(g))),h=ajuste(V.map(v=>v[0]),B.map(g=>XS.map(g)));
    const d=f&&f.ok?{etape:4,type:"constantes avec les conditions initiales",titre:"Où ça part : les constantes.",msg:`Ta fonction vérifie bien l'équation, mais pas les conditions. Dérive la solution complète ${fx("y_{h} + y_{p}")}, puis remplace x par 0 dans y et dans y′.`}
      :h&&h.ok?{etape:3,type:"y_p oubliée",titre:"Où ça part : la solution particulière.",msg:"Ta fonction est solution de l'équation sans second membre : il manque la solution particulière."}
      :{etape:2,type:"solution particulière",titre:"Où ça part : la solution particulière.",msg:`Ta fonction ne vérifie pas l'équation. ${M.why0}`};
    return {ok:false,faux:["y"],resume:"Pas tout à fait : cette fonction n'est pas la bonne.",diag:d};}
  return {sig:"T"+eq+"|"+y0+"|"+y1,q:`Résous l'équation différentielle ${fx(eq)} avec les conditions initiales ${fx(`y(0) = ${nb(y0)}`)} et ${fx(`y′(0) = ${nb(y1)}`)}.`,corps:"",texte:`${eq}, y(0) = ${y0}, y′(0) = ${y1}`,
    champs:[{k:"champ",id:"y",nom:"solution",label:"$y =$",ex:"une fonction de x, sans constante",sym:SYM_Y.slice(0,2).concat(["cos(","sin(","/"]),aide:"Écris e^(2x) avec des parenthèses, et les fractions avec /."}],juge,etapes:E,
    bonne:fx(`y = ${solT}`),bonneTxt:`y = ${solT}`,repBonne:{y:`(${brut(C1)})*${B1[0]}+(${brut(C2)})*${B1[1]}+${ypTape(M.y)}`},repFausse:{y:`(${brut(C1)})*${B1[0]}+(${brut(C2)})*${B1[1]}`},
    nature:{cst:"second membre constant",poly:"polynôme",exp:"exponentielle",res:"exponentielle déjà solution",lin:"polynôme fois exponentielle",trig:"cosinus ou sinus"}[sorte],ens:{type:"smci",p:o.p.n/o.p.d,c:o.c.n/o.c.d,f:M.f,y0,y1}};}
/* ---------- CA3 : Moivre et Euler ----------
   La réponse est une formule en θ : sa valeur est comparée en plusieurs angles, et sa forme est lue sur l'arbre
   (seulement cos θ, seulement sin θ, ou « linéarisée » : aucun carré ni produit de cosinus et de sinus). */
const VT=["θ","x","t"],TH=[0.3,0.7,1.3,2.1,-0.8,2.9];
const envT=v=>({θ:v,x:v,t:v});
function trigs(A,L){L=L||[];if(!A)return L;if(A.t==="f"&&(A.f==="cos"||A.f==="sin")){let k=null;try{const u=val(A.a,envT(1)),w=val(A.a,envT(2));if(Math.abs(u[1])<1e-12&&Math.abs(w[0]-2*u[0])<1e-12&&Math.abs(u[0]-Math.round(u[0]))<1e-12)k=Math.round(u[0]);}catch(e){}L.push({f:A.f,k});}
  ["a","l","r"].forEach(x=>A[x]&&!(A.t==="f"&&x==="a"&&(A.f==="cos"||A.f==="sin"))&&trigs(A[x],L));return L;}
function degT(A){switch(A.t){case "n":case "pi":case "e":case "i":return 0;case "c":case "v":return Infinity;
  case "f":return A.f==="cos"||A.f==="sin"?(trigs({t:"f",f:A.f,a:A.a})[0].k===null?Infinity:1):Infinity;
  case "+":case "-":return Math.max(degT(A.l),degT(A.r));case "*":return degT(A.l)+degT(A.r);
  case "/":return degT(A.r)===0?degT(A.l):Infinity;case "-u":return degT(A.a);
  case "^":{if(degT(A.r)!==0)return Infinity;let n;try{n=val(A.r,{})[0];}catch(e){return Infinity;}return Number.isInteger(n)&&n>=0?n*degT(A.l):Infinity;}}return Infinity;}
const FORME={cos:"avec seulement cos θ (pas de sin, pas de cos(2θ))",sin:"avec seulement sin θ (pas de cos, pas de sin(2θ))",cs:"avec seulement cos θ et sin θ (pas de cos(2θ) ni de sin(3θ))",lin:"sans puissance ni produit de cosinus et de sinus : seulement des cos(kθ) et des sin(kθ), et des nombres"};
function formeOK(A,mode){const L=trigs(A);if(mode==="lin")return degT(A)<=1;
  if(L.some(t=>t.k!==1))return false;if(mode==="cos")return L.every(t=>t.f==="cos");if(mode==="sin")return L.every(t=>t.f==="sin");return true;}
const SYM_T=["cos(θ)","sin(θ)","θ","^","/","(",")"];
/* o : mode, cible (θ ↦ valeur), lab (le membre de gauche), ans, tape, pieges [[fonction, diag]], etapes */
function exoF(o){const dern=o.etapes.length-1;
  function juge(rep){const t=String(rep.f==null?"":rep.f),k=t.lastIndexOf("="),src=k>=0?t.slice(k+1):t;if(!propre(src))return {incomplet:"Écris la formule."};
    const A=lis(src,VT);if(!A)return {incomplet:"Je n'arrive pas à lire la formule. Écris par exemple 2cos(θ)^2 - 1, avec des parenthèses."};
    const L=[...lettres(A)];if(L.length)return {incomplet:`Je ne connais pas la lettre ${L[0]} : écris la formule avec θ (ou x).`};
    let V;try{V=TH.map(v=>val(A,envT(v)));}catch(e){return {incomplet:"Je n'arrive pas à calculer ta formule : vérifie les parenthèses."};}
    const juste=V.every((v,i)=>Math.abs(v[1])<1e-9&&Math.abs(v[0]-o.cible(TH[i]))<1e-9);
    if(juste&&formeOK(A,o.mode))return {ok:true};
    if(juste)return {incomplet:`C'est égal, mais ce n'est pas encore la forme demandée : écris-la ${FORME[o.mode]}.`};
    const pg=(o.pieges||[]).find(p=>V.every((v,i)=>Math.abs(v[0]-p[0](TH[i]))<1e-9));
    return {ok:false,faux:["f"],resume:"Pas tout à fait : ta formule ne donne pas la bonne valeur pour tous les θ.",diag:pg?pg[1]:{etape:o.fin==null?dern:o.fin,type:o.type||"formule",titre:"Où ça part : le calcul.",msg:`On trouve ${fx(`${o.lab} = ${o.ans}`)}. Essaie ta formule avec θ = 0 : elle doit donner ${dec(o.cible(0))}.`}};}
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[{k:"champ",id:"f",nom:"formule",label:`$${o.lab} =$`,ex:"une formule en θ",sym:SYM_T,aide:"Les boutons écrivent cos(θ) et sin(θ). Pour un carré, écris cos(θ)^2."}],juge,etapes:o.etapes,
    bonne:fx(`${o.lab} = ${o.ans}`),bonneTxt:`${o.lab} = ${o.ans}`,repBonne:{f:o.tape},repFausse:{f:o.faux||`(${o.tape})+1`},nature:o.nature,ens:Object.assign({type:"f",mode:o.mode},o.ens)};}
const dec=v=>String(+v.toFixed(4)).replace(".",",").replace("-","−");
/* une valeur exacte tapée : o.v (nombre), o.vT (écriture), o.tape, pieges [[valeur, diag]] */
function exoN(o){const dern=o.etapes.length-1;
  function juge(rep){const A=lisReel(rep.v);if(A.vide)return {incomplet:"Écris la valeur."};if(A.avecI)return {incomplet:"Le résultat est un nombre réel : pas de i."};if(A.illisible||A.neg)return {incomplet:"Je n'arrive pas à lire ce nombre. Écris par exemple -7/9 ou 24/25."};
    if(pres(A.v,o.v))return {ok:true};if(A.dec&&Math.abs(A.v-o.v)<0.02)return {incomplet:"Écris la valeur exacte, avec une fraction, pas une valeur approchée."};
    const pg=(o.pieges||[]).find(p=>pres(A.v,p[0]));
    return {ok:false,faux:["v"],resume:"Pas tout à fait : ce n'est pas la bonne valeur.",diag:pg?pg[1]:{etape:dern,type:o.type||"calcul",titre:"Où ça part : le calcul.",msg:`On trouve ${fx(`${o.lab} = ${o.vT}`)}.`}};}
  const f0=(o.pieges||[]).find(p=>!pres(p[0],o.v));
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[{k:"champ",id:"v",nom:"valeur",label:`$${o.lab} =$`,ex:"une valeur exacte, par exemple -7/9",sym:["/","√"]}],juge,etapes:o.etapes,
    bonne:fx(`${o.lab} = ${o.vT}`),bonneTxt:`${o.lab} = ${o.vT}`,repBonne:{v:o.tape},repFausse:{v:f0?String(f0[0]):`(${o.tape})+1`},nature:o.nature,ens:Object.assign({type:"n"},o.ens)};}
const MOIVRE2={w:`Formule de Moivre avec n = 2 : ${fx("(cos θ + i sin θ)² = cos(2θ) + i sin(2θ)")}. On développe le membre de gauche : ${fx("cos²θ + 2i sin θ cos θ + i²sin²θ = (cos²θ − sin²θ) + i(2 sin θ cos θ)")}.`,why:`${fx("(a + b)² = a² + 2ab + b²")}, et ${fx("i² = −1")}. La formule de Moivre vient de ${fx("(e^{iθ})² = e^{2iθ}")}.`,pts:1};
const IDENT2={w:`On identifie les parties réelles et les parties imaginaires : ${fx("cos(2θ) = cos²θ − sin²θ")} et ${fx("sin(2θ) = 2 sin θ cos θ")}.`,why:"Deux complexes égaux ont la même partie réelle et la même partie imaginaire.",pts:1};
const PYTH="Avec cos²θ + sin²θ = 1 : on remplace sin²θ par 1 − cos²θ, ou cos²θ par 1 − sin²θ.";
const FR=[[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,6],[5,6],[2,7],[3,7],[5,7],[1,8],[3,8],[5,8],[7,8],[1,9],[2,9],[4,9],[5,9],[7,9],[8,9],[3,10],[7,10],[9,10]];
const TRIPLE=[[3,5],[4,5],[5,13],[12,13],[8,17],[15,17],[7,25],[24,25]];
const C=Math.cos,Sn=Math.sin;
function double(R){const t=R();
  if(t<0.4){const v=R.choix(["c","s","cs","s2"]),D={
      c:{lab:"cos(2θ)",mode:"cos",ans:"2cos²θ − 1",tape:"2cos(θ)^2-1",f:x=>C(2*x),q:"Exprime cos(2θ) en fonction de cos θ seulement.",fin:{w:`${PYTH} ${fx("cos(2θ) = cos²θ − (1 − cos²θ) = 2cos²θ − 1")}.`,why:"On veut une formule qui ne contient plus que cos θ.",pts:1},pg:[[x=>1-2*C(x)**2,"signe"],[x=>2*C(x)**2,"le − 1 oublié"]]},
      s:{lab:"cos(2θ)",mode:"sin",ans:"1 − 2sin²θ",tape:"1-2sin(θ)^2",f:x=>C(2*x),q:"Exprime cos(2θ) en fonction de sin θ seulement.",fin:{w:`${PYTH} ${fx("cos(2θ) = (1 − sin²θ) − sin²θ = 1 − 2sin²θ")}.`,why:"On veut une formule qui ne contient plus que sin θ.",pts:1},pg:[[x=>2*Sn(x)**2-1,"signe"],[x=>1-Sn(x)**2,"un seul sin²θ enlevé"]]},
      cs:{lab:"cos(2θ)",mode:"cs",ans:"cos²θ − sin²θ",tape:"cos(θ)^2-sin(θ)^2",f:x=>C(2*x),q:"Exprime cos(2θ) en fonction de cos θ et de sin θ.",pg:[[x=>Sn(x)**2-C(x)**2,"signe"],[()=>1,"i² compté comme +1"]]},
      s2:{lab:"sin(2θ)",mode:"cs",ans:"2 sin θ cos θ",tape:"2sin(θ)cos(θ)",f:x=>Sn(2*x),q:"Exprime sin(2θ) en fonction de cos θ et de sin θ.",pg:[[x=>Sn(x)*C(x),"le facteur 2 oublié"]]}}[v];
    const E=[MOIVRE2,IDENT2];if(D.fin)E.push(D.fin);
    return exoF({sig:"D"+v,mode:D.mode,cible:D.f,lab:D.lab,ans:D.ans,tape:D.tape,q:D.q+" Indication : la formule de Moivre.",corps:`<p class="muted">Formule de Moivre : ${fx("(cos θ + i sin θ)ⁿ = cos(nθ) + i sin(nθ)")}.</p>`,etapes:E,nature:"formule de cos 2θ",texte:D.q,
      pieges:D.pg.map(([g,ty])=>[g,{etape:ty==="i² compté comme +1"?0:E.length-1,type:ty,titre:"Où ça part : la formule.",msg:`${fx(`${D.lab} = ${D.ans}`)} : ${ty==="signe"?"vérifie avec θ = 0, où cos(0) = 1 et sin(0) = 0.":ty==="i² compté comme +1"?"en développant, i² = −1 donne un signe −.":"vérifie avec θ = 0."}`}]),ens:{cible:v}});}
  const [n,d]=R.choix(FR),sg=R()<0.5?1:-1;
  if(t<0.6){const a=Q(sg*n,d),v=sub(mul(2,mul(a,a)),1);
    return exoN({sig:"Nc"+brut(a),v:v.n/v.d,vT:nb(v),tape:brut(v),lab:"cos(2θ)",q:`On sait que ${fx(`cos θ = ${nb(a)}`)}. Calcule la valeur exacte de ${fx("cos(2θ)")}.`,etapes:[
      {w:`${fx("cos(2θ) = 2cos²θ − 1")}.`,why:`C'est la formule de Moivre avec n = 2 : ${fx("cos(2θ) = cos²θ − sin²θ")}, puis ${fx("sin²θ = 1 − cos²θ")}.`,pts:1},
      {w:`${fx(`cos(2θ) = 2 × (${nb(a)})² − 1 = 2 × ${nb(mul(a,a))} − 1 = ${nb(v)}`)}.`,why:"On remplace cos θ par sa valeur. Le carré d'un nombre négatif est positif.",pts:1}],
      pieges:[[2*a.n/a.d,{etape:0,type:"cos(2θ) pris pour 2cos θ",titre:"Où ça part : la formule.",msg:`${fx("cos(2θ)")} n'est pas ${fx("2cos θ")} : c'est ${fx("2cos²θ − 1")}.`}],[2*(a.n/a.d)**2,{etape:0,type:"le − 1 oublié",titre:"Où ça part : la formule.",msg:`${fx("cos(2θ) = 2cos²θ − 1")} : il manque le ${fx("− 1")}.`}],[1-2*(a.n/a.d)**2,{etape:0,type:"signe",titre:"Où ça part : la formule.",msg:`${fx("cos(2θ) = 2cos²θ − 1")}, pas ${fx("1 − 2cos²θ")} : vérifie avec θ = 0.`}]],nature:"cos 2θ en nombres",texte:`cos θ = ${nb(a)}, cos 2θ ?`,ens:{a:a.n/a.d,quoi:"c2"}});}
  if(t<0.8){const a=Q(sg*n,d),v=sub(1,mul(2,mul(a,a)));
    return exoN({sig:"Ns"+brut(a),v:v.n/v.d,vT:nb(v),tape:brut(v),lab:"cos(2θ)",q:`On sait que ${fx(`sin θ = ${nb(a)}`)}. Calcule la valeur exacte de ${fx("cos(2θ)")}.`,etapes:[
      {w:`${fx("cos(2θ) = 1 − 2sin²θ")}.`,why:`${fx("cos(2θ) = cos²θ − sin²θ")} (Moivre), puis ${fx("cos²θ = 1 − sin²θ")}.`,pts:1},
      {w:`${fx(`cos(2θ) = 1 − 2 × ${nb(mul(a,a))} = ${nb(v)}`)}.`,why:"On remplace sin θ par sa valeur.",pts:1}],
      pieges:[[-(v.n/v.d),{etape:0,type:"signe",titre:"Où ça part : la formule.",msg:`${fx("cos(2θ) = 1 − 2sin²θ")} : vérifie avec θ = 0, où sin 0 = 0 et cos 0 = 1.`}],[1-(a.n/a.d)**2,{etape:0,type:"un seul sin²θ enlevé",titre:"Où ça part : la formule.",msg:`${fx("cos(2θ) = cos²θ − sin²θ = (1 − sin²θ) − sin²θ = 1 − 2sin²θ")}.`}]],nature:"cos 2θ en nombres",texte:`sin θ = ${nb(a)}, cos 2θ ?`,ens:{s:a.n/a.d,quoi:"c2s"}});}
  const [p,h]=R.choix(TRIPLE),c=Q(sg*p,h),haut=R()<0.5,sn=Q((haut?1:-1)*Math.round(Math.sqrt(h*h-p*p)),h),v=mul(2,mul(sn,c));
  return exoN({sig:"Nt"+brut(c)+haut,v:v.n/v.d,vT:nb(v),tape:brut(v),lab:"sin(2θ)",q:`On sait que ${fx(`cos θ = ${nb(c)}`)} et que ${fx(haut?"θ ∈ ]0 ; π[":"θ ∈ ]−π ; 0[")}. Calcule la valeur exacte de ${fx("sin(2θ)")}.`,etapes:[
    {w:`${fx(`sin²θ = 1 − cos²θ = 1 − ${nb(mul(c,c))} = ${nb(mul(sn,sn))}`)}, et ${haut?"sin θ > 0":"sin θ &lt; 0"} : ${fx(`sin θ = ${nb(sn)}`)}.`,why:`${fx("cos²θ + sin²θ = 1")}. ${haut?"Sur ]0 ; π[, le sinus est positif.":"Sur ]−π ; 0[, le sinus est négatif."}`,pts:1},
    {w:`${fx("sin(2θ) = 2 sin θ cos θ")}.`,why:"C'est la partie imaginaire de la formule de Moivre avec n = 2.",pts:1},
    {w:`${fx(`sin(2θ) = 2 × ${par(sn)} × ${par(c)} = ${nb(v)}`)}.`,why:"On remplace par les valeurs.",pts:1}],
    pieges:[[-(v.n/v.d),{etape:0,type:"signe de sin θ",titre:"Où ça part : le signe de sin θ.",msg:`${haut?"Sur ]0 ; π[, sin θ est positif":"Sur ]−π ; 0[, sin θ est négatif"} : ${fx(`sin θ = ${nb(sn)}`)}.`}]],nature:"sin 2θ en nombres",texte:`cos θ = ${nb(c)}, sin 2θ ?`,ens:{c:c.n/c.d,haut,quoi:"s2"}});}

const argT=a=>a===1?"θ":a+"θ",iA=a=>a===1?"iθ":a+"iθ";
function lineaire2(R){const v=R.choix(["c","s","cs"]),k=R.choix([1,2,3,4,6,8]),a=R.choix([1,1,2,3]),u=argT(a),u2=argT(2*a),K=k===1?"":k;
  const D={c:{lab:`${K}cos²(${u})`,f:x=>k*C(a*x)**2,ans:k%2?`${k===1?"":k}(1 + cos(${u2}))/2`:`${k/2===1?"":k/2}(1 + cos(${u2}))`.replace(/^\(1 \+ cos\((.*)\)\)$/,"1 + cos($1)"),
      eul:`${fx(`cos(${u}) = (e^{${iA(a)}} + e^{−${iA(a)}})/2`)}, donc ${fx(`cos²(${u}) = (e^{${iA(2*a)}} + 2 + e^{−${iA(2*a)}})/4`)}.`,grp:`${fx(`e^{${iA(2*a)}} + e^{−${iA(2*a)}} = 2cos(${u2})`)} : ${fx(`cos²(${u}) = (2cos(${u2}) + 2)/4 = (1 + cos(${u2}))/2`)}.`,pg:[[x=>k*(1-C(2*a*x))/2,"signe"],[x=>k*C(2*a*x),"la constante oubliée"],[x=>k*(1+C(2*a*x)),"la division par 2 oubliée"]]},
    s:{lab:`${K}sin²(${u})`,f:x=>k*Sn(a*x)**2,ans:k%2?`${k===1?"":k}(1 − cos(${u2}))/2`:`${k/2===1?"":k/2}(1 − cos(${u2}))`.replace(/^\(1 − cos\((.*)\)\)$/,"1 − cos($1)"),
      eul:`${fx(`sin(${u}) = (e^{${iA(a)}} − e^{−${iA(a)}})/(2i)`)}, donc ${fx(`sin²(${u}) = (e^{${iA(2*a)}} − 2 + e^{−${iA(2*a)}})/(2i)²`)}, avec ${fx("(2i)² = −4")}.`,grp:`${fx(`e^{${iA(2*a)}} + e^{−${iA(2*a)}} = 2cos(${u2})`)} : ${fx(`sin²(${u}) = (2cos(${u2}) − 2)/(−4) = (1 − cos(${u2}))/2`)}.`,pg:[[x=>k*(1+C(2*a*x))/2,"signe : (2i)² = −4"],[x=>k*(C(2*a*x)-1)/2,"signe : (2i)² = −4"],[x=>k*(1-C(2*a*x)),"la division par 2 oubliée"]]},
    cs:{lab:`${K}sin(${u})cos(${u})`,f:x=>k*Sn(a*x)*C(a*x),ans:k%2?`${k===1?"":k}sin(${u2})/2`:`${k/2===1?"":k/2}sin(${u2})`,
      eul:`${fx(`sin(${u})cos(${u}) = (e^{${iA(a)}} − e^{−${iA(a)}})(e^{${iA(a)}} + e^{−${iA(a)}})/(4i) = (e^{${iA(2*a)}} − e^{−${iA(2*a)}})/(4i)`)}.`,grp:`${fx(`e^{${iA(2*a)}} − e^{−${iA(2*a)}} = 2i sin(${u2})`)} : ${fx(`sin(${u})cos(${u}) = 2i sin(${u2})/(4i) = sin(${u2})/2`)}.`,pg:[[x=>k*Sn(2*a*x),"la division par 2 oubliée"],[x=>k*C(2*a*x)/2,"cosinus au lieu de sinus"]]}}[v];
  const tape=D.ans.replace(/cos\((\d*)θ\)/g,"cos($1*θ)").replace(/sin\((\d*)θ\)/g,"sin($1*θ)").replace(/\(\*θ\)/g,"(θ)").replace(/−/g,"-");
  const E=[{w:`Formules d'Euler : ${D.eul}`,why:`${fx("cos u = (e^{iu} + e^{−iu})/2")} et ${fx("sin u = (e^{iu} − e^{−iu})/(2i)")}. On développe avec ${fx("(A + B)² = A² + 2AB + B²")} et ${fx("e^{iu} × e^{−iu} = 1")}.`,pts:1},
    {w:`On regroupe les exponentielles deux par deux : ${D.grp}`,why:`${fx("e^{iu} + e^{−iu} = 2cos u")} et ${fx("e^{iu} − e^{−iu} = 2i sin u")}.`,pts:1},
    {w:`Donc ${fx(`${D.lab} = ${D.ans}`)}.`,why:k===1?"C'est la forme linéarisée : plus de carré ni de produit.":`On multiplie par ${k}, et on simplifie.`,pts:0.5}];
  return exoF({sig:"L"+v+k+a,mode:"lin",cible:D.f,lab:D.lab,ans:D.ans,tape,q:`Linéarise ${fx(D.lab)} : écris-le sans carré ni produit de cosinus et de sinus, avec des cos(kθ) et des sin(kθ).`,corps:`<p class="muted">Indication : les formules d'Euler, ${fx("cos u = (e^{iu} + e^{−iu})/2")} et ${fx("sin u = (e^{iu} − e^{−iu})/(2i)")}.</p>`,etapes:E,nature:"linéariser un carré",texte:`linéariser ${D.lab}`,
    pieges:D.pg.map(([g,ty])=>[g,{etape:ty.startsWith("signe")?0:ty.includes("division")?1:2,type:ty,titre:"Où ça part : la linéarisation.",msg:`${fx(`${D.lab} = ${D.ans}`)}. Vérifie avec θ = 0 : ${fx(D.lab)} vaut alors ${v==="c"?k:0}.`}]),ens:{cible:v,k,a}});}

const LIN3=[
 {id:"c3",lab:"cos³θ",f:x=>C(x)**3,ans:"(cos(3θ) + 3cos θ)/4",tape:"(cos(3θ)+3cos(θ))/4",eul:"(e^{iθ} + e^{−iθ})³/8 = (e^{3iθ} + 3e^{iθ} + 3e^{−iθ} + e^{−3iθ})/8",grp:"(2cos(3θ) + 6cos θ)/8 = (cos(3θ) + 3cos θ)/4",pg:[[x=>(3*C(x)-C(3*x))/4,"signe"]]},
 {id:"s3",lab:"sin³θ",f:x=>Sn(x)**3,ans:"(3sin θ − sin(3θ))/4",tape:"(3sin(θ)-sin(3θ))/4",eul:"(e^{iθ} − e^{−iθ})³/(2i)³ = (e^{3iθ} − 3e^{iθ} + 3e^{−iθ} − e^{−3iθ})/(−8i)",grp:"(2i sin(3θ) − 6i sin θ)/(−8i) = (3sin θ − sin(3θ))/4",pg:[[x=>(Sn(3*x)-3*Sn(x))/4,"signe : (2i)³ = −8i"]]},
 {id:"s2c",lab:"sin²θ cos θ",f:x=>Sn(x)**2*C(x),ans:"(cos θ − cos(3θ))/4",tape:"(cos(θ)-cos(3θ))/4",eul:"(e^{iθ} − e^{−iθ})²(e^{iθ} + e^{−iθ})/((2i)² × 2) = (e^{2iθ} − 2 + e^{−2iθ})(e^{iθ} + e^{−iθ})/(−8) = (e^{3iθ} − e^{iθ} − e^{−iθ} + e^{−3iθ})/(−8)",grp:"(2cos(3θ) − 2cos θ)/(−8) = (cos θ − cos(3θ))/4",pg:[[x=>(C(3*x)-C(x))/4,"signe : (2i)² = −4"]]},
 {id:"c2s",lab:"cos²θ sin θ",f:x=>C(x)**2*Sn(x),ans:"(sin θ + sin(3θ))/4",tape:"(sin(θ)+sin(3θ))/4",eul:"(e^{iθ} + e^{−iθ})²(e^{iθ} − e^{−iθ})/(4 × 2i) = (e^{2iθ} + 2 + e^{−2iθ})(e^{iθ} − e^{−iθ})/(8i) = (e^{3iθ} + e^{iθ} − e^{−iθ} − e^{−3iθ})/(8i)",grp:"(2i sin(3θ) + 2i sin θ)/(8i) = (sin θ + sin(3θ))/4",pg:[[x=>(Sn(3*x)-Sn(x))/4,"signe"]]},
 {id:"c4",lab:"cos⁴θ",f:x=>C(x)**4,ans:"(cos(4θ) + 4cos(2θ) + 3)/8",tape:"(cos(4θ)+4cos(2θ)+3)/8",eul:"(e^{iθ} + e^{−iθ})⁴/16 = (e^{4iθ} + 4e^{2iθ} + 6 + 4e^{−2iθ} + e^{−4iθ})/16",grp:"(2cos(4θ) + 8cos(2θ) + 6)/16 = (cos(4θ) + 4cos(2θ) + 3)/8",pg:[[x=>(C(4*x)+4*C(2*x)+6)/8,"le 6 non divisé par 2"]]},
 {id:"s4",lab:"sin⁴θ",f:x=>Sn(x)**4,ans:"(cos(4θ) − 4cos(2θ) + 3)/8",tape:"(cos(4θ)-4cos(2θ)+3)/8",eul:"(e^{iθ} − e^{−iθ})⁴/(2i)⁴ = (e^{4iθ} − 4e^{2iθ} + 6 − 4e^{−2iθ} + e^{−4iθ})/16",grp:"(2cos(4θ) − 8cos(2θ) + 6)/16 = (cos(4θ) − 4cos(2θ) + 3)/8",pg:[[x=>(C(4*x)+4*C(2*x)+3)/8,"signes du binôme"]]},
 {id:"s2c2",lab:"sin²θ cos²θ",f:x=>(Sn(x)*C(x))**2,ans:"(1 − cos(4θ))/8",tape:"(1-cos(4θ))/8",eul:"(sin θ cos θ)² = (sin(2θ)/2)² = sin²(2θ)/4",grp:"sin²(2θ) = (1 − cos(4θ))/2, donc sin²θ cos²θ = (1 − cos(4θ))/8",pg:[[x=>(1+C(4*x))/8,"signe"]]}];
function lineaire3(R){const D=R.choix(LIN3),k=R.choix([1,2,4,8]),lab=(k===1?"":k)+D.lab,f=x=>k*D.f(x),ans=k===1?D.ans:`${k} × ${D.ans}`,tape=k===1?D.tape:`${k}*${D.tape}`;
  const dd=+D.ans.match(/\/(\d+)$/)[1],corps=D.ans.replace(/\/\d+$/,""),nu=c=>c.replace(/^\((.*)\)$/,"$1");
  const fin=k===1?D.ans:dd%k===0?(dd===k?nu(corps):`${corps}/${dd/k}`):k%dd===0?(k===dd?nu(corps):`${k/dd}${corps}`):`${k}${corps}/${dd}`;
  const E=[{w:`Formules d'Euler : ${fx(`${D.lab} = ${D.eul}`)}.`,why:`${fx("cos θ = (e^{iθ} + e^{−iθ})/2")}, ${fx("sin θ = (e^{iθ} − e^{−iθ})/(2i)")}, puis on développe (binôme, ${fx("e^{iθ} × e^{−iθ} = 1")}).`,pts:1},
    {w:`On regroupe les exponentielles deux par deux : ${fx(`${D.lab} = ${D.grp}`)}.`,why:`${fx("e^{ikθ} + e^{−ikθ} = 2cos(kθ)")} et ${fx("e^{ikθ} − e^{−ikθ} = 2i sin(kθ)")}.`,pts:1},
    {w:`Donc ${fx(`${lab} = ${fin}`)}.`,why:k===1?"C'est la forme linéarisée.":`On multiplie par ${k} et on simplifie.`,pts:0.5}];
  return exoF({sig:"M"+D.id+k,mode:"lin",cible:f,lab,ans:fin,tape,q:`Linéarise ${fx(lab)} : écris-le sans puissance ni produit de cosinus et de sinus.`,corps:`<p class="muted">Indication : les formules d'Euler.</p>`,etapes:E,nature:"linéariser une puissance 3 ou 4",texte:`linéariser ${lab}`,
    pieges:D.pg.map(([g,ty])=>[x=>k*g(x),{etape:ty.startsWith("signe")?0:1,type:ty,titre:"Où ça part : la linéarisation.",msg:`${fx(`${lab} = ${fin}`)}. Vérifie avec θ = 0 ou θ = π/2.`}]),ens:{cible:D.id,k}});}

const M3=[
 {id:"c3c",lab:"cos(3θ)",mode:"cos",ans:"4cos³θ − 3cos θ",tape:"4cos(θ)^3-3cos(θ)",f:x=>C(3*x),q:"Exprime cos(3θ) en fonction de cos θ seulement.",fin:`${fx("cos(3θ) = cos³θ − 3cos θ(1 − cos²θ) = 4cos³θ − 3cos θ")}`,pg:[[x=>3*C(x)-4*C(x)**3,"signe"]]},
 {id:"s3s",lab:"sin(3θ)",mode:"sin",ans:"3sin θ − 4sin³θ",tape:"3sin(θ)-4sin(θ)^3",f:x=>Sn(3*x),q:"Exprime sin(3θ) en fonction de sin θ seulement.",fin:`${fx("sin(3θ) = 3(1 − sin²θ)sin θ − sin³θ = 3sin θ − 4sin³θ")}`,pg:[[x=>4*Sn(x)**3-3*Sn(x),"signe"]]},
 {id:"c3cs",lab:"cos(3θ)",mode:"cs",ans:"cos³θ − 3cos θ sin²θ",tape:"cos(θ)^3-3cos(θ)sin(θ)^2",f:x=>C(3*x),q:"Exprime cos(3θ) en fonction de cos θ et de sin θ.",pg:[[x=>C(x)**3+3*C(x)*Sn(x)**2,"i² compté comme +1"]]},
 {id:"s3cs",lab:"sin(3θ)",mode:"cs",ans:"3cos²θ sin θ − sin³θ",tape:"3cos(θ)^2sin(θ)-sin(θ)^3",f:x=>Sn(3*x),q:"Exprime sin(3θ) en fonction de cos θ et de sin θ.",pg:[[x=>3*C(x)**2*Sn(x)+Sn(x)**3,"i³ compté comme i"]]}];
const DEV3=`${fx("(cos θ + i sin θ)³ = cos³θ + 3i cos²θ sin θ − 3cos θ sin²θ − i sin³θ")}`;
function triple(R){const t=R();
  if(t<0.45){const D=R.choix(M3),E=[{w:`Formule de Moivre avec n = 3 : ${fx("(cos θ + i sin θ)³ = cos(3θ) + i sin(3θ)")}. On développe : ${DEV3}.`,why:`${fx("(a + b)³ = a³ + 3a²b + 3ab² + b³")}, avec ${fx("i² = −1")} et ${fx("i³ = −i")}.`,pts:1},
      {w:`On identifie : ${fx("cos(3θ) = cos³θ − 3cos θ sin²θ")} et ${fx("sin(3θ) = 3cos²θ sin θ − sin³θ")}.`,why:"Parties réelles d'un côté, parties imaginaires de l'autre.",pts:1}];
    if(D.fin)E.push({w:`${PYTH} ${D.fin}.`,why:"On veut une formule avec une seule des deux fonctions.",pts:1});
    return exoF({sig:"T"+D.id,mode:D.mode,cible:D.f,lab:D.lab,ans:D.ans,tape:D.tape,q:D.q+" Indication : la formule de Moivre.",etapes:E,nature:"formule de cos 3θ",texte:D.q,
      pieges:D.pg.map(([g,ty])=>[g,{etape:ty==="signe"?E.length-1:0,type:ty,titre:"Où ça part : le développement.",msg:`${fx(`${D.lab} = ${D.ans}`)}. ${ty==="signe"?"Vérifie avec θ = 0.":"Dans le développement, i² = −1 et i³ = −i."}`}]),ens:{cible:D.id}});}
  const [n,d]=R.choix(FR),sg=R()<0.5?1:-1,a=Q(sg*n,d);
  if(t<0.75){const v=sub(mul(4,mul(a,mul(a,a))),mul(3,a));
    return exoN({sig:"Uc"+brut(a),v:v.n/v.d,vT:nb(v),tape:brut(v),lab:"cos(3θ)",q:`On sait que ${fx(`cos θ = ${nb(a)}`)}. Calcule la valeur exacte de ${fx("cos(3θ)")}.`,etapes:[
      {w:`${fx("cos(3θ) = 4cos³θ − 3cos θ")}.`,why:`Formule de Moivre avec n = 3, partie réelle : ${fx("cos³θ − 3cos θ sin²θ")}, puis ${fx("sin²θ = 1 − cos²θ")}.`,pts:1},
      {w:`${fx(`cos(3θ) = 4 × ${par(mul(a,mul(a,a)))} − 3 × ${par(a)} = ${nb(v)}`)}.`,why:`${fx(`(${nb(a)})³ = ${nb(mul(a,mul(a,a)))}`)}.`,pts:1}],
      pieges:[[-(v.n/v.d),{etape:0,type:"signe",titre:"Où ça part : la formule.",msg:`${fx("cos(3θ) = 4cos³θ − 3cos θ")}, pas ${fx("3cos θ − 4cos³θ")} : vérifie avec θ = 0.`}],[3*a.n/a.d,{etape:0,type:"cos(3θ) pris pour 3cos θ",titre:"Où ça part : la formule.",msg:`${fx("cos(3θ)")} n'est pas ${fx("3cos θ")}.`}]],nature:"cos 3θ en nombres",texte:`cos θ = ${nb(a)}, cos 3θ ?`,ens:{a:a.n/a.d,quoi:"c3"}});}
  const v=sub(mul(3,a),mul(4,mul(a,mul(a,a))));
  return exoN({sig:"Us"+brut(a),v:v.n/v.d,vT:nb(v),tape:brut(v),lab:"sin(3θ)",q:`On sait que ${fx(`sin θ = ${nb(a)}`)}. Calcule la valeur exacte de ${fx("sin(3θ)")}.`,etapes:[
    {w:`${fx("sin(3θ) = 3sin θ − 4sin³θ")}.`,why:`Formule de Moivre avec n = 3, partie imaginaire : ${fx("3cos²θ sin θ − sin³θ")}, puis ${fx("cos²θ = 1 − sin²θ")}.`,pts:1},
    {w:`${fx(`sin(3θ) = 3 × ${par(a)} − 4 × ${par(mul(a,mul(a,a)))} = ${nb(v)}`)}.`,why:`${fx(`(${nb(a)})³ = ${nb(mul(a,mul(a,a)))}`)}.`,pts:1}],
    pieges:[[-(v.n/v.d),{etape:0,type:"signe",titre:"Où ça part : la formule.",msg:`${fx("sin(3θ) = 3sin θ − 4sin³θ")} : vérifie avec θ = π/2, où sin(3π/2) = −1.`}]],nature:"sin 3θ en nombres",texte:`sin θ = ${nb(a)}, sin 3θ ?`,ens:{s:a.n/a.d,quoi:"s3"}});}

/* TD 3, ex. 7 : cos et sin d'un angle en π/12, par un produit ou un quotient de deux complexes de module 1 */
const S6=(u,v)=>u>0?`(√6 ${v>0?"+":"−"} √2)/4`:v>0?"(√2 − √6)/4":"−(√6 + √2)/4";
function valeurPi12(R){const m1=R.choix([2,4,8,10,-2,-4,-8,-10]),m2=R.choix([3,-3,9,-9]),op=R()<0.5?"x":"/",t1=Q(m1,12),t2=Q(m2,12),T1=trig(t1),T2=trig(t2),z1=zR(T1.c,T1.s),z2=zR(T2.c,T2.s);
  const phi=angP(op==="x"?add(t1,t2):sub(t1,t2)),M=mul(phi,12).n,u=Math.cos(Math.PI*M/12),w=Math.sin(Math.PI*M/12);
  const co=x=>{const a=Math.round((x*4)*(Math.sqrt(6)+Math.sqrt(2))/8),b=Math.round((x*4)*(Math.sqrt(6)-Math.sqrt(2))/8);/* x·4 = u√6 + v√2 avec u, v = ±1 */for(const p of [1,-1])for(const q2 of [1,-1])if(Math.abs(p*Math.sqrt(6)+q2*Math.sqrt(2)-4*x)<1e-9)return [p,q2];return null;};
  const cu=co(u),cw=co(w),cT=S6(...cu),sT=S6(...cw),tp=([p,q2])=>`(${p<0?"-":""}sqrt(6)${q2<0?"-":"+"}sqrt(2))/4`;
  const ph=angT(phi),nom=op==="x"?"z₁z₂":"z₁/z₂";
  const E=[{w:`Formes exponentielles : ${fx(`z₁ = e^{${angE(t1)}}`)} et ${fx(`z₂ = e^{${angE(t2)}}`)}, donc ${fx(`${nom} = e^{i(${angT(t1)} ${op==="x"?"+":"−"} ${t2.n<0?"("+angT(t2)+")":angT(t2)})} = e^{${angE(phi)}}`)}.`,why:`Les deux modules valent 1 ; ${op==="x"?"les arguments s'ajoutent":"les arguments se retranchent"}. Donc ${fx(`${nom} = cos(${ph}) + i sin(${ph})`)}.`,pts:1.5},
    {w:`En forme algébrique : ${fx(`${nom} = ${op==="x"?`(${z1})(${z2})`:`(${z1})(${zR(T2.c,{c:mul(T2.s.c,-1),s:T2.s.s})})`}`)}, de partie réelle ${fx(cT)} et de partie imaginaire ${fx(sT)}.`,why:op==="x"?"On développe, avec i² = −1 ; chaque produit de deux racines donne √6 ou √2, sur 4.":"Diviser par un complexe de module 1, c'est multiplier par son conjugué. On développe, avec i² = −1.",pts:1.5},
    {w:`On identifie : ${fx(`cos(${ph}) = ${cT}`)} et ${fx(`sin(${ph}) = ${sT}`)}.`,why:"Deux écritures du même nombre ont la même partie réelle et la même partie imaginaire.",pts:1}];
  const dern=2;
  function juge(rep){const P=rep.cs||{},A=lisReel(P.c),B=lisReel(P.s);if(A.vide||B.vide)return {incomplet:"Remplis les deux cases."};if(A.avecI||B.avecI)return {incomplet:"Un cosinus et un sinus sont des réels : pas de i."};
    if(A.illisible||A.neg||B.illisible||B.neg)return {incomplet:"Je n'arrive pas à lire une des cases. Écris par exemple (√6 − √2)/4."};
    const okA=pres(A.v,u),okB=pres(B.v,w);if(okA&&okB)return {ok:true};
    if((!okA&&A.dec&&Math.abs(A.v-u)<0.02)||(!okB&&B.dec&&Math.abs(B.v-w)<0.02))return {incomplet:"Écris la valeur exacte, avec √6 et √2, pas une valeur approchée."};
    const F=[];if(!okA)F.push("c");if(!okB)F.push("s");
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux valeurs sont à revoir":F[0]==="c"?"le cosinus est à revoir":"le sinus est à revoir"}.`,
      diag:pres(A.v,w)&&pres(B.v,u)?{etape:dern,type:"cosinus et sinus échangés",titre:"Où ça part : l'identification.",msg:"Le cosinus est la partie réelle, le sinus la partie imaginaire."}:pres(Math.abs(A.v),Math.abs(u))&&pres(Math.abs(B.v),Math.abs(w))?{etape:1,type:"signe dans le développement",titre:"Où ça part : le développement.",msg:`Refais le développement en surveillant les signes : ${fx(`cos(${ph}) = ${cT}`)}.`}:{etape:1,type:"calcul de la forme algébrique",titre:"Où ça part : la forme algébrique.",msg:`${fx(`cos(${ph}) = ${cT}`)} et ${fx(`sin(${ph}) = ${sT}`)}.`}};}
  return {sig:"P"+m1+"|"+m2+op,q:`Soient ${fx(`z₁ = ${z1}`)} et ${fx(`z₂ = ${z2}`)}. Donne une forme exponentielle de ${fx(`z₁`)}, ${fx(`z₂`)} et ${fx(nom)}. En déduire les valeurs exactes de ${fx(`cos(${ph})`)} et ${fx(`sin(${ph})`)}.`,corps:`<p class="muted">Comme au TD 3, exercice 7 : on écrit le même nombre de deux façons, puis on compare.</p>`,texte:`cos et sin de ${ph} avec z₁ = ${z1}, z₂ = ${z2}`,
    champs:[{k:"cases",id:"cs",noms:["c","s"],titre:`Écris $c = cos(${ph})$ et $s = sin(${ph})$ :`,sym:["√","/","(",")"],aide:"Par exemple (√6 − √2)/4, ou (sqrt(6)-sqrt(2))/4."}],juge,etapes:E,
    bonne:`${fx(`cos(${ph}) = ${cT}`)} et ${fx(`sin(${ph}) = ${sT}`)}`,bonneTxt:`cos(${ph}) = ${cT}, sin(${ph}) = ${sT}`,repBonne:{cs:{c:tp(cu),s:tp(cw)}},repFausse:{cs:{c:tp(cw),s:tp(cu)}},nature:op==="x"?"par un produit":"par un quotient",ens:{type:"pi12",phi:Math.PI*M/12}};}
/* ---------- CA4 : racines carrées, second degré dans ℂ ---------- */
const listeT=L=>L.join(" ; "),cxF=z=>Array.isArray(z)?z:zf(z);
/* une liste de solutions tapée, comparée sans tenir compte de l'ordre ; o.att : valeurs [re, im], o.txt : écritures */
function exoListe(o){const att=o.att,n=att.length,dern=o.etapes.length-1;
  function juge(rep){const L=lisListe(rep.z);if(L.vide)return {incomplet:`Écris les ${n} solutions, séparées par « ; ».`};
    if(L.neg)return {incomplet:"La racine carrée d'un nombre négatif n'existe pas dans ℝ : écris i√3 au lieu de √(−3)."};
    if(L.illisible)return {incomplet:"Je n'arrive pas à lire une des solutions. Écris par exemple (-1+i√3)/2 ; (-1-i√3)/2."};
    if(L.L.length<n)return {incomplet:`Il y a ${n} solutions : il en manque ${n-L.L.length}. Sépare-les par « ; ».`};
    if(memeListe(L.L,att))return {ok:true};
    if(L.L.some(v=>L.L.filter(w=>presC(v,w)).length>1))return {incomplet:"Tu as écrit deux fois la même solution."};
    const pg=(o.pieges||[]).find(p=>memeListe(L.L,p[0]));
    const bons=L.L.filter(v=>att.some(w=>presC(v,w))).length;
    return {ok:false,faux:["z"],resume:`Pas tout à fait : ${bons?`${bons} ${bons>1?"solutions sont justes":"solution est juste"}, pas toutes.`:"aucune de ces solutions ne vérifie l'équation."}`,diag:pg?pg[1]:{etape:o.fin==null?dern:o.fin,type:o.type||"calcul des solutions",titre:"Où ça part : le calcul.",msg:`Les solutions sont ${fx(listeT(o.txt))}. Vérifie chacune en la remettant dans l'équation.`}};}
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[{k:"champ",id:"z",nom:"solutions",label:o.label||"Les solutions :",ex:"séparées par ;",sym:["i","√","/","(",")"],apercu:false,aide:"Sépare les solutions par « ; ». Par exemple : (-1+i√3)/2 ; (-1-i√3)/2."}],juge,etapes:o.etapes,
    bonne:fx(listeT(o.txt)),bonneTxt:listeT(o.txt),repBonne:{z:o.tape.join(" ; ")},repFausse:{z:o.faux},nature:o.nature,ens:Object.assign({att},o.ens)};}
const zRtape=(a,b)=>`${rTape(a)}+(${rTape(b)})*i`;
function deltaNeg(R){let a,b,c;do{a=R()<0.65?1:R.choix([2,3,4]);b=R.ent(-6,6);c=R.ent(1,15);}while(b*b-4*a*c>=0);
  const D=b*b-4*a*c,dl=rRac(Q(-D)),re=Q(-b,2*a),im=simpR(div(dl.c,2*a),dl.s),z1=[re.n/re.d,rF(im)],z2=[z1[0],-z1[1]],eq=`${S([[a,"z²"],[b,"z"],[c,""]])} = 0`;
  const t1=zR(Rd(re),im),t2=zR(Rd(re),{c:mul(im.c,-1),s:im.s});
  const E=[{w:`${fx(`Δ = b² − 4ac = ${b*b} − ${4*a*c} = ${nb(D)}`)} : Δ est négatif.`,why:"Dans ℝ, l'équation n'aurait pas de solution. Dans ℂ, un nombre négatif a deux racines carrées.",pts:1},
    {w:`Une racine carrée de Δ : ${fx(`δ = i√${-D}${rT(dl)!=="√"+(-D)?" = "+rT({c:dl.c,s:dl.s}).replace(/^(\d*)√/,"$1i√").replace(/^(\d+)$/,"$1i"):""}`)}, car ${fx(`δ² = i² × ${-D} = ${nb(D)}`)}.`,why:`${fx("i² = −1")}. On n'écrit jamais ${fx(`√(${nb(D)})`)} : la racine carrée d'un négatif n'a pas de sens dans ℝ.`,pts:1},
    {w:`${fx("z = (−b ± δ)/(2a)")} : ${fx(`z₁ = ${t1}`)} et ${fx(`z₂ = ${t2}`)}.`,why:`On divise ${fx(nb(-b))} et ${fx(rT(dl))} par ${fx(String(2*a))}. Les deux solutions sont conjuguées : c'est toujours le cas quand a, b et c sont réels.`,pts:1}];
  const opp=[[-z1[0],-z1[1]],[-z2[0],-z2[1]]];
  return exoListe({sig:"N"+eq,att:[z1,z2],txt:[t1,t2],tape:[zRtape(Rd(re),im),zRtape(Rd(re),{c:mul(im.c,-1),s:im.s})],faux:b?`${rTape(Rd(Q(b,2*a)))}+(${rTape(im)})*i ; ${rTape(Rd(Q(b,2*a)))}-(${rTape(im)})*i`:`2*(${rTape(im)})*i ; -2*(${rTape(im)})*i`,etapes:E,
    q:`Résous dans ℂ l'équation ${fx(eq)}.`,corps:`<p class="muted">Rappel : pour ${fx("az² + bz + c = 0")}, on calcule ${fx("Δ = b² − 4ac")}, puis une racine carrée δ de Δ (un nombre tel que ${fx("δ² = Δ")}), et ${fx("z = (−b ± δ)/(2a)")}.</p>`,nature:"discriminant négatif",texte:`résoudre ${eq}`,
    pieges:b?[[opp,{etape:2,type:"signe de b",titre:"Où ça part : la formule.",msg:`${fx("z = (−b ± δ)/(2a)")} : avec ${fx(`b = ${nb(b)}`)}, ${fx(`−b = ${nb(-b)}`)}.`}]]:[],ens:{type:"eq2",co:[[a,0],[b,0],[c,0]]}});}
function racineCarree(R){const t=R();let d;
  if(t<0.8){do d=Z(R.ent(1,7),R.nz(-7,7));while(egal(d.a,absQ(d.b))&&R()<0.5);}else if(t<0.9)d=Z(0,R.ent(1,9));else{const m=R.ent(1,5);d=Z(m,R.choix([m,-m]));}
  const w=zmul(d,d),A=w.a,B=w.b,M=zn2(d),x2=div(add(M,A),2),y2=div(sub(M,A),2),md=Z(mul(d.a,-1),mul(d.b,-1));
  const E=[{w:`On cherche ${fx("δ = x + iy")} avec ${fx(`δ² = ${zt(w)}`)}. En développant ${fx("δ² = x² − y² + 2ixy")} : ${fx(`x² − y² = ${nb(A)}`)} et ${fx(`2xy = ${nb(B)}`)}.`,why:"Deux complexes égaux ont la même partie réelle et la même partie imaginaire.",pts:1},
    {w:`Les modules : ${fx(`x² + y² = |δ|² = |${zt(w)}| = √(${nb(mul(A,A))} + ${nb(mul(B,B))}) = ${nb(M)}`)}.`,why:`${fx("|δ²| = |δ|²")} : c'est la troisième équation, qui rend le calcul facile.`,pts:1},
    {w:`En ajoutant et en retranchant : ${fx(`x² = ${nb(x2)}`)} et ${fx(`y² = ${nb(y2)}`)}.`,why:`${fx(`2x² = ${nb(M)} + ${par(A)}`)} et ${fx(`2y² = ${nb(M)} − ${par(A)}`)}.`,pts:1},
    {w:nul(B)?`${fx("2xy = 0")} et ${fx("x = 0")} : les racines carrées sont ${fx(`${zt(d)}`)} et ${fx(zt(md))}.`:`${fx(`2xy = ${nb(B)}`)} est ${B.n>0?"positif : x et y ont le même signe":"négatif : x et y sont de signes contraires"}. Les racines carrées sont ${fx(zt(d))} et ${fx(zt(md))}.`,why:`Vérification : ${fx(`(${zt(d)})² = ${zt(w)}`)}. Il y a toujours deux racines carrées, opposées.`,pts:1}];
  const mauvais=Z(d.a,mul(d.b,-1));
  return exoListe({sig:"R"+zt(w),att:[zf(d),zf(md)],txt:[zt(d),zt(md)],tape:[ztx(d),ztx(md)],faux:nul(d.a)||nul(d.b)?`${ztx(Z(add(d.a,1),d.b))} ; ${ztx(md)}`:`${ztx(mauvais)} ; ${ztx(Z(mul(mauvais.a,-1),mul(mauvais.b,-1)))}`,label:"Les deux racines carrées :",etapes:E,
    q:`Détermine les racines carrées du nombre complexe ${fx(`w = ${zt(w)}`)}, c'est-à-dire les complexes δ tels que ${fx(`δ² = ${zt(w)}`)}.`,corps:`<p class="muted">Méthode : ${fx("δ = x + iy")}, avec ${fx("x² − y² = A")}, ${fx("2xy = B")} et ${fx("x² + y² = |w|")}.</p>`,nature:nul(w.b)?"un réel négatif":nul(w.a)?"un imaginaire pur":"a + ib",texte:`racines carrées de ${zt(w)}`,
    pieges:nul(d.a)||nul(d.b)?[]:[[[zf(mauvais),[-zf(mauvais)[0],-zf(mauvais)[1]]],{etape:3,type:"signe de 2xy",titre:"Où ça part : les signes.",msg:`${fx(`2xy = ${nb(B)}`)} : ${B.n>0?"x et y ont le même signe":"x et y sont de signes contraires"}. Vérifie en élevant au carré.`}]],ens:{type:"rac2",w:zf(w)}});}
const ztx=z=>{const a=q(z.a),b=q(z.b);return nul(b)?brut(a):(nul(a)?"":brut(a)+(b.n<0?"":"+"))+(egal(b,1)?"":egal(b,-1)?"-":brut(b)+"*")+"i";};
function coefComplexes(R){let z1,z2;do{z1=Z(R.ent(-4,4),R.ent(-4,4));z2=Z(R.ent(-4,4),R.ent(-4,4));}while(zeq(z1,z2)||nul(zn2(zadd(z1,z2)))||nul(zn2(z1))||nul(zn2(z2))||(nul(z1.b)&&nul(z2.b))||nul(zadd(z1,z2).b)&&nul(zmul(z1,z2).b));
  const b=Z(mul(zadd(z1,z2).a,-1),mul(zadd(z1,z2).b,-1)),c=zmul(z1,z2),D=zsub(zmul(b,b),zmul(Z(4),c)),d=zsub(z1,z2),M=zn2(d);
  const eq=`z²${nul(b.a)&&nul(b.b)?"":facS(b)+"z"}${plusZ(c)} = 0`;
  const E=[{w:`${fx(`Δ = b² − 4c = ${zt(D)}`)}.`,why:`Ici ${fx(`b = ${zt(b)}`)} et ${fx(`c = ${zt(c)}`)} : ${fx(`b² = ${zt(zmul(b,b))}`)} et ${fx(`4c = ${zt(zmul(Z(4),c))}`)}.`,pts:1},
    {w:`Une racine carrée de Δ, par la méthode ${fx("δ = x + iy")} : ${fx(`x² − y² = ${nb(D.a)}`)}, ${fx(`x² + y² = |Δ| = ${nb(M)}`)} et ${fx(`2xy = ${nb(D.b)}`)}, donc ${fx(`δ = ${zt(d)}`)}.`,why:`Vérification : ${fx(`(${zt(d)})² = ${zt(D)}`)}.`,pts:1.5},
    {w:`${fx("z = (−b ± δ)/2")} : ${fx(`z₁ = ${zt(z1)}`)} et ${fx(`z₂ = ${zt(z2)}`)}.`,why:`${fx(`−b = ${zt(Z(mul(b.a,-1),mul(b.b,-1)))}`)} ; on ajoute puis on retranche δ, et on divise par 2. Vérification : ${fx(`z₁ + z₂ = −b`)} et ${fx("z₁z₂ = c")}.`,pts:1}];
  return exoListe({sig:"C"+eq,att:[zf(z1),zf(z2)],txt:[zt(z1),zt(z2)],tape:[ztx(z1),ztx(z2)],faux:`${ztx(Z(mul(z1.a,-1),mul(z1.b,-1)))} ; ${ztx(Z(mul(z2.a,-1),mul(z2.b,-1)))}`,etapes:E,
    q:`Résous dans ℂ l'équation ${fx(eq)}.`,corps:"",nature:"coefficients complexes",texte:`résoudre ${eq}`,
    pieges:[[[zf(Z(mul(z1.a,-1),mul(z1.b,-1))),zf(Z(mul(z2.a,-1),mul(z2.b,-1)))],{etape:2,type:"signe de b",titre:"Où ça part : la formule.",msg:`${fx("z = (−b ± δ)/2")} : attention au signe de b.`}]],ens:{type:"eq2",co:[[1,0],zf(b),zf(c)]}});}
function bicarree(R){const t=R();let Zs,zs;
  if(t<0.3){let m,n;do{m=R.ent(1,5);n=R.ent(1,5);}while(m===n);Zs=[Z(-m*m),Z(-n*n)];zs=[Z(0,m),Z(0,-m),Z(0,n),Z(0,-n)];}
  else if(t<0.6){const k=R.ent(1,5),m=R.ent(1,5);Zs=[Z(k*k),Z(-m*m)];zs=[Z(k),Z(-k),Z(0,m),Z(0,-m)];}
  else{const d=Z(R.ent(1,4),R.ent(1,4));Zs=[zmul(d,d),zconj(zmul(d,d))];zs=[d,Z(mul(d.a,-1),mul(d.b,-1)),zconj(d),Z(mul(d.a,-1),d.b)];}
  const p=mul(add(Zs[0].a,Zs[1].a),-1),qq=sub(mul(Zs[0].a,Zs[1].a),mul(Zs[0].b,Zs[1].b)),eq=`${S([[1,"z⁴"],[p,"z²"],[qq,""]])} = 0`,D=sub(mul(p,p),mul(4,qq));
  const E=[{w:`On pose ${fx("Z = z²")} : ${fx(`${S([[1,"Z²"],[p,"Z"],[qq,""]])} = 0`)}.`,why:"z⁴ = (z²)² : l'équation devient du second degré en Z.",pts:1},
    {w:`${fx(`Δ = ${nb(mul(p,p))} − ${nb(mul(4,qq)).replace(/^−/,"(−")+(qq.n<0?")":"")} = ${nb(D)}`)}, donc ${fx(`Z₁ = ${zt(Zs[0])}`)} et ${fx(`Z₂ = ${zt(Zs[1])}`)}.`,why:D.n<0?`Δ < 0 : ${fx(`δ = i√${nb(mul(D,-1))}`)}, et ${fx("Z = (−p ± δ)/2")}.`:`${fx("Z = (−p ± √Δ)/2")}.`,pts:1},
    {w:`On revient à z : les racines carrées de ${fx(zt(Zs[0]))} sont ${fx(`${zt(zs[0])}`)} et ${fx(zt(zs[1]))} ; celles de ${fx(zt(Zs[1]))} sont ${fx(zt(zs[2]))} et ${fx(zt(zs[3]))}.`,why:`${fx("z² = Z")} : chaque Z donne deux valeurs de z, opposées. Vérification : ${fx(`(${zt(zs[0])})² = ${zt(Zs[0])}`)}.`,pts:1.5},
    {w:`Quatre solutions : ${fx(listeT(zs.map(zt)))}.`,why:"Une équation de degré 4 a quatre solutions dans ℂ (comptées avec leur multiplicité).",pts:0.5}];
  return exoListe({sig:"B"+eq,att:zs.map(zf),txt:zs.map(zt),tape:zs.map(ztx),faux:(()=>{const F=[zs[0],zs[1],Zs[1],Z(mul(Zs[1].a,-1),mul(Zs[1].b,-1))],dis=F.every((u,i)=>F.every((v,j)=>i===j||!zeq(u,v)));return (dis?F:zs.slice(0,3).concat([Z(0)])).map(ztx).join(" ; ");})(),label:"Les quatre solutions :",etapes:E,
    q:`Résous dans ℂ l'équation ${fx(eq)}.`,corps:`<p class="muted">Indication : pose ${fx("Z = z²")}, comme au TD 3 (exercice 11).</p>`,nature:"équation bicarrée",texte:`résoudre ${eq}`,
    pieges:[[[zf(zs[0]),zf(zs[1]),zf(Zs[1]),[-zf(Zs[1])[0],-zf(Zs[1])[1]]],{etape:2,type:"Z pris pour z",titre:"Où ça part : le retour à z.",msg:`Les valeurs de Z sont les valeurs de z², pas de z : il faut encore prendre leurs racines carrées.`}]],ens:{type:"bic",p:p.n/p.d,q:qq.n/qq.d}});}

/* ---------- CA5 : racines n-ièmes ---------- */
const kpi=n=>n===2?"kπ":n%2===0?`kπ/${n/2}`:`2kπ/${n}`;
const kL=n=>n===2?"k = 0, 1":n===3?"k = 0, 1, 2":`k = 0, 1, …, ${n-1}`;
const casesRK=()=>({k:"cases",id:"p",noms:["r","θₖ"],titre:"Les solutions s'écrivent $r e^{iθₖ}$ pour $k = 0, 1, …, n − 1$. Écris $r$, puis $θₖ$ en fonction de $k$ :",large:true,sym:["√","π","k","/","^"],aide:"Par exemple r = 2^(1/3) et θₖ = π/12 + 2kπ/3 (ou pi/12+2*k*pi/3)."});
const W1=[[Z(1),Q(0)],[Z(-1),Q(1)],[Z(0,1),Q(1,2)],[Z(0,-1),Q(-1,2)]];
const radPow=(rho,n)=>rpow(rho,n);
const rhoT=(rho)=>rT(rho);
function exoRK(o){const n=o.n,rho=rF(o.rho),phi=angF(o.phi),att=[...Array(n)].map((_,k)=>(phi+2*k*Math.PI)/n),dern=o.etapes.length-1;
  const memeEns=V=>V.length===att.length&&att.every(a=>V.filter(v=>memeAngle(v,a)).length===1);
  function juge(rep){const P=rep.p||{},A=lisReel(P.r),ts=String(P["θₖ"]==null?"":P["θₖ"]),T=propre(ts)?lis(ts.replace(/^[^=]*=/,""),["k"]):null;
    if(A.vide||!propre(ts))return {incomplet:"Remplis les deux cases : r, puis θₖ."};
    if(A.illisible||A.neg||A.avecI)return {incomplet:"Je n'arrive pas à lire r. Écris par exemple 2, √3 ou 2^(1/3)."};
    if(!T)return {incomplet:"Je n'arrive pas à lire θₖ. Écris par exemple π/12 + 2kπ/3."};
    const L=[...lettres(T)];if(L.length)return {incomplet:L.includes("n")?`Remplace n par sa valeur, ${n}.`:`Écris θₖ avec la lettre k seulement (pas ${L[0]}).`};
    let V;try{V=[...Array(n)].map((_,k)=>val(T,{k})[0]);}catch(e){return {incomplet:"Je n'arrive pas à calculer θₖ : vérifie les parenthèses."};}
    const okR=pres(A.v,rho),okT=memeEns(V);if(okR&&okT)return {ok:true};
    if(!okR&&A.dec&&Math.abs(A.v-rho)<0.02)return {incomplet:"Écris la valeur exacte du module, par exemple 2^(1/3) ou √2, pas une valeur approchée."};
    const F=[];if(!okR)F.push("r");if(!okT)F.push("θₖ");let d;
    if(!okR)d=pres(A.v,rF(o.R))?{etape:1,type:"module de w au lieu de sa racine n-ième",titre:"Où ça part : le module.",msg:`${fx(`rⁿ = ${rT(o.R)}`)} : r est la racine ${n}-ième de ${fx(rT(o.R))}, ${fx(`r = ${rhoT(o.rho)}`)}.`}:pres(A.v,rF(o.R)/n)?{etape:1,type:"module divisé par n",titre:"Où ça part : le module.",msg:`r n'est pas le module divisé par ${n} : c'est sa racine ${n}-ième.`}:{etape:1,type:"module",titre:"Où ça part : le module.",msg:`${fx(`r = ${rhoT(o.rho)}`)}.`};
    else if(V.every(v=>memeAngle(v,V[0])))d={etape:2,type:"2kπ non divisé par n",titre:"Où ça part : les arguments.",msg:`Tes ${n} angles donnent tous le même point. ${fx("nθ = φ + 2kπ")} donne ${fx("θ = φ/n + 2kπ/n")} : le 2kπ est aussi divisé par n.`};
    else if(V.every(v=>att.some(a=>memeAngle(v,-a))))d={etape:0,type:"argument de w",titre:"Où ça part : l'argument de w.",msg:`L'argument de w est ${fx(angT(o.phi))}, pas son opposé.`};
    else d={etape:2,type:"arguments",titre:"Où ça part : les arguments.",msg:`${fx(`θₖ = ${o.thT}`)}, pour ${fx(kL(n))}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"r et θₖ sont à revoir":F[0]==="r"?"r est à revoir":"les arguments sont à revoir"}.`,diag:d};}
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[casesRK()],juge,etapes:o.etapes,bonne:`${fx(`r = ${rhoT(o.rho)}`)} et ${fx(`θₖ = ${o.thT}`)}, ${fx(kL(n))}`,bonneTxt:`r = ${rhoT(o.rho)}, θk = ${o.thT}`,
    repBonne:{p:{r:o.rhoTape,"θₖ":o.thTape}},repFausse:{p:{r:o.rhoTape,"θₖ":`${angTape(div(o.phi,n))}+2*k*pi`}},nature:o.nature,ens:{type:"rk",n,w:o.w}};}
/* ρ, ρⁿ et l'angle : z^n = w avec w = ρⁿ e^{iφ} */
function racN(R,genre){let n,rho,phi,w,wT;
  if(genre===1){n=R.ent(2,8);const [z,f]=R.choix(W1);rho=Rd(1);phi=f;w=zf(z);wT=zt(z);}
  else if(genre===2){const ch=R();n=R.ent(2,6);rho=ch<0.5?Rd(2):ch<0.75?Rd(3):Rd(1,R.choix([2,3]));if(rho.s>1&&n%2)n++;if(rT(rho)==="3"&&n>4)n=R.ent(2,4);
    const RR=rpow(rho,n),[z,f]=R.choix(W1);phi=f;w=[rF(RR)*zf(z)[0],rF(RR)*zf(z)[1]];wT=zt(zmul(Z(mul(RR.c,1)),z));}
  else{n=R.ent(2,4);rho=R.choix([Rd(1),Rd(2),Rd(1,2),Rd(Q(1,2),2)]);phi=R.choix(ANG.filter(t=>trig(t)&&mul(t,12).n%6!==0));const RR=rpow(rho,n),{a,b}=algDe(RR,phi);w=[rF(a),rF(b)];wT=zR(a,b);}
  const RR=rpow(rho,n),thT=`${angT(div(phi,n))==="0"?"":angT(div(phi,n))+" + "}${kpi(n)}`,thTape=`${angTape(div(phi,n))}+2*k*pi/${n}`;
  const rhoTape=rTape(rho),RT=rT(RR);
  const E=[{w:`On écrit w en forme exponentielle : ${fx(`w = ${expT(RR,phi)==="1"?"e^{0}":expT(RR,phi)}`)}${nul(phi)?"":""}.`,why:`Module ${fx(`|w| = ${RT}`)} et argument ${fx(angT(phi))}${genre===3?" (calculés comme pour une forme exponentielle)":""}.`,pts:1},
    {w:`On cherche ${fx("z = r e^{iθ}")} : ${fx(`zⁿ = rⁿ e^{inθ}`)}, donc ${fx(`r^{${n}} = ${RT}`)}, c'est-à-dire ${fx(`r = ${rT(rho)}`)}.`,why:`Deux complexes égaux ont le même module. ${fx("r &gt; 0")}, donc r est la racine ${n===2?"carrée":n===3?"cubique":n+"-ième"} positive de ${fx(RT)}.`,pts:1},
    {w:`Et ${fx(`${n}θ = ${angT(phi)} + 2kπ`)}, donc ${fx(`θₖ = ${thT}`)}, pour ${fx(kL(n))}.`,why:`Les arguments de deux complexes égaux sont égaux à 2π près. Pour k = ${n}, on retombe sur le point de k = 0 : il y a exactement ${n} solutions.`,pts:1}];
  return exoRK({sig:"K"+genre+"|"+wT+"|"+n,n,rho,R:RR,phi,w,thT,thTape,rhoTape,etapes:E,q:`Résous dans ℂ l'équation ${fx(`z^{${n}} = ${wT}`)}.`,corps:genre===1?`<p class="muted">Méthode : écris w en forme exponentielle ${fx("w = R e^{iφ}")}, puis cherche ${fx("z = r e^{iθ}")} : ${fx("rⁿ = R")} et ${fx("nθ = φ + 2kπ")}.</p>`:"",nature:["","racines de 1, −1, i, −i","un réel ou un imaginaire pur","w en forme algébrique"][genre],texte:`résoudre z^${n} = ${wT}`});}
/* toutes les solutions en forme algébrique */
function racAlg(R){const cas=R.choix([[3,Q(0)],[3,Q(1)],[3,Q(1,2)],[3,Q(-1,2)],[4,Q(0)],[4,Q(1)],[4,Q(2,3)],[4,Q(-2,3)],[6,Q(0)],[6,Q(1)],[2,Q(1,2)],[2,Q(2,3)],[2,Q(-1,3)]]),n=cas[0],phi=cas[1],rho=R.choix(n===6?[Rd(1),Rd(1,3),Rd(1,2)]:[Rd(1),Rd(2),Rd(1,2),Rd(1,3)]);
  const RR=rpow(rho,n),{a,b}=algDe(RR,phi),wT=zR(a,b),sol=[...Array(n)].map((_,k)=>angP(add(div(phi,n),Q(2*k,n)))),Zs=sol.map(t=>algDe(rho,t)),txt=Zs.map(z=>zR(z.a,z.b));
  const E=[{w:`${fx(`w = ${expT(RR,phi)}`)} : les solutions sont ${fx(`z = ${rT(rho)==="1"?"":rT(rho)}e^{iθₖ}`)}, avec ${fx(`θₖ = ${nul(phi)?"":angT(div(phi,n))+" + "}${kpi(n)}`)}.`,why:`${fx(`rⁿ = ${rT(RR)}`)} donne ${fx(`r = ${rT(rho)}`)}, et ${fx(`nθ = φ + 2kπ`)}.`,pts:1},
    {w:`Les ${n} angles : ${fx(sol.map(angT).join(" ; "))}.`,why:"On prend k = 0, 1, … jusqu'à n − 1, et on ramène chaque angle dans ]−π, π].",pts:1},
    {w:`En forme algébrique, avec ${fx("r e^{iθ} = r(cos θ + i sin θ)")} : ${fx(listeT(txt))}.`,why:"Ce sont des angles connus (multiples de π/6 ou de π/4) : on lit leurs cosinus et sinus.",pts:1.5}];
  const fx0=Zs.map(z=>[rF(z.a),-rF(z.b)]);
  return exoListe({sig:"Z"+wT+"|"+n,att:Zs.map(z=>[rF(z.a),rF(z.b)]),txt,tape:Zs.map(z=>zRtape(z.a,z.b)),faux:Zs.slice(0,n-1).map(z=>zRtape(z.a,z.b)).concat(["0"]).join(" ; "),label:`Les ${n} solutions :`,etapes:E,
    q:`Résous dans ℂ l'équation ${fx(`z^{${n}} = ${wT}`)}. Donne les ${n} solutions sous forme algébrique.`,corps:"",nature:`n = ${n}`,texte:`solutions algébriques de z^${n} = ${wT}`,
    pieges:[[fx0,{etape:0,type:"argument de w",titre:"Où ça part : l'argument de w.",msg:`Tu as les conjuguées des solutions : l'argument de w est ${fx(angT(phi))}.`}]],ens:{type:"zn",n,w:[rF(a),rF(b)]}});}
/* ---------- CC final : programme du CC1 (cachés tant que le CC final n'est pas dans les épreuves) ---------- */
const XP=[0.35,0.8,1.3,1.9,2.6,3.2];
const affT=(a,b)=>S([[a,"x"],[b,""]]),affTp=(a,b)=>`(${brut(a)}*x+(${brut(b)}))`,affP=(a,b)=>nul(q(b))?affT(a,b):`(${affT(a,b)})`;
const quaT=(p0,q0)=>S([[1,"x²"],[p0,"x"],[q0,""]]),quaTp=(p0,q0)=>`(x^2+(${brut(p0)})*x+(${brut(q0)}))`;
/* juge une formule en x : o.ref(x) la valeur attendue aux points XP ; avecC : une constante additive est permise */
function jugeX(o){return rep=>{const t=String(rep.f==null?"":rep.f),k=t.lastIndexOf("="),src=k>=0?t.slice(k+1):t;if(!propre(src))return {incomplet:"Écris ta réponse."};
  const A=lis(src,["x"]);if(!A)return {incomplet:"Je n'arrive pas à lire ta formule. Écris par exemple 2x*e^(3x) + ln(x), avec des parenthèses."};
  const L=[...lettres(A)];if(L.length&&!o.avecC)return {incomplet:`Je ne connais pas la lettre ${L[0]} : écris ta réponse avec x seulement.`};
  const env=Object.fromEntries(L.map(c=>[c,0])),F=x=>{try{const v=val(A,Object.assign({x},env));return Math.abs(v[1])<1e-9?v[0]:NaN;}catch(e){return NaN;}};
  const V=o.prim?XP.map(x=>(F(x+1e-5)-F(x-1e-5))/2e-5):XP.map(F);
  if(V.some(v=>!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à calculer ta formule pour certaines valeurs de x : vérifie les parenthèses."};
  const tol=o.prim?1e-5:1e-8;if(V.every((v,i)=>Math.abs(v-o.ref(XP[i]))<=tol*Math.max(1,Math.abs(o.ref(XP[i])))))return {ok:true};
  const pg=(o.pieges||[]).find(p=>V.every((v,i)=>Math.abs(v-p[0](XP[i]))<=tol*Math.max(1,Math.abs(p[0](XP[i])))));
  return {ok:false,faux:["f"],resume:o.prim?"Pas tout à fait : en dérivant ta réponse, on ne retrouve pas f.":"Pas tout à fait : ce n'est pas la bonne dérivée.",diag:pg?pg[1]:{etape:o.fin,type:o.type,titre:"Où ça part : le calcul.",msg:o.prim?`Dérive ta réponse : elle doit redonner ${fx(`f(x) = ${o.fT}`)}. Une primitive est ${fx(`F(x) = ${o.ans}`)}.`:`On trouve ${fx(`f′(x) = ${o.ans}`)}.`}};};}
function exoX(o){const E=o.etapes;o.fin=o.fin==null?E.length-1:o.fin;o.type=o.type||(o.prim?"primitive":"dérivée");
  return {sig:o.sig,q:o.q,corps:o.corps||"",texte:o.texte,champs:[{k:"champ",id:"f",nom:o.prim?"primitive":"dérivée",label:o.prim?"$F(x) =$":"$f′(x) =$",ex:o.prim?"une primitive, sans + C":"une formule en x",sym:["e^(","ln(","√","x","^","/","(",")"],aide:"Écris e^(3x) avec des parenthèses, et x^2 pour x²."}],juge:jugeX(o),etapes:E,
    bonne:fx(`${o.prim?"F(x)":"f′(x)"} = ${o.ans}`),bonneTxt:`${o.prim?"F(x)":"f′(x)"} = ${o.ans}`,repBonne:{f:o.tape},repFausse:{f:o.faux||`(${o.tape})+x`},nature:o.nature,ens:Object.assign({type:o.prim?"prim":"der"},o.ens)};}
const ex1=k=>k===1?"x":k===-1?"−x":k<0?"−"+(-k)+"x":k+"x",coefK=k=>k===1?"":k===-1?"−":nb(k),coef=k=>{k=q(k);return egal(k,1)?"":egal(k,-1)?"−":k.d===1?nb(k):"("+nb(k)+")";};
/* les fonctions de base g, avec leur dérivée */
const BASE=[
 {id:"e",T:k=>`e^{${ex1(k)}}`,tp:k=>`e^(${k}*x)`,f:k=>x=>Math.exp(k*x),d:k=>x=>k*Math.exp(k*x),dT:k=>`${coefK(k)}e^{${ex1(k)}}`,regle:k=>`${fx(`(e^{kx})′ = ke^{kx}`)}`},
 {id:"ln",T:()=>"ln x",tp:()=>"ln(x)",f:()=>Math.log,d:()=>x=>1/x,dT:()=>"1/x",regle:()=>fx("(ln x)′ = 1/x")},
 {id:"sin",T:k=>`sin(${ex1(k)})`,tp:k=>`sin(${k}*x)`,f:k=>x=>Math.sin(k*x),d:k=>x=>k*Math.cos(k*x),dT:k=>`${coefK(k)}cos(${ex1(k)})`,regle:()=>fx("(sin(kx))′ = k cos(kx)")},
 {id:"cos",T:k=>`cos(${ex1(k)})`,tp:k=>`cos(${k}*x)`,f:k=>x=>Math.cos(k*x),d:k=>x=>-k*Math.sin(k*x),dT:k=>`${coefK(-k)}sin(${ex1(k)})`,regle:()=>fx("(cos(kx))′ = −k sin(kx)")},
 {id:"rac",T:()=>"√x",tp:()=>"sqrt(x)",f:()=>Math.sqrt,d:()=>x=>1/(2*Math.sqrt(x)),dT:()=>"1/(2√x)",regle:()=>fx("(√x)′ = 1/(2√x)")}];
function deriveProduit(R){const g=R.choix(BASE),k=g.id==="ln"||g.id==="rac"?1:R.choix([1,2,3,-1,-2]),a=R.nz(-4,4),b=R.ent(-5,5),A=affT(a,b),gT=g.T(k),G=g.f(k),dG=g.d(k);
  const f=x=>(a*x+b)*G(x),df=x=>a*G(x)+(a*x+b)*dG(x),fT=`${affP(a,b)}${g.id==="ln"||g.id==="rac"?" ":""}${gT}`;
  const ans=`${S([[a,g.id==="ln"?"ln x":gT]])}${(()=>{const t=`${affP(a,b)} × ${g.dT(k)}`;return t[0]==="−"?" − "+t.slice(1):" + "+t;})()}`;
  const E=[{w:`${fx(`f = u × v`)} avec ${fx(`u(x) = ${A}`)} et ${fx(`v(x) = ${gT}`)} : ${fx(`u′(x) = ${nb(a)}`)} et ${fx(`v′(x) = ${g.dT(k)}`)}.`,why:`On reconnaît un produit. ${g.regle(k)}.`,pts:1},
    {w:`${fx("(uv)′ = u′v + uv′")} : ${fx(`f′(x) = ${ans}`)}.`,why:"La dérivée d'un produit a deux termes : on dérive l'un des facteurs en gardant l'autre, puis l'inverse.",pts:1}];
  return exoX({sig:"DP"+g.id+k+"|"+a+"|"+b,q:`Calcule la dérivée de ${fx(`f(x) = ${fT}`)}.`,texte:`dérivée de ${fT}`,ref:df,ans,tape:`${a}*${g.tp(k)}+${affTp(a,b)}*(${g.id==="e"?`${k}*${g.tp(k)}`:g.id==="ln"?"1/x":g.id==="sin"?`${k}*cos(${k}*x)`:g.id==="cos"?`-${k}*sin(${k}*x)`:"1/(2*sqrt(x))"})`,etapes:E,nature:"produit",
    pieges:[[x=>a*dG(x),{etape:1,type:"u′v′ au lieu de u′v + uv′",titre:"Où ça part : la dérivée d'un produit.",msg:"La dérivée d'un produit n'est pas le produit des dérivées : (uv)′ = u′v + uv′."}],[x=>a*G(x),{etape:1,type:"un terme oublié",titre:"Où ça part : la dérivée d'un produit.",msg:"Il manque le terme uv′ : on dérive aussi le second facteur."}],[x=>(a*x+b)*dG(x),{etape:1,type:"un terme oublié",titre:"Où ça part : la dérivée d'un produit.",msg:"Il manque le terme u′v : on dérive aussi le premier facteur."}]],ens:{f:fT,g:g.id,k,a,b}});}
function deriveQuotient(R){const t=R();let f,df,fT,ans,E,tape,pg,nat;
  if(t<0.45){let a,b,c,d;do{a=R.nz(-5,5);b=R.ent(-6,6);c=R.ent(1,4);d=R.ent(1,6);}while(a*d===b*c);
    f=x=>(a*x+b)/(c*x+d);df=x=>(a*d-b*c)/(c*x+d)**2;fT=`(${affT(a,b)})/(${affT(c,d)})`;ans=`${a*d-b*c}/(${affT(c,d)})²`.replace(/^-/,"−");tape=`(${a*d-b*c})/(${c}*x+${d})^2`;nat="quotient de deux affines";
    E=[{w:`${fx(`u(x) = ${affT(a,b)}`)}, ${fx(`v(x) = ${affT(c,d)}`)}, donc ${fx(`u′ = ${nb(a)}`)} et ${fx(`v′ = ${c}`)}.`,why:"On reconnaît un quotient u/v.",pts:1},
      {w:`${fx("(u/v)′ = (u′v − uv′)/v²")} : ${fx(`f′(x) = (${nb(a)}(${affT(c,d)}) − ${c}(${affT(a,b)}))/(${affT(c,d)})²`)}.`,why:"L'ordre compte : d'abord u′v, puis moins uv′.",pts:1},
      {w:`Au numérateur, les termes en x s'annulent : ${fx(`f′(x) = ${ans}`)}.`,why:`Il reste ${fx(`${par(a)} × ${d} − ${c} × ${par(b)} = ${nb(a*d-b*c)}`)}.`,pts:1}];
    pg=[[x=>-(a*d-b*c)/(c*x+d)**2,"ordre de u′v et uv′"],[x=>a/c,"u′/v′"]];}
  else if(t<0.75){const k=R.choix([1,2,-1,3]),c=R.ent(1,3),d=R.ent(1,4);f=x=>Math.exp(k*x)/(c*x+d);df=x=>Math.exp(k*x)*(k*(c*x+d)-c)/(c*x+d)**2;
    fT=`e^{${ex1(k)}}/(${affT(c,d)})`;ans=`(${affT(k*c,k*d-c)})e^{${ex1(k)}}/(${affT(c,d)})²`;tape=`(${k*c}*x+(${k*d-c}))*e^(${k}*x)/(${c}*x+${d})^2`;nat="exponentielle sur affine";
    E=[{w:`${fx(`u(x) = e^{${ex1(k)}}`)}, ${fx(`v(x) = ${affT(c,d)}`)}, donc ${fx(`u′ = ${coefK(k)}e^{${ex1(k)}}`)} et ${fx(`v′ = ${c}`)}.`,why:fx("(e^{kx})′ = ke^{kx}"),pts:1},
      {w:`${fx(`f′(x) = (${coefK(k)}e^{${ex1(k)}}(${affT(c,d)}) − ${c}e^{${ex1(k)}})/(${affT(c,d)})²`)}.`,why:fx("(u/v)′ = (u′v − uv′)/v²"),pts:1},
      {w:`On met ${fx(`e^{${ex1(k)}}`)} en facteur : ${fx(`f′(x) = ${ans}`)}.`,why:`${fx(`${par(k)}(${affT(c,d)}) − ${c} = ${affT(k*c,k*d-c)}`)}.`,pts:1}];
    pg=[[x=>Math.exp(k*x)*(c-k*(c*x+d))/(c*x+d)**2,"ordre de u′v et uv′"]];}
  else{const a=R.nz(-3,3),b=R.ent(-4,4),c=R.ent(1,5);f=x=>(a*x+b)/(x*x+c);df=x=>(-a*x*x-2*b*x+a*c)/(x*x+c)**2;fT=`(${affT(a,b)})/(x² + ${c})`;
    ans=`(${S([[-a,"x²"],[-2*b,"x"],[a*c,""]])})/(x² + ${c})²`;tape=`(${-a}*x^2+(${-2*b})*x+(${a*c}))/(x^2+${c})^2`;nat="affine sur x² + c";
    E=[{w:`${fx(`u(x) = ${affT(a,b)}`)}, ${fx(`v(x) = x² + ${c}`)}, donc ${fx(`u′ = ${nb(a)}`)} et ${fx("v′ = 2x")}.`,why:"On reconnaît un quotient u/v.",pts:1},
      {w:`${fx(`f′(x) = (${nb(a)}(x² + ${c}) − 2x(${affT(a,b)}))/(x² + ${c})²`)}.`,why:fx("(u/v)′ = (u′v − uv′)/v²"),pts:1},
      {w:`On développe le numérateur : ${fx(`f′(x) = ${ans}`)}.`,why:`On développe ${fx(`${nb(a)}(x² + ${c})`)} et ${fx(`2x(${affT(a,b)})`)}, puis on regroupe les termes de même degré.`,pts:1}];
    pg=[[x=>-(-a*x*x-2*b*x+a*c)/(x*x+c)**2,"ordre de u′v et uv′"]];}
  return exoX({sig:"DQ"+fT,q:`Calcule la dérivée de ${fx(`f(x) = ${fT}`)}.`,texte:`dérivée de ${fT}`,ref:df,ans,tape,etapes:E,nature:nat,pieges:pg.map(([g,ty])=>[g,{etape:1,type:ty,titre:"Où ça part : la dérivée d'un quotient.",msg:"(u/v)′ = (u′v − uv′)/v² : d'abord u′v, puis moins uv′, le tout sur v²."}]),ens:{f:fT}});}
/* u : x² + px + q (positif sur XP) ou ax + b avec a, b > 0 */
function tireU(R){if(R()<0.5){const p0=R.ent(0,3),q0=R.ent(1,5);return {T:quaT(p0,q0),tp:quaTp(p0,q0),f:x=>x*x+p0*x+q0,d:x=>2*x+p0,dT:p0?`2x + ${p0}`:"2x",sig:"q"+p0+","+q0};}
  const a=R.ent(1,4),b=R.ent(1,5);return {T:affT(a,b),tp:affTp(a,b),f:x=>a*x+b,d:()=>a,dT:String(a),sig:"a"+a+","+b};}
const COMPO=[
 {id:"e",T:u=>`e^{${u}}`,tp:u=>`e^(${u})`,g:Math.exp,dg:Math.exp,dT:(u,du)=>`${du.length>1?"("+du+")":du}e^{${u}}`,regle:"(e^{u})′ = u′e^{u}"},
 {id:"ln",T:u=>`ln(${u})`,tp:u=>`ln(${u})`,g:Math.log,dg:x=>1/x,dT:(u,du)=>`(${du})/(${u})`,regle:"(ln u)′ = u′/u"},
 {id:"rac",T:u=>`√(${u})`,tp:u=>`sqrt(${u})`,g:Math.sqrt,dg:x=>1/(2*Math.sqrt(x)),dT:(u,du)=>`(${du})/(2√(${u}))`,regle:"(√u)′ = u′/(2√u)"},
 {id:"pow",T:(u,n)=>`(${u})^{${n}}`,tp:(u,n)=>`(${u})^${n}`,g:null,dg:null,dT:(u,du,n)=>`${n}(${du})(${u})${n-1>1?"^{"+(n-1)+"}":""}`,regle:"(uⁿ)′ = nu′uⁿ⁻¹"},
 {id:"sin",T:u=>`sin(${u})`,tp:u=>`sin(${u})`,g:Math.sin,dg:Math.cos,dT:(u,du)=>`${du.length>1?"("+du+")":du}cos(${u})`,regle:"(sin u)′ = u′cos u"}];
function deriveCompo(R,avecProduit){const c=R.choix(COMPO),u=tireU(R),n=R.ent(2,5),g=c.id==="pow"?x=>Math.pow(x,n):c.g,dg=c.id==="pow"?x=>n*Math.pow(x,n-1):c.dg;
  const h=x=>g(u.f(x)),dh=x=>u.d(x)*dg(u.f(x)),hT=c.T(u.T,n),dhT=c.dT(u.T,u.dT,n),htp=c.tp(u.tp,n);
  const V=avecProduit?"v":"f",E=[{w:`${fx(`${V} = g(u)`)} avec ${fx(`u(x) = ${u.T}`)}, donc ${fx(`u′(x) = ${u.dT}`)}.`,why:"On reconnaît une composée : une fonction de base appliquée à u(x).",pts:1},
    {w:`${fx(c.regle)} : ${fx(`${V}′(x) = ${dhT}`)}.`,why:"On n'oublie pas de multiplier par u′, la dérivée de ce qu'il y a dedans.",pts:1}];
  if(!avecProduit)return exoX({sig:"DC"+c.id+u.sig+(c.id==="pow"?n:""),q:`Calcule la dérivée de ${fx(`f(x) = ${hT}`)}.`,texte:`dérivée de ${hT}`,ref:dh,ans:dhT,tape:dhtpGen(c,u,n),etapes:E,nature:"composée "+c.id,
    pieges:[[x=>dg(u.f(x)),{etape:1,type:"u′ oublié",titre:"Où ça part : la dérivée d'une composée.",msg:`Il faut multiplier par ${fx(`u′(x) = ${u.dT}`)}.`}]],ens:{f:hT}});
  const a=R.nz(-3,3),b=R.ent(-3,3),f=x=>(a*x+b)*h(x),df=x=>a*h(x)+(a*x+b)*dh(x),fT=`${affP(a,b)}${hT}`,ans=`${S([[a,hT]])}${(()=>{const t=`${affP(a,b)} × ${dhT}`;return t[0]==="−"?" − "+t.slice(1):" + "+t;})()}`;
  E.unshift({w:`${fx(`f(x) = ${affP(a,b)} × v(x)`)} : un produit, dont le second facteur ${fx(`v(x) = ${hT}`)} est une composée.`,why:`La dérivée du premier facteur est ${fx(nb(a))}, et ${fx("(fg)′ = f′g + fg′")}.`,pts:1});
  E.push({w:`${fx(`f′(x) = ${ans}`)}.`,why:`On dérive le premier facteur (${fx(nb(a))}) en gardant v, puis on garde le premier facteur et on dérive v.`,pts:1});
  return exoX({sig:"DM"+c.id+u.sig+(c.id==="pow"?n:"")+"|"+a+"|"+b,q:`Calcule la dérivée de ${fx(`f(x) = ${fT}`)}.`,texte:`dérivée de ${fT}`,ref:df,ans,tape:`(${a})*${htp}+${affTp(a,b)}*(${dhtpGen(c,u,n)})`,etapes:E,nature:"mélange",
    pieges:[[x=>a*h(x)+(a*x+b)*dg(u.f(x)),{etape:2,type:"u′ oublié",titre:"Où ça part : la dérivée de la composée.",msg:`Dans la dérivée de ${fx(hT)}, il faut multiplier par ${fx(`u′(x) = ${u.dT}`)}.`}],[x=>a*dh(x),{etape:3,type:"u′v′ au lieu de u′v + uv′",titre:"Où ça part : la dérivée d'un produit.",msg:"(uv)′ = u′v + uv′, pas u′v′."}]],ens:{f:fT}});}
const dhtpGen=(c,u,n)=>`(${dUtp(u)})*${c.id==="pow"?`${n}*(${u.tp})^${n-1}`:c.id==="e"?c.tp(u.tp):c.id==="ln"?`1/(${u.tp})`:c.id==="rac"?`1/(2*sqrt(${u.tp}))`:`cos(${u.tp})`}`;
const dUtp=u=>u.sig[0]==="q"?`2*x+(${u.sig.slice(1).split(",")[0]})`:u.sig.slice(1).split(",")[0];

/* CA10 : primitives, en reconnaissant u′uⁿ, u′/u, u′eᵘ */
function primitive(R,sorte){const s=sorte||R.choix(["pow","log","exp","trig"]);let fT,f,ans,tape,E,pg=[];
  if(s==="pow"){const n=R.ent(1,4);if(R()<0.5){const q0=R.ent(1,5),c=2*R.nz(-3,3),k=Q(c,2*(n+1));fT=`${coefK(c)}x(x² + ${q0})${n>1?"^{"+n+"}":""}`;f=x=>c*x*Math.pow(x*x+q0,n);ans=`${coef(k)}(x² + ${q0})^{${n+1}}`;tape=`(${brut(k)})*(x^2+${q0})^${n+1}`;
      E=[{w:`Avec ${fx(`u(x) = x² + ${q0}`)}, ${fx("u′(x) = 2x")} : ${fx(`f(x) = ${nb(Q(c,2))} × u′(x)u(x)${n>1?"^{"+n+"}":""}`)}.`,why:`On reconnaît la forme ${fx("u′uⁿ")}, à une constante près : ${fx(`${c}x = ${nb(Q(c,2))} × 2x`)}.`,pts:1},
        {w:`Une primitive de ${fx("u′uⁿ")} est ${fx("u^{n+1}/(n + 1)")} : ${fx(`F(x) = ${nb(Q(c,2))} × (x² + ${q0})^{${n+1}}/${n+1} = ${ans}`)}.`,why:`On vérifie en dérivant : ${fx(`F′(x) = ${nb(Q(c,2))} × 2x(x² + ${q0})${n>1?"^{"+n+"}":""}`)}, c'est bien f.`,pts:1}];
      pg=[[x=>c*(n+1)*x*Math.pow(x*x+q0,n),"facteur 1/(n + 1) oublié"]];}
    else{const a=R.ent(2,5),b=R.ent(1,6),k=Q(1,a*(n+1));fT=`(${affT(a,b)})${n>1?"^{"+n+"}":""}`;f=x=>Math.pow(a*x+b,n);ans=`(${affT(a,b)})^{${n+1}}/${a*(n+1)}`;tape=`(${a}*x+${b})^${n+1}/${a*(n+1)}`;
      E=[{w:`Avec ${fx(`u(x) = ${affT(a,b)}`)}, ${fx(`u′(x) = ${a}`)} : ${fx(`f(x) = (1/${a}) × u′(x)u(x)${n>1?"^{"+n+"}":""}`)}.`,why:`On fait apparaître u′ : on multiplie et on divise par ${a}.`,pts:1},
        {w:`${fx(`F(x) = (1/${a}) × (${affT(a,b)})^{${n+1}}/${n+1} = ${ans}`)}.`,why:`Une primitive de ${fx("u′uⁿ")} est ${fx("u^{n+1}/(n + 1)")}. On vérifie en dérivant.`,pts:1}];
      pg=[[x=>a*Math.pow(a*x+b,n),"division par a oubliée"]];}}
  else if(s==="log"){if(R()<0.5){const q0=R.ent(1,6),c=R.nz(-6,6),k=Q(c,2);fT=`${c}x/(x² + ${q0})`.replace(/^1x/,"x").replace(/^-1x/,"−x").replace(/^-/,"−");f=x=>c*x/(x*x+q0);ans=`${coef(k)}ln(x² + ${q0})`;tape=`(${brut(k)})*ln(x^2+${q0})`;
      E=[{w:`Avec ${fx(`u(x) = x² + ${q0}`)}, ${fx("u′(x) = 2x")} : ${fx(`f(x) = ${nb(k)} × u′(x)/u(x)`)}.`,why:`On reconnaît ${fx("u′/u")}, à la constante ${fx(nb(k))} près.`,pts:1},
        {w:`Une primitive de ${fx("u′/u")} est ${fx("ln|u|")}, et ici ${fx(`x² + ${q0} &gt; 0`)} : ${fx(`F(x) = ${ans}`)}.`,why:"On vérifie en dérivant.",pts:1}];
      pg=[[x=>2*c*x/(x*x+q0),"facteur 1/2 oublié"]];}
    else{const a=R.ent(1,5),b=R.ent(1,6),c=R.nz(-6,6),k=Q(c,a);fT=`${c}/(${affT(a,b)})`.replace(/^-/,"−");f=x=>c/(a*x+b);ans=`${coef(k)}ln(${affT(a,b)})`;tape=`(${brut(k)})*ln(${a}*x+${b})`;
      E=[{w:`Avec ${fx(`u(x) = ${affT(a,b)}`)}, ${fx(`u′(x) = ${a}`)} : ${fx(`f(x) = ${nb(k)} × u′(x)/u(x)`)}.`,why:`On fait apparaître u′ au numérateur : ${fx(`${c} = ${nb(k)} × ${a}`)}.`,pts:1},
        {w:`${fx(`F(x) = ${ans}`)} sur ${fx(`]${nb(Q(-b,a))} ; +∞[`)}, où ${fx(`${affT(a,b)} &gt; 0`)}.`,why:`Une primitive de ${fx("u′/u")} est ${fx("ln|u|")}.`,pts:1}];
      pg=[[x=>c*a/(a*x+b),"division par a oubliée"]];}}
  else if(s==="exp"){if(R()<0.5){const c=R.nz(-4,4)*2,k=Q(c,2);fT=`${c}xe^{x²}`.replace(/^2x/,"2x").replace(/^-/,"−");f=x=>c*x*Math.exp(x*x);ans=`${coef(k)}e^{x²}`;tape=`(${brut(k)})*e^(x^2)`;
      E=[{w:`Avec ${fx("u(x) = x²")}, ${fx("u′(x) = 2x")} : ${fx(`f(x) = ${nb(k)} × u′(x)e^{u(x)}`)}.`,why:`On reconnaît ${fx("u′e^{u}")}.`,pts:1},{w:`Une primitive de ${fx("u′e^{u}")} est ${fx("e^{u}")} : ${fx(`F(x) = ${ans}`)}.`,why:"On vérifie en dérivant.",pts:1}];
      pg=[[x=>2*c*x*Math.exp(x*x),"facteur 1/2 oublié"]];}
    else{const k=R.choix([2,3,4,-2,-3]),c=R.nz(-6,6),K=Q(c,k);fT=`${coefK(c)}e^{${ex1(k)}}`;f=x=>c*Math.exp(k*x);ans=`${coef(K)}e^{${ex1(k)}}`;tape=`(${brut(K)})*e^(${k}*x)`;
      E=[{w:`Avec ${fx(`u(x) = ${ex1(k)}`)}, ${fx(`u′ = ${k}`)} : ${fx(`f(x) = ${nb(K)} × u′e^{u}`)}.`,why:`On fait apparaître u′ : ${fx(`${c} = ${nb(K)} × ${k}`)}.`,pts:1},{w:`${fx(`F(x) = ${ans}`)}.`,why:`Une primitive de ${fx("u′e^{u}")} est ${fx("e^{u}")}. On vérifie en dérivant.`,pts:1}];
      pg=[[x=>c*k*Math.exp(k*x),"division par k oubliée"]];}}
  else{const k=R.choix([2,3,4]),c=R.nz(-6,6),cosi=R()<0.5,K=Q(cosi?c:-c,k);fT=`${coefK(c)}${cosi?"cos":"sin"}(${k}x)`;f=x=>c*(cosi?Math.cos(k*x):Math.sin(k*x));
    ans=`${coef(K)}${cosi?"sin":"cos"}(${k}x)`;tape=`(${brut(K)})*${cosi?"sin":"cos"}(${k}*x)`;
    E=[{w:`${fx(cosi?"(sin(kx))′ = k cos(kx)":"(cos(kx))′ = −k sin(kx)")}.`,why:"On part de la dérivée connue, et on ajuste la constante.",pts:1},{w:`${fx(`F(x) = ${ans}`)}.`,why:`On divise par ${k}${cosi?"":" et on change le signe"}. On vérifie en dérivant.`,pts:1}];
    pg=[[x=>-c*(cosi?Math.cos(k*x):Math.sin(k*x)),"signe"]];}
  return exoX({prim:true,avecC:true,sig:"P"+fT,q:`Donne une primitive de ${fx(`f(x) = ${fT}`)}${s==="log"?" (là où elle est définie)":""}.`,corps:`<p class="muted">Une primitive F de f est une fonction dont la dérivée est f. Le site dérive ta réponse : n'importe quelle primitive est acceptée.</p>`,texte:`primitive de ${fT}`,ref:f,fT,ans,tape,etapes:E,nature:{pow:"u′uⁿ",log:"u′/u",exp:"u′eᵘ",trig:"cos et sin"}[s],
    pieges:pg.map(([g,ty])=>[g,{etape:1,type:ty,titre:"Où ça part : la constante.",msg:`En dérivant ta réponse, on trouve un multiple de f : la constante est fausse. Une primitive est ${fx(`F(x) = ${ans}`)}.`}]),ens:{f:fT}});}
/* CA11 : intégration par parties. Une valeur exacte = somme de termes c × (1, e^m, π, π², ln 2, ln 3) */
const KV={"1":[()=>"",()=>"1",()=>1],e:[m=>m===1?"e":`e^{${m<0?"−"+(-m):m}}`,m=>`e^(${m})`,m=>Math.exp(m)],pi:[()=>"π",()=>"pi",()=>Math.PI],pi2:[()=>"π²",()=>"pi^2",()=>Math.PI**2],ln2:[()=>"ln 2",()=>"ln(2)",()=>Math.LN2],ln3:[()=>"ln 3",()=>"ln(3)",()=>Math.log(3)],
  ln:[m=>"ln "+m,m=>`ln(${m})`,m=>Math.log(m)],lnq:[m=>`ln(${m})`,m=>`ln(${m})`,m=>{const [a,b]=m.split("/");return Math.log(a/b);}]};
function VX(T){const L=T.map(([c,k,m])=>[q(c),k,m]).filter(t=>!nul(t[0]));const tri={"e":0,pi2:1,pi:2,ln2:3,ln3:4,ln:3,lnq:3.5,"1":5};L.sort((x,y)=>tri[x[1]]-tri[y[1]]||(y[2]||0)-(x[2]||0));
  const M=[];L.forEach(t=>{const o=M.find(x=>x[1]===t[1]&&x[2]===t[2]);if(o)o[0]=add(o[0],t[0]);else M.push(t);});const N=M.filter(t=>!nul(t[0]));
  return {T:S(N.map(([c,k,m])=>[c,KV[k][0](m)])),tp:N.length?N.map(([c,k,m])=>`(${brut(c)})*${KV[k][1](m)}`).join("+"):"0",v:N.reduce((t,[c,k,m])=>t+c.n/c.d*KV[k][2](m),0),L:N};}
const negV=T=>T.map(([c,k,m])=>[mul(q(c),-1),k,m]);
const vP=t=>t[0]==="−"?"("+t+")":t,moinsT=t=>t[0]==="−"?"+ "+t.slice(1):"− "+t;
const bornT=b=>b.k==="pi"?(b.m===1?"π/2":b.m===2?"π":b.m+"π/2"):b.k==="e"?(b.m===1?"e":`e^{${b.m}}`):String(b.v);
/* une intégrale par parties tirée : famille, intégrande, primitive, valeur, étapes */
function ippTire(R,fam){
  if(fam==="exp"){const a=R.nz(-4,4),b=R.ent(-4,4),k=R.choix([1,2,-1,3]),B=R.choix([1,2]),K=Q(1,k),K2=Q(1,k*k);
    const vT=`${coef(K)}e^{${ex1(k)}}`,uB=Q(a*B+b),cr=VX([[mul(uB,K),"e",k*B],[mul(Q(-b),K),"1"]]),reste=VX([[mul(a,K2),"e",k*B],[mul(-a,K2),"1"]]),I=VX(cr.L.map(x=>x.slice()).concat(negV(reste.L)));
    return {sig:`E${a},${b},${k},${B}`,vTape:`e^(${k}*x)/(${k})`,f:x=>(a*x+b)*Math.exp(k*x),A:0,B,BT:String(B),fT:`(${affT(a,b)})e^{${ex1(k)}}`,u:affT(a,b),du:nb(a),dv:`e^{${ex1(k)}}`,v:vT,vF:x=>Math.exp(k*x)/k,duV:a,
      cr,reste,I,crT:`[(${affT(a,b)}) × ${vP(vT)}]_{0}^{${B}}`,resteT:`${a===1?"":a===-1?"−":nb(a)}∫_{0}^{${B}} ${vP(vT)} dx`,resteP:`${coef(mul(a,K2))}[e^{${ex1(k)}}]_{0}^{${B}}`,why0:"On dérive le polynôme (il devient un nombre) et on primitive l'exponentielle (elle reste une exponentielle)."};}
  if(fam==="trig"){const a=R.nz(-3,3),b=R.ent(-2,2),k=R.choix([1,1,2]),m=R.choix([1,2]),cosi=R()<0.5,B=Q(m,2),kB=k*m,S1=[0,1,0,-1][kB%4],C1=[1,0,-1,0][kB%4],K=Q(1,k),K2=Q(1,k*k);
    const g=cosi?"cos":"sin",vT=cosi?`${coef(K)}sin(${ex1(k)})`:`${coef(mul(K,-1))}cos(${ex1(k)})`,vF=cosi?x=>Math.sin(k*x)/k:x=>-Math.cos(k*x)/k;
    /* [uv] = u(β)v(β) − u(0)v(0) ; ∫u′v = a∫v */
    const cr=cosi?VX([[mul(mul(a,B),mul(K,S1)),"pi"],[mul(b,mul(K,S1)),"1"]]):VX([[mul(mul(a,B),mul(K,-C1)),"pi"],[mul(b,mul(K,-C1)),"1"],[mul(b,K),"1"]]);
    const reste=cosi?VX([[mul(a,mul(K2,-C1)),"1"],[mul(a,K2),"1"]]):VX([[mul(-a,mul(K2,S1)),"1"]]),I=VX(cr.L.map(x=>x.slice()).concat(negV(reste.L)));
    return {sig:`T${a},${b},${k},${m},${g}`,f:x=>(a*x+b)*(cosi?Math.cos(k*x):Math.sin(k*x)),A:0,B:Math.PI*m/2,BT:m===1?"π/2":"π",fT:`${affP(a,b)}${g}(${ex1(k)})`,u:affT(a,b),du:nb(a),dv:`${g}(${ex1(k)})`,v:vT,vF,duV:a,
      cr,reste,I,crT:`[${affP(a,b)} × ${vP(vT)}]_{0}^{${m===1?"π/2":"π"}}`,resteT:`${a===1?"":a===-1?"−":nb(a)}∫_{0}^{${m===1?"π/2":"π"}} ${vP(vT)} dx`,resteP:"",why0:`On dérive le polynôme et on primitive ${fx(`${g}(${ex1(k)})`)} : ${cosi?fx("∫ cos(kx) dx = sin(kx)/k"):fx("∫ sin(kx) dx = −cos(kx)/k")}.`};}
  if(fam==="ln"){const n=R.choix([1,2]),a=R.ent(1,4),Bk=R.choix(["e","2"]),N1=n+1,c1=Q(a,N1),c2=Q(a,N1*N1);
    const vT=`${coef(c1)}x^{${N1}}`,cr=Bk==="e"?VX([[c1,"e",N1]]):VX([[mul(c1,Math.pow(2,N1)),"ln2"]]),reste=Bk==="e"?VX([[c2,"e",N1],[mul(c2,-1),"1"]]):VX([[mul(c2,Math.pow(2,N1)),"1"],[mul(c2,-1),"1"]]),I=VX(cr.L.map(x=>x.slice()).concat(negV(reste.L)));
    return {sig:`L${n},${a},${Bk}`,f:x=>a*Math.pow(x,n)*Math.log(x),A:1,B:Bk==="e"?Math.E:2,BT:Bk,fT:`${a===1?"":a}x${n===2?"²":""} ln x`,u:"ln x",du:"1/x",dv:`${a===1?"":a}x${n===2?"²":""}`,v:vT,vF:x=>a*Math.pow(x,N1)/N1,duV:null,
      cr,reste,I,crT:`[ln x × ${vT}]_{1}^{${Bk}}`,resteT:`∫_{1}^{${Bk}} (1/x) × ${vT} dx`,resteS:`∫_{1}^{${Bk}} ${coef(c1)}x${n===2?"²":""} dx`,resteP:"",why0:"On dérive ln x (sa dérivée 1/x se simplifie avec la puissance de x) et on primitive la puissance de x. Avec ln, on pose toujours u = ln x."};}
  if(fam==="lnx"){const a=R.ent(1,4),Bk=R.choix(["e","2","3","e2"]),crL={e:[[a,"e",1]],"2":[[2*a,"ln2"]],"3":[[3*a,"ln3"]],e2:[[2*a,"e",2]]}[Bk],resteL={e:[[a,"e",1],[-a,"1"]],"2":[[a,"1"]],"3":[[2*a,"1"]],e2:[[a,"e",2],[-a,"1"]]}[Bk];
    const cr=VX(crL),reste=VX(resteL),I=VX(cr.L.map(x=>x.slice()).concat(negV(reste.L))),BT={e:"e","2":"2","3":"3",e2:"e²"}[Bk];
    return {sig:`N${a},${Bk}`,f:x=>a*Math.log(x),A:1,B:{e:Math.E,"2":2,"3":3,e2:Math.E**2}[Bk],BT,fT:`${a===1?"":a}ln x`,u:"ln x",du:"1/x",dv:String(a),v:`${a===1?"":a}x`,vF:x=>a*x,duV:null,
      cr,reste,I,crT:`[${a===1?"":a}x ln x]_{1}^{${BT}}`,resteT:`∫_{1}^{${BT}} (1/x) × ${a===1?"":a}x dx`,resteS:`∫_{1}^{${BT}} ${a} dx`,resteP:"",why0:a===1?"Astuce : ln x = 1 × ln x. On dérive ln x et on primitive 1 (v = x) : la dérivée 1/x se simplifie avec x.":`Astuce : on dérive ln x et on primitive ${a} (v = ${a}x) : la dérivée 1/x se simplifie avec x.`};}
  if(fam==="atan"){const a=R.ent(1,3),cr=VX([[Q(a,4),"pi"]]),reste=VX([[Q(a,2),"ln2"]]),I=VX(cr.L.map(x=>x.slice()).concat(negV(reste.L)));
    return {sig:`A${a}`,f:x=>a*Math.atan(x),A:0,B:1,BT:"1",fT:`${a===1?"":a}arctan x`,u:"arctan x",du:"1/(1 + x²)",dv:String(a),v:`${a===1?"":a}x`,vF:x=>a*x,duV:null,
      cr,reste,I,crT:`[${a===1?"":a}x arctan x]_{0}^{1}`,resteT:`∫_{0}^{1} ${a===1?"":a}x/(1 + x²) dx`,resteS:`${coef(Q(a,2))}[ln(1 + x²)]_{0}^{1}`,resteP:"",why0:`Astuce : arctan x = 1 × arctan x. ${fx("(arctan x)′ = 1/(1 + x²)")}, puis ${fx("x/(1 + x²)")} est de la forme ${fx("(1/2) × u′/u")}.`};}
  /* deux intégrations par parties */const t=R();
  if(t<0.6){const k=R.choix([1,-1,2]),a=R.ent(1,3),K=Q(1,k),F=x=>[mul(a,K),mul(-2*a,mul(K,K)),mul(2*a,mul(K,mul(K,K)))],[c2,c1,c0]=F();
    const I=VX([[add(add(c2,c1),c0),"e",k],[mul(c0,-1),"1"]]);
    return {sig:`X${k},${a}`,f:x=>a*x*x*Math.exp(k*x),A:0,B:1,BT:"1",fT:`${a===1?"":a}x²e^{${ex1(k)}}`,deux:true,I,prim:`e^{${ex1(k)}}(${S([[c2,"x²"],[c1,"x"],[c0,""]])})`,why0:"Le polynôme est de degré 2 : il faut le dériver deux fois, donc deux intégrations par parties."};}
  const cosi=R()<0.5,I=cosi?VX([[Q(1,4),"pi2"],[-2,"1"]]):VX([[1,"pi2"],[-4,"1"]]);
  return {sig:`Y${cosi}`,f:x=>x*x*(cosi?Math.cos(x):Math.sin(x)),A:0,B:cosi?Math.PI/2:Math.PI,BT:cosi?"π/2":"π",fT:`x²${cosi?"cos":"sin"} x`,deux:true,I,prim:cosi?"x² sin x + 2x cos x − 2 sin x":"−x² cos x + 2x sin x + 2 cos x",why0:"Le polynôme est de degré 2 : deux intégrations par parties, la seconde sur un x cos x ou un x sin x."};}
function ippEtapes(o){const It=`∫_{${o.A}}^{${o.BT}} ${o.fT} dx`;
  if(o.deux)return [{w:`Première intégration par parties : ${fx(`u = x²`)} et ${fx(`v′ = ${o.fT.replace(/^\d*x²/,"")}`)}${/^\d/.test(o.fT)?" (la constante "+o.fT.match(/^\d+/)[0]+" se met devant l'intégrale)":""}.`,why:o.why0,pts:1.5},{w:"La nouvelle intégrale a un x au lieu de x² : seconde intégration par parties, avec u = x.",why:"Chaque intégration par parties fait baisser le degré du polynôme de 1.",pts:1.5},{w:`Une primitive : ${fx(o.prim)}.`,why:"On regroupe les deux résultats ; on peut vérifier en dérivant.",pts:1},{w:`${fx(`I = ${o.I.T}`)}.`,why:"On calcule la primitive en la borne du haut, moins en la borne du bas.",pts:1}];
  return [{w:`On pose ${fx(`u(x) = ${o.u}`)} et ${fx(`v′(x) = ${o.dv}`)} : ${fx(`u′(x) = ${o.du}`)} et ${fx(`v(x) = ${o.v}`)}.`,why:o.why0,pts:1},
    {w:`${fx(`∫_{a}^{b} uv′ = [uv]_{a}^{b} − ∫_{a}^{b} u′v`)} : ${fx(`I = ${o.crT}`)} ${fx(moinsT(o.resteT))}.`,why:"C'est la formule d'intégration par parties.",pts:1},
    {w:`Le crochet : ${fx(`${o.crT} = ${o.cr.T}`)}.`,why:"On remplace x par la borne du haut, puis par la borne du bas, et on retranche.",pts:1},
    {w:`L'intégrale qui reste : ${fx(`${o.resteT}${o.resteS?" = "+o.resteS:""} = ${o.reste.T}`)}.`,why:"Elle est plus simple que celle de départ : c'est le but de l'intégration par parties.",pts:1},
    {w:`${fx(`I = ${o.cr.T} ${moinsT(o.reste.L.length===1?o.reste.T:"("+o.reste.T+")")} = ${o.I.T}`)}.`,why:"On retranche l'intégrale qui reste du crochet.",pts:1}];}
function exoIpp(R,fam,trous){const o=ippTire(R,fam),It=`∫_{${o.A}}^{${o.BT}} ${o.fT} dx`,E=ippEtapes(o),dern=E.length-1;
  const pieges=(o.deux?[]:[[o.cr.v,{etape:1,type:"l'intégrale qui reste oubliée",titre:"Où ça part : la formule.",msg:`Il reste ${fx(moinsT(o.resteT))} à calculer après le crochet.`}],[o.cr.v+o.reste.v,{etape:1,type:"signe de l'intégrale qui reste",titre:"Où ça part : la formule.",msg:"La formule est [uv] − ∫u′v : on retranche l'intégrale qui reste."}]]).filter(p=>!pres(p[0],o.I.v));
  const lireV=(t)=>{const A=lisReel(t);return A.vide?{vide:1}:A.avecI||A.illisible||A.neg?{bad:1}:A;};
  function juge(rep){
    if(trous){const D=lireV(rep.du),C=lireV(rep.cr),Iv=lireV(rep.I),Vs=String(rep.v==null?"":rep.v);if(D.vide||C.vide||Iv.vide||!propre(Vs))return {incomplet:"Remplis les quatre cases."};
      if(D.bad||C.bad||Iv.bad)return {incomplet:"Je n'arrive pas à lire une des cases. Écris par exemple 2, e - 2 ou e^(2) + 1."};
      const AV=lis(Vs.replace(/^[^=]*=/,""),["x"]);if(!AV||lettres(AV).size)return {incomplet:"Écris v(x) avec la lettre x, par exemple e^(2x)/2."};
      let okV;try{okV=XP.every(x=>Math.abs(val(AV,{x})[0]-o.vF(x))<1e-9*Math.max(1,Math.abs(o.vF(x))));}catch(e){okV=false;}
      const okD=pres(D.v,o.duV),okC=pres(C.v,o.cr.v),okI=pres(Iv.v,o.I.v),F=[];if((!okC&&C.dec&&Math.abs(C.v-o.cr.v)<0.02)||(!okI&&Iv.dec&&Math.abs(Iv.v-o.I.v)<0.02))return {incomplet:"Écris les valeurs exactes (avec e), pas des valeurs approchées."};if(!okD)F.push("du");if(!okV)F.push("v");if(!okC)F.push("cr");if(!okI)F.push("I");if(!F.length)return {ok:true};
      const d=!okD||!okV?{etape:0,type:!okD?"dérivée de u":"primitive de v′",titre:"Où ça part : u′ et v.",msg:`${fx(`u′(x) = ${o.du}`)} et ${fx(`v(x) = ${o.v}`)}.`}:!okC?{etape:2,type:"calcul du crochet",titre:"Où ça part : le crochet.",msg:`${fx(`${o.crT} = ${o.cr.T}`)}.`}:{etape:4,type:pieges.find(p=>pres(Iv.v,p[0]))?pieges.find(p=>pres(Iv.v,p[0]))[1].type:"conclusion",titre:"Où ça part : la fin.",msg:`${fx(`I = ${o.cr.T} ${moinsT(o.reste.L.length===1?o.reste.T:"("+o.reste.T+")")} = ${o.I.T}`)}.`};
      return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length} case${F.length>1?"s sont":" est"} à revoir.`,diag:d};}
    const A=lisReel(rep.I);if(A.vide)return {incomplet:"Écris la valeur de l'intégrale."};if(A.avecI||A.illisible||A.neg)return {incomplet:"Je n'arrive pas à lire ce nombre. Écris par exemple e - 2, pi/2 - 1 ou 2ln(2) - 1."};
    if(pres(A.v,o.I.v))return {ok:true};if(A.dec&&Math.abs(A.v-o.I.v)<0.02)return {incomplet:"Écris la valeur exacte (avec e, π ou ln), pas une valeur approchée."};
    const pg=pieges.find(p=>pres(A.v,p[0]));
    return {ok:false,faux:["I"],resume:"Pas tout à fait : ce n'est pas la bonne valeur.",diag:pg?pg[1]:{etape:dern,type:"calcul",titre:"Où ça part : le calcul.",msg:`${fx(`I = ${o.I.T}`)}. Vérifie le signe de l'intégrale : ${o.I.v>0?"elle est positive":"elle est négative"} (environ ${dec(o.I.v)}).`}};}
  const q=`Calcule ${fx(`I = ${It}`)}${trous?", en complétant les étapes":" par une intégration par parties"}.`;
  const corps=trous?`<p>On pose ${fx(`u(x) = ${o.u}`)} et ${fx(`v′(x) = ${o.dv}`)}. Alors ${fx("u′(x) =")} ${O.trou("du")} et ${fx("v(x) =")} ${O.trou("v",1)}.</p><p>Avec ${fx("∫_{a}^{b} uv′ = [uv]_{a}^{b} − ∫_{a}^{b} u′v")}, le crochet vaut ${fx(`${o.crT} =`)} ${O.trou("cr",1)}.</p><p>Finalement ${fx("I =")} ${O.trou("I",1)}.</p>`:o.deux?`<p class="muted">Indication : deux intégrations par parties de suite.</p>`:"";
  return {sig:(trous?"C":"I")+o.sig,q,corps,corpsPapier:trous?`<p>Sur ta feuille, rédige le calcul en entier : u, v′, u′, v, la formule, le crochet, l'intégrale qui reste, le résultat.</p>`:undefined,texte:`IPP : ${It}`,
    champs:trous?[{k:"trous",ids:["du","v","cr","I"]},{k:"sym",id:"s",sym:["e^(","π","ln(","/","x"],aide:"Pour e², écris e^(2). Les boutons écrivent dans la case où tu es."}]:[{k:"champ",id:"I",nom:"valeur",label:"$I =$",ex:"une valeur exacte, par exemple e - 2",sym:["e","e^(","π","ln(","/"]}],
    indice:trous?false:undefined,juge,etapes:E,bonne:fx(`I = ${o.I.T}`),bonneTxt:`I = ${o.I.T}`,repBonne:trous?{du:String(o.duV),v:o.vTape,cr:o.cr.tp,I:o.I.tp}:{I:o.I.tp},
    repFausse:trous?{du:String(o.duV),v:o.vTape,cr:o.cr.tp,I:String(o.cr.v)}:{I:pieges.length?String(pieges[0][0]):`(${o.I.tp})+1`},nature:{exp:"polynôme fois exponentielle",trig:"x cos x, x sin x",ln:"xⁿ ln x",lnx:"ln x",atan:"arctan x",deux:"deux intégrations"}[fam],ens:{type:"ipp",A:o.A,B:o.B,f:o.f}};}
/* ---------- CA12 : changement de variable ----------
   Un cas : I = ∫ f(x) dx de A à B ; avec u = uT, I = K ∫ g(u) du de uA à uB = K [G]. */
/* c × ln(p/d), écrit avec le plus petit entier possible : ln 4 = 2 ln 2, ln(1/3) = −ln 3 */
function lnK(c,p,d){const r=Q(p,d||1);if(r.n===r.d)return [0,"1"];if(r.n<r.d)return lnK(mul(c,-1),r.d,r.n);
  if(r.d===1){for(const b of [2,3,5,6,7,10])for(let k=2;k<7;k++)if(Math.pow(b,k)===r.n)return [mul(c,k),"ln",b];return [c,"ln",r.n];}
  return [c,"lnq",r.n+"/"+r.d];}
const eK=(c,m)=>m===0?[c,"1"]:[c,"e",m],eT=m=>m===0?"1":KV.e[0](m);
/* la même valeur exacte que VX, en commençant par un terme positif quand il y en a un : « 2 − ln 3 » */
function VP(T){const o=VX(T),i=o.L.findIndex(t=>t[0].n>0);if(i<=0)return o;const L=[o.L[i]].concat(o.L.filter((_,j)=>j!==i));
  return {T:S(L.map(([c,k,m])=>[c,KV[k][0](m)])),tp:o.tp,v:o.v,L};}
const bq=x=>{x=q(x);return {T:nb(x),tp:brut(x),v:x.n/x.d};},bt=(T,v,tp)=>({T,v,tp});
const bE=m=>m===0?bq(1):bt(["","e","e²","e³"][m],Math.exp(m)),bL=m=>m===1?bq(0):bt("ln "+m,Math.log(m));
const bA=(n,d)=>n===0?bq(0):bt((n===1?"":n)+"π"+(d===1?"":"/"+d),n*Math.PI/d,`${n}*pi/${d}`);
const duK=K=>egal(K,1)?"du":K.n===1?"du/"+K.d:coef(K)+" du",inv1=u=>u===1?"1":"1/"+u,entre=(KT,t)=>KT?`${KT}(${t})`:t;
const pw=(x,n)=>{let r=Q(1);for(let i=0;i<n;i++)r=mul(r,x);return r;},lnT=x=>{x=q(x);return x.d===1?"ln "+x.n:`ln(${nb(x)})`;};
const croise=(X,Y,v)=>X.flatMap((x,i)=>Y.map((y,j)=>[x,y,i+j])).filter(t=>t[2]%2===v);
function cvCas(o){o.KT=coef(o.K);o.newT=`${o.KT}∫_{${o.uA.T}}^{${o.uB.T}} ${o.gT} du`;o.crT=`${o.KT}[${o.GT}]_{${o.uA.T}}^{${o.uB.T}}`;o.It=`∫_{${o.A.T}}^{${o.B.T}} ${o.fT} dx`;return o;}
/* palier 1 : u = ax + b */
const affV=(a,b,x)=>`${a===1?"":a+" × "}${x}${b?(b<0?" − "+(-b):" + "+b):""} = ${nb(a*x+b)}`;
function cvAff(o){const {a,b,B}=o;
  return cvCas(Object.assign(o,{sig:`A${o.s}${a},${b},${B}`,nat:"u = ax + b",f:x=>o.g(a*x+b),A:bq(0),B:bq(B),uT:affT(a,b),uF:x=>a*x+b,du:a===1?"du = dx":`du = ${a} dx`,donc:a===1?"":`dx = du/${a}`,
    why0:`u est une fonction affine : sa dérivée est le nombre ${a}, et ${fx("du = u′(x) dx")}.`,K:Q(1,a),uA:bq(b),uB:bq(a*B+b),uAc:affV(a,b,0),uBc:affV(a,b,B)}));}
function cvAffine(R){const g=R.choix(["pow","inv","inv","inv2","rac","exp"]);
  if(g==="pow"){let a,b,B,n;do{a=R.choix([2,3]);b=R.choix([-1,1,2]);B=R.choix([1,2]);n=R.choix([2,3]);}while(Math.abs(a*B+b)===Math.abs(b));const uB=a*B+b;
    return cvAff({a,b,B,s:"p"+n,fT:`(${affT(a,b)})^{${n}}`,g:u=>Math.pow(u,n),gT:`u^{${n}}`,GT:`u^{${n+1}}/${n+1}`,G:u=>Math.pow(u,n+1)/(n+1),I:VP([[Q(Math.pow(uB,n+1)-Math.pow(b,n+1),a*(n+1)),"1"]]),
      ev:`${coef(Q(1,a))} × (${par(uB)}^{${n+1}} − ${par(b)}^{${n+1}})/${n+1}`,whyG:`Une primitive de ${fx(`u^{${n}}`)} est ${fx(`u^{${n+1}}/${n+1}`)}.`});}
  if(g==="inv"){let a,b,B;do{a=R.ent(1,4);b=R.ent(1,3);B=R.ent(1,3);}while((a*B)%b);const uB=a*B+b,K=Q(1,a);
    return cvAff({a,b,B,s:"i",fT:`1/(${affT(a,b)})`,g:u=>1/u,gT:"1/u",GT:"ln u",G:Math.log,I:VP([lnK(K,uB,b)]),ev:entre(coef(K),`ln ${uB} − ln ${b}`),
      whyG:`Une primitive de ${fx("1/u")} est ${fx("ln u")}, pour ${fx("u &gt; 0")}. ${b===1?fx("ln 1 = 0"):fx("ln a − ln b = ln(a/b)")}.`});}
  if(g==="inv2"){const a=R.ent(1,3),b=R.ent(1,3),B=R.ent(1,3),uB=a*B+b,K=Q(1,a);
    return cvAff({a,b,B,s:"j",fT:`1/(${affT(a,b)})²`,g:u=>1/(u*u),gT:"1/u²",GT:"−1/u",G:u=>-1/u,I:VP([[mul(K,sub(Q(1,b),Q(1,uB))),"1"]]),ev:entre(coef(K),`−1/${uB} + ${inv1(b)}`),
      whyG:`Une primitive de ${fx("1/u²")} est ${fx("−1/u")} : on le vérifie en dérivant.`});}
  if(g==="rac"){const [a,b,B]=R.choix([[3,1,1],[3,1,5],[5,4,1],[2,1,4],[4,1,2],[8,1,1],[3,4,4],[2,4,6],[3,1,8],[5,1,3],[7,9,1],[8,1,3],[4,9,4],[12,4,1]]),uB=a*B+b,al=Math.round(Math.sqrt(b)),be=Math.round(Math.sqrt(uB));
    return cvAff({a,b,B,s:"r",fT:`√(${affT(a,b)})`,g:Math.sqrt,gT:"√u",GT:"(2/3)u√u",G:u=>2/3*u*Math.sqrt(u),I:VP([[mul(Q(2,3*a),be**3-al**3),"1"]]),ev:`${coef(Q(1,a))} × (2/3) × (${be**3} − ${al**3})`,
      whyG:`${fx("√u = u^{1/2}")}, dont une primitive est ${fx("(2/3)u^{3/2} = (2/3)u√u")}. En ${uB} : ${fx(`${uB}√${uB} = ${be**3}`)}${b>1?` ; en ${b} : ${fx(`${b}√${b} = ${al**3}`)}`:""}.`});}
  const a=R.choix([2,3,4]),b=R.ent(-2,1),B=a===2?R.choix([1,2]):1,uB=a*B+b,K=Q(1,a);
  return cvAff({a,b,B,s:"e",fT:`e^{${affT(a,b)}}`,g:Math.exp,gT:"e^{u}",GT:"e^{u}",G:Math.exp,I:VP([eK(K,uB),eK(mul(K,-1),b)]),ev:`${coef(K)}(${eT(uB)} − ${eT(b)})`,
    whyG:`Une primitive de ${fx("e^{u}")} est ${fx("e^{u}")}${b===0||uB===0?`, et ${fx("e^{0} = 1")}`:""}.`});}
/* paliers 2 et 3 : u = x² + c, x², eˣ, ln x, √x, sin x, cos x. v (0 ou 1) prend une moitié des cas : u donné et u à trouver n'ont pas les mêmes intégrales */
function cvPoly(R,v,fam){
  if(fam==="xq"){const [[c,B],k]=R.choix(croise([[1,1],[1,2],[1,3],[2,2],[4,2],[4,4],[9,3],[2,4]],[1,2,3,4,6],v)),uB=B*B+c,K=Q(k,2);
    return cvCas({sig:`q${c},${B},${k}`,nat:"u = x² + c",fT:`${k===1?"":k}x/(x² + ${c})`,f:x=>k*x/(x*x+c),A:bq(0),B:bq(B),uT:`x² + ${c}`,uF:x=>x*x+c,du:"du = 2x dx",donc:k===2?"":`${k===1?"":k}x dx = ${duK(K)}`,
      why0:`La dérivée de ${fx(`x² + ${c}`)} est 2x, et il y a justement un x au numérateur.`,K,gT:"1/u",GT:"ln u",G:Math.log,uA:bq(c),uB:bq(uB),uBc:`${B}² + ${c} = ${uB}`,I:VP([lnK(K,uB,c)]),ev:entre(coef(K),`ln ${uB} − ln ${c}`),
      whyG:`Une primitive de ${fx("1/u")} est ${fx("ln u")}, pour ${fx("u &gt; 0")}. ${c===1?fx("ln 1 = 0"):fx("ln a − ln b = ln(a/b)")}.`});}
  if(fam==="xp"){const [[c,n],k]=R.choix(croise([[1,2],[1,3],[2,2],[2,3]],[1,2,4,6],v)),K=Q(k,2),KT=coef(K),uB=1+c;
    return cvCas({sig:`p${c},${n},${k}`,nat:"u = x² + c",fT:`${k===1?"":k}x(x² + ${c})^{${n}}`,f:x=>k*x*Math.pow(x*x+c,n),A:bq(0),B:bq(1),uT:`x² + ${c}`,uF:x=>x*x+c,du:"du = 2x dx",donc:k===2?"":`${k===1?"":k}x dx = ${duK(K)}`,
      why0:`La dérivée de ${fx(`x² + ${c}`)} est 2x, et il y a un x en facteur. Développer la puissance serait bien plus long.`,K,gT:`u^{${n}}`,GT:`u^{${n+1}}/${n+1}`,G:u=>Math.pow(u,n+1)/(n+1),uA:bq(c),uB:bq(uB),uBc:`1² + ${c} = ${uB}`,
      I:VP([[mul(K,Q(Math.pow(uB,n+1)-Math.pow(c,n+1),n+1)),"1"]]),ev:`${KT?KT+" × ":""}(${uB}^{${n+1}} − ${c}^{${n+1}})/${n+1}`,whyG:`Une primitive de ${fx(`u^{${n}}`)} est ${fx(`u^{${n+1}}/${n+1}`)}.`});}
  if(fam==="xr"){const [[c,BT,B2,al,be],k]=R.choix(croise([[1,"√3",3,1,2],[4,"√5",5,2,3],[9,"4",16,3,5],[16,"3",9,4,5],[1,"2√2",8,1,3],[4,"2√3",12,2,4],[9,"√7",7,3,4]],[1,3],v)),K=Q(k,2);
    return cvCas({sig:`r${c},${B2},${k}`,nat:"u = x² + c",fT:`${k===1?"":k}x√(x² + ${c})`,f:x=>k*x*Math.sqrt(x*x+c),A:bq(0),B:bt(BT,Math.sqrt(B2)),uT:`x² + ${c}`,uF:x=>x*x+c,du:"du = 2x dx",donc:`${k===1?"":k}x dx = ${duK(K)}`,
      why0:`Ce qui gêne est sous la racine. Sa dérivée 2x est là, à un nombre près : il y a un x en facteur.`,K,gT:"√u",GT:"(2/3)u√u",G:u=>2/3*u*Math.sqrt(u),uA:bq(c),uB:bq(B2+c),uBc:`${B2} + ${c} = ${B2+c}`,
      I:VP([[mul(mul(K,Q(2,3)),be**3-al**3),"1"]]),ev:`${coef(K)} × (2/3) × (${be**3} − ${al**3})`,
      whyG:`${fx("√u = u^{1/2}")}, dont une primitive est ${fx("(2/3)u^{3/2} = (2/3)u√u")}. En ${B2+c} : ${fx(`${B2+c}√${B2+c} = ${be**3}`)}${c>1?` ; en ${c} : ${fx(`${c}√${c} = ${al**3}`)}`:""}.`});}
  const [[A,B],k]=R.choix(croise([[0,1],[0,2],[1,2]],[1,2,4,6],v)),K=Q(k,2),KT=coef(K);
  return cvCas({sig:`e${A},${B},${k}`,nat:"u = x²",fT:`${k===1?"":k}xe^{x²}`,f:x=>k*x*Math.exp(x*x),A:bq(A),B:bq(B),uT:"x²",uF:x=>x*x,du:"du = 2x dx",donc:k===2?"":`${k===1?"":k}x dx = ${duK(K)}`,
    why0:`${fx("x²")} est dans l'exposant, et sa dérivée 2x est là, à un nombre près : il y a un x en facteur.`,K,gT:"e^{u}",GT:"e^{u}",G:Math.exp,uA:bq(A*A),uB:bq(B*B),I:VP([eK(K,B*B),eK(mul(K,-1),A*A)]),
    ev:KT?`${KT}(${eT(B*B)} − ${eT(A*A)})`:"",whyG:`Une primitive de ${fx("e^{u}")} est ${fx("e^{u}")}${A===0?`, et ${fx("e^{0} = 1")}`:""}.`});}
function cvExp(R,v){const [[mA,mB],[c,car]]=R.choix(croise([[1,3],[1,5],[2,5],[2,3],[3,5],[1,2]],[[1,0],[2,0],[3,0],[1,1],[2,1]],v).filter(([m,p])=>!(m[1]===2&&p[0]===1&&p[1])));
  return cvCas({sig:`x${mA},${mB},${c},${car}`,nat:"u = eˣ",fT:`e^{x}/(${c} + e^{x})${car?"²":""}`,f:x=>Math.exp(x)/Math.pow(c+Math.exp(x),car?2:1),A:bL(mA),B:bL(mB),uT:"e^{x}",uF:Math.exp,du:"du = e^{x} dx",donc:"",
    why0:`${fx("e^{x}")} est au dénominateur, et sa dérivée ${fx("e^{x}")} est au numérateur : ${fx("e^{x} dx")} devient du.`,K:Q(1),gT:`1/(${c} + u)${car?"²":""}`,GT:car?`−1/(${c} + u)`:`ln(${c} + u)`,G:car?u=>-1/(c+u):u=>Math.log(c+u),
    uA:bq(mA),uB:bq(mB),uAc:mA===1?"e^{0} = 1":`e^{ln ${mA}} = ${mA}`,uBc:`e^{ln ${mB}} = ${mB}`,I:VP([car?[sub(Q(1,c+mA),Q(1,c+mB)),"1"]:lnK(1,c+mB,c+mA)]),ev:car?`−1/${c+mB} + 1/${c+mA}`:`ln ${c+mB} − ln ${c+mA}`,
    whyG:car?`Une primitive de ${fx(`1/(${c} + u)²`)} est ${fx(`−1/(${c} + u)`)} : on le vérifie en dérivant.`:`Une primitive de ${fx(`1/(${c} + u)`)} est ${fx(`ln(${c} + u)`)}. Puis ${fx("ln a − ln b = ln(a/b)")}.`});}
const lnV=m=>m===0?"ln 1 = 0":m===1?"ln e = 1":`ln(e^{${m}}) = ${m}`;
function cvLn(R,v){const L=[];
  [1,2,3].forEach(n=>[1,2,3].forEach(k=>[[0,1],[0,2],[1,2],[1,3]].forEach(([A,B])=>{if(k>1||B>1)L.push(["p",n,k,A,B]);})));
  [[0,1,2],[0,1,3],[0,2,3],[1,0,1],[1,0,2],[1,1,2],[1,0,3],[2,0,1],[2,0,2],[2,1,2]].forEach(t=>L.push(["i",0,...t]));
  [[0,1,2],[0,1,3],[1,0,1],[1,0,2],[1,0,3],[1,1,2]].forEach(t=>L.push(["j",0,...t]));
  const [s,n,p,A,B]=R.choix(L.filter((_,i)=>i%2===v)),k=s==="p"?p:1,c=s==="p"?0:p,K=Q(k),KT=coef(K);
  const o={sig:`l${s}${n},${p},${A},${B}`,nat:"u = ln x",A:bE(A),B:bE(B),uT:"ln x",uF:Math.log,du:"du = dx/x",donc:"",why0:`${fx("ln x")} est accompagné de ${fx("1/x")}, qui est justement sa dérivée : ${fx("dx/x")} devient du.`,K,uA:bq(A),uB:bq(B),uAc:lnV(A),uBc:lnV(B)};
  if(s==="p")return cvCas(Object.assign(o,{fT:`${k===1?"":k}(ln x)${n===1?"":`^{${n}}`}/x`,f:x=>k*Math.pow(Math.log(x),n)/x,gT:n===1?"u":`u^{${n}}`,GT:`u^{${n+1}}/${n+1}`,G:u=>Math.pow(u,n+1)/(n+1),
    I:VP([[Q(k*(Math.pow(B,n+1)-Math.pow(A,n+1)),n+1),"1"]]),ev:`${KT?KT+" × ":""}(${B}^{${n+1}} − ${A}^{${n+1}})/${n+1}`,whyG:`Une primitive de ${fx(n===1?"u":`u^{${n}}`)} est ${fx(`u^{${n+1}}/${n+1}`)}.`}));
  if(s==="i")return cvCas(Object.assign(o,{fT:c?`1/(x(${c} + ln x))`:"1/(x ln x)",f:x=>1/(x*(c+Math.log(x))),gT:c?`1/(${c} + u)`:"1/u",GT:c?`ln(${c} + u)`:"ln u",G:u=>Math.log(c+u),I:VP([lnK(1,c+B,c+A)]),ev:`ln ${c+B} − ln ${c+A}`,
    whyG:`Une primitive de ${fx(c?`1/(${c} + u)`:"1/u")} est ${fx(c?`ln(${c} + u)`:"ln u")}. ${c+A===1?fx("ln 1 = 0"):fx("ln a − ln b = ln(a/b)")}.`}));
  return cvCas(Object.assign(o,{fT:c?`1/(x(${c} + ln x)²)`:"1/(x(ln x)²)",f:x=>1/(x*Math.pow(c+Math.log(x),2)),gT:c?`1/(${c} + u)²`:"1/u²",GT:c?`−1/(${c} + u)`:"−1/u",G:u=>-1/(c+u),I:VP([[sub(Q(1,c+A),Q(1,c+B)),"1"]]),ev:`−1/${c+B} + ${inv1(c+A)}`,
    whyG:`Une primitive de ${fx(c?`1/(${c} + u)²`:"1/u²")} est ${fx(c?`−1/(${c} + u)`:"−1/u")} : on le vérifie en dérivant.`}));}
const SINQ={"0/1":Q(0),"1/6":Q(1,2),"1/2":Q(1),"1/1":Q(0),"3/2":Q(-1),"2/1":Q(0)},COSQ={"0/1":Q(1),"1/3":Q(1,2),"1/2":Q(0),"1/1":Q(-1),"3/2":Q(0),"2/1":Q(1)};
const piCarre=(n,d)=>bt((n===1?"":n*n)+"π²"+(d===1?"":"/"+d*d),Math.pow(n*Math.PI/d,2));
function cvRac(R,v){const L=[["l",1,9],["l",4,9],["l",1,16],["l",9,25],["l",4,16],["s",1,4],["s",1,9],["s",4,9],["s",1,16],["s",4,16],["e",1,4],["e",1,9],["e",4,9],
    ["c",[1,2],[1,1]],["c",[1,6],[1,2]],["c",[1,6],[1,1]],["c",[1,2],[3,2]],["n",[1,2],[1,1]],["n",[1,3],[1,2]],["n",[1,3],[1,1]],["n",[1,1],[2,1]]];
  const [s,a,b]=R.choix(L.filter((_,i)=>i%2===v)),tg=s==="c"||s==="n",al=tg?0:Math.round(Math.sqrt(a)),be=tg?0:Math.round(Math.sqrt(b)),K=Q(2);
  const o={sig:`s${s}${a},${b}`,nat:"u = √x",A:tg?piCarre(...a):bq(a),B:tg?piCarre(...b):bq(b),uT:"√x",uF:Math.sqrt,du:"du = dx/(2√x)",donc:"dx/√x = 2 du",K,
    why0:`${fx("√x")} revient, et ${fx("1/√x")} est là : c'est sa dérivée, à un facteur 2 près.`,uA:tg?bA(...a):bq(al),uB:tg?bA(...b):bq(be)};
  o.uAc=tg?`√(${o.A.T}) = ${o.uA.T}`:`√${a} = ${al}`;o.uBc=tg?`√(${o.B.T}) = ${o.uB.T}`:`√${b} = ${be}`;
  if(s==="l")return cvCas(Object.assign(o,{fT:"1/(√x(1 + √x))",f:x=>1/(Math.sqrt(x)*(1+Math.sqrt(x))),gT:"1/(1 + u)",GT:"ln(1 + u)",G:u=>Math.log(1+u),I:VP([lnK(2,1+be,1+al)]),ev:`2(ln ${1+be} − ln ${1+al})`,
    whyG:`Une primitive de ${fx("1/(1 + u)")} est ${fx("ln(1 + u)")}. Puis ${fx("ln a − ln b = ln(a/b)")}.`}));
  if(s==="s")return cvCas(Object.assign(o,{fT:"1/(√x(1 + √x)²)",f:x=>1/(Math.sqrt(x)*Math.pow(1+Math.sqrt(x),2)),gT:"1/(1 + u)²",GT:"−1/(1 + u)",G:u=>-1/(1+u),I:VP([[mul(2,sub(Q(1,1+al),Q(1,1+be))),"1"]]),ev:`2(−1/${1+be} + 1/${1+al})`,
    whyG:`Une primitive de ${fx("1/(1 + u)²")} est ${fx("−1/(1 + u)")} : on le vérifie en dérivant.`}));
  if(s==="e")return cvCas(Object.assign(o,{fT:"e^{√x}/√x",f:x=>Math.exp(Math.sqrt(x))/Math.sqrt(x),gT:"e^{u}",GT:"e^{u}",G:Math.exp,I:VP([eK(2,be),eK(-2,al)]),ev:`2(${eT(be)} − ${eT(al)})`,whyG:`Une primitive de ${fx("e^{u}")} est ${fx("e^{u}")}.`}));
  const ka=a.join("/"),kb=b.join("/");
  if(s==="c")return cvCas(Object.assign(o,{fT:"cos(√x)/√x",f:x=>Math.cos(Math.sqrt(x))/Math.sqrt(x),gT:"cos u",GT:"sin u",G:Math.sin,I:VP([[mul(2,sub(SINQ[kb],SINQ[ka])),"1"]]),ev:`2(${nb(SINQ[kb])} − ${par(SINQ[ka])})`,
    whyG:`Une primitive de ${fx("cos u")} est ${fx("sin u")}. ${fx(`sin(${o.uB.T}) = ${nb(SINQ[kb])}`)} et ${fx(`sin(${o.uA.T}) = ${nb(SINQ[ka])}`)}.`}));
  return cvCas(Object.assign(o,{fT:"sin(√x)/√x",f:x=>Math.sin(Math.sqrt(x))/Math.sqrt(x),gT:"sin u",GT:"−cos u",G:u=>-Math.cos(u),I:VP([[mul(2,sub(COSQ[ka],COSQ[kb])),"1"]]),ev:`2(${nb(mul(COSQ[kb],-1))} + ${par(COSQ[ka])})`,
    whyG:`Une primitive de ${fx("sin u")} est ${fx("−cos u")}. ${fx(`cos(${o.uB.T}) = ${nb(COSQ[kb])}`)} et ${fx(`cos(${o.uA.T}) = ${nb(COSQ[ka])}`)}.`}));}
function cvTrig(R,v){const L=[],P=[[[0,1],[1,2]],[[0,1],[1,6]],[[1,6],[1,2]]];
  [1,2,3].forEach(n=>P.forEach(p=>L.push(["s",n,p])));P.forEach(p=>{L.push(["l",0,p]);L.push(["q",0,p]);});L.push(["e",0,P[0]]);
  [2,3].forEach(n=>[[[0,1],[1,2]],[[0,1],[1,3]]].forEach(p=>L.push(["c",n,p])));L.push(["t",0,[[0,1],[1,3]]]);
  const [s,n,[a,b]]=R.choix(L.filter((_,i)=>i%2===v)),co=s==="c"||s==="t",T=co?COSQ:SINQ,uA=T[a.join("/")],uB=T[b.join("/")],nom=co?"cos":"sin",ang=x=>x.T==="0"?" 0":`(${x.T})`;
  const o={sig:`t${s}${n},${a},${b}`,nat:co?"u = cos x":"u = sin x",A:bA(...a),B:bA(...b),uT:nom+" x",uF:co?Math.cos:Math.sin,du:co?"du = −sin x dx":"du = cos x dx",donc:co?"sin x dx = −du":"",K:Q(co?-1:1),uA:bq(uA),uB:bq(uB),
    why0:co?`La dérivée de ${fx("cos x")} est ${fx("−sin x")} : ${fx("sin x")} est en facteur, au signe près.`:`La dérivée de ${fx("sin x")} est ${fx("cos x")}, qui est en facteur : ${fx("cos x dx")} devient du.`};
  o.uAc=`${nom}${ang(o.A)} = ${nb(uA)}`;o.uBc=`${nom}${ang(o.B)} = ${nb(uB)}`;
  const ordre=" La borne du bas reste celle qui correspond à la borne du bas de x, même si elle est la plus grande : on ne remet pas les bornes dans l'ordre.";
  if(s==="s"||s==="c"){const pA=div(pw(uA,n+1),n+1),pB=div(pw(uB,n+1),n+1);
    return cvCas(Object.assign(o,{fT:co?`sin x (cos x)^{${n}}`:n===1?"sin x cos x":`cos x (sin x)^{${n}}`,f:co?x=>Math.sin(x)*Math.pow(Math.cos(x),n):x=>Math.cos(x)*Math.pow(Math.sin(x),n),gT:n===1?"u":`u^{${n}}`,GT:`u^{${n+1}}/${n+1}`,G:u=>Math.pow(u,n+1)/(n+1),
      I:VP([[mul(o.K,sub(pB,pA)),"1"]]),ev:co?`−(${nb(pB)} − ${nb(pA)})`:`${nb(pB)} − ${nb(pA)}`,whyG:`Une primitive de ${fx(n===1?"u":`u^{${n}}`)} est ${fx(`u^{${n+1}}/${n+1}`)}.${co?ordre:""}`}));}
  if(s==="l"){const r=div(add(1,uB),add(1,uA));
    return cvCas(Object.assign(o,{fT:"(cos x)/(1 + sin x)",f:x=>Math.cos(x)/(1+Math.sin(x)),gT:"1/(1 + u)",GT:"ln(1 + u)",G:u=>Math.log(1+u),I:VP([lnK(1,r.n,r.d)]),ev:`${lnT(add(1,uB))} − ${lnT(add(1,uA))}`,
      whyG:`Une primitive de ${fx("1/(1 + u)")} est ${fx("ln(1 + u)")}. ${egal(uA,0)?fx("ln 1 = 0"):fx("ln a − ln b = ln(a/b)")}.`}));}
  if(s==="q")return cvCas(Object.assign(o,{fT:"(cos x)/(1 + sin x)²",f:x=>Math.cos(x)/Math.pow(1+Math.sin(x),2),gT:"1/(1 + u)²",GT:"−1/(1 + u)",G:u=>-1/(1+u),I:VP([[sub(div(1,add(1,uA)),div(1,add(1,uB))),"1"]]),
    ev:`−${nb(div(1,add(1,uB)))} + ${nb(div(1,add(1,uA)))}`,whyG:`Une primitive de ${fx("1/(1 + u)²")} est ${fx("−1/(1 + u)")} : on le vérifie en dérivant.`}));
  if(s==="e")return cvCas(Object.assign(o,{fT:"e^{sin x} cos x",f:x=>Math.exp(Math.sin(x))*Math.cos(x),gT:"e^{u}",GT:"e^{u}",G:Math.exp,I:VP([[1,"e",1],[-1,"1"]]),ev:"",whyG:`Une primitive de ${fx("e^{u}")} est ${fx("e^{u}")}, et ${fx("e^{0} = 1")}.`}));
  return cvCas(Object.assign(o,{fT:"(sin x)/(cos x)",f:Math.tan,gT:"1/u",GT:"ln u",G:Math.log,I:VP([lnK(-1,uB.n,uB.d)]),ev:`−(${lnT(uB)} − ln 1)`,whyG:`Une primitive de ${fx("1/u")} est ${fx("ln u")}. ${fx("ln 1 = 0")} et ${fx("ln(1/2) = −ln 2")}.${ordre}`}));}
function cvCarre(R,v){const L=[],SN=[0,1,0,-1,0],CS=[1,0,-1,0,1],XT=["0","√(π/2)","√π","√(3π/2)","√(2π)"];
  [["c",0,1,0],["c",0,2,0],["c",1,2,0],["c",1,4,1],["c",1,3,0],["s",0,1,0],["s",0,2,0],["s",1,2,0],["s",2,4,0],["s",2,4,1]].forEach(t=>[1,2,4].forEach(k=>{if(!(t[0]==="c"&&t[3]&&k===2))L.push(t.concat([k]));}));
  const [s,nA,nB,neg,k]=R.choix(L.filter((_,i)=>i%2===v)),K=Q(k,2),co=s==="c",vA=co?SN[nA]:CS[nA],vB=co?SN[nB]:CS[nB],nom=co?"sin":"cos";
  const o={sig:`c${s}${nA},${nB},${neg},${k}`,nat:"u = x²",fT:`${k===1?"":k}x ${co?"cos":"sin"}(x²)`,f:x=>k*x*(co?Math.cos(x*x):Math.sin(x*x)),A:nA===0?bq(0):bt((neg?"−":"")+XT[nA],(neg?-1:1)*Math.sqrt(nA*Math.PI/2)),B:bt(XT[nB],Math.sqrt(nB*Math.PI/2)),
    uT:"x²",uF:x=>x*x,du:"du = 2x dx",donc:k===2?"":`${k===1?"":k}x dx = ${duK(K)}`,why0:`${fx("x²")} est dans le ${co?"cosinus":"sinus"}, et sa dérivée 2x est en facteur, à un nombre près.`,K,uA:bA(nA,2),uB:bA(nB,2),
    gT:co?"cos u":"sin u",GT:co?"sin u":"−cos u",G:co?Math.sin:u=>-Math.cos(u),I:VP([[mul(K,co?vB-vA:vA-vB),"1"]]),ev:entre(coef(K),co?`${nb(vB)} − ${par(vA)}`:`${nb(-vB)} + ${par(vA)}`)};
  o.uA=nA===0?bq(0):nA===2?bA(1,1):nA===4?bA(2,1):bA(nA,2);o.uB=nB===2?bA(1,1):nB===4?bA(2,1):bA(nB,2);
  o.uAc=nA===0?"":`(${o.A.T})² = ${o.uA.T}`;o.uBc=`(${o.B.T})² = ${o.uB.T}`;
  o.whyG=`Une primitive de ${fx(o.gT)} est ${fx(o.GT)}. ${fx(`${nom}${nB===0?" 0":`(${o.uB.T})`} = ${nb(vB)}`)} et ${fx(`${nom}${nA===0?" 0":`(${o.uA.T})`} = ${nb(vA)}`)}.`;
  return cvCas(o);}
function cvForme(R,v){const fam=R.choix(["xq","xq","xp","xr","xe","ex","ex","ln","ln","ln","rx","rx","tr","tr","x2","x2"]);
  return fam==="ex"?cvExp(R,v):fam==="ln"?cvLn(R,v):fam==="rx"?cvRac(R,v):fam==="tr"?cvTrig(R,v):fam==="x2"?cvCarre(R,v):cvPoly(R,v,fam);}
/* palier 4 : la dérivée de u ne suffit plus, il faut écrire x (ou dx) avec u, comme au TD 1, exercice 5 (b), (d) et (g) */
function cvTout(R){const fam=R.choix(["xs","xs","xn","xn","xi","e2","e2","rr"]);
  if(fam==="xs"){const [c,A,B]=R.choix([[1,0,8],[1,3,8],[4,0,5],[4,-3,0],[4,-3,5],[1,3,15],[9,0,7],[9,-5,0],[9,-8,7],[1,0,15],[4,5,12]]),al=Math.round(Math.sqrt(A+c)),be=Math.round(Math.sqrt(B+c));
    const pA=Q(2*al**3,3),pB=Q(2*be**3,3),qA=2*c*al,qB=2*c*be;
    return cvCas({sig:`S${c},${A},${B}`,nat:"x/√(x + c)",fT:`x/√(${affT(1,c)})`,f:x=>x/Math.sqrt(x+c),A:bq(A),B:bq(B),uT:affT(1,c),uF:x=>x+c,du:"du = dx",et:`x = u − ${c}`,
      why0:`Ce qui gêne est sous la racine. Sa dérivée vaut 1 : rien ne remplace le x du numérateur, il faut l'écrire avec u.`,K:Q(1),gT:`(u − ${c})/√u`,GT:`(2/3)u√u − ${2*c}√u`,G:u=>2/3*u*Math.sqrt(u)-2*c*Math.sqrt(u),uA:bq(A+c),uB:bq(B+c),
      plus:[{w:`On sépare la fraction : ${fx(`(u − ${c})/√u = √u − ${c}/√u`)}.`,why:`${fx("u/√u = √u")} : diviser u par sa racine laisse une racine.`,pts:1}],
      I:VP([[sub(sub(pB,qB),sub(pA,qA)),"1"]]),ev:`(${nb(pB)} − ${qB}) − (${nb(pA)} − ${qA})`,whyG:`Une primitive de ${fx("√u")} est ${fx("(2/3)u√u")}, et une primitive de ${fx("1/√u")} est ${fx("2√u")}.`});}
  if(fam==="xn"){const [c,n,T]=R.choix([-2,-1,1,2].flatMap(c=>[3,4,5].map(n=>[c,n,1])).concat([[-1,3,2],[1,3,2]])),xu=S([[1,"u"],[-c,""]]);
    return cvCas({sig:`N${c},${n},${T}`,nat:"x(x + c)ⁿ",fT:`x(${affT(1,c)})^{${n}}`,f:x=>x*Math.pow(x+c,n),A:bq(-c),B:bq(T-c),uT:affT(1,c),uF:x=>x+c,du:"du = dx",et:`x = ${xu}`,
      why0:`Développer ${fx(`(${affT(1,c)})^{${n}}`)} serait long. Avec u, la puissance devient simple, et c'est x qui s'écrit ${fx(xu)}.`,K:Q(1),gT:`(${xu})u^{${n}}`,GT:S([[1,`u^{${n+2}}/${n+2}`],[-c,`u^{${n+1}}/${n+1}`]]),G:u=>Math.pow(u,n+2)/(n+2)-c*Math.pow(u,n+1)/(n+1),uA:bq(0),uB:bq(T),
      plus:[{w:`On développe : ${fx(`(${xu})u^{${n}} = ${S([[1,`u^{${n+1}}`],[-c,`u^{${n}}`]])}`)}.`,why:"Un produit de puissances de u : on ajoute les exposants.",pts:1}],
      I:VP([[add(Q(Math.pow(T,n+2),n+2),Q(-c*Math.pow(T,n+1),n+1)),"1"]]),ev:S([[Q(Math.pow(T,n+2),n+2),""],[Q(-c*Math.pow(T,n+1),n+1),""]]),whyG:"On prend une primitive de chaque terme. En u = 0, tout s'annule."});}
  if(fam==="xi"){const [c,m]=R.choix([[1,2],[1,3],[1,5],[2,2],[2,3],[2,4],[3,2],[3,3]]);
    return cvCas({sig:`I${c},${m}`,nat:"x/(x + c)²",fT:`x/(${affT(1,c)})²`,f:x=>x/Math.pow(x+c,2),A:bq(1-c),B:bq(m-c),uT:affT(1,c),uF:x=>x+c,du:"du = dx",et:`x = u − ${c}`,
      why0:`Le carré du dénominateur gêne. Avec u, il devient u², et c'est x qui s'écrit ${fx(`u − ${c}`)}.`,K:Q(1),gT:`(u − ${c})/u²`,GT:`ln u + ${c}/u`,G:u=>Math.log(u)+c/u,uA:bq(1),uB:bq(m),
      plus:[{w:`On sépare la fraction : ${fx(`(u − ${c})/u² = 1/u − ${c}/u²`)}.`,why:`${fx("u/u² = 1/u")}.`,pts:1}],
      I:VP([lnK(1,m,1),[sub(Q(c,m),c),"1"]]),ev:`(ln ${m} + ${nb(Q(c,m))}) − (ln 1 + ${c})`,whyG:`Une primitive de ${fx("1/u")} est ${fx("ln u")}, et une primitive de ${fx(`−${c}/u²`)} est ${fx(`${c}/u`)}. ${fx("ln 1 = 0")}.`});}
  if(fam==="e2"){const [mA,mB]=R.choix([[1,2],[1,3],[1,5],[2,5],[2,3],[3,5]]);
    return cvCas({sig:`E${mA},${mB}`,nat:"e²ˣ/(1 + eˣ)",fT:"e^{2x}/(1 + e^{x})",f:x=>Math.exp(2*x)/(1+Math.exp(x)),A:bL(mA),B:bL(mB),uT:"e^{x}",uF:Math.exp,du:"du = e^{x} dx = u dx",donc:"dx = du/u",
      why0:`${fx("e^{x}")} revient deux fois, car ${fx("e^{2x} = (e^{x})²")}. Sa dérivée n'est pas en facteur : on remplace dx par ${fx("du/u")}.`,K:Q(1),gT:"u/(1 + u)",GT:"u − ln(1 + u)",G:u=>u-Math.log(1+u),uA:bq(mA),uB:bq(mB),
      uAc:mA===1?"e^{0} = 1":`e^{ln ${mA}} = ${mA}`,uBc:`e^{ln ${mB}} = ${mB}`,whyN:`${fx("e^{2x} = u²")} et ${fx("dx = du/u")} : ${fx("u²/(1 + u) × 1/u = u/(1 + u)")}.`,
      plus:[{w:`${fx("u/(1 + u) = 1 − 1/(1 + u)")}.`,why:`On écrit le numérateur ${fx("u = (1 + u) − 1")}, puis on sépare la fraction.`,pts:1}],
      I:VP([[mB-mA,"1"],lnK(-1,1+mB,1+mA)]),ev:`(${mB} − ln ${1+mB}) − (${mA} − ln ${1+mA})`,whyG:`Une primitive de 1 est u, et une primitive de ${fx("1/(1 + u)")} est ${fx("ln(1 + u)")}. Puis ${fx("ln a − ln b = ln(a/b)")}.`});}
  const [s,a,b]=R.choix([["e",1,2],["e",1,3],["e",2,3],["e",0,1],["e",0,2],["s","h","p"],["s","0","p"],["s","0","h"],["s","p","d"],["c","h","p"],["c","0","p"],["c","0","h"]]),K=Q(2);
  const base={nat:"puis par parties",uT:"√x",uF:Math.sqrt,du:"du = dx/(2√x)",donc:"dx = 2√x du = 2u du",K,whyN:`${fx("dx = 2u du")} : le 2 passe devant l'intégrale, et il reste un u en facteur.`,
    whyG:"On calcule la primitive en la borne du haut, puis en la borne du bas, et on retranche."};
  if(s==="e"){const t=u=>u===1?"0":u===0?"(−1)":(u===2?"":u-1)+eT(u);
    return cvCas(Object.assign(base,{sig:`R${s}${a},${b}`,fT:"e^{√x}",f:x=>Math.exp(Math.sqrt(x)),A:bq(a*a),B:bq(b*b),uA:bq(a),uB:bq(b),uAc:`√${a*a} = ${a}`,uBc:`√${b*b} = ${b}`,gT:"ue^{u}",GT:"(u − 1)e^{u}",G:u=>(u-1)*Math.exp(u),
      why0:`${fx("√x")} est dans l'exposant, et rien ne ressemble à sa dérivée : on écrit dx avec u.`,
      plus:[{w:`Une intégration par parties : une primitive de ${fx("ue^{u}")} est ${fx("ue^{u} − e^{u} = (u − 1)e^{u}")}.`,why:`On dérive u et on primitive ${fx("e^{u}")} : ${fx("∫ ue^{u} du = ue^{u} − ∫ e^{u} du")}.`,pts:2}],
      I:VP([eK(2*(b-1),b),eK(-2*(a-1),a)]),ev:`2(${t(b)} − ${t(a)})`}));}
  const co=s==="c",AX={"0":[bq(0),bq(0)],h:[piCarre(1,2),bA(1,2)],p:[piCarre(1,1),bA(1,1)],d:[piCarre(2,1),bA(2,1)]},
    TV=co?{"0":[[[1,"1"]],"1"],h:[[[Q(1,2),"pi"]],"π/2"],p:[[[-1,"1"]],"−1"],d:[[[1,"1"]],"1"]}:{"0":[[],"0"],h:[[[1,"1"]],"1"],p:[[[1,"pi"]],"π"],d:[[[-2,"pi"]],"−2π"]};
  return cvCas(Object.assign(base,{sig:`R${s}${a},${b}`,fT:co?"cos(√x)":"sin(√x)",f:x=>co?Math.cos(Math.sqrt(x)):Math.sin(Math.sqrt(x)),A:AX[a][0],B:AX[b][0],uA:AX[a][1],uB:AX[b][1],uAc:a==="0"?"":`√(${AX[a][0].T}) = ${AX[a][1].T}`,uBc:`√(${AX[b][0].T}) = ${AX[b][1].T}`,
    gT:co?"u cos u":"u sin u",GT:co?"u sin u + cos u":"sin u − u cos u",G:co?u=>u*Math.sin(u)+Math.cos(u):u=>Math.sin(u)-u*Math.cos(u),why0:`${fx("√x")} est dans le ${co?"cosinus":"sinus"}, et rien ne ressemble à sa dérivée : on écrit dx avec u.`,
    plus:[{w:`Une intégration par parties : une primitive de ${fx(co?"u cos u":"u sin u")} est ${fx(co?"u sin u + cos u":"sin u − u cos u")}.`,why:co?`On dérive u et on primitive ${fx("cos u")} : ${fx("∫ u cos u du = u sin u − ∫ sin u du")}.`:`On dérive u et on primitive ${fx("sin u")} : ${fx("∫ u sin u du = −u cos u + ∫ cos u du")}.`,pts:2}],
    I:VP(TV[b][0].map(([c,k])=>[mul(c,2),k]).concat(TV[a][0].map(([c,k])=>[mul(c,-2),k]))),ev:`2(${TV[b][1]} − ${TV[a][1][0]==="−"?"("+TV[a][1]+")":TV[a][1]})`}));}
function cvEtapes(o){
  return [{w:`On pose ${fx(`u = ${o.uT}`)}. Alors ${fx(o.du)}${o.donc?`, donc ${fx(o.donc)}`:o.et?`, et ${fx(o.et)}`:""}.`,why:o.why0,pts:1},
    {w:`Les bornes : lorsque ${fx(`x = ${o.A.T}`)}, ${fx(`u = ${o.uAc||o.uA.T}`)} ; lorsque ${fx(`x = ${o.B.T}`)}, ${fx(`u = ${o.uBc||o.uB.T}`)}.`,why:"Les bornes de départ sont des valeurs de x. La nouvelle intégrale est écrite avec u : il lui faut des valeurs de u.",pts:1},
    {w:`L'intégrale devient ${fx(`I = ${o.newT}`)}.`,why:o.whyN||"On a remplacé la fonction, dx et les deux bornes : il ne reste plus aucun x.",pts:1}].concat(o.plus||[],
    [{w:`${fx(`I = ${o.crT}${o.ev&&o.ev!==o.I.T?" = "+o.ev:""} = ${o.I.T}`)}.`,why:o.whyG,pts:1}]);}
/* mode 1 : u, du et la nouvelle intégrale donnés ; 2 et 4 : u donné ; 3 : u à trouver, seule la valeur est demandée */
function exoCv(o,mode){const E=cvEtapes(o),dern=E.length-1,bornes=mode!==3,Kv=o.K.n/o.K.d;
  const dAnc={etape:1,type:"anciennes bornes gardées",titre:"Où ça part : les bornes.",msg:`Les bornes de départ valent pour x. Avec u, elles deviennent ${fx(o.uA.T)} et ${fx(o.uB.T)}.`};
  const pieges=[[Kv*(o.G(o.B.v)-o.G(o.A.v)),dAnc],
    [o.I.v/Kv,{etape:0,type:"nombre oublié en passant de dx à du",titre:"Où ça part : de dx à du.",msg:`${fx(o.du)}${o.donc?`, donc ${fx(o.donc)}`:""} : il reste le facteur ${fx(nb(o.K))} devant l'intégrale.`}],
    [-o.I.v,{etape:dern,type:"signe",titre:"Où ça part : le signe.",msg:`On calcule la primitive en la borne du haut, puis on retranche sa valeur en la borne du bas : ${fx(`I = ${o.I.T}`)}.`}]].filter(p=>Number.isFinite(p[0])&&!pres(p[0],o.I.v));
  const lire=t=>{const A=lisReel(t);return A.vide?{vide:1}:A.avecI||A.illisible||A.neg?{bad:1}:A;},proche=(A,v)=>A.dec&&!pres(A.v,v)&&Math.abs(A.v-v)<0.02;
  function juge(rep){const Iv=lire(rep.I),F=[];let d=null;
    if(bornes){const a=lire(rep.bas),b=lire(rep.haut);if(a.vide||b.vide||Iv.vide)return {incomplet:"Remplis les trois cases."};
      if(a.bad||b.bad||Iv.bad)return {incomplet:"Je n'arrive pas à lire une des cases. Écris par exemple 5, 1/2, pi/2, ln(2) ou e^(2) - 1."};
      if(proche(a,o.uA.v)||proche(b,o.uB.v))return {incomplet:"Écris les bornes exactes (avec π ou une fraction), pas des valeurs approchées."};
      const okA=pres(a.v,o.uA.v),okB=pres(b.v,o.uB.v);if(!okA)F.push("bas");if(!okB)F.push("haut");
      if(F.length)d=pres(a.v,o.A.v)&&pres(b.v,o.B.v)?dAnc
        :pres(a.v,o.uB.v)&&pres(b.v,o.uA.v)?{etape:1,type:"bornes échangées",titre:"Où ça part : l'ordre des bornes.",msg:`La borne du bas est la valeur de u pour ${fx(`x = ${o.A.T}`)} : ${fx(o.uA.T)}. Celle du haut est la valeur de u pour ${fx(`x = ${o.B.T}`)} : ${fx(o.uB.T)}.`}
        :{etape:1,type:"calcul des nouvelles bornes",titre:"Où ça part : les bornes.",msg:`On remplace x par chaque borne dans ${fx(`u = ${o.uT}`)} : on trouve ${fx(o.uA.T)} puis ${fx(o.uB.T)}.`};}
    else{if(Iv.vide)return {incomplet:"Écris la valeur de l'intégrale."};if(Iv.bad)return {incomplet:"Je n'arrive pas à lire ce nombre. Écris par exemple 7/3, ln(2) - 1/2 ou e^(2) - 1."};}
    if(proche(Iv,o.I.v))return {incomplet:"Écris la valeur exacte (avec ln, e, π ou une fraction), pas une valeur approchée."};
    if(!pres(Iv.v,o.I.v))F.push("I");if(!F.length)return {ok:true};
    if(!d){const pg=pieges.find(p=>pres(Iv.v,p[0]));d=pg?pg[1]:{etape:dern,type:"calcul de la nouvelle intégrale",titre:"Où ça part : le calcul avec u.",msg:`${fx(`I = ${o.newT}`)}, et on trouve ${fx(`I = ${o.I.T}`)}.`};}
    return {ok:false,faux:F,resume:bornes?`Pas tout à fait : ${F.length} case${F.length>1?"s sont":" est"} à revoir.`:"Pas tout à fait : ce n'est pas la bonne valeur.",diag:d};}
  const loin=pieges.find(p=>Math.abs(p[0]-o.I.v)>0.05),I0=fx(`I = ${o.It}`),lignes=`<p>Lorsque ${fx(`x = ${o.A.T}`)}, ${fx("u =")} ${O.trou("bas")} ; lorsque ${fx(`x = ${o.B.T}`)}, ${fx("u =")} ${O.trou("haut")}.</p>`;
  const corps=mode===1?`<p>Alors ${fx(o.du)}${o.donc?`, donc ${fx(o.donc)}`:""}.</p>${lignes}<p>L'intégrale devient ${fx(`I = ${o.KT}∫ ${o.gT} du`)} entre ces deux bornes. On trouve ${fx("I =")} ${O.trou("I",1)}.</p>`:bornes?`${lignes}<p>Après le calcul avec u : ${fx("I =")} ${O.trou("I",1)}.</p>`:"";
  return {sig:mode+o.sig,q:bornes?`Calcule ${I0} avec le changement de variable ${fx(`u = ${o.uT}`)}${mode===1?", en complétant":""}.`:`Calcule ${I0} par un changement de variable : à toi de trouver lequel.`,qNeutre:bornes?undefined:`Calcule ${I0}.`,corps,
    corpsPapier:bornes?`<p>Sur ta feuille, rédige le calcul en entier : « On pose u = … Alors du = … », les nouvelles bornes, la nouvelle intégrale écrite avec u, puis le résultat.</p>`:undefined,texte:`changement de variable : ${o.It}`,
    champs:bornes?[{k:"trous",ids:["bas","haut","I"]},{k:"sym",id:"s",sym:["π","√","ln(","e^(","/"],aide:"Pour π/2, écris pi/2 ; pour e², écris e^(2). Les boutons écrivent dans la case où tu es."}]
      :[{k:"champ",id:"I",nom:"valeur",label:"$I =$",ex:"une valeur exacte, par exemple ln(2) - 1/2",sym:["ln(","e","e^(","π","√","/"]}],
    indice:mode===1?false:undefined,juge,etapes:E,bonne:bornes?`${fx(`u = ${o.uA.T}`)} puis ${fx(`u = ${o.uB.T}`)}, et ${fx(`I = ${o.I.T}`)}`:fx(`I = ${o.I.T}`),bonneTxt:(bornes?`bornes ${o.uA.T} et ${o.uB.T}, `:"")+`I = ${o.I.T}`,
    repBonne:bornes?{bas:o.uA.tp,haut:o.uB.tp,I:o.I.tp}:{I:o.I.tp},repFausse:bornes?{bas:o.uA.tp,haut:o.uB.tp,I:`(${o.I.tp})+1`}:{I:loin?String(loin[0]):`(${o.I.tp})+1`},nature:o.nat,ens:{type:"cv",A:o.A.v,B:o.B.v,f:o.f,u:o.uF}};}
/* ---------- CA13 : équations différentielles d'ordre 1, y′ + a(x)y = b(x) ----------
   Les solutions sont yₚ + C e^{−A(x)}, et e^{−A(x)} ne s'annule jamais. Une réponse tapée est donc jugée par le calcul :
   (y − yₚ)/e^{−A} doit être le même nombre aux six points XD. Pour « toutes les solutions », ce nombre doit suivre la constante tapée,
   et la suivre comme une fonction affine (C², e^C ou 1/C ne donnent pas toutes les solutions). */
const XD=[0.3,0.6,0.9,1.2,1.5,1.8];
const d1F=tp=>{const A=lis(tp,["x"]);return x=>val(A,{x})[0];},d1V=tp=>XD.map(d1F(tp));
const d1Pw=n=>n===0?"":n===1?"x":"x"+"⁰¹²³⁴⁵⁶"[n];
const d1Mon=(K,xN)=>{K=q(K);const A=absQ(K);return (K.n<0?"−":"")+(A.n===1?"":A.n)+xN+(A.d===1?"":"/"+A.d);};
const d1Plus=(a,b)=>!a?b:b[0]==="−"?a+" − "+b.slice(1):a+" + "+b;
const d1Par=t=>/ /.test(t)?"("+t+")":t;
const d1Val=(A,env)=>{try{const V=XD.map(x=>val(A,Object.assign({x},env)));return V.some(v=>!Number.isFinite(v[0])||!(Math.abs(v[1])<=1e-9*Math.max(1,Math.abs(v[0]))))?null:V.map(v=>v[0]);}catch(e){return null;}};
/* le nombre k tel que V = ref + k × den aux six points, ou null */
const d1Rap=(V,ref,den)=>{const r=V.map((v,i)=>(v-ref[i])/den[i]);return r.every(x=>Math.abs(x-r[0])<=1e-7*Math.max(1,Math.abs(r[0])))?r[0]:null;};
/* la partie sans second membre : a constant, puis les a(x) du TD 2 (exercice 1) */
function d1Cst(a){a=q(a);const m=mul(a,-1);
  return {fam:"cst",k:a,dom:"ℝ",x0:0,lhs:S([[1,"y′"],[a,"y"]]),aT:nb(a),aTp:`(${brut(a)})`,AT:rx(a),ATp:`(${brut(a)})*x`,y0T:ex(m),y0Tp:exT(m),eAT:ex(a),mulT:c=>nb(c),
    whyA:`Une primitive de la constante ${nb(a)} est ${fx(rx(a))}.`};}
function d1Var(R,fam,P){
  if(fam==="pow"){const n=P&&P.n||R.choix([1,1,2,2,3]),k=P&&P.k||R.nz(-6,6),K=Q(k,n+1),xn=d1Pw(n),xN=d1Pw(n+1);
    return {fam,k,dom:"ℝ",x0:0,lhs:S([[1,"y′"],[k,xn+"y"]]),aT:S([[k,xn]]),aTp:`(${k})*x^${n}`,AT:d1Mon(K,xN),ATp:`(${brut(K)})*x^${n+1}`,
      y0T:`e^{${d1Mon(mul(K,-1),xN)}}`,y0Tp:`e^((${brut(mul(K,-1))})*x^${n+1})`,eAT:`e^{${d1Mon(K,xN)}}`,mulT:c=>S([[c,xn]]),der:n>1?`e^((${-k*n})*x^${n-1})`:null,
      whyA:`Une primitive de ${fx(xn)} est ${fx(xN+"/"+(n+1))}${k===1?"":`, qu'on multiplie par ${nb(k)}`}.`};}
  if(fam==="expx"){const k=R.choix([1,1,-1,2,-2,3]);
    return {fam,k,dom:"ℝ",x0:0,e0:k,expT:[[-k,"eˣ"]],lhs:S([[1,"y′"],[k,"eˣy"]]),aT:S([[k,"eˣ"]]),aTp:`(${k})*e^x`,AT:S([[k,"eˣ"]]),ATp:`(${k})*e^x`,
      y0T:`e^{${S([[-k,"eˣ"]])}}`,y0Tp:`e^((${-k})*e^x)`,eAT:`e^{${S([[k,"eˣ"]])}}`,mulT:c=>S([[c,"eˣ"]]),whyA:`${fx("eˣ")} est sa propre primitive.`};}
  if(fam==="invx"){const k=P&&P.k||R.nz(-3,3),K=Math.abs(k),pos=k>0,pw=d1Pw(K);
    return {fam,k,dom:"]0, +∞[",x0:1,lhs:`y′ ${pos?"+":"−"} ${K===1?"":K}y/x`,aT:`${pos?"":"−"}${K}/x`,aTp:`(${k})/x`,AT:S([[k,"ln x"]]),ATp:`(${k})*ln(x)`,
      y0T:pos?"1/"+pw:pw,den:pos?pw:null,y0Tp:`x^(${-k})`,eAT:pos?pw:"1/"+pw,mulT:c=>`${nb(c)}/x`,
      whyA:`Sur ]0, +∞[, une primitive de ${fx("1/x")} est ${fx("ln x")}.`,why0:` Et ${fx(`e^{${S([[-k,"ln x"]])}} = ${pos?"1/"+pw:pw}`)}, car ${fx("e^{n ln x} = xⁿ")}.`};}
  if(fam==="rat"){const k=R.choix([2,-2,1,-1]),K=Math.abs(k),pos=k>0,D=K===2?"(1 + x²)":"√(1 + x²)",nu=K===2?"1 + x²":D;
    return {fam,k,dom:"ℝ",x0:0,lhs:`y′ ${pos?"+":"−"} ${K===1?"":K}xy/(1 + x²)`,aT:`${pos?"":"−"}${K===1?"":K}x/(1 + x²)`,aTp:`(${k})*x/(1+x^2)`,
      AT:`${pos?"":"−"}${K===2?"":"(1/2)"}ln(1 + x²)`,ATp:`(${k}/2)*ln(1+x^2)`,y0T:pos?"1/"+D:nu,den:pos?D:null,y0F:pos?null:D,y0Tp:`(1+x^2)^(${-k}/2)`,eAT:pos?nu:"1/"+D,
      whyA:`${fx("2x/(1 + x²)")} est de la forme ${fx("u′/u")} avec ${fx("u = 1 + x²")} : une primitive est ${fx("ln(1 + x²)")}${K===2?"":". Ici il n'y a pas le 2 : on multiplie par 1/2"}.`,
      why0:` Et ${fx("e^{n ln u} = uⁿ")} : ${fx(`e^{−A(x)} = ${pos?"1/"+D:nu}`)}${K===1?" (la puissance 1/2 est la racine carrée)":""}.`};}
  if(fam==="trig"){const k=R.choix([1,-1,2,-2,3]),cosi=P&&P.cosi!==undefined?P.cosi:R()<0.5,f=cosi?"cos x":"sin x",F=cosi?"sin x":"cos x",kA=cosi?k:-k,tf=cosi?"cos(x)":"sin(x)",tF=cosi?"sin(x)":"cos(x)";
    return {fam,k,dom:"ℝ",x0:0,e0:cosi?0:-k,expT:[[-kA,F]],lhs:S([[1,"y′"],[k,"y "+f]]),aT:S([[k,f]]),aTp:`(${k})*${tf}`,AT:S([[kA,F]]),ATp:`(${kA})*${tF}`,
      y0T:`e^{${S([[-kA,F]])}}`,y0Tp:`e^((${-kA})*${tF})`,eAT:`e^{${S([[kA,F]])}}`,mulT:c=>S([[c,f]]),
      whyA:cosi?`Une primitive de ${fx("cos x")} est ${fx("sin x")}.`:`Une primitive de ${fx("sin x")} est ${fx("−cos x")} : attention au signe.`};}
  const p=R.choix([1,-1]),c=R.nz(-3,3);
  return {fam:"aff",dom:"ℝ",x0:0,lhs:`y′ + (${affT(2*p,c)})y`,aT:affT(2*p,c),aTp:`(${2*p}*x+(${c}))`,AT:S([[p,"x²"],[c,"x"]]),ATp:`(${p})*x^2+(${c})*x`,
    y0T:`e^{${S([[-p,"x²"],[-c,"x"]])}}`,y0Tp:`e^((${-p})*x^2+(${-c})*x)`,eAT:`e^{${S([[p,"x²"],[c,"x"]])}}`,
    whyA:`Une primitive de ${fx("x")} est ${fx("x²/2")}, et une primitive d'une constante k est kx.`};}
/* un second membre : solution particulière évidente (cc, ax, poly) ou variation de la constante (res, exp, pol, invx, gauss) */
function d1Sm(R,kind,ci){let o;
  if(kind==="cc"){const a=R.nz(-5,5),m=R.nz(-5,5);o=d1Cst(a);
    Object.assign(o,{bT:nb(a*m),bTp:`(${a*m})`,ypT:nb(m),ypTp:`(${m})`,ypx0:Q(m),ind:"cherche une solution particulière constante.",
      whyP:`On essaie une fonction constante : sa dérivée est 0, donc il faut ${fx(`${nb(a)} × yₚ = ${nb(a*m)}`)}, c'est-à-dire ${fx(`yₚ = ${nb(m)}`)}.`});}
  else if(kind==="ax"){const m=R.nz(-4,4),f=R.choix(ci?["pow","pow","trig","invx"]:["pow","pow","trig","expx","invx"]);
    o=d1Var(R,f,{n:R.choix([1,1,2]),k:f==="pow"?R.nz(-3,3):0,cosi:ci?true:undefined});const bT=o.mulT(m*o.k);
    Object.assign(o,{bT,bTp:`(${m})*(${o.aTp})`,ypT:nb(m),ypTp:`(${m})`,ypx0:Q(m),ind:"cherche une solution particulière constante.",
      whyP:`On essaie une fonction constante k : sa dérivée est 0, donc il faut ${fx(`k × ${vP(o.aT)} = ${bT}`)} pour tout x. ${fx(`k = ${nb(m)}`)} convient.`});}
  else if(kind==="poly"){const a=R.nz(-4,4),p=R.nz(-3,3),c=R.ent(-3,3),b0=p+a*c;o=d1Cst(a);
    Object.assign(o,{bT:affT(a*p,b0),bTp:`(${a*p})*x+(${b0})`,ypT:affT(p,c),ypTp:`(${p})*x+(${c})`,ypx0:Q(c),ind:`cherche une solution particulière de la forme ${fx("y = αx + β")}.`,
      whyP:`Le second membre est un polynôme de degré 1 et a est une constante : on cherche ${fx("yₚ(x) = αx + β")}. Alors ${fx("yₚ′(x) = α")}, et ${fx(`yₚ′ ${a<0?"−":"+"} ${coefK(Math.abs(a))}yₚ = ${S([[a,"αx"],[1,"α"],[a,"β"]])}`)}. On identifie avec ${fx(affT(a*p,b0))} : ${fx(`${coefK(a)}α = ${nb(a*p)}`)} et ${fx(`${S([[1,"α"],[a,"β"]])} = ${nb(b0)}`)}, donc ${fx(`α = ${nb(p)}`)} et ${fx(`β = ${nb(c)}`)}.`});}
  else if(kind==="exp"){let a,m;do{a=R.nz(-4,4);m=R.nz(-3,3);}while(a+m===0);const s=a+m,t=R.nz(-3,3),k=s*t;o=d1Cst(a);
    Object.assign(o,{bT:S([[k,ex(m)]]),bTp:`(${k})*${exT(m)}`,beT:S([[k,ex(s)]]),beTp:`(${k})*${exT(s)}`,cT:S([[t,ex(s)]]),cTp:`(${t})*${exT(s)}`,ypT:S([[t,ex(m)]]),ypTp:`(${t})*${exT(m)}`,ypx0:Q(t),
      whyBe:`${fx(`${ex(m)} × ${ex(a)} = ${ex(s)}`)} : les exposants s'ajoutent.`,
      whyC:s===1?`${fx("eˣ")} est sa propre primitive.`:`Une primitive de ${fx("e^{kx}")} est ${fx("e^{kx}/k")}, ici avec ${fx(`k = ${nb(s)}`)} : ${fx(`${nb(k)}/${vP(nb(s))} = ${nb(t)}`)}.`});}
  else if(kind==="invx"){const [k,n,L]=R.choix([[1,1,[3,-3,6]],[2,1,[4,-4,8]],[-1,1,[1,2,-2,3,-3,4]],[-1,2,[2,-2,4,6]],[-2,1,[1,2,-1,3]],[-1,0,[1,2,-2,3]],[1,0,[2,-2,4,6]],[2,0,[3,-3,6]],[-3,2,[1,2,-1]]]),p=R.choix(L),e=n+k,ln=e===-1,c=ln?Q(p):Q(p,e+1);
    o=d1Var(R,"invx",{k});
    Object.assign(o,{bT:n?S([[p,d1Pw(n)]]):nb(p),bTp:`(${p})*x^${n}`,beT:ln?`${nb(p)}/x`:e?S([[p,d1Pw(e)]]):nb(p),beTp:`(${p})*x^(${e})`,
      cT:ln?S([[p,"ln x"]]):S([[c,d1Pw(e+1)]]),cTp:ln?`(${p})*ln(x)`:`(${brut(c)})*x^${e+1}`,ypT:ln?S([[p,d1Pw(-k)+" ln x"]]):S([[c,d1Pw(n+1)]]),ypTp:ln?`(${p})*x^(${-k})*ln(x)`:`(${brut(c)})*x^${n+1}`,ypx0:ln?Q(0):c,
      whyBe:`Ici ${fx(`e^{A(x)} = ${o.eAT}`)}.`,
      whyC:ln?`Sur ]0, +∞[, une primitive de ${fx("1/x")} est ${fx("ln x")}.`:e?`Une primitive de ${fx(d1Pw(e))} est ${fx(d1Pw(e+1)+"/"+(e+1))}.`:`Une primitive de la constante ${nb(p)} est ${fx(S([[p,"x"]]))}.`});}
  else{
    if(kind==="gauss"){const s=R.choix([1,-1]),t=R.nz(-3,3);o=d1Var(R,"pow",{n:1,k:2*s});
      Object.assign(o,{bT:S([[2*t,"x"]])+o.y0T,bTp:`(${2*t})*x*${o.y0Tp}`,beT:S([[2*t,"x"]]),beTp:`(${2*t})*x`,cT:S([[t,"x²"]]),cTp:`(${t})*x^2`,facT:[[t,"x²"]],whyC:`Une primitive de ${fx("x")} est ${fx("x²/2")}.`});}
    else if(kind==="res"){const k=R.nz(-5,5);o=d1Cst(R.nz(-4,4));
      Object.assign(o,{bT:S([[k,o.y0T]]),bTp:`(${k})*${o.y0Tp}`,beT:nb(k),beTp:`(${k})`,cT:S([[k,"x"]]),cTp:`(${k})*x`,facT:[[k,"x"]],whyC:`Une primitive de la constante ${nb(k)} est ${fx(S([[k,"x"]]))}.`});}
    else{const p=R.nz(-3,3),c=R.ent(-4,4);o=d1Cst(R.nz(-4,4));
      Object.assign(o,{bT:affP(2*p,c)+o.y0T,bTp:`(${2*p}*x+(${c}))*${o.y0Tp}`,beT:affT(2*p,c),beTp:`${2*p}*x+(${c})`,cT:S([[p,"x²"],[c,"x"]]),cTp:`(${p})*x^2+(${c})*x`,facT:[[p,"x²"],[c,"x"]],
        whyC:`Une primitive de ${fx("x")} est ${fx("x²/2")}${c?", et une primitive d'une constante k est kx":""}.`});}
    Object.assign(o,{ypT:d1Par(o.cT)+o.y0T,ypTp:`(${o.cTp})*${o.y0Tp}`,ypx0:Q(0),whyBe:`${fx(`${o.y0T} × ${o.eAT} = 1`)} : les exposants s'ajoutent et donnent 0.`});}
  o.kind=kind;return o;}
/* les valeurs aux points XD, les textes de la solution générale, et les erreurs types sur la partie sans second membre */
function d1Num(o){const z=XD.map(()=>0);o.N={y0:d1V(o.y0Tp),yp:o.ypTp?d1V(o.ypTp):z,zero:z};o.N.eA=o.N.y0.map(v=>1/v);
  o.cy=c=>o.den?`${c}/${o.den}`:c+(o.y0F||o.y0T);
  o.cyQ=c=>{c=q(c);const A=absQ(c),s=c.n<0?"−":"";return o.den?(A.d===1?`${s}${A.n}/${o.den}`:`${s}${A.n}/(${A.d}${o.den})`):S([[c,o.y0F||o.y0T]]);};
  o.genT=o.facT?`(${S(o.facT)} + C)${o.y0T}`:d1Plus(o.ypT,o.cy("C"));o.genTp=`(${o.ypTp||"0"})+C*(${o.y0Tp})`;
  if(o.cT)o.beW=`${o.bT} × ${/\//.test(o.eAT)?"("+o.eAT+")":o.eAT}`;
  const cyC=fx(`y = ${o.cy("C")}`);
  o.tw=[[o.N.eA,"signe de l'exposant",`Le signe est inversé : les solutions de ${fx(o.lhs+" = 0")} sont les fonctions ${fx("C e^{−A(x)}")}, avec un moins devant ${fx(`A(x) = ${o.AT}`)}. On trouve ${cyC}.`,"so"]];
  if(o.fam!=="cst"&&o.fam!=="expx")o.tw.push([d1V(`e^(-(${o.aTp}))`),"a(x) au lieu d'une primitive",`Dans l'exposant, il faut une primitive de a, pas a lui-même : ${fx(`A(x) = ${o.AT}`)}, donc ${cyC}.`,"pr"]);
  if(o.der)o.tw.push([d1V(o.der),"dérivée au lieu d'une primitive",`Tu as dérivé a au lieu d'en chercher une primitive : ${fx(`A(x) = ${o.AT}`)}, donc ${cyC}.`,"pr"]);
  if(o.nd)o.tw.push([d1V(`e^(-(${o.nd[1]})*x)`),"y′ n'est pas seul",`Divise d'abord par ${o.nd[0]} : ${fx(o.lhs+" = 0")}, donc ${fx(`a(x) = ${o.aT}`)} et ${cyC}.`,"la"]);
  o.twP=o.cTp?[[d1V(o.cTp),"c(x) pris pour la solution particulière",`c(x) n'est pas encore la solution particulière : ${fx(`yₚ(x) = c(x) × e^{−A(x)} = ${o.ypT}`)}.`]]
    :o.bTp?[[d1V(o.bTp),"second membre pris pour une solution",`Le second membre ${fx(o.bT)} n'est pas une solution de (E). ${o.whyP}`]]:[];
  return o;}
function d1Etapes(o){const E=[],cyC=fx(`y = ${o.cy("C")}`),sur=o.dom==="ℝ"?"":` sur ${o.dom}`;
  if(!o.ypT){E.push({w:o.e0w||`L'équation est déjà sous la forme ${fx("y′ + a(x)y = 0")}, avec ${fx(`a(x) = ${o.aT}`)}.`,why:o.e0why||"a(x) est ce qui multiplie y, signe compris.",pts:1},
      {w:`Une primitive de a : ${fx(`A(x) = ${o.AT}`)}.`,why:o.whyA,pts:1},
      {w:`Toutes les solutions${sur} : ${cyC}, où C est une constante réelle.`,why:`Le cours (proposition 4.1) : les solutions de ${fx("y′ + a(x)y = 0")} sont les fonctions ${fx("C e^{−A(x)}")}, avec un moins devant A(x).${o.why0||""}`,pts:1});
    o.iE={la:0,pr:1,so:2,g:2,ci:3};return E;}
  E.push({w:`L'équation sans second membre (E₀) : ${fx(o.lhs+" = 0")}. Ici ${fx(`a(x) = ${o.aT}`)}, une primitive est ${fx(`A(x) = ${o.AT}`)}, donc les solutions de (E₀) sont ${cyC}.`,
    why:`Proposition 4.1 : les solutions de (E₀) sont les fonctions ${fx("C e^{−A(x)}")}, avec un moins devant A(x). ${o.whyA}${o.why0||""}`,pts:1});
  if(o.cT){E.push({w:`Variation de la constante : ${fx(`b(x) × e^{A(x)} = ${o.beW} = ${o.beT}`)}.`,why:`On cherche ${fx("yₚ(x) = c(x) × e^{−A(x)}")} : il faut que c soit une primitive de ${fx("b(x) × e^{A(x)}")}, avec l'exposant +A. ${o.whyBe}`,pts:1},
      {w:`Une primitive : ${fx(`c(x) = ${o.cT}`)}. Donc ${fx(`yₚ(x) = c(x) × e^{−A(x)} = ${o.ypT}`)}.`,why:`${o.whyC} Puis on multiplie par ${fx(`e^{−A(x)} = ${o.y0T}`)}, avec l'exposant −A cette fois.`,pts:1});
    o.iE={la:0,pr:0,so:0,be:1,yp:2,g:3,ci:4};}
  else{E.push({w:`Une solution particulière de (E) : ${fx(`yₚ(x) = ${o.ypT}`)}.`,why:o.whyP,pts:1});o.iE={la:0,pr:0,so:0,yp:1,g:2,ci:3};}
  E.push({w:`Toutes les solutions de (E)${sur} : ${fx(`y = ${o.genT}`)}, où C est une constante réelle.`,why:"Proposition 4.3 : une solution particulière de (E), plus toutes les solutions de (E₀).",pts:1});
  return E;}
/* « toutes les solutions » : f est la partie sans constante, g celle qui suit chaque constante */
function d1Fam(o,Y){const cst=Y.cst,un=cst.map(()=>1),env=v=>Object.fromEntries(cst.map((c,i)=>[c,v[i]])),N=o.N,V1=d1Val(Y.A,env(un));
  if(!V1)return {pb:"calcul"};
  if(!cst.length)return {pb:d1Rap(V1,N.yp,N.y0)!==null?"sansC":"faux"};
  const co=cst.map((c,i)=>-0.6-1.3*i),G=cst.map((c,i)=>d1Val(Y.A,env(un.map((u,j)=>i===j?2:1)))),Vc=d1Val(Y.A,env(co));
  if(!Vc||G.some(v=>!v))return {pb:"calcul"};
  const g=G.map(v=>v.map((y,j)=>y-V1[j])),f=V1.map((y,j)=>y-g.reduce((t,u)=>t+u[j],0));
  if(Vc.some((y,j)=>{const p=V1[j]+g.reduce((t,u,i)=>t+(co[i]-1)*u[j],0);return Math.abs(p-y)>1e-7*Math.max(1,Math.abs(y),Math.abs(p));}))return {pb:"constante"};
  const d=g.map(u=>d1Rap(u,N.zero,N.y0)),k=d.indexOf(null);
  if(k>=0)return {pb:"homog",tw:o.tw.find(t=>d1Rap(g[k],N.zero,t[0])!==null)};
  if(d.every(x=>Math.abs(x)<1e-9))return {pb:"constante"};
  if(d1Rap(f,N.yp,N.y0)===null)return {pb:"part",nul:f.every(y=>Math.abs(y)<1e-9),f};
  return {ok:true};}
function d1Diag(o,r){const E=o.iE,d=(etape,type,msg,titre)=>({etape,type,titre:"Où ça part : "+titre,msg}),gen=fx(`y = ${o.genT}`),cyC=fx(o.cy("C"));
  if(r.pb==="sansC")return d(E.g,"constante oubliée",`Ta fonction est bien une solution, mais on demande toutes les solutions : ${gen}, avec une constante C.`,"la constante.");
  if(r.pb==="faux")return d(E.so,"solution qui ne vérifie pas l'équation",`Ta fonction ne vérifie pas l'équation, et il manque la constante C. Toutes les solutions : ${gen}.`,"les solutions.");
  if(r.pb==="constante")return d(E.g,"constante mal placée",`La constante doit seulement multiplier ${fx(o.y0T)} : ${gen}. Dans un exposant, au carré ou au dénominateur, elle ne donne pas toutes les solutions.`,"la constante.");
  if(r.pb==="homog")return r.tw?d(E[r.tw[3]],r.tw[1],r.tw[2],"l'équation sans second membre.")
    :d(E.so,"solutions de l'équation sans second membre",`La partie qui porte la constante doit être ${cyC} : ${fx(`A(x) = ${o.AT}`)} est une primitive de ${fx(`a(x) = ${o.aT}`)}, et les solutions de ${fx(o.lhs+" = 0")} sont les fonctions ${fx("C e^{−A(x)}")}.`,"l'équation sans second membre.");
  if(!o.ypT)return d(E.g,"terme en trop",`Cette équation n'a pas de second membre : il n'y a rien à ajouter à ${cyC}.`,"les solutions.");
  if(r.nul)return d(E.yp,"solution particulière oubliée",`${cyC} donne les solutions de l'équation sans second membre. Il manque une solution particulière de (E) : ${fx(`yₚ(x) = ${o.ypT}`)}, donc ${gen}.`,"la solution particulière.");
  const t=o.twP.find(t=>d1Rap(r.f,t[0],o.N.y0)!==null);
  return t?d(E.yp,t[1],t[2],"la solution particulière."):d(E.yp,"solution particulière",`La partie sans constante doit être une solution de (E), et la tienne ne l'est pas. ${fx(`yₚ(x) = ${o.ypT}`)} convient : ${gen}.`,"la solution particulière.");}
const D1_ILL="Je n'arrive pas à lire ta formule. Écris par exemple C*e^(-2x) + 3, avec des parenthèses après e^.",D1_CALC="Je n'arrive pas à calculer ta formule pour toutes les valeurs de x : vérifie les parenthèses.",D1_AIDE="Écris e^(-2x) avec des parenthèses après e^, et x^2 pour x².";
const D1_RAP=`<p class="muted">Rappel : les solutions de ${fx("y′ + a(x)y = 0")} sont les fonctions ${fx("y = C e^{−A(x)}")}, où A est une primitive de a. Écris ta réponse avec x et une constante C, par exemple C*e^(2x).</p>`;
const d1Sym=o=>["e^(","x","C","^","/"].concat(o.fam==="trig"?["cos(","sin("]:o.fam==="rat"?["√","("]:o.fam==="invx"?["ln("]:[]);
const D1_NAT={cst:"a constant",pow:"a(x) = kxⁿ",expx:"a(x) = keˣ",invx:"a(x) = k/x",rat:"a(x) = kx/(1 + x²)",trig:"a(x) = k cos x ou k sin x",aff:"a(x) = 2x + k",cc:"second membre constant",ax:"second membre proportionnel à a(x)",poly:"second membre polynôme",
  res:"second membre : l'exponentielle de l'équation sans second membre",exp:"second membre : une autre exponentielle",pol:"second membre : polynôme fois exponentielle",gauss:"a(x) = 2x ou −2x"};
/* un exercice « toutes les solutions », à un champ */
function d1ExoFam(o,eq,P){const E=d1Etapes(o),hom=!o.ypT,yp=o.ypTp||"0",y0=`(${o.y0Tp})`;
  const pg=[[`(${yp})+C/${y0}`,"signe"],[`(${yp})+${y0}`,"constante oubliée"],[`(${yp})+C^2*${y0}`,"constante mal placée"]];
  if(!hom)pg.push([`C*${y0}`,"particulière oubliée"]);
  if(o.fam!=="cst"&&o.fam!=="expx")pg.push([`(${yp})+C*e^(-(${o.aTp}))`,"au lieu d'une primitive"]);
  if(o.nd)pg.push([`C*e^(-(${o.nd[1]})*x)`,"seul"]);
  function juge(rep){const Y=lisY(rep.y);if(Y.vide)return {incomplet:"Écris les solutions y."};if(Y.illisible)return {incomplet:D1_ILL};
    const r=d1Fam(o,Y);if(r.pb==="calcul")return {incomplet:D1_CALC};if(r.ok)return {ok:true};
    return {ok:false,faux:["y"],resume:r.pb==="sansC"?"Pas tout à fait : il manque la constante.":"Pas tout à fait : ce ne sont pas les solutions de l'équation.",diag:d1Diag(o,r)};}
  return {sig:"D1"+P.s+eq,q:`Résous sur ${o.dom} l'équation différentielle ${hom?"":"(E) : "}${fx(eq)}. Donne toutes ses solutions.`,corps:P.corps||"",texte:`toutes les solutions de ${eq}`,
    champs:[{k:"champ",id:"y",nom:"solutions",label:"$y =$",ex:"avec x et une constante C",sym:d1Sym(o),aide:D1_AIDE+" La constante s'écrit C."}],juge,etapes:E,
    bonne:fx(`y = ${o.genT}`),bonneTxt:`y = ${o.genT}`,repBonne:{y:o.genTp},repFausse:{y:pg[hom?0:3][0]},nature:D1_NAT[o.kind||o.fam],ens:{eq,aff:`y = ${o.genT}`,pieges:pg}};}
function d1Homog(R,cst){let o,eq;
  if(cst){const t=R();
    if(t<0.5){o=d1Cst(R.nz(-6,6));eq=o.lhs+" = 0";}
    else if(t<0.72){const k=R.nz(-6,6);o=d1Cst(-k);eq=`y′ = ${coefK(k)}y`;o.e0w=`On passe tout du même côté : ${fx(o.lhs+" = 0")}. Donc ${fx(`a(x) = ${o.aT}`)}.`;o.e0why=`La formule du cours part de la forme ${fx("y′ + a(x)y = 0")} : un terme change de signe quand il traverse le signe égal.`;}
    else{const m=R.choix([2,3,4]),n=R.nz(-6,6);o=d1Cst(Q(n,m));eq=S([[m,"y′"],[n,"y"]])+" = 0";o.nd=[m,n];o.e0w=`On divise par ${m} pour que y′ soit seul : ${fx(o.lhs+" = 0")}. Donc ${fx(`a(x) = ${o.aT}`)}.`;o.e0why=`La formule du cours part de la forme ${fx("y′ + a(x)y = 0")}, avec le coefficient 1 devant y′.`;}}
  else{o=d1Var(R,R.choix(["pow","pow","pow","expx","invx","invx","rat","trig","trig","aff","aff"]));eq=o.lhs+" = 0";}
  return d1ExoFam(d1Num(o),eq,{s:"h",corps:cst?D1_RAP:""});}
function d1Evidente(R){const t=R(),o=d1Num(d1Sm(R,t<0.35?"cc":t<0.7?"ax":"poly"));
  return d1ExoFam(o,`${o.lhs} = ${o.bT}`,{s:"e",corps:`<p class="muted">Indication : ${o.ind}</p>`});}
/* la variation de la constante : un exemple à cinq cases, ou en entier */
function d1Variation(R,trous){const t=R(),o=d1Num(d1Sm(R,trous?(t<0.35?"res":t<0.7?"exp":"pol"):t<0.2?"res":t<0.42?"exp":t<0.6?"pol":t<0.85?"invx":"gauss")),eq=`${o.lhs} = ${o.bT}`;
  if(!trous)return d1ExoFam(o,eq,{s:"v",corps:`<p class="muted">Pour la solution particulière : la variation de la constante.</p>`});
  const E=d1Etapes(o),h=1e-5,K=["A","be","c","yp"],a=d1F(o.aTp),Ar=d1F(o.ATp),b=d1F(o.bTp),be=d1F(o.beTp),txt=v=>String(v==null?"":v);
  function juge(rep){const T={};if(K.concat(["y"]).some(k=>!propre(txt(rep[k]))))return {incomplet:"Remplis les cinq cases."};
    for(const k of K){const A=lis(txt(rep[k]).replace(/^[^=]*=/,""),["x"]);
      if(!A)return {incomplet:"Je n'arrive pas à lire une des cases. Écris par exemple 2x*e^(-3x), avec des parenthèses après e^."};
      if(lettres(A).size)return {incomplet:"Les quatre premières cases s'écrivent avec x seulement. La constante C n'arrive qu'à la dernière ligne : pour c(x), une seule primitive suffit."};
      T[k]=x=>{try{const v=val(A,{x});return Math.abs(v[1])<1e-9?v[0]:NaN;}catch(e){return NaN;}};}
    const Y=lisY(rep.y);if(Y.vide||Y.illisible)return {incomplet:D1_ILL};
    if(K.some(k=>XD.some(x=>!Number.isFinite(T[k](x)))))return {incomplet:D1_CALC};
    const dr=f=>x=>(f(x+h)-f(x-h))/(2*h),tous=(f,g,tol)=>XD.every(x=>Math.abs(f(x)-g(x))<=tol*Math.max(1,Math.abs(g(x))));
    const okA=tous(dr(T.A),a,1e-5),ek=okA?Math.exp(T.A(XD[0])-Ar(XD[0])):1,be2=x=>be(x)*ek,okB=tous(T.be,be2,1e-8),okC=tous(dr(T.c),be2,1e-5),okP=d1Rap(XD.map(T.yp),o.N.yp,o.N.y0)!==null,r=d1Fam(o,Y);
    if(r.pb==="calcul")return {incomplet:D1_CALC};
    const F=[];if(!okA)F.push("A");if(!okB)F.push("be");if(!okC)F.push("c");if(!okP)F.push("yp");if(!r.ok)F.push("y");if(!F.length)return {ok:true};
    const d=(etape,type,msg,titre)=>({etape,type,titre:"Où ça part : "+titre,msg});
    const dg=!okA?d(0,"primitive de a",`En dérivant A(x), on doit retrouver ${fx(`a(x) = ${o.aT}`)} : ${fx(`A(x) = ${o.AT}`)}.`,"la primitive A.")
      :!okB?d(1,tous(T.be,x=>b(x)*Math.exp(-T.A(x)),1e-8)?"exposant −A au lieu de +A":"produit de b(x) par l'exponentielle de A(x)",`Ici l'exposant est +A(x) : ${fx(`b(x) × e^{A(x)} = ${o.beW} = ${o.beT}`)}.`,"le produit de b(x) par l'exponentielle.")
      :!okC?d(2,tous(T.c,be2,1e-8)?"c(x) pas encore primitivé":"primitive c",`c est une primitive de ${fx(o.beT)} : ${fx(`c(x) = ${o.cT}`)}. ${o.whyC}`,"la primitive c.")
      :!okP?d(2,tous(T.yp,T.c,1e-8)?"c(x) pris pour la solution particulière":"solution particulière",`${fx(`yₚ(x) = c(x) × e^{−A(x)} = ${o.ypT}`)}, avec l'exposant −A.`,"la solution particulière."):d1Diag(o,r);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length} case${F.length>1?"s sont":" est"} à revoir.`,diag:dg};}
  const B={A:o.ATp,be:o.beTp,c:o.cTp,yp:o.ypTp,y:o.genTp};
  return {sig:"D1t"+eq,q:`Résous sur ℝ l'équation différentielle (E) : ${fx(eq)}, en complétant les étapes.`,
    corps:`<p>Ici ${fx(`a(x) = ${o.aT}`)} et ${fx(`b(x) = ${o.bT}`)}.</p><p><b>1.</b> Une primitive de a : ${fx("A(x) =")} ${O.trou("A")}. Les solutions de (E₀) : ${fx(o.lhs+" = 0")} sont donc les fonctions ${fx("C e^{−A(x)}")}.</p><p><b>2.</b> Variation de la constante : on simplifie ${fx("b(x) × e^{A(x)} =")} ${O.trou("be",1)}, puis on en cherche une primitive, ${fx("c(x) =")} ${O.trou("c",1)}.</p><p><b>3.</b> Une solution particulière : ${fx("yₚ(x) = c(x) × e^{−A(x)} =")} ${O.trou("yp",1)}.</p><p><b>4.</b> Toutes les solutions de (E) : ${fx("y =")} ${O.trou("y",1)}.</p>`,
    corpsPapier:`<p>Sur ta feuille, rédige la résolution en entier : (E₀) et ses solutions, le produit de b par l'exponentielle de A, la primitive c, la solution particulière, puis toutes les solutions.</p>`,texte:`variation de la constante : ${eq}`,
    champs:[{k:"trous",ids:K.concat(["y"])},{k:"sym",id:"s",sym:["e^(","x","C","^","/"],aide:D1_AIDE+" Les boutons écrivent dans la case où tu es."}],indice:false,juge,etapes:E,
    bonne:`${fx(`A(x) = ${o.AT}`)} ; ${fx(`c(x) = ${o.cT}`)} ; ${fx(`yₚ(x) = ${o.ypT}`)} ; ${fx(`y = ${o.genT}`)}`,bonneTxt:`A(x) = ${o.AT} ; c(x) = ${o.cT} ; yₚ(x) = ${o.ypT} ; y = ${o.genT}`,
    repBonne:B,repFausse:Object.assign({},B,{be:`(${o.bTp})*(${o.y0Tp})`}),nature:D1_NAT[o.kind],ens:{eq,aff:`y = ${o.genT}`}};}
/* avec une condition initiale : une seule solution, sans constante */
function d1Initiale(R){const t=R();let o;
  if(t<0.18){const f=R.choix(["cst","pow","pow","rat","trig","expx","aff","invx"]);o=f==="cst"?d1Cst(R.nz(-6,6)):d1Var(R,f);}
  else o=d1Sm(R,t<0.42?"poly":t<0.52?"cc":t<0.64?"ax":R.choix(["res","exp","pol","invx","gauss"]),true);
  d1Num(o);const hom=!o.ypT,eq=`${o.lhs} = ${hom?"0":o.bT}`,E=d1Etapes(o),x0=o.x0,P=o.ypx0||Q(0),e0=o.e0||0,N=o.N;let y1;do y1=R.ent(-3,3);while(hom?!y1:egal(Q(y1),P));
  const Cs=sub(y1,P),c0=e0?Q(y1):Cs,CT=e0?S([[y1,eT(e0)]]):nb(Cs),lhsC=e0?`C × ${eT(-e0)}`:nul(P)?"C":d1Plus(nb(P),"C"),Cv=(y1-P.n/P.d)*Math.exp(e0),Ch=y1*Math.exp(e0);
  const solT=e0?`${coefK(y1)}e^{${S([[e0,""]].concat(o.expT).sort((u,v)=>(v[0]>0)-(u[0]>0)))}}`:o.facT?d1Par(S(o.facT.concat([[Cs,""]])))+o.y0T:hom?o.cyQ(Cs):d1Plus(o.ypT,o.cyQ(Cs));
  const tp=c=>e0?`(${brut(c)})*e^(${e0})*(${o.y0Tp})`:`(${o.ypTp||"0"})+(${brut(c)})*(${o.y0Tp})`,ciT=`y(${x0}) = ${nb(y1)}`;
  const ciW=`En ${fx(`x = ${x0}`)}, la solution vaut ${fx(`y(${x0}) = ${lhsC}`)}. Or ${fx(ciT)}, donc ${fx(`C = ${CT}`)}.`;
  E.push({w:`La condition initiale. ${ciW}`,why:e0?`En 0, ${fx(o.y0T)} vaut ${fx(eT(-e0))}, pas 1 : c'est l'exposant qu'on calcule en 0.`:`En ${x0}, ${fx(o.y0T)} vaut 1.${hom?" La condition choisit une seule solution parmi toutes.":" La condition se pose sur la solution complète, jamais sur celle de l'équation sans second membre."}`,pts:1},
    {w:`L'unique solution : ${fx(`y = ${solT}`)}.`,why:`On remplace C par sa valeur. Vérification : en x = ${x0}, on retrouve bien ${nb(y1)}.`,pts:1});
  const pg=hom?[[`(${y1})/(${o.y0Tp})`,"signe"]]:[[`(${y1})*(${o.y0Tp})`,"particulière oubliée"]];if(!hom&&!nul(P))pg.push([`(${o.ypTp})+(${y1})*(${o.y0Tp})`,"posée sur"]);
  function juge(rep){const Y=lisY(rep.y);if(Y.vide)return {incomplet:"Écris la solution y."};if(Y.illisible)return {incomplet:D1_ILL};
    if(Y.cst.length)return {incomplet:`Il reste ${Y.cst.length>1?"des constantes":"une constante"} (${Y.cst.join(", ")}) : utilise ${ciT} pour ${Y.cst.length>1?"les":"la"} calculer.`};
    const V=d1Val(Y.A,{});if(!V)return {incomplet:D1_CALC};
    const r=d1Rap(V,N.yp,N.y0),I=o.iE,d=(etape,type,msg,titre)=>({etape,type,titre:"Où ça part : "+titre,msg}),pr=(u,v)=>Math.abs(u-v)<=1e-7*Math.max(1,Math.abs(v));
    if(r!==null&&pr(r,Cv))return {ok:true};
    let dg;
    if(r!==null)dg=!hom&&pr(r,Ch)?d(I.ci,"condition initiale posée sur la solution de (E₀)",`Tu as calculé C avec ${fx(o.cy("C"))} seulement. La condition se pose sur la solution complète ${fx(`y = ${o.genT}`)}. ${ciW}`,"la condition initiale.")
      :d(I.ci,"calcul de la constante",`Ta fonction vérifie bien l'équation, mais pas la condition ${fx(ciT)}. ${ciW}`,"la condition initiale.");
    else if(!hom&&d1Rap(V,N.zero,N.y0)!==null)dg=d(I.yp,"solution particulière oubliée",`Ta fonction est une solution de l'équation sans second membre. Il manque une solution particulière de (E) : ${fx(`yₚ(x) = ${o.ypT}`)}.`,"la solution particulière.");
    else{const w=o.tw.find(w=>d1Rap(V,N.zero,w[0])!==null);
      dg=w?d(I[w[3]],w[1],w[2],"l'équation sans second membre."):d(I.so,"solution qui ne vérifie pas l'équation",`Ta fonction ne vérifie pas l'équation. Toutes les solutions : ${fx(`y = ${o.genT}`)}. Ensuite, la condition ${fx(ciT)} donne C.`,"les solutions.");}
    return {ok:false,faux:["y"],resume:"Pas tout à fait : cette fonction n'est pas la bonne.",diag:dg};}
  return {sig:"D1i"+eq+"|"+y1,q:`Résous${o.dom==="ℝ"?"":` sur ${o.dom}`} l'équation différentielle ${hom?"":"(E) : "}${fx(eq)} avec la condition initiale ${fx(ciT)}.`,corps:"",texte:`${eq}, ${ciT}`,
    champs:[{k:"champ",id:"y",nom:"solution",label:"$y =$",ex:"une fonction de x, sans constante",sym:d1Sym(o).filter(s=>s!=="C"),aide:D1_AIDE}],juge,etapes:E,
    bonne:fx(`y = ${solT}`),bonneTxt:`y = ${solT}`,repBonne:{y:tp(c0)},repFausse:{y:tp(add(c0,1))},nature:hom?"sans second membre":o.cT?"variation de la constante":"solution particulière évidente",ens:{eq,x0,y1,gen:o.genTp,aff:`y = ${solT}`,pieges:pg}};}

/* ---------- CA14 : calculer une limite (TD 1, exercices 1 et 2) ----------
   La réponse est un nombre exact, +∞ ou −∞. Dans une formule, le haut et le bas d'une fraction sont mis entre parenthèses dès qu'ils portent
   un exposant ou une espace (lmF) : le site les empile alors en entier. Le contrôle relit ens.expr et le calcule près du point. */
const LM_SYM=[["+∞","+∞"],["−∞","-∞"],["/","/"],["√","√("]],LMP=["","x","x²","x³","x⁴","x⁵"];
const lmInf=s=>s>0?"+∞":"−∞",lmT=L=>L.inf?lmInf(L.inf):nb(L.v),lmTp=L=>L.inf?(L.inf>0?"+∞":"-∞"):brut(L.v),lmSg=v=>v>0?"positif":"négatif",lmSi=s=>s<0?"−":"+";
const lmG=t=>/^(\d+|[A-Za-z])$/.test(t)?t:`(${t})`,lmF=(n,d)=>`${lmG(String(n))}/${lmG(String(d))}`;
const lmM=(c,n)=>(n&&Math.abs(c)===1?(c<0?"−":""):nb(c))+LMP[n],lmE=k=>k===1?"eˣ":`e^{${ex1(k)}}`;
function lmPoly(c){let s="";for(let i=c.length-1;i>=0;i--){const v=c[i];if(!v)continue;s+=(s?(v<0?" − ":" + "):(v<0?"−":""))+lmM(Math.abs(v),i);}return s||"0";}
/* le polynôme divisé par x^k : 3 + 5/x − 2/(x²) */
function lmDiv(c,k){let s="";for(let i=c.length-1;i>=0;i--){const v=c[i];if(!v)continue;const a=Math.abs(v);s+=(s?(v<0?" − ":" + "):(v<0?"−":""))+(k===i?a:lmF(a,LMP[k-i]));}return s;}
const lmPt=P=>P.inf?lmInf(P.inf):nb(P.a)+(P.c?(P.c>0?"⁺":"⁻"):"");
const lmOu=P=>P.inf?`quand x tend vers ${fx(lmInf(P.inf))}`:`quand x tend vers ${fx(nb(P.a))}`+(P.c?` par la ${P.c>0?"droite":"gauche"} (x reste plus ${P.c>0?"grand":"petit"} que ${fx(nb(P.a))})`:"");
const lmFin=(P,L)=>`<b>${fx(`lim_{x → ${lmPt(P)}} f(x) = ${lmT(L)}`)}</b>`,lmD=(etape,type,titre,msg)=>({etape,type,titre:"Où ça part : "+titre,msg});
function lmLis(s){const t=propre(s).toLowerCase().replace(/ /g,"");if(!t)return null;
  if(/^(pasdelimite|aucune(limite)?|non|n['’]?existepas)$/.test(t))return {sans:1};
  const m=/^([+-]?)(∞|inf|infini|oo)$/.exec(t);if(m)return {inf:m[1]==="-"?-1:1};
  const r=lisReel(s);return r.v===undefined?null:{v:r.v,dec:r.dec};}
function lmExo(o){const L=o.lim,P=o.pt,E=o.etapes,dern=E.length-1,Lv=L.inf?0:L.v.n/L.v.d,pt=lmPt(P);
  function juge(rep){const lu=lmLis(rep.lim);
    if(!lu)return {incomplet:"Écris un nombre exact (3, -1/2), +∞ ou −∞."};
    if(L.inf?lu.inf===L.inf:lu.v!==undefined&&pres(lu.v,Lv))return {ok:true};
    if(lu.dec&&!L.inf&&Math.abs(lu.v-Lv)<0.01)return {incomplet:"Donne la valeur exacte : une fraction, pas un nombre à virgule arrondi."};
    const d=lu.sans?lmD(dern,"limite déclarée inexistante","la conclusion.",`Cette limite existe : elle vaut ${fx(lmT(L))}.`)
      :(o.diag&&o.diag(lu))||(L.inf&&lu.inf?lmD(o.etSigne==null?dern:o.etSigne,"signe de l'infini","le signe.",`La fonction tend bien vers l'infini, mais c'est vers ${fx(lmT(L))} : reprends le signe de chaque morceau.`)
      :lmD(dern,o.type,"le calcul.",`La limite est ${fx(lmT(L))}.`));
    return {ok:false,faux:["lim"],resume:"Pas tout à fait : ce n'est pas la bonne limite.",diag:d};}
  return {sig:"LM"+o.sig,q:`Calcule la limite de ${fx(`f(x) = ${o.expr}`)} ${lmOu(P)}. Réponds par un nombre exact, ${fx("+∞")} ou ${fx("−∞")}.`,corps:"",texte:`limite de ${o.expr} en ${pt}`,
    champs:[{k:"champ",id:"lim",nom:"limite",label:`$lim_{x → ${pt}} f(x) =$`,ex:"un nombre, +∞ ou −∞",sym:LM_SYM}],juge,etapes:E,
    bonne:fx(`lim_{x → ${pt}} f(x) = ${lmT(L)}`),bonneTxt:lmT(L),repBonne:{lim:lmTp(L)},repFausse:{lim:o.faux||(L.inf?lmTp({inf:-L.inf}):L.v.n===0?"1":"0")},nature:o.nature,
    ens:{expr:o.expr,pt:P.inf?P.inf*Infinity:P.a,cote:P.c||0,lim:L.inf?L.inf*Infinity:Lv,aff:lmT(L),pieges:o.pieges||[]}};}
/* palier 1 : en +∞ ou −∞, un polynôme ou un quotient de polynômes */
function lmQuot(R){for(;;){const s=R()<0.5?1:-1,P={inf:s},seul=R()<0.25,p=seul?R.ent(2,4):R.ent(1,3),qd=seul?0:R.ent(1,3),
    mk=g=>{const c=[];for(let i=0;i<=g;i++)c.push(i===g?R.nz(-5,5):R()<0.6?R.ent(-9,9):0);return c;},N=mk(p),D=seul?[1]:mk(qd),nN=N.filter(Boolean).length,nD=D.filter(Boolean).length;
  if(seul?nN<2:nN+nD<3)continue;
  const a=N[p],c=D[qd],d=p-qd,sx=s<0&&d%2?-1:1,r=Q(a,c),L=d===0?{v:r}:d<0?{v:Q(0)}:{inf:Math.sign(a*c)*sx},inf=fx(lmInf(s)),fin=lmFin(P,L),
    zero=`Les morceaux ${fx("1/x")}, ${fx("1/(x²)")}… tendent vers 0 quand x tend vers ${inf}`,
    par=s>0?"":d%2?" (une puissance impaire garde le signe moins de x)":" (une puissance paire est toujours positive)",garde=v=>v>0?"positif : le signe est gardé":"négatif : le signe change";
  if(seul)return lmExo({sig:"P"+s+N.join(","),expr:lmPoly(N),pt:P,lim:L,nature:"polynôme",type:"limite d'un polynôme",pieges:[["0","polynôme"]],
    etapes:[{w:`On met en facteur le terme de plus haut degré : ${fx(`f(x) = ${LMP[p]}(${lmDiv(N,p)})`)}.`,why:`En ${inf}, c'est la plus grande puissance de x qui décide. La mettre en facteur le montre : dans la parenthèse, il ne reste à côté de ${fx(nb(a))} que des morceaux qui tendent vers 0.`,pts:1},
      {w:`La parenthèse tend vers ${fx(nb(a))}, et ${fx(LMP[p])} tend vers ${fx(lmInf(sx))}.`,why:`${zero}.${s<0?` Et ${fx(LMP[p])} tend vers ${fx(lmInf(sx))}${par}.`:""}`,pts:1},
      {w:fin,why:`On multiplie une quantité qui tend vers ${fx(lmInf(sx))} par un nombre proche de ${fx(nb(a))}, qui est ${garde(a)}.`,pts:1}],
    diag:lu=>lu.inf?null:lmD(0,"limite d'un polynôme en l'infini","le terme le plus fort.",lu.v===0?"« ∞ − ∞ » ne vaut pas 0 : c'est une forme indéterminée. Mets la plus grande puissance de x en facteur.":"Un polynôme qui n'est pas constant tend toujours vers l'infini quand x tend vers l'infini : mets la plus grande puissance de x en facteur.")});
  const tN=lmPoly(N),tD=lmPoly(D),rN=nN>1?lmDiv(N,p):nb(a),rD=nD>1?lmDiv(D,qd):nb(c),reste=lmF(rN,rD),pw=d>0?LMP[d]:d<0?"1/"+lmG(LMP[-d]):"1",forme=d===0?reste:d>0?`${LMP[d]} × ${reste}`:`(${pw}) × ${reste}`,
    hautS=nN>1?`En haut : ${fx(`${tN} = ${LMP[p]}(${rN})`)}.`:`En haut, ${fx(tN)} est déjà un seul terme.`,basS=nD>1?`En bas : ${fx(`${tD} = ${LMP[qd]}(${rD})`)}.`:`En bas, ${fx(tD)} est déjà un seul terme.`;
  return lmExo({sig:"Q"+s+N.join(",")+"|"+D.join(","),expr:lmF(tN,tD),pt:P,lim:L,nature:d===0?"même degré":d<0?"vers 0":"infini",type:"limite d'un quotient de polynômes",
    pieges:d===0?[["+∞","pris pour l'infini"],["0","pris pour 0"]].concat(a===c?[]:[["1","pris pour 1"]]):d<0?[["+∞","degré du bas"],["1","degré du bas"]]:[["0","degré du haut"],[lmTp({inf:-L.inf}),"signe de l'infini"]],
    etapes:[{w:`On met en facteur la plus grande puissance de x, en haut et en bas. ${hautS} ${basS}`,why:`En ${inf}, le haut et le bas tendent tous les deux vers l'infini : c'est une forme indéterminée « ∞/∞ », on ne peut pas conclure tout de suite. Mettre la plus grande puissance en facteur fait apparaître des morceaux qui tendent vers 0.`,pts:1},
      {w:`On simplifie les puissances de x : ${fx(`f(x) = ${forme}`)}. La fraction qui reste tend vers ${fx(nb(r))}.`,why:`${fx(`${lmF(LMP[p],LMP[qd])} = ${pw}`)}. ${zero} : il reste ${fx(nb(a))} en haut et ${fx(nb(c))} en bas.`,pts:1},
      {w:fin,why:d===0?`Il ne reste que cette fraction : la limite est le quotient des coefficients des plus grandes puissances, ${fx(nb(a))} divisé par ${fx(nb(c))}.`:d<0?`${fx(pw)} tend vers 0, et 0 multiplié par un nombre proche de ${fx(nb(r))} donne 0.`:`${fx(LMP[d])} tend vers ${fx(lmInf(sx))}${par}. On le multiplie par un nombre proche de ${fx(nb(r))}, qui est ${garde(a*c)}.`,pts:1}],
    diag:lu=>d===0?(lu.inf?lmD(0,"« ∞/∞ » pris pour l'infini","la forme indéterminée.","Le haut tend vers l'infini, mais le bas aussi : « ∞/∞ » est une forme indéterminée. Ici le haut et le bas ont le même degré : la limite est un nombre.")
        :lu.v===0?lmD(1,"même degré pris pour 0","la comparaison des degrés.",`Le haut et le bas ont le même degré : aucun des deux ne l'emporte. La limite est le quotient des coefficients des plus grandes puissances, ${fx(nb(a))} et ${fx(nb(c))}.`)
        :lu.v===1?lmD(0,"« ∞/∞ » pris pour 1","la forme indéterminée.",`« ∞/∞ » ne vaut pas 1 : c'est une forme indéterminée. Il faut garder les coefficients des plus grandes puissances, ${fx(nb(a))} et ${fx(nb(c))}.`)
        :pres(lu.v,c/a)?lmD(2,"quotient inversé","la conclusion.",`C'est le coefficient du haut divisé par celui du bas : ${fx(nb(a))} divisé par ${fx(nb(c))}.`):null)
      :d<0?lmD(1,"degré du bas plus grand","la comparaison des degrés.","Le bas a le plus grand degré : il grandit plus vite que le haut, et le quotient tend vers 0.")
      :lu.inf?lmD(2,"signe de l'infini","le signe.",`${fx(LMP[d])} tend vers ${fx(lmInf(sx))}${par}, et on le multiplie par un nombre proche de ${fx(nb(r))}.`)
      :lmD(1,"degré du haut plus grand","la comparaison des degrés.","Le haut a le plus grand degré : il grandit plus vite que le bas, et le quotient tend vers l'infini.")});}}
/* palier 2 : en un nombre a. « 0/0 » : on simplifie par (x − a). Bas qui tend vers 0 tout seul : l'infini, avec son signe */
function lmZero(R){const a=R.ent(-3,3),P={a,c:0},v=R(),k=R()<0.3?R.choix([2,3,-1,-2]):1,m=R.choix([1,1,2,3]);let r1,r2;do{r1=R.ent(-4,4);r2=R.ent(-4,4);}while(r1===a||r2===a||r1===r2);
  const X=t=>t===0?"x":`(x ${lmSi(-t)} ${Math.abs(t)})`,X1=a===0?"x":`x ${lmSi(-a)} ${Math.abs(a)}`,hautQ=v<0.8,basQ=v<0.6||!hautQ,fac=(kk,r)=>coefK(kk)+(r===undefined?X(a):r===0?"x"+X(a):X(a)+X(r)),
    N=hautQ?[k*a*r1,-k*(a+r1),k]:[-k*a,k],D=basQ?[a*r2,-(a+r2),1]:[-m*a,m],tN=lmPoly(N),tD=lmPoly(D),fN=hautQ?fac(k,r1):k===1?X1:fac(k),fD=basQ?fac(1,r2):m===1?X1:fac(m),
    rN=lmPoly(hautQ?[-k*r1,k]:[k]),nv=hautQ?k*(a-r1):k,dv=basQ?a-r2:m,frac=basQ||m!==1,forme=frac?lmF(rN,basQ?lmPoly([-r2,1]):m):rN,L={v:Q(nv,dv)},A=fx(nb(a)),
    egalites=[[tN,fN],[tD,fD]].filter(x=>x[0]!==x[1]).map(x=>fx(`${x[0]} = ${x[1]}`)).join(" et "),fi=(nom,suite)=>lmD(0,`« 0/0 » pris pour ${nom}`,"la forme indéterminée.",`${suite} Simplifie d'abord par ${fx(X1)}.`);
  return lmExo({sig:"Z"+a+"|"+N.join(",")+"|"+D.join(","),expr:lmF(tN,tD),pt:P,lim:L,nature:"0/0",type:"simplification par (x − a)",pieges:[["+∞","pris pour l'infini"],["0","pris pour 0"]].concat(nv===dv?[]:[["1","pris pour 1"]]),
    etapes:[{w:`Quand x tend vers ${A}, le haut et le bas tendent tous les deux vers 0 : c'est une forme indéterminée « 0/0 ». On factorise par ${fx(X1)} : ${egalites}.`,why:a===0?"Le haut et le bas valent 0 quand x vaut 0 : chacun a x en facteur.":`Remplace x par ${A} : le haut et le bas valent 0. Un polynôme qui vaut 0 en ${A} se factorise par ${fx(X1)}. L'autre facteur se trouve avec l'autre racine (le discriminant), et se vérifie en développant.`,pts:1},
      {w:`Pour x différent de ${A}, on simplifie par ${fx(X1)} : ${fx(`f(x) = ${forme}`)}.`,why:`Dans une limite en ${A}, x s'approche de ${A} sans jamais valoir ${A} : ${fx(X1)} n'est pas nul, on a le droit de simplifier.`,pts:1},
      {w:lmFin(P,L),why:`Il n'y a plus de forme indéterminée : on remplace x par ${A}. ${frac?`Le haut vaut ${fx(nb(nv))} et le bas vaut ${fx(nb(dv))}.`:`On trouve ${fx(nb(nv))}.`}`,pts:1}],
    diag:lu=>lu.inf?fi("l'infini","Le bas tend vers 0, mais le haut aussi : « 0/0 » est une forme indéterminée, pas l'infini."):lu.v===0?fi("0","« 0/0 » ne vaut pas 0 : c'est une forme indéterminée."):lu.v===1?fi("1","« 0/0 » ne vaut pas 1 : c'est une forme indéterminée."):null});}
function lmInterdit(R){const a=R.ent(-3,3),g=R.choix(["lin","lin","quad","carre"]),c=g==="carre"?0:R()<0.5?1:-1,P={a,c},m=g!=="lin"?1:a===0?R.choix([1,2]):R.choix([1,1,-1,2]);let al,be,r=a;
  do{al=R.ent(-3,3);be=R.ent(-5,5);}while(al*a+be===0);if(g==="quad")do r=R.ent(-4,4);while(r===a);
  const X=t=>t===0?"x":`(x ${lmSi(-t)} ${Math.abs(t)})`,X1=a===0?"x":`x ${lmSi(-a)} ${Math.abs(a)}`,A=fx(nb(a)),nv=al*a+be,num=lmPoly([be,al]),
    den=g==="carre"?(a===0?"x²":X(a)+"²"):lmPoly(g==="lin"?[-m*a,m]:[a*r,-(a+r),1]),sd=g==="carre"?1:g==="lin"?c*Math.sign(m):c*Math.sign(a-r),L={inf:Math.sign(nv)*sd},
    cote=`x est plus ${c>0?"grand":"petit"} que ${A}, donc ${fx(X1)} est ${lmSg(c)}`,note=`Le bas tend vers 0 en restant ${lmSg(sd)} : on note ${fx(sd>0?"0⁺":"0⁻")}.`,fm=coefK(m)+X(a),
    signe=g==="carre"?`Le bas est un carré : il est positif des deux côtés de ${A}. Il tend vers 0 en restant positif : on note ${fx("0⁺")}.`
      :g==="lin"?`Ici ${cote}${m===1?"":`, et le bas ${fx(den===fm?den:`${den} = ${fm}`)} est ${lmSg(sd)}`}. ${note}`
      :`Le bas se factorise : ${fx(`${den} = ${r===0?"x"+X(a):X(a)+X(r)}`)}. Ici ${cote}, et ${fx(r===0?"x":`x ${lmSi(-r)} ${Math.abs(r)}`)} tend vers ${fx(nb(a-r))}, qui est ${lmSg(a-r)}. ${note}`;
  return lmExo({sig:"I"+[a,c,g,al,be,m,r],expr:lmF(num,den),pt:P,lim:L,nature:"valeur interdite : "+g,type:"signe de l'infini",pieges:[["0","dénominateur qui tend vers 0"],[lmTp({inf:-L.inf}),"signe du dénominateur"]],
    etapes:[{w:`Quand x tend vers ${A}, le haut ${al?"tend vers":"vaut"} ${fx(nb(nv))} et le bas tend vers 0.`,why:`Le haut ne tend pas vers 0 : ce n'est pas une forme indéterminée. Un nombre non nul divisé par un nombre de plus en plus proche de 0 devient immense : la limite est ${fx("+∞")} ou ${fx("−∞")}, il reste à trouver le signe.`,pts:1},
      {w:signe,why:"Le signe du quotient vient du signe du haut et du signe du bas : il faut savoir si le bas s'approche de 0 par des nombres positifs ou par des nombres négatifs.",pts:1},
      {w:lmFin(P,L),why:`Le haut est proche de ${fx(nb(nv))}, qui est ${lmSg(nv)}. On le divise par un très petit nombre ${lmSg(sd)} : le résultat est immense, et ${lmSg(L.inf)} par la règle des signes.`,pts:1}],
    diag:lu=>lu.inf?lmD(1,"signe du dénominateur","le signe du bas.",`Regarde de quel côté de 0 le bas arrive : ici il reste ${lmSg(sd)}, et le haut est proche de ${fx(nb(nv))}.`)
      :lmD(0,"dénominateur qui tend vers 0","le type de limite.",`Le bas tend vers 0 et le haut tend vers ${fx(nb(nv))}, pas vers 0 : le quotient devient immense, il tend vers l'infini. Il reste à trouver le signe.`)});}
const lmEnA=R=>R()<0.5?lmZero(R):lmInterdit(R);
/* palier 3 : croissances comparées, et le terme le plus fort (TD 1, exercice 2 g et h) */
function lmCroiss(R){const t=R(),n=R.ent(1,3),k=R.choix([1,1,2,3]),c=R.choix([1,1,1,2,3,-1,-2]),PI={inf:1},PM={inf:-1},P0={a:0,c:1},pi=fx("+∞"),mi=fx("−∞"),xn=LMP[n],
    cours=`Croissances comparées (cours) : en ${pi}, l'exponentielle l'emporte sur toutes les puissances de x, et les puissances de x l'emportent sur ${fx("ln x")}.`,
    ii=`En ${pi}, le haut et le bas tendent tous les deux vers l'infini : c'est une forme indéterminée « ∞/∞ ».`,iiW="On ne peut pas conclure en regardant le haut et le bas séparément : il faut savoir lequel grandit le plus vite.",
    qui=msg=>lmD(1,"croissances comparées : qui l'emporte","le plus fort des deux.",msg),un=lmD(0,"« ∞/∞ » pris pour 1","la forme indéterminée.","« ∞/∞ » ne vaut pas 1 : c'est une forme indéterminée. Il faut savoir qui grandit le plus vite."),
    mult=L=>c===1?"":` Le coefficient ${fx(nb(c))} ${L.inf?(c>0?"ne change pas le signe":"change le signe"):"ne change rien : un nombre multiplié par une quantité qui tend vers 0 tend vers 0"}.`,
    E3=(P,L,w0,why0,w1,why1,why2)=>[{w:w0,why:why0,pts:1},{w:w1,why:why1,pts:1},{w:lmFin(P,L),why:why2,pts:1}];
  if(t<0.2){const prod=R()<0.5,top=lmM(c,n),q0=lmF(top,lmE(k)),L={v:Q(0)};
    return lmExo({sig:"C1"+[n,k,c,+prod],expr:prod?top+lmE(-k):q0,pt:PI,lim:L,nature:"puissance sur exponentielle",type:"croissances comparées",pieges:[["+∞","qui l'emporte"],["1","pris pour 1"]],
      etapes:E3(PI,L,prod?`On écrit le produit comme un quotient : ${fx(`f(x) = ${q0}`)}. Le haut et le bas tendent tous les deux vers l'infini : c'est une forme indéterminée « ∞/∞ ».`:ii,prod?`${fx("e^{−u} = 1/(eᵘ)")} : multiplier par ${fx(lmE(-k))}, c'est diviser par ${fx(lmE(k))}.`:iiW,
        `L'exponentielle l'emporte sur la puissance : ${fx(lmF(xn,lmE(k)))} tend vers 0.`,cours,`Le plus fort est en bas : le quotient tend vers 0.${mult(L)}`),
      diag:lu=>lu.inf?qui(`En ${pi}, l'exponentielle l'emporte sur ${fx(xn)}. Elle est en bas : le quotient tend vers 0.`):lu.v===1?un:null});}
  if(t<0.32){const L={inf:Math.sign(c)};
    return lmExo({sig:"C2"+[n,k,c],expr:lmF(coefK(c)+lmE(k),xn),pt:PI,lim:L,nature:"exponentielle sur puissance",type:"croissances comparées",pieges:[["0","qui l'emporte"]],
      etapes:E3(PI,L,ii,iiW,`L'exponentielle l'emporte sur la puissance : ${fx(lmF(lmE(k),xn))} tend vers ${pi}.`,cours,`Le plus fort est en haut : le quotient tend vers l'infini.${mult(L)}`),
      diag:lu=>lu.inf?null:lu.v===1?un:qui(`En ${pi}, l'exponentielle l'emporte sur ${fx(xn)}. Elle est en haut : le quotient tend vers l'infini.`)});}
  if(t<0.47){const haut=R()<0.5,cl=(c===1?"":c===-1?"−":c+" ")+"ln x",L=haut?{v:Q(0)}:{inf:Math.sign(c)},ou=haut?"bas : le quotient tend vers 0":"haut : le quotient tend vers l'infini";
    return lmExo({sig:"C3"+[n,c,+haut],expr:haut?lmF(cl,xn):lmF(lmM(c,n),"ln x"),pt:PI,lim:L,nature:haut?"ln sur puissance":"puissance sur ln",type:"croissances comparées",pieges:[[haut?"+∞":"0","qui l'emporte"]],
      etapes:E3(PI,L,ii,iiW,`La puissance l'emporte sur le logarithme : ${fx(haut?lmF("ln x",xn):lmF(xn,"ln x"))} tend vers ${haut?"0":pi}.`,cours,`Le plus fort est en ${ou}.${mult(L)}`),
      diag:lu=>(haut?lu.inf:!lu.inf&&lu.v!==1)?qui(`En ${pi}, ${fx(xn)} l'emporte sur ${fx("ln x")}, et il est en ${ou}.`):lu.v===1?un:null});}
  if(t<0.6){const L={v:Q(0)};
    return lmExo({sig:"C4"+[n,c],expr:lmM(c,n)+" ln x",pt:P0,lim:L,nature:"en 0⁺",type:"croissances comparées en 0",pieges:[["-∞","qui l'emporte"],["+∞","qui l'emporte"]],
      etapes:E3(P0,L,`Quand x tend vers 0 par la droite, ${fx(xn)} tend vers 0 et ${fx("ln x")} tend vers ${mi} : c'est une forme indéterminée « 0 × ∞ ».`,"« 0 × ∞ » ne se calcule pas directement : tout dépend de qui est le plus fort, la puissance qui écrase ou le logarithme qui grandit.",
        `Croissances comparées : en 0 aussi, la puissance l'emporte sur le logarithme. ${fx(xn+" ln x")} tend vers 0.`,`C'est une limite du cours : ${fx("x ln x")} tend vers 0 quand x tend vers 0 par la droite, et de même ${fx("x² ln x")}, ${fx("x³ ln x")}…`,`Le produit tend vers 0.${mult(L)}`),
      diag:lu=>lu.inf?qui(`En 0, la puissance ${fx(xn)} l'emporte sur ${fx("ln x")} : le produit tend vers 0, pas vers l'infini.`):null});}
  if(t<0.72){const fi=R()<0.5,sn=n%2?-1:1,top=lmM(c,n);
    if(!fi){const L={inf:Math.sign(c)*sn};
      return lmExo({sig:"C5"+[n,k,c],expr:top+lmE(-k),pt:PM,lim:L,nature:"en −∞, sans forme indéterminée",type:"limite d'un produit",etSigne:1,pieges:[["0","à tort"]],
        etapes:E3(PM,L,`Quand x tend vers ${mi}, l'exposant ${fx(ex1(-k))} tend vers ${pi} : ${fx(lmE(-k))} tend vers ${pi}.`,`Regarde toujours vers quoi tend l'exposant : ${fx("eᵘ")} tend vers ${pi} quand u tend vers ${pi}, et vers 0 quand u tend vers ${mi}.`,
          `${fx(top)} tend vers ${fx(lmInf(L.inf))}.`,`${n===1?"C'est x lui-même, qui":`${n%2?"Une puissance impaire garde le signe moins de x":"Une puissance paire est toujours positive"} : ${fx(xn)}`} tend vers ${fx(lmInf(sn))}.${c===1?"":` Le coefficient ${fx(nb(c))} ${c>0?"ne change pas le signe":"change le signe"}.`}`,
          "Ce n'est pas une forme indéterminée : les deux facteurs tendent vers l'infini, leur produit aussi, avec le signe donné par la règle des signes."),
        diag:lu=>lu.inf?lmD(1,"signe d'une puissance en −∞","le signe.",`${fx(top)} tend vers ${fx(lmInf(L.inf))}, et l'exponentielle tend vers ${pi}.`)
          :lmD(0,"croissances comparées appliquées à tort","la limite de l'exponentielle.",`En ${mi}, ${fx(lmE(-k))} ne tend pas vers 0 : son exposant ${fx(ex1(-k))} tend vers ${pi}. Il n'y a pas de forme indéterminée ici.`)});}
    const L={v:Q(0)};
    return lmExo({sig:"C6"+[n,k,c],expr:top+lmE(k),pt:PM,lim:L,nature:"en −∞",type:"croissances comparées",pieges:[["-∞","qui l'emporte"],["+∞","qui l'emporte"]],
      etapes:E3(PM,L,`Quand x tend vers ${mi}, ${fx(xn)} tend vers ${fx(lmInf(sn))} et ${fx(lmE(k))} tend vers 0 : c'est une forme indéterminée « ∞ × 0 ».`,`L'exposant ${fx(ex1(k))} tend vers ${mi}, donc l'exponentielle tend vers 0.`,
        `L'exponentielle l'emporte encore sur la puissance : ${fx(xn+lmE(k))} tend vers 0.`,`Pose ${fx("X = −x")}, qui tend vers ${pi}. Au signe près, ${fx(xn+lmE(k))} vaut ${fx(lmF(xn.replace("x","X"),`e^{${k===1?"":k}X}`))} : une puissance divisée par une exponentielle, qui tend vers 0 par croissances comparées.`,`Le produit tend vers 0.${mult(L)}`),
      diag:lu=>lu.inf?qui(`L'exponentielle l'emporte sur la puissance, en ${mi} aussi : ${fx(xn+lmE(k))} tend vers 0.`):null});}
  const u=R();
  if(u<0.4){const k2=R.choix([1,2]),a=R.nz(-4,4),cq=R.nz(-4,4),b=R.nz(-5,5),dd=R.nz(-5,5),m=R.ent(1,3),ek=lmE(k2),em=lmE(-k2),L={v:Q(a,cq)},
      ligne=(a1,b1,n1)=>`${coefK(a1)}${ek} ${lmSi(b1)} ${lmM(Math.abs(b1),n1)}`,dans=(a1,b1,n1)=>`${nb(a1)} ${lmSi(b1)} ${lmM(Math.abs(b1),n1)}${em}`,top=ligne(a,b,n),bot=ligne(cq,dd,m),autre=b*cq!==a*dd;
    return lmExo({sig:"C7"+[k2,a,b,n,cq,dd,m],expr:lmF(top,bot),pt:PI,lim:L,nature:"terme le plus fort, quotient",type:"terme le plus fort",pieges:[["+∞","pris pour l'infini"]].concat(autre?[[brut(Q(b,dd)),"mal choisi"]]:[]),
      etapes:E3(PI,L,`On met en facteur le terme le plus fort, ${fx(ek)}, en haut et en bas. En haut : ${fx(`${top} = ${ek}(${dans(a,b,n)})`)}. En bas : ${fx(`${bot} = ${ek}(${dans(cq,dd,m)})`)}.`,
        `Le haut et le bas tendent vers l'infini : c'est une forme indéterminée « ∞/∞ ». En ${pi}, l'exponentielle l'emporte sur les puissances de x : c'est elle, le terme le plus fort. Et diviser par ${fx(ek)}, c'est multiplier par ${fx(em)}.`,
        `On simplifie par ${fx(ek)} : ${fx(`f(x) = ${lmF(dans(a,b,n),dans(cq,dd,m))}`)}. Les morceaux en ${fx(em)} tendent vers 0.`,`${fx(`${xn}${em} = ${lmF(xn,ek)}`)} est une puissance divisée par une exponentielle : elle tend vers 0 par croissances comparées${m!==n?`, et ${fx(LMP[m]+em)} aussi`:""}.`,
        `Il reste ${fx(nb(a))} en haut et ${fx(nb(cq))} en bas.`),
      diag:lu=>lu.inf?lmD(0,"« ∞/∞ » pris pour l'infini","la forme indéterminée.","Le haut tend vers l'infini, mais le bas aussi : « ∞/∞ » est une forme indéterminée. Mets le terme le plus fort en facteur.")
        :autre&&pres(lu.v,b/dd)?lmD(0,"terme le plus fort mal choisi","le terme le plus fort.",`Ce sont les exponentielles qui décident, pas les puissances de x : garde les coefficients de ${fx(ek)}, ${fx(nb(a))} en haut et ${fx(nb(cq))} en bas.`):lu.v===1?un:null});}
  if(u<0.75){const ex=R()<0.5,a=R.choix([1,1,2,-1,-2]),b=-Math.sign(a)*R.ent(1,5),n1=ex?n:R.choix([1,1,2]),fort=ex?lmE(k):LMP[n1],bl=(Math.abs(b)===1?"":Math.abs(b)+" ")+"ln x",petit=ex?xn+lmE(-k):lmF("ln x",fort),
      expr=ex?`${coefK(a)}${fort} ${lmSi(b)} ${lmM(Math.abs(b),n)}`:`${lmM(a,n1)} ${lmSi(b)} ${bl}`,dans=`${nb(a)} ${lmSi(b)} ${ex?lmM(Math.abs(b),n)+lmE(-k):lmF(bl,fort)}`,L={inf:Math.sign(a)};
    return lmExo({sig:"C8"+[+ex,a,b,n,k,n1],expr,pt:PI,lim:L,nature:"terme le plus fort, différence",type:"terme le plus fort",pieges:[["0","pris pour un nombre"],[lmTp({inf:-L.inf}),"mal choisi"]],
      etapes:E3(PI,L,`On met en facteur le terme le plus fort, ${fx(fort)} : ${fx(`f(x) = ${fort}(${dans})`)}.`,`Les deux termes tendent vers l'infini avec des signes contraires : c'est une forme indéterminée « ∞ − ∞ ». ${cours}`,
        `La parenthèse tend vers ${fx(nb(a))}, car ${fx(petit)} tend vers 0.`,ex?`${fx(`${xn}${lmE(-k)} = ${lmF(xn,lmE(k))}`)} : une puissance divisée par une exponentielle tend vers 0, par croissances comparées.`:"Un logarithme divisé par une puissance de x tend vers 0, par croissances comparées.",
        `${fx(fort)} tend vers ${pi}, et on le multiplie par un nombre proche de ${fx(nb(a))}, qui est ${a>0?"positif : la limite est "+pi:"négatif : la limite est "+mi}.`),
      diag:lu=>lu.inf?lmD(0,"terme le plus fort mal choisi","le terme le plus fort.",`C'est ${fx(fort)} qui l'emporte, et son coefficient est ${lmSg(a)}.`)
        :lmD(0,"« ∞ − ∞ » pris pour un nombre","la forme indéterminée.","« ∞ − ∞ » ne vaut pas 0 : c'est une forme indéterminée. Mets le terme le plus fort en facteur.")});}
  const n2=R.choix([1,2]),be=R.nz(-4,4),al=R.ent(-3,3),num=lmPoly([be,al]),den=LMP[n2]+" ln x",L={inf:-Math.sign(be)};
  return lmExo({sig:"C9"+[n2,al,be],expr:lmF(num,den),pt:P0,lim:L,nature:"en 0⁺, comme au TD",type:"limite d'un quotient",pieges:[["0","dénominateur qui tend vers 0"],[lmTp({inf:-L.inf}),"signe de ln x"]],
    etapes:E3(P0,L,`Quand x tend vers 0 par la droite, le haut ${al?"tend vers":"vaut"} ${fx(nb(be))}.`,al?`On remplace x par 0 dans ${fx(num)}.`:"Le haut ne dépend pas de x.",
      `Le bas ${fx(den)} tend vers 0 en restant négatif : on note ${fx("0⁻")}.`,`Croissances comparées : ${fx(den)} tend vers 0 quand x tend vers 0 par la droite (la puissance l'emporte sur le logarithme). Et près de 0, ${fx("ln x")} est négatif alors que ${fx(LMP[n2])} est positif.`,
      `Le haut est proche de ${fx(nb(be))}, qui est ${lmSg(be)}. On le divise par un très petit nombre négatif : le résultat est immense, et ${lmSg(L.inf)} par la règle des signes.`),
    diag:lu=>lu.inf?lmD(1,"signe de ln x près de 0","le signe du bas.",`Près de 0, ${fx("ln x")} est négatif : le bas tend vers 0 en restant négatif.`)
      :lmD(1,"dénominateur qui tend vers 0","la limite du bas.",`Le bas tend vers 0 (croissances comparées) et le haut tend vers ${fx(nb(be))} : le quotient devient immense, il tend vers l'infini.`)});}
/* palier 4 : un taux d'accroissement (f(x) − f(a))/(x − a), qui tend vers f′(a) */
const LM_G={
 sin:a=>({top:`sin(${ex1(a)})`,f:`sin(${ex1(a)})`,f0:"0",d:`${coefK(a)}cos(${ex1(a)})`,d0:a,r:`${fx("(sin(kx))′ = k cos(kx)")}, et ${fx("cos 0 = 1")}`}),
 exp:a=>({top:`${lmE(a)} − 1`,f:lmE(a),f0:"1",d:coefK(a)+lmE(a),d0:a,r:`${fx("(e^{kx})′ = ke^{kx}")}, et ${fx("e⁰ = 1")}`}),
 ln:a=>{const u=`1 ${lmSi(a)} ${lmM(Math.abs(a),1)}`;return {top:`ln(${u})`,f:`ln(${u})`,f0:"0",d:lmF(nb(a),u),d0:a,r:`${fx("(ln u)′ = u′/u")}, et en 0 le bas vaut 1`};},
 cos:a=>({top:`cos(${ex1(a)}) − 1`,f:`cos(${ex1(a)})`,f0:"1",d:`${coefK(-a)}sin(${ex1(a)})`,d0:0,r:`${fx("(cos(kx))′ = −k sin(kx)")}, et ${fx("sin 0 = 0")}`})};
function lmTaux(R){const t=R(),P0={a:0,c:0},defi=`Le taux d'accroissement de f en a est ${fx("(f(x) − f(a))/(x − a)")}. Quand x tend vers a, il tend vers le nombre dérivé ${fx("f′(a)")} : c'est la définition de la dérivée.`,
    zi=X=>lmD(0,"« 0/0 » pris pour l'infini","la forme indéterminée.",`Le bas tend vers 0, mais le haut aussi : « 0/0 » est une forme indéterminée, pas l'infini. ${X}`),zz=X=>lmD(0,"« 0/0 » pris pour 0","la forme indéterminée.",`« 0/0 » ne vaut pas 0 : c'est une forme indéterminée. ${X}`),
    tire=g=>LM_G[g](g==="sin"||g==="cos"?R.ent(1,5):R()<0.7?R.ent(1,4):-R.ent(1,3));
  if(t<0.5){const g=R.choix(["sin","sin","exp","exp","ln","cos"]),o=tire(g),b=R.choix([1,1,2,3,4,5]),L={v:Q(o.d0,b)},tx=lmF(o.top,"x"),rec="Reconnais un taux d'accroissement en 0.";
    return lmExo({sig:"T1"+[o.top,b],expr:lmF(o.top,lmM(b,1)),pt:P0,lim:L,nature:"en 0 : "+g,type:"taux d'accroissement",faux:o.d0?"0":"1",
      pieges:[["+∞","pris pour l'infini"]].concat(o.d0?[["0","pris pour 0"]]:[["1","dérivée en 0"]],o.d0&&o.d0!==b?[["1","coefficient"]]:[],o.d0&&Math.abs(o.d0)!==b?[[brut(Q(b,o.d0)),"inversé"]]:[]),
      etapes:[{w:`Quand x tend vers 0, le haut et le bas tendent vers 0 : c'est une forme indéterminée « 0/0 ». On reconnaît un taux d'accroissement : avec ${fx(`g(x) = ${o.f}`)}, on a ${fx(`g(0) = ${o.f0}`)}, donc le haut est ${fx("g(x) − g(0)")}.`,why:`${defi} Ici a = 0.`,pts:1},
        {w:`${fx(`g′(x) = ${o.d}`)}, donc ${fx(`g′(0) = ${nb(o.d0)}`)} : ${fx(tx)} tend vers ${fx(nb(o.d0))}.`,why:`${o.r}.`,pts:1},
        {w:lmFin(P0,L),why:b===1?"C'est exactement ce taux d'accroissement.":`${fx(`f(x) = (1/${b}) × ${tx}`)} : on divise la limite du taux d'accroissement par ${b}.`,pts:1}],
      diag:lu=>lu.inf?zi(rec):!o.d0?(lu.v===1?lmD(1,"dérivée en 0 mal calculée","la dérivée.",`${o.r} : le taux d'accroissement tend vers 0, pas vers 1.`):null):lu.v===0?zz(rec)
        :lu.v===1?lmD(1,"coefficient de x oublié","la dérivée.",`${fx("(sin x)/x")} et ${fx("(eˣ − 1)/x")} tendent vers 1, mais ici x a un coefficient : la dérivée en 0 vaut ${fx(nb(o.d0))}${b===1?"":`, et on divise par ${b}`}.`)
        :Math.abs(o.d0)!==b&&pres(lu.v,b/o.d0)?lmD(2,"quotient inversé","la conclusion.",`La dérivée en 0 vaut ${fx(nb(o.d0))}, et c'est elle qu'on divise par ${b}.`):null});}
  if(t<0.75){const a=R.choix([1,1,1,2,-1,3]),n=R.ent(2,a===3?3:a===2?4:5),an=a**n,d0=n*a**(n-1),inv=R()<0.4,P={a,c:0},A=fx(nb(a)),haut=`${LMP[n]} ${lmSi(-an)} ${Math.abs(an)}`,bas=`x ${lmSi(-a)} ${Math.abs(a)}`,tx=lmF(haut,bas),L={v:inv?Q(1,d0):Q(d0)},
      calc=a===1?`g′(1) = ${n}`:`g′(${nb(a)}) =${n} × ${a<0?"(−1)":a}${n>2?"⁰¹²³⁴"[n-1]:""} = ${nb(d0)}`,rec=`Reconnais le taux d'accroissement de ${fx(LMP[n])} en ${A}.`;
    return lmExo({sig:"T2"+[a,n,+inv],expr:inv?lmF(bas,haut):tx,pt:P,lim:L,nature:inv?"xⁿ, inverse":"xⁿ",type:"taux d'accroissement",pieges:[["+∞","pris pour l'infini"],["0","pris pour 0"],["1","pris pour 1"],[brut(inv?Q(d0):Q(1,d0)),"invers"]],
      etapes:[{w:`Quand x tend vers ${A}, le haut et le bas tendent vers 0 : c'est une forme indéterminée « 0/0 ». Avec ${fx(`g(x) = ${LMP[n]}`)}, on a ${fx(`g(${nb(a)}) = ${nb(an)}`)} : ${fx(tx)} est le taux d'accroissement de g en ${A}.${inv?" Notre fonction est son inverse.":""}`,why:defi,pts:1},
        {w:`${fx(`g′(x) = ${n}${LMP[n-1]}`)}, donc ${fx(calc)} : le taux d'accroissement tend vers ${fx(nb(d0))}.`,why:`${fx("(xⁿ)′ = nxⁿ⁻¹")}.`,pts:1},
        {w:lmFin(P,L),why:inv?`L'inverse d'une quantité qui tend vers ${fx(nb(d0))} (pas vers 0) tend vers ${fx(nb(Q(1,d0)))}.`:"C'est exactement ce taux d'accroissement.",pts:1}],
      diag:lu=>lu.inf?zi(rec):lu.v===0?zz(rec):lu.v===1?lmD(0,"« 0/0 » pris pour 1","la forme indéterminée.",`« 0/0 » ne vaut pas 1 : c'est une forme indéterminée. ${rec}`)
        :pres(lu.v,inv?d0:1/d0)?lmD(2,inv?"inverse oublié":"quotient inversé","la conclusion.",inv?`${fx(nb(d0))} est la limite de ${fx(tx)}. Notre fonction est son inverse : sa limite est ${fx(nb(Q(1,d0)))}.`:`Le taux d'accroissement est ${fx(tx)} : il tend vers ${fx(`g′(${nb(a)}) = ${nb(d0)}`)}.`):null});}
  let o1,o2;do{o1=tire(R.choix(["sin","exp","ln"]));o2=tire(R.choix(["sin","sin","exp","ln"]));}while(o1.d0===o2.d0);
  const L={v:Q(o1.d0,o2.d0)},t1=lmF(o1.top,"x"),t2=lmF(o2.top,"x"),rec="Divise le haut et le bas par x : deux taux d'accroissement apparaissent.",inverse=Math.abs(o1.d0)!==Math.abs(o2.d0);
  return lmExo({sig:"T3"+[o1.top,o2.top],expr:lmF(o1.top,o2.top),pt:P0,lim:L,nature:"deux taux d'accroissement",type:"taux d'accroissement",pieges:[["+∞","pris pour l'infini"],["0","pris pour 0"],["1","coefficients"]].concat(inverse?[[brut(Q(o2.d0,o1.d0)),"inversé"]]:[]),
    etapes:[{w:`Quand x tend vers 0, le haut et le bas tendent vers 0 : c'est une forme indéterminée « 0/0 ». On divise le haut et le bas par x : le quotient ne change pas, et deux taux d'accroissement en 0 apparaissent, ${fx(t1)} en haut et ${fx(t2)} en bas.`,why:`${defi} Ici a = 0, avec ${fx(o1.f)} en haut et ${fx(o2.f)} en bas.`,pts:1},
      {w:`${fx(t1)} tend vers ${fx(nb(o1.d0))}, et ${fx(t2)} tend vers ${fx(nb(o2.d0))}.`,why:`Chaque taux d'accroissement tend vers la dérivée en 0. ${o1.r===o2.r?`En haut comme en bas : ${o1.r}`:`En haut : ${o1.r}. En bas : ${o2.r}`}.`,pts:1},
      {w:lmFin(P0,L),why:`Le haut tend vers ${fx(nb(o1.d0))} et le bas vers ${fx(nb(o2.d0))}, qui n'est pas 0 : la limite est le quotient des deux.`,pts:1}],
    diag:lu=>lu.inf?zi(rec):lu.v===0?zz(rec):lu.v===1?lmD(1,"coefficients de x oubliés","les dérivées.",`Les deux taux d'accroissement ne tendent pas vers 1 : en haut la dérivée en 0 vaut ${fx(nb(o1.d0))}, en bas ${fx(nb(o2.d0))}.`)
      :inverse&&pres(lu.v,o2.d0/o1.d0)?lmD(2,"quotient inversé","la conclusion.",`C'est la limite du haut divisée par celle du bas : ${fx(nb(o1.d0))} divisé par ${fx(nb(o2.d0))}.`):null});}
/* palier 5 : des racines, la quantité conjuguée (TD 1, exercice 2 d) */
function lmConj(R){const t=R(),PI={inf:1},pi=fx("+∞"),rac=(p,a)=>`√(${p} ${lmSi(a)} ${lmM(Math.abs(a),1)})`,conj=`${fx("(A − B)(A + B) = A² − B²")} : les racines du haut disparaissent, car le carré d'une racine redonne ce qu'il y a dessous.`,
    zz=lmD(0,"« 0/0 » pris pour 0","la forme indéterminée.","« 0/0 » ne vaut pas 0 : c'est une forme indéterminée. Avec des racines, multiplie en haut et en bas par la quantité conjuguée."),
    zi=lmD(0,"« 0/0 » pris pour l'infini","la forme indéterminée.","Le bas tend vers 0, mais le haut aussi : « 0/0 » est une forme indéterminée, pas l'infini. Multiplie en haut et en bas par la quantité conjuguée."),
    nonLevee=lmD(0,"forme indéterminée non levée","la forme indéterminée.","Les deux termes tendent vers l'infini, mais leur différence reste bornée : il faut la quantité conjuguée pour le voir."),
    deux=(v,quoi)=>lmD(2,"somme des deux termes du bas","la limite du bas.",`Le bas est une somme de deux ${quoi} qui tendent chacun vers ${v} : il tend vers ${2*v}, pas vers ${v}.`);
  if(t<0.3){const rp=R.choix([1,1,2,3]),p=rp*rp,c=R.choix([1,1,2,3]),a=R.nz(-4,4);let b;do b=R.nz(-4,4);while(b===a);
    const A=rac(p,a),B=rac(p,b),cx=lmM(c,1),P={a:0,c:0},L={v:Q(a-b,2*c*rp)},dx=lmM(a-b,1),som=`${A} + ${B}`,bas=c===1?som:`${c}(${som})`;
    return lmExo({sig:"R1"+[p,a,b,c],expr:lmF(`${A} − ${B}`,cx),pt:P,lim:L,nature:"en 0, deux racines",type:"quantité conjuguée",pieges:[["0","pris pour 0"],["+∞","pris pour l'infini"],[brut(Q(a-b,c*rp)),"somme des deux"]],
      etapes:[{w:`Quand x tend vers 0, le haut tend vers ${fx(`${rp} − ${rp} = 0`)} et le bas aussi : c'est une forme indéterminée « 0/0 », avec des racines. On multiplie en haut et en bas par la quantité conjuguée ${fx(som)}.`,why:conj,pts:1},
        {w:`En haut, il reste ${fx(`(${p} ${lmSi(a)} ${lmM(Math.abs(a),1)}) − (${p} ${lmSi(b)} ${lmM(Math.abs(b),1)}) = ${dx}`)}. On simplifie par x : ${fx(`f(x) = ${lmF(nb(a-b),bas)}`)}.`,why:`Avant de simplifier, ${fx(`f(x) = ${lmF(dx,`${cx}(${som})`)}`)}. Et x n'est pas nul quand il tend vers 0 : on a le droit de simplifier.`,pts:1},
        {w:lmFin(P,L),why:`Il n'y a plus de forme indéterminée : on remplace x par 0. Chaque racine tend vers ${fx(`√${p} = ${rp}`)}, donc le bas tend vers ${fx(`${c===1?"":c+" × "}(${rp} + ${rp}) = ${2*c*rp}`)}.`,pts:1}],
      diag:lu=>lu.inf?zi:lu.v===0?zz:pres(lu.v,(a-b)/(c*rp))?deux(rp,"racines"):null});}
  if(t<0.5){const rp=R.choix([1,2,2,3]),x0=R.ent(-2,5),s=rp*rp-x0,c=R.choix([1,1,2]),dedans=s?`x ${lmSi(s)} ${Math.abs(s)}`:"x",A=s?`√(${dedans})`:"√x",P={a:x0,c:0},X1=x0?`x ${lmSi(-x0)} ${Math.abs(x0)}`:"x",L={v:Q(1,2*c*rp)},som=`${A} + ${rp}`,X0=fx(nb(x0));
    return lmExo({sig:"R2"+[rp,x0,c],expr:lmF(`${A} − ${rp}`,lmPoly([-c*x0,c])),pt:P,lim:L,nature:"en un nombre, une racine",type:"quantité conjuguée",pieges:[["0","pris pour 0"],["+∞","pris pour l'infini"],[brut(Q(1,c*rp)),"somme des deux"]],
      etapes:[{w:`Quand x tend vers ${X0}, le haut tend vers ${fx(`√${rp*rp} − ${rp} = 0`)} et le bas aussi : c'est une forme indéterminée « 0/0 », avec une racine. On multiplie en haut et en bas par la quantité conjuguée ${fx(som)}.`,why:conj,pts:1},
        {w:`En haut, il reste ${fx(`${s?`(${dedans})`:"x"} − ${rp*rp} = ${X1}`)}. On simplifie par ${fx(X1)} : ${fx(`f(x) = ${lmF(1,c===1?som:`${c}(${som})`)}`)}.`,why:`Avant de simplifier, ${fx(`f(x) = ${lmF(X1,`${c===1?"":c}${x0?`(${X1})`:"x"}(${som})`)}`)}. Et ${fx(X1)} n'est pas nul quand x tend vers ${X0} sans l'atteindre : on a le droit de simplifier.`,pts:1},
        {w:lmFin(P,L),why:`Il n'y a plus de forme indéterminée : on remplace x par ${X0}. La racine tend vers ${rp}, donc le bas tend vers ${fx(`${c===1?"":c+" × "}(${rp} + ${rp}) = ${2*c*rp}`)}.`,pts:1}],
      diag:lu=>lu.inf?zi:lu.v===0?zz:pres(lu.v,1/(c*rp))?deux(rp,"termes"):null});}
  if(t<0.8){const k=R.choix([1,1,2,3]),a=R.nz(-6,6),b=R()<0.5?0:R.ent(1,5),ins=lmPoly([b,a,k*k]),A=`√(${ins})`,kx=lmM(k,1),L={v:Q(a,2*k)},num=lmPoly([b,a]),som=`${A} + ${kx}`;
    return lmExo({sig:"R3"+[k,a,b],expr:`${A} − ${kx}`,pt:PI,lim:L,nature:"en +∞, une racine moins kx",type:"quantité conjuguée",pieges:[["0","pris pour 0"],["+∞","non levée"],[brut(Q(a,k)),"somme des deux"]],
      etapes:[{w:`En ${pi}, les deux termes tendent vers ${pi} : c'est une forme indéterminée « ∞ − ∞ ». On multiplie et on divise par la quantité conjuguée ${fx(som)} : ${fx(`f(x) = ${lmF(num,som)}`)}.`,why:`${fx("(A − B)(A + B) = A² − B²")} : en haut, ${fx(`(${ins}) − ${lmM(k*k,2)} = ${num}`)}. La racine a disparu du haut.`,pts:1},
        {w:`On divise le haut et le bas par x : ${fx(`f(x) = ${lmF(lmDiv([b,a],1),`√(${lmDiv([b,a,k*k],2)}) + ${k}`)}`)}.`,why:`Pour x positif, ${fx("x = √(x²)")} : diviser une racine par x, c'est diviser par ${fx("x²")} ce qu'il y a dessous.`,pts:1},
        {w:lmFin(PI,L),why:`${b?`Les morceaux ${fx("1/x")} et ${fx("1/(x²)")} tendent`:`${fx("1/x")} tend`} vers 0 : le haut ${b?"tend vers":"vaut"} ${fx(nb(a))}, le bas vers ${fx(`√${k*k} + ${k} = ${2*k}`)}.`,pts:1}],
      diag:lu=>lu.inf?nonLevee:lu.v===0?lmD(0,"« ∞ − ∞ » pris pour 0","la forme indéterminée.","Deux quantités qui tendent vers l'infini ne s'annulent pas forcément : « ∞ − ∞ » est une forme indéterminée. Il faut la quantité conjuguée.")
        :pres(lu.v,a/k)?deux(k,"termes"):null});}
  const kk=R.choix([1,1,2,4]),a=R.ent(0,9),L={v:Q(0)};let b;do b=R.ent(0,9);while(b===a);
  const iA=lmPoly([a,kk]),iB=lmPoly([b,kk]),rc=i=>/ /.test(i)||i.length>1?`√(${i})`:"√"+i,A=rc(iA),B=rc(iB),som=`${A} + ${B}`;
  return lmExo({sig:"R4"+[kk,a,b],expr:`${A} − ${B}`,pt:PI,lim:L,nature:"en +∞, deux racines",type:"quantité conjuguée",faux:"+∞",pieges:[["+∞","non levée"],[brut(Q(a-b)),"dénominateur oublié"]],
    etapes:[{w:`En ${pi}, les deux racines tendent vers ${pi} : c'est une forme indéterminée « ∞ − ∞ ». On multiplie et on divise par la quantité conjuguée ${fx(som)} : ${fx(`f(x) = ${lmF(nb(a-b),som)}`)}.`,why:`${fx("(A − B)(A + B) = A² − B²")} : en haut, ${fx(`(${iA}) − ${/ /.test(iB)?`(${iB})`:iB} = ${nb(a-b)}`.replace(/^\(([^ ]+)\)/,"$1"))}. Les x ont disparu.`,pts:1},
      {w:`Le haut vaut ${fx(nb(a-b))}, et le bas tend vers ${pi}.`,why:`Le bas est une somme de deux racines qui tendent vers ${pi}.`,pts:1},
      {w:lmFin(PI,L),why:"Un nombre fixe divisé par une quantité de plus en plus grande tend vers 0.",pts:1}],
    diag:lu=>lu.inf?nonLevee:pres(lu.v,a-b)?lmD(1,"dénominateur oublié","la limite du bas.",`${fx(nb(a-b))} est seulement le haut : il est divisé par ${fx(som)}, qui tend vers l'infini.`):null});}
const lmMix=R=>R.choix([lmQuot,lmEnA,lmCroiss,lmTaux,lmConj])(R);

/* ---------- CA15 : domaine de définition (TD 1, exercice 3 ; CC1 2025, exercice 1 a ; CC 2023, exercice 3) ----------
   La réponse est un intervalle ou une réunion d'intervalles ; « ℝ∖{…} », ℝ* et ℝ₊ sont lus aussi (dmLis).
   Le contrôle relit ens.expr et regarde, point par point, où elle se calcule. */
const DM_SYM=[["]","]"],["[","["],[";"," ; "],["∪"," ∪ "],["+∞","+∞"],["−∞","-∞"],["ℝ","ℝ"],["∖","∖"],["{","{"],["}","}"]];
const DM_CRO="Un crochet est fermé quand la borne est permise (une racine accepte 0), ouvert quand elle est interdite (ln(0) et la division par 0 n'existent pas), et toujours ouvert du côté de l'infini.";
const dmGT="&gt;",dmLT="&lt;";
const dmI=(a,oa,b,ob)=>G.ana.pc(a==null?null:G.ana.val(a),oa,b==null?null:G.ana.val(b),ob),dmR=()=>[dmI(null,true,null,true)];
const dmTout=P=>P.length===1&&!P[0].a&&!P[0].b;
const dmEcrit=(P,t)=>dmTout(P)?"ℝ":P.map(p=>`${p.oa?"]":"["}${p.a?(t?brut(p.a.q):p.a.t):t?"-∞":"−∞"} ; ${p.b?(t?brut(p.b.q):p.b.t):"+∞"}${p.ob?"[":"]"}`).join(" ∪ ");
const dmT=P=>dmEcrit(P,false),dmTp=P=>dmEcrit(P,true);
const dmTri=v=>[...new Set(v)].sort((x,y)=>x-y);
/* ℝ privé de quelques entiers */
const dmSauf=(...v)=>{v=dmTri(v);return v.map((x,i)=>dmI(i?v[i-1]:null,true,x,true)).concat([dmI(v[v.length-1],true,null,true)]);};
const dmAcc=(...v)=>`ℝ ∖ {${dmTri(v).map(x=>nb(x)).join(" ; ")}}`;
const dmDemi=(r,droite,st)=>droite?dmI(r,st,null,true):dmI(null,true,r,st);
const dmAff=(a,b)=>a<0&&b>0?`${b} − ${lmM(-a,1)}`:lmPoly([b,a]);
const dmFac=r=>r?`(x ${r>0?"−":"+"} ${Math.abs(r)})`:"x";
function dmLis(src){const s=propre(src).replace(/\s+/g,"").replace(/^d_?f?=/i,"").replace(/privéde|privede|\\|-(?=\{)/gi,"∖");
  const m0=/^r(\*?)([+-]?)(\*?)$/i.exec(s.replace(/[\^_]/g,""));
  if(m0&&(m0[1]||m0[2]||m0[3])){if(m0[1]&&m0[3])return null;return m0[2]?[dmDemi(0,m0[2]==="+",!!(m0[1]||m0[3]))]:dmSauf(0);}
  const k=s.indexOf("∖");if(k<0)return G.ana.lisEns(s);
  const E0=G.ana.lisEns(s.slice(0,k)),m=/^\{(.+)\}$/.exec(s.slice(k+1));if(!E0||E0==="ordre"||!m)return null;
  let P=E0;
  for(const t of m[1].split(m[1].includes(";")?";":",")){const v=O.calcule(t,{});if(v===null||!Number.isFinite(v))return null;
    P=P.flatMap(p=>{const g=p.a?p.a.v:-Infinity,d=p.b?p.b.v:Infinity,z=x=>Math.abs(v-x)<1e-9;
      return z(g)&&z(d)?[]:z(g)?[{...p,oa:true}]:z(d)?[{...p,ob:true}]:v<g||v>d?[p]:[{a:p.a,oa:p.oa,b:{v},ob:true},{a:{v},oa:true,b:p.b,ob:p.ob}];});}
  return P;}
/* « ax + b ≥ 0 » (ou > 0) résolue : la demi-droite, la phrase et sa raison */
function dmCond(a,b,st){const r=Q(b?-b:0,a),dr=a>0,u=dmAff(a,b),op=st?dmGT:"≥",o2=dr?op:st?dmLT:"≤",sol=`x ${o2} ${nb(r)}`,cond=`${u} ${op} 0`,dep=b?`On ${b>0?"retire":"ajoute"} ${Math.abs(b)} des deux côtés`:"";
  const w=a===1&&!b?`La condition porte directement sur x : ${fx(sol)}.`:a===1||!b?`${fx(cond)} donne ${fx(sol)}.`:`${fx(cond)} donne ${fx(`${lmM(a,1)} ${op} ${nb(-b)}`)}, donc ${fx(sol)}.`;
  const why=a===1?(b?dep+".":"Il n'y a rien à résoudre."):`${b?dep+", puis on":"On"} divise par ${nb(a)}, qui est ${a>0?"positif : le sens de l'inégalité ne change pas":"négatif : le sens de l'inégalité change"}.`;
  return {r,rv:(b?-b:0)/a,dr,st,u,op,sol,cond,w,why,P:dmDemi(r,dr,st)};}
/* o : {sig, expr, P, etapes, nature, type, pieges:[[ensemble faux, type, titre, message, étape]], crochets, acc, note} */
function dmExo(o){const {unir,memeEns}=G.ana,U=X=>unir(X.map(p=>({...p}))),P=U(o.P),bon=dmT(P),E0=o.etapes,dern=E0.length-1,vus=[P],pg=[];
  for(const g of o.pieges||[]){const X=U(g[0]);if(vus.some(V=>memeEns(V,X)))continue;vus.push(X);pg.push({X,type:g[1],titre:g[2],msg:g[3],et:g[4]==null?dern:g[4]});}
  function juge(rep){const L=dmLis(rep.D);
    if(L==="ordre")return {incomplet:"Dans un intervalle, la borne de gauche est la plus petite. Vérifie l'ordre de tes deux bornes."};
    if(!L)return {incomplet:"Écris un intervalle ou une réunion d'intervalles, par exemple ]-∞ ; 2[ ∪ ]2 ; +∞[. Tu peux aussi écrire ℝ∖{2}, et ℝ pour tous les réels."};
    if(memeEns(L,P))return {ok:true};
    const g=pg.find(g=>memeEns(L,g.X));
    const d=g?lmD(g.et,g.type,g.titre,g.msg):!L.length?lmD(0,"domaine déclaré vide","le domaine.",`Il y a des x pour lesquels f(x) se calcule : ${fx(`D = ${bon}`)}.`)
      :memeEns(L,P,true)?lmD(dern,"crochets ouverts ou fermés","les crochets.",`Les bornes sont justes, mais pas les crochets. ${o.crochets||DM_CRO} Ici ${fx(`D = ${bon}`)}.`)
      :lmD(dern,o.type,"le domaine.",`${fx(`D = ${bon}`)}.`);
    return {ok:false,faux:["D"],resume:"Pas tout à fait : ce n'est pas le bon domaine.",diag:d};}
  return {sig:"DM"+o.sig,q:`Donne le domaine de définition D de la fonction ${fx(`f(x) = ${o.expr}`)}. Écris D comme un intervalle ou une réunion d'intervalles.`,corps:o.note?`<p class="muted">${o.note}</p>`:"",texte:`domaine de définition de ${o.expr}`,
    champs:[{k:"champ",id:"D",nom:"D",label:"$D =$",ex:"par exemple ]-∞ ; 2[ ∪ ]2 ; +∞[",sym:DM_SYM,aide:"Pour tous les réels, écris ℝ. Pour « tous les réels sauf 2 », tu peux écrire ℝ∖{2}."}],juge,etapes:E0,
    bonne:fx(`D = ${bon}`),bonneTxt:`D = ${bon}`,repBonne:{D:dmTp(P)},repFausse:{D:pg.length?dmTp(pg[0].X):dmTout(P)?"]0 ; +∞[":"ℝ"},nature:o.nature,
    ens:{expr:o.expr,aff:bon,acc:o.acc||"",pieges:pg.map(g=>[dmTp(g.X),g.type])}};}
/* palier 1 : une racine ou un logarithme d'un ax + b */
function dmSimple(R,rappel){const ln=R()<0.5,a=R.nz(-4,4),b=R.ent(-9,9),K=dmCond(a,b,ln),c=`${ln?"ln":"√"}(${K.u})`,k=R.ent(2,5),dk=R.ent(0,5),r=K.r,br=fx(nb(r)),
    expr=[c,`x² + ${c}`,`${k}x − ${c}`,`${c} + ${k}`,`x${ln?" ":""}${c}`,`(x² + 1)${c}`][dk];
  return dmExo({sig:"S"+[ln?1:0,a,b,dk,dk===2||dk===3?k:0],expr,P:[K.P],nature:ln?"un logarithme":"une racine",type:"domaine d'une racine ou d'un logarithme",
    note:rappel?`Le domaine de définition, c'est l'ensemble des x pour lesquels f(x) se calcule. Rappel : √u n'existe que si u ≥ 0, et ln(u) n'existe que si u ${dmGT} 0.`:"",
    pieges:[[[dmDemi(r,!K.dr,ln)],"sens de l'inégalité","le sens de l'inégalité.",a<0?`Diviser par ${nb(a)}, qui est négatif, retourne l'inégalité : ${fx(K.sol)}.`:`${fx(K.cond)} donne ${fx(K.sol)} : le domaine est de l'autre côté de ${br}. Essaie avec un nombre pour vérifier.`,1],
      [[dmDemi(Q(b,a),K.dr,ln)],"signe de la borne","la borne.",`${fx(K.u)} s'annule en ${br}, pas en ${fx(nb(Q(b,a)))} : remplace x pour vérifier.`,1],
      [dmR(),"condition oubliée","la condition.",`${ln?"ln(u)":"√u"} n'existe pas pour tout u : il faut ${fx(K.cond)}.`,0]],
    etapes:[{w:`Il faut ${fx(K.cond)}.`,why:`${ln?"ln(u) n'existe que pour u strictement positif : ln(0) n'existe pas.":"√u n'existe que pour u positif ou nul."}${dk?" Le reste de la formule se calcule pour tout x.":""}`,pts:1},
      {w:K.w,why:K.why,pts:1},
      {w:`<b>${fx(`D = ${dmT([K.P])}`)}</b>`,why:`${ln?`En ${br}, on aurait ln(0), qui n'existe pas : crochet ouvert.`:`En ${br}, on a √0 = 0, qui existe : crochet fermé.`} Du côté de l'infini, le crochet est toujours ouvert.`,pts:1}]});}
/* un numérateur sans importance pour le domaine ; z : l'entier où il s'annule, s'il y en a un */
function dmNum(R,evite){for(;;){const t=R.ent(0,3),c1=R.nz(-3,3),c0=R.ent(-9,9),k=R.ent(1,9),o=t===0?{t:String(k),z:[]}:t===1?{t:`x² + ${k}`,z:[]}:{t:lmPoly([c0,c1]),z:c0%c1?[]:[-c0/c1||0]};
  if(!o.z.some(z=>evite.includes(z)))return o;}}
/* palier 2 : un quotient, les valeurs qui annulent le dénominateur */
function dmQuot(R,rappel){const t=R(),note=rappel?"Rappel : une fraction n'existe que si son dénominateur est différent de 0.":"",pasZero="On ne peut pas diviser par 0. Le numérateur, lui, se calcule pour tout x : il n'interdit rien.",
    oubli=[dmR(),"condition oubliée","la condition.","On ne peut pas diviser par 0 : il faut enlever les x qui annulent le dénominateur.",0],
    zNum=(N,I)=>N.z.map(z=>[dmSauf(...I,z),"zéro du numérateur enlevé","le numérateur.",`Le numérateur a le droit de valoir 0 : 0 divisé par un nombre non nul existe, et vaut 0. ${fx(nb(z))} reste dans le domaine.`,0]),
    neg=(X,ou)=>[X,"confusion avec un logarithme","la condition.",`Un dénominateur a le droit d'être négatif : il doit seulement être différent de 0. ${ou}, f(x) se calcule aussi.`,0],
    il=den=>({w:`Il faut ${fx(`${den} ≠ 0`)}.`,why:pasZero,pts:1}),
    fin=(I,P)=>({w:`<b>${fx(`D = ${dmAcc(...I)}`)}</b>, c'est-à-dire ${fx(`D = ${dmT(P)}`)}.`,why:`On enlève de ℝ ${I.length>1?"les deux valeurs interdites":"la seule valeur interdite"}. Les crochets sont ouverts autour d'${I.length>1?"elles : elles ne sont":"elle : elle n'est"} pas dans le domaine.`,pts:1});
  if(t<0.5){let r1,r2,m;do{r1=R.ent(-6,6);r2=R.ent(-6,6);}while(r1>=r2);
    const s=r1+r2,p=r1*r2,den=lmPoly([p,-s,1]),I=[r1,r2],P=dmSauf(r1,r2),commun=R()<0.4,rc=R()<0.5?r1:r2,ra=rc===r1?r2:r1;do m=R.ent(-6,6);while(I.includes(m));
    const N=commun?{t:[rc,m].sort((x,y)=>Math.abs(x)-Math.abs(y)).map(dmFac).join(""),z:[m]}:dmNum(R,I),
      e2=!p?{w:`${fx(`${den} = x${dmFac(s)}`)} : le dénominateur s'annule pour ${fx("x = 0")} ou ${fx(`x = ${nb(s)}`)}.`,why:"On met x en facteur. Un produit est nul quand l'un de ses facteurs est nul.",pts:1}
        :!s?{w:`${fx(`${den} = 0`)} veut dire ${fx(`x² = ${-p}`)} : ${fx(`x = ${nb(r1)}`)} ou ${fx(`x = ${nb(r2)}`)}.`,why:`Deux nombres ont pour carré ${-p} : ${r2} et son opposé ${nb(r1)}.`,pts:1}
        :{w:`Le discriminant vaut ${fx(`Δ = ${s*s-4*p}`)} : le dénominateur s'annule pour ${fx(`x = ${nb(r1)}`)} ou ${fx(`x = ${nb(r2)}`)}.`,why:`${fx("Δ = b² − 4ac")} avec ${fx("a = 1")}, ${fx(`b = ${nb(-s)}`)} et ${fx(`c = ${nb(p)}`)}. Les racines sont ${fx("(−b − √Δ)/(2a)")} et ${fx("(−b + √Δ)/(2a)")}, avec ${fx(`√Δ = ${r2-r1}`)}. Pour vérifier : ${fx(`${den} = ${dmFac(r1)}${dmFac(r2)}`)}.`,pts:1};
    return dmExo({sig:"Q2"+[r1,r2,N.t],expr:lmF(N.t,den),P,acc:dmAcc(r1,r2),note,nature:commun?"un facteur commun en haut et en bas":"deux valeurs interdites",type:"domaine d'un quotient",
      pieges:[...(commun?[[dmSauf(ra),"fraction simplifiée avant de chercher le domaine","la simplification.",`Tu as simplifié par ${fx(dmFac(rc).replace(/[()]/g,""))} avant de chercher le domaine. Mais la formule de départ ne se calcule pas pour ${fx(`x = ${nb(rc)}`)} : cette valeur reste interdite.`,0]]:[]),
        [dmSauf(r2),"valeur interdite oubliée","les racines.",`${fx(nb(r1))} annule aussi le dénominateur.`,1],[dmSauf(r1),"valeur interdite oubliée","les racines.",`${fx(nb(r2))} annule aussi le dénominateur.`,1],
        [dmSauf(-r1,-r2),"signe des racines","les racines.",`Remplace x pour vérifier : le dénominateur s'annule en ${fx(nb(r1))} et en ${fx(nb(r2))}.`,1],
        neg([dmI(null,true,r1,true),dmI(r2,true,null,true)],`Entre ${nb(r1)} et ${nb(r2)}`),neg([dmI(r1,true,r2,true)],`Avant ${nb(r1)} et après ${nb(r2)}`),oubli,...zNum(N,I),...zNum(N,[])],
      etapes:[{w:`Il faut ${fx(`${den} ≠ 0`)}.`,why:pasZero+(commun?" Et on ne simplifie pas la fraction avant : c'est la formule de départ qui doit pouvoir se calculer.":""),pts:1},e2,fin(I,P)]});}
  if(t<0.65){const k=R.ent(1,9),sq=Math.round(Math.sqrt(k)),den=`x² + ${k}`,N=dmNum(R,[]);
    return dmExo({sig:"Q0"+[k,N.t],expr:lmF(N.t,den),P:dmR(),note,nature:"un dénominateur jamais nul",type:"domaine d'un quotient",
      pieges:[...(sq*sq===k?[[dmSauf(-sq,sq),"confusion avec x² − k","le signe.",`${fx(`${den} = 0`)} voudrait dire ${fx(`x² = −${k}`)} : impossible, un carré n'est jamais négatif. C'est ${fx(`x² − ${k}`)} qui s'annule en ${fx(nb(-sq))} et en ${fx(String(sq))}.`,1]]:[]),
        [dmSauf(-k),"équation mal résolue","l'équation.",`${fx(`${den} = 0`)} n'est pas ${fx(`x + ${k} = 0`)} : il y a un carré. Et ${fx(`x² = −${k}`)} est impossible.`,1],
        [dmSauf(0),"valeur enlevée à tort","le dénominateur.",`Pour ${fx("x = 0")}, le dénominateur vaut ${k}, pas 0.`,1],...zNum(N,[])],
      etapes:[il(den),{w:`${fx(`${den} ≥ ${k}`)} : le dénominateur ne s'annule jamais.`,why:`Un carré est toujours positif ou nul : ${fx("x² ≥ 0")}. En ajoutant ${k}, on obtient un nombre au moins égal à ${k} : il ne vaut jamais 0.`,pts:1},
        {w:`<b>${fx("D = ℝ")}</b>`,why:"Aucune valeur n'est interdite : f(x) se calcule pour tout réel x.",pts:1}]});}
  if(t<0.85){const r=R.ent(-8,8);let a=R.choix([1,1,-1,2,-2,3]);if(a<0&&r<=0)a=-a;
    const b=-a*r||0,den=dmAff(a,b),N=dmNum(R,[r]),P=dmSauf(r);
    return dmExo({sig:"Q1"+[a,r,N.t],expr:lmF(N.t,den),P,acc:dmAcc(r),note,nature:"une valeur interdite",type:"domaine d'un quotient",
      pieges:[[dmSauf(-r),"signe de la valeur interdite","l'équation.",`Remplace x pour vérifier : ${fx(den)} s'annule en ${fx(nb(r))}.`,1],
        neg([dmI(r,true,null,true)],`Pour x plus petit que ${nb(r)}`),neg([dmI(null,true,r,true)],`Pour x plus grand que ${nb(r)}`),oubli,...zNum(N,[r]),...zNum(N,[])],
      etapes:[il(den),{w:a===1&&!b?`La seule valeur interdite est ${fx("x = 0")}.`:`${fx(`${den} = 0`)} donne ${fx(`x = ${nb(r)}`)}.`,
        why:a===1&&!b?"Le dénominateur est x lui-même.":!b?`${fx(`${lmM(a,1)} = 0`)} seulement quand x vaut 0.`:a===1?`On ${b>0?"retire":"ajoute"} ${Math.abs(b)} des deux côtés.`:`${fx(`${lmM(a,1)} = ${nb(-b)}`)}, puis on divise par ${nb(a)}.`,pts:1},fin([r],P)]});}
  const r=R.nz(-5,5),den=lmPoly([r*r,-2*r,1]),N=dmNum(R,[r]),P=dmSauf(r);
  return dmExo({sig:"QC"+[r,N.t],expr:lmF(N.t,den),P,acc:dmAcc(r),note,nature:"un carré au dénominateur",type:"domaine d'un quotient",
    pieges:[[dmSauf(-r),"signe de la racine","la racine.",`Remplace x pour vérifier : le dénominateur s'annule en ${fx(nb(r))}, pas en ${fx(nb(-r))}.`,1],
      [dmSauf(r,-r),"racine en trop","les racines.",`Ici ${fx("Δ = 0")} : il n'y a qu'une racine, ${fx(nb(r))}.`,1],oubli,...zNum(N,[r]),...zNum(N,[])],
    etapes:[il(den),{w:`${fx(`${den} = ${dmFac(r)}²`)} : le dénominateur s'annule seulement pour ${fx(`x = ${nb(r)}`)}.`,why:`C'est l'identité remarquable ${fx(r>0?"a² − 2ab + b² = (a − b)²":"a² + 2ab + b² = (a + b)²")}, avec ${fx("a = x")} et ${fx(`b = ${Math.abs(r)}`)}. Avec le discriminant, on trouve ${fx("Δ = 0")} : une seule racine.`,pts:1},fin([r],P)]});}
/* palier 3 : le signe d'un trinôme sous une racine ou un logarithme */
function dmTrin(R){const ln=R()<0.5,s=R()<0.5?1:-1;let r1,r2;do{r1=R.ent(-6,6);r2=R.ent(-6,6);}while(r1>=r2);
  const T=lmPoly([s*r1*r2,-s*(r1+r2),s]),op=ln?dmGT:"≥",pl=ln?dmLT:"≤",pg=ln?dmGT:"≥",ext=[dmI(null,true,r1,ln),dmI(r2,ln,null,true)],int=[dmI(r1,ln,r2,ln)],P=s>0?ext:int,
    quoi=ln?"un logarithme":"une racine",pos=ln?"strictement positif":"positif ou nul";
  return dmExo({sig:"T"+[ln?1:0,s,r1,r2],expr:`${ln?"ln":"√"}(${T})`,P,nature:"le signe d'un trinôme",type:"signe d'un trinôme",
    pieges:[[s>0?int:ext,"signe du trinôme","le signe du trinôme.",`Le coefficient de x² est ${s>0?"positif":"négatif"} : le trinôme est positif ${s>0?"à l'extérieur des racines, pas entre elles":"entre les racines, pas à l'extérieur"}. Pour ${fx(`x = ${nb(r2+1)}`)}, il vaut ${fx(nb(s*(r2+1-r1)))}.`,2],
      [dmSauf(r1,r2),"confusion avec un dénominateur","la condition.",`Sous ${quoi}, il ne suffit pas d'être différent de 0 : il faut être ${pos}.`,0],
      ...(s>0?[[[dmI(r2,ln,null,true)],"une partie du domaine oubliée","le signe du trinôme.",`Le trinôme est aussi positif pour ${fx(`x ${pl} ${nb(r1)}`)} : les deux facteurs y sont négatifs, et leur produit est positif.`,2],
        [[dmI(null,true,r1,ln)],"une partie du domaine oubliée","le signe du trinôme.",`Le trinôme est aussi positif pour ${fx(`x ${pg} ${nb(r2)}`)}.`,2]]:[]),
      [dmR(),"condition oubliée","la condition.",`Sous ${quoi}, tous les x ne conviennent pas : il faut ${fx(`${T} ${op} 0`)}.`,0]],
    etapes:[{w:`Il faut ${fx(`${T} ${op} 0`)}.`,why:ln?"ln(u) n'existe que pour u strictement positif : ln(0) n'existe pas.":"√u n'existe que pour u positif ou nul.",pts:1},
      {w:`${fx(T)} s'annule pour ${fx(`x = ${nb(r1)}`)} et pour ${fx(`x = ${nb(r2)}`)}.`,why:`Avec le discriminant : ${fx(`Δ = b² − 4ac = ${(r2-r1)**2}`)}, ${fx(`√Δ = ${r2-r1}`)}, et les racines sont ${fx("(−b − √Δ)/(2a)")} et ${fx("(−b + √Δ)/(2a)")}. Pour vérifier, on développe : ${fx(`${T} = ${s<0?"−":""}${dmFac(r1)}${dmFac(r2)}`)}.`,pts:1},
      {w:`${fx(T)} est ${pos} ${s>0?`pour ${fx(`x ${pl} ${nb(r1)}`)} ou ${fx(`x ${pg} ${nb(r2)}`)}`:`pour ${fx(`${nb(r1)} ${pl} x ${pl} ${nb(r2)}`)}`}.`,why:`Un trinôme ${fx("ax² + bx + c")} est du signe de a à l'extérieur des racines, et du signe contraire entre les racines. Ici ${fx(`a = ${nb(s)}`)} est ${s>0?"positif":"négatif"} : le trinôme est positif ${s>0?"à l'extérieur des racines":"entre les racines"}.`,pts:1},
      {w:`<b>${fx(`D = ${dmT(P)}`)}</b>`,why:ln?"Aux racines, le trinôme vaut 0, et ln(0) n'existe pas : les crochets sont ouverts.":"Aux racines, le trinôme vaut 0, et √0 = 0 existe : les crochets sont fermés.",pts:1}]});}
/* palier 3 : le signe d'un quotient sous une racine ou un logarithme */
function dmRapport(R){const ln=R()<0.5,f=ln?"ln":"√",op=ln?dmGT:"≥",quoi=ln?"un logarithme":"une racine",pos=ln?"strictement positif":"positif ou nul",
    c0=`${ln?"ln(u) n'existe que pour u strictement positif":"√u n'existe que pour u positif ou nul"}, et le quotient lui-même n'existe que si son dénominateur n'est pas nul.`,
    oubli=[dmR(),"condition oubliée","la condition.",`Sous ${quoi}, tous les x ne conviennent pas : il faut que le quotient soit ${pos}.`,0];
  if(R()<0.3){const k=R.ent(1,9),b=R.ent(-6,6),sd=b>0&&R()<0.4?-1:1,haut=R()<0.5?`x² + ${k}`:`eˣ + ${k}`,bas=dmAff(sd,-sd*b||0),qt=lmF(haut,bas),dr=sd>0,P=[dmDemi(b,dr,true)],cote=fx(`x ${dr?dmGT:dmLT} ${nb(b)}`),bb=fx(nb(b));
    return dmExo({sig:"RP"+[ln?1:0,haut,b,sd],expr:`${f}(${qt})`,P,nature:"un quotient dont le haut est toujours positif",type:"signe d'un quotient",crochets:`${bb} annule le dénominateur : il est interdit, le crochet est ouvert.`,
      pieges:[[dmSauf(b),"signe du quotient oublié","la condition.",`Sous ${quoi}, il ne suffit pas que le quotient existe : il doit être ${pos}. Pour ${fx(`x ${dr?dmLT:dmGT} ${nb(b)}`)}, il est négatif.`,0],
        [[dmDemi(b,!dr,true)],"signe du dénominateur","le signe du bas.",`${fx(bas)} est positif pour ${cote}, pas de l'autre côté.`,2],oubli],
      etapes:[{w:`Il faut ${fx(`${qt} ${op} 0`)}, et ${fx(`${bas} ≠ 0`)}.`,why:c0,pts:1},
        {w:`Le haut, ${fx(haut)}, est toujours strictement positif.`,why:haut[0]==="x"?`Un carré est positif ou nul : ${fx(`x² + ${k} ≥ ${k}`)}.`:`Une exponentielle est toujours strictement positive : ${fx(`eˣ + ${k} ${dmGT} ${k}`)}.`,pts:1},
        {w:`Le quotient a donc le signe du bas : il est strictement positif pour ${cote}.`,why:`Un nombre positif divisé par un nombre positif est positif ; divisé par un nombre négatif, il est négatif. Et ${fx(bas)} est positif pour ${cote}.`,pts:1},
        {w:`<b>${fx(`D = ${dmT(P)}`)}</b>`,why:`${bb} annule le dénominateur : il est interdit, le crochet est ouvert.${ln?"":" Le quotient ne vaut jamais 0, puisque le haut ne s'annule pas."}`,pts:1}]});}
  let a,b;do{a=R.ent(-6,6);b=R.ent(-6,6);}while(a===b);
  const sn=a>0&&R()<0.4?-1:1,haut=dmAff(sn,-sn*a||0),bas=dmAff(1,-b||0),qt=lmF(haut,bas),m=Math.min(a,b),M=Math.max(a,b),ouv=x=>x===a?ln:true,
    ext=[dmI(null,true,m,ouv(m)),dmI(M,ouv(M),null,true)],int=[dmI(m,ouv(m),M,ouv(M))],P=sn>0?ext:int,cmp=(x,g)=>x===a&&!ln?(g?"≥":"≤"):g?dmGT:dmLT,aa=fx(nb(a)),bb=fx(nb(b)),
    ou=sn>0?`pour ${fx(`x ${cmp(m,0)} ${nb(m)}`)} ou ${fx(`x ${cmp(M,1)} ${nb(M)}`)}`:`pour ${fx(`${nb(m)} ${cmp(m,0)} x ${cmp(M,0)} ${nb(M)}`)}`,
    bords=`${ln?`En ${aa} le quotient vaut 0, et ln(0) n'existe pas : ${aa} est interdit`:`En ${aa} le quotient vaut 0, et √0 existe : ${aa} est dans le domaine, crochet fermé`}. En ${bb} on diviserait par 0 : ${bb} est interdit, crochet ouvert.`;
  return dmExo({sig:"RQ"+[ln?1:0,sn,a,b],expr:`${f}(${qt})`,P,nature:"le signe d'un quotient",type:"signe d'un quotient",crochets:bords,
    pieges:[[sn>0?int:ext,"signe du quotient","le tableau de signes.",`Le quotient est positif quand le haut et le bas ont le même signe : ${ou}. Essaie avec un nombre pour vérifier.`,2],
      [[dmDemi(a,sn>0,ln)],"signe du dénominateur oublié","le signe du bas.",`Tu as regardé seulement le signe du haut. Le signe du quotient dépend aussi du bas, ${fx(bas)}, qui change de signe en ${bb}.`,1],
      [dmSauf(b),"signe du quotient oublié","la condition.",`Sous ${quoi}, il ne suffit pas que le quotient existe : il doit être ${pos}.`,0],
      [dmSauf(a,b),"signe du quotient oublié","la condition.",`Sous ${quoi}, il ne suffit pas d'éviter 0 : le quotient doit être ${pos}.`,0],oubli],
    etapes:[{w:`Il faut ${fx(`${qt} ${op} 0`)}, et ${fx(`${bas} ≠ 0`)}.`,why:c0,pts:1},
      {w:`Le haut, ${fx(haut)}, s'annule en ${aa} : il est positif pour ${fx(`x ${sn>0?dmGT:dmLT} ${nb(a)}`)}. Le bas, ${fx(bas)}, s'annule en ${bb} : il est positif pour ${fx(`x ${dmGT} ${nb(b)}`)}.`,why:"Une expression ax + b change de signe là où elle s'annule : elle est du signe de a après, et du signe contraire avant.",pts:1},
      {w:`Le quotient est ${pos} ${ou}.`,why:`Un quotient est positif quand le haut et le bas ont le même signe. ${sn>0?`Avant ${nb(m)}, les deux sont négatifs ; après ${nb(M)}, les deux sont positifs ; entre ${nb(m)} et ${nb(M)}, ils sont de signes contraires.`:`Entre ${nb(m)} et ${nb(M)}, les deux sont ${b<a?"positifs":"négatifs"} ; ailleurs, ils sont de signes contraires.`}`,pts:1},
      {w:`<b>${fx(`D = ${dmT(P)}`)}</b>`,why:bords,pts:1}]});}
const dmSigne=R=>R()<0.5?dmTrin(R):dmRapport(R);
/* palier 4 : plusieurs conditions à la fois */
function dmSur(R){const ln=R()<0.5,a=R.nz(-3,3),b=R.ent(-8,8),K=dmCond(a,b,ln),f=`${ln?"ln":"√"}(${K.u})`,br=fx(nb(K.r));let c,ou;
  do{c=R.ent(-8,8);ou=Math.abs(c-K.rv)<1e-9?0:(K.dr?c>K.rv:c<K.rv)?1:-1;}while(ou<1&&R()<0.7);
  const bas=dmAff(1,-c||0),cc=fx(nb(c)),P=ou>0?(K.dr?[dmI(K.r,ln,c,true),dmI(c,true,null,true)]:[dmI(null,true,c,true),dmI(c,true,K.r,ln)]):ou?[K.P]:[dmDemi(K.r,K.dr,true)],
    e3=ou>0?`, et ${cc} vérifie ${fx(K.sol)} : il faut l'enlever.`:ou?` : cette valeur ne vérifie pas ${fx(K.sol)}, elle est déjà hors du domaine. Il n'y a rien à enlever.`:ln?" : cette valeur est déjà exclue par la première condition.":" : c'est justement la borne, qui devient interdite.",
    bord=ln?`En ${br}, on aurait ln(0) : crochet ouvert.`:`En ${br}, on a √0 = 0 : crochet fermé.`;
  return dmExo({sig:"U"+[ln?1:0,a,b,c],expr:lmF(f,bas),P,nature:"une racine ou un logarithme, sur un dénominateur",type:"deux conditions à la fois",
    pieges:[[[K.P],"dénominateur oublié","le dénominateur.",`${cc} annule le dénominateur : il faut l'enlever du domaine.`,2],
      [dmSauf(c),ln?"condition du logarithme oubliée":"condition de la racine oubliée","la première condition.",`Il faut aussi que ${fx(f)} existe : ${fx(K.cond)}.`,0],
      [[dmDemi(K.r,!K.dr,ln)],"sens de l'inégalité","le sens de l'inégalité.",`${fx(K.cond)} donne ${fx(K.sol)}.`,1],
      [dmR(),"conditions oubliées","les conditions.",`Il y a deux conditions : ${fx(K.cond)} et ${fx(`${bas} ≠ 0`)}.`,0]],
    etapes:[{w:`Deux conditions : ${fx(K.cond)} et ${fx(`${bas} ≠ 0`)}.`,why:`${ln?"ln(u) n'existe que pour u strictement positif":"√u n'existe que pour u positif ou nul"}, et on ne divise pas par 0. Il faut les deux à la fois.`,pts:1},
      {w:K.w,why:K.why,pts:1},
      {w:`${fx(`${bas} ≠ 0`)} donne ${fx(`x ≠ ${nb(c)}`)}${e3}`,why:"On regarde si la valeur interdite par le dénominateur fait partie des x gardés à l'étape précédente.",pts:1},
      {w:`<b>${fx(`D = ${dmT(P)}`)}</b>`,why:ou>0?`On enlève ${cc} : les crochets sont ouverts autour de lui. ${bord}`:ou?bord:`${cc} est interdit : crochet ouvert.`,pts:1}]});}
function dmSousRac(R){const a=R.nz(-3,3),b=R.ent(-8,8),K=dmCond(a,b,true),N=dmNum(R,[]),br=fx(nb(K.r)),zero=`En ${br}, la racine vaut 0 et on diviserait par 0 : la borne est interdite, le crochet est ouvert.`;
  return dmExo({sig:"V"+[a,b,N.t],expr:lmF(N.t,`√(${K.u})`),P:[K.P],nature:"une racine au dénominateur",type:"racine au dénominateur",crochets:zero,
    pieges:[[[dmDemi(K.r,!K.dr,true)],"sens de l'inégalité","le sens de l'inégalité.",`${fx(K.cond)} donne ${fx(K.sol)}.`,1],
      [dmR(),"conditions oubliées","les conditions.","Il faut que la racine existe, et qu'elle ne vaille pas 0.",0]],
    etapes:[{w:`Il faut ${fx(K.cond)} : strictement positif.`,why:`Pour que la racine existe, il faut ${fx(`${K.u} ≥ 0`)}. Mais elle est au dénominateur : elle ne doit pas valoir 0, donc ${fx(`${K.u} ≠ 0`)}. Les deux conditions ensemble donnent ${fx(K.cond)}.`,pts:1},
      {w:K.w,why:K.why,pts:1},
      {w:`<b>${fx(`D = ${dmT([K.P])}`)}</b>`,why:zero,pts:1}]});}
/* 1/ln(x − c), comme x e^(1/ln x) au CC 2023 */
function dmInvLn(R){const c=R.ent(-6,6),s=c>0&&R()<0.35?-1:1,K=dmCond(s,-s*c||0,true),w=K.u,un=c+s,k=R.ent(1,5),fo=R.ent(0,2),L=`ln(${w})`,iv=lmF(1,L),expr=[lmF(k,L),`e^{${iv}}`,`x e^{${iv}}`][fo],
    P=s>0?[dmI(c,true,un,true),dmI(un,true,null,true)]:[dmI(null,true,un,true),dmI(un,true,c,true)],cc=fx(nb(c)),uu=fx(nb(un));
  return dmExo({sig:"W"+[s,c,fo,fo?0:k],expr,P,nature:"un logarithme au dénominateur",type:"logarithme au dénominateur",
    pieges:[[[K.P],"ln(u) = 0 oublié","le dénominateur.",`${fx(L)} vaut 0 pour ${fx(`x = ${nb(un)}`)}, car ${fx("ln(1) = 0")} : cette valeur est interdite aussi.`,2],
      [dmSauf(un),"condition du logarithme oubliée","la première condition.",`Il faut d'abord que ${fx(L)} existe : ${fx(K.cond)}.`,0],
      [dmSauf(c),"ln(u) = 0 mal résolu","l'équation ln(u) = 0.",`${fx("ln(u) = 0")} quand ${fx("u = 1")}, pas quand ${fx("u = 0")}. Et il faut aussi ${fx(K.cond)} pour que le logarithme existe.`,2],
      [dmSauf(c,un),"condition du logarithme oubliée","la première condition.",`Il ne suffit pas d'enlever ${cc} : il faut ${fx(K.cond)}, c'est-à-dire ${fx(K.sol)}.`,0],
      [dmR(),"conditions oubliées","les conditions.",`Il y a deux conditions : ${fx(K.cond)} et ${fx(`${L} ≠ 0`)}.`,0]],
    etapes:[{w:`Deux conditions : ${fx(K.cond)} et ${fx(`${L} ≠ 0`)}.`,why:`ln(u) n'existe que pour u strictement positif. Et ${fx(L)} est au dénominateur : il ne doit pas valoir 0.${fo?" L'exponentielle, elle, se calcule pour tout nombre : elle n'interdit rien.":""}`,pts:1},
      {w:K.w,why:K.why,pts:1},
      {w:`${fx(`${L} = 0`)} quand ${fx(`${w} = 1`)}, c'est-à-dire ${fx(`x = ${nb(un)}`)} : cette valeur est interdite.`,why:`${fx("ln(1) = 0")}, et 1 est le seul nombre dont le logarithme vaut 0.`,pts:1},
      {w:`<b>${fx(`D = ${dmT(P)}`)}</b>`,why:`On part de ${fx(dmT([K.P]))} et on enlève ${uu}. Tous les crochets sont ouverts : ${cc} donnerait ln(0), et ${uu} une division par 0.`,pts:1}]});}
function dmSomme(R){for(;;){const l1=R()<0.5,l2=R()<0.5,K1=dmCond(R.nz(-3,3),R.ent(-9,9),l1),K2=dmCond(R.nz(-3,3),R.ent(-9,9),l2),opp=K1.dr!==K2.dr,g=K1.dr?K1:K2,d=K1.dr?K2:K1;
  if(Math.abs(K1.rv-K2.rv)<1e-9||(!opp&&R()<0.6)||(opp&&g.rv>d.rv))continue;
  const fort=opp?null:(K1.dr?K1.rv>K2.rv:K1.rv<K2.rv)?K1:K2,faible=fort===K1?K2:K1,P=opp?[dmI(g.r,g.st,d.r,d.st)]:[fort.P],f1=`${l1?"ln":"√"}(${K1.u})`,f2=`${l2?"ln":"√"}(${K2.u})`,sg=R()<0.5?"+":"−";
  return dmExo({sig:"Z"+[l1?1:0,l2?1:0,K1.u,K2.u,sg],expr:`${f1} ${sg} ${f2}`,P,nature:opp?"deux conditions qui se croisent":"deux conditions du même côté",type:"deux conditions à la fois",
    pieges:[...(opp?[[[K1.P,K2.P],"réunion au lieu de l'intersection","la mise en commun.","Il faut que les deux conditions soient vraies en même temps : on garde les x communs aux deux ensembles, pas tous les x de l'un ou de l'autre.",3]]:[]),
      [[K1.P],"deuxième condition oubliée","la deuxième condition.",`Il faut aussi que ${fx(f2)} existe : ${fx(K2.cond)}.`,2],
      [[K2.P],"première condition oubliée","la première condition.",`Il faut aussi que ${fx(f1)} existe : ${fx(K1.cond)}.`,1]],
    etapes:[{w:`Deux conditions : ${fx(K1.cond)} et ${fx(K2.cond)}.`,why:`f(x) se calcule seulement si ses deux morceaux se calculent. ${l1&&l2?"ln(u) n'existe que pour u strictement positif.":!l1&&!l2?"√u n'existe que pour u positif ou nul.":"√u n'existe que pour u positif ou nul, et ln(u) que pour u strictement positif."}`,pts:1},
      {w:K1.w,why:K1.why,pts:1},{w:K2.w,why:K2.why,pts:1},
      {w:`Il faut les deux à la fois : <b>${fx(`D = ${dmT(P)}`)}</b>`,why:opp?`x doit vérifier ${fx(g.sol)} et ${fx(d.sol)} en même temps : on garde ce qui est commun aux deux ensembles (leur intersection). Chaque borne garde le crochet de sa condition.`:`Si ${fx(fort.sol)}, alors ${fx(faible.sol)} est vrai aussi : la condition la plus forte suffit.`,pts:1}]});}}
/* rien d'interdit, une valeur absolue, une exponentielle : comme au TD 1, exercice 3 (a, e, g, h) */
function dmPiege(R){const v=R.ent(0,2),ln=R()<0.5;
  if(v===0){const k=R.ent(1,9),sq=Math.round(Math.sqrt(k)),u=`x² + ${k}`,dk=R.ent(0,ln?1:2),c=`${ln?"ln":"√"}(${u})`,expr=[c,`x${ln?" ":""}${c}`,lmF(1,c)][dk],trop=`x n'a pas besoin d'être positif : c'est ${fx(u)} qui doit l'être, et il l'est toujours.`;
    return dmExo({sig:"F0"+[ln?1:0,k,dk],expr,P:dmR(),nature:"rien d'interdit",type:"condition toujours vraie",
      pieges:[...(sq*sq===k?[[[dmI(null,true,-sq,ln),dmI(sq,ln,null,true)],"confusion avec x² − k","le signe.",`C'est ${fx(`x² − ${k}`)} qui change de signe en ${fx(nb(-sq))} et en ${fx(String(sq))}. ${fx(u)} est toujours positif.`,1]]:[]),
        [[dmI(0,false,null,true)],"condition en trop","la condition.",trop,1],[[dmI(0,true,null,true)],"condition en trop","la condition.",trop,1],
        [dmSauf(0),"valeur enlevée à tort","la condition.",`Pour ${fx("x = 0")}, ${fx(u)} vaut ${k}, qui est strictement positif : 0 est dans le domaine.`,1],
        [[dmI(-k,ln,null,true)],"équation mal lue","la condition.",`Il y a un carré : ${fx(`${u} ${dmGT} 0`)} n'est pas ${fx(`x + ${k} ${dmGT} 0`)}.`,1]],
      etapes:[{w:`Il faut ${fx(`${u} ${dk===2||ln?dmGT:"≥"} 0`)}.`,why:dk===2?"Sous la racine, il faut un nombre positif ou nul ; et comme la racine est au dénominateur, elle ne doit pas valoir 0.":ln?"ln(u) n'existe que pour u strictement positif.":"√u n'existe que pour u positif ou nul.",pts:1},
        {w:`${fx(`${u} ≥ ${k}`)} : la condition est toujours vraie.`,why:`Un carré est toujours positif ou nul : ${fx("x² ≥ 0")}. En ajoutant ${k}, on obtient un nombre au moins égal à ${k}, donc strictement positif.`,pts:1},
        {w:`<b>${fx("D = ℝ")}</b>`,why:"Aucune valeur de x n'est interdite.",pts:1}]});}
  const a=R.ent(-8,8),w=dmAff(1,-a||0),P=dmSauf(a),aa=fx(nb(a)),fin={w:`<b>${fx(`D = ${dmAcc(a)}`)}</b>, c'est-à-dire ${fx(`D = ${dmT(P)}`)}.`,why:"On enlève de ℝ la seule valeur interdite. Les crochets sont ouverts autour d'elle.",pts:1},
    signe=[dmSauf(-a),"signe de la valeur interdite","l'équation.",`${fx(w)} s'annule en ${aa}.`,1];
  if(v===1)return dmExo({sig:"F1"+a,expr:`ln(|${w}|)`,P,acc:dmAcc(a),nature:"le logarithme d'une valeur absolue",type:"logarithme d'une valeur absolue",
    pieges:[[[dmI(a,true,null,true)],"valeur absolue oubliée","la valeur absolue.",`Avec la valeur absolue, ${fx(w)} a le droit d'être négatif : ${fx(`|${w}|`)} reste positif.`,1],
      [dmR(),"valeur interdite oubliée","la valeur absolue.",`${fx(`|${w}|`)} vaut 0 pour ${fx(`x = ${nb(a)}`)}, et ln(0) n'existe pas.`,1],signe],
    etapes:[{w:`Il faut ${fx(`|${w}| ${dmGT} 0`)}.`,why:"ln(u) n'existe que pour u strictement positif.",pts:1},
      {w:`${fx(`|${w}|`)} est toujours positif ou nul, et il vaut 0 seulement pour ${fx(`x = ${nb(a)}`)}.`,why:`La valeur absolue d'un nombre est sa distance à 0 : elle n'est jamais négative, et elle est nulle seulement quand le nombre est nul.${a?` Ici ${fx(`${w} = 0`)} donne ${fx(`x = ${nb(a)}`)}.`:""}`,pts:1},fin]});
  const k=R.nz(-5,5),ex0=lmF(nb(k),w);
  return dmExo({sig:"F2"+[a,k],expr:`e^{${ex0}}`,P,acc:dmAcc(a),nature:"une exponentielle dont l'exposant est une fraction",type:"exposant d'une exponentielle",
    pieges:[[dmR(),"exposant oublié","l'exposant.",`L'exponentielle se calcule pour tout nombre, mais il faut d'abord que son exposant ${fx(ex0)} se calcule : ${fx(`${w} ≠ 0`)}.`,0],
      [[dmI(a,true,null,true)],"confusion avec un logarithme","la condition.","Une exponentielle accepte les nombres négatifs : son exposant doit seulement exister.",0],signe],
    etapes:[{w:`Il faut ${fx(`${w} ≠ 0`)}.`,why:`L'exponentielle se calcule pour tout nombre : elle n'interdit rien. Mais son exposant ${fx(ex0)} doit d'abord se calculer, et c'est une fraction : on ne divise pas par 0.`,pts:1},
      {w:a?`${fx(`${w} = 0`)} donne ${fx(`x = ${nb(a)}`)}.`:`La seule valeur interdite est ${fx("x = 0")}.`,why:a?`On ${a>0?"ajoute":"retire"} ${Math.abs(a)} des deux côtés.`:"Le dénominateur est x lui-même.",pts:1},fin]});}
const dmDeux=R=>{const t=R();return (t<0.25?dmSur:t<0.4?dmSousRac:t<0.6?dmInvLn:t<0.85?dmSomme:dmPiege)(R);};
const dmMix=R=>R.choix([dmSimple,dmQuot,dmTrin,dmRapport,dmSur,dmSousRac,dmInvLn,dmSomme,dmPiege])(R);

/* ---------- CA9 : étude de fonction (CC1 2025, exercice 1 ; CC 2023, exercice 3) ----------
   Six familles dont on connaît tout : domaine, limites aux bornes, dérivée, zéros de f′, valeurs aux extremums.
   Le contrôle relit ens.expr et refait chaque morceau en nombres flottants. */
const feV=(t,tp,v)=>({t,tp,v}),feQ=r=>{r=q(r);return feV(nb(r),brut(r),r.n/r.d);};
const feE=m=>m===0?"1":m===1?"e":`e^{${nb(m)}}`;
function feEx(c,m){c=q(c);if(m===0)return feQ(c);const E=feE(m),an=Math.abs(c.n),top=an===1?E:an+E;
  return feV((c.n<0?"−":"")+(c.d===1?top:lmF(top,c.d)),`(${brut(c)})*e^(${m})`,c.n/c.d*Math.exp(m));}
const feInf=s=>({x:s*Infinity,t:lmInf(s),k:"inf"}),feBord=c=>({x:c,t:nb(c),k:"bord"}),feZ=z=>({x:z.v,t:z.t,k:"zero"});
const feLim=(P,L,w,why,pg)=>({P,L,w,why,pg:pg||[]}),feSg=v=>v>0?"+":"−",feFl=v=>v>0?"↗":"↘",feAff=s=>s>0?"croissante : négative avant, positive après":"décroissante : positive avant, négative après";
const FE_DIV="Diviser par un nombre qui tend vers 0 ne donne pas 0 : le quotient devient très grand, et son signe vient des signes du haut et du bas.";
const FE_QUOT="(u/v)′ = (u′v − uv′)/v² : d'abord u′v, puis moins uv′.";
const FE_FRAC="Une fraction n'existe que si son dénominateur est différent de 0.";
function feTire(R,fam){let o;
  if(fam==="cube"){const s=R()<0.5?1:-1,p=R.ent(1,3),k=R.ent(-5,5),p2=p*p,z=[feQ(-p),feQ(p)],fa=`${s>0?"3":"−3"}(x + ${p})(x − ${p})`;
    o={sig:`c${s},${p},${k}`,nat:"polynôme de degré 3",expr:lmPoly([k,-3*s*p2,0,s]),f:x=>s*(x**3-3*p2*x)+k,d:x=>3*s*(x*x-p2),P:dmR(),
      Dw:{w:`f est un polynôme : ${fx("D = ℝ")}.`,why:"Un polynôme se calcule pour tout réel x."},dJ:"f est un polynôme : elle est dérivable sur ℝ.",
      dT:lmPoly([-3*s*p2,0,3*s]),dTp:`${3*s}*x^2+(${-3*s*p2})`,dF:fa,noeuds:[feInf(-1),feZ(z[0]),feZ(z[1]),feInf(1)],zeros:z,vals:[feQ(2*s*p**3+k),feQ(-2*s*p**3+k)],
      vWhy:`On remplace x dans f(x) : ${fx(`(${nb(-p)})³ = ${nb(-(p**3))}`)} et ${fx(`${p}³ = ${p**3}`)}.`,
      bornes:[-1,1].map(t=>feLim({inf:t},{inf:t*s},`En ${fx(lmInf(t))}, f a la même limite que son terme de plus haut degré, ${fx(lmM(s,3))}.`,`${fx("x³")} tend vers ${fx(lmInf(t))} quand x tend vers ${fx(lmInf(t))}${s<0?" ; le signe moins change le signe de l'infini":""}.`))};
    o.dE=[{w:`${fx(`f′(x) = ${o.dT}`)}.`,why:`On dérive terme à terme : ${fx("(x³)′ = 3x²")}, ${fx("(x)′ = 1")}${k?`, et la constante ${nb(k)} a pour dérivée 0`:""}.`}];
    o.sgW={w:`On factorise : ${fx(`f′(x) = ${fa}`)}, qui s'annule en ${fx(nb(-p))} et en ${fx(nb(p))}.`,why:`${fx(`x² − ${p2} = (x + ${p})(x − ${p})`)}. Un trinôme a le signe de son coefficient en x² à l'extérieur de ses racines, le signe contraire entre elles.`};
    o.dpg=[[x=>3*s*x*x,`${3*s}*x^2`,"dérivée terme à terme",`Chaque terme se dérive : ${fx("(x)′ = 1")}, donc le terme en x donne une constante.`]];}
  else if(fam==="homo"||fam==="rat"){const c=fam==="homo"?R.ent(-5,5):R.ent(-3,3),den=lmPoly([-c,1]),den2=c?`(${den})²`:"x²",denP=c?`(${den})`:"x",bords=[-1,1];
    const base={P:dmSauf(c),acc:dmAcc(c),dJ:"f est une fraction rationnelle (un quotient de polynômes) : elle est dérivable sur son domaine D.",
      Dw:{w:`Le dénominateur doit être non nul : ${c?`${fx(`${den} ≠ 0`)} donne `:""}${fx(`x ≠ ${nb(c)}`)}, donc ${fx(`D = ${dmT(dmSauf(c))}`)}.`,why:FE_FRAC},
      Dpg:[[dmR(),"valeur interdite oubliée","le dénominateur.",`Pour ${fx(`x = ${nb(c)}`)}, le dénominateur vaut 0 : f n'y est pas définie.`,0]]};
    if(fam==="homo"){let a,b;do{a=R.nz(-4,4);b=R.ent(-6,6);}while(a*c+b===0);
      const K=a*c+b,N=-K,num=dmAff(a,b),aV=c?`${coefK(a)}${denP}`:lmM(a,1),dT=(N<0?"−":"")+lmF(Math.abs(N),den2);
      o=Object.assign(base,{sig:`h${a},${b},${c}`,nat:"quotient de deux affines",expr:lmF(num,den),f:x=>(a*x+b)/(x-c),d:x=>N/(x-c)**2,dT,dTp:`(${N})/(x-(${c}))^2`,dF:dT,
        noeuds:[feInf(-1),feBord(c),feInf(1)],zeros:[],vals:[],vWhy:"",
        dE:[{w:`${fx(`u(x) = ${num}`)} et ${fx(`v(x) = ${den}`)}, donc ${fx(`u′(x) = ${nb(a)}`)} et ${fx("v′(x) = 1")}.`,why:"f est un quotient u/v de deux fonctions dérivables, avec v ≠ 0 sur D."},
          {w:`${fx(`f′(x) = ${lmF(`${aV} − (${num})`,den2)}`)}.`,why:fx("(u/v)′ = (u′v − uv′)/v²")},
          {w:`Au numérateur, les termes en x s'annulent : ${fx(`f′(x) = ${dT}`)}.`,why:`${fx(`${aV} − (${num}) = ${nb(N)}`)}.`}],
        sgW:{w:`${fx(`f′(x) = ${dT}`)} ne s'annule jamais sur D : elle a partout le signe de ${fx(nb(N))}.`,why:`Le dénominateur ${fx(den2)} est un carré, strictement positif sur D.`},
        dpg:[[x=>-N/(x-c)**2,`-(${N})/(x-(${c}))^2`,"ordre de u′v et uv′",FE_QUOT]],
        bornes:[feLim({inf:-1},{v:Q(a)},`En ${fx("−∞")}, f se comporte comme le quotient des termes de plus haut degré : ${fx(`${lmF(lmM(a,1),"x")} = ${nb(a)}`)}.`,"On peut aussi diviser le haut et le bas par x : les termes en 1/x tendent vers 0.",[{L:{v:Q(0)},type:"forme ∞/∞",msg:"Le haut et le bas tendent tous les deux vers l'infini : c'est une forme indéterminée, qu'on lève avec les termes de plus haut degré."}])]
          .concat(bords.map(t=>feLim({a:c,c:t},{inf:t*Math.sign(K)},`En ${fx(lmPt({a:c,c:t}))}, le haut tend vers ${fx(nb(K))} et le bas ${fx(den)} tend vers 0 en restant ${t>0?"positif":"négatif"}.`,`${fx(nb(K))} divisé par un nombre ${t>0?"positif":"négatif"} très proche de 0 : le quotient est très grand, de signe ${t*K>0?"+":"−"}.`,[{L:{v:Q(0)},type:"division par 0",msg:FE_DIV}])))
          .concat([feLim({inf:1},{v:Q(a)},`En ${fx("+∞")}, f se comporte comme le quotient des termes de plus haut degré : ${fx(`${lmF(lmM(a,1),"x")} = ${nb(a)}`)}.`,"On peut aussi diviser le haut et le bas par x : les termes en 1/x tendent vers 0.",[{L:{v:Q(0)},type:"forme ∞/∞",msg:"Le haut et le bas tendent tous les deux vers l'infini : c'est une forme indéterminée, qu'on lève avec les termes de plus haut degré."}])])});}
    else{const m=R.ent(1,3),a=R.ent(-4,4),m2=m*m,num=lmPoly([m2-a*c,a-c,1]),nD=lmPoly([c*c-m2,-2*c,1]),du=lmPoly([a-c,2]),z=[feQ(c-m),feQ(c+m)],fa=lmF([dmFac(c-m),dmFac(c+m)].sort((u,v)=>(v==="x")-(u==="x")).join(""),den2),dT=lmF(nD,den2);
      const pgI={L:{v:Q(1)},type:"forme ∞/∞",msg:"Le haut est de degré 2 et le bas de degré 1 : le quotient se comporte comme x²/x = x, qui tend vers l'infini."};
      o=Object.assign(base,{sig:`r${m},${a},${c}`,nat:"fraction rationnelle avec deux extremums",expr:lmF(num,den),f:x=>x+a+m2/(x-c),d:x=>1-m2/(x-c)**2,dT,dTp:`(x^2+(${-2*c})*x+(${c*c-m2}))/(x-(${c}))^2`,dF:fa,
        noeuds:[feInf(-1),feZ(z[0]),feBord(c),feZ(z[1]),feInf(1)],zeros:z,vals:[feQ(c+a-2*m),feQ(c+a+2*m)],
        vWhy:`Pour x ≠ ${nb(c)}, ${fx(`f(x) = ${lmPoly([a,1])} + ${lmF(m2,den)}`)} (on le vérifie en remettant au même dénominateur), puis on remplace x.`,
        dE:[{w:`${fx(`u(x) = ${num}`)} et ${fx(`v(x) = ${den}`)}, donc ${fx(`u′(x) = ${du}`)} et ${fx("v′(x) = 1")}.`,why:"f est un quotient u/v de deux fonctions dérivables, avec v ≠ 0 sur D."},
          {w:`${fx(`f′(x) = ${lmF(`(${du})${denP} − (${num})`,den2)}`)}.`,why:fx("(u/v)′ = (u′v − uv′)/v²")},
          {w:`On développe le haut : ${fx(`f′(x) = ${dT}`)}.`,why:`${fx(`(${du})${denP} = ${lmPoly([-c*(a-c),a-3*c,2])}`)}, puis on retire ${fx(num)} terme à terme.`}],
        sgW:{w:`Le haut vaut ${fx(`${den2} − ${m2}`)}, donc ${fx(`f′(x) = ${fa}`)} : f′ s'annule en ${fx(z[0].t)} et en ${fx(z[1].t)}.`,why:`${fx("A² − B² = (A − B)(A + B)")}. Le bas est un carré, strictement positif sur D ; le haut est un trinôme, positif à l'extérieur de ses racines, négatif entre elles.`},
        dpg:[[x=>-(1-m2/(x-c)**2),`-(${`(x^2+(${-2*c})*x+(${c*c-m2}))/(x-(${c}))^2`})`,"ordre de u′v et uv′",FE_QUOT]],
        bornes:[feLim({inf:-1},{inf:-1},`En ${fx("−∞")}, f se comporte comme le quotient des termes de plus haut degré : ${fx(`${lmF("x²","x")} = x`)}.`,`x tend vers ${fx("−∞")}.`,[pgI])]
          .concat(bords.map(t=>feLim({a:c,c:t},{inf:t},`En ${fx(lmPt({a:c,c:t}))}, le haut tend vers ${fx(String(m2))} (sa valeur en ${fx(nb(c))}) et le bas ${fx(den)} tend vers 0 en restant ${t>0?"positif":"négatif"}.`,`Un nombre positif divisé par un nombre ${t>0?"positif":"négatif"} très proche de 0 : f tend vers ${fx(lmInf(t))}.`,[{L:{v:Q(0)},type:"division par 0",msg:FE_DIV}])))
          .concat([feLim({inf:1},{inf:1},`En ${fx("+∞")}, f se comporte comme le quotient des termes de plus haut degré : ${fx(`${lmF("x²","x")} = x`)}.`,`x tend vers ${fx("+∞")}.`,[pgI])])});}}
  else if(fam==="expo"){const k=R.choix([1,-1,2,-2]),b=R.ent(-5,5),E=lmE(k),u=lmPoly([b,1]),uP=b?`(${u})`:"x",lin=dmAff(k,k*b+1),xq=Q(-b*k-1,k),x0=feQ(xq),m=-b*k-1,ak=Math.abs(k)===1?"":Math.abs(k);
    const dT=k*b+1?`(${lin})${E}`:`${lin} ${E}`,cc={L:{v:Q(0)},w:`c'est une forme « ∞ × 0 ». Par croissances comparées, l'exponentielle l'emporte.`,why:`${fx(`x ${E}`)} tend vers 0${b?`, et ${fx(`${nb(b)}${E}`)} aussi`:""}.`};
    o={sig:`e${k},${b}`,nat:"(x + b)eᵏˣ",expr:`${uP}${b?"":" "}${E}`,f:x=>(x+b)*Math.exp(k*x),d:x=>(k*x+k*b+1)*Math.exp(k*x),P:dmR(),
      Dw:{w:`${fx(u)} et ${fx(E)} se calculent pour tout réel x : ${fx("D = ℝ")}.`,why:"Un polynôme et l'exponentielle sont définis sur ℝ."},
      dJ:`f est le produit de ${fx(`x ↦ ${u}`)} et de ${fx(`x ↦ ${E}`)}, dérivables sur ℝ : f est dérivable sur ℝ.`,dT,dTp:`(${k}*x+(${k*b+1}))*e^(${k}*x)`,dF:dT,
      noeuds:[feInf(-1),feZ(x0),feInf(1)],zeros:[x0],vals:[feEx(Q(-1,k),m)],
      vWhy:`En ${fx(`x = ${x0.t}`)} : ${b?`${fx(`x ${b<0?"−":"+"} ${Math.abs(b)} = ${nb(Q(-1,k))}`)}, et `:""}l'exposant vaut ${fx(`${lmM(k,1)} = ${nb(m)}`)}.`,
      dE:[{w:`${fx(`u(x) = ${u}`)} et ${fx(`v(x) = ${E}`)}, donc ${fx("u′(x) = 1")} et ${fx(`v′(x) = ${coefK(k)}${E}`)}.`,why:`f est un produit uv, et ${fx("(e^{kx})′ = ke^{kx}")}.`},
        {w:`${fx(`f′(x) = ${E} ${k>0?"+":"−"} ${ak}${uP} ${E}`)}, puis on met ${fx(E)} en facteur : ${fx(`f′(x) = ${dT}`)}.`,why:`${fx("(uv)′ = u′v + uv′")}, et ${fx(`1 ${k>0?"+":"−"} ${ak}${uP} = ${lin}`)}.`}],
      sgW:{w:`Une exponentielle est strictement positive : f′(x) a le signe de ${fx(lin)}, qui s'annule en ${fx(`x = ${x0.t}`)}.`,why:`${fx(`${lin} = 0`)} donne ${fx(`x = ${x0.t}`)}, et ${fx(lin)} est une fonction affine ${feAff(k)}.`},
      dpg:[[x=>k*Math.exp(k*x),`${k}*e^(${k}*x)`,"dérivée d'un produit",`${fx("(uv)′ = u′v + uv′")}, et non ${fx("u′v′")}.`]].concat(k===1?[]:[[x=>Math.exp(k*x)*(1+x+b),`(x+(${b+1}))*e^(${k}*x)`,"dérivée de l'exponentielle",`${fx("(e^{kx})′ = ke^{kx}")} : n'oublie pas le facteur ${fx(nb(k))}.`]]),
      bornes:k>0?[feLim({inf:-1},cc.L,`En ${fx("−∞")}, ${fx(u)} tend vers ${fx("−∞")} et ${fx(E)} vers 0 : ${cc.w}`,cc.why,[{L:{inf:-1},type:"croissances comparées",msg:"C'est une forme « ∞ × 0 » : en −∞, l'exponentielle l'emporte sur x, et le produit tend vers 0."}]),
          feLim({inf:1},{inf:1},`En ${fx("+∞")}, ${fx(u)} et ${fx(E)} tendent vers ${fx("+∞")}.`,`Par produit : ${fx("(+∞) × (+∞) = +∞")}.`)]
        :[feLim({inf:-1},{inf:-1},`En ${fx("−∞")}, ${fx(u)} tend vers ${fx("−∞")} et ${fx(E)} vers ${fx("+∞")}.`,`Par produit : ${fx("(−∞) × (+∞) = −∞")}.`),
          feLim({inf:1},cc.L,`En ${fx("+∞")}, ${fx(u)} tend vers ${fx("+∞")} et ${fx(E)} vers 0 : ${cc.w}`,cc.why,[{L:{inf:1},type:"croissances comparées",msg:"C'est une forme « ∞ × 0 » : en +∞, l'exponentielle l'emporte sur x, et le produit tend vers 0."}])]};}
  else if(fam==="log"){const s=R()<0.5?1:-1,p=R.ent(1,3),qq=R.ent(1,6),r=Q(qq,p),x0=feQ(r),px=lmM(p,1),ql=`${qq===1?"":qq+" "}ln(x)`,nm=s>0?`${px} − ${qq}`:`${qq} − ${px}`,lt=r.d===1?`ln ${r.n}`:`ln(${nb(r)})`,qf=`${qq===1?"":qq+" "}${lmF("ln(x)","x")}`;
    const dT=lmF(nm,"x"),ff={type:"forme ∞ − ∞",msg:"C'est une forme « ∞ − ∞ » : on met x en facteur, et ln(x)/x tend vers 0 par croissances comparées."};
    o={sig:`l${s},${p},${qq}`,nat:"x et ln x",expr:s>0?`${px} − ${ql}`:`${ql} − ${px}`,f:x=>s*(p*x-qq*Math.log(x)),d:x=>s*(p-qq/x),P:[dmI(0,true,null,true)],
      Dw:{w:`${fx("ln(x)")} n'existe que pour ${fx(`x ${dmGT} 0`)} : ${fx("D = ]0 ; +∞[")}.`,why:"Le logarithme n'est défini que sur ]0 ; +∞[, le reste se calcule partout."},
      Dpg:[[dmR(),"condition du logarithme oubliée","le logarithme.",`${fx("ln(x)")} n'existe que si ${fx(`x ${dmGT} 0`)}.`,0]],
      dJ:`${fx("x ↦ x")} et ln sont dérivables sur ${fx("]0 ; +∞[")} : f l'est aussi.`,dT,dTp:`(${s})*(${p}*x-${qq})/x`,dF:dT,
      noeuds:[feBord(0),feZ(x0),feInf(1)],zeros:[x0],
      vals:[r.n===r.d?feQ(s*qq):feV(s>0?(qq===1?`1 − ${lt}`:`${qq} − ${qq} ${lt}`):(qq===1?`${lt} − 1`:`${qq} ${lt} − ${qq}`),`(${s})*(${qq}-${qq}*ln(${brut(r)}))`,s*(qq-qq*Math.log(qq/p)))],
      vWhy:p===1?`On remplace x par ${fx(x0.t)} dans f(x).`:`En ${fx(`x = ${x0.t}`)} : ${fx(`${p} × ${x0.t} = ${qq}`)}.`,
      dE:[{w:`${fx(`f′(x) = ${s>0?`${p} − ${lmF(qq,"x")}`:`${lmF(qq,"x")} − ${p}`}`)}.`,why:`${fx("(ln x)′ = 1/x")} et ${fx(`(${px})′ = ${p}`)}.`},
        {w:`Au même dénominateur : ${fx(`f′(x) = ${dT}`)}.`,why:`${fx(`${p} = ${lmF(px,"x")}`)} pour x ≠ 0.`}],
      sgW:{w:`Sur D, ${fx(`x ${dmGT} 0`)} : f′(x) a le signe de ${fx(nm)}, qui s'annule en ${fx(`x = ${x0.t}`)}.`,why:`${fx(`${nm} = 0`)} donne ${fx(`x = ${x0.t}`)}, et ${fx(nm)} est une fonction affine ${feAff(s)}.`},
      dpg:[[x=>s*p,String(s*p),"dérivée du logarithme",`${fx("(ln x)′ = 1/x")} : le terme en ln(x) ne disparaît pas en dérivant.`]],
      bornes:[feLim({a:0,c:1},{inf:s},`En ${fx("0⁺")}, ${fx("ln(x)")} tend vers ${fx("−∞")}, donc ${s>0?`${fx(`−${ql}`)} tend vers ${fx("+∞")}`:`${fx(ql)} tend vers ${fx("−∞")}`}, et ${fx(px)} tend vers 0.`,`${fx("lim_{x → 0⁺} ln(x) = −∞")}, et il n'y a pas de forme indéterminée.`),
        feLim({inf:1},{inf:s},`En ${fx("+∞")}, c'est une forme « ∞ − ∞ ». On met x en facteur : ${fx(`f(x) = x(${s>0?`${p} − ${qf}`:`${qf} − ${p}`})`)}.`,`Par croissances comparées, ${fx("ln(x)/x")} tend vers 0 : la parenthèse tend vers ${fx(nb(s*p))}, et x vers ${fx("+∞")}.`,[Object.assign({L:{v:Q(0)}},ff),Object.assign({L:{inf:-s}},ff)])]};}
  else{const g=R()<0.45?1:2;
    if(g===1){const k=R.ent(1,5),kl=k===1?"ln(x)":`${k} ln(x)`,nm=k===1?"1 − ln(x)":`${k}(1 − ln(x))`,dT=lmF(nm,"x²"),t1=lmF(`${k} − ${kl}`,"x²"),zz=feV("e","e",Math.E);
      o={sig:`q${k}`,nat:"ln(x)/x",expr:lmF(kl,"x"),f:x=>k*Math.log(x)/x,d:x=>k*(1-Math.log(x))/(x*x),dT,dTp:`${k}*(1-ln(x))/x^2`,dF:dT,
        Dw:{w:`${fx("ln(x)")} exige ${fx(`x ${dmGT} 0`)}, et le dénominateur x ne s'annule pas sur ${fx("]0 ; +∞[")} : ${fx("D = ]0 ; +∞[")}.`,why:"Le logarithme n'est défini que pour x strictement positif, et une fraction demande un dénominateur non nul."},
        Dpg:[[dmSauf(0),"condition du logarithme oubliée","le logarithme.",`Le dénominateur n'est pas la seule condition : ${fx("ln(x)")} n'existe que si ${fx(`x ${dmGT} 0`)}.`,0],[dmR(),"condition du logarithme oubliée","le logarithme.",`${fx("ln(x)")} n'existe que si ${fx(`x ${dmGT} 0`)}.`,0]],
        dJ:`ln et ${fx("x ↦ x")} sont dérivables sur ${fx("]0 ; +∞[")}, et x ne s'y annule pas : f est dérivable sur D.`,
        noeuds:[feBord(0),feZ(zz),feInf(1)],zeros:[zz],vals:[feEx(Q(k),-1)],vWhy:`${fx("ln(e) = 1")}, donc ${fx(`f(e) = ${lmF(k,"e")}`)}.`,
        dE:[{w:`${fx(`u(x) = ${kl}`)} et ${fx("v(x) = x")}, donc ${fx(`u′(x) = ${lmF(k,"x")}`)} et ${fx("v′(x) = 1")}.`,why:`f est un quotient u/v, et ${fx("(ln x)′ = 1/x")}.`},
          {w:`${fx(`f′(x) = ${t1}`)}${k===1?"":`, soit ${fx(`f′(x) = ${dT}`)}`}.`,why:`${fx("(u/v)′ = (u′v − uv′)/v²")}, et ${fx(`u′v = ${lmF(k,"x")} × x = ${k}`)}.`}],
        sgW:{w:`${fx("x²")} est strictement positif sur D : f′(x) a le signe de ${fx("1 − ln(x)")}, qui s'annule en ${fx("x = e")}.`,why:`${fx(`1 − ln(x) ${dmGT} 0`)} ⇔ ${fx(`ln(x) ${dmLT} 1`)} ⇔ ${fx(`x ${dmLT} e`)}, car ln est strictement croissante et ${fx("ln(e) = 1")}.`},
        dpg:[[x=>k*(Math.log(x)-1)/(x*x),`${k}*(ln(x)-1)/x^2`,"ordre de u′v et uv′",FE_QUOT]],
        bornes:[feLim({a:0,c:1},{inf:-1},`En ${fx("0⁺")}, ${fx("ln(x)")} tend vers ${fx("−∞")} et ${fx("1/x")} vers ${fx("+∞")}.`,`Ce n'est pas une forme indéterminée : ${fx("(−∞) × (+∞) = −∞")}.`,[{L:{v:Q(0)},type:"pas une forme indéterminée",msg:"(−∞) × (+∞) n'est pas une forme indéterminée : le produit tend vers −∞."}]),
          feLim({inf:1},{v:Q(0)},`En ${fx("+∞")}, c'est une forme « ∞/∞ ».`,`Par croissances comparées, ${fx("ln(x)/x")} tend vers 0 en ${fx("+∞")} : x l'emporte sur ln(x).`,[{L:{inf:1},type:"croissances comparées",msg:"En +∞, x l'emporte sur ln(x) : ln(x)/x tend vers 0."}])]};}
    else{const k=R.choix([1,2,3,-1,-2,-3]),sg=Math.sign(k),kx=lmM(k,1),dT=k===1?"ln(x) + 1":k===-1?"−ln(x) − 1":`${nb(k)}(ln(x) + 1)`,zz=feV("e^{−1}","e^(-1)",1/Math.E),ax=lmM(Math.abs(k),1);
      o={sig:`p${k}`,nat:"x ln(x)",expr:`${kx} ln(x)`,f:x=>k*x*Math.log(x),d:x=>k*(Math.log(x)+1),dT,dTp:`${k}*(ln(x)+1)`,dF:dT,
        Dw:{w:`${fx("ln(x)")} exige ${fx(`x ${dmGT} 0`)} : ${fx("D = ]0 ; +∞[")}.`,why:"Le logarithme n'est défini que sur ]0 ; +∞[."},
        Dpg:[[dmR(),"condition du logarithme oubliée","le logarithme.",`${fx("ln(x)")} n'existe que si ${fx(`x ${dmGT} 0`)}.`,0]],
        dJ:`f est le produit de ${fx(`x ↦ ${kx}`)} et de ln, dérivables sur ${fx("]0 ; +∞[")} : f est dérivable sur D.`,
        noeuds:[feBord(0),feZ(zz),feInf(1)],zeros:[zz],vals:[feEx(Q(-k),-1)],vWhy:`${fx("ln(e^{−1}) = −1")} : on remplace x par ${fx("e^{−1}")} dans f(x).`,
        dE:[{w:`${fx(`u(x) = ${kx}`)} et ${fx("v(x) = ln(x)")}, donc ${fx(`u′(x) = ${nb(k)}`)} et ${fx("v′(x) = 1/x")}.`,why:"f est un produit uv."},
          {w:`${fx(`f′(x) = ${coefK(k)}ln(x) ${k>0?"+":"−"} ${ax} × 1/x`)}, soit ${fx(`f′(x) = ${dT}`)}.`,why:`${fx("(uv)′ = u′v + uv′")}, et ${fx(`${ax} × 1/x = ${Math.abs(k)}`)}.`}],
        sgW:{w:`${k===1?"":`${fx(`f′(x) = ${dT}`)} : `}f′(x) a le signe ${k>0?"de":"contraire de"} ${fx("ln(x) + 1")}, qui s'annule en ${fx("x = e^{−1}")}.`,why:`${fx(`ln(x) + 1 ${dmGT} 0`)} ⇔ ${fx(`ln(x) ${dmGT} −1`)} ⇔ ${fx(`x ${dmGT} e^{−1}`)}, car ln est strictement croissante.`},
        dpg:[[x=>k*Math.log(x),`${k}*ln(x)`,"dérivée d'un produit",`${fx("(uv)′ = u′v + uv′")} : le terme ${fx(`uv′ = ${ax} × 1/x`)} a été oublié.`]],
        bornes:[feLim({a:0,c:1},{v:Q(0)},`En ${fx("0⁺")}, x tend vers 0 et ${fx("ln(x)")} vers ${fx("−∞")} : c'est une forme « 0 × ∞ ».`,`Par croissances comparées, ${fx("x ln(x)")} tend vers 0 en ${fx("0⁺")}.`,[{L:{inf:-sg},type:"croissances comparées",msg:"C'est une forme « 0 × ∞ » : près de 0, x l'emporte sur ln(x), et x ln(x) tend vers 0."}]),
          feLim({inf:1},{inf:sg},`En ${fx("+∞")}, ${fx(kx)} tend vers ${fx(lmInf(sg))} et ${fx("ln(x)")} vers ${fx("+∞")}.`,`Par produit : f tend vers ${fx(lmInf(sg))}.`)]};}
    o.P=[dmI(0,true,null,true)];}
  const N=o.noeuds;o.inter=N.slice(1).map((h,i)=>`]${N[i].t} ; ${h.t}[`);
  o.signes=N.slice(1).map((h,i)=>{const a=N[i].x,b=h.x,m=a===-Infinity?b-1:b===Infinity?a+1:(a+b)/2;return Math.sign(o.d(m));});
  return o;}
const FE_FAM=["cube","homo","homo","expo","expo","log","log","lnx","rat","rat"];
const feFin=b=>`${b.w} Donc ${lmFin(b.P,b.L)}.`;
const feEns=o=>({expr:o.expr,D:dmTp(o.P),dTp:o.dTp,noeuds:o.noeuds.map(n=>n.x),genres:o.noeuds.map(n=>n.k),zeros:o.zeros.map(z=>z.tp),vals:o.vals.map(v=>v.tp),signes:o.signes,
  lims:o.bornes.map((b,i)=>({id:"l"+i,pt:b.P.inf?b.P.inf*Infinity:b.P.a,cote:b.P.c||0,lim:b.L.inf?b.L.inf*Infinity:b.L.v.n/b.L.v.d,aff:lmT(b.L),pieges:b.pg.map(p=>[lmTp(p.L),p.type])}))});
function feTab(o){const N=o.noeuds,S=o.signes,lim=(x,c)=>{const b=o.bornes.find(b=>b.P.inf?!c&&b.P.inf*Infinity===x:b.P.a===x&&b.P.c===c);return b?fx(lmT(b.L)):"";};
  const X=[],Dp=[],F=[];let zi=0;
  N.forEach((n,i)=>{if(i){X.push("");Dp.push(feSg(S[i-1]));F.push(feFl(S[i-1]));}X.push(fx(n.t));
    if(n.k==="inf"){Dp.push("");F.push(lim(n.x,0));}else if(n.k==="zero"){Dp.push("0");F.push(fx(o.vals[zi++].t));}else{Dp.push("‖");F.push(`${lim(n.x,-1)} ‖ ${lim(n.x,1)}`.trim());}});
  const ligne=(t,L)=>`<tr><td>${t}</td> ${L.map(c=>`<td>${c}</td>`).join(" ")}</tr>`;
  return `<div style="overflow-x:auto"><table class="tbl tv"><tbody>${ligne(fx("x"),X)} ${ligne(fx("f′(x)"),Dp)} ${ligne("<b>f</b>",F)}</tbody></table></div>`;}
/* palier 1 : le domaine (le juge de CA15) */
function feDom(R){const o=feTire(R,R.choix(["homo","homo","rat","rat","log","log","lnx","expo"]));
  const e=dmExo({sig:"E"+o.sig,expr:o.expr,P:o.P,nature:o.nat,type:"domaine",pieges:o.Dpg||[],acc:o.acc,
    etapes:[{w:o.Dw.w,why:o.Dw.why,pts:1},{w:`Donc ${fx(`D = ${dmT(o.P)}`)}.`,why:"On écrit D avec des intervalles : crochet ouvert du côté d'une valeur interdite et du côté de l'infini.",pts:1}]});
  e.q=`On commence l'étude de ${fx(`f(x) = ${o.expr}`)}. Donne son domaine de définition D, comme un intervalle ou une réunion d'intervalles.`;
  e.texte="étude de fonction, domaine de "+o.expr;e.ens.etude="dom";return e;}
/* palier 2 : les limites aux bornes du domaine */
function feLims(R){const o=feTire(R,R.choix(FE_FAM)),B=o.bornes,ids=B.map((_,i)=>"l"+i),D=dmT(o.P);
  const E=[{w:`${fx(`D = ${D}`)} : on cherche la limite de f en chaque borne (${B.map(b=>fx(lmPt(b.P))).join(", ")}).`,why:o.noeuds.some(n=>n.k==="bord"&&n.x!==0)?"Autour d'une valeur interdite, on regarde les deux côtés : à gauche et à droite.":"Une limite par borne du domaine.",pts:1}].concat(B.map(b=>({w:feFin(b),why:b.why,pts:1})));
  const ok=(L,lu)=>L.inf?lu.inf===L.inf:lu.v!==undefined&&pres(lu.v,L.v.n/L.v.d);
  function juge(rep){const lu=ids.map(k=>lmLis(rep[k]));
    if(lu.some(x=>!x))return {incomplet:"Écris chaque limite : un nombre exact (3, -1/2), +∞ ou −∞."};
    if(lu.some((x,i)=>x.dec&&!B[i].L.inf&&!ok(B[i].L,x)))return {incomplet:"Donne les valeurs exactes : une fraction, pas un nombre à virgule arrondi."};
    const F=ids.filter((_,i)=>!ok(B[i].L,lu[i]));if(!F.length)return {ok:true};
    const i=ids.indexOf(F[0]),b=B[i],x=lu[i],g=b.pg.find(p=>ok(p.L,x)),et=1+i,ici=`Ici ${lmFin(b.P,b.L)}.`;
    const d=g?lmD(et,g.type,`la limite en ${lmPt(b.P)}.`,`${g.msg} ${ici}`):x.sans?lmD(et,"limite déclarée inexistante",`la limite en ${lmPt(b.P)}.`,`Cette limite existe. ${ici}`)
      :b.L.inf&&x.inf?lmD(et,"signe de l'infini",`la limite en ${lmPt(b.P)}.`,`f tend bien vers l'infini, mais reprends le signe de chaque morceau. ${ici}`):lmD(et,"limite aux bornes",`la limite en ${lmPt(b.P)}.`,ici);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length} limite${F.length>1?"s sont":" est"} à revoir.`,diag:d};}
  const RB=Object.fromEntries(ids.map((k,i)=>[k,lmTp(B[i].L)])),b0=B[0];
  return {sig:"EL"+o.sig,q:`Calcule les limites de ${fx(`f(x) = ${o.expr}`)} aux bornes de son domaine ${fx(`D = ${D}`)}. Réponds par un nombre exact, ${fx("+∞")} ou ${fx("−∞")}.`,corps:"",texte:`étude de fonction, limites de ${o.expr} aux bornes`,
    champs:B.map((b,i)=>({k:"champ",id:ids[i],nom:"limite en "+lmPt(b.P),label:`$lim_{x → ${lmPt(b.P)}} f(x) =$`,ex:"un nombre, +∞ ou −∞"})).concat([{k:"sym",id:"s",sym:LM_SYM,aide:"Les boutons écrivent dans la case où tu es."}]),juge,etapes:E,
    bonne:B.map(b=>fx(`lim_{x → ${lmPt(b.P)}} f(x) = ${lmT(b.L)}`)).join(" ; "),bonneTxt:B.map(b=>`en ${lmPt(b.P)} : ${lmT(b.L)}`).join(" ; "),repBonne:RB,
    repFausse:Object.assign({},RB,{l0:b0.pg.length?lmTp(b0.pg[0].L):b0.L.inf?lmTp({inf:-b0.L.inf}):"17"}),nature:o.nat,ens:Object.assign({etude:"lim"},feEns(o))};}
/* palier 3 : la dérivée, et les valeurs où elle s'annule */
function feLisZ(t){const s=propre(t).toLowerCase();if(!s)return null;if(/^(aucune?s?|aucun|rien|∅|vide|jamais|non|nulle ?part|pas de (solution|valeur)s?)$/.test(s))return [];
  const V=[];for(const p of s.split(/;|,|\bet\b/)){const u=p.replace(/^\s*x\s*=\s*/,"").trim();if(!u)continue;const r=lisReel(u);if(r.v===undefined||r.avecI)return null;if(r.dec)return "dec";V.push(r.v);}
  return V.length?V:null;}
function feDer(R){const o=feTire(R,R.choix(FE_FAM)),D=dmT(o.P),dE=o.dE.map(x=>Object.assign({pts:1},x)),E=dE.concat([{w:o.sgW.w,why:o.sgW.why,pts:1}]),dern=E.length-1;
  const jx=jugeX({ref:o.d,ans:o.dT,fin:dE.length-1,type:"dérivée",pieges:o.dpg.map(p=>[p[0],{etape:dE.length-1,type:p[2],titre:"Où ça part : la dérivée.",msg:p[3]}])});
  const Z=o.zeros.map(z=>z.v),zT=o.zeros.map(z=>fx(`x = ${z.t}`)).join(" et "),bords=o.noeuds.filter(n=>n.k==="bord").map(n=>n.x),fin=Z.length?`f′(x) = 0 pour ${zT}.`:"f′(x) ne s'annule jamais sur D.";
  function juge(rep){const j=jx(rep);if(j.incomplet)return j;const lu=feLisZ(rep.z);
    if(lu===null)return {incomplet:"Écris les valeurs de x séparées par « ; », par exemple 2 ; -1, ou « aucune » si f′ ne s'annule pas."};
    if(lu==="dec")return {incomplet:"Donne les valeurs exactes (une fraction, e, e^(-1)), pas des nombres arrondis."};
    const okZ=lu.length===Z.length&&Z.every(z=>lu.some(v=>pres(v,z)))&&lu.every(v=>Z.some(z=>pres(v,z)));
    if(j.ok&&okZ)return {ok:true};
    const F=(j.ok?[]:["f"]).concat(okZ?[]:["z"]);if(!j.ok)return {ok:false,faux:F,resume:j.resume,diag:j.diag};
    const bv=lu.find(v=>bords.some(b=>pres(v,b))),T="les valeurs où f′ s'annule.";
    const d=bv!==undefined?lmD(dern,"valeur hors du domaine",T,`Pour ${fx(`x = ${nb(bords.find(b=>pres(bv,b)))}`)}, f n'est pas définie : ce n'est pas une valeur de D. ${fin}`)
      :!Z.length?lmD(dern,"f′ ne s'annule pas",T,`${o.sgW.w} ${o.sgW.why}`):!lu.length?lmD(dern,"zéro de f′ oublié",T,fin)
      :lu.length<Z.length&&lu.every(v=>Z.some(z=>pres(v,z)))?lmD(dern,"zéro de f′ oublié",T,`Il y en a ${Z.length} : ${fin}`):lmD(dern,"zéros de f′",T,fin);
    return {ok:false,faux:F,resume:"Pas tout à fait : la dérivée est juste, mais pas les valeurs où elle s'annule.",diag:d};}
  const zB=o.zeros.map(z=>z.tp).join(" ; ")||"aucune";
  return {sig:"ED"+o.sig,q:`Calcule la dérivée de ${fx(`f(x) = ${o.expr}`)} sur ${fx(`D = ${D}`)}, puis donne les valeurs de x où ${fx("f′(x) = 0")}.`,corps:"",texte:`étude de fonction, dérivée de ${o.expr} et ses zéros`,
    champs:[{k:"champ",id:"f",nom:"dérivée",label:"$f′(x) =$",ex:"une formule en x",sym:["e^(","ln(","x","^","/","(",")"],aide:"Écris e^(2x) avec des parenthèses, x^2 pour x², et (…)/(…) pour une fraction."},
      {k:"champ",id:"z",nom:"zéros de f′",label:"$f′(x) = 0$ pour $x =$",ex:"par exemple 2 ; -1, ou aucune"}],juge,etapes:E,
    bonne:`${fx(`f′(x) = ${o.dT}`)} ; ${Z.length?`${fx("f′(x) = 0")} pour ${zT}`:"f′ ne s'annule pas sur D"}`,bonneTxt:`f′(x) = ${o.dT} ; zéros : ${o.zeros.map(z=>z.t).join(" ; ")||"aucun"}`,
    repBonne:{f:o.dTp,z:zB},repFausse:{f:`(${o.dTp})+x`,z:zB},nature:o.nat,ens:Object.assign({etude:"der",dpg:o.dpg.map(p=>[p[1],p[2]])},feEns(o))};}
/* palier 4 : le tableau de variations, case par case */
const feSigne=t=>{const s=propre(t).toLowerCase().replace(/\s/g,"");return /^(\+|positif|positive|pos|>0|plus)$/.test(s)?1:/^(-|négatif|negatif|négative|negative|neg|<0|moins)$/.test(s)?-1:s?0:null;};
const feSens=t=>{const s=propre(t).toLowerCase().replace(/\s/g,"");return /^(↗|croissante?|crois|c|monte|augmente|\/|hausse)$/.test(s)?1:/^(↘|décroissante?|decroissante?|d|descend|diminue|\\|baisse)$/.test(s)?-1:s?0:null;};
function feTabExo(R){const o=feTire(R,R.choix(FE_FAM)),I=o.inter,S=o.signes,zs=o.zeros,D=dmT(o.P),sI=I.map((_,i)=>"s"+i),vI=I.map((_,i)=>"v"+i),yI=zs.map((_,j)=>"y"+j);
  const E=[{w:`${o.sgW.w}<br>${I.map((x,i)=>`sur ${fx(x)} : ${fx(`f′(x) ${S[i]>0?dmGT:dmLT} 0`)}`).join(" ; ")}.`,why:o.sgW.why,pts:1},
    {w:`Donc ${I.map((x,i)=>`f est ${S[i]>0?"croissante":"décroissante"} sur ${fx(x)}`).join(" ; ")}.`,why:"Si f′ est strictement positive sur un intervalle, f y est croissante ; strictement négative, f y est décroissante.",pts:1}];
  if(zs.length)E.push({w:o.vals.map((v,j)=>fx(`f(${zs[j].t}) = ${v.t}`)).join(" et ")+".",why:o.vWhy,pts:1});
  E.push({w:feTab(o),why:"On complète le tableau avec les limites aux bornes du domaine.",pts:1});
  function juge(rep){const s=sI.map(k=>feSigne(rep[k])),v=vI.map(k=>feSens(rep[k])),y=yI.map(k=>lisReel(rep[k]));
    if(s.concat(v).some(x=>x===null)||y.some(r=>r.vide))return {incomplet:"Remplis toutes les cases : le signe (+ ou −), le sens (↗ ou ↘) et les valeurs."};
    if(s.concat(v).some(x=>x===0))return {incomplet:"Pour le signe, écris + ou − ; pour le sens, ↗ ou ↘ (ou croissante, décroissante)."};
    if(y.some(r=>r.v===undefined||r.avecI))return {incomplet:"Je n'arrive pas à lire une valeur. Écris par exemple 2 - 2ln(2), -e^(-1) ou 5/2."};
    if(y.some((r,j)=>r.dec&&!pres(r.v,o.vals[j].v)))return {incomplet:"Donne les valeurs exactes, pas des nombres arrondis."};
    const okS=s.map((x,i)=>x===S[i]),okV=v.map((x,i)=>x===S[i]),okY=y.map((r,j)=>pres(r.v,o.vals[j].v));
    const F=sI.filter((_,i)=>!okS[i]).concat(vI.filter((_,i)=>!okV[i]),yI.filter((_,j)=>!okY[j]));if(!F.length)return {ok:true};
    const i=okS.indexOf(false),iv=okV.indexOf(false),j=okY.indexOf(false),et=E.length-2;
    const d=i>=0?lmD(0,"signe de f′","le signe de f′.",`Sur ${fx(I[i])}, ${fx(`f′(x) ${S[i]>0?dmGT:dmLT} 0`)}. ${o.sgW.why}`)
      :iv>=0?lmD(1,"sens qui ne suit pas le signe de f′","le sens de variation.",`Sur ${fx(I[iv])}, f′ est ${S[iv]>0?"positive : f est croissante (↗)":"négative : f est décroissante (↘)"}.`)
      :pres(y[j].v,zs[j].v)?lmD(et,"abscisse au lieu de la valeur","la valeur de f.",`${fx(zs[j].t)} est l'abscisse : la case attend ${fx(`f(${zs[j].t}) = ${o.vals[j].t}`)}.`)
      :lmD(et,"valeur de f","la valeur de f.",`${fx(`f(${zs[j].t}) = ${o.vals[j].t}`)}. ${o.vWhy}`);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length} case${F.length>1?"s sont":" est"} à revoir.`,diag:d};}
  const RB=Object.assign(Object.fromEntries(sI.map((k,i)=>[k,S[i]>0?"+":"-"])),Object.fromEntries(vI.map((k,i)=>[k,feFl(S[i])])),Object.fromEntries(yI.map((k,j)=>[k,o.vals[j].tp])));
  return {sig:"ET"+o.sig,q:`Dresse le tableau de variations de ${fx(`f(x) = ${o.expr}`)}, en complétant les cases.`,
    corps:`<p>Sur ${fx(`D = ${D}`)}, ${fx(`f′(x) = ${o.dF}`)}${zs.length?`, qui s'annule en ${zs.map(z=>fx(z.t)).join(" et ")}`:""}.</p>${I.map((x,i)=>`<p><b>Sur ${fx(x)}</b> : signe de ${fx("f′(x)")} ${O.trou(sI[i])} ; sens de f ${O.trou(vI[i])}</p>`).join("")}${zs.map((z,j)=>`<p>${fx(`f(${z.t}) =`)} ${O.trou(yI[j],1)}</p>`).join("")}`,
    corpsPapier:`<p>Sur ta feuille, dresse le tableau de variations en entier : la ligne de x, le signe de f′, les flèches, les valeurs aux points où f′ s'annule et les limites aux bornes.</p>`,
    texte:`étude de fonction, tableau de variations de ${o.expr}`,
    champs:[{k:"trous",ids:sI.concat(vI,yI)},{k:"sym",id:"sy",sym:[["+","+"],["−","-"],["↗","↗"],["↘","↘"]],aide:"Pour le signe, + ou − ; pour le sens, ↗ ou ↘ (tu peux aussi écrire croissante ou décroissante). Les boutons écrivent dans la case où tu es."}],juge,etapes:E,
    bonne:feTab(o),bonneTxt:I.map((x,i)=>`${x} : ${feSg(S[i])} ${feFl(S[i])}`).join(" ; ")+(zs.length?" ; "+o.vals.map((v,j)=>`f(${zs[j].t}) = ${v.t}`).join(" ; "):""),
    repBonne:RB,repFausse:Object.assign({},RB,{s0:S[0]>0?"-":"+",v0:feFl(-S[0])}),nature:o.nat,ens:Object.assign({etude:"tab"},feEns(o))};}
/* palier 5 : l'étude complète, sur papier, avec le barème du CC1 2025 */
function fePapier(R){const o=feTire(R,R.choix(FE_FAM));
  const L=[[o.Dw.w,o.Dw.why,1],[o.bornes.map(b=>`${feFin(b)} <span class="muted">${b.why}</span>`).join("<br>"),"Une limite par borne du domaine, et des deux côtés d'une valeur interdite.",1.5],
    [o.dJ,"Sommes, produits, quotients (dénominateur non nul) et composées de fonctions dérivables sont dérivables.",1],
    [o.dE.map(x=>x.w).concat([o.sgW.w]).join("<br>"),o.dE.map(x=>x.why).concat([o.sgW.why]).join(" "),1.5],
    [feTab(o)+(o.zeros.length?`<p>${o.vals.map((v,j)=>fx(`f(${o.zeros[j].t}) = ${v.t}`)).join(" et ")}.</p>`:""),o.zeros.length?o.vWhy:"f′ garde le même signe sur chaque intervalle de D : f n'a pas d'extremum.",1.5]];
  return G.ana.papierQ("EP"+o.sig,`Étude complète de ${fx(`f(x) = ${o.expr}`)}, comme au CC1 2025 (exercice 1) et au CC 2023 (exercice 3).`,
    `<ol type="a"><li>Donne le domaine de définition D de f.</li><li>Détermine les limites de f aux bornes de D.</li><li>Montre que f est dérivable sur D.</li><li>Calcule ${fx("f′(x)")} et étudie son signe.</li><li>Dresse le tableau de variations de f, avec les valeurs aux points où f′ s'annule.</li></ol><p class="muted">Toute réponse doit être justifiée : la rédaction compte, comme au CC.</p>`,
    L,Object.assign({etude:"pap"},feEns(o)),o.nat);}

/* les exports servent aux contrôles (tools/verif/calc.js) */
G.calc={lis,val,lettres,lisReel,lisCx,pres,presC};

G.add("calc",[
 {id:"CA1",t:"Complexes : la forme algébrique a + ib",tache:"complexes, la forme algébrique",th:"cxalg",pts:2.5,ex:"cc2",lecons:["c2-cx-alg"],
  paliers:[
   {t:"un produit ou un carré",cc:2,gen:produit},
   {t:"un quotient : le conjugué du dénominateur",cc:3,gen:quotient},
   {t:"les puissances de i, (1 + i)ⁿ, un cube",cc:3,min:160,gen:puissances},
   {t:"une équation avec z, ou avec z et son conjugué",cc:5,gen:equation}]},
 {id:"CA2",t:"Complexes : module, argument, forme exponentielle",tache:"complexes, module et argument",th:"cxalg",pts:2.5,ex:"cc2",lecons:["c2-cx-exp"],apres:["CA1"],
  paliers:[
   {t:"un point sur un axe ou sur une diagonale",cc:2,min:60,gen:R=>versPolaire(R,true)},
   {t:"les angles π/6 et π/3",cc:3,min:70,gen:R=>versPolaire(R,false)},
   {t:"produit, quotient, puissance, opposé",cc:3,gen:operation},
   {t:"une puissance en forme algébrique, par la forme exponentielle",cc:5,min:100,gen:puissanceAlg}]},
 {id:"CA6",t:"Équation différentielle d'ordre 2 sans second membre",tache:"ordre 2, l'équation caractéristique",th:"ed2",pts:4,ex:"cc2",lecons:["c2-ed2"],
  paliers:[
   {t:"deux racines réelles",cc:3,min:100,gen:R=>generaleED(R,"2")},
   {t:"une racine double",cc:3,min:45,gen:R=>generaleED(R,"1")},
   {t:"des racines complexes",cc:3,min:60,gen:R=>generaleED(R,"3")},
   {t:"avec y(0) et y′(0), comme au TD 2",cc:7,gen:conditionsED}]},
 {id:"CA7",t:"Ordre 2 avec second membre",tache:"ordre 2 avec second membre",th:"ed2sm",pts:4,ex:"cc2",lecons:["c2-ed2-sm"],apres:["CA6"],
  paliers:[
   {t:"un second membre constant",cc:4,min:120,gen:R=>particuliere(R,R.choix(["2","2","1","3"]),"cst")},
   {t:"un polynôme",cc:6,gen:R=>particuliere(R,R.choix(["2","2","1","3"]),"poly")},
   {t:"une exponentielle",cc:5,gen:R=>particuliere(R,R.choix(["2","2","1","3"]),"exp")},
   {t:"une exponentielle déjà solution de l'équation sans second membre",cc:5,min:150,gen:R=>particuliere(R,R()<0.65?"2":"1","res")},
   {t:"avec y(0) et y′(0), comme au TD 2 (exercice 4)",cc:10,gen:conditionsSM}]},
 {id:"CA3",t:"Moivre et Euler",tache:"Moivre et Euler",th:"euler",pts:2.5,ex:"cc2",lecons:["c2-cx-euler"],apres:["CA2"],
  paliers:[
   {t:"cos(2θ) et sin(2θ)",cc:2,min:90,gen:double},
   {t:"linéariser cos², sin² et sin cos",cc:3,min:45,gen:lineaire2},
   {t:"linéariser cos³, sin³, cos⁴…",cc:4,min:25,gen:lineaire3},
   {t:"cos(3θ) et sin(3θ)",cc:3,min:85,gen:triple},
   {t:"cos et sin d'un angle en π/12, comme au TD 3 (exercice 7)",cc:8,min:20,gen:valeurPi12}]},
 {id:"CA4",t:"Racines carrées et second degré dans ℂ",tache:"second degré dans ℂ",th:"cxeq",pts:2.5,ex:"cc2",lecons:["c2-cx-eq"],apres:["CA1"],
  paliers:[
   {t:"un discriminant négatif",cc:3,min:180,gen:deltaNeg},
   {t:"les racines carrées de a + ib",cc:4,min:90,gen:racineCarree},
   {t:"des coefficients complexes",cc:6,gen:coefComplexes},
   {t:"une équation bicarrée, comme au TD 3 (exercice 11)",cc:7,min:40,gen:bicarree}]},
 {id:"CA5",t:"Racines n-ièmes",tache:"racines n-ièmes",th:"racn",pts:2,ex:"cc2",lecons:["c2-cx-racn"],apres:["CA2"],
  paliers:[
   {t:"zⁿ = 1, −1, i ou −i",cc:3,min:25,gen:R=>racN(R,1)},
   {t:"zⁿ = un réel ou un imaginaire pur",cc:3,min:40,gen:R=>racN(R,2)},
   {t:"zⁿ = w en forme algébrique, comme au TD 3 (exercice 12)",cc:4,min:100,gen:R=>racN(R,3)},
   {t:"les n solutions en forme algébrique",cc:7,min:35,gen:racAlg}]},
 {id:"CA8",t:"Dériver",tache:"dériver",th:"derivees",pts:2.5,lecons:["c-derivees"],
  paliers:[
   {t:"un produit",cc:2,gen:deriveProduit},
   {t:"un quotient",cc:3,min:200,gen:deriveQuotient},
   {t:"une composée : eᵘ, ln u, √u, uⁿ",cc:2,min:160,gen:R=>deriveCompo(R,false)},
   {t:"tout mélangé",cc:3,gen:R=>deriveCompo(R,true)}]},
 {id:"CA10",t:"Primitives : reconnaître la forme",tache:"primitives",th:"primitives",pts:2.5,lecons:["c-primitives"],
  paliers:[
   {t:"u′uⁿ",cc:2,min:150,gen:R=>primitive(R,"pow")},
   {t:"u′/u",cc:2,min:150,gen:R=>primitive(R,"log")},
   {t:"u′eᵘ, cos et sin",cc:2,min:100,gen:R=>primitive(R,R()<0.6?"exp":"trig")},
   {t:"tout mélangé",cc:2,min:190,gen:R=>primitive(R)}]},
 {id:"CA11",t:"Intégration par parties",tache:"intégration par parties",th:"ipp",pts:5,lecons:["c-ipp"],pages:["m-ipp"],
  paliers:[
   {t:"un exemple à compléter : (ax + b)eᵏˣ",cc:5,min:200,gen:R=>exoIpp(R,"exp",true)},
   {t:"(ax + b)eᵏˣ, en entier",cc:5,min:200,gen:R=>exoIpp(R,"exp",false)},
   {t:"x cos x, x sin x, xⁿ ln x, avec des bornes",cc:6,min:110,gen:R=>exoIpp(R,R()<0.55?"trig":"ln",false)},
   {t:"ln x et arctan x : u = ln x ou arctan x, v′ = 1",cc:6,min:12,gen:R=>exoIpp(R,R()<0.75?"lnx":"atan",false)},
   {t:"deux intégrations par parties de suite",cc:9,min:10,gen:R=>exoIpp(R,"deux",false)}]},
 {id:"CA12",t:"Changement de variable",tache:"changement de variable",th:"integrales",pts:1.5,lecons:["c-integrales"],pages:["m-chgt"],apres:["CA10"],
  paliers:[
   {t:"u = ax + b : les nouvelles bornes, puis la valeur",cc:3,min:70,gen:R=>exoCv(cvAffine(R),1)},
   {t:"u donné par l'énoncé : x² + c, eˣ, ln x, √x, sin x",cc:4,min:60,gen:R=>exoCv(cvForme(R,0),2)},
   {t:"u à trouver",cc:5,min:60,gen:R=>exoCv(cvForme(R,1),3)},
   {t:"tout changer : x, dx et les bornes, comme au TD 1 (exercice 5)",cc:8,min:35,gen:R=>exoCv(cvTout(R),4)}]},
 {id:"CA13",t:"Équation différentielle d'ordre 1, variation de la constante",tache:"équation différentielle d'ordre 1",th:"ed1",pts:2,lecons:["c-ed0","c-ed1"],pages:["m-varcst"],apres:["CA10"],
  paliers:[
   {t:"y′ + ay = 0",cc:2,min:48,gen:R=>d1Homog(R,true)},
   {t:"y′ + a(x)y = 0",cc:3,min:55,gen:R=>d1Homog(R,false)},
   {t:"une solution particulière évidente",cc:4,min:200,gen:d1Evidente},
   {t:"la variation de la constante : un exemple à compléter",cc:6,min:190,gen:R=>d1Variation(R,true)},
   {t:"la variation de la constante, en entier",cc:7,min:170,gen:R=>d1Variation(R,false)},
   {t:"avec une condition initiale, comme au CC 2023 (exercice 2)",cc:9,gen:d1Initiale}]},
 {id:"CA14",t:"Calculer une limite",tache:"calculer une limite",th:"limites",pts:3,lecons:["c-limites"],
  paliers:[
   {t:"en +∞ ou −∞ : un polynôme, un quotient de polynômes",cc:2,gen:lmQuot},
   {t:"en un nombre : simplifier « 0/0 », ou trouver le signe de l'infini",cc:3,gen:lmEnA},
   {t:"croissances comparées : exponentielle, puissances, logarithme",cc:2,min:150,gen:lmCroiss},
   {t:"un taux d'accroissement, comme sin(x)/x",cc:3,min:120,gen:lmTaux},
   {t:"des racines : la quantité conjuguée",cc:4,min:170,gen:lmConj},
   {t:"tout mélangé, comme au TD 1 (exercices 1 et 2)",cc:3,gen:lmMix}]},
 {id:"CA15",t:"Domaine de définition",tache:"domaine de définition",th:"domaine",pts:1.5,lecons:["c-domaine"],
  paliers:[
   {t:"une racine ou un logarithme",cc:2,gen:R=>dmSimple(R,true)},
   {t:"un quotient : les valeurs qui annulent le dénominateur",cc:2,gen:R=>dmQuot(R,true)},
   {t:"le signe d'un trinôme ou d'un quotient, sous une racine ou un logarithme",cc:4,gen:dmSigne},
   {t:"plusieurs conditions à la fois",cc:4,gen:dmDeux},
   {t:"tout mélangé, comme au TD 1 (exercice 3) et aux CC",cc:3,gen:dmMix}]},
 {id:"CA9",t:"Étude de fonction",tache:"étude de fonction",th:"derivees",pts:2,lecons:["c-derivees"],apres:["CA8","CA14","CA15"],
  paliers:[
   {t:"le domaine de définition",cc:2,min:180,gen:feDom},
   {t:"les limites aux bornes du domaine",cc:4,min:180,gen:feLims},
   {t:"la dérivée, et les valeurs où elle s'annule",cc:4,min:180,gen:feDer},
   {t:"le tableau de variations",cc:5,min:180,gen:feTabExo},
   {t:"l'étude complète sur papier, comme au CC1 2025 (exercice 1)",cc:15,min:180,gen:fePapier}]}
]);
})();
