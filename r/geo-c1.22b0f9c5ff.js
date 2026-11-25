/* Chapitre 1 : les axiomes et les premières définitions */
(function(){
const {V,D,R,d,dpx,fl,fa,fr,ang,absang,mid,proj,param,inter,sym,rot,side,onLine,onSeg,onRay,onCircle,snapLine,near,parallel,unit,add,sub,mul,lerp,segInter,PI}=G;
const an=s=>`<span class="ang">${s}</span>`, m=s=>`<span class="m">${s}</span>`, hl=s=>`<span class="hl">${s}</span>`;
const C=window.CONCEPTS;
const push=o=>{o.ch=1;C.push(o);};
const yes=(b,t1,t2)=>b?`<span class="ok">${t1||"oui"}</span>`:`<span class="no">${t2||"non"}</span>`;

/* ---------------- Axiome I ---------------- */
push({id:"axiome-1",type:"ax",ref:"Axiome I",t:"Une seule droite par deux points",
 plain:`Pose ta règle sur deux points différents : tu ne peux tracer qu'${hl("une seule droite")} qui passe par les deux. On la note ${m("(AB)")}, avec des parenthèses.`,
 fig:()=>({w:560,h:320,P:{A:[170,210],B:[380,130],T:[430,250]},labels:{T:"T"},
   con:{T:(p,P)=>snapLine(p,P.A,P.B,10)},
   draw:(P)=>{const on=dpx(P.T,proj(P.T,P.A,P.B))<0.5;
     return D.line(P.A,P.B,"l-cob")+(on?"":D.line(P.A,P.T,"l-amb"))+(on?D.txt(V(20,30),"La deuxième droite se confond avec (AB)","t-cob t-up"):D.txt(V(20,30),"Ta droite passe par A, mais pas par B","t-amb t-up"));},
   info:(P)=>{const on=dpx(P.T,proj(P.T,P.A,P.B))<0.5;return R.m([["AB",fl(P.A,P.B)]])+R.v(on?"Ta droite (AT) passe par A et B : c'est (AB) elle-même.":"La droite orange passe par A et T. Pour qu'elle passe aussi par B, il faut qu'elle soit (AB).",on?"ok":"");},
   goal:{text:"fais passer une deuxième droite, différente de (AB), par A et B. Déplace T.",ok:(P)=>dpx(P.T,proj(P.T,P.A,P.B))<0.5,win:"impossible : dès qu'elle passe par A et B, c'est la même droite. C'est l'axiome I."},
   hint:"Déplace A, B et T."}),
 formal:`<p><b>Axiome I.</b> Si A et B sont deux points distincts du plan, alors il existe une et une seule droite qui passe par A et B.</p><p>On la note ${m("(AB)")}. La notation n'a pas de sens si A = B.</p>`,
 gloss:["(AB) : la droite qui passe par A et B","« distincts » : A ≠ B"],
 use:`<p>Pour montrer que deux droites sont égales, trouve ${hl("deux points distincts")} qui sont sur les deux. C'est exactement la démo 1.1.1.</p><p>Chaque fois que tu écris ${m("(AB)")} dans une copie, vérifie que A ≠ B.</p>`,
 trap:`Par un seul point passent une infinité de droites. « La droite passant par A » ne désigne rien de précis.`,
 q:"Pourquoi la notation (AA) n'a-t-elle pas de sens ?",a:"L'axiome I demande deux points distincts. Par un seul point A passent une infinité de droites, donc « la » droite (AA) n'existe pas.",
 rel:["points-alignes","deux-droites","demo-1-1-1"]});

/* ---------------- Points alignés ---------------- */
push({id:"points-alignes",type:"def",ref:"§1.1 et TD 1.1",t:"Points alignés",
 plain:`Des points sont alignés quand ${hl("une même droite les contient tous")}. Avec trois points, on peut le lire sur les distances : la plus grande est la somme des deux autres.`,
 fig:()=>({w:560,h:320,P:{A:[120,230],B:[300,170],C:[420,90]},
   con:{C:(p,P)=>snapLine(p,P.A,P.B,9)},
   draw:(P)=>{const al=dpx(P.C,proj(P.C,P.A,P.B))<0.5;return D.line(P.A,P.B,al?"l-cob":"l-thin")+(al?"":D.pline([P.A,P.C,P.B],"l-cons"));},
   info:(P)=>{const ab=d(P.A,P.B),ac=d(P.A,P.C),bc=d(P.B,P.C),L=[["AB",ab],["AC",ac],["BC",bc]].sort((x,y)=>y[1]-x[1]);
     const al=dpx(P.C,proj(P.C,P.A,P.B))<0.5;
     return R.m([["AB",fr(ab)],["AC",fr(ac)],["BC",fr(bc)],[L[1][0]+" + "+L[2][0],fr(L[1][1]+L[2][1])]])+R.v(al?`Alignés : la plus grande distance, ${L[0][0]} = ${fr(L[0][1])}, est la somme des deux autres (axiome III d).`:`Pas alignés : ${L[0][0]} = ${fr(L[0][1])} est plus petit que ${L[1][0]} + ${L[2][0]}.`,al?"ok":"");},
   goal:{text:"aligne C avec A et B.",ok:(P)=>dpx(P.C,proj(P.C,P.A,P.B))<0.5,win:"une seule droite contient A, B et C, et (AC) = (BC) (TD 1.1)."}}),
 formal:`<p>Des points du plan sont <b>alignés</b> s'il existe une droite qui les contient tous.</p><p><b>TD 1.1.</b> Si C ≠ A et C ≠ B : A, B, C sont alignés ⇔ (AC) = (BC).</p><p><b>Axiome III (d).</b> A, B, C sont alignés ⇔ le plus grand des trois nombres AB, AC, BC est la somme des deux autres.</p>`,
 use:`<p>Deux façons de prouver un alignement : montrer qu'un point est sur la droite qui passe par les deux autres, ou montrer une égalité du type ${m("AC = AB + BC")} (axiome III d).</p>`,
 trap:`« Ils ont l'air alignés sur la figure » n'est jamais une preuve. Ta figure peut être fausse de un millimètre.`,
 q:"AB = 3, BC = 5 et AC = 8. Que peux-tu dire de A, B, C ?",a:"AC = AB + BC : la plus grande distance est la somme des deux autres, donc A, B, C sont alignés (axiome III d), et B est entre A et C (B ∈ [AC]).",
 rel:["axiome-1","axiome-3","segment"]});

/* ---------------- Deux droites ---------------- */
push({id:"deux-droites",type:"th",ref:"Prop 1.1.1 et définitions",t:"Deux droites : sécantes, parallèles ou confondues",
 plain:`Deux droites n'ont que trois façons de se placer : elles ne se touchent pas, elles se croisent en ${hl("un seul point")}, ou elles sont la même droite. Attention : dans ce cours, deux droites confondues comptent comme ${hl("parallèles")}.`,
 fig:()=>({w:560,h:330,P:{A:[90,250],B:[470,200],C:[120,90],D:[460,150]},
   buttons:[{label:"Rendre parallèles",act:(P)=>{const u=sub(P.B,P.A),L=dpx(P.C,P.D);P.D=add(P.C,mul(unit(u),L));}},
            {label:"Confondre",act:(P)=>{P.C=lerp(P.A,P.B,0.25);P.D=lerp(P.A,P.B,0.8);}}],
   draw:(P)=>{const par=parallel(P.A,P.B,P.C,P.D,0.004);const same=par&&dpx(P.C,proj(P.C,P.A,P.B))<0.6;
     let s=D.line(P.A,P.B,"l-cob")+D.line(P.C,P.D,same?"l-cob-d":"l-amb");
     s+=D.txt(add(P.A,V(-30,20)),"Δ","t-cob")+D.txt(add(P.C,V(-30,-12)),"Δ′","t-amb");
     if(!par){const I=inter(P.A,P.B,P.C,P.D);if(I)s+=D.dot(I,"p-red",5.5);}
     return s;},
   info:(P)=>{const par=parallel(P.A,P.B,P.C,P.D,0.004),same=par&&dpx(P.C,proj(P.C,P.A,P.B))<0.6;
     return same?R.v("Cas (iii) : Δ = Δ′. Elles sont confondues, donc aussi parallèles.","ok"):par?R.v("Cas (i) : Δ ∩ Δ′ = ∅. Elles sont parallèles (et distinctes).","info"):R.v("Cas (ii) : un seul point commun, en rouge. Elles sont sécantes.");},
   goal:{text:"sans les boutons, rends Δ′ parallèle à Δ (cas i).",ok:(P)=>parallel(P.A,P.B,P.C,P.D,0.004)&&dpx(P.C,proj(P.C,P.A,P.B))>=0.6,win:"plus aucun point rouge : Δ ∩ Δ′ = ∅."},
   con:{D:(p,P)=>{const Q=add(P.C,sub(P.B,P.A));return snapLine(p,P.C,Q,7);}},
   hint:"Déplace les 4 points, ou utilise les boutons."}),
 formal:`<p><b>Proposition 1.1.1.</b> Soient Δ et Δ′ deux droites. Alors (i) soit Δ ∩ Δ′ est vide, (ii) soit Δ ∩ Δ′ contient exactement un point, (iii) soit Δ = Δ′.</p><p>Cas (ii) : <b>sécantes</b>. Cas (iii) : <b>confondues</b>. Cas (i) ou (iii) : <b>parallèles</b>, noté Δ // Δ′.</p>`,
 gloss:["Δ ∩ Δ′ : les points communs aux deux droites","∅ : l'ensemble vide","// : parallèles"],
 use:`<p>Quand tu dois montrer que deux droites sont égales, cherche deux points communs distincts. Quand tu dois montrer qu'elles sont parallèles, tu as le droit au cas « confondues ».</p>`,
 trap:`Dans ce cours, deux droites confondues sont parallèles. Et si tu essaies de faire passer Δ′ par A et B, elle se confond avec Δ : c'est toute la démo 1.1.1.`,
 q:"Deux droites ont deux points communs distincts. Que peux-tu en conclure ?",a:"Elles sont confondues : chacune est la droite passant par ces deux points (axiome I). C'est le cas (iii) de la Prop 1.1.1.",
 rel:["demo-1-1-1","axiome-2"]});

/* ---------------- Démo 1.1.1 ---------------- */
push({id:"demo-1-1-1",type:"demo",ref:"Proposition 1.1.1",t:"Démo : intersection de deux droites",
 plain:`Deux droites ont 0 point commun, 1 point commun, ou bien elles sont égales. La preuve tient en une idée : ${hl("deux points communs suffisent")} pour que les droites soient égales, à cause de l'axiome I.`,
 hyp:"Δ et Δ′ sont deux droites du plan.",concl:"Δ ∩ Δ′ est vide, ou contient exactement un point, ou Δ = Δ′.",
 idea:`Si les droites ont deux points communs A ≠ B, l'axiome I les force toutes les deux à être (AB).`,
 fig:()=>({w:560,h:300,P:{A:[170,200],B:[390,120]},S:{step:0},hint:"Déplace A et B : les deux droites restent collées.",
   draw:(P,S)=>{const k=S.step;let s="";
     if(k===0){s+=D.line(V(80,260),V(480,60),"lk1")+D.line(V(60,120),V(500,250),"lk2")+D.dot(inter(V(80,260),V(480,60),V(60,120),V(500,250)),"p-red",5)+D.txt(V(20,30),"Cas (ii) : un point commun","t-mut t-up");return s;}
     s+=D.line(P.A,P.B,"lk1");
     if(k>=3)s+=D.line(P.A,P.B,"lk2d");
     if(k>=2)s+=D.txt(V(20,30),k>=4?"Δ = (AB) = Δ′ : une seule droite":k>=3?"Δ′ passe aussi par A et B : Δ′ = (AB)":"Δ passe par A et B : Δ = (AB)","t-cob t-up");
     if(k===1)s+=D.txt(V(20,30),"Δ et Δ′ ont deux points communs A et B","t-mut t-up");
     return s;},
   hide:(k,P,S)=>S.step===0}),
 steps:[
  {w:"Si Δ ∩ Δ′ est vide, on est dans le cas (i). S'il contient exactement un point, on est dans le cas (ii).",why:"Ces deux cas n'ont rien à démontrer : ce sont exactement les cas (i) et (ii)."},
  {w:"Sinon, Δ ∩ Δ′ contient deux points distincts A et B.",why:"« Ni vide, ni un seul point » veut dire « au moins deux points »."},
  {w:"La droite Δ contient A et B. D'après l'axiome I, Δ = (AB).",why:"Il n'existe qu'une seule droite passant par deux points distincts."},
  {w:"De même, Δ′ contient A et B, donc Δ′ = (AB).",why:"Même argument : l'axiome I appliqué à Δ′."},
  {w:"Donc Δ = Δ′ : on est dans le cas (iii).",why:"Deux choses égales à une même troisième, (AB), sont égales entre elles."}],
 redac:`<p>Si Δ ∩ Δ′ est vide, (i) est vérifié. S'il contient un seul point, (ii) est vérifié.</p><p>Supposons maintenant que Δ ∩ Δ′ contient deux points distincts A et B. Par définition de l'intersection, la droite Δ contient A et B. D'après l'axiome I, Δ = (AB). De la même manière, Δ′ contient A et B, donc Δ′ = (AB). On en déduit Δ = Δ′ : le cas (iii) est vérifié.</p>`,
 rel:["axiome-1","deux-droites"]});

/* ---------------- Axiome II ---------------- */
push({id:"axiome-2",type:"ax",ref:"Axiome II (Euclide)",t:"Une seule parallèle par un point",
 plain:`Prends une droite Δ et un point M. Parmi toutes les droites qui passent par M, ${hl("une seule ne coupe pas Δ")} (ou se confond avec elle) : c'est la parallèle à Δ passant par M.`,
 fig:()=>({w:560,h:330,P:{A:[80,250],B:[480,220],M:[260,110],T:[420,70]},labels:{T:"T"},
   con:{T:(p,P)=>{const Q=add(P.M,sub(P.B,P.A));return snapLine(p,P.M,Q,10);}},
   draw:(P)=>{const Q=add(P.M,sub(P.B,P.A));const par=dpx(P.T,proj(P.T,P.M,Q))<0.5;
     let s=D.line(P.A,P.B,"l-ink")+D.txt(add(P.A,V(-20,22)),"Δ","t-mut");
     if(par)s+=D.line(P.M,Q,"l-cob");else{s+=D.line(P.M,P.T,"l-amb");const I=inter(P.M,P.T,P.A,P.B);if(I)s+=D.dot(I,"p-red",5.5)+D.lab(I,"coupe Δ ici",P.M,"t-red t-up",22);}
     return s;},
   info:(P)=>{const Q=add(P.M,sub(P.B,P.A));const par=dpx(P.T,proj(P.T,P.M,Q))<0.5;return R.v(par?"(MT) ne coupe pas Δ : c'est LA parallèle à Δ passant par M.":"(MT) passe par M mais coupe Δ (point rouge). Ce n'est pas une parallèle.",par?"ok":"");},
   goal:{text:"tourne la droite orange autour de M (déplace T) jusqu'à ce qu'elle ne coupe plus Δ.",ok:(P)=>{const Q=add(P.M,sub(P.B,P.A));return dpx(P.T,proj(P.T,P.M,Q))<0.5;},win:"il n'y a qu'une position qui marche : la parallèle est unique."}}),
 formal:`<p><b>Axiome II.</b> Soient Δ une droite et M un point du plan. Alors il existe une unique droite parallèle à Δ contenant le point M.</p>`,
 use:`<p>C'est l'argument d'${hl("unicité")} le plus utilisé du chapitre 2 : si deux droites sont parallèles à Δ et passent par le même point, elles sont égales. Il sert dans les démos 2.2.4, 2.3.1, dans la réciproque de Thalès, et dans le TD 1.3.</p>`,
 trap:`L'unicité de la perpendiculaire passant par un point n'est pas un axiome : c'est le corollaire 2.3.2, qui se démontre.`,
 q:"Δ₁ et Δ₂ sont parallèles à Δ et passent toutes les deux par M. Que peux-tu dire ?",a:"Δ₁ = Δ₂, par l'unicité dans l'axiome II.",
 rel:["deux-droites","td-paralleles","demo-2-2-4"]});

/* ---------------- Axiome III ---------------- */
push({id:"axiome-3",type:"ax",ref:"Axiome III",t:"La distance et ses 5 règles",
 plain:`La distance ${m("AB")} est la longueur du trajet en ligne droite de A à B. Les cinq règles disent ce qu'on attend d'une distance : ${hl("faire un détour ne raccourcit jamais")}, et le détour ne coûte rien seulement si on reste sur le segment.`,
 fig:()=>[{w:560,h:300,P:{A:[110,220],B:[450,200],M:[280,90]},
   con:{M:(p,P)=>{const q=onSeg(p,P.A,P.B);return dpx(p,q)<8?q:p;}},
   draw:(P)=>{const eq=dpx(P.M,onSeg(P.M,P.A,P.B))<0.5;return D.seg(P.A,P.B,"l-cob")+D.seg(P.A,P.M,eq?"l-ok":"l-amb")+D.seg(P.M,P.B,eq?"l-ok":"l-amb")+D.len(P.A,P.B,"t-cob",18);},
   info:(P)=>{const eq=dpx(P.M,onSeg(P.M,P.A,P.B))<0.5,s=d(P.A,P.M)+d(P.M,P.B);return R.h("(a) inégalité triangulaire")+R.m([["AB",fl(P.A,P.B)],["AM + MB",fr(s)]])+R.v(eq?"Égalité : M est sur [AB], et A, M, B sont alignés (d).":`AB ≤ AM + MB : le détour par M coûte ${fr(s-d(P.A,P.B))}.`,eq?"ok":"");},
   goal:{text:"trouve une position de M où le détour ne coûte rien.",ok:(P)=>dpx(P.M,onSeg(P.M,P.A,P.B))<0.5,win:"M est sur le segment [AB]. C'est l'idée de la définition du segment."}},
  {w:560,h:260,P:{A:[280,130],B:[420,80]},S:{lam:2.5},labels:{A:"A",B:"(direction)"},
   sliders:[{k:"lam",label:"λ =",min:0.5,max:5,step:0.1,fmt:v=>fr(v,1)}],
   draw:(P,S)=>{const u=unit(sub(P.B,P.A)),r=S.lam*40,M1=add(P.A,mul(u,r)),M2=add(P.A,mul(u,-r));
     return D.line(P.A,P.B,"l-thin")+D.circ(P.A,r,"l-cons")+D.seg(P.A,M1,"l-cob")+D.seg(P.A,M2,"l-amb")+D.pt(M1,"M₁",P.A,"p-cob","t-cob")+D.pt(M2,"M₂",P.A,"p-cob","t-cob");},
   info:(P,S)=>R.h("(e) points à distance λ de A")+R.m([["AM₁",fr(S.lam)],["AM₂",fr(S.lam)]])+R.v("Exactement deux points de la droite, un de chaque côté de A.","info"),
   hint:"Change λ avec le curseur, tourne la droite avec le 2e point."}],
 formal:`<p><b>Axiome III.</b> Il existe une application d : P × P → ℝ₊ (on note AB = d(A, B)) telle que :</p><ul><li>(a) AB ≤ AM + MB pour tous A, B, M (inégalité triangulaire) ;</li><li>(b) AB = BA (symétrie) ;</li><li>(c) AB = 0 ⇔ A = B (séparation) ;</li><li>(d) A, B, C sont alignés ⇔ le plus grand des nombres AB, AC, BC est la somme des deux autres ;</li><li>(e) si A ∈ Δ, pour tout λ > 0, il existe ${hl("exactement deux")} points M de Δ tels que AM = λ.</li></ul>`,
 gloss:["AB : un nombre positif, la distance","ℝ₊ : les réels positifs ou nuls","λ : lettre grecque « lambda », un nombre"],
 use:`<p>(a) pour comparer des longueurs. (d) pour prouver un alignement, ou pour savoir quel point est entre les deux autres. (e) pour ${hl("l'unicité")} d'un point sur une demi-droite à distance donnée : démos 2.2.1, 2.1.2 et réciproque de Thalès.</p>`,
 trap:`(e) donne deux points sur la droite, donc un seul sur chaque demi-droite d'origine A. C'est la version « demi-droite » qu'on utilise dans les démos.`,
 q:"Sur la demi-droite [AB), combien y a-t-il de points à distance 3 de A ?",a:"Exactement un. Sur la droite (AB) il y en a deux, un de chaque côté de A (axiome III e).",
 rel:["segment","points-alignes","demo-2-2-1"]});

/* ---------------- Segment ---------------- */
push({id:"segment",type:"def",ref:"Déf 1.2.1",t:"Le segment [AB]",cc:"Tombé en 2025 · 1 pt",
 plain:`Le segment [AB], c'est ${hl("tous les points M pour lesquels passer par M ne rallonge pas le trajet")} de A à B : AM + MB = AB. Ce sont exactement les points « entre » A et B.`,
 fig:()=>({w:560,h:300,P:{A:[100,200],B:[460,150],M:[300,70]},S:{show:false},
   toggles:[{k:"show",label:"Montrer tous ces points"}],
   con:{M:(p,P)=>{const q=onSeg(p,P.A,P.B);return dpx(p,q)<8?q:p;}},
   draw:(P,S)=>{const on=dpx(P.M,onSeg(P.M,P.A,P.B))<0.5;let s=S.show?D.seg(P.A,P.B,"l-cob"):D.seg(P.A,P.B,"l-cons");
     s+=D.seg(P.A,P.M,on?"l-ok":"l-amb")+D.seg(P.M,P.B,on?"l-ok":"l-amb");return s;},
   info:(P)=>{const on=dpx(P.M,onSeg(P.M,P.A,P.B))<0.5,am=d(P.A,P.M),mb=d(P.M,P.B);return R.m([["AM",fr(am)],["MB",fr(mb)],["AM + MB",fr(am+mb)],["AB",fl(P.A,P.B)]])+R.v(on?"AM + MB = AB : M ∈ [AB].":"AM + MB > AB : M ∉ [AB].",on?"ok":"");},
   goal:{text:"place M pour que AM + MB = AB.",ok:(P)=>dpx(P.M,onSeg(P.M,P.A,P.B))<0.5,win:"M est entre A et B. Clique sur « Montrer tous ces points » : c'est le segment."}}),
 formal:`<p><b>Définition 1.2.1.</b> Le segment [AB] est l'ensemble des points M du plan tels que ${hl("AB = AM + MB")}. Sa longueur est la distance AB.</p><p>On note aussi ]AB] = [AB] ∖ {A}, et de même [AB[ et ]AB[.</p>`,
 gloss:["[AB] : un ensemble de points","AB : un nombre, la longueur","]AB] : le segment sans le point A","∖ : « privé de »"],
 use:`<p>Pour montrer M ∈ [AB], montre AM + MB = AB. Dans l'autre sens, savoir M ∈ [AB] te donne l'égalité AM + MB = AB à utiliser (démo 2.1.2, TD 1.2).</p>`,
 trap:`[AB] est un ensemble, AB est un nombre. Écrire [AM]/[AB] est une « faute grave » d'après le corrigé du CC1 2024 : on ne divise pas des ensembles.`,
 q:"Donne la définition du segment [AB] (question du CC1 2025, 1 point).",a:"[AB] est l'ensemble des points M du plan tels que AM + MB = AB.",
 rel:["milieu","demi-droite","prop-1-2-3"]});

/* ---------------- Milieu ---------------- */
push({id:"milieu",type:"def",ref:"Déf 1.2.2",t:"Le milieu d'un segment",
 plain:`Le milieu de [AB] est le point M ${hl("à mi-chemin")} : à la même distance de A et de B, et cette distance vaut la moitié de AB.`,
 fig:()=>({w:560,h:300,P:{A:[100,210],B:[460,120],N:[230,90]},S:{show:false},labels:{N:"N"},
   toggles:[{k:"show",label:"Montrer le milieu"}],
   con:{N:(p,P)=>{const I=mid(P.A,P.B);return dpx(p,I)<9?I:p;}},
   draw:(P,S)=>{const I=mid(P.A,P.B);let s=D.seg(P.A,P.B,"l-ink")+D.seg(P.A,P.N,"l-cons")+D.seg(P.N,P.B,"l-cons");
     if(S.show)s+=D.ticks(P.A,I,1,"l-cob")+D.ticks(I,P.B,1,"l-cob")+D.pt(I,"I",V(I.x,I.y+60),"p-cob","t-cob");return s;},
   info:(P)=>{const I=mid(P.A,P.B),ok=dpx(P.N,I)<0.5;return R.m([["AN",fl(P.A,P.N)],["NB",fl(P.N,P.B)],["AB / 2",fr(d(P.A,P.B)/2)]])+R.v(ok?"AN = NB = AB/2 : N est le milieu.":"Pour être le milieu, il faut AN = NB = AB/2.",ok?"ok":"");},
   goal:{text:"place N au milieu de [AB].",ok:(P)=>dpx(P.N,mid(P.A,P.B))<0.5,win:"AN = NB = AB/2."}}),
 formal:`<p><b>Définition 1.2.2.</b> Le milieu du segment [AB] est l'unique point M du plan tel que ${hl("AM = MB = AB/2")}.</p>`,
 use:`<p>Les milieux sont partout : symétrie centrale (O est le milieu de [A s(A)]), théorème des milieux, et définition du parallélogramme (les diagonales ont le même milieu).</p>`,
 trap:`AM = MB ne suffit pas : tous les points de la médiatrice vérifient AM = MB. Il faut aussi AM = AB/2, ou M ∈ [AB].`,
 q:"M vérifie AM = MB. Est-ce forcément le milieu de [AB] ?",a:"Non. Tous les points de la médiatrice de [AB] vérifient AM = MB. Le milieu est le seul qui vérifie en plus AM = AB/2.",
 rel:["segment","mediatrice","symetrie-centrale"]});

/* ---------------- Demi-droite ---------------- */
push({id:"demi-droite",type:"def",ref:"Déf 1.2.4",t:"La demi-droite [AB)",
 plain:`La demi-droite [AB) part de A et ${hl("file vers B, puis au-delà, sans jamais revenir en arrière")}. Sur la droite (AB), ce sont les points du même côté de A que B.`,
 fig:()=>({w:560,h:280,P:{A:[160,170],B:[300,130],M:[420,95]},
   con:{M:(p,P)=>onLine(p,P.A,P.B)},
   draw:(P)=>{const u=unit(sub(P.B,P.A));return D.ray(P.A,P.B,"l-cob")+D.seg(P.A,add(P.A,mul(u,-4000)),"l-cons")+D.dot(P.A,"p-cob",5);},
   info:(P)=>{const t=param(P.M,P.A,P.B),inAB=t>=-0.005&&t<=1.005,bin=t>=0.995;const r=t>=-0.005;
     return R.m([["M ∈ [AB] ?",yes(inAB)],["B ∈ [AM] ?",yes(bin)]])+R.v(r?(t<=0.005?"M = A : l'origine est dans [AB).":"Au moins une des deux conditions est vraie : M ∈ [AB).")+(t>0.005?" M ∈ ]AB) aussi.":""):"Aucune des deux : M est de l'autre côté de A, M ∉ [AB).",r?"ok":"");},
   goal:{text:"place M sur [AB) mais en dehors du segment [AB].",ok:(P)=>param(P.M,P.A,P.B)>1.03,win:"c'est le cas « B ∈ [AM] » de la définition."},
   hint:"M glisse sur la droite (AB)."}),
 formal:`<p><b>Définition 1.2.4.</b> Pour A ≠ B, la demi-droite [AB) est l'ensemble des points M de (AB) tels que ${hl("M ∈ [AB] ou B ∈ [AM]")}.</p><p>De façon équivalente : M ∈ (AB) et A ∉ [BM[. On note ]AB) = [AB) ∖ {A}.</p><p>Si O ∈ ]AB[, alors (AB) = [OA) ∪ [OB) et [OA) ∩ [OB) = {O} : une droite est la réunion de deux demi-droites opposées.</p>`,
 gloss:["[AB) : origine A, direction B","]AB) : la même, sans A","∪ : réunion, ∩ : intersection"],
 use:`<p>Un angle est un couple de demi-droites. Et la réciproque de Thalès demande M ∈ ]AB) et N ∈ ]AC) : des demi-droites, pas des droites.</p>`,
 trap:`[AB) et [BA) ne sont pas la même demi-droite : l'origine est toujours la première lettre.`,
 q:"O est strictement entre A et B. Que dire des demi-droites [OA) et [OB) ?",a:"Elles sont opposées : leur réunion est la droite (AB) et leur intersection est {O}. L'angle orienté AOB vaut π.",
 rel:["segment","axiome-4","demo-2-5-2"]});

/* ---------------- Prop 1.2.3 ---------------- */
push({id:"prop-1-2-3",type:"th",ref:"Prop 1.2.3",t:"Découper un segment",
 plain:`Un point M du segment [AB] le coupe ${hl("en deux morceaux [AM] et [MB]")} qui se touchent seulement en M. Et le segment entre deux points de [AB] reste dans [AB].`,
 fig:()=>({w:560,h:280,P:{A:[80,180],B:[480,120],M:[240,156],N:[400,132]},labels:{N:"M′"},
   con:{M:(p,P)=>onSeg(p,P.A,P.B),N:(p,P)=>onSeg(p,P.A,P.B)},
   draw:(P)=>{const u=G.perp(unit(sub(P.B,P.A)));const o=mul(u,16);return D.seg(P.A,P.M,"l-cob")+D.seg(P.M,P.B,"l-amb")+D.seg(add(P.M,o),add(P.N,o),"l-ok")+D.txt(mid(add(P.M,o),add(P.N,o)),"[MM′]","t-ok t-up",0,-10)+D.dot(P.A,"p-fix")+D.dot(P.B,"p-fix");},
   info:(P)=>R.m([["AM + MB",fr(d(P.A,P.M)+d(P.M,P.B))],["AB",fl(P.A,P.B)]])+R.v("[AB] = [AM] ∪ [MB] (bleu + orange), et ils n'ont que M en commun. Le segment vert [MM′] reste dans [AB].","info"),
   hint:"M et M′ glissent sur le segment."}),
 formal:`<p><b>Proposition 1.2.3.</b> Soient A, B deux points. (1) [AB] = [BA]. (2) Si M ∈ [AB], alors [AB] = [AM] ∪ [MB] et [AM] ∩ [MB] = {M}. (3) Si M, M′ ∈ [AB], alors [MM′] ⊂ [AB].</p><p class="ref">Démontrée en TD (exercice 1.9, corrigé du prof sur Moodle). Ce n'est pas une démo exigible.</p>`,
 gloss:["⊂ : « est inclus dans »","{M} : l'ensemble qui contient seulement M"],
 use:`<p>On s'en sert sans le dire pour découper des figures (aires, angles). Retiens l'énoncé, pas la preuve.</p>`,
 trap:`(1) se prouve en une ligne avec la symétrie de la distance : AM + MB = AB ⇔ BM + MA = BA.`,
 q:"M ∈ [AB]. Que vaut [AM] ∩ [MB] ?",a:"{M} : les deux morceaux n'ont que M en commun.",
 rel:["segment","td"]});

/* ---------------- Cercle ---------------- */
push({id:"cercle",type:"def",ref:"Déf 1.2.5",t:"Le cercle C(O, R)",
 plain:`Le cercle de centre O et de rayon R, c'est ${hl("tous les points à distance exactement R de O")}. Pas l'intérieur : seulement le bord.`,
 fig:()=>({w:560,h:320,P:{O:[260,165],M:[400,90]},S:{R:2.8},
   sliders:[{k:"R",label:"R =",min:0.5,max:3.8,step:0.1,fmt:v=>fr(v,1)}],
   con:{M:(p,P,S)=>{const q=onCircle(p,P.O,S.R*40);return dpx(p,q)<8?q:p;}},
   draw:(P,S)=>{const on=Math.abs(d(P.O,P.M)-S.R)<0.02;return D.circ(P.O,S.R*40,"l-cob")+D.seg(P.O,P.M,on?"l-ok":"l-amb")+D.pt(P.O,"O",P.M,"p-fix");},
   info:(P,S)=>{const om=d(P.O,P.M),on=Math.abs(om-S.R)<0.02;return R.m([["OM",fr(om)],["R",fr(S.R)]])+R.v(on?"OM = R : M est sur le cercle.":om<S.R?"OM < R : M est à l'intérieur, pas sur le cercle.":"OM > R : M est à l'extérieur.",on?"ok":"");},
   goal:{text:"place M sur le cercle.",ok:(P,S)=>Math.abs(d(P.O,P.M)-S.R)<0.02,win:"OM = R."}}),
 formal:`<p><b>Définition 1.2.5.</b> Pour O ∈ P et R ∈ ℝ₊, le cercle de centre O et de rayon R est C(O, R) = {M ∈ P : d(O, M) = R}.</p>`,
 use:`<p>Au CC1, le cercle sert surtout à visualiser l'axiome III (e) : le cercle de centre A et de rayon λ coupe toute droite passant par A en exactement deux points.</p>`,
 trap:`C(O, 0) = {O}, d'après l'axiome III (c).`,
 q:"Que vaut C(O, 0) ?",a:"{O} : le seul point à distance 0 de O est O lui-même (axiome III c).",
 rel:["axiome-3"]});

/* ---------------- Axiome IV ---------------- */
push({id:"axiome-4",type:"ax",ref:"Axiome IV",t:"Les angles orientés",
 plain:`Un angle orienté ${an("AOB")}, c'est ${hl("de combien il faut tourner [OA) pour l'amener sur [OB)")}, en comptant positivement dans le sens inverse des aiguilles d'une montre. Comme un tour complet ne change rien, la mesure est définie à 2π près.`,
 fig:()=>({w:560,h:340,P:{O:[260,190],A:[440,200],B:[330,60],C:[110,110]},S:{rev:false},
   toggles:[{k:"rev",label:"Montrer BOA"}],
   con:{B:(p,P)=>{const a=ang(P.A,P.O,p);if(Math.abs(a)>PI-0.035){const q=proj(p,P.O,P.A);return dpx(q,P.O)>20?q:p;}if(Math.abs(a)<0.035)return proj(p,P.O,P.A);return p;}},
   draw:(P,S)=>{let s=D.ray(P.O,P.A,"l-ink")+D.ray(P.O,P.B,"l-ink")+D.ray(P.O,P.C,"l-thin");
     s+=D.arc(P.A,P.O,P.B,48,"l-cob",true,"cob")+D.arc(P.B,P.O,P.C,62,"l-amb",true,"amb")+D.arc(P.A,P.O,P.C,86,"l-ok",true,"ok");
     if(S.rev)s+=D.arc(P.B,P.O,P.A,34,"l-red",true,"red");
     return s+D.pt(P.O,"O",V(P.O.x,P.O.y-80),"p-fix");},
   info:(P,S)=>{const a=ang(P.A,P.O,P.B),b=ang(P.B,P.O,P.C),c=ang(P.A,P.O,P.C);
     return R.m([[an("AOB"),fa(a)],[an("BOC"),fa(b)],[an("AOB")+" + "+an("BOC"),fa(a+b)],[an("AOC"),fa(c)],S.rev?[an("BOA"),fa(ang(P.B,P.O,P.A))]:null])
      +R.v(Math.abs(a+b-c)<1e-6?"Chasles : la somme bleu + orange donne le vert.":"Chasles : la somme dépasse π, on retire 2π. C'est la même mesure « à 2π près ».","ok");},
   goal:{text:"place B pour que "+an("AOB")+" = π.",ok:(P)=>Math.abs(Math.abs(ang(P.A,P.O,P.B))-PI)<1e-6,win:"[OA) et [OB) sont opposées : c'est l'axiome IV (c)."},
   hint:"Les flèches indiquent le sens de rotation."}),
 formal:`<p><b>Axiome IV.</b> À tout triplet (A, O, B) avec A ≠ O ≠ B, on associe une mesure ${an("AOB")} ∈ ℝ/2πℤ telle que :</p><ul>
 <li>(a) elle ne dépend que des demi-droites [OA) et [OB), pas des points choisis dessus ;</li>
 <li>(b) ${an("AOB")} = 0 ⇔ [OA) = [OB) ;</li>
 <li>(c) ${an("AOB")} = π ⇔ [OA) et [OB) sont opposées ;</li>
 <li>(d) ${an("BOA")} = −${an("AOB")} : changer l'ordre change le signe ;</li>
 <li>(e) pour tout α ∈ ]−π, π], il existe une unique demi-droite [OB) avec ${an("AOB")} = α (c'est le rapporteur) ;</li>
 <li>(f) ${hl(`Chasles : ${an("AOC")} = ${an("AOB")} + ${an("BOC")}`)} ;</li>
 <li>(g) si ${an("AOB")} et ${an("AOC")} sont dans ]0, π[, alors (OA) ne coupe pas [BC] : B et C sont du même côté de (OA).</li></ul>`,
 gloss:[`${an("AOB")} avec un chapeau : angle orienté`,"ℝ/2πℤ : les réels « à 2π près »","[2π] : « modulo 2π »","mesure principale : le représentant dans ]−π, π]"],
 use:`<p>Chasles (f) est l'outil n°1 des exercices d'angles : CC1 2025 Ex. 1, TD 1.4, 1.5, 1.10. Le point (c) traduit un alignement : si O est entre A et B, ${an("AOB")} = π.</p>`,
 trap:`Ne mélange pas ${an("AOB")} (orienté, défini à 2π près) et |${an("AOB")}| (non orienté, dans [0, π]). Chasles marche toujours en orienté, mais pas toujours en non orienté.`,
 q:`${an("AOB")} = π/3 et ${an("BOC")} = π/2. Que vaut ${an("AOC")} ?`,a:"5π/6, par Chasles (axiome IV f).",
 rel:["angle-non-oriente","bissectrice","td"]});

/* ---------------- Angle non orienté ---------------- */
push({id:"angle-non-oriente",type:"def",ref:"Déf 1.3.1",t:"L'angle non orienté |AOB|",
 plain:`On oublie le sens de rotation et on garde seulement ${hl("l'ouverture de l'angle")}, entre 0 et π. C'est ce que mesure un rapporteur ordinaire.`,
 fig:()=>({w:560,h:330,P:{O:[260,210],A:[450,190],B:[300,60],C:[400,90]},
   draw:(P)=>{const between=!!segInter(P.A,P.B,P.O,add(P.O,mul(unit(sub(P.C,P.O)),4000)));
     return D.ray(P.O,P.A,"l-ink")+D.ray(P.O,P.B,"l-ink")+D.ray(P.O,P.C,"l-thin")+D.seg(P.A,P.B,"l-cons")+D.wedge(P.A,P.O,P.B,60,"f-cob")+D.arc(P.A,P.O,P.B,60,"l-cob")+D.arc(P.A,P.O,P.C,80,between?"l-ok":"l-red")+D.arc(P.C,P.O,P.B,92,between?"l-ok":"l-red")+D.pt(P.O,"O",V(P.O.x,P.O.y-80),"p-fix");},
   info:(P)=>{const a=ang(P.A,P.O,P.B),x=absang(P.A,P.O,P.C),y=absang(P.C,P.O,P.B),between=!!segInter(P.A,P.B,P.O,add(P.O,mul(unit(sub(P.C,P.O)),4000)));
     return R.m([[an("AOB")+" (orienté)",fa(a)],["|"+an("AOB")+"|",fa(Math.abs(a))],["|"+an("AOC")+"| + |"+an("COB")+"|",fa(x+y)]])+R.v(between?"[OC) est entre [OA) et [OB) : les deux morceaux s'additionnent.":"[OC) n'est pas entre les deux : la somme ne marche pas.",between?"ok":"");},
   goal:{text:"place C pour que |AOB| = |AOC| + |COB|.",ok:(P)=>!!segInter(P.A,P.B,P.O,add(P.O,mul(unit(sub(P.C,P.O)),4000)))&&dpx(P.C,P.O)>5,win:"il faut que [OC) coupe [AB] : c'est la remarque du §1.3."}}),
 formal:`<p><b>Définition 1.3.1.</b> La mesure de l'angle non orienté est |${an("AOB")}|, où ${an("AOB")} est pris dans sa détermination principale ]−π, π]. Elle est dans ${hl("[0, π]")} et ne dépend que de la paire {[OA), [OB)}.</p><p><b>Remarque.</b> Si [AB] ∩ [OC) ≠ ∅ ([OC) est « entre » [OA) et [OB)), alors |${an("AOB")}| = |${an("AOC")}| + |${an("COB")}|.</p>`,
 gloss:["| | : valeur absolue","[0, π] : de 0 à π compris","paire { } : l'ordre ne compte pas"],
 use:`<p>Les triangles (CAC, ACA, somme des angles, semblables) utilisent les angles non orientés. Pour additionner deux angles non orientés, vérifie que la demi-droite du milieu est bien entre les deux autres.</p>`,
 trap:`|${an("AOB")}| = |${an("AOC")}| + |${an("COB")}| est faux si C n'est pas entre les deux. Essaie dans la figure : le rouge apparaît.`,
 q:`La mesure principale de ${an("AOB")} est −2π/3. Que valent |${an("AOB")}| et ${an("BOA")} ?`,a:`|${an("AOB")}| = 2π/3, et ${an("BOA")} = 2π/3 (axiome IV d).`,
 rel:["axiome-4","angles-aigu-obtus","bissectrice"]});

/* ---------------- Aigu, obtus, droit ---------------- */
push({id:"angles-aigu-obtus",type:"def",ref:"Déf 1.3.2",t:"Aigu, obtus, droit, perpendiculaires",
 plain:`On compare l'ouverture à un quart de tour, π/2 : ${hl("plus petit = aigu, plus grand = obtus, égal = droit")}. Deux droites qui font un angle droit sont perpendiculaires.`,
 fig:()=>({w:560,h:320,P:{O:[240,220],A:[460,220],B:[300,70]},
   con:{B:(p,P)=>{const a=ang(P.A,P.O,p);if(Math.abs(Math.abs(a)-PI/2)<0.04){const Q=rot(P.A,P.O,Math.sign(a)*PI/2);return add(P.O,mul(unit(sub(Q,P.O)),dpx(p,P.O)));}return p;}},
   draw:(P)=>{const a=Math.abs(ang(P.A,P.O,P.B)),r=Math.abs(a-PI/2)<1e-6;return D.ray(P.O,P.A,"l-ink")+D.ray(P.O,P.B,"l-ink")+(r?D.right(P.A,P.O,P.B,16,"l-cob"):D.wedge(P.A,P.O,P.B,56,a<PI/2?"f-cob":"f-amb")+D.arc(P.A,P.O,P.B,56,a<PI/2?"l-cob":"l-amb"))+D.pt(P.O,"O",V(P.O.x-40,P.O.y+30),"p-fix");},
   info:(P)=>{const a=Math.abs(ang(P.A,P.O,P.B));const r=Math.abs(a-PI/2)<1e-6;return R.m([["|"+an("AOB")+"|",fa(a)]])+R.v(r?"Droit : (OA) ⊥ (OB).":a<PI/2?"Aigu : moins que π/2.":"Obtus : plus que π/2.",r?"ok":"");},
   goal:{text:"fais un angle droit.",ok:(P)=>Math.abs(Math.abs(ang(P.A,P.O,P.B))-PI/2)<1e-6,win:"|AOB| = π/2 : (OA) et (OB) sont perpendiculaires."}}),
 formal:`<p><b>Définition 1.3.2.</b> L'angle ${an("AOB")} est aigu si |${an("AOB")}| < π/2, obtus si |${an("AOB")}| > π/2, droit si |${an("AOB")}| = π/2. Dans ce dernier cas, (OA) et (OB) sont perpendiculaires : (OA) ⊥ (OB).</p>`,
 gloss:["⊥ : perpendiculaires","π/2 : un quart de tour (90°)"],
 use:`<p>Les angles droits apparaissent avec les hauteurs, les médiatrices, les carrés (CC1 2025 Ex. 3). Deux droites perpendiculaires à une même troisième sont parallèles (angles alternes-internes).</p>`,
 trap:`Le cours travaille en radians : écris π/2, pas 90.`,
 q:"Un angle mesure 3π/4. Aigu, obtus ou droit ?",a:"Obtus : 3π/4 > π/2.",
 rel:["perpendiculaire","mediatrice"]});

/* ---------------- Bissectrice ---------------- */
function bis(P){const u=unit(sub(P.A,P.O)),v=unit(sub(P.B,P.O)),w=add(u,v);return G.len(w)<1e-6?null:add(P.O,mul(unit(w),130));}
push({id:"bissectrice",type:"def",ref:"§1.3",t:"La bissectrice d'un angle",
 plain:`La bissectrice coupe l'angle ${hl("en deux moitiés égales")}. C'est une demi-droite qui part du sommet.`,
 fig:()=>({w:560,h:330,P:{O:[200,230],A:[470,230],B:[330,60],M:[400,120]},S:{show:false},
   toggles:[{k:"show",label:"Montrer la bissectrice"}],
   con:{M:(p,P)=>{const C=bis(P);if(!C)return p;const q=onRay(p,P.O,C);return dpx(p,q)<9?q:p;}},
   draw:(P,S)=>{const C=bis(P);let s=D.ray(P.O,P.A,"l-ink")+D.ray(P.O,P.B,"l-ink")+D.ray(P.O,P.M,"l-amb");
     if(S.show&&C)s+=D.ray(P.O,C,"l-cob-d");
     s+=D.arc(P.A,P.O,P.M,58,"l-amb")+D.arc(P.M,P.O,P.B,70,"l-amb");
     return s+D.pt(P.O,"O",V(P.O.x-30,P.O.y+40),"p-fix");},
   info:(P)=>{const x=absang(P.A,P.O,P.M),y=absang(P.M,P.O,P.B),t=absang(P.A,P.O,P.B);const C=bis(P);const ok=C&&dpx(P.M,onRay(P.M,P.O,C))<0.5;
     return R.m([["|"+an("AOM")+"|",fa(x)],["|"+an("MOB")+"|",fa(y)],["|"+an("AOB")+"| / 2",fa(t/2)]])+R.v(!C?"|AOB| = π : la bissectrice n'est pas définie.":ok?"Les deux moitiés sont égales : [OM) est la bissectrice.":"Les deux morceaux ne sont pas égaux.",ok?"ok":"");},
   goal:{text:"place M sur la bissectrice de {[OA), [OB)}.",ok:(P)=>{const C=bis(P);return C&&dpx(P.M,onRay(P.M,P.O,C))<0.5;},win:"|AOM| = |MOB| = |AOB|/2."}}),
 formal:`<p>Si |${an("AOB")}| ∈ [0, π[, il existe une unique demi-droite [OC) telle que ${hl(`|${an("AOC")}| = |${an("COB")}| = |${an("AOB")}|/2`)}. C'est la <b>bissectrice</b> de l'angle {[OA), [OB)}.</p><p>Les angles orientés ${an("AOC")} et ${an("COB")} sont alors égaux.</p>`,
 use:`<p>Dans les exercices d'angles, une bissectrice donne deux moitiés égales, qu'on additionne avec Chasles : CC1 2025 Ex. 1, TD 1.5 et 1.10. Dans un triangle isocèle, bissectrice, médiane et hauteur issues du sommet sont confondues (TD 1.7).</p>`,
 trap:`La bissectrice est une demi-droite, et elle n'est pas définie quand l'angle vaut π (il y aurait deux candidates).`,
 q:`|${an("AOB")}| = 2π/3 et [OC) est la bissectrice. Que vaut |${an("AOC")}| ?`,a:"π/3, la moitié de 2π/3.",
 rel:["angle-non-oriente","td","td-isocele"]});

/* ---------------- Médiatrice ---------------- */
push({id:"mediatrice",type:"def",ref:"Déf 1.3.3 et TD 1.6",t:"La médiatrice d'un segment",
 plain:`La médiatrice de [AB] est la droite ${hl("perpendiculaire à (AB) qui passe par son milieu")}. Ses points sont exactement ceux qui sont à la même distance de A et de B (TD 1.6).`,
 fig:()=>({w:560,h:330,P:{A:[160,220],B:[400,180],M:[330,70]},S:{show:false},
   toggles:[{k:"show",label:"Montrer la médiatrice"}],
   con:{M:(p,P)=>{const I=mid(P.A,P.B),J=add(I,G.perp(sub(P.B,P.A)));return snapLine(p,I,J,9);}},
   draw:(P,S)=>{const I=mid(P.A,P.B),J=add(I,G.perp(sub(P.B,P.A)));const eq=Math.abs(d(P.M,P.A)-d(P.M,P.B))<0.01;
     let s=D.seg(P.A,P.B,"l-ink")+D.seg(P.M,P.A,eq?"l-ok":"l-amb")+D.seg(P.M,P.B,eq?"l-ok":"l-amb");
     if(S.show)s+=D.line(I,J,"l-cob")+D.right(P.B,I,J,11,"l-cob")+D.ticks(P.A,I,1,"l-cob")+D.ticks(I,P.B,1,"l-cob");
     if(eq)s+=D.ticks(P.M,P.A,2,"l-ok")+D.ticks(P.M,P.B,2,"l-ok");
     return s;},
   info:(P)=>{const a=d(P.M,P.A),b=d(P.M,P.B),eq=Math.abs(a-b)<0.01;return R.m([["MA",fr(a)],["MB",fr(b)]])+R.v(eq?"MA = MB : M est sur la médiatrice (TD 1.6).":"MA ≠ MB : M n'est pas sur la médiatrice.",eq?"ok":"");},
   goal:{text:"place M pour que MA = MB, puis montre la médiatrice.",ok:(P)=>Math.abs(d(P.M,P.A)-d(P.M,P.B))<0.01,win:"tous ces points forment une droite : la médiatrice."}}),
 formal:`<p><b>Définition 1.3.3.</b> Si A ≠ B, la médiatrice du segment [AB] est l'unique droite perpendiculaire à (AB) qui passe par le milieu de [AB].</p><p><b>TD 1.6</b> (utilisable sans preuve) : ${hl("M est sur la médiatrice de [AB] ⇔ MA = MB")}.</p>`,
 use:`<p>Pour montrer MA = MB, montre que M est sur la médiatrice, et inversement. Exemple : le bonus des annales (CC2 2025 Ex. 1) se fait avec ça et l'unicité de la perpendiculaire.</p><p>La preuve du TD 1.6 : triangles AIM et BIM, CAC dans un sens, CCC dans l'autre (voir la page TD 1).</p>`,
 trap:`La définition, c'est « perpendiculaire + milieu ». « Les points à égale distance », c'est le TD 1.6 : un théorème, à citer comme tel.`,
 q:"Donne la définition de la médiatrice d'un segment (exemple donné par le prof sur Moodle).",a:"Pour A ≠ B, la médiatrice de [AB] est la droite perpendiculaire à (AB) qui passe par le milieu de [AB].",
 rel:["milieu","angles-aigu-obtus","td-isocele","perpendiculaire"]});

/* ---------------- Triangles ---------------- */
push({id:"triangles",type:"def",ref:"§1.4 et TD 1",t:"Triangles : le vocabulaire",
 plain:`Un triangle ABC, c'est trois points différents. Il est ${hl("dégénéré")} s'ils sont alignés (un triangle « aplati »). ${hl("Isocèle en A")} : AB = AC. ${hl("Équilatéral")} : les trois côtés sont égaux.`,
 fig:()=>({w:560,h:330,P:{A:[250,60],B:[110,260],C:[440,250]},
   buttons:[{label:"Isocèle en A",act:(P)=>{const I=mid(P.B,P.C),n=unit(G.perp(sub(P.C,P.B)));const h=Math.max(60,dpx(P.A,I));P.A=add(I,mul(n,side(P.A,P.B,P.C)>=0?h:-h));}},
            {label:"Équilatéral",act:(P)=>{P.A=rot(P.C,P.B,side(P.A,P.B,P.C)>0?-PI/3:PI/3);}},
            {label:"Aplatir",act:(P)=>{P.A=lerp(P.B,P.C,0.4);}}],
   draw:(P)=>{const deg=Math.abs(G.crs(sub(P.B,P.A),sub(P.C,P.A)))<200;const ab=d(P.A,P.B),ac=d(P.A,P.C),bc=d(P.B,P.C);
     let s=D.poly([P.A,P.B,P.C],deg?"f-red":"f-ink")+D.pline([P.A,P.B,P.C,P.A],"l-ink");
     if(Math.abs(ab-ac)<0.02){s+=D.ticks(P.A,P.B,1,"l-cob")+D.ticks(P.A,P.C,1,"l-cob");}
     if(Math.abs(ab-bc)<0.02&&Math.abs(ab-ac)<0.02)s+=D.ticks(P.B,P.C,1,"l-cob");
     if(!deg)s+=D.marks(P.B,P.A,P.C,22,1,"l-thin")+D.marks(P.C,P.B,P.A,22,1,"l-thin")+D.marks(P.A,P.C,P.B,22,1,"l-thin");
     return s;},
   info:(P)=>{const ab=d(P.A,P.B),ac=d(P.A,P.C),bc=d(P.B,P.C),deg=Math.abs(G.crs(sub(P.B,P.A),sub(P.C,P.A)))<200;
     const iso=[Math.abs(ab-ac)<0.02?"A":"",Math.abs(ab-bc)<0.02?"B":"",Math.abs(ac-bc)<0.02?"C":""].filter(Boolean);
     return R.m([["AB",fr(ab)],["AC",fr(ac)],["BC",fr(bc)],["|Â|",fa(absang(P.B,P.A,P.C))],["|B̂|",fa(absang(P.A,P.B,P.C))],["|Ĉ|",fa(absang(P.A,P.C,P.B))]])
       +R.v(deg?"Dégénéré (presque aplati) : A, B, C sont alignés ou presque.":iso.length===3?"Équilatéral.":iso.length?`Isocèle en ${iso.join(", ")}.`:"Triangle quelconque, non dégénéré.",iso.length?"ok":"");},
   goal:{text:"rends le triangle isocèle en A sans les boutons.",ok:(P)=>Math.abs(d(P.A,P.B)-d(P.A,P.C))<0.02,win:"AB = AC. Regarde aussi les angles en B et C : ils sont égaux (TD 1.7)."}}),
 formal:`<p>Un <b>triangle</b> ABC est la donnée de trois points deux à deux distincts (par défaut, un triplet ordonné). Il est <b>dégénéré</b> si A, B, C sont alignés.</p><p>Côtés : [AB], [BC], [CA]. On note Â l'angle {[AB), [AC)} et |Â| = |${an("BAC")}|. Les côtés [AB] et [AC] sont <b>adjacents</b> à Â, le côté [BC] lui est <b>opposé</b>.</p><p>TD 1 : isocèle en A si AB = AC ; équilatéral si AB = BC = CA.</p>`,
 gloss:["Â : l'angle au sommet A","adjacent : qui touche","opposé : en face"],
 use:`<p>« Adjacent » et « opposé » sont indispensables pour appliquer CAC et ACA correctement (axiome V).</p>`,
 trap:`La plupart des énoncés demandent un triangle non dégénéré (axiome V, Thalès). Vérifie-le avant de les utiliser.`,
 q:"Dans le triangle ABC, quels côtés sont adjacents à l'angle B̂ ?",a:"[BA] et [BC]. Le côté opposé à B̂ est [AC].",
 rel:["axiome-5","td-isocele","td-equilateral"]});

/* ---------------- Axiome V ---------------- */
function image(P,S){/* copie de ABC déplacée vers la droite (et retournée si S.flip) */
  const Gc=V((P.A.x+P.B.x+P.C.x)/3,(P.A.y+P.B.y+P.C.y)/3);
  const f=q=>{let r=V(q.x,q.y);if(S.flip)r=V(2*Gc.x-r.x,r.y);r=rot(r,Gc,-0.45);return add(r,V(300,10));};
  return {A:f(P.A),B:f(P.B),C:f(P.C)};}
function marksFor(T,mode,cls){let s="";
  if(mode==="CCC")s+=D.ticks(T.A,T.B,1,cls)+D.ticks(T.B,T.C,2,cls)+D.ticks(T.C,T.A,3,cls);
  if(mode==="CAC")s+=D.ticks(T.A,T.B,1,cls)+D.ticks(T.A,T.C,3,cls)+D.wedge(T.B,T.A,T.C,26,"f-cob")+D.marks(T.B,T.A,T.C,26,1,"l-cob");
  if(mode==="ACA")s+=D.ticks(T.A,T.B,1,cls)+D.wedge(T.B,T.A,T.C,26,"f-cob")+D.marks(T.B,T.A,T.C,26,1,"l-cob")+D.wedge(T.A,T.B,T.C,26,"f-amb")+D.marks(T.A,T.B,T.C,26,2,"l-amb");
  return s;}
push({id:"axiome-5",type:"ax",ref:"Axiome V",t:"Triangles isométriques : CCC, CAC, ACA",
 plain:`Deux triangles sont isométriques quand ils sont ${hl("superposables")}, quitte à retourner la feuille. Pas besoin de vérifier les 6 mesures : 3 bien choisies suffisent. ${hl("CCC")} : les trois côtés. ${hl("CAC")} : deux côtés et l'angle entre eux. ${hl("ACA")} : un côté et les deux angles à ses extrémités.`,
 fig:()=>[{w:600,h:330,P:{A:[120,80],B:[60,250],C:[250,230]},S:{mode:"CAC",flip:false},
   con:{A:p=>V(Math.min(p.x,270),p.y),B:p=>V(Math.min(p.x,270),p.y),C:p=>V(Math.min(p.x,270),p.y)},
   toggles:[{k:"flip",label:"Retourner la copie"}],
   buttons:[{label:"CCC",act:(P,S)=>{S.mode="CCC";}},{label:"CAC",act:(P,S)=>{S.mode="CAC";}},{label:"ACA",act:(P,S)=>{S.mode="ACA";}}],
   draw:(P,S)=>{const T=image(P,S),ctr=V(150,180),ctr2=V(450,180);
     return D.poly([P.A,P.B,P.C],"f-ink")+D.pline([P.A,P.B,P.C,P.A],"l-ink")+marksFor(P,S.mode,"l-ink")
      +D.poly([T.A,T.B,T.C],"f-cob")+D.pline([T.A,T.B,T.C,T.A],"l-cob")+marksFor(T,S.mode,"l-cob")
      +D.pt(T.A,"A′",ctr2,"p-cob","t-cob")+D.pt(T.B,"B′",ctr2,"p-cob","t-cob")+D.pt(T.C,"C′",ctr2,"p-cob","t-cob")+D.seg(V(290,20),V(290,310),"l-cons");},
   info:(P,S)=>{const T=image(P,S);const rows={CCC:[["AB = A′B′",fl(P.A,P.B)],["BC = B′C′",fl(P.B,P.C)],["CA = C′A′",fl(P.C,P.A)]],
     CAC:[["AB = A′B′",fl(P.A,P.B)],["AC = A′C′",fl(P.A,P.C)],["|Â| = |Â′|",fa(absang(P.B,P.A,P.C))]],
     ACA:[["AB = A′B′",fl(P.A,P.B)],["|Â| = |Â′|",fa(absang(P.B,P.A,P.C))],["|B̂| = |B̂′|",fa(absang(P.A,P.B,P.C))]]}[S.mode];
     return R.h("Cas "+S.mode+" : les marques montrent ce qu'on compare")+R.m(rows)+R.v("Ces 3 égalités suffisent : tout le reste est égal aussi (B′C′ = "+fl(T.B,T.C)+").","info");},
   hint:"Déforme le triangle gris : sa copie bleue suit.",away:()=>V(150,180)},
  {w:560,h:320,P:{A:[90,250],B:[250,110],T:[500,250]},S:{r:4.3},labels:{T:"(direction)"},
   sliders:[{k:"r",label:"BC = BC′ =",min:2,max:6,step:0.05,fmt:v=>fr(v)}],
   draw:(P,S)=>{const u=unit(sub(P.T,P.A)),w=sub(P.A,P.B),b=G.dot(u,w),c=G.dot(w,w)-(S.r*40)**2,disc=b*b-c;let s=D.ray(P.A,P.T,"l-thin")+D.circ(P.B,S.r*40,"l-cons");
     if(disc>0){const t1=-b-Math.sqrt(disc),t2=-b+Math.sqrt(disc);const pts=[t1,t2].filter(t=>t>0).map(t=>add(P.A,mul(u,t)));
       if(pts.length===2){s+=D.poly([P.A,P.B,pts[0]],"f-cob")+D.poly([P.A,P.B,pts[1]],"f-amb")+D.pline([P.A,P.B,pts[0]],"l-cob")+D.pline([P.A,P.B,pts[1]],"l-amb")+D.seg(P.B,pts[0],"l-cob")+D.seg(P.B,pts[1],"l-amb")+D.pt(pts[0],"C",P.B,"p-cob","t-cob")+D.pt(pts[1],"C′",P.B,"p-cob","t-amb");}
       else if(pts.length===1)s+=D.pt(pts[0],"C",P.B,"p-cob","t-cob");}
     return s+D.arc(P.T,P.A,P.B,30,"l-ink");},
   info:(P,S)=>{const u=unit(sub(P.T,P.A)),w=sub(P.A,P.B),b=G.dot(u,w),c=G.dot(w,w)-(S.r*40)**2,disc=b*b-c;const pts=disc>0?[-b-Math.sqrt(disc),-b+Math.sqrt(disc)].filter(t=>t>0).map(t=>add(P.A,mul(u,t))):[];
     if(pts.length<2)return R.v("Change le rayon pour obtenir deux points C et C′.");
     return R.h("L'intrus de l'exemple Moodle")+R.m([["AB (commun)",fl(P.A,P.B)],["BC = BC′",fr(S.r)],["|Â| (commun)",fa(absang(P.T,P.A,P.B))],["AC",fl(P.A,pts[0])],["AC′",fl(P.A,pts[1])]])+R.v("Deux côtés et un angle égaux, mais AC ≠ AC′ : ABC et ABC′ ne sont pas isométriques. L'angle n'est pas entre les deux côtés.","");},
   hint:"Change le rayon : deux triangles différents apparaissent."}],
 formal:`<p><b>Axiome V.</b> Si ABC et A′B′C′ sont deux triangles <b>non dégénérés</b>, les trois propriétés suivantes sont équivalentes :</p><ul><li>(CCC) AB = A′B′, BC = B′C′ et CA = C′A′ ;</li><li>(CAC) AB = A′B′, AC = A′C′ et |Â| = |Â′| ;</li><li>(ACA) AB = A′B′, |Â| = |Â′| et |B̂| = |B̂′|.</li></ul><p>Deux triangles qui les vérifient sont dits <b>isométriques</b>. En CAC, ${hl("l'angle est entre les deux côtés")} ; en ACA, ${hl("les deux angles sont aux extrémités du côté")}. Le Cor 2.4.3 assouplit ACA.</p>`,
 use:`<p>La technique la plus utilisée en exercice : pour montrer que deux longueurs ou deux angles sont égaux, trouve deux triangles qui les contiennent, prouve qu'ils sont isométriques (CCC, CAC ou ACA), puis lis l'égalité voulue. TD 1.6, 1.7, 1.13, CC1 2025 Ex. 3.</p>`,
 trap:`Deux côtés et un angle qui n'est pas entre eux ne suffisent pas : c'est l'intrus de l'exemple du prof. La deuxième figure le montre.`,
 q:"Exemple Moodle : AB = A′B′, BC = B′C′ et |Â| = |Â′|. Les triangles sont-ils forcément isométriques ?",a:"Non. Â n'est pas entre [AB] et [BC], donc ce n'est pas un cas CAC. C'est l'intrus.",
 rel:["axiome-6","triangles","cor-2-4-3","td-isocele"]});

/* ---------------- Axiome VI ---------------- */
push({id:"axiome-6",type:"ax",ref:"Axiome VI",t:"Triangles isométriques, version orientée",
 plain:`Même idée que l'axiome V, mais ${hl("sans avoir le droit de retourner la feuille")} : on compare des angles orientés, avec leur signe. Seuls CAC et ACA existent dans cette version.`,
 fig:()=>({w:600,h:330,P:{A:[120,80],B:[60,250],C:[250,230]},S:{flip:false},
   con:{A:p=>V(Math.min(p.x,270),p.y),B:p=>V(Math.min(p.x,270),p.y),C:p=>V(Math.min(p.x,270),p.y)},
   toggles:[{k:"flip",label:"Retourner la copie"}],
   draw:(P,S)=>{const T=image(P,S),ctr2=V(450,180);return D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.arc(P.B,P.A,P.C,34,"l-amb",true,"amb")+D.pline([T.A,T.B,T.C,T.A],"l-cob")+D.arc(T.B,T.A,T.C,34,S.flip?"l-red":"l-amb",true,S.flip?"red":"amb")+D.pt(T.A,"A′",ctr2,"p-cob","t-cob")+D.pt(T.B,"B′",ctr2,"p-cob","t-cob")+D.pt(T.C,"C′",ctr2,"p-cob","t-cob")+D.seg(V(290,20),V(290,310),"l-cons");},
   info:(P,S)=>{const T=image(P,S),a=ang(P.B,P.A,P.C),b=ang(T.B,T.A,T.C);return R.m([[an("BAC"),fa(a)],[an("B′A′C′"),fa(b)]])+R.v(S.flip?"Copie retournée : l'angle orienté change de signe. Les triangles sont isométriques (axiome V), mais pas au sens de l'axiome VI.":"Copie seulement tournée : même angle orienté. L'axiome VI s'applique.",S.flip?"":"ok");},
   hint:"Compare le sens des flèches.",away:()=>V(150,180)}),
 formal:`<p><b>Axiome VI.</b> Si ABC et A′B′C′ sont deux triangles non dégénérés, les deux propriétés suivantes sont équivalentes :</p><ul><li>(CAC) AB = A′B′, AC = A′C′ et ${an("BAC")} = ${an("B′A′C′")} ;</li><li>(ACA) AB = A′B′, ${an("BAC")} = ${an("B′A′C′")} et ${an("ABC")} = ${an("A′B′C′")}.</li></ul><p>Pas de cas CCC dans cette version.</p>`,
 use:`<p>Il sert dans la preuve du Thm 2.2.3 (3) : la symétrie centrale préserve les angles orientés.</p>`,
 trap:`Un triangle et son image dans un miroir sont isométriques, mais leurs angles orientés sont opposés.`,
 q:"Un triangle et son image par un miroir vérifient-ils l'axiome VI ?",a:"Non : retourner change le signe des angles orientés. Ils sont isométriques au sens de l'axiome V seulement.",
 rel:["axiome-5","thm-2-2-3"]});

/* ---------------- Axiome VII ---------------- */
push({id:"axiome-7",type:"ax",ref:"Axiome VII",t:"Une droite qui entre dans un triangle en ressort",
 plain:`Si une droite traverse un côté d'un triangle, ${hl("elle doit ressortir par un des deux autres côtés")}. Elle ne peut pas rester coincée à l'intérieur.`,
 fig:()=>({w:560,h:330,P:{A:[260,60],B:[100,270],C:[460,260],E:[60,120],F:[500,210]},labels:{E:"",F:""},
   draw:(P)=>{let s=D.poly([P.A,P.B,P.C],"f-ink")+D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.line(P.E,P.F,"l-cob")+D.txt(add(P.E,V(-10,-14)),"Δ","t-cob");
     [[P.A,P.B],[P.B,P.C],[P.C,P.A]].forEach(([X,Y])=>{const I=G.lineSeg(P.E,P.F,X,Y);if(I)s+=D.dot(I,"p-red",5.5);});return s;},
   info:(P)=>{const names=["[AB]","[BC]","[CA]"],cut=[[P.A,P.B],[P.B,P.C],[P.C,P.A]].map(([X,Y])=>!!G.lineSeg(P.E,P.F,X,Y));
     return R.m(names.map((n,i)=>[n,yes(cut[i],"coupé","non")]))+R.v(cut[0]?(cut[1]||cut[2]?"Δ coupe [AB], et elle coupe aussi [BC] ou [CA] : l'axiome VII est vérifié.":""):"Fais traverser [AB] par Δ.",cut[0]?"ok":"");},
   hint:"Déplace les deux poignées sans nom de la droite Δ."}),
 formal:`<p><b>Axiome VII.</b> Soient ABC un triangle et Δ une droite. Si Δ rencontre le segment [AB], alors Δ rencontre aussi l'un des segments [AC] ou [BC].</p>`,
 use:`<p>Il sert à construire les demi-plans (Prop 1.5.1). On le cite rarement directement en exercice.</p>`,
 trap:`Elle peut ressortir par un sommet : dans ce cas elle touche deux côtés à la fois.`,
 q:"Une droite passe par le milieu de [AB] et est parallèle à (BC). Quel autre côté coupe-t-elle ?",a:"[AC], en son milieu (théorème des milieux et sa réciproque). Elle ne peut pas couper [BC] puisqu'elle lui est parallèle.",
 rel:["demi-plans"]});

/* ---------------- Demi-plans et convexité ---------------- */
function halfPoly(A,B,s){const u=unit(sub(B,A)),n=mul(G.perp(u),s*3000);const P1=add(A,mul(u,-3000)),P2=add(A,mul(u,3000));return [P1,P2,add(P2,n),add(P1,n)];}
function inPoly(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
push({id:"demi-plans",type:"th",ref:"§1.5, Prop 1.5.1",t:"Les deux côtés d'une droite, et la convexité",
 plain:`Une droite coupe le plan en ${hl("deux demi-plans")}, comme un trait coupe une feuille en deux. Deux points sont du même côté quand le segment qui les relie ne traverse pas la droite.`,
 fig:()=>[{w:560,h:320,P:{E:[60,220],F:[500,120],M:[200,80],N:[400,250]},labels:{E:"",F:""},
   draw:(P)=>{const sM=side(P.M,P.E,P.F),sN=side(P.N,P.E,P.F);const cross=sM*sN<0;
     return D.poly(halfPoly(P.E,P.F,-1),"f-cob")+D.line(P.E,P.F,"l-ink")+D.txt(add(P.E,V(0,24)),"Δ","t-mut")+D.seg(P.M,P.N,cross?"l-red":"l-ok")+(cross?D.dot(G.inter(P.E,P.F,P.M,P.N),"p-red",5):"");},
   info:(P)=>{const cross=side(P.M,P.E,P.F)*side(P.N,P.E,P.F)<0;return R.v(cross?"M et N sont de part et d'autre : [MN] coupe Δ (Prop 1.5.1 c).":"M et N sont du même côté : [MN] ne coupe pas Δ.",cross?"":"ok");},
   hint:"La zone bleue est un des deux demi-plans."},
  {w:560,h:320,P:{M:[150,90],N:[410,250]},S:{convex:false},
   toggles:[{k:"convex",label:"Forme convexe"}],
   draw:(P,S)=>{const poly=S.convex?[V(80,60),V(480,60),V(480,280),V(80,280)]:[V(80,60),V(250,60),V(250,190),V(480,190),V(480,280),V(80,280)];
     let out=false;for(let i=0;i<=40;i++){if(!inPoly(lerp(P.M,P.N,i/40),poly)){out=true;break;}}
     return D.poly(poly,"f-ink")+D.pline(poly.concat([poly[0]]),"l-thin")+D.seg(P.M,P.N,out?"l-red":"l-ok");},
   info:(P,S)=>{const poly=S.convex?[V(80,60),V(480,60),V(480,280),V(80,280)]:[V(80,60),V(250,60),V(250,190),V(480,190),V(480,280),V(80,280)];
     const inM=inPoly(P.M,poly),inN=inPoly(P.N,poly);let out=false;for(let i=0;i<=40;i++){if(!inPoly(lerp(P.M,P.N,i/40),poly)){out=true;break;}}
     if(!inM||!inN)return R.v("Place M et N dans la forme grise.");
     return R.v(out?"Le segment [MN] sort de la forme : elle n'est pas convexe.":"Le segment [MN] reste dans la forme.",out?"":"ok");},
   goal:{text:"avec la forme en L, trouve deux points de la forme dont le segment sort.",ok:(P,S)=>{if(S.convex)return false;const poly=[V(80,60),V(250,60),V(250,190),V(480,190),V(480,280),V(80,280)];if(!inPoly(P.M,poly)||!inPoly(P.N,poly))return false;for(let i=0;i<=40;i++){if(!inPoly(lerp(P.M,P.N,i/40),poly))return true;}return false;},win:"un seul contre-exemple suffit : la forme en L n'est pas convexe."}}],
 formal:`<p>Deux points A, B hors de Δ sont <b>du même côté</b> de Δ si [AB] ne rencontre pas Δ. Une partie C est <b>convexe</b> si pour tous A, B ∈ C, [AB] ⊂ C.</p><p><b>Proposition 1.5.1.</b> (a) P = P⁺ ∪ P⁻ ∪ Δ, réunion disjointe. (b) P⁺ et P⁻ sont convexes. (c) Si A ∈ P⁺ et B ∈ P⁻, alors [AB] rencontre Δ.</p><p>On dit que Δ <b>sépare</b> A et B si [AB] coupe Δ.</p>`,
 gloss:["P⁺, P⁻ : les deux demi-plans","disjointe : sans point commun"],
 use:`<p>Les hypothèses « (DD′) sépare A et B » (angles alternes-internes) ou « une diagonale sépare les deux autres points » (parallélogramme, Prop 3.1.3) se vérifient avec ça.</p>`,
 trap:`Les demi-plans P⁺ et P⁻ ne contiennent pas la droite Δ elle-même.`,
 q:"A et B sont de part et d'autre de Δ. Que sait-on du segment [AB] ?",a:"Il rencontre Δ (Prop 1.5.1 c).",
 rel:["axiome-7","meme-cote","demo-2-3-1"]});

/* ---------------- Même côté et signe ---------------- */
push({id:"meme-cote",type:"th",ref:"Prop 1.5.2",t:"Même côté = même signe d'angle",
 plain:`Pour savoir si deux points sont du même côté de la droite (OA), ${hl("regarde le signe")} de l'angle orienté depuis [OA) : même signe = même côté.`,
 fig:()=>({w:560,h:330,P:{O:[200,190],A:[420,170],M:[330,70],N:[150,80]},labels:{N:"M′"},
   draw:(P)=>{const a=ang(P.A,P.O,P.M),b=ang(P.A,P.O,P.N);return D.line(P.O,P.A,"l-ink")+D.ray(P.O,P.M,"l-thin")+D.ray(P.O,P.N,"l-thin")+D.arc(P.A,P.O,P.M,50,a>0?"l-cob":"l-amb",true,a>0?"cob":"amb")+D.arc(P.A,P.O,P.N,72,b>0?"l-cob":"l-amb",true,b>0?"cob":"amb")+D.pt(P.O,"O",V(P.O.x-10,P.O.y+60),"p-fix");},
   info:(P)=>{const a=ang(P.A,P.O,P.M),b=ang(P.A,P.O,P.N),same=a*b>0;return R.m([[an("AOM"),fa(a)],[an("AOM′"),fa(b)]])+R.v(same?"Même signe : M et M′ sont du même côté de (OA).":"Signes opposés : (OA) sépare M et M′.",same?"ok":"");},
   hint:"Flèche bleue : sens positif. Orange : négatif."}),
 formal:`<p><b>Proposition 1.5.2.</b> (3) Soit Δ = (OA). Deux points M, M′ hors de Δ sont dans le même demi-plan si et seulement si les mesures principales de ${an("AOM")} et ${an("AOM′")} sont de même signe.</p><p>Autres points de la proposition : (2) deux médianes d'un triangle se coupent ; (4) deux bissectrices d'un triangle se coupent. Preuves non faites en CM, résultats utilisables.</p>`,
 use:`<p>Utile quand un exercice demande de justifier une position (« E et D sont séparés par (BC) », CC1 2024 Ex. 2).</p>`,
 trap:`Ça marche avec les mesures principales, dans ]−π, π].`,
 q:`${an("AOM")} = π/3 et ${an("AOM′")} = −π/4. M et M′ sont-ils du même côté de (OA) ?`,a:"Non : les signes sont opposés, donc (OA) sépare M et M′.",
 rel:["demi-plans","axiome-4"]});

/* ---------------- Axiome VIII ---------------- */
push({id:"axiome-8",type:"ax",ref:"Axiome VIII",t:"Les aires",
 plain:`On admet qu'on sait mesurer les aires avec trois règles de bon sens : ${hl("un rectangle a pour aire longueur × largeur")}, on additionne les aires de morceaux qui ne se chevauchent pas, et deux triangles superposables ont la même aire.`,
 fig:()=>({w:560,h:320,P:{A:[110,250],B:[400,250],C:[400,110]},S:{cut:true},
   toggles:[{k:"cut",label:"Couper en deux triangles"}],
   drag:["B","C"],
   con:{B:(p,P)=>{P.C=V(Math.max(p.x,P.A.x+30),P.C.y);return V(Math.max(p.x,P.A.x+30),P.A.y);},C:(p,P)=>V(P.B.x,Math.min(p.y,P.A.y-30))},
   draw:(P,S)=>{const D4=V(P.A.x,P.C.y);let s=D.poly([P.A,P.B,P.C,D4],S.cut?"f-cob":"f-ink")+D.pline([P.A,P.B,P.C,D4,P.A],"l-ink")+D.right(P.A,P.B,P.C,12)+D.right(P.B,P.C,D4,12)+D.right(P.C,D4,P.A,12)+D.right(D4,P.A,P.B,12);
     if(S.cut)s+=D.poly([P.A,P.B,P.C],"f-amb")+D.seg(P.A,P.C,"l-amb");
     return s+D.pt(D4,"D",V((P.A.x+P.B.x)/2,(P.A.y+P.C.y)/2))+D.len(P.A,P.B,"t-mut",16)+D.len(P.B,P.C,"t-mut",-16);},
   info:(P,S)=>{const ab=d(P.A,P.B),bc=d(P.B,P.C);return R.m([["AB × BC",fr(ab*bc)],S.cut?["𝒜(ABC)",fr(ab*bc/2)]:null,S.cut?["𝒜(ACD)",fr(ab*bc/2)]:null])+R.v(S.cut?"Les deux triangles sont isométriques, donc de même aire, et ensemble ils font le rectangle : chacun vaut la moitié.":"Aire du rectangle = AB × BC (normalisation).","info");},
   hint:"Déplace A, B ou C."}),
 formal:`<p><b>Axiome VIII.</b> Il existe une fonction aire 𝒜 : {parties bornées du plan} → ℝ₊ telle que :</p><ul><li>(1) normalisation : pour tout rectangle ABCD, 𝒜(ABCD) = AB × BC ;</li><li>(2) additivité : si P et Q sont bornées et ${hl("disjointes")}, 𝒜(P ∪ Q) = 𝒜(P) + 𝒜(Q) ;</li><li>(3) invariance : deux triangles isométriques ont la même aire.</li></ul><p>Conséquence : la <b>monotonie</b>. Si P ⊂ Q, alors 𝒜(P) ≤ 𝒜(Q).</p>`,
 gloss:["𝒜 : la fonction aire","bornée : qui tient dans un disque"],
 use:`<p>Les aires sont l'outil caché de l'aire du triangle (2.4.1) et de Thalès (2.5.1). En exercice : écrire la même aire de deux façons (CC1 2025 Ex. 2, TD 1.11).</p>`,
 trap:`L'additivité demande des morceaux disjoints. Les bords communs ne gênent pas, car un segment a une aire nulle (Prop 1.6.1).`,
 q:"Deux triangles isométriques ont-ils toujours la même aire ?",a:"Oui : c'est l'invariance, axiome VIII (3).",
 rel:["demo-1-6-1","demo-2-4-1"]});

/* ---------------- Démo 1.6.1 ---------------- */
push({id:"demo-1-6-1",type:"demo",ref:"Proposition 1.6.1",t:"Démo : l'aire d'un segment est nulle",
 plain:`Un segment n'a pas d'épaisseur, donc pas d'aire. Pour le prouver avec les axiomes, on l'enferme dans ${hl("un rectangle aussi fin qu'on veut")}.`,
 hyp:"[AB] est un segment.",concl:"𝒜([AB]) = 0.",
 idea:`Enfermer [AB] dans un rectangle de hauteur ε, puis faire tendre ε vers 0.`,
 fig:()=>({w:560,h:280,P:{A:[120,150],B:[430,120]},S:{e:1,step:0},
   sliders:[{k:"e",label:"ε =",min:0.05,max:1.5,step:0.01,fmt:v=>fr(v)}],
   draw:(P,S)=>{const u=unit(sub(P.B,P.A)),n=G.perp(u),e=S.e*40,h=mul(n,e/2),o=mul(u,e/2);
     const R1=[add(add(P.A,mul(o,-1)),h),add(add(P.B,o),h),add(add(P.B,o),mul(h,-1)),add(add(P.A,mul(o,-1)),mul(h,-1))];
     return (S.step>=0?D.poly(R1,"fk2")+D.pline(R1.concat([R1[0]]),"lk2"):"")+D.seg(P.A,P.B,"lk1");},
   info:(P,S)=>{const ab=d(P.A,P.B);return R.m([["AB",fr(ab)],["ε",fr(S.e)],["(AB + ε) × ε",fr((ab+S.e)*S.e,3)]])+R.v("𝒜([AB]) est plus petite que ce nombre, pour tout ε > 0. Réduis ε : la borne tend vers 0.","info");},
   hint:"Fais glisser ε vers 0."}),
 steps:[
  {w:"Soit ε > 0. On recouvre [AB] par un rectangle de base AB + ε et de hauteur ε.",why:"Un segment n'a pas d'épaisseur : un rectangle aussi fin qu'on veut le contient."},
  {w:"Par monotonie de l'aire, 𝒜([AB]) ≤ (AB + ε) × ε.",why:"La monotonie vient de l'additivité : une partie incluse dans une autre a une aire plus petite. Et l'aire du rectangle est base × hauteur (normalisation)."},
  {w:"En faisant tendre ε vers 0, on obtient 𝒜([AB]) = 0.",why:"Un nombre positif plus petit que (AB + ε) × ε pour tout ε > 0 ne peut être que 0."}],
 redac:`<p>Soit [AB] un segment. Pour tout ε > 0, on peut recouvrir [AB] par un rectangle de base AB + ε et de hauteur ε. Par monotonie de l'aire, on en déduit que 𝒜([AB]) ≤ (AB + ε) × ε. En faisant tendre ε vers 0, on obtient 𝒜([AB]) = 0.</p>`,
 rel:["axiome-8","demo-2-4-1"]});

})();
