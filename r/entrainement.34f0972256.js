/* Entraînement : exercices tirés au hasard par méthode, paliers, entretien espacé, mode papier, rapport.
   Les générateurs sont dans generateurs.js et gen-<matière>.js. Ici : l'état, recalculé à partir du journal
   (événements « tr », donc synchronisé comme le reste), et les écrans. Choix de l'utilisateur du 17/11/2026. */
(function(){
"use strict";
const GEN=window.GEN,EXT=window.EXT,SUBJ=window.SUBJ;if(!GEN||!EXT)return;
let A=null;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tx=h=>window.W.tx(h);
const ECARTS=[2,3,7,18,30],MAXJOUR=15,LENT=2;
const virg=x=>String(Math.round(x*100)/100).replace(".",",");
const plur=(n,s,p)=>n>1?(p||s+"s"):s;
const duree=ms=>{const s=Math.max(1,Math.round(ms/1000)),m=Math.floor(s/60);return m?`${m} min ${String(s%60).padStart(2,"0")}`:`${s} s`;};
const horloge=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");};
const theme=d=>(SUBJ[d.sid].themes||[]).find(T=>T.id===d.th)||null;
const estCC=S=>/^CC/.test(A.exam(S).label||"CC"),auCC=S=>estCC(S)?"au CC":"à l'examen",duCC=S=>estCC(S)?"du CC":"de l'examen";
const points=d=>{const T=theme(d),p=T?T.pts:d.pts;return p?`environ ${virg(p)} ${p>=2?"points":"point"} ${auCC(SUBJ[d.sid])}`:"";};
const dernier=d=>d.paliers.length-1,seuil=d=>d.seuil||3;
const defs=sid=>(GEN.defs[sid]||[]).filter(d=>SUBJ[sid]&&A.inScope(SUBJ[sid],d));
const matieres=()=>A.SIDS.filter(sid=>defs(sid).length).sort((a,b)=>A.examStart(SUBJ[a])-A.examStart(SUBJ[b]));

/* ---------- l'état d'une méthode, rejoué depuis le journal ---------- */
const neuf=()=>({n:0,nok:0,lv:0,ok:0,ko:0,val:null,np:0,du:null,eo:0,ek:0,pap:0,trav:false,vu:{},jour:{},passe:null,ms:0,rt:0});
let CACHE={n:-1,der:"",E:{}};
function etats(){const J=A.journal(),der=J.length?J[J.length-1].i:"";if(CACHE.n===J.length&&CACHE.der===der)return CACHE.E;
  const E={};J.forEach(e=>pas(E,e));
  CACHE={n:J.length,der,E};return E;}
function pas(E,e){if(e.k!=="tr")return;const d=GEN.par[e.g];if(!d)return;
    const g=E[e.g]||(E[e.g]=neuf()),day=A.ymd(new Date(e.t)),last=dernier(d),jr=g.jour[day]||(g.jour[day]={n:0,e:0});
    g.n++;g.vu[e.sg]=1;jr.n++;g.fx=e.r===0&&e.na?{lv:e.lv,m:e.m,na:e.na}:null;if(e.r===1){g.nok++;g.ms+=e.ms||0;g.rt+=(e.ms||0)/(ccMin(d,Math.min(last,e.lv||0))*60e3);}
    if(e.r===1&&!(e.m==="xb"&&g.xk===day))g.xk=null;
    if(e.m==="pl"){g.ko=0;g.pap=0;if(e.r===1){g.lv=last;g.ok=1;}else{g.lv=Math.min(last,Math.max(0,e.to||0));g.ok=0;}}
    else if(e.m==="xb"){/* examen blanc : il place une méthode jamais commencée ; raté sur une méthode réussie, c'est un passage raté, à refaire dès le lendemain */
      if(g.n===1){g.ko=0;g.pap=0;if(e.r===1){g.lv=last;g.ok=1;}else{g.lv=Math.min(last,Math.max(0,e.to||0));g.ok=0;}}
      else if(e.r===0&&g.val){g.ek++;const dm=A.addDays(day,1);
        if(g.ek>=2){g.val=null;g.du=null;g.trav=true;g.lv=Math.max(0,last-1);g.ok=g.ko=g.pap=0;g.eo=g.ek=0;}else if(!g.du||g.du>dm)g.du=dm;}
      if(e.r===0&&!g.val)g.xk=day;}
    else if(e.m==="p"){
      if(e.r===2||(e.r===1&&e.lent&&g.lv===last))return;/* aidé, ou juste mais trop lent au dernier palier : ni juste ni faux */
      if(e.r===1){g.ok++;g.ko=0;if(e.pap)g.pap=1;
        if(g.lv<last){if(g.ok>=seuil(d)){g.lv++;g.ok=0;g.pap=0;}}
        else if(g.ok>=seuil(d)&&(g.pap||d.sansPapier)){g.val=day;g.np=0;g.du=A.addDays(day,ECARTS[0]);g.passe=day;g.ok=0;g.pap=0;g.trav=false;g.eo=g.ek=0;}}
      else{g.ko++;g.ok=0;g.pap=0;if(g.ko>=2){g.lv=Math.max(0,g.lv-1);g.ko=0;}}}
    else if(e.m==="e"&&g.val){jr.e+=e.ms||0;
      if(e.r===1)g.eo++;else if(e.r===0)g.ek++;
      if(g.eo>=1){if(!g.ek)g.np++;g.du=A.addDays(day,ECARTS[Math.min(g.np,ECARTS.length-1)]);g.passe=day;g.eo=g.ek=0;}
      else if(g.ek>=2){g.val=null;g.du=null;g.trav=true;g.lv=Math.max(0,last-1);g.ok=g.ko=g.pap=0;g.eo=g.ek=0;}}}
const etat=id=>etats()[id]||neuf();
/* le prochain passage : jamais après l'épreuve, et la veille s'il tombait le jour même ou plus tard */
function echeance(d,g){if(!g.val||!g.du)return null;const S=SUBJ[d.sid],ex=A.exam(S);let du=g.du;
  if(A.examStart(S)>A.NOW()&&du>=ex.day){const v=A.addDays(ex.day,-1);if(v>(g.passe||g.val))du=v;}
  return du;}
const quand=day=>{const t0=A.today();return day<=t0?"aujourd'hui":day===A.addDays(t0,1)?"demain":A.dayName(day,false,true);};
/* est-ce le moment des exercices ? oui si les leçons du thème sont faites, si le thème est déjà à moitié su, ou si la méthode est commencée */
function leconsAFaire(d){const S=SUBJ[d.sid],T=theme(d);if(!T)return [];return (T.les||[]).map(l=>S.TB["L-"+l]).filter(t=>t&&A.inScope(S,t)&&!A.isDone(d.sid,t));}
function moment(d){if(etat(d.id).n)return true;const T=theme(d);if(!T)return true;const m=A.maitrise(d.sid,T);return !leconsAFaire(d).length||(m!=null&&m>=0.5);}
const ccMin=(d,lv)=>d.paliers[lv].cc||4;
/* son temps comparé au temps du CC, mesuré sur ses réponses justes (1,2 tant qu'on ne sait pas) */
const rythme=g=>g.nok>=3?Math.min(2.5,Math.max(0.5,g.rt/g.nok)):1.2;
function dureeTache(d){const g=etat(d.id);let m=0;for(let k=g.n?g.lv:Math.max(0,dernier(d)-1);k<=dernier(d);k++)m+=(seuil(d)-(k===g.lv?g.ok:0))*ccMin(d,k)*rythme(g);return Math.min(20,Math.max(6,Math.round(m)));}

/* ---------- l'entretien du jour : les passages dus, dans la limite de 15 minutes ---------- */
function entretien(tout){const t0=A.today(),n=A.NOW(),L=[];let fait=0;
  A.SIDS.forEach(sid=>defs(sid).forEach(d=>{const g=etat(d.id),j=g.jour[t0];if(j)fait+=j.e;const du=echeance(d,g);if(du&&du<=t0)L.push({d,g,du});}));
  const sc=x=>{const S=SUBJ[x.d.sid],T=theme(x.d);return A.weight(S)/(1+Math.max(0,(A.examStart(S)-n)/864e5))*((T&&T.pts)||1);};
  L.sort((a,b)=>sc(b)-sc(a));
  /* un seul rendez-vous (choix M11a) : après les passages dus, un exercice par thème dont la méthode est commencée sans être
     réussie, pour les épreuves à moins de 3 semaines. Ces thèmes n'ont plus de QCM au mini-contrôle mélangé. */
  const M=[];A.SIDS.forEach(sid=>{const j=(A.examStart(SUBJ[sid])-n)/864e5,vus={};if(j<=0)return;
    /* un exercice raté à un examen blanc (xk) revient ici jusqu'à sa première réponse juste, même une récitation, même loin de l'épreuve */
    defs(sid).forEach(d=>{const g=etat(d.id),jr=g.jour[t0],th=g.xk&&d.fixe?d.id:d.th;if(g.val||!g.n||(!g.xk&&(j>21||d.fixe))||vus[th])return;vus[th]=1;if(jr&&jr.n&&!(g.fx&&jr.n<2))return;M.push({d,g,du:t0,suite:true});});});
  M.sort((a,b)=>sc(b)-sc(a));M.forEach(x=>L.push(x));
  let reste=MAXJOUR-fait/60000;const out=[];
  L.forEach(x=>{x.min=ccMin(x.d,x.suite?x.g.lv:dernier(x.d))*rythme(x.g);if(tout||(!x.suite&&x.g.ek>0)||reste>=x.min||(!out.length&&!fait)){out.push(x);reste-=x.min;}});
  return out;}
const reportes=()=>entretien(true).length-entretien().length;
function jour(){const L=entretien();if(!L.length)return null;
  return {n:L.length,min:Math.max(2,Math.round(L.reduce((s,x)=>s+x.min,0))),noms:[...new Set(L.map(x=>SUBJ[x.d.sid].name))]};}

/* ---------- listes : onglet « S'entraîner », page d'une matière, tuile ---------- */
function ordre(sid){const L=defs(sid).map(d=>({d,g:etat(d.id),gain:theme(d)?A.gainTheme(sid,theme(d)):0}));
  L.sort((a,b)=>(!!a.g.val-!!b.g.val)||(b.gain-a.gain));
  /* « dans un ordre un peu logique » : une méthode ne passe pas devant celle dont elle a besoin */
  for(let k=0;k<L.length;k++){const besoin=(L[k].d.apres||[]).map(id=>L.findIndex(x=>x.d.id===id)).filter(j=>j>k&&!L[j].g.val);if(besoin.length){const j=Math.max(...besoin);L.splice(j+1,0,L.splice(k,1)[0]);k--;}}
  return L;}
function rangee(x){const d=x.d,g=x.g,N=d.paliers.length,pts=points(d),du=echeance(d,g),af=leconsAFaire(d);let meta,btn="S'entraîner",pri=true;
  const auj=!!du&&du<=A.today(),inclus=auj&&entretien().some(y=>y.d.id===d.id);
  if(g.val){meta=`<span class="pill ok">réussi</span> ${!du?"":inclus?"à refaire aujourd'hui":auj?`à refaire demain (${MAXJOUR} min d'entretien déjà faites aujourd'hui)`:"revient "+quand(du)}`;btn="Refaire";pri=inclus;}
  else if(!g.n){meta="Pas commencé";btn="Commencer";if(!moment(d)){meta=`Pas commencé · d'abord la leçon « ${af[0].t} »`;pri=false;}}
  else meta=`${g.trav?'<span class="pill rev">à retravailler</span> ':""}${d.fixe?"À refaire sur papier":`Palier ${g.lv+1} sur ${N}`}`;
  if(d.fixe&&!g.val&&!g.n)meta=meta.replace("Pas commencé","À écrire de mémoire, sur papier");
  return `<li class="task"><button class="tick" disabled title="Se coche toute seule quand la méthode est réussie" aria-label="Se coche toute seule"></button><div><div class="tt">${d.t}</div><div class="meta">${meta}${pts?" · "+pts:""}</div></div><a class="btn${pri?" pri":""} go" href="${inclus?"#/entrainer/jour":`#/entrainer/${d.sid}/${d.id}`}">${btn}</a></li>`;}
const liens=sid=>`<p class="gomore">${sid?`<a href="#/entrainer/examen/une/${sid}">Examen blanc de cette matière</a>`:""}<a href="#/entrainer/rapport">Mon rapport d'entraînement</a><a href="#/entrainer/erreurs">Mes erreurs</a></p>`;
function bloc(){const M=matieres();if(!M.length)return "";const J=jour();let h="";
  if(J)h+=`<section class="tiroir"><h2 class="tiroir__title">Entretien du jour</h2><ol class="todo"><li class="task"><button class="tick" disabled aria-label="Se coche toute seule"></button><div><div class="tt">${J.n} ${plur(J.n,"exercice")} ${plur(J.n,"mélangé")}</div><div class="meta">Environ ${J.min} min · ${J.noms.join(", ")}</div></div><a class="btn pri go" href="#/entrainer/jour">Commencer</a></li></ol></section>`;
  h+=xBloc();
  const n=A.NOW(),ouv=M.find(sid=>A.examStart(SUBJ[sid])>n)||M[0];
  M.forEach(sid=>{const S=SUBJ[sid],e=A.exam(S),L=ordre(sid),ep=e.report?(estCC(S)?"CC reporté":"examen reporté"):A.examStart(S)>n?`${estCC(S)?"CC":"examen"} ${quand(e.day)}`:"";
    h+=`<section class="tiroir s-${sid}"><details class="ex"${sid===ouv?" open":""}><summary><span><span class="h">${S.name}</span> <span class="muted">· ${L.length} ${plur(L.length,"méthode")}${ep?" · "+ep:""}</span></span></summary><ol class="todo">${L.map(rangee).join("")}</ol></details></section>`;});
  return h+liens()+`<section class="tiroir"><h2 class="tiroir__title">Sujets, TD et quiz</h2></section>`;}
function tuile(sid,sw,c){const L=defs(sid);if(!L.length)return "";const t0=A.today(),k=L.filter(d=>{const du=echeance(d,etat(d.id));return du&&du<=t0;}).length;
  return sw({href:"#/entrainer/"+sid,c,tile:String(L.length),kicker:"Refaire vite, sans erreur",name:"Entraînement",sub:`${L.length} ${plur(L.length,"méthode")}${k?` · ${k} à refaire aujourd'hui`:""}`});}
function pageMatiere(sid){const S=SUBJ[sid];$("#main").className="s-"+sid;
  $("#main").innerHTML=`<div class="page"><a class="back" href="#/${sid}">‹ ${S.name}</a><div class="title-row"><h1>Entraînement</h1></div><p class="lead">Des exercices tirés au hasard, jamais deux fois le même. Chaque méthode monte par paliers, du cas simple au niveau ${duCC(S)} : 3 justes de suite pour monter, 2 fausses de suite pour redescendre. Une méthode réussie revient ensuite dans l'entretien du jour.</p><ol class="todo">${ordre(sid).map(rangee).join("")}</ol>${liens(sid)}</div>`;}

/* ---------- l'écran d'un exercice ---------- */
let P=null,TIC=null;
const stop=()=>{clearInterval(TIC);TIC=null;};
function tirage(d,lv,g){const veut=g.fx&&g.fx.lv===lv?g.fx.na:null,graine=k=>parseInt(GEN.outils.hache(d.id+"|"+lv+"|"+g.n+"|"+k),36);let autre=null;
  for(let k=0;k<60;k++){const e=GEN.tire(d,lv,graine(k));if(g.vu[e.cle])continue;if(!veut||e.nature===veut)return e;if(!autre)autre=e;}
  return autre||GEN.tire(d,lv,graine(59));}
function palierDepart(d){const T=theme(d),m=T?A.maitrise(d.sid,T):null,N=d.paliers.length;return m==null||m<0.4?0:m<0.75?Math.floor((N-1)/2):Math.max(0,N-2);}
/* choisit l'exercice à montrer : placement, montée d'un palier, exercice en plus, ou passage d'entretien */
function prochain(){const S=P.sess;
  if(P.mode==="jour"){const L=entretien(S.tout);if(!L.length)return fin();
    let x=S.refaire&&L.find(y=>y.d.id===S.refaire);
    if(!x){const autres=L.filter(y=>y.d.id!==S.dernierG);x=(autres.length?autres:L)[0];}
    P.d=x.d;P.g=x.g;
    if(x.suite){P.lv=x.g.lv;P.m="p";P.papierExige=P.lv===dernier(x.d)&&x.g.ok>=seuil(x.d)-1&&!x.g.pap&&!x.d.sansPapier;}
    else{P.lv=dernier(x.d);P.m="e";P.papierExige=x.g.np>=2&&!x.g.ek&&!x.d.sansPapier;}}
  else{const d=P.d,g=etat(d.id);P.g=g;
    if(P.force){P.lv=P.force.lv;P.m="x";}
    else if(g.val){P.lv=dernier(d);P.m="x";}
    else if(!g.n&&!d.fixe){P.lv=dernier(d);P.m="pl";}
    else{P.lv=g.lv;P.m="p";}
    P.papierExige=P.m==="p"&&P.lv===dernier(d)&&g.ok>=seuil(d)-1&&!g.pap&&!d.sansPapier;}
  P.seul=P.refais;P.refais=false;
  P.re=P.force?P.force.re:null;P.exo=P.force?P.force.e:tirage(P.d,P.lv,P.g);P.force=null;P.aide=false;P.res=null;P.papier=false;
  if(P.exo.papier)P.papierExige=P.papier=true;else if(P.exo.champs.some(c=>c.k==="trous")&&P.exo.corpsPapier==null)P.papierExige=false;else if(P.papierExige)P.papier=true;
  let t0=Date.now();try{const s=JSON.parse(sessionStorage.getItem("rev-s1-exo")||"null");if(s&&s.c===P.exo.cle&&t0-s.t<30*60e3)t0=s.t;else sessionStorage.setItem("rev-s1-exo",JSON.stringify({c:P.exo.cle,t:t0}));}catch(e){}
  P.t0=t0;S.dernierG=P.d.id;dessine();}
function debut(mode,d,tout,force){stop();P={mode,d:d||null,force:force||null,sess:{t0:Date.now(),n:0,ok:0,run:A.nouvRun(),avant:{},refaire:null,dernierG:null,faits:[],tout:!!tout}};
  if(d)P.sess.avant[d.id]=Object.assign({},etat(d.id));prochain();}

const versFormule=t=>esc(String(t).replace(/\$/g,"")).replace(/\^\(([^()]*)\)/g,"^{$1}").replace(/\^(-?[A-Za-z0-9α-ω]+)/g,"^{$1}").replace(/sqrt|racine|rac/g,"√").replace(/\*/g," × ").replace(/-/g,"−").replace(/&lt;=/g,"≤").replace(/&gt;=/g,"≥").replace(/!=/g,"≠");
const longues=r=>{if(r)r.querySelectorAll(".mx").forEach(m=>{if(m.textContent.length>40&&!m.parentElement.closest(".mx,.en-nb"))m.classList.add("en-coupe");});};
const symHTML=c=>c.sym?`<div class="filters en-sym">${c.sym.map(x=>{const[l,v]=Array.isArray(x)?x:[x,x];return `<button type="button" class="btn" data-ins="${esc(v)}">${esc(l)}</button>`;}).join("")}</div>`:"";
const rangTrace=(c,r)=>c.rangs?(c.serre?String(r+1):"ligne "+(r+1)):r?"fin du tour "+r:"avant la boucle";
const ligneTrace=(c,r)=>`<tr><td>${rangTrace(c,r)}</td>${c.vars.map((v,k)=>`<td><input class="en-in${c.rangs&&!c.serre?" en-large":""}" data-r="${r}" data-k="${k}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(v)}, ${rangTrace(c,r)}"></td>`).join("")}</tr>`;
function champsHTML(e){return e.champs.map(c=>{
  if(c.k==="trace")return `<div data-ch="${c.id}" class="en-rep"><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th></th>${c.vars.map(v=>`<th class="var">${esc(v)}</th>`).join("")}</tr></thead><tbody>${[...Array(c.lignes||2)].map((_,r)=>ligneTrace(c,r)).join("")}</tbody></table></div><div class="acts"><button type="button" class="btn" data-plus>${c.rangs?"Ajouter une ligne":"Ajouter un tour"}</button><button type="button" class="btn" data-moins>${c.rangs?"Enlever la dernière ligne":"Enlever le dernier tour"}</button></div></div>`;
  if(c.k==="code")return `<div data-ch="${c.id}"${c.si?` data-si="${Object.keys(c.si)[0]}:${Object.values(c.si)[0]}" hidden`:""} class="en-rep">${c.label?`<p>${c.label}</p>`:""}<textarea class="en-in en-code" data-n="${c.id}" rows="${c.lignes||6}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="${esc(c.nom||c.label||c.id)}"${c.ex?` placeholder="${esc(c.ex)}"`:""}></textarea>${symHTML(c)}${c.aide?`<p class="muted">${c.aide}</p>`:""}</div>`;
  if(c.k==="vf")return `<div data-ch="${c.id}" class="en-rep"><div style="overflow-x:auto"><table class="tbl tr"><thead><tr>${c.donne.concat(c.cols).map(v=>`<th class="var">$${esc(v)}$</th>`).join("")}</tr></thead><tbody>${c.lignes.map((L,r)=>`<tr>${L.map(x=>`<td>${x}</td>`).join("")}${c.cols.map((v,k)=>`<td><input class="en-in" data-r="${r}" data-k="${k}" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="4" aria-label="${esc(v)}, ligne ${r+1}"></td>`).join("")}</tr>`).join("")}</tbody></table></div>${c.aide?`<p class="muted">${c.aide}</p>`:""}</div>`;
  if(c.k==="choix")return `${c.titre?`<p>${c.titre}</p>`:""}<div class="filters" data-ch="${c.id}">${c.o.map(o=>`<button type="button" class="btn" data-v="${o[0]}" aria-pressed="false">${o[1]}</button>`).join("")}</div>`;
  if(c.k==="cases")return `<div data-ch="${c.id}"${c.si?` data-si="${Object.keys(c.si)[0]}:${Object.values(c.si)[0]}" hidden`:""} class="en-rep">${c.titre?`<p>${c.titre}</p>`:""}<div class="mq-row">${c.noms.map(x=>`<label class="en-case">$${x} =$<input class="en-in${c.large?" en-large":""}" data-n="${x}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"></label>`).join("")}</div>${symHTML(c)}${c.aide?`<p class="muted">${c.aide}</p>`:""}</div>`;
  if(c.k==="sym")return `<div data-ch="${c.id}" class="en-rep">${symHTML(c)}${c.aide?`<p class="muted">${c.aide}</p>`:""}</div>`;
  if(c.k==="multi")return `<div class="filters" data-multi="${c.id}"${c.seul?` data-seul="${c.seul}"`:""}>${c.o.map(o=>`<button type="button" class="btn" data-v="${o[0]}" aria-pressed="false">${o[1]}</button>`).join("")}</div>`;
  if(c.k==="champ")return `<div data-ch="${c.id}"${c.si?` data-si="${Object.keys(c.si)[0]}:${Object.values(c.si)[0]}" hidden`:""} class="en-rep"><div class="mq-row"><label class="en-case en-long">${c.label}<input class="en-in en-large" data-n="${c.id}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"${c.ex?` placeholder="${esc(c.ex)}"`:""}></label></div>${c.sym&&c.apercu!==false?`<div class="mq-apercu" hidden></div>`:""}${symHTML(c)}${c.aide?`<p class="muted">${c.aide}</p>`:""}</div>`;
  return "";}).join("");}
function lire(e,b){const rep={};b=b||$("#lpb");
  e.champs.forEach(c=>{
    if(c.k==="choix"){const on=b.querySelector(`[data-ch="${c.id}"] [aria-pressed="true"]`);if(on)rep[c.id]=on.dataset.v;}
    else if(c.k==="cases"){const o={};b.querySelectorAll(`[data-ch="${c.id}"] input`).forEach(i=>{o[i.dataset.n]=i.value;});rep[c.id]=o;}
    else if(c.k==="multi")rep[c.id]=[...b.querySelectorAll(`[data-multi="${c.id}"] [aria-pressed="true"]`)].map(x=>x.dataset.v);
    else if(c.k==="champ"){const i=b.querySelector(`[data-ch="${c.id}"] input`);rep[c.id]=i?i.value:"";}
    else if(c.k==="code"){const i=b.querySelector(`[data-ch="${c.id}"] textarea`);rep[c.id]=i?i.value:"";}
    else if(c.k==="trace"||c.k==="vf"){const T=[];b.querySelectorAll(`[data-ch="${c.id}"] tbody tr`).forEach(tr=>T.push([...tr.querySelectorAll("input")].map(i=>i.value)));rep[c.id]=T;}
    else if(c.k==="trous")c.ids.forEach(id=>{const i=b.querySelector(`input[data-c="${id}"]`);rep[id]=i?i.value:"";});});
  return rep;}
function repTexte(e,rep){return e.champs.map(c=>{
  if(c.k==="choix"){const o=c.o.find(x=>x[0]===rep[c.id]);return o?o[1]:"(pas de choix)";}
  if(c.k==="cases"){if(c.si&&rep[Object.keys(c.si)[0]]!==Object.values(c.si)[0])return "";return c.noms.map(x=>x+" = "+((rep[c.id]||{})[x]||"?")).join(", ");}
  if(c.k==="multi")return (rep[c.id]||[]).map(v=>(c.o.find(o=>o[0]===v)||[v,v])[1]).join(", ")||"(rien de coché)";
  if(c.k==="champ"){if(c.si&&rep[Object.keys(c.si)[0]]!==Object.values(c.si)[0])return "";return (c.nom||c.id)+" : "+(rep[c.id]||"(vide)");}
  if(c.k==="trace")return (rep[c.id]||[]).map((L,r)=>c.rangs?"ligne "+(r+1)+" : "+(L[0]||"(vide)"):(r?"tour "+r:"avant")+" : "+c.vars.map((v,k)=>v+" = "+(L[k]||"?")).join(", ")).join(" | ");
  if(c.k==="code"){if(c.si&&rep[Object.keys(c.si)[0]]!==Object.values(c.si)[0])return "";return (c.nom||c.label||c.id)+" : "+(String(rep[c.id]||"").trim().replace(/\s*\n\s*/g," ⏎ ")||"(vide)");}
  if(c.k==="vf")return c.cols.map((v,k)=>v+" : "+c.lignes.map((_,r)=>((rep[c.id]||[])[r]||[])[k]||"?").join(" ")).join(" | ");
  if(c.k==="trous")return c.ids.map(id=>id+" = "+(rep[id]||"?")).join(", ");return "";}).filter(Boolean).join(" ; ");}
const pastilles=(lv,N)=>`<p class="legend"><span>${[...Array(N)].map((_,k)=>`<i class="dot${k<lv?" known":k===lv?" seen":""}"></i>`).join("")}</span><span>Palier ${lv+1} sur ${N} : ${P.d.paliers[lv].t}</span></p>`;
const etapesHTML=(e,marque)=>`<ol class="wex">${e.etapes.map((x,k)=>`<li><div>${k===marque?'<span class="pill rev">ton erreur</span> ':""}${x.w}</div><div class="why">${x.why}</div></li>`).join("")}</ol>`;
function lienMethode(d){const S=SUBJ[d.sid],p=(d.pages||[]).map(id=>S.pages.find(x=>x.id===id)).find(Boolean),T=theme(d),l=(d.lecons||(T&&T.les)||[]).map(id=>(A.LES[d.sid]||[]).find(x=>x.id===id)).find(Boolean);
  return p?`<a href="#/${d.sid}/p/${p.id}">${p.t}</a>`:l?`la leçon <a href="#/lecon/${d.sid}/${l.id}">${l.t}</a>`:"";}

/* les champs de réponse : boutons, lignes en plus, aperçu de la formule, symboles (fige : la réponse est donnée, ok : valider) */
function ecoute(b,e,fige,ok){
  const si=()=>b.querySelectorAll("[data-si]").forEach(z=>{const[c,v]=z.dataset.si.split(":"),on=b.querySelector(`[data-ch="${c}"] [aria-pressed="true"]`);z.hidden=!(on&&on.dataset.v===v);});
  b.querySelectorAll(".filters[data-ch] button").forEach(x=>x.addEventListener("click",()=>{if(fige())return;x.parentNode.querySelectorAll("button").forEach(y=>y.setAttribute("aria-pressed",y===x));si();const i=b.querySelector("[data-si]:not([hidden]) input");if(i)i.focus();}));
  b.querySelectorAll(".filters[data-multi] button").forEach(x=>x.addEventListener("click",()=>{if(fige())return;const g=x.parentNode,seul=g.dataset.seul,on=x.getAttribute("aria-pressed")!=="true";x.setAttribute("aria-pressed",on);
    if(on)g.querySelectorAll("button").forEach(y=>{if(y!==x&&(x.dataset.v===seul||y.dataset.v===seul))y.setAttribute("aria-pressed","false");});}));
  b.querySelectorAll("[data-plus]").forEach(x=>x.addEventListener("click",()=>{if(fige())return;const g=x.closest("[data-ch]"),c=e.champs.find(z=>z.id===g.dataset.ch),tb=g.querySelector("tbody");tb.insertAdjacentHTML("beforeend",ligneTrace(c,tb.children.length));const i=tb.lastElementChild.querySelector("input");if(i)i.focus();}));
  b.querySelectorAll("[data-moins]").forEach(x=>x.addEventListener("click",()=>{if(fige())return;const tb=x.closest("[data-ch]").querySelector("tbody");if(tb.children.length>1)tb.lastElementChild.remove();}));
  b.addEventListener("input",ev=>{const g=ev.target.closest&&ev.target.closest("[data-ch]"),ap=g&&g.querySelector(".mq-apercu");if(!ap)return;const v=ev.target.value.trim();ap.hidden=!v;if(v)ap.innerHTML=tx("Ce que tu as écrit : $"+versFormule(v)+"$");});
  let dernier=null;b.addEventListener("focusin",ev=>{if(ev.target.tagName==="INPUT"||ev.target.tagName==="TEXTAREA")dernier=ev.target;});
  b.querySelectorAll("textarea.en-code").forEach(t=>t.addEventListener("keydown",ev=>{if(ev.key==="Tab"&&!ev.shiftKey&&!ev.ctrlKey&&!ev.altKey){ev.preventDefault();t.setRangeText("  ",t.selectionStart,t.selectionEnd,"end");}else if(ev.key==="Enter"&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();if(!fige())ok();}}));
  b.querySelectorAll(".en-sym button").forEach(x=>{x.addEventListener("pointerdown",ev=>ev.preventDefault());
    x.addEventListener("click",()=>{if(fige())return;const g=x.closest("[data-ch]"),i=dernier&&b.contains(dernier)&&!dernier.closest("[hidden]")?dernier:(g.querySelector("input,textarea")||b.querySelector("input,textarea"));if(!i)return;
      const a=i.selectionStart==null?i.value.length:i.selectionStart,z=i.selectionEnd==null?a:i.selectionEnd,t=x.dataset.ins;i.value=i.value.slice(0,a)+t+i.value.slice(z);i.focus();i.setSelectionRange(a+t.length,a+t.length);i.dispatchEvent(new Event("input",{bubbles:true}));});});
  b.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target.tagName==="INPUT"&&!ev.target.closest(".en-cherche")){ev.preventDefault();if(!fige())ok();}});
  si();}
function dessine(){
  const d=P.d,e=P.exo,S=SUBJ[d.sid],g=P.g,N=d.paliers.length,jr=P.mode==="jour",retour=jr?"#/":"#/entrainer/"+d.sid;
  const cible=P.m==="e"?1:seuil(d),acquis=P.m==="p"?g.ok:0;
  let avant="";
  if(P.m==="pl")avant=`<p class="prekick">Pour commencer · un exercice du niveau ${duCC(S)}</p><p class="muted">S'il est juste, tu passes directement au dernier palier. Si tu ne sais pas le faire, clique sur « Je ne sais pas » : tu commenceras par plus simple.</p>`;
  else if(P.m==="x")avant=`<p class="prekick">${P.seul?"À toi, sans aide · le même genre que celui que tu viens de rater":P.re==="meme"?"Tu refais un exercice raté":P.re?"Un exercice du même genre que celui que tu as raté":"Exercice en plus"} · il ne change pas tes passages</p>`;
  else if(e.papier)avant=`<p class="prekick">Sur papier · de mémoire, puis tu coches ligne par ligne</p>`;
  else if(P.papierExige)avant=`<p class="prekick">Sur papier · ${jr?"ce passage se fait comme "+auCC(S):"pour valider le dernier palier"}</p>`;
  if(P.seul&&P.m!=="x")avant=`<p class="prekick">À toi, sans aide · le même genre que celui que tu viens de rater</p>`+avant;
  $("#main").className="s-"+d.sid;
  $("#main").innerHTML=`<div class="lp s-${d.sid}">
   <div class="lp-top"><a class="lp-x" href="${retour}" aria-label="Quitter l'entraînement">✕</a><div class="lp-bar" role="progressbar" aria-label="Réponses justes de suite" aria-valuemin="0" aria-valuemax="${cible}" aria-valuenow="${acquis}"><i style="width:${Math.min(100,acquis/cible*100)}%"></i></div><span class="lp-n" id="en-chrono">0:00</span></div>
   <div class="lp-kicker">${jr?"Entretien du jour · "+S.name:S.name+" · "+d.t}<span class="lp-left">${P.m==="p"&&seuil(d)>1?` · ${g.ok} ${plur(g.ok,"juste")} de suite sur ${seuil(d)}`:P.m==="e"?` · exercice ${P.sess.n+1}`:""}</span></div>
   ${jr||P.m==="x"||N<2?"":pastilles(P.lv,N)}
   <div class="lp-body" id="lpb"></div>
   <div class="lp-foot" id="en-pied"></div>
   <p class="kbdhint"><span class="kb">Clavier : Entrée pour valider, puis pour passer à la suite. </span>Si tu fermes, tu retrouveras le même exercice.</p></div>`;
  const b=$("#lpb"),q=jr&&e.qNeutre?e.qNeutre:e.q;
  const tic=()=>{const c=$("#en-chrono");if(c)c.textContent=horloge(Date.now()-P.t0);else stop();};
  stop();tic();TIC=setInterval(tic,1000);
  if(P.papier){
    b.innerHTML=tx(`${avant}<p class="lq" data-mots="${d.sid}">${q}</p><div>${e.corpsPapier!=null?e.corpsPapier:e.corps}</div><div class="paper"><b>Sur une feuille, sans regarder, comme ${auCC(S)}.</b> Compte environ ${ccMin(d,P.lv)} minutes. ${e.papier?"Écris-la en entier, comme sur ta copie.":"Écris tout ce que tu écrirais sur ta copie : chaque étape, puis la conclusion."}</div><div class="en-rep" id="en-fb" aria-live="polite"></div>`);
    $("#en-pied").innerHTML=`${P.papierExige||e.papier?`<button class="btn" id="en-nsp">Je ne sais pas</button>`:`<button class="btn" id="en-ecran">Répondre à l'écran</button>`}<button class="btn pri big" id="en-fini">J'ai fini : voir la correction</button>`;
    const ec=$("#en-ecran");if(ec)ec.addEventListener("click",()=>{P.papier=false;dessine();});
    const ns=$("#en-nsp");if(ns)ns.addEventListener("click",()=>valide(true));
    $("#en-fini").addEventListener("click",corrigePapier);longues(b);}
  else{
    b.innerHTML=tx(`${avant}<p class="lq" data-mots="${d.sid}">${q}</p><div>${e.corps}</div><div class="en-rep" id="en-rep">${champsHTML(e)}</div><div class="acts" id="en-plus">${e.indice===false?"":`<button type="button" class="btn" id="en-ind">Indice</button>`}${e.champs.some(c=>c.k==="trous")&&e.corpsPapier==null?"":`<button type="button" class="btn" id="en-pap">Sur papier</button>`}</div><div class="en-rep" id="en-fb" aria-live="polite"></div>`);
    $("#en-pied").innerHTML=`<button class="btn" id="en-nsp">Je ne sais pas</button><button class="btn pri big" id="en-ok">Valider</button>`;
    ecoute(b,e,()=>!!P.res,()=>valide(false));
    const ind=$("#en-ind");if(ind)ind.addEventListener("click",()=>{P.aide=true;ind.disabled=true;$("#en-fb").innerHTML=tx(`<div class="expl"><b>Indice : le début de la correction.</b><br>${e.etapes[0].w}<br><span class="muted">${e.etapes[0].why}</span></div><p class="muted">Avec l'indice, une réponse juste ne compte ni juste ni faux pour le palier. Une réponse fausse reste fausse.</p>`);});
    const pap=$("#en-pap");if(pap)pap.addEventListener("click",()=>{P.papier=true;dessine();});
    $("#en-ok").addEventListener("click",()=>valide(false));
    $("#en-nsp").addEventListener("click",()=>valide(true));
    longues(b);
    const i0=b.querySelector("input:not([hidden])");if(i0&&!matchMedia("(pointer:coarse)").matches)i0.focus();}
  A.motsClic(d.sid,b.querySelector(".lq"));
  queueMicrotask(()=>document.body.classList.add("in-lesson"));window.scrollTo(0,0);}

/* ---------- la réponse : jugement, enregistrement, correction ---------- */
function enregistre(r,o){
  const d=P.d,e=P.exo,ms=Date.now()-P.t0,cc=ccMin(d,P.lv),lent=ms>LENT*cc*60e3,N=d.paliers.length,av=Object.assign({},etat(d.id));
  if(!P.sess.avant[d.id])P.sess.avant[d.id]=av;
  const ev={k:"tr",s:d.sid,g:d.id,lv:P.lv,r,m:P.m,ms,sg:e.cle};if(lent)ev.lent=1;if(o.papier)ev.pap=1;if(P.m==="pl"&&r!==1)ev.to=palierDepart(d);if(o.type)ev.ty=o.type;if(r===0&&e.nature&&P.m!=="pl")ev.na=e.nature;
  A.emit(ev);shot(ev);pastille();
  if(r!==2&&d.th)A.emit({k:"diag",s:d.sid,th:d.th,ok:Math.round((r===1?(P.lv+1)/N:0.6*P.lv/N)*100)/100,n:1,run:P.sess.run});
  A.logRep(Object.assign({o:"entraînement",s:d.sid,g:d.id,methode:d.t,palier:P.lv+1,sur:N,mode:P.re?"refait":{pl:"placement",p:"palier",e:"entretien",x:"en plus"}[P.m],ok:r===1?1:0,aide:r===2?1:0,lent:lent?1:0,ms,tempsCC:cc,enonce:e.texte,bonne:e.bonneTxt,cle:e.cle,gr:e.gr,lv:P.lv},P.re?{refait:1}:{},o.carnet||{}));
  const ap=etat(d.id);
  if(SUBJ[d.sid].TB["en-"+d.id]){if(ap.val&&!av.val)A.emit({k:"task",s:d.sid,x:"en-"+d.id,v:true});else if(!ap.val&&av.val)A.emit({k:"task",s:d.sid,x:"en-"+d.id,v:false});}
  P.sess.n++;if(r===1)P.sess.ok++;P.sess.faits.push(d.id);P.sess.refaire=r===0?d.id:null;
  try{sessionStorage.removeItem("rev-s1-exo");}catch(x){}
  return {av,ap,ms,lent,cc,r};}
function changement(d,av,ap){const N=d.paliers.length;
  if(ap.val&&!av.val)return ` ${d.fixe?"C'est réussi":seuil(d)+" justes de suite au dernier palier : méthode réussie"}. ${d.fixe?"Tu la referas":"Elle revient"} ${quand(echeance(d,ap))} dans l'entretien du jour.`;
  if(!ap.val&&av.val)return ` Deux erreurs sur ce passage : la méthode est à retravailler, à partir du palier ${ap.lv+1}.`;
  if(av.val&&ap.val&&ap.ek>av.ek)return ` Une erreur : un deuxième exercice du même type décide du passage.`;
  if(av.val&&ap.val&&ap.passe!==av.passe)return ` Passage réussi : le prochain est ${quand(echeance(d,ap))}.`;
  if(d.fixe)return "";
  if(!av.n&&ap.lv===N-1&&ap.ok===1)return ` Tu passes directement au dernier palier.`;
  if(!av.n)return ` Tu commences au palier ${ap.lv+1} : ${d.paliers[ap.lv].t}.`;
  if(ap.lv>av.lv)return ` ${seuil(d)} justes de suite : palier ${ap.lv+1}, ${d.paliers[ap.lv].t}.`;
  if(ap.lv<av.lv)return ` 2 fausses de suite : retour au palier ${ap.lv+1}, ${d.paliers[ap.lv].t}.`;
  return "";}
/* choix 16c du 20/11 : après une correction, le même genre d'exercice tout de suite, à faire seul */
function pied(R){const fini=P.mode==="jour"?!entretien(P.sess.tout).length:(R.ap.val&&!R.av.val),
    seul=R.r===0&&P.m!=="pl"&&!fini&&(P.mode!=="jour"||entretien(P.sess.tout).some(y=>y.d.id===P.d.id)),fb=$("#en-fb");
  if(seul&&fb)fb.insertAdjacentHTML("beforeend",`<div class="verdict info en-seul">À toi, sans aide : le même genre d'exercice, avec d'autres données. ${P.m==="x"?"Il ne change pas tes passages.":P.m==="e"?"Il compte pour ton passage.":"Il compte pour ton palier."}</div>`);
  $("#en-pied").innerHTML=`${fini?"":`<button class="btn" id="en-stop">Arrêter là</button>`}${P.re?`<a class="btn" href="#/entrainer/erreurs">Retour à mes erreurs</a>`:""}<button class="btn pri big" id="en-suiv">${fini?"Terminer":seul?"Refais-le seul":"Exercice suivant"}</button>`;
  const s=$("#en-suiv");s.addEventListener("click",()=>{if(fini)return fin();if(seul){P.refais=true;if(P.m==="x")P.force={e:tirage(P.d,P.lv,etat(P.d.id)),lv:P.lv,re:P.re||"semblable"};}prochain();});const st=$("#en-stop");if(st)st.addEventListener("click",fin);s.focus();
  const bar=$(".lp-bar i");if(bar){const ap=R.ap,v=P.m==="e"?(ap.passe===A.today()?1:0):P.m==="p"?(ap.val||ap.lv>R.av.lv?1:ap.ok/seuil(P.d)):0;bar.style.width=Math.min(100,v*100)+"%";}}
function valide(nsp){
  const d=P.d,e=P.exo,b=$("#lpb"),fb=$("#en-fb");if(P.res)return;
  const rep=nsp?{}:lire(e),j=nsp?{ok:false,resume:"Pas de réponse : voici la correction."}:e.juge(rep);
  if(j.incomplet){fb.innerHTML=`<div class="verdict info">${j.incomplet}</div>`;return;}
  stop();P.res=j;
  const r=j.ok?(P.aide?2:1):0,cherche=!j.ok&&!j.diag&&j.cherche?j.cherche:null;
  const R=enregistre(r,{type:j.diag&&j.diag.type,carnet:{reponse:nsp?"(je ne sais pas)":repTexte(e,rep),etape:j.diag?j.diag.titre:null,erreur:j.diag?j.diag.type:null,explication:j.diag?A.brut(j.diag.msg):null}});
  b.querySelectorAll("input,textarea,.filters button,#en-plus button,[data-plus],[data-moins]").forEach(x=>{x.disabled=true;});
  (j.faux||[]).forEach(id=>{const m=/^(.+):(\d+):(\d+)$/.exec(id),i=m?b.querySelector(`[data-ch="${m[1]}"] input[data-r="${m[2]}"][data-k="${m[3]}"]`):b.querySelector(`input[data-n="${id}"]:not([hidden]),textarea[data-n="${id}"],input[data-c="${id}"]`);if(i&&!i.closest("[hidden]"))i.setAttribute("aria-invalid","true");});
  const S=SUBJ[d.sid],temps=`${duree(R.ms)} : ${auCC(S)}, tu aurais environ ${R.cc} min pour cet exercice.`,ch=changement(d,R.av,R.ap);
  let h;
  if(r===1&&R.lent&&P.m==="p"&&P.lv===dernier(d))h=`<div class="verdict info">Juste, mais en ${duree(R.ms)}. Au dernier palier il faut aussi tenir le temps : au plus ${LENT*R.cc} min ici (${auCC(S)}, environ ${R.cc} min). Cet exercice ne compte ni juste ni faux.</div>`;
  else if(r===1)h=`<div class="verdict ok">Juste. ${temps}${ch}</div>`;
  else if(r===2)h=`<div class="verdict info">Juste, avec l'indice : cet exercice ne compte ni juste ni faux. ${temps}</div>`;
  else h=`<div class="verdict no">${j.resume||"Ce n'est pas ça."}${ch}</div>`;
  if(j.diag)h+=`<div class="expl no"><b>${j.diag.titre}</b><br>${j.diag.msg}</div>`;
  const lm=lienMethode(d),corr=marque=>`${e.papier?"":`<p><b>La bonne réponse :</b> ${e.bonne}</p>`}${etapesHTML(e,marque)}${lm?`<p class="muted">Pour revoir la méthode : ${lm}.</p>`:""}`;
  if(cherche)h+=`<div class="en-cherche" id="en-ch"></div>`;
  else if(r===0)h+=`<h3>La correction</h3>${corr(j.diag?j.diag.etape:-1)}`;
  else h+=`<details class="ex"><summary><span><span class="h">Voir la correction</span></span></summary><div class="body">${corr(-1)}</div></details>`;
  fb.innerHTML=tx(h);longues(fb);
  if(cherche)chercheErreur(cherche,corr,R);else{if(r===0)genreErreur(fb,d,e);pied(R);}
  fb.scrollIntoView({behavior:"smooth",block:"nearest"});}
/* l'erreur n'est pas reconnue : une ou deux questions sur ses résultats intermédiaires pour trouver où ça part */
function chercheErreur(C,corr,R){const box=$("#en-ch"),vus=[];let k=0;
  const conclut=(dg,passe)=>{A.logRep({o:"entraînement : recherche d'erreur",s:P.d.sid,g:P.d.id,cle:P.exo.cle,questions:vus,etape:dg?dg.titre:null,passe:passe?1:0});
    box.insertAdjacentHTML("beforeend",tx(`${dg?`<div class="expl no"><b>${dg.titre}</b><br>${dg.msg}</div>`:""}<h3>La correction</h3>${corr(dg?dg.etape:-1)}`));genreErreur(box,P.d,P.exo);pied(R);};
  const pose=()=>{const q=C.L[k];
    box.insertAdjacentHTML("beforeend",tx(`<div class="qbox"><p class="qtxt">${k?"":"Cherchons où ça part. "}${q.q}</p><div class="mq-row"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Ta ligne"><button type="button" class="btn pri">Vérifier</button><button type="button" class="btn" data-passe="1">Voir la correction</button></div><div class="verdict" hidden></div></div>`));
    const bx=box.lastElementChild,inp=bx.querySelector("input"),ver=bx.querySelector(".verdict"),ok=bx.querySelector(".btn.pri");
    const juge=()=>{const v=q.juge(inp.value);ver.hidden=false;
      if(v===null){ver.className="verdict info";ver.textContent="Je n'arrive pas à lire cette ligne : écris seulement ses nombres, séparés par des espaces (par exemple 0 1 3 -3).";return;}
      inp.disabled=true;bx.querySelectorAll("button").forEach(x=>{x.disabled=true;});vus.push({q:A.brut(q.q),rep:inp.value,ok:v?1:0});
      if(!v){ver.className="verdict no";ver.textContent="C'est ici que ça part.";return conclut(q.siFaux);}
      ver.className="verdict ok";ver.textContent="Cette ligne est juste : l'erreur est ailleurs.";k++;if(k<C.L.length)pose();else conclut(C.sinon);};
    ok.addEventListener("click",juge);inp.addEventListener("keydown",ev=>{if(ev.key==="Enter"){ev.preventDefault();juge();}});
    bx.querySelector("[data-passe]").addEventListener("click",()=>{bx.querySelectorAll("button,input").forEach(x=>{x.disabled=true;});conclut(null,true);});
    if(!matchMedia("(pointer:coarse)").matches)inp.focus();};
  $("#en-pied").innerHTML="";pose();}
/* sur papier : chaque ligne de la correction a sa case et ses points */
function corrigePapier(){const d=P.d,e=P.exo,b=$("#lpb"),tot=e.etapes.reduce((s,x)=>s+x.pts,0),vieux=$("#en-fb");if(vieux)vieux.remove();
  b.insertAdjacentHTML("beforeend",tx(`<h3>La correction : coche ce que tu as écrit</h3><div class="pcheck">${e.etapes.map((x,k)=>`<label><input type="checkbox" data-k="${k}"><span>${x.w}</span><b>${virg(x.pts)}</b></label>`).join("")}</div><div class="verdict info" id="en-note"></div><div class="en-rep" id="en-fb"></div>`));
  const note=()=>[...b.querySelectorAll(".pcheck input")].reduce((s,i)=>s+(i.checked?e.etapes[+i.dataset.k].pts:0),0);
  const maj=()=>{$("#en-note").textContent=`Note estimée : ${virg(note())} sur ${virg(tot)}. Il faut ${virg(Math.ceil(tot*0.8*2)/2)} pour que l'exercice compte juste.`;};
  b.querySelector(".pcheck").addEventListener("change",maj);maj();
  $("#en-pied").innerHTML=`<button class="btn pri big" id="en-noter">Enregistrer ma note</button>`;
  longues(b);
  $("#en-noter").addEventListener("click",()=>{if(P.res)return;stop();const n=note(),ok=n>=tot*0.8-1e-9,manque=e.etapes.map((x,k)=>k).filter(k=>!b.querySelector(`.pcheck input[data-k="${k}"]`).checked);
    P.res={ok};b.querySelectorAll(".pcheck input").forEach(i=>{i.disabled=true;});
    const R=enregistre(ok?1:0,{papier:true,carnet:{papier:1,note:n,noteSur:tot,lignesManquantes:manque.map(k=>A.brut(e.etapes[k].w).slice(0,160))}}),ch=changement(d,R.av,R.ap);
    $("#en-note").className="verdict "+(ok?"ok":"no");
    $("#en-note").innerHTML=`Note estimée : ${virg(n)} sur ${virg(tot)}. ${ok?"L'exercice compte juste.":"L'exercice compte faux : il faut au moins 80 % des points."}${manque.length?` Il manque ${manque.length>1?"les lignes":"la ligne"} ${manque.map(k=>k+1).join(", ")}.`:""}${ch} ${duree(R.ms)} : ${auCC(SUBJ[d.sid])}, environ ${R.cc} min.`;
    $("#en-fb").innerHTML=tx(`<details class="ex"><summary><span><span class="h">Voir l'explication de chaque étape</span></span></summary><div class="body">${etapesHTML(e,-1)}</div></details>`);if(!ok)genreErreur($("#en-fb"),d,e);pied(R);});}

/* ---------- le genre d'erreur (choix 20b du 20/11) : un toucher sous la correction ; l'idée clé de l'exercice (le chemin de la correction)
   devient une carte de Réviser, revue le lendemain. Le genre se retrouve et se change dans « Mes erreurs ». ---------- */
const GENRES=[["etourderie","Étourderie"],["methode","Méthode pas trouvée"],["cours","Cours pas su"],["calcul","Calcul"],["redaction","Rédaction"]];
const genreNom=k=>(GENRES.find(x=>x[0]===k)||[0,""])[1],genreDe=(sid,cle)=>((A.ST[sid]||{}).err||{})[cle]||null;
const genresHTML=on=>`<div class="puces" role="group" aria-label="Ce qui s'est passé">${GENRES.map(([k,n])=>`<button type="button" class="puce" data-genre="${k}" aria-pressed="${k===on}">${n}</button>`).join("")}</div>`;
const ideeHTML=(d,e)=>`<div class="carte-r"><span class="k">Revient dans Réviser · carte, demain</span><b>Idée clé de l'exercice</b><span class="muted">${esc(d.t)} :</span><ol class="carte-r__l">${e.etapes.map(x=>`<li>${x.w}</li>`).join("")}</ol></div>`;
function genreErreur(box,d,e){if(!box||e.gr==null)return;const on=genreDe(d.sid,e.cle);
  box.insertAdjacentHTML("beforeend",`<div class="en-genre"><p class="en-genre__q">Ce qui s'est passé ? (un toucher)</p>${genresHTML(on)}<div class="en-genre__carte"></div></div>`);
  const z=box.lastElementChild,c=z.querySelector(".en-genre__carte"),montre=()=>{if(!c.children.length){c.innerHTML=tx(ideeHTML(d,e));longues(c);}};if(on)montre();
  z.querySelectorAll("[data-genre]").forEach(b=>b.addEventListener("click",()=>{z.querySelectorAll("[data-genre]").forEach(x=>x.setAttribute("aria-pressed",x===b));
    A.emit({k:"err",s:d.sid,g:d.id,lv:e.palier,gr:e.gr,cle:e.cle,ty:b.dataset.genre});montre();}));}

/* ---------- fin de séance ---------- */
function fin(){stop();const S0=P.sess,ids=[...new Set(S0.faits)],jr=P.mode==="jour",sid=P.d?P.d.sid:null;
  const lignes=ids.map(id=>{const d=GEN.par[id],av=S0.avant[id]||neuf(),ap=etat(id),N=d.paliers.length;let t;
    if(ap.val&&!av.val)t=`${d.fixe?"réussi":"méthode réussie"}. Prochain passage : ${quand(echeance(d,ap))}, dans l'entretien du jour.`;
    else if(!ap.val&&av.val)t=`à retravailler, à partir du palier ${ap.lv+1} sur ${N}.`;
    else if(ap.val)t=ap.passe!==av.passe?`passage réussi. Le prochain : ${quand(echeance(d,ap))}.`:ap.ek?"passage commencé : une erreur, il reste un exercice pour décider.":"toujours réussie.";
    else if(ap.lv!==av.lv||!av.n)t=`palier ${av.n?av.lv+1+" → ":""}${ap.lv+1} sur ${N}.`;
    else t=d.fixe?"à refaire.":`palier ${ap.lv+1} sur ${N}, ${ap.ok} ${plur(ap.ok,"juste")} de suite sur ${seuil(d)}.`;
    return `<p><b>${d.t}</b> : ${t}</p>`;}).join("");
  const reste=jr?[]:ordre(sid).filter(x=>!x.g.val&&x.d.id!==P.d.id&&moment(x.d)),suiv=reste[0],reussie=!jr&&!!etat(P.d.id).val,rp=jr?reportes():0;
  $("#main").className=sid&&!jr?"s-"+sid:"";
  $("#main").innerHTML=`<div class="page lp-end${sid&&!jr?" s-"+sid:""}"><p class="kick">${jr?"Entretien du jour":SUBJ[sid].name}</p><h1>Séance terminée</h1>${S0.n?`<p class="lead">${S0.n} ${plur(S0.n,"exercice")}, ${S0.ok} ${plur(S0.ok,"juste")}, en ${duree(Date.now()-S0.t0)}.</p>${lignes}`:`<p class="lead">Aucun exercice fait cette fois.</p>`}${rp?`<p class="muted">Tes ${MAXJOUR} minutes d'entretien sont faites pour aujourd'hui : ${rp} ${plur(rp,"méthode")} ${plur(rp,"attend","attendent")} demain.</p>`:""}${S0.n?`<div id="en-bil"></div>`:""}
   <div class="acts">${jr?`${A.miniDu&&A.miniDu().du?`<a class="btn pri big" href="#/mix">Continuer : les questions rapides des autres thèmes</a><a class="btn" href="#/">Voir le programme du jour</a>`:`<a class="btn pri big" href="#/">Voir le programme du jour</a>`}${rp?`<button class="btn" id="en-tout">Les faire quand même</button>`:""}`:reussie&&suiv?`<a class="btn pri big" href="#/entrainer/${sid}/${suiv.d.id}">Méthode suivante : ${suiv.d.t}</a>`:""}${jr?"":`<a class="btn${reussie&&suiv?"":" pri"}" href="#/">Retour à aujourd'hui</a><button class="btn" id="en-encore">${reussie?"Encore un":"Continuer cette méthode"}</button>`}<a class="btn" href="#/entrainer/rapport">Mon rapport</a></div></div>`;
  if(S0.n)A.bilanSeance($("#en-bil"),jr?{o:"entretien du jour"}:{o:"entraînement",s:sid,g:P.d.id});
  const en=$("#en-encore"),d0=P.d,et=$("#en-tout");if(en)en.addEventListener("click",()=>debut("g",d0));if(et)et.addEventListener("click",()=>debut("jour",null,true));
  A.renderSide();window.scrollTo(0,0);}

/* ---------- le rapport : tout ce qui a été raté, à copier pour le montrer à un Claude ---------- */
function rapport(){$("#main").className="";
  $("#main").innerHTML=`<div class="page"><a class="back" href="#/entrainer">‹ S'entraîner</a><div class="title-row"><h1>Mon rapport d'entraînement</h1></div><p class="lead">Chaque exercice fait à l'entraînement est noté ici : la méthode, le palier, ton temps, ta réponse, et l'étape où ça s'est trompé quand le site l'a trouvée. Le rapport suit la synchronisation entre ton téléphone et ton ordinateur. Le bouton copie tout en texte : colle-le dans une fenêtre Claude pour qu'il travaille tes points faibles.</p><div class="acts"><button class="btn pri" id="en-copie">Copier le rapport</button><a class="btn" href="#/entrainer/erreurs">Mes erreurs</a><span class="muted" id="en-copie-ok"></span></div><div id="en-rap"><p class="muted">Lecture du carnet des réponses…</p></div></div>`;
  A.allReps().then(L=>{const box=$("#en-rap");if(!box)return;
    const vus=new Set(),R=L.filter(r=>r&&r.o==="entraînement"&&r.g&&GEN.par[r.g]&&!vus.has(r.id)&&vus.add(r.id)).sort((a,b)=>a.t-b.t);
    const C=L.filter(r=>r&&r.o==="entraînement : recherche d'erreur"),XR=xRapport(L),BL=bilans();
    let txt=`RAPPORT D'ENTRAÎNEMENT, ${A.dayName(A.today())}\n(site de révision, partie « Entraînement » : exercices tirés au hasard, réponse tapée ou cochée sur papier)\n`,h="";
    if(!R.length&&!XR.h&&!BL.h){box.innerHTML=`<p class="muted">Aucun exercice d'entraînement pour l'instant.</p>`;TXT=txt+"\nAucun exercice fait.";return;}
    matieres().concat(A.SIDS.filter(s=>!matieres().includes(s))).forEach(sid=>{const Rs=R.filter(r=>r.s===sid);if(!Rs.length)return;const S=SUBJ[sid];
      txt+=`\n=== ${S.name} (${A.exam(S).label} ${A.exam(S).report?"reporté, date à venir":A.dayName(A.exam(S).day)}) ===\n`;h+=`<section class="sec"><h2><span>${S.name}</span></h2>`;
      (GEN.defs[sid]||[]).forEach(d=>{const X=Rs.filter(r=>r.g===d.id);if(!X.length)return;const g=etat(d.id),N=d.paliers.length,ok=X.filter(r=>r.ok).length,fx=X.filter(r=>!r.ok&&!r.aide),just=X.filter(r=>r.ok),moy=just.length?just.reduce((s,r)=>s+r.ms,0)/just.length:0,lents=X.filter(r=>r.lent).length;
        const types={};fx.forEach(r=>{const k=r.erreur||(r.reponse==="(je ne sais pas)"?"pas de réponse":r.papier?"copie incomplète":"erreur non reconnue");types[k]=(types[k]||0)+1;});
        const tl=Object.entries(types).sort((a,b)=>b[1]-a[1]),ou=g.val?`réussie le ${A.dayName(g.val,false,true)}, prochain passage ${quand(echeance(d,g)||g.du)}`:`palier ${g.lv+1} sur ${N}${g.trav?" (à retravailler après un passage raté)":""}`;
        txt+=`\n-- ${d.t} : ${ou}\n   ${X.length} exercices, ${ok} justes, ${fx.length} faux, ${X.filter(r=>r.aide).length} avec indice${moy?`, temps moyen quand c'est juste : ${duree(moy)}`:""}${lents?`, ${lents} trop lents`:""}\n`;
        if(tl.length)txt+=`   Erreurs par type : ${tl.map(([k,n])=>`${k} × ${n}`).join(" ; ")}\n`;
        fx.slice(-12).forEach(r=>{const cq=C.filter(c=>c.cle===r.cle).pop();
          txt+=`   * ${r.jour}, palier ${r.palier}/${r.sur}${r.mode==="entretien"?" (entretien)":r.mode==="placement"?" (placement)":""}${r.papier?", sur papier":""}, ${duree(r.ms)} (CC : ${r.tempsCC} min)\n     Énoncé : ${r.enonce}\n     ${r.papier?`Note estimée : ${virg(r.note)} sur ${virg(r.noteSur)}. Lignes non écrites : ${(r.lignesManquantes||[]).join(" | ")||"aucune"}`:`Sa réponse : ${r.reponse}`}\n     Bonne réponse : ${r.bonne}\n${r.etape?`     ${r.etape} ${r.explication||""}\n`:""}${cq&&cq.questions&&cq.questions.length?`     Recherche de l'erreur : ${cq.questions.map(q=>`« ${q.rep} » ${q.ok?"(ligne juste)":"(ligne fausse)"}`).join(", ")}${cq.etape?" → "+cq.etape:""}\n`:""}`;});
        h+=`<details class="ex"><summary><span><span class="sub">${ok} ${plur(ok,"juste")} sur ${X.length}</span><br><span class="h">${d.t}</span></span></summary><div class="body"><p>${ou.charAt(0).toUpperCase()+ou.slice(1)}.${moy?` Temps moyen quand c'est juste : ${duree(moy)}.`:""}${lents?` ${lents} ${plur(lents,"exercice")} trop ${plur(lents,"lent")}.`:""}</p>${tl.length?`<p><b>Tes erreurs :</b> ${tl.map(([k,n])=>`${esc(k)} (${n})`).join(", ")}.</p>`:`<p>Aucune erreur.</p>`}${fx.slice(-5).reverse().map(r=>`<div class="expl no"><b>${r.jour}, palier ${r.palier} sur ${r.sur}${r.papier?", sur papier":""}</b><br>${esc(r.enonce)}<br>${r.papier?`Note estimée : ${virg(r.note)} sur ${virg(r.noteSur)}.`:`Ta réponse : ${esc(r.reponse||"")}`}<br>Bonne réponse : ${esc(r.bonne)}${r.etape?`<br>${esc(r.etape)}`:""}</div>`).join("")}</div></details>`;});
      h+=`</section>`;});
    TXT=txt+XR.txt+BL.txt;box.innerHTML=h+XR.h+BL.h;});
  $("#en-copie").addEventListener("click",async()=>{let ok=false;try{await navigator.clipboard.writeText(TXT);ok=true;}catch(e){}
    if(!ok){const z=document.createElement("textarea");z.value=TXT;document.body.append(z);z.select();try{ok=document.execCommand("copy");}catch(e){}z.remove();}
    $("#en-copie-ok").textContent=ok?"Copié : colle-le dans une fenêtre Claude.":"La copie n'a pas marché.";});}
let TXT="";
/* ses bilans de fin de séance (choix 29a du 20/11) et ce qu'il a écrit de mémoire avant de rouvrir une leçon (30a), pris dans le journal */
function bilans(){const E=A.journal().filter(e=>e.k==="bil"||e.k==="mem").slice(-60).reverse();if(!E.length)return{txt:"",h:""};
  const quoi=e=>{const S=SUBJ[e.s],T=S&&e.l&&S.TB["L-"+e.l],d=e.g&&GEN.par[e.g];return [e.k==="mem"?null:e.o,S&&S.name,T?T.t:d?d.t:null].filter(Boolean).join(" · ");};
  const jour=e=>A.dayName(A.ymd(new Date(e.t)),false,true),B=E.filter(e=>e.k==="bil"),M=E.filter(e=>e.k==="mem");let txt="",h="";
  if(B.length){txt+=`\n=== BILANS DE SÉANCE (ses deux lignes à la fin d'une séance) ===\n`+B.map(e=>`-- ${jour(e)}, ${quoi(e)}\n${e.r?`   Ce que je retiens : ${e.r}\n`:""}${e.c?`   Ce qui a coincé : ${e.c}\n`:""}`).join("");
    h+=`<section class="sec"><h2><span>Tes bilans de séance</span></h2>${B.map(e=>`<div class="expl"><b>${jour(e)} · ${esc(quoi(e))}</b>${e.r?`<br>Ce que je retiens : ${esc(e.r)}`:""}${e.c?`<br>Ce qui a coincé : ${esc(e.c)}`:""}</div>`).join("")}</section>`;}
  if(M.length){txt+=`\n=== ÉCRIT DE MÉMOIRE AVANT DE ROUVRIR UNE LEÇON ===\n`+M.map(e=>`-- ${jour(e)}, ${quoi(e)}, en ${duree(e.ms||0)}\n   ${String(e.txt).replace(/\n/g,"\n   ")}\n`).join("");
    h+=`<section class="sec"><h2><span>Écrit de mémoire avant une leçon</span></h2>${M.map(e=>`<div class="expl"><b>${jour(e)} · ${esc(quoi(e))}</b><br>${esc(e.txt).replace(/\n/g,"<br>")}</div>`).join("")}</section>`;}
  return{txt,h};}

/* ---------- mes erreurs (choix 32a du 20/11) : les exercices ratés, à l'entraînement et aux examens blancs, l'erreur reconnue, et « Le refaire »
   qui redonne le même exercice (graine gardée dans le carnet depuis le 20/11 ; avant, retrouvée par le journal), en exercice en plus ---------- */
const ratee=r=>r&&r.cle&&!r.ok&&!r.aide&&(r.o==="entraînement"||r.o==="examen blanc")&&GEN.par[r.g]&&SUBJ[r.s];
function erreurs(){stop();$("#main").className="";
  $("#main").innerHTML=`<div class="page"><a class="back" href="#/entrainer">‹ S'entraîner</a><div class="title-row"><h1>Mes erreurs</h1></div><p class="lead">Les exercices que tu as ratés, à l'entraînement et aux examens blancs, avec l'erreur quand le site l'a reconnue. « Le refaire » te redonne le même exercice : il ne change pas tes passages. Un exercice refait juste descend dans « Déjà refaits juste ».</p><div id="en-err"><p class="muted">Lecture du carnet des réponses…</p></div></div>`;
  A.allReps().then(L=>{const box=$("#en-err");if(!box)return;
    const vus=new Set(),R=L.filter(r=>r&&r.id&&!vus.has(r.id)&&vus.add(r.id)).sort((a,b)=>a.t-b.t),C=R.filter(r=>r.o==="entraînement : recherche d'erreur"),juste={},der={};
    R.forEach(r=>{if(r.ok&&r.cle)juste[r.cle]=r.t;});R.filter(ratee).forEach(r=>{der[r.cle]=r;});
    const F=Object.values(der).sort((a,b)=>b.t-a.t),refait=r=>juste[r.cle]>r.t;
    if(!F.length){box.innerHTML=`<p class="muted">Aucun exercice raté pour l'instant.</p>`;return;}
    const G={};F.filter(r=>!refait(r)).forEach(r=>{const k=genreDe(r.s,r.cle);if(k)G[k]=(G[k]||0)+1;});const GL=Object.entries(G).sort((a,b)=>b[1]-a[1]);
    const ligne=r=>{const d=GEN.par[r.g],cq=C.filter(c=>c.cle===r.cle).pop(),et=r.etape||(cq&&cq.etape),ok=refait(r);
      return `<div class="expl${ok?"":" no"}"><b>${A.dayName(A.ymd(new Date(r.t)),false,true)} · ${esc(d.t)} · ${r.o==="examen blanc"?"examen blanc":`palier ${r.palier} sur ${r.sur}`}</b><br>${esc(r.enonce)}<br>${r.papier?`Sur papier, note : ${virg(r.note)} sur ${virg(r.noteSur)}.${(r.lignesManquantes||[]).length?` Lignes non écrites : ${esc(r.lignesManquantes.join(" | "))}`:""}`:`Ta réponse : ${esc(r.reponse||"")}`}<br>Bonne réponse : ${esc(r.bonne)}<br>${et?`L'erreur : ${esc(et)}`:"Le site n'a pas reconnu l'erreur."}${ok?`<br>Refait juste le ${A.dayName(A.ymd(new Date(juste[r.cle])),false,true)}.`:""}${ok?"":`<p class="en-genre__q">Ce qui s'est passé ?</p><div data-rid="${esc(r.id)}">${genresHTML(genreDe(r.s,r.cle))}</div>`}<div class="acts"><a class="btn${ok?"":" pri"}" href="#/entrainer/refaire/${encodeURIComponent(r.id)}">Le refaire</a></div></div>`;};
    let h="";matieres().concat(A.SIDS.filter(s=>!matieres().includes(s))).forEach(sid=>{const K=F.filter(r=>r.s===sid&&!refait(r)),OK=F.filter(r=>r.s===sid&&refait(r));if(!K.length&&!OK.length)return;
      h+=`<section class="sec"><h2><span>${SUBJ[sid].name}</span></h2>${K.map(ligne).join("")||`<p class="muted">Tout est refait juste.</p>`}${OK.length?`<details class="ex"><summary><span><span class="h">Déjà refaits juste (${OK.length})</span></span></summary><div class="body">${OK.map(ligne).join("")}</div></details>`:""}</section>`;});
    box.innerHTML=(GL.length?`<p class="lead">Ce qui revient le plus : ${GL.map(([k,n])=>`${genreNom(k)} (${n})`).join(", ")}.</p>`:`<p class="muted">Sous chaque erreur, un toucher dit ce qui s'est passé : l'idée clé de l'exercice revient alors en carte dans Réviser.</p>`)+h;
    box.querySelectorAll("[data-rid] [data-genre]").forEach(b=>b.addEventListener("click",()=>{const r=F.find(x=>x.id===b.closest("[data-rid]").dataset.rid),d=r&&GEN.par[r.g];if(!d)return;
      b.parentNode.querySelectorAll("[data-genre]").forEach(x=>x.setAttribute("aria-pressed",x===b));const x=retrouve(r,d),ev={k:"err",s:r.s,g:d.id,cle:r.cle,ty:b.dataset.genre};if(x.e){ev.lv=x.lv;ev.gr=x.e.gr;}A.emit(ev);}));});}
/* le même exercice : par sa graine ; sinon rejoué depuis le journal (le « tr » du même exercice donne le palier et le nombre d'exercices d'avant) */
function retrouve(r,d){const essai=(lv,gr)=>{try{const e=GEN.tire(d,lv,gr);return e.cle===r.cle?e:null;}catch(x){return null;}},h=s=>parseInt(GEN.outils.hache(s),36);
  const T=A.journal().filter(x=>x.k==="tr"&&x.g===d.id),i=T.map(x=>x.sg).indexOf(r.cle),ev=i>=0?T[i]:null,lv=r.lv!=null?r.lv:ev?ev.lv:r.palier?r.palier-1:null;
  if(lv!=null&&d.paliers[lv]&&r.gr!=null){const e=essai(lv,r.gr);if(e)return{e,lv};}
  const LV=lv!=null&&d.paliers[lv]?[lv]:r.o==="examen blanc"?d.paliers.map((p,k)=>k):[];
  for(const l of LV)for(let k=0;k<60;k++){const e=r.o==="examen blanc"?essai(l,h(r.xb+"|"+d.id+"|"+k)):i>=0?essai(l,h(d.id+"|"+l+"|"+i+"|"+k)):null;if(e)return{e,lv:l};}
  return{lv:LV.length===1?lv:etat(d.id).lv};}
function refaire(id){stop();$("#main").className="";$("#main").innerHTML=`<div class="page"><p class="muted">Lecture du carnet des réponses…</p></div>`;
  A.allReps().then(L=>{const r=L.find(x=>x&&x.id===id),d=r&&GEN.par[r.g];
    if(!d||!SUBJ[r.s]||!A.inScope(SUBJ[r.s],d)){location.replace("#/entrainer/erreurs");return;}
    const x=retrouve(r,d);debut("g",d,false,x.e?{e:x.e,lv:x.lv,re:"meme"}:{e:tirage(d,x.lv,etat(d.id)),lv:x.lv,re:"semblable"});});}

/* ---------- examen blanc : un sujet tiré dans les générateurs, un chrono, la correction seulement à la fin ----------
   La copie en cours est gardée sur l'appareil (localStorage) : une page fermée ou rechargée la retrouve, et le chrono continue.
   À la fin : un événement « tr » par exercice (m:"xb"), un événement « xb » pour la note, et le détail dans le carnet. */
const XK="rev-s1-examen";
let X=null,XE={id:null,L:{}},XT=0,LISTE=null;
const xLit=()=>{try{const x=JSON.parse(localStorage.getItem(XK)||"null");return x&&Array.isArray(x.Q)&&x.Q.length&&x.Q.every(q=>GEN.par[q.g]&&SUBJ[q.s])?x:null;}catch(e){return null;}};
const xGarde=()=>{try{localStorage.setItem(XK,JSON.stringify(X));}catch(e){}};
const xExo=k=>{if(XE.id!==X.id)XE={id:X.id,L:{}};return XE.L[k]||(XE.L[k]=GEN.tire(GEN.par[X.Q[k].g],X.Q[k].lv,X.Q[k].gr));};
const xReste=()=>X.t0+X.dur-Date.now();
const xTemps=()=>{const n=Date.now();if(XT&&X.phase==="sujet")X.tq[X.cur]=(X.tq[X.cur]||0)+(n-XT);XT=n;};
const plein=v=>v==null?false:typeof v==="string"?v.trim()!=="":typeof v==="object"?Object.values(v).some(plein):!!v;
const hmin=m=>{m=Math.round(m);return m>=60?`${Math.floor(m/60)} h${m%60?" "+String(m%60).padStart(2,"0"):""}`:`${m} min`;};
const xDuree=ms=>ms>=3600e3?hmin(ms/60e3):duree(ms),quart=x=>Math.round(x*4)/4;
const ptsTxt=p=>`${virg(p)} ${p>=2?"points":"point"}`;
const dureeEp=S=>{const e=A.exam(S),m=e.end&&e.start?A.mm(e.end)-A.mm(e.start):0;return m>0?m:60;};
const xNoms=x=>x.sids.map(s=>SUBJ[s].name).join(", ");
const xMontre=()=>X.phase==="sujet"?xDessine():X.phase==="papier"?xPapier():xResultat();

function xTire(d,lv,base,evite){const g=etat(d.id);let autre=null,der=null;
  for(let k=0;k<60;k++){const gr=parseInt(GEN.outils.hache(base+"|"+d.id+"|"+k),36),e=GEN.tire(d,lv,gr);der={e,gr};if(evite[e.cle])continue;if(!g.vu[e.cle]){evite[e.cle]=1;return der;}if(!autre)autre=der;}
  const r=autre||der;evite[r.e.cle]=1;return r;}
/* le sujet d'une matière : les chapitres de sa prochaine épreuve, chacun avec un temps à la mesure de ses points au vrai sujet.
   On sert toujours le chapitre le plus en retard sur son temps ; une méthode ne revient une 2e fois que si son chapitre en a encore besoin. */
function xCompose(sid,court,base,evite){const S=SUBJ[sid],R=GEN.outils.alea(parseInt(GEN.outils.hache(base+"|"+sid),36)),D=Math.round(dureeEp(S)*(court?0.5:1)),G={},m=d=>ccMin(d,dernier(d));
  defs(sid).filter(d=>d.blanc!==false).forEach(d=>{const T=theme(d),k=T?T.id:"-"+d.id;(G[k]=G[k]||{pts:(T&&T.pts)||d.pts||1,L:[],u:0}).L.push(d);});
  const TH=Object.values(G),tot=TH.reduce((s,x)=>s+x.pts,0),nb={},pris=[];let libre=D;
  /* les rédactions les moins travaillées passent d'abord : d'un sujet à l'autre, ce ne sont pas les mêmes */
  TH.forEach(x=>{x.b=D*x.pts/tot;x.L=R.mel(x.L).sort((a,b)=>(a.fixe?etat(a.id).n:0)-(b.fixe?etat(b.id).n:0));});
  for(let tour=1;tour<=4;tour++)for(;;){
    const C=TH.map(x=>({x,d:x.L.find(d=>(nb[d.id]||0)<tour&&m(d)<=libre&&(tour===1||(!d.fixe&&x.b-x.u>=m(d)/2)))})).filter(c=>c.d).sort((a,b)=>(b.x.b-b.x.u)-(a.x.b-a.x.u))[0];
    if(!C)break;nb[C.d.id]=(nb[C.d.id]||0)+1;C.x.u+=m(C.d);libre-=m(C.d);pris.push(C.d);}
  const rang=d=>{const T=theme(d);return (d.fixe?0:1000)+(T?(S.themes||[]).indexOf(T):900);};
  pris.sort((a,b)=>rang(a)-rang(b));
  return {D,min:D-libre,Q:pris.map((d,i)=>{const lv=dernier(d),t=xTire(d,lv,base+"|"+i,evite);return {s:sid,g:d.id,lv,gr:t.gr,min:m(d),pap:t.e.papier?1:0};})};}
/* le sujet entier : les points suivent le temps prévu de chaque exercice, pour un total de 20 */
function xSujet(sids,court,base){const evite={},P=sids.map(s=>xCompose(s,court,base,evite)),Q=P.flatMap(p=>p.Q),tm=Q.reduce((s,q)=>s+q.min,0),pas=Q.length>20?0.25:0.5;
  /* le chrono : la durée de l'épreuve, ou moins quand le site n'a pas assez d'exercices pour la remplir */
  const durs=P.map(p=>p.min<0.8*p.D?Math.ceil(p.min/5)*5:p.D);let reste=Math.round(20/pas);
  Q.forEach(q=>{q.b=20*q.min/tm/pas;q.u=Math.max(1,Math.round(q.b));reste-=q.u;});
  while(reste!==0){const s=reste>0?1:-1,C=Q.filter(q=>s>0||q.u>1).sort((a,b)=>s*((b.b-b.u)-(a.b-a.u)))[0];if(!C)break;C.u+=s;reste-=s;}
  Q.forEach(q=>{q.pts=q.u*pas;delete q.u;delete q.b;});
  return {Q,P,durs,dur:durs.reduce((s,x)=>s+x,0)};}

function xHisto(){const E=A.journal().filter(e=>e.k==="xb"&&Array.isArray(e.sids)).reverse();if(!E.length)return "";
  return `<section class="sec"><h2><span>Tes examens blancs</span></h2><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Jour</th><th>Matières</th><th>Note</th><th>Temps</th></tr></thead><tbody>${E.map(e=>`<tr><td>${A.dayName(A.ymd(new Date(e.t)),false,true)}</td><td>${e.sids.filter(s=>SUBJ[s]).map(s=>SUBJ[s].name).join(", ")}${e.c&&e.sids.length===1?" (version courte)":""}</td><td><b>${virg(e.n)}</b> sur 20</td><td>${xDuree(e.ms)} sur ${hmin(e.d/60e3)}</td></tr>`).join("")}</tbody></table></div>${X&&X.phase==="fini"?`<p class="gomore"><a href="#/entrainer/examen/copie">Revoir le corrigé du dernier</a></p>`:""}</section>`;}
/* les cartes : une par prochaine épreuve (comme le vrai, ou court), le multi-matières à part, l'examen en cours en haut.
   Le sujet d'une carte est tiré une fois (jusqu'au prochain exercice fait) : ce qu'elle annonce est ce qui s'ouvre. */
const xHeure=h=>{const[a,b]=(h||"").split(":");return a?(+a)+"h"+(b&&b!=="00"?b:""):"";};
const xSujetDe=(sid,court)=>xMemo("s:"+sid+":"+(court?1:0),()=>{const base=A.nouvRun();return Object.assign(xSujet([sid],court,base),{base});});
const xTitre=x=>x.sids.length>1?"Multi-matières":`${A.exam(SUBJ[x.sids[0]]).label||"Épreuve"} ${SUBJ[x.sids[0]].name}${x.court?" · court":""}`;
const xEnCours=()=>{const x=xLit();return x&&x.phase!=="fini"?x:null;};
function xCarte(sid,bloque){const S=SUBJ[sid],ex=A.exam(S),D=dureeEp(S),s=xSujetDe(sid,false),np=s.Q.filter(q=>q.pap).length,dis=bloque?" disabled":"";
  const meta=!s.Q.length?"Le site n'a pas encore d'exercices pour cette épreuve.":`${hmin(s.dur)} · ${s.Q.length} ${plur(s.Q.length,"exercice")}${np?`, dont ${np} sur papier`:""}${s.dur<D?` (le vrai dure ${hmin(D)} : le site n'a pas encore de quoi le remplir)`:""}`;
  return `<div class="xc s-${sid}"><span class="xc-k">${ex.label||"Épreuve"} · ${ex.report?"reporté, date à venir":A.dayName(ex.day,false,true)+(ex.start?" · "+xHeure(ex.start):"")}</span><h3>${S.name}</h3><span class="xc-m">${meta}</span>${s.Q.length?`<div class="acts"><button type="button" class="btn pri" data-xb="${sid}" data-c="0"${dis}>Comme le vrai · ${hmin(s.dur)}</button><button type="button" class="btn" data-xb="${sid}" data-c="1"${dis}>Court · ${hmin(xSujetDe(sid,true).dur)}</button></div>`:""}</div>`;}
function xCartes(premier,page){const x=xEnCours(),n=A.NOW(),L=matieres(),pro=L.filter(s=>A.examStart(SUBJ[s])>n);
  const vus=(premier&&L.includes(premier)?[premier]:[]).concat(pro.filter(s=>s!==premier)).slice(0,3),autres=L.filter(s=>!vus.includes(s));
  const r=x&&x.phase==="sujet"?x.t0+x.dur-Date.now():0;
  return `${x?`<div class="xc xc-encours ${x.sids.length>1?"c-violet":"s-"+x.sids[0]}"><span class="xc-k">En cours · ${r>0?"il reste "+hmin(Math.max(1,Math.ceil(r/60e3))):"le temps est fini"}</span><h3>${xTitre(x)}</h3>${r>0?"":`<span class="xc-m">Il te reste à noter ta copie.</span>`}<div class="acts"><a class="btn pri" href="#/entrainer/examen/copie">${r>0?"Reprendre":"Noter ma copie"}</a>${page?`<button type="button" class="btn" id="xb-abandon">Abandonner cet examen</button>`:""}</div></div>`:""}
   <p class="muted xc-intro">${x?`Pour en commencer un autre, finis celui-ci${page?" ou abandonne-le":` ou abandonne-le depuis <a href="#/entrainer/examen">la page Examen blanc</a>`}.`:"Tes prochaines épreuves : un sujet neuf à leur forme."}</p>
   <div class="xcartes">${vus.map(s=>xCarte(s,x)).join("")}</div>
   ${autres.length?`<details class="xc-autres"><summary>Les autres matières (${autres.length})</summary><div class="xcartes" data-autres="${autres.join(",")}"></div></details>`:""}
   <div class="xc c-violet xc-multi"><span class="xc-k">Plusieurs matières</span><h3>Multi-matières</h3><span class="xc-m">Une épreuve courte par matière cochée, un seul chrono</span><div class="acts"><a class="btn" href="#/entrainer/examen/multi">Choisir les matières</a></div></div>`;}
function xBloc(){const der=A.journal().filter(e=>e.k==="xb").pop();
  return `<section class="tiroir xb-bloc"><h2 class="tiroir__title">Examen blanc</h2>${xCartes()}${der?`<p class="gomore">Dernier examen blanc : ${virg(der.n)} sur 20, ${A.dayName(A.ymd(new Date(der.t)),false,true)}. <a href="#/entrainer/examen">Tous tes examens blancs</a></p>`:""}</section>`;}
function xLance(sid,court){if(xEnCours())return;const s=xSujetDe(sid,court);if(!s.Q.length)return;
  X={id:s.base,mode:"une",sids:[sid],court:court?1:0,t0:Date.now(),dur:s.dur*60e3,cur:0,Q:s.Q,rep:{},tq:s.Q.map(()=>0),phase:"sujet"};XT=0;xGarde();XM.k="";location.hash="#/entrainer/examen/copie";}
function xPage(premier){$("#main").className="";
  $("#main").innerHTML=`<div class="page"><a class="back" href="#/entrainer">‹ S'entraîner</a><div class="title-row"><h1>Examen blanc</h1></div>
   <p class="lead">Un sujet neuf à chaque fois, tiré dans tes exercices d'entraînement et tes démonstrations, à la forme de ta prochaine épreuve : sa durée, seulement les chapitres à son programme, une note sur 20.</p>
   <section class="tiroir xb-bloc">${xCartes(premier,true)}</section>
   <div class="paper"><b>Les conditions de l'épreuve.</b><div>Une feuille, un stylo, pas de cours ni de fiches. Aucun indice ; la correction et la note arrivent seulement à la fin. Tu peux rendre ta copie avant la fin. Le chrono ne s'arrête pas : si tu fermes la fenêtre de l'examen, tu retrouves ta copie, et le temps a continué.</div></div>${xHisto()}</div>`;
  const ab=$("#xb-abandon");if(ab)ab.addEventListener("click",()=>{if(!ab.dataset.sur){ab.dataset.sur="1";ab.textContent="Confirmer : effacer cette copie";return;}
    try{localStorage.removeItem(XK);}catch(e){}X=null;xPage(premier);});
  window.scrollTo(0,0);}

/* le multi-matières : on coche les matières ; le sujet est tiré dès qu'on coche, pour annoncer ce qu'il contient */
function xChoix(sid0){const M=matieres(),base=A.nouvRun();let sel=(sid0||"").split(",").filter(s=>M.includes(s)),suj=null;
  $("#main").className="";
  $("#main").innerHTML=`<div class="page"><a class="back" href="#/entrainer/examen">‹ Examen blanc</a><div class="title-row"><h1>Examen blanc multi-matières</h1></div>
   <p class="lead">Une épreuve courte par matière cochée (la moitié de sa vraie durée), à la suite, avec un seul chrono et une note sur 20. Le sujet est neuf à chaque fois.</p>
   <p><b>Les matières (au moins deux)</b></p><div class="filters" id="xb-sid">${M.map(s=>`<button type="button" class="btn" data-v="${s}" aria-pressed="${sel.includes(s)}">${SUBJ[s].name}</button>`).join("")}</div>
   <p id="xb-res" aria-live="polite"></p>
   <div class="paper"><b>Les conditions de l'épreuve.</b><div>Une feuille, un stylo, pas de cours ni de fiches. Aucun indice ; la correction et la note arrivent seulement à la fin. Tu peux rendre ta copie avant la fin. Le chrono ne s'arrête pas : si tu fermes la fenêtre de l'examen, tu retrouves ta copie, et le temps a continué.</div></div>
   <div class="acts"><button class="btn pri big" id="xb-go" disabled>Commencer l'examen</button></div></div>`;
  const choisies=()=>M.filter(s=>sel.includes(s));
  const maj=()=>{const L=choisies(),r=$("#xb-res");suj=L.length>=2?xSujet(L,true,base):null;
    $("#xb-go").disabled=!(suj&&suj.Q.length);
    if(!suj){r.textContent="Coche au moins deux matières.";return;}
    if(!suj.Q.length){r.textContent="Le site n'a pas encore d'exercices à tirer pour ces épreuves.";return;}
    const np=suj.Q.filter(q=>q.pap).length;
    const court2=L.map((s,i)=>suj.durs[i]<suj.P[i].D?`Le site n'a pas encore assez d'exercices pour remplir l'épreuve de ${SUBJ[s].name} : ${hmin(suj.durs[i])} au lieu de ${hmin(suj.P[i].D)}.`:"").filter(Boolean).join(" ");
    r.innerHTML=`<b>${L.length} matières</b> : ${suj.Q.length} ${plur(suj.Q.length,"exercice")} en ${hmin(suj.dur)}${np?`, dont ${np} à rédiger sur papier`:""}. ${L.map((s,i)=>`${SUBJ[s].name} : ${hmin(suj.durs[i])}`).join(", ")}. ${court2}`;};
  $("#xb-sid").addEventListener("click",ev=>{const b=ev.target.closest("button");if(!b)return;const v=b.dataset.v;sel=sel.includes(v)?sel.filter(x=>x!==v):sel.concat(v);
    $("#xb-sid").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",sel.includes(x.dataset.v)));maj();});
  $("#xb-go").addEventListener("click",()=>{if(!suj||!suj.Q.length)return;
    X={id:base,mode:"multi",sids:choisies(),court:1,t0:Date.now(),dur:suj.dur*60e3,cur:0,Q:suj.Q,rep:{},tq:suj.Q.map(()=>0),phase:"sujet"};XT=0;xGarde();location.hash="#/entrainer/examen/copie";});
  maj();window.scrollTo(0,0);}
function xRemplir(b,e,rep){if(!rep)return;
  e.champs.forEach(c=>{const z=b.querySelector(`[data-ch="${c.id}"]`);
    if(c.k==="choix"){if(z)z.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===rep[c.id]));}
    else if(c.k==="cases"){const o=rep[c.id]||{};if(z)z.querySelectorAll("input").forEach(i=>{i.value=o[i.dataset.n]||"";});}
    else if(c.k==="multi"){const L=rep[c.id]||[];b.querySelectorAll(`[data-multi="${c.id}"] button`).forEach(x=>x.setAttribute("aria-pressed",L.includes(x.dataset.v)));}
    else if(c.k==="champ"||c.k==="code"){const i=z&&z.querySelector("input,textarea");if(i)i.value=rep[c.id]||"";}
    else if(c.k==="trace"||c.k==="vf"){const T=rep[c.id]||[],tb=z&&z.querySelector("tbody");if(!tb)return;
      if(c.k==="trace"){while(tb.children.length<T.length)tb.insertAdjacentHTML("beforeend",ligneTrace(c,tb.children.length));while(tb.children.length>Math.max(1,T.length))tb.lastElementChild.remove();}
      [...tb.children].forEach((tr,r)=>tr.querySelectorAll("input").forEach((i,k)=>{i.value=(T[r]||[])[k]||"";}));}
    else if(c.k==="trous")c.ids.forEach(id=>{const i=b.querySelector(`input[data-c="${id}"]`);if(i)i.value=rep[id]||"";});});}
/* ---------- la copie : une fenêtre posée au milieu du site assombri, le sujet entier à la suite ----------
   Elle reste dans la fenêtre du navigateur : au PC, Rnote reste utilisable à côté, et dans une colonne étroite elle se lit encore. */
const xCls=()=>X.sids.length>1?"c-violet":"s-"+X.sids[0];
function xFenetre(kick,droite,corps){let v=$("#xb-voile");
  if(!v){v=document.createElement("div");v.id="xb-voile";v.className="xb-voile";document.body.append(v);}
  document.documentElement.classList.add("xb-ouvert");
  v.innerHTML=`<div class="xb-fen ${xCls()}" role="dialog" aria-modal="true" aria-label="Examen blanc · ${esc(xTitre(X))}" tabindex="-1"><div class="xb-haut"><button type="button" class="lp-x" id="xb-x" aria-label="Fermer : ta copie est gardée, le chrono continue">✕</button><span class="lp-kicker">${kick}</span>${droite}<span class="xb-fine"><i></i></span></div><div class="xb-corps" id="xb-corps">${corps}</div></div>`;
  $("#xb-x").addEventListener("click",()=>{location.hash="#/entrainer";});
  v.firstElementChild.focus({preventScroll:true});return $("#xb-corps");}
function xFerme(){const v=$("#xb-voile");if(v)v.remove();document.documentElement.classList.remove("xb-ouvert");}
function xSauveK(k){const z=$(`#xb-voile .xb-exo[data-k="${k}"]`);if(!X||X.phase!=="sujet"||!z)return;const e=xExo(k);
  if(e.papier){const p=z.querySelector("[data-pap]");if(p&&p.getAttribute("aria-pressed")==="true")X.rep[k]={fait:1};else delete X.rep[k];}
  else{const r=lire(e,z);if(plein(r))X.rep[k]=r;else delete X.rep[k];}
  const s=$(`#xb-nav [data-k="${k}"]`);if(s)s.classList.toggle("ok",!!X.rep[k]);}
function xSauve(){if(!X||X.phase!=="sujet"||!$("#xb-voile .xb-exo"))return;xTemps();X.Q.forEach((q,k)=>xSauveK(k));xGarde();}
/* le temps passé va à l'exercice qu'on regarde (ou dans lequel on écrit) */
function xVoit(k){if(k===X.cur)return;xTemps();X.cur=k;document.querySelectorAll("#xb-nav [data-k]").forEach(b=>b.toggleAttribute("aria-current",+b.dataset.k===k));xGarde();}
function xVa(k,net){const c=$("#xb-corps"),z=c&&c.querySelector(`.xb-exo[data-k="${k}"]`);if(!z)return;c.scrollTo({top:z.offsetTop-12,behavior:net?"auto":"smooth"});xVoit(k);}
let XR=0;
function xSuit(c){const L=c.querySelectorAll(".xb-exo"),lim=c.getBoundingClientRect().top+c.clientHeight*0.35;let k=0;L.forEach(z=>{if(z.getBoundingClientRect().top<=lim)k=+z.dataset.k;});xVoit(k);}
function xTic(){const c=$("#en-chrono");if(!c||!X||X.phase!=="sujet")return stop();const r=xReste();
  if(r<=0){xSauve();xCorrige(true);return xMontre();}
  xTemps();c.textContent=horloge(r);const f=c.closest(".xb-fen");
  if(f){f.classList.toggle("xb-amb",r<=10*60e3&&r>5*60e3);f.classList.toggle("xb-rouge",r<=5*60e3);const i=f.querySelector(".xb-fine i");if(i)i.style.width=Math.max(0,Math.min(100,r/X.dur*100))+"%";}
  if(Math.floor(r/1000)%5===0)xGarde();}
const xChrono=()=>`<span class="xb-tps" id="en-chrono"></span>`;
function xDessine(){const multi=X.sids.length>1,S0=SUBJ[X.sids[0]],ex=A.exam(S0),n=X.Q.length;
  const tete=multi?`<h2>Examen blanc multi-matières</h2><span class="xb-cd">${xNoms(X)} · durée ${hmin(X.dur/60e3)} · pas de cours ni de fiches · ${n} exercices, noté sur 20</span>`
    :`<h2>${ex.label||"Épreuve"} · ${S0.name}${X.court?" (version courte)":""}</h2><span class="xb-cd">Durée ${hmin(X.dur/60e3)} · documents : ${S0.docs||"aucun"} · ${n} ${plur(n,"exercice")}, noté sur 20</span>`;
  let h=`<div class="xb-tete"><span class="xb-u">Université de Montpellier · L1 maths-info · examen blanc</span>${tete}</div>`;
  X.Q.forEach((q,k)=>{const e=xExo(k);
    if(multi&&(!k||X.Q[k-1].s!==q.s))h+=`<h3 class="xb-partie s-${q.s}">${SUBJ[q.s].name}</h3>`;
    h+=`<section class="xb-exo s-${q.s}" data-k="${k}"><div class="xb-eh"><h3>Exercice ${k+1}</h3><span${e.papier?' class="pap"':""}>${ptsTxt(q.pts)}${e.papier?" · sur papier":""}</span></div><p class="lq">${e.qNeutre||e.q}</p><div>${e.papier&&e.corpsPapier!=null?e.corpsPapier:e.corps}</div>${e.papier
      ?`<div class="xb-papier"><span>✎ À rédiger sur ta feuille, comme ${auCC(SUBJ[q.s])} · environ ${q.min} min</span><button type="button" class="btn" data-pap aria-pressed="${!!X.rep[k]}">Je l'ai rédigé</button></div>`
      :`<div class="en-rep">${champsHTML(e)}</div>`}</section>`;});
  h+=`<div class="acts xb-fin"><button type="button" class="btn pri big" id="xb-rendre">Rendre ma copie</button></div><p class="kbdhint">Aucun indice : la correction et la note arrivent à la fin. Si tu fermes cette fenêtre, ta copie est gardée ; le chrono, lui, continue.</p>`;
  const nav=`<nav class="xb-som" id="xb-nav" aria-label="Les exercices">${X.Q.map((q,k)=>`<button type="button" data-k="${k}" class="${X.rep[k]?"ok":""}"${k===X.cur?" aria-current":""}>Exercice ${k+1}<i>✓</i></button>`).join("")}</nav>`;
  const c=xFenetre(xTitre(X),xChrono(),`<div class="xb-grille">${nav}<div class="xb-sujet">${tx(h)}</div></div>`);
  c.querySelectorAll(".xb-exo").forEach(z=>{const k=+z.dataset.k,e=xExo(k);if(e.papier)return;
    xRemplir(z,e,X.rep[k]);ecoute(z,e,()=>false,()=>{});z.querySelectorAll("input.en-large").forEach(i=>{if(i.value)i.dispatchEvent(new Event("input",{bubbles:true}));});});
  const maj=z=>{xSauveK(+z.dataset.k);xGarde();};
  c.addEventListener("input",ev=>{const z=ev.target.closest(".xb-exo");if(z)maj(z);});
  c.addEventListener("click",ev=>{const p=ev.target.closest("[data-pap]");if(p)p.setAttribute("aria-pressed",p.getAttribute("aria-pressed")!=="true");
    const s=ev.target.closest("#xb-nav [data-k]");if(s)return xVa(+s.dataset.k);
    const z=ev.target.closest(".xb-exo");if(z){xVoit(+z.dataset.k);setTimeout(()=>maj(z),0);}});
  c.addEventListener("focusin",ev=>{const z=ev.target.closest(".xb-exo");if(z)xVoit(+z.dataset.k);});
  c.addEventListener("scroll",()=>{if(!XR)XR=requestAnimationFrame(()=>{XR=0;if(X&&X.phase==="sujet")xSuit(c);});},{passive:true});
  $("#xb-rendre").addEventListener("click",xRendre);
  longues(c);if(X.cur)xVa(X.cur,true);
  XT=Date.now();stop();xTic();TIC=setInterval(xTic,1000);}
/* avant de rendre : ce qui est resté sans réponse, et ce que le site n'arrive pas à lire (sans dire si c'est juste) */
function xRendre(){xSauve();stop();const vides=[],flou=[];
  X.Q.forEach((q,k)=>{const e=xExo(k),rep=X.rep[k];if(!rep)return vides.push(k+1);if(e.papier)return;let j=null;try{j=e.juge(rep);}catch(x){}if(j&&j.incomplet)flou.push([k+1,A.brut(j.incomplet)]);});
  xFenetre(xTitre(X),xChrono(),`<div class="xb-rendre"><h2>Rendre ta copie ?</h2><p>Une fois la copie rendue, tu ne peux plus rien changer.</p>${vides.length?`<p>Sans réponse : ${plur(vides.length,"l'exercice","les exercices")} ${vides.join(", ")}.</p>`:`<p>Tu as répondu à tous les exercices.</p>`}${flou.map(([k,m])=>`<p>Exercice ${k}, réponse incomplète ou que le site n'arrive pas à lire : ${esc(m)}</p>`).join("")}<div class="acts xb-fin"><button class="btn" id="xb-retour">Revenir à ma copie</button><button class="btn pri big" id="xb-oui">Rendre ma copie</button></div></div>`);
  $("#xb-retour").addEventListener("click",xDessine);$("#xb-oui").addEventListener("click",()=>{xCorrige(false);xMontre();});
  xTic();if(X.phase==="sujet")TIC=setInterval(xTic,1000);}

/* ---------- la fin : jugement des réponses à l'écran, barème coché pour les rédactions, puis la note ---------- */
function xCorrige(auto){stop();xTemps();X.fin=Math.min(Date.now(),X.t0+X.dur);X.auto=auto?1:0;
  X.res=X.Q.map((q,k)=>{const e=xExo(k),rep=X.rep[k];if(e.papier)return {pap:1};if(!rep)return {ok:0,vide:1};
    let j;try{j=e.juge(rep);}catch(x){j={ok:false};}return j.incomplet?{ok:0,inc:A.brut(j.incomplet)}:{ok:j.ok?1:0};});
  X.phase="papier";if(!X.res.some(r=>r.pap))xFinir();xGarde();}
function xPapier(){const k=X.res.findIndex(r=>r.pap&&r.note==null),q=X.Q[k],e=xExo(k),S=SUBJ[q.s],L=X.res.filter(r=>r.pap),fait=L.filter(r=>r.note!=null).length,tot=e.etapes.reduce((s,x)=>s+x.pts,0)||1;
  const c=xFenetre(`Noter ta copie · ${S.name}`,`<span class="lp-n">${fait+1} sur ${L.length}</span>`,`<div class="xb-note" id="lpb"></div>`),b=$("#lpb");
  c.closest(".xb-fen").classList.add("xb-prog");c.closest(".xb-fen").querySelector(".xb-fine i").style.width=fait/L.length*100+"%";
  b.innerHTML=tx(`<p class="prekick">${X.auto?"Le temps est écoulé":"Copie rendue"} · note ce que tu as rédigé, avec le barème</p><div class="xb-eh"><h3>Exercice ${k+1}</h3><span class="pap">${ptsTxt(q.pts)} · sur papier</span></div><p class="lq">${e.qNeutre||e.q}</p><div>${e.corpsPapier!=null?e.corpsPapier:e.corps}</div><h3>La correction : coche ce que tu as écrit</h3><div class="pcheck">${e.etapes.map((x,i)=>`<label><input type="checkbox" data-k="${i}"><span>${x.w}</span><b>${virg(x.pts)}</b></label>`).join("")}</div><div class="verdict info" id="en-note"></div><div class="acts xb-fin"><button class="btn" id="xb-nul">Je ne l'ai pas fait</button><button class="btn pri big" id="en-noter">Enregistrer ma note</button></div>`);
  const coche=()=>[...b.querySelectorAll(".pcheck input")].map(i=>i.checked),note=C=>C.reduce((s,c,i)=>s+(c?e.etapes[i].pts:0),0);
  const maj=()=>{const v=note(coche());$("#en-note").textContent=`Note de l'exercice : ${virg(v)} sur ${virg(tot)}, soit ${virg(quart(q.pts*v/tot))} sur ${virg(q.pts)} à l'examen.`;};
  const pose=C=>{const r=X.res[k];r.note=note(C);r.tot=tot;r.coche=C.map(c=>c?1:0);if(!X.res.some(x=>x.pap&&x.note==null))xFinir();xGarde();xMontre();};
  b.querySelector(".pcheck").addEventListener("change",maj);maj();
  $("#en-noter").addEventListener("click",()=>pose(coche()));$("#xb-nul").addEventListener("click",()=>pose(e.etapes.map(()=>false)));
  longues(b);}
/* la note, et la suite pour chaque méthode : l'exercice raté repart dans l'entretien (voir etats et entretien) */
function xFinir(){const run=A.nouvRun();let note=0,nok=0;
  X.Q.forEach((q,k)=>{const d=GEN.par[q.g],e=xExo(k),r=X.res[k],rep=X.rep[k],N=d.paliers.length,part=r.pap?r.note/r.tot:r.ok,ok=r.pap?(part>=0.8-1e-9?1:0):r.ok,av=Object.assign({},etat(d.id));
    r.ok=ok;r.got=quart(q.pts*part);note+=r.got;nok+=ok;
    let j=null;if(!r.pap&&!ok&&rep&&!r.inc){try{j=e.juge(rep);}catch(x){}}
    const dg=j&&j.diag?j.diag:null,ev={k:"tr",s:q.s,g:d.id,lv:q.lv,r:ok,m:"xb",ms:X.tq[k]||0,sg:e.cle};if(r.pap)ev.pap=1;if(!ok){ev.to=palierDepart(d);if(e.nature)ev.na=e.nature;}if(dg&&dg.type)ev.ty=dg.type;
    A.emit(ev);
    if(d.th)A.emit({k:"diag",s:q.s,th:d.th,ok:Math.round((ok?(q.lv+1)/N:0.6*q.lv/N)*100)/100,n:1,run});
    A.logRep(Object.assign({o:"examen blanc",xb:X.id,n:k+1,s:q.s,g:d.id,methode:d.t,ok,pts:q.pts,obtenu:r.got,ms:X.tq[k]||0,tempsCC:q.min,enonce:e.texte,bonne:e.bonneTxt,cle:e.cle,gr:e.gr,lv:q.lv},
      r.pap?{papier:1,note:r.note,noteSur:r.tot,lignesManquantes:e.etapes.filter((x,i)=>!r.coche[i]).map(x=>A.brut(x.w).slice(0,160))}
       :{reponse:r.vide?"(pas de réponse)":repTexte(e,rep)+(r.inc?" (incomplète)":""),etape:dg?dg.titre:null,erreur:dg?dg.type:null,explication:dg?A.brut(dg.msg):null}));
    if(SUBJ[q.s].TB["en-"+d.id]&&av.val&&!etat(d.id).val)A.emit({k:"task",s:q.s,x:"en-"+d.id,v:false});});
  X.note=quart(note);X.nok=nok;X.phase="fini";
  A.emit({k:"xb",x:X.id,sids:X.sids,c:X.court,n:X.note,ms:X.fin-X.t0,d:X.dur,nq:X.Q.length,ok:nok});
  /* l'étape « examen blanc » du planning est faite pour cette épreuve */
  X.sids.forEach(s=>{const t=SUBJ[s].TB[(X.sids.length>1?"xbm-":"xb-")+A.exam(SUBJ[s]).id];if(t)A.emit({k:"task",s,x:t.id,v:true});});}
function xResultat(){xFerme();const n=X.Q.length,multi=X.sids.length>1,rates=n-X.nok,TH={};
  X.Q.forEach((q,k)=>{const d=GEN.par[q.g],T=theme(d),c=q.s+"|"+(T?T.id:d.id),o=TH[c]||(TH[c]={s:q.s,t:T?T.t:d.t,got:0,pts:0});o.got+=X.res[k].got;o.pts+=q.pts;});
  const parEx=X.Q.map((q,k)=>{const r=X.res[k];return `<tr><td>${k+1}</td><td>${multi?SUBJ[q.s].name+" · ":""}${GEN.par[q.g].t}</td><td><b>${virg(r.got)}</b> sur ${virg(q.pts)}</td><td>${X.tq[k]?duree(X.tq[k]):"pas ouvert"} (prévu : ${q.min} min)</td></tr>`;}).join("");
  const parCh=X.sids.map(s=>{const L=Object.values(TH).filter(o=>o.s===s),g=L.reduce((a,o)=>a+o.got,0),p=L.reduce((a,o)=>a+o.pts,0);
    return (multi?`<tr><td><b>${SUBJ[s].name}</b></td><td><b>${virg(g)}</b> sur ${virg(p)}, soit ${virg(Math.round(g/p*80)/4)} sur 20</td></tr>`:"")+L.map(o=>`<tr><td>${o.t}</td><td><b>${virg(o.got)}</b> sur ${virg(o.pts)}</td></tr>`).join("");}).join("");
  const corr=X.Q.map((q,k)=>{const d=GEN.par[q.g],e=xExo(k),r=X.res[k],rep=X.rep[k],lm=lienMethode(d);let j=null;if(!r.pap&&!r.ok&&rep&&!r.inc){try{j=e.juge(rep);}catch(x){}}
    const mot=r.pap?`noté ${virg(r.note)} sur ${virg(r.tot)} avec le barème`:r.vide?"pas de réponse":r.inc?"réponse incomplète":r.ok?"juste":"faux",dg=j&&j.diag?j.diag:null;
    return `<details class="ex" data-k="${k}"${r.ok?"":" open"}><summary><span><span class="sub">Exercice ${k+1} · ${virg(r.got)} sur ${virg(q.pts)} · ${mot}</span><br><span class="h">${d.t}</span></span></summary><div class="body"><p class="lq">${e.qNeutre||e.q}</p><div>${r.pap&&e.corpsPapier!=null?e.corpsPapier:e.corps}</div>${r.pap?"":r.vide?"":`<p><b>Ta réponse :</b> ${esc(repTexte(e,rep))}</p>`}${r.inc?`<div class="verdict info">${esc(r.inc)}</div>`:""}${j&&!j.ok&&j.resume?`<div class="verdict no">${j.resume}</div>`:""}${dg?`<div class="expl no"><b>${dg.titre}</b><br>${dg.msg}</div>`:""}${r.pap?`<h3>La correction, avec ce que tu as coché</h3><div class="pcheck">${e.etapes.map((x,i)=>`<label><input type="checkbox" disabled${r.coche[i]?" checked":""}><span>${x.w}</span><b>${virg(x.pts)}</b></label>`).join("")}</div>`:`<p><b>La bonne réponse :</b> ${e.bonne}</p>`}<h3>La correction pas à pas</h3>${etapesHTML(e,dg?dg.etape:-1)}${lm?`<p class="muted">Pour revoir la méthode : ${lm}.</p>`:""}</div></details>`;}).join("");
  $("#main").className=multi?"":"s-"+X.sids[0];
  $("#main").innerHTML=tx(`<div class="page"><a class="back" href="#/entrainer">‹ S'entraîner</a><p class="kick">Examen blanc · ${xNoms(X)}${X.court&&!multi?" · version courte":""}</p><div class="title-row"><h1>${virg(X.note)} sur 20</h1></div>
   <p class="lead">${X.nok} ${plur(X.nok,"exercice")} ${plur(X.nok,"réussi")} sur ${n}, en ${xDuree(X.fin-X.t0)} sur ${hmin(X.dur/60e3)}${X.auto?". Le temps était écoulé : ta copie a été rendue telle quelle":""}.</p>
   <p>${rates?`${rates>1?`Les ${rates} exercices ratés reviennent`:"L'exercice raté revient"} dans l'entretien du jour, dès demain, jusqu'à une réponse juste.`:"Aucun exercice raté : rien ne s'ajoute à ton entretien."} Le résultat est gardé dans ton rapport, et ton niveau estimé en tient compte.</p>
   <section class="sec"><h2><span>Tes points par exercice</span></h2><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>N°</th><th>Méthode</th><th>Points</th><th>Temps</th></tr></thead><tbody>${parEx}</tbody></table></div></section>
   <section class="sec"><h2><span>Tes points par chapitre</span></h2><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Chapitre</th><th>Points</th></tr></thead><tbody>${parCh}</tbody></table></div></section>
   <section class="sec"><h2><span>Le corrigé</span></h2>${corr}</section>
   <div class="acts"><a class="btn pri" href="#/">Retour à aujourd'hui</a><a class="btn" href="#/entrainer/examen/${multi?"multi":"une"}">Un autre examen blanc</a><a class="btn" href="#/entrainer/rapport">Mon rapport</a></div></div>`);
  X.Q.forEach((q,k)=>{const z=$(`details.ex[data-k="${k}"]`),e=xExo(k),rep=X.rep[k]||{};if(!z)return;
    e.champs.forEach(c=>{if(c.k==="trous")c.ids.forEach(id=>{const i=z.querySelector(`input[data-c="${id}"]`);if(i)i.value=rep[id]||"";});});
    z.querySelectorAll("input:not([type=checkbox]),textarea").forEach(i=>{i.disabled=true;});});
  longues($("#main"));A.renderSide();window.scrollTo(0,0);}
/* dans le rapport à copier : chaque examen blanc, et le détail de ce qui a été raté */
function xRapport(L){const vus=new Set(),R=L.filter(r=>r&&r.o==="examen blanc"&&r.xb&&!vus.has(r.id)&&vus.add(r.id)),E=A.journal().filter(e=>e.k==="xb"&&Array.isArray(e.sids));let txt="",h="";
  E.forEach(ev=>{const fx=R.filter(r=>r.xb===ev.x&&!r.ok).sort((a,b)=>a.n-b.n),noms=ev.sids.filter(s=>SUBJ[s]).map(s=>SUBJ[s].name).join(", "),jour=A.dayName(A.ymd(new Date(ev.t))),bilan=`${ev.ok} ${plur(ev.ok,"exercice")} ${plur(ev.ok,"réussi")} sur ${ev.nq}, en ${xDuree(ev.ms)} sur ${hmin(ev.d/60e3)}`;
    txt+=`\n-- ${jour}, ${noms}${ev.c&&ev.sids.length===1?" (version courte)":""} : ${virg(ev.n)} sur 20\n   ${bilan}\n`;
    fx.forEach(r=>{txt+=`   * Exercice ${r.n}, ${SUBJ[r.s]?SUBJ[r.s].name+", ":""}${r.methode} : ${virg(r.obtenu)} sur ${virg(r.pts)}, ${r.ms?duree(r.ms):"pas ouvert"} (prévu : ${r.tempsCC} min)\n     Énoncé : ${r.enonce}\n     ${r.papier?`Sur papier, note : ${virg(r.note)} sur ${virg(r.noteSur)}. Lignes non écrites : ${(r.lignesManquantes||[]).join(" | ")||"aucune"}`:`Sa réponse : ${r.reponse}`}\n     Bonne réponse : ${r.bonne}\n${r.etape?`     ${r.etape} ${r.explication||""}\n`:""}`;});
    h+=`<details class="ex"><summary><span><span class="sub">${virg(ev.n)} sur 20 · ${jour}</span><br><span class="h">${noms}</span></span></summary><div class="body"><p>${bilan.charAt(0).toUpperCase()+bilan.slice(1)}.</p>${fx.map(r=>`<div class="expl no"><b>Exercice ${r.n} · ${esc(r.methode)} · ${virg(r.obtenu)} sur ${virg(r.pts)}</b><br>${esc(r.enonce)}<br>${r.papier?`Sur papier, note : ${virg(r.note)} sur ${virg(r.noteSur)}.`:`Ta réponse : ${esc(r.reponse||"")}`}<br>Bonne réponse : ${esc(r.bonne)}${r.etape?`<br>${esc(r.etape)}`:""}</div>`).join("")||"<p>Aucun exercice raté.</p>"}</div></details>`;});
  return E.length?{txt:`\n=== EXAMENS BLANCS (sujet tiré au hasard, chrono, correction seulement à la fin) ===\n${txt}`,h:`<section class="sec"><h2><span>Examens blancs</span></h2>${h}</section>`}:{txt:"",h:""};}
/* l'examen blanc se propose de lui-même dans le planning (étapes xb-<épreuve> et xbm-<épreuve> de chaque matière, voir brancher) :
   celui d'une matière, dès que chaque chapitre à son programme a ses leçons faites et au moins une méthode essayée ;
   le multi-matières, quand deux épreuves au moins tombent dans les 7 jours et que leurs matières en sont là ; jamais le jour ni la veille d'une épreuve (buildPlan) */
let XM={k:"",v:{}};
const xMemo=(nom,f)=>{const k=A.journal().length+"|"+A.today();if(XM.k!==k)XM={k,v:{}};return nom in XM.v?XM.v[nom]:(XM.v[nom]=f());};
const xPret=sid=>xMemo("p:"+sid,()=>{const G={};defs(sid).filter(d=>!d.fixe).forEach(d=>{const T=theme(d),k=T?T.id:"-"+d.id;(G[k]=G[k]||[]).push(d);});
  const L=Object.values(G);return L.length>0&&L.every(D=>D.some(d=>etat(d.id).n>0)&&!leconsAFaire(D[0]).length);});
const xGroupe=()=>xMemo("g",()=>{const n=A.NOW(),L=matieres().filter(s=>{const j=(A.examStart(SUBJ[s])-n)/864e5;return j>1&&j<=7&&xPret(s);});
  return L.length>=2&&!A.journal().some(e=>e.k==="xb"&&Array.isArray(e.sids)&&e.sids.length>1&&n-new Date(e.t)<7*864e5)?L:[];});
function xEtapes(){A.SIDS.forEach(sid=>{const S=SUBJ[sid];if(!(GEN.defs[sid]||[]).length)return;
  A.examsOf(S).forEach(e=>{/* juste après la dernière leçon : une fois proposé, l'examen blanc passe avant les séries d'exercices qui restent */
    const dl=S.tasks.reduce((k,t,i)=>t.lesson&&!t.late?i:k,-1),der=S.tasks.findIndex(t=>t.last),ou=dl>=0?dl+1:der<0?S.tasks.length:der;
    const une={id:"xb-"+e.id,ex:e.id,xb:1,manual:true,p:1,t:"Examen blanc : un sujet tiré au hasard, puis correction",links:[["#/entrainer/examen/une/"+sid,"Examen blanc"]],quand:()=>xPret(sid)};
    const multi={id:"xbm-"+e.id,ex:e.id,xb:1,manual:true,p:1,t:"Examen blanc multi-matières, puis correction",quand:()=>xGroupe()[0]===sid};
    Object.defineProperty(une,"min",{get:()=>Math.min(105,dureeEp(S)),enumerable:true,configurable:true});
    Object.defineProperty(multi,"min",{get:()=>Math.min(105,xGroupe().reduce((s,x)=>s+Math.round(dureeEp(SUBJ[x])/2),0)||60),enumerable:true,configurable:true});
    Object.defineProperty(multi,"links",{get:()=>[["#/entrainer/examen/multi/"+xGroupe().join(","),"Examen blanc"]],enumerable:true,configurable:true});
    /* cache : tant que ce n'est pas le moment, l'étape n'est dans aucune liste (pas même « Pas encore placé ») */
    [une,multi].forEach((t,k)=>{if(S.TB[t.id])return;t.train=true;Object.defineProperty(t,"cache",{get:()=>!(A.inScope(S,t)&&t.quand()),enumerable:true,configurable:true});S.tasks.splice(ou+k,0,t);S.TB[t.id]=t;});});});}
function xRoute(p){stop();XT=0;X=xLit();
  if(X&&X.phase==="sujet"&&xReste()<=0)xCorrige(true);
  if(p[0]==="copie"){if(!X)return location.replace("#/entrainer/examen");if(X.phase!=="fini"&&LISTE)LISTE();return xMontre();}
  xFerme();
  if(p[0]==="multi"&&!xEnCours())return xChoix(p[1]);
  xPage(p[0]==="une"?p[1]:"");}

/* ---------- branchement sur le site ---------- */
function route(parts){const a=parts[0],b=parts[1];
  if(a==="examen")return xRoute(parts.slice(1));
  if(a==="jour"){if(entretien().length)return debut("jour");stop();
    const pro=A.SIDS.flatMap(sid=>defs(sid)).map(d=>({d,du:echeance(d,etat(d.id))})).filter(x=>x.du).sort((x,y)=>x.du<y.du?-1:1)[0],rp=reportes();
    $("#main").className="";$("#main").innerHTML=`<div class="page"><a class="back" href="#/">‹ Aujourd'hui</a><div class="title-row"><h1>Entretien du jour</h1></div><p class="lead">${rp?`Tes ${MAXJOUR} minutes d'entretien sont faites pour aujourd'hui. ${rp} ${plur(rp,"méthode")} ${plur(rp,"attend","attendent")} demain.`:pro?`Rien à refaire aujourd'hui. Le prochain passage : ${quand(pro.du)} (${pro.d.t}).`:"Rien à refaire pour l'instant : une méthode entre dans l'entretien quand elle est réussie (3 justes de suite au dernier palier)."}</p><div class="acts"><a class="btn pri" href="#/entrainer">Voir les méthodes</a>${rp?`<button class="btn" id="en-tout">Les faire quand même</button>`:""}</div></div>`;
    const et=$("#en-tout");if(et)et.addEventListener("click",()=>debut("jour",null,true));return;}
  if(a==="rapport")return rapport();
  if(a==="erreurs")return erreurs();
  if(a==="refaire"&&b)return refaire(decodeURIComponent(b));
  if(SUBJ[a]&&b&&GEN.par[b]&&GEN.par[b].sid===a&&A.inScope(SUBJ[a],GEN.par[b]))return debut("g",GEN.par[b]);
  if(SUBJ[a]&&defs(a).length)return pageMatiere(a);
  location.replace("#/entrainer");}
/* « M'entraîner sur cette méthode » à la fin des pages méthode et des leçons du thème */
function bouton(){const p=(location.hash||"").slice(2).split("/"),main=$("#main");if(!main||main.querySelector(".en-lien"))return;
  if(SUBJ[p[0]]&&p[1]==="p"){const d=defs(p[0]).find(x=>(x.pages||[]).includes(p[2])),pg=main.querySelector(".page");if(d&&pg)pg.insertAdjacentHTML("beforeend",`<p class="en-lien"><a class="btn pri" href="#/entrainer/${d.sid}/${d.id}">M'entraîner sur cette méthode</a></p>`);}
  else if(p[0]==="lecon"&&SUBJ[p[1]]){const acts=main.querySelector(".lp-end .acts");if(!acts)return;
    const D=defs(p[1]).filter(x=>{const T=theme(x),L=x.lecons||(T&&T.les?T.les.slice(-1):[]);return L.includes(p[2])&&!x.fixe;});
    /* choix 71a : à la fin d'une leçon, un exercice tout de suite, pendant que c'est frais */
    /* choix 74a : la leçon finit sur l'exercice de sa notion du parcours, qui compte dans la jauge du CC */
    let XN=null;try{XN=window.EXPRESS_OUTILS&&EXPRESS_OUTILS.notionsDeLecon(p[1],p[2]);}catch(x){}
    if(XN&&main.querySelector("#lsc")){const n=XN.NS.find(m=>!EXPRESS_OUTILS.bilan(XN.sid,XN.ep).ok[m.id])||XN.NS[0];
      acts.insertAdjacentHTML("beforebegin",`<section class="el-recap en-encore"><p class="prekick">Pour finir : l'exercice ${duCC(SUBJ[p[1]])}</p><p>${n.t}, au niveau ${duCC(SUBJ[p[1]])}, à faire avant de voir la correction. Réussi, il compte dans la jauge ${XN.C.du} (+${String(n.pts).replace(".",",")} point${n.pts>1?"s":""}).</p><div class="acts"><a class="btn pri big en-lien" href="#/express/${XN.sid}/${XN.ep}/notion/${n.id}/exo">L'exercice ${duCC(SUBJ[p[1]])}</a></div></section>`);
      acts.querySelectorAll(".btn.pri").forEach(b=>b.classList.remove("pri","big"));}
    else if(D.length&&main.querySelector("#lsc")){acts.insertAdjacentHTML("beforebegin",`<section class="el-recap en-encore"><p class="prekick">Encore 5 minutes ?</p><p>Un exercice du niveau ${duCC(SUBJ[p[1]])} sur ce que tu viens d'apprendre, pendant que c'est frais : +5 points, et ta série tient.</p><div class="acts"><a class="btn pri big en-lien" href="#/entrainer/${D[0].sid}/${D[0].id}">Un exercice tout de suite</a></div></section>`);
      acts.querySelectorAll(".btn.pri").forEach(b=>b.classList.remove("pri","big"));D.shift();}
    D.forEach(d=>acts.insertAdjacentHTML("beforeend",`<a class="btn en-lien" href="#/entrainer/${d.sid}/${d.id}">${D.length>1||main.querySelector(".en-encore")?"M'entraîner : "+(d.tache||d.t.charAt(0).toLowerCase()+d.t.slice(1)):"M'entraîner sur cette méthode"}</a>`));}}
function brancher(A0,ext){A=A0;
  ext.routes.progres=()=>{stop();pageElan();};
  const liste=ext.routes.entrainer;LISTE=liste;ext.routes.entrainer=parts=>parts&&parts.length?route(parts):(stop(),liste());
  /* l'étape « Entraînement » du planning : après les leçons de son thème, importante seulement quand c'est le moment des exercices */
  Object.values(GEN.par).forEach(d=>{const S=SUBJ[d.sid],t=S&&S.TB&&S.TB["en-"+d.id];if(!t)return;const T=theme(d);
    const p0=Object.getOwnPropertyDescriptor(t,"p"),base=()=>p0&&p0.get?p0.get.call(t):p0?p0.value:1;
    Object.defineProperty(t,"p",{get(){return moment(d)?base():Math.max(3,base());},enumerable:true,configurable:true});
    Object.defineProperty(t,"min",{get(){return dureeTache(d);},enumerable:true,configurable:true});
    if(T&&T.les&&T.les.length){const k=Math.max(...T.les.map(l=>S.tasks.findIndex(x=>x.lesson===l))),moi=S.tasks.indexOf(t);if(k>=0&&moi>k+1){S.tasks.splice(moi,1);S.tasks.splice(k+1,0,t);}}});
  xEtapes();
  A.SIDS.forEach(sid=>SUBJ[sid].tasks.forEach((t,k)=>{t.i=k;}));
  window.addEventListener("pagehide",()=>{try{xSauve();}catch(e){}});
  window.addEventListener("hashchange",()=>{if(location.hash!=="#/entrainer/examen/copie"&&$("#xb-voile")){try{xSauve();}catch(e){}xFerme();}});
  document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest("[data-xb]");if(b&&!b.disabled)xLance(b.dataset.xb,b.dataset.c==="1");});
  document.addEventListener("toggle",ev=>{const z=ev.target.querySelector&&ev.target.querySelector("[data-autres]");if(z&&ev.target.open&&!z.children.length)z.innerHTML=z.dataset.autres.split(",").map(s=>xCarte(s,xEnCours())).join("");},true);
  new MutationObserver(bouton).observe($("#main"),{childList:true,subtree:true});}
const init0=EXT.init;
EXT.init=function(A0){const ext=init0.call(EXT,A0);try{brancher(A0,ext);}catch(e){console.error(e);}return ext;};
/* ---------- revenir chaque jour (ses choix 10a, 11a, 12b, 13b, 14a, 15a et 19a du 20/11) : série, points, rang du jour et récap,
   rejoués depuis le journal, rien n'est gardé à part. La règle de la série : un jour compte s'il n'y a plus d'entretien dû
   (ou 3 entretiens faits) et qu'une chose a fait progresser, ou si c'est un jour d'épreuve ; le premier jour sans de la semaine
   est le repos ; deux jours sans de suite cassent la série, sauf si l'un des deux est le repos ; trois de suite la cassent toujours. */
const BAREME={cch:["Notion du CC réussie",10],cchb:["Sujet express",0],pal:["Exercice juste au palier en cours",5],pl:["Placement réussi",5],monte:["Palier validé",25],val:["Méthode validée",60],rep:["Raté, puis réussi",15],eok:["Entretien dû, fait à temps et juste",20],eko:["Entretien dû, fait mais raté",5],xb:["Examen blanc",0],les:["Leçon finie",15],quiz:["Quiz réussi",10],mix:["Mini-contrôle mélangé",0]};
const PROGRES={monte:1,val:1,rep:1,xb:1,les:1,cch:1,cchb:1},RANGS=["D","C","B","A","A+"],RCOUL=["#FFD3DB","#FFE7C2","#DCE2FF","#C5F9FC","#CFF9DF"];
const FL=`<svg class="el-fl" viewBox="0 0 16 18" aria-hidden="true"><path d="M8 1c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 2 2 2 4 1-2 1-5 1-8z" fill="var(--ambre)"/></svg>`;
const lundiDe=x=>{const[y,m,d]=x.split("-").map(Number);return A.addDays(x,-((new Date(y,m-1,d).getDay()+6)%7));};
const nb=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g," ");
function duLe(d,g,x){if(!g.val||!g.du)return null;const ex=A.exam(SUBJ[d.sid]);let du=g.du;
  if(ex.day>x&&du>=ex.day){const v=A.addDays(ex.day,-1);if(v>(g.passe||g.val))du=v;}return du;}
let EL={n:-1,der:"",R:null};
function elan(){const J=A.journal(),der=J.length?J[J.length-1].i:"";if(EL.n===J.length&&EL.der===der)return EL.R;
  const E={},dern={},lesOk={},D={},t0=A.today();let cur=null,debut=null;
  const jr=x=>D[x]||(D[x]={x,pts:0,gains:[],prog:[],e:0,rep:0,ms:0,min:0,prevu:null,dus:0,act:false});
  const dus=x=>{let n=0;for(const id in E){const du=duLe(GEN.par[id],E[id],x);if(du&&du<=x)n++;}return n;};
  const ferme=fin=>{for(let x=cur;x<fin;x=A.addDays(x,1))jr(x).dus=dus(x);};
  const gagne=(j,k,det,n,t,pq)=>{n=n==null?BAREME[k][1]:n;j.pts+=n;j.gains.push({k,det,n,t,pq});if(PROGRES[k])j.prog.push({k,det});};
  J.slice().sort((a,b)=>a.t-b.t).forEach(e=>{const x=A.ymd(new Date(e.t));if(cur==null)cur=x;else if(x>cur){ferme(x);cur=x;}
    const j=jr(x);
    if(e.k==="tr"){const d=GEN.par[e.g];if(!d)return;
      const g0=Object.assign({},E[e.g]||neuf());pas(E,e);const g1=E[e.g]||g0;j.act=true;if(!debut)debut=x;
      if(e.m!=="xb")j.ms+=e.ms||0;
      if(e.m!=="xb"&&e.m!=="x"&&e.r!==2){
        if(e.m==="p"&&e.r===1)gagne(j,"pal",`${d.id} · palier ${(e.lv||0)+1}`,null,e.t);
        if(e.m==="pl"&&e.r===1)gagne(j,"pl",d.id,null,e.t);
        if(e.m==="e"&&g0.val){j.e++;const du=duLe(d,g0,x);if(du&&du<=x)gagne(j,e.r===1?"eok":"eko",d.id,null,e.t);}
        if(e.m==="p"&&g1.lv>g0.lv)gagne(j,"monte",`${d.id} · palier ${g1.lv+1}`,null,e.t);
        if(g1.val&&!g0.val)gagne(j,"val",d.id,null,e.t);
        const av=dern[e.g];if(e.r===1&&av&&av.r===0){j.rep++;gagne(j,"rep",d.id,null,e.t,av.x===x?"raté tout à l'heure, réussi":av.x===A.addDays(x,-1)?"raté hier, réussi aujourd'hui":`raté ${A.dayName(av.x,false,true)}, réussi aujourd'hui`);}}
      if(e.r!==2)dern[e.g]={r:e.r,x};}
    else if(e.k==="xb"){j.act=true;if(!debut)debut=x;j.ms+=e.ms||0;gagne(j,"xb",`${String(Math.round((e.n||0)*10)/10).replace(".",",")} sur 20`,Math.round(5*(e.n||0)+(e.d&&e.ms>=0.8*e.d?30:0)),e.t);}
    else if(e.k==="les"){j.act=true;if(!debut)debut=x;j.min+=e.dur||0;const k=e.s+"/"+e.l;
      if((e.sc||0)>=0.5&&!lesOk[k]){lesOk[k]=1;const L=((A.LES||{})[e.s]||[]).find(l=>l.id===e.l);gagne(j,"les",L?L.t:e.l,null,e.t);}}
    else if(e.k==="quiz"&&e.goal&&SUBJ[e.s]){j.act=true;if(!debut)debut=x;gagne(j,"quiz",SUBJ[e.s].name,null,e.t);}
    else if(e.k==="cch"&&SUBJ[e.s]){j.act=true;if(!debut)debut=x;j.ms+=e.ms||0;const k="cch|"+e.s+"|"+e.ep+"|"+e.n;if(e.ok&&!lesOk[k]){lesOk[k]=1;gagne(j,"cch",e.nt||e.n,null,e.t);}}
    else if(e.k==="cchb"&&SUBJ[e.s]){j.act=true;if(!debut)debut=x;j.ms+=e.ms||0;gagne(j,"cchb",`${virg(e.note||0)} sur 20`,Math.round(5*(e.note||0)),e.t);}
    else if(e.k==="mix"){j.act=true;if(!debut)debut=x;j.min+=10;if(e.n)gagne(j,"mix",`${e.n} sur ${e.sur||12}`,2*e.n,e.t);}
    else if(e.k==="task"&&e.v&&SUBJ[e.s]&&!/^en-/.test(e.x)){const T=SUBJ[e.s].TB[e.x];if(T)j.min+=T.min||0;}
    else if(e.k==="pj"&&e.d===x)j.prevu=Math.max(j.prevu||0,e.min||0);});
  if(cur!=null&&cur<=t0)ferme(A.addDays(t0,1));
  const jours=[];
  if(debut)for(let x=debut;x<=t0;x=A.addDays(x,1)){const j=jr(x);
    j.travail=Math.round(j.min+j.ms/60000);j.cc=A.epreuvesDu(x).length>0;j.ent=j.dus===0||j.e>=3;
    j.obj=j.prevu==null?false:j.prevu<=0?j.act:j.travail>=Math.round(j.prevu*2/3);
    j.utile=j.cc||(j.ent&&j.prog.length>0);
    j.rang=!j.act?0:j.ent&&j.obj&&j.rep?4:j.ent&&j.obj?3:j.ent||j.obj?2:1;jours.push(j);}
  let serie=0,run=[];const semR={};
  jours.forEach(j=>{if(j.x===t0)return;const l=lundiDe(j.x);
    if(j.utile){j.st="u";serie++;run=[];}
    else{j.st=semR[l]?"m":(semR[l]=1,"r");run.push(j.st);if(run.length>=3||(run.length===2&&!run.includes("r"))){serie=0;j.casse=true;}}
    j.serie=serie;});
  const auj=jr(t0);if(!jours.length){auj.travail=0;auj.ent=auj.dus===0;auj.obj=false;auj.utile=false;auj.rang=0;}
  auj.st=auj.utile?"u":"?";auj.serie=serie+(auj.utile?1:0);
  const stAuj=semR[lundiDe(t0)]?"m":"r",run2=run.concat(stAuj),danger=!auj.utile&&serie>0&&(run2.length>=3||(run2.length===2&&!run2.includes("r")));
  const ouverts=Object.keys(dern).filter(id=>dern[id].r===0&&GEN.par[id]&&!(E[id]&&E[id].val)).map(id=>({d:GEN.par[id],x:dern[id].x})).sort((a,b)=>b.x<a.x?-1:1);
  const R={D,jours,auj,serie:auj.serie,run,danger,ouverts,semR,debut};
  EL={n:J.length,der,R};return R;}
const lettre=r=>`<span class="el-rang nf" style="--tagc:${RCOUL[r]}">${RANGS[r]}</span>`;
function semaine(l){const R=elan(),t0=A.today(),L=[];for(let i=0;i<7;i++){const x=A.addDays(l,i);if(x>t0)break;const j=R.D[x];if(j&&j.x>=(R.debut||t0))L.push(j);}
  const pts=L.reduce((s,j)=>s+j.pts,0),comp=L.filter(j=>j.st!=="r"&&(j.x<t0||j.act)),moy=comp.length?Math.round(comp.reduce((s,j)=>s+j.rang,0)/comp.length):0;
  return {L,pts,rang:moy,utiles:L.filter(j=>j.st==="u").length};}
/* la pastille du haut (choix 14a) : série et points du jour, sur toutes les pages */
function pastille(){const el=document.getElementById("elan");if(!el)return;let R;try{R=elan();}catch(e){el.hidden=true;return;}
  const j=R.auj;el.hidden=false;
  el.innerHTML=`<span class="el-s">${FL}${R.serie}</span><span class="el-pt">${nb(j.pts)}</span>`;
  el.setAttribute("aria-label",`${R.serie} ${plur(R.serie,"jour utile","jours utiles")} d'affilée, ${nb(j.pts)} ${plur(j.pts,"point")} aujourd'hui : le détail`);
  el.title=`${R.serie} ${plur(R.serie,"jour utile","jours utiles")} d'affilée · ${nb(j.pts)} ${plur(j.pts,"point")} aujourd'hui`;}
/* le temps prévu aujourd'hui (pour l'objectif du rang) : Aujourd'hui l'écrit dans le journal quand il grandit */
function prevu(reste){const R=elan(),j=R.auj,v=Math.round((j.travail||0)+reste);if(j.prevu==null||v>=j.prevu+5)A.emit({k:"pj",d:A.today(),min:v});}
const plusTxt=j=>{const m=[];if(!j.ent)m.push(`ton entretien (il en reste ${j.dus})`);if(!j.obj)m.push(j.prevu==null?"l'objectif du jour (ouvre Aujourd'hui pour le calculer)":`l'objectif du jour (encore ${A.hm(Math.max(5,Math.round(j.prevu*2/3)-j.travail))})`);if(!j.rep)m.push("répare un exercice raté");return m;};
function suivant(j){if(j.rang===4)return "Rang le plus haut : rien à ajouter aujourd'hui.";
  if(j.rang===0)return "Pour passer C : un exercice, une leçon ou un examen blanc qui te fait progresser.";
  const m=plusTxt(j);
  if(j.rang===3)return "Pour passer A+ : refais un exercice raté et réussis-le.";
  if(j.rang===2)return `Pour passer A : ${j.ent?m.find(x=>x.startsWith("l'objectif")):m[0]}.`;
  return `Pour passer B : ${m[0]}${m[1]&&!m[1].startsWith("répare")?` ou ${m[1]}`:""}.`;}
function critJour(j){const fait=j.gains.filter(g=>g.k==="rep").map(g=>g.det);
  return `<div class="el-crit"><span class="${j.ent?"":"no"}">${j.ent?"tout l'entretien dû est fait":`l'entretien dû : il en reste ${j.dus}`}</span><span class="${j.obj?"":"no"}">${j.prevu==null?"objectif du jour : pas encore calculé (ouvre Aujourd'hui)":j.prevu<=0?(j.obj?"objectif du jour atteint (rien de prévu, et tu as travaillé)":"objectif du jour : rien de prévu, un exercice suffit"):`objectif du jour ${j.obj?"atteint":"pas encore atteint"} (${A.hm(j.travail)} de travail sur ${A.hm(j.prevu)} prévues)`}</span><span class="${j.rep?"":"no"}">${j.rep?`${j.rep>1?j.rep+" ratés réparés":"un raté réparé"} (${[...new Set(fait)].slice(0,3).join(", ")})`:"un raté réparé : pas encore"}</span></div>`;}
function recapBloc(){const R=elan(),t0=A.today(),hier=A.addDays(t0,-1);if(!R.debut||R.debut>hier)return "";
  const lundi=lundiDe(t0)===t0;
  if(lundi){const l=A.addDays(t0,-7),W=semaine(l),G=W.L.flatMap(j=>j.gains),vl=G.filter(g=>g.k==="val").map(g=>g.det),xb=G.filter(g=>g.k==="xb").map(g=>g.det),rp=W.L.reduce((s,j)=>s+j.rep,0);
    const li=[];if(vl.length)li.push(`Méthodes validées : ${[...new Set(vl)].join(", ")}`);if(xb.length)li.push(`Examen blanc : ${xb.join(", ")}`);li.push(`${W.utiles} ${plur(W.utiles,"jour utile","jours utiles")} sur 7, ${rp} ${plur(rp,"raté réparé","ratés réparés")}`);
    li.push(...ratesTxt(R));const ep=prochaines();if(ep)li.push(`Cette semaine : ${ep}`);
    return `<div class="el-recap"><span class="kick">La semaine dernière · du ${A.dayName(l,false,true).replace(/^\S+ /,"")} au ${A.dayName(A.addDays(l,6),false,true).replace(/^\S+ /,"")}</span><div class="el-chif nf"><div><b>${RANGS[W.rang]}</b>rang</div><div><b>${nb(W.pts)}</b>points</div><div><b>${R.D[hier]?R.D[hier].serie||0:0}</b>jours</div></div><ul>${li.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;}
  const j=R.D[hier];if(!j)return "";
  const li=[];
  if(j.act){const pal=j.gains.filter(g=>g.k==="monte"||g.k==="val").map(g=>g.k==="val"?g.det+" validée":g.det),f=[];
    if(pal.length)f.push(pal.slice(0,3).join(", "));const ne=j.gains.filter(g=>g.k==="eok").length;if(j.e)f.push(`${ne} ${plur(j.e,"entretien")} sur ${j.e}`);if(j.rep)f.push(`${j.rep} ${plur(j.rep,"raté réparé","ratés réparés")}`);
    const ls=j.gains.filter(g=>g.k==="les").length;if(ls)f.push(`${ls} ${plur(ls,"leçon finie","leçons finies")}`);const xb=j.gains.filter(g=>g.k==="xb");if(xb.length)f.push(`examen blanc ${xb.map(g=>g.det).join(", ")}`);
    li.push(`Fait : ${f.length?f.join(", "):`${A.hm(j.travail)} de travail`}`);}
  else li.push(j.st==="r"?"Hier : ton jour de repos de la semaine, pris tout seul.":"Hier sans révision : pas grave. Un jour manqué ne casse rien, deux de suite oui.");
  li.push(...ratesTxt(R));
  return `<div class="el-recap"><span class="kick">Hier, ${A.dayName(hier)}</span><div class="el-chif nf"><div><b>${RANGS[j.rang]}</b>rang</div><div><b>${nb(j.pts)}</b>points</div><div><b>${j.serie||0}</b>jours</div></div><ul>${li.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;}
function ratesTxt(R){const L=R.ouverts.slice(0,2);if(!L.length)return [];const ent=new Set(entretien(true).map(x=>x.d.id));
  return L.map(({d})=>`Raté encore : ${d.t.charAt(0).toLowerCase()+d.t.slice(1)} (${SUBJ[d.sid].name}) : ${ent.has(d.id)?"il est dans ton entretien d'aujourd'hui":`à refaire dans <a href="#/entrainer/${d.sid}/${d.id}">S'entraîner</a>`}`);}
function prochaines(){const t0=A.today(),fin=A.addDays(t0,6),L=[];for(let x=t0;x<=fin;x=A.addDays(x,1))A.epreuvesDu(x).forEach(({S,e})=>L.push(`${e.label||"CC"} ${S.name} ${x===t0?"aujourd'hui":A.dayName(x,false,true)}`));return L.join(", ");}
/* la page du détail (« un onglet qui détaille bien ») */
function pageElan(){$("#main").className="";const R=elan(),j=R.auj,t0=A.today(),l=lundiDe(t0),W=semaine(l),tir=(t,b)=>`<section class="tiroir"><h2 class="tiroir__title">${t}</h2>${b}</section>`;
  const JL=["L","M","M","J","V","S","D"],cell=x=>{const k=R.D[x];if(x>t0)return "<i></i>";if(x===t0)return j.utile?'<i class="ok">✓</i>':'<i class="auj">?</i>';if(!k||!R.debut||x<R.debut)return "<i></i>";return k.st==="u"?'<i class="ok">✓</i>':k.st==="r"?'<i class="rep">R</i>':'<i class="non"></i>';};
  let sem=`<div class="el-sem nf">${JL.map(x=>`<span>${x}</span>`).join("")}${JL.map((x,i)=>cell(A.addDays(l,i))).join("")}</div>`;
  const pr=j.prog[0],hier=R.D[A.addDays(t0,-1)];
  let s=`<div class="el-gros"><span class="el-n">${R.serie}</span><span>${plur(R.serie,"jour utile","jours utiles")} d'affilée ${FL}</span></div>${sem}`;
  s+=j.cc&&!j.utile?`<div class="examcard" style="--sc:var(--aqua)"><b>Aujourd'hui, jour d'épreuve : il compte de toute façon.</b></div>`:`<div class="examcard" style="--sc:var(--aqua)"><b>${j.utile?"Aujourd'hui compte déjà :":"Aujourd'hui compte quand :"}</b><div class="el-crit"><span class="${j.ent?"":"no"}">ton entretien dû est fait${j.ent?"":` (il en reste ${j.dus})`}</span><span class="${pr?"":"no"}">une chose qui fait progresser${pr?` (fait : ${pr.k==="val"?pr.det+" validée":pr.k==="rep"?pr.det+" réparé":pr.det})`:" : un palier, un raté réparé, un examen blanc ou une leçon"}</span></div></div>`;
  if(hier&&hier.st==="m"&&!hier.casse&&R.serie>0)s+=`<div class="examcard" style="--sc:var(--ambre)"><b>Hier sans révision : pas grave.</b><p class="muted" style="margin:0">Un jour manqué ne casse rien, deux de suite oui. ${R.danger?"Aujourd'hui compte pour garder ta série.":"Aujourd'hui, un jour sans serait ton repos de la semaine."}</p></div>`;
  else if(R.danger)s+=`<div class="examcard" style="--sc:var(--ambre)"><b>Aujourd'hui compte pour garder ta série.</b></div>`;
  const rp=W.L.find(k=>k.st==="r");
  s+=`<p class="muted el-pt">${rp?`${A.dayName(rp.x,true).split(" ")[0]} : ton jour de repos de la semaine, pris tout seul. `:""}Un jour de CC compte toujours. Un jour sans ne casse rien ; deux de suite cassent la série, sauf si l'un des deux est ton jour de repos (le premier jour sans de la semaine) ; trois de suite la cassent toujours.</p>`;
  let h=`<div class="page"><div class="title-row"><h1>Ta progression</h1></div><p class="lead">Ta série, tes points et ton rang du jour viennent de ce que tu fais sur le site : ils suivent ta synchronisation entre téléphone et ordinateur.</p>`;
  h+=tir("Ta série",s);
  const grp={};j.gains.forEach(g=>{const o=grp[g.k]||(grp[g.k]={n:0,c:0,det:[]});o.n+=g.n;o.c++;if(g.det&&!o.det.includes(g.det))o.det.push(g.det);});
  const lignes=Object.keys(BAREME).filter(k=>grp[k]).map(k=>`<div><span>${BAREME[k][0]}${grp[k].c>1?` × ${grp[k].c}`:""}<small>${grp[k].det.slice(0,4).join(", ")}${grp[k].det.length>4?"…":""}</small></span><b>+${nb(grp[k].n)}</b></div>`).join("");
  const bar=[["Raté, puis réussi","+15"],["Palier validé","+25"],["Méthode validée (dernier palier)","+60"],["Entretien dû, fait à temps et juste","+20"],["Entretien dû, fait mais raté","+5"],["Exercice juste au palier en cours, placement réussi","+5"],["Examen blanc","5 × la note, +30 s'il est fait en entier"],["Leçon finie · quiz réussi","+15 · +10"],["Mini-contrôle mélangé","2 par bonne réponse"],["Juste sur une méthode déjà sue, hors entretien","0",1],["Réponse aidée, temps passé, tâche cochée","0",1]];
  h+=tir(`Tes points · ${A.dayName(t0).split(" ")[0]}`,`<div class="el-gros"><span class="el-n">${nb(j.pts)}</span><span>${plur(j.pts,"point")} aujourd'hui</span></div>${lignes?`<div class="el-bar nf">${lignes}</div>`:`<p class="muted">Pas encore de point aujourd'hui : ils viennent de ce qui te fait progresser.</p>`}
   <h3 class="el-h3">Cette semaine : ${nb(W.pts)} ${plur(W.pts,"point")}</h3><div class="el-bar nf">${W.L.map(k=>`<div${k.pts?"":' class="zero"'}><span>${A.dayName(k.x,true,true)}${k.x===t0?" (aujourd'hui)":""}</span><b>${nb(k.pts)}</b></div>`).join("")}</div>
   <details class="day"><summary><b>Le barème</b><span>ce qui donne des points</span></summary><div class="el-bar nf" style="padding:0 12px 12px">${bar.map(([t,v,z])=>`<div${z?' class="zero"':""}><span>${t}</span><b>${v}</b></div>`).join("")}</div></details>`);
  h+=tir("Ta journée",`<div class="el-jour">${lettre(j.rang).replace("el-rang ","el-rang grand ")}${critJour(j)}</div><p class="el-suite nf"><b>${suivant(j)}</b></p><p class="muted el-pt nf">A+ = entretien + objectif + un raté réparé · A = entretien + objectif · B = l'un des deux · C = quelque chose d'utile · D = rien. L'objectif : les deux tiers du temps prévu sur Aujourd'hui. Le rang de la semaine = la moyenne des jours.</p>
   <h3 class="el-h3 nf">Ta semaine : rang ${RANGS[W.rang]}</h3><div class="el-jrs nf">${W.L.map(k=>`<span>${A.dayName(k.x,false,true).split(" ")[0]} ${k.st==="r"?"repos":lettre(k.rang)}</span>`).join("")}</div>`);
  const rc=recapBloc();h+=tir(lundiDe(t0)===t0?"Le récap de la semaine":"Le récap d'hier",rc||`<p class="muted">Le récap arrive demain matin, en haut d'Aujourd'hui : rang, points, série, ce que tu as fait et ce qui reste raté.</p>`);
  $("#main").innerHTML=h+`</div>`;}
/* le « shot » (choix 15a) : une étiquette qui monte 1 s avec la raison, sans son, quand une réponse fait progresser */
function shot(ev){let R;try{R=elan();}catch(e){return;}const j=R.D[A.ymd(new Date(ev.t))];if(!j)return;const G=j.gains.filter(g=>g.t===ev.t);if(!G.length)return;
  setTimeout(()=>{const v=document.querySelector("#en-fb .verdict")||document.getElementById("en-fb");if(!v)return;const r=v.getBoundingClientRect();
    const box=document.createElement("div");box.className="el-shots";box.setAttribute("aria-hidden","true");box.style.top=Math.max(8,Math.min(innerHeight-120,r.bottom-8))+"px";box.style.right=Math.max(8,innerWidth-r.right+6)+"px";
    const gros=G.filter(g=>g.k==="monte"||g.k==="val"),petits=G.filter(g=>!(g.k==="monte"||g.k==="val"));
    /* une étiquette par raison (choix 64b du 20/11) */
    petits.forEach(g=>box.insertAdjacentHTML("beforeend",`<div class="el-shot">+${g.n}<small>${g.pq||BAREME[g.k][0].charAt(0).toLowerCase()+BAREME[g.k][0].slice(1)}</small></div>`));
    gros.forEach(g=>box.insertAdjacentHTML("beforeend",`<div class="el-shot or">${BAREME[g.k][0]} · +${g.n}</div>`));
    document.body.appendChild(box);setTimeout(()=>box.remove(),1300);},0);}
const couvre=(sid,th)=>defs(sid).some(d=>!d.fixe&&d.th===th&&etat(d.id).n>0);
/* ---------- avant une nouvelle leçon (choix 17a du 20/11) : un exercice du niveau du CC sur ce que la leçon explique, 2 minutes, sans note.
   Il revient à la fin de la leçon : il le refait et voit la correction. Gardé sur l'appareil (localStorage), 14 jours au plus. ---------- */
const AVK="rev-s1-avant-lecon";let AVT=0;
const avLit=()=>{try{const o=JSON.parse(localStorage.getItem(AVK)||"{}");return o&&typeof o==="object"?o:{};}catch(x){return {};}};
const avEcrit=o=>{try{localStorage.setItem(AVK,JSON.stringify(o));}catch(x){}};
const methodeLecon=(sid,lid)=>{const D=defs(sid).filter(d=>!d.fixe&&(d.lecons||(theme(d)||{}).les||[]).includes(lid));return D.find(d=>(d.lecons||[]).includes(lid))||D[0]||null;};
function avant(sid,lid){const d=SUBJ[sid]&&methodeLecon(sid,lid),k=sid+"/"+lid,o=avLit()[k];if(!d||(o&&Date.now()-o.t<14*864e5))return null;
  const lv=dernier(d),gr=parseInt(GEN.outils.hache("avant|"+lid+"|"+d.id),36);try{GEN.tire(d,lv,gr);}catch(x){return null;}return {s:sid,l:lid,g:d.id,lv,gr};}
function avantEcran(info,L,suite){stop();clearInterval(AVT);const d=GEN.par[info.g],S=SUBJ[d.sid],e=GEN.tire(d,info.lv,info.gr),T=theme(d),t0=Date.now(),DUR=120e3,pap=!!e.papier;
  $("#main").className="s-"+d.sid;
  $("#main").innerHTML=`<div class="lp s-${d.sid}"><div class="lp-top"><a class="lp-x" href="#/apprendre" aria-label="Quitter">✕</a><div class="lp-bar av-bar" role="progressbar" aria-label="Les 2 minutes" aria-valuemin="0" aria-valuemax="120" aria-valuenow="0"><i style="width:0%"></i></div><span class="lp-n" id="av-ch">0:00</span></div>
   <div class="lp-kicker">${S.name} · avant la leçon « ${esc(L.t)} »</div><div class="lp-body" id="lpb"></div><div class="lp-foot" id="en-pied"></div></div>`;
  const b=$("#lpb");
  b.innerHTML=tx(`<p class="prekick">Ce qu'on te demandera ${auCC(S)} · 2 minutes, sans note</p>${T&&T.src?`<p class="muted">Aux ${estCC(S)?"CC":"examens"} d'avant : ${T.src}.</p>`:""}<p class="lq">${e.q}</p><div>${pap&&e.corpsPapier!=null?e.corpsPapier:e.corps}</div>${pap?`<div class="paper"><b>Sur ta feuille, essaie, même sans savoir.</b> Ce que tu trouves en cherchant, même faux, t'aidera à suivre la leçon.</div>`:`<div class="en-rep" id="en-rep">${champsHTML(e)}</div>`}<p class="muted" id="av-msg">Puis la leçon s'ouvre ; à la fin, la même question revient et tu vois ce que tu as appris.</p>`);
  $("#en-pied").innerHTML=`<button class="btn" id="av-nsp">Je ne sais pas encore</button><button class="btn pri big" id="av-ok">${pap?"J'ai essayé":"Valider"}</button>`;
  const i0=b.querySelector("input:not([hidden]),textarea");if(i0){i0.placeholder="Essaie, même sans savoir";if(!matchMedia("(pointer:coarse)").matches)i0.focus();}
  const bar=$(".av-bar"),ch=$("#av-ch");
  AVT=setInterval(()=>{if(!ch.isConnected){clearInterval(AVT);return;}const ms=Date.now()-t0;ch.textContent=horloge(ms);bar.firstElementChild.style.width=Math.min(100,ms/DUR*100)+"%";bar.setAttribute("aria-valuenow",Math.min(120,Math.round(ms/1000)));
    if(ms>=DUR){clearInterval(AVT);$("#av-msg").textContent="Les 2 minutes sont passées : valide ce que tu as, même incomplet. La leçon s'ouvre ensuite.";}},1000);
  const fini=nsp=>{clearInterval(AVT);let txt="(je ne savais pas encore)";
    if(!nsp&&pap)txt="(essayé sur papier)";else if(!nsp&&([...b.querySelectorAll("input,textarea")].some(i=>i.value.trim())||b.querySelector('#en-rep [aria-pressed="true"]')))txt=repTexte(e,lire(e,b));
    const o=avLit();Object.keys(o).forEach(k=>{if(Date.now()-o[k].t>14*864e5)delete o[k];});o[info.s+"/"+info.l]=Object.assign({},info,{txt,t:Date.now()});avEcrit(o);
    A.logRep({o:"avant la leçon",s:info.s,l:info.l,g:d.id,methode:d.t,palier:info.lv+1,enonce:e.texte,reponse:txt,ms:Date.now()-t0});suite();};
  if(!pap)ecoute(b,e,()=>false,()=>fini(false));
  $("#av-ok").addEventListener("click",()=>fini(false));$("#av-nsp").addEventListener("click",()=>fini(true));
  longues(b);queueMicrotask(()=>document.body.classList.add("in-lesson"));window.scrollTo(0,0);}
/* un exercice d'un générateur dans un cadre (le CC en 1 h) : réponse jugée, ou sur papier avec le barème ligne par ligne, puis la correction ;
   fin({part,ok,ms}) : part = la part des points obtenue */
function exoDans(host,info,fin,o){o=o||{};const d=GEN.par[info.g];let e;try{e=GEN.tire(d,info.lv,info.gr);}catch(x){host.innerHTML=`<p class="verdict info">Cet exercice n'a pas pu être tiré.</p>`;return null;}
  const pap=!!e.papier,t0=Date.now();let fait=false;
  host.innerHTML=tx(`<p class="lq">${e.q}</p><div>${pap&&e.corpsPapier!=null?e.corpsPapier:e.corps}</div>${pap?`<div class="paper"><p><b>Sur ta feuille</b>, rédige comme ${auCC(SUBJ[d.sid])}, puis compare ligne par ligne.</p></div>`:`<div class="en-rep" id="xd-rep">${champsHTML(e)}</div>`}<div class="acts" id="xd-acts">${pap?`<button class="btn pri" id="xd-p">J'ai fini sur ma feuille</button>`:`<button class="btn pri" id="xd-v">Valider</button>`}<button class="btn" id="xd-c">Je ne sais pas : la correction</button></div><div class="en-rep" id="xd-fb" aria-live="polite"></div>`);
  const fb=host.querySelector("#xd-fb"),acts=host.querySelector("#xd-acts"),fige=()=>fait;
  const bout=(part,rep,j)=>{fait=true;acts.remove();host.querySelectorAll("#xd-rep input,#xd-rep textarea,#xd-rep button").forEach(x=>{x.disabled=true;});
    const ok=part>=0.8-1e-9,ms=Date.now()-t0;
    A.logRep({o:o.origine||"le CC en 1 h",s:d.sid,g:d.id,methode:d.t,palier:info.lv+1,enonce:e.texte,reponse:rep?repTexte(e,rep):pap?"(sur papier)":"(correction lue)",ok:ok?1:0,ms});
    if(!ok)genreErreur(fb,d,e);longues(host);fin({part,ok,ms,e});};
  const montre=(j,rep)=>{if(fait)return;
    fb.innerHTML=tx(`${j?`<div class="verdict ${j.ok?"ok":"no"}">${j.ok?"Juste.":j.resume||"Pas encore tout à fait."}</div>`:""}<h3>La correction</h3>${pap?"":`<p><b>La bonne réponse :</b> ${e.bonne}</p>`}${etapesHTML(e,j&&j.diag?j.diag.etape:-1)}`);bout(j&&j.ok?1:0,rep,j);};
  const valide=()=>{if(fait)return;const rep=lire(e,host),j=e.juge(rep);if(j.incomplet){fb.innerHTML=`<div class="verdict info">${j.incomplet}</div>`;return;}montre(j,rep);};
  const papier=()=>{if(fait)return;const tot=e.etapes.reduce((s,x)=>s+x.pts,0);
    fb.innerHTML=tx(`<h3>La correction : coche ce que tu as écrit</h3><div class="pcheck">${e.etapes.map((x,k)=>`<label><input type="checkbox" data-k="${k}"><span>${x.w}</span><b>${virg(x.pts)}</b></label>`).join("")}</div><div class="verdict info" id="xd-note"></div><div class="acts"><button class="btn pri" id="xd-n">Enregistrer ma note</button></div>`);
    acts.hidden=true;const note=()=>[...fb.querySelectorAll(".pcheck input")].reduce((s,i)=>s+(i.checked?e.etapes[+i.dataset.k].pts:0),0);
    const maj=()=>{fb.querySelector("#xd-note").textContent=`Note estimée : ${virg(note())} sur ${virg(tot)}.`;};fb.querySelector(".pcheck").addEventListener("change",maj);maj();longues(fb);
    fb.querySelector("#xd-n").addEventListener("click",()=>{if(fait)return;const n=note();fb.querySelectorAll(".pcheck input").forEach(i=>{i.disabled=true;});fb.querySelector("#xd-n").parentNode.remove();
      const z=fb.querySelector("#xd-note");z.className="verdict "+(n>=tot*0.8-1e-9?"ok":"no");z.textContent=`Note estimée : ${virg(n)} sur ${virg(tot)}.`;
      fb.insertAdjacentHTML("beforeend",tx(`<details class="ex"><summary><span><span class="h">Voir l'explication de chaque étape</span></span></summary><div class="body">${etapesHTML(e,-1)}</div></details>`));bout(tot?n/tot:0,null,null);});};
  if(pap)host.querySelector("#xd-p").addEventListener("click",papier);
  else{ecoute(host,e,fige,valide);host.querySelector("#xd-v").addEventListener("click",valide);}
  host.querySelector("#xd-c").addEventListener("click",()=>{if(fait)return;if(pap){fb.innerHTML=tx(`<h3>La correction</h3>${etapesHTML(e,-1)}`);bout(0,null,null);}else montre(null,null);});
  longues(host);return e;}
function avantFin(host,sid,lid){const k=sid+"/"+lid,o=avLit(),info=o[k],d=info&&GEN.par[info.g];if(!host||!d)return;let e;try{e=GEN.tire(d,info.lv,info.gr);}catch(x){return;}const pap=!!e.papier;
  host.innerHTML=tx(`<section class="av-fin"><p class="prekick">La question du début</p><p class="muted">Avant la leçon, tu avais répondu : ${esc(info.txt||"")}. Maintenant ?</p><p class="lq">${e.q}</p><div>${pap&&e.corpsPapier!=null?e.corpsPapier:e.corps}</div>${pap?`<div class="paper">Sur ta feuille, refais-la, puis regarde la correction.</div>`:`<div class="en-rep" id="av-rep">${champsHTML(e)}</div>`}<div class="acts">${pap?"":`<button class="btn pri" id="av-v">Valider</button>`}<button class="btn" id="av-c">Voir la correction</button></div><div class="en-rep" id="av-fb" aria-live="polite"></div></section>`);
  const z=host.querySelector(".av-fin"),fb=host.querySelector("#av-fb"),fige=()=>!!z.dataset.fait;
  const montre=(j,rep)=>{if(fige())return;z.dataset.fait="1";z.querySelectorAll("input,textarea,.filters button,#av-v,#av-c").forEach(x=>{x.disabled=true;});
    delete o[k];avEcrit(o);A.logRep({o:"avant la leçon : à la fin",s:sid,l:lid,g:d.id,enonce:e.texte,avant:info.txt,reponse:rep?repTexte(e,rep):"(correction lue)",ok:j&&j.ok?1:0});
    fb.innerHTML=tx(`${j?`<div class="verdict ${j.ok?"ok":"no"}">${j.ok?`Juste. Avant la leçon : ${esc(info.txt||"")}.`:j.resume||"Pas encore tout à fait."}</div>`:""}<h3>La correction</h3>${pap?"":`<p><b>La bonne réponse :</b> ${e.bonne}</p>`}${etapesHTML(e,j&&j.diag?j.diag.etape:-1)}`);longues(fb);};
  const valide=()=>{if(fige())return;const rep=lire(e,z),j=e.juge(rep);if(j.incomplet){fb.innerHTML=`<div class="verdict info">${j.incomplet}</div>`;return;}montre(j,rep);};
  if(!pap){ecoute(z,e,fige,valide);host.querySelector("#av-v").addEventListener("click",valide);}
  host.querySelector("#av-c").addEventListener("click",()=>montre(null,null));longues(z);}

/* choix 67a : une matière de maths reçoit « Entraînement en plus » quand une de ses méthodes est prête (une de ses leçons vue, ou déjà commencée) */
const plusPret=sid=>defs(sid).some(d=>{if(d.fixe)return false;if(etat(d.id).n)return true;const S=SUBJ[sid],L=(d.lecons||(theme(d)||{}).les||[]).map(l=>S.TB["L-"+l]).filter(t=>t&&A.inScope(S,t));return L.some(t=>A.isDone(sid,t));});
window.ENT={exoDans,plusPret,avant,avantEcran,avantFin,genres:GENRES,elan,pastille,prevu,recap:recapBloc,shot,bloc,tuile,jour,etat,etats,entretien,echeance,longues,couvre,encours:()=>P,examen:()=>X,exoExamen:k=>xExo(k),/* encours, rendu et longues : pour les essais */
  rendu:e=>tx(`<p class="lq">${e.q}</p><div>${e.corps}</div><div class="en-rep" id="en-rep">${champsHTML(e)}</div><div class="en-rep" id="en-fb"><div class="verdict no">Pas tout à fait.</div><h3>La correction</h3><p><b>La bonne réponse :</b> ${e.bonne}</p>${etapesHTML(e,0)}</div>`)};
})();
