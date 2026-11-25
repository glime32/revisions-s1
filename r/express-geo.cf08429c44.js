/* Le CC2 de Géométrie en 1 h (vendredi 11/12, 9 h 45, épreuve de 1 h 30). Programme pas encore annoncé : la suite du poly après le CC1,
   comme dans matiere-geo.js. Ordre et points d'après les CC2 de 2024 et 2025 : triangles isométriques et isocèles 15 points en 2024
   (avec la rotation), homothéties 5 en 2025, démonstrations du cours 5 en 2024 et 5 en 2025, aire et bissectrice 4, orthocentre 4,
   énoncés et définitions 2. Les exemples des méthodes sont refaits par tools/verif/express/geo.js. Les exercices sont tirés de gen-geo.js. */
(()=>{const an=s=>`<span class="ang">${s}</span>`,ab=s=>`<span class="en-nb">|${an(s)}|</span>`,ve=s=>`<span class="vec">${s}</span>`;
(window.EXPRESS=window.EXPRESS||{}).geo={cc2:{
 t:"Le CC2 de Géométrie en 1 h",du:"du CC",au:"au CC",
 lead:"Le programme du CC2 n'est pas encore annoncé : le site prend la suite du poly après le CC1 (translations et homothéties, chapitre 4, chapitre 5), comme aux CC2 de 2024 et 2025. Les notions viennent dans l'ordre de ce qui a rapporté le plus à ces deux sujets. Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20. Le vrai CC dure 1 h 30 ; ce parcours tient en 1 h. Pas dans l'heure, faute de temps : les formules d'addition (§4.4) et les tangentes à un cercle (§5.1). Elles sont dans S'entraîner (Géométrie), à faire après le parcours.",
 carte:"la suite du poly en 1 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Cinq questions dans l'ordre des CC2 : une démonstration du cours, les triangles isométriques, les homothéties, l'angle au centre, puis le produit scalaire. Fais-les sans revenir aux notions : la note qui sort est celle que tu aurais eue.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"iso",t:"Triangles isométriques : les bons triangles, le bon cas",pts:3,ou:"CC2 2024, ex. 2 (b) et (c) ; CC1 2026, ex. 1",lect:2,exo:{g:"GE7",lv:2},
  ess:`<ul><li>Pour montrer que deux longueurs (ou deux angles) sont égales, on cherche <b>deux triangles isométriques</b> : l'un contient la première, l'autre la seconde.</li>
<li>Les trois cas de l'axiome V : <b>CCC</b> (trois côtés), <b>CAC</b> (deux côtés et l'angle <b>entre</b> eux), <b>ACA</b> (un côté et les deux angles à ses bouts). Avec un côté et deux angles placés autrement, le corollaire 2.4.3 ramène à ACA.</li>
<li>Les égalités viennent de l'énoncé (isocèle, milieu, bissectrice, angle droit) ou de ce que les deux triangles ont <b>en commun</b> (un côté, un angle).</li></ul>`,
  piege:`Trois angles égaux ne suffisent pas : les triangles ont la même forme, pas forcément la même taille. Et pour CAC, l'angle doit être celui que forment les deux côtés.`,
  meth:`<p>CC1 2026, ex. 1 : ABC est isocèle en A, I est le milieu de [AB] et J celui de [AC]. Montrer que BJ = CI.</p>
<ol><li>BJ est dans le triangle ABJ, CI dans le triangle ACI : on compare ces deux-là, un de chaque côté de la figure.</li>
<li>AB = AC (isocèle en A) ; AJ = AI (moitiés de deux côtés égaux) ; l'angle en A est commun.</li>
<li>Deux côtés et l'angle entre eux : ABJ et ACI sont isométriques (CAC), donc BJ = CI.</li></ol>
<p>CC2 2024, ex. 2 (b) : dans le carré ABCD, ABN et ADM ont un angle droit (en B et en D), AB = AD, et ${ab("DAM")} = π/2 − ${ab("MAB")} = ${ab("BAN")}. Un côté et les deux angles à ses bouts : ACA. Donc AM = AN, et AMN est isocèle en A (question (c)).</p>`},
 {id:"homothetie",t:"Homothéties : deux de même centre, et leur composée",pts:3,ou:"CC2 2025, ex. 2 (5 points)",lect:2,exo:{g:"GE2",lv:3},
  ess:`<ul><li>L'homothétie h de centre K et de rapport λ envoie M sur le point M′ tel que ${ve("KM′")} = λ${ve("KM")} (définition 3.3.3).</li>
<li>Deux homothéties de <b>même centre</b> K se composent en une homothétie de centre K, et <b>les rapports se multiplient</b> : le rapport de h₂ ∘ h₁ est λ₂λ₁ (feuille 3, ex. 1). L'ordre ne change donc rien : h₂ ∘ h₁ = h₁ ∘ h₂.</li>
<li>L'image d'une droite par une homothétie est une droite <b>parallèle</b>.</li></ul>`,
  piege:`Les rapports se multiplient, ils ne s'ajoutent pas. Et l'homothétie qui défait h, de rapport λ, est de rapport 1/λ, pas −λ.`,
  meth:`<ol><li>Composée : λ₁ = 2 et λ₂ = −1/3 donnent h₂ ∘ h₁ de rapport 2 × (−1/3) = −2/3.</li>
<li>Défaire h de rapport 3/2 : μ × 3/2 = 1, donc μ = 2/3.</li>
<li>Rapport manquant : si le rapport de h₂ ∘ h₁ est 6 et λ₁ = −2, alors λ₂ = 6/(−2) = −3.</li></ol>
<p>Le plan du CC2 2025, ex. 2 : (1) B est sur la droite (KA), donc ${ve("KB")} = λ${ve("KA")} : h₁ de centre K et de rapport λ envoie A sur B ; avec (AB′) // (BA′), Thalès donne aussi h₁(B′) = A′. (2) h₃ = h₂ ∘ h₁ = h₁ ∘ h₂ (même centre), d'où h₃(C′) = h₁(h₂(C′)) = h₁(B′) = A′ et h₃(A) = h₂(B) = C. (3) h₃ envoie la droite (AC′) sur une droite parallèle qui passe par C et A′ : (AC′) // (CA′).</p>`},
 {id:"pythagore",t:"Démontrer Pythagore et sa réciproque",pts:3,ou:"CC2 2024, question de cours (5 points)",lect:2,exo:{g:"GC2",lv:0},
  ess:`<p><b>Sens direct</b> (si ABC est rectangle en A, alors BC² = AB² + AC²), en 4 temps :</p><ol>
<li>H est le pied de la hauteur issue de A ; il est sur [BC], car les angles en B et C sont aigus : BH + HC = BC.</li>
<li>ACB et HAB sont semblables, c'est-à-dire qu'ils ont les mêmes angles (un angle droit, l'angle en B commun) ; leurs côtés sont donc proportionnels : $BC/BA = BA/BH$, donc $AB^{2} = BC · BH$.</li>
<li>De même avec ABC et HAC : $AC^{2} = BC · HC$.</li>
<li>On additionne : $AB^{2} + AC^{2} = BC · (BH + HC) = BC^{2}$.</li></ol>`,
  piege:`La réciproque ne se démontre pas en « relisant » le sens direct à l'envers : on fabrique un second triangle, rectangle par construction, et on utilise le sens direct sur lui.`,
  meth:`<p><b>Réciproque</b> (si BC² = AB² + AC², alors ABC est rectangle en A) :</p><ol>
<li>On place C′ sur la perpendiculaire à (AB) passant par A, avec AC′ = AC.</li>
<li>Le sens direct, dans ABC′ rectangle en A : BC′² = AB² + AC′² = AB² + AC² = BC². Donc BC′ = BC (des longueurs sont positives).</li>
<li>ABC et ABC′ ont leurs trois côtés égaux (AB commun, AC = AC′, BC = BC′) : ils sont isométriques (CCC).</li>
<li>Leurs angles en A sont donc égaux : ${ab("BAC")} = ${ab("BAC′")} = π/2.</li></ol>`},
 {id:"aire",t:"L'aire ½ ab sin Ĉ : la démonstration, la hauteur, la bissectrice",pts:3,ou:"CC2 2025, question de cours (3) et ex. 3 (6 points)",lect:1.5,exo:{g:"GE1",lv:3},
  ess:`<ul><li>On note a = BC, b = AC et c = AB. Alors $Aire(ABC) = 1/2 × a × b × sin(Ĉ)$ : la moitié du produit de deux côtés par le sinus de l'angle <b>qu'ils forment</b> (théorème 4.2.6).</li>
<li>La démonstration : H est le pied de la hauteur issue de A, et $Aire(ABC) = 1/2 × AH × BC$ ; dans AHC rectangle en H, $AH = AC × sin(Ĉ)$ ; donc $Aire(ABC) = 1/2 × BC × AC × sin(Ĉ)$.</li>
<li>Pour une hauteur : aire = base × hauteur / 2, donc hauteur = 2 × aire / base.</li>
<li>Un côté qui manque se calcule avec Al-Kashi : a² = b² + c² − 2bc cos(Â).</li></ul>`,
  piege:`Sans le sinus, la moitié du produit de deux côtés n'est l'aire que si l'angle est droit. Et en isolant la hauteur, le 1/2 devient un 2.`,
  meth:`<ol><li>AB = 6, AC = 4 et ${ab("BAC")} = π/3 : $Aire(ABC) = 1/2 × 6 × 4 × sin(π/3) = 12 × √3/2 = 6√3$.</li>
<li>La hauteur issue de B tombe sur (AC) : $BH = 2 × 6√3/4 = 3√3$.</li>
<li>CC2 2025, ex. 3 : ABC rectangle en A, AB = 3, AC = 4, D le pied de la bissectrice issue de A. D'un côté, $Aire(ABC) = 1/2 × 3 × 4 = 6$. De l'autre, $Aire(ABD) + Aire(ADC) = 1/2 × 3 × AD × sin(π/4) + 1/2 × 4 × AD × sin(π/4) = 7/2 × AD × √2/2$. Donc $AD = 12√2/7$.</li></ol>`},
 {id:"hauteurs",t:"Hauteurs, médiatrice et Pythagore",pts:2,ou:"CC2 2025, ex. 1 (4 points)",lect:2,exo:{g:"GE1",lv:0},
  ess:`<ul><li>Pythagore : dans ABC rectangle en A, BC² = AB² + AC². L'hypoténuse est en face de l'angle droit.</li>
<li>Réciproque : on calcule séparément BC² (le plus grand côté) et AB² + AC². Égaux : rectangle en A. Différents : pas rectangle.</li>
<li>Une droite perpendiculaire à [BC] qui passe par son milieu est sa médiatrice ; un point de la médiatrice est à la même distance de B et de C.</li></ul>`,
  piege:`Sur la copie, on écrit le nom du triangle, le sommet de l'angle droit et le nom du théorème : « Le triangle BHH<sub>A</sub> est rectangle en H<sub>A</sub>, d'après le théorème de Pythagore… ».`,
  meth:`<p>CC2 2025, ex. 1 : H est l'orthocentre de ABC, H<sub>A</sub> le pied de la hauteur issue de A, et BH = CH. Montrer que ABC est isocèle en A.</p>
<ol><li>Pythagore dans BHH<sub>A</sub> et CHH<sub>A</sub>, rectangles en H<sub>A</sub> : BH<sub>A</sub>² = BH² − HH<sub>A</sub>² = CH² − HH<sub>A</sub>² = CH<sub>A</sub>², donc BH<sub>A</sub> = CH<sub>A</sub>.</li>
<li>(AH<sub>A</sub>) est perpendiculaire à (BC) et passe par le milieu H<sub>A</sub> de [BC] : c'est la médiatrice de [BC]. A est dessus, donc AB = AC.</li></ol>
<p>Les calculs : rectangle en A avec AB = 5 et BC = 13 : AC² = 169 − 25 = 144, AC = 12. Côtés 6, 8, 10 : 36 + 64 = 100, rectangle. Côtés 5, 6, 8 : 25 + 36 = 61 ≠ 64, pas rectangle.</p>`},
 {id:"centre",t:"L'angle au centre, l'angle inscrit et le triangle isocèle",pts:2,ou:"CC2 2025, question de cours (4) (3 points)",lect:1.5,exo:{g:"GE4",lv:1},
  ess:`<ul><li>Théorème 5.2.1 : si A, B, M sont sur le cercle de centre O (M distinct de A et B), alors ${an("AOB")} = 2${an("AMB")} [2π], en angles orientés.</li>
<li>Sans orientation : quand M est du même côté de (AB) que O, l'angle au centre ${ab("AOB")} est le double de l'angle inscrit ${ab("AMB")}.</li>
<li>OA = OB (deux rayons) : le triangle OAB est isocèle en O, ses angles en A et en B sont égaux.</li>
<li>Conséquence : deux angles inscrits qui interceptent le même arc sont égaux. Et quatre points distincts A, B, C, D sont cocycliques ou alignés si et seulement si ((CA), (CB)) = ((DA), (DB)) [π] (corollaire 5.2.7).</li></ul>`,
  piege:`Somme des angles de OAB : ${ab("OAB")} = (π − ${ab("AOB")})/2. On oublie souvent de partager en deux.`,
  meth:`<ol><li>${ab("AMB")} = π/5, avec M du même côté de (AB) que O : ${ab("AOB")} = 2 × π/5 = 2π/5.</li>
<li>OAB est isocèle en O : ${ab("OAB")} = (π − 2π/5)/2 = 3π/10.</li></ol>
<p>La démonstration du cours : AMO est isocèle en O, donc ${an("AOM")} = π − 2${an("OMA")} ; de même ${an("BOM")} = π − 2${an("OMB")}. Par Chasles, ${an("AOB")} = ${an("AOM")} − ${an("BOM")} = 2${an("AMO")} + 2${an("OMB")} = 2${an("AMB")}.</p>`},
 {id:"rotation",t:"Rotations, et une rotation suivie d'une homothétie",pts:2,ou:"CC2 2024, ex. 2 (d)",lect:2,exo:{g:"GE5",lv:3},
  ess:`<ul><li>La rotation r de centre Z et d'angle α envoie M sur r(M) tel que Zr(M) = ZM et ${an("MZr(M)")} = α (définition 4.5.1).</li>
<li>Deux rotations de même centre : <b>les angles s'ajoutent</b>. On ramène le résultat dans ]−π ; π] en ajoutant ou en retirant 2π.</li>
<li>f = h ∘ r (r de centre A, puis h de centre A et de rapport k &gt; 0) et X′ = f(X) : AX′ = k × AX et ${an("XAX′")} = α. L'homothétie ne fait pas tourner.</li>
<li>Le produit scalaire : ⟨${ve("u")}, ${ve("v")}⟩ = ‖${ve("u")}‖ × ‖${ve("v")}‖ × cos(angle(${ve("u")}, ${ve("v")})) (définition 4.6.2) ; dans un repère orthonormé, c'est xx′ + yy′ (proposition 4.6.3).</li></ul>`,
  piege:`Avec A′ = r(A), le triangle ZAA′ est isocèle en Z, et AA′ se calcule avec Al-Kashi. AA′ n'est égal à ZA que pour un angle de ±π/3.`,
  meth:`<ol><li>A′ = r(A), ZA = 3 et α = π/2 : AA′² = 9 + 9 − 2 × 3 × 3 × cos(π/2) = 18, donc AA′ = 3√2. Avec α = π/3, ZAA′ est équilatéral : AA′ = ZA.</li>
<li>Angles π/2 et 2π/3 : π/2 + 2π/3 = 7π/6, qui n'est pas dans ]−π ; π] : 7π/6 − 2π = −5π/6.</li>
<li>CC2 2024 : r d'angle −π/4, h de rapport 1/√2, X′ = f(X) et AX = 4 : AX′ = 4/√2 = 2√2 et ${an("XAX′")} = −π/4. Dans le carré direct ABCD, AB = AC/√2 et ${an("CAB")} = −π/4 : f(C) = B.</li></ol>`},
 {id:"cours",t:"Les énoncés et les définitions à connaître",pts:2,ou:"CC2 2025, questions de cours (1) et (2)",lect:1,
  rappel:{min:3,q:`Écris de mémoire le théorème d'Al-Kashi, puis la définition d'une translation, d'une homothétie et d'une rotation.`,
   r:`<ol><li>Soit ABC un triangle, alors BC² = AB² + AC² − 2 AC · AB cos(${an("BAC")}).</li>
<li>La translation de vecteur ${ve("u")} est l'application t : P → P où t(M) est l'unique point M′ tel que ${ve("MM′")} = ${ve("u")}.</li>
<li>Soit A ∈ P et λ ∈ ℝ. L'homothétie de centre A et de rapport λ est l'application h : P → P qui à M associe l'unique point h(M) tel que ${ve("Ah(M)")} = λ${ve("AM")}.</li>
<li>Soit Z ∈ P et α ∈ ℝ/2πℤ. La rotation de centre Z et d'angle α est l'application r : P → P qui à M associe l'unique point r(M) tel que ZM = Zr(M) et ${an("MZr(M)")} = α.</li></ol>`},
  ess:`<ul><li>Un énoncé commence par ses hypothèses (« Soit ABC un triangle »), puis donne la conclusion.</li>
<li>Une définition d'application dit d'où elle part et où elle arrive (de P dans P), puis ce qu'elle fait d'un point M.</li>
<li>Translation : ${ve("MM′")} = ${ve("u")}. Homothétie : ${ve("AM′")} = λ${ve("AM")}. Rotation : même distance au centre, et angle orienté α.</li></ul>`,
  piege:`Al-Kashi met en jeu l'angle <b>entre</b> les deux côtés du second membre : pour BC², c'est l'angle en A.`,
  meth:`<ol><li>Écris les hypothèses (« Soit… »).</li><li>Écris la formule ou la phrase « l'unique point … tel que … ».</li><li>Relis : chaque lettre de la conclusion doit avoir été introduite.</li></ol>`}],
 blanc:[
  {t:"Démontrer le théorème de l'aire",ou:"question de cours (CC2 2025)",pts:4,g:"GC3",lv:0},
  {t:"Triangles isométriques : le cas et ce qu'on en déduit",ou:"exercice 2 (CC2 2024)",pts:4,g:"GE7",lv:1},
  {t:"Homothéties : le rapport et son signe",ou:"exercice 2, question (1) (CC2 2025)",pts:4,g:"GE2",lv:2},
  {t:"Angle au centre, angle inscrit",ou:"question de cours (4) du CC2 2025, appliquée",pts:4,g:"GE4",lv:0},
  {t:"Produit scalaire et angle entre deux vecteurs",ou:"poly, §4.6 (pas tombé aux CC2 de 2024 et 2025)",pts:4,g:"GE5",lv:4}]
}};})();
/* Le CC final de Géométrie en 2 h (épreuve finale du contrôle continu intégral, 40 %, semaine du 14/12, date supposée) : tout le cours.
   Ordre et points estimés d'après le CC3 du 6 janvier 2026 (2 h : cours 6, angle inscrit et rotation 6, nombres complexes 8) et les
   examens de janvier 2024 et 2025 (nombres complexes 8 à 10 points, triangles isométriques, trigonométrie, Al-Kashi, théorème des milieux).
   Les exemples des méthodes sont refaits par tools/verif/express/geo.js. Les exercices sont tirés de gen-geo.js (GE9 : les complexes). */
(()=>{const an=s=>`<span class="ang">${s}</span>`,ab=s=>`<span class="en-nb">|${an(s)}|</span>`,ve=s=>`<span class="vec">${s}</span>`;
const C2=window.EXPRESS.geo.cc2.notions,prend=(id,o)=>Object.assign({},C2.find(n=>n.id===id),o);
window.EXPRESS.geo.ccf={
 t:"Le CC final de Géométrie en 2 h",du:"du CC final",au:"au CC final",duree:120,
 lead:"Le CC final porte sur tout le cours. Sa date et son programme ne sont pas encore annoncés. Le site suit le CC3 du 6 janvier 2026 (2 h) et les examens de janvier 2024 et 2025 : des questions de cours, un exercice de figure, la trigonométrie et un gros exercice en nombres complexes. Les notions viennent dans l'ordre de ce qui a rapporté le plus à ces trois sujets. Les points sont estimés : seul le CC3 donnait un barème. Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20. Pas dans les 2 h, faute de temps : les équations de cercles (§6.2) et les symétries axiales en complexes (§7.4).",
 carte:"tout le cours en 2 h, les nombres complexes d'abord, puis un sujet express noté sur 20.",
 blancLead:"Six questions dans l'ordre du CC3 de l'an dernier : les définitions du cours, l'angle inscrit, une rotation, les triangles isométriques, Al-Kashi, puis une distance en nombres complexes. Fais-les sans revenir aux notions : la note qui sort est une estimation de la tienne.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"angle",t:"Un angle avec un quotient de complexes",pts:3,ou:"CC3 2026, ex. 2 (1) à (3) ; seconde session 2024, ex. 3 (a) et (b)",lect:2.5,exo:{g:"GE9",lv:2},
  ess:`<ul><li>Le plan est identifié à ℂ : le point M de coordonnées (x, y) a pour affixe $z_{M} = x + iy$. Le vecteur ${ve("AB")} a pour affixe $z_{B} − z_{A}$ (proposition 6.1.1).</li>
<li>Distance : $AB = |z_{B} − z_{A}|$ (6.1.3). Angle orienté : $([AB), [AC)) = arg((z_{C} − z_{A})/(z_{B} − z_{A}))$ [2π] (6.1.4).</li>
<li>Pour l'argument : on calcule le quotient sous la forme algébrique, puis on l'écrit $ρe^{iθ}$ : l'angle est θ.</li></ul>`,
  meth:`<p>CC3 2026, ex. 2 : $z_{A} = 1 + i$, $z_{B} = 1 − √3$, $z_{C} = 1 + 3i$.</p>
<ol><li>(1) $z_{B} − z_{A} = −√3 − i$ et $z_{C} − z_{A} = 2i$, donc $AB = √(3 + 1) = 2$ et $AC = 2$ : ABC est isocèle en A.</li>
<li>(2) $(z_{B} − z_{A})/(z_{C} − z_{A}) = (−√3 − i)/(2i) = (−1 + i√3)/2 = e^{2iπ/3}$ : on a multiplié en haut et en bas par −i. Donc ${an("CAB")} = 2π/3$ [2π].</li>
<li>(3) ABC est isocèle en A, et la somme des angles vaut π : ${ab("BCA")} = (π − 2π/3)/2 = π/6$.</li></ol>`,
  piege:`L'ordre compte : ([AB), [AC)) est l'argument de $(z_{C} − z_{A})/(z_{B} − z_{A})$, avec z<sub>C</sub> en haut. Le quotient à l'envers donne l'angle opposé.`},
 {id:"rotz",t:"L'expression complexe d'une rotation, l'image d'un point",pts:3,ou:"CC3 2026, ex. 2 (5) et (6) ; janvier 2025, ex. 3 (a), (d) et (f)",lect:2,exo:{g:"GE9",lv:3},
  ess:`<ul><li>La rotation de centre Ω (affixe ω) et d'angle α : $r(z) = e^{iα}(z − ω) + ω$. Le poly l'écrit $r(z) = e^{iα}z + w$, avec $w = (1 − e^{iα})ω$ (proposition 7.3.1).</li>
<li>À connaître : $e^{iπ/2} = i$, $e^{−iπ/2} = −i$, $e^{iπ} = −1$, $e^{iπ/4} = (√2/2)(1 + i)$, $e^{2iπ/3} = (−1 + i√3)/2$.</li>
<li>Translation de vecteur d'affixe w : $z + w$ (7.1.1). Homothétie de centre ω et de rapport λ : $λ(z − ω) + ω$ (7.2.1).</li></ul>`,
  meth:`<p>CC3 2026, ex. 2 (5) et (6) : r de centre A ($z_{A} = 1 + i$) et d'angle 2π/3, et $z_{B} = 1 − √3$.</p>
<ol><li>$r(z) = e^{2iπ/3}(z − 1 − i) + 1 + i$, avec $e^{2iπ/3} = (−1 + i√3)/2$.</li>
<li>$z_{B} − z_{A} = −√3 − i$, puis $((−1 + i√3)/2)(−√3 − i) = (2√3 − 2i)/2 = √3 − i$.</li>
<li>On rajoute $z_{A}$ : $r(z_{B}) = √3 − i + 1 + i = 1 + √3$.</li></ol>`,
  piege:`Ne pas oublier de retirer ω avant de multiplier, puis de le rajouter : $e^{iα}z_{B}$ seul fait tourner B autour de l'origine.`},
 {id:"cours",t:"Les questions de cours qui sont tombées",pts:2,ou:"CC3 2026, questions de cours (1) à (5) ; janvier 2025, question de cours",lect:1.5,
  rappel:{min:4,q:`Écris de mémoire : la définition d'une isométrie ; la preuve que s([AB]) ⊂ [s(A)s(B)] ; le théorème 5.1.1 (ii) et sa preuve ; le théorème des milieux ; cos(π/3) et sin(π/4).`,
   r:`<ol><li>Une isométrie du plan est une application f : P → P bijective telle que f(A)f(B) = AB pour tous A, B ∈ P (définition 2.1.1).</li>
<li>Soit M ∈ [AB] : AM + MB = AB. Comme s préserve les distances, s(A)s(M) + s(M)s(B) = s(A)s(B), ce qui veut dire s(M) ∈ [s(A)s(B)].</li>
<li>C cercle de centre O et de rayon r, Δ une droite, M le projeté orthogonal de O sur Δ. Si OM = r, alors C ∩ Δ = {M}. Preuve : M ∈ Δ et OM = r, donc M ∈ C. Si X ∈ Δ et X ≠ M, le triangle OXM est rectangle en M, et Pythagore donne OX² = OM² + XM² &gt; OM², donc OX &gt; r : X ∉ C.</li>
<li>Soit ABC un triangle, M le milieu de [AB] et N celui de [AC] : (MN) et (BC) sont parallèles, et MN = BC/2 (théorème 2.5.3, Thalès si ABC n'est pas aplati).</li>
<li>cos(π/3) = 1/2 et sin(π/4) = √2/2.</li></ol>`},
  ess:`<ul><li>Une définition dit d'où part l'application, où elle arrive, et ce qu'elle vérifie : « bijective » et « préserve les distances » pour une isométrie.</li>
<li>Les preuves courtes du cours reposent sur une seule idée : l'égalité AM + MB = AB pour un segment, Pythagore dans OXM pour la tangente.</li>
<li>Angle entre deux sécantes (corollaire 5.2.8) : l'angle entre deux droites qui coupent un cercle est la moyenne des deux angles au centre, à π près.</li></ul>`,
  meth:`<ol><li>Commence par les hypothèses : « Soit M ∈ [AB] », « Soit X ∈ Δ, X ≠ M ».</li><li>Cite ce que tu utilises : la définition d'une isométrie, Pythagore, l'axiome.</li><li>Finis par la phrase de l'énoncé : « donc s(M) ∈ [s(A)s(B)] », « l'intersection est {M} ».</li></ol>`,
  piege:`Pour la tangente, il faut les deux moitiés : M est bien sur le cercle, <b>et</b> aucun autre point de Δ ne l'est.`},
 prend("iso",{pts:2,ou:"janvier 2024, ex. 1 ; seconde session 2024, ex. 2 ; CC2 2024, ex. 2",
  meth:C2.find(n=>n.id==="iso").meth+`<p>Janvier 2024, ex. 1 (a) : ABCD est un parallélogramme et AC = BD. Les triangles DAC et ADB ont le côté [AD] en commun, DC = AB (côtés opposés du parallélogramme) et AC = DB : ils sont isométriques (CCC). Donc ${ab("ADC")} = ${ab("DAB")}, deux angles qui font π ensemble : chacun vaut π/2.</p>`}),
 {id:"centre",t:"Angle inscrit et rotation : le CC3 de 2026",pts:2,ou:"CC3 2026, ex. 1 (6 points) et question de cours (4)",lect:2.5,exo:{g:"GE4",lv:1},
  ess:`<ul><li>Angle au centre (théorème 5.2.2) : un angle inscrit qui intercepte l'arc AB vaut la moitié de l'angle au centre ${an("AOB")}.</li>
<li>Points cocycliques (corollaire 5.2.7) : A, B, C, M sont sur un même cercle exactement quand ${an("ACB")} = ${an("AMB")} [π], en angles orientés de droites.</li>
<li>Un triangle rectangle est inscrit dans le cercle de diamètre son hypoténuse. L'ensemble des points M tels que MA = MB est la médiatrice de [AB].</li></ul>`,
  meth:`<p>CC3 2026, ex. 1 : C est l'image de B par la rotation de centre A et d'angle π/2.</p>
<ol><li>(1) AC = AB et ${ab("BAC")} = π/2 : ABC est rectangle isocèle en A, ses angles en B et C valent π/4, donc ${an("ACB")} = π/4.</li>
<li>(2) ${an("AMB")} = π/4 = ${an("ACB")} [π] : d'après 5.2.7, E<sub>1</sub> est le cercle qui passe par A, B et C, privé de A et B. ABC est rectangle en A : son centre est le milieu de [BC], son rayon AB√2/2.</li>
<li>(3) et (4) E<sub>2</sub> est la médiatrice de [AB]. Elle passe par le centre du cercle, donc elle le coupe en deux points.</li>
<li>(5) Ces deux points sont les extrémités d'un diamètre : leur distance vaut 2 × AB√2/2 = AB√2.</li></ol>`,
  piege:`Avec des angles orientés <b>de droites</b>, l'égalité est « à π près » : M peut être de chaque côté de (AB), le cercle entier compte.`},
 {id:"trig",t:"Les formules d'addition, et cos(π/5)",pts:2,ou:"janvier 2024, ex. 2 (6 questions) ; CC3 2026, question de cours (2)",lect:2,exo:{g:"GE5",lv:2},
  ess:`<ul><li>$cos(x + y) = cos x cos y − sin x sin y$ et $sin(x + y) = sin x cos y + cos x sin y$ (§4.4).</li>
<li>Angle double : $cos 2x = 2cos^{2}x − 1$ et $sin 2x = 2 sin x cos x$. Angle triple : $cos 3x = 4cos^{3}x − 3cos x$.</li>
<li>$cos(π − x) = −cos x$ et $sin(π − x) = sin x$.</li></ul>`,
  meth:`<p>Janvier 2024, ex. 2, avec θ = π/5.</p>
<ol><li>3θ = π − 2θ, donc cos 3θ = −cos 2θ.</li>
<li>$cos 3x = cos(2x + x) = cos 2x cos x − sin 2x sin x = (2cos^{2}x − 1)cos x − 2 sin^{2}x cos x$, et $sin^{2}x = 1 − cos^{2}x$ donne $4cos^{3}x − 3cos x$.</li>
<li>X = cos θ vérifie $4X^{3} − 3X = −(2X^{2} − 1)$, soit $4X^{3} + 2X^{2} − 3X − 1 = 0 = (X + 1)(4X^{2} − 2X − 1)$.</li>
<li>cos θ ≠ −1, donc $4X^{2} − 2X − 1 = 0$ : $X = (1 ± √5)/4$. cos(π/5) &gt; 0, donc $cos(π/5) = (1 + √5)/4$.</li></ol>`,
  piege:`$cos(x + y)$ n'est pas $cos x + cos y$. Dans la formule du cosinus, c'est un <b>moins</b> entre les deux produits.`},
 {id:"milieu",t:"Milieu, parallélogramme, produit scalaire avec les affixes",pts:2,ou:"seconde session 2024, ex. 3 ; CC3 2026, ex. 2 (4), (7) et (8)",lect:2,exo:{g:"GE9",lv:0},
  ess:`<ul><li>Milieu I de [BC] : $z_{I} = (z_{B} + z_{C})/2$.</li>
<li>ABCD est un parallélogramme exactement quand ${ve("AB")} = ${ve("DC")}, soit $z_{B} − z_{A} = z_{C} − z_{D}$.</li>
<li>Produit scalaire : si ${ve("u")} et ${ve("v")} ont pour affixes z et z′, $⟨u, v⟩ = Re(z̄ z′)$ = xx′ + yy′ (proposition 6.1.2). Deux vecteurs sont orthogonaux quand il vaut 0.</li></ul>`,
  meth:`<p>Seconde session 2024, ex. 3 : $z_{A} = 1 + i$, $z_{B} = 4 + 5i$, $z_{C} = 5 − 2i$.</p>
<ol><li>AB = |3 + 4i| = 5 et AC = |4 − 3i| = 5.</li>
<li>ABKC rectangle (c'est un parallélogramme) : $z_{K} = z_{B} + z_{C} − z_{A} = 8 + 2i$.</li>
<li>AGBC parallélogramme : $z_{G} = z_{A} + z_{B} − z_{C} = 8i$. Le milieu de [KG] a pour affixe (8 + 2i + 8i)/2 = 4 + 5i : c'est B.</li>
<li>CC3 2026, ex. 2 (7) : M est sur la hauteur issue de A exactement quand $⟨AM, BC⟩ = 0$, ce qui donne une équation de la droite.</li></ol>`,
  piege:`Dans ABKC, les sommets se suivent dans l'ordre des lettres : K est opposé à A, pas à B. On retranche l'affixe du sommet opposé.`},
 {id:"nature",t:"Reconnaître z ↦ az + b : translation, homothétie, rotation",pts:2,ou:"CC3 2026, question de cours (6) (1,5 point) ; seconde session 2024, ex. 4",lect:1.5,exo:{g:"GE9",lv:4},
  ess:`<ul><li>a = 1 : translation de vecteur d'affixe b (7.1.1).</li>
<li>a réel, a ≠ 1 : homothétie de rapport a (7.2.1). a = e<sup>iα</sup> de module 1, a ≠ 1 : rotation d'angle α (7.3.1).</li>
<li>Le centre est le point fixe : $az + b = z$ donne $z = b/(1 − a)$.</li></ul>`,
  meth:`<p>CC3 2026, question de cours (6).</p>
<ol><li>$f(z) = z + 1 − 2i$ : le coefficient de z vaut 1, f est la translation de vecteur d'affixe 1 − 2i.</li>
<li>$g(z) = 2z + 1 − 2i$ : homothétie de rapport 2, de centre d'affixe $(1 − 2i)/(1 − 2) = −1 + 2i$.</li></ol>`,
  piege:`Le terme constant b n'est pas le centre : c'est le vecteur pour une translation, mais pour une homothétie ou une rotation, le centre est b/(1 − a).`},
 {id:"compo",t:"Composer deux rotations",pts:1,ou:"janvier 2025, ex. 3 (c), (j) et (k)",lect:2,exo:{g:"GE9",lv:5},
  ess:`<ul><li>On écrit chaque rotation $e^{iα}z + w$, puis on remplace z par r<sub>1</sub>(z) dans r<sub>2</sub> : r<sub>2</sub> ∘ r<sub>1</sub>, c'est d'abord r<sub>1</sub>.</li>
<li>Les coefficients se multiplient, donc les angles s'ajoutent. Si la somme n'est pas 0 [2π], la composée est une rotation, de centre son point fixe.</li></ul>`,
  meth:`<p>Janvier 2025, ex. 3 : $z_{A} = 1$, $z_{B} = i$, r<sub>1</sub> de centre A et d'angle −π/2, r<sub>2</sub> de centre B et d'angle π/4.</p>
<ol><li>$r_{1}(z) = −i(z − 1) + 1 = −iz + 1 + i$ et $r_{2}(z) = e^{iπ/4}(z − i) + i$.</li>
<li>$R(z) = e^{iπ/4}(−iz + 1) + i = e^{−iπ/4}z + e^{iπ/4} + i$ : rotation d'angle −π/2 + π/4 = −π/4.</li>
<li>$R(z_{A}) = e^{iπ/4} × (1 − i) + i = √2 + i$. Le centre F est la solution de $R(z) = z$ (question (k)).</li></ol>`,
  piege:`r<sub>2</sub> ∘ r<sub>1</sub> se lit de droite à gauche : on applique r<sub>1</sub> en premier.`},
 {id:"alkashi",t:"Al-Kashi : un angle avec les trois côtés",pts:1,ou:"janvier 2024, ex. 3 (d) et (e)",lect:1.5,exo:{g:"GE1",lv:1},
  ess:`<ul><li>$BC^{2} = AB^{2} + AC^{2} − 2 AB · AC cos(Â)$ : l'angle est celui que forment les deux côtés du second membre (théorème 4.3.1).</li>
<li>Avec les trois côtés, on isole le cosinus, puis on reconnaît l'angle.</li></ul>`,
  meth:`<p>Janvier 2024, ex. 3 : AB = AF = 1 et $BF = (√5 − 1)/2$.</p>
<ol><li>$BF^{2} = 1 + 1 − 2cos(Â)$ dans le triangle ABF.</li>
<li>$BF^{2} = (6 − 2√5)/4$, donc $cos(Â) = 1 − BF^{2}/2 = (1 + √5)/4$.</li>
<li>C'est cos(π/5) (notion sur les formules d'addition) : ${ab("BAF")} = π/5$.</li></ol>`,
  piege:`Le « moins 2 AB · AC cos » : un cosinus négatif rend le troisième côté plus long que dans un triangle rectangle.`}],
 blanc:[
  {t:"Les définitions du cours",ou:"questions de cours (CC3 2026)",pts:3,g:"GC6",lv:0},
  {t:"Angle au centre, angle inscrit",ou:"exercice 1 (CC3 2026)",pts:4,g:"GE4",lv:3},
  {t:"Une rotation",ou:"exercice 1 (CC3 2026)",pts:3,g:"GE5",lv:3},
  {t:"Triangles isométriques",ou:"exercice 1 (janvier 2024)",pts:3,g:"GE7",lv:1},
  {t:"Al-Kashi et le cosinus d'un angle",ou:"exercice 3 (janvier 2024)",pts:4,g:"GE1",lv:2},
  {t:"Une distance avec les affixes",ou:"exercice 2 (1) (CC3 2026)",pts:3,g:"GE9",lv:1}]
};})();
