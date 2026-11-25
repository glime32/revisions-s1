/* Site central : matières, emploi du temps, plan de révision, et pages de chaque matière */
(function(){
"use strict";
const $=s=>document.querySelector(s);
const SUBJ=window.SUBJ,SIDS=["geo","algo","pf","calc","lin","ana","rai","usi","aut"].filter(id=>SUBJ[id]);
const TYPE={def:["Définition","def"],ax:["Axiome","ax"],th:["Théorème","th"],demo:["Démo exigible","demo"],td:["Résultat de TD","th"],meth:["Méthode","th"],algo:["Algorithme","def"],code:["À savoir écrire","def"]};
const an=s=>`<span class="ang">${s}</span>`;
const LES=window.LESSONS||{};
/* Les durées suivent ton rythme : le temps vraiment passé sur tes leçons est mesuré, et les estimations sont multipliées
   d'autant (3,5 par défaut, d'après ta première séance de géométrie). Une leçon « late » passe après l'examen blanc. */
const SPEED={def:3.5,by:{},all:[]};
/* cartes de Réviser : L = [ms (3 min au plus), 1er passage ?, jour] de chaque carte notée, neuves = cartes créées par jour, carnet = temps déjà notés dans le carnet de chaque appareil */
const CARTES={L:[],neuves:{},carnet:{}};
function factor(sid){const v=hub.vitesse;if(v&&v!=="auto"&&+v>0)return +v;const a=(sid&&SPEED.by[sid])||[];const pool=a.length>=2?a:SPEED.all;if(!pool.length)return SPEED.def;
  const x=pool.slice(-6).sort((p,q)=>p-q),k=x.length;return Math.min(6,Math.max(1,k%2?x[(k-1)/2]:(x[k/2-1]+x[k/2])/2));}
const measured=sid=>(hub.vitesse&&hub.vitesse!=="auto")?"manuel":((SPEED.by[sid]||[]).length>=2||SPEED.all.length)?"mesuré":"estimé";
/* leçons : × vitesse ; annales et séries d'exercices : la moitié du surplus ; tâches courtes (quiz, veille, feuille A4) : telles quelles */
function estMin(sid,t){const F=factor(sid);return Math.min(105,Math.round(t.base*(t.lesson?F:t.base>=40?1+(F-1)/2:1)));}
SIDS.forEach(id=>{const S=SUBJ[id];
  const les=(LES[id]||[]).map(L=>Object.assign({id:"L-"+L.id,lesson:L.id,t:L.t,base:L.min,p:L.p||1,why:L.goal,late:!!L.late},L.ex?{ex:L.ex}:{}));
  const prac=(S.tasks||[]).filter(t=>!t.items).map(t=>Object.assign(t,{base:t.base||t.min}));
  S.tasks=prac.filter(t=>t.first).concat(les.filter(t=>!t.late),prac.filter(t=>!t.last&&!t.first),les.filter(t=>t.late),prac.filter(t=>t.last));
  S.tasks.forEach(t=>{delete t.min;Object.defineProperty(t,"min",{get(){return estMin(id,t);},enumerable:true,configurable:true});});});
/* matières à plusieurs épreuves : une fiche ou un exercice prévu pour une autre épreuve est « hors programme » pour l'épreuve courante */
SIDS.forEach(id=>{const S=SUBJ[id];if(!S.exams)return;const dyn=x=>{if(x._dyn)return;Object.defineProperty(x,"_dyn",{value:1});const st=x.out;Object.defineProperty(x,"out",{get(){if(inScope(S,x))return false;const e=examsOf(S).find(e=>e.id===exId(S,x));const lab=e&&e.label;return st||((lab?"Pour "+(/^CC/.test(lab)?"le "+lab:"l'"+lab.toLowerCase()):"Pour le prochain contrôle")+", pas pour l'épreuve qui vient.");},configurable:true,enumerable:true});};(S.concepts||[]).forEach(dyn);(S.td||[]).forEach(dyn);});
SIDS.forEach(id=>{const S=SUBJ[id];S.id=id;S.BY={};S.concepts.forEach(c=>S.BY[c.id]=c);S.ORDER=S.concepts.slice().sort((a,b)=>a.ch-b.ch);S.TB={};S.tasks.forEach((t,i)=>{t.p=t.p||2;t.i=i;S.TB[t.id]=t;});S.quiz=S.quiz||[];S.td=S.td||[];S.ann=S.ann||[];S.pages=S.pages||[];});
/* Thèmes d'une épreuve (S.themes) : chacun a son poids moyen en points dans les anciens sujets, ses leçons et ses exercices.
   La page « Où j'en suis » enregistre ce que l'étudiant pense maîtriser et un mini-contrôle. Une étape d'un thème maîtrisé,
   ou qui rapporte moins d'un demi-point, passe en « si tu as le temps » ; une étape d'un thème à travailler passe en priorité. */
SIDS.forEach(id=>{const S=SUBJ[id];S.TH={};if(!S.themes)return;
  S.themes.forEach(T=>{(T.les||[]).map(l=>"L-"+l).concat(T.tasks||[]).forEach(tid=>{S.TH[tid]=T;});});
  S.tasks.forEach(t=>{const T=S.TH[t.id];if(!T)return;const p0=t.p;Object.defineProperty(t,"p",{get(){return prioTheme(S,T,p0);},enumerable:true,configurable:true});});});

/* ---------- dates ---------- */
function NOW(){const q=new URLSearchParams(location.search);const f=q.get("date"),t=q.get("heure");if(f&&/^\d{4}-\d\d-\d\d$/.test(f)){const[y,m,d]=f.split("-").map(Number);const[h,mi]=(t||"08:00").split(":").map(Number);return new Date(y,m-1,d,h,mi);}return new Date();}
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>ymd(NOW());
const toD=(day,min)=>{const[y,m,d]=day.split("-").map(Number);return new Date(y,m-1,d,Math.floor(min/60),min%60);};
const mm=s=>{const[h,m]=s.split(":").map(Number);return h*60+m;};
const hh=min=>`${Math.floor(min/60)}h${String(min%60).padStart(2,"0")}`.replace(/h00$/,"h");
const hm=min=>{min=Math.round(min/5)*5;const h=Math.floor(min/60),m=min%60;return h?`${h} h${m?" "+String(m).padStart(2,"0"):""}`:`${m} min`;};
const JOURS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function dayName(s,cap,short){const[y,m,d]=s.split("-").map(Number),D=new Date(y,m-1,d);const t=short?`${JOURS[D.getDay()].slice(0,3)}. ${d}`:`${JOURS[D.getDay()]} ${d} ${MOIS[m-1]}`;return cap?t.charAt(0).toUpperCase()+t.slice(1):t;}
const addDays=(s,n)=>{const[y,m,d]=s.split("-").map(Number);return ymd(new Date(y,m-1,d+n));};

/* ---------- état : un journal d'événements, synchronisable entre appareils ----------
   Chaque action (fiche sue, leçon finie, carte revue, étape cochée…) est un événement daté.
   L'état affiché est recalculé à partir du journal : deux appareils fusionnent leurs journaux sans rien perdre. */
const HUBKEY="rev-hub-v1",JKEY="rev-s1-journal",DKEY="rev-s1-appareil";
const local={theme:null,open:{}};
try{const h=JSON.parse(localStorage.getItem(HUBKEY)||"null");if(h){local.theme=h.theme||null;if(h.open&&typeof h.open==="object")local.open=h.open;}}catch(e){}
const hub={theme:local.theme,exams:{},notes:{},skip:{},cren:{},sans:{},smat:{},rythme:"normal",vitesse:"auto",mixOn:null,mixScore:0,mixSur:10,se:{},soir:{}};
const saveHub=()=>{local.theme=hub.theme;try{localStorage.setItem(HUBKEY,JSON.stringify({theme:local.theme,open:local.open}));}catch(e){}};
let DEV="";try{DEV=localStorage.getItem(DKEY)||"";if(!DEV){DEV=Math.random().toString(36).slice(2,8);localStorage.setItem(DKEY,DEV);}}catch(e){DEV=Math.random().toString(36).slice(2,8);}
let J=[];try{const r=JSON.parse(localStorage.getItem(JKEY)||"[]");if(Array.isArray(r))J=r.filter(e=>e&&e.i&&e.t&&e.k);}catch(e){}
const persistJ=()=>{try{localStorage.setItem(JKEY,JSON.stringify(J));}catch(e){}};
const ST={};
function cardIds(sid,lid){const L=(LES[sid]||[]).find(x=>x.id===lid);if(!L)return [];const out=[];let n=0;L.steps.forEach(st=>{if(st.k==="card")out.push(lid+"#"+(n++));});return out;}
function blank(id){if(!local.open[id]||typeof local.open[id]!=="object")local.open[id]={};return {seen:{},known:{},review:{},knownOn:{},td:{},tdOn:{},tasks:{},best:0,quizOn:null,open:local.open[id],les:{},cards:{},pos:{},diag:{},prio:{},jv:{},pq:{},err:{}};}
/* ce qu'on sait d'un thème : chaque réponse (mini-contrôle, quiz, carte, erreur en leçon) ajoute une preuve.
   Une preuve perd la moitié de son poids en 3 jours ; un nouveau mini-contrôle divise encore les anciennes par 2. */
const jnum=d=>{const[y,m,j]=d.split("-").map(Number);return Math.round(Date.UTC(y,m-1,j)/864e5);};
function preuve(st,th,ok,n,day,run,test){const d=st.diag[th]||(st.diag[th]={});
  if(d.n&&d.on&&d.on<day){const f=Math.pow(0.5,(jnum(day)-jnum(d.on))/3);d.ok*=f;d.n*=f;}
  if(test&&!(run&&d.run===run)){d.ok=(d.ok||0)*0.5;d.n=(d.n||0)*0.5;}
  d.ok=(d.ok||0)+ok;d.n=(d.n||0)+n;if(!d.on||d.on<day)d.on=day;
  if(test){d.run=run||null;d.ton=day;d.tn=(d.tn||0)+n;}}
function themeDe(S,l,c){if(!S||!S.themes)return null;
  if(!S.THX){S.THX={};S.themes.forEach(T=>{(T.les||[]).forEach(x=>{S.THX["l:"+x]=T.id;});(T.fiches||[]).forEach(x=>{S.THX["c:"+x]=T.id;});});}
  return S.THX[l?"l:"+l:"c:"+c]||null;}
const neuve=day=>{CARTES.neuves[day]=(CARTES.neuves[day]||0)+1;};
const mesureCarte=(e,day)=>{if(e.ms>0)CARTES.L.push([Math.min(180000,e.ms),e.re?0:1,day]);};
function applyEv(e){
  const day=ymd(new Date(e.t));
  if(e.k==="set"){if(e.key==="rythme")hub.rythme=e.v;else if(e.key==="vitesse")hub.vitesse=e.v;else if(typeof e.key==="string"&&e.key.indexOf("skip:")===0){const k=e.key.slice(5);if(e.v)hub.skip[k]=e.v;else delete hub.skip[k];}else if(typeof e.key==="string"&&e.key.indexOf("carnet:")===0){CARTES.carnet[e.key.slice(7)]=e.v;}else if(typeof e.key==="string"&&e.key.indexOf("cren:")===0){const k=e.key.slice(5);if(e.v&&e.v.d)hub.cren[k]=e.v;else delete hub.cren[k];}else if(typeof e.key==="string"&&e.key.indexOf("smat:")===0){const k=e.key.slice(5);if(e.v&&e.v.m)hub.smat[k]=e.v;else delete hub.smat[k];}else if(typeof e.key==="string"&&e.key.indexOf("sans:")===0){const k=e.key.slice(5);if(e.v)hub.sans[k]=+e.v;else delete hub.sans[k];}else if(typeof e.key==="string"&&e.key.indexOf("note:")===0){const k=e.key.slice(5);if(typeof e.v==="number"&&e.v>=0&&e.v<=20)hub.notes[k]=e.v;else delete hub.notes[k];}else if(typeof e.key==="string"&&e.key.indexOf("exam:")===0){const p=e.key.split(":");hub.exams[p[1]]=Object.assign({},hub.exams[p[1]],{[p[2]]:e.v});}return;}
  if(e.k==="soir"){hub.soir[e.d+"|"+e.x]=!!e.v;return;}
  if(e.k==="mix"){hub.mixOn=day;hub.mixScore=e.n;hub.mixSur=e.sur||10;return;}
  /* séance en cours (mini-contrôle, quiz, cartes) : début, une réponse, fin */
  if(e.k==="sd"){hub.se[e.c]={run:e.run,q:e.q||[],rep:[],ts:e.t};return;}
  if(e.k==="sr"){const s=hub.se[e.c];if(s&&s.run===e.run&&e.n>=0){s.rep[e.n]=e.a;s.ts=e.t;}return;}
  if(e.k==="sf"){const s=hub.se[e.c];if(s&&s.run===e.run)delete hub.se[e.c];return;}
  const st=ST[e.s];if(!st)return;
  if(e.k==="st"){if(e.v==="known"){st.known[e.c]=true;delete st.review[e.c];st.knownOn[e.c]=day;st.seen[e.c]=true;}else if(e.v==="review"){st.review[e.c]=true;delete st.known[e.c];delete st.knownOn[e.c];st.seen[e.c]=true;}else if(e.v==="seen")st.seen[e.c]=true;}
  else if(e.k==="td"){if(e.v){st.td[e.x]=true;st.tdOn[e.x]=day;}else{delete st.td[e.x];delete st.tdOn[e.x];}}
  else if(e.k==="task"){if(e.v)st.tasks[e.x]=day;else delete st.tasks[e.x];}
  else if(e.k==="quiz"){if(e.n>st.best)st.best=e.n;if(e.goal&&!st.quizOn)st.quizOn=day;}
  else if(e.k==="pos"){st.pos[e.l]=e.reset||typeof e.at!=="number"?null:{i:e.at,sig:e.sig,got:e.got||{},t:e.dur||0,ss:e.ss||{},ts:e.t};}
  else if(e.k==="les"){st.pos[e.l]=null;const L=st.les[e.l]||{n:0,best:0};L.n++;L.best=Math.max(L.best,e.sc||0);L.last=e.sc||0;L.on=day;L.dur=e.dur||0;L.ts=e.t;st.les[e.l]=L;delete st.prio[e.l];Object.keys(st.jv).forEach(k=>{if(st.jv[k]===e.l)delete st.jv[k];});
    if(e.dur&&L.n===1){const B=(LES[e.s]||[]).find(x=>x.id===e.l);if(B&&B.min){const r=Math.min(8,Math.max(1,e.dur/B.min));(SPEED.by[e.s]=SPEED.by[e.s]||[]).push(r);SPEED.all.push(r);}}cardIds(e.s,e.l).forEach(c=>{if(!st.cards[c]){st.cards[c]={box:0,n:0,due:addDays(day,1)};neuve(day);}});}
  else if(e.k==="miss"){/* question ratée dans une leçon : une carte « m:leçon#écran », à revoir le jour même */const id="m:"+e.l+"#"+e.q;if(!st.cards[id])neuve(day);const c=st.cards[id]||{n:0};c.box=0;c.due=day;st.cards[id]=c;delete st.jv[id];const th=themeDe(SUBJ[e.s],e.l);if(th)preuve(st,th,0,1,day);}
  else if(e.k==="qm"){/* question ratée au quiz ou au mini-contrôle mélangé : une carte « q:question », à revoir le jour même */const id="q:"+e.q;if(!st.cards[id])neuve(day);const c=st.cards[id]||{n:0};c.box=0;c.due=day;c.o=e.o;if(e.c)c.f=e.c;st.cards[id]=c;delete st.jv[id];}
  else if(e.k==="pq"){/* QCM d'une page (variation de la constante…) : réponses gardées ; ratée au premier essai = carte « p:page#question » */
    if(e.reset)st.pq[e.p]={};
    else{const P=st.pq[e.p]||(st.pq[e.p]={}),R=P[e.q]||(P[e.q]={bad:[],ok:false});
      if(e.ok)R.ok=true;else if(!R.bad.includes(e.o)){R.bad.push(e.o);
        if(R.bad.length===1&&!R.ok){const id="p:"+e.p+"#"+e.q;if(!st.cards[id])neuve(day);const c=st.cards[id]||{n:0};c.box=0;c.due=day;st.cards[id]=c;delete st.jv[id];}}}}
  else if(e.k==="err"){/* genre d'une erreur à l'entraînement (choix 20b) : l'idée clé de l'exercice devient une carte « e:clé », revue le lendemain */
    st.err[e.cle]=e.ty;const id="e:"+e.cle;if(e.gr==null||st.cards[id])return;neuve(day);st.cards[id]={box:0,n:0,due:addDays(day,1),g:e.g,lv:e.lv,gr:e.gr};}
  else if(e.k==="jv"){/* « Jamais vu » dans Réviser : la carte attend la leçon qui l'explique, placée en tête du planning */st.jv[e.c]=e.l||true;if(e.l)st.prio[e.l]=e.t;}
  else if(e.k==="niv"){st.niv=e.v||0;}
  else if(e.k==="diag"){const d=st.diag[e.th]||(st.diag[e.th]={});if(e.self!=null)d.self=e.self;if(e.n)preuve(st,e.th,e.ok,e.n,day,e.run,true);}
  else if(e.k==="cr"||e.k==="qr"){/* carte d'une fiche notée dans « Réviser », réponse à une question du quiz */const th=themeDe(SUBJ[e.s],null,e.c);if(th&&!e.re)preuve(st,th,e.k==="cr"?e.r/2:e.ok?1:0,1,day);if(e.k==="cr")mesureCarte(e,day);}
  else if(e.k==="card"){mesureCarte(e,day);const c=st.cards[e.c]||{box:0,n:0};c.n++;c.last=day;if(e.r===2)c.box=Math.min(4,c.box+1);else if(e.r===0)c.box=0;c.due=e.r===0?day:addDays(day,[1,1,2,4,7][c.box]);st.cards[e.c]=c;
    if(!e.re){const th=themeDe(SUBJ[e.s],e.c.replace(/^m:/,"").split("#")[0]);if(th)preuve(st,th,e.r/2,1,day);}}
}
function rebuild(){SIDS.forEach(id=>{ST[id]=blank(id);});hub.exams={};hub.notes={};hub.skip={};hub.cren={};hub.sans={};hub.rythme="normal";hub.vitesse="auto";SPEED.by={};SPEED.all=[];CARTES.L=[];CARTES.neuves={};CARTES.carnet={};hub.mixOn=null;hub.mixScore=0;hub.mixSur=10;hub.se={};hub.soir={};J.sort((a,b)=>(a.t-b.t)||(a.i<b.i?-1:a.i>b.i?1:0));J.forEach(e=>{try{applyEv(e);}catch(x){}});}
/* reprise de l'ancienne sauvegarde (une clé par matière) la première fois */
(function migrate(){if(J.length)return;let n=0;
  const T=d=>{if(typeof d!=="string"||!/^\d{4}-\d\d-\d\d$/.test(d))d=ymd(new Date());const[y,m,dd]=d.split("-").map(Number);return new Date(y,m-1,dd,0,0,1).getTime()+n;};
  const add=e=>{e.i=DEV+"-m"+(n++).toString(36);J.push(e);};
  SIDS.forEach(id=>{let o=null;try{o=JSON.parse(localStorage.getItem(SUBJ[id].key)||"null");}catch(e){}if(!o||typeof o!=="object")return;
    Object.keys(o.seen||{}).forEach(c=>add({k:"st",s:id,c,v:"seen",t:T()}));
    Object.keys(o.known||{}).forEach(c=>add({k:"st",s:id,c,v:"known",t:T(o.knownOn&&o.knownOn[c])}));
    Object.keys(o.review||{}).forEach(c=>add({k:"st",s:id,c,v:"review",t:T()}));
    Object.keys(o.td||{}).forEach(x=>add({k:"td",s:id,x,v:true,t:T(o.tdOn&&o.tdOn[x])}));
    Object.entries(o.tasks||{}).forEach(([x,d])=>add({k:"task",s:id,x,v:true,t:T(d)}));
    if(o.best)add({k:"quiz",s:id,n:o.best,goal:!!o.quizOn,t:T(o.quizOn)});
    if(o.open&&typeof o.open==="object"&&!Object.keys(local.open[id]||{}).length)local.open[id]=o.open;});
  try{const h=JSON.parse(localStorage.getItem(HUBKEY)||"null");if(h){if(h.rythme&&h.rythme!=="normal")add({k:"set",key:"rythme",v:h.rythme,t:T()});Object.entries(h.exams||{}).forEach(([id,o])=>Object.entries(o||{}).forEach(([f,v])=>add({k:"set",key:"exam:"+id+":"+f,v,t:T()})));if(h.mixOn)add({k:"mix",n:h.mixScore||0,t:T(h.mixOn)});}}catch(e){}
  if(J.length)persistJ();})();
rebuild();
let seq=0;const TOFF=NOW().getTime()-Date.now();/* 0 en vrai ; décalage seulement quand on simule une date (?date=) */
function emit(e){e.t=Date.now()+TOFF;e.i=DEV+"-"+e.t.toString(36)+"-"+(seq++).toString(36);J.push(e);applyEv(e);persistJ();if(APP.onChange)try{APP.onChange(e);}catch(err){}}
/* ---------- le carnet des réponses : chaque réponse donnée, avec son détail, gardée sur cet appareil.
   IndexedDB (pas de limite de taille gênante) ; sinon les 1500 dernières dans localStorage. Le journal, lui, ne reçoit
   que ce qui sert à calculer l'état (une ligne courte par réponse de quiz ou de carte). ---------- */
const brut=s=>String(s==null?"":s).replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();
const hq=q=>{let h=2166136261;const t=String(q.q||q.f||"")+"|"+String(q.code||(q.lines||[]).join("\n"));for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
const repQ=(q,ch)=>{const o={q:hq(q),texte:brut(q.q||q.f||"").slice(0,400)};if(q.code)o.code=String(q.code).slice(0,600);if(q.o){o.bonne=brut(q.o[q.a]);if(ch>=0)o.choix=brut(q.o[ch]);else if(ch===-1)o.choix="(je ne sais pas)";}return o;};
let REPDB=null,rseq=0;const REPQ=[];
function repPut(r){if(REPDB){try{REPDB.transaction("rep","readwrite").objectStore("rep").add(r);return;}catch(e){}}
  if(REPDB===null){REPQ.push(r);return;}
  try{const L=JSON.parse(localStorage.getItem("rev-s1-reponses")||"[]");L.push(r);localStorage.setItem("rev-s1-reponses",JSON.stringify(L.slice(-1500)));}catch(e){}}
try{const rq=indexedDB.open("rev-s1-reponses",2);
  rq.onupgradeneeded=()=>{const db=rq.result,st=db.objectStoreNames.contains("rep")?rq.transaction.objectStore("rep"):db.createObjectStore("rep",{autoIncrement:true});
    if(!st.indexNames.contains("id"))st.createIndex("id","id",{unique:true});};
  rq.onsuccess=()=>{REPDB=rq.result;REPQ.splice(0).forEach(repPut);};rq.onerror=()=>{REPDB=false;REPQ.splice(0).forEach(repPut);};}catch(e){REPDB=false;}
function logRep(r){r.t=Date.now()+TOFF;r.id=DEV+"-"+r.t.toString(36)+"-r"+(rseq++).toString(36);r.jour=ymd(new Date(r.t));r.heure=new Date(r.t).toTimeString().slice(0,8);r.appareil=DEV;repPut(r);}
/* le carnet s'ouvre en arrière-plan : on l'attend (6 s au plus) avant de le lire */
function allReps(n){if(REPDB===null&&(n||0)<40)return new Promise(r=>setTimeout(r,150)).then(()=>allReps((n||0)+1));return new Promise(res=>{let loc=[];try{loc=JSON.parse(localStorage.getItem("rev-s1-reponses")||"[]");}catch(e){}
  if(!REPDB)return res(loc);try{const rq=REPDB.transaction("rep").objectStore("rep").getAll();rq.onsuccess=()=>res(loc.concat(rq.result||[]));rq.onerror=()=>res(loc);}catch(e){res(loc);}});}
/* pour la synchronisation : les réponses de cet appareil (chacune reçoit un identifiant), et l'ajout de celles des autres appareils sans doublon */
function repsPropres(){return new Promise(res=>{const out=[];if(!REPDB)return res(out);
  try{const tx=REPDB.transaction("rep","readwrite"),rq=tx.objectStore("rep").openCursor();
    rq.onsuccess=()=>{const c=rq.result;if(!c)return;const r=c.value;if(r.appareil===DEV){if(!r.id){r.id=DEV+"-"+(r.t||0).toString(36)+"-a"+(rseq++).toString(36);c.update(r);}out.push(r);}c.continue();};
    tx.oncomplete=()=>res(out);tx.onerror=()=>res(out);tx.onabort=()=>res(out);}catch(e){res(out);}});}
function importReps(L){return new Promise(res=>{let n=0;if(!REPDB||!L||!L.length)return res(n);
  try{const tx=REPDB.transaction("rep","readwrite"),st=tx.objectStore("rep");
    L.forEach(r=>{if(!r||!r.id||r.appareil===DEV)return;const q=st.add(r);q.onsuccess=()=>{n++;};q.onerror=e=>{e.preventDefault();e.stopPropagation();};});
    tx.oncomplete=()=>res(n);tx.onerror=()=>res(n);tx.onabort=()=>res(n);}catch(e){res(n);}});}
function mergeEvents(list){const have=new Set(J.map(e=>e.i));let n=0;(list||[]).forEach(e=>{if(e&&e.i&&e.t&&e.k&&!have.has(e.i)){J.push(e);have.add(e.i);n++;}});if(n){rebuild();persistJ();}return n;}
const save=()=>{};
const status=(sid,cid)=>{const st=ST[sid];return st.known[cid]?"known":st.review[cid]?"review":st.seen[cid]?"seen":"";};
function setStatus(sid,cid,s){emit({k:"st",s:sid,c:cid,v:s});}

/* ---------- examens ---------- */
/* Une matière peut avoir plusieurs épreuves (CC1, CC2, examen de janvier) : la courante est la première qui n'est pas finie.
   Chaque leçon, étape ou fiche dit pour quelle épreuve elle compte (champ ex, la première par défaut) ;
   une épreuve couvre ses propres leçons, ou celles listées dans covers. */
const examsOf=S=>S.exams||[Object.assign({id:"cc1"},S.exam)];
const examKey=(S,i)=>i===0?S.id:S.id+"."+examsOf(S)[i].id;
/* une épreuve reportée sans nouvelle date (report:1 dans la matière) n'est pas passée : en attendant, elle est posée REPORT jours plus loin,
   avant l'épreuve suivante de la matière. Ses révisions restent dans le planning, aucune note n'est demandée, l'agenda ne la montre nulle part ;
   la date tapée dans « Mes épreuves » la remplace. */
const REPORT=14;
function examAt(S,i){const L=examsOf(S),b=L[i],h=hub.exams[examKey(S,i)]||{},e=Object.assign({label:"CC"},b,h,{idx:i});
  if(!e.report||(h.day&&h.day!==b.day))return Object.assign(e,{report:0});
  let d=ymd(new Date(NOW().getTime()+REPORT*864e5));const nx=L[i+1]&&((hub.exams[examKey(S,i+1)]||{}).day||L[i+1].day);if(nx&&d>=nx)d=addDays(nx,-1);
  return Object.assign(e,{day:d,jour0:b.day});}
const quandEp=(e,court)=>e.report?"reporté, date à venir":`${dayName(e.day,false,court)} à ${e.start.replace(":","h")}`;
/* une épreuve qu'il a enlevée (réglage exam:<clé>:off) ne compte plus : la suivante de la matière devient l'épreuve courante */
function exam(S){const L=examsOf(S),n=NOW();let d=null;for(let i=0;i<L.length;i++){const e=examAt(S,i);if(e.off)continue;d=e;if(toD(e.day,mm(e.end||e.start))>n)return e;}return d||examAt(S,L.length-1);}
const exW=S=>{const l=(exam(S)||{}).label||"CC";return /^CC/.test(l)?"CC":l;};
const exId=(S,x)=>x.ex||examsOf(S)[0].id;
const inScope=(S,x)=>{const e=exam(S);return (e.covers||[e.id]).includes(exId(S,x));};
const lesOf=id=>(LES[id]||[]).filter(L=>inScope(SUBJ[id],L));
const annOf=S=>S.ann.filter(x=>!x.ex||inScope(S,x));
/* thèmes de l'épreuve courante ; maîtrise entre 0 et 1 (null : on ne sait pas) ; points encore à gagner */
const SELF=[0.15,0.5,0.85];
const themeEx=(S,T)=>T.ex||examsOf(S)[0].id;
const themesOf=S=>{const e=exam(S);return (S.themes||[]).filter(T=>themeEx(S,T)===e.id);};
function maitrise(sid,T){const st=ST[sid],d=st.diag[T.id]||{},s=d.self!=null?d.self:T.self0,v=s!=null?SELF[s]:null,r=d.n?d.ok/d.n:null;
  const wt=d.n?d.n/(d.n+1.5):0;
  let m=d.n?(1-wt)*(v!=null?v:0.5)+wt*r:v;
  /* les leçons du thème faites depuis le mini-contrôle comptent aussi : part faite × réussite */
  const L=(T.les||[]).map(l=>st.les[l]).filter(x=>x&&x.n),tot=(T.les||[]).length;
  if(L.length&&tot){const f=L.length/tot,sc=L.reduce((x,y)=>x+y.best,0)/L.length,ml=f*(0.25+0.6*sc)+(1-f)*(m==null?0.3:Math.min(m,0.5)),der=L.map(x=>x.on||"").sort().pop();
    if(m==null||!d.on||der>d.on)m=Math.max(m==null?0:m,ml);}
  return m;}
const gainTheme=(sid,T)=>{const m=maitrise(sid,T);return T.pts*(1-(m==null?0.5:m));};
const prioDe=(sid,T)=>{const m=maitrise(sid,T);return m==null?null:m>=0.75||T.pts*(1-m)<0.5?2:1;};
/* un thème d'une épreuve déjà passée, encore couvert par l'épreuve courante, garde son effet : il y pèse environ trois fois moins */
function prioTheme(S,T,p0){const e=exam(S),te=themeEx(S,T);if(te!==e.id&&!(e.covers||[]).includes(te))return p0;const m=maitrise(S.id,T);if(m==null)return p0;
  return m>=0.75||T.pts*(te===e.id?1:0.3)*(1-m)<0.5?Math.max(2,p0):1;}
const diagFait=sid=>themesOf(SUBJ[sid]).some(T=>maitrise(sid,T)!=null);
/* part des points encore à gagner dans une matière : 1 quand on ne sait rien, moins quand presque tout est maîtrisé */
const marge=sid=>{const L=themesOf(SUBJ[sid]),tot=L.reduce((s,T)=>s+T.pts,0);if(!tot)return 1;return Math.min(1.6,Math.max(0.35,L.reduce((s,T)=>s+gainTheme(sid,T),0)/tot/0.5));};
/* Faut-il faire ou refaire « Où j'en suis » ? Nécessaire : CC dans 4 jours au plus, aucun mini-contrôle, et on ne sait rien
   sur la moitié des points. Conseillé : CC dans 10 jours et jamais de mini-contrôle, ou des leçons faites depuis le dernier. */
function diagAFaire(){const n=NOW(),out=[];
  SIDS.forEach(sid=>{const S=SUBJ[sid],TH=themesOf(S);if(!TH.length||examStart(S)<=n)return;
    const st=ST[sid],j=(examStart(S)-n)/864e5,tot=TH.reduce((s,T)=>s+T.pts,0),teste=TH.filter(T=>(st.diag[T.id]||{}).tn),
      inconnu=TH.filter(T=>(st.diag[T.id]||{}).self==null&&T.self0==null&&!(st.diag[T.id]||{}).n).reduce((s,T)=>s+T.pts,0),
      nq=TH.reduce((s,T)=>s+Math.min(diagPool(sid,T).length,nbQ(T)),0),min=Math.max(3,Math.round(nq*0.6));
    if(!TH.some(T=>prioDe(sid,T)!==2)&&teste.length)return;/* tout est maîtrisé et vérifié */
    if(!teste.length||inconnu>=tot/2){if(j<=4&&inconnu>=tot/2)out.push({sid,need:true,j,min,why:"pas encore fait"});
      else if(j<=10)out.push({sid,need:false,j,min,why:inconnu?"pas encore fait":"vérifie avec le mini-contrôle"});return;}
    const der=teste.map(T=>st.diag[T.id].ton||"").sort().pop(),depuis=TH.reduce((s,T)=>s+(T.les||[]).filter(l=>st.les[l]&&st.les[l].n&&(st.les[l].on||"")>der).length,0);
    if(j<=10&&depuis>=2)out.push({sid,need:false,j,min,why:`à refaire : ${depuis} leçons faites depuis`});});
  return out.sort((x,y)=>(y.need-x.need)||(x.j-y.j)||(weight(SUBJ[y.sid])-weight(SUBJ[x.sid])));}
/* le mini-contrôle mélangé : à refaire chaque jour à moins de 3 jours d'un CC, tous les 2 jours à moins de 10 jours, tous les 4 jours à moins de 3 semaines */
function miniDu(){const n=NOW(),t0=today(),fait=hub.mixOn===t0,noms=[];let need=false,proch=null;
  SIDS.slice().sort((x,y)=>examStart(SUBJ[x])-examStart(SUBJ[y])).forEach(sid=>{const S=SUBJ[sid],TH=themesOf(S);if(!TH.length||examStart(S)<=n)return;const j=(examStart(S)-n)/864e5;if(j>21)return;
    const st=ST[sid],der=TH.map(T=>(st.diag[T.id]||{}).ton||"").sort().pop(),pas=j<=3?1:j<=10?2:4,age=der?Math.round((toD(t0,0)-toD(der,0))/864e5):99;
    if(age>=pas){noms.push(S.name);if(j<=10)need=true;}else{const d=addDays(der,pas);if(!proch||d<proch)proch=d;}});
  return {du:!fait&&noms.length>0,need:!fait&&need,noms,proch:noms.length?(fait?addDays(t0,1):t0):proch};}
/* points à gagner par minute d'une étape : sert à choisir quoi garder quand tout ne tient pas */
function valeur(sid,t){const S=SUBJ[sid];if(!diagFait(sid))return 0;if(t.first)return 9;const T=S.TH[t.id];if(!T||themeEx(S,T)!==exam(S).id)return (t.base<=20?1.5:Math.min(2,0.3*themesOf(S).reduce((s,X)=>s+gainTheme(sid,X),0)))/Math.max(t.min,10);/* feuille autorisée : 1,5 point ; examen blanc ou TD : 30 % de ce qu'il reste à gagner dans la matière, 2 points au plus (les leçons des thèmes faibles passent avant) */
  const mins=(T.les||[]).map(l=>"L-"+l).concat(T.tasks||[]).reduce((s,x)=>s+((S.TB[x]||{}).min||0),0);return gainTheme(sid,T)/Math.max(mins,10);}
const examStart=S=>{const e=exam(S);return toD(e.day,mm(e.start));};
function jx(S){const e=exam(S),n=NOW();if(e.report)return "reporté";const k=Math.round((toD(e.day,0)-toD(ymd(n),0))/864e5);return k>1?`J-${k}`:k===1?"demain":k===0?(n<examStart(S)?"aujourd'hui":"passé"):"passé";}
const poids0=S=>{const e=exam(S);return S.coef*(e.share!=null?e.share:S.share);};
const WMAX=Math.max(...SIDS.map(id=>poids0(SUBJ[id])));

/* ---------- ses notes ---------- */
/* Modalités de contrôle 2026-2027 : toutes les épreuves d'une matière, même celles que le planning n'a pas
   (date pas encore publiée, exercices en ligne) : [identifiant, nom, part, texte si elle n'aura jamais de date ici, 1 si elle est déjà passée].
   sc = seconde chance du contrôle continu intégral : "premex" sans la première épreuve, "mincex" sans la moins coefficientée.
   Les notes ne sont que dans le journal (réglage note:<matière>.<épreuve>), jamais dans les fichiers du site. */
const MCC={geo:{b:"m",sc:"premex",ep:[["cc1","CC1",0.3],["cc2","CC2",0.3],["fin","Épreuve finale",0.4]]},
  calc:{b:"m",sc:"premex",ep:[["cc1","CC1",0.25],["cc2","CC2",0.25],["fin","CC final",0.5]]},
  lin:{b:"m",ep:[["cc1","CC1",0.2],["cc2","CC2",0.2],["ct","Examen",0.6]]},
  ana:{b:"m",ep:[["cc1","CC1",0.25],["cc2","CC2",0.25],["ct","Examen",0.5]]},
  rai:{b:"m",ep:[["cc2","CC2",0.55],["ligne","Exercices en ligne",0.45,"clos le 2 octobre",1]]},
  algo:{b:"i",sc:"mincex",ep:[["cc1","CC1",0.32],["cc2","CC2",0.34],["cc3","CC3",0.34]]},
  pf:{b:"i",ep:[["cc1","CC",0.3],["tp","TP noté",0.03,"en séance de TP"],["ct","Examen",0.67]]},
  usi:{b:"i",ep:[["exam","Examen",1]]},aut:{b:"i",ep:[["exam","Examen",1]]}};
const fr=x=>String(Math.round(x*100)/100).replace(".",",");
const et=L=>L.length>1?L.slice(0,-1).join(", ")+" et "+L[L.length-1]:L[0]||"";
const nomEp=(x,a,b,c)=>/^Exercices/.test(x.label)?c+" "+x.label.toLowerCase():/^[ÉE]/.test(x.label)?b+x.label.toLowerCase():a+" "+x.label;
const auEp=x=>nomEp(x,"au","à l'","aux"),duEp=x=>nomEp(x,"du","de l'","des");
/* une épreuve des modalités est celle du planning qui a le même identifiant, sinon la suivante pas encore prise */
function epreuves(sid){const S=SUBJ[sid],M=MCC[sid];if(!M)return [];const L=examsOf(S),pris=new Set(),n0=NOW();
  const E=M.ep.map(([id,label,w,hors,clos])=>({id,label,w,hors:hors||"",clos:!!clos,i:hors?-1:L.findIndex(e=>e.id===id)}));
  E.forEach(x=>{if(x.i>=0)pris.add(x.i);});
  E.forEach(x=>{if(x.i<0&&!x.hors){x.i=L.findIndex((e,j)=>!pris.has(j));if(x.i>=0)pris.add(x.i);}});
  E.forEach(x=>{const e=x.i>=0?examAt(S,x.i):null,v=hub.notes[sid+"."+x.id];x.e=e;if(e)x.label=e.label;x.past=e?toD(e.day,mm(e.end||e.start))<=n0:x.clos;x.n=typeof v==="number"?v:null;});
  return E;}
/* Où il en est dans une matière. moy = moyenne des notes entrées ; need = moyenne qu'il faut aux épreuves sans note pour avoir 10 ;
   fin = note de la matière quand tout est noté. La seconde chance est comptée comme une moyenne pondérée par les parts,
   et la meilleure des deux notes est gardée (les modalités ne le disent pas en toutes lettres). */
function bilan(sid){const E=epreuves(sid),M=MCC[sid];if(!E.length)return null;
  const calc=L=>{const W=L.reduce((s,x)=>s+x.w,0),G=L.filter(x=>x.n!=null),wg=G.reduce((s,x)=>s+x.w,0)/W,pts=G.reduce((s,x)=>s+x.w*x.n,0)/W;
    return {W,moy:wg?pts/wg:null,need:wg<0.999?(10-pts)/(1-wg):null,fin:wg>=0.999?pts:null,reste:L.filter(x=>x.n==null)};};
  const A=calc(E),drop=M.sc?(M.sc==="premex"?E[0]:E.slice().sort((x,y)=>x.w-y.w)[0]):null,B=drop?calc(E.filter(x=>x!==drop)):null;
  /* l'épreuve s'efface quand la formule sans elle demande moins (ou donne plus, une fois tout noté) */
  const efface=!!(B&&drop.n!=null&&(A.fin!=null?B.fin>A.fin:B.need!=null&&B.need<A.need)),V=efface?B:A;
  return {E,A,B,drop,efface,manque:E.filter(x=>x.past&&x.n==null),nb:E.filter(x=>x.n!=null).length,moy:V.moy!=null?V.moy:A.moy,need:V.need,fin:A.fin!=null?Math.max(A.fin,B&&B.fin!=null?B.fin:0):null,reste:V.reste,part:x=>x.w/V.W};}
/* note estimée pour l'épreuve courante d'après les entraînements : la maîtrise des thèmes, pondérée par leurs points,
   dès qu'on sait quelque chose sur la moitié des points. der = jour de la dernière réponse ou leçon comptée. */
function estime(sid){const S=SUBJ[sid],st=ST[sid],TH=themesOf(S),tot=TH.reduce((s,T)=>s+T.pts,0);let su=0,pts=0,der="";
  TH.forEach(T=>{const m=maitrise(sid,T);if(m==null)return;su+=T.pts;pts+=T.pts*m;
    [(st.diag[T.id]||{}).on].concat((T.les||[]).map(l=>(st.les[l]||{}).on)).forEach(d=>{if(d&&d>der)der=d;});});
  return tot&&su>=tot/2?{note:20*pts/su,der}:null;}
/* le poids d'une matière dans le planning. Avec ses notes : une épreuve effacée par la seconde chance donne sa part aux autres,
   et une matière où il faut plus de 10 aux épreuves qui restent pèse plus (1,5 fois au plus), moins s'il faut moins (0,7 au moins). */
function weight(S){let p=poids0(S);const M=MCC[S.id];if(!M||!M.ep.some(x=>hub.notes[S.id+"."+x[0]]!=null))return p;
  const B=bilan(S.id),e=exam(S),x=B.E.find(y=>y.i===e.idx);if(B.manque.length)return p;
  if(B.efface&&x&&x!==B.drop)p=S.coef*B.part(x);
  return p*(B.need==null?1:Math.min(1.5,Math.max(0.7,B.need/10)));}
const sur20=v=>`${fr(v)} sur 20`,pct=v=>`${Math.round(v*100)}\u00a0%`;
const besoin=v=>fr(Math.ceil(v*100-1e-6)/100);
/* les phrases de la carte « Mes notes » d'une matière */
function phrasesNotes(sid){const S=SUBJ[sid],B=bilan(sid),out=[];if(!B)return out;const d=B.drop,aux=et(B.reste.map(auEp));
  if(B.manque.length)out.push(`Dès que tu as ta note ${et(B.manque.map(duEp))}, tape-la : le calcul en a besoin.`);
  if(!B.nb){if(!B.manque.length)out.push("Aucune note entrée pour l'instant.");}
  else if(B.fin!=null)out.push(`Note de la matière : <b>${sur20(B.fin)}</b>.`);
  else if(B.efface)out.push(`Seconde chance : ton ${d.label} (${fr(d.n)}) s'efface si tu fais mieux aux épreuves qui restent. La note devient la moyenne ${et(B.E.filter(x=>x!==d).map(x=>`${duEp(x)} (${pct(B.part(x))})`))}.${B.B.moy!=null?` Sans le ${d.label}, ta note du moment : <b>${sur20(B.B.moy)}</b>.`:""}`);
  else out.push(`Ta note du moment : <b>${sur20(B.moy)}</b>, sur ${pct(B.E.filter(x=>x.n!=null).reduce((s,x)=>s+x.w,0))} de la note.${d&&d.n!=null?` Ton ${d.label} reste dans le calcul : il te sert.`:""}`);
  if(B.need!=null&&!B.manque.length){
    if(B.need<=0)out.push("Tu as déjà 10 dans la matière, quelles que soient les épreuves qui restent.");
    else if(B.need>20)out.push(`Avoir 10 dans la matière n'est plus possible avec les épreuves qui restent (il faudrait ${besoin(B.need)}). Chaque point compte quand même : les matières se compensent dans le bloc.`);
    else out.push(`Pour avoir 10 dans la matière : <b>il te faut ${besoin(B.need)} de moyenne</b> ${aux}.${B.efface&&B.A.need>B.need?` Sans la seconde chance, il faudrait ${besoin(B.A.need)}.`:""}`);}
  if(examStart(S)>NOW()){const v=estime(sid),e=exam(S),x=B.E.find(y=>y.i===e.idx)||{label:e.label};
    out.push(v?`Niveau estimé ${auEp(x)} d'après tes entraînements : <b>${Math.round(v.note)} sur 20</b>${!B.manque.length&&B.need>0&&B.need<=20?`, il te faut ${besoin(B.need)}`:""}${v.der?` (dernière mesure le ${dayName(v.der,false)})`:" (d'après ce qui est coché, pas encore de mesure)"}.`:`Niveau pas encore mesuré : fais <a href="#/${sid}/niveau">Où j'en suis</a>.`);}
  return out;}
const ligneEp=(B,x)=>`<b>${x.label}</b> (${pct(x.w)}) : ${x.n!=null?sur20(x.n)+(B.efface&&x===B.drop?", s'efface":""):x.past?"pas de note entrée":x.e?(x.e.report?"reporté, date à venir":`le ${dayName(x.e.day,false)}`):x.hors||"date pas encore publiée"}`;
function notesHTML(sid){const B=bilan(sid);if(!B)return "";
  return `<div>${B.E.map(x=>ligneEp(B,x)).join("<br>")}</div>${phrasesNotes(sid).map(p=>`<div>${p}</div>`).join("")}<a class="btn" href="#/examens">Taper ou corriger une note</a>`;}
const carteNotes=sid=>{const h=notesHTML(sid);return h?`<section class="check" id="mesnotes"><h2 style="font-size:1.1rem">Mes notes</h2>${h}</section>`:"";};
/* le tableau d'ensemble de la page Examens et coefficients, et la moyenne du moment de chaque bloc */
/* « tape ta note du CC1 » : un lien qui descend jusqu'à la case « Ma note » de cette épreuve et y met le curseur (le 20/11, il croyait que le texte était la case) */
const lienNote=(id,x,t)=>`<a class="linkbtn" href="#/examens" data-vers="${id}.${x.id}">${t}</a>`;
function bilanHTML(){const ids=SIDS.filter(id=>MCC[id]),n0=NOW();
  const rows=ids.map(id=>{const S=SUBJ[id],B=bilan(id),G=B.E.filter(x=>x.n!=null),v=examStart(S)>n0?estime(id):null,e=exam(S);
    return `<tr><td><i class="sdot" style="background:${S.color}"></i> ${S.name}</td><td>${B.manque.length?(B.manque.length===1?lienNote(id,B.manque[0],"tape ta note "+duEp(B.manque[0])):`tape ta note ${et(B.manque.map(x=>lienNote(id,x,duEp(x))))}`):B.need==null?"":B.need<=0?"déjà 10":B.need>20?`<span class="r">${besoin(B.need)}</span>`:`<b>${besoin(B.need)}</b> ${et(B.reste.map(auEp))}`}</td><td>${examStart(S)<=n0?"":v?`${Math.round(v.note)} sur 20 pour ${nomEp({label:e.label||"CC"},"le","l'","les")}${v.der?`, mesuré le ${dayName(v.der,false,true)}`:""}`:`<span class="muted">pas encore mesuré</span>`}</td><td>${G.length?G.map(x=>`${x.label} : ${fr(x.n)}${B.efface&&x===B.drop?", s'efface":""}`).join("<br>"):`<span class="muted">aucune</span>`}</td><td>${B.fin!=null?`<b>${fr(B.fin)}</b>`:B.nb?fr(B.moy):`<span class="muted">pas encore</span>`}</td></tr>`;}).join("");
  const bloc=(b,nom)=>{const L=ids.filter(id=>MCC[id].b===b),G=L.map(id=>({c:SUBJ[id].coef,m:bilan(id)})).filter(x=>x.m.nb),c=G.reduce((s,x)=>s+x.c,0);
    return `<b>${nom}</b>, premier semestre : ${c?`${sur20(G.reduce((s,x)=>s+x.c*(x.m.fin!=null?x.m.fin:x.m.moy),0)/c)} pour l'instant, avec ${G.length} matière${G.length>1?"s":""} notée${G.length>1?"s":""} sur ${L.length}`:"pas encore de note"}.`;};
  return `<h2 style="font-size:1.1rem">Tes notes : où tu en es</h2><p class="muted">Clique sur « tape ta note » : le curseur va dans la case « Ma note » de l'épreuve, dans le grand tableau du dessous. Elles restent dans ton journal (cet appareil et ta synchronisation privée), jamais dans le site public.</p>
   <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Matière</th><th>Il te faut, pour avoir 10</th><th>Niveau estimé</th><th>Tes notes</th><th>Note du moment</th></tr></thead><tbody>${rows}</tbody></table></div>
   <div>${bloc("m","Bloc maths")}<br>${bloc("i","Bloc informatique")}</div>
   <p class="muted" style="font-size:.9rem">Il te faut 10 dans chaque bloc sur l'année, second semestre compris. La seconde chance est comptée comme une moyenne pondérée par les parts, la meilleure des deux notes gardée : à confirmer auprès des enseignants. Le niveau estimé vient de tes mini-contrôles, quiz, cartes et leçons. Le planning en tient compte : une épreuve effacée donne sa part aux suivantes, et une matière où il te faut plus de 10 passe devant.</p>`;}

/* ---------- thème : un seul, le noir du nouvel onglet ---------- */
document.documentElement.dataset.theme="sombre";

/* ---------- les étapes ---------- */
const activeQuiz=S=>S.quiz.filter(q=>!(q.link&&S.BY[q.link]&&S.BY[q.link].out));
const quizGoal=(S,t)=>{const n=activeQuiz(S).length;return t.quiz<=1?Math.ceil(t.quiz*n):Math.min(t.quiz,n);};
function isDone(sid,t){const st=ST[sid];if(t.lesson){if(st.prio[t.lesson])return false;const L=st.les[t.lesson];return !!L&&(L.best>=0.5||L.n>=2);}/* une leçon ratée (moins de 50 %) reste à refaire une fois */if(t.items)return t.items.every(id=>st.known[id]);if(t.td)return t.td.every(x=>st.td[x]);if(t.quiz)return st.best>=quizGoal(SUBJ[sid],t)||!!st.tasks[t.id];return !!st.tasks[t.id];}
function doneOn(sid,t){const st=ST[sid];if(t.lesson)return (st.les[t.lesson]||{}).on||"";if(t.items)return t.items.map(id=>st.knownOn[id]||"").sort().pop();if(t.td)return t.td.map(x=>st.tdOn[x]||"").sort().pop();if(t.quiz)return st.quizOn||st.tasks[t.id]||"";return st.tasks[t.id]||"";}

/* ---------- emploi du temps : Prose (groupe Maths A + double licence), lu le 7/11/2026, jusqu'au 18/12 ----------
   [début, fin, matière, détail, matière du site]. Les CC y sont aussi : tant que la matière n'est pas dans le site, ils comptent comme des heures prises. */
const CLASSES={
 "2026-11-09":[["08:00","09:30","Géométrie","CM, amphi 5.03","geo"],["09:45","11:15","Algèbre","TD 2.02","lin"],["11:30","13:00","Géométrie","TD 5.207","geo"],["15:00","16:30","Algorithmique 1","CM, amphi 5.01","algo"],["16:45","18:15","Prog. fonctionnelle","TD 5.201","pf"]],
 "2026-11-10":[["08:00","09:30","Analyse","TD 5.207","ana"],["11:30","13:00","Calculus","TD 5.205","calc"],["15:00","16:30","Automates","CM, amphi 5.01","aut"],["16:45","18:15","Calculus","TD 36.302","calc"]],
 "2026-11-11":[],
 "2026-11-12":[["08:00","09:30","Géométrie","TD 5.211","geo"],["09:45","11:15","Calculus","TD 5.207","calc"],["11:30","13:00","Algèbre","CM, amphi 5.01","lin"],["15:00","16:30","Algorithmique 1","TD 5.212","algo"],["16:45","18:15","Algorithmique 1","TD 5.212","algo"]],
 "2026-11-13":[["08:00","09:30","Automates","TD 2.09","aut"],["09:45","11:15","Prog. fonctionnelle","CM, amphis 5.03 et 5.01","pf"],["11:30","13:00","Prog. fonctionnelle","TD info 5.130","pf"],["15:00","16:30","Calculus","CC1, amphi 5.01","calc"]],
 "2026-11-16":[["08:00","09:30","Géométrie","CM, amphi 5.03","geo"],["09:45","11:15","Algèbre","TD 2.02","lin"],["11:30","13:00","Algèbre","TD 2.02","lin"],["16:45","18:15","Prog. fonctionnelle","TD 5.201","pf"]],
 "2026-11-17":[["08:00","09:30","Analyse","TD 5.207","ana"],["09:45","11:15","Algèbre","CM, amphi 5.02","lin"]],
 "2026-11-18":[["08:00","09:30","USI","CM, amphi 5.06","usi"],["09:45","11:15","USI","TD info 36.206","usi"],["11:30","13:00","USI","TD info 36.206","usi"],["15:00","16:30","Analyse","CM, amphi 5.04","ana"],["16:45","18:15","Analyse","TD 5.202","ana"]],
 "2026-11-19":[["08:00","09:30","Géométrie","TD 5.211","geo"],["11:30","13:00","Algèbre","CM, amphi 5.01","lin"],["15:00","16:30","Algorithmique 1","TD 5.212","algo"],["16:45","18:15","Algorithmique 1","TD 5.212","algo"]],
 "2026-11-20":[["08:00","09:30","Automates","TD 2.09","aut"],["09:45","11:15","Prog. fonctionnelle","CM, amphi 5.01","pf"],["11:30","13:00","Prog. fonctionnelle","TD info 5.127","pf"],["15:00","16:30","Algèbre","CC1 reporté : n'a pas eu lieu","lin"]],
 "2026-11-23":[["08:00","09:30","Géométrie","CM, amphi 5.03","geo"],["09:45","11:15","Algèbre","TD 2.02","lin"],["15:00","16:30","Analyse","CC1, amphi 5.02","ana"],["16:45","18:15","Prog. fonctionnelle","TD 5.201","pf"]],
 "2026-11-24":[["08:00","09:30","Analyse","TD 5.207","ana"],["09:45","11:15","Analyse","CM, amphi 5.03","ana"]],
 "2026-11-25":[["09:45","11:15","USI","TD info 36.206","usi"],["11:30","13:00","USI","TD info 36.206","usi"],["15:00","16:30","Analyse","CM, amphi 5.04","ana"]],
 "2026-11-26":[["08:00","09:30","Géométrie","TD 5.211","geo"],["11:30","13:00","Algèbre","CM, amphi 5.03","lin"],["15:00","16:30","Algorithmique 1","TD 36.315 (bâtiment 36)","algo"],["16:45","18:15","Algorithmique 1","TD 36.315 (bâtiment 36)","algo"]],
 "2026-11-27":[["08:00","09:30","Automates","TD 2.09","aut"],["11:30","13:00","Prog. fonctionnelle","TD info 5.127","pf"]],
 "2026-11-30":[["08:00","09:30","Géométrie","CM, amphi 5.03","geo"],["09:45","11:15","Algèbre","TD 2.02","lin"],["11:30","13:00","Algèbre","TD 2.02","lin"],["15:00","16:30","Algorithmique 1","CM, amphi 5.01","algo"],["16:45","18:15","Prog. fonctionnelle","TD 5.201","pf"]],
 "2026-12-01":[["08:00","09:30","Analyse","TD 5.207","ana"],["09:45","11:15","Géométrie","CM, amphi 5.03","geo"]],
 "2026-12-02":[["15:00","16:30","Analyse","CM, amphi 5.01","ana"],["16:45","18:15","Analyse","TD 5.202","ana"]],
 "2026-12-03":[["08:00","09:30","Géométrie","TD 5.211","geo"],["11:30","13:00","Algèbre","CM, amphi 5.03","lin"],["15:00","16:30","Algorithmique 1","TD 36.310","algo"],["16:45","18:15","Algorithmique 1","TD 36.310","algo"]],
 "2026-12-04":[["08:00","09:30","Automates","TD 2.09","aut"],["11:30","13:00","Prog. fonctionnelle","TD info 5.127","pf"],["15:00","16:30","Raisonnement","CC2, amphi 5.05","rai"]],
 "2026-12-07":[["08:00","09:30","Géométrie","CM, amphi 5.03","geo"],["09:45","11:15","Algèbre","TD 2.02","lin"],["15:00","16:30","Algorithmique 1","CM, amphi 5.01","algo"]],
 "2026-12-08":[["08:00","09:30","Analyse","TD 5.207","ana"],["09:45","11:15","Analyse","CM, amphi 5.06","ana"]],
 "2026-12-09":[["15:00","16:30","Analyse","CM, amphi 5.06","ana"]],
 "2026-12-10":[["08:00","09:30","Géométrie","TD 5.211","geo"],["11:30","13:00","Algèbre","CM, amphi 5.06","lin"],["15:00","16:30","Algorithmique 1","TD 5.212","algo"],["16:45","18:15","Algorithmique 1","TD 5.212","algo"]],
 "2026-12-11":[["08:00","09:30","Automates","TD 2.09","aut"],["09:45","11:15","Géométrie","CC2, amphi Dumontet","geo"],["13:15","14:45","Calculus","CC2, amphi 5.02","calc"]],
 "2026-12-14":[["09:45","11:15","Algèbre","TD 2.02","lin"],["15:00","16:30","Algorithmique 1","CM","algo"]],
 "2026-12-15":[["08:00","09:30","Analyse","TD 5.206","ana"],["09:45","11:15","Algèbre","CM, amphi 5.03","lin"]],
 "2026-12-16":[["15:00","16:30","Analyse","CC2, salle à confirmer","ana"]],
 "2026-12-17":[["08:00","09:30","Géométrie","TD 5.211","geo"],["11:30","13:00","Algèbre","CC2, amphi 5.03","lin"]],
 "2026-12-18":[]};
const HOLIDAY={"2026-11-11":"11 novembre, férié"};
["2026-12-21","2026-12-22","2026-12-23","2026-12-24","2026-12-25","2026-12-28","2026-12-29","2026-12-30","2026-12-31","2027-01-01"].forEach(d=>{HOLIDAY[d]="vacances de Noël";});
/* jours où il ne révise pas : leur temps de travail est reporté sur la veille. Jeudi 12/11 : cours puis CC jusqu'à 18 h 15, rien le soir (dit le 11/11). */
const SANS_REVISION={"2026-11-12":1};
const WIN=[[480,750],[840,1140],[1200,1350]];/* 8h-12h30, 14h-19h, 20h-22h30 */
/* ses créneaux à lui (clés cren: du journal) : {d:premier jour, a, b:"HH:MM", w:1 chaque semaine, x:[jours enlevés]} */
const jourSem=day=>{const[y,m,d]=day.split("-").map(Number);return new Date(y,m-1,d).getDay();};
const creneauxDu=day=>Object.keys(hub.cren).map(id=>({id,c:hub.cren[id]})).filter(({c})=>c.w?day>=c.d&&jourSem(day)===jourSem(c.d)&&!(c.x||[]).includes(day):c.d===day).map(({id,c})=>({id,day,a:mm(c.a),b:mm(c.b),w:!!c.w,ty:c.ty||"",m:c.m&&SUBJ[c.m]?c.m:""})).sort((x,y)=>x.a-y.a);
const dansCreneau=(day,a,b)=>creneauxDu(day).some(s=>a<s.b&&b>s.a);
/* un créneau à lui peut avoir un type (champ ty) : "cours", "exos" ou "xb" (examen blanc) ; sans type, le site choisit */
const TYN={cours:"Cours",exos:"Exercices",xb:"Examen blanc"};
const genreTache=t=>t.td||t.train||/^en-/.test(t.id)||(!t.lesson&&(t.links||[]).some(l=>/^annales|^#\/entrainer/.test(l[0])))?"exos":"cours";
const typeCren=(day,a)=>{const s=creneauxDu(day).find(s=>a>=s.a&&a<s.b);return s?s.ty:"";};
/* et une matière (champ m) : le planning n'y met alors que cette matière, sans compter son plafond du jour */
/* la matière choisie pour une séance placée hors de ses créneaux (choix 42b du 20/11) : réglage smat:<jour>:<début> = {m, b:fin},
   valable pour toute séance qui commence dans [début, fin), même quand celle du jour glisse avec l'heure */
const smatK=(day,a)=>Object.keys(hub.smat).find(k=>k.slice(0,10)===day&&+k.slice(11)<=a&&a<hub.smat[k].b);
const smatDe=(day,a)=>{const k=smatK(day,a),m=k&&hub.smat[k].m;return m&&SUBJ[m]&&examStart(SUBJ[m])>NOW()?m:"";};
const matCren=(day,a)=>{const s=creneauxDu(day).find(s=>a>=s.a&&a<s.b);return s?s.m:smatDe(day,a);};
/* les cours d'un jour, sans les CC ; skip : "rev" (révision à la place) ou "abs" (pas allé), choisi en cliquant sur le cours ;
   un cours dans un de ses créneaux compte comme "rev", sauf s'il a dit qu'il y va ("go") */
const epreuvesDu=day=>SIDS.flatMap(id=>examsOf(SUBJ[id]).map((x,i)=>({S:SUBJ[id],e:examAt(SUBJ[id],i)}))).filter(x=>x.e.day===day&&!x.e.off&&!x.e.report);
const estCC=(day,c)=>epreuvesDu(day).some(x=>Math.abs(mm(x.e.start)-mm(c[0]))<=20);
const skipDe=(day,c)=>{const s=hub.skip[day+":"+c[0]]||"";return s==="go"?"":s||(dansCreneau(day,mm(c[0]),mm(c[1]))?"rev":"");};
const coursJour=day=>(CLASSES[day]||[]).filter(c=>!estCC(day,c)).map(c=>({day,start:c[0],end:c[1],name:c[2],detail:c[3],sid:c[4],skip:skipDe(day,c)}));
function busyOf(day){
  const b=[];coursJour(day).forEach(c=>{if(!c.skip)b.push([mm(c.start),mm(c.end)]);});
  SIDS.forEach(id=>{const e=exam(SUBJ[id]);if(e.day===day&&!e.report)b.push([mm(e.start)-30,mm(e.end)+10]);});
  return b.sort((x,y)=>x[0]-y[0]);
}
/* Une séance dure 1 h 50 au plus, avec 15 min de pause au milieu ; 20 min de pause entre deux séances.
   Les plafonds par jour comptent le travail seulement, pauses non comprises. */
const SEANCE=110,GAP=20,PAUSE=15;
const work=len=>len>60?len-PAUSE:len;
const lenFor=u=>u>45?u+PAUSE:u;
function doneTodayMin(){const t0=today();let s=0;J.forEach(e=>{if(ymd(new Date(e.t))!==t0)return;const S=SUBJ[e.s];if(!S)return;
  if(e.k==="les"){const T=S.TB["L-"+e.l];s+=e.dur||(T?T.min:15);}else if(e.k==="task"&&e.v){const T=S.TB[e.x];if(T)s+=T.min;}});return s;}
function dayCap(day){if(SANS_REVISION[day])return 0;const n=addDays(day,1);return capBase(day)+(SANS_REVISION[n]?capBase(n):0);}
/* temps d'une carte : 1 min au départ, puis le temps mesuré (retours des ratées compris) prend le dessus : moitié après 20 cartes, presque tout après 60 */
function tempsCarte(){const L=CARTES.L.slice(-300);let ms=0,n=0;L.forEach(([m,p])=>{ms+=m;n+=p;});
  const C=Object.values(CARTES.carnet).filter(c=>c&&c.r>0),R=C.reduce((a,c)=>a+c.r,0),f=R?Math.min(1,Math.max(0,300-L.length)/R):0;
  C.forEach(c=>{ms+=f*c.ms;n+=f*(c.p||c.r);});
  const w=1-Math.pow(.5,n/20);return{ms:n?w*ms/n+(1-w)*60000:60000,n:Math.round(n)};}
const neuvesParJour=()=>{const t=today();let s=0;for(let i=1;i<=7;i++)s+=CARTES.neuves[addDays(t,-i)]||0;return s/7;};
/* minutes gardées pour « Réviser » un jour donné : les cartes du jour × ton temps par carte, 45 min au plus (choix du 18/11) ;
   aujourd'hui, les cartes déjà notées comptent aussi, pour que le temps réservé ne passe pas aux leçons */
function minCartes(day){const X=APP.ext;if(!X||!X.cartesDu)return 15;const n=X.cartesDu(day)+(day===today()?CARTES.L.filter(x=>x[2]===day&&x[1]).length:0);
  return Math.min(45,Math.round(n*tempsCarte().ms/60000));}
function capBase(day){const[y,m,d]=day.split("-").map(Number),dw=new Date(y,m-1,d).getDay();const free=dw===0||dw===6||HOLIDAY[day];const R={leger:[180,90,120],normal:[270,150,180],intensif:[360,210,270]}[hub.rythme||"normal"]||[270,150,180];return Math.max(0,(free?R[0]:(coursJour(day).some(c=>!c.skip)?R[1]:R[2]))-minCartes(day));}
const decoupe=(iv,busy,m=10)=>{busy.forEach(([s,e])=>{const out=[];iv.forEach(([a,b])=>{if(e+m<=a||s-m>=b){out.push([a,b]);return;}if(s-m-a>=30)out.push([a,s-m]);if(b-(e+m)>=30)out.push([e+m,b]);});iv=out;});return iv;};
/* une séance qu'il a enlevée de la grille (réglage sans:<jour>:<début en minutes> = fin en minutes) : plus de révision à ces heures-là,
   le temps du jour se place dans les autres moments libres */
const sansDu=day=>Object.keys(hub.sans).filter(k=>k.slice(0,10)===day).map(k=>[+k.slice(11),hub.sans[k]]).sort((x,y)=>x[0]-y[0]);
const horsSans=(iv,day)=>decoupe(iv,sansDu(day),0);
const seances=iv=>{const r=[];iv.forEach(([a,b])=>{let t=a;while(b-t>=30){const len=Math.min(SEANCE,b-t);r.push([t,t+len]);t+=len+GAP;}});return r;};
/* ses créneaux sont remplis en entier, en plus du temps habituel du jour (choix du 17/11) ; le temps habituel va dans les fenêtres WIN, hors de ses créneaux */
/* un cours qu'il remplace par de la révision (« rev ») est rempli en entier lui aussi, en plus du temps habituel (19/11) : hors de ses créneaux, qui gardent leurs séances */
const remplaces=day=>coursJour(day).filter(c=>c.skip==="rev").map(c=>[mm(c.start),mm(c.end)]);
/* la veille d'une épreuve, rien après 22h30 (choix 31a du 20/11) : ses créneaux et les cours remplacés s'arrêtent là eux aussi (les fenêtres WIN finissent déjà à 22h30) */
const COUCHER=22*60+30,veilleDe=day=>epreuvesDu(addDays(day,1)),couche=(iv,day)=>veilleDe(day).length?decoupe(iv,[[COUCHER,24*60]],0):iv;
const coucheTxt=day=>{const L=veilleDe(day);return L.length?`Demain : ${L.map(({S,e})=>`${e.label||"CC"} ${W.de(S.name)}`).join(", ")}. Ce soir, rien n'est placé après 22h30 : dors, c'est la nuit qui fixe ce que tu as révisé.`:"";};
const seancesMiennes=(day,from)=>{const C=creneauxDu(day).map(s=>[s.a,s.b]),tard=L=>L.map(([a,b])=>[Math.max(a,from),b]).filter(([a,b])=>b-a>=30);
  return seances(couche(horsSans(decoupe(tard(C),busyOf(day)),day),day)).concat(seances(couche(horsSans(decoupe(tard(remplaces(day)),busyOf(day).concat(C)),day),day))).sort((x,y)=>x[0]-y[0]);};
/* le bilan de fin de séance (choix 29a du 20/11) : deux lignes, gardées dans le journal et montrées dans le rapport d'entraînement */
function bilanSeance(host,ctx){if(!host)return;
  host.className="fin-bil";host.innerHTML=`<p><b>Ton bilan, en deux lignes</b> <span class="muted">(gardé dans ton rapport)</span></p><label>Ce que je retiens<input class="en-in" data-b="r" type="text" maxlength="300" autocomplete="off"></label><label>Ce qui a coincé<input class="en-in" data-b="c" type="text" maxlength="300" autocomplete="off"></label><div class="acts"><button class="btn" data-b="ok">Garder dans mon rapport</button><span class="muted" data-b="msg"></span></div>`;
  const v=k=>host.querySelector(`[data-b="${k}"]`).value.trim(),ok=host.querySelector('[data-b="ok"]');
  host.querySelectorAll("input").forEach(i=>i.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();ok.click();}}));
  ok.addEventListener("click",()=>{const r=v("r"),c=v("c");if(!r&&!c){host.querySelector('[data-b="msg"]').textContent="Écris au moins une des deux lignes.";return;}
    emit(Object.assign({k:"bil",r,c},ctx));
    host.innerHTML=`<p><b>Ton bilan est gardé dans ton rapport.</b></p>${r?`<p>Ce que je retiens : ${W.esc(r)}</p>`:""}${c?`<p>Ce qui a coincé : ${W.esc(c)}</p>`:""}`;});}
function freeBlocks(day,from,capOv){
  const res=seancesMiennes(day,from);
  let iv=[];WIN.forEach(([a,b])=>{a=Math.max(a,from);if(b-a>=30)iv.push([a,b]);});
  iv=horsSans(decoupe(iv,busyOf(day).concat(creneauxDu(day).map(s=>[s.a,s.b]),remplaces(day))),day);
  let cap=capOv==null?dayCap(day):capOv;for(const[a,b]of seances(iv)){if(cap<25)break;let len=b-a;if(work(len)>cap)len=cap>45?cap+PAUSE:cap;res.push([a,a+len]);cap-=work(len);}
  return res.sort((x,y)=>x[0]-y[0]);
}
/* le travail fait aujourd'hui dans ses créneaux ne mange pas le temps habituel */
const mienAvant=(day,until)=>seancesMiennes(day,0).reduce((s,[a,b])=>a<until?s+work(Math.min(b,until)-a):s,0);

/* ---------- le plan de la semaine ---------- */
/* une étape marquée apres:"<id>" n'est proposée qu'une fois l'étape <id> faite (le 2e sujet blanc après le 1er) */
function pendingTasks(sid,sansParcours){const S=SUBJ[sid],attend=t=>{const a=t.apres&&S.TB[t.apres];return a&&inScope(S,a)&&!isDone(sid,a);};const L=S.tasks.filter(t=>inScope(S,t)&&!isDone(sid,t)&&!attend(t)&&(!t.quand||t.quand()));
  if(sansParcours)return L;const X=couvertes(sid);if(!X)return L;
  /* choix 77a : le parcours de la prochaine épreuve est la séance principale ; il remplace les leçons qu'il couvre, qui ne reviennent que si une de leurs notions est ratée */
  const R=L.filter(t=>!(t.lesson&&X.cov[t.lesson]&&!X.rate[t.lesson]));
  if(X.reste>0)R.unshift(S.TB[X.id]=Object.assign(S.TB[X.id]||{},{id:X.id,t:X.C.t,min:X.reste,base:X.reste,p:1,i:-1,first:true,why:"La séance principale : "+X.C.carte,links:[[`#/express/${sid}/${X.E.id}/go`,"Le parcours"]]}));
  return R;}
function couvertes(sid){const O=window.EXPRESS_OUTILS,S=SUBJ[sid],E=exam(S),C=E&&!E.off&&window.EXPRESS&&(window.EXPRESS[sid]||{})[E.id];if(!O||!C||!window.GEN)return null;
  let B;try{B=O.bilan(sid,E.id);}catch(e){return null;}const cov={},rate={};
  C.notions.forEach(n=>{const g=n.exo&&GEN.par[n.exo.g];(g&&g.lecons||[]).forEach(l=>{cov[l]=1;if(B.essais[n.id]&&!B.ok[n.id])rate[l]=1;});});
  const reste=C.notions.filter(n=>!B.ok[n.id]).reduce((s,n)=>s+O.minNotion(n),0)+(B.blancs.length?0:O.minBlanc(C));
  return {E,C,B,cov,rate,reste:Math.round(reste),id:"xp-"+E.id};}
/* le temps prévu d'ici l'épreuve, sans le parcours et avec (77a) */
function tempsPrevu(sid){const m=L=>L.reduce((s,t)=>s+(t.min||0),0);return {avant:m(pendingTasks(sid,true)),apres:m(pendingTasks(sid))};}
/* ce qui se fait d'abord chaque jour et qui est du temps de révision : « Où j'en suis » quand il est nécessaire, l'entretien du jour,
   le mini-contrôle mélangé et les cartes de Réviser ; pour les jours suivants, seules les cartes sont connues d'avance */
function rituels(day){const X=APP.ext,L=[];
  if(day===today()){const D=diagAFaire().find(x=>x.need),E=window.ENT&&ENT.jour?ENT.jour():null,M=miniDu();
    if(D)L.push({t:"Où j'en suis en "+SUBJ[D.sid].name,min:D.min,href:`#/${D.sid}/niveau`});
    if(E)L.push({t:"Entretien du jour",min:E.min,href:"#/entrainer/jour"});
    if(M.du)L.push({t:"Mini-contrôle mélangé",min:10,href:"#/mix"});}
  const n=X&&X.cartesDu?X.cartesDu(day):0;
  if(n)L.push({t:n+(n>1?" cartes":" carte"),min:Math.min(45,Math.max(1,Math.round(n*tempsCarte().ms/60000))),href:"#/reviser"});
  return L.length?{L,min:L.reduce((s,x)=>s+x.min,0)}:null;}
function buildPlan(){
  const n=NOW(),t0=ymd(n),nowMin=n.getHours()*60+n.getMinutes();
  const active=SIDS.filter(id=>examStart(SUBJ[id])>n&&pendingTasks(id).length);
  /* une leçon marquée « Jamais vu » dans Réviser passe devant tout le reste */
  const PRI=new Set();active.forEach(id=>pendingTasks(id).forEach(t=>{if(t.lesson&&ST[id].prio[t.lesson])PRI.add(t);}));const pri=t=>PRI.has(t)?1:0;
  const plan={day:t0,blocks:[],assign:{},bonus:{},rituels:[]};
  if(!active.length)return plan;
  const lastDay=ymd(new Date(Math.max(...active.map(id=>examStart(SUBJ[id]).getTime()))));
  /* les rituels du jour prennent le début du premier moment libre (25 min au moins, pour rester lisibles sur la grille) ; les séances viennent après */
  let blocks=[];for(let d=t0;d<=lastDay;d=addDays(d,1)){let from=d===t0?Math.ceil((nowMin+10)/5)*5:0;
    const R=rituels(d),lib=R&&freeBlocks(d,from,1e4).find(([a])=>typeCren(d,a)!=="xb");
    if(lib){from=Math.min(lib[1],lib[0]+Math.max(25,Math.ceil(R.min/5)*5));plan.rituels.push({day:d,start:lib[0],end:from,L:R.L});}
    freeBlocks(d,from,d===t0?Math.max(0,dayCap(t0)-Math.max(0,doneTodayMin()-mienAvant(t0,nowMin))):null).forEach(([a,b])=>{if(typeCren(d,a)!=="xb")blocks.push({day:d,start:a,end:b});});}
  const dl=id=>examStart(SUBJ[id]).getTime();
  /* 1. Ce qu'on garde, quand tout ne tient pas : le temps est partagé entre les matières en proportion du poids de chaque CC
        dans la moyenne (coefficient × part du CC), de sa proximité (bonus dans les 7 jours) et des points qu'il reste
        à y gagner (page « Où j'en suis »). On remplit d'abord l'essentiel (p = 1,
        dans l'ordre du cours), en donnant chaque étape à la matière la moins servie, tant que tout tient avant chaque CC
        (8 % de marge). Puis l'important (p = 2), puis le reste. Ce qui ne tient pas devient facultatif. */
  const dls=[...new Set(active.map(dl))].sort((a,b)=>a-b),cap={},load={};
  dls.forEach(D=>{cap[D]=blocks.reduce((s,b)=>toD(b.day,b.end).getTime()<=D?s+work(b.end-b.start):s,0)*0.92;load[D]=0;});
  const lastD=Math.max(...dls);plan.have=blocks.reduce((s,b)=>toD(b.day,b.end).getTime()<=lastD?s+work(b.end-b.start):s,0);plan.need=active.reduce((s,id)=>s+pendingTasks(id).filter(t=>t.p===1).reduce((a,t)=>a+t.min,0),0);
  const keep=new Set(),first=active.slice().sort((a,b)=>dl(a)-dl(b))[0],urg=id=>1+0.5*Math.max(0,1-(dl(id)-n.getTime())/(7*864e5)),ew=id=>weight(SUBJ[id])*urg(id)*marge(id),got={},qs={};
  /* quand tout ne tient pas, les leçons et les exercices passent avant le quiz et la veille */
  active.forEach(id=>{got[id]=0;const P=pendingTasks(id);qs[id]=P.filter(t=>!t.last).sort((a,b)=>(pri(b)-pri(a))||(a.p-b.p)||(valeur(id,b)-valeur(id,a))||(a.i-b.i)).concat(P.filter(t=>t.last));});
  const tier=t=>t.last||pri(t)?1:t.p;
  [1,2,3].forEach(P=>{const ptr={},L={};active.forEach(id=>{ptr[id]=0;L[id]=qs[id].filter(t=>tier(t)===P);});
    for(;;){let best=null;active.forEach(id=>{if(ptr[id]<L[id].length&&(best===null||got[id]/ew(id)<got[best]/ew(best)))best=id;});if(best===null)break;
      const t=L[best][ptr[best]++],d=dl(best);
      if(dls.every(D=>D<d||load[D]+t.min<=cap[D])){keep.add(best+":"+t.id);dls.forEach(D=>{if(D>=d)load[D]+=t.min;});got[best]+=t.min;}}});
  /* 2. File d'attente de chaque matière : l'essentiel d'abord (p = 1), dans l'ordre du cours ; quiz et fiches en rouge à la fin */
  const Q={};active.forEach(id=>{const P=pendingTasks(id).filter(t=>keep.has(id+":"+t.id));Q[id]=P.filter(t=>!t.last).sort((a,b)=>(pri(b)-pri(a))||(a.p-b.p)||(a.i-b.i)).concat(P.filter(t=>t.last));plan.bonus[id]=pendingTasks(id).filter(t=>!keep.has(id+":"+t.id)).map(t=>t.id);});
  /* 3. Affectation créneau par créneau : la matière la plus en retard sur son temps restant (bonus de coefficient).
        Une étape ne va que dans un créneau assez long. Le quiz et les fiches en rouge attendent les 30 h avant le CC, ou le dernier jour où il reste une séance. */
  /* la file de chaque matière, pour les essais (tools/essai-part-exos.html) */
  plan.files={};active.forEach(id=>{plan.files[id]=Q[id].map(t=>t.id);});
  const fitsIn=(t,room)=>t.min<=room+15;
  const dernier={};active.forEach(id=>{blocks.forEach(b=>{if(toD(b.day,b.end).getTime()<=dl(id))dernier[id]=b.day;});});
  const fenetre=(id,B,bs)=>dl(id)-bs<=30*3600e3||B.day===dernier[id];
  /* rythme réduit avant une date (exam.pace = {until, perDay}) : un peu chaque jour, sans passer devant les CC */
  const dayUse={},paceLeft=(id,day)=>{const p=exam(SUBJ[id]).pace;if(!p||day>=p.until)return Infinity;return Math.max(0,p.perDay-(dayUse[id+"|"+day]||0));},useDay=(id,day,m)=>{dayUse[id+"|"+day]=(dayUse[id+"|"+day]||0)+m;};
  const ratee=(id,t,B)=>t.lesson&&!pri(t)&&B.day===t0&&(ST[id].les[t.lesson]||{}).on===t0;/* leçon ratée aujourd'hui : on la refait demain */
  /* un créneau « exercices » ne reçoit que TD, entraînement, annales et examens blancs ; un créneau « cours », que le reste (leçons, quiz, veille, feuille à recopier) ;
     un examen blanc tiré au hasard (t.xb) ne se place ni le jour ni la veille d'une épreuve */
  const genre=genreTache,tyB=B=>B.ty!=null?B.ty:(B.ty=typeCren(B.day,B.start)),mB=B=>B.mt!=null?B.mt:(B.mt=matCren(B.day,B.start)),allure=(id,B)=>mB(B)===id?1e9:paceLeft(id,B.day),EPJ={},pres=day=>EPJ[day]!=null?EPJ[day]:(EPJ[day]=epreuvesDu(day).length+epreuvesDu(addDays(day,1)).length>0);
  const non=(id,t,B)=>ratee(id,t,B)||(!!tyB(B)&&genre(t)!==tyB(B))||(!!mB(B)&&id!==mB(B))||(!!t.xb&&pres(B.day));
  const fill=(id,B,dur,src,finalWin,ordre)=>{let used=0;const tk=[];for(const t of src[id].slice()){if(t.last&&!finalWin)continue;if(non(id,t,B))continue;if(!fitsIn(t,dur-used)){if(ordre&&!t.last)break;continue;}tk.push(t);used+=t.min;src[id].splice(src[id].indexOf(t),1);if(used>=dur-10)break;}return{tk,used};};
  const place=(i,best,tk,used,dur,extra)=>{const B=blocks[i];B.sid=best;B.tasks=tk.map(t=>t.id);if(extra)B.extra=true;const full=B.end;B.end=Math.min(full,B.start+Math.max(lenFor(used),30));
    tk.forEach(t=>plan.assign[best+":"+t.id]=plan.blocks.length);plan.blocks.push(B);if(full-B.end>=25)blocks.splice(i+1,0,{day:B.day,start:B.end,end:full});};
  const freeIdx=[];
  /* étapes essentielles (p = 1) qui n'ont pas pu être gardées : elles passent avant une matière lointaine quand leur CC est à moins de 3 jours */
  const R1={};active.forEach(id=>{R1[id]=(plan.bonus[id]||[]).map(tid=>SUBJ[id].TB[tid]).filter(t=>t.p===1&&!t.last);});
  for(let i=0;i<blocks.length;i++){
    const B=blocks[i],bs=toD(B.day,B.start).getTime(),be=toD(B.day,B.end).getTime(),dur=work(B.end-B.start);
    /* dans l'ordre du cours d'abord ; si le créneau irait à une matière lointaine alors qu'un CC est à moins de 3 jours,
       une étape plus courte de ce CC passe devant */
    const proche=id=>dl(id)-bs<=72*3600e3;
    const choisir=ordre=>{let best=null,bestScore=-1;
    active.forEach(id=>{if(!Q[id].length||be>dl(id)||B.day<(exam(SUBJ[id]).from||SUBJ[id].from||""))return;
      if(!ordre&&!proche(id))return;
      const room=Math.min(dur,allure(id,B));if(room<=0)return;
      const finalWin=fenetre(id,B,bs);
      const elig=Q[id].filter(t=>(!t.last||finalWin)&&!non(id,t,B));if(!elig.length||(ordre?!fitsIn(elig[0],room):!elig.some(t=>fitsIn(t,room))))return;
      let avail=0;for(let j=i;j<blocks.length;j++){const e=toD(blocks[j].day,blocks[j].end).getTime();if(e<=dl(id))avail+=work(blocks[j].end-blocks[j].start);}
      const rem=elig.reduce((s,t)=>s+t.min,0);
      let sc=rem/Math.max(avail,1)*(1+0.3*weight(SUBJ[id])/WMAX);
      if(finalWin&&elig[0].last)sc+=0.6;
      if(pri(elig[0]))sc+=10;/* quiz et veille : seulement quand les leçons de la matière sont placées */
      /* une étape longue qui ne tiendra plus dans aucune séance libre avant son CC passe maintenant */
      let mx=0;for(let j=i+1;j<blocks.length;j++){if(blocks[j].sid)continue;if(toD(blocks[j].day,blocks[j].end).getTime()<=dl(id))mx=Math.max(mx,work(blocks[j].end-blocks[j].start));}
      if(elig.some(t=>!t.last&&fitsIn(t,dur)&&!fitsIn(t,mx)))sc+=5;
      if(sc>bestScore){bestScore=sc;best=id;}});return best;};
    let ordre=true,best=choisir(true);
    if(!best||(!proche(best)&&!pri(Q[best][0]))){const u=choisir(false);if(u){best=u;ordre=false;}
      else{let r=null;active.forEach(id=>{if(!proche(id)||be>dl(id)||!R1[id].some(t=>fitsIn(t,dur)&&!non(id,t,B)))return;if(!r||dl(id)<dl(r)||(dl(id)===dl(r)&&weight(SUBJ[id])>weight(SUBJ[r])))r=id;});
        if(r){const f=fill(r,B,dur,R1,false);if(f.tk.length){f.tk.forEach(t=>{const k=plan.bonus[r].indexOf(t.id);if(k>=0)plan.bonus[r].splice(k,1);});useDay(r,B.day,f.used);place(i,r,f.tk,f.used,dur,true);continue;}}}}
    if(!best){freeIdx.push(i);continue;}
    const {tk,used}=fill(best,B,Math.min(dur,allure(best,B)),Q,fenetre(best,B,bs),ordre);
    if(!tk.length){freeIdx.push(i);continue;}
    useDay(best,B.day,used);place(i,best,tk,used,dur,false);
  }
  /* 4. Créneaux restés libres : on y place les étapes facultatives encore utiles avant leur CC */
  const BQ={};active.forEach(id=>{BQ[id]=(plan.bonus[id]||[]).map(tid=>SUBJ[id].TB[tid]).concat(Q[id]).sort((x,y)=>(x.p-y.p)||(x.i-y.i));Q[id]=[];});
  for(let i=0;i<blocks.length;i++){const B=blocks[i];if(B.sid)continue;const bs=toD(B.day,B.start).getTime(),be=toD(B.day,B.end).getTime(),dur=work(B.end-B.start);
    /* d'abord l'étape la plus importante (p le plus petit), puis la matière au plus fort coefficient dont le CC est le plus proche */
    let best=null,bestScore=-1;active.forEach(id=>{if(!BQ[id].length||be>dl(id)||B.day<(exam(SUBJ[id]).from||SUBJ[id].from||"")||paceLeft(id,B.day)<=0)return;const f=BQ[id].filter(t=>!t.last&&!non(id,t,B)&&fitsIn(t,Math.min(dur,paceLeft(id,B.day))));if(!f.length)return;const sc=(4-Math.min(...f.map(t=>t.p)))*100+weight(SUBJ[id])/Math.max(1,(dl(id)-bs)/864e5);if(sc>bestScore){bestScore=sc;best=id;}});
    if(!best)continue;const {tk,used}=fill(best,B,Math.min(dur,paceLeft(best,B.day)),BQ,false);if(tk.length){useDay(best,B.day,used);place(i,best,tk,used,dur,true);}}
  /* 5. En maths (choix 67a du 20/11) : dans les créneaux restés libres, « Entraînement en plus » (les méthodes déjà vues, mélangées),
        jusqu'à environ 4 minutes d'exercices pour 1 minute de leçon au planning de la matière. Rien n'est retiré ni déplacé. */
  const MATHS_P=["ana","lin","geo","calc","rai"],pretPlus=id=>!!(window.ENT&&ENT.plusPret&&ENT.plusPret(id));
  active.filter(id=>MATHS_P.includes(id)&&pretPlus(id)).sort((a,b)=>dl(a)-dl(b)).forEach(id=>{const S=SUBJ[id];let c=0,e=0;
    plan.blocks.forEach(B=>{if(B.sid!==id)return;B.tasks.forEach(tid=>{const t=S.TB[tid];if(!t)return;if(genreTache(t)==="exos")e+=t.min;else c+=t.min;});});
    let reste=4*c-e;const jours={};
    for(let i=0;i<blocks.length&&reste>=20;i++){const B=blocks[i];if(B.sid)continue;const be=toD(B.day,B.end).getTime(),dur=work(B.end-B.start);
      if(be>dl(id)||B.day<(exam(S).from||S.from||"")||dur<20||tyB(B)==="cours"||(mB(B)&&mB(B)!==id)||ST[id].tasks["plus-"+B.day]||jours[B.day])continue;jours[B.day]=1;
      const m=Math.min(45,dur,Math.max(20,Math.round(reste/5)*5)),tid="plus-"+B.day;
      const t=S.TB[tid]||(S.TB[tid]={id:tid,plus:1,train:true,manual:true,p:3,t:"Entraînement en plus : les méthodes que tu as déjà vues, mélangées",links:[["#/entrainer/"+id,"S'entraîner"]],why:"En maths, on retient en faisant : environ 4 minutes d'exercices pour 1 minute de leçon (ton choix du 20/11)."});
      t.min=m;place(i,id,[t],m,dur,true);reste-=m;}});
  plan.blocks.sort((x,y)=>x.day<y.day?-1:x.day>y.day?1:x.start-y.start);
  plan.assign={};plan.blocks.forEach((B,k)=>B.tasks.forEach(tid=>plan.assign[B.sid+":"+tid]=k));
  active.forEach(id=>{plan.bonus[id]=BQ[id].map(t=>t.id);if(!plan.bonus[id].length)delete plan.bonus[id];});
  return plan;
}
/* recalculé à chaque affichage : ce qui est fait disparaît, ce qui est en retard est replacé */
function plan(){return buildPlan();}

/* ---------- liens internes des contenus de chaque matière ---------- */
const LOCAL=location.protocol==="file:"||/^(localhost|127\.)/.test(location.hostname);
function fixLinks(root,sid){if(!LOCAL)root.querySelectorAll('a[href^="../"]').forEach(a=>{const sp=document.createElement("span");sp.className="muted";sp.textContent=a.textContent+" (PDF sur ton ordinateur)";a.replaceWith(sp);});
  root.querySelectorAll('a[href^="#/"]').forEach(a=>{const h=a.getAttribute("href"),seg=h.slice(2).split("/")[0];if(h==="#/"||SIDS.includes(seg)||["edt","examens","mix","methode","lecon","apprendre","reviser","entrainer","express","plus","synchro"].includes(seg))return;
  if(seg==="mix"||seg==="methode")return;const map={redaction:"p/redaction",notations:"p/notations",infos:"p/infos"};a.setAttribute("href",`#/${sid}/`+(map[seg]&&h.slice(2)===seg?map[seg]:h.slice(2)));});}

/* ---------- plus de barre latérale : tout passe par les pages ---------- */
let CUR={sid:null,page:"today"};
function renderSide(){if(APP.ext&&APP.ext.badges)try{APP.ext.badges();}catch(e){}}
function topInfo(){if(window.ENT&&ENT.pastille)ENT.pastille();const n=NOW();const next=SIDS.map(id=>SUBJ[id]).filter(S=>examStart(S)>n).sort((a,b)=>examStart(a)-examStart(b))[0];const el=$("#jx");if(el){el.innerHTML=next?`${next.name} · <b>${jx(next)}</b>`:"CC passés";el.title=next?"Prochain CC":"";}}

/* ---------- petits morceaux de page ---------- */
const sec=(n,t,body)=>`<section class="sec"><h2><span class="num">${n}</span><span>${t}</span></h2>${body}</section>`;
function badges(S,c){const t=TYPE[c.type]||["Fiche","def"];return `<span class="badge ${t[1]}">${t[0]}</span><span class="badge">${c.ref}</span>${c.cc?`<span class="badge cc">${c.cc}</span>`:""}${c.out?`<span class="badge out">Sans doute pas au CC</span>`:""}${c.maybe?`<span class="badge out">Peut-être au CC</span>`:""}`;}
function pill(sid,id){const s=status(sid,id);return s==="known"?'<span class="pill ok">Su</span>':s==="review"?'<span class="pill rev">À revoir</span>':"";}
function knowBtns(sid,id,lab){const s=status(sid,id);return `<div class="acts"><button class="btn${s==="known"?" ok":""}" data-know="1" aria-pressed="${s==="known"}">${s==="known"?"✓ ":""}${lab||"Je sais"}</button><button class="btn${s==="review"?" rev":""}" data-know="0" aria-pressed="${s==="review"}">À revoir</button></div>`;}
function bindKnow(root,sid,id,lab){root.querySelectorAll("[data-know]").forEach(b=>b.addEventListener("click",()=>{setStatus(sid,id,b.dataset.know==="1"?"known":"review");root.querySelector(".acts").outerHTML=knowBtns(sid,id,lab);bindKnow(root,sid,id,lab);const p=$("#pill");if(p)p.innerHTML=pill(sid,id);renderSide();}));}
function chip(sid,id){const S=SUBJ[sid],c=S.BY[id],s=status(sid,id);return `<a class="chip ${s}" href="#/${sid}/c/${id}"><span class="dot ${s}"></span>${c?(c.short||c.t):id}</a>`;}
function mount(host,c,key){host.innerHTML="";const f=c[key||"fig"];if(!f)return [];const r=f();const out=[];
  if(typeof r==="function"){const d=document.createElement("div");host.appendChild(d);r(d);return out;}
  [].concat(r).forEach(spec=>{const d=document.createElement("div");host.appendChild(d);if(typeof spec==="function")spec(d);else out.push(new G.Figure(d,spec));});return out;}

/* ---------- une étape du plan ---------- */
function taskHTML(sid,t,full){
  const S=SUBJ[sid],st=ST[sid],done=isDone(sid,t);let meta=[hm(t.min)],go="",chips="";
  const L=x=>x.startsWith("#")||/\.pdf$/.test(x)?x:`#/${sid}/${x}`;
  if(t.items){const k=t.items.filter(id=>st.known[id]).length,r=t.items.filter(id=>st.review[id]).length;meta.push(`${k} sur ${t.items.length} fiches sues`);if(r)meta.push(`<span class="r">${r} en rouge</span>`);const nx=t.items.find(id=>!st.known[id]);if(nx&&!done)go=`<a class="btn pri go" href="#/${sid}/c/${nx}">${k?"Continuer":"Commencer"}</a>`;if(full)chips=`<div class="chips">${t.items.map(id=>chip(sid,id)).join("")}</div>`;}
  if(t.lesson){const L=st.les[t.lesson],np=APP.ext&&APP.ext.partsOf?APP.ext.partsOf(sid,t.lesson):1;meta.push(L?(done?`faite, ${Math.round(L.best*100)} % de bonnes réponses`:`à refaire : ${Math.round(L.best*100)} % la première fois`):"leçon pas à pas"+(np>1?`, en ${np} parties`:""));if(!done)go=`<a class="btn pri go" href="#/lecon/${sid}/${t.lesson}">Commencer</a>`;else if(full)go=`<a class="btn go" href="#/lecon/${sid}/${t.lesson}">Refaire</a>`;}
  if(t.td){const k=t.td.filter(x=>st.td[x]).length;meta.push(`${k} sur ${t.td.length} exercices sus`);}
  if(t.quiz)meta.push(`objectif ${quizGoal(S,t)} sur ${activeQuiz(S).length}, meilleur score : ${st.best}`);
  if(t.review){const R=S.ORDER.filter(c=>st.review[c.id]);meta.push(R.length?`<span class="r">${R.length} fiche(s) en rouge</span>`:"aucune fiche en rouge");if(full&&R.length)chips=`<div class="chips">${R.map(c=>chip(sid,c.id)).join("")}</div>`;}
  if(t.links&&!done&&!go)go=`<a class="btn pri go" href="${L(t.links[0][0])}">Ouvrir</a>`;
  if(full&&t.links&&t.links.length>1)chips+=`<div class="chips">${t.links.map(l=>`<a class="chip" href="${L(l[0])}">${l[1]}</a>`).join("")}</div>`;
  const auto=!t.manual;
  return `<li class="task${done?" done":""}"><button class="tick" ${auto?"disabled":`data-task="${sid}:${t.id}"`} title="${auto?"Se coche toute seule quand la leçon ou les exercices sont faits":"Cocher"}" aria-label="${auto?"Se coche toute seule":"Cocher l'étape"}">${done?"✓":""}</button><div><div class="tt">${t.t}</div><div class="meta">${meta.join(", ")}</div>${t.why&&full&&!done?`<div class="meta">${t.why}</div>`:""}${chips}</div>${go}</li>`;
}
function bindTicks(root,rerender){root.querySelectorAll("[data-task]").forEach(b=>b.addEventListener("click",()=>{const[sid,id]=b.dataset.task.split(":");emit({k:"task",s:sid,x:id,v:!ST[sid].tasks[id]});rerender();renderSide();}));}
function blockHTML(B,full){const S=SUBJ[B.sid];return `<div class="blk" style="--sc:${S.color}"><div class="blk-h"><b>${hh(B.start)} – ${hh(B.end)}</b><a href="#/${B.sid}">${S.name}</a><span class="muted">${hm(work(B.end-B.start))} de travail${B.end-B.start>60?", pause de 15 min au milieu":""}</span></div><ol class="todo">${B.tasks.filter(tid=>S.TB[tid]).map(tid=>taskHTML(B.sid,S.TB[tid],full)).join("")}</ol></div>`;}

/* ---------- accueil : aujourd'hui ---------- */
function hubHome(){
  const P=plan(),t0=today(),n=NOW();
  const tb=P.blocks.filter(b=>b.day===t0);
  const exToday=SIDS.map(id=>SUBJ[id]).filter(S=>exam(S).day===t0&&!exam(S).report);
  let body="";
  if(exToday.length)body+=`<div class="examday">${exToday.map(S=>`<p><b>${exW(S)} ${W.de(S.name)} aujourd'hui à ${exam(S).start.replace(":","h")}</b>, <span class="nf">${exam(S).place}</span>. ${S.examMorning||"Relis seulement tes fiches en rouge."}</p>`).join("")}</div>`;
  body+=`<div class="examcard" style="--sc:var(--cobalt)"><div><b>Mini-contrôle mélangé</b> : 12 questions de toutes tes matières, surtout tes prochains CC et ce que tu rates, environ 10 minutes. ${hub.mixOn===t0?`Fait aujourd'hui : ${hub.mixScore} sur ${hub.mixSur}.`:"Pas encore fait aujourd'hui."}</div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn pri" href="#/mix">Commencer</a><a class="btn" href="#/methode">Pourquoi ça marche</a></div></div>`;
  body+=sec(1,"Aujourd'hui",tb.length?`<p class="muted">${tb.length} créneau(x), environ ${hm(tb.reduce((s,b)=>s+b.end-b.start,0))} de révision, placés autour de tes cours. Les étapes de fiches se cochent toutes seules quand tu marques les fiches « Je sais ».</p>${tb.map(b=>blockHTML(b,true)).join("")}`:`<p class="muted">Aucun créneau de révision prévu aujourd'hui. ${P.blocks.length?"Regarde les jours suivants.":"Tout est fait, ou tous les CC sont passés."}</p>`);
  const days=[...new Set(P.blocks.map(b=>b.day))].filter(d=>d>t0);
  if(days.length)body+=sec(2,"Les jours suivants",days.map(d=>{const L=P.blocks.filter(b=>b.day===d);const ex=SIDS.map(id=>SUBJ[id]).filter(S=>exam(S).day===d&&!exam(S).report);
    return `<details class="day"><summary><b>${dayName(d,true)}</b><span>${ex.length?`<span class="r">${ex.every(S=>exW(S)==="CC")?"CC":ex.length>1?"Épreuves":exW(ex[0])} : ${ex.map(S=>S.name).join(", ")}</span>, `:""}${L.length} créneau(x), ${hm(L.reduce((s,b)=>s+b.end-b.start,0))}</span></summary><div style="padding:0 12px 12px;display:grid;gap:10px">${L.map(b=>blockHTML(b,false)).join("")}</div></details>`;}).join(""));
  const bon=Object.entries(P.bonus);
  if(bon.length)body+=sec(days.length?3:2,"Si tu as encore du temps",`<p class="muted">Il reste plus de travail que de créneaux. Ces étapes rapportent le moins : elles passent après. Fais-les quand un créneau est fini en avance.</p>${bon.map(([sid,L])=>`<details class="day"><summary><b>${SUBJ[sid].name}</b><span>${L.length} étape(s)</span></summary><ol class="todo" style="padding:0 12px 12px">${L.map(id=>taskHTML(sid,SUBJ[sid].TB[id],false)).join("")}</ol></details>`).join("")}`);
  const cards=SIDS.map(id=>{const S=SUBJ[id],T=S.tasks,d=T.filter(t=>isDone(id,t)).length,r=S.ORDER.filter(c=>ST[id].review[c.id]).length,e=exam(S);
    return `<a class="mcard" href="#/${id}" style="--sc:${S.color}"><span class="mname">${S.name}</span><span class="muted">${S.code}</span><span>${exW(S)} ${quandEp(e,true)}${e.report?"":`, <b>${jx(S)}</b>`}</span><span class="muted">Coef ${S.coef}, ${exW(S)==="CC"?"ce CC":"cet examen"} compte pour ${Math.round((e.share!=null?e.share:S.share)*100)} % : poids ${String(weight(S).toFixed(2)).replace(".",",")}</span><div class="bar"><i style="width:${d/T.length*100}%;background:${S.color}"></i></div><span class="muted">${d} étape(s) sur ${T.length}${r?`, <span class="r">${r} en rouge</span>`:""}</span></a>`;}).join("");
  $("#main").innerHTML=`<div class="page"><div class="today-h"><h1>${dayName(t0,true)}</h1><span class="muted">4 CC cette semaine. Le plan se recalcule chaque matin avec ce qu'il reste.</span></div>
   <section class="mcards">${cards}</section>${body}
   <p class="muted" style="font-size:.9rem">Créneaux pris entre 8h et 22h30, hors cours, repas et trajets, au rythme « ${{leger:"léger",normal:"normal",intensif:"intensif"}[hub.rythme||"normal"]} » (modifiable dans <a href="#/examens">Examens et coefficients</a>). <a href="#/edt">Voir l'emploi du temps</a> <button class="btn" id="replan">Recalculer maintenant</button></p></div>`;
  bindTicks($("#main"),hubHome);$("#replan").addEventListener("click",()=>{plan(true);hubHome();});
}

/* ---------- emploi du temps ---------- */
let EDTW=0;/* semaine affichée : 0 = cette semaine, -1 la précédente, 1 la suivante */
function edt(){
  const P=plan(),t0=today(),n0=NOW(),[ty,tm,td]=t0.split("-").map(Number),lundi=addDays(t0,-((new Date(ty,tm-1,td).getDay()+6)%7)+7*EDTW);
  const days=[];for(let i=0;i<7;i++)days.push(addDays(lundi,i));
  const nowMin=n0.getHours()*60+n0.getMinutes();
  const H0=7*60+30,H1=23*60,PX=0.78,pos=(a,b,min)=>`top:${(a-H0)*PX+1}px;height:${Math.max(min||22,(b-a)*PX-2)}px`;
  const col=d=>{let s=creneauxDu(d).map(c=>cadreCren(c,P,(c.a-H0)*PX,(c.b-c.a)*PX)).join("");
    coursJour(d).filter(c=>!c.skip).forEach(c=>{s+=`<div class="ev cls ch" role="button" tabindex="0" data-cl="${d}|${c.start}" style="${pos(mm(c.start),mm(c.end))}"><b>${c.name}</b><span class="l2">${hh(mm(c.start))} · ${c.detail}</span></div>`;});
    epreuvesDu(d).forEach(({S,e})=>{s+=`<a class="ev exam ch" href="#/${S.id}" style="${pos(mm(e.start),mm(e.end||e.start),48)}"><i class="tg">CC</i><b>${e.label||"CC"} ${S.name}</b><span class="l2">${hh(mm(e.start))} · <span class="nf">${String(e.place||"").split(" (")[0]}</span></span></a>`;});
    fusionSeances(P.blocks.filter(b=>b.day===d)).forEach(F=>{const S=SUBJ[F.sid],fait=b=>b.tasks.every(tid=>isDone(b.sid,S.TB[tid])),done=F.L.every(fait);
      const att=F.L.length>1?` data-rvs="${F.L.map(b=>`${d}|${b.start}|${b.end}|${b.sid}|${fait(b)?1:0}`).join(";")}"`:done?"":` data-rv="${d}|${F.a}|${F.b}|${F.sid}" data-go="Ouvrir la matière"`;
      s+=`<a class="ev rev ch${done?" done":""}" href="#/${F.sid}"${att} style="--sc:${S.color};${pos(F.a,F.b)}"><b>${S.name}</b><span class="l2">${hh(F.a)}–${hh(F.b)}${F.L.length>1?` · ${F.L.length} séances`:done?", fait":""}</span></a>`;});
    if(d>=t0)sansDu(d).forEach(([a,b])=>{s+=fantome(d,a,b," ch",pos(a,b));});
    (P.rituels||[]).filter(r=>r.day===d).forEach(r=>{s+=`<a class="ev rev ch" href="${r.L[0].href}" title="${r.L.map(x=>x.t).join(", ")}" style="--sc:var(--cornflower);${pos(r.start,r.end)}"><b>D'abord</b><span class="l2">${hh(r.start)}–${hh(r.end)}</span></a>`;});
    if(d===t0&&nowMin>H0&&nowMin<H1)s+=`<div class="edt-now" style="top:${(nowMin-H0)*PX}px"></div>`;
    return s;};
  const sautes=d=>coursJour(d).filter(c=>c.skip);
  let hours="";for(let h=8;h<=22;h++)hours+=`<span style="top:${(h*60-H0)*PX}px">${h}h</span>`;
  $("#main").innerHTML=`<div class="page" style="max-width:1280px"><div class="title-row"><h1>Emploi du temps de la semaine</h1></div>
   <div class="filters" id="edtnav"><button class="btn" data-w="-1">‹ Semaine précédente</button><button class="btn" data-w="0" aria-pressed="${EDTW===0}">Cette semaine</button><button class="btn" data-w="1">Semaine suivante ›</button><span class="muted">Du ${dayName(days[0],false)} au ${dayName(days[6],false)}</span></div>
   <p class="lead">Tes cours (en pointillés), tes CC (en rouge) et tes séances de révision (couleur de la matière ; celles qui se suivent sont réunies). <b>Touche un cours</b> si tu n'y vas pas : le créneau devient de la révision, et le cours passe sous le nom du jour. Touche une séance pour l'ouvrir ou l'enlever, <b>un trou</b> pour ajouter un créneau à toi (bande violette), une fois ou chaque semaine.</p>
   <div id="clbox" class="feuille" hidden></div>
   <div class="edt-legend">${SIDS.map(id=>`<span><i class="sdot" style="background:${SUBJ[id].color}"></i>${SUBJ[id].name}</span>`).join("")}<span><i class="sdot" style="background:var(--graphite)"></i>cours</span><span><i class="sdot" style="background:var(--rouge)"></i>CC</span><span><i class="sdot mien"></i>ton créneau</span></div>
   <div class="edt-wrap"><div class="edt" style="grid-template-columns:44px repeat(${days.length},minmax(128px,1fr));min-width:${44+days.length*128}px"><div></div>${days.map(d=>{const k=sautes(d).length;return `<div class="edt-h${d===t0?" today":""}${d<t0?" past":""}">${dayName(d,true,true)}${k?`<button type="button" class="edt-saut" data-sautes="${d}">${k} ${k>1?"cours sautés":"cours sauté"}</button>`:HOLIDAY[d]?`<small>${HOLIDAY[d]==="11 novembre, férié"?"férié":"vacances"}</small>`:"<small>&nbsp;</small>"}</div>`;}).join("")}
    <div class="edt-hours" style="height:${(H1-H0)*PX}px">${hours}</div>${days.map(d=>`<div class="edt-col${HOLIDAY[d]?" hol":""}${d===t0?" today":""}${d<t0?" past":""}" data-day="${d}" data-ajuste style="height:${(H1-H0)*PX}px">${col(d)}</div>`).join("")}</div></div>
   <p class="muted" style="font-size:.9rem">L'emploi du temps vient de Prose (lu le 7 novembre, jusqu'au 18 décembre). Les heures de CC se modifient dans <a href="#/examens">Examens et coefficients</a> ; un CC qui n'a pas lieu s'y enlève aussi.</p></div>`;
  const box=$("#clbox"),M=$("#main").querySelector(".page");
  const ouvre=el=>{const[d,h]=el.dataset.cl.split("|"),c=coursJour(d).find(x=>x.start===h);if(!c)return;
    box.innerHTML=`<div><b>${c.name}</b>, ${dayName(d,true)} à ${h.replace(":","h")}, ${c.detail}.</div><div class="filters">${[["rev","Je n'y vais pas : je révise à la place"],["abs","Je n'y suis pas allé"],["","J'y vais (ou j'y suis allé)"]].map(([v,t])=>`<button class="btn" data-sk="${v}" aria-pressed="${c.skip===v}">${t}</button>`).join("")}</div>`;
    box.dataset.k=d+":"+h;poseBoite(box);};
  M.addEventListener("click",e=>{const s=e.target.closest("[data-sautes]");
    if(s){const d=s.dataset.sautes;box.innerHTML=`<div><b>Cours où tu ne vas pas</b>, ${dayName(d,true)}.</div><div class="filters">${sautes(d).map(c=>`<button class="btn" data-cl="${d}|${c.start}">${c.name}, ${hh(mm(c.start))} · ${c.skip==="abs"?"pas allé":"révision à la place"}</button>`).join("")}<button class="btn" data-sn="">Fermer</button></div>`;box.dataset.k="";poseBoite(box);return;}
    const el=e.target.closest("[data-cl]");if(el)ouvre(el);});
  M.addEventListener("keydown",e=>{const el=e.target.closest("[data-cl][role=button]");if(el&&(e.key==="Enter"||e.key===" ")){e.preventDefault();ouvre(el);}});
  box.addEventListener("click",e=>{const b=e.target.closest("[data-sk]");if(!b)return;emit({k:"set",key:"skip:"+box.dataset.k,v:b.dataset.sk||"go"});edt();});
  lierCren(M,box,PX,()=>H0,edt);lierSeances(M,box,edt);
  $("#edtnav").addEventListener("click",e=>{const b=e.target.closest("[data-w]");if(!b)return;const w=+b.dataset.w;EDTW=w===0?0:EDTW+w;edt();});
  ajuste(M);
  const tc=$(".edt-col.today");if(tc&&EDTW===0){const wr=$(".edt-wrap");wr.scrollLeft=Math.max(0,tc.offsetLeft-60);}
}

/* ---------- ses créneaux : bande violette sur la grille, boîte pour ajouter, changer les heures ou enlever ---------- */
const hhmm=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
/* jour : la page Aujourd'hui (heures écrites, « touche pour choisir ») ; sinon la semaine (« créneau libre ») ; rien d'écrit quand des séances le remplissent */
function cadreCren(c,P,top,h,jour){const fini=toD(c.day,c.b)<=NOW(),vide=!P.blocks.concat(P.rituels||[]).some(b=>b.day===c.day&&b.start<c.b&&b.end>c.a),
  q=[c.m?SUBJ[c.m].name:"",c.ty?TYN[c.ty].toLowerCase():"",c.w?"chaque "+JOURS[jourSem(c.day)]:""].filter(Boolean),qt=q.map(x=>" · "+x).join("");
  const lab=!vide?"":jour?`<i>ton créneau ${hh(c.a)}–${hh(c.b)}${qt}</i>${!fini&&c.ty!=="xb"?"<span>rien de prévu · touche pour choisir</span>":""}`:`<i>${c.ty?TYN[c.ty].toLowerCase():"créneau libre"}</i>`;
  return `<div class="ev mien" role="button" tabindex="0" data-cr="${c.id}|${c.day}" title="ton créneau${qt}, ${hh(c.a)}–${hh(c.b)}" style="top:${top}px;height:${h}px">${lab}</div>`;}
/* séances d'une même matière qui se suivent (25 min d'écart au plus) : une seule boîte sur la semaine */
function fusionSeances(L){const R=[];L.slice().sort((x,y)=>x.start-y.start).forEach(b=>{const p=R[R.length-1];if(p&&p.sid===b.sid&&b.start-p.b<=25){p.b=Math.max(p.b,b.end);p.L.push(b);}else R.push({sid:b.sid,a:b.start,b:b.end,L:[b]});});return R;}
/* après le dessin : une boîte trop petite perd sa deuxième ligne, puis grandit ; la suivante descend (jamais de mot coupé ni de boîtes l'une sur l'autre) */
function ajuste(root){root.querySelectorAll("[data-ajuste]").forEach(col=>{if(!col.offsetHeight)return;
  const L=[...col.querySelectorAll(":scope>.ch")].sort((a,b)=>a.offsetTop-b.offsetTop),deb=e=>e.scrollHeight>e.clientHeight+1;let bas=-99;
  L.forEach(e=>{let top=e.offsetTop;if(top<bas+2){top=bas+2;e.style.top=top+"px";}
    const l2=e.matches(".exam")?[]:[...e.querySelectorAll(".l2")];while(l2.length&&deb(e))l2.pop().style.display="none";
    if(deb(e))e.style.paddingTop=e.style.paddingBottom="1px";
    if(deb(e))e.style.height=e.scrollHeight+e.offsetHeight-e.clientHeight+"px";
    bas=top+e.offsetHeight;});
  if(bas+4>col.offsetHeight)col.style.height=bas+4+"px";});}
/* la boîte d'un créneau ou d'un cours : une feuille qui monte du bas au téléphone, une bulle à côté de ce qu'on a touché au PC */
let TOUCHE=null,AVALE=false;
const ouverte=()=>document.querySelector(".feuille:not([hidden])");
document.addEventListener("pointerdown",e=>{const b=ouverte(),t=e.target;
  if(b&&!b.contains(t)){if(!b.classList.contains("bulle")){b.hidden=true;AVALE=true;return;}if(!(t.closest&&t.closest(".ev,[data-cl],[data-cradd],[data-sautes],.libre,.edt-col,.jbody")))b.hidden=true;}
  const el=t.closest&&t.closest(".ev,.libre,[data-cradd],[data-sautes]");TOUCHE=el?{el,x:e.clientX,y:e.clientY}:{x:e.clientX,y:e.clientY};},true);
document.addEventListener("click",e=>{if(AVALE){AVALE=false;e.preventDefault();e.stopPropagation();return;}
  const el=e.target.closest&&e.target.closest(".ev,.libre,[data-cradd],[data-sautes]");if(el&&(!TOUCHE||TOUCHE.el!==el))TOUCHE={el,x:e.clientX,y:e.clientY};},true);
document.addEventListener("keydown",e=>{const b=ouverte();if(b&&e.key==="Escape")b.hidden=true;});
function poseBoite(box){
  AVALE=false;const pc=innerWidth>700;box.classList.add("feuille");box.classList.toggle("bulle",pc);box.style.left=box.style.top="";box.hidden=false;
  if(!pc){box.scrollTop=0;return;}
  const W=innerWidth,H=innerHeight,w=box.offsetWidth,h=box.offsetHeight,T=TOUCHE||{x:W/2,y:H/3};
  const r=T.el&&T.el.isConnected&&!T.el.matches(".edt-col,.jbody")?T.el.getBoundingClientRect():{left:T.x,right:T.x,top:T.y,bottom:T.y};
  let x=r.right+10,y=r.top;
  if(x+w>W-12)x=r.left-10-w;
  if(x<12){x=Math.max(12,Math.min(W-w-12,r.left));y=r.bottom+8;}
  if(y+h>H-12)y=Math.max(12,H-h-12);
  const o=(box.offsetParent||document.body).getBoundingClientRect();box.style.left=x-o.left+"px";box.style.top=y-o.top+"px";}
let AJT=0;addEventListener("resize",()=>{const b=ouverte();if(b)poseBoite(b);clearTimeout(AJT);AJT=setTimeout(()=>{const m=$("#main");if(m)ajuste(m);},200);});
function boiteCren(box,o,refresh){
  const id=o.id,c=id?hub.cren[id]:null,jr=d=>JOURS[jourSem(d)];let day=o.day,rep=0,ty=(c&&c.ty)||"",mt=(c&&c.m&&SUBJ[c.m]?c.m:"");
  const a0=c?c.a:hhmm(o.a),b0=c?c.b:hhmm(Math.min(o.a+120,23*60));
  const heures=`<input type="time" step="900" data-f="a" value="${a0}" aria-label="début"><span aria-hidden="true">→</span><input type="time" step="900" data-f="b" value="${b0}" aria-label="fin">`;
  const types=`<p class="crnote"><b>Type</b></p><div class="filters">${[["","Le site choisit"]].concat(Object.entries(TYN)).map(([v,n])=>`<button class="btn" data-ty="${v}" aria-pressed="${v===ty}">${n}</button>`).join("")}</div>`;
  const mats=`<p class="crnote"><b>Matière</b></p><div class="filters">${[["","Toutes les matières"]].concat(SIDS.filter(s=>s===mt||examStart(SUBJ[s])>NOW()).map(s=>[s,SUBJ[s].name])).map(([v,n])=>`<button class="btn" data-mt="${v}" aria-pressed="${v===mt}">${n}</button>`).join("")}</div>`;
  const lien=ty==="xb"?`<a class="btn pri" href="#/entrainer/examen/une">Commencer l'examen blanc</a>`:ty==="exos"?`<a class="btn" href="#/entrainer">Ouvrir S'entraîner</a>`:ty==="cours"?`<a class="btn" href="#/apprendre">Ouvrir Apprendre</a>`:"";
  box.innerHTML=c?`<div><b>Ton créneau</b>, ${c.w?"chaque "+jr(day):dayName(day,false)}</div>
    <div class="crrow">${heures}</div>${c.w?`<p class="crnote muted">Les nouvelles heures valent pour tous les ${jr(day)}s.</p>`:""}
    ${types}${mats}<div class="filters">${lien}<button class="btn${lien?"":" pri"}" data-cr="heures">Enregistrer</button><button class="btn" data-cr="non">Fermer</button><span class="crfin">${c.w?`<button class="btn rouge" data-cr="sauf">Enlever ce ${jr(day)}</button><button class="btn rouge" data-cr="tout">Enlever tous les ${jr(day)}s</button>`:`<button class="btn rouge" data-cr="tout">Enlever</button>`}</span></div><p class="crmsg"></p>`
   :`<div><b>Ajouter un créneau de révision</b></div>
    <div class="crrow"><label>Jour <input type="date" data-f="d" value="${day}" min="${today()}"></label></div><div class="crrow">${heures}</div>
    <div class="filters"><button class="btn" data-rep="0" aria-pressed="true">Une fois</button><button class="btn" data-rep="1" aria-pressed="false">Chaque ${jr(day)}</button></div>
    ${types}${mats}
    <div class="filters"><button class="btn pri" data-cr="ajout">Ajouter</button><button class="btn" data-cr="non">Annuler</button></div><p class="crmsg"></p>`;
  box.dataset.k="";
  const val=f=>{const i=box.querySelector(`[data-f="${f}"]`);return i?i.value:"";},msg=box.querySelector(".crmsg");
  const verif=()=>{const a=val("a"),b=val("b");if(!c){day=val("d");if(!/^\d{4}-\d\d-\d\d$/.test(day))return{err:"Choisis un jour."};if(day<today())return{err:"Ce jour est passé."};}
    if(!/^\d\d:\d\d$/.test(a)||!/^\d\d:\d\d$/.test(b))return{err:"Choisis les deux heures."};
    const A=mm(a),B=mm(b);if(A<7*60+30||B>23*60)return{err:"Choisis des heures entre 7h30 et 23h."};if(B-A<30)return{err:"Un créneau dure au moins 30 min."};
    const autre=creneauxDu(day).find(s=>s.id!==id&&A<s.b&&B>s.a);if(autre)return{err:`Tu as déjà un créneau de ${hh(autre.a)} à ${hh(autre.b)} ce jour-là : clique dessus pour changer ses heures.`};
    const cours=(CLASSES[day]||[]).filter(k=>!estCC(day,k)&&mm(k[0])<B&&mm(k[1])>A&&hub.skip[day+":"+k[0]]!=="go"&&hub.skip[day+":"+k[0]]!=="abs").map(k=>`${k[2]} (${hh(mm(k[0]))})`);
    const cc=epreuvesDu(day).filter(({e})=>mm(e.start)<B&&mm(e.end||e.start)+10>A).map(({S,e})=>`${e.label||"CC"} ${/^[aeiouéèh]/i.test(S.name)?"d'":"de "}${S.name} à ${hh(mm(e.start))}`);
    return{a,b,info:[cours.length?`Pendant ce créneau, tu as cours : ${cours.join(", ")}. ${cours.length>1?"Ces cours deviennent":"Ce cours devient"} « je révise à la place » (clique dessus si tu y vas quand même).`:"",cc.length?`Ton ${cc.join(", ")} reste à part : pas de révision pendant l'épreuve.`:""].filter(Boolean).join(" ")};};
  const montre=()=>{const r=verif();msg.textContent=r.err||r.info||"";msg.classList.toggle("r",!!r.err);return r;};
  box.querySelectorAll("input").forEach(i=>i.addEventListener("input",()=>{if(!c&&i.dataset.f==="d"&&val("d"))box.querySelector('[data-rep="1"]').textContent="Chaque "+jr(val("d"));montre();}));
  box.querySelectorAll("[data-rep]").forEach(b=>b.addEventListener("click",()=>{rep=+b.dataset.rep;box.querySelectorAll("[data-rep]").forEach(x=>x.setAttribute("aria-pressed",String(+x.dataset.rep===rep)));}));
  box.querySelectorAll("[data-ty]").forEach(b=>b.addEventListener("click",()=>{ty=b.dataset.ty;box.querySelectorAll("[data-ty]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    if(c){emit({k:"set",key:"cren:"+id,v:Object.assign({},c,{ty})});box.hidden=true;refresh();}}));
  box.querySelectorAll("[data-mt]").forEach(b=>b.addEventListener("click",()=>{mt=b.dataset.mt;box.querySelectorAll("[data-mt]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    if(c){const v=Object.assign({},c);if(mt)v.m=mt;else delete v.m;emit({k:"set",key:"cren:"+id,v});box.hidden=true;refresh();}}));
  box.querySelectorAll("[data-cr]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.cr;
    if(k==="non"){box.hidden=true;return;}
    if(k==="ajout"||k==="heures"){const r=montre();if(r.err)return;
      if(k==="ajout")emit({k:"set",key:"cren:"+nouvRun(),v:Object.assign(rep?{d:day,a:r.a,b:r.b,w:1}:{d:day,a:r.a,b:r.b},ty?{ty}:{},mt?{m:mt}:{})});
      else emit({k:"set",key:"cren:"+id,v:Object.assign({},c,{a:r.a,b:r.b})});}
    else if(k==="sauf")emit({k:"set",key:"cren:"+id,v:Object.assign({},c,{x:(c.x||[]).concat(day)})});
    else if(k==="tout")emit({k:"set",key:"cren:"+id,v:""});
    box.hidden=true;refresh();}));
  poseBoite(box);if(!c)montre();
}
/* l'échelle repliée de la page Aujourd'hui, « a:b:haut:px » par morceau (px = 0 : plage repliée), lue à l'envers */
const minDe=(Y,y)=>{let t=0;for(const m of Y.split(",")){const[a,b,o,px]=m.split(":").map(Number);if(y<o)break;t=px?Math.min(b,a+(y-o)/px):a;}return t;};
/* clic dans un trou d'une colonne (data-day) ou sur une ligne « libre » = ajouter ; clic sur un cadre = changer ou enlever */
function lierCren(root,box,PX,h0De,refresh){
  root.querySelectorAll(".edt-col[data-day],.jbody[data-day]").forEach(col=>col.addEventListener("click",e=>{const lb=e.target.closest(".libre");if(e.target!==col&&!(lb&&!e.target.closest("[data-cl]")))return;const d=col.dataset.day;if(d<today())return;
    const m=Math.round((lb?+lb.dataset.a:col.dataset.y?minDe(col.dataset.y,e.offsetY):h0De(col)+e.offsetY/PX)/15)*15;boiteCren(box,{day:d,a:Math.min(Math.max(m,8*60),21*60)},refresh);}));
  root.querySelectorAll(".ev.mien").forEach(el=>{const go=()=>{const[id,d]=el.dataset.cr.split("|");if(hub.cren[id])boiteCren(box,{id,day:d},refresh);};
    el.addEventListener("click",e=>{if(e.target.closest(".ev")!==el)return;go();});el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});});
}
/* clic sur une séance placée par le site = la boîte pour l'ouvrir ou l'enlever ; clic sur une séance enlevée = la remettre */
const fantome=(d,a,b,cls,pos)=>`<div class="ev sans${cls}" role="button" tabindex="0" data-sans="${d}|${a}|${b}" style="${pos}"><b>Révision</b><span>${hh(a)}–${hh(b)}, enlevée</span></div>`;
function lierSeances(root,box,refresh){
  const montre=h=>{box.innerHTML=h;box.dataset.k="";poseBoite(box);},quand=(d,a,b)=>`${dayName(d,true)}, de ${hh(+a)} à ${hh(+b)}`;
  /* une séance : l'ouvrir, l'enlever, changer sa matière hors de tes créneaux ; les cours qu'elle remplace peuvent revenir */
  const une=(d,a,b,sid,href,go)=>{const hors=!creneauxDu(d).some(s=>+a>=s.a&&+a<s.b),mt=smatDe(d,+a),kx=smatK(d,+a),ck=kx||d+":"+a,cb=kx?hub.smat[kx].b:b,n=NOW(),
      K=coursJour(d).filter(c=>c.skip&&mm(c.start)<+b&&mm(c.end)>+a),fini=c=>d<today()||(d===today()&&mm(c.end)<=n.getHours()*60+n.getMinutes());
    montre(`<div><b>${SUBJ[sid].name}</b>, ${quand(d,a,b)}.</div><div class="filters"><a class="btn" href="${href}">${go}</a>${hors?`<button class="btn" data-chm>Changer de matière</button>`:""}<button class="btn" data-sn="${d}:${a}" data-v="${b}">Enlever ce créneau</button><button class="btn" data-sn="">Fermer</button></div>${K.length?`<div class="filters">${K.map(c=>`<button class="btn" data-va="${d}:${c.start}">${fini(c)?"J'y suis allé":"J'y vais quand même"} : ${c.name} (${hh(mm(c.start))})</button>`).join("")}</div>`:""}${hors?`<div data-mats hidden><p class="crnote"><b>Matière</b></p><div class="filters">${[["","Toutes les matières"]].concat(SIDS.filter(s=>s===mt||examStart(SUBJ[s])>NOW()).map(s=>[s,SUBJ[s].name])).map(([v,n])=>`<button class="btn" data-sm="${v}" data-k="${ck}" data-b="${cb}" aria-pressed="${v===mt}">${n}</button>`).join("")}</div></div>`:""}`);};
  root.querySelectorAll("a.ev.rev[data-rv]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();const[d,a,b,sid]=el.dataset.rv.split("|");une(d,a,b,sid,el.getAttribute("href"),el.dataset.go);}));
  /* séances réunies sur la semaine : la liste, puis la boîte de celle qu'on touche */
  root.querySelectorAll("a.ev.rev[data-rvs]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();const L=el.dataset.rvs.split(";").map(x=>x.split("|")),d=L[0][0],sid=L[0][3];
    montre(`<div><b>${SUBJ[sid].name}</b>, ${quand(d,L[0][1],L[L.length-1][2])} : ${L.length} séances.</div><div class="filters">${L.map(([,a,b,,f])=>+f?`<a class="btn" href="#/${sid}">${hh(+a)}–${hh(+b)}, fait</a>`:`<button class="btn" data-une="${d}|${a}|${b}|${sid}">${hh(+a)}–${hh(+b)}</button>`).join("")}<button class="btn" data-sn="">Fermer</button></div>`);}));
  root.querySelectorAll(".ev.sans").forEach(el=>{const go=()=>{const[d,a,b]=el.dataset.sans.split("|");
      montre(`<div><b>Révision enlevée</b>, ${quand(d,a,b)}.</div><div class="filters"><button class="btn" data-sn="${d}:${a}" data-v="">Remettre ce créneau</button><button class="btn" data-sn="">Fermer</button></div>`);};
    el.addEventListener("click",go);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});});
  box.addEventListener("click",e=>{const c=e.target.closest("[data-chm]"),m=e.target.closest("[data-sm]"),u=e.target.closest("[data-une]"),v=e.target.closest("[data-va]");
    if(u){const[d,a,b,sid]=u.dataset.une.split("|");une(d,a,b,sid,"#/"+sid,"Ouvrir la matière");return;}
    if(v){box.hidden=true;emit({k:"set",key:"skip:"+v.dataset.va,v:"go"});refresh();return;}
    if(c){const z=box.querySelector("[data-mats]");if(z){z.hidden=!z.hidden;c.setAttribute("aria-pressed",String(!z.hidden));}return;}
    if(m){box.hidden=true;emit({k:"set",key:"smat:"+m.dataset.k,v:m.dataset.sm?{m:m.dataset.sm,b:+m.dataset.b}:""});refresh();return;}
    const b=e.target.closest("[data-sn]");if(!b)return;box.hidden=true;if(!b.dataset.sn)return;emit({k:"set",key:"sans:"+b.dataset.sn,v:b.dataset.v?+b.dataset.v:""});refresh();});
}

/* ---------- examens et coefficients ---------- */
/* d'où vient chaque date d'épreuve (le champ src d'une épreuve, dans le fichier de sa matière, passe avant) */
const SRC={"algo.cc1":"mail de ton chargé de TD du 5/11.",
  "algo.cc2":"mail du responsable de l'UE du 24/9, « Dates des contrôles continus d'algo 1 » : « CC2 : créneau de TD entre le jeudi 26/11 et le mercredi 2/12 ». Ton TD d'Algo est le jeudi : le jour est déduit, l'heure n'est pas donnée. Le même mail annonçait le CC1 mi-octobre et il a eu lieu le 12/11 : demande à ton chargé de TD si le 26 tient toujours.",
  "algo.cc3":"le même mail du 24/9 : « CC3 : entre le lundi 14/12 et le vendredi 18/12 ». Le jour et l'heure sont supposés.",
  "ana.cc1":"annonce de l'enseignante sur le forum Moodle, le 9/11.","calc.cc2":"mail de l'enseignant du 6/11.","geo.cc2":"mail du 27/10.",
  "lin.cc1":"mail du prof du 11/11 ; le lieu, mail du 18/11.","rai.cc2":"mail du 3/11.","pf.ct":"date supposée, pas encore officielle.","aut.exam":"date supposée, pas encore officielle.","usi.exam":"date supposée, pas encore officielle."};
const srcDe=(S,e)=>e.src||SRC[S.id+"."+e.id]||"pas encore notée sur le site.";
function examens(){
  const n0=NOW(),caseNote=(S,x)=>x&&(x.past||x.hors)?`<br><label class="manote">Ma note<br><input type="text" inputmode="decimal" size="4" data-note="${S.id}.${x.id}" value="${x.n!=null?fr(x.n):""}" aria-label="Ma note, ${x.label}, ${S.name}, sur 20"> sur 20</label>`:"";
  const rows=SIDS.map(id=>{const S=SUBJ[id],L=examsOf(S),E=epreuves(id),plus=E.filter(x=>x.i<0);return L.map((x,i)=>{const e=examAt(S,i),past=toD(e.day,mm(e.end||e.start))<=n0,sh=e.share!=null?e.share:S.share;
    const off=!past&&(e.off||L.some((y,j)=>j!==i&&!examAt(S,j).off));
    return `<tr${past||e.off?' class="muted"':""}>${i===0?`<td rowspan="${L.length+plus.length}"><i class="sdot" style="background:${S.color}"></i> ${S.name}<br><span class="muted">${S.code} · coef ${S.coef}</span></td>`:""}<td><b>${e.label}</b>${past?"<br>passé":e.off?"<br>enlevé du planning":e.report?"<br>reporté, date à venir : tape la nouvelle date":""}${caseNote(S,E.find(y=>y.i===i))}</td><td><input type="date" value="${e.report?"":e.day}" data-ex="${examKey(S,i)}:day"> <input type="time" value="${e.start}" data-ex="${examKey(S,i)}:start"><br><span class="muted"><span class="nf">${e.place}</span>, ${e.dur}</span>${e.unsure?`<br><span class="r">${e.unsure}</span>`:""}${past?"":`<br><span class="muted">Source de la date : ${srcDe(S,e)}</span>`}${off?`<br><button class="btn" data-exoff="${examKey(S,i)}" aria-pressed="${!!e.off}">Cette épreuve n'a pas lieu</button>`:""}</td><td>${Math.round(sh*100)} %</td><td><b>${String((S.coef*sh).toFixed(2)).replace(".",",")}</b></td><td>${e.docs||S.docs}</td></tr>`;}).join("")+plus.map(x=>`<tr class="muted"><td><b>${x.label}</b>${caseNote(S,x)}</td><td>${x.hors||"date pas encore publiée"}</td><td>${pct(x.w)}</td><td><b>${String((S.coef*x.w).toFixed(2)).replace(".",",")}</b></td><td></td></tr>`).join("");}).join("");
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Examens et coefficients</h1></div>
   <p class="lead">D'après le document officiel des modalités de contrôle 2026-2027 et les pages Moodle. Le poids d'un CC dans ta moyenne du semestre, c'est le coefficient de la matière multiplié par la part de ce CC dans sa note.</p>
   <section class="check" id="bilan">${bilanHTML()}</section>
   <div style="overflow-x:auto"><table class="tbl fiches" id="extbl"><thead><tr><th>Matière</th><th>Épreuve</th><th>Date et heure</th><th>Part de la note</th><th>Poids</th><th>Documents</th></tr></thead><tbody>${rows}</tbody></table></div>
   <section class="check"><h2 style="font-size:1.1rem">Ton rythme de révision</h2><p class="muted">Le temps de révision prévu au maximum par jour. Le plan se recalcule tout de suite.</p><div class="filters" id="ry">${[["leger","Léger : 3 h de travail les jours libres, 1 h 30 les jours de cours"],["normal","Normal : 4 h 30 et 2 h 30"],["intensif","Intensif : 6 h et 3 h 30"]].map(r=>`<button class="btn" data-ry="${r[0]}" aria-pressed="${(hub.rythme||"normal")===r[0]}">${r[1]}</button>`).join("")}</div><p class="muted" id="ryout"></p><p class="muted" style="font-size:.9rem">Sans compter les pauses : 15 min au milieu de chaque séance de plus d'une heure, et 20 min entre deux séances.</p></section>
   <section class="check"><h2 style="font-size:1.1rem">Ta vitesse</h2><p class="muted">Combien de fois plus de temps qu'indiqué au départ une leçon te prend. Par défaut, le site la mesure sur tes leçons (pause comprise jusqu'à 20 min par écran). Tu peux la fixer toi-même si la mesure te semble fausse.</p><div class="filters" id="vi">${[["auto",(SIDS.some(id=>measured(id)==="mesuré")?"Mesurée : ×":"Automatique (estimée pour l'instant) : ×")+String(factor().toFixed(1)).replace(".",",")],["2","×2"],["3","×3"],["4","×4"],["5","×5"]].map(r=>`<button class="btn" data-vi="${r[0]}" aria-pressed="${(hub.vitesse||"auto")===r[0]}">${r[1]}</button>`).join("")}</div></section>
   <section class="usage"><h2>Ce que ça change</h2><p>Les coefficients ne sont pas tous égaux : l'algorithmique et la programmation fonctionnelle (coef 5) pèsent plus que la géométrie (coef 4) et le calculus (coef 3). Le planificateur s'en sert pour départager deux matières aussi urgentes, et pour choisir quoi laisser tomber s'il manque du temps.</p><p>Si une heure de CC change, corrige-la dans le tableau : le plan se recalcule tout seul. Si un CC n'a pas lieu, appuie sur « Cette épreuve n'a pas lieu » sous sa date : ses révisions passent au CC suivant de la matière. Le même bouton le remet.</p><p>Tes notes comptent aussi : tape-les dans la case « Ma note » d'une épreuve passée. Quand un CC1 s'efface par la seconde chance, les épreuves qui restent pèsent plus dans le planning, et une matière où il te faut plus de 10 passe devant.</p></section>
    <section class="usage"><h2>Seconde chance : ce qui se rattrape</h2><p>D'après les modalités de contrôle 2026-2027 de la double licence (document officiel du 11 septembre 2026).</p>
    <p><b>Géométrie et Calculus</b> (contrôle continu intégral) : la note est aussi calculée sans le CC1, avec « la moyenne des N−1 dernières épreuves », c'est-à-dire le CC2 et l'épreuve finale. Un CC1 raté se rattrape donc en entier avec les deux épreuves qui restent.</p>
    <p><b>Algorithmique 1</b> (contrôle continu intégral) : la note est aussi calculée sans l'épreuve à 32 %, avec « la moyenne des N−1 épreuves les plus coefficientées ». Le document ne dit pas laquelle des trois épreuves est à 32 % : le site suppose que c'est le CC1.</p>
    <p><b>Raisonnement</b> : le CC1 a été neutralisé (mail du 3 novembre). Il reste le CC2 (55 %) et les exercices en ligne (45 %, clos le 2 octobre).</p>
    <p><b>Algèbre, Analyse et Prog. fonctionnelle</b> (contrôle continu et examen) : chaque CC compte dans la note de première session. La seconde chance est un examen écrit de 2 h en seconde session (du 10 au 30 juin). Le document ne dit pas si les notes de CC y sont gardées.</p>
    <p><b>USI et Automates</b> (examen seul) : la seconde chance est un examen de la même durée en seconde session.</p>
    <p><b>Compensation</b> : le document marque l'année et les semestres « non compensables », et chacun des deux blocs « compensable » : le bloc maths (coefficients 19 au premier semestre, 18 au second) et le bloc informatique (17 et 14). Les matières se compensent donc à l'intérieur d'un bloc, sur l'année, et il te faut la moyenne dans chacun des deux.</p>
    <p class="muted">Ce que le document ne dit pas en toutes lettres : que la meilleure des deux notes est gardée (c'est le principe d'une seconde chance), et si la moyenne de la seconde chance est simple ou pondérée. À confirmer auprès des enseignants.</p></section></div>`;
  {const t=$("#extbl"),H=[...t.tHead.rows[0].cells].map(x=>x.textContent);let mat="";
    [...t.tBodies[0].rows].forEach(r=>{const C=[...r.cells],d=H.length-C.length;C.forEach((c,i)=>{if(i+d)c.dataset.label=H[i+d];});
      if(d)r.insertAdjacentHTML("afterbegin",`<td class="mat-rappel" aria-hidden="true">${mat}</td>`);else mat=C[0].innerHTML.split("<br>")[0];});}
  const ryOut=()=>{const P=plan(),tot=P.blocks.reduce((s,b)=>s+work(b.end-b.start),0),nb=Object.values(P.bonus).reduce((s,L)=>s+L.length,0);$("#ryout").textContent=`Avec ce rythme et cette vitesse : ${hm(tot)} de travail prévues jusqu'au dernier CC. Il faudrait ${hm(P.need||0)} pour l'essentiel (leçons et un examen blanc par matière)${nb?` : ${nb} étape(s) restent facultatives, faute de temps`:""}.`;};ryOut();
  $("#ry").addEventListener("click",e=>{const b=e.target.closest("[data-ry]");if(!b)return;emit({k:"set",key:"rythme",v:b.dataset.ry});document.querySelectorAll("#ry [data-ry]").forEach(x=>x.setAttribute("aria-pressed",x===b));ryOut();});
  $("#vi").addEventListener("click",e=>{const b=e.target.closest("[data-vi]");if(!b)return;emit({k:"set",key:"vitesse",v:b.dataset.vi});document.querySelectorAll("#vi [data-vi]").forEach(x=>x.setAttribute("aria-pressed",x===b));ryOut();});
  $("#bilan").addEventListener("click",e=>{const a=e.target.closest("[data-vers]");if(!a)return;e.preventDefault();const i=$(`#extbl [data-note="${a.dataset.vers}"]`);if(!i)return;
    i.scrollIntoView({block:"center"});i.focus({preventScroll:true});i.select();});
  $("#extbl").addEventListener("change",e=>{const c=e.target.dataset.note;if(!c)return;const t=e.target.value.trim().replace(",","."),v=t===""?"":+t,old=hub.notes[c];
    if(v!==""&&!(v>=0&&v<=20)){e.target.value=old!=null?fr(old):"";e.target.classList.add("faux");return;}
    e.target.classList.remove("faux");if(v!==(old!=null?old:"")){emit({k:"set",key:"note:"+c,v});ryOut();}e.target.value=v===""?"":fr(v);$("#bilan").innerHTML=bilanHTML();topInfo();renderSide();});
  $("#extbl").addEventListener("change",e=>{const k=e.target.dataset.ex;if(!k)return;const[id,f]=k.split(":");emit({k:"set",key:"exam:"+id+":"+f,v:e.target.value});topInfo();renderSide();});
  $("#extbl").addEventListener("click",e=>{const b=e.target.closest("[data-exoff]");if(!b)return;emit({k:"set",key:"exam:"+b.dataset.exoff+":off",v:b.getAttribute("aria-pressed")==="true"?"":"1"});examens();topInfo();renderSide();});
}

/* ---------- accueil d'une matière ---------- */
function subjHome(sid){
  const S=SUBJ[sid],P=plan(),t0=today(),e=exam(S),st=ST[sid];
  const mine=P.blocks.filter(b=>b.sid===sid);const days=[...new Set(mine.map(b=>b.day))];
  const bon=(P.bonus[sid]||[]).filter(id=>!isDone(sid,S.TB[id]));
  const done=S.tasks.filter(t=>isDone(sid,t));
  const planned=new Set(mine.flatMap(b=>b.tasks));const orphan=S.tasks.filter(t=>!isDone(sid,t)&&!planned.has(t.id)&&!bon.includes(t.id)&&!t.cache);
  let body=sec(1,"Ton programme",(days.length?days.map(d=>`<h3 style="margin-top:4px">${dayName(d,true)}${d===t0?" (aujourd'hui)":""}</h3>${mine.filter(b=>b.day===d).map(b=>blockHTML(b,d===t0)).join("")}`).join(""):`<p class="muted">Aucun créneau prévu pour cette matière${examStart(S)<NOW()?" : le CC est passé.":"."}</p>`)+(orphan.length?`<details class="day"><summary><b>Pas encore placé</b><span>${orphan.length} étape(s)</span></summary><ol class="todo" style="padding:0 12px 12px">${orphan.map(t=>taskHTML(sid,t,false)).join("")}</ol></details>`:""));
  let k=2;
  if(bon.length)body+=sec(k++,"Si tu as encore du temps",`<ol class="todo">${bon.map(id=>taskHTML(sid,S.TB[id],false)).join("")}</ol>`);
  if(done.length)body+=sec(k++,"Déjà fait",`<details class="day"><summary><b>${done.length} étape(s) terminée(s)</b><span>clique pour voir</span></summary><ol class="todo" style="padding:0 12px 12px">${done.map(t=>taskHTML(sid,t,false)).join("")}</ol></details>`);
  $("#main").innerHTML=`<div class="page"><div class="today-h"><h1>${S.name}</h1><span class="muted">${S.code}</span></div>
   <div class="examcard" style="--sc:${S.color}"><div><b>${exW(S)} ${quandEp(e)}</b>${e.report?"":` (${jx(S)})`}, <span class="nf">${e.place}</span>, ${e.dur}.${e.unsure?` <span class="r">${e.unsure}</span>`:""} <span class="muted">Source de la date : ${srcDe(S,e)}</span></div><div class="muted">${e.prog||S.prog}</div><div class="muted">Documents : ${e.docs||S.docs}. Coef ${S.coef}, ${exW(S)==="CC"?"ce CC":"cet examen"} compte pour ${Math.round((e.share!=null?e.share:S.share)*100)} % de la note.</div></div>
   ${carteNotes(sid)}
   ${body}</div>`;
  bindTicks($("#main"),()=>subjHome(sid));fixLinks($("#main"),sid);
}

/* ---------- fiche et démo ---------- */
function head(S,c){return `<div class="crumb"><a href="#/${S.id}">${S.name}</a> › ${S.chapters[c.ch]}</div><div class="title-row"><h1>${c.t}</h1><div class="badges">${badges(S,c)}<span id="pill">${pill(S.id,c.id)}</span></div></div>`;}
function pager(S,c){const i=S.ORDER.indexOf(c),p=S.ORDER[i-1],n=S.ORDER[i+1];return `<nav class="pager">${p?`<a href="#/${S.id}/c/${p.id}"><small>Précédent</small>${p.t}</a>`:"<span></span>"}${n?`<a href="#/${S.id}/c/${n.id}" style="text-align:right"><small>Suivant</small>${n.t}</a>`:`<a href="#/${S.id}" style="text-align:right"><small>Ensuite</small>Retour au plan de la matière</a>`}</nav>`;}
function related(S,c){if(!c.rel||!c.rel.length)return "";const L=c.rel.map(id=>{if(S.BY[id])return chip(S.id,id);if(id==="td")return `<a class="chip" href="#/${S.id}/td">${S.tdTitle||"Exercices de TD"}</a>`;const pg=id.startsWith("p/")&&S.pages.find(x=>x.id===id.slice(2));return pg?`<a class="chip" href="#/${S.id}/${id}">${pg.t}</a>`:"";}).join("");return `<div class="related"><span class="muted">Voir aussi :</span> ${L}</div>`;}
function concept(sid,c){
  const S=SUBJ[sid],st=ST[sid];if(!st.seen[c.id])emit({k:"st",s:sid,c:c.id,v:"seen"});
  if(c.type==="demo")return demo(sid,c);
  const main=$("#main");
  main.innerHTML=`<article class="page">${head(S,c)}
   ${c.out?`<div class="outnote">${c.out===true?"D'après ce que tu m'as dit, ce chapitre ne devrait pas tomber à ce CC. Lis-le seulement s'il te reste du temps.":c.out}</div>`:""}${c.maybe?`<div class="outnote">${c.maybe}</div>`:""}
   <div class="pretest"><b>Teste-toi d'abord :</b> ${c.q} <span class="muted">Cherche la réponse 30 secondes avant de lire, même si tu ne la connais pas : chercher fait mieux retenir ce que tu lis ensuite. La réponse est en partie 4.</span></div>
   ${sec(1,"Comprendre",`<p class="lead">${c.plain}</p><div class="figs" style="display:grid;gap:14px"></div>`)}
   ${sec(2,"Ce que dit le cours",`<div class="cours"><span class="ref">${c.ref}</span>${c.formal}${c.gloss?`<div class="gloss">${c.gloss.map(g=>`<span>${g}</span>`).join("")}</div>`:""}</div>`)}
   ${sec(3,exW(S)==="CC"?"Au CC":"À l'examen",`${c.use?`<div class="usage"><h2>Comment t'en servir</h2>${c.use}</div>`:""}${c.trap?`<div class="piege"><h2>Le piège</h2><p>${c.trap}</p></div>`:""}${related(S,c)}`)}
   ${sec(4,"Vérifie-toi",`<div class="check"><p class="q">${c.q}</p><button class="btn" data-rev>Voir la réponse</button><div class="a" hidden>${c.a}</div><p class="muted" style="font-size:.9rem">Réponds de mémoire, sans remonter, puis regarde la réponse. Marque « Je sais » seulement si tu avais trouvé : la fiche reviendra demain dans « Révision du jour ». Sinon « À revoir » : elle passe en rouge.</p>${knowBtns(sid,c.id)}</div>`)}
   ${pager(S,c)}</article>`;
  mount(main.querySelector(".figs"),c);
  const chk=main.querySelector(".check");chk.querySelector("[data-rev]").addEventListener("click",e=>{const a=chk.querySelector(".a");a.hidden=!a.hidden;e.target.textContent=a.hidden?"Voir la réponse":"Cacher la réponse";});
  bindKnow(chk,sid,c.id);fixLinks(main,sid);
}
function demo(sid,c){
  const S=SUBJ[sid],main=$("#main"),n=c.steps.length;let k=0;
  main.innerHTML=`<article class="page">${head(S,c)}
   ${sec(1,"Ce qu'on démontre",`<p class="lead">${c.plain}</p><div class="goal"><b>On suppose</b><span>${c.hyp}</span><b>On montre</b><span>${c.concl}</span></div><p class="idea"><b>L'idée :</b> ${c.idea}</p>${c.explore?`<p class="muted">D'abord, observe :</p><div class="explore"></div>`:""}`)}
   ${sec(2,"La preuve, étape par étape",`<div class="figs"></div><div class="stepnav"><button class="btn" id="sp">Étape précédente</button><button class="btn pri" id="sn">Étape suivante</button><span class="muted" id="sc"></span></div><ol class="steps">${c.steps.map((s,i)=>`<li data-i="${i}" tabindex="0"><div class="w"><span>${s.w}</span><span class="why">${s.why}</span></div></li>`).join("")}</ol>`)}
   ${sec(3,"La preuve rédigée, à savoir refaire",`<div class="redac">${c.redac}</div>${related(S,c)}`)}
   ${sec(4,"Vérifie-toi",`<div class="check"><p class="q">Cache la preuve, prends une feuille et réécris-la. Tu y arrives sans regarder ?</p>${knowBtns(sid,c.id,"Je sais la refaire")}</div>`)}
   ${pager(S,c)}</article>`;
  if(c.explore)mount(main.querySelector(".explore"),c,"explore");
  const figs=mount(main.querySelector(".figs"),c);const lis=[...main.querySelectorAll(".steps li")];
  function show(){lis.forEach((li,i)=>{li.className=i<k?"done":i===k?"cur":"later";});figs.forEach(F=>F.setStep(k));$("#sc").textContent=`Étape ${k+1} sur ${n}`;$("#sp").disabled=k===0;$("#sn").disabled=k===n-1;}
  $("#sp").addEventListener("click",()=>{if(k>0){k--;show();}});$("#sn").addEventListener("click",()=>{if(k<n-1){k++;show();}});
  lis.forEach(li=>{li.addEventListener("click",()=>{k=+li.dataset.i;show();});li.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();k=+li.dataset.i;show();}});});
  show();bindKnow(main.querySelector(".check"),sid,c.id,"Je sais la refaire");fixLinks(main,sid);
}

/* ---------- cartes ---------- */
let deck=[],di=0,flip=false,dfilter="todo";
const enBref=(t,c)=>{t=t.trim();let r=t;if(!c){const m=t.match(/^(.+?[.!?])\s+(.+)$/s);if(!m)return `<p class="lead">${t}</p>`;c=m[1];r=m[2];}
  return `<details class="lead-plus"><summary><span>${c}</span> <span class="voir-plus">En savoir plus</span></summary><p class="lead">${r}</p></details>`;};
function cards(sid,f){
  const S=SUBJ[sid];if(f)dfilter=f;else if(!["todo","due","rouge","all"].includes(dfilter))dfilter="todo";
  const types=[...new Set(S.ORDER.map(c=>c.type))];
  const FIL=[["todo","Pas encore sues"],["due","Révision du jour"],["rouge","En rouge"],["all","Toutes"]].concat(types.map(t=>[t,(TYPE[t]||[t])[0]+"s"]));
  const build=()=>{deck=S.ORDER.filter(c=>dfilter==="all"||(dfilter==="todo"?!ST[sid].known[c.id]&&!c.out:dfilter==="due"?ST[sid].review[c.id]||(ST[sid].known[c.id]&&(ST[sid].knownOn[c.id]||"")<today()):dfilter==="rouge"?ST[sid].review[c.id]:c.type===dfilter&&!c.out));di=0;flip=false;};build();
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Cartes de révision</h1></div>${enBref(`Lis le titre, réponds de mémoire (à voix haute ou sur une feuille), puis retourne la carte. « Révision du jour » ressort les cartes en rouge et celles que tu savais hier ou avant : les revoir à quelques jours d'écart les fait tenir jusqu'au CC. Raccourcis : espace pour retourner, 1 pour « Je sais », 2 pour « À revoir ».`,"Réponds de mémoire, puis retourne la carte.")}
   <details class="filtre"><summary class="btn">Filtrer : <span id="ffcur">${((FIL.find(x=>x[0]===dfilter)||FIL[0])[1]).toLowerCase()}</span> ▾</summary><div class="filters" id="ff">${FIL.map(x=>`<button class="btn" data-f="${x[0]}" aria-pressed="${x[0]===dfilter}">${x[1]}</button>`).join("")}<button class="btn" id="shuf">Mélanger</button></div></details><div id="card"></div></div>`;
  $("#ff").addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(b){dfilter=b.dataset.f;document.querySelectorAll("#ff [data-f]").forEach(x=>x.setAttribute("aria-pressed",x===b));$("#ffcur").textContent=b.textContent.toLowerCase();b.closest("details").open=false;build();drawCard(sid);}});
  $("#shuf").addEventListener("click",()=>{for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}di=0;flip=false;drawCard(sid);});
  drawCard(sid);
}
function drawCard(sid){
  const S=SUBJ[sid],box=$("#card");if(!box)return;
  if(!deck.length){box.innerHTML=`<div class="fc"><p class="front">Aucune carte ici.</p><p>${dfilter==="rouge"?"Aucune fiche en rouge. Le bouton « À revoir » met une fiche en rouge.":dfilter==="todo"?"Toutes les fiches sont sues. Passe au quiz ou aux annales.":dfilter==="due"?"Rien à revoir aujourd'hui. Une fiche que tu marques « Je sais » revient le lendemain : c'est en la retrouvant de mémoire quelques jours de suite qu'on la retient.":"Choisis un autre filtre."}</p></div>`;return;}
  if(di>=deck.length){const r=deck.filter(c=>ST[sid].review[c.id]).length;box.innerHTML=`<div class="fc"><p class="front">Paquet terminé.</p><p>${r?`${r} carte(s) en rouge dans ce paquet.`:"Aucune carte en rouge dans ce paquet."}</p><div class="acts"><button class="btn pri" id="again">Recommencer</button>${r?`<a class="btn rev" href="#/${sid}/cartes/rouge">Revoir les cartes en rouge</a>`:""}</div></div>`;$("#again").addEventListener("click",()=>cards(sid,dfilter));return;}
  const c=deck[di];
  box.innerHTML=`<div class="fc"><span class="muted">Carte ${di+1} sur ${deck.length}. ${(TYPE[c.type]||["Fiche"])[0]}, ${c.ref} ${pill(sid,c.id)}</span><p class="front">${c.t}</p>
   ${flip?`<div class="verso"><p>${c.type==="demo"?`<b>Énoncé :</b> si ${c.hyp.replace(/\.$/,"")}, alors ${c.concl.charAt(0).toLowerCase()+c.concl.slice(1)}</p><p><b>L'idée :</b> ${c.idea}`:c.plain}</p>${c.type==="demo"?"":`<div class="cours" style="border-left-width:3px">${c.formal}</div>`}<p><a href="#/${sid}/c/${c.id}">Ouvrir la fiche complète</a></p></div>`:""}
   <div class="acts fc-acts">${flip?`<button class="btn ok" data-k="1">Je sais (1)</button><button class="btn rev" data-k="0">À revoir (2)</button>`:`<button class="btn pri" data-flip>Retourner (espace)</button>`}</div></div>`;
  box.querySelector("[data-flip]")?.addEventListener("click",()=>{flip=true;drawCard(sid);});
  box.querySelectorAll("[data-k]").forEach(b=>b.addEventListener("click",()=>cardAnswer(sid,b.dataset.k==="1")));fixLinks(box,sid);
}
function cardAnswer(sid,ok){const c=deck[di];setStatus(sid,c.id,ok?"known":"review");di++;flip=false;drawCard(sid);renderSide();}
document.addEventListener("keydown",e=>{if(!CUR.sid||!CUR.page.startsWith("cartes")||(e.target.closest&&e.target.closest("input,textarea,button,select")))return;if(e.key===" "&&!flip&&deck[di]){e.preventDefault();flip=true;drawCard(CUR.sid);}else if(flip&&(e.key==="1"||e.key==="2"))cardAnswer(CUR.sid,e.key==="1");});

/* ---------- quiz ---------- */
let qOrder=[],qi=0,qScore=0,qAns=null,qPerm={},qMiss=[],qT0=0,qRepris=false;
let qS={run:null};
/* les réponses changent de place à chaque passage : on ne peut pas retenir « c'est la deuxième » */
const perm=n=>{const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
/* à la fin d'un quiz : la liste des erreurs, avec la bonne réponse et l'explication */
const missHTML=L=>L.length?`<h2 style="font-size:1.15rem;margin:8px 0 0">Tes erreurs (${L.length})</h2><p class="muted" style="margin:0">Relis chaque correction, puis recommence : les réponses changent de place à chaque fois.</p>${L.map(m=>`<div class="expl no"><p class="qtxt" style="font-size:1rem;margin:0 0 4px">${m.q.q}</p>${m.q.code?W.code(m.q.code,m.q.lang||SUBJ[m.sid].lang):""}<p style="margin:0"><span class="r">Ta réponse : ${m.q.o[m.a]}</span><br><span style="color:var(--vert);font-weight:700">La bonne réponse : ${m.q.o[m.q.a]}</span></p><p class="muted" style="margin:4px 0 0">${m.q.e||""}${m.q.link&&SUBJ[m.sid].BY[m.q.link]?` <a href="#/${m.sid}/c/${m.q.link}">Voir la fiche</a>`:""}</p></div>`).join("")}`:"";
function quiz(sid,neuf){
  const S=SUBJ[sid],tq=S.tasks.find(t=>t.quiz),goal=tq?quizGoal(S,tq):null;
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Quiz de cours</h1></div>${enBref(`${S.quizIntro||"Des questions dans le style des questions de cours du CC."}${goal?` Objectif du plan : au moins ${goal} sur ${activeQuiz(S).length}.`:""}`)}<div class="qbox" id="qbox" aria-live="polite"></div></div>`;
  qOrder=S.quiz.map((_,i)=>i).filter(i=>activeQuiz(S).includes(S.quiz[i]));for(let i=qOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qOrder[i],qOrder[j]]=[qOrder[j],qOrder[i]];}qi=0;qScore=0;qAns=null;qPerm={};qMiss=[];qRepris=false;qS={run:nouvRun()};
  if(APP.ext.sync)APP.ext.sync();
  if(neuf===true)seanceFin("quiz:"+sid);
  const sv=neuf===true?null:seanceGet("quiz:"+sid);
  if(sv&&Array.isArray(sv.q)){const idx=sv.q.map(x=>S.quiz.findIndex(y=>hq(y)===x.k));
    if(idx.length&&idx.every(i=>i>=0)){const nb=Math.min(faites(sv),idx.length);qOrder=idx;qi=nb;qS={run:sv.run,debute:true};
      sv.q.forEach((x,j)=>{if(Array.isArray(x.p)&&x.p.length===S.quiz[idx[j]].o.length)qPerm[idx[j]]=x.p;});
      for(let j=0;j<nb;j++){const qq=S.quiz[idx[j]],r=sv.rep[j];if(r===qq.a)qScore++;else qMiss.push({sid,q:qq,a:r});}
      qRepris=nb>0&&nb<idx.length;}}
  drawQ(sid);
  $("#qbox").addEventListener("click",e=>{const o=e.target.closest("[data-o]");if(o&&qAns===null){qAns=+o.dataset.o;const qq=S.quiz[qOrder[qi]];
      if(qq.link)emit({k:"qr",s:sid,c:qq.link,ok:qAns===qq.a?1:0});
      logRep(Object.assign({o:"quiz de cours",s:sid,fiche:qq.link||null,ok:qAns===qq.a?1:0,ms:Date.now()-(qT0||Date.now())},repQ(qq,qAns)));
      if(qAns===qq.a)qScore++;else{qMiss.push({sid,q:qq,a:qAns});emit({k:"qm",s:sid,q:hq(qq),c:qq.link||null,o:"quiz"});if(qq.link&&S.BY[qq.link]){setStatus(sid,qq.link,"review");renderSide();}}seanceRep("quiz:"+sid,qS,()=>qOrder.map(i=>({k:hq(S.quiz[i]),p:qPerm[i]||null})),qi,qAns);drawQ(sid);$("#qn")?.focus();return;}const id=e.target.closest("button")?.id;if(id==="qn"){qi++;qAns=null;qRepris=false;drawQ(sid);}if(id==="qre"||id==="qnew")quiz(sid,true);});
}
function drawQ(sid){
  const S=SUBJ[sid],Q=S.quiz,n=qOrder.length,box=$("#qbox"),st=ST[sid],tq=S.tasks.find(t=>t.quiz),goal=tq?quizGoal(S,tq):n;
  if(qi>=n){if(qScore>st.best)emit({k:"quiz",s:sid,n:qScore,goal:qScore>=goal});seanceFin("quiz:"+sid,qS.run);box.innerHTML=`<p class="muted">Résultat</p><p class="score">${qScore} sur ${n}</p><p>${qScore>=goal?"Objectif atteint : l'étape « Quiz » de ton plan est cochée.":"Relis tes erreurs ci-dessous, puis recommence."}</p><button class="btn pri" id="qre" style="justify-self:start">Recommencer</button>${missHTML(qMiss)}`;return;}
  const q=Q[qOrder[qi]],ord=qPerm[qOrder[qi]]||(qPerm[qOrder[qi]]=perm(q.o.length));if(qAns===null)qT0=Date.now();
  box.innerHTML=`<p class="muted">Question ${qi+1} sur ${n}. Score : ${qScore}${qRepris?REPRISE+` · <button type="button" class="linkbtn" id="qnew">recommencer</button>`:""}</p><div class="bar"><i style="width:${qi/n*100}%;background:var(--cobalt)"></i></div><p class="qtxt">${q.q}</p>${q.code?W.code(q.code,q.lang||S.lang):""}
   <div class="opts">${ord.map(i=>{const o=q.o[i];let c="";if(qAns!==null){if(i===q.a)c="good";else if(i===qAns)c="bad";}return `<button data-o="${i}" class="${c}" ${qAns!==null?"disabled":""}>${o}</button>`;}).join("")}</div>
   ${qAns!==null?`<div class="expl${qAns===q.a?"":" no"}"><b>${qAns===q.a?"Exact.":"Non."}</b> ${q.e}${q.link?` <a href="#/${sid}/c/${q.link}">Voir la fiche</a>`:""}${qAns===q.a?"":motsHTML(sid,q)}</div><button class="btn pri" id="qn" style="justify-self:start">${qi<n-1?"Question suivante":"Voir le score"}</button>`:""}`;
  motsClic(sid,box.querySelector(".qtxt"));
}

/* ---------- TD ---------- */
let tdf="all";
function td(sid){
  const S=SUBJ[sid];
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>${S.tdTitle||"Exercices de TD"}</h1></div>${enBref(S.tdIntro||"Cherche sur papier avant d'ouvrir l'indice, puis le corrigé.")}
   ${S.tdBox||""}<div class="filters" id="tdf">${[["all","Tous"],["3","★★★ seulement"],["todo","Pas encore sus"]].map(x=>`<button class="btn" data-f="${x[0]}" aria-pressed="${x[0]===tdf}">${x[1]}</button>`).join("")}</div><div id="tdl" style="display:grid;gap:10px"></div></div>`;
  const draw=()=>{const st=ST[sid];const L=S.td.filter(x=>tdf==="all"||(tdf==="3"?x.s===3&&!x.out:!st.td[x.id]&&!x.out));
    $("#tdl").innerHTML=L.length?L.map(x=>{const k=!!st.td[x.id],n=S.td.indexOf(x);return `<details class="ex"><summary><span><span class="sub">${S.tdPrefix||"TD"} ${x.id}, ${"★".repeat(x.s)}${x.note?", "+x.note:""}${x.out?`, <span class="r">${x.out===true?"pas au CC1":x.out}</span>`:""}${x.paper?", sur papier":""}<span class="tdst">${k?", su":""}</span></span><br><span class="h">${x.t}</span></span></summary>
     <div class="body"><div class="enon">${x.en}</div>${x.idea?`<p class="idea" style="font-size:1rem"><b>L'idée :</b> ${x.idea}</p>`:""}${x.link?`<p><a class="btn" href="#/${sid}/c/${x.link}">Voir la fiche</a></p>`:""}
     ${x.hint?`<div><button class="btn" data-rv="th${n}" data-l="Voir l'indice">Voir l'indice</button><div class="sol" id="th${n}" hidden style="margin-top:8px">${x.hint}</div></div>`:""}
     <div><button class="btn" data-rv="ts${n}" data-l="Voir le corrigé">Voir le corrigé</button><div class="sol" id="ts${n}" hidden style="margin-top:8px">${x.who?`<span class="who">${x.who}</span>`:""}${x.sol}</div></div>
     <button class="btn${k?" ok":""}" data-tk="${x.id}" style="justify-self:start">${k?"✓ Je sais le faire":"Je sais le faire"}</button></div></details>`;}).join(""):`<p class="muted">Rien à afficher avec ce filtre.</p>`;fixLinks($("#tdl"),sid);};
  $("#tdf").addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(!b)return;tdf=b.dataset.f;document.querySelectorAll("#tdf [data-f]").forEach(x=>x.setAttribute("aria-pressed",x===b));draw();});
  $("#tdl").addEventListener("click",e=>{const r=e.target.closest("[data-rv]");if(r){const el=document.getElementById(r.dataset.rv);el.hidden=!el.hidden;r.textContent=el.hidden?r.dataset.l:"Masquer";return;}
    const b=e.target.closest("[data-tk]");if(!b)return;const st=ST[sid],id=b.dataset.tk;emit({k:"td",s:sid,x:id,v:!st.td[id]});const k=!!st.td[id];b.className="btn"+(k?" ok":"");b.textContent=k?"✓ Je sais le faire":"Je sais le faire";const m=b.closest("details").querySelector(".tdst");if(m)m.textContent=k?", su":"";});
  draw();fixLinks($("#main"),sid);
}

/* ---------- annales ---------- */
let tm={left:3600,end:0,int:null,warn:false,len:60};
/* les annales rangées par sujet : « Sujet blanc A (liste du prof, 1 h) · Ex. 1 · 4 points » va dans le bloc « Sujet blanc A ».
   La coche d'un sujet est celle de son étape du plan quand il en a une (champ suj de l'étape, sinon titre qui commence par le nom du sujet) */
const sansBal=s=>String(s).replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();
function sujetsDe(sid){
  const S=SUBJ[sid],G=[],by={};
  annOf(S).forEach(x=>{const seg=String(x.src).split(" · "),m=seg[0].match(/^(.*?)\s*\(([^()]*)\)\s*$/),nom=m?m[1]:seg[0],cle=sansBal(nom);
    let g=by[cle];if(!g){g=by[cle]={cle,nom,det:"",id:"suj:"+cle,ex:[]};G.push(g);}
    if(m&&!g.det)g.det=m[2];g.ex.push({x,lab:seg.slice(1).join(" · ")});});
  S.tasks.filter(t=>t.manual&&(t.links||[]).some(l=>l[0]==="annales")).forEach(t=>{const tt=strip(t.t);let best=null;
    G.forEach(g=>{const c=strip(g.cle),ok=t.suj?sansBal(t.suj)===g.cle:tt.indexOf(c)===0&&!/[a-z0-9]/.test(tt.charAt(c.length));if(ok&&(!best||g.cle.length>best.cle.length))best=g;});
    if(best)best.id=t.id;});
  return G;
}
function annales(sid){
  const S=SUBJ[sid],len=S.examMinutes||60;if(tm.len!==len&&!tm.int)tm={left:len*60,end:0,int:null,warn:false,len};
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Annales et examen blanc</h1></div>${enBref(`Fais un sujet en temps réel, puis corrige-toi. ${S.annIntro||""} Coche ensuite le sujet que tu as fait : s'il est dans ton plan, l'étape se coche aussi.`)}
   <section class="check"><h2 style="font-size:1.1rem">Chrono de ${len} minutes</h2><p class="muted">${S.docs?`Documents autorisés ${exW(S)==="CC"?"au CC":"à l'examen"} : ${S.docs}.`:""} Ne regarde aucun corrigé avant la fin.</p><div class="timer"><span class="score" id="tm"></span><button class="btn pri" id="tmgo">Lancer</button><button class="btn" id="tmre">Remettre à zéro</button><span class="muted" id="tmmsg" aria-live="polite"></span></div></section>
   <div id="ann" style="display:grid;gap:16px"></div></div>`;
  const AN=annOf(S),plus=S.ann.length-AN.length,G=sujetsDe(sid),st=ST[sid];let i=-1;
  const carte=({x,lab})=>(i++,`<details class="ex"><summary><span>${lab?`<span class="sub">${lab}</span><br>`:""}<span class="h">${x.t}</span></span></summary><div class="body"><div class="enon">${x.en}</div>
   ${x.go?`<p><a class="btn pri" href="#/${sid}/c/${x.go}">Ouvrir la fiche</a></p>`:""}
   ${x.hint?`<div><button class="btn" data-rv="h${i}" data-l="Voir l'indice">Voir l'indice</button><div class="sol" id="h${i}" hidden style="margin-top:8px">${x.hint}</div></div>`:""}
   ${x.sol?`<div><button class="btn" data-rv="s${i}" data-l="Voir le corrigé">Voir le corrigé</button><div class="sol" id="s${i}" hidden style="margin-top:8px"><span class="who">${x.who||"Corrigé du prof, réécrit"}</span>${x.sol}</div></div>`:""}</div></details>`);
  $("#ann").innerHTML=G.map((g,k)=>{const f=!!st.tasks[g.id],nb=g.ex.length;
    return `<section class="suj${f?" done":""}"><div class="suj__head"><button class="tick" data-suj="${k}" aria-pressed="${f}" title="Coche ce sujet quand tu l'as fait" aria-label="J'ai fait ce sujet : ${sansBal(g.nom)}">${f?"✓":""}</button><div><h2 class="tt">${g.nom}</h2><div class="meta">${g.det?g.det+" · ":""}${nb} énoncé${nb>1?"s":""}</div></div></div>${g.ex.map(carte).join("")}</section>`;}).join("")+(plus?`<p class="muted">${plus} autre(s) sujet(s) portent sur les chapitres des épreuves suivantes : ils apparaîtront ici après ${exW(S)==="CC"?"ce CC":"cette épreuve"}.</p>`:"");
  $("#ann").addEventListener("click",e=>{const c=e.target.closest("[data-suj]");
    if(c){const g=G[+c.dataset.suj];emit({k:"task",s:sid,x:g.id,v:!ST[sid].tasks[g.id]});const f=!!ST[sid].tasks[g.id];c.textContent=f?"✓":"";c.setAttribute("aria-pressed",f);c.closest(".suj").classList.toggle("done",f);renderSide();return;}
    const r=e.target.closest("[data-rv]");if(!r)return;const el=document.getElementById(r.dataset.rv);el.hidden=!el.hidden;r.textContent=el.hidden?r.dataset.l:"Masquer";});
  const show=()=>{const s=Math.max(0,Math.ceil(tm.left));const el=$("#tm");if(!el)return;el.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");el.classList.toggle("end",s===0);};
  const tick=()=>{tm.left=(tm.end-Date.now())/1000;const msg=$("#tmmsg");if(!tm.warn&&tm.left<=600&&tm.left>0){tm.warn=true;if(msg)msg.textContent="Plus que 10 minutes : gardes-en 5 pour relire.";}if(tm.left<=0){tm.left=0;clearInterval(tm.int);tm.int=null;if(msg)msg.textContent="Temps écoulé : pose le stylo et corrige-toi.";if($("#tmgo"))$("#tmgo").textContent="Lancer";}show();};
  $("#tmgo").addEventListener("click",()=>{if(tm.int){clearInterval(tm.int);tm.int=null;tm.left=(tm.end-Date.now())/1000;$("#tmgo").textContent="Reprendre";$("#tmmsg").textContent="En pause.";}else if(tm.left>0){tm.end=Date.now()+tm.left*1000;tm.int=setInterval(tick,250);$("#tmgo").textContent="Pause";$("#tmmsg").textContent="";}show();});
  $("#tmre").addEventListener("click",()=>{clearInterval(tm.int);tm={left:len*60,end:0,int:null,warn:false,len};$("#tmgo").textContent="Lancer";$("#tmmsg").textContent="";show();});
  if(tm.int)$("#tmgo").textContent="Pause";show();fixLinks($("#main"),sid);
}

/* ---------- où j'en suis : ce que je pense maîtriser, mini-contrôle, priorités ---------- */
let DG=null;
const NIV=["Pas compris","Moyen","Maîtrisé"];
const demi=x=>String(Math.round(x*2)/2).replace(".",",");
const nbQ=T=>T.pts>=4?3:T.pts>=2?2:T.pts>=1?1:0;/* rien sur un thème qui ne tombe presque jamais */
function diagPool(sid,T){const S=SUBJ[sid],out=[];S.quiz.forEach(q=>{if(q.link&&q.diag!==false&&(T.fiches||[]).includes(q.link))out.push(q);});
  (T.les||[]).forEach(l=>{const L=(LES[sid]||[]).find(x=>x.id===l);if(L)L.steps.forEach(s=>{if(s.k==="qcm"&&s.diag!==false&&!/ci-dessus|précédent|Dans la preuve|Avec l'invariant|l'exemple|^Et /i.test(s.q)&&(s.code||!/écran|Dans cet|Avec ces|Avec cette|Avec ce /i.test(s.q)))out.push(s);});});
  /* une question de leçon qui s'appuie sur l'écran d'avant (une fonction du TD, « Et pour n = 3 ? ») porte diag:false et ctx:true : hors de sa leçon, on ne peut pas y répondre (ni mini-contrôle, ni carte). diag:false seul : doublon d'une question du quiz, écarté du mini-contrôle seulement */
  /* pas deux questions presque identiques (le quiz et une leçon posent parfois la même) : même code, et textes qui se recouvrent */
  const gr=q=>{const s=strip(q.q).replace(/[^a-z0-9]/g,""),g=new Set();for(let i=0;i+4<=s.length;i++)g.add(s.slice(i,i+4));return g;},garde=[],vus=[];
  out.forEach(q=>{const g=gr(q);if(vus.some(v=>{if((v.q.code||"")!==(q.code||""))return false;if(strip(v.q.q)===strip(q.q))return true;let k=0;g.forEach(x=>{if(v.g.has(x))k++;});return k/Math.max(1,g.size+v.g.size-k)>=0.4;}))return;garde.push(q);vus.push({q,g});});return garde;}
function niveau(sid){
  if(APP.ext.sync&&(!DG||DG.sid!==sid))APP.ext.sync();
  const S=SUBJ[sid],TH=themesOf(S),st=ST[sid],X=exW(S)==="CC"?"CC":"examen";
  const carte=T=>{const d=st.diag[T.id]||{},s=d.self!=null?d.self:T.self0,g=gainTheme(sid,T),pr=prioDe(sid,T);
    return `<section class="check"><div><b>${T.t}</b> <span class="muted">· environ ${demi(T.pts)} point(s) sur 20 au ${X}${T.src?` (${T.src})`:""}</span></div>
     <div class="filters" data-th="${T.id}">${NIV.map((n,i)=>`<button class="btn" data-self="${i}" aria-pressed="${s===i}">${n}</button>`).join("")}</div>
     <div class="muted">${d.self==null&&T.self0!=null?(T.self0src||"Coché d'après ce que tu m'as dit")+" : change-le si c'est faux. ":""}Tes réponses récentes sur ce thème (mini-contrôles, quiz, cartes, erreurs en leçon) : ${d.n?`${Math.round(d.ok/d.n*100)} % justes, la dernière ${dayName(d.on,false,true)}`:"aucune pour l'instant"}. Leçons faites : ${(T.les||[]).filter(l=>st.les[l]&&st.les[l].n).length} sur ${(T.les||[]).length}. Reste à gagner : environ <b>${demi(g)}</b> point(s). ${pr==null?"":pr===1?`<b>En priorité dans ton planning.</b>`:"Passe en « si tu as le temps »."}</div></section>`;};
  const nq=TH.reduce((s,T)=>s+Math.min(diagPool(sid,T).length,nbQ(T)),0);
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Où j'en suis</h1></div>
   ${enBref(`Dis ce que tu penses maîtriser, puis fais le mini-contrôle. Le planning met en avant les thèmes où il te reste le plus de points à gagner, et range en « si tu as le temps » ce que tu sais déjà.`)}
   <h2 style="font-size:1.15rem;margin:0">1. Ce que je pense maîtriser</h2><p class="muted" style="margin:0">Les thèmes sont rangés par points qu'il te reste à gagner. Les points viennent du barème des anciens sujets.</p>
   ${TH.slice().sort((x,y)=>gainTheme(sid,y)-gainTheme(sid,x)).map(carte).join("")}
   <h2 style="font-size:1.15rem;margin:0">2. Mini-contrôle</h2>
   <section class="check"><p class="muted">${nq} questions, environ ${Math.max(3,Math.round(nq*0.6))} minutes. Plus un thème rapporte de points, plus il a de questions. Si tu ne sais pas, dis-le : deviner fausse le résultat. Plus tu réponds à des questions d'un thème, plus elles comptent face à ce que tu as coché. Tes réponses ailleurs comptent aussi : <a href="#/mix">mini-contrôle mélangé</a>, quiz de cours, cartes de « Réviser », questions ratées dans les leçons. Une réponse ancienne compte moins qu'une récente.</p><div class="qbox" id="dq" aria-live="polite"><button class="btn pri" id="dgo" style="justify-self:start">${TH.some(T=>(st.diag[T.id]||{}).tn)?"Refaire le mini-contrôle":"Commencer le mini-contrôle"}</button></div></section>
   <section class="usage"><h2>Comment c'est calculé</h2><p>Pour chaque thème : points au ${X} × ce que tu ne maîtrises pas encore = points à gagner. Un thème maîtrisé, ou qui rapporte moins d'un demi-point, passe en « si tu as le temps ». Entre deux matières, celle où il te reste le plus à gagner reçoit plus de temps.</p><p><a class="btn pri" href="#/">Voir mon planning</a></p></section></div>`;
  $("#main .page").addEventListener("click",e=>{
    const b=e.target.closest("[data-self]");if(b){const th=b.parentNode.dataset.th,T=TH.find(x=>x.id===th),sc=b.closest(".check");emit({k:"diag",s:sid,th,self:+b.dataset.self});
      sc.insertAdjacentHTML("afterend",carte(T));sc.remove();const nb=$(`#main [data-th="${th}"] [data-self="${b.dataset.self}"]`);if(nb)nb.focus();renderSide();return;}
    if(e.target.closest("#dgo")){const L=[];TH.forEach(T=>{const P=diagPool(sid,T);perm(P.length).slice(0,Math.min(P.length,nbQ(T))).forEach(i=>L.push({th:T.id,q:P[i]}));});
      DG={sid,L:perm(L.length).map(i=>L[i]),i:0,ans:null,ok:0,ord:{},run:nouvRun()};diagDraw();return;}
    if(e.target.closest("#dgnew")){seanceFin("niv:"+sid);DG=null;niveau(sid);return;}
    if(!DG)return;
    const o=e.target.closest("[data-o]"),ns=e.target.closest("#dqs");
    if((o||ns)&&DG.ans===null){const it=DG.L[DG.i];DG.ans=o?+o.dataset.o:-1;if(DG.ans===it.q.a)DG.ok++;
      emit({k:"diag",s:DG.sid,th:it.th,ok:DG.ans===it.q.a?1:0,n:1,run:DG.run});
      logRep(Object.assign({o:"mini-contrôle de la matière",s:DG.sid,th:it.th,fiche:it.q.link||null,ok:DG.ans===it.q.a?1:0,ms:Date.now()-(DG.t0||Date.now())},repQ(it.q,DG.ans)));seanceRep("niv:"+DG.sid,DG,()=>DG.L.map(x=>({th:x.th,k:hq(x.q)})),DG.i,DG.ans);diagDraw();const nx=$("#dqn");if(nx)nx.focus();return;}
    if(e.target.closest("#dqn")){DG.i++;DG.ans=null;DG.repris=false;diagDraw();}});
  if(DG&&DG.sid===sid)diagDraw();
  else{DG=null;const sv=seanceGet("niv:"+sid);
    if(sv&&Array.isArray(sv.q)){const L=sv.q.map(x=>{const q=trouveQ(sid,x.k);return q?{th:x.th,q}:null;});
      if(L.length&&L.every(Boolean)){const nb=Math.min(faites(sv),L.length);let ok=0;for(let j=0;j<nb;j++)if(sv.rep[j]===L[j].q.a)ok++;
        DG={sid,L,i:nb,ans:null,ok,ord:{},run:sv.run,debute:true,repris:nb>0&&nb<L.length};diagDraw();}}}
}
function diagDraw(){
  const D=DG,S=SUBJ[D.sid],box=$("#dq"),n=D.L.length;if(!box)return;
  if(D.i>=n){const ok=D.ok;seanceFin("niv:"+D.sid,D.run);DG=null;niveau(D.sid);renderSide();
    const b=$("#dq");if(b)b.insertAdjacentHTML("afterbegin",`<p><b>Mini-contrôle fait : ${ok} sur ${n}.</b> Les thèmes au-dessus sont rangés avec tes résultats, et ton planning est refait.</p>`);return;}
  const q=D.L[D.i].q,ord=D.ord[D.i]||(D.ord[D.i]=perm(q.o.length));if(D.ans===null)D.t0=Date.now();
  box.innerHTML=`<p class="muted">Question ${D.i+1} sur ${n}${D.repris?REPRISE+` · <button type="button" class="linkbtn" id="dgnew">recommencer</button>`:""}</p><div class="bar"><i style="width:${D.i/n*100}%;background:var(--cobalt)"></i></div><p class="qtxt">${q.q}</p>${q.code?W.code(q.code,q.lang||S.lang):""}
   <div class="opts">${ord.map(i=>{let c="";if(D.ans!==null){if(i===q.a)c="good";else if(i===D.ans)c="bad";}return `<button data-o="${i}" class="${c}" ${D.ans!==null?"disabled":""}>${q.o[i]}</button>`;}).join("")}</div>
   ${D.ans!==null?`<div class="expl${D.ans===q.a?"":" no"}"><b>${D.ans===q.a?"Exact.":D.ans===-1?"La réponse :":"Non."}</b> ${D.ans===-1?q.o[q.a]+". ":""}${q.e||""}${D.ans===q.a?"":motsHTML(D.sid,q)}</div><button class="btn pri" id="dqn" style="justify-self:start">${D.i<n-1?"Question suivante":"Voir le résultat"}</button>`:`<button class="btn" id="dqs" style="justify-self:start">Je ne sais pas</button>`}`;
  motsClic(D.sid,box.querySelector(".qtxt"));
}

/* ---------- pages propres à une matière ---------- */
function page(sid,pid){const S=SUBJ[sid],p=S.pages.find(x=>x.id===pid);if(!p)return subjHome(sid);
  if(p.render){$("#main").innerHTML=`<div class="page" id="pg"></div>`;p.render($("#pg"),{sid,S,st:ST[sid],sec});}
  else $("#main").innerHTML=`<div class="page">${typeof p.html==="function"?p.html({S,sec,exam:exam(S)}):p.html}</div>`;
  fixLinks($("#main"),sid);}

/* ---------- mini-contrôle mélangé : toutes les matières, questions choisies par thème, chaque réponse met « Où j'en suis » à jour ---------- */
/* Une séance en cours (mini-contrôle, quiz, cartes) vit dans le journal, donc elle suit la synchronisation : on la reprend
   à la même question, sur n'importe quel appareil, tant que la dernière réponse a moins de 6 heures (passer minuit ne change
   rien). Son début n'est écrit qu'à la première réponse : ouvrir la page ne remplace pas une séance commencée ailleurs. */
const seanceGet=k=>{const s=hub.se[k];return s&&NOW().getTime()-s.ts<6*3600e3?s:null;};
const seanceRep=(k,o,debut,i,rep)=>{if(!o.debute){emit({k:"sd",c:k,run:o.run,q:debut()});o.debute=true;}emit({k:"sr",c:k,run:o.run,n:i,a:rep});};/* « i » est pris par l'identifiant de l'événement */
const seanceFin=(k,run)=>{const s=hub.se[k];if(s&&(run==null||s.run===run))emit({k:"sf",c:k,run:s.run});};
const faites=s=>{let n=0;while(s.rep[n]!=null)n++;return n;};
const nouvRun=()=>(Date.now()+TOFF).toString(36)+Math.random().toString(36).slice(2,5);
/* après une synchronisation : une séance commencée sur un autre appareil vient d'arriver, et on n'a pas encore répondu ici */
function seanceArrivee(){const p=CUR.page,sid=CUR.sid;
  if(p==="mix"){const s=seanceGet("mix");if(s&&!mx.debute&&s.run!==mx.run)mix();}
  else if(p==="quiz"){const s=seanceGet("quiz:"+sid);if(s&&!qS.debute&&s.run!==qS.run)quiz(sid);}
  else if(p==="niveau"){const s=seanceGet("niv:"+sid);if(s&&(!DG||(!DG.debute&&s.run!==DG.run))){DG=null;niveau(sid);}}}
function trouveQ(sid,cle){const S=SUBJ[sid];if(!S)return null;let q=S.quiz.find(x=>hq(x)===cle);if(q)return q;
  for(const L of LES[sid]||[]){q=L.steps.find(s=>s.k==="qcm"&&hq(s)===cle);if(q)return q;}return null;}
const REPRISE=`<span class="muted"> · tu reprends où tu t'étais arrêté</span>`;
let mx={q:[],i:0,score:0,ans:null};
const mixDebut=()=>mx.q.map(it=>({sid:it.sid,th:it.th||null,k:hq(it.q),ord:it.ord}));
function mix(neuf){
  if(APP.ext.sync)APP.ext.sync();
  if(neuf===true)seanceFin("mix");
  const sv=neuf===true?null:seanceGet("mix");
  if(sv&&Array.isArray(sv.q)){const Q0=sv.q.map(x=>{const q=trouveQ(x.sid,x.k);return q&&Array.isArray(x.ord)&&x.ord.length===q.o.length?{sid:x.sid,th:x.th||undefined,q,ord:x.ord}:null;});
    if(Q0.length&&Q0.every(Boolean)){const nb=Math.min(faites(sv),Q0.length);mx={q:Q0,i:nb,score:0,ans:null,miss:[],par:{},run:sv.run,debute:true,repris:nb>0&&nb<Q0.length};
      for(let j=0;j<nb;j++){const it=Q0[j],r=sv.rep[j],p=mx.par[it.sid]||(mx.par[it.sid]={ok:0,n:0});p.n++;if(r===it.q.a){mx.score++;p.ok++;}else if(r>=0)mx.miss.push({sid:it.sid,q:it.q,a:r});}
      return mixPage();}}
  const n=NOW(),t0=today(),jr=id=>(examStart(SUBJ[id])-n)/864e5,act=SIDS.filter(id=>examStart(SUBJ[id])>n).sort((x,y)=>jr(x)-jr(y));
  /* poids d'un thème : poids du CC, proximité, points du thème, ce qui n'est pas maîtrisé, ancienneté du dernier test */
  const pool=[];act.forEach(id=>{const S=SUBJ[id],st=ST[id],j=jr(id),u=weight(S)*4/(1+j)*(j<=21?1:0.3),TH=themesOf(S);
    if(TH.length)TH.forEach(T=>{const d=st.diag[T.id]||{},m=maitrise(id,T),age=d.ton?(toD(t0,0)-toD(d.ton,0))/864e5:9,P=diagPool(id,T);if(!P.length||T.pts<1)return;/* pas de question sur un thème qui ne tombe presque jamais */
      if(window.ENT&&ENT.couvre&&ENT.couvre(id,T.id))return;/* thème déjà travaillé à l'entraînement : son exercice à taper est dans l'entretien du jour */
      const w=u*Math.max(T.pts,0.5)*(1.5-(m==null?0.5:m))*(1+Math.min(1,age/3))/P.length;P.forEach(q=>pool.push({sid:id,th:T.id,q,w}));});
    else{const Q=activeQuiz(S),w0=q=>!q.link?1:st.review[q.link]?4:st.known[q.link]?1:2,tot=Q.reduce((s,q)=>s+w0(q),0);Q.forEach(q=>pool.push({sid:id,q,w:u*20*w0(q)/tot}));}});
  const pick=[],vu={};
  const tire=L=>{let t=Math.random()*L.reduce((s,x)=>s+x.w,0),k=0;for(;k<L.length-1;k++){t-=L[k].w;if(t<=0)break;}const it=L[k];pick.push(it);
    if(it.th)vu[it.sid+"/"+it.th]=(vu[it.sid+"/"+it.th]||0)+1;
    for(let i=pool.length-1;i>=0;i--){const x=pool[i];if(x.q===it.q||(it.th&&x.sid===it.sid&&x.th===it.th&&vu[it.sid+"/"+it.th]>=2))pool.splice(i,1);}};
  /* d'abord une question par matière dont le CC est à moins de 3 semaines, puis le reste au poids */
  act.forEach(id=>{if(pick.length>=12||jr(id)>21)return;const L=pool.filter(x=>x.sid===id);if(L.length)tire(L);});
  while(pick.length<12&&pool.length)tire(pool);
  const Q=perm(pick.length).map(i=>pick[i]);Q.forEach(it=>{it.ord=perm(it.q.o.length);});
  mx={q:Q,i:0,score:0,ans:null,miss:[],par:{},run:nouvRun()};mixPage();}
function mixPage(){const Q=mx.q;
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Mini-contrôle mélangé</h1></div>${enBref(`${Q.length} questions de toutes tes matières : surtout les CC les plus proches, les thèmes qui valent le plus de points et ceux que tu n'as pas testés depuis longtemps. Chaque réponse met à jour « Où j'en suis » dans sa matière, et le planning se refait. Si tu ne sais pas, dis-le : deviner fausse le résultat. Les thèmes que tu travailles déjà à l'entraînement n'ont pas de question ici : leur exercice à taper est dans l'entretien du jour.`,`${Q.length} questions de toutes tes matières, pour savoir quoi réviser.`)}<div class="qbox" id="mxbox" aria-live="polite"></div></div>`;
  drawMix();
  $("#mxbox").addEventListener("click",e=>{const o=e.target.closest("[data-o]"),ns=e.target.closest("#mxs");
    if((o||ns)&&mx.ans===null){const it=mx.q[mx.i],ok=o&&+o.dataset.o===it.q.a,p=mx.par[it.sid]||(mx.par[it.sid]={ok:0,n:0});mx.ans=o?+o.dataset.o:-1;p.n++;
      logRep(Object.assign({o:"mini-contrôle mélangé",s:it.sid,th:it.th||null,fiche:it.q.link||null,ok:ok?1:0,ms:Date.now()-(mx.t0||Date.now()),passage:mx.run},repQ(it.q,mx.ans)));
      if(it.th)emit({k:"diag",s:it.sid,th:it.th,ok:ok?1:0,n:1,run:mx.run});
      if(ok){mx.score++;p.ok++;}else{if(mx.ans>=0)mx.miss.push({sid:it.sid,q:it.q,a:mx.ans});emit({k:"qm",s:it.sid,q:hq(it.q),c:it.q.link||null,o:"mix"});if(it.q.link&&SUBJ[it.sid].BY[it.q.link]){setStatus(it.sid,it.q.link,"review");renderSide();}}
      seanceRep("mix",mx,mixDebut,mx.i,mx.ans);drawMix();$("#mxn")?.focus();return;}
    const id=e.target.closest("button")?.id;if(id==="mxn"){mx.i++;mx.ans=null;mx.repris=false;drawMix();}if(id==="mxre"||id==="mxnew")mix(true);});
}
function drawMix(){
  const box=$("#mxbox"),n=mx.q.length;
  if(!n){box.innerHTML=`<p>Aucune question : tous tes CC sont passés.</p>`;return;}
  if(mx.i>=n){emit({k:"mix",n:mx.score,sur:n});seanceFin("mix",mx.run);
    box.innerHTML=`<p class="muted">Résultat</p><p class="score">${mx.score} sur ${n}</p><p>${Object.entries(mx.par).map(([s,p])=>`${themesOf(SUBJ[s]).length?`<a href="#/${s}/niveau">${SUBJ[s].name}</a>`:SUBJ[s].name} : ${p.ok} sur ${p.n}`).join(" · ")}.</p><p>${mx.score===n?"Tout est juste : les thèmes vérifiés passent en « si tu as le temps ».":"Les thèmes ratés remontent dans ton planning, et leurs fiches sont en rouge."}</p><div class="acts"><a class="btn pri" href="#/">Voir le programme du jour</a><button class="btn" id="mxre">${n} autres questions</button></div>${missHTML(mx.miss||[])}`;return;}
  const it=mx.q[mx.i],q=it.q,S=SUBJ[it.sid];if(mx.ans===null)mx.t0=Date.now();
  box.innerHTML=`<p class="muted"><i class="sdot" style="background:${S.color}"></i> ${S.name}. Question ${mx.i+1} sur ${n}, score : ${mx.score}${mx.repris?REPRISE+` · <button type="button" class="linkbtn" id="mxnew">recommencer avec d'autres questions</button>`:""}</p><div class="bar"><i style="width:${mx.i/n*100}%;background:${S.color}"></i></div><p class="qtxt">${q.q}</p>${q.code?W.code(q.code,q.lang||S.lang):""}
   <div class="opts">${(it.ord||q.o.map((_,i)=>i)).map(i=>{const o=q.o[i];let c="";if(mx.ans!==null){if(i===q.a)c="good";else if(i===mx.ans)c="bad";}return `<button data-o="${i}" class="${c}" ${mx.ans!==null?"disabled":""}>${o}</button>`;}).join("")}</div>
   ${mx.ans!==null?`<div class="expl${mx.ans===q.a?"":" no"}"><b>${mx.ans===q.a?"Exact.":mx.ans===-1?"La réponse :":"Non."}</b> ${mx.ans===-1?q.o[q.a]+". ":""}${q.e||""}${q.link&&S.BY[q.link]?` <a href="#/${it.sid}/c/${q.link}">Voir la fiche</a>`:""}${mx.ans===q.a?"":motsHTML(it.sid,q)}</div><button class="btn pri" id="mxn" style="justify-self:start">${mx.i<n-1?"Question suivante":"Voir le score"}</button>`:`<button class="btn" id="mxs" style="justify-self:start">Je ne sais pas</button>`}`;
  motsClic(it.sid,box.querySelector(".qtxt"));
}
/* ---------- lexique : les mots techniques en mots simples (lexique.js), et les mots d'une question ratée ---------- */
const lexDe=sid=>{const S=SUBJ[sid];return ((window.LEX||{})[sid]||[]).filter(x=>inScope(S,{ex:x.x}));};
function motsDe(sid,txt){const t=" "+strip(txt).replace(/\s+/g," ")+" ",vus=[];
  lexDe(sid).forEach(x=>{let best=-1;[x.m].concat(x.a||[]).forEach(f=>{const k=strip(f);if(!k)return;let i=-1;
      if(/^[a-z0-9]/.test(k)&&/[a-z0-9]$/.test(k)){const m=new RegExp("(^|[^a-z0-9])"+k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"([^a-z0-9]|$)").exec(t);if(m)i=m.index;}else i=t.indexOf(k);
      if(i>=0&&(best<0||i<best))best=i;});
    if(best>=0)vus.push({x,i:best});});
  /* les mots précis d'abord ; les mots très courants (fonction, type…) seulement s'il y a peu de mots précis */
  const prec=vus.filter(v=>!v.x.g).sort((u,v)=>u.i-v.i).slice(0,4),cour=vus.filter(v=>v.x.g).sort((u,v)=>u.i-v.i).slice(0,prec.length>=2?0:2-prec.length);
  return prec.concat(cour).map(v=>v.x);}
const motsHTML=(sid,q)=>{const M=motsDe(sid,[q.q||"",q.code||"",(q.o||[]).join(" ")].join(" "));
  return M.length?`<p class="muted" style="margin:10px 0 2px">Les mots de la question (<a href="#/${sid}/lexique">tout le lexique</a>) :</p>${M.map(x=>`<p style="margin:2px 0"><b>${x.m}</b> : ${x.d}</p>`).join("")}`:"";};
/* les mots du lexique présents dans un énoncé deviennent cliquables : un clic affiche leur explication juste dessous */
function motsClic(sid,el){if(!el||el.dataset.mots)return;el.dataset.mots=sid;const L=lexDe(sid);if(!L.length)return;
  const formes=[];L.forEach((x,k)=>[x.m].concat(x.a||[]).forEach(f=>formes.push({f,k})));formes.sort((u,v)=>v.f.length-u.f.length);
  const pris={},ech=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  try{formes.forEach(({f,k})=>{if(pris[k])return;
    const re=/^[\p{L}\p{N}]/u.test(f)&&/[\p{L}\p{N}]$/u.test(f)?new RegExp("(?<![\\p{L}\\p{N}_])"+ech(f)+"(?![\\p{L}\\p{N}_])","iu"):new RegExp(ech(f),"u");
    const W=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let nd;
    while((nd=W.nextNode())){if(nd.parentNode.closest("pre,.mot,a,button"))continue;const m=re.exec(nd.nodeValue);if(!m)continue;
      const fin=nd.splitText(m.index);fin.nodeValue=fin.nodeValue.slice(m[0].length);
      const sp=document.createElement("span");sp.className="mot";sp.setAttribute("role","button");sp.tabIndex=0;sp.dataset.k=k;sp.textContent=m[0];
      nd.parentNode.insertBefore(sp,fin);pris[k]=1;break;}});}catch(e){}}
function motMontre(sp){const box=sp.closest("[data-mots]");if(!box)return;const x=lexDe(box.dataset.mots)[+sp.dataset.k];if(!x)return;
  let d=box.nextElementSibling;if(!d||!d.classList.contains("motdef")){d=document.createElement("p");d.className="motdef muted";box.insertAdjacentElement("afterend",d);}
  d.innerHTML=`<b>${x.m}</b> : ${x.d}`;logRep({o:"mot du lexique ouvert",s:box.dataset.mots,mot:x.m});}
document.addEventListener("click",e=>{const sp=e.target.closest&&e.target.closest(".mot");if(sp)motMontre(sp);});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("mot")){e.preventDefault();e.stopPropagation();motMontre(e.target);}},true);
function lexique(sid){const S=SUBJ[sid],L=lexDe(sid),chs=[];L.forEach(x=>{if(!chs.includes(x.ch))chs.push(x.ch);});
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Lexique</h1></div><p class="lead">Les mots techniques de ${exW(S)==="CC"?"ce CC":"cet examen"}, expliqués avec des mots simples. Dans une question, les mots soulignés en pointillé sont dans ce lexique : clique dessus pour voir leur explication. Quand tu te trompes, les mots de la question s'affichent aussi sous la correction. La définition exacte du cours reste dans les fiches.</p>${chs.map((c,i)=>sec(i+1,c,L.filter(x=>x.ch===c).map(x=>`<p><b>${x.m}</b> : ${x.d}</p>`).join(""))).join("")}</div>`;}
function methode(){
  $("#main").innerHTML=`<div class="page"><div class="title-row"><h1>Réviser efficacement en peu de temps</h1></div>
   <p class="lead">Une grande synthèse de la recherche sur l'apprentissage (Dunlosky et ses collègues, 2013) compare dix façons de réviser. Deux sortent nettement du lot : <b>se tester</b> et <b>espacer</b>. Relire, surligner et résumer arrivent en bas du classement. Le site est construit autour de ça.</p>
   ${sec(1,"Se tester au lieu de relire",`<p>Chercher une réponse de mémoire renforce le souvenir bien plus qu'une relecture, même quand on se trompe, à condition de voir la correction juste après. C'est pour ça que chaque fiche commence par une question, que les cartes se retournent, et que les corrigés de TD restent cachés tant que tu n'as pas cherché.</p><p><b>En pratique</b> : ferme la fiche et réécris l'énoncé ou l'algorithme sur une feuille, puis compare.</p>`)}
   ${sec(2,"Espacer",`<p>Revoir une notion le lendemain, puis deux jours après, la fait tenir beaucoup mieux que la revoir trois fois le même soir. Une fiche marquée « Je sais » revient le lendemain dans le filtre « Révision du jour » des cartes. Les fiches ratées passent en rouge et reviennent aussi.</p><p><b>En pratique</b> : 10 minutes de « Révision du jour » au début de chaque séance.</p>`)}
   ${sec(3,"Mélanger les matières",`<p>Alterner les sujets oblige à choisir la bonne méthode à chaque question, comme le jour du CC. C'est l'idée du mini-contrôle mélangé de l'accueil.</p>`)}
   ${sec(4,"S'entraîner dans les conditions du CC",`<p>Tes contrôles sont sur papier, en 1 heure. Fais au moins une annale en temps réel par matière (le chrono est dans « Annales »), sur papier, puis corrige-toi avec la liste « Avant de rendre ta copie » des pages Recettes.</p>`)}
   ${sec(5,"Dormir",`<p>Le sommeil consolide ce que tu as appris dans la journée. Une nuit blanche avant un CC fait perdre plus qu'elle ne rapporte : la veille, révise les fiches en rouge et dors.</p>`)}
   <p><a class="btn pri" href="#/mix">Faire le mini-contrôle mélangé</a></p></div>`;
}

/* ---------- recherche ---------- */
const strip=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/<[^>]+>/g,"");
const IDX=[];SIDS.forEach(id=>{const S=SUBJ[id];S.ORDER.forEach(c=>IDX.push({h:`#/${id}/c/${c.id}`,t:c.t,sub:`${S.name}, ${c.ref}`,k:strip(S.name+" "+c.t+" "+c.ref+" "+c.plain)}));S.pages.forEach(p=>IDX.push({h:`#/${id}/p/${p.id}`,t:p.t,sub:S.name,k:strip(S.name+" "+p.t)}));[["cartes","Cartes"],["quiz","Quiz"],["td",S.tdTitle||"TD"],["annales","Annales"]].forEach(([r,t])=>IDX.push({h:`#/${id}/${r}`,t:`${t} ${W.de(S.name)}`,sub:S.name,k:strip(S.name+" "+t)}));});
SIDS.forEach(id=>(LES[id]||[]).forEach(L=>IDX.push({h:`#/lecon/${id}/${L.id}`,t:"Leçon : "+L.t,sub:SUBJ[id].name,k:strip(SUBJ[id].name+" lecon "+L.t+" "+(L.goal||""))})));
IDX.push({h:"#/edt",t:"Emploi du temps",sub:"page",k:"emploi du temps semaine edt"},{h:"#/examens",t:"Examens et coefficients",sub:"page",k:"examens coefficients coef dates"});
const si=$("#q"),res=$("#res");let ri=0,rl=[];
function search(){const q=strip(si.value.trim());if(!q){res.hidden=true;return;}const words=q.split(/\s+/);rl=IDX.map(x=>({x,s:(strip(x.t).includes(q)?3:0)+words.filter(w=>x.k.includes(w)).length})).filter(o=>o.s>=words.length).sort((a,b)=>b.s-a.s).slice(0,12).map(o=>o.x);ri=0;res.innerHTML=rl.length?rl.map((x,i)=>`<a href="${x.h}" class="${i===0?"on":""}">${x.t}<small>${x.sub}</small></a>`).join(""):`<p class="muted" style="padding:6px 10px;margin:0">Rien trouvé.</p>`;res.hidden=false;}
si.addEventListener("input",search);
si.addEventListener("keydown",e=>{if(e.key==="Enter"&&rl[ri]){location.hash=rl[ri].h;si.value="";res.hidden=true;si.blur();}else if(e.key==="Escape"){si.value="";res.hidden=true;}else if((e.key==="ArrowDown"||e.key==="ArrowUp")&&rl.length){e.preventDefault();ri=(ri+(e.key==="ArrowDown"?1:-1)+rl.length)%rl.length;res.querySelectorAll("a").forEach((a,i)=>a.classList.toggle("on",i===ri));}});
res.addEventListener("click",()=>{si.value="";res.hidden=true;});document.addEventListener("click",e=>{if(!e.target.closest(".search"))res.hidden=true;});
{const lp=$("#loupe"),bx=si.parentNode,ouvre=o=>{bx.classList.toggle("ouverte",o);lp.setAttribute("aria-expanded",o);};
  lp.addEventListener("click",()=>{ouvre(true);si.focus();});
  si.addEventListener("blur",()=>setTimeout(()=>{if(!bx.contains(document.activeElement)&&res.hidden)ouvre(false);},150));
  si.addEventListener("keydown",e=>{if(e.key==="Escape"){ouvre(false);lp.focus();}});
  res.addEventListener("click",()=>ouvre(false));}

/* ---------- animations : le volet entre deux rubriques, les cartes qui arrivent, la carte qui s'agrandit ---------- */
const REDUCED=matchMedia("(prefers-reduced-motion: reduce)").matches;
const TABS=["today","apprendre","reviser","entrainer","plus"];
const DEAL=".piece,.swatch,.fiche,.task,details.ex,details.day,.kcard,.qbox,.fc,.check,.stitle,.hlead,.examcard,.examday,.pager a";
const WIPE=$("#wipe"),BANDS=WIPE?[...WIPE.children]:[];
let busy=false,LASTTAB=null,FIRST=true,ZOOM=null,VIAZOOM=false;
function deal(){if(REDUCED)return;const m=$("#main");m.querySelectorAll(DEAL).forEach((el,i)=>el.style.setProperty("--i",Math.min(i,28)));m.classList.remove("is-enter");void m.offsetWidth;m.classList.add("is-enter");clearTimeout(deal.t);deal.t=setTimeout(()=>m.classList.remove("is-enter"),800);}
function wipe(back,mid){if(!WIPE){mid();return;}busy=true;WIPE.dataset.to=back?"back":"";WIPE.classList.toggle("is-rev",back);BANDS.forEach(b=>b.style.setProperty("--d",Math.floor(Math.random()*30)+"ms"));
  WIPE.classList.remove("is-out");void WIPE.offsetWidth;WIPE.classList.add("is-in");
  setTimeout(()=>{try{mid();}finally{WIPE.classList.remove("is-in");void WIPE.offsetWidth;WIPE.classList.add("is-out");setTimeout(()=>{WIPE.classList.remove("is-out");busy=false;},230);}},165);}
function closeZoom(){if(ZOOM){ZOOM.remove();ZOOM=null;}}
function fadeZoom(){const z=ZOOM;if(!z)return;ZOOM=null;const a=z.animate([{opacity:1},{opacity:0}],{duration:180,easing:"ease-out",fill:"both"});a.onfinish=()=>z.remove();setTimeout(()=>z.remove(),600);}
function openZoom(a){closeZoom();const r=a.getBoundingClientRect(),cs=getComputedStyle(a),z=document.createElement("div");z.className="zoom";z.setAttribute("aria-hidden","true");
  z.style.setProperty("--c",cs.getPropertyValue("--c").trim()||"#D980FF");z.style.setProperty("--c-deep",cs.getPropertyValue("--c-deep").trim()||"#610089");
  const inner=document.createElement("div");inner.className="zoom__inner";const art=a.querySelector(".art");if(art){const k=art.cloneNode(true);k.classList.add("zoom__icon");inner.append(k);}
  const t=a.querySelector(".piece__title"),p1=document.createElement("p"),p2=document.createElement("p");p1.className="zoom__title";p1.textContent=t?t.textContent:"";p2.className="zoom__kicker";p2.textContent=a.dataset.zoom||"Ouverture";inner.append(p1,p2);
  z.append(inner);z.addEventListener("click",closeZoom);document.body.append(z);ZOOM=z;
  const W=innerWidth,H=innerHeight;z.animate([{clipPath:`inset(${r.top}px ${W-r.right}px ${H-r.bottom}px ${r.left}px round 20px)`},{clipPath:"inset(0px 0px 0px 0px round 0px)"}],{duration:300,easing:"cubic-bezier(.45,.05,.2,1)",fill:"both"});
  inner.animate([{opacity:0,transform:"translateY(16px) scale(.94)"},{opacity:1,transform:"none"}],{duration:200,delay:110,easing:"cubic-bezier(.2,.9,.25,1)",fill:"both"});}
document.addEventListener("click",e=>{if(REDUCED||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest("a.piece[data-zoom]");if(!a)return;const h=a.getAttribute("href");if(!h||!h.startsWith("#"))return;
  e.preventDefault();openZoom(a);setTimeout(()=>{VIAZOOM=true;if(location.hash===h)route();else location.hash=h;},260);});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeZoom();});
addEventListener("pageshow",e=>{if(e.persisted)closeZoom();});

/* ---------- routage ---------- */
function tabOf(parts){const first=parts[0]||"";if(SIDS.includes(first))return ["quiz","td","annales"].includes(parts[1])?"entrainer":"apprendre";
  return ({"":"today",apprendre:"apprendre",lecon:"apprendre",reviser:"reviser",mix:"reviser",entrainer:"entrainer",express:"entrainer"})[first]||"plus";}
/* une erreur n'affiche plus une page vide : elle s'écrit dans la page, les onglets restent, et elle est notée dans le journal,
   qui la porte jusqu'à l'autre appareil (au plus 8 par jour, jamais deux fois la même au même endroit) */
function noteErr(err,ou){try{const m=String(err&&err.message||err).slice(0,200),j=today(),D=J.filter(e=>e.k==="err"&&ymd(new Date(e.t))===j);
  if(D.length>=8||D.some(e=>e.m===m&&e.ou===ou))return;
  emit({k:"err",m,ou,pile:String(err&&err.stack||"").slice(0,400),w:innerWidth});}catch(e){}}
function panne(err,parts){console.error(err);noteErr(err,"#/"+parts.join("/"));const main=$("#main");main.className="";
  main.innerHTML=`<div class="page" id="panne"><h1>Cette page ne s'affiche pas</h1><p>Une erreur l'a arrêtée. Le reste du site marche : passe par les onglets.</p><p class="muted"></p><p><a class="btn" href="#/">Aujourd'hui</a> <button class="btn" type="button">Recharger la page</button></p></div>`;
  main.querySelector(".muted").textContent=String(err&&err.message||err);main.querySelector("button").onclick=()=>location.reload();}
function render(parts){
  const first=parts[0]||"",main=$("#main");
  try{
  if(SIDS.includes(first)){
    const sid=first,rest=parts.slice(1),S=SUBJ[sid];let pg="home";
    main.className="s-"+sid;CUR={sid,page:"home"};
    if(rest[0]==="c"&&S.BY[rest[1]]){pg="c/"+rest[1];CUR.page=pg;concept(sid,S.BY[rest[1]]);}
    else if(rest[0]==="cartes"){pg="cartes";CUR.page=pg;cards(sid,rest[1]==="rouge"?"rouge":null);}
    else if(rest[0]==="quiz"&&S.quiz.length){pg="quiz";CUR.page=pg;quiz(sid);}
    else if(rest[0]==="td"&&S.td.length){pg="td";CUR.page=pg;td(sid);}
    else if(rest[0]==="annales"&&annOf(S).length){pg="annales";CUR.page=pg;annales(sid);}
    else if(rest[0]==="p"&&rest[1]){pg="p/"+rest[1];CUR.page=pg;page(sid,rest[1]);}
    else if(rest[0]==="niveau"&&themesOf(S).length){pg="niveau";CUR.page=pg;niveau(sid);}
    else if(rest[0]==="lexique"&&lexDe(sid).length){pg="lexique";CUR.page=pg;lexique(sid);}
    else (APP.ext.subject||subjHome)(sid);
    /* plus de barre latérale : chaque sous-page d'une matière ramène à sa page */
    if(pg!=="home"&&!pg.startsWith("c/")){const pe=main.querySelector(".page");if(pe)pe.insertAdjacentHTML("afterbegin",`<a class="back" href="#/${sid}">‹ ${S.name}</a>`);}
  } else {
    const X=APP.ext.routes||{};
    main.className=first==="lecon"&&SIDS.includes(parts[1])?"s-"+parts[1]:"";
    CUR={sid:null,page:X[first]||["edt","examens","mix","methode"].includes(first)?first:"today"};
    if(X[first])X[first](parts.slice(1));else if(first==="edt")edt();else if(first==="examens")examens();else if(first==="mix")mix();else if(first==="methode")methode();else if(APP.ext.home)APP.ext.home();else hubHome();
  }
  }catch(err){panne(err,parts);}
  document.body.classList.toggle("in-lesson",first==="lecon"&&!$("#panne"));
  const tab=tabOf(parts);
  document.querySelectorAll("#tabbar a,#topnav a").forEach(a=>{if(a.dataset.tab===tab)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
  renderSide();topInfo();window.scrollTo(0,0);
  const h1=$("#main h1");document.title=(h1?h1.textContent+" · ":"")+"Mes révisions";
}
function route(){
  const parts=(location.hash||"#/").slice(2).split("/").filter(Boolean),tab=tabOf(parts),lesson=parts[0]==="lecon";
  const prev=LASTTAB;LASTTAB=tab;
  if(VIAZOOM){VIAZOOM=false;render(parts);deal();fadeZoom();FIRST=false;return;}
  closeZoom();
  if(FIRST||REDUCED||busy||tab===prev){render(parts);if(!lesson&&!REDUCED)deal();FIRST=false;return;}
  /* pendant le volet, l'adresse a pu changer encore : on affiche la page demandée en dernier */
  wipe(TABS.indexOf(tab)<TABS.indexOf(prev),()=>{const cur=(location.hash||"#/").slice(2).split("/").filter(Boolean);LASTTAB=tabOf(cur);render(cur);if(cur[0]!=="lecon")deal();});
}
const APP={$,bilanSeance,coucheTxt,SUBJ,SIDS,ST,hub,genreTache,tempsCarte,neuvesParJour,coursJour,epreuvesDu,mm,creneauxDu,dansCreneau,cadreCren,lierCren,lierSeances,poseBoite,ajuste,sansDu,fantome,boiteCren,LES,lesOf,annOf,sujetsDe,themesOf,themeDe,maitrise,gainTheme,prioDe,marge,diagPool,diagAFaire,miniDu,logRep,allReps,repsPropres,importReps,seanceGet,seanceRep,seanceFin,seanceArrivee,faites,nouvRun,repQ,brut,lexDe,motsHTML,motsClic,examsOf,examAt,inScope,emit,work,factor,measured,doneTodayMin,stamp:()=>Date.now()+TOFF,mergeEvents,journal:()=>J,device:()=>DEV,today,NOW,ymd,addDays,dayName,exam,examStart,jx,hm,hh,sec,weight,poids0,epreuves,bilan,estime,notesHTML,plan,isDone,doneOn,taskHTML,blockHTML,bindTicks,renderSide,topInfo,fixLinks,mount,status,setStatus,activeQuiz,quizGoal,cardIds,hq,CLASSES,HOLIDAY,cur:()=>CUR,route:()=>route(),onChange:null,ext:{}};
Object.assign(APP,{pendingTasks,tempsPrevu});
if(window.EXT)try{APP.ext=window.EXT.init(APP)||{};}catch(err){console.error(err);APP.ext={};noteErr(err,"démarrage");}
(window.PANNES||[]).forEach(m=>noteErr(m,"chargement"));
addEventListener("error",e=>{if(e.message)noteErr(e.error||e.message,"page "+location.hash);});
addEventListener("unhandledrejection",e=>noteErr(e.reason||"promesse refusée","fond "+location.hash));
window.APP=APP;/* pour les vérifications dans la console */
APP.onChange=APP.ext.onChange||null;
/* ?note=geo.cc1:12.5 dans l'adresse : entre cette note si la case est vide, puis retire le paramètre de l'adresse */
(function(){const q=new URLSearchParams(location.search),t=q.get("note");if(!t)return;
  t.split(";").forEach(p=>{const m=/^([a-z]+)\.([a-z0-9]+):(\d+(?:\.\d+)?)$/.exec(p);if(!m||!MCC[m[1]]||!SUBJ[m[1]]||!MCC[m[1]].ep.some(x=>x[0]===m[2])||+m[3]>20)return;const k=m[1]+"."+m[2];if(hub.notes[k]==null)emit({k:"set",key:"note:"+k,v:+m[3]});});
  q.delete("note");const r=q.toString();try{history.replaceState(null,"",location.pathname+(r?"?"+r:"")+location.hash);}catch(e){}})();
window.addEventListener("hashchange",route);
/* formules en écriture mathématique dans les matières de maths (?maths=0 pour s'en passer).
   Seuls les morceaux de page qui viennent de changer sont repassés ; un corrigé replié l'est à son ouverture. */
{const MATHS=["calc","ana","lin","geo","rai"],main=$("#main");
 /* une formule ne se coupe plus en fin de ligne (choix du 18/11), sauf si elle est plus large que sa ligne : elle se coupe alors comme avant */
 const coupe=()=>{const L=[...main.querySelectorAll(".mi,.mx")].filter(m=>!m.parentElement.closest(".mi,.mx"));L.forEach(m=>m.classList.remove("coupe"));
   L.filter(m=>{const b=m.parentElement.closest("p,li,td,th,dd,dt,div,h1,h2,h3,summary,button,label");if(!b)return false;const r=m.getBoundingClientRect();return r.width>0&&r.right>b.getBoundingClientRect().right+1;}).forEach(m=>m.classList.add("coupe"));};
 APP.coupe=coupe;
 let rafC=0,lg=innerWidth;const planCoupe=()=>{cancelAnimationFrame(rafC);rafC=requestAnimationFrame(coupe);};
 new MutationObserver(planCoupe).observe(main,{childList:true,subtree:true});
 main.addEventListener("toggle",planCoupe,true);
 addEventListener("resize",()=>{if(innerWidth!==lg){lg=innerWidth;planCoupe();}});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(planCoupe);
 if(new URLSearchParams(location.search).get("maths")!=="0"){
  const matiere=()=>{const p=(location.hash||"#/").slice(2).split("/").filter(Boolean),sid=p[0]==="lecon"?p[1]:p[0];
    if(SIDS.includes(sid))return sid;const q=main.querySelector("[data-mots]");return q?q.dataset.mots:"";};
  const passe=R=>{const sid=matiere();if(sid&&!MATHS.includes(sid))return;obs.disconnect();
    try{R.filter(e=>!R.some(x=>x!==e&&x.contains(e))).forEach(e=>W.formules(e,true));}catch(e){console.error(e);}
    obs.observe(main,{childList:true,subtree:true});};
  const obs=new MutationObserver(M=>passe([...new Set(M.map(m=>m.target))].filter(e=>e.isConnected)));
  obs.observe(main,{childList:true,subtree:true});
  main.addEventListener("toggle",e=>{if(e.target.open)passe([e.target]);},true);}}
route();
/* hors ligne : seulement dans la version installable (celle qui a un manifeste et un sw.js à côté) */
if("serviceWorker" in navigator&&document.querySelector('link[rel="manifest"]')&&(location.protocol==="https:"||location.hostname==="localhost")){try{navigator.serviceWorker.register("sw.js").catch(()=>{});}catch(e){}}
/* la copie gardée s'est affichée et la page neuve vient d'arriver en fond (message de sw.js) : une ligne discrète pour recharger (choix 37b du 20/11) */
if("serviceWorker" in navigator)try{navigator.serviceWorker.addEventListener("message",e=>{const s=$("#syncb");if(!e.data||e.data.k!=="neuve"||$("#neuveb")||!s)return;
  s.insertAdjacentHTML("afterend",`<a class="syncb" id="neuveb" href="#">Nouvelle version : recharger</a>`);$("#neuveb").addEventListener("click",ev=>{ev.preventDefault();location.reload();});});}catch(e){}
})();
