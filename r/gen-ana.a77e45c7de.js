/* Générateurs d'Analyse (CC1 : les réels et les bornes, les suites, les limites de fonctions). */
(function(){
"use strict";
const G=window.GEN,O=G.outils,{Q,q,add,sub,mul,div,egal,nb,brut,par,comb,propre,nombre}=O;
const fx=s=>s.replace(/&[a-z]+;/g,"x").replace(/[_{}]/g,"").length>30||s.length>36?O.f(s):O.fx(s);
const h=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];
const dec=v=>v.toFixed(3).replace(".",",").replace("-","−");

/* ---------- AN1 : le tableau du CC (intervalle, inf, min, max, sup) ---------- */
/* une valeur : un rationnel, ou ±√k */
const val=x=>{x=q(x);return {q:x,v:x.n/x.d,t:nb(x)};};
const rac=(k,s)=>({q:null,rac:k,s,v:s*Math.sqrt(k),t:(s<0?"−":"")+"√"+k});
const tape=V=>V?(V.q?brut(V.q):(V.s<0?"-":"")+"√"+V.rac):"non";
const F=V=>fx(V.t);
/* un morceau : un intervalle de a à b (null = infini), oa et ob disent si le crochet est ouvert */
const pc=(a,oa,b,ob)=>({a,oa:!a||oa,b,ob:!b||ob});
const pt=p=>`${p.oa?"]":"["}${p.a?p.a.t:"−∞"} ; ${p.b?p.b.t:"+∞"}${p.ob?"[":"]"}`;
const un=P=>P.map(pt).join(" ∪ ");
const dansP=(P,x)=>P.some(p=>(!p.a||x>p.a.v||(x===p.a.v&&!p.oa))&&(!p.b||x<p.b.v||(x===p.b.v&&!p.ob)));
function unir(P){P=P.slice().sort((x,y)=>(x.a?x.a.v:-Infinity)-(y.a?y.a.v:-Infinity)||(x.oa-y.oa));const S=[];
  P.forEach(p=>{const c=S[S.length-1],pa=p.a?p.a.v:-Infinity,pb=p.b?p.b.v:Infinity;
    if(c){const cb=c.b?c.b.v:Infinity;
      if(pa<cb||(pa===cb&&!(p.oa&&c.ob))){if(pb>cb||(pb===cb&&!p.ob)){c.b=p.b;c.ob=p.ob;}return;}}
    S.push({a:p.a,oa:p.oa,b:p.b,ob:p.ob});});return S;}
function lisVal(s){s=propre(s).toLowerCase().replace(/ /g,"").replace(/[.!]+$/,"");if(!s)return null;
  if(/^(non|no|pas|aucune?|rien|pasde.*|n['’]?existepas|existepas|il(n['’]?)?yenapas|∅|-|\/)$/.test(s))return {non:true};
  if(/∞|infini|inf$|oo$/.test(s))return {infini:true};
  const m=/^([+-]?)(?:√|sqrt|rac(?:ine)?(?:de)?|v)\(?(\d+)\)?$/.exec(s);
  if(m){const k=+m[2],r=Math.round(Math.sqrt(k));return r*r===k?{q:Q(m[1]==="-"?-r:r)}:{rac:k,s:m[1]==="-"?-1:1};}
  const x=nombre(s);return x?{q:x}:null;}
const meme=(lu,V)=>V?(V.q?!!lu.q&&egal(lu.q,V.q):lu.rac===V.rac&&lu.s===V.s):!!lu.non;

const COTE=[{b:"inf",m:"min",borne:"borne inférieure",elt:"minimum",mino:"minoré",minorant:"minorant",grand:"plus grand des minorants",petit:"plus petit élément",sens:"plus grands",loin:"aussi petits qu'on veut (−10, −1 000, et ainsi de suite)"},
            {b:"sup",m:"max",borne:"borne supérieure",elt:"maximum",mino:"majoré",minorant:"majorant",grand:"plus petit des majorants",petit:"plus grand élément",sens:"plus petits",loin:"aussi grands qu'on veut (10, 1 000, et ainsi de suite)"}];
const att=(i,v,n)=>`${F(v)} est l'élément obtenu pour n = ${n}, et tous les autres sont ${COTE[i].sens} : c'est le ${COTE[i].petit} de A. Quand le ${COTE[i].elt} existe, la ${COTE[i].borne} lui est égale.`;
const lim=(i,v,raison)=>`${raison} Donc ${F(v)} est le ${COTE[i].grand} de A. Mais aucun élément de A ne vaut ${F(v)} : A n'a pas de ${COTE[i].petit}.`;
const sans=(i,raison)=>`${raison} Aucun nombre n'est un ${COTE[i].minorant} de A : il n'y a ni ${COTE[i].borne}, ni ${COTE[i].elt}.`;
function bilan(E){if(E.B)return Object.assign({inter:false},E.B);const g=E.P[0],d=E.P[E.P.length-1],r=E.rat;
  return {inter:E.P.length===1&&!r,inf:g.a,min:g.a&&!g.oa&&(!r||g.a.q)?g.a:null,sup:d.b,max:d.b&&!d.ob&&(!r||d.b.q)?d.b:null};}
function trou(E){if(E.trou)return E.trou;
  if(E.rat)return `Entre deux nombres rationnels, il y a toujours des nombres irrationnels, et ils ne sont pas dans A : A est plein de trous.`;
  const D=k=>dansP(E.P,k/2),N=k=>F(val(Q(k,2)));
  for(let k=-79;k<80;k++){if(D(k))continue;let a=k-1,b=k+1;while(a>=-80&&!D(a))a--;while(b<=80&&!D(b))b++;
    if(a>=-80&&b<=80){const m=Math.round((a+b)/2);return `Un intervalle n'a pas de trou. Ici ${N(a)} et ${N(b)} sont dans A, mais pas ${N(m)}, qui est entre les deux.`;}}
  return `A est fait de deux morceaux séparés : il y a un trou entre les deux.`;}
function cote(E,B,i){const C=COTE[i],b=B[C.b],m=B[C.m],sur=E.why&&E.why[i];
  if(!b)return {w:`A n'est pas ${C.mino} : <b>pas de ${C.borne}</b>, et <b>pas de ${C.elt}</b>.`,why:sur||`A contient des nombres ${C.loin} : aucun nombre n'est un ${C.minorant} de A. Sans ${C.minorant}, il n'y a ni ${C.borne}, ni ${C.elt}.`,pts:0.5};
  if(m)return {w:`<b>${fx(`${C.m} A = ${b.t}`)}</b>, donc aussi <b>${fx(`${C.b} A = ${b.t}`)}</b>.`,why:sur||`${F(b)} est dans A, et tous les autres éléments de A sont ${C.sens} : c'est le ${C.petit} de A. Quand le ${C.elt} existe, la ${C.borne} lui est égale.`,pts:0.5};
  return {w:`<b>${fx(`${C.b} A = ${b.t}`)}</b>, mais <b>pas de ${C.elt}</b>.`,why:sur||`Tous les éléments de A sont ${C.sens} que ${F(b)}, et A en contient d'aussi proches de ${F(b)} qu'on veut : ${F(b)} est le ${C.grand} de A. Mais ${E.rat&&!b.q?`${F(b)} n'est pas un nombre rationnel : il n'est pas dans A`:`${F(b)} n'est pas dans A`}, donc A n'a pas de ${C.petit}.`,pts:0.5};}

const NB=["inf A","min A","max A","sup A"],CLE=["inf","min","max","sup"];
const LIB={int:"la réponse « intervalle »",inf:"inf A",min:"min A",max:"max A",sup:"sup A",el:"le nombre de la dernière case"};
const RAPPEL=`<p class="muted">Rappel : un minorant de A est un nombre plus petit que tous les éléments de A, ou égal. inf A est le plus grand des minorants ; min A est le plus petit élément de A, il doit être dans A. De l'autre côté : majorant, sup A (le plus petit des majorants) et max A (le plus grand élément).</p>`;
function tableau(E,palier,eps){const B=bilan(E),VB=[B.inf,B.min,B.max,B.sup];
  const dansA=(x,v)=>E.suiteF?!!x.q&&E.dansN(x.q):(!E.rat||!!x.q)&&dansP(E.P,v);
  const etapes=[Object.assign({pts:0.5},E.forme),
    B.inter?{w:`<b>A est un intervalle.</b>`,why:`Un intervalle est une partie de ℝ sans trou : dès qu'il contient deux nombres, il contient tous les nombres qui sont entre les deux. C'est le cas de ${fx(pt(E.P[0]))}.`,pts:0.25}:{w:`<b>A n'est pas un intervalle.</b>`,why:trou(E),pts:0.25},
    cote(E,B,0),cote(E,B,1)];
  let ex=null,seuil=0,seuilT="",nEx=null;
  if(eps&&B.sup){const e=eps.n/eps.d;seuil=B.sup.v-e;seuilT=B.sup.q?nb(sub(B.sup.q,eps)):dec(seuil);
    if(B.max)ex=B.max;
    else if(E.suiteF){for(let n=E.n0;n<=E.n0+E.nmax;n++){const t=E.terme(n);if(t.n/t.d>seuil){ex=val(t);nEx=n;break;}}}
    else{const C=B.sup.q?[div(eps,2),Q(1,10),Q(1,100),Q(1,1000)].map(t=>sub(B.sup.q,t)):[10,100,1000,10000].map(d=>Q(Math.floor(B.sup.v*d),d));
      for(const c of C){const v=c.n/c.d;if(v>seuil&&dansP(E.P,v)){ex=val(c);break;}}}
    const ec=E.ecSup,den=ec?(ec.c?`(n + ${ec.c})`:"n"):"";
    etapes.push({w:`${fx(`sup A − ${nb(eps)} ${B.sup.q?"=":"≈"} ${seuilT}`)}. Un élément de A strictement plus grand : <b>${F(ex)}</b>${nEx!==null?` (le terme obtenu pour n = ${nEx})`:""}, par exemple.`,
      why:B.max?`Le plus simple est de prendre le plus grand élément de A, puisqu'il est dans A. Tout autre élément de A strictement plus grand que ${fx(seuilT)} convient aussi.`:ec&&nEx!==null?`Les éléments de A s'écrivent ${fx(`${nb(B.sup.q)} − ${ec.K}/${den}`)}. Ils sont strictement plus grands que ${fx(`${nb(B.sup.q)} − ${nb(eps)}`)} dès que ${fx(`${ec.K}/${den} &lt; ${nb(eps)}`)}, c'est-à-dire ${fx(`${ec.c?`n + ${ec.c}`:"n"} &gt; ${nb(div(Q(ec.K),eps))}`)}. Le premier rang qui marche est n = ${nEx}, et le terme de ce rang vaut ${F(ex)}. Tout terme de rang plus grand convient aussi. C'est la caractérisation de la borne supérieure : pour tout ${fx("ε &gt; 0")}, il existe a dans A tel que ${fx("sup A − ε &lt; a")}.`:`sup A est le plus petit des majorants : un nombre plus petit que sup A n'est pas un majorant de A, donc il y a un élément de A au-dessus de lui. C'est la caractérisation de la borne supérieure : pour tout ${fx("ε &gt; 0")}, il existe a dans A tel que ${fx("sup A − ε &lt; a")}.`,pts:0.5});}
  else if(eps)etapes.push({w:`A n'a pas de borne supérieure : <b>la dernière case reste vide</b>.`,why:`Chercher un élément de A plus grand que ${fx("sup A − "+nb(eps))} n'a de sens que si sup A existe.`,pts:0.25});
  function diagCote(i,L){const C=COTE[i],b=B[C.b],m=B[C.m],lb=L[i?3:0],lm=L[i?2:1];if(meme(lb,b)&&meme(lm,m))return null;const e=2+i;
    if(!b)return {etape:e,type:`ensemble cru ${C.mino}`,titre:`Où ça part : ${C.b} A.`,msg:`A n'est pas ${C.mino} : il contient des nombres ${C.loin}. Il n'a donc ni ${C.borne}, ni ${C.elt}.`};
    if(!m&&meme(lm,b))return {etape:e,type:`${C.elt} donné alors que la borne n'est pas dans l'ensemble`,titre:`Où ça part : ${C.m} A.`,msg:`${F(b)} n'est pas dans A : ce n'est pas un élément de A, donc pas son ${C.petit}. La ${C.borne}, elle, n'a pas besoin d'être dans A.`};
    if(lb.non)return {etape:e,type:`${C.borne} dite inexistante pour un ensemble ${C.mino}`,titre:`Où ça part : ${C.b} A.`,msg:`A est ${C.mino}, par exemple par ${F(b)}. Un ensemble non vide et ${C.mino} a toujours une ${C.borne}, même quand il n'a pas de ${C.elt}.`};
    if(m&&lm.non&&meme(lb,b))return {etape:e,type:`${C.elt} oublié alors que la borne est dans l'ensemble`,titre:`Où ça part : ${C.m} A.`,msg:`${F(b)} est dans A : c'est le ${C.petit} de A.`};
    return {etape:E.suiteF?e:0,type:`valeur de la ${C.borne}`,titre:E.suiteF?`Où ça part : ${C.b} A.`:"Où ça part : la forme simple de A.",msg:`${fx(`${C.b} A = ${b.t}`)}${m?`, et c'est aussi le ${C.elt}`:`, et il n'y a pas de ${C.elt}`}.`};}
  function juge(rep){
    if(!rep.int)return {incomplet:"Dis d'abord si A est un intervalle : oui ou non."};
    const L=NB.map(k=>lisVal((rep.b||{})[k]));
    if(L.some(x=>!x))return {incomplet:"Remplis les quatre cases : un nombre quand il existe (3, -1/2, ou rac(2) pour √2), « non » quand il n'existe pas."};
    if(L.some(x=>x.infini))return {incomplet:"Une borne est un nombre réel, jamais +∞ ou −∞. Si elle n'existe pas, réponds « non », comme dans le tableau du CC."};
    const Fx=[];if((rep.int==="oui")!==B.inter)Fx.push("int");CLE.forEach((k,i)=>{if(!meme(L[i],VB[i]))Fx.push(k);});
    let dEl=null;
    if(eps&&B.sup&&!Fx.includes("sup")){const x=lisVal(rep.el);
      if(!x||x.non||x.infini)return {incomplet:`Tu as donné une borne supérieure : écris aussi, dans la dernière case, un élément de A strictement plus grand que sup A − ${nb(eps)} (un nombre comme 1,95 ou 39/20).`};
      const v=x.q?x.q.n/x.q.d:x.s*Math.sqrt(x.rac);
      if(!dansA(x,v)){Fx.push("el");dEl={etape:4,type:"nombre proposé qui n'est pas dans A",titre:"Où ça part : la dernière case.",msg:v===B.sup.v?`${F(B.sup)} est la borne supérieure, mais il n'est pas dans A. Il faut un élément de A, un peu en dessous.`:`Le nombre que tu proposes n'est pas dans A. Il faut un élément de A, strictement plus grand que ${fx(seuilT)}.`};}
      else if(!(v>seuil)){Fx.push("el");dEl={etape:4,type:"élément trop loin de la borne supérieure",titre:"Où ça part : la dernière case.",msg:`Ton nombre est bien dans A, mais il n'est pas strictement plus grand que ${fx(seuilT)}.`};}}
    if(!Fx.length)return {ok:true};
    const diag=diagCote(0,L)||diagCote(1,L)||(Fx.includes("int")?{etape:1,type:B.inter?"intervalle non reconnu":"ensemble pris pour un intervalle",titre:"Où ça part : intervalle ou pas.",msg:B.inter?`A est un intervalle : ${fx(pt(E.P[0]))}, sans trou.`:trou(E)}:dEl);
    return {ok:false,faux:Fx,resume:`Pas tout à fait : ${et(Fx.map(k=>LIB[k]))} ${Fx.length>1?"sont à revoir":"est à revoir"}.`,diag};}
  const b={};NB.forEach((k,i)=>{b[k]=tape(VB[i]);});
  const bF=Object.assign({},b);
  if(B.inf&&!B.min)bF["min A"]=tape(B.inf);else if(B.min)bF["min A"]="non";else{bF["inf A"]="0";bF["min A"]="0";}
  const champs=[{k:"choix",id:"int",o:[["oui","A est un intervalle"],["non","A n'est pas un intervalle"]]},
    {k:"cases",id:"b",noms:NB,sym:["non","√"],aide:"Dans chaque case : un nombre quand il existe (3, -1/2, ou rac(2) pour √2), « non » quand il n'existe pas."}];
  if(eps)champs.push({k:"champ",id:"el",nom:"élément de A",label:`Si sup A existe, un élément de A strictement plus grand que $sup A − ${nb(eps)}$ :`,ex:"vide si sup A n'existe pas"});
  const el=eps&&B.sup?tape(ex):"";
  return {sig:"T"+E.sig+(eps?","+brut(eps):""),
    q:`On pose ${fx("A = "+h(E.ecrit))}. A est-il un intervalle ? Donne ensuite sa borne inférieure inf A, son plus petit élément min A, son plus grand élément max A et sa borne supérieure sup A : écris le nombre quand il existe, et « non » quand il n'existe pas.${eps?` Dernière case : si sup A existe, donne un élément de A strictement plus grand que ${fx("sup A − "+nb(eps))} ; sinon, laisse-la vide.`:""}`,
    corps:(E.note?`<p>${E.note}</p>`:"")+(palier<3?RAPPEL:""),texte:`A = ${E.ecrit} : intervalle ? inf, min, max, sup${eps?` ; un élément de A plus grand que sup A − ${brut(eps)}`:""}`,
    champs,juge,etapes,
    bonne:`${B.inter?"intervalle : oui":"intervalle : non"} ; ${CLE.map((k,i)=>`${k} : ${VB[i]?F(VB[i]):"non"}`).join(" ; ")}${eps?` ; dernière case : ${ex?`${F(ex)}, par exemple`:"vide"}`:""}`,
    bonneTxt:`intervalle : ${B.inter?"oui":"non"} ; ${CLE.map((k,i)=>`${k} A : ${VB[i]?VB[i].t:"non"}`).join(" ; ")}${eps?` ; dernière case : ${ex?ex.t+" (par exemple)":"vide"}`:""}`,
    repBonne:Object.assign({int:B.inter?"oui":"non",b},eps?{el}:{}),repFausse:Object.assign({int:B.inter?"oui":"non",b:bF},eps?{el}:{}),
    nature:E.sig.slice(0,2),ens:{m:E.m,terme:E.terme,n0:E.n0,nmax:E.nmax,rat:!!E.rat,eps:eps?eps.n/eps.d:0}};}

/* les familles d'ensembles */
const CRO=[[false,false],[true,true],[false,true],[true,false]];
const NSTAR="ℕ* est l'ensemble des entiers 1, 2, 3, et ainsi de suite.",NNAT="ℕ est l'ensemble des entiers 0, 1, 2, 3, et ainsi de suite.",NRAT="ℚ est l'ensemble des nombres rationnels : les quotients de deux entiers.";
const UNION="Le signe ∪ se lit « union » : A contient les nombres qui sont dans l'un des deux intervalles, ou dans les deux.";
const TXT={"<":"strictement inférieure à","≤":"inférieure ou égale à",">":"strictement supérieure à","≥":"supérieure ou égale à"};
const OPS=["<","≤",">","≥"];
const demi=(R,lo,hi)=>R()<0.25?Q(2*R.ent(lo,hi-1)+1,2):Q(R.ent(lo,hi));
function eInterv(R){const a=demi(R,-9,9),b=add(a,R()<0.25?Q(2*R.ent(0,5)+1,2):Q(R.ent(1,9))),[oa,ob]=R.choix(CRO),p=pc(val(a),oa,val(b),ob);
  return {sig:"IN"+pt(p),ecrit:pt(p),P:[p],m:x=>dansP([p],x),
    forme:{w:`On lit les crochets de ${fx("A = "+pt(p))} : ${F(p.a)} ${oa?"n'est pas":"est"} dans A, et ${F(p.b)} ${ob?"n'est pas":"est"} dans A.`,why:`Un crochet tourné vers le nombre, comme dans « [2 » ou « 5] », garde ce nombre dans l'ensemble. Un crochet qui lui tourne le dos, comme dans « ]2 » ou « 5[ », l'exclut.`}};}
function eDemi(R){const a=demi(R,-9,9),o=R()<0.5,g=R()<0.5,V=val(a),p=g?pc(null,true,V,o):pc(V,o,null,true);
  return {sig:"DD"+pt(p),ecrit:pt(p),P:[p],m:x=>dansP([p],x),
    forme:{w:`${fx("A = "+pt(p))} est une demi-droite : tous les réels ${g?(o?"strictement plus petits que":"plus petits que"):(o?"strictement plus grands que":"plus grands que")} ${F(V)}${o?"":`, et ${F(V)} lui-même`}.`,why:`Du côté de ${g?"−∞":"+∞"}, l'ensemble ne s'arrête jamais. ${g?"−∞":"+∞"} n'est pas un nombre : c'est seulement une façon d'écrire « sans fin de ce côté ».`}};}
function eDeux(R,mode){const a=R.ent(-9,5),b=a+R.ent(2,5);let c,d;
  if(mode==="rec"||mode==="int"){c=R.ent(a+1,b-1);d=b+R.ent(1,4);}else if(mode==="dis"){c=b+R.ent(1,3);d=c+R.ent(1,4);}else{c=b;d=c+R.ent(1,4);}
  const k1=R.choix(CRO),k2=R.choix(CRO),p1=pc(val(a),k1[0],val(b),k1[1]),p2=pc(val(c),k2[0],val(d),k2[1]),A=nb(a),Bt=nb(b),C=nb(c),D=nb(d);
  if(mode==="int"){const p=pc(p2.a,p2.oa,p1.b,p1.ob);
    return {sig:"NT"+pt(p1)+pt(p2),ecrit:`${pt(p1)} ∩ ${pt(p2)}`,note:"Le signe ∩ se lit « inter » : A contient les nombres qui sont dans les deux intervalles à la fois.",P:[p],m:x=>dansP([p1],x)&&dansP([p2],x),
      forme:{w:`On écrit A plus simplement : ${fx("A = "+pt(p))}.`,why:`Un nombre est dans A quand il est dans les deux intervalles à la fois. Il doit être ${p2.oa?"strictement plus grand que":"au moins égal à"} ${fx(C)} (deuxième intervalle) et ${p1.ob?"strictement plus petit que":"au plus égal à"} ${fx(Bt)} (premier intervalle). Les deux autres conditions sont alors vraies toutes seules.`}};}
  const P=unir([p1,p2]),o={sig:"UN"+pt(p1)+pt(p2),ecrit:`${pt(p1)} ∪ ${pt(p2)}`,note:UNION,P,m:x=>dansP([p1],x)||dansP([p2],x)};
  if(mode==="rec")o.forme={w:`Les deux morceaux se recouvrent : ${fx("A = "+un(P))}.`,why:`${fx(C)} est plus petit que ${fx(Bt)} : le deuxième intervalle commence avant la fin du premier. Ensemble, ils couvrent tout de ${fx(A)} à ${fx(D)}, sans trou. Le crochet de gauche est celui de ${fx(A)}, le crochet de droite celui de ${fx(D)}.`};
  else if(mode==="dis")o.forme={w:`Les deux morceaux sont séparés : entre ${fx(Bt)} et ${fx(C)}, aucun nombre n'est dans A.`,why:`A ne se simplifie pas. Pour les bornes, on regarde le bout tout à gauche, celui de ${fx(A)}, et le bout tout à droite, celui de ${fx(D)}.`};
  else if(P.length===1)o.forme={w:`Les deux morceaux se touchent en ${fx(Bt)}, et ${fx(Bt)} est dans A : ${fx("A = "+un(P))}.`,why:`${fx(Bt)} est gardé par au moins un des deux intervalles : un seul crochet fermé suffit. Il n'y a donc pas de trou.`};
  else o.forme={w:`Les deux morceaux se touchent en ${fx(Bt)}, mais ${fx(Bt)} n'est dans aucun des deux : il manque un seul point.`,why:`Les deux crochets en ${fx(Bt)} sont ouverts. A contient tous les nombres de ${fx(A)} à ${fx(D)}, sauf ${fx(Bt)}.`};
  return o;}

/* ensembles des termes d'une suite : o.terme(n), premier rang o.n0, bilan o.B écrit à la main, raisons o.why */
function suite(o){const T=[0,1,2,3].map(k=>val(o.terme(o.n0+k)));o.suiteF=true;
  o.dansN=x=>{for(let n=o.n0;n<=o.n0+o.nmax;n++)if(egal(o.terme(n),x))return true;return false;};
  let z=T[0];for(const c of [Q(1,2),Q(1,3),Q(2,3),Q(1,5)]){const y=add(T[0].q,mul(sub(T[1].q,T[0].q),c));if(!o.dansN(y)){z=val(y);break;}}
  o.trou=`A est fait de points séparés : ${F(T[0])} et ${F(T[1])} sont dans A, mais pas ${F(z)}, qui est entre les deux.`;
  o.forme={w:`Les premiers éléments de A : ${T.map((x,k)=>`${F(x)} (pour n = ${o.n0+k})`).join(", ")}, et ainsi de suite.`,why:o.mono};return o;}
function sInv(R){const a=R.ent(-9,9),b=R.nz(-9,9),Bn=Math.abs(b),ex=(a?nb(a)+(b>0?" + ":" − "):(b>0?"":"−"))+Bn+"/n",ext=val(a+b),li=val(a),i=b>0?1:0;
  const o={sig:"S1,"+a+","+b,ecrit:`{${ex}, n ∈ ℕ*}`,note:NSTAR,terme:n=>add(a,Q(b,n)),n0:1,nmax:4000,B:b>0?{inf:li,min:null,max:ext,sup:ext}:{inf:ext,min:ext,max:null,sup:li},why:[],ecSup:b<0?{K:Bn,c:0}:null,
    mono:`Quand n grandit, ${fx(Bn+"/n")} diminue et se rapproche de 0 : les éléments de A ${b>0?"diminuent":"augmentent"} et se rapprochent de ${F(li)}.`};
  o.why[i]=att(i,ext,1);o.why[1-i]=lim(1-i,li,`${fx(Bn+"/n")} est strictement positif, et aussi petit qu'on veut quand n est grand : tous les éléments de A sont strictement ${b>0?"plus grands":"plus petits"} que ${F(li)}, et il y en a d'aussi proches de ${F(li)} qu'on veut.`);return suite(o);}
function sQuot(R){const a=R.nz(-9,9),c=R.ent(1,6),An=Math.abs(a),co=(a<0?"−":"")+(An===1?"":An),li=val(a),z=val(0),i=a>0?0:1;
  const o={sig:"S2,"+a+","+c,ecrit:`{${co}n/(n + ${c}), n ∈ ℕ}`,note:NNAT,terme:n=>Q(a*n,n+c),n0:0,nmax:4000,B:a>0?{inf:z,min:z,max:null,sup:li}:{inf:li,min:null,max:z,sup:z},why:[],ecSup:a>0?{K:An*c,c}:null,
    mono:`Quand n grandit, les éléments de A ${a>0?"augmentent":"diminuent"} et se rapprochent de ${F(li)}.`};
  o.why[i]=att(i,z,0);o.why[1-i]=lim(1-i,li,`On peut écrire ${fx(`${co}n/(n + ${c}) = ${nb(a)} ${a>0?"−":"+"} ${An*c}/(n + ${c})`)}. Comme ${fx(`${An*c}/(n + ${c})`)} est strictement positif, et aussi petit qu'on veut quand n est grand, les éléments de A sont strictement ${a>0?"plus petits":"plus grands"} que ${F(li)} et s'en approchent autant qu'on veut.`);return suite(o);}
function sAlt(R){const a=R.ent(-9,9),b=R.nz(-9,9),Bn=Math.abs(b),fr=Bn===1?"(−1)ⁿ/n":`(−1)ⁿ × ${Bn}/n`,ex=(a?nb(a)+(b>0?" + ":" − "):(b>0?"":"−"))+fr,v1=val(a-b),v2=val(add(a,Q(b,2))),mn=b>0?v1:v2,mx=b>0?v2:v1,c=F(val(a));
  return suite({sig:"S3,"+a+","+b,ecrit:`{${ex}, n ∈ ℕ*}`,note:NSTAR,terme:n=>add(a,Q(n%2?-b:b,n)),n0:1,nmax:4000,B:{inf:mn,min:mn,max:mx,sup:mx},
    mono:`(−1)ⁿ vaut −1 quand n est impair et 1 quand n est pair : les éléments de A sautent d'un côté et de l'autre de ${c}, de moins en moins loin.`,
    why:[`${F(mn)} est l'élément obtenu pour n = ${b>0?1:2}. Les autres éléments du même côté de ${c} en sont plus proches, et ceux de l'autre côté sont plus grands : ${F(mn)} est le plus petit élément de A. Quand le minimum existe, la borne inférieure lui est égale.`,
         `${F(mx)} est l'élément obtenu pour n = ${b>0?2:1}. Les autres éléments du même côté de ${c} en sont plus proches, et ceux de l'autre côté sont plus petits : ${F(mx)} est le plus grand élément de A. Quand le maximum existe, la borne supérieure lui est égale.`]});}
function sAltQ(R){const c=R.ent(1,9),k=R.ent(1,4),co=c===1?"":c,mc=val(-c),pcv=val(c);
  return suite({sig:"S4,"+c+","+k,ecrit:`{(−1)ⁿ × ${co}n/(n + ${k}), n ∈ ℕ}`,note:NNAT,terme:n=>Q((n%2?-1:1)*c*n,n+k),n0:0,nmax:4000,B:{inf:mc,min:null,max:null,sup:pcv},
    mono:`Pour n pair, l'élément est positif ou nul ; pour n impair, il est négatif. Dans les deux cas, il s'éloigne de 0 quand n grandit.`,
    why:[lim(0,mc,`Pour n impair, l'élément vaut ${fx(`−${co}n/(n + ${k}) = −${c} + ${c*k}/(n + ${k})`)} : il est strictement plus grand que ${F(mc)}, et aussi proche de ${F(mc)} qu'on veut. Pour n pair, il est positif ou nul.`),
         lim(1,pcv,`Pour n pair, l'élément vaut ${fx(`${co}n/(n + ${k}) = ${c} − ${c*k}/(n + ${k})`)} : il est strictement plus petit que ${F(pcv)}, et aussi proche de ${F(pcv)} qu'on veut. Pour n impair, il est négatif.`)]});}
function sAltPlus(R){const a=R()<0.35?R.ent(1,3):-R.ent(1,9),Bn=Math.abs(a),u=val(1),mu=val(-1);let o;
  if(a>0){const mx=val(add(1,Q(a,2)));o={B:{inf:mu,min:null,max:mx,sup:mx},why:[lim(0,mu,`Pour n impair, l'élément vaut ${fx(`−1 + ${a}/n`)} : il est strictement plus grand que ${F(mu)}, et aussi proche de ${F(mu)} qu'on veut. Pour n pair, il est plus grand que 1.`),
    `Pour n pair, l'élément vaut ${fx(`1 + ${a}/n`)} : le plus grand est celui de n = 2, qui vaut ${F(mx)}. Pour n impair, il vaut ${fx(`−1 + ${a}/n`)}, qui ne dépasse pas ${F(val(a-1))}. Donc ${F(mx)} est le plus grand élément de A, et la borne supérieure lui est égale.`]};}
  else{const mn=val(-1-Bn);o={B:{inf:mn,min:mn,max:null,sup:u},why:[`Pour n impair, l'élément vaut ${fx(`−1 − ${Bn}/n`)} : le plus petit est celui de n = 1, qui vaut ${F(mn)}. Pour n pair, il vaut ${fx(`1 − ${Bn}/n`)}, qui est plus grand. Donc ${F(mn)} est le plus petit élément de A, et la borne inférieure lui est égale.`,
    lim(1,u,`Pour n pair, l'élément vaut ${fx(`1 − ${Bn}/n`)} : il est strictement plus petit que 1, et aussi proche de 1 qu'on veut. Pour n impair, il est plus petit que ${F(mu)}.`)]};}
  return suite(Object.assign(o,{sig:"S5,"+a,ecrit:`{(−1)ⁿ ${a>0?"+":"−"} ${Bn}/n, n ∈ ℕ*}`,note:NSTAR,terme:n=>add(n%2?-1:1,Q(a,n)),n0:1,nmax:4000,
    mono:`(−1)ⁿ vaut −1 quand n est impair et 1 quand n est pair : il y a deux familles d'éléments, l'une près de −1 et l'autre près de 1.`}));}
function sArith(R){const a=R.nz(-6,6),b=R.ent(-9,9),ex=comb([a],["n"])+(b?(b>0?" + ":" − ")+Math.abs(b):""),p=val(b),i=a>0?0:1;
  const o={sig:"S6,"+a+","+b,ecrit:`{${ex}, n ∈ ℕ}`,note:NNAT,terme:n=>Q(a*n+b),n0:0,nmax:4000,B:a>0?{inf:p,min:p,max:null,sup:null}:{inf:null,min:null,max:p,sup:p},why:[],
    mono:`Quand n grandit, ${fx(ex)} ${a>0?"augmente":"diminue"} sans s'arrêter.`};
  o.why[i]=att(i,p,0);o.why[1-i]=sans(1-i,`Les éléments de A deviennent ${a>0?"aussi grands":"aussi petits"} qu'on veut quand n grandit.`);return suite(o);}
function sPuis(R){const k=R.choix([2,3,5,10]),neg=R()<0.4,ex=neg?`(−${k})ⁿ`:`${k}ⁿ`,u=val(1);
  return suite({sig:"S8,"+k+","+neg,ecrit:`{${ex}, n ∈ ℕ}`,note:NNAT,terme:n=>Q(Math.pow(neg?-k:k,n)),n0:0,nmax:12,B:neg?{inf:null,min:null,max:null,sup:null}:{inf:u,min:u,max:null,sup:null},
    mono:neg?`Le signe change à chaque fois, et les éléments s'éloignent de 0 de plus en plus vite.`:`Chaque élément vaut ${k} fois le précédent : ils augmentent sans s'arrêter.`,
    why:neg?[sans(0,`Pour n impair, ${fx(ex)} est négatif et devient aussi petit qu'on veut.`),sans(1,`Pour n pair, ${fx(ex)} est positif et devient aussi grand qu'on veut.`)]:[att(0,u,0),sans(1,`${fx(ex)} devient aussi grand qu'on veut quand n grandit.`)]});}
function sGeo(R){const a=R.nz(-9,9),k=R.choix([2,3,4,5,10]),An=Math.abs(a),ex=(a<0?"−":"")+An+"/"+k+"ⁿ",p=val(a),z=val(0),i=a>0?1:0;
  const o={sig:"S7,"+a+","+k,ecrit:`{${ex}, n ∈ ℕ}`,note:NNAT,terme:n=>Q(a,Math.pow(k,n)),n0:0,nmax:14,B:a>0?{inf:z,min:null,max:p,sup:p}:{inf:p,min:p,max:null,sup:z},why:[],
    mono:`Quand n grandit, ${fx(k+"ⁿ")} devient très grand : les éléments de A se rapprochent de 0.`};
  o.why[i]=att(i,p,0);o.why[1-i]=lim(1-i,z,`${fx(An+"/"+k+"ⁿ")} est strictement positif, et aussi petit qu'on veut quand n est grand : tous les éléments de A sont strictement ${a>0?"plus grands":"plus petits"} que 0, et il y en a d'aussi proches de 0 qu'on veut.`);return suite(o);}
function eSuite(R){const t=R();return t<0.25?sInv(R):t<0.45?sAlt(R):t<0.6?sArith(R):t<0.74?sQuot(R):t<0.85?sGeo(R):t<0.94?sAltQ(R):t<0.98?sAltPlus(R):sPuis(R);}

/* ensembles donnés par une inéquation */
const coupe=(op,g,d)=>{const st=op==="<"||op===">";return op==="<"||op==="≤"?[pc(g,st,d,st)]:[pc(null,true,g,st),pc(d,st,null,true)];};
const ou=(op,g,d)=>`${op==="<"||op==="≤"?`entre ${F(g)} et ${F(d)}`:`à gauche de ${F(g)} ou à droite de ${F(d)}`}${op==="<"||op===">"?", sans les atteindre":", ces deux nombres compris"}`;
const vrai=(op,y,c)=>op==="<"?y<c-1e-9:op==="≤"?y<=c+1e-9:op===">"?y>c+1e-9:y>=c-1e-9;
function iAbs(R,op){const a=R.ent(-9,9),r=R.ent(1,9),g=val(a-r),d=val(a+r),ax=a?`|x ${a>0?"−":"+"} ${Math.abs(a)}|`:"|x|",P=coupe(op,g,d);
  return {sig:"IA,"+a+","+r+","+op,ecrit:`{x ∈ ℝ, ${ax} ${op} ${r}}`,P,m:x=>vrai(op,Math.abs(x-a),r),
    forme:{w:`On écrit A sans valeur absolue : ${fx("A = "+un(P))}.`,why:`${fx(ax)} est la distance entre x et ${F(val(a))}${a<0?`, car ${fx(`x + ${-a} = x − (${nb(a)})`)}`:""}. Elle est ${TXT[op]} ${r} quand x est ${ou(op,g,d)}.`}};}
function iCarre(R){const c=R.choix([1,2,3,4,5,6,7,9,16,25]),op=R.choix(OPS),k=Math.round(Math.sqrt(c)),car=k*k===c,g=car?val(-k):rac(c,-1),d=car?val(k):rac(c,1),P=coupe(op,g,d);
  return {sig:"IC,"+c+","+op,ecrit:`{x ∈ ℝ, x² ${op} ${c}}`,P,m:x=>vrai(op,x*x,c),
    forme:{w:`On écrit A plus simplement : ${fx("A = "+un(P))}.`,why:`${fx(`x² ${h(op)} ${c}`)} veut dire que la distance entre x et 0 est ${TXT[op]} ${F(d)}${car?`, car ${fx(`${k}² = ${c}`)}`:""} : x est ${ou(op,g,d)}.`}};}
function iAff(R){const m=R.nz(-4,4),s=R.ent(-9,9),p=R.ent(-9,9),op=R.choix(OPS),c=m*s+p,o2=m<0?{"<":">","≤":"≥",">":"<","≥":"≤"}[op]:op,st=o2==="<"||o2===">",V=val(s);
  const p1=o2==="<"||o2==="≤"?pc(null,true,V,st):pc(V,st,null,true),mx=comb([m],["x"]),ex=mx+(p?(p>0?" + ":" − ")+Math.abs(p):""),W=[];
  if(p)W.push(`On ${p>0?"retire":"ajoute"} ${Math.abs(p)} des deux côtés : ${fx(`${mx} ${h(op)} ${nb(c-p)}`)}.`);
  if(m!==1)W.push(`On divise par ${fx(nb(m))}${m<0?" : c'est un nombre négatif, donc le sens de l'inégalité change":""}.`);
  if(!W.length)W.push("L'inéquation est déjà résolue : il reste à l'écrire comme une demi-droite.");
  return {sig:"IF,"+m+","+s+","+p+","+op,ecrit:`{x ∈ ℝ, ${ex} ${op} ${nb(c)}}`,P:[p1],m:x=>vrai(op,m*x+p,c),
    forme:{w:`On résout l'inéquation : ${fx(`x ${h(o2)} ${nb(s)}`)}, donc ${fx("A = "+pt(p1))}.`,why:W.join(" ")}};}
function iProd(R){const a=R.ent(-9,7),b=a+R.ent(1,8),op=R.choix(OPS),st=op==="<"||op===">",fa=t=>t?`(x ${t>0?"−":"+"} ${Math.abs(t)})`:"x",g=val(a),d=val(b),P=coupe(op,g,d);
  return {sig:"IP,"+a+","+b+","+op,ecrit:`{x ∈ ℝ, ${fa(a)}${fa(b)} ${op} 0}`,P,m:x=>vrai(op,(x-a)*(x-b),0),
    forme:{w:`On écrit A plus simplement : ${fx("A = "+un(P))}.`,why:`Le produit vaut 0 en ${F(g)} et en ${F(d)}. Entre les deux, les deux facteurs sont de signes contraires : le produit est négatif. À gauche de ${F(g)} ou à droite de ${F(d)}, ils ont le même signe : le produit est positif. ${st?"L'inégalité est stricte : les deux nombres où le produit vaut 0 sont exclus.":"L'inégalité est large : les deux nombres où le produit vaut 0 sont gardés."}`}};}
function eIneq(R){const t=R();return t<0.25?iAbs(R,R.choix(["<","≤"])):t<0.4?iAbs(R,R.choix([">","≥"])):t<0.55?iCarre(R):t<0.8?iAff(R):iProd(R);}

/* les ensembles des tableaux du CC */
function cRat(R){const k=R.choix([2,3,5]),r=rac(k,R()<0.3?-1:1),[o1,o2]=R.choix(CRO),p=R()<0.5?pc(r,o1,val(Math.ceil(r.v)+R.ent(0,3)),o2):pc(val(Math.floor(r.v)-R.ent(0,3)),o1,r,o2);
  return {sig:"CQ"+pt(p),ecrit:`ℚ ∩ ${pt(p)}`,note:NRAT,rat:true,P:[p],m:x=>dansP([p],x),
    forme:{w:`A est l'ensemble des nombres rationnels de l'intervalle ${fx(pt(p))}.`,why:`Entre deux réels différents, il y a toujours un nombre rationnel : A a donc la même borne inférieure et la même borne supérieure que l'intervalle ${fx(pt(p))}. Mais ${F(r)} n'est pas rationnel : il ne peut pas être dans A, même avec un crochet fermé.`}};}
function cRatCarre(R){const c=R.choix([2,3,5,6,7,4,9]),st=R()<0.4,k=Math.round(Math.sqrt(c)),car=k*k===c,g=car?val(-k):rac(c,-1),d=car?val(k):rac(c,1),p=pc(g,st,d,st),op=st?"<":"≤";
  return {sig:"CC,"+c+","+st,ecrit:`{x ∈ ℚ, x² ${op} ${c}}`,note:NRAT,rat:true,P:[p],m:x=>vrai(op,x*x,c),
    forme:{w:`${fx(`A = ℚ ∩ ${pt(p)}`)} : les nombres rationnels de cet intervalle.`,why:`${fx(`x² ${h(op)} ${c}`)} veut dire que x est ${ou(op,g,d)}. Et entre deux réels différents il y a toujours un rationnel : A a la même borne inférieure et la même borne supérieure que cet intervalle.${car?"":` Mais ${F(g)} et ${F(d)} ne sont pas rationnels : ils ne sont pas dans A.`}`}};}
function cPrive(R){const a=R.ent(-8,6),[o1,o2]=R.choix(CRO),t=R();let I,P;
  if(t<0.6){I=pc(val(a),o1,val(a+R.ent(1,5)),o2);P=[pc(null,true,I.a,!o1),pc(I.b,!o2,null,true)];}
  else if(t<0.8){I=pc(val(a),o1,null,true);P=[pc(null,true,I.a,!o1)];}
  else{I=pc(null,true,val(a),o2);P=[pc(I.b,!o2,null,true)];}
  return {sig:"CP"+pt(I),ecrit:`ℝ ∖ ${pt(I)}`,note:`Le signe ∖ se lit « privé de » : A contient tous les réels qui ne sont pas dans ${fx(pt(I))}.`,P,m:x=>!dansP([I],x),
    forme:{w:`On écrit A plus simplement : ${fx("A = "+un(P))}.`,why:`On enlève de ℝ tous les nombres de ${fx(pt(I))}. Il reste ce qui est ${P.length>1?"à gauche et à droite":I.b?"à droite":"à gauche"}. Attention aux crochets : un nombre gardé par ${fx(pt(I))} est enlevé de A, un nombre exclu de ${fx(pt(I))} reste dans A.`}};}
function cImage(R){const a=R.nz(-6,6),b=R.ent(1,6),car=R()<0.4,An=Math.abs(a),bout=val(Q(a,b)),z=val(0),p=a>0?pc(z,true,bout,false):pc(bout,false,z,true),den=`${b} + ${car?"t²":"t"}`,ex=(a<0?"−":"")+An+"/("+den+")";
  return {sig:"CI,"+a+","+b+","+car,ecrit:`{${ex}, t ∈ ${car?"ℝ":"ℝ⁺"}}`,note:car?"":"ℝ⁺ est l'ensemble des réels positifs ou nuls.",P:[p],m:x=>x!==0&&a/x-b>=-1e-9,
    forme:{w:`On écrit A plus simplement : ${fx("A = "+pt(p))}.`,why:`Quand t parcourt ${car?"ℝ":"ℝ⁺"}, ${fx(den)} prend toutes les valeurs à partir de ${b}, c'est-à-dire tous les réels de ${fx(`[${b} ; +∞[`)}. Donc ${fx(ex)} prend toutes les valeurs entre 0 et ${F(bout)} : la valeur ${F(bout)} est atteinte pour t = 0, et la valeur 0 n'est jamais atteinte.`}};}
const EPS=[Q(1,10),Q(1,10),Q(1,100),Q(1,5),Q(1,2)];
function commeAuCC(R){const t=R();
  if(t<0.15)return tableau(R()<0.5?sInv(R):sQuot(R),4,R.choix([Q(1,10),Q(1,5),Q(1,2)]));
  const E=t<0.37?cRat(R):t<0.5?cRatCarre(R):t<0.65?cPrive(R):t<0.8?cImage(R):t<0.9?eDeux(R,R()<0.6?"rec":"dis"):R()<0.5?iAbs(R,R.choix(OPS)):iAff(R);
  return tableau(E,4,R.choix(EPS));}

/* ---------- AN2 : la limite d'une suite avec ε, trouver un rang ---------- */
const IND="₀₁₂₃₄₅₆₇₈₉",ind=n=>String(n).split("").map(c=>IND[+c]).join("");
const dq=x=>{x=q(x);return String(x.n/x.d).replace(".",",").replace("-","−");};
const d3=v=>String(+(Math.abs(v)>=1000?v.toFixed(0):v.toPrecision(3))).replace(".",",").replace("-","−");
/* un écart comparé à ε : assez de chiffres pour voir de quel côté il est */
function pres(v,ref){if(Math.abs(v-ref)<1e-12)return "exactement "+d3(ref);for(let p=3;p<10;p++){const t=+v.toPrecision(p);if(t!==ref&&(t<ref)===(v<ref))return "environ "+String(t).replace(".",",");}return "environ "+d3(v);}
const PARTIE=`E(x) est la partie entière de x : le plus grand entier inférieur ou égal à x. Donc E(x) + 1 est un entier strictement plus grand que x.`;
/* uₙ = (an + b)/(cn + d), avec a = 0 ou c = 1 : limite a, écart |uₙ − a| = K/(cn + d) */
function homog(a,b,c,d){const n0=d>0?0:1,num=a?comb([a],["n"])+(b?(b>0?" + ":" − ")+Math.abs(b):""):nb(b),den=comb([c],["n"])+(d?" + "+d:""),denT=d||c>1?`(${den})`:den,K=Math.abs(a?b-a*d:b),sg=a>0?"−":"+",A=Math.abs(a);
  return {a,b,c,d,n0,K,l:Q(a),den,denT,expr:`${a&&b?`(${num})`:num}/${denT}`,ecartT:`${K}/${denT}`,abs:a?`|uₙ ${sg} ${A}|`:"|uₙ|",u:n=>Q(a*n+b,c*n+d),ecart:n=>K/(c*n+d),sig:[a,b,c,d].join(","),
    ou:`pour tout entier ${n0?"n ≥ 1":"naturel n"}`,
    pourquoi:a?`On met au même dénominateur : ${fx(`uₙ ${sg} ${A} = (${num} ${sg} ${A===1?"":A}(n + ${d}))/(n + ${d})`)}, ce qui donne ${fx(`${nb(b-a*d)}/(n + ${d})`)} : les termes en n ont disparu. Il reste à prendre la valeur absolue.`:b<0?"Le numérateur est négatif et le dénominateur positif : la valeur absolue enlève le signe.":"Tout est positif : la valeur absolue ne change rien."};}
const tireNul=R=>homog(0,R.nz(-9,9),R()<0.7?1:R.ent(2,3),R.ent(0,9));
function tireQuot(R){for(;;){const a=R.nz(-6,6),d=R.ent(1,6),b=R.ent(-9,9);if(b!==a*d)return homog(a,b,1,d);}}
const EPSN=[Q(1,10),Q(1,100),Q(1,20),Q(1,5),Q(1,50),Q(1,1000),Q(1,4),Q(1,2),Q(1,200),Q(1,25)];
function rangNum(S,eps,avecL){const Ke=div(S.K,eps),T=div(sub(Ke,S.d),S.c),N0=Math.max(S.n0,Math.ceil(T.n/T.d)),e=eps.n/eps.d,ok=N=>N>=S.n0&&S.ecart(N)<=e*(1+1e-12),L=nb(S.l),E=[];
  if(avecL)E.push({w:`<b>${fx(`ℓ = ${L}`)}</b>`,why:`Pour n grand, le numérateur se comporte comme ${fx(comb([S.a],["n"]))} et le dénominateur comme n : le quotient se rapproche de ${fx(L)}. Pour le démontrer, on divise le numérateur et le dénominateur par n.`,pts:1});
  E.push({w:`${fx(`${S.abs} = ${S.ecartT}`)}`,why:S.pourquoi,pts:1});
  E.push({w:`${fx(`${S.ecartT} ≤ ${dq(eps)}`)} quand ${fx(`${S.den} ≥ ${nb(Ke)}`)}, c'est-à-dire quand ${fx(`n ≥ ${nb(T)}`)}.`,why:`Les deux côtés sont positifs : on peut échanger la place du dénominateur et celle de ${dq(eps)}. Et ${fx(`${S.K}/${dq(eps)} = ${nb(Ke)}`)}.${S.d||S.c>1?` Puis on ${S.d?`retire ${S.d} des deux côtés`:""}${S.d&&S.c>1?" et on ":""}${S.c>1?`divise par ${S.c}, qui est positif`:""}.`:""}`,pts:1});
  E.push({w:`<b>${fx(`N = ${N0}`)}</b> convient, et tout entier plus grand aussi.`,why:`${T.d!==1&&N0>S.n0?`${fx(nb(T))} vaut environ ${(T.n/T.d).toFixed(2).replace(".",",")} : ce n'est pas un entier, et le premier entier au-dessus est ${N0}. `:""}Vérification : ${fx(`|u${ind(N0)} − ${par(S.l)}| = ${S.K}/${S.c*N0+S.d}`)}, ${pres(S.ecart(N0),e)} : c'est bien inférieur ou égal à ${dq(eps)}. Et plus n est grand, plus cet écart est petit.`,pts:1});
  const pas=E.length-2;
  function juge(rep){const c=rep.c||{};let lu=null;
    if(avecL){lu=nombre(String(c["ℓ"]==null?"":c["ℓ"]).replace(/^\s*[ℓl]\s*=/i,""));if(!lu)return {incomplet:"Écris la limite ℓ : un nombre, par exemple 3 ou -1/2."};}
    const N=nombre(String(c.N==null?"":c.N).replace(/^\s*N\s*=/i,""));if(!N)return {incomplet:"Écris un rang N : un entier, par exemple 250."};
    if(N.d!==1||N.n<0)return {incomplet:"Un rang est un entier naturel : 0, 1, 2, et ainsi de suite."};
    if(avecL&&!egal(lu,S.l))return {ok:false,faux:["ℓ"],resume:"Pas tout à fait : la limite ℓ est à revoir.",diag:{etape:0,type:"limite d'un quotient de deux expressions en n",titre:"Où ça part : la limite.",msg:`Le numérateur se comporte comme ${fx(comb([S.a],["n"]))} et le dénominateur comme n : ${fx(`ℓ = ${L}`)}.`}};
    if(ok(N.n))return {ok:true};
    return {ok:false,faux:["N"],resume:`Pas tout à fait : N = ${N.n} est trop petit.`,diag:{etape:pas,type:"rang trop petit",titre:"Où ça part : la résolution de l'inéquation.",msg:N.n<S.n0?`La suite commence à n = ${S.n0}.`:`Avec N = ${N.n} : ${fx(`|u${ind(N.n)} − ${par(S.l)}| = ${S.K}/${S.c*N.n+S.d}`)}, ${pres(S.ecart(N.n),e)}. C'est plus grand que ${dq(eps)}.`}};}
  const bon=Object.assign(avecL?{"ℓ":brut(S.l)}:{},{N:String(N0)});
  return {sig:"RN"+S.sig+","+brut(eps)+(avecL?"L":""),
    q:`On pose ${fx(`uₙ = ${S.expr}`)} ${S.ou}. ${avecL?"La suite (uₙ) converge vers un nombre ℓ : lequel ? Donne ensuite":`La suite (uₙ) converge vers ${L}. Donne`} un entier N tel que, pour tout ${fx("n ≥ N")}, on ait ${fx(`${avecL?"|uₙ − ℓ|":S.abs} ≤ ${dq(eps)}`)}.`,corps:"",
    texte:`uₙ = ${S.expr} (${S.n0?"n ≥ 1":"n ∈ ℕ"}) ; ${avecL?"la limite ℓ, puis ":""}un rang N tel que |uₙ − ℓ| ≤ ${dq(eps)} pour tout n ≥ N`,
    champs:[{k:"cases",id:"c",noms:avecL?["ℓ","N"]:["N"],aide:"Tout rang qui convient est accepté : il n'y a pas une seule bonne réponse."}],juge,etapes:E,
    bonne:`${avecL?`${fx(`ℓ = ${L}`)} ; `:""}${fx(`N = ${N0}`)}, ou tout entier plus grand`,bonneTxt:`${avecL?`ℓ = ${L} ; `:""}N = ${N0}, ou tout entier plus grand`,
    repBonne:{c:bon},repFausse:{c:Object.assign({},bon,{N:String(N0-1)})},nature:avecL?"avec ℓ":"rang",ens:{type:"num",u:n=>(S.a*n+S.b)/(S.c*n+S.d),l:S.a,eps:e,n0:S.n0}};}
function tireNum(R,avecL){for(;;){const S=avecL?tireQuot(R):tireNul(R),eps=R.choix(EPSN),T=div(sub(div(S.K,eps),S.d),S.c);if(T.n/T.d>=2)return rangNum(S,eps,avecL);}}
/* un rang donné par une formule : elle est essayée sur plusieurs valeurs de la lettre */
function jugeFormule(o){return rep=>{const src=String(rep.N==null?"":rep.N).replace(/^\s*N\s*=/i,"");
  const faux=(type,msg)=>({ok:false,faux:["N"],resume:"Pas tout à fait : cette formule ne donne pas toujours un rang qui convient.",diag:{etape:o.etape,type,titre:"Où ça part : le choix de N.",msg}});
  if(!propre(src))return {incomplet:`Écris N avec ${o.lettre}, par exemple ${o.modele}.`};
  const V=o.tests.map(p=>O.calcule(src,{[o.cle]:p}));
  if(V.some(v=>v===null))return {incomplet:`Je n'arrive pas à lire cette formule. Écris N avec ${o.lettre}, par exemple ${o.modele}.`};
  for(let i=0;i<V.length;i++){const v=V[i],p=o.tests[i],pt=String(p).replace(".",",");
    if(!Number.isFinite(v))return faux(`formule sans valeur pour certains ${o.lettre}`,`Pour ${o.lettre} = ${pt}, ta formule n'a pas de valeur.`);
    if(Math.abs(v-Math.round(v))>1e-9)return faux("rang qui n'est pas un entier",`Pour ${o.lettre} = ${pt}, ta formule donne ${d3(v)} : ce n'est pas un entier. Prends la partie entière avec E( ), puis ajoute 1.`);
    const N=Math.round(v);if(N<o.n0)return faux("rang négatif",`Pour ${o.lettre} = ${pt}, ta formule donne N = ${nb(N)} : ce n'est pas un rang de la suite, qui commence à n = ${o.n0}. N doit être un entier naturel pour toutes les valeurs de ${o.lettre}.`);
    if(!o.bon(N,p))return faux("rang trop petit",`Pour ${o.lettre} = ${pt}, ta formule donne N = ${N}. ${o.dit(N,p)}`);}
  return {ok:true};};}
const TESTS_E=[1,0.9,0.7,0.5,0.45,0.37,0.3,0.23,0.17,0.1,0.083,0.07,0.043,0.031,0.013,0.0071,0.003,0.001],TESTS_A=[0,0.4,1,2.5,4.9,6.3,8.8,10,13.7,14.2,17.6,21.9,29.99,33.3,49.5,61.7,77.3,99.9,150.5,333.3,1000,4321.7,12345.6];
function rangEps(S){const L=nb(S.l),ex=`E(${S.K}/ε) + 1`;
  const E=[{w:`${fx(`${S.abs} = ${S.ecartT}`)}`,why:S.pourquoi,pts:1},
    {w:`${fx(`${S.ecartT} ≤ ε`)} quand ${fx(`${S.den} ≥ ${S.K}/ε`)}.${S.den==="n"?"":` Il suffit donc que ${fx(`n ≥ ${S.K}/ε`)}.`}`,why:`Les deux côtés sont positifs : on peut échanger la place du dénominateur et celle de ε.${S.den==="n"?"":` Et ${fx(`${S.den} ≥ n`)} : si n dépasse ${fx(`${S.K}/ε`)}, alors ${fx(S.den)} aussi. On ne cherche pas le plus petit rang : un rang qui convient suffit.`}`,pts:1},
    {w:`<b>${fx(`N = ${ex}`)}</b> convient.`,why:`N doit être un entier, et ${fx(`${S.K}/ε`)} n'en est pas toujours un. ${PARTIE} Pour tout ${fx("n ≥ N")}, on a ${fx(`n ≥ ${S.K}/ε`)}, donc ${fx(`${S.abs} ≤ ε`)}.`,pts:1}];
  return {sig:"RE"+S.sig,
    q:`On pose ${fx(`uₙ = ${S.expr}`)} ${S.ou}. La suite (uₙ) converge vers ${L}. Soit ε un réel strictement positif. Donne, en fonction de ε, un entier N tel que, pour tout ${fx("n ≥ N")}, on ait ${fx(`${S.abs} ≤ ε`)}.`,corps:"",
    texte:`uₙ = ${S.expr} (${S.n0?"n ≥ 1":"n ∈ ℕ"}) ; un rang N en fonction de ε tel que |uₙ − ℓ| ≤ ε pour tout n ≥ N (ℓ = ${L})`,
    champs:[{k:"champ",id:"N",nom:"N",label:"$N =$",ex:"une formule avec ε",sym:[["ε","ε"],["E( )","E("],[")",")"],["/","/"]],aide:"E(x) désigne la partie entière de x. Toute formule qui donne un rang qui convient est acceptée."}],
    juge:jugeFormule({lettre:"ε",cle:"ε",modele:"E(2/ε) + 5",tests:TESTS_E,n0:S.n0,etape:2,bon:(N,e)=>S.ecart(N)<=e*(1+1e-12),dit:(N,e)=>`Or ${fx(`${S.abs.replace("uₙ","u"+ind(N))}`)} vaut ${pres(S.ecart(N),e)}, ce qui est plus grand que ${String(e).replace(".",",")}.`}),etapes:E,
    bonne:`${fx(`N = ${ex}`)}, par exemple`,bonneTxt:`N = ${ex}, par exemple`,repBonne:{N:ex},repFausse:{N:`${S.K}/ε`},nature:"ε",ens:{type:"eps",u:n=>(S.a*n+S.b)/(S.c*n+S.d),l:S.a,n0:S.n0}};}
function rangInfini(R){const t=R(),a=t<0.55?R.ent(1,15):t<0.7?1:R.ent(2,6),b=R.ent(0,t<0.55?50:20),forme=t<0.55?"n":t<0.85?"n²":"√n",ab=b?`A + ${b}`:"A";
  const expr=(a===1?"":a)+forme+(b?" − "+b:""),u=forme==="n"?n=>a*n-b:forme==="n²"?n=>a*n*n-b:n=>a*Math.sqrt(n)-b,quot=a===1?ab:b?`(${ab})/${a}`:`A/${a}`;
  const seuil=forme==="n"?quot:forme==="n²"?`√(${quot})`:a===1?`(${ab})²`:`(${quot})²`,ex=`E(${seuil}) + 1`;
  const E=[{w:`${fx(`${expr} ≥ A`)} quand ${fx(`n ≥ ${seuil}`)}.`,why:`${b?`On ajoute ${b} des deux côtés. `:""}${a>1?`On divise par ${a}, qui est positif : le sens de l'inégalité ne change pas. `:""}${forme==="n²"?"Puis on prend la racine carrée des deux côtés, qui sont positifs : la racine carrée garde l'ordre.":forme==="√n"?"Puis on élève au carré les deux côtés, qui sont positifs : le carré garde alors l'ordre.":""}`.trim()||"L'inéquation est déjà résolue.",pts:1.5},
    {w:`<b>${fx(`N = ${ex}`)}</b> convient.`,why:`N doit être un entier, et ${fx(seuil)} n'en est pas toujours un. ${PARTIE} Pour tout ${fx("n ≥ N")}, on a donc ${fx("uₙ ≥ A")}. Pour un réel A négatif, le rang trouvé pour A = 0 convient encore.`,pts:1.5}];
  return {sig:"RI"+a+","+b+","+forme,
    q:`On pose ${fx(`uₙ = ${expr}`)} pour tout entier naturel n. La suite (uₙ) tend vers +∞ : pour tout réel A, il existe un rang N tel que, pour tout ${fx("n ≥ N")}, on ait ${fx("uₙ ≥ A")}. Soit A un réel positif ou nul. Donne un tel rang N, en fonction de A.`,corps:"",
    texte:`uₙ = ${expr} (n ∈ ℕ) ; un rang N en fonction de A tel que uₙ ≥ A pour tout n ≥ N`,
    champs:[{k:"champ",id:"N",nom:"N",label:"$N =$",ex:"une formule avec A",sym:[["A","A"],["E( )","E("],["√( )","√("],[")",")"],["/","/"]],aide:"E(x) désigne la partie entière de x. Toute formule qui donne un rang qui convient est acceptée."}],
    juge:jugeFormule({lettre:"A",cle:"a",modele:"E(A/2) + 3",tests:TESTS_A,n0:0,etape:1,bon:(N,A)=>u(N)>=A-1e-9,dit:(N,A)=>`Or ${fx(`u${ind(N)}`)} vaut environ ${d3(u(N))}, ce qui est plus petit que ${String(A).replace(".",",")}.`}),etapes:E,
    bonne:`${fx(`N = ${ex}`)}, par exemple`,bonneTxt:`N = ${ex}, par exemple`,repBonne:{N:ex},repFausse:{N:seuil},nature:forme,ens:{type:"inf",u}};}
/* la rédaction complète, comme l'exercice 1 du CC1 2024 : sur papier, cochée ligne par ligne */
function redacEps(R){const t=R(),a=R.ent(1,9),co=a===1?"":a;let expr,maj,K=a,l=0,u,debut,why2;
  const BORNE=[["sin(n)","|sin(n)| ≤ 1",Math.sin],["cos(n)","|cos(n)| ≤ 1",Math.cos],["(−1)ⁿ","|(−1)ⁿ| = 1",n=>n%2?-1:1],["sin(n²)","|sin(n²)| ≤ 1",n=>Math.sin(n*n)],["cos(2n)","|cos(2n)| ≤ 1",n=>Math.cos(2*n)]];
  if(t<0.4){const b=R.ent(0,9),f=R.choix(BORNE),den=b?`(n + ${b})`:"n";expr=`${co}${f[0]}/${den}`;u=n=>a*f[2](n)/(n+b);
    maj=`${fx(`|uₙ − 0| ≤ ${a}/${den}`)}${b?`, et ${fx(`${a}/${den} ≤ ${a}/n`)}`:""}`;why2=`${fx(f[1])}${b?` ; puis ${fx(`n + ${b} ≥ n`)}, et diviser par un nombre plus grand donne un résultat plus petit`:""}.`;}
  else if(t<0.7){const c=R.ent(1,9),f=R.choix(BORNE.slice(0,4));expr=`${co}n ${f[0]}/(n² + ${c})`;u=n=>a*n*f[2](n)/(n*n+c);
    maj=`${fx(`|uₙ − 0| ≤ ${co}n/(n² + ${c})`)}, et ${fx(`${co}n/(n² + ${c}) ≤ ${co}n/n² = ${a}/n`)}`;why2=`${fx(f[1])} ; puis ${fx(`n² + ${c} ≥ n²`)}, et diviser par un nombre plus grand donne un résultat plus petit.`;}
  else{const S=tireQuot(R);expr=S.expr;K=S.K;l=S.a;u=n=>(S.a*n+S.b)/(n+S.d);maj=`${fx(`${S.abs} = ${S.ecartT}`)}, et ${fx(`${S.ecartT} ≤ ${K}/n`)}`;why2=`${S.pourquoi} Puis ${fx(`n + ${S.d} ≥ n`)}, et diviser par un nombre plus grand donne un résultat plus petit.`;}
  const L=nb(l),ec=l?`|uₙ ${l>0?"−":"+"} ${Math.abs(l)}|`:"|uₙ − 0|";
  const lignes=[[`Soit ${fx("ε &gt; 0")}.`,`La définition commence par « pour tout ε strictement positif » : on en fixe un, quelconque, et on ne lui donne pas de valeur.`,0.5],
    [`Pour tout ${fx("n ≥ 1")} : ${maj}.`,why2,1.5],
    [`On pose ${fx(`N = E(${K}/ε) + 1`)} : N est un entier et ${fx(`N &gt; ${K}/ε`)}, donc ${fx(`${K}/N &lt; ε`)}.`,PARTIE,1],
    [`Pour tout ${fx("n ≥ N")} : ${fx(`${ec} ≤ ${K}/n`)}, et ${fx(`${K}/n ≤ ${K}/N &lt; ε`)}.`,`n est plus grand que N, donc ${fx(`${K}/n`)} est plus petit que ${fx(`${K}/N`)}.`,0.5],
    [`Donc : ${O.f(`∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, ${ec} ≤ ε`)}. La suite (uₙ) converge vers ${L}.`,`On finit en écrivant la définition : c'est elle qu'on vient de vérifier, pour un ε quelconque.`,0.5]];
  const q=`En utilisant la définition de la limite d'une suite, montre que la suite (uₙ) définie pour tout entier ${fx("n ≥ 1")} par ${fx(`uₙ = ${expr}`)} converge vers ${L}.`;
  return {sig:"RP"+expr,q,corps:"",texte:`avec la définition (ε), montrer que uₙ = ${expr} converge vers ${L}`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
    etapes:lignes.map(x=>({w:x[0],why:x[1],pts:x[2]})),bonne:"voir la rédaction",bonneTxt:`rédaction avec N = E(${K}/ε) + 1`,repBonne:{},nature:t<0.4?"borné":t<0.7?"borné, n²":"quotient",ens:{type:"papier",u,l,K}};}

/* ---------- AN4 : calculer une limite de suite ---------- */
const LIMS=[["+∞","+∞"],["−∞","-∞"],["pas de limite","pas de limite"],["/","/"],["√","√("]];
function lisLim(s){const t=propre(s).toLowerCase().replace(/ /g,"");if(!t)return null;
  if(/^(pasdelimite|aucune(limite)?|pas|non|n['’]?existepas)$/.test(t))return {sans:true};
  const m=/^([+-]?)(∞|inf|infini|oo)$/.exec(t);if(m)return {inf:m[1]==="-"?-1:1};
  const v=O.calcule(s,{});return v===null||!Number.isFinite(v)?null:{v};}
const memeLim=(lu,L)=>L.sans?!!lu.sans:L.inf?lu.inf===L.inf:lu.v!==undefined&&Math.abs(lu.v-L.v.n/L.v.d)<1e-9;
const limT=L=>L.sans?"pas de limite":L.inf?(L.inf>0?"+∞":"−∞"):nb(L.v);
function limite(o){const L=o.lim,dern=o.etapes.length-1;
  function juge(rep){const lu=lisLim(rep.lim);if(!lu)return {incomplet:"Écris un nombre (3, -1/2, √2), +∞, −∞ ou « pas de limite »."};
    if(memeLim(lu,L))return {ok:true};
    const d=(o.diag&&o.diag(lu))||(L.inf&&lu.inf?{etape:dern,type:"signe de l'infini",titre:"Où ça part : le signe.",msg:`La suite tend bien vers l'infini, mais c'est vers ${limT(L)}.`}:{etape:dern,type:o.type||"calcul de la limite",titre:"Où ça part : la conclusion.",msg:L.sans?"Cette suite n'a pas de limite.":`La limite est ${fx(limT(L))}.`});
    return {ok:false,faux:["lim"],resume:"Pas tout à fait : ce n'est pas la bonne réponse.",diag:d};}
  return {sig:o.sig,q:`On pose, pour tout entier n assez grand, ${fx(`uₙ = ${o.expr}`)}. Quelle est la limite de la suite (uₙ) quand n tend vers +∞ ? Réponds par un nombre, +∞, −∞, ou « pas de limite ».`,corps:"",
    texte:`limite de uₙ = ${o.expr}`,champs:[{k:"champ",id:"lim",nom:"limite",label:"$lim uₙ =$",ex:"un nombre, +∞, −∞, pas de limite",sym:LIMS}],juge,etapes:o.etapes,
    bonne:L.sans?"pas de limite":fx(`lim uₙ = ${limT(L)}`),bonneTxt:limT(L),repBonne:{lim:L.sans?"pas de limite":L.inf?(L.inf>0?"+∞":"-∞"):brut(L.v)},repFausse:{lim:L.sans?"0":L.inf?(L.inf>0?"-∞":"+∞"):L.v.n===0?"1":"0"},
    nature:o.nature,ens:Object.assign({lim:L.sans?"sans":L.inf?L.inf*Infinity:L.v.n/L.v.d,grand:[1e6,1e7]},o.ens)};}
const PUI=["","n","n²","n³","n⁴"],sgn=(s,x)=>(s?(x<0?" − ":" + "):(x<0?"−":""));
/* c[i] = coefficient de n^i ; le même polynôme divisé par n^k */
function polyT(c){let s="";for(let i=c.length-1;i>=0;i--){const x=c[i];if(!x)continue;const a=Math.abs(x);s+=sgn(s,x)+(i&&a===1?"":a)+PUI[i];}return s||"0";}
function divT(c,k){let s="";for(let i=c.length-1;i>=0;i--){const x=c[i];if(!x)continue;const a=Math.abs(x),e=i-k;s+=sgn(s,x)+(e>0?(a===1?"":a)+PUI[e]:e===0?String(a):a+"/"+PUI[-e]);}return s||"0";}
const ev=(c,n)=>c.reduce((t,x,i)=>t+x*Math.pow(n,i),0);
const inf=x=>x>0?"+∞":"−∞";
function limPoly(R){for(;;){const p=R.ent(1,3),qd=R.ent(1,3),mk=g=>{const c=[];for(let i=0;i<=g;i++)c.push(i===g?R.nz(-6,6):R()<0.6?R.ent(-9,9):0);return c;},P=mk(p),D=mk(qd);
  if(P.filter(Boolean).length+D.filter(Boolean).length<3)continue;
  const a=P[p],c=D[qd],L=p===qd?{v:Q(a,c)}:p<qd?{v:Q(0)}:{inf:a*c>0?1:-1},mono=D.filter(Boolean).length===1;
  const E=[{w:`On divise le numérateur et le dénominateur par ${fx(PUI[qd])}, la plus grande puissance de n au dénominateur. Le numérateur devient ${fx(divT(P,qd))}, le dénominateur ${fx(divT(D,qd))}.`,why:`Le numérateur et le dénominateur tendent tous les deux vers l'infini : c'est une forme indéterminée, on ne peut pas conclure tout de suite. Diviser en haut et en bas par le même nombre ne change pas le quotient.`,pts:1},
    {w:`Le numérateur tend vers ${p===qd?fx(nb(a)):p<qd?"0":inf(a)}, et le dénominateur ${mono?"vaut":"tend vers"} ${fx(nb(c))}.`,why:`Un nombre divisé par n, par n² ou par n³ tend vers 0.${p>qd?` Et ${fx((Math.abs(a)===1?(a<0?"−":""):nb(a))+PUI[p-qd])} tend vers ${inf(a)}.`:""}`,pts:1},
    {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:p===qd?`La limite d'un quotient est le quotient des limites, quand celle du dénominateur n'est pas 0 : ici ${fx(nb(a))} divisé par ${fx(nb(c))}.`:p<qd?`0 divisé par ${fx(nb(c))} donne 0.`:`Le numérateur tend vers ${inf(a)}, et on le divise par un nombre proche de ${fx(nb(c))}, qui est ${c>0?"positif : le signe est gardé":"négatif : le signe change"}.`,pts:1}];
  return limite({sig:"LP"+P.join(",")+"|"+D.join(","),expr:`(${polyT(P)})/(${polyT(D)})`,lim:L,etapes:E,nature:p===qd?"même degré":p<qd?"vers 0":"infini",type:"limite d'un quotient de polynômes",ens:{u:n=>ev(P,n)/ev(D,n)},
    diag:lu=>p===qd&&(lu.inf||lu.sans||lu.v===0)?{etape:1,type:"même degré : quotient des coefficients dominants",titre:"Où ça part : la comparaison des degrés.",msg:`Le numérateur et le dénominateur ont le même degré : la limite est le quotient des coefficients des plus grandes puissances, ${fx(nb(a))} et ${fx(nb(c))}.`}
      :p<qd&&lu.v!==0?{etape:1,type:"degré du dénominateur plus grand",titre:"Où ça part : la comparaison des degrés.",msg:"Le dénominateur a le plus grand degré : il grandit plus vite que le numérateur, et le quotient tend vers 0."}
      :p>qd&&!lu.inf?{etape:1,type:"degré du numérateur plus grand",titre:"Où ça part : la comparaison des degrés.",msg:"Le numérateur a le plus grand degré : il grandit plus vite que le dénominateur, et le quotient tend vers l'infini."}:null});}}
function limRacine(R){const t=R(),ind0=lu=>lu.v===0?{etape:0,type:"« +∞ − ∞ » pris pour 0",titre:"Où ça part : la forme indéterminée.",msg:"Deux quantités qui tendent vers +∞ ne s'annulent pas forcément : « +∞ − ∞ » est une forme indéterminée. Il faut la quantité conjuguée."}:lu.inf?{etape:0,type:"forme indéterminée non levée",titre:"Où ça part : la forme indéterminée.",msg:"Les deux termes tendent vers +∞, mais leur différence reste bornée : il faut la quantité conjuguée pour le voir."}:null;
  const CONJ=`C'est une forme indéterminée « +∞ − ∞ ». On utilise ${fx("(A − B)(A + B) = A² − B²")} : au numérateur, les racines disparaissent.`,DIVN=`Pour n positif, ${fx("n = √(n²)")} : diviser une racine par n, c'est diviser par n² ce qu'il y a dessous.`;
  if(t<0.5){const k=R.choix([1,1,2,3]),a=R.nz(-9,9),b=R()<0.5?0:R.ent(1,9),ins=polyT([b,a,k*k]),kn=(k===1?"":k)+"n",num=polyT([b,a]),L={v:Q(a,2*k)};
    return limite({sig:"LR1,"+k+","+a+","+b,expr:`√(${ins}) − ${kn}`,lim:L,nature:"√(…) − kn",type:"quantité conjuguée",ens:{u:n=>Math.sqrt(k*k*n*n+a*n+b)-k*n},diag:ind0,etapes:[
      {w:`On multiplie et on divise par la quantité conjuguée ${fx(`√(${ins}) + ${kn}`)} : ${fx(`uₙ = (${num})/(√(${ins}) + ${kn})`)}.`,why:`${CONJ} Ici ${fx(`${ins} − ${polyT([0,0,k*k])} = ${num}`)}.`,pts:1},
      {w:`On divise en haut et en bas par n : le numérateur devient ${fx(divT([b,a],1))}, le dénominateur ${fx(`√(${divT([b,a,k*k],2)}) + ${k}`)}.`,why:DIVN,pts:1},
      {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:`Le numérateur tend vers ${fx(nb(a))}. Sous la racine, tout tend vers ${k*k} : le dénominateur tend vers ${fx(`√${k*k} + ${k} = ${2*k}`)}.`,pts:1}]});}
  if(t<0.75){const a=R.ent(0,15);let b;do b=R.ent(0,15);while(b===a);const ra=a?`√(n + ${a})`:"√n",rb=b?`√(n + ${b})`:"√n";
    return limite({sig:"LR2,"+a+","+b,expr:`${ra} − ${rb}`,lim:{v:Q(0)},nature:"√ − √",type:"quantité conjuguée",ens:{u:n=>Math.sqrt(n+a)-Math.sqrt(n+b),grand:[1e10,1e12]},diag:lu=>lu.inf?ind0(lu):null,etapes:[
      {w:`On multiplie et on divise par la quantité conjuguée ${fx(`${ra} + ${rb}`)} : ${fx(`uₙ = ${nb(a-b)}/(${ra} + ${rb})`)}.`,why:`${CONJ} Ici ${fx(`${a?`(n + ${a})`:"n"} − ${b?`(n + ${b})`:"n"} = ${nb(a-b)}`)}.`,pts:1.5},
      {w:`<b>${fx("lim uₙ = 0")}</b>`,why:`Le numérateur est le nombre ${fx(nb(a-b))}, et le dénominateur tend vers +∞ : le quotient tend vers 0.`,pts:1.5}]});}
  const a=R.nz(-9,9);let b;do b=R.ent(-9,9);while(b===a);const ia=polyT([0,a,1]),ib=polyT([0,b,1]),L={v:Q(a-b,2)},dn=x=>x?`√(${divT([0,x,1],2)})`:"1";
  return limite({sig:"LR3,"+a+","+b,expr:`√(${ia}) − √(${ib})`,lim:L,nature:"√(n² …) − √(n² …)",type:"quantité conjuguée",ens:{u:n=>Math.sqrt(n*n+a*n)-Math.sqrt(n*n+b*n)},diag:ind0,etapes:[
    {w:`On multiplie et on divise par la quantité conjuguée ${fx(`√(${ia}) + √(${ib})`)} : le numérateur devient ${fx((Math.abs(a-b)===1?(a<b?"−":""):nb(a-b))+"n")}.`,why:`${CONJ} Ici ${fx(`(${ia}) − (${ib}) = ${(Math.abs(a-b)===1?(a<b?"−":""):nb(a-b))+"n"}`)}.`,pts:1},
    {w:`On divise en haut et en bas par n : le numérateur devient ${fx(nb(a-b))}, le dénominateur ${fx(`${dn(a)} + ${dn(b)}`)}.`,why:DIVN,pts:1},
    {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:`Sous chaque racine, tout tend vers 1 : le dénominateur tend vers ${fx("1 + 1 = 2")}.`,pts:1}]});}
function limPuis(R){const [p,qb]=R.choix([[2,3],[2,5],[3,5],[3,4],[2,7],[4,5],[3,7],[5,7]]),a=R.nz(-5,5),c=R.nz(-5,5),t=R(),b=t<0.8&&t>=0.6?0:R.nz(-5,5),d=t>=0.8?0:R.nz(-5,5);
  const T=(x,y,B1,B2)=>{let s="";[[x,B1],[y,B2]].forEach(([k,B])=>{if(!k)return;const m=Math.abs(k);s+=sgn(s,k)+(m===1?"":m+" × ")+B;});return s;},pn=p+"ⁿ",qn=qb+"ⁿ",r=`(${p}/${qb})ⁿ`,ri=`(${qb}/${p})ⁿ`;
  const num=T(a,b,pn,qn),den=T(c,d,pn,qn),expr=`${b?`(${num})`:num}/${d||/[×−]/.test(den)?`(${den})`:den}`;
  if(d){const L={v:Q(b,d)},cst=(x,y)=>{let s=T(x,0,r,"");if(y)s+=sgn(s,y)+Math.abs(y);return s;};
    return limite({sig:"LG"+[p,qb,a,b,c,d],expr,lim:L,nature:b?"quotient des coefficients":"vers 0",type:"quotient de puissances",ens:{u:n=>(a*Math.pow(p/qb,n)+b)/(c*Math.pow(p/qb,n)+d),grand:[60,120]},
      diag:lu=>lu.inf||lu.sans?{etape:1,type:"limite de qⁿ avec q entre 0 et 1",titre:"Où ça part : la limite de la puissance.",msg:`${fx(r)} tend vers 0, parce que ${fx(`${p}/${qb}`)} est entre 0 et 1.`}:null,etapes:[
      {w:`On divise en haut et en bas par ${fx(qn)}, la plus grande puissance. Le numérateur devient ${fx(cst(a,b))}, le dénominateur ${fx(cst(c,d))}.`,why:`Sans cette division, c'est une forme indéterminée. On utilise ${fx(`${pn}/${qn} = ${r}`)}.`,pts:1},
      {w:`${fx(r)} tend vers 0.`,why:`C'est une suite géométrique dont la raison ${fx(`${p}/${qb}`)} est entre 0 et 1 : ses termes se rapprochent de 0.`,pts:1},
      {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:`Le numérateur tend vers ${fx(nb(b))} et le dénominateur vers ${fx(nb(d))} : la limite du quotient est le quotient des limites.`,pts:1}]});}
  const L={inf:b*c>0?1:-1};
  return limite({sig:"LG"+[p,qb,a,b,c,0],expr,lim:L,nature:"infini",type:"quotient de puissances",ens:{u:n=>(a+b*Math.pow(qb/p,n))/c,grand:[40,60]},
    diag:lu=>!lu.inf?{etape:1,type:"limite de qⁿ avec q plus grand que 1",titre:"Où ça part : la limite de la puissance.",msg:`${fx(ri)} tend vers +∞, parce que ${fx(`${qb}/${p}`)} est plus grand que 1.`}:null,etapes:[
    {w:`On divise en haut et en bas par ${fx(pn)} : le numérateur devient ${fx(`${nb(a)} ${b>0?"+":"−"} ${Math.abs(b)===1?"":Math.abs(b)+" × "}${ri}`)}, le dénominateur ${fx(nb(c))}.`,why:`Le dénominateur n'a qu'une puissance : on divise par elle. On utilise ${fx(`${qn}/${pn} = ${ri}`)}.`,pts:1},
    {w:`${fx(ri)} tend vers +∞.`,why:`C'est une suite géométrique dont la raison ${fx(`${qb}/${p}`)} est plus grande que 1.`,pts:1},
    {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:`Le numérateur tend vers ${inf(b)}, et on le divise par ${fx(nb(c))}, qui est ${c>0?"positif : le signe est gardé":"négatif : le signe change"}.`,pts:1}]});}
const BORNES=[["sin(n)",Math.sin],["cos(n)",Math.cos],["(−1)ⁿ",n=>n%2?-1:1]];
const GEND=`C'est le théorème des gendarmes : une suite encadrée par deux suites qui ont la même limite converge vers cette limite.`;
const borne=(lu)=>lu.sans?{etape:0,type:"suite crue sans limite à cause d'un terme borné",titre:"Où ça part : le terme qui oscille.",msg:"Ce terme n'a pas de limite, c'est vrai, mais il reste entre −1 et 1 : on l'encadre, et on regarde la limite de ce qui l'encadre."}:null;
function limGend(R){const t=R(),f=R.choix(BORNES),b=R.nz(-9,9),B=Math.abs(b),bf=(B===1?"":B+(f[0][0]==="("?" × ":" "))+f[0];
  if(t<0.45){const a=R.nz(-6,6),c=R.ent(1,6),d=R.ent(0,9),an=(Math.abs(a)===1?(a<0?"−":""):nb(a))+"n",den=(c===1?"":c)+"n"+(d?" + "+d:""),L={v:Q(a,c)};
    return limite({sig:"LE1,"+[a,b,c,d,f[0]],expr:`(${an} ${b>0?"+":"−"} ${bf})/${d||c>1?`(${den})`:den}`,lim:L,nature:"encadrement, limite a/c",type:"théorème des gendarmes",ens:{u:n=>(a*n+b*f[1](n))/(c*n+d)},diag:borne,etapes:[
      {w:`${fx(`−1 ≤ ${f[0]} ≤ 1`)}, donc le numérateur est entre ${fx(`${an} − ${B}`)} et ${fx(`${an} + ${B}`)}.`,why:`${fx(f[0])} n'a pas de limite, mais il reste entre −1 et 1 : on l'encadre. Multiplié par ${fx(nb(b))}, il reste entre ${fx(nb(-B))} et ${fx(nb(B))}.`,pts:1},
      {w:`On divise par ${fx(den)}, qui est positif : ${O.f(`(${an} − ${B})/(${den}) ≤ uₙ ≤ (${an} + ${B})/(${den})`)}.`,why:`Diviser par un nombre positif ne change pas le sens des inégalités.`,pts:1},
      {w:`Les deux suites qui encadrent tendent vers ${fx(limT(L))}.`,why:`Ce sont deux quotients dont le numérateur et le dénominateur ont le même degré : la limite est le quotient des coefficients de n, ${fx(nb(a))} et ${fx(nb(c))}.`,pts:0.5},
      {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:GEND,pts:0.5}]});}
  if(t<0.8){const c=R.ent(1,6),d=R.ent(0,9),k=R.choix(["n","n","n²","√n"]),den=(c===1?"":c)+k+(d?" + "+d:""),dp=d||c>1?`(${den})`:den,g=k==="n"?n=>n:k==="n²"?n=>n*n:Math.sqrt;
    return limite({sig:"LE2,"+[b,c,d,k,f[0]],expr:`${b<0?"−":""}${bf}/${dp}`,lim:{v:Q(0)},nature:"encadrement, limite 0",type:"théorème des gendarmes",ens:{u:n=>b*f[1](n)/(c*g(n)+d),grand:[1e10,1e12]},diag:borne,etapes:[
      {w:`${fx(`−1 ≤ ${f[0]} ≤ 1`)}, donc ${O.f(`−${B}/${dp} ≤ uₙ ≤ ${B}/${dp}`)}.`,why:`${fx(f[0])} n'a pas de limite, mais il reste entre −1 et 1. ${B===1?"On":`On multiplie par ${B} et on`} divise par ${fx(den)}, qui est positif.`,pts:1.5},
      {w:`Les deux suites qui encadrent tendent vers 0.`,why:`Leur numérateur ne change pas, et leur dénominateur tend vers +∞.`,pts:0.5},
      {w:`<b>${fx("lim uₙ = 0")}</b>`,why:GEND,pts:1}]});}
  const a=R.nz(-6,6),an=(Math.abs(a)===1?(a<0?"−":""):nb(a))+"n",L={inf:a>0?1:-1};
  return limite({sig:"LE3,"+[a,b,f[0]],expr:`${an} ${b>0?"+":"−"} ${bf}`,lim:L,nature:"comparaison, infini",type:"théorème de comparaison",ens:{u:n=>a*n+b*f[1](n)},diag:borne,etapes:[
    {w:`${fx(`−1 ≤ ${f[0]} ≤ 1`)}, donc ${fx(`uₙ ${a>0?"≥":"≤"} ${an} ${a>0?"−":"+"} ${B}`)}.`,why:`${fx(f[0])} n'a pas de limite, mais il reste entre −1 et 1 : le terme ${fx(bf)} reste entre ${fx(nb(-B))} et ${fx(nb(B))}.`,pts:1.5},
    {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:`${fx(`${an} ${a>0?"−":"+"} ${B}`)} tend vers ${limT(L)}, et uₙ est ${a>0?"au-dessus":"en dessous"} : par comparaison, uₙ tend aussi vers ${limT(L)}.`,pts:1.5}]});}
const DEUX=`Si la suite avait une limite, ses termes de rang pair et ses termes de rang impair tendraient tous vers cette limite.`;
function limSans(R){const t=R();
  if(t<0.4){const a=R.nz(-6,6),b=R.ent(-9,9),c=R.ent(1,6),d=R.ent(1,9),num=polyT([b,a]),den=polyT([d,c]),qt=`(${num})/(${den})`,l1=Q(a,c),l2=Q(-a,c);
    return limite({sig:"LS1,"+[a,b,c,d],expr:`(−1)ⁿ × ${b?qt:`${num}/(${den})`}`,lim:{sans:true},nature:"sans limite",type:"deux sous-suites de limites différentes",ens:{u:n=>(n%2?-1:1)*(a*n+b)/(c*n+d)},etapes:[
      {w:`Pour n pair, ${fx("(−1)ⁿ = 1")} : les termes tendent vers ${fx(nb(l1))}. Pour n impair, ${fx("(−1)ⁿ = −1")} : les termes tendent vers ${fx(nb(l2))}.`,why:`${fx(b?qt:`${num}/(${den})`)} tend vers ${fx(nb(l1))} : le numérateur et le dénominateur ont le même degré, on prend le quotient des coefficients de n.`,pts:1.5},
      {w:`<b>La suite n'a pas de limite.</b>`,why:`${DEUX} Or ${fx(nb(l1))} et ${fx(nb(l2))} sont différents.`,pts:1.5}],
      diag:lu=>lu.v!==undefined?{etape:0,type:"deux sous-suites de limites différentes non vues",titre:"Où ça part : le rôle de (−1)ⁿ.",msg:`(−1)ⁿ change de signe à chaque rang, et ce qu'il multiplie ne tend pas vers 0 : les termes sautent entre ${fx(nb(l1))} et ${fx(nb(l2))}.`}:null});}
  if(t<0.75){const a=R.ent(-9,9),b=R.nz(-5,5),[qs,qv]=R.choix([["(−2)",-2],["(−3)",-3],["(−1)",-1],["(−1/2)",-0.5],["(1/2)",0.5],["(2/3)",2/3],["(3/2)",1.5],["(−2/3)",-2/3],["2",2],["3",3]]),B=Math.abs(b);
    const expr=(a?nb(a)+(b>0?" + ":" − "):(b>0?"":"−"))+(B===1?"":B+" × ")+qs+"ⁿ",L=Math.abs(qv)<1?{v:Q(a)}:qv>1?{inf:b>0?1:-1}:{sans:true},pw=fx(qs+"ⁿ"),rs=fx(qs.replace(/[()]/g,""));
    return limite({sig:"LS2,"+[a,b,qs],expr,lim:L,nature:L.sans?"sans limite":L.inf?"qⁿ infini":"qⁿ vers 0",type:"limite de qⁿ",ens:{u:n=>a+b*Math.pow(qv,n),grand:[40,60]},etapes:[
      {w:`${pw} ${Math.abs(qv)<1?"tend vers 0":qv>1?"tend vers +∞":"n'a pas de limite"}.`,why:`C'est une suite géométrique de raison ${rs}. La règle : si la raison est strictement entre −1 et 1, la suite tend vers 0 ; si elle est plus grande que 1, la suite tend vers +∞ ; si elle est inférieure ou égale à −1, la suite n'a pas de limite, car elle change de signe sans se rapprocher de 0.`,pts:1.5},
      {w:L.sans?`<b>La suite n'a pas de limite.</b>`:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:L.sans?`${DEUX} Ici, les termes de rang pair et ceux de rang impair ne se rapprochent pas du même nombre.`:L.inf?`On multiplie par ${fx(nb(b))}, qui est ${b>0?"positif":"négatif : le signe change"}${a?`, et ajouter ${fx(nb(a))} ne change pas une limite infinie`:""}.`:`${fx((B===1?"":B+" × ")+qs+"ⁿ")} tend vers 0 : il reste ${fx(nb(a))}.`,pts:1.5}],
      diag:lu=>L.sans&&!lu.sans?{etape:0,type:"raison inférieure ou égale à −1 : pas de limite",titre:"Où ça part : la raison.",msg:`La raison ${rs} est inférieure ou égale à −1 : ${pw} change de signe à chaque rang sans se rapprocher de 0.`}:!L.sans&&lu.sans?{etape:0,type:"raison négative crue sans limite",titre:"Où ça part : la raison.",msg:`La raison ${rs} est strictement entre −1 et 1 : ${pw} tend vers 0, même si son signe change.`}:null});}
  const a=R.nz(-9,9),A=Math.abs(a),mult=R()<0.5;
  if(mult)return limite({sig:"LS3,"+a,expr:`${a<0?"−":""}${A===1?"":A+" × "}(−1)ⁿ/n`,lim:{v:Q(0)},nature:"(−1)ⁿ/n",type:"théorème des gendarmes",ens:{u:n=>a*(n%2?-1:1)/n},diag:borne,etapes:[
    {w:`${O.f(`−${A}/n ≤ uₙ ≤ ${A}/n`)}`,why:`(−1)ⁿ vaut 1 ou −1 : il reste entre −1 et 1.`,pts:1.5},
    {w:`<b>${fx("lim uₙ = 0")}</b>`,why:`Les deux suites qui encadrent tendent vers 0. ${GEND}`,pts:1.5}]});
  return limite({sig:"LS4,"+a,expr:`(−1)ⁿ ${a>0?"+":"−"} ${A}/n`,lim:{sans:true},nature:"sans limite",type:"deux sous-suites de limites différentes",ens:{u:n=>(n%2?-1:1)+a/n},etapes:[
    {w:`Pour n pair, ${fx(`uₙ = 1 ${a>0?"+":"−"} ${A}/n`)} tend vers 1. Pour n impair, ${fx(`uₙ = −1 ${a>0?"+":"−"} ${A}/n`)} tend vers −1.`,why:`${fx(A+"/n")} tend vers 0 : il ne reste que 1 ou −1, selon que n est pair ou impair.`,pts:1.5},
    {w:`<b>La suite n'a pas de limite.</b>`,why:`${DEUX} Or 1 et −1 sont différents.`,pts:1.5}],
    diag:lu=>lu.v!==undefined?{etape:0,type:"deux sous-suites de limites différentes non vues",titre:"Où ça part : le rôle de (−1)ⁿ.",msg:`Ici (−1)ⁿ n'est multiplié par rien qui tende vers 0 : les termes sautent entre des valeurs proches de 1 et des valeurs proches de −1.`}:null});}

/* ---------- AN3 : limite d'une fonction, les définitions ---------- */
const SYMD=[["ε","ε"],["η","η"],["α","α"],["A","A"],["|","|"],["<","<"],[">",">"],["f(x)","f(x)"]];
const moins=(v,c)=>c===0?v:`${v} ${c>0?"−":"+"} ${Math.abs(c)}`;
/* la définition demandée : le début est donné, il reste la condition sur x et la conclusion sur f(x) */
function definition(R){const t=R(),infinie=(t>=0.44&&t<0.64)||t>=0.92,x0=t>=0.3&&t<0.44?0:infinie?R.ent(-30,30):R.ent(-9,9),l=infinie?0:t>=0.3&&t<0.44?R.ent(-30,30):R.ent(-9,9),X=nb(x0),Lt=nb(l);
  const ecX=`|${moins("x",x0)}| < η`,ecY=`|${moins("f(x)",l)}| < ε`,dr=x0?`${X} < x < ${X} + η`:"0 < x < η",ga=x0?`${X} − η < x < ${X}`:"−η < x < 0";
  const pr=(x,y,o)=>[Math.abs(x-x0)<o.eta,Math.abs(y-l)<o.eps,x>x0&&x<x0+o.eta,x<x0&&x>x0-o.eta,x>o.al,y>o.A,y<-o.A,x>=x0&&x<x0+o.eta,x<=x0&&x>x0-o.eta];
  let o;
  if(t<0.3)o={k:"T1",lim:`lim_{x→${X}} f(x) = ${Lt}`,dit:`la limite de f en ${X} est ${Lt}`,ch:"η",q1:"ε",hyp:ecX,ccl:ecY,ih:0,ic:1,wh:`x est proche de ${X} : à une distance plus petite que η.`};
  else if(t<0.44)o={k:"T2",lim:`lim_{x→+∞} f(x) = ${Lt}`,dit:`la limite de f en +∞ est ${Lt}`,ch:"α",q1:"ε",hyp:"x > α",ccl:ecY,ih:4,ic:1,wh:"x est grand : plus grand que α. En +∞, il n'y a pas de distance à mesurer : on demande à x de dépasser un seuil."};
  else if(t<0.55)o={k:"T3",lim:`lim_{x→${X}} f(x) = +∞`,dit:`f tend vers +∞ en ${X}`,ch:"η",q1:"A",hyp:ecX,ccl:"f(x) > A",ih:0,ic:5,wh:`x est proche de ${X} : à une distance plus petite que η.`};
  else if(t<0.64)o={k:"T4",lim:`lim_{x→${X}} f(x) = −∞`,dit:`f tend vers −∞ en ${X}`,ch:"η",q1:"A",hyp:ecX,ccl:"f(x) < −A",ih:0,ic:6,wh:`x est proche de ${X} : à une distance plus petite que η.`};
  else if(t<0.79)o={k:"T5",lim:`lim_{x→${X}, x&gt;${X}} f(x) = ${Lt}`,dit:`la limite épointée à droite de f en ${X} est ${Lt}`,ch:"η",q1:"ε",hyp:dr,ccl:ecY,ih:2,ic:1,wh:`On ne regarde que les x juste à droite de ${X}, sans ${X} lui-même : strictement plus grands que ${X}, à une distance plus petite que η. C'est ce que veut dire « épointée » : le point ${X} est enlevé.`};
  else if(t<0.92)o={k:"T6",lim:`lim_{x→${X}, x&lt;${X}} f(x) = ${Lt}`,dit:`la limite épointée à gauche de f en ${X} est ${Lt}`,ch:"η",q1:"ε",hyp:ga,ccl:ecY,ih:3,ic:1,wh:`On ne regarde que les x juste à gauche de ${X}, sans ${X} lui-même : strictement plus petits que ${X}, à une distance plus petite que η. C'est ce que veut dire « épointée » : le point ${X} est enlevé.`};
  else o={k:"T7",lim:`lim_{x→${X}, x&gt;${X}} f(x) = +∞`,dit:`la limite épointée à droite de f en ${X} est +∞`,ch:"η",q1:"A",hyp:dr,ccl:"f(x) > A",ih:2,ic:5,wh:`On ne regarde que les x juste à droite de ${X}, sans ${X} lui-même : strictement plus grands que ${X}, à une distance plus petite que η. C'est ce que veut dire « épointée » : le point ${X} est enlevé.`};
  const fini=o.q1==="ε",cadre=`∀${o.q1} &gt; 0, ∃${o.ch} &gt; 0, ∀x ∈ I,`;
  /* les valeurs d'essai : x autour de x₀ (ou grand), f(x) autour de ℓ (ou grand), et deux valeurs par lettre */
  const XS=o.k==="T2"?[0.5,3,8,20,120]:[0,0.03,-0.03,0.2,-0.2,0.7,-0.7,1.6,-1.6,5.3,-5.3].map(d=>x0+d),YS=fini?[0,0.07,-0.07,0.6,-0.6,3.1,-3.1].map(d=>l+d):[-50,-3,0.4,3,50];
  const L=[];for(const eta of [0.25,1.1])for(const eps of [0.15,2.2])for(const al of [2,15])for(const A of [1.5,20])L.push({eta,eps,al,A});
  const essais=[];XS.forEach(x=>YS.forEach(y=>L.forEach(v=>essais.push({x,y,v}))));
  const lis=src=>{const out=[];for(const e of essais){const r=O.predicat(src,{x:e.x,y:e.y,"η":e.v.eta,"ε":e.v.eps,"α":e.v.al,a:e.v.A});if(r===null)return null;out.push(r);}return out;};
  const comme=(V,i,ech)=>essais.every((e,k)=>V[k]===pr(e.x,e.y,ech?{eta:fini?e.v.eps:e.v.A,eps:e.v.eta,al:fini?e.v.eps:e.v.A,A:e.v.eta}:e.v)[i]);
  const E=[{w:`La condition sur x : ${fx(h(o.hyp))}`,why:o.wh,pts:1},
    {w:`La conclusion sur f(x) : ${fx(h(o.ccl))}`,why:fini?`f(x) est proche de ${Lt} : à une distance plus petite que ε.`:`f(x) est ${o.ic===5?"grand : plus grand que A":"très négatif : plus petit que −A"}, et cela pour n'importe quel A positif.`,pts:1},
    {w:`<b>${O.f(`${cadre} ${h(o.hyp)} ⇒ ${h(o.ccl)}`)}</b>`,why:`L'ordre des lettres compte. ${o.q1} est donné en premier, et il est quelconque : ${fini?"c'est la précision demandée sur f(x)":o.ic===5?"c'est le seuil que f(x) doit dépasser":"f(x) doit descendre sous −A"}. ${o.ch} vient ensuite : on le choisit en fonction de ${o.q1}, et il porte sur x.`,pts:1}];
  function juge(rep){if(!propre(rep.hyp)||!propre(rep.ccl))return {incomplet:"Remplis les deux cases : la condition sur x, puis la conclusion sur f(x)."};
    const H=lis(rep.hyp),C=lis(rep.ccl);
    if(!H||!C)return {incomplet:`Je n'arrive pas à lire ${!H?"la condition sur x":"la conclusion sur f(x)"}. Écris une inégalité, par exemple |x - 1| < η ou f(x) > A.`};
    const okH=comme(H,o.ih),okC=comme(C,o.ic);if(okH&&okC)return {ok:true};
    const F=[];if(!okH)F.push("hyp");if(!okC)F.push("ccl");let d=null;
    if((!okH&&comme(H,o.ih,true))||(!okC&&comme(C,o.ic,true)))d={etape:2,type:`${o.q1} et ${o.ch} échangés`,titre:"Où ça part : le rôle des deux lettres.",msg:`${o.ch} mesure la condition sur x : c'est le nombre qu'on choisit. ${o.q1} mesure la conclusion sur f(x) : c'est le nombre qu'on nous donne.`};
    else if(!okH&&(o.ih===2||o.ih===3)&&comme(H,o.ih+5))d={etape:0,type:"point x₀ gardé dans une limite épointée",titre:"Où ça part : la condition sur x.",msg:`Avec ≤, tu gardes ${X} lui-même : c'est la limite ${o.ih===2?"à droite":"à gauche"} non épointée du poly. La limite épointée enlève ce point : l'inégalité avec ${X} est stricte, ${fx(h(o.hyp))}.`};
    else if(!okH&&[0,2,3].includes(o.ih)&&[0,2,3].some(i=>i!==o.ih&&comme(H,i)))d={etape:0,type:"côté de la limite",titre:"Où ça part : la condition sur x.",msg:o.ih===0?`Ici on regarde les x des deux côtés de ${X} : ${fx(h(o.hyp))}.`:`Ici on ne regarde qu'un côté de ${X} : ${fx(h(o.hyp))}.`};
    else if(!okH&&o.ih===0&&essais.every((e,k)=>H[k]===(e.x!==x0&&pr(e.x,e.y,e.v)[0])))d={etape:0,type:"limite épointée écrite à la place de la limite",titre:"Où ça part : la condition sur x.",msg:`Avec « 0 &lt; » devant, tu enlèves le point ${X} lui-même : c'est la limite épointée. La définition demandée garde ${X}.`};
    else if(!okH&&(comme(H,1)||comme(H,5)||comme(H,6)))d={etape:0,type:"condition et conclusion échangées",titre:"Où ça part : la condition sur x.",msg:"La première case porte sur x, pas sur f(x) : c'est ce qu'on suppose. La conclusion sur f(x) vient après la flèche."};
    else d=!okH?{etape:0,type:"condition sur x",titre:"Où ça part : la condition sur x.",msg:`La condition attendue : ${fx(h(o.hyp))}.`}:{etape:1,type:"conclusion sur f(x)",titre:"Où ça part : la conclusion sur f(x).",msg:`La conclusion attendue : ${fx(h(o.ccl))}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux cases sont à revoir":F[0]==="hyp"?"la condition sur x est à revoir":"la conclusion sur f(x) est à revoir"}.`,diag:d};}
  const tap=x=>x.replace(/−/g,"-"),ech=x=>x.replace(/[ηα]/g,"§").replace(new RegExp(o.q1,"g"),o.ch).replace(/§/g,o.q1);
  return {sig:"DF"+o.k+","+x0+","+l,
    q:`Soit f une fonction définie sur un intervalle I. Écris, avec des quantificateurs, ce que veut dire « ${o.dit} », c'est-à-dire ${fx(o.lim)}. Le début est donné : complète la condition sur x, puis la conclusion sur f(x).`,corps:"",
    texte:`définition de « ${o.dit} » : ${cadre.replace(/&gt;/g,">")} … ⇒ …`,
    champs:[{k:"champ",id:"hyp",nom:"condition sur x",label:`$${cadre}$`,ex:"la condition sur x"},{k:"champ",id:"ccl",nom:"conclusion",label:"$⇒$",ex:"la conclusion sur f(x)",sym:SYMD,aide:"Les boutons écrivent dans la case où tu es."}],juge,etapes:E,
    bonne:O.f(`${cadre} ${h(o.hyp)} ⇒ ${h(o.ccl)}`),bonneTxt:`${cadre.replace(/&gt;/g,">")} ${o.hyp} ⇒ ${o.ccl}`,repBonne:{hyp:tap(o.hyp),ccl:tap(o.ccl)},repFausse:{hyp:tap(ech(o.hyp)),ccl:tap(ech(o.ccl))},nature:o.k,
    ens:{type:"def",k:o.k,x0,l}};}
/* une fonction qui a une limite finie en +∞ : f, ℓ, |f(x) − ℓ| (décroissant sur ]0 ; +∞[), et un seuil qui convient */
function fonctionInf(R,formes){const k=R.choix(formes),a=R.nz(-6,6),A=Math.abs(a);
  if(k==="q"){let d,b;do{d=R.ent(0,6);b=R.ent(-9,9);}while(b===a*d||(!d&&!b));const K=Math.abs(b-a*d),num=(A===1?(a<0?"−":""):nb(a))+"x"+(b?(b>0?" + ":" − ")+Math.abs(b):""),den=d?`(x + ${d})`:"x",sg=a>0?"−":"+";
    return {sig:"q"+[a,b,d],expr:`(${num})/${den}`,l:a,f:x=>(a*x+b)/(x+d),ec:x=>K/(x+d),ecT:`${K}/${den}`,K,d,
      diff:`${fx(`f(x) ${sg} ${A} = (${num} ${sg} ${A===1?"":A}${d?`(x + ${d})`:"x"})/${den}`)}, ce qui donne ${fx(`${nb(b-a*d)}/${den}`)}`,maj:d?`${fx(`${K}/${den} &lt; ${K}/x`)}`:"",seuil:e=>K/e,seuilT:`${K}/ε`,inv:`${fx(`x &gt; ${K}/ε`)} donne ${fx(`${K}/x &lt; ε`)}`,
      pq:`Le numérateur se comporte comme ${fx((A===1?(a<0?"−":""):nb(a))+"x")} et le dénominateur comme x : le quotient se rapproche de ${fx(nb(a))}.`};}
  if(k==="c"){const b=R.nz(-9,9),B=Math.abs(b);
    return {sig:"c"+[a,b],expr:`${nb(a)} ${b>0?"+":"−"} ${B}/x²`,l:a,f:x=>a+b/(x*x),ec:x=>B/(x*x),ecT:`${B}/x²`,K:B,d:0,diff:`${fx(`f(x) ${a>0?"−":"+"} ${A} = ${nb(b)}/x²`)}`,maj:"",seuil:e=>Math.sqrt(B/e),seuilT:`√(${B}/ε)`,inv:`${fx(`x &gt; √(${B}/ε)`)} donne ${fx(`x² &gt; ${B}/ε`)} (on élève au carré deux nombres positifs), donc ${fx(`${B}/x² &lt; ε`)}`,
      pq:`${fx(`${B}/x²`)} tend vers 0 quand x tend vers +∞ : il reste ${fx(nb(a))}.`};}
  const c=R.ent(1,9),K=A*c,co=(A===1?(a<0?"−":""):nb(a));
  return {sig:"r"+[a,c],expr:`${co}x²/(x² + ${c})`,l:a,f:x=>a*x*x/(x*x+c),ec:x=>K/(x*x+c),ecT:`${K}/(x² + ${c})`,K,d:c,diff:`${fx(`f(x) ${a>0?"−":"+"} ${A} = (${co}x² ${a>0?"−":"+"} ${A===1?"":A}(x² + ${c}))/(x² + ${c})`)}, ce qui donne ${fx(`${nb(-a*c)}/(x² + ${c})`)}`,maj:`${fx(`${K}/(x² + ${c}) &lt; ${K}/x²`)}`,seuil:e=>Math.sqrt(K/e),seuilT:`√(${K}/ε)`,inv:`${fx(`x &gt; √(${K}/ε)`)} donne ${fx(`x² &gt; ${K}/ε`)} (on élève au carré deux nombres positifs), donc ${fx(`${K}/x² &lt; ε`)}`,
    pq:`Le numérateur et le dénominateur se comportent tous les deux comme un multiple de x² : le quotient se rapproche de ${fx(nb(a))}.`};}
function seuilAlpha(R){for(;;){const F=fonctionInf(R,["q","q","q","c","c"]),eps=R.choix(EPSN),e=eps.n/eps.d,Lt=nb(F.l),sg=F.l>0?"−":"+",ab=`|f(x) ${sg} ${Math.abs(F.l)}|`,quot=F.K/e;
  const exact=F.sig[0]==="q"?quot-F.d:Math.sqrt(quot),rond=Math.abs(exact-Math.round(exact))<1e-9;if(exact<2)continue;
  const exT=F.sig[0]==="q"?String(Math.round(exact)):rond?String(Math.round(exact)):`√(${Math.round(quot)})`,ok=al=>al>0&&F.ec(al)<=e*(1+1e-12);
  const E=[{w:`<b>${fx(`ℓ = ${Lt}`)}</b>`,why:F.pq,pts:1},
    {w:`${fx(`${ab} = ${F.ecT}`)} pour ${fx("x &gt; 0")}.`,why:`${F.diff}. Il reste à prendre la valeur absolue.`,pts:1},
    {w:F.sig[0]==="q"?`${fx(`${F.ecT} &lt; ${dq(eps)}`)} quand ${fx(`${F.d?`x + ${F.d}`:"x"} &gt; ${d3(quot)}`)}${F.d?`, c'est-à-dire quand ${fx(`x &gt; ${d3(exact)}`)}`:""}.`:`${fx(`${F.ecT} &lt; ${dq(eps)}`)} quand ${fx(`x² &gt; ${d3(quot)}`)}, c'est-à-dire quand ${fx(`x &gt; √${Math.round(quot)}${rond?` = ${Math.round(exact)}`:""}`)}${rond?"":`, environ ${d3(exact)}`}.`,why:`Les deux côtés sont positifs : on peut échanger la place du dénominateur et celle de ${dq(eps)}. Et ${fx(`${F.K}/${dq(eps)} = ${d3(quot)}`)}.${F.sig[0]==="q"?(F.d?` Puis on retire ${F.d} des deux côtés.`:""):` Puis, comme x est positif, ${fx(`x² &gt; ${d3(quot)}`)} veut dire ${fx(`x &gt; √${Math.round(quot)}`)}.`}`,pts:1},
    {w:`<b>${fx(`α = ${exT}`)}</b> convient, et tout nombre plus grand aussi.`,why:`Pour tout ${fx("x &gt; α")}, l'écart ${fx(ab)} est plus petit que ${dq(eps)}. On ne cherche pas le plus petit seuil : un seuil qui convient suffit${rond?"":`, par exemple ${Math.ceil(exact)}`}.`,pts:1}];
  const juge=rep=>{const c=rep.c||{},lu=nombre(String(c["ℓ"]==null?"":c["ℓ"]).replace(/^\s*[ℓl]\s*=/i,""));if(!lu)return {incomplet:"Écris la limite ℓ : un nombre, par exemple 3 ou -2."};
    const al=O.calcule(String(c["α"]==null?"":c["α"]).replace(/^\s*α\s*=/,""),{});if(al===null||!Number.isFinite(al))return {incomplet:"Écris un seuil α : un nombre, par exemple 40 ou √300."};
    if(!egal(lu,Q(F.l)))return {ok:false,faux:["ℓ"],resume:"Pas tout à fait : la limite ℓ est à revoir.",diag:{etape:0,type:"limite d'une fonction en +∞",titre:"Où ça part : la limite.",msg:`${F.pq} Donc ${fx(`ℓ = ${Lt}`)}.`}};
    if(ok(al))return {ok:true};
    return {ok:false,faux:["α"],resume:`Pas tout à fait : α = ${d3(al)} ${al>0?"est trop petit":"doit être strictement positif"}.`,diag:{etape:2,type:"seuil trop petit",titre:"Où ça part : la résolution de l'inéquation.",msg:al>0?`Juste après α = ${d3(al)}, l'écart ${fx(ab)} vaut ${pres(F.ec(al),e)} : ce n'est pas plus petit que ${dq(eps)}.`:"La définition demande un seuil α strictement positif."}};};
  const bon={"ℓ":String(F.l),"α":exT};
  return {sig:"SA"+F.sig+","+brut(eps),q:`Soit f la fonction définie sur ${fx("]0 ; +∞[")} par ${fx(`f(x) = ${F.expr}`)}. Quelle est sa limite ℓ en +∞ ? Donne ensuite un nombre ${fx("α &gt; 0")} tel que, pour tout ${fx("x &gt; α")}, on ait ${fx(`|f(x) − ℓ| &lt; ${dq(eps)}`)}.`,corps:"",
    texte:`f(x) = ${F.expr} sur ]0 ; +∞[ ; la limite ℓ en +∞, puis un α > 0 tel que x > α ⇒ |f(x) − ℓ| < ${dq(eps)}`,
    champs:[{k:"cases",id:"c",noms:["ℓ","α"],sym:["√("],aide:"Tout seuil qui convient est accepté : il n'y a pas une seule bonne réponse."}],juge,etapes:E,
    bonne:`${fx(`ℓ = ${Lt}`)} ; ${fx(`α = ${exT}`)}, ou tout nombre plus grand`,bonneTxt:`ℓ = ${Lt} ; α = ${exT}, ou tout nombre plus grand`,repBonne:{c:bon},repFausse:{c:Object.assign({},bon,{"α":"1"})},nature:"α, "+F.sig[0],ens:{type:"alpha",f:F.f,l:F.l,eps:e}};}}
function seuilEta(R){const eps=R.choix(EPSN.slice(0,8)),e=eps.n/eps.d,carre=R()<0.3,x0=carre?R.ent(1,4):R.ent(-5,5),X=nb(x0),dx=`|${moins("x",x0)}|`;
  let expr,l,pire,E,m,exQ;
  if(carre){const c=R.ent(-9,9);l=x0*x0+c;expr="x²"+(c?(c>0?" + ":" − ")+Math.abs(c):"");pire=t=>2*x0*t+t*t;m=2*x0+1;exQ=div(eps,m);const fl=moins("f(x)",l);
    E=[{w:`${fx(`${fl} = x² − ${x0*x0}`)}, donc ${fx(`|${fl}| = ${dx} × |x + ${x0}|`)}.`,why:`On reconnaît ${fx("a² − b² = (a − b)(a + b)")}.`,pts:1},
      {w:`Si ${fx(`${dx} &lt; 1`)}, alors ${fx(`|x + ${x0}| &lt; ${m}`)}, donc ${fx(`|${fl}| ≤ ${m} × ${dx}`)}.`,why:`Si x est à moins de 1 de ${X}, il est entre ${x0-1} et ${x0+1} : alors ${fx(`x + ${x0}`)} est entre ${2*x0-1} et ${2*x0+1}. Il faut majorer ce facteur, parce qu'il dépend de x.`,pts:1},
      {w:`<b>${fx(`η = ${dq(eps)}/${m} = ${nb(exQ)}`)}</b> convient, et tout nombre positif plus petit aussi.`,why:`Ce η est plus petit que 1, et ${fx(`${dx} &lt; η`)} donne ${fx(`|${fl}| &lt; ${m} × η`)}, c'est-à-dire ${dq(eps)}.`,pts:1}];}
  else{m=R.nz(-6,6);const p=R.ent(-9,9),M=Math.abs(m);l=m*x0+p;expr=(M===1?(m<0?"−":""):nb(m))+"x"+(p?(p>0?" + ":" − ")+Math.abs(p):"");pire=t=>M*t;exQ=div(eps,M);const fl=moins("f(x)",l),co=M===1?(m<0?"−":""):nb(m);
    E=[{w:`${fx(`${fl} = ${co}${x0?`(${moins("x",x0)})`:"x"}`)}, donc ${fx(`|${fl}| = ${M===1?"":M+" × "}${dx}`)}.`,why:`On factorise : ${fx(moins(expr,l))} s'annule pour x = ${X}, donc ${fx(moins("x",x0))} est en facteur.`,pts:1.5},
      {w:`<b>${fx(`η = ${M===1?dq(eps):`${dq(eps)}/${M} = ${nb(exQ)}`}`)}</b> convient, et tout nombre positif plus petit aussi.`,why:`${fx(`${dx} &lt; η`)} donne ${fx(`${M===1?"":M+" × "}${dx} &lt; ${dq(eps)}`)}.`,pts:1.5}];}
  const ok=t=>t>0&&pire(t)<=e*(1+1e-12),ab=`|${moins("f(x)",l)}|`;
  const juge=rep=>{const t=O.calcule(String((rep.c||{})["η"]==null?"":(rep.c||{})["η"]).replace(/^\s*η\s*=/,""),{});if(t===null||!Number.isFinite(t))return {incomplet:"Écris un nombre η strictement positif : un nombre à virgule ou une fraction, par exemple 0,7 ou 7/9."};
    if(ok(t))return {ok:true};
    return {ok:false,faux:["η"],resume:`Pas tout à fait : η = ${d3(t)} ${t>0?"est trop grand":"doit être strictement positif"}.`,diag:{etape:E.length-1,type:t>0?"η trop grand":"η négatif ou nul",titre:"Où ça part : le choix de η.",msg:t>0?`Avec η = ${d3(t)}, des x qui vérifient ${fx(`${dx} &lt; η`)} donnent un écart ${fx(ab)} qui va jusqu'à ${pres(pire(t),e)} : c'est plus que ${dq(eps)}.`:"La définition demande η strictement positif."}};};
  return {sig:"SE"+expr+","+x0+","+brut(eps),q:`Soit f la fonction définie sur ℝ par ${fx(`f(x) = ${expr}`)}. Sa limite en ${X} est ${nb(l)}. Donne un nombre ${fx("η &gt; 0")} tel que, pour tout réel x, ${fx(`${dx} &lt; η`)} entraîne ${fx(`${ab} &lt; ${dq(eps)}`)}.`,corps:"",
    texte:`f(x) = ${expr}, limite ${nb(l)} en ${X} ; un η > 0 tel que ${dx} < η ⇒ ${ab} < ${dq(eps)}`,
    champs:[{k:"cases",id:"c",noms:["η"],large:true,aide:"Tout η qui convient est accepté. Tu peux écrire un nombre à virgule ou une fraction."}],juge,etapes:E,
    bonne:`${fx(`η = ${nb(exQ)}`)}, ou tout nombre positif plus petit`,bonneTxt:`η = ${nb(exQ)}, ou tout nombre positif plus petit`,repBonne:{c:{"η":brut(exQ)}},repFausse:{c:{"η":brut(mul(exQ,3))}},nature:carre?"x²":"affine",
    ens:{type:"eta",f:carre?x=>x*x+(l-x0*x0):x=>m*x+(l-m*x0),l,x0,eps:e}};}
function redacFonction(R){const F=fonctionInf(R,["q","q","c","r"]),Lt=nb(F.l),sg=F.l>0?"−":"+",ab=`|f(x) ${sg} ${Math.abs(F.l)}|`;
  const lignes=[[`${fx(`lim_{x→+∞} f(x) = ${Lt}`)}`,F.pq,0.5],
    [`Pour tout ${fx("x &gt; 0")} : ${fx(`${ab} = ${F.ecT}`)}${F.maj?`, et ${F.maj}`:""}.`,`${F.diff}. Il reste à prendre la valeur absolue.${F.maj?" Puis on majore : un dénominateur plus petit donne une fraction plus grande.":""}`,1],
    [`Soit ${fx("ε &gt; 0")}. On pose ${fx(`α = ${F.seuilT}`)}, qui est strictement positif.`,`On fixe un ε quelconque, puis on choisit α en fonction de lui : c'est l'ordre de la définition.`,1],
    [`Pour tout ${fx("x &gt; α")} : ${F.inv}, donc ${fx(`${ab} &lt; ε`)}.`,`On part de ce qu'on suppose (x dépasse α) pour arriver à la conclusion.`,1],
    [`Donc : ${O.f(`∀ε &gt; 0, ∃α &gt; 0, ∀x ∈ ]0 ; +∞[, x &gt; α ⇒ ${ab} &lt; ε`)}.`,`On finit en écrivant la définition : c'est elle qu'on vient de vérifier.`,0.5]];
  return {sig:"RF"+F.sig,q:`Soit f la fonction définie sur ${fx("]0 ; +∞[")} par ${fx(`f(x) = ${F.expr}`)}. Calcule la limite de f en +∞, puis démontre ce résultat en utilisant la définition de la limite d'une fonction.`,corps:"",
    texte:`f(x) = ${F.expr} sur ]0 ; +∞[ : limite en +∞, démontrée avec la définition`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),etapes:lignes.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:"voir la rédaction",bonneTxt:`limite ${Lt}, rédaction avec α = ${F.seuilT}`,repBonne:{},nature:"papier, "+F.sig[0],ens:{type:"papier",f:F.f,l:F.l,seuil:F.seuil}};}

/* ---------- AN5 : suites adjacentes ---------- */
const SYMN=[["n","n"],["/","/"],["^","^"],["(","("],[")",")"]];
const SENS=[["cd","(uₙ) croissante, (vₙ) décroissante"],["dc","(uₙ) décroissante, (vₙ) croissante"],["cc","les deux croissantes"],["dd","les deux décroissantes"]];
const ADJ=`<p class="muted">Rappel, le théorème du cours : si (uₙ) est croissante, (vₙ) est décroissante, ${fx("uₙ ≤ vₙ")} pour tout n et ${fx("vₙ − uₙ")} tend vers 0, alors les deux suites convergent vers la même limite. Deux telles suites sont dites adjacentes. Si c'est (uₙ) qui descend au-dessus de (vₙ), on échange simplement les rôles des deux suites.</p>`;
const cstPlus=(a,sg,t)=>(a?nb(a)+(sg>0?" + ":" − "):(sg>0?"":"−"))+t;
/* une suite donnée par une formule, avec uₙ₊₁ − uₙ et son signe (s = 1 : croissante) */
function suiteMono(R,nom){const t=R(),a=R.ent(-9,9),b=R.ent(1,9),sg=R()<0.5?1:-1,D=x=>x?`(n + ${x})`:"n",N=nom+"ₙ₊₁ − "+nom+"ₙ";
  if(t<0.45){const c=R.ent(0,3),k=-sg*b;return {sig:"h"+[a,sg*b,c],expr:cstPlus(a,sg,`${b}/${D(c)}`),u:n=>a+sg*b/(n+c),diff:n=>k/((n+c)*(n+c+1)),s:-sg,diffT:`${nb(k)}/(${D(c)}${D(c+1)})`,tape:`${k}/(${D(c)}${D(c+1)})`,
    pq:`${a?`La constante ${fx(nb(a))} disparaît dans la différence : `:""}${fx(`${N} = ${sg*b===1?"":sg*b===-1?"−":nb(sg*b)}(1/${D(c+1)} − 1/${D(c)})`)}. Au même dénominateur, ${fx(`1/${D(c+1)} − 1/${D(c)} = (${D(c)} − ${D(c+1)})/(${D(c)}${D(c+1)}) = −1/(${D(c)}${D(c+1)})`)}. Il reste à multiplier par ${fx(nb(sg*b))}.`,signe:`Le dénominateur est positif, et le numérateur ${fx(nb(k))} est ${k>0?"positif":"négatif"}.`};}
  if(t<0.75){const k=R.choix([2,3]),m=-sg*b*(k-1);return {sig:"g"+[a,sg*b,k],expr:cstPlus(a,sg,`${b}/${k}ⁿ`),u:n=>a+sg*b/Math.pow(k,n),diff:n=>m/Math.pow(k,n+1),s:-sg,diffT:`${nb(m)}/${k}ⁿ⁺¹`,tape:`${m}/${k}^(n+1)`,
    pq:`${a?`La constante ${fx(nb(a))} disparaît dans la différence : `:""}${fx(`${N} = ${sg>0?"":"−"}${b}/${k}ⁿ⁺¹ ${sg>0?"−":"+"} ${b}/${k}ⁿ`)}. On écrit les deux fractions avec le même dénominateur, en multipliant en haut et en bas par ${k} : ${fx(`${b}/${k}ⁿ = ${b*k}/${k}ⁿ⁺¹`)}. Donc ${fx(`${N} = (${sg>0?"":"−"}${b} ${sg>0?"−":"+"} ${b*k})/${k}ⁿ⁺¹ = ${nb(m)}/${k}ⁿ⁺¹`)}.`,signe:`${fx(k+"ⁿ⁺¹")} est positif, et le numérateur ${fx(nb(m))} est ${m>0?"positif":"négatif"}.`};}
  for(;;){const pp=R.nz(-6,6),c=R.ent(1,5),qq=R.ent(-9,9),k=pp*c-qq;if(!k||Math.abs(k)>30)continue;const num=polyT([qq,pp]);
    return {sig:"q"+[pp,qq,c],expr:`(${num})/(n + ${c})`,u:n=>(pp*n+qq)/(n+c),diff:n=>k/((n+c)*(n+c+1)),s:k>0?1:-1,diffT:`${nb(k)}/(${D(c)}${D(c+1)})`,tape:`${k}/(${D(c)}${D(c+1)})`,
      pq:`On remplace n par n + 1 : ${fx(`${nom}ₙ₊₁ = (${polyT([pp+qq,pp])})/(n + ${c+1})`)}. On réduit au même dénominateur ${fx(`(n + ${c})(n + ${c+1})`)}. Au numérateur, ${fx(`(${polyT([pp+qq,pp])})(n + ${c}) = ${polyT([(pp+qq)*c,pp*c+pp+qq,pp])}`)} et ${fx(`(${num})(n + ${c+1}) = ${polyT([qq*(c+1),pp*(c+1)+qq,pp])}`)} : les termes en n² et en n sont les mêmes, la différence vaut ${fx(nb(k))}.`,signe:`Le dénominateur est positif, et le numérateur ${fx(nb(k))} est ${k>0?"positif":"négatif"}.`};}}
const mot=s=>s>0?"croissante":"décroissante";
function sensDeux(R){let U,V;do{U=suiteMono(R,"u");V=suiteMono(R,"v");}while(U.sig===V.sig);const bon=(U.s>0?"c":"d")+(V.s>0?"c":"d"),NS=[1,2,3,5,8,13];
  const E=[{w:`${fx(`uₙ₊₁ − uₙ = ${U.diffT}`)}`,why:U.pq,pts:1.5},
    {w:`${fx("uₙ₊₁ − uₙ")} est ${U.s>0?"positif":"négatif"} pour tout n : <b>(uₙ) est ${mot(U.s)}</b>.`,why:`${U.signe} Une suite est croissante quand chaque terme est supérieur ou égal au précédent, c'est-à-dire quand ${fx("uₙ₊₁ − uₙ ≥ 0")} pour tout n.`,pts:0.5},
    {w:`${fx(`vₙ₊₁ − vₙ = ${V.diffT}`)}, qui est ${V.s>0?"positif":"négatif"} pour tout n : <b>(vₙ) est ${mot(V.s)}</b>.`,why:`${V.pq} ${V.signe}`,pts:1}];
  function juge(rep){if(!propre(rep.du))return {incomplet:"Écris uₙ₊₁ − uₙ avec la lettre n, par exemple 2/(n(n+1)) ou -3/2^(n+1)."};
    const W=NS.map(n=>O.calcule(rep.du,{n}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à lire cette formule. Écris-la avec la lettre n, par exemple 2/(n(n+1)) ou -3/2^(n+1)."};
    if(!rep.sens)return {incomplet:"Choisis aussi le sens de variation des deux suites."};
    const pres=(f)=>NS.every((n,i)=>Math.abs(W[i]-f(n))<=1e-9*Math.max(1,Math.abs(f(n)))),okD=pres(U.diff),okS=rep.sens===bon,F=[];if(okD&&okS)return {ok:true};
    if(!okD)F.push("du");if(!okS)F.push("sens");
    const d=!okD?(pres(n=>-U.diff(n))?{etape:0,type:"signe de la différence",titre:"Où ça part : le sens de la soustraction.",msg:`Tu as calculé ${fx("uₙ − uₙ₊₁")}. On demande ${fx("uₙ₊₁ − uₙ")} : le terme suivant moins le terme d'avant.`}:pres(n=>U.u(n+1))?{etape:0,type:"terme suivant donné à la place de la différence",titre:"Où ça part : la différence.",msg:`Tu as écrit ${fx("uₙ₊₁")}. Il reste à lui retirer ${fx("uₙ")}.`}:{etape:0,type:"calcul de la différence de deux termes",titre:"Où ça part : le calcul de la différence.",msg:`${fx(`uₙ₊₁ − uₙ = ${U.diffT}`)}.`})
      :rep.sens[0]!==bon[0]?{etape:1,type:"signe de la différence et sens de variation",titre:"Où ça part : le sens de (uₙ).",msg:`${fx("uₙ₊₁ − uₙ")} est ${U.s>0?"positif":"négatif"} : chaque terme est ${U.s>0?"plus grand":"plus petit"} que le précédent, donc (uₙ) est ${mot(U.s)}.`}:{etape:2,type:"sens de variation de la deuxième suite",titre:"Où ça part : le sens de (vₙ).",msg:`${fx(`vₙ₊₁ − vₙ = ${V.diffT}`)} est ${V.s>0?"positif":"négatif"} : (vₙ) est ${mot(V.s)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"la différence et le sens de variation sont à revoir":F[0]==="du"?"la différence est à revoir":"le sens de variation est à revoir"}.`,diag:d};}
  return {sig:"SD"+U.sig+"|"+V.sig,q:`On pose, pour tout entier ${fx("n ≥ 1")}, ${fx(`uₙ = ${U.expr}`)} et ${fx(`vₙ = ${V.expr}`)}. Calcule ${fx("uₙ₊₁ − uₙ")} en fonction de n, puis donne le sens de variation des deux suites.`,corps:"",
    texte:`uₙ = ${U.expr}, vₙ = ${V.expr} (n ≥ 1) ; uₙ₊₁ − uₙ, puis le sens de variation des deux suites`,
    champs:[{k:"champ",id:"du",nom:"uₙ₊₁ − uₙ",label:"$uₙ₊₁ − uₙ =$",ex:"une formule avec n",sym:SYMN},{k:"choix",id:"sens",o:SENS}],juge,etapes:E,
    bonne:`${fx(`uₙ₊₁ − uₙ = ${U.diffT}`)} ; (uₙ) ${mot(U.s)}, (vₙ) ${mot(V.s)}`,bonneTxt:`uₙ₊₁ − uₙ = ${U.diffT} ; (uₙ) ${mot(U.s)}, (vₙ) ${mot(V.s)}`,repBonne:{du:U.tape,sens:bon},repFausse:{du:"-("+U.tape+")",sens:bon},nature:U.sig[0]+V.sig[0],
    ens:{type:"sens",u:U.u,v:V.u}};}
/* vₙ − uₙ et sa limite : adjacentes ou pas */
function ecartDeux(R){const DEN=[["n",n=>n],["n²",n=>n*n],["2ⁿ",n=>Math.pow(2,n)],["3ⁿ",n=>Math.pow(3,n)]],a=R.ent(-9,9),b=R.ent(1,9),c=R.ent(1,9),d1=R.choix(DEN),d2=R()<0.6?d1:R.choix(DEN),a2=R()<0.65?a:a+R.nz(-4,4),e=a2-a,meme=d1===d2;
  const ue=cstPlus(a,-1,`${b}/${d1[0]}`),ve=cstPlus(a2,1,`${c}/${d2[0]}`),u=n=>a-b/d1[1](n),v=n=>a2+c/d2[1](n),tp=x=>x.replace("ⁿ","^n").replace("²","^2");
  const dT=meme?cstPlus(e,1,`${b+c}/${d1[0]}`):cstPlus(e,1,`${c}/${d2[0]}`)+` + ${b}/${d1[0]}`,dTape=meme?`${e}+${b+c}/${tp(d1[0])}`:`${e}+${c}/${tp(d2[0])}+${b}/${tp(d1[0])}`,NS=[1,2,3,5,8],LIM="lim (vₙ − uₙ)";
  const E=[{w:`${fx(`vₙ − uₙ = ${dT}`)}`,why:`${fx(`vₙ − uₙ = (${ve}) − (${ue})`)}. Le signe moins devant la parenthèse change ${a?"les deux signes":"le signe"} de ${fx("uₙ")} : ${fx(`vₙ − uₙ = ${ve} ${a?`${a>0?"−":"+"} ${Math.abs(a)} `:""}+ ${b}/${d1[0]}`)}.${a?(a2?` Les nombres ${fx(nb(a2))} et ${fx(nb(-a))} donnent ${fx(nb(e))}.`:` Il reste le nombre ${fx(nb(-a))}.`):""}${meme?` Les deux fractions ont le même dénominateur : on ajoute les numérateurs, ${fx(`${c} + ${b} = ${b+c}`)}.`:""}`,pts:1},
    {w:`<b>${fx(`${LIM} = ${nb(e)}`)}</b>`,why:`Quand n tend vers +∞, ${meme?"la fraction tend vers 0 : son dénominateur":"les deux fractions tendent vers 0 : leur dénominateur"} tend vers +∞${e?`. Il reste ${fx(nb(e))}`:""}.`,pts:1},
    {w:e?`<b>Les suites ne sont pas adjacentes.</b>`:`<b>Les suites sont adjacentes.</b>`,why:e?`Leur différence tend vers ${fx(nb(e))}, pas vers 0 : il manque la dernière condition du théorème, ${fx("lim (vₙ − uₙ) = 0")}. Les deux suites convergent, mais vers deux limites différentes, ${fx(nb(a))} et ${fx(nb(a2))}.`:`(uₙ) est croissante et (vₙ) est décroissante (c'est admis), ${fx("uₙ ≤ vₙ")} pour tout n car ${fx(`vₙ − uₙ = ${dT}`)} est ${meme?"une fraction positive":"une somme de deux fractions positives"}, et ${fx("vₙ − uₙ")} tend vers 0 : les quatre conditions du théorème sont réunies. Les deux suites convergent donc vers la même limite, qui est ${fx(nb(a))}.`,pts:1}];
  function juge(rep){if(!propre(rep.dv))return {incomplet:"Écris vₙ − uₙ avec la lettre n, par exemple 5/n ou 2 + 3/2^n."};
    const W=NS.map(n=>O.calcule(rep.dv,{n}));if(W.some(x=>x===null||!Number.isFinite(x)))return {incomplet:"Je n'arrive pas à lire cette formule. Écris-la avec la lettre n, par exemple 5/n ou 2 + 3/2^n."};
    const lu=nombre((rep.c||{})[LIM]);if(!lu)return {incomplet:"Écris la limite de vₙ − uₙ : un nombre."};if(!rep.adj)return {incomplet:"Dis aussi si les deux suites sont adjacentes."};
    const pr=f=>NS.every((n,i)=>Math.abs(W[i]-f(n))<1e-9),okD=pr(n=>v(n)-u(n)),okL=egal(lu,Q(e)),okA=(rep.adj==="oui")===!e,F=[];if(okD&&okL&&okA)return {ok:true};
    if(!okD)F.push("dv");if(!okL)F.push(LIM);if(!okA)F.push("adj");
    const d=!okD?(pr(n=>u(n)-v(n))?{etape:0,type:"signe de la différence",titre:"Où ça part : le sens de la soustraction.",msg:`Tu as calculé ${fx("uₙ − vₙ")}. On demande ${fx("vₙ − uₙ")}.`}:{etape:0,type:"calcul de la différence de deux suites",titre:"Où ça part : le calcul de vₙ − uₙ.",msg:`${fx(`vₙ − uₙ = ${dT}`)}. Attention au signe moins devant ${fx("uₙ")} : il change tous ses signes.`})
      :!okL?{etape:1,type:"limite de la différence",titre:"Où ça part : la limite.",msg:`Les fractions tendent vers 0 : il reste ${fx(nb(e))}.`}:{etape:2,type:"troisième condition des suites adjacentes",titre:"Où ça part : la conclusion.",msg:e?`La différence tend vers ${fx(nb(e))}, pas vers 0 : les suites ne sont pas adjacentes.`:"La différence tend vers 0, (uₙ) est croissante, (vₙ) est décroissante, et uₙ ≤ vₙ car vₙ − uₙ est positif : les quatre conditions sont réunies, elles sont adjacentes."};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${et(F.map(k=>k==="dv"?"vₙ − uₙ":k==="adj"?"la réponse « adjacentes »":"la limite"))} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:d};}
  return {sig:"EC"+[a,b,c,d1[0],d2[0],a2],q:`On pose, pour tout entier ${fx("n ≥ 1")}, ${fx(`uₙ = ${ue}`)} et ${fx(`vₙ = ${ve}`)}. On admet que (uₙ) est croissante et que (vₙ) est décroissante. Calcule ${fx("vₙ − uₙ")} en fonction de n, puis sa limite. Les deux suites sont-elles adjacentes ?`,corps:ADJ,
    texte:`uₙ = ${ue}, vₙ = ${ve} (n ≥ 1) ; vₙ − uₙ, sa limite, adjacentes ou pas`,
    champs:[{k:"champ",id:"dv",nom:"vₙ − uₙ",label:"$vₙ − uₙ =$",ex:"une formule avec n",sym:SYMN},{k:"cases",id:"c",noms:[LIM]},{k:"choix",id:"adj",o:[["oui","Elles sont adjacentes"],["non","Elles ne le sont pas"]]}],juge,etapes:E,
    bonne:`${fx(`vₙ − uₙ = ${dT}`)} ; limite ${fx(nb(e))} ; ${e?"pas adjacentes":"adjacentes"}`,bonneTxt:`vₙ − uₙ = ${dT} ; limite ${nb(e)} ; ${e?"pas adjacentes":"adjacentes"}`,
    repBonne:{dv:dTape,c:{[LIM]:String(e)},adj:e?"non":"oui"},repFausse:{dv:dTape,c:{[LIM]:String(e)},adj:e?"oui":"non"},nature:e?"pas adjacentes":"adjacentes",ens:{type:"ecart",u,v}};}
/* comme l'exercice 2 du CC1 2025 : deux suites qui se partagent leurs termes */
const POIDS=[[2,1],[3,1],[3,2],[4,1],[5,1],[4,3],[5,2],[5,3],[7,1],[5,4],[7,3],[9,1]];
function croisees(R){let a,b;do{a=R.ent(-9,9);b=R.ent(-9,9);}while(a===b);const [p,qq]=R.choix(POIDS),D=p+qq,k=Q(p-qq,D),l=Q(a+b,2),co=x=>x===1?"":x;
  return {a,b,p,qq,D,k,l,u1:Q(p*a+qq*b,D),v1:Q(qq*a+p*b,D),haut:a<b,ru:`uₙ₊₁ = (${co(p)}uₙ + ${co(qq)}vₙ)/${D}`,rv:`vₙ₊₁ = (${co(qq)}uₙ + ${co(p)}vₙ)/${D}`,sig:[a,b,p,qq].join(","),
    pas:n=>{let u=a,v=b;for(let i=0;i<n;i++)[u,v]=[(p*u+qq*v)/D,(qq*u+p*v)/D];return [u,v];}};}
function adjacentes(R){const S=croisees(R),bon=S.haut?"cd":"dc",kT=nb(S.k),co=x=>x===1?"":x;
  const E=[{w:`${fx(`u₁ = ${nb(S.u1)}`)} et ${fx(`v₁ = ${nb(S.v1)}`)}`,why:`On remplace ${fx("u₀")} par ${fx(nb(S.a))} et ${fx("v₀")} par ${fx(nb(S.b))} dans les deux formules : ${fx(`u₁ = (${S.p} × ${par(S.a)} + ${S.qq===1?"":S.qq+" × "}${par(S.b)})/${S.D}`)} et ${fx(`v₁ = (${S.qq===1?"":S.qq+" × "}${par(S.a)} + ${S.p} × ${par(S.b)})/${S.D}`)}.`,pts:1},
    {w:`${fx(`vₙ₊₁ − uₙ₊₁ = ${kT} × (vₙ − uₙ)`)}, donc <b>${fx(`k = ${kT}`)}</b>.`,why:`On soustrait les deux formules : ${fx(`((${co(S.qq)}uₙ + ${co(S.p)}vₙ) − (${co(S.p)}uₙ + ${co(S.qq)}vₙ))/${S.D}`)}, c'est-à-dire ${fx(`${co(S.p-S.qq)}(vₙ − uₙ)/${S.D}`)}. Donc ${fx(`k = ${S.p-S.qq}/${S.D}`)}${S.k.d!==S.D?`, qui se simplifie en ${fx(kT)}`:""}.`,pts:1.5},
    {w:`${fx("vₙ − uₙ")} garde le signe de ${fx(`v₀ − u₀ = ${nb(S.b-S.a)}`)} : il est toujours ${S.haut?"positif":"négatif"}. Donc <b>(uₙ) est ${mot(S.haut?1:-1)} et (vₙ) est ${mot(S.haut?-1:1)}</b>.`,why:`À chaque rang, la différence est multipliée par ${fx(kT)}, qui est positif : son signe ne change pas. Et ${fx(`uₙ₊₁ − uₙ = ${co(S.qq)}(vₙ − uₙ)/${S.D}`)}, alors que ${fx(`vₙ₊₁ − vₙ = −${co(S.qq)}(vₙ − uₙ)/${S.D}`)}.`,pts:1.5},
    {w:`<b>${fx(`ℓ = ${nb(S.l)}`)}</b>`,why:`${fx("vₙ − uₙ")} est multiplié par ${fx(kT)} à chaque rang, et ${fx(kT)} est entre 0 et 1 : il tend vers 0. Avec l'étape d'avant (${S.haut?"(uₙ) croissante, (vₙ) décroissante, uₙ ≤ vₙ":"(vₙ) croissante, (uₙ) décroissante, vₙ ≤ uₙ"}), les quatre conditions du théorème sont réunies : les suites sont adjacentes et ont la même limite ℓ. Pour la trouver, on cherche ce qui ne bouge pas : ${fx("uₙ₊₁ + vₙ₊₁ = uₙ + vₙ")}, donc ${fx(`uₙ + vₙ = ${nb(S.a+S.b)}`)} pour tout n. À la limite, ${fx(`2ℓ = ${nb(S.a+S.b)}`)}.`,pts:2}];
  function juge(rep){const V=[(rep.c||{})["u₁"],(rep.c||{})["v₁"],(rep.d||{}).k,(rep.e||{})["ℓ"]].map(nombre);
    if(V.some(x=>!x))return {incomplet:"Remplis les quatre cases avec des nombres, par exemple 3/2 ou -1."};if(!rep.sens)return {incomplet:"Choisis aussi le sens de variation des deux suites."};
    const ok=[egal(V[0],S.u1),egal(V[1],S.v1),egal(V[2],S.k),rep.sens===bon,egal(V[3],S.l)],NOM=["u₁","v₁","k","le sens de variation","ℓ"],F=NOM.filter((_,i)=>!ok[i]);if(!F.length)return {ok:true};
    const dg=!ok[0]||!ok[1]?{etape:0,type:"calcul des premiers termes",titre:"Où ça part : les premiers termes.",msg:`${fx(`u₁ = (${co(S.p)===""?"":S.p+" × "}${par(S.a)} + ${co(S.qq)===""?"":S.qq+" × "}${par(S.b)})/${S.D}`)}, ce qui donne ${fx(nb(S.u1))}.`}
      :!ok[2]?{etape:1,type:"raison de la suite des différences",titre:"Où ça part : la différence des deux formules.",msg:`En soustrayant, les termes en ${fx("uₙ")} donnent ${fx(`${S.qq-S.p}uₙ`)} et ceux en ${fx("vₙ")} donnent ${fx(`${S.p-S.qq}vₙ`)} : ${fx(`k = ${S.p-S.qq}/${S.D}`)}.`}
      :!ok[3]?{etape:2,type:"sens de variation lu sans regarder l'ordre de départ",titre:"Où ça part : le signe de vₙ − uₙ.",msg:`Ici ${fx(`v₀ − u₀ = ${nb(S.b-S.a)}`)} est ${S.haut?"positif":"négatif"} : ${S.haut?"(uₙ) part d'en bas et monte, (vₙ) part d'en haut et descend":"(uₙ) part d'en haut et descend, (vₙ) part d'en bas et monte"}.`}
      :{etape:3,type:"limite commune par la quantité constante",titre:"Où ça part : la limite commune.",msg:`${fx("uₙ + vₙ")} ne change pas : il vaut toujours ${fx(`u₀ + v₀ = ${nb(S.a+S.b)}`)}. À la limite, ${fx(`2ℓ = ${nb(S.a+S.b)}`)}.`};
    return {ok:false,faux:F.filter(x=>x.length<3),resume:`Pas tout à fait : ${et(F)} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:dg};}
  return {sig:"AD"+S.sig,q:`Deux suites sont définies par ${fx(`u₀ = ${nb(S.a)}`)}, ${fx(`v₀ = ${nb(S.b)}`)} et, pour tout entier naturel n, ${fx(S.ru)} et ${fx(S.rv)}. Calcule u₁ et v₁. Donne le nombre k tel que ${fx("vₙ₊₁ − uₙ₊₁ = k(vₙ − uₙ)")} pour tout n. Donne le sens de variation des deux suites, puis leur limite commune ℓ.`,corps:ADJ,
    texte:`u₀ = ${nb(S.a)}, v₀ = ${nb(S.b)}, ${S.ru}, ${S.rv} ; u₁, v₁, k tel que vₙ₊₁ − uₙ₊₁ = k(vₙ − uₙ), sens de variation, limite commune`,
    champs:[{k:"cases",id:"c",noms:["u₁","v₁"]},{k:"cases",id:"d",noms:["k"]},{k:"choix",id:"sens",o:SENS},{k:"cases",id:"e",noms:["ℓ"]}],juge,etapes:E,
    bonne:`${fx(`u₁ = ${nb(S.u1)}`)}, ${fx(`v₁ = ${nb(S.v1)}`)}, ${fx(`k = ${kT}`)}, (uₙ) ${mot(S.haut?1:-1)}, (vₙ) ${mot(S.haut?-1:1)}, ${fx(`ℓ = ${nb(S.l)}`)}`,bonneTxt:`u₁ = ${nb(S.u1)}, v₁ = ${nb(S.v1)}, k = ${kT}, (uₙ) ${mot(S.haut?1:-1)}, (vₙ) ${mot(S.haut?-1:1)}, ℓ = ${nb(S.l)}`,
    repBonne:{c:{"u₁":brut(S.u1),"v₁":brut(S.v1)},d:{k:brut(S.k)},sens:bon,e:{"ℓ":brut(S.l)}},repFausse:{c:{"u₁":brut(S.u1),"v₁":brut(S.v1)},d:{k:brut(S.k)},sens:S.haut?"dc":"cd",e:{"ℓ":brut(S.l)}},nature:S.haut?"u en bas":"u en haut",ens:{type:"adj",pas:S.pas}};}
function redacAdj(R){let S;do S=croisees(R);while(!S.haut);const kT=nb(S.k),clos=S.k.n===1?`${nb(S.b-S.a)}/${S.k.d}ⁿ`:`${S.b-S.a===1?"":nb(S.b-S.a)+" × "}${S.k.n}ⁿ/${S.k.d}ⁿ`,[u2,v2]=[Q(S.p*S.u1.n*S.v1.d+S.qq*S.v1.n*S.u1.d,S.D*S.u1.d*S.v1.d),Q(S.qq*S.u1.n*S.v1.d+S.p*S.v1.n*S.u1.d,S.D*S.u1.d*S.v1.d)],co=x=>x===1?"":x,som=nb(S.a+S.b),dif=nb(S.b-S.a);
  const lignes=[[`a) ${fx(`u₁ = ${nb(S.u1)}`)}, ${fx(`v₁ = ${nb(S.v1)}`)}, ${fx(`u₂ = ${nb(u2)}`)}, ${fx(`v₂ = ${nb(v2)}`)}.`,`On applique les deux formules avec n = 0 : ${fx(`u₁ = (${S.p} × ${par(S.a)} + ${S.qq===1?"":S.qq+" × "}${par(S.b)})/${S.D}`)}, de même pour ${fx("v₁")}. Puis on recommence avec n = 1 : ${fx(`u₂ = (${co(S.p)}u₁ + ${co(S.qq)}v₁)/${S.D}`)} et ${fx(`v₂ = (${co(S.qq)}u₁ + ${co(S.p)}v₁)/${S.D}`)}.`,1],
    [`b) ${fx(`uₙ₊₁ + vₙ₊₁ = (${S.D}uₙ + ${S.D}vₙ)/${S.D}`)}, c'est-à-dire ${fx("uₙ + vₙ")} : la suite ${fx("(uₙ + vₙ)")} est constante, égale à ${fx(`u₀ + v₀ = ${som}`)}.`,`On additionne les deux formules : les coefficients de ${fx("uₙ")} font ${S.D}, ceux de ${fx("vₙ")} aussi.`,1],
    [`c) ${fx(`vₙ₊₁ − uₙ₊₁ = ${kT} × (vₙ − uₙ)`)} : la suite ${fx("(vₙ − uₙ)")} est géométrique de raison ${fx(kT)}. Son premier terme est ${fx(`v₀ − u₀ = ${dif}`)}, donc ${fx(`vₙ − uₙ = ${clos}`)}.`,`On soustrait les deux formules : ${fx(`vₙ₊₁ − uₙ₊₁ = ((${co(S.qq)}uₙ + ${co(S.p)}vₙ) − (${co(S.p)}uₙ + ${co(S.qq)}vₙ))/${S.D} = ${co(S.p-S.qq)}(vₙ − uₙ)/${S.D}`)}. Une suite multipliée par le même nombre à chaque rang est géométrique : son terme de rang n est son premier terme multiplié n fois par la raison.`,1.5],
    [`d) D'après c), ${fx(`vₙ − uₙ = ${clos}`)} est positif pour tout n. Donc ${fx(`uₙ₊₁ − uₙ = ${co(S.qq)}(vₙ − uₙ)/${S.D} ≥ 0`)} et ${fx(`vₙ₊₁ − vₙ = −${co(S.qq)}(vₙ − uₙ)/${S.D} ≤ 0`)}.`,`On calcule chaque différence avec la formule de récurrence : ${fx(`uₙ₊₁ − uₙ = (${co(S.p)}uₙ + ${co(S.qq)}vₙ)/${S.D} − uₙ = (${co(S.qq)}vₙ − ${co(S.qq)}uₙ)/${S.D}`)}, car ${fx(`${S.p}uₙ − ${S.D}uₙ = −${co(S.qq)}uₙ`)}. De même, ${fx(`vₙ₊₁ − vₙ = (${co(S.qq)}uₙ + ${co(S.p)}vₙ)/${S.D} − vₙ = (${co(S.qq)}uₙ − ${co(S.qq)}vₙ)/${S.D}`)}.`,1],
    [`Donc, pour tout n : ${fx("uₙ ≤ uₙ₊₁ ≤ vₙ₊₁ ≤ vₙ")}.`,`L'inégalité du milieu vient encore de c) : ${fx("vₙ₊₁ − uₙ₊₁ ≥ 0")}.`,0.5],
    [`e) D'après d), (uₙ) est croissante, (vₙ) est décroissante et ${fx("uₙ ≤ vₙ")} pour tout n. D'après c), ${fx("lim (vₙ − uₙ) = 0")}, car la raison ${fx(kT)} est entre 0 et 1. Les suites sont donc adjacentes : elles convergent vers la même limite ℓ.`,`Ce sont les quatre conditions du théorème des suites adjacentes, dans l'ordre du cours : il faut les citer toutes les quatre, comme le corrigé officiel du CC1 2025-2026.`,0.5],
    [`${fx(`uₙ + vₙ = ${som}`)} pour tout n, donc à la limite ${fx(`2ℓ = ${som}`)} : <b>${fx(`ℓ = ${nb(S.l)}`)}</b>.`,`La limite de la somme est la somme des limites : ℓ + ℓ.`,0.5]];
  return {sig:"RA"+S.sig,q:`Deux suites sont définies par ${fx(`u₀ = ${nb(S.a)}`)}, ${fx(`v₀ = ${nb(S.b)}`)} et, pour tout entier naturel n, ${fx(S.ru)} et ${fx(S.rv)}.`,
    corps:`<ol type="a"><li>Calcule u₁, v₁, u₂ et v₂.</li><li>Démontre que la suite ${fx("(uₙ + vₙ)")} est constante.</li><li>Exprime ${fx("vₙ₊₁ − uₙ₊₁")} avec ${fx("vₙ − uₙ")}, puis donne ${fx("vₙ − uₙ")} en fonction de n.</li><li>Démontre que, pour tout n, ${fx("uₙ ≤ uₙ₊₁ ≤ vₙ₊₁ ≤ vₙ")}.</li><li>Démontre que les deux suites convergent, et donne leur limite.</li></ol>`,
    texte:`u₀ = ${nb(S.a)}, v₀ = ${nb(S.b)}, ${S.ru}, ${S.rv} : l'exercice complet (premiers termes, somme constante, différence géométrique, encadrement, limite commune)`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
    etapes:lignes.map(x=>({w:x[0],why:x[1],pts:x[2]})),bonne:"voir la rédaction",bonneTxt:`limite commune ${nb(S.l)}`,repBonne:{},nature:"papier",ens:{type:"adjp",pas:S.pas,l:S.l.n/S.l.d,u2:u2.n/u2.d,v2:v2.n/v2.d,k:S.k.n/S.k.d}};}

/* ---------- AN6 : suite récurrente uₙ₊₁ = f(uₙ) ---------- */
const INDT=["₀","₁","₂","₃"],qv=x=>x.n/x.d;
/* f donnée par : expr (avec uₙ), F (calcul exact), calc(x) (le calcul écrit avec la valeur x) */
function relation(R,sortes){const k=R.choix(sortes);
  if(k==="aff"){const [p,qq]=R.choix([[1,2],[1,3],[2,3],[3,2],[2,1],[3,1],[-1,2],[-1,3]]),m=R.nz(-9,9),pu=(Math.abs(p)===1?(p<0?"−":""):p)+"uₙ",ms=(m>0?" + ":" − ")+Math.abs(m);
    return {sig:"aff"+[p,qq,m],expr:qq===1?pu+ms:`(${pu}${ms})/${qq}`,F:x=>div(add(mul(p,x),m),qq),mid:x=>{const v=add(mul(p,x),m);return qq===1?"":(v.d===1?nb(v):`(${nb(v)})`)+"/"+qq;},calc:x=>qq===1?`${Math.abs(p)===1?(p<0?"−":""):p+" × "}${par(x)}${ms}`:`(${Math.abs(p)===1?(p<0?"−":""):p+" × "}${par(x)}${ms})/${qq}`};}
  if(k==="hom"){const a=R.nz(-6,6),b=R.ent(1,6);return {sig:"hom"+[a,b],expr:`${nb(a)}/(uₙ + ${b})`,F:x=>div(a,add(x,b)),mid:x=>{const s=add(x,b);if(nb(s)==="1")return "";return `${nb(a)}/${s.d===1?par(s):"("+nb(s)+")"}`;},calc:x=>`${nb(a)}/(${nb(x)} + ${b})`};}
  const c=R.ent(1,6);return {sig:"car"+c,expr:`uₙ² − ${c}`,F:x=>sub(mul(x,x),c),mid:x=>`${nb(mul(x,x))} − ${c}`,calc:x=>`${par(x)}² − ${c}`};}
function premiers(R){for(;;){const f=relation(R,["aff","aff","hom","car"]),u0=R.ent(-4,6),T=[Q(u0)];let ok=true;
  for(let i=0;i<3;i++){const x=T[i];if(f.sig.startsWith("hom")&&qv(add(x,+f.sig.split(",")[1]))===0){ok=false;break;}T.push(f.F(x));}
  if(!ok||T.some(x=>Math.abs(x.n)>300||x.d>300)||egal(T[1],T[0]))continue;
  const E=[1,2,3].map(i=>({w:`<b>${fx(`u${INDT[i]} = ${nb(T[i])}`)}</b>`,why:`On remplace ${fx("uₙ")} par ${fx(`u${INDT[i-1]} = ${nb(T[i-1])}`)} dans la relation : ${fx(`u${INDT[i]} = ${f.calc(T[i-1])}${f.mid(T[i-1])&&f.mid(T[i-1])!==nb(T[i])?` = ${f.mid(T[i-1])}`:""} = ${nb(T[i])}`)}.`,pts:1}));
  function juge(rep){const V=[1,2,3].map(i=>nombre((rep.c||{})["u"+INDT[i]]));if(V.some(x=>!x))return {incomplet:"Remplis les trois cases avec des nombres, par exemple 5/2 ou -3."};
    const F=[1,2,3].filter(i=>!egal(V[i-1],T[i]));if(!F.length)return {ok:true};const i=F[0],suite=i<3&&egal(V[i],f.F(V[i-1]));
    return {ok:false,faux:F.map(j=>"u"+INDT[j]),resume:`Pas tout à fait : ${et(F.map(j=>"u"+INDT[j]))} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:{etape:i-1,type:"calcul d'un terme avec la relation de récurrence",titre:`Où ça part : le calcul de u${INDT[i]}.`,msg:`${fx(`u${INDT[i]} = ${f.calc(T[i-1])}`)}, ce qui donne ${fx(nb(T[i]))}.${suite?" Le terme suivant est calculé à partir de celui-ci : ton calcul d'après est juste, mais il part d'une valeur fausse.":""}`}};}
  const bon={};[1,2,3].forEach(i=>{bon["u"+INDT[i]]=brut(T[i]);});
  return {sig:"PT"+f.sig+","+u0,q:`La suite (uₙ) est définie par ${fx(`u₀ = ${nb(u0)}`)} et, pour tout entier naturel n, ${fx(`uₙ₊₁ = ${f.expr}`)}. Calcule u₁, u₂ et u₃.`,corps:"",texte:`u₀ = ${nb(u0)}, uₙ₊₁ = ${f.expr} ; calculer u₁, u₂, u₃`,
    champs:[{k:"cases",id:"c",noms:["u₁","u₂","u₃"]}],juge,etapes:E,bonne:[1,2,3].map(i=>fx(`u${INDT[i]} = ${nb(T[i])}`)).join(", "),bonneTxt:[1,2,3].map(i=>`u${INDT[i]} = ${nb(T[i])}`).join(", "),
    repBonne:{c:bon},repFausse:{c:Object.assign({},bon,{"u₂":brut(add(T[2],1))})},nature:f.sig.slice(0,3),ens:{type:"termes",f:x=>qv(f.F(Q(Math.round(x*1e6),1e6))),u0,F:f.F}};}}
/* les limites possibles : on passe à la limite dans la relation */
function limitePossible(R){const t=R(),positif=R()<0.6;let expr,eq,sol,garde,f,resol,dom="";
  if(t<0.3){const [p,qq]=R.choix([[1,2],[1,3],[2,3],[3,4],[1,4],[3,2],[2,1],[3,1]]),l=R.ent(-6,6),m=l*(qq-p),pu=(p===1?"":p)+"uₙ",pl=(p===1?"":p)+"ℓ",ms=m?(m>0?" + ":" − ")+Math.abs(m):"";
    expr=qq===1?pu+ms:`(${pu}${ms})/${qq}`;eq=qq===1?`ℓ = ${pl}${ms}`:`${qq}ℓ = ${pl}${ms}`;sol=[l];garde=[l];f=x=>(p*x+m)/qq;resol=`${fx(`${comb([qq-p],["ℓ"])} = ${nb(m)}`)}, donc ${fx(`ℓ = ${nb(l)}`)}`;}
  else if(t<0.55){const r=R.ent(1,6),sv=R.ent(1,6),a=r*sv,b=sv-r;expr=b?`${a}/(uₙ${(b>0?" + ":" − ")+Math.abs(b)})`:`${a}/uₙ`;eq=b?`ℓ(ℓ${(b>0?" + ":" − ")+Math.abs(b)}) = ${a}`:`ℓ² = ${a}`;sol=[r,-sv];garde=positif?[r]:[r,-sv];f=x=>a/(x+b);
    resol=`${fx(`ℓ²${b?(b>0?" + ":" − ")+(Math.abs(b)===1?"":Math.abs(b))+"ℓ":""} − ${a} = 0`)}, c'est-à-dire ${fx(`(ℓ − ${r})(ℓ + ${sv}) = 0`)}`;dom=positif?"pos":"";}
  else if(t<0.8){const r=R.ent(2,7),sv=R.ent(1,r-1),a=r-sv,c=r*sv;expr=`√(${a===1?"":a}uₙ + ${c})`;eq=`ℓ² = ${a===1?"":a}ℓ + ${c}`;sol=[r,-sv];garde=[r];f=x=>Math.sqrt(a*x+c);
    resol=`${fx(`ℓ² − ${a===1?"":a}ℓ − ${c} = 0`)}, c'est-à-dire ${fx(`(ℓ − ${r})(ℓ + ${sv}) = 0`)}`;dom="rac";}
  else{const k=R.ent(1,5);expr=`uₙ/2 + ${k*k}/uₙ`;eq=`ℓ/2 = ${k*k}/ℓ`;sol=[k*Math.SQRT2,-k*Math.SQRT2];garde=positif?[sol[0]]:sol;f=x=>x/2+k*k/x;resol=`${fx(`ℓ² = ${2*k*k}`)}`;dom=positif?"pos":"";
    sol.T=[`${k===1?"":k}√2`,`−${k===1?"":k}√2`];}
  const T=x=>sol.T?sol.T[sol.indexOf(x)]:nb(x),tapeV=x=>sol.T?(x<0?"-":"")+String(Math.abs(Math.round(x/Math.SQRT2)))+"*√2":String(x),ecarte=sol.filter(x=>!garde.includes(x));
  const direct=`ℓ = ${expr.replace(/uₙ/g,"ℓ")}`;
  const E=[{w:`On passe à la limite dans la relation : ${fx(direct)}${direct!==eq?`, donc ${fx(eq)}`:""}.`,why:`Si ${fx("uₙ")} tend vers ℓ, alors ${fx("uₙ₊₁")} aussi : les deux côtés de la relation ont la même limite.${dom==="rac"?" On élève ensuite au carré pour enlever la racine.":sol.T?` On retire ${fx("ℓ/2")} des deux côtés.`:sol.length>1?" On multiplie ensuite les deux côtés par le dénominateur.":direct!==eq?" On multiplie ensuite les deux côtés par le dénominateur.":""}`,pts:1},
    {w:`${resol}${sol.length>1?` : ${sol.map(x=>fx(`ℓ = ${T(x)}`)).join(" ou ")}`:""}.`,why:sol.T?`On multiplie les deux côtés par 2ℓ. Un nombre strictement positif a deux racines carrées, une positive et une négative${sol.T[0]!=="√2"?` ; ici ${fx(`√${Math.round(sol[0]*sol[0])} = √(${Math.round(sol[0]*sol[0]/2)} × 2) = ${sol.T[0]}`)}`:""}.`:sol.length>1?"Un produit est nul quand l'un de ses facteurs est nul : l'équation a deux solutions.":"C'est une équation du premier degré : une seule solution.",pts:1},
    {w:`<b>${garde.length>1?"Les deux valeurs sont possibles":`La seule valeur possible est ${fx(`ℓ = ${T(garde[0])}`)}`}.</b>`,why:ecarte.length?(dom==="rac"?`Une racine carrée est positive ou nulle : tous les termes à partir de u₁ le sont, donc ℓ aussi. On écarte ${fx(T(ecarte[0]))}.`:`Tous les termes sont strictement positifs, donc leur limite est positive ou nulle. On écarte ${fx(T(ecarte[0]))}.`):sol.length>1?"Rien dans l'énoncé ne permet d'écarter l'une des deux : cela dépend du premier terme.":"Ce calcul donne la valeur de la limite, pas son existence : ici on a admis que la suite converge.",pts:1}];
  function juge(rep){const P=propre(rep.l).split(/;|\bet\b|\bou\b/).map(x=>x.trim()).filter(Boolean);if(!P.length)return {incomplet:"Écris la ou les valeurs possibles de ℓ, séparées par un point-virgule, par exemple 3 ; -2."};
    const V=P.map(x=>O.calcule(x,{}));if(V.some(x=>x===null||!Number.isFinite(x)))return {incomplet:"Je n'arrive pas à lire ces nombres. Sépare-les par un point-virgule, par exemple 3 ; -2 ou 2√2."};
    const a=(A,B)=>A.every(x=>B.some(y=>Math.abs(x-y)<1e-9));if(a(V,garde)&&a(garde,V))return {ok:true};
    const d=a(V,sol)&&a(sol,V)&&ecarte.length?{etape:2,type:"solution à écarter grâce aux bornes de la suite",titre:"Où ça part : le choix de la solution.",msg:`L'équation a bien deux solutions, mais ${fx(T(ecarte[0]))} est impossible ici : ${dom==="rac"?"une racine carrée n'est jamais négative":"tous les termes sont strictement positifs"}.`}
      :a(V,garde)&&V.length<garde.length?{etape:1,type:"deuxième solution oubliée",titre:"Où ça part : la résolution.",msg:`L'équation a deux solutions, et rien ne permet d'en écarter une : ${garde.map(x=>fx(T(x))).join(" et ")}.`}
      :a(V,sol)&&garde.length===1?{etape:2,type:"mauvaise solution gardée",titre:"Où ça part : le choix de la solution.",msg:`La valeur à garder est ${fx(T(garde[0]))} : la limite doit être positive ou nulle.`}
      :{etape:1,type:"résolution de l'équation obtenue en passant à la limite",titre:"Où ça part : la résolution.",msg:`${resol} : ${sol.map(x=>fx(T(x))).join(" ou ")}.`};
    return {ok:false,faux:["l"],resume:"Pas tout à fait : ce ne sont pas les bonnes valeurs.",diag:d};}
  const faux=ecarte.length?sol.map(tapeV).join(" ; "):sol.length>1?tapeV(sol[0]):String(sol[0]+1);
  return {sig:"LP"+expr+dom,q:`Une suite (uₙ) vérifie ${fx(`uₙ₊₁ = ${expr}`)} pour tout entier naturel n${dom==="pos"?", et tous ses termes sont strictement positifs":""}. On admet qu'elle converge vers un réel ℓ. Quelles sont les valeurs possibles de ℓ ? S'il y en a plusieurs, sépare-les par un point-virgule.`,corps:"",
    texte:`uₙ₊₁ = ${expr}${dom==="pos"?" (termes strictement positifs)":""} ; valeurs possibles de la limite ℓ`,champs:[{k:"champ",id:"l",nom:"ℓ",label:"$ℓ =$",ex:"par exemple 3 ; -2",sym:[["√","√"],[";"," ; "],["/","/"]]}],juge,etapes:E,
    bonne:garde.map(x=>fx(`ℓ = ${T(x)}`)).join(" ou "),bonneTxt:garde.map(x=>`ℓ = ${T(x)}`).join(" ou "),repBonne:{l:garde.map(tapeV).join(" ; ")},repFausse:{l:faux},nature:sol.length>1?(ecarte.length?"une des deux":"les deux"):"une seule",
    ens:{type:"fixe",f,garde,sol,dom}};}
/* f affine : sens de variation et limite */
const SENS1=[["c","croissante"],["d","décroissante"],["n","ni l'un ni l'autre"]];
function affineSens(R){const [p,qq]=R.choix([[1,2],[1,3],[2,3],[3,4],[1,4],[2,1],[3,1],[3,2],[-1,2],[-1,3],[-2,3]]),l=R.ent(-6,6),m=l*(qq-p),a=p/qq,u0=l+R.nz(-6,6),pc1=Math.abs(p)===1?(p<0?"−":""):nb(p),pu=pc1+"uₙ",ms=m?(m>0?" + ":" − ")+Math.abs(m):"";
  const expr=qq===1?pu+ms:ms?`(${pu}${ms})/${qq}`:`${pu}/${qq}`,aT=nb(Q(p,qq)),Qa=Q(p,qq),pw=Qa.d===1?(Qa.n>0?`${Qa.n}ⁿ`:`(${nb(Qa.n)})ⁿ`):Qa.n<0?`(${aT})ⁿ`:Qa.n===1?`1/${Qa.d}ⁿ`:`${Qa.n}ⁿ/${Qa.d}ⁿ`,haut=u0>l,sens=a<0?"n":a<1?(haut?"d":"c"):(haut?"c":"d"),L=Math.abs(a)<1?{v:Q(l)}:{inf:haut?1:-1},ec=moins("uₙ",l),e0=u0-l,forme=Qa.n===1&&Qa.d>1?`${nb(e0)}/${Qa.d}ⁿ`:e0===1?pw:e0===-1?`−${pw}`:`${nb(e0)} × ${pw}`;
  const E=[{w:`La seule limite finie possible est ${fx(nb(l))}.`,why:`On passe à la limite dans la relation : ${fx(qq===1?`ℓ = ${(p===1?"":p)+"ℓ"}${ms}`:`ℓ = ${ms?`(${pc1}ℓ${ms})`:`${pc1}ℓ`}/${qq}`)}, donc ${fx(`${qq}ℓ = ${pc1+"ℓ"}${ms}`)}, ce qui donne ${fx(`ℓ = ${nb(l)}`)}.`,pts:1},
    {w:`${fx(`${moins("uₙ₊₁",l)} = ${aT} × ${l?`(${ec})`:ec}`)}, donc ${fx(`${ec} = ${forme}`)}.`,why:l?`${l<0?`On ajoute ${fx(nb(-l))} aux`:`On retire ${fx(nb(l))} des`} deux côtés de la relation et on factorise : ${fx(qq===1?`${moins("uₙ₊₁",l)} = ${pu}${ms} ${l>0?"−":"+"} ${Math.abs(l)} = ${pc1}(${ec})`:`${moins("uₙ₊₁",l)} = (${pu}${ms} ${l>0?"−":"+"} ${Math.abs(qq*l)})/${qq} = ${pc1}(${ec})/${qq}`)}. L'écart à ${fx(nb(l))} est multiplié par ${fx(aT)} à chaque rang : c'est une suite géométrique, de premier terme ${fx(`u₀ − ${par(l)} = ${nb(e0)}`)}.`:`La relation dit que chaque terme vaut le précédent multiplié par ${fx(aT)} : c'est une suite géométrique, de premier terme ${fx(`u₀ = ${nb(e0)}`)}.`,pts:1},
    {w:`<b>La suite ${sens==="n"?"n'est ni croissante ni décroissante":"est "+mot(sens==="c"?1:-1)}.</b>`,why:a<0?`La raison ${fx(aT)} est négative : l'écart change de signe à chaque rang, les termes passent d'un côté à l'autre de ${fx(nb(l))}.`:`L'écart ${fx(ec)} reste ${haut?"positif":"négatif"}, et il est multiplié par ${fx(aT)}, qui est ${a<1?"entre 0 et 1 : il se rapproche de 0":"plus grand que 1 : il s'éloigne de 0"}. Les termes ${sens==="c"?"augmentent":"diminuent"}.`,pts:1},
    {w:`<b>${fx(`lim uₙ = ${limT(L)}`)}</b>`,why:Math.abs(a)<1?`${fx(pw)} tend vers 0, car la raison ${fx(aT)} est strictement entre −1 et 1 : l'écart à ${fx(nb(l))} tend vers 0.`:`${fx(pw)} tend vers +∞, car la raison ${fx(aT)} est plus grande que 1, et on le multiplie par ${fx(nb(e0))}, qui est ${haut?"positif":"négatif"}.`,pts:1}];
  function juge(rep){if(!rep.sens)return {incomplet:"Choisis d'abord le sens de variation."};const lu=lisLim(rep.lim);if(!lu)return {incomplet:"Écris la limite : un nombre, +∞, −∞ ou « pas de limite »."};
    const okS=rep.sens===sens,okL=memeLim(lu,L),F=[];if(okS&&okL)return {ok:true};if(!okS)F.push("sens");if(!okL)F.push("lim");
    const d=!okS?{etape:2,type:a<0?"suite qui oscille crue monotone":"sens de variation d'une suite arithmético-géométrique",titre:"Où ça part : le sens de variation.",msg:a<0?`La raison ${fx(aT)} est négative : les termes passent d'un côté à l'autre de ${fx(nb(l))}, la suite ne monte ni ne descend.`:`Le premier terme ${fx(nb(u0))} est ${haut?"au-dessus":"en dessous"} de ${fx(nb(l))}, et l'écart ${a<1?"se réduit":"grandit"} : les termes ${sens==="c"?"augmentent":"diminuent"}.`}
      :{etape:3,type:Math.abs(a)<1?"limite d'une suite dont l'écart tend vers 0":"raison plus grande que 1 : limite infinie",titre:"Où ça part : la limite.",msg:Math.abs(a)<1?`L'écart à ${fx(nb(l))} est multiplié par ${fx(aT)} à chaque rang : il tend vers 0, donc la suite tend vers ${fx(nb(l))}.`:`L'écart à ${fx(nb(l))} est multiplié par ${fx(aT)} à chaque rang : il grandit sans s'arrêter, et la suite tend vers ${limT(L)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"le sens de variation et la limite sont à revoir":F[0]==="sens"?"le sens de variation est à revoir":"la limite est à revoir"}.`,diag:d};}
  const lt=L.inf?(L.inf>0?"+∞":"-∞"):String(l);
  return {sig:"AS"+[p,qq,l,u0],q:`La suite (uₙ) est définie par ${fx(`u₀ = ${nb(u0)}`)} et, pour tout entier naturel n, ${fx(`uₙ₊₁ = ${expr}`)}. Quel est son sens de variation ? Quelle est sa limite ?`,corps:"",texte:`u₀ = ${nb(u0)}, uₙ₊₁ = ${expr} ; sens de variation et limite`,
    champs:[{k:"choix",id:"sens",o:SENS1},{k:"champ",id:"lim",nom:"limite",label:"$lim uₙ =$",ex:"un nombre, +∞, −∞, pas de limite",sym:LIMS}],juge,etapes:E,
    bonne:`${sens==="n"?"ni croissante ni décroissante":mot(sens==="c"?1:-1)} ; ${fx(`lim uₙ = ${limT(L)}`)}`,bonneTxt:`${sens==="n"?"ni croissante ni décroissante":mot(sens==="c"?1:-1)} ; limite ${limT(L)}`,repBonne:{sens,lim:lt},repFausse:{sens:sens==="c"?"d":"c",lim:lt},nature:a<0?"oscille":a<1?"converge":"diverge",
    ens:{type:"affine",f:x=>(p*x+m)/qq,u0,sens,lim:L.inf?L.inf*Infinity:l}};}
/* l'étude complète sur papier, comme l'exercice 2 du CC1 2024 */
function redacRecurrente(R){const r=R.ent(2,7),sv=R.ent(1,r-1),a=r-sv,c=r*sv,bas=R()<0.6,u0=bas?R.ent(0,r-1):r+R.ent(1,6),au=(a===1?"":a)+"uₙ",rac=`√(${au} + ${c})`,P=bas?`0 ≤ uₙ ≤ ${r}`:`uₙ ≥ ${r}`;
  const lignes=[[`a) Par récurrence. Initialisation : ${fx(`u₀ = ${u0}`)} vérifie bien ${fx(P.replace("uₙ","u₀"))}.`,`On annonce la récurrence, puis on vérifie la propriété au premier rang.`,0.5],
    [`Hérédité : si ${fx(P)}, alors ${fx(bas?`${c} ≤ ${au} + ${c} ≤ ${r*r}`:`${au} + ${c} ≥ ${r*r}`)}, donc ${fx(P.replace("uₙ","uₙ₊₁"))}.`,`${a===1?`On ajoute ${c} : ${fx(`${r} + ${c} = ${r*r}`)}`:`On multiplie par ${a} et on ajoute ${c} : ${fx(`${a} × ${r} + ${c} = ${r*r}`)}`}. Puis la racine carrée garde l'ordre, et ${fx(`√${r*r} = ${r}`)}.${bas?` À gauche, ${fx(`√${c} ≥ 0`)}.`:""}`,1],
    [`b) ${fx(`uₙ₊₁ − uₙ = (${au} + ${c} − uₙ²)/(${rac} + uₙ)`)}.`,`On multiplie et on divise par la quantité conjuguée ${fx(`${rac} + uₙ`)}, qui est strictement positive : ${fx(bas?"uₙ ≥ 0":`uₙ ≥ ${r}`)} d'après a), et ${fx(`${rac} ≥ √${c} &gt; 0`)}. Au numérateur, ${fx(`(${rac} − uₙ)(${rac} + uₙ) = ${au} + ${c} − uₙ²`)}.`,0.5],
    [`${fx(`${au} + ${c} − uₙ² = (${r} − uₙ)(uₙ + ${sv})`)}, qui est ${bas?"positif ou nul":"négatif ou nul"} d'après a) : la suite est ${bas?"croissante":"décroissante"}.`,`On factorise le numérateur : ${fx(`(${r} − uₙ)(uₙ + ${sv}) = ${r}uₙ + ${c} − uₙ² − ${sv===1?"":sv}uₙ = ${au} + ${c} − uₙ²`)}. ${bas?`Comme uₙ est entre 0 et ${r}, les deux facteurs sont positifs ou nuls.`:`Comme uₙ est au moins égal à ${r}, le premier facteur est négatif ou nul et le second positif.`} Le dénominateur est strictement positif : ${fx("uₙ₊₁ − uₙ")} a le signe du numérateur.`,1],
    [`c) La suite est ${bas?`croissante et majorée par ${r}`:`décroissante et minorée par ${r}`} : elle converge, vers un réel ℓ${bas?" positif ou nul":` au moins égal à ${r}`}.`,`C'est le théorème de la limite monotone. Les inégalités larges passent à la limite.`,0.5],
    [`On passe à la limite dans la relation : ${fx(`ℓ = √(${a===1?"":a}ℓ + ${c})`)}, donc ${fx(`ℓ² = ${a===1?"":a}ℓ + ${c}`)}, c'est-à-dire ${fx(`(ℓ − ${r})(ℓ + ${sv}) = 0`)}. Comme ℓ est positif : <b>${fx(`ℓ = ${r}`)}</b>.`,`On élève au carré, on passe tout du même côté et on factorise. La solution ${fx(nb(-sv))} est écartée grâce à l'encadrement du a).`,1]];
  return {sig:"RR"+[r,sv,u0],q:`La suite (uₙ) est définie par ${fx(`u₀ = ${u0}`)} et, pour tout entier naturel n, ${fx(`uₙ₊₁ = ${rac}`)}.`,
    corps:`<ol type="a"><li>Montre que, pour tout n, ${fx(P)}.</li><li>Montre que la suite (uₙ) est ${bas?"croissante":"décroissante"}.</li><li>Montre que la suite (uₙ) converge, et calcule sa limite.</li></ol>`,
    texte:`u₀ = ${u0}, uₙ₊₁ = ${rac} : encadrement par récurrence, sens de variation, convergence et limite`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),etapes:lignes.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:"voir la rédaction",bonneTxt:`suite ${bas?"croissante et majorée":"décroissante et minorée"} par ${r}, limite ${r}`,repBonne:{},nature:bas?"croissante":"décroissante",ens:{type:"recp",f:x=>Math.sqrt(a*x+c),u0,r,bas}};}

/* ---------- AN8 : valeur absolue, inéquations, partie entière ---------- */
const SYMI=[["[","["],["]","]"],[";"," ; "],["∪"," ∪ "],["+∞","+∞"],["−∞","-∞"],["∅","∅"],["ℝ","ℝ"]];
const tout=P=>P.length===1&&!P[0].a&&!P[0].b,point=p=>p.a&&p.b&&p.a.v===p.b.v;
const ensT=P=>!P.length?"∅":tout(P)?"ℝ":P.map(p=>point(p)?`{${p.a.t}}`:pt(p)).join(" ∪ ");
const ensTape=P=>!P.length?"∅":tout(P)?"ℝ":P.map(p=>`${p.oa?"]":"["}${p.a?brut(p.a.q):"-∞"} ; ${p.b?brut(p.b.q):"+∞"}${p.ob?"[":"]"}`).join(" ∪ ");
/* ce que l'étudiant tape : une liste de morceaux, [] pour l'ensemble vide, null si ça ne se lit pas, "ordre" si une borne gauche dépasse la droite */
function lisEns(src){let s=propre(src).replace(/\s+/g,"");if(!s)return null;
  if(/^(∅|vide|ensemblevide|aucune(solution)?|pasdesolution|\{\})$/i.test(s))return [];
  if(/^(ℝ|r)$/i.test(s))return [pc(null,true,null,true)];
  const borne=t=>{if(/^[+-]?(∞|inf|infini|oo)$/i.test(t))return {inf:t[0]==="-"?-1:1};const v=O.calcule(t,{});return v===null||!Number.isFinite(v)?null:{v};},out=[];
  for(const part of s.replace(/union|ou/gi,"∪").replace(/u/gi,"∪").split("∪")){
    let m=/^\{(.+)\}$/.exec(part);if(m){const b=borne(m[1]);if(!b||b.inf)return null;out.push({a:{v:b.v},oa:false,b:{v:b.v},ob:false});continue;}
    m=/^([\[\]])(.+)([\[\]])$/.exec(part);if(!m)return null;
    const mid=m[2],k=mid.includes(";")?mid.indexOf(";"):mid.indexOf(",")===mid.lastIndexOf(",")?mid.indexOf(","):-1;if(k<0)return null;
    const A=borne(mid.slice(0,k)),B=borne(mid.slice(k+1));if(!A||!B||(A.inf===1)||(B.inf===-1))return null;
    const a=A.inf?null:{v:A.v},b=B.inf?null:{v:B.v},oa=m[1]==="]",ob=m[3]==="[";
    if(a&&b&&(a.v>b.v||(a.v===b.v&&(oa||ob))))return "ordre";
    out.push({a,oa:!a||oa,b,ob:!b||ob});}
  return unir(out);}
const memeEns=(A,B,sansCrochets)=>A.length===B.length&&A.every((p,i)=>{const z=B[i],e=(x,y)=>(!x&&!y)||(x&&y&&Math.abs(x.v-y.v)<1e-9);return e(p.a,z.a)&&e(p.b,z.b)&&(sansCrochets||(p.oa===z.oa&&p.ob===z.ob));});
/* o : {sig, ineq, P (morceaux attendus), m (l'inéquation elle-même, pour le contrôle), etapes, nature, pieges:[[P, type, msg]], note} */
function inequation(o){const P=unir(o.P),bon=ensT(P),dern=o.etapes.length-1;
  function juge(rep){const L=lisEns(rep.S);
    if(L==="ordre")return {incomplet:"Dans un intervalle, la borne de gauche est la plus petite. Vérifie l'ordre de tes deux bornes."};
    if(!L)return {incomplet:"Écris un intervalle ou une réunion d'intervalles, par exemple ]-1 ; 3[ ou ]-∞ ; 2] ∪ [5 ; +∞[. Pour l'ensemble vide : ∅."};
    if(memeEns(L,P))return {ok:true};
    let d=null;for(const g of o.pieges||[])if(memeEns(L,unir(g[0]))){d={etape:g[3]==null?0:g[3],type:g[1],titre:"Où ça part : "+g[1]+".",msg:g[2]};break;}
    if(!d&&memeEns(L,P,true))d={etape:dern,type:"crochets ouverts ou fermés",titre:"Où ça part : les crochets.",msg:`Les bornes sont justes, mais pas les crochets. Une inégalité large (≤ ou ≥) garde la borne : crochet fermé. Une inégalité stricte l'exclut : crochet ouvert. Ici ${fx(`S = ${bon}`)}.`};
    if(!d)d={etape:dern,type:o.type||"résolution d'une inéquation avec valeur absolue",titre:"Où ça part : la résolution.",msg:`${fx(`S = ${bon}`)}.`};
    return {ok:false,faux:["S"],resume:"Pas tout à fait : ce n'est pas le bon ensemble.",diag:d};}
  const fausse=o.pieges&&o.pieges.length?ensTape(unir(o.pieges[0][0])):P.length?"∅":"ℝ";
  return {sig:o.sig,q:`Résous dans ℝ : ${fx(h(o.ineq))}. Écris l'ensemble S des solutions comme un intervalle ou une réunion d'intervalles.`,corps:o.note?`<p class="muted">${o.note}</p>`:"",
    texte:`résoudre dans ℝ : ${o.ineq}`,champs:[{k:"champ",id:"S",nom:"S",label:"$S =$",ex:"par exemple ]-1 ; 3[",sym:SYMI,aide:"Pour l'ensemble vide, écris ∅. Pour tous les réels, écris ℝ."}],juge,etapes:o.etapes,
    bonne:fx(`S = ${bon}`),bonneTxt:`S = ${bon}`,repBonne:{S:ensTape(P)},repFausse:{S:fausse},nature:o.nature,ens:{m:o.m,P}};}
const absT=(c)=>c?`|x ${c>0?"−":"+"} ${Math.abs(c)}|`:"|x|";
function absDedans(R){const a=R.ent(-20,20),r=R.ent(1,15),st=R()<0.5,op=st?"<":"≤",g=val(a-r),d=val(a+r),A=absT(a);
  return inequation({sig:"VD"+[a,r,op],ineq:`${A} ${op} ${r}`,P:[pc(g,st,d,st)],m:x=>vrai(op,Math.abs(x-a),r),nature:"dedans",
    pieges:[[[pc(val(-r),st,val(r),st)],"centre de la valeur absolue oublié",`Tu as résolu ${fx(`|x| ${h(op)} ${r}`)}. Ici la distance se mesure à partir de ${fx(nb(a))}, pas de 0.`],[[pc(null,true,g,st),pc(d,st,null,true)],"intérieur et extérieur confondus",`« Plus petit que ${r} » : x est près de ${fx(nb(a))}, donc entre les deux bornes, pas à l'extérieur.`]].filter(()=>a!==0),
    etapes:[{w:`${fx(`${A} ${h(op)} ${r}`)} veut dire ${fx(`−${r} ${h(op)} ${moins("x",a)} ${h(op)} ${r}`)}.`,why:`${fx(A)} est la distance entre x et ${fx(nb(a))}. Elle est ${TXT[op]} ${r} quand ${fx(moins("x",a))} est entre ${fx(nb(-r))} et ${fx(nb(r))}.`,pts:1},
      {w:`${fx(`${nb(a-r)} ${h(op)} x ${h(op)} ${nb(a+r)}`)}`,why:a?`On ${a>0?"ajoute":"retire"} ${Math.abs(a)} aux trois membres.`:"Il n'y a rien à ajouter : l'encadrement de x est déjà là.",pts:1},
      {w:`<b>${fx(`S = ${pt(pc(g,st,d,st))}`)}</b>`,why:st?"L'inégalité est stricte : les deux bornes ne sont pas solutions, les crochets sont ouverts.":"L'inégalité est large : les deux bornes sont solutions, les crochets sont fermés.",pts:1}]});}
function absAffine(R,dehors){for(;;){const a=R.choix([2,3,4,5,-1,-2,-3,-4]),b=R.nz(-9,9),c=R.ent(1,12),st=R()<0.5,op=dehors?(st?">":"≥"):(st?"<":"≤"),x1=Q(-c-b,a),x2=Q(c-b,a),lo=val(a>0?x1:x2),hi=val(a>0?x2:x1);if(lo.q.d>6)continue;
  const ax=comb([a],["x"]),X=`${ax} ${b>0?"+":"−"} ${Math.abs(b)}`,A=`|${X}|`,o1=dehors?(st?"<":"≤"):op,flip={"<":">","≤":"≥",">":"<","≥":"≤"},dedansP=[pc(lo,st,hi,st)],dehorsP=[pc(null,true,lo,st),pc(hi,st,null,true)];
  const div=`On divise par ${fx(nb(a))}${a<0?" : c'est un nombre négatif, donc le sens des inégalités change":", qui est positif : le sens ne change pas"}.`;
  if(!dehors)return inequation({sig:"VA"+[a,b,c,op],ineq:`${A} ${op} ${c}`,P:dedansP,m:x=>vrai(op,Math.abs(a*x+b),c),nature:"affine, dedans",pieges:[[dehorsP,"intérieur et extérieur confondus",`« Plus petit que ${c} » : ${fx(X)} est entre ${fx(nb(-c))} et ${fx(nb(c))}. Les solutions forment un seul intervalle.`]],
    etapes:[{w:`${fx(`−${c} ${h(op)} ${X} ${h(op)} ${c}`)}`,why:`La valeur absolue d'un nombre est ${TXT[op]} ${c} quand ce nombre est entre ${fx(nb(-c))} et ${fx(nb(c))}.`,pts:1},
      {w:`${fx(`${nb(-c-b)} ${h(op)} ${ax} ${h(op)} ${nb(c-b)}`)}`,why:`On ${b>0?"retire":"ajoute"} ${Math.abs(b)} aux trois membres.`,pts:1},
      {w:`${fx(`${lo.t} ${h(op)} x ${h(op)} ${hi.t}`)}, donc <b>${fx(`S = ${pt(dedansP[0])}`)}</b>.`,why:div,pts:1}]});
  return inequation({sig:"VE"+[a,b,c,op],ineq:`${A} ${op} ${c}`,P:dehorsP,m:x=>vrai(op,Math.abs(a*x+b),c),nature:"affine, dehors",pieges:[[dedansP,"« ou » pris pour « et »",`« Plus grand que ${c} » : ${fx(X)} est soit en dessous de ${fx(nb(-c))}, soit au-dessus de ${fx(nb(c))}. Les solutions sont à l'extérieur, en deux morceaux.`]],
    etapes:[{w:`${fx(`${X} ${h(o1)} −${c}`)} ou ${fx(`${X} ${h(op)} ${c}`)}`,why:`La valeur absolue d'un nombre est ${TXT[op]} ${c} quand ce nombre est en dessous de ${fx(nb(-c))} ou au-dessus de ${fx(nb(c))}. C'est un « ou » : deux cas séparés.`,pts:1},
      {w:`${fx(`${ax} ${h(o1)} ${nb(-c-b)}`)} ou ${fx(`${ax} ${h(op)} ${nb(c-b)}`)}`,why:`On ${b>0?"retire":"ajoute"} ${Math.abs(b)} des deux côtés, dans chaque cas.`,pts:1},
      {w:`${fx(`x ${h(a>0?o1:flip[o1])} ${nb(x1)}`)} ou ${fx(`x ${h(a>0?op:flip[op])} ${nb(x2)}`)}, donc <b>${fx(`S = ${un(dehorsP)}`)}</b>.`,why:div,pts:1}]});}}
function absDehors(R){if(R()<0.5)return absAffine(R,true);const a=R.ent(-9,9),r=R.ent(1,9),st=R()<0.5,op=st?">":"≥",o1=st?"<":"≤",g=val(a-r),d=val(a+r),A=absT(a),P=[pc(null,true,g,st),pc(d,st,null,true)];
  return inequation({sig:"VX"+[a,r,op],ineq:`${A} ${op} ${r}`,P,m:x=>vrai(op,Math.abs(x-a),r),nature:"dehors",pieges:[[[pc(g,st,d,st)],"« ou » pris pour « et »",`« Plus grand que ${r} » : x est loin de ${fx(nb(a))}, à gauche de ${fx(g.t)} ou à droite de ${fx(d.t)}. Les solutions sont à l'extérieur, en deux morceaux.`]],
    etapes:[{w:`${fx(`${moins("x",a)} ${h(o1)} −${r}`)} ou ${fx(`${moins("x",a)} ${h(op)} ${r}`)}`,why:`${fx(A)} est la distance entre x et ${fx(nb(a))}. Elle est ${TXT[op]} ${r} quand x est assez loin de ${fx(nb(a))}, d'un côté ou de l'autre. C'est un « ou » : deux cas séparés.`,pts:1},
      {w:`${fx(`x ${h(o1)} ${g.t}`)} ou ${fx(`x ${h(op)} ${d.t}`)}`,why:a?`On ${a>0?"ajoute":"retire"} ${Math.abs(a)} des deux côtés, dans chaque cas.`:"Il n'y a rien à ajouter.",pts:1},
      {w:`<b>${fx(`S = ${un(P)}`)}</b>`,why:`Le « ou » se traduit par une réunion ∪. ${st?"L'inégalité est stricte : crochets ouverts.":"L'inégalité est large : les deux bornes sont solutions, crochets fermés de leur côté."}`,pts:1}]});}
const ENT=`E(x) désigne la partie entière de x : le plus grand entier inférieur ou égal à x. Par exemple E(2,7) = 2 et E(−1,5) = −2.`;
function deuxAbs(R){const t=R();
  if(t<0.3){let a,b;do{a=R.ent(-9,9);b=R.ent(-9,9);}while(a===b);const op=R.choix(OPS),st=op==="<"||op===">",mi=val(Q(a+b,2)),gauche=(op==="<"||op==="≤")===(a<b),P=[gauche?pc(null,true,mi,st):pc(mi,st,null,true)];
    return inequation({sig:"V2"+[a,b,op],ineq:`${absT(a)} ${op} ${absT(b)}`,P,m:x=>vrai(op,Math.abs(x-a),Math.abs(x-b)),nature:"deux distances",type:"comparaison de deux distances",pieges:[[[gauche?pc(mi,st,null,true):pc(null,true,mi,st)],"côté du milieu inversé",`Le milieu est juste, mais pas le côté : on veut les x ${op==="<"||op==="≤"?"plus proches":"plus loin"} de ${fx(nb(a))} que de ${fx(nb(b))}.`,2]],
      etapes:[{w:`${fx(absT(a))} est la distance entre x et ${fx(nb(a))} ; ${fx(absT(b))} est la distance entre x et ${fx(nb(b))}.`,why:`L'inéquation demande les x qui sont ${op==="<"||op==="≤"?"plus proches":"plus loin"} de ${fx(nb(a))} que de ${fx(nb(b))}.`,pts:1},
        {w:`Le point à égale distance des deux est leur milieu : ${fx(mi.t)}.`,why:`Le milieu de ${fx(nb(a))} et ${fx(nb(b))} est leur demi-somme : ${fx(`(${nb(a)} + ${par(b)})/2`)}.`,pts:1},
        {w:`<b>${fx(`S = ${pt(P[0])}`)}</b>`,why:`${fx(nb(a))} est ${a<b?"à gauche":"à droite"} du milieu : les x plus proches de ${fx(nb(a))} sont du même côté que lui. ${st?"L'inégalité est stricte : le milieu lui-même n'est pas solution.":"L'inégalité est large : le milieu est solution."}`,pts:1}]});}
  if(t<0.55){const c=R.ent(-9,9),a=R.ent(1,5),b=a+R.ent(1,6),s1=R()<0.5,s2=R()<0.5,o1=s1?"<":"≤",o2=s2?"<":"≤",P=[pc(val(c-b),s2,val(c-a),s1),pc(val(c+a),s1,val(c+b),s2)],A=absT(c);
    return inequation({sig:"VC"+[c,a,b,o1,o2],ineq:`${a} ${o1} ${A} ${o2} ${b}`,P,m:x=>vrai(o1==="<"?">":"≥",Math.abs(x-c),a)&&vrai(o2,Math.abs(x-c),b),nature:"couronne",type:"encadrement d'une distance",pieges:[[[pc(val(c-b),s2,val(c+b),s2)],"condition « au moins » oubliée",`Tu as gardé seulement « distance ${h(o2)} ${b} ». Il faut aussi que la distance dépasse ${a} : on enlève le milieu.`,1]],
      etapes:[{w:`La distance entre x et ${fx(nb(c))} doit être entre ${a} et ${b}.`,why:`${fx(A)} est la distance entre x et ${fx(nb(c))} : x n'est ni trop près, ni trop loin.`,pts:1},
        {w:`À droite de ${fx(nb(c))} : ${fx(`${nb(c+a)} ${h(o1)} x ${h(o2)} ${nb(c+b)}`)}. À gauche : ${fx(`${nb(c-b)} ${h(o2)} x ${h(o1)} ${nb(c-a)}`)}.`,why:`À droite, x vaut ${fx(nb(c))} plus la distance. À gauche, x vaut ${fx(nb(c))} moins la distance : l'ordre des bornes s'inverse.`,pts:1},
        {w:`<b>${fx(`S = ${un(P)}`)}</b>`,why:"Les solutions sont d'un côté ou de l'autre : une réunion de deux intervalles. Chaque crochet suit son inégalité, stricte ou large.",pts:1}]});}
  if(t<0.8){const k=R.ent(-9,9),d=R.ent(-5,5),f=R.choix(["=","=","≥","≤","<",">"]),arg=moins("x",d),lo=val(k+d),hi=val(k+d+1);
    const P=f==="="?[pc(lo,false,hi,true)]:f==="≥"?[pc(lo,false,null,true)]:f==="≤"?[pc(null,true,hi,true)]:f==="<"?[pc(null,true,lo,true)]:[pc(hi,false,null,true)];
    return inequation({sig:"VP"+[k,d,f],ineq:`E(${arg}) ${f} ${nb(k)}`,P,m:x=>{const e=Math.floor(x-d+1e-9);return f==="="?e===k:f==="≥"?e>=k:f==="≤"?e<=k:f==="<"?e<k:e>k;},nature:"partie entière",type:"partie entière",note:ENT,
      pieges:f==="="?[[[pc(lo,false,hi,false)],"borne droite gardée à tort",`${fx(hi.t)} n'est pas solution : pour lui, la partie entière vaut déjà ${fx(nb(k+1))}. Le crochet de droite est ouvert.`,1]]:[],
      etapes:[{w:f==="="?`${fx(`E(${arg}) = ${nb(k)}`)} veut dire ${fx(`${nb(k)} ≤ ${arg} &lt; ${nb(k+1)}`)}.`:f==="≥"?`${fx(`E(${arg}) ≥ ${nb(k)}`)} veut dire ${fx(`${arg} ≥ ${nb(k)}`)}.`:f==="≤"?`${fx(`E(${arg}) ≤ ${nb(k)}`)} veut dire ${fx(`${arg} &lt; ${nb(k+1)}`)}.`:f==="<"?`${fx(`E(${arg}) &lt; ${nb(k)}`)} veut dire ${fx(`${arg} &lt; ${nb(k)}`)}.`:`${fx(`E(${arg}) &gt; ${nb(k)}`)} veut dire ${fx(`${arg} ≥ ${nb(k+1)}`)}.`,
        why:`La partie entière d'un nombre est l'entier juste en dessous de lui, ou lui-même s'il est entier. Elle vaut ${fx(nb(k))} pour tous les nombres de ${fx(`[${nb(k)} ; ${nb(k+1)}[`)}.`,pts:1.5},
        {w:`<b>${fx(`S = ${ensT(P)}`)}</b>`,why:d?`On ${d>0?"ajoute":"retire"} ${Math.abs(d)} pour revenir à x.`:"L'ensemble se lit directement.",pts:1.5}]});}
  const a=R.ent(-9,9),r=R.ent(0,6),cas=R.ent(0,3),A=absT(a),V=val(a),ineq=[`${A} < −${r+1}`,`${A} ≥ −${r+1}`,`${A} ≤ 0`,`${A} > 0`][cas],P=[[],[pc(null,true,null,true)],[pc(V,false,V,false)],[pc(null,true,V,true),pc(V,true,null,true)]][cas];
  return inequation({sig:"VZ"+[a,r,cas],ineq,P,m:x=>[false,true,Math.abs(x-a)<1e-9,Math.abs(x-a)>1e-9][cas],nature:"cas limite",type:"valeur absolue comparée à un nombre négatif ou nul",
    etapes:[{w:`Une valeur absolue est toujours positive ou nulle.`,why:`${fx(A)} est une distance : elle vaut 0 seulement quand x vaut ${fx(V.t)}, et elle est strictement positive sinon.`,pts:1.5},
      {w:`<b>${fx(`S = ${ensT(P)}`)}</b>`,why:["Une distance n'est jamais strictement plus petite qu'un nombre négatif : aucune solution.","Une distance est toujours plus grande qu'un nombre négatif : tous les réels sont solutions.",`Une distance est inférieure ou égale à 0 seulement quand elle vaut 0 : la seule solution est ${fx(V.t)}. On peut aussi écrire ${fx(`[${V.t} ; ${V.t}]`)}.`,`Une distance est strictement positive sauf quand elle vaut 0 : tous les réels sont solutions, sauf ${fx(V.t)}.`][cas],pts:1.5}]});}

/* ---------- AN7 : nier une phrase à quantificateurs ---------- */
const SYMQ=[["∀","∀"],["∃","∃"],["et"," et "],["ou"," ou "],["⇒"," ⇒ "],["<","<"],[">",">"],["≤","≤"],["≥","≥"],["≠","≠"],["|","|"],["ε","ε"],["η","η"],["uₙ","uₙ"],["uₙ₊₁","uₙ₊₁"],["f(x)","f(x)"],["f(y)","f(y)"]];
const CONTRAIRE={"<":"≥","≤":">",">":"≤","≥":"<","=":"≠","≠":"="},CMP={"<":(a,b)=>a<b,"≤":(a,b)=>a<=b,">":(a,b)=>a>b,"≥":(a,b)=>a>=b,"=":(a,b)=>a===b,"≠":(a,b)=>a!==b};
/* une inégalité « g op d » : ce qu'on affiche, et sa valeur pour des valeurs données aux lettres */
const atome=(g,op,d,G,D)=>({t:`${g} ${op} ${d}`,non:`${g} ${CONTRAIRE[op]} ${d}`,f:e=>CMP[op](G(e),D(e))});
const quantQ=x=>{const t=propre(x).toLowerCase().replace(/ /g,"");return /^(∀|pourtout|quelquesoit|qqs)$/.test(t)?"∀":/^(∃|ilexiste)$/.test(t)?"∃":null;};
/* la fin tapée : une inégalité, ou deux reliées par et, ou, ⇒ ; rend sa valeur pour chaque essai, ou null */
function finPhrase(src,essais){let s=String(src||"").replace(/\bet\b|∧|&&?/gi,"∧").replace(/\bou\b|∨/gi,"∨").replace(/=>|⟹|→|->|\bimplique\b|\bdonc\b|\balors\b/gi,"⇒").replace(/uₙ₊₁|u_?\{?\(?n\s*\+\s*1\)?\}?/g,"w").replace(/uₙ|u_n|\bun\b/g,"u").replace(/f\s*\(\s*x\s*\)/g,"p").replace(/f\s*\(\s*y\s*\)/g,"q").replace(/N/g,"k");
  if(/\bnon\b|¬/i.test(s))return "non";
  const lien=s.includes("⇒")?"⇒":s.includes("∨")?"∨":s.includes("∧")?"∧":"",A=lien?s.split(lien):[s];if(lien==="⇒"&&A.length!==2)return null;
  const out=[];for(const e of essais){const V=A.map(a=>O.predicat(a,e));if(V.some(v=>v===null))return null;out.push(lien==="⇒"?!V[0]||V[1]:lien==="∨"?V.some(Boolean):V.every(Boolean));}
  return out;}
function negation(o){ /* o : {sig, blocs:[["∀","ε > 0"],…], P (atome ou null), Q (atome), vars:{lettre:[valeurs]}, fr (phrase en français, ou rien), nature} */
  const noms=Object.keys(o.vars);let essais=[{}];noms.forEach(k=>{const N=[];essais.forEach(e=>o.vars[k].forEach(v=>N.push(Object.assign({},e,{[k]:v}))));essais=N;});
  const inv=q=>q==="∀"?"∃":"∀",phrase=o.blocs.map(b=>`${b[0]}${b[1]}`).join(", ")+", "+(o.P?`${o.P.t} ⇒ ${o.Q.t}`:o.Q.t),finT=o.P?`${o.P.t} et ${o.Q.non}`:o.Q.non,neg=o.blocs.map(b=>`${inv(b[0])}${b[1]}`).join(", ")+", "+finT;
  const vrai=e=>o.P?o.P.f(e)&&!o.Q.f(e):!o.Q.f(e),attendu=essais.map(vrai),ids=o.blocs.map((_,i)=>"q"+i);
  const E=[{w:`On échange chaque ∀ et chaque ∃ : ${O.f(h(o.blocs.map(b=>`${inv(b[0])}${b[1]}`).join(", ")))}.`,why:`Nier « pour tout…, on a… », c'est dire « il existe… pour lequel on n'a pas… », et inversement. La condition écrite juste après la lettre, comme ${fx(h(o.blocs[0][1].trim()))}, ne change pas : elle dit seulement où on prend la lettre.`,pts:1},
    {w:o.P?`On nie la fin : ${fx(h(`${o.P.t} ⇒ ${o.Q.t}`))} devient ${fx(h(finT))}.`:`On nie la fin : ${fx(h(o.Q.t))} devient ${fx(h(o.Q.non))}.`,why:o.P?`Le contraire de « si A alors B », c'est « A est vrai et pourtant B est faux » : A et non B. La première partie reste telle quelle. Puis le contraire de ${fx(h(o.Q.t))} est ${fx(h(o.Q.non))}.`:o.whyFin||`Le contraire d'une inégalité large est une inégalité stricte dans l'autre sens, et inversement. Le contraire de = est ≠.`,pts:1},
    {w:`<b>${O.f(h(neg))}</b>`,why:`On ne touche ni aux lettres, ni à leur ordre : seuls les quantificateurs et la fin changent.`,pts:1}];
  function juge(rep){const Qs=ids.map(i=>quantQ(rep[i]));if(Qs.some(x=>!x))return {incomplet:"Dans chaque petite case, mets ∀ ou ∃ (les deux premiers boutons)."};
    if(!propre(rep.fin))return {incomplet:"Écris aussi la fin de la phrase dans la grande case."};
    const V=finPhrase(rep.fin,essais);if(V==="non")return {incomplet:"N'écris pas « non » : écris directement l'inégalité contraire, par exemple > à la place de ≤."};
    if(!V)return {incomplet:"Je n'arrive pas à lire la fin de la phrase. Écris une inégalité, ou deux inégalités reliées par « et », avec les mêmes lettres que dans l'énoncé."};
    const FQ=ids.filter((_,i)=>Qs[i]!==inv(o.blocs[i][0])),okF=V.every((v,i)=>v===attendu[i]);if(!FQ.length&&okF)return {ok:true};
    const comme=g=>essais.every((e,i)=>V[i]===g(e));let d;
    if(FQ.length)d={etape:0,type:"quantificateur non échangé",titre:"Où ça part : les quantificateurs.",msg:`Dans une négation, chaque ∀ devient ∃ et chaque ∃ devient ∀, sans exception. Ici : ${O.f(h(o.blocs.map(b=>`${inv(b[0])}${b[1]}`).join(", ")))}.`};
    else if(comme(e=>o.P?!o.P.f(e)||o.Q.f(e):o.Q.f(e)))d={etape:1,type:"fin de la phrase recopiée sans être niée",titre:"Où ça part : la fin de la phrase.",msg:`Tu as changé les quantificateurs, mais la fin est restée la même. Il faut la nier aussi : ${fx(h(finT))}.`};
    else if(o.P&&comme(e=>!o.P.f(e)||!o.Q.f(e)))d={etape:1,type:"négation d'une implication écrite comme une implication",titre:"Où ça part : la négation de « ⇒ ».",msg:`Le contraire de « A ⇒ B » n'est pas « A ⇒ non B ». C'est « A et non B » : ${fx(h(finT))}.`};
    else if(o.P&&comme(e=>!o.Q.f(e)))d={etape:1,type:"première partie de l'implication oubliée",titre:"Où ça part : la négation de « ⇒ ».",msg:`Il faut garder la première partie : « A et non B ». Ici : ${fx(h(finT))}.`};
    else if(o.P&&comme(e=>!o.P.f(e)&&!o.Q.f(e)))d={etape:1,type:"les deux parties de l'implication niées",titre:"Où ça part : la négation de « ⇒ ».",msg:`Seule la conclusion est niée, la première partie reste telle quelle : ${fx(h(finT))}.`};
    else d={etape:1,type:o.typeFin||"contraire d'une inégalité",titre:"Où ça part : la fin de la phrase.",msg:`Le contraire de ${fx(h(o.Q.t))} est ${fx(h(o.Q.non))}${o.whyFin?". "+o.whyFin:" : une inégalité large devient stricte, et inversement."}`};
    return {ok:false,faux:FQ.concat(okF?[]:["fin"]),resume:`Pas tout à fait : ${FQ.length&&!okF?"les quantificateurs et la fin sont à revoir":FQ.length?(FQ.length>1?"des quantificateurs sont à revoir":"un quantificateur est à revoir"):"la fin de la phrase est à revoir"}.`,diag:d};}
  const bon={fin:finT.replace(/−/g,"-")},fausse={fin:(o.P?`${o.P.t} ⇒ ${o.Q.non}`:o.Q.t).replace(/−/g,"-")};ids.forEach((id,i)=>{bon[id]=inv(o.blocs[i][0]);fausse[id]=inv(o.blocs[i][0]);});
  return {sig:"NG"+o.sig,q:o.fr?`« ${o.fr} » s'écrit : ${O.f(h(phrase))}. Écris en symboles la phrase contraire, « ${o.frNon} ».`:`Écris la négation de la phrase : ${O.f(h(phrase))}.`,
    corps:`<p>Complète : dans chaque petite case, ∀ ou ∃ ; dans la grande case, la fin de la phrase.</p><p class="mq-row">${o.blocs.map((b,i)=>`<span class="en-case">${O.trou(ids[i])} $${h(b[1].trim())}$,</span>`).join(" ")}</p>`,
    corpsPapier:`<p>Sur ta feuille, écris la phrase contraire en entier, avec ses quantificateurs.</p>`,texte:`négation de : ${phrase}`,champs:[{k:"trous",ids},{k:"champ",id:"fin",nom:"fin de la phrase",label:"La fin de la phrase :",ex:"par exemple x > 2",sym:o.sym||SYMQ,aide:"Les boutons écrivent dans la case où tu es."}],juge,etapes:E,
    bonne:O.f(h(neg)),bonneTxt:neg,repBonne:bon,repFausse:fausse,nature:o.nature,ens:{essais,vrai,blocs:o.blocs,P:!!o.P}};}
function phraseQ(R,niveau){const c=R.ent(-9,9),C=nb(c),l=R.ent(-9,9),a=R.ent(-9,9),op=R.choix(["≤","≥","<",">"]),num=e=>c,U=[c-1,c-0.5,c,c+0.5,c+1],lu=moins("uₙ",l),lf=moins("f(x)",l),xa=moins("x",a),EPS=[0.5,1],UL=[l-1,l-0.5,l,l+0.5,l+1],XA=[a-1,a-0.5,a,a+0.5,a+1];
  if(niveau===1){const t=R.ent(0,4);
    if(t===0)return {sig:"1a"+c+op,blocs:[["∀","x ∈ ℝ"]],Q:atome("f(x)",op,C,e=>e.p,num),vars:{p:U},nature:"un"};
    if(t===1)return {sig:"1b"+c,blocs:[["∃","x ∈ ℝ"]],Q:atome("f(x)","=",C,e=>e.p,num),vars:{p:U},nature:"un"};
    if(t===2)return {sig:"1c"+c+op,blocs:[["∀","n ∈ ℕ"]],Q:atome("uₙ",op,C,e=>e.u,num),vars:{u:U},nature:"un"};
    if(t===3){const o2=R.choix(["≥","≤",">","<"]);return {sig:"1d"+o2,blocs:[["∀","n ∈ ℕ"]],Q:atome("uₙ₊₁",o2,"uₙ",e=>e.w,e=>e.u),vars:{u:[0,1,2],w:[0,1,2]},nature:"un"};}
    return {sig:"1e"+c+op,blocs:[["∃","x ∈ ℝ"]],Q:atome("f(x)",op,C,e=>e.p,num),vars:{p:U},nature:"un"};}
  if(niveau===2){const t=R.ent(0,6);
    if(t===0)return {sig:"2a"+op,blocs:[["∃","M ∈ ℝ"],["∀","n ∈ ℕ"]],Q:atome("uₙ",op,"M",e=>e.u,e=>e.m),vars:{u:[0,1,2],m:[0,1,2]},nature:"deux"};
    if(t===1)return {sig:"2b"+op,blocs:[["∀","A ∈ ℝ"],["∃","n ∈ ℕ"]],Q:atome("uₙ",op,"A",e=>e.u,e=>e.a),vars:{u:[0,1,2],a:[0,1,2]},nature:"deux"};
    if(t===2)return {sig:"2c"+op,blocs:[["∀","x ∈ ℝ"],["∃","y ∈ ℝ"]],Q:atome("y",op,"x",e=>e.y,e=>e.x),vars:{x:[0,1,2],y:[0,1,2]},nature:"deux"};
    if(t===3)return {sig:"2d"+c,blocs:[["∀","x ∈ ℝ"],["∃","y ∈ ℝ"]],Q:atome("x + y","=",C,e=>e.x+e.y,num),vars:{x:[0,1,c],y:[0,c-1,c]},nature:"deux"};
    if(t===4)return {sig:"2e"+op,blocs:[["∃","m ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("f(x)",op,"m",e=>e.p,e=>e.m),vars:{p:[0,1,2],m:[0,1,2]},nature:"deux"};
    if(t===6)return {sig:"2g"+c+op,blocs:[["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome("uₙ",op,C,e=>e.u,num),vars:{u:U},nature:"deux"};
    const o1=R.choix(["<","≤"]),o2=R.choix(["<","≤",">","≥"]);return {sig:"2f"+o1+o2,blocs:[["∀","x ∈ ℝ"],["∀","y ∈ ℝ"]],P:atome("x",o1,"y",e=>e.x,e=>e.y),Q:atome("f(x)",o2,"f(y)",e=>e.p,e=>e.q),vars:{x:[0,1],y:[0,1],p:[0,1],q:[0,1]},nature:"deux, ⇒"};}
  const t=R.ent(0,5),oe=R.choix(["≤","<"]);
  if(t===0)return {sig:"3a"+l+oe,blocs:[["∀","ε > 0"],["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome(`|${lu}|`,oe,"ε",e=>Math.abs(e.u-l),e=>e["ε"]),vars:{u:UL,"ε":EPS},nature:"trois"};
  if(t===1)return {sig:"3b"+l+oe,blocs:[["∀","ε > 0"],["∃","N ∈ ℕ"],["∀","n ∈ ℕ"]],P:atome("n","≥","N",e=>e.n,e=>e.k),Q:atome(`|${lu}|`,oe,"ε",e=>Math.abs(e.u-l),e=>e["ε"]),vars:{u:UL,"ε":EPS,n:[1,2,3],k:[1,2,3]},nature:"trois, ⇒"};
  if(t===2)return {sig:"3c"+[a,l],blocs:[["∀","ε > 0"],["∃","η > 0"],["∀","x ∈ I"]],P:atome(`|${xa}|`,"<","η",e=>Math.abs(e.x-a),e=>e["η"]),Q:atome(`|${lf}|`,"<","ε",e=>Math.abs(e.p-l),e=>e["ε"]),vars:{x:XA,p:UL,"ε":EPS,"η":EPS},nature:"trois, ⇒"};
  if(t===3)return {sig:"3d"+a,blocs:[["∀","A > 0"],["∃","η > 0"],["∀","x ∈ I"]],P:atome(`|${xa}|`,"<","η",e=>Math.abs(e.x-a),e=>e["η"]),Q:atome("f(x)",">","A",e=>e.p,e=>e.a),vars:{x:XA,p:[0,1,2],a:[1,2],"η":EPS},nature:"trois, ⇒"};
  if(t===4)return {sig:"3e"+op,blocs:[["∀","A ∈ ℝ"],["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome("uₙ",op,"A",e=>e.u,e=>e.a),vars:{u:[0,1,2],a:[0,1,2]},nature:"trois"};
  return {sig:"3f"+l,blocs:[["∀","ε > 0"],["∃","α > 0"],["∀","x ∈ I"]],P:atome("x",">","α",e=>e.x,e=>e["α"]),Q:atome(`|${lf}|`,"<","ε",e=>Math.abs(e.p-l),e=>e["ε"]),vars:{x:[1,2,3],"α":[1,2,3],p:UL,"ε":EPS},nature:"trois, ⇒"};}
/* une phrase en français, sa traduction, puis la phrase contraire */
function phraseFr(R){const l=R.ent(-9,9),lu=moins("uₙ",l),lf=moins("f(x)",l),UL=[l-1,l-0.5,l,l+0.5,l+1],EPS=[0.5,1],T=[
  {fr:"la suite (uₙ) est majorée",non:"la suite (uₙ) n'est pas majorée",blocs:[["∃","M ∈ ℝ"],["∀","n ∈ ℕ"]],Q:atome("uₙ","≤","M",e=>e.u,e=>e.m),vars:{u:[0,1,2],m:[0,1,2]}},
  {fr:"la suite (uₙ) est minorée",non:"la suite (uₙ) n'est pas minorée",blocs:[["∃","m ∈ ℝ"],["∀","n ∈ ℕ"]],Q:atome("uₙ","≥","m",e=>e.u,e=>e.m),vars:{u:[0,1,2],m:[0,1,2]}},
  {fr:"la suite (uₙ) est croissante",non:"la suite (uₙ) n'est pas croissante",blocs:[["∀","n ∈ ℕ"]],Q:atome("uₙ₊₁","≥","uₙ",e=>e.w,e=>e.u),vars:{u:[0,1,2],w:[0,1,2]}},
  {fr:"la suite (uₙ) est décroissante",non:"la suite (uₙ) n'est pas décroissante",blocs:[["∀","n ∈ ℕ"]],Q:atome("uₙ₊₁","≤","uₙ",e=>e.w,e=>e.u),vars:{u:[0,1,2],w:[0,1,2]}},
  {fr:"la suite (uₙ) est bornée",non:"la suite (uₙ) n'est pas bornée",blocs:[["∃","M ∈ ℝ"],["∀","n ∈ ℕ"]],Q:atome("|uₙ|","≤","M",e=>Math.abs(e.u),e=>e.m),vars:{u:[-2,-1,0,1,2],m:[0,1,2]}},
  {fr:"la suite (uₙ) tend vers +∞",non:"la suite (uₙ) ne tend pas vers +∞",blocs:[["∀","A ∈ ℝ"],["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome("uₙ","≥","A",e=>e.u,e=>e.a),vars:{u:[0,1,2],a:[0,1,2]}},
  {fr:`la suite (uₙ) converge vers ${nb(l)}`,non:`la suite (uₙ) ne converge pas vers ${nb(l)}`,blocs:[["∀","ε > 0"],["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome(`|${lu}|`,"≤","ε",e=>Math.abs(e.u-l),e=>e["ε"]),vars:{u:UL,"ε":EPS},v:l},
  {fr:"la fonction f est majorée sur ℝ",non:"la fonction f n'est pas majorée sur ℝ",blocs:[["∃","M ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("f(x)","≤","M",e=>e.p,e=>e.m),vars:{p:[0,1,2],m:[0,1,2]}},
  {fr:"la fonction f est croissante sur ℝ",non:"la fonction f n'est pas croissante sur ℝ",blocs:[["∀","x ∈ ℝ"],["∀","y ∈ ℝ"]],P:atome("x","≤","y",e=>e.x,e=>e.y),Q:atome("f(x)","≤","f(y)",e=>e.p,e=>e.q),vars:{x:[0,1],y:[0,1],p:[0,1],q:[0,1]}},
  {fr:`la fonction f s'annule sur ℝ`,non:"la fonction f ne s'annule pas sur ℝ",blocs:[["∃","x ∈ ℝ"]],Q:atome("f(x)","=","0",e=>e.p,()=>0),vars:{p:[-1,0,1]}},
  {fr:"la fonction f est minorée sur ℝ",non:"la fonction f n'est pas minorée sur ℝ",blocs:[["∃","m ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("f(x)","≥","m",e=>e.p,e=>e.m),vars:{p:[0,1,2],m:[0,1,2]}},
  {fr:"la fonction f est bornée sur ℝ",non:"la fonction f n'est pas bornée sur ℝ",blocs:[["∃","M ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("|f(x)|","≤","M",e=>Math.abs(e.p),e=>e.m),vars:{p:[-2,-1,0,1,2],m:[0,1,2]}},
  {fr:"la fonction f est décroissante sur ℝ",non:"la fonction f n'est pas décroissante sur ℝ",blocs:[["∀","x ∈ ℝ"],["∀","y ∈ ℝ"]],P:atome("x","≤","y",e=>e.x,e=>e.y),Q:atome("f(x)","≥","f(y)",e=>e.p,e=>e.q),vars:{x:[0,1],y:[0,1],p:[0,1],q:[0,1]}},
  {fr:`la fonction f, définie sur I, tend vers ${nb(l)} en +∞`,non:`la fonction f ne tend pas vers ${nb(l)} en +∞`,blocs:[["∀","ε > 0"],["∃","α > 0"],["∀","x ∈ I"]],P:atome("x",">","α",e=>e.x,e=>e["α"]),Q:atome(`|${lf}|`,"<","ε",e=>Math.abs(e.p-l),e=>e["ε"]),vars:{x:[1,2,3],"α":[1,2,3],p:UL,"ε":EPS},v:l},
  {fr:"la suite (uₙ) tend vers −∞",non:"la suite (uₙ) ne tend pas vers −∞",blocs:[["∀","A ∈ ℝ"],["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome("uₙ","≤","A",e=>e.u,e=>e.a),vars:{u:[0,1,2],a:[0,1,2]}},
  {fr:"la suite (uₙ) est positive à partir d'un certain rang",non:"la suite (uₙ) n'est pas positive à partir d'un certain rang",blocs:[["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome("uₙ","≥","0",e=>e.u,()=>0),vars:{u:[-1,0,1]}},
  {fr:"la suite (uₙ) est stationnaire (constante à partir d'un certain rang)",non:"la suite (uₙ) n'est pas stationnaire",blocs:[["∃","N ∈ ℕ"],["∀","n ≥ N"]],Q:atome("uₙ₊₁","=","uₙ",e=>e.w,e=>e.u),vars:{u:[0,1,2],w:[0,1,2]}}],i=R.ent(0,T.length-1),o=T[i];
  return Object.assign({sig:"FR"+i+(o.v===undefined?"":","+o.v),frNon:o.non,nature:"français"},o);}

/* ---------- les questions « Connaissance du cours » des CC1 2024 et 2025 : sur papier, puis cochées ligne par ligne ---------- */
const papierQ=(sig,q,corps,L,ens,nature)=>({sig,q,corps,texte:(q+" "+corps).replace(/<[^>]+>/g," ").replace(/\$/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/\s+/g," ").trim(),champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
  etapes:L.map(x=>({w:x[0],why:x[1],pts:x[2]})),bonne:"voir la correction",bonneTxt:"à écrire de mémoire (voir la correction)",repBonne:{},nature,ens});
function coursSup(R){const a=R.ent(-9,6),b=a+R.ent(1,6),ferme=R()<0.4,I=`${ferme?"[":"]"}${nb(a)} ; ${nb(b)}[`,un=`${nb(b)} − 1/n`;
  return papierQ("QS"+I,"Connaissance du cours, comme au CC1 2025 (2 points).",`<ol type="a"><li>Soit A une partie non vide et majorée de ℝ. Donne une caractérisation de la borne supérieure de A.</li><li>Montre que ${fx(nb(b))} est la borne supérieure de ${fx(I)}.</li></ol>`,[
    [`a) m est la borne supérieure de A si et seulement si m est un majorant de A et ${O.f("∀ε &gt; 0, ∃a ∈ A, m − ε &lt; a")}.`,"C'est la réponse du corrigé officiel. Il précise : ne pas confondre cette caractérisation avec la définition (« le plus petit des majorants de A »), qui n'était pas ce qu'on demandait.",1],
    [`b) Pour tout x de ${fx(I)}, ${fx(`x &lt; ${nb(b)}`)} : ${fx(nb(b))} est un majorant de ${fx(I)}.`,"La première moitié de la caractérisation : être un majorant.",0.5],
    [`La suite ${fx(`uₙ = ${un}`)}, pour ${fx(`n ≥ ${b-1===a&&!ferme?2:1}`)}, est une suite d'éléments de ${fx(I)} qui converge vers ${fx(nb(b))}. Donc ${fx(nb(b))} est la borne supérieure de ${fx(I)}.`,`Le corrigé officiel utilise l'autre caractérisation du cours : m est un majorant de A et il existe une suite d'éléments de A qui converge vers m.${b-1===a&&!ferme?` Il faut ${fx("n ≥ 2")} : pour n = 1, le terme vaut ${fx(nb(b-1))}, qui n'est pas dans l'intervalle.`:""} Avec la caractérisation du a), on écrirait : soit ${fx("ε &gt; 0")}, le nombre ${fx(`max(${nb(Q(2*b-1,2))}, ${nb(b)} − ε/2)`)} est dans l'intervalle et il est strictement plus grand que ${fx(`${nb(b)} − ε`)}.`,0.5]],
    {type:"cours",u:n=>b-1/n,dans:x=>(ferme?x>=a:x>a)&&x<b,cible:b},"borne sup");}
function coursAdh(R){const a=R.ent(-9,6),b=a+R.ent(1,6),droite=R()<0.6,I=droite?`[${nb(a)} ; ${nb(b)}[`:`]${nb(a)} ; ${nb(b)}]`,c=droite?b:a,un=droite?`${nb(b)} − 1/n`:`${nb(a)} + 1/n`;
  return papierQ("QA"+I,"Connaissance du cours, comme au CC1 2024 (2 points).",`<ol type="a"><li>Soit A une partie de ℝ. Donne la définition de « x est adhérent à A ».</li><li>Montre que ${fx(nb(c))} est adhérent à ${fx(I)}.</li></ol>`,[
    [`a) x est adhérent à A si : ${O.f("∀ε &gt; 0, ∃a ∈ A, |x − a| &lt; ε")}.`,"C'est la réponse du corrigé officiel : A contient des points aussi proches de x qu'on veut. x lui-même n'a pas besoin d'être dans A.",1],
    [`b) La suite ${fx(`uₙ = ${un}`)}, pour ${fx("n ≥ 2")}, a pour limite ${fx(nb(c))}, et tous ses termes sont dans ${fx(I)}.`,`Le corrigé officiel utilise la propriété du cours : x est adhérent à A si et seulement s'il existe une suite d'éléments de A qui converge vers x.`,0.5],
    [`Donc ${fx(nb(c))} est adhérent à ${fx(I)}.`,`La conclusion doit être écrite. Avec la définition du a), on écrirait : soit ${fx("ε &gt; 0")}, le nombre ${fx(droite?`max(${nb(Q(2*b-1,2))}, ${nb(b)} − ε/2)`:`min(${nb(Q(2*a+1,2))}, ${nb(a)} + ε/2)`)} est dans l'intervalle, à une distance de ${fx(nb(c))} plus petite que ε.`,0.5]],
    {type:"cours",u:n=>droite?b-1/n:a+1/n,dans:x=>droite?(x>=a&&x<b):(x>a&&x<=b),cible:c},"adhérent");}

/* ---------- CC2 : programme supposé (continuité, dérivabilité), d'après le programme du chapitre 1 ; le chapitre 4 n'est pas encore sur Moodle ---------- */
const PUX=["","x","x²","x³","x⁴","x⁵"];
function polyX(c){let s="";for(let i=c.length-1;i>=0;i--){const x=q(c[i]);if(!x.n)continue;const a=Q(Math.abs(x.n),x.d),t=a.d>1?(i?"("+nb(a)+")":nb(a)):String(a.n);s+=sgn(s,x.n)+(i&&t==="1"?"":t)+PUX[i];}return s||"0";}
const puQ=(x,k)=>{let r=Q(1);for(let i=0;i<k;i++)r=mul(r,x);return r;};
const evQ=(c,x)=>c.reduce((s,a,i)=>add(s,mul(a,puQ(q(x),i))),Q(0));
const evN=(c,x)=>c.reduce((s,a,i)=>s+q(a).n/q(a).d*Math.pow(x,i),0);
const derP=c=>c.slice(1).map((a,i)=>mul(a,i+1));
const casesDe=(rep,id)=>rep[id]||{};
const numLu=s=>{if(s==null||!propre(s))return null;const v=O.calcule(String(s).replace(/^[^=]*=/,""),{});return v===null||!Number.isFinite(v)?null:v;};
const qLu=s=>s==null?null:nombre(String(s).replace(/^[^=]*=/,""));
const X0=x=>fx(nb(x));
const sur=(L,M)=>`${fx(`f(x) = ${L}`)} si ${fx(`x ≤ ${M}`)}, et `;

/* AN9 palier 1 : prolonger par continuité */
function prolong(R){const t=R();let o;
  if(t<0.32){const r=R.nz(-8,8);let s;do s=R.ent(-8,8);while(s===r);const c=[r*s,-(r+s),1],N=polyX(c),D=moins("x",r),S=moins("x",s);
    o={sig:"P1,"+[r,s],expr:`(${N})/(${D})`,x0:r,l:Q(r-s),f:x=>(x*x-(r+s)*x+r*s)/(x-r),
      E:[[`${fx(`${N} = (${D})(${S})`)}`,`En x = ${nb(r)}, le numérateur vaut 0 : ${fx(D)} est donc en facteur. On vérifie en développant ${fx(`(${D})(${S})`)}.`,1],
        [`Pour ${fx(`x ≠ ${nb(r)}`)} : ${fx(`f(x) = ${S}`)}.`,`On simplifie par ${fx(D)}, qui n'est pas nul quand ${fx(`x ≠ ${nb(r)}`)}.`,1]],lim:`${fx(S)} tend vers ${fx(`${nb(r)} − ${par(s)} = ${nb(r-s)}`)}`};}
  else if(t<0.5){const r=R.nz(-4,4),c3=r*r*r,N=`x³ ${c3>0?"−":"+"} ${Math.abs(c3)}`,D=moins("x",r),K=polyX([r*r,r,1]);
    o={sig:"P2,"+r,expr:`(${N})/(${D})`,x0:r,l:Q(3*r*r),f:x=>(x*x*x-c3)/(x-r),
      E:[[`${fx(`${N} = (${D})(${K})`)}`,`C'est ${fx("a³ − b³ = (a − b)(a² + ab + b²)")}, avec a = x et b = ${nb(r)}, car ${fx(`${par(r)}³ = ${nb(c3)}`)}.`,1],
        [`Pour ${fx(`x ≠ ${nb(r)}`)} : ${fx(`f(x) = ${K}`)}.`,`On simplifie par ${fx(D)}, qui n'est pas nul quand ${fx(`x ≠ ${nb(r)}`)}.`,1]],lim:`${fx(K)} tend vers ${fx(`${par(r)}² + ${par(r)} × ${par(r)} + ${par(r)}² = ${3*r*r}`)}`};}
  else if(t<0.66){const k=R.ent(1,9),k2=k*k;
    o={sig:"P3,"+k,dom:`x ≥ −${k2}`,expr:`(√(x + ${k2}) − ${k})/x`,x0:0,l:Q(1,2*k),f:x=>(Math.sqrt(x+k2)-k)/x,
      E:[[`${fx(`f(x) = ((x + ${k2}) − ${k2})/(x(√(x + ${k2}) + ${k}))`)}`,`On multiplie en haut et en bas par la quantité conjuguée ${fx(`√(x + ${k2}) + ${k}`)}, qui n'est jamais nulle : en haut, ${fx("(a − b)(a + b) = a² − b²")}.`,1],
        [`Pour ${fx("x ≠ 0")} : ${fx(`f(x) = 1/(√(x + ${k2}) + ${k})`)}.`,`En haut, il reste x, et on simplifie par x, qui n'est pas nul.`,1]],lim:`${fx(`√(x + ${k2}) + ${k}`)} tend vers ${fx(`√${k2} + ${k} = ${2*k}`)}`};}
  else if(t<0.8){const k=R.ent(2,12);
    o={sig:"P4,"+k,expr:`sin(${k}x)/x`,x0:0,l:Q(k),f:x=>Math.sin(k*x)/x,
      E:[[`Pour ${fx("x ≠ 0")} : ${fx(`f(x) = ${k} × sin(${k}x)/(${k}x)`)}.`,`On fait apparaître ${fx("sin(u)/u")} avec ${fx(`u = ${k}x`)} : on multiplie et on divise par ${k}.`,1],
        [`Quand x tend vers 0, ${fx(`u = ${k}x`)} tend vers 0, et ${fx("sin(u)/u")} tend vers 1.`,`C'est la limite de référence ${fx("lim_{u→0} sin(u)/u = 1")} (le nombre dérivé de sin en 0), composée avec ${fx(`u = ${k}x`)}.`,1]],lim:`${fx(`${k} × sin(${k}x)/(${k}x)`)} tend vers ${fx(`${k} × 1 = ${k}`)}`};}
  else{const r=R.nz(-6,6);let c,d;do{c=[R.ent(-9,9),R.ent(-6,6),1];d=evN(c,r);}while(!d||Math.abs(d)>40);const N=polyX(c),D=moins("x",r);
    o={sig:"P5,"+[r,c],expr:`(${N})/(${D})`,x0:r,l:null,f:x=>evN(c,x)/(x-r),
      E:[[`En ${fx(`x = ${nb(r)}`)}, le numérateur vaut ${fx(nb(d))}, pas 0.`,`${fx(`${par(r)}² ${c[1]?(c[1]>0?"+ ":"− ")+(Math.abs(c[1])===1?"":Math.abs(c[1])+" × ")+par(r)+" ":""}${c[0]?(c[0]>0?"+ ":"− ")+Math.abs(c[0]):""} = ${nb(d)}`)}. On ne peut donc pas simplifier par ${fx(D)}.`,1],
        [`Le dénominateur tend vers 0 et le numérateur vers ${fx(nb(d))} : ${fx("|f(x)|")} tend vers +∞.`,`Un nombre non nul divisé par un nombre de plus en plus petit devient aussi grand qu'on veut.`,1]],lim:null};}
  const pro=!!o.l,X=nb(o.x0),L=pro?nb(o.l):"";
  const E=o.E.concat([pro?[`<b>${fx(`lim_{x→${X}} f(x) = ${L}`)}</b> : on prolonge f par continuité en posant ${fx(`f(${X}) = ${L}`)}.`,`Quand x tend vers ${X}, ${o.lim}. Une limite finie en ${X} : f se prolonge par continuité, et le prolongement prend cette valeur.`,1]
    :[`<b>f ne se prolonge pas par continuité en ${X}</b>.`,`Pour prolonger f par continuité, il faut une limite finie en ${X}. Ici il n'y en a pas : les valeurs de f s'en vont vers l'infini.`,1]]);
  const juge=rep=>{if(!rep.pro)return {incomplet:"Dis si f se prolonge par continuité."};
    if(rep.pro==="oui"){const v=numLu(casesDe(rep,"c")["ℓ"]);if(v===null)return {incomplet:"Écris la valeur du prolongement : un nombre, par exemple 3 ou 1/4."};
      if(pro&&Math.abs(v-o.l.n/o.l.d)<1e-9)return {ok:true};
      if(!pro)return {ok:false,faux:["pro"],resume:"Pas tout à fait : f ne se prolonge pas par continuité.",diag:{etape:0,type:"prolongement sans limite finie",titre:"Où ça part : le numérateur.",msg:`En ${fx(`x = ${X}`)}, le numérateur ne s'annule pas : f n'a pas de limite finie en ${X}.`}};
      return {ok:false,faux:["ℓ"],resume:"Pas tout à fait : la valeur du prolongement est à revoir.",diag:{etape:E.length-1,type:"calcul de la limite en un point",titre:"Où ça part : la limite.",msg:`Quand x tend vers ${X}, ${o.lim}.`}};}
    if(!pro)return {ok:true};
    return {ok:false,faux:["pro"],resume:"Pas tout à fait : f se prolonge par continuité.",diag:{etape:0,type:"forme 0/0 non levée",titre:"Où ça part : la forme 0/0.",msg:`En ${X}, le haut et le bas tendent vers 0 : c'est une forme indéterminée, qu'on lève en simplifiant. ${o.E[0][0]}.`}};};
  return {sig:"PR"+o.sig,q:`Soit f la fonction définie pour ${o.dom?fx(o.dom)+" et ":""}${fx(`x ≠ ${X}`)} par ${fx(`f(x) = ${o.expr}`)}. Peut-on prolonger f par continuité en ${X} ? Si oui, quelle valeur faut-il donner à ${fx(`f(${X})`)} ?`,corps:"",
    texte:`f(x) = ${o.expr} pour x ≠ ${X} : se prolonge-t-elle par continuité en ${X}, et avec quelle valeur ?`,
    champs:[{k:"choix",id:"pro",o:[["oui",`Oui, f se prolonge par continuité en ${X}`],["non","Non"]]},{k:"cases",id:"c",noms:["ℓ"],sym:["√("],aide:"ℓ est la valeur à donner à f("+X+"). Si f ne se prolonge pas, laisse la case vide."}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:pro?`oui, avec ${fx(`f(${X}) = ${L}`)}`:"non : pas de limite finie",bonneTxt:pro?`oui, f(${X}) = ${L}`:"non",repBonne:pro?{pro:"oui",c:{"ℓ":brut(o.l)}}:{pro:"non"},repFausse:pro?{pro:"non"}:{pro:"oui",c:{"ℓ":"0"}},
    nature:pro?"prolongeable":"pas prolongeable",ens:{type:"prolong",f:o.f,x0:o.x0,l:pro?o.l.n/o.l.d:null}};}


/* AN9 palier 2 : une fonction définie par morceaux, le paramètre qui la rend continue */
const linA=(A,B,v)=>polyX([B,A]).replace(/x/g,v||"a");
function morceaux(R){const x0=R.nz(-3,3),X=nb(x0),t=R();let G,D,A1,B1,A2,B2,f;
  if(t<0.7){const Lc=[R.ent(-9,9),R.ent(-5,5),R.nz(-3,3)];G=polyX(Lc);A1=Q(0);B1=evQ(Lc,x0);
    if(t<0.35){const b=R.ent(-9,9);D=polyX([b,1]).replace("x","ax");A2=Q(x0);B2=Q(b);f=(x,a)=>x<=x0?evN(Lc,x):a*x+b;}
    else{const m=R.nz(-5,5);D=polyX([0,m])+" + a";A2=Q(1);B2=Q(m*x0);f=(x,a)=>x<=x0?evN(Lc,x):m*x+a;}}
  else{const be=R.ent(-5,5),ga=R.ent(-9,9),m=R.nz(-5,5),p=R.ent(-9,9),r=polyX([ga,be]);G="ax²"+(r==="0"?"":r[0]==="−"?" − "+r.slice(1):" + "+r);D=polyX([p,m]);
    A1=Q(x0*x0);B1=Q(be*x0+ga);A2=Q(0);B2=Q(m*x0+p);f=(x,a)=>x<=x0?a*x*x+be*x+ga:m*x+p;}
  const a=div(sub(B2,B1),sub(A1,A2)),gT=linA(A1,B1),dT=linA(A2,B2),sg=sub(A1,A2).n<0?-1:1,eG=mul(sub(A1,A2),sg),eD=mul(sub(B2,B1),sg);
  const E=[[`Sur ${fx(`]−∞ ; ${X}[`)} et sur ${fx(`]${X} ; +∞[`)}, f est donnée par un polynôme : elle y est continue. Tout se joue en ${X}.`,`Une fonction polynôme est continue en tout point. Il reste à regarder le raccord des deux morceaux.`,0.5],
    [`À gauche : ${fx(`lim_{x→${X}⁻} f(x) = f(${X}) = ${gT}`)}.`,`Pour ${fx(`x ≤ ${X}`)}, ${fx(`f(x) = ${G}`)}, qui est continue : on remplace x par ${X}.`,1],
    [`À droite : ${fx(`lim_{x→${X}⁺} f(x) = ${dT}`)}.`,`Pour ${fx(`x &gt; ${X}`)}, ${fx(`f(x) = ${D}`)} : quand x tend vers ${X}, on remplace x par ${X}.`,1],
    [`f est continue en ${X} si et seulement si ${fx(`${gT} = ${dT}`)}, c'est-à-dire ${fx(`${linA(eG,0)} = ${nb(eD)}`)} : <b>${fx(`a = ${nb(a)}`)}</b>.`,`La limite à gauche, la limite à droite et ${fx(`f(${X})`)} doivent être égales. On regroupe les a d'un côté et les nombres de l'autre.`,1.5]];
  const juge=rep=>{const v=qLu(casesDe(rep,"c").a);if(!v)return {incomplet:"Écris la valeur de a : un nombre, par exemple 3, -2 ou 5/4."};if(egal(v,a))return {ok:true};
    return {ok:false,faux:["a"],resume:"Pas tout à fait : la valeur de a est à revoir.",diag:{etape:3,type:"raccord d'une fonction par morceaux",titre:"Où ça part : l'équation du raccord.",msg:`Les deux morceaux doivent donner la même valeur en ${X} : ${fx(`${gT} = ${dT}`)}, donc ${fx(`a = ${nb(a)}`)}.`}};};
  return {sig:"MO"+[x0,G,D],q:`Soit a un réel, et f la fonction définie sur ℝ par ${sur(G,X)}${fx(`f(x) = ${D}`)} si ${fx(`x &gt; ${X}`)}. Pour quelle valeur de a la fonction f est-elle continue sur ℝ ?`,corps:"",
    texte:`f(x) = ${G} si x ≤ ${X}, f(x) = ${D} si x > ${X} : la valeur de a qui rend f continue`,champs:[{k:"cases",id:"c",noms:["a"]}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:fx(`a = ${nb(a)}`),bonneTxt:`a = ${nb(a)}`,repBonne:{c:{a:brut(a)}},repFausse:{c:{a:brut(add(a,1))}},nature:t<0.35?"ax + b":t<0.7?"mx + a":"a à gauche",ens:{type:"morceaux",f,x0,a:a.n/a.d}};}

/* AN10 : le théorème des valeurs intermédiaires, x³ + px + k = 0 */
function tviF(R){for(;;){const p=R.ent(1,9),k=R.nz(-40,40),c=[k,p,0,1];let n=null,zero=false;for(let i=-6;i<6;i++){const u=evN(c,i),v=evN(c,i+1);if(!u||!v)zero=true;if(u<0&&v>0)n=i;}
  if(n===null||zero)continue;return {c,p,k,n,fn:evN(c,n),fn1:evN(c,n+1),eq:R()<0.5};}}
function etapesTVI(T,redac){const {c,p,k,n,fn,fn1}=T,F=polyX(c),val=i=>`${par(i)}³ + ${p===1?"":p+" × "}${par(i)} ${k>0?"+":"−"} ${Math.abs(k)}`;
  return [[`On pose ${fx(`f(x) = ${F}`)}. ${redac?"L'équation s'écrit f(x) = 0, et ":""}f est continue sur ℝ, car c'est un polynôme.`,`${T.eq?`On ramène tout du même côté : ${fx(`${polyX([0,p,0,1])} = ${nb(-k)}`)} devient ${fx("f(x) = 0")}. `:""}Le théorème des valeurs intermédiaires demande une fonction continue sur un intervalle.`,1],
    [`${fx(`f(${n}) = ${nb(fn)}`)}, qui est négatif, et ${fx(`f(${n+1}) = ${nb(fn1)}`)}, qui est positif.`,`On essaie des entiers jusqu'à trouver un changement de signe : ${fx(`f(${n}) = ${val(n)}`)} et ${fx(`f(${n+1}) = ${val(n+1)}`)}.`,1],
    [`f est continue sur ${fx(`[${n} ; ${n+1}]`)} et 0 est entre ${fx(`f(${n})`)} et ${fx(`f(${n+1})`)} : d'après le théorème des valeurs intermédiaires, il existe α dans ${fx(`]${n} ; ${n+1}[`)} tel que ${fx("f(α) = 0")}.`,`f passe d'une valeur négative à une valeur positive sans sauter : elle passe par 0 entre les deux. α n'est ni ${n} ni ${n+1}, car f ne s'y annule pas.`,1],
    [`f est strictement croissante sur ℝ, donc <b>α est la seule solution</b>, et ${fx(`${n} &lt; α &lt; ${n+1}`)}.`,`${fx("x ↦ x³")} et ${fx(`x ↦ ${polyX([k,p])}`)} sont strictement croissantes, donc leur somme aussi (ou : ${fx(`f′(x) = 3x² + ${p}`)} est strictement positif). Une fonction strictement croissante ne prend jamais deux fois la même valeur : elle ne passe qu'une fois par 0.`,1]];}
const eqTVI=T=>T.eq?`${polyX([0,T.p,0,1])} = ${nb(-T.k)}`:`${polyX(T.c)} = 0`;
function tvi(R){const T=tviF(R),{n}=T,E=etapesTVI(T,false),eq=eqTVI(T);
  const juge=rep=>{const v=qLu(casesDe(rep,"c").n);if(!v||v.d!==1)return {incomplet:"Écris l'entier n : par exemple 2 ou -3."};if(!rep.nb)return {incomplet:"Choisis aussi le nombre de solutions."};
    const okN=egal(v,Q(n)),okB=rep.nb==="un";if(okN&&okB)return {ok:true};const F=[];if(!okN)F.push("n");if(!okB)F.push("nb");
    const d=!okN?(egal(v,Q(n+1))?{etape:1,type:"borne du mauvais côté",titre:"Où ça part : l'entier demandé.",msg:`On demande n tel que ${fx("n &lt; α &lt; n + 1")} : c'est l'entier juste avant α. Ici ${fx(`f(${n}) &lt; 0 &lt; f(${n+1})`)}, donc n = ${n}.`}:{etape:1,type:"changement de signe",titre:"Où ça part : le changement de signe.",msg:`${fx(`f(${n}) = ${nb(T.fn)}`)} et ${fx(`f(${n+1}) = ${nb(T.fn1)}`)} : c'est entre ${n} et ${n+1} que f change de signe.`})
      :{etape:3,type:"unicité par la stricte monotonie",titre:"Où ça part : le nombre de solutions.",msg:"f est strictement croissante : elle ne passe qu'une fois par 0. Il y a exactement une solution."};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"n et le nombre de solutions sont à revoir":F[0]==="n"?"l'entier n est à revoir":"le nombre de solutions est à revoir"}.`,diag:d};};
  return {sig:"TV"+[T.c,T.eq],q:`On considère l'équation ${fx(eq)}, d'inconnue x réelle. Combien a-t-elle de solutions ? Donne l'entier n tel qu'une solution α vérifie ${fx("n &lt; α &lt; n + 1")}.`,corps:"",
    texte:`${eq} : nombre de solutions, et l'entier n tel que n < α < n + 1`,champs:[{k:"choix",id:"nb",o:[["un","Exactement une solution"],["plus","Au moins une, peut-être plusieurs"],["zero","Aucune solution"]]},{k:"cases",id:"c",noms:["n"]}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:`exactement une solution α, et ${fx(`${n} &lt; α &lt; ${n+1}`)}`,bonneTxt:`une seule solution, ${n} < α < ${n+1}`,repBonne:{nb:"un",c:{n:String(n)}},repFausse:{nb:"un",c:{n:String(n+1)}},nature:T.eq?"x³ + px = k":"f(x) = 0",ens:{type:"tvi",c:T.c,n}};}
function redacTVI(R){const T=tviF(R),E=etapesTVI(T,true),eq=eqTVI(T);
  return {sig:"RT"+[T.c,T.eq],q:`Montre que l'équation ${fx(eq)} admet une unique solution réelle α, puis trouve l'entier n tel que ${fx("n &lt; α &lt; n + 1")}.`,corps:"",
    texte:`${eq} : une unique solution α, et l'entier n tel que n < α < n + 1 (rédaction)`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:"voir la rédaction",bonneTxt:`une seule solution, ${T.n} < α < ${T.n+1}`,repBonne:{},nature:"papier",ens:{type:"tvi",c:T.c,n:T.n}};}

/* AN11 : image d'un segment par une fonction continue (polynôme du second ou du troisième degré) */
function imageSeg(R){const t=R();let c,a,d,crit;
  if(t<0.6){const s=R()<0.5?1:-1,h=R.ent(-4,4),k=R.ent(-9,9);c=[s*h*h+k,-2*s*h,s];a=R.ent(-6,3);d=a+R.ent(2,6);crit=[h];}
  else{const K=R.choix([1,2]),cst=R.ent(-9,9);c=[cst,-3*K*K,0,1];a=R.ent(-2*K-1,K);d=Math.min(a+R.ent(2,3*K+1),2*K+1);if(d-a<2)a=d-2;crit=[-K,K];}
  const fp=derP(c),dedans=crit.filter(x=>x>a&&x<d),P=[a,...dedans,d],V=P.map(x=>evN(c,x)),m=Math.min(...V),M=Math.max(...V),I=`[${nb(a)} ; ${nb(d)}]`,vb=[evN(c,a),evN(c,d)],mb=Math.min(...vb),Mb=Math.max(...vb);
  const z=crit.length>1?`${fx(nb(crit[0]))} et ${fx(nb(crit[1]))}`:fx(nb(crit[0]));
  const E=[[`f est continue sur le segment ${fx(I)} : elle y est bornée et atteint ses bornes. Donc ${fx(`f(${I}) = [m ; M]`)}, où m est le minimum de f sur ce segment et M son maximum.`,`C'est le théorème du cours : l'image d'un segment par une fonction continue est un segment. Il reste à trouver le plus petit et le plus grand des f(x).`,0.5],
    [`${fx(`f′(x) = ${polyX(fp)}`)}, qui s'annule en ${z}. ${dedans.length===crit.length?(crit.length>1?"Ces deux nombres sont":"Ce nombre est")+" à l'intérieur du segment.":dedans.length?`Seul ${fx(nb(dedans[0]))} est à l'intérieur du segment.`:(crit.length>1?"Aucun des deux n'est":"Ce nombre n'est pas")+" à l'intérieur du segment : f y est monotone."}`,`Le minimum et le maximum sont atteints soit aux bords du segment, soit là où la dérivée s'annule.`,1],
    [P.map((x,i)=>fx(`f(${nb(x)}) = ${nb(V[i])}`)).join(", ")+".",`On calcule f aux deux bords et aux points du segment où f′ s'annule.`,1],
    [`<b>${fx(`m = ${nb(m)}`)} et ${fx(`M = ${nb(M)}`)}</b> : ${fx(`f(${I}) = [${nb(m)} ; ${nb(M)}]`)}.`,`Le plus petit et le plus grand des nombres de l'étape d'avant.`,1.5]];
  const juge=rep=>{const C=casesDe(rep,"c"),u=qLu(C.m),v=qLu(C.M);if(!u||!v)return {incomplet:"Écris m et M : deux nombres, par exemple -4 et 12."};
    const ok=[egal(u,Q(m)),egal(v,Q(M))];if(ok[0]&&ok[1])return {ok:true};const F=["m","M"].filter((_,i)=>!ok[i]);
    const bords=egal(u,Q(mb))&&egal(v,Q(Mb));
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"m et M sont à revoir":F[0]+" est à revoir"}.`,diag:bords&&dedans.length?{etape:1,type:"extremum intérieur oublié",titre:"Où ça part : le point où la dérivée s'annule.",msg:`Tu as pris seulement les bords du segment. Mais f′ s'annule en ${fx(nb(dedans[0]))}${dedans.length>1?` et en ${fx(nb(dedans[1]))}`:""}, à l'intérieur : il faut aussi y calculer f.`}:{etape:2,type:"valeurs aux points remarquables",titre:"Où ça part : les valeurs de f.",msg:P.map((x,i)=>fx(`f(${nb(x)}) = ${nb(V[i])}`)).join(", ")+"."}};};
  const rf=m!==mb||M!==Mb?{m:String(mb),M:String(Mb)}:{m:String(M),M:String(m)};
  return {sig:"IM"+[c,a,d],q:`Soit f la fonction définie sur ℝ par ${fx(`f(x) = ${polyX(c)}`)}. Détermine l'image du segment ${fx(I)} par f, sous la forme ${fx("[m ; M]")}.`,corps:"",
    texte:`f(x) = ${polyX(c)} : l'image de ${I}, sous la forme [m ; M]`,champs:[{k:"cases",id:"c",noms:["m","M"],aide:"m est le minimum de f sur le segment, M son maximum."}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:fx(`f(${I}) = [${nb(m)} ; ${nb(M)}]`),bonneTxt:`f(${I}) = [${nb(m)} ; ${nb(M)}]`,repBonne:{c:{m:String(m),M:String(M)}},repFausse:{c:rf},nature:(c.length>3?"degré 3":"degré 2")+(dedans.length?", extremum intérieur":", monotone"),ens:{type:"image",f:x=>evN(c,x),a,d,m,M}};}

/* AN12 palier 1 : dérivable en un point ? dérivées à gauche et à droite */
const GD=["à gauche","à droite"];
function derivPoint(R){const t=R();let o;
  if(t<0.6){const x0=R.ent(-3,3),Lc=[R.ent(-9,9),R.ent(-6,6),R.nz(-3,3)],gL=evQ(derP(Lc),x0),m=R()<0.5?gL:add(gL,R.nz(-4,4)),L0=evQ(Lc,x0),p=sub(L0,mul(m,x0)),G=polyX(Lc),D=polyX([p,m]),X=nb(x0);
    o={sig:"D1,"+[x0,Lc,brut(m)],x0,g:gL,d:m,def:`${sur(G,X)}${fx(`f(x) = ${D}`)} si ${fx(`x &gt; ${X}`)}`,txt:`f(x) = ${G} si x ≤ ${X}, ${D} si x > ${X}`,f:x=>x<=x0?evN(Lc,x):evN([p,m],x),
      E:[[`Les deux morceaux valent ${fx(nb(L0))} en ${X} : f est continue en ${X}, et ${fx(`f(${X}) = ${nb(L0)}`)}.`,`On remplace x par ${X} dans chaque morceau. Une fonction dérivable en un point y est continue : on vérifie d'abord le raccord.`,0.5],
        [`Pour ${fx(`x &lt; ${X}`)}, le taux d'accroissement ${fx(`(f(x) − f(${X}))/(${moins("x",x0)})`)} se simplifie en ${fx(polyX([Lc[1]+Lc[2]*x0,Lc[2]]))}, qui tend vers <b>${fx(nb(gL))}</b>.`,`${fx(`f(x) − f(${X})`)} s'annule en ${fx(`x = ${X}`)} : on le factorise par ${fx(moins("x",x0))} et on simplifie. On peut aussi dériver le morceau de gauche, ${fx(`${polyX(derP(Lc))}`)}, et le prendre en ${X}.`,1.5],
        [`Pour ${fx(`x &gt; ${X}`)}, le taux d'accroissement vaut toujours <b>${fx(nb(m))}</b>.`,`Le morceau de droite est une droite de pente ${fx(nb(m))} qui passe par le point ${fx(`(${X} ; ${nb(L0)})`)} : son taux d'accroissement est sa pente.`,1]]};}
  else{const r=R.ent(-4,4),k=R.ent(-4,4),xa=R()<0.5,X=nb(r),A=`|${moins("x",r)}|`,kx=k?(k>0?" + ":" − ")+(Math.abs(k)===1?"":Math.abs(k))+"x":"",F=(xa?`(${moins("x",r)})${A}`:A)+kx;
    o={sig:"D2,"+[r,k,xa],x0:r,g:Q(xa?k:k-1),d:Q(xa?k:k+1),def:`${fx(`f(x) = ${F}`)} pour tout réel x`,txt:`f(x) = ${F}`,f:x=>(xa?(x-r)*Math.abs(x-r):Math.abs(x-r))+k*x,
      E:[[`f est continue en ${X}, et ${fx(`f(${X}) = ${nb(k*r)}`)}.`,`La valeur absolue est continue. En ${X}, ${fx(A)} vaut 0.`,0.5],
        [`Pour ${fx(`x &lt; ${X}`)}, ${fx(`${A} = −(${moins("x",r)})`)}, et le taux d'accroissement ${fx(`(f(x) − f(${X}))/(${moins("x",r)})`)} vaut ${fx((xa?`−(${moins("x",r)})`:"−1")+(k?` + ${par(k)}`:""))}, qui tend vers <b>${fx(nb(xa?k:k-1))}</b>.`,`${fx(`f(x) − f(${X}) = ${xa?`(${moins("x",r)})${A}`:A}${k?` + ${par(k)}(${moins("x",r)})`:""}`)} : on divise par ${fx(moins("x",r))}.`,1.5],
        [`Pour ${fx(`x &gt; ${X}`)}, ${fx(`${A} = ${moins("x",r)}`)}, et le taux d'accroissement vaut ${fx((xa?moins("x",r):"1")+(k?` + ${par(k)}`:""))}, qui tend vers <b>${fx(nb(xa?k:k+1))}</b>.`,`Même calcul, avec cette fois ${fx(`${A} = ${moins("x",r)}`)}.`,1]]};}
  const ok=egal(o.g,o.d),X=nb(o.x0),E=o.E.concat([[ok?`Les deux limites sont égales : <b>f est dérivable en ${X}</b>, et ${fx(`f′(${X}) = ${nb(o.g)}`)}.`:`Les deux limites sont différentes : <b>f n'est pas dérivable en ${X}</b>. Sa courbe y fait un angle.`,`f est dérivable en ${X} quand le taux d'accroissement a une limite finie en ${X}, la même à gauche et à droite.`,1]]);
  const juge=rep=>{const C=casesDe(rep,"c"),u=qLu(C[GD[0]]),v=qLu(C[GD[1]]);if(!u||!v)return {incomplet:"Écris les deux limites du taux d'accroissement, à gauche et à droite : deux nombres."};if(!rep.der)return {incomplet:"Dis aussi si f est dérivable en "+X+"."};
    const okG=egal(u,o.g),okD=egal(v,o.d),okR=(rep.der==="oui")===ok;if(okG&&okD&&okR)return {ok:true};const F=[];if(!okG)F.push(GD[0]);if(!okD)F.push(GD[1]);if(!okR)F.push("der");
    const d=!okG&&!okD&&egal(u,o.d)&&egal(v,o.g)?{etape:1,type:"gauche et droite échangées",titre:"Où ça part : les côtés.",msg:`À gauche, ce sont les x plus petits que ${X} : le taux y tend vers ${fx(nb(o.g))}.`}
      :!okG?{etape:1,type:"dérivée à gauche",titre:"Où ça part : la limite à gauche.",msg:o.E[1][0]}:!okD?{etape:2,type:"dérivée à droite",titre:"Où ça part : la limite à droite.",msg:o.E[2][0]}
      :{etape:3,type:"dérivable si les deux limites sont égales",titre:"Où ça part : la conclusion.",msg:ok?"Les deux limites sont égales : f est dérivable.":"Les deux limites sont différentes : f n'est pas dérivable."};
    return {ok:false,faux:F,resume:"Pas tout à fait : "+et(F.map(x=>x==="der"?"la conclusion":"la limite "+x))+(F.length>1?" sont à revoir.":" est à revoir."),diag:d};};
  return {sig:"DP"+o.sig,q:`Soit f la fonction définie par ${o.def}. Calcule la limite du taux d'accroissement ${fx(`(f(x) − f(${X}))/(${moins("x",o.x0)})`)} quand x tend vers ${X} à gauche, puis à droite. f est-elle dérivable en ${X} ?`,corps:"",
    texte:`${o.txt} : dérivées à gauche et à droite en ${X}, dérivable ou pas`,champs:[{k:"cases",id:"c",noms:GD},{k:"choix",id:"der",o:[["oui",`f est dérivable en ${X}`],["non",`f n'est pas dérivable en ${X}`]]}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:`à gauche ${fx(nb(o.g))}, à droite ${fx(nb(o.d))} : ${ok?"dérivable":"pas dérivable"}`,bonneTxt:`à gauche ${nb(o.g)}, à droite ${nb(o.d)} : ${ok?"dérivable":"pas dérivable"}`,
    repBonne:{c:{[GD[0]]:brut(o.g),[GD[1]]:brut(o.d)},der:ok?"oui":"non"},repFausse:{c:{[GD[0]]:brut(o.g),[GD[1]]:brut(o.d)},der:ok?"non":"oui"},nature:(o.sig[1]==="1"?"morceaux":"valeur absolue")+(ok?", dérivable":", pas dérivable"),ens:{type:"derpt",f:o.f,x0:o.x0,g:o.g.n/o.g.d,d:o.d.n/o.d.d}};}

/* AN12 palier 2 : trouver a et b pour que f soit dérivable en x₀ */
function abDeriv(R){const t=R();let o;
  if(t<0.65){const x0=R.ent(-3,3),Lc=[R.ent(-9,9),R.ent(-6,6),R.nz(-3,3)],a=evQ(derP(Lc),x0),L0=evQ(Lc,x0),b=sub(L0,mul(a,x0)),X=nb(x0),G=polyX(Lc),abT=x0?linA(x0,0)+" + b":"b";
    o={sig:"A1,"+[x0,Lc],x0,a,b,G,D:"ax + b",f:(x,A,B)=>x<=x0?evN(Lc,x):A*x+B,
      E:[[`Continuité en ${X} : ${fx(`${abT} = ${nb(L0)}`)}.`,`La limite à droite, ${fx(abT)}, doit être égale à ${fx(`f(${X}) = ${nb(L0)}`)}. Une fonction dérivable en un point y est d'abord continue.`,1],
        [`Dérivée à gauche : la dérivée du morceau de gauche, ${fx(polyX(derP(Lc)))}, prise en ${X}, vaut ${fx(nb(a))}. Dérivée à droite : a.`,`Chaque morceau est un polynôme : sa dérivée en ${X} est la limite du taux d'accroissement de ce côté-là. La droite ${fx("ax + b")} a pour pente a.`,1],
        [`Dérivable en ${X} : les deux dérivées sont égales, <b>${fx(`a = ${nb(a)}`)}</b>.`,`f est dérivable en ${X} quand le taux d'accroissement a la même limite des deux côtés.`,1],
        [`Puis ${fx(`b = ${nb(L0)} − ${x0?`${par(x0)} × ${par(a)}`:"0"}`)}, soit <b>${fx(`b = ${nb(b)}`)}</b>.`,`On remplace a par sa valeur dans l'équation de la continuité.`,1]]};}
  else{const x0=R.nz(-3,3),m=R.nz(-6,6),p=R.ent(-9,9),X=nb(x0),a=Q(m,2*x0),Rv=m*x0+p,b=sub(Rv,mul(a,x0*x0)),D=polyX([p,m]);
    o={sig:"A2,"+[x0,m,p],x0,a,b,G:"ax² + b",D,f:(x,A,B)=>x<=x0?A*x*x+B:m*x+p,
      E:[[`Continuité en ${X} : ${fx(`${linA(x0*x0,0)} + b = ${nb(Rv)}`)}.`,`À gauche, ${fx(`f(${X}) = ${linA(x0*x0,0)} + b`)} ; à droite, la limite est ${fx(`${nb(m)} × ${par(x0)}${p?` ${p>0?"+":"−"} ${Math.abs(p)}`:""} = ${nb(Rv)}`)}.`,1],
        [`Dérivée à gauche : ${fx(`2a × ${par(x0)} = ${linA(2*x0,0)}`)}. Dérivée à droite : ${fx(nb(m))}.`,`La dérivée de ${fx("ax² + b")} est ${fx("2ax")} ; celle de ${fx(D)} est ${fx(nb(m))}.`,1],
        [`Dérivable en ${X} : ${fx(`${linA(2*x0,0)} = ${nb(m)}`)}, donc <b>${fx(`a = ${nb(a)}`)}</b>.`,`Les dérivées à gauche et à droite doivent être égales.`,1],
        [`Puis ${fx(`b = ${nb(Rv)} − ${x0*x0} × ${par(a)}`)}, soit <b>${fx(`b = ${nb(b)}`)}</b>.`,`On remplace a par sa valeur dans l'équation de la continuité.`,1]]};}
  const X=nb(o.x0);
  const juge=rep=>{const C=casesDe(rep,"c"),u=qLu(C.a),v=qLu(C.b);if(!u||!v)return {incomplet:"Écris a et b : deux nombres, par exemple 4 et -3/2."};
    const ok=[egal(u,o.a),egal(v,o.b)];if(ok[0]&&ok[1])return {ok:true};const F=["a","b"].filter((_,i)=>!ok[i]);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"a et b sont à revoir":F[0]+" est à revoir"}.`,diag:!ok[0]?{etape:2,type:"égalité des dérivées à gauche et à droite",titre:"Où ça part : la condition de dérivabilité.",msg:o.E[1][0]+" "+o.E[2][0]}:{etape:3,type:"continuité oubliée",titre:"Où ça part : la continuité.",msg:`a est juste. b vient de la continuité : ${o.E[0][0]}`}};};
  return {sig:"AB"+o.sig,q:`Soient a et b deux réels, et f la fonction définie sur ℝ par ${sur(o.G,X)}${fx(`f(x) = ${o.D}`)} si ${fx(`x &gt; ${X}`)}. Trouve a et b pour que f soit dérivable en ${X}.`,corps:"",
    texte:`f(x) = ${o.G} si x ≤ ${X}, ${o.D} si x > ${X} : a et b pour que f soit dérivable en ${X}`,champs:[{k:"cases",id:"c",noms:["a","b"]}],juge,etapes:o.E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:`${fx(`a = ${nb(o.a)}`)} et ${fx(`b = ${nb(o.b)}`)}`,bonneTxt:`a = ${nb(o.a)}, b = ${nb(o.b)}`,repBonne:{c:{a:brut(o.a),b:brut(o.b)}},repFausse:{c:{a:brut(o.a),b:brut(add(o.b,1))}},nature:o.sig.slice(0,2),ens:{type:"ab",f:o.f,x0:o.x0,a:o.a.n/o.a.d,b:o.b.n/o.b.d}};}

/* AN13 : tangente en un point */
function tangente(R){const t=R();let o;
  if(t<0.55){const c=[R.ent(-6,6),R.ent(-5,5),R.ent(-3,3),R()<0.5?1:-1],x0=R.ent(-2,2),fp=derP(c);
    o={sig:"T1,"+[c,x0],x0,F:polyX(c),y:evQ(c,x0),m:evQ(fp,x0),fpT:`${fx(`f′(x) = ${polyX(fp)}`)}`,f:x=>evN(c,x)};}
  else{let a,b,d,x0;do{a=R.nz(-5,5);b=R.ent(-9,9);d=R.nz(-5,5);x0=R.ent(-3,3);}while(a*d-b===0||x0+d===0);const N=polyX([b,a]),Dn=moins("x",-d);
    o={sig:"T2,"+[a,b,d,x0],x0,F:`(${N})/(${Dn})`,y:Q(a*x0+b,x0+d),m:Q(a*d-b,(x0+d)*(x0+d)),fpT:`${fx(`f′(x) = (${nb(a)}(${Dn}) − (${N}))/(${Dn})² = ${nb(a*d-b)}/(${Dn})²`)}`,f:x=>(a*x+b)/(x+d)};}
  const X=nb(o.x0),p=sub(o.y,mul(o.m,o.x0)),eqT=polyX([p,o.m]);
  const E=[[`La tangente en ${X} a pour équation ${fx(`y = f′(${X})(${moins("x",o.x0)}) + f(${X})`)}.`,`C'est la droite qui passe par le point ${fx(`(${X} ; f(${X}))`)} avec la pente ${fx(`f′(${X})`)}.`,0.5],
    [`${fx(`f(${X}) = ${nb(o.y)}`)}.`,`On remplace x par ${X} dans ${fx(`f(x)`)}.`,1],
    [`${o.fpT}, donc ${fx(`f′(${X}) = ${nb(o.m)}`)}.`,o.sig[1]==="1"?"On dérive terme à terme : la dérivée de xⁿ est nxⁿ⁻¹.":`On utilise ${fx("(u/v)′ = (u′v − uv′)/v²")}, puis on remplace x par ${X}.`,1.5],
    [`<b>${fx(`y = ${eqT}`)}</b>`,`${fx(`y = ${o.m.d>1||o.m.n<0?"("+nb(o.m)+")":nb(o.m)}(${moins("x",o.x0)}) + ${par(o.y)}`)}, puis on développe.`,1]];
  const juge=rep=>{const C=casesDe(rep,"c"),u=qLu(C.m),v=qLu(C.p);if(!u||!v)return {incomplet:"Écris m et p : deux nombres, par exemple 3 et -5/2."};
    const ok=[egal(u,o.m),egal(v,p)];if(ok[0]&&ok[1])return {ok:true};const F=["m","p"].filter((_,i)=>!ok[i]);
    const d=!ok[0]?{etape:2,type:"nombre dérivé",titre:"Où ça part : la pente.",msg:`La pente de la tangente est ${fx(`f′(${X}) = ${nb(o.m)}`)}.`}:egal(v,o.y)&&o.x0?{etape:3,type:"ordonnée à l'origine prise égale à f(x₀)",titre:"Où ça part : le développement.",msg:`p n'est pas ${fx(`f(${X})`)} : il faut développer ${fx(`${nb(o.m)}(${moins("x",o.x0)})`)}. Ici ${fx(`p = ${nb(o.y)} − ${par(o.m)} × ${par(o.x0)} = ${nb(p)}`)}.`}:{etape:3,type:"équation de la tangente",titre:"Où ça part : l'équation.",msg:`${fx(`y = ${nb(o.m)}(${moins("x",o.x0)}) + ${par(o.y)} = ${eqT}`)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"m et p sont à revoir":F[0]+" est à revoir"}.`,diag:d};};
  return {sig:"TG"+o.sig,q:`Soit f la fonction définie par ${fx(`f(x) = ${o.F}`)}. Donne l'équation de la tangente à la courbe de f au point d'abscisse ${X}, sous la forme ${fx("y = mx + p")}.`,corps:"",
    texte:`f(x) = ${o.F} : la tangente en ${X}, y = mx + p`,champs:[{k:"cases",id:"c",noms:["m","p"],aide:"La tangente s'écrit y = mx + p : m est sa pente."}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:fx(`y = ${eqT}`),bonneTxt:`y = ${eqT}`,repBonne:{c:{m:brut(o.m),p:brut(p)}},repFausse:{c:{m:brut(o.m),p:brut(add(p,1))}},nature:o.sig.slice(0,2),ens:{type:"tan",f:o.f,x0:o.x0,m:o.m.n/o.m.d,p:p.n/p.d}};}

/* AN14 palier 1 : le c du théorème des accroissements finis */
function taf(R){const t=R();let c,p,qq,cs,res;
  if(t<0.4){c=[R.ent(-9,9),R.ent(-6,6),R.nz(-3,3)];p=R.ent(-6,3);qq=p+R.ent(1,6);const v=Q(p+qq,2);cs=[{v:v.n/v.d,t:nb(v),tape:brut(v)}];
    res=sl=>`${fx(`f′(c) = ${polyX([c[1],2*c[2]]).replace(/x/g,"c")}`)} : ${fx(`${polyX([c[1],2*c[2]]).replace(/x/g,"c")} = ${nb(sl)}`)} donne ${fx(`c = ${nb(v)}`)}.`;}
  else{let P;do{p=R.ent(-6,4);qq=p+R.ent(1,7);P=p*p+p*qq+qq*qq;}while(P%3);const k=P/3,be=R.ent(-6,6),rt=Math.sqrt(k),ent=Number.isInteger(rt);c=[0,be,0,1];let sq=1;for(let j=2;j*j<=k;j++)if(k%(j*j)===0)sq=j;const rad=(sq>1?sq:"")+"√"+(k/(sq*sq));
    cs=[1,-1].map(s=>({v:s*rt,t:ent?nb(s*rt):(s<0?"−":"")+rad,tape:ent?String(s*rt):(s<0?"-":"")+(sq>1?sq+"*":"")+"sqrt("+k/(sq*sq)+")"})).filter(z=>z.v>p&&z.v<qq);
    res=()=>`${fx(`f′(c) = 3c²${be?(be>0?" + ":" − ")+Math.abs(be):""}`)} : l'équation donne ${fx(`3c² = ${P}`)}, soit ${fx(`c² = ${k}`)}, donc ${fx(ent?`c = ${rt}`:`c = ${rad}`)} ou ${fx(ent?`c = −${rt}`:`c = −${rad}`)}.`;}
  const sl=div(sub(evQ(c,qq),evQ(c,p)),qq-p),I=`]${nb(p)} ; ${nb(qq)}[`,F=polyX(c),fpN=x=>evN(derP(c),x),cT=cs.map(z=>fx(`c = ${z.t}`)).join(" ou ");
  const E=[[`f est continue sur ${fx(`[${nb(p)} ; ${nb(qq)}]`)} et dérivable sur ${fx(I)}, car c'est un polynôme. Le théorème des accroissements finis donne un c de ${fx(I)} tel que ${fx(`f′(c) = (f(${nb(qq)}) − f(${nb(p)}))/(${nb(qq)} − ${par(p)})`)}.`,`Ce sont les deux hypothèses du théorème. Il dit qu'en un point c au moins, la tangente est parallèle à la corde qui joint les deux bouts de la courbe.`,1],
    [`${fx(`f(${nb(p)}) = ${nb(evQ(c,p))}`)} et ${fx(`f(${nb(qq)}) = ${nb(evQ(c,qq))}`)}, donc la pente vaut <b>${fx(nb(sl))}</b>.`,`${fx(`(${nb(evQ(c,qq))} − ${par(evQ(c,p))})${qq-p>1?"/"+(qq-p):""} = ${nb(sl)}`)}.`,1],
    [res(sl),`On résout ${fx(`f′(c) = ${nb(sl)}`)}.`,1],
    [`<b>${cT}</b>${cs.length>1?" : les deux sont dans l'intervalle, et chacune convient":`, qui est bien dans ${fx(I)}`}.`,`Le théorème demande c strictement entre ${nb(p)} et ${nb(qq)}.${c.length>3&&cs.length<2?" L'autre valeur n'y est pas.":""}`,1]];
  const juge=rep=>{const C=casesDe(rep,"c"),u=qLu(C.pente),v=numLu(C.c);if(!u)return {incomplet:"Écris la pente : un nombre, par exemple 7 ou 5/2."};if(v===null)return {incomplet:"Écris c : un nombre, par exemple 1/2 ou √3."};
    const okP=egal(u,sl),okC=v>p&&v<qq&&Math.abs(fpN(v)-sl.n/sl.d)<1e-9*Math.max(1,Math.abs(sl.n/sl.d));if(okP&&okC)return {ok:true};const F=[];if(!okP)F.push("pente");if(!okC)F.push("c");
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"la pente et c sont à revoir":F[0]==="c"?"c est à revoir":"la pente est à revoir"}.`,diag:!okP?{etape:1,type:"pente de la corde",titre:"Où ça part : la pente.",msg:E[1][0]+" "+E[1][1]}:!(v>p&&v<qq)?{etape:3,type:"c hors de l'intervalle",titre:"Où ça part : l'intervalle.",msg:`c doit être strictement entre ${nb(p)} et ${nb(qq)} : ${cT}.`}:{etape:2,type:"résolution de f′(c) = pente",titre:"Où ça part : l'équation en c.",msg:res(sl)}};};
  return {sig:"AF"+[c,p,qq],q:`Soit f la fonction définie sur ℝ par ${fx(`f(x) = ${F}`)}. Calcule la pente ${fx(`(f(${nb(qq)}) − f(${nb(p)}))/(${nb(qq)} − ${par(p)})`)}, puis trouve un réel c de ${fx(I)} tel que f′(c) soit égal à cette pente.`,corps:"",
    texte:`f(x) = ${F} sur [${nb(p)} ; ${nb(qq)}] : la pente de la corde, et un c du théorème des accroissements finis`,champs:[{k:"cases",id:"c",noms:["pente","c"],sym:["√("],aide:"Pour c, une valeur qui convient suffit. Tu peux écrire √3 ou sqrt(3)."}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:`pente ${fx(nb(sl))} ; ${cT}`,bonneTxt:`pente ${nb(sl)} ; ${cs.map(z=>"c = "+z.t).join(" ou ")}`,repBonne:{c:{pente:brut(sl),c:cs[0].tape}},repFausse:{c:{pente:brut(sl),c:String(p)}},nature:(c.length>3?"degré 3":"degré 2")+(cs.length>1?", deux c":""),
    ens:{type:"taf",f:x=>evN(c,x),fp:fpN,p,q:qq,sl:sl.n/sl.d,cs:cs.map(z=>z.v)}};}

/* AN14 palier 2 : une inégalité des accroissements finis, sur papier */
function iaf(R){const t=R(),k=R.ent(1,6);let o;
  if(t<0.3)o={sig:"I1,"+k,I:`[${k*k} ; +∞[`,lo:k*k,hi:k*k+50,f:Math.sqrt,fp:x=>1/(2*Math.sqrt(x)),M:1/(2*k),F:"√t",FP:"1/(2√t)",ineg:`|√x − √y| ≤ |x − y|/${2*k}`,maj:`Pour ${fx(`t ≥ ${k*k}`)}, ${fx(`√t ≥ ${k}`)}, donc ${fx(`1/(2√t) ≤ 1/${2*k}`)}.`};
  else if(t<0.55){const K=Math.min(k,5);o={sig:"I2,"+K,I:`[−${K} ; ${K}]`,lo:-K,hi:K,f:x=>x*x*x,fp:x=>3*x*x,M:3*K*K,F:"t³",FP:"3t²",ineg:`|x³ − y³| ≤ ${3*K*K}|x − y|`,maj:`Pour ${fx(`−${K} ≤ t ≤ ${K}`)}, ${fx(`t² ≤ ${K*K}`)}, donc ${fx(`3t² ≤ ${3*K*K}`)}.`};}
  else if(t<0.85)o={sig:"I3,"+k,I:`[${k} ; +∞[`,lo:k,hi:k+50,f:x=>1/x,fp:x=>-1/(x*x),M:1/(k*k),F:"1/t",FP:"−1/t²",ineg:`|1/x − 1/y| ≤ |x − y|${k>1?"/"+k*k:""}`,maj:`Pour ${fx(`t ≥ ${k}`)}, ${fx(`t² ≥ ${k*k}`)}, donc ${fx(`|−1/t²| = 1/t² ≤ ${k>1?"1/"+k*k:"1"}`)}.`};
  else{const s=R()<0.5;o={sig:"I4,"+s,I:"ℝ",lo:-20,hi:20,f:s?Math.sin:Math.cos,fp:s?Math.cos:x=>-Math.sin(x),M:1,F:s?"sin t":"cos t",FP:s?"cos t":"−sin t",ineg:s?"|sin x − sin y| ≤ |x − y|":"|cos x − cos y| ≤ |x − y|",maj:`Pour tout réel t, ${fx(`|${s?"cos t":"−sin t"}| ≤ 1`)}.`};}
  const L=[[`Soient x et y dans ${fx(o.I)}, avec ${fx("x &lt; y")}. La fonction ${fx(`f : t ↦ ${o.F}`)} est continue sur ${fx("[x ; y]")} et dérivable sur ${fx("]x ; y[")}, avec ${fx(`f′(t) = ${o.FP}`)}.`,`On vérifie les deux hypothèses du théorème des accroissements finis sur l'intervalle entre x et y.`,1],
    [`D'après le théorème des accroissements finis, il existe c dans ${fx("]x ; y[")} tel que ${fx("f(y) − f(x) = f′(c)(y − x)")}.`,`c dépend de x et de y, mais il est entre les deux, donc dans ${fx(o.I)}.`,1],
    [o.maj+` Donc ${fx(`|f′(c)| ≤ ${o.M===1?"1":o.M<1?"1/"+Math.round(1/o.M):o.M}`)}.`,`C'est le cœur de l'exercice : majorer la dérivée sur tout l'intervalle.`,1],
    [`Donc ${fx(`|f(y) − f(x)| = |f′(c)| × |y − x|`)}, ce qui donne <b>${fx(o.ineg)}</b>. Si ${fx("x = y")}, c'est évident, et si ${fx("x &gt; y")} on échange x et y.`,`On prend la valeur absolue de l'égalité du théorème, puis on utilise la majoration.`,1]];
  return {sig:"IA"+o.sig,q:`Montre que, pour tous x et y de ${fx(o.I)}, on a ${fx(o.ineg)}.`,corps:"",texte:`Pour x, y dans ${o.I} : ${o.ineg} (inégalité des accroissements finis)`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
    etapes:L.map(x=>({w:x[0],why:x[1],pts:x[2]})),bonne:"voir la rédaction",bonneTxt:`avec |f′| ≤ ${o.M} sur ${o.I}`,repBonne:{},nature:o.sig.slice(0,2),ens:{type:"iaf",f:o.f,fp:o.fp,lo:o.lo,hi:o.hi,M:o.M}};}

/* AN15 : bijection et réciproque (chapitre 4, « Bijection réciproque » ; chapitre 6, « Réciproque » ; TD 5 ex. 10) */
function reciproque(R){const t=R();let o;
  if(t<0.45){const a=R.ent(1,6),b=R.ent(-6,6),x0=R.ent(-2,2),c=[b,a,0,1];
    o={sig:"P,"+[a,b,x0],I:"ℝ",F:polyX(c),x0,y0:evQ(c,x0),fp:3*x0*x0+a,f:x=>evN(c,x),lo:-60,hi:60,
     cont:"f est continue sur ℝ (c'est un polynôme)",der:`${fx(`f′(x) = 3x² + ${a}`)}, qui est ${fx("&gt; 0")} pour tout réel x`,
     lims:`En ${fx("−∞")} et en ${fx("+∞")}, f se comporte comme x³ : ${fx("lim_{x→−∞} f(x) = −∞")} et ${fx("lim_{x→+∞} f(x) = +∞")}`,
     fpT:`${fx(`f′(${nb(x0)}) = 3 × ${par(x0*x0)} + ${a} = ${3*x0*x0+a}`)}`};}
  else if(t<0.75){const k=R.ent(1,3),a=R.ent(1,5),b=R.ent(-5,5),L=polyX([b,a]),K=k>1?k:"";
    o={sig:"E,"+[k,a,b],I:"ℝ",F:`${K}eˣ + ${L}`,x0:0,y0:Q(k+b),fp:k+a,f:x=>k*Math.exp(x)+a*x+b,lo:-60,hi:30,
     cont:"f est continue sur ℝ (somme d'une exponentielle et d'un polynôme)",der:`${fx(`f′(x) = ${K}eˣ + ${a}`)}, qui est ${fx("&gt; 0")} pour tout réel x`,
     lims:`En ${fx("−∞")}, ${K}eˣ tend vers 0 et ${fx(L)} vers ${fx("−∞")} ; en ${fx("+∞")}, les deux tendent vers ${fx("+∞")}. Donc ${fx("lim_{x→−∞} f(x) = −∞")} et ${fx("lim_{x→+∞} f(x) = +∞")}`,
     fpT:`${fx(`f′(0) = ${k>1?k+" × ":""}e⁰ + ${a} = ${k+a}`)}`};}
  else{const a=R.ent(1,5),b=R.ent(-6,6),n=R.ent(1,2),P=polyX(n>1?[b,0,a]:[b,a]),A=`${a>1?a:""}x${n>1?"²":""}`,F=`${A} + ln x${b?(b>0?" + ":" − ")+Math.abs(b):""}`;
    o={sig:"L,"+[a,b,n],I:"]0 ; +∞[",F,x0:1,y0:Q(a+b),fp:n*a+1,f:x=>a*x**n+Math.log(x)+b,lo:1e-15,hi:1e6,
     cont:"f est continue sur ]0 ; +∞[ (somme d'un polynôme et de ln)",der:`${fx(`f′(x) = ${n>1?2*a+"x":a} + 1/x`)}, qui est ${fx("&gt; 0")} pour tout x &gt; 0`,
     lims:`En 0⁺, ln x tend vers ${fx("−∞")} et ${fx(P)} vers ${nb(b)} ; en ${fx("+∞")}, tout tend vers ${fx("+∞")}. Donc ${fx("lim_{x→0⁺} f(x) = −∞")} et ${fx("lim_{x→+∞} f(x) = +∞")}`,
     fpT:`${fx(`f′(1) = ${n>1?2*a:a} + 1 = ${n*a+1}`)}`};}
  const X=nb(o.x0),Y=nb(o.y0),d=Q(1,o.fp);
  const E=[[`${o.cont}, et ${o.der}. Donc f est strictement croissante sur ${fx(o.I)}.`,`La stricte monotonie se lit sur le signe de f′. C'est elle qui donne « bijection », la continuité donne « sur un intervalle ».`,1],
    [`${o.lims}. f est continue et strictement croissante sur l'intervalle ${fx(o.I)} : elle réalise une bijection de ${fx(o.I)} sur ${fx(`J = f(${o.I}) = ℝ`)}, et sa réciproque g est continue et strictement croissante.`,`C'est le théorème de la bijection du cours : les bornes de J sont les limites de f aux bornes de I.`,1],
    [`${fx(`f(${X}) = ${Y}`)}, donc <b>${fx(`g(${Y}) = ${X}`)}</b>.`,`g(y) est le x de I tel que f(x) = y. On essaie les x simples (0, 1, −1, 2…) : ici ${X} convient.`,1],
    [`${o.fpT} ≠ 0, donc g est dérivable en ${Y} et <b>${fx(`g′(${Y}) = 1/f′(g(${Y})) = 1/f′(${X}) = ${nb(d)}`)}</b>.`,`Le théorème du cours : si ${fx("f′(x₀) ≠ 0")}, la réciproque est dérivable en ${fx("y₀ = f(x₀)")}, avec ${fx("(f⁻¹)′(y₀) = 1/f′(x₀)")}.`,1]];
  const juge=rep=>{const C=casesDe(rep,"c"),u=qLu(C.a),v=qLu(C.b);if(!u||!v)return {incomplet:"Écris a et b : deux nombres, par exemple 2 et 1/5."};
    const ok=[egal(u,o.x0),egal(v,d)];if(ok[0]&&ok[1])return {ok:true};const F=["a","b"].filter((_,i)=>!ok[i]);
    const d0=!ok[0]?{etape:2,type:"valeur de la réciproque",titre:"Où ça part : g(y₀).",msg:`${fx(`g(${Y})`)} est le nombre x tel que ${fx(`f(x) = ${Y}`)}. Essaie ${fx(`x = ${X}`)} : ${fx(`f(${X}) = ${Y}`)}, donc ${fx(`g(${Y}) = ${X}`)}.`}
      :egal(v,o.fp)?{etape:3,type:"dérivée de la réciproque non inversée",titre:"Où ça part : il faut inverser.",msg:`La dérivée de la réciproque est l'<b>inverse</b> : ${fx(`g′(${Y}) = 1/f′(${X}) = ${nb(d)}`)}, pas ${fx(`f′(${X})`)}.`}
      :{etape:3,type:"dérivée de la réciproque",titre:"Où ça part : g′(y₀).",msg:`On prend f′ au point ${fx(`g(${Y}) = ${X}`)}, pas en ${Y} : ${fx(`g′(${Y}) = 1/f′(${X}) = 1/${o.fp}`)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"a et b sont à revoir":F[0]+" est à revoir"}.`,diag:d0};};
  return {sig:"RC"+o.sig,q:`Soit f la fonction définie sur ${fx(o.I)} par ${fx(`f(x) = ${o.F}`)}. Montre que f réalise une bijection de ${fx(o.I)} sur un intervalle J à préciser. On note g sa réciproque. Donne ${fx(`a = g(${Y})`)} et ${fx(`b = g′(${Y})`)}.`,corps:"",
    texte:`f(x) = ${o.F} sur ${o.I}, g sa réciproque : g(${Y}) et g′(${Y})`,champs:[{k:"cases",id:"c",noms:["a","b"],aide:`a = g(${Y}) est le x tel que f(x) = ${Y}.`}],juge,etapes:E.map(x=>({w:x[0],why:x[1],pts:x[2]})),
    bonne:`${fx(`g(${Y}) = ${X}`)} et ${fx(`g′(${Y}) = ${nb(d)}`)}`,bonneTxt:`g(${Y}) = ${X}, g′(${Y}) = ${nb(d)}`,repBonne:{c:{a:String(o.x0),b:brut(d)}},repFausse:{c:{a:String(o.x0),b:brut(add(d,1))}},nature:o.sig[0],ens:{type:"recip",f:o.f,lo:o.lo,hi:o.hi,x0:o.x0,y0:o.y0.n/o.y0.d,d:d.n/d.d}};}

/* AQ3 : la question de cours du CC2 (énoncés écrits de façon classique : le chapitre 4 n'est pas encore sur Moodle) */
function coursCC2(R){const t=R();
  if(t<0.25){const m=R.nz(-6,6),p=R.ent(-9,9),x0=R.ent(-5,5),F=polyX([p,m]),M=Math.abs(m),X=nb(x0);
    return papierQ("Q1"+[m,p,x0],"Connaissance du cours (3 points).",`<ol type="a"><li>Soit f définie sur un intervalle I, et x₀ ∈ I. Donne la définition, avec ε et η, de « f est continue en x₀ ».</li><li>Montre avec cette définition que ${fx(`f(x) = ${F}`)} est continue en ${X}.</li></ol>`,[
      [`a) f est continue en x₀ si ${O.f("∀ε &gt; 0, ∃η &gt; 0, ∀x ∈ I, |x − x₀| &lt; η ⇒ |f(x) − f(x₀)| &lt; ε")}.`,`C'est la définition de la limite en x₀, avec f(x₀) à la place de ℓ : f est continue en x₀ quand ${fx("lim_{x→x₀} f(x) = f(x₀)")}.`,1],
      [`b) ${fx(`|f(x) − f(${X})| = ${M===1?"":M}|${moins("x",x0)}|`)}.`,`${fx(`f(x) − f(${X}) = ${nb(m)}(${moins("x",x0)})`)}, puis on prend la valeur absolue.`,0.5],
      [`Soit ${fx("ε &gt; 0")}. On pose ${fx(`η = ${M===1?"ε":"ε/"+M}`)}. Si ${fx(`|${moins("x",x0)}| &lt; η`)}, alors ${fx(`|f(x) − f(${X})| &lt; ${M===1?"":M}η = ε`)}. Donc f est continue en ${X}.`,`On choisit η en fonction de ε, puis on vérifie l'implication.`,0.5]],
      {type:"cont",f:x=>m*x+p,x0,eta:e=>e/M},"continuité");}
  if(t<0.5){const T=tviF(R),F=polyX(T.c);
    return papierQ("Q2"+T.c,"Connaissance du cours (3 points).",`<ol type="a"><li>Énonce le théorème des valeurs intermédiaires.</li><li>Montre que l'équation ${fx(`${F} = 0`)} a au moins une solution dans ${fx(`[${T.n} ; ${T.n+1}]`)}.</li></ol>`,[
      [`a) Si f est continue sur un intervalle ${fx("[a ; b]")}, alors pour tout réel y compris entre ${fx("f(a)")} et ${fx("f(b)")}, il existe ${fx("c ∈ [a ; b]")} tel que ${fx("f(c) = y")}.`,"Les deux mots clés : « continue » et « intervalle ». Sans l'un des deux, le théorème est faux.",1],
      [`b) ${fx(`f(x) = ${F}`)} est continue sur ${fx(`[${T.n} ; ${T.n+1}]`)} (polynôme), ${fx(`f(${T.n}) = ${nb(T.fn)}`)} et ${fx(`f(${T.n+1}) = ${nb(T.fn1)}`)}.`,"Un nombre négatif et un nombre positif : 0 est entre les deux.",0.5],
      [`0 est entre ${fx(`f(${T.n})`)} et ${fx(`f(${T.n+1})`)} : le théorème donne ${fx(`c ∈ [${T.n} ; ${T.n+1}]`)} tel que ${fx("f(c) = 0")}.`,"On applique le théorème avec y = 0.",0.5]],
      {type:"tvi",c:T.c,n:T.n},"TVI");}
  if(t<0.75){const be=R.ent(-6,6),p=R.ent(-6,3),qq=p+R.ent(1,6),F=polyX([0,be,1]),cc=Q(p+qq,2);
    return papierQ("Q3"+[be,p,qq],"Connaissance du cours (3 points).",`<ol type="a"><li>Énonce le théorème de Rolle, puis le théorème des accroissements finis.</li><li>Pour ${fx(`f(x) = ${F}`)}, trouve le réel c que donne le théorème des accroissements finis sur ${fx(`[${nb(p)} ; ${nb(qq)}]`)}.</li></ol>`,[
      [`a) Rolle : si f est continue sur ${fx("[a ; b]")}, dérivable sur ${fx("]a ; b[")} et ${fx("f(a) = f(b)")}, alors il existe ${fx("c ∈ ]a ; b[")} tel que ${fx("f′(c) = 0")}.`,"Trois hypothèses, et c est strictement entre a et b.",0.5],
      [`Accroissements finis : si f est continue sur ${fx("[a ; b]")} et dérivable sur ${fx("]a ; b[")}, alors il existe ${fx("c ∈ ]a ; b[")} tel que ${fx("f(b) − f(a) = f′(c)(b − a)")}.`,"C'est Rolle sans l'hypothèse f(a) = f(b).",0.5],
      [`b) ${fx(`(f(${nb(qq)}) − f(${nb(p)}))/(${nb(qq)} − ${par(p)}) = ${nb(qq+p+be)}`)} et ${fx(`f′(c) = 2c${be?(be>0?" + ":" − ")+Math.abs(be):""}`)}, donc ${fx(`c = ${nb(cc)}`)}, qui est bien dans ${fx(`]${nb(p)} ; ${nb(qq)}[`)}.`,`Pour un polynôme du second degré, c est toujours le milieu de l'intervalle.`,1]],
      {type:"taf",f:x=>x*x+be*x,fp:x=>2*x+be,p,q:qq,sl:qq+p+be,cs:[cc.n/cc.d]},"TAF");}
  const a=R.ent(-5,5),be=R.ent(-6,6),F=polyX([0,be,1]),A=nb(a);
  return papierQ("Q4"+[a,be],"Connaissance du cours (3 points).",`<ol type="a"><li>Donne la définition de « f est dérivable en a ».</li><li>Montre avec cette définition que ${fx(`f(x) = ${F}`)} est dérivable en ${A}, et donne ${fx(`f′(${A})`)}.</li></ol>`,[
    [`a) f est dérivable en a si le taux d'accroissement ${fx("(f(x) − f(a))/(x − a)")} a une limite finie quand x tend vers a. Cette limite est le nombre dérivé ${fx("f′(a)")}.`,"La limite doit être finie : c'est elle qui donne la pente de la tangente.",1],
    [`b) Pour ${fx(`x ≠ ${A}`)} : ${fx(`(f(x) − f(${A}))/(${moins("x",a)}) = ${polyX([a+be,1])}`)}.`,`${fx(`f(x) − f(${A}) = x² − ${par(a)}²${be?` + ${par(be)}(${moins("x",a)})`:""}`)}, et ${fx(`x² − ${par(a)}² = (${moins("x",a)})(${moins("x",-a)})`)} : on simplifie par ${fx(moins("x",a))}.`,0.5],
    [`Quand x tend vers ${A}, ce taux tend vers ${fx(nb(2*a+be))} : f est dérivable en ${A} et ${fx(`f′(${A}) = ${nb(2*a+be)}`)}.`,"Une limite finie : f est dérivable.",0.5]],
    {type:"derdef",f:x=>x*x+be*x,a,d:2*a+be},"dérivée");}

G.ana={val,rac,pc,unir,dansP,lisEns,memeEns,negation,phraseQ,phraseFr,atome,finPhrase,quantQ,SYMQ,papierQ};/* repris par le Raisonnement */
G.add("ana",[
 {id:"AN1",t:"Le tableau : intervalle, inf, min, max, sup",tache:"le tableau inf, min, max, sup",th:"bornes",pts:5.5,lecons:["a-bornes"],
  paliers:[
   {t:"un intervalle ou une demi-droite : lire les crochets",cc:1,gen:R=>tableau(R()<0.75?eInterv(R):eDemi(R),0)},
   {t:"deux intervalles : union, intersection",cc:2,gen:R=>{const t=R();return tableau(eDeux(R,t<0.35?"rec":t<0.6?"dis":t<0.8?"col":"int"),1);}},
   {t:"l'ensemble des termes d'une suite",cc:3,gen:R=>tableau(eSuite(R),2)},
   {t:"un ensemble donné par une inéquation",cc:3,gen:R=>tableau(eIneq(R),3)},
   {t:"comme au CC, avec un élément proche de la borne supérieure",cc:4,gen:commeAuCC}]},
 {id:"AN2",t:"Limite d'une suite : trouver un rang N",tache:"limite d'une suite, trouver un rang N",th:"limite",pts:3,lecons:["a-limite"],
  paliers:[
   {t:"une suite qui tend vers 0, ε donné",cc:2,gen:R=>tireNum(R,false)},
   {t:"un quotient : la limite, puis un rang pour ε donné",cc:4,gen:R=>tireNum(R,true)},
   {t:"ε quelconque : N en fonction de ε",cc:4,gen:R=>rangEps(R()<0.4?tireNul(R):tireQuot(R))},
   {t:"une suite qui tend vers +∞ : N en fonction de A",cc:4,gen:rangInfini},
   {t:"la rédaction complète, sur papier, comme au CC",cc:10,gen:redacEps}]},
 {id:"AN3",t:"Limite d'une fonction : les définitions",tache:"limite d'une fonction, les définitions",th:"limfonction",pts:3,lecons:["a-lim-fonction"],apres:["AN2"],
  paliers:[
   {t:"écrire la définition demandée",cc:2,gen:definition},
   {t:"limite en +∞ : la limite, puis un seuil α",cc:4,gen:seuilAlpha},
   {t:"limite en un point : un η qui convient",cc:4,gen:seuilEta},
   {t:"la démonstration complète, sur papier, comme au CC",cc:10,gen:redacFonction}]},
 {id:"AN4",t:"Calculer une limite de suite",th:"calcul",pts:3,lecons:["a-calcul","a-comparaison"],
  paliers:[
   {t:"un quotient de polynômes",cc:2,gen:limPoly},
   {t:"des racines : la quantité conjuguée",cc:3,gen:limRacine},
   {t:"des puissances comme 2ⁿ et 3ⁿ",cc:3,gen:limPuis},
   {t:"un terme borné : gendarmes et comparaison",cc:3,gen:limGend},
   {t:"tout mélangé, avec des suites sans limite",cc:3,gen:R=>{const t=R();return t<0.35?limSans(R):t<0.52?limPoly(R):t<0.68?limRacine(R):t<0.84?limPuis(R):limGend(R);}}]},
 {id:"AN5",t:"Suites adjacentes",th:"adjacentes",pts:3,lecons:["a-adjacentes"],
  paliers:[
   {t:"le sens de variation avec uₙ₊₁ − uₙ",cc:4,gen:sensDeux},
   {t:"la différence vₙ − uₙ et sa limite",cc:3,gen:ecartDeux},
   {t:"deux suites liées : premiers termes, sens, limite commune",cc:8,gen:adjacentes},
   {t:"l'exercice complet, sur papier, comme au CC",cc:18,gen:redacAdj}]},
 {id:"AN6",t:"Suite récurrente : termes, sens de variation, limite",tache:"suite récurrente",th:"monotone",pts:1.5,lecons:["a-monotone"],
  paliers:[
   {t:"calculer les premiers termes",cc:3,gen:premiers},
   {t:"les limites possibles : passer à la limite dans la relation",cc:3,gen:limitePossible,min:60},
   {t:"sens de variation et limite, relation du premier degré",cc:4,gen:affineSens},
   {t:"l'étude complète, sur papier, comme au CC",cc:12,gen:redacRecurrente,min:110}]},
 {id:"AN8",t:"Valeur absolue : inéquations, partie entière",tache:"inéquations avec valeur absolue",th:"outils",pts:1,lecons:["a-abs"],
  paliers:[
   {t:"|x − a| plus petit qu'un nombre",cc:2,gen:absDedans},
   {t:"|ax + b| plus petit qu'un nombre",cc:3,gen:R=>absAffine(R,false)},
   {t:"valeur absolue plus grande qu'un nombre : deux morceaux",cc:3,gen:absDehors},
   {t:"deux distances, encadrement, partie entière, cas limites",cc:3,gen:deuxAbs}]},
 {id:"AN7",t:"Nier une phrase à quantificateurs",th:"quantif",pts:1,lecons:["a-quantif"],
  paliers:[
   {t:"un quantificateur",cc:1,gen:R=>negation(phraseQ(R,1)),min:60},
   {t:"deux quantificateurs",cc:2,gen:R=>negation(phraseQ(R,2)),min:30},
   {t:"trois quantificateurs, avec ou sans implication",cc:3,gen:R=>negation(phraseQ(R,3)),min:60},
   {t:"une phrase en français : écrire son contraire",cc:3,gen:R=>negation(phraseFr(R)),min:12}]},
 {id:"AQ1",t:"Connaissance du cours : caractériser la borne supérieure",th:"bornes",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:6,gen:coursSup}]},
 {id:"AQ2",t:"Connaissance du cours : point adhérent",th:"bornes",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:6,gen:coursAdh}]},
 {id:"AN9",t:"Continuité en un point : prolongement, raccord",tache:"continuité en un point",th:"continuite",ex:"cc2",pts:3,lecons:[],
  paliers:[
   {t:"prolonger par continuité",cc:3,min:150,gen:prolong},
   {t:"une fonction définie par morceaux : le paramètre qui la rend continue",cc:3,gen:morceaux}]},
 {id:"AN10",t:"Le théorème des valeurs intermédiaires",tache:"théorème des valeurs intermédiaires",th:"continuite",ex:"cc2",pts:3,lecons:[],
  paliers:[
   {t:"situer la solution entre deux entiers",cc:4,gen:tvi},
   {t:"la rédaction complète, sur papier",cc:8,gen:redacTVI}]},
 {id:"AN11",t:"Image d'un segment : minimum et maximum",tache:"image d'un segment",th:"continuite",ex:"cc2",pts:2,lecons:[],
  paliers:[{t:"un polynôme sur un segment",cc:4,gen:imageSeg}]},
 {id:"AN12",t:"Dérivabilité en un point",tache:"dérivabilité en un point",th:"derivabilite",ex:"cc2",pts:3,lecons:[],
  paliers:[
   {t:"dérivées à gauche et à droite",cc:4,gen:derivPoint},
   {t:"trouver a et b pour qu'elle soit dérivable",cc:4,gen:abDeriv}]},
 {id:"AN13",t:"Tangente en un point",tache:"tangente en un point",th:"derivabilite",ex:"cc2",pts:2,lecons:[],
  paliers:[{t:"l'équation y = mx + p",cc:3,gen:tangente}]},
 {id:"AN14",t:"Rolle et accroissements finis",tache:"accroissements finis",th:"derivabilite",ex:"cc2",pts:2,lecons:[],
  paliers:[
   {t:"trouver le c du théorème",cc:3,gen:taf},
   {t:"une inégalité des accroissements finis, sur papier",cc:6,min:15,gen:iaf}]},
 {id:"AN15",t:"Bijection et réciproque",tache:"bijection et réciproque",th:"continuite",ex:"cc2",pts:2,lecons:[],
  paliers:[{t:"la bijection, puis g(y₀) et g′(y₀)",cc:4,gen:reciproque}]},
 {id:"AQ3",t:"Connaissance du cours : continuité et dérivabilité",th:"continuite",ex:"cc2",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:4,gen:coursCC2}]}
]);
})();
