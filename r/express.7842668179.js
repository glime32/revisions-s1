/* Le CC en 1 h (sa demande du 21/11) : tout le programme d'une épreuve en 60 minutes au plus, ce qui rapporte le plus de points d'abord.
   Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice tiré d'un générateur, à faire soi-même avant la correction.
   À la fin, un sujet express noté sur 20. Le contenu est dans express-<matière>.js (window.EXPRESS[sid][épreuve]).
   Ce qui est réussi vient du journal (événements cch et cchb). La position et le chrono sont gardés sur l'appareil et envoyés
   aussi dans le journal (événement xp) : celle d'un autre appareil l'emporte quand elle est plus récente. */
(function(){
"use strict";
const EXT=window.EXT,GEN=window.GEN,SUBJ=window.SUBJ;if(!EXT||!GEN)return;
let A=null;
const $=s=>document.querySelector(s);
const tx=h=>window.W.tx(h);
const virg=x=>String(Math.round(x*100)/100).replace(".",",");
const horloge=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");};
const KEY="rev-s1-express";
/* la durée du parcours : 60 min, ou duree dans le contenu (120 pour un examen terminal) ; « Passer au sujet express » aux trois quarts */
const maxMin=C=>C&&C.duree||60,presseMin=C=>Math.round(maxMin(C)*0.75),dureeTxt=C=>maxMin(C)%60?maxMin(C)+" min":maxMin(C)/60+" h";
const lit=()=>{try{const o=JSON.parse(localStorage.getItem(KEY)||"{}");return o&&typeof o==="object"?o:{};}catch(x){return {};}};
const ecrit=o=>{try{localStorage.setItem(KEY,JSON.stringify(o));}catch(x){}};
const X=(sid,ep)=>(window.EXPRESS||{})[sid]&&window.EXPRESS[sid][ep]||null;
const base=(sid,ep)=>"#/express/"+sid+"/"+ep;
const graine=(...k)=>parseInt(GEN.outils.hache(k.join("|")),36);
const exoMin=x=>x.exo?(GEN.par[x.exo.g].paliers[x.exo.lv].cc||4):x.rappel?x.rappel.min||2:0;
const minNotion=n=>n.lect+exoMin(n),minBlanc=C=>C.blanc.reduce((s,q)=>s+exoMin({exo:q}),0);
const prevu=C=>C.notions.reduce((s,n)=>s+minNotion(n),0)+minBlanc(C);
const surBlanc=C=>C.blanc.reduce((s,q)=>s+q.pts,0);

function bilan(sid,ep){const C=X(sid,ep),ok={},essais={},blancs=[];
  A.journal().forEach(e=>{if(e.s!==sid||e.ep!==ep)return;if(e.k==="cch"){essais[e.n]=(essais[e.n]||0)+1;if(e.ok)ok[e.n]=1;}else if(e.k==="cchb")blancs.push(e);});
  const pts=C.notions.reduce((s,n)=>s+(ok[n.id]?n.pts:0),0);
  return {ok,essais,pts,blancs,meilleur:blancs.length?Math.max(...blancs.map(b=>b.note||0)):null,dernier:blancs.length?blancs[blancs.length-1]:null};}
let XJ={n:-1,m:{}};
const xpJournal=()=>{const J=A.journal();if(J.length!==XJ.n){const m={},moi=A.device()+"-";J.forEach(e=>{if(e.k==="xp"&&e.p&&String(e.i).indexOf(moi)!==0){const c=e.s+"/"+e.ep;if(!m[c]||e.t>=m[c].t)m[c]=e;}});XJ={n:J.length,m};}return XJ.m;};
const posDe=(sid,ep)=>{const c=sid+"/"+ep,l=lit()[c],e=xpJournal()[c];
  const p=e&&(!l||!l.ts||e.t>l.ts+1000)?Object.assign({},e.p,{ts:e.t}):l;
  return Object.assign({i:0,st:0,k:0,ms:0,bq:0,bres:[],bk:0},p||{});};
let XP=null,XPT=0;
const envoie=()=>{clearTimeout(XPT);if(!XP)return;const e=XP;XP=null;const p=Object.assign({},e.p);delete p.ts;A.emit({k:"xp",s:e.sid,ep:e.ep,p});};
const garde=(sid,ep,p)=>{const o=lit();p.ts=A.stamp();o[sid+"/"+ep]=p;ecrit(o);
  if(XP&&(XP.sid!==sid||XP.ep!==ep))envoie();XP={sid,ep,p};clearTimeout(XPT);XPT=setTimeout(envoie,4000);};
const palier=(C,pts)=>{let r=null;C.paliers.forEach(p=>{if(pts>=p[0])r=p;});return r;};
const prochainPalier=(C,pts)=>C.paliers.find(p=>pts<p[0])||null;

/* le chrono : le temps passé sur les écrans du parcours, gardé avec la position */
let CH=null,TIC=0;
function tic(){if(!CH)return;const p=posDe(CH.sid,CH.ep),now=Date.now();p.ms=(p.ms||0)+Math.max(0,Math.min(now-CH.t,10*60e3));CH.t=now;garde(CH.sid,CH.ep,p);}
function arrete(){tic();CH=null;clearInterval(TIC);}
function lance(sid,ep){if(!CH||CH.sid!==sid||CH.ep!==ep){arrete();CH={sid,ep,t:Date.now()};}
  clearInterval(TIC);TIC=setInterval(()=>{const el=$("#xp-ch");if(!el){arrete();return;}el.textContent=horloge(posDe(sid,ep).ms+Date.now()-CH.t);},1000);}
const ecoule=(sid,ep)=>posDe(sid,ep).ms+(CH&&CH.sid===sid&&CH.ep===ep?Date.now()-CH.t:0);

/* la jauge des points du CC, avec les repères des paliers (choix 72a) ; dans la barre du haut d'un écran, sans repères */
function jauge(C,pts,cls,court){const P=prochainPalier(C,pts),R=palier(C,pts),rep=cls!=="xp-j";
  return `<div class="lp-bar${cls?" "+cls:""}${rep?" xp-reperes":""}" role="progressbar" aria-label="Points ${C.du} assurés" aria-valuemin="0" aria-valuemax="20" aria-valuenow="${pts}"><i style="width:${Math.min(100,pts/20*100)}%"></i>${rep?C.paliers.map(p=>`<span class="xp-trait" style="left:${p[0]*5}%"></span><span class="xp-num" style="left:${p[0]*5}%">${p[0]}</span>`).join(""):""}</div>
   <p class="el-pt">${court?"":C.paliers.map(p=>`<b>${p[0]}</b> : ${p[1].charAt(0).toLowerCase()+p[1].slice(1)}`).join(" · ")+" · "}${P?`encore ${virg(P[0]-pts)} point${P[0]-pts>1?"s":""} pour ${P===C.paliers[0]?"la moyenne":P[1].charAt(0).toLowerCase()+P[1].slice(1)}`:R?`${R[1]} !`:""}</p>`;}

function accueil(sid,ep){arrete();const C=X(sid,ep),S=SUBJ[sid],B=bilan(sid,ep),p=posDe(sid,ep),N=C.notions.length,min=prevu(C),passe=Math.round(p.ms/60e3);
  const ou=p.i<N?`Reprendre : ${C.notions[p.i].t}`:"Reprendre : le sujet express";
  const neuf=!p.ms&&!Object.keys(B.essais).length&&!B.blancs.length;
  const lignes=C.notions.map((n,k)=>`<div${B.ok[n.id]?"":` class="zero"`}><span>${k+1}. ${n.t}<small>${n.ou} · ${Math.round(minNotion(n))} min</small></span><b>${B.ok[n.id]?"✓ ":""}${virg(n.pts)} pt${n.pts>1?"s":""}</b></div>`).join("")+
    `<div${B.blancs.length?"":` class="zero"`}><span>${N+1}. Le sujet express, noté sur 20<small>${C.blanc.length} questions comme ${C.au} · ${minBlanc(C)} min</small></span><b>${B.meilleur!=null?virg(B.meilleur)+" / 20":"—"}</b></div>`;
  $("#main").className="s-"+sid;
  $("#main").innerHTML=`<div class="page s-${sid}"><a class="back" href="#/${sid}">‹ ${S.name}</a><h1 class="stitle">${C.t}</h1>
   <p class="hlead">${C.lead} Temps prévu : ${virg(min)} min.</p>
   <section class="el-recap"><p class="el-gros"><span class="el-n">${virg(B.pts)}</span> points ${C.du} sur 20 que tu sais aller chercher</p>${jauge(C,B.pts)}${B.dernier?`<p class="el-pt">Dernier sujet express : ${virg(B.dernier.note)} sur 20${B.meilleur>B.dernier.note?` (meilleur : ${virg(B.meilleur)})`:""}.</p>`:""}</section>
   <div class="acts"><a class="btn pri big" href="${base(sid,ep)}/go">${neuf?`Commencer · ${dureeTxt(C)} chrono`:ou}</a>${neuf?"":`<button class="btn" id="xp-zero">Tout recommencer</button>`}${p.i<N?`<a class="btn" href="${base(sid,ep)}/sujet">Aller au sujet express</a>`:""}</div>
   ${neuf?"":`<p class="muted">Chrono : ${passe} min sur ${maxMin(C)}.</p>`}
   <h2>Le parcours, ce qui rapporte le plus d'abord</h2><div class="el-bar">${lignes}</div></div>`;
  const z=$("#xp-zero");if(z)z.addEventListener("click",()=>{garde(sid,ep,{i:0,st:0,k:(p.k||0)+1,ms:0,bq:0,bres:[],bk:(p.bk||0)+1});accueil(sid,ep);});}

/* une étiquette qui monte, comme les points de l'entraînement */
function etiquette(txt,or){const v=document.querySelector("#xp-fb .verdict")||document.querySelector(".lp-bar");if(!v)return;const r=v.getBoundingClientRect();
  const box=document.createElement("div");box.className="el-shots";box.setAttribute("aria-hidden","true");box.style.top=Math.max(8,Math.min(innerHeight-120,r.bottom-8))+"px";box.style.right=Math.max(8,innerWidth-r.right+6)+"px";
  box.innerHTML=`<div class="el-shot${or?" or":""}">${txt}</div>`;document.body.appendChild(box);setTimeout(()=>box.remove(),2600);}

function cadre(sid,ep,kicker,pts){const C=X(sid,ep);
  $("#main").className="s-"+sid;
  $("#main").innerHTML=`<div class="lp s-${sid}"><div class="lp-top"><a class="lp-x" href="${base(sid,ep)}" aria-label="Quitter (tu reprendras ici)">✕</a>${jauge(C,pts,"xp-j").split("</div>")[0]}</div><span class="lp-n" id="xp-ch">${horloge(ecoule(sid,ep))}</span></div>
   <div class="lp-kicker">${kicker}</div><div class="lp-body" id="lpb"></div><div class="lp-foot" id="xp-pied"></div></div>`;
  queueMicrotask(()=>document.body.classList.add("in-lesson"));window.scrollTo(0,0);lance(sid,ep);}
const pied=h=>{$("#xp-pied").innerHTML=h;};
const presse=(sid,ep)=>ecoule(sid,ep)>presseMin(X(sid,ep))*60e3?`<a class="btn" href="${base(sid,ep)}/sujet">Passer au sujet express</a>`:"";

function notion(sid,ep){const C=X(sid,ep),p=posDe(sid,ep),N=C.notions.length;if(p.i>=N)return sujet(sid,ep);
  const n=C.notions[p.i],B=bilan(sid,ep),S=SUBJ[sid];
  cadre(sid,ep,`Notion ${p.i+1} sur ${N} · ${virg(n.pts)} point${n.pts>1?"s":""} ${C.du} · ${n.ou}`,B.pts);const b=$("#lpb");
  const va=st=>{tic();const q=posDe(sid,ep);q.st=st;garde(sid,ep,q);notion(sid,ep);};
  if(p.st===0){b.innerHTML=tx(`<p class="prekick">L'essentiel · ${virg(Math.max(1,n.lect))} min</p><h2>${n.t}</h2>${n.ess}`);
    pied(`${presse(sid,ep)}<button class="btn pri big" id="xp-go">La méthode ${C.du}</button>`);$("#xp-go").addEventListener("click",()=>va(1));return;}
  if(p.st===1){b.innerHTML=tx(`<p class="prekick">La méthode ${C.du}</p><h2>${n.t}</h2>${n.meth}${n.piege?`<div class="piege"><b>Le piège.</b>${/^\s*<(p|ul|ol)[ >]/.test(n.piege)?n.piege:`<p>${n.piege}</p>`}</div>`:""}`);/* le piège après la méthode : il cite souvent son exemple */
    pied(`<button class="btn" id="xp-av">Revoir l'essentiel</button><button class="btn pri big" id="xp-go">À toi : l'exercice</button>`);
    $("#xp-av").addEventListener("click",()=>va(0));$("#xp-go").addEventListener("click",()=>va(2));return;}
  const fini=r=>{const nouveau=r.ok&&!B.ok[n.id];
    const ev={k:"cch",s:sid,ep,n:n.id,nt:n.t,ok:r.ok?1:0,part:Math.round(r.part*100)/100,ms:r.ms};A.emit(ev);
    if(window.ENT){try{ENT.shot(ev);ENT.pastille();}catch(x){}}
    tic();const q=posDe(sid,ep);q.k=(q.k||0)+1;if(r.ok){q.i=p.i+1;q.st=0;}else q.st=2;garde(sid,ep,q);
    if(nouveau){const av=palier(C,B.pts),ap=palier(C,B.pts+n.pts);if(n.pts>0)setTimeout(()=>etiquette(`+${virg(n.pts)} pt${n.pts>1?"s":""} ${C.du}`),300);
      if(ap&&ap!==av)setTimeout(()=>etiquette(ap[1]+" !",true),1300);
      const bar=$(".xp-j i");if(bar)setTimeout(()=>{bar.style.width=Math.min(100,(B.pts+n.pts)/20*100)+"%";},200);}
    const se=seLit(),dansSe=se&&!se.fin&&se.sid===sid&&se.ep===ep&&se.ids.includes(n.id),nx=dansSe?se.ids[se.ids.indexOf(n.id)+1]:null,kx=nx?C.notions.findIndex(m=>m.id===nx):-1;
    const suite=dansSe?(kx>=0?`Suite de ta séance : ${C.notions[kx].t}`:se.rouges?"Fin de la séance : tes cartes en rouge":"Fin de la séance"):p.i+1<N?`Notion suivante : ${C.notions[p.i+1].t}`:"Le sujet express";
    const msg=r.ok?(nouveau?`<p class="muted">${virg(B.pts+n.pts)} points ${C.du} sur 20 assurés.</p>`:""):`<p class="muted">Refais-en un tout de suite, avec d'autres nombres : c'est là que ça rentre.</p>`;
    $("#xp-fb").insertAdjacentHTML("beforeend",msg);
    pied(r.ok?`<button class="btn" id="xp-re">Encore un, pour être sûr</button><button class="btn pri big" id="xp-go">${suite}</button>`
      :`<button class="btn" id="xp-go">Passer à la suite</button><button class="btn pri big" id="xp-re">Refais-en un</button>`);
    $("#xp-go").addEventListener("click",()=>{if(dansSe){if(kx>=0){const q=posDe(sid,ep);q.i=kx;q.st=0;garde(sid,ep,q);notion(sid,ep);}else{se.fin=1;seEcrit(se);location.hash=se.rouges?"#/"+sid+"/cartes/rouge":"#/";}return;}
      const q=posDe(sid,ep);q.i=p.i+1;q.st=0;garde(sid,ep,q);notion(sid,ep);});
    $("#xp-re").addEventListener("click",()=>{const q=posDe(sid,ep);q.i=p.i;q.st=2;garde(sid,ep,q);notion(sid,ep);});};
  b.innerHTML=tx(`<p class="prekick">À toi · ${exoMin(n)} min ${C.au}, sans regarder la méthode</p><div id="xp-ex"></div><div id="xp-fb"></div>`);
  pied(presse(sid,ep));
  if(n.rappel)rappel($("#xp-ex"),n.rappel,r=>{$("#xp-fb").innerHTML=`<div class="verdict ${r.ok?"ok":"no"}">${r.ok?"Bien : tu l'as.":"Pas encore : relis-la, puis réécris-la de mémoire."}</div>`;fini(r);},C.t);
  else{const e=ENT.exoDans($("#xp-ex"),{g:n.exo.g,lv:n.exo.lv,gr:graine(sid,ep,n.id,p.k||0)},r=>{$("#xp-fb").innerHTML=`<div class="verdict ${r.ok?"ok":"no"}">${r.ok?"Notion réussie.":"Notion pas encore réussie."}</div>`;fini(r);},{origine:C.t});
    if(!e)pied(`<button class="btn pri big" id="xp-go">Passer à la suite</button>`),$("#xp-go").addEventListener("click",()=>{const q=posDe(sid,ep);q.i=p.i+1;q.st=0;garde(sid,ep,q);notion(sid,ep);});}}

/* une question de cours à réécrire de mémoire, puis comparée */
function rappel(host,R,fin,orig){const t0=Date.now();
  host.innerHTML=tx(`<p class="lq">${R.q}</p><div class="paper"><p><b>Sur ta feuille</b>, de mémoire, puis compare.</p></div><div class="acts"><button class="btn pri" id="xr-v">Voir la réponse</button></div><div id="xr-r"></div>`);
  host.querySelector("#xr-v").addEventListener("click",()=>{host.querySelector("#xr-v").parentNode.remove();
    host.querySelector("#xr-r").innerHTML=tx(`<h3>La réponse</h3>${R.r}<div class="acts"><button class="btn" id="xr-n">Pas tout à fait</button><button class="btn pri" id="xr-o">Je l'avais, tout</button></div>`);
    const fait=ok=>{host.querySelectorAll("#xr-r .acts").forEach(x=>x.remove());A.logRep({o:orig||"le CC en 1 h",s:R.sid||"",enonce:A.brut(R.q),reponse:ok?"je l'avais":"pas tout à fait",ok:ok?1:0,ms:Date.now()-t0});fin({ok,part:ok?1:0,ms:Date.now()-t0});};
    host.querySelector("#xr-o").addEventListener("click",()=>fait(true));host.querySelector("#xr-n").addEventListener("click",()=>fait(false));});}

function sujet(sid,ep,depart){const C=X(sid,ep),N=C.notions.length;let p=posDe(sid,ep);
  if(depart&&p.i<N){p.i=N;p.st=0;p.bq=0;p.bres=[];garde(sid,ep,p);}
  const B=bilan(sid,ep),Q=C.blanc,sur=surBlanc(C);
  if(p.st===0||p.bq>=Q.length&&!p.bres.length){cadre(sid,ep,`Le sujet express · ${Q.length} questions · noté sur ${sur}`,B.pts);
    $("#lpb").innerHTML=tx(`<p class="prekick">Comme ${C.au} · ${minBlanc(C)} min</p><h2>Le sujet express</h2><p>${C.blancLead}</p><div class="el-bar">${Q.map((q,k)=>`<div><span>${k+1}. ${q.t}<small>${q.ou}</small></span><b>${virg(q.pts)} pts</b></div>`).join("")}</div>`);
    pied(`<button class="btn pri big" id="xp-go">Commencer le sujet</button>`);
    $("#xp-go").addEventListener("click",()=>{tic();const q=posDe(sid,ep);q.i=N;q.st=1;q.bq=0;q.bres=[];garde(sid,ep,q);sujet(sid,ep);});return;}
  if(p.bq>=Q.length)return note(sid,ep);
  const q=Q[p.bq];
  cadre(sid,ep,`Le sujet express · question ${p.bq+1} sur ${Q.length} · ${virg(q.pts)} points · ${q.ou}`,B.pts);
  $("#lpb").innerHTML=`<p class="prekick">${q.t} · ${exoMin({exo:q})} min</p><div id="xp-ex"></div><div id="xp-fb"></div>`;pied("");
  ENT.exoDans($("#xp-ex"),{g:q.g,lv:q.lv,gr:graine(sid,ep,"blanc",p.bk||0,p.bq)},r=>{tic();const z=posDe(sid,ep);z.bres[p.bq]=Math.round(r.part*100)/100;z.bq=p.bq+1;garde(sid,ep,z);
    $("#xp-fb").innerHTML=`<div class="verdict ${r.ok?"ok":"no"}">${virg(r.part*q.pts)} sur ${virg(q.pts)}</div>`;
    pied(`<button class="btn pri big" id="xp-go">${p.bq+1<Q.length?"Question suivante":"Voir ma note"}</button>`);$("#xp-go").addEventListener("click",()=>sujet(sid,ep));},{origine:C.t+" : le sujet express"});}

function note(sid,ep){const C=X(sid,ep),p=posDe(sid,ep),Q=C.blanc,sur=surBlanc(C),B0=bilan(sid,ep);
  const brut=Q.reduce((s,q,k)=>s+(p.bres[k]||0)*q.pts,0),n=Math.round(brut/sur*20*4)/4;
  tic();const ms=p.ms;A.emit({k:"cchb",s:sid,ep,note:n,ms,res:p.bres.slice()});if(window.ENT){try{ENT.pastille();}catch(x){}}
  const res=p.bres.slice();garde(sid,ep,Object.assign({},p,{bq:0,bres:[],bk:(p.bk||0)+1,st:0}));arrete();
  const R=palier(C,n),rates=C.notions.filter(x=>!bilan(sid,ep).ok[x.id]),mn=Math.round(ms/60e3);
  $("#main").className="s-"+sid;document.body.classList.remove("in-lesson");
  $("#main").innerHTML=`<div class="page lp-end s-${sid}"><p class="kick">${C.t}</p><h1>${R?R[1]:"Pas encore la moyenne"}</h1>
   <p class="score">${virg(n)} / 20</p><p class="lead">Une estimation de ta note avec ce sujet express${B0.meilleur!=null&&n>B0.meilleur?`, ta meilleure jusqu'ici (avant : ${virg(B0.meilleur)})`:""}. Chrono du parcours : ${mn} min${mn>maxMin(C)?` (prévu : ${prevu(C)} min)`:""}.</p>
   <div class="el-bar">${Q.map((q,k)=>`<div${res[k]?"":` class="zero"`}><span>${q.t}<small>${q.ou}</small></span><b>${virg((res[k]||0)*q.pts)} / ${virg(q.pts)}</b></div>`).join("")}</div>
   ${rates.length?`<p>À reprendre d'abord : ${rates.slice(0,3).map(x=>x.t).join(", ")}${rates.length>3?"…":"."}</p>`:""}
   <div class="acts"><a class="btn pri big" href="${base(sid,ep)}/sujet">Un autre sujet express (d'autres nombres)</a>${rates.length?`<a class="btn" href="${base(sid,ep)}/notion/${rates[0].id}">Reprendre : ${rates[0].t}</a>`:""}<a class="btn" href="#/">Retour à aujourd'hui</a></div></div>`;}

function route(sid,ep,parts){const C=X(sid,ep);if(!C||!SUBJ[sid]){location.replace("#/entrainer");return;}
  const a=parts[0];
  if(!a)return accueil(sid,ep);
  if(a==="go"){const p=posDe(sid,ep);return p.i>=C.notions.length?sujet(sid,ep):notion(sid,ep);}
  if(a==="sujet"){const p=posDe(sid,ep);if(p.i<C.notions.length||p.st===0||p.bq>=C.blanc.length){p.i=C.notions.length;p.st=0;p.bq=0;p.bres=[];garde(sid,ep,p);}return sujet(sid,ep);}
  if(a==="notion"&&parts[1]){const k=C.notions.findIndex(n=>n.id===parts[1]);if(k>=0){const p=posDe(sid,ep);p.i=k;p.st=parts[2]==="exo"&&C.notions[k].exo?2:0;garde(sid,ep,p);}return notion(sid,ep);}
  if(a==="seance"){const S0=seance();if(!S0||S0.sid!==sid||S0.ep!==ep||!S0.ids.length){location.replace("#/");return;}
    const se=seLit(),reprise=se&&se.sid===sid&&se.ep===ep&&!se.fin&&se.ids.some(id=>!S0.B.ok[id]);const o=reprise?se:{jour:A.today(),sid,ep,ids:S0.ids,rouges:S0.rouges};seEcrit(o);
    const id=o.ids.find(x=>!bilan(sid,ep).ok[x])||o.ids[0],k=C.notions.findIndex(n=>n.id===id),p=posDe(sid,ep);if(p.i!==k){p.i=k;p.st=0;garde(sid,ep,p);}return notion(sid,ep);}
  accueil(sid,ep);}

/* l'entrée : une carte en haut d'Aujourd'hui, de S'entraîner et de la page de la matière, les jours qui précèdent l'épreuve */
function proche(){const L=[];Object.keys(window.EXPRESS||{}).forEach(sid=>{const S=SUBJ[sid];if(!S)return;const E=A.exam(S);if(!E||!window.EXPRESS[sid][E.id])return;
  const j=(new Date(E.day+"T12:00")-new Date(A.today()+"T12:00"))/864e5;const C=X(sid,E.id);if(j>=0&&(j<=(E.report?14:10)||maxMin(C)>=120))L.push({sid,ep:E.id,E,j});/* reportée : posée à 14 jours ; examen en 2 h : dès maintenant (76a) */});return L.sort((a,b)=>a.j-b.j);}
/* choix 70a : sur Aujourd'hui, la note que tu sais déjà aller chercher à chaque épreuve proche (estimation du site, ou le CC en 1 h si c'est plus) */
function notes(pg){if(pg.querySelector(".xp-notes"))return "";const t0=A.today(),L=[];
  A.SIDS.forEach(sid=>{const S=SUBJ[sid],E=A.exam(S);if(!E||E.off||!E.day)return;if(A.examStart(S)<=A.NOW())return;const j=(new Date(E.day+"T12:00")-new Date(t0+"T12:00"))/864e5;if(j<0||j>21)return;
    let v=null;try{const e=A.estime(sid);if(e)v=e.note;}catch(x){}const C=X(sid,E.id);if(C){const b=bilan(sid,E.id).pts;if(v==null||b>v)v=b;}L.push({sid,S,E,j,v});});
  if(!L.length)return "";L.sort((a,b)=>a.j-b.j);
  const ligne=x=>{const n=x.v==null?null:Math.round(x.v*2)/2;
    return `<div class="s-${x.sid}"><span>${x.S.name} · ${x.E.label} ${x.E.report?"reporté":A.dayName(x.E.day,false,true)}<small>${n==null?`à estimer : <a href="#/${x.sid}/niveau">Où j'en suis en ${x.S.name}</a>`:n>=14?"Bonne note":n>=10?"Moyenne assurée":`moyenne à 10 (encore ${virg(10-n)})`}</small><span class="lp-bar xp-ligne"><i style="width:${n==null?0:Math.min(100,n*5)}%"></i></span></span><b>${n==null?"?":virg(n)} / 20</b></div>`;};
  return `<section class="el-recap xp-notes"><p class="prekick">Tes notes, d'après ce que tu sais faire</p><div class="el-bar">${L.slice(0,4).map(ligne).join("")}</div></section>`;}
function carte(){const main=$("#main");if(!main)return;const pg0=main.querySelector(".page");
  if(pg0&&(location.hash||"#/").replace(/^#\/?/,"")===""&&!pg0.querySelector(".xp-notes")){const h=notes(pg0);if(h){const pr=pg0.querySelector(".tiroir.prog"),h1=pg0.querySelector("h1");if(pr)pr.insertAdjacentHTML("afterend",h);else if(h1)h1.insertAdjacentHTML("afterend",h);}}
  const h=(location.hash||"#/").slice(2).split("/").filter(Boolean);
  if(h[0]==="lecon"&&SUBJ[h[1]]&&h[2])return encadreLecon(main,h[1],h[2]);
  if(main.querySelector(".xp-carte,.xp-vers"))return;
  const pg=main.querySelector(".page");if(!pg)return;
  if(!h.length)return accueilJour(pg);
  const L=h.length===1&&SUBJ[h[0]]?aVenir(h[0]):proche().filter(x=>!h.length||h[0]==="entrainer"&&h.length===1);if(!L.length)return;
  const html=L.map(x=>{const C=X(x.sid,x.ep),B=bilan(x.sid,x.ep),p=posDe(x.sid,x.ep),quand=x.j===0?"aujourd'hui":x.j===1?"demain":A.dayName(x.E.day,false,true);
    return `<section class="el-recap xp-carte"><p class="prekick">${x.E.label} ${SUBJ[x.sid].name} ${quand}${x.E.start?" à "+x.E.start.replace(":00"," h").replace(":"," h "):""}</p><p><b>${C.t}</b> : ${C.carte}</p>${jauge(C,B.pts)}<div class="acts"><a class="btn pri big" href="${base(x.sid,x.ep)}/go">${p.ms?"Reprendre":`Commencer · ${dureeTxt(C)} chrono`}</a><a class="btn" href="${base(x.sid,x.ep)}">Le parcours</a></div></section>`;}).join("");
  const h1=pg.querySelector("h1");let apres=h1;if(apres&&apres.nextElementSibling&&apres.nextElementSibling.matches(".hlead,.lead"))apres=apres.nextElementSibling;
  if(h.length===1&&SUBJ[h[0]]&&h1)apres=h1;
  if(apres)apres.insertAdjacentHTML("afterend",html);else pg.insertAdjacentHTML("afterbegin",html);
  if(h.length===1&&SUBJ[h[0]])replie(pg,"Le reste de la matière : leçons, fiches, annales");}

/* choix 80a et 81a (24/11 au soir) : sur Aujourd'hui, rien ne change en haut ; sous l'emploi du temps, la séance du jour en une petite carte
   et une ligne vers « Tes parcours » ; les notes estimées et le temps gagné sous le programme du jour */
const nomCourt=sid=>({algo:"Algo",rai:"Raisonnement",lin:"Algèbre",geo:"Géométrie",calc:"Calculus",ana:"Analyse",pf:"PF",usi:"USI",aut:"Automates"})[sid]||SUBJ[sid].name;
const quandEp=x=>x.E.report?"reporté":A.dayName(x.E.day,false,true);
function accueilJour(pg){const L=proche(),S0=seance(),G=gagne();
  const edt=[...pg.querySelectorAll(".tiroir")].find(t=>/^Emploi du temps/.test((t.querySelector(".tiroir__title")||{}).textContent||"")),pr=pg.querySelector(".tiroir.prog");
  const ici=edt||pr;if(!ici||!L.length&&!S0)return;
  ici.insertAdjacentHTML("afterend",(S0?carteSeance(S0):"")+(L.length?`<p class="gomore xp-vers"><a href="#/express">Tes parcours : ${L.map(x=>nomCourt(x.sid)+" "+quandEp(x)).join(" · ")}</a></p>`:""));
  if(G){const nt=pg.querySelector(".xp-notes")||pr;if(nt)nt.insertAdjacentHTML("afterend",`<p class="el-pt xp-gagne"><b>Temps gagné cette semaine : ${hm(G.g)}.</b> Le planning prévoyait ${hm(G.prevu)} de leçons pour ce que tu as réussi en ${hm(G.p)} dans les parcours.</p>`);}}
/* la page « Tes parcours » (#/express) : un parcours par épreuve à venir, de la plus proche à la plus lointaine */
function pageParcours(){const L=A.SIDS.flatMap(sid=>aVenir(sid)).sort((a,b)=>a.j-b.j);
  const C0=L.length?X(L[0].sid,L[0].ep):null,leg=C0?C0.paliers.map(p=>`<b>${p[0]}</b> : ${p[1].charAt(0).toLowerCase()+p[1].slice(1)}`).join(", "):"";
  $("#main").innerHTML=`<div class="page wide"><a class="back" href="#/">‹ Aujourd'hui</a><h1>Tes parcours</h1><p class="lead">Pour chaque épreuve, les exercices qui rapportent le plus de points d'abord, puis un sujet express noté sur 20.${leg?` Sur chaque barre, ${leg}.`:""}</p>${L.map(x=>{const C=X(x.sid,x.ep),B=bilan(x.sid,x.ep),p=posDe(x.sid,x.ep);
    return `<section class="el-recap xp-carte"><p class="prekick">${x.E.label} ${SUBJ[x.sid].name} · ${quandEp(x)}${x.E.start&&!x.E.report?" à "+x.E.start.replace(":00"," h").replace(":"," h "):""}</p><p><b>${C.t}</b> : ${C.carte}</p>${jauge(C,B.pts,"",true)}<div class="acts"><a class="btn pri" href="${base(x.sid,x.ep)}/go">${p.ms?"Reprendre":`Commencer · ${dureeTxt(C)} chrono`}</a><a class="btn" href="${base(x.sid,x.ep)}">Le parcours</a></div></section>`;}).join("")||`<p class="muted">Aucune épreuve à venir n'a de parcours.</p>`}</div>`;
  window.scrollTo(0,0);}

/* choix 73a : la séance du jour, le plus court chemin vers la note : les notions pas encore réussies de l'épreuve la plus proche (25 min au plus), puis les cartes en rouge */
const SEKEY="rev-s1-seance",SEANCE=25;
const seLit=()=>{try{const o=JSON.parse(localStorage.getItem(SEKEY)||"null");return o&&o.jour===A.today()?o:null;}catch(x){return null;}};
const seEcrit=o=>{try{localStorage.setItem(SEKEY,JSON.stringify(o));}catch(x){}};
const rouges=sid=>{const S=SUBJ[sid],st=A.ST&&A.ST[sid];return S&&st&&st.review&&S.ORDER?S.ORDER.filter(c=>st.review[c.id]).length:0;};
function seance(){const x=proche()[0];if(!x)return null;const C=X(x.sid,x.ep),B=bilan(x.sid,x.ep),r=Math.min(rouges(x.sid),10),ids=[];let t=r*0.5;
  for(const n of C.notions){if(B.ok[n.id])continue;const m=minNotion(n);if(ids.length&&t+m>SEANCE)break;ids.push(n.id);t+=m;}
  if(!ids.length&&!r)return null;return {sid:x.sid,ep:x.ep,x,C,B,ids,rouges:r,min:Math.max(5,Math.round(t))};}
function carteSeance(S0){const {x,C,B,ids,rouges:r}=S0,quand=x.j===0?"aujourd'hui":x.j===1?"demain":A.dayName(x.E.day,false,true),fait=(seLit()||{}).fin;
  const de=/^[aeiouyéèêàâîôûh]/i.test(nomCourt(x.sid))?"d'":"de ",quoi=ids.length?`${ids.length} ${ids.length>1?"exercices":"exercice"} du ${x.E.label} ${de}${nomCourt(x.sid)} (${quand}) que tu ne sais pas encore faire${r?`, puis ${r} carte${r>1?"s":""} en rouge`:""}.`:`Le parcours du ${x.E.label} ${de}${nomCourt(x.sid)} est réussi : il reste ${r} carte${r>1?"s":""} en rouge.`;
  const go=ids.length?`${base(x.sid,x.ep)}/seance`:`#/${x.sid}/cartes/rouge`;
  return `<section class="el-recap xp-carte xp-seance"><p class="prekick">Ta séance du jour${fait?" (faite : encore une ?)":""} · ${S0.min} min</p><p>${quoi}</p><div class="acts"><a class="btn pri" href="${go}">Commencer</a></div></section>`;}
/* choix 78a : les leçons dont toutes les notions du parcours de la prochaine épreuve sont réussies, avec le jour de la réussite */
function leconsReussies(sid){const S=SUBJ[sid],E=S&&A.exam(S),C=E&&X(sid,E.id),R={};if(!C)return R;const quand={},par={};
  A.journal().forEach(e=>{if(e.k==="cch"&&e.s===sid&&e.ep===E.id&&e.ok&&!quand[e.n])quand[e.n]=e.t;});
  C.notions.forEach(n=>{const g=n.exo&&GEN.par[n.exo.g];(g&&g.lecons||[]).forEach(l=>{(par[l]=par[l]||[]).push(n.id);});});
  Object.entries(par).forEach(([l,ids])=>{if(ids.every(id=>quand[id]))R[l]=A.ymd(new Date(Math.max(...ids.map(id=>quand[id]))));});return R;}
/* choix 79a : le temps gagné cette semaine, calculé : les minutes que le planning prévoyait pour les leçons réussies dans les parcours cette semaine,
   moins le temps passé sur ces notions (exercices mesurés, lecture prévue) ; rien si le calcul n'a pas de base */
function gagne(){const d=new Date(A.today()+"T12:00"),lun=A.ymd(new Date(d.getTime()-((d.getDay()+6)%7)*864e5));let prevu=0,passe=0;const vus={},lus={};
  Object.keys(window.EXPRESS||{}).forEach(sid=>{const S=SUBJ[sid],E=S&&A.exam(S),C=E&&X(sid,E.id);if(!C)return;
    Object.entries(leconsReussies(sid)).forEach(([l,j])=>{const T=S.TB&&S.TB["L-"+l];if(j>=lun&&T&&T.min&&!vus[sid+l]){vus[sid+l]=1;prevu+=T.min;}});
    A.journal().forEach(e=>{if(e.k==="cch"&&e.s===sid&&e.ep===E.id&&A.ymd(new Date(e.t))>=lun){passe+=(e.ms||0)/60e3;const n=C.notions.find(m=>m.id===e.n);if(n&&!lus[sid+n.id]){lus[sid+n.id]=1;passe+=n.lect||0;}}});});
  const p=Math.round(passe),g=Math.round(prevu-p);return prevu&&g>0?{g,prevu,p}:null;}
const hm=m=>m>=60?Math.floor(m/60)+" h"+(m%60?" "+String(m%60).padStart(2,"0"):""):m+" min";
/* choix 75a : sur la page d'une matière, un parcours par épreuve à venir */
function aVenir(sid){const S=SUBJ[sid],t0=A.today(),L=[];if(!S||!window.EXPRESS||!window.EXPRESS[sid])return L;
  (A.examsOf?A.examsOf(S):S.exams||[]).forEach((e0,i)=>{const E=A.examAt?A.examAt(S,i):e0;if(!E||E.off||!E.day||!window.EXPRESS[sid][E.id])return;const j=(new Date(E.day+"T12:00")-new Date(t0+"T12:00"))/864e5;if(j>=0)L.push({sid,ep:E.id,E,j});});
  return L.sort((a,b)=>a.j-b.j);}
/* le reste de la page, replié derrière un bouton (73a, 75a) ; déplié, il le reste jusqu'à la fin de la visite */
function replie(pg,lib){let dep=false;try{dep=sessionStorage.getItem("rev-s1-deplie")===location.hash;}catch(x){}if(dep||pg.querySelector(".xp-reste"))return;
  const cach=[...pg.children].filter(x=>!x.matches("h1,.hlead,.lead,.back,.stitle,.kick,.xp-carte,.xp-gagne"));if(!cach.length)return;
  cach.forEach(x=>{x.dataset.xpAvant=x.style.display;x.style.display="none";});
  pg.insertAdjacentHTML("beforeend",`<div class="acts xp-reste"><button class="btn">${lib}</button></div>`);
  pg.querySelector(".xp-reste button").addEventListener("click",()=>{try{sessionStorage.setItem("rev-s1-deplie",location.hash);}catch(x){}cach.forEach(x=>{x.style.display=x.dataset.xpAvant||"";});pg.querySelector(".xp-reste").remove();});}
/* choix 74a : en haut d'une leçon liée au parcours de la prochaine épreuve, ce qu'elle rapporte ; une fois par visite */
let LVU=null;
function notionsDeLecon(sid,lid){const S=SUBJ[sid],E=S&&A.exam(S),C=E&&X(sid,E.id);if(!C)return null;
  const NS=C.notions.filter(n=>n.exo&&GEN.par[n.exo.g]&&(GEN.par[n.exo.g].lecons||[]).includes(lid));return NS.length?{sid,ep:E.id,E,C,NS}:null;}
function encadreLecon(main,sid,lid){if(LVU===location.hash||main.querySelector(".xp-lecon"))return;const D=notionsDeLecon(sid,lid);if(!D)return;
  const pg=main.querySelector(".page")||main,B=bilan(D.sid,D.ep),pts=D.NS.reduce((s,n)=>s+n.pts,0);LVU=location.hash;
  const html=`<section class="el-recap xp-lecon"><p class="prekick">Elle prépare ${virg(pts)} point${pts>1?"s":""} du ${D.E.label}</p><p>Dans le parcours : ${D.NS.map(n=>n.t.charAt(0).toLowerCase()+n.t.slice(1)).join(", ")}. La leçon, puis <b>un exercice du niveau du CC</b> à faire avant de voir la correction.</p>${jauge(D.C,B.pts)}</section>`;
  const h1=pg.querySelector("h1");if(h1)h1.insertAdjacentHTML("afterend",html);else pg.insertAdjacentHTML("afterbegin",html);}

const init0=EXT.init;
EXT.init=function(A0){const ext=init0.call(EXT,A0);A=A0;
  try{ext.routes=ext.routes||{};ext.routes.express=parts=>parts[0]?route(parts[0],parts[1],parts.slice(2)):pageParcours();
    window.addEventListener("hashchange",()=>{LVU=null;if(!/^#\/express\//.test(location.hash))arrete();});
    window.addEventListener("pagehide",()=>{try{tic();envoie();}catch(e){}});
    document.addEventListener("visibilitychange",()=>{if(document.hidden){if(CH)tic();envoie();}else if(CH)CH.t=Date.now();},true);
    setTimeout(()=>{try{new MutationObserver(carte).observe($("#main"),{childList:true});carte();}catch(e){console.error(e);}},0);}catch(e){console.error(e);}
  return ext;};
window.EXPRESS_OUTILS={bilan,prevu,minNotion,minBlanc,surBlanc,posDe,proche,seance,aVenir,notionsDeLecon:(s,l)=>notionsDeLecon(s,l),leconsReussies:s=>leconsReussies(s),gagne:()=>gagne()};/* pour les essais */
})();
