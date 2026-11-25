/* Algèbre : générateurs d'exercices du CC1 (la liste annoncée par le prof le 11/11) */
(function(){
"use strict";
const G=window.GEN,{Q,q,add,sub,mul,div,egal,nul,nb,brut,par,comb,aff,sys,mat,ligne,trou,dansLignes}=G.outils;
const sansNom=s=>String(s==null?"":s).replace(/^\s*[a-zA-Zα-ω]′?\s*=(?!=)/,"");
const nombre=s=>G.outils.nombre(sansNom(s).trim().replace(/^\((.*)\)$/,"$1")),liste=(s,n)=>G.outils.liste(String(s==null?"":s).replace(/^[^=]*=/,""),n),affine=(s,p)=>G.outils.affine(sansNom(s),p);
/* une formule courte ne se coupe pas en fin de ligne ; une longue peut, sinon elle déborderait sur un téléphone */
const fx=s=>s.replace(/[_{}]/g,"").length>30?G.outils.f(s):G.outils.fx(s);
const NOMS=["x","y","z","t"];
const prod=(L,U)=>L.map(l=>U[0].map((_,j)=>l.reduce((s,x,k)=>s+x*U[k][j],0)));
const fois=(M,v)=>M.map(r=>r.reduce((s,x,k)=>s+x*v[k],0));
const abs=x=>{x=q(x);return Q(Math.abs(x.n),x.d);};
const nFois=m=>egal(abs(m),1)?"":nb(abs(m))+" fois ";
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];
const suite=(s,moins,corps)=>s?`${s} ${moins?"−":"+"} ${corps}`:(moins?"−":"")+corps;

/* ---------- AL1 : pivot de Gauss ---------- */
/* échelonnement par le chemin du cours : premier nombre non nul de la colonne comme pivot, zéros en dessous */
function echelonne(A,b){const M=A.map((r,i)=>r.concat(b[i]).map(q)),n=M.length,c=A[0].length,pas=[],piv=[];let r=0;
  for(let j=0;j<c&&r<n;j++){let p=-1;for(let i=r;i<n;i++)if(!nul(M[i][j])){p=i;break;}
    if(p<0)continue;
    if(p!==r){[M[r],M[p]]=[M[p],M[r]];pas.push({k:"ech",a:r,b:p,col:j,M:M.map(x=>x.slice())});}
    const ops=[];for(let i=r+1;i<n;i++){if(nul(M[i][j]))continue;const m=div(M[i][j],M[r][j]),v=M[i][j];M[i]=M[i].map((x,t)=>sub(x,mul(m,M[r][t])));ops.push({i,m,v});}
    if(ops.length)pas.push({k:"zer",lig:r,col:j,piv:M[r][j],ops,M:M.map(x=>x.slice())});
    piv.push(j);r++;}
  return {pas,E:M,piv,rang:r,c};}
/* solutions lues sur la matrice échelonnée : chaque inconnue en fonction des inconnues libres */
function solution(R,noms){const {E,piv,rang,c}=R;noms=noms||NOMS;
  for(let i=rang;i<E.length;i++)if(!nul(E[i][c]))return {nature:"zero",lig:i};
  const libres=[];for(let j=0;j<c;j++)if(!piv.includes(j))libres.push(j);
  const S=[];libres.forEach(j=>{S[j]={c:Q(0),k:{[noms[j]]:Q(1)}};});
  for(let r=rang-1;r>=0;r--){const j=piv[r],e={c:E[r][c],k:{}};
    for(let t=j+1;t<c;t++){if(nul(E[r][t]))continue;const s=S[t];e.c=sub(e.c,mul(E[r][t],s.c));Object.keys(s.k).forEach(v=>{e.k[v]=sub(e.k[v]||Q(0),mul(E[r][t],s.k[v]));});}
    e.c=div(e.c,E[r][j]);Object.keys(e.k).forEach(v=>{e.k[v]=div(e.k[v],E[r][j]);if(nul(e.k[v]))delete e.k[v];});S[j]=e;}
  return {nature:libres.length?"inf":"une",S,libres};}
const verifTxt=(l,v)=>{let s="";l.forEach((co,k)=>{co=q(co);if(!co.n)return;const a=abs(co);
  if(!s&&egal(a,1)){s=nb(mul(co,v[k]));return;}
  s+=(s?(co.n<0?" − ":" + "):(co.n<0?"−":""))+(egal(a,1)?par(v[k]):nb(a)+" × "+par(v[k]));});return s||"0";};

/* les étapes d'échange et de mise à zéro, communes aux systèmes à nombres et à lettres ; rend le numéro d'étape de chaque colonne */
function etapesOps(E,R,N,rend,fin){const idx={};
  R.pas.forEach(P=>{
    if(P.k==="ech")E.push({w:`${fx(`L_{${P.a+1}} ↔ L_{${P.b+1}}`)} : ${rend(P.M)}`,why:`Dans la colonne de ${N[P.col]}, la ligne ${P.a+1} a un 0 : elle ne peut pas donner le pivot. On l'échange avec la ligne ${P.b+1}, qui a un nombre non nul dans cette colonne.`,pts:0.5});
    else{idx[P.col]=E.length;E.push({w:`${et(P.ops.map(o=>fx(ligne(o.i+1,o.m,P.lig+1))))} : ${rend(P.M)}`,why:`Le pivot de la ligne ${P.lig+1} est ${nb(P.piv)}, dans la colonne de ${N[P.col]}. Il faut des zéros sous lui : ${P.ops.map(o=>`à la ligne ${o.i+1} il y a ${nb(o.v)}, donc on ${q(o.m).n>0?"retire":"ajoute"} ${nFois(o.m)}la ligne ${P.lig+1}`).join(" ; ")}. ${fin}`,pts:1});}});
  return idx;}

/* les lignes de la remontée, pour un système échelonné R et ses solutions sol : « Ligne 2 : y + 3z = −3, donc y = −3 − 3 × (−1) = 0 » */
function lecteur(R,sol,N){const c=R.c,lib=sol.nature==="inf"?sol.libres.map(j=>N[j]):[];
  const symb=(r,signe)=>{const j=R.piv[r],L=R.E[r],p=L[j];let s=nul(L[c])?"":nb(L[c]);for(let t=j+1;t<c;t++){if(nul(L[t]))continue;const a=abs(L[t]),neg=q(L[t]).n<0;s=suite(s,signe&&signe.t===t?neg:!neg,(egal(a,1)?"":nb(a))+N[t]);}
    s=s||"0";return egal(p,1)?s:`(${s}) / ${par(p)}`;};
  const remonte=r=>{const j=R.piv[r],L=R.E[r],p=L[j],eq=`${comb(L.slice(0,c),N)} = ${nb(L[c])}`,autres=[];for(let t=j+1;t<c;t++)if(!nul(L[t]))autres.push(t);
    if(!autres.length)return egal(p,1)?`Ligne ${r+1} : ${fx(eq)}.`:`Ligne ${r+1} : ${fx(eq)}, donc ${fx(`${N[j]} = ${nb(L[c])} / ${par(p)} = ${aff(sol.S[j],N)}`)}.`;
    if(sol.nature==="inf")return `Ligne ${r+1} : ${fx(eq)}, donc ${fx(`${N[j]} = ${symb(r)}`)}${autres.every(t=>lib.includes(N[t]))&&egal(p,1)?"":`, c'est-à-dire ${fx(`${N[j]} = ${aff(sol.S[j],N)}`)}`}.`;
    let num=nul(L[c])&&autres.length>1?"":nb(L[c]);autres.forEach(t=>{const a=abs(L[t]);num=suite(num,q(L[t]).n>0,(egal(a,1)?"":nb(a)+" × ")+par(sol.S[t].c));});
    return `Ligne ${r+1} : ${fx(eq)}, donc ${fx(`${N[j]} = ${egal(p,1)?num:`(${num}) / ${par(p)}`} = ${nb(sol.S[j].c)}`)}.`;};
  return {symb,remonte};}

function systeme(A,b,palier){
  const n=A.length,c=A[0].length,N=NOMS.slice(0,c),R=echelonne(A,b),sol=solution(R),M0=A.map((r,i)=>r.concat([b[i]])),homog=b.every(x=>x===0);
  const lib=sol.nature==="inf"?sol.libres.map(j=>N[j]):[],princ=R.piv.map(j=>N[j]);
  const E=[{w:`Matrice augmentée du système : ${mat(M0,true)}`,why:`Une colonne par inconnue (${N.join(", ")}), puis les seconds membres après la barre.${A.some(r=>r.includes(0))?" Une inconnue absente d'une équation compte pour 0.":""}`,pts:0.5}];
  const idx=etapesOps(E,R,N,M=>mat(M,true),"Chaque opération se fait sur toute la ligne, second membre compris.");
  const iLect=E.length;
  const {symb,remonte}=lecteur(R,sol,N);
  let bonne,bonneTxt,repBonne;
  if(sol.nature==="zero"){const L=R.E[sol.lig];
    E.push({w:`La ligne ${sol.lig+1} dit ${fx(`0 = ${nb(L[c])}`)} : c'est impossible. <b>${fx("S = ∅")}</b>`,why:`Une ligne « 0 = un nombre non nul » n'est vraie pour aucune valeur des inconnues : le système n'a aucune solution. À ne pas confondre avec « 0 = 0 », qui est toujours vraie et n'empêche rien.`,pts:1});
    bonne=`aucune solution, ${fx("S = ∅")}`;bonneTxt="aucune solution";repBonne={nature:"zero"};}
  else if(sol.nature==="une"){const v=sol.S.map(e=>e.c),k=n>1?1:0;
    E.push({w:R.piv.map((_,r)=>remonte(R.piv.length-1-r)).join("<br>"),why:`La matrice est échelonnée et chaque inconnue a son pivot : il y a une seule solution. On remonte : la dernière ligne donne ${N[c-1]}, puis on remplace dans la ligne du dessus, et ainsi de suite.`,pts:1});
    E.push({w:`<b>${fx(`S = {(${v.map(nb).join(", ")})}`)}</b>. Vérification dans l'équation ${k+1} : ${fx(`${verifTxt(A[k],v)} = ${nb(b[k])}`)}.`,why:`On finit toujours par l'ensemble des solutions. La vérification prend dix secondes et rattrape une erreur de calcul.`,pts:0.5});
    bonne=`une seule solution, ${fx(`S = {(${v.map(nb).join(", ")})}`)}`;bonneTxt="une seule solution : ("+v.map(brut).join(", ")+")";
    repBonne={nature:"une",sol:Object.fromEntries(N.map((x,i)=>[x,brut(v[i])]))};}
  else{const ex=sol.S.map(e=>aff(e,N)),p0=sol.S.map(e=>Object.values(e.k).reduce((s,x)=>add(s,x),e.c));
    E.push({w:`${et(princ)} ${princ.length>1?"ont":"a"} un pivot. ${et(lib)} n'${lib.length>1?"en ont":"en a"} pas : ${lib.length>1?"ce sont des variables libres":"c'est une variable libre"}.<br>${R.piv.map((_,r)=>remonte(R.piv.length-1-r)).join("<br>")}`,why:`Une variable libre peut prendre n'importe quelle valeur : il y a donc une infinité de solutions. On écrit les autres inconnues en fonction ${lib.length>1?"d'elles":"d'elle"}, en remontant de la dernière ligne à la première.`,pts:1.5});
    E.push({w:`<b>${G.outils.f(`S = {(${ex.join(", ")}) | ${lib.join(", ")} ∈ ℝ}`)}</b>. Vérification avec ${lib.map(x=>x+" = 1").join(" et ")} : ${fx(`(${p0.map(nb).join(", ")})`)} donne bien ${fx(`${verifTxt(A[0],p0)} = ${nb(b[0])}`)} dans l'équation 1.`,why:`Une solution pour chaque valeur ${lib.length>1?"des variables libres":"de "+lib[0]}. On vérifie sur un cas simple.`,pts:0.5});
    bonne=`une infinité de solutions, ${G.outils.f(`S = {(${ex.join(", ")}) | ${lib.join(", ")} ∈ ℝ}`)}`;bonneTxt="une infinité : ("+ex.join(", ").replace(/−/g,"-")+"), "+lib.join(", ")+" libre"+(lib.length>1?"s":"");
    repBonne={nature:"inf",par:Object.fromEntries(N.map((x,i)=>[x,ex[i].replace(/−/g,"-")]))};}
  const iFin=E.length-1;

  /* « trouvons où ça part » : des lignes de sa matrice, jugées sur une seule chose, sont-elles des conséquences justes du système ? */
  const consequence=(l,zeros)=>l.slice(0,zeros).every(nul)&&!l.every(nul)&&dansLignes(M0,l);
  const demandeLigne=(txt,zeros,faux)=>({q:`${txt} Donne ses ${c+1} nombres, séparés par des espaces.`,juge(s){const l=liste(s,c+1);return l?consequence(l,zeros):null;},siFaux:faux});
  const etape1={etape:idx[0]!=null?idx[0]:1,titre:"Où ça part : les zéros de la première colonne.",msg:`Cette ligne ne peut pas venir du système : il y a une erreur de calcul dans l'opération qui la donne. Refais-la nombre par nombre, sans oublier le second membre.`};
  const col2=R.piv[1],etape2={etape:idx[col2]!=null?idx[col2]:iLect-1,titre:"Où ça part : les zéros de la deuxième colonne de pivot.",msg:`Tes lignes étaient justes après la première colonne, mais plus après la suivante : l'erreur est dans l'opération de cette étape.`};
  function cherche(){if(n!==3||R.rang<2)return null;
    const L=[demandeLigne(`Après avoir fait apparaître les zéros de la première colonne, ta matrice a deux lignes qui commencent par 0. Écris-en une.`,1,etape1),
      demandeLigne(`Écris l'autre ligne qui commence par 0, au même moment.`,1,etape1)];
    return {L,sinon:sol.nature==="une"?{etape:iLect,titre:"Où ça part : après la première colonne.",msg:`Tes deux lignes sont justes. L'erreur vient donc ensuite : soit l'opération qui met un zéro dans la colonne suivante, soit la remontée. Compare avec les étapes ci-dessous.`}:etape2};}

  function juge(rep){
    const nat=rep.nature;if(!nat)return {incomplet:"Choisis d'abord le nombre de solutions."};
    const faux=[];let resume,diag=null,ch=null;
    if(nat==="une"){const v=N.map(x=>nombre((rep.sol||{})[x]));
      if(v.some(x=>!x))return {incomplet:"Remplis chaque case avec un nombre, par exemple 3, -2 ou 1/2."};
      const sat=A.map((l,i)=>egal(l.reduce((s,co,k)=>add(s,mul(co,v[k])),Q(0)),b[i]));
      if(sol.nature==="une"){N.forEach((x,i)=>{if(!egal(v[i],sol.S[i].c))faux.push(x);});
        if(!faux.length)return {ok:true};
        const justes=N.filter(x=>!faux.includes(x));
        resume=`Pas tout à fait : ${justes.length?`${et(justes)} ${justes.length>1?"sont justes":"est juste"}, `:""}${et(faux)} ${faux.length>1?"sont faux":"est faux"}.`;
        /* la première valeur fausse en remontant : erreur de signe sur un terme, ou pivot oublié ? */
        for(let r=R.piv.length-1;r>=0&&!diag;r--){const j=R.piv[r];if(egal(v[j],sol.S[j].c))continue;
          const L=R.E[r],p=L[j];let somme=q(L[c]);const T=[];for(let t=j+1;t<c;t++){if(nul(L[t]))continue;T.push(t);somme=sub(somme,mul(L[t],v[t]));}
          if(T.some(t=>!egal(v[t],sol.S[t].c)))break;
          const reste=()=>{let okS=true;const w=v.slice();for(let rr=r-1;rr>=0&&okS;rr--){const jj=R.piv[rr],LL=R.E[rr];let s=q(LL[c]);for(let t=jj+1;t<c;t++)s=sub(s,mul(LL[t],w[t]));okS=egal(div(s,LL[jj]),v[jj]);}return okS&&r>0?" Le reste de ta remontée est cohérent avec cette valeur : une fois corrigée, tout suit.":"";};
          const eq=`${comb(L.slice(0,c),N)} = ${nb(L[c])}`;
          if(!egal(p,1)&&egal(v[j],somme)){diag={etape:iLect,type:"pivot oublié",titre:`Où ça part : la remontée, ligne ${r+1}.`,msg:`${fx(eq)} donne ${fx(`${N[j]} = ${symb(r)} = ${nb(sol.S[j].c)}`)}. Tu as trouvé ${nb(v[j])} : c'est la valeur avant de diviser par le pivot ${nb(p)}.${reste()}`};break;}
          for(const t of T){const alt=div(add(somme,mul(mul(2,L[t]),v[t])),p);
            if(egal(v[j],alt)&&!egal(alt,sol.S[j].c)){const a=abs(L[t]),terme=(q(L[t]).n<0?"−":"+")+(egal(a,1)?"":nb(a))+N[t];
              diag={etape:iLect,type:"signe dans la remontée",titre:`Où ça part : la remontée, ligne ${r+1}.`,msg:`${fx(eq)} donne ${fx(`${N[j]} = ${symb(r)} = ${nb(sol.S[j].c)}`)}. Tu as trouvé ${nb(v[j])} : c'est ce qu'on obtient en écrivant ${fx(`${N[j]} = ${symb(r,{t})}`)}. Quand ${fx(terme)} change de côté, il change de signe.${reste()}`};break;}}
          if(!diag&&r<R.piv.length-1){diag={etape:iLect,type:"remontée",titre:`Où ça part : la ligne ${r+1}.`,msg:`Tes valeurs de ${et(T.map(t=>N[t]))} sont justes, mais pas celle de ${N[j]}. Soit ta ligne ${r+1} échelonnée est fausse, soit le calcul de ${N[j]} : la bonne ligne est ${fx(eq)}, qui donne ${fx(`${N[j]} = ${nb(sol.S[j].c)}`)}.`};}
          break;}
        if(!diag){const ok=sat.map((s,i)=>s?i+1:0).filter(Boolean);
          if(ok.length&&ok.length<n)resume+=` Tes valeurs vérifient ${ok.length>1?"les équations":"l'équation"} ${et(ok.map(String))}, pas ${ok.length===n-1?"l'autre":"les autres"}.`;ch=cherche();}}
      else if(sol.nature==="inf"){
        if(sat.every(Boolean)){resume="Presque : tes valeurs donnent bien une solution, mais ce n'est pas la seule.";diag={etape:iLect,type:"inconnue libre oubliée",titre:"Où ça part : la lecture de la matrice échelonnée.",msg:`${et(lib)} n'${lib.length>1?"ont":"a"} pas de pivot : ${lib.length>1?"elles sont libres":"elle est libre"}, donc il y a une infinité de solutions. Tu as donné celle où ${lib.map((x,i)=>x+" = "+nb(v[sol.libres[i]])).join(" et ")}.`};}
        else{resume="Ce n'est pas ça : ce système a une infinité de solutions, et tes valeurs ne vérifient pas toutes les équations.";ch=cherche();}}
      else{resume="Ce n'est pas ça : ce système n'a aucune solution.";ch=cherche();}}
    else if(nat==="inf"){
      if(sol.nature!=="inf"){
        if(sol.nature==="zero"){resume="Ce n'est pas ça : ce système n'a aucune solution.";diag={etape:iFin,type:"0 = 0 confondu avec 0 = nombre",titre:"Où ça part : la lecture de la dernière ligne.",msg:`La dernière ligne de la matrice échelonnée dit ${fx(`0 = ${nb(R.E[sol.lig][c])}`)}, ce qui est impossible : aucune solution. C'est une ligne « 0 = 0 » qui laisse une infinité de solutions. Si tu as trouvé « 0 = 0 », il y a une erreur de calcul dans le second membre.`};}
        else{resume="Ce n'est pas ça : ce système a une seule solution.";ch=cherche();}
        return {ok:false,faux:["nature"],resume,diag,cherche:ch};}
      const e=N.map(x=>affine((rep.par||{})[x]));
      if(e.some(x=>!x))return {incomplet:`Chaque case doit contenir un nombre ou une expression comme 2 - ${lib[0]} ou 3${lib[0]}. Pour une variable libre, écris son nom.`};
      const P=[...new Set(e.flatMap(x=>Object.keys(x.k)))],pt=e.map(x=>x.c),dirs=P.map(v=>e.map(x=>x.k[v]||Q(0)));
      const colle=(l,w,d)=>egal(l.reduce((s,co,k)=>add(s,mul(co,w[k])),Q(0)),d);
      const mauvais=A.findIndex((l,i)=>!colle(l,pt,b[i])),mauvaisD=dirs.findIndex(d=>A.some(l=>!colle(l,d,0)));
      if(mauvais<0&&mauvaisD<0&&P.length&&G.outils.rang(dirs)===lib.length)return {ok:true};
      /* avec les mêmes inconnues libres que le corrigé : dire quelles cases sont fausses */
      if(lib.every(x=>{const k=e[N.indexOf(x)];return nul(k.c)&&Object.keys(k.k).length===1&&k.k[x]&&egal(k.k[x],1);})){
        N.forEach((x,i)=>{const s=sol.S[i],d=e[i];if(!egal(s.c,d.c)||!lib.every(v=>egal(s.k[v]||Q(0),d.k[v]||Q(0)))||Object.keys(d.k).some(v=>!lib.includes(v)))faux.push(x);});
        const r=R.piv.findIndex(j=>N[j]===faux[faux.length-1]);
        if(faux.length&&r>=0){resume=`Pas tout à fait : ${et(faux)} ${faux.length>1?"sont faux":"est faux"}.`;
          diag={etape:iLect,type:"expression d'une inconnue",titre:`Où ça part : la ligne ${r+1} de la remontée.`,msg:remonte(r)};}}
      if(!diag){
        if(!P.length||G.outils.rang(dirs.length?dirs:[pt.map(()=>Q(0))])<lib.length)resume=`Pas tout à fait : il manque ${lib.length>1?"des variables libres":"la variable libre"} dans ta réponse. ${et(lib)} ${lib.length>1?"doivent":"doit"} pouvoir prendre n'importe quelle valeur.`;
        else if(mauvais>=0)resume=`Pas tout à fait : avec ${P.map(v=>v+" = 0").join(" et ")}, ta réponse donne (${pt.map(nb).join(", ")}), qui ne vérifie pas l'équation ${mauvais+1}.`;
        else{const w=pt.map((x,k)=>add(x,dirs[mauvaisD][k])),k=A.findIndex((l,i)=>!colle(l,w,b[i]));resume=`Pas tout à fait : avec ${P[mauvaisD]} = 1${P.length>1?" et les autres à 0":""}, ta réponse donne (${w.map(nb).join(", ")}), qui ne vérifie pas l'équation ${k+1}.`;}
        diag={etape:iLect,type:"expression d'une inconnue",titre:"Où ça part : l'écriture des inconnues avec la variable libre.",msg:`Reprends la remontée ligne par ligne, ci-dessous.`};}}
    else{
      if(sol.nature==="zero")return {ok:true};
      if(sol.nature==="inf"){resume="Ce n'est pas ça : ce système a une infinité de solutions.";diag={etape:iLect,type:"0 = 0 confondu avec 0 = nombre",titre:"Où ça part : la lecture de la dernière ligne.",msg:`${R.rang<n?"La dernière ligne de la matrice échelonnée est « 0 = 0 » : elle est toujours vraie, elle n'empêche rien. ":""}Aucune ligne ne dit « 0 = un nombre non nul », donc il y a des solutions. Et ${et(lib)} n'${lib.length>1?"ont":"a"} pas de pivot : une infinité.`};}
      else{resume="Ce n'est pas ça : ce système a une seule solution.";ch=cherche();}}
    if(nat!==sol.nature&&!faux.includes("nature"))faux.unshift("nature");
    return {ok:false,faux,resume,diag,cherche:ch};}

  const lignes=A.map((r,i)=>comb(r,N)+" = "+nb(b[i]));
  return {sig:JSON.stringify([A,b]),
    q:"Résous ce système par le pivot de Gauss, puis donne l'ensemble de ses solutions.",qNeutre:"Résous ce système, puis donne l'ensemble de ses solutions.",
    corps:sys(A,b,N),texte:lignes.join(" ; "),
    champs:[{k:"choix",id:"nature",o:[["une","Une seule solution"],["zero","Aucune"],["inf","Une infinité"]]},
      {k:"cases",id:"sol",noms:N,si:{nature:"une"}},
      {k:"cases",id:"par",noms:N,si:{nature:"inf"},large:true,aide:`Une variable libre est une inconnue sans pivot : elle peut prendre n'importe quelle valeur. Écris les autres inconnues en fonction d'elle (par exemple 2 - ${N[c-1]}), et pour elle-même écris son nom (${N[c-1]} = ${N[c-1]}).`}],
    juge,etapes:E,bonne,bonneTxt,repBonne,nature:sol.nature,homog};
}

/* palier 1 : un exemple déjà rédigé, quatre cases à trouver */
function exemple2(R){let a12,a21,a22,d,x0,y0,b1,b2;
  do{a12=R.nz(-3,4);a21=R.nz(-3,4);d=R.choix([1,-1,2,-2,3]);a22=d+a21*a12;x0=R.ent(-4,5);y0=R.ent(-4,5);b1=x0+a12*y0;b2=a21*x0+a22*y0;}
  while(a22===0||Math.abs(a22)>12||(x0===0&&y0===0)||Math.abs(a21)===1&&Math.abs(a12)===1||Math.abs(b1)>20||Math.abs(b2)>30);
  const N=["x","y"],A=[[1,a12],[a21,a22]],b=[b1,b2],q2=d*y0,op=fx(ligne(2,a21,1)),eq1=`${comb(A[0],N)} = ${nb(b1)}`,k21=Math.abs(a21)===1?"":Math.abs(a21)+" × ",calcX=suite(b1||Math.abs(a12)===1?nb(b1):"",a12>0,(Math.abs(a12)===1?"":Math.abs(a12)+" × ")+par(y0));
  const pas=(plein)=>[
    {w:`Matrice augmentée du système : ${mat([[1,a12,b1],[a21,a22,b2]],true)}`,why:`Une colonne pour x, une pour y, puis les seconds membres après la barre.`},
    {w:`${op} : ${mat([[1,a12,b1],[0,plein?d:trou("p"),plein?q2:trou("q")]],true)}`,why:`Le pivot de la ligne 1 est 1. Sous lui il y a ${nb(a21)} : on ${a21>0?"retire":"ajoute"} ${nFois(a21)}la ligne 1 à la ligne 2, nombre par nombre${plein?` : ${fx(`${nb(a22)} ${a21>0?"−":"+"} ${k21}${par(a12)} = ${nb(d)}`)} et ${fx(`${nb(b2)} ${a21>0?"−":"+"} ${k21}${par(b1)} = ${nb(q2)}`)}`:""}.`},
    {w:plein?(d===1?`Ligne 2 : ${fx(`y = ${nb(y0)}`)}.`:`Ligne 2 : ${fx(`${comb([0,d],N)} = ${nb(q2)}`)}, donc ${fx(`y = ${nb(q2)} / ${par(d)} = ${nb(y0)}`)}.`):`La ligne 2 ne contient plus que y. Elle donne ${fx("y =")} ${trou("y")}`,why:`La dernière ligne n'a qu'une inconnue : on la trouve en divisant par son pivot.`},
    {w:plein?`Ligne 1 : ${fx(eq1)}, donc ${fx(`x = ${calcX} = ${nb(x0)}`)}.`:`La ligne 1, ${fx(eq1)}, donne alors ${fx("x =")} ${trou("x")}`,why:`On remonte : on remplace y par sa valeur dans la ligne du dessus.`},
    {w:plein?`<b>${fx(`S = {(${nb(x0)}, ${nb(y0)})}`)}</b>. Vérification dans l'équation 2 : ${fx(`${verifTxt(A[1],[x0,y0])} = ${nb(b2)}`)}.`:`On conclut par l'ensemble des solutions : ${fx("S = {(x, y)}")} avec tes deux valeurs.`,why:`On finit toujours par l'ensemble des solutions.`}];
  const E=pas(true);[0.5,1,1,1,0.5].forEach((p,i)=>{E[i].pts=p;});
  function juge(rep){const v={};for(const k of ["p","q","y","x"]){v[k]=nombre(rep[k]);if(!v[k])return {incomplet:"Remplis les quatre cases avec des nombres, par exemple 3, -2 ou 1/2."};}
    const faux=[];if(!egal(v.p,d))faux.push("p");if(!egal(v.q,q2))faux.push("q");if(!egal(v.y,y0))faux.push("y");if(!egal(v.x,x0))faux.push("x");
    if(!faux.length)return {ok:true};
    let diag;const suitY=!nul(v.p)&&egal(v.y,div(v.q,v.p)),suitX=egal(v.x,sub(b1,mul(a12,v.y)));
    if(faux.includes("p")||faux.includes("q"))diag={etape:1,type:"opération sur une ligne",titre:"Où ça part : l'opération sur la ligne 2.",msg:`Il fallait ${fx(`${nb(a22)} ${a21>0?"−":"+"} ${k21}${par(a12)} = ${nb(d)}`)} dans la colonne de y, et ${fx(`${nb(b2)} ${a21>0?"−":"+"} ${k21}${par(b1)} = ${nb(q2)}`)} au second membre.${suitY&&suitX?" La suite de ton calcul est cohérente avec ta ligne : une fois ces nombres corrigés, tout suit.":""}`};
    else if(faux.includes("y"))diag={etape:2,type:egal(v.y,q2)&&d!==1?"pivot oublié":"division",titre:"Où ça part : la valeur de y.",msg:`La ligne 2 dit ${fx(`${comb([0,d],N)} = ${nb(q2)}`)}${d===1?"":`, donc ${fx(`y = ${nb(q2)} / ${par(d)} = ${nb(y0)}`)}`}.${egal(v.y,q2)&&d!==1?` Tu as gardé ${nb(q2)} sans diviser par le pivot ${nb(d)}.`:""}${suitX?" Ta valeur de x est cohérente avec ce y : elle se corrige toute seule.":""}`};
    else diag={etape:3,type:egal(v.x,add(b1,mul(a12,y0)))?"signe dans la remontée":"remontée",titre:"Où ça part : la remontée, ligne 1.",msg:`${fx(eq1)} donne ${fx(`x = ${calcX} = ${nb(x0)}`)}.${egal(v.x,add(b1,mul(a12,y0)))?` Tu as trouvé ${nb(v.x)} : le terme en y a gardé son signe en changeant de côté.`:""}`};
    return {ok:false,faux,resume:`Pas tout à fait : ${faux.length} case${faux.length>1?"s":""} sur 4 ${faux.length>1?"sont fausses":"est fausse"}.`,diag};}
  return {sig:JSON.stringify([A,b]),q:"Voici un système résolu par le pivot de Gauss. Il manque quatre nombres : complète les cases.",
    corps:`${sys(A,b,N)}<ol class="wex">${pas(false).map(x=>`<li><div>${x.w}</div><div class="why">${x.why}</div></li>`).join("")}</ol>`,
    texte:`${comb(A[0],N)} = ${b1} ; ${comb(A[1],N)} = ${b2} (exemple à compléter)`,
    champs:[{k:"trous",ids:["p","q","y","x"]}],indice:false,juge,etapes:E,bonne:fx(`S = {(${nb(x0)}, ${nb(y0)})}`),bonneTxt:`cases ${d}, ${q2} ; y = ${y0}, x = ${x0}`,repBonne:{p:String(d),q:String(q2),y:String(y0),x:String(x0)},nature:"une"};
}

/* ---------- AL2 : seconds membres a, b, c, puis paramètre m ---------- */
const LET=["a","b","c"],rangM=G.outils.rang,fl=G.outils.f,propre=G.outils.propre;
/* un second membre en lettres, les termes positifs d'abord : « b − 3a » */
const lettres=(k,L)=>{const K=(L||LET).filter(x=>k[x]&&!nul(k[x])).sort((x,y)=>(q(k[y]).n>0)-(q(k[x]).n>0));return K.length?comb(K.map(x=>k[x]),K):"0";};
const vecL=(l,c,n,L)=>Object.fromEntries((L||LET).slice(0,n).map((x,i)=>[x,q(l[c+i])]));
const matL=(M,c,n,L)=>mat(M.map(l=>l.slice(0,c).concat([lettres(vecL(l,c,n,L),L)])),true);
const affLV=(e,N)=>{const L=lettres(e.k),V=comb(N.map(x=>e.k[x]||0),N);return V==="0"?L:L==="0"?V:L+(V[0]==="−"?" − "+V.slice(1):" + "+V);};
function condTxt(kc,Ln){const L=Ln.slice().reverse().find(x=>egal(abs(kc[x]),1));if(!L)return lettres(kc)+" = 0";
  const s=q(kc[L]).n,autre={};Ln.forEach(x=>{if(x!==L)autre[x]=mul(kc[x],-s);});return L+" = "+lettres(autre);}
/* l'égalité tapée, « c = 2a - b » : son vecteur sur (a, b, c) ; null si elle est illisible, false si elle ne peut pas être une condition */
function egalite(s,Ln){const p=String(s||"").toLowerCase().split("=");if(p.length!==2)return null;const g=affine(p[0],Ln),d=affine(p[1],Ln);if(!g||!d)return null;
  if(!egal(g.c,d.c))return false;const v=Ln.map(x=>sub(g.k[x]||Q(0),d.k[x]||Q(0)));return v.every(nul)?false:v;}
const prop=(u,v)=>{const i=v.findIndex(x=>!nul(x));if(i<0||nul(u[i]))return false;const r=div(u[i],v[i]);return u.every((x,j)=>egal(x,mul(r,v[j])));};

function avecLettres(A,resoudre){
  const n=A.length,c=A[0].length,N=NOMS.slice(0,c),Ln=LET.slice(0,n),B=A.map((_,i)=>Ln.map((_,j)=>i===j?1:0)),R=echelonne(A,B),E0=R.E,M0=A.map((r,i)=>r.concat(B[i])),rend=M=>matL(M,c,n);
  const iz=R.rang<n?R.rang:-1,kc=iz>=0?vecL(E0[iz],c,n):null,kv=kc?Ln.map(x=>kc[x]):null,cond=kc?condTxt(kc,Ln):null;
  const lib=N.filter((_,j)=>!R.piv.includes(j)),princ=R.piv.map(j=>N[j]);
  const E=[{w:`Matrice augmentée du système : ${rend(M0)}`,why:`${et(Ln)} sont des nombres fixés qu'on ne connaît pas : on les garde en lettres dans la colonne des seconds membres.`,pts:0.5}];
  etapesOps(E,R,N,rend,"La même opération se fait sur les lettres du second membre.");
  const iOps=E.length-1,iLect=E.length;
  if(kc)E.push({w:`La ligne ${iz+1} dit ${fx(`0 = ${lettres(kc)}`)}. <b>Le système a au moins une solution si, et seulement si, ${fx(cond)}.</b>`,why:`Une ligne « 0 = quelque chose » n'est vraie que si ce quelque chose vaut 0. Quand c'est le cas, elle devient « 0 = 0 » et les autres lignes donnent les solutions. Sinon, il n'y a aucune solution.`,pts:1.5});
  else E.push({w:`Chaque ligne a un pivot : aucune ligne ne dit « 0 = … ». <b>Le système a au moins une solution pour toutes les valeurs de ${et(Ln)}.</b>`,why:`Il ne peut y avoir une condition que si une ligne perd tous ses coefficients. Ici, ça n'arrive pas.`,pts:1});
  let S=null,ex=null;const iSol=E.length;
  if(resoudre){S=[];lib.forEach(x=>{S[N.indexOf(x)]={c:Q(0),k:{[x]:Q(1)}};});
    for(let r=R.rang-1;r>=0;r--){const j=R.piv[r],L=E0[r],e={c:Q(0),k:{}};Ln.forEach((x,i)=>{if(!nul(L[c+i]))e.k[x]=q(L[c+i]);});
      for(let t=j+1;t<c;t++){if(nul(L[t]))continue;const s=S[t];Object.keys(s.k).forEach(v=>{e.k[v]=sub(e.k[v]||Q(0),mul(L[t],s.k[v]));});}
      Object.keys(e.k).forEach(v=>{e.k[v]=div(e.k[v],L[j]);if(nul(e.k[v]))delete e.k[v];});S[j]=e;}
    ex=S.map(e=>affLV(e,N));
    const lig=r=>{const j=R.piv[r],L=E0[r],eq=`${comb(L.slice(0,c),N)} = ${lettres(vecL(L,c,n))}`;let s=lettres(vecL(L,c,n)),seul=true;if(s==="0")s="";
      for(let t=j+1;t<c;t++){if(nul(L[t]))continue;seul=false;const a=abs(L[t]);s=suite(s,q(L[t]).n>0,(egal(a,1)?"":nb(a))+N[t]);}
      s=s||"0";if(!egal(L[j],1))s=`(${s}) / ${par(L[j])}`;const fin=affLV(S[j],N);
      return seul&&egal(L[j],1)?`Ligne ${r+1} : ${fx(eq)}.`:`Ligne ${r+1} : ${fx(eq)}, donc ${fx(`${N[j]} = ${s}`)}${s===fin?"":`, c'est-à-dire ${fx(`${N[j]} = ${fin}`)}`}.`;};
    E.push({w:`${kc?`Quand ${fx(cond)} : `:""}${et(princ)} ${princ.length>1?"ont":"a"} un pivot${lib.length?`, ${et(lib)} ${lib.length>1?"sont libres":"est libre"}`:""}.<br>${R.piv.map((_,r)=>lig(R.piv.length-1-r)).join("<br>")}`,why:`${lib.length?"Une variable libre est une inconnue sans pivot : elle peut prendre n'importe quelle valeur. ":""}On remonte de la dernière ligne utile à la première, en gardant les lettres.`,pts:1.5});
    E.push({w:`<b>${kc?`Si ${fx(cond)} : `:""}${fl(`S = {(${ex.join(", ")})${lib.length?` | ${lib.join(", ")} ∈ ℝ`:""}}`)}${kc?`. Sinon : ${fx("S = ∅")}`:""}.</b>`,why:`On conclut par l'ensemble des solutions${kc?", avec les deux cas puisqu'il y a une condition":""}.`,pts:0.5});}
  /* sa dernière ligne échelonnée, « 0 0 0 c-2a+b » : coefficients nuls et bon second membre, à un multiple près */
  const cherche=kc?{L:[{q:`Écris la dernière ligne de ta matrice échelonnée : ses ${c} coefficients, puis son second membre en lettres, séparés par des espaces (par exemple ${"0 ".repeat(c)}${Ln[n-1]}-2${Ln[0]}).`,
      juge(s){const t=propre(s).split(" ");if(t.length<c+1)return null;const co=t.slice(0,c).map(nombre),e=affine(t.slice(c).join(""),Ln);if(co.some(x=>!x)||!e)return null;return co.every(nul)&&nul(e.c)&&prop(Ln.map(x=>e.k[x]||Q(0)),kv);},
      siFaux:{etape:iOps,titre:"Où ça part : les lettres pendant les opérations.",msg:`La bonne dernière ligne est ${fx(`${"0 ".repeat(c)}| ${lettres(kc)}`)}. Refais chaque opération sur la colonne des lettres : ce qu'on fait à une ligne, on le fait aussi à son second membre.`}}],
    sinon:{etape:iLect,titre:"Où ça part : l'écriture de la condition.",msg:`Ta dernière ligne est juste : elle dit ${fx(`0 = ${lettres(kc)}`)}. La condition est donc ${fx(cond)}. Vérifie les signes quand tu isoles une lettre.`}}:null;
  function juge(rep){
    if(!rep.quand)return {incomplet:"Choisis d'abord : pour toutes les valeurs, ou seulement à une condition."};
    let v=null;if(rep.quand==="cond"){v=egalite(rep.cond,Ln);if(v===null)return {incomplet:`Écris la condition comme une égalité entre ${et(Ln)}, par exemple ${Ln[n-1]} = 2${Ln[0]}.`};}
    let e=null;if(resoudre){e=N.map(x=>affine((rep.par||{})[x]));if(e.some(x=>!x))return {incomplet:`Remplis chaque case des solutions : une expression avec ${et(Ln)}${lib.length?" et les variables libres":""}, par exemple ${Ln[1]} - 2${Ln[0]}${lib.length?" + "+lib[0]:""}.`};}
    const faux=[];let resume="",diag=null,ch=null;
    const okCond=kc?rep.quand==="cond"&&!!v&&prop(v,kv):rep.quand==="tout";
    if(!okCond){
      if(kc&&rep.quand==="tout"){faux.push("quand");resume="Ce n'est pas ça : il y a une condition sur les lettres.";diag={etape:iLect,type:"0 = 0 confondu avec 0 = expression",titre:"Où ça part : la lecture de la dernière ligne.",msg:`La ligne ${iz+1} de la matrice échelonnée dit ${fx(`0 = ${lettres(kc)}`)}. Elle n'est vraie que si ${fx(cond)}. Si tu as trouvé « 0 = 0 », l'opération a été oubliée sur les lettres du second membre.`};}
      else if(!kc){faux.push("quand");resume="Ce n'est pas ça : il y a une solution pour toutes les valeurs des lettres.";diag={etape:iLect,type:"condition en trop",titre:"Où ça part : la lecture de la matrice échelonnée.",msg:`Chaque ligne garde un pivot : aucune ne devient « 0 = … ». Il n'y a donc pas de condition.`};}
      else{faux.push("cond");resume="Pas tout à fait : ce n'est pas la bonne condition.";
        const k=v?Ln.findIndex((_,i)=>!nul(kv[i])&&prop(v.map((x,j)=>j===i?mul(x,-1):x),kv)):-1;
        if(k>=0)diag={etape:iLect,type:"signe dans la condition",titre:"Où ça part : un signe dans la condition.",msg:`La dernière ligne dit ${fx(`0 = ${lettres(kc)}`)}, donc ${fx(cond)}. Dans ta condition, le signe de ${Ln[k]} est inversé.`};
        else ch=cherche;}}
    if(resoudre){
      const P=[...new Set(e.flatMap(x=>Object.keys(x.k)))].filter(x=>!Ln.includes(x));
      const res=A.map((l,i)=>{const r={c:Q(0),k:{}};l.forEach((co,j)=>{r.c=add(r.c,mul(co,e[j].c));Object.keys(e[j].k).forEach(x=>{r.k[x]=add(r.k[x]||Q(0),mul(co,e[j].k[x]));});});r.k[Ln[i]]=sub(r.k[Ln[i]]||Q(0),1);return r;});
      if(kc){const L0=Ln.slice().reverse().find(x=>!nul(kc[x]));res.forEach(r=>{const co=r.k[L0]||Q(0);Ln.forEach(x=>{if(x!==L0)r.k[x]=sub(r.k[x]||Q(0),mul(co,div(kc[x],kc[L0])));});delete r.k[L0];});}
      const dirs=P.map(x=>e.map(y=>y.k[x]||Q(0))),okSol=res.every(r=>nul(r.c)&&Object.values(r.k).every(nul))&&(lib.length?P.length>0&&rangM(dirs)===lib.length:true);
      if(!okSol){
        if(lib.every(x=>{const y=e[N.indexOf(x)];return nul(y.c)&&Object.keys(y.k).length===1&&y.k[x]&&egal(y.k[x],1);}))N.forEach((x,i)=>{const s=S[i],d=e[i];if(!nul(d.c)||new Set(Object.keys(s.k).concat(Object.keys(d.k))).size!==Object.keys(s.k).length||Object.keys(s.k).some(y=>!d.k[y]||!egal(s.k[y],d.k[y])))faux.push(x);});
        else N.forEach(x=>faux.push(x));
        resume=okCond?`La condition est juste, mais pas les solutions${faux.length<c?` : ${et(faux.filter(x=>N.includes(x)))} ${faux.length>1?"sont faux":"est faux"}`:""}.`:resume+" Les solutions ne conviennent pas non plus.";
        if(okCond)diag={etape:iSol,type:"expression d'une inconnue",titre:"Où ça part : la remontée avec les lettres.",msg:`Reprends la remontée ligne par ligne, ci-dessous : chaque inconnue qui a un pivot s'écrit avec ${et(Ln.slice(0,2))}${lib.length?" et "+et(lib):""}.`};}
      else if(okCond)return {ok:true};}
    else if(okCond)return {ok:true};
    return {ok:false,faux,resume,diag,cherche:ch};}
  const repBonne=kc?{quand:"cond",cond:cond.replace(/−/g,"-")}:{quand:"tout"},repFausse=kc?{quand:"cond",cond:Ln[n-1]+" = 7"+Ln[0]}:{quand:"cond",cond:Ln[n-1]+" = "+Ln[0]};
  if(resoudre)repFausse.par=repBonne.par=Object.fromEntries(N.map((x,i)=>[x,ex[i].replace(/−/g,"-")]));
  const champs=[{k:"choix",id:"quand",o:[["tout","Pour toutes les valeurs"],["cond","Seulement à une condition"]]},
    {k:"champ",id:"cond",nom:"condition",si:{quand:"cond"},label:"La condition :",ex:`par exemple ${Ln[n-1]} = 2${Ln[0]}`,aide:`Une égalité entre ${et(Ln)}.`}];
  if(resoudre)champs.push({k:"cases",id:"par",noms:N,large:true,aide:`Les solutions, quand il y en a : écris chaque inconnue en fonction de ${et(Ln)} et des variables libres. Une variable libre est une inconnue sans pivot, qui peut prendre n'importe quelle valeur : pour elle, écris son nom (par exemple ${N[c-1]} = ${N[c-1]}).`});
  const bonne=`${kc?`seulement si ${fx(cond)}`:`pour toutes les valeurs de ${et(Ln)}`}${resoudre?` ; alors ${fl(`S = {(${ex.join(", ")})${lib.length?` | ${lib.join(", ")} ∈ ℝ`:""}}`)}`:""}`;
  return {sig:"L"+JSON.stringify([A,resoudre?1:0]),
    q:resoudre?`Dans ce système, les inconnues sont ${et(N)}. Les lettres ${et(Ln)} sont des paramètres : des nombres réels fixés, mais qu'on ne connaît pas. À quelle condition sur ${et(Ln)} le système a-t-il au moins une solution, et quelles sont alors ses solutions ?`:`Dans ce système, les inconnues sont ${et(N)}. Les lettres ${et(Ln)} sont des nombres réels fixés, mais qu'on ne connaît pas. Pour quelles valeurs de ${et(Ln)} le système a-t-il au moins une solution ?`,
    corps:`<span class="sys">${A.map((r,i)=>`<span>$${comb(r,N)} = ${Ln[i]}$</span>`).join("")}</span>`,texte:A.map((r,i)=>comb(r,N)+" = "+Ln[i]).join(" ; "),
    champs,juge,etapes:E,bonne,bonneTxt:(kc?"seulement si "+cond:"pour toutes les valeurs")+(resoudre?" ; solutions : ("+ex.join(", ")+")":""),repBonne,repFausse,nature:kc?"cond":"tout"};
}

/* polynômes en m : la liste des coefficients, du degré 0 au plus haut */
const pz=p=>{p=p.map(q);while(p.length>1&&nul(p[p.length-1]))p.pop();return p;};
const pnul=p=>p.length===1&&nul(p[0]),pcst=p=>p.length===1;
const padd=(a,b)=>pz([...Array(Math.max(a.length,b.length))].map((_,k)=>add(a[k]||0,b[k]||0)));
const pmul=(a,b)=>{const r=[...Array(a.length+b.length-1)].map(()=>Q(0));a.forEach((x,i)=>b.forEach((y,j)=>{r[i+j]=add(r[i+j],mul(x,y));}));return pz(r);};
const psub=(a,b)=>padd(a,b.map(x=>mul(x,-1)));
const pev=(a,x)=>a.reduceRight((s,co)=>add(mul(s,x),co),Q(0));
const MONO=["","m","m²","m³","m⁴"];
function poly(p){p=pz(p);let T=[];for(let k=p.length-1;k>=0;k--){const x=q(p[k]);if(x.n)T.push([x,k]);}if(!T.length)return "0";
  if(T[0][0].n<0&&T[T.length-1][0].n>0)T.reverse();
  return T.map(([x,k],i)=>{const a=abs(x);return (i?(x.n<0?" − ":" + "):(x.n<0?"−":""))+(k&&egal(a,1)?"":nb(a))+MONO[k];}).join("");}
const mono=p=>pz(p).filter(x=>!nul(x)).length<=1;
/* « mx + y », « (m − 1)x + 2y » */
function combM(l,noms){let s="";l.forEach((p,k)=>{p=pz(p);if(pnul(p))return;
  if(mono(p)){const d=p.length-1,x=q(p[d]),a=abs(x);s+=(s?(x.n<0?" − ":" + "):(x.n<0?"−":""))+(egal(a,1)?"":nb(a))+MONO[d]+noms[k];}
  else s+=(s?" + ":"")+"("+poly(p)+")"+noms[k];});return s||"0";}
const ligneM=(i,m,j)=>{m=pz(m);if(pcst(m))return ligne(i,m[0],j);if(mono(m)){const d=m.length-1,x=q(m[d]),a=abs(x);return `L_{${i}} ← L_{${i}} ${x.n<0?"+":"−"} ${egal(a,1)?"":nb(a)}${MONO[d]}L_{${j}}`;}return `L_{${i}} ← L_{${i}} − (${poly(m)})L_{${j}}`;};
const foisM=m=>{m=pz(m);return pcst(m)?nFois(m[0]):(mono(m)?poly(m.map(abs)):"("+poly(m)+")")+" fois ";};
const retire=m=>{m=pz(m);return !mono(m)||q(m[m.length-1]).n>0;};
/* échelonnement tant qu'un pivot ne dépend pas de m ; il s'arrête sur la ligne à discuter */
function echelonneM(M0,c){const M=M0.map(l=>l.map(pz)),pas=[];let r=0;
  for(let j=0;j<c&&r<M.length;j++){let p=-1;for(let i=r;i<M.length;i++)if(pcst(M[i][j])&&!pnul(M[i][j])){p=i;break;}
    if(p<0){if(M.slice(r).every(l=>pnul(l[j])))continue;break;}
    if(p!==r){[M[r],M[p]]=[M[p],M[r]];pas.push({k:"ech",a:r,b:p,col:j,M:M.map(l=>l.slice())});}
    const ops=[];for(let i=r+1;i<M.length;i++){if(pnul(M[i][j]))continue;const v=M[i][j],m=v.map(x=>div(x,M[r][j][0]));M[i]=M[i].map((x,t)=>psub(x,pmul(m,M[r][t])));ops.push({i,m,v});}
    if(ops.length)pas.push({k:"zer",lig:r,col:j,piv:M[r][j][0],ops,M:M.map(l=>l.slice())});
    r++;}
  return {pas,E:M,r};}
const divLin=(p,k)=>{const n=p.length-1,o=new Array(n).fill(Q(0));let r=Q(0);for(let i=n;i>=1;i--){r=add(p[i],mul(r,k));o[i-1]=r;}return pz(o);};
function reduit(f){let n=pz(f.n),d=pz(f.d);if(pnul(n))return {n:[Q(0)],d:[Q(1)]};
  for(let k=-6;k<=6;k++)while(d.length>1&&n.length>1&&nul(pev(d,k))&&nul(pev(n,k))){n=divLin(n,k);d=divLin(d,k);}
  if(pcst(d)){n=n.map(x=>div(x,d[0]));d=[Q(1)];}else if(q(d[d.length-1]).n<0){n=n.map(x=>mul(x,-1));d=d.map(x=>mul(x,-1));}
  return {n,d};}
const fracTxt=f=>pcst(f.d)?poly(f.n):`${mono(f.n)?poly(f.n):"("+poly(f.n)+")"}/(${poly(f.d)})`;
function valeursM(s){s=propre(s).toLowerCase().replace(/\.$/,"");if(!s)return null;if(/^(aucune?|aucune valeur|rien|non|jamais|∅|\/)$/.test(s))return [];
  const P=s.replace(/m ?=/g," ").replace(/±\s*(\d+)/g,"-$1 ; $1").replace(/[{}]/g," ").replace(/(\d),(?=\s*[-+]?\d)/g,"$1 ; ").split(/\s*;\s*|\s+et\s+|\s+ou\s+|\s*,\s+|\s+/).filter(Boolean).map(nombre);return P.length&&P.every(Boolean)?P.filter((x,i)=>P.findIndex(y=>egal(x,y))===i):null;}

function avecM(M0,c,rac){
  const N=NOMS.slice(0,c),Mi=M0.map(l=>l.map(pz)),rend=M=>mat(M.map(l=>l.map(poly)),true),X=echelonneM(Mi,c),r=X.r,E0=X.E,jd=c-1,P=E0[r][jd],Rm=E0[r][c];
  const racs=rac.slice().sort((a,b)=>a-b),nat=k=>nul(pev(Rm,k))?"inf":"zero",Z=racs.filter(k=>nat(k)==="zero"),I=racs.filter(k=>nat(k)==="inf");
  const lead=q(P[P.length-1]),facteurs=(egal(lead,1)?"":egal(lead,-1)?"−":nb(lead))+racs.map(k=>k===0?"m":`(m ${k<0?"+ "+(-k):"− "+k})`).join("");
  const E=[{w:`Matrice augmentée du système : ${rend(Mi)}`,why:`m est un nombre fixé qu'on ne connaît pas : on le garde en lettre. Une colonne par inconnue (${N.join(", ")}), puis les seconds membres après la barre.`,pts:0.5}];
  X.pas.forEach(S=>{
    if(S.k==="ech")E.push({w:`${fx(`L_{${S.a+1}} ↔ L_{${S.b+1}}`)} : ${rend(S.M)}`,why:`On choisit un pivot qui ne dépend pas de m : la ligne ${S.b+1} a un nombre dans la colonne de ${N[S.col]}. On ne prend jamais comme pivot une expression qui peut valoir 0.`,pts:0.5});
    else E.push({w:`${et(S.ops.map(o=>fx(ligneM(o.i+1,o.m,S.lig+1))))} : ${rend(S.M)}`,why:`Le pivot de la ligne ${S.lig+1} est ${nb(S.piv)}. Il faut des zéros sous lui : ${S.ops.map(o=>`à la ligne ${o.i+1} il y a ${poly(o.v)}, donc on ${retire(o.m)?"retire":"ajoute"} ${foisM(o.m)}la ligne ${S.lig+1}`).join(" ; ")}. L'opération se fait sur toute la ligne, second membre compris.`,pts:1});});
  const iDisc=E.length;
  E.push({w:`Dans la ligne ${r+1}, le coefficient de ${N[jd]} est ${fx(poly(P))}. Il vaut 0 pour ${racs.map(k=>fx("m = "+nb(k))).join(" et pour ")}.`,why:`C'est le dernier pivot, et il dépend de m. ${racs.length>1?`On le factorise : ${fx(`${poly(P)} = ${facteurs}`)}.`:`On résout ${fx(poly(P)+" = 0")}.`} Il faut traiter à part ${racs.length>1?"ces valeurs":"cette valeur"} de m.`,pts:1});
  const val=[];val[jd]=reduit({n:Rm,d:P});
  for(let rr=r-1;rr>=0;rr--){const L=E0[rr];let acc={n:L[c],d:[Q(1)]};for(let t=rr+1;t<c;t++){if(pnul(L[t]))continue;acc={n:psub(pmul(acc.n,val[t].d),pmul(pmul(L[t],val[t].n),acc.d)),d:pmul(acc.d,val[t].d)};}
    val[rr]=reduit({n:acc.n.map(x=>div(x,L[rr][0])),d:acc.d});}
  E.push({w:`Si ${fx(racs.map(k=>"m ≠ "+nb(k)).join(" et "))} : ce pivot n'est pas nul, chaque inconnue a le sien, donc <b>une seule solution</b>. ${[...Array(c).keys()].reverse().map(j=>fx(`${N[j]} = ${fracTxt(val[j])}`)).join(", puis ")}.`,why:`On peut diviser par ${poly(P)} puisqu'il n'est pas nul, puis on remonte comme d'habitude.`,pts:1});
  racs.forEach(k=>{const v=pev(Rm,k);
    if(!nul(v))E.push({w:`Si ${fx("m = "+nb(k))} : la ligne ${r+1} devient ${fx("0 = "+nb(v))}, ce qui est impossible. <b>Aucune solution.</b>`,why:`On remplace m par ${nb(k)} dans la matrice échelonnée. Une ligne « 0 = un nombre non nul » n'est jamais vraie.`,pts:1});
    else{const so=solution({E:E0.map(l=>l.map(p=>pev(p,k))),piv:[...Array(r).keys()],rang:r,c}),ex=so.S.map(e=>aff(e,N));
      E.push({w:`Si ${fx("m = "+nb(k))} : la ligne ${r+1} devient ${fx("0 = 0")}, toujours vraie. Il reste ${r} ${r>1?"lignes":"ligne"} pour ${c} inconnues : <b>une infinité de solutions</b>, ${fl(`S = {(${ex.join(", ")}) | ${so.libres.map(j=>N[j]).join(", ")} ∈ ℝ}`)}.`,why:`On remplace m par ${nb(k)} dans la matrice échelonnée. ${N[jd]} n'a plus de pivot : c'est une variable libre, elle peut prendre n'importe quelle valeur.`,pts:1});}});
  const liste2=L=>L.length?L.map(nb).join(" et "):"aucune valeur";
  function juge(rep){const z=valeursM(rep.zero),i=valeursM(rep.inf);
    if(!z||!i)return {incomplet:"Remplis les deux cases avec des valeurs de m, par exemple 1 ; -2. S'il n'y en a pas, écris : aucune."};
    const dans=(L,k)=>L.some(x=>egal(x,k)),memes=(L,K)=>L.length===K.length&&K.every(k=>dans(L,k)),okZ=memes(z,Z),okI=memes(i,I);
    if(okZ&&okI)return {ok:true};
    const faux=[];if(!okZ)faux.push("zero");if(!okI)faux.push("inf");
    const tous=z.concat(i),manque=racs.filter(k=>!dans(tous,k)),trop=tous.filter(x=>!racs.some(k=>egal(x,k)));let resume,diag;
    if(manque.length||trop.length){resume=`Pas tout à fait : ${manque.length?`il manque ${et(manque.map(k=>"m = "+nb(k)))}`:""}${manque.length&&trop.length?", et ":""}${trop.length?`${et(trop.map(x=>"m = "+nb(x)))} n'${trop.length>1?"annulent":"annule"} pas le dernier pivot`:""}.`;
      diag={etape:iDisc,type:"valeurs de m qui annulent le pivot",titre:"Où ça part : les valeurs de m à traiter à part.",msg:`Le dernier pivot est ${fx(poly(P))}${racs.length>1?`, c'est-à-dire ${fx(facteurs)}`:""} : il vaut 0 seulement pour ${et(racs.map(k=>"m = "+nb(k)))}.`};}
    else{const k=racs.find(k=>dans(z,k)!==(nat(k)==="zero")||dans(i,k)!==(nat(k)==="inf"));resume="Pas tout à fait : ce sont les bonnes valeurs de m, mais pas dans la bonne case.";
      diag={etape:iDisc+2+racs.indexOf(k),type:"0 = 0 confondu avec 0 = nombre",titre:`Où ça part : le cas m = ${nb(k)}.`,msg:`On remplace m par ${nb(k)} dans le second membre ${fx(poly(Rm))} : la ligne ${r+1} devient ${fx("0 = "+nb(pev(Rm,k)))}. ${nat(k)==="zero"?"C'est impossible, donc aucune solution.":"C'est toujours vrai, donc une infinité de solutions."}`};}
    return {ok:false,faux,resume,diag};}
  const lignes=Mi.map(l=>combM(l.slice(0,c),N)+" = "+poly(l[c]));
  return {sig:"M"+JSON.stringify(Mi.map(l=>l.map(p=>p.map(x=>x.n)))),
    q:`Dans ce système, les inconnues sont ${et(N)}, et m est un paramètre : un nombre réel fixé, mais qu'on ne connaît pas. Selon la valeur de m, le système a une seule solution, aucune, ou une infinité. Pour quelles valeurs de m n'en a-t-il aucune ? Pour lesquelles en a-t-il une infinité ?`,
    corps:`<span class="sys">${lignes.map(l=>`<span>$${l}$</span>`).join("")}</span>`,corpsPapier:`<span class="sys">${lignes.map(l=>`<span>$${l}$</span>`).join("")}</span><p>Sur papier, résous aussi le système dans chaque cas (une seule solution, aucune, une infinité), comme au TD 2, exercice 13.</p>`,texte:lignes.join(" ; "),
    champs:[{k:"champ",id:"zero",nom:"aucune solution pour m",label:"Aucune solution quand $m =$",ex:"valeurs, ou aucune"},
      {k:"champ",id:"inf",nom:"une infinité pour m",label:"Une infinité de solutions quand $m =$",ex:"valeurs, ou aucune",aide:"Pour toutes les autres valeurs de m, le système a une seule solution. Sépare plusieurs valeurs par un point-virgule (1 ; -2). S'il n'y en a pas, écris : aucune."}],
    juge,etapes:E,bonne:`aucune solution pour ${fx("m = "+liste2(Z))} ; une infinité pour ${fx("m = "+liste2(I))} ; une seule solution pour les autres valeurs de m`.replace(/\$m = aucune valeur\$/g,"aucune valeur de m"),
    bonneTxt:`aucune solution : ${Z.length?"m = "+liste2(Z):"aucune valeur"} ; une infinité : ${I.length?"m = "+liste2(I):"aucune valeur"}`,repFausse:{zero:I.length?I.join(" ; "):"aucune",inf:Z.length?Z.join(" ; "):"aucune"},repBonne:{zero:Z.length?Z.join(" ; "):"aucune",inf:I.length?I.join(" ; "):"aucune"},nature:Z.length+"z"+I.length+"i",racines:racs};
}
function lettres2(R){for(;;){const p=R.choix([1,1,2,-1,3,-2,4,5]),a=R.nz(-7,7),k=R.choix([2,-2,3,-1,-3,4,-4,5]),A=[[p,a],R()<0.7?[k*p,k*a]:[k*p,k*a+R.nz(-4,4)]];if(petit(A,[0],24,1))return A;}}
function lettresCC(R){for(;;){const t=R.choix(["34r2","34r2","34r2","34r3","33r2"]);let A;
  if(t==="33r2")A=rang2(R,"inf")[0];else A=prod(bas(R,3,2),haut(R,3,4,t==="34r3"?R.choix([[0,1,2],[0,1,3]]):R.choix([[0,1],[0,2]]),null,2));
  if(petit(A,[0],9,1)&&new Set(A.map(r=>r.join())).size===A.length)return A;}}
function param2(R){for(;;){const f=R.choix(["carre","carre","lin","lin","prod"]),u=[R.ent(-2,3),R.ent(-1,1)],v=[R.ent(-3,3),R.ent(-2,2)];let A,B,rac,ordre=R()<0.5;
  if(f==="carre"){const k=R.choix([1,1,2,2,3]);A=[[1],[0,1],u];B=[[0,1],[k*k],v];rac=[k,-k];}
  else if(f==="prod"){A=[[1],[0,1],u];B=[[0,1],[0,1],v];rac=[0,1];}
  else{const al=R.nz(-3,3),be=R.nz(-3,3);A=[[1],[al],[R.ent(-3,4)]];B=[[be],[0,1],v];rac=[al*be];ordre=true;}
  if(pnul(pz(A[2]))&&pnul(pz(B[2])))continue;
  return {M:ordre?[A,B]:[B,A],c:2,rac};}}
function param3(R){for(;;){const deux=R()<0.7,k1=R.ent(-3,3);let k2;do k2=R.ent(-3,3);while(k2===k1);
  const rac=deux?[k1,k2]:[k1],Pm=deux?pmul([-k1,1],[-k2,1]):pz([-k1,1]),rho=R.nz(-2,2),t=R.choix(deux?["un","un","un","aucun","deux"]:["un","aucun"]);
  const Rm=t==="un"?pz([-k1*rho,rho]):t==="deux"?Pm.map(x=>mul(x,rho)):pz([R.nz(-3,3)]);
  const U=[[[1],[R.ent(-2,3)],[R.ent(-2,3)],[R.ent(-3,4)]],[[0],[1],[R.nz(-2,3)],[R.ent(-3,4)]],[[0],[0],Pm,Rm]],L=bas(R,3,2);
  const M=L.map(l=>U[0].map((_,j)=>l.reduce((s,x,k)=>padd(s,pmul([x],U[k][j])),[0])));
  if(M.every(l=>l.every(p=>pz(p).every(x=>Math.abs(q(x).n)<=12))&&l.slice(0,3).filter(p=>!pnul(pz(p))).length>=2)&&[0,1,2].every(j=>M.some(l=>!pnul(pz(l[j])))))return {M,c:3,rac};}}

/* ---------- AL4 : combinaison linéaire ou pas ; AL3 : Vect ---------- */
const COEF=["a","b","c"],XYZ=["x","y","z","t"];
const vt=v=>"("+v.map(nb).join(", ")+")";
const vl=L=>"("+L.join(", ")+")";
const colonnes=V=>V[0].map((_,i)=>V.map(v=>v[i]));
const combV=(co,V)=>V[0].map((_,i)=>co.reduce((s,x,j)=>add(s,mul(x,V[j][i])),Q(0)));
const rangV=V=>rangM(V.map(v=>v.map(q)));
const rangOrd=k=>["première","deuxième","troisième","quatrième"][k];
const vecteurs=(G,V,cible,w)=>`<p>${G.map((g,i)=>fx(`${g} = ${vt(V[i])}`)).join("<br>")}${cible?`<br>${fx(`${cible} = ${typeof w==="string"?w:vt(w)}`)}`:""}</p>`;
/* w est-il combinaison linéaire des vecteurs de V ? o : noms des vecteurs, mot « Vect », question fermée ou non */
function combinaison(V,w,o){o=o||{};
  const k=V.length,C=COEF.slice(0,k),Gn=o.gen||(k===1?["u"]:[...Array(k)].map((_,i)=>"u_{"+(i+1)+"}")),cible=o.cible||"w",A=colonnes(V),R=echelonne(A,w),sol=solution(R,C),oui=sol.nature!=="zero",{remonte}=lecteur(R,sol,C);
  const ecrit=cible+" = "+C.map((c,i)=>c+Gn[i]).join(" + "),co0=oui?sol.S.map(e=>e.c):null,M0=A.map((r,i)=>r.concat([w[i]]));
  const E=[{w:`On cherche ${k>1?"des nombres ":"un nombre "}${et(C)} tel${k>1?"s":""} que ${fx(ecrit)}. Composante par composante : ${sys(A,w,C)}`,why:`Deux vecteurs sont égaux quand leurs composantes sont égales une à une : cela donne une équation par composante. ${k>1?"Les inconnues sont":"L'inconnue est"} ${et(C)}.`,pts:1}];
  let iLect;
  if(k===1){const i0=V[0].findIndex(x=>x!==0),a0=div(w[i0],V[0][i0]),mauvaise=w.findIndex((x,i)=>!egal(mul(a0,V[0][i]),x));iLect=1;
    E.push({w:`La ${rangOrd(i0)} équation donne ${fx("a = "+nb(a0))}. ${mauvaise<0?`Les autres sont alors vraies aussi : <b>${fx(`${cible} = ${comb([a0],Gn)}`)}</b>${o.vect?`, donc ${cible} appartient à Vect(${Gn[0]})`:""}.`:`Mais la ${rangOrd(mauvaise)} donnerait ${fx(`${nb(a0)} × ${par(V[0][mauvaise])} = ${nb(mul(a0,V[0][mauvaise]))}`)}, pas ${nb(w[mauvaise])}. <b>Aucun nombre a ne convient : ${cible} n'${o.vect?`appartient pas à Vect(${Gn[0]})`:`est pas un multiple de ${Gn[0]}`}.</b>`}`,why:`Avec un seul vecteur, une équation suffit à trouver a. Il faut ensuite vérifier que ce même a marche pour toutes les composantes.`,pts:1.5});}
  else{E.push({w:`Matrice augmentée du système : ${mat(M0,true)}`,why:`Ses colonnes sont ${et(Gn.map(g=>fx(g)))}, puis ${cible} après la barre.`,pts:0.5});
    etapesOps(E,R,C,M=>mat(M,true),"L'opération se fait sur toute la ligne, second membre compris.");iLect=E.length;
    const appart=o.vect?`${cible} ${oui?"appartient":"n'appartient pas"} à ${fx(`Vect(${Gn.join(", ")})`)}`:"";
    if(!oui)E.push({w:`La ligne ${sol.lig+1} dit ${fx("0 = "+nb(R.E[sol.lig][k]))} : c'est impossible. <b>${cible} n'est pas une combinaison linéaire de ${et(Gn.map(g=>fx(g)))}${appart?" : "+appart:""}.</b>`,why:`Aucune valeur de ${et(C)} ne rend toutes les équations vraies en même temps.`,pts:1.5});
    else if(sol.nature==="une")E.push({w:`${R.piv.map((_,r)=>remonte(R.piv.length-1-r)).join("<br>")}<br><b>${fx(`${cible} = ${comb(co0,Gn)}`)}</b>${appart?", donc "+appart:""}.${o.vect?"":" C'est la seule écriture possible."} Vérification sur la première composante : ${fx(`${verifTxt(A[0],co0)} = ${nb(w[0])}`)}.`,why:`Chaque coefficient a son pivot : une seule écriture possible. On remonte de la dernière ligne à la première, puis on vérifie.`,pts:1.5});
    else{const lib=sol.libres.map(j=>C[j]);E.push({w:`${et(lib)} n'a pas de pivot : c'est une variable libre, elle peut prendre n'importe quelle valeur.<br>${R.piv.map((_,r)=>remonte(R.piv.length-1-r)).join("<br>")}<br>Tous les coefficients possibles : <b>${fl(`(${C.join(", ")}) = (${sol.S.map(e=>aff(e,C)).join(", ")})`)}</b> avec ${fx(lib.join(", ")+" ∈ ℝ")} : l'écriture n'est pas unique.<br>Par exemple, avec ${lib.map(x=>x+" = 0").join(" et ")} : <b>${fx(`${cible} = ${comb(co0,Gn)}`)}</b>${appart?", donc "+appart:""}.`,why:`Il y a une infinité d'écritures possibles, parce que ${et(Gn.map(g=>fx(g)))} sont liés entre eux. Comme au TD 3, exercice 3, on donne tous les coefficients et on dit que l'écriture n'est pas unique. À l'écran, une seule écriture suffit.`,pts:1.5});}}
  function juge(rep){
    if(!o.force&&!rep.rep)return {incomplet:"Choisis d'abord oui ou non."};
    if(!o.force&&rep.rep==="non"){if(!oui)return {ok:true};
      return {ok:false,faux:["rep"],resume:`Ce n'est pas ça : ${fx(`${cible} = ${comb(co0,Gn)}`)}.`,diag:{etape:iLect,type:"combinaison linéaire non trouvée",titre:"Où ça part : la résolution du système.",msg:`Le système a ${sol.nature==="une"?"une solution":"des solutions"}. Si tu as trouvé une ligne « 0 = un nombre non nul », il y a une erreur de calcul dans une opération : reprends-les ci-dessous.`}};}
    const v=C.map(x=>nombre((rep.co||{})[x]));if(v.some(x=>!x))return {incomplet:`Remplis ${k>1?"chaque case":"la case"} avec un nombre, par exemple 3, -2 ou 1/2.`};
    const res=combV(v,V),mal=res.map((x,i)=>egal(x,w[i])?-1:i).filter(i=>i>=0);
    if(!mal.length)return {ok:true};
    const obtenu=`avec tes nombres, ${fx(`${comb(v,Gn)} = ${vt(res)}`)} : la ${rangOrd(mal[0])} composante devrait valoir ${nb(w[mal[0]])}`;
    if(!oui)return {ok:false,faux:["rep"],resume:`Ce n'est pas ça : ${obtenu}.`,diag:{etape:iLect,type:"combinaison linéaire qui n'existe pas",titre:"Où ça part : la lecture du système.",msg:`${k===1?"Le nombre a trouvé avec une composante ne marche pas pour les autres":`La ligne ${sol.lig+1} de la matrice échelonnée dit ${fx("0 = "+nb(R.E[sol.lig][k]))}`} : aucun choix de ${et(C)} ne convient. Vérifier ses coefficients composante par composante évite cette erreur.`}};
    const faux=sol.nature==="une"?C.filter((x,i)=>!egal(v[i],co0[i])):C.slice();
    return {ok:false,faux,resume:`Pas tout à fait : ${obtenu}.`,diag:{etape:iLect,type:"coefficients d'une combinaison linéaire",titre:k===1?"Où ça part : le nombre a.":"Où ça part : la résolution du système.",msg:sol.nature==="une"?`Les bons coefficients sont ${C.map((x,i)=>`${x} = ${nb(co0[i])}`).join(", ")}${faux.length<k?` : ${et(faux)} ${faux.length>1?"sont faux":"est faux"}`:""}.`:`Reprends la remontée ci-dessous.`}};}
  const quoi=k===1?`un multiple de ${fx(Gn[0])}`:`une combinaison linéaire de ${et(Gn.map(g=>fx(g)))}`,def=k===1?`existe-t-il un nombre a tel que ${fx(ecrit)}`:`existe-t-il des nombres ${et(C)} tels que ${fx(ecrit)}`;
  const q0=o.force?`Écris le vecteur ${cible} comme combinaison linéaire de ${et(Gn.map(g=>fx(g)))} : trouve les nombres ${et(C)} tels que ${fx(ecrit)}.`
    :o.vect?`${fx(`Vect(${Gn.join(", ")})`)} est l'ensemble ${k===1?`de tous les multiples a${Gn[0]}, où a est un nombre réel`:`de toutes les combinaisons linéaires ${C.map((c,i)=>c+Gn[i]).join(" + ")}, où ${et(C)} sont des nombres réels`}. Le vecteur ${cible} appartient-il à ${fx(`Vect(${Gn.join(", ")})`)} ? Si oui, donne ${k===1?"le nombre a":"des nombres "+et(C)+" qui conviennent"}.`
    :`Le vecteur ${cible} est-il ${quoi} ? Autrement dit : ${def} ? Si oui, donne ${k===1?"ce nombre":"des nombres qui conviennent"}.`;
  const champs=(o.force?[]:[{k:"choix",id:"rep",o:[["oui","Oui"],["non","Non"]]}]).concat([{k:"cases",id:"co",noms:C,si:o.force?null:{rep:"oui"}}]);
  const bon=oui?{co:Object.fromEntries(C.map((x,i)=>[x,brut(co0[i])]))}:{};if(!o.force)bon.rep=oui?"oui":"non";
  const mauvais=oui?(o.force?{co:Object.fromEntries(C.map((x,i)=>[x,brut(add(co0[i],1))]))}:{rep:"non"}):{rep:"oui",co:Object.fromEntries(C.map(x=>[x,"1"]))};
  return {sig:"C"+JSON.stringify([V,w,o.vect?1:0]),q:q0,corps:vecteurs(Gn,V,cible,w),corpsPapier:vecteurs(Gn,V,cible,w)+(k>1&&!o.force&&!o.vect?"<p>Sur papier, comme au TD 3, exercice 3 : donne tous les coefficients possibles et dis si l'écriture est unique.</p>":""),texte:Gn.map((g,i)=>g.replace(/[_{}]/g,"")+" = "+vt(V[i])).join(", ")+" ; "+cible+" = "+vt(w)+(o.vect?" ; appartient à Vect ?":" ; combinaison linéaire ?"),
    champs,juge,etapes:E,bonne:oui?`${o.force?"":"oui, "}${fx(`${cible} = ${comb(co0,Gn)}`)}`:"non",bonneTxt:oui?`${o.force?"":"oui : "}${cible} = ${comb(co0,Gn.map(g=>g.replace(/[_{}]/g,"")))}`:"non",repBonne:bon,repFausse:mauvais,nature:oui?sol.nature:"non"};
}
/* pour quelle valeur de t le vecteur w, dont une composante vaut t, est-il combinaison linéaire de u₁ et u₂ ? */
function combinaisonT(V,w,it){const k=V.length,C=COEF.slice(0,k),Gn=[...Array(k)].map((_,i)=>"u_{"+(i+1)+"}"),A=colonnes(V),n=w.length;
  const B=w.map((x,i)=>i===it?[0,1]:[x,0]),R=echelonne(A,B),rhs=l=>aff({c:l[k],k:{t:l[k+1]}},["t"]),rend=M=>mat(M.map(l=>l.slice(0,k).concat([rhs(l)])),true);
  const L=R.E[R.rang],t0=div(mul(L[k],-1),L[k+1]),wT=w.map((x,i)=>i===it?"t":nb(x)),w0=w.map((x,i)=>i===it?t0:x),sol=solution(echelonne(A,w0),C),co0=sol.S.map(e=>e.c);
  const ecrit="w = "+C.map((c,i)=>c+Gn[i]).join(" + ");
  const E=[{w:`On cherche ${et(C)} tels que ${fx(ecrit)}. Composante par composante : <span class="sys">${A.map((r,i)=>`<span>$${comb(r,C)} = ${wT[i]}$</span>`).join("")}</span>`,why:`Une équation par composante. Les inconnues sont ${et(C)} ; t reste en lettre dans le second membre.`,pts:1},
    {w:`Matrice augmentée du système : ${rend(A.map((r,i)=>r.concat(B[i])))}`,why:`Ses colonnes sont ${et(Gn.map(g=>fx(g)))}, puis w après la barre.`,pts:0.5}];
  etapesOps(E,R,C,rend,"La même opération se fait sur le second membre, t compris.");const iLect=E.length;
  E.push({w:`La ligne ${R.rang+1} dit ${fx("0 = "+rhs(L))}. Le système a une solution seulement si <b>${fx("t = "+nb(t0))}</b>.`,why:`Une ligne « 0 = quelque chose » n'est vraie que si ce quelque chose vaut 0.`,pts:1.5});
  E.push({w:`Pour ${fx("t = "+nb(t0))}, on trouve ${C.map((x,i)=>fx(`${x} = ${nb(co0[i])}`)).join(" et ")} : ${fx(`w = ${comb(co0,Gn)}`)}.`,why:`On remplace t par sa valeur et on remonte, pour vérifier que w s'écrit bien avec ${et(Gn.map(g=>fx(g)))}.`,pts:0.5});
  function juge(rep){const v=nombre((rep.val||{}).t);if(!v)return {incomplet:"Écris la valeur de t : un nombre, par exemple 3, -2 ou 1/2."};
    if(egal(v,t0))return {ok:true};
    return {ok:false,faux:["t"],resume:`Pas tout à fait : pour t = ${nb(v)}, le vecteur w n'est pas une combinaison linéaire de ${et(Gn.map(g=>fx(g)))}.`,diag:{etape:iLect,type:egal(v,mul(t0,-1))?"signe en isolant t":"valeur du paramètre t",titre:"Où ça part : la dernière ligne du système.",msg:`Elle dit ${fx("0 = "+rhs(L))}, donc ${fx("t = "+nb(t0))}.${egal(v,mul(t0,-1))?" Tu as le bon nombre avec le mauvais signe : attention en faisant passer un terme de l'autre côté.":""}`}};}
  return {sig:"T"+JSON.stringify([V,w,it]),q:`Le vecteur w dépend d'un nombre t. Pour quelle valeur de t est-il une combinaison linéaire de ${et(Gn.map(g=>fx(g)))}, c'est-à-dire ${fx(ecrit)} pour certains nombres ${et(C)} ?`,
    corps:vecteurs(Gn,V,"w","("+wT.join(", ")+")"),texte:Gn.map((g,i)=>g.replace(/[_{}]/g,"")+" = "+vt(V[i])).join(", ")+" ; w = ("+wT.join(", ")+") ; pour quel t ?",
    champs:[{k:"cases",id:"val",noms:["t"]}],juge,etapes:E,bonne:fx("t = "+nb(t0)),bonneTxt:"t = "+brut(t0),repBonne:{val:{t:brut(t0)}},repFausse:{val:{t:brut(add(t0,1))}},nature:"t"};
}
/* quels vecteurs peut-on enlever sans changer le sous-espace engendré ? */
function enlever(V){const k=V.length,Gn=["u","v","w"].slice(0,k),C=COEF.slice(0,k),A=colonnes(V),zeros=V[0].map(()=>0),R=echelonne(A,zeros),sol=solution(R,C),r=rangV(V);
  const ote=Gn.filter((_,i)=>rangV(V.filter((_,j)=>j!==i))===r),garde=Gn.filter(g=>!ote.includes(g));
  const E=[{w:`On cherche une relation ${fx(C.map((c,i)=>c+Gn[i]).join(" + ")+" = 0")} avec des nombres ${et(C)} qui ne sont pas tous nuls : <span class="sys">${A.map(l=>`<span>$${comb(l,C)} = 0$</span>`).join("")}</span>`,why:`Un vecteur peut être enlevé quand il est combinaison linéaire des autres : tout ce qu'on fabriquait avec lui se fabrique alors sans lui. Une telle relation, c'est exactement ça.`,pts:1},
    {w:`Matrice augmentée du système : ${mat(A.map(l=>l.concat([0])),true)}`,why:`Ses colonnes sont ${et(Gn)}, et les seconds membres valent tous 0.`,pts:0.5}];
  etapesOps(E,R,C,M=>mat(M,true),"Les seconds membres restent nuls.");const iLect=E.length;
  if(sol.nature==="une")E.push({w:`Chaque inconnue a son pivot : la seule solution est ${fx(C.join(" = ")+" = 0")}. <b>Aucun vecteur n'est combinaison linéaire des autres : on ne peut en enlever aucun.</b>`,why:`Il n'existe pas de relation entre ${et(Gn)} : chacun apporte une direction que les autres n'ont pas.`,pts:1.5});
  else{const lib=C[sol.libres[0]],rel=sol.S.map(e=>add(e.c,e.k[lib]||Q(0))),d=rel.reduce((m,x)=>m*q(x).d/((a,b)=>{while(b){[a,b]=[b,a%b];}return a;})(m,q(x).d),1),ent=rel.map(x=>mul(x,d));
    const expr=i=>{const autres=Gn.map((g,j)=>j===i?0:div(mul(ent[j],-1),ent[i]));return `${Gn[i]} = ${comb(autres,Gn)}`;};
    E.push({w:`${lib} n'a pas de pivot : c'est une variable libre.<br>${R.piv.map((_,r)=>lecteur(R,sol,C).remonte(R.piv.length-1-r)).join("<br>")}<br>Avec ${fx(lib+" = "+nb(d))}, on trouve la relation <b>${fx(comb(ent,Gn)+" = 0")}</b>.`,why:`Une variable libre donne des solutions non nulles : il y a donc bien une relation entre les vecteurs.`,pts:1});
    E.push({w:`${ote.map(g=>fx(expr(Gn.indexOf(g)))).join(" ; ")}. <b>On peut enlever ${ote.join(", ou ")}${ote.length>1?" (un seul à la fois)":""}.</b>${garde.length?` ${et(garde)} n'apparaît pas dans la relation : on ne peut pas l'enlever.`:""}`,why:`Chaque vecteur qui a un coefficient non nul dans la relation s'écrit avec les autres : c'est lui qu'on peut enlever. Après en avoir enlevé un, les vecteurs qui restent n'ont plus de relation entre eux.`,pts:1});}
  function juge(rep){const S=rep.ens||[];if(!S.length)return {incomplet:"Coche au moins une case : un ou plusieurs vecteurs, ou « Aucun »."};
    const choisi=S.filter(x=>x!=="0"),trop=choisi.filter(g=>!ote.includes(g)),manque=ote.filter(g=>!choisi.includes(g));
    if(!trop.length&&!manque.length)return {ok:true};
    const iDer=E.length-1;
    return {ok:false,faux:["ens"],resume:`Pas tout à fait : ${trop.length?`on ne peut pas enlever ${et(trop)}`:""}${trop.length&&manque.length?", et ":""}${manque.length?`on peut aussi enlever ${et(manque)}`:""}.`,
      diag:{etape:iDer,type:trop.length?"vecteur enlevé à tort":"vecteur qu'on pouvait enlever",titre:"Où ça part : ce que dit la relation entre les vecteurs.",msg:sol.nature==="une"?`Il n'y a aucune relation entre ${et(Gn)} : aucun n'est combinaison linéaire des autres.`:`On peut enlever un vecteur seulement s'il a un coefficient non nul dans la relation : ${ote.length?et(ote):"aucun"}.`}};}
  return {sig:"E"+JSON.stringify(V),q:`Le sous-espace engendré ${fx(`Vect(${Gn.join(", ")})`)} est l'ensemble de toutes les combinaisons linéaires ${C.map((c,i)=>c+Gn[i]).join(" + ")}, où ${et(C)} sont des nombres réels. Quels vecteurs peut-on enlever, un seul à la fois, sans changer ce sous-espace ? Coche chacun d'eux, ou « Aucun ».`,
    corps:vecteurs(Gn,V),texte:Gn.map((g,i)=>g+" = "+vt(V[i])).join(", ")+" ; quels vecteurs enlever ?",
    champs:[{k:"multi",id:"ens",o:Gn.map(g=>[g,g]).concat([["0","Aucun"]]),seul:"0"}],juge,etapes:E,bonne:ote.length?ote.join(", ou "):"aucun",bonneTxt:ote.length?ote.join(" ou "):"aucun",
    repBonne:{ens:ote.length?ote:["0"]},repFausse:{ens:ote.length?["0"]:[Gn[0]]},nature:ote.length+"/"+k};
}
/* décrire Vect(V) par des équations en x, y, z (t) */
function equations(V){const k=V.length,n=V[0].length,Gn=k===1?["u"]:["u","v"],C=COEF.slice(0,k),X=XYZ.slice(0,n),A=colonnes(V),B=X.map((_,i)=>X.map((_,j)=>i===j?1:0)),R=echelonne(A,B),rend=M=>matL(M,k,n,X);
  const eqs=[];for(let i=R.rang;i<n;i++){let v=X.map((_,j)=>q(R.E[i][k+j]));if(v.find(x=>!nul(x)).n<0)v=v.map(x=>mul(x,-1));eqs.push(v);}
  const txt=v=>comb(v,X)+" = 0",ne=eqs.length;
  const E=[{w:`Un vecteur ${fx(vl(X))} est dans ${fx(`Vect(${Gn.join(", ")})`)} quand il existe ${et(C)} avec ${fx(`${vl(X)} = ${C.map((c,i)=>c+Gn[i]).join(" + ")}`)} : <span class="sys">${A.map((l,i)=>`<span>$${comb(l,C)} = ${X[i]}$</span>`).join("")}</span>`,why:`C'est la définition de Vect. On obtient un système dont les inconnues sont ${et(C)}, et dont les seconds membres sont les lettres ${et(X)}.`,pts:1},
    {w:`Matrice augmentée du système : ${rend(A.map((l,i)=>l.concat(B[i])))}`,why:`Ses colonnes sont ${et(Gn)}, puis ${et(X)} en lettres après la barre.`,pts:0.5}];
  etapesOps(E,R,C,rend,"La même opération se fait sur les lettres du second membre.");const iLect=E.length;
  E.push({w:`${ne>1?`Les lignes ${et([...Array(ne)].map((_,i)=>String(R.rang+1+i)))} disent`:`La ligne ${R.rang+1} dit`} ${eqs.map((v,i)=>fx("0 = "+lettres(vecL(R.E[R.rang+i],k,n,X),X))).join(" et ")}. <b>${fl(`Vect(${Gn.join(", ")}) = {${vl(X)} ∈ ℝ${["","","²","³","⁴"][n]} | ${eqs.map(txt).join(" et ")}}`)}</b>`,why:`Le système a une solution exactement quand ${ne>1?"ces seconds membres valent":"ce second membre vaut"} 0 : ${ne>1?"ce sont les équations":"c'est l'équation"} du sous-espace.`,pts:1.5});
  E.push({w:`Vérification : ${Gn.map((g,j)=>`pour ${g}, ${fx(`${verifTxt(eqs[0],V[j])} = 0`)}`).join(" ; ")}.`,why:`Chaque vecteur qui engendre le sous-espace doit vérifier ${ne>1?"les équations":"l'équation"} : c'est rapide à contrôler.`,pts:0.5});
  function juge(rep){const T=eqs.map((_,i)=>egalite((rep["e"+(i+1)]||""),X));
    if(T.some(v=>v===null))return {incomplet:`Écris ${ne>1?"chaque équation":"l'équation"} comme une égalité entre ${et(X)}, par exemple ${X[0]} + 2${X[1]} - ${X[n-1]} = 0.`};
    const faux=[];let msg="";
    T.forEach((v,i)=>{if(v===false){faux.push("e"+(i+1));msg=msg||`L'équation ${ne>1?i+1+" ":""}doit être une égalité entre ${et(X)} sans nombre seul (un sous-espace vectoriel contient le vecteur nul).`;return;}
      const j=V.findIndex(u=>!nul(v.reduce((s,co,t)=>add(s,mul(co,u[t])),Q(0))));
      if(j>=0){faux.push("e"+(i+1));msg=msg||`Ton équation ${ne>1?i+1+" ":""}n'est pas vérifiée par ${fx(`${Gn[j]} = ${vt(V[j])}`)} : elle donne ${fx(`${verifTxt(v,V[j])} = ${nb(v.reduce((s,co,t)=>add(s,mul(co,V[j][t])),Q(0)))}`)}, pas 0.`;}});
    if(!faux.length&&rangM(T)===ne)return {ok:true};
    if(!faux.length){faux.push("e2");msg="Tes deux équations disent la même chose (l'une est un multiple de l'autre) : il en faut deux vraiment différentes.";}
    return {ok:false,faux,resume:"Pas tout à fait : "+msg.charAt(0).toLowerCase()+msg.slice(1),diag:{etape:iLect,type:"équation d'un sous-espace engendré",titre:"Où ça part : les lettres dans la colonne des seconds membres.",msg:`${ne>1?"Les bonnes équations sont":"La bonne équation est"} ${eqs.map(v=>fx(txt(v))).join(" et ")} (ou des multiples). Reprends les opérations sur les lettres, ci-dessous.`}};}
  const champs=eqs.map((_,i)=>({k:"champ",id:"e"+(i+1),nom:"équation "+(i+1),label:ne>1?`Équation ${i+1} :`:"L'équation :",ex:`par exemple ${X[0]} + 2${X[1]} - ${X[n-1]} = 0`}));
  return {sig:"Q"+JSON.stringify(V),q:`${fx(`Vect(${Gn.join(", ")})`)} est l'ensemble ${k===1?"de tous les multiples au, où a est un nombre réel":`de toutes les combinaisons linéaires ${C.map((c,i)=>c+Gn[i]).join(" + ")}, où ${et(C)} sont des nombres réels`}. Décris ce sous-espace de ℝ${["","","²","³","⁴"][n]} par ${ne>1?ne+" équations":"une équation"} : ${ne>1?"des égalités":"une égalité"} entre ${et(X)}, ${ne>1?"vraies":"vraie"} exactement pour les vecteurs ${vl(X)} du sous-espace.`,
    corps:vecteurs(Gn,V),texte:Gn.map((g,i)=>g+" = "+vt(V[i])).join(", ")+" ; équations de Vect("+Gn.join(", ")+")",
    champs,juge,etapes:E,bonne:eqs.map(v=>fx(txt(v))).join(" et "),bonneTxt:eqs.map(txt).join(" et "),repBonne:Object.fromEntries(eqs.map((v,i)=>["e"+(i+1),txt(v).replace(/−/g,"-")])),repFausse:Object.fromEntries(eqs.map((v,i)=>["e"+(i+1),X[0]+" + "+X[1]+" = 0"])),nature:ne+"eq"};
}
/* tirages : vecteurs à petites composantes entières */
const vAlea=(R,n,m)=>{for(;;){const v=[...Array(n)].map(()=>R.ent(-m,m));if(v.filter(x=>x!==0).length>=Math.min(2,n))return v;}};
const libres=V=>rangV(V)===V.length;
/* des vecteurs libres dont l'échelonnement tombe juste : les colonnes d'une matrice (triangulaire à diagonale 1) × (échelonnée à pivots 1) */
function tireLibres(R,n,k,m){for(;;){const V=colonnes(prod(bas(R,n,m),haut(R,n,k,[...Array(k).keys()],null,m)));if(V.every(v=>v.every(x=>Math.abs(x)<=9)&&v.filter(x=>x!==0).length>=Math.min(2,n)))return V;}}
function tireCombi(R,n,k,oui,m){for(;;){const V=tireLibres(R,n,k,m),co=[...Array(k)].map(()=>R.nz(-3,3)),w=combV(co,V).map(x=>x.n);
  if(!oui){if(n===k)continue;w[R.ent(k,n-1)]+=R.nz(-2,2);}
  if(w.every(x=>Math.abs(x)<=14)&&w.some(x=>x!==0))return [V,w];}}
function tireLies(R){for(;;){const V=tireLibres(R,3,2,2),u3=combV([R.nz(-2,2),R.nz(-2,2)],V).map(x=>x.n),w=combV([R.nz(-3,3),R.nz(-3,3)],V).map(x=>x.n);
  if(u3.concat(w).every(x=>Math.abs(x)<=12)&&u3.filter(x=>x!==0).length>=2&&w.some(x=>x!==0))return [V.concat([u3]),w];}}
function tireEnlever(R){for(;;){const t=R.choix(["col2","lib2","somme","somme","mult","lib3","lib3"]);let V;
  if(t==="col2"){const u=[R.choix([1,-1]),R.nz(-4,4)],l=R.choix([2,-2,3,-1,-3,4]);V=[u,u.map(x=>x*l)];}
  else if(t==="lib2")V=tireLibres(R,2,2,4);
  else{const B=tireLibres(R,3,t==="lib3"?3:2,2);
    if(t==="somme"){const a=R.nz(-2,2),b=R.nz(-2,2);V=B.concat([combV([a,b],B).map(x=>x.n)]);}
    else if(t==="mult"){const l=R.choix([2,-1,3,-2]),w=B[0].map(x=>x*l);V=R()<0.5?[B[0],B[1],w]:[B[0],w,B[1]];}
    else V=B;}
  if(V.every(v=>v.every(x=>Math.abs(x)<=9)&&v.some(x=>x!==0))&&new Set(V.map(v=>v.join())).size===V.length)return V;}}

/* ---------- AL6 : changer de repère ; AL7 : calculer dans ℝⁿ ---------- */
const ve=s=>`<span class="vec">${s}</span>`,PR=["x′","y′"],XY=["x","y"],IJ=["i","j"];
const cvec=(co,noms)=>comb(co,noms.map(ve));
const rep2=(o,a,b)=>`(${o} ; ${ve(a)}, ${ve(b)})`;
const colU=P=>[P[0][0],P[1][0]],colV=P=>[P[0][1],P[1][1]];
const poseUV=P=>`${ve("u")} = ${cvec(colU(P),IJ)} et ${ve("v")} = ${cvec(colV(P),IJ)}`;
const casesXY=(id,noms,titre)=>({k:"cases",id,noms,titre});
const lisXY=(o,noms)=>noms.map(x=>nombre((o||{})[x]));
const INC="Remplis chaque case avec un nombre, par exemple 3, -2 ou 1/2.";
const fauxTxt=(F)=>`Pas tout à fait : ${et(F)} ${F.length>1?"sont faux":"est faux"}.`;
/* du repère (O ; u, v) vers (O ; i, j) : il suffit de remplacer */
function repAncien(P,xp){const x=fois(P,xp),melange=fois([colU(P),colV(P)],xp);
  const E=[{w:`${ve("OM")} = ${cvec(xp,["u","v"])}`,why:`C'est la définition : dire que les coordonnées de M dans le repère ${rep2("O","u","v")} sont (x′, y′), c'est dire que ${ve("OM")} = x′${ve("u")} + y′${ve("v")}.`,pts:0.5},
    {w:`Devant ${ve("i")} : ${fx(`${verifTxt(P[0],xp)} = ${nb(x[0])}`)}.<br>Devant ${ve("j")} : ${fx(`${verifTxt(P[1],xp)} = ${nb(x[1])}`)}.`,why:`On remplace ${ve("u")} par ${cvec(colU(P),IJ)} et ${ve("v")} par ${cvec(colV(P),IJ)}, puis on regroupe ce qui est devant ${ve("i")} et ce qui est devant ${ve("j")}.`,pts:1.5},
    {w:`<b>Les coordonnées de M dans le repère ${rep2("O","i","j")} sont ${fx(vt(x))}.</b>`,why:`${ve("OM")} = ${cvec(x,IJ)} : les coordonnées sont les nombres devant ${ve("i")} et devant ${ve("j")}.`,pts:0.5}];
  function juge(rep){const v=lisXY(rep.c,XY);if(v.some(z=>!z))return {incomplet:INC};const F=XY.filter((_,i)=>!egal(v[i],x[i]));if(!F.length)return {ok:true};
    const m=egal(v[0],melange[0])&&egal(v[1],melange[1]);
    return {ok:false,faux:F,resume:fauxTxt(F),diag:{etape:1,type:m?"coefficients de u et de v mélangés":"regroupement devant i et j",titre:"Où ça part : le regroupement.",msg:m?`Tu as pris pour x les deux coefficients de ${ve("u")}. Il faut prendre, dans ${ve("u")} et dans ${ve("v")}, ce qui est devant ${ve("i")} : ${fx(`${verifTxt(P[0],xp)} = ${nb(x[0])}`)}.`:`Devant ${ve("i")} : ${fx(`${verifTxt(P[0],xp)} = ${nb(x[0])}`)}. Devant ${ve("j")} : ${fx(`${verifTxt(P[1],xp)} = ${nb(x[1])}`)}.`}};}
  return {sig:"RA"+JSON.stringify([P,xp]),q:`Dans le plan muni du repère ${rep2("O","i","j")}, on pose ${poseUV(P)}. Dans le repère ${rep2("O","u","v")}, les coordonnées du point M sont ${fx(vt(xp))}. Quelles sont ses coordonnées (x, y) dans le repère ${rep2("O","i","j")} ?`,corps:"",
    texte:`u = ${vt(colU(P))}, v = ${vt(colV(P))} dans (O ; i, j) ; M = ${vt(xp)} dans (O ; u, v) ; coordonnées dans (O ; i, j) ?`,champs:[casesXY("c",XY)],juge,etapes:E,bonne:fx(vt(x)),bonneTxt:vt(x),
    repBonne:{c:{x:String(x[0]),y:String(x[1])}},repFausse:{c:{x:String(melange[0]+(melange[0]===x[0]?1:0)),y:String(melange[1])}},nature:"ancien"};}
/* nouvelle origine, mêmes vecteurs */
function repOrigine(O2,m,vers){const r=vers?[m[0]-O2[0],m[1]-O2[1]]:[m[0]+O2[0],m[1]+O2[1]],inv=vers?[m[0]+O2[0],m[1]+O2[1]]:[m[0]-O2[0],m[1]-O2[1]],N=vers?PR:XY;
  const E=[{w:`${ve("OM")} = ${ve("OO′")} + ${ve("O′M")}${vers?`, donc ${ve("O′M")} = ${ve("OM")} − ${ve("OO′")}`:""}`,why:`C'est la relation de Chasles : pour aller de O à M, on peut passer par O′. Les coordonnées de M dans R′ sont celles du vecteur ${ve("O′M")}, celles dans R sont celles de ${ve("OM")}.`,pts:1},
    {w:`${fx(`${N[0]} = ${nb(m[0])} ${vers?"−":"+"} ${par(O2[0])} = ${nb(r[0])}`)} et ${fx(`${N[1]} = ${nb(m[1])} ${vers?"−":"+"} ${par(O2[1])} = ${nb(r[1])}`)}`,why:`Les vecteurs du repère ne changent pas : on ${vers?"retire":"ajoute"} seulement les coordonnées de O′, une par une.`,pts:1},
    {w:`<b>Les coordonnées de M dans le repère ${vers?"R′":"R"} sont ${fx(vt(r))}.</b>`,why:`On répond par une phrase qui dit dans quel repère on se place.`,pts:0.5}];
  function juge(rep){const v=lisXY(rep.c,N);if(v.some(z=>!z))return {incomplet:INC};const F=N.filter((_,i)=>!egal(v[i],r[i]));if(!F.length)return {ok:true};
    const s=egal(v[0],inv[0])&&egal(v[1],inv[1]);
    return {ok:false,faux:F,resume:fauxTxt(F),diag:{etape:s?0:1,type:s?"origine ajoutée au lieu d'être retirée (ou l'inverse)":"calcul des coordonnées",titre:s?"Où ça part : le sens de la relation.":"Où ça part : le calcul.",msg:s?`${ve("OM")} = ${ve("OO′")} + ${ve("O′M")}. Ici on cherche ${vers?`${ve("O′M")} : il faut retirer`:`${ve("OM")} : il faut ajouter`} les coordonnées de O′.`:`${fx(`${N[0]} = ${nb(r[0])}`)} et ${fx(`${N[1]} = ${nb(r[1])}`)}.`}};}
  return {sig:"RO"+JSON.stringify([O2,m,vers]),q:`Le plan est muni du repère R = ${rep2("O","i","j")}. Les coordonnées du point O′ dans R sont ${fx(vt(O2))}. On prend un nouveau repère R′ = ${rep2("O′","i","j")} : mêmes vecteurs, nouvelle origine. Les coordonnées du point M dans ${vers?"R":"R′"} sont ${fx(vt(m))}. Quelles sont ses coordonnées ${vers?"(x′, y′) dans R′":"(x, y) dans R"} ?`,corps:"",
    texte:`O′ = ${vt(O2)} dans R ; R′ = (O′ ; i, j) ; M = ${vt(m)} dans ${vers?"R":"R′"} ; coordonnées dans ${vers?"R′":"R"} ?`,champs:[casesXY("c",N)],juge,etapes:E,bonne:fx(vt(r)),bonneTxt:vt(r),
    repBonne:{c:{[N[0]]:String(r[0]),[N[1]]:String(r[1])}},repFausse:{c:{[N[0]]:String(inv[0]),[N[1]]:String(inv[1])}},nature:vers?"vers":"depuis"};}
/* de (O ; i, j) vers le nouveau repère : un système 2 × 2 (avec, ou non, une nouvelle origine et un point dans l'autre sens) */
function repNouveau(P,O2,xp,nB){const deux=!!nB,mA=fois(P,xp).map((z,i)=>z+O2[i]),sec=[mA[0]-O2[0],mA[1]-O2[1]],R=echelonne(P,sec),sol=solution(R,PR),{remonte}=lecteur(R,sol,PR),mB=deux?fois(P,nB).map((z,i)=>z+O2[i]):null,orig=O2[0]||O2[1],direct=fois(P,mA);
  const Rp=orig?"R′":rep2("O","u","v"),E=[];
  if(orig)E.push({w:`Pour tout point M : ${ve("OM")} = ${ve("OO′")} + x′${ve("u")} + y′${ve("v")}, donc ${fx(`x = ${comb([O2[0]?1:0].concat(P[0]),[nb(O2[0])].concat(PR)).replace(/^1(?=[^0-9])/,"")}`)} et ${fx(`y = ${comb([O2[1]?1:0].concat(P[1]),[nb(O2[1])].concat(PR))}`)}.`,why:`On passe par O′ (relation de Chasles), puis on écrit ${ve("O′M")} = x′${ve("u")} + y′${ve("v")} et on remplace ${ve("u")} et ${ve("v")} par leur écriture avec ${ve("i")} et ${ve("j")}.`,pts:1});
  if(deux)E.push({w:`Pour B, on remplace x′ et y′ par ${nb(nB[0])} et ${nb(nB[1])} : ${fx(`x = ${O2[0]?nb(O2[0])+" + ":""}${verifTxt(P[0],nB).replace(/^−/,"(−").replace(/^\(−(\d+)/,"(−$1)")} = ${nb(mB[0])}`)} et ${fx(`y = ${O2[1]?nb(O2[1])+" + ":""}${verifTxt(P[1],nB).replace(/^−(\d+)/,"(−$1)")} = ${nb(mB[1])}`)}. <b>Les coordonnées de B dans R sont ${fx(vt(mB))}.</b>`,why:`Dans ce sens, il n'y a qu'à remplacer.`,pts:1});
  E.push({w:`${deux?"Pour A, on":"On"} cherche x′ et y′ : <span class="sys"><span>$${comb(P[0],PR)} = ${nb(sec[0])}$</span><span>$${comb(P[1],PR)} = ${nb(sec[1])}$</span></span>`,why:orig?`On remplace x et y par les coordonnées de ${deux?"A":"M"}, et on fait passer les coordonnées de O′ de l'autre côté : ${fx(`${nb(mA[0])} − ${par(O2[0])} = ${nb(sec[0])}`)} et ${fx(`${nb(mA[1])} − ${par(O2[1])} = ${nb(sec[1])}`)}.`:`${ve("OM")} = x′${ve("u")} + y′${ve("v")} : ce qui est devant ${ve("i")} doit valoir ${nb(mA[0])}, ce qui est devant ${ve("j")} doit valoir ${nb(mA[1])}. Les inconnues sont x′ et y′.`,pts:1});
  const iSys=E.length-1;etapesOps(E,R,PR,M=>mat(M,true),"L'opération se fait sur toute la ligne, second membre compris.");
  E.push({w:`${R.piv.map((_,r)=>remonte(R.piv.length-1-r)).join("<br>")}<br><b>Les coordonnées de ${deux?"A":"M"} dans ${Rp} sont ${fx(vt(xp))}.</b>`,why:`On remonte de la dernière ligne à la première. Vérification : ${cvec(xp,["u","v"])} donne bien ${fx(`${verifTxt(P[0],xp)} = ${nb(sec[0])}`)} devant ${ve("i")}.`,pts:1.5});
  function juge(rep){const a=lisXY(rep.A,PR),b=deux?lisXY(rep.B,XY):[];if(a.concat(b).some(z=>!z))return {incomplet:INC};
    const F=PR.filter((_,i)=>!egal(a[i],xp[i])).concat(deux?XY.filter((_,i)=>!egal(b[i],mB[i])):[]);if(!F.length)return {ok:true};
    const fa=F.filter(z=>PR.includes(z)),sens=egal(a[0],direct[0])&&egal(a[1],direct[1]);
    return {ok:false,faux:F,resume:fauxTxt(F),diag:fa.length?{etape:sens?iSys:E.length-1,type:sens?"changement de repère dans le mauvais sens":"résolution du système du changement de repère",titre:sens?"Où ça part : le sens du calcul.":"Où ça part : le système en x′ et y′.",msg:sens?`Tu as remplacé x′ et y′ par les coordonnées de ${deux?"A":"M"}, mais ce sont ses coordonnées x et y qu'on connaît : x′ et y′ sont les inconnues du système.`:`Le système donne ${fx(`x′ = ${nb(xp[0])}`)} et ${fx(`y′ = ${nb(xp[1])}`)}. Reprends les opérations ci-dessous.`}:{etape:1,type:"remplacement dans les formules du changement de repère",titre:"Où ça part : le point B.",msg:`Pour B il suffit de remplacer : ${fx(`x = ${nb(mB[0])}`)} et ${fx(`y = ${nb(mB[1])}`)}.`}};}
  const debut=orig?`Le plan est muni du repère R = ${rep2("O","i","j")}. On pose ${poseUV(P)}, et O′ est le point de coordonnées ${fx(vt(O2))} dans R. On note R′ = ${rep2("O′","u","v")}.`:`Dans le plan muni du repère ${rep2("O","i","j")}, on pose ${poseUV(P)}.`;
  return {sig:"RN"+JSON.stringify([P,O2,xp,nB||0]),q:deux?`${debut} Les coordonnées du point A dans R sont ${fx(vt(mA))} : quelles sont ses coordonnées dans R′ ? Les coordonnées du point B dans R′ sont ${fx(vt(nB))} : quelles sont ses coordonnées dans R ?`:`${debut} Les coordonnées du point M dans le repère ${orig?"R":rep2("O","i","j")} sont ${fx(vt(mA))}. Quelles sont ses coordonnées (x′, y′) dans le repère ${Rp} ?`,corps:"",
    texte:`u = ${vt(colU(P))}, v = ${vt(colV(P))}${orig?`, O′ = ${vt(O2)}`:""} ; ${deux?`A = ${vt(mA)} dans R → R′ ; B = ${vt(nB)} dans R′ → R`:`M = ${vt(mA)} dans l'ancien repère → nouveau repère`}`,
    champs:deux?[casesXY("A",PR,"Coordonnées de A dans R′ :"),casesXY("B",XY,"Coordonnées de B dans R :")]:[casesXY("A",PR)],juge,etapes:E,bonne:deux?`A : ${fx(vt(xp))} dans R′ ; B : ${fx(vt(mB))} dans R`:fx(vt(xp)),bonneTxt:deux?`A = ${vt(xp)} dans R′ ; B = ${vt(mB)} dans R`:vt(xp),
    repBonne:Object.assign({A:{"x′":String(xp[0]),"y′":String(xp[1])}},deux?{B:{x:String(mB[0]),y:String(mB[1])}}:{}),repFausse:Object.assign({A:{"x′":String(direct[0]+(direct[0]===xp[0]&&direct[1]===xp[1]?1:0)),"y′":String(direct[1])}},deux?{B:{x:String(mB[0]),y:String(mB[1])}}:{}),nature:deux?"deux":"nouveau"};}
/* comme le TD 1, exercice 1 : est-ce un repère, puis les formules avec x et y */
function repFormules(P){const [a,b]=P[0],[c,d]=P[1],det=a*d-b*c,oui=det!==0;let E,S=null,ex=null;
  if(!oui){const l=div(b||d,b?a:c);E=[{w:`${ve("v")} = ${nb(l)}${ve("u")} : les deux vecteurs sont colinéaires. <b>${rep2("O","u","v")} n'est pas un repère du plan.</b>`,why:`Un point et deux vecteurs forment un repère du plan seulement si les deux vecteurs ne sont pas colinéaires, c'est-à-dire si aucun n'est un multiple de l'autre. Ici ${fx(`${nb(a)} × ${par(d)} − ${par(c)} × ${par(b)} = 0`)}.`,pts:2}];}
  else{const B=[[1,0],[0,1]],R=echelonne(P,B);S=[];
    for(let r=1;r>=0;r--){const L=R.E[r],e={c:Q(0),k:{}};XY.forEach((x,i)=>{if(!nul(L[2+i]))e.k[x]=q(L[2+i]);});for(let t=r+1;t<2;t++){if(nul(L[t]))continue;Object.keys(S[t].k).forEach(z=>{e.k[z]=sub(e.k[z]||Q(0),mul(L[t],S[t].k[z]));});}
      Object.keys(e.k).forEach(z=>{e.k[z]=div(e.k[z],L[r]);if(nul(e.k[z]))delete e.k[z];});S[r]=e;}
    ex=S.map(e=>aff(e,XY));const L2=R.E[1],L1=R.E[0],sy=lettres(vecL(L2,2,2,XY),XY),sx=nul(L1[1])?"x":suite("x",q(L1[1]).n>0,(egal(abs(L1[1]),1)?"":nb(abs(L1[1])))+"y′"),dx=egal(L1[0],1)?sx:egal(L1[0],-1)?`−(${sx})`:`(${sx}) / ${par(L1[0])}`;
    E=[{w:`${ve("u")} et ${ve("v")} ne sont pas colinéaires : ${fx(`${nb(a)} × ${par(d)} − ${par(c)} × ${par(b)} = ${nb(det)}`)}, qui n'est pas nul. <b>${rep2("O","u","v")} est un repère du plan.</b>`,why:`Un point et deux vecteurs forment un repère du plan quand les deux vecteurs ne sont pas colinéaires : leurs coordonnées (${nb(a)}, ${nb(c)}) et (${nb(b)}, ${nb(d)}) ne sont pas proportionnelles.`,pts:1},
      {w:`${ve("OM")} = x′${ve("u")} + y′${ve("v")} donne : <span class="sys"><span>$${comb(P[0],PR)} = x$</span><span>$${comb(P[1],PR)} = y$</span></span>`,why:`On remplace ${ve("u")} et ${ve("v")} par leur écriture avec ${ve("i")} et ${ve("j")} : ce qui est devant ${ve("i")} vaut x, ce qui est devant ${ve("j")} vaut y. Les inconnues sont x′ et y′ ; x et y restent en lettres.`,pts:1},
      {w:`Matrice augmentée du système : ${matL(P.map((l,i)=>l.concat(B[i])),2,2,XY)}`,why:`Les seconds membres sont les lettres x et y.`,pts:0.5}];
    etapesOps(E,R,PR,M=>matL(M,2,2,XY),"La même opération se fait sur les lettres du second membre.");
    E.push({w:`Ligne 2 : ${fx(`${comb(L2.slice(0,2),PR)} = ${sy}`)}, donc ${fx(`y′ = ${egal(L2[1],1)?"":`(${sy}) / ${par(L2[1])} = `}${ex[1]}`)}.<br>Ligne 1 : ${fx(`${comb(L1.slice(0,2),PR)} = x`)}, donc ${nul(L1[1])?"":`${fx(`x′ = ${dx}`)}, et en remplaçant y′ par ${fx(ex[1])} : `}<b>${fx(`x′ = ${ex[0]}`)}</b> et <b>${fx(`y′ = ${ex[1]}`)}</b>.`,why:`On remonte : la ligne 2 donne y′, puis on remplace dans la ligne 1. Vérification avec le point de coordonnées (x′, y′) = (1, 0), qui est l'extrémité de ${ve("u")} : ${fx(`(x, y) = ${vt(colU(P))}`)} donne bien ${fx(`x′ = ${nb(add(mul(S[0].k.x||0,a),mul(S[0].k.y||0,c)))}`)}.`,pts:1.5});}
  function juge(rep){if(!rep.rep)return {incomplet:"Choisis d'abord oui ou non."};
    if(rep.rep==="non")return oui?{ok:false,faux:["rep"],resume:"Ce n'est pas ça : c'est bien un repère.",diag:{etape:0,type:"vecteurs crus colinéaires",titre:"Où ça part : la colinéarité.",msg:`${fx(`${nb(a)} × ${par(d)} − ${par(c)} × ${par(b)} = ${nb(det)}`)} n'est pas nul : aucun des deux vecteurs n'est un multiple de l'autre.`}}:{ok:true};
    if(!oui)return {ok:false,faux:["rep"],resume:"Ce n'est pas ça : ce n'est pas un repère.",diag:{etape:0,type:"colinéarité non vue",titre:"Où ça part : la colinéarité.",msg:`${ve("v")} est un multiple de ${ve("u")} : avec deux vecteurs colinéaires, on ne peut atteindre que les points d'une droite.`}};
    const e=PR.map(x=>affine((rep.f||{})[x],XY));if(e.some(z=>!z))return {incomplet:"Écris x′ et y′ avec x et y, par exemple (x + y)/2 ou 2x - y."};
    const F=PR.filter((_,i)=>!nul(e[i].c)||XY.some(z=>!egal(e[i].k[z]||Q(0),S[i].k[z]||Q(0))));if(!F.length)return {ok:true};
    const sens=egal(e[0].k.x||Q(0),a)&&egal(e[0].k.y||Q(0),b)&&egal(e[1].k.x||Q(0),c)&&egal(e[1].k.y||Q(0),d);
    return {ok:false,faux:F,resume:fauxTxt(F),diag:{etape:sens?1:E.length-1,type:sens?"formules écrites dans le mauvais sens":"résolution du système avec x et y en lettres",titre:sens?"Où ça part : le sens des formules.":"Où ça part : la remontée.",msg:sens?`Tu as écrit les formules qui donnent x et y avec x′ et y′. On demande l'inverse : il faut résoudre le système, dont les inconnues sont x′ et y′.`:`${fx(`x′ = ${ex[0]}`)} et ${fx(`y′ = ${ex[1]}`)}.`}};}
  return {sig:"RF"+JSON.stringify(P),q:`Dans le plan muni du repère ${rep2("O","i","j")}, on pose ${poseUV(P)}. Est-ce que ${rep2("O","u","v")} est aussi un repère du plan ? Si oui : on note (x, y) les coordonnées d'un point M dans ${rep2("O","i","j")} ; écris ses coordonnées (x′, y′) dans ${rep2("O","u","v")} en fonction de x et de y.`,corps:"",
    texte:`u = ${vt(colU(P))}, v = ${vt(colV(P))} : (O ; u, v) est-il un repère ? formules de x′ et y′ avec x et y`,
    champs:[{k:"choix",id:"rep",o:[["oui","Oui, c'est un repère"],["non","Non"]]},{k:"cases",id:"f",noms:PR,si:{rep:"oui"},large:true,aide:"Écris chaque coordonnée avec x et y, par exemple (x + y)/2 ou 2x - y."}],juge,etapes:E,
    bonne:oui?`oui ; ${fx(`x′ = ${ex[0]}`)} et ${fx(`y′ = ${ex[1]}`)}`:"non : les deux vecteurs sont colinéaires",bonneTxt:oui?`oui ; x′ = ${ex[0]} ; y′ = ${ex[1]}`:"non (vecteurs colinéaires)",
    repBonne:oui?{rep:"oui",f:{"x′":ex[0].replace(/−/g,"-"),"y′":ex[1].replace(/−/g,"-")}}:{rep:"non"},repFausse:oui?{rep:"oui",f:{"x′":comb(P[0],XY).replace(/−/g,"-")+"+x","y′":comb(P[1],XY).replace(/−/g,"-")}}:{rep:"oui",f:{"x′":"x","y′":"y"}},nature:oui?"oui":"non"};}
/* une matrice de passage dont le pivot est ±1 et le déterminant petit : le système 2 × 2 tombe juste */
function passage(R,dets,m,dmax){m=m||3;for(;;){const a=R.choix([1,1,-1]),b=R.ent(-m,m),c=R.ent(-m,m),det=R.choix(dets),d=(det+b*c)/a;if(Math.abs(d)<=(dmax||5)&&(b||c))return [[a,b],[c,d]];}}
const point=(R,m)=>{for(;;){const p=[R.ent(-m,m),R.ent(-m,m)];if(p[0]||p[1])return p;}};

function calculRn(R){const n=R.choix([3,3,4]),u=vAlea(R,n,4),v=vAlea(R,n,4),al=R.choix([2,3,-2,-1,4,-3]),be=R.choix([1,-1,2,-2,3,-3]),r=u.map((x,i)=>al*x+be*v[i]),ex=comb([al,be],["u","v"]),au=u.map(x=>al*x),bv=v.map(x=>be*x);
  const E=[{w:`${fx(`${comb([al],["u"])} = ${vt(au)}`)} et ${fx(`${comb([be],["v"])} = ${vt(bv)}`)}`,why:`Multiplier un vecteur par un nombre, c'est multiplier chacune de ses composantes par ce nombre. Attention aux signes.`,pts:1},
    {w:`<b>${fx(`${ex} = ${vt(r)}`)}</b>`,why:`On additionne composante par composante : la première avec la première, la deuxième avec la deuxième, et ainsi de suite.`,pts:1}];
  function juge(rep){const w=liste(rep.vec,n);if(!w)return {incomplet:`Écris un vecteur de ${n} nombres, par exemple (${[1,-2,3,0].slice(0,n).join(", ")}).`};const F=w.map((x,i)=>egal(x,r[i])?-1:i).filter(i=>i>=0);if(!F.length)return {ok:true};
    const signe=F.every(i=>egal(w[i],al*u[i]-be*v[i]));
    return {ok:false,faux:["vec"],resume:`Pas tout à fait : ${F.length>1?"les composantes":"la composante"} ${et(F.map(i=>String(i+1)))} ${F.length>1?"sont fausses":"est fausse"}.`,diag:{etape:signe?0:1,type:signe?"signe en multipliant un vecteur":"calcul composante par composante",titre:signe?`Où ça part : le produit ${comb([be],["v"])}.`:"Où ça part : l'addition des composantes.",msg:signe?`${fx(`${comb([be],["v"])} = ${vt(bv)}`)} : le signe porte sur chaque composante.`:`Par exemple pour la composante ${F[0]+1} : ${fx(`${nb(au[F[0]])} + ${par(bv[F[0]])} = ${nb(r[F[0]])}`)}.`}};}
  return {sig:"RC"+JSON.stringify([u,v,al,be]),q:`Dans ${fx("ℝ"+["","","²","³","⁴"][n])}, on pose ${fx("u = "+vt(u))} et ${fx("v = "+vt(v))}. Calcule le vecteur ${fx(ex)}.`,corps:"",texte:`u = ${vt(u)}, v = ${vt(v)} ; calculer ${ex}`,
    champs:[{k:"champ",id:"vec",nom:"vecteur",label:`$${ex} =$`,ex:`par exemple (${[1,-2,3,0].slice(0,n).join(", ")})`}],juge,etapes:E,bonne:fx(vt(r)),bonneTxt:vt(r),repBonne:{vec:"("+r.join(", ")+")"},repFausse:{vec:"("+r.map((x,i)=>i?x:x+1).join(", ")+")"},nature:"calcul"};}
function equationRn(R){const n=R.choix([2,3,3]),x=vAlea(R,n,3),v=vAlea(R,n,3),al=R.choix([2,3,-2,4]),be=R.choix([1,2,-1,3]),forme=R.ent(0,1),u=forme?v.map((z,i)=>be*z+al*x[i]):v.map((z,i)=>be*z-al*x[i]);
  const eq=forme?`u − ${al<0?"("+nb(al)+")":al}x = ${comb([be],["v"])}`:`${comb([al],["x"])} + u = ${comb([be],["v"])}`,dr=forme?u.map((z,i)=>z-be*v[i]):v.map((z,i)=>be*z-u[i]),drT=forme?`u − ${comb([be],["v"]).replace(/^−/,"(−")+(be<0?")":"")}`:`${comb([be],["v"])} − u`;
  const E=[{w:`${fx(`${comb([al],["x"])} = ${drT}`)}`,why:`On isole le terme en x, comme dans une équation avec des nombres : ce qui change de côté change de signe.`,pts:1},
    {w:`${fx(`${drT} = ${vt(dr)}`)}`,why:`On calcule le vecteur de droite, composante par composante.`,pts:1},
    {w:`<b>${fx(`x = ${vt(x)}`)}</b>`,why:`On divise chaque composante par ${nb(al)}. Vérification sur la première composante : ${fx(forme?`${nb(u[0])} − ${par(al)} × ${par(x[0])} = ${nb(be*v[0])}`:`${nb(al)} × ${par(x[0])} + ${par(u[0])} = ${nb(be*v[0])}`)}.`,pts:1}];
  function juge(rep){const w=liste(rep.vec,n);if(!w)return {incomplet:`Écris un vecteur de ${n} nombres, par exemple (${[1,-2,3].slice(0,n).join(", ")}).`};const F=w.map((z,i)=>egal(z,x[i])?-1:i).filter(i=>i>=0);if(!F.length)return {ok:true};
    const pasDiv=F.length&&w.every((z,i)=>egal(z,dr[i])),signe=w.every((z,i)=>egal(z,-x[i]));
    return {ok:false,faux:["vec"],resume:`Pas tout à fait : ${F.length>1?"les composantes":"la composante"} ${et(F.map(i=>String(i+1)))} ${F.length>1?"sont fausses":"est fausse"}.`,diag:{etape:pasDiv?2:signe?0:1,type:pasDiv?"division oubliée":signe?"signe en isolant x":"équation entre vecteurs",titre:pasDiv?"Où ça part : la dernière étape.":signe?"Où ça part : l'isolement de x.":"Où ça part : le calcul du vecteur de droite.",msg:pasDiv?`Tu as trouvé ${fx(comb([al],["x"]))}, pas x : il reste à diviser chaque composante par ${nb(al)}.`:signe?`${fx(`${comb([al],["x"])} = ${drT}`)} : vérifie le signe de chaque terme qui change de côté.`:`${fx(`${drT} = ${vt(dr)}`)}, puis on divise par ${nb(al)}.`}};}
  return {sig:"RE"+JSON.stringify([u,v,al,be,forme]),q:`Dans ${fx("ℝ"+["","","²","³"][n])}, on pose ${fx("u = "+vt(u))} et ${fx("v = "+vt(v))}. Trouve le vecteur x tel que ${fx(eq)}.`,corps:"",texte:`u = ${vt(u)}, v = ${vt(v)} ; trouver x tel que ${eq}`,
    champs:[{k:"champ",id:"vec",nom:"vecteur x",label:"$x =$",ex:`par exemple (${[1,-2,3].slice(0,n).join(", ")})`}],juge,etapes:E,bonne:fx("x = "+vt(x)),bonneTxt:"x = "+vt(x),repBonne:{vec:"("+x.join(", ")+")"},repFausse:{vec:"("+dr.map((z,i)=>z===x[i]?z+1:z).join(", ")+")"},nature:"equation"};}

/* ---------- les démonstrations de la liste du prof : à écrire de mémoire, puis à cocher ligne par ligne ---------- */
const ZN="0<sub>ℝⁿ</sub>";
const recit=(sig,q,corps,lignes)=>()=>({sig,q,corps,texte:(q+" "+corps).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
  etapes:lignes.map(l=>({w:l[0],why:l[1],pts:l[2]})),bonne:"voir la correction",bonneTxt:"à écrire de mémoire (voir la correction)",repBonne:{},nature:"papier"});
const RECITS=[
 {id:"AC1",t:"Question de cours : la définition d'un sous-espace vectoriel",th:"cours",cc:3,pages:["cours"],
  q:"Question de cours annoncée pour le CC1 : écris la définition d'un sous-espace vectoriel de ℝⁿ (définition 36 du poly).",corps:"",
  l:[["Soit F un sous-ensemble de ℝⁿ. On dit que F est un sous-espace vectoriel de ℝⁿ si les trois conditions suivantes sont vérifiées :","On commence par dire de quoi on parle : une partie F de ℝⁿ.",0.5],
   [`${ZN} ∈ F ;`,"F contient le vecteur nul.",0.5],
   ["∀x, y ∈ F, x + y ∈ F ;","F est stable par addition. Le « pour tout » (∀) compte : sans lui, la phrase ne dit rien.",0.5],
   ["∀x ∈ F, ∀λ ∈ ℝ, λx ∈ F.","F est stable par multiplication par les scalaires, c'est-à-dire par les nombres réels.",0.5]]},
 {id:"AC2",t:"Question de cours : la démonstration de la proposition 37",th:"cours",cc:8,pages:["cours"],
  q:"Question de cours annoncée pour le CC1 : démontre la proposition 37 du poly. Soient v₁, …, vₖ ∈ ℝⁿ, avec k ∈ ℕ*. Alors Vect(v₁, …, vₖ) est un sous-espace vectoriel de ℝⁿ.",corps:"<p>Rappel : Vect(v₁, …, vₖ) est l'ensemble des combinaisons linéaires λ₁v₁ + … + λₖvₖ, où λ₁, …, λₖ sont des réels.</p>",
  l:[["On démontre les trois conditions de la définition.","Annoncer le plan montre que tu connais la définition.",0.5],
   [`1. Le vecteur nul ${ZN} appartient à Vect(v₁, …, vₖ), car il est combinaison linéaire de v₁, …, vₖ : ${ZN} = 0v₁ + … + 0vₖ.`,"Première condition : tous les coefficients valent 0. Le poly écrit seulement « voir plus haut » ; cette égalité est à écrire sur la copie.",1],
   ["2. Soient x, y ∈ Vect(v₁, …, vₖ). Il existe alors des scalaires λ₁, …, λₖ et μ₁, …, μₖ tels que x = λ₁v₁ + … + λₖvₖ et y = μ₁v₁ + … + μₖvₖ.","Être dans Vect, c'est s'écrire comme combinaison linéaire. Il faut deux jeux de coefficients différents : rien ne dit que x et y ont les mêmes.",1],
   ["On en déduit que x + y = (λ₁v₁ + … + λₖvₖ) + (μ₁v₁ + … + μₖvₖ) = (λ₁ + μ₁)v₁ + … + (λₖ + μₖ)vₖ","On regroupe les termes en v₁, puis en v₂, et ainsi de suite.",1],
   ["et donc que x + y ∈ Vect(v₁, …, vₖ).","C'est une combinaison linéaire de v₁, …, vₖ. La conclusion doit être écrite.",0.5],
   ["3. Soient x ∈ Vect(v₁, …, vₖ) et α ∈ ℝ. Il existe des scalaires λ₁, …, λₖ tels que x = λ₁v₁ + … + λₖvₖ.","Troisième condition : même début, avec un seul vecteur et un nombre α.",0.5],
   ["On en déduit que αx = α(λ₁v₁ + … + λₖvₖ) = (αλ₁)v₁ + … + (αλₖ)vₖ","On distribue α. Le poly écrit « λx » à cet endroit : c'est une coquille, le scalaire s'appelle α.",1],
   ["et donc que αx ∈ Vect(v₁, …, vₖ).","Encore une combinaison linéaire de v₁, …, vₖ : les trois conditions sont démontrées.",0.5]]},
 {id:"AC3",t:"TD 1, exercice 7 : démontrer que λx = 0 si et seulement si x = 0 ou λ = 0",th:"rn",cc:6,
  q:`Exercice de la liste annoncée pour le CC1 (TD 1, exercice 7). Soient x ∈ ℝⁿ et λ ∈ ℝ. Montre que λx = ${ZN} si et seulement si x = ${ZN} ou λ = 0.`,corps:`<p>Rappel : ${ZN} est le vecteur nul de ℝⁿ, celui dont toutes les composantes valent 0, et x = (x₁, …, xₙ).</p>`,
  l:[[`Notons x = (x₁, …, xₙ), de sorte que λx = (λx₁, …, λxₙ). Sens ⇐. Si λ = 0, alors λx = (0 × x₁, …, 0 × xₙ) = ${ZN}.`,"« Si et seulement si » : il y a deux sens à démontrer. Celui-ci est un calcul, composante par composante. On commence par nommer les composantes de x.",1],
   [`Si x = ${ZN}, alors λx = (λ × 0, …, λ × 0) = ${ZN}.`,"Le « ou » demande de traiter les deux cas.",1],
   [`Sens ⇒. Supposons λx = ${ZN}, c'est-à-dire λxᵢ = 0 pour tout i.`,"Une égalité entre vecteurs, c'est une égalité entre nombres pour chaque composante.",1],
   ["Si λ = 0, c'est fini.","La conclusion « x = 0 ou λ = 0 » est déjà vraie.",0.5],
   ["Sinon, λ ≠ 0 : on peut diviser par λ, et chaque égalité λxᵢ = 0 donne xᵢ = 0.","On ne divise que par un nombre non nul : c'est pour cela qu'on sépare les deux cas.",1],
   [`Donc x = ${ZN}.`,"Toutes les composantes de x sont nulles.",0.5]]},
 {id:"AC4",t:"TD 3, exercice 4 : les propriétés de Vect (démonstrations)",th:"vect",cc:10,
  q:"Exercice de la liste annoncée pour le CC1 (TD 3, exercice 4). Soient u, v, w ∈ ℝⁿ. Réponds aux quatre questions.",corps:"<p>Rappel : Vect(u, v, w) est l'ensemble de toutes les combinaisons linéaires au + bv + cw, où a, b, c sont des réels.</p><ol><li>Justifier que le vecteur nul, ainsi que u, v et w, appartiennent à Vect(u, v, w).</li><li>Soient x, y ∈ Vect(u, v) et α, β ∈ ℝ. Montrer que αx + βy ∈ Vect(u, v).</li><li>Donner une représentation paramétrique de Vect((2, −1, 3)).</li><li>Montrer que, pour tout λ ∈ ℝ, Vect(λu) ⊆ Vect(u). Quand a-t-on égalité ?</li></ol>",
  l:[[`Question 1. ${ZN} = 0u + 0v + 0w, u = 1u + 0v + 0w, v = 0u + 1v + 0w et w = 0u + 0v + 1w : ce sont des combinaisons linéaires de u, v, w, donc ils appartiennent à Vect(u, v, w).`,"Pour montrer qu'un vecteur est dans Vect, on l'écrit comme combinaison linéaire, avec ses coefficients.",1],
   ["Question 2. Il existe des réels a, b, c, d tels que x = au + bv et y = cu + dv.","On traduit « x et y sont dans Vect(u, v) ».",0.5],
   ["αx + βy = α(au + bv) + β(cu + dv) = (αa + βc)u + (αb + βd)v","On développe, puis on regroupe ce qui est devant u et ce qui est devant v.",1],
   ["C'est une combinaison linéaire de u et v : αx + βy ∈ Vect(u, v).","La conclusion doit être écrite.",0.5],
   ["Question 3. Vect((2, −1, 3)) est l'ensemble des multiples de (2, −1, 3) : {(2t, −t, 3t) | t ∈ ℝ}.","Avec un seul vecteur, les combinaisons linéaires sont ses multiples. Le paramètre t parcourt tous les réels.",1],
   ["Question 4. Un élément de Vect(λu) s'écrit μ(λu) = (μλ)u, avec μ ∈ ℝ : c'est un multiple de u, donc un élément de Vect(u). D'où Vect(λu) ⊆ Vect(u).","Pour montrer une inclusion, on prend un élément quelconque du premier ensemble et on montre qu'il est dans le second.",1],
   ["Si λ ≠ 0 : tout élément de Vect(u) s'écrit tu = (t/λ)(λu), avec t ∈ ℝ : c'est un élément de Vect(λu). Donc Vect(u) ⊆ Vect(λu), et il y a égalité.","On peut diviser par λ parce qu'il n'est pas nul. On montre l'autre inclusion de la même façon : un élément quelconque de Vect(u).",0.5],
   [`Si λ = 0 : λu = ${ZN}, donc Vect(λu) = {${ZN}}. Comme u ∈ Vect(u), on a Vect(u) = {${ZN}} si et seulement si u = ${ZN}. Il y a donc égalité si et seulement si u = ${ZN}.`,"Le cas λ = 0 se traite à part. Les deux sens comptent : si u = 0 il y a égalité, et s'il y a égalité alors u = 0.",0.5],
   [`Conclusion : il y a égalité si et seulement si λ ≠ 0 ou u = ${ZN}.`,"On rassemble les deux cas en une phrase.",0.5]]}];

const petit=(A,b,ma,mb)=>A.every(r=>r.every(x=>Math.abs(x)<=ma))&&b.every(x=>Math.abs(x)<=mb)&&A.every(r=>r.filter(x=>x!==0).length>=2)&&A[0].every((_,j)=>A.some(r=>r[j]!==0));
const bas=(R,n,m)=>{const L=[];for(let i=0;i<n;i++){L.push([]);for(let j=0;j<n;j++)L[i].push(j===i?1:j<i?R.nz(-m,m):0);}return L;};
/* matrice échelonnée à pivots choisis : zéros avant le pivot de chaque ligne, petits entiers après */
const haut=(R,n,c,cols,pv,m)=>{const U=[];for(let i=0;i<n;i++){U.push(new Array(c).fill(0));if(i>=cols.length)continue;U[i][cols[i]]=pv?pv[i]:1;for(let j=cols[i]+1;j<c;j++)U[i][j]=cols.includes(j)&&R()<0.3?0:R.ent(-m,m);}return U;};
function carre3(R,avecEchange){for(;;){
  const sol=[R.ent(-3,4),R.ent(-3,4),R.ent(-3,4)];if(sol.every(x=>x===0))continue;let A;
  if(avecEchange===2){/* la première équation n'a pas de x : il faut échanger deux lignes */
    const p=R.choix([1,1,-1,2]),r1=[0,p,R.nz(-3,3)],r2=[1,R.ent(-3,3),R.ent(-3,3)],l31=R.nz(-2,3),l32=R.nz(-2,2);
    A=[r1,r2,r2.map((x,k)=>l31*x+l32*r1[k]+(k===2?R.choix([1,1,-1,2]):0))];}
  else{const pv=avecEchange===1?[R.choix([2,3,-1,-2]),R.choix([1,-1,2]),R.choix([1,2,-1,3])]:[1,1,1];
    A=prod(bas(R,3,3),haut(R,3,3,[0,1,2],pv,3));}
  const b=fois(A,sol);if(petit(A,b,9,25))return [A,b];}}
function rang2(R,nature){for(;;){
  const cols=R()<0.25?[0,2]:[0,1],U=haut(R,3,3,cols,null,3),L=bas(R,3,2),A=prod(L,U),c=[R.ent(-3,4),R.ent(-3,4),nature==="zero"?R.nz(-4,5):0],b=fois(L,c);
  if(petit(A,b,9,25)&&A[2].some(x=>x!==0))return [A,b];}}
function commeAuCC(R){for(;;){const t=R.choix(["34","34","34","44","44","43","24"]);let A,b;
  if(t==="34"){const k=R.choix(["r3","r3","r3","r2","r2z"]),cols=k==="r3"?R.choix([[0,1,2],[0,1,3],[0,2,3]]):R.choix([[0,1],[0,2]]);
    const U=haut(R,3,4,cols,null,2),L=bas(R,3,2),c=[R.ent(-3,4),R.ent(-3,4),k==="r3"?R.ent(-3,4):k==="r2z"?R.nz(-4,5):0];A=prod(L,U);b=fois(L,c);}
  else if(t==="43"){const r=R.choix([2,3,3]),U=haut(R,4,3,r===3?[0,1,2]:[0,R.choix([1,2])],null,2),L=bas(R,4,1),c=[R.ent(-3,4),R.ent(-3,4),r===3?R.ent(-3,4):R.choix([0,R.nz(-3,3)]),R()<0.6?R.nz(-3,3):0];A=prod(L,U);b=fois(L,c);}
  else if(t==="24"){const U=haut(R,2,4,[0,R.choix([1,1,2])],null,2),L=bas(R,2,2);A=prod(L,U);b=fois(L,[R.ent(-3,4),R.ent(-3,4)]);}
  else{const cols=R.choix([[0,1,2],[0,1,3],[0,2,3],[0,1],[0,1,2,3]]),U=haut(R,4,4,cols,null,2),L=bas(R,4,1);A=prod(L,U);b=[0,0,0,0];}
  if(petit(A,b,9,25)&&A.every(r=>r.some(x=>x!==0))&&new Set(A.map(r=>r.join())).size===A.length)return [A,b];}}

/* ---------- AL5 : sous-espace vectoriel ou pas (hors de la liste du CC1 ; tombé aux CC1 de 2022 et 2023) ---------- */
/* un ensemble F est décrit par des données simples (e.ens), relues telles quelles par le contrôle indépendant */
const ESP=["","","ℝ²","ℝ³"],GNOM=["v₁","v₂"];
const nulV=n=>Array(n).fill(0),unite=(n,i,c)=>nulV(n).map((_,k)=>k===i?c:0),platV=v=>"("+v.join(", ")+")";
const pl=(c,v)=>c.reduce((s,a,i)=>add(s,mul(a,v[i])),Q(0)),carreQ=x=>mul(x,x),entQ=x=>q(x).d===1;
const PN=E=>E.D.length===1?["t"]:["s","t"];
function dansE(E,v){
  if(E.k==="eq")return E.A.every((r,i)=>egal(pl(r,v),E.b[i]));
  if(E.k==="par")return rangM(E.D.concat([v.map((x,i)=>sub(x,E.a[i]))]))===rangM(E.D);
  if(E.k==="demi")return q(pl(E.c,v)).n*E.sens>=0;
  if(E.k==="prod")return egal(mul(v[E.i],v[E.j]),E.d);
  if(E.k==="quadrant")return q(mul(v[E.i],v[E.j])).n>=0;
  if(E.k==="para")return egal(v[E.j],mul(E.a,carreQ(v[E.i])));
  if(E.k==="cercle")return egal(add(carreQ(v[0]),carreQ(v[1])),E.r);
  return egal(carreQ(v[0]),carreQ(v[1]));}
const tupleE=E=>{const P=PN(E);return "("+E.a.map((c,i)=>aff({c:Q(c),k:Object.fromEntries(P.map((p,j)=>[p,Q(E.D[j][i])]))},P)).join(", ")+")";};
const carreTxt=E=>(E.a===1?"":E.a===-1?"−":nb(E.a))+XYZ[E.i]+"²";
function ensTxt(E){const V=XYZ.slice(0,E.n);
  if(E.k==="par")return `{${tupleE(E)} | ${PN(E).join(", ")} ∈ ℝ}`;
  const X=V[E.i],Y=V[E.j];
  const cond=E.k==="eq"?E.A.map((r,i)=>`${comb(r,V)} = ${nb(E.b[i])}`).join(" et ")
    :E.k==="demi"?`${comb(E.c,V)} ${E.sens>0?"≥":"≤"} 0`
    :E.k==="prod"?`${X}${Y} = ${nb(E.d)}`
    :E.k==="quadrant"?`${X}${Y} ≥ 0`
    :E.k==="para"?`${Y} = ${carreTxt(E)}`
    :E.k==="cercle"?`x² + y² = ${nb(E.r)}`:"x² = y²";
  return `{(${V.join(", ")}) ∈ ${ESP[E.n]} | ${cond}}`;}
/* la justification la plus directe, avec son contre-exemple ou ses vecteurs */
function analyseE(E){const n=E.n;
  if(E.k==="eq")return E.b.every(x=>!x)?{sev:true,rai:"homo",dim:n-rangM(E.A)}:{sev:false,rai:"zero"};
  if(E.k==="par"){const d=rangM(E.D);return rangM(E.D.concat([E.a]))===d?{sev:true,rai:"vect",dim:d}:{sev:false,rai:"zero"};}
  if(E.k==="demi"){const i=E.c.findIndex(x=>x);return {sev:false,rai:"mul",u:unite(n,i,E.sens*Math.sign(E.c[i]))};}
  if(E.k==="prod")return E.d?{sev:false,rai:"zero"}:{sev:false,rai:"add",u:unite(n,E.i,1),v:unite(n,E.j,1)};
  if(E.k==="quadrant")return {sev:false,rai:"add",u:nulV(n).map((_,k)=>k===E.i?2:k===E.j?1:0),v:nulV(n).map((_,k)=>k===E.i?-1:k===E.j?-2:0)};
  if(E.k==="para")return {sev:false,rai:"add",u:nulV(n).map((_,k)=>k===E.i?1:k===E.j?E.a:0),v:nulV(n).map((_,k)=>k===E.i?-1:k===E.j?E.a:0)};
  if(E.k==="cercle")return {sev:false,rai:"zero"};
  return {sev:false,rai:"add",u:[1,1],v:[1,-1]};}
/* pourquoi le vecteur nul n'est pas dans un ensemble à paramètres : on annule une ou deux composantes, une autre ne suit pas */
function pasNul(E){const n=E.n,a=E.a,D=E.D;let m=null;
  if(D.length===1){const d=D[0];
    for(let p=0;p<n;p++){if(!d[p])continue;const t0=Q(-a[p],d[p]);for(let r=0;r<n;r++){if(r===p)continue;const val=add(a[r],mul(t0,d[r]));if(!nul(val)&&(!m||(entQ(t0)&&!m.ent)))m={ent:entQ(t0),r,val,sol:`t = ${nb(t0)}`,quoi:`La ${rangOrd(p)} composante est nulle seulement pour`};}}
    return m;}
  for(let p=0;p<n;p++)for(let c=p+1;c<n;c++){const det=D[0][p]*D[1][c]-D[1][p]*D[0][c];if(!det)continue;
    const s0=Q(-a[p]*D[1][c]+a[c]*D[1][p],det),t0=Q(-D[0][p]*a[c]+D[0][c]*a[p],det),ent=entQ(s0)&&entQ(t0);
    for(let r=0;r<n;r++){if(r===p||r===c)continue;const val=add(a[r],add(mul(s0,D[0][r]),mul(t0,D[1][r])));if(!nul(val)&&(!m||(ent&&!m.ent)))m={ent,r,val,sol:`s = ${nb(s0)} et t = ${nb(t0)}`,quoi:`Les ${rangOrd(p)} et ${rangOrd(c)} composantes sont nulles seulement pour`};}}
  return m;}
function sevOuPas(E){const n=E.n,V=XYZ.slice(0,n),Z=nulV(n),A=analyseE(E),ens=ensTxt(E),esp=ESP[n],zt=vt(Z),exV=n===2?"(1, 0)":"(1, 0, 2)";
  const nbG=A.sev?A.dim:E.k==="par"?E.D.length:1,X=V[E.i],Y=V[E.j],xy=X+Y;
  const pasSev=quoi=>`<b>F n'est pas stable par ${quoi} : ce n'est pas un sous-espace vectoriel de ${fx(esp)}.</b>`;
  const unSeul=`Un contre-exemple chiffré suffit : dès qu'une des trois conditions de la définition manque, ce n'est pas un sev.`;
  let Et,bonneTxt,repBonne;
  if(A.sev&&E.k==="eq"){const une=E.A.length===1;
    Et=[{w:`La condition qui définit F est ${une?"une équation <b>linéaire</b>":"un système d'équations <b>linéaires</b>"} (${V.join(", ")} multipliés par des nombres, puis additionnés) et <b>homogène</b> (${une?"le second membre vaut 0":"les seconds membres valent 0"}).`,why:`Pas de carré, pas de produit de deux inconnues, pas d'inégalité, et 0 à droite : F est l'ensemble des solutions d'un système linéaire homogène.`,pts:1},
      {w:`<b>D'après la proposition 39 du cours, l'ensemble des solutions d'un système linéaire homogène est un sous-espace vectoriel : F est un sous-espace vectoriel de ${fx(esp)}.</b>`,why:`Citer ce résultat du cours est la justification la plus directe, et elle suffit.`,pts:1}];
    bonneTxt="Oui : F est l'ensemble des solutions d'un système linéaire homogène (proposition 39).";repBonne={sev:"oui",rai:"homo"};}
  else if(A.sev){const P=PN(E),lin=E.a.every(x=>!x),vects=E.D.map(vt).join(", "),fin={w:`<b>D'après la proposition 37 du cours, tout Vect est un sous-espace vectoriel : F est un sous-espace vectoriel de ${fx(esp)}.</b>`,why:`Citer la proposition 37 suffit.`,pts:1};
    if(lin)Et=[{w:`On sépare ce qui est multiplié par ${P.join(" et par ")} : ${fx(`${tupleE(E)} = ${P.map((p,j)=>p+vt(E.D[j])).join(" + ")}`)}.`,why:`Chaque composante se lit en colonnes : les coefficients de ${P[0]} forment un vecteur${P.length>1?", ceux de t un autre":""}.`,pts:1},
      {w:`Donc ${fx(`F = Vect(${vects})`)}.`,why:`F est l'ensemble de toutes les combinaisons linéaires de ${P.length>1?"ces vecteurs":"ce vecteur"} : c'est la définition de Vect.`,pts:1},fin];
    else{const d=E.D[0],p=d.findIndex(x=>x),k=Q(E.a[p],d[p]),fac=aff({c:k,k:{t:Q(1)}},["t"]);
      Et=[{w:`On teste d'abord le vecteur nul : pour ${fx(`t = ${nb(mul(k,-1))}`)}, on trouve ${fx(zt)}. Le vecteur nul est dans F : on ne peut pas conclure tout de suite.`,why:`Une partie constante ne suffit pas pour dire « ce n'est pas un sev » : il faut regarder si le vecteur nul est atteint.`,pts:1},
        {w:`On met le vecteur en facteur : ${fx(`${tupleE(E)} = (${fac})${vt(d)}`)}. Quand t parcourt ℝ, ${fx(fac)} prend toutes les valeurs réelles, donc ${fx(`F = Vect(${vt(d)})`)}.`,why:`La partie constante ${vt(E.a)} est un multiple du vecteur ${vt(d)} : elle se range avec lui.`,pts:1},fin];}
    bonneTxt=`Oui : F = Vect(${vects}) (proposition 37).`;repBonne={sev:"oui",rai:"vect",gen:Object.fromEntries(E.D.map((d,j)=>[GNOM[j],platV(d)]))};}
  else if(A.rai==="zero"){const fin=pourquoi=>({w:`<b>Le vecteur nul n'est pas dans F : F n'est pas un sous-espace vectoriel de ${fx(esp)}.</b>`,why:pourquoi,pts:1});
    if(E.k==="par"){const P=PN(E),m=pasNul(E);
      Et=[{w:`On teste le vecteur nul : il est dans F seulement si ${P.length>1?"des valeurs de s et de t annulent":"une valeur de t annule"} les ${n===2?"deux":"trois"} composantes en même temps.`,why:`Avec une partie constante, le premier réflexe est de tester le vecteur nul : c'est la première condition de la définition d'un sous-espace vectoriel.`,pts:1},
        {w:`${m.quoi} ${fx(m.sol)}. La ${rangOrd(m.r)} composante vaut alors ${fx(nb(m.val))}, qui n'est pas nul.`,why:`On résout avec ${P.length>1?"deux composantes":"une composante"}, puis on regarde ce que donne ${P.length>1?"la troisième":"une autre"}.`,pts:1},
        fin(`Aucune valeur ${P.length>1?"de s et de t":"de t"} ne donne le vecteur nul. Dès qu'une des trois conditions de la définition manque, ce n'est pas un sev.`)];}
    else{const i=E.k==="eq"?E.b.findIndex(x=>x):0,g=E.k==="eq"?comb(E.A[i],V):E.k==="prod"?xy:"x² + y²",dr=E.k==="eq"?E.b[i]:E.k==="prod"?E.d:E.r;
      Et=[{w:`On teste le vecteur nul : pour ${fx(`(${V.join(", ")}) = ${zt}`)}, ${fx(g)} vaut 0, et ${fx(`0 ≠ ${nb(dr)}`)}.`,why:`Premier réflexe : le vecteur nul. C'est la première condition de la définition d'un sous-espace vectoriel.`,pts:1},
        fin(E.k==="eq"?`Dès qu'une des trois conditions de la définition manque, ce n'est pas un sev. La proposition 39 ne s'applique pas ici : le second membre n'est pas nul.`:`Dès qu'une des trois conditions de la définition manque, ce n'est pas un sev : inutile de regarder les deux autres.`)];}
    bonneTxt="Non : le vecteur nul n'est pas dans F.";repBonne={sev:"non",rai:"zero"};}
  else if(A.rai==="mul"){const cu=q(pl(E.c,A.u)),mu=A.u.map(x=>-x),g=comb(E.c,V);
    Et=[{w:`Le vecteur nul est dans F, et la somme de deux vecteurs de F reste dans F. On essaie donc de multiplier un vecteur de F par un nombre négatif.`,why:`Une inégalité change de sens quand on multiplie par un nombre négatif : c'est là que la condition casse.`,pts:1},
      {w:`${fx(`u = ${vt(A.u)}`)} est dans F : ${fx(g)} vaut ${fx(nb(cu))}.`,why:`On choisit un vecteur simple pour lequel l'inégalité est vraie, sans tomber sur 0.`,pts:1},
      {w:`${fx(`(−1)u = ${vt(mu)}`)} n'est pas dans F : ${fx(g)} vaut ${fx(nb(mul(cu,-1)))}, qui est strictement ${E.sens>0?"négatif":"positif"}. ${pasSev("multiplication par un réel")}`,why:unSeul,pts:1}];
    bonneTxt=`Non : ${vt(A.u)} est dans F, mais pas (−1) × ${vt(A.u)} = ${vt(mu)}.`;repBonne={sev:"non",rai:"mul",cm:{"λ":"-1",u:platV(A.u)}};}
  else{const s=A.u.map((x,k)=>x+A.v[k]),uv=`${fx(`u = ${vt(A.u)}`)} et ${fx(`v = ${vt(A.v)}`)} sont dans F`,som=`${fx(`u + v = ${vt(s)}`)} n'est pas dans F`;
    const carre=`Le vecteur nul est dans F : il faut chercher ailleurs. Le carré montre que la condition n'est pas linéaire : on essaie l'addition.`,carreW=`Un carré, un produit de deux inconnues ou une inégalité : la proposition 39 ne s'applique pas, on cherche un contre-exemple.`;
    if(E.k==="prod")Et=[{w:`Le vecteur nul est dans F, et un multiple d'un vecteur de F reste dans F. On essaie donc l'addition, avec deux vecteurs simples de F.`,why:`Un produit est nul quand l'un des deux facteurs est nul. Deux vecteurs de F peuvent avoir chacun un facteur nul différent : leur somme n'en a plus aucun.`,pts:1},
      {w:`${uv} : pour chacun, ${fx(xy)} vaut 0.`,why:`Dans u, c'est ${Y} qui est nul ; dans v, c'est ${X}.`,pts:1},
      {w:`${som} : ${fx(xy)} vaut 1, qui n'est pas nul. ${pasSev("addition")}`,why:unSeul,pts:1}];
    else if(E.k==="quadrant")Et=[{w:`Le vecteur nul est dans F, et un multiple d'un vecteur de F reste dans F (le produit ${xy} est multiplié par λ², qui n'est jamais négatif). On essaie donc l'addition.`,why:`La condition dit que ${X} et ${Y} ont le même signe. En ajoutant un vecteur où ils sont positifs et un vecteur où ils sont négatifs, les signes peuvent se séparer.`,pts:1},
      {w:`${uv} : pour chacun, ${fx(xy)} vaut 2.`,why:`Deux nombres de même signe ont un produit positif.`,pts:1},
      {w:`${som} : ${fx(xy)} vaut −1, qui est strictement négatif. ${pasSev("addition")}`,why:unSeul,pts:1}];
    else if(E.k==="para")Et=[{w:carre,why:carreW,pts:1},
      {w:`${uv} : pour chacun, ${fx(carreTxt(E))} vaut ${fx(nb(E.a))}, comme ${Y}.`,why:`On choisit deux vecteurs de F avec des ${X} opposés : leur somme aura ${fx(X+" = 0")}.`,pts:1},
      {w:`${som} : ${fx(carreTxt(E))} vaut 0, alors que ${fx(`${Y} = ${nb(2*E.a)}`)}. ${pasSev("addition")}`,why:unSeul,pts:1}];
    else Et=[{w:carre,why:carreW,pts:1},
      {w:`${uv} : pour chacun, x² et y² valent 1.`,why:`On choisit deux vecteurs de F très simples.`,pts:1},
      {w:`${som} : x² vaut 4 et y² vaut 0. ${pasSev("addition")}`,why:unSeul,pts:1}];
    bonneTxt=`Non : ${vt(A.u)} et ${vt(A.v)} sont dans F, mais pas leur somme ${vt(s)}.`;repBonne={sev:"non",rai:"add",ca:{u:platV(A.u),v:platV(A.v)}};}
  function juge(rep){
    if(!rep.sev)return {incomplet:"Réponds d'abord : est-ce un sous-espace vectoriel, oui ou non ?"};
    if(!rep.rai)return {incomplet:"Choisis ta justification."};
    const oui=rep.sev==="oui";
    if(oui!==A.sev)return {ok:false,faux:["sev"],resume:A.sev?"Si : F est un sous-espace vectoriel.":"Non : F n'est pas un sous-espace vectoriel.",diag:{etape:Et.length-1,type:"sous-espace vectoriel ou pas",titre:"Où ça part : la conclusion.",msg:bonneTxt}};
    const mauvaise=(msg,ch)=>({ok:false,faux:[ch||"rai"],resume:`Ta réponse (${oui?"oui":"non"}) est bonne, mais pas ta justification. ${msg}`,diag:{etape:0,type:ch?"contre-exemple ou vecteurs d'un sous-espace":"justification d'un sous-espace vectoriel",titre:"Où ça part : la justification.",msg:bonneTxt}});
    if(oui){
      if(rep.rai==="homo")return E.k==="eq"?{ok:true}:mauvaise("F n'est pas donné par des équations : écris-le plutôt sous la forme Vect(…).");
      if(rep.rai!=="vect")return mauvaise("Cette justification sert à montrer qu'un ensemble n'est pas un sev. Pour un sev, on cite la proposition 37 (un Vect) ou la proposition 39 (les solutions d'un système linéaire homogène).");
      const W=GNOM.slice(0,nbG).map(g=>liste((rep.gen||{})[g],n));
      if(W.some(w=>!w))return {incomplet:`Écris ${nbG>1?"chaque vecteur":"le vecteur"} avec ${n} nombres, par exemple ${exV}.`};
      if(W.some(w=>!dansE(E,w)))return mauvaise(`${nbG>1?"Un de tes vecteurs":"Ton vecteur"} n'est pas dans F.`,"gen");
      return rangM(W)===A.dim?{ok:true}:mauvaise(nbG>1?"Tes deux vecteurs sont colinéaires : ils n'engendrent pas tout F.":"Le vecteur nul n'engendre pas F.","gen");}
    if(rep.rai==="vect"||rep.rai==="homo")return mauvaise("Cette justification sert à montrer qu'un ensemble est un sev.");
    if(rep.rai==="zero")return dansE(E,Z)?mauvaise("Le vecteur nul est dans F : c'est une autre condition de la définition qui manque."):{ok:true};
    if(rep.rai==="add"){const u=liste((rep.ca||{}).u,n),v=liste((rep.ca||{}).v,n);
      if(!u||!v)return {incomplet:`Écris u et v avec ${n} nombres chacun, par exemple ${exV}.`};
      if(!dansE(E,u)||!dansE(E,v))return mauvaise(`${dansE(E,u)?"v":"u"} n'est pas dans F : il faut deux vecteurs de F.`,"ca");
      return dansE(E,u.map((x,i)=>add(x,v[i])))?mauvaise("u + v est encore dans F : ce n'est pas un contre-exemple.","ca"):{ok:true};}
    const l=nombre((rep.cm||{})["λ"]),u=liste((rep.cm||{}).u,n);
    if(!l||!u)return {incomplet:`Écris un nombre pour λ et un vecteur de ${n} nombres pour u, par exemple ${exV}.`};
    if(!dansE(E,u))return mauvaise("u n'est pas dans F : il faut partir d'un vecteur de F.","cm");
    return dansE(E,u.map(x=>mul(l,x)))?mauvaise("λu est encore dans F : ce n'est pas un contre-exemple.","cm"):{ok:true};}
  return {sig:"SV"+JSON.stringify(E),ens:E,q:`Dans ${fx(esp)}, on considère l'ensemble ${fx(`F = ${ens}`)}. F est-il un sous-espace vectoriel de ${fx(esp)} ? Donne la justification la plus directe.`,corps:"",texte:`F = ${ens} : sous-espace vectoriel de ${esp} ?`,
    champs:[{k:"choix",id:"sev",o:[["oui","Oui, c'est un sev"],["non","Non"]]},
      {k:"choix",id:"rai",titre:"Ta justification :",o:[["homo","Solutions d'un système linéaire homogène"],["vect","F s'écrit Vect(…)"],["zero","Le vecteur nul n'est pas dans F"],["add","Pas stable par addition"],["mul","Pas stable par multiplication par un réel"]]},
      {k:"cases",id:"gen",noms:GNOM.slice(0,nbG),si:{rai:"vect"},large:true,aide:`${nbG>1?"Les vecteurs qui engendrent":"Le vecteur qui engendre"} F, par exemple ${exV}.`},
      {k:"cases",id:"ca",noms:["u","v"],si:{rai:"add"},large:true,aide:`Deux vecteurs u et v de F dont la somme n'est pas dans F, par exemple ${exV}.`},
      {k:"cases",id:"cm",noms:["λ","u"],si:{rai:"mul"},large:true,aide:"Un réel λ et un vecteur u de F tels que λu n'est pas dans F."}],
    juge,etapes:Et,bonne:bonneTxt,bonneTxt,repBonne,repFausse:A.sev?{sev:"non",rai:"zero"}:{sev:"oui",rai:"homo"},nature:A.sev?"oui":"non, "+A.rai};}
function tireEq(R,n,hom){for(;;){const k=n===3&&R()<0.4?2:1,A=[];for(let i=0;i<k;i++)A.push(nulV(n).map(()=>R.ent(-5,5)));
  if(rangM(A)!==k||A.some(r=>{const z=r.filter(x=>x);return r[r.findIndex(x=>x)]<0||(z.length===1&&z[0]!==1)||(z.length===1&&R()<0.8)||Math.abs(z.reduce((g,x)=>{x=Math.abs(x);while(x){[g,x]=[x,g%x];}return g;},0))>1;}))continue;
  const b=hom?nulV(k):A.map(()=>R.ent(-4,4));if(!hom&&b.every(x=>!x))continue;return {n,k:"eq",A,b};}}
function tireDemi(R,n){for(;;){const c=nulV(n).map(()=>R.ent(-3,3)),z=c.filter(x=>x),p=c.findIndex(x=>x);
  if(!z.length||z.length>2||c[p]<0||(z.length===1&&c[p]!==1)||(z.length===2&&(Math.abs(z[0])===Math.abs(z[1])?Math.abs(z[0])!==1:z.every(x=>x%2===0)||z.every(x=>x%3===0))))continue;return {n,k:"demi",c,sens:R()<0.75?1:-1};}}
/* sorte : "lin" (pas de constante, un sev), "aff" (le vecteur nul n'est jamais atteint), "piege" (la constante est un multiple du vecteur : un sev) */
function tirePar(R,n,sorte){for(;;){const np=sorte==="piege"||n===2?1:R()<0.7?2:1;let a=nulV(n),D;
  if(sorte==="lin"){D=[];for(let j=0;j<np;j++)D.push(nulV(n).map(()=>R.ent(-3,3)));if(rangM(D)!==np)continue;}
  else if(sorte==="piege"){const d=nulV(n).map(()=>R.nz(-3,3)),k=R.choix([1,2,-1,-2,3]);if(d[0]<0)continue;D=[d];a=d.map(x=>k*x);if(a.some(x=>Math.abs(x)>6))continue;}
  else if(np===1){const d=nulV(n).map(()=>R.nz(-3,3)),t0=R.ent(-2,2),p=R.ent(0,n-1);a=d.map((x,i)=>i===p?-x*t0:R.ent(-3,3));D=[d];if(rangM([d,a])<2)continue;}
  else{const [i,j,k]=R.mel([0,1,2]),t0=R.choix([0,0,1,-1,2]),ga=R.choix([1,1,-1,2]),ep=R.ent(-3,3),ak=R.nz(-3,3);if(ak+ep*t0===0)continue;
    const d0=nulV(3),d1=nulV(3);d0[i]=R.choix([1,1,2,-1,3]);d0[j]=R.ent(-2,2);d0[k]=R.ent(-2,2);d1[j]=ga;d1[k]=ep;a[j]=-ga*t0;a[k]=ak;D=[d0,d1];}
  if(a.some((x,i)=>!x&&D.every(d=>!d[i])))continue;
  return {n,k:"par",a,D};}}
function tireNonLin(R,n){const [i,j]=R.mel(n===2?[0,1]:[0,1,2]),lo=Math.min(i,j),hi=Math.max(i,j),r=R();
  if(r<0.3)return {n,k:"prod",i:lo,j:hi,d:0};
  if(r<0.45)return {n,k:"prod",i:lo,j:hi,d:R.choix([1,2,-1,4])};
  if(r<0.6)return {n,k:"quadrant",i:lo,j:hi};
  if(r<0.85||n===3)return {n,k:"para",i,j,a:R.choix([1,1,2,-1,3,-2])};
  return R()<0.5?{n:2,k:"cercle",r:R.choix([1,4,2,9])}:{n:2,k:"carres"};}

/* AL8 (CC2) : inverser une matrice par la double matrice, (A | Iₙ) → (Iₙ | A⁻¹), comme aux CC2 de 2022 à 2024 */
const idn=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
const dblH=M=>{const c=M[0].length;return `<div class="mrow"><span class="mat" style="--n:${c}">${M.map(r=>r.map((x,j)=>`<span${j===c/2?' class="au"':""}>${nb(x)}</span>`).join("")).join("")}</span></div>`;};
const matH=M=>`<span class="mat" style="--n:${M[0].length}">${M.map(r=>r.map(x=>`<span>${nb(x)}</span>`).join("")).join("")}</span>`;
const coefL=k=>{k=q(k);return egal(k,1)?"":egal(k,-1)?"−":k.d===1?nb(k):(k.n<0?"−":"")+"("+nb(abs(k))+")";};
function doubleMat(A){const n=A.length,M=A.map((r,i)=>r.map(q).concat(idn(n)[i].map(q))),bas=[],haut=[],uns=[];let r=0;
  for(let j=0;j<n&&r<n;j++){let p=-1;for(let i=r;i<n;i++)if(!nul(M[i][j])){p=i;break;}
    if(p<0)continue;const ops=[];
    if(p!==r){[M[r],M[p]]=[M[p],M[r]];ops.push(`L_{${r+1}} ↔ L_{${p+1}}`);}
    for(let i=r+1;i<n;i++){if(nul(M[i][j]))continue;const m=div(M[i][j],M[r][j]);M[i]=M[i].map((x,t)=>sub(x,mul(m,M[r][t])));ops.push(ligne(i+1,m,r+1));}
    if(ops.length)bas.push({ops,M:M.map(x=>x.slice()),col:j});r++;}
  if(r<n)return {n,bas,rang:r,M};
  for(let i=0;i<n;i++)if(!egal(M[i][i],1)){const p=M[i][i];M[i]=M[i].map(x=>div(x,p));uns.push(`L_{${i+1}} ← ${coefL(div(1,p))}L_{${i+1}}`);}
  const apresUns=M.map(x=>x.slice());
  for(let j=n-1;j>0;j--){const ops=[];for(let i=0;i<j;i++){if(nul(M[i][j]))continue;const m=M[i][j];M[i]=M[i].map((x,t)=>sub(x,mul(m,M[j][t])));ops.push(ligne(i+1,m,j+1));}
    if(ops.length)haut.push({ops,M:M.map(x=>x.slice()),col:j});}
  return {n,bas,uns,apresUns,haut,rang:n,M,inv:M.map(l=>l.slice(n))};}
const detEnt=A=>A.length===2?A[0][0]*A[1][1]-A[0][1]*A[1][0]:A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])-A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])+A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0]);
const petiteInv=(J,h)=>[...J.bas.map(p=>p.M),J.apresUns||[],...J.haut.map(p=>p.M)].flat(2).every(x=>x.d===1&&Math.abs(x.n)<=Math.max(h,9))&&J.inv.flat().every(x=>x.d===1&&Math.abs(x.n)<=h);
function inv2(R){for(;;){const a=R.choix([1,-1]),c=R.ent(-6,6),b=R.ent(-6,6),dt=R.choix([1,-1]);
  const d=(dt+b*c)/a;if(Math.abs(d)>12||!b||!c)continue;
  const A=[[a,b],[c,d]];if(detEnt(A)!==dt)continue;const J=doubleMat(A);if(petiteInv(J,12))return A;}}
function invUnite(R){for(;;){const L=idn(3),U=idn(3);for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(j<i)L[i][j]=R.ent(-2,2);if(j>i)U[i][j]=R.ent(-3,3);}
  const A=prod(L,U),f=A.flat(),hors=[L[1][0],L[2][0],L[2][1],U[0][1],U[0][2],U[1][2]].filter(x=>x).length;
  if(hors<3||f.some(x=>Math.abs(x)>7))continue;const J=doubleMat(A);if(petiteInv(J,12))return A;}}
function invPiege(R){for(;;){const A=[0,1,2].map(()=>[0,1,2].map(()=>R.ent(-3,3))),dt=detEnt(A);if(dt!==1&&dt!==-1)continue;
  const J=doubleMat(A),ech=J.bas.some(p=>p.ops.some(o=>o.includes("↔"))),pv=J.uns.length>0;
  if((ech||pv)&&A.flat().filter(x=>!x).length<=3&&petiteInv(J,9))return A;}}
function invNon(R){for(;;){const u=[0,1,2].map(()=>R.ent(-3,3)),v=[0,1,2].map(()=>R.ent(-3,3)),a=R.choix([1,-1,2,1]),b=R.choix([1,-1,2,-2]);
  const w=u.map((x,i)=>a*x+b*v[i]);if(w.some(x=>Math.abs(x)>7)||u[0]*v[1]-u[1]*v[0]===0&&u[1]*v[2]-u[2]*v[1]===0&&u[0]*v[2]-u[2]*v[0]===0)continue;
  if([u,v,w].some(l=>l.every(x=>!x)))continue;const A=R.mel([u,v,w]);if(doubleMat(A).bas.every(p=>p.M.flat().every(x=>x.d===1&&Math.abs(x.n)<=12)))return A;}}
function inverser(A,o){o=o||{};const n=A.length,J=doubleMat(A),In=n===2?"I₂":"I₃",ok=J.rang===n,inv=ok?J.inv:null;
  const E=[{w:`On écrit la double matrice (A | ${In}) : ${dblH(A.map((r,i)=>r.concat(idn(n)[i])))}`,why:`À gauche A, à droite ${In}. Chaque opération sur les lignes se fait sur la ligne entière, des deux côtés du trait.`,pts:1}];
  J.bas.forEach((p,k)=>E.push({w:`${p.ops.map(fx).join(" ; ")}${dblH(p.M)}`,why:p.ops.every(x=>x.includes("↔"))?`On descend comme dans le pivot de Gauss. Le pivot de la colonne ${p.col+1} serait 0 : on échange deux lignes. Sous le nouveau pivot, il y a déjà des zéros.`:k===0?`On descend comme dans le pivot de Gauss : sous le pivot de la colonne ${p.col+1}, on met des zéros${p.ops.some(x=>x.includes("↔"))?", après avoir échangé deux lignes pour avoir un pivot non nul":""}.`:`Même chose sous le pivot de la colonne ${p.col+1}${p.ops.some(x=>x.includes("↔"))?", après un échange de lignes":""}.`,pts:1}));
  const iBas=E.length-1;
  if(!ok)E.push({w:`<b>La ligne ${J.rang+1} est nulle à gauche du trait : A n'est pas inversible.</b>`,why:`À gauche, il reste une ligne de zéros : on ne pourra jamais obtenir ${In}. Une matrice carrée est inversible si et seulement si la descente donne un pivot dans chaque colonne (ici ${J.rang} pivots pour ${n} colonnes).`,pts:1});
  else{if(J.uns.length)E.push({w:`${J.uns.map(fx).join(" ; ")}${dblH(J.apresUns)}`,why:`On divise chaque ligne par son pivot pour avoir des 1 sur la diagonale. Toujours sur la ligne entière.`,pts:1});
    J.haut.forEach(p=>E.push({w:`${p.ops.map(fx).join(" ; ")}${dblH(p.M)}`,why:`On remonte : avec le 1 de la ligne ${p.col+1}, on met des zéros au-dessus de lui, dans la colonne ${p.col+1}.`,pts:1}));
    const v0=A[0].map((x,k)=>`${par(x)} × ${par(inv[k][0])}`).join(" + ");
    E.push({w:`<b>A est inversible et A⁻¹ = ${matH(inv)}</b>`,why:`À gauche on lit ${In}, donc à droite on lit A⁻¹. Vérification au brouillon : la ligne 1 de A fois la colonne 1 de A⁻¹ donne ${v0} = 1.`,pts:1});}
  const iFin=E.length-1,noms=A.map((_,i)=>"l"+(i+1)),txt=x=>nb(x).replace(/−/g,"-"),rangee=l=>"("+l.map(txt).join(", ")+")";
  function juge(rep){
    if(o.choix){if(!rep.inv)return {incomplet:"Choisis d'abord : A est inversible, ou pas."};
      if(!ok&&rep.inv==="non")return {ok:true};
      if(!ok)return {ok:false,faux:["inv"],resume:"Non : A n'est pas inversible.",diag:{etape:iBas+1,type:"ligne nulle non vue",titre:"Où ça part : la fin de la descente.",msg:`Après la descente, une ligne est nulle à gauche du trait : il n'y a que ${J.rang} pivots pour ${n} colonnes. Les lignes de A sont liées : l'une est une combinaison des deux autres.`}};
      if(rep.inv==="non")return {ok:false,faux:["inv"],resume:"Non : A est inversible.",diag:{etape:iBas,type:"inversible lue comme non inversible",titre:"Où ça part : la descente.",msg:`La descente donne un pivot dans chacune des ${n} colonnes, donc A est inversible. Si tu as trouvé une ligne de zéros, refais le calcul de la dernière opération.`}};}
    const X=noms.map(k=>liste(rep[k],n));
    if(X.some(l=>!l))return {incomplet:`Écris les ${n} lignes de A⁻¹, chacune avec ${n} nombres, par exemple (${[1,-2,0].slice(0,n).join(", ")}). Les fractions s'écrivent 1/2.`};
    const F=noms.filter((_,i)=>X[i].some((x,j)=>!egal(x,inv[i][j])));if(!F.length)return {ok:true};
    const res=`Pas tout à fait : ${F.length>1?"les lignes":"la ligne"} ${et(F.map(k=>k.slice(1)))} ${F.length>1?"sont fausses":"est fausse"}.`;
    if(X.every((l,i)=>l.every((x,j)=>egal(x,inv[j][i]))))return {ok:false,faux:noms,resume:res,diag:{etape:iFin,type:"lignes et colonnes inversées",titre:"Où ça part : la lecture du résultat.",msg:"Tu as écrit les colonnes de A⁻¹ à la place de ses lignes. Lis la partie droite ligne par ligne."}};
    if(F.every(k=>{const i=+k.slice(1)-1;return X[i].every((x,j)=>egal(x,sub(0,inv[i][j])));}))return {ok:false,faux:F,resume:res,diag:{etape:J.uns.length?iBas+1:iFin,type:"signe d'une ligne",titre:"Où ça part : le signe d'une ligne.",msg:`${F.length>1?"Ces lignes ont":"Cette ligne a"} tous les signes inversés. As-tu oublié de diviser par un pivot égal à −1 ?`}};
    const P=A.map(r=>X[0].map((_,j)=>r.reduce((s,x,k)=>add(s,mul(x,X[k][j])),Q(0))));let ii=0,jj=0;
    outer:for(ii=0;ii<n;ii++)for(jj=0;jj<n;jj++)if(!egal(P[ii][jj],+(ii===jj)))break outer;
    return {ok:false,faux:F,resume:res,diag:{etape:iBas,type:"calcul dans la double matrice",titre:"Vérifie ta réponse avec A.",msg:`La ligne ${ii+1} de A fois la colonne ${jj+1} de ta matrice donne ${nb(P[ii][jj])}, alors qu'il faut ${ii===jj?1:0} (le produit A × A⁻¹ doit donner ${In}). Refais une à une les opérations, sur toute la ligne, des deux côtés du trait.`}};}
  const champs=[];if(o.choix)champs.push({k:"choix",id:"inv",o:[["oui","A est inversible"],["non","A n'est pas inversible"]]});
  noms.forEach((k,i)=>champs.push({k:"champ",id:k,nom:"ligne "+(i+1),si:o.choix?{inv:"oui"}:undefined,label:`Ligne ${i+1} de A⁻¹ :`,ex:`par exemple (${[1,-2,0].slice(0,n).join(", ")})`}));
  if(o.choix)champs.forEach(c=>{if(!c.si)delete c.si;});else champs.forEach(c=>delete c.si);
  const repBonne=ok?Object.fromEntries(noms.map((k,i)=>[k,rangee(inv[i])])):{},repFausse=ok?Object.fromEntries(noms.map((k,i)=>[k,rangee(i?inv[i]:inv[i].map((x,j)=>j?x:add(x,1)))])):{};
  if(o.choix){repBonne.inv=ok?"oui":"non";repFausse.inv=ok?"non":"oui";}
  const guide=o.guide?`<p>Fais dans l'ordre, sur la double matrice (A | ${In}) : ${[...J.bas.flatMap(p=>p.ops),...J.uns,...J.haut.flatMap(p=>p.ops)].map(x=>`$${x}$`).join(", puis ")}.</p>`:"";
  return {sig:"IV"+JSON.stringify(A),q:o.choix?`La matrice A est-elle inversible ? Si oui, calcule A⁻¹ par la méthode de la double matrice.`:o.guide?`Calcule l'inverse de A par la méthode de la double matrice, en suivant les opérations données.`:`Montre que A est inversible et calcule A⁻¹ par la méthode de la double matrice.`,
    corps:`<p>$A =$ ${matH(A)}</p>${guide}`,texte:`A = ${JSON.stringify(A)}${o.choix?" ; inversible ? si oui, A⁻¹":" ; calculer A⁻¹"}`,
    champs,juge,etapes:E,bonne:ok?`A⁻¹ = ${matH(inv)}`:"A n'est pas inversible",bonneTxt:ok?"A⁻¹ = "+inv.map(rangee).join(" ; "):"A n'est pas inversible",
    repBonne,repFausse,nature:ok?"inv":"non",ens:{A,inv:ok?inv.map(l=>l.map(x=>[x.n,x.d])):null}};}

/* ---------- AL9 : produit de matrices ---------- */
const matAlea=(R,n,p,h,z)=>{for(;;){const M=Array.from({length:n},()=>Array.from({length:p},()=>R()<z?0:R.ent(-h,h)));if(M.every(l=>l.some(x=>x))&&M[0].every((_,j)=>M.some(l=>l[j])))return M;}};
const plu=(k,m)=>k+" "+m+(k>1?"s":"");
const tailleH=(X,M)=>`${X} a ${plu(M.length,"ligne")} et ${plu(M[0].length,"colonne")} : ${X} ∈ M<sub>${M.length},${M[0].length}</sub>(ℝ)`;
const tailleLue=s=>{s=String(s==null?"":s).trim().toLowerCase();if(!s)return null;const m=s.match(/\d+/g);if(!m&&/non|pas|impossible|aucun|existe|∅/.test(s))return "non";return m&&m.length===2?[+m[0],+m[1]]:null;};
const tailleT=d=>d==="non"?"non défini":`${d[0]} × ${d[1]}`;
const rangeeT=l=>"("+l.map(x=>nb(x).replace(/−/g,"-")).join(", ")+")";
const lignesLues=(rep,pre,n,k)=>{const X=[];for(let i=0;i<n;i++){const l=liste(rep[pre+(i+1)],k);if(!l)return null;X.push(l);}return X;};
const egalM=(X,C)=>X.length===C.length&&X.every((l,i)=>l.length===C[i].length&&l.every((x,j)=>egal(x,C[i][j])));
const premierFaux=(X,C)=>{for(let i=0;i<C.length;i++)for(let j=0;j<C[0].length;j++)if(!egal(X[i][j],C[i][j]))return [i,j];return null;};
const sommeH=(A,B,i,j)=>A[i].map((x,t)=>`${par(x)} × ${par(B[t][j])}`).join(" + ");
const lignesProduit=(A,B,X,g=X[0],d=X[1])=>{const C=prod(A,B);return A.map((l,i)=>({w:`Ligne ${i+1} de ${X} :<br>${C[0].map((_,j)=>`(${X})<sub>${i+1}${j+1}</sub> = ${sommeH(A,B,i,j)} = ${nb(C[i][j])}`).join("<br>")}`,
  why:i?`Même chose avec la ligne ${i+1} de ${g}, fois chaque colonne de ${d}.`:`On multiplie la ligne 1 de ${g} par chaque colonne de ${d} : premier terme fois premier terme, deuxième fois deuxième, et ainsi de suite, puis on additionne. La colonne 1 de ${d} donne le coefficient de la colonne 1, et ainsi de suite.`,pts:1}));};
const etapeTaille=(X,Y,MX,MY)=>{const c=MX[0].length,l=MY.length;return c===l
  ?{w:`${X} a ${plu(c,"colonne")} et ${Y} a ${plu(l,"ligne")} : c'est le même nombre, donc <b>${X}${Y} est défini, de taille ${MX.length} × ${MY[0].length}</b>.`,why:`Pour ${X}${Y}, on multiplie chaque ligne de ${X} par chaque colonne de ${Y} : il faut que ${X} ait autant de colonnes que ${Y} a de lignes. Le résultat garde les lignes de ${X} (${MX.length}) et les colonnes de ${Y} (${MY[0].length}).`,pts:1}
  :{w:`${X} a ${plu(c,"colonne")} et ${Y} a ${plu(l,"ligne")} : ${c} ≠ ${l}, donc <b>${X}${Y} n'est pas défini</b>.`,why:`Une ligne de ${X} a ${c} terme${c>1?"s":""}, une colonne de ${Y} en a ${l} : on ne peut pas les multiplier terme à terme.`,pts:1};};
function tailleProduit(R){const cas=R.choix(["deux","AB","BA","AB","BA","aucun"]);let n,p,r,s;
  for(;;){[n,p,r,s]=[0,0,0,0].map(()=>R.ent(1,4));const ab=p===r,ba=s===n;
    if(n*p>1&&r*s>1&&n*p<=12&&r*s<=12&&!(n===p&&p===r&&r===s)&&cas===(ab&&ba?"deux":ab?"AB":ba?"BA":"aucun"))break;}
  const A=matAlea(R,n,p,5,.2),B=matAlea(R,r,s,5,.2),dAB=p===r?[n,s]:"non",dBA=s===n?[r,p]:"non";
  const E=[{w:`${tailleH("A",A)} ;<br>${tailleH("B",B)}.`,why:`On compte d'abord les lignes, puis les colonnes : une taille s'écrit toujours lignes × colonnes.`,pts:1},etapeTaille("A","B",A,B),etapeTaille("B","A",B,A)];
  function juge(rep){const a=tailleLue(rep.ab),b=tailleLue(rep.ba);if(!a||!b)return {incomplet:"Pour AB et pour BA, écris la taille (par exemple 2 × 3), ou « non défini »."};
    const bon=(x,d)=>x==="non"?d==="non":d!=="non"&&x[0]===d[0]&&x[1]===d[1],F=[];if(!bon(a,dAB))F.push("ab");if(!bon(b,dBA))F.push("ba");if(!F.length)return {ok:true};
    const k=F[0],x=k==="ab"?a:b,d=k==="ab"?dAB:dBA,[X,Y,MX,MY]=k==="ab"?["A","B",A,B]:["B","A",B,A],c=MX[0].length,l=MY.length,et2=k==="ab"?1:2,P=X+Y;
    const resume=F.length>1?"Pas tout à fait : les deux réponses sont fausses.":`Pas tout à fait : la réponse pour ${P} est fausse.`;
    if(d==="non")return {ok:false,faux:F,resume,diag:{etape:et2,type:"produit non défini lu comme défini",titre:`Où ça part : la condition pour ${P}.`,msg:`${P} n'existe que si ${X} a autant de colonnes que ${Y} a de lignes. Ici ${X} a ${plu(c,"colonne")} et ${Y} a ${plu(l,"ligne")} : ${P} n'est pas défini.`}};
    if(x==="non")return {ok:false,faux:F,resume,diag:{etape:et2,type:"produit défini lu comme non défini",titre:`Où ça part : la condition pour ${P}.`,msg:`${X} a ${plu(c,"colonne")} et ${Y} a ${plu(l,"ligne")} : c'est le même nombre, donc ${P} existe. On compare les colonnes de la matrice de gauche aux lignes de celle de droite.`}};
    if(x[0]===d[1]&&x[1]===d[0])return {ok:false,faux:F,resume,diag:{etape:et2,type:"lignes et colonnes inversées",titre:`Où ça part : la taille de ${P}.`,msg:`${P} a autant de lignes que ${X} (${d[0]}) et autant de colonnes que ${Y} (${d[1]}) : c'est ${d[0]} × ${d[1]}. Les lignes s'écrivent toujours en premier.`}};
    return {ok:false,faux:F,resume,diag:{etape:et2,type:"taille du produit",titre:`Où ça part : la taille de ${P}.`,msg:`${P} garde les lignes de ${X} et les colonnes de ${Y} : ${d[0]} × ${d[1]}. Le nombre commun (${c}) disparaît.`}};}
  const repFausse={ab:dAB==="non"?`${n} × ${s}`:dAB[0]!==dAB[1]?`${dAB[1]} × ${dAB[0]}`:"non défini",ba:tailleT(dBA)};
  return {sig:"PT"+JSON.stringify([A,B]),q:`Les produits AB et BA sont-ils définis ? Si oui, donne leur taille.`,corps:`<p>$A =$ ${matH(A)}</p><p>$B =$ ${matH(B)}</p>`,texte:`A = ${JSON.stringify(A)}, B = ${JSON.stringify(B)} ; AB et BA définis ? taille ?`,
    champs:[{k:"champ",id:"ab",nom:"taille de AB",label:"AB :",ex:"par exemple 2 × 3, ou non défini"},{k:"champ",id:"ba",nom:"taille de BA",label:"BA :",ex:"par exemple 2 × 3, ou non défini"}],
    juge,etapes:E,bonne:`AB : ${tailleT(dAB)} ; BA : ${tailleT(dBA)}`,bonneTxt:`AB : ${tailleT(dAB)} ; BA : ${tailleT(dBA)}`,repBonne:{ab:tailleT(dAB),ba:tailleT(dBA)},repFausse,nature:dAB==="non"?(dBA==="non"?"aucun":"BA"):dBA==="non"?"AB":"deux",ens:{k:"taille",A,B,ab:dAB,ba:dBA}};}
function coefProduit(R){for(;;){const n=R.ent(2,3),m=R.ent(2,3),k=R.ent(2,3),A=matAlea(R,n,m,4,.15),B=matAlea(R,m,k,4,.15),i=R.ent(0,n-1),j=R.ent(0,k-1),C=prod(A,B),c=C[i][j];
  if(Math.abs(c)>25)continue;
  const Li=A[i],Cj=B.map(l=>l[j]),nom=`(AB)<sub>${i+1}${j+1}</sub>`,alt=[];
  if(j<n&&i<k&&C[j][i]!==c)alt.push([C[j][i],"ligne et colonne échangées",`Tu as calculé (AB)<sub>${j+1}${i+1}</sub>, avec la ligne ${j+1} de A et la colonne ${i+1} de B. Le premier indice donne la ligne, le second la colonne.`]);
  if(k===n&&i<m&&j<m){const v=B[i].reduce((s,x,t)=>s+x*A[t][j],0);if(v!==c)alt.push([v,"BA au lieu de AB",`Tu as calculé (BA)<sub>${i+1}${j+1}</sub> : la ligne ${i+1} de B fois la colonne ${j+1} de A. Pour AB, la ligne vient de A et la colonne vient de B.`]);}
  if(k===m&&j<m){const v=Li.reduce((s,x,t)=>s+x*B[j][t],0);if(v!==c)alt.push([v,"ligne fois ligne",`Tu as multiplié la ligne ${i+1} de A par la ligne ${j+1} de B. Il faut la colonne ${j+1} de B, lue de haut en bas : ${vt(Cj)}.`]);}
  if(n===m&&i<m){const v=A.reduce((s,l,t)=>s+l[i]*B[t][j],0);if(v!==c)alt.push([v,"colonne fois colonne",`Tu as multiplié la colonne ${i+1} de A par la colonne ${j+1} de B. Il faut la ligne ${i+1} de A, lue de gauche à droite : ${vt(Li)}.`]);}
  const E=[{w:`On prend la ligne ${i+1} de A, ${vt(Li)}, et la colonne ${j+1} de B, ${vt(Cj)}.`,why:`Le coefficient de la ligne ${i+1} et de la colonne ${j+1} de AB vient de la ligne ${i+1} de A et de la colonne ${j+1} de B. Elles ont autant de termes l'une que l'autre, car A a autant de colonnes que B a de lignes.`,pts:1},
    {w:`<b>${nom} = ${sommeH(A,B,i,j)} = ${nb(c)}</b>`,why:`Premier terme fois premier terme, deuxième fois deuxième, et ainsi de suite, puis on additionne. Attention aux signes.`,pts:1}];
  function juge(rep){const x=nombre(rep.c);if(!x)return {incomplet:"Écris un seul nombre, par exemple −4."};if(egal(x,c))return {ok:true};
    const a=alt.find(v=>egal(x,v[0]));
    if(a)return {ok:false,faux:["c"],resume:"Pas tout à fait : ce n'est pas ce coefficient.",diag:{etape:0,type:a[1],titre:"Où ça part : la ligne et la colonne choisies.",msg:a[2]}};
    return {ok:false,faux:["c"],resume:"Pas tout à fait : le calcul est faux.",diag:{etape:1,type:"calcul du coefficient",titre:"Où ça part : les produits et la somme.",msg:`${nom} = ${sommeH(A,B,i,j)} = ${nb(c)}. Refais chaque produit, puis la somme, en surveillant les signes.`}};}
  return {sig:"PC"+JSON.stringify([A,B,i,j]),q:`Calcule le coefficient ${nom} de la matrice AB : celui de la ligne ${i+1} et de la colonne ${j+1}.`,corps:`<p>$A =$ ${matH(A)}</p><p>$B =$ ${matH(B)}</p>`,texte:`A = ${JSON.stringify(A)}, B = ${JSON.stringify(B)} ; calculer (AB)${i+1}${j+1}`,
    champs:[{k:"champ",id:"c",nom:"coefficient",label:`${nom} =`,ex:"par exemple −4"}],juge,etapes:E,bonne:`${nom} = ${nb(c)}`,bonneTxt:`(AB)${i+1}${j+1} = ${nb(c)}`,repBonne:{c:nb(c).replace(/−/g,"-")},repFausse:{c:String(c+1)},nature:"coef",ens:{k:"coef",A,B,i,j,c}};}}
function produitEntier(R){for(;;){const [n,m,k]=R.choix([[2,2,2],[2,3,2],[2,3,2],[3,2,2],[2,2,3],[3,3,3],[3,2,3]]),h=n*m*k>12?2:3,A=matAlea(R,n,m,h,.2),B=matAlea(R,m,k,h,.2),C=prod(A,B);
  if(C.flat().some(x=>Math.abs(x)>15)||C.flat().filter(x=>x).length<2)continue;
  const BA=k===n&&m===n?prod(B,A):null,E=lignesProduit(A,B,"AB"),noms=C.map((_,i)=>"l"+(i+1)),ex=`par exemple (${[1,-2,0].slice(0,k).join(", ")})`;
  E.push({w:`<b>AB = ${matH(C)}</b>`,why:`AB a ${plu(n,"ligne")}, comme A, et ${plu(k,"colonne")}, comme B.`,pts:1});
  function juge(rep){const X=lignesLues(rep,"l",n,k);if(!X)return {incomplet:`Écris les ${n} lignes de AB, chacune avec ${k} nombres, ${ex}.`};
    const f=premierFaux(X,C);if(!f)return {ok:true};
    const F=noms.filter((_,i)=>X[i].some((x,j)=>!egal(x,C[i][j]))),resume=`Pas tout à fait : ${F.length>1?"les lignes":"la ligne"} ${et(F.map(s=>s.slice(1)))} ${F.length>1?"sont fausses":"est fausse"}.`;
    if(BA&&JSON.stringify(BA)!==JSON.stringify(C)&&egalM(X,BA))return {ok:false,faux:noms,resume,diag:{etape:0,type:"BA au lieu de AB",titre:"Où ça part : l'ordre des matrices.",msg:"Tu as calculé BA : les lignes de B fois les colonnes de A. Pour AB, on prend les lignes de A et les colonnes de B. L'ordre compte : en général AB ≠ BA."}};
    if(n===k&&egalM(X,C[0].map((_,j)=>C.map(l=>l[j]))))return {ok:false,faux:noms,resume,diag:{etape:E.length-1,type:"lignes et colonnes inversées",titre:"Où ça part : l'écriture du résultat.",msg:"Tes nombres sont justes, mais tu as écrit les colonnes de AB à la place de ses lignes. La ligne i de AB vient de la ligne i de A."}};
    const [i,j]=f;return {ok:false,faux:F,resume,diag:{etape:i,type:"calcul d'un coefficient",titre:`Où ça part : la ligne ${i+1}.`,msg:`(AB)<sub>${i+1}${j+1}</sub> : ligne ${i+1} de A fois colonne ${j+1} de B, ${sommeH(A,B,i,j)} = ${nb(C[i][j])}.`}};}
  return {sig:"PE"+JSON.stringify([A,B]),q:`Calcule le produit AB.`,corps:`<p>$A =$ ${matH(A)}</p><p>$B =$ ${matH(B)}</p>`,texte:`A = ${JSON.stringify(A)}, B = ${JSON.stringify(B)} ; calculer AB`,
    champs:noms.map((s,i)=>({k:"champ",id:s,nom:"ligne "+(i+1),label:`Ligne ${i+1} de AB :`,ex})),juge,etapes:E,bonne:`AB = ${matH(C)}`,bonneTxt:"AB = "+C.map(rangeeT).join(" ; "),
    repBonne:Object.fromEntries(noms.map((s,i)=>[s,rangeeT(C[i])])),repFausse:Object.fromEntries(noms.map((s,i)=>[s,rangeeT(i?C[i]:C[i].map((x,j)=>j?x:x+1))])),nature:n===m&&m===k?"carree":"rect",ens:{k:"prod",A,B,C}};}}
function abBa(R){for(;;){const n=R()<0.6?2:3,h=n===2?3:2,z=n===2?.1:.35,A=matAlea(R,n,n,h,z);let B,rel=null;
  if(R()<0.3){const al=R.choix([1,-1,2]),be=R.choix([-2,-1,1,2]);B=A.map((l,i)=>l.map((x,j)=>al*x+(i===j?be:0)));rel=[al,be];if(B.flat().some(x=>Math.abs(x)>4))continue;}
  else B=matAlea(R,n,n,h,z);
  const C=prod(A,B),D=prod(B,A),com=JSON.stringify(C)===JSON.stringify(D);
  if([...C.flat(),...D.flat()].some(x=>Math.abs(x)>15)||JSON.stringify(A)===JSON.stringify(B))continue;
  const nA=C.map((_,i)=>"p"+(i+1)),nB=C.map((_,i)=>"q"+(i+1)),ex=`par exemple (${[1,-2,0].slice(0,n).join(", ")})`,iC=2*n+2;
  let dif=null;if(!com)outer:for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(C[i][j]!==D[i][j]){dif=[i,j];break outer;}
  const E=[...lignesProduit(A,B,"AB"),{w:`<b>AB = ${matH(C)}</b>`,why:`On range les coefficients ligne par ligne.`,pts:1},...lignesProduit(B,A,"BA"),{w:`<b>BA = ${matH(D)}</b>`,why:`Cette fois, ce sont les lignes de B fois les colonnes de A.`,pts:1},
    com?{w:`<b>AB = BA</b> : tous les coefficients sont égaux. On dit que A et B commutent.`,why:rel?`Ce n'est pas un hasard : ici B = ${comb([rel[0],rel[1]],["A","I"+(n===2?"₂":"₃")])}, et A commute avec A et avec I. En général, AB ≠ BA : il faut toujours vérifier.`:`C'est rare : en général AB ≠ BA, il faut toujours vérifier.`,pts:1}
      :{w:`<b>AB ≠ BA</b> : par exemple (AB)<sub>${dif[0]+1}${dif[1]+1}</sub> = ${nb(C[dif[0]][dif[1]])} alors que (BA)<sub>${dif[0]+1}${dif[1]+1}</sub> = ${nb(D[dif[0]][dif[1]])}.`,why:`Un seul coefficient différent suffit. Le produit de matrices n'est pas commutatif : l'ordre des facteurs compte.`,pts:1}];
  function juge(rep){const X=lignesLues(rep,"p",n,n),Y=lignesLues(rep,"q",n,n);
    if(!X||!Y)return {incomplet:`Écris les ${n} lignes de AB et les ${n} lignes de BA, chacune avec ${n} nombres, ${ex}.`};
    if(!rep.com)return {incomplet:"Choisis enfin : AB = BA, ou AB ≠ BA."};
    const FA=nA.filter((_,i)=>X[i].some((x,j)=>!egal(x,C[i][j]))),FB=nB.filter((_,i)=>Y[i].some((x,j)=>!egal(x,D[i][j]))),okCom=(rep.com==="oui")===com;
    if(!FA.length&&!FB.length&&okCom)return {ok:true};
    if(!com&&egalM(X,D)&&egalM(Y,C))return {ok:false,faux:nA.concat(nB),resume:"Pas tout à fait : AB et BA sont échangés.",diag:{etape:0,type:"ordre inversé (AB et BA échangés)",titre:"Où ça part : l'ordre des matrices.",msg:"Tes deux matrices sont justes, mais échangées. AB, ce sont les lignes de A fois les colonnes de B ; BA, les lignes de B fois les colonnes de A."}};
    if(!FA.length&&!FB.length)return {ok:false,faux:["com"],resume:com?"Non : ici AB = BA.":"Non : AB ≠ BA.",diag:{etape:iC,type:"comparaison de AB et BA",titre:"Où ça part : la comparaison.",msg:com?"Tes deux produits sont justes, et tous leurs coefficients sont égaux : AB = BA.":"Tes deux produits sont justes, et ils ont au moins un coefficient différent : AB ≠ BA."}};
    const resume=`Pas tout à fait : ${FA.length&&FB.length?"il y a des erreurs dans AB et dans BA":"il y a une erreur dans "+(FA.length?"AB":"BA")}.`;
    const [P,M,N,G,H,dec]=FA.length?["AB",X,C,A,B,0]:["BA",Y,D,B,A,n+1],[i,j]=premierFaux(M,N);
    return {ok:false,faux:FA.concat(FB),resume,diag:{etape:dec+i,type:"calcul d'un coefficient",titre:`Où ça part : la ligne ${i+1} de ${P}.`,msg:`(${P})<sub>${i+1}${j+1}</sub> : ligne ${i+1} de ${P[0]} fois colonne ${j+1} de ${P[1]}, ${sommeH(G,H,i,j)} = ${nb(N[i][j])}.`}};}
  const champs=[...nA.map((s,i)=>({k:"champ",id:s,nom:"ligne "+(i+1)+" de AB",label:`Ligne ${i+1} de AB :`,ex})),...nB.map((s,i)=>({k:"champ",id:s,nom:"ligne "+(i+1)+" de BA",label:`Ligne ${i+1} de BA :`,ex})),{k:"choix",id:"com",titre:"Enfin :",o:[["oui","AB = BA"],["non","AB ≠ BA"]]}];
  const repBonne=Object.assign(Object.fromEntries(nA.map((s,i)=>[s,rangeeT(C[i])])),Object.fromEntries(nB.map((s,i)=>[s,rangeeT(D[i])])),{com:com?"oui":"non"});
  const repFausse=com?Object.assign({},repBonne,{com:"non"}):Object.assign(Object.fromEntries(nA.map((s,i)=>[s,rangeeT(D[i])])),Object.fromEntries(nB.map((s,i)=>[s,rangeeT(C[i])])),{com:"non"});
  return {sig:"AB"+JSON.stringify([A,B]),q:`Calcule AB et BA. Est-ce que AB = BA ?`,corps:`<p>$A =$ ${matH(A)}</p><p>$B =$ ${matH(B)}</p>`,texte:`A = ${JSON.stringify(A)}, B = ${JSON.stringify(B)} ; calculer AB et BA, AB = BA ?`,
    champs,juge,etapes:E,bonne:`AB = ${matH(C)}, BA = ${matH(D)}, ${com?"AB = BA":"AB ≠ BA"}`,bonneTxt:`AB = ${C.map(rangeeT).join(" ; ")} ; BA = ${D.map(rangeeT).join(" ; ")} ; ${com?"AB = BA":"AB ≠ BA"}`,
    repBonne,repFausse,nature:com?"commutent":"differents",ens:{k:"deux",A,B,C,D,com}};}}

/* ---------- AL10 : inverse grâce à une relation ---------- */
const nomI=n=>n===2?"I₂":"I₃";
const coefsLus=(rep,ids)=>{const X=ids.map(k=>nombre(rep[k]));return X.some(x=>!x)?null:X;};
const puis=["I","A","A²","A³"];
/* relation c[0]A^d + … + c[d]I = 0, écrite comme dans le poly ; avec c[d] ≠ 0, A⁻¹ = −(c[0]A^(d−1) + … + c[d−1]I)/c[d] */
const polyT=(c,I)=>comb(c,c.map((_,i)=>i===c.length-1?I:puis[c.length-1-i]));
const invRel=c=>c.slice(0,-1).map(x=>div(Q(-x),Q(c[c.length-1])));
const fracE=x=>[q(x).n,q(x).d];
function etapesRel(c,I,sansIso){const d=c[c.length-1],X=invRel(c),fac=polyT(c.slice(0,-1),I),dr=comb([-d],[I]),E=[];
  if(!sansIso)E.push({w:`On isole le terme en ${I} : ${polyT(c.slice(0,-1).concat([0]),I)} = ${dr}.`,why:`Le terme en ${I} passe de l'autre côté du signe égal, et change de signe.`,pts:1});
  const iFact=E.length;E.push({w:`On met A en facteur à gauche : A(${fac}) = ${dr}.`,why:`Chaque terme commence par A : A² = A × A, A³ = A × A², et A = A × ${I}. Devant le dernier terme, on garde ${I} : « A + 3 » n'a pas de sens, on n'ajoute pas un nombre à une matrice.`,pts:1});
  if(d!==-1)E.push({w:`On divise par ${nb(-d)} : A(${polyT(X,I)}) = ${I}.`,why:`Diviser une matrice par un nombre, c'est diviser chacun de ses coefficients. À droite, il reste ${I}.`,pts:1});
  const iDiv=E.length-1;E.push({w:`<b>A est inversible et A⁻¹ = ${polyT(X,I)}</b>.`,why:`On a trouvé une matrice B telle que AB = ${I}. Pour une matrice carrée, cela suffit : A est inversible et A⁻¹ = B. Ici B s'écrit avec A et ${I}, qui commutent avec A, donc BA = ${I} aussi.`,pts:1});
  return {E,X,iFact,iDiv,iFin:E.length-1};}
/* juge les coefficients de A⁻¹ ; o.dec : numéro de la première étape de la relation dans la correction */
function jugeRel(rep,o){const ids=o.ids,Y=coefsLus(rep,ids),S=o.S;if(!Y)return {incomplet:`Écris ${et(o.noms)} : ${ids.length} nombres, par exemple −1/2, 3${ids.length>2?" et 0":""}.`};
  const F=ids.filter((_,i)=>!egal(Y[i],S.X[i]));if(!F.length)return {ok:true};
  const d=o.c[o.c.length-1],fac=`A(${polyT(o.c.slice(0,-1),o.I)}) = ${comb([-d],[o.I])}`,resume=`Pas tout à fait : ${et(F.map(k=>o.noms[ids.indexOf(k)]))} ${F.length>1?"sont faux":"est faux"}.`,r=(etape,type,titre,msg)=>({ok:false,faux:F,resume,diag:{etape:o.dec+etape,type,titre,msg}});
  if(o.bin&&Y.slice(1).every(y=>egal(y,0)))return r(0,"développement incomplet","Où ça part : le développement.",`(${comb([1,o.bin],["A",o.I])})³ n'est pas A³ ${o.bin>0?"+":"−"} ${nb(Math.abs(o.bin**3))}${o.I} : comme pour (a + b)³, il y a aussi les termes 3a²b et 3ab², ici ${comb([3*o.bin],["A²"])} et ${comb([3*o.bin*o.bin],["A"])}.`);
  if(Y.every((y,i)=>egal(y,sub(0,S.X[i]))))return r(S.iFact,"signe en changeant de côté","Où ça part : le terme qui change de côté.",`Tous tes signes sont inversés. ${comb([d],[o.I])} passe de l'autre côté et devient ${comb([-d],[o.I])} : ${fac}.`);
  if(Math.abs(d)!==1&&(Y.every((y,i)=>egal(y,o.c[i]))||Y.every((y,i)=>egal(y,-o.c[i]))))return r(S.iDiv,"division oubliée","Où ça part : la division.",`Ton calcul s'arrête à ${fac}. Il reste à diviser par ${nb(-d)} pour avoir ${o.I} à droite.`);
  if(ids.length===2&&egal(Y[0],S.X[1])&&egal(Y[1],S.X[0]))return r(S.iFin,"α et β échangés","Où ça part : la lecture du résultat.",`α est le nombre devant A, β celui devant ${o.I}.`);
  return r(S.iFin,"calcul de A⁻¹","Où ça part : la fin du calcul.",`${fac}, donc A⁻¹ = ${polyT(S.X,o.I)} : on divise chaque coefficient par ${nb(-d)}.`);}
const champsRel=ids=>ids.map((k,i)=>({k:"champ",id:k,nom:["α","β","γ"][i],label:["α","β","γ"][i]+" =",ex:["par exemple −1/2","par exemple 3","par exemple 0"][i]}));
function relationDonnee(R){const n=R.choix([2,3]),I=nomI(n),forme=R.ent(0,1),a=forme?R.choix([1,1,1,2]):R.choix([1,1,1,2,-1]),p=R.choix([-5,-4,-3,-2,-1,0,1,2,3,4,5]),d=R.choix([-6,-5,-4,-3,-2,-1,1,2,3,4,6]),c=[a,p,d];
  const rel=forme?`${comb([a],["A²"])} = ${comb([-p,-d],["A",I])}`:`${polyT(c,I)} = 0`,S=etapesRel(c,I),pre=forme?[{w:`On met tout du même côté : ${polyT(c,I)} = 0.`,why:`Ce qui change de côté change de signe.`,pts:1}]:[],ids=["al","be"];
  return {sig:"RD"+JSON.stringify([n,c,forme]),q:`Une matrice carrée A de taille ${n} × ${n} vérifie ${rel}. Montre que A est inversible, et écris A⁻¹ sous la forme αA + β${I} : que valent α et β ?`,corps:"",texte:`A vérifie ${rel} ; A⁻¹ = αA + β${I}, α et β ?`,
    champs:champsRel(ids),juge:rep=>jugeRel(rep,{ids,noms:["α","β"],S,c,I,dec:pre.length}),etapes:pre.concat(S.E),bonne:`A⁻¹ = ${polyT(S.X,I)} : α = ${nb(S.X[0])} et β = ${nb(S.X[1])}`,bonneTxt:`A⁻¹ = ${polyT(S.X,I)}`,
    repBonne:{al:brut(S.X[0]),be:brut(S.X[1])},repFausse:{al:brut(sub(0,S.X[0])),be:brut(sub(0,S.X[1]))},nature:forme?"a-ranger":"rangee",ens:{k:"rel",c,X:S.X.map(fracE)}};}
/* une matrice qui vérifie A² − kA = cI : une 2 × 2 quelconque (k = trace, c = −déterminant), ou λI + uv en 3 × 3 */
function matRel(R){for(;;){let A;if(R()<0.5)A=matAlea(R,2,2,3,.1);else{const l=R.choix([1,-1,2,-2]),u=[0,1,2].map(()=>R.ent(-1,2)),v=[0,1,2].map(()=>R.ent(-1,2));A=u.map((x,i)=>v.map((y,j)=>x*y+(i===j?l:0)));}
  if(A.every((l,i)=>l.every((x,j)=>i===j?x===A[0][0]:!x))||A.flat().some(x=>Math.abs(x)>4))continue;
  const A2=prod(A,A);let k=null,c=null;
  for(let kk=-8;kk<=8&&k===null;kk++){const M=A2.map((l,i)=>l.map((x,j)=>x-kk*A[i][j]));if(M.every((l,i)=>l.every((x,j)=>i===j?x===M[0][0]:!x))){k=kk;c=M[0][0];}}
  if(!k||!c||A2.flat().some(x=>Math.abs(x)>20))continue;
  return {A,A2,k,c,n:A.length,M:A2.map((l,i)=>l.map((x,j)=>x-k*A[i][j])),I:nomI(A.length),ex:polyT([1,-k,0],"I")};}}
function etapesCarre(T){const {A,A2,k,M,I,ex}=T,E=lignesProduit(A,A,"A²","A","A");
  E.push({w:`<b>A² = ${matH(A2)}</b>`,why:`A² = A × A : les lignes de A fois les colonnes de A.`,pts:1});
  E.push({w:`${comb([k],["A"])} = ${matH(A.map(l=>l.map(x=>k*x)))}`,why:`Multiplier une matrice par un nombre, c'est multiplier chacun de ses coefficients.`,pts:1});
  E.push({w:`<b>${ex} = ${matH(M)} = ${comb([T.c],[I])}</b>`,why:`On soustrait coefficient par coefficient. Hors de la diagonale, tout s'annule ; sur la diagonale, le même nombre partout : c'est ${comb([T.c],[I])}.`,pts:1});
  return E;}
function calculRel(R){const T=matRel(R),{A,A2,k,M,n,I,ex}=T,E=etapesCarre(T),noms=M.map((_,i)=>"l"+(i+1)),eg=`par exemple (${[1,-2,0].slice(0,n).join(", ")})`;
  function juge(rep){const X=lignesLues(rep,"l",n,n);if(!X)return {incomplet:`Écris les ${n} lignes de ${ex}, chacune avec ${n} nombres, ${eg}.`};
    const f=premierFaux(X,M);if(!f)return {ok:true};
    const F=noms.filter((_,i)=>X[i].some((x,j)=>!egal(x,M[i][j]))),resume=`Pas tout à fait : ${F.length>1?"les lignes":"la ligne"} ${et(F.map(s=>s.slice(1)))} ${F.length>1?"sont fausses":"est fausse"}.`,r=(etape,type,titre,msg)=>({ok:false,faux:F,resume,diag:{etape,type,titre,msg}});
    if(egalM(X,A2))return r(n+1,"kA oublié","Où ça part : la soustraction.",`Ta matrice est A², juste. Il reste à lui enlever ${comb([k],["A"])}.`);
    if(egalM(X,A2.map((l,i)=>l.map((x,j)=>x+k*A[i][j]))))return r(n+2,"signe de la soustraction","Où ça part : la soustraction.",`Tu as ajouté ${comb([k],["A"])} au lieu de l'enlever.`);
    const [i,j]=f;return r(i,"calcul d'un coefficient",`Où ça part : la ligne ${i+1}.`,`(A²)<sub>${i+1}${j+1}</sub> = ${sommeH(A,A,i,j)} = ${nb(A2[i][j])}, puis on enlève ${k} × ${par(A[i][j])} : ${nb(A2[i][j])} − ${par(k*A[i][j])} = ${nb(M[i][j])}.`);}
  return {sig:"RM"+JSON.stringify(A),q:`Calcule ${ex}.`,corps:`<p>$A =$ ${matH(A)}</p>`,texte:`A = ${JSON.stringify(A)} ; calculer ${ex}`,
    champs:noms.map((s,i)=>({k:"champ",id:s,nom:"ligne "+(i+1),label:`Ligne ${i+1} de ${ex} :`,ex:eg})),juge,etapes:E,bonne:`${ex} = ${matH(M)} = ${comb([T.c],[I])}`,bonneTxt:`${ex} = ${M.map(rangeeT).join(" ; ")}`,
    repBonne:Object.fromEntries(noms.map((s,i)=>[s,rangeeT(M[i])])),repFausse:Object.fromEntries(noms.map((s,i)=>[s,rangeeT(A2[i])])),nature:n===2?"2x2":"3x3",ens:{k:"mat",A,kk:k,cc:T.c,M}};}
function relationCC(R){const T=matRel(R),{A,k,n,I,ex}=T,c=[1,-k,-T.c],E=etapesCarre(T),S=etapesRel(c,I,true),dec=E.length,ids=["al","be"];
  function juge(rep){const x=nombre(rep.c);if(!x)return {incomplet:`Écris d'abord le nombre c tel que ${ex} = c${I}.`};
    if(!egal(x,T.c))return {ok:false,faux:["c"],resume:"Pas tout à fait : c est faux.",diag:{etape:dec-1,type:"calcul de A² − kA",titre:`Où ça part : le calcul de ${ex}.`,msg:egal(x,-T.c)?`Le signe de c est faux : ${ex} = ${comb([T.c],[I])}. Regarde les coefficients de la diagonale.`:`${ex} = ${comb([T.c],[I])} : les coefficients de la diagonale valent ${nb(T.c)}. Refais A², puis la soustraction.`}};
    return jugeRel(rep,{ids,noms:["α","β"],S,c,I,dec});}
  return {sig:"RC"+JSON.stringify(A),q:`Calcule ${ex} : tu trouves un multiple de ${I}, c${I}. En déduire, sans autre calcul, que A est inversible, et écris A⁻¹ = αA + β${I}.`,corps:`<p>$A =$ ${matH(A)}</p>`,texte:`A = ${JSON.stringify(A)} ; ${ex} = c${I} ; A⁻¹ = αA + β${I}`,
    champs:[{k:"champ",id:"c",nom:"c",label:`${ex} = c${I}, avec c =`,ex:"par exemple −2"},...champsRel(ids)],juge,etapes:E.concat(S.E),bonne:`${ex} = ${comb([T.c],[I])}, donc A⁻¹ = ${polyT(S.X,I)}`,bonneTxt:`c = ${nb(T.c)} ; A⁻¹ = ${polyT(S.X,I)}`,
    repBonne:{c:brut(T.c),al:brut(S.X[0]),be:brut(S.X[1])},repFausse:{c:brut(T.c),al:brut(sub(0,S.X[0])),be:brut(sub(0,S.X[1]))},nature:n===2?"2x2":"3x3",ens:{k:"mat",A,kk:k,cc:T.c,c,X:S.X.map(fracE)}};}
function relationCube(R){const forme=R.choix(["bin","gen","gen","iso"]),I="I₃";let c,rel,m=null;
  if(forme==="bin"){m=R.choix([1,-1,2,-2]);c=[1,3*m,3*m*m,m*m*m];rel=`(${comb([1,m],["A",I])})³ = 0`;}
  else{do c=[1,R.ent(-4,4),R.ent(-4,4),R.choix([-4,-3,-2,-1,1,2,3,4])];while(!c[1]&&!c[2]);rel=forme==="gen"?`${polyT(c,I)} = 0`:`A³ = ${comb(c.slice(1).map(x=>-x),["A²","A",I])}`;}
  const S=etapesRel(c,I),pre=forme==="bin"?[{w:`A et ${I} commutent, donc on développe comme (a + b)³ = a³ + 3a²b + 3ab² + b³ : ${polyT(c,I)} = 0.`,why:`Les identités remarquables ne marchent que pour des matrices qui commutent. Ici A × ${I} = ${I} × A = A, et ${I}² = ${I}³ = ${I}.`,pts:1}]
    :forme==="iso"?[{w:`On met tout du même côté : ${polyT(c,I)} = 0.`,why:`Ce qui change de côté change de signe.`,pts:1}]:[],ids=["al","be","ga"];
  return {sig:"R3"+JSON.stringify([c,forme]),q:`Une matrice A de taille 3 × 3 vérifie ${rel}. Montre que A est inversible, et écris A⁻¹ = αA² + βA + γ${I} : que valent α, β et γ ?`,corps:"",texte:`A vérifie ${rel} ; A⁻¹ = αA² + βA + γ${I}`,
    champs:champsRel(ids),juge:rep=>jugeRel(rep,{ids,noms:["α","β","γ"],S,c,I,dec:pre.length,bin:m}),etapes:pre.concat(S.E),bonne:`A⁻¹ = ${polyT(S.X,I)}`,bonneTxt:`A⁻¹ = ${polyT(S.X,I)}`,
    repBonne:{al:brut(S.X[0]),be:brut(S.X[1]),ga:brut(S.X[2])},repFausse:{al:brut(sub(0,S.X[0])),be:brut(sub(0,S.X[1])),ga:brut(sub(0,S.X[2]))},nature:forme,ens:{k:"rel",c,X:S.X.map(fracE),m}};}

/* ---------- AL11 : famille libre ou liée ---------- */
const CL=["a","b","c","d"],GV=["u","v","w","z"],famT=k=>"("+GV.slice(0,k).join(", ")+")",vecsT=V=>et(V.map((v,i)=>fx(GV[i]+" = "+vt(v)))),Rn=n=>"ℝ"+["","","²","³","⁴"][n];
const champLib={k:"choix",id:"lib",o:[["libre","libre"],["liee","liée"]]};
function deuxVecteurs(R){const n=R.choix([2,3,3]),lie=R()<0.5;let u,v;
  for(;;){u=vAlea(R,n,3);const l=R.choix([2,-1,3,-2,-3]);v=u.map(x=>l*x);if(R()<0.4)[u,v]=[v,u];
    if(!lie){const i=R.ent(0,n-1);v=v.slice();v[i]+=R.choix([1,-1,2]);}
    if(v.every(x=>!x)||v.concat(u).some(x=>Math.abs(x)>9))continue;
    const i0=u.findIndex(x=>x),l0=div(v[i0],u[i0]),bad=v.findIndex((x,i)=>!egal(mul(l0,u[i]),x));if((bad<0)!==lie)continue;break;}
  const i0=u.findIndex(x=>x),l0=div(v[i0],u[i0]),bad=v.findIndex((x,i)=>!egal(mul(l0,u[i]),x));
  const E=[{w:`Si v = λu, la ${rangOrd(i0)} composante donne ${fx(`${nb(v[i0])} = λ × ${par(u[i0])}`)}, donc λ = ${nb(l0)}.`,why:`Deux vecteurs non nuls forment une famille liée exactement quand l'un est un multiple de l'autre : ils sont colinéaires. On cherche donc λ avec v = λu.`,pts:1},
    lie?{w:`Les autres composantes marchent aussi : v = ${comb([l0],["u"])}, donc ${comb([1,sub(0,l0)],["v","u"])} = 0, avec des nombres pas tous nuls. <b>La famille (u, v) est liée.</b>`,why:`Une relation au + bv = 0 avec a ou b non nul : c'est la définition d'une famille liée.`,pts:1}
      :{w:`Mais la ${rangOrd(bad)} composante donnerait ${fx(`${nb(l0)} × ${par(u[bad])} = ${nb(mul(l0,u[bad]))}`)}, pas ${nb(v[bad])}. Aucun λ ne marche : u et v ne sont pas colinéaires. <b>La famille (u, v) est libre.</b>`,why:`Le même λ doit marcher pour toutes les composantes. Comme u et v ne sont pas nuls, u n'est pas non plus un multiple de v.`,pts:1}];
  function juge(rep){if(!rep.lib)return {incomplet:"Choisis d'abord : libre ou liée."};
    if((rep.lib==="liee")!==lie)return {ok:false,faux:["lib"],resume:lie?"Non : la famille est liée.":"Non : la famille est libre.",diag:{etape:1,type:lie?"liée lue comme libre":"libre lue comme liée",titre:"Où ça part : la comparaison des composantes.",msg:lie?`v = ${comb([l0],["u"])} : toutes les composantes marchent avec λ = ${nb(l0)}.`:`λ = ${nb(l0)} marche pour la ${rangOrd(i0)} composante, mais pas pour la ${rangOrd(bad)}.`}};
    if(!lie)return {ok:true};const x=nombre(rep.la);if(!x)return {incomplet:"Écris λ, un nombre, par exemple −2 ou 1/2."};if(egal(x,l0))return {ok:true};
    if(!nul(x)&&egal(x,div(1,l0)))return {ok:false,faux:["la"],resume:"Pas tout à fait : λ est faux.",diag:{etape:0,type:"u = λv au lieu de v = λu",titre:"Où ça part : le sens de la division.",msg:`Tu as trouvé u = ${nb(x)}v. On demande v = λu : λ = ${nb(v[i0])} / ${par(u[i0])} = ${nb(l0)}.`}};
    return {ok:false,faux:["la"],resume:"Pas tout à fait : λ est faux.",diag:{etape:0,type:"calcul de λ",titre:"Où ça part : le calcul de λ.",msg:`La ${rangOrd(i0)} composante donne λ = ${nb(v[i0])} / ${par(u[i0])} = ${nb(l0)}.`}};}
  return {sig:"F2"+JSON.stringify([u,v]),q:`Dans ${Rn(n)}, on pose ${vecsT([u,v])}. La famille (u, v) est-elle libre ou liée ? Si elle est liée, écris v = λu.`,corps:"",texte:`u = ${vt(u)}, v = ${vt(v)} ; libre ou liée ?`,
    champs:[champLib,{k:"champ",id:"la",nom:"λ",si:{lib:"liee"},label:"v = λu, avec λ =",ex:"par exemple −2"}],juge,etapes:E,bonne:lie?`liée : v = ${comb([l0],["u"])}`:"libre",bonneTxt:lie?`liée, v = ${comb([l0],["u"])}`:"libre",
    repBonne:lie?{lib:"liee",la:brut(l0)}:{lib:"libre"},repFausse:{lib:lie?"libre":"liee"},nature:lie?"liee":"libre",ens:{k:"deux",V:[u,v],libre:!lie,la:lie?fracE(l0):null}};}
function tireFamille(R,n,k,libre){for(;;){let V;
  if(libre)V=tireLibres(R,n,k,2);
  else{const B=tireLibres(R,n,Math.min(k-1,n),2),reste=[];for(let t=B.length;t<k;t++){const co=B.map(()=>R.ent(-2,2));if(co.every(x=>!x))co[0]=1;reste.push(combV(co,B).map(x=>q(x).n));}V=R.mel(B.concat(reste));}
  if(V.some(v=>v.every(x=>!x)||v.some(x=>Math.abs(x)>9)))continue;
  const A=colonnes(V),Rr=echelonne(A,A.map(()=>0));if((Rr.rang===k)!==libre||!Rr.pas.every(P=>P.M.flat().every(x=>q(x).d===1)))continue;
  return V;}}
function famille(V,o){const k=V.length,n=V[0].length,C=CL.slice(0,k),G=GV.slice(0,k),A=colonnes(V),z=A.map(()=>0),R=echelonne(A,z),sol=solution(R,C),libre=R.rang===k,E=[];
  if(k>n)E.push({w:`${k} vecteurs dans ${Rn(n)} : il y en a plus que ${n}, la famille est forcément liée. Pour trouver une relation, on résout quand même le système.`,why:`Dans ${Rn(n)}, une famille libre a au plus ${n} vecteurs.`,pts:1});
  E.push({w:`On cherche les nombres ${et(C)} tels que ${fx(C.map((c,i)=>c+G[i]).join(" + ")+" = 0")}. Composante par composante : ${sys(A,z,C)}`,why:`La famille est libre si la seule solution est ${C.join(" = ")} = 0, et liée s'il y en a une autre. On résout par le pivot de Gauss.`,pts:1});
  E.push({w:`Matrice du système (les vecteurs en colonnes) : ${mat(A)}`,why:`Le second membre est nul et le reste à chaque opération : on ne l'écrit pas.`,pts:0.5});
  etapesOps(E,R,C,M=>mat(M.map(r=>r.slice(0,-1))),"L'opération se fait sur toute la ligne.");
  let co=null;
  if(libre)E.push({w:`<b>Chaque colonne a un pivot : la seule solution est ${C.join(" = ")} = 0. La famille ${famT(k)} est libre.</b>`,why:`Sans variable libre, le système homogène n'a que la solution nulle.`,pts:1.5});
  else{const L=sol.libres[0],f=sol.S.map(e=>e.k[C[L]]||Q(0)),den=f.reduce((m,x)=>{const d=q(x).d;let a=m,b=d;while(b){[a,b]=[b,a%b];}return m*d/a;},1);co=f.map(x=>q(mul(x,den)).n);
    const {remonte}=lecteur(R,sol,C);
    E.push({w:`${C[L]} n'a pas de pivot : c'est une variable libre.<br>${R.piv.map((_,r)=>remonte(R.piv.length-1-r)).join("<br>")}<br>Avec ${fx(`${C[L]} = ${co[L]}`)}${sol.libres.length>1?` et ${et(sol.libres.slice(1).map(j=>C[j]+" = 0"))}`:""} : ${et(C.map((c,i)=>fx(c+" = "+nb(co[i]))))}. <b>${fx(comb(co,G)+" = 0")}, avec des nombres pas tous nuls : la famille ${famT(k)} est liée.</b> Vérification sur la première composante : ${fx(`${verifTxt(A[0],co)} = 0`)}.`,why:`Une colonne sans pivot donne une variable libre, donc d'autres solutions que la solution nulle. Toute valeur non nulle de ${C[L]} donne une relation.`,pts:1.5});}
  const iFin=E.length-1;
  function juge(rep){if(o.choix&&!rep.lib)return {incomplet:"Choisis d'abord : libre ou liée."};
    if(o.choix&&(rep.lib==="libre")!==libre)return {ok:false,faux:["lib"],resume:libre?"Non : la famille est libre.":"Non : la famille est liée.",diag:{etape:k>n&&!libre?0:iFin,type:libre?"libre lue comme liée":k>n?"trop de vecteurs pour être libre":"liée lue comme libre",titre:"Où ça part : la lecture de la matrice échelonnée.",
      msg:libre?`La descente donne un pivot dans chaque colonne : la seule solution est ${C.join(" = ")} = 0.`:k>n?`${k} vecteurs dans ${Rn(n)} sont toujours liés : ${comb(co,G)} = 0.`:`Une colonne n'a pas de pivot : il y a d'autres solutions que ${C.join(" = ")} = 0, par exemple ${comb(co,G)} = 0.`}};
    if(libre||!o.rel)return {ok:true};
    const Y=coefsLus(rep,C);if(!Y)return {incomplet:`Écris ${et(C)} : ${k} nombres, pas tous nuls.`};
    if(Y.every(y=>nul(y)))return {ok:false,faux:C,resume:"Pas tout à fait : tous tes nombres sont nuls.",diag:{etape:iFin,type:"relation triviale",titre:"Où ça part : la relation choisie.",msg:"Avec tous les nombres nuls, l'égalité est toujours vraie, même pour une famille libre. Il faut une relation avec au moins un nombre non nul."}};
    const S=V[0].map((_,i)=>V.reduce((s,v,j)=>add(s,mul(Y[j],v[i])),Q(0)));if(S.every(x=>nul(x)))return {ok:true};
    return {ok:false,faux:C,resume:"Pas tout à fait : ta relation ne donne pas le vecteur nul.",diag:{etape:iFin,type:"relation fausse",titre:"Vérifie ta relation.",msg:`Avec tes nombres, ${comb(Y,G)} = ${vt(S)}, pas le vecteur nul. Une relation juste : ${comb(co,G)} = 0.`}};}
  const champs=[];if(o.choix)champs.push(champLib);
  if(o.rel)C.forEach(c=>champs.push(Object.assign({k:"champ",id:c,nom:c,label:c+" =",ex:"par exemple −1"},o.choix?{si:{lib:"liee"}}:{})));
  const rel=`${fx(C.map((c,i)=>c+G[i]).join(" + ")+" = 0")}`,repBonne=Object.assign(o.choix?{lib:libre?"libre":"liee"}:{},!libre&&o.rel?Object.fromEntries(C.map((c,i)=>[c,String(co[i])])):{});
  const repFausse=o.choix?{lib:libre?"liee":"libre"}:Object.fromEntries(C.map((c,i)=>[c,String(co[i]+(i?0:1))]));
  return {sig:"FL"+JSON.stringify(V)+o.choix+o.rel,q:`Dans ${Rn(n)}, on pose ${vecsT(V)}. ${o.choix?`La famille ${famT(k)} est-elle libre ou liée ?${o.rel?` Si elle est liée, donne des nombres ${et(C)}, pas tous nuls, tels que ${rel}.`:""}`:`La famille ${famT(k)} est liée : trouve des nombres ${et(C)}, pas tous nuls, tels que ${rel}.`}`,corps:"",
    texte:`${V.map((v,i)=>GV[i]+" = "+vt(v)).join(", ")} ; ${o.choix?"libre ou liée ?":"relation ?"}`,champs,juge,etapes:E,bonne:libre?`la famille ${famT(k)} est libre`:`liée : ${fx(comb(co,G)+" = 0")}`,bonneTxt:libre?"libre":`liée : ${comb(co,G)} = 0`,
    repBonne,repFausse,nature:(libre?"libre":"liee")+(k>n?"-trop":""),ens:{k:"fam",V,libre,co}};}

/* ---------- AL12 : application linéaire ou pas, et sa matrice (CC2 2022 ex. 4, 2023 ex. 2, 2024 ex. 3) ---------- */
const VARS=n=>NOMS.slice(0,n);
const coordT=(C,n,math)=>{const V=VARS(n);let s=C.a.some(x=>x)?comb(C.a,V):"";
  if(C.p){const [i,j]=C.p;s=suite(s,C.s<0,i===j?V[i]+"²":V[i]+V[j]);}
  if(C.c)s=suite(s,C.c<0,String(Math.abs(C.c)));return s||"0";};
const appT=(nom,F,n,math)=>`${nom}(${VARS(n).join(", ")}) = (${F.map(C=>coordT(C,n,math)).join(", ")})`;
const valeurApp=(F,X)=>F.map(C=>C.a.reduce((s,x,k)=>s+x*X[k],0)+(C.p?C.s*X[C.p[0]]*X[C.p[1]]:0)+C.c);
const genreApp=F=>F.some(C=>C.p)?(F.some(C=>C.p&&C.p[0]===C.p[1])?"carre":"produit"):F.some(C=>C.c)?"constante":"lineaire";
const termeNL=(F,n)=>{const C=F.find(x=>x.p),V=VARS(n),[i,j]=C.p;return i===j?`carré ${V[i]}²`:`produit ${V[i]}${V[j]}`;};
function tireApp(R,n,m,genre){for(;;){const F=[];
  for(let i=0;i<m;i++){let a;if(R()<0.25){a=Array(n).fill(0);a[R.ent(0,n-1)]=R.choix([1,1,-1,2]);}else a=Array.from({length:n},()=>R()<0.3?0:R.ent(-3,3));F.push({a,c:0,p:null,s:1});}
  if(F.some(C=>C.a.every(x=>!x))||new Set(F.map(C=>C.a.join())).size<m||VARS(n).some((_,k)=>F.every(C=>!C.a[k])))continue;
  if(genre==="constante")R.choix(F).c=R.choix([1,-1,2,3,-2]);
  else if(genre!=="lineaire"){const C=F[R.ent(0,m-1)],[i,j]=genre==="carre"?[0,0].fill(R.ent(0,n-1)):R.mel(VARS(n).map((_,k)=>k)).slice(0,2).sort((x,y)=>x-y);
    C.p=[i,j];C.s=R()<0.8?1:-1;if(R()<0.4)C.a=C.a.map(()=>0);}
  return F;}}
const repApp=g=>g==="lineaire"?"lin":g==="constante"?"zero":"double";
const choixApp=(id,nom,titre)=>({k:"choix",id,titre,o:[["lin",`${nom} est linéaire`],["zero",`pas linéaire, car ${nom}(0) ≠ 0`],["double",`pas linéaire, car ${nom}(2X) ≠ 2${nom}(X)`]]});
function etapeApp(nom,F,n){const V=VARS(n),g=genreApp(F),z=V.map(()=>0),un=V.map(()=>1),deux=V.map(()=>2);
  if(g==="lineaire"){const A=F.map(C=>C.a);return {w:`Chaque coordonnée de ${fx(nom+"("+V.join(", ")+")")} est une combinaison de ${et(V)}, sans constante, sans produit ni carré. <b>${nom} est linéaire</b>, de matrice ${matH(A)}`,
    why:`Les lignes de la matrice sont les coefficients de chaque coordonnée, dans l'ordre ${et(V)}, avec 0 pour une variable absente. Alors ${nom}(X) = AX, et X ↦ AX est linéaire.`,pts:1.5};}
  if(g==="constante"){const C=F.find(x=>x.c);return {w:`${fx(nom+vt(z)+" = "+vt(valeurApp(F,z)))}, qui n'est pas le vecteur nul. <b>${nom} n'est pas linéaire.</b>`,
    why:`Une application linéaire envoie toujours le vecteur nul sur le vecteur nul. Ici, c'est la constante ${nb(C.c)} qui l'en empêche. Le test ${nom}(2X) ≠ 2${nom}(X) marche aussi, mais celui-ci est plus court.`,pts:1};}
  const u=valeurApp(F,un),d=valeurApp(F,deux);
  return {w:`${fx(nom+vt(un)+" = "+vt(u))} et ${fx(nom+vt(deux)+" = "+vt(d))}, alors que ${fx("2"+nom+vt(un)+" = "+vt(u.map(x=>2*x)))}. Donc ${nom}(2X) ≠ 2${nom}(X) pour X = ${vt(un)} : <b>${nom} n'est pas linéaire.</b>`,
    why:`À cause du ${termeNL(F,n)} : quand on double les variables, ce terme est multiplié par 4, pas par 2. Et ici ${nom}(0) = 0 : le test du vecteur nul ne prouve rien.`,pts:1};}
function jugeApp(nom,F,n,v,etape){const g=genreApp(F),z=VARS(n).map(()=>0);if(v===repApp(g)||g==="constante"&&v==="double")return null;
  if(g==="lineaire")return {type:"linéaire lue comme non linéaire",titre:`Où ça part : ${nom}.`,msg:`Chaque coordonnée de ${nom} est une combinaison de ${et(VARS(n))}, sans constante ni produit : ${nom} est linéaire.`,etape};
  if(g==="constante")return {type:"constante oubliée",titre:`Où ça part : ${nom}.`,msg:`${fx(nom+vt(z)+" = "+vt(valeurApp(F,z)))} n'est pas le vecteur nul : la constante empêche ${nom} d'être linéaire.`,etape};
  if(v==="lin")return {type:"produit ou carré oublié",titre:`Où ça part : ${nom}.`,msg:`Le ${termeNL(F,n)} n'est pas linéaire : compare ${nom}(2X) et 2${nom}(X).`,etape};
  return {type:"f(0) = 0 pris pour une preuve",titre:`Où ça part : ${nom}.`,msg:`Ici ${nom}(0) = 0 : ce test ne prouve rien. C'est le ${termeNL(F,n)} qui casse la linéarité : ${nom}(2X) ≠ 2${nom}(X).`,etape};}
const champsMat=(m,n,qui)=>Array.from({length:m},(_,i)=>({k:"champ",id:"l"+(i+1),nom:"ligne "+(i+1),label:`Ligne ${i+1} de la matrice ${qui} :`,ex:`par exemple (${[1,0,-2].slice(0,n).join(", ")})`}));
function jugeMat(rep,A,F,n,nom,etape){const m=A.length,V=VARS(n),noms=A.map((_,i)=>"l"+(i+1)),X=lignesLues(rep,"l",m,n);
  if(!X)return {incomplet:`Écris les ${m} lignes de la matrice, chacune avec ${n} nombres : un par variable, dans l'ordre ${et(V)}, avec 0 pour une variable absente.`};
  if(egalM(X,A))return null;const F2=noms.filter((_,i)=>!egalM([X[i]],[A[i]])),resume=`Pas tout à fait : ${F2.length>1?"les lignes":"la ligne"} ${et(F2.map(s=>s.slice(1)))} de la matrice ${F2.length>1?"sont fausses":"est fausse"}.`;
  if(m===n&&egalM(X,A[0].map((_,j)=>A.map(l=>l[j]))))return {ok:false,faux:noms,resume,diag:{etape,type:"matrice transposée",titre:"Où ça part : le sens de la matrice.",msg:`Tu as écrit les coefficients de chaque variable en ligne. C'est l'inverse : la ligne i, ce sont les coefficients de la i-ème coordonnée de ${nom}(X).`}};
  const i=+F2[0].slice(1)-1;return {ok:false,faux:F2,resume,diag:{etape,type:"ligne de la matrice",titre:`Où ça part : la ligne ${i+1}.`,msg:`La ligne ${i+1}, ce sont les coefficients de ${et(V)} dans la coordonnée ${fx(coordT(F[i],n,true))} : ${vt(A[i])}.`}};}
function appSeule(R){const n=R.choix([2,3,3]),m=R.choix([2,3,3,4]),g=R.choix(["lineaire","lineaire","constante","produit","produit","carre"]),F=tireApp(R,n,m,g),b=repApp(g);
  const juge=rep=>{if(!rep.ap)return {incomplet:"Choisis une réponse : linéaire, ou pas linéaire avec sa raison."};const d=jugeApp("f",F,n,rep.ap,0);return d?{ok:false,faux:["ap"],resume:"Non, ce n'est pas la bonne réponse.",diag:d}:{ok:true};};
  return {sig:"AP"+JSON.stringify(F),q:`Cette application de ${Rn(n)} dans ${Rn(m)} est-elle linéaire ? Si elle ne l'est pas, choisis la raison qui le prouve.`,corps:`<p>${fx(appT("f",F,n,true))}</p>`,texte:appT("f",F,n,false)+" ; linéaire ?",
    champs:[choixApp("ap","f")],juge,etapes:[etapeApp("f",F,n)],bonne:b==="lin"?"f est linéaire":b==="zero"?"pas linéaire : f(0) ≠ 0":"pas linéaire : f(2X) ≠ 2f(X)",bonneTxt:b==="lin"?"linéaire":"pas linéaire",
    repBonne:{ap:b},repFausse:{ap:b==="lin"?"double":"lin"},nature:g,ens:{k:"app",apps:[{nom:"f",n,txt:appT("f",F,n,false),id:"ap"}]}};}
function matApp(R){const n=R.choix([2,3,3]),m=R.choix([2,3,3,4]),F=tireApp(R,n,m,"lineaire"),A=F.map(C=>C.a),V=VARS(n);
  const E=[{w:F.map((C,i)=>`Ligne ${i+1} : ${fx(coordT(C,n,true))} donne ${vt(A[i])}.`).join("<br>"),why:`Une ligne par coordonnée de f(X), et dans chaque ligne les coefficients de ${et(V)}, dans cet ordre. Une variable absente compte 0.`,pts:1.5},
    {w:`<b>La matrice de f est ${matH(A)}</b>`,why:`${plu(m,"ligne")}, une par coordonnée de f(X), et ${plu(n,"colonne")}, une par variable. Alors f(X) = AX.`,pts:0.5}];
  return {sig:"AM"+JSON.stringify(F),q:`Cette application de ${Rn(n)} dans ${Rn(m)} est linéaire. Écris sa matrice, ligne par ligne.`,corps:`<p>${fx(appT("f",F,n,true))}</p>`,texte:appT("f",F,n,false)+" ; matrice ?",
    champs:champsMat(m,n,"de f"),juge:rep=>jugeMat(rep,A,F,n,"f",0)||{ok:true},etapes:E,bonne:`la matrice de f est ${matH(A)}`,bonneTxt:A.map(rangeeT).join(" ; "),
    repBonne:Object.fromEntries(A.map((l,i)=>["l"+(i+1),rangeeT(l)])),repFausse:Object.fromEntries(A.map((l,i)=>["l"+(i+1),rangeeT(i?l:l.map((x,j)=>j?x:x+1))])),nature:m===n?"carree":"rect",ens:{k:"mat",apps:[{nom:"f",n,txt:appT("f",F,n,false),A}]}};}
function appCC(R){const n=R.choix([2,3,3]),m=R.choix([2,3,3,4]),G3=R.mel(["lineaire","constante",R.choix(["produit","produit","carre"])]),N=["f","g","h"],ids=["cf","cg","chh"];
  const FS=G3.map(g=>tireApp(R,n,m,g)),L=G3.indexOf("lineaire"),A=FS[L].map(C=>C.a),nomL=N[L];
  function juge(rep){if(ids.some(id=>!rep[id]))return {incomplet:"Choisis une réponse pour chacune des trois applications."};
    for(let k=0;k<3;k++){const d=jugeApp(N[k],FS[k],n,rep[ids[k]],k);if(d)return {ok:false,faux:[ids[k]],resume:`Non : ta réponse pour ${N[k]} est fausse.`,diag:d};}
    return jugeMat(rep,A,FS[L],n,nomL,L)||{ok:true};}
  return {sig:"AC"+JSON.stringify(FS),q:`Pour chacune de ces trois applications de ${Rn(n)} dans ${Rn(m)}, dis si elle est linéaire, avec la raison qui le prouve quand elle ne l'est pas. Puis écris la matrice de celle qui est linéaire.`,
    corps:N.map((s,k)=>`<p>${fx(appT(s,FS[k],n,true))}</p>`).join(""),texte:N.map((s,k)=>appT(s,FS[k],n,false)).join(" ; ")+" ; linéaires ? matrice ?",
    champs:N.map((s,k)=>choixApp(ids[k],s,s+" :")).concat(champsMat(m,n,"de celle qui est linéaire")),juge,etapes:N.map((s,k)=>etapeApp(s,FS[k],n)),
    bonne:`${nomL} est la seule linéaire, de matrice ${matH(A)}`,bonneTxt:`${nomL} linéaire : `+A.map(rangeeT).join(" ; "),
    repBonne:Object.assign(Object.fromEntries(ids.map((id,k)=>[id,repApp(G3[k])])),Object.fromEntries(A.map((l,i)=>["l"+(i+1),rangeeT(l)]))),
    repFausse:Object.assign(Object.fromEntries(ids.map((id,k)=>[id,k===L?"double":repApp(G3[k])])),Object.fromEntries(A.map((l,i)=>["l"+(i+1),rangeeT(l)]))),
    nature:"cc",ens:{k:"cc",apps:N.map((s,k)=>Object.assign({nom:s,n,txt:appT(s,FS[k],n,false),id:ids[k]},k===L?{A}:{}))}};}

/* ---------- AL13 : noyau, image, injective, surjective (CC2 2023 ex. 3, 2024 ex. 5) ---------- */
const YL=["a","b","c","d"],entier=R=>R.pas.every(P=>P.M.flat().every(x=>q(x).d===1));
function tireKI(R,m,r){const n=3;for(;;){const B=[];for(let i=0;i<r;i++)B.push([0,0,0].map(()=>R()<0.25?0:R.ent(-3,3)));
  const A=R.mel(B.concat([...Array(m-r)].map(()=>{let a=R.ent(-2,2),b=R.ent(-2,2);if(!a&&!b)a=1;const c=r>2?R.ent(-1,1):0;return B[0].map((x,j)=>a*x+b*B[1][j]+c*(B[2]?B[2][j]:0));})));
  if(A.some(l=>l.every(x=>!x)||l.some(x=>Math.abs(x)>7))||[0,1,2].some(j=>A.every(l=>!l[j]))||new Set(A.map(l=>l.join())).size<m)continue;
  const Rl=echelonne(A,A.map((_,i)=>YL.slice(0,m).map((_,j)=>i===j?1:0))),R0=echelonne(A,A.map(()=>0));
  if(R0.rang!==r||!entier(Rl)||!entier(R0))continue;
  let v=[0,0,0];if(r<n){const sol=solution(R0,XYZ.slice(0,n)),L=sol.libres[0],f=sol.S.map(e=>e.k[XYZ[L]]||Q(0)),den=f.reduce((s,x)=>{const d=q(x).d;let a=s,b=d;while(b)[a,b]=[b,a%b];return s*d/a;},1);
    v=f.map(x=>q(mul(x,den)).n);if(v.find(x=>x)<0)v=v.map(x=>-x);if(v.some(x=>Math.abs(x)>9))continue;}
  return A;}}
function noyauImage(A,o){const n=3,m=A.length,X=XYZ.slice(0,n),L=YL.slice(0,m),Rl=echelonne(A,A.map((_,i)=>L.map((_,j)=>i===j?1:0))),R0=echelonne(A,A.map(()=>0)),r=R0.rang,rend=M=>matL(M,n,m,L);
  const fT=`f(${X.join(", ")}) = (${A.map(l=>comb(l,X)).join(", ")})`,Rm="ℝ"+["","","²","³","⁴"][m],E=[];let v=[0,0,0],iK=0,iI=0;
  const eqs=[];for(let i=r;i<m;i++){let w=L.map((_,j)=>q(Rl.E[i][n+j]));if(w.find(x=>!nul(x)).n<0)w=w.map(x=>mul(x,-1));eqs.push(w);}
  const txt=w=>comb(w,L)+" = 0",ne=eqs.length,inj=r===n;
  E.push({w:`La matrice de f a ${m} lignes, une par coordonnée de f(X) : ${matH(A)}. On résout ${fx(`f(${X.join(", ")}) = ${vl(L)}`)} par le pivot, avec ${et(L)} en lettres après la barre : ${rend(A.map((l,i)=>l.concat(L.map((_,j)=>i===j?1:0))))}`,why:`Un seul pivot sert deux fois : avec ${L.join(" = ")} = 0, il donne le noyau ; avec les lettres, il donne l'image.`,pts:1});
  etapesOps(E,Rl,X,rend,"La même opération se fait sur les lettres du second membre.");
  iK=E.length;
  if(inj)E.push({w:`<b>Avec ${L.join(" = ")} = 0</b>, chaque colonne de gauche a un pivot : la seule solution est x = y = z = 0. <b>ker f = {(0, 0, 0)}.</b>`,why:`Sans variable libre, le système homogène n'a que la solution nulle.`,pts:1.5});
  else{const sol=solution(R0,X),Lb=sol.libres[0],f=sol.S.map(e=>e.k[X[Lb]]||Q(0)),den=f.reduce((s,x)=>{const d=q(x).d;let a=s,b=d;while(b)[a,b]=[b,a%b];return s*d/a;},1);
    v=f.map(x=>q(mul(x,den)).n);if(v.find(x=>x)<0)v=v.map(x=>-x);const {remonte}=lecteur(R0,sol,X);
    E.push({w:`<b>Avec ${L.join(" = ")} = 0</b>, ${X[Lb]} n'a pas de pivot : c'est une variable libre.<br>${R0.piv.map((_,k)=>remonte(R0.piv.length-1-k)).join("<br>")}<br>Avec ${fx(`${X[Lb]} = ${nb(v[Lb])}`)} : <b>${fx(`ker f = Vect(${vt(v)})`)}</b>. Vérification : ${fx(`f${vt(v)} = ${vt(fois(A,v))}`)}.`,why:`Le noyau, ce sont les X tels que f(X) = 0. Une variable libre donne une droite : tous les multiples d'un vecteur non nul.`,pts:1.5});}
  iI=E.length;
  E.push({w:`${ne>1?`Les lignes ${et(eqs.map((_,i)=>String(r+1+i)))} disent`:`La ligne ${r+1} dit`} ${eqs.map((_,i)=>fx("0 = "+lettres(vecL(Rl.E[r+i],n,m,L),L))).join(" et ")}. <b>${fl(`${vl(L)} ∈ im f ⇔ ${eqs.map(txt).join(" et ")}`)}</b>`,why:`Le système f(X) = ${vl(L)} a une solution exactement quand ${ne>1?"ces seconds membres valent":"ce second membre vaut"} 0.`,pts:1.5});
  if(o.cc)E.push({w:`<b>f ${inj?"est":"n'est pas"} injective</b> : ${inj?"ker f = {0}":"ker f n'est pas {0}"}. <b>f n'est pas surjective</b> : im f ≠ ${Rm}, puisque ${vl(L)} doit vérifier ${ne>1?"des équations":"une équation"}.`,why:`f injective ⇔ ker f = {0}. f surjective ⇔ im f est tout l'espace d'arrivée.${m>n?` De ℝ³ dans ${Rm}, f ne peut jamais être surjective.`:""}`,pts:1});
  const V=A[0].map((_,j)=>A.map(l=>l[j]));
  function jugeV(rep){const x=liste(rep.v,n);if(!x)return {incomplet:`Écris v avec ${n} nombres, par exemple (1, -2, 1)${o.cc?", ou (0, 0, 0) si ker f = {0}":""}.`};
    const z=x.every(c=>nul(c));if(inj)return z?null:{ok:false,faux:["v"],resume:"Pas tout à fait : v est faux.",diag:{etape:iK,type:"noyau non nul inventé",titre:"Où ça part : le noyau.",msg:`Chaque colonne de gauche a un pivot : seul (0, 0, 0) vérifie f(X) = 0, donc ker f = {0} et v = (0, 0, 0).`}};
    if(z)return {ok:false,faux:["v"],resume:"Pas tout à fait : v est faux.",diag:{etape:iK,type:"variable libre oubliée",titre:"Où ça part : le noyau.",msg:`Il y a une variable libre : le noyau contient d'autres vecteurs que 0, par exemple ${vt(v)}.`}};
    const fx0=A.map(l=>l.reduce((s,c,k)=>add(s,mul(c,x[k])),Q(0)));if(fx0.every(c=>nul(c)))return null;
    return {ok:false,faux:["v"],resume:"Pas tout à fait : v n'est pas dans le noyau.",diag:{etape:iK,type:"calcul du noyau",titre:"Où ça part : le noyau.",msg:`Avec ton v, f(v) = ${vt(fx0)}, pas (0, ${L.map(()=>0).slice(1).join(", ")}). Un vecteur qui convient : ${vt(v)}.`}};}
  function jugeE(rep){const T=eqs.map((_,i)=>egalite(rep["e"+(i+1)]||"",L));
    if(T.some(w=>w===null))return {incomplet:`Écris ${ne>1?"chaque équation":"l'équation"} comme une égalité entre ${et(L)}, par exemple ${L[0]} + 2${L[1]} - ${L[m-1]} = 0.`};
    const faux=[];let msg="";
    T.forEach((w,i)=>{if(w===false){faux.push("e"+(i+1));msg=msg||`l'équation doit être une égalité entre ${et(L)}, sans nombre seul.`;return;}
      const j=V.findIndex(u=>!nul(w.reduce((s,c,t)=>add(s,mul(c,u[t])),Q(0))));
      if(j>=0){faux.push("e"+(i+1));msg=msg||`ton équation ${ne>1?i+1+" ":""}n'est pas vérifiée par f${vt(X.map((_,k)=>k===j?1:0))} = ${vt(V[j])}, qui est pourtant dans l'image.`;}});
    if(!faux.length&&rangM(T)===ne)return null;
    if(!faux.length){faux.push("e2");msg="tes deux équations disent la même chose : il en faut deux vraiment différentes.";}
    return {ok:false,faux,resume:"Pas tout à fait : "+msg,diag:{etape:iI,type:"équations de l'image",titre:"Où ça part : les lettres dans la colonne des seconds membres.",msg:`${ne>1?"Les bonnes équations sont":"La bonne équation est"} ${eqs.map(w=>fx(txt(w))).join(" et ")} (ou des multiples).`}};}
  const champs=[],repB={},repF={};
  if(o.k){champs.push({k:"champ",id:"v",nom:"v",label:"ker f = Vect(v), avec v =",ex:o.cc?"par exemple (1, -2, 1), ou (0, 0, 0) si ker f = {0}":"par exemple (1, -2, 1)"});repB.v=vt(v).replace(/−/g,"-");repF.v=inj?"(1, 0, 0)":"(0, 0, 0)";}
  if(o.i)eqs.forEach((w,i)=>{champs.push({k:"champ",id:"e"+(i+1),nom:"équation "+(i+1),label:ne>1?`Équation ${i+1} :`:"L'équation :",ex:`par exemple ${L[0]} + 2${L[1]} - ${L[m-1]} = 0`});repB["e"+(i+1)]=txt(w).replace(/−/g,"-");repF["e"+(i+1)]=txt(i?w:w.map((x,j)=>j?x:add(x,Q(1)))).replace(/−/g,"-");});
  if(o.cc){champs.push({k:"choix",id:"inj",titre:"f est-elle injective ?",o:[["oui","oui"],["non","non"]]},{k:"choix",id:"sur",titre:"f est-elle surjective ?",o:[["oui","oui"],["non","non"]]});repB.inj=inj?"oui":"non";repB.sur="non";}
  function juge(rep){if(o.cc&&(!rep.inj||!rep.sur))return {incomplet:"Réponds aussi : injective ? surjective ?"};
    let d=o.k?jugeV(rep):null;if(d)return d;d=o.i?jugeE(rep):null;if(d)return d;
    if(o.cc&&rep.inj!==repB.inj)return {ok:false,faux:["inj"],resume:"Non : injective est faux.",diag:{etape:iI+1,type:"injective et noyau",titre:"Où ça part : injective.",msg:`f injective ⇔ ker f = {0}. Ici ${inj?"ker f = {0} : f est injective":"ker f contient "+vt(v)+" : f n'est pas injective"}.`}};
    if(o.cc&&rep.sur!=="non")return {ok:false,faux:["sur"],resume:"Non : surjective est faux.",diag:{etape:iI+1,type:"surjective et image",titre:"Où ça part : surjective.",msg:`Les vecteurs de l'image doivent vérifier ${eqs.map(w=>fx(txt(w))).join(" et ")} : ce n'est pas tout ${Rm}.`}};
    return {ok:true};}
  const q0=o.cc?`Soit f l'application linéaire ci-dessous. (1) Trouve v tel que ker f = Vect(v). (2) À quelle condition un vecteur ${vl(L)} de ${Rm} est-il dans im f ? (3) f est-elle injective ? surjective ?`
    :o.k?`Soit f l'application linéaire ci-dessous, de ℝ³ dans ${Rm}. Trouve un vecteur v tel que ker f = Vect(v).`
    :`Soit f l'application linéaire ci-dessous, de ℝ³ dans ${Rm}. À quelle condition un vecteur ${vl(L)} de ${Rm} est-il dans l'image de f ? Écris ${ne>1?"les "+ne+" équations":"l'équation"} entre ${et(L)}.`;
  return {sig:"KI"+(o.k?1:0)+(o.i?1:0)+JSON.stringify(A),q:q0,corps:`<p>${fx(fT)}</p>`,texte:fT+(o.cc?" ; noyau, image, injective, surjective":o.k?" ; noyau":" ; image"),champs,juge,etapes:E,
    bonne:[o.k?(inj?"ker f = {0}":`ker f = Vect${vt(v)}`):"",o.i?eqs.map(w=>fx(txt(w))).join(" et "):"",o.cc?`${inj?"injective":"pas injective"}, pas surjective`:""].filter(Boolean).join(" ; "),
    bonneTxt:[o.k?vt(v):"",o.i?eqs.map(txt).join(" et "):"",o.cc?repB.inj+", non":""].filter(Boolean).join(" ; "),repBonne:repB,repFausse:Object.assign({},repB,o.k?{v:repF.v}:repF),
    nature:(o.cc?"cc":o.k?"noyau":"image")+m+"r"+r,ens:{k:"ki",A,v,eqs:eqs.map(w=>w.map(x=>{x=q(x);return x.n/x.d;})),r,inj,o}};}

/* ---------- AL14 : F = G ? (exercice 1 des CC2 2022 et 2023) ---------- */
const ppcm=L=>L.reduce((s,x)=>{const d=q(x).d;let a=s,b=d;while(b)[a,b]=[b,a%b];return s*d/a;},1);
const valEq=(e,w)=>e.reduce((s,c,k)=>s+c*w[k],0),F1="f<sub>1</sub>",F2="f<sub>2</sub>";
function tireFG(R,egal){const X=XYZ;for(;;){
  const M=[[1,R.ent(-2,2),R.ent(-2,2),R.ent(-2,2)],[R.ent(-2,2),R.ent(-2,2),R.ent(-2,2),R.ent(-2,2)]];
  if(M[1].filter(x=>x).length<2)continue;
  const R0=echelonne(M,[0,0]);if(R0.rang!==2||R0.piv.join()!=="0,1"||!entier(R0))continue;
  const sol=solution(R0,X),B=sol.libres.map(L=>sol.S.map(e=>e.k[X[L]]||Q(0)));if(B.some(f=>ppcm(f)!==1))continue;
  const F=B.map(f=>f.map(x=>q(x).n));if(F.flat().some(x=>Math.abs(x)>5))continue;
  const co=()=>{for(;;){const c=[R.ent(-2,2),R.ent(-2,2)];if(c.some(x=>x))return c;}},c1=co(),c2=co();if(c1[0]*c2[1]===c1[1]*c2[0])continue;
  let u=F[0].map((x,k)=>c1[0]*x+c1[1]*F[1][k]),v=F[0].map((x,k)=>c2[0]*x+c2[1]*F[1][k]);
  if(!egal){u=u.slice();u[R.ent(0,3)]+=R.choix([1,-1,2]);if(R()<0.35){v=v.slice();v[R.ent(0,3)]+=R.choix([1,-1]);}if(R()<0.5)[u,v]=[v,u];}
  if(u.concat(v).some(x=>Math.abs(x)>9)||u.every(x=>!x)||v.every(x=>!x))continue;
  const RG=echelonne(colonnes([u,v]),X.map((_,i)=>X.map((_,j)=>i===j?1:0)));if(RG.rang!==2||!entier(RG))continue;
  const dans=[u,v].map(w=>M.every(e=>!valEq(e,w)));if(dans.every(Boolean)!==egal)continue;
  const eqG=[2,3].map(i=>{let w=X.map((_,j)=>q(RG.E[i][2+j]).n);if(w.find(x=>x)<0)w=w.map(x=>-x);return w;});
  return {M,F,u,v,dans,R0,sol,eqG,egal};}}
const FT=T=>`F = {(x, y, z, t) ∈ ℝ⁴ | ${T.M.map(e=>comb(e,XYZ)+" = 0").join(", ")}}`;
const corpsFG=T=>`<p>${fl(FT(T))}</p><p>G = Vect(u, v), avec ${fx("u = "+vt(T.u))} et ${fx("v = "+vt(T.v))}.</p>`;
function etapesGen(T){const X=XYZ,E=[{w:`On résout le système de F : ${sys(T.M,[0,0],X)}`,why:`Les vecteurs de F sont exactement les solutions de ce système homogène.`,pts:0.5}];
  etapesOps(E,T.R0,X,M=>mat(M.map(r=>r.slice(0,-1))),"Le second membre est nul et le reste : on ne l'écrit pas.");const {remonte}=lecteur(T.R0,T.sol,X);
  E.push({w:`z et t n'ont pas de pivot : ce sont les variables libres.<br>${[1,0].map(r=>remonte(r)).join("<br>")}<br>Avec z = 1 et t = 0 : ${F1} = ${vt(T.F[0])} ; avec z = 0 et t = 1 : ${F2} = ${vt(T.F[1])}. <b>F = Vect(${F1}, ${F2})</b> : (${F1}, ${F2}) est une famille génératrice de F.`,why:`Chaque solution s'écrit z${F1} + t${F2} : ces deux vecteurs engendrent F.`,pts:1.5});return E;}
function etapeFG(T,eqG){const X=XYZ,ligne=w=>T.M.map(e=>fx(`${verifTxt(e,w)} = ${nb(valEq(e,w))}`)).join(" et ");
  const tests=`Pour u : ${ligne(T.u)}. Pour v : ${ligne(T.v)}.`;
  if(!T.egal){const k=T.dans.indexOf(false),nm=k?"v":"u";return {w:`${tests} <b>${nm} n'est pas dans F</b> : une équation de F n'est pas vérifiée. Donc G ⊄ F, et <b>F ≠ G</b>.`,why:`Si F = G, tout vecteur de G serait dans F. Un seul vecteur de G hors de F suffit à montrer F ≠ G.`,pts:2};}
  const lg=w=>eqG.map(e=>fx(`${verifTxt(e,w)} = ${nb(valEq(e,w))}`)).join(" et ");
  return {w:`${tests} u et v sont dans F, donc G = Vect(u, v) ⊂ F.<br>Dans l'autre sens, F = Vect(${F1}, ${F2}) avec ${F1} = ${vt(T.F[0])} et ${F2} = ${vt(T.F[1])}, et G a pour équations ${eqG.map(e=>fx(comb(e,X)+" = 0")).join(" et ")}. Pour ${F1} : ${lg(T.F[0])}. Pour ${F2} : ${lg(T.F[1])}. Donc F ⊂ G. <b>F = G.</b>`,
    why:`Pour montrer F = G, on montre les deux inclusions. G ⊂ F : les vecteurs qui engendrent G vérifient les équations de F. F ⊂ G : ceux qui engendrent F vérifient les équations de G.`,pts:2};}
function jugeGen(rep,T,etape){const a=liste(rep.f1,4),b=liste(rep.f2,4);if(!a||!b)return {incomplet:"Écris deux vecteurs de 4 nombres, par exemple (1, 0, -2, 1)."};
  for(const [w,id,nm] of [[a,"f1",F1],[b,"f2",F2]]){const k=T.M.findIndex(e=>!nul(e.reduce((s,c,i)=>add(s,mul(c,w[i])),Q(0))));
    if(k>=0)return {ok:false,faux:[id],resume:`Pas tout à fait : ton vecteur ${nm} n'est pas dans F.`,diag:{etape,type:"vecteur hors de F",titre:"Où ça part : la résolution du système de F.",msg:`Il ne vérifie pas l'équation ${fx(comb(T.M[k],XYZ)+" = 0")}. Une famille qui convient : ${vt(T.F[0])} et ${vt(T.F[1])}.`}};}
  if(rangM([a,b])<2)return {ok:false,faux:["f1","f2"],resume:"Pas tout à fait : tes deux vecteurs ne suffisent pas à engendrer F.",diag:{etape,type:"famille génératrice trop petite",titre:"Où ça part : les variables libres.",msg:`Tes deux vecteurs sont colinéaires (ou nuls) : ils n'engendrent qu'une droite. F a deux variables libres, z et t : prends z = 1, t = 0, puis z = 0, t = 1.`}};
  return null;}
const champFG={k:"choix",id:"fg",titre:"F = G ?",o:[["egal","F = G"],["u","F ≠ G, car u n'est pas dans F"],["v","F ≠ G, car v n'est pas dans F"]]};
function jugeChoixFG(rep,T,etape){if(!rep.fg)return {incomplet:"Choisis ta réponse : F = G, ou F ≠ G avec le vecteur de G qui n'est pas dans F."};
  const bons=T.egal?["egal"]:["u","v"].filter((_,k)=>!T.dans[k]);if(bons.includes(rep.fg))return null;
  const msg=T.egal?(rep.fg==="egal"?"":`u et v vérifient les deux équations de F, et ${F1}, ${F2} celles de G : F = G.`)
    :rep.fg==="egal"?`${bons[0]} ne vérifie pas les équations de F : il est dans G mais pas dans F, donc F ≠ G.`:`${rep.fg} vérifie les équations de F. C'est ${bons[0]} qui n'est pas dans F.`;
  return {ok:false,faux:["fg"],resume:"Non : F = G ? n'est pas bien réglé.",diag:{etape,type:T.egal?"F = G pris pour F ≠ G":rep.fg==="egal"?"une seule inclusion vérifiée":"mauvais vecteur testé",titre:"Où ça part : les équations de F.",msg}};}
function fgTest(R){const T=tireFG(R,R()<0.45),eqG=T.eqG,E=[etapeFG(T,eqG)];
  return {sig:"FG"+JSON.stringify([T.M,T.u,T.v]),q:`F et G sont deux sous-espaces vectoriels de ℝ⁴. F = G ? Teste les vecteurs qui engendrent G dans les équations de F.`,corps:corpsFG(T),texte:FT(T)+" ; G = Vect("+vt(T.u)+", "+vt(T.v)+") ; F = G ?",
    champs:[champFG],juge:rep=>jugeChoixFG(rep,T,0)||{ok:true},etapes:E,bonne:T.egal?"F = G":`F ≠ G : ${T.dans[0]?"v":"u"} n'est pas dans F`,bonneTxt:T.egal?"F = G":"F ≠ G",
    repBonne:{fg:T.egal?"egal":T.dans[0]?"v":"u"},repFausse:{fg:T.egal?"u":"egal"},nature:T.egal?"egal":"diff",ens:{k:"fg",M:T.M,F:T.F,u:T.u,v:T.v,eqG,egal:T.egal,o:"test"}};}
function fgGen(R){const T=tireFG(R,R()<0.5),E=etapesGen(T);
  return {sig:"FB"+JSON.stringify(T.M),q:`Trouve une famille génératrice de F : deux vecteurs ${F1} et ${F2} tels que F = Vect(${F1}, ${F2}).`,corps:`<p>${fl(FT(T))}</p>`,texte:FT(T)+" ; famille génératrice",
    champs:[{k:"champ",id:"f1",nom:"f1",label:`${F1} =`,ex:"par exemple (1, 0, -2, 1)"},{k:"champ",id:"f2",nom:"f2",label:`${F2} =`,ex:"par exemple (0, 1, 3, -1)"}],juge:rep=>jugeGen(rep,T,E.length-1)||{ok:true},etapes:E,
    bonne:`F = Vect(${vt(T.F[0])}, ${vt(T.F[1])})`,bonneTxt:`${vt(T.F[0])} et ${vt(T.F[1])}`,repBonne:{f1:rangeeT(T.F[0]),f2:rangeeT(T.F[1])},repFausse:{f1:rangeeT(T.F[0]),f2:rangeeT(T.F[0].map(x=>2*x))},nature:"gen",ens:{k:"fg",M:T.M,F:T.F,u:T.u,v:T.v,eqG:T.eqG,egal:T.egal,o:"gen"}};}
function fgCC(R){const T=tireFG(R,R()<0.5),EQ=equations([T.u,T.v]),E1=etapesGen(T),off=E1.length,E=E1.concat(EQ.etapes),eqG=T.eqG;E.push(etapeFG(T,eqG));
  const champs=[{k:"champ",id:"f1",nom:"f1",label:`(1) ${F1} =`,ex:"par exemple (1, 0, -2, 1)"},{k:"champ",id:"f2",nom:"f2",label:`${F2} =`,ex:"par exemple (0, 1, 3, -1)"}]
    .concat(EQ.champs.map((c,i)=>Object.assign({},c,{label:`${i?"":"(2) "}Équation ${i+1} de G :`}))).concat([Object.assign({},champFG,{titre:"(3) F = G ?"})]);
  function juge(rep){let d=jugeGen(rep,T,off-1);if(d)return d;const r=EQ.juge(rep);if(r.incomplet)return r;if(!r.ok){r.diag=Object.assign({},r.diag,{etape:off+(r.diag?r.diag.etape:0)});return r;}
    return jugeChoixFG(rep,T,E.length-1)||{ok:true};}
  return {sig:"FC"+JSON.stringify([T.M,T.u,T.v]),q:`(1) Trouve une famille génératrice de F. (2) Écris G comme l'ensemble des solutions d'un système homogène : deux équations entre x, y, z et t. (3) F = G ?`,corps:corpsFG(T),texte:FT(T)+" ; G = Vect("+vt(T.u)+", "+vt(T.v)+") ; génératrice de F, équations de G, F = G ?",
    champs,juge,etapes:E,bonne:`F = Vect(${vt(T.F[0])}, ${vt(T.F[1])}) ; G : ${EQ.bonne} ; ${T.egal?"F = G":"F ≠ G"}`,bonneTxt:`${EQ.bonneTxt} ; ${T.egal?"F = G":"F ≠ G"}`,
    repBonne:Object.assign({f1:rangeeT(T.F[0]),f2:rangeeT(T.F[1])},EQ.repBonne,{fg:T.egal?"egal":T.dans[0]?"v":"u"}),repFausse:Object.assign({f1:rangeeT(T.F[0]),f2:rangeeT(T.F[1])},EQ.repBonne,{fg:T.egal?"u":"egal"}),
    nature:T.egal?"egal":"diff",ens:{k:"fg",M:T.M,F:T.F,u:T.u,v:T.v,eqG,egal:T.egal,o:"cc",rep:EQ.repBonne}};}

/* ---------- AL15 : projection et symétrie par rapport à un plan (CC2 2024 ex. 4, janvier 2026 ex. 7, poly 6.1.3 et 6.1.4) ---------- */
const X3=["x","y","z"],egalV=(a,b)=>a.every((x,k)=>egal(x,b[k])),ps=(a,b)=>a.reduce((s,x,k)=>s+x*b[k],0);
const colin=(a,b)=>a.some(x=>!nul(x))&&a.every((x,i)=>a.every((y,j)=>egal(mul(x,b[j]),mul(y,b[i]))));
const planT=T=>"P : "+comb(T.n,X3)+" = 0",flottant=M=>M.map(l=>l.map(x=>q(x).n/q(x).d));
function tirePlan(R,orth,unite){for(;;){
  const k=orth?2:3,n=[0,0,0].map(()=>R.ent(-k,k));if(n.filter(x=>x).length<2||n.find(x=>x)<0)continue;
  if(n.reduce((a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;},0)!==1)continue;
  const u=orth?n.slice():[0,0,0].map(()=>R.ent(-2,2)),nu=ps(n,u);
  if(!nu||u.every(x=>!x)||orth&&nu>9||unite&&Math.abs(nu)!==1)continue;
  return {n,u,nu,orth};}}
const matProj=T=>[0,1,2].map(i=>[0,1,2].map(j=>sub(Q(i===j?1:0),Q(T.u[i]*T.n[j]*Math.sign(T.nu),Math.abs(T.nu))))),
  matSym=A=>A.map((l,i)=>l.map((x,j)=>sub(mul(x,2),Q(i===j?1:0))));
const matPH=A=>{const d=ppcm(A.flat());return d===1?matH(A):`${nb(Q(1,d))} × ${matH(A.map(l=>l.map(x=>mul(x,d))))}`;};
function tireVecP(R,T){for(;;){const w=[0,0,0].map(()=>R.ent(-4,4));if(w.every(x=>!x)||ps(T.n,w))continue;
  const l=R.choix([-2,-1,1,2]),v=w.map((x,k)=>x+l*T.u[k]),s=w.map((x,k)=>x-l*T.u[k]);
  if(v.concat(s).some(x=>Math.abs(x)>9))continue;return {w,l,v,s};}}
const lambdaT=T=>T.orth?"n":"u";
function etapeLambda(T,v,lettres){const u=lambdaT(T),num=lettres?comb(T.n,X3):verifTxt(T.n,v);
  return {w:`${T.orth?`Un vecteur normal à P : ${fx("n = "+vt(T.n))}, les coefficients de l'équation. `:""}On écrit ${lettres?"X":"v"} = w + λ${u}, avec w ∈ P. Comme w = ${lettres?"X":"v"} − λ${u} vérifie l'équation de P : ${fx(`λ = (${num}) / (${verifTxt(T.n,T.u)})`)}${lettres?"":Math.abs(T.nu)===1?` = <b>${nb(ps(T.n,v)/T.nu)}</b>`:` = ${nb(ps(T.n,v))} / ${nb(T.nu)} = <b>${nb(ps(T.n,v)/T.nu)}</b>`}.`,
    why:`On remplace w = ${lettres?"X":"v"} − λ${u} dans l'équation de P : le calcul fait sur ${lettres?"X":"v"}, moins λ fois le calcul fait sur ${u}, doit donner 0.${T.orth?"":" Le dénominateur n'est pas nul, car D n'est pas dans P."}`,pts:1};}
function jugeProjVec(rep,T,V){const p=liste(rep.p,3),s=liste(rep.s,3),u=lambdaT(T);
  if(!p||!s)return {incomplet:"Écris p(v) et s(v), chacun avec 3 nombres, par exemple (1, -2, 0)."};
  if(!egalV(p,V.w)){let type="projection fausse",msg=`p(v) doit être dans P, et ici λ = ${nb(V.l)} : p(v) = v − λ${u} = ${vt(V.w)}.`;
    if(egalV(p,V.s)){type="symétrie à la place de la projection";msg=`Tu as enlevé 2λ${u} : c'est la symétrie. La projection n'enlève λ${u} qu'une fois : p(v) = ${vt(V.w)}.`;}
    else if(egalV(p,V.v.map((x,k)=>x+V.l*T.u[k]))){type="signe de λ";msg=`On enlève λ${u}, on ne l'ajoute pas : p(v) = v − λ${u} = ${vt(V.w)}.`;}
    return {ok:false,faux:["p"],resume:"Pas tout à fait : p(v) est faux.",diag:{etape:1,type,titre:"Où ça part : la projection.",msg}};}
  if(!egalV(s,V.s)){let type="symétrie fausse",msg=`s(v) = v − 2λ${u} = 2p(v) − v = ${vt(V.s)}.`;
    if(egalV(s,V.w)){type="projection à la place de la symétrie";msg=`Ça, c'est p(v). La symétrie traverse le plan : s(v) = 2p(v) − v = ${vt(V.s)}.`;}
    return {ok:false,faux:["s"],resume:"Pas tout à fait : s(v) est faux.",diag:{etape:2,type,titre:"Où ça part : la symétrie.",msg}};}
  return null;}
function projVec(R,orth){const T=tirePlan(R,orth,false),V=tireVecP(R,T),u=lambdaT(T);
  const E=[etapeLambda(T,V.v,false),
    {w:`p(v) = v − λ${u} = ${vt(V.v)} − (${nb(V.l)}) × ${vt(T.u)} = <b>${vt(V.w)}</b>. Vérification : ${fx(verifTxt(T.n,V.w)+" = 0")}, p(v) est bien dans P.`,why:`La projection garde w, la partie de v qui est dans P, et enlève la partie selon ${orth?"n":"D"}.`,pts:1},
    {w:`s(v) = v − 2λ${u} = 2p(v) − v = <b>${vt(V.s)}</b>.`,why:`La symétrie traverse le plan : p(v) est le milieu de v et de s(v), donc s(v) = 2p(v) − v.`,pts:1}];
  return {sig:"PV"+JSON.stringify([T.n,T.u,V.v]),q:orth?`p est la projection orthogonale sur le plan P, et s la symétrie orthogonale par rapport à P. Calcule p(v) et s(v).`:`p est la projection sur le plan P parallèlement à la droite D, et s la symétrie par rapport à P de direction D. Calcule p(v) et s(v).`,
    corps:`<p>${fx(planT(T))}${orth?"":` et ${fx("D = Vect("+vt(T.u)+")")}`}</p><p>${fx("v = "+vt(V.v))}</p>`,texte:`${planT(T)}${orth?"":" ; D = Vect"+vt(T.u)} ; v = ${vt(V.v)} ; p(v) et s(v) ?`,
    champs:[{k:"champ",id:"p",nom:"p(v)",label:"p(v) =",ex:"par exemple (1, -2, 0)"},{k:"champ",id:"s",nom:"s(v)",label:"s(v) =",ex:"par exemple (3, 0, -1)"}],
    juge:rep=>jugeProjVec(rep,T,V)||{ok:true},etapes:E,bonne:`p(v) = ${vt(V.w)} et s(v) = ${vt(V.s)}`,bonneTxt:`${vt(V.w)} ; ${vt(V.s)}`,
    repBonne:{p:rangeeT(V.w),s:rangeeT(V.s)},repFausse:{p:rangeeT(V.w),s:rangeeT(V.w)},nature:orth?"orth":"para",ens:{k:"vec",n:T.n,u:T.u,v:V.v,p:V.w,s:V.s,orth}};}
const champsLignes=(p,qui)=>[1,2,3].map(i=>({k:"champ",id:p+i,nom:`ligne ${i} (${qui})`,label:`Ligne ${i} de la matrice ${qui} :`,ex:"par exemple (1, 0, -2) ou (2/3, 1/3, 0)"}));
function jugeSym(rep,A,S,etape,nm){nm=nm||"Mat(s) = 2Mat(p) − I₃";const Y=lignesLues(rep,"s",3,3),ids=["s1","s2","s3"];if(!Y)return {incomplet:"Écris les 3 lignes de la matrice de la symétrie, chacune avec 3 nombres (une fraction s'écrit 2/3)."};
  if(egalM(Y,S))return null;let type="matrice de la symétrie",msg=`${nm} = ${matPH(S)}`;
  if(egalM(Y,A.map(l=>l.map(x=>sub(mul(x,2),Q(1)))))){type="2A − 1 au lieu de 2A − I₃";msg=`On enlève I₃ : 1 seulement sur la diagonale, pas à chaque coefficient. ${msg}`;}
  else if(egalM(Y,A)){type="projection à la place de la symétrie";msg=`Ça, c'est la matrice de la projection. La symétrie : ${msg}`;}
  return {ok:false,faux:ids,resume:"Pas tout à fait : la matrice de la symétrie est fausse.",diag:{etape,type,titre:"Où ça part : la symétrie.",msg}};}
function projMat(R){const orth=R()<0.3;let T,A;for(;;){T=tirePlan(R,orth,false);A=matProj(T);if((orth||Math.abs(T.nu)<=2)&&A.flat().every(x=>Math.abs(q(x).n)<=6))break;}
  const S=matSym(A),u=lambdaT(T),lam=`(${comb(T.n,X3)})${Math.abs(T.nu)===1?"":" / "+nb(T.nu)}`;
  const E=[etapeLambda(T,null,true),
    {w:`p(X) = X − λ${u}, coordonnée par coordonnée : ${fx("p(x, y, z) = ("+A.map(l=>comb(l,X3)).join(", ")+")")}. <b>Mat(p) = ${matPH(A)}</b>`,why:`La coordonnée i de p(X) est la coordonnée i de X, moins ${u}ᵢ × λ, avec λ = ${lam}. On lit ensuite les coefficients de x, y, z, ligne par ligne.`,pts:2},
    {w:`<b>Mat(s) = 2Mat(p) − I₃ = ${matPH(S)}</b>`,why:`s(X) = X − 2λ${u} = 2p(X) − X : on double la matrice de p, puis on enlève 1 sur la diagonale.`,pts:1}];
  function juge(rep){const X=lignesLues(rep,"l",3,3),ids=["l1","l2","l3"];if(!X)return {incomplet:"Écris les 3 lignes de la matrice de p, chacune avec 3 nombres (une fraction s'écrit 2/3)."};
    if(!egalM(X,A)){let type="matrice de la projection",msg=`La ligne i, ce sont les coefficients de x, y, z dans la i-ème coordonnée de p(x, y, z). Ici Mat(p) = ${matPH(A)}`;
      if(egalM(X,A[0].map((_,j)=>A.map(l=>l[j])))){type="matrice transposée";msg=`Tu as écrit les colonnes en lignes. ${msg}`;}
      else if(egalM(X,S)){type="symétrie à la place de la projection";msg=`C'est la matrice de la symétrie. ${msg}`;}
      return {ok:false,faux:ids,resume:"Pas tout à fait : la matrice de p est fausse.",diag:{etape:1,type,titre:"Où ça part : la matrice de p.",msg}};}
    return jugeSym(rep,A,S,2)||{ok:true};}
  return {sig:"PM"+JSON.stringify([T.n,T.u]),q:orth?`p est la projection orthogonale sur le plan P, et s la symétrie orthogonale par rapport à P. Écris la matrice de p, puis celle de s.`:`p est la projection sur le plan P parallèlement à la droite D, et s la symétrie par rapport à P de direction D. Écris la matrice de p, puis celle de s.`,
    corps:`<p>${fx(planT(T))}${orth?"":` et ${fx("D = Vect("+vt(T.u)+")")}`}</p>`,texte:`${planT(T)}${orth?"":" ; D = Vect"+vt(T.u)} ; Mat(p) et Mat(s) ?`,
    champs:champsLignes("l","de p").concat(champsLignes("s","de s")),juge,etapes:E,bonne:`Mat(p) = ${matPH(A)} et Mat(s) = ${matPH(S)}`,bonneTxt:A.map(rangeeT).join(" ; ")+" | "+S.map(rangeeT).join(" ; "),
    repBonne:Object.fromEntries(A.map((l,i)=>["l"+(i+1),rangeeT(l)]).concat(S.map((l,i)=>["s"+(i+1),rangeeT(l)]))),repFausse:Object.fromEntries(A.map((l,i)=>["l"+(i+1),rangeeT(l)]).concat(A.map((l,i)=>["s"+(i+1),rangeeT(l)]))),
    nature:orth?"orth":"para",ens:{k:"mat",n:T.n,u:T.u,A:flottant(A),S:flottant(S),orth}};}
function projExam(R){let T,A;for(;;){T=tirePlan(R,false,true);A=matProj(T);if(A.flat().every(x=>Math.abs(q(x).n)<=6)&&A.every(l=>l.some(x=>!nul(x))))break;}
  const S=matSym(A),AmI=A.map((l,i)=>l.map((x,j)=>sub(x,Q(i===j?1:0)))),fT="f(x, y, z) = ("+A.map(l=>comb(l,X3)).join(", ")+")";
  const E=[{w:`f(X) = X ⇔ (A − I₃)X = 0, avec A − I₃ = ${matH(AmI)}. Chaque ligne est un multiple de ${vt(T.n)} : les trois équations reviennent à une seule. <b>P : ${comb(T.n,X3)} = 0.</b>`,why:`Les vecteurs que f laisse en place forment le plan P. On résout f(X) = X, c'est-à-dire AX − X = 0.`,pts:1.5},
    {w:`f(u) pour u = ${vt(T.u)} : ${A.map(l=>fx(verifTxt(l,T.u)+" = "+nb(l.reduce((s,x,k)=>add(s,mul(x,T.u[k])),Q(0))))).join(", ")}. Donc f(u) = 0. Le pivot sur A laisse une seule ligne nulle (rang 2) : <b>D = ker f = Vect(${vt(T.u)})</b>.`,why:`D est la droite que f écrase sur 0. Un vecteur non nul de ker f suffit, puisque ker f est une droite.`,pts:1.5},
    {w:`<b>Mat(σ) = 2A − I₃ = ${matPH(S)}</b>`,why:`σ(X) = 2f(X) − X, car f(X) est le milieu de X et de σ(X). On double A, puis on enlève 1 sur la diagonale.`,pts:1}];
  function juge(rep){const d=liste(rep.d,3),e=liste(rep.e,3);if(!d||!e)return {incomplet:"Écris u avec 3 nombres, et les 3 coefficients (a, b, c) de l'équation de P."};
    if(!colin(e,T.n))return {ok:false,faux:["e"],resume:"Pas tout à fait : l'équation de P est fausse.",diag:{etape:0,type:"équation de P",titre:"Où ça part : f(X) = X.",msg:`P, ce sont les X tels que f(X) = X. Les lignes de A − I₃ sont toutes des multiples de ${vt(T.n)} : P a pour équation ${fx(comb(T.n,X3)+" = 0")}.`}};
    if(!colin(d,T.u)){const dansP=nul(T.n.reduce((s,x,k)=>add(s,mul(x,d[k])),Q(0)));return {ok:false,faux:["d"],resume:"Pas tout à fait : u n'engendre pas ker f.",diag:{etape:1,type:dansP?"vecteur de P pris pour D":"vecteur de ker f faux",titre:"Où ça part : f(X) = 0.",msg:`${dansP?"Ton vecteur est dans P : f le laisse en place, il n'est pas envoyé sur 0. ":""}ker f est la droite des X tels que AX = 0 : D = Vect(${vt(T.u)}).`}};}
    return jugeSym(rep,A,S,2,"Mat(σ) = 2A − I₃")||{ok:true};}
  return {sig:"PE"+JSON.stringify(A.map(l=>l.map(nb))),q:`f est la projection sur un plan P parallèlement à une droite D. (1) Donne une équation ax + by + cz = 0 de P = {X | f(X) = X}. (2) Trouve u tel que D = ker f = Vect(u). (3) Écris la matrice de la symétrie σ = 2f − Id par rapport à P de direction D.`,
    corps:`<p>${fx(fT)}</p>`,texte:fT+" ; P, D, Mat(σ) ?",
    champs:[{k:"champ",id:"e",nom:"équation de P",label:"(1) Les coefficients (a, b, c) de l'équation de P :",ex:"par exemple (1, -1, 1) pour x − y + z = 0"},{k:"champ",id:"d",nom:"u",label:"(2) u =",ex:"par exemple (1, 3, 1)"}].concat(champsLignes("s","de σ")),
    juge,etapes:E,bonne:`P : ${comb(T.n,X3)} = 0 ; D = Vect(${vt(T.u)}) ; Mat(σ) = ${matH(S)}`,bonneTxt:`${rangeeT(T.n)} ; ${rangeeT(T.u)} ; `+S.map(rangeeT).join(" ; "),
    repBonne:Object.assign({e:rangeeT(T.n),d:rangeeT(T.u)},Object.fromEntries(S.map((l,i)=>["s"+(i+1),rangeeT(l)]))),repFausse:Object.assign({e:rangeeT(T.n),d:rangeeT(T.u)},Object.fromEntries(A.map((l,i)=>["s"+(i+1),rangeeT(l)]))),
    nature:"exam",ens:{k:"exam",n:T.n,u:T.u,A:flottant(A),S:flottant(S),orth:false}};}

G.add("lin",[
 {id:"AL1",t:"Pivot de Gauss",th:"pivot",pts:4,pages:["m-pivot"],lecons:["l-pivot"],
  paliers:[
   {t:"un exemple à compléter, 2 équations et 2 inconnues",cc:3,gen:exemple2},
   {t:"3 équations, 3 inconnues, pivots égaux à 1",cc:4,gen:R=>systeme(...carre3(R,0),1)},
   {t:"avec un échange de lignes ou un pivot différent de 1",cc:4,gen:R=>systeme(...carre3(R,R()<0.5?1:2),2)},
   {t:"aucune solution, une seule ou une infinité",cc:5,gen:R=>{const k=R.choix(["zero","zero","zero","inf","inf","inf","une","une"]);return systeme(...(k==="une"?carre3(R,R.ent(0,2)):rang2(R,k)),3);}},
   {t:"comme au CC (TD 2, ex. 10) : jusqu'à 4 équations et 4 inconnues",cc:6,gen:R=>systeme(...commeAuCC(R),4)}]},
 {id:"AL2",t:"Seconds membres a, b, c et paramètre m",tache:"seconds membres a, b, c et paramètre m",th:"param",pts:4,apres:["AL1"],lecons:["l-compat"],
  paliers:[
   {t:"2 équations : y a-t-il une condition sur a et b ?",cc:3,gen:R=>avecLettres(lettres2(R),false)},
   {t:"3 équations, seconds membres a, b, c : la condition",cc:5,gen:R=>avecLettres(R()<0.75?rang2(R,"inf")[0]:carre3(R,0)[0],false)},
   {t:"paramètre m, 2 équations : aucune solution, une seule ou une infinité",cc:6,gen:R=>{const x=param2(R);return avecM(x.M,x.c,x.rac);}},
   {t:"paramètre m, 3 équations : les trois cas",cc:8,gen:R=>{const x=param3(R);return avecM(x.M,x.c,x.rac);}},
   {t:"comme au CC : la condition sur a, b, c, puis les solutions",cc:9,gen:R=>avecLettres(lettresCC(R),true)}]},
 {id:"AL3",t:"Vect : appartenir, enlever un vecteur, équations",tache:"Vect (appartenir, enlever un vecteur, équations)",th:"vect",pts:4,apres:["AL1"],lecons:["l-vect"],
  paliers:[
   {t:"v est-il dans Vect(u) ?",cc:2,gen:R=>{for(;;){const n=R.choix([2,3,3]),u=vAlea(R,n,4),l=R.choix([2,-2,3,-1,-3,4,5]),v=u.map(x=>x*l);if(R()<0.45)v[R.ent(0,n-1)]+=R.nz(-2,2);if(v.every(x=>Math.abs(x)<=12))return combinaison([u],v,{gen:["u"],cible:"v",vect:true});}}},
   {t:"w est-il dans Vect(u, v) ? avec quels coefficients",cc:4,gen:R=>combinaison(...tireCombi(R,3,2,R()<0.6,3),{gen:["u","v"],cible:"w",vect:true})},
   {t:"quels vecteurs enlever sans changer le sous-espace engendré",cc:5,gen:R=>enlever(tireEnlever(R))},
   {t:"une équation du plan Vect(u, v) de ℝ³",cc:5,gen:R=>equations(tireLibres(R,3,2,3))},
   {t:"comme au CC : décrire un Vect par deux équations",cc:8,gen:R=>equations(R()<0.7?tireLibres(R,4,2,2):tireLibres(R,3,1,4))}]},
 {id:"AL4",t:"Combinaison linéaire ou pas",th:"cl",pts:2,apres:["AL1"],lecons:["l-colineaire"],
  paliers:[
   {t:"dans ℝ² : écrire w avec deux vecteurs",cc:3,gen:R=>combinaison(...tireCombi(R,2,2,true,4),{force:true})},
   {t:"dans ℝ³, avec deux vecteurs : oui ou non",cc:4,gen:R=>combinaison(...tireCombi(R,3,2,R()<0.6,3))},
   {t:"avec trois vecteurs, dans ℝ³ ou ℝ⁴",cc:6,gen:R=>{const r=R();return combinaison(...(r<0.3?tireCombi(R,3,3,true,2):r<0.8?tireCombi(R,4,3,R()<0.5,2):tireLies(R)));}},
   {t:"avec un paramètre t : pour quelle valeur de t",cc:5,gen:R=>{const [V,w]=tireCombi(R,3,2,true,3);return combinaisonT(V,w,R.ent(1,2));}}]},
 {id:"AL6",t:"Changer de repère",th:"repere",pts:1.5,lecons:["l-repere"],
  paliers:[
   {t:"du nouveau repère vers l'ancien",cc:3,gen:R=>repAncien(passage(R,[1,-1,2,-2,3,-3]),point(R,4))},
   {t:"nouvelle origine, mêmes vecteurs",cc:2,gen:R=>repOrigine(point(R,5),point(R,6),R()<0.6)},
   {t:"de l'ancien repère vers le nouveau",cc:5,gen:R=>repNouveau(passage(R,[1,-1,2,-2,3]),[0,0],point(R,4))},
   {t:"nouvelle origine et nouveaux vecteurs, un point dans chaque sens",cc:7,gen:R=>repNouveau(passage(R,[1,-1,2,-2]),point(R,4),point(R,4),point(R,3))},
   {t:"comme au TD 1, exercice 1 : est-ce un repère, puis les formules",cc:7,gen:R=>{if(R()<0.2){for(;;){const a=R.nz(-3,3),c=R.nz(-4,4),l=R.choix([2,-2,3,-1,-3]);if(Math.abs(l*c)<=9&&Math.abs(l*a)<=9)return repFormules([[a,l*a],[c,l*c]]);}}return repFormules(passage(R,[1,-1,2,-2,3,-3],4,9));}}]},
 {id:"AL7",t:"Calculer avec des vecteurs de ℝⁿ",tache:"calculer avec des vecteurs de ℝⁿ",th:"rn",pts:1.5,lecons:["l-rn"],
  paliers:[
   {t:"calculer une combinaison comme 2u − 3v",cc:2,gen:calculRn},
   {t:"trouver le vecteur x d'une équation entre vecteurs",cc:3,gen:equationRn}]},
 {id:"AL5",t:"Sous-espace vectoriel ou pas",tache:"sous-espace vectoriel ou pas",th:"reste",pts:0.4,pages:["m-sev"],lecons:["l-sev2"],
  paliers:[
   {t:"dans ℝ² : une équation, une inégalité, un produit ou un paramètre",cc:2,min:100,gen:R=>{const r=R();return sevOuPas(r<0.3?tireEq(R,2,true):r<0.4?tirePar(R,2,"lin"):r<0.58?tireEq(R,2,false):r<0.78?tireDemi(R,2):tireNonLin(R,2));}},
   {t:"dans ℝ³ : des équations ou des paramètres",cc:3,gen:R=>{const r=R();return sevOuPas(r<0.25?tireEq(R,3,true):r<0.45?tireEq(R,3,false):r<0.72?tirePar(R,3,"lin"):tirePar(R,3,"aff"));}},
   {t:"comme aux anciens CC : tout mélangé, avec les pièges",cc:4,gen:R=>{const r=R(),n=R()<0.4?2:3;return sevOuPas(r<0.18?tireEq(R,n,true):r<0.32?tireEq(R,n,false):r<0.5?tirePar(R,n,"lin"):r<0.66?tirePar(R,n,"aff"):r<0.76?tirePar(R,n,"piege"):r<0.88?tireNonLin(R,n):tireDemi(R,n));}}]},
 {id:"AL8",t:"Inverser une matrice : la double matrice",tache:"inverser une matrice (double matrice)",th:"pivotinv",ex:"cc2",pts:3.5,apres:["AL1"],lecons:["l2-gauss-inv"],
  paliers:[
   {t:"2 × 2, en suivant les opérations données",cc:3,min:180,gen:R=>inverser(inv2(R),{guide:true})},
   {t:"3 × 3, pivots égaux à 1",cc:6,gen:R=>inverser(invUnite(R))},
   {t:"3 × 3, avec un échange de lignes ou un pivot différent de 1",cc:7,gen:R=>inverser(invPiege(R))},
   {t:"comme au CC2 : inversible ou pas, puis A⁻¹",cc:8,gen:R=>{const r=R();return inverser(r<0.3?invNon(R):r<0.65?invUnite(R):invPiege(R),{choix:true});}}]},
 {id:"AL9",t:"Produit de matrices",tache:"produit de matrices (taille, coefficient, AB et BA)",th:"matrices",ex:"cc2",pts:2,lecons:["l-matrices"],
  paliers:[
   {t:"AB et BA : défini ou pas, et leur taille",cc:1,gen:tailleProduit},
   {t:"un coefficient de AB",cc:1,gen:coefProduit},
   {t:"calculer AB en entier",cc:3,gen:produitEntier},
   {t:"comme au CC2 : AB et BA, puis AB = BA ?",cc:6,gen:abBa}]},
 {id:"AL10",t:"Inverser grâce à une relation",tache:"inverser une matrice grâce à une relation (A² − 3A = −2I)",th:"matrices",ex:"cc2",pts:2,apres:["AL9"],lecons:["l2-relation"],
  paliers:[
   {t:"la relation est donnée : A⁻¹ = αA + βI",cc:2,gen:relationDonnee},
   {t:"calculer A² − kA",cc:4,gen:calculRel},
   {t:"comme au CC2 : calculer A² − kA, puis A⁻¹",cc:6,gen:relationCC},
   {t:"une relation de degré 3, comme (A + I₃)³ = 0",cc:4,min:170,gen:relationCube}]},
 {id:"AL11",t:"Famille libre ou liée",tache:"famille libre ou liée",th:"base",ex:"cc2",pts:2.5,apres:["AL1"],lecons:["l2-libre"],
  paliers:[
   {t:"deux vecteurs : colinéaires ou pas",cc:2,gen:deuxVecteurs},
   {t:"trois vecteurs de ℝ³ : libre ou liée",cc:4,gen:R=>famille(tireFamille(R,3,3,R()<0.5),{choix:true})},
   {t:"une famille liée : trouver une relation",cc:5,gen:R=>{const r=R();return famille(r<0.6?tireFamille(R,3,3,false):tireFamille(R,4,3,false),{rel:true});}},
   {t:"comme au CC2 : libre ou liée, et la relation",cc:6,gen:R=>{const r=R();return famille(r<0.45?tireFamille(R,3,3,R()<0.5):r<0.8?tireFamille(R,4,3,R()<0.5):tireFamille(R,3,4,false),{choix:true,rel:true});}}]},
 {id:"AL12",t:"Application linéaire ou pas, et sa matrice",tache:"application linéaire ou pas, et sa matrice",th:"applin",ex:"cc2",pts:3.5,lecons:["l2-applin"],
  paliers:[
   {t:"linéaire ou pas, et la raison",cc:2,gen:appSeule},
   {t:"la matrice d'une application linéaire",cc:3,gen:matApp},
   {t:"comme au CC2 : trois applications, puis la matrice de celle qui est linéaire",cc:6,gen:appCC}]},
 {id:"AL13",t:"Noyau, image, injective, surjective",tache:"noyau, image, injective, surjective",th:"kerim",ex:"cc2",pts:2.5,apres:["AL12"],lecons:["l2-ker-im"],
  paliers:[
   {t:"le noyau : ker f = Vect(v)",cc:4,gen:R=>noyauImage(tireKI(R,R.choix([3,3,4]),2),{k:true})},
   {t:"l'image : à quelle condition (a, b, c) est dans im f",cc:5,gen:R=>{const m=R.choix([3,3,4]);return noyauImage(tireKI(R,m,m===4&&R()<0.5?3:2),{i:true});}},
   {t:"comme au CC2 : noyau, image, injective, surjective",cc:8,gen:R=>{const m=R.choix([3,4,4]);return noyauImage(tireKI(R,m,m===4&&R()<0.35?3:2),{k:true,i:true,cc:true});}}]},
 {id:"AL14",t:"F = G ? Deux sous-espaces de ℝ⁴",tache:"F = G ? (famille génératrice, équations, les deux inclusions)",th:"inter",ex:"cc2",pts:3.5,apres:["AL3"],lecons:["l2-inter"],
  paliers:[
   {t:"une famille génératrice de F, donné par deux équations",cc:4,gen:fgGen},
   {t:"F = G ? : tester les vecteurs de G dans les équations de F",cc:4,gen:fgTest},
   {t:"comme au CC2 : famille génératrice de F, équations de G, F = G ?",cc:10,gen:fgCC}]},
 {id:"AL15",t:"Projection et symétrie par rapport à un plan",tache:"projection et symétrie par rapport à un plan",th:"projection",ex:"cc2",pts:1,apres:["AL12"],lecons:["l2-projection"],
  paliers:[
   {t:"projection orthogonale : p(v) et s(v) pour un vecteur v",cc:4,gen:R=>projVec(R,true)},
   {t:"projection parallèlement à une droite : p(v) et s(v)",cc:4,gen:R=>projVec(R,false)},
   {t:"la matrice de la projection, puis celle de la symétrie",cc:6,gen:projMat},
   {t:"comme à l'examen de janvier 2026 : f donnée, trouver P et D, puis la symétrie",cc:7,gen:projExam}]}
].concat(RECITS.map(r=>({id:r.id,t:r.t,th:r.th,fixe:true,seuil:1,pages:r.pages||[],lecons:[],paliers:[{t:"à écrire de mémoire, sur papier",cc:r.cc,gen:recit("F"+r.id,r.q,r.corps,r.l)}]}))));
})();
