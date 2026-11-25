/* Géométrie, CC2 du vendredi 11 décembre (programme pas encore annoncé) : la suite du cours après le CC1,
   c'est-à-dire les chapitres 4 (Pythagore, trigonométrie, Al-Kashi, rotations, produit scalaire)
   et 5 (cercles, angle au centre, angle inscrit) du poly. Chapitres 5 et 6 du site. */
(function(){
const {V,D,R,d,dpx,fl,fa,fr,ang,absang,mid,proj,rot,unit,perp,add,sub,mul,PI}=G;
const an=s=>`<span class="ang">${s}</span>`, hl=s=>`<span class="hl">${s}</span>`, vc=s=>`<span class="vec">${s}</span>`;
const C=window.CONCEPTS;
const push=(ch,o)=>{o.ch=ch;o.ex="cc2";C.push(o);};
const tri=(A,B,Cc,cl,fill)=>(fill?D.poly([A,B,Cc],fill):"")+D.pline([A,B,Cc,A],cl||"l-ink");
const mod2pi=x=>{x=x%(2*PI);if(x>PI)x-=2*PI;if(x<=-PI)x+=2*PI;return x;};
const modpi=x=>{x=x%PI;if(x>PI/2)x-=PI;if(x<=-PI/2)x+=PI;return x;};
const onCircle=(O,r)=>(p)=>add(O,mul(unit(sub(p,O)),r));
const sq=x=>fr(x*x);

/* ---------------- Translations et homothéties (§3.3) ---------------- */
push(5,{id:"g-homothetie",type:"def",ref:"Définition 3.3.1, théorèmes 3.3.2 et 3.3.4",t:"Translations et homothéties",short:"Translations, homothéties",cc:"définition de la translation demandée en 2025 (1 point)",
 plain:`La translation de vecteur ${vc("u")} envoie M sur le point M′ tel que ${vc("MM′")} = ${vc("u")}. L'homothétie de centre K et de rapport λ envoie M sur M′ tel que ${vc("KM′")} = λ${vc("KM")} : elle ${hl("multiplie les distances par |λ|")} et envoie chaque droite sur une droite parallèle. Fais varier λ.`,
 fig:()=>({w:560,h:300,P:{K:[90,200],A:[230,120],B:[250,230]},S:{l:1.7},labels:{K:"K"},
   sliders:[{k:"l",label:"Rapport λ :",min:-2,max:2.4,step:0.05,fmt:v=>fr(v)}],
   draw:(P,S)=>{const h=X=>add(P.K,mul(sub(X,P.K),S.l)),A2=h(P.A),B2=h(P.B);
     return D.line(P.K,P.A,"l-cons")+D.line(P.K,P.B,"l-cons")+D.seg(P.A,P.B,"l-ink")+D.seg(A2,B2,"l-cob")+D.pt(A2,"A′",P.K,"p-cob","t-cob")+D.pt(B2,"B′",P.K,"p-cob","t-cob");},
   info:(P,S)=>{const h=X=>add(P.K,mul(sub(X,P.K),S.l)),A2=h(P.A),B2=h(P.B);return R.m([["AB",fl(P.A,P.B)],["A′B′",fl(A2,B2)],["|λ| · AB",fr(Math.abs(S.l)*d(P.A,P.B))]])+R.v("A′B′ = |λ| AB et (A′B′) est parallèle à (AB). Avec λ &lt; 0, l'image passe de l'autre côté de K.","ok");},
   hint:"Change λ : positif, négatif, puis −1 (c'est la symétrie centrale)."}),
 formal:`<p><b>Définition 3.3.1.</b> La translation de vecteur ${vc("u")} est l'application t : P → P où t(M) est l'unique point M′ tel que ${vc("MM′")} = ${vc("u")}. Si ${vc("u")} = ${vc("AB")}, ABM′M est un parallélogramme.</p><p><b>Théorème 3.3.2.</b> Une translation préserve les distances, envoie une droite sur une droite parallèle et préserve les angles orientés.</p><p><b>Homothétie</b> de centre K et de rapport λ : h(M) est le point M′ tel que ${vc("KM′")} = λ${vc("KM")}.</p><p><b>Théorème 3.3.4.</b> Elle multiplie les distances par |λ| ; si λ ≠ 0, elle envoie une droite sur une droite parallèle et préserve les angles orientés. (Pour λ &gt; 0, c'est une reformulation de Thalès.)</p>`,
 use:`<p>Deux homothéties de même centre K se composent en une homothétie de centre K (rapports multipliés), et l'ordre ne compte pas. C'est l'outil de l'exercice 2 du CC2 2025.</p>`,
 trap:`L'image d'une droite par une homothétie est parallèle à elle, pas forcément égale (sauf si la droite passe par le centre).`,
 q:"Quelle est la définition de la translation de vecteur u ?",a:"L'application t : P → P qui à M associe l'unique point M′ tel que MM′ (vecteur) = u.",rel:["g-rotation"]});

/* ---------------- Pythagore ---------------- */
push(5,{id:"g-pythagore",type:"th",ref:"Théorème 4.1.1",t:"Théorème de Pythagore et sa réciproque",short:"Pythagore",cc:"5 points en 2024 (les deux démonstrations)",
 plain:`ABC est rectangle en A ${hl("si et seulement si")} BC² = AB² + AC². Les deux sens se démontrent : le sens direct avec des triangles semblables, la réciproque avec un triangle isométrique. Déplace A : l'égalité n'est vraie que pour un angle droit.`,
 fig:()=>({w:560,h:300,P:{A:[200,90],B:[90,240],C:[430,240]},
   draw:(P)=>{const H=proj(P.A,P.B,P.C),right=Math.abs(absang(P.B,P.A,P.C)-PI/2)<0.02;
     return tri(P.A,P.B,P.C,"l-ink",right?"f-ok":"f-cob")+D.seg(P.A,H,"l-cons")+(right?D.right(P.B,P.A,P.C,12,"l-ok"):"")+D.pt(H,"H",P.A,"p-fix");},
   info:(P)=>{const a=d(P.B,P.C),b=d(P.A,P.C),c=d(P.A,P.B),right=Math.abs(absang(P.B,P.A,P.C)-PI/2)<0.02;
     return R.m([["|Â|",fa(absang(P.B,P.A,P.C))],["BC²",sq(a)],["AB² + AC²",fr(b*b+c*c)]])+R.v(right?"Angle droit en A : BC² = AB² + AC².":"Pas d'angle droit en A : BC² ≠ AB² + AC². Si l'angle en A est obtus, BC² est plus grand ; s'il est aigu, plus petit.",right?"ok":"");},
   hint:"Déplace A jusqu'à obtenir un angle droit."}),
 formal:`<p><b>Théorème 4.1.1.</b> Soit ABC un triangle du plan. Les deux assertions suivantes sont équivalentes : le triangle ABC est rectangle en A ; BC² = AB² + AC².</p><p><b>Sens direct.</b> H est le pied de la hauteur issue de A ; H ∈ [BC] car les angles en B et C sont aigus, donc BH + HC = BC. Les triangles ACB et HAB sont semblables (un angle droit, l'angle en B commun), donc BC/BA = BA/BH, d'où AB² = BC · BH. De même AC² = BC · HC. Donc AB² + AC² = BC(BH + HC) = BC².</p><p><b>Réciproque.</b> Soit C′ sur la perpendiculaire à (AB) en A avec AC′ = AC. Par le sens direct dans ABC′ : BC′² = AB² + AC′² = AB² + AC² = BC², donc BC′ = BC. Les triangles ABC et ABC′ ont leurs trois côtés égaux : ils sont isométriques, donc |BAC| = |BAC′| = π/2.</p>`,
 use:`<p>Au CC 2024, chaque sens valait 2,5 points : apprends les deux preuves (voir la leçon). Pour un calcul, écris toujours « ABC est rectangle en A, donc d'après le théorème de Pythagore… ».</p>`,
 trap:`L'hypoténuse est le côté opposé à l'angle droit : BC² = AB² + AC² pour un angle droit en A, pas en B.`,
 q:"Sur quoi repose la preuve du théorème de Pythagore, dans le sens direct (ABC rectangle en A ⇒ BC² = AB² + AC²) ?",a:"Sur les triangles semblables ACB et HAB (H pied de la hauteur issue de A) : AB² = BC · BH et AC² = BC · HC, puis on additionne.",rel:["g-trigo","g-alkashi"]});

/* ---------------- Trigonométrie ---------------- */
push(5,{id:"g-trigo",type:"def",ref:"Définition 4.2.1, propositions 4.2.2 et 4.2.3",t:"Cosinus, sinus et tangente",short:"cos, sin, tan",
 plain:`Dans un triangle rectangle, cos = ${hl("adjacent / hypoténuse")}, sin = ${hl("opposé / hypoténuse")}, tan = opposé / adjacent (CAH-SOH-TOA). Ces rapports ne dépendent que de l'angle. Déplace B ou C.`,
 fig:()=>({w:560,h:300,P:{A:[110,240],B:[430,240],C:[110,80]},
   con:{B:(p,P)=>V(Math.max(P.A.x+40,p.x),P.A.y),C:(p,P)=>V(P.A.x,Math.min(P.A.y-40,p.y))},
   draw:(P)=>tri(P.A,P.B,P.C,"l-ink","f-cob")+D.right(P.B,P.A,P.C,12,"l-thin")+D.marks(P.A,P.B,P.C,28,1,"l-amb")+D.seg(P.A,P.B,"l-amb")+D.seg(P.A,P.C,"l-cob"),
   info:(P)=>{const AB=d(P.A,P.B),AC=d(P.A,P.C),BC=d(P.B,P.C),x=absang(P.A,P.B,P.C);
     return R.m([["|B̂|",fa(x)],["cos B̂ = AB/BC",fr(AB/BC,3)],["sin B̂ = AC/BC",fr(AC/BC,3)],["tan B̂ = AC/AB",fr(AC/AB,3)],["cos² + sin²",fr((AB/BC)**2+(AC/BC)**2,3)]])+R.v("cos² B̂ + sin² B̂ = 1 : c'est le théorème de Pythagore divisé par BC².","ok");},
   hint:"Allonge ou raccourcis les côtés : le rapport ne change que si l'angle change."}),
 formal:`<p><b>Définition 4.2.1.</b> ABC rectangle en A : cos(|B̂|) = AB/BC, sin(|B̂|) = AC/BC, tan(|B̂|) = AC/AB.</p><p><b>Proposition 4.2.3.</b> Pour x ∈ ]0, π/2[ : cos²x + sin²x = 1 ; cos(π/2 − x) = sin x ; sin(π/2 − x) = cos x.</p><p>On prolonge ensuite cos et sin à ℝ (cercle trigonométrique) : cos(−x) = cos x, sin(−x) = −sin x, 2π-périodiques.</p>`,
 use:`<p>Valeurs à connaître : cos(π/6) = √3/2, cos(π/4) = √2/2, cos(π/3) = 1/2 (et sin dans l'autre sens).</p>`,
 trap:`Le cosinus de B̂ utilise le côté adjacent à B (AB), pas celui adjacent à C.`,
 q:"Dans un triangle ABC rectangle en A, comment montre-t-on que cos² + sin² = 1 pour l'angle en B ?",a:"(AB/BC)² + (AC/BC)² = (AB² + AC²)/BC² = 1, par Pythagore.",rel:["g-pythagore","g-aire"]});

/* ---------------- Aire ---------------- */
push(5,{id:"g-aire",type:"th",ref:"Théorème 4.2.6",t:"Théorème de l'aire : ½ ab sin Ĉ",short:"Aire = ½ ab sin Ĉ",cc:"2 points en 2025 (la démonstration)",
 plain:`L'aire d'un triangle, c'est ${hl("la moitié du produit de deux côtés par le sinus de l'angle entre eux")}. La preuve : la hauteur vaut AH = AC sin Ĉ.`,
 fig:()=>({w:560,h:300,P:{A:[250,80],B:[90,240],C:[460,240]},
   draw:(P)=>{const H=proj(P.A,P.B,P.C);return tri(P.A,P.B,P.C,"l-ink","f-cob")+D.seg(P.A,H,"l-amb")+D.right(P.A,H,P.C,10,"l-thin")+D.marks(P.A,P.C,P.B,30,1,"l-cob")+D.pt(H,"H",P.A,"p-fix");},
   info:(P)=>{const H=proj(P.A,P.B,P.C),a=d(P.B,P.C),b=d(P.A,P.C),Cc=absang(P.A,P.C,P.B);
     return R.m([["AH",fl(P.A,H)],["AC · sin Ĉ",fr(b*Math.sin(Cc))],["½ · BC · AH",fr(a*d(P.A,H)/2)],["½ · ab · sin Ĉ",fr(a*b*Math.sin(Cc)/2)]])+R.v("Les deux calculs de l'aire donnent le même nombre.","ok");},
   hint:"Déplace les sommets : AH et AC · sin Ĉ restent égaux."}),
 formal:`<p><b>Théorème 4.2.6.</b> Avec a = BC, b = AC, c = AB : Aire(ABC) = ½ ab sin(|Ĉ|) = ½ ac sin(|B̂|) = ½ bc sin(|Â|).</p><p><b>Démonstration.</b> Par symétrie, il suffit de traiter la première égalité. Soit H le pied de la hauteur issue de A. Par définition, Aire(ABC) = ½ AH · BC. Or AH = AC sin(|Ĉ|) (triangle AHC rectangle en H). D'où Aire(ABC) = ½ ab sin(|Ĉ|).</p>`,
 use:`<p>Utile pour une bissectrice : l'aire de ABC est la somme des aires des deux petits triangles (CC2 2025, ex. 3).</p>`,
 trap:`Si l'angle en C est obtus, H est hors de [BC] mais AH = AC sin(|Ĉ|) reste vrai (sin(π − x) = sin x).`,
 q:"Démontre la formule Aire(ABC) = ½ ab sin Ĉ, où a = BC et b = AC.",a:"H pied de la hauteur issue de A : Aire = ½ AH · BC, et AH = AC sin Ĉ dans le triangle AHC rectangle en H.",rel:["g-trigo","g-alkashi"]});

/* ---------------- Al-Kashi ---------------- */
push(5,{id:"g-alkashi",type:"th",ref:"Théorème 4.3.1",t:"Théorème d'Al-Kashi (Pythagore généralisé)",short:"Al-Kashi",cc:"énoncé demandé en 2025 (1 point)",
 plain:`Pour n'importe quel triangle : a² = b² + c² − 2bc cos Â. Quand Â est droit, ${hl("cos Â = 0")} et on retrouve Pythagore. Déforme le triangle.`,
 fig:()=>({w:560,h:300,P:{A:[230,90],B:[90,240],C:[450,230]},
   draw:(P)=>tri(P.A,P.B,P.C,"l-ink","f-cob")+D.marks(P.B,P.A,P.C,26,1,"l-amb"),
   info:(P)=>{const a=d(P.B,P.C),b=d(P.A,P.C),c=d(P.A,P.B),A=absang(P.B,P.A,P.C);
     return R.m([["|Â|",fa(A)],["a² = BC²",sq(a)],["b² + c² − 2bc cos Â",fr(b*b+c*c-2*b*c*Math.cos(A))],["cos Â = (b² + c² − a²)/(2bc)",fr((b*b+c*c-a*a)/(2*b*c),3)]])+R.v("Toujours égal : c'est Al-Kashi. Avec Â = π/2, c'est Pythagore.","ok");},
   hint:"Essaie un angle en A aigu, droit, puis obtus."}),
 formal:`<p><b>Théorème 4.3.1.</b> Pour tout triangle ABC : BC² = AB² + AC² − 2 AC · AB cos(BAC). Avec a = BC, b = AC, c = AB : <b>a² = b² + c² − 2bc cos Â</b>, soit cos Â = (b² + c² − a²)/(2bc).</p><p>Avec le produit scalaire : BC² = AB² + AC² − 2⟨${vc("AB")}, ${vc("AC")}⟩.</p><p><b>Idée de la preuve.</b> H pied de la hauteur issue de B, angle en C aigu. On calcule CH² = b² + AH² − 2bc cos Â (dans les deux cas Â aigu ou obtus), puis Pythagore dans BHC et BHA.</p>`,
 use:`<p>Trois côtés connus → un angle (cos Â). Deux côtés et l'angle entre eux → le troisième côté.</p>`,
 trap:`Le cosinus est celui de l'angle opposé au côté calculé (a est opposé à Â).`,
 q:"Énonce le théorème d'Al-Kashi dans un triangle ABC.",a:"Dans un triangle ABC, BC² = AB² + AC² − 2 AB · AC cos(BAC), soit a² = b² + c² − 2bc cos Â.",rel:["g-pythagore","g-scalaire"]});

/* ---------------- Rotations ---------------- */
push(5,{id:"g-rotation",type:"def",ref:"Définition 4.5.1, théorème 4.5.2",t:"Rotations",short:"Rotations",
 plain:`La rotation de centre Z et d'angle α envoie M sur le point M′ ${hl("à la même distance de Z")}, avec ${an("MZM′")} = α. Elle conserve les distances et les angles orientés. Fais varier l'angle.`,
 fig:()=>({w:560,h:300,P:{Z:[270,170],M:[400,130],N:[380,240]},S:{t:1.2},labels:{Z:"Z"},
   sliders:[{k:"t",label:"Angle α :",min:-3.1,max:3.1,step:0.01,fmt:v=>G.piTxt(v)}],
   draw:(P,S)=>{const M2=rot(P.M,P.Z,S.t),N2=rot(P.N,P.Z,S.t);
     return D.seg(P.Z,P.M,"l-cons")+D.seg(P.Z,M2,"l-cons")+D.arc(P.M,P.Z,M2,34,"l-amb",true,"amb")+D.seg(P.M,P.N,"l-ink")+D.seg(M2,N2,"l-cob")+D.pt(M2,"M′",P.Z,"p-cob","t-cob")+D.pt(N2,"N′",P.Z,"p-cob","t-cob");},
   info:(P,S)=>{const M2=rot(P.M,P.Z,S.t),N2=rot(P.N,P.Z,S.t);return R.m([["ZM",fl(P.Z,P.M)],["ZM′",fl(P.Z,M2)],["MN",fl(P.M,P.N)],["M′N′",fl(M2,N2)],[an("MZM′"),fa(ang(P.M,P.Z,M2),false)]])+R.v("ZM = ZM′ et MN = M′N′ : la rotation conserve les distances.","ok");},
   hint:"Bouge M et N, puis l'angle."}),
 formal:`<p><b>Définition 4.5.1.</b> Soit Z ∈ P et α ∈ ℝ/2πℤ. La rotation r = r<sub>Z,α</sub> associe à tout point M l'unique point r(M) tel que ZM = Zr(M) et ${an("MZr(M)")} = α (et r(Z) = Z).</p><p><b>Théorème 4.5.2.</b> Une rotation conserve les distances, envoie une droite sur une droite (l'angle entre elles est |α|) et conserve les angles orientés.</p>`,
 use:`<p>Pour montrer qu'une rotation envoie A sur B : vérifier ZA = ZB et ${an("AZB")} = α. Au CC 2024, on composait une rotation et une homothétie de même centre (dans les deux ordres, le résultat est le même).</p>`,
 trap:`La symétrie centrale est la rotation d'angle π ; une symétrie axiale n'est pas une rotation (elle change le signe des angles orientés).`,
 q:"Quelle est la définition de la rotation de centre Z et d'angle α ?",a:"r(Z) = Z, et pour M ≠ Z, r(M) est l'unique point tel que ZM = Zr(M) et (ZM, Zr(M)) = α [2π].",rel:["g-scalaire"]});

/* ---------------- Produit scalaire ---------------- */
push(5,{id:"g-scalaire",type:"def",ref:"Définition 4.6.2, proposition 4.6.3",t:"Produit scalaire",short:"Produit scalaire",
 plain:`⟨${vc("u")}, ${vc("v")}⟩ = ‖${vc("u")}‖ · ‖${vc("v")}‖ · cos(angle). Dans un repère orthonormé, c'est ${hl("xx′ + yy′")}. Il est nul exactement quand les vecteurs sont orthogonaux.`,
 fig:()=>({w:560,h:300,P:{O:[260,180],U:[400,120],W:[330,60]},labels:{O:"O",U:"u",W:"v"},
   draw:(P)=>D.seg(V(40,P.O.y),V(520,P.O.y),"l-thin")+D.seg(V(P.O.x,20),V(P.O.x,290),"l-thin")+D.vec(P.O,P.U,"l-cob")+D.vec(P.O,P.W,"l-amb")+D.arc(P.U,P.O,P.W,30,"l-cons"),
   info:(P)=>{const u=V((P.U.x-P.O.x)/40,(P.O.y-P.U.y)/40),w=V((P.W.x-P.O.x)/40,(P.O.y-P.W.y)/40),nu=Math.hypot(u.x,u.y),nw=Math.hypot(w.x,w.y),t=absang(P.U,P.O,P.W);
     const ps=u.x*w.x+u.y*w.y;return R.m([["u",`(${fr(u.x,1)} ; ${fr(u.y,1)})`],["v",`(${fr(w.x,1)} ; ${fr(w.y,1)})`],["‖u‖ ‖v‖ cos θ",fr(nu*nw*Math.cos(t))],["xx′ + yy′",fr(ps)]])+R.v(Math.abs(ps)<0.15?"Produit scalaire nul : les vecteurs sont orthogonaux.":"Les deux formules donnent le même nombre.",Math.abs(ps)<0.15?"ok":"");},
   hint:"Rends les deux vecteurs perpendiculaires : le produit scalaire s'annule."}),
 formal:`<p><b>Définition 4.6.2.</b> ⟨${vc("u")}, ${vc("v")}⟩ = ‖${vc("u")}‖ · ‖${vc("v")}‖ · cos(angle(${vc("u")}, ${vc("v")})). Il est symétrique.</p><p><b>Proposition 4.6.3.</b> Dans un repère orthonormé, si P et Q ont pour coordonnées (x, y) et (x′, y′) : ⟨${vc("OP")}, ${vc("OQ")}⟩ = xx′ + yy′, et OP = √(x² + y²).</p><p>Al-Kashi s'écrit BC² = AB² + AC² − 2⟨${vc("AB")}, ${vc("AC")}⟩.</p>`,
 use:`<p>Deux vecteurs non nuls sont orthogonaux si et seulement si leur produit scalaire est nul.</p>`,
 trap:`xx′ + yy′ n'est valable que dans un repère orthonormé.`,
 q:"Produit scalaire de (2, 1) et (−1, 2) dans un repère orthonormé ?",a:"2 × (−1) + 1 × 2 = 0 : les vecteurs sont orthogonaux.",rel:["g-alkashi"]});

/* ---------------- Cercle et droite ---------------- */
push(6,{id:"g-cercle-droite",type:"th",ref:"Théorèmes 5.1.1 et 5.1.2",t:"Cercle et droite, tangentes",short:"Cercle et droite",
 plain:`On compare la distance OM du centre à la droite (M est le projeté de O) au rayon r : ${hl("OM > r")} pas d'intersection, ${hl("OM = r")} tangente, ${hl("OM < r")} deux points, dont M est le milieu.`,
 fig:()=>({w:560,h:300,P:{O:[260,150],P1:[60,250],P2:[520,180]},S:{r:2.6},labels:{O:"O",P1:"",P2:"Δ"},
   sliders:[{k:"r",label:"Rayon r :",min:0.8,max:3.6,step:0.05,fmt:v=>fr(v)}],
   draw:(P,S)=>{const r=S.r*40,M=proj(P.O,P.P1,P.P2),om=dpx(P.O,M);let s=D.circ(P.O,r,"l-ink")+D.line(P.P1,P.P2,"l-cob")+D.seg(P.O,M,"l-amb")+D.pt(M,"M",P.O,"p-fix");
     if(om<r-0.5){const k=Math.sqrt(r*r-om*om),u=unit(sub(P.P2,P.P1));s+=D.pt(add(M,mul(u,k)),"A",P.O,"p-cob","t-cob")+D.pt(add(M,mul(u,-k)),"B",P.O,"p-cob","t-cob");}
     return s;},
   info:(P,S)=>{const M=proj(P.O,P.P1,P.P2),om=d(P.O,M),r=S.r;const c=Math.abs(om-r)<0.06?"tangente":om>r?"extérieure":"sécante";
     return R.m([["OM",fr(om)],["r",fr(r)]])+R.v(c==="tangente"?"OM = r : la droite est tangente en M, perpendiculaire à (OM).":c==="extérieure"?"OM > r : la droite ne coupe pas le cercle.":"OM < r : deux points A et B, et M est le milieu de [AB].",c==="tangente"?"ok":"");},
   hint:"Change le rayon ou bouge la droite."}),
 formal:`<p><b>Théorème 5.1.1.</b> M projeté orthogonal de O sur Δ : si OM > r, Δ ∩ C = ∅ ; si OM = r, Δ ∩ C = {M} (Δ tangente) ; si OM < r, deux points A et B et M est le milieu de [AB]. Preuve : OX² = OM² + XM² ≥ OM² (Pythagore dans OXM).</p><p><b>Théorème 5.1.2.</b> Si M ∈ C, la tangente en M est l'unique perpendiculaire à (OM) passant par M. Si M est extérieur, il y a deux tangentes, de points de contact T et T′, avec MT = MT′ = √(OM² − r²).</p>`,
 use:`<p>Pour justifier une tangente : (OT) ⊥ (MT). Pour une longueur de tangente : Pythagore dans OMT rectangle en T.</p>`,
 trap:`Une droite tangente touche le cercle en un seul point : ce n'est pas « une droite qui ne coupe pas ».`,
 q:"C est un cercle de centre O, et M un point de C. Quelle droite est la tangente à C en M ?",a:"C'est l'unique droite passant par M et perpendiculaire à (OM).",rel:["g-angle-centre"]});

/* ---------------- Angle au centre ---------------- */
push(6,{id:"g-angle-centre",type:"th",ref:"Théorème 5.2.1",t:"Théorème de l'angle au centre",short:"Angle au centre",cc:"3 points en 2025 (la démonstration)",
 plain:`Sur un cercle de centre O, pour A et B fixés : ${hl("l'angle au centre AOB est le double de l'angle inscrit AMB")}, quel que soit M sur le cercle (en angles orientés, modulo 2π). Déplace M sur le cercle.`,
 fig:()=>({w:560,h:320,P:{O:[280,165],A:[180,240],B:[390,250],M:[300,40]},labels:{O:"O"},
   con:{A:(p,P)=>onCircle(P.O,125)(p),B:(p,P)=>onCircle(P.O,125)(p),M:(p,P)=>onCircle(P.O,125)(p)},
   after:(P,S,Fg)=>{if(!Fg._i){Fg._i=1;["A","B","M"].forEach(k=>{P[k]=onCircle(P.O,125)(P[k]);});Fg.render();}},
   draw:(P)=>D.circ(P.O,125,"l-ink")+D.seg(P.O,P.A,"l-amb")+D.seg(P.O,P.B,"l-amb")+D.seg(P.M,P.A,"l-cob")+D.seg(P.M,P.B,"l-cob")+D.arc(P.A,P.O,P.B,26,"l-amb")+D.arc(P.A,P.M,P.B,30,"l-cob")+D.seg(P.O,P.M,"l-cons"),
   info:(P)=>{const a=ang(P.A,P.O,P.B),b=ang(P.A,P.M,P.B);return R.m([[an("AOB"),fa(a,false)],[an("AMB"),fa(b,false)],["2 × "+an("AMB")+" (mod 2π)",fa(mod2pi(2*b),false)]])+R.v("L'angle au centre vaut le double de l'angle inscrit, modulo 2π.","ok");},
   hint:"Fais glisser M sur le cercle : l'angle inscrit ne change pas (tant que M reste sur le même arc)."}),
 formal:`<p><b>Théorème 5.2.1.</b> Soient C un cercle de centre O, A, B ∈ C distincts et M ∈ P ∖ {A, B}. Alors M ∈ C si et seulement si ${an("AOB")} = 2${an("AMB")} [2π].</p><p><b>Démonstration (sens direct).</b> AMO est isocèle en O, donc ${an("AOM")} + 2${an("OMA")} = π, soit ${an("AOM")} = π − 2${an("OMA")}. De même ${an("BOM")} = π − 2${an("OMB")}. D'où ${an("AOB")} = ${an("AOM")} − ${an("BOM")} = −2${an("OMA")} + 2${an("OMB")} = 2${an("AMO")} + 2${an("OMB")} = 2${an("AMB")}.</p><p><b>Corollaire 5.2.3 (angle inscrit).</b> Pour A, B ∈ C, l'angle ((MA), (MB)) ne dépend pas de M ∈ C ∖ {A, B} (modulo π).</p>`,
 use:`<p>Au CC 2025, la preuve du sens direct valait 3 points : deux triangles isocèles, puis Chasles. Voir la leçon.</p>`,
 trap:`En angles non orientés, il faut distinguer selon l'arc où se trouve M (petit ou grand arc).`,
 q:"A, B et M sont sur un cercle de centre O. Quels triangles utilise la preuve du théorème de l'angle au centre (AOB = 2 AMB) ?",a:"Les triangles AMO et BMO, isocèles en O (OA = OM = OB) : la somme de leurs angles donne AOM = π − 2·OMA et BOM = π − 2·OMB.",rel:["g-cocycliques","g-cercle-droite"]});

/* ---------------- Cocycliques ---------------- */
push(6,{id:"g-cocycliques",type:"th",ref:"Corollaires 5.2.5 et 5.2.7",t:"Cercle de diamètre et points cocycliques",short:"Cocycliques",
 plain:`M est sur le cercle de diamètre [AB] ${hl("si et seulement si")} AMB est rectangle en M. Et quatre points A, B, C, D sont cocycliques (ou alignés) si et seulement si ((CA), (CB)) = ((DA), (DB)) modulo π. Déplace D.`,
 fig:()=>({w:560,h:320,P:{O:[280,165],A:[170,230],B:[400,240],C:[250,45],Dd:[420,90]},labels:{O:"O",Dd:"D"},
   con:{A:(p,P)=>onCircle(P.O,125)(p),B:(p,P)=>onCircle(P.O,125)(p),C:(p,P)=>onCircle(P.O,125)(p)},
   after:(P,S,Fg)=>{if(!Fg._i){Fg._i=1;["A","B","C"].forEach(k=>{P[k]=onCircle(P.O,125)(P[k]);});Fg.render();}},
   draw:(P)=>D.circ(P.O,125,"l-ink")+D.seg(P.C,P.A,"l-cob")+D.seg(P.C,P.B,"l-cob")+D.seg(P.Dd,P.A,"l-amb")+D.seg(P.Dd,P.B,"l-amb"),
   info:(P)=>{const c=modpi(ang(P.A,P.C,P.B)),dd=modpi(ang(P.A,P.Dd,P.B)),ok=Math.abs(modpi(c-dd))<0.03;
     return R.m([["((CA), (CB))",fa(c,false)],["((DA), (DB))",fa(dd,false)]])+R.v(ok?"Égaux modulo π : A, B, C, D sont cocycliques (D est sur le cercle).":"Différents : D n'est pas sur le cercle de A, B, C.",ok?"ok":"");},
   hint:"Amène D sur le cercle : les deux angles deviennent égaux."}),
 formal:`<p><b>Corollaire 5.2.5.</b> O milieu de [AB], M ≠ A, B : M est sur le cercle de diamètre [AB] si et seulement si AMB est rectangle en M.</p><p><b>Corollaire 5.2.7.</b> A, B, C, D distincts sont cocycliques ou alignés si et seulement si ((CA), (CB)) = ((DA), (DB)) [π].</p>`,
 use:`<p>Pour montrer que quatre points sont sur un même cercle : comparer deux angles de droites qui « voient » [AB] (modulo π).</p>`,
 trap:`L'égalité est modulo π (angles de droites), pas modulo 2π.`,
 q:"Comment montrer que M est sur le cercle de diamètre [AB] ?",a:"Montrer que le triangle AMB est rectangle en M.",rel:["g-angle-centre"]});

/* ---------------- quiz du CC2 ---------------- */
(window.QUIZ=window.QUIZ||[]).push(
 {q:"L'image d'une droite par une homothétie de rapport λ ≠ 0 est…",o:["une droite parallèle","la même droite","un cercle"],a:0,e:"Une homothétie envoie chaque droite sur une droite parallèle (théorème 3.3.4). C'est la même droite seulement quand elle passe par le centre.",link:"g-homothetie"},
 {q:"ABC est rectangle en A si et seulement si…",o:["BC² = AB² + AC²","AB² = BC² + AC²","AC² = AB² + BC²"],a:0,e:"L'hypoténuse est opposée à l'angle droit.",link:"g-pythagore"},
 {q:"Dans un triangle ABC rectangle en A, que vaut le cosinus de l'angle en B ?",o:["AB/BC","AC/BC","AC/AB"],a:0,e:"Le côté adjacent à l'angle en B, AB, divisé par l'hypoténuse BC.",link:"g-trigo"},
 {q:"Dans un triangle ABC, avec a = BC et b = AC, quelle formule donne l'aire ?",o:["½ ab sin Ĉ","ab sin Ĉ","½ ab cos Ĉ"],a:0,e:"a = BC et b = AC entourent l'angle en C.",link:"g-aire"},
 {q:"Dans un triangle ABC, avec a = BC, b = AC et c = AB, que dit le théorème d'Al-Kashi pour a² ?",o:["b² + c² − 2bc cos Â","b² + c² + 2bc cos Â","b² + c² − 2bc sin Â"],a:0,e:"Avec Â droit, on retrouve Pythagore.",link:"g-alkashi"},
 {q:"Une rotation conserve…",o:["les distances et les angles orientés","seulement les distances","seulement les angles"],a:0,e:"Une rotation est une isométrie, et elle garde aussi le sens des angles (théorème 4.5.2).",link:"g-rotation"},
 {q:"Le produit scalaire ⟨u, v⟩ de deux vecteurs non nuls vaut 0. Cela signifie…",o:["u et v orthogonaux","u et v colinéaires","u = v"],a:0,e:"⟨u, v⟩ = ‖u‖ ‖v‖ cos(angle). Les longueurs ne sont pas nulles : c'est le cosinus qui vaut 0, donc l'angle est droit.",link:"g-scalaire"},
 {q:"Un cercle a pour centre O et pour rayon r. M est le projeté orthogonal de O sur une droite Δ, et OM = r. Alors…",o:["Δ est tangente","Δ ne coupe pas le cercle","Δ coupe en deux points"],a:0,e:"La distance de O à la droite est exactement le rayon : Δ touche le cercle en un seul point, M (théorème 5.1.1).",link:"g-cercle-droite"},
 {q:"A, B et M sont sur un cercle de centre O. Quel est le lien entre l'angle au centre AOB et l'angle inscrit AMB ?",o:["AOB = 2 AMB [2π]","AMB = 2 AOB","AOB = AMB"],a:0,e:"L'angle au centre est le double de l'angle inscrit (théorème 5.2.1).",link:"g-angle-centre"},
 {q:"M est un point différent de A et de B. « M est sur le cercle de diamètre [AB] » équivaut à…",o:["AMB rectangle en M","AMB isocèle en M","M milieu de [AB]"],a:0,e:"Corollaire 5.2.5 : un angle inscrit dans un demi-cercle est droit.",link:"g-cocycliques"});

/* ---------------- annales du CC2 ---------------- */
(window.ANN=window.ANN||[]).push(
 {src:"CC2 2025 · Cours · 7 pts",t:"Al-Kashi, translation, aire, angle au centre",en:"(1) Énoncer Al-Kashi [1]. (2) Définition d'une translation [1]. (3) Montrer Aire(ABC) = ½ ab sin Ĉ [2]. (4) A, B ∈ C de centre O, M ∈ C ∖ {A, B} : montrer AOB = 2AMB [2π] [3].",
  sol:`<ol><li>BC² = AB² + AC² − 2 AB · AC cos(BAC).</li><li>t(M) est l'unique point M′ tel que MM′ (vecteur) = u.</li><li>H pied de la hauteur issue de A : Aire = ½ AH · BC et AH = AC sin Ĉ.</li><li>AMO et BMO isocèles en O : AOM = π − 2OMA et BOM = π − 2OMB, puis AOB = AOM − BOM = 2AMB (voir la leçon « Angle au centre »).</li></ol>`},
 {src:"CC2 2025 · Ex. 1 · 4 pts",t:"Orthocentre et triangle isocèle",en:"ABC non dégénéré, H son orthocentre. On suppose BH = CH. Montrer que ABC est isocèle en A.",
  sol:`<p>BH = CH : H est sur la médiatrice de [BC], qui est perpendiculaire à (BC). H est aussi sur la hauteur issue de A, perpendiculaire à (BC). Par H passe une seule perpendiculaire à (BC) : la hauteur issue de A est donc la médiatrice de [BC]. A est sur cette médiatrice, donc AB = AC : ABC est isocèle en A.</p>`},
 {src:"CC2 2025 · Ex. 2 · 5 pts",t:"Deux homothéties de même centre",en:"A, B, C ∈ Δ, A′, B′, C′ ∈ Δ′, Δ et Δ′ sécantes en K, (AB′) ∥ (BA′) et (BC′) ∥ (CB′). Montrer que (AC′) ∥ (CA′).",
  sol:`<ol><li>Avec Thalès, l'homothétie h₁ de centre K qui envoie A sur B envoie la droite (AB′) sur la parallèle passant par B, c'est-à-dire (BA′) ; elle envoie Δ′ sur Δ′ (droite passant par K), donc B′ sur A′. De même h₂ envoie B sur C et C′ sur B′.</li><li>h₃ = h₂ ∘ h₁ est une homothétie de centre K ; deux homothéties de même centre commutent. h₃(A) = h₂(B) = C et h₃(C′) = h₁(h₂(C′)) = h₁(B′) = A′.</li><li>h₃ envoie la droite (AC′) sur (CA′), qui lui est donc parallèle.</li></ol>`},
 {src:"CC2 2025 · Ex. 3 · 4 pts",t:"Longueur d'une bissectrice",en:"ABC rectangle en A, AB = 3, AC = 4, BC = 5. D est sur [BC] et sur la bissectrice issue de A. Calculer AD.",
  sol:`<p>Aire(ABC) = ½ · 3 · 4 = 6. Elle vaut aussi Aire(ABD) + Aire(ADC) = ½ · 3 · AD · sin(π/4) + ½ · 4 · AD · sin(π/4) = (7√2/4) AD. Donc AD = 24/(7√2) = <b>12√2/7</b> ≈ 2,42.</p>`},
 {src:"CC2 2024 · Cours · 5 pts",t:"Les deux sens de Pythagore",en:"(a) Si ABC est rectangle en A, alors BC² = AB² + AC². (b) Si BC² = AB² + AC², alors ABC est rectangle en A.",
  sol:`<p>(a) Triangles semblables ACB et HAB (H pied de la hauteur) : AB² = BC · BH, AC² = BC · HC, on additionne. (b) C′ sur la perpendiculaire à (AB) en A avec AC′ = AC : BC′ = BC, donc ABC et ABC′ sont isométriques et l'angle en A est droit. Détails dans la leçon « Pythagore ».</p>`});
})();
