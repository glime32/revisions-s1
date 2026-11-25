/* Le CC1 d'Algèbre en 1 h (reporté, date à venir), le CC2 (jeudi 17/12, sur les CC2 de 2022 à 2024), puis l'examen de janvier en 2 h (sur les examens de janvier 2024 et 2026, sans les polynômes pas encore vus). CC1 : la liste de dix points annoncée par le prof le 11/11 (chapitres 1 à 4 du poly).
   Aucun barème connu : les points sont ceux des thèmes de matiere-lin.js (estimés d'après la longueur des exercices de la liste).
   Le sujet sera pris parmi ces exercices : les exemples des méthodes sont donc les exercices de la liste eux-mêmes.
   Tous les calculs sont refaits par tools/verif/express/lin.js. Les exercices sont tirés de gen-lin.js. */
(()=>{
const Z="0<sub>ℝⁿ</sub>",V=s=>`<span class="vec">${s}</span>`,M=A=>`<span class="mat" style="--n:${A[0].length}">${A.flat().map(x=>`<span>${String(x).replace("-","−")}</span>`).join("")}</span>`;
(window.EXPRESS=window.EXPRESS||{}).lin={cc1:{
 t:"Le CC1 d'Algèbre en 1 h",du:"du CC",au:"au CC",
 lead:"Le programme annoncé par le prof le 11/11 : le sujet sera fait d'exercices pris dans une liste de dix points (les 2 questions de cours, TD 1 ex. 1 et 7, TD 2 ex. 10, 12 et 13, TD 3 ex. 3, 4 et 5). Le CC1 a été reporté : si le prof change ce programme, ce parcours changera. Pour chaque notion : l'essentiel, la méthode sur l'exercice même de la liste, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20 (barème inconnu : les points sont estimés par moi).",
 carte:"la liste annoncée par le prof en 1 h, le pivot de Gauss d'abord, puis un sujet express noté sur 20.",
 blancLead:"Quatre questions, comme un CC pris dans la liste : la définition, un pivot de Gauss, une condition sur a, b, c, puis une combinaison linéaire. Fais-les sans revenir aux notions : la note qui sort est celle que tu aurais eue (barème estimé par moi).",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"pivot",t:"Résoudre un système par le pivot de Gauss",pts:4,ou:"TD 2, ex. 10 (dans la liste)",lect:2,exo:{g:"AL1",lv:3},
  ess:`<ul><li>On écrit la <b>matrice augmentée</b> : une ligne par équation, une colonne par inconnue, puis les seconds membres après le trait.</li>
<li>On <b>échelonne</b> : avec le pivot de la ligne 1, on fait des zéros en dessous (L₂ ← L₂ − 2L₁…), puis on recommence avec la ligne 2. Chaque opération s'écrit sur la copie.</li>
<li>On <b>lit</b> : une ligne (0 … 0 | b) avec b ≠ 0 se lit 0 = b, donc aucune solution : S = ∅. Sinon, les inconnues des colonnes qui ont un pivot sont <b>principales</b>, les autres sont <b>libres</b>.</li>
<li>On <b>remonte</b> de bas en haut. Aucune inconnue libre : une seule solution. Au moins une libre : une infinité, écrite avec les inconnues libres.</li></ul>`,
  piege:`Une ligne (0 … 0 | 0) se lit 0 = 0 : elle ne gêne pas. C'est 0 = b avec b ≠ 0 qui rend le système impossible. Et un pivot n'est jamais 0 : échange deux lignes avant.`,
  meth:`<p>TD 2, ex. 10, système 1 : x + 2y − z = 3, 2x + 5y + z = 4, 3x + 7y = 2.</p>
<ol><li>L₂ ← L₂ − 2L₁ et L₃ ← L₃ − 3L₁ : les lignes 2 et 3 deviennent (0 1 3 | −2) et (0 1 3 | −7).</li>
<li>L₃ ← L₃ − L₂ : la ligne 3 devient (0 0 0 | −5), c'est-à-dire 0 = −5. Le système est incompatible : S = ∅.</li></ol>
<p>Système 4 : x + y − 2z + 3t = 1, 2x + 3y + z − t = 4.</p>
<ol><li>L₂ ← L₂ − 2L₁ : la ligne 2 devient (0 1 5 −7 | 2). Pivots en colonnes 1 et 2 : x et y sont principales, z et t sont libres.</li>
<li>On remonte : y = 2 − 5z + 7t, puis x = 1 − y + 2z − 3t = −1 + 7z − 10t.</li>
<li>S = {(−1 + 7z − 10t, 2 − 5z + 7t, z, t) | z, t ∈ ℝ} : une infinité de solutions.</li></ol>`},
 {id:"param",t:"Seconds membres a, b, c et paramètre m",pts:4,ou:"TD 2, ex. 12 et 13 (dans la liste)",lect:2,exo:{g:"AL2",lv:2},
  ess:`<ul><li><b>Seconds membres a, b, c</b> : on fait le pivot avec a, b, c en lettres dans la dernière colonne. La dernière ligne devient (0 0 0 | une expression en a, b, c) : il y a des solutions si et seulement si elle vaut 0.</li>
<li><b>Paramètre m</b> : on ne divise jamais par une expression qui peut être nulle. On met en haut une ligne dont le pivot est un nombre, on échelonne, puis on factorise ce qui reste : 1 − m² = (1 − m)(1 + m).</li>
<li>On <b>discute</b> : le cas où ce coefficient n'est pas nul, puis chaque valeur de m qui l'annule.</li></ul>`,
  piege:`Avec m, la conclusion doit couvrir tous les réels : « si m ≠ 1 et m ≠ −1… ; si m = 1… ; si m = −1… ». Oublier un cas, c'est perdre une bonne partie des points.`,
  meth:`<p>TD 2, ex. 12 : x + 2y − 3z = a, 3x + 8y − 14z = b, 2x + 4z = c.</p>
<ol><li>L₂ ← L₂ − 3L₁ et L₃ ← L₃ − 2L₁ : (0 2 −5 | b − 3a) et (0 −4 10 | c − 2a).</li>
<li>L₃ ← L₃ + 2L₂ : (0 0 0 | −8a + 2b + c).</li>
<li>Le système a au moins une solution si et seulement si −8a + 2b + c = 0, c'est-à-dire c = 8a − 2b.</li></ol>
<p>TD 2, ex. 13 : mx + y = 1, x + my = m.</p>
<ol><li>m peut être nul : L₁ ↔ L₂, puis L₂ ← L₂ − mL₁. On obtient x + my = m et (1 − m²)y = 1 − m².</li>
<li>Si m ≠ 1 et m ≠ −1 : on divise par 1 − m², y = 1, puis x = m − m × 1 = 0. Une seule solution : S = {(0, 1)}.</li>
<li>Si m = 1 : il reste x + y = 1, S = {(1 − y, y) | y ∈ ℝ}. Si m = −1 : il reste x − y = −1, S = {(y − 1, y) | y ∈ ℝ}.</li></ol>`},
 {id:"cours",t:"Les 2 questions de cours : la définition et la proposition 37",pts:3,ou:"les 2 questions de cours de la liste",lect:1.5,
  rappel:{min:4,q:`Sur une feuille, sans regarder : écris la définition d'un sous-espace vectoriel de ℝⁿ, puis démontre la proposition 37 : si v₁, …, vₖ ∈ ℝⁿ, alors Vect(v₁, …, vₖ) est un sous-espace vectoriel de ℝⁿ.`,
   r:`<p>Soit F un sous-ensemble de ℝⁿ. F est un sous-espace vectoriel de ℝⁿ si : ${Z} ∈ F ; ∀x, y ∈ F, x + y ∈ F ; ∀x ∈ F, ∀λ ∈ ℝ, λx ∈ F.</p>
<p>Proposition 37. On vérifie les trois conditions. 1. ${Z} = 0v₁ + … + 0vₖ ∈ Vect(v₁, …, vₖ). 2. Soient x, y ∈ Vect(v₁, …, vₖ) : x = λ₁v₁ + … + λₖvₖ et y = μ₁v₁ + … + μₖvₖ, donc x + y = (λ₁ + μ₁)v₁ + … + (λₖ + μₖ)vₖ ∈ Vect(v₁, …, vₖ). 3. Soient x = λ₁v₁ + … + λₖvₖ et α ∈ ℝ : αx = (αλ₁)v₁ + … + (αλₖ)vₖ ∈ Vect(v₁, …, vₖ).</p>`},
  ess:`<p>La <b>définition 36</b> du poly. Soit F un sous-ensemble de ℝⁿ. On dit que F est un sous-espace vectoriel de ℝⁿ si :</p>
<ul><li>${Z} ∈ F ;</li><li>∀x, y ∈ F, x + y ∈ F ;</li><li>∀x ∈ F, ∀λ ∈ ℝ, λx ∈ F.</li></ul>
<p>La <b>proposition 37</b> : si v₁, …, vₖ ∈ ℝⁿ (k ≥ 1), alors Vect(v₁, …, vₖ) est un sous-espace vectoriel de ℝⁿ. Vect(v₁, …, vₖ) est l'ensemble des combinaisons linéaires λ₁v₁ + … + λₖvₖ. On la démontre en vérifiant les trois conditions de la définition.</p>`,
  piege:`Sans les « ∀ », la définition ne dit rien. Dans la démonstration, x et y ont chacun leurs coefficients (λᵢ pour x, μᵢ pour y). Et le poly écrit « λx » au point 3 : c'est une coquille, le nombre s'appelle α.`,
  meth:`<p>La démonstration de la proposition 37, à écrire telle quelle :</p>
<ol><li>${Z} = 0v₁ + … + 0vₖ : c'est une combinaison linéaire de v₁, …, vₖ, donc ${Z} ∈ Vect(v₁, …, vₖ).</li>
<li>Soient x, y ∈ Vect(v₁, …, vₖ). Il existe des réels λ₁, …, λₖ et μ₁, …, μₖ tels que x = λ₁v₁ + … + λₖvₖ et y = μ₁v₁ + … + μₖvₖ. Alors x + y = (λ₁ + μ₁)v₁ + … + (λₖ + μₖ)vₖ, donc x + y ∈ Vect(v₁, …, vₖ).</li>
<li>Soient x ∈ Vect(v₁, …, vₖ) et α ∈ ℝ, avec x = λ₁v₁ + … + λₖvₖ. Alors αx = (αλ₁)v₁ + … + (αλₖ)vₖ, donc αx ∈ Vect(v₁, …, vₖ).</li>
<li>Les trois conditions sont vraies : Vect(v₁, …, vₖ) est un sous-espace vectoriel de ℝⁿ.</li></ol>`},
 {id:"demo",t:"Les démonstrations courtes : λx = 0 et les propriétés de Vect",pts:3.5,ou:"TD 1, ex. 7 et TD 3, ex. 4 (dans la liste)",lect:1.5,
  rappel:{min:4,q:`Sur une feuille, sans regarder : démontre que λx = ${Z} si et seulement si x = ${Z} ou λ = 0 (TD 1, ex. 7). Puis, avec x, y ∈ Vect(u, v) et α, β ∈ ℝ, montre que αx + βy ∈ Vect(u, v) (TD 3, ex. 4).`,
   r:`<p>Avec x = (x₁, …, xₙ). Sens ⇐ : si λ = 0, λx = (0x₁, …, 0xₙ) = ${Z} ; si x = ${Z}, λx = (λ × 0, …, λ × 0) = ${Z}. Sens ⇒ : si λx = ${Z}, alors λxᵢ = 0 pour tout i. Si λ = 0, c'est fini. Sinon, on divise par λ : xᵢ = 0 pour tout i, donc x = ${Z}.</p>
<p>Il existe des réels a, b, c, d tels que x = au + bv et y = cu + dv. Alors αx + βy = (αa + βc)u + (αb + βd)v : c'est une combinaison linéaire de u et v, donc αx + βy ∈ Vect(u, v).</p>`},
  ess:`<ul><li><b>« Si et seulement si »</b> : deux sens à démontrer, ⇐ puis ⇒.</li>
<li><b>Être dans Vect(u, v)</b>, c'est s'écrire au + bv : on calcule, puis on regroupe devant u et devant v.</li>
<li><b>Une inclusion A ⊆ B</b> : on prend un élément quelconque de A et on montre qu'il est dans B. Une égalité, ce sont deux inclusions.</li></ul>`,
  piege:`On ne divise que par un nombre non nul : dans λx = ${Z}, on traite λ = 0 à part. Et chaque démonstration finit par sa conclusion écrite.`,
  meth:`<p>TD 1, ex. 7, avec x = (x₁, …, xₙ) :</p>
<ol><li>⇐ : si λ = 0, λx = (0x₁, …, 0xₙ) = ${Z}. Si x = ${Z}, λx = (λ × 0, …, λ × 0) = ${Z}.</li>
<li>⇒ : si λx = ${Z}, alors λxᵢ = 0 pour tout i. Si λ = 0, c'est fini. Sinon, on divise par λ : xᵢ = 0 pour tout i, donc x = ${Z}.</li></ol>
<p>TD 3, ex. 4 :</p>
<ol><li>${Z} = 0u + 0v + 0w et u = 1u + 0v + 0w (de même pour v et w) : tous sont dans Vect(u, v, w).</li>
<li>x = au + bv et y = cu + dv, donc αx + βy = (αa + βc)u + (αb + βd)v ∈ Vect(u, v).</li>
<li>Vect((2, −1, 3)) = {(2t, −t, 3t) | t ∈ ℝ}.</li>
<li>Un élément de Vect(λu) s'écrit μ(λu) = (μλ)u ∈ Vect(u) : Vect(λu) ⊆ Vect(u). Si λ ≠ 0, tu = (t/λ)(λu) donne l'autre inclusion. Si λ = 0, Vect(λu) = {${Z}}. Il y a égalité si et seulement si λ ≠ 0 ou u = ${Z}.</li></ol>`},
 {id:"cl",t:"Combinaison linéaire ou pas",pts:2,ou:"TD 3, ex. 3 (dans la liste)",lect:1.5,exo:{g:"AL4",lv:1},
  ess:`<ul><li>w est combinaison linéaire de u et v s'il existe des réels α, β tels que w = αu + βv.</li>
<li>Composante par composante, c'est un <b>système</b> dont les inconnues sont α et β. Sa matrice augmentée a <b>une colonne par vecteur</b>, et w après le trait.</li>
<li>Pivot de Gauss : si le système est compatible, la réponse est oui. Aucune inconnue libre : l'écriture est unique ; sinon, il y en a une infinité.</li></ul>`,
  piege:`Les vecteurs vont en colonnes, pas en lignes. Et finis par la vérification : remets tes coefficients dans αu + βv et retrouve w.`,
  meth:`<p>TD 3, ex. 3, question 1 : (−4, 5) est-il combinaison linéaire de (1, 2) et (2, 3) ?</p>
<ol><li>(−4, 5) = α(1, 2) + β(2, 3) donne α + 2β = −4 et 2α + 3β = 5.</li>
<li>L₂ ← L₂ − 2L₁ : −β = 13. Pas de ligne 0 = b avec b ≠ 0, et aucune inconnue libre.</li>
<li>β = −13, puis α = −4 − 2β = 22. Oui, et l'écriture est unique : (−4, 5) = 22(1, 2) − 13(2, 3). Vérification : 22 − 26 = −4 et 44 − 39 = 5.</li></ol>
<p>Question 3 : quatre vecteurs de ℝ³. Le pivot donne trois pivots, aucune ligne 0 = b avec b ≠ 0, et une inconnue libre : oui, avec une infinité d'écritures, une pour chaque valeur de l'inconnue libre.</p>`},
 {id:"vect",t:"Quels vecteurs enlever d'un Vect",pts:2,ou:"TD 3, ex. 5 (dans la liste)",lect:1.5,exo:{g:"AL3",lv:2},
  ess:`<ul><li>La <b>proposition 35</b> : Vect(v₁, …, vₖ, v) = Vect(v₁, …, vₖ) si et seulement si v ∈ Vect(v₁, …, vₖ).</li>
<li>Donc on peut enlever un vecteur sans changer le sous-espace engendré si et seulement s'il est <b>combinaison linéaire des autres</b>.</li>
<li>Pour chaque vecteur, on cherche s'il s'écrit avec les autres (un petit système). Avec deux vecteurs, on regarde s'ils sont colinéaires.</li></ul>`,
  piege:`On enlève un vecteur à la fois, puis on recommence avec ceux qui restent. Dans l'ex. 5, question 2, w = u + v : on peut enlever u, v ou w, mais un seul, car les deux qui restent ne sont pas colinéaires.`,
  meth:`<ol><li>Dans ℝ², u = (1, 2) et v = (−2, −4) : v = −2u. On peut enlever u ou v, un seul : Vect(u, v) = Vect(u) = Vect(v).</li>
<li>u = (1, 0, 1), v = (0, 1, 1), w = (1, 1, 2) : w = u + v. On peut enlever n'importe lequel des trois, mais un seul.</li>
<li>u = (1, 1, 0), v = (0, 1, 1), w = (1, 0, 1) : w = au + bv s'écrit (a, a + b, b) = (1, 0, 1), donc a = 1, b = 1 et a + b = 0 : impossible. Les deux autres essais échouent de la même façon : on ne peut enlever aucun vecteur.</li></ol>`},
 {id:"repere",t:"Changer de repère",pts:1.5,ou:"TD 1, ex. 1 (dans la liste)",lect:1.5,exo:{g:"AL6",lv:0},
  ess:`<ul><li>Le plan a déjà un repère (O ; ${V("i")}, ${V("j")}). (O ; ${V("u")}, ${V("v")}) est un autre <b>repère</b> quand ${V("u")} et ${V("v")} ne sont pas colinéaires : avec leurs coordonnées (a, b) et (c, d) dans (${V("i")}, ${V("j")}), ad − bc ≠ 0 (proposition 32).</li>
<li><b>Du nouveau repère vers l'ancien</b> : si M a pour coordonnées (x′, y′) dans le nouveau, on développe ${V("OM")} = x′${V("u")} + y′${V("v")} avec les coordonnées de ${V("u")} et ${V("v")}.</li>
<li><b>De l'ancien vers le nouveau</b> : on résout ce système en x′ et y′.</li></ul>`,
  piege:`Les coordonnées dans un repère sont uniques : c'est ce qui permet d'égaler les nombres devant ${V("i")} et devant ${V("j")}.`,
  meth:`<p>TD 1, ex. 1 : le repère (O ; ${V("i")} + ${V("j")}, ${V("i")} − ${V("j")}).</p>
<ol><li>Coordonnées (1, 1) et (1, −1) : 1 × (−1) − 1 × 1 = −2 ≠ 0, les vecteurs ne sont pas colinéaires : c'est un repère.</li>
<li>Du nouveau vers l'ancien : ${V("OM")} = x′(${V("i")} + ${V("j")}) + y′(${V("i")} − ${V("j")}) = (x′ + y′)${V("i")} + (x′ − y′)${V("j")}. Dans le premier repère, M a pour coordonnées (x′ + y′, x′ − y′).</li>
<li>De l'ancien vers le nouveau : x = x′ + y′ et y = x′ − y′. En additionnant, x′ = (x + y)/2 ; en soustrayant, y′ = (x − y)/2.</li></ol>`}],
 blanc:[
  {t:"Question de cours : la définition d'un sous-espace vectoriel",ou:"question de cours de la liste",pts:3,g:"AC1",lv:0},
  {t:"Résoudre un système par le pivot de Gauss",ou:"TD 2, ex. 10",pts:7,g:"AL1",lv:4},
  {t:"La condition sur a, b, c",ou:"TD 2, ex. 12",pts:6,g:"AL2",lv:1},
  {t:"Combinaison linéaire ou pas",ou:"TD 3, ex. 3",pts:4,g:"AL4",lv:0}]
},
cc2:{
 t:"Le CC2 d'Algèbre en 1 h",du:"du CC",au:"au CC",
 lead:"Le programme du CC2 n'est pas encore annoncé : ce parcours suit ce qui est tombé aux CC2 de 2022 à 2024, dans l'ordre de ce qui y a rapporté le plus (points estimés par moi, aucun barème connu). Pour chaque notion : l'essentiel, la méthode sur un exercice d'un ancien CC2, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20. Le CC2 peut aussi reprendre le programme du CC1 : son parcours en 1 h reste là.",
 carte:"les exercices des anciens CC2 en 1 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Quatre questions dans l'ordre des anciens CC2 : F = G ?, une matrice à inverser, linéaire ou pas, puis un noyau. Fais-les sans revenir aux notions : la note qui sort est celle que tu aurais eue (barème estimé par moi).",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"inverse",t:"Calculer A⁻¹ par la double matrice",pts:3.5,ou:"exercice 2 des CC2 2022 à 2024",lect:1.5,exo:{g:"AL8",lv:1},
  ess:`<ul><li>On écrit la <b>double matrice</b> (A | Iₙ) : A à gauche, la matrice identité à droite.</li>
<li>On fait le pivot de Gauss sur les lignes entières jusqu'à avoir Iₙ à gauche : des zéros sous les pivots, puis <b>au-dessus</b>, et des pivots égaux à 1.</li>
<li>À droite, on lit A⁻¹. Si une ligne de zéros apparaît à gauche, A n'est pas inversible.</li>
<li>On vérifie au moins une ligne de A × A⁻¹ = Iₙ.</li></ul>`,
  piege:`Chaque opération se fait sur toute la ligne, partie droite comprise. Et seulement des opérations sur les lignes, jamais sur les colonnes.`,
  meth:`<p>CC2 2024-2025, ex. 2 : A = ${M([[1,-3,0],[-2,5,0],[0,1,1]])}</p>
<ol><li>L₂ ← L₂ + 2L₁ : la ligne 2 devient (0 −1 0 | 2 1 0).</li>
<li>L₃ ← L₃ + L₂ : la ligne 3 devient (0 0 1 | 2 1 1).</li>
<li>L₂ ← −L₂ : (0 1 0 | −2 −1 0).</li>
<li>L₁ ← L₁ + 3L₂ : (1 0 0 | −5 −3 0).</li>
<li>A⁻¹ = ${M([[-5,-3,0],[-2,-1,0],[2,1,1]])}. Vérification, ligne 1 de A fois les colonnes de A⁻¹ : 1 × (−5) − 3 × (−2) = 1, 1 × (−3) − 3 × (−1) = 0, et 0.</li></ol>`},
 {id:"fg",t:"F = G ? Deux sous-espaces de ℝ⁴",pts:3.5,ou:"exercice 1 des CC2 2022 et 2023",lect:2.5,exo:{g:"AL14",lv:1},
  ess:`<ul><li><b>Une famille génératrice de F</b>, donné par des équations : on résout le système, on écrit les inconnues principales avec les libres, puis on donne la valeur 1 à une libre et 0 aux autres, pour chaque libre.</li>
<li><b>Des équations de G = Vect(u, v)</b> : on écrit (x, y, z, t) = au + bv et on fait le pivot avec x, y, z, t en lettres ; chaque ligne nulle à gauche donne une équation (comme au CC1).</li>
<li><b>F = G</b>, ce sont deux inclusions. G ⊂ F : u et v vérifient les équations de F. F ⊂ G : les vecteurs qui engendrent F vérifient les équations de G.</li>
<li>Un seul vecteur de G qui ne vérifie pas une équation de F suffit : F ≠ G.</li></ul>`,
  piege:`G ⊂ F ne suffit pas pour conclure F = G : il faut aussi F ⊂ G. Et on teste les vecteurs qui engendrent, pas des vecteurs pris au hasard.`,
  meth:`<p>CC2 2023-2024, ex. 1 : F = {(x, y, z, t) ∈ ℝ⁴ | x + y + z + 2t = 0, x + 2y − z + t = 0} et G = Vect((−3, 0, −1, 2), (0, 1, 1, −1)).</p>
<ol><li>F : L₂ ← L₂ − L₁ donne y − 2z − t = 0. Donc y = 2z + t, puis x = −y − z − 2t = −3z − 3t. F = Vect((−3, 2, 1, 0), (−3, 1, 0, 1)).</li>
<li>G : le pivot avec x, y, z, t en lettres laisse deux lignes nulles à gauche. G = {(x, y, z, t) | x + 3y − 3z = 0 et y − 2z − t = 0}.</li>
<li>G ⊂ F : pour (−3, 0, −1, 2), −3 + 0 − 1 + 4 = 0 et −3 + 0 + 1 + 2 = 0 ; pour (0, 1, 1, −1), 0 + 1 + 1 − 2 = 0 et 0 + 2 − 1 − 1 = 0.</li>
<li>F ⊂ G : pour (−3, 2, 1, 0), −3 + 6 − 3 = 0 et 2 − 2 − 0 = 0 ; pour (−3, 1, 0, 1), −3 + 3 − 0 = 0 et 1 − 0 − 1 = 0. Donc F = G.</li></ol>`},
 {id:"applin",t:"Application linéaire ou pas, et sa matrice",pts:3,ou:"CC2 2022 ex. 4, 2023 ex. 2, 2024 ex. 3",lect:1.5,exo:{g:"AL12",lv:1},
  ess:`<ul><li>f est <b>linéaire</b> quand chaque coordonnée de f(X) est une combinaison des variables : pas de constante, pas de produit xy, pas de carré.</li>
<li>Pour prouver « pas linéaire » : avec une constante, f(0) ≠ 0 ; avec un produit ou un carré, un contre-exemple f(2X) ≠ 2f(X), avec X = (1, 1, …).</li>
<li>La <b>matrice</b> de f : une ligne par coordonnée, les coefficients de x, y, z dans cet ordre, 0 pour une variable absente. Alors f(X) = AX.</li>
<li>La matrice de f ∘ g est Mat(f) × Mat(g).</li></ul>`,
  piege:`Avec un produit xy, on a quand même f(0) = 0 : ce test ne prouve rien. Il faut f(2X) ≠ 2f(X).`,
  meth:`<p>CC2 2023-2024, ex. 2 :</p>
<ol><li>f(x, y, z) = (2x + y − 3z, −x − 2y + 5z) est linéaire, de matrice ${M([[2,1,-3],[-1,-2,5]])}.</li>
<li>g(x, y) = (x − y, xy, −2x + 3y) : g(1, 1) = (0, 1, 1) et g(2, 2) = (0, 4, 2) ≠ 2g(1, 1) = (0, 2, 2). g n'est pas linéaire.</li>
<li>h(x, y, z) = (x − y + 3z, y − z, x, −3x + 2y − z + 1) : h(0, 0, 0) = (0, 0, 0, 1) ≠ 0. h n'est pas linéaire.</li></ol>`},
 {id:"kerim",t:"Noyau, image, injective, surjective",pts:2.5,ou:"CC2 2023 ex. 3, 2024 ex. 5",lect:1.5,exo:{g:"AL13",lv:0},
  ess:`<ul><li><b>ker f</b>, ce sont les X tels que f(X) = 0 : on résout AX = 0 et on l'écrit Vect(…).</li>
<li><b>im f</b>, ce sont les vecteurs atteints : pivot sur (A | a b c) ; chaque ligne nulle à gauche donne une équation entre a, b, c.</li>
<li>Un seul pivot sert pour les deux. f injective ⇔ ker f = {0}. f surjective ⇔ im f est tout l'espace d'arrivée.</li></ul>`,
  piege:`Le noyau vit au départ, l'image à l'arrivée. De ℝ³ dans ℝ⁴, f n'est jamais surjective.`,
  meth:`<p>CC2 2024-2025, ex. 5 : f(x, y, z) = (2x + y + z, y − z, x + y).</p>
<ol><li>(A | a b c), avec L₁ ↔ L₃ pour avoir un pivot 1 : (1 1 0 | c), (0 1 −1 | b), (2 1 1 | a).</li>
<li>L₃ ← L₃ − 2L₁ : (0 −1 1 | a − 2c). Puis L₃ ← L₃ + L₂ : (0 0 0 | a + b − 2c).</li>
<li>Noyau (a = b = c = 0) : z est libre, y = z et x = −y = −z. ker f = Vect((−1, 1, 1)) : f n'est pas injective.</li>
<li>Image : (a, b, c) ∈ im f ⇔ a + b − 2c = 0. Ce n'est pas tout ℝ³ : f n'est pas surjective.</li></ol>`},
 {id:"produit",t:"Le produit de matrices",pts:1.5,ou:"CC1 2024 ex. 5 et feuille 4",lect:1,exo:{g:"AL9",lv:2},
  ess:`<ul><li>AB existe quand A a autant de colonnes que B a de lignes : A de taille n × p et B de taille p × q donnent AB de taille n × q.</li>
<li>Le coefficient (i, j) de AB : la ligne i de A fois la colonne j de B, terme à terme, puis la somme.</li>
<li>En général, AB ≠ BA.</li></ul>`,
  piege:`AB = 0 n'oblige pas A = 0 ou B = 0, et AB = AC n'oblige pas B = C.`,
  meth:`<p>Feuille 4, ex. 3 : A = ${M([[1,-1],[3,1]])} et B = ${M([[2,1],[-1,1]])}.</p>
<ol><li>AB : ligne 1, 1 × 2 + (−1) × (−1) = 3 et 1 × 1 + (−1) × 1 = 0 ; ligne 2, 3 × 2 + 1 × (−1) = 5 et 3 × 1 + 1 × 1 = 4. AB = ${M([[3,0],[5,4]])}.</li>
<li>BA = ${M([[5,-1],[2,2]])}. AB ≠ BA : le produit n'est pas commutatif.</li></ol>`},
 {id:"relation",t:"Inverser grâce à une relation",pts:2.5,ou:"CC2 2022 ex. 3, 2023 ex. 5, CC1 2024 ex. 6",lect:1,exo:{g:"AL10",lv:1},
  ess:`<ul><li>On calcule A², puis A² − kA, et on reconnaît un multiple de I.</li>
<li>On factorise par A : par exemple A² − 3A = −2I donne A(A − 3I) = −2I, donc A × (−½)(A − 3I) = I.</li>
<li>Conclusion : A est inversible et A⁻¹ = −½(A − 3I) = ½(3I − A).</li></ul>`,
  piege:`On factorise avec I : A² − 3A = A(A − 3I), et « A − 3 » n'a pas de sens. On ne divise jamais par une matrice, seulement par un nombre non nul.`,
  meth:`<p>CC1 2024-2025, ex. 6 : A = ${M([[0,1,-1],[-1,2,-1],[1,-1,2]])}</p>
<ol><li>A² = ${M([[-2,3,-3],[-3,4,-3],[3,-3,4]])}, et A² − 3A = ${M([[-2,0,0],[0,-2,0],[0,0,-2]])} = −2I.</li>
<li>A(A − 3I) = −2I, donc A × ½(3I − A) = I.</li>
<li>A est inversible et A⁻¹ = ½(3I − A) = ½ ${M([[3,-1,1],[1,1,1],[-1,1,1]])}.</li></ol>`},
 {id:"libre",t:"Famille libre, famille liée, base",pts:2,ou:"exercice 6 des CC2 2022 et 2023",lect:1,exo:{g:"AL11",lv:1},
  ess:`<ul><li>(u, v, w) est <b>libre</b> si au + bv + cw = 0 oblige a = b = c = 0 ; sinon elle est <b>liée</b>.</li>
<li>On résout ce système homogène par le pivot, les vecteurs en colonnes : une colonne sans pivot, la famille est liée ; un pivot dans chaque colonne, elle est libre.</li>
<li>Dans ℝ³, trois vecteurs libres forment une <b>base</b> ; quatre vecteurs sont toujours liés.</li></ul>`,
  piege:`Aucun vecteur multiple d'un autre ne suffit pas : (u, v, u + v) est liée.`,
  meth:`<p>CC2 2023-2024, ex. 6 : ((1, −1, 0), (2, −1, 2), (1, 0, 1)).</p>
<ol><li>Les vecteurs en colonnes : ${M([[1,2,1],[-1,-1,0],[0,2,1]])}</li>
<li>L₂ ← L₂ + L₁ : (0 1 1). Puis L₃ ← L₃ − 2L₂ : (0 0 −1).</li>
<li>Un pivot dans chaque colonne : la seule solution est a = b = c = 0. La famille est libre : c'est une base de ℝ³.</li></ol>`},
 {id:"cours",t:"La question de cours : F ∩ G est un sous-espace",pts:1.5,ou:"CC2 2024 ex. 1",lect:1,
  rappel:{min:3,q:`Sur une feuille, sans regarder : écris la définition d'un sous-espace vectoriel de ℝⁿ. Puis, F et G étant deux sous-espaces vectoriels de ℝⁿ, montre que F ∩ G en est un.`,
   r:`<p>Soit F un sous-ensemble de ℝⁿ. F est un sous-espace vectoriel de ℝⁿ si : ${Z} ∈ F ; ∀x, y ∈ F, x + y ∈ F ; ∀x ∈ F, ∀λ ∈ ℝ, λx ∈ F.</p>
<p>1. ${Z} ∈ F et ${Z} ∈ G, donc ${Z} ∈ F ∩ G. 2. Soient x, y ∈ F ∩ G : x + y ∈ F car F est un sous-espace, et x + y ∈ G de même, donc x + y ∈ F ∩ G. 3. Soient x ∈ F ∩ G et λ ∈ ℝ : λx ∈ F et λx ∈ G, donc λx ∈ F ∩ G.</p>`},
  ess:`<ul><li>La définition 36 : ${Z} ∈ F ; ∀x, y ∈ F, x + y ∈ F ; ∀x ∈ F, ∀λ ∈ ℝ, λx ∈ F.</li>
<li>Pour F ∩ G, on vérifie les trois conditions en se servant de ce que F et G sont des sous-espaces.</li>
<li>F ∪ G n'est pas un sous-espace en général : deux droites distinctes du plan.</li></ul>`,
  piege:`Pour x + y ∈ F ∩ G, il faut le dire pour F et pour G.`,
  meth:`<ol><li>F et G sont des sous-espaces, donc ${Z} ∈ F et ${Z} ∈ G : ${Z} ∈ F ∩ G.</li>
<li>Soient x, y ∈ F ∩ G. Comme x, y ∈ F et que F est stable par addition, x + y ∈ F. De même, x + y ∈ G. Donc x + y ∈ F ∩ G.</li>
<li>Soient x ∈ F ∩ G et λ ∈ ℝ. λx ∈ F et λx ∈ G, donc λx ∈ F ∩ G.</li>
<li>Conclusion : F ∩ G est un sous-espace vectoriel de ℝⁿ.</li></ol>`}],
 blanc:[
  {t:"F = G ?",ou:"exercice 1",pts:5,g:"AL14",lv:1},
  {t:"Inverser une matrice par la double matrice",ou:"exercice 2",pts:6,g:"AL8",lv:1},
  {t:"Linéaire ou pas",ou:"exercice 3",pts:4,g:"AL12",lv:0},
  {t:"Le noyau d'une application linéaire",ou:"exercice 5",pts:5,g:"AL13",lv:0}]
},
ct:{
 t:"L'examen d'Algèbre en 2 h",du:"de l'examen",au:"à l'examen",duree:120,
 lead:"Tout le cours, d'après les examens de janvier 2024 et janvier 2026, dans l'ordre de ce qui y a rapporté le plus (points estimés par moi : aucun barème n'est connu). Les polynômes sont aussi au programme (deux exercices sur sept en janvier 2026), mais le prof ne les a pas encore faits cette année : ils seront ajoutés ici quand ils auront été vus en cours, et les 20 points ci-dessous ne comptent que l'algèbre linéaire. Les nombres complexes de janvier 2024 ne sont pas dans le programme de la fiche de l'UE. Pour chaque notion : l'essentiel, la méthode sur un exercice d'un ancien examen, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20. Documents et calculatrice sont interdits.",
 carte:"l'algèbre linéaire de l'examen en 2 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20 (les polynômes viendront après leur cours).",
 blancLead:"Sept questions de calcul, comme aux examens de janvier 2024 et 2026 : une relation, une famille liée, le noyau et l'image, un sous-espace, une projection, puis une inverse. Fais-les sans revenir aux notions. Les démonstrations de cours ne sont pas dans ce sujet : refais-les sur papier avec leurs notions. La note qui sort est une estimation (barème estimé par moi), sur l'algèbre linéaire seulement.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"kerim",t:"Noyau, image, injective, surjective",pts:4,ou:"examens de janvier 2024 et 2026, ex. 6",lect:2,exo:{g:"AL13",lv:2},
  ess:`<ul><li>Quand f est donnée par sa matrice A, on écrit d'abord f(x, y, z) : la ligne i de A donne la i-ème coordonnée.</li>
<li><b>ker f</b>, ce sont les X tels que AX = 0 : on résout ce système homogène et on l'écrit Vect(…).</li>
<li><b>im f</b> est le Vect des colonnes de A. Pour une équation, on fait le pivot sur (A | a b c) : chaque ligne nulle à gauche donne une équation entre a, b, c.</li>
<li>Un seul pivot sert pour les deux. f injective ⇔ ker f = {0}. f surjective ⇔ im f est tout l'espace d'arrivée.</li></ul>`,
  piege:`Pour dire « pas surjective », donne un vecteur qui ne vérifie pas l'équation de l'image, comme (1, 0, 0) ici. Et le noyau vit au départ, l'image à l'arrivée.`,
  meth:`<p>Janvier 2026, ex. 6 : f a pour matrice A = ${M([[-1,3,-3],[1,1,-1],[1,-1,1]])}</p>
<ol><li>f(x, y, z) = (−x + 3y − 3z, x + y − z, x − y + z).</li>
<li>(A | a b c) : L₂ ← L₂ + L₁ donne (0 4 −4 | a + b), et L₃ ← L₃ + L₁ donne (0 2 −2 | a + c).</li>
<li>L₃ ← 2L₃ − L₂ : (0 0 0 | a − b + 2c).</li>
<li>Noyau (a = b = c = 0) : 4y − 4z = 0, donc y = z, puis −x + 3y − 3z = 0 donne x = 0. ker f = Vect((0, 1, 1)) : f n'est pas injective.</li>
<li>Image : (a, b, c) ∈ im f ⇔ a − b + 2c = 0. (1, 0, 0) n'y est pas, car 1 ≠ 0 : f n'est pas surjective.</li></ol>`},
 {id:"cours",t:"Les démonstrations de cours sur les applications linéaires",pts:3,ou:"janvier 2026, ex. 1",lect:2,
  rappel:{min:6,q:`Sur une feuille, sans regarder : (1) la définition d'une application linéaire f : ℝⁿ → ℝᵖ ; (2) si f : ℝⁿ → ℝᵖ et g : ℝᵖ → ℝ<sup>q</sup> sont linéaires, montre que g ∘ f est linéaire ; (3) montre que ker f est un sous-espace vectoriel de ℝⁿ ; (4) montre que si ker f = {${Z}}, alors f est injective.`,
   r:`<ol><li>f est linéaire si, pour tous x, x′ ∈ ℝⁿ et tout λ ∈ ℝ : f(x + x′) = f(x) + f(x′) et f(λx) = λf(x).</li>
<li>g ∘ f(x + x′) = g(f(x) + f(x′)) (f linéaire) = g(f(x)) + g(f(x′)) (g linéaire) = g ∘ f(x) + g ∘ f(x′). De même, g ∘ f(λx) = g(λf(x)) = λg(f(x)) = λ g ∘ f(x).</li>
<li>${Z} ∈ ker f, car f(${Z}) = 0. Si x, x′ ∈ ker f : f(x + x′) = f(x) + f(x′) = 0 + 0 = 0. Si x ∈ ker f et λ ∈ ℝ : f(λx) = λf(x) = λ × 0 = 0.</li>
<li>Si f(x) = f(x′), alors f(x − x′) = f(x) − f(x′) = 0, donc x − x′ ∈ ker f = {${Z}}, et x = x′.</li></ol>`},
  ess:`<ul><li>f est linéaire : f(x + x′) = f(x) + f(x′) et f(λx) = λf(x), pour tous x, x′ et tout λ.</li>
<li>Une application linéaire envoie 0 sur 0 : f(${Z}) = f(0 · ${Z}) = 0 · f(${Z}) = 0<sub>ℝᵖ</sub>.</li>
<li>Chaque égalité d'une démonstration a sa raison : « f linéaire », « g linéaire », « définition de g ∘ f ».</li>
<li>Injective veut dire : f(x) = f(x′) ⇒ x = x′. On s'y ramène en montrant que x − x′ est dans ker f.</li></ul>`,
  piege:`Pour l'injectivité, on part de f(x) = f(x′) et on arrive à x = x′ : partir de f(x) = 0 redit seulement l'hypothèse. Et ker f est une partie de ℝⁿ, l'espace de départ, pas de ℝᵖ.`,
  meth:`<p>Janvier 2026, ex. 1 (corrigé officiel), avec f : ℝⁿ → ℝᵖ et g : ℝᵖ → ℝ<sup>q</sup> linéaires.</p>
<ol><li>g ∘ f est linéaire : g ∘ f(x + x′) = g(f(x + x′)) = g(f(x) + f(x′)) par linéarité de f, = g(f(x)) + g(f(x′)) par linéarité de g. Même chose pour g ∘ f(λx) = λ g ∘ f(x).</li>
<li>ker f = {x ∈ ℝⁿ | f(x) = 0} est un sous-espace : ${Z} ∈ ker f car f(${Z}) = 0 ; si x, x′ ∈ ker f, f(x + x′) = f(x) + f(x′) = 0, donc x + x′ ∈ ker f ; si x ∈ ker f et λ ∈ ℝ, f(λx) = λf(x) = 0, donc λx ∈ ker f.</li>
<li>Si ker f = {${Z}} : soient x, x′ avec f(x) = f(x′). Alors f(x − x′) = f(x) − f(x′) = 0, donc x − x′ ∈ ker f, x − x′ = ${Z} et x = x′. f est injective.</li></ol>`},
 {id:"abab",t:"AB = A + B : deux matrices inverses l'une de l'autre",pts:2.5,ou:"janvier 2024, ex. 5 et janvier 2026, ex. 4",lect:1,
  rappel:{min:4,q:`Janvier 2024, ex. 5 : A et B sont deux matrices carrées n × n telles que AB = A + B. (1) Montre que (A − Iₙ)(B − Iₙ) = Iₙ. (2) Qu'en déduis-tu sur A − Iₙ et B − Iₙ ? (3) Montre que A et B commutent.`,
   r:`<ol><li>(A − Iₙ)(B − Iₙ) = AB − A − B + Iₙ = (A + B) − A − B + Iₙ = Iₙ.</li>
<li>A − Iₙ et B − Iₙ sont inversibles, et inverses l'une de l'autre.</li>
<li>Donc (B − Iₙ)(A − Iₙ) = Iₙ aussi, c'est-à-dire BA − B − A + Iₙ = Iₙ : BA = A + B = AB.</li></ol>`},
  ess:`<ul><li>On développe en gardant l'ordre des facteurs : (A − I)(B − I) = AB − A − B + I, car AI = A et IB = B.</li>
<li>On remplace AB par A + B : il reste I.</li>
<li>Pour deux matrices carrées, MN = I suffit : M et N sont inversibles, inverses l'une de l'autre, et alors NM = I aussi.</li>
<li>On développe NM = I, et on y lit BA = A + B = AB.</li></ul>`,
  piege:`En développant, on n'échange jamais A et B : (I − A)(I − B) contient AB, pas BA. C'est en développant le produit dans l'autre sens qu'on obtient BA.`,
  meth:`<p>Janvier 2026, ex. 4 : A et B sont carrées, avec AB = A + B.</p>
<ol><li>(I − A)(I − B) = I − B − A + AB = I − B − A + (A + B) = I.</li>
<li>I − A et I − B sont donc inverses l'une de l'autre : (I − A)⁻¹ = I − B.</li>
<li>Alors (I − B)(I − A) = I aussi, soit I − A − B + BA = I : BA = A + B.</li>
<li>Comme AB = A + B, on a AB = BA.</li></ol>`},
 {id:"proj",t:"Projection et symétrie par rapport à un plan",pts:2.5,ou:"janvier 2026, ex. 7 ; CC2 2024-2025, ex. 4",lect:2.5,exo:{g:"AL15",lv:2},
  ess:`<ul><li>P a pour équation ax + by + cz = 0, et D = Vect(u) n'est pas dans P. Tout v s'écrit <b>v = w + λu</b>, avec w ∈ P.</li>
<li>On trouve λ en écrivant que w = v − λu vérifie l'équation de P : λ = (ax + by + cz)/(au₁ + bu₂ + cu₃).</li>
<li>La <b>projection</b> sur P parallèlement à D : p(v) = v − λu. La <b>symétrie</b> : s(v) = v − 2λu = 2p(v) − v, donc Mat(s) = 2Mat(p) − I₃.</li>
<li>Pour la projection <b>orthogonale</b>, on prend u = n = (a, b, c), le vecteur normal.</li>
<li>Pour reconnaître une projection donnée par sa matrice : f(X) = X sur P, f(X) = 0 sur D, et pour tout X, f(X) ∈ P et f(X) − X ∈ D.</li></ul>`,
  piege:`La symétrie traverse le plan : v − 2λu, pas v − λu (ça, c'est la projection). Et dans 2A − I₃, on enlève 1 seulement sur la diagonale.`,
  meth:`<p>Janvier 2026, ex. 7 (corrigé officiel) : f(x, y, z) = (2x − y + z, 3x − 2y + 3z, x − y + 2z), P : x − y + z = 0 et D = Vect((1, 3, 1)).</p>
<ol><li>f(X) = AX avec A = ${M([[2,-1,1],[3,-2,3],[1,-1,2]])} : f est linéaire.</li>
<li>f(X) = X : les trois équations deviennent x − y + z = 0, 3x − 3y + 3z = 0 et x − y + z = 0. Donc f(X) = X ⇔ X ∈ P.</li>
<li>f(X) = 0 : le pivot sur A donne x − z = 0 et y − 3z = 0, donc X = z(1, 3, 1). f(X) = 0 ⇔ X ∈ D.</li>
<li>Pour tout X : (2x − y + z) − (3x − 2y + 3z) + (x − y + 2z) = 0, donc f(X) ∈ P ; et f(X) − X = (x − y + z)(1, 3, 1) ∈ D. f est la projection sur P parallèlement à D.</li>
<li>La symétrie σ = 2f − Id a pour matrice 2A − I₃ = ${M([[3,-2,2],[6,-5,6],[2,-2,3]])}</li></ol>
<p>La projection orthogonale sur le même plan (CC2 2024-2025, ex. 4) : u = n = (1, −1, 1), donc λ = (x − y + z)/3, car 1² + (−1)² + 1² = 3. Alors p(v) = v − λn = ⅓(2x + y − z, x + 2y + z, −x + y + 2z), Mat(p) = ⅓ ${M([[2,1,-1],[1,2,1],[-1,1,2]])} et Mat(s) = 2Mat(p) − I₃ = ⅓ ${M([[1,2,-2],[2,1,2],[-2,2,1]])}</p>`},
 {id:"relation",t:"Inverser grâce à une relation",pts:2,ou:"janvier 2024, ex. 4 ; CC2 2022 à 2024",lect:1.5,exo:{g:"AL10",lv:2},
  ess:`<ul><li>On calcule A², puis A² − kA, et on reconnaît un multiple de I.</li>
<li>On factorise par A : par exemple A² − 3A = 4I donne A(A − 3I) = 4I, donc A × ¼(A − 3I) = I.</li>
<li>Conclusion : A est inversible et A⁻¹ = ¼(A − 3I).</li>
<li>Pour une grande matrice, on calcule A² par une règle : le coefficient (i, j) est la ligne i fois la colonne j.</li></ul>`,
  piege:`On factorise avec I : A² − 3A = A(A − 3I), et « A − 3 » n'a pas de sens. On ne divise jamais par une matrice, seulement par un nombre non nul.`,
  meth:`<p>Janvier 2024, ex. 4 : A = ${M([[0,1,1,1,1],[1,0,1,1,1],[1,1,0,1,1],[1,1,1,0,1],[1,1,1,1,0]])}</p>
<ol><li>A² : sur la diagonale, la ligne i fois la colonne i donne quatre fois 1 × 1, donc 4. Hors de la diagonale (i ≠ j), seuls les trois k différents de i et de j comptent, donc 3.</li>
<li>A² a des 4 sur la diagonale et des 3 ailleurs : A² = 3A + 4I₅.</li>
<li>A² − 3A = 4I₅, donc A(A − 3I₅) = 4I₅ et A × ¼(A − 3I₅) = I₅.</li>
<li>A est inversible et A⁻¹ = ¼(A − 3I₅) = ¼A − ¾I₅.</li></ol>`},
 {id:"vect",t:"Deux Vect égaux, un vecteur dans une intersection",pts:2,ou:"janvier 2024, ex. 3 ; CC2 2022 à 2024, ex. 1",lect:2,exo:{g:"AL14",lv:1},
  ess:`<ul><li>Vect(u₁, u₂, u₃) = Vect(a, b), ce sont deux inclusions : a et b sont des combinaisons de u₁, u₂, u₃, et chaque uᵢ est une combinaison de a et b.</li>
<li>w ∈ F ∩ G : w est une combinaison des vecteurs de F, et aussi une combinaison des vecteurs de G. On cherche les coefficients (pivot, ou à vue), puis on vérifie.</li>
<li>Quand F est donné par des équations, ce sont les vecteurs de G qui doivent les vérifier (la méthode du CC2).</li></ul>`,
  piege:`Une seule inclusion ne suffit pas. Et « on voit que » ne suffit pas non plus : écris chaque combinaison et vérifie-la coordonnée par coordonnée.`,
  meth:`<p>Janvier 2024, ex. 3 : u₁ = (0, 1, −2, 1), u₂ = (1, 0, 2, −1), u₃ = (3, 2, 2, −1), u₄ = (0, 0, 1, 0), a = (1, 1, 0, 0) et b = (−1, 1, −4, 2). Vrai ou faux ?</p>
<ol><li>Vect(u₁, u₂, u₃) = Vect(a, b) ? a = u₁ + u₂ et b = u₁ − u₂ : a et b sont dans Vect(u₁, u₂, u₃).</li>
<li>Dans l'autre sens : u₁ = ½(a + b), u₂ = ½(a − b), et u₃ = 2u₁ + 3u₂ = ½(5a − b). Vrai.</li>
<li>a ∈ Vect(u₁, u₂) ∩ Vect(u₂, u₃, u₄) ? D'abord a = u₁ + u₂. Puis αu₂ + βu₃ + γu₄ = (α + 3β, 2β, 2α + 2β + γ, −α − β) = (1, 1, 0, 0) donne β = ½, α = −½ et γ = 0.</li>
<li>a = −½u₂ + ½u₃ : a est dans les deux. Vrai.</li></ol>`},
 {id:"applin",t:"Écrire f avec sa matrice, et f − Id bijective",pts:1.5,ou:"janvier 2024, ex. 6 ; janvier 2026, ex. 6 et 7",lect:1.5,exo:{g:"AL12",lv:2},
  ess:`<ul><li>Avec la matrice A, la ligne i donne la i-ème coordonnée de f(x, y, z). Dans l'autre sens, f(X) = AX prouve que f est linéaire.</li>
<li>f est linéaire quand chaque coordonnée est une combinaison de x, y, z : pas de constante, pas de produit, pas de carré.</li>
<li>f − Id a pour matrice A − I₃ : on enlève 1 sur la diagonale.</li>
<li>Bijective : pour tout (a, b, c), le système (A − I₃)X = (a, b, c) a une seule solution.</li>
<li>La matrice de g ∘ f est Mat(g) × Mat(f), dans cet ordre.</li></ul>`,
  piege:`A − I₃ enlève 1 seulement sur la diagonale. Et pour « bijective », il faut une solution pour chaque (a, b, c), et une seule.`,
  meth:`<p>Janvier 2024, ex. 6 : f a pour matrice ${M([[1,-1,0],[-2,2,0],[0,0,2]])}</p>
<ol><li>f(x, y, z) = (x − y, −2x + 2y, 2z).</li>
<li>f − Id a pour matrice ${M([[0,-1,0],[-2,1,0],[0,0,1]])}, donc (f − Id)(x, y, z) = (−y, −2x + y, z).</li>
<li>(f − Id)(x, y, z) = (a, b, c) : y = −a, puis −2x + y = b donne x = (−a − b)/2, et z = c.</li>
<li>Une solution, et une seule, pour chaque (a, b, c) : f − Id est bijective.</li></ol>`},
 {id:"libre",t:"Familles libres et liées, et la démonstration de janvier 2026",pts:1.5,ou:"janvier 2026, ex. 5 ; CC2 2022 et 2023, ex. 6",lect:1.5,exo:{g:"AL11",lv:3},
  ess:`<ul><li>(u, v, w) est <b>libre</b> si au + bv + cw = 0 oblige a = b = c = 0 ; sinon elle est <b>liée</b>, et une solution non nulle donne une relation.</li>
<li>On résout par le pivot, les vecteurs en colonnes : une colonne sans pivot, la famille est liée ; un pivot dans chaque colonne, elle est libre.</li>
<li>Dans une démonstration, « liée » donne des coefficients pas tous nuls dont la combinaison est nulle ; « libre » dit que la seule combinaison nulle est celle où tout vaut 0.</li></ul>`,
  piege:`Liée veut dire « pas tous nuls », pas « tous non nuls ». Dans la démonstration, c'est le coefficient α de v qu'il faut montrer non nul, pour pouvoir diviser par α.`,
  meth:`<p>Janvier 2026, ex. 5 : (v₁, …, vₖ, v) est liée et (v₁, …, vₖ) est libre. Montrer que v ∈ Vect(v₁, …, vₖ).</p>
<ol><li>(v₁, …, vₖ, v) est liée : il existe λ₁, …, λₖ, α pas tous nuls avec λ₁v₁ + … + λₖvₖ + αv = 0.</li>
<li>Si α = 0, il reste λ₁v₁ + … + λₖvₖ = 0 avec des λᵢ pas tous nuls : impossible, car (v₁, …, vₖ) est libre.</li>
<li>Donc α ≠ 0, et on divise par α : v = (−λ₁/α)v₁ + … + (−λₖ/α)vₖ.</li>
<li>v est une combinaison des vᵢ : v ∈ Vect(v₁, …, vₖ).</li></ol>`}],
 blanc:[
  {t:"Inverser grâce à une relation",ou:"comme l'ex. 4 de janvier 2024",pts:3,g:"AL10",lv:1},
  {t:"Une famille liée : la relation",ou:"CC2, ex. 6",pts:3,g:"AL11",lv:2},
  {t:"Le noyau",ou:"comme l'ex. 6 des deux examens",pts:3,g:"AL13",lv:0},
  {t:"L'image",ou:"comme l'ex. 6 des deux examens",pts:4,g:"AL13",lv:1},
  {t:"Une famille génératrice d'un sous-espace",ou:"comme l'ex. 3 de janvier 2024",pts:3,g:"AL14",lv:0},
  {t:"Une projection et sa symétrie",ou:"comme l'ex. 7 de janvier 2026",pts:2,g:"AL15",lv:3},
  {t:"Inverser une matrice 3 × 3",ou:"CC2, ex. 2",pts:2,g:"AL8",lv:1}]
}};
const L=window.EXPRESS.lin;
L.ct.notions.push(Object.assign({},L.cc2.notions.find(n=>n.id==="inverse"),{pts:1,ou:"CC2 2022 à 2024, ex. 2 (pas tombé aux examens de 2024 et 2026)",exo:{g:"AL8",lv:2}}));
})();
