/* Le CC2 de Raisonnement en 1 h (vendredi 4/12, 15 h) : ensembles, applications, quantificateurs, récurrence, logique,
   dans l'ordre de ce qui a rapporté le plus aux CC2 de 2022, 2023 et 2025 et au CC du 15/11/2024 (les poids des générateurs de gen-rai.js).
   Les exemples des méthodes sont exécutés par tools/verif-express-rai.js. Les exercices sont tirés de gen-rai.js. */
(window.EXPRESS=window.EXPRESS||{}).rai={cc2:{
 t:"Le CC2 de Raisonnement en 1 h",du:"du CC",au:"au CC",
 lead:"Tout le programme du CC2, dans l'ordre de ce qui a rapporté le plus aux CC2 de 2022, 2023 et 2025. Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20.",
 carte:"tout le programme en 1 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Quatre questions comme au CC2 : les ensembles, injective ou surjective, les images, puis une récurrence rédigée sur papier. Fais-les sans revenir aux notions : la note qui sort est une estimation de celle que tu aurais eue.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"injective",t:"Injective, surjective, bijective",pts:4,ou:"tous les ans (2022 ex. 1, 2023 ex. 4, 2024 ex. 2, 2025 ex. 3)",lect:2,exo:{g:"RA1",lv:1},
  ess:`<ul><li>f : E → F est <b>injective</b> si deux éléments différents ont deux images différentes : $f(x) = f(x′) ⇒ x = x′$.</li>
<li>f est <b>surjective</b> si tout élément de F a au moins un antécédent : $∀y ∈ F, ∃x ∈ E, f(x) = y$.</li>
<li><b>Bijective</b> = injective et surjective : chaque y de F a exactement un antécédent.</li>
<li>L'ensemble de départ et l'ensemble d'arrivée comptent : x ↦ x² n'est pas surjective de ℝ dans ℝ, mais elle l'est de ℝ dans [0 ; +∞[.</li></ul>`,
  piege:`Pour dire « pas injective » ou « pas surjective », il faut un contre-exemple précis avec des nombres. « On voit bien que » ne rapporte rien.`,
  meth:`<p>f : ℤ → ℤ, $f(n) = 2n + 1$.</p>
<ol><li><b>Injective</b> : on part de $f(n) = f(m)$, donc $2n + 1 = 2m + 1$, donc $n = m$. f est injective.</li>
<li><b>Surjective ?</b> On cherche un antécédent de 0 : $2n + 1 = 0$ donne $n = −1/2$, qui n'est pas dans ℤ. 0 n'a pas d'antécédent : f n'est pas surjective.</li>
<li>g : ℕ → ℕ, $g(n) = n/2$ si n est pair, $g(n) = 0$ sinon (CC 2024 ex. 2, CC2 2025 ex. 3) : $g(1) = g(3) = 0$ avec $1 ≠ 3$, donc g n'est pas injective ; tout n a l'antécédent 2n, car $g(2n) = n$ : g est surjective.</li>
<li>h : ℝ → ℝ, $h(x) = x²$ : $h(−1) = h(1) = 1$ avec $−1 ≠ 1$, donc pas injective ; −1 n'a pas d'antécédent, donc pas surjective.</li></ol>`},
 {id:"image",t:"Image directe, image réciproque",pts:3.5,ou:"2022 ex. 2, 2023 ex. 5, 2025 ex. 1",lect:2,exo:{g:"RA2",lv:1},
  ess:`<ul><li>L'<b>image directe</b> $f(A) = \{f(x) : x ∈ A\}$ : les images des éléments de A.</li>
<li>L'<b>image réciproque</b> $f⁻¹(B) = \{x ∈ E : f(x) ∈ B\}$ : les éléments qui tombent dans B. Elle existe même si f n'est pas bijective.</li>
<li>Toujours : $A ⊂ f⁻¹(f(A))$ et $f(f⁻¹(B)) ⊂ B$. Il y a égalité à gauche dès que f est injective, et à droite dès que f est surjective.</li></ul>`,
  piege:`Avec x ↦ x², l'image réciproque a souvent deux morceaux : un du côté positif et son symétrique du côté négatif.`,
  meth:`<p>f : ℝ → ℝ, $f(x) = x²$.</p>
<ol><li>$f([−1 ; 2])$ : sur [−1 ; 2], x² va de 0 (en x = 0) à 4 (en x = 2). Donc $f([−1 ; 2]) = [0 ; 4]$.</li>
<li>$f⁻¹([1 ; 4])$ : on résout $1 ≤ x² ≤ 4$, c'est-à-dire $1 ≤ |x| ≤ 2$. Donc $f⁻¹([1 ; 4]) = [−2 ; −1] ∪ [1 ; 2]$.</li>
<li>$f⁻¹(f([0 ; 1])) = f⁻¹([0 ; 1]) = [−1 ; 1]$, plus grand que [0 ; 1] : f n'est pas injective.</li>
<li><b>À démontrer</b> (CC2 2025 ex. 1) : $f(f⁻¹(B)) ⊂ B$. Soit $y ∈ f(f⁻¹(B))$ : il existe $x ∈ f⁻¹(B)$ avec $y = f(x)$. Comme $x ∈ f⁻¹(B)$, $f(x) ∈ B$, donc $y ∈ B$.</li>
<li>L'égalité peut être fausse : avec $B = [−1 ; 1]$, $f⁻¹(B) = [−1 ; 1]$ et $f(f⁻¹(B)) = [0 ; 1] ≠ B$.</li></ol>`},
 {id:"ensembles",t:"Ensembles : ∪, ∩, ∖, Δ, ∈ et ⊂",pts:3,ou:"2023 ex. 3, QCM 2022, 2024 ex. 1",lect:1.5,exo:{g:"RA3",lv:1},
  ess:`<ul><li>$A ∪ B$ : dans l'un ou dans l'autre. $A ∩ B$ : dans les deux. $A ∖ B$ : dans A mais pas dans B.</li>
<li>La <b>différence symétrique</b> $A Δ B = (A ∖ B) ∪ (B ∖ A)$ : dans un seul des deux.</li>
<li>Si A a n éléments, $P(A)$ (ses parties) en a $2ⁿ$, et $A × B$ en a $card(A) × card(B)$.</li>
<li>$x ∈ A$ : x est un élément de A. $C ⊂ A$ : tous les éléments de C sont dans A.</li></ul>`,
  piege:`$\{1\} ⊂ A$ mais $1 ∈ A$ : un élément n'est pas une partie. Et ∅ est une partie de tout ensemble.`,
  meth:`<p>$A = \{1, 2, 3, 4\}$ et $B = \{3, 4, 5\}$.</p>
<ol><li>$A ∪ B = \{1, 2, 3, 4, 5\}$ et $A ∩ B = \{3, 4\}$.</li>
<li>$A ∖ B = \{1, 2\}$, $B ∖ A = \{5\}$, donc $A Δ B = \{1, 2, 5\}$.</li>
<li>$P(A)$ a $2⁴ = 16$ éléments ; $A × B$ en a $4 × 3 = 12$.</li></ol>`},
 {id:"quantif",t:"Quantificateurs : nier, dire si c'est vrai",pts:2.5,ou:"2023 ex. 1 et 2, QCM 2022",lect:1.5,exo:{g:"RA4",lv:1},
  ess:`<ul><li><b>Nier</b> : on échange ∀ et ∃, on garde les domaines, et on nie la fin. La négation de $x &lt; y$ est $x ≥ y$.</li>
<li>Une phrase en ∀ est fausse dès qu'on trouve <b>un</b> contre-exemple ; une phrase en ∃ est vraie dès qu'on trouve <b>un</b> exemple.</li>
<li>L'ordre compte : dans « ∀x, ∃y », y peut dépendre de x ; dans « ∃y, ∀x », c'est le même y pour tous les x.</li>
<li><b>Traduire</b> (CC2 2023, la conjecture de Goldbach) : « tout entier pair au moins égal à 4 est la somme de deux nombres premiers » s'écrit $∀n ∈ ℕ, (n ≥ 4 et n pair) ⇒ ∃p, q premiers, n = p + q$.</li></ul>`,
  piege:`On ne nie pas les domaines : la négation de « ∀x ∈ ℝ » commence par « ∃x ∈ ℝ », pas par « ∃x ∉ ℝ ».`,
  meth:`<p>Avec $E = \{1, 2, 3\}$ :</p>
<ol><li>« $∀x ∈ E, ∃y ∈ E, y &gt; x$ » est fausse : pour x = 3, aucun y de E n'est plus grand.</li>
<li>Sa négation, « $∃x ∈ E, ∀y ∈ E, y ≤ x$ », est donc vraie (x = 3).</li>
<li>L'ordre change tout : « $∀x ∈ E, ∃y ∈ E, y ≠ x$ » est vraie (pour x = 1, y = 2 ; sinon y = 1), mais « $∃y ∈ E, ∀x ∈ E, y ≠ x$ » est fausse : pour x = y, on aurait y ≠ y.</li></ol>`},
 {id:"recurrence",t:"La récurrence",pts:2.5,ou:"2022 ex. 3, 2024 ex. 3",lect:1.5,exo:{g:"RA5",lv:1},
  ess:`<p>Pour montrer P(n) pour tout n ≥ n₀ :</p><ol><li><b>Initialisation</b> : P(n₀) est vraie.</li>
<li><b>Hérédité</b> : soit n ≥ n₀ ; on suppose P(n) vraie, et on montre P(n + 1).</li>
<li><b>Conclusion</b> : P(n) est vraie pour tout n ≥ n₀.</li></ol>`,
  piege:`Dans l'hérédité, il faut faire apparaître P(n) dans P(n + 1) : pour une divisibilité, on écrit l'expression au rang n + 1 avec celle du rang n.`,
  meth:`<p>Montrer que 7 divise $8ⁿ − 1$ pour tout n ∈ ℕ.</p>
<ol><li>Initialisation : $8⁰ − 1 = 0 = 7 × 0$.</li>
<li>Hérédité : on suppose $8ⁿ − 1 = 7k$, avec k entier. Alors $8ⁿ⁺¹ − 1 = 8 × 8ⁿ − 1 = 8(8ⁿ − 1) + 7 = 7(8k + 1)$.</li>
<li>Conclusion : 7 divise $8ⁿ − 1$ pour tout n.</li></ol>
<p>Une inégalité (CC2 2022 ex. 3) : pour $x ≥ −1$, $(1 + x)ⁿ ≥ 1 + nx$. Initialisation : $1 ≥ 1$. Hérédité : on multiplie par $1 + x ≥ 0$, donc $(1 + x)ⁿ⁺¹ ≥ (1 + nx)(1 + x) = 1 + (n + 1)x + nx² ≥ 1 + (n + 1)x$, car $nx² ≥ 0$.</p>`},
 {id:"composer",t:"Composer deux applications",pts:3,ou:"2023 ex. 4, 2024 ex. 2, 2025 ex. 3",lect:2,exo:{g:"RA6",lv:1},
  ess:`<ul><li>$(g ∘ f)(x) = g(f(x))$ : on applique f d'abord, puis g. Il faut que l'arrivée de f soit dans le départ de g.</li>
<li>Si f et g sont injectives (ou surjectives), g ∘ f l'est aussi.</li>
<li>Si g ∘ f est injective, alors f est injective. Si g ∘ f est surjective, alors g est surjective.</li></ul>`,
  piege:`g ∘ f et f ∘ g ne sont pas égales en général. Et g ∘ f injective ne dit rien sur g.`,
  meth:`<p>$f(x) = 2x$ et $g(x) = x + 3$ sur ℝ.</p>
<ol><li>$(g ∘ f)(x) = g(2x) = 2x + 3$.</li>
<li>$(f ∘ g)(x) = f(x + 3) = 2x + 6$.</li>
<li>En 1 : $(g ∘ f)(1) = 5$ mais $(f ∘ g)(1) = 8$ : elles sont différentes.</li>
<li><b>À démontrer</b> (CC2 2023 ex. 4) : si g ∘ f est surjective, alors g est surjective. Soit z dans l'ensemble d'arrivée de g. Comme g ∘ f est surjective, il existe x avec $g(f(x)) = z$. Alors $y = f(x)$ vérifie $g(y) = z$ : z a un antécédent par g.</li></ol>`},
 {id:"contraposee",t:"Contraposée, absurde, disjonction de cas",pts:1.5,ou:"2025 ex. 2",lect:1.5,exo:{g:"RA7",lv:3},
  ess:`<ul><li>Pour « P ⇒ Q » : la <b>contraposée</b> est « non Q ⇒ non P » (elle dit la même chose) ; la <b>réciproque</b> est « Q ⇒ P » (elle dit autre chose) ; la <b>négation</b> est « P et non Q ».</li>
<li><b>Par l'absurde</b> : on suppose le contraire de ce qu'on veut, et on arrive à quelque chose d'impossible.</li>
<li><b>Disjonction de cas</b> : on traite tous les cas un par un (n pair, n impair), et la conclusion est vraie dans chacun.</li></ul>`,
  piege:`Prouver la réciproque ne prouve pas la phrase. Et la négation d'une implication n'est pas une implication.`,
  meth:`<ol><li>« Si n² est pair, alors n est pair. » Contraposée : si n est impair, $n = 2k + 1$, alors $n² = 2(2k² + 2k) + 1$ est impair. Donc la phrase est vraie.</li>
<li>Le CC2 2025 : $9x⁵ − 11x⁴ + 6x − 5 = 0$ n'a pas de solution entière. Disjonction de cas sur la parité de x. Si x est pair, $9x⁵ − 11x⁴ + 6x$ est pair, donc le tout est impair. Si x est impair, $9x⁵$ et $11x⁴$ sont impairs et $6x$ est pair : $9x⁵ − 11x⁴ + 6x$ est pair, et le tout est encore impair. Un nombre impair n'est jamais 0.</li></ol>`}],
 blanc:[
  {t:"Les ensembles",ou:"exercice 1",pts:4,g:"RA3",lv:3},
  {t:"Injective, surjective : un contre-exemple",ou:"exercice 2",pts:5,g:"RA1",lv:3},
  {t:"Image directe, image réciproque",ou:"exercice 3",pts:4,g:"RA2",lv:2},
  {t:"Une récurrence rédigée",ou:"exercice 4",pts:7,g:"RA5",lv:3}]
}};
