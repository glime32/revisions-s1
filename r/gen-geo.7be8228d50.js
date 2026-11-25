/* Générateurs de Géométrie (CC2 : translations et homothéties, Pythagore, trigonométrie, aire, Al-Kashi, cercles). */
(function(){
"use strict";
const G=window.GEN,O=G.outils,{Q,q,add,sub,mul,div,egal,nb,brut,par,propre}=O;
const an=s=>`<span class="ang">${s}</span>`,ve=s=>`<span class="vec">${s}</span>`;
const cosAn=s=>`<span class="en-nb">cos(${an(s)})</span>`,absAn=s=>`<span class="en-nb">|${an(s)}|</span>`;
const fx=s=>s.replace(/[_{}^]/g,"").length>30?O.f(s):O.fx(s);
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];

/* nombres exacts de la forme r√k : r rationnel, k entier sans facteur carré */
function S(r,k){r=q(r);k=k||1;if(!r.n)return {r,k:1};let c=1;for(let d=2;d*d<=k;d++)while(k%(d*d)===0){k/=d*d;c*=d;}return {r:mul(r,c),k};}
const sq=x=>x&&x.k?x:S(x);
const val=x=>{x=sq(x);return x.r.n/x.r.d*Math.sqrt(x.k);};
const fois=(a,b)=>{a=sq(a);b=sq(b);return S(mul(a.r,b.r),a.k*b.k);};
const sur=(a,b)=>{a=sq(a);b=sq(b);return S(div(a.r,mul(b.r,b.k)),a.k*b.k);};
const carre=a=>{a=sq(a);return mul(mul(a.r,a.r),a.k);};
const racine=x=>{x=q(x);return S(Q(1,x.d),x.n*x.d);};
const ecrit=x=>{x=sq(x);const n=Math.abs(x.r.n),d=x.r.d,s=x.r.n<0?"−":"";return x.k===1?s+n+(d===1?"":"/"+d):s+(n===1?"":n)+"√"+x.k+(d===1?"":"/"+d);};
const tape=x=>ecrit(x).replace(/−/g,"-");
const simple=x=>{x=sq(x);return x.k===1&&x.r.d===1&&x.r.n>=0;};
const gr=x=>simple(x)?ecrit(x):"("+ecrit(x)+")";
const c2=x=>gr(x)+"^{2}";
/* « √20 = 2√5 », « √13 », « 5 » : la racine d'un rationnel, avec sa forme simplifiée */
const racLigne=x=>{x=q(x);const s=racine(x),b="√"+(x.d===1?x.n:"("+nb(x)+")");return s.k===1||ecrit(s)===b?ecrit(s):b+" = "+ecrit(s);};
const simplifie=x=>{x=q(x);const s=racine(x);if(x.d!==1||s.k===1||egal(s.r,1))return "";const c=s.r.n;return ` Pour simplifier : ${fx(`√${x.n} = √(${c*c} × ${s.k}) = ${c}√${s.k}`)}.`;};

/* angles : une fraction de π */
const angT=x=>{x=q(x);return !x.n?"0":(x.n===1?"":x.n)+"π"+(x.d===1?"":"/"+x.d);};
const angV=x=>{x=q(x);return x.n/x.d*Math.PI;};
const DEMI=Q(1,2);
const TRIG={"0":[S(1),S(0)],"1/6":[S(DEMI,3),S(DEMI)],"1/4":[S(DEMI,2),S(DEMI,2)],"1/3":[S(DEMI),S(DEMI,3)],"1/2":[S(0),S(1)],"2/3":[S(Q(-1,2)),S(DEMI,3)],"3/4":[S(Q(-1,2),2),S(DEMI,2)],"5/6":[S(Q(-1,2),3),S(DEMI)],"1":[S(-1),S(0)]};
const cosA=x=>TRIG[brut(x)][0],sinA=x=>TRIG[brut(x)][1];
const NOMANG={"1/6":"30°","1/4":"45°","1/3":"60°","1/2":"90°","2/3":"120°","3/4":"135°","5/6":"150°"};
/* pourquoi le cosinus ou le sinus a cette valeur */
function pourquoiTrig(th,f){const k=brut(th),v=ecrit((f==="cos"?cosA:sinA)(th));
  if(th.n===1)return `Valeur à connaître par cœur : ${angT(th)} radians, c'est ${NOMANG[k]}, et ${fx(`${f}(${angT(th)}) = ${v}`)}.`;
  const s=Q(th.d-th.n,th.d);
  return f==="cos"?`${fx(`${angT(th)} = π − ${angT(s)}`)} et ${fx("cos(π − x) = −cos(x)")} : le cosinus d'un angle obtus est négatif. Donc ${fx(`cos(${angT(th)}) = −cos(${angT(s)}) = ${v}`)}.`
    :`${fx(`${angT(th)} = π − ${angT(s)}`)} et ${fx("sin(π − x) = sin(x)")} : le sinus d'un angle obtus reste positif. Donc ${fx(`sin(${angT(th)}) = sin(${angT(s)}) = ${v}`)}.`;}

/* lecture d'une longueur ou d'un nombre exact, puis d'un angle */
const pres=(a,b)=>a!==null&&Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
const SYML=["√","/","(",")"],SYMA=["π","/","°"];
const EXACT="C'est une valeur approchée. Au CC il faut la valeur exacte : garde la racine carrée ou la fraction, par exemple 2√5 ou 12√2/7.";
function lisNombre(s,attendu,quoi){const t=propre(s);if(!t)return {inc:`Écris ${quoi||"ta réponse"}, par exemple 7, √13 ou 5√2/3.`};const v=O.calcule(t,{});
  if(v===null||!isFinite(v))return {inc:"Je n'arrive pas à lire cette valeur. Écris par exemple 7, √13, 2√5 ou 5√2/3 : le bouton √ écrit la racine."};
  const m=/\d[.,](\d+)/.exec(t);if(m&&!pres(v,attendu)&&Math.abs(v-attendu)<=0.6*Math.pow(10,-m[1].length))return {inc:EXACT};
  return {v};}
function lisAngle(s,attendu){const t=propre(s).toLowerCase().replace(/ /g,"");if(!t)return {inc:"Écris l'angle, par exemple π/3 : le bouton π écrit la lettre."};
  const m=/^(.+?)(?:°|degr[ée]s?|deg)$/.exec(t),LIS="Je n'arrive pas à lire cet angle. Écris par exemple π/3 ou 2π/3, ou bien 60° avec le signe °.";
  if(m){const d=O.calcule(m[1],{});return d===null?{inc:LIS}:{v:d*Math.PI/180};}
  const v=O.calcule(t,{});if(v===null||!isFinite(v))return {inc:LIS};
  if(!/π|pi/.test(t)&&v!==0&&pres(v*Math.PI/180,attendu))return {inc:`${t} quoi ? En radians, l'angle s'écrit avec π, par exemple π/3. En degrés, ajoute le signe °.`};
  return {v};}

/* figure à l'échelle : points en coordonnées mathématiques (y vers le haut), remis dans un cadre de 230 de large.
   o : seg, tirets, droites [[P, Q]] ; cotes [[P, Q, texte]] ; angles [[P, sommet, Q, texte, rayon]] ; droits [[P, sommet, Q]] ;
   marques [[P, Q, nombre de traits]] ; cercles [[centre, rayon]] ; points [noms] ; pos {nom: [dx, dy]} ; alt */
function figure(P,o){const W=230,H=o.h||160,m=o.m||26,N=Object.keys(P);
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const eten=(x,y)=>{x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);};
  N.forEach(n=>eten(P[n][0],P[n][1]));(o.cercles||[]).forEach(c=>{const z=P[c[0]];eten(z[0]-c[1],z[1]-c[1]);eten(z[0]+c[1],z[1]+c[1]);});
  const k=Math.min((W-2*m)/Math.max(x1-x0,1e-9),(H-2*m)/Math.max(y1-y0,1e-9)),ox=(W-k*(x1-x0))/2,oy=(H-k*(y1-y0))/2;
  const p=n=>{const z=P[n];return [ox+k*(z[0]-x0),H-oy-k*(z[1]-y0)];},f=v=>(Math.round(v*10)/10).toFixed(1);
  const c0=N.reduce((s,n)=>{const z=p(n);return [s[0]+z[0]/N.length,s[1]+z[1]/N.length];},[0,0]);
  const un=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [dx/l,dy/l];};
  const trait=(a,b,w,d)=>`<path stroke-width="${w}"${d?` stroke-dasharray="${d}"`:""} d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}"/>`;
  const txt=(x,y,s)=>`<text x="${f(x)}" y="${f(y)}" dy="3.8">${s}</text>`;
  let L="",T="",D="";
  (o.droites||[]).forEach(s=>{const a=p(s[0]),b=p(s[1]),u=un(a,b),e=s[2]||16;L+=trait([a[0]-e*u[0],a[1]-e*u[1]],[b[0]+e*u[0],b[1]+e*u[1]],1);});
  (o.seg||[]).forEach(s=>{L+=trait(p(s[0]),p(s[1]),1.5);});
  (o.tirets||[]).forEach(s=>{L+=trait(p(s[0]),p(s[1]),1.2,"5 3");});
  (o.cercles||[]).forEach(c=>{const z=p(c[0]);L+=`<circle cx="${f(z[0])}" cy="${f(z[1])}" r="${f(k*c[1])}" stroke-width="1.2"/>`;});
  (o.droits||[]).forEach(s=>{const v=p(s[1]),a=un(v,p(s[0])),b=un(v,p(s[2])),t=7;L+=`<path stroke-width="1" d="M${f(v[0]+t*a[0])} ${f(v[1]+t*a[1])}L${f(v[0]+t*(a[0]+b[0]))} ${f(v[1]+t*(a[1]+b[1]))}L${f(v[0]+t*b[0])} ${f(v[1]+t*b[1])}"/>`;});
  (o.angles||[]).forEach(s=>{const v=p(s[1]),a=un(v,p(s[0])),b=un(v,p(s[2])),r=s[4]||15,sens=a[0]*b[1]-a[1]*b[0]>0?1:0;
    L+=`<path stroke-width="1" d="M${f(v[0]+r*a[0])} ${f(v[1]+r*a[1])}A${r} ${r} 0 0 ${sens} ${f(v[0]+r*b[0])} ${f(v[1]+r*b[1])}"/>`;
    if(s[3]){const bx=a[0]+b[0],by=a[1]+b[1],l=Math.hypot(bx,by)||1,d=r+7+2.2*String(s[3]).length;T+=txt(v[0]+d*bx/l,v[1]+d*by/l,s[3]);}});
  (o.marques||[]).forEach(s=>{const a=p(s[0]),b=p(s[1]),u=un(a,b),n=[-u[1],u[0]];for(let i=0;i<s[2];i++){const t=(i-(s[2]-1)/2)*3.2,c=[(a[0]+b[0])/2+t*u[0],(a[1]+b[1])/2+t*u[1]];L+=trait([c[0]-4*n[0],c[1]-4*n[1]],[c[0]+4*n[0],c[1]+4*n[1]],1);}});
  (o.cotes||[]).forEach(s=>{const a=p(s[0]),b=p(s[1]),mi=[(a[0]+b[0])/2,(a[1]+b[1])/2],u=un(a,b);let n=[-u[1],u[0]];
    if(Math.hypot(mi[0]+n[0]-c0[0],mi[1]+n[1]-c0[1])<Math.hypot(mi[0]-n[0]-c0[0],mi[1]-n[1]-c0[1]))n=[-n[0],-n[1]];
    const d=9+2.7*String(s[2]).length*Math.abs(n[0]);T+=txt(mi[0]+d*n[0],mi[1]+d*n[1],s[2]);});
  (o.noms||N).forEach(n=>{const z=p(n),dp=(o.pos||{})[n],u=un(c0,z);T+=txt(z[0]+(dp?dp[0]:11*u[0]),z[1]+(dp?dp[1]:11*u[1]),n);});
  (o.points||[]).forEach(n=>{const z=p(n);D+=`<circle cx="${f(z[0])}" cy="${f(z[1])}" r="2"/>`;});
  return `<svg viewBox="0 0 ${W} ${H}" style="max-width:300px;width:100%;height:auto;display:block;margin:6px 0" role="img" aria-label="${o.alt}"><g stroke="currentColor" fill="none">${L}</g><g fill="currentColor" stroke="none">${D}</g><g fill="currentColor" stroke="none" font-size="11" text-anchor="middle">${T}</g></svg>`;}
/* pose un triangle sur son plus grand côté, le troisième sommet au-dessus (les autres points suivent) */
function poser(P){const N=Object.keys(P).slice(0,3);let m=null;
  for(let i=0;i<3;i++){const a=P[N[i]],b=P[N[(i+1)%3]],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!m||d>m.d+1e-9)m={a,b,d,c:P[N[(i+2)%3]]};}
  const ux=(m.b[0]-m.a[0])/m.d,uy=(m.b[1]-m.a[1])/m.d,t=z=>[(z[0]-m.a[0])*ux+(z[1]-m.a[1])*uy,(z[1]-m.a[1])*ux-(z[0]-m.a[0])*uy],s=t(m.c)[1]<0?-1:1,R={};
  Object.keys(P).forEach(n=>{const z=t(P[n]);R[n]=[z[0],s*z[1]];});return R;}

/* ---------- GE1 : Pythagore, Al-Kashi, aire ---------- */
const TRI=["ABC","DEF","MNP","RST","EFG"],ABC=["A","B","C"];
const cote=(L,i,j)=>i<j?L[i]+L[j]:L[j]+L[i];
const angle=(L,s)=>{const u=(s+1)%3,v=(s+2)%3;return u<v?L[u]+L[s]+L[v]:L[v]+L[s]+L[u];};
const TRIP=[[3,4],[6,8],[5,12],[8,15],[9,12],[12,16]];
const faux=(d,resume)=>({ok:false,faux:d.f||["x"],resume:resume||"Ce n'est pas ça.",diag:{etape:d.etape,type:d.type,titre:d.titre,msg:d.msg}});
const champL=(id,nom,label,ex)=>({k:"champ",id,nom,label,sym:SYML,ex:ex||"par exemple 7, √13 ou 5√2/3"});
const champA=(id,nom,label)=>({k:"champ",id,nom,label,sym:SYMA,ex:"par exemple π/3"});
/* le triangle de sommets L, angle th au sommet s entre les côtés de longueurs c (vers u) et b (vers v) */
function sommets(L,s,c,b,th){const u=(s+1)%3,v=(s+2)%3,t=angV(th);return {[L[s]]:[0,0],[L[u]]:[val(c),0],[L[v]]:[val(b)*Math.cos(t),val(b)*Math.sin(t)]};}

function pythagore(R){const L=R.choix(TRI).split(""),T=L.join(""),d=R.ent(0,2),i=(d+1)%3,j=(d+2)%3,k=R.choix(["hyp","hyp","cote","cote","cote","rec","rec"]);
  if(k==="rec")return reciproque(R,L,d);
  let p,qq,h;
  for(;;){const r=R();
    if(k==="hyp"||r<0.6){[p,qq]=R()<0.35?R.mel(R.choix(TRIP)):[R.ent(1,9),R.ent(1,9)];p=S(p);qq=S(qq);h=racine(add(carre(p),carre(qq)));if(k==="cote"&&r>=0.35&&h.k===1)continue;}
    else{const hh=R.ent(3,12),pp=R.ent(1,hh-1);h=S(hh);p=S(pp);qq=racine(hh*hh-pp*pp);}
    const t=val(p)/val(qq);if(t>=0.3&&t<=3.4)break;}
  const hyp=k==="hyp",A1=cote(L,d,i),A2=cote(L,d,j),HY=cote(L,i,j),X=hyp?HY:A2,sol=hyp?h:qq,V=val(sol),x2=carre(sol),p2=carre(p),q2=carre(qq),h2=carre(h),sg=R()<0.5?-1:1;
  const fig=figure({[L[d]]:[0,0],[L[i]]:[sg*val(p),0],[L[j]]:[0,val(qq)]},{seg:[[L[d],L[i]],[L[d],L[j]],[L[i],L[j]]],droits:[[L[i],L[d],L[j]]],cotes:[[L[d],L[i],ecrit(p)],[L[d],L[j],hyp?ecrit(qq):"?"],[L[i],L[j],hyp?"?":ecrit(h)]],alt:`Le triangle ${T}, rectangle en ${L[d]}`});
  const E=hyp?[
    {w:`Le triangle ${T} est rectangle en ${L[d]}. D'après le théorème de Pythagore : ${fx(`${HY}^{2} = ${A1}^{2} + ${A2}^{2}`)}.`,why:`L'hypoténuse est le côté en face de l'angle droit, ici [${HY}] : c'est son carré qui est seul d'un côté de l'égalité. Sur la copie, on écrit le nom du triangle, le sommet de l'angle droit et le nom du théorème.`,pts:1},
    {w:fx(`${HY}^{2} = ${c2(p)} + ${c2(qq)} = ${nb(p2)} + ${nb(q2)} = ${nb(h2)}`),why:"On remplace les deux côtés de l'angle droit par leurs longueurs, et on calcule chaque carré avant d'additionner.",pts:1},
    {w:`<b>${fx(`${HY} = ${racLigne(h2)}`)}</b>`,why:`${HY} est une longueur, donc un nombre positif : c'est la racine carrée de ${nb(h2)}.${simplifie(h2)}`,pts:1}]
   :[
    {w:`Le triangle ${T} est rectangle en ${L[d]}. D'après le théorème de Pythagore : ${fx(`${HY}^{2} = ${A1}^{2} + ${A2}^{2}`)}, donc ${fx(`${A2}^{2} = ${HY}^{2} − ${A1}^{2}`)}.`,why:`L'hypoténuse est le côté en face de l'angle droit, ici [${HY}], et elle est déjà connue. Le côté cherché, [${A2}], est un côté de l'angle droit : son carré s'obtient par une soustraction.`,pts:1},
    {w:fx(`${A2}^{2} = ${c2(h)} − ${c2(p)} = ${nb(h2)} − ${nb(p2)} = ${nb(q2)}`),why:"On remplace par les longueurs de l'énoncé, et on calcule chaque carré avant de soustraire.",pts:1},
    {w:`<b>${fx(`${A2} = ${racLigne(q2)}`)}</b>`,why:`${A2} est une longueur, donc un nombre positif : c'est la racine carrée de ${nb(q2)}.${simplifie(q2)}`,pts:1}];
  function juge(rep){const r=lisNombre(rep.x,V,"la longueur "+X);if(r.inc)return {incomplet:r.inc};const v=r.v,vp=val(p),vq=val(qq),vh=val(h);if(pres(v,V))return {ok:true};
    if(pres(v,V*V))return faux({etape:2,type:"carré donné à la place de la longueur",titre:"Où ça part : la dernière ligne.",msg:`${nb(x2)}, c'est ${fx(X+"^{2}")}, le carré de la longueur. Il reste à prendre la racine carrée : ${fx(`${X} = ${ecrit(sol)}`)}.`});
    if(hyp&&pres(v,vp+vq))return faux({etape:0,type:"longueurs ajoutées sans les carrés",titre:"Où ça part : l'égalité de Pythagore.",msg:`Le théorème de Pythagore porte sur les carrés : ${fx(`${HY}^{2} = ${A1}^{2} + ${A2}^{2}`)}. On n'ajoute pas les longueurs elles-mêmes.`});
    if(hyp&&vp!==vq&&pres(v,Math.sqrt(Math.abs(vp*vp-vq*vq))))return faux({etape:0,type:"différence des carrés à la place de la somme",titre:"Où ça part : l'égalité de Pythagore.",msg:`Le côté cherché, [${HY}], est l'hypoténuse : son carré est la somme des deux autres carrés, pas leur différence.`});
    if(!hyp&&pres(v,Math.sqrt(vh*vh+vp*vp)))return faux({etape:0,type:"somme des carrés à la place de la différence",titre:"Où ça part : le choix de l'hypoténuse.",msg:`L'hypoténuse est [${HY}], en face de l'angle droit, et tu la connais déjà. Le côté cherché est un côté de l'angle droit : ${fx(`${A2}^{2} = ${HY}^{2} − ${A1}^{2}`)}.`});
    return faux({etape:1,type:"calcul des carrés",titre:"Où ça part : le calcul.",msg:`${E[1].w}.`});}
  return {sig:"PY"+JSON.stringify([T,d,k,ecrit(p),ecrit(qq),ecrit(h)]),q:`Soit ${T} un triangle rectangle en ${L[d]}, avec ${fx(`${A1} = ${ecrit(p)}`)} et ${hyp?fx(`${A2} = ${ecrit(qq)}`):fx(`${HY} = ${ecrit(h)}`)}. Calcule ${fx(X)} : donne la valeur exacte.`,
    corps:`${fig}<p>Rappel : « rectangle en ${L[d]} » veut dire que l'angle au sommet ${L[d]} est droit. Le côté en face de l'angle droit, ici [${HY}], s'appelle l'hypoténuse.</p>`,
    texte:`${T} rectangle en ${L[d]}, ${A1} = ${ecrit(p)}, ${hyp?`${A2} = ${ecrit(qq)}`:`${HY} = ${ecrit(h)}`} ; calculer ${X}`,champs:[champL("x",X,`$${X} =$`,"par exemple 5, √13 ou 2√5")],juge,etapes:E,bonne:fx(`${X} = ${ecrit(sol)}`),bonneTxt:`${X} = ${ecrit(sol)}`,
    repBonne:{x:tape(sol)},repFausse:{x:hyp?tape(S(add(p.r,qq.r))):tape(racine(add(h2,p2)))},nature:hyp?"hypoténuse":"côté de l'angle droit",ens:{type:"pyth",hyp,p:val(p),q:val(qq),h:val(h)}};}

function reciproque(R,L,d){const T=L.join(""),i=(d+1)%3,j=(d+2)%3,droit=R()<0.55;let a,b,c;
  for(;;){a=R.ent(2,9);b=R.ent(2,9);
    if(droit){if(R()<0.5)[a,b]=R.mel(R.choix(TRIP));c=racine(a*a+b*b);}
    else if(R()<0.3){c=racine(a*a+b*b+R.choix([-2,-1,1,2]));if(c.k===1)continue;}
    else{const h=Math.sqrt(a*a+b*b);let cc=R()<0.5?Math.floor(h):Math.ceil(h);if(cc*cc===a*a+b*b)cc+=R.choix([-1,1]);c=S(cc);}
    if(val(c)>Math.max(a,b)+1e-9&&val(c)<a+b-1e-9)break;}
  const N=[[cote(L,d,i),S(a)],[cote(L,d,j),S(b)],[cote(L,i,j),c]].sort((x,y)=>x[0]<y[0]?-1:1),HY=cote(L,i,j),A1=cote(L,d,i),A2=cote(L,d,j),s2=a*a+b*b,h2=carre(c),bon=droit?L[d]:"non";
  const E=[{w:`Les carrés des trois côtés : ${et(N.map(x=>fx(`${x[0]}^{2} = ${nb(carre(x[1]))}`)))}. Le plus grand côté est [${HY}].`,why:`Le plus grand carré est celui du plus grand côté. Si le triangle est rectangle, ce côté est l'hypoténuse, et l'angle droit est en face : au sommet ${L[d]}. Il n'y a donc qu'une seule égalité à essayer.`,pts:1},
    {w:`${fx(`${A1}^{2} + ${A2}^{2} = ${a*a} + ${b*b} = ${s2}`)} ${droit?`: c'est exactement ${fx(HY+"^{2}")}.`:`et ${fx(`${HY}^{2} = ${nb(h2)}`)} : les deux nombres sont différents.`}`,why:"On additionne les deux plus petits carrés, et on compare le résultat au plus grand.",pts:1},
    droit?{w:`<b>${fx(`${HY}^{2} = ${A1}^{2} + ${A2}^{2}`)} : d'après la réciproque du théorème de Pythagore, ${T} est rectangle en ${L[d]}.</b>`,why:`C'est le sens « l'égalité entraîne l'angle droit » du théorème 4.1.1 : sur la copie, on écrit bien le mot « réciproque ». Le sommet de l'angle droit est celui qui n'est pas dans le nom de l'hypoténuse [${HY}].`,pts:1}
     :{w:`<b>${fx(`${HY}^{2} ≠ ${A1}^{2} + ${A2}^{2}`)} : le triangle ${T} n'est pas rectangle.</b>`,why:`Si ${T} était rectangle, l'angle droit serait en ${L[d]}, en face du plus grand côté, et le théorème de Pythagore donnerait l'égalité. Elle est fausse, donc le triangle n'est pas rectangle.`,pts:1}];
  function juge(rep){if(!rep.r)return {incomplet:"Choisis une des quatre réponses."};if(rep.r===bon)return {ok:true};
    if(droit&&rep.r!=="non")return faux({f:[],etape:2,type:"sommet de l'angle droit mal placé",titre:"Où ça part : le sommet de l'angle droit.",msg:`Le triangle est bien rectangle, mais l'angle droit est en face de l'hypoténuse [${HY}] : au sommet ${L[d]}, celui qui n'est pas dans le nom ${HY}.`});
    if(droit)return faux({f:[],etape:1,type:"égalité de Pythagore non vue",titre:"Où ça part : la comparaison des carrés.",msg:`${fx(`${A1}^{2} + ${A2}^{2} = ${s2}`)} et ${fx(`${HY}^{2} = ${nb(h2)}`)} : les deux nombres sont égaux, donc le triangle est rectangle.`});
    return faux({f:[],etape:1,type:"triangle cru rectangle",titre:"Où ça part : la comparaison des carrés.",msg:`${fx(`${A1}^{2} + ${A2}^{2} = ${s2}`)}, alors que ${fx(`${HY}^{2} = ${nb(h2)}`)}. Les deux nombres sont différents : il n'y a pas d'angle droit.`});}
  return {sig:"PR"+JSON.stringify([T,d,a,b,ecrit(c)]),q:`Soit ${T} un triangle tel que ${et(N.map(x=>fx(`${x[0]} = ${ecrit(x[1])}`)))}. Ce triangle est-il rectangle ? Si oui, en quel sommet ?`,corps:"",
    texte:`${T} : ${N.map(x=>`${x[0]} = ${ecrit(x[1])}`).join(", ")} ; rectangle ? en quel sommet ?`,champs:[{k:"choix",id:"r",o:L.map(x=>[x,"Rectangle en "+x]).concat([["non","Pas rectangle"]])}],juge,etapes:E,
    bonne:droit?`rectangle en ${L[d]}`:"il n'est pas rectangle",bonneTxt:droit?`rectangle en ${L[d]}`:"pas rectangle",repBonne:{r:bon},repFausse:{r:droit?"non":L[d]},nature:"réciproque",ens:{type:"rec",cotes:{[A1]:a,[A2]:b,[HY]:val(c)}}};}

/* deux côtés et l'angle entre eux : th au sommet s, avec 2bc cos(th) rationnel */
function deuxCotes(R,quoi){for(;;){const r=R();let th,b,c;
    if(quoi==="demi"||r<0.62){th=R.choix([Q(1,3),Q(1,3),Q(2,3)]);if(R()<(quoi==="demi"?0.4:0.15))[b,c]=R.mel(R.choix(th.n===1?[[3,8],[5,8],[7,15],[8,15]]:[[3,5],[7,8],[5,16],[6,10]]));else{b=R.ent(1,9);c=R.ent(1,9);}b=S(b);c=S(c);}
    else if(r<0.82){th=R.choix([Q(1,4),Q(3,4)]);b=S(R.ent(1,4),2);c=S(R.ent(1,8));if(R()<0.5)[b,c]=[c,b];}
    else{th=R.choix([Q(1,6),Q(5,6)]);b=S(R.ent(1,3),3);c=S(R.ent(1,8));if(R()<0.5)[b,c]=[c,b];}
    const pr=fois(fois(b,c),cosA(th)),t=val(b)/val(c);if(pr.k!==1||t<0.3||t>3.4||(brut(th)==="1/3"&&pres(val(b),val(c))))continue;
    const a2=sub(add(carre(b),carre(c)),mul(2,pr.r));return {th,b,c,a2,a:racine(a2),pr:pr.r};}}
const figTri=(L,s,D,inconnu,plus)=>{const u=(s+1)%3,v=(s+2)%3;return figure(poser(sommets(L,s,D.c,D.b,D.th)),Object.assign({seg:[[L[0],L[1]],[L[1],L[2]],[L[0],L[2]]],cotes:[[L[s],L[u],ecrit(D.c)],[L[s],L[v],ecrit(D.b)]].concat(inconnu?[[L[u],L[v],inconnu]]:[]),angles:[[L[u],L[s],L[v],angT(D.th)]],alt:`Le triangle ${L.join("")} et l'angle connu au sommet ${L[s]}`},plus||{}));};
const donnees=(L,s,D)=>{const u=(s+1)%3,v=(s+2)%3,N=[[cote(L,s,u),D.c],[cote(L,s,v),D.b]].sort((x,y)=>x[0]<y[0]?-1:1);return `${fx(`${N[0][0]} = ${ecrit(N[0][1])}`)}, ${fx(`${N[1][0]} = ${ecrit(N[1][1])}`)} et ${absAn(angle(L,s))} ${fx("= "+angT(D.th))}`;};
const donneesTxt=(L,s,D)=>{const u=(s+1)%3,v=(s+2)%3;return `${cote(L,s,u)} = ${ecrit(D.c)}, ${cote(L,s,v)} = ${ecrit(D.b)}, angle ${angle(L,s)} = ${angT(D.th)}`;};
const rappelAngle=(L,s,th)=>`<p>Rappel : ${absAn(angle(L,s))} est l'angle du triangle au sommet ${L[s]}, entre les côtés [${cote(L,s,(s+1)%3)}] et [${cote(L,s,(s+2)%3)}]. Il est donné en radians : ${angT(th)}, c'est ${NOMANG[brut(th)]}.</p>`;
/* les étapes d'Al-Kashi pour le côté en face du sommet s */
function etapesAlKashi(L,s,D){const u=(s+1)%3,v=(s+2)%3,SU=cote(L,s,u),SV=cote(L,s,v),UV=cote(L,u,v),co=cosA(D.th),neg=co.r.n<0,c2b=carre(D.b),c2c=carre(D.c);
  return [{w:`Le côté [${UV}] est en face de l'angle connu, celui du sommet ${L[s]}. D'après le théorème d'Al-Kashi dans le triangle ${L.join("")} : ${fx(`${UV}^{2} = ${SU}^{2} + ${SV}^{2} − 2 × ${SU} × ${SV} × cos(${angT(D.th)})`)}.`,why:"Al-Kashi donne le carré d'un côté à partir des deux autres côtés et de l'angle qu'ils forment, l'angle d'en face. C'est l'égalité de Pythagore avec un terme en plus, qui vaut 0 quand l'angle est droit.",pts:1},
    {w:fx(`cos(${angT(D.th)}) = ${ecrit(co)}`),why:pourquoiTrig(D.th,"cos"),pts:0.5},
    {w:fx(`${UV}^{2} = ${c2(D.c)} + ${c2(D.b)} − 2 × ${ecrit(D.c)} × ${ecrit(D.b)} × ${gr(co)} = ${nb(c2c)} + ${nb(c2b)} ${neg?"+":"−"} ${nb(Math.abs(2*D.pr.n/D.pr.d))} = ${nb(D.a2)}`),why:neg?"Le cosinus est négatif : « moins par moins donne plus », le dernier terme s'ajoute.":"On calcule d'abord le produit 2 × … × cos(…), puis on le retire de la somme des deux carrés.",pts:1},
    {w:`<b>${fx(`${UV} = ${racLigne(D.a2)}`)}</b>`,why:`${UV} est une longueur, donc un nombre positif : c'est la racine carrée de ${nb(D.a2)}.${simplifie(D.a2)}`,pts:0.5}];}
function erreurAlKashi(x,L,s,D,E){const u=(s+1)%3,v=(s+2)%3,SU=cote(L,s,u),SV=cote(L,s,v),UV=cote(L,u,v),A=val(D.a),B=val(D.b),C=val(D.c),co=val(cosA(D.th)),si=val(sinA(D.th)),car=y=>y>0?Math.sqrt(y):-1;
  if(pres(x,A*A))return faux({etape:3,type:"carré donné à la place de la longueur",titre:"Où ça part : la dernière ligne.",msg:`${nb(D.a2)}, c'est ${fx(UV+"^{2}")}. Il reste à prendre la racine carrée : ${fx(`${UV} = ${ecrit(D.a)}`)}.`});
  if(pres(x,car(B*B+C*C+2*B*C*co)))return faux({etape:co<0?2:0,type:"signe du terme en cosinus",titre:"Où ça part : le signe du dernier terme.",msg:co<0?`${fx(`cos(${angT(D.th)}) = ${ecrit(cosA(D.th))}`)} est négatif : « − 2 × … × (${ecrit(cosA(D.th))}) » devient un plus.`:`Dans Al-Kashi, le terme en cosinus est retiré : ${fx(`− 2 × ${SU} × ${SV} × cos(${angT(D.th)})`)}.`});
  if(pres(x,car(B*B+C*C)))return faux({etape:0,type:"terme en cosinus oublié",titre:"Où ça part : la formule.",msg:`${fx(`${UV}^{2} = ${SU}^{2} + ${SV}^{2}`)} n'est vrai que si l'angle en ${L[s]} est droit : c'est Pythagore. Ici l'angle vaut ${angT(D.th)} : il faut le terme ${fx(`− 2 × ${SU} × ${SV} × cos(${angT(D.th)})`)}.`});
  if(pres(x,car(B*B+C*C-B*C*co)))return faux({etape:0,type:"facteur 2 oublié devant le cosinus",titre:"Où ça part : la formule.",msg:`Il y a un 2 devant le produit : ${fx(`− 2 × ${SU} × ${SV} × cos(${angT(D.th)})`)}.`});
  if(Math.abs(si-co)>1e-9&&pres(x,car(B*B+C*C-2*B*C*si)))return faux({etape:1,type:"sinus à la place du cosinus",titre:"Où ça part : la valeur du cosinus.",msg:`${fx(`cos(${angT(D.th)}) = ${ecrit(cosA(D.th))}`)}. La valeur ${ecrit(sinA(D.th))} est celle du sinus.`});
  return faux({etape:2,type:"calcul d'Al-Kashi",titre:"Où ça part : le calcul.",msg:`${E[2].w}.`});}

function alKashi(R){const L=ABC,s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,D=deuxCotes(R),UV=cote(L,u,v),E=etapesAlKashi(L,s,D),A=val(D.a);
  function juge(rep){const r=lisNombre(rep.x,A,"la longueur "+UV);if(r.inc)return {incomplet:r.inc};return pres(r.v,A)?{ok:true}:erreurAlKashi(r.v,L,s,D,E);}
  return {sig:"AK"+JSON.stringify([s,ecrit(D.b),ecrit(D.c),brut(D.th)]),q:`Soit ABC un triangle tel que ${donnees(L,s,D)}. Calcule ${fx(UV)} : donne la valeur exacte.`,
    corps:figTri(L,s,D,"?")+rappelAngle(L,s,D.th),texte:`ABC : ${donneesTxt(L,s,D)} ; calculer ${UV}`,champs:[champL("x",UV,`$${UV} =$`)],juge,etapes:E,bonne:fx(`${UV} = ${ecrit(D.a)}`),bonneTxt:`${UV} = ${ecrit(D.a)}`,
    repBonne:{x:tape(D.a)},repFausse:{x:tape(racine(add(carre(D.b),carre(D.c))))},nature:D.th.d===3?"angle de π/3 ou de 2π/3":"un côté avec une racine",ens:{type:"ak",b:val(D.b),c:val(D.c),th:angV(D.th)}};}

/* trois côtés : le cosinus d'un angle, puis l'angle quand il est remarquable */
function troisCotes(R){const L=ABC,s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,SU=cote(L,s,u),SV=cote(L,s,v),UV=cote(L,u,v),AN=angle(L,s);let th=null,a,b,c;
  for(;;){if(R()<0.68){th=R.choix([Q(1,3),Q(1,3),Q(2,3),Q(2,3),Q(1,2),Q(1,4),Q(3,4),Q(1,6),Q(5,6)]);
      if(th.d===4){b=S(R.ent(1,4),2);c=S(R.ent(1,7));}else if(th.d===6){b=S(R.ent(1,3),3);c=S(R.ent(1,7));}else{b=S(R.ent(1,8));c=S(R.ent(1,8));}
      if(R()<0.5)[b,c]=[c,b];const pr=fois(fois(b,c),cosA(th));if(pr.k!==1||(brut(th)==="1/3"&&pres(val(b),val(c))))continue;a=racine(sub(add(carre(b),carre(c)),mul(2,pr.r)));}
    else{th=null;a=S(R.ent(2,9));b=S(R.ent(2,9));c=S(R.ent(2,9));const A=val(a),B=val(b),C=val(c),co=(B*B+C*C-A*A)/(2*B*C);if(A>=B+C||B>=A+C||C>=A+B||[0,0.5,-0.5].some(x=>pres(co,x))||Math.abs(co)>0.95)continue;}
    const t=val(b)/val(c);if(t>=0.3&&t<=3.4)break;}
  const a2=carre(a),b2=carre(b),c2c=carre(c),num=sub(add(b2,c2c),a2),den=fois(2,fois(b,c)),co=sur(num,den),CO=val(co),TH=th?angV(th):null,brutT=`${nb(num)}/${gr(den)}`,fin=brutT===ecrit(co)?brutT:brutT+" = "+ecrit(co);
  const N=[[SU,c],[SV,b],[UV,a]].sort((x,y)=>x[0]<y[0]?-1:1),A=val(a),B=val(b),C=val(c),autres=[(C*C+A*A-B*B)/(2*C*A),(B*B+A*A-C*C)/(2*B*A)];
  const E=[{w:`L'angle cherché est au sommet ${L[s]}, en face du côté [${UV}]. Al-Kashi : ${fx(`${UV}^{2} = ${SU}^{2} + ${SV}^{2} − 2 × ${SU} × ${SV} ×`)} ${cosAn(AN)}, donc ${cosAn(AN)} ${fx(`= (${SU}^{2} + ${SV}^{2} − ${UV}^{2})/(2 × ${SU} × ${SV})`)}.`,why:`On écrit Al-Kashi pour le côté d'en face, [${UV}], puis on isole le cosinus : au numérateur, c'est le carré du côté d'en face qui porte le signe moins.`,pts:1},
    {w:`${cosAn(AN)} ${fx(`= (${nb(c2c)} + ${nb(b2)} − ${nb(a2)})/(2 × ${ecrit(c)} × ${ecrit(b)}) = ${fin}`)}`,why:`On remplace chaque côté par sa longueur, puis on simplifie la fraction.${den.k>1?` Pour ne pas laisser de racine au dénominateur, on multiplie en haut et en bas par √${den.k}.`:""}${th?"":" Ce n'est pas le cosinus d'un angle remarquable : on s'arrête au cosinus, comme dans l'exercice 8 de la feuille 4."}`,pts:1.5}];
  if(th)E.push({w:`<b>${absAn(AN)} ${fx("= "+angT(th))}</b>`,why:`Un angle de triangle est compris entre 0 et π, et sur cet intervalle un seul angle a pour cosinus ${ecrit(co)} : c'est ${angT(th)} (${NOMANG[brut(th)]}).${co.r.n<0?" Un cosinus négatif veut dire que l'angle est obtus.":""}`,pts:1});
  function juge(rep){const rc=lisNombre(rep.cos,CO,"le cosinus");if(rc.inc)return {incomplet:rc.inc};let ra=null;if(th){ra=lisAngle(rep.ang,TH);if(ra.inc)return {incomplet:ra.inc};}
    const okC=pres(rc.v,CO),okA=!th||pres(ra.v,TH),F=[];if(!okC)F.push("cos");if(!okA)F.push("ang");if(!F.length)return {ok:true};
    const res=`Pas tout à fait : ${!okC&&!okA?"le cosinus et l'angle sont faux":!okC?"le cosinus est faux":"le cosinus est juste, mais pas l'angle"}.`;
    if(!okC){if(CO&&pres(rc.v,-CO))return faux({f:F,etape:0,type:"signe du cosinus : numérateur à l'envers",titre:"Où ça part : en isolant le cosinus.",msg:`C'est ${fx(UV+"^{2}")}, le carré du côté d'en face, qui porte le signe moins : ${fx(`(${SU}^{2} + ${SV}^{2} − ${UV}^{2})/(2 × ${SU} × ${SV})`)}.`},res);
      if(autres.some(y=>!pres(y,CO)&&pres(rc.v,y)))return faux({f:F,etape:0,type:"cosinus d'un autre angle du triangle",titre:"Où ça part : le côté d'en face.",msg:`Tu as calculé le cosinus d'un autre angle. L'angle du sommet ${L[s]} est en face de [${UV}] : c'est ${fx(UV+"^{2}")} qui porte le signe moins.`},res);
      if(CO&&pres(rc.v,2*CO))return faux({f:F,etape:0,type:"facteur 2 oublié au dénominateur",titre:"Où ça part : en isolant le cosinus.",msg:`On divise par ${fx(`2 × ${SU} × ${SV}`)}, pas seulement par ${fx(`${SU} × ${SV}`)}.`},res);
      return faux({f:F,etape:1,type:"calcul du cosinus",titre:"Où ça part : le calcul.",msg:`${E[1].w}.`},res);}
    if(pres(ra.v,Math.PI-TH))return faux({f:F,etape:2,type:"angle supplémentaire : signe du cosinus",titre:"Où ça part : le passage du cosinus à l'angle.",msg:`Le cosinus vaut ${ecrit(co)} : il est ${co.r.n<0?"négatif, donc l'angle est obtus (plus grand que π/2)":"positif, donc l'angle est aigu (plus petit que π/2)"}. C'est ${angT(th)}.`},res);
    if(pres(ra.v,Math.PI/2-TH))return faux({f:F,etape:2,type:"π/3 et π/6 échangés",titre:"Où ça part : les valeurs à connaître.",msg:`${fx("cos(π/3) = 1/2")} et ${fx("cos(π/6) = √3/2")} : ne les échange pas. Ici le cosinus vaut ${ecrit(co)}, donc l'angle est ${angT(th)}.`},res);
    return faux({f:F,etape:2,type:"angle à partir de son cosinus",titre:"Où ça part : le passage du cosinus à l'angle.",msg:`L'angle entre 0 et π dont le cosinus vaut ${ecrit(co)} est ${angT(th)} (${NOMANG[brut(th)]}).`},res);}
  const repB={cos:tape(co)},repF={cos:CO?tape(S(mul(co.r,-1),co.k)):"1/2"};if(th){repB.ang=angT(th);repF.ang=angT(th);}
  return {sig:"TC"+JSON.stringify([s,ecrit(a),ecrit(b),ecrit(c)]),q:`Soit ABC un triangle tel que ${et(N.map(x=>fx(`${x[0]} = ${ecrit(x[1])}`)))}. Calcule ${cosAn(AN)}${th?`, puis donne l'angle ${absAn(AN)} en radians`:""}.`,
    corps:`<p>Rappel : ${an(AN)} est l'angle du triangle au sommet ${L[s]}. Le côté en face de lui est [${UV}].</p>`,texte:`ABC : ${N.map(x=>`${x[0]} = ${ecrit(x[1])}`).join(", ")} ; cos(${AN})${th?" puis l'angle":""}`,
    champs:[champL("cos","cosinus",`${cosAn(AN)} =`,"par exemple 1/2 ou -√2/2")].concat(th?[champA("ang","angle",`${absAn(AN)} =`)]:[]),juge,etapes:E,
    bonne:`<span class="en-nb">${cosAn(AN)} ${fx("= "+ecrit(co))}</span>${th?` et <span class="en-nb">${absAn(AN)} ${fx("= "+angT(th))}</span>`:""}`,bonneTxt:`cos(${AN}) = ${ecrit(co)}${th?` ; angle ${AN} = ${angT(th)}`:""}`,repBonne:repB,repFausse:repF,nature:th?"angle remarquable":"cosinus seul",
    ens:{type:"tc",a:A,b:B,c:C,remarquable:!!th}};}

/* l'aire ½ bc sin(Â), puis une hauteur */
function aireHauteur(R){const L=ABC,s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,k=R.choix(["aire","aire","hauteur","hauteur","hauteur","troisieme","troisieme"]),SU=cote(L,s,u),SV=cote(L,s,v),UV=cote(L,u,v);let D;
  for(;;){if(k==="troisieme"){D=deuxCotes(R,"demi");if(D.a.k!==1||D.a.r.d!==1)continue;}
    else{const th=R.choix([Q(1,6),Q(1,4),Q(1,3),Q(2,3),Q(3,4),Q(5,6)]),b=S(R.ent(2,9)),c=S(R.ent(2,9)),t=val(b)/val(c);if(t<0.3||t>3.4)continue;D={th,b,c};}
    break;}
  const si=sinA(D.th),ar=fois(mul(mul(D.b.r,D.c.r),DEMI),si),AR=val(ar),B=val(D.b),C=val(D.c),SI=val(si),CO=val(cosA(D.th));
  /* la hauteur : issue de u sur (SV), elle vaut SU × sin ; ou issue de s sur (UV) */
  const de=k==="hauteur"?u:s,base=k==="hauteur"?SV:UV,baseL=k==="hauteur"?D.b:D.a,HN=L[de]+"H",h=k==="aire"?null:sur(fois(2,ar),baseL),HV=h?val(h):null;
  const E=[{w:`D'après le théorème de l'aire, avec les deux côtés qui forment l'angle connu : ${fx(`Aire(ABC) = 1/2 × ${SU} × ${SV} × sin(${angT(D.th)})`)}.`,why:`L'aire d'un triangle est la moitié du produit de deux côtés par le sinus de l'angle qu'ils forment (théorème 4.2.6). L'angle doit être celui qui est entre les deux côtés : ici celui du sommet ${L[s]}.`,pts:1},
    {w:fx(`sin(${angT(D.th)}) = ${ecrit(si)}`),why:pourquoiTrig(D.th,"sin"),pts:0.5},
    {w:`<b>${fx(`Aire(ABC) = 1/2 × ${ecrit(D.c)} × ${ecrit(D.b)} × ${ecrit(si)} = ${ecrit(ar)}`)}</b>`,why:"On multiplie les nombres entre eux, puis on garde la racine telle quelle : c'est la valeur exacte.",pts:1}];
  if(k==="troisieme")E.push({w:`Pour la hauteur issue de ${L[s]}, il faut la base [${UV}]. Al-Kashi : ${fx(`${UV}^{2} = ${c2(D.c)} + ${c2(D.b)} − 2 × ${ecrit(D.c)} × ${ecrit(D.b)} × ${gr(cosA(D.th))} = ${nb(D.a2)}`)}, donc ${fx(`${UV} = ${ecrit(D.a)}`)}.`,why:`La hauteur issue de ${L[s]} tombe sur le côté d'en face, [${UV}], qui n'est pas donné : on le calcule avec Al-Kashi, puisqu'on connaît les deux autres côtés et l'angle qu'ils forment.`,pts:1});
  if(h)E.push({w:`H est le pied de la hauteur issue de ${L[de]} : ${fx(`Aire(ABC) = 1/2 × ${base} × ${HN}`)}. Donc <b>${fx(`${HN} = 2 × Aire(ABC)/${base} = ${ecrit(h)}`)}</b>.`,why:`L'aire est aussi « base × hauteur / 2 » (proposition 2.4.1), avec la base [${base}] et la hauteur qui lui est perpendiculaire. On connaît l'aire et la base : on isole la hauteur.${k==="hauteur"?` Autre chemin : dans le triangle rectangle formé par la hauteur, ${fx(`${HN} = ${SU} × sin(${angT(D.th)})`)}.`:""}`,pts:1});
  function juge(rep){const ra=lisNombre(rep.aire,AR,"l'aire");if(ra.inc)return {incomplet:ra.inc};let rh=null;if(h){rh=lisNombre(rep.h,HV,"la longueur "+HN);if(rh.inc)return {incomplet:rh.inc};}
    const okA=pres(ra.v,AR),okH=!h||pres(rh.v,HV),F=[];if(!okA)F.push("aire");if(!okH)F.push("h");if(!F.length)return {ok:true};
    const res=`Pas tout à fait : ${!okA&&!okH?"l'aire et la hauteur sont fausses":!okA?"l'aire est fausse":"l'aire est juste, mais pas la hauteur"}.`,iH=E.length-1;
    if(!okA){if(pres(ra.v,2*AR))return faux({f:F,etape:0,type:"moitié oubliée dans l'aire",titre:"Où ça part : la formule de l'aire.",msg:`Il y a un 1/2 devant : ${fx(`Aire(ABC) = 1/2 × ${SU} × ${SV} × sin(${angT(D.th)})`)}.`},res);
      if(Math.abs(SI-CO)>1e-9&&pres(ra.v,B*C*CO/2))return faux({f:F,etape:1,type:"cosinus à la place du sinus",titre:"Où ça part : la valeur du sinus.",msg:`L'aire se calcule avec le sinus : ${fx(`sin(${angT(D.th)}) = ${ecrit(si)}`)}. La valeur ${ecrit(cosA(D.th))} est celle du cosinus.`},res);
      if(pres(ra.v,B*C/2))return faux({f:F,etape:0,type:"sinus oublié dans l'aire",titre:"Où ça part : la formule de l'aire.",msg:`${fx(`1/2 × ${SU} × ${SV}`)} n'est l'aire que si l'angle en ${L[s]} est droit. Ici il faut multiplier par ${fx(`sin(${angT(D.th)}) = ${ecrit(si)}`)}.`},res);
      return faux({f:F,etape:2,type:"calcul de l'aire",titre:"Où ça part : le calcul de l'aire.",msg:`${fx(`1/2 × ${ecrit(D.c)} × ${ecrit(D.b)} × ${ecrit(si)} = ${ecrit(ar)}`)}.`},res);}
    if(pres(rh.v,HV/2))return faux({f:F,etape:iH,type:"facteur 2 oublié en isolant la hauteur",titre:"Où ça part : la hauteur.",msg:`${fx(`Aire(ABC) = 1/2 × ${base} × ${HN}`)} : en isolant, le 1/2 devient un 2. ${fx(`${HN} = 2 × Aire(ABC)/${base}`)}.`},res);
    if(k==="hauteur"&&!pres(B,C)&&pres(rh.v,B*SI))return faux({f:F,etape:iH,type:"hauteur issue d'un autre sommet",titre:"Où ça part : la base.",msg:`La hauteur issue de ${L[de]} est perpendiculaire au côté d'en face, [${base}] : c'est par ${base} qu'on divise.`},res);
    return faux({f:F,etape:iH,type:"calcul de la hauteur",titre:"Où ça part : la hauteur.",msg:`${fx(`${HN} = 2 × ${gr(ar)}/${gr(baseL)} = ${ecrit(h)}`)}.`},res);}
  const repB={aire:tape(ar)},repF={aire:tape(fois(2,ar))};if(h){repB.h=tape(h);repF.h=tape(h);}
  return {sig:"AH"+JSON.stringify([s,k,ecrit(D.b),ecrit(D.c),brut(D.th)]),q:`Soit ABC un triangle tel que ${donnees(L,s,D)}. ${h?`On note H le pied de la hauteur issue de ${L[de]}. Calcule l'aire du triangle ABC, puis la longueur ${fx(HN)}.`:"Calcule l'aire du triangle ABC."} Donne ${h?"les valeurs exactes":"la valeur exacte"}.`,
    corps:figTri(L,s,D)+(h?`<p>Rappel : la hauteur issue de ${L[de]} est la droite qui passe par ${L[de]} et qui est perpendiculaire à (${base}). Son pied H est le point où elle coupe (${base}).</p>`:rappelAngle(L,s,D.th)),
    texte:`ABC : ${donneesTxt(L,s,D)} ; aire${h?` puis hauteur ${HN} issue de ${L[de]}`:""}`,champs:[champL("aire","aire","$Aire(ABC) =$","par exemple 6√3 ou 15/2")].concat(h?[champL("h",HN,`$${HN} =$`)]:[]),juge,etapes:E,
    bonne:`${fx(`Aire(ABC) = ${ecrit(ar)}`)}${h?` et ${fx(`${HN} = ${ecrit(h)}`)}`:""}`,bonneTxt:`aire = ${ecrit(ar)}${h?` ; ${HN} = ${ecrit(h)}`:""}`,repBonne:repB,repFausse:repF,nature:k==="aire"?"aire":k==="hauteur"?"aire et hauteur":"aire, troisième côté et hauteur",
    ens:{type:"ah",k,b:B,c:C,th:angV(D.th)}};}

/* comme au CC2 2025, exercice 3 : la longueur d'une bissectrice, par les aires */
function bissectrice(R){const L=ABC,s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,SU=cote(L,s,u),SV=cote(L,s,v),UV=cote(L,u,v),SD=L[s]+"D",T1=L[s]+L[u]+"D",T2=L[s]+L[v]+"D";let th,b,c;
  for(;;){th=R.choix([Q(1,2),Q(1,2),Q(1,3),Q(2,3)]);b=R.ent(2,9);c=R.ent(2,9);const t=b/c;if(b===c||t<0.3||t>3.4||(th.d===2&&b+c===7&&b*c===12))continue;break;}
  const D={th,b:S(b),c:S(c)},demi=Q(th.n,th.d*2),droit=th.d===2,hyp=droit?racine(b*b+c*c):null,ar=fois(Q(b*c,2),sinA(th)),sd=sinA(demi),coef=fois(Q(b+c,2),sd),AD=sur(ar,coef),V=val(AD);
  const P=sommets(L,s,D.c,D.b,th),w=c/(b+c),U=P[L[u]],W=P[L[v]];P.D=[U[0]+w*(W[0]-U[0]),U[1]+w*(W[1]-U[1])];
  const fig=figure(poser(P),{seg:[[L[0],L[1]],[L[1],L[2]],[L[0],L[2]]],tirets:[[L[s],"D"]],points:["D"],cotes:[[L[s],L[u],String(c)],[L[s],L[v],String(b)]],angles:[[L[u],L[s],"D"],[L[v],L[s],"D",null,19]],alt:`Le triangle ABC et la bissectrice issue de ${L[s]}, qui coupe [${UV}] en D`});
  const a2=b*b+c*c-2*b*c*val(cosA(th)),M=Math.sqrt((2*b*b+2*c*c-a2)/4);
  const E=[{w:`${fig}La bissectrice issue de ${L[s]} coupe l'angle du sommet ${L[s]} en deux angles égaux : |${an(angle([L[u],L[s],"D"],1))}| = |${an(angle(["D",L[s],L[v]],1))}| ${fx("= "+angT(demi))}.`,why:`La bissectrice partage l'angle en deux angles de même mesure : la moitié de ${angT(th)}.`,pts:0.5},
    {w:droit?`${fx(`Aire(ABC) = 1/2 × ${SU} × ${SV} = 1/2 × ${c} × ${b} = ${ecrit(ar)}`)}, car ABC est rectangle en ${L[s]}.`:fx(`Aire(ABC) = 1/2 × ${SU} × ${SV} × sin(${angT(th)}) = 1/2 × ${c} × ${b} × ${ecrit(sinA(th))} = ${ecrit(ar)}`),why:droit?"Dans un triangle rectangle, les deux côtés de l'angle droit sont une base et la hauteur qui va avec.":`C'est le théorème de l'aire, avec les deux côtés qui forment l'angle connu. ${pourquoiTrig(th,"sin")}`,pts:1},
    {w:`D est sur le segment [${UV}], donc ${fx(`Aire(ABC) = Aire(${T1}) + Aire(${T2})`)}.`,why:"Les deux petits triangles recouvrent le grand, sans se chevaucher : leurs aires s'ajoutent.",pts:0.5},
    {w:`Par le théorème de l'aire dans chaque petit triangle : ${fx(`Aire(${T1}) = 1/2 × ${SU} × ${SD} × sin(${angT(demi)})`)} et ${fx(`Aire(${T2}) = 1/2 × ${SV} × ${SD} × sin(${angT(demi)})`)}.`,why:`Dans chaque petit triangle, on connaît un côté et l'angle au sommet ${L[s]} ; le deuxième côté de cet angle est la longueur cherchée, ${SD}.`,pts:1},
    {w:fx(`${ecrit(ar)} = 1/2 × (${c} + ${b}) × ${SD} × ${ecrit(sd)} = ${gr(coef)} × ${SD}`),why:`On met ${fx(`1/2 × ${SD} × sin(${angT(demi)})`)} en facteur, avec ${fx(`sin(${angT(demi)}) = ${ecrit(sd)}`)}.`,pts:0.5},
    {w:`<b>${fx(`${SD} = ${ecrit(AD)}`)}</b>`,why:`On divise les deux côtés par ${ecrit(coef)}.${droit?" Pour ne pas laisser de racine au dénominateur, on multiplie en haut et en bas par √2.":th.n===2?" Les √3 se simplifient.":""}`,pts:0.5}];
  function juge(rep){const r=lisNombre(rep.x,V,"la longueur "+SD);if(r.inc)return {incomplet:r.inc};const x=r.v;if(pres(x,V))return {ok:true};
    if(pres(x,M))return faux({etape:0,type:"bissectrice confondue avec la médiane",titre:"Où ça part : le point D.",msg:`D n'est pas le milieu de [${UV}] : la bissectrice coupe l'angle en deux, pas le côté d'en face. Ce que tu as calculé est la longueur de la médiane.`});
    if(pres(x,2*val(ar)/Math.sqrt(a2)))return faux({etape:0,type:"bissectrice confondue avec la hauteur",titre:"Où ça part : le point D.",msg:`La bissectrice n'est pas perpendiculaire à (${UV}) : elle coupe l'angle du sommet ${L[s]} en deux angles égaux. Ce que tu as calculé est la hauteur.`});
    if(th.n===1&&pres(x,b*c/(b+c)))return faux({etape:3,type:"angle entier dans les petits triangles",titre:"Où ça part : l'angle des petits triangles.",msg:`Dans les triangles ${T1} et ${T2}, l'angle au sommet ${L[s]} est la moitié de ${angT(th)} : ${angT(demi)}. Son sinus vaut ${ecrit(sd)}.`});
    return faux({etape:4,type:"équation en "+SD,titre:"Où ça part : l'équation.",msg:`${E[4].w}, donc ${fx(`${SD} = ${ecrit(AD)}`)}.`});}
  return {sig:"BI"+JSON.stringify([s,b,c,brut(th)]),q:`Soit ABC un triangle ${droit?`rectangle en ${L[s]} avec ${et([[SU,c],[SV,b]].sort((x,y)=>x[0]<y[0]?-1:1).map(x=>fx(`${x[0]} = ${x[1]}`)).concat(hyp.k===1?[fx(`${UV} = ${ecrit(hyp)}`)]:[]))}`:`tel que ${donnees(L,s,D)}`}. Soit D le point d'intersection de la bissectrice issue de ${L[s]} avec le segment [${UV}]. Détermine la longueur ${fx(SD)}.`,
    corps:`<p>Rappel : la bissectrice issue de ${L[s]} est la demi-droite qui partage l'angle du sommet ${L[s]} en deux angles égaux. Fais un dessin sur ton brouillon avant de calculer.</p>`,
    texte:`ABC ${droit?`rectangle en ${L[s]}, ${SU} = ${c}, ${SV} = ${b}`:donneesTxt(L,s,D)} ; D sur [${UV}] et sur la bissectrice issue de ${L[s]} ; calculer ${SD}`,champs:[champL("x",SD,`$${SD} =$`,"par exemple 12√2/7")],juge,etapes:E,bonne:fx(`${SD} = ${ecrit(AD)}`),bonneTxt:`${SD} = ${ecrit(AD)}`,
    repBonne:{x:tape(AD)},repFausse:{x:tape(S(Q(b*c+1,b+c)))},nature:"bissectrice",ens:{type:"bis",b,c,th:angV(th)}};}
/* comme la feuille 4, exercice 8 : un côté par Al-Kashi, puis le cosinus d'un autre angle */
function deuxTemps(R){const L=ABC,s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,SU=cote(L,s,u),SV=cote(L,s,v),UV=cote(L,u,v),AU=angle(L,u);let D;
  for(;;){D=deuxCotes(R,"demi");if(!pres(val(D.b),val(D.c)))break;}
  const E=etapesAlKashi(L,s,D),num=sub(add(carre(D.c),D.a2),carre(D.b)),den=fois(2,fois(D.c,D.a)),co=sur(num,den),CO=val(co),A=val(D.a),brutT=`${nb(num)}/${gr(den)}`,fin=brutT===ecrit(co)?brutT:brutT+" = "+ecrit(co);
  E.push({w:`L'angle au sommet ${L[u]} est en face du côté [${SV}]. Al-Kashi pour ce côté : ${fx(`${SV}^{2} = ${SU}^{2} + ${UV}^{2} − 2 × ${SU} × ${UV} ×`)} ${cosAn(AU)}.`,why:"On recommence avec un autre côté : chaque côté a son égalité d'Al-Kashi, avec l'angle qui est en face de lui.",pts:1},
    {w:`<b>${cosAn(AU)} ${fx(`= (${nb(carre(D.c))} + ${nb(D.a2)} − ${nb(carre(D.b))})/(2 × ${ecrit(D.c)} × ${ecrit(D.a)}) = ${fin}`)}</b>`,why:`On isole le cosinus : ${fx(`(${SU}^{2} + ${UV}^{2} − ${SV}^{2})/(2 × ${SU} × ${UV})`)}, puis on remplace. Le carré de ${UV} est déjà connu : ${nb(D.a2)}.${den.k>1?` Pour ne pas laisser de racine au dénominateur, on multiplie en haut et en bas par √${den.k}.`:""}`,pts:1.5});
  function juge(rep){const r=lisNombre(rep.x,A,"la longueur "+UV);if(r.inc)return {incomplet:r.inc};const rc=lisNombre(rep.cos,CO,"le cosinus");if(rc.inc)return {incomplet:rc.inc};
    const okX=pres(r.v,A),okC=pres(rc.v,CO);if(okX&&okC)return {ok:true};const res=`Pas tout à fait : ${!okX&&!okC?`${UV} et le cosinus sont faux`:!okX?`${UV} est faux`:`${UV} est juste, mais pas le cosinus`}.`;
    if(!okX){const d=erreurAlKashi(r.v,L,s,D,E);d.faux=okC?["x"]:["x","cos"];d.resume=res;return d;}
    if(CO&&pres(rc.v,-CO))return faux({f:["cos"],etape:5,type:"signe du cosinus : numérateur à l'envers",titre:"Où ça part : en isolant le cosinus.",msg:`C'est ${fx(SV+"^{2}")}, le carré du côté en face de l'angle, qui porte le signe moins.`},res);
    if(pres(rc.v,val(cosA(D.th))))return faux({f:["cos"],etape:4,type:"cosinus de l'angle déjà donné",titre:"Où ça part : l'angle demandé.",msg:`On demande le cosinus de l'angle au sommet ${L[u]}, pas celui du sommet ${L[s]} qui est donné dans l'énoncé.`},res);
    return faux({f:["cos"],etape:5,type:"calcul du deuxième cosinus",titre:"Où ça part : le deuxième cosinus.",msg:`${cosAn(AU)} ${fx("= "+fin)}.`},res);}
  return {sig:"DT"+JSON.stringify([s,ecrit(D.b),ecrit(D.c),brut(D.th)]),q:`Soit ABC un triangle tel que ${donnees(L,s,D)}. Détermine ${fx(UV)}, puis ${cosAn(AU)}.`,corps:`<p>Fais un dessin sur ton brouillon avant de calculer.</p>`,
    texte:`ABC : ${donneesTxt(L,s,D)} ; ${UV} puis cos(${AU})`,champs:[champL("x",UV,`$${UV} =$`),champL("cos","cosinus",`${cosAn(AU)} =`,"par exemple √7/14")],juge,etapes:E,
    bonne:`${fx(`${UV} = ${ecrit(D.a)}`)} et <span class="en-nb">${cosAn(AU)} ${fx("= "+ecrit(co))}</span>`,bonneTxt:`${UV} = ${ecrit(D.a)} ; cos(${AU}) = ${ecrit(co)}`,repBonne:{x:tape(D.a),cos:tape(co)},repFausse:{x:tape(D.a),cos:CO?tape(S(mul(co.r,-1),co.k)):"1/2"},nature:"un côté puis un cosinus",
    ens:{type:"dt",b:val(D.b),c:val(D.c),th:angV(D.th)}};}
/* une médiane, par deux fois Al-Kashi (la méthode de la feuille 4, exercice 7, avec des nombres) */
function mediane(R){const L=ABC,s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,SU=cote(L,s,u),SV=cote(L,s,v),UV=cote(L,u,v),SM=L[s]+"M",MU="M"+L[u],MV="M"+L[v],A1=L[s]+"M"+L[u],A2=L[s]+"M"+L[v];let a,b,c;
  for(;;){a=R.ent(2,10);b=R.ent(2,9);c=R.ent(2,9);if(a<b+c&&b<a+c&&c<a+b&&b!==c&&Math.max(b,c)/Math.min(b,c)<=3)break;}
  const m2=Q(2*b*b+2*c*c-a*a,4),sol=racine(m2),V=val(sol),dm=Q(a,2),dm2=nb(mul(2,mul(dm,dm))),N=[[SU,c],[SV,b],[UV,a]].sort((x,y)=>x[0]<y[0]?-1:1);
  const t=Math.acos((b*b+c*c-a*a)/(2*b*c)),P={[L[s]]:[0,0],[L[u]]:[c,0],[L[v]]:[b*Math.cos(t),b*Math.sin(t)]};P.M=[(P[L[u]][0]+P[L[v]][0])/2,(P[L[u]][1]+P[L[v]][1])/2];
  const fig=figure(poser(P),{seg:[[L[0],L[1]],[L[1],L[2]],[L[0],L[2]]],tirets:[[L[s],"M"]],points:["M"],marques:[[L[u],"M",2],["M",L[v],2]],cotes:[[L[s],L[u],String(c)],[L[s],L[v],String(b)]],alt:`Le triangle ABC et la médiane issue de ${L[s]}, qui coupe [${UV}] en son milieu M`});
  const E=[{w:`${fig}M est le milieu de [${UV}] : ${fx(`${MU} = ${MV} = ${nb(dm)}`)}. Les angles ${an(A1)} et ${an(A2)} sont supplémentaires, donc cos(${an(A2)}) = −cos(${an(A1)}).`,why:`M est sur le segment [${UV}] : les deux angles au sommet M font ensemble un angle plat, π. Et ${fx("cos(π − x) = −cos(x)")}.`,pts:1},
    {w:`Al-Kashi dans le triangle ${A1} : ${fx(`${SU}^{2} = ${SM}^{2} + ${MU}^{2} − 2 × ${SM} × ${MU} ×`)} cos(${an(A1)}).`,why:`Le côté [${SU}] est en face de l'angle du sommet M dans ce petit triangle.`,pts:0.5},
    {w:`Al-Kashi dans le triangle ${A2} : ${fx(`${SV}^{2} = ${SM}^{2} + ${MV}^{2} + 2 × ${SM} × ${MU} ×`)} cos(${an(A1)}).`,why:`Même formule dans l'autre petit triangle. Le signe a changé parce que le cosinus de l'angle ${A2} est l'opposé de l'autre, et ${fx(`${MV} = ${MU}`)}.`,pts:0.5},
    {w:`On additionne les deux égalités : ${fx(`${SU}^{2} + ${SV}^{2} = 2 × ${SM}^{2} + 2 × ${MU}^{2}`)}, c'est-à-dire ${fx(`${c*c} + ${b*b} = 2 × ${SM}^{2} + ${dm2}`)}.`,why:"Les deux termes en cosinus sont opposés : ils disparaissent dans l'addition. C'est l'idée de l'exercice 7 de la feuille 4 (théorème de la médiane).",pts:1},
    {w:`<b>${fx(`${SM}^{2} = ${nb(m2)}`)}, donc ${fx(`${SM} = ${racLigne(m2)}`)}</b>`,why:`On isole le carré de ${SM}, puis on prend la racine carrée : une longueur est positive.`,pts:1}];
  function juge(rep){const r=lisNombre(rep.x,V,"la longueur "+SM);if(r.inc)return {incomplet:r.inc};const x=r.v;if(pres(x,V))return {ok:true};
    if(pres(x,m2.n/m2.d))return faux({etape:4,type:"carré donné à la place de la longueur",titre:"Où ça part : la dernière ligne.",msg:`${nb(m2)}, c'est ${fx(SM+"^{2}")}. Il reste à prendre la racine carrée.`});
    if(pres(x,a/2))return faux({etape:0,type:"médiane crue égale à la moitié du côté",titre:"Où ça part : la longueur de la médiane.",msg:`${fx(`${SM} = ${UV}/2`)} n'est vrai que dans un triangle rectangle en ${L[s]}. Ici il faut calculer.`});
    if(pres(x,Math.sqrt((b*b+c*c)/2)))return faux({etape:3,type:"terme en "+MU+" oublié",titre:"Où ça part : l'addition des deux égalités.",msg:`En additionnant, il reste aussi ${fx(`2 × ${MU}^{2} = ${dm2}`)} à droite.`});
    return faux({etape:3,type:"calcul de la médiane",titre:"Où ça part : l'addition des deux égalités.",msg:`${fx(`${c*c} + ${b*b} = 2 × ${SM}^{2} + ${dm2}`)}, donc ${fx(`${SM}^{2} = ${nb(m2)}`)}.`});}
  return {sig:"ME"+JSON.stringify([s,a,b,c]),q:`Soit ABC un triangle tel que ${et(N.map(x=>fx(`${x[0]} = ${x[1]}`)))}. Soit M le milieu du segment [${UV}]. Détermine la longueur ${fx(SM)}.`,corps:`<p>Fais un dessin sur ton brouillon avant de calculer. Indication de la feuille 4 : les angles ${an(A1)} et ${an(A2)} ont des cosinus opposés.</p>`,
    texte:`ABC : ${N.map(x=>`${x[0]} = ${x[1]}`).join(", ")} ; M milieu de [${UV}] ; calculer ${SM}`,champs:[champL("x",SM,`$${SM} =$`)],juge,etapes:E,bonne:fx(`${SM} = ${ecrit(sol)}`),bonneTxt:`${SM} = ${ecrit(sol)}`,
    repBonne:{x:tape(sol)},repFausse:{x:tape(S(dm))},nature:"médiane",ens:{type:"med",a,b,c}};}

/* ---------- GE3 : triangles, la chasse aux angles (en radians, comme le poly) ---------- */
const PI=Q(1),DENS=[4,5,6,6,8,9,10,12,12,18],DENS4=[5,6,8,9,10,12,12,15,18,18,20],ok12=x=>x.n>0&&x.n*12>=x.d;
const ppcm=L=>L.reduce((m,x)=>{let a=m,b=x;while(b)[a,b]=[b,a%b];return m*x/a;},1);
const kpi=(k,d)=>(k===1?"":k)+"π"+(d===1?"":"/"+d);
/* « π − π/4 − π/3 = 12π/12 − 3π/12 − 4π/12 = 5π/12 » : T = [[+1 ou −1, angle], …] */
function chaine(T){const D=ppcm(T.map(t=>t[1].d)),sg=(t,i)=>i?(t[0]<0?" − ":" + "):(t[0]<0?"−":"");
  const a=T.map((t,i)=>sg(t,i)+angT(t[1])).join(""),b=T.map((t,i)=>sg(t,i)+kpi(t[1].n*D/t[1].d,D)).join(""),r=T.reduce((s,t)=>t[0]<0?sub(s,t[1]):add(s,t[1]),Q(0));
  return {r,t:a+(b===a?"":" = "+b)+" = "+angT(r),pq:b===a?"":` On met les fractions au même dénominateur, ${D}, puis on calcule les numérateurs.`};}
const vaut=(n,x)=>`${absAn(n)} ${fx("= "+angT(x))}`;
const egA=(n,x)=>`<span class="en-nb">${vaut(n,x)}</span>`;
/* triangle de base [UV] horizontale, d'angles a en U et b en V, le sommet W au-dessus */
function triAng(U,V,W,a,b,mir){const A=angV(a),B=angV(b),d=Math.sin(B)/Math.sin(A+B),m=mir?-1:1;return {[U]:[0,0],[V]:[m,0],[W]:[m*d*Math.cos(A),d*Math.sin(A)]};}
const pied=(M,A,B)=>{const ux=B[0]-A[0],uy=B[1]-A[1],t=((M[0]-A[0])*ux+(M[1]-A[1])*uy)/(ux*ux+uy*uy);return [A[0]+t*ux,A[1]+t*uy];};
const coupe=(A,B,C,D)=>{const r=[B[0]-A[0],B[1]-A[1]],s=[D[0]-C[0],D[1]-C[1]],t=((C[0]-A[0])*s[1]-(C[1]-A[1])*s[0])/(r[0]*s[1]-r[1]*s[0]);return [A[0]+t*r[0],A[1]+t*r[1]];};
const bary=(A,B,t)=>[A[0]+t*(B[0]-A[0]),A[1]+t*(B[1]-A[1])],lgr=(A,B)=>Math.hypot(B[0]-A[0],B[1]-A[1]);
/* une seule réponse, un angle : juste, ou l'une des erreurs prévues [angle, étape, sorte, titre, message] */
function jugeAng(x,E,pieges){const V=angV(x);return rep=>{const r=lisAngle(rep.x,V);if(r.inc)return {incomplet:r.inc};if(pres(r.v,V))return {ok:true};
  for(const p of pieges){const w=angV(p[0]);if(w>0&&!pres(w,V)&&pres(r.v,w))return faux({etape:p[1],type:p[2],titre:p[3],msg:p[4]});}
  return faux({etape:E.length-1,type:"calcul de l'angle",titre:"Où ça part : le calcul.",msg:E[E.length-1].w});};}
const unAngle=({nom,x,autre,pieges,...o})=>{autre=[autre].concat(pieges.map(p=>p[0])).find(y=>y&&y.n>0&&!egal(y,x))||add(x,Q(1,12));return Object.assign({champs:[champA("x","angle",`${absAn(nom)} =`)],juge:jugeAng(x,o.etapes,pieges),bonne:egA(nom,x),bonneTxt:`${nom} = ${angT(x)}`,repBonne:{x:angT(x)},repFausse:{x:angT(autre)}},o)};
const RAP_RAD="Les angles se mesurent en radians, comme dans le cours : un angle plat mesure π, un angle droit π/2.";

function somme(R){const L=R.choix(TRI).split(""),T=L.join(""),k=R.choix(["deux","deux","deux","droit","droit","double"]),s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,X=angle(L,s),U=angle(L,u),W=angle(L,v),mir=R()<0.5;let a,b,x;
  for(;;){const N=R.choix(DENS);
    if(k==="deux"){a=Q(R.ent(1,N-2),N);b=Q(R.ent(1,N-2),N);x=sub(sub(PI,a),b);}
    else if(k==="droit"){a=Q(1,2);b=Q(R.ent(1,N-1),N);x=sub(a,b);}
    else{x=Q(R.ent(1,N-1),N);a=mul(x,2);b=sub(PI,mul(x,3));}
    if([a,b,x].every(ok12)&&!(egal(a,b)&&egal(b,x)))break;}
  const P=triAng(L[u],L[v],L[s],a,b,mir),tous=[0,1,2].map(i=>absAn(angle(L,i))).join(` ${fx("+")} `)+` ${fx("= π")}`;
  const fig=figure(P,{seg:[[L[0],L[1]],[L[1],L[2]],[L[0],L[2]]],droits:k==="droit"?[[L[v],L[u],L[s]]]:[],angles:(k==="droit"?[]:[[L[v],L[u],L[s],k==="double"?"2 × ?":angT(a),15]]).concat([[L[u],L[v],L[s],angT(b),15],[L[u],L[s],L[v],"?",15]]),alt:`Le triangle ${T}`});
  let E,pieges,q;
  if(k==="deux"){const C=chaine([[1,PI],[-1,a],[-1,b]]);q=`Soit ${T} un triangle tel que ${egA(U,a)} et ${egA(W,b)}. Calcule ${absAn(X)}.`;
    E=[{w:`D'après la proposition 2.4.2, la somme des angles du triangle ${T} vaut π : ${tous}.`,why:"C'est vrai dans tout triangle. Deux angles sont connus : le troisième est ce qui manque pour arriver à π.",pts:1},
      {w:`Donc ${absAn(X)} ${fx("= π −")} ${absAn(U)} ${fx("−")} ${absAn(W)}.`,why:"On isole l'angle cherché : on retire de π les deux angles connus.",pts:0.5},
      {w:`<b>${absAn(X)} ${fx("= "+C.t)}</b>`,why:`On remplace par les valeurs de l'énoncé.${C.pq} On simplifie la fraction à la fin.`,pts:1}];
    pieges=[[sub(PI,a),1,"un seul angle retiré","Où ça part : les angles à retirer.",`Il faut retirer de π les deux angles connus, ${absAn(U)} et ${absAn(W)}, pas un seul.`],[sub(PI,b),1,"un seul angle retiré","Où ça part : les angles à retirer.",`Il faut retirer de π les deux angles connus, ${absAn(U)} et ${absAn(W)}, pas un seul.`],
      [add(a,b),1,"somme des angles connus donnée","Où ça part : l'égalité.",`${fx(angT(add(a,b)))} est la somme des deux angles connus. L'angle cherché est ce qui manque pour arriver à π : on retire cette somme de π.`],
      [sub(Q(2),add(a,b)),0,"somme des angles : 2π au lieu de π","Où ça part : la somme des angles.","La somme des trois angles d'un triangle vaut π, pas 2π (proposition 2.4.2)."]];}
  else if(k==="droit"){const C=chaine([[1,PI],[-1,a],[-1,b]]);q=`Soit ${T} un triangle rectangle en ${L[u]}, tel que ${egA(W,b)}. Calcule ${absAn(X)}.`;
    E=[{w:`${T} est rectangle en ${L[u]} : ${egA(U,a)}. D'après la proposition 2.4.2, ${tous}.`,why:`« Rectangle en ${L[u]} » donne un des trois angles : l'angle droit, π/2. La somme des trois angles d'un triangle vaut toujours π.`,pts:1},
      {w:`<b>${absAn(X)} ${fx("= "+C.t)}</b>`,why:`On retire de π l'angle droit et l'angle connu.${C.pq} Dans un triangle rectangle, les deux angles qui ne sont pas droits font ensemble π/2.`,pts:1}];
    pieges=[[sub(PI,b),0,"angle droit oublié","Où ça part : les angles du triangle.",`L'angle droit en ${L[u]} compte aussi : il vaut π/2, et il faut le retirer de π.`],[add(a,b),1,"angle connu ajouté au lieu d'être retiré","Où ça part : le signe.",`L'angle connu se retire : ${fx(`${angT(a)} − ${angT(b)}`)}, pas ${fx(`${angT(a)} + ${angT(b)}`)}.`]];}
  else{const C=chaine([[1,PI],[-1,b]]);q=`Soit ${T} un triangle tel que ${egA(W,b)} et ${absAn(U)} ${fx("= 2 ×")} ${absAn(X)}. Calcule ${absAn(X)}.`;
    E=[{w:`D'après la proposition 2.4.2, ${tous}. Comme ${absAn(U)} ${fx("= 2 ×")} ${absAn(X)}, cela donne ${fx("3 ×")} ${absAn(X)} ${fx("+")} ${absAn(W)} ${fx("= π")}.`,why:`On remplace ${absAn(U)} par 2 × ${absAn(X)} : l'angle cherché apparaît alors trois fois en tout.`,pts:1},
      {w:`${fx("3 ×")} ${absAn(X)} ${fx("= "+C.t)}`,why:`On retire de π l'angle connu.${C.pq}`,pts:1},
      {w:`<b>${absAn(X)} ${fx(`= 1/3 × ${angT(C.r)} = ${angT(x)}`)}</b>`,why:"On divise par 3, puis on simplifie la fraction.",pts:1}];
    pieges=[[mul(sub(PI,b),DEMI),0,"angle double compté une seule fois","Où ça part : l'équation.",`${absAn(U)} vaut deux fois ${absAn(X)} : en tout, ${absAn(X)} est compté trois fois, il faut diviser par 3.`],[a,2,"angle double donné","Où ça part : l'angle demandé.",`${fx(angT(a))}, c'est ${absAn(U)}, le double de l'angle demandé ${absAn(X)}.`],[C.r,2,"division par 3 oubliée","Où ça part : la dernière ligne.",`${fx(angT(C.r))}, c'est 3 × ${absAn(X)}. Il reste à diviser par 3.`]];}
  return unAngle({nom:X,x,autre:sub(PI,a),etapes:E,pieges,sig:"SO"+JSON.stringify([T,s,k,brut(a),brut(b)]),q,corps:fig+`<p>Rappel : ${absAn(X)} est l'angle du triangle au sommet ${L[s]}. ${RAP_RAD}</p>`,
    texte:`${T}${k==="droit"?` rectangle en ${L[u]}`:""} : ${k==="deux"?`angle ${U} = ${angT(a)}, `:k==="double"?`angle ${U} = 2 × angle ${X}, `:""}angle ${W} = ${angT(b)} ; calculer l'angle ${X}`,
    nature:{deux:"deux angles connus",droit:"triangle rectangle",double:"un angle double d'un autre"}[k],
    ens:{P,don:(k==="double"?[]:[[L[v],L[u],L[s],angV(a)]]).concat([[L[u],L[v],L[s],angV(b)]]),c:k==="double"?[["rap",[L[v],L[u],L[s]],[L[u],L[s],L[v]],2]]:[],ch:{x:[L[u],L[s],L[v]]}}});}

function isocele(R){const L=R.choix(TRI).split(""),T=L.join(""),s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,S0=angle(L,s),U=angle(L,u),W=angle(L,v),C1=cote(L,s,u),C2=cote(L,s,v),k=R.choix(["sommet","sommet","base","base","rect"]),motIso=R()<0.5,mir=R()<0.5,auU=R()<0.5;let a,b;
  for(;;){const N=R.choix(DENS);
    if(k==="sommet"){const kk=R.ent(1,N-1);if(R()<0.7&&(N-kk)%2)continue;a=Q(kk,N);b=mul(sub(PI,a),DEMI);}
    else if(k==="base"){b=Q(R.ent(1,N-1),N);a=sub(PI,mul(b,2));}
    else{a=Q(1,2);b=Q(1,4);}
    if(ok12(a)&&ok12(b)&&!egal(a,Q(1,3)))break;}
  const X=k==="base"?W:auU?U:W,P=triAng(L[u],L[v],L[s],b,b,mir),en=n=>n===U?[L[v],L[u],L[s]]:n===W?[L[u],L[v],L[s]]:[L[u],L[s],L[v]];
  const hyp=k==="rect"?`un triangle isocèle et rectangle en ${L[s]}`:motIso?`un triangle isocèle en ${L[s]}`:`un triangle tel que ${fx(`${C1} = ${C2}`)}`;
  const angs=k==="sommet"?[en(S0).concat([angT(a),15]),en(X).concat(["?",15])]:k==="rect"?[en(X).concat(["?",15])]:[en(U).concat([angT(b),15]),en(W).concat(["?",15]),en(S0).concat(["?",15])];
  const fig=figure(P,{seg:[[L[0],L[1]],[L[1],L[2]],[L[0],L[2]]],marques:[[L[s],L[u],1],[L[s],L[v],1]],droits:k==="rect"?[en(S0)]:[],angles:angs,alt:`Le triangle ${T}, isocèle en ${L[s]}`});
  const corps=fig+`<p>Rappel : un triangle ${T} est isocèle en ${L[s]} quand ${fx(`${C1} = ${C2}`)} : ses deux côtés égaux partent du sommet ${L[s]}.${k==="rect"?` « Rectangle en ${L[s]} » veut dire que l'angle au sommet ${L[s]} est droit.`:""} ${RAP_RAD}</p>`;
  const E0={w:`${motIso||k==="rect"?`${T} est isocèle en ${L[s]}`:`${fx(`${C1} = ${C2}`)} : le triangle ${T} est isocèle en ${L[s]}`}, donc ses angles à la base sont égaux : ${absAn(U)} = ${absAn(W)}${k==="base"?` ${fx("= "+angT(b))}`:""}.`,why:`Les deux côtés égaux, [${C1}] et [${C2}], partent de ${L[s]}. Les angles « à la base » sont ceux des deux autres sommets, ${L[u]} et ${L[v]} : ils sont égaux (feuille 1, exercice 7).`,pts:1};
  const sig="IS"+JSON.stringify([T,s,k,motIso,auU,brut(a)]),texte=`${T} ${k==="rect"?"isocèle rectangle":"isocèle"} en ${L[s]}${k==="sommet"?`, angle ${S0} = ${angT(a)}`:k==="base"?`, angle ${U} = ${angT(b)}`:""} ; calculer ${k==="base"?`les angles ${W} et ${S0}`:"l'angle "+X}`;
  const don=k==="sommet"?[en(S0).concat([angV(a)])]:k==="base"?[en(U).concat([angV(b)])]:[en(S0).concat([Math.PI/2])],ens=c=>({P,don,c:[["eg",L[s],L[u],L[s],L[v]]],ch:c});
  if(k!=="base"){const d=sub(PI,a);
    const E=[E0,{w:`D'après la proposition 2.4.2, ${absAn(S0)} ${fx("+")} ${absAn(U)} ${fx("+")} ${absAn(W)} ${fx("= π")}, donc ${absAn(S0)} ${fx("+ 2 ×")} ${absAn(X)} ${fx("= π")}.`,why:"La somme des angles d'un triangle vaut π, et les deux angles à la base ont la même mesure.",pts:1},
      {w:`<b>${absAn(X)} ${fx(`= 1/2 × (π − ${angT(a)}) = 1/2 × ${angT(d)} = ${angT(b)}`)}</b>`,why:`On retire l'angle au sommet ${L[s]}, puis on partage ce qui reste en deux angles égaux.`,pts:1}];
    return unAngle({nom:X,x:b,autre:d,etapes:E,sig,q:`Soit ${T} ${hyp}${k==="sommet"?`, avec ${egA(S0,a)}`:""}. Calcule ${absAn(X)}.`,corps,texte,nature:k==="rect"?"isocèle rectangle":motIso?"isocèle, angle au sommet":"AB = AC, angle au sommet",
      pieges:[[d,2,"moitié oubliée","Où ça part : le partage en deux.",`${fx(`π − ${angT(a)} = ${angT(d)}`)} est la somme des deux angles à la base. Chacun en vaut la moitié.`],
        [a,0,"angle à la base pris égal à l'angle au sommet","Où ça part : quels angles sont égaux.",`Ce sont les deux angles à la base, en ${L[u]} et en ${L[v]}, qui sont égaux. L'angle au sommet ${L[s]} n'a pas la même mesure, sauf si le triangle est équilatéral.`],
        [sub(PI,mul(a,2)),0,"sommet principal mal repéré","Où ça part : le sommet principal.",`L'angle donné est celui du sommet ${L[s]}, d'où partent les deux côtés égaux : ce n'est pas un angle à la base.`]],ens:ens({x:en(X)})});}
  const C=chaine([[1,PI],[-1,mul(b,2)]]),VB=angV(b),VA=angV(a);
  const E=[Object.assign({},E0,{w:"<b>"+E0.w+"</b>"}),{w:`D'après la proposition 2.4.2, ${absAn(S0)} ${fx("+")} ${absAn(U)} ${fx("+")} ${absAn(W)} ${fx("= π")}, donc ${absAn(S0)} ${fx("= π − 2 ×")} ${absAn(U)}.`,why:`La somme des angles d'un triangle vaut π, et les deux angles à la base valent tous les deux ${angT(b)}.`,pts:1},
    {w:`<b>${absAn(S0)} ${fx(`= π − 2 × ${angT(b)} = `+C.t)}</b>`,why:`On retire de π les deux angles à la base.${C.pq}`,pts:1}];
  function juge(rep){const rx=lisAngle(rep.x,VB);if(rx.inc)return {incomplet:rx.inc};const ry=lisAngle(rep.y,VA);if(ry.inc)return {incomplet:ry.inc};
    const okX=pres(rx.v,VB),okY=pres(ry.v,VA),F=[];if(!okX)F.push("x");if(!okY)F.push("y");if(!F.length)return {ok:true};
    const res=`Pas tout à fait : ${!okX&&!okY?"les deux angles sont faux":!okX?`l'angle ${W} est faux`:`l'angle ${W} est juste, mais pas l'angle ${S0}`}.`;
    if(!okX)return faux({f:F,etape:0,type:pres(rx.v,VA)?"angle à la base et angle au sommet échangés":"angles à la base",titre:"Où ça part : quels angles sont égaux.",msg:`${T} est isocèle en ${L[s]} : les angles à la base, en ${L[u]} et en ${L[v]}, sont égaux. Donc ${absAn(W)} = ${absAn(U)} ${fx("= "+angT(b))}.`},res);
    if(pres(ry.v,angV(sub(PI,b))))return faux({f:F,etape:1,type:"un seul angle à la base retiré",titre:"Où ça part : la somme des angles.",msg:`Les deux angles à la base valent ${fx(angT(b))} : il faut retirer deux fois ${fx(angT(b))} de π.`},res);
    if(pres(ry.v,angV(mul(sub(PI,b),DEMI))))return faux({f:F,etape:0,type:"angle donné pris pour l'angle au sommet",titre:"Où ça part : le sommet principal.",msg:`${fx(angT(b))} est un angle à la base, au sommet ${L[u]}. L'angle au sommet principal ${L[s]} est celui d'où partent les deux côtés égaux.`},res);
    return faux({f:F,etape:2,type:"calcul de l'angle au sommet",titre:"Où ça part : le calcul.",msg:E[2].w},res);}
  return {sig,q:`Soit ${T} ${hyp}, avec ${egA(U,b)}. Calcule ${absAn(W)} et ${absAn(S0)}.`,corps,texte,champs:[champA("x","angle "+W,`${absAn(W)} =`),champA("y","angle "+S0,`${absAn(S0)} =`)],juge,etapes:E,
    bonne:`${egA(W,b)} et ${egA(S0,a)}`,bonneTxt:`${W} = ${angT(b)} ; ${S0} = ${angT(a)}`,repBonne:{x:angT(b),y:angT(a)},repFausse:{x:angT(b),y:angT(sub(PI,b))},nature:motIso?"isocèle, angle à la base":"AB = AC, angle à la base",ens:ens({x:en(W),y:en(S0)})};}

/* deux parallèles et une sécante */
function zigzag(R){let g;for(;;){const N=R.choix([4,5,6,6,8,9,10,12,12,15,18]);g=Q(R.ent(1,N-1),N);if(g.n*6>=g.d&&g.n*6<=5*g.d&&!egal(g,DEMI))break;}
  const [a,M,e,f,N,b]=R.choix([["A","M","E","F","N","B"],["R","I","S","U","J","T"]]),G=R()<0.5?a:e,alt=G===a?b:f,H=R()<0.45?alt:(alt===b?f:b),egaux=H===alt;
  const th=G===a?g:sub(PI,g),m=R()<0.5?1:-1,c=1/Math.tan(angV(th)),t=1.3,GM=G+M+N,HN=H+N+M,AL=alt+N+M,V=egaux?g:sub(PI,g);
  const P={[a]:[m*(c-t),1],[M]:[m*c,1],[e]:[m*(c+t),1],[f]:[-m*t,0],[N]:[0,0],[b]:[m*t,0]};P["Δ"]=[m*(c+t+0.3),1];P["Δ′"]=[m*(t+0.3),0];
  const fig=figure(P,{droites:[[a,e],[f,b],[M,N,22]],points:[a,M,e,f,N,b],pos:{"Δ":[0,-9],"Δ′":[0,-9],[a]:[0,-10],[M]:[0,-10],[e]:[0,-10],[f]:[0,12],[N]:[0,12],[b]:[0,12]},angles:[[G,M,N,angT(g),16],[H,N,M,"?",16]],alt:`Deux droites parallèles Δ et Δ′ coupées par la droite (${M}${N})`});
  const E=[{w:`Les droites Δ et Δ′ sont parallèles, ${M} ∈ Δ, ${N} ∈ Δ′, et les points ${G} ∈ Δ et ${alt} ∈ Δ′ sont de part et d'autre de la sécante (${M}${N}) : les angles ${an(GM)} et ${an(AL)} sont alternes-internes.`,why:"Ce sont exactement les hypothèses du théorème 2.3.1 : deux droites, un point sur chacune, et deux points de part et d'autre de la droite qui relie ces deux points.",pts:1},
    {w:`${egaux?"<b>":""}D'après le théorème 2.3.1 des angles alternes-internes, comme Δ et Δ′ sont parallèles : ${absAn(AL)} = ${egA(GM,g)}.${egaux?"</b>":""}`,why:"Le théorème dit : les droites sont parallèles si et seulement si les angles alternes-internes sont égaux. Ici on s'en sert dans le sens « parallèles, donc angles égaux ».",pts:1}];
  if(!egaux)E.push({w:`<b>${f}, ${N} et ${b} sont alignés, avec ${N} entre ${f} et ${b} : ${absAn(HN)} ${fx("+")} ${absAn(AL)} ${fx("= π")}. Donc ${absAn(HN)} ${fx("= "+chaine([[1,PI],[-1,g]]).t)}.</b>`,why:`Les angles ${HN} et ${AL} forment ensemble un angle plat : ils sont supplémentaires, leur somme vaut π.`,pts:1});
  return unAngle({nom:HN,x:V,autre:egaux?sub(PI,g):g,etapes:E,sig:"ZZ"+JSON.stringify([brut(g),a,G===a,H===b]),
    q:`Les droites Δ et Δ′ sont parallèles. Une troisième droite les coupe en ${M} ∈ Δ et en ${N} ∈ Δ′. Les points ${a} et ${e} sont sur Δ, de part et d'autre de ${M} ; les points ${f} et ${b} sont sur Δ′, de part et d'autre de ${N} ; ${a} et ${b} sont de part et d'autre de la droite (${M}${N}). On sait que ${egA(GM,g)}. Calcule ${absAn(HN)}.`,
    corps:fig+`<p>Rappel : ${absAn(GM)} est l'angle au sommet ${M}, entre les demi-droites [${M}${G}) et [${M}${N}). ${RAP_RAD}</p>`,texte:`Δ // Δ′, sécante (${M}${N}), ${a} et ${e} sur Δ, ${f} et ${b} sur Δ′, ${a} et ${b} de part et d'autre de (${M}${N}) ; angle ${GM} = ${angT(g)} ; calculer l'angle ${HN}`,
    nature:egaux?"alternes-internes":"alternes-internes puis angle plat",
    pieges:egaux?[[sub(PI,g),1,"angles alternes-internes pris supplémentaires","Où ça part : le théorème 2.3.1.",`Les angles alternes-internes ${an(GM)} et ${an(AL)} sont égaux, pas supplémentaires.`]]
      :[[g,2,"angle plat oublié","Où ça part : le dernier angle.",`${fx(angT(g))}, c'est ${absAn(AL)}. L'angle demandé, ${absAn(HN)}, est de l'autre côté de ${N} : il complète ${absAn(AL)} jusqu'à π.`]],
    ens:{P,don:[[G,M,N,angV(g)]],c:[["par",a,e,f,b],["al",a,M,e],["al",f,N,b],["entre",M,a,e],["entre",N,f,b],["opp",a,b,M,N],["opp",a,e,M,N],["opp",G,alt,M,N]],ch:{x:[H,N,M]}}});}

/* la parallèle à (BC) passant par A : la figure de la démonstration de la somme des angles */
function parSommet(R){let b,c,a;for(;;){const N=R.choix(DENS);b=Q(R.ent(1,N-2),N);c=Q(R.ent(1,N-2),N);a=sub(sub(PI,b),c);if([a,b,c].every(ok12)&&b.n*12<=b.d*7&&c.n*12<=c.d*7)break;}
  const v1=R()<0.5,mir=R()<0.5,P=triAng("B","C","A",b,c,mir),w=0.6,dx=P.B[0]-P.C[0];P.E=[P.A[0]+w*dx,P.A[1]];P.F=[P.A[0]-w*dx,P.A[1]];P["Δ"]=[P.A[0]-(w+0.3)*dx,P.A[1]];
  const Y=v1?"CAF":"ACB";
  const fig=figure(P,{seg:[["A","B"],["B","C"],["A","C"]],droites:[["E","F"]],points:["E","F"],pos:{"Δ":[0,-9],E:[0,-10],F:[0,-10],A:[0,-10]},angles:v1?[["C","B","A",angT(b),15],["B","A","C",angT(a),14],["C","A","F","?",19]]:[["E","A","B",angT(b),19],["B","A","C",angT(a),14],["A","C","B","?",15]],alt:"Le triangle ABC et la parallèle Δ à (BC) passant par A"});
  const plat=`E, A et F sont alignés, avec A entre E et F, et les demi-droites [AB) et [AC) sont entre [AE) et [AF) : ${absAn("EAB")} ${fx("+")} ${absAn("BAC")} ${fx("+")} ${absAn("CAF")} ${fx("= π")}`,pq="Les trois angles mis bout à bout forment l'angle plat EAF. C'est la figure de la démonstration de la proposition 2.4.2 (la somme des angles d'un triangle).";
  const C=chaine([[1,PI],[-1,b],[-1,a]]);let E,pieges;
  if(v1){E=[{w:`Δ et (BC) sont parallèles, A ∈ Δ, B ∈ (BC), et E, C sont de part et d'autre de la sécante (AB) : les angles ${an("EAB")} et ${an("ABC")} sont alternes-internes. D'après le théorème 2.3.1, ${absAn("EAB")} = ${egA("ABC",b)}.`,why:"On applique le théorème 2.3.1 aux droites Δ et (BC), avec la sécante (AB) : les droites sont parallèles, donc les angles alternes-internes sont égaux.",pts:1},
      {w:plat+".",why:pq,pts:1},{w:`<b>${absAn("CAF")} ${fx("= "+C.t)}</b>`,why:`On retire de π les deux autres angles.${C.pq}`,pts:1}];
    pieges=[[b,2,"angle EAB donné","Où ça part : l'angle demandé.",`${fx(angT(b))}, c'est ${absAn("EAB")}. L'angle demandé est ${absAn("CAF")}, de l'autre côté de [AC).`],[sub(PI,a),1,"angle EAB oublié dans l'angle plat","Où ça part : l'angle plat.",`Il faut retirer de π les deux angles ${absAn("EAB")} et ${absAn("BAC")}.`],[sub(PI,b),1,"angle BAC oublié dans l'angle plat","Où ça part : l'angle plat.",`Il faut retirer de π les deux angles ${absAn("EAB")} et ${absAn("BAC")}.`]];}
  else{E=[{w:`Δ et (BC) sont parallèles, A ∈ Δ, C ∈ (BC), et F, B sont de part et d'autre de la sécante (AC) : les angles ${an("CAF")} et ${an("ACB")} sont alternes-internes. D'après le théorème 2.3.1, ${absAn("ACB")} = ${absAn("CAF")}.`,why:"On applique le théorème 2.3.1 aux droites Δ et (BC), avec la sécante (AC). F est du côté de C, donc de l'autre côté de (AC) par rapport à B.",pts:1},
      {w:`${plat}, donc ${absAn("CAF")} ${fx("= "+C.t)}.`,why:`${pq}${C.pq}`,pts:1},{w:`<b>${absAn("ACB")} = ${egA("CAF",c)}</b>`,why:"On reporte l'égalité des angles alternes-internes de la première ligne.",pts:0.5}];
    pieges=[[b,1,"angle EAB recopié","Où ça part : l'angle demandé.",`${fx(angT(b))}, c'est ${absAn("EAB")} : il est égal à ${absAn("ABC")}, en B. L'angle demandé est en C : il est égal à ${absAn("CAF")}.`],[sub(PI,a),1,"angle EAB oublié dans l'angle plat","Où ça part : l'angle plat.",`Il faut retirer de π les deux angles ${absAn("EAB")} et ${absAn("BAC")}.`],[sub(PI,b),1,"angle BAC oublié dans l'angle plat","Où ça part : l'angle plat.",`Il faut retirer de π les deux angles ${absAn("EAB")} et ${absAn("BAC")}.`]];}
  return unAngle({nom:Y,x:c,autre:b,etapes:E,pieges,sig:"PS"+JSON.stringify([v1,brut(b),brut(c)]),
    q:`Soit ABC un triangle, et Δ la droite parallèle à (BC) passant par A. Sur Δ, on place deux points E et F de part et d'autre de A, avec E et C de part et d'autre de la droite (AB). On sait que ${v1?egA("ABC",b):egA("EAB",b)} et ${egA("BAC",a)}. Calcule ${absAn(Y)}.`,
    corps:fig+`<p>${RAP_RAD}</p>`,texte:`ABC, Δ parallèle à (BC) passant par A, E et F sur Δ de part et d'autre de A, E du côté de B ; angle ${v1?"ABC":"EAB"} = ${angT(b)}, angle BAC = ${angT(a)} ; calculer l'angle ${Y}`,nature:v1?"parallèle au côté : angle en A":"parallèle au côté : angle en C",
    ens:{P,don:[v1?["C","B","A",angV(b)]:["E","A","B",angV(b)],["B","A","C",angV(a)]],c:[["par","E","F","B","C"],["entre","A","E","F"],["opp","E","C","A","B"],["opp","F","B","A","C"]],ch:{x:v1?["C","A","F"]:["A","C","B"]}}});}

/* un trapèze et sa diagonale */
function trapeze(R){let x,y,z;for(;;){const N=R.choix(DENS);x=Q(R.ent(1,N-2),N);y=Q(R.ent(1,N-2),N);z=sub(sub(PI,x),y);if(ok12(z)&&x.n*6>=x.d&&y.n*6>=y.d&&y.n*3<=2*y.d&&x.n*2<x.d)break;}
  const k=R.choix(["DAC","DAC","ADC","BAC"]),mir=R()<0.5,P=triAng("D","C","A",y,x,mir),t=R.choix([0.45,0.6,0.75]);P.B=[P.A[0]+t*(P.C[0]-P.D[0]),P.A[1]];
  const val={BAC:x,ADC:y,DAC:z},don=["BAC","ADC","DAC"].filter(n=>n!==k),lab={BAC:["C","A","B",17],ADC:["A","D","C",15],DAC:["D","A","C",21]};
  const fig=figure(P,{seg:[["A","B"],["B","C"],["C","D"],["D","A"]],tirets:[["A","C"]],angles:["BAC","ADC","DAC"].map(n=>[lab[n][0],lab[n][1],lab[n][2],n===k?"?":angT(val[n]),lab[n][3]]),alt:"Le trapèze ABCD et sa diagonale [AC]"});
  const alt=`(AB) et (DC) sont parallèles, et B, D sont de part et d'autre de la diagonale (AC) : les angles ${an("BAC")} et ${an("ACD")} sont alternes-internes. D'après le théorème 2.3.1, ${absAn("ACD")} = `,whyAlt="On applique le théorème 2.3.1 aux droites (AB) et (DC), avec la sécante (AC). Dans un trapèze, les sommets B et D sont de part et d'autre de la diagonale (AC).";
  let E,pieges;
  if(k!=="BAC"){const autre=k==="DAC"?"ADC":"DAC",C=chaine([[1,PI],[-1,val[autre]],[-1,x]]);
    E=[{w:alt+egA("BAC",x)+".",why:whyAlt,pts:1},
      {w:`Dans le triangle ACD, la somme des angles vaut π (proposition 2.4.2) : ${absAn(k)} ${fx("= π −")} ${absAn(autre)} ${fx("−")} ${absAn("ACD")}.`,why:"Deux angles du triangle ACD sont maintenant connus : le troisième s'en déduit.",pts:0.5},
      {w:`<b>${absAn(k)} ${fx("= "+C.t)}</b>`,why:`On remplace par les valeurs.${C.pq}`,pts:1}];
    pieges=[[sub(PI,val[autre]),0,"angle ACD oublié","Où ça part : les angles du triangle ACD.",`Dans le triangle ACD, il faut aussi retirer ${absAn("ACD")}, qui vaut ${fx(angT(x))} : il est alterne-interne avec ${absAn("BAC")}.`],[sub(PI,x),1,`angle ${autre} oublié`,"Où ça part : les angles du triangle ACD.",`Dans le triangle ACD, il faut retirer les deux angles connus, ${absAn(autre)} et ${absAn("ACD")}.`],[add(x,val[autre]),1,"somme des deux angles donnée","Où ça part : l'égalité.",`${fx(angT(add(x,val[autre])))} est la somme des deux angles connus du triangle ACD. Le troisième est ce qui manque pour arriver à π.`]];}
  else{const C=chaine([[1,PI],[-1,y],[-1,z]]);
    E=[{w:alt+absAn("BAC")+".",why:whyAlt,pts:1},
      {w:`Dans le triangle ACD, la somme des angles vaut π (proposition 2.4.2) : ${absAn("ACD")} ${fx("= "+C.t)}.`,why:`On retire de π les deux angles connus du triangle ACD.${C.pq}`,pts:1},
      {w:`<b>${absAn("BAC")} = ${egA("ACD",x)}</b>`,why:"On reporte l'égalité des angles alternes-internes de la première ligne.",pts:0.5}];
    pieges=[[sub(PI,y),1,"angle DAC oublié","Où ça part : les angles du triangle ACD.",`Dans le triangle ACD, il faut retirer les deux angles connus, ${absAn("ADC")} et ${absAn("DAC")}.`],[sub(PI,z),1,"angle ADC oublié","Où ça part : les angles du triangle ACD.",`Dans le triangle ACD, il faut retirer les deux angles connus, ${absAn("ADC")} et ${absAn("DAC")}.`],[add(y,z),1,"somme des deux angles donnée","Où ça part : l'égalité.",`${fx(angT(add(y,z)))} est la somme des deux angles connus du triangle ACD. Le troisième, ${absAn("ACD")}, est ce qui manque pour arriver à π.`]];}
  const ens3={BAC:["C","A","B"],ADC:["A","D","C"],DAC:["D","A","C"]};
  return unAngle({nom:k,x:val[k],autre:pieges[0][0],etapes:E,pieges,sig:"TR"+JSON.stringify([k,brut(x),brut(y)]),
    q:`ABCD est un trapèze : les droites (AB) et (DC) sont parallèles. On sait que ${egA(don[0],val[don[0]])} et ${egA(don[1],val[don[1]])}. Calcule ${absAn(k)}.`,corps:fig+`<p>Rappel : ${absAn("BAC")} est l'angle au sommet A entre [AB) et [AC) ; ${absAn("DAC")} est l'angle au sommet A entre [AD) et [AC). ${RAP_RAD}</p>`,
    texte:`trapèze ABCD, (AB) // (DC), angle ${don[0]} = ${angT(val[don[0]])}, angle ${don[1]} = ${angT(val[don[1]])} ; calculer l'angle ${k}`,nature:"trapèze et diagonale",
    ens:{P,don:don.map(n=>ens3[n].concat([angV(val[n])])),c:[["par","A","B","D","C"],["opp","B","D","A","C"]],ch:{x:ens3[k]}}});}
const paralleles=R=>{const r=R();return r<0.4?zigzag(R):r<0.75?parSommet(R):trapeze(R);};

/* comme au CC : plusieurs triangles dans la même figure */
function isoDouble(R){let a;for(;;){const N=R.choix([5,6,8,9,10,12,12,15,18,20,24]),kk=R.ent(1,N-1);if(R()<0.7&&(N-kk)%2)continue;a=Q(kk,N);if(ok12(a)&&a.n*27<=8*a.d)break;}
  const be=mul(sub(PI,a),DEMI),t=sub(be,a),mir=R()<0.5,k=R()<0.5?"ABD":"ADB",P=triAng("B","C","A",be,be,mir);P.D=[(mir?-1:1)*Math.cos(angV(a)),Math.sin(angV(a))];
  const fig=figure(P,{seg:[["A","B"],["B","C"],["A","C"],["B","D"]],points:["D"],marques:[["A","B",1],["A","C",1],["B","D",2],["B","C",2]],angles:[["B","A","C",angT(a),15],k==="ABD"?["A","B","D","?",24]:["A","D","B","?",14]],alt:"Le triangle ABC isocèle en A et le point D de [AC]"});
  const C2=chaine([[1,PI],[-1,mul(be,2)]]),C3=chaine([[1,be],[-1,a]]);
  const E=[{w:`ABC est isocèle en A, donc ${absAn("ABC")} = ${absAn("ACB")}, et la somme des angles donne ${absAn("ABC")} ${fx(`= 1/2 × (π − ${angT(a)}) = ${angT(be)}`)}.`,why:"Les angles à la base d'un triangle isocèle sont égaux (feuille 1, exercice 7), et la somme des trois angles vaut π (proposition 2.4.2).",pts:1},
    {w:`${fx("BD = BC")} : le triangle BCD est isocèle en B, donc ${absAn("BDC")} = ${absAn("BCD")} = ${egA("ACB",be)}.`,why:"Dans BCD, les deux côtés égaux partent de B : les angles à la base sont en C et en D. Et D est sur [AC], donc l'angle BCD est le même que l'angle ACB.",pts:1},
    {w:`Dans le triangle BCD : ${absAn("DBC")} ${fx(`= π − 2 × ${angT(be)} = `+C2.t)}.`,why:`Somme des angles du triangle BCD (proposition 2.4.2), dont deux valent ${angT(be)}.`,pts:1},
    {w:`<b>D est entre A et C, donc ${absAn("ABD")} = ${absAn("ABC")} ${fx("−")} ${absAn("DBC")} ${fx("= "+C3.t)}.</b>`,why:"La demi-droite [BD) est à l'intérieur de l'angle ABC : les angles ABD et DBC mis bout à bout font l'angle ABC.",pts:1}];
  if(k==="ADB")E.splice(2,2,{w:`<b>A, D et C sont alignés, avec D entre A et C : ${absAn("ADB")} ${fx("= π −")} ${absAn("BDC")} ${fx("= "+chaine([[1,PI],[-1,be]]).t)}.</b>`,why:"Les angles ADB et BDC forment ensemble un angle plat : leur somme vaut π.",pts:1});
  return unAngle({nom:k,x:k==="ABD"?t:sub(PI,be),autre:be,etapes:E,sig:"ID"+JSON.stringify([k,brut(a)]),q:`Soit ABC un triangle isocèle en A tel que ${egA("BAC",a)}. Soit D le point du segment [AC] tel que ${fx("BD = BC")}. Calcule ${absAn(k)}.`,
    corps:fig+`<p>Rappel : « isocèle en A » veut dire ${fx("AB = AC")}. ${RAP_RAD}</p>`,texte:`ABC isocèle en A, angle BAC = ${angT(a)}, D sur [AC] avec BD = BC ; calculer l'angle ${k}`,nature:"deux triangles isocèles",
    pieges:k==="ADB"?[[be,2,"angle BDC donné","Où ça part : l'angle demandé.",`${fx(angT(be))}, c'est ${absAn("BDC")}. L'angle demandé, ${absAn("ADB")}, est de l'autre côté de D : il complète ${absAn("BDC")} jusqu'à π.`]]:[[be,3,"angle ABC entier donné","Où ça part : la dernière soustraction.",`${fx(angT(be))}, c'est ${absAn("ABC")} tout entier. L'angle ${absAn("ABD")} n'en est qu'une partie : il faut retirer ${absAn("DBC")}.`],[a,3,"angle DBC donné","Où ça part : l'angle demandé.",`${fx(angT(a))}, c'est ${absAn("DBC")}. L'angle demandé est l'autre morceau de ${absAn("ABC")} : ${absAn("ABD")}.`]],
    ens:{P,don:[["B","A","C",angV(a)]],c:[["eg","A","B","A","C"],["eg","B","D","B","C"],["entre","D","A","C"]],ch:{x:k==="ABD"?["A","B","D"]:["A","D","B"]}}});}

function bissectrices(R){const un=R()<0.4;let b,c,a;for(;;){const N=R.choix(DENS4);b=Q(R.ent(1,N-2),N);c=Q(R.ent(1,N-2),N);a=sub(sub(PI,b),c);if([a,b,c].every(ok12)&&b.n*12<=b.d*7&&c.n*12<=c.d*7)break;}
  const mir=R()<0.5,P=triAng("B","C","A",b,c,mir),la=lgr(P.B,P.C),lb=lgr(P.C,P.A),lc=lgr(P.A,P.B),s=la+lb+lc;P.I=[(la*P.A[0]+lb*P.B[0]+lc*P.C[0])/s,(la*P.A[1]+lb*P.B[1]+lc*P.C[1])/s];
  const hb=mul(b,DEMI),hc=mul(c,DEMI),V=sub(PI,add(hb,hc));
  const fig=figure(P,{seg:[["A","B"],["B","C"],["A","C"]],tirets:[["B","I"],["C","I"]],points:["I"],angles:(un?[["B","A","C",angT(a),15]]:[["C","B","A",angT(b),15],["A","C","B",angT(c),15]]).concat([["B","I","C","?",13]]),alt:"Le triangle ABC et ses bissectrices issues de B et de C"});
  let E,pieges;
  if(!un){const C=chaine([[1,PI],[-1,hb],[-1,hc]]);
    E=[{w:`[BI) est la bissectrice issue de B : ${absAn("IBC")} ${fx("= 1/2 ×")} ${absAn("ABC")} ${fx("= "+angT(hb))}. De même, ${absAn("ICB")} ${fx("= 1/2 ×")} ${absAn("ACB")} ${fx("= "+angT(hc))}.`,why:"La bissectrice partage l'angle en deux angles égaux : chacun vaut la moitié de l'angle du triangle.",pts:1},
      {w:`<b>Dans le triangle IBC : ${absAn("BIC")} ${fx("= "+C.t)}.</b>`,why:`Somme des angles du triangle IBC (proposition 2.4.2).${C.pq}`,pts:1.5}];
    pieges=[[a,1,"bissectrices oubliées","Où ça part : les demi-angles.",`${fx(angT(a))}, c'est ${absAn("BAC")}. Dans le triangle IBC, les angles en B et en C ne sont que les moitiés de ${absAn("ABC")} et ${absAn("ACB")}.`],[add(hb,hc),1,"somme des demi-angles donnée","Où ça part : l'égalité.",`${fx(angT(add(hb,hc)))} est la somme des deux angles connus du triangle IBC. L'angle ${absAn("BIC")} est ce qui manque pour arriver à π.`]];}
  else{const S2=sub(PI,a),h=mul(S2,DEMI),C=chaine([[1,PI],[-1,h]]);
    E=[{w:`[BI) et [CI) sont des bissectrices : ${absAn("IBC")} ${fx("= 1/2 ×")} ${absAn("ABC")} et ${absAn("ICB")} ${fx("= 1/2 ×")} ${absAn("ACB")}.`,why:"La bissectrice partage l'angle en deux angles égaux. On ne connaît pas les angles en B et en C : on garde leurs noms.",pts:1},
      {w:`Dans le triangle ABC : ${absAn("ABC")} ${fx("+")} ${absAn("ACB")} ${fx(`= π − ${angT(a)} = ${angT(S2)}`)}.`,why:"Somme des angles du triangle ABC (proposition 2.4.2) : on connaît la somme des deux angles en B et en C, sans les connaître chacun.",pts:1},
      {w:`<b>Dans le triangle IBC : ${absAn("BIC")} ${fx("= π − 1/2 ×")} (${absAn("ABC")} ${fx("+")} ${absAn("ACB")}) ${fx(`= π − 1/2 × ${angT(S2)} = `+C.t)}.</b>`,why:`Somme des angles du triangle IBC. Le résultat ne dépend que de l'angle en A : c'est toujours π/2 + ${absAn("BAC")}/2.${C.pq}`,pts:1}];
    pieges=[[S2,2,"moitié oubliée","Où ça part : les demi-angles.",`${fx(angT(S2))}, c'est ${absAn("ABC")} + ${absAn("ACB")}. Dans le triangle IBC, seules leurs moitiés comptent.`],[h,2,"somme des demi-angles donnée","Où ça part : la dernière ligne.",`${fx(angT(h))}, c'est ${absAn("IBC")} + ${absAn("ICB")}. Il reste à le retirer de π.`],[mul(a,DEMI),1,"moitié de l'angle en A","Où ça part : l'angle demandé.","L'angle en I n'est pas la moitié de l'angle en A : il se calcule dans le triangle IBC."]];}
  return unAngle({nom:"BIC",x:V,autre:a,etapes:E,pieges,sig:"BI"+JSON.stringify(un?[1,brut(a)]:[0,brut(b),brut(c)]),
    q:`Soit ABC un triangle tel que ${un?egA("BAC",a):`${egA("ABC",b)} et ${egA("ACB",c)}`}. Les bissectrices issues de B et de C se coupent en I. Calcule ${absAn("BIC")}.${un?` Les angles en B et en C ne sont pas donnés : exprime ce dont tu as besoin avec ${absAn("BAC")}.`:""}`,
    corps:fig+`<p>Rappel : la bissectrice issue de B est la demi-droite qui partage l'angle ${absAn("ABC")} en deux angles égaux. ${RAP_RAD}</p>`,texte:`ABC, ${un?`angle BAC = ${angT(a)}`:`angle ABC = ${angT(b)}, angle ACB = ${angT(c)}`}, I intersection des bissectrices issues de B et C ; calculer l'angle BIC`,nature:un?"bissectrices, seul l'angle en A":"bissectrices",
    ens:{P,don:un?[["B","A","C",angV(a)]]:[["C","B","A",angV(b)],["A","C","B",angV(c)]],c:[["bis","I","A","B","C"],["bis","I","A","C","B"]],ch:{x:["B","I","C"]}}});}

function orthocentre(R){const k=R()<0.5?"HBC":"BHC";let b,c,a;for(;;){const N=R.choix(DENS4);b=Q(R.ent(1,N-1),N);c=Q(R.ent(1,N-1),N);a=sub(sub(PI,b),c);if([a,b,c].every(y=>y.n*9>=y.d&&y.n*2<y.d))break;}
  const mir=R()<0.5,P=triAng("B","C","A",b,c,mir);P.E=pied(P.B,P.A,P.C);P.F=pied(P.C,P.A,P.B);P.H=coupe(P.B,P.E,P.C,P.F);
  const fig=figure(P,{seg:[["A","B"],["B","C"],["A","C"]],tirets:[["B","E"],["C","F"]],droits:[["B","E","C"],["C","F","B"]],points:["E","F","H"],angles:[["C","B","A",angT(b),15],["A","C","B",angT(c),15],k==="HBC"?["H","B","C","?",26]:["B","H","C","?",12]],alt:"Le triangle ABC, deux de ses hauteurs et l'orthocentre H"});
  const hB=sub(DEMI,c),hC=sub(DEMI,b),C1=chaine([[1,PI],[-1,DEMI],[-1,c]]);
  const E=[{w:`(BE) est perpendiculaire à (AC) en E : le triangle BEC est rectangle en E. Et E est sur [AC], donc ${absAn("ECB")} = ${egA("ACB",c)}.`,why:"Les trois angles de ABC sont aigus : le pied de chaque hauteur tombe sur le côté d'en face, entre les deux sommets.",pts:1},
    {w:`Dans le triangle BEC : ${absAn("EBC")} ${fx("= "+C1.t)}.`,why:"Somme des angles du triangle BEC (proposition 2.4.2), avec l'angle droit en E.",pts:1}];
  let pieges;
  if(k==="HBC"){E.push({w:`<b>H est sur le segment [BE], donc ${absAn("HBC")} = ${egA("EBC",hB)}.</b>`,why:"Les demi-droites [BH) et [BE) sont les mêmes : c'est le même angle.",pts:1});
    pieges=[[c,1,"angle en C recopié","Où ça part : le triangle rectangle BEC.",`${fx(angT(c))} est l'angle en C. Dans le triangle BEC rectangle en E, l'angle en B est ce qui reste : π − π/2 − ${angT(c)}.`],[hC,0,"autre hauteur","Où ça part : le bon triangle rectangle.",`${fx(angT(hC))} est l'angle ${absAn("HCB")}, du côté de C. L'angle ${absAn("HBC")} se calcule dans le triangle BEC, avec l'angle en C.`],[sub(PI,c),1,"angle droit oublié","Où ça part : le triangle rectangle BEC.","Le triangle BEC a un angle droit en E : il faut aussi retirer π/2."]];}
  else{const C2=chaine([[1,PI],[-1,DEMI],[-1,b]]),C3=chaine([[1,PI],[-1,hB],[-1,hC]]);
    E.push({w:`H est sur [BE], donc ${absAn("HBC")} ${fx("= "+angT(hB))}. De même, CFB est rectangle en F et H est sur [CF] : ${absAn("HCB")} ${fx("= "+C2.t)}.`,why:"Même raisonnement avec la hauteur issue de C : le triangle CFB est rectangle en F, et son angle en B est l'angle ABC.",pts:1},
      {w:`<b>Dans le triangle HBC : ${absAn("BHC")} ${fx("= "+C3.t)}.</b>`,why:`Somme des angles du triangle HBC (proposition 2.4.2).${C3.pq} On peut remarquer que le résultat vaut π − ${absAn("BAC")}.`,pts:1});
    pieges=[[a,3,"angle en A donné","Où ça part : l'angle demandé.",`${fx(angT(a))}, c'est ${absAn("BAC")}. L'angle ${absAn("BHC")} vaut π − ${absAn("BAC")}, il se calcule dans le triangle HBC.`],[add(hB,hC),3,"somme des deux angles donnée","Où ça part : la dernière ligne.",`${fx(angT(add(hB,hC)))}, c'est ${absAn("HBC")} + ${absAn("HCB")}. Il reste à le retirer de π.`]];}
  return unAngle({nom:k,x:k==="HBC"?hB:add(b,c),autre:k==="HBC"?c:a,etapes:E,pieges,sig:"OR"+JSON.stringify([k,brut(b),brut(c)]),
    q:`Soit ABC un triangle dont les trois angles sont aigus, avec ${egA("ABC",b)} et ${egA("ACB",c)}. On note E le pied de la hauteur issue de B, F le pied de la hauteur issue de C, et H le point d'intersection des hauteurs (BE) et (CF). Calcule ${absAn(k)}.`,
    corps:fig+`<p>Rappel : la hauteur issue de B est la droite qui passe par B et qui est perpendiculaire à (AC) ; elle coupe (AC) en E, son pied. ${RAP_RAD}</p>`,texte:`ABC aux angles aigus, angle ABC = ${angT(b)}, angle ACB = ${angT(c)}, hauteurs (BE) et (CF), orthocentre H ; calculer l'angle ${k}`,nature:k==="HBC"?"hauteur : angle en B":"orthocentre : angle en H",
    ens:{P,don:[["C","B","A",angV(b)],["A","C","B",angV(c)]],c:[["perp","B","E","A","C"],["perp","C","F","A","B"],["entre","E","A","C"],["entre","F","A","B"],["entre","H","B","E"],["entre","H","C","F"]],ch:{x:k==="HBC"?["H","B","C"]:["B","H","C"]}}});}

function hauteurBis(R){let b,c,a;for(;;){const N=R.choix(DENS4);b=Q(R.ent(1,N-1),N);c=Q(R.ent(1,N-1),N);a=sub(sub(PI,b),c);const d=sub(b,c);if([a,b,c].every(ok12)&&b.n*2<b.d&&c.n*2<c.d&&d.n>0&&d.n*9>=d.d)break;}
  const mir=R()<0.5,P=triAng("B","C","A",b,c,mir);P.H=pied(P.A,P.B,P.C);const AB=lgr(P.A,P.B),AC=lgr(P.A,P.C);P.D=bary(P.B,P.C,AB/(AB+AC));
  const bah=sub(DEMI,b),h=mul(a,DEMI),V=sub(h,bah),C0=chaine([[1,PI],[-1,DEMI],[-1,b]]),C1=chaine([[1,PI],[-1,b],[-1,c]]),C2=chaine([[1,h],[-1,bah]]);
  const fig=figure(P,{seg:[["A","B"],["B","C"],["A","C"]],tirets:[["A","H"],["A","D"]],droits:[["A","H","C"]],points:["H","D"],pos:{H:[0,12],D:[0,12]},angles:[["C","B","A",angT(b),15],["A","C","B",angT(c),15],["H","A","D","?",30]],alt:"Le triangle ABC, la hauteur et la bissectrice issues de A"});
  const E=[{w:`Le triangle ABH est rectangle en H, et H est sur [BC] : ${absAn("BAH")} ${fx("= "+C0.t)}.`,why:"Somme des angles du triangle ABH (proposition 2.4.2), avec l'angle droit en H. Son angle en B est l'angle ABC.",pts:1},
    {w:`${absAn("BAC")} ${fx("= "+C1.t)}, et [AD) est la bissectrice : ${absAn("BAD")} ${fx(`= 1/2 × ${angT(a)} = ${angT(h)}`)}.`,why:"Somme des angles de ABC, puis la bissectrice partage l'angle en A en deux moitiés.",pts:1},
    {w:`<b>H est entre B et D, donc ${absAn("HAD")} = ${absAn("BAD")} ${fx("−")} ${absAn("BAH")} ${fx("= "+C2.t)}.</b>`,why:`À partir de [AB), on rencontre d'abord [AH), puis [AD) : l'angle HAD est la différence des deux angles. En lettres, on trouve toujours la moitié de ${absAn("ABC")} − ${absAn("ACB")}.`,pts:1}];
  return unAngle({nom:"HAD",x:V,autre:h,etapes:E,sig:"HB"+JSON.stringify([brut(b),brut(c)]),
    q:`Soit ABC un triangle tel que ${egA("ABC",b)} et ${egA("ACB",c)}. On note H le pied de la hauteur issue de A, et D le point où la bissectrice issue de A coupe le segment [BC]. Calcule ${absAn("HAD")}.`,
    corps:fig+`<p>Rappel : la hauteur issue de A est la droite qui passe par A et qui est perpendiculaire à (BC) ; elle coupe (BC) en H. La bissectrice issue de A partage l'angle ${absAn("BAC")} en deux angles égaux. ${RAP_RAD}</p>`,
    texte:`ABC, angle ABC = ${angT(b)}, angle ACB = ${angT(c)}, H pied de la hauteur issue de A, D pied de la bissectrice issue de A ; calculer l'angle HAD`,nature:"hauteur et bissectrice",
    pieges:[[h,2,"angle BAD donné","Où ça part : la dernière soustraction.",`${fx(angT(h))}, c'est ${absAn("BAD")} tout entier. Il faut lui retirer ${absAn("BAH")}.`],[bah,2,"angle BAH donné","Où ça part : l'angle demandé.",`${fx(angT(bah))}, c'est ${absAn("BAH")}. L'angle demandé va de [AH) à [AD).`],[sub(b,c),2,"moitié oubliée","Où ça part : la bissectrice.",`L'angle ${absAn("BAD")} n'est que la moitié de ${absAn("BAC")}.`]],
    ens:{P,don:[["C","B","A",angV(b)],["A","C","B",angV(c)]],c:[["perp","A","H","B","C"],["bis","D","B","A","C"],["entre","H","B","D"],["entre","D","B","C"]],ch:{x:["H","A","D"]}}});}

function isoInterieur(R){const k=R()<0.5?"DAC":"ADC";let b,c,z;for(;;){const N=R.choix(DENS4);b=Q(R.ent(1,N-1),N);c=Q(R.ent(1,N-1),N);z=sub(sub(PI,mul(b,2)),c);if(ok12(b)&&ok12(c)&&ok12(z)&&b.n*12<=b.d*5)break;}
  const mir=R()<0.5,P=triAng("B","C","A",b,c,mir),a=sub(sub(PI,b),c),adb=sub(PI,mul(b,2));P.D=bary(P.B,P.C,lgr(P.A,P.B)/(2*Math.cos(angV(b))));
  const fig=figure(P,{seg:[["A","B"],["B","C"],["A","C"],["A","D"]],points:["D"],pos:{D:[0,12]},marques:[["D","A",1],["D","B",1]],angles:[["C","B","A",angT(b),15],["A","C","B",angT(c),15],k==="DAC"?["D","A","C","?",22]:["A","D","C","?",14]],alt:"Le triangle ABC et le point D de [BC]"});
  const E0={w:`${fx("DA = DB")} : le triangle ABD est isocèle en D, donc ${absAn("BAD")} = ${absAn("ABD")} = ${egA("ABC",b)}.`,why:"Dans ABD, les deux côtés égaux partent de D : les angles à la base sont en A et en B. Et D est sur [BC], donc l'angle ABD est l'angle ABC.",pts:1};
  let E,pieges,V;
  if(k==="DAC"){const C1=chaine([[1,PI],[-1,b],[-1,c]]),C2=chaine([[1,a],[-1,b]]);V=z;
    E=[E0,{w:`Dans le triangle ABC : ${absAn("BAC")} ${fx("= "+C1.t)}.`,why:"Somme des angles (proposition 2.4.2).",pts:1},
      {w:`<b>D est entre B et C, donc ${absAn("DAC")} = ${absAn("BAC")} ${fx("−")} ${absAn("BAD")} ${fx("= "+C2.t)}.</b>`,why:"La demi-droite [AD) est à l'intérieur de l'angle BAC : les angles BAD et DAC mis bout à bout font l'angle BAC.",pts:1}];
    pieges=[[a,2,"angle BAC entier donné","Où ça part : la dernière soustraction.",`${fx(angT(a))}, c'est ${absAn("BAC")} tout entier. Il faut lui retirer ${absAn("BAD")}.`],[b,2,"angle BAD donné","Où ça part : l'angle demandé.",`${fx(angT(b))}, c'est ${absAn("BAD")}. L'angle demandé est l'autre morceau de ${absAn("BAC")}.`]];}
  else{const C1=chaine([[1,PI],[-1,mul(b,2)]]),C2=chaine([[1,PI],[-1,adb]]);V=mul(b,2);
    E=[E0,{w:`Dans le triangle ABD : ${absAn("ADB")} ${fx(`= π − 2 × ${angT(b)} = `+C1.t)}.`,why:`Somme des angles du triangle ABD, dont deux valent ${angT(b)}.`,pts:1},
      {w:`<b>B, D et C sont alignés, avec D entre B et C : ${absAn("ADC")} ${fx("= π −")} ${absAn("ADB")} ${fx("= "+C2.t)}.</b>`,why:"Les angles ADB et ADC forment un angle plat. On retrouve 2 × |ABC| : l'angle en D de ce côté vaut la somme des deux angles à la base du triangle ABD.",pts:1}];
    pieges=[[adb,2,"angle ADB donné","Où ça part : l'angle demandé.",`${fx(angT(adb))}, c'est ${absAn("ADB")}, du côté de B. L'angle demandé, ${absAn("ADC")}, est de l'autre côté : il complète ${absAn("ADB")} jusqu'à π.`],[b,1,"angle ABD recopié","Où ça part : l'angle demandé.",`${fx(angT(b))} est l'angle en B. L'angle demandé est au sommet D.`]];}
  return unAngle({nom:k,x:V,autre:b,etapes:E,pieges,sig:"II"+JSON.stringify([k,brut(b),brut(c)]),q:`Soit ABC un triangle tel que ${egA("ABC",b)} et ${egA("ACB",c)}. Soit D le point du segment [BC] tel que ${fx("DA = DB")}. Calcule ${absAn(k)}.`,
    corps:fig+`<p>Fais le dessin sur ton brouillon et repère le triangle isocèle. ${RAP_RAD}</p>`,texte:`ABC, angle ABC = ${angT(b)}, angle ACB = ${angT(c)}, D sur [BC] avec DA = DB ; calculer l'angle ${k}`,nature:"triangle isocèle dans le triangle",
    ens:{P,don:[["C","B","A",angV(b)],["A","C","B",angV(c)]],c:[["eg","D","A","D","B"],["entre","D","B","C"]],ch:{x:k==="DAC"?["D","A","C"]:["A","D","C"]}}});}
const plusieurs=R=>{const r=R();return r<0.14?isoDouble(R):r<0.36?bissectrices(R):r<0.58?orthocentre(R):r<0.76?hauteurBis(R):isoInterieur(R);};

/* ---------- GE2 : homothéties (définition 3.3.3, théorème 3.3.4, feuille 3) ---------- */
const LAMS=[[2,1],[3,1],[1,2],[1,3],[3,2],[2,3],[4,3],[3,4],[5,2],[5,3],[-2,1],[-3,1],[-1,2],[-1,3],[-3,2],[-2,3],[-4,3],[-3,4],[-5,2],[-1,1]].map(x=>Q(x[0],x[1]));
const vabs=x=>x.n<0?mul(x,-1):x,fl=x=>x.n/x.d;
function jugeNb(V,E,pieges,quoi){return rep=>{const r=lisNombre(rep.x,V,quoi);if(r.inc)return {incomplet:r.inc};if(pres(r.v,V))return {ok:true};
  for(const p of pieges){const w=fl(p[0]);if(!pres(w,V)&&pres(r.v,w))return faux({etape:p[1],type:p[2],titre:p[3],msg:p[4]});}
  return faux({etape:E.length-1,type:"calcul",titre:"Où ça part : le calcul.",msg:E[E.length-1].w});};}
const unNombre=({nom,v,autre,pieges,ex,quoi,...o})=>{autre=[autre].concat(pieges.map(p=>p[0])).find(y=>y&&!egal(y,v))||add(v,1);
  return Object.assign({champs:[champL("x",nom,`$${nom} =$`,ex)],juge:jugeNb(fl(v),o.etapes,pieges,quoi),bonne:fx(`${nom} = ${nb(v)}`),bonneTxt:`${nom} = ${nb(v)}`.replace(/_\{(\d)\}/g,"$1"),repBonne:{x:brut(v)},repFausse:{x:brut(autre)}},o);};
const sens=(pos,K,M,N)=>pos?`${N} est du même côté de ${K} que ${M} : les vecteurs ${ve(K+M)} et ${ve(K+N)} ont le même sens, le rapport est positif`:`${N} est de l'autre côté de ${K} : les vecteurs ${ve(K+M)} et ${ve(K+N)} sont de sens contraires, le rapport est négatif`;
const quot=(a,b,r)=>{if(b===1)return String(a);const t=`${a}/${b}`;return t===nb(r)?t:t+" = "+nb(r);};

function imageLongueur(R){const k=R()<0.6?"seg":"centre",l=R.choix(LAMS),d=Q(R.ent(1,12),R.choix([1,1,1,2,3])),a=vabs(l),V=mul(a,d),N=k==="seg"?"h(A)h(B)":"KM′";
  const calc=l.n<0?`= |${nb(l)}| × ${nb(d)} = ${nb(a)} × ${nb(d)} = ${nb(V)}`:`= ${nb(l)} × ${nb(d)} = ${nb(V)}`;
  const E=k==="seg"?[{w:`D'après le théorème 3.3.4 (i), une homothétie de rapport λ multiplie toutes les distances par |λ| : ${fx("h(A)h(B) = |λ| × AB")}.`,why:"C'est la valeur absolue du rapport qui compte : une distance est toujours positive, même quand le rapport est négatif.",pts:1}]
    :[{w:`Par définition (3.3.3), ${ve("KM′")} = λ${ve("KM")}. En passant aux longueurs : ${fx("KM′ = |λ| × KM")}.`,why:"La longueur du vecteur λu est |λ| fois la longueur de u : la valeur absolue enlève le signe du rapport.",pts:1}];
  E.push({w:`<b>${fx(N+" "+calc)}</b>`,why:`On remplace par les valeurs de l'énoncé, puis on simplifie.${l.n<0&&k==="centre"?" M′ est de l'autre côté de K, mais sa distance à K reste positive.":""}`,pts:1});
  return unNombre({nom:N,v:V,autre:mul(l,d),quoi:"la longueur "+N,ex:"par exemple 6 ou 15/2",etapes:E,sig:"IL"+JSON.stringify([k,brut(l),brut(d)]),
    q:k==="seg"?`Soit h l'homothétie de centre K et de rapport ${fx("λ = "+nb(l))}. Soient A et B deux points du plan tels que ${fx("AB = "+nb(d))}. Calcule la distance ${fx("h(A)h(B)")}.`:`Soit h l'homothétie de centre K et de rapport ${fx("λ = "+nb(l))}, et M un point tel que ${fx("KM = "+nb(d))}. On note M′ = h(M). Calcule ${fx("KM′")}.`,
    corps:`<p>Rappel : l'homothétie h de centre K et de rapport λ envoie un point M sur le point h(M) tel que ${ve("Kh(M)")} = λ${ve("KM")} (définition 3.3.3).</p>`,texte:`h de centre K et de rapport ${nb(l)}, ${k==="seg"?"AB":"KM"} = ${nb(d)} ; calculer ${N}`,nature:k==="seg"?"image d'un segment":"distance au centre",
    pieges:[[mul(l,d),1,"valeur absolue oubliée","Où ça part : le signe.","Une distance est positive : c'est |λ| qui multiplie, pas λ."],[div(d,a),1,"division au lieu de multiplication","Où ça part : l'opération.","On multiplie la distance par |λ|, on ne la divise pas."],[d,0,"distance crue conservée","Où ça part : le théorème.","Une homothétie ne conserve pas les distances (sauf si |λ| = 1) : elle les multiplie par |λ|. C'est une translation qui conserve les distances."]],
    ens:{k,l:fl(l),d:fl(d)}});}

const NOMS2=[["K","A","A′"],["O","M","M′"],["I","B","C"],["Ω","P","Q"]];
function rapport(R){const [K,A,B]=R.choix(NOMS2),l=R.choix(LAMS.filter(x=>!egal(vabs(x),1))),p=l.d*R.ent(1,4),qq=Math.abs(l.n)*p/l.d,avec=R()<0.4,pos=l.n>0,a=vabs(l);
  const ab=pos?Math.abs(qq-p):qq+p,ordre=!pos?[K,A,B]:qq>p?[A,K,B]:[B,K,A],entre=`${ordre[0]} est entre ${ordre[1]} et ${ordre[2]}`;
  const E=[];
  if(avec)E.push({w:`${entre}, donc ${fx(!pos?`${K}${B} = ${A}${B} − ${K}${A} = ${ab} − ${p} = ${qq}`:qq>p?`${K}${B} = ${K}${A} + ${A}${B} = ${p} + ${ab} = ${qq}`:`${K}${B} = ${K}${A} − ${A}${B} = ${p} − ${ab} = ${qq}`)}.`,why:"Quand un point est entre deux autres, les deux petites distances s'ajoutent pour donner la grande (on lit l'ordre des points sur la droite).",pts:1});
  E.push({w:`h(${A}) = ${B} veut dire ${ve(K+B)} = λ${ve(K+A)}. En longueurs : ${fx(`${K}${B} = |λ| × ${K}${A}`)}, donc ${fx(`|λ| = ${K}${B}/${K}${A} = ${quot(qq,p,a)}`)}.`,why:"On passe aux longueurs : la longueur de λu est |λ| fois celle de u. Cela donne la valeur absolue du rapport, pas encore son signe.",pts:1},
    {w:`<b>${sens(pos,K,A,B)} : ${fx("λ = "+nb(l))}.</b>`,why:"D'après la définition 3.3.3 : si λ ≥ 0, h(M) est sur la demi-droite d'origine le centre qui passe par M ; si λ ≤ 0, il est de l'autre côté du centre.",pts:1});
  const iS=E.length-1;
  return unNombre({nom:"λ",v:l,autre:mul(l,-1),quoi:"le rapport λ",ex:"par exemple 3/2 ou -2",etapes:E,sig:"RA"+JSON.stringify([K,brut(l),p,avec]),
    q:`Soient ${K}, ${A} et ${B} trois points alignés, avec ${fx(`${K}${A} = ${p}`)}, ${avec?fx(`${A}${B} = ${ab}`)+` et ${entre}`:fx(`${K}${B} = ${qq}`)+(pos?` et ${B} sur la demi-droite [${K}${A})`:` et ${K} entre ${A} et ${B}`)}. Soit h l'homothétie de centre ${K} telle que h(${A}) = ${B}. Donne son rapport λ.`,
    corps:`<p>Rappel : h(${A}) = ${B} veut dire ${ve(K+B)} = λ${ve(K+A)} (définition 3.3.3). Fais un petit dessin de la droite avec les trois points.</p>`,texte:`${K}, ${A}, ${B} alignés, ${K}${A} = ${p}, ${avec?`${A}${B} = ${ab}, ${ordre[0]} entre ${ordre[1]} et ${ordre[2]}`:`${K}${B} = ${qq}, ${pos?"même côté":`${K} entre ${A} et ${B}`}`} ; rapport de h de centre ${K} avec h(${A}) = ${B}`,nature:avec?"rapport avec l'ordre des points":"rapport avec deux distances au centre",
    pieges:[[mul(l,-1),iS,"signe du rapport","Où ça part : le signe.",pos?`${B} est du même côté de ${K} que ${A} : le rapport est positif.`:`${K} est entre ${A} et ${B} : ${B} est de l'autre côté de ${K}, le rapport est négatif.`],[div(Q(1),l),iS-1,"rapport à l'envers","Où ça part : le quotient.",`${ve(K+B)} = λ${ve(K+A)} : λ est ${K}${B} divisé par ${K}${A}, le point d'arrivée au numérateur.`],[div(Q(-1),l),iS-1,"rapport à l'envers et signe","Où ça part : le quotient.",`λ est ${K}${B} divisé par ${K}${A}, et son signe vient de la position des points.`]],
    ens:{k:"rap",X:{[K]:0,[A]:p,[B]:fl(l)*p},noms:[K,A,B],don:avec?[[K,A,p],[A,B,ab]]:[[K,A,p],[K,B,qq]],entre:avec?ordre:pos?[A,K,B].filter(()=>false):[K,A,B],meme:!avec&&pos}});}

function deuxHom(R){const k=R.choix(["compo","compo","compo","inv","trouve","trouve"]);let l1,l2;for(;;){l1=R.choix(LAMS);l2=R.choix(LAMS);if(!(k==="trouve"&&egal(vabs(l1),1)))break;}
  const P=mul(l1,l2),deux=`Soit h₁ l'homothétie de centre K et de rapport ${fx("λ_{1} = "+nb(l1))}`;let E,pieges,nom,V,q,quoi;
  if(k==="compo"){const h21=R()<0.6,o=h21?"h₂ ∘ h₁":"h₁ ∘ h₂",[f,s,lf,ls]=h21?["h₁","h₂","λ₁","λ₂"]:["h₂","h₁","λ₂","λ₁"];nom="λ";V=P;quoi="le rapport λ";
    q=`${deux}, et h₂ l'homothétie de même centre K et de rapport ${fx("λ_{2} = "+nb(l2))}. L'application ${o} est une homothétie de centre K : donne son rapport λ.`;
    E=[{w:`Pour tout point M, par définition : ${ve(`K${f}(M)`)} = ${lf}${ve("KM")}, puis ${ve(`K${s}(${f}(M))`)} = ${ls}${ve(`K${f}(M)`)} = ${ls}${lf}${ve("KM")}.`,why:`On applique deux fois la définition 3.3.3 : d'abord ${f} à M, puis ${s} au point obtenu. Les deux homothéties ont le même centre K, c'est ce qui permet d'enchaîner (feuille 3, exercice 1).`,pts:1},
      {w:`<b>Donc ${o} est l'homothétie de centre K et de rapport ${fx(`λ_{1} × λ_{2} = ${par(l1)} × ${par(l2)} = ${nb(P)}`)}.</b>`,why:"Les rapports se multiplient. Le signe suit la règle des signes d'un produit.",pts:1}];
    pieges=[[add(l1,l2),1,"somme des rapports","Où ça part : la composée.","Les rapports se multiplient, ils ne s'ajoutent pas : on applique une homothétie, puis l'autre."],[mul(P,-1),1,"signe du produit","Où ça part : le signe.","Moins par moins donne plus ; plus par moins donne moins."],[div(l1,l2),1,"quotient des rapports","Où ça part : la composée.","Les rapports se multiplient, ils ne se divisent pas."]];}
  else if(k==="inv"){V=div(Q(1),l1);nom="μ";quoi="le rapport μ";
    q=`Soit h l'homothétie de centre K et de rapport ${fx("λ = "+nb(l1))}. Soit g l'homothétie de centre K telle que g(h(M)) = M pour tout point M. Donne le rapport μ de g.`;
    E=[{w:`g ∘ h est l'homothétie de centre K et de rapport ${fx("μ × λ")} (feuille 3, exercice 1). Or g ∘ h laisse chaque point à sa place : c'est l'homothétie de centre K et de rapport 1.`,why:`Une homothétie de rapport 1 envoie chaque point M sur lui-même, car ${ve("KM′")} = 1 × ${ve("KM")}.`,pts:1},
      {w:`<b>${fx(`μ × ${par(l1)} = 1`)}, donc ${fx(`μ = 1/${par(l1)} = ${nb(V)}`)}.</b>`,why:"Le rapport de g est l'inverse de celui de h : g « défait » ce que fait h.",pts:1}];
    pieges=[[mul(l1,-1),1,"opposé au lieu de l'inverse","Où ça part : l'inverse.","Le rapport de g est l'inverse de λ (1/λ), pas son opposé (−λ)."],[div(Q(-1),l1),1,"signe de l'inverse","Où ça part : le signe.","L'inverse de λ a le même signe que λ."],[l1,0,"même rapport","Où ça part : la composée.","Avec le même rapport, g ∘ h aurait pour rapport λ², pas 1."]];}
  else{V=l2;nom="λ_{2}";quoi="le rapport λ₂";
    q=`${deux}, et h₂ une homothétie de même centre K. On sait que h₂ ∘ h₁ est l'homothétie de centre K et de rapport ${fx(nb(P))}. Donne le rapport λ₂ de h₂.`;
    E=[{w:`h₂ ∘ h₁ est l'homothétie de centre K et de rapport ${fx("λ_{2} × λ_{1}")} (feuille 3, exercice 1). Donc ${fx(`λ_{2} × ${par(l1)} = ${nb(P)}`)}.`,why:"Composer deux homothéties de même centre multiplie les rapports : on écrit l'égalité des rapports.",pts:1},
      {w:`<b>${fx(`λ_{2} = ${par(P)}/${par(l1)} = ${nb(l2)}`)}</b>`,why:"On divise par λ₁. Diviser par une fraction, c'est multiplier par son inverse.",pts:1}];
    pieges=[[div(l1,P),1,"quotient à l'envers","Où ça part : la division.",`On divise le rapport de la composée, ${nb(P)}, par λ₁ : pas l'inverse.`],[sub(P,l1),1,"soustraction au lieu de division","Où ça part : la composée.","Les rapports se multiplient : pour retrouver λ₂, on divise, on ne soustrait pas."],[mul(P,l1),1,"multiplication au lieu de division","Où ça part : la division.","Pour isoler λ₂, on divise par λ₁."]];}
  return unNombre({nom,v:V,autre:pieges[0][0],quoi,ex:"par exemple 3/2 ou -2",etapes:E,pieges,sig:"DH"+JSON.stringify(k==="inv"?[k,brut(l1)]:[k,brut(l1),brut(l2),q.indexOf("h₂ ∘ h₁")>=0]),q,
    corps:`<p>Rappel : l'homothétie de centre K et de rapport λ envoie M sur le point M′ tel que ${ve("KM′")} = λ${ve("KM")}.${(m=>m?` « h${m[1]} ∘ h${m[2]} » veut dire : d'abord h${m[2]}, puis h${m[1]}.`:"")(q.match(/h(.) ∘ h(.)/))}</p>`,texte:{compo:`h1 (K, ${nb(l1)}), h2 (K, ${nb(l2)}) ; rapport de la composée`,inv:`h (K, ${nb(l1)}) ; rapport de g avec g(h(M)) = M`,trouve:`h1 (K, ${nb(l1)}), h2 ∘ h1 de rapport ${nb(P)} ; rapport de h2`}[k],
    nature:{compo:"composée de deux homothéties",inv:"homothétie réciproque",trouve:"rapport manquant"}[k],ens:{k,l1:fl(l1),l2:fl(l2),P:fl(P)}});}


/* ---------- GE5 : trigonométrie et produit scalaire (prop. 4.2.3, th. 4.4.1, cor. 4.4.2, déf. 4.6.2, prop. 4.6.3, cor. 4.6.4) ---------- */
const ANGR=["0","1/6","1/4","1/3","1/2","2/3","3/4","5/6","1"],qk=k=>k==="0"?Q(0):k==="1"?Q(1):Q(+k.split("/")[0],+k.split("/")[1]);
const POINT={"0":"le point (1, 0)","1/2":"le point (0, 1), tout en haut du cercle","1":"le point (−1, 0)"};
const ex1=s=>({t:ecrit(s),tape:tape(s),v:val(s)}),opp=s=>S(mul(sq(s).r,-1),sq(s).k);
function jugeEx(id,V,E,pieges,quoi){return rep=>{const r=lisNombre(rep[id],V,quoi);if(r.inc)return {incomplet:r.inc};if(pres(r.v,V))return {ok:true};
  for(const p of pieges)if(!pres(p[0],V)&&pres(r.v,p[0]))return faux({f:[id],etape:p[1],type:p[2],titre:p[3],msg:p[4]});
  return faux({f:[id],etape:E.length-1,type:"calcul",titre:"Où ça part : le calcul.",msg:E[E.length-1].w});};}
/* une réponse : un nombre exact v = {t, tape, v} ; pièges [valeur, étape, sorte, titre, message] */
const unExact=({nom,v,pieges,quoi,ex,...o})=>{const a=pieges.map(p=>p[0]).find(w=>!pres(w,v.v));
  return Object.assign({champs:[champL("x",nom,`$${nom} =$`,ex)],juge:jugeEx("x",v.v,o.etapes,pieges,quoi),bonne:`<span class="en-nb">${fx(`${nom} = ${v.t}`)}</span>`,bonneTxt:`${nom} = ${v.t}`,repBonne:{x:v.tape},repFausse:{x:a!=null?String(a):"("+v.tape+")+1"}},o);};
const SIGNE={cos:"Le cosinus est positif sur ]0 ; π/2[ et négatif sur ]π/2 ; π[ : le point du cercle trigonométrique est à droite, puis à gauche de l'axe vertical.",sin:"Le sinus est positif sur ]0 ; π[ : le point du cercle trigonométrique est au-dessus de l'axe horizontal."};

function remarquable(R){const k=R.choix(ANGR.slice(1,8).concat(ANGR)),x=qk(k),f=R()<0.5?"cos":"sin",v=f==="cos"?cosA(x):sinA(x),o=f==="cos"?sinA(x):cosA(x),V=val(v);
  const why=POINT[k]?`Sur le cercle trigonométrique (de rayon 1), l'angle ${angT(x)} donne ${POINT[k]} : son abscisse est le cosinus, son ordonnée le sinus.`:pourquoiTrig(x,f);
  const E=[{w:`${fx(angT(x))} radians, c'est ${x.n*180/x.d}°.`,why:"Un angle plat mesure π radians, c'est-à-dire 180° : on remplace π par 180.",pts:0.5},{w:`<b>${fx(`${f}(${angT(x)}) = ${ecrit(v)}`)}</b>`,why,pts:1}];
  return unExact({nom:`${f}(${angT(x)})`,v:ex1(v),quoi:"la valeur",ex:"par exemple √3/2 ou -1/2",etapes:E,sig:"TV"+f+k,q:`Donne la valeur exacte de ${fx(`${f}(${angT(x)})`)}.`,corps:`<p>Rappel : ${RAP_RAD}</p>`,texte:`${f}(${angT(x)})`,nature:"valeur à connaître",
    pieges:[[val(o),1,"cosinus et sinus échangés","Où ça part : cos ou sin.",`${ecrit(o)} est ${f==="cos"?"le sinus":"le cosinus"} de ${angT(x)}. Le cosinus est l'abscisse du point du cercle, le sinus son ordonnée.`],[-V,1,"signe","Où ça part : le signe.",SIGNE[f]]],ens:{k:"val",f,x:angV(x)}});}

const fracPQ=R=>{for(;;){const q2=R.ent(2,15),p=R.ent(1,q2-1);let a=p,b=q2;while(b)[a,b]=[b,a%b];if(a===1)return Q(p,q2);}};
function passer(R){const r=fracPQ(R),ob=R()<0.4,f=R()<0.5?"cos":"sin",g=f==="cos"?"sin":"cos",giv=ob&&f==="cos"?mul(r,-1):r,r2=mul(r,r),s2=sub(1,r2),rac=racine(s2),neg=ob&&g==="cos",res=neg?opp(rac):rac,I=ob?"]π/2 ; π[":"]0 ; π/2[";
  const E=[{w:`Pour tout réel x, ${fx("cos(x)^{2} + sin(x)^{2} = 1")}. Donc ${fx(`${g}(x)^{2} = 1 − ${par(giv)}^{2} = 1 − ${nb(r2)} = ${nb(s2)}`)}.`,why:"C'est la proposition 4.2.3 : le point du cercle trigonométrique d'angle x a pour coordonnées (cos(x), sin(x)) et il est à distance 1 de l'origine, c'est Pythagore.",pts:1},
    {w:`Sur ${I}, ${g}(x) est ${neg?"négatif":"positif"}, donc <b>${fx(`${g}(x) = ${neg?"−":""}√(${nb(s2)}) = ${ecrit(res)}`)}</b>.`,why:SIGNE[g],pts:1}];
  return unExact({nom:`${g}(x)`,v:ex1(res),quoi:"la valeur",ex:"par exemple 4/5 ou -√5/3",etapes:E,sig:"PA"+JSON.stringify([brut(r),ob,f]),q:`Soit x un réel de l'intervalle ${I} tel que ${fx(`${f}(x) = ${nb(giv)}`)}. Calcule ${fx(`${g}(x)`)} : donne la valeur exacte.`,corps:`<p>Rappel : ${RAP_RAD}</p>`,
    texte:`x dans ${I}, ${f}(x) = ${nb(giv)} ; calculer ${g}(x)`,nature:ob?"angle obtus":"angle aigu",
    pieges:[[-val(res),1,"signe","Où ça part : le signe.",SIGNE[g]],[fl(s2)*(neg?-1:1),1,"racine carrée oubliée","Où ça part : la dernière ligne.",`${nb(s2)}, c'est ${g}(x)², le carré. Il reste à prendre la racine carrée.`],[(1-fl(r))*(neg?-1:1),0,"carré oublié","Où ça part : la relation.",`C'est le carré qui intervient : ${fx(`1 − ${par(giv)}^{2}`)}, pas 1 − ${nb(giv)}.`]],ens:{k:"passe",f,g,giv:fl(giv),ob}});}

/* le cosinus et le sinus de π/12, 5π/12, 7π/12, 11π/12, ou d'un angle double */
const DECO={"1/12":["1/3","1/4",-1],"5/12":["1/4","1/6",1],"7/12":["1/3","1/4",1],"11/12":["2/3","1/4",1]};
function addition(R){if(R()<0.7)return angleDouble(R);
  const k=R.choix(Object.keys(DECO)),[kx,ky,s]=DECO[k],a=qk(k),x=qk(kx),y=qk(ky),f=R()<0.5?"cos":"sin",cx=cosA(x),sx=sinA(x),cy=cosA(y),sy=s<0?opp(sinA(y)):sinA(y);
  const t1=f==="cos"?fois(cx,cy):fois(sx,cy),t2=f==="cos"?fois(sx,sy):fois(cx,sy),op=f==="cos"?-1:1,T=[[t1.r.n,t1.k],[op*t2.r.n,t2.k]],V=val(t1)+op*val(t2);
  const pos=T.filter(t=>t[0]>0),neg=T.filter(t=>t[0]<0),fin=pos.length===2?`(√${pos[0][1]} + √${pos[1][1]})/4`:neg.length===2?`−(√${neg[0][1]} + √${neg[1][1]})/4`:`(√${pos[0][1]} − √${neg[0][1]})/4`;
  const tp=fin.replace(/−/g,"-"),moins=s<0,fy=moins?`−${angT(y)}`:angT(y),form=f==="cos"?"cos(a + b) = cos(a)cos(b) − sin(a)sin(b)":"sin(a + b) = sin(a)cos(b) + cos(a)sin(b)";
  const E=[{w:fx(`${angT(a)} = ${angT(x)} ${moins?"−":"+"} ${angT(y)}`),why:"On écrit l'angle comme une somme ou une différence de deux angles dont on connaît le cosinus et le sinus par cœur.",pts:0.5},
    {w:`D'après le théorème 4.4.1, ${fx(form)}, avec ${fx(`a = ${angT(x)}`)} et ${fx(`b = ${fy}`)}.${moins?` Et ${fx(`cos(${fy}) = cos(${angT(y)}) = ${ecrit(cy)}`)}, ${fx(`sin(${fy}) = −sin(${angT(y)}) = ${ecrit(sy)}`)}.`:""}`,why:`Les formules d'addition sont à savoir par cœur (le poly le dit).${moins?" Le cosinus ne change pas quand on change le signe de l'angle, le sinus change de signe.":""}`,pts:1},
    {w:`<b>${fx(`${f}(${angT(a)}) = ${f==="cos"?`${ecrit(cx)} × ${ecrit(cy)} − ${ecrit(sx)} × ${gr(sy)}`:`${ecrit(sx)} × ${ecrit(cy)} + ${gr(cx)} × ${gr(sy)}`} = ${fin}`)}</b>`,why:"On multiplie : √2 × √3 = √6. Les deux termes ont le même dénominateur, 4, mais pas la même racine : on ne peut pas les regrouper davantage.",pts:1}];
  const autre=val(t1)-op*val(t2);
  return {sig:"AD"+f+k,q:`Calcule la valeur exacte de ${fx(`${f}(${angT(a)})`)}.`,corps:`<p>Indice : ${fx(angT(a))} s'écrit avec deux angles dont tu connais le cosinus et le sinus. ${RAP_RAD}</p>`,texte:`${f}(${angT(a)})`,champs:[champL("x",`${f}(${angT(a)})`,`$${f}(${angT(a)}) =$`,"par exemple (√6+√2)/4")],
    juge:jugeEx("x",V,E,[[autre,1,"signe dans la formule d'addition","Où ça part : la formule.",`${fx(form)} : ${f==="cos"?"pour le cosinus, le signe du milieu est un moins":"pour le sinus, c'est un plus"}.`],[-V,2,"signe du résultat","Où ça part : le signe.",SIGNE[f]]],"la valeur"),etapes:E,
    bonne:`<span class="en-nb">${fx(`${f}(${angT(a)}) = ${fin}`)}</span>`,bonneTxt:`${f}(${angT(a)}) = ${fin}`,repBonne:{x:tp},repFausse:{x:String(autre)},nature:"formule d'addition",ens:{k:"add",f,a:angV(a)}};}
function angleDouble(R){const r=fracPQ(R),f=R()<0.5?"cos":"sin",g=R()<0.5?"cos":"sin",o=f==="cos"?"sin":"cos",rS=S(r),aut=racine(sub(1,mul(r,r))),c=f==="cos"?rS:aut,s=f==="sin"?rS:aut;
  const res=g==="cos"?S(sub(carre(c),carre(s))):fois(2,fois(s,c)),form=g==="cos"?"cos(2x) = cos(x)^{2} − sin(x)^{2}":"sin(2x) = 2 sin(x) cos(x)";
  const E=[{w:`D'après le corollaire 4.4.2, ${fx(form)}.`,why:"C'est la formule d'addition du théorème 4.4.1 avec les deux angles égaux à x.",pts:1},
    {w:`${fx(`${o}(x)^{2} = 1 − ${par(r)}^{2} = ${nb(carre(aut))}`)}${g==="sin"?`, et x est entre 0 et π/2, donc ${fx(`${o}(x) = ${ecrit(aut)}`)}`:""}.`,why:`On a besoin de ${o}(x) : on le tire de ${fx("cos(x)^{2} + sin(x)^{2} = 1")} (proposition 4.2.3).${g==="sin"?" Sur ]0 ; π/2[, le cosinus et le sinus sont positifs.":""}`,pts:1},
    {w:`<b>${fx(g==="cos"?`cos(2x) = ${nb(carre(c))} − ${nb(carre(s))} = ${ecrit(res)}`:`sin(2x) = 2 × ${ecrit(s)} × ${ecrit(c)} = ${ecrit(res)}`)}</b>`,why:"On remplace et on calcule. Pour le cosinus, pas besoin de racine : seuls les carrés servent.",pts:1}];
  const V=val(res);
  return unExact({nom:`${g}(2x)`,v:ex1(res),quoi:"la valeur",ex:"par exemple 7/25 ou 4√2/9",etapes:E,sig:"DB"+JSON.stringify([brut(r),f,g]),q:`Soit x un réel de l'intervalle ]0 ; π/2[ tel que ${fx(`${f}(x) = ${nb(r)}`)}. Calcule ${fx(`${g}(2x)`)} : donne la valeur exacte.`,corps:`<p>Rappel : ${RAP_RAD}</p>`,
    texte:`x dans ]0 ; π/2[, ${f}(x) = ${nb(r)} ; calculer ${g}(2x)`,nature:"angle double",
    pieges:g==="cos"?[[-V,2,"carrés soustraits à l'envers","Où ça part : la formule.","cos(2x) = cos(x)² − sin(x)² : le carré du cosinus d'abord."],[1,2,"somme des carrés","Où ça part : la formule.","cos(x)² + sin(x)² vaut toujours 1 : dans cos(2x), c'est une différence."],[2*fl(r),0,"2 × cos(x)","Où ça part : la formule.","cos(2x) n'est pas 2cos(x) : utilise le corollaire 4.4.2."]]
      :[[V/2,2,"facteur 2 oublié","Où ça part : la formule.","sin(2x) = 2 sin(x) cos(x) : il y a un 2 devant."],[2*fl(r),0,"2 × sin(x)","Où ça part : la formule.","sin(2x) n'est pas 2sin(x) : utilise le corollaire 4.4.2."]],ens:{k:"dbl",f,g,r:fl(r)}});}


/* les rotations (définition 4.5.1, théorème 4.5.2, feuille 4 exercice 1, CC2 2024 exercice 2 (d)) */
const prin=x=>{let y=x;while(fl(y)>1)y=sub(y,2);while(fl(y)<=-1)y=add(y,2);return y;},angS=x=>x.n<0?"−"+angT(mul(x,-1)):angT(x),tapeA=x=>angS(x).replace("−","-");
function rotDist(R){const al=R.choix([Q(1,3),Q(1,2),Q(2,3),Q(1),Q(-1,3),Q(-1,2),Q(-2,3)]),d=R.ent(1,9),a=vabs(al),co=cosA(a),aa2=mul(mul(2*d*d,1),sub(1,co.r.n/co.r.d===0?Q(0):co.r)),res=racine(aa2);
  const E=[{w:`Par la définition 4.5.1, ${fx(`ZA′ = ZA = ${d}`)} et l'angle orienté ${an("AZA′")} vaut ${fx(angS(al))}. Donc le triangle ZAA′ est isocèle en Z, et ${absAn("AZA′")} ${fx("= "+angT(a))}.`,why:"Une rotation ne change pas la distance au centre, et elle fait tourner de l'angle α. En valeur absolue, l'angle du triangle en Z est |α|.",pts:1},
    {w:`D'après le théorème d'Al-Kashi dans ZAA′ : ${fx(`AA′^{2} = ${d}^{2} + ${d}^{2} − 2 × ${d} × ${d} × cos(${angT(a)}) = ${2*d*d} − ${2*d*d} × ${gr(co)} = ${nb(aa2)}`)}.`,why:`On connaît deux côtés, ZA et ZA′, et l'angle entre eux. ${pourquoiTrig(a,"cos")}`.replace("radians, c'est undefined","radians"),pts:1},
    {w:`<b>${fx(`AA′ = ${racLigne(aa2)}`)}</b>`,why:`Une longueur est positive : on prend la racine carrée.${egal(a,Q(1,3))?" Le triangle ZAA′ est même équilatéral : isocèle avec un angle de π/3.":egal(a,Q(1))?" Pour un demi-tour, Z est le milieu de [AA′] : AA′ = 2 ZA.":""}`,pts:1}];
  return unExact({nom:"AA′",v:ex1(res),quoi:"la longueur AA′",ex:"par exemple 5√3",etapes:E,sig:"RD"+JSON.stringify([brut(al),d]),q:`Soit r la rotation de centre Z et d'angle ${fx(angS(al))}, et A un point tel que ${fx(`ZA = ${d}`)}. On note A′ = r(A). Calcule la distance AA′ : donne la valeur exacte.`,
    corps:`<p>Rappel : la rotation de centre Z et d'angle α envoie M sur le point r(M) tel que Zr(M) = ZM et que l'angle orienté de sommet Z allant de M à r(M) vaille α (définition 4.5.1). ${RAP_RAD}</p>`,texte:`rotation de centre Z, angle ${angS(al)}, ZA = ${d} ; calculer AA′`,nature:"distance AA′",
    pieges:[[fl(aa2),2,"racine oubliée","Où ça part : la dernière ligne.",`${nb(aa2)}, c'est AA′². Il reste à prendre la racine carrée.`],[d,1,"AA′ cru égal à ZA","Où ça part : le triangle ZAA′.",egal(a,Q(1,3))?"":"ZA′ = ZA, mais AA′ dépend de l'angle : il faut Al-Kashi."],[2*d,1,"points crus alignés","Où ça part : le triangle ZAA′.","A, Z et A′ ne sont alignés que pour un demi-tour (angle π)."]],ens:{k:"rot",al:angV(al),d}});}
function rotCompo(R){let a,b;for(;;){const N=R.choix([2,3,4,6]);a=Q(R.nz(-N+1,N),N);b=Q(R.nz(-N+1,N),N);if(!egal(prin(add(a,b)),Q(0))&&fl(add(a,b))!==fl(prin(add(a,b))))break;if(R()<0.35&&!egal(add(a,b),Q(0)))break;}
  const s=add(a,b),p=prin(s),reduit=!egal(s,p);
  const E=[{w:"D'après l'exercice 1 de la feuille 4, r ∘ r′ est la rotation de centre Z et d'angle α + α′.",why:"On tourne d'abord de α′ autour de Z, puis de α : les distances à Z ne changent pas et les angles s'ajoutent par la relation de Chasles.",pts:1},
    {w:`${reduit?"":"<b>"}${fx(`α + α′ = ${angS(a)} + ${b.n<0?"("+angS(b)+")":angS(b)} = ${angS(s)}`)}${reduit?"":"</b>"}.`,why:"On met les deux fractions au même dénominateur avant d'ajouter.",pts:1}];
  if(reduit)E.push({w:`<b>${fx(angS(s))} n'est pas dans ]−π ; π] : on ${fl(s)>1?"retire":"ajoute"} un tour complet, ${fx(`${angS(s)} ${fl(s)>1?"−":"+"} 2π = ${angS(p)}`)}.</b>`,why:"Un angle orienté est défini à 2π près : ajouter ou retirer un tour ne change pas la rotation. La mesure principale est le seul représentant dans ]−π ; π].",pts:1});
  const V=angV(p);
  function juge(rep){const r=lisAngle(rep.x,V);if(r.inc)return {incomplet:r.inc};if(pres(r.v,V))return {ok:true};
    if(reduit&&pres(r.v,angV(s)))return faux({etape:2,type:"mesure principale oubliée",titre:"Où ça part : la mesure principale.",msg:`${angS(s)} est une mesure juste, mais pas dans ]−π ; π]. ${E[2].w}`});
    if(pres(r.v,angV(sub(a,b)))||pres(r.v,angV(prin(sub(a,b)))))return faux({etape:0,type:"angles soustraits",titre:"Où ça part : la composée.","msg":"Les angles s'ajoutent : α + α′."});
    return faux({etape:E.length-1,type:"calcul de l'angle",titre:"Où ça part : le calcul.",msg:E[E.length-1].w});}
  return {sig:"RC"+JSON.stringify([brut(a),brut(b)]),q:`Soient r et r′ les rotations de même centre Z et d'angles ${fx("α = "+angS(a))} et ${fx("α′ = "+angS(b))}. L'application r ∘ r′ est une rotation de centre Z : donne la mesure principale de son angle, dans ]−π ; π].`,corps:`<p>Rappel : r ∘ r′ veut dire « d'abord r′, puis r ». ${RAP_RAD}</p>`,
    texte:`rotations de centre Z, angles ${angS(a)} et ${angS(b)} ; angle de r ∘ r′ dans ]−π ; π]`,champs:[champA("x","angle","angle de r ∘ r′ :")],juge,etapes:E,bonne:`angle ${fx("= "+angS(p))}`,bonneTxt:`angle = ${angS(p)}`,repBonne:{x:tapeA(p)},repFausse:{x:reduit?tapeA(s):tapeA(prin(sub(a,b)))==tapeA(p)?"0":tapeA(prin(sub(a,b)))},nature:reduit?"composée, mesure principale":"composée de deux rotations",ens:{k:"rcomp",a:angV(a),b:angV(b)}};}
const RAPS=[[Q(1,2),"1/2"],[Q(2),"2"],[Q(3),"3"],[Q(1,3),"1/3"],[S(DEMI,2),"1/√2"],[S(1,2),"√2"]];
function rotHom(R){const [k,kt]=R.choix(RAPS),th=R.choix([Q(1,4),Q(-1,4),Q(1,3),Q(-1,3),Q(1,2),Q(-1,2),Q(2,3),Q(-2,3)]),d=R.ent(1,8),res=fois(sq(k),d),Vd=val(res),Va=angV(th);
  const E=[{w:`Notons X″ = r(X). Par la définition 4.5.1, ${fx(`AX″ = AX = ${d}`)} et l'angle orienté ${an("XAX″")} vaut ${fx(angS(th))}.`,why:"La rotation de centre A garde la distance à A et fait tourner de son angle.",pts:1},
    {w:`X′ = h(X″) : par la définition 3.3.3, ${ve("AX′")} = ${kt} ${ve("AX″")}. Le rapport est positif, donc X′ est sur la demi-droite [AX″) et ${fx(`AX′ = ${kt} × AX″`)}.`,why:"Une homothétie de rapport positif garde la direction et le sens depuis son centre : l'angle orienté X″AX′ est nul.",pts:1},
    {w:`<b>${fx(`AX′ = ${kt} × ${d} = ${ecrit(res)}`)}, et ${an("XAX′")} = ${an("XAX″")} + ${an("X″AX′")} ${fx(`= ${angS(th)} + 0 = ${angS(th)}`)}.</b>`,why:"Relation de Chasles pour les angles orientés. C'est la question (d) (i) du CC2 2024, avec ces nombres.",pts:1}];
  function juge(rep){const r1=lisNombre(rep.x,Vd,"la longueur AX′");if(r1.inc)return {incomplet:r1.inc};const r2=lisAngle(rep.y,Va);if(r2.inc)return {incomplet:r2.inc};
    const o1=pres(r1.v,Vd),o2=pres(r2.v,Va),F=[];if(!o1)F.push("x");if(!o2)F.push("y");if(!F.length)return {ok:true};const res2=`Pas tout à fait : ${!o1&&!o2?"la longueur et l'angle sont faux":!o1?"la longueur est fausse":"la longueur est juste, mais pas l'angle"}.`;
    if(!o1)return faux({f:F,etape:pres(r1.v,d/val(sq(k)))?1:2,type:pres(r1.v,d/val(sq(k)))?"division par le rapport":"calcul de AX′",titre:"Où ça part : la distance.",msg:`L'homothétie multiplie la distance à A par ${kt} : ${fx(`AX′ = ${kt} × ${d}`)}.`},res2);
    return faux({f:F,etape:pres(r2.v,-Va)?0:2,type:pres(r2.v,-Va)?"sens de l'angle":"angle de la composée",titre:"Où ça part : l'angle.",msg:`L'homothétie de rapport positif ne fait pas tourner : l'angle ${an("XAX′")} est celui de la rotation, ${angS(th)}.`},res2);}
  return {sig:"RH"+JSON.stringify([kt,brut(th),d]),q:`Soit r la rotation de centre A et d'angle ${fx(angS(th))}, h l'homothétie de centre A et de rapport ${fx(kt)}, et f = h ∘ r. Soit X un point tel que ${fx(`AX = ${d}`)}, et X′ = f(X). Calcule AX′, puis l'angle orienté ${an("XAX′")} (mesure dans ]−π ; π]).`,corps:`<p>Rappel : h ∘ r veut dire « d'abord r, puis h ». ${RAP_RAD}</p>`,
    texte:`f = h ∘ r, r de centre A et d'angle ${angS(th)}, h de centre A et de rapport ${kt}, AX = ${d} ; calculer AX′ et l'angle XAX′`,champs:[champL("x","AX′","$AX′ =$","par exemple 3√2"),champA("y","angle",`${an("XAX′")} =`)],juge,etapes:E,
    bonne:`${fx(`AX′ = ${ecrit(res)}`)} et ${an("XAX′")} ${fx("= "+angS(th))}`,bonneTxt:`AX′ = ${ecrit(res)} ; angle XAX′ = ${angS(th)}`,repBonne:{x:tape(res),y:tapeA(th)},repFausse:{x:tape(res),y:tapeA(mul(th,-1))},nature:"rotation puis homothétie, comme au CC2 2024",ens:{k:"rhom",k2:val(sq(k)),th:angV(th),d}};}
const rotations=R=>{const r=R();return r<0.4?rotDist(R):r<0.7?rotCompo(R):rotHom(R);};
/* le produit scalaire : par la définition, en coordonnées, puis l'angle entre deux vecteurs */
const vv=s=>ve(s),nrm=s=>`‖${ve(s)}‖`;
function produit(R){const k=R.choix(["def","coord","angle","angle"]);if(k==="angle")return angleVec(R);
  if(k==="def"){const a=R.ent(1,9),b=R.ent(1,9),t=R.choix(ANGR.slice(1,8)),th=qk(t),co=cosA(th),res=fois(S(a*b),co),V=val(res);
    const E=[{w:`Par la définition 4.6.2 : ⟨${vv("u")}, ${vv("v")}⟩ = ${nrm("u")} × ${nrm("v")} × cos(angle(${vv("u")}, ${vv("v")})).`,why:"Le produit scalaire est un nombre : le produit des deux normes par le cosinus de l'angle entre les vecteurs.",pts:1},
      {w:fx(`cos(${angT(th)}) = ${ecrit(co)}`),why:t==="1/2"?"Sur le cercle trigonométrique, l'angle π/2 donne le point (0, 1) : son abscisse vaut 0.":pourquoiTrig(th,"cos"),pts:0.5},
      {w:`<b>⟨${vv("u")}, ${vv("v")}⟩ ${fx(`= ${a} × ${b} × ${gr(co)} = ${ecrit(res)}`)}</b>`,why:t==="1/2"?"Deux vecteurs qui forment un angle droit ont un produit scalaire nul.":"On multiplie les nombres, et on garde la racine.",pts:1}];
    return unExact({nom:"⟨u, v⟩",v:ex1(res),quoi:"le produit scalaire",ex:"par exemple -6 ou 6√2",etapes:E,sig:"PS"+JSON.stringify([a,b,t]),q:`Soient ${vv("u")} et ${vv("v")} deux vecteurs tels que ${nrm("u")} ${fx("= "+a)}, ${nrm("v")} ${fx("= "+b)}, et dont l'angle vaut ${fx(angT(th))}. Calcule le produit scalaire ⟨${vv("u")}, ${vv("v")}⟩.`,
      corps:`<p>Rappel : ${nrm("u")} est la norme de ${vv("u")}, c'est-à-dire sa longueur. ${RAP_RAD}</p>`,texte:`‖u‖ = ${a}, ‖v‖ = ${b}, angle ${angT(th)} ; calculer ⟨u, v⟩`,nature:"définition du produit scalaire",
      pieges:[[a*b*val(sinA(th)),1,"sinus à la place du cosinus","Où ça part : la définition.","Le produit scalaire utilise le cosinus de l'angle, pas le sinus."],[a*b,0,"cosinus oublié","Où ça part : la définition.","Il faut multiplier aussi par le cosinus de l'angle."],[-V,1,"signe du cosinus","Où ça part : le cosinus.","Le cosinus d'un angle obtus est négatif, celui d'un angle aigu positif."]],ens:{k:"def",a,b,th:angV(th)}});}
  let x,y,x2,y2;for(;;){x=R.ent(-6,6);y=R.ent(-6,6);x2=R.ent(-6,6);y2=R.ent(-6,6);if((x||y)&&(x2||y2)&&x*y2!==y*x2)break;}
  const res=x*x2+y*y2,cx=x=>x<0?"("+nb(x)+")":String(x);
  const E=[{w:`D'après la proposition 4.6.3 (corollaire 4.6.5), dans une base orthonormée : ⟨${vv("u")}, ${vv("v")}⟩ ${fx("= xx′ + yy′")}.`,why:"On multiplie les abscisses entre elles, les ordonnées entre elles, et on additionne. Attention : cette formule n'est vraie que dans un repère orthonormé.",pts:1},
    {w:`<b>⟨${vv("u")}, ${vv("v")}⟩ ${fx(`= ${cx(x)} × ${cx(x2)} + ${cx(y)} × ${cx(y2)} = ${nb(res)}`)}</b>`,why:res===0?"Le produit scalaire est nul : les deux vecteurs sont orthogonaux.":"On calcule les deux produits, puis on les additionne en faisant attention aux signes.",pts:1}];
  return unExact({nom:"⟨u, v⟩",v:{t:nb(res),tape:String(res),v:res},quoi:"le produit scalaire",ex:"par exemple -7",etapes:E,sig:"PC"+JSON.stringify([x,y,x2,y2]),q:`Dans une base orthonormée, on considère les vecteurs ${vv("u")} de coordonnées ${fx(`(${x}, ${y})`)} et ${vv("v")} de coordonnées ${fx(`(${x2}, ${y2})`)}. Calcule ⟨${vv("u")}, ${vv("v")}⟩.`,
    corps:"",texte:`u (${x}, ${y}), v (${x2}, ${y2}) dans une base orthonormée ; calculer ⟨u, v⟩`,nature:"produit scalaire en coordonnées",
    pieges:[[x*y2+y*x2,0,"produits croisés","Où ça part : la formule.","On multiplie abscisse par abscisse et ordonnée par ordonnée : xx′ + yy′."],[x*x2-y*y2,0,"soustraction au lieu d'addition","Où ça part : la formule.","Les deux produits s'additionnent : xx′ + yy′."],[x*y2-y*x2,0,"déterminant à la place du produit scalaire","Où ça part : la formule.","xy′ − yx′ est le déterminant (il dit si les vecteurs sont colinéaires). Le produit scalaire est xx′ + yy′."]],ens:{k:"coord",u:[x,y],v:[x2,y2]}});}
function angleVec(R){const t=R.choix(["1/4","3/4","1/2","quel","quel"]);let a,b,x2,y2;
  for(;;){a=R.ent(-4,4);b=R.ent(-4,4);if(!(a||b))continue;const m=R.ent(1,2);
    if(t==="1/4"){x2=m*(a-b);y2=m*(a+b);}else if(t==="3/4"){x2=m*(-a-b);y2=m*(a-b);}else if(t==="1/2"){x2=-m*b;y2=m*a;}
    else{x2=R.ent(-5,5);y2=R.ent(-5,5);if(!(x2||y2))continue;const c=(a*x2+b*y2)/Math.hypot(a,b)/Math.hypot(x2,y2);if([0,0.5,-0.5,Math.SQRT1_2,-Math.SQRT1_2,Math.sqrt(3)/2,-Math.sqrt(3)/2,1,-1].some(z=>Math.abs(c-z)<1e-9))continue;}
    if(Math.max(Math.abs(x2),Math.abs(y2))<=8)break;}
  const rem=t!=="quel",th=rem?qk(t):null,n=a*x2+b*y2,A=a*a+b*b,B=x2*x2+y2*y2,co=sur(S(n),racine(Q(A*B))),CO=val(co),TH=rem?angV(th):null,cx=x=>x<0?"("+nb(x)+")":String(x);
  const E=[{w:`D'après la proposition 4.6.3, dans une base orthonormée : ⟨${vv("u")}, ${vv("v")}⟩ ${fx(`= ${cx(a)} × ${cx(x2)} + ${cx(b)} × ${cx(y2)} = ${nb(n)}`)}.`,why:"Abscisse par abscisse, ordonnée par ordonnée, puis on additionne.",pts:1},
    {w:`D'après le corollaire 4.6.4 : ${nrm("u")} ${fx(`= √(${cx(a)}^{2} + ${cx(b)}^{2}) = ${racLigne(Q(A))}`)} et ${nrm("v")} ${fx(`= √(${cx(x2)}^{2} + ${cx(y2)}^{2}) = ${racLigne(Q(B))}`)}.`,why:"La norme d'un vecteur de coordonnées (x, y) dans une base orthonormée est √(x² + y²) : c'est Pythagore.",pts:1},
    {w:`<b>Par la définition 4.6.2 : cos(angle(${vv("u")}, ${vv("v")})) ${fx(`= ⟨u, v⟩/(‖u‖ × ‖v‖) = ${nb(n)}/(${ecrit(racine(Q(A)))} × ${ecrit(racine(Q(B)))}) = ${ecrit(co)}`)}</b>`,why:`On isole le cosinus dans ⟨u, v⟩ = ‖u‖ × ‖v‖ × cos(angle).${racine(Q(A*B)).k>1?" On simplifie, et on ne laisse pas de racine au dénominateur.":""}`,pts:1.5}];
  if(rem)E.push({w:`<b>L'angle entre les deux vecteurs, entre 0 et π, dont le cosinus vaut ${ecrit(co)} est ${fx(angT(th))}.</b>`,why:`Sur [0 ; π], un seul angle a ce cosinus : ${angT(th)}, c'est ${NOMANG[t]}.${n===0?" Produit scalaire nul : les vecteurs sont orthogonaux.":""}`,pts:1});
  function juge(rep){const rc=lisNombre(rep.cos,CO,"le cosinus");if(rc.inc)return {incomplet:rc.inc};let ra=null;if(rem){ra=lisAngle(rep.ang,TH);if(ra.inc)return {incomplet:ra.inc};}
    const okC=pres(rc.v,CO),okA=!rem||pres(ra.v,TH),F=[];if(!okC)F.push("cos");if(!okA)F.push("ang");if(!F.length)return {ok:true};
    const res=`Pas tout à fait : ${!okC&&!okA?"le cosinus et l'angle sont faux":!okC?"le cosinus est faux":"le cosinus est juste, mais pas l'angle"}.`;
    if(!okC){if(pres(rc.v,n))return faux({f:F,etape:2,type:"produit scalaire donné à la place du cosinus",titre:"Où ça part : le cosinus.",msg:`${nb(n)} est le produit scalaire. Le cosinus s'obtient en le divisant par le produit des normes.`},res);
      if(pres(rc.v,n/(A*B)))return faux({f:F,etape:1,type:"normes au carré",titre:"Où ça part : les normes.",msg:`La norme est la racine carrée de x² + y² : ${fx(`√${A}`)} et ${fx(`√${B}`)}, pas ${A} et ${B}.`},res);
      return faux({f:F,etape:2,type:"calcul du cosinus",titre:"Où ça part : le cosinus.",msg:E[2].w},res);}
    return faux({f:F,etape:3,type:"angle à partir du cosinus",titre:"Où ça part : l'angle.",msg:`L'angle entre 0 et π dont le cosinus vaut ${ecrit(co)} est ${angT(th)}.`},res);}
  const repB={cos:tape(co)};if(rem)repB.ang=angT(th);
  return {sig:"AV"+JSON.stringify([a,b,x2,y2]),q:`Dans une base orthonormée, on considère les vecteurs ${vv("u")} de coordonnées ${fx(`(${a}, ${b})`)} et ${vv("v")} de coordonnées ${fx(`(${x2}, ${y2})`)}. Calcule le cosinus de l'angle entre ${vv("u")} et ${vv("v")}${rem?", puis cet angle (entre 0 et π)":""}.`,corps:`<p>Rappel : ${RAP_RAD}</p>`,
    texte:`u (${a}, ${b}), v (${x2}, ${y2}) ; cosinus de l'angle${rem?" puis l'angle":""}`,champs:[champL("cos","cosinus","cos(angle) =","par exemple -√2/2")].concat(rem?[champA("ang","angle","angle =")]:[]),juge,etapes:E,
    bonne:`cos(angle) ${fx("= "+ecrit(co))}${rem?` et angle ${fx("= "+angT(th))}`:""}`,bonneTxt:`cos = ${ecrit(co)}${rem?` ; angle = ${angT(th)}`:""}`,repBonne:repB,repFausse:Object.assign({},repB,{cos:String(n===0?1:n)}),nature:rem?"angle entre deux vecteurs":"cosinus de l'angle",ens:{k:"ang",u:[a,b],v:[x2,y2],rem}};}

/* ---------- GE4 : angle au centre, angle inscrit (théorème 5.2.1, corollaires 5.2.3 et 5.2.5, remarque 5.2.4) ---------- */
const surC=t=>[Math.cos(t),Math.sin(t)],RAP_C="Rappel : un angle inscrit a son sommet sur le cercle ; l'angle au centre a son sommet au centre O.";
const tireAl=(R,max)=>{for(;;){const N=R.choix(DENS4);const a=Q(R.ent(1,N-1),N);if(ok12(a)&&a.n*12<=max*a.d)return a;}};
const centreAB=(al,t)=>{const th=2*angV(al),f0=-Math.PI/2-th/2;return {O:[0,0],A:surC(f0),B:surC(f0+th),M:surC(f0+th+t*(2*Math.PI-th))};};
const E5_2_1={w:`A, B et M sont sur le cercle C de centre O, et M est distinct de A et B : d'après le théorème 5.2.1 de l'angle au centre, ${an("AOB")} = 2${an("AMB")} [2π].`,why:"C'est le théorème de l'angle au centre, écrit avec des angles orientés.",pts:1};
const moitie=`M et O sont du même côté de (AB) : les deux angles tournent dans le même sens, donc en mesure ${absAn("AOB")} ${fx("= 2 ×")} ${absAn("AMB")}`,whyM="Quand M est sur l'arc du même côté que le centre, l'angle inscrit mesure la moitié de l'angle au centre. Sur l'autre arc, il vaudrait π moins cette moitié (remarque 5.2.4).";
const ensC=(P,don,ch,plus)=>({P,don,c:[["cerc","O"].concat(Object.keys(P).filter(n=>n!=="O"))].concat(plus||[]),ch});

function centreInscrit(R){const k=R.choix(["ci","ci","ic","dia"]);
  if(k==="dia"){const x=tireAl(R,5),P={O:[0,0],A:[-1,0],B:[1,0],M:surC(2*angV(x))},V=sub(DEMI,x);
    const E=[{w:`M est sur le cercle de diamètre [AB] : d'après le corollaire 5.2.5, le triangle AMB est rectangle en M, ${absAn("AMB")} ${fx("= π/2")}.`,why:"C'est le cercle de diamètre fixé : un point du cercle, autre que A et B, voit le diamètre sous un angle droit.",pts:1},
      {w:`<b>Somme des angles du triangle AMB : ${absAn("MBA")} ${fx("= "+chaine([[1,PI],[-1,DEMI],[-1,x]]).t)}.</b>`,why:"Proposition 2.4.2 : on retire de π l'angle droit et l'angle connu.",pts:1}];
    return unAngle({nom:"MBA",x:V,autre:sub(PI,x),etapes:E,sig:"CD"+brut(x),q:`Soit C le cercle de diamètre [AB], et M un point de C distinct de A et de B, tel que ${egA("MAB",x)}. Calcule ${absAn("MBA")}.`,
      corps:figure(P,{cercles:[["O",1]],seg:[["A","B"],["A","M"],["M","B"]],points:["O","A","B","M"],angles:[["M","A","B",angT(x),16],["A","B","M","?",16]],alt:"Le cercle de diamètre [AB] et le point M"})+`<p>Rappel : le cercle de diamètre [AB] a pour centre le milieu O de [AB]. ${RAP_RAD}</p>`,
      texte:`cercle de diamètre [AB], M sur le cercle, angle MAB = ${angT(x)} ; calculer l'angle MBA`,nature:"cercle de diamètre",
      pieges:[[sub(PI,x),0,"angle droit oublié","Où ça part : l'angle en M.","Le triangle AMB est rectangle en M (corollaire 5.2.5) : il faut retirer π/2 aussi."],[x,0,"triangle cru isocèle","Où ça part : les angles du triangle.","Rien ne dit que MA = MB : les deux angles en A et en B ne sont pas égaux en général, ils font ensemble π/2."]],
      ens:ensC(P,[["M","A","B",angV(x)]],{x:["A","B","M"]},[["entre","O","A","B"],["eg","O","A","O","B"]])});}
  const al=tireAl(R,5),th=mul(al,2),P=centreAB(al,R.choix([0.35,0.5,0.65])),ci=k==="ci";
  const fig=figure(P,{cercles:[["O",1]],seg:[["O","A"],["O","B"],["M","A"],["M","B"]],tirets:[["A","B"]],points:["O","A","B","M"],angles:[["A","O","B",ci?angT(th):"?",14],["A","M","B",ci?"?":angT(al),16]],alt:"Le cercle de centre O, l'angle au centre AOB et l'angle inscrit AMB"});
  const E=[E5_2_1,{w:`<b>${moitie} : ${ci?`${absAn("AMB")} ${fx(`= 1/2 × ${angT(th)} = ${angT(al)}`)}`:`${absAn("AOB")} ${fx(`= 2 × ${angT(al)} = ${angT(th)}`)}`}.</b>`,why:whyM,pts:1}];
  return unAngle({nom:ci?"AMB":"AOB",x:ci?al:th,autre:ci?th:al,etapes:E,sig:"CI"+JSON.stringify([k,brut(al)]),
    q:`Soit C un cercle de centre O, et A, B deux points de C tels que ${ci?egA("AOB",th):`la droite (AB) ne passe pas par O`}. Soit M un point de C, du même côté de la droite (AB) que O${ci?"":`, tel que ${egA("AMB",al)}`}. Calcule ${absAn(ci?"AMB":"AOB")}.`,corps:fig+`<p>${RAP_C} ${RAP_RAD}</p>`,
    texte:`cercle de centre O, ${ci?`angle AOB = ${angT(th)}`:`angle AMB = ${angT(al)}`}, M du même côté de (AB) que O ; calculer l'angle ${ci?"AMB":"AOB"}`,nature:ci?"angle inscrit":"angle au centre",
    pieges:ci?[[th,1,"angle au centre recopié","Où ça part : la moitié.","L'angle inscrit est la moitié de l'angle au centre, pas le même angle."],[sub(PI,al),1,"mauvais arc","Où ça part : l'arc.","M est du même côté de (AB) que O : l'angle inscrit vaut la moitié de l'angle au centre. π moins cette moitié, c'est pour un point de l'autre arc."]]
      :[[mul(al,DEMI),1,"divisé au lieu de multiplié","Où ça part : le facteur 2.","C'est l'angle au centre qui est le double de l'angle inscrit."],[al,1,"angle inscrit recopié","Où ça part : le facteur 2.","L'angle au centre est le double de l'angle inscrit."]],
    ens:ensC(P,[ci?["A","O","B",angV(th)]:["A","M","B",angV(al)]],{x:ci?["A","M","B"]:["A","O","B"]},[["meme","M","O","A","B"]])});}

function isoCentre(R){const k=R.choix(["inscrit","inscrit","centre","retour"]),al=tireAl(R,5),th=mul(al,2),be=sub(DEMI,al),P=centreAB(al,R.choix([0.35,0.5,0.65]));
  const fig=figure(P,{cercles:[["O",1]],seg:[["O","A"],["O","B"],["A","B"]].concat(k==="centre"?[]:[["M","A"],["M","B"]]),points:k==="centre"?["O","A","B"]:["O","A","B","M"],noms:k==="centre"?["O","A","B"]:undefined,marques:[["O","A",1],["O","B",1]],
    angles:k==="inscrit"?[["A","M","B",angT(al),16],["O","A","B","?",16]]:k==="centre"?[["A","O","B",angT(th),14],["O","A","B","?",16]]:[["O","A","B",angT(be),16],["A","M","B","?",16]],alt:"Le cercle de centre O et le triangle OAB"});
  const iso={w:`OA = OB, ce sont deux rayons : le triangle OAB est isocèle en O, donc ${absAn("OAB")} = ${absAn("OBA")}.`,why:"Dans un triangle isocèle, les angles à la base sont égaux (feuille 1, exercice 7). Ici les deux côtés égaux partent de O.",pts:1};
  let E,V,nom,autre,pieges,q,don;
  if(k==="retour"){nom="AMB";V=al;autre=be;q=`Soit C un cercle de centre O, et A, B deux points de C tels que ${egA("OAB",be)}. Soit M un point de C, du même côté de la droite (AB) que O. Calcule ${absAn("AMB")}.`;don=[["O","A","B",angV(be)]];
    E=[iso,{w:`Somme des angles du triangle OAB : ${absAn("AOB")} ${fx(`= π − 2 × ${angT(be)} = `+chaine([[1,PI],[-1,mul(be,2)]]).t)}.`,why:"Proposition 2.4.2, avec deux angles égaux à la base.",pts:1},E5_2_1,{w:`<b>${moitie} : ${absAn("AMB")} ${fx(`= 1/2 × ${angT(th)} = ${angT(al)}`)}.</b>`,why:whyM,pts:1}];
    pieges=[[th,3,"angle au centre donné","Où ça part : la moitié.",`${fx(angT(th))}, c'est ${absAn("AOB")}. L'angle inscrit en est la moitié.`],[be,0,"angle à la base recopié","Où ça part : l'angle demandé.","L'angle demandé est au sommet M, sur le cercle."]];}
  else{nom="OAB";V=be;autre=k==="inscrit"?al:th;
    q=k==="inscrit"?`Soit C un cercle de centre O, et A, B, M trois points de C, avec M du même côté de la droite (AB) que O, tels que ${egA("AMB",al)}. Calcule ${absAn("OAB")}.`:`Soit C un cercle de centre O, et A, B deux points de C tels que ${egA("AOB",th)}. Calcule ${absAn("OAB")}.`;
    don=[k==="inscrit"?["A","M","B",angV(al)]:["A","O","B",angV(th)]];
    E=(k==="inscrit"?[E5_2_1,{w:`${moitie} : ${absAn("AOB")} ${fx(`= 2 × ${angT(al)} = ${angT(th)}`)}.`,why:whyM,pts:1}]:[]).concat([iso,{w:`<b>Somme des angles du triangle OAB : ${absAn("OAB")} ${fx(`= 1/2 × (π − ${angT(th)}) = 1/2 × ${angT(sub(PI,th))} = ${angT(be)}`)}.</b>`,why:"On retire l'angle au centre de π, puis on partage le reste entre les deux angles égaux.",pts:1}]);
    pieges=[[sub(PI,th),E.length-1,"moitié oubliée","Où ça part : le partage en deux.",`${fx(angT(sub(PI,th)))} est la somme des deux angles à la base. Chacun en vaut la moitié.`],[al,E.length-1,"angle inscrit recopié","Où ça part : l'angle demandé.",`${fx(angT(al))}, c'est ${absAn("AMB")}. L'angle demandé est dans le triangle OAB.`],[sub(PI,al),E.length-1,"angle au centre oublié","Où ça part : l'angle en O.",`Dans le triangle OAB, l'angle en O vaut ${angT(th)}, le double de l'angle inscrit.`]];}
  const PP=k==="centre"?{O:P.O,A:P.A,B:P.B}:P;
  return unAngle({nom,x:V,autre,etapes:E,pieges,sig:"IC"+JSON.stringify([k,brut(al)]),q,corps:fig+`<p>${RAP_C} ${RAP_RAD}</p>`,texte:{inscrit:`angle AMB = ${angT(al)}, M du même côté de (AB) que O ; calculer OAB`,centre:`angle AOB = ${angT(th)} ; calculer OAB`,retour:`angle OAB = ${angT(be)}, M du même côté que O ; calculer AMB`}[k],nature:{inscrit:"angle inscrit puis triangle isocèle",centre:"triangle isocèle au centre",retour:"triangle isocèle puis angle inscrit"}[k],
    ens:ensC(PP,don,{x:nom==="OAB"?["O","A","B"]:["A","M","B"]},k==="centre"?[]:[["meme","M","O","A","B"]])});}

/* quatre points dans l'ordre sur le cercle : arcs AB, BC, CD, DA (en fractions de π, somme 2π) */
function quatre(R){for(;;){const N=R.choix([6,8,9,10,12,18]),m=Math.ceil(N/5),k=[R.ent(m,N),R.ent(m,N),R.ent(m,N)];k.push(2*N-k[0]-k[1]-k[2]);if(k[3]<m)continue;
  const a=k.map(x=>Q(x,N)),f0=R()*2*Math.PI,t=[0,1,2,3].map(i=>f0+Math.PI*k.slice(0,i).reduce((s,x)=>s+x,0)/N),P={O:[0,0]};["A","B","C","D"].forEach((n,i)=>P[n]=surC(t[i]));return {a,P};}}
function quadInscrit(R){const k=R.choix(["opp","opp","meme","meme"]),{a,P}=quatre(R),ins=(i,j)=>mul(add(a[i],a[j]),DEMI);
  const fig=x=>figure(P,{cercles:[["O",1]],seg:[["A","B"],["B","C"],["C","D"],["D","A"]],tirets:k==="meme"?[["A","C"],["B","D"]]:[],points:["A","B","C","D"],noms:["A","B","C","D"],angles:x,alt:"Le quadrilatère ABCD inscrit dans le cercle"});
  const def="ABCD est un quadrilatère inscrit dans un cercle C : ses quatre sommets sont sur C, dans cet ordre quand on fait le tour du cercle.";
  if(k==="opp"){const x=ins(2,3),V=ins(0,1);
    const E=[{w:"B et D sont de part et d'autre de la diagonale (AC) : ils sont sur les deux arcs différents du cercle délimités par A et C.",why:"Les sommets sont dans l'ordre A, B, C, D sur le cercle : en allant de A à C, on passe par B d'un côté et par D de l'autre.",pts:1},
      {w:`<b>D'après le théorème de l'angle inscrit (corollaire 5.2.3 et remarque 5.2.4), deux points sur des arcs différents donnent des angles supplémentaires : ${absAn("ABC")} ${fx("+")} ${absAn("ADC")} ${fx("= π")}, donc ${absAn("ADC")} ${fx("= "+chaine([[1,PI],[-1,x]]).t)}.</b>`,why:"Sur le même arc, les angles inscrits sont égaux ; sur l'autre arc, ils sont supplémentaires. C'est la propriété des quadrilatères inscrits : les angles opposés font π.",pts:1.5}];
    return unAngle({nom:"ADC",x:V,autre:x,etapes:E,sig:"QO"+JSON.stringify(a.map(brut)),q:`${def} On sait que ${egA("ABC",x)}. Calcule ${absAn("ADC")}.`,corps:fig([["A","B","C",angT(x),16],["A","D","C","?",16]])+`<p>${RAP_RAD}</p>`,texte:`ABCD inscrit, angle ABC = ${angT(x)} ; calculer l'angle ADC`,nature:"angles opposés d'un quadrilatère inscrit",
      pieges:[[x,1,"angles opposés pris égaux","Où ça part : les deux arcs.","B et D sont sur des arcs différents : leurs angles sont supplémentaires (somme π), pas égaux."]],ens:ensC(P,[["A","B","C",angV(x)]],{x:["A","D","C"]},[["opp","B","D","A","C"]])});}
  const x=mul(a[1],DEMI);
  const E=[{w:"A et D sont du même côté de la droite (BC) : ils sont sur le même arc du cercle délimité par B et C.",why:"Les sommets sont dans l'ordre A, B, C, D : l'arc de B à C qui ne contient ni A ni D est l'arc BC « court » ; A et D sont tous les deux sur l'autre.",pts:1},
    {w:`<b>D'après le théorème de l'angle inscrit (corollaire 5.2.3 et remarque 5.2.4), deux points du même arc voient [BC] sous le même angle : ${absAn("BDC")} = ${egA("BAC",x)}.</b>`,why:"Les angles inscrits qui interceptent le même arc sont égaux.",pts:1.5}];
  return unAngle({nom:"BDC",x,autre:sub(PI,x),etapes:E,sig:"QM"+JSON.stringify(a.map(brut)),q:`${def} On sait que ${egA("BAC",x)}. Calcule ${absAn("BDC")}.`,corps:fig([["B","A","C",angT(x),18],["B","D","C","?",18]])+`<p>${RAP_RAD}</p>`,texte:`ABCD inscrit, angle BAC = ${angT(x)} ; calculer l'angle BDC`,nature:"angles inscrits sur le même arc",
    pieges:[[sub(PI,x),1,"angles supplémentaires au lieu d'égaux","Où ça part : l'arc.","A et D sont sur le même arc : les angles sont égaux. Ils seraient supplémentaires si les points étaient sur des arcs différents."],[mul(x,2),1,"angle au centre","Où ça part : le sommet.","Le double, c'est l'angle au centre BOC. Ici le sommet D est sur le cercle."]],ens:ensC(P,[["B","A","C",angV(x)]],{x:["B","D","C"]},[["meme","A","D","B","C"]])});}

/* comme au CC : plusieurs propriétés à la suite */
function chasseCercle(R){const r=R();
  if(r<0.35){const {a,P}=quatre(R),x=mul(a[1],DEMI),y=mul(a[2],DEMI),V=sub(PI,add(x,y));
    const E=[{w:`D est sur [AC) ou non, peu importe : [AC) est entre [AB) et [AD), donc ${absAn("BAD")} = ${absAn("BAC")} ${fx("+")} ${absAn("CAD")} ${fx(`= ${angT(x)} + ${angT(y)} = ${angT(add(x,y))}`)}.`,why:"La diagonale [AC) partage l'angle du quadrilatère en A en deux morceaux qui s'ajoutent.",pts:1},
      {w:"A et C sont de part et d'autre de la diagonale (BD) : ils sont sur des arcs différents délimités par B et D.",why:"Les sommets sont dans l'ordre A, B, C, D sur le cercle.",pts:0.5},
      {w:`<b>Angles opposés d'un quadrilatère inscrit (corollaire 5.2.3, remarque 5.2.4) : ${absAn("BCD")} ${fx("= π −")} ${absAn("BAD")} ${fx("= "+chaine([[1,PI],[-1,add(x,y)]]).t)}.</b>`,why:"Deux points sur des arcs différents voient la corde sous des angles supplémentaires.",pts:1}];
    E[0].w=`[AC) est entre [AB) et [AD) : ${absAn("BAD")} = ${absAn("BAC")} ${fx("+")} ${absAn("CAD")} ${fx(`= ${angT(x)} + ${angT(y)} = ${angT(add(x,y))}`)}.`;
    return unAngle({nom:"BCD",x:V,autre:add(x,y),etapes:E,sig:"CQ"+JSON.stringify(a.map(brut)),q:`ABCD est un quadrilatère inscrit dans un cercle C : ses quatre sommets sont sur C, dans cet ordre quand on fait le tour du cercle. On sait que ${egA("BAC",x)} et ${egA("CAD",y)}. Calcule ${absAn("BCD")}.`,
      corps:figure(P,{cercles:[["O",1]],seg:[["A","B"],["B","C"],["C","D"],["D","A"]],tirets:[["A","C"]],points:["A","B","C","D"],noms:["A","B","C","D"],angles:[["B","A","C",angT(x),18],["C","A","D",angT(y),24],["B","C","D","?",16]],alt:"Le quadrilatère ABCD inscrit et sa diagonale [AC]"})+`<p>${RAP_RAD}</p>`,
      texte:`ABCD inscrit, angle BAC = ${angT(x)}, angle CAD = ${angT(y)} ; calculer l'angle BCD`,nature:"quadrilatère inscrit et diagonale",
      pieges:[[add(x,y),2,"angles opposés pris égaux","Où ça part : les deux arcs.","A et C sont sur des arcs différents : les angles en A et en C sont supplémentaires."],[sub(PI,x),0,"angle CAD oublié","Où ça part : l'angle en A.",`L'angle du quadrilatère en A est ${absAn("BAD")}, la somme des deux morceaux.`]],ens:ensC(P,[["B","A","C",angV(x)],["C","A","D",angV(y)]],{x:["B","C","D"]},[["opp","A","C","B","D"]])});}
  if(r<0.7){const al=tireAl(R,5),th=mul(al,2),be=sub(DEMI,al),t=R.choix([0.35,0.5,0.65]),P0=centreAB(al,t),P={O:P0.O,B:P0.A,C:P0.B,A:P0.M};
    const E=[{w:`A, B et C sont sur le cercle de centre O, et A et O sont du même côté de (BC) : d'après le théorème 5.2.1, ${absAn("BOC")} ${fx("= 2 ×")} ${absAn("BAC")} ${fx(`= ${angT(th)}`)}.`,why:"L'angle au centre est le double de l'angle inscrit quand le sommet de l'angle inscrit est sur l'arc du même côté que le centre.",pts:1},
      {w:`OB = OC (deux rayons) : le triangle OBC est isocèle en O, donc ${absAn("OBC")} = ${absAn("OCB")}.`,why:"Les angles à la base d'un triangle isocèle sont égaux (feuille 1, exercice 7).",pts:1},
      {w:`<b>Somme des angles du triangle OBC : ${absAn("OBC")} ${fx(`= 1/2 × (π − ${angT(th)}) = ${angT(be)}`)}.</b>`,why:"On retire l'angle au centre, puis on partage en deux. On retrouve π/2 moins l'angle en A.",pts:1}];
    return unAngle({nom:"OBC",x:be,autre:al,etapes:E,sig:"CT"+JSON.stringify([brut(al),t]),q:`Le triangle ABC est inscrit dans un cercle de centre O, avec A et O du même côté de la droite (BC), et ${egA("BAC",al)}. Calcule ${absAn("OBC")}.`,
      corps:figure(P,{cercles:[["O",1]],seg:[["A","B"],["B","C"],["A","C"],["O","B"],["O","C"]],points:["O","A","B","C"],angles:[["B","A","C",angT(al),16],["O","B","C","?",16]],alt:"Le triangle ABC inscrit dans le cercle de centre O"})+`<p>Rappel : « inscrit » veut dire que les trois sommets sont sur le cercle. ${RAP_RAD}</p>`,
      texte:`ABC inscrit dans le cercle de centre O, A et O du même côté de (BC), angle BAC = ${angT(al)} ; calculer l'angle OBC`,nature:"triangle inscrit et centre",
      pieges:[[al,0,"angle inscrit recopié","Où ça part : l'angle au centre.","L'angle en O est le double de l'angle en A."],[sub(PI,th),2,"moitié oubliée","Où ça part : le partage en deux.","π moins l'angle au centre, c'est la somme des deux angles égaux du triangle OBC."]],
      ens:ensC(P,[["B","A","C",angV(al)]],{x:["O","B","C"]},[["meme","A","O","B","C"]])});}
  const x=tireAl(R,5),de=R.choix([0.3,0.5,0.7]),P={O:[0,0],A:[-1,0],C:[1,0],B:surC(2*angV(x)),D:surC(-Math.PI*de)},V=sub(DEMI,x);
  const E=[{w:`B est sur le cercle de diamètre [AC] : d'après le corollaire 5.2.5, ${absAn("ABC")} ${fx("= π/2")}.`,why:"Un point du cercle, autre que A et C, voit le diamètre sous un angle droit.",pts:1},
    {w:`Somme des angles du triangle ABC : ${absAn("BCA")} ${fx("= "+chaine([[1,PI],[-1,DEMI],[-1,x]]).t)}.`,why:"Somme des angles d'un triangle (proposition 2.4.2), avec l'angle droit en B.",pts:1},
    {w:`<b>C et D sont du même côté de (AB), sur le même arc : d'après le théorème de l'angle inscrit, ${absAn("BDA")} = ${egA("BCA",V)}.</b>`,why:"Deux points du même arc voient la corde [AB] sous le même angle (corollaire 5.2.3 et remarque 5.2.4).",pts:1}];
  return unAngle({nom:"BDA",x:V,autre:x,etapes:E,sig:"CDI"+JSON.stringify([brut(x),de]),q:`Soit C le cercle de diamètre [AC]. Les points B et D sont sur ce cercle, de part et d'autre de (AC), et ${egA("BAC",x)}. Calcule ${absAn("BDA")}.`,
    corps:figure(P,{cercles:[["O",1]],seg:[["A","C"],["A","B"],["B","C"],["A","D"],["B","D"]],points:["O","A","B","C","D"],angles:[["B","A","C",angT(x),16],["B","D","A","?",16]],alt:"Le cercle de diamètre [AC] et les points B et D"})+`<p>${RAP_RAD}</p>`,
    texte:`cercle de diamètre [AC], B et D de part et d'autre de (AC), angle BAC = ${angT(x)} ; calculer l'angle BDA`,nature:"diamètre puis même arc",
    pieges:[[x,2,"mauvais angle reporté","Où ça part : l'arc.",`L'angle en D intercepte la corde [AB] : il est égal à l'angle en C, ${absAn("BCA")}, pas à l'angle en A.`],[sub(PI,x),1,"angle droit oublié","Où ça part : l'angle en B.","Le triangle ABC est rectangle en B (corollaire 5.2.5)."]],
    ens:ensC(P,[["B","A","C",angV(x)]],{x:["B","D","A"]},[["meme","C","D","A","B"],["opp","B","D","A","C"],["entre","O","A","C"]])});}
/* comme au CC : deux droites sécantes en K, des parallèles, et les homothéties de centre K qu'elles fabriquent */
function droitesPar(R){const pap=R()<0.45,phi=R.choix([40,50,55,60,65,70])*Math.PI/180,m=R()<0.5?-1:1,u=[1,0],v=[m*Math.cos(phi),Math.sin(phi)],pt=(w,t)=>[w[0]*t,w[1]*t],sg=()=>R()<0.5?-1:1;
  let al,be,ga,gp,ap,bp;
  for(;;){al=sg()*R.ent(2,6);be=sg()*R.ent(2,7);ga=sg()*R.ent(2,7);ap=sg()*R.ent(2,6);gp=ap;
    if(al===be||(pap&&(ga===al||ga===be)))continue;
    if(pap){bp=ga*gp/be;ap=ga*gp/al;}else bp=be*ap/al;
    if(Math.max(Math.abs(ap),Math.abs(bp))<=12&&Math.min(Math.abs(ap),Math.abs(bp))>=1)break;}
  const P={K:[0,0],A:pt(u,al),B:pt(u,be),"A′":pt(v,ap),"B′":pt(v,bp)};if(pap){P.C=pt(u,ga);P["C′"]=pt(v,gp);}
  const ext=(L,w)=>{const t=L.map(n=>[n,(P[n][0]*w[0]+P[n][1]*w[1])]).sort((x,y)=>x[1]-y[1]);return [t[0][0],t[t.length-1][0]];};
  const l1=Q(be,al),cot=(a,b)=>`${b} est ${Math.sign(P[a][0])===Math.sign(P[b][0])?"du même côté de K que":"de l'autre côté de K par rapport à"} ${a}`,abs=Math.abs,F=(a,b)=>Q(abs(a),abs(b));
  const fig=figure(P,{droites:[ext(pap?["K","A","B","C"]:["K","A","B"],u),ext(pap?["K","A′","B′","C′"]:["K","A′","B′"],v)],seg:pap?[["A","B′"],["B","A′"],["B","C′"],["C","B′"]]:[["A","A′"],["B","B′"]],points:Object.keys(P),alt:"Deux droites sécantes en K et des segments parallèles"});
  const E=[],l1t=`${ve("KB")} = λ₁${ve("KA")}, avec ${fx(`|λ_{1}| = KB/KA = ${quot(abs(be),abs(al),F(be,al))}`)} ; ${sens(be*al>0,"K","A","B")} : ${fx("λ_{1} = "+nb(l1))}`;
  let V,W,nomW,q,pv,pw;
  if(!pap){V=l1;W=F(be*ap,al);nomW="KB′";
    q=`Deux droites Δ et Δ′ se coupent en K. Les points A et B sont sur Δ, les points A′ et B′ sur Δ′, tous distincts de K, et les droites (AA′) et (BB′) sont parallèles. On sait que ${fx(`KA = ${abs(al)}`)}, ${fx(`KB = ${abs(be)}`)}, ${fx(`KA′ = ${abs(ap)}`)}, et ${be*al>0?"A et B sont du même côté de K":"K est entre A et B"}. (1) Donne le rapport λ₁ de l'homothétie h de centre K telle que h(A) = B. (2) Calcule KB′.`;
    E.push({w:`K, A et B sont alignés et A ≠ K : il existe un réel λ₁ tel que ${l1t}. L'homothétie h de centre K et de rapport λ₁ vérifie h(A) = B.`,why:"C'est la définition 3.3.3 lue à l'envers : le rapport se lit sur les longueurs, son signe sur la position de B par rapport à K.",pts:1},
      {w:"D'après le théorème 3.3.4 (ii), h((AA′)) est une droite parallèle à (AA′). Elle passe par h(A) = B : c'est la parallèle à (AA′) passant par B, c'est-à-dire (BB′).",why:"Par un point passe une seule parallèle à une droite donnée : h((AA′)) et (BB′) sont parallèles à (AA′) et passent toutes deux par B.",pts:1},
      {w:`Le point h(A′) est sur Δ′, car ${ve("Kh(A′)")} = λ₁${ve("KA′")}, et sur h((AA′)) = (BB′). Donc h(A′) est le point d'intersection de Δ′ et de (BB′) : h(A′) = B′.`,why:"Deux droites sécantes ont un seul point commun : B′.",pts:1},
      {w:`<b>D'après le théorème 3.3.4 (i), ${fx(`KB′ = |λ_{1}| × KA′ = ${nb(vabs(l1))} × ${abs(ap)} = ${nb(W)}`)}.</b>`,why:"h(K) = K et h(A′) = B′ : la distance KB′ est |λ₁| fois la distance KA′. On retrouve le résultat de Thalès : KB′/KA′ = KB/KA.",pts:1});
    pv={signe:be*al>0?"A et B sont du même côté de K : le rapport est positif.":"K est entre A et B : le rapport est négatif.",envers:"λ₁ = KB/KA, car h(A) = B : le point d'arrivée au numérateur."};pw=div(Q(abs(ap)),vabs(l1));}
  else{const l2=Q(ga,be),l3=Q(ga,al);V=l3;W=F(ga*gp,al);nomW="KA′";
    q=`Deux droites Δ et Δ′ se coupent en K. Les points A, B, C sont sur Δ et A′, B′, C′ sur Δ′, tous distincts de K. On suppose (AB′) // (BA′) et (BC′) // (CB′). On note h₁ l'homothétie de centre K telle que h₁(A) = B, et h₂ celle de centre K telle que h₂(B) = C. On sait que ${fx(`KA = ${abs(al)}`)}, ${fx(`KB = ${abs(be)}`)}, ${fx(`KC = ${abs(ga)}`)}, ${fx(`KC′ = ${abs(gp)}`)} ; ${cot("A","B")}, et ${cot("B","C")}. (1) Donne le rapport de h₂ ∘ h₁. (2) Calcule KA′.`;
    E.push({w:`${l1t}. De même, ${ve("KC")} = λ₂${ve("KB")}, avec ${fx(`|λ_{2}| = KC/KB = ${quot(abs(ga),abs(be),F(ga,be))}`)} ; ${sens(ga*be>0,"K","B","C")} : ${fx("λ_{2} = "+nb(l2))}.`,why:"h₁ envoie A sur B : son rapport est KB/KA, avec le signe donné par la position de B. Même chose pour h₂, qui envoie B sur C.",pts:1},
      {w:"(AB′) // (BA′) : h₁((AB′)) est la parallèle à (AB′) passant par h₁(A) = B, c'est (BA′). Le point h₁(B′) est sur Δ′ et sur (BA′) : h₁(B′) = A′.",why:"C'est le raisonnement de l'exercice 2 de la feuille 3 : l'image d'une droite par une homothétie est une droite parallèle (théorème 3.3.4 (ii)).",pts:1},
      {w:"De même, (BC′) // (CB′) et h₂(B) = C donnent h₂(C′) = B′.",why:"On applique le même raisonnement à h₂, avec les droites (BC′) et (CB′).",pts:1},
      {w:`<b>h₂ ∘ h₁ est l'homothétie de centre K et de rapport ${fx(`λ_{1} × λ_{2} = ${par(l1)} × ${par(l2)} = ${nb(l3)}`)}.</b>`,why:"La composée de deux homothéties de même centre est une homothétie de ce centre, dont le rapport est le produit des rapports (feuille 3, exercice 1).",pts:1},
      {w:`<b>h₁ et h₂ commutent, donc (h₂ ∘ h₁)(C′) = h₁(h₂(C′)) = h₁(B′) = A′, et ${fx(`KA′ = |λ_{1}λ_{2}| × KC′ = ${nb(vabs(l3))} × ${abs(gp)} = ${nb(W)}`)}.</b>`,why:"Deux homothéties de même centre commutent (feuille 3, exercice 1), comme dans le corrigé du CC2 2025. Puis le théorème 3.3.4 (i) pour la distance.",pts:1});
    pv={signe:"Le signe du produit suit la règle des signes : regarde le signe de λ₁ et celui de λ₂.",envers:"λ₁ = KB/KA et λ₂ = KC/KB : leur produit vaut KC/KA, avec le bon signe."};pw=div(Q(abs(gp)),vabs(l3));}
  const VV=fl(V),WW=fl(W),iV=pap?3:0,iW=E.length-1;
  function juge(rep){const r1=lisNombre(rep.x,VV,"le rapport");if(r1.inc)return {incomplet:r1.inc};const r2=lisNombre(rep.y,WW,"la longueur "+nomW);if(r2.inc)return {incomplet:r2.inc};
    const o1=pres(r1.v,VV),o2=pres(r2.v,WW),Fx=[];if(!o1)Fx.push("x");if(!o2)Fx.push("y");if(!Fx.length)return {ok:true};
    const res=`Pas tout à fait : ${!o1&&!o2?"les deux réponses sont fausses":!o1?"le rapport est faux":"le rapport est juste, mais pas "+nomW}.`;
    if(!o1){if(pres(r1.v,-VV))return faux({f:Fx,etape:iV,type:"signe du rapport",titre:"Où ça part : le signe.",msg:pv.signe},res);if(pres(r1.v,1/VV))return faux({f:Fx,etape:0,type:"rapport à l'envers",titre:"Où ça part : le quotient.",msg:pv.envers},res);return faux({f:Fx,etape:iV,type:"calcul du rapport",titre:"Où ça part : le rapport.",msg:E[iV].w},res);}
    if(pres(r2.v,fl(pw)))return faux({f:Fx,etape:iW,type:"division au lieu de multiplication",titre:"Où ça part : la distance.",msg:`L'homothétie multiplie la distance à K par |λ| : ${E[iW].w}`},res);
    return faux({f:Fx,etape:iW,type:"calcul de "+nomW,titre:"Où ça part : la distance.",msg:E[iW].w},res);}
  return {sig:"DP"+JSON.stringify([pap,al,be,ga,gp,ap]),q,corps:fig+`<p>Rappel : l'homothétie h de centre K et de rapport λ envoie M sur le point h(M) tel que ${ve("Kh(M)")} = λ${ve("KM")}. Elle multiplie les distances par |λ| et envoie chaque droite sur une droite parallèle (théorème 3.3.4).</p>`,
    texte:pap?`Δ et Δ′ sécantes en K, A B C sur Δ, A′ B′ C′ sur Δ′, (AB′) // (BA′), (BC′) // (CB′), KA = ${abs(al)}, KB = ${abs(be)}, KC = ${abs(ga)}, KC′ = ${abs(gp)} ; rapport de h2 ∘ h1 et KA′`:`Δ et Δ′ sécantes en K, A B sur Δ, A′ B′ sur Δ′, (AA′) // (BB′), KA = ${abs(al)}, KB = ${abs(be)}, KA′ = ${abs(ap)} ; rapport de h et KB′`,
    champs:[champL("x","rapport",pap?"rapport de h₂ ∘ h₁ :":"$λ_{1} =$","par exemple -5/3"),champL("y",nomW,`$${nomW} =$`,"par exemple 21/4")],juge,etapes:E,
    bonne:`${pap?"rapport":fx("λ_{1}")} ${fx("= "+nb(V))} et ${fx(`${nomW} = ${nb(W)}`)}`,bonneTxt:`rapport = ${nb(V)} ; ${nomW} = ${nb(W)}`,repBonne:{x:brut(V),y:brut(W)},repFausse:{x:brut(mul(V,-1)),y:brut(W)},nature:pap?"deux homothéties, comme au CC2 2025":"homothétie et parallèles (feuille 3, exercice 2)",
    ens:{k:pap?"pap":"par",P,u,v}};}

/* ---------- GE2, palier 1 : les translations (définition 3.3.1, théorème 3.3.2, feuille 3 exercice 3) ---------- */
const pt2=(n,x,y)=>fx(`${n}(${nb(x)} ; ${nb(y)})`),vc2=(n,x,y)=>`${ve(n)}${fx(`(${nb(x)} ; ${nb(y)})`)}`,plus=(x,a)=>`${nb(x)} ${a<0?"−":"+"} ${Math.abs(a)}`;
function jugeCoord(V,E,pieges){return rep=>{const c=rep.c||{},x=O.nombre(c.x),y=O.nombre(c.y);
  if(!x||!y)return {incomplet:"Écris les deux coordonnées : deux nombres, par exemple 3 et -2."};
  const vx=x.n/x.d,vy=y.n/y.d,F=[];if(vx!==V[0])F.push("x");if(vy!==V[1])F.push("y");if(!F.length)return {ok:true};
  for(const p of pieges)if(vx===p[0][0]&&vy===p[0][1])return faux({f:F,etape:p[1],type:p[2],titre:p[3],msg:p[4]});
  return faux({f:F,etape:E.length-1,type:"calcul des coordonnées",titre:"Où ça part : le calcul.",msg:E[E.length-1].w});};}
const unCoord=({quoi,V,pieges,...o})=>{const autre=pieges.map(p=>p[0]).find(w=>w[0]!==V[0]||w[1]!==V[1])||[V[0]+1,V[1]],t=`(${nb(V[0])} ; ${nb(V[1])})`;
  return Object.assign({champs:[{k:"cases",id:"c",titre:`Les coordonnées ${quoi} :`,noms:["x","y"],aide:"Deux nombres, avec leur signe."}],juge:jugeCoord(V,o.etapes,pieges),bonne:fx(t),bonneTxt:t,repBonne:{c:{x:String(V[0]),y:String(V[1])}},repFausse:{c:{x:String(autre[0]),y:String(autre[1])}}},o);};
const RAP_T=`<p>Rappel : la translation de vecteur ${ve("u")} envoie chaque point M sur le point M′ tel que ${ve("MM′")} = ${ve("u")} (définition 3.3.1).</p>`;
function translations(R){const r=R();
  if(r<0.3){const a=R.nz(-6,6),b=R.nz(-6,6),x=R.ent(-6,6),y=R.ent(-6,6),V=[x+a,y+b];
    const E=[{w:`Par définition (3.3.1), M′ = t(M) est le point tel que ${ve("MM′")} = ${ve("u")}.`,why:"Une translation déplace tous les points de la même façon : de M à son image, on parcourt exactement le vecteur de la translation.",pts:1},
      {w:`En coordonnées : ${fx(`x′ − ${par(x)} = ${nb(a)}`)} et ${fx(`y′ − ${par(y)} = ${nb(b)}`)}.`,why:"Les coordonnées du vecteur MM′ sont celles de l'arrivée M′ moins celles du départ M.",pts:1},
      {w:`<b>${fx(`M′(${plus(x,a)} ; ${plus(y,b)}) = M′(${nb(V[0])} ; ${nb(V[1])})`)}</b>`,why:"On ajoute les coordonnées du vecteur à celles du point : abscisse avec abscisse, ordonnée avec ordonnée.",pts:1}];
    return unCoord({quoi:"de M′",V,etapes:E,sig:"TI"+JSON.stringify([a,b,x,y]),q:`Dans un repère du plan, soit t la translation de vecteur ${vc2("u",a,b)}. Quelles sont les coordonnées de l'image M′ = t(M) du point ${pt2("M",x,y)} ?`,corps:RAP_T,
      texte:`translation de vecteur (${nb(a)} ; ${nb(b)}), image de M(${nb(x)} ; ${nb(y)})`,nature:"image d'un point",ens:{k:"timg",u:[a,b],M:[x,y]},
      pieges:[[[x-a,y-b],2,"vecteur retiré au lieu d'être ajouté","Où ça part : le sens.","Pour aller de M à son image, on ajoute le vecteur de la translation. En le retirant, on trouve le point dont M est l'image."],
        [[x+b,y+a],2,"coordonnées du vecteur échangées","Où ça part : abscisse et ordonnée.","La première coordonnée du vecteur s'ajoute à l'abscisse de M, la seconde à son ordonnée."],
        [[a,b],0,"coordonnées du vecteur recopiées","Où ça part : ce qui est demandé.","Ce sont les coordonnées du vecteur de la translation. L'image de M est le point où l'on arrive en partant de M et en parcourant ce vecteur."]]});}
  if(r<0.55){let x1,y1,x3,y3;const a=R.nz(-5,5),b=R.nz(-5,5);do{x1=R.ent(-5,5);y1=R.ent(-5,5);x3=R.ent(-5,5);y3=R.ent(-5,5);}while(x1===x3&&y1===y3);const x2=x1+a,y2=y1+b,V=[x3+a,y3+b];
    const E=[{w:`t envoie A sur A′ : son vecteur est ${ve("AA′")}, de coordonnées ${fx(`(${nb(x2)} − ${par(x1)} ; ${nb(y2)} − ${par(y1)}) = (${nb(a)} ; ${nb(b)})`)}.`,why:"Les coordonnées d'un vecteur : arrivée moins départ. Une translation n'a qu'un seul vecteur, celui qui mène de n'importe quel point à son image.",pts:1.5},
      {w:`<b>${fx(`B′(${plus(x3,a)} ; ${plus(y3,b)}) = B′(${nb(V[0])} ; ${nb(V[1])})`)}</b>`,why:`B′ = t(B) vérifie ${ve("BB′")} = ${ve("AA′")} : on ajoute à B le vecteur trouvé.`,pts:1.5}];
    return unCoord({quoi:"de B′",V,etapes:E,sig:"TV"+JSON.stringify([x1,y1,a,b,x3,y3]),q:`Dans un repère du plan, t est la translation qui envoie ${pt2("A",x1,y1)} sur ${pt2("A′",x2,y2)}. Quelles sont les coordonnées de l'image B′ = t(B) du point ${pt2("B",x3,y3)} ?`,corps:RAP_T,
      texte:`translation qui envoie A(${nb(x1)} ; ${nb(y1)}) sur A′(${nb(x2)} ; ${nb(y2)}), image de B(${nb(x3)} ; ${nb(y3)})`,nature:"translation donnée par un point et son image",ens:{k:"tvec",A:[x1,y1],A2:[x2,y2],B:[x3,y3]},
      pieges:[[[x3-a,y3-b],0,"vecteur calculé à l'envers : départ moins arrivée","Où ça part : le vecteur.","Le vecteur de la translation va de A vers son image A′ : on calcule les coordonnées de A′ moins celles de A."],
        [[x2,y2],1,"image de A recopiée","Où ça part : le point demandé.","Ce sont les coordonnées de A′, l'image de A. On demande l'image de B : le même vecteur, posé en B."],
        [[a,b],1,"vecteur donné à la place du point","Où ça part : la dernière étape.","Ce sont les coordonnées du vecteur de la translation. Il reste à l'ajouter aux coordonnées de B."]]});}
  if(r<0.75){let a,b,c,d;do{a=R.nz(-6,6);b=R.nz(-6,6);c=R.nz(-6,6);d=R.nz(-6,6);}while((a+c===0&&b+d===0)||(a===c&&b===d));const inv=R()<0.5,nom=inv?"t′ ∘ t":"t ∘ t′",V=[a+c,b+d];
    const E=[{w:inv?`Soit M un point. On pose M′ = t(M), puis M″ = t′(M′) : ${ve("MM′")} = ${ve("u")} et ${ve("M′M″")} = ${ve("v")}.`:`Soit M un point. On pose M′ = t′(M), puis M″ = t(M′) : ${ve("MM′")} = ${ve("v")} et ${ve("M′M″")} = ${ve("u")}.`,why:`${nom} veut dire : on applique d'abord ${inv?"t":"t′"}, puis ${inv?"t′":"t"}. La transformation écrite à droite agit la première.`,pts:1},
      {w:`Par la relation de Chasles, ${ve("MM″")} = ${ve("MM′")} + ${ve("M′M″")} = ${ve("u")} + ${ve("v")}. La composée est donc la translation de vecteur ${ve("u")} + ${ve("v")}.`,why:"Ce vecteur est le même pour tous les points M : c'est bien une translation (feuille 3, exercice 3). Et comme l'addition des vecteurs ne dépend pas de l'ordre, t ∘ t′ = t′ ∘ t.",pts:1},
      {w:`<b>${ve("u")} + ${ve("v")} ${fx(`= (${plus(a,c)} ; ${plus(b,d)}) = (${nb(V[0])} ; ${nb(V[1])})`)}</b>`,why:"On additionne les coordonnées : abscisse avec abscisse, ordonnée avec ordonnée.",pts:1}];
    return unCoord({quoi:`du vecteur de ${nom}`,V,etapes:E,sig:"TC"+JSON.stringify([a,b,c,d,inv]),q:`Dans un repère du plan, soient t la translation de vecteur ${vc2("u",a,b)} et t′ la translation de vecteur ${vc2("v",c,d)}. La composée ${nom} est une translation. Quelles sont les coordonnées de son vecteur ?`,corps:RAP_T,
      texte:`translations de vecteurs (${nb(a)} ; ${nb(b)}) et (${nb(c)} ; ${nb(d)}), vecteur de ${nom}`,nature:"composée de deux translations",ens:{k:"tcomp",u:[a,b],v:[c,d],inv},
      pieges:[[[a-c,b-d],1,"différence des deux vecteurs","Où ça part : l'opération.","On enchaîne les deux déplacements : les vecteurs s'ajoutent (relation de Chasles), ils ne se retranchent pas."],[[c-a,d-b],1,"différence des deux vecteurs","Où ça part : l'opération.","On enchaîne les deux déplacements : les vecteurs s'ajoutent (relation de Chasles), ils ne se retranchent pas."],
        [[a*c,b*d],2,"coordonnées multipliées","Où ça part : le calcul.","Pour ajouter deux vecteurs, on ajoute leurs coordonnées. On ne les multiplie pas."],[[a,b],0,"un seul des deux vecteurs","Où ça part : la composée.","La composée applique les deux translations l'une après l'autre : les deux vecteurs comptent."],[[c,d],0,"un seul des deux vecteurs","Où ça part : la composée.","La composée applique les deux translations l'une après l'autre : les deux vecteurs comptent."]]});}
  if(r<0.85){const [p1,p2,p3,p4]=R.choix(["ABCD","MNPQ","EFGH","RSTU"]).split(""),w=R.ent(0,1),O4={ok:p1+p2+p4+p3,w1:p1+p2+p3+p4,w2:p1+p3+p2+p4,w3:p1+p4+p3+p2};
    const E=[{w:`${p4} = t(${p3}) veut dire ${ve(p3+p4)} = ${ve(p1+p2)}.`,why:"C'est la définition 3.3.1 : le vecteur qui va d'un point à son image est le vecteur de la translation.",pts:1},
      {w:`<b>${O4.ok} est un parallélogramme.</b>`,why:`Le poly le dit juste après la définition : quand le vecteur de la translation est ${ve(p1+p2)}, l'image M′ d'un point M est l'unique point tel que ${p1}${p2}M′M soit un parallélogramme. Ici M = ${p3} et M′ = ${p4}. On fait le tour : ${p1}, ${p2}, puis l'image ${p4}, puis ${p3}.`,pts:1}];
    return {sig:"TP"+JSON.stringify([p1,w]),q:`Soient ${p1}, ${p2} et ${p3} trois points non alignés, et t la translation ${w?`qui envoie ${p1} sur ${p2}`:`de vecteur ${ve(p1+p2)}`}. On note ${p4} = t(${p3}). Lequel de ces quadrilatères est un parallélogramme ?`,corps:"",texte:`translation de vecteur ${p1}${p2}, ${p4} = t(${p3}) ; quel parallélogramme`,nature:"translation et parallélogramme",
      champs:[champC("x",null,R.mel(Object.keys(O4)).map(c=>[c,O4[c]]))],juge:jugeQ({x:"ok"},()=>[1,"parallélogramme nommé dans le mauvais ordre","Où ça part : l'ordre des sommets.",`Les vecteurs égaux sont ${ve(p1+p2)} et ${ve(p3+p4)}. En faisant le tour du parallélogramme, on part de ${p1}, on va en ${p2}, puis en ${p4} (l'image), et on revient par ${p3} : c'est ${O4.ok}.`]),
      etapes:E,bonne:O4.ok,bonneTxt:O4.ok,repBonne:{x:"ok"},repFausse:{x:"w1"},ens:{k:"tpara",o:O4}};}
  let d,l;do{d=R.ent(2,12);l=R.ent(1,9);}while(d===l);const img=R()<0.55,N=img?"A′B′":"AA′",v=img?d:l;
  const E=img?[{w:`D'après le théorème 3.3.2 (i), une translation préserve les distances : ${fx("t(A)t(B) = AB")}.`,why:"Les vecteurs AA′ et BB′ sont égaux, donc AA′B′B est un parallélogramme : ses côtés opposés [AB] et [A′B′] ont la même longueur.",pts:1},
      {w:`<b>${fx(`A′B′ = AB = ${d}`)}</b>`,why:`La norme du vecteur, ${l}, ne sert pas ici : elle dit de combien chaque point se déplace, pas la distance entre deux images.`,pts:1}]
    :[{w:`Par définition (3.3.1), ${ve("AA′")} = ${ve("u")}.`,why:"L'image de A est au bout du vecteur de la translation, quand on le pose en A.",pts:1},
      {w:`<b>${fx(`AA′ = ${l}`)}</b> : c'est la norme de ${ve("u")}.`,why:`La distance AA′ est la longueur du vecteur AA′. La distance AB = ${d} ne sert pas ici.`,pts:1}];
  return unNombre({nom:N,v:Q(v),autre:Q(img?l:d),quoi:"la distance "+N,ex:"par exemple 6",etapes:E,sig:"TD"+JSON.stringify([d,l,img]),
    q:`Soit t une translation de vecteur ${ve("u")}, avec <span class="en-nb">${nrm("u")} ${fx("= "+l)}</span>. Soient A et B deux points tels que ${fx("AB = "+d)}. On note A′ = t(A) et B′ = t(B). Calcule la distance ${fx(N)}.`,
    corps:`<p>Rappel : ${nrm("u")} est la norme du vecteur ${ve("u")}, c'est-à-dire sa longueur.</p>`,texte:`translation de vecteur de norme ${l}, AB = ${d} ; calculer ${N}`,nature:img?"distance entre deux images":"distance d'un point à son image",ens:{k:"tdist",d,l,img},
    pieges:[[Q(img?l:d),img?0:1,img?"norme du vecteur donnée au lieu de la distance AB":"distance AB donnée au lieu de la norme du vecteur","Où ça part : la longueur à prendre.",img?"La norme du vecteur est la distance entre un point et son image. Ici on demande la distance entre les deux images : elle est égale à AB.":"AB est la distance entre les deux points de départ. On demande la distance entre A et son image : c'est la norme du vecteur."],
      [Q(d+l),img?0:1,"les deux longueurs ajoutées","Où ça part : l'opération.","Il n'y a rien à additionner : une seule des deux longueurs de l'énoncé répond à la question."]]});}

/* ---------- GE2, palier 5 : une homothétie composée avec une translation (définitions 3.3.1 et 3.3.3, théorèmes 3.3.2 et 3.3.4) ---------- */
const RAP_HT=`Rappel : l'homothétie de centre K et de rapport λ envoie M sur le point M′ tel que ${ve("KM′")} = λ${ve("KM")} (définition 3.3.3). La translation de vecteur ${ve("u")} envoie M sur le point M′ tel que ${ve("MM′")} = ${ve("u")} (définition 3.3.1).`;
const sgn=c=>c?` ${c<0?"−":"+"} ${Math.abs(c)}`:"",devant=(l,v)=>(l===-1?"−":l===1?"":nb(l))+v;
function homTrans(R){const r=R(),th=R()<0.5,nomF=th?"t ∘ h":"h ∘ t",h1=th?"h":"t",h2=th?"t":"h",l=R.choix([2,3,-2,-3,-1]),lam=devant(l,""),
    veut=`« ${nomF} » veut dire : d'abord ${h1}, puis ${h2}.`,corps=`<p>${RAP_HT} ${veut}</p>`,
    inverse=[0,"ordre des deux transformations inversé","Où ça part : l'ordre.",`Dans « ${nomF} », c'est ${h1}, écrite à droite, qui agit la première. Tu as fait le calcul pour « ${th?"h ∘ t":"t ∘ h"} ».`];
  if(r<0.35){const a=R.nz(-4,4),b=R.nz(-4,4),u1=R.nz(-5,5),u2=R.nz(-5,5);let dx,dy;do{dx=R.ent(-3,3);dy=R.ent(-3,3);}while(!dx&&!dy);
    const lx=l*dx||0,ly=l*dy||0,x1=th?a+lx:a+dx,y1=th?b+ly:b+dy,x=th?a+dx:x1-u1,y=th?b+dy:y1-u2,V=th?[x1+u1,y1+u2]:[a+lx,b+ly];
    const E=th?[{w:`${veut} On pose M′ = h(M), puis M″ = t(M′).`,why:"La transformation écrite à droite agit la première : (t ∘ h)(M) = t(h(M)).",pts:1},
      {w:`${ve("KM")} ${fx(`= (${nb(x)} − ${par(a)} ; ${nb(y)} − ${par(b)}) = (${nb(dx)} ; ${nb(dy)})`)}, donc ${ve("KM′")} = ${lam}${ve("KM")} ${fx(`= (${nb(lx)} ; ${nb(ly)})`)}.`,why:"Les coordonnées d'un vecteur : arrivée moins départ. D'après la définition 3.3.3, le vecteur KM′ est λ fois le vecteur KM : on multiplie ses deux coordonnées par λ.",pts:1},
      {w:`${fx(`M′(${plus(a,lx)} ; ${plus(b,ly)}) = M′(${nb(x1)} ; ${nb(y1)})`)}`,why:"Le vecteur KM′ part du centre K : ses coordonnées s'ajoutent à celles de K, pas à celles de M.",pts:1},
      {w:`<b>${fx(`M″(${plus(x1,u1)} ; ${plus(y1,u2)}) = M″(${nb(V[0])} ; ${nb(V[1])})`)}</b>`,why:"La translation ajoute les coordonnées de son vecteur à celles du point M′.",pts:1}]
     :[{w:`${veut} On pose M′ = t(M), puis M″ = h(M′).`,why:"La transformation écrite à droite agit la première : (h ∘ t)(M) = h(t(M)).",pts:1},
      {w:`${fx(`M′(${plus(x,u1)} ; ${plus(y,u2)}) = M′(${nb(x1)} ; ${nb(y1)})`)}`,why:"La translation ajoute les coordonnées de son vecteur à celles du point M.",pts:1},
      {w:`${ve("KM′")} ${fx(`= (${nb(x1)} − ${par(a)} ; ${nb(y1)} − ${par(b)}) = (${nb(dx)} ; ${nb(dy)})`)}, donc ${ve("KM″")} = ${lam}${ve("KM′")} ${fx(`= (${nb(lx)} ; ${nb(ly)})`)}.`,why:"Les coordonnées d'un vecteur : arrivée moins départ. D'après la définition 3.3.3, appliquée au point M′, le vecteur KM″ est λ fois le vecteur KM′.",pts:1},
      {w:`<b>${fx(`M″(${plus(a,lx)} ; ${plus(b,ly)}) = M″(${nb(V[0])} ; ${nb(V[1])})`)}</b>`,why:"Le vecteur KM″ part du centre K : ses coordonnées s'ajoutent à celles de K.",pts:1}];
    const autre=th?[a+l*(dx+u1),b+l*(dy+u2)]:[a+l*(dx-u1)+u1,b+l*(dy-u2)+u2],origine="homothétie calculée comme si son centre était l'origine",vecPoint="coordonnées du vecteur prises pour celles du point";
    const P=th?[[autre].concat(inverse),
        [[l*x+u1,l*y+u2],1,origine,"Où ça part : le centre.","Le rapport multiplie le vecteur KM, qui part du centre K. Multiplier directement les coordonnées de M ne marche que si le centre est l'origine du repère."],
        [[x1,y1],3,"translation oubliée","Où ça part : la dernière étape.","Ce sont les coordonnées de M′ = h(M). Il reste à appliquer t : ajouter les coordonnées de son vecteur."],
        [[lx+u1,ly+u2],2,vecPoint,"Où ça part : du vecteur au point.","Le vecteur KM′ part de K : pour avoir le point M′, on ajoute ses coordonnées à celles de K."],
        [[x+u1,y+u2],1,"homothétie oubliée","Où ça part : la première transformation.","Tu as seulement appliqué la translation. Il faut d'abord l'image de M par h."]]
      :[[autre].concat(inverse),
        [[l*x1,l*y1],2,origine,"Où ça part : le centre.","Le rapport multiplie le vecteur KM′, qui part du centre K. Multiplier directement les coordonnées de M′ ne marche que si le centre est l'origine du repère."],
        [[x1,y1],3,"homothétie oubliée","Où ça part : la dernière étape.","Ce sont les coordonnées de M′ = t(M). Il reste à appliquer h."],
        [[lx,ly],3,vecPoint,"Où ça part : du vecteur au point.","Le vecteur KM″ part de K : pour avoir le point M″, on ajoute ses coordonnées à celles de K."],
        [[a+l*(x-a),b+l*(y-b)],1,"translation oubliée","Où ça part : la première transformation.","Tu as seulement appliqué l'homothétie à M. Il faut d'abord l'image de M par t."]];
    return unCoord({quoi:"de M″",V,etapes:E,pieges:P,sig:"HTI"+JSON.stringify([a,b,l,u1,u2,x,y,th]),q:`Dans un repère du plan, soient h l'homothétie de centre ${pt2("K",a,b)} et de rapport ${fx("λ = "+nb(l))}, et t la translation de vecteur ${vc2("u",u1,u2)}. Quelles sont les coordonnées de l'image M″ = (${nomF})(M) du point ${pt2("M",x,y)} ?`,corps,
      texte:`h de centre K(${nb(a)} ; ${nb(b)}) et de rapport ${nb(l)}, t de vecteur (${nb(u1)} ; ${nb(u2)}) ; image de M(${nb(x)} ; ${nb(y)}) par ${nomF}`,nature:"image d'un point par la composée",ens:{k:"ctimg",K:[a,b],l,u:[u1,u2],M:[x,y],th}});}
  if(r<0.65){const a=R.nz(-4,4),b=R.nz(-4,4),m=1-l,g=Math.abs(m)>2?2:3,al=Math.abs(l)===1?"":Math.abs(l);let e,f;do{e=R.ent(-g,g);f=R.ent(-g,g);}while(!e&&!f);
    const u1=m*e||0,u2=m*f||0,le=l*e||0,lf=l*f||0,V=th?[a+e,b+f]:[a+le,b+lf],W=th?[a+le,b+lf]:[a+e,b+f];
    const eq=(v,k,u)=>{const s=th?-k:u-k,c=(th?k-l*k+u:k+l*(u-k))||0,hc=`${nb(k)} ${l<0?"−":"+"} ${al}${s?`(${v}${sgn(s)})`:v}`;return {h:hc,f:hc+(th?sgn(u):""),dev:`${v} = ${devant(l,v)}${sgn(c)}`,res:`${devant(m,v)} = ${nb(c)}`};},X=eq("x",a,u1),Y=eq("y",b,u2);
    const E=[th?{w:`${veut} Pour un point ${fx("C(x ; y)")}, le point h(C) a pour coordonnées ${fx(`(${X.h} ; ${Y.h})`)}.`,why:`Définition 3.3.3 : le vecteur qui va de K à h(C) est λ fois le vecteur ${ve("KC")}, de coordonnées ${fx(`(x${sgn(-a)} ; y${sgn(-b)})`)}. On part de K et on ajoute ce vecteur.`,pts:1}
        :{w:`${veut} Pour un point ${fx("C(x ; y)")}, le point t(C) a pour coordonnées ${fx(`(x${sgn(u1)} ; y${sgn(u2)})`)}.`,why:"La translation ajoute les coordonnées de son vecteur à celles du point.",pts:1},
      th?{w:`Puis t ajoute ${vc2("u",u1,u2)} : f(C) a pour coordonnées ${fx(`(${X.f} ; ${Y.f})`)}.`,why:"La translation ajoute les coordonnées de son vecteur à celles du point h(C).",pts:1}
        :{w:`Puis h : f(C) a pour coordonnées ${fx(`(${X.f} ; ${Y.f})`)}.`,why:`Définition 3.3.3, appliquée au point t(C) : le vecteur qui va de K à t(C) a pour coordonnées ${fx(`(x${sgn(u1-a)} ; y${sgn(u2-b)})`)} (arrivée moins départ). On le multiplie par λ, et on part de K.`,pts:1},
      {w:`C est le centre de f, donc f(C) = C : ${fx(`x = ${X.f}`)} et ${fx(`y = ${Y.f}`)}.`,why:"Le centre d'une homothétie est sa propre image : la définition 3.3.3, écrite pour le centre lui-même, donne un vecteur nul. Et quand le rapport n'est pas 1, aucun autre point n'est sa propre image.",pts:1},
      {w:`Abscisse : ${fx(X.dev)}, donc ${fx(X.res)} et ${fx("x = "+nb(V[0]))}. Ordonnée : ${fx(Y.dev)}, donc ${fx(Y.res)} et ${fx("y = "+nb(V[1]))}.`,why:"On développe la parenthèse et on regroupe les nombres. Puis on passe tous les x du même côté, et on divise par le nombre qui multiplie x. Même chose pour y.",pts:2},
      {w:`<b>${fx(`C(${nb(V[0])} ; ${nb(V[1])})`)}</b>. Vérification : ${h1}(C) a pour coordonnées ${fx(`(${nb(W[0])} ; ${nb(W[1])})`)}, et ${h2} le ramène en ${fx(`(${nb(V[0])} ; ${nb(V[1])})`)}.`,why:`Pourquoi f est une homothétie de rapport ${nb(l)} : h multiplie tous les vecteurs par ${nb(l)}, et t n'en change aucun. Comme f(C) = C, le vecteur qui va de C à f(M) vaut ${nb(l)} fois ${ve("CM")}, pour tout point M : c'est la définition de l'homothétie de centre C et de rapport ${nb(l)}. Le rapport est resté celui de h, le centre a changé.`,pts:1}];
    const P=[[[a,b],2,"centre de h recopié","Où ça part : le centre.",th?"K est le centre de h, pas celui de f : h laisse K à sa place, mais t le déplace ensuite. K n'est donc pas sa propre image par f.":"K est le centre de h, pas celui de f : t déplace d'abord K, et h envoie ce nouveau point ailleurs que sur K. K n'est donc pas sa propre image par f."],
      [th?[a+u1,b+u2]:[a+l*u1,b+l*u2],2,"image de K donnée à la place du centre","Où ça part : ce qui est demandé.","Ce sont les coordonnées de f(K), l'image de K. Le centre de f est le point C qui vérifie f(C) = C."],
      [th?[a-e,b-f]:[a-le,b-lf],3,"erreur de signe en résolvant l'équation","Où ça part : la résolution.","En passant les x du même côté, le nombre qui multiplie x est 1 − λ, et pas λ − 1. Reprends les deux équations."],
      [W].concat(inverse)];
    return unCoord({quoi:"de C",V,etapes:E,pieges:P,sig:"HTC"+JSON.stringify([a,b,l,e,f,th]),q:`Dans un repère du plan, soient h l'homothétie de centre ${pt2("K",a,b)} et de rapport ${fx("λ = "+nb(l))}, et t la translation de vecteur ${vc2("u",u1,u2)}. L'application f = ${nomF} est encore une homothétie de rapport ${nb(l)}, mais son centre n'est plus K. Le centre d'une homothétie est le point qui est sa propre image : trouve les coordonnées du point C tel que f(C) = C.`,corps,
      texte:`h de centre K(${nb(a)} ; ${nb(b)}) et de rapport ${nb(l)}, t de vecteur (${nb(u1)} ; ${nb(u2)}) ; centre de ${nomF}`,nature:"centre de la composée",ens:{k:"ctcen",K:[a,b],l,u:[u1,u2],th}});}
  if(r<0.85){const u1=R.nz(-5,5),u2=R.nz(-5,5);let m,n;do{m=R.ent(-5,5);n=R.ent(-5,5);}while(!m&&!n);const V=[l*m||0,l*n||0];
    const parH=(d,a)=>`Relation de Chasles, puis définition 3.3.3 : ${ve(d)} = ${ve("K"+d.slice(d.length/2))} − ${ve("K"+d.slice(0,d.length/2))} = λ${ve("K"+a.slice(a.length/2))} − λ${ve("K"+a.slice(0,a.length/2))} = λ${ve(a)}. Une homothétie multiplie tous les vecteurs par son rapport, où que soit son centre.`;
    const fin={w:`<b>${ve("A″B″")} = ${lam}${ve("AB")} ${fx(`= (${nb(l)} × ${par(m)} ; ${nb(l)} × ${par(n)}) = (${nb(V[0])} ; ${nb(V[1])})`)}</b>`,why:"Le vecteur de la translation ne sert pas : il déplace les deux images de la même façon. Dans l'autre ordre, on trouve le même vecteur.",pts:1};
    const E=th?[{w:`On pose A′ = h(A) et B′ = h(B). Alors ${ve("A′B′")} = ${lam}${ve("AB")}.`,why:parH("A′B′","AB"),pts:1},
      {w:`Puis A″ = t(A′) et B″ = t(B′) : ${ve("A″B″")} = ${ve("A′B′")}.`,why:`${ve("A′A″")} = ${ve("B′B″")} = ${ve("u")}, donc A′A″B″B′ est un parallélogramme et ${ve("A′B′")} = ${ve("A″B″")}. Une translation ne change aucun vecteur.`,pts:1},fin]
     :[{w:`On pose A′ = t(A) et B′ = t(B). Alors ${ve("A′B′")} = ${ve("AB")}.`,why:`${ve("AA′")} = ${ve("BB′")} = ${ve("u")}, donc AA′B′B est un parallélogramme et ${ve("AB")} = ${ve("A′B′")}. Une translation ne change aucun vecteur.`,pts:1},
      {w:`Puis A″ = h(A′) et B″ = h(B′) : ${ve("A″B″")} = ${lam}${ve("A′B′")}.`,why:parH("A″B″","A′B′"),pts:1},fin];
    const ajoute=[th?1:0,"vecteur de la translation ajouté","Où ça part : la translation.","La translation déplace les deux points du même vecteur : le vecteur qui va de l'un à l'autre ne change pas. On n'ajoute pas les coordonnées de u."];
    const P=[[[m+u1,n+u2]].concat(ajoute),[[V[0]+u1,V[1]+u2]].concat(ajoute),
      [[m,n],th?0:1,"homothétie oubliée","Où ça part : l'homothétie.","L'homothétie multiplie tous les vecteurs par son rapport λ : le vecteur change."],
      [[u1,u2],2,"vecteur de la translation recopié","Où ça part : ce qui est demandé.","Ce sont les coordonnées de u. On demande le vecteur qui va de A″ à B″."]];
    if(l<0)P.push([[-V[0]||0,-V[1]||0],th?0:1,"signe du rapport oublié","Où ça part : le signe.","Le rapport est négatif : le vecteur image est de sens contraire. On multiplie les coordonnées par λ, signe compris."]);
    return unCoord({quoi:`du vecteur ${ve("A″B″")}`,V,etapes:E,pieges:P,sig:"HTV"+JSON.stringify([l,u1,u2,m,n,th]),q:`Dans un repère du plan, soient h une homothétie de centre K et de rapport ${fx("λ = "+nb(l))}, et t la translation de vecteur ${vc2("u",u1,u2)}. On pose f = ${nomF}. Deux points A et B sont tels que le vecteur ${ve("AB")} a pour coordonnées ${fx(`(${nb(m)} ; ${nb(n)})`)}. On note A″ = f(A) et B″ = f(B). Quelles sont les coordonnées du vecteur ${ve("A″B″")} ?`,corps,
      texte:`h de rapport ${nb(l)}, t de vecteur (${nb(u1)} ; ${nb(u2)}), vecteur AB (${nb(m)} ; ${nb(n)}) ; vecteur entre les images par ${nomF}`,nature:"vecteur entre deux images",ens:{k:"ctvec",l,u:[u1,u2],AB:[m,n],th}});}
  let lq;do{lq=R.choix(LAMS);}while(egal(vabs(lq),1));const al=vabs(lq),d=lq.d*R.ent(1,6),V=mul(al,d);let n;do{n=R.ent(1,9);}while(n===d);
  const pourAbs=`Une distance n'est jamais négative : c'est la valeur absolue du rapport qui compte${lq.n<0?`, ici |${nb(lq)}| = ${nb(al)}`:""}. Le signe de λ dit seulement de quel côté du centre se trouve l'image.`,
    pourNorme=`La norme du vecteur, ${n}, dit de combien chaque point se déplace. Elle ne change pas la distance entre deux points.`,
    fin={w:`<b>${fx(`A″B″ = ${nb(V)}`)}</b>`,why:"Dans l'autre ordre, on trouve la même distance : seule la place des images change.",pts:1};
  const E=th?[{w:`On pose A′ = h(A) et B′ = h(B). D'après le théorème 3.3.4 (i), h multiplie les distances par |λ| : ${fx(`A′B′ = ${nb(al)} × ${d} = ${nb(V)}`)}.`,why:pourAbs,pts:1},
      {w:`Puis A″ = t(A′) et B″ = t(B′). D'après le théorème 3.3.2 (i), t préserve les distances : ${fx("A″B″ = A′B′")}.`,why:pourNorme,pts:1},fin]
    :[{w:`On pose A′ = t(A) et B′ = t(B). D'après le théorème 3.3.2 (i), t préserve les distances : ${fx(`A′B′ = AB = ${d}`)}.`,why:pourNorme,pts:1},
      {w:`Puis A″ = h(A′) et B″ = h(B′). D'après le théorème 3.3.4 (i), h multiplie les distances par |λ| : ${fx(`A″B″ = ${nb(al)} × ${d}`)}.`,why:pourAbs,pts:1},fin];
  const P=[[Q(d),th?0:1,"homothétie oubliée","Où ça part : l'homothétie.","La translation ne change pas les distances, mais l'homothétie les multiplie par |λ|."],
    [add(V,n),th?1:0,"norme du vecteur ajoutée","Où ça part : la translation.","La translation déplace les deux points du même vecteur : la distance entre eux ne change pas. On n'ajoute pas la norme de u."],
    [div(Q(d),al),th?0:1,"division par le rapport","Où ça part : l'opération.","L'homothétie multiplie les distances par |λ|, elle ne les divise pas."]];
  if(lq.n<0)P.unshift([mul(lq,d),th?0:1,"distance négative","Où ça part : le signe.","Une distance n'est jamais négative : on multiplie par |λ|, la valeur absolue du rapport."]);
  return unNombre({nom:"A″B″",v:V,autre:Q(d),quoi:"la distance A″B″",ex:"par exemple 6 ou 9/2",etapes:E,pieges:P,sig:"HTD"+JSON.stringify([brut(lq),d,n,th]),
    q:`Soient h une homothétie de rapport ${fx("λ = "+nb(lq))} et t une translation de vecteur ${ve("u")}, avec <span class="en-nb">${nrm("u")} ${fx("= "+n)}</span>. On pose f = ${nomF}. Soient A et B deux points tels que ${fx("AB = "+d)}. On note A″ = f(A) et B″ = f(B). Calcule la distance ${fx("A″B″")}.`,
    corps:`<p>Rappel : ${nrm("u")} est la norme du vecteur ${ve("u")}, c'est-à-dire sa longueur ; |λ| est la valeur absolue de λ, c'est-à-dire λ sans son signe. ${veut}</p>`,
    texte:`h de rapport ${nb(lq)}, t de vecteur de norme ${n}, AB = ${d} ; distance entre les images par ${nomF}`,nature:"distance entre deux images",ens:{k:"ctdist",l:fl(lq),n,d,th}});}

/* ---------- GE7 : triangles isométriques (les droites du triangle, le cas, les deux bons triangles, puis sur papier) ---------- */
const champC=(id,titre,o)=>({k:"choix",id,titre,o});
const maj=s=>s.charAt(0).toUpperCase()+s.slice(1),nu=s=>String(s).replace(/<[^>]+>/g,"").replace(/\$/g,"");
/* des questions à choix, et parfois une case : B donne la bonne valeur de chaque champ, tort(champ, valeur) dit où ça part */
function jugeQ(B,tort,libre){libre=libre||{};return rep=>{const ids=Object.keys(B);
  if(ids.some(k=>!propre(rep[k])))return {incomplet:ids.length>1?"Réponds à chaque question avant de valider.":"Choisis une réponse avant de valider."};
  for(const k of ids)if(libre[k]){const r=libre[k](rep[k]);if(r.inc)return {incomplet:r.inc};}
  const F=ids.filter(k=>libre[k]?!libre[k](rep[k]).ok:rep[k]!==B[k]);if(!F.length)return {ok:true};
  const d=tort(F[0],rep[F[0]]);return faux({f:F,etape:d[0],type:d[1],titre:d[2],msg:d[3]});};}
const NOMD={med:X=>`la médiane issue de ${X}`,hau:X=>`la hauteur issue de ${X}`,bis:X=>`la bissectrice de l'angle en ${X}`,mtr:(X,UV)=>`la médiatrice de [${UV}]`};
const MOTD={med:"médiane",hau:"hauteur",bis:"bissectrice",mtr:"médiatrice"};
const DEFD={med:(X,UV)=>`La médiane issue de ${X} est la droite qui passe par ${X} et par le milieu de [${UV}] (poly, exercice 2.7).`,
  hau:(X,UV)=>`La hauteur issue de ${X} est l'unique droite perpendiculaire à (${UV}) passant par ${X} (poly, § 2.4).`,
  bis:X=>`La bissectrice de l'angle en ${X} est la demi-droite d'origine ${X} qui partage cet angle en deux angles égaux (poly, § 1.3).`,
  mtr:(X,UV)=>`La médiatrice de [${UV}] est l'unique droite perpendiculaire à (${UV}) qui passe par le milieu de [${UV}] (définition 1.3.3). C'est aussi l'ensemble des points à égale distance de ${UV[0]} et de ${UV[1]} (TD 1.6).`};
const D4=["med","hau","bis","mtr"];

function nomDroite(R,T,X,U,V,UV){const k=R.choix(D4),w=R.ent(0,1),aU=absAn(U+X+"K"),aV=absAn("K"+X+V);
  const D={med:[`passe par ${X} et par le milieu de [${UV}]`,`passe par ${X} et coupe [${UV}] en un point K tel que ${fx(`${U}K = K${V}`)}`],
    hau:[`passe par ${X} et elle est perpendiculaire à (${UV})`,`passe par ${X} et coupe (${UV}) en un point K tel que ${fx(`(${X}K) ⊥ (${UV})`)}`],
    bis:[`part de ${X} et partage l'angle en ${X} en deux angles égaux`,`part de ${X} et coupe [${UV}] en un point K tel que ${aU} ${fx("=")} ${aV}`],
    mtr:[`est perpendiculaire à (${UV}) et passe par le milieu de [${UV}]`,`est formée de tous les points du plan qui sont à la même distance de ${U} et de ${V}`]}[k][w];
  const F={med:["sommet","milieu"],hau:["sommet","perp"],bis:["sommet","angle"],mtr:w?["equi"]:["perp","milieu"]}[k];
  const o=R.mel(D4).map(c=>[c,maj(NOMD[c](X,UV))]),autre=R.choix(D4.filter(c=>c!==k));
  const E=[{w:`Ce que dit l'énoncé : d ${D}.`,why:"Pour nommer une droite d'un triangle, on regarde deux choses : par quel point elle passe, et ce qu'elle fait au côté d'en face ou à l'angle.",pts:1},
    {w:`<b>d est ${NOMD[k](X,UV)}.</b>`,why:DEFD[k](X,UV)+(k==="mtr"?` Elle ne passe par ${X} que si ${fx(`${X}${U} = ${X}${V}`)}.`:""),pts:1}];
  return {sig:"ND"+JSON.stringify([T,X,k,w]),q:`Dans le triangle ${T}, ${k==="bis"?"une demi-droite":"une droite"} d ${D}. Quel est le nom de d ?`,corps:"",texte:`triangle ${T} : d ${nu(D)} ; nommer d`,nature:"nommer une droite",
    champs:[champC("x",null,o)],juge:jugeQ({x:k},(id,val)=>[1,`${MOTD[k]} prise pour une ${MOTD[val]||"autre droite"}`,"Où ça part : le nom de la droite.",`${DEFD[val]?DEFD[val](X,UV)+" ":""}L'énoncé dit autre chose : d ${D}.`]),
    etapes:E,bonne:maj(NOMD[k](X,UV)),bonneTxt:NOMD[k](X,UV),repBonne:{x:k},repFausse:{x:autre},ens:{sorte:"nom",bon:k,faits:F}};}

function saitDroite(R,T,X,U,V,UV){const k=R.choix(D4),aU=absAn(U+X+"K"),aV=absAn("K"+X+V);
  const intro={med:`la médiane issue de ${X} coupe [${UV}] en K`,hau:`la hauteur issue de ${X} coupe (${UV}) en K`,bis:`la bissectrice de l'angle en ${X} coupe [${UV}] en K`,mtr:`K est un point de la médiatrice de [${UV}] qui n'est pas sur la droite (${UV})`}[k];
  const A={mil:`K est le milieu de [${UV}]`,perp:`(${X}K) est perpendiculaire à (${UV})`,ang:`${aU} ${fx("=")} ${aV}`,iso:fx(`${X}${U} = ${X}${V}`),equi:fx(`K${U} = K${V}`)};
  const bon={med:"mil",hau:"perp",bis:"ang",mtr:"equi"}[k],ids=k==="mtr"?["equi","mil","perp","iso"]:["mil","perp","ang","iso"];
  const PROP={mil:`Arriver au milieu de [${UV}], c'est ce que fait la médiane issue de ${X}.`,perp:`Être perpendiculaire à (${UV}), c'est ce qui définit la hauteur issue de ${X}.`,ang:`Partager l'angle en ${X} en deux angles égaux, c'est ce que fait la bissectrice.`,
    iso:`${X}${U} = ${X}${V} voudrait dire que le triangle est isocèle en ${X} : l'énoncé ne le dit pas.`,equi:`Être à la même distance de ${U} et de ${V}, c'est la propriété des points de la médiatrice de [${UV}].`};
  const E=[{w:DEFD[k](X,UV),why:"On revient à la définition : c'est elle, et elle seule, qui dit ce qui est sûr.",pts:1},
    {w:`<b>Ce qui est sûr : ${A[bon]}.</b>`,why:k==="mtr"?`K n'est pas sur (${UV}) : ce n'est donc pas le milieu de [${UV}]. Et rien ne relie K au sommet ${X} : l'énoncé ne dit ni que (${X}K) est perpendiculaire à (${UV}), ni que le triangle est isocèle en ${X}.`:`Les autres affirmations ne sont vraies que dans des cas particuliers. Par exemple, quand le triangle est isocèle en ${X}, la médiane, la hauteur et la bissectrice issues de ${X} sont confondues (TD 1.7).`,pts:1}];
  return {sig:"SD"+JSON.stringify([T,X,k]),q:`Dans le triangle ${T}, ${intro}. Sans autre hypothèse, laquelle de ces affirmations est sûre ?`,corps:"",texte:`triangle ${T} : ${intro} ; dire ce qui est sûr`,nature:"ce que donne une droite",
    champs:[champC("x",null,R.mel(ids).map(c=>[c,A[c]]))],juge:jugeQ({x:bon},(id,val)=>[0,`propriété de la ${MOTD[k]} confondue avec une autre`,"Où ça part : la définition.",`${PROP[val]||""} Ce n'est pas ce que dit la définition de ${NOMD[k](X,UV)}.`]),
    etapes:E,bonne:A[bon],bonneTxt:nu(A[bon]),repBonne:{x:bon},repFausse:{x:ids.find(c=>c!==bon)},ens:{sorte:"sait",ligne:k,opts:ids,bon}};}

function isoDroite(R,T,X,U,V,UV,XU,XV){
  const C=[["X","med","perp",`la médiane issue de ${X} est perpendiculaire à (${UV})`],["X","med","ang",`la médiane issue de ${X} partage l'angle en ${X} en deux angles égaux`],["X","hau","mil",`la hauteur issue de ${X} passe par le milieu de [${UV}]`],["X","mtr","passe",`la médiatrice de [${UV}] passe par ${X}`],
    ["U","med","perp",`la médiane issue de ${U} est perpendiculaire à (${XV})`,U],["U","bis","mil",`la bissectrice de l'angle en ${U} passe par le milieu de [${XV}]`,U],["U","hau","mil",`la hauteur issue de ${U} passe par le milieu de [${XV}]`,U],["U","mtr","passe",`la médiatrice de [${XU}] passe par ${V}`,V]];
  const n=R.ent(0,7),c=C[n],vrai=c[0]==="X",bon=vrai?"oui":"non",Z=c[4];
  const E=vrai?[{w:`Dans un triangle isocèle en ${X}, la médiane, la hauteur et la bissectrice issues de ${X} et la médiatrice de [${UV}] sont une seule et même droite (TD 1.7).`,why:`${X} est le sommet où se rejoignent les deux côtés égaux. Avec I le milieu de [${UV}], les triangles ${X}${U}I et ${X}${V}I sont isométriques (CCC) : cela donne deux angles égaux en ${X} et un angle droit en I.`,pts:1},
      {w:`<b>Oui : ${c[3]}.</b>`,why:"La droite dont parle la question est une de ces quatre droites confondues : elle a donc les propriétés des trois autres.",pts:1}]
    :[{w:`Le triangle est isocèle en ${X} : les droites confondues sont celles qui partent de ${X}, avec la médiatrice du côté d'en face [${UV}] (TD 1.7). Rien de tel pour les autres sommets.`,why:`Les deux côtés égaux sont [${XU}] et [${XV}], qui se rejoignent en ${X}. Rien ne dit que les deux côtés qui se rejoignent en ${Z} sont égaux.`,pts:1},
      {w:`<b>Non, pas en général.</b> Ce serait vrai seulement si le triangle était aussi isocèle en ${Z}.`,why:`Exemple : avec ${XU} = ${XV} = 5 et ${UV} = 2, le triangle est isocèle en ${X} seulement, et la propriété est fausse.`,pts:1}];
  return {sig:"ID"+JSON.stringify([T,X,n]),q:`Le triangle ${T} est isocèle en ${X}, c'est-à-dire ${fx(`${XU} = ${XV}`)}. Est-il sûr que ${c[3]} ?`,corps:"",texte:`triangle ${T} isocèle en ${X} : est-il sûr que ${c[3]} ?`,nature:"triangle isocèle",
    champs:[champC("x",null,[["oui","Oui, toujours"],["non","Non, pas en général"]])],
    juge:jugeQ({x:bon},()=>vrai?[0,"triangle isocèle : droites confondues au sommet principal oubliées","Où ça part : le résultat du TD 1.7.",`Dans un triangle isocèle en ${X}, la médiane, la hauteur et la bissectrice issues de ${X} sont confondues avec la médiatrice de [${UV}].`]
      :[0,"triangle isocèle : propriété du sommet principal donnée à un autre sommet","Où ça part : le sommet.",`Le triangle est isocèle en ${X}, pas en ${Z}. Ce qui est vrai pour les droites issues de ${X} ne l'est pas pour les autres sommets.`]),
    etapes:E,bonne:vrai?"Oui, toujours":"Non, pas en général",bonneTxt:vrai?"oui, toujours":"non, pas en général",repBonne:{x:bon},repFausse:{x:vrai?"non":"oui"},ens:{sorte:"iso",de:c[0],ligne:c[1],prop:c[2],bon}};}

function droitesTri(R){const L=R.choix(TRI).split(""),s=R.ent(0,2),u=(s+1)%3,v=(s+2)%3,r=R(),a=[R,L.join(""),L[s],L[u],L[v],cote(L,u,v)];
  return r<0.42?nomDroite(...a):r<0.66?saitDroite(...a):isoDroite(...a,cote(L,s,u),cote(L,s,v));}

const PAIRES=[["ABC","DEF"],["ABC","MNP"],["DEF","RST"],["MNP","RST"],["EFG","ABC"],["RST","ABC"],["MNP","DEF"]];
const CASN={ccc:"CCC",cac:"CAC",aca:"ACA"},CAS3=[["ccc","CCC"],["cac","CAC"],["aca","ACA"]];
const combien=(n,s)=>n===0?`aucun ${s}`:n===1?`un ${s}`:(n===2?"deux ":"trois ")+s+"s";
const lettres=s=>propre(s).toUpperCase().replace(/[^A-Z]/g,""),tri2=s=>s.split("").sort().join("");
function casIso(R){const [t1,t2]=R.choix(PAIRES),A=t1.split(""),B=R.mel(t2.split("")),ded=R()<0.45;
  const k=R.choix(ded?["ccc","cac","cac","aca","aca","aac"]:["ccc","cac","cac","aca","aac","cca","cca","cca","aaa"]),i=R.ent(0,2),j=(i+1)%3,l=(i+2)%3;
  const dons={ccc:[["c",0,1],["c",1,2],["c",0,2]],cac:[["c",i,j],["c",i,l],["a",i]],aca:[["c",i,j],["a",i],["a",j]],aac:[["c",i,j],["a",i],["a",l]],cca:[["c",i,j],["c",i,l],["a",j]],aaa:[["a",0],["a",1],["a",2]]}[k];
  const an3=(Z,p)=>{const o=[0,1,2].filter(x=>x!==p),r=R()<0.5;return Z[o[r?0:1]]+Z[p]+Z[o[r?1:0]];},sg=(Z,p,q2)=>R()<0.5?Z[p]+Z[q2]:Z[q2]+Z[p];
  const items=R.mel(dons).map(d=>d[0]==="c"?fx(`${sg(A,d[1],d[2])} = ${sg(B,d[1],d[2])}`):`${absAn(an3(A,d[1]))} ${fx("=")} ${absAn(an3(B,d[1]))}`);
  const bon={ccc:"ccc",cac:"cac",aca:"aca",aac:"aca",cca:"non",aaa:"non"}[k],nC=dons.filter(d=>d[0]==="c").length,compte=`${combien(nC,"côté")} et ${combien(3-nC,"angle")}`;
  const cA=(p,q2)=>`[${A[p]}${A[q2]}]`,cB=(p,q2)=>`[${B[p]}${B[q2]}]`,corr=`${A[0]} correspond à ${B[0]}, ${A[1]} à ${B[1]} et ${A[2]} à ${B[2]}`;
  const place={ccc:[`Les trois côtés de ${t1} sont égaux aux trois côtés de ${t2}. C'est le cas CCC.`,"Avec trois côtés égaux deux à deux, aucun angle n'est nécessaire."],
    cac:[`Dans ${t1}, les deux côtés donnés, ${cA(i,j)} et ${cA(i,l)}, se rejoignent en ${A[i]}, et l'angle donné est justement l'angle en ${A[i]} : il est entre les deux côtés. Même chose dans ${t2} au sommet ${B[i]}. C'est le cas CAC.`,"C'est la condition du cas CAC : l'angle doit être celui que forment les deux côtés égaux."],
    aca:[`Le côté donné, ${cA(i,j)}, joint ${A[i]} et ${A[j]}, et les deux angles donnés sont les angles en ${A[i]} et en ${A[j]} : ils sont aux deux bouts du côté. Même chose dans ${t2}. C'est le cas ACA.`,"C'est exactement le cas ACA de l'axiome V : un côté, et les deux angles à ses extrémités."],
    aac:[`Le côté donné est ${cA(i,j)} ; les angles donnés sont ceux en ${A[i]} et en ${A[l]}. L'angle en ${A[l]} n'est pas à un bout de ce côté. Mais la somme des angles d'un triangle vaut π : les angles en ${A[j]} et en ${B[j]} sont donc égaux aussi, et on retrouve le cas ACA.`,"C'est le corollaire 2.4.3 du poly : un côté et deux angles égaux suffisent, même quand les angles ne sont pas aux deux bouts du côté."],
    cca:[`Dans ${t1}, les deux côtés donnés, ${cA(i,j)} et ${cA(i,l)}, se rejoignent en ${A[i]}. Or l'angle donné est l'angle en ${A[j]} : il n'est pas entre les deux côtés.`,"Pour CAC, il faut l'angle que forment les deux côtés égaux. Avec un autre angle, deux triangles différents sont possibles : c'est le contre-exemple du TD 1.7, question (1)(e)."],
    aaa:["Aucun côté n'est donné : seulement les trois angles.","Deux triangles qui ont les mêmes angles ont la même forme, pas forcément la même taille : ils sont semblables (poly, § 2.6). Un agrandissement d'un triangle garde ses trois angles."]}[k];
  const E=[{w:`On compte ce qui est donné : ${compte}.`,why:"L'axiome V a trois cas : CCC (trois côtés), CAC (deux côtés et un angle), ACA (un côté et deux angles). Le compte dit lequel essayer.",pts:0.5},{w:place[0],why:place[1],pts:1}];
  const tortX=val=>bon==="non"?(k==="cca"?[1,"cas d'isométrie cité alors que l'angle n'est pas entre les deux côtés","Où ça part : la place de l'angle.",`L'angle donné est en ${A[j]}, alors que les deux côtés donnés se rejoignent en ${A[i]}. Pour CAC, il faut l'angle entre les deux côtés.`]
      :[1,"trois angles pris pour un cas d'isométrie","Où ça part : il manque un côté.","Trois angles égaux donnent deux triangles de même forme, pas forcément de même taille. Aucun des trois cas ne se passe d'un côté."])
    :val==="non"?(k==="aac"?[1,"corollaire 2.4.3 oublié : un côté et deux angles suffisent","Où ça part : le troisième angle.",`La somme des angles vaut π dans chaque triangle : les angles en ${A[j]} et en ${B[j]} sont donc égaux aussi, et on retrouve le cas ACA (corollaire 2.4.3).`]
      :[1,"cas d'isométrie non reconnu","Où ça part : la vérification du cas.",`Les égalités données sont exactement celles du cas ${CASN[bon]}.`])
    :[0,`${CASN[val]||"un autre cas"} cité au lieu de ${CASN[bon]}`,"Où ça part : le compte des côtés et des angles.",`L'énoncé donne ${compte} : c'est le cas ${CASN[bon]}${CASN[val]?", pas "+CASN[val]:""}.`];
  const debut=`${t1} et ${t2} sont deux triangles non dégénérés tels que ${et(items)}.`,rappel="<p>Rappel : un angle écrit entre barres est un angle non orienté, et la lettre du milieu est son sommet.</p>";
  const ens={A:t1,B:t2,dons:dons.map(d=>d[0]==="c"?{t:"c",a:A[d[1]]+A[d[2]],b:B[d[1]]+B[d[2]]}:{t:"a",a:A[d[1]],b:B[d[1]]}),bon};
  if(!ded){E.push(bon==="non"?{w:"<b>On ne peut pas conclure : ces égalités ne suffisent pas.</b>",why:k==="cca"?"Il faudrait l'angle entre les deux côtés, ou bien le troisième côté.":"Il faudrait au moins un côté égal, pour fixer la taille des triangles.",pts:0.5}
      :{w:`<b>Les triangles ${t1} et ${t2} sont isométriques, par ${CASN[bon]}.</b>`,why:`Dans cette isométrie, ${corr} : les côtés et les angles qui se correspondent sont égaux.`,pts:0.5});
    const o=CAS3.map(c=>[c[0],"Oui, par "+c[1]]).concat([["non","On ne peut pas conclure"]]);
    return {sig:"CI"+JSON.stringify([t1,B.join(""),k,i]),q:`${debut} Sont-ils forcément isométriques ?`,corps:rappel,texte:`${t1} et ${t2} : ${nu(et(items))} ; isométriques ?`,nature:"reconnaître le cas",
      champs:[champC("x",null,o)],juge:jugeQ({x:bon},(id,val)=>tortX(val)),etapes:E,bonne:o.find(c=>c[0]===bon)[1],bonneTxt:o.find(c=>c[0]===bon)[1],repBonne:{x:bon},repFausse:{x:bon==="non"?"cac":"non"},ens:Object.assign(ens,{sorte:"cas"})};}
  /* ce qu'on en déduit : un côté ou un angle qui n'était pas donné */
  const libresC=[[0,1],[1,2],[0,2]].filter(c=>!dons.some(d=>d[0]==="c"&&tri2(""+d[1]+d[2])===tri2(""+c[0]+c[1]))),libresA=[0,1,2].filter(p=>!dons.some(d=>d[0]==="a"&&d[1]===p));
  const cote3=libresC.length&&(R()<0.6||!libresA.length),c=cote3?R.choix(libresC):null,p=cote3?null:R.choix(libresA),autres=p===null?null:[0,1,2].filter(x=>x!==p);
  const lis=cote3?t=>{const z=lettres(t);return z.length!==2?{inc:`Écris le côté avec ses deux lettres, par exemple ${t2.slice(0,2)}.`}:{ok:tri2(z)===tri2(B[c[0]]+B[c[1]])};}
    :t=>{const z=lettres(t);return z.length===1?{ok:z===B[p]}:z.length!==3?{inc:`Écris l'angle avec ses trois lettres, le sommet au milieu, par exemple ${t2}.`}:{ok:z[1]===B[p]&&tri2(z[0]+z[2])===tri2(B[autres[0]]+B[autres[1]])};};
  const nomA=cote3?cA(c[0],c[1]):absAn(A[autres[0]]+A[p]+A[autres[1]]),rep=cote3?B[c[0]]+B[c[1]]:B[autres[0]]+B[p]+B[autres[1]],mauvais=cote3?B[c[0]]+B[[0,1,2].find(x=>!c.includes(x))]:B[p]+B[autres[0]]+B[autres[1]];
  E.push({w:`Les sommets se correspondent : ${corr}.`,why:"Chaque égalité donnée associe un côté ou un angle du premier triangle à un côté ou un angle du second. Un angle donne tout de suite deux sommets qui se correspondent ; un côté en donne deux à la fois, que les autres égalités départagent.",pts:1},
    {w:cote3?`<b>Le côté ${nomA} correspond au côté ${cB(c[0],c[1])} : ${fx(`${A[c[0]]}${A[c[1]]} = ${rep}`)}.</b>`:`<b>L'angle ${nomA} correspond à l'angle ${absAn(rep)} : ils sont égaux.</b>`,why:"Deux triangles isométriques ont tous leurs côtés et tous leurs angles égaux deux à deux, à condition de respecter la correspondance des sommets.",pts:1});
  return {sig:"CD"+JSON.stringify([t1,B.join(""),k,i,cote3?c:p]),q:`${debut} Ils sont donc isométriques.`,corps:rappel,texte:`${t1} et ${t2} : ${nu(et(items))} ; le cas, puis ${cote3?"le côté égal à "+nu(nomA):"l'angle égal à l'angle "+nu(nomA)}`,nature:"déduire une égalité",
    champs:[champC("x","Par quel cas ?",CAS3),{k:"champ",id:"y",nom:cote3?"côté":"angle",label:cote3?`Dans ${t2}, le côté de même longueur que ${nomA} :`:`Dans ${t2}, l'angle égal à ${nomA} :`,sym:[],ex:cote3?`deux lettres, par exemple ${t2.slice(0,2)}`:`trois lettres, le sommet au milieu, par exemple ${t2}`}],
    juge:jugeQ({x:bon,y:rep},(id,val)=>id==="x"?tortX(val):[2,"correspondance des sommets fausse","Où ça part : quel sommet correspond à quel sommet.",`Dans cette isométrie, ${corr}. ${cote3?`Le côté ${nomA} correspond donc à ${cB(c[0],c[1])}.`:`L'angle en ${A[p]} correspond donc à l'angle en ${B[p]}.`}`],{y:lis}),
    etapes:E,bonne:`${CASN[bon]} ; ${cote3?fx(rep):absAn(rep)}`,bonneTxt:`${CASN[bon]} ; ${rep}`,repBonne:{x:bon,y:rep},repFausse:{x:bon,y:mauvais},ens:Object.assign(ens,{sorte:"ded",cible:cote3?{t:"c",a:A[c[0]]+A[c[1]]}:{t:"a",a:A[p]}})};}

function bonsTriangles(R){const L=R.choix(TRI).split(""),s=R.ent(0,2),X=L[s],U=L[(s+1)%3],V=L[(s+2)%3],T=L.join(""),f=R.choix(["med","hau","bis","mtr","som","cv"]),h=R.choix([1.7,2,2.3]);
  const P={[X]:[0,h],[U]:[-1,0],[V]:[1,0]},mi=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],XU=X+U,XV=X+V,UV=U+V,iso=`${T} est un triangle isocèle en ${X}, c'est-à-dire ${fx(`${XU} = ${XV}`)}.`,tr=[[X,U],[U,V],[X,V]];
  let hyp,but,cible,ok,f1,f2,cas,eg,o,dit3;
  if(f==="med"){P.I=mi(P[X],P[U]);P.J=mi(P[X],P[V]);hyp=`${iso} I est le milieu de [${XU}] et J est le milieu de [${XV}].`;but=fx(`${U}J = ${V}I`);cible=[["c",V+"I"],["c",U+"J"]];ok=[X+"I"+V,X+"J"+U];f1=[X+"IJ",X+U+V];f2=[X+"I"+V,X+U+V];cas="cac";
    eg=[["a",X,X],["c",XV,XU],["c",X+"I",X+"J"]];dit3=[`l'angle en ${X} est commun aux deux triangles`,`${fx(`${XV} = ${XU}`)}, car le triangle est isocèle en ${X}`,`${fx(`${X}I = ${X}J`)}, car ce sont les moitiés de deux côtés égaux`];o={seg:tr,tirets:[[U,"J"],[V,"I"]],points:["I","J"]};}
  else if(f==="hau"){P.H=pied(P[U],P[X],P[V]);P.K=pied(P[V],P[X],P[U]);hyp=`${iso} H est le pied de la hauteur issue de ${U} (H est sur (${XV})), et K est le pied de la hauteur issue de ${V} (K est sur (${XU})).`;but=fx(`${U}H = ${V}K`);cible=[["c",U+"H"],["c",V+"K"]];ok=[X+U+"H",X+V+"K"];f1=[X+"HK",X+U+V];f2=[X+U+"H",X+U+V];cas="aca";
    eg=[["a",X,X],["a","H","K"],["c",XU,XV]];dit3=[`l'angle en ${X} est commun aux deux triangles`,"les angles en H et en K sont droits, donc égaux",`${fx(`${XU} = ${XV}`)}, car le triangle est isocèle en ${X}`];o={seg:tr,tirets:[[U,"H"],[V,"K"]],droits:[[U,"H",X],[V,"K",X]],points:["H","K"]};}
  else if(f==="bis"){const a=lgr(P[X],P[U]),b=lgr(P[U],P[V]);P.I=bary(P[X],P[V],a/(a+b));P.J=bary(P[X],P[U],a/(a+b));hyp=`${iso} La bissectrice de l'angle en ${U} coupe [${XV}] en I, et la bissectrice de l'angle en ${V} coupe [${XU}] en J.`;but=fx(`${U}I = ${V}J`);cible=[["c",U+"I"],["c",V+"J"]];ok=[U+"I"+V,V+"J"+U];f1=[X+"IJ",X+U+V];f2=[U+"I"+V,X+U+V];cas="aca";
    eg=[["c",UV,UV],["a",V,U],["a",U,V]];dit3=[`[${UV}] est commun aux deux triangles`,`les angles en ${V} et en ${U} du triangle ${T} sont égaux, car il est isocèle en ${X} (TD 1.7)`,`l'angle en ${U} de ${ok[0]} et l'angle en ${V} de ${ok[1]} sont les moitiés de ces deux angles égaux`];o={seg:tr,tirets:[[U,"I"],[V,"J"]],points:["I","J"]};}
  else if(f==="mtr"){P.K=[0,0];hyp=`K est le milieu du segment [${UV}], et ${X} est un point de la médiatrice de [${UV}], différent de K.`;but=fx(`${XU} = ${XV}`);cible=[["c",XU],["c",XV]];ok=[X+"K"+U,X+"K"+V];f1=[X+U+V,X+"K"+U];f2=[X+U+V,X+"K"+V];cas="cac";
    eg=[["c",X+"K",X+"K"],["c","K"+U,"K"+V],["a","K","K"]];dit3=[`[${X}K] est commun aux deux triangles`,`${fx(`K${U} = K${V}`)}, car K est le milieu de [${UV}]`,`les angles en K sont droits, car la médiatrice est perpendiculaire à (${UV})`];o={seg:tr,tirets:[[X,"K"]],droits:[[X,"K",V]],marques:[[U,"K",1],["K",V,1]],points:["K"]};}
  else if(f==="som"){P.K=[0,0];hyp=`${iso} La bissectrice de l'angle en ${X} coupe [${UV}] en K.`;but=fx(`K${U} = K${V}`);cible=[["c","K"+U],["c","K"+V]];ok=[X+"K"+U,X+"K"+V];f1=[X+U+V,X+"K"+U];f2=[X+U+V,X+"K"+V];cas="cac";
    eg=[["c",X+"K",X+"K"],["c",XU,XV],["a",X,X]];dit3=[`[${X}K] est commun aux deux triangles`,`${fx(`${XU} = ${XV}`)}, car le triangle est isocèle en ${X}`,`les angles en ${X} des deux triangles sont égaux, car [${X}K) est la bissectrice`];o={seg:tr,tirets:[[X,"K"]],marques:[[X,U,1],[X,V,1]],points:["K"]};}
  else{P.K=[0,-0.9];hyp=`${X}, ${U}, ${V} et K sont quatre points du plan tels que ${fx(`${XU} = ${XV}`)} et ${fx(`K${U} = K${V}`)}. Les points ${U} et ${V} ne sont pas sur la droite (${X}K).`;but=`${absAn(U+X+"K")} ${fx("=")} ${absAn(V+X+"K")}`;cible=[["a",U+X+"K"],["a",V+X+"K"]];ok=[X+U+"K",X+V+"K"];f1=[X+U+V,"K"+U+V];f2=[X+U+"K",X+U+V];cas="ccc";
    eg=[["c",XU,XV],["c","K"+U,"K"+V],["c",X+"K",X+"K"]];dit3=[`${fx(`${XU} = ${XV}`)}, par hypothèse`,`${fx(`K${U} = K${V}`)}, par hypothèse`,`[${X}K] est commun aux deux triangles`];o={seg:[[X,U],[X,V],["K",U],["K",V]],tirets:[[X,"K"]],marques:[[X,U,1],[X,V,1],["K",U,2],["K",V,2]],points:["K"]};}
  const nomC=c=>c[0]==="c"?`[${c[1]}]`:`l'angle ${absAn(c[1])}`,paire=t=>`${t[0]} et ${t[1]}`,O={ok,f1,f2};
  const dans=(t,c)=>c[1].split("").every(z=>t.includes(z)),manque=t=>!((dans(t[0],cible[0])&&dans(t[1],cible[1]))||(dans(t[0],cible[1])&&dans(t[1],cible[0])));
  o.alt=`La figure de l'énoncé : les points ${Object.keys(P).join(", ")}`;o.points=(o.points||[]).concat([X,U,V]);
  const E=[{w:`Il faut montrer ${but}. On cherche deux triangles : l'un doit contenir ${nomC(cible[0])}, l'autre ${nomC(cible[1])}.`,why:"Deux triangles isométriques ont leurs côtés et leurs angles égaux deux à deux. Encore faut-il que ce qu'on veut comparer soit dans ces deux triangles.",pts:1},
    {w:`On choisit les triangles ${paire(ok)}.`,why:`${maj(nomC(cible[0]))} est dans ${ok[0]}, et ${nomC(cible[1])} est dans ${ok[1]}. Ces deux triangles jouent le même rôle, un de chaque côté de la figure. Les deux autres propositions comparent des triangles qui ne sont pas isométriques.`,pts:1},
    {w:`Trois égalités : ${dit3[0]} ; ${dit3[1]} ; ${dit3[2]}.`,why:"Chaque égalité vient d'une hypothèse de l'énoncé ou d'un élément commun aux deux triangles. Aucune ne doit être l'égalité qu'on cherche à montrer.",pts:1.5},
    {w:`<b>Les triangles ${paire(ok)} sont isométriques (${CASN[cas]}), donc ${but}.</b>`,why:cas==="ccc"?"Trois côtés égaux deux à deux : c'est le cas CCC.":cas==="cac"?"Deux côtés égaux deux à deux, et l'angle entre eux : c'est le cas CAC.":f==="hau"?"Un côté et deux angles égaux deux à deux : c'est le cas ACA, avec le corollaire 2.4.3, car l'angle droit n'est pas à un bout du côté.":"Un côté, et les deux angles à ses extrémités : c'est le cas ACA.",pts:0.5}];
  const tort=(id,val)=>id==="t"?[1,"triangles choisis qui ne contiennent pas ce qu'on compare","Où ça part : le choix des triangles.",!O[val]||manque(O[val])?`Dans les triangles ${O[val]?paire(O[val]):"choisis"}, on ne trouve pas à la fois ${nomC(cible[0])} et ${nomC(cible[1])} : ils ne peuvent rien dire de l'égalité demandée.`:`Les triangles ${paire(O[val])} ne sont pas isométriques : l'un est une partie de l'autre. Il faut deux triangles qui jouent le même rôle, un de chaque côté de la figure.`]
    :[3,`${CASN[val]||"un autre cas"} cité au lieu de ${CASN[cas]}`,"Où ça part : le nom du cas.",`Les trois égalités sont : ${dit3[0]} ; ${dit3[1]} ; ${dit3[2]}. C'est le cas ${CASN[cas]}.`];
  return {sig:"BT"+JSON.stringify([T,X,f]),q:`${hyp} On veut montrer que ${but}.`,corps:figure(P,o),texte:`${nu(hyp)} Montrer ${nu(but)} : quels triangles, quel cas`,nature:{med:"deux médianes",hau:"deux hauteurs",bis:"deux bissectrices",mtr:"un point de la médiatrice",som:"la bissectrice au sommet",cv:"deux triangles isocèles"}[f],
    champs:[champC("t","Quels triangles faut-il comparer ?",R.mel(["ok","f1","f2"]).map(c=>[c,paire(O[c])])),champC("c","Par quel cas sont-ils isométriques ?",CAS3)],juge:jugeQ({t:"ok",c:cas},tort),
    etapes:E,bonne:`${paire(ok)}, par ${CASN[cas]}`,bonneTxt:`${paire(ok)}, par ${CASN[cas]}`,repBonne:{t:"ok",c:cas},repFausse:{t:"f1",c:cas},ens:{sorte:"tri",P,cible,opts:O,cas,eg}};}

const OFF="<p><i>Corrigé officiel, découpé en lignes par moi ; les « pourquoi » sont de moi.</i></p>",MOI="<p><i>Corrigé et barème écrits par moi.</i></p>",SITE="<p><i>Corrigé du site, déjà dans les exercices de TD ; barème de moi.</i></p>";
const BANQUE_TRI=[
 ["P1","CC1 du 10 novembre 2026, exercice 1 (4 points). Soit ABC un triangle non dégénéré isocèle en A, c'est-à-dire tel que $AB = AC$. Montrer que les médianes issues de B et C sont de même longueur.",OFF,
  [["Notons I le milieu de [AB] et J celui de [AC]. Il faut montrer $IC = BJ$.","La médiane issue de C joint C au milieu I de [AB], celle issue de B joint B au milieu J de [AC]. Sans nom pour les milieux, l'égalité à montrer ne peut pas s'écrire.",1],
   ["On compare les triangles AIC et AJB.","[IC] est un côté de AIC et [BJ] est un côté de AJB : ce sont les deux longueurs à comparer.",0.5],
   ["Ils partagent l'angle en A.","I est sur [AB] et J est sur [AC] : dans les deux triangles, l'angle en A est celui du triangle ABC.",0.5],
   ["$AC = AB$.","C'est l'hypothèse de l'énoncé : le triangle ABC est isocèle en A.",0.5],
   ["$AI = AB/2 = AC/2 = AJ$.","I est le milieu de [AB], J celui de [AC], et $AB = AC$ par hypothèse.",1],
   ["Les triangles AIC et AJB sont donc isométriques (CAC). On en déduit $IC = BJ$.","Deux côtés égaux et l'angle entre eux. Dans cette isométrie, I correspond à J et C à B : le côté [IC] correspond au côté [JB].",0.5]]],
 ["P2","CC1 du 10 novembre 2026, exercice 2 (5 points). Soit ABC un triangle équilatéral. Soit M un point de [BC]. Déterminer l'angle entre les bissectrices des angles {[AB), [AM)} et {[AM), [AC)}.",OFF,
  [[`Soit D un point sur la bissectrice de {[AB), [AM)} et E un point sur la bissectrice de {[AM), [AC)}. On cherche ${absAn("DAE")}.`,"Nommer un point sur chaque bissectrice permet d'écrire l'angle cherché avec trois lettres.",0.5],
   [`Par définition des bissectrices : ${absAn("BAD")} = ${absAn("DAM")} = ½ ${absAn("BAM")} et ${absAn("MAE")} = ${absAn("EAC")} = ½ ${absAn("MAC")}.`,"Une bissectrice partage son angle en deux angles égaux : chacun vaut la moitié de l'angle de départ.",1],
   [`Le triangle est équilatéral : ses trois angles sont égaux, et leur somme vaut π. Donc ${absAn("BAC")} = π/3.`,"C'est ici que sert le mot « équilatéral ». Le corrigé officiel accepte aussi qu'on l'admette (exercice 1.13 du TD).",1],
   [`${absAn("DAE")} = ${absAn("DAM")} + ${absAn("MAE")}`,"M est dans le secteur délimité par [AD) et [AE). Le corrigé officiel dit que cet argument de position n'était pas exigé.",1],
   [`= ½ ${absAn("BAM")} + ½ ${absAn("MAC")} = ½ (${absAn("BAM")} + ${absAn("MAC")}) = ½ ${absAn("BAC")}`,"On remplace par les demi-angles, on met ½ en facteur, et M est entre B et C : les deux angles s'ajoutent pour donner l'angle en A.",1],
   ["= ½ × π/3 = π/6.","« Déterminer » demande une valeur : s'arrêter à la moitié de l'angle en A ne répond pas à la question.",0.5]]],
 ["P3","CC1 2025, exercice 1 (3 points). Soient O, A, B et C quatre points distincts du plan, tels que O ∈ [AB] et C ∉ (AB). Montrer que les bissectrices des angles {[OA), [OC)} et {[OB), [OC)} sont perpendiculaires.","<p><i>Corrigé du prof, réécrit ; découpage et barème par ligne de moi.</i></p>",
  [[`Soit [OE) la bissectrice de {[OA), [OC)} et [OF) celle de {[OB), [OC)}. Par définition, ${absAn("AOE")} = ${absAn("EOC")} = ½ ${absAn("AOC")} et ${absAn("COF")} = ${absAn("FOB")} = ½ ${absAn("COB")}.`,"On nomme les deux bissectrices, puis on écrit ce que leur définition donne : deux demi-angles de chaque côté.",1],
   [`O ∈ ]AB[, car les points sont distincts : les demi-droites [OA) et [OB) sont opposées, donc ${absAn("AOB")} = π. Et ${absAn("AOC")} + ${absAn("COB")} = ${absAn("AOB")} = π.`,"C'est l'axiome IV (c) pour l'angle plat, et la remarque du § 1.3 pour l'addition : [OC) est entre [OA) et [OB).",1],
   [`${absAn("EOF")} = ${absAn("EOC")} + ${absAn("COF")} = ½ (${absAn("AOC")} + ${absAn("COB")}) = π/2.`,"On additionne les deux demi-angles qui touchent [OC), puis on remplace la somme par π.",0.5],
   ["Donc (OE) ⊥ (OF) : les deux bissectrices sont perpendiculaires.","Deux droites sont perpendiculaires quand elles forment un angle droit : c'est la définition du § 1.3.",0.5]]],
 ["P4","CC1 2025, exercice 2 (2 points). Soit ABC un triangle non dégénéré. On note H<sub>B</sub> (resp. H<sub>C</sub>) le pied de la hauteur issue de B (resp. C). On suppose que BH<sub>B</sub> = CH<sub>C</sub>. Montrer que ABC est isocèle en A. (On pourra utiliser l'aire du triangle ABC.)","<p><i>Corrigé du prof, réécrit ; découpage et barème par ligne de moi.</i></p>",
  [["Par la formule de l'aire (proposition 2.4.1), avec la hauteur issue de B puis celle issue de C : 𝒜(ABC) = ½ BH<sub>B</sub> × AC = ½ CH<sub>C</sub> × AB.","L'aire d'un triangle vaut la moitié d'une base par la hauteur correspondante, et elle ne dépend pas de la base choisie.",1],
   ["BH<sub>B</sub> = CH<sub>C</sub>, et cette longueur n'est pas nulle : sinon B serait sur (AC), et le triangle serait dégénéré.","Pour simplifier une égalité par un nombre, il faut dire que ce nombre n'est pas nul.",0.5],
   ["On simplifie : AC = AB. Donc ABC est isocèle en A.","On divise les deux membres par la longueur commune des deux hauteurs, puis on conclut avec la définition d'un triangle isocèle.",0.5]]],
 ["P5","CC2 2025, exercice 1 (4 points). Soit ABC un triangle non dégénéré. On note H<sub>A</sub> (resp. H<sub>B</sub>, H<sub>C</sub>) le pied de la hauteur issue de A (resp. B, C), et H le point de concours des trois hauteurs. (On admettra qu'elles sont concourantes.) On suppose que BH = CH. Montrer que ABC est isocèle en A.",OFF,
  [["Par Pythagore dans le triangle BHH<sub>A</sub>, rectangle en H<sub>A</sub> : BH<sub>A</sub>² = BH² − HH<sub>A</sub>².","H est sur la hauteur issue de A, qui est perpendiculaire à (BC) : le triangle BHH<sub>A</sub> a un angle droit en H<sub>A</sub>.",1],
   ["= CH² − HH<sub>A</sub>², car BH = CH.","C'est l'hypothèse de l'énoncé : on remplace BH par CH dans l'égalité précédente.",0.5],
   ["= CH<sub>A</sub>², par Pythagore dans CHH<sub>A</sub>. D'où BH<sub>A</sub> = CH<sub>A</sub>.","Le triangle CHH<sub>A</sub> est rectangle en H<sub>A</sub> lui aussi. Deux longueurs qui ont le même carré sont égales.",0.5],
   ["La droite (AH<sub>A</sub>) est orthogonale à (BC) et passe par le milieu de [BC] : c'est la médiatrice de [BC].","H<sub>A</sub> est sur (BC) à égale distance de B et de C : c'est le milieu de [BC]. Une droite perpendiculaire à (BC) en son milieu est sa médiatrice.",1],
   ["Donc AB = AC : le triangle ABC est isocèle en A.","A est sur la médiatrice de [BC], et tout point de la médiatrice est à égale distance de B et de C (TD 1.6).",1]]],
 ["P6","Feuille 1, exercice 1.7, question (2)(a). Un triangle ABC est isocèle en A si $AB = AC$. Soit ABC un triangle quelconque. On suppose que la médiane issue de A est perpendiculaire à (BC). Montrer que ABC est isocèle en A.",SITE,
  [["Soit I le milieu de [BC]. La médiane issue de A est (AI), et par hypothèse (AI) ⊥ (BC).","On donne un nom au milieu, puis on traduit l'hypothèse avec ce nom : c'est ce qui permet d'écrire des égalités.",1],
   ["On compare les triangles ABI et ACI.","Il faut montrer $AB = AC$ : [AB] est un côté de ABI, [AC] est un côté de ACI.",0.5],
   ["$BI = CI$ ; [AI] est commun ; les angles en I des deux triangles valent π/2.","I est le milieu de [BC], et (AI) est perpendiculaire à (BC) : les deux angles en I sont droits.",1.5],
   ["Par CAC, ABI et ACI sont isométriques, donc $AB = AC$.","Deux côtés égaux et l'angle entre eux : l'angle en I est bien entre [IA] et [IB], et entre [IA] et [IC].",1]]],
 ["P7","Feuille 1, exercice 1.7, questions (1)(b) et (1)(c). Soit ABC un triangle isocèle en A, c'est-à-dire $AB = AC$. (b) Montrer que la bissectrice et la médiane issues de A sont confondues. (c) Montrer que la bissectrice issue de A est perpendiculaire à (BC).",SITE,
  [["Soit I le milieu de [BC]. On compare les triangles ABI et ACI.","La médiane issue de A est (AI). Ces deux triangles contiennent les deux angles en A, et les deux angles en I, qu'on veut comparer.",1],
   ["$AB = AC$, $BI = CI$ et [AI] est commun : par CCC, ils sont isométriques.","Trois côtés égaux deux à deux : l'hypothèse, la définition du milieu, et un côté commun.",1],
   [`Donc ${absAn("BAI")} = ${absAn("CAI")}. Comme I ∈ [BC], la demi-droite [AI) est entre [AB) et [AC) : ${absAn("BAI")} = ½ ${absAn("BAC")}, donc [AI) est la bissectrice. Et (AI) est aussi la médiane.`,"Les angles en A se correspondent dans l'isométrie. Il faut encore dire que [AI) est entre les deux côtés pour parler de moitié.",1],
   [`(c) La même isométrie donne ${absAn("AIB")} = ${absAn("AIC")}. Ces deux angles ont pour somme π, car [IB) et [IC) sont opposées : ils valent π/2.`,"Deux angles égaux dont la somme est un angle plat sont deux angles droits. La bissectrice (AI) est donc perpendiculaire à (BC).",1]]],
 ["P8","Feuille 1, exercice 1.6. Soient A et B deux points distincts du plan. On appelle médiatrice du segment [AB] l'unique droite perpendiculaire à (AB) passant par le milieu I de [AB]. On note Δ la médiatrice de [AB]. Soit M un point du plan. Montrer que M ∈ Δ si et seulement si $AM = MB$.",SITE,
  [[`(⇒) Soit M ∈ Δ. Si M = I, alors $AM = MB$. Sinon (MI) = Δ ⊥ (AB), donc ${absAn("AIM")} = ${absAn("BIM")} = π/2.`,"On traite à part le cas M = I, où il n'y a pas de triangle. Sinon, la médiatrice donne deux angles droits en I.",1],
   ["Dans AIM et BIM : $IA = IB$, [IM] est commun, et les angles en I sont égaux. Par CAC, ils sont isométriques, donc $AM = BM$.","L'angle droit en I est entre les deux côtés égaux : c'est bien le cas CAC.",1],
   ["(⇐) Supposons $AM = BM$. Si M ∈ (AB) : A, M, B sont alignés avec $MA = MB$, donc M est le milieu de [AB], c'est-à-dire M = I ∈ Δ.","Par l'axiome III (d), un point aligné avec A et B et à égale distance des deux est entre eux : c'est le milieu.",1],
   [`Sinon, AIM et BIM sont non dégénérés avec $IA = IB$, $AM = BM$ et [IM] commun : par CCC, ${absAn("AIM")} = ${absAn("BIM")}. Leur somme vaut π, donc chacun vaut π/2.`,"I est entre A et B : les demi-droites [IA) et [IB) sont opposées, et les deux angles en I s'ajoutent pour faire un angle plat.",1],
   ["(IM) est la perpendiculaire à (AB) passant par I : c'est Δ (corollaire 2.3.2). Donc M ∈ Δ.","Par un point passe une seule perpendiculaire à une droite donnée : (IM) et Δ sont la même droite.",1]]]];
function papierTri(R){const b=R.choix(BANQUE_TRI),e=recit("TP"+b[0],b[1],b[2],b[3])();e.ens={sorte:"papier",pts:b[3].reduce((t,l)=>t+l[2],0)};return e;}

/* ---------- GE8 : l'inégalité triangulaire (axiome III (a), (b) et (d), définition 1.2.1, exercice 3 du CC1 2026) ---------- */
const QUAD4=["ABCD","MNPQ","EFGH","RSTU"],hors=(n,C)=>C.find(c=>!n.includes(c));
const RAP_IT=`<p>Rappel : pour tous points A, B, M du plan, ${fx("AB ≤ AM + MB")} (inégalité triangulaire, axiome III a). Il y a égalité exactement quand M est sur le segment [AB] (définition 1.2.1).</p>`;
const RAP_AL=`<p>Rappel (axiome III d) : trois points sont alignés exactement quand la plus grande des trois distances entre eux est la somme des deux autres.</p>`;
const RAP_MAJ=`<p>Majorer une longueur, c'est écrire « cette longueur ≤ quelque chose ». Dans « a ≤ b », a est le petit côté et b le grand côté.</p>`;
const champV=(grand,n)=>champL("x",n,`Plus ${grand?"grande":"petite"} valeur de $${n}$ :`,"par exemple 6");
function itBase(R){const r=R(),[X,Y,Z]=R.mel(R.choix(TRI).split("")),N=[X+Y,Y+Z,X+Z],tiers=n=>[X,Y,Z].find(p=>!n.includes(p));
  if(r<0.4){const k=R.choix(["non","non","ali","ali","tri","tri","tri"]);let a,b,c,D;
    do{a=R.ent(2,9);b=R.ent(2,9);const e=Math.abs(a-b);
      c=k==="tri"?R.ent(e+1,a+b-1):k==="ali"?(e&&R()<0.5?e:a+b):e>1&&R()<0.5?e-R.ent(1,e-1):a+b+R.ent(1,3);
      D=[a,b,c].map((v,i)=>({n:N[i],v})).sort((u,w)=>w.v-u.v);}while(D[0].v===D[1].v);
    const [g,o1,o2]=D,s=o1.v+o2.v,m=tiers(g.n);
    const E=[{w:`La plus grande des trois distances est ${fx(`${g.n} = ${g.v}`)}. La somme des deux autres vaut ${fx(`${o1.v} + ${o2.v} = ${s}`)}.`,why:"L'inégalité triangulaire (axiome III a) dit que chaque distance est inférieure ou égale à la somme des deux autres. Il suffit de le vérifier pour la plus grande : pour les deux autres, c'est alors automatique.",pts:1},
      k==="non"?{w:`${g.v} est strictement plus grand que ${s} : l'inégalité ${fx(`${g.n} ≤ ${o1.n} + ${o2.n}`)} est fausse. <b>Ces trois mesures sont impossibles.</b>`,why:`Aller de ${g.n[0]} à ${g.n[1]} en passant par ${m} serait plus court que le chemin direct : l'axiome III (a) l'interdit, où que soient les points.`,pts:1}
      :k==="ali"?{w:`${g.v} est égal à ${s} : la plus grande distance est la somme des deux autres. <b>Les trois points sont alignés</b>, et ${m} est sur le segment [${g.n}].`,why:`Axiome III (d) : trois points sont alignés exactement quand la plus grande des trois distances est la somme des deux autres. Et ${fx(`${g.n[0]}${m} + ${m}${g.n[1]} = ${g.n}`)} est la définition de « ${m} ∈ [${g.n}] » (définition 1.2.1).`,pts:1}
      :{w:`${g.v} est strictement plus petit que ${s} : l'inégalité triangulaire est vérifiée, sans égalité. <b>Ces mesures sont possibles, et les trois points ne sont pas alignés</b> : ils forment un vrai triangle.`,why:"D'après l'axiome III (d), des points alignés donneraient une égalité : la plus grande distance serait la somme des deux autres. Ce n'est pas le cas ici.",pts:1}];
    const T={non:{ali:["distance trop grande prise pour un alignement",`${g.v} est strictement plus grand que ${s} : ce n'est pas une égalité. L'inégalité triangulaire interdit qu'une distance dépasse la somme des deux autres.`],
        tri:["inégalité triangulaire non vérifiée",`Compare la plus grande distance, ${g.v}, à la somme des deux autres, ${s} : elle la dépasse, et l'inégalité triangulaire l'interdit.`]},
      ali:{non:["cas d'égalité pris pour un cas impossible","L'inégalité triangulaire est large : « inférieur ou égal ». L'égalité est permise, et elle veut dire que les trois points sont alignés (axiome III d)."],
        tri:["cas d'égalité non reconnu",`${g.v} = ${s} : la plus grande distance est exactement la somme des deux autres. D'après l'axiome III (d), les trois points sont alignés.`]},
      tri:{non:["mesures possibles prises pour impossibles",`La plus grande distance, ${g.v}, ne dépasse pas la somme des deux autres, ${s} : l'inégalité triangulaire est vérifiée, rien n'est interdit.`],
        ali:["alignement annoncé sans égalité",`Des points alignés donneraient l'égalité ${g.v} = ${s}. Ici ${g.v} est strictement plus petit que ${s} : pas d'égalité, donc pas d'alignement (axiome III d).`]}};
    const o=[["non","Impossible : une mesure est fausse"],["ali","Possible : les points sont alignés"],["tri","Possible : les points ne sont pas alignés"]],bonne=o.find(c=>c[0]===k)[1];
    return {sig:"IE"+JSON.stringify([a,b,c]),q:`Un élève annonce avoir mesuré, entre trois points ${X}, ${Y} et ${Z} du plan : ${fx(`${N[0]} = ${a}`)}, ${fx(`${N[1]} = ${b}`)} et ${fx(`${N[2]} = ${c}`)}. Que peut-on en dire ?`,corps:RAP_IT+RAP_AL,
      texte:`${N[0]} = ${a}, ${N[1]} = ${b}, ${N[2]} = ${c} : possible ? alignés ?`,nature:"trois mesures : possible ou pas",champs:[champC("x",null,o)],juge:jugeQ({x:k},(id,val)=>[1,T[k][val][0],"Où ça part : la comparaison.",T[k][val][1]]),
      etapes:E,bonne,bonneTxt:bonne,repBonne:{x:k},repFausse:{x:k==="non"?"tri":"non"},ens:{sorte:"mes",d:[a,b,c],noms:N}};}
  if(r<0.75){let a,b;do{a=R.ent(1,12);b=R.ent(1,12);}while(a===b);const grand=R()<0.5,XY=X+Y,XZ=X+Z,ZY=Z+Y,e=Math.abs(a-b),V=grand?a+b:e;
    const G=a>b?{n:XZ,p:Y,ch:`${XZ} ≤ ${XY} + ${Y}${Z}`,dif:`${XZ} − ${ZY} = ${a} − ${b}`}:{n:ZY,p:X,ch:`${ZY} ≤ ${Z}${X} + ${XY}`,dif:`${ZY} − ${XZ} = ${b} − ${a}`};
    const E=grand?[{w:`D'après l'inégalité triangulaire (axiome III a), en passant par ${Z} : ${fx(`${XY} ≤ ${XZ} + ${ZY}`)}.`,why:`L'axiome vaut pour trois points quelconques : aller de ${X} à ${Y} en faisant un détour par ${Z} n'est jamais plus court que le chemin direct.`,pts:1},
        {w:`Donc ${fx(`${XY} ≤ ${a} + ${b} = ${V}`)}.`,why:"On remplace les deux distances connues par leurs valeurs.",pts:0.5},
        {w:`<b>La plus grande valeur possible est ${V}</b> : elle est atteinte quand ${Z} est sur le segment [${XY}].`,why:`Définition 1.2.1 : ${Z} est sur [${XY}] exactement quand ${fx(`${XZ} + ${ZY} = ${XY}`)}. Dans tous les autres cas, la distance ${XY} est strictement plus petite.`,pts:0.5}]
      :[{w:`On écrit l'inégalité triangulaire pour la plus grande des deux distances connues, ${G.n}, en passant par ${G.p} : ${fx(G.ch)}.`,why:`L'axiome III (a) majore n'importe laquelle des trois distances par la somme des deux autres. Pour minorer ${XY}, c'est-à-dire écrire « ${XY} ≥ quelque chose », on choisit la ligne où ${XY} est à droite.`,pts:1},
        {w:`Donc ${fx(`${XY} ≥ ${G.dif} = ${V}`)}.`,why:"On retranche des deux côtés la distance connue qui est à droite. L'ordre des deux lettres d'une distance ne compte pas (axiome III b).",pts:0.5},
        {w:`<b>La plus petite valeur possible est ${V}</b> : elle est atteinte quand ${G.p} est sur le segment [${G.n}].`,why:"Définition 1.2.1 : c'est le cas où l'inégalité triangulaire écrite à la première ligne devient une égalité.",pts:0.5}];
    const P=grand?[[Q(e),0,"plus petite valeur donnée à la place de la plus grande","Où ça part : la question.",`${e} est la plus petite valeur possible de ${XY}. La plus grande s'obtient avec le détour par ${Z} : ${XZ} + ${ZY}.`],
        [Q(Math.max(a,b)),1,"une seule des deux distances comptée","Où ça part : la somme.",`Le détour par ${Z} met bout à bout les deux distances : il faut les ajouter.`],
        [Q(a*b),1,"distances multipliées","Où ça part : l'opération.","Les deux distances du détour s'ajoutent, elles ne se multiplient pas."]]
      :[[Q(a+b),0,"plus grande valeur donnée à la place de la plus petite","Où ça part : la question.",`${a+b} est la plus grande valeur possible de ${XY}. Pour la plus petite, on retranche : la plus grande distance connue moins l'autre.`],
        [Q(-e),1,"différence prise dans le mauvais sens","Où ça part : le signe.","Une distance n'est jamais négative : on retranche la plus petite distance de la plus grande."],
        [Q(0),2,"zéro donné comme plus petite valeur","Où ça part : la valeur 0.",`${XY} = 0 voudrait dire ${X} = ${Y} (axiome III c). Les distances ${XZ} et ${ZY} seraient alors égales, or elles valent ${a} et ${b}.`]];
    return {sig:"IB"+JSON.stringify([a,b,grand]),q:`${X}, ${Y} et ${Z} sont trois points du plan. On sait seulement que ${fx(`${XZ} = ${a}`)} et ${fx(`${ZY} = ${b}`)}. Quelle est la plus ${grand?"grande":"petite"} valeur possible de la distance ${fx(XY)} ?`,corps:RAP_IT,
      texte:`${XZ} = ${a}, ${ZY} = ${b} : plus ${grand?"grande":"petite"} valeur de ${XY}`,nature:grand?"la plus grande valeur d'une distance":"la plus petite valeur d'une distance",champs:[champV(grand,XY)],juge:jugeNb(V,E,P,"la valeur"),
      etapes:E,bonne:fx(String(V)),bonneTxt:`plus ${grand?"grande":"petite"} valeur de ${XY} : ${V}`,repBonne:{x:String(V)},repFausse:{x:String(grand?e:a+b)},ens:{sorte:"borne",a,b,grand}};}
  const a=R.ent(1,9),b=R.ent(1,9),i=R.ent(0,2),d=[a,b];d.splice(i,0,a+b);const g=N[i],m=tiers(g),o=[X,Y,Z].map(p=>[p,`${p} est sur [${[X,Y,Z].filter(z=>z!==p).join("")}]`]),bonne=o.find(c=>c[0]===m)[1];
  const E=[{w:`La plus grande des trois distances est ${fx(`${g} = ${a+b}`)}, et c'est la somme des deux autres : ${fx(`${a+b} = ${a} + ${b}`)}.`,why:"C'est ce que dit l'axiome III (d) pour trois points alignés : la plus grande des trois distances est la somme des deux autres.",pts:1},
    {w:`<b>${m} est sur le segment [${g}]</b> : ${fx(`${g[0]}${m} + ${m}${g[1]} = ${g}`)}.`,why:`Définition 1.2.1 : le segment [${g}] est l'ensemble des points K tels que ${fx(`${g[0]}K + K${g[1]} = ${g}`)}. Les extrémités ${g[0]} et ${g[1]} sont les deux points les plus éloignés l'un de l'autre, et le troisième est entre eux.`,pts:1}];
  return {sig:"IM"+JSON.stringify(d),q:`Trois points ${X}, ${Y} et ${Z} du plan vérifient ${fx(`${N[0]} = ${d[0]}`)}, ${fx(`${N[1]} = ${d[1]}`)} et ${fx(`${N[2]} = ${d[2]}`)}. Ils sont donc alignés. Lequel des trois est sur le segment formé par les deux autres ?`,corps:RAP_AL,
    texte:`${N[0]} = ${d[0]}, ${N[1]} = ${d[1]}, ${N[2]} = ${d[2]} : quel point est entre les deux autres ?`,nature:"le point entre les deux autres",champs:[champC("x",null,o)],
    juge:jugeQ({x:m},()=>[1,"extrémité prise pour le point situé entre les deux autres","Où ça part : les extrémités.",`La plus grande distance, ${g} = ${a+b}, joint ${g[0]} et ${g[1]} : ce sont les deux extrémités. Le point entre les deux est le troisième, ${m}.`]),
    etapes:E,bonne,bonneTxt:bonne,repBonne:{x:m},repFausse:{x:g[0]},ens:{sorte:"entre",d,noms:N,pts:[X,Y,Z]}};}

function itEcrire(R){const r=R();
  if(r<0.35){const [X,Y,Z,W]=R.mel(R.choix(QUAD4).split("")),env=R()<0.5,XY=X+Y,o={ok:`${XY} ≤ ${env?Z+X:X+Z} + ${Z}${Y}`,sens:`${XY} ≥ ${X}${Z} + ${Z}${Y}`,autre:`${X}${Z} ≤ ${XY} + ${Y}${Z}`,casse:`${XY} ≤ ${X}${Z} + ${W}${Y}`};
    const T={sens:[0,"sens de l'inégalité inversé","Où ça part : le sens.","La distance directe est la plus petite : elle s'écrit à gauche du signe ≤. Avec ≥, la ligne dirait qu'un détour raccourcit toujours le chemin."],
      autre:[1,"inégalité vraie, mais pour une autre distance","Où ça part : la distance à gauche.",`Cette ligne est vraie, mais c'est ${X}${Z} qui est à gauche, et le point de passage est ${Y}. On demande ${XY} à gauche, en passant par ${Z}.`],
      casse:[1,"deux distances qui ne se suivent pas","Où ça part : le chemin.",`${X}${Z} s'arrête en ${Z} et ${W}${Y} repart de ${W} : ce n'est pas un chemin de ${X} à ${Y}. Le point de passage doit être écrit deux fois.`]};
    const E=[{w:`L'axiome III (a) : pour tous points A, B, M du plan, ${fx("AB ≤ AM + MB")}.`,why:"À gauche, la distance directe. À droite, le chemin qui fait un détour par M : le point de passage est écrit deux fois, une fois dans chaque distance.",pts:1},
      {w:`Ici A = ${X}, B = ${Y} et M = ${Z} : <b>${fx(o.ok)}</b>`,why:`On va de ${X} à ${Z}, puis de ${Z} à ${Y}. ${env?`${Z}${X} et ${X}${Z} sont la même distance (axiome III b). `:""}Les extrémités ${X} et ${Y} ne sont écrites qu'une fois à droite, le point de passage ${Z} deux fois.`,pts:1}];
    return {sig:"EP"+X+Y+Z+W+(env?1:0),q:`${X}, ${Y}, ${Z} et ${W} sont quatre points du plan. Laquelle de ces lignes est l'inégalité triangulaire pour la distance ${fx(XY)}, écrite en passant par le point ${Z} ?`,corps:"",
      texte:`inégalité triangulaire pour ${XY} en passant par ${Z}`,nature:"reconnaître l'inégalité triangulaire",champs:[champC("x",null,R.mel(Object.keys(o)).map(c=>[c,o[c]]))],juge:jugeQ({x:"ok"},(id,val)=>T[val]),
      etapes:E,bonne:fx(o.ok),bonneTxt:o.ok,repBonne:{x:"ok"},repFausse:{x:"sens"},ens:{sorte:"passe",pts:[X,Y,Z,W]}};}
  if(r<0.7){const [X,Y]=R.mel(R.choix(["AB","CD","EF","RS","PQ","IJ"]).split("")),XY=X+Y,t=R.ent(0,3),F3=R.mel([0,1,2,3,4,5,6]).slice(0,3);
    const V=[[`${XY} ≤ ${X}M + M${Y}`,`C'est l'inégalité triangulaire pour la distance ${XY}, en passant par M.`],
      [`${X}M ≤ ${XY} + ${Y}M`,`C'est l'inégalité triangulaire pour la distance ${X}M, en passant par ${Y}.`],
      [`M${Y} ≤ M${X} + ${XY}`,`C'est l'inégalité triangulaire pour la distance M${Y}, en passant par ${X}.`],
      [`${X}M − M${Y} ≤ ${XY}`,`L'inégalité triangulaire pour ${X}M, en passant par ${Y}, donne ${fx(`${X}M ≤ ${XY} + ${Y}M`)}. On retranche M${Y} des deux côtés.`]][t];
    const F=[[`${XY} ≥ ${X}M + M${Y}`,`est fausse dès que M n'est pas sur le segment [${XY}] : le détour par M est alors strictement plus long que ${XY}.`,"Elle ressemble à l'axiome, mais avec le signe dans l'autre sens : elle dirait qu'un détour n'est jamais plus long que le chemin direct."],
      [`${X}M + M${Y} ≤ 2 ${XY}`,`est fausse quand M est très loin de ${X} et de ${Y} : la somme de gauche est alors aussi grande qu'on veut.`,`Aucun nombre fixe ne majore ${X}M + M${Y} pour tous les points M : sur une droite passant par ${X}, il y a des points à n'importe quelle distance de ${X} (axiome III e).`],
      [`${X}M ≤ M${Y} + 1/2 ${XY}`,`est fausse quand M = ${Y} : elle dirait que ${XY} est inférieur ou égal à sa moitié.`,`Essayer les points les plus simples, M = ${X} puis M = ${Y}, suffit souvent à trouver un contre-exemple.`],
      [`${X}M ≤ ${XY}`,`est fausse quand M est loin de ${X}, par exemple à une distance double de ${XY}.`,`Sur une droite passant par ${X}, il existe des points à n'importe quelle distance de ${X} (axiome III e).`],
      [`${XY} ≤ ${X}M`,`est fausse quand M = ${X} : elle dirait que ${XY} est inférieur ou égal à 0, alors que ${X} et ${Y} sont distincts.`,`Quand M = ${X}, la distance ${X}M vaut 0, et ${XY} n'est pas nul car les deux points sont distincts (axiome III c).`],
      [`${X}M + M${Y} = ${XY}`,`n'est vraie que pour les points M du segment [${XY}] : c'est sa définition (1.2.1).`,"Une égalité demande bien plus qu'une inégalité : celle-ci décrit les points du segment, pas tous les points du plan."],
      [`${X}M ≤ M${Y}`,`est fausse quand M = ${Y} : elle dirait que ${XY} est inférieur ou égal à 0.`,`Quand M = ${Y}, la distance M${Y} vaut 0 (axiome III c), alors que ${X}M vaut ${XY}, qui n'est pas nul.`]];
    const E=[{w:`<b>${fx(V[0])}</b> est vraie pour tout point M.`,why:V[1]+" L'axiome III (a) ne pose aucune condition sur les trois points.",pts:1}].concat(F3.map(i=>({w:`${fx(F[i][0])} ${F[i][1]}`,why:F[i][2],pts:0.5})));
    return {sig:"EV"+X+Y+t+F3.slice().sort().join(""),q:`${X} et ${Y} sont deux points distincts du plan, et M est un point quelconque. Laquelle de ces lignes est vraie pour <b>tout</b> point M ?`,corps:RAP_IT,
      texte:`${X}, ${Y} distincts, M quelconque : quelle ligne est vraie pour tout M ?`,nature:"vrai pour tout point M",champs:[champC("x",null,R.mel(["ok"].concat(F3.map(i=>"f"+i))).map(c=>[c,(c==="ok"?V[0]:F[+c[1]][0]).replace("1/2","½")]))],
      juge:jugeQ({x:"ok"},(id,val)=>[1+F3.indexOf(+val[1]),"ligne fausse pour certains points M","Où ça part : « pour tout point M ».",`${fx(F[+val[1]][0])} ${F[+val[1]][1]}`]),
      etapes:E,bonne:fx(V[0]),bonneTxt:V[0],repBonne:{x:"ok"},repFausse:{x:"f"+F3[0]},ens:{sorte:"vrai",X,Y}};}
  const [A,B,C,D]=R.choix(QUAD4).split(""),AD=A+D,n3=[A+B,B+C,C+D];
  if(R()<0.55){const a=R.ent(1,9),b=R.ent(1,9),c=R.ent(1,9),V=a+b+c;
    const E=[{w:`En passant par ${C} : ${fx(`${AD} ≤ ${A}${C} + ${n3[2]}`)}.`,why:`L'inégalité triangulaire (axiome III a), pour la distance ${AD} et le point de passage ${C}.`,pts:1},
      {w:`En passant par ${B} : ${fx(`${A}${C} ≤ ${n3[0]} + ${n3[1]}`)}.`,why:`La distance ${A}${C} n'est pas donnée : on la majore à son tour, avec le point de passage ${B}.`,pts:1},
      {w:`<b>${fx(`${AD} ≤ ${n3.join(" + ")} = ${a} + ${b} + ${c} = ${V}`)}</b>, et cette valeur est atteinte quand les quatre points sont alignés dans l'ordre ${A}, ${B}, ${C}, ${D}.`,why:`On remplace ${A}${C} par quelque chose de plus grand : l'inégalité reste vraie. Un chemin en plusieurs étapes n'est jamais plus court que le chemin direct.`,pts:1}];
    return {sig:"EC"+JSON.stringify([a,b,c]),q:`${A}, ${B}, ${C} et ${D} sont quatre points du plan, avec ${fx(`${n3[0]} = ${a}`)}, ${fx(`${n3[1]} = ${b}`)} et ${fx(`${n3[2]} = ${c}`)}. Quelle est la plus grande valeur possible de la distance ${fx(AD)} ?`,corps:RAP_IT,
      texte:`${n3[0]} = ${a}, ${n3[1]} = ${b}, ${n3[2]} = ${c} : plus grande valeur de ${AD}`,nature:"un chemin en plusieurs étapes : la plus grande valeur",champs:[champV(true,AD)],
      juge:jugeNb(V,E,[[Q(a+b),2,"dernière distance oubliée","Où ça part : la somme.",`${n3[0]} + ${n3[1]} majore seulement ${A}${C}. Pour arriver en ${D}, il reste à ajouter ${n3[2]}.`],
        [Q(b+c),2,"première distance oubliée","Où ça part : la somme.",`${n3[1]} + ${n3[2]} majore seulement ${B}${D}. Le chemin part de ${A} : il faut aussi ajouter ${n3[0]}.`],
        [Q(a*b*c),2,"distances multipliées","Où ça part : l'opération.","Les distances d'un chemin s'ajoutent, elles ne se multiplient pas."]],"la valeur"),
      etapes:E,bonne:fx(String(V)),bonneTxt:`plus grande valeur de ${AD} : ${V}`,repBonne:{x:String(V)},repFausse:{x:String(a+b)},ens:{sorte:"chemin",d:[a,b,c],grand:true}};}
  const i=R.ent(0,2),s1=R.ent(1,5),s2=R.ent(1,5),big=s1+s2+R.ent(1,6),d=[s1,s2];d.splice(i,0,big);
  const ch=[`${n3[0]} ≤ ${AD} + ${D}${C} + ${C}${B}`,`${n3[1]} ≤ ${B}${A} + ${AD} + ${D}${C}`,`${n3[2]} ≤ ${C}${B} + ${B}${A} + ${AD}`][i],ordre=[[A,D,C,B],[B,A,D,C],[C,B,A,D]][i],o=n3.filter((_,j)=>j!==i),V=big-s1-s2;
  const E=[{w:`La plus grande des trois distances connues est ${fx(`${n3[i]} = ${big}`)}. On écrit un chemin de ${n3[i][0]} à ${n3[i][1]} qui passe par les deux autres points : ${fx(ch)}.`,why:`C'est l'inégalité triangulaire appliquée deux fois : un chemin en plusieurs étapes n'est jamais plus court que le chemin direct. On choisit le chemin qui contient l'étape de ${A} à ${D}, pour faire apparaître ${AD}.`,pts:1.5},
    {w:`<b>${fx(`${AD} ≥ ${n3[i]} − ${o[0]} − ${o[1]} = ${big} − ${s1} − ${s2} = ${V}`)}</b>`,why:`On retranche des deux côtés les deux distances connues ; l'ordre des deux lettres d'une distance ne compte pas (axiome III b). La valeur ${V} est atteinte quand les quatre points sont alignés dans l'ordre ${ordre.join(", ")}.`,pts:1.5}];
  return {sig:"EC"+JSON.stringify([d,"p"]),q:`${A}, ${B}, ${C} et ${D} sont quatre points du plan, avec ${fx(`${n3[0]} = ${d[0]}`)}, ${fx(`${n3[1]} = ${d[1]}`)} et ${fx(`${n3[2]} = ${d[2]}`)}. Quelle est la plus petite valeur possible de la distance ${fx(AD)} ?`,corps:RAP_IT,
    texte:`${n3[0]} = ${d[0]}, ${n3[1]} = ${d[1]}, ${n3[2]} = ${d[2]} : plus petite valeur de ${AD}`,nature:"un chemin en plusieurs étapes : la plus petite valeur",champs:[champV(false,AD)],
    juge:jugeNb(V,E,[[Q(big+s1+s2),0,"plus grande valeur donnée à la place de la plus petite","Où ça part : la question.",`${big+s1+s2} est la plus grande valeur possible de ${AD}, quand les points sont alignés dans l'ordre ${A}, ${B}, ${C}, ${D}. Pour la plus petite, on part de la plus grande distance connue.`],
      [Q(0),1,"zéro donné comme plus petite valeur","Où ça part : la valeur 0.",`Si ${A} et ${D} étaient confondus, l'inégalité triangulaire donnerait ${fx(`${n3[i]} ≤ ${o[0]} + ${o[1]} = ${s1+s2}`)}, alors que ${fx(`${n3[i]} = ${big}`)}.`],
      [Q(-V),1,"différence prise dans le mauvais sens","Où ça part : le signe.","Une distance n'est jamais négative : on part de la plus grande distance connue, et on lui retranche les deux autres."]],"la valeur"),
    etapes:E,bonne:fx(String(V)),bonneTxt:`plus petite valeur de ${AD} : ${V}`,repBonne:{x:String(V)},repFausse:{x:String(big+s1+s2)},ens:{sorte:"chemin",d,grand:false}};}

/* le plan d'une démonstration : n nom de la figure, s(U, V) le côté écrit dans l'ordre du nom, x le point en plus */
const DIV2="Diviser les deux côtés par un nombre positif ne change pas le sens d'une inégalité.",GRAND="du grand côté de l'inégalité à montrer";
const IT_PLANS=[
 ["c1","triM",["M","K"],1,(n,s,M,A,B,C)=>{const AB=s(A,B),AC=s(A,C),BC=s(B,C),MS=[A,B,C].map(p=>M+p),but=`${MS.join(" + ")} ≥ 1/2 (${AB} + ${AC} + ${BC})`;
   return {hyp:`Soient ${n} un triangle et ${M} un point du plan.`,but,
    quoi:[`${AB}, ${AC} et ${BC}, en passant par ${M}`,[`${et(MS)}, en passant par un sommet`,`Ces lignes majorent ${et(MS)}. Or leur somme est ${GRAND} : ce sont les côtés du triangle, du petit côté, qu'il faut majorer.`],
      [`${AB} seulement, en passant par ${M}`,`Une seule ligne ne fait apparaître ni ${AC} ni ${BC}. Il faut une inégalité triangulaire pour chaque longueur du petit côté.`]],
    lignes:[`${AB} ≤ ${A}${M} + ${M}${B}`,`${AC} ≤ ${A}${M} + ${M}${C}`,`${BC} ≤ ${B}${M} + ${M}${C}`],som:[`${AB} + ${AC} + ${BC}`,MS.map(x=>"2 "+x).join(" + ")],
    sf:[`${AB} + ${AC} + ${BC} ≤ ${MS.join(" + ")}`,`Chacune des distances ${et(MS)} apparaît dans deux lignes : elle compte deux fois.`],
    fin:[`On divise par 2 : ${fx(`1/2 (${AB} + ${AC} + ${BC}) ≤ ${MS.join(" + ")}`)}. C'est l'inégalité demandée.`,DIV2+" Et « a ≤ b » dit la même chose que « b ≥ a »."]};}],
 ["c2","quad",[],2,(n,s,x,A,B,C,D)=>{const AC=s(A,C),AB=s(A,B),BC=s(B,C),CD=s(C,D),DA=s(D,A),but=`${AC} ≤ 1/2 (${AB} + ${BC} + ${CD} + ${DA})`;
   return {hyp:`Soit ${n} un quadrilatère.`,but,
    quoi:[`${AC} deux fois, en passant par ${B} puis par ${D}`,[`${AB}, ${BC}, ${CD} et ${DA}, en passant par un sommet`,`Ces lignes majorent les quatre côtés. Or les côtés sont ${GRAND} : c'est ${AC}, du petit côté, qu'il faut majorer.`],
      [`${AC} une seule fois, en passant par ${B}`,`Cette ligne donne ${AC} ≤ ${AB} + ${BC} : les côtés ${CD} et ${DA} n'apparaissent pas. Il faut aussi passer par ${D}.`]],
    lignes:[`${AC} ≤ ${AB} + ${BC}`,`${AC} ≤ ${DA} + ${CD}`],som:[`2 ${AC}`,`${AB} + ${BC} + ${CD} + ${DA}`],
    sf:[`2 ${AC} ≤ ${AB} + ${BC}`,`Les côtés droits des deux lignes s'ajoutent en entier : ${CD} et ${DA} ne disparaissent pas.`],
    fin:[`On divise par 2 : ${fx(but)}. C'est l'inégalité demandée.`,DIV2]};}],
 ["c3","quad",[],1,(n,s,x,A,B,C,D)=>{const AC=s(A,C),BD=s(B,D),AB=s(A,B),BC=s(B,C),CD=s(C,D),DA=s(D,A),but=`${AC} + ${BD} ≤ ${AB} + ${BC} + ${CD} + ${DA}`;
   return {hyp:`Soit ${n} un quadrilatère, de diagonales [${AC}] et [${BD}].`,but,
    quoi:[`${AC} par ${B} puis par ${D}, et ${BD} par ${A} puis par ${C}`,[`${AC} par ${B}, et ${BD} par ${C}`,`Ces deux lignes donnent ${AC} + ${BD} ≤ ${AB} + 2 ${BC} + ${CD} : le côté ${DA} manque, et ${BC} compte deux fois. Avec les quatre lignes, chaque côté apparaît deux fois.`],
      [`${AB}, ${BC}, ${CD} et ${DA}, en passant par un sommet`,`Ces lignes majorent les côtés, qui sont ${GRAND}. Ce sont les diagonales ${AC} et ${BD}, du petit côté, qu'il faut majorer.`]],
    lignes:[`${AC} ≤ ${AB} + ${BC}`,`${AC} ≤ ${DA} + ${CD}`,`${BD} ≤ ${AB} + ${DA}`,`${BD} ≤ ${BC} + ${CD}`],som:[`2 ${AC} + 2 ${BD}`,`2 ${AB} + 2 ${BC} + 2 ${CD} + 2 ${DA}`],
    sf:[`2 ${AC} + 2 ${BD} ≤ ${AB} + ${BC} + ${CD} + ${DA}`,`Chaque côté apparaît dans deux lignes : une fois pour ${AC}, une fois pour ${BD}. Il compte deux fois.`],
    fin:[`On divise par 2 : ${fx(but)}. C'est l'inégalité demandée.`,DIV2]};}],
 ["c4","quadO",["O"],2,(n,s,O1,A,B,C,D)=>{const AC=s(A,C),BD=s(B,D),AB=s(A,B),BC=s(B,C),CD=s(C,D),but=`${AB} + ${CD} ≤ ${AC} + ${BD}`,dr=`${A}${O1} + ${O1}${B} + ${C}${O1} + ${O1}${D}`;
   return {hyp:`Soit ${n} un quadrilatère dont les diagonales [${AC}] et [${BD}] se coupent en un point ${O1}.`,but,
    quoi:[`${AB} et ${CD}, en passant par ${O1}`,[`${AC} et ${BD}, en passant par un sommet`,`${AC} et ${BD} sont ${GRAND} : les majorer ne sert à rien. Ce sont ${AB} et ${CD}, du petit côté, qu'il faut majorer.`],
      [`${AB} par ${C}, et ${CD} par ${B}`,`Ces lignes donnent ${AB} + ${CD} ≤ ${AC} + ${BD} + 2 ${BC} : il reste 2 ${BC} en trop. En passant par ${O1}, les morceaux se recollent exactement en ${AC} et ${BD}.`]],
    lignes:[`${AB} ≤ ${A}${O1} + ${O1}${B}`,`${CD} ≤ ${C}${O1} + ${O1}${D}`],som:[`${AB} + ${CD}`,dr],
    sf:[`${AB} + ${CD} = ${dr}`,`Une inégalité triangulaire ne devient une égalité que si le point de passage est sur le segment. En général, ${O1} n'est pas sur [${AB}] : on garde ≤.`],
    fin:[`${O1} est sur [${AC}] et sur [${BD}], donc ${fx(`${A}${O1} + ${O1}${C} = ${AC}`)} et ${fx(`${B}${O1} + ${O1}${D} = ${BD}`)} (définition 1.2.1). D'où ${fx(but)}.`,`C'est ici que sert l'hypothèse sur les diagonales : pour un point ${O1} quelconque, on aurait seulement ${fx(`${AC} ≤ ${A}${O1} + ${O1}${C}`)}, ce qui ne permet pas de conclure.`]};}],
 ["c5","triI",["I"],3,(n,s,I,A,B,C)=>{const AB=s(A,B),AC=s(A,C),BC=s(B,C),but=`${AB} + ${AC} ≤ 2 ${A}${I} + ${BC}`;
   return {hyp:`Soient ${n} un triangle et ${I} le milieu de [${BC}].`,but,
    quoi:[`${AB} et ${AC}, en passant par ${I}`,[`${A}${I} deux fois, en passant par ${B} puis par ${C}`,`Ces lignes majorent ${A}${I}. Or ${A}${I} est ${GRAND} : ce sont ${AB} et ${AC}, du petit côté, qu'il faut majorer.`],
      [`${BC}, en passant par ${A}`,`Cette ligne donne ${BC} ≤ ${AB} + ${AC}, où ${A}${I} n'apparaît pas. Les longueurs à majorer sont ${AB} et ${AC}, et le point de passage est ${I}.`]],
    lignes:[`${AB} ≤ ${A}${I} + ${I}${B}`,`${AC} ≤ ${A}${I} + ${I}${C}`],som:[`${AB} + ${AC}`,`2 ${A}${I} + ${I}${B} + ${I}${C}`],
    sf:[`${AB} + ${AC} ≤ ${A}${I} + ${I}${B} + ${I}${C}`,`${A}${I} apparaît dans les deux lignes : il compte deux fois.`],
    fin:[`${I} est le milieu de [${BC}], donc ${fx(`${I}${B} + ${I}${C} = ${BC}`)}. D'où ${fx(but)}.`,`Définition 1.2.2 : le milieu vérifie ${I}${B} = ${I}${C} = ½ ${BC}. La somme des deux moitiés redonne ${BC}.`]};}],
 ["c6","triSeg",["M","K"],3,(n,s,M,A,B,C)=>{const AB=s(A,B),AC=s(A,C),BC=s(B,C),but=`${A}${M} ≤ 1/2 (${AB} + ${AC} + ${BC})`,dr=`${AB} + ${AC} + ${B}${M} + ${C}${M}`;
   return {hyp:`Soient ${n} un triangle et ${M} un point du segment [${BC}].`,but,
    quoi:[`${A}${M} deux fois, en passant par ${B} puis par ${C}`,[`${AB} et ${AC}, en passant par ${M}`,`Ces lignes majorent ${AB} et ${AC}, qui sont ${GRAND}. C'est ${A}${M}, du petit côté, qu'il faut majorer.`],
      [`${BC}, en passant par ${M}`,`${M} est sur [${BC}] : cette ligne est en fait l'égalité ${B}${M} + ${M}${C} = ${BC}. Elle servira à la fin, mais elle ne majore pas ${A}${M}.`]],
    lignes:[`${A}${M} ≤ ${AB} + ${B}${M}`,`${A}${M} ≤ ${AC} + ${C}${M}`],som:[`2 ${A}${M}`,dr],
    sf:[`2 ${A}${M} = ${dr}`,`Une inégalité triangulaire ne devient une égalité que si le point de passage est sur le segment. En général, ${B} n'est pas sur [${A}${M}] : on garde ≤.`],
    fin:[`${M} est sur [${BC}], donc ${fx(`${B}${M} + ${M}${C} = ${BC}`)} (définition 1.2.1). D'où ${fx(`2 ${A}${M} ≤ ${AB} + ${AC} + ${BC}`)}, puis on divise par 2.`,"C'est la seule fois où l'hypothèse sur le point du segment sert. "+DIV2]};}],
 ["c8","triM",["P","K"],3,(n,s,P1,A,B,C)=>{const AB=s(A,B),AC=s(A,C),BC=s(B,C),dr=`2 ${A}${P1} + ${P1}${B} + ${P1}${C}`;
   return {hyp:`Soient ${n} un triangle et ${P1} un point du plan.`,but:`${AB} + ${AC} ≤ ${dr}`,
    quoi:[`${AB} et ${AC}, en passant par ${P1}`,[`${P1}${B} et ${P1}${C}, en passant par ${A}`,`${P1}${B} et ${P1}${C} sont ${GRAND} : les majorer ne sert à rien. Ce sont ${AB} et ${AC}, du petit côté, qu'il faut majorer.`],
      [`${BC}, en passant par ${P1}`,`${BC} n'apparaît pas dans l'inégalité à montrer. Les longueurs à majorer sont celles du petit côté : ${AB} et ${AC}.`]],
    lignes:[`${AB} ≤ ${A}${P1} + ${P1}${B}`,`${AC} ≤ ${A}${P1} + ${P1}${C}`],som:[`${AB} + ${AC}`,dr],
    sf:[`${AB} + ${AC} ≤ ${A}${P1} + ${P1}${B} + ${P1}${C}`,`${A}${P1} apparaît dans les deux lignes : il compte deux fois.`],
    fin:["C'est exactement l'inégalité à montrer : il n'y a rien à ajouter.",`Pas de division, pas d'hypothèse à utiliser : le point ${P1} est quelconque, et la preuve vaut pour tous les points du plan.`]};}],
 ["c10","quadM",["M","K"],1,(n,s,M,A,B,C,D)=>{const AC=s(A,C),BD=s(B,D),MS=[A,B,C,D].map(p=>M+p),but=`${MS.join(" + ")} ≥ ${AC} + ${BD}`,dr=`${A}${M} + ${M}${C} + ${B}${M} + ${M}${D}`;
   return {hyp:`Soient ${n} un quadrilatère, de diagonales [${AC}] et [${BD}], et ${M} un point du plan.`,but,
    quoi:[`${AC} et ${BD}, en passant par ${M}`,[`${et(MS)}, en passant par un sommet`,`Ces lignes majorent ${et(MS)}. Or leur somme est ${GRAND} : ce sont ${AC} et ${BD}, du petit côté, qu'il faut majorer.`],
      [`${et([s(A,B),s(B,C),s(C,D),s(D,A)])}, en passant par ${M}`,`Les côtés n'apparaissent pas dans l'inégalité à montrer : du petit côté, il y a les diagonales ${AC} et ${BD}.`]],
    lignes:[`${AC} ≤ ${A}${M} + ${M}${C}`,`${BD} ≤ ${B}${M} + ${M}${D}`],som:[`${AC} + ${BD}`,dr],
    sf:[`${AC} + ${BD} ≤ ${A}${M} + ${M}${C}`,`Les deux lignes s'ajoutent en entier : ${B}${M} + ${M}${D} ne disparaît pas.`],
    fin:[`C'est l'inégalité demandée, lue de droite à gauche : ${fx(but)}.`,"« a ≤ b » dit la même chose que « b ≥ a ». Et l'ordre des deux lettres d'une distance ne compte pas (axiome III b)."]};}],
 ["c11","quadM",["M","K"],1,(n,s,M,A,B,C,D)=>{const CO=[s(A,B),s(B,C),s(C,D),s(D,A)],AC=s(A,C),BD=s(B,D),MS=[A,B,C,D].map(p=>M+p),but=`${MS.join(" + ")} ≥ 1/2 (${CO.join(" + ")})`;
   return {hyp:`Soient ${n} un quadrilatère et ${M} un point du plan.`,but,
    quoi:[`${et(CO)}, en passant par ${M}`,[`${et(MS)}, en passant par un sommet`,`Ces lignes majorent ${et(MS)}. Or leur somme est ${GRAND} : ce sont les quatre côtés, du petit côté, qu'il faut majorer.`],
      [`${AC} et ${BD}, en passant par ${M}`,`Ces lignes donnent ${AC} + ${BD} ≤ ${MS.join(" + ")} : une inégalité vraie, mais avec les diagonales. Ici ce sont les quatre côtés qui sont du petit côté.`]],
    lignes:[`${CO[0]} ≤ ${A}${M} + ${M}${B}`,`${CO[1]} ≤ ${B}${M} + ${M}${C}`,`${CO[2]} ≤ ${C}${M} + ${M}${D}`,`${CO[3]} ≤ ${D}${M} + ${M}${A}`],som:[CO.join(" + "),MS.map(x=>"2 "+x).join(" + ")],
    sf:[`${CO.join(" + ")} ≤ ${MS.join(" + ")}`,`Chacune des distances ${et(MS)} apparaît dans deux lignes, car chaque sommet est au bout de deux côtés : elle compte deux fois.`],
    fin:[`On divise par 2 : ${fx(`1/2 (${CO.join(" + ")}) ≤ ${MS.join(" + ")}`)}. C'est l'inégalité demandée.`,DIV2+" Et « a ≤ b » dit la même chose que « b ≥ a »."]};}]];
function itCompleter(R){const [id,conf,ex,rot,f]=R.choix(IT_PLANS),n=R.choix(conf[0]==="t"?TRI:QUAD4),k=R.ent(0,rot-1),L=(n+n).slice(k,k+n.length).split(""),x=hors(n,ex)||"",
    p=f(n,(u,v)=>n.indexOf(u)<n.indexOf(v)?u+v:v+u,x,...L),S={ok:`${p.som[0]} ≤ ${p.som[1]}`,sf:p.sf[0],sens:`${p.som[0]} ≥ ${p.som[1]}`},Qo={ok:p.quoi[0],f1:p.quoi[1][0],f2:p.quoi[2][0]};
  const E=[{w:`On majore les longueurs du petit côté de l'inégalité à montrer : ${Qo.ok}.`,why:"L'inégalité triangulaire se lit « distance directe ≤ détour ». Les distances directes sont les longueurs du petit côté ; les points de passage sont ceux qui apparaissent du grand côté.",pts:1},
    {w:et(p.lignes.map(l=>fx(l)))+".",why:"Chaque ligne est l'inégalité triangulaire (axiome III a) : elle est vraie sans aucune condition sur les points.",pts:1},
    {w:`En additionnant ces lignes : <b>${fx(S.ok)}</b>`,why:"Des inégalités de même sens s'additionnent membre à membre : si a ≤ b et c ≤ d, alors a + c ≤ b + d. À droite, chaque distance compte autant de fois qu'elle apparaît.",pts:1},
    {w:p.fin[0],why:p.fin[1],pts:1}];
  const tort=(c,v)=>c==="l"?[0,"mauvaises longueurs majorées","Où ça part : le choix des longueurs.",p.quoi[v==="f1"?1:2][1]]
    :v==="sens"?[2,"sens de l'inégalité inversé en additionnant","Où ça part : le sens.","Additionner des inégalités de même sens garde ce sens : des ≤ donnent un ≤."]:[2,"somme des lignes fausse","Où ça part : l'addition.",p.sf[1]];
  return {sig:"PL"+id+L.join(""),q:`${p.hyp} On veut montrer que ${fx(p.but)}. Complète le plan de la démonstration.`,corps:RAP_IT+RAP_MAJ,texte:`${p.hyp} Montrer ${p.but} : plan de la démonstration`,nature:"le plan d'une démonstration",
    champs:[champC("l","Quelles longueurs faut-il majorer avec l'inégalité triangulaire ?",R.mel(["ok","f1","f2"]).map(c=>[c,Qo[c]])),champC("s","Une fois ces lignes écrites et additionnées, on obtient :",R.mel(["ok","sf","sens"]).map(c=>[c,S[c]]))],
    juge:jugeQ({l:"ok",s:"ok"},tort),etapes:E,bonne:`${Qo.ok} ; ${fx(S.ok)}`,bonneTxt:`${Qo.ok} ; ${S.ok}`,repBonne:{l:"ok",s:"ok"},repFausse:{l:"f1",s:"ok"},ens:{sorte:"plan",conf,L,x,but:p.but,lignes:p.lignes,S}};}

const MODELE="Exercice de moi, sur le modèle de l'exercice 3 du CC1 2026";
const IT_BANQUE=[
 ["I1","triM","ABC","M","CC1 du 10 novembre 2026, exercice 3 (4 points). Soient ABC un triangle et M un point du plan. Montrer l'inégalité $MA + MB + MC ≥ 1/2 (AB + AC + BC)$.",OFF,
  [["D'après l'inégalité triangulaire, on a $AB ≤ AM + MB$,","L'axiome III (a), pour le côté [AB] et le point de passage M. Il vaut pour n'importe quel point M : aucune hypothèse à vérifier.",1],
   ["$AC ≤ AM + MC$,","La même inégalité pour le côté [AC]. Dans l'inégalité à montrer, les trois côtés sont du petit côté : il faut une ligne pour chacun.",1],
   ["et $BC ≤ BM + MC$.","La même inégalité pour le côté [BC], toujours en passant par M.",1],
   ["En sommant ces trois inégalités, on obtient $AB + AC + BC ≤ 2 AM + 2 MB + 2 MC$, d'où $1/2 (AB + AC + BC) ≤ MA + MB + MC$.","Chaque distance AM, MB, MC apparaît dans deux lignes. Puis on divise par 2 : le sens d'une inégalité ne change pas quand on divise par un nombre positif.",1]]],
 ["I2","quad","ABCD","",MODELE+" (4 points). Soit ABCD un quadrilatère. Montrer que la somme des diagonales ne dépasse pas le périmètre : $AC + BD ≤ AB + BC + CD + DA$.",MOI,
  [["$AC ≤ AB + BC$ et $AC ≤ AD + DC$.","L'inégalité triangulaire (axiome III a) pour la diagonale [AC], en passant par B, puis en passant par D.",1],
   ["$BD ≤ BA + AD$ et $BD ≤ BC + CD$.","La même chose pour l'autre diagonale [BD], en passant par A, puis par C.",1],
   ["En additionnant les quatre lignes : $2 AC + 2 BD ≤ 2 AB + 2 BC + 2 CD + 2 DA$.","Chaque côté apparaît dans deux lignes : une fois pour AC, une fois pour BD. L'ordre des deux lettres d'une distance ne compte pas (axiome III b).",1],
   ["On divise par 2 : $AC + BD ≤ AB + BC + CD + DA$.","Diviser les deux côtés par un nombre positif garde le sens de l'inégalité.",1]]],
 ["I3","quadO","ABCD","O",MODELE+" (4 points). Soit ABCD un quadrilatère dont les diagonales [AC] et [BD] se coupent en un point O. Montrer que $AB + CD ≤ AC + BD$.",MOI,
  [["$AB ≤ AO + OB$.","L'inégalité triangulaire pour le côté [AB], en passant par O : c'est le seul point qui relie les côtés aux diagonales.",1],
   ["$CD ≤ CO + OD$.","La même inégalité pour le côté [CD], encore en passant par O.",1],
   ["O est sur [AC], donc $AO + OC = AC$. O est sur [BD], donc $BO + OD = BD$.","C'est la définition du segment (1.2.1) : un point M est sur [AC] exactement quand AM + MC = AC. C'est ici que sert l'hypothèse sur les diagonales.",1],
   ["En additionnant les deux premières lignes : $AB + CD ≤ AO + OC + BO + OD = AC + BD$.","On additionne, puis on regroupe les deux morceaux de chaque diagonale grâce à la ligne précédente.",1]]],
 ["I4","triSeg","ABC","M",MODELE+" (4 points). Soient ABC un triangle et M un point du segment [BC]. Montrer que $AM ≤ 1/2 (AB + AC + BC)$.",MOI,
  [["$AM ≤ AB + BM$.","L'inégalité triangulaire (axiome III a) pour la distance AM, en passant par le sommet B.",1],
   ["$AM ≤ AC + CM$.","La même inégalité, en passant cette fois par le sommet C : il faut les deux lignes pour faire apparaître les trois côtés.",1],
   ["M est sur [BC], donc $BM + MC = BC$.","Définition du segment (1.2.1). C'est la seule fois où l'hypothèse « M ∈ [BC] » sert.",1],
   ["En additionnant les deux premières lignes : $2 AM ≤ AB + AC + BM + CM = AB + AC + BC$, puis on divise par 2.","À droite, BM + CM se regroupe en BC grâce à la ligne précédente. Diviser par 2 garde le sens de l'inégalité.",1]]],
 ["I5","quadM","ABCD","M",MODELE+" (3 points). Soient ABCD un quadrilatère et M un point du plan. Montrer que $MA + MB + MC + MD ≥ AC + BD$.",MOI,
  [["$AC ≤ AM + MC$.","L'inégalité triangulaire pour la diagonale [AC], en passant par M. Les diagonales sont du petit côté de l'inégalité à montrer : ce sont elles qu'on majore.",1],
   ["$BD ≤ BM + MD$.","La même inégalité pour l'autre diagonale [BD], en passant par M.",1],
   ["En additionnant : $AC + BD ≤ MA + MB + MC + MD$.","C'est l'inégalité demandée, lue de droite à gauche. L'ordre des deux lettres d'une distance ne compte pas (axiome III b).",1]]],
 ["I6","trois","ABM","",MODELE+" (3 points). Soient A, B et M trois points du plan. Montrer que $MA − MB ≤ AB$ et que $MB − MA ≤ AB$.",MOI,
  [["$MA ≤ MB + BA$.","L'inégalité triangulaire pour la distance MA, en passant par B. Pour faire apparaître MA − MB, on met MA seul à gauche.",1],
   ["Donc $MA − MB ≤ AB$.","On retranche MB des deux côtés, et BA = AB par symétrie (axiome III b).",0.5],
   ["$MB ≤ MA + AB$.","L'inégalité triangulaire pour la distance MB, cette fois en passant par A.",1],
   ["Donc $MB − MA ≤ AB$.","On retranche MA des deux côtés. Les deux résultats ensemble disent que l'écart entre MA et MB ne dépasse jamais AB.",0.5]]],
 ["I7","inter","ABCNM","",MODELE+" (4 points). Soient ABC un triangle, N un point du segment [AC] et M un point du segment [BN]. Montrer que $MB + MC ≤ AB + AC$.",MOI,
  [["$MC ≤ MN + NC$.","L'inégalité triangulaire pour la distance MC, en passant par N : c'est le point qui relie M au côté [AC].",1],
   ["M est sur [BN], donc $BM + MN = BN$. D'où $MB + MC ≤ BN + NC$.","Définition du segment (1.2.1). On ajoute MB des deux côtés de la première ligne, puis MB + MN se regroupe en BN.",1],
   ["$BN ≤ BA + AN$.","L'inégalité triangulaire une seconde fois, pour la distance BN, en passant par le sommet A.",1],
   ["N est sur [AC], donc $AN + NC = AC$. D'où $MB + MC ≤ BA + AN + NC = AB + AC$.","On remplace BN par quelque chose de plus grand, puis AN + NC se regroupe en AC (définition du segment).",1]]],
 ["I8","seg2","ABMN","","Feuille 1, exercice 1.2, question (3) (barème de moi : 4 points). Soient A et B deux points du plan et M un point du segment [AB]. Montrer que [AM] ⊂ [AB].",SITE,
  [["Soit N un point de [AM]. Il faut montrer que N ∈ [AB], c'est-à-dire $AN + NB = AB$.","Pour montrer une inclusion, on prend un point quelconque du premier ensemble et on montre qu'il est dans le second. La définition du segment (1.2.1) traduit « N ∈ [AB] » en une égalité.",1],
   ["N ∈ [AM] donne $AN + NM = AM$, et M ∈ [AB] donne $AM + MB = AB$. Donc $AN + NM + MB = AB$.","Les deux hypothèses, traduites par la définition du segment. Puis on remplace AM dans la seconde égalité.",1],
   ["Par l'inégalité triangulaire, $NB ≤ NM + MB$, donc $AN + NB ≤ AN + NM + MB = AB$.","L'axiome III (a) pour la distance NB, en passant par M. Puis on ajoute AN des deux côtés.",1],
   ["Et $AB ≤ AN + NB$, encore par l'inégalité triangulaire. Donc $AN + NB = AB$ : N ∈ [AB].","L'axiome III (a) pour AB, en passant par N, donne l'inégalité dans l'autre sens. Deux inégalités de sens contraires donnent l'égalité.",1]]],
 ["I9","triI","ABC","I",MODELE+" (4 points). Soient ABC un triangle et I le milieu de [BC]. Montrer que $AI ≥ 1/2 (AB + AC − BC)$.",MOI,
  [["$AB ≤ AI + IB$.","L'inégalité triangulaire (axiome III a) pour le côté [AB], en passant par I.",1],
   ["$AC ≤ AI + IC$.","La même inégalité pour le côté [AC], encore en passant par I.",1],
   ["I est le milieu de [BC], donc $IB + IC = BC$.","Définition 1.2.2 : le milieu de [BC] vérifie IB = IC = ½ BC. La somme des deux moitiés redonne BC.",1],
   ["En additionnant les deux premières lignes : $AB + AC ≤ 2 AI + BC$, donc $AI ≥ 1/2 (AB + AC − BC)$.","On retranche BC des deux côtés, puis on divise par 2 : aucune de ces deux opérations ne change le sens de l'inégalité.",1]]],
 ["I10","quadM","ABCD","M",MODELE+" (4 points). Soient ABCD un quadrilatère et M un point du plan. Montrer que $MA + MB + MC + MD ≥ 1/2 (AB + BC + CD + DA)$.",MOI,
  [["$AB ≤ AM + MB$ et $BC ≤ BM + MC$.","L'inégalité triangulaire pour les côtés [AB] et [BC], en passant par M. Les quatre côtés sont du petit côté de l'inégalité à montrer : il faut une ligne pour chacun.",1],
   ["$CD ≤ CM + MD$ et $DA ≤ DM + MA$.","La même inégalité pour les deux autres côtés, toujours en passant par M.",1],
   ["En additionnant les quatre lignes : $AB + BC + CD + DA ≤ 2 MA + 2 MB + 2 MC + 2 MD$.","Chaque distance MA, MB, MC, MD apparaît dans deux lignes, car chaque sommet est au bout de deux côtés.",1],
   ["On divise par 2 : $1/2 (AB + BC + CD + DA) ≤ MA + MB + MC + MD$.","Diviser les deux côtés par un nombre positif garde le sens de l'inégalité. C'est l'inégalité demandée, lue de droite à gauche.",1]]]];
function itPapier(R){const b=R.choix(IT_BANQUE),e=recit("IP"+b[0],b[4],b[5],b[6])();e.ens={sorte:"papier",pts:b[6].reduce((t,l)=>t+l[2],0),conf:b[1],L:b[2].split(""),x:b[3]};return e;}

/* ---------- les démonstrations et les énoncés du cours : à écrire de mémoire, puis à cocher ligne par ligne ---------- */
const recit=(sig,q,corps,lignes)=>()=>({sig,q,corps,texte:(q+" "+corps).replace(/<[^>]+>/g," ").replace(/\^\{2\}/g,"²").replace(/\$/g,"").replace(/\s+/g," ").trim(),champs:[],papier:true,juge:()=>({incomplet:"Cet exercice se fait sur papier."}),
  etapes:lignes.map(l=>({w:l[0],why:l[1],pts:l[2]})),bonne:"voir la correction",bonneTxt:"à écrire de mémoire (voir la correction)",repBonne:{},nature:"papier"});
/* ---------- GE9 : les nombres complexes en géométrie (poly, chapitres 6 et 7 ; CC3 2026, examens de janvier 2024 et 2025) ---------- */
const Zc=(a,b)=>({a:q(a),b:q(b||0)}),zAdd=(z,w)=>Zc(add(z.a,w.a),add(z.b,w.b)),zSub=(z,w)=>Zc(sub(z.a,w.a),sub(z.b,w.b));
const zMul=(z,w)=>Zc(sub(mul(z.a,w.a),mul(z.b,w.b)),add(mul(z.a,w.b),mul(z.b,w.a))),zBar=z=>Zc(z.a,mul(z.b,-1)),zN2=z=>add(mul(z.a,z.a),mul(z.b,z.b));
const zDiv=(z,w)=>{const d=zN2(w),p=zMul(z,zBar(w));return Zc(div(p.a,d),div(p.b,d));};
const zEq=(z,w)=>egal(z.a,w.a)&&egal(z.b,w.b),zF=z=>[fl(z.a),fl(z.b)],zNul=z=>!z.a.n&&!z.b.n,zNeg=z=>Zc(mul(z.a,-1),mul(z.b,-1));
const zCo=x=>{const A=vabs(q(x));return (egal(A,1)?"":A.d===1?nb(A):"("+nb(A)+")")+"i";};
function zt(z){const a=q(z.a),b=q(z.b);if(!b.n)return nb(a);if(!a.n)return (b.n<0?"−":"")+zCo(b);return nb(a)+(b.n<0?" − ":" + ")+zCo(b);}
const zp=z=>(!z.b.n&&z.a.n>=0)||(!z.a.n&&z.b.n>0)?zt(z):"("+zt(z)+")";
const plusZ=z=>{if(zNul(z))return "";if(!z.b.n||!z.a.n){const c=z.b.n?z.b:z.a;return (c.n<0?" − ":" + ")+(z.b.n?zCo(c):nb(vabs(c)));}return " + ("+zt(z)+")";};
const facZ=a=>!a.b.n&&egal(a.a,1)?"":!a.b.n&&egal(a.a,-1)?"−":!a.a.n&&egal(a.b,1)?"i":!a.a.n&&egal(a.b,-1)?"−i":!a.b.n&&a.a.d===1?nb(a.a):"("+zt(a)+")";
const linZ=(a,w)=>facZ(a)+"z"+plusZ(w);
const zr=(R,lo,hi)=>Zc(R.ent(lo,hi),R.ent(lo,hi)),affZ=(n,z)=>fx(`z_{${n}} = ${zt(z)}`);
const colin=(A,B,C)=>{const u=zSub(B,A),v=zSub(C,A);return !sub(mul(u.a,v.b),mul(u.b,v.a)).n;};
const EIA={"1/2":Zc(0,1),"-1/2":Zc(0,-1),"1":Zc(-1,0)},ANG3=[Q(1,2),Q(-1,2),Q(1,1)];
const eia=t=>t.n<0?`e^{−i${angT(mul(t,-1))}}`:`e^{i${angT(t)}}`;
const RAPZ=`<p class="muted">Rappel : le plan est muni d'un repère orthonormé direct et identifié à ℂ. Le point M de coordonnées (x, y) a pour affixe ${fx("z_{M} = x + iy")} (poly, chapitre 6).</p>`;
const lisR=s=>{const t=propre(s);if(!t)return {vide:1};if(/i/i.test(t.replace(/pi/gi,"")))return {avecI:1};const v=O.calcule(t,{});return v===null||!isFinite(v)?{illisible:1}:{v,dec:/\d[.,]\d/.test(t)};};
function exoZ(o){const z=o.z,dern=o.etapes.length-1;
  const pieges=o.pieges.concat([[Zc(z.b,z.a),dern,"partie réelle et partie imaginaire échangées","Où ça part : lire a et b.",`a est la partie réelle (le nombre sans i), b la partie imaginaire (le nombre devant i). Ici ${fx(`a = ${nb(z.a)}`)} et ${fx(`b = ${nb(z.b)}`)}.`]]).filter((p,i,L)=>!zEq(p[0],z)&&L.findIndex(r=>zEq(r[0],p[0]))===i);
  const juge=rep=>{const X=rep.z||{},A=lisR(X.a),B=lisR(X.b);
    if(A.vide||B.vide)return {incomplet:"Remplis les deux cases a et b."};
    if(A.avecI||B.avecI)return {incomplet:"Dans chaque case, écris un nombre réel, sans i : pour 2 − 3i, a = 2 et b = −3."};
    if(A.illisible||B.illisible)return {incomplet:"Je n'arrive pas à lire une des cases. Écris un nombre, par exemple −3 ou 5/2."};
    const [za,zb]=zF(z),okA=pres(A.v,za),okB=pres(B.v,zb);if(okA&&okB)return {ok:true};
    if((!okA&&A.dec&&Math.abs(A.v-za)<0.02)||(!okB&&B.dec&&Math.abs(B.v-zb)<0.02))return {incomplet:"C'est une valeur approchée. Au CC il faut la valeur exacte : écris une fraction, par exemple 3/2."};
    const F=[];if(!okA)F.push("a");if(!okB)F.push("b");
    const pg=pieges.find(p=>{const w=zF(p[0]);return pres(A.v,w[0])&&pres(B.v,w[1]);});
    return {ok:false,faux:F,resume:`Pas tout à fait : ${F.length>1?"les deux cases sont à revoir":"la case "+F[0]+" est à revoir"}.`,
      diag:pg?{etape:pg[1],type:pg[2],titre:pg[3],msg:pg[4]}:{etape:dern,type:"calcul",titre:"Où ça part : le calcul.",msg:`Refais le calcul étape par étape : on trouve ${fx(`${o.nom} = ${zt(z)}`)}.`}};};
  const f0=pieges.length?pieges[0][0]:zAdd(z,Zc(1));
  return {sig:o.sig,q:o.q,corps:RAPZ+(o.corps||""),texte:o.texte,nature:o.nature,etapes:o.etapes,juge,
    champs:[{k:"cases",id:"z",noms:["a","b"],titre:`Écris ${o.titre} sous la forme $a + ib$, avec $a$ et $b$ réels :`,sym:["/"],aide:"Dans la case b, écris seulement le nombre devant i : pour 2 − 3i, a = 2 et b = −3. Pour une fraction, écris 3/2."}],
    bonne:fx(`${o.nom} = ${zt(z)}`),bonneTxt:`${o.nom} = ${zt(z)}`.replace(/_\{([^}]*)\}/g,"$1"),repBonne:{z:{a:brut(z.a),b:brut(z.b)}},repFausse:{z:{a:brut(f0.a),b:brut(f0.b)}},ens:Object.assign({z:zF(z)},o.ens)};}
function jugeF(V,E,pieges,quoi){return rep=>{const r=lisNombre(rep.x,V,quoi);if(r.inc)return {incomplet:r.inc};if(pres(r.v,V))return {ok:true};
  for(const p of pieges)if(!pres(p[0],V)&&pres(r.v,p[0]))return faux({etape:p[1],type:p[2],titre:p[3],msg:p[4]});
  return faux({etape:E.length-1,type:"calcul",titre:"Où ça part : le calcul.",msg:E[E.length-1].w});};}
const memeAng=(x,y)=>{const k=(x-y)/(2*Math.PI);return Math.abs(k-Math.round(k))<1e-9;};
function jugeMod(t,E,pieges){const V=angV(t);return rep=>{const r=lisAngle(rep.x,V);if(r.inc)return {incomplet:r.inc};if(memeAng(r.v,V))return {ok:true};
  for(const p of pieges){const w=angV(p[0]);if(!memeAng(w,V)&&memeAng(r.v,w))return faux({etape:p[1],type:p[2],titre:p[3],msg:p[4]});}
  return faux({etape:E.length-1,type:"calcul",titre:"Où ça part : l'argument.",msg:E[E.length-1].w});};}

function milieuPara(R){let A,B,C;do{A=zr(R,-4,4);B=zr(R,-4,4);C=zr(R,-4,4);}while(colin(A,B,C));
  if(R()<0.4){const s=zAdd(B,C),V=Zc(div(s.a,2),div(s.b,2)),d=zSub(C,B);
    const E=[{w:`Le milieu I de [BC] vérifie ${ve("BI")} = ${ve("IC")}, donc ${fx("z_{I} − z_{B} = z_{C} − z_{I}")}, d'où ${fx("z_{I} = (z_{B} + z_{C})/2")}.`,why:`Proposition 6.1.1 : le vecteur AB a pour affixe ${fx("z_{B} − z_{A}")}. L'affixe du milieu est donc la moyenne des deux affixes.`,pts:1},
      {w:`<b>${fx(`z_{I} = (${zt(B)} + ${zp(C)})/2 = ${zp(s)}/2 = ${zt(V)}`)}</b>`,why:"On additionne les parties réelles entre elles et les parties imaginaires entre elles, puis on divise chacune par 2.",pts:1}];
    return exoZ({nom:"z_{I}",z:V,titre:"l'affixe de I",sig:"CM"+zt(B)+"|"+zt(C),nature:"milieu",texte:`B ${zt(B)}, C ${zt(C)} ; affixe du milieu I de [BC]`,
      q:`Soient B et C les points d'affixes ${affZ("B",B)} et ${affZ("C",C)}. Donne l'affixe du milieu I du segment [BC].`,etapes:E,
      pieges:[[s,1,"division par 2 oubliée","Où ça part : la moyenne.","L'affixe du milieu est la moyenne des deux affixes : on divise la somme par 2."],[Zc(div(d.a,2),div(d.b,2)),0,"différence au lieu de somme","Où ça part : la formule.",`${fx("(z_{C} − z_{B})/2")} est l'affixe du vecteur ${ve("BI")}, pas celle du point I. Le point I a pour affixe ${fx("(z_{B} + z_{C})/2")}.`]],
      ens:{k:"mil",B:zF(B),C:zF(C)}});}
  const [W,j]=R.choix([["ABCD",3],["ABCD",3],["ABKC",2],["AGBC",1]]),L=W.split(""),X=L[j],P=L[(j+3)%4],S2=L[(j+1)%4],T=L[(j+2)%4],Z0={A,B,C};
  const V=zSub(zAdd(Z0[P],Z0[S2]),Z0[T]),l0=L[0],l1=L[1],l2=L[2],l3=L[3];
  const E=[{w:`${W} est un parallélogramme exactement quand ${ve(l0+l1)} = ${ve(l3+l2)}. Avec la proposition 6.1.1, cela s'écrit ${fx(`z_{${l1}} − z_{${l0}} = z_{${l2}} − z_{${l3}}`)}.`,why:`Les sommets se suivent dans l'ordre des lettres : ${l0}${l1} et ${l3}${l2} sont deux côtés opposés, parcourus dans le même sens (§3.2).`,pts:1},
    {w:`<b>On isole ${fx(`z_{${X}}`)} : ${fx(`z_{${X}} = z_{${P}} + z_{${S2}} − z_{${T}} = ${zt(Z0[P])} + ${zp(Z0[S2])} − ${zp(Z0[T])} = ${zt(V)}`)}</b>`,why:`${X} est entre ${P} et ${S2} dans ${W}, et ${T} est le sommet opposé : il est le seul retranché.`,pts:1}];
  return exoZ({nom:`z_{${X}}`,z:V,titre:`l'affixe de ${X}`,sig:"CP"+W+zt(A)+"|"+zt(B)+"|"+zt(C),nature:"parallélogramme",texte:`A ${zt(A)}, B ${zt(B)}, C ${zt(C)} ; ${X} tel que ${W} soit un parallélogramme`,
    q:`Soient A, B et C les points d'affixes ${affZ("A",A)}, ${affZ("B",B)} et ${affZ("C",C)}. Donne l'affixe du point ${X} tel que ${W} soit un parallélogramme.`,etapes:E,
    pieges:[[zSub(zAdd(Z0[P],Z0[T]),Z0[S2]),0,"mauvais sommet opposé","Où ça part : l'ordre des sommets.",`Dans ${W}, les sommets se suivent dans l'ordre des lettres : le sommet opposé à ${X} est ${T}. On a ${fx(`z_{${X}} = z_{${P}} + z_{${S2}} − z_{${T}}`)}.`],[zSub(zAdd(Z0[S2],Z0[T]),Z0[P]),0,"mauvais sommet opposé","Où ça part : l'ordre des sommets.",`Le sommet opposé à ${X} dans ${W} est ${T}, pas ${P}. On a ${fx(`z_{${X}} = z_{${P}} + z_{${S2}} − z_{${T}}`)}.`]],
    ens:{k:"para",W,X,A:zF(A),B:zF(B),C:zF(C)}});}

function distanceZ(R){let A,B,u;do{A=zr(R,-5,5);B=zr(R,-5,5);u=zSub(B,A);}while(zN2(u).n<2||Math.abs(fl(u.a))>8||Math.abs(fl(u.b))>8);
  const n=zN2(u).n,V=racine(Q(n)),s=zAdd(A,B);
  const E=[{w:`D'après la proposition 6.1.3, ${fx("AB = |z_{B} − z_{A}|")}, et ${fx(`z_{B} − z_{A} = ${zt(B)} − ${zp(A)} = ${zt(u)}`)}.`,why:`Le vecteur AB a pour affixe ${fx("z_{B} − z_{A}")} (proposition 6.1.1). La distance AB est la longueur de ce vecteur, c'est-à-dire le module de son affixe.`,pts:1},
    {w:`<b>${fx(`AB = √(${c2(u.a)} + ${c2(u.b)}) = ${racLigne(Q(n))}`)}</b>`,why:`Le module de x + iy est √(x² + y²) : c'est Pythagore dans le repère orthonormé.${simplifie(Q(n))}`,pts:1}];
  return {sig:"CD"+zt(A)+"|"+zt(B),q:`Soient A et B les points d'affixes ${affZ("A",A)} et ${affZ("B",B)}. Calcule la distance AB.`,corps:RAPZ,texte:`A ${zt(A)}, B ${zt(B)} ; distance AB`,nature:"distance",
    champs:[champL("x","AB","$AB =$")],etapes:E,juge:jugeF(val(V),E,[[n,1,"racine oubliée","Où ça part : le module.",`${n}, c'est AB². Le module est la racine carrée : ${fx(`AB = √${n}`)}.`],[Math.abs(fl(u.a))+Math.abs(fl(u.b)),1,"parties additionnées","Où ça part : le module.",`Le module de x + iy n'est pas |x| + |y| : c'est √(x² + y²).`],[Math.sqrt(fl(zN2(s))),0,"somme au lieu de différence","Où ça part : l'affixe du vecteur.",`Le vecteur AB a pour affixe ${fx("z_{B} − z_{A}")}, une différence, pas une somme.`]],"la distance AB"),
    bonne:fx(`AB = ${ecrit(V)}`),bonneTxt:`AB = ${ecrit(V)}`,repBonne:{x:tape(V)},repFausse:{x:String(n)},ens:{k:"dist",A:zF(A),B:zF(B)}};}

const WANG=[[0,1,Q(1,2)],[0,-1,Q(-1,2)],[1,1,Q(1,4)],[1,-1,Q(-1,4)],[-1,1,Q(3,4)],[-1,-1,Q(-3,4)],[-1,0,Q(1,1)]];
function angleQuot(R){let A,u,w,t,c,k,B,C;
  do{A=zr(R,-3,3);u=zr(R,-3,3);c=R.choix(WANG);k=R.choix([1,1,2]);w=Zc(c[0]*k,c[1]*k);t=c[2];B=zAdd(A,u);C=zAdd(A,zMul(w,u));}while(zN2(u).n<2||[B,C].some(z=>Math.abs(fl(z.a))>9||Math.abs(fl(z.b))>9));
  const v=zMul(w,u),n2=zN2(u),p=zMul(v,zBar(u)),rho=S(k,c[0]*c[0]+c[1]*c[1]),cs=x=>c[0]&&c[1]?S(Q(x,2),2):S(x);
  const E=[{w:`D'après la proposition 6.1.1, ${fx(`z_{B} − z_{A} = ${zt(u)}`)} et ${fx(`z_{C} − z_{A} = ${zt(v)}`)}.`,why:`Le vecteur AB a pour affixe ${fx("z_{B} − z_{A}")}, et le vecteur AC a pour affixe ${fx("z_{C} − z_{A}")}.`,pts:1},
    {w:`${fx(`(z_{C} − z_{A})/(z_{B} − z_{A}) = ${zp(v)}/${zp(u)}`)} ${fx(`= (${zt(p)})/${nb(n2)} = ${zt(w)}`)}.`,why:`On multiplie en haut et en bas par le conjugué du dénominateur, ${zt(zBar(u))} : en bas, ${fx("(x + iy)(x − iy) = x^{2} + y^{2}")}.`,pts:1},
    {w:`${fx(`${zt(w)} = ${egal(rho.r,1)&&rho.k===1?"":ecrit(rho)+" "}${eia(t)}`)}.`,why:`Le module vaut ${ecrit(rho)}. En divisant par le module, ${fx(`cos θ = ${ecrit(cs(c[0]))}`)} et ${fx(`sin θ = ${ecrit(cs(c[1]))}`)}, donc ${fx(`θ = ${angS(t)}`)}.`,pts:0.5},
    {w:`<b>D'après la proposition 6.1.4, l'angle orienté ([AB), [AC)), noté ${an("BAC")}, est l'argument de ce quotient : ${an("BAC")} ${fx(`= ${angS(t)} [2π]`)}.</b>`,why:`La mesure de l'angle ([AB), [AC)) est ${fx("arg((z_{C} − z_{A})/(z_{B} − z_{A}))")} : ${fx("z_{C}")} en haut, ${fx("z_{B}")} en bas.`,pts:0.5}];
  return {sig:"CA"+zt(A)+"|"+zt(B)+"|"+zt(C),q:`Soient A, B et C les points d'affixes ${affZ("A",A)}, ${affZ("B",B)} et ${affZ("C",C)}. Calcule ${fx("(z_{C} − z_{A})/(z_{B} − z_{A})")}, puis donne la mesure de l'angle orienté ${an("BAC")} = ([AB), [AC)) dans ]−π ; π].`,corps:RAPZ,
    texte:`A ${zt(A)}, B ${zt(B)}, C ${zt(C)} ; angle orienté BAC par le quotient`,nature:"angle par un quotient",champs:[champA("x","angle",`${an("BAC")} =`)],etapes:E,
    juge:jugeMod(t,E,[[mul(t,-1),1,"quotient à l'envers","Où ça part : le quotient.",`L'angle ([AB), [AC)) est l'argument de ${fx("(z_{C} − z_{A})/(z_{B} − z_{A})")}, avec z_C en haut. Le quotient à l'envers donne l'angle opposé.`]]),
    bonne:`${an("BAC")} ${fx(`= ${angS(t)} [2π]`)}`,bonneTxt:`BAC = ${angS(t)} [2π]`,repBonne:{x:tapeA(t)},repFausse:{x:tapeA(prin(add(t,Q(1,2))))},ens:{k:"ang",A:zF(A),B:zF(B),C:zF(C)}};}

function rotImage(R){let W,B;do{W=zr(R,-3,3);B=zr(R,-4,4);}while(zNul(W)||zEq(W,B));
  const t=R.choix(ANG3),e=EIA[brut(t)],d=zSub(B,W),ed=zMul(e,d),V=zAdd(ed,W);
  const E=[{w:`D'après la proposition 7.3.1, la rotation de centre Ω et d'angle α s'écrit ${fx("r(z) = e^{iα}(z − ω) + ω")}. Ici ${fx(`${eia(t)} = ${zt(e)}`)}, donc ${fx(`r(z) = ${facZ(e)}(z − ${zp(W)}) + ${zp(W)}`)}.`,why:`Le poly l'écrit ${fx("r(z) = e^{iα}z + w")}, avec ${fx("w = (1 − e^{iα})ω")} : c'est la même chose, développée. Et ${fx("e^{iα} = cos α + i sin α")}.`,pts:1},
    {w:`${fx(`z_{B} − ω = ${zt(B)} − ${zp(W)} = ${zt(d)}`)}, puis ${fx(`${facZ(e)}(${zt(d)}) = ${zt(ed)}`)}.`,why:egal(e.a,-1)?"Multiplier par −1, c'est faire un demi-tour : on change les deux signes.":"Multiplier par i fait tourner de π/2 : x + iy devient −y + ix. Multiplier par −i fait tourner de −π/2 : x + iy devient y − ix.",pts:1},
    {w:`<b>${fx(`z_{B′} = ${zt(ed)}${plusZ(W)} = ${zt(V)}`)}</b>`,why:"On n'oublie pas de rajouter ω : la rotation tourne autour de Ω, pas autour de l'origine.",pts:1}];
  return exoZ({nom:"z_{B′}",z:V,titre:"l'affixe de B′",sig:"CR"+zt(W)+"|"+brut(t)+"|"+zt(B),nature:"image par une rotation",texte:`rotation de centre ${zt(W)}, d'angle ${angS(t)} ; image de B ${zt(B)}`,
    q:`Soit r la rotation de centre Ω d'affixe ${fx("ω = "+zt(W))} et d'angle ${fx(angS(t))}. Donne l'expression complexe de r, puis l'affixe du point B′ = r(B), où ${affZ("B",B)}.`,etapes:E,
    pieges:[[zMul(e,B),0,"rotation autour de l'origine","Où ça part : le centre.",`${fx(`${facZ(e)}z_{B}`)} fait tourner B autour de l'origine. Ici le centre est Ω : on calcule ${fx("e^{iα}(z_{B} − ω) + ω")}.`],[ed,2,"ω pas rajouté","Où ça part : la dernière ligne.",`Après avoir tourné ${fx("z_{B} − ω")}, il faut rajouter ω pour revenir au point B′.`],[zAdd(zMul(zBar(e),d),W),1,"sens de rotation inversé","Où ça part : l'angle.",`L'angle est ${angS(t)}, donc ${fx(`${eia(t)} = ${zt(e)}`)}. L'angle opposé tourne dans l'autre sens.`]],
    ens:{k:"rot",W:zF(W),t:angV(t),B:zF(B)}});}

function natureZ(R){const k=R.choix(["tr","hom","hom","rot","rot"]);let W;do W=zr(R,-4,4);while(zNul(W));
  const Tr=v=>`la translation de vecteur d'affixe ${zt(v)}`,Ho=(c,l)=>`l'homothétie de centre le point d'affixe ${zt(c)} et de rapport ${nb(l)}`,Ro=(c,t)=>`la rotation de centre le point d'affixe ${zt(c)} et d'angle ${angS(t)}`;
  let a,b,E,O4,M,o;
  if(k==="tr"){a=Zc(1);b=W;
    O4={bon:Tr(b),opp:Tr(zNeg(b)),id:"l'identité : f ne déplace aucun point"};o={bon:{t:"tr",v:zF(b)},opp:{t:"tr",v:zF(zNeg(b))},id:{t:"tr",v:[0,0]}};
    M={opp:[1,"vecteur de signe contraire","Où ça part : le vecteur.",`${fx(`f(z) − z = ${zt(b)}`)} pour tout z : chaque point avance du vecteur d'affixe ${zt(b)}, pas de son opposé.`],id:[0,"translation prise pour l'identité","Où ça part : le coefficient de z.",`Le coefficient de z vaut 1, mais il reste ${fx(zt(b))} ≠ 0 : chaque point bouge, du même vecteur.`]};
    E=[{w:`Le coefficient de z vaut 1 : ${fx(`f(z) = z${plusZ(b)}`)}. D'après la proposition 7.1.1, f est une translation.`,why:"f(z) − z est le même nombre pour tout z : chaque point est déplacé du même vecteur.",pts:1.5},
      {w:`<b>f est ${Tr(b)}.</b>`,why:"Le vecteur de la translation a pour affixe le nombre ajouté à z. Ce n'est pas l'identité, puisque ce nombre n'est pas nul.",pts:1.5}];}
  else if(k==="hom"){const l=R.choix([2,3,-2,-3,Q(1,2),Q(-1,2),Q(3,2)].map(x=>q(x)));a=Zc(l);const den=sub(1,l);b=zMul(Zc(den),W);
    O4={bon:Ho(W,l),b:Ho(b,l),moins:Ho(zNeg(W),l),tr:Tr(b),rap:Ho(W,mul(l,-1))};o={bon:{t:"hom",c:zF(W),l:fl(l)},b:{t:"hom",c:zF(b),l:fl(l)},moins:{t:"hom",c:zF(zNeg(W)),l:fl(l)},tr:{t:"tr",v:zF(b)},rap:{t:"hom",c:zF(W),l:-fl(l)}};
    M={b:[1,"centre lu sur le terme constant","Où ça part : le centre.","Le nombre ajouté à λz n'est pas le centre : le centre est le point fixe, d'affixe w/(1 − λ)."],moins:[1,"signe du centre","Où ça part : le centre.",`Le centre vérifie ${fx("λz_{C} + w = z_{C}")}, donc ${fx("z_{C} = w/(1 − λ)")}, pas ${fx("w/(λ − 1)")}.`],tr:[0,"homothétie prise pour une translation","Où ça part : le coefficient de z.",`f est une translation seulement si le coefficient de z vaut 1. Ici il vaut ${nb(l)}.`],rap:[0,"rapport de signe contraire","Où ça part : le rapport.",`Le rapport est le coefficient de z, ${nb(l)}, avec son signe.`]};
    E=[{w:`${fx("f(z) = λz + w")} avec ${fx("λ = "+nb(l))} et ${fx("w = "+zt(b))}. λ est un réel différent de 1 : d'après la proposition 7.2.1, f est une homothétie de rapport ${nb(l)}.`,why:"f(z) = λz + w avec λ réel, λ ≠ 1 : c'est la forme d'une homothétie.",pts:1},
      {w:`Son centre C a pour affixe ${fx(`z_{C} = w/(1 − λ) = ${zp(b)}/${den.d===1&&den.n>0?nb(den):"("+nb(den)+")"} = ${zt(W)}`)}.`,why:`Le centre est le seul point fixe : ${fx("f(z_{C}) = z_{C}")}, soit ${fx("λz_{C} + w = z_{C}")}, d'où ${fx("z_{C} = w/(1 − λ)")}.`,pts:1},
      {w:`<b>f est ${Ho(W,l)}.</b>`,why:"On rassemble la nature, le centre et le rapport : ce sont les « éléments géométriques » demandés.",pts:1}];}
  else{const t=R.choix([Q(1,2),Q(-1,2)]);a=EIA[brut(t)];const u=zSub(Zc(1),a);b=zMul(u,W);
    O4={bon:Ro(W,t),sens:Ro(W,mul(t,-1)),b:Ro(b,t),moins:Ro(zNeg(W),t)};o={bon:{t:"rot",c:zF(W),g:angV(t)},sens:{t:"rot",c:zF(W),g:-angV(t)},b:{t:"rot",c:zF(b),g:angV(t)},moins:{t:"rot",c:zF(zNeg(W)),g:angV(t)}};
    M={sens:[0,"angle de signe contraire","Où ça part : l'angle.",`${fx(`${zt(a)} = ${eia(t)}`)} : l'angle est ${angS(t)}.`],b:[1,"centre lu sur le terme constant","Où ça part : le centre.",`Le nombre ajouté à ${fx("e^{iα}z")} n'est pas le centre : le centre est le point fixe, d'affixe ${fx("w/(1 − e^{iα})")}.`],moins:[1,"signe du centre","Où ça part : le centre.",`Le centre vérifie ${fx("e^{iα}z_{C} + w = z_{C}")}, donc ${fx("z_{C} = w/(1 − e^{iα})")}, pas ${fx("w/(e^{iα} − 1)")}.`]};
    E=[{w:`${fx("f(z) = e^{iα}z + w")} avec ${fx(`e^{iα} = ${zt(a)} = ${eia(t)}`)} et ${fx("w = "+zt(b))}. Ce nombre est de module 1 et différent de 1 : d'après la proposition 7.3.1, f est une rotation d'angle ${fx(angS(t))}.`,why:`${fx("f(z) = e^{iα}z + w")} avec ${fx("α ≠ 0")} [2π] : c'est la forme d'une rotation.`,pts:1},
      {w:`Son centre C a pour affixe ${fx(`z_{C} = w/(1 − e^{iα}) = ${zp(b)}/${zp(u)} = ${zt(W)}`)}.`,why:`Le centre est le seul point fixe : e^{iα}z_C + w = z_C. Pour diviser par ${zt(u)}, on multiplie en haut et en bas par son conjugué, ${zt(zBar(u))}.`,pts:1},
      {w:`<b>f est ${Ro(W,t)}.</b>`,why:"On rassemble la nature, le centre et l'angle : ce sont les « éléments géométriques » demandés.",pts:1}];}
  const ids=Object.keys(O4).filter((c,i,L)=>L.findIndex(d=>O4[d]===O4[c])===i),autre=ids.find(c=>c!=="bon");
  return {sig:"CN"+k+linZ(a,b),q:`Donne la nature et les éléments géométriques de l'application ${fx(`f : z ↦ ${linZ(a,b)}`)} de ℂ dans ℂ.`,corps:RAPZ,texte:`f(z) = ${linZ(a,b)} ; nature et éléments`,nature:{tr:"translation",hom:"homothétie",rot:"rotation"}[k],
    champs:[champC("x",null,R.mel(ids).map(c=>[c,maj(O4[c])]))],juge:jugeQ({x:"bon"},(id,v)=>M[v]||[0,"mauvaise transformation","Où ça part : la nature.","Regarde d'abord le coefficient de z : 1 pour une translation, un réel pour une homothétie, un nombre de module 1 pour une rotation."]),
    etapes:E,bonne:maj(O4.bon),bonneTxt:O4.bon,repBonne:{x:"bon"},repFausse:{x:autre},ens:{k:"nat",a:zF(a),b:zF(b),o:Object.fromEntries(ids.map(c=>[c,o[c]]))}};}

function compoRot(R){let W1,W2,t1,t2;do{W1=zr(R,-2,2);W2=zr(R,-2,2);t1=R.choix(ANG3);t2=R.choix(ANG3);}while(zEq(W1,W2)||fl(add(t1,t2))%2===0);
  const a1=EIA[brut(t1)],a2=EIA[brut(t2)],a=zMul(a1,a2),t=prin(add(t1,t2)),u1=zSub(Zc(1),a1),u2=zSub(Zc(1),a2),w1=zMul(u1,W1),w2=zMul(u2,W2),b=zAdd(zMul(a2,w1),w2),u=zSub(Zc(1),a),F=zDiv(b,u);
  const bInv=zAdd(zMul(a1,w2),w1);
  const E=[{w:`D'après la proposition 7.3.1, ${fx(`r_{1}(z) = ${linZ(a1,w1)}`)} et ${fx(`r_{2}(z) = ${linZ(a2,w2)}`)}.`,why:`Une rotation de centre ω et d'angle α s'écrit ${fx("e^{iα}z + w")}, avec ${fx("w = (1 − e^{iα})ω")} : ici ${fx(`${zp(u1)} × ${zp(W1)} = ${zt(w1)}`)} et ${fx(`${zp(u2)} × ${zp(W2)} = ${zt(w2)}`)}.`,pts:1},
    {w:`${fx(`R(z) = r_{2}(r_{1}(z)) = ${facZ(a2)}(${linZ(a1,w1)})${plusZ(w2)}`)} ${fx(`= ${linZ(a,b)}`)}.`,why:"On remplace z par r₁(z) dans l'expression de r₂ : d'abord r₁, puis r₂.",pts:1},
    {w:`Le coefficient de z est ${fx(`${zt(a)} = ${eia(t)}`)}, différent de 1 : R est la rotation d'angle ${fx(`${angS(t1)} ${t2.n<0?"−":"+"} ${angS(vabs(t2))} = ${angS(t)}`)} [2π] (proposition 7.3.1).`,why:"Les coefficients se multiplient, donc les angles s'ajoutent. Si la somme valait 0 [2π], R serait une translation.",pts:1},
    {w:`<b>Son centre F est son point fixe : ${fx(`z_{F} = ${zp(b)}/${zp(u)} = ${zt(F)}`)}</b>`,why:`${fx("R(z_{F}) = z_{F}")} donne ${fx("az_{F} + w = z_{F}")}, donc ${fx("z_{F} = w/(1 − a)")}. Pour diviser, on multiplie en haut et en bas par le conjugué de ${zt(u)}.`,pts:2}];
  return exoZ({nom:"z_{F}",z:F,titre:"l'affixe de F",sig:"CC"+zt(W1)+"|"+brut(t1)+"|"+zt(W2)+"|"+brut(t2),nature:"composée de rotations",texte:`r1 (${zt(W1)}, ${angS(t1)}), r2 (${zt(W2)}, ${angS(t2)}) ; centre de r2 ∘ r1`,
    q:`Soient A et B les points d'affixes ${affZ("A",W1)} et ${affZ("B",W2)}. On note ${fx("r_{1}")} la rotation de centre A et d'angle ${fx(angS(t1))}, ${fx("r_{2}")} celle de centre B et d'angle ${fx(angS(t2))}, et ${fx("R = r_{2} ∘ r_{1}")}. Montre que R est une rotation, puis donne l'affixe de son centre F.`,etapes:E,
    pieges:[[b,3,"division oubliée","Où ça part : le point fixe.",`Le nombre ajouté à ${fx("az")} n'est pas le centre : le centre vérifie ${fx("az_{F} + w = z_{F}")}, donc ${fx("z_{F} = w/(1 − a)")}.`],...(zNul(zAdd(Zc(1),a))?[]:[[zDiv(b,zAdd(Zc(1),a)),3,"1 + a au lieu de 1 − a","Où ça part : le point fixe.",`${fx("az_{F} + w = z_{F}")} donne ${fx("(1 − a)z_{F} = w")} : on divise par ${fx("1 − a")}.`]]),[zDiv(bInv,u),1,"ordre de la composée","Où ça part : l'ordre.","R = r₂ ∘ r₁ : on applique d'abord r₁, puis r₂. On remplace donc z par r₁(z) dans r₂, pas l'inverse."]],
    ens:{k:"comp",W1:zF(W1),t1:angV(t1),W2:zF(W2),t2:angV(t2)}});}

const RECITS=[
 {id:"GC1",t:"Démonstration : le théorème de Pythagore, sens direct",th:"pythagore",cc:6,lecons:["g2-pythagore"],
  q:"Question de cours du CC2 2024 (5 points avec la réciproque). Démontre l'implication directe du théorème de Pythagore : si un triangle ABC est rectangle en A, alors $BC^{2} = AB^{2} + AC^{2}$.",corps:"",
  l:[["Supposons que le triangle ABC soit rectangle en A. Soit H le pied de la hauteur issue de A.","On part de l'hypothèse, et on introduit le point qui sert à toute la démonstration : H est le point de (BC) tel que (AH) est perpendiculaire à (BC).",0.5],
   ["On note que H ∈ [BC], car les angles en B et C sont aigus. Cela assure $BH + HC = BC$.","Il faut que H soit entre B et C pour pouvoir additionner les deux longueurs à la dernière ligne.",0.5],
   ["Les triangles ACB et HAB sont semblables, car ils ont tous deux un angle droit et partagent l'angle en B.","Deux angles égaux suffisent. L'ordre des lettres dit quels sommets se correspondent : A et H (les angles droits), C et A, B et B.",0.5],
   ["Le théorème 2.6.2 implique alors $BC/BA = BA/BH$, d'où $AB^{2} = BC · BH$.","Dans deux triangles semblables, les côtés qui se correspondent sont proportionnels. On finit par un produit en croix.",0.5],
   ["On montre de même que $AC^{2} = BC · HC$.","Même raisonnement avec les triangles ABC et HAC, qui ont un angle droit et partagent l'angle en C.",0.5],
   ["On a donc $AB^{2} + AC^{2} = BC · (BH + HC) = BC^{2}$.","On additionne les deux égalités, on met BC en facteur, et on utilise BH + HC = BC de la deuxième ligne.",0.5]]},
 {id:"GC2",t:"Démonstration : la réciproque du théorème de Pythagore",th:"pythagore",cc:6,lecons:["g2-pythagore"],
  q:"Question de cours du CC2 2024 (5 points avec le sens direct). Démontre l'implication réciproque du théorème de Pythagore : si un triangle ABC satisfait $BC^{2} = AB^{2} + AC^{2}$, alors il est rectangle en A.",corps:"<p>Tu peux utiliser le sens direct, qui est déjà démontré.</p>",
  l:[["Supposons $BC^{2} = AB^{2} + AC^{2}$. On considère un point C′ sur la perpendiculaire à (AB) passant par A, tel que $AC′ = AC$.","L'idée : fabriquer un deuxième triangle, ABC′, qui est rectangle en A par construction et qui a les mêmes côtés AB et AC.",1],
   ["On a alors $BC^{2} = AB^{2} + AC^{2} = AB^{2} + AC′^{2} = BC′^{2}$, où la troisième égalité s'obtient par la première implication appliquée au triangle rectangle ABC′.","Le sens direct s'applique au triangle ABC′, puisqu'il est rectangle en A. Il faut le dire : c'est la justification que le correcteur cherche.",1],
   ["Il s'ensuit que $BC′ = BC$.","Deux longueurs qui ont le même carré sont égales, puisqu'une longueur est positive.",0.5],
   ["Les triangles ABC et ABC′ ayant de plus le côté [AB] en commun, ils sont donc isométriques.","Leurs trois côtés sont égaux deux à deux : AB est commun, AC = AC′ par construction, BC = BC′ par la ligne précédente.",0.5],
   [`Leurs angles en A sont donc égaux : |${an("BAC")}| = |${an("BAC′")}| = π/2, ce qui prouve que ABC est rectangle en A.`,"Deux triangles isométriques ont les mêmes angles, et l'angle en A de ABC′ est droit par construction.",0.5]]},
 {id:"GC3",t:"Démonstration : le théorème de l'aire",th:"aire",cc:4,lecons:["g2-aire-alkashi"],
  q:"Question de cours du CC2 2025 (2 points). Soit ABC un triangle du plan. On note a = BC, b = AC et c = AB. Montre que Aire(ABC) = ½ ab sin(Ĉ).",corps:"",
  l:[["Soit H le pied de la hauteur issue de A.","Toute la démonstration tient dans ce point : H est le point de (BC) tel que (AH) est perpendiculaire à (BC).",0.5],
   ["Par définition, Aire(ABC) = ½ AH · BC.","C'est « base × hauteur / 2 », avec la base [BC] et la hauteur AH.",0.5],
   ["Or AH = AC sin(|Ĉ|).","Dans le triangle AHC, rectangle en H, le sinus de l'angle en C est le côté opposé AH divisé par l'hypoténuse AC. Le poly n'écrit pas cette justification, mais elle rassure le correcteur.",0.5],
   ["D'où Aire(ABC) = ½ BC · AC sin(|Ĉ|) = ½ ab sin(|Ĉ|).","On remplace AH, puis on écrit BC = a et AC = b.",0.5]]},
 {id:"GC4",t:"Démonstration : le théorème de l'angle au centre",th:"centre",cc:8,lecons:["g2-angle-centre"],
  q:`Question de cours du CC2 2025 (3 points). Soient C un cercle de centre O et A, B ∈ C deux points distincts. Soit M ∈ C ∖ {A, B}. Montre que ${an("AOB")} = 2${an("AMB")} [2π].`,corps:"<p>Les angles sont orientés, et les égalités sont vraies à 2π près.</p>",
  l:[["On suppose que M ∈ C. Alors le triangle AMO est isocèle en O.","A et M sont sur le cercle de centre O : OA = OM, ce sont deux rayons.",0.5],
   [`En considérant la somme de ses angles, on obtient ${an("AOM")} + 2${an("OMA")} = π, ou encore ${an("AOM")} = π − 2${an("OMA")}.`,"Dans un triangle isocèle en O, les deux angles à la base sont égaux : la somme des trois angles s'écrit avec deux fois le même.",0.5],
   [`De même, comme BMO est isocèle en O, on a ${an("BOM")} = π − 2${an("OMB")}.`,"Même raisonnement avec B à la place de A.",0.5],
   [`On en déduit ${an("AOB")} = ${an("AOM")} + ${an("MOB")} = ${an("AOM")} − ${an("BOM")}`,"Relation de Chasles pour les angles orientés, puis MOB = −BOM : changer le sens d'un angle orienté change son signe.",0.5],
   [`= π − 2${an("OMA")} − (π − 2${an("OMB")}) = 2${an("AMO")} + 2${an("OMB")}`,"On remplace les deux angles par ce qu'on a trouvé. Les π disparaissent, et −OMA = AMO.",0.5],
   [`= 2${an("AMB")}.`,"Relation de Chasles encore : AMO + OMB = AMB.",0.5]]},
 {id:"GC5",t:"Énoncés à connaître : Al-Kashi, le théorème de l'aire, l'angle au centre",th:"aire",cc:5,lecons:["g2-aire-alkashi"],
  q:"Questions de cours, comme la question (1) du CC2 2025 (1 point par énoncé). Écris de mémoire ces trois énoncés du poly.",corps:"<ol><li>Le théorème d'Al-Kashi.</li><li>Le théorème de l'aire.</li><li>Le théorème de l'angle au centre.</li></ol>",
  l:[[`1. Soit ABC un triangle, alors BC² = AB² + AC² − 2 AC · AB cos(${an("BAC")}).`,"Théorème 4.3.1. Un énoncé commence par ses hypothèses : « Soit ABC un triangle ». Avec a = BC, b = AC, c = AB, c'est a² = b² + c² − 2bc cos(Â).",1],
   ["2. Soit ABC un triangle du plan. On note a = BC, b = AC, c = AB. L'aire de ABC est donnée par Aire(ABC) = ½ ab sin(|Ĉ|) = ½ ac sin(|B̂|) = ½ bc sin(|Â|).","Théorème 4.2.6 : la moitié du produit de deux côtés par le sinus de l'angle qu'ils forment.",1],
   [`3. Soient C un cercle de centre O et A, B ∈ C deux points distincts. Soit M ∈ P ∖ {A, B}. Alors M ∈ C si et seulement si ${an("AOB")} = 2${an("AMB")} [2π].`,"Théorème 5.2.1. C'est une équivalence : le « si et seulement si » fait partie de l'énoncé, et l'égalité est entre angles orientés, à 2π près.",1]]},
 {id:"GC6",t:"Définitions à connaître : translation, homothétie, rotation, produit scalaire",th:"transfo",cc:6,lecons:["g2-transfo","g2-rotation-scalaire"],
  q:"Questions de cours, comme la question (2) du CC2 2025 (1 point par définition). Écris de mémoire ces quatre définitions du poly.",corps:`<ol><li>La translation de vecteur ${ve("u")}.</li><li>L'homothétie de centre A et de rapport λ.</li><li>La rotation de centre Z et d'angle α.</li><li>Le produit scalaire de deux vecteurs ${ve("u")} et ${ve("v")}.</li></ol>`,
  l:[[`1. La translation t de vecteur ${ve("u")} est l'application t : P → P où t(M) est l'unique point M′ ∈ P tel que ${ve("MM′")} = ${ve("u")}.`,"Définition 3.3.1. Une définition d'application dit d'où elle part, où elle arrive (de P dans P) et ce qu'elle fait d'un point M.",1],
   [`2. Soit A ∈ P et λ ∈ ℝ. L'homothétie h de centre A et de rapport λ est l'application h : P → P qui à un point M du plan associe l'unique point h(M) tel que ${ve("Ah(M)")} = λ${ve("AM")}.`,"Définition 3.3.3. L'égalité est entre vecteurs : elle dit à la fois la direction, le sens (selon le signe de λ) et la longueur.",1],
   [`3. Soit Z ∈ P et α ∈ ℝ/2πℤ. La rotation de centre Z et d'angle α est l'application r : P → P qui à tout point M associe l'unique point r(M) tel que ZM = Zr(M) et ${an("MZr(M)")} = α.`,"Définition 4.5.1. Deux conditions : la distance au centre ne change pas, et l'angle orienté de M vers son image vaut α. Pour M = Z, on a r(Z) = Z.",1],
   [`4. Le produit scalaire entre deux vecteurs ${ve("u")} et ${ve("v")} est le nombre réel ⟨${ve("u")}, ${ve("v")}⟩ = ‖${ve("u")}‖ · ‖${ve("v")}‖ · cos(angle(${ve("u")}, ${ve("v")})).`,"Définition 4.6.2. C'est un nombre, pas un vecteur : le produit des deux normes par le cosinus de l'angle entre les vecteurs.",1]]}];

G.add("geo",[
 {id:"GE1",t:"Pythagore, Al-Kashi, aire ½ ab sin Ĉ",tache:"Pythagore, Al-Kashi et aire",th:"aire",pts:3,ex:"cc2",lecons:["g2-aire-alkashi","g2-pythagore"],
  paliers:[
   {t:"Pythagore et sa réciproque",cc:3,gen:pythagore},
   {t:"Al-Kashi : un côté, avec deux côtés et l'angle entre eux",cc:4,gen:alKashi},
   {t:"le cosinus d'un angle, puis l'angle, avec les trois côtés",cc:5,gen:troisCotes},
   {t:"l'aire, puis une hauteur",cc:5,min:200,gen:aireHauteur},
   {t:"comme au CC : une bissectrice, une médiane, deux étapes",cc:9,gen:R=>{const r=R();return r<0.5?bissectrice(R):r<0.75?deuxTemps(R):mediane(R);}}]},
 {id:"GE2",t:"Translations et homothéties",tache:"translations et homothéties",th:"transfo",ex:"cc2",lecons:["g2-transfo"],
  paliers:[
   {t:"les translations",cc:2,min:200,gen:translations},
   {t:"l'image d'une longueur",cc:2,min:200,gen:imageLongueur},
   {t:"le rapport et son signe",cc:3,min:200,gen:rapport},
   {t:"deux homothéties de même centre",cc:3,min:200,gen:deuxHom},
   {t:"une homothétie composée avec une translation",cc:4,min:200,gen:homTrans},
   {t:"comme au CC : deux droites sécantes et des parallèles",cc:8,gen:droitesPar}]},
 {id:"GE5",t:"Trigonométrie, rotations, produit scalaire",tache:"trigonométrie, rotations et produit scalaire",th:"rotation",ex:"cc2",lecons:["g2-trigo","g2-rotation-scalaire"],
  paliers:[
   {t:"les valeurs à connaître",cc:1,min:15,gen:remarquable},
   {t:"passer du cosinus au sinus",cc:2,min:150,gen:passer},
   {t:"formules d'addition et angle double",cc:4,min:120,gen:addition},
   {t:"les rotations",cc:4,min:150,gen:rotations},
   {t:"produit scalaire et angle entre deux vecteurs",cc:5,gen:produit}]},
 {id:"GE4",t:"Angle au centre, angle inscrit",tache:"angle au centre et angle inscrit",th:"centre",ex:"cc2",lecons:["g2-angle-centre"],
  paliers:[
   {t:"angle au centre et angle inscrit",cc:2,min:45,gen:centreInscrit},
   {t:"le triangle isocèle au centre",cc:3,min:45,gen:isoCentre},
   {t:"quadrilatère inscrit",cc:3,gen:quadInscrit},
   {t:"comme au CC : plusieurs propriétés à la suite",cc:5,min:150,gen:chasseCercle}]},
 {id:"GE3",t:"Triangles : chasse aux angles",tache:"angles dans les triangles",th:"triangles",ex:"cc2",lecons:["g-aires","g-paralleles","g-angles"],
  paliers:[
   {t:"la somme des angles d'un triangle",cc:2,gen:somme},
   {t:"le triangle isocèle",cc:3,gen:isocele},
   {t:"parallèles et angles alternes-internes",cc:3,min:200,gen:paralleles},
   {t:"comme au CC : une figure à plusieurs triangles",cc:5,min:200,gen:plusieurs}]},
 {id:"GE7",t:"Triangles isométriques : les bons triangles, le bon cas",tache:"triangles isométriques",th:"triangles",ex:"cc2",lecons:["g2-bases"],
  paliers:[
   {t:"médiane, médiatrice, hauteur, bissectrice",cc:1,min:150,gen:droitesTri},
   {t:"le cas d'isométrie, et ce qu'on en déduit",cc:2,gen:casIso},
   {t:"choisir les deux triangles",cc:3,min:70,gen:bonsTriangles},
   {t:"comme au CC : la démonstration, sur papier",cc:8,min:8,gen:papierTri}]},
 {id:"GE8",t:"Inégalité triangulaire",tache:"inégalité triangulaire",th:"triangles",ex:"cc2",lecons:["g2-bases"],
  paliers:[
   {t:"possible ou pas, aligné ou pas",cc:1,min:200,gen:itBase},
   {t:"écrire la bonne inégalité",cc:2,min:200,gen:itEcrire},
   {t:"le plan d'une démonstration",cc:3,min:60,gen:itCompleter},
   {t:"comme au CC : la démonstration, sur papier",cc:6,min:10,gen:itPapier}]},
 {id:"GE9",t:"Nombres complexes et géométrie",tache:"nombres complexes en géométrie",th:"complexes",ex:"ccf",lecons:[],
  paliers:[
   {t:"le milieu, le quatrième sommet d'un parallélogramme",cc:2,gen:milieuPara},
   {t:"une distance : AB = |z_B − z_A|",cc:2,gen:distanceZ},
   {t:"l'angle avec un quotient",cc:3,gen:angleQuot},
   {t:"l'image par une rotation",cc:3,gen:rotImage},
   {t:"la nature de z ↦ az + b",cc:3,min:200,gen:natureZ},
   {t:"comme au CC : le centre d'une composée de rotations",cc:5,gen:compoRot}]}
].concat(RECITS.map(r=>({id:r.id,t:r.t,th:r.th,ex:"cc2",fixe:true,seuil:1,pages:[],lecons:r.lecons,paliers:[{t:"à écrire de mémoire, sur papier",cc:r.cc,gen:recit("F"+r.id,r.q,r.corps,r.l)}]}))));
})();
