/* Le CC2 de Calculus en 1 h (vendredi 11/12, 13 h 15) : équations différentielles et nombres complexes, dans l'ordre du CC2
   du 28/11/2025 (ordre 1 par la variation de la constante, complexes jusqu'à cos(π/12), ordre 2 avec conditions initiales),
   avec le CC2 du 01/12/2023 (ordre 2 avec second membre) et le CC3 du 05/01/2026 (cos(7π/12) par un produit).
   Programme pas encore annoncé. Points estimés : seul le CC2 2023 a un barème. Temps de lecture comptés à 125 mots par minute.
   Les exemples sont refaits par tools/verif/express/calc.js. Les exercices sont tirés de gen-calc.js. */
(window.EXPRESS=window.EXPRESS||{}).calc={cc2:{
 t:"Le CC2 de Calculus en 1 h",du:"du CC",au:"au CC",
 lead:"Le programme du CC2 n'est pas encore annoncé (mail du 6/11). Le site suit le CC2 de 2025 : une équation d'ordre 1, les nombres complexes, une équation d'ordre 2. Les notions sont rangées dans l'ordre de ce qui rapporte le plus aux anciens sujets (CC2 2025 et 2023, CC3 2025). Les points sont estimés : seul le CC2 2023 avait un barème. Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20.",
 carte:"équations différentielles et complexes en 1 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Quatre questions dans l'ordre du CC2 de 2025 : l'équation sans second membre d'un ordre 1, la forme algébrique, le module et l'argument, puis une équation d'ordre 2. Fais-les sans revenir aux notions : la note qui sort est une estimation de la tienne.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"ed2",t:"Ordre 2 sans second membre, avec y(0) et y′(0)",pts:4,ou:"CC2 2025 ex. 3, CC2 2023 ex. 1",lect:2,exo:{g:"CA6",lv:3},
  ess:`<ul><li>Pour y″ + ay′ + by = 0, on cherche y = e<sup>rx</sup> : on trouve l'<b>équation caractéristique</b> r² + ar + b = 0.</li>
<li>Δ &gt; 0, deux racines r₁ et r₂ : y = C₁e<sup>r₁x</sup> + C₂e<sup>r₂x</sup>.</li>
<li>Δ = 0, une racine double r : y = (C₁ + C₂x)e<sup>rx</sup>.</li>
<li>Δ &lt; 0, deux racines α ± iβ : y = e<sup>αx</sup>(C₁cos(βx) + C₂sin(βx)).</li>
<li>y(0) et y′(0) donnent deux équations en C₁ et C₂.</li></ul>`,
  piege:`Calcule y′ <b>avant</b> de remplacer x par 0. Avec une racine double, (C₁ + C₂x)e<sup>rx</sup> est un produit : sa dérivée est C₂e<sup>rx</sup> + r(C₁ + C₂x)e<sup>rx</sup>.`,
  meth:`<p>Le CC2 2025 : y″ − 3y′ + 2y = 0, avec y(0) = 1 et y′(0) = 1.</p>
<ol><li>r² − 3r + 2 = 0. Δ = 9 − 8 = 1 : r₁ = 1 et r₂ = 2.</li>
<li>Toutes les solutions : y = C₁e<sup>x</sup> + C₂e<sup>2x</sup>.</li>
<li>y′ = C₁e<sup>x</sup> + 2C₂e<sup>2x</sup>. En x = 0 : C₁ + C₂ = 1 et C₁ + 2C₂ = 1.</li>
<li>On soustrait : C₂ = 0, puis C₁ = 1. La solution est y = e<sup>x</sup>.</li></ol>`},
 {id:"ed1",t:"Ordre 1 : la variation de la constante",pts:4,ou:"CC2 2025 ex. 1, CC3 2025 ex. 3",lect:2,exo:{g:"CA13",lv:4},
  ess:`<ol><li>y′ + a(x)y = b(x). Sans second membre : y = Ce<sup>−A(x)</sup>, où A est une primitive de a.</li>
<li>Une solution particulière : y = C(x)e<sup>−A(x)</sup>. En remplaçant, il reste C′(x)e<sup>−A(x)</sup> = b(x).</li>
<li>Toutes les solutions : y<sub>p</sub> plus Ce<sup>−A(x)</sup>. La condition initiale se met à la fin et donne C.</li></ol>`,
  piege:`Le signe : pour y′ + a(x)y, c'est e<sup>−A(x)</sup>. Pour y′ − 2ty, a(t) = −2t, donc A(t) = −t² et e<sup>−A(t)</sup> = e<sup>t²</sup>.`,
  meth:`<p>Le CC2 2025 : y′(t) − 2t y(t) = e<sup>t²</sup>, avec y(0) = 1.</p>
<ol><li>Sans second membre : y = Ce<sup>t²</sup>.</li>
<li>y = C(t)e<sup>t²</sup> : C′(t)e<sup>t²</sup> = e<sup>t²</sup>, donc C′(t) = 1 et C(t) = t. Une solution particulière : te<sup>t²</sup>.</li>
<li>Toutes les solutions : y = (t + C)e<sup>t²</sup>.</li>
<li>y(0) = C = 1. La solution : y = (t + 1)e<sup>t²</sup>.</li></ol>`},
 {id:"alg",t:"La forme algébrique : produit et quotient",pts:3,ou:"CC2 2025 ex. 2 a",lect:1.5,exo:{g:"CA1",lv:1},
  ess:`<ul><li>On calcule comme avec des réels, puis on remplace i² par −1.</li>
<li>Pour un <b>quotient</b>, on multiplie en haut et en bas par le <b>conjugué</b> du dénominateur : (c + id)(c − id) = c² + d², un réel.</li></ul>`,
  piege:`Le conjugué change seulement le signe de la partie imaginaire : celui de 2 − 3i est 2 + 3i.`,
  meth:`<p>Le CC2 2025 : z₁ = 1 + i et z₂ = 1 + i√3.</p>
<ol><li>z₁z₂ = 1 + i√3 + i + i²√3 = (1 − √3) + i(1 + √3).</li>
<li>z₂/z₁ = (1 + i√3)(1 − i) / ((1 + i)(1 − i)). En bas : 2. En haut : (1 + √3) + i(√3 − 1).</li>
<li>Donc z₂/z₁ = (1 + √3)/2 + i(√3 − 1)/2.</li></ol>`},
 {id:"module",t:"Module, argument, forme exponentielle",pts:3,ou:"CC2 2025 ex. 2 b à d, CC3 2025 ex. 4",lect:1.5,exo:{g:"CA2",lv:1},
  ess:`<ul><li>|a + ib| = √(a² + b²). Un argument θ : cos θ = a/|z| et sin θ = b/|z|. Alors z = |z|e<sup>iθ</sup>.</li>
<li>Produit : les modules se multiplient, les arguments s'ajoutent. Quotient : on divise les modules, on soustrait les arguments.</li></ul>`,
  piege:`Il faut cos θ <b>et</b> sin θ : −1 − i a pour argument −3π/4, pas π/4.`,
  meth:`<ol><li>|z₁| = √2, cos θ₁ = sin θ₁ = √2/2 : z₁ = √2e<sup>iπ/4</sup>.</li>
<li>|z₂| = 2, cos θ₂ = 1/2 et sin θ₂ = √3/2 : z₂ = 2e<sup>iπ/3</sup>.</li>
<li>z₂/z₁ : module 2/√2 = √2, argument π/3 − π/4 = π/12.</li></ol>`},
 {id:"pi12",t:"cos(π/12) : le même nombre écrit de deux façons",pts:2,ou:"CC2 2025 ex. 2 e, CC3 2025 ex. 4 d",lect:1,exo:{g:"CA3",lv:4},
  ess:`<p>On écrit <b>le même nombre</b> en forme exponentielle et en forme algébrique, puis on identifie les parties réelles et imaginaires.</p>`,
  piege:`Il y a un module devant : z₂/z₁ = √2(cos(π/12) + i sin(π/12)). Divise par √2.`,
  meth:`<ol><li>z₂/z₁ = √2e<sup>iπ/12</sup> = (1 + √3)/2 + i(√3 − 1)/2.</li>
<li>cos(π/12) = (1 + √3)/(2√2) = (√2 + √6)/4 et sin(π/12) = (√3 − 1)/(2√2) = (√6 − √2)/4.</li>
<li>Au CC3 2025, avec le produit z₁z₂ (argument 7π/12) : cos(7π/12) = (√2 − √6)/4.</li></ol>`},
 {id:"sm",t:"Ordre 2 avec un second membre",pts:2,ou:"CC2 2023 ex. 1, TD 2 ex. 4",lect:2,exo:{g:"CA7",lv:2},
  ess:`<ul><li>Toutes les solutions : y = y<sub>h</sub> + y<sub>p</sub> (sans second membre, plus <b>une</b> solution particulière).</li>
<li>y<sub>p</sub> a la forme du second membre : une constante pour une constante ; un polynôme de même degré pour un polynôme (si b ≠ 0) ; Be<sup>kx</sup> pour Ae<sup>kx</sup> ; c cos x + d sin x pour p cos x + q sin x.</li>
<li>On remplace dans l'équation et on identifie. Les conditions initiales viennent à la fin.</li></ul>`,
  piege:`Si k est racine de l'équation caractéristique, Be<sup>kx</sup> donne 0 : essaie Bxe<sup>kx</sup> (racine simple) ou Bx²e<sup>kx</sup> (racine double).`,
  meth:`<p>y″ − 3y′ + 2y = 6e<sup>−x</sup>.</p>
<ol><li>y<sub>h</sub> = C₁e<sup>x</sup> + C₂e<sup>2x</sup>.</li>
<li>−1 n'est pas racine : y<sub>p</sub> = Be<sup>−x</sup>, y<sub>p</sub>′ = −Be<sup>−x</sup>, y<sub>p</sub>″ = Be<sup>−x</sup>. Donc 6B = 6 et B = 1.</li>
<li>y = C₁e<sup>x</sup> + C₂e<sup>2x</sup> + e<sup>−x</sup>.</li></ol>
<p>Au CC2 2023, y″ + y′ − 2y = cos x − 3 sin x : y<sub>p</sub> = sin x.</p>`},
 {id:"cx",t:"Le reste des complexes : second degré, Euler, racines n-ièmes",pts:2,ou:"TD 3, ex. 8 à 12",lect:1.5,
  rappel:{min:3,q:`Résous z² − 2z + 5 = 0 dans ℂ. Linéarise sin²θ. Écris les solutions de zⁿ = ρe<sup>iφ</sup>.`,
   r:`<p>Δ = −16, δ = 4i : z = 1 + 2i ou z = 1 − 2i.</p><p>sin²θ = (1 − cos(2θ))/2.</p><p>z<sub>k</sub> = ρ<sup>1/n</sup>e<sup>i(φ + 2kπ)/n</sup>, pour k = 0, 1, …, n − 1 : n solutions.</p>`},
  ess:`<ul><li>Second degré à coefficients réels avec Δ &lt; 0 : δ = i√(−Δ), et z = (−b ± δ)/(2a). Avec des coefficients complexes, on cherche δ = x + iy tel que δ² = Δ.</li>
<li>Euler : cos u = (e<sup>iu</sup> + e<sup>−iu</sup>)/2 et sin u = (e<sup>iu</sup> − e<sup>−iu</sup>)/(2i), pour linéariser cos²θ, sin³θ…</li>
<li>zⁿ = ρe<sup>iφ</sup> : rⁿ = ρ et nθ = φ + 2kπ, soit n solutions.</li></ul>`,
  piege:`(2i)² = −4 : c'est ce qui donne le signe moins de sin²θ = (1 − cos 2θ)/2.`,
  meth:`<ol><li>z² − 2z + 5 = 0 : Δ = −16, δ = 4i, z = (2 ± 4i)/2 = 1 ± 2i.</li>
<li>sin²θ = (e<sup>2iθ</sup> − 2 + e<sup>−2iθ</sup>)/(−4) = (1 − cos(2θ))/2.</li>
<li>z³ = 8i = 8e<sup>iπ/2</sup> : r = 2 et θ = π/6 + 2kπ/3, d'où √3 + i, −√3 + i et −2i.</li></ol>`}],
 blanc:[
  {t:"Ordre 1 sans second membre",ou:"CC2 2025 ex. 1 a",pts:4,g:"CA13",lv:1},
  {t:"La forme algébrique",ou:"CC2 2025 ex. 2 a",pts:4,g:"CA1",lv:0},
  {t:"Module et argument d'un produit ou d'un quotient",ou:"CC2 2025 ex. 2 b à d",pts:5,g:"CA2",lv:2},
  {t:"Ordre 2 sans second membre",ou:"CC2 2025 ex. 3 a",pts:7,g:"CA6",lv:2}]
}};

/* Le CC final de Calculus en 2 h (CC intégral, 50 %, date supposée) : tout le cours, d'après le CC3 du 05/01/2026 (2 h :
   étude de fonction, changements de variable, intégrations par parties, ordre 1 avec condition initiale, cos(7π/12)), les CC1 de
   2025 et 2026 et les CC2. Points estimés. Les notions communes sont celles du CC2, reprises par prend(). */
(()=>{const C2=window.EXPRESS.calc.cc2.notions,prend=(id,o)=>Object.assign({},C2.find(n=>n.id===id),o);
window.EXPRESS.calc.ccf={
 t:"Le CC final de Calculus en 2 h",du:"du CC final",au:"au CC final",duree:120,
 lead:"Le CC final porte sur tout le cours. Sa date n'est pas encore fixée. Les notions sont rangées dans l'ordre de ce qui rapporte le plus au CC3 de l'an dernier (05/01/2026, 2 h), aux CC1 de 2025 et 2026 et aux CC2. Les points sont estimés : le CC3 n'avait pas de barème. Pour chacune : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express dans l'ordre du CC3, noté sur 20.",
 carte:"tout le cours en 2 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Cinq questions dans l'ordre du CC3 de l'an dernier : une étude de fonction, un changement de variable, une intégration par parties, une équation d'ordre 1 avec sa condition initiale, puis le module et l'argument d'un produit. Fais-les sans revenir aux notions : la note qui sort est une estimation de la tienne.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"ipp",t:"L'intégration par parties",pts:3,ou:"CC3 2025 ex. 2 d et e, CC1 2025 et 2026 ex. 2",lect:2,exo:{g:"CA11",lv:2},
  ess:`<ul><li>∫<sub>a</sub><sup>b</sup> u(x)v′(x) dx = [u(x)v(x)]<sub>a</sub><sup>b</sup> − ∫<sub>a</sub><sup>b</sup> u′(x)v(x) dx.</li>
<li>On <b>dérive</b> u pour le simplifier, on prend une <b>primitive</b> v de v′. Pour choisir u, l'ordre « LPET » : <b>L</b>ogarithme, puis <b>P</b>olynôme, puis <b>E</b>xponentielle, puis <b>T</b>rigo.</li>
<li>ln x tout seul : u = ln x et v′ = 1, donc v = x.</li></ul>`,
  piege:`C'est « crochet <b>moins</b> intégrale ». Avec v = −cos x, deux signes moins se suivent : mets des parenthèses.`,
  meth:`<p>Le CC3 2025, exercice 2 d et e.</p>
<ol><li>∫<sub>1</sub><sup>2</sup> x ln x dx : u = ln x, v′ = x, donc u′ = 1/x et v = x²/2.</li>
<li>= [(x²/2) ln x]<sub>1</sub><sup>2</sup> − ∫<sub>1</sub><sup>2</sup> x/2 dx = 2 ln 2 − [x²/4]<sub>1</sub><sup>2</sup> = 2 ln 2 − 3/4.</li>
<li>∫<sub>0</sub><sup>π/4</sup> x sin x dx : u = x, v′ = sin x, donc u′ = 1 et v = −cos x.</li>
<li>= [−x cos x]<sub>0</sub><sup>π/4</sup> + ∫<sub>0</sub><sup>π/4</sup> cos x dx = −π√2/8 + [sin x]<sub>0</sub><sup>π/4</sup> = √2/2 − π√2/8.</li></ol>`},
 {id:"etude",t:"Étudier une fonction : domaine, limites, dérivée, signe",pts:3,ou:"CC3 2025 ex. 1, CC1 2025 et 2026 ex. 1",lect:2.5,exo:{g:"CA9",lv:3},
  ess:`<ol><li><b>Domaine</b> : un dénominateur non nul, sous une racine ≥ 0, dans un ln &gt; 0.</li>
<li><b>Limites</b> aux bornes du domaine : en ±∞, le terme de plus haut degré ; en une valeur interdite, le signe du dénominateur (si le numérateur s'annule aussi, simplifie d'abord).</li>
<li><b>Dérivable</b> : f est faite de fonctions dérivables (somme, produit, quotient dont le dénominateur ne s'annule pas).</li>
<li><b>f′</b>, puis son <b>signe</b> sur une forme factorisée : f′ &gt; 0, f croît ; f′ &lt; 0, f décroît. On finit par le tableau de variations.</li></ol>`,
  piege:`Le signe de f′ se lit sur la forme <b>factorisée</b>. Ne développe pas le numérateur : un carré est toujours ≥ 0, sans calcul de Δ.`,
  meth:`<p>Le CC3 2025 : f(x) = (2 − x)/(x² − 4).</p>
<ol><li>Domaine : x² − 4 ≠ 0, donc D = ℝ \\ {−2 ; 2}.</li>
<li>En ±∞ : f(x) se comporte comme −x/x² = −1/x, qui tend vers 0. Les deux limites valent 0.</li>
<li>f est un quotient de polynômes, dérivable là où le dénominateur ne s'annule pas : sur D.</li>
<li>f′(x) = (−(x² − 4) − (2 − x) × 2x)/(x² − 4)² = (x² − 4x + 4)/(x² − 4)² = (x − 2)²/(x² − 4)².</li>
<li>Signe : un carré sur un carré, f′(x) &gt; 0 sur D. f est croissante sur chacun des trois intervalles.</li></ol>`},
 {id:"ed1",t:"Ordre 1 : la variation de la constante et la condition initiale",pts:3,ou:"CC3 2025 ex. 3, CC2 2025 ex. 1, CC1 2026 ex. 3",lect:2.5,exo:{g:"CA13",lv:4},
  ess:`<ol><li>y′ + a(x)y = b(x). Sans second membre : y = Ce<sup>−A(x)</sup>, où A est une primitive de a.</li>
<li>Une solution particulière : une évidente (une constante, un polynôme), ou la <b>variation de la constante</b> : y = C(x)e<sup>−A(x)</sup> donne C′(x) = b(x)e<sup>A(x)</sup>.</li>
<li>Toutes les solutions : y = y<sub>p</sub> + Ce<sup>−A(x)</sup>.</li>
<li>La condition y(x₀) = y₀ se met à la fin et donne C.</li></ol>`,
  piege:`Le signe : pour y′ + a(x)y, c'est e<sup>−A(x)</sup>. Si l'équation s'écrit y′ − a(x)y, alors c'est e<sup>+A(x)</sup>.`,
  meth:`<p>Le CC3 2025 : y′ − (cos x/(2 + sin x))y = cos x, avec y(0) = 0.</p>
<ol><li>Une primitive de cos x/(2 + sin x) est ln(2 + sin x) (de la forme u′/u, et 2 + sin x &gt; 0). Sans second membre : y = Ce<sup>ln(2 + sin x)</sup> = C(2 + sin x).</li>
<li>Variation de la constante : y = C(x)(2 + sin x). En remplaçant, C′(x)(2 + sin x) = cos x, donc C′(x) = cos x/(2 + sin x) et C(x) = ln(2 + sin x).</li>
<li>Toutes les solutions : y = (C + ln(2 + sin x))(2 + sin x).</li>
<li>y(0) = 0 : (C + ln 2) × 2 = 0, donc C = −ln 2. La solution : y = (2 + sin x) ln((2 + sin x)/2).</li></ol>`},
 {id:"chgt",t:"Le changement de variable",pts:2.5,ou:"CC3 2025 ex. 2 a à c et ex. 3 d, CC1 2026 ex. 2 b",lect:2,exo:{g:"CA12",lv:2},
  ess:`<ul><li>On pose u = φ(x). Trois choses changent : la fonction, le dx (du = φ′(x) dx) et les bornes (φ(a) et φ(b)).</li>
<li>Pour trouver u : cherche une fonction dont la <b>dérivée est là aussi</b>, en facteur. 4x à côté de 2x² + 1, cos x à côté de sin x.</li></ul>`,
  piege:`Change les bornes en même temps que la variable. Avec u, on finit avec les bornes en u, sans revenir à x.`,
  meth:`<p>Le CC3 2025, exercice 2.</p>
<ol><li>∫<sub>0</sub><sup>1</sup> dx/(5x + 1)² : u = 5x + 1, du = 5 dx, les bornes deviennent 1 et 6. = (1/5)∫<sub>1</sub><sup>6</sup> du/u² = (1/5)[−1/u]<sub>1</sub><sup>6</sup> = (1/5)(1 − 1/6) = 1/6.</li>
<li>∫<sub>0</sub><sup>2</sup> 4x/(2x² + 1) dx : u = 2x² + 1, du = 4x dx, les bornes deviennent 1 et 9. = ∫<sub>1</sub><sup>9</sup> du/u = ln 9.</li>
<li>∫<sub>0</sub><sup>π/3</sup> cos x (sin x)² dx : u = sin x, du = cos x dx, les bornes deviennent 0 et √3/2. = [u³/3]<sub>0</sub><sup>√3/2</sup> = √3/8.</li></ol>`},
 {id:"pi12",t:"Module, argument, et cos(7π/12) par un produit",pts:2.5,ou:"CC3 2025 ex. 4, CC2 2025 ex. 2",lect:2,exo:{g:"CA3",lv:4},
  ess:`<ul><li>|a + ib| = √(a² + b²) ; un argument θ : cos θ = a/|z| et sin θ = b/|z|.</li>
<li>Produit : les modules se multiplient, les arguments s'ajoutent. Quotient : on divise les modules, on soustrait les arguments.</li>
<li>Pour cos(7π/12) : on écrit le même nombre en forme exponentielle et en forme algébrique, puis on identifie.</li></ul>`,
  piege:`La forme exponentielle a un module devant : uv = 2√2(cos(7π/12) + i sin(7π/12)). Il faut diviser par 2√2.`,
  meth:`<p>Le CC3 2025 : u = 1 + i et v = 1 + i√3.</p>
<ol><li>|u| = √2 et un argument de u est π/4. |v| = 2 et un argument de v est π/3.</li>
<li>z = uv : module 2√2, argument π/4 + π/3 = 7π/12.</li>
<li>En forme algébrique : z = 1 + i√3 + i + i²√3 = (1 − √3) + i(1 + √3).</li>
<li>On identifie : cos(7π/12) = (1 − √3)/(2√2) = (√2 − √6)/4 et sin(7π/12) = (1 + √3)/(2√2) = (√2 + √6)/4.</li></ol>`},
 prend("ed2",{pts:2,lect:2,ou:"CC2 2025 ex. 3, CC2 2023 ex. 1"}),
 {id:"prim",t:"Primitives : reconnaître la forme",pts:1.5,ou:"CC1 2025 ex. 3, CC3 2025 ex. 3 d",lect:1.5,exo:{g:"CA10",lv:3},
  ess:`<ul><li>u′uⁿ a pour primitive u<sup>n+1</sup>/(n + 1) (n ≠ −1).</li>
<li>u′/u a pour primitive ln|u|.</li>
<li>u′e<sup>u</sup> a pour primitive e<sup>u</sup> ; u′cos u a pour primitive sin u ; u′sin u a pour primitive −cos u.</li></ul>`,
  piege:`Il manque souvent un nombre devant : x e<sup>x²</sup> = (1/2) × 2x e<sup>x²</sup>, donc sa primitive est e<sup>x²</sup>/2. Vérifie toujours en dérivant.`,
  meth:`<ol><li>f(x) = −8x e<sup>x²</sup> : avec u = x², u′ = 2x, f = −4u′e<sup>u</sup>. Donc F(x) = −4e<sup>x²</sup>.</li>
<li>g(x) = 6x/(x² + 1) : g = 3u′/u avec u = x² + 1 &gt; 0. Donc G(x) = 3 ln(x² + 1).</li>
<li>Vérification en dérivant : F′(x) = −4 × 2x e<sup>x²</sup> = −8x e<sup>x²</sup>.</li></ol>`},
 {id:"lim",t:"Calculer une limite",pts:1,ou:"CC3 2025 ex. 1 b, CC1 2025 et 2026 ex. 1 b",lect:1.5,exo:{g:"CA14",lv:5},
  ess:`<ul><li>En ±∞, un quotient de polynômes se comporte comme le quotient des termes de plus haut degré.</li>
<li>Une forme « 0/0 » : on factorise et on simplifie, ou on reconnaît un taux d'accroissement : (e<sup>kx</sup> − 1)/x → k, sin(x)/x → 1, ln(1 + x)/x → 1 en 0.</li>
<li>Croissances comparées : l'exponentielle l'emporte sur les puissances, qui l'emportent sur ln.</li></ul>`,
  piege:`« 0/0 » n'est ni 0 ni 1 : c'est une forme indéterminée. Il faut transformer l'écriture avant de conclure.`,
  meth:`<ol><li>(e<sup>4x</sup> − 1)/(2x) en 0 : = 2 × (e<sup>4x</sup> − 1)/(4x), et (e<sup>X</sup> − 1)/X → 1 quand X = 4x → 0. La limite vaut 2.</li>
<li>(2 − x)/(x² − 4) en 2 : « 0/0 ». On factorise : (2 − x)/((x − 2)(x + 2)) = −1/(x + 2), qui tend vers −1/4. La limite est finie.</li></ol>`},
 prend("sm",{pts:1,lect:1.5}),
 prend("cx",{pts:0.5,lect:1.5})],
 blanc:[
  {t:"Étude complète d'une fonction",ou:"CC3 2025 ex. 1",pts:5,g:"CA9",lv:4},
  {t:"Un changement de variable",ou:"CC3 2025 ex. 2 a à c",pts:3,g:"CA12",lv:1},
  {t:"Une intégration par parties",ou:"CC3 2025 ex. 2 d et e",pts:4,g:"CA11",lv:3},
  {t:"Ordre 1 avec une condition initiale",ou:"CC3 2025 ex. 3",pts:4,g:"CA13",lv:5},
  {t:"Module et argument d'un produit",ou:"CC3 2025 ex. 4 a à c",pts:4,g:"CA2",lv:2}]
};})();
