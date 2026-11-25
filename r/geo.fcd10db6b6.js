/* Moteur de figures interactives : SVG pur, sans dépendance.
   Les coordonnées sont en pixels du viewBox (y vers le bas) ; 1 unité de longueur = 40 px.
   Les angles orientés sont mesurés dans le sens trigonométrique tel qu'on le voit à l'écran. */
(function(){
"use strict";
const U=40, PI=Math.PI;
const V=(x,y)=>({x,y});
const add=(a,b)=>V(a.x+b.x,a.y+b.y), sub=(a,b)=>V(a.x-b.x,a.y-b.y), mul=(a,k)=>V(a.x*k,a.y*k);
const dot=(a,b)=>a.x*b.x+a.y*b.y, crs=(a,b)=>a.x*b.y-a.y*b.x;
const len=a=>Math.hypot(a.x,a.y), dpx=(a,b)=>len(sub(a,b)), d=(a,b)=>dpx(a,b)/U;
const mid=(a,b)=>V((a.x+b.x)/2,(a.y+b.y)/2), lerp=(a,b,t)=>V(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
const unit=a=>{const l=len(a)||1;return V(a.x/l,a.y/l);};
const perp=a=>V(-a.y,a.x);
function norm(a){a=((a+PI)%(2*PI)+2*PI)%(2*PI)-PI;return a<=-PI+1e-9?PI:a;}
/* angle orienté (A,O,B) : mesure principale dans ]-π, π], positif dans le sens inverse des aiguilles d'une montre */
function ang(A,O,B){const u=sub(A,O),v=sub(B,O);return norm(Math.atan2(-crs(u,v),dot(u,v)));}
const absang=(A,O,B)=>Math.abs(ang(A,O,B));
function proj(M,A,B){const v=sub(B,A),t=dot(sub(M,A),v)/(dot(v,v)||1);return add(A,mul(v,t));}
function param(M,A,B){const v=sub(B,A);return dot(sub(M,A),v)/(dot(v,v)||1);}
function inter(A,B,C,D){const r=sub(B,A),s=sub(D,C),q=crs(r,s);if(Math.abs(q)<1e-9)return null;return add(A,mul(r,crs(sub(C,A),s)/q));}
const sym=(M,O)=>V(2*O.x-M.x,2*O.y-M.y);
function rot(M,O,t){const v=sub(M,O),c=Math.cos(t),s=Math.sin(t);return V(O.x+v.x*c+v.y*s,O.y-v.x*s+v.y*c);}
function reflect(M,A,B){return sym(M,proj(M,A,B));}
const side=(M,A,B)=>Math.sign(crs(sub(B,A),sub(M,A)));            /* +1 / -1 / 0 : de quel côté de (AB) */
const distLine=(M,A,B)=>dpx(M,proj(M,A,B));
function segInter(A,B,C,D){const P=inter(A,B,C,D);if(!P)return null;const t=param(P,A,B),u=param(P,C,D);return(t>=-1e-9&&t<=1+1e-9&&u>=-1e-9&&u<=1+1e-9)?P:null;}
function lineSeg(A,B,C,D){const P=inter(A,B,C,D);if(!P)return null;const u=param(P,C,D);return(u>=-1e-9&&u<=1+1e-9)?P:null;}
function snapLine(p,A,B,tol){const q=proj(p,A,B);return dpx(p,q)<(tol||9)?q:p;}
function onLine(p,A,B){return proj(p,A,B);}
function onSeg(p,A,B){const t=Math.max(0,Math.min(1,param(p,A,B)));return lerp(A,B,t);}
function onRay(p,A,B){const t=Math.max(0,param(p,A,B));return add(A,mul(sub(B,A),t));}
function onCircle(p,O,r){return add(O,mul(unit(sub(p,O)),r));}
const near=(a,b,tol)=>Math.abs(a-b)<(tol==null?0.03:tol);
const parallel=(A,B,C,D,tol)=>Math.abs(crs(unit(sub(B,A)),unit(sub(D,C))))<(tol||0.012);

/* --- écriture des nombres --- */
function fr(x,n){n=n==null?2:n;let s=(Math.round(x*10**n)/10**n).toFixed(n);if(/^-0[.,]?0*$/.test(s))s=s.slice(1);return s.replace(".",",");}
const FR=[[1,1],[1,2],[1,3],[2,3],[1,4],[3,4],[1,6],[5,6],[1,8],[3,8],[5,8],[7,8],[1,12],[5,12],[7,12],[11,12]];
function piTxt(a){
  if(Math.abs(a)<0.004)return "0";
  const s=a<0?"−":"",x=Math.abs(a)/PI;
  for(const[n,q]of FR){if(Math.abs(x-n/q)<0.004){return s+(n===1?"":n)+"π"+(q===1?"":"/"+q);}}
  return s+fr(x)+"π";
}
function fa(a,deg){const t=piTxt(a);return deg===false?t:`${t} <span class="muted">(${fr(a*180/PI,0)}°)</span>`;}
const fl=(a,b)=>fr(d(a,b));                    /* longueur AB, en unités */

/* --- traits SVG --- */
const xy=p=>`${fr(p.x,1).replace(",",".")},${fr(p.y,1).replace(",",".")}`;
const n1=v=>(Math.round(v*10)/10);
const D={
  seg:(A,B,c)=>`<line x1="${n1(A.x)}" y1="${n1(A.y)}" x2="${n1(B.x)}" y2="${n1(B.y)}" class="${c||"l-ink"}"/>`,
  line:(A,B,c)=>{const u=unit(sub(B,A)),P=add(A,mul(u,-4000)),Q=add(A,mul(u,4000));return D.seg(P,Q,c||"l-thin");},
  ray:(A,B,c)=>{const u=unit(sub(B,A));return D.seg(A,add(A,mul(u,4000)),c||"l-ink");},
  vec:(A,B,c,mk)=>{const L=dpx(A,B);if(L<1)return "";const u=unit(sub(B,A)),E=add(A,mul(u,Math.max(0,L-2)));return `<line x1="${n1(A.x)}" y1="${n1(A.y)}" x2="${n1(E.x)}" y2="${n1(E.y)}" class="${c||"l-cob"}" marker-end="url(#mk-${mk||"cob"})"/>`;},
  poly:(pts,c)=>`<polygon points="${pts.map(xy).join(" ")}" class="${c||"f-cob"}"/>`,
  pline:(pts,c)=>`<polyline points="${pts.map(xy).join(" ")}" class="${c||"l-ink"}"/>`,
  circ:(O,r,c)=>`<circle cx="${n1(O.x)}" cy="${n1(O.y)}" r="${n1(Math.max(0,r))}" class="${c||"l-thin"}"/>`,
  dot:(P,c,r)=>`<circle cx="${n1(P.x)}" cy="${n1(P.y)}" r="${r||4.2}" class="${c||"p-fix"}"/>`,
  txt:(P,s,c,dx,dy)=>`<text x="${n1(P.x+(dx||0))}" y="${n1(P.y+(dy||0))}" class="${c||""}">${s}</text>`,
  /* étiquette placée à l'écart d'un point de référence */
  lab:(P,s,away,c,r)=>{const u=away&&dpx(P,away)>30?unit(sub(P,away)):V(.6,-.8),Q=add(P,mul(u,r||17));return `<text x="${n1(Q.x)}" y="${n1(Q.y)}" class="${c||""}" text-anchor="middle" dominant-baseline="middle">${s}</text>`;},
  pt:(P,s,away,c,lc)=>D.dot(P,c)+(s?D.lab(P,s,away,lc):""),
  /* arc d'angle orienté de [OA) vers [OB) ; arrow = flèche au bout */
  arc:(A,O,B,r,c,arrow,mk)=>{
    const a=ang(A,O,B);if(Math.abs(a)<1e-3)return "";
    const S=add(O,mul(unit(sub(A,O)),r)),E=add(O,mul(unit(sub(B,O)),r));
    const big=Math.abs(a)>PI-1e-6?1:0,sw=a>0?0:1;
    return `<path d="M${xy(S)} A${r} ${r} 0 ${big} ${sw} ${xy(E)}" class="${c||"l-cob"}"${arrow?` marker-end="url(#mk-${mk||"cob"})"`:""}/>`;
  },
  /* secteur rempli (pour voir un angle) */
  wedge:(A,O,B,r,c)=>{
    const a=ang(A,O,B);if(Math.abs(a)<1e-3)return "";
    const S=add(O,mul(unit(sub(A,O)),r)),E=add(O,mul(unit(sub(B,O)),r));
    return `<path d="M${xy(O)} L${xy(S)} A${r} ${r} 0 0 ${a>0?0:1} ${xy(E)} Z" class="${c||"f-cob"}"/>`;
  },
  /* n arcs (marque d'angles égaux, non orientés) */
  marks:(A,O,B,r,n,c)=>{let s="";for(let i=0;i<(n||1);i++)s+=D.arc(A,O,B,r+i*4,c||"l-thin");return s;},
  right:(A,O,B,s,c)=>{s=s||11;const u=mul(unit(sub(A,O)),s),v=mul(unit(sub(B,O)),s);return D.pline([add(O,u),add(add(O,u),v),add(O,v)],c||"l-thin");},
  ticks:(A,B,n,c)=>{const M=mid(A,B),u=unit(sub(B,A)),p=perp(u);let s="";for(let i=0;i<(n||1);i++){const C=add(M,mul(u,(i-(n-1)/2)*5));s+=D.seg(add(C,mul(p,-6)),add(C,mul(p,6)),c||"l-ink");}return s;},
  /* longueur écrite au milieu d'un segment */
  len:(A,B,c,off)=>{const M=mid(A,B),p=perp(unit(sub(B,A)));const Q=add(M,mul(p,off==null?-14:off));return `<text x="${n1(Q.x)}" y="${n1(Q.y)}" class="${c||"t-mut"}" text-anchor="middle" dominant-baseline="middle">${fl(A,B)}</text>`;},
};

/* --- panneau de mesures --- */
const R={
  m:(rows)=>`<dl class="meas">${rows.map(r=>r?`<dt>${r[0]}</dt><dd class="${r[2]||""}">${r[1]}</dd>`:"").join("")}</dl>`,
  v:(t,c)=>`<div class="verdict ${c||""}">${t}</div>`,
  h:(t)=>`<h5>${t}</h5>`,
};

/* marqueurs de flèches, partagés par toutes les figures */
function defs(){
  if(document.getElementById("geo-defs"))return;
  const s=document.createElementNS("http://www.w3.org/2000/svg","svg");
  s.setAttribute("id","geo-defs");s.setAttribute("width","0");s.setAttribute("height","0");s.style.position="absolute";
  s.innerHTML="<defs>"+["cob","ink","amb","red","ok","k1","k2","k3","k4","k5"].map(k=>`<marker id="mk-${k}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arrow-${k}"/></marker>`).join("")+"</defs>";
  document.body.appendChild(s);
}

/* --- la figure ---
 spec = {
   w,h          taille du viewBox (défaut 560 × 360)
   P            {A:[x,y], …} points libres
   drag         liste des points déplaçables (défaut : tous)
   con          {M:(p,P,S)=>p'} contraintes de déplacement
   labels       {A:"A"} étiquettes des poignées (défaut : le nom), false pour aucune
   S            état initial (curseurs, options)
   sliders      [{k,label,min,max,step,fmt}]
   toggles      [{k,label}]
   buttons      [{label,act(P,S)}]
   draw(P,S,F)  -> chaîne SVG
   info(P,S,F)  -> HTML du panneau de mesures
   goal         {text, ok(P,S), win}
   hint         texte d'aide sous la figure
 } */
let FID=0;
function Figure(host,spec){
  defs();
  const F=this;F.id=++FID;F.spec=spec;
  const w=spec.w||560,h=spec.h||360;F.w=w;F.h=h;
  F.P={};for(const k in spec.P){const v=spec.P[k];F.P[k]=V(v[0],v[1]);}
  F.P0=JSON.parse(JSON.stringify(F.P));
  F.S=Object.assign({},spec.S||{});F.S0=Object.assign({},F.S);
  F.drag=spec.drag||Object.keys(F.P);
  F.won=false;
  const hasPanel=!!(spec.info||spec.goal||spec.sliders||spec.toggles||spec.buttons);
  host.innerHTML=`<div class="figwrap${hasPanel?"":" solo"}"><div class="figure"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${(spec.alt||"Figure interactive").replace(/"/g,"")}"></svg>${spec.hint!==false?`<span class="fig-hint">${spec.hint||"Attrape les points orange."}</span>`:""}</div>${hasPanel?`<div class="panel"><div class="ctrls"></div><div class="out" aria-live="polite"></div><div class="goalbox"></div></div>`:""}</div>`;
  const svg=host.querySelector("svg");F.svg=svg;
  const out=host.querySelector(".out"),goalbox=host.querySelector(".goalbox"),ctrls=host.querySelector(".ctrls");
  /* commandes */
  if(ctrls){
    let html="";
    (spec.sliders||[]).forEach(s=>{html+=`<label>${s.label} <span data-sv="${s.k}"></span><input type="range" min="${s.min}" max="${s.max}" step="${s.step||0.01}" value="${F.S[s.k]}" data-sl="${s.k}"></label>`;});
    const tb=(spec.toggles||[]).map(t=>`<button class="btn" data-tg="${t.k}" aria-pressed="${!!F.S[t.k]}">${t.label}</button>`).join("")
      +(spec.buttons||[]).map((b,i)=>`<button class="btn" data-bt="${i}">${b.label}</button>`).join("")
      +(spec.noReset?"":`<button class="btn" data-reset>Recommencer</button>`);
    html+=`<div class="row">${tb}</div>`;
    ctrls.innerHTML=html;
    ctrls.addEventListener("input",e=>{const k=e.target.dataset.sl;if(!k)return;F.S[k]=+e.target.value;F.render();});
    ctrls.addEventListener("click",e=>{
      const t=e.target.closest("button");if(!t)return;
      if(t.dataset.tg){const k=t.dataset.tg;F.S[k]=!F.S[k];t.setAttribute("aria-pressed",!!F.S[k]);}
      else if(t.dataset.bt){spec.buttons[+t.dataset.bt].act(F.P,F.S,F);}
      else if(t.hasAttribute("data-reset")){F.reset();return;}
      F.render();
    });
  }
  F.reset=function(){F.P=JSON.parse(JSON.stringify(F.P0));F.S=Object.assign({},F.S0,{step:F.S.step});if(ctrls){ctrls.querySelectorAll("[data-sl]").forEach(i=>i.value=F.S[i.dataset.sl]);ctrls.querySelectorAll("[data-tg]").forEach(b=>b.setAttribute("aria-pressed",!!F.S[b.dataset.tg]));}F.render();};
  let focusId=null,dragId=null;
  F.render=function(){
    const P=F.P,S=F.S;
    let s="";
    try{s=spec.draw(P,S,F);}catch(err){s=`<text x="20" y="30">Erreur de figure</text>`;console.error(err);}
    const C=V(w/2,h/2);
    for(const k of F.drag){
      if(spec.hide&&spec.hide(k,P,S))continue;
      const p=P[k],lab=spec.labels===false?null:(spec.labels&&k in spec.labels?spec.labels[k]:k);
      s+=`<circle class="halo" cx="${n1(p.x)}" cy="${n1(p.y)}" r="17" data-p="${k}"/>`;
      s+=`<circle class="p-drag${dragId===k?" grab":""}" cx="${n1(p.x)}" cy="${n1(p.y)}" r="6.5" data-p="${k}" tabindex="0" role="button" aria-label="Point ${lab||k} : déplace-le avec la souris, le doigt ou les flèches du clavier"/>`;
      if(lab)s+=D.lab(p,lab,spec.away?spec.away(k,P,S):C,"t-amb");
    }
    svg.innerHTML=s;
    if(out&&spec.info){try{out.innerHTML=spec.info(P,S,F);}catch(err){out.innerHTML="";console.error(err);}}
    (spec.sliders||[]).forEach(sl=>{const e=host.querySelector(`[data-sv="${sl.k}"]`);if(e)e.innerHTML=sl.fmt?sl.fmt(S[sl.k]):fr(S[sl.k]);});
    if(goalbox&&spec.goal){
      let ok=false;try{ok=!!spec.goal.ok(P,S,F);}catch(e){}
      if(ok)F.won=true;
      goalbox.innerHTML=`<div class="defi${F.won?" done":""}"><b>${F.won?"Défi réussi":"Défi"}</b> : ${F.won&&spec.goal.win?spec.goal.win:spec.goal.text}</div>`;
    }
    if(focusId){const el=svg.querySelector(`.p-drag[data-p="${focusId}"]`);if(el&&document.activeElement!==el)el.focus({preventScroll:true});}
    if(spec.after)spec.after(P,S,F);
  };
  function toSvg(e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=svg.getScreenCTM();return m?pt.matrixTransform(m.inverse()):pt;}
  function move(k,p){
    p=V(Math.max(8,Math.min(w-8,p.x)),Math.max(8,Math.min(h-8,p.y)));
    if(spec.con&&spec.con[k])p=spec.con[k](p,F.P,F.S);
    if(!p||!isFinite(p.x)||!isFinite(p.y))return;
    F.P[k]=p;F.render();
  }
  svg.addEventListener("pointerdown",e=>{
    const t=e.target.closest("[data-p]");if(!t)return;
    dragId=t.dataset.p;focusId=null;svg.setPointerCapture(e.pointerId);e.preventDefault();
    const p=toSvg(e);F.off=sub(F.P[dragId],V(p.x,p.y));
    if(dpx(F.P[dragId],V(p.x,p.y))>8)F.off=V(0,0);
    F.render();
  });
  svg.addEventListener("pointermove",e=>{if(!dragId)return;const p=toSvg(e);move(dragId,add(V(p.x,p.y),F.off||V(0,0)));});
  const end=()=>{if(dragId){dragId=null;F.render();}};
  svg.addEventListener("pointerup",end);svg.addEventListener("pointercancel",end);
  svg.addEventListener("keydown",e=>{
    const t=e.target.closest(".p-drag");if(!t)return;
    const k=t.dataset.p,st=e.shiftKey?1:5,m={ArrowLeft:V(-st,0),ArrowRight:V(st,0),ArrowUp:V(0,-st),ArrowDown:V(0,st)}[e.key];
    if(!m)return;e.preventDefault();focusId=k;move(k,add(F.P[k],m));
  });
  svg.addEventListener("focusout",()=>{setTimeout(()=>{if(!svg.contains(document.activeElement))focusId=null;},0);});
  F.setStep=function(k){const prev=F.S.step;F.S.step=k;if(spec.onStep&&prev!==k)spec.onStep(k,F.P,F.S);F.render();};
  F.render();
}

window.G={U,PI,V,add,sub,mul,dot,crs,len,d,dpx,mid,lerp,unit,perp,norm,ang,absang,proj,param,inter,sym,rot,reflect,side,distLine,segInter,lineSeg,snapLine,onLine,onSeg,onRay,onCircle,near,parallel,fr,fa,fl,piTxt,D,R,Figure};
})();
