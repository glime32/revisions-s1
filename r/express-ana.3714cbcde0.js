/* Le CC1 d'Analyse en 1 h (lundi 23/11, 15 h) : le programme des feuilles de TD 1 à 3, dans l'ordre de ce qui rapporte le plus
   aux CC1 de 2024 et 2025 (même forme les deux années : cours 2 points, exercice 1 sur 4, exercice 2 sur 6, partie 2 : vrai/faux 4 et tableau 4).
   Les points des notions font 20 : ce que le CC donne à qui sait faire ce type d'exercice. Les exercices sont tirés de gen-ana.js. */
(window.EXPRESS=window.EXPRESS||{}).ana={cc1:{
 t:"Le CC1 d'Analyse en 1 h",du:"du CC",au:"au CC",
 lead:"Tout le programme du CC1 (feuilles de TD 1 à 3), dans l'ordre de ce qui a rapporté le plus aux CC1 de 2024 et 2025. Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20.",
 carte:"tout le programme en 1 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Cinq questions dans l'ordre du CC1 : la question de cours, l'exercice 1, l'exercice 2, puis les deux questions de la partie 2. Fais-les sans revenir aux notions : la note qui sort est une estimation de celle que tu aurais eue.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"tableau",t:"Le tableau inf, min, max, sup",pts:4,ou:"partie 2, tous les ans",lect:2,exo:{g:"AN1",lv:4},
  ess:`<ul><li>Un <b>majorant</b> M de A : $∀a ∈ A, a ≤ M$. Le <b>max</b> est un majorant qui est <b>dans</b> A.</li>
<li>La <b>borne sup</b> est le plus petit des majorants. Elle existe dès que A est non vide et majoré, mais elle n'est pas forcément dans A : $sup [0 ; 1[ = 1$, et [0 ; 1[ n'a pas de max.</li>
<li>Pareil par en dessous : minorant, min, inf.</li>
<li>A est un <b>intervalle</b> s'il n'a pas de trou : si a et b sont dans A, tout ce qui est entre a et b aussi.</li>
<li>Les outils : $|x − a| ≤ r ⇔ a − r ≤ x ≤ a + r$ ; $|x − a| &gt; r ⇔ x &lt; a − r$ ou $x &gt; a + r$ ; la partie entière E(x) est l'entier tel que $E(x) ≤ x &lt; E(x) + 1$.</li></ul>`,
  piege:`Un ensemble non majoré n'a pas de sup : dans le tableau, on écrit « non », jamais « +∞ ». Et une réponse fausse peut enlever des points : ne remplis pas au hasard.`,
  meth:`<ol><li>Écris A simplement : résous l'inéquation ($|x − 6| ≤ 5 ⇔ 1 ≤ x ≤ 11$, donc A = [1 ; 11]), ou calcule les premiers termes de la suite.</li>
<li><b>Intervalle ?</b> Oui s'il n'y a pas de trou. Une réunion séparée comme [0 ; 1] ∪ [2 ; 3] n'en est pas un.</li>
<li>Pour chaque bord : l'<b>inf</b> (ou le sup) existe si A est minoré (ou majoré) ; c'est un <b>min</b> (ou un max) seulement si ce nombre est dans A (crochet fermé, ou terme atteint).</li>
<li>Les termes $1 − 1/n$ (n ≥ 1) montent vers 1 sans l'atteindre : sup = 1, pas de max ; le premier terme, 0, est le min.</li></ol>`},
 {id:"lim-suite",t:"Limite d'une suite avec ε",pts:2,ou:"exercice 1 (CC1 2024)",lect:2,exo:{g:"AN2",lv:2},
  ess:`<p>$uₙ → ℓ ⇔ ∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − ℓ| ≤ ε$</p>
<p>En clair : quelle que soit la précision ε, à partir d'un rang N, tous les termes sont à moins de ε de ℓ. N dépend de ε : plus ε est petit, plus N est grand.</p>
<p>Vers +∞ : $∀A ∈ ℝ, ∃N ∈ ℕ, ∀n ≥ N, uₙ ≥ A$.</p>`,
  piege:`N doit être un entier : d'où le « E(…) + 1 ». Et on majore |uₙ − ℓ| ; le minorer ne prouve rien.`,
  meth:`<p>L'exercice 1 du CC1 2024 : montrer que $n·sin(n)/(n² + 2) → 0$.</p>
<ol><li><b>Brouillon</b> : majore $|uₙ − ℓ|$ par quelque chose de simple. Ici, comme $|sin(n)| ≤ 1$, pour n ≥ 1 : $|uₙ| ≤ n/(n² + 2) ≤ n/n² = 1/n$.</li>
<li>« Soit ε &gt; 0. Posons $N = E(1/ε) + 1$. » Alors N est un entier, N ≥ 1 et $N &gt; 1/ε$.</li>
<li>« Pour tout n ≥ N : $|uₙ − 0| ≤ 1/n ≤ 1/N &lt; ε$. »</li>
<li>Conclus en recopiant la définition : « donc $∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − 0| ≤ ε$, c'est-à-dire $uₙ → 0$. »</li></ol>`},
 {id:"lim-fonction",t:"Limite d'une fonction avec ε",pts:2,ou:"exercice 1 (CC1 2025)",lect:1.5,exo:{g:"AN3",lv:1},
  ess:`<p>f est définie sur un intervalle I.</p><p>En +∞ : $lim_{x→+∞} f(x) = ℓ ⇔ ∀ε &gt; 0, ∃α &gt; 0, ∀x ∈ I, x &gt; α ⇒ |f(x) − ℓ| &lt; ε$</p>
<p>En un point x₀ : $∀ε &gt; 0, ∃η &gt; 0, ∀x ∈ I, |x − x₀| &lt; η ⇒ |f(x) − ℓ| &lt; ε$</p>
<p>Même idée que pour les suites : α (ou η) joue le rôle de N, et il dépend de ε.</p>`,
  piege:`L'ordre : ε d'abord, puis α ou η, qui dépend de ε ; les échanger donne une autre phrase (piège du vrai/faux 2024). Et f(n) → ℓ sur les entiers ne prouve pas f(x) → ℓ : sin(πn) = 0 pour tout entier n, mais sin(πx) n'a pas de limite en +∞.`,
  meth:`<p>L'exercice 1 du CC1 2025 : $f(x) = (2x + 1)/x$ tend vers 2 en +∞.</p>
<ol><li>Simplifie $f(x) − ℓ$ : $(2x + 1)/x − 2 = 1/x$.</li>
<li>Pour $x &gt; 0$ : $|f(x) − 2| = 1/x$. On veut $1/x &lt; ε$, c'est-à-dire $x &gt; 1/ε$.</li>
<li>« Soit ε &gt; 0. Posons $α = 1/ε$, donc α &gt; 0. Pour tout $x &gt; α$ : $|f(x) − 2| = 1/x &lt; 1/α = ε$. »</li>
<li>Conclus avec la définition : $lim_{x→+∞} f(x) = 2$.</li></ol>`},
 {id:"calcul",t:"Calculer une limite",pts:2,ou:"vrai/faux et exercice 2",lect:1.5,exo:{g:"AN4",lv:4},
  ess:`<ul><li><b>Quotient de polynômes</b> : factorise par le plus haut degré. $(3n² + 1)/(2n² − n) → 3/2$, car on peut l'écrire $(3 + 1/n²)/(2 − 1/n)$.</li>
<li><b>Racines</b> : la quantité conjuguée. $√(n + 1) − √n = 1/(√(n + 1) + √n) → 0$.</li>
<li><b>Puissances</b> : $qⁿ → 0$ si $|q| &lt; 1$, $qⁿ → +∞$ si $q &gt; 1$. Factorise par la plus grande : $(2ⁿ + 3ⁿ)/3ⁿ = (2/3)ⁿ + 1 → 1$.</li>
<li><b>Terme borné</b> : $−1 ≤ cos(n) ≤ 1$ donne $−1/n ≤ cos(n)/n ≤ 1/n$, puis les gendarmes : $cos(n)/n → 0$.</li>
<li><b>Pas de limite</b> : deux suites extraites aux limites différentes. $(−1)ⁿ$ vaut 1 aux rangs pairs et −1 aux rangs impairs : pas de limite.</li></ul>`,
  piege:`« ∞/∞ » ou « 0 × ∞ » ne sont pas des résultats : factorise d'abord. Et « tend vers +∞ » ne veut pas dire « converge » : converger, c'est avoir une limite finie.`,
  meth:`<ol><li>Repère la forme : quotient, racines, puissances, terme borné (sin, cos, (−1)ⁿ).</li>
<li>Applique la règle de cette forme, sans sauter d'étape : factorise, ou multiplie par la quantité conjuguée, ou encadre.</li>
<li>Conclus par les opérations sur les limites (ou les gendarmes), en écrivant la limite de chaque morceau.</li></ol>`},
 {id:"recurrente",t:"Suite récurrente",pts:3,ou:"exercice 2 (CC1 2024)",lect:2,exo:{g:"AN6",lv:2},
  ess:`<p>Une suite $uₙ₊₁ = f(uₙ)$ se traite toujours dans le même ordre (le plan de l'exercice 2 du CC1 2024) :</p>
<ol><li>les premiers termes ;</li><li>un encadrement $a ≤ uₙ ≤ b$, par récurrence ;</li><li>le sens de variation : le signe de $uₙ₊₁ − uₙ$ ;</li><li>croissante et majorée (ou décroissante et minorée) : elle converge ;</li><li>la limite ℓ vérifie $ℓ = f(ℓ)$, et l'encadrement choisit la bonne solution.</li></ol>
<p>Cas du premier degré, $uₙ₊₁ = auₙ + b$ (a ≠ 1) : $ℓ = aℓ + b$ donne $ℓ = b/(1 − a)$. Si a &lt; 0, la suite oscille autour de ℓ : ni croissante ni décroissante (sauf si u₀ = ℓ, elle est alors constante).</p>`,
  piege:`Le théorème dit que la limite existe, pas ce qu'elle vaut. Et on n'écrit ℓ = f(ℓ) qu'une fois la convergence prouvée.`,
  meth:`<p>Rédige chaque récurrence en trois temps : <b>initialisation</b> (P(0) est vraie), <b>hérédité</b> (si P(n) est vraie, alors P(n + 1) l'est), <b>conclusion</b> (P(n) est vraie pour tout n).</p>
<p>Exemple du sujet blanc B : $u₀ = 5$, $uₙ₊₁ = √(2uₙ + 3)$. Une fois la convergence prouvée, $ℓ = √(2ℓ + 3)$ donne $ℓ² − 2ℓ − 3 = 0$, soit $(ℓ − 3)(ℓ + 1) = 0$ : ℓ = 3 ou ℓ = −1. Or uₙ ≥ 0 pour tout n, donc ℓ ≥ 0 et ℓ = 3.</p>`},
 {id:"adjacentes",t:"Suites adjacentes",pts:3,ou:"exercice 2 (CC1 2025)",lect:1.5,exo:{g:"AN5",lv:1},
  ess:`<p>Si (uₙ) est <b>croissante</b>, (vₙ) <b>décroissante</b>, $uₙ ≤ vₙ$ pour tout n, et $vₙ − uₙ → 0$, alors (uₙ) et (vₙ) convergent vers <b>la même limite</b> ℓ, et $uₙ ≤ ℓ ≤ vₙ$ pour tout n. On dit qu'elles sont adjacentes.</p>`,
  piege:`Les quatre conditions sont nécessaires : cite-les toutes. Avec seulement « l'écart tend vers 0 », rien ne converge forcément : uₙ = n et vₙ = n + 1/n tendent toutes les deux vers +∞.`,
  meth:`<ol><li>$uₙ₊₁ − uₙ ≥ 0$ : (uₙ) est croissante.</li><li>$vₙ₊₁ − vₙ ≤ 0$ : (vₙ) est décroissante.</li><li>Calcule $vₙ − uₙ$ : il est positif et tend vers 0.</li><li>Cite le théorème avec ses quatre conditions.</li>
<li>Pour la valeur de ℓ, cherche ce qui ne bouge pas. Au CC1 2025, $uₙ₊₁ + vₙ₊₁ = uₙ + vₙ$, donc $uₙ + vₙ = u₀ + v₀ = 4$ ; à la limite, 2ℓ = 4, donc ℓ = 2.</li></ol>`},
 {id:"quantif",t:"Quantificateurs et négation",pts:2,ou:"partie 2, vrai/faux",lect:1.5,exo:{g:"AN7",lv:2},
  ess:`<ul><li>∀ : « pour tout » ; ∃ : « il existe ». L'<b>ordre</b> compte : dans « ∀x, ∃y », y peut dépendre de x. $∀x ∈ ℝ, ∃y ∈ ℝ, x + y = 0$ est vraie ; $∃y ∈ ℝ, ∀x ∈ ℝ, x + y = 0$ est fausse.</li>
<li><b>Nier</b> : on échange ∀ et ∃, on garde les domaines, et on nie la fin. La négation de a &lt; b est a ≥ b ; celle de « P ⇒ Q » est « P et non Q ».</li>
<li>La négation de $∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − ℓ| ≤ ε$ est $∃ε &gt; 0, ∀N ∈ ℕ, ∃n ≥ N, |uₙ − ℓ| &gt; ε$.</li></ul>`,
  piege:`« ε &gt; 0 » ne se nie pas : la négation commence par « ∃ε &gt; 0 », pas par « ∃ε ≤ 0 ».`,
  meth:`<p>Au vrai/faux :</p><ol><li>Lis la phrase en français.</li><li>Une phrase en ∀ : un seul contre-exemple la rend fausse. Essaie 0, 1, −1, 1/2, $(−1)ⁿ$, $1/n$.</li><li>Une phrase en ∃ : un seul exemple la rend vraie.</li><li>Pas sûr ? Laisse vide : une réponse fausse peut enlever des points.</li></ol>`},
 {id:"cours",t:"La question de cours : borne sup, point adhérent",pts:2,ou:"question de cours, tous les ans",lect:1.5,
  rappel:{min:2,q:`Écris la caractérisation de la borne supérieure d'une partie A de ℝ non vide et majorée, puis la définition de « x est adhérent à A ».`,
   r:`<p>m = sup(A) ⇔ m majore A et $∀ε &gt; 0, ∃a ∈ A, m − ε &lt; a$.</p><p>x est adhérent à A ⇔ $∀ε &gt; 0, ∃a ∈ A, |x − a| &lt; ε$ (ou : une suite d'éléments de A converge vers x).</p>`},
  ess:`<p><b>Caractérisation de la borne sup</b> (CC1 2025). Pour A une partie non vide et majorée de ℝ :</p><p>m = sup(A) ⇔ m majore A et $∀ε &gt; 0, ∃a ∈ A, m − ε &lt; a$.</p>
<p><b>Point adhérent</b> (CC1 2024) : x est adhérent à A ⇔ $∀ε &gt; 0, ∃a ∈ A, |x − a| &lt; ε$ ⇔ une suite d'éléments de A converge vers x.</p>`,
  piege:`On demande la caractérisation (avec ε), pas la définition « le plus petit des majorants » : le CC1 2025 la demandait.`,
  meth:`<p>La partie b) : montrer que 1 = sup [0 ; 1[ (ou que 1 est adhérent à [0 ; 1[).</p>
<ol><li>1 majore [0 ; 1[ : tout x de [0 ; 1[ vérifie x &lt; 1.</li><li>Soit ε &gt; 0. La suite $aₙ = 1 − 1/n$ (n ≥ 1) est dans [0 ; 1[ ; pour $n &gt; 1/ε$, $aₙ &gt; 1 − ε$.</li><li>Donc 1 = sup [0 ; 1[. La même suite tend vers 1 : 1 est adhérent à [0 ; 1[.</li></ol>`}],
 blanc:[
  {t:"Question de cours : caractériser la borne sup",ou:"connaissance du cours",pts:2,g:"AQ1",lv:0},
  {t:"Limite d'une suite : trouver un rang N",ou:"exercice 1",pts:4,g:"AN2",lv:1},
  {t:"Le sens de variation de deux suites",ou:"exercice 2",pts:6,g:"AN5",lv:0},
  {t:"Nier une phrase à quantificateurs",ou:"partie 2, question 1",pts:4,g:"AN7",lv:1},
  {t:"Le tableau inf, min, max, sup",ou:"partie 2, question 2",pts:4,g:"AN1",lv:1}]
},
/* Le CC2 d'Analyse en 1 h (mercredi 16/12 à 15 h, confirmé par Prose le 24/11). Programme supposé : le chapitre 4 n'est pas encore sur Moodle et le programme
   du CC2 n'est pas annoncé ; d'après le programme du cours (chap1-reels.pdf), viennent après les limites la continuité puis la dérivabilité.
   Aucun ancien CC2 : ordre du cours, points estimés. Exercices de gen-ana.js (AN9 à AN14, AQ3), et CA8 du Calculus pour les dérivées. */
cc2:{
 t:"Le CC2 d'Analyse en 1 h",du:"du CC",au:"au CC",
 lead:"Programme supposé : le chapitre 4 n'est pas encore sur Moodle et le programme du CC2 n'est pas annoncé. D'après le programme du cours, après les limites viennent la continuité puis la dérivabilité : ce parcours couvre ces deux chapitres, avec les exercices classiques de L1, et il sera revu dès que le cours sera en ligne. Pour chaque notion : l'essentiel, la méthode, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20.",
 carte:"continuité et dérivabilité en 1 h (programme supposé), puis un sujet express noté sur 20.",
 blancLead:"Quatre questions comme un CC de 1 h : la question de cours, puis trois exercices, dont une rédaction complète sur papier. Il n'y a pas d'ancien CC2 sur Moodle : la forme est supposée, sur le modèle du CC1. Fais-les sans revenir aux notions : la note qui sort est celle que tu aurais eue.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"prolong",t:"Continuité en un point, prolongement",pts:3,ou:"chapitre « Continuité »",lect:2,exo:{g:"AN9",lv:0},
  ess:`<p>Soit f définie sur un intervalle I, et x₀ un point de I. f est <b>continue en x₀</b> si $lim_{x→x₀} f(x) = f(x₀)$. Avec ε : $∀ε &gt; 0, ∃η &gt; 0, ∀x ∈ I, |x − x₀| &lt; η ⇒ |f(x) − f(x₀)| &lt; ε$.</p>
<p>Les polynômes, les quotients (là où le bas ne s'annule pas), √, sin et cos sont continus là où ils sont définis. Les sommes, produits, quotients et composées de fonctions continues aussi.</p>
<p>Si f n'est pas définie en x₀ mais a une <b>limite finie ℓ</b> en x₀, on la <b>prolonge par continuité</b> en posant f(x₀) = ℓ.</p>`,
  piege:`« 0/0 » n'est pas une réponse : il faut simplifier d'abord. Et si la limite est infinie, ou différente à gauche et à droite, il n'y a pas de prolongement.`,
  meth:`<p>Exemple : $f(x) = (x² − 5x + 6)/(x − 2)$, en 2.</p>
<ol><li>Remplace x par 2 en haut : $4 − 10 + 6 = 0$. Haut et bas tendent vers 0 : il faut lever la forme 0/0. (Si le haut ne s'annulait pas, la limite serait infinie : pas de prolongement.)</li>
<li>Factorise : $x² − 5x + 6 = (x − 2)(x − 3)$.</li>
<li>Pour x ≠ 2 : $f(x) = x − 3$, qui tend vers −1.</li>
<li>Conclus : f se prolonge par continuité en posant f(2) = −1.</li></ol>
<p>Avec une racine, multiplie par la quantité conjuguée : $(√(x + 4) − 2)/x = 1/(√(x + 4) + 2) → 1/4$. Avec sin, utilise $lim_{u→0} sin(u)/u = 1$ : $sin(3x)/x = 3 × sin(3x)/(3x) → 3$.</p>`},
 {id:"raccord",t:"Fonction définie par morceaux : le raccord",pts:2,ou:"chapitre « Continuité »",lect:1.5,exo:{g:"AN9",lv:1},
  ess:`<p>f est donnée par une formule pour x ≤ x₀ et une autre pour x &gt; x₀. Chaque morceau est continu de son côté : tout se joue en x₀.</p>
<p>f est continue en x₀ si et seulement si <b>la limite à gauche, la limite à droite et f(x₀) sont égales</b>.</p>`,
  piege:`f(x₀) se calcule avec le morceau qui contient x₀ : celui où il y a « ≤ ».`,
  meth:`<p>Exemple : $f(x) = x² + 1$ si x ≤ 1, et $f(x) = ax + 3$ si x &gt; 1.</p>
<ol><li>À gauche, et en 1 : $f(1) = 1² + 1 = 2$.</li><li>À droite : $ax + 3$ tend vers $a + 3$.</li><li>Continue en 1 si et seulement si $a + 3 = 2$, donc $a = −1$.</li></ol>`},
 {id:"tvi",t:"Le théorème des valeurs intermédiaires",pts:3,ou:"chapitre « Continuité »",lect:2,exo:{g:"AN10",lv:0},
  ess:`<p><b>TVI</b> : si f est continue sur un intervalle [a ; b], alors pour tout y compris entre f(a) et f(b), il existe c ∈ [a ; b] tel que f(c) = y.</p>
<p>En pratique : f continue sur [a ; b], f(a) et f(b) de signes contraires, donc f s'annule entre a et b.</p>
<p>Si en plus f est <b>strictement monotone</b>, elle ne prend chaque valeur qu'une fois : la solution est <b>unique</b> (théorème de la bijection).</p>`,
  piege:`Le TVI dit qu'une solution existe, pas qu'elle est seule : pour l'unicité, il faut la stricte monotonie. Et sans continuité sur tout l'intervalle, c'est faux : 1/x n'est pas définie en 0, donc pas continue sur [−1 ; 1], et elle passe de −1 à 1 sans jamais s'annuler.`,
  meth:`<p>Exemple : $x³ + x − 1 = 0$. On pose $f(x) = x³ + x − 1$.</p>
<ol><li>f est continue sur ℝ (polynôme).</li><li>$f(0) = −1 &lt; 0$ et $f(1) = 1 &gt; 0$ : d'après le TVI, il existe α ∈ ]0 ; 1[ tel que f(α) = 0.</li>
<li>x ↦ x³ et x ↦ x − 1 sont strictement croissantes, donc f aussi : α est la seule solution.</li>
<li>Pour la situer mieux (dichotomie) : $f(1/2) = 1/8 + 1/2 − 1 = −3/8 &lt; 0$, donc α ∈ ]1/2 ; 1[.</li></ol>`},
 {id:"image",t:"Image d'un segment : minimum et maximum",pts:2,ou:"chapitre « Continuité »",lect:1.5,exo:{g:"AN11",lv:0},
  ess:`<p>Une fonction continue sur un segment [a ; b] est <b>bornée et atteint ses bornes</b> : $f([a ; b]) = [m ; M]$, où m est son minimum et M son maximum.</p>
<p>Le minimum et le maximum sont atteints aux bords du segment, ou là où f′ s'annule.</p>`,
  piege:`Ne prends pas seulement les bords : pour $x² − 2x$ sur [−1 ; 2], f(−1) = 3 et f(2) = 0 donneraient [0 ; 3], ce qui est faux.`,
  meth:`<p>Exemple : $f(x) = x² − 2x$ sur [−1 ; 2].</p>
<ol><li>$f′(x) = 2x − 2$ s'annule en 1, qui est dans le segment.</li><li>$f(−1) = 3$, $f(1) = −1$, $f(2) = 0$.</li><li>Le plus petit et le plus grand : $f([−1 ; 2]) = [−1 ; 3]$.</li></ol>`},
 {id:"derpoint",t:"Dérivable en un point : le taux d'accroissement",pts:3,ou:"chapitre « Dérivabilité »",lect:2,exo:{g:"AN12",lv:0},
  ess:`<p>f est <b>dérivable en x₀</b> si le taux d'accroissement $(f(x) − f(x₀))/(x − x₀)$ a une <b>limite finie</b> quand x tend vers x₀. Cette limite est f′(x₀), la pente de la tangente : $y = f′(x₀)(x − x₀) + f(x₀)$.</p>
<p>Dérivable en x₀ ⇒ continue en x₀. La réciproque est fausse : |x| est continue en 0, pas dérivable.</p>
<p>Pour une fonction par morceaux ou une valeur absolue : calcule la limite du taux à gauche et à droite. Dérivable si et seulement si elles sont finies et égales.</p>`,
  piege:`Pour une fonction par morceaux, vérifie d'abord le raccord : si f n'est pas continue en x₀, elle n'est pas dérivable, même si les dérivées des deux morceaux sont égales.`,
  meth:`<ol><li>$f(x) = |x|$ en 0. Pour x &lt; 0 : $(|x| − 0)/x = −x/x = −1$. Pour x &gt; 0 : $x/x = 1$. Les limites −1 et 1 sont différentes : pas dérivable en 0.</li>
<li>$f(x) = x|x|$ en 0 : $(x|x| − 0)/x = |x|$, qui tend vers 0 des deux côtés : dérivable, et f′(0) = 0.</li>
<li>Par morceaux, avec deux polynômes qui se raccordent : la limite du taux de chaque côté est la dérivée de ce morceau, prise en x₀.</li></ol>`},
 {id:"derivees",t:"Calculer une dérivée",pts:2,ou:"dans presque tous les exercices",lect:1.5,exo:{g:"CA8",lv:3},
  ess:`<ul><li>$(uv)′ = u′v + uv′$ ; $(u/v)′ = (u′v − uv′)/v²$.</li>
<li>$(uⁿ)′ = n u′ uⁿ⁻¹$ ; $(√u)′ = u′/(2√u)$ ; $(eᵘ)′ = u′eᵘ$ ; $(ln u)′ = u′/u$.</li>
<li>Une composée : on dérive l'extérieur, puis on multiplie par la dérivée de l'intérieur.</li></ul>
<p>L'exercice vient des générateurs du Calculus : ce sont les mêmes formules.</p>`,
  piege:`Le plus fréquent : oublier la dérivée de l'intérieur ($(√(x² + 1))′$ n'est pas $1/(2√(x² + 1))$), ou inverser l'ordre du quotient.`,
  meth:`<ol><li>$f(x) = (2x + 1)/(x − 3)$ : $u′v − uv′ = 2(x − 3) − (2x + 1) = −7$, donc $f′(x) = −7/(x − 3)²$.</li>
<li>$f(x) = √(x² + 1)$ : $f′(x) = 2x/(2√(x² + 1)) = x/√(x² + 1)$.</li></ol>`},
 {id:"taf",t:"Rolle et accroissements finis",pts:3,ou:"chapitre « Dérivabilité »",lect:2,exo:{g:"AN14",lv:0},
  ess:`<p><b>Rolle</b> : f continue sur [a ; b], dérivable sur ]a ; b[ et f(a) = f(b) ⇒ il existe c ∈ ]a ; b[ tel que f′(c) = 0.</p>
<p><b>Accroissements finis</b> : f continue sur [a ; b] et dérivable sur ]a ; b[ ⇒ il existe c ∈ ]a ; b[ tel que $f(b) − f(a) = f′(c)(b − a)$.</p>
<p><b>Inégalité</b> : si $|f′| ≤ M$ sur un intervalle I, alors $|f(x) − f(y)| ≤ M|x − y|$ pour tous x, y de I. Et si f′ ≥ 0 sur un intervalle, f est croissante sur cet intervalle.</p>`,
  piege:`c est strictement entre a et b, et le théorème dit qu'il existe, pas qu'il est seul. Sans les hypothèses, c'est faux : |x| sur [−1 ; 1] vérifie f(−1) = f(1), mais n'est pas dérivable en 0, et sa dérivée ne s'annule jamais.`,
  meth:`<ol><li>$f(x) = x³$ sur [0 ; 3] : la pente est $(27 − 0)/3 = 9$. $f′(c) = 3c² = 9$ donne $c = √3$ ou $c = −√3$. Seul √3 est dans ]0 ; 3[.</li>
<li>Inégalité : $|sin x − sin y| ≤ |x − y|$, car $sin′ = cos$ et $|cos t| ≤ 1$. On écrit : soient x &lt; y ; d'après les accroissements finis, $sin y − sin x = cos(c)(y − x)$ avec c ∈ ]x ; y[, puis on majore |cos(c)| par 1.</li></ol>`},
 {id:"cours",t:"La question de cours : définitions et théorèmes",pts:2,ou:"question de cours (supposée, comme au CC1)",lect:1.5,
  rappel:{min:2,q:`Soit f définie sur un intervalle I et x₀ ∈ I. Écris la définition de « f est continue en x₀ » avec ε et η, puis l'énoncé du théorème des valeurs intermédiaires et celui des accroissements finis.`,
   r:`<p>f est continue en x₀ ⇔ $∀ε &gt; 0, ∃η &gt; 0, ∀x ∈ I, |x − x₀| &lt; η ⇒ |f(x) − f(x₀)| &lt; ε$.</p><p>TVI : f continue sur [a ; b] et y entre f(a) et f(b) ⇒ ∃c ∈ [a ; b], f(c) = y.</p><p>Accroissements finis : f continue sur [a ; b], dérivable sur ]a ; b[ ⇒ ∃c ∈ ]a ; b[, $f(b) − f(a) = f′(c)(b − a)$.</p>`},
  ess:`<p>f est définie sur un intervalle I, et x₀ est un point de I.</p><ul><li>Continue en x₀ : $∀ε &gt; 0, ∃η &gt; 0, ∀x ∈ I, |x − x₀| &lt; η ⇒ |f(x) − f(x₀)| &lt; ε$.</li>
<li>Dérivable en x₀ : $(f(x) − f(x₀))/(x − x₀)$ a une limite finie quand x tend vers x₀.</li>
<li>TVI, Rolle et accroissements finis : avec leurs hypothèses, « continue sur [a ; b] » et « dérivable sur ]a ; b[ ».</li></ul>`,
  piege:`Un théorème cité sans ses hypothèses est faux (voir |x| sur [−1 ; 1]). Écris-les toujours.`,
  meth:`<p>La partie b) applique la définition. Exemple : montrer que $f(x) = 3x − 1$ est continue en 2.</p>
<ol><li>$|f(x) − f(2)| = |3x − 6| = 3|x − 2|$.</li><li>Soit ε &gt; 0. On pose η = ε/3. Si $|x − 2| &lt; η$, alors $|f(x) − f(2)| &lt; 3η = ε$.</li><li>Donc f est continue en 2.</li></ol>`}],
 blanc:[
  {t:"Question de cours : définition et théorème",ou:"connaissance du cours",pts:3,g:"AQ3",lv:0},
  {t:"Une unique solution : la rédaction avec le TVI",ou:"exercice 1, sur papier",pts:6,g:"AN10",lv:1},
  {t:"Trouver a et b pour qu'elle soit dérivable",ou:"exercice 2",pts:6,g:"AN12",lv:1},
  {t:"La tangente en un point",ou:"exercice 3",pts:5,g:"AN13",lv:0}]
},
/* L'examen d'Analyse en 2 h (session 1, entre le 4 et le 15/01, 50 % de la note, tout le cours). Date supposée.
   Aucun ancien examen sur Moodle : points estimés par moi, d'après les CC1 de 2024 et 2025, les exercices « d'après examen » des TD 4 et 5
   et le poids de chaque chapitre. Chapitres lus : 1 à 4 et 6 ; le chapitre 5 (fonctions usuelles) n'est pas encore lisible, et les chapitres
   suivants ne sont pas encore en ligne. Exemples refaits par tools/verif/express/ana-ct.js. Exercices de gen-ana.js. */
ct:{
 t:"L'examen d'Analyse en 2 h",du:"de l'examen",au:"à l'examen",duree:120,
 lead:"L'examen porte sur tout le cours, et il n'y a aucun ancien examen sur Moodle. Les notions sont rangées dans l'ordre de ce qui devrait rapporter le plus, d'après les CC1, les exercices « d'après examen » des feuilles de TD 4 et 5, et le poids de chaque chapitre : les points sont estimés par moi. Ce parcours couvre les chapitres 1 à 4 et 6. Il n'a pas encore les fonctions usuelles (chapitre 5, pas encore lisible) ni les chapitres qui suivront la dérivation : je les ajouterai quand ils seront sur Moodle. Pour chaque notion : l'essentiel, la méthode, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20.",
 carte:"tout le cours en 2 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Sept questions comme un examen de 2 h : la question de cours, une suite récurrente rédigée sur papier, le tableau inf, min, max, sup, une rédaction avec le TVI sur papier, a et b pour qu'elle soit dérivable, la tangente, puis le c des accroissements finis. La forme est supposée : il n'y a aucun ancien examen sur Moodle. Fais-les sans revenir aux notions : la note qui sort est une estimation de la tienne.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"cours",t:"Le cours à savoir par cœur",pts:2,ou:"question de cours, à chaque CC",lect:2,
  rappel:{min:3,q:`Écris de mémoire : la caractérisation de sup A ; la définition de « (uₙ) converge vers ℓ » ; la définition, avec ε et δ, de « f est continue en x₀ » ; l'énoncé du théorème des valeurs intermédiaires et celui des accroissements finis.`,
   r:`<p>A non vide et majorée : m = sup(A) ⇔ m majore A et $∀ε &gt; 0, ∃a ∈ A, m − ε &lt; a$.</p><p>$uₙ → ℓ ⇔ ∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − ℓ| ≤ ε$.</p><p>f définie sur I, x₀ ∈ I : f est continue en x₀ ⇔ $∀ε &gt; 0, ∃δ &gt; 0, ∀x ∈ I, |x − x₀| &lt; δ ⇒ |f(x) − f(x₀)| &lt; ε$.</p><p>TVI : f continue sur [a ; b] et y compris entre f(a) et f(b) ⇒ ∃c ∈ [a ; b], f(c) = y.</p><p>Accroissements finis : f continue sur [a ; b], dérivable sur ]a ; b[ ⇒ ∃c ∈ ]a ; b[, $f(b) − f(a) = f′(c)(b − a)$.</p>`},
  ess:`<ul><li><b>Borne sup</b> (A non vide et majorée) : m = sup(A) ⇔ m majore A et $∀ε &gt; 0, ∃a ∈ A, m − ε &lt; a$.</li>
<li><b>Limite d'une suite</b> : $∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − ℓ| ≤ ε$.</li>
<li><b>Continuité en x₀</b> (f définie sur I, x₀ ∈ I) : $lim_{x→x₀} f(x) = f(x₀)$, c'est-à-dire $∀ε &gt; 0, ∃δ &gt; 0, ∀x ∈ I, |x − x₀| &lt; δ ⇒ |f(x) − f(x₀)| &lt; ε$.</li>
<li><b>Dérivable en x₀</b> : $(f(x) − f(x₀))/(x − x₀)$ a une limite finie quand x tend vers x₀ ; c'est f′(x₀).</li>
<li><b>TVI</b>, <b>Rolle</b> et <b>accroissements finis</b>, avec leurs hypothèses : « continue sur [a ; b] », et « dérivable sur ]a ; b[ » pour les deux derniers.</li></ul>`,
  piege:`Un théorème cité sans ses hypothèses est faux : |x| sur [−1 ; 1] prend la même valeur aux deux bouts, mais sa dérivée ne s'annule jamais (elle n'existe pas en 0). Écris toujours les hypothèses.`,
  meth:`<p>Souvent, la question b) applique une définition. Exemple : montrer avec ε et δ que $f(x) = 2x + 5$ est continue en 1.</p>
<ol><li>$|f(x) − f(1)| = |2x + 5 − 7| = 2|x − 1|$.</li><li>Soit ε &gt; 0. On pose δ = ε/2. Si $|x − 1| &lt; δ$, alors $|f(x) − f(1)| &lt; 2δ = ε$.</li><li>Donc f est continue en 1.</li></ol>`},
 {id:"recurrente",t:"Suite récurrente : encadrer, sens, limite",pts:2,ou:"exercice 2 du CC1 2024",lect:2,exo:{g:"AN6",lv:2},
  ess:`<p>Pour $uₙ₊₁ = f(uₙ)$, toujours le même plan :</p>
<ol><li>les premiers termes ;</li><li>un encadrement $a ≤ uₙ ≤ b$, par récurrence (initialisation, hérédité, conclusion) ;</li><li>le signe de $uₙ₊₁ − uₙ$ ;</li><li>croissante et majorée (ou décroissante et minorée) : elle converge ;</li><li>sa limite ℓ vérifie ℓ = f(ℓ) (si f est continue), et l'encadrement choisit la bonne solution.</li></ol>`,
  piege:`On n'écrit ℓ = f(ℓ) qu'après avoir prouvé que la suite converge.`,
  meth:`<p>Exemple : $u₀ = 0$ et $uₙ₊₁ = √(uₙ + 6)$.</p>
<ol><li>Encadrement : si $0 ≤ uₙ ≤ 3$, alors $6 ≤ uₙ + 6 ≤ 9$, donc $√6 ≤ uₙ₊₁ ≤ 3$. Avec u₀ = 0, on a $0 ≤ uₙ ≤ 3$ pour tout n.</li>
<li>Sens : pour $0 ≤ u ≤ 3$, $(u − 3)(u + 2) ≤ 0$, c'est-à-dire $u² ≤ u + 6$, donc $u ≤ √(u + 6)$. Ainsi $uₙ ≤ uₙ₊₁$ : la suite est croissante.</li>
<li>Croissante et majorée par 3 : elle converge vers un ℓ de [0 ; 3].</li>
<li>$ℓ = √(ℓ + 6)$ donne $ℓ² − ℓ − 6 = 0$, soit $(ℓ − 3)(ℓ + 2) = 0$. Comme ℓ ≥ 0, ℓ = 3.</li></ol>`},
 {id:"prolong",t:"Continuité : prolongement et raccord",pts:2,ou:"TD 4, ex. 6, 9 et 15 (d'après CC et examen)",lect:2,exo:{g:"AN9",lv:0},
  ess:`<ul><li>Les polynômes, les quotients (là où le bas ne s'annule pas), √, exp, ln, sin et cos sont continus là où ils sont définis, ainsi que leurs sommes, produits, quotients et composées.</li>
<li>f n'est pas définie en x₀ mais a une <b>limite finie ℓ</b> en x₀ : on la <b>prolonge par continuité</b> en posant f(x₀) = ℓ.</li>
<li>Par morceaux : f est continue en x₀ si et seulement si la limite à gauche, la limite à droite et f(x₀) sont égales.</li></ul>`,
  piege:`Si les limites à gauche et à droite sont différentes, il n'y a pas de prolongement. Le TD 4, ex. 15 : $f(x) = (x² + |x|)/x$ vaut x + 1 pour x &gt; 0 (limite 1) et x − 1 pour x &lt; 0 (limite −1).`,
  meth:`<p>Le TD 4, ex. 6 : h(x) = 2x − 1 si x &lt; 1, x² si 1 ≤ x ≤ 4, et 8√x si x &gt; 4.</p>
<ol><li>Chaque morceau est continu sur son intervalle ouvert : tout se joue en 1 et en 4.</li>
<li>En 1 : à gauche, 2x − 1 tend vers 1 ; h(1) = 1² = 1. Raccord.</li>
<li>En 4 : h(4) = 4² = 16 ; à droite, 8√x tend vers 8 × 2 = 16. Raccord.</li>
<li>h est continue sur ℝ.</li></ol>`},
 {id:"tvi",t:"Le TVI : une solution, puis une seule",pts:2,ou:"TD 4, ex. 10 et 11",lect:2,exo:{g:"AN10",lv:0},
  ess:`<p><b>TVI</b> : f continue sur [a ; b], y compris entre f(a) et f(b) ⇒ il existe c ∈ [a ; b] tel que f(c) = y. En pratique : f(a) et f(b) de signes contraires, donc f s'annule sur ]a ; b[.</p>
<p><b>Une seule</b> solution : f est en plus strictement monotone.</p>`,
  piege:`Le TVI dit qu'une solution existe, pas qu'elle est seule : l'unicité vient de la stricte monotonie. Et il faut la continuité sur tout l'intervalle.`,
  meth:`<p>Le TD 4, ex. 10 : $eˣ + x³ = 5$. On pose $f(x) = eˣ + x³ − 5$.</p>
<ol><li>f est continue sur ℝ, et strictement croissante comme somme de deux fonctions strictement croissantes.</li>
<li>$f(1) = e − 4 &lt; 0$ et $f(2) = e² + 3 &gt; 0$ : d'après le TVI, il existe α ∈ ]1 ; 2[ tel que f(α) = 0.</li>
<li>f est strictement croissante : α est la seule solution sur ℝ.</li>
<li>Dichotomie : $f(1,5) = e^{1,5} + 3,375 − 5 ≈ 2,86 &gt; 0$, donc α ∈ ]1 ; 1,5[.</li></ol>`},
 {id:"derpoint",t:"Dérivable en un point, a et b",pts:2,ou:"TD 5, ex. 5, 7 et 17 (d'après examen)",lect:2,exo:{g:"AN12",lv:0},
  ess:`<ul><li>f est dérivable en x₀ si le taux $(f(x) − f(x₀))/(x − x₀)$ a une limite finie : f′(x₀). La tangente : $y = f′(x₀)(x − x₀) + f(x₀)$.</li>
<li>Dérivable si et seulement si dérivable à gauche et à droite, avec $f′_{g}(x₀) = f′_{d}(x₀)$.</li>
<li>Dérivable ⇒ continue. La réciproque est fausse : |x| en 0.</li></ul>`,
  piege:`Pour une fonction par morceaux, vérifie d'abord la continuité : sans elle, pas de dérivabilité, même si les dérivées des deux morceaux sont égales.`,
  meth:`<p>Le TD 5, ex. 7 : f(x) = √x si 0 ≤ x ≤ 1, et $f(x) = ax² + bx + 1$ si x &gt; 1. Trouver a et b pour que f soit dérivable sur ]0 ; +∞[.</p>
<ol><li>Continuité en 1 : f(1) = 1, et à droite $ax² + bx + 1$ tend vers a + b + 1. Donc a + b = 0.</li>
<li>À gauche, la dérivée de √x en 1 vaut 1/(2√1) = 1/2. À droite, celle de $ax² + bx + 1$ vaut 2a + b.</li>
<li>Dérivable en 1 : 2a + b = 1/2. Avec a + b = 0, on trouve a = 1/2 et b = −1/2.</li></ol>`},
 {id:"tableau",t:"Le tableau inf, min, max, sup",pts:1.5,ou:"partie 2 des CC1 2024 et 2025",lect:1.5,exo:{g:"AN1",lv:4},
  ess:`<ul><li><b>Max</b> : un majorant qui est <b>dans</b> A. <b>Sup</b> : le plus petit des majorants ; il existe dès que A est non vide et majorée, mais il n'est pas forcément dans A.</li>
<li>Pareil par en dessous : min et inf.</li><li>Pas de majorant : « non » dans la case du sup, jamais « +∞ ».</li></ul>`,
  piege:`Un sup n'est un max que s'il est atteint. Et une réponse fausse peut enlever des points : ne remplis pas au hasard.`,
  meth:`<p>Exemple : $B = {(−1)ⁿ + 1/n, n ≥ 1}$.</p>
<ol><li>Les premiers termes : 0 ; 3/2 ; −2/3 ; 5/4 ; −4/5…</li>
<li>Rangs pairs : 1 + 1/n ≤ 3/2, atteint pour n = 2. Rangs impairs : −1 + 1/n ≤ 0. Donc max B = sup B = 3/2.</li>
<li>Tous les termes sont &gt; −1, et les rangs impairs −1 + 1/n descendent vers −1 sans l'atteindre : inf B = −1, pas de min.</li>
<li>B n'est pas un intervalle : 0 et 3/2 sont dans B, mais pas 1.</li></ol>`},
 {id:"lim-suite",t:"Limite d'une suite avec ε",pts:1.5,ou:"exercice 1 du CC1 2024",lect:1.5,exo:{g:"AN2",lv:2},
  ess:`<p>$uₙ → ℓ ⇔ ∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − ℓ| ≤ ε$. N dépend de ε.</p><p>Au brouillon, majore $|uₙ − ℓ|$ par quelque chose de simple, comme c/n.</p>`,
  piege:`N doit être un entier : d'où le « E(…) + 1 ». Et c'est une majoration de |uₙ − ℓ| qu'il faut, pas une minoration.`,
  meth:`<p>Exemple : $uₙ = (2n + 1)/(n + 3)$ tend vers 2.</p>
<ol><li>$uₙ − 2 = (2n + 1 − 2n − 6)/(n + 3) = −5/(n + 3)$, donc $|uₙ − 2| = 5/(n + 3) &lt; 5/n$ pour n ≥ 1.</li>
<li>Soit ε &gt; 0. On pose $N = E(5/ε) + 1$ : N est un entier et N &gt; 5/ε.</li>
<li>Pour tout n ≥ N : $|uₙ − 2| &lt; 5/n ≤ 5/N &lt; ε$. Donc uₙ → 2.</li></ol>`},
 {id:"calcul",t:"Calculer une limite",pts:1.5,ou:"CC1, TD 3 et TD 5, ex. 9 et 14",lect:1.5,exo:{g:"AN4",lv:4},
  ess:`<ul><li>Quotient : factorise par le terme de plus haut degré.</li><li>Racines : la quantité conjuguée.</li><li>Terme borné (sin, cos, (−1)ⁿ) : encadre, puis les gendarmes.</li>
<li>Une forme 0/0 en un point : simplifie, ou reconnais un <b>taux d'accroissement</b>. $sin(x)/x → sin′(0) = 1$ et $(cos(x) − 1)/x → cos′(0) = 0$ en 0 (TD 5, ex. 9 et 14).</li></ul>`,
  piege:`« ∞/∞ », « 0/0 » ou « ∞ − ∞ » ne sont pas des résultats : transforme l'écriture d'abord.`,
  meth:`<ol><li>$√(n² + n) − n = n/(√(n² + n) + n) = 1/(√(1 + 1/n) + 1)$, qui tend vers 1/2.</li>
<li>$sin(3x)/x = 3 × sin(3x)/(3x)$, qui tend vers 3 × 1 = 3 en 0.</li></ol>`},
 {id:"adjacentes",t:"Suites adjacentes",pts:1.5,ou:"exercice 2 du CC1 2025",lect:1.5,exo:{g:"AN5",lv:2},
  ess:`<p>(uₙ) croissante, (vₙ) décroissante, $uₙ ≤ vₙ$ pour tout n, et $vₙ − uₙ → 0$ : elles sont adjacentes, et convergent vers la même limite ℓ, avec $uₙ ≤ ℓ ≤ vₙ$ pour tout n.</p>`,
  piege:`Cite les quatre conditions du cours. « L'écart tend vers 0 » seul ne suffit pas : uₙ = n et vₙ = n + 1/n tendent vers +∞.`,
  meth:`<p>Exemple : $uₙ = 1 + 1/2² + … + 1/n²$ et $vₙ = uₙ + 1/n$ (n ≥ 1).</p>
<ol><li>$uₙ₊₁ − uₙ = 1/(n + 1)² &gt; 0$ : (uₙ) est croissante.</li>
<li>$vₙ₊₁ − vₙ = 1/(n + 1)² + 1/(n + 1) − 1/n = −1/(n(n + 1)²) &lt; 0$ : (vₙ) est décroissante.</li>
<li>$vₙ − uₙ = 1/n$ : il est positif, donc uₙ ≤ vₙ, et il tend vers 0. Elles sont adjacentes et ont la même limite.</li></ol>`},
 {id:"bijection",t:"Bijection et réciproque",pts:1.5,ou:"TD 5, ex. 10 ; TD 4, ex. 19",lect:2,exo:{g:"AN15",lv:0},
  ess:`<ul><li>f <b>continue et strictement croissante</b> sur un intervalle I : f est une bijection de I sur J = f(I), un intervalle dont les bornes sont les limites de f aux bornes de I. Sa réciproque est continue et strictement croissante.</li>
<li>Si f est dérivable en x₀ et $f′(x₀) ≠ 0$, la réciproque est dérivable en y₀ = f(x₀), et $(f⁻¹)′(y₀) = 1/f′(x₀)$.</li></ul>`,
  piege:`$(f⁻¹)′(y₀)$ se calcule avec f′ au point x₀ = f⁻¹(y₀), pas au point y₀.`,
  meth:`<p>Le TD 5, ex. 10 : $f(x) = x ln(x) − x$ sur [1 ; +∞[, et g sa réciproque.</p>
<ol><li>$f′(x) = ln(x) + 1 − 1 = ln(x) &gt; 0$ pour x &gt; 1 : f est continue et strictement croissante sur [1 ; +∞[.</li>
<li>f(1) = −1 et f tend vers +∞ en +∞ : f est une bijection de [1 ; +∞[ sur [−1 ; +∞[.</li>
<li>$f(e) = e − e = 0$, donc g(0) = e.</li>
<li>$f′(e) = ln(e) = 1 ≠ 0$, donc $g′(0) = 1/f′(e) = 1$.</li></ol>`},
 {id:"taf",t:"Accroissements finis : une inégalité",pts:1.5,ou:"TD 5, ex. 3, 4 et 11",lect:2,exo:{g:"AN14",lv:1},
  ess:`<ul><li><b>Rolle</b> : f continue sur [a ; b], dérivable sur ]a ; b[, f(a) = f(b) ⇒ ∃c ∈ ]a ; b[, f′(c) = 0.</li>
<li><b>Accroissements finis</b> : mêmes hypothèses, sans f(a) = f(b) ⇒ ∃c ∈ ]a ; b[, $f(b) − f(a) = f′(c)(b − a)$.</li>
<li><b>Inégalité</b> : si $|f′| ≤ M$ sur ]a ; b[, alors $|f(b) − f(a)| ≤ M|b − a|$.</li></ul>`,
  piege:`c dépend de a et de b, et on ne le connaît pas : on ne le calcule pas, on <b>majore</b> f′(c) pour tous les c possibles.`,
  meth:`<p>Le TD 5, ex. 11 : $√(1 + x) ≤ 1 + x/2$ pour tout x &gt; 0.</p>
<ol><li>Soit x &gt; 0. $f(t) = √(1 + t)$ est continue sur [0 ; x] et dérivable sur ]0 ; x[, avec $f′(t) = 1/(2√(1 + t))$.</li>
<li>Accroissements finis : il existe c ∈ ]0 ; x[ tel que $√(1 + x) − 1 = x/(2√(1 + c))$.</li>
<li>c &gt; 0, donc √(1 + c) &gt; 1 et $x/(2√(1 + c)) &lt; x/2$. D'où $√(1 + x) &lt; 1 + x/2$.</li></ol>`},
 {id:"quantif",t:"Nier une phrase à quantificateurs",pts:1,ou:"vrai/faux des CC1 ; TD 4, ex. 1",lect:1,exo:{g:"AN7",lv:2},
  ess:`<p>On échange ∀ et ∃, on garde les domaines, on nie la fin. La négation de « P ⇒ Q » est « P et non Q ».</p>`,
  piege:`« ε &gt; 0 » ne se nie pas : la négation commence par « ∃ε &gt; 0 ».`,
  meth:`<p>Le TD 4, ex. 1 : « f n'est pas continue en b ».</p>
<ol><li>Continue : $∀ε &gt; 0, ∃δ &gt; 0, ∀x ∈ I, |x − b| &lt; δ ⇒ |f(x) − f(b)| &lt; ε$.</li>
<li>Pas continue : $∃ε &gt; 0, ∀δ &gt; 0, ∃x ∈ I, |x − b| &lt; δ$ et $|f(x) − f(b)| ≥ ε$.</li></ol>`}],
 blanc:[
  {t:"Question de cours : définition et théorème",ou:"connaissance du cours",pts:2,g:"AQ3",lv:0},
  {t:"Une suite récurrente, rédigée sur papier",ou:"exercice 1",pts:5,g:"AN6",lv:3},
  {t:"Le tableau inf, min, max, sup",ou:"exercice 2",pts:2,g:"AN1",lv:3},
  {t:"Une unique solution : la rédaction avec le TVI",ou:"exercice 3, sur papier",pts:4,g:"AN10",lv:1},
  {t:"Trouver a et b pour qu'elle soit dérivable",ou:"exercice 4",pts:3,g:"AN12",lv:1},
  {t:"La tangente en un point",ou:"exercice 4",pts:2,g:"AN13",lv:0},
  {t:"Le c des accroissements finis",ou:"exercice 5",pts:2,g:"AN14",lv:0}]
}};
