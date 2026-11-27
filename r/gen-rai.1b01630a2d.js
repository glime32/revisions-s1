/* Générateurs de Raisonnement (CC2 : ensembles, applications, quantificateurs, récurrence, logique). */
(function(){
"use strict";
const G=window.GEN,O=G.outils,{Q,nb,brut,propre,nombre,suiteNb}=O,AN=G.ana;
const fx=s=>s.replace(/&[a-z]+;/g,"x").replace(/[_{}]/g,"").length>30||s.length>36?O.f(s):O.fx(s);
const h=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];
const ent=x=>x<0?"−"+(-x):String(x);

/* ---------- ensembles finis d'entiers ---------- */
const tri=A=>[...new Set(A)].sort((x,y)=>x-y);
const ensF=A=>A.length?"{"+A.map(ent).join(", ")+"}":"∅";
const tapeF=A=>A.length?"{"+A.join(", ")+"}":"∅";
function lisFini(src,att){let s=propre(src).trim();if(!s)return null;if(/^(∅|vide|ensemble vide|\{\s*\})$/i.test(s))return [];
  s=s.replace(/^\{|\}$/g,"").trim();if(!s)return [];const S=suiteNb(s,att);if(S.colle)return null;const P=S.P.map(x=>nombre(x));return P.every(x=>x&&x.d===1)?tri(P.map(x=>x.n)):null;}
const memeF=(A,B)=>A.length===B.length&&A.every((x,i)=>x===B[i]);
const OPF={"∪":(A,B)=>tri(A.concat(B)),"∩":(A,B)=>A.filter(x=>B.includes(x)),"∖":(A,B)=>A.filter(x=>!B.includes(x)),"Δ":(A,B)=>tri(A.filter(x=>!B.includes(x)).concat(B.filter(x=>!A.includes(x))))};
const DITF={"∪":"les éléments qui sont dans l'un ou dans l'autre (ou dans les deux)","∩":"les éléments qui sont dans les deux à la fois","∖":"les éléments du premier qui ne sont pas dans le second","Δ":"les éléments qui sont dans un seul des deux"};
const partie=(R,E,lo,hi)=>tri(R.mel(E).slice(0,R.ent(lo,hi)));
/* o : {noms: [[étiquette, ensemble attendu, pourquoi]], enonce, rappel, sig, ens} : plusieurs ensembles finis à écrire */
function ensemblesFinis(o){const ids=o.Q.map(x=>x[0]);
  const E=o.Q.map(x=>({w:`<b>${fx(`${x[0]} = ${ensF(x[1])}`)}</b>`,why:x[2],pts:1}));
  function juge(rep){const L=ids.map((k,i)=>lisFini((rep.c||{})[k],o.Q[i][1]));if(L.some(x=>!x))return {incomplet:"Écris chaque ensemble entre accolades, avec des virgules, par exemple {1, 4, 7}. Pour l'ensemble vide : ∅."};
    const F=ids.filter((k,i)=>!memeF(L[i],o.Q[i][1]));if(!F.length)return {ok:true};
    const i=ids.indexOf(F[0]),att=o.Q[i][1],lu=L[i],manque=att.filter(x=>!lu.includes(x)),trop=lu.filter(x=>!att.includes(x)),autre=lu.length?o.Q.find((x,j)=>j!==i&&memeF(lu,x[1])):null,conf=(o.pieges||[]).find(x=>x[0]===F[0]&&memeF(lu,x[1]));
    return {ok:false,faux:F,resume:`Pas tout à fait : ${et(F)} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:{etape:i,type:conf?conf[2]:autre?"deux opérations sur les ensembles confondues":"élément oublié ou en trop dans un ensemble",titre:`Où ça part : ${F[0]}.`,
      msg:conf?conf[3]:autre?`Tu as écrit ${fx(`${autre[0]}`)}. Ici on demande ${fx(F[0])} : ${o.Q[i][3]||o.Q[i][2]}`:`${manque.length?`Il manque ${et(manque.map(ent))}. `:""}${trop.length?`${et(trop.map(ent))} ${trop.length>1?"sont":"est"} en trop. `:""}${o.Q[i][2]}`}};}
  const bon={},mauvais={};o.Q.forEach((x,i)=>{bon[x[0]]=tapeF(x[1]);mauvais[x[0]]=i?tapeF(x[1]):tapeF(x[1].length?x[1].slice(1):[99]);});
  return {sig:o.sig,q:o.enonce,corps:o.rappel?`<p class="muted">${o.rappel}</p>`:"",texte:o.texte,champs:[{k:"cases",id:"c",noms:ids,large:true,aide:"Entre accolades, avec des virgules : {1, 4, 7}. L'ordre ne compte pas. Ensemble vide : ∅."}],juge,etapes:E,
    bonne:o.Q.map(x=>fx(`${x[0]} = ${ensF(x[1])}`)).join(" ; "),bonneTxt:o.Q.map(x=>`${x[0]} = ${ensF(x[1])}`).join(" ; "),repBonne:{c:bon},repFausse:{c:mauvais},nature:o.nature,ens:Object.assign({type:"finis",rep:o.Q.map(x=>[x[0],x[1]])},o.ens)};}
const revue=(A,B,dans)=>`On passe ${A.nom} en revue : ${A.v.map(x=>`${ent(x)} ${B.v.includes(x)?"est":"n'est pas"} dans ${B.nom}`).join(", ")}.`;
function unionInter(R){const U=[0,1,2,3,4,5,6,7,8,9],A=partie(R,U,3,5),B=partie(R,U,3,5),un=OPF["∪"](A,B),it=OPF["∩"](A,B);
  return ensemblesFinis({sig:"UI"+A+"|"+B,enonce:`On pose ${fx(`A = ${ensF(A)}`)} et ${fx(`B = ${ensF(B)}`)}. Écris la réunion ${fx("A ∪ B")} et l'intersection ${fx("A ∩ B")}.`,
    rappel:`Rappel : ${fx("A ∪ B")} contient ${DITF["∪"]} ; ${fx("A ∩ B")} contient ${DITF["∩"]}.`,texte:`A = ${ensF(A)}, B = ${ensF(B)} ; A ∪ B et A ∩ B`,nature:it.length?"commun":"disjoints",ens:{A,B},
    pieges:[["A ∪ B",it,"réunion et intersection échangées","Tu as écrit l'intersection. La réunion contient tous les éléments de A et tous ceux de B, écrits une seule fois."],["A ∩ B",un,"réunion et intersection échangées","Tu as écrit la réunion. L'intersection ne garde que les éléments qui sont à la fois dans A et dans B."]],
    Q:[["A ∪ B",un,`On écrit tous les éléments de A, puis ceux de B qui n'y sont pas déjà : ${B.filter(x=>!A.includes(x)).map(ent).join(", ")||"aucun"}. Un élément ne s'écrit qu'une fois.`],["A ∩ B",it,`${revue({nom:"A",v:A},{nom:"B",v:B})} On garde ceux qui sont dans B${it.length?"":" : il n'y en a aucun, l'intersection est vide"}.`]]});}
function differences(R){const U=[0,1,2,3,4,5,6,7,8,9],A=partie(R,U,3,5),B=partie(R,U,3,5),t=R.ent(0,2),ab=OPF["∖"](A,B),ba=OPF["∖"](B,A),de=OPF["Δ"](A,B),ca=OPF["∖"](U,A),cu=OPF["∖"](U,OPF["∪"](A,B));
  const qAB=["A ∖ B",ab,`${revue({nom:"A",v:A},{nom:"B",v:B})} On garde ceux qui ne sont pas dans B.`],qBA=["B ∖ A",ba,`${revue({nom:"B",v:B},{nom:"A",v:A})} On garde ceux qui ne sont pas dans A.`];
  const qD=["A Δ B",de,`C'est ${fx("(A ∖ B) ∪ (B ∖ A)")} : ${ensF(ab)} réuni avec ${ensF(ba)}. Autrement dit : les éléments de ${fx("A ∪ B")} qui ne sont pas dans ${fx("A ∩ B")}.`],qC=["E ∖ A",ca,`On garde les éléments de E qui ne sont pas dans A.`],qU=["E ∖ (A ∪ B)",cu,`${fx(`A ∪ B = ${ensF(OPF["∪"](A,B))}`)}. On garde les éléments de E qui n'y sont pas : ceux qui ne sont ni dans A, ni dans B.`];
  const QS=t===0?[qAB,qBA,qD]:t===1?[qAB,qD,qC]:[qD,qC,qU],avecE=t>0;
  return ensemblesFinis({sig:"DF"+A+"|"+B+"|"+t,enonce:`On pose ${avecE?`${fx("E = {0, 1, 2, …, 9}")}, `:""}${fx(`A = ${ensF(A)}`)} et ${fx(`B = ${ensF(B)}`)}. Écris ${et(QS.map(x=>fx(x[0])))}.`,
    rappel:`Rappel : ${fx("A ∖ B")} (« A privé de B ») contient les éléments de A qui ne sont pas dans B. ${fx("A Δ B")}, la différence symétrique, contient ${DITF["Δ"]} : ${fx("A Δ B = (A ∖ B) ∪ (B ∖ A)")}.${avecE?` ${fx("E ∖ A")} est le complémentaire de A dans E.`:""}`,
    texte:`${avecE?"E = {0, …, 9}, ":""}A = ${ensF(A)}, B = ${ensF(B)} ; ${QS.map(x=>x[0]).join(", ")}`,nature:["différences","Δ et complémentaire","complémentaires"][t],ens:{A,B,U},
    pieges:[["A ∖ B",ba,"sens de la différence","Tu as écrit B ∖ A. Dans A ∖ B, on part des éléments de A et on enlève ceux qui sont dans B."],["B ∖ A",ab,"sens de la différence","Tu as écrit A ∖ B. Dans B ∖ A, on part des éléments de B et on enlève ceux qui sont dans A."],["A Δ B",OPF["∪"](A,B),"différence symétrique prise pour la réunion","Tu as écrit la réunion. Dans la différence symétrique, on enlève les éléments qui sont dans A et dans B à la fois."]],Q:QS});}
function cardinaux(R){const U=[1,2,3,4,5,6,7,8,9],A=partie(R,U,2,4),B=partie(R,U,2,5),un=OPF["∪"](A,B),it=OPF["∩"](A,B),cas=R.ent(0,1);
  const N=cas?[["Card(A ∪ B)",un.length,`${fx(`A ∪ B = ${ensF(un)}`)} a ${un.length} éléments. On retrouve la formule ${fx("Card(A) + Card(B) − Card(A ∩ B)")} : ${A.length} + ${B.length} − ${it.length}.`],["Card(A × B)",A.length*B.length,`${fx("A × B")} est l'ensemble des couples (a, b) avec a dans A et b dans B : ${A.length} choix pour a, ${B.length} choix pour b, donc ${A.length} × ${B.length} couples.`],["Card(𝒫(A))",Math.pow(2,A.length),`${fx("𝒫(A)")} est l'ensemble des parties de A. Pour fabriquer une partie, on décide pour chaque élément si on le prend ou non : 2 choix, ${A.length} fois, donc ${fx(`2^{${A.length}} = ${Math.pow(2,A.length)}`)} parties, en comptant ∅ et A.`]]
    :[["Card(A ∩ B)",it.length,`${fx(`A ∩ B = ${ensF(it)}`)} : ${it.length} ${it.length>1?"éléments communs":"élément commun"}.`],["Card(𝒫(B))",Math.pow(2,B.length),`Une partie de B se fabrique en décidant, pour chaque élément, si on le prend ou non : ${fx(`2^{${B.length}} = ${Math.pow(2,B.length)}`)} parties, en comptant ∅ et B.`],["Card(B × A)",A.length*B.length,`Un couple (b, a) : ${B.length} choix pour b, ${A.length} pour a, donc ${B.length} × ${A.length} couples. C'est le même nombre que pour ${fx("A × B")}, mais ce ne sont pas les mêmes couples.`]];
  const ids=N.map(x=>x[0]);
  function juge(rep){const L=ids.map(k=>nombre((rep.c||{})[k]));if(L.some(x=>!x||x.d!==1))return {incomplet:"Remplis les trois cases avec des entiers."};const F=ids.filter((k,i)=>L[i].n!==N[i][1]);if(!F.length)return {ok:true};const i=ids.indexOf(F[0]),v=L[i].n;
    return {ok:false,faux:F,resume:`Pas tout à fait : ${et(F)} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:{etape:i,type:/𝒫/.test(F[0])&&(v===2*(cas?A:B).length||v===Math.pow((cas?A:B).length,2))?"nombre de parties : 2 puissance n":/×/.test(F[0])&&v===A.length+B.length?"cardinal d'un produit : on multiplie":"cardinal d'un ensemble",titre:`Où ça part : ${F[0]}.`,msg:N[i][2]}};}
  const bon={},mauvais={};N.forEach((x,i)=>{bon[x[0]]=String(x[1]);mauvais[x[0]]=String(i===1?x[1]+1:x[1]);});
  return {sig:"CA"+A+"|"+B+"|"+cas,q:`On pose ${fx(`A = ${ensF(A)}`)} et ${fx(`B = ${ensF(B)}`)}. Donne les trois nombres d'éléments demandés.`,corps:`<p class="muted">Rappel : Card(X) est le nombre d'éléments de X. ${fx("A × B")} est l'ensemble des couples (a, b) avec a dans A et b dans B. ${fx("𝒫(A)")} est l'ensemble de toutes les parties de A.</p>`,
    texte:`A = ${ensF(A)}, B = ${ensF(B)} ; ${ids.join(", ")}`,champs:[{k:"cases",id:"c",noms:ids}],juge,etapes:N.map(x=>({w:`<b>${fx(`${x[0]} = ${x[1]}`)}</b>`,why:x[2],pts:1})),bonne:N.map(x=>fx(`${x[0]} = ${x[1]}`)).join(" ; "),bonneTxt:N.map(x=>`${x[0]} = ${x[1]}`).join(" ; "),
    repBonne:{c:bon},repFausse:{c:mauvais},nature:"cardinaux",ens:{type:"card",A,B,cas}};}

/* ---------- intervalles : réunion, intersection, différence ---------- */
const {val,pc,unir,dansP,lisEns,memeEns}=AN;
const ptR=p=>p.a&&p.b&&p.a.v===p.b.v?`{${p.a.t}}`:`${p.oa?"]":"["}${p.a?p.a.t:"−∞"}, ${p.b?p.b.t:"+∞"}${p.ob?"[":"]"}`;
const ensR=P=>!P.length?"∅":P.length===1&&!P[0].a&&!P[0].b?"ℝ":P.map(ptR).join(" ∪ ");
const tapeR=P=>!P.length?"∅":P.length===1&&!P[0].a&&!P[0].b?"ℝ":P.map(p=>`${p.oa?"]":"["}${p.a?brut(p.a.q):"-∞"} ; ${p.b?brut(p.b.q):"+∞"}${p.ob?"[":"]"}`).join(" ∪ ");
const bas=p=>p.a?p.a.v:-Infinity,haut=p=>p.b?p.b.v:Infinity;
function interP(P,Q2){const out=[];P.forEach(p=>Q2.forEach(q=>{let a,oa,b,ob;
  if(bas(p)>bas(q)){a=p.a;oa=p.oa;}else if(bas(p)<bas(q)){a=q.a;oa=q.oa;}else{a=p.a;oa=p.oa||q.oa;}
  if(haut(p)<haut(q)){b=p.b;ob=p.ob;}else if(haut(p)>haut(q)){b=q.b;ob=q.ob;}else{b=p.b;ob=p.ob||q.ob;}
  const av=a?a.v:-Infinity,bv=b?b.v:Infinity;if(av<bv||(av===bv&&!oa&&!ob))out.push({a,oa:!a||oa,b,ob:!b||ob});}));return unir(out);}
function complP(P){const S=unir(P),out=[];let a=null,oa=true,fini=false;
  S.forEach(p=>{if(p.a){const av=a?a.v:-Infinity,ob=!p.oa;if(av<p.a.v||(a&&av===p.a.v&&!oa&&!ob))out.push({a,oa:!a||oa,b:p.a,ob});}
    if(p.b){a=p.b;oa=!p.ob;}else fini=true;});
  if(!fini)out.push({a,oa:!a||oa,b:null,ob:true});return out;}
const diffP=(P,Q2)=>interP(P,complP(Q2));
const CROC=[[false,false],[true,true],[false,true],[true,false]];
function intervalleAlea(R,lo,hi){const t=R();if(t<0.15){const o=R()<0.5;return [pc(null,true,val(R.ent(lo,hi)),o)];}if(t<0.3){const o=R()<0.5;return [pc(val(R.ent(lo,hi)),o,null,true)];}
  const a=R.ent(lo,hi-2),b=a+R.ent(1,5),[oa,ob]=R.choix(CROC);return [pc(val(a),oa,val(b),ob)];}
/* o : {sig, enonce, rappel, texte, Q:[[étiquette, morceaux, pourquoi, appartient(x)]], nature} : plusieurs parties de ℝ à écrire */
function partiesReelles(o){const ids=o.Q.map(x=>x[0]);
  function juge(rep){const L=ids.map(k=>lisEns((rep.c||{})[k]));if(L.some(x=>x==="ordre"))return {incomplet:"Dans un intervalle, la borne de gauche est la plus petite. Vérifie l'ordre de tes bornes."};
    if(L.some(x=>!x))return {incomplet:"Écris chaque ensemble avec des intervalles, par exemple ]-1 ; 3] ou ]-∞ ; 2[ ∪ [5 ; +∞[. Pour l'ensemble vide : ∅. Pour un seul nombre : {2}."};
    const F=ids.filter((k,i)=>!memeEns(L[i],o.Q[i][1]));if(!F.length)return {ok:true};const i=ids.indexOf(F[0]),autre=L[i].length?o.Q.find((x,j)=>j!==i&&memeEns(L[i],x[1])):null,croc=memeEns(L[i],o.Q[i][1],true);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${et(F)} ${F.length>1?"sont à revoir":"est à revoir"}.`,diag:{etape:i,type:croc?"crochets ouverts ou fermés":autre?"deux opérations sur les ensembles confondues":o.type||"opération sur des intervalles",titre:`Où ça part : ${F[0]}.`,
      msg:croc?`Les bornes sont justes, mais pas les crochets. Pour chaque borne, demande-toi si ce nombre est dans l'ensemble : ${fx(`${F[0]} = ${ensR(o.Q[i][1])}`)}.`:autre?`Tu as écrit ${fx(autre[0])}. ${o.Q[i][2]}`:o.Q[i][2]}};}
  const bon={},mauvais={};o.Q.forEach((x,i)=>{bon[x[0]]=tapeR(x[1]);mauvais[x[0]]=i?tapeR(x[1]):(x[1].length?"∅":"ℝ");});
  return {sig:o.sig,q:o.enonce,corps:o.rappel?`<p class="muted">${o.rappel}</p>`:"",texte:o.texte,champs:[{k:"cases",id:"c",noms:ids,large:true,sym:["[","]"," ; "," ∪ ","+∞","-∞","∅"],aide:"Avec des intervalles : ]-1 ; 3], ou ]-∞ ; 2[ ∪ [5 ; +∞[. Ensemble vide : ∅. Un seul nombre : {2}."}],juge,
    etapes:o.Q.map(x=>({w:`<b>${fx(`${x[0]} = ${ensR(x[1])}`)}</b>`,why:x[2],pts:1})),bonne:o.Q.map(x=>fx(`${x[0]} = ${ensR(x[1])}`)).join(" ; "),bonneTxt:o.Q.map(x=>`${x[0]} = ${ensR(x[1])}`).join(" ; "),
    repBonne:{c:bon},repFausse:{c:mauvais},nature:o.nature,ens:{type:"reels",tests:o.Q.map(x=>({P:x[1],m:x[3]}))}};}
function intervallesOps(R){for(;;){const A=intervalleAlea(R,-6,6),B=intervalleAlea(R,-6,6),un=unir(A.concat(B)),it=interP(A,B),ab=diffP(A,B),ba=diffP(B,A);if(!it.length&&R()<0.7)continue;if(memeEns(A,B))continue;
  const dA=x=>dansP(A,x),dB=x=>dansP(B,x),t=R.ent(0,1),QS=[["A ∪ B",un,"Un réel est dans la réunion quand il est dans A ou dans B : on met les deux intervalles bout à bout, et on regarde s'ils se recouvrent ou s'il reste un trou.",x=>dA(x)||dB(x)],
    ["A ∩ B",it,it.length?"Un réel est dans l'intersection quand il est dans A et dans B : c'est la partie commune. Elle commence au plus grand des deux débuts et finit au plus petit des deux bouts.":"A et B n'ont aucun réel en commun : l'intersection est vide.",x=>dA(x)&&dB(x)],
    t?["A ∖ B",ab,"On garde les réels de A qui ne sont pas dans B. Attention aux crochets : une borne de B qui est dans B est enlevée, une borne de B qui n'est pas dans B reste.",x=>dA(x)&&!dB(x)]:["B ∖ A",ba,"On garde les réels de B qui ne sont pas dans A. Attention aux crochets : une borne de A qui est dans A est enlevée, une borne de A qui n'est pas dans A reste.",x=>dB(x)&&!dA(x)]];
  return partiesReelles({sig:"IO"+ensR(A)+"|"+ensR(B)+t,enonce:`On pose ${fx(`A = ${ensR(A)}`)} et ${fx(`B = ${ensR(B)}`)}, deux parties de ℝ. Écris ${et(QS.map(x=>fx(x[0])))}.`,rappel:`Rappel : ${fx("A ∖ B")} contient les réels de A qui ne sont pas dans B. Dessine les deux intervalles sur une droite avant de répondre.`,
    texte:`A = ${ensR(A)}, B = ${ensR(B)} ; ${QS.map(x=>x[0]).join(", ")}`,nature:it.length?"se recouvrent":"séparés",Q:QS});}}
/* ∈ ou ⊂ : un ensemble dont certains éléments sont eux-mêmes des ensembles */
function appartientInclus(R){const a=R.ent(1,4),b=a+R.ent(1,3),c=b+R.ent(1,3),elts=R.mel([a,[b],[a,b],[],[c],c,[a,c]]).slice(0,R.ent(3,4));
  const cle=x=>JSON.stringify(x),dit=x=>Array.isArray(x)?(x.length?"{"+x.map(dit).join(", ")+"}":"∅"):String(x),dans=x=>elts.some(y=>cle(y)===cle(x)),inclus=X=>X.every(dans);
  const CAND=R.mel([[`${a} ∈ A`,dans(a)],[`{${a}} ∈ A`,dans([a])],[`{${a}} ⊂ A`,inclus([a])],[`{${b}} ∈ A`,dans([b])],[`{${b}} ⊂ A`,inclus([b])],[`${b} ∈ A`,dans(b)],[`{${a}, ${b}} ∈ A`,dans([a,b])],[`{${a}, ${b}} ⊂ A`,inclus([a,b])],[`∅ ⊂ A`,true],[`∅ ∈ A`,dans([])],[`{{${b}}} ⊂ A`,inclus([[b]])],[`${c} ∈ A`,dans(c)],[`{${c}} ⊂ A`,inclus([c])]]).slice(0,5);
  if(!CAND.some(x=>x[1])||CAND.every(x=>x[1]))return appartientInclus(R);
  const vraies=CAND.map((x,i)=>x[1]?String(i):null).filter(Boolean),pq=x=>/∈/.test(x[0])?`${fx(x[0])} est ${x[1]?"vrai":"faux"} : ce qui est à gauche de ∈ ${x[1]?"est":"n'est pas"} l'un des éléments écrits dans A.`:`${fx(x[0])} est ${x[1]?"vrai":"faux"} : ${/^∅/.test(x[0])?"l'ensemble vide est inclus dans tout ensemble":`chaque élément de l'ensemble de gauche ${x[1]?"est":"devrait être"} un élément de A${x[1]?"":", et ce n'est pas le cas"}`}.`;
  const E=[{w:`Les éléments de A sont : ${elts.map(x=>fx(dit(x))).join(" ; ")}. Il y en a ${elts.length}.`,why:"On les lit entre les accolades extérieures, séparés par les virgules extérieures. Un élément peut être lui-même un ensemble : {2} et 2 ne sont pas le même objet.",pts:1}].concat(CAND.map(x=>({w:`${fx(x[0])} : <b>${x[1]?"vrai":"faux"}</b>`,why:pq(x),pts:0.5})));
  function juge(rep){const S=(rep.v||[]).slice().sort();if(!S.length)return {incomplet:"Coche toutes les affirmations vraies. Il y en a au moins une."};if(S.join()===vraies.join())return {ok:true};
    const i=CAND.findIndex((x,k)=>S.includes(String(k))!==x[1]),x=CAND[i];
    return {ok:false,faux:["v"],resume:"Pas tout à fait : au moins une affirmation est mal classée.",diag:{etape:i+1,type:/∈/.test(x[0])?"appartenir (∈) et être inclus (⊂) confondus":"inclusion : chaque élément doit appartenir",titre:`Où ça part : ${x[0]}.`,msg:pq(x)+" ∈ parle d'un élément de A ; ⊂ parle d'un ensemble dont tous les éléments sont dans A."}};}
  return {sig:"AI"+cle(elts)+CAND.map(x=>x[0]).join("|"),q:`On pose ${fx(`A = {${elts.map(dit).join(", ")}}`)}. Parmi les affirmations suivantes, coche toutes celles qui sont vraies.`,corps:`<p class="muted">Rappel : ${fx("x ∈ A")} veut dire que x est un élément de A. ${fx("B ⊂ A")} veut dire que B est un ensemble dont tous les éléments sont dans A.</p>`,
    texte:`A = {${elts.map(dit).join(", ")}} ; vraies parmi : ${CAND.map(x=>x[0]).join(" ; ")}`,champs:[{k:"multi",id:"v",o:CAND.map((x,i)=>[String(i),x[0]])}],juge,etapes:E,bonne:vraies.map(i=>fx(CAND[+i][0])).join(" ; "),bonneTxt:"vraies : "+vraies.map(i=>CAND[+i][0]).join(" ; "),
    repBonne:{v:vraies},repFausse:{v:CAND.map((x,i)=>x[1]?null:String(i)).filter(Boolean)},nature:"∈ ou ⊂",ens:{type:"appart",elts,cand:CAND}};}

/* ---------- RA2 : image directe, image réciproque ---------- */
const defIm=reel=>`Rappel : ${fx("f(A)")} est l'ensemble des images des éléments de A. ${fx("f⁻¹(B)")} est l'ensemble des ${reel?"réels":"éléments de E"} dont l'image est dans B : il existe même si f n'est pas bijective.`,DEFIM=defIm(true);
/* une application entre deux ensembles finis, donnée par ses valeurs */
function appliFinie(R,ne,nf){const E=[...Array(ne)].map((_,i)=>i+1),F=[...Array(nf)].map((_,i)=>i+1),f={};E.forEach(x=>{f[x]=R.choix(F);});return {E,F,f,dit:E.map(x=>`f(${x}) = ${f[x]}`).join(", ")};}
const imageF=(a,A)=>tri(A.map(x=>a.f[x])),recipF=(a,B)=>a.E.filter(x=>B.includes(a.f[x]));
function imagesFinies(R){for(;;){const a=appliFinie(R,R.ent(5,6),R.ent(4,5)),A=partie(R,a.E,2,3),B=partie(R,a.F,2,3),fa=imageF(a,A),fb=recipF(a,B);if(new Set(Object.values(a.f)).size<3)continue;
  return ensemblesFinis({sig:"IF"+a.dit+"|"+A+"|"+B,enonce:`Soit f l'application de ${fx(`E = ${ensF(a.E)}`)} dans ${fx(`F = ${ensF(a.F)}`)} définie par : ${fx(a.dit)}. On pose ${fx(`A = ${ensF(A)}`)} et ${fx(`B = ${ensF(B)}`)}. Écris l'image directe ${fx("f(A)")} et l'image réciproque ${fx("f⁻¹(B)")}.`,rappel:defIm(false),
    texte:`${a.dit} ; A = ${ensF(A)}, B = ${ensF(B)} ; f(A) et f⁻¹(B)`,nature:fb.length?"finie":"finie, réciproque vide",ens:{type:"finisf",f:a.f,E:a.E,A,B},
    pieges:[["f⁻¹(B)",imageF(a,B.filter(x=>a.E.includes(x))),"image réciproque calculée comme une image directe","Tu as calculé les images des éléments de B. Pour l'image réciproque, on cherche au contraire les éléments de E dont l'image tombe dans B."]],
    Q:[["f(A)",fa,`On calcule l'image de chaque élément de A : ${A.map(x=>`f(${x}) = ${a.f[x]}`).join(", ")}. On écrit chaque résultat une seule fois.`],["f⁻¹(B)",fb,`On passe tous les éléments de E en revue, et on garde ceux dont l'image est dans B : ${a.E.map(x=>`f(${x}) = ${a.f[x]} ${B.includes(a.f[x])?"est":"n'est pas"} dans B`).join(", ")}.${fb.length?"":" Aucun ne convient : l'image réciproque est vide."}`]]});}}
/* image et image réciproque d'un intervalle par x ↦ ax + b */
const vq=x=>val(x),Qd=(n,d)=>Q(n,d);
function affineIm(a,b,p,inverse){const f=inverse?x=>O.div(O.sub(x,b),a):x=>O.add(O.mul(a,x),b),ga=p.a?vq(f(p.a.q)):null,gb=p.b?vq(f(p.b.q)):null;return a>0?pc(ga,p.oa,gb,p.ob):pc(gb,p.ob,ga,p.oa);}
function imagesAffines(R){for(;;){const a=R.nz(-4,4),b=R.ent(-6,6);if(a===1&&b===0)continue;const A=intervalleAlea(R,-5,5),B=intervalleAlea(R,-8,8),fA=[affineIm(a,b,A[0],false)],fB=[affineIm(a,b,B[0],true)];if(fB[0].a&&fB[0].a.q.d>4||fB[0].b&&fB[0].b.q.d>4)continue;
  const ax=O.comb([a],["x"])+(b?(b>0?" + ":" − ")+Math.abs(b):""),f=x=>a*x+b,sens=a>0?"f est croissante : elle garde l'ordre, et les crochets restent du même côté.":"f est décroissante (le coefficient de x est négatif) : elle retourne l'ordre. La plus grande borne de départ donne la plus petite à l'arrivée, et chaque crochet suit sa borne.";
  return partiesReelles({sig:"IA"+[a,b]+ensR(A)+ensR(B),enonce:`Soit f l'application de ℝ dans ℝ définie par ${fx(`f(x) = ${ax}`)}. On pose ${fx(`A = ${ensR(A)}`)} et ${fx(`B = ${ensR(B)}`)}. Écris l'image directe ${fx("f(A)")} et l'image réciproque ${fx("f⁻¹(B)")}.`,rappel:DEFIM,texte:`f(x) = ${ax} ; A = ${ensR(A)}, B = ${ensR(B)} ; f(A) et f⁻¹(B)`,nature:a>0?"croissante":"décroissante",type:"image d'un intervalle par une fonction affine",
    Q:[["f(A)",fA,`On calcule les images des bornes de A. ${sens}`,y=>dansP(A,(y-b)/a)],["f⁻¹(B)",fB,`${fx("x ∈ f⁻¹(B)")} veut dire ${fx(`${ax} ∈ B`)}. On résout l'encadrement : ${[b?`on ${b>0?"retire":"ajoute"} ${Math.abs(b)}`:"",a===1?"":`on divise par ${fx(nb(a))}${a<0?", ce qui retourne les inégalités":""}`].filter(Boolean).join(", puis ")}.`,x=>dansP(B,f(x))]]});}}
/* x ↦ x² + c ou |x| + c : l'image d'un intervalle, et l'image réciproque (un ou deux morceaux) */
function imCarre(p,c,abs){const g=abs?x=>Math.abs(x):x=>x*x,G=v=>vq(g(v)+c),pa=p.a?p.a.v:-Infinity,pb=p.b?p.b.v:Infinity;
  if(pa>=0)return [pc(G(pa),p.oa,p.b?G(pb):null,p.ob)];if(pb<=0)return [pc(G(pb),p.ob,p.a?G(pa):null,p.oa)];
  const ma=p.a?g(pa):Infinity,mb=p.b?g(pb):Infinity,haut_=Math.max(ma,mb);if(haut_===Infinity)return [pc(vq(c),false,null,true)];
  const ouvert=ma===mb?p.oa&&p.ob:ma>mb?p.oa:p.ob;return [pc(vq(c),false,vq(haut_+c),ouvert)];}
function recCarre(p,c,abs){const r=abs?v=>v:v=>Math.sqrt(v),lo=p.a?p.a.v-c:-Infinity,hi=p.b?p.b.v-c:Infinity;   /* g(x) ∈ ]lo, hi[ avec g = x² ou |x| */
  if(hi<0||(hi===0&&p.ob))return [];const H=hi===Infinity?null:vq(r(hi)),mH=H?vq(-r(hi)):null;
  if(lo<0||(lo===0&&!p.oa))return [pc(mH,p.ob,H,p.ob)];
  const L=vq(r(lo)),mL=vq(-r(lo));return unir([pc(mH,p.ob,mL,p.oa),pc(L,p.oa,H,p.ob)]);}
const CARRES=[0,1,4,9,16];
function imagesCarre(R){for(;;){const abs=R()<0.25,c=R()<0.6?0:R.ent(-3,3),a=R.ent(-4,3),A=[pc(val(a),R()<0.5,val(a+R.ent(1,5)),R()<0.5)],t=R();let B;
  const bd=k=>val((abs?k:R.choix(CARRES.filter(x=>x>=k&&x<=k+12)))+c);
  if(t<0.3){const lo=R.choix(abs?[1,2,3]:[1,4]),hi=abs?lo+R.ent(1,3):R.choix(CARRES.filter(x=>x>lo));B=[pc(val(lo+c),R()<0.5,val(hi+c),R()<0.5)];}
  else if(t<0.6){const hi=abs?R.ent(1,4):R.choix([1,4,9,16]);B=[pc(val(c-R.ent(1,5)),R()<0.5,val(hi+c),R()<0.5)];}
  else if(t<0.8){const hi=abs?R.ent(1,4):R.choix([1,4,9]);B=[pc(val(c),R()<0.5,val(hi+c),R()<0.5)];}
  else B=[pc(val(c-R.ent(3,6)),R()<0.5,val(c-R.ent(0,2)),R()<0.5)];
  if(B[0].a.v>=B[0].b.v)continue;const g=abs?x=>Math.abs(x):x=>x*x,f=x=>g(x)+c,fA=imCarre(A[0],c,abs),fB=recCarre(B[0],c,abs),fx_=(abs?"|x|":"x²")+(c?(c>0?" + ":" − ")+Math.abs(c):"");
  const rA=abs?v=>v:v=>Math.sqrt(v);
  return partiesReelles({sig:"IC"+[abs,c]+ensR(A)+ensR(B),enonce:`Soit f l'application de ℝ dans ℝ définie par ${fx(`f(x) = ${fx_}`)}. On pose ${fx(`A = ${ensR(A)}`)} et ${fx(`B = ${ensR(B)}`)}. Écris l'image directe ${fx("f(A)")} et l'image réciproque ${fx("f⁻¹(B)")}.`,rappel:DEFIM,texte:`f(x) = ${fx_} ; A = ${ensR(A)}, B = ${ensR(B)} ; f(A) et f⁻¹(B)`,nature:fB.length>1?"deux morceaux":fB.length?"un morceau":"vide",type:"image ou image réciproque par une fonction qui n'est pas monotone",
    Q:[["f(A)",fA,A[0].a.v<0&&A[0].b.v>0?`A contient 0 : la plus petite valeur de f sur A est ${fx(`f(0) = ${nb(c)}`)}, et elle est atteinte. La plus grande vient de la borne la plus éloignée de 0, avec son crochet.`:`Sur A, f est ${A[0].a.v>=0?"croissante : les bornes gardent leur ordre":"décroissante : les bornes échangent leur place, chacune avec son crochet"}.`,y=>{if(y-c<0)return false;const r=rA(y-c);return dansP(A,r)||dansP(A,-r);}],
      ["f⁻¹(B)",fB,!fB.length?`${fx(fx_)} vaut au moins ${nb(c)} : il ne tombe jamais dans B. L'image réciproque est vide.`:fB.length>1?`${fx(`${fx_} ∈ B`)} donne un encadrement de ${abs?"|x|":"x²"} entre deux nombres positifs : x est alors soit du côté positif, soit du côté négatif. Il y a deux morceaux, symétriques par rapport à 0.`:`La partie de B située sous ${nb(c)} ne sert à rien, car ${fx(fx_)} vaut au moins ${nb(c)}. Il reste une condition du type ${fx(abs?"|x| ≤ r":"x² ≤ r²")}, qui donne un seul intervalle centré en 0.`,x=>dansP(B,f(x))]]});}}
/* f⁻¹(f(A)) et f(f⁻¹(B)) : on compare à A et à B */
function allerRetour(R){for(;;){const c=0,a=R.ent(-3,2),A=[pc(val(a),R()<0.5,val(a+R.ent(1,4)),R()<0.5)],lo=R.ent(-4,1),hi=R.choix([1,4,9]),B=[pc(val(lo),R()<0.5,val(hi),R()<0.5)];if(lo>=hi)continue;
  const fA=imCarre(A[0],c,false),retA=unir(fA.map(p=>recCarre(p,c,false)).flat()),fB=recCarre(B[0],c,false),allB=unir(fB.map(p=>imCarre(p,c,false)).flat());if(!fB.length)continue;
  const egA=memeEns(retA,A),egB=memeEns(allB,B),f=x=>x*x;
  return partiesReelles({sig:"AR"+ensR(A)+ensR(B),enonce:`Soit f l'application de ℝ dans ℝ définie par ${fx("f(x) = x²")}. On pose ${fx(`A = ${ensR(A)}`)} et ${fx(`B = ${ensR(B)}`)}. Écris ${fx("f⁻¹(f(A))")} et ${fx("f(f⁻¹(B))")}.`,rappel:DEFIM,texte:`f(x) = x² ; A = ${ensR(A)}, B = ${ensR(B)} ; f⁻¹(f(A)) et f(f⁻¹(B))`,nature:(egA?"=":"⊋")+" "+(egB?"=":"⊊"),type:"aller-retour entre image directe et image réciproque",
    Q:[["f⁻¹(f(A))",retA,`D'abord ${fx(`f(A) = ${ensR(fA)}`)}, puis on cherche tous les réels dont le carré est dans cet ensemble. ${egA?"Ici on retombe sur A.":"On trouve plus que A : les opposés des éléments de A ont les mêmes carrés. On a toujours A ⊂ f⁻¹(f(A)), avec égalité pour toute partie A seulement quand f est injective."}`,x=>{const y=f(x),r=Math.sqrt(y);return dansP(A,r)||dansP(A,-r);}],
      ["f(f⁻¹(B))",allB,`D'abord ${fx(`f⁻¹(B) = ${ensR(fB)}`)}, puis on prend les carrés de ces réels. ${egB?"Ici on retombe sur B.":"On trouve moins que B : les nombres négatifs de B ne sont le carré de personne. On a toujours f(f⁻¹(B)) ⊂ B (c'est la question b du CC2 2025), avec égalité pour toute partie B seulement quand f est surjective."}`,y=>y>=0&&dansP(B,y)]]});}}

/* ---------- RA1 : injective, surjective, bijective ---------- */
const DEFINJ=`Rappel : f est injective quand deux éléments différents ont toujours deux images différentes. f est surjective quand chaque élément de l'ensemble d'arrivée a au moins un antécédent. Bijective : les deux à la fois.`;
const OUINON=k=>[["oui",`${k} : oui`],["non",`${k} : non`]];
const plusC=(t,c)=>c?`${t} ${c>0?"+":"−"} ${Math.abs(c)}`:t;
const dec=x=>String(Math.round(x*1000)/1000).replace(".",",").replace("-","−");
/* une application avec sa formule : départ D, arrivée A (texte + test), injective ?, surjective ?, ant(y) = un antécédent ou null,
   meme = deux éléments de même image, sans = un élément sans antécédent, inv = [réciproque affichée, réciproque tapée] */
function appliFormule(R,sorte){const c=R.ent(-4,4),k=R.ent(1,4),C=nb(c);
  const R_={t:"ℝ",in:()=>true},Rp={t:"[0, +∞[",in:x=>x>=0},Rc={t:`[${C}, +∞[`,in:y=>y>=c},Rcc={t:`]${C}, +∞[`,in:y=>y>c},Rs={t:"ℝ*",in:x=>x!==0,note:"ℝ* est l'ensemble des réels différents de 0."};
  const N_={t:"ℕ",in:x=>Number.isInteger(x)&&x>=0,ent:true},Z_={t:"ℤ",in:x=>Number.isInteger(x),ent:true};
  if(sorte==="reels"){let a=R.nz(-4,4),b,d;if(a===1&&c===0)a=2;do{d=R.ent(1,4);b=R.ent(-5,5);}while(b===a*d);
    const ax=plusC(O.comb([a],["x"]),c),ymc=plusC("y",-c),X2=plusC("x²",c),AB=plusC("|x|",c),X3=plusC("x³",c),EX=plusC("e^x",c),carre=y=>y>=c?Math.sqrt(y-c):null;
    const invA=a===1?ymc:a===-1?(c?`${C} − y`:"−y"):`${c?`(${ymc})`:"y"}/${a<0?`(${nb(a)})`:a}`,rac=c?`√(${ymc})`:"√y",ln=c?`ln(${ymc})`:"ln(y)";
    const hom=`(${plusC(O.comb([a],["x"]),b)})/(x + ${d})`,invH=`(${b?`${nb(b)} − `:"−"}${d===1?"":d}y)/(${plusC("y",-a)})`,Rd={t:`ℝ ∖ {${nb(-d)}}`,in:x=>x!==-d,note:`ℝ ∖ {${nb(-d)}} est l'ensemble des réels différents de ${nb(-d)}.`},Ra={t:`ℝ ∖ {${nb(a)}}`,in:y=>y!==a,note:`ℝ ∖ {${nb(a)}} est l'ensemble des réels différents de ${nb(a)}.`};
    const croix=`Si ${fx("f(x₁) = f(x₂)")}, le produit en croix donne ${fx(`${nb(a*d-b)}(x₁ − x₂) = 0`)}, donc ${fx("x₁ = x₂")}.`,crois="La fonction est strictement croissante sur ℝ : deux réels différents ont des images différentes.",pos=`Sur ${fx("[0, +∞[")}, la fonction est strictement croissante : deux réels positifs différents ont des images différentes.`;
    const aff={fam:"affine",e:ax,D:R_,A:R_,f:x=>a*x+c,inj:true,surj:true,ant:y=>(y-c)/a,inv:[invA,`(y-(${c}))/(${a})`],pas:`${c?`On ${c>0?"retire":"ajoute"} ${Math.abs(c)} des deux côtés : ${fx(`${ymc} = ${O.comb([a],["x"])}`)}. `:""}${a===1?"":a===-1?"On change le signe des deux côtés.":`On divise par ${nb(a)}.`}`,pi:`Si ${fx("f(x₁) = f(x₂)")}, alors ${fx(`${plusC(O.comb([a],["x₁"]),c)} = ${plusC(O.comb([a],["x₂"]),c)}`)}, donc ${fx("x₁ = x₂")}.`,ps:`Pour tout réel y, l'équation ${fx(`${ax} = y`)} a une solution : ${fx(`x = ${invA}`)}.`};
    const homB={fam:"quotient",e:hom,D:Rd,A:Ra,f:x=>(a*x+b)/(x+d),inj:true,surj:true,ant:y=>y!==a?(b-d*y)/(y-a):null,inv:[invH,`(${b}-${d}*y)/(y-(${a}))`],pas:`On multiplie par ${fx(`x + ${d}`)} : ${fx(`y(x + ${d}) = ${plusC(O.comb([a],["x"]),b)}`)}. On développe, puis on met les x à gauche : ${fx(`x(${plusC("y",-a)}) = ${b?`${nb(b)} − `:"−"}${d===1?"":d}y`)}. Comme y est différent de ${nb(a)}, on divise par ${fx(plusC("y",-a))}.`,pi:croix,ps:`Pour tout y différent de ${nb(a)}, l'équation ${fx("f(x) = y")} a une solution : ${fx(`x = ${invH}`)}, qu'on trouve en isolant x.`};
    return R.choix([aff,aff,homB,homB,
     {fam:"carré",e:X2,D:R_,A:R_,f:x=>x*x+c,inj:false,surj:false,ant:carre,meme:[1,-1],sans:c-1,pi:`${fx(`f(1) = f(−1) = ${nb(1+c)}`)} : deux réels différents ont la même image.`,ps:`${fx(X2)} vaut au moins ${C} : le nombre ${nb(c-1)} n'a pas d'antécédent.`},
     {fam:"carré",e:X2,D:R_,A:Rc,f:x=>x*x+c,inj:false,surj:true,ant:carre,meme:[2,-2],pi:`${fx(`f(2) = f(−2) = ${nb(4+c)}`)} : deux réels différents ont la même image.`,ps:`Tout y de ${fx(Rc.t)} a un antécédent : ${fx(`x = ${rac}`)}, car ${fx(`${ymc} ≥ 0`)}.`},
     {fam:"carré",e:X2,D:Rp,A:R_,f:x=>x*x+c,inj:true,surj:false,ant:carre,sans:c-2,pi:pos,ps:`${fx(X2)} vaut au moins ${C} : le nombre ${nb(c-2)} n'a pas d'antécédent.`},
     {fam:"carré",e:X2,D:Rp,A:Rc,f:x=>x*x+c,inj:true,surj:true,ant:carre,inv:[rac,`√(y-(${c}))`],pas:`${c?`On isole x² : ${fx(`x² = ${ymc}`)}. `:""}Comme x est positif ou nul, x est la racine carrée de ce nombre (et pas son opposé).`,pi:pos,ps:`Tout y de ${fx(Rc.t)} a un antécédent positif : ${fx(`x = ${rac}`)}.`},
     {fam:"valeur absolue",e:AB,D:R_,A:R_,f:x=>Math.abs(x)+c,inj:false,surj:false,ant:y=>y>=c?y-c:null,meme:[3,-3],sans:c-1,pi:`${fx(`f(3) = f(−3) = ${nb(3+c)}`)} : deux réels différents ont la même image.`,ps:`${fx(AB)} vaut au moins ${C} : le nombre ${nb(c-1)} n'a pas d'antécédent.`},
     {fam:"valeur absolue",e:AB,D:R_,A:Rc,f:x=>Math.abs(x)+c,inj:false,surj:true,ant:y=>y>=c?y-c:null,meme:[1,-1],pi:`${fx(`f(1) = f(−1) = ${nb(1+c)}`)} : deux réels différents ont la même image.`,ps:`Tout y de ${fx(Rc.t)} a un antécédent : ${fx(`x = ${ymc}`)}, qui est positif ou nul.`},
     {fam:"cube",e:X3,D:R_,A:R_,f:x=>x*x*x+c,inj:true,surj:true,ant:y=>Math.cbrt(y-c),pi:crois,ps:`Tout réel y a un antécédent : la racine cubique de ${fx(ymc)}.`},
     {fam:"exponentielle",e:EX,D:R_,A:R_,f:x=>Math.exp(x)+c,inj:true,surj:false,ant:y=>y>c?Math.log(y-c):null,sans:c-k,pi:"L'exponentielle est strictement croissante sur ℝ : deux réels différents ont des images différentes.",ps:`Une exponentielle est strictement positive, donc ${fx(EX)} est strictement plus grand que ${C} : le nombre ${nb(c-k)} n'a pas d'antécédent (${C} non plus).`},
     {fam:"exponentielle",e:EX,D:R_,A:Rcc,f:x=>Math.exp(x)+c,inj:true,surj:true,ant:y=>y>c?Math.log(y-c):null,inv:[ln,`ln(y-(${c}))`],pas:`${c?`On isole l'exponentielle : ${fx(`e^x = ${ymc}`)}. `:""}Ce nombre est strictement positif : on prend son logarithme.`,pi:"L'exponentielle est strictement croissante sur ℝ : deux réels différents ont des images différentes.",ps:`Tout y de ${fx(Rcc.t)} a un antécédent : ${fx(`x = ${ln}`)}, car ${fx(`${ymc} &gt; 0`)}.`},
     {fam:"inverse",e:"1/x",D:Rs,A:R_,f:x=>1/x,inj:true,surj:false,ant:y=>y!==0?1/y:null,sans:0,pi:`Si ${fx("1/x₁ = 1/x₂")}, alors ${fx("x₁ = x₂")}.`,ps:"Un inverse n'est jamais nul : 0 n'a pas d'antécédent."},
     {fam:"inverse",e:"1/x",D:Rs,A:Rs,f:x=>1/x,inj:true,surj:true,ant:y=>y!==0?1/y:null,inv:["1/y","1/y"],pas:"y n'est pas nul : on prend l'inverse des deux côtés.",pi:`Si ${fx("1/x₁ = 1/x₂")}, alors ${fx("x₁ = x₂")}.`,ps:`Tout y différent de 0 a un antécédent : ${fx("x = 1/y")}, qui est bien différent de 0.`},
     {fam:"quotient",e:hom,D:Rd,A:R_,f:x=>(a*x+b)/(x+d),inj:true,surj:false,ant:y=>y!==a?(b-d*y)/(y-a):null,sans:a,pi:croix,ps:`L'équation ${fx(`f(x) = ${nb(a)}`)} n'a pas de solution : en multipliant par ${fx(`x + ${d}`)}, elle donnerait ${fx(`${nb(b)} = ${nb(a*d)}`)}. Le nombre ${nb(a)} n'a pas d'antécédent.`}]);}
  const ent=sq=>y=>y>=0&&Number.isInteger(Math.sqrt(y))?Math.sqrt(y):null,m=k+1;
  return R.choix([
   {fam:"n + k",e:`n + ${k}`,D:N_,A:N_,f:n=>n+k,inj:true,surj:false,ant:y=>y>=k?y-k:null,sans:0,pi:`Si ${fx(`n₁ + ${k} = n₂ + ${k}`)}, alors ${fx("n₁ = n₂")}.`,ps:`Pour atteindre 0, il faudrait ${fx(`n = −${k}`)}, qui n'est pas dans ℕ : 0 n'a pas d'antécédent.`},
   {fam:"n + k",e:`n + ${k}`,D:Z_,A:Z_,f:n=>n+k,inj:true,surj:true,ant:y=>y-k,pi:`Si ${fx(`n₁ + ${k} = n₂ + ${k}`)}, alors ${fx("n₁ = n₂")}.`,ps:`Tout entier relatif y a un antécédent : ${fx(`y − ${k}`)}, qui est encore dans ℤ.`},
   {fam:"multiple",e:`${m}n`,D:N_,A:N_,f:n=>m*n,inj:true,surj:false,ant:y=>y%m===0?y/m:null,sans:1,pi:`Si ${fx(`${m}n₁ = ${m}n₂`)}, alors ${fx("n₁ = n₂")}.`,ps:`Les images sont les multiples de ${m} : 1 n'a pas d'antécédent.`},
   {fam:"multiple",e:`${m}n`,D:Z_,A:Z_,f:n=>m*n,inj:true,surj:false,ant:y=>y%m===0?y/m:null,sans:1,pi:`Si ${fx(`${m}n₁ = ${m}n₂`)}, alors ${fx("n₁ = n₂")}.`,ps:`Les images sont les multiples de ${m} : 1 n'a pas d'antécédent.`},
   {fam:"carré",e:"n²",D:N_,A:N_,f:n=>n*n,inj:true,surj:false,ant:ent(),sans:2,pi:"Deux entiers naturels différents ont des carrés différents.",ps:"2 n'est le carré d'aucun entier : il n'a pas d'antécédent."},
   {fam:"carré",e:"n²",D:Z_,A:Z_,f:n=>n*n,inj:false,surj:false,ant:ent(),meme:[2,-2],sans:-1,pi:`${fx("f(2) = f(−2) = 4")} : deux entiers différents ont la même image.`,ps:"Un carré n'est jamais négatif : −1 n'a pas d'antécédent."},
   {fam:"carré",e:"n²",D:Z_,A:N_,f:n=>n*n,inj:false,surj:false,ant:ent(),meme:[1,-1],sans:3,pi:`${fx("f(1) = f(−1) = 1")} : deux entiers différents ont la même image.`,ps:"3 n'est le carré d'aucun entier : il n'a pas d'antécédent."},
   {fam:"valeur absolue",e:"|n|",D:Z_,A:N_,f:n=>Math.abs(n),inj:false,surj:true,ant:y=>y,meme:[3,-3],pi:`${fx("f(3) = f(−3) = 3")} : deux entiers différents ont la même image.`,ps:"Tout entier naturel y est sa propre valeur absolue : y est un antécédent de y."},
   {fam:"valeur absolue",e:`|n| + ${k}`,D:Z_,A:N_,f:n=>Math.abs(n)+k,inj:false,surj:false,ant:y=>y>=k?y-k:null,meme:[2,-2],sans:0,pi:`${fx(`f(2) = f(−2) = ${2+k}`)} : deux entiers différents ont la même image.`,ps:`${fx(`|n| + ${k}`)} vaut au moins ${k} : 0 n'a pas d'antécédent.`},
   {fam:"quotient entier",e:`n div ${m}`,D:N_,A:N_,f:n=>Math.floor(n/m),inj:false,surj:true,ant:y=>m*y,meme:[m,m+1],note:`« n div ${m} » est le quotient de la division de n par ${m} : par exemple ${3*m+1} div ${m} = 3.`,pi:`${fx(`f(${m}) = f(${m+1}) = 1`)} : deux entiers différents ont la même image.`,ps:`Tout entier naturel y a un antécédent : ${fx(`${m}y`)}.`},
   {fam:"k − n",e:`${k} − n`,D:Z_,A:Z_,f:n=>k-n,inj:true,surj:true,ant:y=>k-y,pi:`Si ${fx(`${k} − n₁ = ${k} − n₂`)}, alors ${fx("n₁ = n₂")}.`,ps:`Tout entier relatif y a un antécédent : ${fx(`${k} − y`)}.`},
   {fam:"n − k",e:`n − ${k}`,D:N_,A:Z_,f:n=>n-k,inj:true,surj:false,ant:y=>y>=-k?y+k:null,sans:-k-1,pi:`Si ${fx(`n₁ − ${k} = n₂ − ${k}`)}, alors ${fx("n₁ = n₂")}.`,ps:`Pour atteindre ${nb(-k-1)}, il faudrait ${fx("n = −1")}, qui n'est pas dans ℕ : ${nb(-k-1)} n'a pas d'antécédent.`}]);}
const ecritAppli=o=>`f : ${o.D.t} → ${o.A.t}, ${o.D.ent?"n":"x"} ↦ ${o.e}`;
const notes=o=>[o.D.note,o.A.note!==o.D.note?o.A.note:null,o.note].filter(Boolean).map(x=>" "+x).join("");
function classe(o,sig,q,corps,texte,ens,nature){
  const E=[{w:`<b>${o.inj?"f est injective.":"f n'est pas injective."}</b>`,why:o.pi,pts:1.5},{w:`<b>${o.surj?"f est surjective.":"f n'est pas surjective."}</b>`,why:o.ps,pts:1.5}].concat(o.inj&&o.surj?[{w:"<b>f est bijective.</b>",why:"Injective et surjective à la fois : chaque élément de l'ensemble d'arrivée a exactement un antécédent.",pts:0.5}]:[]);
  function juge(rep){if(!rep.i||!rep.s)return {incomplet:"Réponds aux deux questions : injective, puis surjective."};const okI=(rep.i==="oui")===o.inj,okS=(rep.s==="oui")===o.surj,F=[];if(okI&&okS)return {ok:true};if(!okI)F.push("i");if(!okS)F.push("s");
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux réponses sont à revoir":F[0]==="i"?"l'injectivité est à revoir":"la surjectivité est à revoir"}.`,diag:!okI?{etape:0,type:o.inj?"application injective non reconnue":"application crue injective",titre:"Où ça part : injective ou pas.",msg:o.pi}:{etape:1,type:o.surj?"application surjective non reconnue":"application crue surjective : l'ensemble d'arrivée compte",titre:"Où ça part : surjective ou pas.",msg:o.ps+" Regarde bien l'ensemble d'arrivée : c'est lui qui décide."}};}
  const dit=`${o.inj?"injective":"pas injective"}, ${o.surj?"surjective":"pas surjective"}`;
  return {sig,q,corps,texte,champs:[{k:"choix",id:"i",o:OUINON("Injective")},{k:"choix",id:"s",o:OUINON("Surjective")}],juge,etapes:E,bonne:dit+(o.inj&&o.surj?" : bijective":""),bonneTxt:dit,repBonne:{i:o.inj?"oui":"non",s:o.surj?"oui":"non"},repFausse:{i:o.inj?"oui":"non",s:o.surj?"non":"oui"},nature,ens};}
function fleches(R){const sorte=R.ent(0,3),n=sorte===2?R.ent(4,5):R.ent(3,4),m=sorte===1?n+1:sorte===2?n-1:n,E=[...Array(n)].map((_,i)=>i+1),F=[...Array(m)].map((_,i)=>i+1),f={};
  if(sorte<2)R.mel(F).slice(0,n).forEach((y,i)=>{f[E[i]]=y;});else if(sorte===2){R.mel(F).forEach((y,i)=>{f[E[i]]=y;});E.slice(m).forEach(x=>{f[x]=R.choix(F);});}else E.forEach(x=>{f[x]=R.choix(F.slice(0,m-1));});
  const V=E.map(x=>f[x]),inj=new Set(V).size===n,surj=F.every(y=>V.includes(y)),dbl=F.find(y=>V.filter(v=>v===y).length>1),seul=F.find(y=>!V.includes(y)),dit=E.map(x=>`f(${x}) = ${f[x]}`).join(", ");
  const o={inj,surj,pi:inj?`Les images ${V.join(", ")} sont toutes différentes : aucun élément de F n'est atteint deux fois.`:`${E.filter(x=>f[x]===dbl).map(x=>`f(${x})`).join(" = ")} = ${dbl} : deux éléments différents ont la même image.`,ps:surj?`Chaque élément de F est l'image de quelqu'un : ${F.map(y=>`${y} = f(${E.find(x=>f[x]===y)})`).join(", ")}.`:`${seul} n'est l'image de personne : il n'a pas d'antécédent.`};
  return classe(o,"FL"+dit+"|"+m,`Soit f l'application de ${fx(`E = ${ensF(E)}`)} dans ${fx(`F = ${ensF(F)}`)} définie par : ${fx(dit)}. f est-elle injective ? Est-elle surjective ?`,`<p class="muted">${DEFINJ}</p>`,`${dit} ; de {1..${n}} dans {1..${m}} ; injective ? surjective ?`,{type:"fini",f,E,F},"valeurs");}
function formule(R,sorte){const o=appliFormule(R,sorte),ea=ecritAppli(o);
  return classe(o,"FO"+ea,`Soit ${fx(ea)}. f est-elle injective ? Est-elle surjective ?`,`<p class="muted">${DEFINJ}${notes(o)}</p>`,`${ea} ; injective ? surjective ?`,{type:"formule",o},o.fam);}
function contreExemple(R){let o;do o=appliFormule(R,R()<0.5?"reels":"entiers");while(o.inj&&o.surj);const veutInj=!o.inj&&(o.surj||R()<0.5),ea=ecritAppli(o),v=o.D.ent?"n":"x",lis=t=>{const x=O.calcule(t,{});return x===null||!Number.isFinite(x)?null:x;},proche=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
  const E=[veutInj?{w:`Par exemple ${fx(`${v}₁ = ${nb(o.meme[0])}`)} et ${fx(`${v}₂ = ${nb(o.meme[1])}`)} : ils sont différents, et ${fx(`f(${nb(o.meme[0])}) = f(${nb(o.meme[1])}) = ${nb(o.f(o.meme[0]))}`)}.`,why:"Un seul contre-exemple suffit pour montrer qu'une application n'est pas injective. N'importe quel autre couple d'éléments différents qui ont la même image convient aussi.",pts:3}
    :{w:`Par exemple ${fx(`y = ${nb(o.sans)}`)} : il est dans l'ensemble d'arrivée ${fx(o.A.t)}, et il n'a pas d'antécédent.`,why:`${o.ps} Un seul élément sans antécédent suffit pour montrer qu'une application n'est pas surjective.`,pts:3}];
  function juge(rep){const c=rep.c||{};
    if(veutInj){const a=lis(c[v+"₁"]),b=lis(c[v+"₂"]);if(a===null||b===null)return {incomplet:"Écris deux nombres dans les deux cases."};
      if(!o.D.in(a)||!o.D.in(b))return {ok:false,faux:[v+"₁",v+"₂"].filter((k,i)=>!o.D.in(i?b:a)),resume:"Pas tout à fait : un des deux nombres n'est pas dans l'ensemble de départ.",diag:{etape:0,type:"contre-exemple pris hors de l'ensemble de départ",titre:"Où ça part : l'ensemble de départ.",msg:`Les deux nombres doivent être dans ${fx(o.D.t)}.`}};
      if(a===b)return {ok:false,faux:[v+"₂"],resume:"Pas tout à fait : il faut deux nombres différents.",diag:{etape:0,type:"contre-exemple avec deux fois le même nombre",titre:"Où ça part : deux éléments différents.",msg:"Deux fois le même nombre ont forcément la même image : cela ne montre rien. Il faut deux nombres différents qui ont la même image."}};
      if(proche(o.f(a),o.f(b)))return {ok:true};
      return {ok:false,faux:[v+"₁",v+"₂"],resume:"Pas tout à fait : ces deux nombres n'ont pas la même image.",diag:{etape:0,type:"contre-exemple à l'injectivité qui ne marche pas",titre:"Où ça part : les deux images.",msg:`${fx(`f(${dec(a)})`)} vaut ${dec(o.f(a))}, et ${fx(`f(${dec(b)})`)} vaut ${dec(o.f(b))} : elles sont différentes.`}};}
    const y=lis(c.y);if(y===null)return {incomplet:"Écris un nombre dans la case."};
    if(!o.A.in(y))return {ok:false,faux:["y"],resume:"Pas tout à fait : ce nombre n'est pas dans l'ensemble d'arrivée.",diag:{etape:0,type:"élément pris hors de l'ensemble d'arrivée",titre:"Où ça part : l'ensemble d'arrivée.",msg:`Il faut un élément de ${fx(o.A.t)} : c'est dans l'ensemble d'arrivée qu'on cherche quelqu'un sans antécédent.`}};
    const x=o.ant(y);if(x===null||!o.D.in(x)||!proche(o.f(x),y))return {ok:true};
    return {ok:false,faux:["y"],resume:"Pas tout à fait : ce nombre a un antécédent.",diag:{etape:0,type:"élément proposé qui a un antécédent",titre:"Où ça part : l'antécédent.",msg:`${dec(y)} a un antécédent : ${fx(`f(${dec(x)}) = ${dec(y)}`)}. Cherche un élément de ${fx(o.A.t)} que f n'atteint jamais.`}};}
  const bon=veutInj?{[v+"₁"]:String(o.meme[0]),[v+"₂"]:String(o.meme[1])}:{y:String(o.sans)},mauvais=veutInj?{[v+"₁"]:String(o.meme[0]),[v+"₂"]:String(o.meme[0])}:{y:String(o.f(o.D.ent?5:2))};
  return {sig:"CE"+ea+veutInj,q:veutInj?`Soit ${fx(ea)}. Montre que f n'est pas injective : donne deux éléments différents de l'ensemble de départ qui ont la même image.`:`Soit ${fx(ea)}. Montre que f n'est pas surjective : donne un élément de l'ensemble d'arrivée qui n'a aucun antécédent.`,
    corps:`<p class="muted">${DEFINJ}${notes(o)}</p>`,texte:`${ea} ; contre-exemple pour ${veutInj?"l'injectivité":"la surjectivité"}`,champs:[{k:"cases",id:"c",noms:veutInj?[v+"₁",v+"₂"]:["y"],aide:"Tout contre-exemple qui marche est accepté : le site le vérifie."}],juge,etapes:E,
    bonne:veutInj?`${fx(nb(o.meme[0]))} et ${fx(nb(o.meme[1]))}, par exemple`:`${fx(nb(o.sans))}, par exemple`,bonneTxt:veutInj?`${nb(o.meme[0])} et ${nb(o.meme[1])} (par exemple)`:`${nb(o.sans)} (par exemple)`,repBonne:{c:bon},repFausse:{c:mauvais},nature:veutInj?"pas injective":"pas surjective",ens:{type:"contre",o,veutInj}};}
function reciproque(R){let o;do o=appliFormule(R,"reels");while(!o.inv);const ea=ecritAppli(o),YS=[-7.5,-3,-1.5,-0.5,0.25,0.5,1,2,3.5,4.25,5.5,7.5,9,11,13,20].filter(y=>o.A.in(y));
  const E=[{w:`On part de ${fx(`y = ${o.e}`)} et on cherche x en fonction de y.`,why:"f est bijective : chaque y de l'ensemble d'arrivée a un seul antécédent x. La réciproque est l'application qui, à y, associe cet antécédent.",pts:1},
    {w:`<b>${fx(`f⁻¹(y) = ${o.inv[0]}`)}</b>`,why:`${o.pas||"On isole x, étape par étape."} Le résultat est bien dans ${fx(o.D.t)} : ${fx("f⁻¹")} va de ${fx(o.A.t)} dans ${fx(o.D.t)}.`,pts:2}];
  function juge(rep){if(!propre(rep.g))return {incomplet:"Écris f⁻¹(y) avec la lettre y, par exemple (y - 1)/2."};const V=YS.map(y=>O.calcule(rep.g,{y}));if(V.some(v=>v===null))return {incomplet:"Je n'arrive pas à lire cette formule. Écris-la avec la lettre y, par exemple (y - 1)/2, √(y + 3) ou ln(y)."};
    const i=YS.findIndex((y,k)=>!Number.isFinite(V[k])||!o.D.in(V[k])||Math.abs(o.f(V[k])-y)>1e-9*Math.max(1,Math.abs(y)));if(i<0)return {ok:true};const y=YS[i],v=V[i];
    return {ok:false,faux:["g"],resume:"Pas tout à fait : ce n'est pas la réciproque.",diag:{etape:1,type:"formule de la bijection réciproque",titre:"Où ça part : l'isolement de x.",msg:Number.isFinite(v)?`Pour y = ${dec(y)}, ta formule donne ${dec(v)}${o.D.in(v)?`, et l'image de ce nombre par f vaut ${dec(o.f(v))}, pas ${dec(y)}`:`, qui n'est pas dans ${o.D.t}`}.`:`Pour y = ${dec(y)}, ta formule n'a pas de valeur.`}};}
  return {sig:"RE"+ea,q:`Soit ${fx(ea)}. Cette application est bijective. Donne sa réciproque : l'expression de ${fx("f⁻¹(y)")} en fonction de y.`,corps:`<p class="muted">Rappel : la réciproque ${fx("f⁻¹")} associe à chaque y son unique antécédent par f.${notes(o)}</p>`,texte:`${ea}, bijective ; formule de f⁻¹(y)`,
    champs:[{k:"champ",id:"g",nom:"f⁻¹(y)",label:"$f⁻¹(y) =$",ex:"une formule avec y",sym:[["y","y"],["/","/"],["√","√("],["ln","ln("],["(","("],[")",")"]]}],juge,etapes:E,bonne:fx(`f⁻¹(y) = ${o.inv[0]}`),bonneTxt:`f⁻¹(y) = ${o.inv[0]}`,repBonne:{g:o.inv[1]},repFausse:{g:"y"},nature:o.fam,ens:{type:"recip",o,YS}};}

/* ---------- RA4 : quantificateurs (nier, traduire, dire si c'est vrai) ---------- */
const {atome,negation,finPhrase,quantQ,SYMQ}=AN;
const OPS=["<","≤",">","≥"],SYMR=SYMQ.filter(x=>!/uₙ|η/.test(x[0])).concat([["=","="],["x²","x²"]]);
const RAPPELQ=`Rappel : ∀ se lit « pour tout », ∃ se lit « il existe au moins un ».`;
function phraseR(R,niveau){const c=R.ent(-6,6),C=nb(c),op=R.choix(OPS),o1=R.choix(["<","≤"]),o2=R.choix(OPS),num=()=>c,r=R.choix([1,2,3]),j=R.ent(1,4),V2={x:[0,1],y:[0,1],p:[0,1],q:[0,1]};let o;
  const dm="Le contraire de « A et B » est « non A ou non B » ; le contraire de « A ou B » est « non A et non B ».",dbl="Une double inégalité est un « et » : il faut nier chacune des deux inégalités et les relier par « ou ».";
  if(niveau===1){const t=R.ent(0,9);
    o=t===0?{sig:"a"+c+op,blocs:[["∀","x ∈ ℝ"],["∃","y ∈ ℝ"]],Q:atome("x + y",op,C,e=>e.x+e.y,num),vars:{x:[0,1],y:[c-1,c,c+1]}}
     :t===1?{sig:"b"+c,blocs:[["∃","y ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("x + y","=",C,e=>e.x+e.y,num),vars:{x:[0,1],y:[c-1,c]}}
     :t===2?{sig:"c"+op,blocs:[["∀","n ∈ ℕ"],["∃","m ∈ ℕ"]],Q:atome("m",op,"n",e=>e.m,e=>e.n),vars:{m:[0,1,2],n:[0,1,2]}}
     :t===3?{sig:"d"+op,blocs:[["∃","m ∈ ℤ"],["∀","n ∈ ℤ"]],Q:atome("m",op,"n",e=>e.m,e=>e.n),vars:{m:[0,1,2],n:[0,1,2]}}
     :t===4?{sig:"e"+r+op,blocs:[["∀","x ∈ ℝ"]],Q:atome("x²",op,String(r*r),e=>e.x*e.x,()=>r*r),vars:{x:[-r-1,-r,0,r,r+1]}}
     :t===5?{sig:"f"+j,blocs:[["∃","n ∈ ℤ"]],Q:atome("2n","=",String(2*j+1),e=>2*e.n,()=>2*j+1),vars:{n:[j,j+0.5,j+1]}}
     :t===6?{sig:"g",fr:"l'application f : E → F est surjective",frNon:"l'application f n'est pas surjective",blocs:[["∀","y ∈ F"],["∃","x ∈ E"]],Q:atome("f(x)","=","y",e=>e.p,e=>e.y),vars:{p:[0,1],y:[0,1]}}
     :t===7?{sig:"h"+c+op,blocs:[[R.choix(["∀","∃"]),"x ∈ ℝ"]],Q:atome("f(x)",op,C,e=>e.p,num),vars:{p:[c-1,c,c+1]}}
     :t===8?{sig:"i",blocs:[["∀","ε > 0"],["∃","n ∈ ℕ*"]],Q:atome("1/n","<","ε",e=>1/e.n,e=>e["ε"]),vars:{n:[1,2,4],"ε":[0.25,0.5,1]}}
     :{sig:"j"+op,blocs:[["∃","M ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("f(x)",op,"M",e=>e.p,e=>e.m),vars:{p:[0,1,2],m:[0,1,2]}};
    if(t===7)o.sig+=o.blocs[0][0];o.nature=o.blocs.length>1?"deux":"un";}
  else{const t=R.ent(0,7),a=R.ent(-5,2),b=a+2*R.ent(1,2),A=nb(a),B=nb(b);
    o=t===0?{sig:"A"+o1+o2,blocs:[["∀","x ∈ ℝ"],["∀","y ∈ ℝ"]],P:atome("x",o1,"y",e=>e.x,e=>e.y),Q:atome("f(x)",o2,"f(y)",e=>e.p,e=>e.q),vars:V2}
     :t===1?{sig:"B",fr:"l'application f : E → F est injective",frNon:"l'application f n'est pas injective",blocs:[["∀","x ∈ E"],["∀","y ∈ E"]],P:atome("f(x)","=","f(y)",e=>e.p,e=>e.q),Q:atome("x","=","y",e=>e.x,e=>e.y),vars:V2}
     :t===2?{sig:"C",blocs:[["∀","x ∈ ℝ"],["∀","ε > 0"],["∃","y ∈ ℚ"]],Q:{t:"x < y < x + ε",non:"y ≤ x ou y ≥ x + ε",f:e=>e.x<e.y&&e.y<e.x+e["ε"]},vars:{x:[0,1],y:[0,0.5,1,1.5,2],"ε":[0.5,1]},whyFin:dbl,typeFin:"négation d'une double inégalité"}
     :t===3?{sig:"D",blocs:[["∀","x ∈ ℝ"],["∃","n ∈ ℤ"]],Q:{t:"n ≤ x < n + 1",non:"x < n ou x ≥ n + 1",f:e=>e.n<=e.x&&e.x<e.n+1},vars:{x:[0,0.5,1,1.5,2],n:[0,1,2]},whyFin:dbl,typeFin:"négation d'une double inégalité"}
     :t===4?{sig:"E"+[a,b],blocs:[["∀","x ∈ ℝ"]],Q:{t:`x < ${A} ou x > ${B}`,non:`x ≥ ${A} et x ≤ ${B}`,f:e=>e.x<a||e.x>b},vars:{x:[a-1,a,(a+b)/2,b,b+1]},whyFin:dm,typeFin:"négation d'un « ou »"}
     :t===5?{sig:"F"+a,blocs:[["∃","x ∈ ℝ"]],Q:{t:`x > ${A} et f(x) = 0`,non:`x ≤ ${A} ou f(x) ≠ 0`,f:e=>e.x>a&&e.p===0},vars:{x:[a-1,a,a+1],p:[-1,0,1]},whyFin:dm,typeFin:"négation d'un « et »"}
     :t===6?{sig:"G"+r,blocs:[["∀","x ∈ ℝ"]],P:atome("x²","=",String(r*r),e=>e.x*e.x,()=>r*r),Q:atome("x","=",String(r),e=>e.x,()=>r),vars:{x:[-r,0,r,r+1]}}
     :{sig:"H",fr:"la fonction f est bornée sur ℝ",frNon:"la fonction f n'est pas bornée sur ℝ",blocs:[["∃","M ∈ ℝ"],["∀","x ∈ ℝ"]],Q:{t:"−M ≤ f(x) ≤ M",non:"f(x) < −M ou f(x) > M",f:e=>-e.m<=e.p&&e.p<=e.m},vars:{p:[-2,-1,0,1,2],m:[0,1,2]},whyFin:dbl,typeFin:"négation d'une double inégalité"};
    o.nature=o.P?"⇒":"et, ou";}
  o.sym=SYMR;return o;}
/* traduire : les lettres et leur ensemble sont donnés, on choisit ∀ ou ∃ et on écrit la fin */
function traduction(o){const noms=Object.keys(o.vars);let essais=[{}];noms.forEach(k=>{const N=[];essais.forEach(e=>o.vars[k].forEach(v=>N.push(Object.assign({},e,{[k]:v}))));essais=N;});
  const finT=o.P?`${o.P.t} ⇒ ${o.Q.t}`:o.Q.t,vraiFin=e=>o.P?!o.P.f(e)||o.Q.f(e):o.Q.f(e),attendu=essais.map(vraiFin),ids=o.blocs.map((_,i)=>"q"+i),debut=o.blocs.map(b=>`${b[0]}${b[1]}`).join(", "),phrase=debut+", "+finT,inv=q=>q==="∀"?"∃":"∀";
  const E=[{w:`Les quantificateurs : ${O.f(h(debut))}.`,why:o.whyQ,pts:1.5},{w:`La fin : ${fx(h(finT))}.`,why:o.whyF,pts:1},{w:`<b>${O.f(h(phrase))}</b>`,why:o.blocs.length<2?"La phrase complète : le quantificateur avec sa lettre, puis la fin.":o.blocs.every(b=>b[0]===o.blocs[0][0])?"Les deux lettres ont le même quantificateur : ici, on peut les écrire dans un ordre ou dans l'autre. L'ordre ne compte que lorsqu'un ∀ et un ∃ se suivent.":"L'ordre compte : une lettre introduite par ∃ a le droit de dépendre des lettres écrites avant elle, pas de celles écrites après.",pts:0.5}];
  function juge(rep){const Qs=ids.map(i=>quantQ(rep[i]));if(Qs.some(x=>!x))return {incomplet:"Dans chaque petite case, mets ∀ ou ∃ (les deux premiers boutons)."};
    if(!propre(rep.fin))return {incomplet:"Écris aussi la fin de la phrase dans la grande case."};
    const V=finPhrase(rep.fin,essais);if(V==="non")return {incomplet:"N'écris pas « non » : écris directement la relation, par exemple ≠ ou >."};
    if(!V)return {incomplet:"Je n'arrive pas à lire la fin de la phrase. Écris une égalité ou une inégalité, ou deux reliées par « et », « ou », « ⇒ », avec les lettres de l'énoncé."};
    const FQ=ids.filter((_,i)=>Qs[i]!==o.blocs[i][0]),okF=V.every((v,i)=>v===attendu[i]);if(!FQ.length&&okF)return {ok:true};
    const comme=g=>essais.every((e,i)=>V[i]===g(e));let d;
    if(FQ.length)d={etape:0,type:FQ.length===ids.length&&ids.length>1?"tous les quantificateurs inversés dans une traduction":"∀ et ∃ confondus dans une traduction",titre:"Où ça part : les quantificateurs.",msg:`${o.whyQ} Ici : ${O.f(h(debut))}.`};
    else if(o.P&&comme(e=>o.P.f(e)&&o.Q.f(e)))d={etape:1,type:"« et » à la place de « ⇒ » après un ∀",titre:"Où ça part : la fin de la phrase.",msg:`Après « pour tout », une condition s'écrit avec ⇒ (« si …, alors … »). Avec « et », la phrase dirait que tous les éléments vérifient aussi la condition. Ici : ${fx(h(finT))}.`};
    else if(o.P&&comme(e=>!o.Q.f(e)||o.P.f(e)))d={etape:1,type:"implication écrite à l'envers",titre:"Où ça part : le sens de l'implication.",msg:`L'implication est à l'envers. ${o.whyF} Ici : ${fx(h(finT))}.`};
    else d={etape:1,type:"fin de la phrase mal traduite",titre:"Où ça part : la fin de la phrase.",msg:`${o.whyF} Ici : ${fx(h(finT))}.`};
    return {ok:false,faux:FQ.concat(okF?[]:["fin"]),resume:`Pas tout à fait : ${FQ.length&&!okF?"les quantificateurs et la fin sont à revoir":FQ.length?(FQ.length>1?"des quantificateurs sont à revoir":"un quantificateur est à revoir"):"la fin de la phrase est à revoir"}.`,diag:d};}
  const bon={fin:finT.replace(/−/g,"-")},fausse={fin:finT.replace(/−/g,"-")};ids.forEach((id,i)=>{bon[id]=o.blocs[i][0];fausse[id]=inv(o.blocs[i][0]);});
  return {sig:"TR"+o.sig,q:`Traduis avec des quantificateurs : « ${o.fr} ».`,corps:`<p class="muted">${RAPPELQ}</p><p>Complète : dans chaque petite case, ∀ ou ∃ ; dans la grande case, la fin de la phrase.</p><p class="mq-row">${o.blocs.map((b,i)=>`<span class="en-case">${O.trou(ids[i])} $${h(b[1].trim())}$,</span>`).join(" ")}</p>`,
    corpsPapier:`<p>Sur ta feuille, écris la phrase en symboles, en entier, avec ses quantificateurs.</p>`,texte:`traduire : ${o.fr}`,champs:[{k:"trous",ids},{k:"champ",id:"fin",nom:"fin de la phrase",label:"La fin de la phrase :",ex:"par exemple f(x) = y",sym:SYMR,aide:"Les boutons écrivent dans la case où tu es."}],juge,etapes:E,
    bonne:O.f(h(phrase)),bonneTxt:phrase,repBonne:bon,repFausse:fausse,nature:o.P?"avec ⇒":o.blocs.length>1?"deux quantificateurs":"un quantificateur",ens:{type:"trad",essais,vraiFin,blocs:o.blocs,P:!!o.P}};}
function aTraduire(R){const c=R.ent(-5,5),C=nb(c),V2={x:[0,1],y:[0,1],p:[0,1],q:[0,1]},PM={p:[0,1,2],m:[0,1,2]},P3={p:[-1,0,1]},tous="La propriété doit être vraie pour tous les couples : deux fois ∀.",un="Un seul exemple suffit : ∃.",chaque="La propriété doit être vraie pour chaque élément : ∀.";
  const T=[
   {fr:"l'application f : E → F est injective",blocs:[["∀","x ∈ E"],["∀","y ∈ E"]],P:atome("f(x)","=","f(y)",e=>e.p,e=>e.q),Q:atome("x","=","y",e=>e.x,e=>e.y),vars:V2,whyQ:tous,whyF:"Injective : dès que deux éléments ont la même image, c'est qu'ils sont égaux."},
   {fr:"l'application f : E → F est surjective",blocs:[["∀","y ∈ F"],["∃","x ∈ E"]],Q:atome("f(x)","=","y",e=>e.p,e=>e.y),vars:{p:[0,1],y:[0,1]},whyQ:"Chaque élément y de l'ensemble d'arrivée (∀) doit avoir au moins un antécédent x (∃). Le x dépend de y : il est écrit après.",whyF:"x est un antécédent de y : son image est y."},
   {fr:"l'application f : E → F n'est pas injective",blocs:[["∃","x ∈ E"],["∃","y ∈ E"]],Q:{t:"f(x) = f(y) et x ≠ y",f:e=>e.p===e.q&&e.x!==e.y},vars:V2,whyQ:"Il suffit de trouver un couple : deux fois ∃.",whyF:"On cherche deux éléments différents qui ont la même image."},
   {fr:"l'application f : E → F n'est pas surjective",blocs:[["∃","y ∈ F"],["∀","x ∈ E"]],Q:atome("f(x)","≠","y",e=>e.p,e=>e.y),vars:{p:[0,1],y:[0,1]},whyQ:"Il existe un élément y de l'ensemble d'arrivée (∃) qu'aucun x n'atteint (∀).",whyF:"Aucun x n'a pour image y."},
   {fr:"la fonction f : ℝ → ℝ est majorée",blocs:[["∃","M ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("f(x)","≤","M",e=>e.p,e=>e.m),vars:PM,whyQ:"Un même nombre M (∃) doit dépasser toutes les valeurs de f (∀). M est écrit en premier : il ne dépend pas de x.",whyF:"Toutes les valeurs de f sont inférieures ou égales à M."},
   {fr:"la fonction f : ℝ → ℝ est minorée",blocs:[["∃","m ∈ ℝ"],["∀","x ∈ ℝ"]],Q:atome("f(x)","≥","m",e=>e.p,e=>e.m),vars:PM,whyQ:"Un même nombre m (∃) doit être sous toutes les valeurs de f (∀). m est écrit en premier : il ne dépend pas de x.",whyF:"Toutes les valeurs de f sont supérieures ou égales à m."},
   {fr:"la fonction f : ℝ → ℝ est croissante",blocs:[["∀","x ∈ ℝ"],["∀","y ∈ ℝ"]],P:atome("x","≤","y",e=>e.x,e=>e.y),Q:atome("f(x)","≤","f(y)",e=>e.p,e=>e.q),vars:V2,whyQ:tous,whyF:"Croissante : f garde l'ordre. Si x est avant y, alors f(x) est avant f(y)."},
   {fr:"la fonction f : ℝ → ℝ est strictement décroissante",blocs:[["∀","x ∈ ℝ"],["∀","y ∈ ℝ"]],P:atome("x","<","y",e=>e.x,e=>e.y),Q:atome("f(x)",">","f(y)",e=>e.p,e=>e.q),vars:V2,whyQ:tous,whyF:"Strictement décroissante : f retourne l'ordre, avec des inégalités strictes."},
   {fr:"la fonction f : ℝ → ℝ s'annule au moins une fois",blocs:[["∃","x ∈ ℝ"]],Q:atome("f(x)","=","0",e=>e.p,()=>0),vars:P3,whyQ:un,whyF:"S'annuler en x : prendre la valeur 0 en x."},
   {fr:"la fonction f : ℝ → ℝ ne s'annule jamais",blocs:[["∀","x ∈ ℝ"]],Q:atome("f(x)","≠","0",e=>e.p,()=>0),vars:P3,whyQ:"« Jamais » : pour chaque x, sans exception. C'est un ∀.",whyF:"En chaque x, la valeur de f est différente de 0."},
   {fr:"la fonction f : ℝ → ℝ est la fonction nulle",blocs:[["∀","x ∈ ℝ"]],Q:atome("f(x)","=","0",e=>e.p,()=>0),vars:P3,whyQ:chaque,whyF:"La fonction nulle vaut 0 partout."},
   {fr:"la fonction f : ℝ → ℝ n'est pas la fonction nulle",blocs:[["∃","x ∈ ℝ"]],Q:atome("f(x)","≠","0",e=>e.p,()=>0),vars:P3,whyQ:"Pour ne pas être nulle partout, il suffit d'un x où f ne vaut pas 0 : ∃.",whyF:"En ce x, la valeur de f est différente de 0. (La fonction peut très bien s'annuler ailleurs.)"},
   {fr:"la fonction f : ℝ → ℝ est constante",blocs:[["∀","x ∈ ℝ"],["∀","y ∈ ℝ"]],Q:atome("f(x)","=","f(y)",e=>e.p,e=>e.q),vars:{p:[0,1],q:[0,1]},whyQ:tous,whyF:"Constante : deux réels quelconques ont toujours la même image."},
   {fr:`la fonction f : ℝ → ℝ prend la valeur ${C}`,k:c,blocs:[["∃","x ∈ ℝ"]],Q:atome("f(x)","=",C,e=>e.p,()=>c),vars:{p:[c-1,c,c+1]},whyQ:un,whyF:`Prendre la valeur ${C} : il y a un x dont l'image est ${C}.`},
   {fr:`la fonction f : ℝ → ℝ ne dépasse jamais ${C}`,k:c,blocs:[["∀","x ∈ ℝ"]],Q:atome("f(x)","≤",C,e=>e.p,()=>c),vars:{p:[c-1,c,c+1]},whyQ:"« Jamais » : pour chaque x, sans exception. C'est un ∀.",whyF:`Ne pas dépasser ${C} : être inférieur ou égal à ${C}.`},
   {fr:"tout réel positif ou nul est le carré d'un réel",blocs:[["∀","y ∈ [0, +∞["],["∃","x ∈ ℝ"]],Q:atome("x²","=","y",e=>e.x*e.x,e=>e.y),vars:{x:[0,1,2],y:[0,1,4]},whyQ:"« Tout réel positif » : ∀. « Est le carré d'un réel » : il existe un réel x, qui dépend de y. Il est écrit après.",whyF:"y est le carré de x."},
   {fr:"tout entier naturel est dépassé par un autre entier naturel",blocs:[["∀","n ∈ ℕ"],["∃","m ∈ ℕ"]],Q:atome("m",">","n",e=>e.m,e=>e.n),vars:{m:[0,1,2],n:[0,1,2]},whyQ:"« Tout entier » : ∀. « Par un autre » : il existe un m, qui dépend de n. Il est écrit après.",whyF:"m dépasse n : m est strictement plus grand."},
   {fr:"l'ensemble ℕ a un plus petit élément",blocs:[["∃","m ∈ ℕ"],["∀","n ∈ ℕ"]],Q:atome("m","≤","n",e=>e.m,e=>e.n),vars:{m:[0,1,2],n:[0,1,2]},whyQ:"Un même élément m (∃) doit être plus petit que tous les autres (∀). Il est écrit en premier : il ne dépend pas de n.",whyF:"m est inférieur ou égal à chaque n."},
   {fr:"la partie A de ℝ est majorée",blocs:[["∃","M ∈ ℝ"],["∀","x ∈ A"]],Q:atome("x","≤","M",e=>e.x,e=>e.m),vars:{x:[0,1,2],m:[0,1,2]},whyQ:"Un même nombre M (∃) doit dépasser tous les éléments de A (∀). M est écrit en premier : il ne dépend pas de x.",whyF:"Chaque élément de A est inférieur ou égal à M."},
   {fr:"tous les éléments de la partie A de ℝ sont strictement positifs",blocs:[["∀","x ∈ A"]],Q:atome("x",">","0",e=>e.x,()=>0),vars:{x:[-1,0,1]},whyQ:chaque,whyF:"Strictement positif : strictement plus grand que 0."}],i=R.ent(0,T.length-1),o=T[i];
  o.sig=i+(o.k===undefined?"":","+o.k);return o;}
/* vrai ou faux : la même propriété, avec quatre débuts différents, sur deux petits ensembles */
const PREFS=[[["∀","x"],["∃","y"]],[["∃","y"],["∀","x"]],[["∀","x"],["∀","y"]],[["∃","x"],["∃","y"]],[["∃","x"],["∀","y"]],[["∀","y"],["∃","x"]]];
const vautQ=(pref,S,p,env)=>{if(!pref.length)return p(env.x,env.y);const [q,v]=pref[0],f=a=>vautQ(pref.slice(1),S,p,Object.assign({},env,{[v]:a}));return q==="∀"?S[v].every(f):S[v].some(f);};
function cocheVraies(o){const vraies=o.L.map((l,i)=>l.v?String(i):null).filter(Boolean);
  function juge(rep){const S=(rep.v||[]).slice().sort();if(!S.length)return {incomplet:"Coche toutes les phrases vraies. Il y en a au moins une."};if(S.join()===vraies.join())return {ok:true};
    const i=o.L.findIndex((l,k)=>S.includes(String(k))!==l.v),l=o.L[i];
    return {ok:false,faux:["v"],resume:"Pas tout à fait : au moins une phrase est mal classée.",diag:{etape:i,type:l.type,titre:`Où ça part : la phrase ${i+1}.`,msg:`« ${l.txt} » est ${l.v?"vraie":"fausse"}. ${l.why}`}};}
  return {sig:o.sig,q:o.q,corps:`<p class="muted">${o.brut?"":RAPPELQ+" "}${o.rappel||""}</p><ol>${o.L.map(l=>`<li>${o.brut?l.html||l.txt:O.f(h(l.txt))}</li>`).join("")}</ol>`,texte:o.texte+" ; vraies parmi : "+o.L.map(l=>l.txt).join(" | "),champs:[{k:"multi",id:"v",o:o.L.map((l,i)=>[String(i),`Phrase ${i+1}`])}],juge,
    etapes:o.L.map((l,i)=>({w:`Phrase ${i+1} : <b>${l.v?"vraie":"fausse"}</b>.`,why:l.why,pts:1})),bonne:"vraies : "+vraies.map(i=>`phrase ${+i+1}`).join(", "),bonneTxt:"vraies : "+vraies.map(i=>o.L[+i].txt).join(" | "),
    repBonne:{v:vraies},repFausse:{v:o.L.map((l,i)=>l.v?null:String(i)).filter(Boolean)},nature:o.nature,ens:o.ens};}
function vraiFauxFini(R){for(;;){const A=partie(R,[0,1,2,3,4,5,6,7],3,4),B=partie(R,[-3,-2,-1,1,2,3,4],3,3),S={x:A,y:B},k=R.ent(2,7),par=v=>v<0?`(${ent(v)})`:String(v),nomS={x:"A",y:"B"};
  const p=R.choix([{t:"x + y ∈ A",f:(x,y)=>A.includes(x+y),m:(x,y)=>`${x} + ${par(y)} = ${ent(x+y)}, qui ${A.includes(x+y)?"est":"n'est pas"} dans A`},
    {t:`x + y ≥ ${k}`,f:(x,y)=>x+y>=k,m:(x,y)=>`${x} + ${par(y)} = ${ent(x+y)}${x+y>=k?" ≥ ":" < "}${k}`},
    {t:"x ≤ y",f:(x,y)=>x<=y,m:(x,y)=>x<=y?`${x} ≤ ${ent(y)}`:`${x} > ${ent(y)}`},
    {t:"x + y est pair",f:(x,y)=>(x+y)%2===0,m:(x,y)=>`${x} + ${par(y)} = ${ent(x+y)}, ${(x+y)%2===0?"pair":"impair"}`},
    {t:`xy ≤ ${k}`,f:(x,y)=>x*y<=k,m:(x,y)=>`${x} × ${par(y)} = ${ent(x*y)}${x*y<=k?" ≤ ":" > "}${k}`}]),P4=R.mel(PREFS).slice(0,4);
  const L=P4.map(pf=>{const [[q1,v1],[q2,v2]]=pf,v=vautQ(pf,S,p.f,{}),txt=`${q1}${v1} ∈ ${nomS[v1]}, ${q2}${v2} ∈ ${nomS[v2]}, ${p.t}`,ok=(a,b)=>v1==="x"?p.f(a,b):p.f(b,a),mo=(a,b)=>v1==="x"?p.m(a,b):p.m(b,a);let why,type;
    if(q1==="∀"&&q2==="∃"){const bad=S[v1].find(a=>!S[v2].some(b=>ok(a,b)));type="phrase « pour tout …, il existe … »";why=v?`Pour chaque ${v1}, on trouve un ${v2} qui convient (il peut changer avec ${v1}) : ${S[v1].map(a=>mo(a,S[v2].find(b=>ok(a,b)))).join(" ; ")}.`:`Pour ${v1} = ${ent(bad)}, aucun ${v2} de ${nomS[v2]} ne convient : ${S[v2].map(b=>mo(bad,b)).join(" ; ")}.`;}
    else if(q1==="∃"&&q2==="∀"){const bon=S[v1].find(a=>S[v2].every(b=>ok(a,b)));type="phrase « il existe … tel que pour tout … »";why=v?`${v1} = ${ent(bon)} convient avec tous les ${v2} : ${S[v2].map(b=>mo(bon,b)).join(" ; ")}.`:`Il faudrait un même ${v1} qui marche avec tous les ${v2}. Or chaque ${v1} échoue avec au moins un ${v2} : ${S[v1].map(a=>mo(a,S[v2].find(b=>!ok(a,b)))).join(" ; ")}.`;}
    else{let ce=null,te=null;S[v1].forEach(a=>S[v2].forEach(b=>{if(!ce&&!ok(a,b))ce=[a,b];if(!te&&ok(a,b))te=[a,b];}));type=q1==="∀"?"phrase « pour tout …, pour tout … »":"phrase « il existe …, il existe … »";
      why=q1==="∀"?(v?"Tous les couples conviennent : on les vérifie un par un.":`Un contre-exemple suffit : ${mo(ce[0],ce[1])}.`):(v?`Un exemple suffit : ${mo(te[0],te[1])}.`:"Aucun couple ne convient : on les vérifie un par un.");}
    return {txt,v,why,type,pf};});
  if(L.every(l=>l.v)||!L.some(l=>l.v))continue;
  return cocheVraies({sig:"VF"+A+"|"+B+"|"+p.t+L.map(l=>l.txt[0]+l.txt[7]).join(""),q:`On pose ${fx(`A = ${ensF(A)}`)} et ${fx(`B = ${ensF(B)}`)}. Parmi les quatre phrases suivantes, coche toutes celles qui sont vraies.`,rappel:"Lis chaque phrase de gauche à droite, en suivant l'ordre des quantificateurs.",texte:`A = ${ensF(A)}, B = ${ensF(B)}`,L,nature:p.t.replace(/\d+/,"k"),ens:{type:"vff",A,B,p:p.f,prefs:P4,vals:L.map(l=>l.v)}});}}
function banqueQ(k){const eq=(a,b)=>Math.abs(a-b)<1e-9,K=k*k,car=e=>!eq(e.x*e.x,e.y*e.y)||eq(e.x,e.y),ordre="ordre des quantificateurs : ∀…∃ n'est pas ∃…∀",ex="un exemple suffit pour un ∃, un contre-exemple pour un ∀";return [
 [0,`∀x ∈ ℝ, ∃y ∈ ℝ, x + y = ${k}`,true,`Pour chaque x, on prend y = ${k} − x. Comme y est écrit après x, il a le droit de dépendre de x.`,[["∀","x","R"],["∃","y","R"]],e=>eq(e.x+e.y,k),ordre],
 [0,`∃y ∈ ℝ, ∀x ∈ ℝ, x + y = ${k}`,false,`Il faudrait un même y pour tous les x. Or, une fois y fixé, x = ${k+1} − y donne x + y = ${k+1}.`,[["∃","y","R"],["∀","x","R"]],e=>eq(e.x+e.y,k),ordre],
 [1,"∀n ∈ ℕ, ∃m ∈ ℕ, m > n",true,"Pour chaque n, m = n + 1 convient.",[["∀","n","N"],["∃","m","N"]],e=>e.m>e.n,ordre],
 [1,"∃m ∈ ℕ, ∀n ∈ ℕ, m > n",false,"Un entier m fixé n'est pas plus grand que tous les entiers : pour n = m, « m > n » est faux.",[["∃","m","N"],["∀","n","N"]],e=>e.m>e.n,ordre],
 [2,"∃m ∈ ℕ, ∀n ∈ ℕ, m ≤ n",true,"m = 0 convient : 0 est inférieur ou égal à tous les entiers naturels.",[["∃","m","N"],["∀","n","N"]],e=>e.m<=e.n,ex],
 [2,"∃m ∈ ℤ, ∀n ∈ ℤ, m ≤ n",false,"ℤ n'a pas de plus petit élément : une fois m fixé, n = m − 1 est plus petit que m.",[["∃","m","Z"],["∀","n","Z"]],e=>e.m<=e.n,"l'ensemble où on prend les lettres compte"],
 [3,"∀x ∈ ℝ, x² ≥ x",false,"Contre-exemple : x = 1/2. Son carré, 1/4, est plus petit que 1/2.",[["∀","x","R"]],e=>e.x*e.x>=e.x,"l'ensemble où on prend les lettres compte"],
 [3,"∀n ∈ ℤ, n² ≥ n",true,"Si n ≤ 0, alors n² ≥ 0 ≥ n. Si n ≥ 1, alors n² = n × n ≥ n.",[["∀","n","Z"]],e=>e.n*e.n>=e.n,"l'ensemble où on prend les lettres compte"],
 [4,"∀x ∈ ℝ, ∃y ∈ ℝ, y² = x",false,"Contre-exemple : x = −1 n'est le carré d'aucun réel.",[["∀","x","R"],["∃","y","R"]],e=>eq(e.y*e.y,e.x),ex],
 [4,"∀x ∈ [0, +∞[, ∃y ∈ ℝ, y² = x",true,"Pour chaque x positif ou nul, y = √x convient.",[["∀","x","P"],["∃","y","R"]],e=>eq(e.y*e.y,e.x),"l'ensemble où on prend les lettres compte"],
 [5,"∃x ∈ ℝ, ∀y ∈ ℝ, xy = 0",true,"x = 0 convient : 0 × y = 0 pour tout y.",[["∃","x","R"],["∀","y","R"]],e=>eq(e.x*e.y,0),ex],
 [5,"∀x ∈ ℝ, ∃y ∈ ℝ, xy = 1",false,"Contre-exemple : x = 0. Le produit 0 × y vaut toujours 0, jamais 1.",[["∀","x","R"],["∃","y","R"]],e=>eq(e.x*e.y,1),ex],
 [6,"∀x ∈ ℝ*, ∃y ∈ ℝ, xy = 1",true,"Pour chaque x différent de 0, y = 1/x convient. (ℝ* est l'ensemble des réels différents de 0.)",[["∀","x","E"],["∃","y","R"]],e=>eq(e.x*e.y,1),ordre],
 [6,"∃y ∈ ℝ, ∀x ∈ ℝ*, xy = 1",false,"Il faudrait un même y pour tous les x. Or, si xy = 1 pour x = 1, alors y = 1, et pour x = 2 le produit vaut 2. (ℝ* est l'ensemble des réels différents de 0.)",[["∃","y","R"],["∀","x","E"]],e=>eq(e.x*e.y,1),ordre],
 [7,"∀n ∈ ℕ, ∃m ∈ ℕ, n = 2m",false,"Contre-exemple : n = 1 n'est le double d'aucun entier.",[["∀","n","N"],["∃","m","N"]],e=>e.n===2*e.m,ex],
 [7,"∀n ∈ ℕ, ∃m ∈ ℕ, m = 2n",true,"Pour chaque n, m = 2n convient.",[["∀","n","N"],["∃","m","N"]],e=>e.m===2*e.n,ex],
 [8,"∀x ∈ ℝ, ∀y ∈ ℝ, x² = y² ⇒ x = y",false,"Contre-exemple : x = 1 et y = −1 ont le même carré, et ils sont différents.",[["∀","x","R"],["∀","y","R"]],car,ex],
 [8,"∀x ∈ [0, +∞[, ∀y ∈ [0, +∞[, x² = y² ⇒ x = y",true,"Deux réels positifs ou nuls qui ont le même carré sont égaux.",[["∀","x","P"],["∀","y","P"]],car,"l'ensemble où on prend les lettres compte"],
 [9,`∀x ∈ ℝ, x > ${k} ⇒ x² > ${K}`,true,`Si x > ${k}, alors x est positif et x² > ${k}² = ${K} : la fonction carré est strictement croissante sur [0, +∞[.`,[["∀","x","R"]],e=>!(e.x>k)||e.x*e.x>K,"une implication et sa réciproque"],
 [9,`∀x ∈ ℝ, x² > ${K} ⇒ x > ${k}`,false,`Contre-exemple : x = −${k+1}. Son carré, ${(k+1)*(k+1)}, est plus grand que ${K}, mais x n'est pas plus grand que ${k}.`,[["∀","x","R"]],e=>!(e.x*e.x>K)||e.x>k,"une implication et sa réciproque"],
 [10,`∃x ∈ ℝ, x² = −${k}`,false,"Un carré de réel n'est jamais strictement négatif.",[["∃","x","R"]],e=>eq(e.x*e.x,-k),ex],
 [10,`∃x ∈ ℤ, x² = ${K}`,true,`x = ${k} convient (x = −${k} aussi).`,[["∃","x","Z"]],e=>e.x*e.x===K,ex],
 [11,"∀x ∈ ℝ, ∃n ∈ ℕ, n > x",true,"Pour chaque réel x, on trouve un entier naturel plus grand que lui : il suffit d'aller assez loin.",[["∀","x","R"],["∃","n","N"]],e=>e.n>e.x,ordre],
 [11,"∃n ∈ ℕ, ∀x ∈ ℝ, n > x",false,"Un entier n fixé n'est pas plus grand que tous les réels : pour x = n, « n > x » est faux.",[["∃","n","N"],["∀","x","R"]],e=>e.n>e.x,ordre],
 [12,"∀n ∈ ℕ, ∃m ∈ ℕ, m < n",false,"Contre-exemple : n = 0. Aucun entier naturel n'est strictement plus petit que 0.",[["∀","n","N"],["∃","m","N"]],e=>e.m<e.n,"l'ensemble où on prend les lettres compte"],
 [12,"∀n ∈ ℤ, ∃m ∈ ℤ, m < n",true,"Pour chaque n, m = n − 1 convient, et il est encore dans ℤ.",[["∀","n","Z"],["∃","m","Z"]],e=>e.m<e.n,"l'ensemble où on prend les lettres compte"]
 ].map(a=>({g:a[0],txt:a[1],v:a[2],why:a[3],pref:a[4],p:a[5],type:a[6]}));}
function vraiFauxInfini(R){const k=R.ent(1,5),B=banqueQ(k),G=R.mel([0,1,2,3,4,5,6,7,8,9,10,11,12]).slice(0,2),L=R.mel(B.filter(b=>G.includes(b.g)));
  return cocheVraies({sig:"VI"+L.map(l=>l.txt).sort().join("|"),q:"Parmi les quatre phrases suivantes, coche toutes celles qui sont vraies.",rappel:"Pour un ∀, cherche un contre-exemple. Pour un ∃, cherche un exemple. Et regarde dans quel ensemble on prend chaque lettre.",texte:"phrases sur ℕ, ℤ ou ℝ",L,nature:"sur ℕ, ℤ ou ℝ",ens:{type:"vfi",L}});}

/* ---------- RA5 : récurrence ---------- */
const {papierQ}=AN;
const tape=x=>String(x).replace(/ⁿ/g,"^n").replace(/−/g,"-").replace(/×/g,"*").replace(/\[/g,"(").replace(/\]/g,")");
const cf=(a,v)=>a===1?v:a===-1?"−"+v:nb(a)+v;
const poly=(c2,c1,c0)=>{let t=c2?cf(c2,"n²"):"";if(c1)t+=t?` ${c1>0?"+":"−"} ${cf(Math.abs(c1),"n")}`:cf(c1,"n");if(c0)t+=t?` ${c0>0?"+":"−"} ${Math.abs(c0)}`:nb(c0);return t||"0";};
const SYMREC=[["n","n"],["^","^"],["/","/"],["(","("],[")",")"],["²","²"]],proche=(a,b)=>a!==null&&Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
const fact=n=>{let f=1;for(let i=2;i<=n;i++)f*=i;return f;};
/* une somme et sa formule : g (rang n), dern (dernier terme), tS (terme ajouté au rang n + 1), tP (le même, entre parenthèses s'il le faut), F, F1, calc (lignes de l'hérédité) */
function sommeRec(R){const t=R.ent(0,9),fac=`On développe et on regroupe, puis on factorise par ${fx("(n + 1)")} : c'est le facteur qu'on attend dans la formule au rang n + 1.`;
  if(t<=4){let a,b;do{a=R.ent(1,5);b=R.ent(-3,3);}while(a+b<1);
    const c1=a+2*b,pair=a%2===0,T=k=>a*k+b,lin=(x,y)=>plusC(cf(x,"n"),y),tS=lin(a,a+b),dern=lin(a,b),par=x=>/[+−]/.test(x)?`(${x})`:x;
    const F=c1===0?cf(a/2,"n²"):pair?`n(${lin(a/2,c1/2)})`:`n(${lin(a,c1)})/2`,F1=c1===0?cf(a/2,"(n + 1)²"):pair?`(n + 1)(${lin(a/2,a+b)})`:`(n + 1)(${lin(a,2*a+2*b)})/2`,q=pair?poly(a/2,(3*a+2*b)/2,a+b):`(${poly(a,3*a+2*b,2*a+2*b)})/2`;
    return {sig:"ar"+[a,b],g:`${T(1)} + ${T(2)} + ${T(3)} + … + ${par(dern)}`,n0:1,t:T,tS,tP:par(tS),dern,F,F1,calc:[`${F} + ${par(tS)} = ${q}`,`= ${F1}`],why:fac};}
  if(t<=6){const q=R.ent(2,5),d=q-1;
    return {sig:"ge"+q,g:`1 + ${q} + ${q}² + … + ${q}ⁿ`,n0:0,t:k=>Math.pow(q,k),tS:`${q}^(n + 1)`,tP:`${q}^(n + 1)`,dern:`${q}ⁿ`,F:d===1?"2^(n + 1) − 1":`(${q}^(n + 1) − 1)/${d}`,F1:d===1?"2^(n + 2) − 1":`(${q}^(n + 2) − 1)/${d}`,
      calc:d===1?["2^(n + 1) − 1 + 2^(n + 1) = 2 × 2^(n + 1) − 1","= 2^(n + 2) − 1"]:[`(${q}^(n + 1) − 1)/${d} + ${q}^(n + 1) = (${q}^(n + 1) − 1 + ${d} × ${q}^(n + 1))/${d}`,`= (${q} × ${q}^(n + 1) − 1)/${d}`,`= (${q}^(n + 2) − 1)/${d}`],
      why:`${d===1?"":`On met tout sur le dénominateur ${d}. `}On regroupe les deux puissances : il y en a ${d===1?"2":`1 + ${d} = ${q}`}, et ${fx(`${q} × ${q}^(n + 1) = ${q}^(n + 2)`)}.`};}
  return R.choix([
    {sig:"k2",g:"1² + 2² + 3² + … + n²",n0:1,t:k=>k*k,tS:"(n + 1)²",tP:"(n + 1)²",dern:"n²",F:"n(n + 1)(2n + 1)/6",F1:"(n + 1)(n + 2)(2n + 3)/6",calc:["n(n + 1)(2n + 1)/6 + (n + 1)² = (n + 1)[n(2n + 1) + 6(n + 1)]/6","= (n + 1)(2n² + 7n + 6)/6","= (n + 1)(n + 2)(2n + 3)/6"],why:`On met ${fx("(n + 1)/6")} en facteur, puis on factorise : ${fx("2n² + 7n + 6 = (n + 2)(2n + 3)")}.`},
    {sig:"k3",g:"1³ + 2³ + 3³ + … + n³",n0:1,t:k=>k*k*k,tS:"(n + 1)³",tP:"(n + 1)³",dern:"n³",F:"n²(n + 1)²/4",F1:"(n + 1)²(n + 2)²/4",calc:["n²(n + 1)²/4 + (n + 1)³ = (n + 1)²[n² + 4(n + 1)]/4","= (n + 1)²(n² + 4n + 4)/4","= (n + 1)²(n + 2)²/4"],why:`On met ${fx("(n + 1)²/4")} en facteur, puis on reconnaît ${fx("n² + 4n + 4 = (n + 2)²")}.`},
    {sig:"kk",g:"1×2 + 2×3 + 3×4 + … + n(n + 1)",n0:1,t:k=>k*(k+1),tS:"(n + 1)(n + 2)",tP:"(n + 1)(n + 2)",dern:"n(n + 1)",F:"n(n + 1)(n + 2)/3",F1:"(n + 1)(n + 2)(n + 3)/3",calc:["n(n + 1)(n + 2)/3 + (n + 1)(n + 2) = (n + 1)(n + 2)(n/3 + 1)","= (n + 1)(n + 2)(n + 3)/3"],why:`On met ${fx("(n + 1)(n + 2)")} en facteur.`},
    {sig:"fr",g:"1/(1×2) + 1/(2×3) + … + 1/(n(n + 1))",n0:1,t:k=>1/(k*(k+1)),i0:"1/2",tS:"1/((n + 1)(n + 2))",tP:"1/((n + 1)(n + 2))",dern:"1/(n(n + 1))",F:"n/(n + 1)",F1:"(n + 1)/(n + 2)",calc:["n/(n + 1) + 1/((n + 1)(n + 2)) = (n(n + 2) + 1)/((n + 1)(n + 2))","= (n + 1)²/((n + 1)(n + 2))","= (n + 1)/(n + 2)"],why:`On met au même dénominateur, on reconnaît ${fx("n² + 2n + 1 = (n + 1)²")}, puis on simplifie par ${fx("(n + 1)")}.`}]);}
function recCompleter(R){const S=sommeRec(R),n0=S.n0,val=x=>n=>O.calcule(tape(x),{n}),Ff=val(S.F),F1f=val(S.F1),v0=S.t(n0),vT=S.i0||nb(v0),NS=[1,2,3,4,5,6],P=`${S.g} = ${S.F}`;
  const E=[{w:`Initialisation : pour n = ${n0}, la somme vaut ${fx(vT)} et la formule donne ${fx(vT)}.`,why:`Au rang ${n0}, la somme n'a qu'un seul terme. Dans la formule, on remplace n par ${n0}.`,pts:1},
    {w:`Le terme ajouté au rang n + 1 : ${fx(S.tS)}.`,why:`Le dernier terme de la somme au rang n est ${fx(S.dern)}. On y remplace n par n + 1.`,pts:1},
    {w:`Ce qu'il faut obtenir : ${fx(S.F1)}.`,why:"C'est la formule de l'énoncé, où chaque n est remplacé par (n + 1). L'écrire avant de calculer donne le but à atteindre.",pts:1},
    {w:`Le calcul de l'hérédité : ${S.calc.map(fx).join(" ")}.`,why:`D'après l'hypothèse de récurrence, la somme jusqu'au rang n vaut ${fx(S.F)} : on lui ajoute le nouveau terme. ${S.why}`,pts:1},
    {w:`Conclusion : par récurrence, la propriété est vraie pour tout entier n ≥ ${n0}.`,why:`Elle est vraie au rang ${n0}, et chaque fois qu'elle est vraie à un rang, elle l'est au rang suivant.`,pts:0.5}];
  function juge(rep){if(["a","b","c","d"].some(k=>!propre(rep[k])))return {incomplet:"Remplis les quatre cases."};const a=O.calcule(tape(rep.a),{}),b=O.calcule(tape(rep.b),{});if(a===null||b===null)return {incomplet:"Dans les deux premières cases, écris un nombre."};
    const C=NS.map(n=>O.calcule(tape(rep.c),{n})),D=NS.map(n=>O.calcule(tape(rep.d),{n}));if(C.some(v=>v===null)||D.some(v=>v===null))return {incomplet:"Je n'arrive pas à lire une des formules. Écris-les avec la lettre n, par exemple (n+1)(n+2)/2 ou 2^(n+1)."};
    const okA=proche(a,v0),okB=proche(b,Ff(n0)),okC=NS.every((n,i)=>proche(C[i],S.t(n+1))),okD=NS.every((n,i)=>proche(D[i],F1f(n))),F=[];if(!okA)F.push("a");if(!okB)F.push("b");if(!okC)F.push("c");if(!okD)F.push("d");if(!F.length)return {ok:true};
    const d=!okA||!okB?{etape:0,type:"initialisation d'une récurrence",titre:"Où ça part : l'initialisation.",msg:`Pour n = ${n0}, la somme n'a qu'un seul terme : elle vaut ${fx(vT)}. Dans la formule, on remplace n par ${n0} : on trouve aussi ${fx(vT)}.`}
      :!okC?{etape:1,type:NS.every((n,i)=>proche(C[i],S.t(n)))?"terme du rang n à la place du terme du rang n + 1":"terme ajouté au rang n + 1",titre:"Où ça part : le terme ajouté.",msg:`Le dernier terme de la somme au rang n est ${fx(S.dern)}. Au rang n + 1, on y remplace n par n + 1 : le nouveau terme est ${fx(S.tS)}.`}
      :{etape:2,type:NS.every((n,i)=>proche(D[i],Ff(n)))?"formule recopiée au rang n":"formule écrite au rang n + 1",titre:"Où ça part : la formule au rang n + 1.",msg:`Dans ${fx(S.F)}, on remplace chaque n par (n + 1) : ${fx(S.F1)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length} case${F.length>1?"s sont":" est"} à revoir.`,diag:d};}
  return {sig:"RC"+S.sig,q:`Complète cette démonstration par récurrence : pour tout entier n ≥ ${n0}, ${fx(P)}.`,
    corps:`<p><b>Initialisation.</b> Pour n = ${n0}, le membre de gauche vaut ${O.trou("a")} et la formule donne ${O.trou("b")}. Les deux sont égaux : la propriété est vraie au rang ${n0}.</p><p><b>Hérédité.</b> Soit n ≥ ${n0}. On suppose la propriété vraie au rang n. Au rang n + 1, la somme a un terme de plus, qui vaut ${O.trou("c",2)}</p><p>Il faut donc montrer que la nouvelle somme vaut ${O.trou("d",2)} C'est la formule de l'énoncé, où n est remplacé par n + 1.</p>`,
    corpsPapier:`<p>Sur ta feuille, rédige la démonstration en entier : la propriété, l'initialisation, l'hérédité, la conclusion.</p>`,texte:`récurrence à compléter : ${P}`,champs:[{k:"trous",ids:["a","b","c","d"]},{k:"sym",id:"s",sym:SYMREC,aide:"Pour une puissance, écris 2^(n+1). Les boutons écrivent dans la case où tu es."}],indice:false,juge,etapes:E,
    bonne:`${fx(vT)} et ${fx(vT)} ; terme ajouté ${fx(S.tS)} ; à obtenir ${fx(S.F1)}`,bonneTxt:`initialisation ${vT} = ${vT} ; terme ajouté ${S.tS} ; à obtenir ${S.F1}`,repBonne:{a:tape(vT),b:tape(vT),c:tape(S.tS),d:tape(S.F1)},repFausse:{a:tape(vT),b:tape(vT),c:tape(S.dern),d:tape(S.F1)},nature:S.sig.slice(0,2)==="ar"?"arithmétique":S.sig.slice(0,2)==="ge"?"géométrique":"autre somme",ens:{type:"somme",S}};}
/* uₙ divisible par m : uₙ₊₁ = al × uₙ + m × be ; alt = une autre décomposition juste */
function diviseur(R){const t=R.ent(0,7);
  if(t<=3){const [a,b]=R.choix([[5,2],[7,3],[4,1],[7,1],[6,1],[9,2],[8,3],[10,1],[5,1],[3,1],[7,2],[9,4],[11,1],[8,1]]),m=a-b;
    return b===1?{sig:"p"+a,uT:`${a}ⁿ − 1`,u:n=>Math.pow(a,n)-1,m,al:a,beT:"1",alt:[1,`${a}ⁿ`],calc:[`uₙ₊₁ = ${a} × ${a}ⁿ − 1`,`= ${a}(${a}ⁿ − 1) + ${a} − 1`,`= ${a}uₙ + ${m}`]}
      :{sig:"p"+[a,b],uT:`${a}ⁿ − ${b}ⁿ`,u:n=>Math.pow(a,n)-Math.pow(b,n),m,al:a,beT:`${b}ⁿ`,alt:[b,`${a}ⁿ`],calc:[`uₙ₊₁ = ${a} × ${a}ⁿ − ${b} × ${b}ⁿ`,`= ${a}(${a}ⁿ − ${b}ⁿ) + ${a} × ${b}ⁿ − ${b} × ${b}ⁿ`,`= ${a}uₙ + ${m} × ${b}ⁿ`]};}
  if(t===4)return {sig:"cc",src:"C'est l'exercice 3 du CC du 15 novembre 2024.",uT:"3^(2n + 2) − 2^(n + 1)",u:n=>Math.pow(3,2*n+2)-Math.pow(2,n+1),m:7,al:2,beT:"3^(2n + 2)",alt:[9,"2^(n + 1)"],calc:["uₙ₊₁ = 3^(2n + 4) − 2^(n + 2)","= 9 × 3^(2n + 2) − 2 × 2^(n + 1)","= 7 × 3^(2n + 2) + 2 × 3^(2n + 2) − 2 × 2^(n + 1)","= 2uₙ + 7 × 3^(2n + 2)"],astuce:"L'astuce du corrigé officiel : écrire 9 = 7 + 2."};
  if(t<=6)return R.choix([
    {sig:"q1",uT:"n³ − n",u:n=>n*n*n-n,m:3,al:1,beT:"n² + n",calc:["uₙ₊₁ = (n + 1)³ − (n + 1)","= n³ + 3n² + 3n + 1 − n − 1","= (n³ − n) + 3n² + 3n","= uₙ + 3(n² + n)"]},
    {sig:"q2",uT:"n³ + 2n",u:n=>n*n*n+2*n,m:3,al:1,beT:"n² + n + 1",calc:["uₙ₊₁ = (n + 1)³ + 2(n + 1)","= n³ + 3n² + 3n + 1 + 2n + 2","= (n³ + 2n) + 3n² + 3n + 3","= uₙ + 3(n² + n + 1)"]},
    {sig:"q3",uT:"n² + n",u:n=>n*n+n,m:2,al:1,beT:"n + 1",calc:["uₙ₊₁ = (n + 1)² + (n + 1)","= n² + 2n + 1 + n + 1","= (n² + n) + 2n + 2","= uₙ + 2(n + 1)"]},
    {sig:"q4",uT:"n³ + 5n",u:n=>n*n*n+5*n,m:3,al:1,beT:"n² + n + 2",calc:["uₙ₊₁ = (n + 1)³ + 5(n + 1)","= n³ + 3n² + 3n + 1 + 5n + 5","= (n³ + 5n) + 3n² + 3n + 6","= uₙ + 3(n² + n + 2)"]},
    {sig:"q5",uT:"n² − n",u:n=>n*n-n,m:2,al:1,beT:"n",calc:["uₙ₊₁ = (n + 1)² − (n + 1)","= n² + 2n + 1 − n − 1","= (n² − n) + 2n","= uₙ + 2n"]}]);
  const [a,r]=R.choix([[4,2],[4,5],[5,3],[5,7],[6,4],[7,5],[3,1],[3,3]]),m=a-1;
  return {sig:"r"+[a,r],uT:`${a}ⁿ + ${r}`,u:n=>Math.pow(a,n)+r,m,al:a,beT:`−${r}`,alt:[1,`${a}ⁿ`],calc:[`uₙ₊₁ = ${a} × ${a}ⁿ + ${r}`,`= ${a}(${a}ⁿ + ${r}) − ${a*r} + ${r}`,`= ${a}uₙ − ${m*r}`,`= ${a}uₙ + ${m} × (−${r})`]};}
const beP=D=>/[+−]/.test(D.beT)&&!/^−\d+$/.test(D.beT)?`(${D.beT})`:/^−/.test(D.beT)?`(${D.beT})`:D.beT;
const etapesDiv=D=>{const u0=D.u(0);return [
  {w:`Initialisation : ${fx(`u₀ = ${nb(u0)}`)}, et ${u0===0?`0 est divisible par ${D.m} (0 = ${D.m} × 0)`:`${nb(u0)} = ${D.m} × ${nb(u0/D.m)}`}.`,why:"On remplace n par 0."+(/ⁿ/.test(D.uT)?" Toute puissance d'exposant 0 vaut 1.":""),pts:1},
  {w:`${D.calc.map(fx).join(" ")}.`,why:`On écrit ${fx("uₙ₊₁")}, puis on fait apparaître ${fx("uₙ")} : c'est le seul moyen d'utiliser l'hypothèse de récurrence.${D.astuce?" "+D.astuce:""}`,pts:2},
  {w:`${fx(D.al===1?"uₙ":`${D.al}uₙ`)} est un multiple de ${D.m} par hypothèse de récurrence, et ${fx(`${D.m} × ${beP(D)}`)} aussi. Donc ${fx("uₙ₊₁")} est un multiple de ${D.m}.`,why:`La somme de deux multiples de ${D.m} est un multiple de ${D.m}.`,pts:1}];};
function recDivisible(R){const D=diviseur(R),NS=[0,1,2,3,4,5],u0=D.u(0),E=etapesDiv(D);
  function juge(rep){if(["i","al","be"].some(k=>!propre(rep[k])))return {incomplet:"Remplis les trois cases."};const i=O.calcule(tape(rep.i),{}),al=O.calcule(tape(rep.al),{});if(i===null||al===null)return {incomplet:"Dans les deux petites cases, écris un nombre."};
    const B=NS.map(n=>O.calcule(tape(rep.be),{n}));if(B.some(v=>v===null))return {incomplet:"Je n'arrive pas à lire la formule de la grande case. Écris-la avec la lettre n, par exemple 2^n ou n^2 + n."};
    const okI=proche(i,u0),ent=Number.isInteger(al)&&B.every(v=>Number.isFinite(v)&&Math.abs(v-Math.round(v))<1e-9),k=NS.findIndex((n,j)=>!proche(al*D.u(n)+D.m*B[j],D.u(n+1))),F=[];if(!okI)F.push("i");if(k>=0||!ent){F.push("al","be");}if(!F.length)return {ok:true};
    const d=!okI?{etape:0,type:"initialisation d'une récurrence",titre:"Où ça part : l'initialisation.",msg:`Pour n = 0 : ${fx(`u₀ = ${nb(u0)}`)}.${/ⁿ/.test(D.uT)?" Toute puissance d'exposant 0 vaut 1.":""}`}
      :k>=0?{etape:1,type:"décomposition de uₙ₊₁ avec uₙ",titre:"Où ça part : le calcul de l'hérédité.",msg:`Vérifie avec n = ${NS[k]} : ${fx(`uₙ₊₁ = ${nb(D.u(NS[k]+1))}`)}, alors que ta formule donne ${fx(dec(al*D.u(NS[k])+D.m*B[k]))}. Une écriture juste : ${fx(D.calc[D.calc.length-1].replace(/^= /,"uₙ₊₁ = "))}.`}
      :{etape:1,type:"second terme qui n'est pas un multiple visible",titre:"Où ça part : le multiple.",msg:`L'égalité est juste, mais ce que tu multiplies par ${D.m} doit être un entier pour tout n : sinon on ne voit pas que c'est un multiple de ${D.m}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${!okI&&F.length>1?"l'initialisation et le calcul sont à revoir":!okI?"l'initialisation est à revoir":"le calcul de l'hérédité est à revoir"}.`,diag:d};}
  return {sig:"RD"+D.sig,q:`On pose ${fx(`uₙ = ${D.uT}`)} pour tout entier naturel n. On veut montrer par récurrence que ${fx("uₙ")} est divisible par ${D.m} pour tout n. Complète les deux étapes.`,
    corps:`<p class="muted">Rappel : « divisible par ${D.m} » veut dire « égal à ${D.m} fois un entier ».${D.src?" "+D.src:""}</p><p><b>Initialisation.</b> ${fx("u₀ =")} ${O.trou("i")}</p><p><b>Hérédité.</b> On écrit ${fx("uₙ₊₁")} avec ${fx("uₙ")} et un multiple de ${D.m} :</p><p>${fx("uₙ₊₁ =")} ${O.trou("al")} ${fx(`× uₙ + ${D.m} ×`)} ${O.trou("be",2)}</p>`,
    corpsPapier:`<p>Sur ta feuille, rédige la démonstration en entier : la propriété, l'initialisation, l'hérédité avec son calcul, la conclusion.</p>`,texte:`${D.uT} divisible par ${D.m} : initialisation, puis uₙ₊₁ = … × uₙ + ${D.m} × …`,champs:[{k:"trous",ids:["i","al","be"]},{k:"sym",id:"s",sym:SYMREC,aide:"Pour une puissance, écris 2^n. Plusieurs réponses sont possibles : le site vérifie la tienne."}],juge,etapes:E,
    bonne:`${fx(`u₀ = ${nb(u0)}`)} ; ${fx(D.calc[D.calc.length-1].replace(/^= /,"uₙ₊₁ = "))}`,bonneTxt:`u₀ = ${nb(u0)} ; uₙ₊₁ = ${D.al}uₙ + ${D.m} × ${beP(D)}`,repBonne:{i:String(u0),al:String(D.al),be:tape(D.beT)},repFausse:{i:String(u0),al:String(D.al+1),be:tape(D.beT)},nature:D.sig[0]==="q"?"polynôme":"puissances",ens:{type:"div",D}};}
function recRang(R){for(;;){const k=R.choix([3,5,10]),c=R.choix([2,5,10,20]),c2=R.choix([3,8,15,24]),c3=R.choix([1,5,10]),nf="n! (« factorielle n ») est le produit 1 × 2 × … × n, avec 0! = 1.",p2=n=>Math.pow(2,n),p3=n=>Math.pow(3,n);
  const o=R.choix([{gT:"2ⁿ",dT:"n²",g:p2,d:n=>n*n,op:"≥"},{gT:"2ⁿ",dT:"n²",g:p2,d:n=>n*n,op:">"},{gT:"2ⁿ",dT:"2n + 1",g:p2,d:n=>2*n+1,op:"≥"},{gT:"n!",dT:"2ⁿ",g:fact,d:p2,op:"≥",note:nf},{gT:"n!",dT:"n²",g:fact,d:n=>n*n,op:"≥",note:nf},{gT:"n!",dT:"3ⁿ",g:fact,d:p3,op:"≥",note:nf},{gT:"3ⁿ",dT:"n³",g:p3,d:n=>n*n*n,op:">"},
    {gT:"n²",dT:`2n + ${c2}`,g:n=>n*n,d:n=>2*n+c2,op:"≥"},{gT:"2ⁿ",dT:`n + ${c}`,g:p2,d:n=>n+c,op:"≥"},{gT:"2ⁿ",dT:`${k}n`,g:p2,d:n=>k*n,op:"≥"},{gT:"3ⁿ",dT:`2ⁿ + ${k}n`,g:p3,d:n=>p2(n)+k*n,op:"≥"},{gT:"2ⁿ",dT:`n² + ${c3}`,g:p2,d:n=>n*n+c3,op:"≥"},{gT:"n!",dT:`${k}n`,g:fact,d:n=>k*n,op:">",note:nf},{gT:"3ⁿ",dT:`${k}n + ${c}`,g:p3,d:n=>k*n+c,op:"≥"}]);
  const vrai=n=>o.op==="≥"?o.g(n)>=o.d(n):o.g(n)>o.d(n);let n0=0;for(let n=0;n<=40;n++)if(!vrai(n))n0=n+1;if(n0<2||n0>8)continue;
  const P=`${o.gT} ${o.op} ${o.dT}`,avant=[...Array(n0).keys()].filter(vrai),lig=n=>`n = ${n} : ${o.g(n)} et ${o.d(n)}, ${vrai(n)?"vrai":"faux"}`,lis=x=>{const v=nombre(x);return v&&v.d===1?v.n:null;};
  const E=[{w:`On calcule les deux membres pour les premières valeurs de n. ${[...Array(n0+1).keys()].map(lig).join(" ; ")}.`,why:"On teste à la main avant de se lancer : c'est le seul moyen de trouver le rang de départ.",pts:1},
    {w:`<b>${fx(`n₀ = ${n0}`)}</b>`,why:`La propriété est fausse pour n = ${n0-1} : on ne peut pas partir avant ${n0}.${avant.length?` Elle est vraie pour n = ${avant.join(", ")}, mais cela ne sert à rien : l'hérédité ne peut pas traverser n = ${n0-1}.`:""} À partir de ${n0}, elle ne redevient plus fausse : c'est ce que l'hérédité démontre.`,pts:1},
    {w:`Initialisation : pour n = ${n0}, ${fx(h(`${o.g(n0)} ${o.op} ${o.d(n0)}`))}. La propriété est vraie au rang ${n0}.`,why:"L'initialisation se fait au rang de départ, qui n'est pas toujours 0.",pts:1}];
  function juge(rep){const n=lis(rep.n),g=lis(rep.g),d=lis(rep.d);if(n===null||g===null||d===null)return {incomplet:"Remplis les trois cases avec des entiers."};const F=[];if(n!==n0)F.push("n");else{if(g!==o.g(n0))F.push("g");if(d!==o.d(n0))F.push("d");}if(!F.length)return {ok:true};
    let dg;if(n<n0){let f=Math.max(n,0);while(vrai(f))f++;dg={etape:1,type:"rang de départ trop petit",titre:"Où ça part : le rang de départ.",msg:`Pour n = ${f}, les deux membres valent ${o.g(f)} et ${o.d(f)} : « ${o.g(f)} ${o.op} ${o.d(f)} » est faux. La propriété n'est donc pas vraie pour tous les entiers à partir de ${n}.`};}
    else if(n>n0)dg={etape:1,type:"rang de départ qui n'est pas le plus petit",titre:"Où ça part : le plus petit rang.",msg:`La propriété est déjà vraie pour n = ${n0} (${o.g(n0)} ${o.op} ${o.d(n0)}), et elle le reste ensuite. ${n} convient, mais ce n'est pas le plus petit.`};
    else dg={etape:2,type:"calcul de l'initialisation",titre:"Où ça part : l'initialisation.",msg:`Pour n = ${n0}, le membre de gauche vaut ${o.g(n0)} et le membre de droite vaut ${o.d(n0)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F[0]==="n"?"le rang de départ est à revoir":"l'initialisation est à revoir"}.`,diag:dg};}
  return {sig:"RR"+P,q:`On veut démontrer par récurrence une propriété de la forme « pour tout entier n ≥ n₀, ${fx(h(P))} ». Trouve le plus petit entier n₀ qui convient, puis fais l'initialisation.`,
    corps:`<p class="muted">Calcule les deux membres pour n = 0, 1, 2, 3… et regarde à partir d'où l'inégalité reste vraie.${o.note?" "+o.note:""}</p><p>Le plus petit rang de départ : ${fx("n₀ =")} ${O.trou("n")}</p><p>Initialisation, pour ${fx("n = n₀")} : le membre de gauche vaut ${O.trou("g")} et le membre de droite vaut ${O.trou("d")}</p>`,
    corpsPapier:`<p>Sur ta feuille : calcule les deux membres pour les premières valeurs de n, donne n₀, puis écris l'initialisation.</p>`,texte:`rang de départ et initialisation pour : ${P}`,champs:[{k:"trous",ids:["n","g","d"]}],juge,etapes:E,bonne:`${fx(`n₀ = ${n0}`)} ; pour n = ${n0} : ${o.g(n0)} et ${o.d(n0)}`,bonneTxt:`n₀ = ${n0} ; ${o.g(n0)} ${o.op} ${o.d(n0)}`,
    repBonne:{n:String(n0),g:String(o.g(n0)),d:String(o.d(n0))},repFausse:{n:String(n0-1),g:String(o.g(n0-1)),d:String(o.d(n0-1))},nature:/!/.test(P)?"factorielle":"puissance",ens:{type:"rang",g:o.g,d:o.d,op:o.op,gT:o.gT,dT:o.dT}};}}
function recRedaction(R){const t=R.ent(0,6),consigne=`<p>Rédige sur ta feuille comme au contrôle : la propriété P(n), l'initialisation, l'hérédité, la conclusion.</p>`,fin=n0=>[`Conclusion : par récurrence, P(n) est vraie pour tout entier n ≥ ${n0}.`,"La phrase finale est attendue.",0.5];
  if(t<=2){const S=sommeRec(R),n0=S.n0,vT=S.i0||nb(S.t(n0)),P=`${S.g} = ${S.F}`;
    return papierQ("PS"+S.sig,`Démontre par récurrence que, pour tout entier n ≥ ${n0} : ${fx(P)}.`,consigne,[
      [`On note P(n) la propriété : ${fx(P)}.`,"On commence toujours par dire clairement ce qu'on démontre.",0.5],
      [`Initialisation : pour n = ${n0}, le membre de gauche vaut ${fx(vT)} et la formule donne ${fx(vT)}. P(${n0}) est vraie.`,`Au rang ${n0}, la somme n'a qu'un seul terme.`,1],
      [`Hérédité : soit n un entier, n ≥ ${n0}. On suppose P(n), et on veut montrer P(n + 1) : ${fx(`${S.g} + ${S.tP} = ${S.F1}`)}.`,"On fixe un n et on suppose P(n) pour ce n seulement. Écrire P(n + 1) donne le but à atteindre.",1],
      [`D'après P(n) : ${fx(`${S.g} + ${S.tP} = ${S.F} + ${S.tP}`)}.`,"C'est ici qu'on utilise l'hypothèse de récurrence : sans elle, ce n'est pas une récurrence.",1],
      [`${S.calc.map(fx).join(" ")}. Donc P(n + 1) est vraie.`,S.why,1],fin(n0)],{type:"papier",S},"somme");}
  if(t<=4){const D=diviseur(R),E=etapesDiv(D);
    return papierQ("PD"+D.sig,`Démontre par récurrence que, pour tout entier naturel n, ${fx(D.uT)} est divisible par ${D.m}.`,consigne+(D.src?`<p class="muted">${D.src}</p>`:""),[
      [`On pose ${fx(`uₙ = ${D.uT}`)} et on note P(n) : « ${fx("uₙ")} est divisible par ${D.m} ».`,"On commence toujours par dire clairement ce qu'on démontre.",0.5],[E[0].w+" P(0) est vraie.",E[0].why,1],
      [`Hérédité : soit n ∈ ℕ. On suppose P(n) : ${fx("uₙ")} est un multiple de ${D.m}.`,"On fixe un n et on suppose P(n) pour ce n seulement.",0.5],[E[1].w,E[1].why,1.5],[E[2].w+" P(n + 1) est vraie.",E[2].why,1],fin(0)],{type:"papier",D},"divisibilité");}
  const a=R.ent(2,6),x=a-1,X=x===1?"":x;
  return papierQ("PB"+a,`Démontre par récurrence que, pour tout entier naturel n : ${fx(`${a}ⁿ ≥ 1 + ${X}n`)}.`,consigne,[
    [`On note P(n) la propriété : ${fx(`${a}ⁿ ≥ 1 + ${X}n`)}.`,"On commence toujours par dire clairement ce qu'on démontre.",0.5],
    [`Initialisation : ${fx(`${a}⁰ = 1`)} et ${fx(`1 + ${X||1} × 0 = 1`)}. P(0) est vraie.`,"Toute puissance d'exposant 0 vaut 1.",1],
    [`Hérédité : soit n ∈ ℕ. On suppose P(n) : ${fx(`${a}ⁿ ≥ 1 + ${X}n`)}.`,"On fixe un n et on suppose P(n) pour ce n seulement.",0.5],
    [`${fx(`${a}^(n + 1) = ${a} × ${a}ⁿ ≥ ${a}(1 + ${X}n) = ${a} + ${a*x}n`)}.`,`On multiplie les deux membres de l'hypothèse de récurrence par ${a}, qui est positif : l'inégalité garde son sens.`,1.5],
    [`${fx(`${a} + ${a*x}n ≥ ${a} + ${X}n = 1 + ${X}(n + 1)`)}. Donc P(n + 1) est vraie.`,`${fx(`${a*x}n ≥ ${X}n`)} car n est positif ou nul. Et ${fx(`${a} + ${X}n = 1 + ${x} + ${X}n`)}, qui est bien ${fx(`1 + ${X}(n + 1)`)}.`,1],fin(0)],{type:"papier",B:a},"inégalité");}

/* ---------- RA6 : composition ---------- */
const RAPPELC=`Rappel : ${fx("(g ∘ f)(x) = g(f(x))")}. On applique d'abord f, puis g.`;
const EXPO="⁰¹²³⁴⁵";
const polX=c=>{let t="";for(let i=c.length-1;i>=0;i--){const a=c[i];if(!a)continue;const m=i===0?String(Math.abs(a)):cf(Math.abs(a),i===1?"x":"x"+EXPO[i]);t+=t?` ${a>0?"+":"−"} ${m}`:(a<0?"−":"")+m;}return t||"0";};
const polV=(c,x)=>c.reduce((t,a,i)=>t+a*Math.pow(x,i),0);
const polMul=(p,q)=>{const r=Array(p.length+q.length-1).fill(0);p.forEach((a,i)=>q.forEach((b,j)=>{r[i+j]+=a*b;}));return r;};
const polComp=(p,q)=>{const r=[];let pw=[1];p.forEach(a=>{pw.forEach((b,j)=>{r[j]=(r[j]||0)+a*b;});pw=polMul(pw,q);});return r;};
const polSub=(c,u)=>{let t="";for(let i=c.length-1;i>=0;i--){const a=c[i];if(!a)continue;const m=i===0?String(Math.abs(a)):cf(Math.abs(a),`(${u})`+(i>1?EXPO[i]:""));t+=t?` ${a>0?"+":"−"} ${m}`:(a<0?"−":"")+m;}return t||"0";};
const tapeX=x=>tape(x).replace(/³/g,"^3").replace(/⁴/g,"^4");
function deuxFonctions(R){for(;;){const une=d=>{const t=d?R.ent(0,2):0;return t===0?[R.nz(-5,5),R.nz(-3,3)]:t===1?[R.ent(-4,4),0,1]:[0,R.ent(0,1),R.choix([1,2,-1])];},qf=R()<0.5,f=une(qf),g=une(!qf&&R()<0.8);
  const gf=polComp(g,f),fg=polComp(f,g);if(polX(gf)===polX(fg)||polX(f)===polX(g)||polX(f)==="x"||polX(g)==="x")continue;return {f,g,gf,fg,fT:polX(f),gT:polX(g)};}}
function composeNombre(R){for(;;){const D=deuxFonctions(R),a=R.ent(-3,3),A=nb(a),fa=polV(D.f,a),ga=polV(D.g,a),gf=polV(D.g,fa),fg=polV(D.f,ga),ids=[`(g ∘ f)(${A})`,`(f ∘ g)(${A})`];if(gf===fg||Math.abs(gf)>200||Math.abs(fg)>200)continue;
  const E=[{w:`<b>${fx(`(g ∘ f)(${A}) = g(f(${A})) = g(${nb(fa)}) = ${nb(gf)}`)}</b>`,why:`On applique f d'abord : ${fx(`f(${A}) = ${nb(fa)}`)}. Puis on applique g à ce résultat.`,pts:1.5},{w:`<b>${fx(`(f ∘ g)(${A}) = f(g(${A})) = f(${nb(ga)}) = ${nb(fg)}`)}</b>`,why:`Cette fois, on applique g d'abord : ${fx(`g(${A}) = ${nb(ga)}`)}. Puis on applique f à ce résultat.`,pts:1.5}];
  function juge(rep){const c=rep.c||{},u=nombre(c[ids[0]]),v=nombre(c[ids[1]]);if(!u||!v)return {incomplet:"Remplis les deux cases avec des nombres."};const x=u.n/u.d,y=v.n/v.d,F=[];if(x!==gf)F.push(ids[0]);if(y!==fg)F.push(ids[1]);if(!F.length)return {ok:true};
    const d=x===fg&&y===gf?{etape:0,type:"ordre de la composition inversé",titre:"Où ça part : l'ordre.",msg:`Tu as échangé les deux. Dans ${fx("g ∘ f")}, c'est f qu'on applique en premier, celle qui est écrite à droite, près du x.`}
      :x===fa*ga||y===fa*ga?{etape:F[0]===ids[0]?0:1,type:"composition confondue avec le produit",titre:"Où ça part : composer n'est pas multiplier.",msg:`Tu as multiplié ${fx(`f(${A})`)} par ${fx(`g(${A})`)}. Composer, c'est appliquer une application au résultat de l'autre.`}
      :{etape:F[0]===ids[0]?0:1,type:"calcul d'une composée en un point",titre:`Où ça part : ${F[0]}.`,msg:F[0]===ids[0]?`${fx(`f(${A}) = ${nb(fa)}`)}, puis ${fx(`g(${nb(fa)}) = ${nb(gf)}`)}.`:`${fx(`g(${A}) = ${nb(ga)}`)}, puis ${fx(`f(${nb(ga)}) = ${nb(fg)}`)}.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux résultats sont à revoir":F[0]+" est à revoir"}.`,diag:d};}
  return {sig:"CN"+D.fT+"|"+D.gT+"|"+a,q:`On pose ${fx(`f(x) = ${D.fT}`)} et ${fx(`g(x) = ${D.gT}`)}, deux applications de ℝ dans ℝ. Calcule ${fx(ids[0])} et ${fx(ids[1])}.`,corps:`<p class="muted">${RAPPELC}</p>`,texte:`f(x) = ${D.fT}, g(x) = ${D.gT} ; ${ids.join(" et ")}`,champs:[{k:"cases",id:"c",noms:ids}],juge,etapes:E,
    bonne:`${fx(`${ids[0]} = ${nb(gf)}`)} ; ${fx(`${ids[1]} = ${nb(fg)}`)}`,bonneTxt:`${ids[0]} = ${nb(gf)} ; ${ids[1]} = ${nb(fg)}`,repBonne:{c:{[ids[0]]:String(gf),[ids[1]]:String(fg)}},repFausse:{c:{[ids[0]]:String(fg),[ids[1]]:String(gf)}},nature:D.f.length>2||D.g.length>2?"avec un carré":"deux affines",ens:{type:"cn",f:D.f,g:D.g,a,fT:D.fT,gT:D.gT}};}}
function composeFormule(R){const D=deuxFonctions(R),XS=[-2,-1,0,1,2,3],gfT=polX(D.gf),fgT=polX(D.fg),s1=polSub(D.g,D.fT),s2=polSub(D.f,D.gT),SY=[["x","x"],["x²","x²"],["^","^"],["(","("],[")",")"]];
  const E=[{w:fx(`(g ∘ f)(x) = g(f(x)) = ${s1}`),why:"Dans la formule de g, on remplace chaque x par f(x), entre parenthèses.",pts:1},{w:`<b>${fx(`(g ∘ f)(x) = ${gfT}`)}</b>`,why:"On développe et on réduit. Une réponse non développée est acceptée aussi.",pts:0.5},
    {w:fx(`(f ∘ g)(x) = f(g(x)) = ${s2}`),why:"Dans la formule de f, on remplace chaque x par g(x), entre parenthèses.",pts:1},{w:`<b>${fx(`(f ∘ g)(x) = ${fgT}`)}</b>`,why:"Les deux composées sont différentes : l'ordre compte.",pts:0.5}];
  function juge(rep){if(!propre(rep.gf)||!propre(rep.fg))return {incomplet:"Écris les deux formules, avec la lettre x."};const U=XS.map(x=>O.calcule(tapeX(rep.gf),{x})),V=XS.map(x=>O.calcule(tapeX(rep.fg),{x}));
    if(U.some(v=>v===null)||V.some(v=>v===null))return {incomplet:"Je n'arrive pas à lire une des formules. Écris-les avec la lettre x, par exemple 2(x² + 1) − 3."};
    const meme=(W,c)=>XS.every((x,i)=>proche(W[i],polV(c,x))),ok1=meme(U,D.gf),ok2=meme(V,D.fg),F=[];if(!ok1)F.push("gf");if(!ok2)F.push("fg");if(!F.length)return {ok:true};const pr=polMul(D.f,D.g);
    const d=meme(U,D.fg)&&meme(V,D.gf)?{etape:0,type:"ordre de la composition inversé",titre:"Où ça part : l'ordre.",msg:`Tu as échangé les deux. ${fx("(g ∘ f)(x) = g(f(x))")} : on remplace x par f(x) dans la formule de g.`}
      :(!ok1&&meme(U,pr))||(!ok2&&meme(V,pr))?{etape:ok1?2:0,type:"composition confondue avec le produit",titre:"Où ça part : composer n'est pas multiplier.",msg:`Tu as multiplié f(x) par g(x). Composer, c'est remplacer x par l'autre formule : ${fx(`(g ∘ f)(x) = ${s1}`)}.`}
      :!ok1?{etape:0,type:"formule d'une composée",titre:"Où ça part : g ∘ f.",msg:`Dans ${fx(`g(x) = ${D.gT}`)}, on remplace chaque x par ${fx(`(${D.fT})`)} : ${fx(s1)}. Attention aux parenthèses.`}
      :{etape:2,type:"formule d'une composée",titre:"Où ça part : f ∘ g.",msg:`Dans ${fx(`f(x) = ${D.fT}`)}, on remplace chaque x par ${fx(`(${D.gT})`)} : ${fx(s2)}. Attention aux parenthèses.`};
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux formules sont à revoir":F[0]==="gf"?"g ∘ f est à revoir":"f ∘ g est à revoir"}.`,diag:d};}
  return {sig:"CF"+D.fT+"|"+D.gT,q:`On pose ${fx(`f(x) = ${D.fT}`)} et ${fx(`g(x) = ${D.gT}`)}, deux applications de ℝ dans ℝ. Donne les formules de ${fx("(g ∘ f)(x)")} et de ${fx("(f ∘ g)(x)")}.`,corps:`<p class="muted">${RAPPELC}</p>`,texte:`f(x) = ${D.fT}, g(x) = ${D.gT} ; formules de g ∘ f et de f ∘ g`,
    champs:[{k:"champ",id:"gf",nom:"(g ∘ f)(x)",label:"$(g ∘ f)(x) =$",ex:"une formule avec x",sym:SY},{k:"champ",id:"fg",nom:"(f ∘ g)(x)",label:"$(f ∘ g)(x) =$",ex:"une formule avec x",sym:SY}],juge,etapes:E,
    bonne:`${fx(`(g ∘ f)(x) = ${gfT}`)} ; ${fx(`(f ∘ g)(x) = ${fgT}`)}`,bonneTxt:`(g ∘ f)(x) = ${gfT} ; (f ∘ g)(x) = ${fgT}`,repBonne:{gf:tapeX(gfT),fg:tapeX(fgT)},repFausse:{gf:tapeX(fgT),fg:tapeX(gfT)},nature:D.f.length>2||D.g.length>2?"avec un carré":"deux affines",ens:{type:"cf",f:D.f,g:D.g,fT:D.fT,gT:D.gT}};}
function composeTable(R){const cible=R.ent(0,3),nE=cible===2?4:3,nG=cible===1?4:3,nF=4,suite=n=>[...Array(n)].map((_,i)=>i+1),E=suite(nE),F=suite(nF),G=suite(nG);
  for(;;){const f={},g={};E.forEach(x=>{f[x]=R.choix(F);});F.forEach(y=>{g[y]=R.choix(G);});const H=E.map(x=>g[f[x]]),inj=new Set(H).size===nE,surj=G.every(z=>H.includes(z));if((inj?0:2)+(surj?0:1)!==[0,1,2,3][cible])continue;
    const ids=E.map(x=>`(g ∘ f)(${x})`),fInj=new Set(E.map(x=>f[x])).size===nE,gSurj=G.every(z=>F.some(y=>g[y]===z)),dbl=G.find(z=>H.filter(v=>v===z).length>1),seul=G.find(z=>!H.includes(z)),dF=E.map(x=>`f(${x}) = ${f[x]}`).join(", "),dG=F.map(y=>`g(${y}) = ${g[y]}`).join(", ");
    const pi=inj?`Les images ${H.join(", ")} sont toutes différentes.`:`${E.filter(x=>g[f[x]]===dbl).map(x=>`(g ∘ f)(${x})`).join(" = ")} = ${dbl} : deux éléments différents ont la même image.`,ps=surj?`Chaque élément de G est atteint : ${G.map(z=>`${z} = (g ∘ f)(${E.find(x=>g[f[x]]===z)})`).join(", ")}.`:`${seul} n'est l'image de personne par g ∘ f.`;
    const Et=[{w:E.map(x=>fx(`(g ∘ f)(${x}) = g(${f[x]}) = ${g[f[x]]}`)).join(" ; ")+".",why:"Pour chaque x, on lit f(x) dans la première liste, puis l'image de ce résultat par g dans la seconde.",pts:1.5},
      {w:`<b>g ∘ f ${inj?"est":"n'est pas"} injective.</b>`,why:pi+(inj?` Le cours dit alors que f est forcément injective : on le vérifie, ${E.map(x=>f[x]).join(", ")} sont différents.`:""),pts:0.75},{w:`<b>g ∘ f ${surj?"est":"n'est pas"} surjective.</b>`,why:ps+(surj?" Le cours dit alors que g est forcément surjective : tout élément de G est une image par g.":""),pts:0.75}];
    function juge(rep){const c=rep.c||{},V=ids.map(k=>nombre(c[k]));if(V.some(v=>!v||v.d!==1))return {incomplet:"Remplis toutes les cases avec des entiers."};if(!rep.i||!rep.s)return {incomplet:"Réponds aussi aux deux questions : injective, puis surjective."};
      const FV=ids.filter((k,i)=>V[i].n!==H[i]),okI=(rep.i==="oui")===inj,okS=(rep.s==="oui")===surj,Fx=FV.concat(okI?[]:["i"],okS?[]:["s"]);if(!Fx.length)return {ok:true};
      const j=ids.indexOf(FV[0]),x=E[j],d=FV.length?{etape:0,type:E.every((x,i)=>V[i].n===g[x])?"f oubliée dans la composée":"lecture d'une composée dans deux tableaux",titre:`Où ça part : ${FV[0]}.`,msg:`${fx(`f(${x}) = ${f[x]}`)}, puis ${fx(`g(${f[x]}) = ${g[f[x]]}`)}. On n'applique pas g à ${x}, mais à f(${x}).`}
        :!okI?{etape:1,type:inj?"application injective non reconnue":"application crue injective",titre:"Où ça part : injective ou pas.",msg:pi}:{etape:2,type:surj?"application surjective non reconnue":"application crue surjective : l'ensemble d'arrivée compte",titre:"Où ça part : surjective ou pas.",msg:ps+` L'ensemble d'arrivée de g ∘ f est G = ${ensF(G)}.`};
      return {ok:false,faux:Fx,resume:`Pas tout à fait : ${FV.length?"des valeurs de g ∘ f sont à revoir":!okI&&!okS?"les deux dernières réponses sont à revoir":!okI?"l'injectivité est à revoir":"la surjectivité est à revoir"}.`,diag:d};}
    const bon={},mauvais={};ids.forEach((k,i)=>{bon[k]=String(H[i]);mauvais[k]=String(H[i]);});
    return {sig:"CT"+dF+"|"+dG,q:`f va de ${fx(`E = ${ensF(E)}`)} dans ${fx(`F = ${ensF(F)}`)}, et g va de F dans ${fx(`G = ${ensF(G)}`)}. On donne ${fx(dF)} et ${fx(dG)}. Calcule les valeurs de ${fx("g ∘ f")}, puis dis si ${fx("g ∘ f")} est injective et si elle est surjective.`,
      corps:`<p class="muted">${RAPPELC} ${fx("g ∘ f")} va de E dans G.</p>`,texte:`${dF} ; ${dG} ; G = ${ensF(G)} ; valeurs de g ∘ f, injective ? surjective ?`,champs:[{k:"cases",id:"c",noms:ids},{k:"choix",id:"i",o:OUINON("Injective")},{k:"choix",id:"s",o:OUINON("Surjective")}],juge,etapes:Et,
      bonne:`${H.join(", ")} ; ${inj?"injective":"pas injective"}, ${surj?"surjective":"pas surjective"}`,bonneTxt:`g ∘ f : ${H.join(", ")} ; ${inj?"injective":"pas injective"}, ${surj?"surjective":"pas surjective"}`,repBonne:{c:bon,i:inj?"oui":"non",s:surj?"oui":"non"},repFausse:{c:mauvais,i:inj?"non":"oui",s:surj?"oui":"non"},nature:"tableaux",ens:{type:"ct",f,g,E,F,G}};}}
const NOMS={N:"ℕ",Z:"ℤ",R:"ℝ",P:"[0, +∞[",E:"ℝ*",C:"ℤ × ℤ"},INCL={N:"NZRP",Z:"ZR",R:"R",P:"PR",E:"ER",C:"C"},DANS={N:x=>Number.isInteger(x)&&x>=0,Z:x=>Number.isInteger(x),R:x=>typeof x==="number",P:x=>typeof x==="number"&&x>=0,E:x=>typeof x==="number"&&x!==0,C:x=>Array.isArray(x)};
/* d, a : ensembles de départ et d'arrivée ; img : les ensembles qui contiennent toutes les images ; v : quelques images [entrée, image écrite, valeur], pour montrer un résultat que l'autre application ne peut pas prendre */
const APPLIS=[{d:"R",a:"R",t:"x ↦ x − 3",img:"R",v:[["0","−3",-3],["1/2","−5/2",-2.5],["3","0",0]]},{d:"P",a:"R",t:"x ↦ √x",img:"PR",v:[["2","√2",Math.SQRT2],["0","0",0]]},{d:"R",a:"P",t:"x ↦ x²",img:"PR",v:[["1/2","1/4",0.25],["0","0",0]]},
 {d:"C",a:"Z",t:"(a, b) ↦ a + b",img:"ZR",v:[["(1, −3)","−2",-2],["(1, −1)","0",0]]},{d:"Z",a:"Z",t:"n ↦ 2n",img:"ZR",v:[["−1","−2",-2],["0","0",0]]},{d:"N",a:"N",t:"n ↦ n + 1",img:"NZRPE",v:[["0","1",1]]},{d:"Z",a:"N",t:"n ↦ |n|",img:"NZRP",v:[["0","0",0],["−2","2",2]]},
 {d:"E",a:"R",t:"x ↦ 1/x",img:"ER",v:[["−1","−1",-1],["2","1/2",0.5]]},{d:"R",a:"E",t:"x ↦ eˣ",img:"EPR",v:[["1","e",Math.E],["0","1",1]]},{d:"N",a:"R",t:"n ↦ √n",img:"PR",v:[["2","√2",Math.SQRT2],["0","0",0]]},{d:"Z",a:"C",t:"n ↦ (n, −n)",img:"C",v:[["1","(1, −1)",[1,-1]]]},
 {d:"R",a:"Z",t:"x ↦ E(x)",n:"E(x) est la partie entière de x : le plus grand entier inférieur ou égal à x.",img:"ZR",v:[["−1/2","−1",-1],["0","0",0]]},{d:"Z",a:"R",t:"n ↦ n/2",img:"R",v:[["1","1/2",0.5],["−2","−1",-1],["0","0",0]]},{d:"N",a:"Z",t:"n ↦ n − 5",img:"ZR",v:[["0","−5",-5],["5","0",0]]},
 {d:"C",a:"C",t:"(a, b) ↦ (b, a)",img:"C",v:[["(1, 2)","(2, 1)",[2,1]]]},{d:"R",a:"R",t:"x ↦ 2x + 1",img:"R",v:[["−1","−1",-1],["−1/4","1/2",0.5],["−1/2","0",0]]},{d:"E",a:"E",t:"x ↦ 1/x",img:"ER",v:[["−1","−1",-1],["2","1/2",0.5]]},{d:"P",a:"P",t:"x ↦ √x",img:"PR",v:[["2","√2",Math.SQRT2],["0","0",0]]},
 {d:"N",a:"P",t:"n ↦ n²",img:"NZRP",v:[["0","0",0]]},{d:"Z",a:"E",t:"n ↦ 2n + 1",img:"ZRE",v:[["−1","−1",-1],["0","1",1]]}];
/* g ∘ f existe quand l'arrivée de f est le départ de g ou y est incluse (leçon r-composition). On écarte les paires où l'arrivée n'est pas incluse alors que toutes les images le sont (eˣ puis √) : la réponse y dépendrait de la définition du cours. */
const temoinC=(u,v,nu)=>{const w=u.v.find(w=>!DANS[v.d](w[2]));if(!w)return null;const ent=w[0][0]==="("?nu+w[0]:`${nu}(${w[0]})`;
  return v.d==="C"?`${ent} = ${w[1]} est un nombre, pas un couple d'entiers`:Array.isArray(w[2])?`${ent} = ${w[1]} est un couple, pas un élément de ${NOMS[v.d]}`:`${ent} = ${w[1]} n'est pas dans ${NOMS[v.d]}`;};
function composeExiste(R){for(;;){const [i,j]=R.mel([...APPLIS.keys()]).slice(0,2),f=APPLIS[i],g=APPLIS[j],ex=(u,v)=>INCL[u.a].includes(v.d),e1=ex(f,g),e2=ex(g,f);if(f.t===g.t)continue;
  if((!e1&&(f.img.includes(g.d)||!temoinC(f,g,"f")))||(!e2&&(g.img.includes(f.d)||!temoinC(g,f,"g"))))continue;
  const pq=(u,v,nu,nv,ok)=>`On applique ${nu} d'abord : elle arrive dans ${fx(NOMS[u.a])}. Puis ${nv} part de ${fx(NOMS[v.d])}. ${ok?(u.a===v.d?"C'est le même ensemble : on peut toujours continuer.":`Tout élément de ${NOMS[u.a]} est dans ${NOMS[v.d]} : on peut toujours continuer.`):`Or ${temoinC(u,v,nu)} : on ne peut pas appliquer ${nv} à ce résultat.`}`;
  const E=[{w:`<b>${fx("g ∘ f")} ${e1?`existe : elle va de ${NOMS[f.d]} dans ${NOMS[g.a]}`:"n'existe pas"}.</b>`,why:pq(f,g,"f","g",e1),pts:1.5},{w:`<b>${fx("f ∘ g")} ${e2?`existe : elle va de ${NOMS[g.d]} dans ${NOMS[f.a]}`:"n'existe pas"}.</b>`,why:pq(g,f,"g","f",e2),pts:1.5}];
  function juge(rep){if(!rep.a||!rep.b)return {incomplet:"Réponds aux deux questions."};const o1=(rep.a==="oui")===e1,o2=(rep.b==="oui")===e2;if(o1&&o2)return {ok:true};
    return {ok:false,faux:[o1?null:"a",o2?null:"b"].filter(Boolean),resume:`Pas tout à fait : ${!o1&&!o2?"les deux réponses sont à revoir":!o1?"g ∘ f est à revoir":"f ∘ g est à revoir"}.`,diag:{etape:o1?1:0,type:"existence d'une composée : arrivée de la première, départ de la seconde",titre:`Où ça part : ${o1?"f ∘ g":"g ∘ f"}.`,msg:o1?pq(g,f,"g","f",e2):pq(f,g,"f","g",e1)}};}
  const note=[f.n,g.n].filter(Boolean).join(" "),ef=`f : ${NOMS[f.d]} → ${NOMS[f.a]}, ${f.t}`,eg=`g : ${NOMS[g.d]} → ${NOMS[g.a]}, ${g.t}`;
  return {sig:"CE"+[i,j],q:`On considère ${fx(ef)} et ${fx(eg)}. La composée ${fx("g ∘ f")} existe-t-elle ? Et ${fx("f ∘ g")} ?`,corps:`<p class="muted">${RAPPELC} Pour que ${fx("g ∘ f")} existe, il faut que l'ensemble d'arrivée de f soit l'ensemble de départ de g, ou y soit inclus.${note?" "+note:""}</p>`,
    texte:`${ef} ; ${eg} ; g ∘ f existe ? f ∘ g existe ?`,champs:[{k:"choix",id:"a",o:[["oui","g ∘ f existe"],["non","g ∘ f n'existe pas"]]},{k:"choix",id:"b",o:[["oui","f ∘ g existe"],["non","f ∘ g n'existe pas"]]}],juge,etapes:E,
    bonne:`g ∘ f ${e1?"existe":"n'existe pas"} ; f ∘ g ${e2?"existe":"n'existe pas"}`,bonneTxt:`g ∘ f ${e1?"existe":"n'existe pas"} ; f ∘ g ${e2?"existe":"n'existe pas"}`,repBonne:{a:e1?"oui":"non",b:e2?"oui":"non"},repFausse:{a:e1?"non":"oui",b:e2?"oui":"non"},nature:(e1?"o":"n")+(e2?"o":"n"),ens:{type:"ce",f:[f.d,f.a],g:[g.d,g.a],fImg:f.img,gImg:g.img,fv:f.v,gv:g.v}};}}
/* ce qu'on peut déduire : I = {fi, fs, gi, gs, hi, hs} (f, g, h = g ∘ f : injective ? surjective ?) */
const DEDUIRE=[
 ["Si g ∘ f est injective, alors f est injective.",true,"Si f(x) = f(x′), alors g(f(x)) = g(f(x′)), donc x = x′ puisque g ∘ f est injective. C'est la première appliquée, f, qui hérite de l'injectivité.",I=>I.hi,I=>I.fi],
 ["Si g ∘ f est injective, alors g est injective.",false,"Contre-exemple : E = {1}, F = {1, 2}, G = {1}, avec f(1) = 1 et g(1) = g(2) = 1. g ∘ f est injective (E n'a qu'un élément), mais g ne l'est pas.",I=>I.hi,I=>I.gi],
 ["Si g ∘ f est surjective, alors g est surjective.",true,"Tout z de G s'écrit g(f(x)) : c'est l'image par g de l'élément y = f(x). C'est la dernière appliquée, g, qui hérite de la surjectivité.",I=>I.hs,I=>I.gs],
 ["Si g ∘ f est surjective, alors f est surjective.",false,"Contre-exemple : E = {1}, F = {1, 2}, G = {1}, avec f(1) = 1 et g(1) = g(2) = 1. g ∘ f est surjective, mais 2 n'a pas d'antécédent par f.",I=>I.hs,I=>I.fs],
 ["Si f et g sont injectives, alors g ∘ f est injective.",true,"Si g(f(x)) = g(f(x′)), alors f(x) = f(x′) car g est injective, puis x = x′ car f est injective.",I=>I.fi&&I.gi,I=>I.hi],
 ["Si f et g sont surjectives, alors g ∘ f est surjective.",true,"Soit z dans G. Il a un antécédent y par g, et y a un antécédent x par f : alors g(f(x)) = z.",I=>I.fs&&I.gs,I=>I.hs],
 ["Si g ∘ f est bijective, alors f est injective et g est surjective.",true,"g ∘ f est injective, donc f l'est. g ∘ f est surjective, donc g l'est. Ce sont les deux résultats du cours.",I=>I.hi&&I.hs,I=>I.fi&&I.gs],
 ["Si g ∘ f est bijective, alors f et g sont bijectives.",false,"Contre-exemple : E = {1}, F = {1, 2}, G = {1}, avec f(1) = 1 et g(1) = g(2) = 1. g ∘ f est bijective, mais f n'est pas surjective et g n'est pas injective.",I=>I.hi&&I.hs,I=>I.fi&&I.fs&&I.gi&&I.gs],
 ["Si f est injective, alors g ∘ f est injective.",false,"Contre-exemple : E = F = {1, 2}, G = {1}, avec f(1) = 1, f(2) = 2 et g(1) = g(2) = 1. f est injective, mais (g ∘ f)(1) = (g ∘ f)(2).",I=>I.fi,I=>I.hi],
 ["Si g est surjective, alors g ∘ f est surjective.",false,"Contre-exemple : E = {1}, F = G = {1, 2}, avec f(1) = 1 et g(1) = 1, g(2) = 2. g est surjective, mais g ∘ f n'atteint que 1.",I=>I.gs,I=>I.hs],
 ["Si f et g sont bijectives, alors g ∘ f est bijective.",true,"La composée de deux injectives est injective, et la composée de deux surjectives est surjective.",I=>I.fi&&I.fs&&I.gi&&I.gs,I=>I.hi&&I.hs],
 ["Si g ∘ f est injective et f est surjective, alors g est injective.",true,"Si g(y) = g(y′), on écrit y = f(x) et y′ = f(x′), ce qui est possible car f est surjective. Alors g(f(x)) = g(f(x′)), donc x = x′, donc y = y′.",I=>I.hi&&I.fs,I=>I.gi],
 ["Si g ∘ f est surjective et g est injective, alors f est surjective.",true,"Soit y dans F. g(y) est dans G, donc g(y) = g(f(x)) pour un certain x, car g ∘ f est surjective. Comme g est injective, y = f(x).",I=>I.hs&&I.gi,I=>I.fs],
 ["Si g est injective, alors g ∘ f est injective.",false,"Contre-exemple : E = {1, 2}, F = G = {1}, avec f(1) = f(2) = 1 et g(1) = 1. g est injective, mais (g ∘ f)(1) = (g ∘ f)(2).",I=>I.gi,I=>I.hi],
 ["Si f est surjective, alors g ∘ f est surjective.",false,"Contre-exemple : E = F = {1}, G = {1, 2}, avec f(1) = 1 et g(1) = 1. f est surjective, mais 2 n'est pas atteint par g ∘ f.",I=>I.fs,I=>I.hs]];
function composeDeduire(R){for(;;){const K=R.mel([...DEDUIRE.keys()]).slice(0,4),L=K.map(k=>({txt:DEDUIRE[k][0],v:DEDUIRE[k][1],why:DEDUIRE[k][2],type:/surjective/.test(DEDUIRE[k][0].split(", alors")[1])?"ce que la composée dit de f et de g : surjectivité":"ce que la composée dit de f et de g : injectivité",k}));if(L.every(l=>l.v)||!L.some(l=>l.v))continue;
  return cocheVraies({brut:true,sig:"CD"+K.slice().sort((a,b)=>a-b),q:`Soit f une application de E dans F, et g une application de F dans G. Parmi les quatre affirmations suivantes, coche toutes celles qui sont vraies pour toutes les applications f et g.`,rappel:"Une affirmation est fausse dès qu'on peut trouver un contre-exemple, même tout petit.",texte:"f : E → F, g : F → G",L,nature:"déduire",ens:{type:"cd",K}});}}

/* ---------- RA8 : tables de vérité. Une formule : une lettre, ["non",f], ou [op,f,g] avec op = et, ou, imp, eq ---------- */
const OPL={et:"∧",ou:"∨",imp:"⇒",eq:"⇔"},OPW={et:"et",ou:"ou",imp:"⇒",eq:"⇔"},NOMC={non:"la négation",et:"le « et »",ou:"le « ou »",imp:"l'implication",eq:"l'équivalence"};
const vaut=(f,v)=>typeof f==="string"?v[f]:f[0]==="non"?!vaut(f[1],v):f[0]==="et"?vaut(f[1],v)&&vaut(f[2],v):f[0]==="ou"?vaut(f[1],v)||vaut(f[2],v):f[0]==="imp"?!vaut(f[1],v)||vaut(f[2],v):vaut(f[1],v)===vaut(f[2],v);
const simpleL=f=>typeof f==="string"||(f[0]==="non"&&simpleL(f[1]));
const ecrisL=(f,dedans)=>typeof f==="string"?f:f[0]==="non"?"¬"+(simpleL(f[1])?ecrisL(f[1]):"("+ecrisL(f[1])+")"):(dedans?"(":"")+ecrisL(f[1],true)+" "+OPL[f[0]]+" "+ecrisL(f[2],true)+(dedans?")":"");
const ecrisW=(f,dedans)=>typeof f==="string"?f:f[0]==="non"?"non("+ecrisW(f[1])+")":(dedans?"(":"")+ecrisW(f[1],true)+" "+OPW[f[0]]+" "+ecrisW(f[2],true)+(dedans?")":"");
const lettresL=f=>{const s=new Set(),va=g=>{if(typeof g==="string")s.add(g);else g.slice(1).forEach(va);};va(f);return [...s].sort();};
const lignesL=n=>[...Array(1<<n)].map((_,i)=>[...Array(n)].map((_,k)=>!((i>>(n-1-k))&1)));
const envL=(vs,L)=>{const o={};vs.forEach((x,k)=>{o[x]=L[k];});return o;};
const colL=(f,vs)=>lignesL(vs.length).map(L=>vaut(f,envL(vs,L)));
const memeL=(f,g,vs)=>colL(f,vs).join()===colL(g,vs).join();
const VF=b=>b?"V":"F";
const sousL=f=>{const o=[],va=g=>{if(typeof g==="string")return;g.slice(1).forEach(va);if(!o.some(x=>ecrisL(x)===ecrisL(g)))o.push(g);};va(f);return o;};
const lisVF=s=>{const t=String(s==null?"":s).trim().toLowerCase();return /^(v|vrai|1)$/.test(t)?true:/^(f|faux|0)$/.test(t)?false:null;};
const ligneTxt=(vs,L)=>vs.map((x,k)=>`${x} = ${VF(L[k])}`).join(", ");
const nonS=f=>Array.isArray(f)&&f[0]==="non"?f[1]:["non",f];
/* négation poussée jusqu'aux lettres (lois de De Morgan, non(H ⇒ K) = H et non K) */
const nie=f=>typeof f==="string"?["non",f]:f[0]==="non"?f[1]:f[0]==="et"?["ou",nie(f[1]),nie(f[2])]:f[0]==="ou"?["et",nie(f[1]),nie(f[2])]:f[0]==="imp"?["et",f[1],nie(f[2])]:["eq",f[1],nie(f[2])];
const REGLE={non:"⓪ est vraie exactement quand ① est fausse.",et:"① ∧ ② n'est vraie que si ① et ② sont vraies toutes les deux.",ou:"① ∨ ② est vraie dès que l'une des deux est vraie, ou les deux : le « ou » est inclusif.",imp:"① ⇒ ② n'est fausse que dans un cas : ① vraie et ② fausse.",eq:"① ⇔ ② est vraie quand ① et ② ont la même valeur."};
const regle=g=>REGLE[g[0]].replace(/⓪/g,fx(ecrisL(g))).replace(/①/g,fx(ecrisL(g[1],g[0]!=="non"))).replace(/②/g,g[2]?fx(ecrisL(g[2],true)):"");
function etapeCol(g,vs){const c=colL(g,vs),pos=c.map((v,i)=>v?i+1:null).filter(Boolean),neg=c.map((v,i)=>v?null:i+1).filter(Boolean),aux=k=>k.length>1?`aux lignes ${et(k.map(String))}`:`à la ligne ${k[0]}`;
  const ou=g[0]==="et"||g[0]==="eq"?(pos.length?`Ici elle est vraie ${aux(pos)}, fausse ailleurs.`:"Ici elle n'est vraie sur aucune ligne."):(neg.length?`Ici elle est fausse ${aux(neg)}, vraie ailleurs.`:"Ici elle est vraie sur toutes les lignes.");
  return {w:`<b>${fx(ecrisL(g))}</b> : ${c.map(VF).join(", ")}.`,why:regle(g)+" "+ou,pts:1};}
function typeVF(g,col,vs){const j=col.join(),alt=f=>colL(f,vs).join();if(g[0]==="non")return col.join()===colL(g[1],vs).join()?"négation oubliée":"valeur de la négation";
  const[op,a,b]=g;if(op==="imp"){if(j===alt(["et",a,b]))return "implication confondue avec « et »";if(j===alt(["eq",a,b]))return "implication confondue avec l'équivalence";if(j===alt(["imp",b,a]))return "implication lue dans l'autre sens";
    if(colL(g,vs).every((v,i)=>v===col[i]||!vaut(a,envL(vs,lignesL(vs.length)[i]))))return "implication dont l'hypothèse est fausse";return "valeur de l'implication";}
  if(op==="ou"){if(j===alt(["non",["eq",a,b]]))return "« ou » pris comme exclusif";if(j===alt(["et",a,b]))return "« et » et « ou » confondus";}
  if(op==="et"&&j===alt(["ou",a,b]))return "« et » et « ou » confondus";if(op==="eq"&&j===alt(["imp",a,b]))return "équivalence confondue avec l'implication";
  return "valeur de "+NOMC[op];}
function jugeVF(vs,cols,rep){const T=rep.t||[],N=lignesL(vs.length);let trou=false;
  const lu=N.map((_,r)=>cols.map((_,k)=>{const x=lisVF((T[r]||[])[k]);if(x===null)trou=true;return x;}));if(trou)return {incomplet:"Écris V ou F dans chaque case du tableau."};
  const faux=[];let pk=-1,pr=-1;cols.forEach((g,k)=>N.forEach((L,r)=>{if(lu[r][k]!==vaut(g,envL(vs,L))){faux.push(`t:${r}:${k}`);if(pk<0){pk=k;pr=r;}}}));if(!faux.length)return {ok:true};
  const g=cols[pk],v=envL(vs,N[pr]),dit=f=>`${fx(ecrisL(f))} vaut ${VF(vaut(f,v))}`;
  return {ok:false,faux,pk,diag:{etape:pk,type:typeVF(g,N.map((_,r)=>lu[r][pk]),vs),titre:`Où ça part : la colonne ${ecrisL(g)}, ligne ${pr+1}.`,msg:`Ligne ${pr+1} (${ligneTxt(vs,N[pr])}) : ${g[0]==="non"?dit(g[1]):dit(g[1])+" et "+dit(g[2])}, donc ${dit(g)}. ${regle(g)}`}};}
function tableVF(o){const vs=o.vs,cols=sousL(o.f),N=lignesL(vs.length),bon=N.map(L=>cols.map(g=>VF(vaut(g,envL(vs,L))))),der=cols.length-1;
  function juge(rep){const j=jugeVF(vs,cols,rep);if(j.incomplet||j.ok)return j;const n=new Set(j.faux.map(x=>x.split(":")[2])).size;
    return {ok:false,faux:j.faux,resume:`Pas tout à fait : ${n>1?`${n} colonnes sont à revoir`:`la colonne ${ecrisL(cols[j.pk])} est à revoir`}.`,diag:j.diag};}
  const ft=ecrisL(o.f),faux=bon.map(L=>L.map((x,k)=>k===der?(x==="V"?"F":"V"):x));
  return {sig:o.sig,q:o.q,corps:`<p class="muted">${o.rappel||"Rappel : on remplit une colonne après l'autre, de gauche à droite. Chaque colonne se calcule avec les colonnes déjà remplies."}</p>`,texte:`table de vérité de ${ft}`,
    champs:[{k:"vf",id:"t",donne:vs,cols:cols.map(g=>ecrisL(g)),lignes:N.map(L=>L.map(VF)),aide:"Tape V (vrai) ou F (faux) dans chaque case."}],juge,etapes:cols.map(g=>etapeCol(g,vs)),
    bonne:cols.map(g=>`${fx(ecrisL(g))} : ${colL(g,vs).map(VF).join(", ")}`).join(" ; "),bonneTxt:cols.map(g=>`${ecrisL(g)} : ${colL(g,vs).map(VF).join(" ")}`).join(" ; "),repBonne:{t:bon},repFausse:{t:faux},nature:o.nature,ens:{type:"tv",f:o.f,vs}};}
const UNCON=[["et","P","Q"],["ou","P","Q"],["imp","P","Q"],["imp","Q","P"],["eq","P","Q"],["ou",["non","P"],"Q"],["et","P",["non","Q"]],["imp",["non","P"],"Q"],["non",["et","P","Q"]],["non",["ou","P","Q"]],["imp","P",["non","Q"]],["ou","P",["non","Q"]],["eq",["non","P"],"Q"],["non",["imp","P","Q"]],["imp",["non","Q"],["non","P"]],["et",["non","P"],["non","Q"]]];
function tvUn(R){const i=R.ent(0,UNCON.length-1),f=UNCON[i];return tableVF({f,vs:["P","Q"],sig:"T1"+i,q:`P et Q sont deux propositions. Remplis la table de vérité de ${fx(ecrisL(f))}.`,rappel:`Rappel : ¬ se lit « non », ∧ « et », ∨ « ou », ⇒ « implique », ⇔ « équivaut à ».${f[0]==="non"||sousL(f).length>1?" Remplis d'abord la colonne de gauche.":""}`,nature:f[0]==="non"?"non":f[0]});}
const litL=(R,xs,p)=>{const x=R.choix(xs);return R()<p?["non",x]:x;};
function tvDeux(R){for(;;){const bin=()=>{const a=litL(R,["P","Q"],0.3),b=litL(R,["P","Q"],0.3);return [R.choix(["et","ou","imp"]),a,b];},t=R.ent(0,3),op=R.choix(["et","ou","imp","imp","eq"]);
  const X=t===3?["non",bin()]:bin(),Y=t===0?bin():litL(R,["P","Q"],0.3),f=R()<0.5?[op,X,Y]:[op,Y,X],n=sousL(f).length;
  if(lettresL(f).length<2||n<3||n>4||ecrisL(X)===ecrisL(Y)||lettresL(X).length<2)continue;
  return tableVF({f,vs:["P","Q"],sig:"T2"+ecrisL(f),q:`P et Q sont deux propositions. Remplis la table de vérité de ${fx(ecrisL(f))}, colonne par colonne.`,nature:n+" colonnes"});}}
function formule3(R,neg){const l=R()<0.7?["P","Q","R"]:R.mel(["P","Q","R"]),k=neg?R.ent(0,2):-1,L=l.map((x,i)=>i===k?["non",x]:x),op1=R.choix(["et","ou","imp","imp"]),op2=R.choix(["et","ou","imp"]);
  return R()<0.6?[op1,[op2,L[0],L[1]],L[2]]:[op1,L[0],[op2,L[1],L[2]]];}
function tvTrois(R){const f=R()<0.12?["imp",["et",["non","P"],"Q"],"R"]:formule3(R,R()<0.5);
  return tableVF({f,vs:["P","Q","R"],sig:"T3"+ecrisL(f),q:`P, Q et R sont trois propositions. Remplis la table de vérité de ${fx(ecrisL(f))}.`,rappel:"Avec trois propositions, il y a 8 lignes : toutes les façons de choisir V ou F pour P, Q et R. Remplis une colonne après l'autre.",nature:sousL(f).length+" colonnes"});}
/* valeur de f quand on fixe certaines lettres : {c} si elle ne dépend plus des autres, sinon {f} ; les raisons vont dans why */
function fixeL(f,v,why){if(typeof f==="string")return f in v?{c:v[f]}:{f};
  if(f[0]==="non"){const a=fixeL(f[1],v,why);if("c" in a){if(typeof f[1]!=="string")why.push(`${fx(ecrisL(f[1]))} est ${a.c?"vraie":"fausse"}, donc ${fx(ecrisL(f))} est ${a.c?"fausse":"vraie"}.`);return {c:!a.c};}return {f:nonS(a.f)};}
  const a=fixeL(f[1],v,why),b=fixeL(f[2],v,why),A=fx(ecrisL(f[1],true)),B=fx(ecrisL(f[2],true)),F=fx(ecrisL(f)),dit=(c,r)=>{why.push(`${r} : ${F} est ${c?"vraie":"fausse"}.`);return {c};};
  if(f[0]==="et"){if(a.c===false)return dit(false,`${A} est fausse, et un « et » dont un côté est faux est faux`);if(b.c===false)return dit(false,`${B} est fausse, et un « et » dont un côté est faux est faux`);if(a.c&&b.c)return dit(true,`${A} et ${B} sont vraies`);return {f:a.c?b.f:b.c?a.f:["et",a.f,b.f]};}
  if(f[0]==="ou"){if(a.c===true)return dit(true,`${A} est vraie, et un « ou » dont un côté est vrai est vrai`);if(b.c===true)return dit(true,`${B} est vraie, et un « ou » dont un côté est vrai est vrai`);if(a.c===false&&b.c===false)return dit(false,`${A} et ${B} sont fausses`);return {f:a.c===false?b.f:b.c===false?a.f:["ou",a.f,b.f]};}
  if(f[0]==="imp"){if(a.c===false)return dit(true,`${A} est fausse, et une implication dont l'hypothèse est fausse est vraie`);if(b.c===true)return dit(true,`${B} est vraie, et une implication dont la conclusion est vraie est vraie`);if(a.c===true&&b.c===false)return dit(false,`${A} est vraie et ${B} est fausse`);return {f:a.c===true?b.f:b.c===false?nonS(a.f):["imp",a.f,b.f]};}
  if("c" in a&&"c" in b)return dit(a.c===b.c,a.c===b.c?`${A} et ${B} ont la même valeur`:`${A} et ${B} n'ont pas la même valeur`);
  return {f:a.c===true?b.f:a.c===false?nonS(b.f):b.c===true?a.f:b.c===false?nonS(a.f):["eq",a.f,b.f]};}
const CONNUE=[["vraie","Oui : elle est vraie"],["fausse","Oui : elle est fausse"],["non","Non : ça dépend des autres propositions"]];
function tvConnue(R){const veut=R.choix(["vraie","fausse","non","vraie"]);let f,x,b,rep,reste;
  for(let n=0;;n++){f=R()<0.15?["imp",["et",["non","P"],"Q"],"R"]:formule3(R,R()<0.5);x=R.choix(["P","Q","R"]);b=R()<0.5;reste=["P","Q","R"].filter(y=>y!==x);
    const c=lignesL(2).map(L=>vaut(f,Object.assign(envL(reste,L),{[x]:b})));rep=c.every(Boolean)?"vraie":c.some(Boolean)?"non":"fausse";if(rep===veut||n>60)break;}
  const why=[],r=fixeL(f,{[x]:b},why),A=fx(ecrisL(f)),qui=et(reste),sup=`${x} est ${b?"vraie":"fausse"}`;let E;
  if(rep!=="non")E=why.map((t,i)=>({w:t,why:i?"On remonte la formule, de l'intérieur vers l'extérieur.":`On part de ce qu'on sait : ${sup}.`,pts:1})).concat([{w:`<b>Oui : (Ass) est ${rep}, quelles que soient ${qui}.</b>`,why:"On n'a jamais eu besoin des valeurs des autres propositions.",pts:1}]);
  else{const N=lignesL(2),v=L=>vaut(f,Object.assign(envL(reste,L),{[x]:b})),Lv=N.find(v),Lf=N.find(L=>!v(L));
    E=[{w:`Quand ${sup}, (Ass) a la même valeur que ${fx(ecrisL(r.f))}.`,why:why.length?why.join(" "):`On remplace ${x} par ${VF(b)} : il reste une formule de ${qui}.`,pts:1},
      {w:`Avec ${ligneTxt(reste,Lv)}, (Ass) est vraie. Avec ${ligneTxt(reste,Lf)}, elle est fausse.`,why:"Deux lignes de la table de vérité où les valeurs sont différentes suffisent.",pts:1},{w:"<b>Non : on ne peut pas déterminer la valeur de (Ass).</b>",why:`Elle dépend encore de ${qui}.`,pts:1}];}
  function juge(rep2){if(!rep2.a)return {incomplet:"Choisis une réponse."};if(rep2.a===rep)return {ok:true};
    return {ok:false,faux:["a"],resume:"Pas tout à fait.",diag:{etape:0,type:rep==="non"?"valeur crue déterminée alors qu'elle dépend des autres":rep2.a==="non"?"valeur déterminée non vue":"valeur déterminée, mais pas la bonne",titre:"Où ça part : ce que la valeur connue impose.",msg:E.map(e=>e.w).join(" ")}};}
  return {sig:"TC"+ecrisL(f)+x+b,q:`P, Q et R sont trois propositions. On considère l'assertion (Ass) : ${fx(ecrisL(f))}. On suppose que ${sup}. Peut-on déterminer la valeur de vérité de (Ass) ?`,corps:`<p class="muted">Comme au CC1 2023-2024, exercice 1. On peut écrire la table de vérité, ou seulement ses lignes où ${sup}.</p>`,
    texte:`(Ass) : ${ecrisL(f)} ; ${sup} ; valeur déterminée ?`,champs:[{k:"choix",id:"a",o:CONNUE}],juge,etapes:E,bonne:CONNUE.find(o=>o[0]===rep)[1],bonneTxt:CONNUE.find(o=>o[0]===rep)[1],repBonne:{a:rep},repFausse:{a:rep==="non"?"vraie":"non"},nature:rep,ens:{type:"tc",f,x,b}};}
/* QCM : à partir de X, des formules obtenues par une règle du cours (équivalentes) ou par une erreur classique (pièges) */
const BASESQ=[["imp","A",["et","B","C"]],["imp","A",["ou","B","C"]],["imp",["et","A","B"],"C"],["imp",["ou","A","B"],"C"],["eq",["et","A","B"],"C"],["eq","A","B"],["imp","A","B"]];
function reglesQ(X,M){const E=[],P=[],w=f=>ecrisW(M(f)),ici=o=>" Ici "+Object.entries(o).map(([k,f])=>`${k} = ${simpleL(M(f))?w(f):"« "+w(f)+" »"}`).join(", ")+".",dm=f=>typeof f==="string"||f[0]==="non"?"":` La négation de ${w(f)} est ${w(nie(f))} (lois de De Morgan).`,e=(f,why)=>E.push({f,why}),p=f=>P.push({f});
  if(X[0]==="imp"){const[,H,K]=X,hk=ici({H,K});
    e(["imp",nie(K),nie(H)],"C'est la contraposée : « non(K) ⇒ non(H) » a la même table que « H ⇒ K »."+hk+dm(K)+dm(H));
    e(["ou",nie(H),K],"« H ⇒ K » a la même table que « non(H) ou K »."+hk+dm(H));
    p(["imp",K,H]);p(["imp",nie(H),nie(K)]);p(["et",H,K]);p(["ou",H,nie(K)]);
    if(K[0]==="et"){const o=ici({H,"K₁":K[1],"K₂":K[2]});e(["et",["imp",H,K[1]],["imp",H,K[2]]],"« H ⇒ (K₁ et K₂) » dit que H entraîne K₁, et que H entraîne K₂."+o);
      p(["ou",["imp",H,K[1]],["imp",H,K[2]]]);p(["ou",["imp",nie(K[1]),nie(H)],["imp",nie(K[2]),nie(H)]]);p(["imp",["et",nie(K[1]),nie(K[2])],nie(H)]);}
    if(K[0]==="ou"){const o=ici({H,"K₁":K[1],"K₂":K[2]});e(["imp",["et",H,nie(K[1])],K[2]],"« H ⇒ (K₁ ou K₂) » : si H est vraie et K₁ fausse, il faut que K₂ soit vraie."+o);
      e(["ou",["imp",H,K[1]],["imp",H,K[2]]],"« (H ⇒ K₁) ou (H ⇒ K₂) » s'écrit « non(H) ou K₁ ou non(H) ou K₂ », c'est-à-dire « non(H) ou K₁ ou K₂ »."+o);p(["et",["imp",H,K[1]],["imp",H,K[2]]]);p(["imp",["ou",nie(K[1]),nie(K[2])],nie(H)]);}
    if(H[0]==="et"){const o=ici({"H₁":H[1],"H₂":H[2],K});e(["imp",H[1],["imp",H[2],K]],"Supposer H₁, puis supposer H₂, revient à supposer « H₁ et H₂ »."+o);
      e(["ou",["imp",H[1],K],["imp",H[2],K]],"« (H₁ ⇒ K) ou (H₂ ⇒ K) » s'écrit « non(H₁) ou non(H₂) ou K », c'est-à-dire « non(H₁ et H₂) ou K »."+o);p(["et",["imp",H[1],K],["imp",H[2],K]]);}
    if(H[0]==="ou"){const o=ici({"H₁":H[1],"H₂":H[2],K});e(["et",["imp",H[1],K],["imp",H[2],K]],"« (H₁ ou H₂) ⇒ K » dit que chacune des deux hypothèses suffit pour avoir K."+o);p(["ou",["imp",H[1],K],["imp",H[2],K]]);p(["imp",["et",H[1],H[2]],K]);}}
  else{const[,U,V]=X,uv=ici({U,V});e(["et",["imp",U,V],["imp",V,U]],"Une équivalence « U ⇔ V », c'est l'implication dans chaque sens."+uv);
    e(["et",["imp",U,V],["imp",nie(U),nie(V)]],"« non(U) ⇒ non(V) » est la contraposée de « V ⇒ U » : on a bien les deux sens."+uv+dm(U)+dm(V));
    e(["ou",["et",U,V],["et",nie(U),nie(V)]],"« U ⇔ V » est vraie quand U et V sont vraies toutes les deux, ou fausses toutes les deux."+uv+dm(U)+dm(V));
    e(["eq",nie(U),nie(V)],"U et V ont la même valeur exactement quand non(U) et non(V) ont la même valeur."+uv+dm(U)+dm(V));
    p(["et",["imp",U,V],["imp",nie(V),nie(U)]]);p(["ou",["imp",U,V],["imp",V,U]]);p(["et",U,V]);
    if(U[0]==="et"){e(["et",["imp",U,V],["et",["imp",V,U[1]],["imp",V,U[2]]]],"« V ⇒ (U₁ et U₂) » s'écrit « (V ⇒ U₁) et (V ⇒ U₂) » : c'est encore les deux sens de l'équivalence."+ici({"U₁":U[1],"U₂":U[2],V}));
      p(["et",["eq",U[1],V],["eq",U[2],V]]);p(["ou",["eq",U[1],V],["eq",U[2],V]]);p(["et",["imp",U,V],["imp",["ou",nie(U[1]),nie(U[2])],V]]);}}
  return {E,P};}
const substQ=(f,s)=>typeof f==="string"?s[f]:[f[0],...f.slice(1).map(g=>substQ(g,s))];
const propreQ=f=>typeof f==="string"?f:f[0]==="non"&&Array.isArray(f[1])&&f[1][0]==="non"?propreQ(f[1][1]):[f[0],...f.slice(1).map(propreQ)];
function tvQcm(R){for(;;){const B=R.choix(BASESQ),perm=R.mel(["A","B","C"]),s={};["A","B","C"].forEach((x,i)=>{s[x]=R()<0.2?["non",perm[i]]:perm[i];});
  const M=f=>propreQ(substQ(f,s)),X=M(B),vs=lettresL(X),{E,P}=reglesQ(B,M),tx=ecrisW(X);
  const cand=R.mel(E.map(x=>({f:M(x.f),why:x.why}))).slice(0,R.ent(1,3)).concat(R.mel(P.map(x=>({f:M(x.f)})))).slice(0,5),vus=new Set();if(cand.length<4)continue;
  const L=[];for(const c of R.mel(cand)){const t=ecrisW(c.f);if(t===tx||vus.has(t))continue;vus.add(t);const v=memeL(c.f,X,vs);let why=c.why;
    if(!v){const r=lignesL(vs.length).find(Lg=>vaut(c.f,envL(vs,Lg))!==vaut(X,envL(vs,Lg))),env=envL(vs,r);why=`Avec ${ligneTxt(vs,r)}, ${tx} est ${vaut(X,env)?"vraie":"fausse"}, mais cette proposition est ${vaut(c.f,env)?"vraie":"fausse"} : une seule ligne différente suffit.`;}
    else if(!why)why="Elle a la même table de vérité.";
    L.push({txt:t,v,why,type:v?"proposition équivalente non reconnue":"proposition crue équivalente"});}
  if(L.length<4||L.every(l=>l.v)||!L.some(l=>l.v))continue;
  return cocheVraies({brut:true,sig:"TQ"+tx+"|"+L.map(l=>l.txt).sort().join("|"),q:`${et(vs)} sont des propositions. Parmi les propositions suivantes, coche toutes celles qui sont logiquement équivalentes à ${tx}.`,rappel:"Comme au QCM du CC : il peut y avoir une ou plusieurs bonnes réponses. Deux propositions sont équivalentes quand elles ont la même table de vérité.",texte:`équivalentes à ${tx}`,L,nature:ecrisW(B),ens:{type:"tq",X,L:L.map(l=>l.txt)}});}}

/* ---------- RA7 : contraposée, réciproque, négation, absurde et disjonction de cas ---------- */
const IMPL=[["ℕ","n² n'est pas un multiple de 3","n² est un multiple de 3","n n'est pas un multiple de 3","n est un multiple de 3"],["ℤ","n² est pair","n² est impair","n est pair","n est impair"],
 ["ℤ","n² − 1 n'est pas divisible par 8","n² − 1 est divisible par 8","n est pair","n est impair"],["ℝ","x > 2","x ≤ 2","x² > 4","x² ≤ 4"],["ℝ","x² ≤ 1","x² > 1","x ≤ 1","x > 1"],
 ["ℕ","n est un multiple de 6","n n'est pas un multiple de 6","n est pair","n est impair"],["ℤ","n est impair","n est pair","n² est impair","n² est pair"],["ℝ","x ≠ 0","x = 0","x² > 0","x² ≤ 0"],
 ["ℤ","3n + 1 est pair","3n + 1 est impair","n est impair","n est pair"],["ℕ","n ≥ 5","n < 5","2ⁿ > n²","2ⁿ ≤ n²"],["ℝ","x³ > 8","x³ ≤ 8","x > 2","x ≤ 2"],["ℤ","n est un multiple de 4","n n'est pas un multiple de 4","n² est un multiple de 8","n² n'est pas un multiple de 8"]];
const morceaux=I=>({tout:`Pour tout ${I[0]==="ℝ"?"x":"n"} ∈ ${I[0]},`,ex:`Il existe ${I[0]==="ℝ"?"x":"n"} ∈ ${I[0]} tel que`,A:I[1],nA:I[2],B:I[3],nB:I[4]});
const SORTES={impl:m=>`${m.tout} si ${m.A}, alors ${m.B}.`,contra:m=>`${m.tout} si ${m.nB}, alors ${m.nA}.`,recip:m=>`${m.tout} si ${m.B}, alors ${m.A}.`,nega:m=>`${m.ex} ${m.A} et ${m.nB}.`,
 inverse:m=>`${m.tout} si ${m.nA}, alors ${m.nB}.`,toutEt:m=>`${m.tout} ${m.A} et ${m.nB}.`,exSi:m=>`${m.ex} si ${m.A}, alors ${m.nB}.`};
const NOMRC={c:"la contraposée",r:"la réciproque",n:"la négation",a:"aucune des trois"},RCDE={contra:"c",recip:"r",nega:"n",inverse:"a",toutEt:"a",exSi:"a"};
const POURQ={contra:"On a échangé les deux côtés et on les a niés, en gardant le « pour tout » : c'est la contraposée. Elle a la même valeur de vérité que la phrase de départ.",recip:"On a échangé les deux côtés sans les nier : c'est la réciproque. Elle peut être fausse quand la phrase de départ est vraie.",
 nega:"La négation de « pour tout …, si A, alors B » est « il existe … tel que A et non B » : le « pour tout » devient « il existe », et la négation d'une implication est « A et non B ».",
 inverse:"On a nié les deux côtés sans les échanger. Ce n'est ni la contraposée (il faut aussi échanger), ni la réciproque, ni la négation.",toutEt:"Ce n'est pas la négation : le « pour tout » aurait dû devenir « il existe ».",exSi:"Ce n'est pas la négation : la négation d'une implication n'est pas une implication, c'est « A et non B »."};
const CHRC=[["c","contraposée"],["r","réciproque"],["n","négation"],["a","aucune des trois"]];
function reconnaitre(R){for(;;){const i=R.ent(0,IMPL.length-1),m=morceaux(IMPL[i]),K=R.mel(["contra","recip","nega","inverse","toutEt","exSi"]).slice(0,4);if(K.filter(k=>RCDE[k]!=="a").length<2)continue;
  const ids=K.map((_,j)=>"p"+j),bon={};K.forEach((k,j)=>{bon[ids[j]]=RCDE[k];});
  function juge(rep){if(ids.some(x=>!rep[x]))return {incomplet:"Choisis une réponse pour chacune des quatre phrases."};const F=ids.filter((x,j)=>rep[x]!==bon[x]);if(!F.length)return {ok:true};const j=ids.indexOf(F[0]),k=K[j];
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?F.length+" phrases sont mal classées":"la phrase "+(j+1)+" est mal classée"}.`,diag:{etape:j,type:`${NOMRC[RCDE[k]]==="aucune des trois"?"phrase qui n'est ni contraposée, ni réciproque, ni négation":NOMRC[RCDE[k]]+" non reconnue"}`,titre:`Où ça part : la phrase ${j+1}.`,msg:`C'est ${NOMRC[RCDE[k]]}. ${POURQ[k]}`}};}
  return {sig:"RC"+i+K.join(),q:`On considère l'assertion : « ${h(SORTES.impl(m))} » Pour chaque phrase ci-dessous, dis si c'est sa contraposée, sa réciproque, sa négation, ou aucune des trois.`,corps:`<p class="muted">Rappel : la contraposée de « si A, alors B » est « si non B, alors non A ». La réciproque est « si B, alors A ».</p>`,
    texte:`${SORTES.impl(m)} ; ${K.map(k=>SORTES[k](m)).join(" | ")}`,champs:K.map((k,j)=>({k:"choix",id:ids[j],titre:`Phrase ${j+1} : « ${h(SORTES[k](m))} »`,o:CHRC})),juge,
    etapes:K.map((k,j)=>({w:`Phrase ${j+1} : <b>${NOMRC[RCDE[k]]}</b>.`,why:POURQ[k],pts:1})),bonne:K.map((k,j)=>`phrase ${j+1} : ${NOMRC[RCDE[k]]}`).join(" ; "),bonneTxt:K.map((k,j)=>`${j+1} ${NOMRC[RCDE[k]]}`).join(", "),
    repBonne:bon,repFausse:Object.fromEntries(ids.map((x,j)=>[x,bon[x]==="c"?"r":"c"])),nature:"reconnaître",ens:{type:"rc",i,K}};}}
function assembler(R){const i=R.ent(0,IMPL.length-1),I=IMPL[i],m=morceaux(I),neg=R()<0.5,AT=R.mel(["A","nA","B","nB"]),attendu=neg?["e","et","A","nB"]:["t","si","nB","nA"];
  const Q2=[["q","Début",[["t",m.tout],["e",m.ex]]],["f","Forme",[["si","si … , alors …"],["et","… et …"]]],["a","Premier morceau",AT.map(x=>[x,m[x]])],["b","Second morceau",AT.map(x=>[x,m[x]])]];
  const phrase=r=>r.f==="si"?`${r.q==="t"?m.tout:m.ex} si ${m[r.a]}, alors ${m[r.b]}.`:`${r.q==="t"?m.tout:m.ex} ${m[r.a]} et ${m[r.b]}.`,bonR={q:attendu[0],f:attendu[1],a:attendu[2],b:attendu[3]},but=phrase(bonR);
  const conn={[["t","si","B","A"]]:"réciproque au lieu de la contraposée",[["t","si","nA","nB"]]:"les deux côtés niés sans les échanger",[["t","et","A","nB"]]:"« pour tout » gardé dans la négation",[["e","si","A","nB"]]:"négation écrite comme une implication",[["e","et","nA","B"]]:"mauvais côté nié",[["t","si","A","nB"]]:"négation écrite comme une implication"};
  function juge(rep){if(["q","f","a","b"].some(x=>!rep[x]))return {incomplet:"Choisis le début, la forme et les deux morceaux."};if(rep.a===rep.b)return {incomplet:"Les deux morceaux doivent être différents."};
    const r=[rep.q,rep.f,rep.a,rep.b],ok=r.join()===attendu.join()||(neg&&r.join()===["e","et","nB","A"].join());if(ok)return {ok:true};
    const F=["q","f"].filter((x,k)=>r[k]!==attendu[k]);if(!F.length)F.push("a","b");const typ=conn[r]||(neg?"négation d'une implication":"contraposée");
    return {ok:false,faux:F,resume:`Pas tout à fait : tu as écrit « ${h(phrase(rep))} »`,diag:{etape:0,type:typ,titre:"Où ça part : la forme de la phrase.",msg:neg?POURQ.nega:POURQ.contra}};}
  return {sig:"AS"+i+neg,q:`On considère l'assertion (∗) : « ${h(SORTES.impl(m))} » Écris ${neg?"la négation":"la contraposée"} de (∗), en choisissant ses morceaux.`,corps:`<p class="muted">Comme au CC1 2022-2023, exercice 1.</p>`,texte:`${neg?"négation":"contraposée"} de : ${SORTES.impl(m)}`,
    champs:Q2.map(([id,t,o])=>({k:"choix",id,titre:t+" :",o:o.map(x=>[x[0],h(x[1])])})),juge,
    etapes:[{w:`<b>${h(but)}</b>`,why:neg?POURQ.nega:POURQ.contra,pts:2},{w:neg?`Le contraire de « ${h(m.B)} » est « ${h(m.nB)} ».`:`Le contraire de « ${h(m.B)} » est « ${h(m.nB)} », celui de « ${h(m.A)} » est « ${h(m.nA)} ».`,why:"Nier une phrase simple : « pair » devient « impair », « > » devient « ≤ », « est un multiple » devient « n'est pas un multiple ».",pts:1}],
    bonne:h(but),bonneTxt:but,repBonne:bonR,repFausse:neg?{q:"t",f:"et",a:"A",b:"nB"}:{q:"t",f:"si",a:"B",b:"A"},nature:neg?"négation":"contraposée",ens:{type:"as",i,neg}};}
/* lecture d'une formule tapée en P, Q, R : ¬ ∧ ∨ ⇒ ⇔ ou leurs écritures au clavier */
function lisFormule(src){const s=String(src||"").replace(/\s+/g," ").trim();if(!s)return null;const T=[];let i=0;
  const SYM=[["<=>","eq"],["<->","eq"],["⇔","eq"],["=>","imp"],["->","imp"],["⇒","imp"],["∧","et"],["&","et"],["∨","ou"],["|","ou"],["¬","non"],["!","non"],["~","non"],["(","("],[")",")"]];
  while(i<s.length){if(s[i]===" "){i++;continue;}const y=SYM.find(x=>s.startsWith(x[0],i));if(y){T.push(y[1]);i+=y[0].length;continue;}const w=/^(non|et|ou)/i.exec(s.slice(i));if(w){T.push(w[1].toLowerCase());i+=w[1].length;continue;}
    if(/[pqr]/i.test(s[i])){T.push(s[i].toUpperCase());i++;continue;}return {err:`Je ne sais pas lire « ${s[i]} ». Écris avec P, Q, R, ¬, ∧, ∨, ⇒ et des parenthèses.`};}
  let k=0;const voit=t=>T[k]===t,err=m=>{throw new Error(m);};
  const un=()=>{if(voit("non")){k++;return ["non",un()];}if(voit("(")){k++;const f=eq();if(!voit(")"))err("Une parenthèse n'est pas fermée.");k++;return f;}if(/^[PQR]$/.test(T[k]||"")){return T[k++];}err("Il manque une lettre ou une parenthèse.");};
  const chaine=()=>{let f=un();const vus=new Set();while(voit("et")||voit("ou")){const op=T[k++];vus.add(op);f=[op,f,un()];}if(vus.size>1)err("Mets des parenthèses : avec ∧ et ∨ côte à côte, la formule peut se lire de deux façons.");return f;};
  const imp=()=>{const f=chaine();if(voit("imp")){k++;const g=chaine();if(voit("imp"))err("Mets des parenthèses : avec deux ⇒ à la suite, la formule peut se lire de deux façons.");return ["imp",f,g];}return f;};
  const eq=()=>{const f=imp();if(voit("eq")){k++;return ["eq",f,imp()];}return f;};
  try{const f=eq();if(k<T.length)err("La formule ne se lit pas jusqu'au bout : vérifie les parenthèses.");return {f};}catch(x){return {err:x.message};}}
const contient=(f,op)=>Array.isArray(f)&&(f[0]===op||f.slice(1).some(g=>contient(g,op)));
const negLettres=f=>typeof f==="string"||(f[0]==="non"?typeof f[1]==="string":f.slice(1).every(negLettres));
const PQR=["P","Q","R"],eqv=(f,g)=>memeL(f,g,PQR);
function formulesContra(R){const ordre=R()<0.7?PQR:R.mel(PQR),lit=x=>R()<0.4?["non",x]:x,op=R.choix(["et","ou"]),S1=R()<0.6,deux=R()<0.5?"neg":"sansImp";
  const H=S1?[op,lit(ordre[0]),lit(ordre[1])]:lit(ordre[0]),C=S1?lit(ordre[2]):[op,lit(ordre[1]),lit(ordre[2])],A=["imp",H,C],interdit=OPL[op];
  const contra=["imp",nie(C),nie(H)],nega=["et",H,nie(C)],sansI=["ou",nie(H),C],rep2=deux==="neg"?nega:sansI;
  function j1(t){const r=lisFormule(t);if(!r)return {vide:true};if(r.err)return {err:r.err};const f=r.f;
    if(f[0]==="imp"&&eqv(f[1],nie(C))&&eqv(f[2],nie(H))&&!contient(f,op))return {ok:true};
    if(contient(f,op)&&f[0]==="imp"&&eqv(f[1],nie(C))&&eqv(f[2],nie(H)))return {type:"opérateur interdit utilisé",msg:`Ta contraposée est juste, mais l'énoncé interdit ${interdit}. Pour nier ${fx(ecrisL(S1?H:C))}, utilise les lois de De Morgan : on obtient ${fx(ecrisL(S1?nie(H):nie(C)))}.`};
    if(f[0]!=="imp")return {type:"la contraposée n'est pas une implication",msg:"La contraposée d'une implication est encore une implication : « non(conclusion) ⇒ non(hypothèse) »."};
    if(eqv(f[1],C)&&eqv(f[2],H))return {type:"réciproque au lieu de la contraposée",msg:"Tu as échangé les deux côtés sans les nier : c'est la réciproque."};
    if(eqv(f[1],nie(H))&&eqv(f[2],nie(C)))return {type:"les deux côtés niés sans les échanger",msg:"Il faut aussi échanger : la contraposée de « H ⇒ C » est « ¬C ⇒ ¬H »."};
    if(eqv(f[1],nie(C)))return {type:"négation de l'hypothèse fausse (lois de De Morgan)",msg:`À droite, il faut la négation de ${fx(ecrisL(H))}, c'est-à-dire ${fx(ecrisL(nie(H)))}.`};
    return {type:"négation de la conclusion fausse",msg:`À gauche, il faut la négation de ${fx(ecrisL(C))}, c'est-à-dire ${fx(ecrisL(nie(C)))}.`};}
  function j2(t){const r=lisFormule(t);if(!r)return {vide:true};if(r.err)return {err:r.err};const f=r.f;
    if(deux==="neg"){if(contient(f,"imp")||contient(f,"eq"))return {type:"négation écrite comme une implication",msg:"La négation d'une implication n'est pas une implication : la négation de « H ⇒ C » est « H ∧ ¬C »."};
      if(!eqv(f,["non",A]))return {type:eqv(f,["et",H,C])?"conclusion non niée":"négation d'une implication",msg:`La négation de « H ⇒ C » est « H ∧ ¬C », ici ${fx(ecrisL(nega))}.`};
      if(!negLettres(f))return {type:"négation pas poussée jusqu'aux lettres",msg:`Ta formule a la bonne valeur, mais il faut un ¬ seulement devant les lettres : ${fx(ecrisL(nega))}.`};return {ok:true};}
    if(contient(f,"imp")||contient(f,"eq"))return {type:"⇒ utilisé alors qu'il est interdit",msg:"L'énoncé n'autorise que ∧, ∨ et ¬. On utilise : « H ⇒ C » a la même table que « ¬H ∨ C »."};
    if(!eqv(f,A))return {type:"implication réécrite avec ∧, ∨ et ¬",msg:`« H ⇒ C » a la même table que « ¬H ∨ C », ici ${fx(ecrisL(sansI))}.`};return {ok:true};}
  function juge(rep){const a=j1(rep.a),b=j2(rep.b);if(a.vide||b.vide)return {incomplet:"Écris les deux formules."};if(a.err||b.err)return {incomplet:a.err||b.err};if(a.ok&&b.ok)return {ok:true};
    const F=[a.ok?null:"a",b.ok?null:"b"].filter(Boolean),d=a.ok?b:a;return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux formules sont à revoir":F[0]==="a"?"la contraposée est à revoir":"la seconde formule est à revoir"}.`,diag:{etape:a.ok?2:0,type:d.type,titre:`Où ça part : ${a.ok?"la seconde formule":"la contraposée"}.`,msg:d.msg}};}
  const dm=f=>simpleL(f)?"":` Pour nier ${fx(ecrisL(f))}, on utilise les lois de De Morgan : ${fx(ecrisL(nie(f)))}.`,SY=[["¬","¬"],["∧","∧"],["∨","∨"],["⇒","⇒"],["(","("],[")",")"],["P","P"],["Q","Q"],["R","R"]];
  const E=[{w:`Contraposée : ${fx(ecrisL(["imp",["non",C],["non",H]]))}.`,why:"La contraposée de « H ⇒ C » est « ¬C ⇒ ¬H » : on échange les deux côtés et on les nie.",pts:1},{w:`<b>${fx(ecrisL(contra))}</b>`,why:`On simplifie les négations.${dm(C)}${dm(H)} Il n'y a plus de ${interdit}.`,pts:1},
    deux==="neg"?{w:`<b>${fx(ecrisL(nega))}</b>`,why:`La négation de « H ⇒ C » est « H ∧ ¬C ».${dm(C)}`,pts:2}:{w:`<b>${fx(ecrisL(sansI))}</b>`,why:`« H ⇒ C » a la même table de vérité que « ¬H ∨ C ».${dm(H)}`,pts:2}];
  const q2=deux==="neg"?"Écris la négation de (Ass), sans ⇒, avec un ¬ seulement devant les lettres.":"Écris une assertion équivalente à (Ass) en utilisant uniquement P, Q, R et ∧, ∨, ¬.";
  return {sig:"FC"+ecrisL(A)+deux,q:`P, Q et R sont trois propositions. On considère l'assertion (Ass) : ${fx(ecrisL(A))}. (a) Écris la contraposée de (Ass), sans utiliser ${interdit}. (b) ${q2}`,corps:`<p class="muted">Comme au CC1 2023-2024, exercice 1. Au clavier : ! ou « non » pour ¬, & ou « et » pour ∧, | ou « ou » pour ∨, => pour ⇒.</p>`,
    texte:`(Ass) : ${ecrisL(A)} ; contraposée sans ${interdit} ; ${deux==="neg"?"négation":"équivalente sans ⇒"}`,champs:[{k:"champ",id:"a",nom:"contraposée",label:"(a)",ex:"la contraposée",sym:SY,apercu:false},{k:"champ",id:"b",nom:deux==="neg"?"négation":"sans ⇒",label:"(b)",ex:deux==="neg"?"la négation":"avec ∧, ∨, ¬",sym:SY,apercu:false}],juge,etapes:E,
    bonne:`(a) ${fx(ecrisL(contra))} ; (b) ${fx(ecrisL(rep2))}`,bonneTxt:`(a) ${ecrisL(contra)} ; (b) ${ecrisL(rep2)}`,repBonne:{a:ecrisL(contra),b:ecrisL(rep2)},repFausse:{a:ecrisL(["imp",C,H]),b:ecrisL(rep2)},nature:(S1?"hypothèse ":"conclusion ")+op,ens:{type:"fo",deux,interdit}};}
/* une équation polynomiale : la parité du membre de gauche quand x est pair, puis impair */
function polyParite(R,veut){for(;;){const deg=R.mel([5,4,3,2]).slice(0,R.ent(2,3)).sort((a,b)=>b-a).concat(R()<0.6?[1]:[]),c=deg.map(()=>R.nz(-12,12)),c0=R.nz(-9,9),pair=((c0%2)+2)%2,imp=((c.reduce((s,a)=>s+a,0)+c0)%2+2)%2;
  if(veut!==undefined&&(pair===1&&imp===1)!==veut)continue;const T=[];deg.forEach((d,j)=>T.push([c[j],d]));T.push([c0,0]);
  const txt=T.map(([a,d],j)=>{const m=d===0?String(Math.abs(a)):cf(Math.abs(a),d===1?"x":"x"+EXPO[d]);return j?` ${a>0?"+":"−"} ${m}`:(a<0?"−":"")+m;}).join("");return {T,txt,pair,imp};}}
const PAR=b=>b?"impair":"pair";
function terme(a,d){return d===0?String(Math.abs(a)):cf(Math.abs(a),d===1?"x":"x"+EXPO[d]);}
const PARf=b=>b?"impaire":"paire";
function casTxt(P){const lp=P.T.filter(t=>t[1]>0).map(t=>terme(t[0],t[1])),c=Math.abs(P.T[P.T.length-1][0]),li=P.T.map(t=>`${terme(t[0],t[1])} est ${PAR(Math.abs(t[0])%2)}`),n=P.T.filter(t=>Math.abs(t[0])%2).length;
  return [`${et(lp)} ${lp.length>1?"sont pairs":"est pair"} : un multiple d'un nombre pair est pair. Il reste la constante ${c}, qui est ${PARf(P.pair)} : le membre de gauche est ${PAR(P.pair)}.`,
    `Une puissance d'un nombre impair est impaire, donc chaque terme a la parité de son coefficient (le signe ne compte pas) : ${li.join(", ")}. ${n===0?"Aucun terme impair":n===1?"Un seul terme impair":n+" termes impairs"} : la somme est ${PARf(P.imp)}.`];}
function parCas(R){const P=polyParite(R,R()<0.6),ok=P.pair===1&&P.imp===1,eqn=`${P.txt} = 0`;
  const [wp,wi]=casTxt(P);
  const E=[{w:`Si x est pair : le membre de gauche est <b>${PAR(P.pair)}</b>.`,why:wp,pts:1},
    {w:`Si x est impair : le membre de gauche est <b>${PAR(P.imp)}</b>.`,why:wi,pts:1},
    {w:`<b>${ok?"La parité prouve qu'il n'y a pas de solution entière.":"La parité ne permet pas de conclure."}</b>`,why:ok?"Dans les deux cas, le membre de gauche est impair, donc il ne vaut jamais 0, qui est pair. C'est un raisonnement par l'absurde et par disjonction de cas, comme au CC2 2025-2026.":`Dans le cas où le membre de gauche est pair, il pourrait valoir 0 : on ne peut rien dire.`,pts:1}];
  const ids=["p","i","c"],bon={p:PAR(P.pair),i:PAR(P.imp),c:ok?"non":"?"};
  function juge(rep){if(ids.some(x=>!rep[x]))return {incomplet:"Réponds aux trois questions."};const F=ids.filter(x=>rep[x]!==bon[x]);if(!F.length)return {ok:true};const k=ids.indexOf(F[0]);
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"plusieurs réponses sont à revoir":"une réponse est à revoir"}.`,diag:{etape:k,type:["parité quand x est pair","parité quand x est impair","conclusion d'une disjonction de cas"][k],titre:`Où ça part : ${["le cas x pair","le cas x impair","la conclusion"][k]}.`,msg:E[k].why}};}
  const PI=[["pair","pair"],["impair","impair"]];
  return {sig:"PC"+P.txt,q:`On se demande si l'équation ${fx(eqn)} peut avoir une solution entière x. Raisonne sur la parité de x.`,corps:`<p class="muted">Rappel : pair × entier = pair ; impair × impair = impair ; une somme est impaire quand elle a un nombre impair de termes impairs.</p>`,texte:`parité de ${eqn}`,
    champs:[{k:"choix",id:"p",titre:"Si x est pair, le membre de gauche est :",o:PI},{k:"choix",id:"i",titre:"Si x est impair, le membre de gauche est :",o:PI},{k:"choix",id:"c",titre:"Donc :",o:[["non","la parité prouve qu'il n'y a pas de solution entière"],["?","la parité ne permet pas de conclure"]]}],juge,etapes:E,
    bonne:`x pair : ${bon.p} ; x impair : ${bon.i} ; ${ok?"pas de solution entière":"on ne peut pas conclure"}`,bonneTxt:`${bon.p}, ${bon.i}, ${ok?"pas de solution":"pas de conclusion"}`,repBonne:bon,repFausse:{p:bon.p==="pair"?"impair":"pair",i:bon.i,c:bon.c},nature:ok?"conclut":"ne conclut pas",ens:{type:"pc",T:P.T}};}
const polK=(c,v)=>polX(c).replace(/x/g,v);
function redactionContra(R){const t=R.ent(0,2);
  if(t===0){const b=2*R.ent(0,3),c=R.ent(-5,5),pn=R.ent(0,1),p=1-pn,E=[c,b,1],Et=polK(E,"n"),r=((p+b*p+c)%2+2)%2,ph=1-r;
    const k2=[p*p+b*p+c,4*p+2*b,4],m=(k2[0]-r)/2,Q2=[m,2*p+b,2],nE=p?"2k + 1":"2k",sub=Et.replace(/n/g,`(${nE})`);
    const S=`Pour tout n ∈ ℤ, si ${Et} est ${PAR(ph)}, alors n est ${PAR(pn)}.`;
    return papierQ("CP"+S,`Démontre par contraposée : « ${h(S)} »`,`<p>Rédige sur ta feuille : la contraposée, puis sa preuve, puis la conclusion.</p>`,[
      [`Contraposée : pour tout n ∈ ℤ, si n est ${PAR(p)}, alors ${fx(Et)} est ${PAR(r)}.`,"On échange les deux côtés et on les nie : « pair » devient « impair », et inversement.",1],
      [`Soit n ∈ ℤ ${PAR(p)} : il existe k ∈ ℤ tel que ${fx(`n = ${nE}`)}.`,`C'est la définition d'un entier ${PAR(p)}.`,1],
      [`${fx(`${Et} = ${sub} = ${polK(k2,"k")}`)}`,"On remplace n et on développe.",1],
      [`${fx(`= 2(${polK(Q2,"k")})${r?" + 1":""}`)}, et ${fx(polK(Q2,"k"))} est un entier : ${fx(Et)} est ${PAR(r)}.`,"On met 2 en facteur pour faire apparaître la parité.",1.5],
      ["La contraposée est vraie, donc l'énoncé de départ est vrai aussi.","Une implication et sa contraposée ont la même valeur de vérité : la phrase de conclusion est attendue.",0.5]],{type:"cp",b,c,p,r,ph,pn},"parité");}
  if(t===1){const d=R.choix([3,5,7]),a=R.choix([1,2,4].filter(x=>x%d)),b=R()<0.4?0:R.ent(1,5),Et=poly(a,b,0),S=`Pour tout n ∈ ℕ, si ${Et} n'est pas un multiple de ${d}, alors n n'est pas un multiple de ${d}.`,Q2=poly(a*d,b,0).replace(/n/g,"k");
    return papierQ("CM"+S,`Démontre par contraposée : « ${h(S)} »`,`<p>Rédige sur ta feuille : la contraposée, puis sa preuve, puis la conclusion.</p>`,[
      [`Contraposée : pour tout n ∈ ℕ, si n est un multiple de ${d}, alors ${fx(Et)} est un multiple de ${d}.`,"On échange les deux côtés et on les nie : « n'est pas un multiple » devient « est un multiple ».",1],
      [`Soit n ∈ ℕ un multiple de ${d} : il existe k ∈ ℕ tel que ${fx(`n = ${d}k`)}.`,`C'est la définition d'un multiple de ${d}.`,1],
      [`${fx(`${Et} = ${Et.replace(/n/g,`(${d}k)`)} = ${d}(${Q2})`)}`,`On remplace n par ${d}k et on met ${d} en facteur.`,1.5],
      [`${fx(Q2)} est un entier, donc ${fx(Et)} est un multiple de ${d}.`,"Il faut dire que le facteur est un entier.",1],
      ["La contraposée est vraie, donc l'énoncé de départ est vrai aussi.","Une implication et sa contraposée ont la même valeur de vérité.",0.5]],{type:"cm",a,b,d},"multiples");}
  const P=polyParite(R,true),eqn=`${P.txt} = 0`,[wp,wi]=casTxt(P);
  return papierQ("CA"+P.txt,`Démontre que l'équation ${fx(eqn)} n'admet pas de solution entière.`,`<p>Indication, comme au CC2 2025-2026 : raisonne par l'absurde, sur la parité d'une telle solution.</p>`,[
    [`Supposons qu'un entier x vérifie ${fx(eqn)}.`,"Par l'absurde : on suppose le contraire de ce qu'on veut montrer.",1],
    [`Si x est pair : ${wp}`,"On sépare en deux cas qui couvrent tous les entiers : c'est la disjonction de cas.",1.5],
    [`Si x est impair : ${wi.charAt(0).toLowerCase()+wi.slice(1)}`,"Impair × impair = impair ; une somme est impaire quand elle a un nombre impair de termes impairs.",1.5],
    ["Dans les deux cas, le membre de gauche est impair, donc il ne vaut pas 0 : contradiction. L'équation n'a pas de solution entière.","0 est pair : un nombre impair ne peut pas lui être égal.",1]],{type:"ca",T:P.T},"absurde");}

/* rédaction sur papier : « justifier soigneusement », comme au CC du 15/11/2024 (ex. 2 b) et au CC2 2025-2026 (ex. 3 c) */
function redactionInj(R){const NN={t:"ℕ",in:x=>Number.isInteger(x)&&x>=0,ent:true},ZZ={t:"ℤ",in:x=>Number.isInteger(x),ent:true},
    consigne=`<p>Rédige sur ta feuille comme au contrôle. Pour chaque « oui » : une preuve qui marche pour tous les éléments. Pour chaque « non » : un contre-exemple avec des nombres.</p>`,
    wInj="Pour prouver « injective » : on part de deux éléments qui ont la même image, et on montre qu'ils sont égaux.",wSurj="Pour prouver « surjective » : on prend un y quelconque de l'ensemble d'arrivée, et on lui donne un antécédent.",wBij="Bijective veut dire injective et surjective à la fois : ici il en manque une.";
  if(R()<0.5){const m=R.ent(3,5),D=R()<0.5?NN:ZZ,T=D.t,
      f={nom:"f",D,A:D,f:n=>m*n,inj:true,surj:false,sans:1},g={nom:"g",D,A:D,f:n=>n%m===0?n/m:0,inj:false,surj:true,meme:[1,2]};
    return papierQ("RI"+m+T,`Soit f l'application ${fx(`f : ${T} → ${T}, n ↦ ${m}n`)}, et g l'application ${fx(`g : ${T} → ${T}`)} qui envoie n sur ${fx(`n/${m}`)} si n est un multiple de ${m}, et sur 0 sinon. Les applications f et g sont-elles injectives ? surjectives ? bijectives ? <b>Justifie soigneusement.</b>`,
      consigne+`<p class="muted">Comme au CC du 15 novembre 2024 (exercice 2, deuxième question) et au CC2 2025-2026 (exercice 3, dernière question), avec d'autres nombres.</p>`,[
      [`f est injective : soient n₁ et n₂ dans ${T} tels que ${fx("f(n₁) = f(n₂)")}. Alors ${fx(`${m}n₁ = ${m}n₂`)}, donc ${fx("n₁ = n₂")}.`,wInj,1.5],
      [`f n'est pas surjective : 1 n'a pas d'antécédent par f.`,`Il faudrait un n de ${T} tel que ${fx(`${m}n = 1`)}, c'est-à-dire ${fx(`n = 1/${m}`)}, qui n'est pas un entier. Un seul élément sans antécédent suffit.`,1],
      [`Conclusion : f est injective, non surjective, donc non bijective.`,wBij,0.5],
      [`g n'est pas injective : ${fx("g(1) = 0")} et ${fx("g(2) = 0")}, alors que 1 ≠ 2.`,`1 et 2 ne sont pas des multiples de ${m} : leur image est 0. Deux éléments différents de même image suffisent.`,1],
      [`g est surjective : soit y ∈ ${T}. Posons ${fx(`n = ${m}y`)}. C'est un élément de ${T} et un multiple de ${m}, donc ${fx(`g(n) = ${m}y/${m} = y`)}.`,wSurj,1.5],
      [`Conclusion : g est surjective, non injective, donc non bijective.`,wBij,0.5]],{type:"redac",apps:[f,g]},"deux applications sur ℕ ou ℤ");}
  let a,b;do{a=R.ent(2,5);b=R.nz(-6,6);}while(a===2&&b===1);
  const K=R()<0.5?{t:"ℝ",mot:"un réel"}:{t:"ℚ",mot:"un rationnel"},RR={t:K.t,in:x=>Number.isFinite(x)},axb=v=>plusC(`${a}${v}`,b),inv=`(${plusC("y",-b)})/${a}`,
    f={nom:"f",D:ZZ,A:ZZ,f:n=>a*n+b,inj:true,surj:false,sans:b+1},g={nom:"g",D:RR,A:RR,f:x=>a*x+b,inj:true,surj:true,inv:[inv,`(y-(${b}))/${a}`]};
  return papierQ("RJ"+[a,b]+K.t,`Soit f l'application ${fx(`f : ℤ → ℤ, n ↦ ${axb("n")}`)}, et g l'application ${fx(`g : ${K.t} → ${K.t}, x ↦ ${axb("x")}`)}. Sont-elles injectives ? surjectives ? bijectives ? <b>Justifie soigneusement.</b> Si l'une est bijective, donne sa réciproque.`,
    consigne+`<p class="muted">Comme au TD 3 (exercice 7) et aux CC de novembre 2024 et 2025 : la même formule, avec deux ensembles différents.</p>`,[
    [`f est injective : soient n₁ et n₂ dans ℤ tels que ${fx("f(n₁) = f(n₂)")}. Alors ${fx(`${axb("n₁")} = ${axb("n₂")}`)}, donc ${fx(`${a}n₁ = ${a}n₂`)}, donc ${fx("n₁ = n₂")}.`,wInj,1.5],
    [`f n'est pas surjective : ${nb(b+1)} n'a pas d'antécédent par f.`,`Il faudrait un entier n tel que ${fx(`${axb("n")} = ${nb(b+1)}`)}, c'est-à-dire ${fx(`${a}n = 1`)}, donc ${fx(`n = 1/${a}`)}, qui n'est pas un entier. Un seul élément sans antécédent suffit.`,1],
    [`Conclusion : f est injective, non surjective, donc non bijective.`,wBij,0.5],
    [`g est injective : soient x₁ et x₂ dans ${K.t} tels que ${fx("g(x₁) = g(x₂)")}. Alors ${fx(`${axb("x₁")} = ${axb("x₂")}`)}, donc ${fx("x₁ = x₂")}.`,"C'est le même calcul que pour f : il ne dépend pas de l'ensemble.",1],
    [`g est surjective : soit y ∈ ${K.t}. Posons ${fx(`x = ${inv}`)}, qui est ${K.mot}. Alors ${fx(`g(x) = ${a} × ${inv} ${b>0?"+":"−"} ${Math.abs(b)} = y`)}.`,`${wSurj} On trouve x en résolvant ${fx(`${axb("x")} = y`)}. Cette fois x est dans l'ensemble de départ : ${K.t} contient ce quotient, alors que ℤ ne le contient pas toujours. C'est l'ensemble qui fait la différence avec f.`,1.5],
    [`Conclusion : g est bijective, et sa réciproque est ${fx(`g⁻¹ : ${K.t} → ${K.t}, y ↦ ${inv}`)}.`,"L'antécédent trouvé à l'étape précédente donne la réciproque.",0.5]],{type:"redac",apps:[f,g]},"la même formule sur deux ensembles");}
/* rédaction sur papier : une inclusion ou une égalité avec f et f⁻¹ (TD 3, ex. 8, 15, 17 ; CC2 2022 ex. 2 ; CC2 2023 ex. 5) */
function redactionIncl(R){const s=fx,dep="Pour montrer une inclusion, on prend un élément quelconque de l'ensemble de gauche.",fin="La phrase de conclusion reprend ce qu'il fallait montrer.",eq="On raisonne par équivalences sur un élément x de E : chaque ⇔ est une définition dépliée.",imd="C'est la définition de l'image directe.",hyp="On suppose l'hypothèse, puis on prend un élément quelconque de l'ensemble de gauche.";
  const o=R.choix([
   {id:"aller",en:`Montre que, pour toute partie A de E : ${s("A ⊂ f⁻¹(f(A))")}.`,src:"TD 3, exercice 17, première question ; c'est aussi le début de la dernière question du CC2 2023-2024.",L:[
     [`Soit A une partie de E. Soit x ∈ A.`,dep,1],
     [`Alors ${s("f(x) ∈ f(A)")}.`,"C'est la définition de l'image directe : f(A) contient les images des éléments de A.",1],
     [`Or ${s("x ∈ f⁻¹(f(A))")} veut dire ${s("f(x) ∈ f(A)")}. Donc ${s("x ∈ f⁻¹(f(A))")}.`,"C'est la définition de l'image réciproque, appliquée à la partie f(A).",1.5],
     [`Donc ${s("A ⊂ f⁻¹(f(A))")}.`,fin,0.5]]},
   {id:"inj",en:`On suppose que f est injective. Montre que, pour toute partie A de E : ${s("f⁻¹(f(A)) ⊂ A")}.`,src:"CC2 2023-2024, exercice 5, dernière question.",L:[
     [`Soit A une partie de E. Soit ${s("x ∈ f⁻¹(f(A))")}.`,dep,1],
     [`Alors ${s("f(x) ∈ f(A)")} : il existe a ∈ A tel que ${s("f(x) = f(a)")}.`,"On déplie d'abord l'image réciproque, puis l'image directe.",1.5],
     [`Comme f est injective, x = a. Donc x ∈ A.`,"C'est ici que l'hypothèse sert : sans elle, x pourrait être un autre antécédent de f(a).",1],
     [`Donc ${s("f⁻¹(f(A)) ⊂ A")}.`,fin,0.5]]},
   {id:"surj",en:`On suppose que f est surjective. Montre que, pour toute partie B de F : ${s("B ⊂ f(f⁻¹(B))")}.`,src:"TD 3, exercice 17, dernière question.",L:[
     [`Soit B une partie de F. Soit y ∈ B.`,dep,1],
     [`Comme f est surjective, il existe x ∈ E tel que ${s("f(x) = y")}.`,"C'est ici que l'hypothèse sert : sans elle, y pourrait n'avoir aucun antécédent.",1],
     [`${s("f(x) = y ∈ B")}, donc ${s("x ∈ f⁻¹(B)")}. Et ${s("y = f(x)")} : donc ${s("y ∈ f(f⁻¹(B))")}.`,"x est dans l'image réciproque de B, donc son image y est dans l'image directe de cette partie.",1.5],
     [`Donc ${s("B ⊂ f(f⁻¹(B))")}.`,fin,0.5]]},
   {id:"union",en:`Montre que, pour toutes parties A₁ et A₂ de E : ${s("f(A₁ ∪ A₂) ⊂ f(A₁) ∪ f(A₂)")}.`,src:"TD 3, exercice 15, première question : la première des deux inclusions.",L:[
     [`Soient A₁ et A₂ deux parties de E. Soit ${s("y ∈ f(A₁ ∪ A₂)")}.`,dep,1],
     [`Il existe ${s("x ∈ A₁ ∪ A₂")} tel que ${s("y = f(x)")}.`,imd,1],
     [`Si x ∈ A₁, alors ${s("y = f(x) ∈ f(A₁)")}. Si x ∈ A₂, alors ${s("y = f(x) ∈ f(A₂)")}.`,"x est dans une réunion : on traite les deux cas.",1.5],
     [`Dans les deux cas, ${s("y ∈ f(A₁) ∪ f(A₂)")}. Donc ${s("f(A₁ ∪ A₂) ⊂ f(A₁) ∪ f(A₂)")}.`,fin,0.5]]},
   {id:"recU",en:`Montre que, pour toutes parties B₁ et B₂ de F : ${s("f⁻¹(B₁ ∪ B₂) = f⁻¹(B₁) ∪ f⁻¹(B₂)")}.`,src:"TD 3, exercice 8, seconde question.",L:[
     [`Soient B₁ et B₂ deux parties de F. Soit x ∈ E.`,eq,1],
     [`${s("x ∈ f⁻¹(B₁ ∪ B₂)")} ⇔ ${s("f(x) ∈ B₁ ∪ B₂")} ⇔ (${s("f(x) ∈ B₁")} ou ${s("f(x) ∈ B₂")})`,"La définition de l'image réciproque, puis celle de la réunion.",1.5],
     [`⇔ (${s("x ∈ f⁻¹(B₁)")} ou ${s("x ∈ f⁻¹(B₂)")}) ⇔ ${s("x ∈ f⁻¹(B₁) ∪ f⁻¹(B₂)")}.`,"Les mêmes définitions, lues dans l'autre sens.",1],
     [`Les deux ensembles ont les mêmes éléments : ${s("f⁻¹(B₁ ∪ B₂) = f⁻¹(B₁) ∪ f⁻¹(B₂)")}.`,fin,0.5]]},
   {id:"recI",en:`Montre que, pour toutes parties B₁ et B₂ de F : ${s("f⁻¹(B₁ ∩ B₂) = f⁻¹(B₁) ∩ f⁻¹(B₂)")}.`,src:"TD 3, exercice 15, seconde question.",L:[
     [`Soient B₁ et B₂ deux parties de F. Soit x ∈ E.`,eq,1],
     [`${s("x ∈ f⁻¹(B₁ ∩ B₂)")} ⇔ ${s("f(x) ∈ B₁ ∩ B₂")} ⇔ (${s("f(x) ∈ B₁")} et ${s("f(x) ∈ B₂")})`,"La définition de l'image réciproque, puis celle de l'intersection.",1.5],
     [`⇔ (${s("x ∈ f⁻¹(B₁)")} et ${s("x ∈ f⁻¹(B₂)")}) ⇔ ${s("x ∈ f⁻¹(B₁) ∩ f⁻¹(B₂)")}.`,"Les mêmes définitions, lues dans l'autre sens.",1],
     [`Les deux ensembles ont les mêmes éléments : ${s("f⁻¹(B₁ ∩ B₂) = f⁻¹(B₁) ∩ f⁻¹(B₂)")}.`,fin,0.5]]},
   {id:"compl",en:`Soit A une partie de F. Démontre soigneusement que ${s("f⁻¹(∁_{F} A) = ∁_{E} (f⁻¹(A))")}. Rappel : ${s("∁_{F} A")} désigne le complémentaire de A dans F.`,src:"CC2 2022-2023, exercice 2 (4 points).",L:[
     [`Soit x ∈ E.`,eq,1],
     [`${s("x ∈ f⁻¹(∁_{F} A)")} ⇔ ${s("f(x) ∈ ∁_{F} A")} ⇔ ${s("f(x) ∉ A")}`,"La définition de l'image réciproque, puis celle du complémentaire dans F.",1.5],
     [`⇔ ${s("x ∉ f⁻¹(A)")} ⇔ ${s("x ∈ ∁_{E} (f⁻¹(A))")}.`,"x n'est pas dans f⁻¹(A) quand son image n'est pas dans A ; puis la définition du complémentaire dans E.",1],
     [`Donc ${s("f⁻¹(∁_{F} A) = ∁_{E} (f⁻¹(A))")}.`,fin,0.5]]},
   {id:"croA",en:`Soient A₁ et A₂ deux parties de E. Montre que si ${s("A₁ ⊂ A₂")}, alors ${s("f(A₁) ⊂ f(A₂)")}.`,src:"Une inclusion du même modèle que celles du TD 3 (exercices 8, 15 et 17).",L:[
     [`Supposons ${s("A₁ ⊂ A₂")}. Soit ${s("y ∈ f(A₁)")}.`,hyp,1],
     [`Il existe x ∈ A₁ tel que ${s("y = f(x)")}.`,imd,1],
     [`Comme ${s("A₁ ⊂ A₂")}, x ∈ A₂. Donc ${s("y = f(x) ∈ f(A₂)")}.`,"y est l'image d'un élément de A₂.",1.5],
     [`Donc ${s("f(A₁) ⊂ f(A₂)")}.`,fin,0.5]]},
   {id:"croB",en:`Soient B₁ et B₂ deux parties de F. Montre que si ${s("B₁ ⊂ B₂")}, alors ${s("f⁻¹(B₁) ⊂ f⁻¹(B₂)")}.`,src:"Une inclusion du même modèle que celles du TD 3 (exercices 8, 15 et 17).",L:[
     [`Supposons ${s("B₁ ⊂ B₂")}. Soit ${s("x ∈ f⁻¹(B₁)")}.`,hyp,1],
     [`Alors ${s("f(x) ∈ B₁")}.`,"C'est la définition de l'image réciproque.",1],
     [`Comme ${s("B₁ ⊂ B₂")}, ${s("f(x) ∈ B₂")}. Donc ${s("x ∈ f⁻¹(B₂)")}.`,"On replie la définition, avec B₂ cette fois.",1.5],
     [`Donc ${s("f⁻¹(B₁) ⊂ f⁻¹(B₂)")}.`,fin,0.5]]}]);
  return papierQ("RN"+o.id,`Soit ${s("f : E → F")} une application. ${o.en}`,`<p>Rédige sur ta feuille comme au contrôle : « Soit… », les définitions dépliées une par une, puis la conclusion.</p><p class="muted">${o.src}</p>`,o.L,{type:"redac",id:o.id},o.id);}

G.rai={IMPL,DEDUIRE,appliFormule,ecritAppli,notes,plusC,dec,classe,DEFINJ,lisFini,ensF,tapeF,memeF,tri,OPF,ensR,tapeR,interP,complP,diffP,ptR,partiesReelles,ensemblesFinis,fx,h,et,ent};
G.add("rai",[
 {id:"RA3",t:"Ensembles : réunion, intersection, différence, ∈ et ⊂",tache:"opérations sur les ensembles",th:"ensembles",pts:3,lecons:["r-ensembles","r-operations"],
  paliers:[
   {t:"réunion et intersection",cc:2,gen:unionInter},
   {t:"différence, différence symétrique, complémentaire",cc:3,gen:differences},
   {t:"nombres d'éléments : produit, parties",cc:3,gen:cardinaux},
   {t:"avec des intervalles de ℝ",cc:4,gen:intervallesOps},
   {t:"appartenir ou être inclus",cc:3,gen:appartientInclus}]},
 {id:"RA2",t:"Image directe, image réciproque",th:"image",pts:3.5,lecons:["r-image"],
  paliers:[
   {t:"une application entre deux ensembles finis",cc:3,gen:imagesFinies},
   {t:"une fonction affine et des intervalles",cc:4,gen:imagesAffines},
   {t:"x ↦ x² ou |x| : parfois deux morceaux",cc:5,gen:imagesCarre},
   {t:"aller et retour : f⁻¹(f(A)) et f(f⁻¹(B))",cc:6,gen:allerRetour,min:150},
   {t:"rédaction sur papier : démontrer une inclusion avec f et f⁻¹",cc:4,gen:redactionIncl,min:9}]},
 {id:"RA1",t:"Injective, surjective, bijective",th:"injective",pts:4,lecons:["r-injective"],apres:["RA2"],
  paliers:[
   {t:"une application entre deux ensembles finis",cc:2,gen:fleches,min:120},
   {t:"une formule sur ℝ : l'ensemble de départ et l'ensemble d'arrivée comptent",cc:3,gen:R=>formule(R,"reels"),min:60},
   {t:"sur ℕ ou sur ℤ",cc:3,gen:R=>formule(R,"entiers"),min:20},
   {t:"donner un contre-exemple",cc:3,gen:contreExemple,min:60},
   {t:"la bijection réciproque",cc:4,gen:reciproque,min:30},
   {t:"rédaction sur papier : justifier soigneusement",cc:6,gen:redactionInj,min:40}]},
 {id:"RA4",t:"Quantificateurs : nier, traduire, dire si c'est vrai",tache:"quantificateurs",th:"quantif",pts:2.5,lecons:["r-quantif","r-preuves"],
  paliers:[
   {t:"nier une phrase à un ou deux quantificateurs",cc:2,gen:R=>negation(phraseR(R,1)),min:40},
   {t:"vrai ou faux, sur deux petits ensembles",cc:4,gen:vraiFauxFini},
   {t:"traduire une phrase en français",cc:3,gen:R=>traduction(aTraduire(R)),min:15},
   {t:"nier avec ⇒, « et », « ou », ou une double inégalité",cc:3,gen:R=>negation(phraseR(R,2)),min:20},
   {t:"vrai ou faux sur ℕ, ℤ ou ℝ : l'ordre des quantificateurs",cc:4,gen:vraiFauxInfini,min:60}]},
 {id:"RA5",t:"La récurrence",th:"recurrence",pts:2.5,lecons:["r-recurrence"],
  paliers:[
   {t:"une démonstration à compléter (somme)",cc:4,gen:recCompleter,min:25},
   {t:"divisibilité : faire apparaître le rang n",cc:5,gen:recDivisible,min:20},
   {t:"inégalité : à partir de quel rang ?",cc:4,gen:recRang,min:15},
   {t:"rédaction complète, sur papier",cc:10,gen:recRedaction,min:30}]},
 {id:"RA6",t:"Composer deux applications",tache:"composition",th:"composition",pts:2,lecons:["r-composition"],apres:["RA1"],
  paliers:[
   {t:"calculer (g ∘ f)(a) et (f ∘ g)(a)",cc:2,gen:composeNombre},
   {t:"les formules de g ∘ f et de f ∘ g",cc:4,gen:composeFormule},
   {t:"avec deux tableaux de valeurs : injective, surjective",cc:4,gen:composeTable},
   {t:"la composée existe-t-elle ?",cc:2,gen:composeExiste,min:100},
   {t:"ce qu'on peut en déduire sur f et sur g",cc:4,gen:composeDeduire,min:100}]},
 {id:"RA8",t:"Tables de vérité et propositions équivalentes",tache:"tables de vérité",th:"logique",pts:1,lecons:["r-logique"],
  paliers:[
   {t:"un connecteur",cc:2,gen:tvUn,min:12},
   {t:"une formule de P et Q, colonne par colonne",cc:3,gen:tvDeux},
   {t:"trois propositions P, Q, R",cc:4,gen:tvTrois,min:100},
   {t:"une seule valeur connue : peut-on conclure ?",cc:2,gen:tvConnue,min:100},
   {t:"comme au QCM : lesquelles sont équivalentes ?",cc:3,gen:tvQcm}]},
 {id:"RA7",t:"Contraposée, réciproque, négation, absurde",tache:"contraposée et absurde",th:"raisonnements",pts:1.5,lecons:["r-contraposee"],apres:["RA8"],
  paliers:[
   {t:"reconnaître contraposée, réciproque, négation",cc:3,gen:reconnaitre},
   {t:"écrire la contraposée ou la négation d'une phrase",cc:2,gen:assembler,min:20},
   {t:"avec P, Q, R : contraposée et négation",cc:4,gen:formulesContra,min:100},
   {t:"disjonction de cas : la parité d'une équation",cc:3,gen:parCas},
   {t:"rédaction sur papier : contraposée ou absurde",cc:8,gen:redactionContra,min:150}]}
]);
})();
