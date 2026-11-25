/* Apprendre : les leçons pas à pas, la révision espacée, la synchronisation entre appareils,
   et les pages pensées pour le téléphone (Aujourd'hui, Apprendre, Réviser, S'entraîner, Plus).
   Principes (voir la page « Comment réviser ») : se tester plutôt que relire, espacer,
   exemples corrigés avant les exercices, une seule idée par écran, correction immédiate. */
(function(){
"use strict";
window.EXT={init(A){
const {work,factor,measured,doneTodayMin}=A;
const {$,SUBJ,SIDS,ST,LES,lesOf,emit,today,NOW,addDays,dayName,exam,examStart,jx,hm,hh,sec,plan,isDone,doneOn,taskHTML,blockHTML,bindTicks,fixLinks,mount,cardIds}=A;
const esc=W.esc;
const exW=S=>{const l=(exam(S)||{}).label||"CC";return /^CC/.test(l)?"CC":l;};
const BYL={};SIDS.forEach(id=>{BYL[id]={};(LES[id]||[]).forEach((L,i)=>{L.i=i;L.sid=id;BYL[id][L.id]=L;});});
const upcoming=()=>SIDS.filter(id=>examStart(SUBJ[id])>NOW()).sort((a,b)=>examStart(SUBJ[a])-examStart(SUBJ[b]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const plural=(n,s,p)=>n>1?(p||s+"s"):s;
const examLine=S=>{const e=exam(S);return e.report?"reporté, date à venir":`${dayName(e.day,false)} à ${e.start.replace(":","h")}`;};
const hrefTask=(sid,t)=>t.lesson?`#/lecon/${sid}/${t.lesson}`:t.td?`#/${sid}/td`:t.links&&t.links.length?(t.links[0][0].startsWith("#")?t.links[0][0]:`#/${sid}/${t.links[0][0]}`):`#/${sid}`;
const A4={algo:"A5, à recopier ligne par ligne",pf:"A4 recto-verso, à recopier ligne par ligne"};

/* ================= les cartes « À retenir » et la révision espacée ================= */
/* empreinte courte d'une question : elle retrouve la question même si la leçon gagne ou perd des écrans */
const qh=s=>{let h=2166136261;const t=s.k+":"+String(s.q||"")+"|"+String(s.code||(s.lines||[]).join("\n"));for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
/* une question du quiz ou d'une leçon, retrouvée par l'empreinte du carnet ; null si elle n'est plus au programme */
const QIDX={};
function quizQ(sid,k){const S=SUBJ[sid];if(!S)return null;
  if(!QIDX[sid]){const m=QIDX[sid]={};(LES[sid]||[]).forEach(L=>L.steps.forEach(x=>{if(x.k==="qcm")m[A.hq(x)]={q:x,L};}));S.quiz.forEach(x=>{m[A.hq(x)]={q:x,L:null};});}
  const r=QIDX[sid][k];if(!r)return null;
  return r.L?(A.inScope(S,r.L)&&!r.q.ctx?r:null):(A.activeQuiz(S).includes(r.q)?r:null);}
/* les leçons qui expliquent une fiche : celles de ses thèmes, au programme de l'épreuve qui vient */
function lecsFiche(sid,fid){const S=SUBJ[sid],out=[];
  (S.themes||[]).forEach(T=>{if((T.fiches||[]).includes(fid))(T.les||[]).forEach(l=>{const L=BYL[sid][l];if(L&&A.inScope(S,L)&&!out.includes(l))out.push(l);});});
  const suf=x=>x.slice(x.indexOf("-")+1),m=out.filter(l=>suf(l)===suf(fid));/* « ana-extraites » : d'abord la leçon de même nom, « a-extraites » */
  return m.length?m:out;}
const expliquee=(sid,fid)=>{const ls=lecsFiche(sid,fid);return ls.length>0&&ls.every(l=>ST[sid].les[l]);};
/* la leçon à faire (ou à refaire) quand une carte n'a « jamais été vue » */
function leconDe(sid,cid){
  if(cid.indexOf("q:")===0){const r=quizQ(sid,cid.slice(2));if(!r)return null;if(r.L)return r.L.id;if(!r.q.link)return null;cid="c:"+r.q.link;}
  if(cid.indexOf("c:")===0){const ls=lecsFiche(sid,cid.slice(2));return ls.find(l=>!ST[sid].les[l])||ls[0]||null;}
  if(cid.indexOf("e:")===0){const c=ST[sid].cards[cid],d=c&&window.GEN&&GEN.par[c.g];return d?(d.lecons||[]).find(l=>BYL[sid][l])||null:null;}
  const l=cid.replace(/^m:/,"").split("#")[0];return BYL[sid][l]?l:null;}
function cardOf(sid,cid){
  if(cid.indexOf("c:")===0){const c=SUBJ[sid].BY[cid.slice(2)];return c?{f:c.q,b:c.a,src:`Fiche : ${c.short||c.t}`,link:`#/${sid}/c/${c.id}`}:null;}
  if(cid.indexOf("m:")===0){/* une question ratée dans une leçon : la question d'un côté, la bonne réponse et l'explication de l'autre */
    const [ml,mq]=cid.slice(2).split("#"),ML=BYL[sid][ml],s=ML&&ML.steps.find(x=>(x.k==="qcm"||x.k==="blanks"||x.k==="order")&&qh(x)===mq);if(!s||s.ctx)return null;/* pas de carte pour une question qui ne se comprend que dans sa leçon */
    const lang=s.lang||SUBJ[sid].lang||"txt",src=`Question ratée · leçon : ${ML.t}`,link=`#/lecon/${sid}/${ml}`,ex=s.e?`<p>${s.e}</p>`:"";
    if(s.k==="qcm")return {f:`${s.q}${s.code?W.code(s.code,lang):""}`,b:`<p><b>${s.o[s.a]}</b></p>${ex}`,src,link};
    if(s.k==="blanks"){const fill=g=>s.code.replace(/\[\[(\d+)\]\]/g,g),show=t=>s.prose?`<p>${esc(t)}</p>`:W.code(t,lang);
      return {f:`${s.q}${s.show?W.code(s.show,s.showLang||"txt"):""}${show(fill(()=>"____"))}`,b:`${show(fill((m,n)=>s.b[+n].o[s.b[+n].a]))}${ex}`,src,link};}
    if(s.k==="order")return {f:`${s.q}${s.show?W.code(s.show,s.showLang||"txt"):""}<p class="muted">Écris-le sur une feuille, sans regarder.</p>`,b:`${s.lang==="txt"?`<ol class="par-sol">${s.lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ol>`:W.code(s.lines.join("\n"),lang)}${ex}`,src,link};
    return null;}
  if(cid.indexOf("p:")===0){/* une question ratée sur une page (QCM de la page) : la question écrite pour se comprendre seule */
    const [pid,i]=cid.slice(2).split("#"),S=SUBJ[sid],P=S.pages.find(x=>x.id===pid),q=((S.pageQ||{})[pid]||[])[+i];if(!P||!q)return null;
    return {f:W.tx(q.seul||q.q),b:W.tx(`<p><b>${q.o[q.a]}</b></p><p>${q.w}</p>`),src:`Question ratée · page : ${P.t}`,link:`#/${sid}/p/${pid}`};}
  if(cid.indexOf("q:")===0){/* une question ratée au quiz ou au mini-contrôle : la question, puis la bonne réponse et la fiche au dos */
    const r=quizQ(sid,cid.slice(2));if(!r)return null;const q=r.q,S=SUBJ[sid],F=q.link&&S.BY[q.link],o=(ST[sid].cards[cid]||{}).o,lang=q.lang||S.lang||"txt";
    return {f:`${q.q}${q.code?W.code(q.code,lang):""}`,b:`<p><b>${q.o[q.a]}</b></p>${q.e?`<p>${q.e}</p>`:""}${F?`<p><b>La fiche « ${F.short||F.t} » :</b> ${F.plain||""}</p>`:""}`,
      src:`Question ratée · ${o==="mix"?"mini-contrôle mélangé":r.L?"leçon : "+r.L.t:"quiz de cours"}${F?" · fiche : "+(F.short||F.t):""}`,link:F?`#/${sid}/c/${F.id}`:r.L?`#/lecon/${sid}/${r.L.id}`:`#/${sid}/quiz`};}
  if(cid.indexOf("e:")===0){/* l'idée clé d'un exercice raté (choix 20b) : le même exercice, retiré par sa graine ; au dos, le chemin de la correction */
    const c=ST[sid].cards[cid],G=window.GEN,d=c&&G&&G.par[c.g];if(!d||!d.paliers[c.lv]||!A.inScope(SUBJ[sid],d))return null;let e;try{e=G.tire(d,c.lv,c.gr);}catch(x){return null;}if(e.cle!==cid.slice(2))return null;
    const ty=ST[sid].err[e.cle],nom=ty&&window.ENT?(ENT.genres.find(x=>x[0]===ty)||[0,""])[1]:"",corps=String(e.corpsPapier!=null?e.corpsPapier:e.corps||"").replace(/<input[^>]*>/g,"<span class=\"trou\">…</span>");
    return {f:W.tx(`${e.q}${corps?`<div>${corps}</div>`:""}<p class="muted">L'idée clé ? Dis de tête les étapes, puis retourne la carte.</p>`),b:W.tx(`<p><b>${esc(d.t)}</b></p><ol class="carte-r__l">${e.etapes.map(x=>`<li>${x.w}</li>`).join("")}</ol>`),
      src:`Exercice raté · ${d.t}${nom?" · "+nom:""}`,link:"#/entrainer/erreurs"};}
  const [lid,n]=cid.split("#"),L=BYL[sid][lid];if(!L)return null;let k=0;
  for(const s of L.steps)if(s.k==="card"){if(k===+n)return {f:s.f,b:s.b,src:`Leçon : ${L.t}`,link:`#/lecon/${sid}/${lid}`};k++;}
  return null;}
function dueCards(){
  const t=today(),n=NOW(),out=[];
  SIDS.forEach(id=>{const S=SUBJ[id];if(examStart(S)<=n)return;const st=ST[id],eve=(examStart(S)-n)<=36*3600e3;
    /* choix 78a : les cartes d'une leçon réussie dans le parcours sont mises de côté jusqu'à l'épreuve, sauf un rappel (2 cartes au plus) 3 jours après */
    let RE={};try{RE=window.EXPRESS_OUTILS?EXPRESS_OUTILS.leconsReussies(id):{};}catch(e){}const rap={},lecDe=cid=>cid.replace(/^m:/,"").split("#")[0];
    const j3=lid=>A.ymd(new Date(new Date(RE[lid]+"T12:00").getTime()+3*864e5)),rappelFait=lid=>Object.entries(st.cards).some(([k,c2])=>lecDe(k)===lid&&c2.last&&c2.last>=j3(lid));
    Object.entries(st.cards).forEach(([cid,c])=>{if(st.jv[cid])return;const lid=lecDe(cid),L=BYL[id][lid];if(L&&!A.inScope(S,L))return;/* une leçon d'une autre épreuve : pas maintenant */
      if(RE[lid]&&!eve){if(t<j3(lid)||rappelFait(lid)||(rap[lid]||0)>=2)return;rap[lid]=(rap[lid]||0)+1;}
      if(cardOf(id,cid)&&(c.due<=t||(eve&&c.last!==t)||RE[lid]))out.push({sid:id,cid,box:c.box});});
    /* une fiche en rouge : sa question seulement une fois faites les leçons qui l'expliquent (sinon, c'est la question ratée qui revient) */
    S.ORDER.forEach(c=>{if(st.review[c.id]&&c.q&&!c.out&&!st.jv["c:"+c.id]&&expliquee(id,c.id))out.push({sid:id,cid:"c:"+c.id,box:-1});});});
  out.forEach(o=>{o.rnd=Math.random();});
  out.sort((a,b)=>(examStart(SUBJ[a.sid])-examStart(SUBJ[b.sid]))||(a.box-b.box)||(a.rnd-b.rnd));
  return out;}
/* cartes à revoir un jour donné : aujourd'hui celles du jour ; plus tard, celles déjà prévues ce jour-là + la moyenne des nouvelles cartes des 7 derniers jours */
function cartesDu(day){if(day<=today())return dueCards().length;let c=0;
  SIDS.forEach(id=>{const S=SUBJ[id],st=ST[id];if(exam(S).day<day)return;
    Object.entries(st.cards).forEach(([cid,k])=>{if(k.due!==day||st.jv[cid])return;const L=BYL[id][cid.replace(/^m:/,"").split("#")[0]];if(L&&!A.inScope(S,L))return;if(cardOf(id,cid))c++;});});
  return c+A.neuvesParJour();}
const dureeTxt=min=>min<1?"moins d'une minute":min<20?Math.round(min)+" min":hm(min);
const secTxt=ms=>{const s=Math.round(ms/1000);return s<60?s+" s":Math.floor(s/60)+" min"+(s%60?" "+String(s%60).padStart(2,"0"):"");};
const dureeCartes=n=>dureeTxt(n*A.tempsCarte().ms/60000);
/* une seule fois par appareil : le temps des cartes déjà notées dans le carnet, envoyé avec le journal */
try{if(!localStorage.getItem("rev-s1-carnet-cartes")){const t0=Date.now();A.repsPropres().then(L=>{let r=0,ms=0,p=0;
  L.forEach(x=>{if(!x||x.o!=="carte de Réviser"||x.note==="jamais vu"||!(x.ms>0)||(x.t||0)>=t0)return;r++;ms+=Math.min(180000,x.ms);if((x.essai||1)===1)p++;});
  if(r)emit({k:"set",key:"carnet:"+A.device(),v:{r,ms,p}});localStorage.setItem("rev-s1-carnet-cartes","1");}).catch(()=>{});}}catch(e){}
function badges(){const n=dueCards().length;document.querySelectorAll("[data-due]").forEach(b=>{b.textContent=n>99?"99+":String(n);b.hidden=!n;});}
/* une seule fois par appareil : les questions ratées au quiz et au mini-contrôle avant cette version, retrouvées dans le carnet */
try{if(!localStorage.getItem("rev-s1-qm-v1"))A.allReps().then(L=>{const bon={},fait={};
  L=L.filter(r=>r&&r.q&&SUBJ[r.s]&&(r.o==="quiz de cours"||r.o==="mini-contrôle mélangé")).sort((a,b)=>(a.t||0)-(b.t||0));
  L.forEach(r=>{if(r.ok)bon[r.s+"|"+r.q]=r.t;});
  L.forEach(r=>{const k=r.s+"|"+r.q;if(r.ok||fait[k]||(bon[k]||0)>r.t||ST[r.s].cards["q:"+r.q]||!quizQ(r.s,r.q))return;fait[k]=1;
    emit({k:"qm",s:r.s,q:r.q,c:r.fiche||null,o:r.o==="quiz de cours"?"quiz":"mix"});});
  localStorage.setItem("rev-s1-qm-v1","1");badges();}).catch(()=>{});}catch(e){}


/* ================= le lecteur de leçon ================= */
let LP=null,TIMER=null,DND=null;
/* « Devine d'abord » : quand une explication est suivie d'une question, on pose cette question une première fois
   AVANT l'explication, sans correction ; on lit ensuite l'explication en y cherchant la réponse, puis on répond
   pour de vrai (effet de pré-question : Pan et Carpenter, 2023). La devinette ne compte pas dans le score. */
function flow(L){if(L.flow)return L.flow;const out=[],T=L.steps;
  T.forEach((st,i)=>{const nx=T[i+1];st.oi=i;
    /* la question d'ouverture vient avant tout cours : c'est une devinette, corrigée tout de suite, hors score */
    if(i===0&&st.k==="qcm"){out.push(Object.assign({},st,{open:true}));return;}
    /* une explication suivie d'une question : la question est seulement annoncée en haut de l'écran (« Tu cherches »),
       puis posée une seule fois, après l'explication */
    if(st.k==="learn"&&nx&&nx.k==="qcm"&&!st.nolook&&!/^Entraîne-toi/.test(st.h||"")&&!(i===1&&T[0].k==="qcm"))out.push(Object.assign({},st,{look:nx.q}));
    else out.push(st);});
  return L.flow=out;}
/* reprendre une leçon là où on l'a laissée : après un rechargement, une fermeture de l'onglet, ou le téléphone qui recharge la page */
const PKEY="rev-s1-lecons-en-cours";
const sig=s=>s?s.k+":"+String(s.q||s.h||s.f||s.c||s.x||"").replace(/<[^>]+>/g,"").slice(0,60):"";
function progAll(){try{const o=JSON.parse(localStorage.getItem(PKEY)||"{}");return o&&typeof o==="object"?o:{};}catch(e){return {};}}
let posT=null,posPending=null;
function posFlush(){if(posT){clearTimeout(posT);posT=null;}if(posPending){const e=posPending;posPending=null;emit(e);}}
function progSave(){if(!LP)return;const F=flow(BYL[LP.sid][LP.id]),now=A.stamp(),rec={i:LP.i,n:F.length,sig:sig(F[LP.i]),got:LP.got,t:LP.t||0,ss:LP.ss||{},ts:now};LP.saved=now;
  try{const all=progAll();all[LP.sid+"/"+LP.id]=rec;localStorage.setItem(PKEY,JSON.stringify(all));}catch(e){}
  posPending={k:"pos",s:LP.sid,l:LP.id,at:rec.i,sig:rec.sig,got:rec.got,dur:rec.t,ss:rec.ss};clearTimeout(posT);posT=setTimeout(posFlush,1500);}
function progDrop(sid,lid,reset){if(posPending&&posPending.s===sid&&posPending.l===lid){clearTimeout(posT);posT=null;posPending=null;}
  try{const all=progAll();delete all[sid+"/"+lid];localStorage.setItem(PKEY,JSON.stringify(all));}catch(e){}if(reset&&ST[sid].pos[lid])emit({k:"pos",s:sid,l:lid,reset:true});}
/* la position la plus récente : celle de cet appareil ou celle arrivée par la synchronisation ; rien si la leçon a été finie depuis */
function progRaw(sid,lid){let a=progAll()[sid+"/"+lid];const b=((ST[sid]||{}).pos||{})[lid],done=(ST[sid].les[lid]||{}).ts||0;if(a&&a.ts<=done)a=null;if(a&&b)return a.ts>=b.ts?a:b;return a||b||null;}
addEventListener("pagehide",posFlush);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")posFlush();});
function progGet(sid,lid){const p=progRaw(sid,lid);if(!p||!BYL[sid]||!BYL[sid][lid]||A.stamp()-p.ts>14*864e5)return null;const F=flow(BYL[sid][lid]);let i=Math.min(p.i,F.length-1);
  if(sig(F[i])!==p.sig){const j=F.findIndex(x=>sig(x)===p.sig);if(j>=0)i=j;}return i>0?Object.assign({},p,{i,n:F.length}):null;}
const newLP=(sid,lid)=>({sid,id:lid,i:0,got:{},t:0,ss:{},last:Date.now()});
const W8={learn:1.2,pre:.4,qcm:.6,blanks:.8,order:1,steps:2,demo:2.5,card:.3};
function stepMins(L,sid){const F=flow(L),est=(SUBJ[sid].TB["L-"+L.id]||{}).min||L.min,w=F.map(x=>x.k==="paper"?Math.max(2,(x.min||10)/4):(W8[x.k]||1)),W=w.reduce((a,b)=>a+b,0);return w.map(x=>x/W*est);}
function parts(L,sid){const F=flow(L),m=stepMins(L,sid),st=[0];let cur=0,rest=m.reduce((a,b)=>a+b,0);
  F.forEach((x,j)=>{const isB=x.k==="pre"||x.k==="steps"||x.k==="demo"||x.k==="paper"||(x.k==="learn"&&!(F[j-1]&&F[j-1].k==="pre"));
    if(j>0&&isB&&cur>=10&&rest>=8){st.push(j);cur=0;}cur+=m[j];rest-=m[j];});return st;}
/* la dernière leçon ouverte : c'est elle, et elle seule, que « Continuer » propose de reprendre (son détail du 21/11 sur la réponse 70) */
const LKEY="rev-s1-derniere-lecon";
const derniere=()=>{try{const o=JSON.parse(localStorage.getItem(LKEY)||"null");return o&&o.sid&&o.lid?o:null;}catch(e){return null;}};
function lessonRoute(args){
  const sid=args[0],lid=args[1];
  if(!BYL[sid]||!BYL[sid][lid]){$("#main").innerHTML=`<div class="page"><h1>Leçon introuvable</h1><p><a class="btn pri" href="#/apprendre">Voir toutes les leçons</a></p></div>`;return;}
  try{localStorage.setItem(LKEY,JSON.stringify({sid,lid,t:A.stamp()}));}catch(e){}
  if(!LP||LP.sid!==sid||LP.id!==lid){const p=progGet(sid,lid),vue=(A.ST[sid].les||{})[lid];LP=newLP(sid,lid);if(p){LP.i=p.i;LP.got=p.got||{};LP.t=p.t||0;LP.ss=p.ss||{};LP.resumed=true;LP.saved=p.ts;}else if(vue&&vue.n)LP.rap=1;else if(window.ENT&&ENT.avant)LP.av=ENT.avant(sid,lid);}
  else{LP.last=Date.now();const p=progGet(sid,lid);if(p&&p.ts>(LP.saved||0)&&p.i!==LP.i){LP.i=p.i;LP.got=p.got||{};LP.t=p.t||0;LP.ss=p.ss||{};LP.resumed=true;LP.saved=p.ts;LP.cp=null;LP.rap=0;}}
  if(LP.rap===1)return rappel(sid,lid);
  if(LP.av)return ENT.avantEcran(LP.av,BYL[sid][lid],()=>{LP.av=null;LP.last=Date.now();drawStep();});
  drawStep();}
/* une leçon déjà finie, rouverte depuis le début : 3 minutes pour écrire de mémoire ce qu'il en retient, puis la leçon (choix 30a du 20/11) ;
   ce qu'il a écrit va dans le journal (événement « mem ») et dans le rapport d'entraînement */
let RPT=0;
function rappel(sid,lid){const L=BYL[sid][lid],S=SUBJ[sid],t0=Date.now(),DUR=180e3;clearInterval(RPT);
  $("#main").className="s-"+sid;
  $("#main").innerHTML=`<div class="page lp-end s-${sid}"><p class="kick">${S.name} · ${esc(L.t)}</p><h1>De mémoire d'abord</h1><p class="lead">Tu as déjà vu cette leçon. Avant de la rouvrir, écris ce que tu en retiens, sans regarder : définitions, méthodes, pièges. 3 minutes. Chercher dans sa mémoire fait mieux retenir que relire.</p><p class="muted" id="rp-ch">Il reste 3:00</p><textarea class="en-in rp-txt" id="rp-txt" rows="8" maxlength="4000" aria-label="Ce que tu retiens de la leçon, de mémoire" spellcheck="false"></textarea><div class="acts"><button class="btn pri big" id="rp-ok">Ouvrir la leçon</button><button class="btn" id="rp-passe">Passer</button></div></div>`;
  const ch=$("#rp-ch"),ouvre=()=>{clearInterval(RPT);const txt=$("#rp-txt").value.trim();if(txt)A.emit({k:"mem",s:sid,l:lid,txt,ms:Date.now()-t0});if(LP&&LP.id===lid)LP.rap=2;drawStep();};
  RPT=setInterval(()=>{if(!ch.isConnected){clearInterval(RPT);return;}const r=Math.max(0,DUR-(Date.now()-t0)),s=Math.ceil(r/1000);ch.textContent=r?`Il reste ${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`:"Les 3 minutes sont passées : ouvre la leçon et compare.";if(!r)clearInterval(RPT);},1000);
  $("#rp-ok").addEventListener("click",ouvre);$("#rp-passe").addEventListener("click",ouvre);$("#rp-txt").focus();}
function mark(v,s,ch){const first=LP.got[LP.i]==null;
  A.logRep(Object.assign({o:"leçon",s:LP.sid,l:LP.id,ecran:LP.i,genre:s&&s.k,note:v,ok:v>=1?1:0,premiere:first?1:0,ms:Date.now()-(LP.shownT||Date.now())},s?A.repQ(s,ch==null?-2:ch):{}));if(first){LP.got[LP.i]=v;progSave();}if(v<1&&s&&s.c&&SUBJ[LP.sid].BY[s.c])emit({k:"st",s:LP.sid,c:s.c,v:"review"});
  /* une question ratée revient dans « Réviser », le jour même puis les jours suivants */
  if(first&&v<1&&s&&(s.k==="qcm"||s.k==="blanks"||s.k==="order"))emit({k:"miss",s:LP.sid,l:LP.id,q:qh(s)});}
/* le temps de travail : compté écran par écran (20 min au plus par écran) ; une absence de plus de 10 min compte comme une pause */
const WORK={acc:0,last:0,snooze:0};
function tick(){const now=Date.now();if(LP){LP.t=(LP.t||0)+Math.min(now-(LP.last||now),20*60e3);LP.last=now;}
  if(WORK.last&&now-WORK.last>10*60e3)WORK.acc=0;else if(WORK.last)WORK.acc+=Math.min(now-WORK.last,20*60e3);WORK.last=now;}
function pauseBar(){if(WORK.acc<45*60e3||Date.now()<WORK.snooze)return "";const m=Math.round(WORK.acc/60000);
  return `<div class="pausebar" role="status"><b>Ça fait ${m} min que tu travailles.</b> Fais une pause de 10 à 15 minutes : lève-toi, bois de l'eau, regarde au loin, sans écran. Ton cerveau range ce que tu viens d'apprendre pendant la pause. La leçon t'attend ici.<div class="acts"><button class="btn ok" id="pz-done">J'ai fait ma pause</button><button class="btn" id="pz-later">Encore 15 min</button></div></div>`;}
function drawStep(){
  clearInterval(TIMER);tick();if(DND){DND.abort();DND=null;document.documentElement.classList.remove("is-dragging");document.querySelectorAll(".par-ghost").forEach(g=>g.remove());}
  const L=BYL[LP.sid][LP.id],S=SUBJ[LP.sid],F=flow(L),N=F.length;
  if(LP.i>=N)return finish();
  const s=F[LP.i];if(LP.shownI!==LP.i){LP.shownI=LP.i;LP.shownT=Date.now();}
  const pct=Math.round(LP.i/N*100),from=LP.pp==null?pct:LP.pp,back=!!LP.back;LP.pp=pct;LP.back=false;
  const PT=parts(L,LP.sid),MN=stepMins(L,LP.sid),pk=PT.filter(x=>x<=LP.i).length,left=Math.max(1,Math.round(MN.slice(LP.i).reduce((a,b)=>a+b,0)/5)*5),resumed=LP.resumed;LP.resumed=false;LP.ss=LP.ss||{};
  const marks=PT.slice(1).map(j=>`<span class="lp-mark" style="left:${j/N*100}%"></span>`).join("");
  if(LP.cp===LP.i&&LP.i>0){const end=PT[pk]||N,pm=Math.max(5,Math.round(MN.slice(LP.i,end).reduce((a,b)=>a+b,0)/5)*5),vals=Object.values(LP.got),ok=vals.filter(v=>v>=1).length;
    $("#main").innerHTML=`<div class="lp s-${LP.sid}"><div class="lp-top"><a class="lp-x" href="#/apprendre" aria-label="Quitter la leçon">✕</a><div class="lp-bar"><i style="width:${pct}%"></i>${marks}</div><span class="lp-n">${LP.i}/${N}</span></div>
     <div class="cp"><p class="kick">${S.name} · ${esc(L.t)}</p><h2>Partie ${pk-1} sur ${PT.length} terminée</h2>${vals.length?`<p>${ok} ${plural(ok,"bonne réponse","bonnes réponses")} sur ${vals.length} depuis le début de la leçon.</p>`:""}
      <p class="muted">Bon moment pour une pause si tu en as besoin : ta position est gardée, même si tu fermes le site ou si tu passes sur ton autre appareil.</p>
      <div class="acts"><button class="btn pri big" id="cp-go">Continuer : partie ${pk} sur ${PT.length}, environ ${pm} min</button><a class="btn" href="#/">Faire une pause</a></div></div>
     <div class="lp-foot"><button class="btn" id="lp-prev">Retour</button></div></div>`;
    $("#cp-go").addEventListener("click",()=>{LP.cp=null;drawStep();});$("#lp-prev").addEventListener("click",()=>{LP.cp=null;LP.i=Math.max(0,LP.i-1);LP.back=true;drawStep();});
    progSave();window.scrollTo(0,0);return;}
  $("#main").innerHTML=`<div class="lp s-${LP.sid}">
   <div class="lp-top"><a class="lp-x" href="#/apprendre" aria-label="Quitter la leçon">✕</a><div class="lp-bar" role="progressbar" aria-label="Avancement dans la leçon" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${LP.i}"><i style="width:${from}%"></i>${marks}</div><span class="lp-n">${LP.i+1}/${N}</span></div>
   ${resumed?`<div class="resume" role="status"><span>Tu reprends là où tu t'étais arrêté : écran ${LP.i+1} sur ${N}.</span><button class="btn" id="lp-restart">Recommencer du début</button></div>`:""}${pauseBar()}<div class="lp-kicker">${S.name} · ${esc(L.t)}<span class="lp-left">${PT.length>1?` · partie ${pk} sur ${PT.length}`:""} · encore ${left<60?`~${left} min`:"~"+hm(left)}</span></div>
   <div class="lp-body${back?" back":""}" id="lpb"></div>
   <div class="lp-foot"><button class="btn" id="lp-prev"${LP.i?"":" hidden"}>Retour</button><button class="btn pri big" id="lp-next">Continuer</button></div>
   <p class="kbdhint"><span class="kb">Clavier : 1, 2, 3, 4 pour répondre · Entrée pour continuer. </span>Ta position est gardée : tu peux fermer et reprendre plus tard.</p></div>`;
  const body=$("#lpb"),next=$("#lp-next");
  (STEP[s.k]||STEP.learn)(s,body,next,L);
  body.querySelectorAll(".lq").forEach(x=>A.motsClic(LP.sid,x));
  if(from!==pct){const bi=$(".lp-bar i");if(bi){void bi.offsetWidth;bi.style.width=pct+"%";}}
  $("#lp-prev").addEventListener("click",()=>{LP.i=Math.max(0,LP.i-1);LP.back=true;drawStep();});
  const pd=$("#pz-done"),pl=$("#pz-later");if(pd)pd.addEventListener("click",()=>{WORK.acc=0;WORK.last=Date.now();$(".pausebar").remove();});if(pl)pl.addEventListener("click",()=>{WORK.snooze=Date.now()+15*60e3;$(".pausebar").remove();});
  next.addEventListener("click",()=>{if(next.disabled)return;if(next.dataset.mode==="check"){next.dispatchEvent(new CustomEvent("check"));return;}LP.i++;if(PT.includes(LP.i))LP.cp=LP.i;drawStep();});
  const rs=$("#lp-restart");if(rs)rs.addEventListener("click",()=>{progDrop(LP.sid,LP.id,true);LP=newLP(LP.sid,LP.id);drawStep();});
  progSave();fixLinks(body,LP.sid);window.scrollTo(0,0);}
const code=(src,lang)=>W.code(src,lang||SUBJ[LP.sid].lang||"txt");
/* niveau des explications d'une matière : choisi dans la leçon, sinon déduit de la maîtrise du thème
   (mini-contrôles, quiz, cartes, erreurs). 1 débutant, 2 intermédiaire, 3 avancé. */
const NIVEAUX=["","Débutant","Intermédiaire","Avancé"];
function niveauDe(sid,lid){const S=SUBJ[sid],st=A.ST[sid],th=A.themeDe(S,lid),T=th&&(S.themes||[]).find(x=>x.id===th),m=T?A.maitrise(sid,T):null;
  if(st.niv)return {n:st.niv,auto:false,m};
  return {n:m==null?2:m<0.4?1:m<0.75?2:3,auto:true,m};}
const nivBarre=nv=>`<div class="nivbar"><p class="muted">Niveau des explications en ${SUBJ[LP.sid].name} : <b>${NIVEAUX[nv.n]}</b>, ${nv.auto?(nv.m==null?`par défaut. Fais le <a href="#/${LP.sid}/niveau">mini-contrôle</a> pour qu'il s'adapte à toi`:"choisi automatiquement d'après tes résultats sur ce thème"):"choisi par toi"}.</p><div class="filters">${[[1,"Débutant : tout depuis zéro"],[2,"Intermédiaire"],[3,"Avancé : seulement le cours"],[0,"Automatique"]].map(x=>`<button class="btn" data-niv="${x[0]}" aria-pressed="${x[0]?!nv.auto&&nv.n===x[0]:nv.auto}">${x[1]}</button>`).join("")}</div></div>`;
const STEP={
 learn(s,body){
  const nv=niveauDe(LP.sid,LP.id),aide=nv.n===1&&s.debut?["Depuis zéro",s.debut]:nv.n<3&&s.clair?["En clair",s.clair]:null;
  body.innerHTML=`${s.look?`<p class="look"><b>Tu cherches :</b> ${s.look}</p>`:""}${s.h?`<h2>${s.h}</h2>`:""}${aide?`<div class="clair"><p class="clair__t">${aide[0]}</p><div class="lx">${aide[1]}</div></div><p class="lxlab">Ce que dit le cours</p>`:""}<div class="lx">${s.x||""}</div>${s.svg||""}${s.code?code(s.code,s.lang):""}<div class="lfig"></div>${s.after?`<div class="lx">${s.after}</div>`:""}${nivBarre(nv)}`;
  body.querySelectorAll("[data-niv]").forEach(b=>b.addEventListener("click",()=>{A.emit({k:"niv",s:LP.sid,v:+b.dataset.niv});drawStep();}));
  if(s.fig){const c=SUBJ[LP.sid].BY[s.fig];if(c)mount(body.querySelector(".lfig"),c,s.figKey);}},
 pre(s,body,next){
  const ord=shuffle(s.o.map((_,i)=>i));
  body.innerHTML=`<p class="prekick">Devine d'abord · ça ne compte pas</p><p class="lq">${s.q}</p>${s.code?code(s.code,s.lang):""}<div class="opts">${ord.map(i=>`<button data-o="${i}">${s.o[i]}</button>`).join("")}</div><div class="lfb" aria-live="polite"></div>`;
  next.disabled=true;let done=false;
  body.querySelector(".opts").addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(!b||done)return;done=true;
    body.querySelectorAll(".opts button").forEach(x=>{x.disabled=true;if(x===b)x.classList.add("picked");});
    body.querySelector(".lfb").innerHTML=`<div class="prefb"><b>C'est noté.</b> Pas de correction tout de suite : la réponse est dans l'explication qui suit. Lis-la en la cherchant, la question revient juste après.</div>`;
    next.disabled=false;next.focus();});},
 card(s,body){
  body.innerHTML=`<div class="kcard"><span class="kk">À retenir</span><p class="kq">${s.f}</p><div class="ka">${s.b}</div></div><p class="muted">Cette carte reviendra dans « Réviser » demain, puis quelques jours après : c'est en la retrouvant de mémoire plusieurs fois qu'elle tiendra jusqu'au CC.</p>`;},
 qcm(s,body,next){
  const ord=shuffle(s.o.map((_,i)=>i));
  body.innerHTML=`${s.open?`<p class="prekick">Devine d'abord · ça ne compte pas</p>`:""}<p class="lq">${s.q}</p>${s.code?code(s.code,s.lang):""}<div class="opts">${ord.map(i=>`<button data-o="${i}">${s.o[i]}</button>`).join("")}</div>${s.hint?`<div><button class="btn" id="lhint">Un indice</button><p class="muted" id="lhintt" hidden>${s.hint}</p></div>`:""}<div class="lfb" aria-live="polite"></div>`;
  next.disabled=true;let done=false;
  body.querySelector(".opts").addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(!b||done)return;done=true;const k=+b.dataset.o,ok=k===s.a;
    body.querySelectorAll(".opts button").forEach(x=>{x.disabled=true;const j=+x.dataset.o;if(j===s.a)x.className="good";else if(j===k)x.className="bad";});
    body.querySelector(".lfb").innerHTML=`<div class="expl${ok?"":" no"}"><b>${ok?(s.open?"Bien deviné.":"Exact."):(s.open?"Pas grave : tu ne l'as pas encore vu.":"Pas tout à fait.")}</b> ${s.e||""}${ok?"":A.motsHTML(LP.sid,s)}</div>`;
    if(!s.open)mark(ok?1:0,s,k);else A.logRep(Object.assign({o:"leçon, devine d'abord",s:LP.sid,l:LP.id,ecran:LP.i,ok:ok?1:0,ms:Date.now()-(LP.shownT||Date.now())},A.repQ(s,k)));next.disabled=false;next.focus();});
  const h=body.querySelector("#lhint");if(h)h.addEventListener("click",()=>{body.querySelector("#lhintt").hidden=false;h.hidden=true;});},
 blanks(s,body,next){
  const parts=s.code.split(/\[\[(\d+)\]\]/);
  const txt=p=>s.prose?esc(p):(s.lang?W.hlCode(p,s.lang):esc(p));
  const html=parts.map((p,i)=>{if(i%2===0)return txt(p);const b=s.b[+p];return `<select class="blank" data-b="${p}" aria-label="Trou numéro ${+p+1}"><option value="">choisis…</option>${shuffle(b.o.map((_,j)=>j)).map(j=>`<option value="${j}">${esc(b.o[j])}</option>`).join("")}</select>`;}).join("");
  body.innerHTML=`<p class="lq">${s.q}</p>${s.show?code(s.show,s.showLang||"txt"):""}<div class="blankcode${s.prose?" prose":""}">${html}</div><div class="lfb" aria-live="polite"></div>`;
  next.dataset.mode="check";next.textContent="Vérifier";next.disabled=true;
  body.addEventListener("change",()=>{if(next.dataset.mode==="check")next.disabled=[...body.querySelectorAll("select.blank")].some(x=>x.value==="");});
  next.addEventListener("check",()=>{let all=true;body.querySelectorAll("select.blank").forEach(x=>{const b=s.b[+x.dataset.b],ok=+x.value===b.a;x.classList.add(ok?"ok":"bad");x.disabled=true;if(!ok){all=false;x.insertAdjacentHTML("afterend",`<span class="fix">${esc(b.o[b.a])}</span>`);}});
    body.querySelector(".lfb").innerHTML=`<div class="expl${all?"":" no"}"><b>${all?"Exact.":"Pas tout à fait : la bonne réponse est écrite en vert à côté."}</b> ${s.e||""}</div>`;
    mark(all?1:0,s);next.dataset.mode="";next.textContent="Continuer";next.disabled=false;next.focus();},{once:true});},
 order(s,body,next){
  const lines=s.lines,mono=s.lang!=="txt";let pool=shuffle(lines.map((_,i)=>i)),ans=[];
  if(pool.every((v,i)=>lines[v]===lines[i])&&lines.length>1)pool.reverse();
  body.innerHTML=`<p class="lq">${s.q}</p>${s.show?code(s.show,s.showLang||"txt"):""}<p class="muted">Fais glisser les lignes pour les ranger dans le bon ordre (sur téléphone : garde le doigt appuyé un instant sur la ligne, puis glisse). Tu peux aussi les toucher une par une : une ligne touchée monte dans ta réponse, ou redescend.</p><div class="par-ans" id="pa"></div><div class="par-pool" id="pp"></div><div class="lfb" aria-live="polite"></div>`;
  const PA=body.querySelector("#pa"),PP=body.querySelector("#pp");
  const draw=()=>{PA.innerHTML=ans.length?ans.map((i,k)=>`<button class="par-line${mono?" mono":""}" data-a="${k}">${esc(lines[i])}</button>`).join(""):`<span class="muted">Ta réponse s'écrit ici.</span>`;
    PP.innerHTML=pool.length?pool.map((i,k)=>`<button class="par-line${mono?" mono":""}" data-p="${k}">${esc(lines[i])}</button>`).join(""):`<span class="muted">Toutes les lignes sont placées : vérifie.</span>`;
    if(next.dataset.mode==="check")next.disabled=pool.length>0;};
  next.dataset.mode="check";next.textContent="Vérifier";
  let D=null,skipClick=0,raf=0;
  body.addEventListener("click",e=>{if(next.dataset.mode!=="check")return;if(Date.now()<skipClick)return;const a=e.target.closest("[data-a]"),p=e.target.closest("[data-p]");if(p){ans.push(pool.splice(+p.dataset.p,1)[0]);draw();}else if(a){pool.push(ans.splice(+a.dataset.a,1)[0]);draw();}});
  /* glisser-déposer : à la souris dès qu'on bouge ; au doigt après un quart de seconde d'appui (sinon le doigt fait défiler la page).
     On peut déposer une ligne n'importe où dans la réponse, la déplacer dans la réponse, ou la redescendre. */
  if(DND)DND.abort();DND=new AbortController();const sig={signal:DND.signal};
  const mk=document.createElement("div");mk.className="par-drop";
  const aim=()=>{const ra=PA.getBoundingClientRect(),rp=PP.getBoundingClientRect();
    if(D.y<(ra.bottom+rp.top)/2){const it=[...PA.querySelectorAll(".par-line")];let k=it.length;for(let i=0;i<it.length;i++){const r=it[i].getBoundingClientRect();if(D.y<r.top+r.height/2){k=i;break;}}
      D.zone="a";D.k=k;if(it[k])PA.insertBefore(mk,it[k]);else PA.appendChild(mk);}
    else{D.zone="p";mk.remove();}};
  const follow=()=>{D.g.style.left=(D.x-D.dx)+"px";D.g.style.top=(D.y-D.dy)+"px";aim();};
  const edge=()=>{if(!D||!D.on)return;if(D.y<70)scrollBy(0,-9);else if(D.y>innerHeight-70)scrollBy(0,9);aim();raf=requestAnimationFrame(edge);};
  const begin=()=>{const el=D.el,r=el.getBoundingClientRect(),g=el.cloneNode(true);g.classList.add("par-ghost");g.style.width=r.width+"px";g.style.setProperty("--sc",getComputedStyle(el).getPropertyValue("--sc"));document.body.appendChild(g);
    el.classList.add("drag-src");document.documentElement.classList.add("is-dragging");D.on=true;D.g=g;D.dx=D.x0-r.left;D.dy=D.y0-r.top;follow();raf=requestAnimationFrame(edge);};
  const drop=ok=>{const d=D;D=null;if(!d)return;clearTimeout(d.t);cancelAnimationFrame(raf);if(!d.on)return;
    d.g.remove();mk.remove();document.documentElement.classList.remove("is-dragging");skipClick=Date.now()+400;
    if(ok&&next.dataset.mode==="check"){
      if(d.zone==="a"){if(d.from==="a"){const v=ans.splice(d.idx,1)[0];ans.splice(d.k>d.idx?d.k-1:d.k,0,v);}else ans.splice(d.k,0,pool.splice(d.idx,1)[0]);}
      else if(d.from==="a")pool.push(ans.splice(d.idx,1)[0]);}
    draw();};
  body.addEventListener("pointerdown",e=>{if(next.dataset.mode!=="check"||D||e.button>0)return;const el=e.target.closest(".par-line");if(!el)return;
    D={el,from:el.dataset.a!=null?"a":"p",idx:+(el.dataset.a!=null?el.dataset.a:el.dataset.p),x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,id:e.pointerId,on:false,touch:e.pointerType==="touch"};
    if(D.touch)D.t=setTimeout(()=>{if(D&&!D.on)begin();},230);},sig);
  addEventListener("pointermove",e=>{if(!D||e.pointerId!==D.id)return;D.x=e.clientX;D.y=e.clientY;
    if(!D.on){if(Math.hypot(D.x-D.x0,D.y-D.y0)<=7)return;if(D.touch){clearTimeout(D.t);D=null;return;}begin();}
    follow();},sig);
  addEventListener("pointerup",e=>{if(D&&e.pointerId===D.id)drop(true);},sig);
  addEventListener("pointercancel",e=>{if(D&&e.pointerId===D.id)drop(false);},sig);
  document.addEventListener("touchmove",e=>{if(D&&D.on)e.preventDefault();},{passive:false,signal:DND.signal});
  draw();
  next.addEventListener("check",()=>{const got=ans.map(i=>lines[i]).join("\n"),ok=got===lines.join("\n")||(s.alt||[]).some(o=>o.map(i=>lines[i]).join("\n")===got);
    $("#pa").querySelectorAll(".par-line").forEach((b,k)=>{b.classList.add(ok||lines[ans[k]]===lines[k]?"ok":"bad");b.disabled=true;});
    body.querySelector(".lfb").innerHTML=ok?`<div class="expl"><b>Exact.</b> ${s.e||""}</div>`:`<div class="expl no"><b>Pas tout à fait.</b> Les lignes en rouge ne sont pas à leur place. Le bon ordre :</div>${mono?code(lines.join("\n"),s.lang):`<ol class="par-sol">${lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ol>`}${s.e?`<p class="muted">${s.e}</p>`:""}`;
    mark(ok?1:0,s);next.dataset.mode="";next.textContent="Continuer";next.disabled=false;next.focus();},{once:true});},
 steps(s,body,next){
  const me=LP.i;let k=Math.min((LP.ss[me]||{}).k||0,s.s.length);const n=s.s.length;
  body.innerHTML=`${s.h?`<h2>${s.h}</h2>`:""}${s.intro?`<div class="enon">${s.intro}</div>`:""}<p class="muted">Avant d'afficher chaque étape, essaie de la trouver toi-même.</p><ol class="wex"></ol><button class="btn pri" id="wnext"></button>${s.after?`<div class="lx" id="wafter" hidden>${s.after}</div>`:""}`;
  next.disabled=true;
  const draw=()=>{body.querySelector(".wex").innerHTML=s.s.slice(0,k).map(x=>`<li><div>${x.w}</div>${x.why?`<div class="why">${x.why}</div>`:""}</li>`).join("");const b=body.querySelector("#wnext");if(k>=n){b.hidden=true;next.disabled=false;const af=body.querySelector("#wafter");if(af)af.hidden=false;}else b.textContent=`Afficher l'étape ${k+1} sur ${n}`;};
  body.querySelector("#wnext").addEventListener("click",()=>{k++;LP.ss[me]=Object.assign({},LP.ss[me],{k});progSave();draw();fixLinks(body,LP.sid);});draw();},
 demo(s,body,next){
  const c=SUBJ[LP.sid].BY[s.c];if(!c||!c.steps){body.innerHTML=`<p>Démo introuvable.</p>`;return;}
  const me=LP.i;let k=Math.min((LP.ss[me]||{}).k||0,c.steps.length);const n=c.steps.length;
  body.innerHTML=`<h2>${s.h||"Démo exigible : "+esc(c.ref)}</h2><div class="goal"><b>On suppose</b><span>${c.hyp}</span><b>On montre</b><span>${c.concl}</span></div><p class="idea"><b>L'idée :</b> ${c.idea}</p><div class="lfig"></div><p class="muted">Avant d'afficher chaque étape, essaie de la trouver. Regarde la figure changer.</p><ol class="wex"></ol><button class="btn pri" id="wnext"></button><div class="redac-box" hidden><h3>La preuve rédigée, à savoir refaire</h3><div class="redac">${c.redac||""}</div></div>`;
  const figs=mount(body.querySelector(".lfig"),c);next.disabled=true;
  const draw=()=>{figs.forEach(F=>{if(F.setStep)F.setStep(Math.max(0,k-1));});body.querySelector(".wex").innerHTML=c.steps.slice(0,k).map(x=>`<li><div>${x.w}</div><div class="why">${x.why}</div></li>`).join("");const b=body.querySelector("#wnext");if(k>=n){b.hidden=true;body.querySelector(".redac-box").hidden=false;next.disabled=false;}else b.textContent=`Afficher l'étape ${k+1} sur ${n}`;};
  body.querySelector("#wnext").addEventListener("click",()=>{k++;LP.ss[me]=Object.assign({},LP.ss[me],{k});progSave();draw();});draw();},
 paper(s,body,next){
  const c=s.solc?SUBJ[LP.sid].BY[s.solc]:null;
  body.innerHTML=`<h2>${s.h}</h2><div class="enon">${s.x}</div><div class="paper"><b>Sur une feuille, sans regarder, ${exW(SUBJ[LP.sid])==="CC"?"comme au CC":"comme à l'examen"}.</b> Compte environ ${s.min||10} minutes. Si tu bloques plus de 2 minutes, écris ce que tu sais et passe à la suite.</div>
   <div class="acts"><button class="btn" id="ptm">Lancer le chrono : ${s.min||10} min</button><span class="ptv" id="ptv" aria-live="polite"></span></div>
   <button class="btn pri" id="psol">J'ai fini : voir la correction</button>
   <div id="pbox" hidden><h3>La correction</h3><div class="sol">${s.sol||""}${c&&c.redac?`<div class="redac">${c.redac}</div>`:""}${s.sol2||""}</div>${s.check?`<p><b>Vérifie ta copie point par point :</b></p><div class="pcheck">${s.check.map(x=>`<label><input type="checkbox"> ${x}</label>`).join("")}</div>`:""}<p><b>Alors, honnêtement ?</b></p><div class="acts" id="prate"><button class="btn rev" data-pr="0">Raté</button><button class="btn" data-pr="0.5">À moitié</button><button class="btn ok" data-pr="1">Réussi</button></div></div>`;
  next.disabled=true;
  const me=LP.i,ss=()=>LP.ss[me]=LP.ss[me]||{},keep=o=>{Object.assign(ss(),o);progSave();};
  const run=end=>{clearInterval(TIMER);const v=body.querySelector("#ptv");body.querySelector("#ptm").hidden=true;const t=()=>{const r=Math.max(0,Math.round((end-Date.now())/1000));v.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`;if(!r){clearInterval(TIMER);v.textContent="Temps écoulé : regarde la correction.";}};t();if(end>Date.now())TIMER=setInterval(t,1000);};
  const open=()=>{clearInterval(TIMER);body.querySelector("#pbox").hidden=false;body.querySelector("#psol").hidden=true;fixLinks(body,LP.sid);};
  const rate=b=>{body.querySelectorAll("#prate button").forEach(x=>x.setAttribute("aria-pressed",x===b));next.disabled=false;};
  body.querySelector("#ptm").addEventListener("click",()=>{const end=Date.now()+(s.min||10)*60e3;keep({end});run(end);});
  body.querySelector("#psol").addEventListener("click",()=>{keep({open:true});open();});
  body.querySelector("#prate").addEventListener("click",e=>{const b=e.target.closest("[data-pr]");if(!b)return;keep({rate:b.dataset.pr});mark(+b.dataset.pr,s);rate(b);});
  const st=LP.ss[me]||{};if(st.open)open();else if(st.end)run(st.end);if(st.rate!=null){const b=body.querySelector(`#prate [data-pr="${st.rate}"]`);if(b)rate(b);}}
};
function finish(){
  const L=BYL[LP.sid][LP.id],S=SUBJ[LP.sid],sid=LP.sid,lid=LP.id;
  const vals=Object.values(LP.got),sc=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:1;
  tick();progDrop(sid,lid);emit({k:"les",s:sid,l:lid,sc:Math.round(sc*100)/100,dur:Math.max(1,Math.round(LP.t/60000))});
  const F0=flow(L),nm=Object.entries(LP.got).filter(([i,v])=>v<1&&F0[i]&&["qcm","blanks","order"].includes(F0[i].k)).length;
  const nc=cardIds(sid,lid).length,nt=nextTask();
  const msg=sc>=0.8?"Bien joué.":sc>=0.5?"C'est en bonne voie.":"C'est normal de se tromper au début : c'est même en se trompant puis en voyant la correction qu'on retient le mieux.";
  const burst=sc>=0.5?`<div class="burst" aria-hidden="true">${[...Array(12)].map((_,i)=>{const a=i/12*Math.PI*2,r=120+(i*37)%60;return `<svg style="--bx:${Math.round(Math.cos(a)*r)}px;--by:${Math.round(Math.sin(a)*r*.7)}px;--dl:${(i%4)*50}ms"><use href="#i-star8"/></svg>`;}).join("")}</div>`:"";
  $("#main").innerHTML=`<div class="page lp-end s-${sid}">${burst}<p class="kick">${S.name}</p><h1>Leçon terminée</h1><p class="lead">${esc(L.t)}</p><p class="score" id="lsc">${Math.round(sc*100)} %</p><p>${msg}${sc<0.5?" Le plan te la reproposera : refais-la demain, à froid.":""}</p>${nc?`<p>${nc} ${plural(nc,"carte")} « À retenir » ${nc>1?"arrivent":"arrive"} dans « Réviser » : tu les reverras demain.</p>`:""}${nm?`<p>${nm} ${plural(nm,"question ratée","questions ratées")} ${nm>1?"t'attendent":"t'attend"} aussi dans « Réviser » : c'est en retrouvant plus tard ce qu'on a raté qu'on le retient.</p>`:""}
   ${nt&&!nt.today?`<p class="allgood">C'est tout ce qui était prévu aujourd'hui. Repose-toi : c'est pendant le repos que ton cerveau range ce que tu viens d'apprendre.</p>`:""}
   <div id="av-fin"></div><div id="bil-l"></div><div class="acts">${nt&&nt.today?`<a class="btn pri big" href="${hrefTask(nt.sid,nt.t)}">Continuer : ${esc(nt.t.t)}</a>`:""}<a class="btn${nt&&nt.today?"":" pri"}" href="#/">Retour à aujourd'hui</a>${nt&&!nt.today?`<a class="btn" href="${hrefTask(nt.sid,nt.t)}">Avancer quand même : ${esc(nt.t.t)}</a>`:""}<button class="btn" id="redo">Refaire cette leçon</button></div></div>`;
  const el=$("#lsc"),goal=Math.round(sc*100);
  if(el&&!matchMedia("(prefers-reduced-motion: reduce)").matches){const t0=performance.now();const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/700)),v=Math.round(goal*(1-Math.pow(1-k,3)));el.textContent=v+" %";if(k<1)requestAnimationFrame(f);};el.textContent="0 %";requestAnimationFrame(f);}
  A.bilanSeance($("#bil-l"),{o:"leçon",s:sid,l:lid});if(window.ENT&&ENT.avantFin)ENT.avantFin($("#av-fin"),sid,lid);
  LP=null;$("#redo").addEventListener("click",()=>{progDrop(sid,lid);LP=newLP(sid,lid);drawStep();});badges();}

/* ================= Réviser : les cartes du jour ================= */
/* la phrase du haut de Réviser : ce que contient vraiment la séance */
const quand=S=>{const j=jx(S);return /^J-/.test(j)?"dans "+j.slice(2)+" jours":j;};
function rvLead(){const n={l:0,q:0,m:0,c:0,e:0},vu=new Set(),veille=[];
  (RV?RV.q:[]).forEach(x=>{const k=x.sid+"|"+x.cid;if(vu.has(k)||ST[x.sid].jv[x.cid])return;vu.add(k);const t=x.cid.slice(0,2);n[t==="q:"?"q":t==="m:"?"m":t==="c:"?"c":t==="e:"?"e":"l"]++;
    if(examStart(SUBJ[x.sid])-NOW()<=36*3600e3&&!veille.includes(x.sid))veille.push(x.sid);});
  const P=[];if(n.l)P.push(`${n.l} ${plural(n.l,"carte")} de tes leçons à revoir`);if(n.q)P.push(`${n.q} ${plural(n.q,"question ratée","questions ratées")} au quiz ou au mini-contrôle`);
  if(n.m)P.push(`${n.m} ${plural(n.m,"question ratée","questions ratées")} dans tes leçons`);if(n.c)P.push(`${n.c} ${plural(n.c,"fiche")} en rouge`);if(n.e)P.push(`${n.e} ${plural(n.e,"idée clé","idées clés")} d'exercices ratés`);
  const liste=P.length>1?P.slice(0,-1).join(", ")+" et "+P[P.length-1]:P[0];
  const cc=veille.map(id=>{const S=SUBJ[id];return ` ${exam(S).label} ${/^[aeiouéè]/i.test(S.name)?"d'":"de "}${S.name} ${quand(S)} : toutes ses cartes sont là, même celles prévues plus tard.`;}).join("");
  const nb=RV?RV.total:0,T=A.tempsCarte();
  const tps=nb?`<b>${nb} ${plural(nb,"carte")} aujourd'hui, environ ${dureeCartes(nb)}</b> à ton rythme (${T.n>=20?`${secTxt(T.ms)} par carte, mesuré sur tes ${Math.min(300,T.n)} dernières cartes`:`environ ${secTxt(T.ms)} par carte pour l'instant : le site mesure ton temps à chaque carte`}). `:"";
  return `${tps}${liste?`Aujourd'hui : ${liste}.`:""}${cc} Réponds de mémoire <b>avant</b> de retourner la carte.`;}
function jvMsg(sid,l){const L=l&&BYL[sid][l];
  if(!L)return "Carte retirée. Aucune leçon ne l'explique : elle ne reviendra que si tu rates encore cette question.";
  const b=plan().blocks.find(B=>B.sid===sid&&(B.tasks||[]).includes("L-"+l)),t=today();
  const q=b?`${b.day===t?"aujourd'hui":b.day===addDays(t,1)?"demain":dayName(b.day,false)} à ${hm(b.start)}`:"";
  return `Carte retirée. La leçon <a href="#/lecon/${sid}/${l}">${esc(L.t)}</a> ${q?"est dans ton planning "+q:"n'entre plus dans ton planning avant l'épreuve : fais-la depuis Apprendre"}. La carte reviendra après.`;}
const rvDebut=()=>RV.q.map(x=>({s:x.sid,c:x.cid,b:x.box}));
let RV=null;
function reviser(){
  if(!RV||RV.end){const sv=A.seanceGet("cartes");RV=null;
    if(sv&&Array.isArray(sv.q)){const q=sv.q.map(x=>({sid:x.s,cid:x.c,box:x.b}));
      if(q.length&&q.every(x=>SUBJ[x.sid]&&cardOf(x.sid,x.cid))){const N={q,i:0,flip:false,tries:{},ok:0,n:0,end:false,total:q.length,run:sv.run,debute:true};
        /* on rejoue les notes déjà données : une carte ratée repart au bout de la file, comme pendant la séance */
        for(let j=0,nb=A.faites(sv);j<nb&&j<N.q.length;j++){const it=N.q[j],r=sv.rep[j];if(r<0){N.i=j+1;continue;}const k=N.tries[it.cid]=(N.tries[it.cid]||0)+1;if(k===1){N.n++;if(r===2)N.ok++;}if(r===0&&k<3)N.q.push(it);N.i=j+1;}
        if(N.i<N.q.length){N.repris=N.i>0;RV=N;}}}
    if(!RV){const due=dueCards();RV={q:due.slice(0,30),i:0,flip:false,tries:{},ok:0,n:0,end:false,total:due.length,run:A.nouvRun()};}}
  drawCard();}
function drawCard(){
  const top=ttl("Réviser",rvLead());
  if(!RV.q.length){$("#main").innerHTML=`<div class="page">${top}<div class="empty"><p class="score">0 carte</p><p>Rien à revoir pour l'instant. Les cartes arrivent quand tu termines des leçons, et reviennent le lendemain.</p><div class="acts">${(()=>{let nt=null;try{nt=nextTask();}catch(e){}return nt?`<a class="btn pri" href="${hrefTask(nt.sid,nt.t)}">${nt.resume?"Continuer":"À faire ensuite"} : ${esc(nt.t.t)}</a>`:`<a class="btn pri" href="#/apprendre">Faire une leçon</a>`;})()}<a class="btn" href="#/mix">Mini-contrôle mélangé (12 questions)</a></div></div></div>`;RV.end=true;return;}
  if(RV.i>=RV.q.length){RV.end=true;A.seanceFin("cartes",RV.run);const more=dueCards().length;$("#main").innerHTML=`<div class="page">${top}<div class="empty">${RV.n?`<p class="score">${RV.ok} / ${RV.n}</p>`:""}${RV.msg?`<p class="muted">${RV.msg}</p>`:""}<p>Session terminée. ${!RV.n?"":RV.ok<RV.n?"Chaque carte ratée est revenue jusqu'à ce que tu la retrouves (3 fois au plus) ; elle reviendra aussi demain : c'est voulu.":"Tout est su : bravo."}</p><div class="acts">${more?`<button class="btn pri" id="rvmore">Encore ${more} ${plural(more,"carte")}</button>`:""}<a class="btn pri" href="#/">Retour à aujourd'hui</a><a class="btn" href="#/mix">Mini-contrôle mélangé</a></div></div></div>`;const m=$("#rvmore");if(m)m.addEventListener("click",()=>{RV=null;reviser();});badges();return;}
  const it=RV.q[RV.i],S=SUBJ[it.sid],c=cardOf(it.sid,it.cid);
  if(!c||ST[it.sid].jv[it.cid]){if(c)A.seanceRep("cartes",RV,rvDebut,RV.i,-1);RV.i++;return drawCard();}
  $("#main").innerHTML=`<div class="page">${top}
   <div class="rv s-${it.sid}"><div class="rv-h"><span class="sdot" style="background:${S.color}"></span>${S.name}<span class="muted">· carte ${RV.i+1} sur ${RV.q.length} · encore environ ${dureeCartes(RV.q.length-RV.i)}${RV.repris?" · tu reprends où tu t'étais arrêté":""}</span></div>
    <div class="lp-bar"><i style="width:${Math.round(RV.i/RV.q.length*100)}%"></i></div>
    <p class="kbdhint"><span class="kb">Clavier : Espace pour retourner la carte · 1 raté, 2 difficile, 3 je savais.</span></p>${RV.msg?`<p class="muted">${RV.msg}</p>`:""}<div class="kcard${RV.flip?"":" fresh"}"><span class="tag">${esc(S.name)}</span><span class="kk">${RV.flip?"La réponse":"Retrouve de mémoire"}</span><p class="kq">${c.f}</p>${RV.flip?`<div class="ka">${c.b}</div><p class="muted" style="font-size:.85rem;margin:0">${esc(c.src)} · <a href="${c.link}">ouvrir</a></p>`:""}</div>
    ${RV.flip?`<p class="muted">Tu avais trouvé ?</p><div class="acts rate"><button class="btn rev" data-r="0">Raté</button><button class="btn mid" data-r="1">Difficile</button><button class="btn ok" data-r="2">Je savais</button></div>`:`<button class="btn pri big" id="rvflip">Voir la réponse</button>`}<div class="acts"><button class="btn" id="rvjv">Jamais vu</button></div></div></div>`;
  if(!RV.flip)RV.t0=Date.now();
  A.motsClic(it.sid,document.querySelector(".kcard .kq"));
  const f=$("#rvflip");if(f)f.addEventListener("click",()=>{RV.flip=true;RV.t1=Date.now();drawCard();});
  $("#rvjv").addEventListener("click",()=>{const l=leconDe(it.sid,it.cid);
    emit({k:"jv",s:it.sid,c:it.cid,l:l||null});
    A.logRep({o:"carte de Réviser",s:it.sid,carte:it.cid,note:"jamais vu",ok:0,texte:A.brut(c.f).slice(0,400)});
    A.seanceRep("cartes",RV,rvDebut,RV.i,-1);
    RV.msg=jvMsg(it.sid,l);RV.i++;RV.flip=false;RV.repris=false;drawCard();});
  document.querySelectorAll("[data-r]").forEach(b=>b.addEventListener("click",()=>{const r=+b.dataset.r;RV.msg=null;
    const k=RV.tries[it.cid]=(RV.tries[it.cid]||0)+1,re=k>1?{re:1}:{};
    const ms=Date.now()-(RV.t0||Date.now());if(ms>0)re.ms=Math.min(180000,ms);
    if(it.cid.indexOf("c:")===0){emit(Object.assign({k:"cr",s:it.sid,c:it.cid.slice(2),r},re));if(r===2)emit({k:"st",s:it.sid,c:it.cid.slice(2),v:"known"});}
    else emit(Object.assign({k:"card",s:it.sid,c:it.cid,r},re));
    A.logRep({o:"carte de Réviser",s:it.sid,carte:it.cid,note:["raté","difficile","je savais"][r],r,ok:r===2?1:0,essai:k,texte:A.brut(c.f).slice(0,400),reponse:A.brut(c.b).slice(0,600),msAvantRetour:(RV.t1||Date.now())-(RV.t0||Date.now()),ms:Date.now()-(RV.t0||Date.now())});
    if(k===1){RV.n++;if(r===2)RV.ok++;}
    A.seanceRep("cartes",RV,()=>RV.q.map(x=>({s:x.sid,c:x.cid,b:x.box})),RV.i,r);
    if(r===0&&k<3)RV.q.push(it);
    RV.i++;RV.flip=false;RV.repris=false;drawCard();}));
  badges();}

/* ================= les morceaux du nouvel onglet ================= */
const ART={geo:"triangle",algo:"algo",pf:"lambda",calc:"integrale",lin:"matrice",ana:"courbe",rai:"ensembles",usi:"terminal"};
const ico=(id,cls)=>`<svg class="${cls||"ico"}" aria-hidden="true"><use href="#${id}"/></svg>`;
const artSVG=n=>`<svg class="art" viewBox="0 0 120 64" aria-hidden="true"><use href="#d-${n}" class="art__a"/><use href="#d-${n}" class="art__b"/><use href="#d-${n}" class="art__c"/></svg>`;
const tart=id=>`<svg class="tart" viewBox="0 0 120 64" aria-hidden="true"><use href="#d-${ART[id]||"etoile"}"/></svg>`;
const spark=`<span class="piece__spark" aria-hidden="true">${ico("i-star8","s8")}</span>`;
const ruler=`<span class="ecrin__ruler" aria-hidden="true"></span>`;
function sw(o){return `<li><a class="swatch ${o.c||"c-bleu"}${o.size?" swatch--"+o.size:""}${o.done?" is-done":""}" href="${o.href}"${o.ext?' target="_blank" rel="noopener"':""}><span class="swatch__tile" aria-hidden="true">${o.tile==null?ico("i-star"):o.tile}</span><span class="swatch__bar">${o.kicker?`<span class="swatch__kicker">${o.kicker}</span>`:""}<span class="swatch__name">${o.name}</span>${o.sub?`<span class="swatch__sub">${o.sub}</span>`:""}${ico("i-arrow","ico swatch__arrow")}</span></a></li>`;}
const ttl=(t,lead)=>`<h1 class="stitle">${t}</h1>${lead?`<p class="hlead">${lead}</p>`:""}`;
const tiroir=(t,body,cls)=>`<section class="tiroir${cls?" "+cls:""}"><h2 class="tiroir__title">${t}</h2>${body}</section>`;
const lessonsDone=id=>lesOf(id).filter(x=>isDone(id,SUBJ[id].TB["L-"+x.id])).length;
const shortDay=S=>{const e=exam(S);return e.report?"reporté":`${dayName(e.day,false,true)} · ${e.start.replace(":","h")}`;};
function jxTag(S){const j=jx(S);return `<span class="tag${j==="demain"||j==="aujourd'hui"?" hot":""}">${exW(S)+" "+j}</span>`;}
function subjPiece(id){const S=SUBJ[id],n=lesOf(id).length,d=lessonsDone(id),r=S.ORDER.filter(c=>ST[id].review[c.id]).length;
  return `<li class="slot s-${id}"><a class="piece" href="#/${id}" data-zoom="Fiches, leçons, annales">${jxTag(S)}${spark}<span class="piece__paper">${artSVG(ART[id]||"etoile")}</span><span class="piece__text"><span class="piece__title">${S.name}</span><span class="piece__meta">${shortDay(S)}</span><span class="piece__sub">${d} ${plural(d,"leçon")} sur ${n}${r?` · <span class="r">${r} en rouge</span>`:""}</span></span><span class="piece__bar" aria-hidden="true"><i style="width:${n?Math.round(d/n*100):0}%"></i></span></a></li>`;}
const ordered=()=>{const up=upcoming();return up.concat(SIDS.filter(id=>!up.includes(id)));};
const dayBox=(title,sub,inner,open)=>`<details class="day"${open?" open":""}><summary><b>${title}</b><span>${sub}</span></summary>${inner}</details>`;
const todoBox=(sid,L)=>`<ol class="todo" style="padding:0 12px 12px">${L.map(t=>taskHTML(sid,t,false)).join("")}</ol>`;

/* ================= raccourcis clavier (sur ordinateur) ================= */
document.addEventListener("keydown",e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;const tg=e.target;if(tg&&tg.closest&&tg.closest("input,textarea,select"))return;
  const onBtn=tg&&tg.closest&&tg.closest("button,a");
  if(location.hash.indexOf("#/lecon/")===0&&$("#lpb")){
    if(/^[1-9]$/.test(e.key)){const o=[...document.querySelectorAll("#lpb .opts button")][+e.key-1];if(o&&!o.disabled){e.preventDefault();o.click();}return;}
    if(e.key==="Enter"&&!onBtn){const nx=$("#lp-next");if(nx&&!nx.disabled&&!nx.hidden){e.preventDefault();nx.click();}}return;}
  if(location.hash.indexOf("#/reviser")===0&&$(".rv")){
    if((e.key===" "||e.key==="Enter")&&!onBtn){const f=$("#rvflip");if(f){e.preventDefault();f.click();}return;}
    const m={"1":"0","2":"1","3":"2"}[e.key];if(m){const b=document.querySelector(`[data-r="${m}"]`);if(b){e.preventDefault();b.click();}}}});

/* ================= la prochaine chose à faire ================= */
function nextTask(P){
  const t0=today(),n=NOW();P=P||plan();
  const keys=new Set(Object.keys(progAll()));SIDS.forEach(sid=>Object.keys((ST[sid]||{}).pos||{}).forEach(lid=>keys.add(sid+"/"+lid)));
  /* une autre leçon commencée ne revient que si elle a avancé après l'ouverture de la dernière (sur un autre appareil) */
  const D=derniere(),dk=D?D.sid+"/"+D.lid:null;
  let best=null;keys.forEach(k=>{const [sid,lid]=k.split("/");if(!SUBJ[sid]||examStart(SUBJ[sid])<=n||!BYL[sid][lid]||!A.inScope(SUBJ[sid],BYL[sid][lid]))return;const g=progGet(sid,lid);if(!g)return;
    const ts=k===dk?Math.max(g.ts,D.t):g.ts;if(D&&k!==dk&&g.ts<=D.t)return;if(!best||ts>best.ts)best={sid,lid,ts,g};});
  if(best&&SUBJ[best.sid].TB["L-"+best.lid])return {sid:best.sid,t:SUBJ[best.sid].TB["L-"+best.lid],resume:best.g,today:true};
  const triedToday=(sid,t)=>t.lesson&&(ST[sid].les[t.lesson]||{}).on===t0;
  for(const b of P.blocks.filter(b=>b.day===t0)){const t=b.tasks.map(id=>SUBJ[b.sid].TB[id]).find(t=>t&&!isDone(b.sid,t)&&!triedToday(b.sid,t));if(t)return {sid:b.sid,t,today:true};}
  for(const id of upcoming()){const L=lesOf(id).find(x=>{const t=SUBJ[id].TB["L-"+x.id];return !isDone(id,t)&&!triedToday(id,t);});if(L)return {sid:id,t:SUBJ[id].TB["L-"+L.id],today:false};}
  return null;}

/* ================= Aujourd'hui ================= */
/* #/continuer (le « Mode révision » du nouvel onglet) : va là où mène le gros bouton
   de l'accueil, dans le même ordre que home() : leçon commencée, cartes du jour, suite du programme */
function suite(){
  const nextT=nextTask(plan());
  if(nextT&&nextT.resume)return hrefTask(nextT.sid,nextT.t);
  if(dueCards().length)return "#/reviser";
  return nextT?hrefTask(nextT.sid,nextT.t):"#/apprendre";
}

/* l'emploi du temps sur « Aujourd'hui » : la journée seule sur téléphone ; hier, aujourd'hui et demain sur ordinateur.
   Agenda compact : plus d'une heure sans rien se replie en une ligne « libre » ; un cours où il ne va pas n'a plus de boîte :
   il est écrit dans la séance qui le remplace, dans la ligne « libre », ou en fine ligne à son heure */
function journees(P){
  const t0=today(),n=NOW(),now=n.getHours()*60+n.getMinutes(),PX=1.2,PLI=28,mm=A.mm;
  const acts=d=>[].concat(
    A.creneauxDu(d).map(c=>({k:"mien",a:c.a,b:c.b,c})),
    A.coursJour(d).map(c=>({k:"cls",a:mm(c.start),b:mm(c.end),c})),
    A.epreuvesDu(d).map(({S,e})=>({k:"exam",a:mm(e.start),b:e.end?mm(e.end):mm(e.start)+60,S,e})),
    (P.rituels||[]).filter(r=>r.day===d).map(r=>({k:"rit",a:r.start,b:r.end,r})),
    (d>=t0?A.sansDu(d):[]).map(([a,b])=>({k:"sans",a,b})),
    P.blocks.filter(b=>b.day===d).map(B=>({k:"rev",a:B.start,b:B.end,B})));
  const saute=x=>x.k==="cls"&&x.c.skip;
  const grille=(days,cls)=>{const L=days.map(acts),all=L.flat();
    if(!all.length)return `<p class="muted ${cls}">Ni cours ni révision ${days.length>1?"hier, aujourd'hui ou demain":"aujourd'hui"}.</p>`;
    const occ=all.filter(x=>!saute(x)).map(x=>[x.a,x.b]).sort((p,q)=>p[0]-q[0]);
    const h0=Math.min(8*60,...occ.map(o=>Math.floor(o[0]/60)*60)),h1=Math.max(22*60,...occ.map(o=>Math.ceil(o[1]/60)*60));
    const seg=[];let t=h0;occ.forEach(([a,b])=>{if(a>t){seg.push([t,a,a-t>60]);t=a;}if(b>t){seg.push([t,b,false]);t=b;}});if(h1>t)seg.push([t,h1,h1-t>60]);
    const Y=[];let acc=10;seg.forEach(([a,b,pli])=>{Y.push([a,b,acc,pli]);acc+=pli?PLI:(b-a)*PX;});
    const y=m=>{for(const[a,b,o,pli]of Y)if(m>=a&&m<=b)return pli?o+(m-a)/(b-a)*PLI:o+(m-a)*PX;return acc;},H=acc+12,plis=Y.filter(s=>s[3]);
    const pos=(a,b,min)=>`top:${y(a)+1}px;height:${Math.max(min||22,y(b)-y(a)-2)}px`,data=Y.map(([a,b,o,pli])=>`${a}:${b}:${o}:${pli?0:PX}`).join(",");
    let hrs="",lns="";for(let m=h0;m<=h1;m+=60)if(!plis.some(([a,b])=>m>a&&m<b)){hrs+=`<span style="top:${y(m)}px">${m/60}h</span>`;lns+=`<div class="ln" style="top:${y(m)}px"></div>`;}
    const col=(d,X)=>{const sur=x=>X.find(z=>(z.k==="rev"||z.k==="exam")&&z.a<x.b&&z.b>x.a)||X.find(z=>z.k==="rit"&&z.a<x.b&&z.b>x.a),
        replie=x=>plis.some(([a,b])=>x.a>=a&&x.a<b),fini=x=>d<t0||(d===t0&&x.b<=now),etat=x=>fini(x)||x.c.skip==="abs"?"pas allé":"révision à la place",
        place=new Map();X.filter(saute).forEach(x=>{const z=sur(x);if(z)place.set(z,(place.get(z)||[]).concat(x));});
      const pl=z=>(place.get(z)||[]).map(x=>`<span class="l2">à la place de <s>${x.c.name}</s> (${hh(x.a)})</span>`).join("");
      let s=lns;
      plis.forEach(([a,b,o])=>{const k=X.filter(x=>saute(x)&&!sur(x)&&x.a>=a&&x.a<b);
        s+=`<div class="libre ch" data-a="${a}" style="top:${o+3}px"><span>libre · ${hh(a)}–${hh(b)}${k.length?` · sautés : ${k.map(x=>`<button type="button" class="saut" data-cl="${d}|${x.c.start}"><s>${x.c.name}</s></button>`).join(", ")}`:""}</span></div>`;});
      X.forEach(x=>{
        if(x.k==="mien"){s+=A.cadreCren(x.c,P,y(x.a),y(x.b)-y(x.a),true);return;}
        if(x.k==="sans"){s+=A.fantome(d,x.a,x.b," ch",pos(x.a,x.b));return;}
        if(x.k==="cls"){const c=x.c;
          if(c.skip){if(!sur(x)&&!replie(x))s+=`<div class="ev saute ch" role="button" tabindex="0" data-cl="${d}|${c.start}" style="top:${y(x.a)+1}px"><span><s>${c.name}</s> · ${hh(x.a)}, ${etat(x)}</span></div>`;return;}
          s+=`<div class="ev cls ch" role="button" tabindex="0" data-cl="${d}|${c.start}" style="${pos(x.a,x.b)}"><b>${c.name}</b><span class="l2">${hh(x.a)} · ${c.detail}</span></div>`;return;}
        if(x.k==="exam"){s+=`<a class="ev exam ch" href="#/${x.S.id}" style="${pos(x.a,x.b,48)}"><i class="tg">CC</i><b>${x.e.label||"CC"} ${x.S.name}</b><span class="l2">${hh(x.a)} · <span class="nf">${x.e.place}</span></span></a>`;return;}
        if(x.k==="rit"){s+=`<a class="ev rev ch" href="${x.r.L[0].href}" style="--sc:var(--cornflower);${pos(x.a,x.b)}"><span class="l1"><b>D'abord</b><span>${hh(x.a)}–${hh(x.b)}</span></span><span class="l2">${x.r.L.map(i=>esc(i.t)).join(", ")}</span>${pl(x)}</a>`;return;}
        const B=x.B,S=SUBJ[B.sid],tk=B.tasks.map(id=>S.TB[id]).find(t=>t&&!isDone(B.sid,t));
        s+=`<a class="ev rev ch${tk?"":" done"}" href="${tk?hrefTask(B.sid,tk):"#/"+B.sid}"${tk?` data-rv="${d}|${B.start}|${B.end}|${B.sid}" data-go="Commencer"`:""} style="--sc:${S.color};${pos(B.start,B.end)}"><span class="l1"><b>${S.name}</b><span>${hh(B.start)}–${hh(B.end)}${tk?"":", fait"}</span></span>${tk?`<span class="l2">${esc(tk.t)}</span>`:""}${pl(x)}</a>`;});
      if(d===t0&&now>=h0&&now<=h1)s+=`<div class="edt-now" style="top:${y(now)}px"><span>${hh(now)}</span></div>`;
      return s;};
    const tete=days.length>1;
    return `<div class="jedt ${cls}"><div class="jhrs">${tete?`<div class="jh"></div>`:""}<div class="jbody" style="height:${H}px">${hrs}</div></div>${days.map((d,i)=>`<div class="jcol${d===t0?" today":""}${d<t0?" past":""}">${tete?`<div class="jh">${d===t0?"Aujourd'hui":d<t0?"Hier":"Demain"}<small>${dayName(d,true,true)}</small></div>`:""}<div class="jbody" data-day="${d}" data-h0="${h0}" data-y="${data}" data-ajuste style="height:${H}px">${col(d,L[i])}</div></div>`).join("")}</div>`;};
  return tiroir(`Emploi du temps<span class="jedt-date">· ${dayName(t0,true,true)}</span>`,`${grille([addDays(t0,-1),t0,addDays(t0,1)],"jedt-pc")}${grille([t0],"jedt-tel")}<div id="jbox" class="feuille" hidden></div><p class="jlink"><span class="muted">Touche une boîte pour la changer, un trou pour ajouter un créneau.</span> <a href="#" data-cradd>+ Ajouter un créneau</a> <a href="#/edt">Toute la semaine ›</a></p>`,"jours");}
function bindJours(){
  const box=$("#jbox");if(!box)return;const M=$("#main");
  const ouvre=el=>{const[d,h]=el.dataset.cl.split("|"),c=A.coursJour(d).find(x=>x.start===h);if(!c)return;
    const t0=today(),n=NOW(),fini=d<t0||(d===t0&&A.mm(c.end)<=n.getHours()*60+n.getMinutes());
    const O=fini?[["abs","Je n'y suis pas allé"],["","J'y suis allé"]]:[["rev","Je n'y vais pas : je révise à la place"],["","J'y vais"]];
    box.innerHTML=`<div><b>${c.name}</b>, ${dayName(d,true)} à ${h.replace(":","h")}, ${c.detail}.</div><div class="filters">${O.map(([v,t])=>`<button class="btn" data-sk="${v}" aria-pressed="${v?!!c.skip:!c.skip}">${t}</button>`).join("")}</div>`;
    box.dataset.k=d+":"+h;A.poseBoite(box);};
  M.querySelectorAll(".jedt [data-cl]").forEach(el=>{el.addEventListener("click",()=>ouvre(el));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();ouvre(el);}});});
  box.addEventListener("click",e=>{const b=e.target.closest("[data-sk]");if(!b)return;A.emit({k:"set",key:"skip:"+box.dataset.k,v:b.dataset.sk||"go"});home();});
  A.lierCren(M,box,1.2,col=>+col.dataset.h0,home);A.lierSeances(M,box,home);
  const plus=M.querySelector("[data-cradd]");if(plus)plus.addEventListener("click",e=>{e.preventDefault();const n=NOW(),m=Math.ceil((n.getHours()*60+n.getMinutes()+5)/30)*30;
    A.boiteCren(box,m>21*60?{day:addDays(today(),1),a:14*60}:{day:today(),a:Math.max(m,8*60)},home);});
  A.ajuste(M);}

/* le soir (choix 18a du 20/11) : 5 minutes de feuille blanche pour chaque matière vue en cours aujourd'hui, sur la compréhension
   (refaire de tête un raisonnement, un exemple, une démonstration, puis comparer), et 2 minutes sur le prochain jour de cours.
   Après la fin du dernier cours (17h au plus tôt) ; les cases cochées sont dans le journal (« soir »). */
function ceSoir(t0,n){const vus=A.coursJour(t0).filter(c=>!c.skip&&SUBJ[c.sid]);if(!vus.length)return "";
  if(n.getHours()*60+n.getMinutes()<Math.max(17*60,...vus.map(c=>A.mm(c.end))))return "";
  const typ=c=>/^CM/.test(c.detail||"")?"le CM":/^TP/.test(c.detail||"")?"le TP":/^TD/.test(c.detail||"")?"le TD":"le cours",par={};vus.forEach(c=>{(par[c.sid]=par[c.sid]||[]).push(c);});
  const L=Object.entries(par).map(([sid,C])=>({x:"fb:"+sid,t:`5 min · feuille blanche : ${SUBJ[sid].name}`,m:`Tu as eu ${C.map(c=>`${typ(c)} (${hh(A.mm(c.start))})`).join(", ").replace(/, ([^,]*)$/," et $1")}. Ferme tout. Refais de tête un raisonnement, un exemple ou une démonstration vus aujourd'hui, sans réciter, puis compare avec tes notes.`}));
  let dj=null;for(let k=1;k<=7&&!dj;k++){const d=addDays(t0,k),C=A.coursJour(d).filter(c=>!c.skip&&SUBJ[c.sid]);if(C.length)dj={d,c:C[0],k};}
  if(dj){const sid=dj.c.sid,S=SUBJ[sid],der=lesOf(sid).filter(x=>ST[sid].les[x.id]).sort((a,b)=>(ST[sid].les[b.id].ts||0)-(ST[sid].les[a.id].ts||0))[0],jr=dayName(dj.d).split(" ")[0];
    L.push({x:"dm",t:"2 min · demain",m:`${dj.k>1?"Rien en cours demain. "+jr.charAt(0).toUpperCase()+jr.slice(1):"Demain"} ${hh(A.mm(dj.c.start))} : ${typ(dj.c).replace(/^le /,"")} ${W.de(S.name)}. ${der?`Relis ta dernière leçon de ${S.name}, « ${esc(der.t)} » : tu arriveras en sachant où on en est.`:`Relis tes notes du dernier cours ${W.de(S.name)}.`}`});}
  const fait=x=>!!A.hub.soir[t0+"|"+x];
  return tiroir(`Ce soir · ${dayName(t0).split(" ").slice(0,2).join(" ")}`,`<ol class="todo">${L.map(o=>`<li class="task${fait(o.x)?" done":""}"><button class="tick" data-soir="${o.x}" aria-pressed="${fait(o.x)}" aria-label="${fait(o.x)?"Décocher":"Cocher"}">${fait(o.x)?"✓":""}</button><div><div class="tt">${o.t}</div><div class="meta">${o.m}</div></div></li>`).join("")}</ol>`,"soir");}
function home(){
  const t0=today(),n=NOW(),P=plan(),up=upcoming(),due=dueCards();
  const tb=P.blocks.filter(b=>b.day===t0);
  const nextT=nextTask(P);
  const doneToday=[];SIDS.forEach(id=>SUBJ[id].tasks.forEach(t=>{if(isDone(id,t)&&doneOn(id,t)===t0)doneToday.push({sid:id,t});}));
  const exToday=SIDS.map(id=>SUBJ[id]).filter(S=>exam(S).day===t0&&!exam(S).report&&examStart(S)>n);
  const nx=up.length?SUBJ[up.find(id=>!exam(SUBJ[id]).report)||up[0]]:null,mixed=A.hub.mixOn===t0;
  let h=`<div class="page wide home">${ttl(dayName(t0,true),nx?`${exW(nx)==="CC"?"Prochain CC":"Prochain "+exW(nx).toLowerCase()} : <b>${nx.name}</b>, ${examLine(nx)}${exam(nx).report?"":` (${jx(nx)})`}.`:"Tous les CC sont passés.")}`;
  if(exToday.length)h+=`<div class="examday">${exToday.map(S=>`<p><b>${exW(S)} ${W.de(S.name)} aujourd'hui à ${exam(S).start.replace(":","h")}</b>, <span class="nf">${exam(S).place}</span>. ${S.examMorning||""}</p>`).join("")}</div>`;
  if(window.ENT&&ENT.recap)h+=ENT.recap();
  const nS=nextT?SUBJ[nextT.sid]:null,nL=nextT&&nextT.t.lesson?BYL[nextT.sid][nextT.t.lesson]:null;
  /* le gros bouton : une leçon commencée, sinon les cartes du jour, sinon la suite du programme, sinon du repos */
  const lessonInfo=t=>{if(t&&t.plus)return `Des exercices des méthodes que tu as déjà vues, mélangés, environ ${hm(t.min)}`;if(!t||!t.lesson)return "Sur papier, comme au CC";const L=BYL[nextT.sid][t.lesson],np=L?parts(L,nextT.sid).length:1;return `Leçon pas à pas${np>1?`, en ${np} parties`:""}, environ ${hm(t.min)}`;};
  let go,after="";
  /* « Où j'en suis » : en gros bouton quand c'est nécessaire, en lien quand c'est conseillé */
  const DGS=A.diagAFaire(),DGN=DGS.find(x=>x.need)||null,MD=A.miniDu(),EJ=window.ENT?ENT.jour():null,qd=d=>d===addDays(t0,1)?"demain":dayName(d,false,true);
  if(nextT&&nextT.resume){const L=BYL[nextT.sid][nextT.t.lesson],PT=parts(L,nextT.sid),pk=PT.filter(x=>x<=nextT.resume.i).length;
    go={href:hrefTask(nextT.sid,nextT.t),c:"s-"+nextT.sid,tile:"▶",kick:`Continuer · ${nS.name}`,name:esc(nextT.t.t),sub:`Tu reprends à l'écran ${nextT.resume.i+1} sur ${nextT.resume.n}${PT.length>1?`, partie ${pk} sur ${PT.length}`:""}.`};}
  else if(DGN){const S=SUBJ[DGN.sid];go={href:`#/${DGN.sid}/niveau`,c:"s-"+DGN.sid,tile:"✓",kick:`D'abord · environ ${DGN.min} min`,name:`Où j'en suis en ${S.name}`,sub:`${exW(S)} ${jx(S)}. Coche ce que tu maîtrises et fais le mini-contrôle : le programme du jour se refait avec tes réponses.`};
    if(nextT)after=`Ensuite : ${esc(nextT.t.t)} (${nS.name}).`;}
  else if(EJ){go={href:"#/entrainer/jour",c:"c-bleu",tile:String(EJ.n),kick:`D'abord · environ ${EJ.min} min`,name:"Entretien du jour",sub:`${EJ.n} ${plural(EJ.n,"exercice")} ${EJ.n>1?"mélangés":""} pour ne pas oublier ce que tu as réussi : ${EJ.noms.join(", ")}.`};
    if(nextT)after=`Ensuite : ${esc(nextT.t.t)} (${nS.name}).`;}
  else if(MD.need){go={href:"#/mix",c:"c-bleu",tile:"?",kick:"D'abord · environ 10 min",name:"Mini-contrôle mélangé",sub:`12 questions de toutes tes matières. À revérifier aujourd'hui : ${MD.noms.slice(0,4).join(", ")}. Tes réponses mettent tes priorités à jour : le programme du jour se refait.`};
    if(nextT)after=`Ensuite : ${esc(nextT.t.t)} (${nS.name}).`;}
  else if(due.length){go={href:"#/reviser",c:"c-bleu",tile:due.length>99?"99+":String(due.length),kick:`Continuer · environ ${dureeCartes(due.length)}`,name:`Réviser ${due.length} ${plural(due.length,"carte")}`,sub:"Les cartes du jour, avant d'apprendre du nouveau : c'est ce qui fait tenir ce que tu as déjà appris."};
    if(nextT)after=`Ensuite : ${esc(nextT.t.t)} (${nS.name}).`;}
  else if(nextT&&nextT.today)go={href:hrefTask(nextT.sid,nextT.t),c:"s-"+nextT.sid,tile:nL?String(nL.i+1):ico("i-pen"),kick:`Continuer · ${nS.name}`,name:esc(nextT.t.t),sub:lessonInfo(nextT.t)+"."};
  else go={href:nextT?hrefTask(nextT.sid,nextT.t):"#/apprendre",c:"c-vert",tile:"✓",kick:"Aujourd'hui",name:"C'est fini pour aujourd'hui",sub:`${doneTodayMin()>0?"Repose-toi : ce qui était prévu est fait.":"Plus de créneau aujourd'hui : le plan reprend demain."}${nextT?` Pour avancer quand même : ${esc(nextT.t.t)} (${nS.name}).`:""}`,done:true};
  h+=`<a class="gobig ${go.c}${go.done?" is-done":""}" href="${go.href}"><span class="gobig__tile" aria-hidden="true">${go.tile}</span><span class="gobig__bar"><span class="gobig__kick">${go.kick}</span><span class="gobig__name">${go.name}</span><span class="gobig__sub">${go.sub}</span></span>${ico("i-arrow","ico gobig__arrow")}</a>`;
  h+=`<p class="gomore">${after?`<span>${after}</span>`:""}${EJ&&go.href!=="#/entrainer/jour"?`<a href="#/entrainer/jour">Entretien du jour (${EJ.n} ${plural(EJ.n,"exercice")}, environ ${EJ.min} min)</a>`:""}${due.length&&go.href!=="#/reviser"?`<a href="#/reviser">Réviser ${due.length} ${plural(due.length,"carte")}</a>`:""}${DGS.filter(x=>!(go.href===`#/${x.sid}/niveau`)).slice(0,2).map(x=>`<a href="#/${x.sid}/niveau">Où j'en suis en ${SUBJ[x.sid].name} (${x.why})</a>`).join("")}${go.href==="#/mix"?"":`<a href="#/mix">Mini-contrôle mélangé${mixed?` : fait aujourd'hui (${A.hub.mixScore} sur ${A.hub.mixSur})${MD.proch?", à refaire "+qd(MD.proch):""}`:MD.du?" (conseillé aujourd'hui)":MD.proch?` (à refaire ${qd(MD.proch)})`:""}</a>`}<button type="button" class="linkbtn" id="toprog">Voir tout le programme du jour</button></p>`;
  h+=ceSoir(t0,n);
  h+=journees(P);
  h+=`<div class="ecrin">${ruler}<div class="ecrin__velvet"><section class="group c-violet"><div class="group__head"><span class="group__tile" aria-hidden="true">${ico("i-star")}</span><h2 class="group__name">Mes CC</h2><span class="group__count">${up.length?`${up.length} à venir`:"tous passés"}</span></div><ul class="group__grid subjects">${ordered().map(subjPiece).join("")}</ul></section></div></div>`;
  const tot=tb.reduce((a,b)=>a+work(b.end-b.start),0),F=factor(),dt=doneTodayMin();
  if(window.ENT&&ENT.prevu)ENT.prevu(tot);
  /* un seul créneau ouvert : le prochain à faire ; les autres sont repliés */
  const openB=tb.find(b=>b.tasks.some(id=>{const t=SUBJ[b.sid].TB[id];return t&&!isDone(b.sid,t);}));
  const fold=b=>{const S=SUBJ[b.sid],T=b.tasks.map(id=>S.TB[id]).filter(Boolean),left=T.filter(t=>!isDone(b.sid,t)).length;
    return `<details class="day blkfold" style="--sc:${S.color}"><summary><b>${hh(b.start)} – ${hh(b.end)}</b><span class="blk-s">${S.name}</span><span>${left?`${left} ${plural(left,"étape")} à faire`:"fait"} · ${hm(work(b.end-b.start))}</span></summary><div style="padding:0 12px 12px">${blockHTML(b,false)}</div></details>`;};
  let pg=tb.length?`<p class="muted">Placé autour de tes cours. Il se recalcule chaque fois que tu termines quelque chose : ce qui est fait disparaît, ce qui est en retard est replacé.</p>${tb.map(b=>b===openB?blockHTML(b,false):fold(b)).join("")}`:`<p class="muted">${P.blocks.length?"Plus de créneau de révision aujourd'hui. Regarde les jours suivants, ou avance dans « Apprendre ».":"Tout ce qui était prévu est fait."}</p>`;
  const vc=A.coucheTxt(t0);if(vc)pg=`<p class="muted">${vc}</p>`+pg;
  if(doneToday.length)pg+=dayBox("Fait aujourd'hui",`${doneToday.length} ${plural(doneToday.length,"étape")}`,`<ol class="todo" style="padding:0 12px 12px">${doneToday.map(o=>taskHTML(o.sid,o.t,false)).join("")}</ol>`,doneToday.length<=4);
  const fx=String((Math.round(F*10)/10)).replace(".",","),mes=SIDS.some(id=>measured(id)==="mesuré");
  pg+=`<div class="bilan"><p><b>Ton rythme :</b> une leçon te prend environ <b>${fx} fois</b> le temps que j'avais prévu au départ, ${mes?"mesuré sur tes leçons":"estimé d'après ta première séance (le site le mesure sur tes prochaines leçons)"}. Les durées affichées en tiennent compte.${dt?` Aujourd'hui, tu as déjà travaillé environ <b>${hm(dt)}</b> : c'est retiré de ta journée.`:""}</p>${P.need?`<p>Pour l'essentiel (les leçons et un examen blanc par matière), il faudrait encore environ <b>${hm(P.need)}</b> ; d'ici tes CC, tu as environ <b>${hm(P.have)}</b> de travail possible${P.need>P.have?`. Tout ne tiendra pas : le plan garde, matière par matière, ce qui rapporte le plus de points avant chaque CC ; le reste est dans « Si tu as encore du temps ». Mieux vaut bien comprendre la moitié que survoler le tout.`:"."}</p>`:""}<p class="muted">Pauses comprises : 15 min au milieu de chaque séance de plus d'une heure, 20 min entre deux séances. Rythme et vitesse se règlent dans <a href="#/examens">Examens et rythme</a>.</p></div>`;
  const nbC=due.length,mC=nbC*A.tempsCarte().ms/60000;
  if(nbC)pg=`<div class="blk" style="--sc:var(--cornflower)"><div class="blk-h"><b>Cartes de Réviser</b><a href="#/reviser">commencer</a><span class="muted">environ ${dureeTxt(mC)} · ${nbC} ${plural(nbC,"carte")}</span></div></div>`+pg;
  h+=tiroir(`Ton programme d'aujourd'hui${tb.length||nbC?" · "+hm(tot+mC)+" de travail":""}`,pg,"prog");
  const days=[...new Set(P.blocks.map(b=>b.day))].filter(d=>d>t0);
  if(days.length)h+=tiroir("Les jours suivants",days.map(d=>{const L=P.blocks.filter(b=>b.day===d),ex=SIDS.map(id=>SUBJ[id]).filter(S=>exam(S).day===d&&!exam(S).report);
    return dayBox(dayName(d,true),`${ex.length?`<span class="r">${ex.every(S=>exW(S)==="CC")?"CC":ex.length>1?"Épreuves":exW(ex[0])} : ${ex.map(S=>S.name).join(", ")}</span>, `:""}${hm(L.reduce((a,b)=>a+b.end-b.start,0))}`,`<div style="padding:0 12px 12px;display:grid;gap:12px">${A.coucheTxt(d)?`<p class="muted" style="margin:0">${A.coucheTxt(d)}</p>`:""}${L.map(b=>blockHTML(b,false)).join("")}</div>`);}).join(""));
  const bon=Object.entries(P.bonus);
  if(bon.length)h+=tiroir("Si tu as encore du temps",`<p class="muted">Il reste plus de travail que de créneaux. Ces étapes passent après les autres : fais-les quand tu as fini en avance, ou passe au rythme « intensif » dans <a href="#/examens">Examens et rythme</a>.</p>${bon.map(([sid,L])=>dayBox(SUBJ[sid].name,`${L.length} ${plural(L.length,"étape")}`,todoBox(sid,L.map(id=>SUBJ[sid].TB[id])))).join("")}`);
  h+=tiroir("Infos",`<ul class="minis">${sw({href:"#/edt",c:"c-bleu",size:"small",tile:ico("i-cal"),name:"Emploi du temps"})}${sw({href:"#/examens",c:"c-violet",size:"small",name:"Examens et rythme",sub:`Rythme ${{leger:"léger",normal:"normal",intensif:"intensif"}[A.hub.rythme||"normal"]}, vitesse ×${String(Math.round(factor()*10)/10).replace(".",",")}`})}${sw({href:"#/methode",c:"c-bleu",size:"small",name:"Comment réviser"})}${sw({href:"#/synchro",c:"c-violet",size:"small",tile:ico("i-sync"),name:"Synchroniser"})}</ul>`);
  $("#main").innerHTML=h+`</div>`;
  bindJours();
  $("#main").querySelectorAll("[data-soir]").forEach(b=>b.addEventListener("click",()=>{emit({k:"soir",d:t0,x:b.dataset.soir,v:!A.hub.soir[t0+"|"+b.dataset.soir]});home();}));
  const tp=$("#toprog");if(tp)tp.addEventListener("click",()=>{const el=$(".tiroir.prog");if(el)el.scrollIntoView({behavior:"smooth",block:"start"});});
  bindTicks($("#main"),home);badges();}

/* ================= Apprendre : toutes les leçons ================= */
function apprendre(){
  let h=`<div class="page wide">${ttl("Apprendre","Une question à chaque écran, la correction tout de suite.")}`;
  ordered().forEach((id,k)=>{const S=SUBJ[id],Ls=lesOf(id),st=ST[id],d=lessonsDone(id);let firstTodo=null;
    const items=Ls.map((L,i)=>{const r=st.les[L.id],dn=isDone(id,S.TB["L-"+L.id]),redo=!dn&&!!r,isNext=!dn&&!firstTodo&&(S.TB["L-"+L.id].p===1||!Ls.some(M=>!isDone(id,S.TB["L-"+M.id])&&S.TB["L-"+M.id].p===1));if(isNext)firstTodo=L;
      const cls=dn?" is-done":isNext?" is-next":redo?" is-redo":S.TB["L-"+L.id].p>1?" is-later":"";
      const pg=dn?null:progGet(id,L.id);
      const meta=pg?`En cours · écran ${pg.i+1} sur ${pg.n}`:dn?`Fait · ${Math.round(r.best*100)} %`:redo?`À refaire · ${Math.round(r.best*100)} % la première fois`:`environ ${hm(S.TB["L-"+L.id].min)}${S.TB["L-"+L.id].p>1?" · si tu as le temps":""}`;
      return `<li class="slot${isNext?" slot-next":""}"><a class="piece lpiece${cls}" href="#/lecon/${id}/${L.id}">${isNext?`<span class="tag">Maintenant</span>`:""}${spark}<span class="lnum">${dn?"✓":redo?"!":i+1}</span><span class="piece__text"><span class="piece__title">${esc(L.t)}</span><span class="piece__meta">${meta}</span>${isNext&&L.goal?`<span class="lgoal">${L.goal}</span>`:""}</span></a></li>`;}).join("");
    h+=`<section class="ecrin s-${id}${k?" replie":""}">${k===0?ruler:""}<div class="ecrin__velvet"><div class="group"><div class="group__head"><span class="group__tile" aria-hidden="true">${ico("i-star")}</span><h2 class="group__name">${S.name}</h2><span class="group__count">${d}/${Ls.length} faites</span><span class="group__count">${exW(S)} ${shortDay(S)}${exam(S).report?"":" · "+jx(S)}</span><a class="group__more" href="#/${id}">Fiches, TD, annales</a></div><ul class="group__grid lessons">${items}</ul>${k&&Ls.length>1?`<button class="btn voir-tout" type="button">Voir les ${Ls.length} leçons</button>`:""}</div></div></section>`;});
  $("#main").innerHTML=h+`</div>`;
  $("#main").querySelectorAll(".voir-tout").forEach(b=>b.addEventListener("click",()=>{b.closest(".ecrin").classList.remove("replie");b.remove();}));badges();}

/* ================= une matière : tout ce qu'il y a dedans ================= */
function subject(sid){
  const S=SUBJ[sid],st=ST[sid],P=plan(),t0=today(),e=exam(S),Ls=lesOf(sid),d=lessonsDone(sid);
  const nextL=Ls.find(L=>!isDone(sid,S.TB["L-"+L.id])&&S.TB["L-"+L.id].p===1)||Ls.find(L=>!isDone(sid,S.TB["L-"+L.id]));
  const inProg=S.ORDER.filter(c=>!c.out),red=S.ORDER.filter(c=>st.review[c.id]).length,known=inProg.filter(c=>st.known[c.id]).length,tdk=S.td.filter(x=>st.td[x.id]).length,c="s-"+sid;
  let h=`<div class="page wide"><a class="back" href="#/">‹ Aujourd'hui</a>${ttl(S.name,`${exW(S)} <b>${examLine(S)}</b>${e.report?"":` (${jx(S)})`}, <span class="nf">${e.place}</span>, ${e.dur}. Documents : ${e.docs||S.docs}.${e.unsure?` <span class="r">${e.unsure}</span>`:""}`)}<p class="muted" style="margin-top:-12px;max-width:72ch">${e.prog||S.prog}</p>`;
  h+=`<ul class="swatches lead1">`
   +sw({href:nextL?`#/lecon/${sid}/${nextL.id}`:"#/apprendre",c,size:"big",tile:`${d}/${Ls.length}`,kicker:`Apprendre · ${d} ${plural(d,"leçon faite","leçons faites")} sur ${Ls.length}`,name:nextL?esc(nextL.t):"Toutes les leçons sont faites",sub:nextL?`La prochaine leçon pas à pas, environ ${hm(S.TB["L-"+nextL.id].min)}`:"Refais celles qui t'ont posé problème",done:!nextL})
   +(A.themesOf(S).length?sw({href:`#/${sid}/niveau`,c,tile:"✓",kicker:"Choisir quoi réviser",name:"Où j'en suis",sub:"Coche ce que tu maîtrises, fais le mini-contrôle : le planning se refait"}):"")
   +(window.ENT?ENT.tuile(sid,sw,c):"")
   +(A.lexDe(sid).length?sw({href:`#/${sid}/lexique`,c,tile:"Aa",kicker:"Comprendre les mots",name:"Lexique",sub:"Chaque mot technique du cours, expliqué simplement"}):"")
   +sw({href:`#/${sid}/cartes`,c,tile:ico("i-cards"),kicker:"Se tester",name:"Cartes des fiches",sub:`${known} sur ${inProg.length} sues${red?`, <span class="r">${red} en rouge</span>`:""}`})
   +(S.quiz.length?sw({href:`#/${sid}/quiz`,c,tile:"?",kicker:"Se tester",name:"Quiz de cours",sub:`Meilleur score : ${st.best} sur ${A.activeQuiz(S).length}`}):"")
   +(S.td.length?sw({href:`#/${sid}/td`,c,tile:ico("i-pen"),kicker:"Sur papier",name:esc(S.tdTitle||"Exercices de TD"),sub:`${tdk} sur ${S.td.length} sus`}):"")
   +(A.annOf(S).length?sw({href:`#/${sid}/annales`,c,tile:ico("i-doc"),kicker:exW(S)==="CC"?"Comme au CC":"Comme à l'examen",name:"Annales et chrono",sub:`${A.sujetsDe(sid).length} ${plural(A.sujetsDe(sid).length,"sujet")} corrigé${A.sujetsDe(sid).length>1?"s":""}`}):"")
   +(A4[sid]?sw({href:`#/${sid}/p/feuille`,c,tile:ico("i-doc"),kicker:"Pour le jour du CC",name:"Ma feuille à recopier",sub:A4[sid]}):"")
   +`</ul>`;
  const mn=A.notesHTML(sid);if(mn)h+=tiroir("Mes notes",`<div class="check" id="mesnotes">${mn}</div>`,c);
  const chs=[...new Set(S.ORDER.map(x=>x.ch))],isOut=ch=>S.ORDER.filter(x=>x.ch===ch).every(x=>x.out);
  const phone=matchMedia("(max-width:600px)").matches;
  const chap=ch=>{const L=S.ORDER.filter(x=>x.ch===ch),k=L.filter(x=>st.known[x.id]).length,r=L.filter(x=>st.review[x.id]).length;
    return `<details class="group chapd"${phone?"":" open"}><summary class="group__head"><span class="group__tile" aria-hidden="true">${ico("i-star")}</span><h3 class="group__name">${S.chapters[ch]||""}</h3><span class="group__count">${k}/${L.length} sues</span>${r?`<span class="group__count r">${r} en rouge</span>`:""}</summary><ul class="fgrid">${L.map(x=>{const s=A.status(sid,x.id);return `<li><a class="fiche${s?" "+s:""}${x.out?" out":""}" href="#/${sid}/c/${x.id}"><span class="dot ${s}"></span><span>${x.short||x.t}</span>${x.type==="demo"?`<span class="ftag">Démo</span>`:""}</a></li>`;}).join("")}</ul></details>`;};
  const inCh=chs.filter(ch=>!isOut(ch)),outCh=chs.filter(isOut);
  h+=`<div class="ecrin ${c}">${ruler}<div class="ecrin__velvet"><div class="group__head" style="margin:0"><h2 class="group__name" style="font-size:1.7rem">Fiches de cours</h2><span class="legend"><span><i class="dot known"></i>su</span><span><i class="dot review"></i>à revoir</span><span><i class="dot seen"></i>vu</span><span><i class="dot"></i>pas encore vu</span></span></div>${inCh.map(chap).join("")}${outCh.length?dayBox("Hors programme de ce CC",`${outCh.reduce((a,ch)=>a+S.ORDER.filter(x=>x.ch===ch).length,0)} fiches, seulement s'il reste du temps`,`<div style="padding:0 14px 14px;display:grid;gap:18px">${outCh.map(chap).join("")}</div>`):""}</div></div>`;
  if(S.pages.length)h+=tiroir("Pages utiles",`<ul class="minis">${S.pages.map(p=>sw({href:`#/${sid}/p/${p.id}`,c,size:"small",name:esc(p.t)})).join("")}</ul>`,c);
  const mine=P.blocks.filter(b=>b.sid===sid),days=[...new Set(mine.map(b=>b.day))];
  const bon=(P.bonus[sid]||[]).filter(id=>!isDone(sid,S.TB[id])),done=S.tasks.filter(t=>isDone(sid,t));
  const planned=new Set(mine.flatMap(b=>b.tasks)),orphan=S.tasks.filter(t=>!isDone(sid,t)&&!planned.has(t.id)&&!bon.includes(t.id)&&!t.cache);
  let pl=days.length?days.map((dd,i)=>{const B=mine.filter(b=>b.day===dd);return dayBox(`${dayName(dd,true)}${dd===t0?" (aujourd'hui)":""}`,hm(B.reduce((a,b)=>a+b.end-b.start,0)),`<div style="padding:0 12px 12px;display:grid;gap:12px">${B.map(b=>blockHTML(b,false)).join("")}</div>`,i===0);}).join(""):`<p class="muted">Aucun créneau prévu pour cette matière${examStart(S)<NOW()?" : le CC est passé.":"."}</p>`;
  if(orphan.length)pl+=dayBox("Pas encore placé",`${orphan.length} ${plural(orphan.length,"étape")}`,todoBox(sid,orphan));
  if(bon.length)pl+=dayBox("Si tu as encore du temps",`${bon.length} ${plural(bon.length,"étape")}`,todoBox(sid,bon.map(id=>S.TB[id])));
  if(done.length)pl+=dayBox("Déjà fait",`${done.length} ${plural(done.length,"étape")}`,todoBox(sid,done));
  h+=tiroir("Ton programme pour cette matière",pl,c);
  $("#main").innerHTML=h+`</div>`;bindTicks($("#main"),()=>subject(sid));fixLinks($("#main"),sid);badges();}

/* ================= S'entraîner : sur papier, comme au CC ================= */
function entrainer(){
  let h=`<div class="page wide">${ttl("S'entraîner","Tes épreuves sont sur papier, en temps limité : entraîne-toi comme le jour J.")}${window.ENT?ENT.bloc():""}`;
  ordered().forEach((id,k)=>{const S=SUBJ[id],T=S.tasks.filter(t=>!t.lesson&&!t.train),c="s-"+id;
    const L=[[`#/${id}/annales`,"Annales et chrono",ico("i-doc")],[`#/${id}/td`,S.tdTitle||"Exercices de TD",ico("i-pen")]];
    if(S.quiz.length)L.push([`#/${id}/quiz`,"Quiz de cours","?"]);
    S.pages.filter(p=>/recettes|feuille|types|formulaire/.test(p.id)).forEach(p=>L.push([`#/${id}/p/${p.id}`,p.t,ico("i-star")]));
    h+=`<section class="ecrin ${c}">${k===0?ruler:""}<div class="ecrin__velvet"><div class="group"><div class="group__head"><span class="group__tile" aria-hidden="true">${ico("i-star")}</span><h2 class="group__name">${S.name}</h2><span class="group__count">${exW(S)} ${shortDay(S)}${exam(S).report?"":" · "+jx(S)}</span></div><p class="muted" style="margin:-8px 0 14px">Documents autorisés : ${S.docs}.</p><ul class="minis">${L.map(l=>sw({href:l[0],c,size:"small",tile:l[2],name:esc(l[1]),ext:!!l[3]})).join("")}</ul></div><ol class="todo">${T.map(t=>taskHTML(id,t,false)).join("")}</ol></div></section>`;});
  $("#main").innerHTML=h+`</div>`;bindTicks($("#main"),entrainer);fixLinks($("#main"),null);badges();}

/* ================= Plus ================= */
function plus(){
  const tools=[["#/synchro","Synchroniser mes appareils","Ta progression sur le téléphone et l'ordinateur.","i-sync","c-violet"],["#/edt","Emploi du temps","Tes cours, tes CC et les créneaux de révision.","i-cal","c-bleu"],["#/examens","Examens et rythme","Dates, coefficients, documents, temps par jour.","i-star","c-violet"],["#/methode","Comment réviser","Ce que dit la recherche, et comment le site s'en sert.","i-star","c-bleu"],["#/mix","Mini-contrôle mélangé","12 questions de toutes les matières, pour savoir quoi réviser.","i-mix","c-violet"]];
  $("#main").innerHTML=`<div class="page wide">${ttl("Plus")}
   ${tiroir("Outils",`<ul class="minis">${tools.map(x=>sw({href:x[0],c:x[4],size:"small",tile:ico(x[3]),name:x[1],sub:x[2]})).join("")}</ul>`)}
   ${tiroir("Fiches de cours",`<ul class="minis">${SIDS.map(id=>sw({href:"#/"+id,c:"s-"+id,size:"small",tile:tart(id),name:SUBJ[id].name,sub:"Fiches, démos, TD, annales"+(A4[id]?", feuille à recopier":"")})).join("")}</ul>`)}
   ${tiroir("Feuilles A4 recto-verso",`<ul class="minis">${Object.entries(A4).map(([id,f])=>sw({href:f,ext:true,c:"s-"+id,size:"small",tile:ico("i-doc"),name:SUBJ[id].name,sub:"Le PDF à imprimer et à emporter au CC"})).join("")}</ul>`)}</div>`;badges();}

/* ================= Comment réviser ================= */
function methode(){
  $("#main").innerHTML=`<div class="page"><h1 class="stitle sm">Comment réviser en peu de temps</h1>
   <p class="lead">Le site suit ce que la recherche sur l'apprentissage montre de plus solide, et ce que font les meilleures applications d'apprentissage (Brilliant, Math Academy, Anki).</p>
   ${sec(1,"Se tester au lieu de relire",`<p>Chercher une réponse de mémoire, puis voir la correction tout de suite, fait beaucoup mieux retenir que relire ou surligner. Dans la grande synthèse de Dunlosky et ses collègues (2013), se tester et espacer sont les deux seules méthodes jugées très efficaces ; relire, surligner et résumer sont en bas du classement.</p><p><b>Sur le site</b> : chaque leçon est une suite de questions avec correction immédiate, et les démos se refont sur papier.</p>`)}
   ${sec(2,"Espacer, même sur une semaine",`<p>Revoir une notion le lendemain puis deux jours après la fait tenir bien mieux que trois fois le même soir. Même sur une seule semaine, réviser en plusieurs fois donne de meilleures notes qu'en une seule séance.</p><p><b>Sur le site</b> : les cartes « À retenir » reviennent dans « Réviser » le lendemain, puis plus tard, et toutes la veille du CC.</p>`)}
   ${sec(3,"L'exemple corrigé avant l'exercice",`<p>Quand on débute, étudier un exemple corrigé étape par étape apprend plus vite que chercher seul. Ensuite on retire les étapes une par une : textes à trous, puis exercice complet.</p><p><b>Sur le site</b> : « Afficher l'étape suivante » (essaie de la deviner avant), puis les trous à compléter, puis l'exercice sur papier.</p>`)}
   ${sec(4,"Remettre un programme dans l'ordre",`<p>Pour le code, remettre des lignes dans l'ordre (les « problèmes de Parsons ») apprend autant qu'écrire le programme en entier, en beaucoup moins de temps. C'est idéal pour les fin pour; et fin tq; au bon endroit.</p>`)}
   ${sec(5,"Une idée par écran, une question tout de suite",`<p>C'est la recette de Brilliant : une courte explication avec une figure, puis une question sur ce qu'on vient de voir. Math Academy y ajoute la révision espacée et le mélange des sujets : c'est le rôle de « Réviser » et du mini-contrôle mélangé.</p>`)}
   ${sec(6,"Deviner avant de lire",`<p>Essayer de répondre à une question <b>avant</b> d'avoir appris la réponse aide à retenir ce qu'on lit ensuite, même quand on se trompe, à condition de lire la bonne réponse juste après (synthèse de Pan et Carpenter, 2023). La question oriente la lecture : on lit en cherchant.</p><p><b>Sur le site</b> : la première question d'une leçon est marquée « Devine d'abord » ; elle ne compte pas. Ensuite, quand une explication est suivie d'une question, cette question est affichée en haut de l'écran (« Tu cherches ») : tu lis l'explication en cherchant la réponse, puis tu réponds une seule fois. Toutes les questions portent sur ce que la leçon t'a déjà montré.</p>`)}
   ${sec(7,"Retrouver jusqu'à réussir, puis recommencer un autre jour",`<p>Ce qui marche le mieux pour un examen : se tester sur une notion jusqu'à la retrouver une fois sans aide, puis recommencer lors de plusieurs séances, à des jours différents. Dans une étude menée dans un vrai cours, les notes ont gagné environ une mention (Rawson, Dunlosky et Sciartelli, 2013).</p><p><b>Sur le site</b> : dans « Réviser », une carte ratée revient plus loin dans la séance jusqu'à ce que tu la retrouves (3 fois au plus), puis elle revient les jours suivants. Une question ratée dans une leçon y revient aussi, le jour même puis les jours suivants. Et à la fin d'un quiz, tu vois la liste de tes erreurs avec leur correction.</p>`)}
   ${sec(8,"Les conditions du CC, et le sommeil",`<p>Fais au moins une annale par matière en 1 heure, sur papier. La veille d'un CC : les cartes du jour, les fiches en rouge, et une vraie nuit.</p><p><b>Les pauses</b> : l'attention baisse après 45 minutes environ. Une pause de 10 à 15 minutes, sans écran, fait mieux retenir que de continuer en forçant. Le plan prévoit ces pauses, et le lecteur de leçon te les rappelle.</p>`)}
   <section class="sec"><h2>Sources</h2><ul class="src"><li><a href="https://doi.org/10.1007/s10648-023-09814-5" target="_blank" rel="noopener">Pan et Carpenter (2023), Prequestioning and Pretesting Effects, Educational Psychology Review</a></li><li><a href="https://doi.org/10.1007/s10648-013-9240-4" target="_blank" rel="noopener">Rawson, Dunlosky et Sciartelli (2013), The Power of Successive Relearning, Educational Psychology Review</a></li><li><a href="https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html" target="_blank" rel="noopener">Which Study Strategies Make the Grade? (Association for Psychological Science, sur Dunlosky et al. 2013)</a></li><li><a href="https://www.learningscientists.org/s/Spaced-Practice-esre.pdf" target="_blank" rel="noopener">Spaced Practice (The Learning Scientists)</a></li><li><a href="https://en.wikipedia.org/wiki/Worked-example_effect" target="_blank" rel="noopener">Worked-example effect (Wikipédia)</a></li><li><a href="https://hg.gatech.edu/node/603172" target="_blank" rel="noopener">Ericson : les problèmes de Parsons (Georgia Tech)</a></li><li><a href="https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/" target="_blank" rel="noopener">How Brilliant teaches math</a></li><li><a href="https://mathacademy.com/pedagogy" target="_blank" rel="noopener">Math Academy : pedagogy</a></li></ul></section></div>`;badges();}

/* ================= synchronisation entre appareils (gist GitHub secret) ================= */
const SKEY="rev-s1-synchro",FILE="revisions-s1-progression.json";
let SY=null;try{SY=JSON.parse(localStorage.getItem(SKEY)||"null");}catch(e){SY=null;}
const saveSY=()=>{try{if(SY)localStorage.setItem(SKEY,JSON.stringify(SY));else localStorage.removeItem(SKEY);}catch(e){}};
async function gh(path,opt){opt=opt||{};const h={"Accept":"application/vnd.github+json","Authorization":"Bearer "+SY.token};if(opt.body)h["Content-Type"]="application/json";
  const r=await fetch("https://api.github.com"+path,{method:opt.method||"GET",headers:h,body:opt.body,cache:"no-store"});
  if(!r.ok)throw new Error(r.status===401?"GitHub refuse le code (faux ou expiré)":r.status===404?"sauvegarde introuvable sur GitHub":r.status===403?"GitHub refuse l'accès (le code doit avoir la case « gist »)":"erreur GitHub "+r.status);
  if(opt.sansCorps){try{if(r.body)r.body.cancel();}catch(e){}return null;}/* GitHub répond avec toute la sauvegarde : on ne la télécharge pas */
  return r.status===204?null:r.json();}
/* La sauvegarde est faite de petits fichiers : un par appareil et par jour (s1-<appareil>-<jour>.json), avec les actions
   et les réponses de ce jour-là. Un appareil n'écrit que ses propres fichiers, et seulement ceux qui ont grandi ;
   il ne télécharge que les fichiers des autres dont la taille a changé. L'ancien fichier unique est encore lu. */
const PRE="s1-",jourDe=t=>A.ymd(new Date(t));
const lire=txt=>{try{const o=JSON.parse(txt);return {ev:Array.isArray(o&&o.ev)?o.ev:[],rep:Array.isArray(o&&o.rep)?o.rep:[]};}catch(e){return {ev:[],rep:[]};}};
let syncing=false,pending=false,deb=null;
async function sync(){
  if(!SY||!SY.token||!SY.gist)return syncBadge();
  if(!navigator.onLine){syncBadge("hors ligne");return;}
  if(syncing){pending=true;return;}syncing=true;syncBadge("…");
  try{SY.vu=SY.vu||{};SY.env=SY.env||{};
    const moi=PRE+A.device()+"-",aLire=f=>(f.filename===FILE||f.filename.indexOf(PRE)===0)&&f.filename.indexOf(moi)!==0&&SY.vu[f.filename]!==f.size;
    let recu={ev:[],rep:[]},vus={},files=null;
    const prendre=(f,txt)=>{const o=lire(txt);recu.ev=recu.ev.concat(o.ev);recu.rep=recu.rep.concat(o.rep);vus[f.filename]=f.size;};
    /* 1. la liste des fichiers (sans leur contenu), puis seulement ceux des autres appareils qui ont changé */
    try{const g=((await gh("/gists?per_page=100"))||[]).find(x=>x.id===SY.gist);if(g&&g.files)files=Object.values(g.files);}catch(e){}
    let tout=!files;
    if(files){try{for(const f of files.filter(aLire)){const r=await fetch(f.raw_url,{cache:"no-store"});if(!r.ok)throw new Error("fichier");prendre(f,await r.text());}}
      catch(e){tout=true;recu={ev:[],rep:[]};vus={};}}
    if(tout){/* secours : toute la sauvegarde en une fois */
      const g=await gh("/gists/"+SY.gist);
      for(const f of Object.values(g.files||{}).filter(aLire)){let txt=f.content;if(f.truncated&&f.raw_url)txt=await (await fetch(f.raw_url,{cache:"no-store"})).text();prendre(f,txt);}}
    const added=A.mergeEvents(recu.ev);await A.importReps(recu.rep);Object.assign(SY.vu,vus);saveSY();
    /* 2. les jours de cet appareil qui ont de nouvelles actions ou de nouvelles réponses */
    const dev=A.device()+"-",evs={},reps={},sig={};
    A.journal().forEach(e=>{if(String(e.i).indexOf(dev)===0){const d=jourDe(e.t);(evs[d]=evs[d]||[]).push(e);}});
    (await A.repsPropres()).forEach(r=>{const d=r.jour||jourDe(r.t);(reps[d]=reps[d]||[]).push(r);});
    Object.keys(evs).concat(Object.keys(reps)).forEach(d=>{const s=(evs[d]||[]).length+"/"+(reps[d]||[]).length;if(SY.env[d]!==s)sig[d]=s;});
    const jours=Object.keys(sig).sort();
    for(let k=0;k<jours.length;k+=15){const lot={},part=jours.slice(k,k+15);part.forEach(d=>{lot[moi+d+".json"]={content:JSON.stringify({v:2,ev:evs[d]||[],rep:reps[d]||[]})};});
      await gh("/gists/"+SY.gist,{method:"PATCH",body:JSON.stringify({files:lot}),sansCorps:true});part.forEach(d=>{SY.env[d]=sig[d];});saveSY();}
    SY.last=Date.now();SY.err=null;saveSY();
    if(added){const p=A.cur().page;A.seanceArrivee();
      if(p==="reviser"&&RV&&!RV.debute&&!RV.end){const s=A.seanceGet("cartes");if(s&&s.run!==RV.run){RV=null;reviser();}}
      if(p!=="lecon"&&p!=="reviser"&&p!=="mix"&&p!=="quiz"&&!(p==="express"&&/^#\/express\/[^/]+\/[^/]+\/./.test(location.hash)))A.route();
      else if(p==="lecon"&&LP){const q=progGet(LP.sid,LP.id);if(q&&q.ts>(LP.saved||0)&&q.i!==LP.i)lessonRoute([LP.sid,LP.id]);}}
  }catch(e){if(SY){SY.err=String(e&&e.message||e);saveSY();}}
  finally{syncing=false;syncBadge();if(pending){pending=false;setTimeout(sync,1500);}}}
function syncBadge(t){const b=$("#syncb");if(!b)return;b.hidden=false;if(!SY||!SY.token){b.textContent="Pas synchro";b.classList.add("err");return;}
  const ago=SY.last?Math.round((Date.now()-SY.last)/60000):null;
  b.textContent=t?`Synchro ${t}`:SY.err?"Synchro : erreur":ago===null?"Synchro…":ago<1?"Synchronisé":`Synchronisé il y a ${ago} min`;
  b.classList.toggle("err",!!(SY.err&&!t));}
async function connect(raw){
  raw=String(raw||"").trim();let token=raw,gist=null;const m=raw.match(/^RS1:([0-9a-f]+):(\S+)$/i);if(m){gist=m[1];token=m[2];}
  if(!/^(gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}$/.test(token))throw new Error("Ce n'est pas un code GitHub : il commence par ghp_ (ou un code de synchronisation qui commence par RS1:).");
  SY={token,gist,last:0,err:null};
  try{if(!gist){const list=await gh("/gists?per_page=100"),g=(list||[]).find(x=>x.files&&x.files[FILE]);
      gist=g?g.id:(await gh("/gists",{method:"POST",body:JSON.stringify({description:"Révisions S1 : ma progression (synchronisation automatique)",public:false,files:{[FILE]:{content:JSON.stringify({v:1,ev:[]})}}})})).id;}
    SY.gist=gist;saveSY();}catch(e){SY=null;saveSY();throw e;}
  await sync();}
function synchro(){
  const on=!!(SY&&SY.token&&SY.gist);
  const tokenUrl="https://github.com/settings/tokens/new?scopes=gist&description=R%C3%A9visions%20S1";
  $("#main").innerHTML=`<div class="page"><h1 class="stitle sm">Synchroniser mes appareils</h1>
   <p class="lead">Ta progression (leçons, cartes, fiches, étapes cochées) est enregistrée sur cet appareil. Pour la retrouver à la fois sur ton ordinateur et sur ton téléphone, le site la range dans un fichier secret de ton compte GitHub, et fusionne les deux appareils sans rien perdre.</p>
   ${on?`<section class="check"><h2 style="font-size:1.1rem">Cet appareil est synchronisé</h2><p id="systat" class="muted"></p><div class="acts"><button class="btn pri" id="synow">Synchroniser maintenant</button><button class="btn" id="sycode">Ajouter un autre appareil</button><button class="btn" id="syoff">Déconnecter cet appareil</button></div><div id="sybox" hidden></div></section>`:
   `${sec(1,"Sur ton ordinateur (une seule fois)",`<ol class="steps-plain"><li>Ouvre <a href="${tokenUrl}" target="_blank" rel="noopener">cette page de GitHub</a> (connecte-toi avec ton compte glime32 si besoin).</li><li>Laisse cochée seulement la case <b>gist</b>. Choisis une durée, par exemple 30 jours.</li><li>Clique sur <b>Generate token</b> en bas, puis copie le code qui commence par <code>ghp_</code>.</li><li>Colle-le ci-dessous et clique sur <b>Connecter</b>.</li></ol>`)}
    ${sec(2,"Sur ton téléphone",`<p>Une fois l'ordinateur connecté, clique sur « Ajouter un autre appareil » sur l'ordinateur : un code de synchronisation et un QR code s'affichent. Scanne le QR code avec l'appareil photo du téléphone, copie le texte, et colle-le ici, sur le téléphone.</p>`)}
    <section class="check"><label for="sytok"><b>Code GitHub (ghp_…) ou code de synchronisation (RS1:…)</b></label><input id="sytok" type="password" autocomplete="off" spellcheck="false" placeholder="Colle le code ici" style="width:100%;font:inherit;padding:10px;border-radius:10px;border:1px solid var(--trait);background:var(--feuille);color:var(--encre)"><div class="acts"><button class="btn pri" id="syconn">Connecter</button></div><p id="symsg" class="muted" aria-live="polite"></p></section>`}
   <section class="usage"><h2>Ce qu'il faut savoir</h2><p>Le code donne accès à tes gists GitHub (et à rien d'autre) : ne le partage avec personne. Il reste seulement dans ce navigateur. Tu peux le supprimer à tout moment sur GitHub, dans Settings → Developer settings → Personal access tokens.</p><p>Sans connexion, le site marche normalement : il synchronise dès que le réseau revient.</p></section>
   <section class="usage"><h2>Toutes mes réponses</h2><p>Chaque réponse que tu donnes (leçons, quiz, mini-contrôles, cartes) est gardée sur cet appareil avec son détail : la question, ton choix, la bonne réponse, la date et le temps passé. Quand la synchronisation est active, ce carnet est aussi rangé dans ta sauvegarde GitHub et arrive sur tes autres appareils : un petit fichier par appareil et par jour, et seul celui du jour est renvoyé. Le bouton en fait un fichier, avec le journal de ta progression.</p><p><button class="btn" id="repdl">Télécharger mes réponses</button> <span class="muted" id="repn"></span></p></section></div>`;
  A.allReps().then(L=>{const n=$("#repn");if(n)n.textContent=`${L.length} réponses dans le carnet de cet appareil.`;});
  $("#repdl").addEventListener("click",async()=>{const L=await A.allReps(),b=new Blob([JSON.stringify({fait:new Date().toISOString(),reponses:L,journal:A.journal()})],{type:"application/json"}),u=URL.createObjectURL(b),l=document.createElement("a");l.href=u;l.download=`mes-reponses-${A.today()}.json`;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);});
  if(on){const stat=()=>{const p=$("#systat");if(p)p.textContent=SY.err?`Dernier essai : ${SY.err}.`:SY.last?`Dernière synchronisation : ${new Date(SY.last).toLocaleString("fr-FR")}. Ce journal contient ${A.journal().length} actions.`:"Pas encore synchronisé.";};stat();
    $("#synow").addEventListener("click",async()=>{await sync();stat();});
    $("#syoff").addEventListener("click",()=>{SY=null;saveSY();syncBadge();synchro();});
    $("#sycode").addEventListener("click",()=>{const box=$("#sybox"),codeTxt=`RS1:${SY.gist}:${SY.token}`;box.hidden=false;
      box.innerHTML=`<p><b>Code de synchronisation</b> (à garder pour toi) :</p><p><code class="sycode">${esc(codeTxt)}</code></p><div id="syqr" class="syqr"></div><p class="muted">Sur le téléphone : ouvre le site, va dans Plus → Synchroniser mes appareils, colle ce code et clique sur Connecter.</p>`;
      const draw=()=>{try{const q=window.qrcode(0,"M");q.addData(codeTxt);q.make();$("#syqr").innerHTML=q.createSvgTag(4,8);}catch(e){}};
      if(window.qrcode)draw();else{const sc=document.createElement("script");sc.src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";sc.onload=draw;sc.onerror=()=>{$("#syqr").textContent="(QR code indisponible hors ligne : recopie le code.)";};document.head.appendChild(sc);}});}
  else $("#syconn").addEventListener("click",async()=>{const m=$("#symsg");m.textContent="Connexion à GitHub…";try{await connect($("#sytok").value);m.textContent="";syncBadge();synchro();}catch(e){m.textContent=String(e&&e.message||e);}});
  syncBadge();}

/* déclencheurs de la synchronisation */
setTimeout(sync,1500);
document.addEventListener("visibilitychange",()=>sync());/* en revenant sur la page, et en la quittant pour envoyer les dernières réponses */
window.addEventListener("online",()=>sync());
setInterval(()=>{if(document.visibilityState==="visible")sync();},180000);
setInterval(()=>syncBadge(),60000);

return {
  routes:{lecon:lessonRoute,apprendre,reviser:()=>{RV=null;sync();reviser();},entrainer,plus,synchro,methode,continuer:()=>location.replace(suite())},
  home,subject,badges,sync,cartesDu,partsOf:(sid,lid)=>{const L=BYL[sid]&&BYL[sid][lid];return L?parts(L,sid).length:1;},
  onChange(){badges();clearTimeout(deb);deb=setTimeout(sync,4000);}
};
}};
})();
