/* Chapitre 2 : isométries, symétrie centrale, angles alternes-internes, aires, Thalès */
(function(){
const {V,D,R,d,dpx,fl,fa,fr,ang,absang,mid,proj,param,inter,sym,rot,reflect,side,onLine,onSeg,onRay,snapLine,near,parallel,unit,perp,add,sub,mul,lerp,segInter,crs,PI}=G;
const an=s=>`<span class="ang">${s}</span>`, m=s=>`<span class="m">${s}</span>`, hl=s=>`<span class="hl">${s}</span>`;
const C=window.CONCEPTS;
const push=o=>{o.ch=2;C.push(o);};
const yes=(b,t1,t2)=>b?`<span class="ok">${t1||"oui"}</span>`:`<span class="no">${t2||"non"}</span>`;
const tri=(A,B,Cc,cl,fill)=>(fill?D.poly([A,B,Cc],fill):"")+D.pline([A,B,Cc,A],cl||"l-ink");
const area=(A,B,Cc)=>Math.abs(crs(sub(B,A),sub(Cc,A)))/2/1600;

/* ---------------- Isométries ---------------- */
function iso(p,P,S){if(S.mode==="rot")return rot(p,P.O,S.t);if(S.mode==="sym")return sym(p,P.O);if(S.mode==="refl")return V(2*P.O.x-p.x,p.y);return add(P.O,mul(sub(p,P.O),1.5));}
push({id:"isometrie",type:"def",ref:"Déf 2.1.1, Prop 2.1.2 et 2.1.4",t:"Les isométries",
 plain:`Une isométrie déplace le plan ${hl("sans rien déformer")} : elle peut tourner, retourner ou faire glisser une figure, mais toutes les longueurs restent les mêmes. Du coup, une droite reste une droite et les angles gardent leur ouverture.`,
 fig:()=>({w:600,h:340,P:{A:[110,90],B:[70,240],C:[220,210],O:[300,170]},S:{mode:"rot",t:1.2},labels:{O:"O"},
   sliders:[{k:"t",label:"Angle de la rotation :",min:-3.1,max:3.1,step:0.01,fmt:v=>G.piTxt(v)}],
   buttons:[{label:"Rotation",act:(P,S)=>{S.mode="rot";}},{label:"Symétrie centrale",act:(P,S)=>{S.mode="sym";}},{label:"Miroir",act:(P,S)=>{S.mode="refl";}},{label:"Agrandissement",act:(P,S)=>{S.mode="homo";}}],
   draw:(P,S)=>{const f=q=>iso(q,P,S),A2=f(P.A),B2=f(P.B),C2=f(P.C);
     let s=D.line(P.A,P.B,"l-cons")+D.line(A2,B2,"l-cons")+tri(P.A,P.B,P.C,"l-ink","f-ink")+tri(A2,B2,C2,S.mode==="homo"?"l-red":"l-cob",S.mode==="homo"?"f-red":"f-cob");
     if(S.mode==="refl")s+=D.line(P.O,add(P.O,V(0,10)),"l-amb-d");
     return s+D.pt(A2,"A′",P.O,"p-cob","t-cob")+D.pt(B2,"B′",P.O,"p-cob","t-cob")+D.pt(C2,"C′",P.O,"p-cob","t-cob");},
   info:(P,S)=>{const f=q=>iso(q,P,S),A2=f(P.A),B2=f(P.B),C2=f(P.C);const ok=S.mode!=="homo";
     return R.m([["AB",fl(P.A,P.B)],["A′B′",fl(A2,B2)],["BC",fl(P.B,P.C)],["B′C′",fl(B2,C2)],["|B̂|",fa(absang(P.A,P.B,P.C))],["|B̂′|",fa(absang(A2,B2,C2))],[an("ABC"),fa(ang(P.A,P.B,P.C),false)],[an("A′B′C′"),fa(ang(A2,B2,C2),false)]])
      +R.v(ok?(S.mode==="refl"?"Isométrie : longueurs et angles non orientés conservés. Mais le miroir change le signe des angles orientés.":"Isométrie : longueurs et angles conservés. La droite (AB) devient la droite (A′B′)."):"Pas une isométrie : les longueurs sont multipliées par 1,5. La droite reste une droite (Remarque 2.1.3), mais ce n'est plus une isométrie.",ok?"ok":"");},
   hint:"Choisis une transformation, puis déforme le triangle."}),
 formal:`<p><b>Définition 2.1.1.</b> Une isométrie du plan est une application f : P → P ${hl("bijective")} telle que f(A)f(B) = AB pour tous A, B.</p><p><b>Proposition 2.1.2.</b> L'image d'une droite par une isométrie est une droite.</p><p><b>Proposition 2.1.4.</b> Une isométrie préserve les angles non orientés : |${an("s(A)s(B)s(C)")}| = |${an("ABC")}| (preuve : CCC).</p><p><b>Remarque 2.1.3.</b> Si f(A)f(B) = α·AB avec α > 0 fixé, l'image d'une droite est encore une droite.</p>`,
 gloss:["bijective : chaque point a exactement un antécédent","f(A)f(B) : la distance entre les images"],
 use:`<p>Tout ce qu'on démontre sur une figure se transporte à son image : longueurs égales, droites, angles. Les symétries centrales (§2.2) sont les isométries les plus utilisées au CC1.</p>`,
 trap:`Une isométrie conserve les angles <b>non orientés</b>. Les angles orientés peuvent changer de signe (miroir). La symétrie centrale, elle, conserve aussi les angles orientés (Thm 2.2.3).`,
 q:"Une isométrie conserve-t-elle toujours les angles orientés ?",a:"Non : un miroir change leur signe. Elle conserve toujours les angles non orientés (Prop 2.1.4).",
 rel:["demo-2-1-2","symetrie-centrale","thm-2-2-3"]});

/* ---------------- Démo 2.1.2 ---------------- */
push({id:"demo-2-1-2",type:"demo",ref:"Proposition 2.1.2",t:"Démo : une isométrie envoie une droite sur une droite",
 plain:`On montre que l'image d'une droite est une droite, en passant par les segments puis par les demi-droites. Tout repose sur une remarque : ${hl("la définition du segment n'utilise que des distances")}, que l'isométrie conserve.`,
 hyp:"s est une isométrie et Δ est une droite.",concl:"s(Δ) est une droite.",
 idea:`Segment → segment (on garde AM + MB = AB), puis demi-droite → demi-droite par double inclusion, puis Δ = [AB) ∪ [BA).`,
 fig:()=>({w:600,h:320,P:{A:[80,250],B:[220,180],M:[300,140]},S:{step:0},
   con:{M:(p,P)=>onLine(p,P.A,P.B)},
   draw:(P,S)=>{const O=V(330,200),t=-1.1,f=q=>add(rot(q,O,t),V(80,-20));const A2=f(P.A),B2=f(P.B),M2=f(P.M),k=S.step;
     let s=D.line(P.A,P.B,k===4?"l-cob":"l-cons")+D.line(A2,B2,k===4?"l-cob":"l-cons");
     if(k===0){s+=D.seg(P.A,P.B,"l-cob")+D.seg(A2,B2,"l-cob");}
     if(k===1){s+=D.ray(P.A,P.B,"l-cob")+D.ray(A2,B2,"l-cob");}
     if(k===2||k===3){s+=D.ray(P.A,P.B,"l-cob")+D.ray(A2,B2,"l-cob");const lam=dpx(P.A,P.M);s+=D.circ(P.A,lam,"l-cons")+D.circ(A2,lam,"l-cons")+D.txt(mid(A2,M2),"λ","tk2",10,-10)+D.txt(mid(P.A,P.M),"λ","tk2",10,-10);}
     s+=D.pt(P.A,"",null)+D.pt(A2,"s(A)",O,"p-cob","t-cob")+D.pt(B2,"s(B)",O,"p-cob","t-cob")+D.pt(M2,k>=2&&k<=3?"N = s(M)":"s(M)",O,"pk3","tk3");
     return s;},
   info:(P)=>{const O=V(330,200),t=-1.1,f=q=>add(rot(q,O,t),V(80,-20));const A2=f(P.A),B2=f(P.B),M2=f(P.M);const tm=param(P.M,P.A,P.B);
     return R.m([["AM + MB",fr(d(P.A,P.M)+d(P.M,P.B))],["AB",fl(P.A,P.B)],["s(A)s(M) + s(M)s(B)",fr(d(A2,M2)+d(M2,B2))],["M ∈ [AB) ?",yes(tm>=-1e-6)],["s(M) ∈ [s(A)s(B)) ?",yes(param(M2,A2,B2)>=-1e-6)]]);},
   hint:"M glisse sur la droite : son image reste sur la droite image."}),
 steps:[
  {w:"Si M ∈ [AB], alors AM + MB = AB. Comme s préserve les distances, s(A)s(M) + s(M)s(B) = s(A)s(B), donc s(M) ∈ [s(A)s(B)].",why:"La définition du segment n'utilise que trois distances, et s ne les change pas."},
  {w:"Soient A ≠ B deux points de Δ et M ∈ [AB). Alors M ∈ [AB] ou B ∈ [AM]. D'après l'étape 1, s(M) ∈ [s(A)s(B)] ou s(B) ∈ [s(A)s(M)], c'est-à-dire s(M) ∈ [s(A)s(B)). Donc s([AB)) ⊂ [s(A)s(B)).",why:"La définition de la demi-droite n'utilise que des segments, et s envoie un segment sur un segment."},
  {w:"Réciproquement, soit N ∈ [s(A)s(B)) et λ = s(A)N. Soit M l'unique point de [AB) tel que AM = λ (axiome III e). Alors s(M) ∈ [s(A)s(B)) et s(A)s(M) = AM = λ.",why:"On fabrique un antécédent candidat : le point de [AB) à la bonne distance de A."},
  {w:"Il n'y a qu'un seul point de [s(A)s(B)) à distance λ de s(A), donc s(M) = N. On a trouvé un antécédent de N : [s(A)s(B)) ⊂ s([AB)).",why:"Sur une demi-droite, un seul point est à une distance donnée de l'origine (axiome III e)."},
  {w:"Comme Δ = [AB) ∪ [BA), on obtient s(Δ) = [s(A)s(B)) ∪ [s(B)s(A)), qui est la droite (s(A)s(B)).",why:"Une droite est la réunion de deux demi-droites ; on applique le résultat aux deux."}],
 redac:`<p>Soient A, B ∈ P. Pour tout M ∈ [AB], on a AM + MB = AB, donc s(A)s(M) + s(M)s(B) = s(A)s(B) car s préserve les distances, c'est-à-dire s(M) ∈ [s(A)s(B)].</p><p>Soient A ≠ B deux points de Δ. Soit M ∈ [AB). Alors M ∈ [AB] ou B ∈ [AM], donc s(M) ∈ [s(A)s(B)] ou s(B) ∈ [s(A)s(M)], c'est-à-dire s(M) ∈ [s(A)s(B)). Ainsi s([AB)) ⊂ [s(A)s(B)).</p><p>Réciproquement, soit N ∈ [s(A)s(B)) et λ = s(A)N. Soit M l'unique point de [AB) tel que AM = λ. Alors s(M) ∈ [s(A)s(B)) et s(A)s(M) = AM = λ. Ainsi s(M) est l'unique point de [s(A)s(B)) à distance λ de s(A), donc s(M) = N. D'où [s(A)s(B)) ⊂ s([AB)), et s([AB)) = [s(A)s(B)).</p><p>Enfin, Δ = [AB) ∪ [BA), donc s(Δ) = [s(A)s(B)) ∪ [s(B)s(A)) : c'est la droite (s(A)s(B)).</p>`,
 rel:["isometrie","segment","demi-droite","axiome-3"]});

/* ---------------- Symétrie centrale ---------------- */
push({id:"symetrie-centrale",type:"def",ref:"Lemme 2.2.1 et Déf 2.2.2",t:"La symétrie centrale",
 plain:`Le symétrique de A par rapport à O, c'est le point A′ ${hl("de l'autre côté de O, à la même distance")} : O est le milieu de [AA′]. C'est un demi-tour autour de O.`,
 fig:()=>({w:560,h:320,P:{O:[280,170],A:[160,90],B:[150,220]},labels:{O:"O"},
   con:{A:(p,P)=>dpx(p,P.O)<9?V(P.O.x,P.O.y):p},
   draw:(P)=>{const A2=sym(P.A,P.O),B2=sym(P.B,P.O);let s=D.seg(P.A,A2,"l-cons")+D.seg(P.B,B2,"l-cons")+D.seg(P.A,P.B,"l-ink")+D.seg(A2,B2,"l-cob");
     if(dpx(P.A,P.O)>1)s+=D.ticks(P.A,P.O,1,"l-amb")+D.ticks(P.O,A2,1,"l-amb");
     s+=D.ticks(P.B,P.O,2,"l-thin")+D.ticks(P.O,B2,2,"l-thin");
     return s+D.pt(A2,"A′",P.O,"p-cob","t-cob")+D.pt(B2,"B′",P.O,"p-cob","t-cob");},
   info:(P)=>{const A2=sym(P.A,P.O),B2=sym(P.B,P.O);const fixe=dpx(P.A,P.O)<1;return R.m([["OA",fl(P.O,P.A)],["OA′",fl(P.O,A2)],["AA′",fl(P.A,A2)],["AB",fl(P.A,P.B)],["A′B′",fl(A2,B2)]])+R.v(fixe?"A = O, et son symétrique est O lui-même.":"O est le milieu de [AA′]. Et (A′B′) est parallèle à (AB), de même longueur.",fixe?"ok":"info");},
   goal:{text:"place A pour que A′ = A.",ok:(P)=>dpx(P.A,P.O)<1,win:"il faut A = O : le centre est le seul point qui ne bouge pas, s(O) = O."}}),
 formal:`<p><b>Lemme 2.2.1.</b> Soit O un point. Pour tout point A, il existe un unique point A′ tel que O soit le milieu de [AA′].</p><p><b>Définition 2.2.2.</b> La symétrie centrale de centre O est l'application s = s<sub>O</sub> qui à A associe l'unique point s(A) tel que O soit le milieu de [A s(A)].</p><p>On a s(O) = O et ${hl("s ∘ s = id")} : s(s(A)) = A pour tout A.</p>`,
 gloss:["s∘s : appliquer s deux fois","id : l'application qui ne bouge rien"],
 use:`<p>« Soit O le milieu de [BD] et s la symétrie de centre O » est la phrase d'ouverture de quatre démos exigibles : 2.2.4, 2.3.1, 3.1.2 et 3.2.6. On choisit le centre au milieu d'un segment bien placé.</p>`,
 trap:`Ne confonds pas avec la symétrie par rapport à une droite (la symétrie orthogonale, Déf 2.3.3).`,
 q:"s est la symétrie de centre O. Que vaut s(s(A)) ?",a:"A : O est le milieu de [A s(A)], donc aussi de [s(A) A]. Ainsi s ∘ s = id.",
 rel:["demo-2-2-1","thm-2-2-3","milieu"]});

/* ---------------- Démo 2.2.1 ---------------- */
push({id:"demo-2-2-1",type:"demo",ref:"Lemme 2.2.1",t:"Démo : existence et unicité du symétrique",
 plain:`On fabrique le symétrique de A avec les règles de la distance : ${hl("l'axiome III (e) donne le point, III (d) prouve que O est au milieu")}, et III (e) encore donne l'unicité.`,
 hyp:"O et A sont deux points.",concl:"il existe un unique point A′ tel que O soit le milieu de [AA′].",
 idea:`Sur la droite (AO), il y a exactement deux points à distance AO de O : A et un autre, A′. L'axiome III (d) montre que O est entre les deux.`,
 fig:()=>({w:560,h:280,P:{O:[280,150],A:[150,200]},S:{step:0},labels:{O:"O"},
   draw:(P,S)=>{const k=S.step,A2=sym(P.A,P.O),r=dpx(P.A,P.O);let s="";
     if(k===0){return D.pt(P.O,"",null,"p-cob")+D.txt(V(20,30),"Si A = O, on prend A′ = O.","t-mut t-up");}
     s+=D.line(P.A,P.O,"lk1")+D.txt(V(20,30),"Δ = (AO), λ = AO","t-mut t-up");
     if(k>=1)s+=D.circ(P.O,r,"l-cons")+D.pt(A2,"A′",P.A,"pk3","tk3");
     if(k>=2)s+=D.len(P.A,P.O,"tk2",-16)+D.len(P.O,A2,"tk2",-16);
     if(k>=3)s+=D.seg(P.A,A2,"l-cob")+D.ticks(P.A,P.O,1,"l-cob")+D.ticks(P.O,A2,1,"l-cob");
     if(k>=4)s+=D.txt(V(20,54),"Un autre point A″ ? Il serait aussi sur le cercle et sur Δ : A″ = A′.","tk5 t-up");
     return s;},
   info:(P)=>{const A2=sym(P.A,P.O);return R.m([["AO",fl(P.A,P.O)],["A′O",fl(A2,P.O)],["AA′",fl(P.A,A2)],["AO + A′O",fr(d(P.A,P.O)*2)]]);},
   hide:(k,P,S)=>S.step===0&&k==="A"}),
 steps:[
  {w:"Si A = O, alors A′ = O convient, et c'est le seul.",why:"O est le milieu de [OO] = {O}, et de rien d'autre puisque OA′ = 0 force A′ = O."},
  {w:"Sinon, soit Δ = (AO) et λ = AO > 0. Par l'axiome III (e), il existe un second point A′ ≠ A de Δ tel que A′O = λ.",why:"Sur une droite, il y a exactement deux points à distance λ de O : A et un autre."},
  {w:"A, O et A′ sont alignés, donc par l'axiome III (d) : AO = A′O + AA′, ou A′O = AO + AA′, ou AA′ = AO + A′O.",why:"Pour trois points alignés, la plus grande distance est la somme des deux autres."},
  {w:"Comme AO = A′O, les deux premiers cas donnent AA′ = 0, c'est-à-dire A = A′ : impossible. Donc AA′ = 2λ, et O est le milieu de [AA′].",why:"OA = OA′ = λ = AA′/2 : c'est exactement la définition du milieu."},
  {w:"Unicité : si O est aussi le milieu de [AA″], alors A, O, A″ sont alignés, donc A″ ∈ Δ, et OA″ = λ. Par III (e), A″ = A ou A″ = A′. Or A″ = A est impossible car O ≠ A. Donc A″ = A′.",why:"Il n'y a que deux candidats sur la droite, et A ne marche pas."}],
 redac:`<p>Si A = O, alors A′ = O est l'unique point convenable. Supposons A ≠ O et posons Δ = (AO). On applique l'axiome III (e) avec λ = AO > 0 : il fournit un second point A′ de Δ tel que A′O = λ = AO. Comme A, O et A′ sont alignés, l'axiome III (d) implique que l'une des égalités suivantes est vraie : (i) AO = A′O + AA′, (ii) A′O = AO + AA′, (iii) AA′ = AO + A′O. Comme AO = A′O, les cas (i) et (ii) sont impossibles. On est donc dans le cas (iii) et AA′ = 2λ : O est le milieu de [AA′].</p><p>Unicité. Si O est aussi le milieu de [AA″], alors A, A″, O sont alignés avec OA = OA″. D'après l'axiome III (e), A″ = A ou A″ = A′. Or A″ = A est impossible car O n'est pas le milieu de [AA] = {A} quand O ≠ A. Donc A″ = A′.</p>`,
 rel:["symetrie-centrale","axiome-3","milieu"]});

/* ---------------- Thm 2.2.3 ---------------- */
push({id:"thm-2-2-3",type:"th",ref:"Théorème 2.2.3",t:"Trois propriétés de la symétrie centrale",cc:"Tombé en 2025 · 2 pts",
 plain:`La symétrie centrale est un demi-tour : elle ${hl("garde les longueurs")}, elle envoie chaque droite sur ${hl("une droite parallèle")}, et elle ${hl("garde le sens des angles")}, parce qu'un demi-tour ne retourne pas la feuille.`,
 fig:()=>({w:600,h:330,P:{O:[300,170],A:[120,80],B:[90,230],C:[230,240]},labels:{O:"O"},
   con:{O:(p,P)=>snapLine(p,P.A,P.B,8)},
   draw:(P)=>{const f=q=>sym(q,P.O),A2=f(P.A),B2=f(P.B),C2=f(P.C);const onL=dpx(P.O,proj(P.O,P.A,P.B))<0.5;
     return D.line(P.A,P.B,"l-amb")+D.line(A2,B2,onL?"l-amb-d":"l-cob")+tri(P.A,P.B,P.C,"l-ink","f-ink")+tri(A2,B2,C2,"l-cob","f-cob")+D.arc(P.A,P.B,P.C,30,"l-amb",true,"amb")+D.arc(A2,B2,C2,30,"l-amb",true,"amb")+D.pt(A2,"s(A)",P.O,"p-cob","t-cob")+D.pt(B2,"s(B)",P.O,"p-cob","t-cob")+D.pt(C2,"s(C)",P.O,"p-cob","t-cob");},
   info:(P)=>{const f=q=>sym(q,P.O),A2=f(P.A),B2=f(P.B),C2=f(P.C);const onL=dpx(P.O,proj(P.O,P.A,P.B))<0.5;
     return R.m([["(1) AB",fl(P.A,P.B)],["s(A)s(B)",fl(A2,B2)],["(2) parallèles ?",yes(parallel(P.A,P.B,A2,B2,0.001))],["(3) "+an("ABC"),fa(ang(P.A,P.B,P.C),false)],[an("s(A)s(B)s(C)"),fa(ang(A2,B2,C2),false)]])+R.v(onL?"O est sur (AB) : l'image de (AB) est (AB) elle-même (« parallèle » au sens confondue).":"(AB) et son image sont parallèles et distinctes.",onL?"ok":"info");},
   goal:{text:"place O sur la droite orange (AB). Que devient son image ?",ok:(P)=>dpx(P.O,proj(P.O,P.A,P.B))<0.5,win:"s((AB)) = (AB) : quand le centre est sur la droite, elle est envoyée sur elle-même."}}),
 formal:`<p><b>Théorème 2.2.3.</b> Soit s une symétrie centrale. Alors :</p><ul><li>(1) s est une isométrie : elle est bijective et préserve les distances ;</li><li>(2) pour toute droite Δ, son image s(Δ) est une droite parallèle (ou confondue) à Δ ;</li><li>(3) s préserve les angles orientés : ${an("s(A)s(B)s(C)")} = ${an("ABC")}.</li></ul><p>En particulier s((AB)) = (s(A)s(B)) dès que A ≠ B.</p>`,
 use:`<p>C'est la réponse attendue à « Énoncer trois propriétés des symétries centrales » (CC1 2025, 2 points). Dans les démos : (1) donne les longueurs égales, (2) les parallèles, (3) les angles orientés égaux.</p>`,
 trap:`« Parallèle » inclut « confondue » : s(Δ) = Δ exactement quand O ∈ Δ.`,
 q:"Énonce trois propriétés des symétries centrales (question du CC1 2025, 2 points).",a:"(1) C'est une isométrie (bijective, conserve les distances). (2) L'image d'une droite est une droite parallèle. (3) Elle préserve les angles orientés.",
 rel:["symetrie-centrale","demo-2-2-4","demo-2-3-1","demo-3-1-2"]});

/* ---------------- Démo 2.2.4 ---------------- */
function para4(P){const Dd=inter(P.C,add(P.C,sub(P.B,P.A)),P.A,add(P.A,sub(P.C,P.B)));return Dd||add(P.A,sub(P.C,P.B));}
push({id:"demo-2-2-4",type:"demo",ref:"Corollaire 2.2.4",t:"Démo : côtés parallèles ⇒ côtés égaux et diagonales de même milieu",
 plain:`Un quadrilatère dont les côtés opposés sont parallèles a ses côtés opposés de même longueur et ses diagonales qui se coupent en leur milieu. L'astuce : ${hl("la symétrie autour du milieu de [BD]")} échange les côtés.`,
 hyp:"A, B, C, D non alignés, (AB) // (CD) et (AD) // (BC).",concl:"AB = CD, AD = BC, et [AC], [BD] ont le même milieu.",
 idea:`Soit O le milieu de [BD] et s la symétrie de centre O. Avec l'unicité de la parallèle, on montre s(C) = A.`,
 fig:()=>({w:560,h:320,P:{A:[110,250],B:[190,90],C:[450,80]},S:{step:0},
   draw:(P,S)=>{const k=S.step,Dd=para4(P),O=mid(P.B,Dd),sC=sym(P.C,O);
     let s=D.pline([P.A,P.B,P.C,Dd,P.A],"l-ink")+D.seg(P.B,Dd,"l-cons")+D.pt(Dd,"D",mid(P.A,P.C))+D.pt(O,"O",P.C,"p-cob","t-cob");
     if(k===1)s+=D.line(P.B,P.C,"lk1d")+D.line(P.A,Dd,"lk1")+D.txt(V(16,26),"s((BC)) : parallèle à (BC) et passe par D, donc = (AD)","t-cob t-up");
     if(k===2)s+=D.line(Dd,P.C,"lk3d")+D.line(P.A,P.B,"lk3")+D.txt(V(16,26),"s((CD)) : parallèle à (CD) et passe par B, donc = (AB)","t-cob t-up");
     if(k===3)s+=D.line(P.A,Dd,"lk1")+D.line(P.A,P.B,"lk3")+D.seg(P.C,sC,"lk2d")+D.dot(sC,"pk2",6)+D.txt(V(16,26),"s(C) est sur les deux droites : s(C) = A","t-cob t-up");
     if(k===4)s+=D.ticks(P.A,P.B,1,"l-cob")+D.ticks(P.C,Dd,1,"l-cob")+D.ticks(P.B,P.C,2,"l-amb")+D.ticks(Dd,P.A,2,"l-amb")+D.seg(P.A,P.C,"l-cob-d");
     if(k===0)s+=D.ticks(P.B,O,1,"l-cob")+D.ticks(O,Dd,1,"l-cob")+D.txt(V(16,26),"O milieu de [BD] : s(B) = D","t-cob t-up");
     return s;},
   info:(P)=>{const Dd=para4(P),O=mid(P.B,Dd);return R.m([["AB",fl(P.A,P.B)],["CD",fl(P.C,Dd)],["AD",fl(P.A,Dd)],["BC",fl(P.B,P.C)],["milieu de [AC] = O ?",yes(dpx(mid(P.A,P.C),O)<0.5)]]);},
   hint:"D est construit pour que (AB) // (CD) et (AD) // (BC)."}),
 steps:[
  {w:"Soit O le milieu de [BD] et s = s<sub>O</sub> la symétrie centrale de centre O. On a s(B) = D par définition.",why:"O est le milieu de [BD], et s(B) est l'unique point tel que O soit le milieu de [B s(B)]."},
  {w:"La droite s((BC)) est parallèle à (BC) (Thm 2.2.3) et elle passe par s(B) = D. Par unicité de la parallèle à (BC) passant par D (axiome II), s((BC)) = (AD). En particulier s(C) ∈ (AD).",why:"(AD) est aussi parallèle à (BC) et passe par D : il n'y en a qu'une."},
  {w:"On montre de même que s((CD)) = (AB), d'où s(C) ∈ (AB).",why:"s((CD)) est parallèle à (CD) et passe par s(D) = B, comme (AB)."},
  {w:"Alors s(C) ∈ (AB) ∩ (AD) = {A}, donc s(C) = A.",why:"(AB) et (AD) sont deux droites distinctes qui se coupent seulement en A, car les points ne sont pas alignés."},
  {w:"On obtient CD = s(C)s(D) = AB et BC = s(B)s(C) = DA, puisque s est une isométrie. De plus, O est le milieu de [AC].",why:"s(C) = A veut dire que O est le milieu de [CA]. Les longueurs se lisent sur les images."}],
 redac:`<p>Soit O le milieu de [BD] et s = s<sub>O</sub>. On a s(B) = D par définition. La droite s((BC)) est parallèle à (BC) par 2.2.3, et elle passe par D = s(B). Par unicité de la parallèle à une droite passant par un point, on en déduit que s((BC)) = (AD). En particulier s(C) ∈ (AD). On montre de même que s((CD)) = (AB), d'où s(C) ∈ (AB).</p><p>Alors s(C) ∈ (AB) ∩ (AD) = {A}, donc s(C) = A, et on obtient CD = s(C)s(D) = AB et BC = s(B)s(C) = DA. De plus, O est le milieu de [AC].</p>`,
 rel:["thm-2-2-3","axiome-2","parallelogramme"]});

/* ---------------- Angles alternes-internes ---------------- */
function aiFig(withSym){return {w:580,h:330,P:{D:[230,90],A:[70,90],Dp:[330,250],B:[520,250]},labels:{Dp:"D′"},S:{step:0},
   con:{B:(p,P)=>{const Q=add(P.Dp,sub(P.D,P.A));return snapLine(p,P.Dp,Q,8);}},
   draw:(P,S)=>{const par=parallel(P.D,P.A,P.Dp,P.B,0.002);let s=D.line(P.A,P.D,"lk1")+D.line(P.B,P.Dp,"lk3")+D.line(P.D,P.Dp,"l-thin")+D.txt(add(P.A,V(-30,-14)),"Δ","tk1")+D.txt(add(P.B,V(14,-14)),"Δ′","tk3");
     s+=D.wedge(P.A,P.D,P.Dp,40,"f-amb")+D.arc(P.A,P.D,P.Dp,40,"l-amb",true,"amb")+D.wedge(P.B,P.Dp,P.D,40,"f-cob")+D.arc(P.B,P.Dp,P.D,40,"l-cob",true,"cob");
     if(withSym){const O=mid(P.D,P.Dp),sA=sym(P.A,O),k=S.step;s+=D.pt(O,"O",P.A,"p-cob","t-cob");
       if(k>=0)s+=D.line(sA,P.Dp,"lk1d")+D.seg(P.A,sA,"l-cons")+D.pt(sA,"s(A)",O,"pk2","tk2");}
     return s+(par?D.txt(V(16,26),"Δ // Δ′","t-ok t-up"):"");},
   info:(P)=>{const a=ang(P.A,P.D,P.Dp),b=ang(P.B,P.Dp,P.D),par=parallel(P.D,P.A,P.Dp,P.B,0.002),sep=side(P.A,P.D,P.Dp)*side(P.B,P.D,P.Dp)<0;
     return R.m([[an("ADD′"),fa(a)],[an("BD′D"),fa(b)],["parallèles ?",yes(par)]])+R.v(!sep?"Attention : A et B doivent être de part et d'autre de la sécante (DD′).":par?"Δ // Δ′ et les angles alternes-internes sont égaux.":"Angles différents : Δ et Δ′ ne sont pas parallèles.",sep&&par?"ok":"");},
   goal:withSym?null:{text:"tourne Δ′ (déplace B) jusqu'à ce que les deux angles soient égaux.",ok:(P)=>parallel(P.D,P.A,P.Dp,P.B,0.002)&&side(P.A,P.D,P.Dp)*side(P.B,P.D,P.Dp)<0,win:"les angles sont égaux exactement quand Δ // Δ′."},
   hint:"Déplace B pour tourner Δ′."};}
push({id:"alternes-internes",type:"th",ref:"Théorème 2.3.1",t:"Les angles alternes-internes",short:"Angles alternes-internes",
 plain:`Deux droites coupées par une sécante forment deux angles « en Z », de part et d'autre de la sécante. ${hl("Ils sont égaux exactement quand les deux droites sont parallèles.")}`,
 fig:()=>aiFig(false),
 formal:`<p><b>Théorème 2.3.1.</b> Soient Δ, Δ′ deux droites, D ∈ Δ ∖ Δ′ et D′ ∈ Δ′ ∖ Δ. Soient A ∈ Δ ∖ {D} et B ∈ Δ′ ∖ {D′} tels que ${hl("la droite (DD′) sépare A et B")}. Les trois assertions suivantes sont équivalentes :</p><ul><li>(i) Δ et Δ′ sont parallèles ;</li><li>(ii) ${an("ADD′")} = ${an("BD′D")} ;</li><li>(iii) |${an("ADD′")}| = |${an("BD′D")}|.</li></ul>`,
 gloss:["Δ ∖ Δ′ : les points de Δ qui ne sont pas sur Δ′","« sépare A et B » : A et B de part et d'autre"],
 use:`<p>Dans un sens, pour prouver un parallélisme : trouve une sécante et deux angles alternes-internes égaux (CC1 2024 Ex. 2 (c)(iv)). Dans l'autre, des parallèles donnent des angles égaux (somme des angles d'un triangle, Prop 2.4.2).</p>`,
 trap:`Vérifie l'hypothèse « (DD′) sépare A et B ». Si A et B sont du même côté, ce ne sont pas des angles alternes-internes.`,
 q:"Δ et Δ′ sont parallèles et coupées par une sécante. Que dire des angles alternes-internes ?",a:"Ils sont égaux, en orienté comme en non orienté (Thm 2.3.1, (i) ⇒ (ii) ⇒ (iii)).",
 rel:["demo-2-3-1","somme-angles","perpendiculaire"]});

push({id:"demo-2-3-1",type:"demo",ref:"Théorème 2.3.1",t:"Démo : angles alternes-internes",
 plain:`La preuve utilise ${hl("la symétrie autour du milieu O de [DD′]")} : elle envoie Δ sur une parallèle qui passe par D′, et retourne l'angle en D en un angle en D′.`,
 hyp:"D ∈ Δ ∖ Δ′, D′ ∈ Δ′ ∖ Δ, A ∈ Δ ∖ {D}, B ∈ Δ′ ∖ {D′}, et (DD′) sépare A et B.",concl:`(i) Δ // Δ′ ⇔ (ii) ${an("ADD′")} = ${an("BD′D")} ⇔ (iii) |${an("ADD′")}| = |${an("BD′D")}|.`,
 idea:`s = symétrie de centre O, milieu de [DD′]. s(Δ) est la parallèle à Δ passant par D′, et s(A) est du même côté de (DD′) que B.`,
 fig:()=>aiFig(true),
 steps:[
  {w:"Soit O le milieu de [DD′] et s = s<sub>O</sub>. D'après le Thm 2.2.3, s(Δ) est parallèle à Δ, et elle passe par s(D) = D′. De plus s(A) et B sont du même côté de (DD′).",why:"s envoie D sur D′. Et A est d'un côté de (DD′), donc s(A) est de l'autre, comme B."},
  {w:`(i) ⇒ (ii). Si Δ // Δ′, alors s(Δ) = Δ′ par unicité de la parallèle à Δ passant par D′. Donc s(A) ∈ Δ′, et comme s(A) et B sont du même côté de (DD′), ${an("s(A)D′B")} = 0.`,why:"s(A) et B sont sur la même demi-droite issue de D′."},
  {w:`On obtient ${an("ADD′")} = ${an("ADO")} = ${an("s(A)s(D)s(O)")} = ${an("s(A)D′O")} = ${an("BD′O")} = ${an("BD′D")}.`,why:"La 2ᵉ égalité : s préserve les angles orientés (2.2.3). Les autres : on change de point sur la même demi-droite (axiome IV a)."},
  {w:"(ii) ⇒ (iii) est évident.",why:"Deux angles orientés égaux ont la même valeur absolue."},
  {w:`(iii) ⇒ (i). On a |${an("BD′O")}| = |${an("ADD′")}| = |${an("ADO")}| = |${an("s(A)D′O")}|. Comme s(A) et B sont du même côté de (DD′), s(A) ∈ [D′B).`,why:"Même ouverture et même côté de (DD′) : c'est la même demi-droite issue de D′."},
  {w:"Donc s(Δ) = s((AD)) = (s(A)s(D)) = (BD′) = Δ′. Or s(Δ) est parallèle à Δ (2.2.3), donc Δ // Δ′.",why:"L'image de Δ est Δ′, et l'image d'une droite par une symétrie centrale lui est parallèle."}],
 redac:`<p>Soit O le milieu de [DD′] et s = s<sub>O</sub>. D'après le théorème 2.2.3, s(Δ) est parallèle à Δ. Elle passe de plus par s(D) = D′. Remarquons aussi que s(A) et B sont du même côté de (DD′), puisqu'aucun d'eux n'est du côté de A.</p><p>(i) ⇒ (ii). Si Δ // Δ′, on a s(Δ) = Δ′, par unicité de la droite parallèle à Δ passant par D′. En particulier s(A) ∈ Δ′, donc D′, s(A) et B sont alignés. Comme s(A) et B sont du même côté de (DD′), ${an("s(A)D′B")} = 0. On obtient ${an("ADD′")} = ${an("ADO")} = ${an("s(A)s(D)s(O)")} = ${an("s(A)D′O")} = ${an("BD′O")} = ${an("BD′D")}, la deuxième égalité provenant du théorème 2.2.3.</p><p>(ii) ⇒ (iii) est évident.</p><p>(iii) ⇒ (i). Supposons |${an("ADD′")}| = |${an("BD′D")}| = |${an("BD′O")}|. Le théorème 2.2.3 donne aussi |${an("ADD′")}| = |${an("ADO")}| = |${an("s(A)s(D)s(O)")}| = |${an("s(A)D′O")}|. On en déduit |${an("s(A)D′O")}| = |${an("BD′O")}|, ce qui assure que s(A) ∈ [D′B), puisque s(A) et B sont du même côté de (DD′). Il s'ensuit que s(Δ) = s((AD)) = (s(A)s(D)) = (BD′) = Δ′. Le théorème 2.2.3 permet de conclure au parallélisme de Δ et Δ′.</p>`,
 rel:["alternes-internes","thm-2-2-3","axiome-2"]});

/* ---------------- Perpendiculaire, projection ---------------- */
push({id:"perpendiculaire",type:"th",ref:"Cor 2.3.2 et Déf 2.3.3",t:"La perpendiculaire unique, la projection orthogonale",short:"La perpendiculaire unique",
 plain:`Par un point M passe ${hl("une seule droite perpendiculaire")} à une droite Δ donnée. Elle coupe Δ en un point H : c'est le projeté orthogonal de M, le point de Δ « juste en face » de M.`,
 fig:()=>({w:560,h:320,P:{A:[70,230],B:[490,180],M:[260,70]},S:{sym:false},
   toggles:[{k:"sym",label:"Symétrique orthogonal"}],
   draw:(P,S)=>{const H=proj(P.M,P.A,P.B);let s=D.line(P.A,P.B,"l-ink")+D.txt(add(P.A,V(-10,22)),"Δ","t-mut")+D.line(P.M,H,"l-cob")+D.right(P.B,H,P.M,12,"l-cob")+D.pt(H,"H = p(M)",P.M,"p-cob","t-cob");
     if(S.sym){const M2=sym(P.M,H);s+=D.seg(H,M2,"l-cob-d")+D.ticks(P.M,H,1,"l-cob")+D.ticks(H,M2,1,"l-cob")+D.pt(M2,"sym(M)",H,"p-cob","t-cob");}
     return s;},
   info:(P)=>{const H=proj(P.M,P.A,P.B);return R.m([["MH",fl(P.M,H)],["|"+an("AHM")+"|",fa(absang(P.A,H,P.M))]])+R.v("Une seule perpendiculaire à Δ passe par M, et elle coupe Δ en H.","info");}}),
 formal:`<p><b>Corollaire 2.3.2.</b> Soient Δ une droite et M un point. Il existe une unique droite passant par M et perpendiculaire à Δ.</p><p><b>Définition 2.3.3.</b> La projection orthogonale sur Δ associe à M le point p(M), intersection de Δ et de la perpendiculaire à Δ passant par M. La symétrie orthogonale par rapport à Δ associe à M l'unique point sym(M) tel que p(M) soit le milieu de [M sym(M)].</p>`,
 use:`<p>Elle permet de définir les hauteurs et la médiatrice. Son unicité sert d'argument : deux droites perpendiculaires à Δ passant par le même point sont égales (bonus CC2 2025 des annales).</p>`,
 trap:`C'est un corollaire, démontré avec les angles alternes-internes : ce n'est pas un axiome comme l'axiome II.`,
 q:"Deux droites perpendiculaires à Δ passent par le même point M. Que peux-tu dire ?",a:"Elles sont égales, par l'unicité du Cor 2.3.2.",
 rel:["hauteur","mediatrice","alternes-internes"]});

/* ---------------- Hauteur ---------------- */
push({id:"hauteur",type:"def",ref:"§2.4",t:"Hauteur et pied de la hauteur",
 plain:`La hauteur issue de A est la droite qui ${hl("passe par A et tombe à angle droit sur (BC)")}. Le point où elle touche (BC) s'appelle le pied, H<sub>A</sub>. Attention, il peut être en dehors du segment [BC].`,
 fig:()=>({w:560,h:320,P:{A:[230,70],B:[150,250],C:[440,250]},
   draw:(P)=>{const H=proj(P.A,P.B,P.C),t=param(H,P.B,P.C);let s=D.line(P.B,P.C,"l-cons")+tri(P.A,P.B,P.C,"l-ink","f-ink")+D.seg(P.A,H,"l-cob")+D.right(P.C,H,P.A,11,"l-cob")+D.pt(H,"H<tspan font-size='11' dy='4'>A</tspan>",P.A,"p-cob","t-cob");
     if(t<0||t>1)s+=D.seg(H,t<0?P.B:P.C,"l-red");return s;},
   info:(P)=>{const H=proj(P.A,P.B,P.C),t=param(H,P.B,P.C),inside=t>=0&&t<=1;return R.m([["AH<sub>A</sub>",fl(P.A,H)],["|B̂|",fa(absang(P.A,P.B,P.C))],["|Ĉ|",fa(absang(P.A,P.C,P.B))],["H<sub>A</sub> ∈ [BC] ?",yes(inside)]])+R.v(inside?"Le pied est sur le segment [BC].":"Un angle en B ou en C est obtus : le pied est sur la droite (BC), en dehors du segment.",inside?"":"info");},
   goal:{text:"rends l'angle en B obtus. Où tombe le pied ?",ok:(P)=>absang(P.A,P.B,P.C)>PI/2+0.02,win:"en dehors de [BC], sur le prolongement : c'est pour ça que la démo 2.4.1 a deux cas."}}),
 formal:`<p>La <b>hauteur issue de A</b> du triangle ABC est l'unique droite perpendiculaire à (BC) passant par A (Cor 2.3.2). Le <b>pied</b> H<sub>A</sub> est son intersection avec (BC). Il n'est pas forcément sur le segment [BC].</p>`,
 use:`<p>La hauteur sert à calculer l'aire : 𝒜(ABC) = BC × AH<sub>A</sub> / 2 (Prop 2.4.1). Et l'aire écrite avec deux hauteurs différentes donne des égalités (CC1 2025 Ex. 2).</p>`,
 trap:`Ne suppose pas H<sub>A</sub> ∈ [BC] sans le justifier : c'est faux si l'angle en B ou en C est obtus.`,
 q:"L'angle en B est obtus. Où est le pied de la hauteur issue de A ?",a:"Sur la droite (BC), mais hors du segment [BC], du côté de B.",
 rel:["demo-2-4-1","perpendiculaire","td-hauteurs"]});

/* ---------------- Démo 2.4.1 ---------------- */
push({id:"demo-2-4-1",type:"demo",ref:"Proposition 2.4.1",t:"Démo : l'aire du triangle",
 plain:`On prouve la formule « base × hauteur / 2 ». D'abord pour un triangle rectangle, qui est ${hl("la moitié d'un rectangle")}. Puis pour n'importe quel triangle, en ${hl("ajoutant ou retirant")} deux triangles rectangles.`,
 hyp:"ABC est un triangle et H<sub>A</sub> est le pied de la hauteur issue de A.",concl:"𝒜(ABC) = BC × AH<sub>A</sub> / 2.",
 idea:`Cas rectangle : un rectangle = deux triangles isométriques. Cas général : somme (H<sub>A</sub> ∈ [BC]) ou différence (H<sub>A</sub> ∉ [BC]) de deux triangles rectangles.`,
 fig:()=>({w:560,h:300,P:{A:[120,80],B:[120,250],C:[400,250]},S:{step:0},drag:["A"],
   con:{A:(p,P,S)=>S.step<2?V(P.B.x,Math.min(p.y,P.B.y-40)):V(p.x,Math.min(p.y,P.B.y-40))},
   onStep:(k,P)=>{if(k<2)P.A=V(P.B.x,P.A.y);else if(k===2)P.A=V(230,P.A.y);else P.A=V(500,P.A.y);},
   draw:(P,S)=>{const k=S.step,H=V(P.A.x,P.B.y);let s=D.line(P.B,P.C,"l-cons")+D.pt(P.B,"B",V(P.B.x+20,P.B.y-40))+D.pt(P.C,"C",V(P.C.x-30,P.C.y-40));
     if(k<2){const Dd=V(P.C.x,P.A.y);s+=D.poly([P.A,P.B,P.C,Dd],k===1?"f-amb":"f-ink")+D.poly([P.A,P.B,P.C],"f-cob")+D.pline([P.A,P.B,P.C,Dd,P.A],"l-ink")+D.seg(P.A,P.C,"l-cob")+D.right(P.A,P.B,P.C,12,"l-thin")+D.pt(Dd,"D",P.B,"pk2","tk2");return s;}
     s+=D.seg(P.A,H,"lk1")+D.right(P.C,H,P.A,11,"lk1")+D.pt(H,"H<tspan font-size='11' dy='4'>A</tspan>",V(H.x,H.y-60),"pk1","tk1");
     if(k===2)s+=D.poly([P.A,H,P.B],"f-cob")+D.poly([P.A,H,P.C],"f-amb")+D.pline([P.A,P.B,P.C,P.A],"l-ink");
     if(k===3)s+=D.poly([P.A,P.B,H],"f-cob")+D.poly([P.A,P.C,H],"f-red")+D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.seg(P.C,H,"l-red");
     return s;},
   info:(P,S)=>{const H=V(P.A.x,P.B.y),k=S.step;const ar=area(P.A,P.B,P.C);
     return R.m([["𝒜(ABC)",fr(ar)],["BC × AH / 2",fr(d(P.B,P.C)*d(P.A,H)/2)]])+R.v(k<2?"Le triangle bleu est la moitié du rectangle ABCD.":k===2?"Bleu + orange = ABC : on additionne.":"ABH (bleu + rouge) moins ACH (rouge) = ABC : on soustrait.","info");},
   hint:"Déplace A."}),
 steps:[
  {w:"Cas où ABC est rectangle en B, donc B = H<sub>A</sub>. Soit D l'intersection de la perpendiculaire à (AB) passant par A et de la perpendiculaire à (BC) passant par C. ABCD est un rectangle, d'aire AB × BC.",why:"C'est la normalisation de l'aire (axiome VIII 1)."},
  {w:"Les triangles ABC et CDA sont isométriques (avec 2.2.4), donc de même aire. Le rectangle est la réunion des deux triangles, les bords ayant une aire nulle (1.6.1). Donc 𝒜(ABC) = ½ AB × BC.",why:"Deux moitiés égales d'un rectangle : chacune vaut la moitié de l'aire."},
  {w:"Cas où H<sub>A</sub> ∈ [BC] : ABC est la réunion de AH<sub>A</sub>B et AH<sub>A</sub>C. Donc 𝒜(ABC) = ½ AH<sub>A</sub> × H<sub>A</sub>B + ½ AH<sub>A</sub> × H<sub>A</sub>C = ½ AH<sub>A</sub> × BC.",why:"Additivité, puis le cas rectangle deux fois. Et H<sub>A</sub>B + H<sub>A</sub>C = BC car H<sub>A</sub> ∈ [BC]."},
  {w:"Cas où H<sub>A</sub> ∉ [BC], par exemple C ∈ [BH<sub>A</sub>] : ABH<sub>A</sub> est la réunion de ABC et ACH<sub>A</sub>. Donc 𝒜(ABC) = ½ AH<sub>A</sub> × H<sub>A</sub>B − ½ AH<sub>A</sub> × H<sub>A</sub>C = ½ AH<sub>A</sub> × BC.",why:"Cette fois on soustrait. Et H<sub>A</sub>B − H<sub>A</sub>C = BC car C ∈ [BH<sub>A</sub>]."}],
 redac:`<p>Traitons d'abord le cas où ABC est rectangle en B. Dans ce cas B = H<sub>A</sub>. On construit le point D, intersection de la perpendiculaire à (AB) passant par A et de la perpendiculaire à (BC) passant par C. Alors ABCD est un rectangle, son aire est AB × BC. Les triangles ABC et CDA sont isométriques (utiliser 2.2.4), donc de même aire, et le rectangle est la réunion disjointe des deux triangles, aux bords près, qui sont d'aire nulle. On en déduit 𝒜(ABC) = ½ AB × BC.</p><p>Dans le cas général, si H<sub>A</sub> est sur [BC], ABC est l'union disjointe de AH<sub>A</sub>B et AH<sub>A</sub>C, donc 𝒜(ABC) = ½ AH<sub>A</sub> × (H<sub>A</sub>B + H<sub>A</sub>C) = ½ AH<sub>A</sub> × BC.</p><p>Si H<sub>A</sub> n'est pas sur [BC], supposons par exemple C ∈ [BH<sub>A</sub>] (l'autre cas est symétrique). ABH<sub>A</sub> est l'union disjointe de ABC et ACH<sub>A</sub>, donc 𝒜(ABC) = ½ AH<sub>A</sub> × (H<sub>A</sub>B − H<sub>A</sub>C) = ½ AH<sub>A</sub> × BC.</p>`,
 rel:["axiome-8","hauteur","demo-2-5-1"]});

/* ---------------- Somme des angles ---------------- */
push({id:"somme-angles",type:"th",ref:"Prop 2.4.2",t:"La somme des angles d'un triangle vaut π",short:"Somme des angles = π",
 plain:`Les trois angles d'un triangle, mis bout à bout, ${hl("forment un angle plat")}. La figure le montre : la parallèle à (BC) passant par A « recopie » les angles de B et de C à côté de celui de A.`,
 fig:()=>({w:560,h:320,P:{A:[260,80],B:[110,260],C:[460,250]},
   draw:(P)=>{const P1=add(P.A,sub(P.B,P.C)),P2=add(P.A,sub(P.C,P.B));
     return D.line(P1,P2,"l-cons")+D.poly([P.A,P.B,P.C],"f-ink")+D.pline([P.A,P.B,P.C,P.A],"l-ink")
      +D.wedge(P.A,P.B,P.C,34,"f-amb")+D.wedge(P.B,P.C,P.A,34,"f-ok")+D.wedge(P.C,P.A,P.B,34,"f-cob")
      +D.wedge(P1,P.A,P.B,38,"f-amb")+D.wedge(P.B,P.A,P.C,38,"f-cob")+D.wedge(P.C,P.A,P2,38,"f-ok")
      +D.arc(P1,P.A,P.B,38,"l-amb")+D.arc(P.B,P.A,P.C,38,"l-cob")+D.arc(P.C,P.A,P2,38,"l-ok");},
   info:(P)=>{const a=absang(P.B,P.A,P.C),b=absang(P.A,P.B,P.C),c=absang(P.A,P.C,P.B);
     return R.m([["|Â|",fa(a)],["|B̂|",fa(b)],["|Ĉ|",fa(c)],["somme",fa(a+b+c)],[an("ABC")+" + "+an("BCA")+" + "+an("CAB"),fa(G.norm(ang(P.A,P.B,P.C)+ang(P.B,P.C,P.A)+ang(P.C,P.A,P.B)),false)]])+R.v("Les trois couleurs autour de A forment un demi-tour : π.","ok");},
   hint:"Les couleurs en A recopient les angles de B (orange) et de C (vert)."}),
 formal:`<p><b>Proposition 2.4.2.</b> Pour tout triangle ABC : (1) |Â| + |B̂| + |Ĉ| = π ; (2) ${an("ABC")} + ${an("BCA")} + ${an("CAB")} = π [2π].</p><p>Attention à l'ordre des lettres dans (2) : les trois angles doivent être orientés dans le même sens.</p><p class="ref">Preuve : la parallèle à (BC) passant par A et les angles alternes-internes.</p>`,
 use:`<p>Calculer un angle manquant, montrer qu'un triangle est rectangle, déduire le 3ᵉ angle (Cor 2.4.3, triangles semblables), TD 1.13 (π/3 dans un triangle équilatéral), CC1 2024 Ex. 2 (b).</p>`,
 trap:`En orienté, prends ${an("ABC")}, ${an("BCA")}, ${an("CAB")} : chaque angle commence là où le précédent finit. ${an("ABC")} + ${an("ACB")} + … ne marche pas.`,
 q:"Un triangle a deux angles de π/4 et π/3. Combien vaut le troisième ?",a:"π − π/4 − π/3 = 5π/12.",
 rel:["alternes-internes","cor-2-4-3","td-equilateral"]});

/* ---------------- Cor 2.4.3 ---------------- */
function copy(P){const Gc=V((P.A.x+P.B.x+P.C.x)/3,(P.A.y+P.B.y+P.C.y)/3);const f=q=>add(rot(q,Gc,0.7),V(300,0));return {A:f(P.A),B:f(P.B),C:f(P.C)};}
push({id:"cor-2-4-3",type:"th",ref:"Cor 2.4.3",t:"ACA avec des angles placés n'importe où",short:"ACA généralisé (Cor 2.4.3)",
 plain:`Pour ACA, les deux angles n'ont pas besoin d'être aux extrémités du côté : ${hl("un côté et deux angles quelconques suffisent")}. Le troisième angle se déduit, puisque la somme vaut π.`,
 fig:()=>({w:600,h:320,P:{A:[110,80],B:[60,250],C:[240,220]},
   con:{A:p=>V(Math.min(p.x,270),p.y),B:p=>V(Math.min(p.x,270),p.y),C:p=>V(Math.min(p.x,270),p.y)},
   draw:(P)=>{const T=copy(P),c2=V(450,160);const mk=(X,cl,f)=>D.ticks(X.A,X.B,1,cl)+D.wedge(X.B,X.A,X.C,26,"f-cob")+D.marks(X.B,X.A,X.C,26,1,"l-cob")+D.wedge(X.A,X.C,X.B,26,"f-amb")+D.marks(X.A,X.C,X.B,26,2,"l-amb");
     return D.pline([P.A,P.B,P.C,P.A],"l-ink")+mk(P,"l-ink")+D.pline([T.A,T.B,T.C,T.A],"l-cob")+mk(T,"l-cob")+D.pt(T.A,"A′",c2,"p-cob","t-cob")+D.pt(T.B,"B′",c2,"p-cob","t-cob")+D.pt(T.C,"C′",c2,"p-cob","t-cob")+D.seg(V(285,20),V(285,300),"l-cons");},
   info:(P)=>R.m([["AB = A′B′",fl(P.A,P.B)],["|Â| = |Â′|",fa(absang(P.B,P.A,P.C))],["|Ĉ| = |Ĉ′|",fa(absang(P.A,P.C,P.B))],["donc |B̂| = |B̂′|",fa(absang(P.A,P.B,P.C))]])+R.v("L'angle en C n'est pas au bout du côté [AB], mais |B̂| = π − |Â| − |Ĉ| : on retombe sur ACA.","info"),
   away:()=>V(150,170)}),
 formal:`<p><b>Corollaire 2.4.3.</b> Les triangles ABC et A′B′C′ sont isométriques si et seulement si A′B′ = AB, |Â′| = |Â| et |Ĉ′| = |Ĉ|.</p><p>Dans l'axiome V, la condition (ACA) est donc valable même quand les angles ne sont pas adjacents au côté. Pour (CAC), l'angle doit toujours être entre les deux côtés.</p>`,
 use:`<p>Pratique quand l'énoncé donne un côté et deux angles mal placés. Preuve en une ligne : |B̂′| = π − |Â′| − |Ĉ′| = π − |Â| − |Ĉ| = |B̂|, puis ACA.</p>`,
 trap:`Il n'y a pas d'assouplissement pour CAC : deux côtés et un angle qui n'est pas entre eux ne suffisent pas.`,
 q:"AB = A′B′, |Â| = |Â′| et |Ĉ| = |Ĉ′|. Les triangles sont-ils isométriques ?",a:"Oui (Cor 2.4.3) : la somme des angles donne |B̂| = |B̂′|, puis ACA.",
 rel:["axiome-5","somme-angles"]});

/* ---------------- Thalès ---------------- */
function thN(P){return inter(P.M,add(P.M,sub(P.C,P.B)),P.A,P.C);}
push({id:"thales",type:"th",ref:"Théorème 2.5.1",t:"Le théorème de Thalès",cc:"Tombé en 2024 et 2025",
 plain:`Si on coupe un triangle par une droite ${hl("parallèle à un côté")}, on obtient un petit triangle qui est une réduction exacte du grand : toutes les longueurs sont multipliées par le même nombre.`,
 fig:()=>({w:560,h:330,P:{A:[250,60],B:[110,280],C:[450,270],M:[180,170]},
   con:{M:(p,P)=>{const q=onLine(p,P.A,P.B);return dpx(q,P.A)<12?add(P.A,mul(unit(sub(P.B,P.A)),12)):q;}},
   draw:(P)=>{const N=thN(P);if(!N)return "";return D.line(P.A,P.B,"l-cons")+D.line(P.A,P.C,"l-cons")+D.poly([P.A,P.B,P.C],"f-ink")+D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.line(P.M,N,"l-thin")+D.poly([P.A,P.M,N],"f-cob")+D.seg(P.M,N,"l-cob")+D.seg(P.A,P.M,"l-cob")+D.seg(P.A,N,"l-cob")+D.pt(N,"N",V(N.x-80,N.y),"p-cob","t-cob");},
   info:(P)=>{const N=thN(P);if(!N)return "";const r1=d(P.A,P.M)/d(P.A,P.B),r2=d(P.A,N)/d(P.A,P.C),r3=d(P.M,N)/d(P.B,P.C);
     return R.m([["AM / AB",fr(r1,3)],["AN / AC",fr(r2,3)],["MN / BC",fr(r3,3)]])+R.v(param(P.M,P.A,P.B)<0?"M est de l'autre côté de A : les trois rapports restent égaux. Thalès marche avec M ∈ (AB).":"(MN) // (BC) : les trois rapports sont égaux.","ok");},
   goal:{text:"place M de l'autre côté de A, sur la droite (AB). Les rapports restent-ils égaux ?",ok:(P)=>param(P.M,P.A,P.B)<-0.05,win:"oui : c'est pour ça que l'énoncé prend M ∈ (AB), pas seulement M ∈ [AB]."},
   hint:"M glisse sur la droite (AB) ; N suit pour que (MN) // (BC)."}),
 formal:`<p><b>Théorème 2.5.1 (Thalès).</b> Soient ABC un triangle non dégénéré et Δ une droite parallèle à (BC). Si Δ coupe ${hl("(AB) en M et (AC) en N")}, alors</p><p style="font-size:1.15rem;text-align:center">AM/AB = AN/AC = MN/BC.</p><p class="ref">Démo exigible : la 1ʳᵉ égalité seulement, et seulement quand M ∈ [AB] et N ∈ [AC].</p>`,
 use:`<p>Le CC1 2024 demandait l'énoncé (2 points) : apprends-le avec des droites (AB) et (AC). Il sert à calculer une longueur dans une configuration avec des parallèles, et il est à la base du théorème des milieux et des triangles semblables.</p>`,
 trap:`Écris AM/AB, un rapport de longueurs. [AM]/[AB] est une « faute grave » (corrigé 2024). Et avec M ∈ [AB] au lieu de (AB), l'énoncé est « incomplet ».`,
 q:"Énonce le théorème de Thalès (CC1 2024, 2 points).",a:"Soit ABC un triangle non dégénéré et Δ une droite parallèle à (BC). Si Δ coupe (AB) en M et (AC) en N, alors AM/AB = AN/AC = MN/BC.",
 rel:["demo-2-5-1","demo-2-5-2","milieux","semblables"]});

/* ---------------- Démo 2.5.1 ---------------- */
push({id:"demo-2-5-1",type:"demo",ref:"Théorème 2.5.1",t:"Démo : Thalès, 1ʳᵉ égalité",cc:"Tombé en 2025 · 4 pts",
 plain:`La preuve n'utilise que des aires. Deux idées : ${hl("même hauteur ⇒ rapport des aires = rapport des bases")}, et ${hl("𝒜(BMN) = 𝒜(CMN)")} parce que B et C sont à la même distance de la droite (MN).`,
 hyp:"ABC non dégénéré, M ∈ [AB], N ∈ [AC], (MN) // (BC).",concl:"AM/AB = AN/AC.",
 idea:`AM/AB = 𝒜(AMN)/𝒜(ABN), on remplace le morceau BMN par CMN (même aire), et on retombe sur 𝒜(AMN)/𝒜(ACM) = AN/AC.`,
 fig:()=>({w:560,h:330,P:{A:[250,50],B:[100,290],C:[460,280],M:[178,165]},S:{step:0},drag:["M"],
   con:{M:(p,P)=>onSeg(p,lerp(P.A,P.B,0.12),lerp(P.A,P.B,0.9))},
   draw:(P,S)=>{const N=thN(P),k=S.step,HN=proj(N,P.A,P.B),HM=proj(P.M,P.A,P.C);
     let s=D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.seg(P.M,N,"l-ink")+D.pt(P.A,"A",V(250,200))+D.pt(P.B,"B",V(300,200))+D.pt(P.C,"C",V(250,200))+D.pt(N,"N",V(200,170),"p-fix");
     if(k===0)s+=D.seg(N,HN,"lk1d")+D.seg(P.M,HM,"lk2d")+D.right(P.A,HN,N,8,"lk1")+D.right(P.A,HM,P.M,8,"lk2")+D.pt(HN,"H<tspan font-size='11' dy='4'>N</tspan>",N,"pk1","tk1")+D.pt(HM,"H<tspan font-size='11' dy='4'>M</tspan>",P.M,"pk2","tk2");
     if(k===1)s+=D.poly([P.B,P.M,N],"f-cob")+D.poly([P.C,P.M,N],"f-amb")+D.seg(P.B,N,"l-cob")+D.seg(P.C,P.M,"l-amb");
     if(k===2)s+=D.poly([P.A,P.M,N],"f-cob")+D.pline([P.A,P.B,N,P.A],"l-cob")+D.seg(N,HN,"lk1d")+D.pt(HN,"",null,"pk1");
     if(k===3)s+=D.poly([P.A,P.M,N],"f-cob")+D.poly([P.B,P.M,N],"f-amb")+D.seg(P.B,N,"l-amb");
     if(k===4)s+=D.poly([P.A,P.M,N],"f-cob")+D.poly([P.C,P.M,N],"f-amb")+D.seg(P.C,P.M,"l-amb");
     if(k===5)s+=D.poly([P.A,P.M,N],"f-cob")+D.pline([P.A,P.M,P.C,P.A],"l-cob")+D.seg(P.M,HM,"lk2d")+D.pt(HM,"",null,"pk2");
     return s;},
   info:(P,S)=>{const N=thN(P),k=S.step;const aAMN=area(P.A,P.M,N),aBMN=area(P.B,P.M,N),aCMN=area(P.C,P.M,N);
     const rows=[[["AM/AB",fr(d(P.A,P.M)/d(P.A,P.B),3)],["AN/AC",fr(d(P.A,N)/d(P.A,P.C),3)]],
      [["𝒜(BMN)",fr(aBMN)],["𝒜(CMN)",fr(aCMN)]],
      [["AM/AB",fr(d(P.A,P.M)/d(P.A,P.B),3)],["𝒜(AMN)/𝒜(ABN)",fr(aAMN/area(P.A,P.B,N),3)]],
      [["𝒜(AMN)",fr(aAMN)],["𝒜(AMN)+𝒜(BMN)",fr(aAMN+aBMN)],["𝒜(AMN)+𝒜(CMN)",fr(aAMN+aCMN)]],
      [["𝒜(ACM)",fr(area(P.A,P.C,P.M))],["𝒜(AMN)+𝒜(CMN)",fr(aAMN+aCMN)]],
      [["𝒜(AMN)/𝒜(ACM)",fr(aAMN/area(P.A,P.C,P.M),3)],["AN/AC",fr(d(P.A,N)/d(P.A,P.C),3)]]][k];
     return R.h("Les nombres de cette étape")+R.m(rows);},
   hint:"Déplace M : les égalités restent vraies."}),
 steps:[
  {w:"Soient H<sub>N</sub> et H<sub>M</sub> les pieds des hauteurs du triangle AMN issues de N et de M.",why:"On prépare deux hauteurs qui seront communes à deux triangles à la fois."},
  {w:"Comme (MN) // (BC), les triangles BMN et CMN ont la même base [MN] et des hauteurs de même longueur (par 2.2.4). Donc 𝒜(BMN) = 𝒜(CMN).",why:"B et C sont à la même distance de (MN), puisque (BC) est parallèle à (MN). Même base, même hauteur, même aire (2.4.1)."},
  {w:"N H<sub>N</sub> est une hauteur commune aux triangles AMN et ABN. Donc AM/AB = 𝒜(AMN)/𝒜(ABN).",why:"Deux triangles de même hauteur : le rapport de leurs aires est le rapport de leurs bases AM et AB (2.4.1)."},
  {w:"ABN est la réunion disjointe de AMN et BMN, donc AM/AB = 𝒜(AMN)/(𝒜(AMN) + 𝒜(BMN)) = 𝒜(AMN)/(𝒜(AMN) + 𝒜(CMN)).",why:"Additivité de l'aire, puis on remplace 𝒜(BMN) par 𝒜(CMN) grâce à l'étape 2. C'est le cœur de la preuve."},
  {w:"ACM est la réunion de AMN et CMN, donc AM/AB = 𝒜(AMN)/𝒜(ACM).",why:"Additivité dans l'autre triangle : le dénominateur devient l'aire de ACM."},
  {w:"M H<sub>M</sub> est une hauteur commune à AMN et ACM, donc 𝒜(AMN)/𝒜(ACM) = AN/AC. Conclusion : AM/AB = AN/AC.",why:"Même raisonnement qu'à l'étape 3, avec les bases AN et AC."}],
 redac:`<p>Soient H<sub>N</sub> et H<sub>M</sub> les pieds des hauteurs de AMN issues de N et M respectivement. Comme les droites (MN) et (BC) sont parallèles, les hauteurs des triangles BMN et CMN par rapport à leur base commune MN sont de même longueur (par 2.2.4), d'où 𝒜(BMN) = 𝒜(CMN).</p><p>Si deux triangles ont une hauteur commune, le rapport de leurs aires est égal au rapport de leurs bases. Comme NH<sub>N</sub> est une hauteur commune aux triangles AMN et ABN :</p><p>AM/AB = 𝒜(AMN)/𝒜(ABN)<br>= 𝒜(AMN)/(𝒜(AMN) + 𝒜(BMN)) car ABN est union disjointe de AMN et de BMN<br>= 𝒜(AMN)/(𝒜(AMN) + 𝒜(CMN)) car 𝒜(BMN) = 𝒜(CMN)<br>= 𝒜(AMN)/𝒜(ACM)<br>= AN/AC car MH<sub>M</sub> est une hauteur commune aux deux triangles.</p>`,
 rel:["thales","demo-2-4-1","axiome-8","demo-2-5-2"]});

/* ---------------- Démo 2.5.2 ---------------- */
push({id:"demo-2-5-2",type:"demo",ref:"Théorème 2.5.2",t:"Démo : la réciproque de Thalès",cc:"Tombé en 2024 · 3 pts",
 plain:`Si les rapports sont égaux, alors la droite est parallèle. Pour le prouver, on ${hl("construit la parallèle")} passant par M, on applique Thalès, et on montre qu'elle passe par N. Attention : il faut des demi-droites.`,
 hyp:"M ∈ ]AB), N ∈ ]AC) et AM/AB = AN/AC.",concl:"(MN) // (BC).",
 idea:`Trace la parallèle à (BC) par M : elle coupe [AC) en N′. Thalès donne AN′ = AN, donc N′ = N (axiome III e).`,
 explore:()=>({w:560,h:320,P:{A:[240,70],B:[110,280],C:[450,260],M:[180,170]},S:{flip:false},drag:["A","B","C","M"],
   toggles:[{k:"flip",label:"Mettre N de l'autre côté de A"}],
   con:{M:(p,P)=>onRay(p,lerp(P.A,P.B,0.1),P.B)},
   draw:(P,S)=>{const r=d(P.A,P.M)/d(P.A,P.B),u=unit(sub(P.C,P.A)),N=add(P.A,mul(u,(S.flip?-1:1)*r*dpx(P.A,P.C)));const par=parallel(P.M,N,P.B,P.C,0.003);
     return D.line(P.A,P.C,"l-cons")+D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.line(P.M,N,par?"l-ok":"l-red")+D.pt(N,"N",P.B,"p-cob","t-cob");},
   info:(P,S)=>{const r=d(P.A,P.M)/d(P.A,P.B),u=unit(sub(P.C,P.A)),N=add(P.A,mul(u,(S.flip?-1:1)*r*dpx(P.A,P.C)));const par=parallel(P.M,N,P.B,P.C,0.003);
     return R.m([["AM/AB",fr(r,3)],["AN/AC",fr(d(P.A,N)/d(P.A,P.C),3)],["(MN) // (BC) ?",yes(par)]])+R.v(par?"Rapports égaux et N sur [AC) : parallèles.":"Rapports égaux, mais N est sur l'autre demi-droite : pas parallèles ! D'où les demi-droites dans l'énoncé.",par?"ok":"");},
   hint:"Active le bouton pour voir le contre-exemple."}),
 fig:()=>({w:560,h:320,P:{A:[240,60],B:[110,280],C:[450,260],M:[175,170]},S:{step:0},drag:["M"],
   con:{M:(p,P)=>onRay(p,lerp(P.A,P.B,0.12),P.B)},
   draw:(P,S)=>{const k=S.step,r=d(P.A,P.M)/d(P.A,P.B),N=add(P.A,mul(sub(P.C,P.A),r));const Np=thN(P);
     let s=D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.pt(P.A,"A",V(260,200))+D.pt(P.B,"B",V(300,200))+D.pt(P.C,"C",V(250,200))+D.seg(P.B,P.C,"lk4")+D.pt(N,"N",V(N.x+60,N.y),"pk1","tk1");
     if(k>=1)s+=D.line(P.M,add(P.M,sub(P.C,P.B)),"lk3d")+D.txt(V(16,26),"Δ : la parallèle à (BC) passant par M","tk3 t-up");
     if(k>=1&&Np)s+=D.dot(Np,"pk2",5)+D.lab(Np,"N′",P.C,"tk2",30);
     if(k===2)s+=D.seg(P.A,Np,"lk2");
     if(k===3)s+=D.txt(V(16,50),"N et N′ : même distance de A sur [AC)","t-ok t-up");
     if(k>=4)s+=D.seg(P.M,N,"lk3");
     return s;},
   info:(P)=>{const r=d(P.A,P.M)/d(P.A,P.B),N=add(P.A,mul(sub(P.C,P.A),r)),Np=thN(P);return R.m([["AM/AB",fr(r,3)],["AN",fr(d(P.A,N))],["AN′",Np?fr(d(P.A,Np)):"–"]]);},
   hint:"Déplace M."}),
 steps:[
  {w:"Si A, B, C sont alignés, c'est évident. On suppose ABC non dégénéré, avec AM/AB = AN/AC. On a donc AN = AM·AC/AB.",why:"On isole AN pour pouvoir le comparer à une autre longueur."},
  {w:"Soit Δ la parallèle à (BC) passant par M (axiome II). Elle coupe la demi-droite [AC) en un point N′.",why:"On construit le point qu'on voudrait obtenir : celui qui rend la droite parallèle."},
  {w:"Le théorème de Thalès s'applique à Δ : AM/AB = AN′/AC, d'où AN′ = AM·AC/AB = AN.",why:"Le théorème direct, appliqué dans le triangle ABC avec la parallèle Δ."},
  {w:"Les points N et N′ sont tous deux sur [AC), à la même distance de A. Donc N = N′.",why:"Sur une demi-droite, un seul point est à une distance donnée de l'origine (axiome III e). C'est là que les demi-droites servent."},
  {w:"Donc (MN) = (MN′) = Δ, qui est parallèle à (BC).",why:"La droite (MN) est exactement la parallèle construite à l'étape 2."}],
 redac:`<p>L'assertion est évidente si A, B et C sont alignés. On suppose maintenant que ABC est non dégénéré, et que AM/AB = AN/AC. On a donc AN = AM·AC/AB.</p><p>On considère la droite Δ parallèle à (BC) passant par le point M. Elle coupe la demi-droite [AC) en un point N′. Le théorème de Thalès assure que AM/AB = AN′/AC, d'où AN′ = AM·AC/AB = AN. Les points N et N′ étant tous deux sur [AC), on en déduit N = N′, donc (MN) = (MN′) = Δ est parallèle à (BC).</p><p class="muted">Corrigé 2024 : « Il faut donner la preuve, pas seulement utiliser la réciproque du théorème de Thalès ! »</p>`,
 rel:["thales","demo-2-5-1","axiome-3","demi-droite"]});

/* ---------------- Théorème des milieux ---------------- */
push({id:"milieux",type:"th",ref:"Théorème 2.5.3",t:"Le théorème des milieux",
 plain:`Relie les milieux de deux côtés d'un triangle : le segment obtenu est ${hl("parallèle au troisième côté et deux fois plus court")}. C'est Thalès avec un rapport ½.`,
 fig:()=>({w:560,h:320,P:{A:[260,60],B:[100,270],C:[460,260]},
   draw:(P)=>{const M=mid(P.A,P.B),N=mid(P.A,P.C);return D.pline([P.A,P.B,P.C,P.A],"l-ink")+D.ticks(P.A,M,1,"l-amb")+D.ticks(M,P.B,1,"l-amb")+D.ticks(P.A,N,2,"l-amb")+D.ticks(N,P.C,2,"l-amb")+D.seg(M,N,"l-cob")+D.seg(P.B,P.C,"l-cob")+D.pt(M,"M",P.C,"p-cob","t-cob")+D.pt(N,"N",P.B,"p-cob","t-cob");},
   info:(P)=>{const M=mid(P.A,P.B),N=mid(P.A,P.C);return R.m([["MN",fl(M,N)],["BC / 2",fr(d(P.B,P.C)/2)],["(MN) // (BC) ?",yes(parallel(M,N,P.B,P.C,0.001))]])+R.v("MN = BC/2 et (MN) // (BC), quel que soit le triangle.","ok");}}),
 formal:`<p><b>Théorème 2.5.3.</b> Soit ABC un triangle. Si M est le milieu de [AB] et N le milieu de [AC], alors (MN) et (BC) sont parallèles, et MN = BC/2.</p>`,
 use:`<p>Le CC1 2025 Ex. 3 (4 points sur 8) l'utilise deux fois : dans les triangles BMC et CBS, pour obtenir des parallèles et OI = MC/2. Il sert aussi dans la preuve de la transitivité de l'équipollence (3.2.2).</p>`,
 trap:`Écris bien dans quel triangle tu l'appliques, et quels sont les deux milieux.`,
 q:"M et N sont les milieux de [AB] et [AC], et BC = 6. Que vaut MN ?",a:"3, et de plus (MN) // (BC).",
 rel:["thales","semblables"]});

/* ---------------- Triangles semblables ---------------- */
push({id:"semblables",type:"th",ref:"Déf 2.6.1 et Thm 2.6.2",t:"Les triangles semblables",
 plain:`Deux triangles sont semblables s'ils ont ${hl("la même forme")}, mais pas forcément la même taille : mêmes angles, et des côtés proportionnels. Comme une photo agrandie.`,
 fig:()=>({w:600,h:320,P:{A:[110,90],B:[60,250],C:[230,230]},S:{k:1.5},
   sliders:[{k:"k",label:"Facteur d'agrandissement :",min:0.5,max:1.8,step:0.01,fmt:v=>fr(v)}],
   con:{A:p=>V(Math.min(p.x,250),p.y),B:p=>V(Math.min(p.x,250),p.y),C:p=>V(Math.min(p.x,250),p.y)},
   draw:(P,S)=>{const Gc=V((P.A.x+P.B.x+P.C.x)/3,(P.A.y+P.B.y+P.C.y)/3),f=q=>add(V(440,170),mul(sub(rot(q,Gc,-0.4),Gc),S.k));const A2=f(P.A),B2=f(P.B),C2=f(P.C),c2=V(440,170);
     return tri(P.A,P.B,P.C,"l-ink","f-ink")+tri(A2,B2,C2,"l-cob","f-cob")+D.marks(P.B,P.A,P.C,22,1,"l-amb")+D.marks(B2,A2,C2,22,1,"l-amb")+D.marks(P.A,P.B,P.C,22,2,"l-amb")+D.marks(A2,B2,C2,22,2,"l-amb")+D.pt(A2,"A′",c2,"p-cob","t-cob")+D.pt(B2,"B′",c2,"p-cob","t-cob")+D.pt(C2,"C′",c2,"p-cob","t-cob");},
   info:(P,S)=>{const Gc=V((P.A.x+P.B.x+P.C.x)/3,(P.A.y+P.B.y+P.C.y)/3),f=q=>add(V(440,170),mul(sub(rot(q,Gc,-0.4),Gc),S.k));const A2=f(P.A),B2=f(P.B),C2=f(P.C);
     return R.m([["A′B′ / AB",fr(d(A2,B2)/d(P.A,P.B))],["A′C′ / AC",fr(d(A2,C2)/d(P.A,P.C))],["B′C′ / BC",fr(d(B2,C2)/d(P.B,P.C))],["|Â| et |Â′|",fa(absang(P.B,P.A,P.C))]])+R.v(Math.abs(S.k-1)<0.01?"Facteur 1 : semblables ET isométriques.":"Mêmes angles, côtés proportionnels : semblables, mais pas isométriques.","info");},
   away:()=>V(150,170)}),
 formal:`<p><b>Définition 2.6.1.</b> ABC et A′B′C′ sont semblables s'ils ont les mêmes mesures d'angles : |Â| = |Â′|, |B̂| = |B̂′|, |Ĉ| = |Ĉ′|. Deux égalités suffisent (la somme vaut π).</p><p><b>Théorème 2.6.2.</b> Les trois assertions suivantes sont équivalentes : (i) ABC et A′B′C′ sont semblables ; (ii) AB/A′B′ = AC/A′C′ = CB/C′B′ ; (iii) AB/A′B′ = AC/A′C′ et |Â| = |Â′|.</p>`,
 use:`<p>Montrer que deux triangles sont semblables donne des rapports de longueurs égaux, et inversement. Le (iii) est un « CAC proportionnel ».</p>`,
 trap:`Semblables ne veut pas dire isométriques : la taille peut changer.`,
 q:"Deux triangles ont deux angles égaux. Sont-ils semblables ?",a:"Oui : le troisième angle est aussi égal, puisque la somme vaut π (Prop 2.4.2).",
 rel:["thales","somme-angles","axiome-5"]});

})();
