/* Générateurs d'Algo (CC2 : prouver une boucle, compter, complexité).
   Un programme est un petit arbre : le même arbre est affiché dans le pseudo-code du cours et exécuté pour calculer la correction. */
(function(){
"use strict";
const G=window.GEN,O=G.outils,{propre,nombre}=O;
const fx=s=>s.replace(/&[a-z]+;/g,"x").replace(/[_{}]/g,"").length>30||s.length>36?O.f(s):O.fx(s);
const h=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];
const ent=x=>x<0?"−"+(-x):String(x);
/* k fois la somme 1 + 2 + … + x, écrit le plus simplement : 2 × x(x + 1)/2 devient x(x + 1) */
const kTri=(k,x)=>k%2?`${k===1?"":k}${x}(${x} + 1)/2`:`${k===2?"":k/2}${x}(${x} + 1)`;
const fxs=t=>t.split(", c'est-à-dire ").map(x=>fx(h(x))).join(", c'est-à-dire ");
/* une formule tapée : exposants écrits en petit (2ⁿ, n⁴), « Tₙ = » ou « F(n) = » recopié devant, log₂ */
const PETITS={"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","ⁿ":"n","⁺":"+","⁻":"-","⁽":"(","⁾":")"};
const sansNom=s=>String(s==null?"":s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻⁽⁾]+/g,m=>"^("+[...m].map(c=>PETITS[c]).join("")+")").replace(/^\s*[A-Za-z][\w₀-ₜ]*\s*(\(\s*[a-z]\s*\)|\{\s*[a-z]\s*\})?\s*=(?!=)\s*/,"").replace(/log\s*(?:_\s*\{?\s*2\s*\}?|₂)/gi,"log2");
const lisF=s=>sansNom(s).replace(/log2\s*([a-z])\b/g,"log2($1)").replace(/log\s*([a-z])\b/g,"log($1)").replace(/log2\s*\(([^()]*)\)/g,"(log($1)/log(2))");
const calc=(s,v)=>O.calcule(lisF(s),v);
/* un ordre de complexité : θ( … ) recopié autour, et tous les logarithmes se valent */
const lisOrdre=s=>{let t=sansNom(s).trim();const m=/^(?:θ|Θ|O|[Tt]h?[eé]ta)\s*\((.*)\)$/.exec(t);if(m)t=m[1];return t.replace(/log2(?=\s*[(a-z])/g,"log");};

/* ---------- le mini-langage ---------- */
/* expression : un entier, un nom de variable, ou [opérateur, gauche, droite] */
const CALC={"+":(a,b)=>a+b,"-":(a,b)=>a-b,"*":(a,b)=>a*b,"div":(a,b)=>Math.floor(a/b),"mod":(a,b)=>((a%b)+b)%b,"<":(a,b)=>a<b,"≤":(a,b)=>a<=b,">":(a,b)=>a>b,"≥":(a,b)=>a>=b,"=":(a,b)=>a===b,"≠":(a,b)=>a!==b,"et":(a,b)=>a&&b,"ou":(a,b)=>a||b};
const PRIO={"*":3,"div":3,"mod":3,"+":2,"-":2,"et":0.6,"ou":0.5};
const vaut=(e,env)=>typeof e==="number"?e:typeof e==="string"?env[e]:CALC[e[0]](vaut(e[1],env),vaut(e[2],env));
function ecrit(e,par,dr){if(typeof e!=="object")return String(e);if(e[0]==="appel")return `${e[1]}(${e.slice(2).map(a=>ecrit(a)).join(", ")})`;const q=PRIO[e[0]]||1,p=par?PRIO[par]||1:0,s=`${ecrit(e[1],e[0])} ${e[0]} ${ecrit(e[2],e[0],true)}`;
  return q<p||(dr&&q===p&&(par==="-"||par==="div"||par==="mod"||e[0]==="div"||e[0]==="mod"))?`(${s})`:s;}
/* instructions */
const aff=(v,e)=>({k:"aff",v,e}),pour=(v,a,b,c)=>({k:"pour",v,a,b,c}),tq=(cond,c)=>({k:"tq",cond,c}),si=(cond,alors,sinon)=>({k:"si",cond,alors,sinon:sinon||null}),ret=e=>({k:"ret",e});
function lignes(C,niv){const L=[],I="    ".repeat(niv);C.forEach(s=>{
  if(s.k==="aff")L.push(`${I}${s.v} ← ${ecrit(s.e)}`);
  else if(s.k==="pour")L.push(`${I}pour ${s.v} de ${ecrit(s.a)} à ${ecrit(s.b)} faire`,...lignes(s.c,niv+1),`${I}fin pour;`);
  else if(s.k==="tq")L.push(`${I}tant que ${ecrit(s.cond)} faire`,...lignes(s.c,niv+1),`${I}fin tq;`);
  else if(s.k==="si"){L.push(`${I}si ${ecrit(s.cond)} alors`,...lignes(s.alors,niv+1));if(s.sinon)L.push(`${I}sinon`,...lignes(s.sinon,niv+1));L.push(`${I}fin si;`);}
  else if(s.k==="ecrire")L.push(`${I}affiche(${ecrit(s.e)})`);
  else if(s.k==="ligne")L.push(`${I}aLaLigne()`);
  else if(s.k==="appelS")L.push(`${I}${s.nom}(${s.args.map(a=>ecrit(a)).join(", ")})`);
  else L.push(`${I}Renvoyer ${ecrit(s.e)}`);});return L;}
const texteProg=P=>[P.proc?`PROCÉDURE : ${P.nom} (${P.params.map(p=>`E ${p} : entier`).join(", ")})`:`FONCTION : ${P.nom} (${P.params.map(p=>`E ${p} : entier`).join(", ")}) : entier`].concat(P.vars.length?[`Variable : ${P.vars.join(", ")} : entier`]:[],["DÉBUT",...lignes(P.corps,1),"FIN"]).join("\n");
const code=t=>window.W&&window.W.code?window.W.code(t,"pseudo"):`<pre>${h(t)}</pre>`;
/* la première boucle du programme, et les variables qu'elle modifie (sans les compteurs des boucles pour) */
const boucleDe=P=>P.corps.find(s=>s.k==="pour"||s.k==="tq");
function colonnes(P){const V=new Set(),vu=C=>C.forEach(s=>{if(s.k==="aff")V.add(s.v);else if(s.k==="si"){vu(s.alors);if(s.sinon)vu(s.sinon);}else if(s.c)vu(s.c);});vu(boucleDe(P).c);return P.vars.filter(v=>V.has(v));}
/* exécution : valeur renvoyée, et trace de la première boucle (une ligne avant, puis une par tour) */
function execute(P,args,suivi){const env={},T=[];P.params.forEach((p,i)=>{env[p]=args[i];});let tours=0,vue=false,test=null;
  const photo=()=>T.push(suivi.map(v=>env[v]));
  function run(C,niv){for(const s of C){
    if(s.k==="aff")env[s.v]=vaut(s.e,env);
    else if(s.k==="ret")return {r:vaut(s.e,env)};
    else if(s.k==="si"){const r=run(vaut(s.cond,env)?s.alors:(s.sinon||[]),niv);if(r)return r;}
    else{const suivie=niv===0&&!vue;if(suivie){vue=true;photo();}
      const tour=()=>{const r=run(s.c,niv+1);if(suivie)photo();if(++tours>5000)throw new Error("boucle sans fin");return r;};
      if(s.k==="pour"){const a=vaut(s.a,env),b=vaut(s.b,env);for(let i=a;i<=b;i++){env[s.v]=i;const r=tour();if(r)return r;}}
      else{while(vaut(s.cond,env)){const r=tour();if(r)return r;}if(suivie)test=Object.assign({},env);}}}
    return null;}
  const r=run(P.corps,0);return {ret:r?r.r:undefined,T,env,sortie:test};}

/* ---------- AG1 : la trace d'une boucle ---------- */
const tableTrace=(cols,T,surligne)=>`<div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th></th>${cols.map(v=>`<th class="var">${v}</th>`).join("")}</tr></thead><tbody>${T.map((L,r)=>`<tr${r===surligne?' class="on"':""}><td>${r?"fin du tour "+r:"avant la boucle"}</td>${L.map(x=>`<td>${ent(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
function entier(s){const x=nombre(s);return x&&x.d===1?x.n:null;}
/* o : {P, args, formule:{t, tape, why}} */
function traceExo(o){const P=o.P,cols=o.cols||colonnes(P),B=boucleDe(P),X=execute(P,o.args,cols),T=X.T,N=T.length-1,appel=`${P.nom}(${o.args.map(ent).join(", ")})`,imb=B.c.some(s=>s.k==="pour"||s.k==="tq");
  const recit=k=>cols.map((v,j)=>T[k][j]===T[k-1][j]?`${v} reste à ${ent(T[k][j])}`:`${v} passe de ${ent(T[k-1][j])} à ${ent(T[k][j])}`).join(", ");
  const arret=B.k==="pour"?`La boucle fait un tour pour chaque valeur de ${B.v}, de ${ecrit(B.a)} à ${ecrit(B.b)} : ici de ${ent(vaut(B.a,X.env))} à ${ent(vaut(B.b,X.env))}, soit ${N} ${N>1?"tours":"tour"}.`:`La condition « ${h(ecrit(B.cond))} » est testée avant chaque tour. Après le tour ${N}, elle est fausse (${cols.map((v,j)=>`${v} = ${ent(T[N][j])}`).join(", ")}) : la boucle s'arrête.`;
  const E=[{w:`Avant la boucle : ${cols.map((v,j)=>fx(`${v} = ${ent(T[0][j])}`)).join(", ")}.`,why:`Ce sont les valeurs données par les lignes écrites avant la boucle${imb?"":`, avec ${fx(`${P.params[0]} = ${ent(o.args[0])}`)}`}.`,pts:0.5},
    {w:`La trace : ${tableTrace(cols,T,-1)}`,why:[...Array(Math.min(N,3))].map((_,k)=>`Tour ${k+1}${B.k==="pour"?` (${B.v} = ${ent(vaut(B.a,X.env)+k)})`:""} : ${recit(k+1)}.`).join(" ")+(N>3?" Et ainsi de suite : à chaque tour, on repart des valeurs de la ligne du dessus.":""),pts:2},
    {w:`La boucle s'arrête après <b>${N} ${N>1?"tours":"tour"}</b>.`,why:arret,pts:0.5},
    {w:`<b>${fx(`${appel} = ${ent(X.ret)}`)}</b>`,why:`La dernière ligne renvoie la valeur de ${fx(ecrit(P.corps[P.corps.length-1].e))} à la fin de la boucle.`,pts:0.5}];
  const F=o.formule,NS=[0,1,2,3,4,5,6,7,8].filter(n=>n>=(o.nmin||0)),valF=n=>execute(P,[n],cols).ret;
  if(F){const j=Math.max(0,cols.indexOf(P.corps[P.corps.length-1].e));E.push({w:`Pour un entier n quelconque : <b>${fx(`${P.nom}(n) = ${F.t}`)}</b>.`,why:F.why.replace("§",T.slice(1).map(r=>ent(r[j])).join(", ")),pts:1});}
  function juge(rep){let L=(rep.t||[]).map(r=>r.map(x=>propre(x)));while(L.length>1&&L[L.length-1].every(x=>!x))L.pop();
    if(!L.length||L[0].some(x=>!x))return {incomplet:"Remplis d'abord la ligne « avant la boucle »."};
    for(let r=0;r<L.length;r++)for(const x of L[r]){if(!x)return {incomplet:`Il reste une case vide à la ligne « ${r?"fin du tour "+r:"avant la boucle"} ». Si la boucle a fait moins de tours, enlève la dernière ligne.`};if(entier(x)===null)return {incomplet:"Dans le tableau, chaque case contient un nombre entier."};}
    const rv=entier(rep.r);if(rv===null)return {incomplet:"Écris aussi la valeur renvoyée : un nombre entier."};
    let fv=null;if(F){if(!propre(rep.f))return {incomplet:`Écris aussi la formule : ce que renvoie ${P.nom}(n), avec la lettre n.`};fv=NS.map(n=>calc(rep.f,{n}));if(fv.some(v=>v===null||!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à lire la formule. Écris-la avec la lettre n, par exemple n(n+1)/2 ou 2^n."};}
    const V=L.map(r=>r.map(entier));
    for(let r=0;r<Math.min(V.length,T.length);r++){const K=cols.map((_,j)=>j).filter(j=>V[r][j]!==T[r][j]);if(!K.length)continue;
      return {ok:false,faux:K.map(j=>`t:${r}:${j}`),resume:`Pas tout à fait : la ligne « ${r?"fin du tour "+r:"avant la boucle"} » est à revoir.`,diag:r?{etape:1,type:"calcul d'un tour de boucle",titre:`Où ça part : le tour ${r}.`,msg:`Au tour ${r}, ${recit(r)}. On repart toujours des valeurs de la ligne du dessus, et les lignes de la boucle s'exécutent dans l'ordre.`}:{etape:0,type:"valeurs avant la boucle",titre:"Où ça part : avant la boucle.",msg:`Avant le premier tour : ${cols.map((v,j)=>fx(`${v} = ${ent(T[0][j])}`)).join(", ")}.`}};}
    if(V.length!==T.length)return {ok:false,faux:[],resume:`Pas tout à fait : la boucle ne fait pas ${V.length-1} ${V.length>2?"tours":"tour"}.`,diag:{etape:2,type:V.length>T.length?"un tour de trop":"un tour manquant",titre:"Où ça part : le nombre de tours.",msg:arret}};
    if(rv!==X.ret)return {ok:false,faux:["r"],resume:"Pas tout à fait : la trace est juste, mais pas la valeur renvoyée.",diag:{etape:3,type:"valeur renvoyée",titre:"Où ça part : la dernière ligne.",msg:`La fonction renvoie ${fx(ecrit(P.corps[P.corps.length-1].e))}, calculé avec les valeurs de la dernière ligne de la trace : ${ent(X.ret)}.`}};
    if(F&&!NS.every((n,i)=>Math.abs(fv[i]-valF(n))<1e-9)){const n=NS.find((n,i)=>Math.abs(fv[i]-valF(n))>=1e-9);
      return {ok:false,faux:["f"],resume:"Pas tout à fait : la trace est juste, mais pas la formule.",diag:{etape:4,type:"formule de ce que calcule la fonction",titre:"Où ça part : la formule.",msg:`Pour n = ${n}, ta formule donne ${String(Math.round(fv[NS.indexOf(n)]*1000)/1000).replace(".",",")}, alors que ${P.nom}(${n}) renvoie ${ent(valF(n))}.`}};}
    return {ok:true};}
  const bonT=T.map(r=>r.map(String)),fausse=T.map(r=>r.map(String));fausse[N][0]=String(T[N][0]+1);
  const champs=[{k:"trace",id:"t",vars:cols,lignes:2},{k:"champ",id:"r",nom:"valeur renvoyée",label:"Valeur renvoyée :",ex:"un entier"}];
  if(F)champs.push({k:"champ",id:"f",nom:"formule",label:`Pour un entier n quelconque, $${P.nom}(n) =$`,ex:"une formule avec n",sym:[["n","n"],["^","^"],["/","/"],["(","("],[")",")"]]});
  return {sig:"TR"+texteProg(P).replace(/\s+/g," ")+"|"+o.args.join(","),
    q:`Voici une fonction écrite dans le pseudo-code du cours. On calcule ${fx(appel)}. Remplis la trace : la valeur ${o.cols?"de "+et(cols):"de chaque variable"} avant la boucle, puis à la fin de chaque tour de la boucle${imb?" extérieure (celle de "+(B.v||"la première ligne « tant que »")+")":""}.${o.cache?" "+o.cache:""} Ajoute une ligne par tour, puis donne la valeur renvoyée.${F?` Enfin, donne ce que renvoie ${P.nom}(n) pour un entier n quelconque.`:""}`,
    corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(3,-1).map(x=>x.trim()).join(" ; ")} — trace de ${appel}${F?", puis formule en n":""}`,champs,juge,etapes:E,
    bonne:`${fx(`${appel} = ${ent(X.ret)}`)}, après ${N} ${N>1?"tours":"tour"}${F?` ; ${fx(`${P.nom}(n) = ${F.t}`)}`:""}`,bonneTxt:`${appel} = ${ent(X.ret)}, après ${N} ${N>1?"tours":"tour"}${F?` ; ${P.nom}(n) = ${F.t}`:""}`,
    repBonne:Object.assign({t:bonT,r:String(X.ret)},F?{f:F.tape}:{}),repFausse:Object.assign({t:fausse,r:String(X.ret)},F?{f:F.tape}:{}),nature:o.nature,ens:{P,args:o.args,cols,nmin:o.nmin||0}};}

const NOMS=["F","G","H","Calc","Somme","Mystere"];
const prog=(R,vars,corps)=>({nom:R.choix(NOMS),params:["n"],vars,corps});
/* palier 1 : une boucle pour, une variable */
function pourSimple(R){for(;;){const k=R.ent(2,4),c0=R.ent(0,5),a=R.choix([1,1,1,0,2]),n=R.ent(3,5),t=R.ent(0,8);
  const M=[["s",c0,["+","s","i"]],["s",c0,["+","s",["*",k,"i"]]],["s",c0,["+","s",k]],["s",c0,["+","s",["*","i","i"]]],["p",1,["*","p",k]],["p",1,["*","p","i"]],["s",c0+10,["-","s","i"]],["s",c0,["+",["*",2,"s"],1]],["s",c0,["+","s",["-",["*",2,"i"],1]]]][t];
  if(M[0]==="p"&&M[2][2]==="i"&&a===0)continue;
  return traceExo({P:prog(R,[M[0],"i"],[aff(M[0],M[1]),pour("i",a,"n",[aff(M[0],M[2])]),ret(M[0])]),args:[n],nature:"pour"});}}
/* palier 2 : une boucle tant que, deux variables */
function tantQue(R){for(;;){const t=R.ent(0,3),b=R.choix([2,3,10]),k=R.ent(2,4);let P,n;
  if(t===0){n=b===10?R.ent(100,99999):b===3?R.ent(20,400):R.ent(9,90);P=prog(R,["c","m"],[aff("c",R.choix([0,1])),aff("m","n"),tq(["≥","m",b],[aff("m",["div","m",b]),aff("c",["+","c",1])]),ret("c")]);}
  else if(t===1){n=R.ent(5,14);P=prog(R,["x","y"],[aff("x",0),aff("y","n"),tq([">","y",0],[aff("x",["+","x","y"]),aff("y",["-","y",k])]),ret("x")]);}
  else if(t===2){n=R.ent(8,120);const bb=R.choix([2,3]);P=prog(R,["p","e"],[aff("p",1),aff("e",0),tq(["<","p","n"],[aff("p",["*","p",bb]),aff("e",["+","e",1])]),ret("e")]);}
  else{n=R.ent(6,20);P=prog(R,["a","b"],[aff("a","n"),aff("b",R.ent(0,3)),tq([">","a","b"],[aff("a",["-","a",k]),aff("b",["+","b",1])]),ret(["+","a","b"])]);}
  const N=execute(P,[n],colonnes(P)).T.length-1;if(N>=2&&N<=6)return traceExo({P,args:[n],nature:"tant que"});}}
/* palier 3 : un si dans la boucle */
function avecSi(R){for(;;){const t=R.ent(0,2),n=R.ent(4,6),m=R.choix([2,2,3]),r0=R.ent(0,m-1),U=[["+","s","i"],["-","s",1],["+","s",1],["*","s",2],["-","s","i"],["+","s",["*",2,"i"]]];let P,arg=n;
  if(t===0){const u1=R.choix(U),u2=R.choix(U.filter(x=>x!==u1));P=prog(R,["s","i"],[aff("s",R.ent(0,3)),pour("i",1,"n",[si(["=",["mod","i",m],r0],[aff("s",u1)],[aff("s",u2)])]),ret("s")]);}
  else if(t===1){arg=R.ent(5,40);P=prog(R,["x","c"],[aff("x","n"),aff("c",0),tq(["≠","x",1],[si(["=",["mod","x",2],0],[aff("x",["div","x",2])],[aff("x",["+","x",R.choix([1,3])])]),aff("c",["+","c",1])]),ret("c")]);}
  else{const seuil=R.ent(3,9);P=prog(R,["s","c","i"],[aff("s",0),aff("c",0),pour("i",1,"n",[aff("s",["+","s","i"]),si([">","s",seuil],[aff("c",["+","c",1])])]),ret(R.choix(["c",["+","s","c"]]))]);}
  let N;try{N=execute(P,[arg],colonnes(P)).T.length-1;}catch(e){continue;}if(N>=3&&N<=6)return traceExo({P,args:[arg],nature:"si"});}}
/* palier 4 : deux boucles imbriquées, la trace suit la boucle extérieure */
function imbriquees(R){const t=R.ent(0,4),n=R.ent(3,4),k=R.ent(1,3),plus=x=>aff("c",["+","c",x]);let P;
  if(t===0)P=prog(R,["c","i","j"],[aff("c",0),pour("i",1,"n",[pour("j",1,"i",[plus(k)])]),ret("c")]);
  else if(t===1)P=prog(R,["c","i","j"],[aff("c",R.ent(0,2)),pour("i",1,"n",[pour("j",1,"n",[plus(R.choix(["j","i",1,k]))])]),ret("c")]);
  else if(t===2)P=prog(R,["c","i","j"],[aff("c",0),pour("i",1,"n",[pour("j","i","n",[plus(R.choix([1,"j"]))])]),ret("c")]);
  else if(t===3)return traceExo({P:prog(R,["c","x","i"],[aff("c",0),aff("x",0),pour("i",1,R.choix(["n",["+","n",2]]),[aff("x","i"),tq([">","x",0],[aff("x",["div","x",2]),plus(1)])]),ret("c")]),args:[n],nature:"imbriquées",cols:["c"],cache:"La colonne de x n'est pas demandée : à la fin de chaque tour, la boucle « tant que » l'a ramené à 0."});
  else P=prog(R,["c","d","i","j"],[aff("c",0),aff("d",R.ent(0,2)),pour("i",1,"n",[aff("d",["+","d",k]),pour("j",1,"d",[plus(1)])]),ret("c")]);
  return traceExo({P,args:[n],nature:"imbriquées"});}
/* palier 5 : comme au CC, la trace puis « que calcule-t-elle ? » */
function avecFormule(R){const t=R.ent(0,9),n=R.ent(3,5),k=R.ent(2,5),c0=R.ent(1,6);let P,F;
  const PAS=`À chaque tour, la valeur augmente de la même façon : on le voit dans la trace, puis on le démontrerait avec un invariant de boucle.`;
  if(t===0){P=prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s","i"])]),ret("s")]);F={t:"n(n + 1)/2",tape:"n(n+1)/2",why:"La fonction additionne 1 + 2 + … + n. Cette somme vaut n(n + 1)/2. La trace donne § : à la fin du tour i, s vaut i(i + 1)/2."};}
  else if(t===1){P=prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["-",["*",2,"i"],1]])]),ret("s")]);F={t:"n²",tape:"n^2",why:"La fonction additionne les n premiers nombres impairs : 1 + 3 + 5 + … La trace donne § : ce sont les carrés. À la fin du tour i, s vaut i²."};}
  else if(t===2){P=prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["*",2,"i"]])]),ret("s")]);F={t:"n(n + 1)",tape:"n(n+1)",why:"La fonction additionne 2 + 4 + … + 2n, c'est-à-dire 2 fois 1 + 2 + … + n, donc 2 × n(n + 1)/2. La trace donne § : à la fin du tour i, s vaut i(i + 1)."};}
  else if(t===3){const b=R.choix([2,3]);P=prog(R,["p","i"],[aff("p",1),pour("i",1,"n",[aff("p",["*","p",b])]),ret("p")]);F={t:`${b}ⁿ`,tape:`${b}^n`,why:`p est multiplié par ${b} à chaque tour, et il y a n tours : à la fin du tour i, p vaut ${b} puissance i.`};}
  else if(t===4){P=prog(R,["c","i","j"],[aff("c",0),pour("i",1,"n",[pour("j",1,"i",[aff("c",["+","c",1])])]),ret("c")]);F={t:"n(n + 1)/2",tape:"n(n+1)/2",why:"Au tour i de la boucle extérieure, la boucle intérieure ajoute 1 à c exactement i fois. Au total : 1 + 2 + … + n, c'est-à-dire n(n + 1)/2."};}
  else if(t===5){P=prog(R,["c","i","j"],[aff("c",0),pour("i",1,"n",[pour("j",1,"n",[aff("c",["+","c",k])])]),ret("c")]);F={t:`${k}n²`,tape:`${k}n^2`,why:`À chaque tour de la boucle extérieure, la boucle intérieure fait n tours et ajoute ${k} à chaque fois : c augmente de ${k}n. Il y a n tours extérieurs : ${k}n × n.`};}
  else if(t===6){P=prog(R,["x","y"],[aff("x",0),aff("y","n"),tq([">","y",0],[aff("x",["+","x",k]),aff("y",["-","y",1])]),ret("x")]);F={t:`${k}n`,tape:`${k}n`,why:`y part de n et perd 1 à chaque tour : la boucle fait n tours. À chaque tour, x gagne ${k}. ${PAS}`};}
  else if(t===7){P=prog(R,["s","i"],[aff("s",c0),pour("i",1,"n",[aff("s",["+","s",k])]),ret("s")]);F={t:`${k}n + ${c0}`,tape:`${k}n+${c0}`,why:`s part de ${c0} et gagne ${k} à chacun des n tours. ${PAS}`};}
  else if(t===8){P=prog(R,["a","b","i"],[aff("a",1),aff("b",0),pour("i",1,"n",[aff("b",["+","b","a"]),aff("a",["+","a",2])]),ret("b")]);F={t:"n²",tape:"n^2",why:"a prend les valeurs 1, 3, 5, … : les nombres impairs. b les additionne, et la trace donne § : ce sont les carrés. À la fin du tour i, a vaut 2i + 1 et b vaut i²."};}
  else{P=prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["*",k,"i"]])]),ret("s")]);F={t:kTri(k,"n"),tape:`${k}n(n+1)/2`,why:`La fonction additionne ${k} × 1 + ${k} × 2 + … + ${k} × n, c'est-à-dire ${k} fois 1 + 2 + … + n.`};}
  return traceExo({P,args:[n],formule:F,nature:"formule"});}

/* ---------- AG2 : équations d'itération et invariant ---------- */
/* un tour de boucle exécuté sur des valeurs données (sans Renvoyer) */
function unTour(C,env){C.forEach(s=>{if(s.k==="aff")env[s.v]=vaut(s.e,env);else if(s.k==="si"){unTour(vaut(s.cond,env)?s.alors:(s.sinon||[]),env);}});return env;}
const PREC="ᵢ₋₁",LETTRES=["q","r"];
/* o : {P, V:[{v, ei, eiTape, ferme, fermeTape}], demandeEI, pq (pourquoi la formule), nature} ; i est le numéro du tour */
function iteration(o){const P=o.P,B=boucleDe(P),cols=o.V.map(x=>x.v),NN=7,X=execute(P,[NN],cols),T=X.T,KS=[...Array(T.length).keys()];
  const versCalc=src=>{let t=String(src||"").replace(/\s+/g,"");o.V.forEach((x,j)=>{t=t.replace(new RegExp(x.v+"(?:ᵢ₋₁|_?\\{?\\(?i[-−]1\\)?\\}?)","g"),"("+LETTRES[j]+")");});return t;};
  const ESS=[];for(const i of [1,2,5])for(const a of [0,3,-2])for(const b of [1,4])ESS.push({i,a,b});
  const apres=(e,j)=>{const env={n:NN};env[B.v||"i"]=e.i;cols.forEach((v,k)=>{env[v]=k?e.b:e.a;});if(B.k==="pour")env[B.v]=e.i;return unTour(B.c,env)[cols[j]];};
  const depart=v=>{const s=P.corps.find(x=>x.k==="aff"&&x.v===v);return s&&typeof s.e!=="number"?ecrit(s.e):null;},avecN=JSON.stringify(P.corps.filter(s=>s.k==="aff").concat(B.c)).includes('"n"');
  const ind=(v,t)=>`${v}_{${t}}`,dep=cols.map((v,j)=>`${ind(v,0)} = ${depart(v)||ent(T[0][j])}`).join(", ");
  const E=[{w:`Équations d'itération : ${fx(dep)}, puis ${o.V.map(x=>fx(`${ind(x.v,"i")} = ${x.ei}`)).join(" et ")} pour ${fx("i ≥ 1")}.`,why:`On note ${fx(ind(cols[0],"i"))} la valeur de ${cols[0]} à la fin du tour numéro i, et ${fx(ind(cols[0],0))} sa valeur avant la boucle. On lit la ligne de la boucle : à gauche de la flèche, la nouvelle valeur ; à droite, les valeurs du tour d'avant.`,pts:1},
    {w:`Les premières valeurs${avecN?`, par exemple pour n = ${NN}`:""} : ${tableTrace(cols.map(v=>v),T.slice(0,5),-1)}`,why:`On applique les équations d'itération, un tour après l'autre : c'est la trace. Elle sert à deviner la formule.`,pts:0.5},
    {w:`<b>${o.V.map(x=>fx(`${ind(x.v,"i")} = ${x.ferme}`)).join(" et ")}</b>`,why:`${o.pq} C'est l'invariant de boucle : on le démontre par récurrence sur i, avec les équations d'itération.`,pts:1.5}];
  function juge(rep){const F=[];let d=null;
    if(o.demandeEI)for(let j=0;j<o.V.length;j++){const src=rep["e"+j];if(!propre(src))return {incomplet:`Écris l'équation d'itération de ${cols[j]} : ce que vaut ${cols[j]} à la fin du tour i, avec sa valeur du tour d'avant.`};
      const W=ESS.map(e=>calc(versCalc(src),{i:e.i,n:NN,q:e.a,r:e.b}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:`Je n'arrive pas à lire l'équation d'itération. Utilise le bouton ${cols[j]}${PREC} pour la valeur du tour d'avant, et la lettre i.`};
      if(!ESS.every((e,k)=>Math.abs(W[k]-apres(e,j))<1e-9)){F.push("e"+j);if(!d)d={etape:0,type:"équation d'itération",titre:"Où ça part : l'équation d'itération.",msg:`La ligne de la boucle donne ${fx(`${ind(cols[j],"i")} = ${o.V[j].ei}`)} : la valeur d'avant est ${fx(ind(cols[j],"i − 1"))}, la nouvelle est ${fx(ind(cols[j],"i"))}.`};}}
    for(let j=0;j<o.V.length;j++){const src=rep["f"+j];if(!propre(src))return {incomplet:`Écris la formule de ${cols[j]} à la fin du tour i, avec la lettre i.`};
      const W=KS.map(k=>calc(src,{i:k,n:NN}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à lire la formule. Écris-la avec la lettre i, par exemple 3i + 2, i(i+1)/2 ou 2^i."};
      if(KS.every(k=>Math.abs(W[k]-T[k][j])<1e-9))continue;F.push("f"+j);if(d)continue;
      const dec=KS.slice(0,-1).every(k=>Math.abs(W[k]-T[k+1][j])<1e-9)||KS.slice(1).every(k=>Math.abs(W[k]-T[k-1][j])<1e-9),k=KS.find(k=>Math.abs(W[k]-T[k][j])>=1e-9);
      d=dec?{etape:2,type:"formule décalée d'un tour",titre:"Où ça part : le numéro du tour.",msg:`Ta formule est décalée d'un tour. ${fx(ind(cols[j],"i"))} est la valeur à la fin du tour i, et ${fx(ind(cols[j],0))} la valeur avant la boucle : ici ${fx(`${ind(cols[j],0)} = ${ent(T[0][j])}`)}.`}
        :{etape:2,type:"formule du terme de rang i",titre:"Où ça part : la formule.",msg:`Pour i = ${k}, ta formule donne ${String(Math.round(W[k]*1000)/1000).replace(".",",")}, alors que la trace donne ${fx(`${ind(cols[j],k)} = ${ent(T[k][j])}`)}.`};}
    if(!F.length)return {ok:true};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.some(x=>x[0]==="e")&&F.some(x=>x[0]==="f")?"l'équation d'itération et la formule sont à revoir":F[0][0]==="e"?"l'équation d'itération est à revoir":"la formule est à revoir"}.`,diag:d};}
  const champs=[],bon={},faux={};
  o.V.forEach((x,j)=>{if(o.demandeEI){champs.push({k:"champ",id:"e"+j,nom:`équation d'itération de ${x.v}`,label:`Équation d'itération : $${ind(x.v,"i")} =$`,ex:`avec ${x.v}${PREC} et i`,sym:[[x.v+PREC,x.v+PREC],["i","i"]]});bon["e"+j]=x.eiTape;faux["e"+j]=x.eiTape;}});
  o.V.forEach((x,j)=>{champs.push({k:"champ",id:"f"+j,nom:`formule de ${x.v}`,label:`À la fin du tour i : $${ind(x.v,"i")} =$`,ex:"une formule avec i",sym:j===o.V.length-1?[["i","i"],["n","n"],["^","^"],["/","/"],["(","("],[")",")"]]:null});bon["f"+j]=x.fermeTape;faux["f"+j]="("+x.fermeTape+")+i";});
  return {sig:"IT"+texteProg(P).replace(/\s+/g," ")+(o.demandeEI?"E":""),
    q:`Voici une fonction écrite dans le pseudo-code du cours. On note ${o.V.map(x=>fx(ind(x.v,"i"))).join(" et ")} ${o.V.length>1?"les valeurs":"la valeur"} de ${et(cols)} à la fin du tour numéro i de la boucle, et ${o.V.map(x=>fx(ind(x.v,0))).join(" et ")} ${o.V.length>1?"leurs valeurs":"sa valeur"} avant la boucle. ${o.demandeEI?"Écris l'équation d'itération, puis donne":"Donne"} ${o.V.length>1?"les formules":"la formule"} qui ${o.V.length>1?"donnent":"donne"} ${o.V.map(x=>fx(ind(x.v,"i"))).join(" et ")} en fonction de i.`,
    corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(3,-1).map(x=>x.trim()).join(" ; ")} — ${o.demandeEI?"équation d'itération et ":""}formule de ${cols.join(", ")} à la fin du tour i`,champs,juge,etapes:E,
    bonne:o.V.map(x=>fx(`${ind(x.v,"i")} = ${x.ferme}`)).join(" et "),bonneTxt:o.V.map(x=>`${x.v}_i = ${x.ferme}`).join(" et "),repBonne:bon,repFausse:faux,nature:o.nature,ens:{P,cols,NN,type:"iter",ei:o.demandeEI}};}
/* les familles : programme, équation d'itération, formule, et la preuve (pour le palier sur papier) */
function famille(R,sorte){const k=R.ent(2,5),c0=R.ent(0,6),t=R.ent(0,9);
  if(sorte==="lin"){if(R()<0.5)return {P:prog(R,["s","i"],[aff("s",c0),pour("i",1,"n",[aff("s",["+","s",k])]),ret("s")]),V:[{v:"s",ei:`s_{i−1} + ${k}`,eiTape:`s${PREC}+${k}`,ferme:c0?`${k}i + ${c0}`:`${k}i`,fermeTape:`${k}i+${c0}`,f0:String(c0),hyp:c0?`${k}(i − 1) + ${c0}`:`${k}(i − 1)`,calc:`${c0?`${k}(i − 1) + ${c0}`:`${k}(i − 1)`} + ${k}`}],pq:`s part de ${c0} et gagne ${k} à chaque tour : après i tours, il a gagné ${k}i.`,rend:c0?`${k}n + ${c0}`:`${k}n`,nature:"plus k"};
    const d0=c0+20;return {P:prog(R,["s","i"],[aff("s",d0),pour("i",1,"n",[aff("s",["-","s",k])]),ret("s")]),V:[{v:"s",ei:`s_{i−1} − ${k}`,eiTape:`s${PREC}-${k}`,ferme:`${d0} − ${k}i`,fermeTape:`${d0}-${k}i`,f0:String(d0),hyp:`${d0} − ${k}(i − 1)`,calc:`${d0} − ${k}(i − 1) − ${k}`}],pq:`s part de ${d0} et perd ${k} à chaque tour : après i tours, il a perdu ${k}i.`,rend:`${d0} − ${k}n`,nature:"moins k"};}
  if(sorte==="som"){const u=R.ent(0,8),c1=R.ent(1,6),k3=R.ent(3,5);
    if(u===0)return {P:prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s","i"])]),ret("s")]),V:[{v:"s",ei:"s_{i−1} + i",eiTape:`s${PREC}+i`,ferme:"i(i + 1)/2",fermeTape:"i(i+1)/2",f0:"0",hyp:"(i − 1)i/2",calc:"(i − 1)i/2 + i = i(i − 1 + 2)/2"}],pq:"s additionne 1 + 2 + … + i : la somme des i premiers entiers vaut i(i + 1)/2.",rend:"n(n + 1)/2",nature:"somme"};
    if(u===1)return {P:prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["-",["*",2,"i"],1]])]),ret("s")]),V:[{v:"s",ei:"s_{i−1} + 2i − 1",eiTape:`s${PREC}+2i-1`,ferme:"i²",fermeTape:"i^2",f0:"0",hyp:"(i − 1)²",calc:"(i − 1)² + 2i − 1 = i² − 2i + 1 + 2i − 1"}],pq:"s additionne les nombres impairs 1 + 3 + 5 + … : la trace donne les carrés 1, 4, 9, 16.",rend:"n²",nature:"impairs"};
    if(u===2)return {P:prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["*",2,"i"]])]),ret("s")]),V:[{v:"s",ei:"s_{i−1} + 2i",eiTape:`s${PREC}+2i`,ferme:"i(i + 1)",fermeTape:"i(i+1)",f0:"0",hyp:"(i − 1)i",calc:"(i − 1)i + 2i = i(i − 1 + 2)"}],pq:"s additionne 2 + 4 + … + 2i, c'est-à-dire 2 fois la somme 1 + 2 + … + i.",rend:"n(n + 1)",nature:"pairs"};
    if(u===3){const b=R.choix([2,3]),c=R.ent(1,4);return {P:prog(R,["p","i"],[aff("p",c),pour("i",1,"n",[aff("p",["*","p",b])]),ret("p")]),V:[{v:"p",ei:`${b} × p_{i−1}`,eiTape:`${b}*p${PREC}`,ferme:c===1?`${b}^{i}`:`${c} × ${b}^{i}`,fermeTape:`${c}*${b}^i`,f0:String(c),hyp:c===1?`${b}^{i−1}`:`${c} × ${b}^{i−1}`,calc:`${c===1?"":c+" × "}${b}^{i−1} × ${b}`}],pq:`p part de ${c} et il est multiplié par ${b} à chaque tour : après i tours, il a été multiplié par ${b} puissance i.`,rend:c===1?`${b}^{n}`:`${c} × ${b}^{n}`,nature:"puissance"};}
    if(u===4)return {P:prog(R,["s","i"],[aff("s",c1),pour("i",1,"n",[aff("s",["+","s","i"])]),ret("s")]),V:[{v:"s",ei:"s_{i−1} + i",eiTape:`s${PREC}+i`,ferme:`i(i + 1)/2 + ${c1}`,fermeTape:`i(i+1)/2+${c1}`,f0:String(c1),hyp:`(i − 1)i/2 + ${c1}`,calc:`(i − 1)i/2 + ${c1} + i = i(i − 1 + 2)/2 + ${c1}`}],pq:`s part de ${c1}, puis on lui ajoute 1, 2, …, i : la somme des i premiers entiers vaut i(i + 1)/2, et on n'oublie pas le ${c1} du départ.`,rend:`n(n + 1)/2 + ${c1}`,nature:"somme avec un départ"};
    if(u===5)return {P:prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+",["*",2,"s"],1])]),ret("s")]),V:[{v:"s",ei:"2 × s_{i−1} + 1",eiTape:`2*s${PREC}+1`,ferme:"2^{i} − 1",fermeTape:"2^i-1",f0:"0",hyp:"2^{i−1} − 1",calc:"2(2^{i−1} − 1) + 1 = 2^{i} − 2 + 1"}],pq:"La trace donne 0, 1, 3, 7, 15, 31 : chaque valeur est une puissance de 2 moins 1.",rend:"2^{n} − 1",nature:"double plus un"};
    if(u===6)return {P:prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s","n"])]),ret("s")]),V:[{v:"s",ei:"s_{i−1} + n",eiTape:`s${PREC}+n`,ferme:"i × n",fermeTape:"i*n",f0:"0",hyp:"(i − 1) × n",calc:"(i − 1) × n + n"}],pq:"À chaque tour, on ajoute n, qui ne change pas pendant la boucle : après i tours, s vaut i fois n. La formule contient donc i et n.",rend:"n²",nature:"ajoute n"};
    if(u===7)return {P:prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["+",["*",2,"i"],1]])]),ret("s")]),V:[{v:"s",ei:"s_{i−1} + 2i + 1",eiTape:`s${PREC}+2i+1`,ferme:"i(i + 2)",fermeTape:"i(i+2)",f0:"0",hyp:"(i − 1)(i + 1)",calc:"(i − 1)(i + 1) + 2i + 1 = i² − 1 + 2i + 1"}],pq:"La trace donne 3, 8, 15, 24 : chaque valeur est un carré moins 1, (i + 1)² − 1, c'est-à-dire i(i + 2).",rend:"n(n + 2)",nature:"impairs à partir de 3"};
    return {P:prog(R,["s","i"],[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["*",k3,"i"]])]),ret("s")]),V:[{v:"s",ei:`s_{i−1} + ${k3}i`,eiTape:`s${PREC}+${k3}i`,ferme:kTri(k3,"i"),fermeTape:`${k3}i(i+1)/2`,f0:"0",hyp:`${k3}(i − 1)i/2`,calc:`${k3}(i − 1)i/2 + ${k3}i = ${k3}i(i − 1 + 2)/2`}],pq:`s additionne ${k3} × 1 + ${k3} × 2 + … + ${k3} × i, c'est-à-dire ${k3} fois la somme 1 + 2 + … + i.`,rend:kTri(k3,"n"),nature:"k fois la somme"};}
  const u=R.ent(0,8);
  if(u===0)return {P:prog(R,["a","b","i"],[aff("a",1),aff("b",0),pour("i",1,"n",[aff("b",["+","b","a"]),aff("a",["+","a",2])]),ret("b")]),V:[{v:"a",ferme:"2i + 1",fermeTape:"2i+1",ei:"a_{i−1} + 2"},{v:"b",ferme:"i²",fermeTape:"i^2",ei:"b_{i−1} + a_{i−1}"}],pq:"a gagne 2 à chaque tour : il prend les valeurs impaires 1, 3, 5, … b les additionne, mais avec la valeur de a du tour d'avant, car la ligne de b est écrite en premier : 1, 4, 9, 16.",nature:"impairs et carrés"};
  if(u===1)return {P:prog(R,["a","b","i"],[aff("a",0),aff("b",0),pour("i",1,"n",[aff("a",["+","a",1]),aff("b",["+","b","a"])]),ret("b")]),V:[{v:"a",ferme:"i",fermeTape:"i",ei:"a_{i−1} + 1"},{v:"b",ferme:"i(i + 1)/2",fermeTape:"i(i+1)/2",ei:"b_{i−1} + a_{i−1} + 1"}],pq:"a compte les tours. b additionne la nouvelle valeur de a, car la ligne de a est écrite en premier : 1 + 2 + … + i.",nature:"compteur et somme"};
  if(u===2)return {P:prog(R,["x","y"],[aff("x",0),aff("y","n"),tq([">","y",0],[aff("x",["+","x",k]),aff("y",["-","y",1])]),ret("x")]),V:[{v:"x",ferme:`${k}i`,fermeTape:`${k}i`,ei:`x_{i−1} + ${k}`},{v:"y",ferme:"n − i",fermeTape:"n-i",ei:"y_{i−1} − 1"}],pq:`x gagne ${k} à chaque tour. y part de n et perd 1 à chaque tour : la formule de y contient n.`,nature:"monte et descend"};
  if(u===3)return {P:prog(R,["a","b","i"],[aff("a",1),aff("b",1),pour("i",1,"n",[aff("a",["*","a",2]),aff("b",["+","b","a"])]),ret("b")]),V:[{v:"a",ferme:"2^{i}",fermeTape:"2^i",ei:"2 × a_{i−1}"},{v:"b",ferme:"2^{i+1} − 1",fermeTape:"2^(i+1)-1",ei:"b_{i−1} + 2 × a_{i−1}"}],pq:"a double à chaque tour : 2, 4, 8, … b additionne 1 + 2 + 4 + … + 2 puissance i, ce qui fait 2 puissance (i + 1), moins 1 : la trace donne 3, 7, 15, 31.",nature:"puissances de 2"};
  if(u===4)return {P:prog(R,["x","y","i"],[aff("x",0),aff("y",0),pour("i",1,"n",[aff("x",["+","x","y"]),aff("y",["+","y",1])]),ret("x")]),V:[{v:"x",ferme:"i(i − 1)/2",fermeTape:"i(i-1)/2",ei:"x_{i−1} + y_{i−1}"},{v:"y",ferme:"i",fermeTape:"i",ei:"y_{i−1} + 1"}],pq:"y compte les tours. x ajoute l'ancienne valeur de y, car la ligne de x est écrite en premier : x vaut 0 + 1 + … + (i − 1), c'est-à-dire i(i − 1)/2. La trace donne 0, 0, 1, 3, 6.",nature:"somme décalée"};
  if(u===5)return {P:prog(R,["a","b","i"],[aff("a",0),aff("b",1),pour("i",1,"n",[aff("a",["+","a","b"]),aff("b",["*",2,"b"])]),ret("a")]),V:[{v:"a",ferme:"2^{i} − 1",fermeTape:"2^i-1",ei:"a_{i−1} + b_{i−1}"},{v:"b",ferme:"2^{i}",fermeTape:"2^i",ei:"2 × b_{i−1}"}],pq:"b double à chaque tour : 1, 2, 4, 8. a ajoute l'ancienne valeur de b, car la ligne de a est écrite en premier : 1 + 2 + … + 2 puissance (i − 1), ce qui fait 2 puissance i, moins 1. La trace donne 0, 1, 3, 7, 15.",nature:"somme de puissances de 2"};
  if(u===6)return {P:prog(R,["x","y"],[aff("x",0),aff("y","n"),tq([">","y",0],[aff("x",["+","x",k]),aff("y",["-","y",2])]),ret("x")]),V:[{v:"x",ferme:`${k}i`,fermeTape:`${k}i`,ei:`x_{i−1} + ${k}`},{v:"y",ferme:"n − 2i",fermeTape:"n-2i",ei:"y_{i−1} − 2"}],pq:`x gagne ${k} à chaque tour. y part de n et perd 2 à chaque tour : après i tours, il a perdu 2i.`,nature:"descend de 2"};
  if(u===7)return {P:prog(R,["a","b","i"],[aff("a",0),aff("b",0),pour("i",1,"n",[aff("a",["+","a",k]),aff("b",["+","b","a"])]),ret("b")]),V:[{v:"a",ferme:`${k}i`,fermeTape:`${k}i`,ei:`a_{i−1} + ${k}`},{v:"b",ferme:kTri(k,"i"),fermeTape:`${k}i(i+1)/2`,ei:`b_{i−1} + a_{i−1} + ${k}`}],pq:`a gagne ${k} à chaque tour : ${k}, ${2*k}, ${3*k}, … b additionne la nouvelle valeur de a, car la ligne de a est écrite en premier : ${k} × (1 + 2 + … + i).`,nature:"multiples et somme"};
  return {P:prog(R,["a","b","i"],[aff("a",0),aff("b",0),pour("i",1,"n",[aff("b",["+","b",["*",2,"a"]]),aff("a",["+","a",1])]),ret("b")]),V:[{v:"a",ferme:"i",fermeTape:"i",ei:"a_{i−1} + 1"},{v:"b",ferme:"i(i − 1)",fermeTape:"i(i-1)",ei:"b_{i−1} + 2 × a_{i−1}"}],pq:"a compte les tours. b ajoute deux fois l'ancienne valeur de a, car la ligne de b est écrite en premier : 2 × (0 + 1 + … + (i − 1)) = i(i − 1). La trace donne 0, 0, 2, 6, 12.",nature:"double de la somme décalée"};}
/* la preuve complète, avec la méthode en quatre étapes du cours */
function preuveBoucle(R){const o=famille(R,R()<0.35?"lin":"som"),x=o.V[0],v=x.v,ind=t=>`${v}_{${t}}`,P=o.P;
  const lignes=[[`Équations d'itération : ${fx(`${ind(0)} = ${x.f0}`)} et, pour ${fx("i ≥ 1")}, ${fx(`${ind("i")} = ${x.ei}`)}.`,`C'est la « vérité » : on la lit sur l'algorithme. ${fx(ind("i"))} est la valeur de ${v} à la fin de l'itération numéro i, ${fx(ind(0))} sa valeur au début des itérations.`,1],
    [`Invariant proposé : ${fx(`Inv_{i}`)} : « ${fx(`${ind("i")} = ${x.ferme}`)} ».`,`C'est l'« hypothèse à prouver ». On la trouve en faisant une trace.`,1],
    [`Initialisation : ${fx(`${ind(0)} = ${x.f0}`)} d'après les équations d'itération, et la formule donne bien ${x.f0} pour i = 0 : ${fx("Inv_{0}")} est vrai.`,`On vérifie l'invariant au début des itérations.`,0.5],
    [`Récurrence : si ${fx("Inv_{i−1}")} est vrai, avec ${fx("1 ≤ i ≤ n")}, alors ${fx(`${ind("i−1")} = ${x.hyp}`)}. Comme ${fx(`${ind("i")} = ${x.ei}`)}, on trouve ${fx(`${ind("i")} = ${x.calc}`)}, c'est-à-dire ${fx(x.ferme)} : ${fx("Inv_{i}")} est vrai.`,`On remplace ${fx(ind("i−1"))} par sa formule dans l'équation d'itération : c'est là que la « vérité » sert.`,1.5],
    [`Conclusion : l'invariant est vrai pour toutes les itérations. À la fin des n itérations, ${fx(`${ind("n")} = ${o.rend}`)} : la fonction renvoie bien ${fx(o.rend)}.`,`On écrit l'invariant pour i = n, la dernière itération : c'est la valeur renvoyée.`,1]];
  return {sig:"PB"+texteProg(P).replace(/\s+/g," "),q:`Démontre que, pour tout entier naturel n, ${fx(`${P.nom}(n)`)} renvoie ${fx(o.rend)}. Utilise la méthode du cours : équations d'itération, invariant de boucle, preuve par récurrence, conclusion.`,corps:code(texteProg(P)),
    texte:`${texteProg(P).split("\n").slice(3,-1).map(z=>z.trim()).join(" ; ")} — preuve que la fonction renvoie ${o.rend}`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),etapes:lignes.map(z=>({w:z[0],why:z[1],pts:z[2]})),
    bonne:"voir la rédaction",bonneTxt:`invariant ${v}_i = ${x.ferme}`,repBonne:{},nature:"preuve, "+o.nature,ens:{P,cols:[v],type:"preuve",ferme:x.fermeTape,NN:7}};}

/* ---------- AG5 : compter les opérations ---------- */
/* exécution en comptant comme le cours : 1 par affectation, par calcul, par comparaison, par appel ; rien pour la gestion du « pour » ni pour « Renvoyer » */
function compte(P,args,sansAff){let ops=0,prof=0;
  const val=(e,env)=>{if(typeof e==="number")return e;if(typeof e==="string")return env[e];
    if(e[0]==="appel"){ops++;const a=val(e[2],env);if(++prof>4000)throw new Error("trop d'appels");const r=lance({[P.params[0]]:a});prof--;return r;}
    ops++;return CALC[e[0]](val(e[1],env),val(e[2],env));};
  const run=(C,env)=>{for(const s of C){
    if(s.k==="aff"){env[s.v]=val(s.e,env);if(!sansAff)ops++;}
    else if(s.k==="ret")return {r:val(s.e,env)};
    else if(s.k==="si"){const r=run(val(s.cond,env)?s.alors:(s.sinon||[]),env);if(r)return r;}
    else if(s.k==="pour"){const a=vaut(s.a,env),b=vaut(s.b,env);for(let i=a;i<=b;i++){env[s.v]=i;const r=run(s.c,env);if(r)return r;}}
    else while(val(s.cond,env)){const r=run(s.c,env);if(r)return r;}}
    return null;};
  const lance=env=>{const r=run(P.corps,env);return r?r.r:undefined;};
  const env={};P.params.forEach((p,i)=>{env[p]=args[i];});const ret=lance(env);return {ret,ops};}
const NOMOP={"+":"l'addition","-":"la soustraction","*":"la multiplication","div":"la division entière","mod":"le reste",appel:"l'appel"};
const opsE=e=>typeof e!=="object"?[]:e[0]==="appel"?[NOMOP.appel].concat(opsE(e[2])):opsE(e[1]).concat([NOMOP[e[0]]||"la comparaison"],opsE(e[2]));
const pl=(n,m)=>`${n} ${m}${n>1?"s":""}`;
const PLUR={"l'addition":"additions","la soustraction":"soustractions","la multiplication":"multiplications","la division entière":"divisions entières","le reste":"restes","la comparaison":"comparaisons","l'appel":"appels","l'affectation":"affectations"};
const listeOps=L=>et([...new Set(L)].map(x=>{const n=L.filter(y=>y===x).length;return n>1?`${n} ${PLUR[x]}`:x;}));
const detail=s=>{const L=opsE(s.e).concat(["l'affectation"]);return `« ${s.v} ← ${ecrit(s.e)} » : ${pl(L.length,"opération")} (${listeOps(L)})`;};
const coutAff=s=>opsE(s.e).length+1,somme=C=>C.reduce((t,s)=>t+coutAff(s),0);
const poly=(T,lettre)=>T.filter(x=>x[0]).map((x,i)=>(i?" + ":"")+(x[1]?(x[0]===1&&x[1]!=="1"?"":x[0])+(x[1]==="1"?"":x[1]):x[0])).join("")||"0";
/* o : {P, lettre ("n" ou "p"), arg(k) (valeur de n pour la lettre), formule (affichée), tape, etapes, nature, piegeTest (coût du test, pour reconnaître l'oubli du dernier test)} */
function comptage(o){const P=o.P,L=o.lettre,KS=[0,1,2,3,4,5,6].filter(k=>k>=(o.kmin||0)),vrai=k=>compte(P,[o.arg(k)]).ops,nom=L==="n"?"T_{n}":"T";
  function juge(rep){if(!propre(rep.T))return {incomplet:`Écris le nombre d'opérations avec la lettre ${L}, par exemple 3${L} + 2.`};
    const W=KS.map(k=>calc(rep.T,{[L]:k}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:`Je n'arrive pas à lire cette formule. Écris-la avec la lettre ${L}, par exemple 3${L} + 2 ou 2${L}^2 + 1.`};
    if(KS.every((k,i)=>Math.abs(W[i]-vrai(k))<1e-9))return {ok:true};
    const comme=f=>KS.every((k,i)=>Math.abs(W[i]-f(k))<1e-9),k=KS.find((k,i)=>Math.abs(W[i]-vrai(k))>=1e-9);let d;
    if(comme(k=>compte(P,[o.arg(k)],true).ops))d={etape:0,type:"affectations non comptées",titre:"Où ça part : les affectations.",msg:"Une affectation (la flèche ←) compte pour 1 opération, en plus des calculs écrits à sa droite."};
    else if(o.piegeTest&&comme(k=>vrai(k)-o.piegeTest))d={etape:o.etapeTest,type:"dernier test du tant que oublié",titre:"Où ça part : le test de la boucle.",msg:"Le test du « tant que » est fait une fois de plus que le nombre de tours : la dernière fois, il est faux, et c'est lui qui fait sortir de la boucle."};
    else d={etape:o.etapes.length-1,type:"total des opérations",titre:"Où ça part : le total.",msg:`Pour ${L} = ${k}, ta formule donne ${String(Math.round(W[KS.indexOf(k)]*1000)/1000).replace(".",",")}. En comptant vraiment, on trouve ${vrai(k)} opérations.`};
    return {ok:false,faux:["T"],resume:"Pas tout à fait : ce n'est pas le bon nombre d'opérations.",diag:d};}
  return {sig:"CO"+texteProg(P).replace(/\s+/g," ")+L,
    q:`Voici une fonction écrite dans le pseudo-code du cours. Compte ses opérations élémentaires comme en cours : 1 pour chaque affectation, chaque calcul, chaque comparaison${o.appel?" et chaque appel":""}. ${L==="n"?`Donne le nombre d'opérations ${fx("T_{n}")} en fonction de n.`:`On suppose que n est une puissance de 2 : ${fx("n = 2^{p}")}. Donne le nombre d'opérations T en fonction de p.`}`,
    corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(P.vars.length?3:2,-1).map(x=>x.trim()).join(" ; ")} — nombre d'opérations en fonction de ${L}`,
    champs:[{k:"champ",id:"T",nom:"nombre d'opérations",label:`$${nom} =$`,ex:`une formule avec ${L}`,sym:[[L,L],["^","^"],["/","/"],["(","("],[")",")"]],aide:"La gestion du « pour » et la ligne « Renvoyer » ne comptent pas."}],juge,etapes:o.etapes,
    bonne:fx(`${nom} = ${o.formule}`),bonneTxt:`${L==="n"?"T_n":"T"} = ${o.formule}`,repBonne:{T:o.tape},repFausse:{T:"("+o.tape+")+"+L},nature:o.nature,ens:{P,type:"compte",lettre:L,args:KS.map(o.arg),ks:KS}};}
const CORPS=[()=>aff("s",["+","s","i"]),()=>aff("s",["+","s",["*",2,"i"]]),()=>aff("p",["*","p",2]),()=>aff("s",["+","s",["*","i","i"]]),()=>aff("c",["+","c",1]),()=>aff("s",["-",["*",3,"s"],"i"])];
const INIT={s:0,p:1,c:0};
function uneBoucle(R){const b1=R.choix(CORPS)(),b2=R()<0.45?R.choix(CORPS.filter(f=>f().v!==b1.v))():null,B=b2?[b1,b2]:[b1],V=[...new Set(B.map(x=>x.v))],ini=V.map(v=>aff(v,INIT[v])),tant=R()<0.4;
  const dedans=tant?B.map(x=>({k:"aff",v:x.v,e:JSON.parse(JSON.stringify(x.e).replace(/"i"/g,'"k"'))})).concat([aff("k",["+","k",1])]):B;
  const P=tant?prog(R,V.concat(["k"]),ini.concat([aff("k",1),tq(["≤","k","n"],dedans),ret(V[0])])):prog(R,V.concat(["i"]),ini.concat([pour("i",1,"n",B),ret(V[0])]));
  const a=somme(dedans)+(tant?1:0),b=compte(P,[0]).ops,E=[];
  E.push({w:`Avant la boucle : ${pl(ini.length+(tant?1:0),"affectation")}, donc ${pl(ini.length+(tant?1:0),"opération")}.`,why:`Chaque ligne « variable ← nombre » fait une seule opération : l'affectation.`,pts:0.5});
  if(tant)E.push({w:`Le test « k ≤ n » : 1 comparaison, faite ${fx("n + 1")} fois.`,why:`Il est vrai n fois (une fois par tour), puis faux une fois : c'est ce dernier test qui fait sortir de la boucle.`,pts:1});
  E.push({w:`Dans la boucle : ${dedans.map(detail).join(" ; ")}. Soit ${pl(somme(dedans),"opération")} par tour, et la boucle fait n tours.`,why:`On compte chaque calcul écrit à droite de la flèche, plus l'affectation.${tant?"":" La gestion du « pour » (faire avancer i) ne compte pas."}`,pts:1.5});
  E.push({w:`<b>${fx(`T_{n} = ${poly([[a,"n"],[b,""]])}`)}</b>`,why:tant?`${fx(`${ini.length+1} + (n + 1) + ${somme(dedans)}n`)} : les affectations du début, les tests, puis les tours.`:`${fx(`${ini.length} + ${somme(dedans)}n`)} : les affectations du début, puis les tours. La ligne « Renvoyer » ne compte pas.`,pts:1});
  return comptage({P,lettre:"n",arg:k=>k,formule:poly([[a,"n"],[b,""]]),tape:`${a}n+${b}`,etapes:E,nature:tant?"tant que":"pour",piegeTest:tant?1:0,etapeTest:1});}
function deuxBoucles(R){const tri=R()<0.5,b1=R.choix([aff("c",["+","c",1]),aff("s",["+","s","j"]),aff("s",["+","s",["*","i","j"]]),aff("c",["+","c",["*",2,"j"]])]),v=b1.v,ext=R()<0.5?[aff("d",["+","d","i"])]:[],V=[v].concat(ext.length?["d"]:[]),ini=V.map(x=>aff(x,0));
  const P=prog(R,V.concat(["i","j"]),ini.concat([pour("i",1,"n",ext.concat([pour("j",1,tri?"i":"n",[b1])])),ret(v)])),k=coutAff(b1),m=somme(ext),c=ini.length;
  const formule=(tri?kTri(k,"n"):`${k===1?"":k}n²`)+(m?` + ${m}n`:"")+` + ${c}`,tape=(tri?`${k}n(n+1)/2`:`${k}n^2`)+`+${m}n+${c}`;
  const E=[{w:`Avant les boucles : ${pl(c,"opération")}.`,why:`Une affectation par ligne.`,pts:0.5},
    {w:`La ligne du milieu : ${detail(b1)}. ${tri?`Au tour i de la boucle extérieure, elle est faite i fois : au total ${fx("1 + 2 + … + n = n(n + 1)/2")} fois.`:`Elle est faite n fois à chaque tour de la boucle extérieure, qui fait n tours : ${fx("n × n = n²")} fois.`}`,why:tri?`La boucle intérieure va de 1 à i : elle fait 1 tour quand i = 1, puis 2, puis 3, et ainsi de suite jusqu'à n.`:`Pour deux boucles imbriquées, les nombres de tours se multiplient.`,pts:2}];
  if(m)E.push({w:`La ligne de la boucle extérieure : ${detail(ext[0])}, faite n fois : ${fx(m+"n")}.`,why:`Elle est dans la boucle extérieure mais pas dans la boucle intérieure : une fois par tour extérieur.`,pts:0.5});
  E.push({w:`<b>${fx(`T_{n} = ${formule}`)}</b>`,why:`On additionne les ${m?"trois":"deux"} morceaux. Le terme en n² est celui qui compte quand n est grand.`,pts:1});
  return comptage({P,lettre:"n",arg:x=>x,formule,tape,etapes:E,nature:tri?"triangle":"carré"});}
function boucleDouble(R){const moitie=R()<0.4,large=!moitie&&R()<0.4,b1=R()<0.6?[R.choix([aff("c",["+","c",1]),aff("s",["+","s","i"]),aff("s",["+",["*",2,"s"],1])])]:[],v=b1.length?b1[0].v:"i",ini=b1.length?[aff(v,0)]:[];
  const pas=moitie?aff("i",["div","i",2]):aff("i",["*","i",2]),cond=moitie?[">","i",1]:[large?"≤":"<","i","n"],P=prog(R,(b1.length?[v]:[]).concat(["i"]),ini.concat([aff("i",moitie?"n":1),tq(cond,b1.concat([pas])),ret(v)]));
  const k=somme(b1)+2,c=ini.length+1,tours=large?"p + 1":"p",t0=compte(P,[1]).ops,t1=compte(P,[2]).ops,A=t1-t0,formule=poly([[A,"p"],[t0,""]]);
  const E=[{w:`Avant la boucle : ${pl(c,"opération")}.`,why:`Une affectation par ligne.`,pts:0.5},
    {w:`La boucle fait ${fx(tours)} tours.`,why:moitie?`i part de ${fx("n = 2^{p}")} et il est divisé par 2 à chaque tour : il vaut ${fx("2^{p−1}")}, puis ${fx("2^{p−2}")}, et ainsi de suite. Il arrive à 1 après p tours, et la boucle s'arrête.`:`i vaut 1, puis 2, 4, 8 : après k tours, ${fx("i = 2^{k}")}. La boucle continue tant que ${fx(`2^{k} ${large?"≤":"&lt;"} 2^{p}`)}, c'est-à-dire tant que ${fx(`k ${large?"≤":"&lt;"} p`)}.`,pts:1.5},
    {w:`À chaque tour : ${b1.concat([pas]).map(detail).join(" ; ")}, soit ${pl(k,"opération")}. Le test fait 1 comparaison, ${fx(large?"p + 2":"p + 1")} fois.`,why:`Le test est fait une fois de plus que le nombre de tours : la dernière fois, il est faux.`,pts:1},
    {w:`<b>${fx(`T = ${formule}`)}</b>`,why:`Comme ${fx("p = log₂ n")}, le nombre d'opérations est de l'ordre de log n : bien moins que n. C'est ce qui arrive chaque fois qu'on double, ou qu'on divise par 2, à chaque tour.`,pts:1}];
  return comptage({P,lettre:"p",arg:x=>Math.pow(2,x),formule,tape:`${A}p+${t0}`,etapes:E,nature:moitie?"moitié":large?"double, ≤":"double",piegeTest:1,etapeTest:2});}
/* récursif : cas de base, équation de complexité, puis la formule */
function recursif(R){const nom=R.choix(["F","G","H","Rec","Calc"]),ap=["appel",nom,["-","n",1]],k=R.ent(2,3),base=R.ent(0,1),c=R.ent(0,3);
  const ex=R.choix([["*","n",ap],["+",ap,"n"],["+",["*",k,ap],1],["+",ap,["*",k,"n"]],["+",["*","n","n"],ap],["-",ap,1]]);
  const P={nom,params:["n"],vars:[],corps:[si(["=","n",base],[ret(c)],[ret(ex)])]},T0=compte(P,[base]).ops,a=compte(P,[base+1]).ops-T0,L=opsE(ex),ind=`T_{${base}}`;
  const formule=base?`${a}n − ${a-T0}`:`${a}n + ${T0}`,tape=base?`${a}n-${a-T0}`:`${a}n+${T0}`,KS=[0,1,2,3,4,5,6].map(x=>x+base);
  const E=[{w:`Cas de base : <b>${fx(`${ind} = ${T0}`)}</b>.`,why:`Pour n = ${base}, la fonction fait seulement la comparaison « n = ${base} », puis elle renvoie ${c} : la ligne « Renvoyer » ne compte pas.`,pts:1},
    {w:`Équation de complexité : <b>${fx(`T_{n} = ${a} + T_{n−1}`)}</b> pour ${fx(`n &gt; ${base}`)}.`,why:`Quand n est plus grand que ${base} : la comparaison, puis dans « ${ecrit(ex)} » : ${listeOps(L)}. Cela fait ${pl(a,"opération")}, plus toutes celles de l'appel ${nom}(n − 1), qui sont au nombre de ${fx("T_{n−1}")}.`,pts:1.5},
    {w:`<b>${fx(`T_{n} = ${formule}`)}</b>`,why:`C'est une suite arithmétique : on ajoute ${a} à chaque fois, en partant de ${fx(`${ind} = ${T0}`)}. Après ${base?"n − 1":"n"} pas : ${fx(base?`${T0} + ${a}(n − 1)`:`${T0} + ${a}n`)}.`,pts:1.5}];
  function juge(rep){const b=nombre((rep.c||{})[ind]),aa=nombre((rep.c||{}).a);if(!b||!aa)return {incomplet:`Remplis les deux cases avec des entiers : ${ind.replace(/[_{}]/g,"")} et le nombre a de l'équation.`};
    if(!propre(rep.T))return {incomplet:"Écris aussi la formule de Tₙ, avec la lettre n."};const W=KS.map(n=>calc(rep.T,{n}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à lire la formule. Écris-la avec la lettre n, par exemple 4n + 1."};
    const ok=[b.d===1&&b.n===T0,aa.d===1&&aa.n===a,KS.every((n,i)=>Math.abs(W[i]-compte(P,[n]).ops)<1e-9)],F=[ind,"a","T"].filter((_,i)=>!ok[i]);if(!F.length)return {ok:true};
    const d=!ok[0]?{etape:0,type:"opérations du cas de base",titre:"Où ça part : le cas de base.",msg:`Pour n = ${base}, il n'y a qu'une opération : la comparaison du « si ». Renvoyer un nombre ne compte pas.`}
      :!ok[1]?{etape:1,type:"opérations d'un appel, hors appel récursif",titre:"Où ça part : l'équation de complexité.",msg:`Dans un appel avec n plus grand que ${base} : la comparaison, puis ${listeOps(L)}. Cela fait ${a}. L'appel lui-même compte pour 1, et la soustraction « n − 1 » aussi.`}
      :{etape:2,type:"résolution de l'équation de complexité",titre:"Où ça part : la formule.",msg:`On part de ${fx(`${ind} = ${T0}`)} et on ajoute ${a} à chaque fois : ${fx(`T_{n} = ${formule}`)}. Vérifie avec n = ${base+1} : on doit trouver ${T0+a}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${et(F.map(x=>x==="T"?"la formule":x==="a"?"le nombre a":"le cas de base"))} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:d};}
  return {sig:"CR"+texteProg(P).replace(/\s+/g," "),q:`Voici une fonction récursive. Compte ses opérations élémentaires comme en cours : 1 pour chaque calcul, chaque comparaison et chaque appel. Donne ${fx(ind)}, puis le nombre a tel que ${fx("T_{n} = a + T_{n−1}")}, puis la formule de ${fx("T_{n}")} en fonction de n.`,
    corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(2,-1).map(x=>x.trim()).join(" ; ")} — cas de base, équation de complexité, formule de Tₙ`,
    champs:[{k:"cases",id:"c",noms:[ind,"a"]},{k:"champ",id:"T",nom:"Tₙ",label:"$T_{n} =$",ex:"une formule avec n",sym:[["n","n"],["(","("],[")",")"]]}],juge,etapes:E,
    bonne:`${fx(`${ind} = ${T0}`)} ; ${fx(`T_{n} = ${a} + T_{n−1}`)} ; ${fx(`T_{n} = ${formule}`)}`,bonneTxt:`T_${base} = ${T0} ; T_n = ${a} + T_(n−1) ; T_n = ${formule}`,repBonne:{c:{[ind]:String(T0),a:String(a)},T:tape},repFausse:{c:{[ind]:String(T0),a:String(a-1)},T:tape},nature:"récursif",
    ens:{P,type:"rec",args:KS,base,T0,a}};}

/* ---------- AG6 : ordres de complexité θ, o, ω, O, Ω ---------- */
/* les suites de référence du cours, dans l'ordre : cl = [base de l'exponentielle, puissance de n, puissance du log] */
const REF=[{t:"1",cl:[1,0,0],f:()=>1,tape:"1"},{t:"log(n)",cl:[1,0,1],f:n=>Math.log(n),tape:"log(n)"},{t:"√n",cl:[1,0.5,0],f:n=>Math.sqrt(n),tape:"√(n)"},{t:"n",cl:[1,1,0],f:n=>n,tape:"n"},{t:"n.log(n)",cl:[1,1,1],f:n=>n*Math.log(n),tape:"n*log(n)"},
  {t:"n²",cl:[1,2,0],f:n=>n*n,tape:"n^2"},{t:"n².log(n)",cl:[1,2,1],f:n=>n*n*Math.log(n),tape:"n^2*log(n)"},{t:"n³",cl:[1,3,0],f:n=>n*n*n,tape:"n^3"},{t:"2ⁿ",cl:[2,0,0],f:n=>Math.pow(2,n),tape:"2^n"},{t:"3ⁿ",cl:[3,0,0],f:n=>Math.pow(3,n),tape:"3^n"}];
const cmpCl=(x,y)=>x.cl[0]-y.cl[0]||x.cl[1]-y.cl[1]||x.cl[2]-y.cl[2];
const termeT=(k,r)=>r.t==="1"?String(k):k===1?r.t:r.cl[0]>1?`${k} × ${r.t}`:/^[l√]/.test(r.t)?`${k} ${r.t}`:k+r.t;
/* une somme de termes [coefficient, suite de référence], écrite du plus grand au plus petit ou mélangée */
function sommeRef(R,nb,sansExp,melange){const pool=R.mel(REF.filter(r=>!sansExp||r.cl[0]===1)).slice(0,nb).sort((x,y)=>cmpCl(y,x)),T=pool.map(r=>[R.ent(1,9),r]),ordre=melange?R.mel(T):T;
  return {T,dom:T[0],t:ordre.map(x=>termeT(x[0],x[1])).join(" + "),f:n=>T.reduce((s,x)=>s+x[0]*x[1].f(n),0),exp:T.some(x=>x[1].cl[0]>1)};}
const versN=src=>String(src||"").replace(/ⁿ/g,"^n").replace(/[.·](?=\s*[a-zA-Z(√])/g,"*").replace(/log\s*n\b/gi,"log(n)");
const GRANDS=e=>e?[30,60,90]:[1e4,1e8,1e12];
const pourquoiDom=(S)=>S.T.length<2?"Il n'y a qu'un terme.":`Quand on divise par ${fx(S.dom[1].t)}, ${S.T.length>2?"les autres termes tendent":"l'autre terme tend"} vers 0 : par exemple ${fx(`${S.T[1][1].t}/${S.dom[1].t}`)} tend vers 0, car ${fx(S.T[1][1].t)} vient avant ${fx(S.dom[1].t)} dans la liste des suites de référence.`;
const LISTE="L'ordre du cours, de la suite qui grandit le moins vite à celle qui grandit le plus vite (donc de l'algorithme le plus rapide au plus lent) : 1, log(n), n, n.log(n), n², n³, puis les exponentielles 2ⁿ, 3ⁿ, et enfin n!. La racine √n se place entre log(n) et n, et n².log(n) entre n² et n³.";
function ranger(R){const nb=R.choix([4,4,5]),FACT={t:"n!",cl:[99,0,0]},pool=R.mel(REF.concat([FACT])).slice(0,nb),LET=["A","B","C","D","E"].slice(0,nb);
  const deco=r=>{const k=R.choix([1,1,2,5,10,100,1000]),d=R()<0.25&&r.t!=="1"&&r.t!=="n!";return r.t==="1"?String(R.choix([1,7,100,1000])):d?`${r.t}/${R.choix([10,50,100])}`:r.t==="n!"?"n!":termeT(k,r);};
  const F=pool.map((r,i)=>({l:LET[i],r,t:deco(r)})),bon=F.slice().sort((x,y)=>cmpCl(x.r,y.r)),att=bon.map(x=>x.l).join("");
  const E=[{w:`Sans les constantes : ${F.map(x=>`${x.l} est de l'ordre de ${fx(x.r.t)}`).join(", ")}.`,why:"Multiplier ou diviser par un nombre fixe ne change pas l'ordre de grandeur : 1000n et n/50 grandissent tous les deux comme n.",pts:1},
    {w:`On range ces suites de référence : ${bon.map(x=>fx(x.r.t)).join(", ")}.`,why:LISTE,pts:1},
    {w:`<b>${bon.map(x=>x.l).join(" &lt; ")}</b>`,why:`C'est-à-dire : ${bon.map(x=>fx(x.t)).join(", ")}.`,pts:1}];
  function juge(rep){const L=(propre(rep.o).toUpperCase().match(/[A-E]/g)||[]);if(L.length!==nb||new Set(L).size!==nb||L.some(x=>!LET.includes(x)))return {incomplet:`Écris les ${nb} lettres ${LET.join(", ")}, une fois chacune, de la suite qui grandit le moins vite à celle qui grandit le plus vite.`};
    if(L.join("")===att)return {ok:true};
    let d=null;for(let i=0;i+1<nb;i++){const x=F.find(z=>z.l===L[i]),y=F.find(z=>z.l===L[i+1]);if(cmpCl(x.r,y.r)>0){d={etape:1,type:"deux ordres de grandeur inversés",titre:`Où ça part : ${x.l} et ${y.l}.`,msg:`${fx(y.t)} grandit moins vite que ${fx(x.t)} : le quotient ${fx(`${y.r.t}/${x.r.t}`)} tend vers 0. Les constantes ne changent rien quand n est très grand.`};break;}}
    return {ok:false,faux:["o"],resume:"Pas tout à fait : ce n'est pas le bon ordre.",diag:d};}
  return {sig:"RG"+F.map(x=>x.t).join("|"),q:`Voici ${nb} suites : ${F.map(x=>`${x.l} : ${fx(x.t)}`).join(" ; ")}. Range-les de celle qui grandit le moins vite à celle qui grandit le plus vite, quand n devient très grand.`,corps:"",texte:`ranger par ordre de grandeur : ${F.map(x=>`${x.l} = ${x.t}`).join(" ; ")}`,
    champs:[{k:"champ",id:"o",nom:"ordre",label:"De la croissance la plus faible à la plus forte :",ex:"par exemple B A D C",apercu:false,sym:LET.map(l=>[l,l+" "])}],juge,etapes:E,bonne:bon.map(x=>x.l).join(" &lt; "),bonneTxt:bon.map(x=>x.l).join(" < "),repBonne:{o:att.split("").join(" ")},repFausse:{o:att.split("").reverse().join(" ")},nature:"ranger",
    ens:{type:"ranger",ordre:bon.map(x=>x.r.t)}};}
function simplifier(R){const S=sommeRef(R,R.choix([2,3,3]),R()<0.8,true),ref=S.dom[1],PT=[7,20,50],G=GRANDS(S.exp||true);
  const E=[{w:`Les termes de ${fx("T_{n}")} sont de l'ordre de ${et(S.T.map(x=>fx(x[1].t)))}.`,why:"On regarde chaque terme sans sa constante.",pts:1},
    {w:`Le terme qui l'emporte est ${fx(termeT(S.dom[0],ref))}.`,why:`${pourquoiDom(S)} ${LISTE}`,pts:1},
    {w:`<b>${fx(`T_{n} = θ(${ref.t})`)}</b>`,why:`${fx(`T_{n}/${ref.t}`)} tend vers ${S.dom[0]}, un nombre strictement positif : ${fx("T_{n}")} est de l'ordre de ${fx(ref.t)}. Dans θ, on écrit la suite de référence seule, sans constante.`,pts:1}];
  function juge(rep){if(!propre(rep.r))return {incomplet:"Écris la suite de référence, par exemple n^2, n.log(n) ou 2^n."};
    const src=versN(lisOrdre(rep.r)),W=PT.map(n=>O.calcule(src,{n}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à lire cette suite. Écris-la avec la lettre n, par exemple n^2, n.log(n) (avec les parenthèses) ou 2^n."};
    if(PT.every((n,i)=>Math.abs(W[i]-ref.f(n))<=1e-9*ref.f(n)))return {ok:true};
    const Q=G.map(n=>O.calcule(src,{n})/ref.f(n));
    if(Q.every(x=>Number.isFinite(x)&&x>0)&&Math.abs(Q[2]/Q[1]-1)<0.03&&Math.abs(Q[1]/Q[0]-1)<0.2)return {incomplet:"C'est le bon ordre de grandeur. Mais dans θ, on écrit la suite de référence toute seule : sans constante devant, et sans terme plus petit."};
    const autre=S.T.slice(1).find(x=>PT.every((n,i)=>Math.abs(W[i]-x[1].f(n))<=1e-9*x[1].f(n)));
    return {ok:false,faux:["r"],resume:"Pas tout à fait : ce n'est pas l'ordre de grandeur de cette suite.",diag:autre?{etape:1,type:"terme dominant mal choisi",titre:"Où ça part : le terme qui l'emporte.",msg:`${fx(autre[1].t)} est bien dans la somme, mais ${fx(ref.t)} grandit plus vite : ${fx(`${autre[1].t}/${ref.t}`)} tend vers 0.`}:{etape:2,type:"ordre de grandeur d'une somme",titre:"Où ça part : l'ordre de grandeur.",msg:`Le terme qui l'emporte est ${fx(termeT(S.dom[0],ref))} : ${fx(`T_{n} = θ(${ref.t})`)}.`}};}
  return {sig:"SI"+S.t,q:`Le nombre d'opérations d'un algorithme est ${fx(`T_{n} = ${S.t}`)}. Donne son ordre de complexité : la suite de référence ${fx("R_{n}")} telle que ${fx("T_{n} = θ(R_{n})")}.`,corps:"",texte:`T_n = ${S.t} ; ordre de complexité θ(…)`,
    champs:[{k:"champ",id:"r",nom:"ordre de complexité",label:"$T_{n} = θ($ … $)$ avec :",ex:"par exemple n^2",sym:[["n","n"],["^","^"],["log(n)","log(n)"],[".","."],["√","√("],[")",")"]]}],juge,etapes:E,bonne:fx(`T_{n} = θ(${ref.t})`),bonneTxt:`T_n = θ(${ref.t})`,
    repBonne:{r:ref.tape},repFausse:{r:(S.T[1]||[0,REF[ref===REF[0]?1:0]])[1].tape},nature:"simplifier",ens:{type:"quotient",f:S.f,g:ref.f,lim:S.dom[0],grand:GRANDS(S.exp)}};}
const NOTA={o:["o","strictement dominée par"],"θ":["θ","du même ordre que"],"ω":["ω","strictement dominante devant"],O:["O","dominée au sens large par"],"Ω":["Ω","dominante au sens large devant"]};
const limTxt=L=>L===Infinity?"+∞":L===0?"0":O.nb(L);
function lisLimite(s){const t=propre(s).toLowerCase().replace(/ /g,"");if(!t)return null;if(/^\+?(∞|inf|infini|oo)$/.test(t))return Infinity;const v=O.calcule(s,{});return v===null||!Number.isFinite(v)?null:v;}
/* T_n et R_n : la limite du quotient, puis o, θ ou ω (ou vrai / faux pour une notation donnée) */
function quotient(R,vraiFaux){const exp=R()<0.2,S=sommeRef(R,R.choix([1,2,2]),!exp,false),gR=R()<0.4?S.dom[1]:R.choix(REF.filter(r=>exp||r.cl[0]===1)),kg=R.choix([1,1,2,3,5]),gt=termeT(kg,gR),c=cmpCl(S.dom[1],gR);
  const LQ=c===0?O.Q(S.dom[0],kg):null,L=c<0?0:c>0?Infinity:LQ.n/LQ.d,rel=c<0?"o":c>0?"ω":"θ",nota=vraiFaux?R.choix(["O","Ω","o","ω","θ","O","Ω"]):null;
  const vrai=nota?{o:rel==="o","ω":rel==="ω","θ":rel==="θ",O:rel!=="ω","Ω":rel!=="o"}[nota]:null,LT=c===0?O.nb(LQ):limTxt(L);
  const E=[{w:`<b>${fx(`lim T_{n}/R_{n} = ${LT}`)}</b>`,why:`${S.T.length>1?`Dans ${fx("T_{n}")}, le terme qui l'emporte est ${fx(termeT(S.dom[0],S.dom[1]))}. `:""}${c===0?`${fx("T_{n}")} et ${fx("R_{n}")} sont tous les deux de l'ordre de ${fx(gR.t)} : le quotient tend vers le quotient des constantes, ${fx(`${S.dom[0]}/${kg}`)}.`:c<0?`${fx(S.dom[1].t)} vient avant ${fx(gR.t)} dans la liste des suites de référence : le quotient tend vers 0.`:`${fx(S.dom[1].t)} vient après ${fx(gR.t)} dans la liste des suites de référence : le quotient tend vers +∞.`}`,pts:1.5},
    {w:`<b>${fx(`T_{n} = ${rel}(R_{n})`)}</b>`,why:`Quotient qui tend vers 0 : o (${fx("T_{n}")} est strictement dominée). Vers un nombre strictement positif : θ (même ordre). Vers +∞ : ω (${fx("T_{n}")} domine strictement).`,pts:1}];
  if(nota)E.push({w:`« ${fx(`T_{n} = ${nota}(R_{n})`)} » est <b>${vrai?"vrai":"faux"}</b>.`,why:nota==="O"?"O veut dire « o ou θ » : dominée au sens large. C'est vrai sauf quand le quotient tend vers +∞.":nota==="Ω"?"Ω veut dire « ω ou θ » : dominante au sens large. C'est vrai sauf quand le quotient tend vers 0.":`${nota} correspond à un quotient qui tend vers ${nota==="o"?"0":nota==="ω"?"+∞":"un nombre strictement positif"}.`,pts:1});
  function juge(rep){const lu=lisLimite(rep.l);if(lu===null)return {incomplet:"Écris la limite du quotient : 0, un nombre comme 3/2, ou +∞."};if(!rep.c)return {incomplet:nota?"Choisis aussi : vrai ou faux.":"Choisis aussi : o, θ ou ω."};
    const okL=L===Infinity?lu===Infinity:Math.abs(lu-L)<1e-9,okC=nota?(rep.c==="vrai")===vrai:rep.c===rel,F=[];if(okL&&okC)return {ok:true};if(!okL)F.push("l");if(!okC)F.push("c");
    const d=!okL?{etape:0,type:"limite d'un quotient de deux suites",titre:"Où ça part : la limite du quotient.",msg:`${c===0?`Les deux sont de l'ordre de ${fx(gR.t)} : il reste le quotient des constantes, ${fx(LT)}.`:`${fx(S.dom[1].t)} et ${fx(gR.t)} ne grandissent pas à la même vitesse : la limite est ${LT}.`}`}
      :{etape:nota?2:1,type:nota?`sens de la notation ${nota}`:"choix entre o, θ et ω",titre:"Où ça part : la notation.",msg:nota?`La limite vaut ${LT}, donc ${fx(`T_{n} = ${rel}(R_{n})`)}. Et ${nota==="O"?"O veut dire « o ou θ »":nota==="Ω"?"Ω veut dire « ω ou θ »":nota==="θ"?"quand le quotient a une limite, θ veut dire qu'elle est strictement positive et finie":`${nota} demande une limite ${nota==="o"?"nulle":"infinie"}`}.`:`Limite ${LT} : c'est ${rel}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"la limite et la conclusion sont à revoir":F[0]==="l"?"la limite est à revoir":"la conclusion est à revoir"}.`,diag:d};}
  const bonL=L===Infinity?"+∞":c===0?O.brut(LQ):"0";
  return {sig:(nota?"VF"+nota:"QO")+S.t+"|"+gt,q:`On pose ${fx(`T_{n} = ${S.t}`)} et ${fx(`R_{n} = ${gt}`)}. Calcule la limite de ${fx("T_{n}/R_{n}")} quand n tend vers +∞. ${nota?`Est-il vrai que ${fx(`T_{n} = ${nota}(R_{n})`)} ?`:`Puis choisis : ${fx("T_{n}")} est-elle o, θ ou ω de ${fx("R_{n}")} ?`}`,corps:"",texte:`T_n = ${S.t}, R_n = ${gt} ; limite de T_n/R_n, puis ${nota?`vrai ou faux : T_n = ${nota}(R_n)`:"o, θ ou ω"}`,
    champs:[{k:"champ",id:"l",nom:"limite",label:"$lim T_{n}/R_{n} =$",ex:"0, un nombre ou +∞",sym:[["+∞","+∞"],["/","/"]]},{k:"choix",id:"c",o:nota?[["vrai","Vrai"],["faux","Faux"]]:[["o","Tₙ = o(Rₙ)"],["θ","Tₙ = θ(Rₙ)"],["ω","Tₙ = ω(Rₙ)"]]}],juge,etapes:E,
    bonne:`${fx(`lim T_{n}/R_{n} = ${LT}`)} ; ${nota?(vrai?"vrai":"faux"):fx(`T_{n} = ${rel}(R_{n})`)}`,bonneTxt:`limite ${LT} ; ${nota?(vrai?"vrai":"faux"):`T_n = ${rel}(R_n)`}`,repBonne:{l:bonL,c:nota?(vrai?"vrai":"faux"):rel},repFausse:{l:bonL,c:nota?(vrai?"faux":"vrai"):rel==="θ"?"o":"θ"},nature:nota?"vrai ou faux":rel,
    ens:{type:"quotient",f:S.f,g:n=>kg*gR.f(n),lim:L,grand:GRANDS(S.exp||gR.cl[0]>1),nota,vrai}};}

/* ---------- AG7 : master theorem ---------- */
const PUISS=["1","n","n²","n³"],puissTape=["1","n","n^2","n^3"];
const tireMaster=(R,amax)=>{for(;;){const b=R.choix([2,2,2,3,4]),d=R.ent(0,b===2?3:2),bd=Math.pow(b,d),t=R();let C;
  if(t<0.35)C=[bd];else if(t<0.65)C=[1,2,3,4,8].filter(x=>x<bd);else C=[b*bd,b*bd,b*b*bd,bd+1,2*bd].filter(x=>x>bd&&x<=32);
  C=C.filter(x=>x<=(amax||32));if(!C.length)continue;return {a:R.choix(C),b,d,bd,f:amax?0:R.choix([0,0,1,2,3]),k:R.ent(2,7),j:R.ent(1,9)};}};
/* les opérations faites en plus des appels : O(n^d), θ(n^d), ou un nombre d'opérations écrit en entier */
const LEAD=["1","n","n²","n³"],autour=m=>m.f===1||m.f===3?`θ(${PUISS[m.d]})`:m.f===2?[`${m.k}`,`${m.k}n + ${m.j}`,`${m.k}n² + ${m.j}n`,`n³ + ${m.j}n²`][m.d]:`O(${PUISS[m.d]})`;
const equaT=m=>m.f===3?`T(n) = ${autour(m)} + ${m.a===1?"":m.a}T(⌊n/${m.b}⌋)`:`T(n) = ${m.a===1?"":m.a}T(⌊n/${m.b}⌋) + ${autour(m)}`;
const sigM=m=>[m.a,m.b,m.d,m.f].concat(m.f===2?[m.k,m.j]:[]);
const lireD=m=>m.f===2?(m.d?` : ici ${fx(autour(m))}, et le terme qui l'emporte est ${fx(m.d===3?"n³":m.k+LEAD[m.d])}, donc d = ${m.d}`:` : ici un nombre fixe d'opérations, ${m.k}, c'est ${fx("O(1) = O(n⁰)")}, donc d = 0`):m.d===0?` : ${fx(autour(m))}, c'est ${fx("n⁰")}, donc d = 0`:m.f===1||m.f===3?` : ${fx(autour(m))} veut dire « de l'ordre de ${PUISS[m.d]} », c'est donc aussi un ${fx(`O(${PUISS[m.d]})`)}, et d = ${m.d}`:"";
function ordreMaster(m){const cas=m.bd>m.a?">":m.bd===m.a?"=":"<",k=Math.log(m.a)/Math.log(m.b),ke=Math.abs(k-Math.round(k))<1e-9?Math.round(k):null;
  const t=cas===">"?PUISS[m.d]:cas==="="?(m.d?`${PUISS[m.d]}.log(n)`:"log(n)"):ke!==null?PUISS[ke]||`n^{${ke}}`:`n^{log ${m.a} / log ${m.b}}`;
  const tape=cas===">"?puissTape[m.d]:cas==="="?(m.d?`${puissTape[m.d]}*log(n)`:"log(n)"):ke!==null?`n^${ke}`:`n^(log(${m.a})/log(${m.b}))`;
  const g=cas===">"?n=>Math.pow(n,m.d):cas==="="?n=>Math.pow(n,m.d)*Math.log(n):n=>Math.pow(n,k);return {cas,t,tape,g,k,ke};}
const CASM={">":`Si ${O.fx("b^{d} &gt; a")}, alors ${O.fx("T(n) = O(n^{d})")}.`,"=":`Si ${O.fx("b^{d} = a")}, alors ${O.fx("T(n) = O(n^{d} log n)")}.`,"<":`Si ${O.fx("b^{d} &lt; a")}, alors ${O.fx("T(n) = O(n^{log a / log b})")}.`};
const etapesMaster=(m,o,debut)=>(debut||[]).concat([{w:`${fx(`a = ${m.a}`)}, ${fx(`b = ${m.b}`)}, ${fx(`d = ${m.d}`)}`,why:`a est le nombre d'appels récursifs${m.a===1?" (quand rien n'est écrit devant T, c'est 1)":""}, b le nombre par lequel la taille n est divisée, d la puissance de n dans les opérations faites en plus des appels${lireD(m)}.`,pts:1},
  {w:`${fx(`b^{d} = ${m.b}^{${m.d}} = ${m.bd}`)}, à comparer avec ${fx(`a = ${m.a}`)} : <b>${fx(`b^{d} ${o.cas==="<"?"&lt;":o.cas===">"?"&gt;":"="} a`)}</b>.`,why:`C'est la comparaison qui décide du cas du master theorem.`,pts:1},
  {w:`<b>${fx(`T(n) = O(${o.t})`)}</b>`,why:`${CASM[o.cas]}${o.cas==="<"&&o.ke!==null?` Ici ${fx(`log ${m.a} / log ${m.b} = ${o.ke}`)}, car ${fx(`${m.b}^{${o.ke}} = ${m.a}`)}.`:""}`,pts:1}]);
function jugeOrdre(src,o){if(!propre(src))return {inc:"Écris aussi l'ordre de complexité, par exemple n^2 ou n.log(n)."};const t=versN(lisOrdre(src)),PT=[8,50,300],W=PT.map(n=>O.calcule(t,{n}));
  if(W.some(v=>v===null||!Number.isFinite(v)))return {inc:"Je n'arrive pas à lire l'ordre de complexité. Écris-le avec la lettre n, par exemple n^2, n.log(n) ou n^(log(3)/log(2))."};
  if(PT.every((n,i)=>Math.abs(W[i]-o.g(n))<=1e-9*o.g(n)))return {ok:true};
  const Q=[1e4,1e8,1e12].map(n=>O.calcule(t,{n})/o.g(n));if(Q.every(x=>x>0&&Number.isFinite(x))&&Math.abs(Q[2]/Q[1]-1)<0.02&&Math.abs(Q[1]/Q[0]-1)<0.02)return {inc:"C'est le bon ordre de grandeur, mais on l'écrit sans constante devant."};
  return {ok:false};}
function masterLire(R){const m=tireMaster(R);
  function juge(rep){const V=["a","b","d"].map(k=>nombre((rep.c||{})[k]));if(V.some(x=>!x||x.d!==1))return {incomplet:"Remplis les trois cases avec des entiers."};
    const F=["a","b","d"].filter((k,i)=>V[i].n!==m[k]);if(!F.length)return {ok:true};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${et(F)} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:{etape:0,type:F.includes("d")&&m.d===0?"O(1) lu comme d = 1":F.includes("a")&&m.a===1?"a oublié quand il vaut 1":"lecture de a, b et d",titre:"Où ça part : le rôle des trois nombres.",msg:`a est devant T (le nombre d'appels), b est sous n (la taille est divisée par b), d est la puissance de n dans les opérations faites en plus des appels${m.f===2&&m.d?", celle du terme qui l'emporte":""} : ici ${fx(`a = ${m.a}`)}, ${fx(`b = ${m.b}`)}, ${fx(`d = ${m.d}`)}.`}};}
  return {sig:"ML"+sigM(m),q:`Le nombre d'opérations d'un algorithme récursif vérifie ${fx(equaT(m))}. Pour appliquer le master theorem, donne les trois nombres a, b et d.`,corps:`<p class="muted">Rappel : le master theorem s'applique quand ${fx("T(n) ≤ aT(⌈n/b⌉) + O(n^{d})")}.</p>`,texte:`${equaT(m)} ; lire a, b, d`,
    champs:[{k:"cases",id:"c",noms:["a","b","d"]}],juge,etapes:[etapesMaster(m,ordreMaster(m))[0]],bonne:`${fx(`a = ${m.a}`)}, ${fx(`b = ${m.b}`)}, ${fx(`d = ${m.d}`)}`,bonneTxt:`a = ${m.a}, b = ${m.b}, d = ${m.d}`,
    repBonne:{c:{a:String(m.a),b:String(m.b),d:String(m.d)}},repFausse:{c:{a:String(m.b),b:String(m.a===m.b?m.a+1:m.a),d:String(m.d)}},nature:"lire",ens:{type:"master",m}};}
const CASO=[[">","b^d > a"],["=","b^d = a"],["<","b^d < a"]];
function masterConclure(R,code_){const m=tireMaster(R,code_?4:0),o=ordreMaster(m);let corps=`<p class="muted">Rappel du master theorem, quand ${fx("T(n) ≤ aT(⌈n/b⌉) + O(n^{d})")} : ${[">","=","<"].map(c=>CASM[c].replace(/^S/,"s").replace(/\.$/,"")).join(" ; ")}.</p>`,debut=[],q,texte;
  if(code_){const nom=R.choix(["F","G","H"]),I="    ",L=[`PROCÉDURE : ${nom} (E n : entier)`,"SPÉCIFICATIONS : n ∈ ℕ","DÉBUT",`${I}si n > 1 alors`],avant=R()<0.35,enBoucle=m.a>=2&&R()<0.3,borne=m.d?R.choix(["n","n","n","n div 2","2 * n"]):"n",B=[],A=[];
    ["i","j","k"].slice(0,m.d).forEach((v,x)=>B.push(`${I.repeat(2+x)}pour ${v} de 1 à ${x?"n":borne} faire`));B.push(`${I.repeat(2+m.d)}op élém`);for(let x=m.d-1;x>=0;x--)B.push(`${I.repeat(2+x)}fin pour;`);
    if(enBoucle)A.push(`${I.repeat(2)}pour t de 1 à ${m.a} faire`,`${I.repeat(3)}${nom}(n div ${m.b})`,`${I.repeat(2)}fin pour;`);else for(let x=0;x<m.a;x++)A.push(`${I.repeat(2)}${nom}(n div ${m.b})`);
    L.push(...(avant?A.concat(B):B.concat(A)),`${I}fin si;`,"FIN");corps=code(L.join("\n"))+`<p class="muted">« op élém » désigne une opération élémentaire.</p>`+corps;m.code=[avant,enBoucle,borne];
    q=`Voici une procédure récursive. On note T(n) son nombre d'opérations. Donne les nombres a, b et d du master theorem, puis l'ordre de complexité : ${fx("T(n) = O(…)")}.`;texte=`procédure : ${m.d} boucle(s) pour${m.d?` (la première de 1 à ${borne})`:""} autour d'une opération, ${avant?"avant elles":"puis"} ${m.a} appel(s) ${nom}(n div ${m.b})${enBoucle?" dans une boucle":""} ; a, b, d et ordre de complexité`;
    debut=[{w:`Équation de complexité : ${fx(equaT(m))}.`,why:`${m.d?`${m.d>1?"Les "+m.d+" boucles « pour » imbriquées font":"La boucle « pour » fait"} ${borne!=="n"?"de l'ordre de ":""}${fx(PUISS[m.d])} fois l'opération élémentaire${borne!=="n"?` (${m.d>1?"la première boucle":"elle"} fait ${fx(borne==="n div 2"?"n div 2":"2n")} tours, pas n : la constante ne compte pas)`:""}`:"Il n'y a pas de boucle autour de l'opération élémentaire : O(1)"}. ${enBoucle?`La procédure s'appelle ${m.a} fois, avec une taille divisée par ${m.b} : la boucle « pour t de 1 à ${m.a} » ne va pas jusqu'à n, elle fait seulement ${m.a} tours, donc a = ${m.a}.`:`Puis la procédure s'appelle ${m.a} fois, avec une taille divisée par ${m.b}.`}${avant?" Que les appels soient écrits avant ou après les boucles ne change rien au nombre d'opérations.":""}`,pts:1}];}
  else{q=`Le nombre d'opérations d'un algorithme récursif vérifie ${fx(equaT(m))}. Calcule ${fx("b^{d}")}, compare-le à a, puis donne l'ordre de complexité : ${fx("T(n) = O(…)")}.`;texte=`${equaT(m)} ; b^d, comparaison avec a, ordre de complexité`;}
  const E=etapesMaster(m,o,debut),e0=debut.length;
  function juge(rep){const F=[];let d=null;
    if(code_){const V=["a","b","d"].map(k=>nombre((rep.c||{})[k]));if(V.some(x=>!x||x.d!==1))return {incomplet:"Remplis les trois cases a, b et d avec des entiers."};["a","b","d"].forEach((k,i)=>{if(V[i].n!==m[k])F.push(k);});
      if(F.length)d={etape:e0,type:"lecture de a, b et d dans un algorithme récursif",titre:"Où ça part : a, b et d.",msg:`a est le nombre d'appels récursifs faits par la procédure (${m.a}), b le nombre par lequel n est divisé dans ces appels (${m.b}), d le nombre de boucles « pour » imbriquées autour de l'opération élémentaire, qui font chacune de l'ordre de n tours (${m.d}).`};}
    else{const bd=nombre((rep.c||{})["b^{d}"]);if(!bd||bd.d!==1)return {incomplet:"Calcule d'abord b puissance d : un entier."};if(!rep.cas)return {incomplet:"Choisis aussi le cas : plus grand, égal ou plus petit que a."};
      if(bd.n!==m.bd){F.push("b^{d}");d={etape:e0+1,type:"calcul de b puissance d",titre:"Où ça part : b puissance d.",msg:`${fx(`b^{d} = ${m.b}^{${m.d}} = ${m.bd}`)}${m.d===0?" : un nombre à la puissance 0 vaut 1":""}.`};}
      if(rep.cas!==o.cas){F.push("cas");if(!d)d={etape:e0+1,type:"comparaison de b puissance d avec a",titre:"Où ça part : la comparaison.",msg:`${m.bd} et ${m.a} : ${fx(`b^{d} ${o.cas==="<"?"&lt;":o.cas===">"?"&gt;":"="} a`)}.`};}}
    const jo=jugeOrdre(rep.o,o);if(jo.inc)return {incomplet:jo.inc};
    if(!jo.ok){F.push("o");if(!d)d={etape:e0+2,type:"cas du master theorem",titre:"Où ça part : la conclusion.",msg:`${CASM[o.cas]} Ici : ${fx(`T(n) = O(${o.t})`)}.`};}
    if(!F.length)return {ok:true};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${et(F.map(x=>x==="o"?"l'ordre de complexité":x==="cas"?"la comparaison":x==="b^{d}"?"b puissance d":x))} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:d};}
  const bon=code_?{c:{a:String(m.a),b:String(m.b),d:String(m.d)},o:o.tape}:{c:{"b^{d}":String(m.bd)},cas:o.cas,o:o.tape},fausse=JSON.parse(JSON.stringify(bon));fausse.o=o.cas===">"?puissTape[m.d]+"*log(n)":"n^"+(m.d+4);
  return {sig:(code_?"MC"+[m.a,m.b,m.d].concat(m.code):"MO"+sigM(m)),q,corps,texte,champs:(code_?[{k:"cases",id:"c",noms:["a","b","d"]}]:[{k:"cases",id:"c",noms:["b^{d}"]},{k:"choix",id:"cas",o:CASO.map(x=>[x[0],x[1]])}]).concat([{k:"champ",id:"o",nom:"ordre de complexité",label:"$T(n) = O($ … $)$ avec :",ex:"par exemple n^2",sym:[["n","n"],["^","^"],["log(n)","log(n)"],[".","."],["(","("],[")",")"],["/","/"]]}]),
    juge,etapes:E,bonne:fx(`T(n) = O(${o.t})`),bonneTxt:`a = ${m.a}, b = ${m.b}, d = ${m.d} ; T(n) = O(${o.t.replace(/[{}]/g,"")})`,repBonne:bon,repFausse:fausse,nature:"cas "+o.cas,ens:{type:"master",m,g:o.g}};}
/* machine plus rapide, entrée plus grande : ce que change l'ordre de complexité */
function machine(R){const t=R.ent(0,3),d=R.ent(1,3),mm=R.choix([2,3,4,5,10]),N=R.choix([100,200,500,1000,2000]),k=Math.pow(mm,d),j=R.ent(3,10);let q,rep,E,nature;
  if(t===0){rep=N*mm;nature="machine, polynôme";q=`Un algorithme a un temps d'exécution proportionnel à ${fx(PUISS[d])}. Sur un ordinateur X, il traite une entrée de taille ${N} en une minute. Un ordinateur Y est ${k} fois plus rapide. Quelle taille d'entrée Y peut-il traiter en une minute ?`;
    E=[{w:`En une minute, Y fait ${k} fois plus d'opérations que X.`,why:"« k fois plus rapide » : k fois plus d'opérations dans le même temps.",pts:1},{w:`On cherche n tel que ${fx(`${PUISS[d].replace("n","n")} = ${k} × ${N}${d>1?["","","²","³"][d]:""}`)}.`,why:`Le nombre d'opérations est proportionnel à ${fx(PUISS[d])}.`,pts:1},{w:`<b>${fx(`n = ${mm} × ${N} = ${rep}`)}</b>`,why:d>1?`${fx(`${k} = ${mm}${["","","²","³"][d]}`)}, donc ${fx(`n${["","","²","³"][d]} = (${mm} × ${N})${["","","²","³"][d]}`)}. La taille n'est multipliée que par ${mm}, pas par ${k}.`:`Pour un algorithme linéaire, la taille traitée est multipliée par ${k}, comme la vitesse.`,pts:1}];}
  else if(t===1){const kk=Math.pow(2,j);rep=N/10+j;nature="machine, exponentielle";q=`Un algorithme a un temps d'exécution proportionnel à ${fx("2^{n}")}. Sur un ordinateur X, il traite une entrée de taille ${N/10} en une minute. Un ordinateur Y est ${kk} fois plus rapide. Quelle taille d'entrée Y peut-il traiter en une minute ?`;
    E=[{w:`En une minute, Y fait ${kk} fois plus d'opérations que X.`,why:"« k fois plus rapide » : k fois plus d'opérations dans le même temps.",pts:1},{w:`On cherche n tel que ${fx(`2^{n} = ${kk} × 2^{${N/10}}`)}, et ${fx(`${kk} = 2^{${j}}`)}.`,why:"On écrit le gain de vitesse comme une puissance de 2.",pts:1},{w:`<b>${fx(`n = ${N/10} + ${j} = ${rep}`)}</b>`,why:`Multiplier deux puissances de 2, c'est additionner les exposants. Avec un algorithme exponentiel, une machine ${kk} fois plus rapide ne gagne que ${j} sur la taille.`,pts:1}];}
  else if(t===2){const s=R.choix([1,2,5,10]);rep=s*k;nature="temps, polynôme";q=`Un algorithme a un temps d'exécution proportionnel à ${fx(PUISS[d])}. Il met ${s} ${s>1?"secondes":"seconde"} pour une entrée de taille ${N}. Combien de secondes met-il pour une entrée de taille ${N*mm} ?`;
    E=[{w:`La taille est multipliée par ${mm}.`,why:`${N*mm} divisé par ${N}.`,pts:1},{w:`Le temps est multiplié par ${fx(`${mm}${["","","²","³"][d]}${d>1?` = ${k}`:""}`)}.`,why:`Le temps est proportionnel à ${fx(PUISS[d])} : si n est multiplié par ${mm}, ${fx(PUISS[d])} est multiplié par ${mm} à la puissance ${d}.`,pts:1},{w:`<b>${rep} secondes</b>`,why:`${s} × ${k}.`,pts:1}];}
  else{const s=R.choix([1,2,3]),kk=Math.pow(2,j);rep=s*kk;nature="temps, exponentielle";q=`Un algorithme a un temps d'exécution proportionnel à ${fx("2^{n}")}. Il met ${s} ${s>1?"secondes":"seconde"} pour une entrée de taille ${N/10}. Combien de secondes met-il pour une entrée de taille ${N/10+j} ?`;
    E=[{w:`La taille augmente de ${j}.`,why:`${N/10+j} − ${N/10}.`,pts:1},{w:`Le temps est multiplié par ${fx(`2^{${j}} = ${kk}`)}.`,why:`${fx(`2^{n + ${j}} = 2^{n} × 2^{${j}}`)} : chaque unité de plus sur la taille double le temps.`,pts:1},{w:`<b>${rep} secondes</b>`,why:`${s} × ${kk}.`,pts:1}];}
  function juge(r){const v=nombre(r.v);if(!v)return {incomplet:"Écris un nombre."};if(v.d===1&&v.n===rep)return {ok:true};
    return {ok:false,faux:["v"],resume:"Pas tout à fait : ce n'est pas la bonne valeur.",diag:{etape:1,type:t<2?"taille traitée par une machine plus rapide":"temps d'exécution quand la taille change",titre:"Où ça part : le lien entre la taille et le temps.",msg:`${E[1].w} ${E[1].why}`}};}
  return {sig:"MA"+[t,d,mm,N,j],q,corps:"",texte:q.replace(/<[^>]+>|\$/g,""),champs:[{k:"champ",id:"v",nom:"réponse",label:t<2?"Taille que Y peut traiter :":"Temps, en secondes :",ex:"un nombre"}],juge,etapes:E,bonne:`<b>${rep}</b>`,bonneTxt:String(rep),repBonne:{v:String(rep)},repFausse:{v:String(t===0&&N*k!==rep?N*k:rep+1)},nature,ens:{type:"machine",t,d,mm,N,j,rep}};}

/* ---------- les questions de cours des annales (CC de 2022 et de novembre 2024), sur papier ---------- */
const papierQ=(sig,q,corps,L,nature)=>({sig,q,corps,texte:(q+" "+corps).replace(/<[^>]+>/g," ").replace(/\$/g,"").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/\s+/g," ").trim(),champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
  etapes:L.map(x=>({w:x[0],why:x[1],pts:x[2]})),bonne:"voir la correction",bonneTxt:"à écrire de mémoire (voir la correction)",repBonne:{},nature,ens:{type:"cours"}});
const coursMaster=()=>papierQ("QM","Question de cours, posée au CC de 2022.",`<ol type="a"><li>À quoi sert le master theorem ?</li><li>Énonce-le : l'hypothèse, puis les trois cas.</li></ol>`,[
  ["a) Il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel.","C'est la phrase du corrigé officiel. Les deux idées à ne pas oublier : « récursif » et « taille divisée à chaque appel ».",1],
  [`b) S'il existe quatre entiers a ≥ 0, b &gt; 1, d ≥ 0 et n₀ &gt; 0 tels que, pour tout n ≥ n₀, ${O.f("T(n) ≤ aT(⌈n/b⌉) + O(n^{d})")}, alors :`,"a est le nombre d'appels récursifs, b l'entier par lequel la taille est divisée, d la puissance de n dans les opérations faites en plus des appels.",0.5],
  [`${fx("T(n) = O(n^{d})")} si ${fx("b^{d} &gt; a")} ;`,"Les opérations faites en dehors des appels l'emportent.",0.5],
  [`${fx("T(n) = O(n^{d} log n)")} si ${fx("b^{d} = a")} ;`,"Les deux pèsent autant : un facteur log n apparaît.",0.5],
  [`${fx("T(n) = O(n^{log a / log b})")} si ${fx("b^{d} &lt; a")}.`,"Les appels récursifs l'emportent.",0.5]],"master");
const coursIteration=()=>papierQ("QI","Questions de cours sur la preuve d'un algorithme itératif (la question c a été posée au CC de novembre 2024).",`<ol type="a"><li>Qu'est-ce qu'une équation d'itération ?</li><li>Qu'est-ce qu'un invariant de boucle ?</li><li>Dans une preuve de validité, à quoi servent les équations d'itération ?</li></ol>`,[
  ["a) Une équation d'itération est une égalité qui relie les valeurs des variables d'une itération à la suivante.","Définition du cours (diapo 54). On la lit sur l'algorithme : c'est la « vérité ».",0.5],
  ["b) Un invariant de boucle est une propriété censée être vraie au début des itérations et à la fin de chaque itération.","Définition du cours (diapo 54). C'est l'« hypothèse à prouver », par récurrence.",0.5],
  ["c) Elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables.","Première phrase du corrigé officiel. En 2024, le sujet les appelait « équations de récurrence ».",0.5],
  ["Elles permettent de montrer qu'un invariant est héréditaire : s'il est vrai à une itération, alors il est vrai à la suivante.","Deuxième phrase du corrigé officiel : c'est dans l'étape de récurrence de la preuve qu'on s'en sert.",1]],"itération");
function coursMillion(R){const [o,k,kt]=R.choix([["n³","un million de fois","1 000 000"],["n²","un million de fois","1 000 000"],["n.log(n)","mille fois","1000"],["log(n)","mille fois","1000"],["n","mille fois","1000"],["n²","mille fois","1000"]]);
  return papierQ("QK"+o+kt,"Question de cours, posée au CC de novembre 2024 (avec d'autres nombres selon les sujets).",`<ol type="a"><li>Un algorithme de complexité ${fx(`θ(${o})`)} peut-il être ${k} plus lent qu'un autre algorithme de complexité ${fx(`θ(${o})`)} ? Justifie.</li><li>Rappelle ce que veulent dire ${fx("T_{n} = θ(R_{n})")}, ${fx("T_{n} = o(R_{n})")} et ${fx("T_{n} = ω(R_{n})")}.</li></ol>`,[
    [`a) Oui : par exemple si le premier fait ${fx(`${kt} × ${o}`)} opérations et le deuxième ${fx(o)} opérations.`,`C'est la réponse du corrigé officiel. Le quotient des deux vaut ${kt}, un nombre strictement positif : les deux sont bien de l'ordre de ${fx(o)}. θ ne dit rien de la constante.`,1],
    [`b) ${fx("T_{n} = θ(R_{n})")} : ${fx("T_{n}/R_{n}")} reste entre deux nombres strictement positifs, en particulier s'il tend vers un nombre strictement positif.`,"Même ordre de grandeur (diapo 77).",0.5],
    [`${fx("T_{n} = o(R_{n})")} : ${fx("T_{n}/R_{n}")} tend vers 0.`,"T est strictement dominée par R.",0.25],
    [`${fx("T_{n} = ω(R_{n})")} : ${fx("T_{n}/R_{n}")} tend vers +∞.`,"T domine strictement R.",0.25]],"θ");}

/* ---------- exécution complète : appels récursifs, affichages ---------- */
const ecrire=e=>({k:"ecrire",e}),aLaLigne=()=>({k:"ligne"}),appelS=(nom,...args)=>({k:"appelS",nom,args});
function joue(P,args){const out=[""],aff=[];let appels=0;
  const val=(e,env)=>typeof e==="number"?e:typeof e==="string"?env[e]:e[0]==="appel"?lance(e.slice(2).map(a=>val(a,env))):CALC[e[0]](val(e[1],env),val(e[2],env));
  const run=(C,env)=>{for(const s of C){
    if(s.k==="aff")env[s.v]=val(s.e,env);
    else if(s.k==="ret")return {r:val(s.e,env)};
    else if(s.k==="ecrire"){const v=val(s.e,env);out[out.length-1]+=String(v);aff.push(v);}
    else if(s.k==="ligne")out.push("");
    else if(s.k==="appelS")lance(s.args.map(a=>val(a,env)));
    else if(s.k==="si"){const r=run(val(s.cond,env)?s.alors:(s.sinon||[]),env);if(r)return r;}
    else if(s.k==="pour"){const a=val(s.a,env),b=val(s.b,env);for(let i=a;i<=b;i++){env[s.v]=i;const r=run(s.c,env);if(r)return r;}}
    else{let g=0;while(val(s.cond,env)){const r=run(s.c,env);if(r)return r;if(++g>5000)throw new Error("boucle sans fin");}}}
    return null;};
  const lance=vals=>{if(++appels>4000)throw new Error("trop d'appels");const env={};P.params.forEach((p,i)=>{env[p]=vals[i];});const r=run(P.corps,env);return r?r.r:undefined;};
  const ret=lance(args);if(out.length>1&&out[out.length-1]==="")out.pop();return {ret,lignes:out,aff,appels};}

/* ---------- AG3 : l'arrêt d'une boucle tant que ---------- */
/* o : {P, entrees (valeurs de n à essayer), q (quantité affichée), tape, depart, baisse, stop, max} */
function boucleArret(R,sorte){const k=R.ent(1,4),t=R.ent(0,6);
  if(sorte==="compte"){
    if(t===4)return {P:prog(R,["i","s"],[aff("i",1),aff("s",0),tq(["≤","i","n"],[aff("s",["+","s","i"]),aff("i",["+","i",1])]),ret("s")]),q:"n + 1 − i",tape:"n+1-i",depart:"n",baisse:"la ligne « i ← i + 1 » ajoute 1 à i, donc retire 1 à n + 1 − i",stop:"i > n, c'est-à-dire n + 1 − i ≤ 0",max:"n",nature:"monte jusqu'à n",pos:"La condition « i ≤ n » dit que n − i ≥ 0 pendant la boucle, donc n + 1 − i ≥ 1."};
    if(t===5)return {P:prog(R,["c"],[aff("c",0),tq(["<",["*","c","c"],"n"],[aff("c",["+","c",1])]),ret("c")]),q:"n − c × c",tape:"n-c*c",depart:"n",baisse:"c gagne 1, donc c × c augmente et n − c × c diminue strictement",stop:"c × c ≥ n, c'est-à-dire n − c × c ≤ 0",max:"n",nature:"carré"};
    if(t===6)return {P:prog(R,["i","s"],[aff("i","n"),aff("s",0),tq(["≠","i",0],[aff("s",["+","s","i"]),aff("i",["-","i",1])]),ret("s")]),q:"i",tape:"i",depart:"n",baisse:"la ligne « i ← i - 1 » lui retire 1",stop:"i = 0",max:"n",nature:"descend jusqu'à 0",pos:"Ici la condition est « i ≠ 0 », pas « i > 0 » : il faut dire pourquoi i reste positif. Il part de n, qui est positif, et perd exactement 1 à chaque tour : il passe forcément par 0, et la boucle s'arrête à ce moment-là."};
    if(t===0)return {P:prog(R,["c","s"],[aff("c","n"),aff("s",0),tq([">","c",0],[aff("s",["+","s","c"]),aff("c",["-","c",k])]),ret("s")]),q:"c",tape:"c",depart:"n",baisse:`la ligne « c ← c - ${k} » lui retire ${k}`,stop:"c ≤ 0",max:k===1?"n":"n",nature:"descend"};
    if(t===1)return {P:prog(R,["i","s"],[aff("i",0),aff("s",0),tq(["<","i","n"],[aff("s",["+","s",["*",2,"i"]]),aff("i",["+","i",k])]),ret("s")]),q:"n − i",tape:"n-i",depart:"n",baisse:`la ligne « i ← i + ${k} » ajoute ${k} à i, donc retire ${k} à n − i`,stop:"i ≥ n, c'est-à-dire n − i ≤ 0",max:"n",nature:"monte"};
    if(t===2){const b0=R.ent(0,3);return {P:prog(R,["a","b"],[aff("a","n"),aff("b",b0),tq([">","a","b"],[aff("a",["-","a",1]),aff("b",["+","b",1])]),ret(["+","a","b"])]),q:"a − b",tape:"a-b",depart:`n − ${b0}`.replace(" − 0",""),baisse:"a perd 1 et b gagne 1 : a − b perd 2",stop:"a ≤ b, c'est-à-dire a − b ≤ 0",max:"n",nature:"deux variables"};}
    return {P:prog(R,["x","y"],[aff("x","n"),aff("y",0),tq(["≥","x",k],[aff("x",["-","x",k]),aff("y",["+","y",1])]),ret("y")]),q:"x",tape:"x",depart:"n",baisse:`la ligne « x ← x - ${k} » lui retire ${k}`,stop:`x < ${k}`,max:"n",nature:"descend"};}
  if(t===4)return {P:prog(R,["p","c"],[aff("p",1),aff("c",0),tq(["≤","p","n"],[aff("p",["*",3,"p"]),aff("c",["+","c",1])]),ret("c")]),q:"n − p",tape:"n-p",depart:"n − 1",baisse:"p est remplacé par 3p, qui est strictement plus grand que p car p vaut au moins 1 : n − p diminue",stop:"p > n, c'est-à-dire n − p < 0",max:"n",nature:"triple",pos:"La condition « p ≤ n » dit que n − p ≥ 0 pendant la boucle."};
  if(t===5)return {P:prog(R,["x","c"],[aff("x","n"),aff("c",0),tq([">","x",1],[si(["=",["mod","x",2],0],[aff("x",["div","x",2])],[aff("x",["-","x",1])]),aff("c",["+","c",1])]),ret("c")]),q:"x",tape:"x",depart:"n",baisse:"si x est pair, il est remplacé par x div 2, plus petit car x > 1 ; sinon il perd 1 : dans les deux cas, x diminue strictement",stop:"x ≤ 1",max:"n",nature:"si, division"};
  if(t===6)return {P:prog(R,["m","c"],[aff("m","n"),aff("c",0),tq([">","m",0],[aff("m",["div","m",10]),aff("c",["+","c",1])]),ret("c")]),q:"m",tape:"m",depart:"n",baisse:"m est remplacé par m div 10, qui est strictement plus petit que m dès que m vaut au moins 1",stop:"m ≤ 0, c'est-à-dire m = 0",max:"n",nature:"chiffres"};
  if(t===0)return {P:prog(R,["m","c"],[aff("m","n"),aff("c",0),tq([">","m",1],[aff("m",["div","m",2]),aff("c",["+","c",1])]),ret("c")]),q:"m",tape:"m",depart:"n",baisse:"m est remplacé par m div 2, qui est strictement plus petit que m dès que m vaut au moins 1",stop:"m ≤ 1",max:"n",nature:"division"};
  if(t===1)return {P:prog(R,["i","c"],[aff("i",1),aff("c",0),tq(["<","i","n"],[aff("i",["*","i",2]),aff("c",["+","c",1])]),ret("c")]),q:"n − i",tape:"n-i",depart:"n − 1",baisse:"i est remplacé par 2i, qui est strictement plus grand que i car i vaut au moins 1 : n − i diminue",stop:"i ≥ n, c'est-à-dire n − i ≤ 0",max:"n",nature:"double"};
  if(t===2){const b=R.choix([3,10]);return {P:prog(R,["m","c"],[aff("m","n"),aff("c",1),tq(["≥","m",b],[aff("m",["div","m",b]),aff("c",["+","c",1])]),ret("c")]),q:"m",tape:"m",depart:"n",baisse:`m est remplacé par m div ${b}, qui est strictement plus petit que m`,stop:`m < ${b}`,max:"n",nature:"division"};}
  return {P:prog(R,["a","b"],[aff("a","n"),aff("b",["+","n",k]),tq(["et",[">","a",0],[">","b",0]],[si([">","a","b"],[aff("a",["-","a",1])],[aff("b",["-","b",2])])]),ret(["+","a","b"])]),q:"a + b",tape:"a+b",depart:`2n + ${k}`,baisse:"à chaque tour, soit a perd 1, soit b perd 2 : dans les deux cas a + b diminue",stop:"a ≤ 0 ou b ≤ 0",max:`2n + ${k}`,nature:"deux variables, si"};}
/* une quantité proposée, essayée sur de vraies exécutions : entière, positive tant que la boucle tourne, et qui diminue à chaque tour */
function essaieQuantite(P,src){const B=boucleDe(P),prob=[];
  for(const n of [0,1,2,3,7,12,25]){const env={n};let tours=0,avant=null;
    for(const s of P.corps){if(s===B)break;if(s.k==="aff")env[s.v]=vaut(s.e,env);}
    while(vaut(B.cond,env)){const v=calc(src,env);if(v===null)return {illisible:true};
      if(!Number.isFinite(v)||Math.abs(v-Math.round(v))>1e-9)return {pb:"entier",n,v};
      if(v<0)return {pb:"négatif",n,v};if(avant!==null&&v>=avant)return {pb:"diminue",n,v,avant};
      avant=v;unTour(B.c,env);if(++tours>3000)return {pb:"infini"};}
    if(avant!==null){const v=calc(src,env);if(v===null)return {illisible:true};if(v>=avant)return {pb:"diminue",n,v,avant};}}
  return {ok:true};}
function arret(R,sorte){const o=boucleArret(R,sorte),P=o.P,B=boucleDe(P),V=P.vars.concat(["n"]);
  const E=[{w:`La quantité <b>${fx(o.q)}</b> est un entier, positif tant que la boucle tourne. Avant la boucle, elle vaut ${fx(o.depart)}.`,why:`On cherche une quantité qui ne peut pas diminuer indéfiniment : un entier naturel. ${o.pos||`La condition « ${h(ecrit(B.cond))} » dit justement qu'elle est positive pendant la boucle.`}`,pts:1},
    {w:`Elle diminue strictement à chaque tour.`,why:`Dans la boucle, ${o.baisse}.`,pts:1},
    {w:`La boucle s'arrête quand ${fxs(o.stop)} : elle fait au plus ${fx(o.max)} tours.`,why:`Un entier naturel qui diminue strictement à chaque tour ne peut le faire qu'un nombre fini de fois. Il y a donc un nombre fini d'itérations, chaque itération se termine, donc l'algorithme s'arrête.`,pts:1}];
  function juge(rep){if(!propre(rep.q))return {incomplet:`Écris une quantité avec les variables de la fonction (${et(V)}), par exemple n - i.`};
    const r=essaieQuantite(P,rep.q);if(r.illisible)return {incomplet:`Je n'arrive pas à lire cette quantité. Écris-la avec les variables ${et(V)}, par exemple n - i.`};
    if(r.ok)return {ok:true};
    const d=r.pb==="diminue"?{etape:1,type:"quantité qui ne diminue pas à chaque tour",titre:"Où ça part : la quantité doit diminuer.",msg:`Pour n = ${r.n}, ta quantité passe de ${r.avant} à ${r.v} d'un tour au suivant : elle ne diminue pas strictement. Regarde quelle variable se rapproche de la valeur qui arrête la boucle.`}
      :r.pb==="négatif"?{etape:0,type:"quantité négative pendant la boucle",titre:"Où ça part : la quantité doit rester positive.",msg:`Pour n = ${r.n}, ta quantité vaut ${r.v} alors que la boucle tourne encore. Une quantité négative pourrait diminuer indéfiniment : elle ne prouve rien.`}
      :{etape:0,type:"quantité qui n'est pas un entier",titre:"Où ça part : la quantité doit être un entier.",msg:`Pour n = ${r.n}, ta quantité vaut ${String(r.v).replace(".",",")} : ce n'est pas un entier. Seul un entier naturel est obligé de s'arrêter de diminuer.`};
    return {ok:false,faux:["q"],resume:"Pas tout à fait : cette quantité ne prouve pas l'arrêt.",diag:d};}
  return {sig:"AR"+texteProg(P).replace(/\s+/g," "),q:`Pour prouver que la boucle « tant que » de cette fonction s'arrête, donne une quantité, écrite avec les variables, qui est un entier positif tant que la boucle tourne et qui diminue strictement à chaque tour. On suppose que n est un entier naturel.`,corps:code(texteProg(P)),
    texte:`${texteProg(P).split("\n").slice(3,-1).map(x=>x.trim()).join(" ; ")} — quantité entière positive qui diminue à chaque tour`,
    champs:[{k:"champ",id:"q",nom:"quantité",label:"Quantité qui diminue :",ex:"par exemple n - i",sym:V.map(v=>[v,v]).concat([["-","-"],["+","+"],["×","*"]]),aide:"Toute quantité qui convient est acceptée : le site l'essaie sur de vraies exécutions."}],juge,etapes:E,
    bonne:fx(o.q),bonneTxt:o.q+" (par exemple)",repBonne:{q:o.tape},repFausse:{q:"n+1"},nature:o.nature,ens:{type:"arret",P}};}
function redacArret(R){const o=boucleArret(R,R()<0.5?"compte":"moitie"),P=o.P,B=boucleDe(P);
  const L=[[`L'expression entière ${fx(o.q)} vaut initialement ${fx(o.depart)}, et elle est positive tant que la boucle tourne.`,`On nomme la quantité, on dit qu'elle est entière et d'où elle part. ${o.pos||`La condition « ${h(ecrit(B.cond))} » garantit qu'elle est positive pendant la boucle.`}`,0.5],
    [`Elle décroît strictement à chaque itération.`,`Dans la boucle, ${o.baisse}. Sur la copie, une phrase suffit, mais il faut le mot « strictement ».`,0.5],
    [`Le tant que s'arrête lorsque ${fxs(o.stop)} : il effectue au maximum ${fx(o.max)} itérations.`,`C'est la forme du corrigé officiel de janvier 2023 : on dit quand la boucle s'arrête, et combien d'itérations elle fait au plus.`,0.5],
    [`Il y a donc un nombre fini d'itérations. Chaque itération se termine. Donc l'algorithme se termine.`,`Les trois phrases du cours (diapo 95), à écrire telles quelles.`,0.5]];
  return {sig:"RAR"+texteProg(P).replace(/\s+/g," "),q:`Prouve que cette fonction s'arrête, pour tout entier naturel n.`,corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(3,-1).map(x=>x.trim()).join(" ; ")} — preuve de l'arrêt`,champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
    etapes:L.map(x=>({w:x[0],why:x[1],pts:x[2]})),bonne:"voir la rédaction",bonneTxt:`quantité ${o.q}, qui décroît strictement`,repBonne:{},nature:"papier, "+o.nature,ens:{type:"arretp",P,tape:o.tape}};}

/* ---------- AG4 : algorithmes récursifs ---------- */
const NOMR=["F","G","H","R"];
/* une fonction récursive à un appel : F(base) = c, F(n) = comb(n, F(n − 1)), avec sa formule quand elle est simple */
function recSimple(R,avecFormule){const nom=R.choix(NOMR),ap=["appel",nom,["-","n",1]],k=R.ent(2,4),c=R.ent(0,3),c1=R.ent(1,4),c2=R.ent(2,5),k3=R.ent(3,5);
  const T=[[["+",ap,"n"],0,"n(n + 1)/2","n(n+1)/2",`${nom}(n − 1) + n`,"(n − 1)n/2 + n = n(n − 1 + 2)/2"],[["*",2,ap],1,"2^{n}","2^n",`2 × ${nom}(n − 1)`,"2 × 2^{n−1}"],[["+",ap,["-",["*",2,"n"],1]],0,"n²","n^2",`${nom}(n − 1) + 2n − 1`,"(n − 1)² + 2n − 1 = n² − 2n + 1 + 2n − 1"],
    [["+",ap,k],c,c?`${k}n + ${c}`:`${k}n`,`${k}n+${c}`,`${nom}(n − 1) + ${k}`,`${c?`${k}(n − 1) + ${c}`:`${k}(n − 1)`} + ${k}`],[["*",3,ap],1,"3^{n}","3^n",`3 × ${nom}(n − 1)`,"3 × 3^{n−1}"],[["+",ap,["*",2,"n"]],0,"n(n + 1)","n(n+1)",`${nom}(n − 1) + 2n`,"(n − 1)n + 2n = n(n − 1 + 2)"],
    [["+",["*",2,ap],1],0,"2^{n} − 1","2^n-1",`2 × ${nom}(n − 1) + 1`,"2(2^{n−1} − 1) + 1 = 2^{n} − 2 + 1"],[["+",ap,"n"],c1,`n(n + 1)/2 + ${c1}`,`n(n+1)/2+${c1}`,`${nom}(n − 1) + n`,`(n − 1)n/2 + ${c1} + n = n(n − 1 + 2)/2 + ${c1}`],
    [["*",2,ap],c2,`${c2} × 2^{n}`,`${c2}*2^n`,`2 × ${nom}(n − 1)`,`2 × ${c2} × 2^{n−1}`],[["+",ap,["+",["*",2,"n"],1]],1,"(n + 1)²","(n+1)^2",`${nom}(n − 1) + 2n + 1`,"n² + 2n + 1"],
    [["+",ap,["*",k3,"n"]],0,kTri(k3,"n"),`${k3}n(n+1)/2`,`${nom}(n − 1) + ${k3}n`,`${k3}(n − 1)n/2 + ${k3}n = ${k3}n(n − 1 + 2)/2`]];
  const autres=[[["*","n",ap],1],[["+",["*",2,ap],1],R.ent(0,2)],[["-",ap,1],R.ent(5,9)],[["+",["*","n","n"],ap],0]];
  const ch=avecFormule?R.choix(T):R()<0.6?R.choix(T):R.choix(autres);
  return {P:{nom,params:["n"],vars:[],corps:[si(["=","n",0],[ret(ch[1])],[ret(ch[0])])]},nom,base:ch[1],ex:ch[0],ferme:ch[2],tape:ch[3],eq:ch[4],calc:ch[5]};}
function valeurRec(R){const o=recSimple(R,false),k=R.ent(3,5),P=o.P,V=[];for(let n=0;n<=k;n++)V.push(joue(P,[n]).ret);const nomK=`${o.nom}(${k})`;
  const E=[{w:`Les appels s'enchaînent jusqu'au cas de base : ${[...Array(k+1)].map((_,i)=>`${o.nom}(${k-i})`).join(" appelle ")}, et ${fx(`${o.nom}(0) = ${ent(o.base)}`)}.`,why:`Chaque appel attend le résultat du suivant. Seul ${o.nom}(0) répond tout de suite : c'est le cas de base.`,pts:1},
    {w:`On remonte : ${V.slice(1).map((v,i)=>fx(`${o.nom}(${i+1}) = ${ent(v)}`)).join(", ")}.`,why:`À chaque niveau, on applique « ${ecrit(o.ex)} » avec le résultat du niveau d'en dessous. Par exemple ${fx(`${o.nom}(1)`)} se calcule avec ${fx(`${o.nom}(0) = ${ent(o.base)}`)} et n = 1.`,pts:1.5},
    {w:`<b>${fx(`${nomK} = ${ent(V[k])}`)}</b>`,why:"C'est la dernière valeur de la remontée.",pts:0.5}];
  function juge(rep){const v=nombre((rep.c||{})[nomK]);if(!v||v.d!==1)return {incomplet:"Écris la valeur renvoyée : un nombre entier."};if(v.n===V[k])return {ok:true};
    const i=V.indexOf(v.n);return {ok:false,faux:[nomK],resume:"Pas tout à fait : ce n'est pas la valeur renvoyée.",diag:i>=0?{etape:1,type:"remontée arrêtée un niveau trop tôt ou trop tard",titre:"Où ça part : le nombre de niveaux.",msg:`${ent(v.n)} est la valeur de ${fx(`${o.nom}(${i})`)}. Il faut remonter jusqu'à ${fx(nomK)}.`}:{etape:1,type:"calcul d'un niveau de la remontée",titre:"Où ça part : la remontée.",msg:`Vérifie chaque niveau : ${V.slice(0,3).map((x,j)=>fx(`${o.nom}(${j}) = ${ent(x)}`)).join(", ")}, et ainsi de suite.`}};}
  return {sig:"VR"+texteProg(P).replace(/\s+/g," ")+k,q:`Voici une fonction récursive. Que renvoie ${fx(nomK)} ?`,corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(2,-1).map(x=>x.trim()).join(" ; ")} — valeur de ${nomK}`,
    champs:[{k:"cases",id:"c",noms:[nomK]}],juge,etapes:E,bonne:fx(`${nomK} = ${ent(V[k])}`),bonneTxt:`${nomK} = ${ent(V[k])}`,repBonne:{c:{[nomK]:String(V[k])}},repFausse:{c:{[nomK]:String(V[k-1]===V[k]?V[k]+1:V[k-1])}},nature:"valeur",ens:{type:"rec",P,args:[k]}};}
function ordreAff(R){const nom=R.choix(["P","Q","Aff"]),k=R.ent(3,5),t=R.ent(0,4),pas=t===4?["div","n",2]:["-","n",R()<0.8?1:2],quoi=R.choix(["n","n",["*",2,"n"],["+","n",1]]),A=ecrire(quoi),C=appelS(nom,pas),n0=t===4?R.choix([6,9,12,20]):k;
  const corps=t===0?[A,C]:t===1?[C,A]:t===2?[A,C,A]:t===3?[C,A]:[C,A],P={nom,params:["n"],vars:[],proc:true,corps:[si([">","n",0],corps)]},X=joue(P,[n0]),att=X.aff;
  const avant=corps[0]===A,apres=corps[corps.length-1]===A,CH=[n0];while(CH[CH.length-1]>0)CH.push(vaut(pas,{n:CH[CH.length-1]}));const dernier=fx(`${nom}(${ent(CH[CH.length-1])})`);
  const E=[{w:`Les appels successifs : ${CH.map(v=>fx(`${nom}(${ent(v)})`)).join(", ")}. Le dernier, ${dernier}, n'affiche rien et ne fait pas d'appel : n n'est plus strictement positif.`,why:`On écrit d'abord la chaîne des appels, sans s'occuper des affichages : chaque appel recalcule n avec « ${ecrit(pas)} ».`,pts:1},
    {w:avant&&apres?"Chaque appel affiche une fois avant son appel récursif, et une fois après.":avant?"Chaque appel affiche avant son appel récursif : les affichages se font en descendant, du premier appel au dernier.":"Chaque appel affiche après son appel récursif : il attend que tous les appels suivants soient finis. Les affichages se font en remontant, du dernier appel au premier.",why:"C'est la place de la ligne « affiche » par rapport à l'appel récursif qui décide de l'ordre.",pts:1},
    {w:`<b>Nombres affichés, dans l'ordre : ${att.map(ent).join(" ")}</b>`,why:`${att.length} ${att.length>1?"affichages":"affichage"} en tout.`,pts:1}];
  function juge(rep){const L=propre(rep.s).split(/[\s,;]+/).filter(Boolean).map(x=>nombre(x));if(!L.length||L.some(x=>!x||x.d!==1))return {incomplet:"Écris les nombres affichés, dans l'ordre, séparés par des espaces : par exemple 3 2 1."};
    const V=L.map(x=>x.n);if(V.length===att.length&&V.every((x,i)=>x===att[i]))return {ok:true};
    const inv=V.length===att.length&&V.every((x,i)=>x===att[att.length-1-i]),tri=a=>a.slice().sort((x,y)=>x-y).join(),memes=tri(V)===tri(att);
    return {ok:false,faux:["s"],resume:"Pas tout à fait : ce n'est pas ce qui est affiché.",diag:inv?{etape:1,type:"ordre des affichages inversé",titre:"Où ça part : avant ou après l'appel.",msg:avant?"La ligne « affiche » est écrite avant l'appel récursif : chaque appel affiche d'abord, puis appelle le suivant.":"La ligne « affiche » est écrite après l'appel récursif : le premier appel n'affiche qu'à la toute fin, quand tous les autres ont fini."}
      :memes?{etape:1,type:"ordre des affichages",titre:"Où ça part : l'ordre.",msg:"Les nombres sont les bons, mais pas leur ordre. Suis chaque appel ligne par ligne : il ne passe à la ligne suivante que lorsque l'appel récursif est complètement terminé."}
      :{etape:0,type:"chaîne des appels récursifs",titre:"Où ça part : les appels.",msg:`Il y a ${att.length} ${att.length>1?"affichages":"affichage"}. Écris la valeur de n à chaque appel, puis ce que chacun affiche.`}};}
  return {sig:"OA"+texteProg(P).replace(/\s+/g," ")+n0,q:`Voici une procédure récursive. « affiche(x) » écrit le nombre x à l'écran. Quels nombres ${fx(`${nom}(${n0})`)} affiche-t-elle, dans l'ordre ?`,corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(2,-1).map(x=>x.trim()).join(" ; ")} — affichages de ${nom}(${n0})`,
    champs:[{k:"champ",id:"s",nom:"affichages",label:"Nombres affichés, dans l'ordre :",ex:"par exemple 3 2 1",apercu:false}],juge,etapes:E,bonne:att.map(ent).join(" "),bonneTxt:att.join(" "),repBonne:{s:att.join(" ")},repFausse:{s:att.slice().reverse().join(" ")+(att.length<2||att.every((x,i)=>x===att[att.length-1-i])?" 0":"")},nature:avant&&apres?"avant et après":avant?"avant":"après",ens:{type:"aff",P,args:[n0]}};}
function deuxAppels(R){const nom=R.choix(NOMR),a1=["appel",nom,["-","n",1]],a2=["appel",nom,["-","n",2]],t=R.ent(0,3),k=R.ent(3,5);
  const ex=t===0?["+",a1,a2]:t===1?["+",a1,a1]:t===2?["+",["+",a1,a2],1]:["+",a1,["*",2,a2]],P={nom,params:["n"],vars:[],corps:[si(["≤","n",1],[ret(R.choix([1,1,"n"]))],[ret(ex)])]};
  const V=[],A=[];for(let n=0;n<=k;n++){const X=joue(P,[n]);V.push(X.ret);A.push(X.appels);}const nomK=`${nom}(${k})`,deux=t===1?"n − 1 deux fois":"n − 1 et n − 2";
  const E=[{w:`Les valeurs, en partant du cas de base : ${V.map((v,i)=>fx(`${nom}(${i}) = ${ent(v)}`)).join(", ")}.`,why:`Pour n ≤ 1, la fonction répond tout de suite. Ensuite, chaque valeur se calcule avec ${t===1?"la précédente":"les deux précédentes"}.`,pts:1.5},
    {w:`Le nombre d'appels : ${A.map((v,i)=>`${v} pour ${nom}(${i})`).join(", ")}.`,why:`Un appel avec n ≤ 1 compte pour 1. Sinon, l'appel lui-même compte pour 1, et il lance deux appels (${deux}) : on ajoute leurs nombres d'appels. On construit ce tableau de proche en proche, comme pour les valeurs.`,pts:1.5}];
  function juge(rep){const v=nombre((rep.c||{})[nomK]),a=nombre(rep.a);if(!v||v.d!==1)return {incomplet:"Écris la valeur renvoyée : un nombre entier."};if(!a||a.d!==1)return {incomplet:"Écris aussi le nombre d'appels en tout, le premier compris."};
    const okV=v.n===V[k],okA=a.n===A[k],F=[];if(okV&&okA)return {ok:true};if(!okV)F.push(nomK);if(!okA)F.push("a");
    const d=!okV?{etape:0,type:"valeur d'une fonction à deux appels récursifs",titre:"Où ça part : la valeur.",msg:`Construis les valeurs dans l'ordre : ${V.slice(0,4).map((x,i)=>fx(`${nom}(${i}) = ${ent(x)}`)).join(", ")}.`}
      :a.n===A[k]-1?{etape:1,type:"premier appel non compté",titre:"Où ça part : le premier appel.",msg:`Il faut compter aussi l'appel de départ, ${fx(nomK)} lui-même.`}:{etape:1,type:"nombre d'appels d'une fonction à deux appels récursifs",titre:"Où ça part : le nombre d'appels.",msg:`Chaque appel avec n > 1 en lance deux autres : appels(n) = 1 + appels de chacun. Ici : ${A.slice(0,4).map((x,i)=>`${x} pour n = ${i}`).join(", ")}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"la valeur et le nombre d'appels sont à revoir":F[0]==="a"?"le nombre d'appels est à revoir":"la valeur est à revoir"}.`,diag:d};}
  return {sig:"DA"+texteProg(P).replace(/\s+/g," ")+k,q:`Voici une fonction récursive qui s'appelle deux fois. Que renvoie ${fx(nomK)} ? Combien d'appels de ${nom} sont faits en tout, en comptant le premier ?`,corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(2,-1).map(x=>x.trim()).join(" ; ")} — valeur de ${nomK} et nombre d'appels`,
    champs:[{k:"cases",id:"c",noms:[nomK]},{k:"champ",id:"a",nom:"nombre d'appels",label:"Nombre d'appels en tout :",ex:"un entier"}],juge,etapes:E,bonne:`${fx(`${nomK} = ${ent(V[k])}`)} ; ${A[k]} appels`,bonneTxt:`${nomK} = ${ent(V[k])} ; ${A[k]} appels`,
    repBonne:{c:{[nomK]:String(V[k])},a:String(A[k])},repFausse:{c:{[nomK]:String(V[k])},a:String(A[k]-1)},nature:"deux appels",ens:{type:"rec2",P,args:[k]}};}
/* comme les sujets de 2023 : G(n, d) affiche des lignes */
function procedureG(R){const nom="G",t=R.ent(0,3),div=R.choix([2,2,3]),n0=div===3?R.choix([9,10,11,12]):R.choix([5,6,7,9,10,11,12]),quoi=t===3?R.choix(["d",["+","n","d"]]):"d",suiv=t===3?appelS(nom,["-","n",1],["+","d",1]):appelS(nom,["div","n",div],R()<0.8?["+","d",1]:"d");
  const bloc=[pour("i",1,"n",[ecrire(quoi)]),aLaLigne()],n1=t===3?R.ent(3,5):n0,corps=t===1||t===3?[suiv].concat(bloc):bloc.concat([suiv]);
  const P={nom,params:["n","d"],vars:["i"],proc:true,corps:[si(["≠","n",0],corps)]},X=joue(P,[n1,0]),att=X.lignes,apres=corps[0]===suiv;
  const chaine=[];{let n=n1,d=0;while(n!==0&&chaine.length<12){chaine.push([n,d]);const s=suiv.args;n=vaut(s[0],{n,d});d=vaut(s[1],{n,d:chaine[chaine.length-1][1]});}}
  const E=[{w:`Les appels : ${chaine.map(c=>fx(`${nom}(${c[0]}, ${c[1]})`)).join(", ")}, puis un appel avec n = 0 qui ne fait rien.`,why:"À chaque appel, on recalcule les deux paramètres avec la ligne de l'appel récursif.",pts:1},
    {w:`Chaque appel affiche une ligne : n fois le nombre ${fx(ecrit(quoi))}, puis un retour à la ligne.`,why:`La boucle « pour i de 1 à n » répète l'affichage n fois, sans espace. Par exemple ${fx(`${nom}(${chaine[0][0]}, ${chaine[0][1]})`)} écrit ${chaine[0][0]} fois le nombre ${ent(vaut(quoi,{n:chaine[0][0],d:chaine[0][1]}))}.`,pts:1},
    {w:apres?"L'appel récursif est écrit avant la boucle : la ligne du premier appel sort en dernier.":"L'appel récursif est écrit après le retour à la ligne : les lignes sortent dans l'ordre des appels.",why:"Un appel ne passe à sa ligne suivante que lorsque l'appel récursif est complètement terminé.",pts:1},
    {w:`<b>Ce qui est affiché :</b> ${code(att.join("\n"))}`,why:`${att.length} lignes, une par appel avec n différent de 0.`,pts:1}];
  const net=x=>propre(x).replace(/\s+/g,"");
  function juge(rep){let L=(rep.t||[]).map(r=>net(r[0]||""));while(L.length&&!L[L.length-1])L.pop();if(!L.length)return {incomplet:"Écris ce qui est affiché, une ligne d'écran par ligne du tableau."};if(L.some(x=>!x))return {incomplet:"Il reste une ligne vide au milieu. Enlève-la, ou écris ce qu'elle contient."};
    if(L.length===att.length&&L.every((x,i)=>x===att[i]))return {ok:true};
    const inv=L.length===att.length&&L.every((x,i)=>x===att[att.length-1-i]),i=L.findIndex((x,j)=>x!==att[j]);
    return {ok:false,faux:i>=0&&i<att.length?[`t:${i}:0`]:[],resume:"Pas tout à fait : ce n'est pas ce qui est affiché.",diag:inv?{etape:2,type:"ordre des lignes inversé",titre:"Où ça part : l'ordre des lignes.",msg:apres?"L'appel récursif est écrit avant la boucle : chaque appel attend la fin de tous les suivants avant d'afficher sa ligne.":"L'appel récursif est écrit après l'affichage : chaque appel affiche d'abord sa ligne."}
      :L.length!==att.length?{etape:0,type:"nombre de lignes affichées",titre:"Où ça part : le nombre d'appels.",msg:`Il y a ${att.length} lignes : une par appel avec n différent de 0. Écris la chaîne des appels avec leurs deux paramètres.`}
      :{etape:1,type:"contenu d'une ligne affichée",titre:`Où ça part : la ligne ${i+1}.`,msg:`La ligne ${i+1} est « ${att[i]} » : le nombre affiché est répété n fois, avec les valeurs de n et de d de cet appel.`}};}
  return {sig:"PG"+texteProg(P).replace(/\s+/g," ")+n1,q:`Voici une procédure récursive à deux paramètres. « affiche(x) » écrit le nombre x sans aller à la ligne, « aLaLigne() » passe à la ligne. Qu'affiche ${fx(`${nom}(${n1}, 0)`)} ? Écris une ligne d'écran par ligne du tableau.`,corps:code(texteProg(P)),
    texte:`${texteProg(P).split("\n").slice(3,-1).map(x=>x.trim()).join(" ; ")} — affichage de ${nom}(${n1}, 0)`,champs:[{k:"trace",id:"t",vars:["ce qui est affiché"],lignes:2,rangs:true}],juge,etapes:E,
    bonne:code(att.join("\n")),bonneTxt:att.join(" / "),repBonne:{t:att.map(x=>[x])},repFausse:{t:att.slice().reverse().map((x,i)=>[i?x:x+"0"])},nature:apres?"appel d'abord":"affichage d'abord",ens:{type:"proc",P,args:[n1,0]}};}
/* comme l'examen de janvier 2023 : G(n, d) affiche sa ligne et s'appelle deux fois, avec d puis d + 1 */
function procedureDeux(R){const nom="G",div=R.choix([2,2,3]),n0=div===2?R.choix([4,5,6,7]):R.choix([9,10,11]),d0=R.choix([0,0,1]),inverse=R()<0.4,place=R.choix([0,0,1,2]);
  const c1=appelS(nom,["div","n",div],"d"),c2=appelS(nom,["div","n",div],["+","d",1]),ap=inverse?[c2,c1]:[c1,c2],bloc=[pour("i",1,"n",[ecrire("d")]),aLaLigne()];
  const corps=place===0?bloc.concat(ap):place===1?ap.concat(bloc):[ap[0]].concat(bloc,[ap[1]]);
  const P={nom,params:["n","d"],vars:["i"],proc:true,corps:[si(["≠","n",0],corps)]},att=joue(P,[n0,d0]).lignes,G_=(n,d)=>fx(`${nom}(${n}, ${d})`);
  const fils=(n,d)=>ap.map(c=>[vaut(c.args[0],{n,d}),vaut(c.args[1],{n,d})]),arbre=[];
  (function va(n,d){if(!n)return;const F=fils(n,d);if(F[0][0])arbre.push(`${G_(n,d)} lance ${G_(...F[0])} puis ${G_(...F[1])}`);F.forEach(f=>va(...f));})(n0,d0);
  const ordre=place===0?`Chaque appel écrit d'abord sa ligne, puis il lance ses deux appels l'un après l'autre. Le premier appel récursif écrit toutes ses lignes (et celles de ses propres appels) avant que le second commence.`
    :place===1?`Chaque appel lance d'abord ses deux appels, et n'écrit sa ligne qu'après eux : la ligne de ${G_(n0,d0)} sort en dernier.`
    :`Chaque appel lance son premier appel récursif, écrit sa ligne, puis lance le second : la ligne de ${G_(n0,d0)} sort au milieu.`;
  const E=[{w:`L'arbre des appels : ${arbre.join(" ; ")}. Ensuite, chaque appel avec ${fx(`n &lt; ${div}`)} lance deux appels avec n = 0, qui ne font rien.`,why:`Avec n = ${n0}, « n div ${div} » donne ${vaut(["div",n0,div],{})}. On dessine l'arbre avant de s'occuper des affichages : chaque appel a deux fils, ${inverse?"d'abord celui avec d + 1, puis celui avec d":"d'abord celui avec d, puis celui avec d + 1"}.`,pts:1.5},
    {w:`Chaque appel ${fx("G(n, d)")} avec n ≠ 0 écrit une ligne : n fois le chiffre d, puis un retour à la ligne.`,why:`La boucle « pour i de 1 à n » répète affiche(d) n fois, sans espace. Par exemple ${G_(n0,d0)} écrit ${n0} fois le chiffre ${d0}.`,pts:1},
    {w:place===0?"La ligne d'un appel sort avant celles de ses deux appels récursifs.":place===1?"La ligne d'un appel sort après celles de ses deux appels récursifs.":"La ligne d'un appel sort entre celles de son premier appel et celles de son second.",why:ordre,pts:1},
    {w:`<b>Ce qui est affiché :</b> ${code(att.join("\n"))}`,why:`${att.length} lignes, une par appel avec n différent de 0.`,pts:1.5}];
  const net=x=>propre(x).replace(/\s+/g,"");
  function juge(rep){let L=(rep.t||[]).map(r=>net(r[0]||""));while(L.length&&!L[L.length-1])L.pop();if(!L.length)return {incomplet:"Écris ce qui est affiché, une ligne d'écran par ligne du tableau."};if(L.some(x=>!x))return {incomplet:"Il reste une ligne vide au milieu. Enlève-la, ou écris ce qu'elle contient."};
    if(L.length===att.length&&L.every((x,i)=>x===att[i]))return {ok:true};
    const tri=a=>a.slice().sort().join("|"),memes=L.length===att.length&&tri(L)===tri(att),i=L.findIndex((x,j)=>x!==att[j]);
    return {ok:false,faux:i>=0&&i<att.length?[`t:${i}:0`]:[],resume:"Pas tout à fait : ce n'est pas ce qui est affiché.",diag:L.length!==att.length?{etape:0,type:"nombre d'appels d'une procédure à deux appels récursifs",titre:"Où ça part : l'arbre des appels.",msg:`Il y a ${att.length} lignes : une par appel avec n différent de 0. Chaque appel avec n ≠ 0 en lance deux : dessine l'arbre en entier.`}
      :memes?{etape:2,type:"ordre des lignes avec deux appels récursifs",titre:"Où ça part : l'ordre des lignes.",msg:`Les lignes sont les bonnes, mais pas leur ordre. ${ordre}`}
      :{etape:1,type:"contenu d'une ligne affichée",titre:`Où ça part : la ligne ${i+1}.`,msg:`La ligne ${i+1} est « ${att[i]} » : le chiffre d de cet appel, répété n fois.`}};}
  return {sig:"P2"+texteProg(P).replace(/\s+/g," ")+n0+","+d0,q:`Voici une procédure récursive à deux paramètres, qui s'appelle deux fois. « affiche(x) » écrit le nombre x sans aller à la ligne, « aLaLigne() » passe à la ligne. Qu'affiche ${G_(n0,d0)} ? Écris une ligne d'écran par ligne du tableau.`,corps:code(texteProg(P)),
    texte:`${texteProg(P).split("\n").slice(3,-1).map(x=>x.trim()).join(" ; ")} — affichage de ${nom}(${n0}, ${d0})`,champs:[{k:"trace",id:"t",vars:["ce qui est affiché"],lignes:2,rangs:true}],juge,etapes:E,
    bonne:code(att.join("\n")),bonneTxt:att.join(" / "),repBonne:{t:att.map(x=>[x])},repFausse:{t:att.slice().reverse().map((x,i)=>[i?x:x+"0"])},nature:["ligne puis appels","appels puis ligne","ligne entre les appels"][place],ens:{type:"proc2",P,args:[n0,d0],div,arbre:arbre.length}};}
/* la formule de ce que calcule F ; sur papier, la preuve par récurrence du cours */
function formuleRec(R){const o=recSimple(R,true),P=o.P,nom=o.nom,KS=[0,1,2,3,4,5,6,7],V=KS.map(n=>joue(P,[n]).ret),hyp=o.ferme.replace(/n/g,"(n − 1)").replace("(n − 1)((n − 1) + 1)","(n − 1)n").replace("^{(n − 1)}","^{n−1}").replace("(n − 1)²","(n − 1)²");
  const E=[{w:`Équations de récurrence : ${fx(`${nom}(0) = ${ent(o.base)}`)} et, pour ${fx("n &gt; 0")}, ${fx(`${nom}(n) = ${o.eq}`)}.`,why:"C'est la « vérité » : on la lit sur l'algorithme, une ligne pour le cas de base et une pour l'appel récursif.",pts:1},
    {w:`Invariant de récursion : ${fx("Inv_{n}")} : « ${fx(`${nom}(n) = ${o.ferme}`)} ».`,why:`C'est l'« hypothèse à prouver ». On la devine sur les premières valeurs : ${V.slice(0,5).map(ent).join(", ")}.`,pts:1},
    {w:`Initialisation : pour n = 0, ${fx(`${nom}(0) = ${ent(o.base)}`)} d'après les équations de récurrence, et la formule donne bien ${ent(o.base)} : ${fx("Inv_{0}")} est vrai.`,why:"On vérifie l'invariant pour le cas de base.",pts:0.5},
    {w:`Récurrence : pour ${fx("n &gt; 0")}, si ${fx("Inv_{n−1}")} est vrai, alors ${fx(`${nom}(n) = ${o.eq}`)} donne ${fx(o.calc)}, c'est-à-dire ${fx(o.ferme)} : ${fx("Inv_{n}")} est vrai.`,why:`On remplace ${fx(`${nom}(n − 1)`)} par sa formule, celle de l'invariant au rang n − 1, dans l'équation de récurrence.`,pts:1.5},
    {w:`Conclusion : pour tout entier naturel n, <b>${fx(`${nom}(n) = ${o.ferme}`)}</b>.`,why:"L'invariant est vrai à tous les rangs : l'algorithme renvoie bien cette valeur.",pts:1}];
  function juge(rep){if(!propre(rep.f))return {incomplet:`Écris ce que renvoie ${nom}(n), avec la lettre n.`};const W=KS.map(n=>calc(rep.f,{n}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à lire cette formule. Écris-la avec la lettre n, par exemple n(n+1)/2 ou 2^n."};
    if(KS.every((n,i)=>Math.abs(W[i]-V[i])<1e-9))return {ok:true};const n=KS.find((n,i)=>Math.abs(W[i]-V[i])>=1e-9);
    return {ok:false,faux:["f"],resume:"Pas tout à fait : ce n'est pas la bonne formule.",diag:{etape:1,type:"formule de ce que calcule une fonction récursive",titre:"Où ça part : la formule.",msg:`Pour n = ${n}, ta formule donne ${String(Math.round(W[n]*1000)/1000).replace(".",",")}, alors que ${fx(`${nom}(${n}) = ${ent(V[n])}`)}. Calcule les premières valeurs : ${V.slice(0,5).map(ent).join(", ")}.`}};}
  return {sig:"FR"+texteProg(P).replace(/\s+/g," "),q:`Voici une fonction récursive. Donne, en fonction de n, ce que renvoie ${fx(`${nom}(n)`)} pour tout entier naturel n. Sur papier, tu le démontres par récurrence avec la méthode du cours.`,corps:code(texteProg(P)),texte:`${texteProg(P).split("\n").slice(2,-1).map(x=>x.trim()).join(" ; ")} — formule de ${nom}(n), puis preuve par récurrence`,
    champs:[{k:"champ",id:"f",nom:"formule",label:`$${nom}(n) =$`,ex:"une formule avec n",sym:[["n","n"],["^","^"],["/","/"],["(","("],[")",")"]]}],juge,etapes:E,bonne:fx(`${nom}(n) = ${o.ferme}`),bonneTxt:`${nom}(n) = ${o.ferme.replace(/[{}]/g,"")}`,repBonne:{f:o.tape},repFausse:{f:"("+o.tape+")+n"},nature:"formule",ens:{type:"formule",P}};}

/* ---------- AG8 : trouver la ligne fausse, écrire la ligne manquante ---------- */
/* les lignes du corps d'un programme, chacune avec l'instruction qu'elle écrit (null pour « sinon » et les « fin ») */
function lignesNum(P){const L=[];const va=(C,niv)=>{const I="    ".repeat(niv);C.forEach(s=>{
  if(s.k==="aff")L.push({t:`${I}${s.v} ← ${ecrit(s.e)}`,n:s});
  else if(s.k==="pour"){L.push({t:`${I}pour ${s.v} de ${ecrit(s.a)} à ${ecrit(s.b)} faire`,n:s});va(s.c,niv+1);L.push({t:`${I}fin pour;`,n:null});}
  else if(s.k==="tq"){L.push({t:`${I}tant que ${ecrit(s.cond)} faire`,n:s});va(s.c,niv+1);L.push({t:`${I}fin tq;`,n:null});}
  else if(s.k==="si"){L.push({t:`${I}si ${ecrit(s.cond)} alors`,n:s});va(s.alors,niv+1);if(s.sinon){L.push({t:`${I}sinon`,n:null});va(s.sinon,niv+1);}L.push({t:`${I}fin si;`,n:null});}
  else L.push({t:`${I}Renvoyer ${ecrit(s.e)}`,n:s});});};va(P.corps,1);return L;}
/* une expression tapée → le même arbre que le mini-langage ; null si elle ne se lit pas */
function lisExpr(src){const T=[];let m;const re=/\s*(\d+|[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*|≤|≥|≠|[-+*()<>=,])/y;re.lastIndex=0;
  const t=src.replace(/<=|=</g,"≤").replace(/>=|=>/g,"≥").replace(/!=|<>/g,"≠").replace(/[×·]/g,"*").replace(/[−–]/g,"-").replace(/&&|\band\b/gi," et ").replace(/\|\||\bor\b/gi," ou ").replace(/(^|[^\w\]])(\d+)([A-Za-z(])/g,"$1$2 * $3").trim();
  while(re.lastIndex<t.length){m=re.exec(t);if(!m)return null;T.push(m[1]);}
  let p=0;const nx=()=>T[p],low=x=>x===undefined?x:x.toLowerCase();
  const prim=()=>{const x=nx();if(x===undefined)return null;
    if(x==="("){p++;const e=ou();if(e===null||nx()!==")")return null;p++;return e;}
    if(x==="-"){p++;const e=prim();return e===null?null:typeof e==="number"?-e:["-",0,e];}
    if(/^\d+$/.test(x)){p++;return +x;}
    if(/^[A-Za-zÀ-ÿ_]/.test(x)&&!["div","mod","et","ou"].includes(low(x))){p++;if(nx()==="("){p++;const A=[];if(nx()!==")"){for(;;){const e=ou();if(e===null)return null;A.push(e);if(nx()===","){p++;continue;}break;}}if(nx()!==")")return null;p++;return ["appel",x].concat(A);}return x;}
    return null;};
  const niveau=(suiv,ops)=>()=>{let a=suiv();while(a!==null&&ops.includes(low(nx()))){const o=low(T[p++]),b=suiv();a=b===null?null:[o,a,b];}return a;};
  const mul=niveau(prim,["*","div","mod"]),add=niveau(mul,["+","-"]),cmp=niveau(add,["<","≤",">","≥","=","≠"]),et_=niveau(cmp,["et"]),ou=niveau(et_,["ou"]);
  const e=ou();return e!==null&&p===T.length?e:null;}
/* une ligne tapée → {k, …} comme une instruction, ou null */
function lisLigne(src){const t=propre(src).replace(/<-|:=/g,"←").replace(/;$/,"").trim();let m;
  if((m=/^pour\s+([A-Za-z])\s+(?:allant\s+)?de\s+(.+?)\s+(?:à|a)\s+(.+?)(?:\s+faire)?$/i.exec(t))){const a=lisExpr(m[2]),b=lisExpr(m[3]);return a===null||b===null?null:{k:"pour",v:m[1],a,b};}
  if((m=/^tant\s*que\s+(.+?)(?:\s+faire)?$/i.exec(t))){const c=lisExpr(m[1]);return c===null?null:{k:"tq",cond:c};}
  if((m=/^si\s+(.+?)(?:\s+alors)?$/i.exec(t))){const c=lisExpr(m[1]);return c===null?null:{k:"si",cond:c};}
  if((m=/^(?:renvoyer|retourner)\s+(.+)$/i.exec(t))){const e=lisExpr(m[1]);return e===null?null:{k:"ret",e};}
  if((m=/^([A-Za-z])\s*←\s*(.+)$/.exec(t))){const e=lisExpr(m[2]);return e===null?null:{k:"aff",v:m[1],e};}
  return null;}
const SORTE={aff:"une affectation, comme « s ← s + i »",pour:"un début de boucle « pour … de … à … faire »",tq:"un début de boucle « tant que … faire »",si:"un test « si … alors »",ret:"une ligne « Renvoyer … »"};
const clone=x=>JSON.parse(JSON.stringify(x));
/* les programmes du cours, ce qu'ils doivent calculer, et les fautes possibles */
function programmeJuste(R,rec){const nom=R.choix(["F","G","H","Calc"]),ap=["appel",nom,["-","n",1]];
  const IT=[{dit:"la somme 1 + 2 + … + n",P:{nom,params:["n"],vars:["s","i"],corps:[aff("s",0),pour("i",1,"n",[aff("s",["+","s","i"])]),ret("s")]}},
    {dit:"le produit 1 × 2 × … × n, c'est-à-dire n! (et 1 pour n = 0)",P:{nom,params:["n"],vars:["p","i"],corps:[aff("p",1),pour("i",1,"n",[aff("p",["*","p","i"])]),ret("p")]}},
    {dit:"2 puissance n",P:{nom,params:["n"],vars:["p","i"],corps:[aff("p",1),pour("i",1,"n",[aff("p",["*","p",2])]),ret("p")]}},
    {dit:"la somme des carrés 1² + 2² + … + n²",P:{nom,params:["n"],vars:["s","i"],corps:[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["*","i","i"]])]),ret("s")]}},
    {dit:"la somme 2 + 4 + … + 2n",P:{nom,params:["n"],vars:["s","i"],corps:[aff("s",0),pour("i",1,"n",[aff("s",["+","s",["*",2,"i"]])]),ret("s")]}},
    {dit:"la somme 1 + 2 + … + n",P:{nom,params:["n"],vars:["s","c"],corps:[aff("s",0),aff("c","n"),tq([">","c",0],[aff("s",["+","s","c"]),aff("c",["-","c",1])]),ret("s")]}}];
  const RC=[{dit:"n!, c'est-à-dire 1 × 2 × … × n (et 1 pour n = 0)",P:{nom,params:["n"],vars:[],corps:[si(["=","n",0],[ret(1)],[ret(["*","n",ap])])]}},
    {dit:"la somme 1 + 2 + … + n (et 0 pour n = 0)",P:{nom,params:["n"],vars:[],corps:[si(["=","n",0],[ret(0)],[ret(["+","n",ap])])]}},
    {dit:"2 puissance n",P:{nom,params:["n"],vars:[],corps:[si(["=","n",0],[ret(1)],[ret(["*",2,ap])])]}},
    {dit:"n², en additionnant les n premiers nombres impairs",P:{nom,params:["n"],vars:[],corps:[si(["=","n",0],[ret(0)],[ret(["-",["+",ap,["*",2,"n"]],1])])]}}];
  return R.choix(rec?RC:IT);}
function fautes(P,sorte){const L=lignesNum(P),F=[];L.forEach((l,i)=>{const s=l.n;if(!s)return;const add=f=>{const Q=clone(P),q=lignesNum(Q)[i].n;f(q);F.push({i,Q});};
  if(sorte==="borne"&&s.k==="pour"){add(q=>{q.b=["-","n",1];});add(q=>{q.b=["+","n",1];});add(q=>{q.a=0;});add(q=>{q.a=2;});}
  if(sorte==="borne"&&s.k==="tq"){add(q=>{q.cond=[">","c",1];});add(q=>{q.cond=["≥","c",0];});}
  if(sorte==="init"&&s.k==="aff"&&typeof s.e==="number"){add(q=>{q.e=s.e===0?1:0;});add(q=>{q.e=s.e+2;});}
  if(sorte==="base"&&s.k==="ret"&&typeof s.e==="number"){add(q=>{q.e=s.e===0?1:0;});add(q=>{q.e=s.e+2;});}
  if(sorte==="base"&&s.k==="si"){add(q=>{q.cond=["=","n",1];});}
  if(sorte==="appel"&&s.k==="ret"&&typeof s.e!=="number"){const remplace=(e,f)=>Array.isArray(e)?(e[0]==="appel"?f(e):e.map((x,j)=>j?remplace(x,f):x)):e;
    add(q=>{q.e=remplace(q.e,a=>["appel",a[1],"n"]);});add(q=>{q.e=remplace(q.e,a=>["appel",a[1],["-","n",2]]);});if(s.e[0]==="*"||s.e[0]==="+")add(q=>{q.e=[q.e[0]==="*"?"+":"*",q.e[1],q.e[2]];});add(q=>{q.e=remplace(q.e,a=>["appel",a[1],["+","n",1]]);});}});
  return F;}
const ESSAIS=[0,1,2,3,4,5,6];
const resultats=P=>ESSAIS.map(n=>{try{const r=joue(P,[n]).ret;return Number.isFinite(r)?r:"rien";}catch(e){return "ne s'arrête pas";}});
function ligneFausse(R,sorte){for(;;){const o=programmeJuste(R,sorte==="base"||sorte==="appel"),P0=o.P,bon=resultats(P0),F=fautes(P0,sorte).filter(f=>resultats(f.Q).some((x,j)=>x!==bon[j]));if(!F.length)continue;
  const f=R.choix(F),efface=R()<0.4,L0=lignesNum(P0),L1=lignesNum(f.Q),num=f.i+1,mauvais=resultats(f.Q),j=ESSAIS.findIndex((n,k)=>mauvais[k]!==bon[k]),nom=P0.nom;
  const entete=texteProg(P0).split("\n"),debut=entete.indexOf("DÉBUT"),montre=L1.map((l,i)=>String(i+1).padStart(2," ")+"  "+(efface&&i===f.i?l.t.replace(/\S.*$/,"…"):l.t));
  const texte=entete.slice(0,debut+1).concat(montre,["FIN"]).join("\n"),sorteL=L0[f.i].n.k;
  const E=[{w:efface?`La ligne ${num} doit être ${SORTE[sorteL].replace(/, comme.*/,"")}.`:`On essaie sur un petit cas : ${fx(`${nom}(${ESSAIS[j]})`)} devrait valoir ${ent(bon[j])}, et la fonction ${mauvais[j]==="ne s'arrête pas"?"ne s'arrête jamais":`renvoie ${typeof mauvais[j]==="number"?ent(mauvais[j]):"autre chose"}`}.`,why:efface?`On regarde ce qui manque pour calculer ${o.dit} : ${sorteL==="aff"?"une variable n'est pas mise à jour, ou pas initialisée":sorteL==="pour"?"les lignes d'en dessous doivent être répétées":sorteL==="ret"?"il manque la valeur renvoyée":"il manque le test"}.`:`Pour trouver une faute, on exécute la fonction à la main sur une petite valeur, et on compare avec ce qu'elle doit calculer : ${o.dit}.`,pts:1},
    {w:efface?`Elle sert à ${sorteL==="pour"?"faire prendre à i toutes les valeurs utiles":sorteL==="ret"?"donner le résultat de ce cas":sorteL==="si"?"reconnaître le cas de base":"donner la bonne valeur à la variable"}.`:`<b>La ligne fausse est la ligne ${num}</b> : « ${h(L1[f.i].t.trim())} ».`,why:{borne:"Les bornes d'une boucle disent combien de tours elle fait, et avec quelles valeurs. Un tour de trop, un tour de moins, ou un départ décalé changent le résultat.",init:"La valeur de départ doit être celle qui ne change rien : 0 pour une somme, 1 pour un produit.",base:"Le cas de base donne la réponse pour la plus petite valeur. S'il est faux, toutes les autres valeurs le sont, car elles se calculent à partir de lui.",appel:"L'appel récursif doit se faire sur une valeur plus petite, qui se rapproche du cas de base, et le résultat doit être combiné comme le demande la définition."}[sorte],pts:1},
    {w:`La ligne ${efface?"à écrire":"corrigée"} : <b>« ${h(L0[f.i].t.trim())} »</b>.`,why:`Avec elle, la fonction calcule bien ${o.dit} : par exemple ${fx(`${nom}(${ESSAIS[Math.max(j,2)]}) = ${ent(bon[Math.max(j,2)])}`)}.`,pts:1}];
  function juge(rep){let k=f.i;
    if(!efface){const x=nombre((rep.c||{})["ligne"]);if(!x||x.d!==1||x.n<1||x.n>L1.length)return {incomplet:`Donne d'abord le numéro de la ligne fausse : un entier entre 1 et ${L1.length}.`};k=x.n-1;
      if(!L1[k].n)return {ok:false,faux:["ligne"],resume:`Pas tout à fait : la ligne ${k+1} ne peut pas être fausse.`,diag:{etape:1,type:"ligne fausse mal repérée",titre:"Où ça part : le numéro de la ligne.",msg:`La ligne ${k+1} ferme seulement un bloc. Cherche parmi les lignes qui calculent quelque chose.`}};}
    if(!propre(rep.l))return {incomplet:`Écris aussi la ligne ${efface?"manquante":"corrigée"}, dans le pseudo-code du cours.`};
    const lu=lisLigne(rep.l),cible=L1[k].n;if(!lu)return {incomplet:`Je n'arrive pas à lire cette ligne. Écris-la comme dans le cours, par exemple « s ← s + i », « pour i de 1 à n faire » ou « Renvoyer n * ${nom}(n - 1) ».`};
    if(lu.k!==cible.k)return {incomplet:`La ligne ${k+1} est ${SORTE[cible.k].replace(/, comme.*/,"")} : écris une ligne de la même sorte.`};
    const Q=clone(f.Q),q=lignesNum(Q)[k].n;Object.assign(q,lu);const res=resultats(Q);
    if(res.every((x,i)=>x===bon[i]))return {ok:true};
    const i=res.findIndex((x,z)=>x!==bon[z]);
    return {ok:false,faux:efface||k===f.i?["l"]:["ligne"],resume:"Pas tout à fait : avec cette ligne, la fonction ne calcule pas ce qu'il faut.",diag:!efface&&k!==f.i?{etape:1,type:"ligne fausse mal repérée",titre:"Où ça part : le numéro de la ligne.",msg:`La ligne ${k+1} était juste. La faute est à la ligne ${num}.`}
      :{etape:2,type:{borne:"bornes d'une boucle",init:"valeur de départ d'une variable",base:"cas de base d'un algorithme récursif",appel:"appel récursif"}[sorte],titre:"Où ça part : la ligne corrigée.",msg:`Avec ta ligne, ${fx(`${nom}(${ESSAIS[i]})`)} ${res[i]==="ne s'arrête pas"?"ne s'arrête jamais":`renvoie ${typeof res[i]==="number"?ent(res[i]):"autre chose qu'un nombre"}`}, alors qu'on attend ${ent(bon[i])}.`}};}
  const champs=(efface?[]:[{k:"cases",id:"c",noms:["ligne"]}]).concat([{k:"champ",id:"l",nom:"ligne",label:efface?`La ligne ${num} :`:"La ligne corrigée :",ex:"dans le pseudo-code du cours",apercu:false,sym:[["←"," ← "],["div"," div "],["≠","≠"],["≤","≤"],["pour … faire","pour i de 1 à n faire"],["Renvoyer","Renvoyer "]]}]);
  const bonL=L0[f.i].t.trim().replace(/−/g,"-"),fausseL=L1[f.i].t.trim();
  return {sig:"LF"+texte.replace(/\s+/g," ")+efface,q:efface?`Cette fonction doit renvoyer ${o.dit}, pour tout entier naturel n. La ligne ${num} a été effacée : écris-la.`:`Cette fonction doit renvoyer ${o.dit}, pour tout entier naturel n. Une de ses lignes est fausse. Donne son numéro, puis écris la ligne corrigée.`,
    corps:code(texte),texte:`${L1.map((l,i)=>(i+1)+" "+(efface&&i===f.i?"…":l.t.trim())).join(" ; ")} — doit renvoyer ${o.dit} ; ${efface?"ligne effacée à écrire":"ligne fausse à trouver et à corriger"}`,champs,juge,etapes:E,
    bonne:`${efface?"":`ligne ${num} : `}« ${h(bonL)} »`,bonneTxt:`${efface?"":`ligne ${num} : `}${bonL}`,repBonne:Object.assign(efface?{}:{c:{ligne:String(num)}},{l:bonL}),repFausse:Object.assign(efface?{}:{c:{ligne:String(num)}},{l:efface?(sorteL==="aff"?L0[f.i].n.v+" ← 7":sorteL==="ret"?"Renvoyer 7":sorteL==="pour"?"pour i de 3 à n faire":sorteL==="tq"?"tant que c > 5 faire":"si n = 5 alors"):fausseL}),
    nature:(efface?"effacée, ":"fausse, ")+sorte,ens:{type:"ligne",P0,P1:f.Q,num,efface}};}}

G.add("algo",[
 {id:"AG1",t:"Trace d'une boucle",th:"preuves",ex:"cc2",pts:3,lecons:["a2-invariant"],
  paliers:[
   {t:"une boucle pour, une variable",cc:3,gen:pourSimple},
   {t:"une boucle tant que, deux variables",cc:4,gen:tantQue},
   {t:"un si dans la boucle",cc:4,gen:avecSi},
   {t:"deux boucles imbriquées",cc:5,gen:imbriquees,min:90},
   {t:"comme au CC : la trace, puis ce que calcule la fonction",cc:6,gen:avecFormule,min:50}]},
 {id:"AG2",t:"Équations d'itération et invariant de boucle",tache:"équations d'itération et invariant",th:"preuves",ex:"cc2",pts:3,lecons:["a2-invariant"],apres:["AG1"],
  paliers:[
   {t:"l'équation d'itération, puis la formule : cas simples",cc:3,gen:R=>iteration(Object.assign(famille(R,"lin"),{demandeEI:true})),min:60},
   {t:"sommes et puissances",cc:4,gen:R=>iteration(Object.assign(famille(R,"som"),{demandeEI:true})),min:70},
   {t:"deux variables liées",cc:5,gen:R=>iteration(famille(R,"deux")),min:65},
   {t:"la preuve complète, sur papier, avec la méthode du cours",cc:10,gen:preuveBoucle,min:40}]},
 {id:"AG3",t:"Arrêt d'une boucle tant que",tache:"arrêt d'une boucle",th:"preuves",ex:"cc2",pts:2,lecons:["a2-invariant"],apres:["AG1"],
  paliers:[
   {t:"une boucle qui compte",cc:3,gen:R=>arret(R,"compte"),min:65},
   {t:"une division ou un doublement, deux conditions",cc:3,gen:R=>arret(R,"moitie"),min:45},
   {t:"la preuve rédigée, sur papier, comme aux examens de 2023",cc:5,gen:redacArret,min:90}]},
 {id:"AG4",t:"Algorithme récursif : valeur, affichages, appels",tache:"algorithmes récursifs",th:"preuves",ex:"cc2",pts:3,lecons:["a2-recursif"],
  paliers:[
   {t:"la valeur renvoyée",cc:3,gen:valeurRec,min:60},
   {t:"l'ordre des affichages : avant ou après l'appel",cc:3,gen:ordreAff,min:60},
   {t:"deux appels récursifs : valeur et nombre d'appels",cc:5,gen:deuxAppels,min:25},
   {t:"une procédure G(n, d), comme aux sujets de 2023",cc:5,gen:R=>R()<0.5?procedureG(R):procedureDeux(R),min:75},
   {t:"ce que calcule la fonction, puis la preuve par récurrence",cc:8,gen:formuleRec,min:55}]},
 {id:"AG5",t:"Compter les opérations",th:"compter",ex:"cc2",pts:4.5,lecons:["a2-compter"],
  paliers:[
   {t:"une boucle",cc:3,gen:uneBoucle,min:100},
   {t:"deux boucles imbriquées",cc:4,gen:deuxBoucles,min:60},
   {t:"une boucle où i double, ou est divisé par 2",cc:5,gen:boucleDouble,min:40},
   {t:"récursif : cas de base, équation de complexité, formule",cc:5,gen:recursif,min:60}]},
 {id:"AG6",t:"Ordres de complexité : comparer deux suites",tache:"ordres de complexité",th:"notations",ex:"cc2",pts:4,lecons:["a2-notations"],apres:["AG5"],
  paliers:[
   {t:"ranger des suites par ordre de grandeur",cc:2,gen:ranger},
   {t:"l'ordre de complexité d'une somme : θ(…)",cc:2,gen:simplifier,min:150},
   {t:"o, θ ou ω, par la limite du quotient",cc:3,gen:R=>quotient(R,false)},
   {t:"vrai ou faux avec O, Ω, o, ω, θ",cc:3,gen:R=>quotient(R,true)}]},
 {id:"AG7",t:"Master theorem",th:"master",ex:"cc2",pts:3,lecons:["a2-boucles"],apres:["AG6"],
  paliers:[
   {t:"lire a, b et d dans l'équation",cc:1,gen:masterLire,min:115},
   {t:"comparer b puissance d et a, puis conclure",cc:3,gen:R=>masterConclure(R,false),min:105},
   {t:"à partir d'une procédure récursive",cc:4,gen:R=>masterConclure(R,true),min:95},
   {t:"machine plus rapide, entrée plus grande",cc:3,gen:machine,min:100}]},
 {id:"AG8",t:"Trouver la ligne fausse, écrire la ligne manquante",tache:"trouver la ligne fausse",th:"preuves",ex:"cc2",pts:1,lecons:["a2-invariant"],apres:["AG1"],
  paliers:[
   {t:"les bornes d'une boucle",cc:3,gen:R=>ligneFausse(R,"borne"),min:25},
   {t:"la valeur de départ",cc:3,gen:R=>ligneFausse(R,"init"),min:20},
   {t:"le cas de base d'un récursif",cc:3,gen:R=>ligneFausse(R,"base"),min:14},
   {t:"l'appel récursif",cc:4,gen:R=>ligneFausse(R,"appel"),min:14}]},
 {id:"AGQ1",t:"Question de cours : les équations d'itération et l'invariant",th:"preuves",ex:"cc2",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:4,gen:coursIteration}]},
 {id:"AGQ2",t:"Question de cours : mille fois plus lent, θ, o, ω",th:"notations",ex:"cc2",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:4,gen:coursMillion}]},
 {id:"AGQ3",t:"Question de cours : le master theorem",th:"master",ex:"cc2",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:5,gen:coursMaster}]}
]);
/* ======================= CC3 : recherche et tris, avec des tableaux ======================= */
/* expressions en plus : ["idx", T, i] pour T[i], ["taille", T], ["cond", c, a, b] ; instructions en plus : aff sur une case, aff2 (deux affectations sur une ligne), ech (échanger), init (tableau de 0), pour « par pas de -1 » */
const IX=(t,e)=>["idx",t,e],TA=t=>["taille",t],estT=e=>Array.isArray(e)&&e[0]==="idx";
function ecritT(e,par,dr){if(typeof e!=="object")return String(e);const k=e[0];
  if(k==="idx")return `${e[1]}[${ecritT(e[2])}]`;if(k==="taille")return `taille(${e[1]})`;if(k==="cond")return `cond(${ecritT(e[1])}, ${ecritT(e[2])}, ${ecritT(e[3])})`;
  const q=PRIO[k]||1,p=par?PRIO[par]||1:0,s=`${ecritT(e[1],k)} ${k} ${ecritT(e[2],k,true)}`;
  return q<p||(dr&&q===p&&(par==="-"||par==="div"||par==="mod"||k==="div"||k==="mod"))?`(${s})`:s;}
function lignesTn(C,niv){const L=[],I="    ".repeat(niv);C.forEach(s=>{
  if(s.k==="aff")L.push({t:`${I}${ecritT(s.v)} ← ${ecritT(s.e)}`,n:s});
  else if(s.k==="aff2")L.push({t:`${I}${s.v.join(", ")} ← ${s.e.map(x=>ecritT(x)).join(", ")}`,n:s});
  else if(s.k==="init")L.push({t:`${I}Initialiser ${s.t} avec des 0`,n:s});
  else if(s.k==="ech")L.push({t:`${I}échanger ${ecritT(s.a)} et ${ecritT(s.b)}`,n:s});
  else if(s.k==="pour"){L.push({t:`${I}pour ${s.v} de ${ecritT(s.a)} à ${ecritT(s.b)}${s.pas<0?" par pas de -1":""} faire`,n:s},...lignesTn(s.c,niv+1),{t:`${I}fin pour;`,n:null});}
  else if(s.k==="tq"){L.push({t:`${I}tant que ${ecritT(s.cond)} faire`,n:s},...lignesTn(s.c,niv+1),{t:`${I}fin tq;`,n:null});}
  else if(s.k==="si"){L.push({t:`${I}si ${ecritT(s.cond)} alors`,n:s},...lignesTn(s.alors,niv+1));if(s.sinon)L.push({t:`${I}sinon`,n:null},...lignesTn(s.sinon,niv+1));L.push({t:`${I}fin si;`,n:null});}
  else L.push({t:`${I}Renvoyer ${ecritT(s.e)}`,n:s});});return L;}
const texteT=P=>P.entete.concat(["DÉBUT",...lignesTn(P.corps,1).map(x=>x.t),"FIN"]).join("\n");
/* exécution : valeur renvoyée, tableaux à la fin, photos de la première boucle, comparaisons entre cases, échanges, décalages, tours de chaque boucle du haut */
function joueT(P,args,o){o=o||{};const env={},photos=[],n={cmp:0,ech:0,dec:0,tours:[]};let vue=false,garde=0;
  P.params.forEach((p,i)=>{env[p]=Array.isArray(args[i])?args[i].slice():args[i];});if(P.n)env.n=env[P.n].length;
  const hors=(t,i)=>{if(!Array.isArray(t)||!Number.isInteger(i)||i<0||i>=t.length)throw new Error("case hors du tableau");};
  const val=e=>{if(typeof e==="number")return e;if(typeof e==="string"){if(env[e]===undefined)throw new Error("variable sans valeur");return env[e];}
    const k=e[0];if(k==="idx"){const t=env[e[1]],i=val(e[2]);hors(t,i);return t[i];}
    if(k==="taille")return env[e[1]].length;if(k==="cond")return val(e[1])?val(e[2]):val(e[3]);
    if(k==="et")return val(e[1])&&val(e[2]);if(k==="ou")return val(e[1])||val(e[2]);
    const a=val(e[1]),b=val(e[2]);if(!(k in PRIO)&&(estT(e[1])||estT(e[2])))n.cmp++;return CALC[k](a,b);};
  const pose=(v,x)=>{if(typeof v==="string"){env[v]=x;return;}const t=env[v[1]],i=val(v[2]);hors(t,i);t[i]=x;};
  let haut=-1;
  const run=(C,niv)=>{for(const s of C){if(++garde>(o.garde||60000))throw new Error("boucle sans fin");
    if(s.k==="aff"){if(estT(s.v)&&estT(s.e))n.dec++;pose(s.v,val(s.e));}
    else if(s.k==="aff2"){const X=s.e.map(val);s.v.forEach((v,i)=>pose(v,X[i]));}
    else if(s.k==="init")env[s.t]=Array(val(s.taille)).fill(0);
    else if(s.k==="ech"){const t=env[s.a[1]],i=val(s.a[2]),j=val(s.b[2]);hors(t,i);hors(t,j);[t[i],t[j]]=[t[j],t[i]];n.ech++;}
    else if(s.k==="ret")return {r:val(s.e)};
    else if(s.k==="si"){const r=run(val(s.cond)?s.alors:(s.sinon||[]),niv);if(r)return r;}
    else{const suivie=niv===0&&!vue&&o.photo,ici=niv===0?++haut:-1;if(niv===0)n.tours[ici]=0;if(suivie){vue=true;photos.push(o.photo(env));}
      const tour=()=>{const r=run(s.c,niv+1);if(niv===0)n.tours[ici]++;if(suivie)photos.push(o.photo(env));return r;};
      if(s.k==="pour"){const a=val(s.a),b=val(s.b),d=s.pas||1;for(let i=a;d>0?i<=b:i>=b;i+=d){env[s.v]=i;const r=tour();if(r)return r;}}
      else while(val(s.cond)){const r=tour();if(r)return r;}}}
    return null;};
  const r=run(P.corps,0);return {ret:r?r.r:undefined,env,photos,cmp:n.cmp,ech:n.ech,dec:n.dec,tours:n.tours};}
/* les algorithmes du cours (diapos 89, 92, 98, 102, 105 ; TD 10 ex. 42 et 43) */
const RECHLIN=()=>({nom:"RechLin",params:["e","T"],entete:["FONCTION : RechLin(E e : nombre, E T : tableau de nombres) : entier","SPÉCIFICATIONS : Si T contient e, renvoie le premier indice de T qui","                 contient e. Sinon, renvoie -1.","Variable : i : entier"],
  corps:[aff("i",0),tq(["et",["<","i",TA("T")],["≠",IX("T","i"),"e"]],[aff("i",["+","i",1])]),si(["=","i",TA("T")],[ret(-1)],[ret("i")])]});
const RECHDIC=der=>({nom:der?"RechDicDer":"RechDic",params:["e","T"],entete:[`FONCTION : ${der?"RechDicDer":"RechDic"} (E e : nombre, E T : tableau de nombres) : entier`,`SPÉCIFICATIONS : T trié. Renvoie le plus ${der?"grand":"petit"} i tq T[i]=e ou -1.`,"Variable : deb, mil, fin : entier"],
  corps:[{k:"aff2",v:["deb","fin"],e:[0,["-",TA("T"),1]]},tq(["≤","deb","fin"],[aff("mil",["div",["+","deb","fin"],2]),si([der?"≤":"<",IX("T","mil"),"e"],[aff("deb",["+","mil",1])],[aff("fin",["-","mil",1])])]),
    der?ret(["cond",["et",["≥","fin",0],["=",IX("T","fin"),"e"]],"fin",-1]):ret(["cond",["et",["<","deb",TA("T")],["=",IX("T","deb"),"e"]],"deb",-1])]});
const TRIBULLES=()=>({nom:"TriBulles",params:["T"],n:"T",entete:["PROCÉDURE : TriBulles (ES T : tableau de nombres de taille n)","SPÉCIFICATIONS : Trie le tableau T par ordre croissant."],
  corps:[pour("i",0,["-","n",2],[{k:"pour",v:"j",a:["-","n",1],b:["+","i",1],pas:-1,c:[si(["<",IX("T","j"),IX("T",["-","j",1])],[{k:"ech",a:IX("T","j"),b:IX("T",["-","j",1])}])]}])]});
const TRISEL=()=>({nom:"TriSelection",params:["tab"],n:"tab",entete:["PROCÉDURE : TriSelection (ES tab : tableau de nombres de taille n)","SPÉCIFICATIONS : Trie le tableau tab par ordre croissant.","Variable : m : entier"],
  corps:[pour("i",0,["-","n",2],[aff("m","i"),pour("j",["+","i",1],["-","n",1],[si(["<",IX("tab","j"),IX("tab","m")],[aff("m","j")])]),{k:"ech",a:IX("tab","i"),b:IX("tab","m")}])]});
const TRIINS=()=>({nom:"TriInsertion",params:["tab"],n:"tab",entete:["PROCÉDURE : TriInsertion (ES tab : tableau de nombres de taille n)","SPÉCIFICATIONS : Trie le tableau tab par ordre croissant.","Variable : a : nombre","           j : entier"],
  corps:[pour("k",1,["-","n",1],[aff("a",IX("tab","k")),aff("j",["-","k",1]),tq(["et",["≥","j",0],[">",IX("tab","j"),"a"]],[aff(IX("tab",["+","j",1]),IX("tab","j")),aff("j",["-","j",1])]),aff(IX("tab",["+","j",1]),"a")])]});
const TRIVAL=()=>({nom:"TriValeurs",params:["T","p"],n:"T",entete:["PROCÉDURE : TriValeurs (ES T : tableau d'entier de taille n, E p : entier)","SPÉCIFICATIONS : Les valeurs de T sont dans ⟦0 ; p−1⟧. Trie T.","Variable : Cpt : tableau d'entier de taille p","           j, k : entier"],
  corps:[{k:"init",t:"Cpt",taille:"p"},pour("i",0,["-","n",1],[aff(IX("Cpt",IX("T","i")),["+",IX("Cpt",IX("T","i")),1])]),{k:"aff2",v:["j","k"],e:[0,0]},
    tq(["<","j","n"],[si(["=",IX("Cpt","k"),0],[aff("k",["+","k",1])],[aff(IX("T","j"),"k"),aff("j",["+","j",1]),aff(IX("Cpt","k"),["-",IX("Cpt","k"),1])])])]});
const tabT=T=>`[${T.map(ent).join(", ")}]`;
const grille=(tete,rows)=>`<div style="overflow-x:auto"><table class="tbl tr"><thead><tr>${tete.map(v=>`<th class="var">${v}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const trie=T=>T.every((x,i)=>!i||T[i-1]<=x);
/* un tableau à lignes fixes : chaque case est un entier ; renvoie les cases fausses */
function jugeGrille(rep,id,att,nomLigne){const L=rep[id]||[];
  for(let r=0;r<att.length;r++)for(let k=0;k<att[r].length;k++){const x=propre(((L[r]||[])[k])||"");if(!x)return {incomplet:`Il reste une case vide (${nomLigne(r)}).`};if(entier(x)===null)return {incomplet:"Chaque case contient un nombre entier."};}
  const faux=[];let r0=-1;att.forEach((R,r)=>R.forEach((v,k)=>{if(entier(propre(L[r][k]))!==v){faux.push(`${id}:${r}:${k}`);if(r0<0)r0=r;}}));return {faux,r0};}
const champNb=(id,label)=>({k:"champ",id,nom:label.replace(/ :$/,"").toLowerCase(),label,ex:"un entier",apercu:false});
function lisNb(rep,id){const v=entier(propre(rep[id]||""));return v;}

/* ---------- AG9 : recherche dans un tableau ---------- */
function rechLin(R){const n=R.ent(5,8),T=[...Array(n)].map(()=>R.ent(1,20)),s=R();let e;
  if(s<0.35){do e=R.ent(1,20);while(T.includes(e));}else{const i=R.ent(0,n-2);e=T[i];if(s>0.7){const j=R.ent(i+1,n-1);T[j]=e;}}
  const P=RECHLIN(),X=joueT(P,[e,T]),r=X.ret,tours=X.tours[0],vus=[...Array(tours)].map((_,i)=>fx(`T[${i}] = ${T[i]} ≠ ${e}`)),apres=T.indexOf(e,r+1);
  const E=[{w:`Les tours : ${vus.length?vus.join(", "):"aucun"}. La boucle fait <b>${tours} ${tours>1?"tours":"tour"}</b>.`,why:`Elle continue tant que ${fx(`i &lt; taille(T)`)} et ${fx(`T[i] ≠ ${e}`)}. Un tour fait seulement ${fx("i ← i + 1")}, et le test est fait avant chaque tour.`,pts:1},
    {w:r>=0?`Avec i = ${r}, ${fx(`T[${r}] = ${e}`)} : la condition est fausse, la boucle s'arrête.`:`Avec ${fx(`i = ${n} = taille(T)`)}, la condition est fausse : toutes les cases ont été regardées, ${e} n'y est pas.`,why:r>=0?(apres>=0?`${e} est aussi dans la case ${apres}, mais RechLin s'arrête sur la première case qui le contient : les cases suivantes ne sont pas lues.`:`C'est la seule case qui contient ${e}.`):`Le « et » se lit de gauche à droite : quand ${fx("i = taille(T)")}, la case T[i] n'existe pas et n'est pas lue.`,pts:1},
    {w:`<b>${fx(`RechLin(${e}, T) = ${r}`)}</b>`,why:r>=0?`Après la boucle, ${fx(`i ≠ taille(T)`)} : la fonction renvoie i.`:`Après la boucle, ${fx("i = taille(T)")} : la fonction renvoie -1.`,pts:1}];
  function juge(rep){const v=lisNb(rep,"r"),t=lisNb(rep,"t");if(v===null)return {incomplet:"Écris la valeur renvoyée : un entier (-1 si e n'est pas dans T)."};if(t===null)return {incomplet:"Écris aussi le nombre de tours de la boucle."};
    const F=[];if(v!==r)F.push("r");if(t!==tours)F.push("t");if(!F.length)return {ok:true};
    const d=v!==r?(r>=0&&v===apres?{etape:1,type:"dernier indice au lieu du premier",titre:"Où ça part : la première case.",msg:`La boucle s'arrête dès que ${fx(`T[i] = ${e}`)}, donc à la case ${r}, la première qui contient ${e}.`}:r<0&&v===n?{etape:2,type:"valeur renvoyée quand e est absent",titre:"Où ça part : la dernière ligne.",msg:`Quand ${fx("i = taille(T)")}, la fonction renvoie -1, pas i.`}:{etape:1,type:"recherche linéaire déroulée",titre:"Où ça part : l'arrêt de la boucle.",msg:r>=0?`La première case qui contient ${e} est la case ${r}.`:`${e} n'est dans aucune case : la fonction renvoie -1.`})
      :t===tours+1?{etape:0,type:"tour de trop compté",titre:"Où ça part : le nombre de tours.",msg:`Quand ${r>=0?fx(`T[i] = ${e}`):fx("i = taille(T)")}, le test est faux et le tour n'a pas lieu : ${tours} ${tours>1?"tours":"tour"}.`}:{etape:0,type:"nombre de tours d'une recherche linéaire",titre:"Où ça part : le nombre de tours.",msg:`i part de 0 et augmente de 1 à chaque tour, jusqu'à ${r>=0?r:n} : ${tours} ${tours>1?"tours":"tour"}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"la valeur et le nombre de tours sont à revoir":F[0]==="r"?"la valeur renvoyée est à revoir":"le nombre de tours est à revoir"}.`,diag:d};}
  return {sig:"RL"+e+"|"+T,q:`Voici la recherche linéaire du cours. On l'appelle avec ${fx(`e = ${e}`)} et ${fx(`T = ${tabT(T)}`)}. Que renvoie ${fx(`RechLin(${e}, T)`)} ? Combien de tours fait la boucle « tant que » ?`,corps:code(texteT(P)),texte:`RechLin(${e}, ${tabT(T)}) : valeur renvoyée et nombre de tours`,
    champs:[champNb("r","Valeur renvoyée :"),champNb("t","Nombre de tours de la boucle :")],juge,etapes:E,bonne:`${fx(`RechLin(${e}, T) = ${r}`)}, après ${tours} ${tours>1?"tours":"tour"}`,bonneTxt:`RechLin(${e}, T) = ${r}, ${tours} tours`,
    repBonne:{r:String(r),t:String(tours)},repFausse:{r:String(r>=0?r+1:n),t:String(tours)},nature:r<0?"absent":apres>=0?"deux fois":"présent",ens:{type:"lin",e,T,r,tours}};}
function tableDic(R,der){const n=R.ent(7,10);let T;for(;;){T=[...Array(n)].map(()=>R.ent(2,16)).sort((a,b)=>a-b);if(new Set(T).size>=4)break;}
  const vals=[...new Set(T)],dupl=vals.filter(v=>T.indexOf(v)!==T.lastIndexOf(v)),s=R();let e;
  if(s<(der?0.65:0.5))e=dupl.length&&R()<0.7?R.choix(dupl):R.choix(vals);
  else if(s<0.85){const abs=[...Array(17).keys()].filter(v=>v>T[0]&&v<T[n-1]&&!T.includes(v));e=abs.length?R.choix(abs):T[n-1]+1;}
  else e=R()<0.5?T[0]-1:T[n-1]+R.ent(1,3);return {T,e};}
function rechDic(R,der){const {T,e}=tableDic(R,der),n=T.length,P=RECHDIC(der),X=joueT(P,[e,T],{photo:v=>[v.deb,v.fin,v.mil]}),Ph=X.photos,N=Ph.length-1,rows=Ph.map(p=>[p[0],p[1]]),r=X.ret,nom=P.nom;
  const morceau=(a,b)=>a>b?"vide":tabT(T.slice(a,b+1));
  const recit=k=>{const m=Ph[k][2],v=T[m],va=der?v<=e:v<e;return `Tour ${k} : ${fx(`mil = (${Ph[k-1][0]} + ${Ph[k-1][1]}) div 2 = ${m}`)}, ${fx(`T[${m}] = ${v}`)} ${va?(der?"≤":"&lt;"):(der?"&gt;":"≥")} ${e}, donc ${va?fx(`deb ← ${m+1}`):fx(`fin ← ${m-1}`)}.`;};
  const fin=Ph[N],okF=der?fin[1]>=0&&T[fin[1]]===e:fin[0]<n&&T[fin[0]]===e;
  const E=[{w:`Avant la boucle : ${fx("deb = 0")}, ${fx(`fin = ${n-1}`)}.`,why:`${fx(`taille(T) = ${n}`)}, donc ${fx(`fin = ${n-1}`)} : on cherche dans tout le tableau.`,pts:0.5},
    {w:`La trace : ${grille(["tour","deb","mil","fin","T[deb..fin]"],Ph.map((p,k)=>[k?k:"avant",p[0],k?p[2]:"",p[1],morceau(p[0],p[1])]))}`,why:[...Array(Math.min(N,3))].map((_,k)=>recit(k+1)).join(" ")+(N>3?" Et ainsi de suite.":""),pts:2},
    {w:`La boucle s'arrête après <b>${N} tours</b> : ${fx(`deb = ${fin[0]} &gt; fin = ${fin[1]}`)}.`,why:`La partie où on cherche encore est vide. Même quand ${fx("T[mil] = e")}, la boucle ne s'arrête pas : elle continue jusqu'à ${fx("deb &gt; fin")}.`,pts:0.5},
    {w:`<b>${fx(`${nom}(${e}, T) = ${r}`)}</b>`,why:der?(okF?`${fx(`fin = ${fin[1]} ≥ 0`)} et ${fx(`T[${fin[1]}] = ${e}`)} : la fonction renvoie fin, le dernier indice où se trouve ${e}.`:fin[1]<0?`${fx(`fin = ${fin[1]}`)} : il n'y a pas de case fin, la fonction renvoie -1.`:`${fx(`T[${fin[1]}] = ${T[fin[1]]} ≠ ${e}`)} : ${e} n'est pas dans T, la fonction renvoie -1.`)
      :(okF?`${fx(`deb = ${fin[0]} &lt; ${n}`)} et ${fx(`T[${fin[0]}] = ${e}`)} : la fonction renvoie deb, le premier indice où se trouve ${e}.`:fin[0]>=n?`${fx(`deb = ${fin[0]} = taille(T)`)} : il n'y a pas de case deb, la fonction renvoie -1.`:`${fx(`T[${fin[0]}] = ${T[fin[0]]} ≠ ${e}`)} : ${e} n'est pas dans T, la fonction renvoie -1.`),pts:1}];
  function juge(rep){let L=(rep.t||[]).map(x=>x.map(y=>propre(y)));while(L.length>1&&L[L.length-1].every(x=>!x))L.pop();
    if(!L.length||L[0].some(x=>!x))return {incomplet:"Remplis d'abord la ligne « avant la boucle »."};
    for(let k=0;k<L.length;k++)for(const x of L[k]){if(!x)return {incomplet:`Il reste une case vide à la ligne « ${k?"fin du tour "+k:"avant la boucle"} ».`};if(entier(x)===null)return {incomplet:"Dans le tableau, chaque case contient un nombre entier."};}
    const v=lisNb(rep,"r");if(v===null)return {incomplet:"Écris aussi la valeur renvoyée : un entier (-1 si e n'est pas dans T)."};
    const V=L.map(x=>x.map(entier));
    for(let k=0;k<Math.min(V.length,rows.length);k++){const K=[0,1].filter(j=>V[k][j]!==rows[k][j]);if(!K.length)continue;
      return {ok:false,faux:K.map(j=>`t:${k}:${j}`),resume:`Pas tout à fait : la ligne « ${k?"fin du tour "+k:"avant la boucle"} » est à revoir.`,diag:k?{etape:1,type:T[Ph[k][2]]===e?"égalité au milieu mal traitée":"un tour de recherche dichotomique",titre:`Où ça part : le tour ${k}.`,msg:`${recit(k)}${T[Ph[k][2]]===e?` Quand ${fx(`T[mil] = ${e}`)}, la boucle continue : ${der?"on cherche à droite":"on cherche à gauche"}, pour trouver le ${der?"dernier":"premier"} ${e}.`:""}`}:{etape:0,type:"valeurs de départ de deb et fin",titre:"Où ça part : avant la boucle.",msg:`${fx("deb = 0")} et ${fx(`fin = taille(T) − 1 = ${n-1}`)}.`}};}
    if(V.length!==rows.length)return {ok:false,faux:[],resume:`Pas tout à fait : la boucle ne fait pas ${V.length-1} tours.`,diag:{etape:2,type:V.length>rows.length?"un tour de trop":"un tour manquant",titre:"Où ça part : l'arrêt de la boucle.",msg:`La boucle tourne tant que ${fx("deb ≤ fin")}. Elle s'arrête après le tour ${N}, avec ${fx(`deb = ${fin[0]}`)} et ${fx(`fin = ${fin[1]}`)}.`}};
    if(v!==r)return {ok:false,faux:["r"],resume:"Pas tout à fait : la trace est juste, mais pas la valeur renvoyée.",diag:{etape:3,type:"dernière ligne de la recherche dichotomique",titre:"Où ça part : la dernière ligne.",msg:E[3].why}};
    return {ok:true};}
  const faux=rows.map(x=>x.map(String));faux[N][0]=String(rows[N][0]+1);
  return {sig:(der?"DD":"RD")+e+"|"+T,q:`Voici la recherche dichotomique du cours${der?", modifiée pour renvoyer le plus grand indice où se trouve e (diapo 98)":""}. On l'appelle avec ${fx(`e = ${e}`)} et ${fx(`T = ${tabT(T)}`)}. Remplis la trace : deb et fin avant la boucle, puis à la fin de chaque tour. Donne ensuite la valeur renvoyée.`,corps:code(texteT(P)),
    texte:`${nom}(${e}, ${tabT(T)}) : trace de deb et fin, valeur renvoyée`,champs:[{k:"trace",id:"t",vars:["deb","fin"],lignes:2},champNb("r","Valeur renvoyée :")],juge,etapes:E,
    bonne:`${fx(`${nom}(${e}, T) = ${r}`)}, après ${N} tours`,bonneTxt:`${nom}(${e}, T) = ${r}, ${N} tours`,repBonne:{t:rows.map(x=>x.map(String)),r:String(r)},repFausse:{t:faux,r:String(r)},nature:r<0?"absent":T.indexOf(e)!==T.lastIndexOf(e)?"plusieurs fois":"présent",ens:{type:"dic",der,e,T,rows,r}};}
function iterDic(R){const t=R.ent(0,2);
  if(t<2){const k=R.ent(2,6),n=2**k,T=[...Array(n)].map((_,i)=>2*i+2),e=t===0?2*n+3:1,X=joueT(RECHDIC(false),[e,T],{photo:v=>v.fin-v.deb+1}),N=X.tours[0],tailles=X.photos;
    const E=[{w:t===0?`À chaque tour, ${fx("T[mil] &lt; e")} : ${fx("deb ← mil + 1")}, on garde la moitié droite.`:`À chaque tour, ${fx("T[mil] ≥ e")} : ${fx("fin ← mil − 1")}, on garde la moitié gauche, sans la case du milieu.`,why:`Toutes les valeurs sont ${t===0?"plus petites":"plus grandes"} que e : le test donne toujours la même réponse.`,pts:1},
      {w:`Le nombre de cases où on cherche encore, ${fx("fin − deb + 1")} : ${tailles.join(" → ")}.`,why:`Il est à peu près divisé par 2 à chaque tour, et la boucle s'arrête quand il vaut 0.`,pts:1},
      {w:`<b>${N} tours</b>`,why:t===0?`C'est le pire cas du cours (diapo 97) : pour ${fx(`n = 2^{${k}}`)}, il faut ${fx(`k + 1 = ${k+1}`)} itérations, car on divise n par 2 jusqu'à tomber sur 0.`:`Ici on enlève aussi la case du milieu, et on va moins loin que dans le pire cas du cours (${k+1} tours quand tout est plus petit que e).`,pts:1}];
    const juge=rep=>{const v=lisNb(rep,"v");if(v===null)return {incomplet:"Écris un nombre de tours : un entier."};if(v===N)return {ok:true};return {ok:false,faux:["v"],resume:"Pas tout à fait : ce n'est pas le bon nombre de tours.",diag:{etape:1,type:v===N+1||v===N-1?"un tour de plus ou de moins dans une recherche dichotomique":"nombre d'itérations d'une recherche dichotomique",titre:"Où ça part : compter les tours.",msg:`Suis le nombre de cases où on cherche encore : ${tailles.join(" → ")}. Chaque flèche est un tour.`}};};
    return {sig:"ID"+t+k,q:`On lance RechDic (la recherche dichotomique du cours) sur un tableau trié de ${n} cases dont toutes les valeurs sont strictement ${t===0?"plus petites":"plus grandes"} que e. Combien de tours fait la boucle « tant que » ?`,corps:code(texteT(RECHDIC(false))),texte:`RechDic, ${n} cases, toutes ${t===0?"< e":"> e"} : nombre de tours`,
      champs:[champNb("v","Nombre de tours :")],juge,etapes:E,bonne:`<b>${N} tours</b>`,bonneTxt:`${N} tours`,repBonne:{v:String(N)},repFausse:{v:String(t===0?k:k+1)},nature:t===0?"tout plus petit":"tout plus grand",ens:{type:"iter",t,k,N}};}
  const N0=R.choix([500,1000,3000,5000,12000,20000,50000]),m=R.choix([2,4,8]),E0=Math.ceil(Math.log2(N0)),p=Math.log2(m),quoi=R.choix([["livres","rangés par numéro","un livre"],["cartes","rangées par numéro","une carte"],["élèves","rangés par ordre alphabétique","un élève"],["légos","rangés par taille","un modèle"]]),rep=E0+p,de=(/^[aeéèiou]/.test(quoi[0])?"d'":"de ")+quoi[0];
  const E=[{w:`Après le premier essai, il reste ${m*N0/2} ${quoi[0]} où chercher.`,why:`Une recherche dichotomique divise par 2 le nombre ${de} à chaque essai.`,pts:1},
    {w:m===2?`C'est le cas de départ : pour ${N0} ${quoi[0]}, il faut au plus ${E0} essais.`:`Il faut ${p} essais pour revenir à ${N0} ${quoi[0]} (${[...Array(p+1)].map((_,i)=>m*N0/2**i).join(" → ")}), puis au plus ${E0} essais.`,why:"Doubler le nombre de cases n'ajoute qu'un essai : c'est la complexité θ(log n).",pts:1},
    {w:`<b>${rep} essais au plus</b>`,why:`${E0} + ${p}. C'est le raisonnement du corrigé officiel du CC1 de novembre 2024 (12000 légos, 14 essais ; 24000 légos, 15 essais).`,pts:1}];
  const juge=r=>{const v=lisNb(r,"v");if(v===null)return {incomplet:"Écris un nombre d'essais : un entier."};if(v===rep)return {ok:true};return {ok:false,faux:["v"],resume:"Pas tout à fait : ce n'est pas le bon nombre d'essais.",diag:{etape:1,type:v===E0*m?"nombre d'essais multiplié au lieu d'augmenté":"nombre d'essais d'une recherche dichotomique",titre:"Où ça part : ce que coûte un doublement.",msg:`Multiplier le nombre ${de} par 2 n'ajoute qu'un essai. Ici on le multiplie par ${m} = 2 × … : ${p} ${p>1?"essais":"essai"} de plus.`}};};
  return {sig:"IE"+N0+"|"+m+quoi[0],q:`${N0} ${quoi[0]} sont ${quoi[1]}. Avec une recherche dichotomique, il faut au plus ${E0} essais pour trouver ${quoi[2]} en particulier. Combien en faudrait-il au plus avec ${m*N0} ${quoi[0]} ?`,corps:"",texte:`${N0} ${quoi[0]}, ${E0} essais au plus ; combien pour ${m*N0} ?`,
    champs:[champNb("v","Nombre d'essais au plus :")],juge,etapes:E,bonne:`<b>${rep}</b>`,bonneTxt:String(rep),repBonne:{v:String(rep)},repFausse:{v:String(E0*m)},nature:"essais",ens:{type:"essais",N0,m,E0,rep}};}

/* ---------- AG10 et AG11 : tris par comparaison, le tableau après chaque tour ---------- */
const DEFT={bulles:[TRIBULLES,"i",0,"le tri à bulles du cours (diapo 105)"],sel:[TRISEL,"i",0,"le tri par sélection (TD 10, exercice 42)"],ins:[TRIINS,"k",1,"le tri par insertion (TD 10, exercice 43)"]};
function etatsTri(sorte,T){const P=DEFT[sorte][0](),X=joueT(P,[T],{photo:v=>v[P.n].slice()});return {P,X,rows:X.photos.slice(1)};}
function decritTour(sorte,av,ap,x){if(sorte==="bulles"){const m=Math.min(...av.slice(x));return `Pour ${fx(`i = ${x}`)}, j recule de la fin jusqu'à ${x+1} : chaque case plus petite que sa voisine de gauche passe devant elle. La plus petite valeur restante, ${m}, arrive en case ${x} : ${fx(tabT(ap))}.`;}
  if(sorte==="sel"){const reste=av.slice(x),m=Math.min(...reste),j=x+reste.indexOf(m);return j===x?`Pour ${fx(`i = ${x}`)}, la plus petite valeur parmi ${fx(`tab[${x}..${av.length-1}]`)} est ${m}, déjà en case ${x} : l'échange ne change rien. ${fx(tabT(ap))}.`:`Pour ${fx(`i = ${x}`)}, la plus petite valeur parmi ${fx(`tab[${x}..${av.length-1}]`)} est ${m}, en case ${j} : on échange les cases ${x} et ${j}. ${fx(tabT(ap))}.`;}
  const a=av[x],pos=ap.slice(0,x+1).lastIndexOf(a),dec=x-pos;return dec?`Pour ${fx(`k = ${x}`)}, ${fx(`a = ${a}`)} : ${dec>1?`les ${dec} valeurs plus grandes que ${a} dans ${fx(`tab[0..${x-1}]`)} sont décalées`:`la seule valeur plus grande que ${a} dans ${fx(`tab[0..${x-1}]`)} est décalée`} d'une case vers la droite, et ${a} se place en case ${pos}. ${fx(tabT(ap))}.`:`Pour ${fx(`k = ${x}`)}, ${fx(`a = ${a}`)} et ${fx(`tab[${x-1}] = ${av[x-1]} ≤ a`)} : le test « tab[j] > a » est faux tout de suite, rien ne bouge. ${fx(tabT(ap))}.`;}
function triTours(R,sorte,avecEch){const n=avecEch?6:R.choix([5,5,6]);let T,o;
  for(;;){T=avecEch?[...Array(n)].map(()=>R.ent(1,9)):R.mel([...Array(9)].map((_,i)=>i+1)).slice(0,n);if(trie(T)||new Set(T).size<4)continue;o=etatsTri(sorte,T);if(o.X.ech+o.X.dec>=3)break;}
  const [,v,d0,nomTri]=DEFT[sorte],rows=o.rows,lab=r=>`${v} = ${r+d0}`,av=[T].concat(rows),nE=o.X.ech;
  const E=[{w:decritTour(sorte,av[0],av[1],d0),why:sorte==="bulles"?"j part de n − 1 et recule : on compare T[j] et T[j − 1], et on les échange si T[j] est plus petit.":sorte==="sel"?"m retient l'indice de la plus petite valeur vue ; un seul échange par itération, après la boucle sur j.":"a garde la valeur de tab[k] ; j recule tant que tab[j] > a, en décalant tab[j] vers la droite ; puis a est posé en tab[j + 1].",pts:1},
    {w:decritTour(sorte,av[1],av[2],d0+1),why:sorte==="ins"?`Après l'itération k, les cases 0 à k sont triées entre elles.`:`Après l'itération i, les cases 0 à i contiennent les plus petites valeurs, dans l'ordre : elles ne bougent plus.`,pts:1},
    {w:`Le tableau à la fin de chaque itération : ${grille([v].concat(T.map((_,k)=>`${o.P.n}[${k}]`)),rows.map((L,r)=>[r+d0].concat(L)))}`,why:"On repart toujours du tableau de la ligne du dessus.",pts:1.5}];
  if(avecEch)E.push({w:`<b>${nE} ${nE>1?"échanges":"échange"}</b> en tout.`,why:sorte==="bulles"?"Chaque échange remet dans l'ordre deux valeurs voisines. Il y a un échange pour chaque paire de valeurs mal rangées l'une par rapport à l'autre ; deux valeurs égales ne sont jamais échangées (le tri à bulles est stable).":"Un échange par itération, même quand il ne change rien.",pts:0.5});
  function juge(rep){const j=jugeGrille(rep,"t",rows,r=>`ligne ${lab(r)}`);if(j.incomplet)return j;let e=null;if(avecEch){e=lisNb(rep,"e");if(e===null)return {incomplet:"Écris aussi le nombre d'échanges en tout."};}
    const F=j.faux.slice();if(avecEch&&e!==nE)F.push("e");if(!F.length)return {ok:true};
    const d=j.r0>=0?{etape:j.r0===0?0:j.r0===1?1:2,type:`itération du ${sorte==="bulles"?"tri à bulles":sorte==="sel"?"tri par sélection":"tri par insertion"}`,titre:`Où ça part : la ligne ${lab(j.r0)}.`,msg:decritTour(sorte,av[j.r0],av[j.r0+1],j.r0+d0)}:{etape:3,type:"nombre d'échanges du tri à bulles",titre:"Où ça part : les échanges.",msg:`Compte les échanges de chaque itération : il y en a ${nE} en tout.`};
    return {ok:false,faux:F,resume:j.faux.length?`Pas tout à fait : ${new Set(j.faux.map(x=>x.split(":")[1])).size>1?"plusieurs lignes sont à revoir":`la ligne ${lab(j.r0)} est à revoir`}.`:"Pas tout à fait : le tableau est juste, mais pas le nombre d'échanges.",diag:d};}
  const nomP=o.P.nom,tn=o.P.n,fauxT=rows.map(L=>L.map(String));fauxT[0][0]=String(rows[0][0]+1);
  return {sig:sorte.slice(0,2).toUpperCase()+T+(avecEch?"E":""),q:`Voici ${nomTri}. On l'applique à ${fx(`${tn} = ${tabT(T)}`)}. Écris le tableau à la fin de chaque itération de la boucle sur ${v}${avecEch?", puis le nombre d'échanges en tout":""}.`,corps:code(texteT(o.P)),
    texte:`${nomP} sur ${tabT(T)} : le tableau après chaque itération${avecEch?", nombre d'échanges":""}`,champs:[{k:"vf",id:"t",donne:[v],cols:T.map((_,k)=>`${tn}[${k}]`),lignes:rows.map((_,r)=>[r+d0]),aide:"Une ligne par itération : le tableau tel qu'il est à la fin de l'itération."}].concat(avecEch?[champNb("e","Nombre d'échanges :")]:[]),juge,etapes:E,
    bonne:`à la fin : ${fx(tabT(rows[rows.length-1]))}${avecEch?` ; ${nE} échanges`:""}`,bonneTxt:rows.map(L=>tabT(L)).join(" / ")+(avecEch?` ; ${nE} échanges`:""),repBonne:Object.assign({t:rows.map(L=>L.map(String))},avecEch?{e:String(nE)}:{}),repFausse:Object.assign({t:fauxT},avecEch?{e:String(nE)}:{}),nature:sorte,ens:{type:"tours",sorte,T,rows,nE}};}
/* quel tri a produit ces tableaux ? */
function quelTri(R){let T,S,sorte;for(;;){T=R.mel([...Array(9)].map((_,i)=>i+1)).slice(0,R.choix([5,6]));if(trie(T))continue;S={bulles:etatsTri("bulles",T).rows,sel:etatsTri("sel",T).rows,ins:etatsTri("ins",T).rows};
    const s=Object.values(S).map(r=>JSON.stringify(r[0]));if(new Set(s).size===3)break;}
  sorte=R.choix(["bulles","sel","ins"]);const rows=S[sorte].slice(0,Math.min(3,S[sorte].length)),NOM={bulles:"le tri à bulles",sel:"le tri par sélection",ins:"le tri par insertion"};
  const indices={bulles:`Après le 1er tour, la plus petite valeur (${Math.min(...T)}) est en case 0 ; les valeurs qui étaient avant elle ont glissé d'une case vers la droite, et d'autres voisines ont pu être échangées en route.`,sel:`Après le 1er tour, la plus petite valeur (${Math.min(...T)}) est en case 0, et une seule autre case a changé : celle où elle était, qui a reçu l'ancienne valeur de la case 0.`,ins:`Après le 1er tour, seules les deux premières cases ont pu changer : elles sont rangées entre elles, et la plus petite valeur du tableau n'est pas forcément en case 0.`};
  const E=[{w:`Le tri par sélection donnerait d'abord ${fx(tabT(S.sel[0]))}, le tri à bulles ${fx(tabT(S.bulles[0]))}, le tri par insertion ${fx(tabT(S.ins[0]))}.`,why:"On fait le premier tour de chaque tri sur le tableau de départ.",pts:1.5},
    {w:`<b>C'est ${NOM[sorte]}.</b>`,why:indices[sorte],pts:1.5}];
  const juge=r=>{if(!r.c)return {incomplet:"Choisis un des trois tris."};if(r.c===sorte)return {ok:true};return {ok:false,faux:["c"],resume:"Pas tout à fait : ce n'est pas ce tri.",diag:{etape:0,type:"tris par comparaison confondus",titre:"Où ça part : le premier tour.",msg:`${NOM[r.c].charAt(0).toUpperCase()+NOM[r.c].slice(1)} donnerait ${fx(tabT(S[r.c][0]))} après le premier tour, pas ${fx(tabT(rows[0]))}. ${indices[sorte]}`}};};
  return {sig:"QT"+T+sorte,q:`On trie ${fx(`T = ${tabT(T)}`)} avec un des trois tris du cours : le tri à bulles, le tri par sélection ou le tri par insertion. Voici le tableau à la fin des ${rows.length} premières itérations de la boucle extérieure. Quel tri a été utilisé ?`,corps:grille(["tour"].concat(T.map((_,k)=>`T[${k}]`)),rows.map((L,r)=>[r+1].concat(L))),texte:`${tabT(T)} puis ${rows.map(tabT).join(", ")} : quel tri ?`,
    champs:[{k:"choix",id:"c",o:[["bulles","Tri à bulles"],["sel","Tri par sélection"],["ins","Tri par insertion"]]}],juge,etapes:E,bonne:`<b>${NOM[sorte]}</b>`,bonneTxt:NOM[sorte],repBonne:{c:sorte},repFausse:{c:sorte==="ins"?"sel":"ins"},nature:sorte,ens:{type:"quel",T,sorte,rows}};}
/* compter en fonction de n, vérifié en exécutant le tri sur plusieurs tableaux */
const COMPTES=[["bulles","cmp","alea","comparaisons « T[j] &lt; T[j-1] »","n(n − 1)/2","n(n-1)/2","Pour chaque i, j va de n − 1 à i + 1 : n − 1 − i comparaisons. Au total (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, quel que soit le tableau."],
  ["bulles","cmp","trie","comparaisons « T[j] &lt; T[j-1] », quand T est déjà trié","n(n − 1)/2","n(n-1)/2","Le tri à bulles du cours fait toutes ses comparaisons même si le tableau est déjà trié : (n − 1) + … + 1 = n(n − 1)/2. Il ne fait simplement aucun échange."],
  ["bulles","ech","envers","échanges, quand T est rangé à l'envers (du plus grand au plus petit)","n(n − 1)/2","n(n-1)/2","Toutes les paires de valeurs sont mal rangées : chaque comparaison donne un échange, donc n(n − 1)/2 échanges. C'est le pire cas."],
  ["sel","cmp","alea","comparaisons « tab[j] &lt; tab[m] »","n(n − 1)/2","n(n-1)/2","Pour chaque i, j va de i + 1 à n − 1 : n − 1 − i comparaisons. Au total n(n − 1)/2, quel que soit le tableau."],
  ["sel","ech","alea","échanges","n − 1","n-1","Un échange à chaque itération de la boucle sur i, qui va de 0 à n − 2 : n − 1 échanges, même quand l'échange ne change rien."],
  ["ins","cmp","trie","comparaisons « tab[j] &gt; a », quand tab est déjà trié","n − 1","n-1","Quand le tableau est trié, le test « tab[j] > a » est faux tout de suite : une seule comparaison par valeur de k, de 1 à n − 1. C'est le meilleur cas, et c'est pour ça que le cours dit ce tri « adapté lorsque les données sont presque triées »."],
  ["ins","dec","envers","décalages « tab[j+1] ← tab[j] », quand tab est rangé à l'envers","n(n − 1)/2","n(n-1)/2","Chaque nouvelle valeur est plus petite que toutes celles déjà rangées : pour k, k décalages. Au total 1 + 2 + … + (n − 1) = n(n − 1)/2. C'est le pire cas : θ(n²)."]];
function compteTri(R){const c=R.choix(COMPTES),[sorte,quoi,cas,dit,ferme,tape,pq]=c,nv=R()<0.5?R.ent(6,20):null,NOMS={bulles:"TriBulles",sel:"TriSelection",ins:"TriInsertion"};
  const tab=(n,s)=>{const T=[...Array(n)].map((_,i)=>i+1);return cas==="trie"?T:cas==="envers"?T.reverse():(s=>{for(let i=n-1;i>0;i--){s=(s*7+3)%31;const j=s%(i+1);[T[i],T[j]]=[T[j],T[i]];}return T;})(n*5+1);};
  const vrai=n=>{const X=etatsTri(sorte,tab(n)).X;return quoi==="cmp"?X.cmp:quoi==="ech"?X.ech:X.dec;},NS=[2,3,4,5,6,7,8];
  const E=[{w:`Pour ${fx("n = 4")} : ${vrai(4)} ; pour ${fx("n = 5")} : ${vrai(5)}.`,why:"On peut toujours vérifier une formule sur un petit tableau, en déroulant le tri.",pts:1},{w:`<b>${fx(ferme)}</b> ${dit.replace(/ «.*$/,"").replace(/,.*$/,"")}`,why:pq,pts:2}];
  if(nv){const v=vrai(nv);E[1].w=`Pour ${fx(`n = ${nv}`)} : <b>${v}</b> ${dit.replace(/ «.*$/,"").replace(/,.*$/,"")}, car en général ${fx(ferme)}.`;}
  const juge=r=>{if(nv){const v=lisNb(r,"f");if(v===null)return {incomplet:"Écris un nombre entier."};if(v===vrai(nv))return {ok:true};return {ok:false,faux:["f"],resume:"Pas tout à fait : ce n'est pas le bon nombre.",diag:{etape:1,type:"nombre d'opérations d'un tri",titre:"Où ça part : le calcul.",msg:`${pq} Pour n = ${nv} : ${vrai(nv)}.`}};}
    if(!propre(r.f))return {incomplet:"Écris le nombre avec la lettre n, par exemple n(n-1)/2."};const W=NS.map(n=>calc(r.f,{n}));if(W.some(v=>v===null||!Number.isFinite(v)))return {incomplet:"Je n'arrive pas à lire cette formule. Écris-la avec la lettre n, par exemple n(n-1)/2 ou n-1."};
    if(NS.every((n,i)=>Math.abs(W[i]-vrai(n))<1e-9))return {ok:true};const n=NS.find((n,i)=>Math.abs(W[i]-vrai(n))>=1e-9);
    return {ok:false,faux:["f"],resume:"Pas tout à fait : ce n'est pas le bon nombre.",diag:{etape:1,type:"nombre d'opérations d'un tri",titre:"Où ça part : la formule.",msg:`Pour n = ${n}, ta formule donne ${String(Math.round(W[NS.indexOf(n)]*1000)/1000).replace(".",",")}, alors que ${NOMS[sorte]} fait ${vrai(n)} ${dit.replace(/ «.*$/,"").replace(/,.*$/,"")}.`}};};
  const P=DEFT[sorte][0]();
  return {sig:"CT"+COMPTES.indexOf(c)+"|"+nv,q:`Voici ${DEFT[sorte][3]}. Pour un tableau de taille ${nv?nv:"n"}, combien fait-il de ${dit} ?${nv?"":" Donne une formule en n."}`,corps:code(texteT(P)),texte:`${NOMS[sorte]} : nombre de ${dit.replace(/&lt;/g,"<").replace(/&gt;/g,">")} en fonction de n`,
    champs:[nv?champNb("f","Nombre :"):{k:"champ",id:"f",nom:"formule",label:"Nombre, en fonction de n :",ex:"une formule avec n",sym:[["n","n"],["(","("],[")",")"],["/","/"],["^","^"]]}],juge,etapes:E,bonne:nv?`<b>${vrai(nv)}</b>`:fx(ferme),bonneTxt:nv?String(vrai(nv)):ferme,repBonne:{f:nv?String(vrai(nv)):tape},repFausse:{f:nv?String(vrai(nv)+1):tape==="n-1"?"n":"n^2"},nature:sorte+", "+quoi,ens:{type:"compte",sorte,quoi,cas,tape,nv}};}

/* ---------- AG12 : tri fusion ---------- */
function fusionJS(T,d1,f1,f2,trace){const T1=T.slice(d1,f1+1),T2=T.slice(f1+1,f2+1);let i=0,j=0;for(let k=d1;k<=f2;k++){if(j>=T2.length||(i<T1.length&&T1[i]<=T2[j])){T[k]=T1[i];i++;}else{T[k]=T2[j];j++;}if(trace)trace.push([T[k],i,j]);}return {T1,T2};}
const FUSION=`PROCÉDURE : fusion (ES T : tableau de nombre, E deb1, fin1, fin2 : entier)
SPÉCIFICATIONS : T[deb1..fin1] et T[fin1+1..fin2] triés. Trie T[deb1..fin2].
Variable : T1, T2 : tab. de fin1-deb1+1 et fin2-fin1 nombres ; i,j : entiers
DÉBUT
    recopier T[deb1..fin1] dans T1 et T[fin1+1..fin2] dans T2
    i,j ← 0,0
    pour k de deb1 à fin2 faire
        si j>=taille(T2) ou (i<taille(T1) et T1[i]<=T2[j]) alors
            T[k] ← T1[i] ; i ← i+1
        sinon
            T[k] ← T2[j] ; j ← j+1
        fin si;
    fin pour;
FIN`,TFA=`PROCÉDURE : triFusionAux (ES T : tableau de nombre; E deb, fin : entier)
SPÉCIFICATIONS : Trie T entre les indices deb et fin.
Variable : mil : entier
DÉBUT
    si deb<fin alors
        mil ← (deb+fin) div 2
        triFusionAux(T,deb,mil)
        triFusionAux(T,mil+1,fin)
        fusion(T,deb,mil,fin)
    fin si;
FIN`;
function fusionExo(R){const l1=R.ent(2,4),l2=R.ent(2,4),V=R.mel([...Array(15)].map((_,i)=>i+1)),A=V.slice(0,l1).sort((a,b)=>a-b),B=V.slice(l1,l1+l2).sort((a,b)=>a-b);if(R()<0.3)B[0]=A[R.ent(0,l1-1)];B.sort((a,b)=>a-b);
  const avant=R()<0.3?[R.ent(1,15)]:[],T=avant.concat(A,B),d1=avant.length,f1=d1+l1-1,f2=f1+l2,tr=[],X=T.slice();fusionJS(X,d1,f1,f2,tr);
  const cle=k=>{const [v,i,j]=tr[k-d1],[ip,jp]=k===d1?[0,0]:tr[k-d1-1].slice(1);return jp>=B.length?`T2 est épuisé : on prend ${fx(`T1[${ip}] = ${A[ip]}`)}.`:ip>=A.length?`T1 est épuisé : on prend ${fx(`T2[${jp}] = ${B[jp]}`)}.`:A[ip]<=B[jp]?`${fx(`T1[${ip}] = ${A[ip]} ≤ T2[${jp}] = ${B[jp]}`)} : on prend ${A[ip]} dans T1.`:`${fx(`T1[${ip}] = ${A[ip]} &gt; T2[${jp}] = ${B[jp]}`)} : on prend ${B[jp]} dans T2.`;};
  const rows=tr.map(x=>x.slice()),ks=rows.map((_,r)=>r+d1);
  const E=[{w:`Les copies : ${fx(`T1 = ${tabT(A)}`)} et ${fx(`T2 = ${tabT(B)}`)}.`,why:`T1 reçoit ${fx(`T[${d1}..${f1}]`)} et T2 reçoit ${fx(`T[${f1+1}..${f2}]`)}. On les copie parce que T est écrasé pendant la fusion.`,pts:0.5},
    {w:`Pour ${fx(`k = ${d1}`)} : ${cle(d1)} Pour ${fx(`k = ${d1+1}`)} : ${cle(d1+1)}`,why:"À chaque case k, on prend le plus petit des deux candidats ; à égalité, celui de T1 (« T1[i] <= T2[j] ») : c'est ce qui rend le tri fusion stable.",pts:1},
    {w:`Tour par tour : ${grille(["k","T[k]","i","j"],rows.map((x,r)=>[ks[r]].concat(x)))}`,why:"i et j sont les valeurs à la fin du tour : celui des deux qui a donné sa valeur avance de 1.",pts:1.5},
    {w:`À la fin : ${fx(`T = ${tabT(X)}`)}.`,why:avant.length?`La case 0 n'est pas touchée : la fusion ne travaille qu'entre ${d1} et ${f2}.`:"Les deux moitiés triées sont réunies en un seul tableau trié.",pts:0.5}];
  function juge(rep){const j=jugeGrille(rep,"t",rows,r=>`ligne k = ${ks[r]}`);if(j.incomplet)return j;if(!j.faux.length)return {ok:true};
    return {ok:false,faux:j.faux,resume:`Pas tout à fait : la ligne k = ${ks[j.r0]} est à revoir.`,diag:{etape:j.r0<2?1:2,type:"tour de la fusion",titre:`Où ça part : k = ${ks[j.r0]}.`,msg:`${cle(ks[j.r0])} À la fin de ce tour : ${fx(`i = ${rows[j.r0][1]}`)}, ${fx(`j = ${rows[j.r0][2]}`)}.`}};}
  const faux=rows.map(x=>x.map(String));faux[0][1]=String(rows[0][1]+1);
  return {sig:"FU"+T+"|"+d1,q:`Voici la procédure fusion du cours. On appelle ${fx(`fusion(T, ${d1}, ${f1}, ${f2})`)} avec ${fx(`T = ${tabT(T)}`)}. Pour chaque valeur de k, écris la valeur mise dans T[k], puis les valeurs de i et de j à la fin du tour.`,corps:code(FUSION),texte:`fusion(${tabT(T)}, ${d1}, ${f1}, ${f2}) : T[k], i et j à chaque tour`,
    champs:[{k:"vf",id:"t",donne:["k"],cols:["T[k]","i","j"],lignes:ks.map(k=>[k]),aide:"Une ligne par valeur de k : la valeur écrite dans T[k], puis i et j à la fin du tour."}],juge,etapes:E,bonne:`${fx(`T = ${tabT(X)}`)}`,bonneTxt:tabT(X),repBonne:{t:rows.map(x=>x.map(String))},repFausse:{t:faux},nature:avant.length?"au milieu d'un tableau":B.some(x=>A.includes(x))?"avec une égalité":"deux moitiés",ens:{type:"fusion",T,d1,f1,f2,rows}};}
function appelsTFA(T){const L=[],F=[],A=T.slice();(function va(d,f,niv){L.push("    ".repeat(niv)+`triFusionAux(T,${d},${f})`);if(d<f){const m=Math.floor((d+f)/2);va(d,m,niv+1);va(m+1,f,niv+1);fusionJS(A,d,m,f);F.push({d,m,f,T:A.slice()});L.push("    ".repeat(niv+1)+`fusion(T,${d},${m},${f})   T = ${tabT(A)}`);}})(0,T.length-1,0);return {L,F,A};}
function triFusionExo(R){const n=R.ent(5,7),T=R.mel([...Array(9)].map((_,i)=>i+1)).slice(0,n),o=appelsTFA(T),rows=o.F.map(x=>x.T),lab=o.F.map(x=>`(${x.d}, ${x.m}, ${x.f})`),m0=Math.floor((n-1)/2);
  const E=[{w:`Premier appel : ${fx(`triFusionAux(T, 0, ${n-1})`)}, ${fx(`mil = ${m0}`)} : on trie ${fx(`T[0..${m0}]`)}, puis ${fx(`T[${m0+1}..${n-1}]`)}, puis on fusionne.`,why:"La moitié gauche est entièrement triée avant que la moitié droite commence. Chaque fusion vient après les deux appels récursifs de son appel.",pts:1},
    {w:`Les appels, dans l'ordre : ${code(o.L.join("\n"))}`,why:`Chaque décalage vers la droite est un appel fait par la ligne du dessus. Un appel sur une seule case (deb = fin) ne fait rien.`,pts:1.5},
    {w:`${2*n-1} appels à triFusionAux et <b>${n-1} fusions</b> ; à la fin, ${fx(`T = ${tabT(o.A)}`)}.`,why:`Il y a toujours n − 1 fusions : chacune réunit deux morceaux en un, et on passe de n morceaux d'une case à un seul tableau.`,pts:0.5}];
  function juge(rep){const j=jugeGrille(rep,"t",rows,r=>`fusion n° ${r+1}`);if(j.incomplet)return j;if(!j.faux.length)return {ok:true};const x=o.F[j.r0];
    return {ok:false,faux:j.faux,resume:`Pas tout à fait : la ligne de la fusion n° ${j.r0+1} est à revoir.`,diag:{etape:1,type:"ordre des fusions du tri fusion",titre:`Où ça part : la fusion n° ${j.r0+1}.`,msg:`C'est ${fx(`fusion(T, ${x.d}, ${x.m}, ${x.f})`)} : elle range ensemble les cases ${x.d} à ${x.f}, en réunissant ${fx(`T[${x.d}..${x.m}]`)} et ${fx(`T[${x.m+1}..${x.f}]`)}, déjà triés. Après elle : ${fx(tabT(x.T))}.`}};}
  const faux=rows.map(L=>L.map(String));faux[0]=faux[0].slice().reverse();
  return {sig:"TF"+T,q:`On lance le tri fusion du cours sur ${fx(`T = ${tabT(T)}`)} : ${fx(`triFusionAux(T, 0, ${n-1})`)}. Voici, dans l'ordre, les fusions qu'il fait (deb1, fin1, fin2). Écris le tableau T juste après chacune.`,corps:code(TFA),texte:`triFusionAux(${tabT(T)}, 0, ${n-1}) : le tableau après chaque fusion`,
    champs:[{k:"vf",id:"t",donne:["fusion"],cols:T.map((_,k)=>`T[${k}]`),lignes:lab.map(x=>[x]),aide:"Une ligne par fusion, dans l'ordre où elles sont faites : le tableau juste après elle."}],juge,etapes:E,bonne:`à la fin : ${fx(tabT(o.A))}`,bonneTxt:rows.map(tabT).join(" / "),repBonne:{t:rows.map(L=>L.map(String))},repFausse:{t:faux},nature:n+" cases",ens:{type:"tfa",T,rows}};}
function compteFusion(R){const n=R.ent(4,20),T=[...Array(n)].map((_,i)=>n-i),o=appelsTFA(T),A=o.L.filter(x=>/triFusionAux/.test(x)).length,F=o.F.length;
  const E=[{w:`<b>${A} appels</b> à triFusionAux et <b>${F} fusions</b>.`,why:`Chaque fusion réunit deux morceaux triés en un : on passe de ${n} morceaux d'une case à un seul, donc ${fx(`n − 1 = ${F}`)} fusions. Chaque appel qui fusionne fait deux appels, plus le tout premier : ${fx(`2n − 1 = ${A}`)} appels.`,pts:1.5},
    {w:`Équation de complexité : ${fx("T(n) = 2T(n/2) + θ(n)")}.`,why:"Deux appels récursifs sur une moitié du tableau, et une fusion qui parcourt les n cases.",pts:1},
    {w:`<b>${fx("T(n) = O(n.log(n))")}</b>`,why:`Master theorem : ${fx("a = 2")}, ${fx("b = 2")}, ${fx("d = 1")}, ${fx("b^{d} = 2 = a")} : ${fx("O(n^{d} log n) = O(n log n)")}. C'est la complexité du tri fusion donnée par le cours, et la borne inférieure d'un tri par comparaison.`,pts:1}];
  function juge(r){const a=lisNb(r,"a"),f=lisNb(r,"f");if(a===null||f===null)return {incomplet:"Écris les deux nombres : appels et fusions."};const jo=jugeOrdre(r.o,{g:n=>n*Math.log(n)});if(jo.inc)return {incomplet:jo.inc};
    const X=[];if(a!==A)X.push("a");if(f!==F)X.push("f");if(!jo.ok)X.push("o");if(!X.length)return {ok:true};
    return {ok:false,faux:X,resume:`Pas tout à fait : ${et(X.map(x=>x==="a"?"le nombre d'appels":x==="f"?"le nombre de fusions":"l'ordre de complexité"))} ${X.length>1?"sont à revoir":"est à revoir"}.`,diag:X[0]==="o"?{etape:2,type:"complexité du tri fusion",titre:"Où ça part : l'ordre de complexité.",msg:E[2].why}:{etape:0,type:a===F&&f===F?"appels confondus avec les fusions":"nombre d'appels du tri fusion",titre:"Où ça part : compter les appels.",msg:E[0].why}};}
  return {sig:"CF"+n,q:`On trie un tableau de ${n} cases avec le tri fusion du cours, ${fx(`triFusionAux(T, 0, ${n-1})`)}. Combien d'appels à triFusionAux sont faits en tout, le premier compris ? Combien de fusions ? Donne enfin l'ordre de complexité du tri fusion : ${fx("T(n) = O(…)")}.`,corps:code(TFA),texte:`tri fusion de ${n} cases : appels, fusions, ordre de complexité`,
    champs:[champNb("a","Appels à triFusionAux :"),champNb("f","Fusions :"),{k:"champ",id:"o",nom:"ordre de complexité",label:"$T(n) = O($ … $)$ avec :",ex:"par exemple n^2",sym:[["n","n"],["log(n)","log(n)"],[".","."],["^","^"]]}],juge,etapes:E,
    bonne:`${A} appels, ${F} fusions ; ${fx("O(n.log(n))")}`,bonneTxt:`${A} appels, ${F} fusions, O(n log n)`,repBonne:{a:String(A),f:String(F),o:"n*log(n)"},repFausse:{a:String(F),f:String(F),o:"n*log(n)"},nature:"compter",ens:{type:"cf",n,A,F}};}

/* ---------- AG13 : tri par valeurs ---------- */
function tirageVal(R){const p=R.ent(3,5),n=R.ent(8,12);let T;for(;;){T=[...Array(n)].map(()=>R.ent(0,p-1));if(new Set(T).size>=p-1&&!trie(T))break;}return {p,n,T};}
function cptExo(R){const {p,n,T}=tirageVal(R),X=joueT(TRIVAL(),[T,p]),C=[...Array(p)].map((_,v)=>T.filter(x=>x===v).length),noms=C.map((_,v)=>`Cpt[${v}]`);
  const E=[{w:`On compte chaque valeur : ${C.map((c,v)=>`${c} ${c>1?"fois":"fois"} ${v}`).join(", ")}.`,why:`Le « pour » lit T[0], T[1], … et ajoute 1 à la case Cpt de la valeur lue : ${fx("Cpt[T[i]] ← Cpt[T[i]] + 1")}.`,pts:1.5},
    {w:`<b>${fx(`Cpt = ${tabT(C)}`)}</b>`,why:`La somme des cases de Cpt fait ${n}, le nombre de cases de T : chaque case de T est comptée une fois.${C.includes(0)?" Une valeur absente de T garde 0.":""}`,pts:1},
    {w:`Le tableau trié : ${fx(tabT(X.env.T))}.`,why:"Le tant que recopie ensuite autant de 0 que Cpt[0], puis autant de 1 que Cpt[1], et ainsi de suite.",pts:0.5}];
  function juge(r){const V=noms.map(x=>entier(propre((r.c||{})[x]||"")));if(V.some(v=>v===null))return {incomplet:"Remplis chaque case de Cpt avec un entier."};const F=noms.filter((x,v)=>V[v]!==C[v]);if(!F.length)return {ok:true};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"plusieurs cases de Cpt sont à revoir":`${F[0]} est à revoir`}.`,diag:{etape:0,type:V.reduce((a,b)=>a+b,0)!==n?"une case de T oubliée ou comptée deux fois":"comptage du tri par valeurs",titre:"Où ça part : le comptage.",msg:`Cpt[v] est le nombre de cases de T qui valent v. Par exemple ${fx(`Cpt[${noms.indexOf(F[0])}] = ${C[noms.indexOf(F[0])]}`)}. La somme doit faire ${n}.`}};}
  return {sig:"CV"+T+"|"+p,q:`Voici le tri par valeurs du cours. On l'applique à ${fx(`T = ${tabT(T)}`)} avec ${fx(`p = ${p}`)}. Que contient le tableau Cpt juste après la boucle « pour » ?`,corps:code(texteT(TRIVAL())),texte:`TriValeurs(${tabT(T)}, ${p}) : Cpt après le comptage`,
    champs:[{k:"cases",id:"c",noms}],juge,etapes:E,bonne:fx(`Cpt = ${tabT(C)}`),bonneTxt:`Cpt = ${tabT(C)}`,repBonne:{c:Object.fromEntries(noms.map((x,v)=>[x,String(C[v])]))},repFausse:{c:Object.fromEntries(noms.map((x,v)=>[x,String(C[v]+(v?0:1))]))},nature:C.includes(0)?"une valeur absente":"toutes présentes",ens:{type:"cpt",T,p,C}};}
function tqVal(R){const {p,n,T}=tirageVal(R),X=joueT(TRIVAL(),[T,p]),tours=X.tours[1],kf=X.env.k,mx=Math.max(...T);
  const E=[{w:`À chaque tour du tant que, soit on écrit une valeur dans T (j augmente de 1), soit Cpt[k] vaut 0 et on passe à la valeur suivante (k augmente de 1).`,why:"Les deux branches du si.",pts:1},
    {w:`On écrit les ${n} valeurs : ${n} tours. On passe de k = 0 à ${fx(`k = ${mx}`)}, la plus grande valeur de T : ${mx} tours.`,why:`La boucle s'arrête dès que j = n, juste après avoir écrit le dernier ${mx} : k ne dépasse jamais ${mx}.${mx<p-1?` Il n'atteint pas ${p-1}, car aucune case ne vaut ${p-1}.`:""}`,pts:1.5},
    {w:`<b>${tours} tours</b>, et ${fx(`k = ${kf}`)} à la fin.`,why:`${n} + ${mx}. La complexité est θ(n + p) : n écritures, et au plus p − 1 passages d'une valeur à la suivante.`,pts:0.5}];
  function juge(r){const t=lisNb(r,"t"),k=lisNb(r,"k");if(t===null||k===null)return {incomplet:"Écris les deux nombres : les tours et la valeur de k."};const F=[];if(t!==tours)F.push("t");if(k!==kf)F.push("k");if(!F.length)return {ok:true};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux nombres sont à revoir":F[0]==="t"?"le nombre de tours est à revoir":"la valeur de k est à revoir"}.`,diag:{etape:1,type:t===n?"passages d'une valeur à la suivante oubliés":k===p-1||k===p?"k va jusqu'à p − 1":"tours du tant que du tri par valeurs",titre:"Où ça part : les deux sortes de tours.",msg:E[1].w.replace(/<[^>]+>/g,"")+" "+E[1].why}};}
  return {sig:"TV"+T+"|"+p,q:`Voici le tri par valeurs du cours. On l'applique à ${fx(`T = ${tabT(T)}`)} avec ${fx(`p = ${p}`)}. Combien de tours fait la boucle « tant que » ? Que vaut k à la fin ?`,corps:code(texteT(TRIVAL())),texte:`TriValeurs(${tabT(T)}, ${p}) : tours du tant que, k à la fin`,
    champs:[champNb("t","Tours du tant que :"),champNb("k","Valeur de k à la fin :")],juge,etapes:E,bonne:`${tours} tours, ${fx(`k = ${kf}`)}`,bonneTxt:`${tours} tours, k = ${kf}`,repBonne:{t:String(tours),k:String(kf)},repFausse:{t:String(n),k:String(kf)},nature:mx<p-1?"plus grande valeur absente":"jusqu'à p − 1",ens:{type:"tqv",T,p,tours,kf}};}

/* ---------- questions de cours du CC3, sur papier ---------- */
/* ---------- AG14 : la ligne fausse d'une recherche ou d'un tri ---------- */
function lisExprT(src){const T=[];const re=/\s*(\d+|[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*|≤|≥|≠|[-+*()<>=,\[\]])/y;
  const t=src.replace(/<=|=</g,"≤").replace(/>=|=>/g,"≥").replace(/!=|<>/g,"≠").replace(/[×·]/g,"*").replace(/[−–]/g,"-").replace(/&&|\band\b/gi," et ").replace(/\|\||\bor\b/gi," ou ").replace(/(^|[^\w\]])(\d+)([A-Za-z(])/g,"$1$2 * $3").trim();let m;
  while(re.lastIndex<t.length){m=re.exec(t);if(!m)return null;T.push(m[1]);}
  let p=0;const nx=()=>T[p],low=x=>x===undefined?x:x.toLowerCase();
  const prim=()=>{const x=nx();if(x===undefined)return null;
    if(x==="("){p++;const e=ou();if(e===null||nx()!==")")return null;p++;return e;}
    if(x==="-"){p++;const e=prim();return e===null?null:typeof e==="number"?-e:["-",0,e];}
    if(/^\d+$/.test(x)){p++;return +x;}
    if(/^[A-Za-zÀ-ÿ_]/.test(x)&&!["div","mod","et","ou"].includes(low(x))){p++;
      if(nx()==="["){p++;const e=ou();if(e===null||nx()!=="]")return null;p++;return IX(x,e);}
      if(nx()==="("){p++;const A=[];if(nx()!==")"){for(;;){const e=ou();if(e===null)return null;A.push(e);if(nx()===","){p++;continue;}break;}}if(nx()!==")")return null;p++;
        if(low(x)==="taille"&&A.length===1&&typeof A[0]==="string")return TA(A[0]);if(low(x)==="cond"&&A.length===3)return ["cond",...A];return null;}
      return x;}
    return null;};
  const niveau=(suiv,ops)=>()=>{let a=suiv();while(a!==null&&ops.includes(low(nx()))){const o=low(T[p++]),b=suiv();a=b===null?null:[o,a,b];}return a;};
  const mul=niveau(prim,["*","div","mod"]),add=niveau(mul,["+","-"]),cmp=niveau(add,["<","≤",">","≥","=","≠"]),et_=niveau(cmp,["et"]),ou=niveau(et_,["ou"]);
  const e=ou();return e!==null&&p===T.length?e:null;}
function lisLigneT(src){const t=propre(src).replace(/<-|:=/g,"←").replace(/;$/,"").trim();let m;
  if((m=/^échanger\s+(.+?)\s+et\s+(.+)$/i.exec(t))){const a=lisExprT(m[1]),b=lisExprT(m[2]);return estT(a)&&estT(b)?{k:"ech",a,b}:null;}
  if((m=/^pour\s+([A-Za-z])\s+(?:allant\s+)?de\s+(.+?)\s+(?:à|a)\s+(.+?)(\s+par\s+pas\s+de\s+-\s*1)?(?:\s+faire)?$/i.exec(t))){const a=lisExprT(m[2]),b=lisExprT(m[3]);return a===null||b===null?null:Object.assign({k:"pour",v:m[1],a,b},m[4]?{pas:-1}:{});}
  if((m=/^tant\s*que\s+(.+?)(?:\s+faire)?$/i.exec(t))){const c=lisExprT(m[1]);return c===null?null:{k:"tq",cond:c};}
  if((m=/^si\s+(.+?)(?:\s+alors)?$/i.exec(t))){const c=lisExprT(m[1]);return c===null?null:{k:"si",cond:c};}
  if((m=/^(?:renvoyer|retourner)\s+(.+)$/i.exec(t))){const e=lisExprT(m[1]);return e===null?null:{k:"ret",e};}
  if((m=/^(.+?)\s*←\s*(.+)$/.exec(t))){const v=lisExprT(m[1]),e=lisExprT(m[2]);return e!==null&&(typeof v==="string"&&/^[A-Za-z]+$/.test(v)||estT(v))?{k:"aff",v,e}:null;}
  return null;}
const ENT3={get der(){return this.dic;},lin:[[3,[]],[3,[3]],[5,[3]],[2,[1,2,2]],[4,[1,2,3]],[7,[7,1,7]],[1,[4,1]],[6,[2,6,4,6]]],dic:[[3,[]],[3,[3]],[1,[3]],[5,[3]],[3,[1,3,3,5,8]],[5,[1,3,3,5,8]],[4,[1,3,3,5,8]],[9,[1,3,3,5,8]],[0,[1,3,3,5,8]],[2,[2,2,2,2]],[6,[1,2,3,4,5,6]],[1,[1,2,3,4,5,6]]],
  tri:[[[]],[[1]],[[2,1]],[[3,1,2]],[[1,2,3]],[[3,3,1]],[[5,2,4,1,3]],[[2,7,1,7,3,0,5]],[[6,5,4,3,2,1]]]};
const PROGS3=[["lin",RECHLIN,"renvoyer le premier indice de T qui contient e, ou -1 si e n'est pas dans T"],["dic",()=>RECHDIC(false),"renvoyer le plus petit indice i tel que T[i] = e, ou -1 (T est trié)"],["der",()=>RECHDIC(true),"renvoyer le plus grand indice i tel que T[i] = e, ou -1 (T est trié)"],["tri",TRIBULLES,"trier T par ordre croissant"],["tri",TRISEL,"trier tab par ordre croissant"],["tri",TRIINS,"trier tab par ordre croissant"]];
function resultats3(P,sorte){return ENT3[sorte].map(a=>{try{const X=joueT(P,a,{garde:4000});return sorte==="tri"?tabT(X.env[P.params[0]]):String(X.ret);}catch(e){return /hors/.test(e.message)?"une case qui n'existe pas est lue":"ne s'arrête pas";}});}
/* toutes les retouches d'une ligne : un ± 1 en trop ou en moins, une comparaison changée, une valeur de départ changée */
function retouches(s){const R=[],c=x=>JSON.parse(JSON.stringify(x));
  const dans=(e,f)=>{if(!Array.isArray(e))return;if(e[0]==="+"&&e[2]===1){f(e,["x",e[1]]);f(e,["-",e[1],1]);}if(e[0]==="-"&&e[2]===1){f(e,["x",e[1]]);f(e,["+",e[1],1]);}if(e[0]==="="||e[0]==="≠")f(e,[e[0]==="="?"≠":"=",e[1],e[2]]);if(e[0]==="-"&&e[2]===2)f(e,["-",e[1],1]);
    const CH={"<":["≤",">"],"≤":["<"],">":["≥","<"],"≥":[">"]};if(CH[e[0]])CH[e[0]].forEach(o=>f(e,[o,e[1],e[2]]));e.slice(1).forEach(x=>dans(x,f));};
  const champs=s.k==="aff"?["e","v"]:s.k==="pour"?["a","b"]:s.k==="tq"||s.k==="si"?["cond"]:s.k==="ret"?["e"]:[];
  champs.forEach(k=>{const essai=(cible,nouv)=>{const t=c(s),chemin=[];(function cherche(e,ch){if(e===cible){chemin.push(...ch);return true;}if(Array.isArray(e))return e.some((x,i)=>cherche(x,ch.concat([i])));return false;})(s[k],[]);
      const remplace=(e,ch)=>{if(!ch.length)return nouv[0]==="x"?nouv[1]:nouv;const r=e.slice();r[ch[0]]=remplace(e[ch[0]],ch.slice(1));return r;};t[k]=remplace(s[k],chemin);R.push(t);};
    dans(s[k],essai);});
  if(s.k==="aff"&&typeof s.e==="number")[s.e+1,s.e-1].forEach(x=>{const t=c(s);t.e=x;R.push(t);});
  if(s.k==="aff"&&typeof s.e==="string"&&s.e!=="a"){const t=c(s);t.e=0;R.push(t);}
  if(s.k==="aff2")[0,1].forEach(i=>{if(typeof s.e[i]==="number"){const t=c(s);t.e[i]=s.e[i]+1;R.push(t);}});
  return R;}
function ligneFausse3(R,tri){for(;;){const [sorte,mk,dit]=tri?R.choix(PROGS3.slice(3)):R.choix(PROGS3.slice(0,3)),P0=mk(),bon=resultats3(P0,sorte),L0=lignesTn(P0.corps,1),F=[];
  L0.forEach((l,i)=>{if(!l.n||l.n.k==="init")return;retouches(l.n).forEach(nv=>{const Q=JSON.parse(JSON.stringify(P0)),q=lignesTn(Q.corps,1)[i].n;Object.keys(q).forEach(k=>delete q[k]);Object.assign(q,nv);const r=resultats3(Q,sorte);if(r.some((x,j)=>x!==bon[j]))F.push({i,Q,r});});});
  if(!F.length)continue;const f=R.choix(F),efface=R()<0.35,L1=lignesTn(f.Q.corps,1),num=f.i+1,j=bon.findIndex((x,k)=>x!==f.r[k]),entree=ENT3[sorte][j],sl=L0[f.i].n.k;
  const montre=L1.map((l,i)=>String(i+1).padStart(2," ")+"  "+(efface&&i===f.i?l.t.replace(/\S.*$/,"…"):l.t)),texte=P0.entete.concat(["DÉBUT"],montre,["FIN"]).join("\n"),nom=P0.nom;
  const cas=sorte==="tri"?`${fx(`${P0.params[0]} = ${tabT(entree[0])}`)}`:`${fx(`e = ${entree[0]}`)} et ${fx(`T = ${tabT(entree[1])}`)}`,attendu=sorte==="tri"?`le tableau doit devenir ${fx(bon[j])}`:`la fonction doit renvoyer ${bon[j]}`,obtenu=/case|arrête/.test(f.r[j])?(f.r[j]==="ne s'arrête pas"?"elle ne s'arrête jamais":"elle lit une case qui n'existe pas"):sorte==="tri"?`il devient ${fx(f.r[j])}`:`elle renvoie ${f.r[j]}`;
  const E=[{w:efface?`La ligne ${num} doit être ${SORTE[sl]?SORTE[sl].replace(/, comme.*/,""):"une ligne « échanger »"}.`:`On essaie un petit cas : avec ${cas}, ${attendu}, mais ${obtenu}.`,why:efface?`On relit ce que doit faire l'algorithme du cours : ${dit}. Il manque une ligne de cette sorte à cet endroit.`:`Pour trouver une faute, on déroule l'algorithme sur un tout petit tableau, et on compare avec ce qu'il doit faire : ${dit}.`,pts:1},
    {w:efface?`Pour vérifier ta ligne, essaie un petit cas : avec ${cas}, ${attendu}.`:`<b>La ligne fausse est la ligne ${num}</b> : « ${h(L1[f.i].t.trim())} ».`,why:"Une borne décalée d'une case, une comparaison stricte ou large, une valeur de départ : c'est ce qui change le résultat sur les petits cas, ou fait lire une case en dehors du tableau.",pts:1},
    {w:`La ligne ${efface?"à écrire":"corrigée"} : <b>« ${h(L0[f.i].t.trim())} »</b>.`,why:`C'est la ligne de l'algorithme du cours. Avec elle, l'algorithme est juste sur tous les petits cas essayés.`,pts:1}];
  function juge(rep){let k=f.i;
    if(!efface){const x=nombre((rep.c||{})["ligne"]);if(!x||x.d!==1||x.n<1||x.n>L1.length)return {incomplet:`Donne d'abord le numéro de la ligne fausse : un entier entre 1 et ${L1.length}.`};k=x.n-1;
      if(!L1[k].n||L1[k].n.k==="init")return {ok:false,faux:["ligne"],resume:`Pas tout à fait : la ligne ${k+1} ne peut pas être fausse.`,diag:{etape:1,type:"ligne fausse mal repérée",titre:"Où ça part : le numéro de la ligne.",msg:`La ligne ${k+1} ${L1[k].n?"prépare seulement le tableau":"ferme seulement un bloc"}. Cherche parmi les lignes qui calculent ou qui testent quelque chose.`}};}
    if(!propre(rep.l))return {incomplet:`Écris aussi la ligne ${efface?"manquante":"corrigée"}, dans le pseudo-code du cours.`};
    const lu=lisLigneT(rep.l),cible=L1[k].n;if(!lu)return {incomplet:"Je n'arrive pas à lire cette ligne. Écris-la comme dans le cours, par exemple « pour j de i+1 à n-1 faire », « si T[mil]<e alors » ou « deb ← mil+1 »."};
    if(lu.k!==cible.k&&!(cible.k==="aff2"&&lu.k==="aff"))return {incomplet:`La ligne ${k+1} est ${SORTE[cible.k]?SORTE[cible.k].replace(/, comme.*/,""):"une ligne « échanger »"} : écris une ligne de la même sorte.`};
    if(cible.k==="aff2")return {incomplet:"Cette ligne fait deux affectations : écris-la comme dans le cours, par exemple « deb, fin ← 0, taille(T)-1 »."};
    const Q=JSON.parse(JSON.stringify(f.Q)),q=lignesTn(Q.corps,1)[k].n,garde={c:q.c,alors:q.alors,sinon:q.sinon};Object.keys(q).forEach(x=>delete q[x]);Object.assign(q,lu);["c","alors","sinon"].forEach(x=>{if(garde[x]!==undefined)q[x]=garde[x];});
    const res=resultats3(Q,sorte);if(res.every((x,z)=>x===bon[z]))return {ok:true};const z=res.findIndex((x,y)=>x!==bon[y]),en=ENT3[sorte][z];
    return {ok:false,faux:efface||k===f.i?["l"]:["ligne"],resume:"Pas tout à fait : avec cette ligne, l'algorithme ne fait pas ce qu'il faut.",diag:!efface&&k!==f.i?{etape:1,type:"ligne fausse mal repérée",titre:"Où ça part : le numéro de la ligne.",msg:`La ligne ${k+1} était juste. La faute est à la ligne ${num}.`}
      :{etape:2,type:"ligne d'une recherche ou d'un tri",titre:"Où ça part : la ligne corrigée.",msg:`Avec ta ligne et ${sorte==="tri"?fx(`${P0.params[0]} = ${tabT(en[0])}`):`${fx(`e = ${en[0]}`)}, ${fx(`T = ${tabT(en[1])}`)}`}, on obtient « ${res[z]} » au lieu de « ${bon[z]} ».`}};}
  const champs=(efface?[]:[{k:"cases",id:"c",noms:["ligne"]}]).concat([{k:"champ",id:"l",nom:"ligne",label:efface?`La ligne ${num} :`:"La ligne corrigée :",ex:"dans le pseudo-code du cours",apercu:false,sym:[["←"," ← "],["≤","≤"],["≥","≥"],["≠","≠"],["[","["],["]","]"],["div"," div "]]}]);
  const bonL=L0[f.i].t.trim().replace(/−/g,"-");if(L0[f.i].n.k==="aff2")continue;
  return {sig:"L3"+texte.replace(/\s+/g," ")+efface,q:efface?`Cet algorithme du cours a perdu sa ligne ${num}. Il doit ${dit}. Écris la ligne ${num}.`:`Une ligne de cet algorithme du cours est fausse. Il doit ${dit}. Donne le numéro de la ligne fausse, puis écris la ligne corrigée.`,
    corps:code(texte),texte:`${nom} : ${efface?"ligne "+num+" effacée à écrire":"ligne fausse à trouver et à corriger"}`,champs,juge,etapes:E,bonne:`${efface?"":`ligne ${num} : `}« ${h(bonL)} »`,bonneTxt:`${efface?"":`ligne ${num} : `}${bonL}`,
    repBonne:Object.assign(efface?{}:{c:{ligne:String(num)}},{l:bonL}),repFausse:Object.assign(efface?{}:{c:{ligne:String(num)}},{l:L1[f.i].t.trim().replace(/−/g,"-")}),nature:(efface?"effacée, ":"fausse, ")+nom,ens:{type:"l3",sorte,P0,P1:f.Q,num,efface}};}}
const coursDic=()=>papierQ("QD","Questions de cours sur la recherche dichotomique (diapos 95 et 97).",`<ol type="a"><li>Prouve que RechDic s'arrête.</li><li>Donne sa complexité dans le pire cas, en expliquant le calcul.</li></ol>`,[
  ["a) fin − deb + 1 est un entier naturel ; il décroît strictement à chaque itération ; le tant que s'arrête lorsqu'il vaut 0 ou moins.","C'est la preuve de la diapo 95. fin − deb + 1 est le nombre de cases où on cherche encore : à chaque tour, on garde au plus la moitié.",1],
  ["Il y a donc un nombre fini d'itérations. Chaque itération se termine. Donc l'algorithme se termine.","Les trois phrases de conclusion du cours, à écrire telles quelles.",0.5],
  [`b) Pire cas : tout le tableau est &lt; e. On prend ${fx("n = 2^{k}")} (pas de perte de généralité).`,"Diapo 97 : c'est le cas où la boucle fait le plus de tours.",0.5],
  ["Nombre d'itérations = nombre de divisions de n par 2 jusqu'à tomber sur 0, donc k + 1. Chaque itération est en θ(1).","Chaque tour fait un nombre fixe d'opérations, qui ne dépend pas de n.",0.5],
  [`${fx("T_{n} = θ(1) + (k + 1).θ(1) = θ(k)")}, donc ${fx("T_{n} = θ(log(n))")} : l'algorithme est logarithmique.`,`Comme ${fx("n = 2^{k}")}, ${fx("k = log₂(n)")}.`,0.5]],"dichotomie");
const coursTris=()=>papierQ("QT","Questions de cours sur les tris (diapos 100 à 114).",`<ol type="a"><li>Donne la complexité du tri par valeurs, du tri à bulles, du tri par sélection, du tri par insertion et du tri fusion.</li><li>Lesquels sont stables ? Lequel n'est pas en place ?</li><li>Quelles sont les bornes inférieures d'un tri de tableau, et d'un tri par comparaison ?</li></ol>`,[
  ["a) Tri par valeurs : θ(p + n), soit θ(n) si p = O(n). Tri à bulles, par sélection, par insertion : θ(n²). Tri fusion : θ(n log n).","Diapos 102, 105, 112 et 114.",1.5],
  ["b) Le tri à bulles, le tri par insertion et le tri fusion sont stables (les éléments égaux restent dans le même ordre). Le tri fusion n'est pas en place : il a besoin d'espace en plus pour la fusion.","Diapos 105 et 112 : le tri à bulles est en place et stable. Le tri par insertion aussi : il ne décale tab[j] que si tab[j] &gt; a, donc deux valeurs égales ne se croisent jamais.",1],
  ["c) Tout tri de tableau est en Ω(n) : il faut au moins parcourir toutes les cases. Le tri par valeurs l'atteint.","Diapo 104.",0.75],
  ["Un tri par comparaison est en Ω(n log n) : il faut au moins n log n/4 comparaisons. Le tri fusion l'atteint.","Diapo 113.",0.75]],"tris");
const coursQuelTri=()=>papierQ("QQ","Examen de janvier 2023, exercice 4, question 1 (2 points), puis CC1 de novembre 2024.",`<ol type="a"><li>On veut trier un tableau de chiffres de taille n. Anakin affirme pouvoir l'écrire en θ(n²), Leia en θ(n log(n)), Chewbacca en θ(n) et Luke en θ(1). Parmi ces propositions, lesquelles sont impossibles ? Justifier. Parmi les autres, donner le nom d'un tri du cours qui permet d'obtenir le meilleur ordre de complexité.</li><li>Luc veut ranger ses vaisseaux spatiaux par ordre de taille. Sa seule action possible est de permuter deux vaisseaux. Citer deux tris du cours qui lui permettent d'y arriver.</li></ol>`,[
  ["a) La proposition de Luke est impossible, car il faut au moins parcourir le tableau pour pouvoir le trier, donc l'algorithme de tri est en Ω(n).","Corrigé officiel de janvier 2023.",0.75],
  ["La proposition de Chewbacca est possible, car chaque chiffre peut prendre uniquement 10 valeurs : on peut trier le tableau par valeurs avec une complexité en temps θ(n).","Corrigé officiel : c'est le nom du tri qui est demandé, le tri par valeurs.",0.75],
  ["Les propositions d'Anakin et Leia sont moins performantes, donc possibles aussi.","Corrigé officiel : −0,5 point si on propose θ(n log(n)) comme meilleur ordre.",0.5],
  ["b) Il peut utiliser le tri à bulles ou le tri par sélection, qui reposent sur la permutation d'éléments.","Corrigé officiel du CC1 de novembre 2024.",0.5]],"quel tri");

G.add("algo",[
 {id:"AG9",t:"Recherche dans un tableau : linéaire et dichotomique",tache:"recherche linéaire et dichotomique",th:"dicho",ex:"cc3",pts:4,lecons:["a3-dicho"],
  paliers:[
   {t:"la recherche linéaire : valeur renvoyée et nombre de tours",cc:3,gen:rechLin},
   {t:"la recherche dichotomique : la trace",cc:5,gen:R=>rechDic(R,false)},
   {t:"combien de tours, combien d'essais",cc:3,gen:iterDic,min:35},
   {t:"la variante qui renvoie le dernier indice (diapo 98)",cc:5,gen:R=>rechDic(R,true)}]},
 {id:"AG10",t:"Tri à bulles : le tableau après chaque tour",tache:"tri à bulles",th:"fusion",ex:"cc3",pts:2,lecons:["a3-fusion"],
  paliers:[
   {t:"le tableau après chaque itération",cc:4,gen:R=>triTours(R,"bulles",false)},
   {t:"avec des valeurs égales, et le nombre d'échanges",cc:5,gen:R=>triTours(R,"bulles",true)}]},
 {id:"AG11",t:"Tri par sélection et tri par insertion",tache:"tri par sélection et tri par insertion",th:"tris",ex:"cc3",pts:4,lecons:["a3-tris"],apres:["AG10"],
  paliers:[
   {t:"le tri par sélection, après chaque itération",cc:4,gen:R=>triTours(R,"sel",false)},
   {t:"le tri par insertion, après chaque itération",cc:4,gen:R=>triTours(R,"ins",false)},
   {t:"quel tri a produit ces tableaux ?",cc:3,gen:quelTri},
   {t:"compter les comparaisons, les échanges, les décalages",cc:3,gen:compteTri,min:60}]},
 {id:"AG12",t:"Tri fusion : la fusion, les appels, la complexité",tache:"tri fusion",th:"fusion",ex:"cc3",pts:3,lecons:["a3-fusion"],apres:["AG10"],
  paliers:[
   {t:"la fusion de deux moitiés triées",cc:4,gen:fusionExo},
   {t:"le tableau après chaque fusion",cc:6,gen:triFusionExo},
   {t:"appels, fusions et ordre de complexité",cc:3,gen:compteFusion,min:15}]},
 {id:"AG13",t:"Tri par valeurs",tache:"tri par valeurs",th:"valeurs",ex:"cc3",pts:2,lecons:["a3-valeurs"],
  paliers:[
   {t:"le tableau Cpt après le comptage",cc:3,gen:cptExo},
   {t:"les tours du tant que",cc:4,gen:tqVal}]},
 {id:"AG14",t:"Trouver la ligne fausse d'une recherche ou d'un tri",tache:"ligne fausse d'une recherche ou d'un tri",th:"tris",ex:"cc3",pts:1,lecons:["a3-dicho","a3-tris"],apres:["AG9","AG11"],
  paliers:[
   {t:"la recherche linéaire ou dichotomique",cc:3,gen:R=>ligneFausse3(R,false),min:20},
   {t:"le tri à bulles, par sélection ou par insertion",cc:4,gen:R=>ligneFausse3(R,true),min:30}]},
 {id:"AGQ4",t:"Question de cours : l'arrêt et la complexité de la recherche dichotomique",th:"dicho",ex:"cc3",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:5,gen:coursDic}]},
 {id:"AGQ5",t:"Question de cours : complexités et propriétés des tris",th:"tris",ex:"cc3",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:5,gen:coursTris}]},
 {id:"AGQ6",t:"Question de cours : quel tri, quelles complexités possibles",th:"valeurs",ex:"cc3",fixe:true,seuil:1,lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:4,gen:coursQuelTri}]}
]);
G.algo={joueT,texteT,ecritT,lignesTn,execute,compte,joue,colonnes,texteProg,ecrit,vaut,aff,pour,tq,si,ret,prog,code,tableTrace};
})();
