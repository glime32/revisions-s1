/* Le CC2 d'Algo en 1 h (jeudi 3/12, 16 h 45) : preuves et complexité (TD 6 à 8). Ordre et points d'après les vrais sujets
   (CC 2022, CC 2024, janvier 2023, mai 2023) : la question de cours d'abord, puis la trace et l'invariant, le comptage,
   le récursif (le plus lourd aux sujets : valeur, affichages, équation), le master theorem, l'arrêt, l'ordinateur plus rapide.
   Corrigé le 24/11 d'après la relecture de menthe (~/claude/point/questions/menthe.md, partie 1).
   Sa réponse RA1a (25/11) : les deux premières notions du CC3 (recherche dichotomique) sont reprises à la fin, au cas où, à 0 point :
   les 8 premières font les 20 points et 60 min, d'où duree:72.
   Les exemples sont exécutés par tools/verif-express-algo.js et tools/verif/express/algo.js. Les exercices sont tirés de gen-algo.js ;
   aucune question du sujet express ne reprend le générateur et le palier d'une notion. */
(window.EXPRESS=window.EXPRESS||{}).algo={cc2:{
 t:"Le CC2 d'Algo en 1 h",du:"du CC",au:"au CC",duree:72,
 lead:"Le programme du CC2 (preuves et complexité, TD 6 à 8), dans l'ordre de ce qui rapporte le plus aux anciens sujets. Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20. Les notions 9 et 10 (la recherche dichotomique, 12 min) sont là au cas où : rien ne dit qu'elle sera au CC2. Elles ne comptent pas dans les 20 points. Le CC2 peut aussi reprendre le CC1 : tes cartes de Réviser s'en occupent.",
 carte:"preuves et complexité en 1 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Cinq questions comme aux anciens sujets : la question de cours, la trace, l'arrêt, un algorithme récursif comme en janvier 2023, puis le master theorem à partir d'une procédure. Les points suivent à peu près ces sujets, où le récursif pèse le plus. Fais-les sans revenir aux notions : la note qui sort est une estimation de celle que tu aurais eue.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"cours",t:"La question de cours : θ, o, ω, et à quoi servent les outils",pts:3,ou:"CC 2022 q. 4 et 5 ; CC 2024 q. 1, 4 et 5",lect:1.5,
  rappel:{min:2,q:`Écris quand Tₙ = θ(Rₙ), Tₙ = o(Rₙ) et Tₙ = ω(Rₙ). Range 2ⁿ, n log n, 1, n², log n, n, n³ de la plus lente à la plus rapide à grandir. Puis dis à quoi sert le master theorem, et à quoi servent les équations d'itération dans une preuve de validité.`,
   r:`<p>θ(Rₙ) : Tₙ/Rₙ reste entre deux nombres strictement positifs (c'est le cas s'il tend vers a &gt; 0). o(Rₙ) : il tend vers 0. ω(Rₙ) : il tend vers +∞. O veut dire o ou θ ; Ω veut dire ω ou θ.</p><p>1, log n, n, n log n, n², n³, 2ⁿ.</p><p>Le master theorem donne une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel. Les équations d'itération traduisent le fonctionnement de l'algorithme en relations entre les variables : elles permettent de montrer qu'un invariant est héréditaire.</p>`},
  ess:`<ul><li>Tₙ = θ(Rₙ) : le quotient Tₙ/Rₙ reste entre deux nombres strictement positifs (diapo 77). C'est le cas dès qu'il tend vers a &gt; 0. Tend vers 0 : o(Rₙ). Vers +∞ : ω(Rₙ). O = o ou θ ; Ω = ω ou θ.</li>
<li>De la plus lente à la plus rapide : 1, log n, n, n log n, n², n³, 2ⁿ, n!. On garde le plus gros terme, sans le nombre devant : 3n² + 5n = θ(n²).</li>
<li>Déjà tombé : le <b>master theorem</b> sert à approcher la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel. Les <b>équations d'itération</b> traduisent ce que fait le code ; elles servent à montrer qu'un invariant est héréditaire. <b>Sans cas de base</b>, un algorithme récursif se rappelle à l'infini.</li></ul>`,
  piege:`θ ne demande pas de limite : le quotient doit seulement rester entre deux nombres strictement positifs. Tₙ = 3n + 1 si n est pair et 2n si n est impair est θ(n) (diapo 79). Et n log n n'est pas θ(n²) : n log n / n² tend vers 0, donc c'est o(n²).`,
  meth:`<ol><li>Écris le quotient Tₙ/Rₙ.</li><li>Garde le plus gros terme en haut et en bas.</li><li>Conclus : (3n² + 5n)/n² tend vers 3, donc θ(n²) ; n log n / n² tend vers 0, donc o(n²) ; 2ⁿ/n³ tend vers +∞, donc ω(n³).</li></ol>`},
 {id:"trace",t:"Faire la trace d'une boucle",pts:3,ou:"CC 2022 ex. 3 ; mai 2023 ex. 6",lect:1.5,exo:{g:"AG1",lv:4},
  ess:`<ul><li>Une <b>trace</b> est un tableau : une colonne par variable, une ligne par itération, plus la ligne « avant la boucle ».</li>
<li>On écrit les valeurs <b>à la fin</b> de chaque itération, dans l'ordre des lignes du code.</li>
<li>Après la trace, on devine ce que calcule la fonction en regardant la dernière colonne : 1, 4, 9, 16… ce sont des carrés.</li></ul>`,
  piege:`Une boucle « pour i de 1 à n » fait n tours, avec i = 1 au premier. Et une variable modifiée deux fois dans le même tour s'écrit avec sa valeur de la fin du tour.`,
  meth:`<p>Exemple : la trace de F(4).</p>
<pre class="code">Fonction F(n : entier) : entier
  s ← 0
  pour i de 1 à n faire
    s ← s + 2i − 1
  fin pour
  renvoyer s</pre>
<ol><li>Avant la boucle : s = 0.</li>
<li>Les tours : i = 1, s = 1 ; i = 2, s = 4 ; i = 3, s = 9 ; i = 4, s = 16.</li>
<li>F(4) renvoie 16. La colonne s donne 0, 1, 4, 9, 16 : F(n) calcule n².</li></ol>`},
 {id:"invariant",t:"Équations d'itération et invariant",pts:2,ou:"CC 2022 ex. 3 ; mai 2023 ex. 6",lect:2,exo:{g:"AG2",lv:0},
  ess:`<p>La méthode du cours, en 4 étapes :</p><ol>
<li><b>Équations d'itération</b> (c'est ce que fait le code) : la valeur avant la boucle, puis la valeur au tour i à partir de celle du tour i − 1.</li>
<li><b>Invariant</b> (ce qu'on veut prouver) : une formule pour la valeur au tour i, lue sur la trace.</li>
<li><b>Récurrence</b> : l'initialisation (tour 0), puis « si c'est vrai au tour i − 1, c'est vrai au tour i ».</li>
<li><b>Fin</b> : au dernier tour, i = n ; la fonction renvoie la bonne valeur.</li></ol>`,
  piege:`L'équation d'itération vient du code, l'invariant vient de la trace : ne les mélange pas. Et l'invariant doit valoir aussi au tour 0, avant la boucle.`,
  meth:`<p>La fonction F de la notion d'avant, qui calcule n².</p>
<ol><li>Équations : s₀ = 0 et sᵢ = sᵢ₋₁ + 2i − 1.</li>
<li>Invariant : « sᵢ = i² ».</li>
<li>Initialisation : s₀ = 0 = 0². Récurrence : si sᵢ₋₁ = (i − 1)², alors sᵢ = (i − 1)² + 2i − 1 = i² − 2i + 1 + 2i − 1 = i².</li>
<li>Fin : après le dernier tour, i = n, donc F renvoie sₙ = n². F est valide.</li></ol>`},
 {id:"compter",t:"Compter les opérations d'une boucle",pts:1,ou:"TD 8 ; sujet blanc ex. 2",lect:1.5,exo:{g:"AG5",lv:1},
  ess:`<ul><li>On compte 1 pour chaque calcul, comparaison, affectation et appel (diapo 72). Les lignes « pour » elles-mêmes ne comptent pas.</li>
<li>Une ligne dans un « pour i de 1 à n » est faite n fois. Le test d'un « tant que » est fait une fois de plus que le nombre de tours.</li>
<li>Les sommes à connaître : 1 + 2 + … + n = n(n + 1)/2 et 1² + 2² + … + n² = n(n + 1)(2n + 1)/6.</li></ul>`,
  piege:`Dans deux boucles imbriquées « pour j de 1 à i », la ligne du milieu n'est pas faite n × n fois, mais 1 + 2 + … + n fois. Et c ← c + 1 compte pour 2 : l'addition et l'affectation.`,
  meth:`<pre class="code">s ← 0
pour i de 1 à n faire
  pour j de 1 à i faire
    s ← s + i − j</pre>
<ol><li>Avant les boucles : s ← 0, 1 opération.</li>
<li>La ligne du milieu : une addition, une soustraction et une affectation, soit 3 opérations. Pour un i donné, elle est faite i fois : en tout 1 + 2 + … + n = n(n + 1)/2 fois.</li>
<li>Tₙ = 3n(n + 1)/2 + 1, soit 166 pour n = 10. Le plus gros terme est 3n²/2 : θ(n²).</li></ol>`},
 {id:"recursif",t:"Un algorithme récursif : valeur, affichages, équation",pts:5,ou:"janvier 2023 ex. 3 ; CC 2024 ex. 2 ; mai 2023",lect:2.5,exo:{g:"AG4",lv:1},
  ess:`<ul><li><b>La valeur</b> : on déroule les appels jusqu'au cas de base, puis on remonte.</li>
<li><b>Les affichages</b> : on suit les appels dans l'ordre des lignes. Ce qui est affiché avant l'appel sort en descendant, ce qui est après sort en remontant.</li>
<li><b>La preuve</b> est une récurrence sur n : le cas de base est juste, et si F(n − 1) renvoie la bonne valeur, F(n) aussi.</li>
<li><b>L'équation de complexité</b> : T₀ = les opérations du cas de base, puis Tₙ = (les opérations à côté) + le coût des appels. Tₙ = c + Tₙ₋₁ donne Tₙ = T₀ + c·n. Avec Tₙ = 2Tₙ₋₁ + c, on pose Uₙ = Tₙ + c, qui est géométrique de raison 2.</li></ul>`,
  piege:`« Renvoyer 1 » ne compte pas : le cas de base ne coûte que sa comparaison. Et deux appels F(n − 1) dans le même code coûtent 2Tₙ₋₁, pas Tₙ₋₁.`,
  meth:`<pre class="code">Fonction R(n : entier) : entier
  si n = 0 alors renvoyer 1
  sinon renvoyer 2 × R(n − 1)</pre>
<ol><li>Valeur : R(3) = 2 × R(2) = 2 × 2 × R(1) = 2 × 2 × 2 × R(0) = 8, en 4 appels. R(n) calcule 2ⁿ.</li>
<li>Preuve : R(0) renvoie 1 = 2⁰. Si R(n − 1) renvoie 2ⁿ⁻¹, R(n) renvoie 2 × 2ⁿ⁻¹ = 2ⁿ.</li>
<li>Complexité, comptée comme le cours (diapo 72) : T₀ = 1, la comparaison n = 0. Pour n &gt; 0 : la comparaison, la multiplication, la soustraction et l'appel, donc Tₙ = 4 + Tₙ₋₁ et Tₙ = 4n + 1 : θ(n).</li></ol>
<p>Les affichages, comme au CC de 2024 :</p>
<pre class="code">Procédure G(n : entier)
  si n &gt; 0 alors
    G(n − 2)
    afficher n étoiles
    G(n − 1)</pre>
<ol><li>G(2) : G(0) n'affiche rien, puis **, puis G(1), qui affiche *.</li>
<li>G(3) : G(1) affiche *, puis ***, puis G(2) affiche ** et *.</li>
<li>G(4) : G(2), puis ****, puis G(3). Ligne par ligne : **, *, ****, *, ***, **, *.</li></ol>`},
 {id:"master",t:"Le master theorem",pts:2,ou:"CC 2022 q. 5 ; janvier 2023 ex. 3 q. 5",lect:1,exo:{g:"AG7",lv:1},
  ess:`<p>Si T(n) ≤ a·T(n/b) + O(n<sup>d</sup>) : a appels, sur une taille divisée par b, et n<sup>d</sup> opérations à côté (diapo 84).</p>
<ul><li>b<sup>d</sup> &gt; a : O(n<sup>d</sup>).</li><li>b<sup>d</sup> = a : O(n<sup>d</sup> log n).</li><li>b<sup>d</sup> &lt; a : O(n<sup>log a / log b</sup>).</li></ul>`,
  piege:`d est l'exposant du travail à côté des appels, pas le nombre d'appels. Une boucle simple à côté, c'est d = 1 ; rien qu'un test, c'est d = 0.`,
  meth:`<ol><li>Lis a, b et d dans l'équation.</li><li>Calcule b<sup>d</sup> et compare-le à a.</li><li>Conclus avec la bonne ligne.</li></ol>
<ul><li>T(n) = T(n/2) + O(1) (dichotomie) : a = 1, b = 2, d = 0, b<sup>d</sup> = 1 = a : O(log n).</li>
<li>T(n) = 4T(n/2) + O(n) : b<sup>d</sup> = 2 &lt; 4 : O(n<sup>log 4 / log 2</sup>) = O(n²).</li>
<li>T(n) = 2T(n/4) + O(n) : b<sup>d</sup> = 4 &gt; 2 : O(n).</li></ul>`},
 {id:"arret",t:"L'arrêt d'une boucle tant que",pts:2,ou:"janvier 2023 ex. 1 q. 2 ; CC 2022 ex. 3 q. 2",lect:1.5,exo:{g:"AG3",lv:0},
  ess:`<p>Pour prouver qu'un « tant que » s'arrête, on trouve un <b>entier qui décroît strictement</b> à chaque tour et qui ne peut pas descendre indéfiniment. Si un compteur i monte de 0 jusqu'à N, cet entier est N − i.</p>
<p>La phrase du cours : « L'entier … vaut … au début et décroît strictement à chaque itération. Le tant que s'arrête quand … : au plus … itérations, donc un nombre fini : il s'arrête. »</p>`,
  piege:`« Il décroît » ne suffit pas : il faut un entier, et une borne (la boucle s'arrête quand il passe sous une valeur).`,
  meth:`<pre class="code">Fonction D(n : entier ≥ 1) : entier
  m ← n
  k ← 0
  tant que m &gt; 1 faire
    m ← m div 2
    k ← k + 1
  renvoyer k</pre>
<ol><li>Fais-la tourner : D(20) donne m = 20, 10, 5, 2, 1 et renvoie k = 4.</li>
<li>Arrêt : m est un entier, il vaut n au début, et m div 2 &lt; m quand m &gt; 1 : il décroît strictement. La boucle s'arrête quand m ≤ 1, donc après au plus n − 1 itérations : elle s'arrête.</li>
<li>Le nombre de tours : m est divisé par 2 à chaque tour, donc D(n) fait log₂(n) tours (arrondi en dessous).</li></ol>`},
 {id:"rapide",t:"Un ordinateur plus rapide",pts:2,ou:"janvier 2023 ex. 2 (3 points)",lect:1.5,exo:{g:"AG7",lv:3},
  ess:`<ul><li>Un ordinateur k fois plus rapide fait k fois plus d'opérations dans le même temps.</li>
<li><b>Quelle taille ?</b> Pour n<sup>d</sup> opérations : m = n × (racine d-ième de k). Pour 2ⁿ : m = n + log₂(k).</li>
<li><b>Quel temps ?</b> Pour n² : une taille × 3 donne un temps × 3² = 9. Pour 2ⁿ : une taille + 5 donne un temps × 2⁵ = 32.</li></ul>`,
  piege:`Pour 2ⁿ, on ne multiplie pas n : on ajoute seulement log₂(k). C'est pour ça qu'un algorithme exponentiel reste lent sur une machine plus rapide.`,
  meth:`<p>Janvier 2023 : le temps est proportionnel à n log₁₀(n). A traite une taille 100 en une minute ; B est 200 fois plus rapide. Quelle taille B traite-t-il en une minute ?</p>
<ol><li>A : 100 × log₁₀(100) = 100 × 2 = 200.</li>
<li>B fait 200 fois plus d'opérations : n log₁₀(n) = 200 × 200 = 40 000.</li>
<li>Le tableau du sujet donne 10 000 × log₁₀(10 000) = 40 000 : B traite une taille 10 000.</li></ol>
<p>Les temps : 2 s pour une taille 300 avec n² donne 2 × 9 = 18 s pour 900 ; 5 s pour une taille 40 avec 2ⁿ donne 5 × 32 = 160 s pour 45.</p>`},
 {id:"dicho",t:"La recherche dichotomique : la trace et l'arrêt",pts:0,ou:"au cas où, pas sûr au CC2 · TD 9, diapos 91 à 98",lect:2,exo:{g:"AG9",lv:1},
  ess:`<ul><li>RechDic cherche e dans un tableau <b>trié</b>. À chaque tour : mil = (deb + fin) div 2 ; si T[mil] &lt; e, deb ← mil + 1, sinon fin ← mil − 1.</li>
<li>Quand deb &gt; fin, elle renvoie deb si T[deb] = e, sinon −1 : c'est le plus petit indice qui contient e.</li>
<li><b>L'arrêt</b> : fin − deb + 1, le nombre de cases où on cherche encore, est un entier qui décroît strictement à chaque tour. La boucle s'arrête quand il vaut 0 ou moins.</li>
<li><b>La complexité</b> : θ(log n), contre θ(n) pour la recherche linéaire.</li></ul>`,
  piege:`Quand T[mil] = e, la boucle ne s'arrête pas : elle fait fin ← mil − 1 et continue à gauche, pour trouver le plus petit indice. Dans ta trace, ne t'arrête pas à la première case égale à e.`,
  meth:`<pre class="code">deb, fin ← 0, taille(T)-1
tant que deb≤fin faire
    mil ← (deb+fin) div 2
    si T[mil]&lt;e alors deb ← mil+1
    sinon fin ← mil-1
fin tq;
Renvoyer cond(deb&lt;taille(T) et T[deb]=e, deb, -1)</pre>
<p>RechDic(12, T) avec T = [2, 5, 7, 9, 12, 15, 20] :</p>
<ol><li>Au départ : deb = 0, fin = 6.</li>
<li>Tour 1 : mil = 3, T[3] = 9 &lt; 12, donc deb = 4.</li>
<li>Tour 2 : mil = 5, T[5] = 15 n'est pas &lt; 12, donc fin = 4.</li>
<li>Tour 3 : mil = 4, T[4] = 12 n'est pas &lt; 12, donc fin = 3.</li>
<li>deb = 4 &gt; fin = 3 : la boucle s'arrête, et RechDic renvoie 4, après 3 tours.</li></ol>`},
 {id:"essais",t:"Combien de mesures, combien de tours",pts:0,ou:"au cas où, pas sûr au CC2 · CC1 2024, question 3 ; diapo 97",lect:1.5,exo:{g:"AG9",lv:2},
  ess:`<ul><li>Chaque essai divise par 2 le nombre de cases où chercher : doubler le nombre de cases n'ajoute qu'<b>un</b> essai. C'est ce que veut dire θ(log n).</li>
<li><b>Les mesures</b> (corrigé du CC1 2024) : le nombre de fois qu'on divise n par 2 pour arriver à 1. 128 = 2⁷ : 7 mesures pour les 128 chevaux de Sarah.</li>
<li><b>Les tours de RechDic</b> (diapo 97) : quand toutes les valeurs sont plus petites que e, la boucle continue jusqu'à 0 case, d'où k + 1 tours pour n = 2ᵏ. 32 cases : 6 tours ; 128 cases : 8 tours.</li></ul>`,
  piege:`Lis ce qu'on te demande : des mesures (7 pour 128 chevaux) ou des tours de la boucle de RechDic (8 pour 128 cases). Et deux fois plus de légos, ce n'est pas deux fois plus d'essais : 24 000 légos demandent 15 essais, pas 28.`,
  meth:`<p>CC1 2024 : les 12 000 légos de Mr Bricks sont rangés par taille, il lui faut au plus 14 essais. Combien avec 24 000 ?</p>
<ol><li>Après le premier essai, il reste 12 000 légos où chercher.</li>
<li>Pour 12 000 légos, il faut au plus 14 essais.</li>
<li>En tout : 1 + 14 = 15 essais au plus.</li></ol>`}],
 blanc:[
  {t:"Question de cours : o, θ, ω",ou:"CC 2022 q. 4 ; CC 2024 q. 4",pts:3,g:"AGQ2",lv:0},
  {t:"La trace d'une boucle",ou:"CC 2022 ex. 3",pts:6,g:"AG1",lv:1},
  {t:"L'arrêt d'un tant que",ou:"janvier 2023 ex. 1 q. 2",pts:2,g:"AG3",lv:1},
  {t:"Un algorithme récursif",ou:"janvier 2023 ex. 3",pts:7,g:"AG4",lv:3},
  {t:"Le master theorem, à partir d'une procédure",ou:"janvier 2023 ex. 3 q. 5",pts:2,g:"AG7",lv:2}]
}};

/* Le CC3 d'Algo en 1 h (mercredi 6/01/2027, 13 h, provisoire) : recherche et tris (TD 9 et 10, diapos 88 à 114). Ni la date ni le programme
   ne sont annoncés : partage supposé d'après le mail du 24/9 et l'ordre du cours, comme dans matiere-algo.js. Pas encore de CC3 aux
   annales : l'ordre suit les questions déjà tombées (CC1 2024 q. 2 et 3, janvier 2023 ex. 4, PEIP mai 2023 ex. 4) et les TD.
   Corrigé le 24/11 d'après la relecture de menthe (partie 2). Les exemples sont exécutés par tools/verif/express/algo.js.
   Les exercices sont tirés de gen-algo.js ; aucune question du sujet express ne reprend le générateur et le palier d'une notion. */
window.EXPRESS.algo.cc3={
 t:"Le CC3 d'Algo en 1 h",du:"du CC",au:"au CC",
 lead:"Le programme supposé du CC3 (recherche et tris, TD 9 et 10 : ni la date ni le programme ne sont encore annoncés), dans l'ordre de ce qui est déjà tombé : les questions 2 et 3 du CC1 de 2024, l'exercice 4 de janvier 2023 et celui de mai 2023. Pour chaque notion : l'essentiel, la méthode du CC, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20. Le CC3 peut aussi reprendre les CC1 et CC2 : tes cartes de Réviser s'en occupent.",
 carte:"recherche et tris en 1 h, ce qui est déjà tombé d'abord, puis un sujet express noté sur 20.",
 blancLead:"Cinq questions comme celles des anciens sujets et des TD 9 et 10 : la question de cours, la recherche linéaire, la recherche dichotomique qui renvoie le dernier indice, reconnaître un tri, le tri fusion. Le barème du CC3 n'est pas annoncé : celui-ci est le mien. Fais-les sans revenir aux notions : la note qui sort est une estimation de celle que tu aurais eue.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"dicho",t:"La recherche dichotomique : la trace et l'arrêt",pts:3,ou:"TD 9, diapos 91 à 98",lect:2,exo:{g:"AG9",lv:1},
  ess:`<ul><li>RechDic cherche e dans un tableau <b>trié</b>. À chaque tour : mil = (deb + fin) div 2 ; si T[mil] &lt; e, deb ← mil + 1, sinon fin ← mil − 1.</li>
<li>Quand deb &gt; fin, elle renvoie deb si T[deb] = e, sinon −1 : c'est le plus petit indice qui contient e.</li>
<li><b>L'arrêt</b> : fin − deb + 1, le nombre de cases où on cherche encore, est un entier qui décroît strictement à chaque tour. La boucle s'arrête quand il vaut 0 ou moins.</li>
<li><b>La complexité</b> : θ(log n), contre θ(n) pour la recherche linéaire.</li></ul>`,
  piege:`Quand T[mil] = e, la boucle ne s'arrête pas : elle fait fin ← mil − 1 et continue à gauche, pour trouver le plus petit indice. Dans ta trace, ne t'arrête pas à la première case égale à e.`,
  meth:`<pre class="code">deb, fin ← 0, taille(T)-1
tant que deb≤fin faire
    mil ← (deb+fin) div 2
    si T[mil]&lt;e alors deb ← mil+1
    sinon fin ← mil-1
fin tq;
Renvoyer cond(deb&lt;taille(T) et T[deb]=e, deb, -1)</pre>
<p>RechDic(12, T) avec T = [2, 5, 7, 9, 12, 15, 20] :</p>
<ol><li>Au départ : deb = 0, fin = 6.</li>
<li>Tour 1 : mil = 3, T[3] = 9 &lt; 12, donc deb = 4.</li>
<li>Tour 2 : mil = 5, T[5] = 15 n'est pas &lt; 12, donc fin = 4.</li>
<li>Tour 3 : mil = 4, T[4] = 12 n'est pas &lt; 12, donc fin = 3.</li>
<li>deb = 4 &gt; fin = 3 : la boucle s'arrête, et RechDic renvoie 4, après 3 tours.</li></ol>`},
 {id:"essais",t:"Combien de mesures, combien de tours",pts:2,ou:"CC1 2024, question 3 ; diapo 97",lect:1.5,exo:{g:"AG9",lv:2},
  ess:`<ul><li>Chaque essai divise par 2 le nombre de cases où chercher : doubler le nombre de cases n'ajoute qu'<b>un</b> essai. C'est ce que veut dire θ(log n).</li>
<li><b>Les mesures</b> (corrigé du CC1 2024) : le nombre de fois qu'on divise n par 2 pour arriver à 1. 128 = 2⁷ : 7 mesures pour les 128 chevaux de Sarah.</li>
<li><b>Les tours de RechDic</b> (diapo 97) : quand toutes les valeurs sont plus petites que e, la boucle continue jusqu'à 0 case, d'où k + 1 tours pour n = 2ᵏ. 32 cases : 6 tours ; 128 cases : 8 tours.</li></ul>`,
  piege:`Lis ce qu'on te demande : des mesures (7 pour 128 chevaux) ou des tours de la boucle de RechDic (8 pour 128 cases). Et deux fois plus de légos, ce n'est pas deux fois plus d'essais : 24 000 légos demandent 15 essais, pas 28.`,
  meth:`<p>CC1 2024 : les 12 000 légos de Mr Bricks sont rangés par taille, il lui faut au plus 14 essais. Combien avec 24 000 ?</p>
<ol><li>Après le premier essai, il reste 12 000 légos où chercher.</li>
<li>Pour 12 000 légos, il faut au plus 14 essais.</li>
<li>En tout : 1 + 14 = 15 essais au plus.</li></ol>`},
 {id:"insertion",t:"Le tri par insertion",pts:3,ou:"mai 2023, ex. 4 ; TD 10, ex. 43",lect:1.5,exo:{g:"AG11",lv:1},
  ess:`<p>Pour k de 1 à n − 1, on insère tab[k] parmi tab[0..k − 1], déjà triés : les valeurs plus grandes sont décalées d'une case vers la droite. θ(n²) au pire, très rapide sur un tableau presque trié (diapo 114).</p>
<pre class="code">pour k de 1 à n-1 faire
    a ← tab[k]
    j ← k-1
    tant que j≥0 et tab[j]&gt;a faire
        tab[j+1] ← tab[j]
        j ← j-1
    fin tq;
    tab[j+1] ← a
fin pour;</pre>`,
  piege:`Au départ j ← k − 1, et à la fin tab[j + 1] ← a, pas tab[j] : la boucle s'est arrêtée sur une case plus petite que a ou égale, ou à j = −1.`,
  meth:`<p>Après chaque itération, pour [5, 2, 4, 1, 3] :</p>
<ol><li>k = 1, a = 2 : 5 est décalé. [2, 5, 4, 1, 3].</li>
<li>k = 2, a = 4 : 5 est décalé. [2, 4, 5, 1, 3].</li>
<li>k = 3, a = 1 : 5, 4 et 2 sont décalés. [1, 2, 4, 5, 3].</li>
<li>k = 4, a = 3 : 5 et 4 sont décalés. [1, 2, 3, 4, 5].</li></ol>
<p>7 décalages. En mai 2023 (le tri de John, écrit avec i), les deux trous étaient j ← i − 1 et T[j + 1] ← a.</p>`},
 {id:"selection",t:"Le tri par sélection",pts:2,ou:"TD 10, ex. 42 ; diapo 114",lect:1.5,exo:{g:"AG11",lv:0},
  ess:`<p>Pour i de 0 à n − 2 : on cherche l'indice m de la plus petite valeur parmi tab[i..n − 1], puis un seul échange, tab[i] avec tab[m]. Toujours n(n − 1)/2 comparaisons : θ(n²), même sur un tableau trié.</p>
<pre class="code">pour i de 0 à n-2 faire
    m ← i
    pour j de i+1 à n-1 faire
        si tab[j] &lt; tab[m] alors
            m ← j
        fin si;
    fin pour;
    échanger tab[i] et tab[m]
fin pour;</pre>`,
  piege:`m est un <b>indice</b>, pas une valeur. Si la plus petite valeur est déjà à sa place, l'échange ne change rien : recopie le même tableau.`,
  meth:`<p>Après chaque itération, pour [5, 2, 4, 1, 3] :</p>
<ol><li>i = 0 : 1 est en case 3, on échange : [1, 2, 4, 5, 3].</li>
<li>i = 1 : 2 est déjà en case 1 : [1, 2, 4, 5, 3].</li>
<li>i = 2 : 3 est en case 4, on échange : [1, 2, 3, 5, 4].</li>
<li>i = 3 : 4 est en case 4, on échange : [1, 2, 3, 4, 5].</li></ol>
<p>4 + 3 + 2 + 1 = 10 comparaisons.</p>`},
 {id:"bulles",t:"Le tri à bulles",pts:2,ou:"CC1 2024, question 2 ; diapo 105",lect:1.5,exo:{g:"AG10",lv:0},
  ess:`<p>Pour i de 0 à n − 2, j recule de la fin jusqu'à i + 1, et on échange T[j] et T[j − 1] quand T[j] &lt; T[j − 1]. La plus petite valeur qui reste remonte en case i.</p>
<pre class="code">pour i de 0 à n-2 faire
    pour j de n-1 à i+1 par pas de -1 faire
        si T[j]&lt;T[j-1] alors
            échanger T[j] et T[j-1]
        fin si;
    fin pour;
fin pour;</pre>
<p>θ(n²), <b>en place</b> et <b>stable</b> (diapo 105). Il n'échange que deux voisines : c'est le tri de Luc au CC1 2024, quand il ne peut permuter que deux vaisseaux voisins.</p>`,
  piege:`Le j du cours part de la fin : après le premier tour, c'est la plus petite valeur qui est en case 0, pas la plus grande en dernière case.`,
  meth:`<p>Après chaque itération, pour [5, 2, 4, 1, 3] :</p>
<ol><li>i = 0 : 1 remonte en case 0 : [1, 5, 2, 4, 3].</li>
<li>i = 1 : 3 passe devant 4, puis 2 devant 5 : [1, 2, 5, 3, 4].</li>
<li>i = 2 : 3 passe devant 5 : [1, 2, 3, 5, 4].</li>
<li>i = 3 : 4 passe devant 5 : [1, 2, 3, 4, 5].</li></ol>
<p>7 échanges et 10 comparaisons.</p>`},
 {id:"fusion",t:"La fusion et le tri fusion",pts:3,ou:"diapos 107 à 113 ; CC1 2024, question 2",lect:2,exo:{g:"AG12",lv:0},
  ess:`<ul><li><b>La fusion</b> range dans T deux moitiés triées, T1 et T2 : à chaque case, on prend la plus petite des deux premières valeurs qui restent ; quand une moitié est vide, on recopie l'autre.</li>
<li><b>Le tri fusion</b> coupe au milieu, trie la moitié gauche, puis la droite, puis les fusionne. Une case seule est déjà triée.</li>
<li>Sa complexité, θ(n log n), est admise (diapo 112) ; le master theorem, avec T(n) = 2T(n/2) + θ(n), donne O(n log n). Il est stable, mais <b>pas en place</b> : la fusion a besoin de T1 et T2.</li></ul>`,
  piege:`À égalité, la fusion du cours prend dans T1 (le test est T1[i] ≤ T2[j]) : c'est ce qui la rend stable. Et pour « le tableau après chaque fusion », on finit toute la moitié gauche avant de toucher à la droite.`,
  meth:`<p>La fusion de T1 = [2, 5, 8] et T2 = [1, 6, 9] : 1 &lt; 2, on prend 1 (T2), puis 2 (T1), 5 (T1), 6 (T2), 8 (T1) et 9 (T2). Résultat : [1, 2, 5, 6, 8, 9].</p>
<p>Le tri fusion de [6, 3, 8, 1] : la moitié gauche devient [3, 6], donc [3, 6, 8, 1] ; puis la droite : [3, 6, 1, 8] ; puis les deux : [1, 3, 6, 8]. 3 fusions et 7 appels à triFusionAux ; pour n cases, n − 1 fusions et 2n − 1 appels.</p>`},
 {id:"valeurs",t:"Le tri par valeurs",pts:2,ou:"janvier 2023, ex. 4 ; diapos 101 et 102",lect:1.5,exo:{g:"AG13",lv:0},
  ess:`<p>Quand les valeurs de T sont des entiers de ⟦0 ; p − 1⟧ :</p>
<ol><li>On compte : Cpt[v] est le nombre de fois où v est dans T.</li>
<li>On réécrit T dans l'ordre : Cpt[0] fois la valeur 0, puis Cpt[1] fois la valeur 1, et ainsi de suite.</li></ol>
<p>θ(n + p), donc θ(n) quand p est petit (pour des chiffres, p = 10). Ce n'est pas un tri par comparaison : c'est pour ça qu'il fait mieux que n log n.</p>`,
  piege:`Le tant que fait un tour par case écrite (j ← j + 1) <b>et</b> un tour à chaque k ← k + 1 : n plus la plus grande valeur, pas n. Et il ne marche que pour des entiers d'un petit intervalle.`,
  meth:`<p>T = [2, 0, 2, 1, 0, 2], avec p = 3 :</p>
<ol><li>Le comptage : Cpt = [2, 1, 3] (deux 0, un 1, trois 2).</li>
<li>La réécriture : T = [0, 0, 1, 2, 2, 2].</li>
<li>Le tant que fait 6 tours qui écrivent une case, plus 2 tours où k ← k + 1 : 8 tours.</li></ol>`},
 {id:"cours",t:"La question de cours : quel tri, quelles complexités",pts:3,ou:"janvier 2023, ex. 4 ; CC1 2024, question 2",lect:1.5,
  rappel:{min:2,q:`Donne la complexité du tri par valeurs, des tris à bulles, par sélection et par insertion, et du tri fusion. Dis lesquels sont stables, et lequel n'est pas en place. Puis donne les deux bornes inférieures : pour tout tri, et pour un tri par comparaison.`,
   r:`<p>Par valeurs : θ(n + p), soit θ(n). À bulles, par sélection, par insertion : θ(n²). Fusion : θ(n log n).</p><p>Stables : le tri à bulles et le tri fusion (le cours le dit), et aussi le tri par insertion, avec son test tab[j] &gt; a. Pas en place : le tri fusion.</p><p>Tout tri est en Ω(n), car il faut lire chaque case. Un tri par comparaison est en Ω(n log n), et le tri fusion l'atteint.</p>`},
  ess:`<ul><li>Par valeurs : θ(n + p). À bulles, par sélection, par insertion : θ(n²). Fusion : θ(n log n).</li>
<li>Tout tri est en Ω(n), il faut lire chaque case : θ(1) est impossible. Un tri par comparaison est en Ω(n log n).</li>
<li><b>Quel tri ?</b> Peu de valeurs différentes : par valeurs. Permuter seulement deux voisins : à bulles. Permuter deux éléments quelconques : à bulles ou par sélection. Valeurs toutes différentes, et de la place : le tri fusion.</li></ul>`,
  piege:`En janvier 2023, proposer θ(n log n) comme meilleur ordre pour trier des chiffres coûtait 0,5 point : avec seulement 10 valeurs possibles, le tri par valeurs fait θ(n).`,
  meth:`<p>Janvier 2023 : trier un tableau de n chiffres. Anakin dit θ(n²), Leia θ(n log n), Chewbacca θ(n) et Luke θ(1).</p>
<ol><li>Luke : impossible, car tout tri est en Ω(n).</li>
<li>Chewbacca : possible, un chiffre n'a que 10 valeurs. C'est le tri par valeurs, en θ(n), le meilleur.</li>
<li>Anakin et Leia : possibles, mais moins bons.</li></ol>`}],
 blanc:[
  {t:"Question de cours : quel tri, quelles complexités",ou:"janvier 2023, CC1 2024",pts:4,g:"AGQ6",lv:0},
  {t:"La recherche linéaire",ou:"TD 9, diapo 88",pts:3,g:"AG9",lv:0},
  {t:"La recherche dichotomique, dernier indice",ou:"diapo 98",pts:5,g:"AG9",lv:3},
  {t:"Quel tri a produit ces tableaux ?",ou:"TD 10",pts:4,g:"AG11",lv:2},
  {t:"Le tri fusion : appels, fusions, complexité",ou:"diapos 107 à 113",pts:4,g:"AG12",lv:2}]
};
