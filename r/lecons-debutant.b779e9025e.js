/* Explications « depuis zéro » : le niveau Débutant des leçons. Une entrée par écran d'explication,
   rangée par matière, par leçon, puis par titre de l'écran (le même titre que dans lecons-<matière>.js).
   Chaque texte part de rien : il redit les mots, avance par petits pas et montre un exemple chiffré.
   Le texte du cours reste affiché dessous, tel quel. */
(function(){
const C=s=>W.code(s,"ml");
const PS=s=>W.code(s,"pseudo");
const v=s=>`<span class="vec">${s}</span>`;
const sys=(...ls)=>`<span class="sys">${ls.map(l=>`<span>${l}</span>`).join("")}</span>`;
const mat=(R,aug)=>`<span class="mat${aug?" aug":""}" style="--n:${R[0].length}">${R.map(r=>r.map((x,j)=>`<span${aug&&j===r.length-1?' class="au"':""}>${String(x).replace(/^-/,"−")}</span>`).join("")).join("")}</span>`;
const DEBUT={
calc:{
 "c-domaine":{
  "Ce qui est interdit":`<p><b>Le domaine de définition</b> d'une fonction, c'est l'ensemble des nombres x pour lesquels on <b>peut faire le calcul</b>. Chercher le domaine, c'est chercher ce qui bloque.</p>
<p><b>Trois choses bloquent, et seulement trois dans ce cours :</b></p>
<ul><li><b>diviser par 0</b> : 1/0 n'existe pas. Donc ce qui est sous une barre de fraction ne doit pas valoir 0 ;</li><li><b>le ln d'un nombre négatif ou nul</b> : ln(0) et ln(−2) n'existent pas. Donc ce qui est dans un ln doit être strictement positif ;</li><li><b>la racine d'un nombre négatif</b> : √(−4) n'existe pas. Donc ce qui est sous une racine doit être positif ou nul.</li></ul>
<p><b>La méthode :</b> je repère chaque danger, j'écris sa condition, je la résous, puis j'écris l'ensemble des x qui restent.</p>
<p><b>Exemple 1.</b> f(x) = 1/(x − 3). Danger : la division. Condition : x − 3 ≠ 0, donc x ≠ 3. Domaine : tous les réels sauf 3, ce qui s'écrit ℝ ∖ {3}.</p>
<p><b>Exemple 2.</b> f(x) = ln(x − 2). Danger : le ln. Condition : x − 2 &gt; 0, donc x &gt; 2. Domaine : ]2, +∞[. Le crochet est tourné vers l'extérieur parce que 2 lui-même est interdit.</p>
<p><b>Exemple 3.</b> f(x) = √(x + 4). Danger : la racine. Condition : x + 4 ≥ 0, donc x ≥ −4. Domaine : [−4, +∞[. Ici le crochet est tourné vers −4 parce que −4 est autorisé (√0 = 0).</p>
<p><b>Exemple 4, deux dangers à la fois.</b> f(x) = √(x − 1)/(x − 4). La racine demande x ≥ 1. La division demande x ≠ 4. Il faut les deux : les réels à partir de 1, sauf 4. On l'écrit [1, 4[ ∪ ]4, +∞[, où ∪ veut dire « réuni avec ».</p>
<p><b>À ne pas faire :</b> simplifier la formule avant de chercher le domaine. On cherche les interdits sur la formule telle qu'elle est donnée.</p>`},
 "c-derivees":{
  "Les règles":`<p><b>La dérivée f′</b> d'une fonction mesure sa pente : positive quand la fonction monte, négative quand elle descend. Pour la calculer, on applique des règles. Il y a deux étages.</p>
<p><b>Étage 1 : les dérivées de base, à savoir par cœur.</b></p>
<ul><li>un nombre seul (5, π) : dérivée 0 ;</li><li>xⁿ : n xⁿ⁻¹. Par exemple (x³)′ = 3x² et (x)′ = 1 ;</li><li>eˣ : eˣ ;</li><li>ln x : 1/x ;</li><li>sin x : cos x ; cos x : −sin x.</li></ul>
<p><b>Étage 2 : quand ce n'est pas « x » tout seul à l'intérieur.</b> On appelle u ce qu'il y a à l'intérieur. La règle : on dérive comme d'habitude, puis <b>on multiplie par u′</b>, la dérivée de l'intérieur.</p>
<ul><li>(e<sup>3x</sup>)′ : ici u = 3x et u′ = 3. Résultat : 3 e<sup>3x</sup>.</li><li>(ln(x² + 1))′ : u = x² + 1 et u′ = 2x. Résultat : 2x/(x² + 1).</li><li>((2x + 1)³)′ : u = 2x + 1 et u′ = 2. Résultat : 3 × 2 × (2x + 1)² = 6(2x + 1)².</li></ul>
<p><b>Un produit de deux fonctions</b> u × v : (uv)′ = u′v + uv′. Exemple : x² eˣ. On pose u = x² et v = eˣ, donc u′ = 2x et v′ = eˣ. Résultat : 2x eˣ + x² eˣ.</p>
<p><b>Un quotient</b> u/v : (u/v)′ = (u′v − uv′)/v². Exemple : x/(x + 1). On pose u = x et v = x + 1, donc u′ = 1 et v′ = 1. Résultat : (1 × (x + 1) − x × 1)/(x + 1)² = 1/(x + 1)².</p>
<p><b>La méthode sur la copie :</b></p>
<ol><li>je regarde la forme : un produit, un quotient, ou quelque chose avec un intérieur ?</li><li>j'écris u, v, u′ et v′ <b>avant</b> de toucher à la formule ;</li><li>j'écris la formule, puis je remplace.</li></ol>
<p>La plupart des erreurs viennent d'un u′ oublié ou d'un signe moins perdu dans le quotient.</p>`},
 "c-primitives":{
  "Primitive, intégrale : les mots et les notations":`<p><b>Une primitive, c'est une dérivée à l'envers.</b> Chercher une primitive de 2x, c'est chercher une fonction dont la dérivée est 2x. Réponse : x², puisque (x²)′ = 2x.</p>
<p><b>Pourquoi « + C ».</b> x² + 5 marche aussi : la dérivée de 5 est 0. Et x² − 3 aussi. Toutes les primitives de 2x sont donc x² + C, où C est n'importe quel nombre. On écrit : ∫ 2x dx = x² + C.</p>
<p><b>Lire l'écriture ∫ f(x) dx.</b> Le signe ∫ veut dire « primitive de », et le « dx » à la fin dit seulement que la variable s'appelle x.</p>
<p><b>Une intégrale, c'est un nombre.</b> Quand il y a deux bornes, en bas et en haut du ∫, on calcule une primitive F, puis F(en haut) − F(en bas).</p>
<p>Exemple : ∫₀³ 2x dx.</p>
<ol><li>Une primitive de 2x : F(x) = x².</li><li>F(3) − F(0) = 9 − 0 = 9.</li></ol>
<p>On l'écrit [x²]₀³ = 9. Les crochets veulent dire « valeur en haut moins valeur en bas ».</p>
<p><b>Ce que ce nombre représente :</b> l'aire entre la courbe et l'axe horizontal, de x = 0 à x = 3. Ici, c'est un triangle de base 3 et de hauteur 6 : son aire est bien 3 × 6/2 = 9.</p>
<p><b>À ne pas mélanger :</b></p>
<ul><li>sans bornes : la réponse est une <b>fonction</b>, avec « + C » ;</li><li>avec bornes : la réponse est un <b>nombre</b>, sans « + C ».</li></ul>`,
  "Les formes à reconnaître":`<p>Pour trouver une primitive, on ne calcule pas : on <b>reconnaît</b> une forme, puis on vérifie en dérivant.</p>
<p><b>Forme 1 : une puissance de x.</b> On ajoute 1 à l'exposant, et on divise par le nouvel exposant. Une primitive de x² est x³/3. Vérification : (x³/3)′ = 3x²/3 = x².</p>
<p><b>Forme 2 : 1/x.</b> Sa primitive est ln|x|. (La règle des puissances ne marche pas ici : elle ferait diviser par 0.)</p>
<p><b>Forme 3 : une fonction u, et sa dérivée u′ juste à côté.</b> C'est la forme la plus fréquente au contrôle. On cherche un « intérieur » u, et on regarde si sa dérivée est là, en facteur.</p>
<p>Exemple : 2x e<sup>x²</sup>. L'intérieur est u = x². Sa dérivée, 2x, est bien devant. C'est donc u′ e<sup>u</sup>, de primitive e<sup>u</sup> : la réponse est e<sup>x²</sup>.</p>
<p><b>Quand il manque un nombre.</b> Pour x e<sup>x²</sup>, il faudrait 2x devant, et on n'a que x. On écrit x = (1/2) × 2x. La primitive est donc (1/2) e<sup>x²</sup>.</p>
<p>Autre exemple : cos(3x). L'intérieur est u = 3x, de dérivée 3, qui n'est pas là. On compense en divisant par 3 : la primitive est sin(3x)/3. Vérification : (sin(3x)/3)′ = 3 cos(3x)/3 = cos(3x).</p>
<p><b>Le réflexe qui sauve des points :</b> dériver sa réponse. Si on retombe sur la fonction de départ, c'est juste.</p>`},
 "c-ipp":{
  "La formule et le choix":`<p><b>Quand s'en servir.</b> Quand il faut intégrer un <b>produit de deux fonctions de familles différentes</b>, par exemple x × eˣ, et qu'on ne reconnaît aucune forme « u′ avec u ».</p>
<p><b>L'idée.</b> On échange l'intégrale difficile contre une plus facile : on dérive l'un des deux morceaux (pour le simplifier) et on prend une primitive de l'autre.</p>
<p><b>Les quatre cases à remplir</b>, avant tout calcul :</p>
<ul><li>u : le morceau que je vais <b>dériver</b>, et u′ sa dérivée ;</li><li>v′ : le morceau dont je vais prendre une <b>primitive</b>, et v cette primitive.</li></ul>
<p>La formule : ∫ u v′ = [u v] − ∫ u′ v.</p>
<p><b>Exemple complet : ∫₀¹ x eˣ dx.</b></p>
<ol><li>Je choisis u = x (en dérivant, il devient 1 : plus simple) et v′ = eˣ.</li><li>Je remplis : u′ = 1 et v = eˣ.</li><li>J'applique : [x eˣ]₀¹ − ∫₀¹ 1 × eˣ dx.</li><li>Le crochet : 1 × e¹ − 0 × e⁰ = e.</li><li>L'intégrale qui reste : ∫₀¹ eˣ dx = [eˣ]₀¹ = e − 1.</li><li>Résultat : e − (e − 1) = 1.</li></ol>
<p><b>Comment choisir u.</b> On prend pour u ce qui devient plus simple quand on le dérive : un polynôme (x devient 1) ou un ln (ln x devient 1/x). On garde pour v′ ce dont on connaît une primitive : eˣ, sin, cos.</p>
<p><b>Si on se trompe de choix</b>, l'intégrale qui reste est plus compliquée que celle de départ : c'est le signe qu'il faut échanger les rôles.</p>
<p><b>Sur la copie</b>, on écrit la phrase : « On effectue une intégration par parties en posant u(x) = … et v′(x) = … Alors u′(x) = … et v(x) = … »</p>`},
 "c-integrales":{
  "Le changement de variable":`<p><b>L'idée.</b> Quand un morceau compliqué revient dans l'intégrale, on lui donne un nom, u, et on réécrit toute l'intégrale avec u. Elle devient plus simple.</p>
<p><b>Il faut changer trois choses, pas une seule :</b> la fonction, le « dx », et les bornes.</p>
<p><b>Exemple complet : ∫₀¹ 2x (x² + 1)³ dx.</b></p>
<ol><li><b>Je choisis u.</b> Le morceau compliqué est x² + 1. Je pose u = x² + 1.</li><li><b>Je change dx.</b> La dérivée de u est 2x, ce qu'on écrit du = 2x dx. Justement, « 2x dx » est dans l'intégrale : je le remplace par du.</li><li><b>Je change les bornes.</b> Elles étaient pour x, il les faut pour u. Quand x = 0, u = 0² + 1 = 1. Quand x = 1, u = 1² + 1 = 2.</li><li><b>Je réécris.</b> L'intégrale devient ∫₁² u³ du.</li><li><b>Je calcule.</b> Une primitive de u³ est u⁴/4. Donc [u⁴/4]₁² = 16/4 − 1/4 = 15/4.</li></ol>
<p><b>Les deux oublis qui coûtent des points :</b></p>
<ul><li>garder « dx » au lieu de le remplacer : dx et du ne sont pas la même chose ;</li><li>garder les anciennes bornes 0 et 1 : elles valaient pour x, plus pour u.</li></ul>
<p><b>Quoi choisir pour u ?</b> Ce qui est sous une racine, dans une parenthèse à une puissance, ou une exponentielle qui revient plusieurs fois.</p>`},
 "c-limites":{
  "Les outils":`<p><b>Une limite</b> répond à la question : vers quel nombre va f(x) quand x s'approche d'une valeur, ou quand x devient très grand ?</p>
<p><b>Le cas facile.</b> Souvent, il suffit de remplacer. La limite de x² + 1 quand x tend vers 2 est 2² + 1 = 5.</p>
<p><b>Un fait à connaître :</b> quand x devient très grand, 1/x devient très petit. On dit que 1/x tend vers 0. Pareil pour 5/x² ou 1/x³.</p>
<p><b>Le cas qui bloque : les formes indéterminées.</b> Quand on remplace et qu'on obtient « ∞/∞ » ou « 0/0 », on ne peut rien conclure : il faut d'abord transformer l'écriture.</p>
<p><b>Outil 1, pour une fraction quand x tend vers l'infini : mettre en facteur le terme le plus fort, en haut et en bas.</b></p>
<p>Exemple : (3x² + x)/(x² + 5). En haut et en bas, le plus fort est x². On factorise : x²(3 + 1/x) en haut, x²(1 + 5/x²) en bas. Les x² se simplifient. Il reste (3 + 1/x)/(1 + 5/x²), qui tend vers 3/1 = 3.</p>
<p><b>Outil 2, pour « 0/0 » quand x tend vers un nombre a : factoriser par (x − a), puis simplifier.</b></p>
<p>Exemple : (x² − 9)/(x − 3) quand x tend vers 3. En remplaçant, on obtient 0/0. Or x² − 9 = (x − 3)(x + 3). On simplifie par (x − 3) : il reste x + 3, qui tend vers 6.</p>
<p><b>Outil 3 : qui gagne à l'infini ?</b> L'exponentielle l'emporte sur toutes les puissances de x, et les puissances l'emportent sur ln. Par exemple x/eˣ tend vers 0 (l'exponentielle, en bas, gagne), et ln(x)/x tend vers 0 aussi.</p>
<p><b>Deux notations :</b> « en 0⁺ » veut dire que x s'approche de 0 par des valeurs positives (0,1 puis 0,01…). « En +∞ » veut dire que x devient de plus en plus grand.</p>`},
 "c-ed0":{
  "Une équation dont l'inconnue est une fonction":`<p><b>Ce que tu connais déjà.</b> Dans une équation comme 2x + 1 = 7, on cherche un <b>nombre</b> : ici x = 3, parce que 2 × 3 + 1 = 7.</p>
<p><b>Ce qui change ici.</b> On ne cherche plus un nombre, on cherche une <b>fonction</b>. Une fonction, c'est une règle qui donne un résultat pour chaque valeur de t. Exemples : y(t) = t² (pour t = 3, elle donne 9), ou y(t) = e<sup>2t</sup>.</p>
<p><b>La dérivée y′</b> d'une fonction dit à quelle vitesse elle monte ou descend. Trois dérivées suffisent pour cette leçon :</p>
<ul><li>la dérivée d'un nombre fixe (comme 5) est 0 : il ne bouge pas ;</li><li>la dérivée de t² est 2t ;</li><li>la dérivée de e<sup>2t</sup> est 2 e<sup>2t</sup> : le nombre devant t descend devant l'exponentielle.</li></ul>
<p><b>Une équation différentielle</b> est une égalité où apparaissent à la fois y et y′. Par exemple y′ − 2y = 0. La résoudre, c'est trouver les fonctions y pour lesquelles cette égalité est vraie <b>pour toutes les valeurs de t</b>, pas seulement pour une.</p>
<p><b>Tester une fonction, en 3 gestes.</b> On veut savoir si y(t) = e<sup>2t</sup> est solution de y′ − 2y = 0.</p>
<ol><li>On calcule sa dérivée : y′(t) = 2 e<sup>2t</sup>.</li><li>On remplace dans le côté gauche : y′ − 2y = 2 e<sup>2t</sup> − 2 × e<sup>2t</sup>.</li><li>On simplifie : ça fait 0, quel que soit t. L'égalité est vraie : <b>c'est une solution</b>.</li></ol>
<p><b>Un essai qui rate</b>, pour voir la différence. Est-ce que y(t) = t² est solution de la même équation ? Sa dérivée est 2t. Donc y′ − 2y = 2t − 2t². Pour t = 2, ça donne 4 − 8 = −4, et pas 0. L'égalité est fausse pour t = 2 : <b>ce n'est pas une solution</b>.</p>
<p><b>Les lettres a et b.</b> Le cours écrit toutes ces équations sous la forme y′ + a y = b. Les lettres a et b sont <b>données</b> par l'énoncé, y est ce qu'on cherche. Dans y′ + 3y = 6 : a = 3 et b = 6. Dans y′ − 2y = 0 : a = −2 (le signe compte) et b = 0.</p>`,
  "L'équation homogène : y′ + ay = 0":`<p><b>Le mot.</b> « Homogène » veut seulement dire : il y a <b>0 à droite</b> du signe =. C'est le cas le plus simple, et il sert dans tous les autres.</p>
<p><b>Comprendre sur un exemple : y′ + 3y = 0.</b> On passe 3y de l'autre côté : y′ = −3y. En mots : « la dérivée de y vaut −3 fois y ». Quelle fonction a une dérivée égale à elle-même multipliée par un nombre ? L'exponentielle.</p>
<ul><li>Essai : y = e<sup>−3x</sup>. Sa dérivée est −3 e<sup>−3x</sup>, c'est-à-dire −3 fois y. Ça marche.</li><li>Et 5 e<sup>−3x</sup> ? Sa dérivée est 5 × (−3) e<sup>−3x</sup>, encore −3 fois elle-même. Ça marche aussi.</li><li>On peut donc mettre n'importe quel nombre devant. On l'appelle C. <b>Toutes les solutions : y = C e<sup>−3x</sup></b>.</li></ul>
<p>Il y a une infinité de solutions : une pour chaque valeur de C.</p>
<p><b>Quand a n'est pas un nombre fixe</b>, par exemple y′ + 2x y = 0, il faut une <b>primitive</b> de a. Une primitive de a, c'est une fonction A dont la dérivée est a. Ici a(x) = 2x, et la dérivée de x² est 2x : donc A(x) = x².</p>
<p>La règle du cours : les solutions sont y = C e<sup>−A(x)</sup>. Ici : y = C e<sup>−x²</sup>.</p>
<p>Vérification : la dérivée de e<sup>−x²</sup> est −2x e<sup>−x²</sup>. Donc y′ = −2x y, c'est-à-dire y′ + 2x y = 0.</p>
<p><b>Le piège du signe.</b> Dans y′ − 4y = 0, a vaut <b>−4</b>. Donc A(x) = −4x, et e<sup>−A(x)</sup> = e<sup>4x</sup> : le signe a changé deux fois. Les solutions sont y = C e<sup>4x</sup>.</p>
<p><b>En résumé</b> : je lis a avec son signe, je trouve A (une primitive de a), j'écris C e<sup>−A(x)</sup>.</p>`,
  "La condition initiale choisit une seule solution":`<p><b>Le problème.</b> y = C e<sup>−3x</sup> n'est pas une réponse unique : c'est toute une famille de fonctions, une par valeur de C. L'énoncé ajoute donc un renseignement pour en choisir une seule.</p>
<p><b>Lire la condition.</b> « y(0) = 2 » veut dire : quand x vaut 0, la fonction vaut 2. C'est le point de départ de la courbe.</p>
<p><b>La méthode : on remplace x, et on trouve C.</b></p>
<ol><li>J'écris la famille : y(x) = C e<sup>−3x</sup>.</li><li>Je remplace x par 0 : y(0) = C e<sup>0</sup>. Or e<sup>0</sup> = 1, donc y(0) = C.</li><li>L'énoncé dit y(0) = 2. Donc C = 2.</li><li>La solution cherchée : y(x) = 2 e<sup>−3x</sup>.</li></ol>
<p><b>Quand la condition n'est pas en 0</b>, c'est le même geste. Exemple : y′ + 3y = 0 avec y(1) = 5.</p>
<ol><li>y(x) = C e<sup>−3x</sup>.</li><li>Je remplace x par 1 : y(1) = C e<sup>−3</sup>.</li><li>Il faut C e<sup>−3</sup> = 5. Je multiplie les deux côtés par e<sup>3</sup> : C = 5 e<sup>3</sup>.</li><li>y(x) = 5 e<sup>3</sup> e<sup>−3x</sup> = 5 e<sup>3 − 3x</sup>. Contrôle : pour x = 1, l'exposant vaut 0, donc y(1) = 5.</li></ol>
<p><b>L'ordre à respecter sur la copie</b> : d'abord toutes les solutions, avec la lettre C. Ensuite seulement, la condition, pour trouver C. Le TD le demande dans cet ordre.</p>`},
 "c-ed1":{
  "Avec un second membre : le plan en 3 temps":`<p><b>Le mot.</b> Le « second membre », c'est ce qui est à droite du signe =. Dans la leçon d'avant, c'était 0. Maintenant, ce n'est plus 0 : par exemple y′ + 2y = 6.</p>
<p><b>Première idée : trouver une solution, n'importe laquelle.</b> Le plus simple à essayer, c'est un nombre fixe : y = k. Sa dérivée est 0. L'équation devient 0 + 2k = 6, donc k = 3. La fonction y = 3 est <b>une</b> solution. On l'appelle une solution particulière.</p>
<p><b>Deuxième idée : toutes les autres s'obtiennent en ajoutant quelque chose.</b> Si à 3 j'ajoute une fonction qui donne 0 quand on calcule y′ + 2y, le total donnera toujours 6 + 0 = 6. Ces fonctions qui donnent 0, on les connaît : ce sont les solutions de l'équation homogène y′ + 2y = 0, c'est-à-dire C e<sup>−2x</sup>.</p>
<p>Donc toutes les solutions sont y = 3 + C e<sup>−2x</sup>. Vérifions : la dérivée est −2C e<sup>−2x</sup>. Alors y′ + 2y = −2C e<sup>−2x</sup> + 6 + 2C e<sup>−2x</sup> = 6. Les deux morceaux avec C se détruisent, il reste bien 6.</p>
<p><b>Le plan, toujours le même :</b></p>
<ol><li>je résous l'équation avec 0 à droite : C e<sup>−2x</sup> ;</li><li>je trouve <b>une</b> solution de la vraie équation : ici 3 ;</li><li>j'additionne : y = 3 + C e<sup>−2x</sup> ;</li><li>à la fin seulement, la condition initiale donne C.</li></ol>
<p><b>La fin de l'exemple</b>, avec y(0) = 1 : y(0) = 3 + C e<sup>0</sup> = 3 + C. Il faut 3 + C = 1, donc C = −2. Réponse : y = 3 − 2 e<sup>−2x</sup>.</p>
<p><b>L'erreur à éviter.</b> Poser la condition sur C e<sup>−2x</sup> tout seul, avant d'avoir ajouté le 3. On trouverait C = 1, et la réponse serait fausse.</p>`,
  "Trouver une solution particulière : la variation de la constante":`<p><b>À quoi ça sert.</b> Dans l'exemple d'avant, on a deviné la solution particulière (le nombre 3). On ne peut pas toujours deviner. La variation de la constante est une méthode qui la <b>calcule</b>, sans rien deviner.</p>
<p><b>Les deux lettres à avoir sous les yeux.</b> Dans y′ + a y = b : A est une primitive de a (une fonction dont la dérivée est a), et b est le côté droit.</p>
<p><b>Les trois gestes</b>, faits sur y′ + 2y = 6, pour vérifier qu'on retrouve bien 3 :</p>
<ol><li><b>Je multiplie b par e<sup>A</sup>.</b> Ici a = 2, donc A(x) = 2x. Et b = 6. Ça donne 6 e<sup>2x</sup>.</li><li><b>Je cherche une primitive de ce résultat.</b> Une fonction dont la dérivée est 6 e<sup>2x</sup> : c'est 3 e<sup>2x</sup> (sa dérivée est 3 × 2 e<sup>2x</sup>). Je l'appelle c(x).</li><li><b>Je multiplie c par e<sup>−A</sup>.</b> 3 e<sup>2x</sup> × e<sup>−2x</sup> = 3, parce que e<sup>2x</sup> × e<sup>−2x</sup> = 1.</li></ol>
<p>On retrouve la solution particulière 3. La méthode a fait le travail toute seule.</p>
<p><b>Pour ne pas se tromper de signe</b> : <b>+A</b> à l'aller (geste 1), <b>−A</b> au retour (geste 3).</p>
<p><b>D'où vient le nom.</b> Les solutions avec 0 à droite sont C e<sup>−A</sup>, où C est une constante. Ici, on remplace la constante C par une fonction c(x) : on la fait « varier ».</p>
<p>La suite ne change pas : toutes les solutions = cette solution particulière + C e<sup>−A(x)</sup>, puis la condition initiale.</p>
<p>Trois exemples rédigés ligne par ligne, du plus simple au plus dur : <a href="#/calc/p/m-varcst">Méthode : la variation de la constante</a>.</p>`,
  "Le raccourci quand a est une constante":`<p><b>L'idée.</b> Quand a est un simple nombre, on peut souvent aller plus vite que la variation de la constante : on essaie une fonction <b>qui ressemble au côté droit</b>, avec des nombres inconnus, et on règle ces nombres.</p>
<p><b>Exemple 1 : le côté droit est un polynôme.</b> y′ + 2y = 4x.</p>
<ol><li>Le côté droit, 4x, est de la forme « un nombre fois x, plus un nombre ». J'essaie donc y = αx + β, où α et β sont deux nombres à trouver.</li><li>Sa dérivée est α.</li><li>Je remplace : y′ + 2y = α + 2(αx + β) = 2α x + (α + 2β).</li><li>Il faut que ce soit égal à 4x pour tout x. Je compare les deux côtés morceau par morceau : devant x, 2α = 4, donc α = 2. Sans x, α + 2β = 0, donc β = −1.</li><li>Solution particulière : y = 2x − 1. Contrôle : sa dérivée est 2, et 2 + 2(2x − 1) = 4x.</li></ol>
<p><b>Exemple 2 : le côté droit est une exponentielle.</b> y′ + 2y = e<sup>x</sup>. J'essaie y = A e<sup>x</sup> (un nombre fois la même exponentielle). Sa dérivée est A e<sup>x</sup>. Donc y′ + 2y = 3A e<sup>x</sup>. Il faut 3A = 1, donc A = 1/3. Solution particulière : y = (1/3) e<sup>x</sup>.</p>
<p><b>Le tableau à retenir :</b></p>
<ul><li>côté droit = polynôme → j'essaie un polynôme du même degré ;</li><li>côté droit = e<sup>kx</sup> → j'essaie A e<sup>kx</sup> ;</li><li>côté droit = cos x ou sin x → j'essaie α cos x + β sin x (les deux, même si un seul apparaît).</li></ul>
<p><b>Quand le raccourci rate.</b> Si le côté droit est déjà une solution de l'équation avec 0 à droite (par exemple y′ + 2y = e<sup>−2x</sup>), l'essai A e<sup>−2x</sup> donne 0 et pas e<sup>−2x</sup>. Dans ce cas, on essaie A x e<sup>−2x</sup>, ou on prend la variation de la constante, qui marche toujours.</p>`},
 "c2-ed2":{
  "Les trois cas":`<p><b>Une équation d'ordre 2</b> fait intervenir $y″$, la dérivée de la dérivée : $y″ + ay′ + by = 0$, avec $a$ et $b$ des nombres.</p>
<p><b>L'astuce :</b> on essaie $y = e^{rx}$. Alors $y′ = r e^{rx}$ et $y″ = r² e^{rx}$. En remplaçant : $e^{rx}(r² + ar + b) = 0$. Comme $e^{rx}$ n'est jamais nul, il faut $r² + ar + b = 0$ : c'est l'<b>équation caractéristique</b>.</p>
<p>$Δ$ (« delta ») est le discriminant, comme pour les équations du second degré du lycée. Dans les solutions, $C_{1}$ et $C_{2}$ sont deux constantes, qui peuvent valoir n'importe quel réel.</p>
<p><b>Trois cas, selon $Δ = a² − 4b$ :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Équation</th><th>Racines</th><th>Solutions</th></tr></thead><tbody>
<tr><td>$y″ − 5y′ + 6y = 0$</td><td>$r² − 5r + 6 = (r − 2)(r − 3)$ : $2$ et $3$</td><td>$C_{1}e^{2x} + C_{2}e^{3x}$</td></tr>
<tr><td>$y″ + 4y′ + 4y = 0$</td><td>$(r + 2)² = 0$ : $−2$, racine double</td><td>$(C_{1} + C_{2}x)e^{−2x}$</td></tr>
<tr><td>$y″ + 2y′ + 5y = 0$</td><td>$Δ = −16$ : $−1 ± 2i$</td><td>$e^{−x}(C_{1}cos 2x + C_{2}sin 2x)$</td></tr></tbody></table></div>
<p><b>Dans le troisième cas,</b> $Δ$ est négatif : il n'y a pas de racine réelle, et les racines sont des nombres complexes. $i$ est le nombre tel que $i² = −1$ (la leçon sur les complexes le présente en détail). Ces racines s'écrivent $α ± iβ$ : $α = −1$ va dans l'exponentielle, $β = 2$ dans le cosinus et le sinus.</p>`,
  "Deux conditions initiales":`<p><b>Il y a deux constantes</b> $C_{1}$ et $C_{2}$, donc il faut deux conditions pour les trouver : en général $y(0)$ et $y′(0)$.</p>
<p><b>Exemple :</b> $y″ − 5y′ + 6y = 0$ avec $y(0) = 2$ et $y′(0) = 5$.</p>
<ol><li>Les solutions : $y = C_{1}e^{2x} + C_{2}e^{3x}$.</li><li>On dérive <b>avant</b> de remplacer : $y′ = 2C_{1}e^{2x} + 3C_{2}e^{3x}$.</li><li>En $x = 0$ (avec $e⁰ = 1$) : $C_{1} + C_{2} = 2$ et $2C_{1} + 3C_{2} = 5$.</li><li>On résout : de la première, $C_{1} = 2 − C_{2}$ ; dans la seconde, $4 − 2C_{2} + 3C_{2} = 5$, donc $C_{2} = 1$ et $C_{1} = 1$.</li><li>Réponse : $y = e^{2x} + e^{3x}$.</li></ol>
<p><b>Vérification :</b> $y(0) = 1 + 1 = 2$ et $y′(0) = 2 + 3 = 5$.</p>`},
 "c2-ed2-sm":{
  "Le principe et les formes":`<p><b>Même plan qu'à l'ordre 1 :</b> toutes les solutions = les solutions sans second membre + <b>une</b> solution particulière $y_{p}$.</p>
<p><b>On cherche $y_{p}$ de la même forme que le second membre :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Second membre</th><th>On essaie</th></tr></thead><tbody>
<tr><td>une constante</td><td>une constante $c$</td></tr>
<tr><td>un polynôme de degré $n$</td><td>un polynôme de degré $n$</td></tr>
<tr><td>$e^{kx}$</td><td>$B e^{kx}$ ; $B x e^{kx}$ si $k$ est racine ; $B x² e^{kx}$ si racine double (racine de l'équation caractéristique, celle de la leçon d'avant).</td></tr>
<tr><td>$cos(ωx)$ ou $sin(ωx)$</td><td>$α cos(ωx) + β sin(ωx)$</td></tr></tbody></table></div>
<p>Dans la dernière ligne du tableau, $ω$ (« oméga ») est un nombre, comme le $2$ de $cos(2x)$.</p>
<p><b>Exemple</b> avec $y″ − 5y′ + 6y$ (racines $2$ et $3$) :</p>
<ul><li>second membre $12$ : on essaie $y = c$. Ses dérivées sont nulles, donc $6c = 12$ et $c = 2$ ;</li><li>second membre $e^{x}$ : $1$ n'est pas racine, on essaie $B e^{x}$. Comme $y′ = y″ = B e^{x}$ : $B − 5B + 6B = 2B = 1$, donc $B = 1/2$ ;</li><li>second membre $e^{2x}$ : $2$ est racine, il faut essayer $B x e^{2x}$.</li></ul>
<p><b>Ensuite :</b> on remplace dans l'équation et on identifie les coefficients.</p>`},
 "c2-cx-alg":{
  "Calculer avec i":`<p><b>Un nombre complexe</b> s'écrit $z = a + ib$, où $a$ et $b$ sont des réels, et où $i$ est un nombre tel que $i² = −1$. $a$ est la partie réelle, $b$ la partie imaginaire.</p>
<p><b>Deux mots du tableau.</b> Le <b>conjugué</b> de $z = a + ib$ est $a − ib$ : on change le signe devant $i$ ; le cours le note $z̄$. Le <b>module</b> de $z$, noté $|z|$, vaut $√(a² + b²)$ : c'est la distance entre l'origine et le point $(a, b)$.</p>
<p><b>On calcule comme d'habitude, et on remplace $i²$ par $−1$ :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Calcul</th><th>Résultat</th></tr></thead><tbody>
<tr><td>$(3 + 2i) + (1 − i)$</td><td>$4 + i$</td></tr>
<tr><td>$(1 + 2i)(3 − i) = 3 − i + 6i − 2i²$</td><td>$3 + 5i + 2 = 5 + 5i$</td></tr>
<tr><td>conjugué de $3 + 4i$</td><td>$3 − 4i$ (on change le signe de $i$)</td></tr>
<tr><td>$(3 + 4i)(3 − 4i)$</td><td>$9 + 16 = 25$, un réel</td></tr>
<tr><td>module de $3 + 4i$</td><td>$√(9 + 16) = 5$</td></tr></tbody></table></div>
<p><b>Diviser :</b> on multiplie en haut et en bas par le conjugué du bas, qui devient réel.</p>
<p>$(1 + 3i)/(1 − i) = (1 + 3i)(1 + i)/((1 − i)(1 + i)) = (1 + 4i + 3i²)/2 = (−2 + 4i)/2 = −1 + 2i$.</p>`},
 "c2-cx-exp":{
  "La forme exponentielle":`<p><b>Un complexe est un point du plan.</b> Au lieu de donner ses coordonnées $(a, b)$, on peut donner sa distance à l'origine $r$ (le <b>module</b>) et l'angle $θ$ qu'il fait avec l'axe horizontal (l'<b>argument</b>). On écrit $z = r e^{iθ}$.</p>
<p><b>Ce que veut dire $e^{iθ}$.</b> C'est une notation : $e^{iθ} = cos θ + i sin θ$, le point du cercle de rayon $1$ qui fait l'angle $θ$ (« thêta »). Donc $z = r e^{iθ}$ veut dire $z = r(cos θ + i sin θ)$. Par exemple $e^{iπ/2} = cos(π/2) + i sin(π/2) = i$.</p>
<p><b>La méthode :</b> $r = √(a² + b²)$, puis on cherche l'angle dont le cosinus vaut $a/r$ et le sinus $b/r$.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>$z$</th><th>$r$</th><th>$cos θ$, $sin θ$</th><th>Forme exponentielle</th></tr></thead><tbody>
<tr><td>$1 + i$</td><td>$√2$</td><td>$√2/2$, $√2/2$</td><td>$√2 e^{iπ/4}$</td></tr>
<tr><td>$−√3 + i$</td><td>$2$</td><td>$−√3/2$, $1/2$</td><td>$2 e^{i5π/6}$</td></tr>
<tr><td>$−3i$</td><td>$3$</td><td>$0$, $−1$</td><td>$3 e^{−iπ/2}$</td></tr></tbody></table></div>
<p><b>Le conseil :</b> place le point sur un dessin pour savoir dans quel quart du plan est l'angle. L'argument principal est celui qui est entre $−π$ (exclu) et $π$.</p>`,
  "Calculer en forme exponentielle":`<p><b>En forme exponentielle, les calculs deviennent simples :</b></p>
<ul><li><b>produit :</b> on multiplie les modules et on ajoute les arguments. $(2e^{iπ/3})(3e^{iπ/6}) = 6e^{iπ/2} = 6i$ ;</li><li><b>quotient :</b> on divise les modules et on soustrait les arguments. $6e^{iπ/2}/(2e^{iπ/3}) = 3e^{iπ/6}$ ;</li><li><b>puissance :</b> $(r e^{iθ})ⁿ = rⁿ e^{inθ}$. $(√2 e^{iπ/4})⁴ = 4 e^{iπ} = −4$.</li></ul>
<p><b>Vérification de la puissance :</b> $(1 + i)² = 1 + 2i − 1 = 2i$, puis $(2i)² = −4$. Même résultat.</p>
<p><b>Le piège du signe moins :</b> dans $−3e^{iπ/4}$, le module n'est pas $−3$ (un module est positif). Comme $−1 = e^{iπ}$, on écrit $3e^{i(π/4 + π)} = 3e^{i5π/4}$, d'argument principal $5π/4 − 2π = −3π/4$.</p>`},
 "c2-cx-euler":{
  "Moivre":`<p><b>La formule de Moivre :</b> $(cos θ + i sin θ)ⁿ = cos(nθ) + i sin(nθ)$. C'est juste $(e^{iθ})ⁿ = e^{inθ}$, écrit avec cos et sin.</p>
<p><b>À quoi ça sert :</b> retrouver les formules de $cos(nθ)$ et $sin(nθ)$. On développe à gauche, puis on identifie les parties réelles et imaginaires.</p>
<p><b>Exemple avec $n = 2$ :</b> $(cos θ + i sin θ)² = cos²θ + 2i cos θ sin θ − sin²θ$.</p>
<ul><li>partie réelle : $cos 2θ = cos²θ − sin²θ$ ;</li><li>partie imaginaire : $sin 2θ = 2 sin θ cos θ$.</li></ul>
<p>On retrouve les formules de duplication bien connues. Pour $n = 3$, la leçon fait le même calcul avec un cube.</p>`,
  "Euler : linéariser":`<p><b>Les formules d'Euler</b> écrivent cos et sin avec des exponentielles :</p>
<p>$cos θ = (e^{iθ} + e^{−iθ})/2$ et $sin θ = (e^{iθ} − e^{−iθ})/(2i)$.</p>
<p><b>Linéariser</b>, c'est transformer une puissance comme $cos²θ$ en une somme de cosinus sans puissance. Utile pour calculer une primitive.</p>
<p><b>Exemple :</b> $cos²θ$.</p>
<ol><li>On met au carré : $((e^{iθ} + e^{−iθ})/2)² = (e^{2iθ} + 2 + e^{−2iθ})/4$.</li><li>On regroupe : $e^{2iθ} + e^{−2iθ} = 2cos 2θ$.</li><li>Résultat : $cos²θ = (2cos 2θ + 2)/4 = (1 + cos 2θ)/2$.</li></ol>
<p><b>Vérification avec $θ = 0$ :</b> à gauche $cos² 0 = 1$, à droite $(1 + 1)/2 = 1$.</p>`},
 "c2-cx-eq":{
  "Racine carrée d'un complexe":`<p><b>On cherche $δ = x + iy$ tel que $δ² = w$.</b> On utilise trois équations :</p>
<ul><li>$x² − y²$ = la partie réelle de $w$ ;</li><li>$2xy$ = la partie imaginaire de $w$ ;</li><li>$x² + y²$ = le module de $w$.</li></ul>
<p><b>Exemple :</b> $w = 3 + 4i$, de module $√(9 + 16) = 5$.</p>
<ol><li>$x² − y² = 3$ et $x² + y² = 5$. En additionnant : $2x² = 8$, donc $x² = 4$. En soustrayant : $2y² = 2$, donc $y² = 1$.</li><li>$2xy = 4$ est positif : $x$ et $y$ ont le même signe.</li><li>Donc $δ = 2 + i$ ou $δ = −2 − i$.</li></ol>
<p><b>Vérification :</b> $(2 + i)² = 4 + 4i + i² = 3 + 4i$.</p>
<p><b>Il y a toujours deux racines carrées, opposées.</b> Pour un réel négatif c'est direct : les racines de $−9$ sont $3i$ et $−3i$.</p>`,
  "Équation du second degré dans ℂ":`<p>ℂ est l'ensemble des nombres complexes, comme ℝ est celui des réels.</p>
<p><b>Dans ℂ, toute équation $az² + bz + c = 0$ a des solutions,</b> même quand $Δ$ est négatif.</p>
<p><b>La méthode :</b> on calcule $Δ = b² − 4ac$, on cherche $δ$ tel que $δ² = Δ$, puis $z = (−b ± δ)/(2a)$.</p>
<p><b>Exemple :</b> $z² − 2z + 5 = 0$.</p>
<ol><li>$Δ = 4 − 20 = −16$.</li><li>$δ = 4i$, car $(4i)² = −16$.</li><li>$z = (2 ± 4i)/2$, donc $z = 1 + 2i$ ou $z = 1 − 2i$.</li></ol>
<p><b>Vérification avec $1 + 2i$ :</b> $(1 + 2i)² = 1 + 4i − 4 = −3 + 4i$, puis $−3 + 4i − 2(1 + 2i) + 5 = −3 + 4i − 2 − 4i + 5 = 0$.</p>
<p><b>Si $Δ$ est un complexe,</b> on cherche $δ$ avec la méthode de l'écran précédent.</p>`},
 "c2-cx-racn":{
  "La méthode":`<p><b>On cherche les $z$ tels que $zⁿ = w$.</b> On passe en forme exponentielle : $w = R e^{iφ}$ et $z = r e^{iθ}$. Alors $zⁿ = rⁿ e^{inθ}$.</p>
<ul><li>les modules : $rⁿ = R$, donc $r$ est la racine $n$-ième de $R$, le nombre positif dont la puissance $n$ vaut $R$ (pour $R = 16$ et $n = 4$ : $r = 2$, car $2⁴ = 16$) ;</li><li>les arguments : $nθ = φ + 2kπ$, donc $θ = (φ + 2kπ)/n$, pour $k = 0, 1, …, n − 1$.</li></ul>
<p><b>Il y a exactement $n$ solutions</b>, réparties régulièrement sur un cercle.</p>
<p><b>Exemple :</b> $z⁴ = 16$. $16 = 16 e^{i0}$, donc $r = 2$ et $θ = kπ/2$ : les solutions sont $2$, $2i$, $−2$ et $−2i$. Vérification : $(2i)⁴ = 16 i⁴ = 16$.</p>
<p><b>Exemple :</b> $z³ = 8i = 8e^{iπ/2}$. $r = 2$ et $θ = π/6 + 2kπ/3$ : $2e^{iπ/6}$, $2e^{i5π/6}$ et $2e^{−iπ/2} = −2i$. Vérification : $(−2i)³ = −8i³ = 8i$.</p>`}},
pf:{
 "p-types":{
  "OCaml répond un type, puis une valeur":`<p><b>L'image à garder.</b> OCaml est une calculatrice très stricte. Tu lui donnes un calcul (on dit une <b>expression</b>), terminé par <code>;;</code>. Il répond deux choses, toujours dans cet ordre : la <b>sorte</b> du résultat, puis le <b>résultat</b>.</p>
${C(`# 7 / 3;;
- : int = 2`)}
<p>Ça se lit : « le résultat est de la sorte <code>int</code> (un entier), et il vaut 2 ». La sorte s'appelle le <b>type</b>, le résultat s'appelle la <b>valeur</b>.</p>
<p><b>Les quatre types du début :</b></p>
<ul><li><code>int</code> : un entier, comme 3 ou -7 ;</li><li><code>float</code> : un nombre à virgule, écrit avec un point, comme 2.5 ;</li><li><code>bool</code> : vrai ou faux, écrits <code>true</code> et <code>false</code> ;</li><li><code>string</code> : du texte entre guillemets, comme "bonjour".</li></ul>
<p><b>Pourquoi « stricte ».</b> Avant de calculer, OCaml vérifie que chaque opération reçoit le bon type. Si ce n'est pas le cas, il refuse tout de suite : c'est une <b>erreur de type</b>. Il n'y a alors ni type ni valeur.</p>
<p>Exemple : <code>2.3 + 3.1</code> est refusé. Le signe <code>+</code> est réservé aux entiers ; pour les nombres à virgule, il faut <code>+.</code> avec un point.</p>
<p><b>Ne pas confondre « erreur » et « false ».</b> <code>not true</code> a une valeur : <code>false</code>. Mais <code>not 1</code> est une erreur : on ne peut pas dire « le contraire de 1 ».</p>
<p><b>Au contrôle</b>, pour chaque expression, on attend : son type et sa valeur, ou bien le mot « erreur » avec la raison.</p>`,
  "Chaque expression a un type":`<p><b>Chaque type a ses propres opérations.</b> On ne les mélange jamais.</p>
<ul><li><b>int</b> (entiers) : <code>+ - * / mod</code>. Attention, <code>/</code> est la division <b>entière</b> : <code>7 / 3</code> vaut 2 (« 3 rentre 2 fois dans 7 »). <code>7 mod 3</code> vaut 1 (« il reste 1 »).</li><li><b>float</b> (à virgule) : les mêmes signes suivis d'un point, <code>+. -. *. /.</code> Et un nombre à virgule s'écrit avec un point : <code>2</code> est un int, <code>2.</code> est un float.</li><li><b>bool</b> : <code>not</code> (le contraire), <code>&amp;&amp;</code> (et), <code>||</code> (ou).</li><li><b>string</b> : <code>^</code> colle deux textes. <code>"au" ^ "to"</code> vaut <code>"auto"</code>.</li></ul>
<p><b>Les comparaisons</b> (<code>=</code>, <code>&lt;&gt;</code> pour « différent », <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>) donnent toujours un <code>bool</code>. Les deux côtés doivent être du même type : <code>4 = 4.0</code> est une erreur, car 4 est un int et 4.0 un float.</p>
<p><b>Passer d'un type à l'autre.</b> <code>float_of_int 2</code> vaut <code>2.</code> ; <code>int_of_float 4.7</code> vaut 4 (il coupe ce qui est après la virgule).</p>
<p><b>Trouver le type d'une expression, pas à pas.</b> On part de l'intérieur. Exemple : <code>float_of_int (7 / 2) +. 0.5</code>.</p>
<ol><li><code>7 / 2</code> : deux entiers et <code>/</code>, donc un int. Il vaut 3.</li><li><code>float_of_int 3</code> : un float. Il vaut <code>3.</code></li><li><code>3. +. 0.5</code> : deux floats et <code>+.</code>, donc un float. Il vaut 3.5.</li></ol>
<p>Réponse : type <code>float</code>, valeur 3.5.</p>
<p><b>Une règle de lecture.</b> Une fonction s'applique avant les opérations : <code>int_of_float 2.5 + 1</code> se lit <code>(int_of_float 2.5) + 1</code>, c'est-à-dire 2 + 1 = 3.</p>`},
 "p-iflet":{
  "if est une expression, let donne un nom":`<p><b>if calcule une valeur.</b> En OCaml, <code>if</code> n'est pas un ordre, c'est un calcul qui a un résultat.</p>
${C(`if 1 < 2 then 3 + 1 else 5 / 2`)}
<p>On lit : « si 1 &lt; 2, le résultat est 3 + 1, sinon c'est 5 / 2 ». Comme 1 &lt; 2 est vrai, l'expression vaut 4.</p>
<p>Deux règles en découlent :</p>
<ul><li>ce qui suit <code>if</code> doit être un <code>bool</code> ;</li><li>les deux résultats possibles (après <code>then</code> et après <code>else</code>) doivent avoir <b>le même type</b>, sinon OCaml ne saurait pas dire le type du tout. Et le <code>else</code> est obligatoire.</li></ul>
<p><b>let … in … donne un nom à une valeur, le temps d'un calcul.</b></p>
${C(`let x = 5 in x * x`)}
<p>On lit : « appelons x le nombre 5, dans le calcul x * x ». Résultat : 25. Le nom x n'existe que dans la partie après <code>in</code>.</p>
<p><b>Deux let à la suite</b> : le second voit le premier.</p>
${C(`let a = 5 in let b = a + 1 in a + b`)}
<p>a vaut 5, puis b vaut 5 + 1 = 6, puis a + b vaut 11.</p>
<p><b>Avec and</b>, les deux noms sont créés en même temps : l'un ne connaît pas l'autre. <code>let a = 2 and b = 5 in a + 2 * b</code> vaut 2 + 10 = 12. Mais <code>let a = 5 and b = a + 1 in a + b</code> est une erreur : au moment de calculer b, le nom a n'existe pas encore.</p>
<p><b>Les commentaires</b> s'écrivent entre <code>(*</code> et <code>*)</code> : OCaml ne les lit pas.</p>`},
 "p-fonctions":{
  "Définir une fonction, puis l'appeler":`<p><b>Une fonction est une machine</b> : on lui donne une valeur, elle en rend une autre. En maths, on écrit f(x) = x + 1. En OCaml :</p>
${C(`let f : int -> int = function
  x -> x + 1`)}
<p><b>Lecture mot par mot :</b></p>
<ul><li><code>let f</code> : je crée quelque chose qui s'appelle f ;</li><li><code>: int -> int</code> : c'est une fonction qui prend un int et rend un int. Cette partie s'appelle la <b>signature</b> ;</li><li><code>= function x -> x + 1</code> : la règle. « Quand on me donne x, je rends x + 1. »</li></ul>
<p><b>L'appeler</b> : on écrit son nom, un espace, puis la valeur. <code>f 3</code> vaut 4.</p>
<p><b>Le piège des parenthèses.</b> <code>f 2 + 3</code> se lit <code>(f 2) + 3</code>, donc 3 + 3 = 6. Pour donner 2 + 3 à la fonction, il faut écrire <code>f (2 + 3)</code>, qui vaut 6 aussi ici, mais ce n'est pas le même calcul : c'est f 5.</p>
<p><b>Un deuxième exemple</b>, qui rend un bool :</p>
${C(`let estPositif : int -> bool = function
  x -> x > 0`)}
<p><code>estPositif 4</code> vaut <code>true</code>, <code>estPositif (-2)</code> vaut <code>false</code>.</p>
<p><b>Sur la copie</b>, une fonction s'écrit toujours avec ces trois morceaux : le nom, la signature, la règle.</p>`,
  "Deux façons d'écrire une fonction à deux paramètres":`<p>Pour une fonction qui a besoin de deux valeurs (par exemple « le plus grand de deux entiers »), le cours a deux écritures. Il faut savoir lire et écrire les deux.</p>
<p><b>Écriture 1 : on donne les deux valeurs ensemble, dans un couple.</b> Un couple s'écrit <code>(3, 7)</code>, et son type se note avec une étoile : <code>int * int</code>.</p>
${C(`let maxi_a : int * int -> int = function
  (x, y) -> if x > y then x else y`)}
<p>Appel : <code>maxi_a (3, 7)</code>, qui vaut 7.</p>
<p><b>Écriture 2 : on donne les deux valeurs l'une après l'autre.</b></p>
${C(`let maxi_b : int -> int -> int = fun
  x y -> if x > y then x else y`)}
<p>Appel : <code>maxi_b 3 7</code>, qui vaut 7. Dans <code>int -> int -> int</code>, les deux premiers <code>int</code> sont les deux paramètres, le dernier est le résultat.</p>
<p><b>Les trois différences à repérer :</b></p>
<ul><li>la signature : une étoile (<code>int * int -> int</code>) ou deux flèches (<code>int -> int -> int</code>) ;</li><li>le mot : <code>function (x, y)</code> ou <code>fun x y</code> ;</li><li>l'appel : <code>maxi_a (3, 7)</code> avec parenthèses et virgule, ou <code>maxi_b 3 7</code> avec des espaces.</li></ul>
<p><b>Au contrôle</b>, l'énoncé donne la signature : c'est elle qui dit quelle écriture utiliser.</p>`,
  "Trouver une signature":`<p><b>La question type</b> : on te donne le corps d'une fonction, tu dois dire sa signature. La méthode : regarder ce que la fonction <b>fait</b> de chaque paramètre. Chaque opération trahit un type.</p>
<ul><li><code>x + 1</code>, <code>x * 2</code>, <code>x mod 2</code> : x est un <code>int</code> ;</li><li><code>x +. 1.</code> : x est un <code>float</code> ;</li><li><code>if y then …</code> ou <code>not y</code> : y est un <code>bool</code> ;</li><li><code>s ^ "a"</code> : s est une <code>string</code> ;</li><li><code>List.hd li</code> : li est une liste.</li></ul>
<p>Le type du résultat, c'est le type de ce que la fonction rend à la fin.</p>
<p><b>Exemple 1.</b> <code>function x -> if x > 0 then x + 1 else 0</code></p>
<ol><li>x est comparé à 0 et on calcule x + 1 : x est un int.</li><li>La fonction rend x + 1 ou 0 : un int.</li><li>Signature : <code>int -> int</code>.</li></ol>
<p><b>Exemple 2.</b> <code>fun x y -> if y then x +. 1. else x</code></p>
<ol><li>y est après <code>if</code> : c'est un bool.</li><li>x est utilisé avec <code>+.</code> : c'est un float.</li><li>La fonction rend x +. 1. ou x : un float.</li><li>Signature, dans l'ordre des paramètres : <code>float -> bool -> float</code>.</li></ol>`},
 "p-rec":{
  "La méthode du TD":`<p><b>Une fonction récursive</b> est une fonction qui s'appelle elle-même, sur un cas plus petit. On l'annonce avec <code>let rec</code>.</p>
<p><b>L'exemple de base : som n = 0 + 1 + 2 + … + n.</b> Pour calculer som 3, on se dit : « c'est 3, plus la somme jusqu'à 2 ».</p>
<ul><li>som 3 = 3 + som 2</li><li>som 2 = 2 + som 1</li><li>som 1 = 1 + som 0</li><li>som 0 = 0 : là, on connaît la réponse sans calcul. C'est le <b>cas de base</b>, celui qui arrête tout.</li></ul>
<p>Puis on remonte : som 1 = 1, som 2 = 3, som 3 = 6.</p>
<p><b>Les deux questions à se poser, toujours les mêmes :</b></p>
<ol><li>Quel est le cas le plus petit, et que vaut la fonction pour lui ? (ici : n = 0, réponse 0)</li><li>Si je connais déjà le résultat pour n - 1, comment j'obtiens celui pour n ? (ici : j'ajoute n)</li></ol>
<p><b>L'écriture :</b></p>
${C(`let rec som : int -> int = function
  n -> if n = 0 then 0 else n + som (n - 1)`)}
<p><b>Les trois erreurs classiques :</b></p>
<ul><li>oublier <code>rec</code> : OCaml ne connaît pas encore som à l'intérieur de sa propre définition ;</li><li>oublier les parenthèses : <code>som n - 1</code> se lit <code>(som n) - 1</code>, et la fonction se rappelle sans jamais diminuer n ;</li><li>oublier le cas de base : la fonction ne s'arrête jamais.</li></ul>`},
 "p-chiffres":{
  "Deux schémas qui reviennent":`<p><b>Schéma 1 : travailler sur les chiffres d'un entier.</b> Deux opérations suffisent :</p>
<ul><li><code>n mod 10</code> donne le <b>dernier chiffre</b> : 472 mod 10 vaut 2 ;</li><li><code>n / 10</code> donne le nombre <b>sans son dernier chiffre</b> : 472 / 10 vaut 47.</li></ul>
<p>On traite le dernier chiffre, puis on recommence avec le reste. On s'arrête quand il ne reste qu'un chiffre : <code>n &lt; 10</code>.</p>
<p>Exemple, la somme des chiffres :</p>
${C(`let rec somChiffres : int -> int = function
  n -> if n < 10 then n else n mod 10 + somChiffres (n / 10)`)}
<p>somChiffres 472 = 2 + somChiffres 47 = 2 + 7 + somChiffres 4 = 2 + 7 + 4 = 13.</p>
<p><b>Schéma 2 : essayer tous les entiers de n jusqu'à 1.</b> « i divise n » veut dire que la division tombe juste, donc que le reste vaut 0 : <code>n mod i = 0</code>. Exemples : 12 mod 4 vaut 0, donc 4 divise 12 ; 12 mod 5 vaut 2, donc 5 ne divise pas 12.</p>
<p>Pour compter les diviseurs de n, on ajoute un deuxième paramètre i, qui part de n et descend de 1 à chaque appel. Quand i arrive à 0, c'est fini.</p>
${C(`let rec nbDiv : int -> int -> int = fun
  n i -> if i = 0 then 0
         else (if n mod i = 0 then 1 else 0) + nbDiv n (i - 1)`)}
<p><code>nbDiv 6 6</code> essaie 6, 5, 4, 3, 2, 1 : quatre d'entre eux divisent 6 (6, 3, 2 et 1). Résultat : 4.</p>
<p><b>Choisir la valeur du cas de base.</b> Elle ne doit rien changer au calcul : 0 quand on additionne ou qu'on compte, 1 quand on multiplie.</p>`},
 "p-listes":{
  "Construire et défaire une liste":`<p><b>Une liste</b> est une suite de valeurs du même type, dans un ordre. Elle s'écrit entre crochets, avec des <b>points-virgules</b> : <code>[2; 3; 2; 4]</code>. Son type est <code>int list</code>. La liste vide s'écrit <code>[]</code>.</p>
<p><b>Trois outils, et c'est tout :</b></p>
<ul><li><code>x :: li</code> fabrique une liste en mettant x <b>devant</b> li. <code>1 :: [2; 3]</code> vaut <code>[1; 2; 3]</code>.</li><li><code>List.hd li</code> donne le <b>premier élément</b>. <code>List.hd [2; 3; 4]</code> vaut 2.</li><li><code>List.tl li</code> donne la liste <b>sans son premier élément</b>. <code>List.tl [2; 3; 4]</code> vaut <code>[3; 4]</code>.</li></ul>
<p><b>Ce qu'il faut bien voir :</b> <code>List.hd</code> rend <b>un élément</b>, <code>List.tl</code> rend <b>une liste</b>. Par exemple <code>List.tl [5]</code> vaut <code>[]</code>, et pas « rien ».</p>
<p><b>Combiner les deux.</b> Le deuxième élément d'une liste : on enlève le premier, puis on prend le premier de ce qui reste. <code>List.hd (List.tl [2; 3; 4])</code> vaut 3.</p>
<p><b>Deux pièges :</b></p>
<ul><li>la virgule : <code>[2, 3]</code> n'est pas une liste de deux entiers, c'est une liste qui contient <b>un seul couple</b> ;</li><li>la liste vide : <code>List.hd []</code> et <code>List.tl []</code> provoquent une erreur pendant le calcul. Il faut donc tester avant.</li></ul>
<p><b>Un test utile</b> : <code>List.tl li = []</code> est vrai quand li n'a qu'un seul élément.</p>`},
 "p-schema":{
  "Le schéma du cours":`<p><b>L'idée.</b> Une liste non vide, c'est un premier élément, plus une liste plus courte (le reste). Pour faire un calcul sur toute la liste, on s'occupe du premier élément, et on demande à la fonction elle-même de s'occuper du reste.</p>
<p><b>Exemple : la somme des éléments.</b></p>
${C(`let rec somme : int list -> int = function
  li -> if li = [] then 0
        else List.hd li + somme (List.tl li)`)}
<p><b>On déroule sur [2; 5; 1] :</b></p>
<ul><li>somme [2; 5; 1] = 2 + somme [5; 1]</li><li>somme [5; 1] = 5 + somme [1]</li><li>somme [1] = 1 + somme []</li><li>somme [] = 0 : le cas de base.</li></ul>
<p>On remonte : 1 + 0 = 1, puis 5 + 1 = 6, puis 2 + 6 = 8.</p>
<p><b>Pourquoi ça s'arrête.</b> À chaque appel, la liste perd un élément. Elle finit forcément par être vide.</p>
<p><b>Le schéma a trois trous</b>, et presque toutes les fonctions sur les listes du TD se font en les remplissant :</p>
<ol><li>la signature (que rend la fonction : un int, un bool, une liste ?) ;</li><li>la valeur pour la liste vide ;</li><li>la façon de combiner <code>List.hd li</code> avec le résultat sur <code>List.tl li</code>.</li></ol>`},
 "p-fabriquer":{
  "Ce que dit l'énoncé, ce que tu écris":`<p>Tout se joue dans les deux trous du schéma : la valeur pour la liste vide, et la combinaison. Voici comment les remplir selon ce que demande l'énoncé, avec le même test à chaque fois : « l'élément est pair », qui s'écrit <code>List.hd li mod 2 = 0</code>.</p>
<p><b>1. Compter</b> (combien d'éléments pairs ?). Liste vide : 0. Sinon : 1 ou 0 pour le premier, plus le compte du reste.</p>
${C(`let rec nbPairs : int list -> int = function
  li -> if li = [] then 0
        else (if List.hd li mod 2 = 0 then 1 else 0) + nbPairs (List.tl li)`)}
<p><b>2. « Tous »</b> (tous les éléments sont-ils pairs ?). Liste vide : <code>true</code>. Sinon : le premier est pair <b>et</b> tous les autres aussi.</p>
${C(`let rec tousPairs : int list -> bool = function
  li -> if li = [] then true
        else List.hd li mod 2 = 0 && tousPairs (List.tl li)`)}
<p><b>3. « Il existe »</b> (y a-t-il au moins un pair ?). Liste vide : <code>false</code>. Sinon : le premier est pair <b>ou</b> il y en a un dans le reste.</p>
${C(`let rec exiPairs : int list -> bool = function
  li -> if li = [] then false
        else List.hd li mod 2 = 0 || exiPairs (List.tl li)`)}
<p><b>4. Garder certains éléments</b> (la liste des pairs). Liste vide : <code>[]</code>. Sinon : si le premier est pair, on le remet devant le résultat du reste ; sinon on rend seulement le résultat du reste.</p>
${C(`let rec liPairs : int list -> int list = function
  li -> if li = [] then []
        else if List.hd li mod 2 = 0 then List.hd li :: liPairs (List.tl li)
        else liPairs (List.tl li)`)}
<p><b>Comment retenir la valeur de la liste vide.</b> C'est celle qui ne change rien à l'opération : 0 pour <code>+</code>, <code>true</code> pour <code>&amp;&amp;</code>, <code>false</code> pour <code>||</code>, <code>[]</code> pour <code>::</code>.</p>`,
  "Tester une liste":`<p><b>Le problème.</b> Pour certaines questions, la liste vide n'a pas de réponse : quel est le plus grand élément d'une liste vide ? Son dernier élément ? Il n'y en a pas.</p>
<p><b>La solution.</b> L'énoncé précise alors « liste non vide », et le cas de base devient <b>la liste à un seul élément</b>. On la reconnaît avec le test <code>List.tl li = []</code> (« une fois le premier enlevé, il ne reste rien »).</p>
<p><b>Exemple 1 : le dernier élément.</b> S'il n'y a qu'un élément, c'est lui. Sinon, c'est le dernier du reste.</p>
${C(`let rec derListe : int list -> int = function
  li -> if List.tl li = [] then List.hd li
        else derListe (List.tl li)`)}
<p>derListe [4; 9; 2] = derListe [9; 2] = derListe [2] = 2.</p>
<p><b>Exemple 2 : le plus grand élément.</b> S'il n'y a qu'un élément, c'est lui. Sinon, on calcule le plus grand du reste, on l'appelle m, et on le compare au premier.</p>
${C(`let rec maxListe : int list -> int = function
  li -> if List.tl li = [] then List.hd li
        else let m = maxListe (List.tl li) in
             if List.hd li > m then List.hd li else m`)}
<p>maxListe [4; 9; 2] : le plus grand de [9; 2] est 9 ; on compare 4 et 9 ; résultat 9.</p>`},
 "p-match":{
  "match … with":`<p><b>match, c'est un aiguillage.</b> On compare une valeur à plusieurs motifs, de haut en bas, et on prend le <b>premier</b> qui correspond.</p>
${C(`let signe n = match n with
  | 0 -> "nul"
  | n when n > 0 -> "positif"
  | _ -> "négatif"`)}
<p><b>L'écriture let signe n = …</b> est une façon plus courte d'écrire let signe = function n -> … : le paramètre n est écrit juste après le nom de la fonction.</p>
<ul><li>signe 0 : le premier motif, 0, correspond : "nul".</li><li>signe 5 : 0 ne correspond pas ; le deuxième, avec la condition when n &gt; 0, oui : "positif".</li><li>signe (-3) : seul le dernier, _, correspond. _ attrape tout : "négatif".</li></ul>
<p><b>Sur une liste,</b> le motif x :: r donne un nom à la tête et à la queue. Pour [4; 7] : x = 4 et r = [7].</p>
<p><b>L'ordre compte :</b> si _ était écrit en premier, il attraperait tout, et les autres cas ne serviraient jamais.</p>`},
 "p2-match":{
  "Un cas par forme":`<p><b>Une liste a toujours une de ces deux formes :</b> soit vide, [] ; soit une tête suivie d'une queue, e :: tl. Avec le filtrage, on écrit un cas pour chacune. Plus besoin de List.hd ni de List.tl.</p>
${C(`let rec somme = function
  | [] -> 0
  | e :: tl -> e + somme tl`)}
<p><b>Ce que calcule somme [3; 4] :</b></p>
${C(`somme [3; 4]
= 3 + somme [4]          (e = 3, tl = [4])
= 3 + 4 + somme []       (e = 4, tl = [])
= 3 + 4 + 0
= 7`)}
<p><b>La même fonction sans filtrage :</b> if l = [] then 0 else List.hd l + somme (List.tl l). Le filtrage fait la même chose, en plus court : il teste la forme et donne les noms en même temps.</p>
<p><b>function ou match :</b> function filtre directement le paramètre (sans lui donner de nom) ; match l with filtre une valeur qu'on a nommée.</p>`,
  "Motifs utiles":`<p><b>Les motifs qui reviennent :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Motif</th><th>Correspond à</th><th>Exemple</th></tr></thead><tbody>
<tr><td>[x]</td><td>une liste d'exactement un élément</td><td>[5] : x = 5</td></tr>
<tr><td>x :: y :: tl</td><td>au moins deux éléments</td><td>[1; 2; 3] : x = 1, y = 2, tl = [3]</td></tr>
<tr><td>(a, b) :: tl</td><td>une liste de couples</td><td>[(1, "un")] : a = 1, b = "un", tl = []</td></tr>
<tr><td>e :: tl when e &gt; 0</td><td>une tête positive</td><td>[3; 1] oui, [-2] non</td></tr>
<tr><td>e :: tl as l</td><td>comme e :: tl, et l est toute la liste</td><td></td></tr></tbody></table></div>
<p><b>Exemple : le dernier élément d'une liste.</b></p>
${C(`let rec dernier = function
  | [] -> failwith "vide"
  | [x] -> x
  | _ :: tl -> dernier tl`)}
<p>dernier [4; 8; 2] : ni vide ni un seul élément, donc dernier [8; 2], puis dernier [2], qui correspond à [x] : 2.</p>
<p>failwith "vide" arrête le calcul avec le message « vide » : il n'y a pas de dernier élément dans une liste vide. La leçon sur les exceptions y revient.</p>`},
 "p2-curry":{
  "Curryfiée ou pas":`<p><b>Deux façons d'écrire une fonction à deux paramètres :</b></p>
${C(`let aire l h = l * h          (* int -> int -> int *)
let aire2 (l, h) = l * h      (* int * int -> int *)`)}
<ul><li>aire est <b>curryfiée</b> : elle prend l, puis h, séparés par des espaces. Appel : aire 3 4.</li><li>aire2 prend <b>un seul</b> paramètre, un couple. Appel : aire2 (3, 4).</li></ul>
<p><b>Lire le type :</b> int -> int -> int se lit « reçoit un int, puis un int, rend un int ». int * int -> int se lit « reçoit un couple de deux int, rend un int ».</p>
<p><b>Les sujets de janvier demandent la forme curryfiée.</b></p>`,
  "fun et application partielle":`<p><b>L'application partielle :</b> une fonction curryfiée peut recevoir ses paramètres un par un. Si on ne lui donne que le premier, on obtient une nouvelle fonction qui attend le suivant.</p>
${C(`let aire l h = l * h
let triple = aire 3      (* int -> int : attend h *)
triple 5                 (* 15 *)`)}
<p><b>fun fabrique une fonction sans lui donner de nom :</b></p>
${C(`(fun x -> x * x) 4                  (* 16 *)
List.map (fun x -> x * x) [1; 2; 3]  (* [1; 4; 9] *)`)}
<p>C'est pratique pour passer une petite fonction à une autre, comme ici à List.map, qui applique la fonction à chaque élément de la liste (la leçon sur les itérateurs la détaille).</p>
<p><b>Les deux écritures sont les mêmes :</b> let f x y = … et let f = fun x y -> ….</p>`},
 "p2-poly":{
  "Les 'a":`<p><b>'a se lit « alpha »</b> et veut dire « n'importe quel type ». OCaml l'écrit quand rien n'oblige une valeur à être d'un type précis : la fonction marche alors pour tous les types. S'il faut un deuxième type quelconque, peut-être différent du premier, OCaml écrit 'b (« bêta »), puis 'c…</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Fonction</th><th>Type</th><th>Pourquoi</th></tr></thead><tbody>
<tr><td>let premier (a, b) = a</td><td>'a * 'b -> 'a</td><td>a et b peuvent être de types différents ; on rend a</td></tr>
<tr><td>let double l = l @ l</td><td>'a list -> 'a list</td><td>@ colle deux listes, sans regarder leurs éléments</td></tr>
<tr><td>let f x y = if x then [y] else []</td><td>bool -> 'a -> 'a list</td><td>if x force x : bool ; y n'est contraint par rien</td></tr></tbody></table></div>
<p><b>Exemples d'appels :</b> premier (3, "x") vaut 3 ; premier ("x", true) vaut "x". La même fonction marche avec des types différents.</p>
<p><b>La méthode :</b> un type inconnu par paramètre, puis chaque opération ajoute une contrainte : + force int, if force bool, :: force « même type que les éléments de la liste ». Ce qui n'est contraint par rien reste un 'a.</p>`},
 "p2-somme":{
  "Définir et construire":`<p><b>Un type somme</b> dit qu'une valeur est <b>soit</b> d'une forme, <b>soit</b> d'une autre. Chaque forme a un nom qui commence par une majuscule : un <b>constructeur</b>.</p>
${C(`type forme =
  | Cercle of float          (* le rayon *)
  | Rect of float * float    (* largeur, hauteur *)

let c = Cercle 2.
let r = Rect (3., 4.)`)}
<p><b>of</b> dit ce que le constructeur transporte : un float pour Cercle, un couple de float pour Rect.</p>
<p><b>Un type sans données</b> s'écrit sans of : type jour = Lundi | Mardi | Mercredi.</p>`,
  "Filtrer":`<p><b>Pour utiliser une valeur d'un type somme,</b> on filtre : un cas par constructeur, et le motif donne un nom aux données.</p>
${C(`let aire = function
  | Cercle r -> 3.14 *. r *. r
  | Rect (l, h) -> l *. h`)}
<ul><li>aire (Rect (3., 4.)) : le motif Rect (l, h) donne l = 3. et h = 4., donc 12.</li><li>aire (Cercle 1.) : r = 1., donc 3.14.</li></ul>
<p><b>Les motifs s'emboîtent</b> avec ceux des listes :</p>
${C(`let rec nb_cercles = function
  | [] -> 0
  | Cercle _ :: tl -> 1 + nb_cercles tl
  | Rect _ :: tl -> nb_cercles tl`)}
<p>nb_cercles [Cercle 1.; Rect (2., 3.); Cercle 5.] vaut 2.</p>`},
 "p2-rectype":{
  "Une liste maison":`<p><b>Un type peut se contenir lui-même :</b> c'est comme ça qu'on fabrique des listes ou des arbres.</p>
${C(`type ma_liste = Vide | Cons of int * ma_liste`)}
<p>La liste [1; 2] s'écrit alors Cons (1, Cons (2, Vide)) : 1 devant le reste, qui est 2 devant la liste vide.</p>
<p><b>Les fonctions s'écrivent comme sur les vraies listes :</b> Vide joue le rôle de [], et Cons (x, r) celui de x :: r.</p>
${C(`let rec somme = function
  | Vide -> 0
  | Cons (x, r) -> x + somme r`)}
<p>somme (Cons (1, Cons (2, Vide))) = 1 + 2 + 0 = 3.</p>
<p><b>Un arbre,</b> c'est la même idée avec deux sous-arbres : type arbre = Feuille | Noeud of int * arbre * arbre.</p>`},
 "p2-record":{
  "Champs nommés":`<p><b>Un enregistrement</b> regroupe plusieurs valeurs, chacune avec un nom : comme une fiche.</p>
${C(`type etudiant = {nom : string; note : float}

let e = {nom = "Léa"; note = 14.5}
e.note                       (* 14.5 *)
let e2 = {e with note = 16.}`)}
<ul><li>dans le type, on écrit champ : type ; dans la valeur, champ = valeur ;</li><li>e.note lit le champ note ;</li><li>{e with note = 16.} fabrique une <b>copie</b> de e où seule la note change. e lui-même ne change pas : il vaut toujours 14.5.</li></ul>`},
 "p2-exc":{
  "Lever une exception":`<p><b>Une exception arrête le calcul</b> quand quelque chose ne va pas, avec un message.</p>
${C(`let div a b =
  if b = 0 then failwith "division par zéro"
  else a / b`)}
<ul><li>div 7 2 vaut 3 : aucun problème.</li><li>div 7 0 lève l'exception Failure "division par zéro" : le calcul s'arrête là.</li></ul>
<p><b>Les exceptions toutes prêtes :</b> failwith "…" lève Failure, invalid_arg "…" lève Invalid_argument. OCaml lève aussi Not_found, Division_by_zero ou Match_failure.</p>
<p><b>Sa propre exception :</b></p>
${C(`exception Trop_grand of int
let verifie x = if x > 100 then raise (Trop_grand x) else x`)}
<p>verifie 150 lève Trop_grand 150. Le nom commence par une majuscule, et of dit ce qu'elle transporte.</p>`,
  "Rattraper avec try … with":`<p><b>try … with rattrape une exception</b> pour donner une réponse à la place.</p>
${C(`try div 7 0 with Failure _ -> 0     (* 0 *)
try div 7 2 with Failure _ -> 0     (* 3 *)`)}
<ul><li>Dans le premier cas, div 7 0 lève Failure : le with la rattrape et donne 0.</li><li>Dans le second, rien n'est levé : le try donne simplement le résultat, 3.</li></ul>
<p><b>Si l'exception ne correspond à aucun cas du with,</b> elle n'est pas rattrapée : elle continue et arrête le programme.</p>`},
 "p2-ordre-sup":{
  "Une fonction en paramètre":`<p><b>En OCaml, une fonction peut recevoir une autre fonction.</b></p>
${C(`let deux_fois f x = f (f x)
deux_fois (fun x -> x + 3) 10    (* 16 *)`)}
<p>deux_fois applique f deux fois : 10 + 3 = 13, puis 13 + 3 = 16.</p>
<p><b>my_map applique une fonction à chaque élément :</b></p>
${C(`my_map (fun x -> x + 1) [5; 6]
= (5 + 1) :: my_map (fun x -> x + 1) [6]
= 6 :: (6 + 1) :: my_map (fun x -> x + 1) []
= 6 :: 7 :: []
= [6; 7]`)}
<p><b>L'intérêt :</b> le parcours de la liste est écrit une seule fois. C'est la fonction passée en paramètre qui décide quoi faire de chaque élément.</p>`},
 "p2-iter":{
  "Les itérateurs":`<p><b>OCaml a des fonctions toutes prêtes pour parcourir une liste.</b> On leur donne une fonction et une liste.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Appel</th><th>Résultat</th><th>Ce que ça fait</th></tr></thead><tbody>
<tr><td>List.map (fun x -> x * 10) [1; 2]</td><td>[10; 20]</td><td>transforme chaque élément</td></tr>
<tr><td>List.filter (fun x -> x mod 2 = 0) [1; 2; 3; 4]</td><td>[2; 4]</td><td>garde ceux qui vérifient le test</td></tr>
<tr><td>List.for_all (fun x -> x &gt; 0) [3; -1]</td><td>false</td><td>tous vérifient-ils le test ?</td></tr>
<tr><td>List.exists (fun x -> x &gt; 0) [3; -1]</td><td>true</td><td>au moins un vérifie-t-il le test ?</td></tr></tbody></table></div>
<p>Elles évitent d'écrire soi-même la récursion à chaque fois.</p>`,
  "fold_left et fold_right":`<p><b>fold réduit une liste à une seule valeur</b>, en l'accumulant élément par élément. On donne une valeur de départ et une fonction qui dit comment un élément change l'accumulateur.</p>
<p><b>fold_left parcourt de gauche à droite.</b> La fonction reçoit (accumulateur, élément).</p>
${C(`List.fold_left (fun acc e -> acc * e) 1 [2; 3; 4]
= ((1 * 2) * 3) * 4
= 24`)}
<p><b>fold_right part de la droite.</b> La fonction reçoit (élément, accumulateur), et la liste vient avant la valeur de départ.</p>
${C(`List.fold_right (fun e acc -> e + acc) [2; 3; 4] 0
= 2 + (3 + (4 + 0))
= 9`)}
<p><b>La méthode :</b> la valeur de départ est le résultat pour la liste vide (1 pour un produit, 0 pour une somme, [] pour une liste).</p>`},
 "p2-terminal":{
  "Appel terminal, accumulateur":`<p><b>Le problème :</b> dans la somme récursive habituelle, chaque appel laisse une addition en attente.</p>
${C(`somme [1; 2; 3] = 1 + (2 + (3 + 0))`)}
<p>Les additions attendent que les appels du dessous aient fini. Avec une très longue liste, la mémoire déborde.</p>
<p><b>La solution : un accumulateur</b>, qui porte le résultat au fur et à mesure.</p>
${C(`let rec somme_acc l acc = match l with
  | [] -> acc
  | e :: tl -> somme_acc tl (acc + e)

somme_acc [1; 2; 3] 0
-> somme_acc [2; 3] 1
-> somme_acc [3] 3
-> somme_acc [] 6
-> 6`)}
<p>Ici l'appel récursif est la <b>toute dernière</b> opération : rien n'attend. On dit qu'il est <b>terminal</b>.</p>
<p><b>La valeur de départ</b> de l'accumulateur est celle du cas de base : 0 pour une somme, 1 pour un produit, [] pour une liste.</p>`}},
lin:{
 "l-repere":{
  "Un repère, deux nombres":`<p><b>À quoi sert un repère.</b> À donner une <b>adresse</b> à chaque point du plan, avec deux nombres.</p>
<p><b>De quoi il est fait :</b> un point de départ O (l'origine) et deux flèches ${v("i")} et ${v("j")} qui donnent deux directions.</p>
<p><b>Lire une adresse.</b> Dire que M a pour coordonnées (3, 2), c'est dire : « en partant de O, j'avance 3 fois de la flèche ${v("i")}, puis 2 fois de la flèche ${v("j")}, et j'arrive en M ». On l'écrit ${v("OM")} = 3${v("i")} + 2${v("j")}.</p>
<p><b>Pourquoi « non colinéaires ».</b> Deux flèches colinéaires ont la même direction. Avec elles, on ne ferait qu'avancer et reculer sur une seule droite : impossible d'atteindre les autres points du plan. Il faut donc deux directions vraiment différentes.</p>
<p><b>Pourquoi « unique ».</b> Chaque point a une seule adresse : il n'y a qu'une façon d'arriver en M avec ces deux flèches. C'est ce qui permet de dire « les coordonnées sont égales, donc x = … et y = … » dans les exercices.</p>`,
  "Vérifier qu'on a bien un repère":`<p><b>La question.</b> On te donne deux flèches, et tu dois dire si elles peuvent servir de repère. Il suffit de vérifier qu'elles n'ont pas la même direction.</p>
<p><b>Le test, avec les coordonnées.</b> Pour deux flèches de coordonnées (a, b) et (c, d), on calcule le nombre ad − bc.</p>
<ul><li>S'il est différent de 0 : les directions sont différentes, c'est un repère.</li><li>S'il vaut 0 : elles sont colinéaires, ce n'est pas un repère.</li></ul>
<p><b>Exemple qui marche.</b> (3, 1) et (1, 2) : 3 × 2 − 1 × 1 = 5. Ce n'est pas 0 : on a un repère.</p>
<p><b>Exemple qui rate.</b> (2, 4) et (1, 2) : 2 × 2 − 4 × 1 = 0. Elles sont colinéaires. On le voit aussi directement : (2, 4) = 2 × (1, 2), la première est le double de la seconde.</p>
<p><b>Dans l'espace</b>, il faut trois flèches, et elles ne doivent pas être toutes les trois dans un même plan.</p>`,
  "Changer de repère : de R′ vers R":`<p><b>L'idée.</b> Un même point peut avoir deux adresses, une dans chaque repère. Changer de repère, c'est traduire une adresse dans l'autre.</p>
<p><b>Les deux repères.</b> L'ancien repère, R = (O ; ${v("i")}, ${v("j")}), est celui du premier écran : l'origine O et les flèches ${v("i")} = (1, 0) et ${v("j")} = (0, 1). Le nouveau, R′ = (A ; ${v("u")}, ${v("v")}), part d'un autre point A, avec deux autres flèches ${v("u")} et ${v("v")}. De R′, on ne connaît que les adresses de A, ${v("u")} et ${v("v")} dans R.</p>
<p><b>Exemple chiffré.</b> Le cours, plus bas, prend A = (1, 2), ${v("u")} = (2, 1) et ${v("v")} = (1, −1). Ici, d'autres nombres pour s'entraîner : A = (2, 0), ${v("u")} = (1, 1), ${v("v")} = (0, 2), adresses lues dans R.</p>
<p>L'adresse de M dans R′ est (3, 1). Cela veut dire : je pars de A, j'avance 3 fois de ${v("u")}, puis 1 fois de ${v("v")}.</p>
<ul><li>je pars de A : (2, 0)</li><li>3 fois ${v("u")} : 3 × (1, 1) = (3, 3), on multiplie chaque nombre par 3</li><li>1 fois ${v("v")} : 1 × (0, 2) = (0, 2)</li><li>j'additionne nombre par nombre : (2 + 3 + 0, 0 + 3 + 2) = (5, 5)</li></ul>
<p>L'adresse de M dans R est donc (5, 5).</p>
<p><b>La formule générale.</b> Pour une adresse (x′, y′) quelconque dans R′, on refait le même calcul, avec x′ à la place de 3 et y′ à la place de 1 :</p>
<ul><li>je pars de A : (2, 0)</li><li>x′ fois ${v("u")} : x′ × (1, 1) = (x′, x′)</li><li>y′ fois ${v("v")} : y′ × (0, 2) = (0, 2y′)</li><li>j'additionne : (2 + x′ + 0, 0 + x′ + 2y′)</li></ul>
<p>Donc x = 2 + x′ et y = x′ + 2y′. Vérifie avec M : x′ = 3 et y′ = 1 donnent x = 5 et y = 5, comme plus haut.</p>
<p><b>Dans le cours</b>, c'est le même calcul écrit en une ligne : coord<sub>R</sub>(M) = coord<sub>R</sub>(A) + x′ · coord<sub>R</sub>(${v("u")}) + y′ · coord<sub>R</sub>(${v("v")}).</p>`,
  "Changer de repère : de R vers R′":`<p><b>Le sens inverse.</b> Cette fois on connaît l'adresse (x, y) dans l'ancien repère, et on veut l'adresse (x′, y′) dans le nouveau.</p>
<p><b>La méthode.</b> On reprend les deux formules de l'écran précédent, et on les regarde comme un système dont les inconnues sont x′ et y′.</p>
<p>Avec l'exemple d'avant : x = 2 + x′ et y = x′ + 2y′.</p>
<ol><li>La première donne tout de suite x′ = x − 2.</li><li>On remplace dans la seconde : y = (x − 2) + 2y′, donc 2y′ = y − x + 2, donc y′ = (y − x + 2)/2.</li></ol>
<p><b>Vérification avec un point connu.</b> Pour M = (5, 5) : x′ = 5 − 2 = 3 et y′ = (5 − 5 + 2)/2 = 1. On retrouve bien l'adresse (3, 1).</p>
<p><b>Un autre contrôle rapide :</b> l'origine A du nouveau repère doit avoir pour adresse (0, 0) dans ce repère. Avec A = (2, 0) : x′ = 0 et y′ = (0 − 2 + 2)/2 = 0. C'est bon.</p>`},
 "l-rn":{
  "ℝⁿ et ses deux opérations":`<p><b>Un vecteur de ℝⁿ</b>, c'est simplement une <b>liste de n nombres</b>, écrite entre parenthèses. (1, 4) est un vecteur de ℝ² ; (1, 4, 2) est un vecteur de ℝ³. Les nombres de la liste s'appellent ses composantes.</p>
<p><b>Les notations du cours.</b> On écrit x = (x₁, …, xₙ) : x₁ est la composante numéro 1, x₂ la numéro 2, et xₙ la dernière ; le petit chiffre en bas s'appelle un indice, et les « … » remplacent les composantes du milieu. La lettre grecque λ (« lambda ») désigne un nombre réel. Ainsi λx = (λx₁, …, λxₙ) veut dire : on multiplie chaque composante de x par λ.</p>
<p><b>Deux opérations, et seulement deux :</b></p>
<ul><li><b>additionner deux vecteurs</b> de même taille, case par case : (1, 4, 2) + (3, 0, 5) = (1 + 3, 4 + 0, 2 + 5) = (4, 4, 7) ;</li><li><b>multiplier un vecteur par un nombre</b>, en multipliant chaque case : 2 × (1, 4, 2) = (2, 8, 4).</li></ul>
<p><b>Le vocabulaire.</b> Un « scalaire », c'est juste un nombre réel, par opposition à un vecteur. Le « vecteur nul » est celui dont toutes les cases valent 0 : (0, 0, 0) dans ℝ³.</p>
<p><b>Ce qui n'existe pas :</b> additionner un vecteur de ℝ² et un vecteur de ℝ³ (pas la même taille), ou multiplier deux vecteurs entre eux.</p>`,
  "Les 8 règles de calcul (Proposition 10)":`<p><b>Ce que disent ces huit règles, en une phrase :</b> avec des vecteurs, l'addition et la multiplication par un nombre se comportent comme avec des nombres ordinaires. On peut changer l'ordre, regrouper, développer.</p>
<p><b>Les lettres du cours.</b> x, y, z désignent des vecteurs ; λ et μ (les lettres grecques « lambda » et « mu ») désignent des nombres ; 0<sub>ℝⁿ</sub> est le vecteur nul de ℝⁿ.</p>
<p><b>Voir une règle sur des nombres.</b> Prenons la sixième, λ(x + y) = λx + λy, avec λ = 2, x = (1, 2) et y = (3, 5).</p>
<ul><li>À gauche : x + y = (4, 7), puis 2 × (4, 7) = (8, 14).</li><li>À droite : 2x = (2, 4) et 2y = (6, 10), puis (2, 4) + (6, 10) = (8, 14).</li></ul>
<p>On obtient la même chose des deux côtés.</p>
<p><b>Comment on démontre une règle.</b> Un exemple ne suffit pas : il faut que ce soit vrai pour tous les vecteurs. L'idée est toujours la même : on regarde <b>une case à la fois</b>. Dans une case, il n'y a que des nombres, et pour les nombres la règle est déjà connue. Si c'est vrai dans chaque case, c'est vrai pour le vecteur entier.</p>
<p><b>À retenir pour le contrôle :</b> pas les huit règles une par une, mais cette façon de les démontrer, « composante par composante ».</p>`,
  "Vecteurs canoniques":`<p><b>Ce sont les vecteurs les plus simples :</b> un seul 1, et des 0 partout ailleurs. Dans ℝ³, il y en a trois : e₁ = (1, 0, 0), e₂ = (0, 1, 0), e₃ = (0, 0, 1). Le numéro dit où est le 1.</p>
<p><b>À quoi ils servent.</b> Ce sont des briques : n'importe quel vecteur se fabrique avec eux, et il suffit de lire ses cases.</p>
<p>Exemple : (4, 0, 7) = 4e₁ + 0e₂ + 7e₃. Vérification : 4 × (1, 0, 0) = (4, 0, 0), 7 × (0, 0, 1) = (0, 0, 7), et la somme fait bien (4, 0, 7).</p>
<p><b>Dans l'autre sens :</b> 2e₁ − e₃ dans ℝ³, c'est (2, 0, −1). La case 2 vaut 0 parce que e₂ n'apparaît pas.</p>`,
  "Résoudre une équation dont l'inconnue est un vecteur":`<p><b>L'idée.</b> Comme les vecteurs se calculent comme des nombres, on résout une équation où l'inconnue est un vecteur exactement comme une équation ordinaire : on isole l'inconnue.</p>
<p><b>Exemple simple.</b> On cherche le vecteur x tel que 3x + u = v, avec u = (1, 2) et v = (7, 8).</p>
<ol><li>On enlève u des deux côtés : 3x = v − u.</li><li>On divise par 3 : x = (v − u)/3.</li><li>On calcule : v − u = (6, 6), donc x = (2, 2).</li></ol>
<p>Vérification : 3 × (2, 2) + (1, 2) = (6, 6) + (1, 2) = (7, 8). C'est bien v.</p>
<p><b>Avec deux vecteurs inconnus</b> et deux équations, on fait comme pour un système de deux équations avec des nombres : on exprime l'une des inconnues avec la première équation, et on remplace dans la seconde.</p>
<p><b>La seule chose interdite :</b> diviser par un vecteur. On ne divise que par des nombres.</p>`,
  "λx = 0 si et seulement si λ = 0 ou x = 0":`<p><b>Ce que dit la phrase.</b> Un nombre λ multiplié par un vecteur x donne le vecteur nul dans deux cas seulement : quand le nombre vaut 0, ou quand le vecteur est déjà nul. C'est la même idée qu'avec les nombres : a × b = 0 seulement si a = 0 ou b = 0.</p>
<p><b>« Si et seulement si »</b> veut dire qu'il y a <b>deux choses à démontrer</b>, une dans chaque sens.</p>
<p><b>Les lettres.</b> λ est un nombre, x un vecteur de ℝⁿ, et xᵢ sa case numéro i : pour x = (4, 0, 7), x₁ = 4, x₂ = 0 et x₃ = 7. Le cours écrit 0<sub>ℝⁿ</sub> pour le vecteur nul.</p>
<p><b>Sens 1 (le facile), noté ⇐ dans le cours.</b> La flèche ⇒ se lit « implique » : A ⇒ B veut dire « si A est vrai, alors B est vrai ». Ici, ⇐ part de la droite : si λ = 0 ou si x est le vecteur nul, alors λx est nul.</p>
<ul><li>Si λ = 0 : chaque case de 0 × x vaut 0 fois quelque chose, donc 0.</li><li>Si x est nul : chaque case de λx vaut λ fois 0, donc 0.</li></ul>
<p><b>Sens 2, noté ⇒.</b> Si λx est nul, alors λ = 0 ou x est nul. On coupe en deux cas :</p>
<ul><li>si λ = 0, on a ce qu'on voulait, c'est fini ;</li><li>sinon, λ n'est pas 0, donc on a le droit de <b>diviser par λ</b>. Dans chaque case, λ × xᵢ = 0 donne xᵢ = 0. Toutes les cases de x sont nulles : x est le vecteur nul.</li></ul>
<p><b>Pourquoi couper en deux cas.</b> Parce qu'on ne peut pas diviser par 0. Avant de diviser par λ, il faut donc avoir mis de côté le cas λ = 0.</p>
<p>Exemple : 3x = (0, 0). Ici λ = 3 n'est pas nul, donc x = (0, 0).</p>`},
 "l-equation":{
  "Équation linéaire":`<p><b>« Linéaire »</b> veut dire : chaque inconnue est seulement <b>multipliée par un nombre</b>, puis on additionne le tout. Rien d'autre.</p>
<ul><li>3x + 2y = 7 est linéaire.</li><li>x² + y = 1 ne l'est pas : il y a un carré.</li><li>xy = 2 ne l'est pas : deux inconnues sont multipliées entre elles.</li></ul>
<p><b>Les mots.</b> Dans 3x + 2y = 7 : 3 et 2 sont les <b>coefficients</b> (les nombres devant les inconnues), et 7 est le <b>second membre</b> (ce qui est à droite du signe =).</p>
<p><b>« Homogène »</b> veut dire que le second membre vaut 0 : 3x + 2y = 0.</p>
<p><b>Une subtilité du cours.</b> Être linéaire dépend de ce qu'on décide d'appeler « inconnue ». Si m est un nombre fixé qu'on ne cherche pas (un paramètre), alors mx + y = 1 est linéaire en x et y : le coefficient de x est m.</p>`,
  "Toutes les solutions : une représentation paramétrique":`<p><b>Le constat.</b> Une seule équation avec deux inconnues a une infinité de solutions. Pour x + y = 5 : (0, 5), (1, 4), (2, 3), (10, −5)… On ne peut pas les écrire toutes : il faut une façon de les décrire.</p>
<p><b>La méthode.</b> On laisse une inconnue libre, et on calcule l'autre avec elle.</p>
<ol><li>Je choisis x librement. Je l'appelle t, pour montrer qu'il peut prendre n'importe quelle valeur.</li><li>Alors y est forcé : y = 5 − t.</li><li>Les solutions sont tous les couples (t, 5 − t).</li></ol>
<p><b>L'écriture :</b> S = {(t, 5 − t) | t ∈ ℝ}. Elle se lit : « S est l'ensemble des couples (t, 5 − t), pour tous les réels t ». La lettre t s'appelle un <b>paramètre</b>.</p>
<p><b>Essaie avec un nombre.</b> Pour t = 2 : (2, 3), et 2 + 3 = 5. Pour t = −1 : (−1, 6), et −1 + 6 = 5. Chaque valeur de t donne une solution.</p>
<p><b>Une inconnue absente de l'équation est libre elle aussi.</b> Dans x + y = 5 vue avec trois inconnues x, y, z, rien n'est imposé à z : il faut un deuxième paramètre pour lui. S = {(t, 5 − t, u) | t, u ∈ ℝ}.</p>
<p><b>Deux cas extrêmes.</b> 0x + 0y + 0z = −1 revient à 0 = −1, faux quelles que soient les valeurs : aucune solution, on écrit S = ∅ (∅ désigne l'ensemble vide). 0x + 0y + 0z + 0t = 0 revient à 0 = 0, toujours vrai : tous les quadruplets (x, y, z, t) sont solutions, et l'on écrit S = ℝ⁴.</p>`,
  "Système linéaire et solutions":`<p><b>Un système</b>, c'est plusieurs équations qui doivent être vraies <b>en même temps</b>, avec les mêmes inconnues.</p>
<p><b>Tester une solution.</b> Prenons le système x + y = 3 et x − y = 1.</p>
<ul><li>Le couple (2, 1) : 2 + 1 = 3, vrai ; 2 − 1 = 1, vrai. Les deux sont vraies : <b>c'est une solution</b>.</li><li>Le couple (3, 0) : 3 + 0 = 3, vrai ; 3 − 0 = 3, et pas 1. Une équation est fausse : <b>ce n'est pas une solution</b>.</li></ul>
<p>Une seule équation fausse suffit pour dire non.</p>
<p><b>Combien de solutions ?</b> Il n'y a que trois possibilités : aucune, une seule, ou une infinité. Jamais exactement deux.</p>
<p><b>Pour s'en souvenir</b>, pense à deux droites dans le plan (chaque équation à deux inconnues est une droite) : elles sont parallèles (aucun point commun), elles se coupent (un seul), ou elles sont confondues (une infinité).</p>
<p><b>Le mot du cours :</b> un système sans aucune solution est dit « incompatible ».</p>`},
 "l-matrice-aug":{
  "La matrice augmentée":`<p><b>L'idée.</b> Dans un système, les lettres x, y, z ne servent qu'à dire « à quelle place est chaque nombre ». On peut donc ne garder que les nombres, rangés dans un tableau. Ce tableau s'appelle la matrice augmentée.</p>
<p><b>Comment la remplir :</b> une ligne par équation, une colonne par inconnue, et une dernière colonne, après une barre, pour les nombres de droite.</p>
<p>Exemple : ${sys("x + 2y = 5","3x − y = 1")} devient ${mat([[1,2,5],[3,-1,1]],1)}</p>
<p>Ligne 1 : « 1 x, 2 y, égale 5 ». Ligne 2 : « 3 x, −1 y, égale 1 ».</p>
<p><b>Le piège : une inconnue absente compte pour 0.</b> ${sys("x + z = 2","y − z = 1")} avec les inconnues x, y, z devient ${mat([[1,0,1,2],[0,1,-1,1]],1)}</p>
<p>Dans la première équation, il n'y a pas de y : on écrit 0 dans la colonne de y. Si on l'oublie, tous les nombres se décalent et tout est faux.</p>`,
  "Les trois opérations élémentaires":`<p><b>La question.</b> Quels gestes a-t-on le droit de faire sur un système sans changer ses solutions ? Il y en a exactement trois.</p>
<ol><li><b>Échanger deux lignes.</b> L'ordre des équations n'a aucune importance.</li><li><b>Multiplier une ligne par un nombre qui n'est pas 0.</b> x + y = 2 et 3x + 3y = 6 disent la même chose.</li><li><b>Ajouter à une ligne un multiple d'une autre ligne.</b> C'est le geste le plus utile : il sert à faire apparaître des zéros.</li></ol>
<p><b>Lire la notation.</b> « L₂ ← L₂ − 3L₁ » veut dire : la nouvelle ligne 2, c'est l'ancienne ligne 2, moins 3 fois la ligne 1. La ligne 1, elle, ne change pas.</p>
<p>Le cours écrit aussi Lᵢ pour « la ligne numéro i » (i est un numéro quelconque), Lᵢ ↔ Lⱼ pour « échanger les lignes i et j », et λ pour un nombre.</p>
<p><b>Exemple</b> sur ${mat([[1,2,5],[3,-1,1]],1)} avec L₂ ← L₂ − 3L₁. On calcule case par case :</p>
<ul><li>3 − 3 × 1 = 0</li><li>−1 − 3 × 2 = −7</li><li>1 − 3 × 5 = −14</li></ul>
<p>On obtient ${mat([[1,2,5],[0,-7,-14]],1)} : le 3 est devenu 0. La ligne 2 dit maintenant −7y = −14, une équation avec une seule inconnue.</p>
<p><b>Pourquoi pas « multiplier par 0 » ?</b> La ligne deviendrait 0 = 0 : on aurait effacé une équation, donc perdu une information.</p>`,
  "Regrouper des opérations, et le piège":`<p><b>Ce qui est permis.</b> Pour aller plus vite, on peut faire plusieurs opérations dans la même étape, à une condition : la ligne dont on se sert <b>ne doit pas être modifiée</b> dans cette étape.</p>
<p>Exemple permis : L₂ ← L₂ − 3L₁ et L₃ ← L₃ + 2L₁ en même temps. Les deux utilisent L₁, et L₁ ne bouge pas.</p>
<p><b>Le piège.</b> Faire en même temps L₂ ← L₂ + L₃ et L₃ ← L₃ + L₂. Les deux nouvelles lignes valent « ancienne L₂ + ancienne L₃ » : elles sont identiques. On avait deux équations différentes, il n'en reste qu'une : on a perdu une information, et le résultat sera faux.</p>
<p><b>Le conseil.</b> En cas de doute, une seule opération à la fois. Et à chaque étape, une ligne sert d'outil (celle du pivot) et reste telle quelle ; on modifie seulement les autres.</p>`},
 "l-echelon":{
  "Matrice échelonnée":`<p><b>« Échelonnée » veut dire « en escalier ».</b> Quand on descend d'une ligne, elle commence par <b>plus de zéros</b> que celle du dessus.</p>
<p>Exemple : ${mat([[1,2,3],[0,4,5],[0,0,6]])} La ligne 1 commence par 0 zéro, la ligne 2 par 1 zéro, la ligne 3 par 2 zéros. Ça augmente à chaque fois : elle est échelonnée.</p>
<p>Contre-exemple : ${mat([[1,2,3],[0,0,5],[0,4,6]])} La ligne 2 commence par 2 zéros, et la ligne 3 par 1 seul. Ça diminue : elle n'est pas échelonnée.</p>
<p><b>Le pivot</b> d'une ligne, c'est son premier nombre qui n'est pas 0. Dans le premier exemple, les pivots sont 1, 4 et 6.</p>
<p>Le cours note Z(Lᵢ) le nombre de zéros au début de la ligne i : dans le premier exemple, Z vaut 0, puis 1, puis 2.</p>
<p><b>Deuxième règle :</b> si une ligne ne contient que des zéros, elle doit être tout en bas.</p>
<p><b>Pourquoi on veut cette forme.</b> Parce qu'un système en escalier se résout tout seul, de bas en haut : la dernière équation n'a qu'une inconnue, on la trouve, puis on remonte.</p>`,
  "Échelonnée réduite":`<p><b>C'est l'escalier, nettoyé au maximum.</b> Deux conditions de plus :</p>
<ul><li>chaque pivot vaut 1 ;</li><li>dans la colonne d'un pivot, tous les autres nombres valent 0 (au-dessous, mais aussi <b>au-dessus</b>).</li></ul>
<p>Exemple : ${mat([[1,0,2],[0,1,3]],1)} Les pivots sont les deux 1, et chacun est seul dans sa colonne.</p>
<p><b>L'intérêt.</b> On lit la réponse sans aucun calcul. Si ce tableau est la matrice augmentée d'un système en x, y, il dit : x = 2 et y = 3.</p>
<p><b>Par comparaison</b>, ${mat([[1,2,5],[0,-7,-14]],1)} est échelonnée mais pas réduite : le pivot de la ligne 2 vaut −7, et il y a un 2 au-dessus de lui. Il reste du calcul à faire pour trouver x et y.</p>`,
  "Variables principales, variables libres":`<p><b>Une fois le système en escalier, on regarde chaque colonne d'inconnue.</b></p>
<ul><li>Si la colonne contient un pivot, l'inconnue est <b>principale</b> : on va la calculer.</li><li>Sinon, elle est <b>libre</b> : elle peut prendre n'importe quelle valeur, et on lui donne un nom de paramètre (t, par exemple).</li></ul>
<p><b>Exemple</b>, avec les inconnues x, y, z : ${mat([[1,2,0,4],[0,0,1,3]],1)}</p>
<ol><li>Les pivots sont dans les colonnes 1 et 3 : x et z sont principales. La colonne 2 n'a pas de pivot : y est libre, je pose y = t.</li><li>Je pars du bas. La ligne 2 dit z = 3.</li><li>La ligne 1 dit x + 2y = 4, donc x = 4 − 2t.</li><li>Les solutions : S = {(4 − 2t, t, 3) | t ∈ ℝ}. Il y en a une infinité, une pour chaque t.</li></ol>
<p><b>Combien de solutions ?</b> D'abord, on cherche une ligne 0 … 0 | b avec b ≠ 0 (voir plus bas) : s'il y en a une, aucune solution. Sinon : s'il y a au moins une inconnue libre, une infinité ; si toutes sont principales, une seule.</p>
<p><b>Le cas « aucune solution ».</b> Une ligne comme 0 0 0 | 5 dit 0 = 5, ce qui est faux quoi qu'on fasse. Dès qu'on en voit une, on s'arrête : le système n'a pas de solution.</p>`},
 "l-pivot":{
  "L'algorithme":`<p><b>Le but.</b> Transformer la matrice augmentée en escalier, avec les trois opérations permises. Pour cela, on fabrique des <b>zéros sous les pivots</b>, colonne après colonne, de gauche à droite.</p>
<p><b>Un exemple complet, le plus petit possible :</b> ${sys("x + 2y = 5","3x − y = 1")}</p>
<ol><li>J'écris la matrice augmentée : ${mat([[1,2,5],[3,-1,1]],1)}</li><li>Colonne 1 : le pivot est le 1 en haut à gauche. Dessous, il y a un 3, que je veux changer en 0. Comme 3 = 3 × 1, je fais L₂ ← L₂ − 3L₁.</li><li>J'obtiens ${mat([[1,2,5],[0,-7,-14]],1)} : c'est un escalier.</li><li>Je lis de bas en haut. Ligne 2 : −7y = −14, donc y = 2.</li><li>Ligne 1 : x + 2y = 5, donc x = 5 − 4 = 1.</li><li>La solution est (1, 2). Je vérifie dans la deuxième équation de départ : 3 × 1 − 2 = 1. C'est bon.</li></ol>
<p><b>Comment trouver l'opération.</b> Pour annuler un nombre a placé sous un pivot p, on fait : ligne ← ligne − (a/p) × ligne du pivot. Avec un pivot égal à 1, c'est simplement « moins a fois la ligne du pivot ».</p>
<p><b>Si le nombre en haut à gauche vaut 0</b>, il ne peut pas servir de pivot : on échange deux lignes pour en mettre un autre à sa place.</p>
<p><b>Si toute la colonne vaut 0</b> sous la ligne où tu en es, il n'y a pas de pivot dans cette colonne : tu passes à la colonne suivante, <b>sur la même ligne</b>. Exemple : ${mat([[1,2,-1,1],[0,0,1,1],[0,0,2,2]],1)} : sous le 1 de la ligne 1, la colonne 2 n'a que des 0. Le pivot de la ligne 2 est donc le 1 de la colonne 3, et on fait L₃ ← L₃ − 2L₂.</p>
<p>Avec plus d'équations, on recommence : colonne 2, puis colonne 3, en ne touchant plus aux lignes déjà traitées.</p>`,
  "Rédiger sur la copie":`<p><b>Le correcteur doit pouvoir suivre chaque étape.</b> Même avec le bon résultat, une copie sans les opérations perd des points. Voici ce qu'on attend, dans l'ordre :</p>
<ol><li>la matrice augmentée du système ;</li><li>à chaque étape, <b>le nom de l'opération</b> (par exemple L₂ ← L₂ − 3L₁), puis la nouvelle matrice ;</li><li>une <b>phrase de conclusion</b>, avec l'ensemble des solutions : « S = {(1, 2)} », ou « S = {(4 − 2t, t, 3) | t ∈ ℝ} », ou « le système est incompatible : S = ∅ ». Le signe ∅ veut dire « l'ensemble vide » : aucune solution ;</li><li>si tu as le temps, une vérification : tu remplaces ta solution dans une équation de départ.</li></ol>
<p><b>Deux lignes particulières :</b></p>
<ul><li>0 0 0 | 0 dit « 0 = 0 ». C'est toujours vrai : cette ligne n'apporte rien, on peut l'oublier.</li><li>0 0 0 | 5 dit « 0 = 5 ». C'est toujours faux : on s'arrête et on conclut qu'il n'y a pas de solution.</li></ul>`},
 "l-compat":{
  "Second membre en lettres":`<p><b>Ce qui change.</b> À droite du signe =, il y a des lettres a, b, c à la place des nombres. Ce sont des nombres qu'on ne connaît pas encore. La question devient : pour quelles valeurs de ces lettres le système a-t-il des solutions ?</p>
<p><b>La méthode ne change pas :</b> on fait le pivot comme d'habitude, et dans la dernière colonne on calcule avec les lettres.</p>
<p><b>Exemple :</b> ${sys("x + y = a","2x + 2y = b")}</p>
<ol><li>Matrice augmentée : ${mat([[1,1,"a"],[2,2,"b"]],1)}</li><li>L₂ ← L₂ − 2L₁ : ${mat([[1,1,"a"],[0,0,"b − 2a"]],1)}</li><li>La ligne 2 dit : 0 = b − 2a.</li></ol>
<p><b>Lire le résultat.</b> Si b − 2a n'est pas 0, la ligne 2 est fausse : aucune solution. Si b − 2a = 0, elle dit 0 = 0 : il reste x + y = a, qui a des solutions.</p>
<p>Le système a donc des solutions <b>si et seulement si b − 2a = 0</b>. Cette égalité s'appelle la condition de compatibilité.</p>
<p><b>Avec des nombres :</b> a = 1 et b = 2 conviennent (2 − 2 = 0). a = 1 et b = 5 ne conviennent pas : on aurait x + y = 1 et 2x + 2y = 5, ce qui est impossible puisque 2x + 2y vaut le double de x + y, donc 2.</p>`,
  "Un paramètre m : couper en cas":`<p><b>Ce qui change.</b> La lettre m est maintenant dans les coefficients, devant les inconnues. C'est un nombre fixé, mais on ne sait pas lequel. La réponse dépendra de sa valeur.</p>
<p><b>Le danger :</b> diviser par quelque chose qui vaut peut-être 0.</p>
<p><b>Exemple.</b> Après le pivot, on arrive à l'équation (m − 2) y = 3.</p>
<ul><li><b>Si m ≠ 2</b>, alors m − 2 n'est pas 0, on a le droit de diviser : y = 3/(m − 2).</li><li><b>Si m = 2</b>, l'équation devient 0 × y = 3, c'est-à-dire 0 = 3. C'est faux : aucune solution.</li></ul>
<p><b>Autre exemple :</b> (m − 2) y = 0.</p>
<ul><li>Si m ≠ 2 : y = 0.</li><li>Si m = 2 : l'équation devient 0 = 0, toujours vraie. Rien n'est imposé à y : il est libre, et il y a une infinité de solutions.</li></ul>
<p><b>La méthode :</b></p>
<ol><li>je fais le pivot, en choisissant si possible un pivot sans m (quitte à échanger deux lignes) ;</li><li>dès que je veux diviser par une expression avec m, je cherche les valeurs de m qui l'annulent ;</li><li>je traite d'abord le cas général (je divise), puis chaque valeur spéciale à part, en remplaçant m par sa valeur ;</li><li>je termine par un bilan : « si m ≠ 2 : … ; si m = 2 : … ».</li></ol>`},
 "l-colineaire":{
  "Vecteurs colinéaires":`<p><b>Deux vecteurs sont colinéaires quand l'un est un multiple de l'autre.</b> Par exemple (6, 9) = 3 × (2, 3) : ils ont la même direction, l'un est juste trois fois plus long.</p>
<p><b>Le test dans ℝ².</b> Pour (a, b) et (c, d), on calcule ad − bc. S'il vaut 0, ils sont colinéaires ; sinon, non.</p>
<ul><li>(6, 9) et (2, 3) : 6 × 3 − 9 × 2 = 0. Colinéaires.</li><li>(1, 2) et (2, 5) : 1 × 5 − 2 × 2 = 1. Pas colinéaires.</li></ul>
<p><b>Dans ℝ³ ou plus</b>, on cherche le multiplicateur avec une case où le vecteur qu'on multiplie n'a pas 0 (ici la première), puis on vérifie les autres. (2, 4, 6) est-il un multiple de (1, 2, 5) ? Pour la première case, il faudrait multiplier par 2. Mais alors la troisième case donnerait 5 × 2 = 10, et pas 6. Ils ne sont pas colinéaires.</p>
<p><b>Le cas du vecteur nul.</b> (0, 0) = 0 × (2, 3) : le vecteur nul est un multiple de n'importe quel vecteur. Il est donc colinéaire à tous.</p>`,
  "Combinaison linéaire":`<p><b>Une combinaison linéaire, c'est une recette :</b> tant de fois ce vecteur, plus tant de fois celui-là. Par exemple 2 × (1, 0) + 3 × (0, 1) = (2, 3). Les nombres 2 et 3 sont les coefficients.</p>
<p><b>La question type :</b> « le vecteur w est-il une combinaison linéaire de v₁ et v₂ ? ». Autrement dit : existe-t-il des quantités a et b telles que a v₁ + b v₂ = w ?</p>
<p><b>L'écriture du cours :</b> λ₁v₁ + λ₂v₂ + … + λₖvₖ. Les λ sont les coefficients (des nombres), les v sont les vecteurs, numérotés de 1 à k, et « … » veut dire « et ainsi de suite jusqu'au dernier ».</p>
<p><b>La méthode, sur un exemple :</b> w = (5, 7), v₁ = (1, 1), v₂ = (1, 2).</p>
<ol><li>J'écris ce que je cherche : a (1, 1) + b (1, 2) = (5, 7).</li><li>Je calcule le côté gauche case par case : (a + b, a + 2b).</li><li>J'écris une équation par case : a + b = 5 et a + 2b = 7.</li><li>Je résous : en soustrayant la première de la seconde, b = 2. Puis a = 3.</li><li>Conclusion : oui, (5, 7) = 3 (1, 1) + 2 (1, 2).</li></ol>
<p>Vérification : 3 (1, 1) = (3, 3), 2 (1, 2) = (2, 4), et la somme fait (5, 7).</p>
<p><b>Trois fins possibles pour le système :</b></p>
<ul><li>aucune solution : w n'est pas une combinaison linéaire ;</li><li>une seule solution : il l'est, d'une seule façon ;</li><li>une infinité de solutions : il l'est, d'une infinité de façons.</li></ul>`},
 "l-vect":{
  "Vect(v₁, …, vₖ)":`<p><b>Vect(…) est un ensemble :</b> tous les vecteurs qu'on peut fabriquer avec les vecteurs donnés, par toutes les combinaisons linéaires possibles.</p>
<p><b>Avec un seul vecteur.</b> Vect((1, 2)) contient tous les multiples de (1, 2) : (2, 4), (−1, −2), (0, 0), (0,5 ; 1)… Dans le plan, ces points forment une droite qui passe par l'origine.</p>
<p><b>Avec deux vecteurs</b> qui n'ont pas la même direction, on obtient un plan qui passe par l'origine (dans ℝ³ ; dans ℝ², c'est tout le plan).</p>
<p><b>Lire la formule du cours.</b> Vect(v₁, …, vₖ) = {λ₁v₁ + … + λₖvₖ | λ₁, …, λₖ ∈ ℝ} se lit : « l'ensemble des vecteurs λ₁v₁ + … + λₖvₖ, pour tous les choix possibles des nombres λ₁, …, λₖ ».</p>
<p><b>Deux choses toujours vraies :</b></p>
<ul><li>le vecteur nul est dans Vect(…) : il suffit de prendre tous les coefficients égaux à 0 ;</li><li>chaque vecteur de départ est dans Vect(…) : on lui met le coefficient 1, et 0 aux autres.</li></ul>`,
  "Enlever un vecteur sans changer Vect":`<p><b>L'idée.</b> Si un des vecteurs se fabrique déjà avec les autres, il n'apporte rien de nouveau. On peut l'enlever de la liste : l'ensemble fabriqué reste le même.</p>
<p><b>Exemple.</b> Dans Vect((1, 0), (0, 1), (2, 3)), le troisième vecteur est inutile : (2, 3) = 2 (1, 0) + 3 (0, 1). Donc Vect((1, 0), (0, 1), (2, 3)) = Vect((1, 0), (0, 1)).</p>
<p><b>La règle :</b> on peut retirer un vecteur <b>si et seulement s'il</b> est combinaison linéaire des autres.</p>
<p>Le cours l'écrit avec le signe ⊆, qui se lit « est inclus dans » : tout vecteur du premier ensemble est aussi dans le second.</p>
<p><b>La précaution.</b> On en retire <b>un seul à la fois</b>, puis on refait le test avec ceux qui restent. Exemple : u = (1, 2) et v = (2, 4). Chacun est un multiple de l'autre, donc on peut retirer u, ou bien v. Mais pas les deux : il ne resterait plus rien pour fabriquer la droite.</p>`,
  "Tester si un vecteur est dans Vect":`<p><b>« w est dans Vect(u, v) »</b> veut dire exactement : « w est une combinaison linéaire de u et v ». C'est donc la méthode de la leçon précédente : on cherche les coefficients avec un système.</p>
<p><b>Exemple où ça marche.</b> u = (1, 0, 1), v = (0, 1, 1), w = (2, 3, 5).</p>
<ol><li>Je cherche a et b avec a u + b v = w, c'est-à-dire (a, b, a + b) = (2, 3, 5).</li><li>Case 1 : a = 2. Case 2 : b = 3.</li><li>Case 3 : a + b doit valoir 5. Or 2 + 3 = 5 : c'est bon.</li><li>Conclusion : w = 2u + 3v, donc w est dans Vect(u, v).</li></ol>
<p><b>Exemple où ça rate.</b> Même u et v, mais w′ = (2, 3, 4). Les deux premières cases donnent encore a = 2 et b = 3. La troisième demanderait a + b = 4, alors que 2 + 3 = 5. Le système n'a pas de solution : w′ n'est pas dans Vect(u, v).</p>
<p><b>À retenir :</b> il faut que <b>toutes</b> les cases marchent avec les mêmes coefficients. Une seule qui rate suffit pour dire non.</p>`},
 "l-sev":{
  "La définition":`<p><b>L'idée.</b> Un sous-espace vectoriel, c'est une partie F de ℝⁿ dont <b>on ne sort jamais</b> en faisant les deux opérations des vecteurs : additionner, et multiplier par un nombre.</p>
<p><b>Les trois conditions, en français :</b></p>
<ol><li>le vecteur nul est dans F ;</li><li>si je prends deux vecteurs de F et que je les additionne, le résultat est encore dans F ;</li><li>si je prends un vecteur de F et que je le multiplie par un nombre, le résultat est encore dans F.</li></ol>
<p><b>Un exemple qui marche :</b> F = l'ensemble des (x, y) tels que y = 2x.</p>
<ul><li>(0, 0) est dedans : 0 = 2 × 0.</li><li>(1, 2) et (3, 6) sont dedans. Leur somme est (4, 8), et 8 = 2 × 4 : encore dedans.</li><li>5 × (1, 2) = (5, 10), et 10 = 2 × 5 : encore dedans.</li></ul>
<p>(Pour une vraie démonstration, on le fait avec des lettres et pas seulement sur des exemples.)</p>
<p><b>Un exemple qui rate :</b> G = l'ensemble des (x, y) tels que y = 2x + 1. Le vecteur nul (0, 0) n'est pas dedans, car 0 n'est pas égal à 2 × 0 + 1. La première condition est fausse : G n'est pas un sous-espace vectoriel.</p>
<p><b>Pour le contrôle.</b> La définition est une question de cours annoncée : il faut savoir l'écrire mot pour mot, avec ses trois conditions. Le signe ∀ qu'on y trouve se lit « pour tout », le signe ∈ se lit « appartient à » (x ∈ F : x est dans F), et 0<sub>ℝⁿ</sub> est le vecteur nul de ℝⁿ.</p>`},
 "l-homogene":{
  "Système homogène, système homogène associé":`<p><b>Homogène</b> veut dire : tous les seconds membres (les nombres à droite du signe $=$) valent $0$.</p>
<p><b>Exemple :</b> $x + y = 0$ et $2x − y = 0$. Ce système est homogène.</p>
<p><b>Il a toujours au moins une solution :</b> $(0, 0)$. En mettant $0$ partout, chaque équation donne $0 = 0$. Il reste à savoir s'il en a d'autres. Il n'y a que deux cas : soit $(0, 0)$ est la seule, soit il y en a une infinité.</p>
<p><b>Le système homogène associé</b> à un système, c'est le même système où on remplace tous les seconds membres par $0$.</p>
<ul><li>Système de départ : $x + 2y = 5$ et $3x − y = 1$.</li><li>Système homogène associé : $x + 2y = 0$ et $3x − y = 0$.</li></ul>
<p><b>Les notations du cours.</b> Le système de départ s'appelle Σ (sigma, le S grec) et son système homogène associé Σ₀. Leurs ensembles de solutions s'appellent $S$ et $S₀$.</p>
<p><b>Plus d'inconnues que d'équations : une infinité de solutions.</b> Exemple : la seule équation $x + y − z = 0$, avec $3$ inconnues. Il y a au plus un pivot par équation, donc ici $1$ pivot pour $3$ inconnues : $2$ inconnues sont libres. On trouve par exemple $(1, 0, 1)$, $(0, 1, 1)$, $(2, 3, 5)$… une infinité.</p>`,
  "Toutes les solutions = une solution + les solutions de Σ₀":`<p><b>L'idée.</b> Pour trouver <b>toutes</b> les solutions d'un système, on n'a pas besoin de tout recommencer : il suffit d'<b>une</b> solution, à laquelle on ajoute toutes les solutions du système homogène associé.</p>
<p><b>Exemple :</b> $x + y = 3$.</p>
<ol><li>Une solution, trouvée à l'œil : $s = (3, 0)$, car $3 + 0 = 3$.</li><li>Le système homogène associé, $x + y = 0$ : ses solutions sont les $(t, −t)$, pour $t$ réel.</li><li>Toutes les solutions : $(3, 0) + (t, −t) = (3 + t, −t)$.</li></ol>
<p><b>Vérification avec $t = 1$ :</b> on obtient $(4, −1)$, et $4 + (−1) = 3$. C'est bien une solution.</p>
<p><b>Dans le cours</b>, c'est écrit $S = s + S₀$ : $S$ est l'ensemble de toutes les solutions, $s$ la solution trouvée à l'œil, et $S₀$ l'ensemble des solutions du système homogène associé. Ici, $s = (3, 0)$ et $S₀$ contient les $(t, −t)$.</p>
<p><b>Pourquoi ça marche.</b> Prends deux solutions, par exemple $(4, −1)$ et $(3, 0)$. Leur différence $(1, −1)$ vérifie $1 + (−1) = 0$ : elle est solution du système homogène. C'est toujours vrai : en soustrayant deux égalités qui ont le même second membre, on obtient $0$ à droite.</p>`},
 "l-sev2":{
  "Les raccourcis à connaître":`<p><b>Rappel.</b> Un sous-espace vectoriel (sev) est un ensemble de vecteurs qui contient $0$, et qui est stable par addition et par multiplication par un nombre. Le vérifier à la main est long. Le cours donne <b>deux raccourcis</b> pour répondre oui.</p>
<p><b>Raccourci 1 : l'ensemble s'écrit Vect(…).</b> Exemple : les vecteurs $(2t, t, −t)$, pour $t$ réel, sont les multiples de $(2, 1, −1)$. C'est $Vect((2, 1, −1))$, donc un sev.</p>
<p><b>Raccourci 2 : ce sont les solutions d'un système homogène.</b> Exemple : les $(x, y, z)$ tels que $x + y = 0$ et $z = 0$. Les seconds membres valent $0$ : c'est un sev.</p>
<p><b>Pour répondre non :</b> un seul contre-exemple suffit, et le plus rapide est de tester $0$.</p>
<ul><li>Les $(x, y)$ tels que $2x + y = 4$ : avec $(0, 0)$, on obtient $0 ≠ 4$. Le vecteur nul n'y est pas : ce n'est pas un sev.</li><li>Les $(x, y)$ tels que $x ≥ 0$ : $0$ y est, mais $(1, 0)$ y est et $−1 · (1, 0) = (−1, 0)$ n'y est pas. Ce n'est pas un sev.</li></ul>
<p><b>Sur la copie,</b> cite le raccourci utilisé : « d'après le cours, l'ensemble des solutions d'un système linéaire homogène est un sous-espace vectoriel ».</p>`},
 "l-vect-eq":{
  "Des équations aux générateurs":`<p><b>Le but :</b> on a un ensemble décrit par des équations, et on veut l'écrire sous la forme $Vect(…)$, c'est-à-dire trouver des vecteurs qui le fabriquent.</p>
<p><b>Exemple :</b> les $(x, y, z)$ tels que $x − 2y + z = 0$.</p>
<ol><li>On exprime $x$ avec les autres : $x = 2y − z$. Les inconnues $y$ et $z$ sont libres.</li><li>On écrit le vecteur avec seulement $y$ et $z$ : $(x, y, z) = (2y − z, y, z)$.</li><li>On sépare ce qui est avec $y$ et ce qui est avec $z$ : $(2y − z, y, z) = y(2, 1, 0) + z(−1, 0, 1)$.</li></ol>
<p>Donc l'ensemble est $Vect((2, 1, 0), (−1, 0, 1))$.</p>
<p><b>Vérification :</b> $(2, 1, 0)$ donne $2 − 2 + 0 = 0$, et $(−1, 0, 1)$ donne $−1 − 0 + 1 = 0$. Les deux vecteurs vérifient bien l'équation.</p>
<p><b>À retenir :</b> autant de vecteurs que d'inconnues libres.</p>`,
  "Des générateurs aux équations":`<p><b>Le chemin inverse :</b> on a $Vect(…)$, et on veut des équations.</p>
<p><b>Exemple dans $ℝ²$ :</b> $Vect((1, 2))$, tous les multiples de $(1, 2)$.</p>
<ol><li>$(x, y)$ est dedans quand il existe un nombre $α$ avec $(x, y) = α(1, 2)$, c'est-à-dire $x = α$ et $y = 2α$.</li><li>On fait disparaître $α$ : $α = x$, donc $y = 2x$.</li><li>Équation : $y − 2x = 0$.</li></ol>
<p><b>Exemple dans $ℝ³$ :</b> $Vect((1, 0, 2))$. On écrit $x = α$, $y = 0$, $z = 2α$. Sans $α$, il reste deux équations : $y = 0$ et $z − 2x = 0$.</p>
<p><b>Méthode générale :</b> on écrit le système d'inconnues $α, β, …$ avec $x, y, z$ à droite, on fait le pivot, et chaque ligne « $0 =$ (quelque chose avec $x, y, z$) » donne une équation.</p>`,
  "Droite, plan ou tout l'espace ?":`<p><b>Les sous-espaces possibles sont peu nombreux :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Dans</th><th>Les sous-espaces</th></tr></thead><tbody><tr><td>$ℝ²$</td><td>$\{0\}$, les droites qui passent par $0$, et $ℝ²$ tout entier</td></tr><tr><td>$ℝ³$</td><td>$\{0\}$, les droites et les plans qui passent par $0$, et $ℝ³$ tout entier</td></tr></tbody></table></div>
<p><b>Avec des vecteurs (Vect) :</b> on compte les vecteurs non colinéaires.</p>
<ul><li>$Vect((1, 1, 0))$ : un vecteur non nul, c'est une droite.</li><li>$Vect((1, 0, 0), (0, 1, 0))$ : deux vecteurs non colinéaires, c'est un plan (celui d'équation $z = 0$).</li></ul>
<p><b>Avec des équations, dans $ℝ³$ :</b> chaque équation indépendante enlève une dimension.</p>
<ul><li>une équation, comme $x + y − z = 0$ : un plan ;</li><li>deux équations indépendantes : une droite. « Indépendantes » veut dire que l'une n'est pas un multiple de l'autre : $x + y = 0$ et $2x + 2y = 0$ disent la même chose et ne comptent que pour une.</li></ul>`},
 "l-affine":{
  "Sous-espace affine":`<p><b>L'idée :</b> un sous-espace vectoriel passe toujours par $0$. Un sous-espace <b>affine</b>, c'est le même ensemble, mais <b>décalé</b> : il ne passe plus forcément par $0$.</p>
<p><b>Exemple dans le plan :</b></p>
<ul><li>la droite $y = 2x$ passe par $(0, 0)$ : c'est un sev, $Vect((1, 2))$ ;</li><li>la droite $y = 2x + 1$ est la même, décalée de $1$ vers le haut. Elle passe par $(0, 1)$ mais pas par $(0, 0)$.</li></ul>
<p>On l'écrit $(0, 1) + Vect((1, 2))$ : le point de départ $(0, 1)$, plus tous les multiples de la direction $(1, 2)$.</p>
<p><b>Mettre un ensemble sous cette forme :</b> on sépare la partie sans paramètre. Exemple : $(3 + t, −t) = (3, 0) + t(1, −1)$. Donc l'ensemble des $(3 + t, −t)$ est $(3, 0) + Vect((1, −1))$, une droite affine.</p>`,
  "Les solutions d'un système : a + S₀":`<p><b>La règle :</b> si un système a au moins une solution $a$, alors toutes ses solutions s'écrivent $a + S₀$, où $S₀$ est l'ensemble des solutions du système homogène associé.</p>
<p><b>Exemple :</b> $x − y = 2$.</p>
<ol><li>Une solution, à l'œil : $a = (2, 0)$, car $2 − 0 = 2$.</li><li>Le système homogène $x − y = 0$ : $x = y$, donc les solutions sont les $(t, t)$, c'est-à-dire $Vect((1, 1))$.</li><li>Toutes les solutions : $(2, 0) + Vect((1, 1))$.</li></ol>
<p><b>Vérification avec $t = 1$ :</b> $(2, 0) + (1, 1) = (3, 1)$, et $3 − 1 = 2$. Juste.</p>
<p><b>Si le système n'a aucune solution,</b> l'ensemble est vide. Exemple : $x + y = 1$ et $x + y = 2$ ne peuvent pas être vraies en même temps.</p>`,
  "Équations d'un sous-espace affine":`<p><b>L'idée :</b> un point $M$ est dans $a + F$ quand $M − a$ est dans $F$. Pour trouver les équations de $a + F$, on reprend celles de $F$ et on remplace chaque variable par « variable − la coordonnée de $a$ ».</p>
<p><b>Exemple dans le plan :</b> $F$ est la droite $y − 2x = 0$, et $a = (0, 1)$.</p>
<ol><li>On remplace $x$ par $x − 0$ et $y$ par $y − 1$ : $(y − 1) − 2x = 0$.</li><li>On simplifie : $y − 2x = 1$, c'est-à-dire $y = 2x + 1$.</li></ol>
<p>On retrouve la droite décalée.</p>
<p><b>Ce qu'on remarque :</b> le second membre n'est plus $0$. C'est le signe que l'ensemble ne passe pas par $0$ : ce n'est pas un sous-espace vectoriel.</p>`},
 "l-matrices":{
  "Vocabulaire":`<p><b>Une matrice, c'est un tableau de nombres</b>, rangés en lignes et en colonnes.</p>
<p>Exemple : $A = ${mat([[1,4,-2],[0,3,5]])}$. Elle a $2$ lignes et $3$ colonnes : sa <b>taille</b> est $2 × 3$ (toujours les lignes d'abord).</p>
<p><b>Les notations du cours :</b> $M_{n,p}(ℝ)$ est l'ensemble des matrices à $n$ lignes et $p$ colonnes, et $M_{n}(ℝ)$ celui des matrices carrées $n × n$. $L_{i}(A)$ est la ligne $i$ de $A$, et $C_{j}(A)$ sa colonne $j$.</p>
<p><b>Le coefficient</b> $a_{ij}$ est celui de la ligne $i$ et de la colonne $j$ :</p>
<ul><li>$a_{13} = −2$ : ligne $1$, colonne $3$ ;</li><li>$a_{21} = 0$ : ligne $2$, colonne $1$.</li></ul>
<p><b>Les matrices à connaître :</b></p>
<ul><li><b>carrée</b> : autant de lignes que de colonnes ;</li><li><b>nulle</b> : que des $0$ ;</li><li><b>identité</b> $I_{2} = ${mat([[1,0],[0,1]])}$ : des $1$ sur la diagonale, des $0$ ailleurs ;</li><li><b>diagonale</b> : des $0$ partout sauf sur la diagonale, comme $diag(3, 7) = ${mat([[3,0],[0,7]])}$.</li></ul>`,
  "Somme et multiplication par un scalaire":`<p><b>Additionner deux matrices :</b> case par case. Il faut qu'elles aient la même taille.</p>
<p>$${mat([[1,2],[3,4]])} + ${mat([[0,-1],[2,2]])} = ${mat([[1,1],[5,6]])}$</p>
<p>Case en haut à gauche : $1 + 0 = 1$ ; en haut à droite : $2 + (−1) = 1$ ; et ainsi de suite.</p>
<p><b>Multiplier par un nombre</b> (un « scalaire ») : on multiplie chaque case.</p>
<p>$3 × ${mat([[1,-2],[0,4]])} = ${mat([[3,-6],[0,12]])}$</p>
<p><b>Interdit :</b> additionner une matrice $2 × 2$ et une matrice $2 × 3$. Il manquerait des cases en face.</p>`,
  "Matrice fois colonne":`<p><b>Multiplier une matrice par une colonne :</b> chaque ligne de la matrice « rencontre » la colonne. On multiplie terme à terme et on additionne.</p>
<p>$${mat([[1,2],[3,-1]])} × ${mat([[2],[5]])} = ${mat([[12],[1]])}$</p>
<ul><li>ligne $1$ : $1 × 2 + 2 × 5 = 2 + 10 = 12$ ;</li><li>ligne $2$ : $3 × 2 + (−1) × 5 = 6 − 5 = 1$.</li></ul>
<p><b>Autre lecture, par colonnes :</b> le résultat est $2$ fois la première colonne plus $5$ fois la seconde : $2(1, 3) + 5(2, −1) = (2 + 10, 6 − 5) = (12, 1)$. Même résultat.</p>
<p><b>À quoi ça sert :</b> un système s'écrit $AX = B$. Le système « $x + 2y = 4$ et $3x − y = 5$ » devient $${mat([[1,2],[3,-1]])} × ${mat([["x"],["y"]])} = ${mat([[4],[5]])}$ : les coefficients dans $A$, les inconnues dans $X$, les seconds membres dans $B$.</p>`,
  "Le produit AB":`<p><b>Quand peut-on multiplier ?</b> Il faut que le nombre de <b>colonnes</b> de $A$ soit égal au nombre de <b>lignes</b> de $B$. Une matrice $2 × 3$ fois une $3 × 4$ donne une $2 × 4$ : les tailles « du milieu » se touchent et disparaissent.</p>
<p><b>La règle : case (ligne $i$, colonne $j$) = ligne $i$ de $A$ fois colonne $j$ de $B$.</b></p>
<p>$${mat([[1,2],[0,1]])} × ${mat([[3,0],[1,4]])} = ${mat([[5,8],[1,4]])}$</p>
<ul><li>case $(1, 1)$ : ligne $(1, 2)$ fois colonne $(3, 1)$ : $1 × 3 + 2 × 1 = 5$ ;</li><li>case $(1, 2)$ : ligne $(1, 2)$ fois colonne $(0, 4)$ : $0 + 8 = 8$ ;</li><li>case $(2, 1)$ : ligne $(0, 1)$ fois colonne $(3, 1)$ : $0 + 1 = 1$ ;</li><li>case $(2, 2)$ : ligne $(0, 1)$ fois colonne $(0, 4)$ : $0 + 4 = 4$.</li></ul>
<p><b>Dans l'autre ordre,</b> $${mat([[3,0],[1,4]])} × ${mat([[1,2],[0,1]])} = ${mat([[3,6],[1,6]])}$ : ce n'est pas pareil.</p>`,
  "Les règles qui marchent":`<p><b>Ce qui marche comme avec les nombres :</b></p>
<ul><li>$(AB)C = A(BC)$ : on peut regrouper comme on veut ;</li><li>$A(B + C) = AB + AC$ : on peut développer ;</li><li>$I × A = A$ : l'identité joue le rôle du $1$.</li></ul>
<p><b>Ce qui ne marche PAS :</b></p>
<ul><li>$AB$ et $BA$ ne sont en général pas égaux (exemple à l'écran précédent) ;</li><li>$AB = 0$ n'oblige pas $A$ ou $B$ à être nulle. Avec $A = ${mat([[0,1],[0,0]])}$, on a $A × A = ${mat([[0,0],[0,0]])}$, alors que $A$ n'est pas nulle.</li></ul>
<p>$A²$ veut dire $A × A$.</p>
<p><b>La conséquence piège :</b> $(A + B)² = A² + AB + BA + B²$. On ne peut pas regrouper $AB + BA$ en $2AB$, puisque $AB ≠ BA$.</p>`},
 "l2-inverse":{
  "Inverser une matrice":`<p><b>L'idée vient des nombres :</b> l'inverse de $5$ est $1/5$, car $5 × 1/5 = 1$. Pour une matrice carrée $A$, son inverse $A^{−1}$ est la matrice telle que $A × A^{−1} = I$, l'identité.</p>
<p><b>Exemple :</b> $A = ${mat([[2,0],[0,5]])}$. Son inverse est $${mat([["1/2",0],[0,"1/5"]])}$ : on vérifie que le produit donne $${mat([[1,0],[0,1]])}$.</p>
<p><b>À quoi ça sert :</b> pour résoudre $AX = Y$, on multiplie par $A^{−1}$ et on obtient directement $X = A^{−1} Y$, comme on divise par $5$ pour résoudre $5x = 10$.</p>
<p><b>Toutes ne sont pas inversibles,</b> comme $0$ n'a pas d'inverse. La matrice nulle, par exemple, ne l'est pas.</p>
<p><b>Un raccourci :</b> pour des matrices carrées, il suffit de vérifier $AB = I$ ; on a alors automatiquement $BA = I$.</p>`,
  "Taille 2, et les règles":`<p><b>Pour une matrice $2 × 2$, il y a une formule.</b> Pour $A = ${mat([["a","b"],["c","d"]])}$, on calcule $ad − bc$.</p>
<ul><li>Si $ad − bc = 0$ : $A$ n'est pas inversible.</li><li>Sinon : on échange $a$ et $d$, on change le signe de $b$ et $c$, et on divise par $ad − bc$.</li></ul>
<p><b>Exemple :</b> $A = ${mat([[2,1],[5,3]])}$. $ad − bc = 2 × 3 − 1 × 5 = 1$. Donc $A^{−1} = ${mat([[3,-1],[-5,2]])}$.</p>
<p><b>Vérification :</b> $${mat([[2,1],[5,3]])} × ${mat([[3,-1],[-5,2]])} = ${mat([[1,0],[0,1]])}$ (case $(1, 1)$ : $6 − 5 = 1$ ; case $(1, 2)$ : $−2 + 2 = 0$…).</p>
<p><b>Non inversible :</b> $${mat([[2,4],[1,2]])}$, car $2 × 2 − 4 × 1 = 0$. Ses lignes sont proportionnelles.</p>
<p><b>La règle du produit :</b> $(AB)^{−1} = B^{−1} A^{−1}$. L'ordre s'inverse.</p>`},
 "l2-gauss-inv":{
  "La méthode":`<p><b>Pour inverser une matrice plus grande,</b> on utilise le pivot de Gauss sur un grand tableau.</p>
<ol><li>On écrit $A$ à gauche et $I$ à droite.</li><li>On fait le pivot sur les lignes, en appliquant chaque opération aux deux moitiés.</li><li>Quand la gauche est devenue $I$, la droite est $A^{−1}$.</li></ol>
<p><b>Exemple :</b> $A = ${mat([[1,2],[1,3]])}$.</p>
<ul><li>Départ : $${mat([[1,2,1,0],[1,3,0,1]])}$ (gauche : $A$ ; droite : $I$).</li><li>$L_{2} ← L_{2} − L_{1}$ : $${mat([[1,2,1,0],[0,1,-1,1]])}$.</li><li>$L_{1} ← L_{1} − 2L_{2}$ : $${mat([[1,0,3,-2],[0,1,-1,1]])}$.</li></ul>
<p>La gauche est $I$ : $A^{−1} = ${mat([[3,-2],[-1,1]])}$. La formule de taille $2$ donne la même chose ($ad − bc = 1$).</p>
<p><b>Si une ligne de zéros apparaît à gauche,</b> on s'arrête : $A$ n'est pas inversible.</p>`,
  "Vérifier son résultat":`<p><b>Une erreur de signe arrive vite.</b> Avant de rendre, on vérifie que $A × A^{−1} = I$, au moins sur une ligne.</p>
<p><b>Avec l'exemple précédent :</b> la première ligne de $A$ est $(1, 2)$.</p>
<ul><li>fois la première colonne de $A^{−1}$, $(3, −1)$ : $3 − 2 = 1$. Bon, on attend $1$ ;</li><li>fois la deuxième colonne, $(−2, 1)$ : $−2 + 2 = 0$. Bon, on attend $0$.</li></ul>
<p><b>À retenir :</b> dire que $A$ est inversible, c'est la même chose que dire :</p>
<ul><li>le pivot transforme $A$ en $I$ ;</li><li>$AX = 0$ n'a que la solution $X = 0$ ;</li><li>$AX = Y$ a une seule solution, quel que soit $Y$.</li></ul>`},
 "l2-relation":{
  "L'idée":`<p><b>Le but :</b> à partir d'une égalité entre $A$, $A²$ et $I$, écrire « $A × (quelque chose) = I$ ». Le « quelque chose » est alors $A^{−1}$.</p>
<p><b>Exemple :</b> on sait que $A² = 4A − 3I$.</p>
<ol><li>On met tout ce qui contient $A$ du même côté : $A² − 4A = −3I$.</li><li>On factorise par $A$ : $A(A − 4I) = −3I$.</li><li>On divise par $−3$ (on multiplie par $−1/3$) : $A × (−1/3)(A − 4I) = I$.</li></ol>
<p>Donc $A$ est inversible et $A^{−1} = (1/3)(4I − A)$.</p>
<p><b>Deux règles :</b> on ne « divise » jamais par une matrice ; et on a le droit de factoriser $A² − 4A$ en $A(A − 4I)$, car $A × I = A$.</p>`,
  "Pour le CC2 : deux formes plus dures":`<p><b>Même idée, en plus long.</b> Les écrans suivants viennent des CC2 et de l'examen de janvier.</p>
<ul><li>Une matrice de taille $4$ : on calcule $A²$ à la main, on trouve une relation (pour celle de l'écran suivant, $A² = 2A + 3I$), puis on fait comme à l'écran précédent.</li><li>Une relation entre deux matrices, comme $AB = A + B$ : on cherche un produit qui donne $I$.</li></ul>
<p>Dans tous les cas, le but est le même : faire apparaître « (une matrice) × (une autre) $= I$ ».</p>`,
  "Examen de janvier 2026 : AB = A + B":`<p><b>On sait que $AB = A + B$.</b> On veut montrer que $I − A$ est inversible.</p>
<ol><li>On développe $(I − A)(I − B)$, en gardant l'ordre : $I − B − A + AB$.</li><li>On remplace $AB$ par $A + B$ : $I − B − A + A + B$.</li><li>Tout se simplifie : il reste $I$.</li></ol>
<p>Donc $(I − A)(I − B) = I$ : $I − A$ est inversible, et son inverse est $I − B$.</p>
<p><b>La suite :</b> une matrice et son inverse commutent (le produit dans un sens est égal au produit dans l'autre : $MN = NM$), donc $(I − B)(I − A) = I$ aussi. En développant : $I − A − B + BA = I$, donc $BA = A + B$. Et comme $AB = A + B$, on obtient $AB = BA$.</p>`},
 "l2-libre":{
  "Libre, liée":`<p><b>Une famille de vecteurs est liée</b> quand l'un d'eux peut s'écrire avec les autres. Sinon, elle est <b>libre</b> : chaque vecteur apporte une direction nouvelle.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Famille</th><th>Libre ou liée</th><th>Pourquoi</th></tr></thead><tbody>
<tr><td>$(1, 0)$, $(0, 1)$</td><td>libre</td><td>aucun n'est un multiple de l'autre</td></tr>
<tr><td>$(1, 2)$, $(3, 6)$</td><td>liée</td><td>$(3, 6) = 3(1, 2)$</td></tr>
<tr><td>$(1, 0, 1)$, $(0, 1, 1)$, $(1, 1, 2)$</td><td>liée</td><td>le troisième est la somme des deux premiers</td></tr>
<tr><td>$(1, 0)$, $(0, 1)$, $(2, 5)$</td><td>liée</td><td>3 vecteurs dans $ℝ²$ : toujours liée</td></tr></tbody></table></div>
<p><b>La définition officielle :</b> la famille est libre si la seule façon d'obtenir $0$ en combinant les vecteurs est de tout multiplier par $0$. Avec $(1, 2)$ et $(3, 6)$, on a $3(1, 2) − 1(3, 6) = 0$ avec des coefficients non nuls : liée.</p>
<p><b>Le test en pratique :</b> on résout le système « combinaison $= 0$ » par le pivot. Une seule solution (tout à $0$) : libre. Une inconnue libre : liée.</p>`,
  "Examen de janvier 2026, ex. 5":`<p><b>Ce qu'on veut montrer :</b> si $v_{1}, …, v_{k}$ sont libres, et qu'en ajoutant $v$ la famille devient liée, alors $v$ s'écrit avec $v_{1}, …, v_{k}$.</p>
<p><b>L'idée :</b> les $v_{i}$ seuls ne peuvent pas faire $0$. Si l'ajout de $v$ permet de faire $0$, c'est forcément grâce à $v$.</p>
<p><b>La preuve, pas à pas :</b></p>
<ol><li>La famille avec $v$ est liée : il existe des nombres $λ_{1}, …, λ_{k}, α$, pas tous nuls, avec $λ_{1}v_{1} + … + λ_{k}v_{k} + αv = 0$.</li><li>Si $α$ valait $0$, il resterait une combinaison nulle des $v_{i}$ seuls, avec des $λ_{i}$ pas tous nuls : impossible, ils sont libres. Donc $α ≠ 0$.</li><li>On peut alors diviser par $α$ : $v = −(λ_{1}/α)v_{1} − … − (λ_{k}/α)v_{k}$.</li></ol>`},
 "l2-base":{
  "Une base":`<p><b>Une base</b>, c'est une famille de vecteurs avec laquelle on peut écrire <b>tous</b> les vecteurs, et chacun d'<b>une seule façon</b>.</p>
<ul><li>« tous » : la famille est génératrice ;</li><li>« une seule façon » : elle est libre.</li></ul>
<p><b>La base canonique de $ℝ²$ :</b> $(1, 0)$ et $(0, 1)$. Tout $(x, y)$ s'écrit $x(1, 0) + y(0, 1)$.</p>
<p><b>Une autre base de $ℝ²$ :</b> $(1, 1)$ et $(1, −1)$. Le vecteur $(5, 3)$ s'écrit $4(1, 1) + 1(1, −1)$ : ses <b>coordonnées</b> dans cette base sont $(4, 1)$.</p>
<p><b>Le nombre de vecteurs est fixé :</b> une base de $ℝⁿ$ a toujours exactement $n$ vecteurs. Deux vecteurs ne suffisent pas pour $ℝ³$, quatre sont trop.</p>
<p><b>Le test pour $n$ vecteurs de $ℝⁿ$ :</b> le pivot sur la matrice de leurs coordonnées donne $n$ pivots.</p>`},
 "l2-applin":{
  "Définition":`<p><b>Une application linéaire</b> respecte l'addition et la multiplication par un nombre : $f(x + x′) = f(x) + f(x′)$ et $f(λx) = λf(x)$.</p>
<p><b>La notation</b> $f : ℝⁿ → ℝᵐ$ veut dire : $f$ prend un vecteur de $ℝⁿ$ et rend un vecteur de $ℝᵐ$. Par exemple, $f(x, y) = (x + y, x, y)$ va de $ℝ²$ dans $ℝ³$. Dans la définition, $x$ et $x′$ sont deux vecteurs du départ, et $λ$ un nombre.</p>
<p><b>Le test rapide :</b> chaque coordonnée doit être une combinaison des variables, sans constante ajoutée, sans produit de variables, sans carré.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>$f(x, y)$</th><th>Linéaire ?</th><th>Pourquoi</th></tr></thead><tbody>
<tr><td>$(2x + y, x − y)$</td><td>oui</td><td>que des combinaisons de $x$ et $y$</td></tr>
<tr><td>$(x + 1, y)$</td><td>non</td><td>la constante $+1$ : $f(0, 0) = (1, 0) ≠ (0, 0)$</td></tr>
<tr><td>$(xy, x)$</td><td>non</td><td>un produit de variables</td></tr>
<tr><td>$(x², y)$</td><td>non</td><td>un carré</td></tr></tbody></table></div>
<p><b>Le premier réflexe :</b> calculer $f(0)$. Une application linéaire envoie toujours $0$ sur $0$. Si ce n'est pas le cas, c'est fini : pas linéaire.</p>`,
  "La matrice de f":`<p><b>Toute application linéaire s'écrit $f(X) = AX$.</b> Pour trouver $A$ : chaque <b>ligne</b> contient les coefficients d'une coordonnée.</p>
<p><b>Exemple :</b> $f(x, y) = (x + 2y, 3x − y, y)$.</p>
<ul><li>première coordonnée, $x + 2y$ : ligne $(1, 2)$ ;</li><li>deuxième, $3x − y$ : ligne $(3, −1)$ ;</li><li>troisième, $y = 0x + 1y$ : ligne $(0, 1)$.</li></ul>
<p>Donc $A = ${mat([[1,2],[3,-1],[0,1]])}$.</p>
<p><b>Autre lecture :</b> les colonnes de $A$ sont les images des vecteurs de base. $f(1, 0) = (1, 3, 0)$ : c'est la première colonne.</p>
<p><b>La taille :</b> autant de lignes que l'arrivée a de coordonnées ($3$), autant de colonnes que le départ ($2$).</p>`},
 "l2-ker-im":{
  "Noyau et image":`<p><b>Deux ensembles associés à une application linéaire $f$ :</b></p>
<ul><li>le <b>noyau</b> $ker f$ : les vecteurs que $f$ envoie sur $0$. On le trouve en résolvant $f(X) = 0$ ;</li><li>l'<b>image</b> $im f$ : tous les résultats possibles $f(X)$. C'est le $Vect$ des colonnes de la matrice.</li></ul>
<p><b>Exemple :</b> $f(x, y) = (x − y, 2x − 2y)$.</p>
<ul><li>Noyau : $x − y = 0$ (la deuxième équation est la même fois $2$), donc $y = x$ : $ker f = Vect((1, 1))$.</li><li>Image : $f(x, y) = (x − y)(1, 2)$, donc $im f = Vect((1, 2))$.</li></ul>
<p><b>Deux mots à connaître :</b></p><ul><li>$f$ est <b>injective</b> quand deux vecteurs différents ont toujours des images différentes : jamais $f(x) = f(x′)$ avec $x ≠ x′$ ;</li><li>$f$ est <b>surjective</b> quand chaque vecteur de l'arrivée est l'image d'au moins un vecteur du départ.</li></ul><p>$\{0\}$ est l'ensemble qui ne contient que le vecteur nul.</p>
<p><b>À quoi ça sert :</b></p>
<ul><li>$f$ est injective exactement quand $ker f = \{0\}$. Ici le noyau contient $(1, 1)$ : $f$ n'est pas injective ($f(1, 1) = f(0, 0) = 0$) ;</li><li>$f$ est surjective quand l'image est tout l'espace d'arrivée. Ici c'est une droite de $ℝ²$ : pas surjective.</li></ul>`,
  "Les deux preuves de cours":`<p><b>Preuve 1 : le noyau est un sous-espace vectoriel.</b> On vérifie les trois conditions :</p>
<ul><li>$0$ est dedans, car $f(0) = 0$ ;</li><li>si $f(x) = 0$ et $f(x′) = 0$, alors $f(x + x′) = f(x) + f(x′) = 0$ : la somme est dedans ;</li><li>si $f(x) = 0$, alors $f(λx) = λf(x) = 0$ : les multiples sont dedans.</li></ul>
<p><b>Preuve 2 : si $ker f = \{0\}$, alors $f$ est injective.</b></p>
<ol><li>On prend $x$ et $x′$ avec la même image : $f(x) = f(x′)$.</li><li>Alors $f(x − x′) = f(x) − f(x′) = 0$, donc $x − x′$ est dans le noyau.</li><li>Le noyau ne contient que $0$ : $x − x′ = 0$, donc $x = x′$.</li></ol>
<p>Ces deux preuves formaient l'exercice 1 de l'examen de janvier 2026.</p>`},
 "l2-composee":{
  "Composée et produit de matrices":`<p><b>Composer,</b> c'est enchaîner : $f ∘ g$ veut dire « d'abord $g$, puis $f$ ». Il faut que ce qui sort de $g$ puisse entrer dans $f$.</p>
<p><b>La règle :</b> la matrice de $f ∘ g$ est le produit $Mat(f) × Mat(g)$, dans cet ordre.</p>
<p><b>Exemple :</b> $g(x) = (x, 2x)$, de $ℝ$ dans $ℝ²$, et $f(a, b) = a + b$, de $ℝ²$ dans $ℝ$.</p>
<ul><li>Directement : $(f ∘ g)(x) = f(x, 2x) = x + 2x = 3x$.</li><li>Avec les matrices : $Mat(f) = ${mat([[1,1]])}$ et $Mat(g) = ${mat([[1],[2]])}$. Leur produit vaut $1 × 1 + 1 × 2 = 3$.</li></ul>
<p>Les deux méthodes donnent $3x$.</p>
<p><b>Le piège :</b> $f ∘ g$ et $g ∘ f$ ne sont pas la même chose ; parfois l'une n'existe même pas.</p>`},
 "l2-inter":{
  "F ∩ G est un sous-espace":`<p><b>$F ∩ G$</b> contient les vecteurs qui sont à la fois dans $F$ et dans $G$.</p>
<p><b>Exemple dans $ℝ³$ :</b> $F$ est le plan $z = 0$ et $G$ le plan $x = 0$. Les vecteurs des deux à la fois vérifient $x = 0$ et $z = 0$ : ce sont les $(0, y, 0)$, une droite.</p>
<p><b>Pourquoi c'est toujours un sous-espace</b> (question de cours) :</p>
<ul><li>$0$ est dans $F$ et dans $G$, donc dans $F ∩ G$ ;</li><li>si $x$ et $y$ sont dans $F ∩ G$ : $x + y$ est dans $F$ (car $F$ est un sous-espace), et dans $G$ pour la même raison ;</li><li>même raisonnement pour $λx$.</li></ul>
<p><b>Attention, l'union ne marche pas :</b> $F ∪ G$ (les vecteurs qui sont dans $F$ ou dans $G$) n'est pas un sous-espace en général. Dans le plan, avec les deux axes : $(1, 0) + (0, 1) = (1, 1)$, qui n'est sur aucun des deux axes.</p>`,
  "Montrer F = G":`<p><b>Pour montrer que deux sous-espaces sont égaux,</b> on montre les deux inclusions : $F ⊂ G$, puis $G ⊂ F$. $F ⊂ G$ se lit « $F$ est inclus dans $G$ » : tout vecteur de $F$ est aussi dans $G$.</p>
<p><b>L'astuce quand $G = Vect(g_{1}, g_{2})$ :</b> pour montrer $G ⊂ F$, il suffit de vérifier que $g_{1}$ et $g_{2}$ sont dans $F$. Comme $F$ est un sous-espace, il contient alors toutes leurs combinaisons.</p>
<p><b>Exemple :</b> $F$ est le plan $x + y − z = 0$ et $G = Vect((1, 0, 1), (0, 1, 1))$.</p>
<ul><li>$(1, 0, 1)$ : $1 + 0 − 1 = 0$, dans $F$ ;</li><li>$(0, 1, 1)$ : $0 + 1 − 1 = 0$, dans $F$.</li></ul>
<p>Donc $G ⊂ F$. Pour l'autre inclusion, on résout l'équation de $F$ : $z = x + y$, donc $(x, y, x + y) = x(1, 0, 1) + y(0, 1, 1)$, qui est dans $G$. Donc $F = G$.</p>`},
 "l2-projection":{
  "Vecteur normal et décomposition":`<p><b>Le vecteur normal :</b> pour un plan d'équation $ax + by + cz = 0$, le vecteur $n = (a, b, c)$ est perpendiculaire au plan.</p>
<p><b>L'idée de la projection :</b> tout vecteur $v$ se coupe en deux morceaux : un morceau $w$ dans le plan, et un morceau le long de $n$. C'est comme l'ombre d'un objet sur le sol, à midi.</p>
<p>Si $v = (x, y, z)$, alors $v = w + λn$, avec $λ = (ax + by + cz)/(a² + b² + c²)$. On note $p(v) = w$ : c'est la <b>projection</b> de $v$ sur le plan.</p>
<p><b>Exemple simple :</b> le sol, $z = 0$, avec $n = (0, 0, 1)$. Pour $v = (2, 3, 5)$ : $λ = 5/1 = 5$, et $w = (2, 3, 5) − 5(0, 0, 1) = (2, 3, 0)$. L'ombre de $v$ sur le sol, c'est bien $(2, 3, 0)$.</p>
<p><b>Exemple :</b> le plan $x + y + z = 0$, $n = (1, 1, 1)$, et $v = (1, 2, 3)$. $λ = (1 + 2 + 3)/3 = 2$, donc $w = (1, 2, 3) − 2(1, 1, 1) = (−1, 0, 1)$. Vérification : $−1 + 0 + 1 = 0$, $w$ est bien dans le plan.</p>`,
  "La symétrie":`<p><b>La symétrie par rapport au plan,</b> c'est le reflet dans un miroir : on garde le morceau $w$ qui est dans le plan, et on retourne le morceau perpendiculaire.</p>
<p>$s(v) = w − λn = v − 2λn$.</p>
<p><b>Exemple avec le sol</b> $z = 0$ : $v = (2, 3, 5)$ devient $(2, 3, −5)$. Le point passe de l'autre côté, à la même distance.</p>
<p><b>Exemple</b> avec le plan $x + y + z = 0$ et $v = (1, 2, 3)$ ($λ = 2$) : $s(v) = (1, 2, 3) − 4(1, 1, 1) = (−3, −2, −1)$.</p>
<p><b>Lien avec la projection :</b> le projeté $w$ est le milieu de $v$ et de $s(v)$. Donc $s(v) = 2p(v) − v$, et en matrices $Mat(s) = 2Mat(p) − I_{3}$.</p>
<p><b>Deux vérifications utiles :</b> projeter deux fois ne change rien ($p ∘ p = p$) ; faire deux fois la symétrie ramène au départ ($s ∘ s = id$, où $id$ est l'application qui ne change rien : $id(v) = v$).</p>`}},
ana:{
 "a-quantif":{
  "∀ et ∃":`<p><b>Deux signes pour dire deux choses très différentes.</b></p>
<ul><li><b>∀</b> se lit « pour tout ». Il annonce une phrase qui doit être vraie pour <b>tous</b> les éléments, sans exception.</li><li><b>∃</b> se lit « il existe ». Il annonce une phrase qui doit être vraie pour <b>au moins un</b> élément.</li></ul>
<p><b>Lire une phrase.</b> « ∀x ∈ ℝ, x² ≥ 0 » se lit : « pour tout nombre réel x, x² est positif ou nul ». C'est vrai : un carré n'est jamais négatif.</p>
<p><b>Les autres signes de ces phrases.</b> ∈ se lit « appartient à » : x ∈ ℝ veut dire « x est un nombre réel » (ℝ est l'ensemble des réels, ℕ celui des entiers naturels 0, 1, 2…). Le cours écrit aussi P(x) pour « une phrase qui parle de x », comme x² ≥ 0.</p>
<p><b>Trois exemples pour sentir la différence :</b></p>
<ul><li>« ∀x ∈ ℝ, x² &gt; 0 » est <b>fausse</b>. Il suffit d'un seul x qui ne marche pas : x = 0 donne 0, qui n'est pas strictement positif. Ce x s'appelle un contre-exemple.</li><li>« ∃x ∈ ℝ, x² = 9 » est <b>vraie</b>. Il suffit d'en montrer un : x = 3.</li><li>« ∃x ∈ ℝ, x² = −1 » est <b>fausse</b>. Là, un exemple ne suffit pas : il faut expliquer qu'aucun réel ne convient (tous les carrés sont positifs ou nuls).</li></ul>
<p><b>Le tableau à retenir :</b></p>
<ul><li>prouver une phrase « ∀ » : je prends un x quelconque (« Soit x ∈ … ») et je raisonne avec la lettre ;</li><li>montrer qu'une phrase « ∀ » est fausse : je donne <b>un</b> contre-exemple ;</li><li>prouver une phrase « ∃ » : je donne <b>un</b> exemple ;</li><li>montrer qu'une phrase « ∃ » est fausse : je prouve que ça rate pour tous.</li></ul>`,
  "L'ordre compte":`<p><b>Avec des mots de tous les jours.</b></p>
<ul><li>« Pour toute personne, il existe une mère » : chacun a sa mère. Vrai.</li><li>« Il existe une mère, pour toute personne » : une même femme serait la mère de tout le monde. Faux.</li></ul>
<p>Les mêmes mots, dans un autre ordre, et le sens change complètement.</p>
<p><b>Avec des nombres.</b></p>
<ul><li>« ∀x ∈ ℝ, ∃y ∈ ℝ, y &gt; x » : pour chaque x, je peux trouver un y plus grand. Vrai : je prends y = x + 1. Remarque que <b>mon y dépend de x</b>.</li><li>« ∃y ∈ ℝ, ∀x ∈ ℝ, y &gt; x » : il y aurait un nombre y plus grand que tous les réels. Faux.</li></ul>
<p><b>La règle.</b> On lit de gauche à droite. Ce qui est annoncé par un ∃ a le droit de dépendre de tout ce qui est écrit <b>avant</b> lui, mais pas de ce qui est écrit après.</p>
<p><b>Pourquoi c'est important ici.</b> Toutes les définitions du chapitre commencent par « ∀ε &gt; 0, ∃N… » : pour chaque ε, on choisit un N, et ce N dépend de ε. Si on change ε, on a le droit de changer N.</p>`,
  "Nier une phrase":`<p><b>Nier une phrase</b>, c'est écrire exactement son contraire : la phrase qui est vraie quand la première est fausse.</p>
<p><b>Avec des mots.</b> Le contraire de « tous les élèves ont réussi » n'est pas « aucun n'a réussi ». C'est « <b>au moins un</b> élève n'a pas réussi ». Un « tous » devient un « il existe ».</p>
<p><b>Les règles :</b></p>
<ul><li>∀ devient ∃, et ∃ devient ∀ ;</li><li>la fin de la phrase est remplacée par son contraire : &lt; devient ≥, ≤ devient &gt;, = devient ≠.</li></ul>
<p><b>Exemple 1.</b> La phrase « ∀n ∈ ℕ, uₙ ≤ 5 » (tous les termes sont au plus 5). Son contraire : « ∃n ∈ ℕ, uₙ &gt; 5 » (au moins un terme dépasse 5).</p>
<p><b>Exemple 2, avec deux signes.</b> « ∀x ∈ ℝ, ∃y ∈ ℝ, y &gt; x ». On avance de gauche à droite : ∀ devient ∃, ∃ devient ∀, et « y &gt; x » devient « y ≤ x ». Résultat : « ∃x ∈ ℝ, ∀y ∈ ℝ, y ≤ x ».</p>
<p><b>Les signes du cours.</b> ⇒ veut dire « si… alors… » : P ⇒ Q se lit « si P, alors Q ». Et non(P) désigne le contraire de la phrase P.</p>
<p><b>Le cas de « si… alors… ».</b> Le contraire de « s'il pleut, je prends un parapluie » est « il pleut <b>et</b> je ne prends pas de parapluie ». On garde la première partie, et on nie la seconde.</p>
<p><b>La méthode sur la copie :</b> je recopie la phrase, puis je la réécris en changeant chaque ∀ et chaque ∃, sans rien changer d'autre, et à la fin je remplace la dernière affirmation par son contraire.</p>`},
 "a-abs":{
  "|x| et la distance":`<p><b>La valeur absolue |x|</b>, c'est le nombre sans son signe : |−7| = 7 et |3| = 3. Elle n'est jamais négative.</p>
<p><b>Ce qu'elle mesure : une distance.</b> Sur la droite des nombres, la distance entre a et b est |b − a|.</p>
<ul><li>Entre 2 et 5 : |5 − 2| = 3.</li><li>Entre −1 et 4 : |4 − (−1)| = 5.</li></ul>
<p>L'ordre n'a pas d'importance : |2 − 5| = |−3| = 3 aussi.</p>
<p><b>La traduction à savoir par cœur.</b> « |x − a| ≤ d » veut dire : « x est à une distance d'au plus d de a ». Donc x est entre a − d et a + d.</p>
<p>Exemple : |x − 3| ≤ 2. Les nombres à distance au plus 2 de 3 sont ceux entre 1 et 5 : 1 ≤ x ≤ 5.</p>
<p><b>Pourquoi on s'en sert tout le temps.</b> Dans les définitions de limite, on lit « |uₙ − ℓ| ≤ ε ». Cela veut dire : « le terme uₙ est à une distance d'au plus ε du nombre ℓ ». Rien de plus.</p>`,
  "Inégalités triangulaires":`<p><b>La première : |a + b| ≤ |a| + |b|.</b> La valeur absolue d'une somme ne dépasse jamais la somme des valeurs absolues.</p>
<ul><li>Avec a = 3 et b = 4 : |7| = 7, et 3 + 4 = 7. Il y a égalité.</li><li>Avec a = 3 et b = −4 : |−1| = 1, et 3 + 4 = 7. Cette fois c'est beaucoup plus petit, parce que les signes opposés se compensent.</li></ul>
<p><b>À quoi elle sert.</b> À remplacer quelque chose de compliqué par quelque chose de plus grand mais plus simple (on dit « majorer »). On coupe en morceaux, et on traite chaque morceau.</p>
<p>Exemple : on sait que |cos n| ≤ 1 et |sin n| ≤ 1. Alors |2 cos n + 3 sin n| ≤ 2 |cos n| + 3 |sin n| ≤ 2 + 3 = 5.</p>
<p><b>La seconde : | |a| − |b| | ≤ |a − b|.</b> L'écart entre les deux valeurs absolues ne dépasse pas la distance entre a et b.</p>
<p><b>L'erreur classique.</b> Écrire |a − b| ≤ |a| − |b|. C'est faux : avec a = 1 et b = 3, on aurait 2 ≤ −2. Avec un signe moins à l'intérieur, la majoration reste |a − b| ≤ |a| + |b|.</p>`},
 "a-intervalles":{
  "Ce qu'est un intervalle":`<p><b>Un intervalle</b>, c'est un morceau de la droite des nombres, <b>sans trou</b> : tous les réels compris entre deux bornes.</p>
<p><b>Lire les crochets.</b></p>
<ul><li>[2, 5] : de 2 à 5, les deux bornes comprises ;</li><li>]2, 5[ : de 2 à 5, sans 2 ni 5 ;</li><li>[2, 5[ : avec 2, sans 5 ;</li><li>[2, +∞[ : tous les réels à partir de 2.</li></ul>
<p>Le crochet « embrasse » la borne quand elle est comprise, et lui tourne le dos quand elle est exclue. Du côté de +∞ ou −∞, le crochet est toujours tourné vers l'extérieur.</p>
<p><b>Trois opérations entre ensembles :</b></p>
<ul><li>∩ (« inter ») garde ce qui est dans les deux : [0, 3] ∩ [2, 5] = [2, 3] ;</li><li>∪ (« union ») réunit : [0, 3] ∪ [2, 5] = [0, 5] ;</li><li>∖ (« privé de ») enlève : [0, 5] ∖ [2, 3] = [0, 2[ ∪ ]3, 5].</li></ul>
<p>Le dernier résultat a un trou : ce n'est plus un intervalle, mais une réunion de deux intervalles.</p>`,
  "Partie entière":`<p><b>La partie entière E(x)</b> d'un réel x, c'est l'entier situé <b>juste en dessous</b> de x (ou x lui-même, si x est déjà un entier).</p>
<ul><li>E(3,8) = 3 ;</li><li>E(7) = 7 ;</li><li>E(−1,2) = −2. Attention : on descend toujours. En dessous de −1,2, le premier entier est −2, pas −1.</li></ul>
<p><b>L'encadrement qui la définit :</b> E(x) ≤ x &lt; E(x) + 1. Le nombre x est coincé entre sa partie entière et l'entier suivant.</p>
<p><b>À quoi elle sert dans ce cours.</b> On a souvent besoin d'un <b>entier plus grand</b> qu'un réel donné. E(x) + 1 fait toujours l'affaire. Pour x = 12,3 : E(x) + 1 = 13, et 13 &gt; 12,3.</p>
<p><b>Dans les preuves de limites</b>, on cherche un rang N (un entier) plus grand que 1/ε. On prend N = E(1/ε) + 1. Par exemple, pour ε = 0,3 : 1/ε vaut environ 3,33, donc N = 3 + 1 = 4.</p>`},
 "a-bornes":{
  "Majorant et plus grand élément":`<p><b>Un majorant</b> d'un ensemble A, c'est un nombre qui est <b>au-dessus de tous</b> les éléments de A (ou égal). Pense à un plafond.</p>
<p>Exemple : A = [0, 1[, les réels de 0 à 1, sans 1. Le nombre 1 est un majorant. Mais 2 aussi, et 10 aussi : dès qu'il y a un plafond, tout ce qui est plus haut en est un aussi.</p>
<p><b>Un majorant n'est pas forcément dans A.</b> Ici, 1 n'est pas dans A, et c'est pourtant un majorant.</p>
<p><b>Le plus grand élément</b> (le maximum), c'est un majorant <b>qui est dans A</b>.</p>
<ul><li>[0, 1] a un plus grand élément : 1.</li><li>[0, 1[ n'en a pas. Si je propose 0,9, on me répond 0,95, qui est plus grand et encore dans A. Si je propose 0,99, on me répond 0,995. Aucun élément de A n'est au-dessus de tous les autres.</li></ul>
<p><b>Le vocabulaire en miroir, vers le bas :</b> un minorant est un plancher ; le plus petit élément (le minimum) est un minorant qui est dans A.</p>
<p><b>« Bornée »</b> veut dire : il y a un plafond et un plancher.</p>`,
  "La borne supérieure":`<p><b>Le problème.</b> [0, 1[ n'a pas de plus grand élément. Pourtant, on sent bien que « tout s'arrête à 1 ». La borne supérieure sert à dire ça proprement.</p>
<p><b>La définition.</b> La borne supérieure de A, notée sup(A), est <b>le plus petit des majorants</b> : le plafond le plus bas possible.</p>
<p><b>Sur l'exemple A = [0, 1[.</b> Ses majorants sont tous les nombres à partir de 1. Le plus petit d'entre eux est 1. Donc sup(A) = 1, même si 1 n'est pas dans A.</p>
<p><b>Le lien avec le maximum.</b> Quand A a un plus grand élément, c'est lui la borne supérieure. La différence : le maximum doit appartenir à A, la borne supérieure non.</p>
<p><b>Vers le bas</b>, c'est pareil : la borne inférieure inf(A) est le plus grand des minorants.</p>
<p><b>Un exemple complet.</b> A = {1, 1/2, 1/3, 1/4, …}, les nombres 1/n. Le cours l'écrit {1/n | n ∈ ℕ*} : ℕ* désigne les entiers 1, 2, 3…, sans le 0.</p>
<ul><li>Le plus grand est 1 : c'est le maximum, donc aussi la borne supérieure.</li><li>Vers le bas, les nombres s'approchent de 0 sans jamais l'atteindre : la borne inférieure est 0, et il n'y a pas de plus petit élément.</li></ul>
<p><b>Quand elle existe.</b> Dès que A n'est pas vide et qu'il a un majorant, sa borne supérieure existe. Si A n'a aucun plafond (comme l'ensemble des entiers naturels), il n'a pas de borne supérieure.</p>`},
 "a-carac-sup":{
  "Caractérisation avec ε":`<p><b>La question.</b> Comment prouver qu'un nombre m est bien la borne supérieure de A, c'est-à-dire le plus petit des majorants ? Il y a deux choses à vérifier.</p>
<ol><li><b>m est un majorant</b> : tous les éléments de A sont inférieurs ou égaux à m.</li><li><b>Rien de plus petit que m n'est un majorant.</b> Si je descends un peu sous m, d'une petite quantité ε, alors le nombre m − ε n'est plus au-dessus de tout le monde : il y a un élément de A qui le dépasse.</li></ol>
<p>La deuxième condition s'écrit : ∀ε &gt; 0, ∃a ∈ A, m − ε &lt; a. Elle se lit : « pour tout ε strictement positif, il existe un élément a de A plus grand que m − ε ».</p>
<p><b>Sur l'exemple A = [0, 1[ et m = 1.</b></p>
<ol><li>Tout élément de A est plus petit que 1 : 1 est un majorant.</li><li>Je descends de ε = 0,1 : il me faut un élément de A plus grand que 0,9. Je prends 0,95. Je descends de ε = 0,01 : je prends 0,995. Chaque fois, je peux prendre le nombre à mi-chemin entre 1 − ε et 1 (pour un ε plus grand que 1, 0 convient).</li></ol>
<p>Les deux conditions sont vraies : sup(A) = 1.</p>
<p><b>Pour le contrôle.</b> La phrase « m est un majorant de A et ∀ε &gt; 0, ∃a ∈ A, m − ε &lt; a » est une question de cours : elle a été demandée telle quelle au CC de 2025.</p>`,
  "Point adhérent":`<p><b>L'idée.</b> Un nombre x est « adhérent » à un ensemble A quand il <b>colle</b> à A : on peut trouver des éléments de A aussi près de x qu'on veut.</p>
<p><b>La définition</b> : ∀ε &gt; 0, ∃a ∈ A, |x − a| &lt; ε. Elle se lit : « pour toute distance ε, aussi petite soit-elle, il y a un élément de A à une distance de x plus petite que ε ».</p>
<p><b>Exemples avec A = [0, 1[.</b></p>
<ul><li>1 est adhérent à A : les nombres 0,9, puis 0,99, puis 0,999 sont dans A et s'approchent de 1 autant qu'on veut. Pourtant 1 n'est pas dans A.</li><li>2 n'est pas adhérent à A : tous les éléments de A sont à une distance de 2 supérieure à 1. Impossible de s'approcher.</li><li>0,5 est adhérent à A, tout simplement parce qu'il est dans A : on prend a = 0,5, à distance 0.</li></ul>
<p><b>Le lien avec les suites.</b> « x est adhérent à A » revient à dire : il existe une suite de nombres de A qui tend vers x. Pour 1 et [0, 1[, la suite 1 − 1/n convient : 0, puis 1/2, puis 2/3, puis 3/4…</p>
<p><b>Le lien avec la borne supérieure.</b> m = sup(A) revient à dire : m est un majorant de A, et il existe une suite de nombres de A qui tend vers m.</p>`},
 "a-suites":{
  "Les définitions":`<p><b>Une suite</b>, c'est une liste de nombres numérotés : u₀, u₁, u₂, u₃… Le terme numéro n se note uₙ. La suite entière se note (uₙ), avec des parenthèses.</p>
<p><b>Le vocabulaire, avec un exemple pour chaque mot :</b></p>
<ul><li><b>croissante</b> : chaque terme est au moins égal au précédent. 1, 3, 5, 7… ;</li><li><b>décroissante</b> : chaque terme est au plus égal au précédent. 10, 8, 6, 4… ;</li><li><b>monotone</b> : croissante ou décroissante (elle va toujours dans le même sens) ;</li><li><b>majorée</b> : il existe un plafond, le même pour tous les termes. La suite 1 − 1/n ne dépasse jamais 1 ;</li><li><b>minorée</b> : il existe un plancher ;</li><li><b>bornée</b> : un plafond et un plancher ;</li><li><b>périodique</b> : les termes se répètent à intervalles réguliers. 1, −1, 1, −1… se répète tous les 2 rangs.</li></ul>
<p><b>Lire la version en symboles.</b> « ∀n ∈ ℕ, uₙ₊₁ ≥ uₙ » veut dire : « pour tout numéro n, le terme suivant est au moins égal au terme numéro n ». C'est la définition de « croissante ».</p>
<p><b>« À partir d'un certain rang ».</b> On accepte que le début de la suite ne respecte pas la règle. La suite 5, 1, 2, 3, 4… n'est pas croissante (elle descend de 5 à 1), mais elle l'est à partir du rang 1.</p>`,
  "Méthodes pour la monotonie":`<p><b>La question.</b> Comment prouver qu'une suite est croissante (ou décroissante) pour <b>tous</b> les rangs, et pas seulement en regardant les premiers termes ?</p>
<p><b>Méthode 1 : le signe de la différence uₙ₊₁ − uₙ.</b> Si elle est toujours positive, chaque terme est plus grand que le précédent : la suite est croissante. Si elle est toujours négative : décroissante.</p>
<p>Exemple : uₙ = n² + n.</p>
<ol><li>J'écris uₙ₊₁ en remplaçant n par n + 1 : (n + 1)² + (n + 1).</li><li>Je calcule uₙ₊₁ − uₙ = (n² + 2n + 1) + n + 1 − n² − n = 2n + 2.</li><li>2n + 2 est positif pour tout entier naturel n : la suite est croissante.</li></ol>
<p><b>Méthode 2 : le quotient uₙ₊₁/uₙ</b>, à réserver aux suites dont <b>tous les termes sont strictement positifs</b>. Si ce quotient est toujours plus grand que 1, la suite est croissante ; plus petit que 1, décroissante.</p>
<p>Exemple : uₙ = 2ⁿ. Le quotient uₙ₊₁/uₙ vaut 2ⁿ⁺¹/2ⁿ = 2, qui est plus grand que 1 : la suite est croissante.</p>
<p><b>Laquelle choisir ?</b> La différence quand uₙ est écrit avec des sommes ; le quotient quand il est écrit avec des produits ou des puissances.</p>
<p><b>Méthode 3 : la récurrence</b>, pour les suites où chaque terme est calculé à partir du précédent (uₙ₊₁ = f(uₙ)). Elle a sa leçon plus loin.</p>`},
 "a-limite":{
  "La définition":`<p><b>L'idée.</b> Dire que la suite (uₙ) converge vers le nombre ℓ, c'est dire que ses termes <b>s'approchent de ℓ autant qu'on veut, et y restent</b>.</p>
<p><b>Lire la définition, morceau par morceau.</b></p>
<ul><li><b>ε</b> (epsilon) : une marge d'erreur qu'on s'autorise, aussi petite qu'on veut ;</li><li><b>|uₙ − ℓ| ≤ ε</b> : le terme uₙ est à une distance d'au plus ε de ℓ ;</li><li><b>N</b> : un rang à partir duquel c'est vrai pour <b>tous</b> les termes.</li></ul>
<p>La phrase « ∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − ℓ| ≤ ε » se lit donc : « quelle que soit la marge ε, il y a un rang N à partir duquel tous les termes sont à moins de ε de ℓ ».</p>
<p><b>C'est un jeu à deux.</b> Quelqu'un me donne une marge ε. Je dois répondre par un rang N. Si je peux toujours répondre, la suite converge.</p>
<p><b>Exemple : uₙ = 1/n, qui converge vers 0.</b></p>
<ul><li>On me donne ε = 0,1. Il faut 1/n ≤ 0,1, c'est-à-dire n ≥ 10. Je réponds N = 10.</li><li>On me donne ε = 0,01. Il faut n ≥ 100. Je réponds N = 100.</li></ul>
<p>Plus la marge est petite, plus le rang est grand : <b>N dépend de ε</b>.</p>
<p><b>Une suite qui ne converge pas :</b> 1, −1, 1, −1… Elle saute sans arrêt entre deux valeurs, elle ne reste près d'aucun nombre.</p>`,
  "Le modèle de rédaction":`<p><b>Le but.</b> Prouver qu'une suite converge vers ℓ en utilisant la définition. La rédaction est toujours la même : il faut l'apprendre comme un modèle à trous.</p>
<p><b>Exemple : uₙ = (2n + 1)/n, pour n ≥ 1, converge vers 2.</b></p>
<ol><li><b>Je calcule la distance à la limite.</b> uₙ − 2 = (2n + 1)/n − 2 = 1/n. Donc |uₙ − 2| = 1/n.</li><li><b>« Soit ε &gt; 0. »</b> Je prends une marge quelconque. Cette phrase est obligatoire.</li><li><b>Je choisis le rang.</b> Je veux 1/n ≤ ε, c'est-à-dire n ≥ 1/ε. Il me faut un entier plus grand que 1/ε : je pose N = E(1/ε) + 1, où E désigne la partie entière. Alors N &gt; 1/ε.</li><li><b>Je vérifie.</b> Pour n ≥ N : |uₙ − 2| = 1/n ≤ 1/N &lt; ε.</li><li><b>Je conclus.</b> « On a montré : ∀ε &gt; 0, ∃N ∈ ℕ, ∀n ≥ N, |uₙ − 2| ≤ ε. Donc (uₙ) converge vers 2. »</li></ol>
<p><b>Deux passages qui posent question.</b></p>
<ul><li>Pourquoi 1/n ≤ 1/N quand n ≥ N ? Parce que plus on divise par un grand nombre, plus le résultat est petit.</li><li>Pourquoi 1/N &lt; ε ? Parce que N &gt; 1/ε : en passant à l'inverse, entre nombres positifs, l'inégalité change de sens.</li></ul>
<p><b>Si la distance n'est pas exactement 1/n</b>, on cherche d'abord, au brouillon, à partir de quel n elle passe sous ε, et on choisit N en conséquence.</p>`,
  "Tendre vers +∞":`<p><b>L'idée.</b> Une suite tend vers +∞ quand ses termes deviennent <b>aussi grands qu'on veut, et le restent</b>.</p>
<p><b>Lire la définition.</b> « ∀A ∈ ℝ, ∃N ∈ ℕ, ∀n ≥ N, uₙ ≥ A » : quel que soit le seuil A (une barre placée aussi haut qu'on veut), il y a un rang N à partir duquel tous les termes sont au-dessus de la barre.</p>
<p><b>Le même jeu qu'avant.</b> On me donne une barre A, je dois répondre par un rang N.</p>
<p>Exemple : uₙ = 2n.</p>
<ul><li>On me donne A = 1000. Il faut 2n ≥ 1000, c'est-à-dire n ≥ 500. Je réponds N = 500.</li><li>On me donne A = un million. Je réponds N = 500 000.</li></ul>
<p>Je peux toujours répondre : la suite tend vers +∞.</p>
<p><b>Le vocabulaire.</b> Une suite qui tend vers +∞ ne « converge » pas : converger veut dire s'approcher d'un nombre, et +∞ n'est pas un nombre. On dit qu'elle diverge.</p>
<p><b>Vers −∞</b>, c'est la même phrase à l'envers : quelle que soit la barre, la suite finit par rester en dessous.</p>
<p><b>Deux résultats à connaître par cœur</b> sur les puissances : 2ⁿ tend vers +∞ (comme toute puissance d'un nombre plus grand que 1), et (1/2)ⁿ tend vers 0 (comme toute puissance d'un nombre entre −1 et 1).</p>`},
 "a-lim-fonction":{
  "Les définitions":`<p><b>Ce qui change par rapport aux suites.</b> Pour une suite, on regarde ce qui se passe quand le numéro n devient grand. Pour une fonction f, on regarde ce que devient f(x) quand x <b>s'approche d'un nombre x₀</b> (ou devient très grand).</p>
<p><b>La définition en un point x₀</b> a la même forme que pour les suites, avec une lettre de plus : η (êta).</p>
<ul><li><b>ε</b> : la marge autorisée sur le résultat f(x) ;</li><li><b>η</b> : à quel point x doit être proche de x₀ pour que ça marche.</li></ul>
<p>« ∀ε &gt; 0, ∃η &gt; 0, ∀x ∈ I, |x − x₀| &lt; η ⇒ |f(x) − ℓ| &lt; ε » se lit : « quelle que soit la marge ε, il y a une distance η telle que : dès que x est à moins de η de x₀, f(x) est à moins de ε de ℓ ».</p>
<p><b>Les lettres de la définition.</b> I est l'ensemble des x où f est définie (souvent un intervalle), et ⇒ veut dire « si… alors… ». Le cours écrit lim<sub>x→x₀</sub> f(x) = ℓ, qui se lit « la limite de f(x) quand x tend vers x₀ vaut ℓ ».</p>
<p><b>Exemple : f(x) = 2x, en x₀ = 1.</b> La limite est 2. La distance au résultat : |2x − 2| = 2 |x − 1|.</p>
<ul><li>On me donne ε = 0,1. Si x est à moins de 0,05 de 1, alors 2 |x − 1| est plus petit que 0,1. Je réponds η = 0,05.</li><li>En général, je réponds η = ε/2.</li></ul>
<p><b>En +∞</b>, on remplace « x proche de x₀ » par « x plus grand qu'un seuil α » : à partir du seuil α, f(x) est à moins de ε de ℓ.</p>
<p><b>Le tableau pour s'y retrouver :</b> pour une suite, je réponds par un rang N ; pour une fonction en un point, par une distance η ; pour une fonction en +∞, par un seuil α.</p>`,
  "Le modèle de rédaction en +∞":`<p><b>Le but.</b> Prouver avec la définition qu'une fonction tend vers ℓ quand x tend vers +∞. Le modèle ressemble à celui des suites.</p>
<p><b>Exemple : f(x) = (x + 1)/x, pour x &gt; 0, tend vers 1 en +∞.</b></p>
<ol><li><b>Je calcule la distance à la limite.</b> f(x) − 1 = (x + 1)/x − 1 = 1/x. Pour x &gt; 0, |f(x) − 1| = 1/x.</li><li><b>« Soit ε &gt; 0. »</b></li><li><b>Je choisis le seuil.</b> Je veux 1/x &lt; ε, c'est-à-dire x &gt; 1/ε. Je pose α = 1/ε.</li><li><b>Je vérifie.</b> Pour x &gt; α : x &gt; 1/ε, donc 1/x &lt; ε, donc |f(x) − 1| &lt; ε.</li><li><b>Je conclus</b> en récrivant la définition complète : « ∀ε &gt; 0, ∃α &gt; 0, ∀x &gt; α, |f(x) − 1| &lt; ε. Donc f(x) tend vers 1 quand x tend vers +∞. »</li></ol>
<p><b>La différence avec les suites.</b> Le seuil α n'a pas besoin d'être un entier : on prend directement α = 1/ε, sans partie entière.</p>
<p><b>Comment trouver α dans un autre exercice.</b> Au brouillon, on part de l'inégalité qu'on veut, |f(x) − ℓ| &lt; ε, et on la transforme jusqu'à obtenir « x &gt; quelque chose ». Ce « quelque chose » est α.</p>`,
  "Limites infinies, limites d'un seul côté":`<p><b>Pourquoi regarder un seul côté.</b> Prenons f(x) = 1/x, près de 0.</p>
<ul><li>Pour x positif et très petit : 1/0,1 = 10, puis 1/0,001 = 1000. Les valeurs deviennent très grandes : f(x) tend vers +∞.</li><li>Pour x négatif et très petit : 1/(−0,1) = −10, puis 1/(−0,001) = −1000. Les valeurs deviennent très négatives : f(x) tend vers −∞.</li></ul>
<p>Le comportement n'est pas le même à droite et à gauche de 0 : il faut pouvoir parler de chaque côté séparément.</p>
<p><b>Les notations.</b> « x → 0, x &gt; 0 » veut dire que x s'approche de 0 en restant plus grand que 0 : c'est la limite à droite. « x → 0, x &lt; 0 » : la limite à gauche.</p>
<p>Le cours dit « limite <b>épointée</b> à droite » : x s'approche de x₀ par la droite sans jamais être égal à x₀.</p>
<p><b>Lire la définition d'une limite infinie.</b> « ∀A &gt; 0, ∃η &gt; 0, ∀x ∈ I, |x − x₀| &lt; η ⇒ f(x) &gt; A » : quelle que soit la barre A, il y a une distance η telle que, dès que x est à moins de η de x₀, f(x) est au-dessus de la barre.</p>
<p>Avec 1/x à droite de 0 : on me donne A = 1000. Dès que x est entre 0 et 0,001, on a 1/x &gt; 1000. Je réponds η = 0,001.</p>
<p><b>À retenir :</b> quand une fonction a une valeur interdite, on étudie toujours les deux côtés, et on peut trouver deux résultats différents.</p>`},
 "a-calcul":{
  "Opérations sur les limites":`<p><b>L'idée.</b> On ne revient presque jamais à la définition avec ε. Quand on connaît la limite de chaque morceau, des règles donnent la limite du tout.</p>
<p><b>Avec des limites qui sont des nombres.</b> Si uₙ tend vers 2 et vₙ tend vers 3 :</p>
<ul><li>uₙ + vₙ tend vers 2 + 3 = 5 ;</li><li>uₙ × vₙ tend vers 2 × 3 = 6 ;</li><li>uₙ/vₙ tend vers 2/3 (à condition que la limite du dénominateur ne soit pas 0).</li></ul>
<p><b>Avec l'infini</b>, il faut penser en ordres de grandeur :</p>
<ul><li>« très grand + un nombre » reste très grand : n + 5 tend vers +∞ ;</li><li>« un nombre divisé par très grand » devient tout petit : 3/n tend vers 0 ;</li><li>« un nombre positif divisé par tout petit positif » devient très grand : le cours écrit 1/0⁺ = +∞, où 0⁺ veut dire « vers 0, en restant positif » ;</li><li>« très grand × très grand » est très grand : n × n² tend vers +∞.</li></ul>
<p><b>Les quatre cas où on ne peut rien dire : les formes indéterminées.</b> Ce sont +∞ − ∞, 0 × ∞, ∞/∞ et 0/0.</p>
<p>Pourquoi « indéterminées » ? Regarde trois différences du type « très grand moins très grand » :</p>
<ul><li>n² − n tend vers +∞ ;</li><li>n − n² tend vers −∞ ;</li><li>(n + 1) − n vaut toujours 1.</li></ul>
<p>Trois résultats différents pour la même forme : la règle n'existe pas. Dans ces cas, il faut d'abord <b>transformer l'écriture</b>, avec les outils de l'écran suivant.</p>`,
  "Les trois outils":`<p>Quand on tombe sur une forme indéterminée, on réécrit l'expression. Trois techniques couvrent presque tous les exercices.</p>
<p><b>Outil 1 : mettre en facteur le terme le plus fort.</b> Pour une fraction avec des puissances de n.</p>
<p>Exemple : (n² + 1)/(2n² + n). En haut et en bas, le terme le plus fort est n². On factorise : n²(1 + 1/n²) en haut, n²(2 + 1/n) en bas. Les n² se simplifient : il reste (1 + 1/n²)/(2 + 1/n), qui tend vers 1/2, car 1/n² et 1/n tendent vers 0.</p>
<p><b>Outil 2 : diviser par la plus grande puissance.</b> Pour une fraction avec des aⁿ.</p>
<p>Exemple : (4ⁿ + 1)/(4ⁿ + 2ⁿ). La plus grande puissance est 4ⁿ. On divise en haut et en bas par 4ⁿ : (1 + (1/4)ⁿ)/(1 + (1/2)ⁿ). Or (1/4)ⁿ et (1/2)ⁿ tendent vers 0 : la limite est 1/1 = 1.</p>
<p><b>Outil 3 : la quantité conjuguée.</b> Pour une différence de deux racines. On multiplie et on divise par la somme des deux racines, pour utiliser (a − b)(a + b) = a² − b².</p>
<p>Exemple : √(n + 2) − √n. On multiplie en haut et en bas par √(n + 2) + √n. En haut : (n + 2) − n = 2. Il reste 2/(√(n + 2) + √n). Le dénominateur tend vers +∞, donc la limite est 0.</p>
<p><b>Avant de sortir un outil,</b> vérifie que c'est bien une forme indéterminée. Sinon, les règles s'appliquent directement : 5 − 3/n tend vers 5.</p>`},
 "a-comparaison":{
  "Passage à la limite et signe":`<p><b>Première règle : l'ordre se garde à la limite.</b> Si une suite reste toujours en dessous d'une autre (uₙ ≤ vₙ) et que les deux convergent, alors la limite de la première est en dessous de celle de la seconde, ou égale.</p>
<p><b>Le piège.</b> Même si l'inégalité de départ est stricte (uₙ &lt; vₙ), on n'obtient à la limite qu'une inégalité large (≤). Exemple : uₙ = 0 et vₙ = 1/n. On a bien 0 &lt; 1/n pour tout n, mais les deux limites valent 0 : elles sont égales.</p>
<p><b>Deuxième règle : le signe de la limite se voit sur les termes.</b> Si une suite tend vers un nombre strictement positif, alors ses termes sont strictement positifs à partir d'un certain rang. C'est logique : ils finissent par être tout près de la limite.</p>
<p>Exemple : uₙ = 1 − 5/n tend vers 1, qui est positif. Les premiers termes sont négatifs (u₁ = −4, u₂ = −1,5), mais dès que n dépasse 5, tous les termes sont positifs.</p>
<p><b>Dans l'autre sens :</b> si tous les termes sont positifs ou nuls et que la suite converge, sa limite est positive ou nulle. Elle peut valoir 0, même si aucun terme ne vaut 0 (pense à 1/n).</p>`,
  "Le théorème des gendarmes":`<p><b>L'image.</b> Deux gendarmes encadrent un prisonnier. S'ils vont tous les deux au même endroit, le prisonnier y va aussi : il est coincé entre eux.</p>
<p><b>Le théorème.</b> Si uₙ ≤ vₙ ≤ wₙ, et si (uₙ) et (wₙ) tendent vers le <b>même</b> nombre ℓ, alors (vₙ) tend aussi vers ℓ.</p>
<p><b>Quand s'en servir.</b> Quand la suite contient un morceau qui s'agite sans avoir de limite, mais qui reste borné : (−1)ⁿ, sin n, cos n.</p>
<p><b>Exemple : vₙ = (−1)ⁿ/n.</b></p>
<ol><li>(−1)ⁿ vaut 1 ou −1 : il est toujours entre −1 et 1.</li><li>En divisant par n (positif) : −1/n ≤ (−1)ⁿ/n ≤ 1/n.</li><li>Les deux gendarmes, −1/n et 1/n, tendent vers 0.</li><li>Donc (−1)ⁿ/n tend vers 0.</li></ol>
<p><b>La version courte, très pratique.</b> Si |vₙ − ℓ| ≤ aₙ et que aₙ tend vers 0, alors vₙ tend vers ℓ. Ici : |(−1)ⁿ/n − 0| = 1/n, qui tend vers 0.</p>
<p><b>La version avec l'infini.</b> Un seul gendarme suffit : si vₙ ≥ uₙ et que uₙ tend vers +∞, alors vₙ aussi. Exemple : n + sin n ≥ n − 1, et n − 1 tend vers +∞, donc n + sin n aussi.</p>
<p><b>L'erreur à éviter :</b> encadrer par deux suites qui n'ont pas la même limite. Alors on ne peut rien conclure.</p>`},
 "a-monotone":{
  "Théorème de la limite monotone":`<p><b>L'idée.</b> Une suite qui monte toujours, mais qui ne peut pas dépasser un plafond, finit forcément par se stabiliser : elle converge.</p>
<p><b>Le théorème :</b></p>
<ul><li>croissante et majorée : elle converge ;</li><li>croissante et non majorée : elle tend vers +∞ ;</li><li>décroissante et minorée : elle converge ;</li><li>décroissante et non minorée : elle tend vers −∞.</li></ul>
<p><b>Exemple.</b> uₙ = 1 − 1/n, pour n ≥ 1 : 0, puis 0,5, puis 0,67, puis 0,75… Elle est croissante, et tous ses termes sont plus petits que 1. Donc elle converge.</p>
<p><b>Ce que le théorème ne dit pas : la valeur de la limite.</b> Il dit seulement qu'elle existe. Et attention : la limite n'est pas forcément le plafond qu'on a trouvé. La suite 1 − 1/n est aussi majorée par 5, et pourtant sa limite n'est pas 5.</p>
<p><b>Comment trouver la valeur</b>, quand la suite est définie par uₙ₊₁ = f(uₙ) : une fois qu'on sait qu'elle converge vers un nombre ℓ, on remplace uₙ et uₙ₊₁ par ℓ dans la relation. On obtient l'équation ℓ = f(ℓ), qu'on résout.</p>
<p><b>Pourquoi ce théorème est précieux.</b> Il permet de prouver qu'une suite converge <b>sans connaître sa limite à l'avance</b>.</p>`,
  "La méthode en 4 étapes":`<p>Pour une suite définie par son premier terme et une relation uₙ₊₁ = f(uₙ), l'étude se fait toujours en quatre étapes. Exemple : u₀ = 0 et uₙ₊₁ = (uₙ + 3)/2. Les premiers termes : 0, puis 1,5, puis 2,25, puis 2,625…</p>
<ol><li><b>Encadrer, par récurrence.</b> On devine un plafond en regardant les premiers termes : ils restent sous 3. On prouve « 0 ≤ uₙ ≤ 3 pour tout n ».<br>Au départ : u₀ = 0, c'est vrai.<br>Si c'est vrai au rang n : uₙ + 3 est entre 3 et 6, donc uₙ₊₁ = (uₙ + 3)/2 est entre 1,5 et 3. C'est encore vrai au rang n + 1.</li><li><b>Le sens de variation.</b> uₙ₊₁ − uₙ = (uₙ + 3)/2 − uₙ = (3 − uₙ)/2. Comme uₙ ≤ 3 (étape 1), cette différence est positive ou nulle : la suite est croissante.</li><li><b>La convergence.</b> Croissante et majorée par 3 : elle converge, vers un nombre qu'on appelle ℓ.</li><li><b>La valeur.</b> On remplace dans la relation : ℓ = (ℓ + 3)/2. Donc 2ℓ = ℓ + 3, donc ℓ = 3.</li></ol>
<p><b>Pourquoi cet ordre.</b> L'encadrement de l'étape 1 sert à l'étape 2 (pour le signe) et à l'étape 3 (pour le plafond). Et on n'a le droit d'écrire ℓ = f(ℓ) qu'après avoir prouvé que la limite existe.</p>
<p><b>Quand l'équation ℓ = f(ℓ) a plusieurs solutions</b>, on élimine celles qui ne respectent pas l'encadrement de l'étape 1.</p>`},
 "a-adjacentes":{
  "Le théorème":`<p><b>L'image.</b> Deux suites se rapprochent l'une de l'autre : celle du bas monte, celle du haut descend, et l'écart entre elles se referme. Elles finissent par se rejoindre en un même point.</p>
<p><b>Les quatre conditions à vérifier :</b></p>
<ol><li>(uₙ) est croissante ;</li><li>(vₙ) est décroissante ;</li><li>uₙ ≤ vₙ pour tout n ;</li><li>l'écart vₙ − uₙ tend vers 0.</li></ol>
<p><b>La conclusion :</b> les deux suites convergent, vers la <b>même</b> limite ℓ, et ℓ est toujours coincée entre elles : uₙ ≤ ℓ ≤ vₙ.</p>
<p><b>Exemple.</b> uₙ = 1 − 1/n et vₙ = 1 + 1/n, pour n ≥ 1.</p>
<ol><li>uₙ : 0, puis 0,5, puis 0,67… Elle monte.</li><li>vₙ : 2, puis 1,5, puis 1,33… Elle descend.</li><li>1 − 1/n est toujours plus petit que 1 + 1/n.</li><li>L'écart vaut 2/n, qui tend vers 0.</li></ol>
<p>Les deux suites sont adjacentes. Leur limite commune est 1, et on a bien 1 − 1/n ≤ 1 ≤ 1 + 1/n.</p>
<p><b>À quoi ça sert.</b> À prouver que deux suites convergent sans connaître la limite, et à l'encadrer : à chaque rang, uₙ et vₙ donnent une valeur approchée par en dessous et par au-dessus.</p>`},
 "a-extraites":{
  "Suites extraites":`<p><b>Une suite extraite</b> (on dit aussi sous-suite), c'est ce qu'on obtient en ne gardant que <b>certains termes</b> d'une suite, sans changer leur ordre.</p>
<p><b>Les deux qu'on utilise tout le temps :</b></p>
<ul><li>les termes de rang pair, u₀, u₂, u₄… : on note cette suite (u₂ₙ) ;</li><li>les termes de rang impair, u₁, u₃, u₅… : on la note (u₂ₙ₊₁).</li></ul>
<p><b>L'écriture du cours.</b> Les rangs gardés sont donnés par une fonction φ (la lettre grecque « phi ») strictement croissante (les rangs gardés vont toujours en augmentant) : pour les termes pairs, φ(n) = 2n. La suite extraite s'écrit alors (u<sub>φ(n)</sub>).</p>
<p><b>La règle.</b> Si la suite entière tend vers ℓ, alors toutes ses suites extraites tendent aussi vers ℓ : si tous les termes s'approchent de ℓ, une partie d'entre eux aussi.</p>
<p><b>On s'en sert surtout à l'envers,</b> pour montrer qu'une suite <b>n'a pas de limite</b> : si deux suites extraites ont des limites différentes, la suite diverge.</p>
<p><b>Exemple.</b> uₙ = (−1)ⁿ × n/(n + 1).</p>
<ul><li>Pour n pair, (−1)ⁿ = 1 : les termes valent n/(n + 1), qui tend vers 1.</li><li>Pour n impair, (−1)ⁿ = −1 : les termes valent −n/(n + 1), qui tend vers −1.</li></ul>
<p>Deux suites extraites, deux limites différentes : la suite n'a pas de limite, elle diverge.</p>`,
  "Valeur d'adhérence":`<p><b>La définition.</b> Un nombre ℓ est une « valeur d'adhérence » d'une suite quand une de ses suites extraites tend vers ℓ. En mots : la suite revient s'approcher de ℓ une infinité de fois.</p>
<p><b>Exemple.</b> La suite 0, 1, 2, 0, 1, 2, 0, 1, 2… (le reste de n dans la division par 3). Si on garde un terme sur trois en partant du premier, on obtient 0, 0, 0… qui tend vers 0. De même pour 1 et pour 2. Ses valeurs d'adhérence sont 0, 1 et 2.</p>
<p><b>Le lien avec la convergence.</b> Une suite qui converge vers ℓ n'a qu'une seule valeur d'adhérence : ℓ. Donc une suite qui en a deux (ou plus) ne converge pas.</p>
<p><b>Le résultat utile dans l'autre sens.</b> Si les termes de rang pair et les termes de rang impair tendent vers le <b>même</b> nombre ℓ, alors la suite entière tend vers ℓ. C'est normal : pairs et impairs, à eux deux, ce sont tous les termes.</p>
<p>Exemple : uₙ = (−1)ⁿ/n. Les termes de rang pair valent 1/n, ceux de rang impair −1/n. Les deux tendent vers 0 : la suite tend vers 0.</p>`},
 "a-lim-calc":{
  "Les mêmes règles que pour les suites":`<p><b>Bonne nouvelle :</b> pour les limites de fonctions, tout ce qui a été vu pour les suites reste vrai. Mêmes règles pour les sommes, les produits et les quotients ; mêmes formes indéterminées (+∞ − ∞, 0 × ∞, ∞/∞, 0/0) ; mêmes outils.</p>
<p><b>Mettre en facteur le terme le plus fort.</b> (2x² + 1)/(x² − 3) quand x tend vers +∞ : on factorise par x² en haut et en bas. Il reste (2 + 1/x²)/(1 − 3/x²), qui tend vers 2.</p>
<p><b>La quantité conjuguée.</b> √(x² + 1) − x quand x tend vers +∞ est une forme « +∞ − ∞ ». On multiplie et on divise par √(x² + 1) + x. En haut : (x² + 1) − x² = 1. Il reste 1/(√(x² + 1) + x), qui tend vers 0.</p>
<p><b>Les gendarmes.</b> sin(x)/x quand x tend vers +∞ : sin x est entre −1 et 1, donc sin(x)/x est entre −1/x et 1/x. Les deux côtés tendent vers 0 : la limite est 0.</p>
<p><b>Ce qui est nouveau avec les fonctions :</b> on peut chercher une limite en un nombre x₀, et pas seulement à l'infini. Si la fonction est définie en x₀ par une formule sans piège, il suffit de remplacer. Sinon (forme 0/0), on factorise ou on utilise la quantité conjuguée, comme à l'infini.</p>`,
  "Limites et suites":`<p><b>Le lien.</b> Si f(x) tend vers ℓ quand x tend vers x₀, alors pour <b>n'importe quelle</b> suite (xₙ) qui tend vers x₀, la suite des images f(xₙ) tend vers ℓ. Quelle que soit la façon de s'approcher de x₀, on arrive au même résultat.</p>
<p><b>On s'en sert à l'envers, pour montrer qu'une limite n'existe pas.</b> Il suffit de trouver <b>deux</b> façons de s'approcher de x₀ qui donnent deux résultats différents.</p>
<p><b>Exemple : la partie entière E(x), en 1.</b> (E(x) est le plus grand entier inférieur ou égal à x : E(1,5) = 1, E(1) = 1, E(0,9) = 0.)</p>
<ul><li>Je m'approche de 1 par la droite avec xₙ = 1 + 1/n (n ≥ 2) : ces nombres sont entre 1 et 2, sans atteindre 2, donc E(xₙ) = 1. Les images tendent vers 1.</li><li>Je m'approche de 1 par la gauche avec yₙ = 1 − 1/n (n ≥ 2) : ces nombres sont entre 0 et 1, donc E(yₙ) = 0. Les images tendent vers 0.</li></ul>
<p>Deux résultats différents : E(x) n'a pas de limite en 1.</p>
<p><b>La méthode sur la copie :</b> j'écris mes deux suites, je vérifie que toutes les deux tendent vers x₀, je calcule les deux suites d'images, et je constate que leurs limites sont différentes.</p>
<p><b>L'erreur à éviter.</b> Une seule suite ne prouve rien dans l'autre sens. Par exemple sin(πx) vaut 0 pour tous les entiers x, et pourtant sin(πx) n'a pas de limite en +∞ : entre deux entiers, la fonction remonte à 1 ou redescend à −1.</p>`}},
algo:{
 "a2-invariant":{
  "Les mots du cours":`<p><b>Le but.</b> Prouver qu'un algorithme qui contient une boucle renvoie le bon résultat pour <b>toutes</b> les entrées possibles. L'essayer sur trois valeurs ne suffit pas : il faut une preuve. Un algorithme « valide », c'est un algorithme qui fait ce que promet sa spécification.</p>
<p><b>Une itération</b>, c'est un tour de boucle. Si la boucle tourne 5 fois, il y a 5 itérations.</p>
<p><b>La notation res<sub>i</sub>.</b> Une variable change de valeur pendant la boucle. Pour s'y retrouver, on donne un nom à chacune de ses valeurs : res<sub>0</sub> est sa valeur avant le premier tour, res<sub>1</sub> sa valeur à la fin du tour 1, res<sub>2</sub> à la fin du tour 2…</p>
<p><b>Un petit algorithme pour voir :</b></p>
${PS(`FONCTION : Triple (E n : entier) : entier
SPÉCIFICATIONS : Calcule 3n avec n ∈ ℕ
Variable : res : entier
DÉBUT
  res ← 0
  pour i de 1 à n faire
    res ← res + 3
  fin pour;
  Renvoyer res
FIN`)}
<p>Les valeurs de res : res<sub>0</sub> = 0, res<sub>1</sub> = 3, res<sub>2</sub> = 6, res<sub>3</sub> = 9…</p>
<p><b>L'équation d'itération</b> dit comment on passe d'un tour au suivant. On la <b>lit</b> sur l'algorithme : la ligne « res ← 0 » donne res<sub>0</sub> = 0, et la ligne « res ← res + 3 » donne res<sub>i</sub> = res<sub>i−1</sub> + 3. C'est sûr, puisque c'est écrit dans l'algorithme : le cours appelle ça la « vérité ».</p>
<p><b>L'invariant de boucle</b> est une formule qui donne directement la valeur au tour i, sans passer par les tours d'avant. En regardant 0, 3, 6, 9, on <b>devine</b> : res<sub>i</sub> = 3i. Tant que ce n'est pas prouvé, ce n'est qu'une supposition : le cours l'appelle l'« hypothèse ».</p>
<p><b>La méthode, toujours la même :</b></p>
<ol><li>lire les équations d'itération sur l'algorithme ;</li><li>deviner un invariant, en calculant les premières valeurs ;</li><li>prouver l'invariant par récurrence. Il est vrai au départ : 0 = 3 × 0. Et s'il est vrai à un tour, il l'est au suivant : res<sub>i</sub> = res<sub>i−1</sub> + 3 = 3(i − 1) + 3 = 3i ;</li><li>écrire l'invariant au dernier tour : res<sub>n</sub> = 3n. C'est la valeur renvoyée, et c'est ce que promet la spécification.</li></ol>`,
  "Premier exemple du cours : F1 calcule n!":`<p><b>D'abord, n!.</b> « Factorielle de n », c'est le produit de tous les entiers de 1 à n. Par exemple 4! = 1 × 2 × 3 × 4 = 24. Par convention, 0! = 1.</p>
<p><b>Une propriété qui sert dans la preuve :</b> pour passer d'une factorielle à la suivante, on multiplie par le nouvel entier. 4! = 3! × 4, c'est-à-dire 24 = 6 × 4. En général : i! = (i − 1)! × i.</p>
<p><b>Je déroule F1 pour n = 4</b>, en notant res à la fin de chaque tour :</p>
<div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>tour i</th><th>calcul</th><th class="var">res<sub>i</sub></th><th>i!</th></tr></thead><tbody><tr><td>0 (avant la boucle)</td><td>res ← 1</td><td>1</td><td>0! = 1</td></tr><tr><td>1</td><td>1 × 1</td><td>1</td><td>1! = 1</td></tr><tr><td>2</td><td>1 × 2</td><td>2</td><td>2! = 2</td></tr><tr><td>3</td><td>2 × 3</td><td>6</td><td>3! = 6</td></tr><tr><td>4</td><td>6 × 4</td><td>24</td><td>4! = 24</td></tr></tbody></table></div>
<p>Les deux dernières colonnes sont identiques : voilà l'invariant, res<sub>i</sub> = i!.</p>
<p><b>La preuve, pas à pas.</b></p>
<ul><li><b>Au départ (i = 0)</b> : res<sub>0</sub> = 1 et 0! = 1. C'est pareil : l'invariant est vrai avant la boucle.</li><li><b>D'un tour au suivant</b> : je suppose que c'était vrai au tour d'avant, donc res<sub>i−1</sub> = (i − 1)!. L'algorithme multiplie par i : res<sub>i</sub> = res<sub>i−1</sub> × i = (i − 1)! × i = i!. C'est encore vrai.</li><li><b>Donc</b> c'est vrai à tous les tours : vrai au tour 0, donc au tour 1, donc au tour 2, et ainsi de suite, comme des dominos qui tombent l'un après l'autre.</li></ul>
<p><b>La conclusion.</b> La boucle fait n tours. Au dernier, l'invariant donne res<sub>n</sub> = n!. Or l'algorithme renvoie res : il renvoie bien n!.</p>
<p><b>Les deux rôles à ne pas mélanger :</b> l'équation d'itération vient de l'algorithme (je la lis) ; l'invariant vient de moi (je le devine, puis je le prouve).</p>`,
  "Deuxième exemple du cours : Cube, avec quatre variables":`<p><b>Ce qui change :</b> quatre variables bougent en même temps. Il faut donc quatre équations d'itération, et un invariant en quatre morceaux.</p>
<p><b>Le piège : l'ordre des lignes.</b> Dans un tour, les lignes s'exécutent l'une après l'autre.</p>
<ul><li>« Z ← Z+A+B » passe en premier : elle utilise A et B <b>d'avant</b> le tour.</li><li>« B ← B+A+A+1 » vient ensuite : A n'a pas encore changé, c'est toujours l'ancien A.</li><li>« A, C ← A+3, C-1 » : A et C changent en dernier.</li></ul>
<p>C'est pour ça que, dans les équations, tout ce qui est à droite du signe = porte l'indice i (les anciennes valeurs), et ce qui est à gauche l'indice i + 1 (les nouvelles).</p>
<p><b>Je fais le premier tour de la trace</b> (n = 4). Avant : A = 1, B = 0, C = 4, Z = 0.</p>
<ul><li>Z ← 0 + 1 + 0 = 1</li><li>B ← 0 + 1 + 1 + 1 = 3</li><li>A ← 1 + 3 = 4, et C ← 4 − 1 = 3</li></ul>
<p>On retrouve la ligne 1 du tableau : A = 4, B = 3, C = 3, Z = 1.</p>
<p><b>Comment deviner l'invariant : une colonne à la fois.</b></p>
<ul><li>A : 1, 4, 7, 10, 13. On ajoute 3 à chaque tour en partant de 1 : A<sub>i</sub> = 3i + 1.</li><li>C : 4, 3, 2, 1, 0. On enlève 1 à chaque tour en partant de n : C<sub>i</sub> = n − i.</li><li>Z : 0, 1, 8, 27, 64. Ce sont les cubes 0³, 1³, 2³, 3³, 4³ : Z<sub>i</sub> = i³.</li><li>B : 0, 3, 12, 27, 48. Je divise tout par 3 : 0, 1, 4, 9, 16. Ce sont les carrés : B<sub>i</sub> = 3i².</li></ul>
<p><b>Un cube,</b> c'est un nombre multiplié trois fois par lui-même : 4³ = 4 × 4 × 4 = 64. La dernière ligne du tableau donne Z = 64 pour n = 4 : l'algorithme a bien l'air de calculer n³. Reste à le prouver, à l'écran suivant.</p>`,
  "La preuve de Cube":`<p><b>Le plan est le même que pour F1 :</b> vrai au départ, puis vrai d'un tour au suivant, puis conclusion. Il y a seulement quatre vérifications au lieu d'une.</p>
<p><b>Au départ (i = 0).</b> Je remplace i par 0 dans chaque formule de l'invariant, et je compare avec les valeurs de départ : 3 × 0 + 1 = 1 (c'est A), 3 × 0² = 0 (c'est B), n − 0 = n (c'est C), 0³ = 0 (c'est Z). Tout colle.</p>
<p><b>D'un tour au suivant.</b> Chaque ligne se fait en trois gestes :</p>
<ol><li>j'écris l'équation d'itération ;</li><li>je remplace les valeurs au rang i par ce que dit l'invariant ;</li><li>je calcule, jusqu'à reconnaître la formule de l'invariant avec i + 1 à la place de i.</li></ol>
<p><b>La ligne de B, en détail.</b> Le but : arriver à 3(i + 1)².</p>
<ul><li>Équation : B<sub>i+1</sub> = B<sub>i</sub> + 2A<sub>i</sub> + 1.</li><li>Je remplace B<sub>i</sub> par 3i² et A<sub>i</sub> par 3i + 1 : cela donne 3i² + 2(3i + 1) + 1.</li><li>Je développe : 3i² + 6i + 2 + 1 = 3i² + 6i + 3.</li><li>Je mets 3 en facteur : 3(i² + 2i + 1). Et i² + 2i + 1, c'est (i + 1)².</li></ul>
<p>J'obtiens 3(i + 1)² : c'est gagné pour B.</p>
<p><b>La ligne de Z.</b> Z<sub>i+1</sub> = i³ + (3i + 1) + 3i² = i³ + 3i² + 3i + 1. C'est exactement le développement de (i + 1)³.</p>
<p><b>La conclusion, et pourquoi i = n.</b> La boucle s'arrête quand C vaut 0. L'invariant dit C<sub>i</sub> = n − i. Donc à l'arrêt n − i = 0 : la boucle a fait exactement n tours. À ce moment-là, Z vaut n³, et c'est Z que l'algorithme renvoie.</p>
<p><b>Astuce pour la copie :</b> écris le but (la formule avec i + 1) dans la marge avant de calculer. Tu sais vers quoi aller.</p>`,
  "Et l'arrêt d'une boucle tant que ?":`<p><b>Le problème.</b> Une boucle « pour i de 1 à n » fait n tours et s'arrête : aucun doute. Une boucle « tant que » continue tant que son test est vrai. Si le test ne devient jamais faux, elle tourne sans fin.</p>
<p><b>Une boucle qui ne s'arrête pas.</b> On part de x = 5, puis « tant que x ≠ 0 faire x ← x − 2 ». Les valeurs : 5, 3, 1, −1, −3… x saute par-dessus 0 et ne vaut jamais 0.</p>
<p><b>La recette pour prouver l'arrêt.</b> Trouver une quantité (souvent une variable du test) et dire trois choses :</p>
<ol><li>c'est un <b>entier naturel</b> (un entier positif ou nul) ;</li><li>elle <b>diminue strictement</b> à chaque tour (au moins 1 de moins) ;</li><li>la boucle s'arrête quand elle arrive à 0.</li></ol>
<p>Un entier positif ne peut pas diminuer indéfiniment : s'il vaut 20 au départ, il y aura au plus 20 tours.</p>
<p><b>Exemple.</b></p>
${PS(`tant que n > 0 faire
  n ← n div 2
fin tq;`)}
<p>(« n div 2 » : le quotient de n par 2, sans la virgule.) Pour n = 20, les valeurs sont 20, 10, 5, 2, 1, 0. Arrêt.</p>
<p>Sur la copie : « n est un entier naturel. Tant que n &gt; 0, n div 2 est strictement plus petit que n, donc n décroît strictement à chaque itération. Le tant que s'arrête lorsque n vaut 0. Il y a donc un nombre fini d'itérations, donc l'algorithme se termine. »</p>
<p><b>Quand la variable monte au lieu de descendre.</b> Dans « i ← 0 ; tant que i &lt; n faire … i ← i + 1 », i monte vers n. La quantité qui descend, c'est l'écart n − i : il vaut n au départ, perd 1 à chaque tour, et la boucle s'arrête quand il vaut 0.</p>
<p><b>À quoi sert cette preuve.</b> La preuve par invariant dit seulement : « si la boucle s'arrête, le résultat est bon ». Avec la preuve d'arrêt en plus, on a tout : l'algorithme s'arrête, et il a raison.</p>`},
 "a2-recursif":{
  "Les mots du cours pour un algorithme récursif":`<p><b>Rappel : un algorithme récursif</b> s'appelle lui-même, avec une entrée plus petite, jusqu'à arriver à un cas simple où il répond directement (le « cas de base »).</p>
<p><b>Un petit algorithme pour voir :</b></p>
${PS(`FONCTION : Double (E n : entier) : entier
SPÉCIFICATIONS : Calcule 2n avec n ∈ ℕ
DÉBUT
  si n=0 alors
    Renvoyer 0
  sinon
    Renvoyer 2+Double(n-1)
  fin si;
FIN`)}
<p><b>L'équation de récurrence</b> se lit sur l'algorithme, ligne par ligne :</p>
<ul><li>« si n=0 alors Renvoyer 0 » donne Double(0) = 0 ;</li><li>« sinon Renvoyer 2+Double(n-1) » donne Double(n) = 2 + Double(n − 1) pour n &gt; 0.</li></ul>
<p>C'est sûr, puisque c'est écrit dans l'algorithme : c'est la « vérité ».</p>
<p><b>L'invariant de récursion,</b> c'est ce qu'on veut prouver : « l'algorithme renvoie ce que promet sa spécification ». Ici : Double(n) = 2n. Rien à deviner, il suffit de recopier la spécification. C'est l'« hypothèse ».</p>
<p><b>La preuve par récurrence sur n :</b></p>
<ul><li><b>pour n = 0</b> : Double(0) = 0 (vérité), et 2 × 0 = 0. C'est bon.</li><li><b>pour n &gt; 0</b> : je suppose que l'appel d'en dessous a raison, donc Double(n − 1) = 2(n − 1). Alors Double(n) = 2 + Double(n − 1) = 2 + 2(n − 1) = 2n. C'est bon aussi.</li></ul>
<p><b>Pourquoi a-t-on le droit de supposer que l'appel d'en dessous a raison ?</b> Parce que la chaîne part du cas de base, qu'on a vérifié à la main : vrai pour 0, donc pour 1, donc pour 2, et ainsi de suite.</p>
<p><b>La différence avec une boucle :</b> pour une boucle, on numérotait les tours avec i. Ici il n'y a pas de tours : on raisonne sur l'entrée n elle-même.</p>`,
  "L'exemple du cours : F2, la factorielle récursive":`<p><b>Je déroule F2(3) pour voir ce qui se passe.</b> Chaque appel attend la réponse de l'appel d'en dessous :</p>
<ul><li>F2(3) doit renvoyer 3 × F2(2) ;</li><li>F2(2) doit renvoyer 2 × F2(1) ;</li><li>F2(1) doit renvoyer 1 × F2(0) ;</li><li>F2(0) est le cas de base : il renvoie 1, sans nouvel appel.</li></ul>
<p>Puis on remonte : F2(1) = 1 × 1 = 1, F2(2) = 2 × 1 = 2, F2(3) = 3 × 2 = 6. Et 3! = 1 × 2 × 3 = 6 : le résultat est bon pour n = 3.</p>
<p><b>La preuve fait la même chose, mais pour tous les n d'un coup.</b> Imagine une échelle.</p>
<ul><li><b>Le bas de l'échelle (n = 0).</b> L'algorithme renvoie 1. Et 0! = 1. D'accord.</li><li><b>Un barreau de plus.</b> Je suppose que F2(n − 1) renvoie bien (n − 1)!. L'algorithme calcule n × F2(n − 1), donc n × (n − 1)!. Or multiplier (n − 1)! par n donne n! : par exemple 5 × 4! = 5 × 24 = 120 = 5!. Donc F2(n) = n!.</li></ul>
<p>Si on tient le bas de l'échelle, et si on sait toujours monter d'un barreau, on atteint tous les barreaux : c'est vrai pour tout n.</p>
<p><b>Les trois choses que le correcteur cherche sur la copie :</b></p>
<ol><li>l'équation de récurrence, lue sur l'algorithme ;</li><li>l'hypothèse au rang n − 1, écrite en toutes lettres ;</li><li>le calcul qui combine les deux, et la phrase « donc Inv<sub>n</sub> est vrai ». Inv<sub>n</sub> est le nom que le cours donne à l'invariant au rang n, ici la phrase « F2(n) = n! ».</li></ol>`,
  "Prouver aussi que l'algorithme se termine":`<p><b>Pourquoi un algorithme récursif pourrait ne jamais finir.</b> Il s'appelle lui-même. Si les appels ne se rapprochent pas du cas de base, ils s'enchaînent sans fin. Exemple : une fonction qui, pour n, appelle n + 1. En partant de 3, elle appelle 4, puis 5, puis 6… Elle n'arrive jamais à 0.</p>
<p><b>Ce qu'il faut vérifier :</b> chaque appel se fait avec une entrée <b>plus petite</b>, et on finit par tomber sur le cas de base.</p>
<p><b>Comment l'écrire.</b> On prouve les deux choses dans la même récurrence. La propriété devient : « l'appel avec n <b>se termine</b> et renvoie le bon résultat ».</p>
<p><b>Exemple</b> avec une fonction Double, qui calcule 2n : si n=0, elle renvoie 0 ; sinon elle renvoie 2+Double(n-1).</p>
<ul><li><b>Base (n = 0).</b> L'algorithme renvoie 0 sans s'appeler : il se termine. Et 0 = 2 × 0 : le résultat est bon.</li><li><b>Hérédité (n &gt; 0).</b> Je suppose que l'appel Double(n − 1) se termine et renvoie 2(n − 1). L'appel Double(n) fait un test, une soustraction, une addition, et un appel à Double(n − 1). Tout cela se termine, donc Double(n) se termine. Et il renvoie 2 + 2(n − 1) = 2n.</li></ul>
<p><b>La phrase à retenir :</b> « l'appel au rang n est fait de quelques opérations élémentaires et d'appels au rang n − 1, qui se terminent par hypothèse ; donc il se termine ».</p>
<p><b>Les mots.</b> « Base » ou « initialisation » : le premier cas, vérifié à la main. « Hérédité » ou « récurrence » : le passage d'un rang au suivant. Les deux vocabulaires sont acceptés.</p>`},
 "a2-compter":{
  "Ce qu'on compte":`<p><b>Pourquoi compter.</b> Deux algorithmes peuvent donner tous les deux le bon résultat, et pourtant l'un répond en une seconde et l'autre en une heure. Pour les comparer sans ordinateur, on <b>compte les opérations</b> qu'ils font.</p>
<p><b>Une opération élémentaire</b>, c'est un geste simple de la machine : une affectation (←), un calcul (+, −, *, div, mod), une comparaison (=, &lt;, &gt;), la lecture d'une case T[i], un appel de fonction. On décide que chacune coûte 1.</p>
<p><b>Exemple :</b> la ligne « x ← a + b * 2 » fait 3 opérations : une multiplication, une addition, une affectation.</p>
<p><b>La taille de l'entrée, n.</b> Le travail dépend de ce qu'on donne à l'algorithme : additionner les cases d'un tableau de 1000 cases demande plus d'opérations que pour 10 cases. On appelle n cette « taille » : le nombre de cases du tableau, ou la valeur de l'entier donné.</p>
<p><b>T<sub>n</sub></b> est le nombre d'opérations quand l'entrée est de taille n. C'est une formule en n. Par exemple T<sub>n</sub> = 2n + 1 : pour n = 10, cela fait 21 opérations ; pour n = 1000, cela en fait 2001.</p>
<p><b>V<sub>n</sub></b> compte la mémoire : le nombre de variables dont l'algorithme a besoin pour travailler.</p>
<p><b>Le pire cas.</b> Parfois le nombre d'opérations dépend aussi de la chance. Chercher un nombre dans un tableau : s'il est dans la première case, c'est fini tout de suite ; s'il n'y est pas, il faut regarder toutes les cases. On compte toujours le cas <b>le plus long</b>. C'est une garantie : l'algorithme ne fera jamais plus.</p>`,
  "Diapo 69 : compter dans F1":`<p><b>La méthode :</b> prendre chaque ligne, compter ce qu'elle coûte, et multiplier par le nombre de fois où elle est exécutée.</p>
<p><b>Ligne « res ← 1 ».</b> Une affectation : 1 opération. Elle est exécutée une seule fois, avant la boucle. Total : 1.</p>
<p><b>Ligne « res ← res * i ».</b> Deux opérations : la multiplication, puis l'affectation. Elle est dans la boucle « pour i de 1 à n », donc exécutée n fois. Total : 2 × n.</p>
<p><b>J'additionne :</b> T<sub>n</sub> = 2n + 1.</p>
<p><b>Je vérifie sur un petit cas, n = 3.</b> « res ← 1 » : 1 opération. Puis trois tours à 2 opérations : 6. En tout 7. La formule donne 2 × 3 + 1 = 7. C'est bon.</p>
<p><b>Ce que le prof ne compte pas ici :</b> le compteur i géré par le « pour », et le « Renvoyer ». C'est une convention. Si tu les comptes, tu trouves d'autres nombres, mais toujours la même forme : « un nombre × n + un nombre ». C'est cette forme qui compte. Au contrôle, <b>dis ce que tu comptes</b>, ou suis l'énoncé s'il le précise (« on compte seulement les multiplications »).</p>
<p><b>La mémoire.</b> L'algorithme déclare une seule variable, res : V<sub>n</sub> = 1. Que n vaille 3 ou un million, il n'utilise toujours qu'une variable.</p>`,
  "Compter pour un algorithme récursif : l'équation de complexité":`<p><b>La difficulté.</b> Dans un algorithme récursif, il n'y a pas de boucle à multiplier. L'algorithme fait quelques opérations, puis il <b>s'appelle</b>, et l'appel fait à son tour des opérations, et ainsi de suite.</p>
<p><b>L'idée :</b> le coût de l'appel pour n = ce qu'il fait lui-même + le coût des appels qu'il lance. Cette phrase, écrite avec T, s'appelle l'<b>équation de complexité</b>. (S'il lance plusieurs appels, on additionne le coût de chacun.)</p>
<p><b>Sur F2 :</b></p>
<ul><li><b>Si n = 0 :</b> l'algorithme fait le test « n=0 » et renvoie 1. Une opération : T<sub>0</sub> = 1.</li><li><b>Si n &gt; 0 :</b> il fait le test « n=0 » (1), la soustraction n−1 (1), l'appel (1), la multiplication (1). Cela fait 4. Il faut ajouter tout ce que fait F2(n−1), qui coûte T<sub>n−1</sub>. Donc T<sub>n</sub> = 4 + T<sub>n−1</sub>.</li></ul>
<p><b>Résoudre</b>, c'est trouver une formule directe. Je calcule les premières valeurs :</p>
<ul><li>T<sub>0</sub> = 1</li><li>T<sub>1</sub> = 4 + 1 = 5</li><li>T<sub>2</sub> = 4 + 5 = 9</li><li>T<sub>3</sub> = 4 + 9 = 13</li></ul>
<p>On ajoute 4 à chaque fois, en partant de 1. Après n fois : T<sub>n</sub> = 1 + 4n. Vérification pour n = 3 : 1 + 12 = 13.</p>
<p><b>Une suite arithmétique,</b> c'est exactement ça : une suite où on ajoute toujours le même nombre. Sa formule : la valeur de départ + n × le nombre ajouté.</p>
<p><b>Sur la copie, trois lignes :</b> le cas de base (T<sub>0</sub> = …), l'équation de complexité (T<sub>n</sub> = … + T<sub>n−1</sub>), la résolution (T<sub>n</sub> = …).</p>`,
  "Quand la taille de l'entrée est divisée":`<p><b>Ce que fait F5.</b> Elle dit si n est une puissance de 2 (1, 2, 4, 8, 16, 32…). Sa méthode : diviser n par 2 tant que c'est possible.</p>
<ul><li>F5(8) : 8 est pair, on passe à 4 ; 4 est pair, on passe à 2 ; 2 est pair, on passe à 1 ; n = 1, la réponse est vrai.</li><li>F5(12) : 12 est pair, on passe à 6 ; 6 est pair, on passe à 3 ; 3 est impair (son reste par 2 vaut 1), la réponse est faux.</li></ul>
<p><b>Le pire cas.</b> Dès qu'on tombe sur un nombre impair autre que 1, l'algorithme s'arrête. Le cas le plus long, c'est quand ça n'arrive jamais : quand n est une puissance de 2.</p>
<p><b>L'équation.</b> Chaque appel fait 5 opérations, puis lance l'appel avec n div 2 : T<sub>n</sub> = 5 + T<sub>n div 2</sub>. Et T<sub>1</sub> = 1.</p>
<p><b>Ce qui change par rapport à F2 :</b> l'entrée ne baisse pas de 1 à chaque appel, elle est <b>divisée par 2</b>. On arrive à 1 beaucoup plus vite.</p>
<p><b>Je déroule pour n = 16 :</b></p>
<ul><li>T<sub>16</sub> = 5 + T<sub>8</sub></li><li>T<sub>8</sub> = 5 + T<sub>4</sub></li><li>T<sub>4</sub> = 5 + T<sub>2</sub></li><li>T<sub>2</sub> = 5 + T<sub>1</sub> = 5 + 1</li></ul>
<p>Quatre lignes, donc quatre fois le 5 : T<sub>16</sub> = 1 + 5 × 4 = 21.</p>
<p><b>D'où vient le 4 ?</b> C'est le nombre de fois qu'il faut diviser 16 par 2 pour arriver à 1 : 16, 8, 4, 2, 1. Ce nombre s'appelle log<sub>2</sub>(16). Autre façon de le voir : 16 = 2⁴, donc log<sub>2</sub>(16) = 4.</p>
<p><b>En général :</b> T<sub>n</sub> = 1 + 5 log<sub>2</sub>(n).</p>
<p><b>Ce que ça change.</b> Pour n proche d'un million, un algorithme en 4n + 1 fait environ 4 millions d'opérations. Celui-ci en fait une centaine, car log<sub>2</sub> d'un million vaut à peu près 20. Diviser l'entrée par 2 à chaque appel, c'est un gain énorme.</p>`},
 "a2-notations":{
  "Les suites de référence":`<p><b>L'idée.</b> La formule exacte de T<sub>n</sub> (2n + 1, ou 7n + 6…) dépend de la façon de compter. Ce qui compte vraiment, c'est <b>comment le travail grandit quand n grandit</b>. Si je double n, est-ce que le travail double ? Est-ce qu'il est multiplié par 4 ? Est-ce qu'il ne bouge presque pas ?</p>
<p><b>Les suites de référence</b> sont des modèles de croissance, rangés de la croissance la plus faible à la plus forte (donc de l'algorithme le plus rapide au plus lent). On range chaque algorithme dans une de ces familles : c'est son « ordre de complexité ».</p>
<p><b>Pour les sentir, je calcule pour n = 1000</b> (avec le logarithme en base 2, qui vaut à peu près 10 pour n = 1000) :</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>suite</th><th>nom</th><th>pour n = 1000</th><th>si n double</th></tr></thead><tbody><tr><td>1</td><td>constant</td><td>1</td><td>ne change pas</td></tr><tr><td>log(n)</td><td>logarithmique</td><td>environ 10</td><td>+ 1 seulement</td></tr><tr><td>n</td><td>linéaire</td><td>1000</td><td>× 2</td></tr><tr><td>n log(n)</td><td>pseudo-linéaire</td><td>environ 10 000</td><td>un peu plus que × 2</td></tr><tr><td>n²</td><td>quadratique</td><td>1 000 000</td><td>× 4</td></tr><tr><td>n³</td><td>cubique</td><td>1 000 000 000</td><td>× 8</td></tr><tr><td>2ⁿ</td><td>exponentielle</td><td>un nombre à 302 chiffres</td><td>mis au carré</td></tr></tbody></table></div>
<p><b>Ce qu'il faut retenir :</b> plus la suite est bas dans la liste, plus l'algorithme devient lent quand n est grand. Un algorithme en n² reste utilisable pour n = 1000. Un algorithme en 2ⁿ ne l'est déjà plus pour n = 100.</p>
<p><b>Et n! ?</b> Encore pire que l'exponentielle : 20! dépasse déjà 2 milliards de milliards.</p>
<p><b>« Asymptotique »</b> veut dire : on regarde ce qui se passe quand n est très grand. Pour de petits n, tous les algorithmes sont rapides ; c'est pour les grands n que la différence se voit.</p>`,
  "θ, o, ω : on divise par la suite de référence":`<p><b>La question :</b> à quelle suite de référence ressemble T<sub>n</sub> ? <b>Le test :</b> on divise T<sub>n</sub> par la suite de référence, et on regarde ce que devient le résultat quand n est très grand.</p>
<p><b>Trois résultats possibles.</b> Je prends T<sub>n</sub> = 3n² + 5.</p>
<ul><li><b>Je divise par n².</b> (3n² + 5)/n² = 3 + 5/n². Quand n est très grand, 5/n² devient minuscule : le résultat s'approche de 3. C'est un nombre fixe, plus grand que 0 : les deux suites grandissent <b>à la même vitesse</b>. On écrit T<sub>n</sub> = θ(n²), « thêta de n² ».</li><li><b>Je divise par n³.</b> (3n² + 5)/n³ = 3/n + 5/n³, qui s'approche de 0. T<sub>n</sub> grandit <b>moins vite</b> que n³. On écrit T<sub>n</sub> = o(n³), « petit o de n³ ».</li><li><b>Je divise par n.</b> (3n² + 5)/n = 3n + 5/n, qui devient aussi grand qu'on veut. T<sub>n</sub> grandit <b>plus vite</b> que n. On écrit T<sub>n</sub> = ω(n), « petit oméga de n ».</li></ul>
<p><b>Pour s'en souvenir :</b> θ = même vitesse ; o = moins vite ; ω = plus vite.</p>
<p><b>Avec des nombres,</b> pour n = 1000 : T<sub>n</sub> = 3 000 005. Divisé par n², cela donne 3,000005. Divisé par n³ : 0,003. Divisé par n : 3000,005.</p>
<p><b>Le point surprenant :</b> θ ne regarde pas le nombre placé devant. 3n² + 5, n² et 50n² sont tous θ(n²). L'ordre de complexité dit comment le travail <b>grandit</b>, pas combien il vaut. C'est pour ça qu'on dit « de l'ordre de n² », et pas « égal à n² ».</p>
<p><b>En pratique,</b> on cherche la suite de référence pour laquelle la division donne un nombre fixe plus grand que 0. C'est elle, l'ordre de complexité.</p>`,
  "O et Ω, et trois propriétés":`<p><b>Deux notations « au sens large ».</b> Souvent on ne connaît pas la vitesse exacte de T<sub>n</sub>, mais on sait donner une limite.</p>
<ul><li><b>T<sub>n</sub> = O(R<sub>n</sub>)</b>, « grand O » : T<sub>n</sub> grandit <b>au plus aussi vite</b> que R<sub>n</sub>. Soit moins vite (o), soit à la même vitesse (θ). C'est un plafond.</li><li><b>T<sub>n</sub> = Ω(R<sub>n</sub>)</b>, « grand oméga » : T<sub>n</sub> grandit <b>au moins aussi vite</b> que R<sub>n</sub>. Soit plus vite (ω), soit à la même vitesse (θ). C'est un plancher.</li></ul>
<p><b>La comparaison avec les nombres aide.</b> o, c'est comme &lt; ; O, c'est comme ≤ ; θ, c'est comme = ; Ω, c'est comme ≥ ; ω, c'est comme &gt;.</p>
<p><b>Exemple.</b> T<sub>n</sub> = 5n + 2 est θ(n). Donc c'est aussi O(n), O(n²), O(n³) : tous ces plafonds sont vrais, mais O(n) est le plus précis. Et c'est Ω(n), et aussi Ω(1).</p>
<p><b>Les trois propriétés, en mots simples :</b></p>
<ul><li><b>Tous les logarithmes se valent.</b> log<sub>2</sub>(n), log<sub>10</sub>(n) et ln(n) ne diffèrent que par un nombre fixe en facteur, et θ ignore ces nombres. On écrit donc « log(n) » sans préciser lequel.</li><li><b>Transitivité.</b> Si a grandit moins vite que b, et b moins vite que c, alors a grandit moins vite que c. Comme avec &lt;.</li><li><b>Sommes et produits.</b> On peut additionner ou multiplier deux comparaisons du même type.</li></ul>
<p><b>La règle pratique qui en sort.</b> Pour trouver l'ordre d'une somme :</p>
<ol><li>je repère le terme qui grandit le plus vite ;</li><li>j'efface les autres ;</li><li>j'efface le nombre placé devant.</li></ol>
<p>Exemple : 4n² + 100n + 7. Le terme le plus fort est 4n². J'enlève le 4 : θ(n²). Pour n = 1000, 4n² vaut 4 000 000 alors que 100n + 7 vaut 100 007 : le reste pèse déjà très peu.</p>`},
 "a2-boucles":{
  "Une boucle pour, c'est une somme":`<p><b>Le problème.</b> Deux boucles l'une dans l'autre. Celle du dedans ne fait pas le même nombre de tours à chaque fois : elle va « de 1 à i », et i change.</p>
<p><b>Je compte à la main pour n = 4.</b></p>
<ul><li>i = 1 : j va de 1 à 1, donc 1 opération ;</li><li>i = 2 : j va de 1 à 2, donc 2 opérations ;</li><li>i = 3 : 3 opérations ;</li><li>i = 4 : 4 opérations.</li></ul>
<p>Total : 1 + 2 + 3 + 4 = 10.</p>
<p><b>Pour n quelconque :</b> 1 + 2 + … + n. Compter les opérations d'un « pour », c'est donc calculer une somme.</p>
<p><b>La formule : 1 + 2 + … + n = n(n + 1)/2.</b> Vérification pour n = 4 : 4 × 5/2 = 10. C'est bien ça.</p>
<p><b>Pourquoi cette formule marche.</b> J'écris la somme deux fois, une fois à l'endroit et une fois à l'envers : 1 + 2 + 3 + 4, et dessous 4 + 3 + 2 + 1. J'additionne colonne par colonne : 5 + 5 + 5 + 5, c'est-à-dire 4 fois 5. J'ai compté la somme deux fois, donc elle vaut 4 × 5/2.</p>
<p><b>Le signe Σ</b> (« sigma ») veut juste dire « somme ». « Σ pour i de 1 à n » se lit : j'additionne ce qui suit, pour i = 1, puis i = 2, jusqu'à i = n. Deux Σ à la suite, c'est deux boucles imbriquées.</p>
<p><b>L'ordre de complexité.</b> n(n + 1)/2 = n²/2 + n/2. Le terme le plus fort est n²/2 ; on enlève le 1/2 : θ(n²).</p>`,
  "Le raccourci pour des boucles imbriquées":`<p><b>L'idée.</b> Le calcul exact avec les sommes peut être long. Si on veut seulement un plafond (un O), il y a plus rapide : <b>lire les bornes des boucles et multiplier</b>.</p>
<p><b>Comment faire :</b></p>
<ol><li>pour chaque boucle, je me demande combien de tours elle fait <b>au maximum</b> ;</li><li>je regarde ce que coûte l'intérieur ;</li><li>je multiplie tout.</li></ol>
<p><b>Sur l'exemple du cours.</b> La boucle sur i fait n tours. La boucle sur j va de 1 à i, et i ne dépasse jamais n : elle fait au plus n tours. L'intérieur coûte un nombre fixe d'opérations. Produit : n × n × un nombre fixe, donc O(n²).</p>
<p><b>Que veut dire O(1) ?</b> « Un nombre d'opérations qui ne dépend pas de n » : 1, 2 ou 50, peu importe, tant que ça ne grandit pas avec n.</p>
<p><b>Pourquoi seulement O, et pas θ ?</b> Parce qu'on a arrondi vers le haut : on a dit « au plus n tours » pour la boucle du dedans, alors qu'elle en fait souvent moins. On obtient donc un plafond. Ici le plafond tombe juste (le calcul exact donne n(n + 1)/2, qui est θ(n²)), mais le raccourci seul ne le prouve pas.</p>
<p><b>Un autre exemple.</b></p>
${PS(`pour i de 1 à n faire
  pour j de 1 à 5 faire
    op élém
  fin pour;
fin pour;`)}
<p>La boucle sur i fait n tours. La boucle sur j fait toujours 5 tours : un nombre fixe, donc O(1). Total : n × O(1) = O(n). Deux boucles imbriquées ne donnent donc <b>pas toujours</b> n² : il faut lire les bornes.</p>`,
  "Le master theorem":`<p><b>À quoi il sert.</b> À donner l'ordre de complexité d'un algorithme récursif qui <b>divise</b> son entrée (par 2, par 3…) à chaque appel, sans résoudre l'équation de complexité à la main.</p>
<p><b>Trois nombres à repérer dans l'algorithme :</b></p>
<ul><li><b>a</b> : combien d'appels récursifs il lance ;</li><li><b>b</b> : par combien l'entrée est divisée dans ces appels ;</li><li><b>d</b> : l'exposant du travail fait en dehors des appels. Un nombre fixe d'opérations : d = 0 (car n⁰ = 1). Une boucle de n tours : d = 1. Deux boucles imbriquées de n tours : d = 2.</li></ul>
<p>L'équation de complexité a alors cette forme : T(n) = a × T(n/b) + O(n<sup>d</sup>).</p>
<p><b>Ensuite, une seule comparaison : b<sup>d</sup> contre a.</b></p>
<ul><li>b<sup>d</sup> &gt; a : le travail hors appels l'emporte. T(n) = O(n<sup>d</sup>).</li><li>b<sup>d</sup> = a : égalité, on ajoute un log. T(n) = O(n<sup>d</sup> log n).</li><li>b<sup>d</sup> &lt; a : les appels l'emportent. T(n) = O(n<sup>log a / log b</sup>).</li></ul>
<p><b>Exemple.</b> Un algorithme reçoit un tableau de taille n. Il fait une boucle de n tours, puis lance 4 appels récursifs, chacun sur une moitié du tableau.</p>
<ul><li>4 appels : a = 4 ;</li><li>taille divisée par 2 : b = 2 ;</li><li>une boucle de n tours en dehors des appels, donc O(n¹) : d = 1.</li></ul>
<p>Je compare : b<sup>d</sup> = 2¹ = 2, et a = 4. Donc b<sup>d</sup> &lt; a : troisième cas. L'exposant vaut log 4 / log 2 = 2, car 4 = 2². Résultat : T(n) = O(n²).</p>
<p><b>Calculer log a / log b sans calculatrice :</b> c'est l'exposant qu'il faut mettre sur b pour obtenir a. log 8 / log 2 = 3 car 2³ = 8. log 9 / log 3 = 2 car 3² = 9.</p>
<p><b>Quand ne pas l'utiliser.</b> Il faut que l'entrée soit <b>divisée</b> (n div 2, n/3…). Si l'appel se fait avec n − 1, le théorème ne s'applique pas : on résout l'équation à la main, comme pour la factorielle.</p>
<p><b>Sur la copie :</b> écris a, b et d avec une justification pour chacun, calcule b<sup>d</sup>, dis dans quel cas tu es, puis donne le O.</p>`},
 "a3-dicho":{
  "La recherche linéaire":`<p><b>Le problème.</b> On a un tableau de nombres, dans n'importe quel ordre, et un nombre e. On veut savoir <b>où</b> se trouve e dans le tableau, ou apprendre qu'il n'y est pas.</p>
<p><b>La méthode la plus naturelle :</b> regarder la case 0, puis la case 1, puis la case 2… et s'arrêter dès qu'on trouve e. « Linéaire » veut dire : en ligne, une case après l'autre.</p>
<p><b>Rappel :</b> les cases sont numérotées à partir de 0. Un tableau de 4 cases a les indices 0, 1, 2, 3, et taille(T) vaut 4.</p>
<p><b>Lire le test du tant que.</b> « i&lt;taille(T) et T[i]≠e » : je continue tant que <b>je suis encore dans le tableau</b> et que <b>la case regardée n'est pas e</b>. La boucle s'arrête donc pour l'une de ces deux raisons : j'ai trouvé e, ou je suis sorti du tableau.</p>
<p><b>Exemple 1 : chercher 7 dans [4, 9, 7, 2].</b></p>
<ul><li>i = 0 : T[0] = 4, ce n'est pas 7, j'avance ;</li><li>i = 1 : T[1] = 9, ce n'est pas 7, j'avance ;</li><li>i = 2 : T[2] = 7, trouvé : la boucle s'arrête.</li></ul>
<p>i vaut 2, qui n'est pas la taille du tableau : l'algorithme renvoie 2.</p>
<p><b>Exemple 2 : chercher 5 dans [4, 9, 7, 2].</b> Aucune case ne vaut 5. i passe par 0, 1, 2, 3, puis vaut 4. Là, « i&lt;taille(T) » est faux : la boucle s'arrête. Comme i = taille(T), l'algorithme renvoie −1. Ce −1 est un code qui veut dire « pas trouvé » : aucune case ne porte le numéro −1.</p>
<p><b>Le coût.</b> Le pire cas, c'est quand e n'est pas dans le tableau : on regarde les n cases. Chaque tour coûte un nombre fixe d'opérations. Le total est de l'ordre de n : θ(n). Si le tableau est deux fois plus long, la recherche est deux fois plus longue.</p>`,
  "La recherche dichotomique":`<p><b>L'idée, avec un dictionnaire.</b> Pour chercher un mot, tu n'ouvres pas à la page 1. Tu ouvres au milieu, tu regardes si ton mot est avant ou après, et tu recommences dans la bonne moitié. Ça marche parce que les mots sont <b>rangés dans l'ordre</b>.</p>
<p><b>Condition indispensable :</b> le tableau doit être <b>trié</b>, du plus petit au plus grand. Sinon, regarder le milieu n'apprend rien. « Dichotomie » veut dire : couper en deux.</p>
<p><b>Les trois variables.</b> deb et fin sont les indices qui délimitent la zone où e peut encore se trouver. mil est l'indice du milieu de cette zone : (deb+fin) div 2, la moyenne sans la virgule.</p>
<p><b>À chaque tour, on regarde T[mil] :</b></p>
<ul><li>si T[mil] &lt; e : e est forcément plus à droite. On jette la moitié gauche : deb ← mil+1 ;</li><li>sinon (T[mil] ≥ e) : e est à la case mil ou plus à gauche. On jette la moitié droite : fin ← mil−1.</li></ul>
<p><b>Exemple : chercher 11 dans [2, 5, 8, 11, 14, 20, 23]</b> (indices 0 à 6).</p>
<div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th class="var">deb</th><th class="var">fin</th><th class="var">mil</th><th>T[mil]</th><th>décision</th></tr></thead><tbody><tr><td>0</td><td>6</td><td>3</td><td>11</td><td>11 &lt; 11 ? non : fin ← 2</td></tr><tr><td>0</td><td>2</td><td>1</td><td>5</td><td>5 &lt; 11 ? oui : deb ← 2</td></tr><tr><td>2</td><td>2</td><td>2</td><td>8</td><td>8 &lt; 11 ? oui : deb ← 3</td></tr><tr><td>3</td><td>2</td><td></td><td></td><td>deb &gt; fin : arrêt</td></tr></tbody></table></div>
<p>La boucle s'arrête quand deb dépasse fin. On regarde alors la case deb : T[3] = 11, c'est bien e. L'algorithme renvoie 3.</p>
<p><b>Ce qui surprend.</b> Au premier tour, on est tombé pile sur 11, et pourtant l'algorithme a continué. C'est voulu : dans la boucle, il ne teste jamais « T[mil] = e ». Il resserre la zone jusqu'au bout, et c'est seulement à la fin qu'il vérifie la case deb.</p>
<p><b>Si e n'est pas là.</b> À la fin, soit deb est sorti du tableau, soit T[deb] ≠ e : l'algorithme renvoie −1. C'est ce que dit la dernière ligne, « cond(deb&lt;taille(T) et T[deb]=e, deb, -1) » : si la condition est vraie, renvoyer deb, sinon renvoyer −1.</p>`,
  "Arrêt, validité, complexité":`<p><b>Trois questions classiques sur un algorithme :</b> est-ce qu'il s'arrête ? Est-ce qu'il a raison ? Combien coûte-t-il ?</p>
<p><b>1. L'arrêt.</b> La quantité fin−deb+1, c'est le <b>nombre de cases où on cherche encore</b>. Avec deb = 2 et fin = 6 : 6 − 2 + 1 = 5 cases (les indices 2, 3, 4, 5, 6). À chaque tour, on jette au moins la case du milieu : ce nombre diminue strictement. Un entier positif qui diminue à chaque tour finit par atteindre 0 : la boucle s'arrête.</p>
<p><b>2. La validité.</b> L'invariant dit, à chaque tour : tout ce qui est <b>à gauche de deb</b> est plus petit que e, et tout ce qui est <b>à droite de fin</b> est plus grand que e, ou égal. C'est logique : on ne jette la partie gauche que si T[mil] &lt; e, et la partie droite que si T[mil] ≥ e.</p>
<p>À la fin, deb = fin + 1 : les deux parties jetées se touchent. Tout ce qui est avant deb est trop petit, tout ce qui est à partir de deb est assez grand. Si e est dans le tableau, sa première apparition est donc exactement à la case deb. Il suffit de regarder cette case.</p>
<p><b>3. La complexité.</b> À chaque tour, la zone de recherche est divisée par 2. Pour un tableau de 16 cases, dans le pire cas : 16, 8, 4, 2, 1, puis 0. Cela fait 5 tours, et log<sub>2</sub>(16) = 4 : le nombre de tours vaut log<sub>2</sub>(n) + 1. Chaque tour coûte un nombre fixe d'opérations. Total : θ(log(n)).</p>
<p><b>Ce que ça change, en vrai.</b> Pour un tableau d'un million de cases, la recherche linéaire regarde jusqu'à 1 000 000 de cases ; la recherche dichotomique, une vingtaine. Mais elle exige un tableau trié.</p>
<p><b>Pour compter sans formule :</b> quand la taille du tableau double, il y a seulement <b>un</b> tour de plus.</p>`},
 "a3-valeurs":{
  "Pourquoi trier, et deux sortes de tris":`<p><b>Trier,</b> c'est ranger les valeurs d'un tableau dans l'ordre, de la plus petite à la plus grande. [7, 2, 9, 4] devient [2, 4, 7, 9].</p>
<p><b>Pourquoi se donner ce mal.</b> Une fois le tableau trié, beaucoup de choses deviennent rapides. Tu viens d'en voir une : chercher une valeur prend θ(log n) au lieu de θ(n).</p>
<p><b>Deux situations, deux familles de tris :</b></p>
<ul><li><b>Cas particulier : peu de valeurs possibles.</b> Par exemple les notes (entières, de 0 à 20) de 300 étudiants : il n'y a que 21 valeurs possibles. On peut alors trier <b>sans comparer</b>, juste en comptant combien il y a de chaque valeur. C'est le tri par valeurs, très rapide : θ(n).</li><li><b>Cas général : des valeurs quelconques.</b> Des prix, des tailles, des nombres à virgule… Impossible de prévoir une case par valeur possible. Il faut <b>comparer</b> les valeurs deux à deux. Ces tris-là ne peuvent pas descendre sous n log n.</li></ul>
<p><b>Lire les notations.</b> ⟦0 ; p−1⟧ désigne les entiers 0, 1, 2… jusqu'à p−1 : cela fait p valeurs possibles. Pour des notes de 0 à 20, p = 21. « p = O(n) » veut dire : le nombre de valeurs possibles n'est pas beaucoup plus grand que le nombre de cases.</p>
<p><b>Rappel :</b> θ(n) veut dire « de l'ordre de n opérations » ; Ω(n log n) veut dire « au moins de l'ordre de n log n opérations ».</p>`,
  "Le tri par valeurs":`<p><b>L'idée.</b> Imagine des copies notées 0, 1, 2 ou 3. Pour les ranger par note, pas besoin de les comparer entre elles : tu comptes combien il y a de 0, de 1, de 2 et de 3, puis tu réécris la liste, d'abord tous les 0, puis tous les 1, et ainsi de suite.</p>
<p><b>Exemple : T = [2, 0, 3, 0, 2], avec p = 4</b> (valeurs possibles : 0, 1, 2, 3).</p>
<p><b>Étape 1 : compter.</b> Le tableau Cpt a une case par valeur possible, toutes à 0 au départ. On parcourt T, et pour chaque valeur lue on ajoute 1 dans sa case.</p>
<ul><li>je lis 2 : Cpt[2] passe à 1 ;</li><li>je lis 0 : Cpt[0] passe à 1 ;</li><li>je lis 3 : Cpt[3] passe à 1 ;</li><li>je lis 0 : Cpt[0] passe à 2 ;</li><li>je lis 2 : Cpt[2] passe à 2.</li></ul>
<p>Résultat : Cpt = [2, 0, 2, 1]. Il se lit : deux 0, aucun 1, deux 2, un 3.</p>
<p><b>La ligne « Cpt[T[i]] ← Cpt[T[i]] + 1 »</b> fait exactement ça : T[i] est la valeur lue, et elle sert de <b>numéro de case</b> dans Cpt.</p>
<p><b>Étape 2 : réécrire.</b> On remplit T depuis le début : deux fois 0, zéro fois 1, deux fois 2, une fois 3. T devient [0, 0, 2, 2, 3].</p>
<p><b>Dans le tant que :</b> k est la valeur qu'on est en train d'écrire, j la prochaine case de T à remplir. S'il reste des k à écrire (Cpt[k] ≠ 0), on en écrit un et on décompte. Sinon (Cpt[k] = 0), on passe à la valeur suivante.</p>
<p><b>Le coût.</b> Un passage sur T pour compter (n tours), puis la réécriture (n cases à remplir, et p valeurs à passer en revue). En tout, de l'ordre de n + p. Si p n'est pas plus grand que n, c'est θ(n).</p>
<p><b>La limite.</b> Il faut connaître à l'avance les valeurs possibles, et qu'il n'y en ait pas trop. Pour trier des entiers entre 0 et un milliard, il faudrait un tableau Cpt d'un milliard de cases.</p>`,
  "Borne inférieure d'un tri de tableau":`<p><b>La question :</b> peut-on inventer un tri encore plus rapide que θ(n) ? Non, et l'argument tient en quelques lignes.</p>
<p><b>L'argument.</b> Pour trier un tableau, il faut au moins <b>regarder chaque case une fois</b>. Un algorithme qui ne regarderait pas une case ne saurait pas quelle valeur elle contient : il ne pourrait pas la ranger au bon endroit. Regarder n cases, c'est déjà n opérations. Donc n'importe quel tri fait au moins de l'ordre de n opérations : Ω(n).</p>
<p><b>« Borne inférieure »</b> veut dire : un plancher. Aucun algorithme, même pas encore inventé, ne peut descendre dessous.</p>
<p><b>Le plancher est atteint.</b> Le tri par valeurs fait θ(n) : il touche le plancher. Dans son cas particulier, c'est le meilleur possible.</p>
<p><b>Deux phrases à ne pas confondre :</b></p>
<ul><li>« <b>cet algorithme</b> est en θ(n) » parle d'un algorithme précis ;</li><li>« <b>tout tri</b> est en Ω(n) » parle du problème lui-même : c'est vrai pour tous les algorithmes possibles.</li></ul>`},
 "a3-fusion":{
  "Le tri à bulles":`<p><b>Un tri par comparaison :</b> la seule chose qu'on s'autorise, c'est comparer deux valeurs et les échanger.</p>
<p><b>Le geste de base :</b> comparer une case avec sa voisine de gauche. Si elles sont dans le désordre (la plus petite est à droite), on les échange.</p>
<p><b>Un passage.</b> On part de la fin du tableau et on recule, en faisant ce geste à chaque case. La plus petite valeur est ainsi poussée vers la gauche, de voisine en voisine, jusqu'au début. Comme une bulle qui remonte : d'où le nom.</p>
<p><b>Exemple : T = [4, 1, 3, 2]. Premier passage (i = 0) :</b></p>
<ul><li>j = 3 : je compare T[3] = 2 et T[2] = 3. Désordre : j'échange. T = [4, 1, 2, 3] ;</li><li>j = 2 : je compare T[2] = 2 et T[1] = 1. C'est dans l'ordre : rien ;</li><li>j = 1 : je compare T[1] = 1 et T[0] = 4. Désordre : j'échange. T = [1, 4, 2, 3].</li></ul>
<p>Le plus petit, 1, est arrivé à sa place, dans la case 0.</p>
<p><b>Deuxième passage (i = 1) :</b> pareil, mais on s'arrête avant la case 0, qui est déjà bonne. j = 3 : je compare 3 et 2, rien. j = 2 : je compare 2 et 4, j'échange. T = [1, 2, 4, 3].</p>
<p><b>Troisième passage (i = 2) :</b> j = 3 : je compare 3 et 4, j'échange. T = [1, 2, 3, 4]. Trié.</p>
<p><b>Lire les deux boucles.</b> La boucle sur i compte les passages : après le passage i, la case i contient la bonne valeur. La boucle sur j recule de la dernière case (n−1) jusqu'à la case i+1 ; « par pas de -1 » veut dire que j diminue de 1 à chaque tour.</p>
<p><b>Le coût.</b> Premier passage : n − 1 comparaisons. Deuxième : n − 2. Et ainsi de suite jusqu'à 1. Total : (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, de l'ordre de n² : θ(n²). Pour 4 cases : 3 + 2 + 1 = 6 comparaisons.</p>
<p><b>Deux mots.</b> « En place » : il trie dans le tableau lui-même, sans tableau en plus. « Stable » : deux valeurs égales restent dans leur ordre de départ, car il n'échange que si la valeur de droite est strictement plus petite.</p>`,
  "Le tri fusion : le principe et la fusion":`<p><b>L'idée « diviser pour mieux régner ».</b> Trier un gros tableau, c'est difficile. Alors on le coupe en deux moitiés, on trie chaque moitié, et on <b>rassemble</b> les deux moitiés triées. Ce rassemblement s'appelle la fusion.</p>
<p><b>La fusion, avec deux paquets de cartes.</b> Tu as deux paquets déjà triés, la plus petite carte au-dessus. Pour en faire un seul paquet trié : tu compares les deux cartes du dessus, tu prends la plus petite, tu la poses. Et tu recommences, jusqu'à ce que les deux paquets soient vides.</p>
<p><b>Exemple : fusionner [1, 5, 7] et [2, 3, 9].</b></p>
<div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>dessus du paquet 1</th><th>dessus du paquet 2</th><th>je prends</th><th>résultat</th></tr></thead><tbody><tr><td>1</td><td>2</td><td>1</td><td>[1]</td></tr><tr><td>5</td><td>2</td><td>2</td><td>[1, 2]</td></tr><tr><td>5</td><td>3</td><td>3</td><td>[1, 2, 3]</td></tr><tr><td>5</td><td>9</td><td>5</td><td>[1, 2, 3, 5]</td></tr><tr><td>7</td><td>9</td><td>7</td><td>[1, 2, 3, 5, 7]</td></tr><tr><td>vide</td><td>9</td><td>9</td><td>[1, 2, 3, 5, 7, 9]</td></tr></tbody></table></div>
<p><b>Pourquoi c'est rapide.</b> On ne regarde que le dessus de chaque paquet : comme les paquets sont triés, la plus petite carte restante est forcément l'une de ces deux-là. Chaque carte est posée une seule fois : pour n cartes, de l'ordre de n opérations.</p>
<p><b>Dans l'algorithme.</b> T1 et T2 sont les deux paquets (des copies des deux moitiés). i est la position du dessus de T1, j celle du dessus de T2. La condition du « si » dit : je prends dans T1 si T2 est vide (j&gt;=taille(T2)), ou bien s'il reste des cartes dans T1 et que la sienne est la plus petite, ou égale.</p>
<p><b>Les paramètres deb1, fin1, fin2</b> disent où sont les deux moitiés dans T : la première va de l'indice deb1 à fin1, la seconde de fin1+1 à fin2.</p>`,
  "L'algorithme de tri fusion":`<p><b>Le plan de triFusionAux,</b> pour trier la partie de T entre les indices deb et fin :</p>
<ol><li>calculer le milieu mil ;</li><li>trier la moitié gauche (de deb à mil) ;</li><li>trier la moitié droite (de mil+1 à fin) ;</li><li>fusionner les deux moitiés.</li></ol>
<p><b>Mais comment trie-t-on chaque moitié ?</b> Avec le même algorithme : il s'appelle lui-même. Chaque moitié est coupée en deux, puis encore en deux… jusqu'à des morceaux d'une seule case. Un morceau d'une case est déjà trié : rien à faire. C'est le cas de base, quand deb = fin (le test « deb&lt;fin » est faux).</p>
<p><b>Exemple : T = [7, 3, 8, 1].</b></p>
<ul><li><b>On coupe :</b> [7, 3] et [8, 1].</li><li><b>On coupe encore :</b> [7] et [3], puis [8] et [1]. Des morceaux d'une case : déjà triés.</li><li><b>On fusionne en remontant :</b> [7] et [3] donnent [3, 7]. [8] et [1] donnent [1, 8].</li><li><b>Dernière fusion :</b> [3, 7] et [1, 8] donnent [1, 3, 7, 8].</li></ul>
<p><b>Tout le travail de tri est fait par les fusions.</b> La descente ne fait que couper.</p>
<p><b>Pourquoi θ(n log n).</b> On coupe en deux jusqu'à des morceaux d'une case : cela fait log<sub>2</sub>(n) étages (2 étages pour 4 cases, 3 pour 8 cases). À chaque étage, les fusions manipulent en tout les n valeurs : de l'ordre de n opérations. D'où n × log n.</p>
<p><b>À quel point c'est mieux que n².</b> Pour n = 1000 : n² vaut 1 000 000, et n log<sub>2</sub>(n) environ 10 000. Cent fois moins.</p>
<p><b>Le prix à payer.</b> La fusion recopie les moitiés dans T1 et T2 : il faut de la mémoire en plus. Le tri fusion n'est donc pas « en place ». Il est en revanche « stable » : deux valeurs égales restent dans leur ordre de départ.</p>
<p><b>Pourquoi « Aux » ?</b> Pour « auxiliaire ». triFusionAux a besoin de deb et fin pour savoir quelle partie trier. La procédure principale, celle qu'on appelle pour trier tout le tableau, lance triFusionAux sur le tableau entier, du premier indice au dernier.</p>`,
  "Borne inférieure d'un tri par comparaison, et tris célèbres":`<p><b>La question :</b> en ne faisant que comparer des valeurs deux à deux, peut-on trier plus vite que n log n ? La réponse est non.</p>
<p><b>Ce que dit le résultat.</b> N'importe quel tri par comparaison, dans le pire cas, fait au moins de l'ordre de n log n comparaisons. C'est un plancher : Ω(n log n). Le cours l'admet, sans preuve.</p>
<p><b>L'idée derrière.</b> Chaque comparaison ne donne qu'une toute petite information : « plus petit » ou « plus grand ». Or il existe énormément de façons de mélanger n valeurs. Il faut beaucoup de réponses de ce genre pour savoir dans quel mélange on se trouve.</p>
<p><b>Le tri fusion touche ce plancher :</b> il est en θ(n log n). Parmi les tris par comparaison, on ne peut pas faire mieux en ordre de grandeur.</p>
<p><b>Le tableau à connaître :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>tri</th><th>complexité</th><th>à retenir</th></tr></thead><tbody><tr><td>par valeurs</td><td>θ(n)</td><td>seulement s'il y a peu de valeurs possibles ; ne compare pas</td></tr><tr><td>fusion</td><td>θ(n log n)</td><td>stable, mais pas en place</td></tr><tr><td>par tas</td><td>θ(n log n)</td><td>seulement cité par le cours</td></tr><tr><td>rapide (par pivot)</td><td>θ(n log n) en moyenne, θ(n²) au pire</td><td>seulement cité par le cours</td></tr><tr><td>à bulles</td><td>θ(n²)</td><td>en place, stable</td></tr><tr><td>par insertion</td><td>θ(n²)</td><td>adapté quand le tableau est presque trié</td></tr><tr><td>par sélection</td><td>θ(n²)</td><td>adapté aux petits tableaux</td></tr></tbody></table></div>
<p><b>Pas de contradiction avec le tri par valeurs.</b> Lui descend à θ(n), sous le plancher n log n. C'est permis : il ne compare jamais deux valeurs entre elles, donc le plancher des tris par comparaison ne le concerne pas.</p>`},
 "a3-tris":{
  "Deux tris célèbres":`<p><b>Deux façons très naturelles de trier,</b> celles qu'on utilise sans y penser avec des cartes.</p>
<p><b>Le tri par sélection : « je cherche le plus petit, je le mets devant ».</b></p>
<ol><li>je cherche la plus petite valeur de tout le tableau, et je l'échange avec la case 0 ;</li><li>je cherche la plus petite parmi le reste (à partir de la case 1), et je l'échange avec la case 1 ;</li><li>et ainsi de suite.</li></ol>
<p>Exemple avec [6, 2, 9, 4] :</p>
<ul><li>le plus petit est 2 : je l'échange avec 6. [2, 6, 9, 4] ;</li><li>le plus petit du reste (6, 9, 4) est 4 : je l'échange avec 6. [2, 4, 9, 6] ;</li><li>le plus petit du reste (9, 6) est 6 : je l'échange avec 9. [2, 4, 6, 9].</li></ul>
<p><b>Le tri par insertion : « je range chaque nouvelle carte parmi celles que je tiens déjà ».</b> C'est la façon dont on trie ses cartes en main. La partie gauche du tableau est toujours triée ; on prend la valeur suivante et on la glisse à sa place dans cette partie.</p>
<p>Exemple avec [6, 2, 9, 4] :</p>
<ul><li>je prends 2 : il va avant 6. [2, 6, 9, 4] ;</li><li>je prends 9 : il est déjà à sa place. [2, 6, 9, 4] ;</li><li>je prends 4 : il se glisse entre 2 et 6 ; 6 et 9 se décalent d'une case. [2, 4, 6, 9].</li></ul>
<p><b>Le coût : θ(n²) pour les deux.</b> Sélection : pour trouver le plus petit, il faut parcourir tout le reste, et on recommence n − 1 fois. Insertion : dans le pire cas, chaque valeur doit remonter toute la partie déjà triée.</p>
<p><b>Leur différence.</b> Le tri par sélection fait toujours le même travail, même si le tableau est déjà trié. Le tri par insertion, lui, va vite quand le tableau est presque trié : chaque valeur est déjà à peu près à sa place, il n'y a presque rien à décaler.</p>`},
 "a-forme":{
  "Le squelette, toujours le même":`<p><b>Un algorithme,</b> c'est une recette : une suite d'instructions précises, qu'on peut suivre sans réfléchir. Au contrôle, tu l'écris en « pseudo-code » : du français codifié, pas un vrai langage de programmation.</p>
<p><b>Il a toujours la même forme, comme une fiche de recette :</b></p>
<ul><li><b>la première ligne (la « signature »)</b> dit son nom, ce qu'on lui donne, et ce qu'il rend ;</li><li><b>SPÉCIFICATIONS</b> : une phrase qui dit ce qu'il fait ;</li><li><b>Variable</b> : la liste des « boîtes » dont il a besoin pour travailler ;</li><li><b>DÉBUT … FIN</b> : les instructions.</li></ul>
<p><b>FONCTION ou PROCÉDURE ?</b></p>
<ul><li>Il <b>calcule une réponse</b> et la rend avec « Renvoyer » : c'est une FONCTION. On écrit le type de la réponse au bout de la première ligne.</li><li>Il <b>fait quelque chose</b> sans rendre de réponse (afficher à l'écran, modifier un tableau qu'on lui a donné) : c'est une PROCÉDURE. Rien au bout de la ligne, et pas de « Renvoyer ».</li></ul>
<p><b>Un paramètre,</b> c'est une donnée qu'on fournit à l'algorithme. La lettre placée devant dit ce qu'il en fait. E (entrée) : il la lit seulement. ES (entrée-sortie) : il la lit et la modifie. S (sortie) : il la remplit.</p>
<p><b>Un type,</b> c'est la sorte d'une valeur : entier, nombre, booléen (vrai ou faux), tableau…</p>
<p><b>Exemple de signature :</b> « FONCTION : double (E x : entier) : entier ». Son nom est double. On lui donne un entier x, qu'il ne fait que lire. Il rend un entier.</p>
<p><b>Les blocs se ferment.</b> Tout ce qui s'ouvre avec « si », « pour » ou « tant que » se ferme avec « fin si; », « fin pour; », « fin tq; ». Comme une parenthèse : sans la fermeture, on ne sait pas où le bloc s'arrête.</p>
<p><b>Ce qu'on ne met pas dans « Variable » :</b> les paramètres (ils sont déjà dans la signature) et le compteur d'une boucle « pour ».</p>`,
  "Lire cet algorithme ligne par ligne":`<p><b>Pour comprendre un algorithme, le mieux est de le faire tourner à la main</b> sur un petit exemple. Je prends x = 8 et T = [3, 8, 5].</p>
<p><b>Avant la boucle :</b> cpt ← 0. La boîte cpt contient 0.</p>
<p><b>La boucle.</b> taille(T) vaut 3, donc i prend les valeurs 0, 1, 2.</p>
<ul><li>i = 0 : T[0] vaut 3. Est-ce égal à 8 ? Non. On ne fait rien.</li><li>i = 1 : T[1] vaut 8. Est-ce égal à 8 ? Oui. cpt ← cpt + 1 : cpt passe de 0 à 1.</li><li>i = 2 : T[2] vaut 5. Non. Rien.</li></ul>
<p><b>Après la boucle :</b> Renvoyer cpt &gt; 0. cpt vaut 1, et 1 &gt; 0 est vrai : l'algorithme renvoie true.</p>
<p><b>Ce que fait donc cet algorithme :</b> il compte combien de cases valent x, puis il répond à la question « y en a-t-il au moins une ? ».</p>
<p><b>Trois points qui piègent au début :</b></p>
<ul><li><b>← et = ne veulent pas dire la même chose.</b> « cpt ← 0 » est un ordre : mets 0 dans cpt. « T[i] = x » est une question : est-ce égal ? La réponse est vrai ou faux.</li><li><b>« cpt ← cpt + 1 »</b> se lit de droite à gauche : je calcule cpt + 1 avec l'ancienne valeur, puis je range le résultat dans cpt.</li><li><b>Les cases commencent à 0.</b> Dans [3, 8, 5], T[0] = 3, T[1] = 8, T[2] = 5. Il n'y a pas de T[3].</li></ul>`,
  "Trouve les erreurs":`<p><b>Le jeu :</b> chaque algorithme affiché contient des fautes de forme. Ce sont celles qui font perdre des points au contrôle alors que l'idée est bonne.</p>
<p><b>La liste de contrôle, à passer dans cet ordre :</b></p>
<ol><li><b>La première ligne.</b> Y a-t-il FONCTION ou PROCÉDURE ? Chaque paramètre a-t-il sa lettre (E, S, ES) et son type ? Si c'est une fonction, le type du résultat est-il écrit au bout ?</li><li><b>La ligne Variable.</b> Chaque nom qui reçoit une valeur avec ← dans le corps doit y être déclaré, sauf les paramètres et les compteurs de « pour ».</li><li><b>Les fermetures.</b> Je compte les « si », les « pour » et les « tant que », et je vérifie que chacun a son « fin si; », « fin pour; » ou « fin tq; », au bon endroit.</li><li><b>Le Renvoyer.</b> Une fonction doit en avoir un ; une procédure n'en a pas.</li></ol>
<p><b>Pourquoi la place du « fin pour; » compte.</b> Tout ce qui est écrit avant « fin pour; » est répété à chaque tour. Tout ce qui est écrit après n'est fait qu'une fois, quand la boucle est finie.</p>
<p><b>Un conseil pour la copie :</b> décale vers la droite les lignes qui sont à l'intérieur d'un bloc. On voit tout de suite ce qui est dedans, ce qui est dehors, et s'il manque une fermeture.</p>`},
 "a-expressions":{
  "Les types : entier, nombre, booléen, chaîne":`<p><b>Un type,</b> c'est la sorte d'une valeur. Comme dans la vie : « 3 » est un nombre, « oui » est une réponse, « Paul » est un mot. On ne fait pas les mêmes choses avec : on peut additionner deux nombres, pas deux réponses.</p>
<p><b>Les quatre types de base :</b></p>
<ul><li><b>entier</b> : un nombre sans virgule. 12, 0, −7.</li><li><b>nombre</b> : un nombre avec ou sans virgule. 3,14 ou 12.</li><li><b>booléen</b> : la réponse à une question fermée. Deux valeurs seulement : true (vrai) et false (faux).</li><li><b>chaîne</b> : du texte, écrit entre guillemets. "bonjour".</li></ul>
<p><b>Attention aux guillemets :</b> 12 est un entier ; "12" est une chaîne, le texte formé des caractères 1 et 2.</p>
<p><b>Une expression,</b> c'est un calcul écrit, qui a une valeur. « 4 + 2 * 3 » est une expression. Sa valeur est 10 (la multiplication d'abord), et son type est entier.</p>
<p><b>Trouver le type d'une expression :</b> je fais le calcul, je regarde le résultat, et je dis de quelle sorte il est.</p>
<ul><li>7 − 9 vaut −2 : entier ;</li><li>1,5 + 2 vaut 3,5 : nombre ;</li><li>7 &gt; 9 vaut false : booléen. Une comparaison est une question, sa réponse est vrai ou faux.</li></ul>`,
  "Les opérateurs du cours (p. 12)":`<p><b>Un opérateur,</b> c'est un signe qui fait un calcul : +, &lt;, « et »… Il y en a trois familles.</p>
<p><b>1. Les calculs.</b> + − * sont l'addition, la soustraction, la multiplication. Il y a <b>trois</b> signes autour de la division :</p>
<ul><li>« / » : la division normale, avec virgule. 7 / 2 = 3,5 ;</li><li>« div » : le quotient entier, « combien de fois ça rentre ». 7 div 2 = 3 ;</li><li>« mod » : le reste. 7 mod 2 = 1, car 7 = 2 × 3 + 1.</li></ul>
<p>Pense à un partage : 7 bonbons pour 2 enfants. Chacun en a 3 (div), et il en reste 1 (mod).</p>
<p><b>À quoi sert mod :</b> « n mod 2 = 0 » veut dire « n est pair ». « n mod 3 = 0 » veut dire « n est divisible par 3 ».</p>
<p><b>2. Les comparaisons.</b> = ≠ &lt; ≤ &gt; ≥. Elles posent une question ; la réponse est un booléen. 4 ≤ 4 vaut true.</p>
<p><b>3. Les opérateurs logiques,</b> pour combiner des booléens :</p>
<ul><li>« a et b » est vrai quand <b>les deux</b> sont vrais ;</li><li>« a ou b » est vrai quand <b>au moins un</b> des deux est vrai ;</li><li>« non a » inverse : vrai devient faux, faux devient vrai.</li></ul>
<p><b>L'évaluation paresseuse.</b> L'ordinateur lit de gauche à droite, et s'arrête dès qu'il connaît la réponse. Dans « a et b », si a est faux, le tout est faux : inutile de regarder b. Dans « a ou b », si a est vrai, le tout est vrai : inutile de regarder b. Exemple : « 2 &gt; 3 et (1/0 = 5) » vaut false, sans jamais calculer 1/0.</p>
<p><b>cond(a, b, c)</b> est un « si » en une ligne : si a est vrai, la valeur est b ; sinon, c'est c. Exemple : cond(4 &gt; 9, 1, 0) vaut 0, car 4 &gt; 9 est faux.</p>`,
  "Appeler une fonction donnée par l'énoncé : proche? et reste":`<p><b>Appeler une fonction,</b> c'est s'en servir : on écrit son nom, et entre parenthèses les valeurs qu'on lui donne (les « arguments »). L'appel vaut la réponse de la fonction.</p>
<p><b>Comme une touche de calculatrice.</b> Tu ne sais pas comment la touche √ fait son calcul, et tu n'en as pas besoin : tu sais ce qu'elle rend. Ici c'est pareil : l'énoncé donne la signature et les spécifications de la fonction, pas son corps.</p>
<p><b>Lire une signature pour savoir appeler.</b> Imagine « FONCTION : carre (E x : entier) : entier », qui renvoie x × x.</p>
<ul><li>Elle attend <b>un</b> argument, de type entier ;</li><li>elle renvoie un entier.</li></ul>
<p>Donc carre(4) vaut 16. carre(4, 2) est une erreur : un argument de trop. carre(true) est une erreur : mauvais type.</p>
<p><b>Les appels emboîtés.</b> On calcule de l'intérieur vers l'extérieur, comme avec des parenthèses. carre(carre(2)) : d'abord carre(2) = 4, puis carre(4) = 16.</p>
<p><b>La méthode pour toute expression avec des appels :</b></p>
<ol><li>je compte les arguments : est-ce le bon nombre ?</li><li>je regarde leurs types : est-ce ceux que la signature attend ?</li><li>je calcule, en commençant par ce qui est le plus à l'intérieur.</li></ol>
<p><b>Le point d'interrogation</b> dans un nom comme « proche? » fait partie du nom. C'est une habitude pour les fonctions qui répondent par vrai ou faux.</p>`},
 "a-boucles":{
  "La syntaxe du cours":`<p><b>Une boucle</b> sert à répéter des instructions sans les recopier. Il y en a deux sortes.</p>
<p><b>La boucle « pour » : je sais combien de fois.</b> « pour i de 1 à 4 faire … fin pour; » répète le bloc 4 fois. La variable i est un compteur : elle vaut 1 au premier tour, puis 2, puis 3, puis 4. Les deux bornes sont comprises.</p>
<p><b>La boucle « tant que » : je ne sais pas combien de fois.</b> Elle répète le bloc tant qu'une condition est vraie. Avant chaque tour, elle pose la question ; si la réponse est faux, elle s'arrête. Exemple : « tant que x &lt; 100 faire x ← x * 2 fin tq; ». En partant de x = 10 : 20, 40, 80, 160. À 160, la condition est fausse : arrêt.</p>
<p><b>Le danger du tant que.</b> Si rien dans le bloc ne fait changer la condition, elle reste vraie pour toujours, et la boucle ne s'arrête jamais.</p>
<p><b>« par pas de »</b> change la marche du compteur. Sans rien, i avance de 1 en 1. « pour i de 0 à 8 par pas de 2 » donne 0, 2, 4, 6, 8. Avec un pas négatif, on recule : « pour i de 3 à 1 par pas de -1 » donne 3, 2, 1.</p>
<p><b>Le « si »</b> n'est pas une boucle : il fait un choix, une seule fois. Si la condition est vraie, on fait le premier bloc ; sinon, on fait le bloc du « sinon ». Le « sinon » est facultatif.</p>
<p><b>afficher et Renvoyer, la différence :</b></p>
<ul><li>« afficher x » écrit x à l'écran, et <b>continue</b>. On peut afficher dix fois de suite.</li><li>« Renvoyer x » donne la réponse finale, et <b>arrête tout</b>. Ce qui est écrit après n'est pas exécuté.</li></ul>`,
  "Déroule une boucle pas à pas":`<p><b>Faire une trace,</b> c'est jouer à l'ordinateur : on exécute l'algorithme à la main, ligne par ligne, en notant la valeur de chaque variable. C'est la meilleure façon de comprendre ce que fait une boucle, et c'est une question qui tombe au contrôle.</p>
<p><b>Comment s'y prendre :</b></p>
<ol><li>je trace un tableau, avec une colonne par variable ;</li><li>la première ligne contient les valeurs avant la boucle ;</li><li>avant chaque tour, je vérifie si la boucle continue ;</li><li>à chaque tour, j'ajoute une ligne avec les nouvelles valeurs.</li></ol>
<p><b>Exemple.</b></p>
${PS(`s ← 0
pour i de 1 à 3 faire
    s ← s + i
fin pour;`)}
<div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>moment</th><th class="var">i</th><th class="var">s</th></tr></thead><tbody><tr><td>avant la boucle</td><td></td><td>0</td></tr><tr><td>fin du tour 1</td><td>1</td><td>1</td></tr><tr><td>fin du tour 2</td><td>2</td><td>3</td></tr><tr><td>fin du tour 3</td><td>3</td><td>6</td></tr></tbody></table></div>
<p>À la fin, s vaut 6 : c'est 1 + 2 + 3.</p>
<p><b>Les deux erreurs classiques :</b> oublier la ligne de départ, et changer une valeur « de tête » sans écrire la ligne. Écris tout, même si c'est lent.</p>`},
 "a-tableaux":{
  "Trois schémas qui couvrent presque tout":`<p><b>Un tableau,</b> c'est une rangée de cases numérotées, qui contiennent chacune une valeur. T = [5, 12, 7] a trois cases : T[0] = 5, T[1] = 12, T[2] = 7. La numérotation commence à 0, et taille(T) vaut 3.</p>
<p><b>Pour passer sur toutes les cases,</b> une seule ligne à connaître par cœur : « pour i de 0 à taille(T)-1 faire ». i prend chaque numéro de case, et T[i] est la case en cours.</p>
<p><b>Presque tous les exercices sur les tableaux suivent l'un de ces trois modèles.</b></p>
<p><b>1. Accumuler : je fais un total.</b> Comme compter l'argent d'une tirelire : je pars de 0, et j'ajoute chaque pièce. Trois moments : <b>avant</b> la boucle, je mets le total à 0 ; <b>dans</b> la boucle, j'ajoute la case ; <b>après</b> la boucle, je renvoie le total. Pour T = [5, 12, 7] : som vaut 0, puis 5, puis 17, puis 24.</p>
<p>Pour un produit, on part de 1 (et pas de 0, sinon tout vaut 0). Pour compter des cases, on part de 0 et on ajoute 1.</p>
<p><b>2. Chercher : je réponds par vrai ou faux.</b> « Est-ce que toutes les cases sont plus petites que 10 ? » Je regarde les cases une par une. Dès que j'en vois une qui contredit (12 ≥ 10), je connais la réponse : je renvoie false tout de suite. Si j'arrive au bout sans en avoir vu, je renvoie true, <b>après</b> la boucle.</p>
<p>Le piège : on ne peut pas répondre true dans la boucle. Voir une case qui convient ne dit rien sur les suivantes.</p>
<p><b>3. Fabriquer : je construis un nouveau tableau.</b> Je déclare un tableau R de la bonne taille dans « Variable », je remplis ses cases une par une dans la boucle, et je le renvoie après. Pour T = [5, 12, 7] et « le double de chaque valeur » : R = [10, 24, 14].</p>
<p><b>Devant un énoncé, pose-toi la question :</b> me demande-t-on un total, une réponse vrai ou faux, ou un nouveau tableau ? Tu sais alors quel modèle suivre.</p>`},
 "a-recursif":{
  "La méthode du TD":`<p><b>Un algorithme récursif s'appelle lui-même.</b> L'idée : pour résoudre un gros problème, je fais comme si je savais déjà résoudre <b>le même problème, en un peu plus petit</b>. Il me reste juste la dernière marche à monter.</p>
<p><b>Exemple : calculer 3ⁿ</b> (3 multiplié n fois par lui-même ; 3⁴ = 3 × 3 × 3 × 3 = 81).</p>
<ol><li><b>Le cas de base :</b> le cas le plus petit, où je connais la réponse sans rien calculer. Ici n = 0, et 3⁰ = 1.</li><li><b>La récurrence :</b> comment passer du problème plus petit au mien. 3ⁿ = 3 × 3ⁿ⁻¹. Si quelqu'un me donne 3ⁿ⁻¹, je n'ai plus qu'à multiplier par 3.</li><li><b>La traduction :</b> j'écris les deux cas.</li></ol>
${PS(`FONCTION : p3 (E n : entier) : entier
SPÉCIFICATIONS : Calcule 3 puissance n, avec n ∈ ℕ
DÉBUT
    Renvoyer cond(n = 0, 1, 3 * p3(n-1))
FIN`)}
<p>Dans les SPÉCIFICATIONS, « n ∈ ℕ » veut dire « n est un entier naturel » : 0, 1, 2, 3…</p>
<p><b>Je déroule p3(3)</b> : chaque appel attend la réponse de celui du dessous.</p>
<ul><li>p3(3) = 3 × p3(2)</li><li>p3(2) = 3 × p3(1)</li><li>p3(1) = 3 × p3(0)</li><li>p3(0) = 1 : le cas de base, on s'arrête de descendre.</li></ul>
<p>Puis on remonte : p3(1) = 3, p3(2) = 9, p3(3) = 27. Et 3³ = 27.</p>
<p><b>Les deux façons de tout casser :</b></p>
<ul><li><b>oublier le cas de base :</b> p3 s'appellerait avec 2, 1, 0, −1, −2… sans jamais s'arrêter ;</li><li><b>appeler avec une entrée qui ne se rapproche pas du cas de base :</b> écrire p3(n+1) au lieu de p3(n-1). En partant de 3, on irait vers 4, 5, 6… et jamais vers 0.</li></ul>
<p><b>La question à te poser :</b> « si je sais résoudre le problème pour n − 1, comment j'obtiens la réponse pour n ? ».</p>`,
  "Avant d'écrire : ce que l'énoncé impose":`<p><b>Un énoncé, c'est comme une recette avec des contraintes :</b> « fais un gâteau, mais sans four ». Si tu utilises le four, le gâteau est peut-être bon, mais tu n'as pas fait l'exercice. Le correcteur enlève les points.</p>
<p><b>Les mots à repérer, et ce qu'ils veulent dire :</b></p>
<ul><li><b>« récursif »</b> : l'algorithme doit s'appeler lui-même ;</li><li><b>« itératif »</b> : avec une boucle (pour ou tant que) ;</li><li><b>« non itératif »</b> : aucune boucle ;</li><li><b>« non récursif »</b> : il ne doit jamais s'appeler lui-même ;</li><li><b>« les seules opérations autorisées sont… »</b> : tout ce qui n'est pas dans la liste est interdit. Même si tu sais que mod ou * existent.</li></ul>
<p><b>Exemple.</b> « Écrire un algorithme récursif qui calcule 3 × n, en n'utilisant que l'addition et la soustraction. » L'expression 3 * n est interdite. On se ramène au cas plus petit : 3 × n = 3 × (n − 1) + 3. Et 3 × 0 = 0.</p>
${PS(`FONCTION : fois3 (E n : entier) : entier
SPÉCIFICATIONS : Calcule 3n avec n ∈ ℕ, sans multiplication
DÉBUT
    Renvoyer cond(n = 0, 0, fois3(n-1) + 3)
FIN`)}
<p>Vérification : fois3(2) = fois3(1) + 3 = (fois3(0) + 3) + 3 = 0 + 3 + 3 = 6. On n'a utilisé qu'une soustraction (n−1), des additions et une comparaison.</p>
<p><b>La méthode :</b></p>
<ol><li>avant d'écrire, souligne dans l'énoncé chaque mot qui impose quelque chose ;</li><li>fais la liste de ce qui est permis ;</li><li>à la fin, relis ton algorithme ligne par ligne et vérifie chaque opération : est-elle dans la liste ?</li></ol>`},
 "a-affichage":{
  "La méthode":`<p><b>Une procédure qui affiche</b> ne renvoie rien : son « résultat », c'est ce qui s'écrit à l'écran, dans l'ordre. Et <b>l'ordre des lignes change tout</b>.</p>
<p><b>Deux procédures presque pareilles.</b></p>
${PS(`PROCÉDURE : A (E n : entier)
DÉBUT
    si n > 0 alors
        afficher n
        A(n-1)
    fin si;
FIN

PROCÉDURE : B (E n : entier)
DÉBUT
    si n > 0 alors
        B(n-1)
        afficher n
    fin si;
FIN`)}
<p><b>A(3)</b> affiche 3, puis lance A(2), qui affiche 2 et lance A(1), qui affiche 1 et lance A(0), qui ne fait rien. À l'écran : <b>3 2 1</b>.</p>
<p><b>B(3)</b> lance d'abord B(2), et n'affiche son 3 qu'une fois B(2) complètement fini. Résultat : <b>1 2 3</b>. Pour le trouver sans se perdre, on part du bas :</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>appel</th><th>ce qu'il fait</th><th>affiche</th></tr></thead><tbody><tr><td>B(0)</td><td>n &gt; 0 est faux : rien</td><td>(rien)</td></tr><tr><td>B(1)</td><td>B(0), puis afficher 1</td><td>1</td></tr><tr><td>B(2)</td><td>B(1), puis afficher 2</td><td>1 2</td></tr><tr><td>B(3)</td><td>B(2), puis afficher 3</td><td>1 2 3</td></tr></tbody></table></div>
<p><b>Le geste clé :</b> dans chaque ligne, je <b>remplace</b> l'appel par ce que j'ai trouvé à la ligne d'au-dessus.</p>
<p><b>Ça marche aussi avec deux appels.</b> C fait : C(n-1), puis afficher n, puis encore C(n-1). C(0) n'affiche rien.</p>
<ul><li>C(1) : rien, 1, rien. Donc « 1 ».</li><li>C(2) : C(1), 2, C(1). Donc « 1 2 1 ».</li><li>C(3) : C(2), 3, C(2). Donc « 1 2 1 3 1 2 1 ».</li></ul>
<p><b>Sur la copie,</b> écris ces lignes intermédiaires : elles montrent ta méthode, et le correcteur peut donner des points même si la dernière ligne est fausse.</p>`},
 "a-listes":{
  "Les quatre opérations":`<p><b>Une liste,</b> c'est une suite d'éléments, comme un train : on n'a accès qu'au premier wagon. Pour atteindre le troisième, il faut détacher les deux premiers. Pas de numéro de case comme dans un tableau.</p>
<p><b>Les quatre opérations, sur L = [7, 1, 5] :</b></p>
<ul><li><b>tête(L) = 7</b> : le premier élément. C'est un <b>élément</b> (ici un entier), pas une liste.</li><li><b>queue(L) = [1, 5]</b> : tout sauf le premier. C'est une <b>liste</b>.</li><li><b>cons(4, L) = [4, 7, 1, 5]</b> : une nouvelle liste, avec 4 ajouté devant.</li><li><b>estVide(L) = false</b> : L contient des éléments. estVide([ ]) vaut true.</li></ul>
<p><b>Deux cas qui piègent.</b> queue([5]) = [ ] : la queue d'une liste d'un seul élément est la liste vide (ce n'est pas une erreur). Mais tête([ ]) et queue([ ]) sont des erreurs : une liste vide n'a pas de premier élément.</p>
<p><b>Atteindre un élément plus loin :</b> on enlève des wagons avec queue, puis on prend la tête. Le troisième élément de L, c'est tête(queue(queue(L))).</p>
<ul><li>queue(L) = [1, 5]</li><li>queue([1, 5]) = [5]</li><li>tête([5]) = 5</li></ul>
<p><b>Lire de l'intérieur vers l'extérieur,</b> comme pour des parenthèses en maths.</p>
<p><b>Surveiller les types.</b> tête donne un élément. On ne peut donc pas lui appliquer une opération qui attend une liste : queue(tête(L)) n'a pas de sens.</p>`,
  "Le schéma récursif":`<p><b>Toutes les fonctions sur les listes, ou presque, suivent le même plan :</b></p>
<ul><li>si la liste est vide, je donne la réponse directement (le cas de base) ;</li><li>sinon, je m'occupe de la tête moi-même, et je laisse la fonction s'occuper de la queue (l'appel récursif).</li></ul>
<p><b>Exemple : compter les éléments pairs d'une liste.</b></p>
${PS(`FONCTION : nbPairs (E L : liste d'entiers) : entier
SPÉCIFICATIONS : Renvoie le nombre d'éléments pairs de L
DÉBUT
    si estVide(L) alors
        Renvoyer 0
    sinon si tête(L) mod 2 = 0 alors
        Renvoyer 1 + nbPairs(queue(L))
    sinon
        Renvoyer nbPairs(queue(L))
    fin si;
FIN`)}
<p><b>Je déroule nbPairs([4, 7, 2]).</b></p>
<ul><li>La tête 4 est paire : 1 + nbPairs([7, 2]).</li><li>La tête 7 est impaire : nbPairs([2]), sans rien ajouter.</li><li>La tête 2 est paire : 1 + nbPairs([ ]).</li><li>La liste est vide : 0.</li></ul>
<p>En remontant : 1 + (0 + (1 + 0)) = 2. Il y a bien deux nombres pairs, 4 et 2.</p>
<p><b>La version avec une boucle.</b> On garde une copie M de la liste, et on lui enlève sa tête à chaque tour, jusqu'à ce qu'elle soit vide :</p>
${PS(`cpt ← 0
M ← L
tant que non estVide(M) faire
    si tête(M) mod 2 = 0 alors
        cpt ← cpt + 1
    fin si;
    M ← queue(M)
fin tq;
Renvoyer cpt`)}
<p>Sans la ligne « M ← queue(M) », M ne raccourcit jamais, et la boucle ne s'arrête pas.</p>`,
  "D'un tableau à une liste":`<p><b>Le problème.</b> cons ajoute toujours <b>devant</b>. Si on ajoute les éléments les uns après les autres, le dernier ajouté se retrouve en premier.</p>
<p><b>Essai naïf avec T = [6, 9, 4], dans l'ordre des cases :</b></p>
<ul><li>au départ L = [ ] ;</li><li>cons(6, L) donne [6] ;</li><li>cons(9, L) donne [9, 6] ;</li><li>cons(4, L) donne [4, 9, 6].</li></ul>
<p>La liste est à l'envers.</p>
<p><b>La solution : parcourir le tableau en partant de la fin.</b> « pour i de taille(T)-1 à 0 par pas de -1 » fait prendre à i les valeurs 2, 1, 0.</p>
<ul><li>i = 2 : cons(T[2], L) = cons(4, [ ]) donne [4] ;</li><li>i = 1 : cons(9, [4]) donne [9, 4] ;</li><li>i = 0 : cons(6, [9, 4]) donne [6, 9, 4].</li></ul>
<p>Cette fois, la liste est dans le même ordre que le tableau.</p>
<p><b>À retenir :</b> avec cons, on construit la liste en commençant par son <b>dernier</b> élément.</p>
<p><b>Et si on ne veut garder que certains éléments ?</b> On met un « si » dans la boucle : on fait le cons seulement pour les cases qui conviennent, et on saute les autres.</p>`},
 "a-motifs":{
  "La méthode":`<p><b>Comment l'écran écrit :</b> de gauche à droite, une ligne après l'autre, sans jamais revenir en arrière. Pour dessiner une figure, il faut donc savoir, pour chaque ligne, <b>combien d'espaces</b> écrire d'abord, puis <b>combien d'étoiles</b>.</p>
<p><b>Exemple : ce triangle, pour n = 4.</b></p>
${PS(`   *
  **
 ***
****`)}
<p><b>Étape 1 : un tableau, ligne par ligne.</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>ligne i</th><th>espaces</th><th>étoiles</th></tr></thead><tbody><tr><td>1</td><td>3</td><td>1</td></tr><tr><td>2</td><td>2</td><td>2</td></tr><tr><td>3</td><td>1</td><td>3</td></tr><tr><td>4</td><td>0</td><td>4</td></tr></tbody></table></div>
<p><b>Étape 2 : trouver la règle.</b> Les étoiles : autant que le numéro de la ligne, donc i. Les espaces : ce qui manque pour arriver à 4, donc n − i. Sur chaque ligne, espaces + étoiles = n.</p>
<p><b>Étape 3 : traduire.</b> Une boucle sur les lignes ; dedans, une petite boucle par morceau, puis le retour à la ligne. Le TD 1 donne trois procédures toutes faites : affEtoile() affiche une étoile, affEspace() affiche un espace, et affRL() passe à la ligne.</p>
${PS(`PROCÉDURE : triangleDroit (E n : entier)
DÉBUT
    pour i de 1 à n faire
        pour k de 1 à n-i faire
            affEspace()
        fin pour;
        pour k de 1 à i faire
            affEtoile()
        fin pour;
        affRL()
    fin pour;
FIN`)}
<p><b>Étape 4 : vérifier la première et la dernière ligne.</b> Ligne 1 : n − 1 = 3 espaces, 1 étoile. Ligne 4 : 0 espace (« pour k de 1 à 0 » ne fait aucun tour), 4 étoiles. C'est bon.</p>
<p><b>L'oubli classique :</b> affRL(). Sans lui, tout s'écrit sur une seule ligne. Il se place dans la grande boucle, après les petites.</p>`},
 "a-tableaux2d":{
  "Deux boucles imbriquées":`<p><b>Un tableau 2D, c'est une grille,</b> comme une salle de cinéma : des rangées (les lignes) et des sièges dans chaque rangée (les colonnes). Pour désigner un siège, il faut deux numéros : la rangée et la place.</p>
<p><b>Exemple : M = [[2, 0, 7], [5, 1, 4]].</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th></th><th>colonne 0</th><th>colonne 1</th><th>colonne 2</th></tr></thead><tbody><tr><th>ligne 0</th><td>2</td><td>0</td><td>7</td></tr><tr><th>ligne 1</th><td>5</td><td>1</td><td>4</td></tr></tbody></table></div>
<ul><li>M[0] = [2, 0, 7] : toute la ligne 0, qui est elle-même un tableau ;</li><li>M[1][0] = 5 : ligne 1, colonne 0. D'abord la ligne, ensuite la colonne ;</li><li>taille(M) = 2 lignes, taille(M[0]) = 3 colonnes.</li></ul>
<p><b>Passer sur toutes les cases :</b> deux boucles l'une dans l'autre. Celle de dehors choisit la ligne ; celle de dedans parcourt les cases de cette ligne. C'est l'ordre de lecture d'un livre : (0,0), (0,1), (0,2), puis (1,0), (1,1), (1,2).</p>
<p><b>Exemple : compter les cases qui valent plus de 3.</b></p>
${PS(`cpt ← 0
pour i de 0 à taille(M)-1 faire
    pour j de 0 à taille(M[0])-1 faire
        si M[i][j] > 3 alors
            cpt ← cpt + 1
        fin si;
    fin pour;
fin pour;
Renvoyer cpt`)}
<p>Pour M, les cases 7, 5 et 4 dépassent 3 : la fonction renvoie 3.</p>
<p><b>Le jeu de la vie,</b> en mots simples : chaque case est vivante ou morte. Ses voisines sont les 8 cases qui la touchent (moins au bord : une case de coin n'en a que 3). À chaque étape :</p>
<ul><li>une case vivante reste en vie si elle a 2 ou 3 voisines vivantes. Avec 0 ou 1, elle meurt d'isolement ; avec plus de 3, elle meurt étouffée ;</li><li>une case morte devient vivante si elle a exactement 3 voisines vivantes.</li></ul>`},
 "a-dicos":{
  "Le dictionnaire":`<p><b>Tableau ou dictionnaire ?</b> Dans un tableau, chaque case a un <b>numéro</b> : 0, 1, 2… Dans un dictionnaire, chaque case a un <b>nom</b>, qu'on appelle sa clé. C'est comme une fiche d'inscription : « nom : … », « note : … », « admis : … ».</p>
<p><b>Exemple :</b></p>
${PS(`E : dictionnaire('nom': chaîne, 'note': nombre, 'admis': booléen)
E['nom'] ← "Léa"
E['note'] ← 13.5
E['admis'] ← true`)}
<ul><li>E['note'] vaut 13,5 : on écrit la clé entre crochets, comme un numéro de case ;</li><li>une clé avec sa valeur forme un <b>champ</b>. E a 3 champs ;</li><li>les valeurs n'ont pas toutes le même type (une chaîne, un nombre, un booléen). Dans un tableau, toutes les cases ont le même type.</li></ul>
<p><b>Parcourir un dictionnaire :</b> « pour k dans E faire » fait prendre à k chaque <b>clé</b> : 'nom', puis 'note', puis 'admis'. Pour avoir la valeur qui va avec, on écrit E[k].</p>
${PS(`pour k dans E faire
    afficher k, " : ", E[k]
fin pour;`)}
<p>Cela affiche « nom : Léa », « note : 13.5 », « admis : true ».</p>
<p><b>Tester si une clé existe :</b> « 'note' dans E » vaut true ; « 'age' dans E » vaut false. On fait ce test avant de lire une clé qui pourrait manquer : lire E['age'] serait une erreur.</p>
<p><b>Comparer deux dictionnaires,</b> c'est vérifier qu'ils ont exactement les mêmes clés, et la même valeur pour chaque clé.</p>`},
 "a-piles":{
  "Piles et files":`<p><b>Une pile, c'est une pile d'assiettes.</b> On pose une assiette sur le dessus (empiler), on reprend celle du dessus (dépiler). La dernière posée est la première reprise. Le dessus s'appelle le <b>sommet</b>.</p>
<p><b>Une file, c'est la file d'attente à la boulangerie.</b> On arrive à la fin (enfiler), on sert celui qui est devant (défiler). Le premier arrivé est le premier servi.</p>
<p><b>Même suite d'opérations, deux résultats.</b> J'ajoute 5, puis 8, puis 2.</p>
<ul><li><b>Pile :</b> depiler donne 2, puis 8, puis 5. L'ordre est inversé.</li><li><b>File :</b> defiler donne 5, puis 8, puis 2. L'ordre est conservé.</li></ul>
<p><b>Ce qu'on a le droit de faire :</b> seulement ces opérations, plus estVide. Pas de numéro de case, pas de tête ni de queue : pour voir ce qu'il y a au fond d'une pile, il faut dépiler tout ce qui est au-dessus.</p>
<p><b>Transvaser une pile dans une autre,</b> c'est dépiler P élément par élément, et empiler chaque élément dans Q, jusqu'à ce que P soit vide :</p>
${PS(`tant que non estVide(P) faire
    x ← depiler(P)
    empiler(x, Q)
fin tq;`)}
<p>Avec P qui contient 5, 8, 2 (2 au sommet) :</p>
<ul><li>je dépile 2 et je l'empile dans Q : Q contient 2 ;</li><li>je dépile 8 : Q contient 2, 8 ;</li><li>je dépile 5 : Q contient 2, 8, 5, avec 5 au sommet.</li></ul>
<p>Q contient les mêmes nombres que P, <b>dans l'ordre inverse</b>. C'est la clé des casse-têtes sur les piles : chaque transvasement retourne l'ordre.</p>`}},
rai:{
 "r-logique":{
  "Les connecteurs":`<p><b>Une proposition</b>, c'est une phrase qui est soit vraie, soit fausse. « $3 &gt; 1$ » est vraie ; « $2 = 5$ » est fausse. « Range ta chambre » n'en est pas une.</p>
<p><b>On les combine avec 5 mots :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Écrit</th><th>Se lit</th><th>Vrai quand…</th></tr></thead><tbody>
<tr><td>non P</td><td>« non P »</td><td>P est fausse</td></tr>
<tr><td>P et Q</td><td>« P et Q »</td><td>les deux sont vraies</td></tr>
<tr><td>P ou Q</td><td>« P ou Q »</td><td>au moins une est vraie (les deux, ça compte aussi)</td></tr>
<tr><td>P ⇒ Q</td><td>« si P, alors Q »</td><td>toujours, <b>sauf</b> si P est vraie et Q fausse</td></tr>
<tr><td>P ⇔ Q</td><td>« P si et seulement si Q »</td><td>P et Q ont la même valeur</td></tr></tbody></table></div>
<p>Le cours écrit aussi ces mots avec des symboles : ¬P pour « non P », P ∧ Q pour « P et Q », P ∨ Q pour « P ou Q ». Dans les tables de vérité, V veut dire vrai et F faux.</p>
<p><b>Exemples avec des nombres :</b></p>
<ul><li>« $3 &gt; 1$ et $2 = 5$ » : fausse, car la deuxième est fausse.</li><li>« $3 &gt; 1$ ou $2 = 5$ » : vraie, car la première suffit.</li><li>« si $3 &gt; 1$, alors $2 = 5$ » : fausse. On part de vrai et on arrive à faux.</li><li>« si $2 = 5$, alors $3 &gt; 1$ » : vraie. Quand le « si » est faux, l'implication est toujours vraie.</li></ul>
<p><b>Le point qui surprend :</b> « P ⇒ Q » ne dit rien quand P est fausse. Une promesse « si tu as 20, je t'invite » n'est pas trahie si tu n'as pas 20.</p>`,
  "Équivalences et lois de De Morgan":`<p><b>Équivalentes</b> veut dire : deux propositions qui ont toujours la même valeur, quoi que valent P et Q. On l'écrit ≡.</p>
<p><b>Les lois de De Morgan : pour nier un « et » ou un « ou », on nie chaque morceau et on échange « et » et « ou ».</b></p>
<ul><li>non(P et Q) ≡ (non P) ou (non Q). Exemple : le contraire de « il fait beau et chaud », c'est « il ne fait pas beau, ou il ne fait pas chaud ».</li><li>non(P ou Q) ≡ (non P) et (non Q). Exemple : le contraire de « je prends du thé ou du café », c'est « je ne prends ni thé ni café ».</li></ul>
<p><b>Nier une implication :</b> non(P ⇒ Q) ≡ P et (non Q). Le contraire de « s'il pleut, je prends un parapluie », c'est « il pleut et je ne prends pas de parapluie ». Ce n'est <b>pas</b> une autre implication.</p>
<p><b>⇔, c'est deux implications :</b> P ⇔ Q ≡ (P ⇒ Q) et (Q ⇒ P).</p>
<p><b>Pour vérifier une équivalence,</b> on fait les tables de vérité des deux côtés : 4 lignes (V V, V F, F V, F F) et on compare.</p>`},
 "r-quantif":{
  "Traduire avec ∀ et ∃":`<p><b>Deux symboles :</b></p>
<ul><li><b>$∀$</b> se lit « pour tout » : la propriété doit marcher pour chaque élément.</li><li><b>$∃$</b> se lit « il existe » : il suffit d'un élément qui marche.</li></ul>
<p><b>Les autres signes.</b> $∈$ se lit « appartient à » : $x ∈ ℝ$ veut dire « $x$ est un réel ». ℕ désigne les entiers naturels (0, 1, 2…), ℤ les entiers relatifs (…, −1, 0, 1…), ℚ les fractions, et ℝ tous les réels.</p>
<p><b>Traduire une phrase en symboles :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Phrase</th><th>En symboles</th></tr></thead><tbody>
<tr><td>Tout réel au carré est positif.</td><td>$∀x ∈ ℝ, x² ≥ 0$</td></tr>
<tr><td>Il existe un entier plus grand que $100$.</td><td>$∃n ∈ ℕ, n &gt; 100$</td></tr>
<tr><td>Tout entier pair est la somme de deux entiers impairs.</td><td>$∀n ∈ ℤ$, (n pair) ⇒ ($∃a ∈ ℤ, ∃b ∈ ℤ$, a et b impairs et $n = a + b$)</td></tr></tbody></table></div>
<p><b>« Tout … qui … » devient un $∀$ avec une implication :</b> « tout entier pair est … » = « pour tout entier n, si n est pair, alors … ».</p>
<p><b>L'ordre compte.</b> « $∀x, ∃y, y &gt; x$ » : pour chaque $x$, on trouve un $y$ plus grand (on peut prendre $y = x + 1$) : vrai. « $∃y, ∀x, y &gt; x$ » : un même $y$ plus grand que tous les nombres : faux.</p>`,
  "Nier une phrase quantifiée":`<p><b>La recette, de gauche à droite :</b></p>
<ol><li>chaque $∀$ devient $∃$ ;</li><li>chaque $∃$ devient $∀$ ;</li><li>on nie la propriété de la fin. Les « $∈ ℝ$ », eux, ne changent pas.</li></ol>
<p><b>Exemple 1.</b> « $∀x ∈ ℝ, x² ≥ 0$ » se nie en « $∃x ∈ ℝ, x² &lt; 0$ ». Le contraire de $≥$ est $&lt;$.</p>
<p><b>Exemple 2.</b> « $∃n ∈ ℕ, ∀m ∈ ℕ, m ≤ n$ » (il y a un plus grand entier) se nie en « $∀n ∈ ℕ, ∃m ∈ ℕ, m &gt; n$ » (pour tout entier, il y en a un plus grand).</p>
<p><b>Les pièges de la fin :</b></p>
<ul><li>le contraire de $a &lt; x &lt; b$ est « $x ≤ a$ ou $x ≥ b$ » (c'est un « et » caché, il devient un « ou ») ;</li><li>le contraire de « P ⇒ Q » est « P et non Q ».</li></ul>
<p><b>Avec des mots :</b> « tous les chats sont gris » se nie en « il existe un chat qui n'est pas gris », et pas en « aucun chat n'est gris ».</p>`},
 "r-preuves":{
  "Comment commencer":`<p><b>La première ligne d'une preuve dépend de la forme de ce qu'on veut montrer.</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>On veut montrer</th><th>On écrit d'abord</th></tr></thead><tbody>
<tr><td>$∀x ∈ E$, P(x)</td><td>« Soit $x ∈ E$. » Puis on prouve P(x) pour ce $x$ quelconque.</td></tr>
<tr><td>$∃x ∈ E$, P(x)</td><td>« Posons $x = …$ » (on donne un $x$ précis), puis on vérifie P(x).</td></tr>
<tr><td>P ⇒ Q</td><td>« Supposons P. » Puis on montre Q.</td></tr>
<tr><td>P ⇔ Q</td><td>Deux parties : P ⇒ Q, puis Q ⇒ P.</td></tr></tbody></table></div>
<p><b>Exemple :</b> montrer que $∀n ∈ ℕ, ∃m ∈ ℕ, m &gt; 2n$.</p>
<p>« Soit $n ∈ ℕ$. Posons $m = 2n + 1$, qui est bien un entier naturel. Alors $m = 2n + 1 &gt; 2n$. »</p>
<p>On a d'abord pris un $n$ quelconque (pour le $∀$), puis donné un $m$ précis qui dépend de $n$ (pour le $∃$).</p>
<p><b>Pour montrer qu'un « $∀$ » est faux,</b> un seul contre-exemple suffit. « $∀x ∈ ℝ, x² &gt; 0$ » est faux : $x = 0$ donne $0² = 0$.</p>`},
 "r-contraposee":{
  "Contraposée et réciproque":`<p><b>Trois phrases à ne pas confondre</b>, à partir de « si P, alors Q » :</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Nom</th><th>Phrase</th><th>Même sens ?</th></tr></thead><tbody>
<tr><td>de départ</td><td>P ⇒ Q</td><td></td></tr>
<tr><td>contraposée</td><td>non Q ⇒ non P</td><td><b>oui</b>, toujours</td></tr>
<tr><td>réciproque</td><td>Q ⇒ P</td><td><b>non</b>, pas forcément</td></tr></tbody></table></div>
<p><b>Exemple :</b> « si un nombre est un multiple de 4, alors il est pair ».</p>
<ul><li>contraposée : « s'il n'est pas pair, alors ce n'est pas un multiple de 4 ». Vraie aussi ;</li><li>réciproque : « s'il est pair, alors c'est un multiple de 4 ». Fausse : 6 est pair mais pas multiple de 4.</li></ul>
<p><b>À quoi sert la contraposée :</b> parfois « non Q » donne une information plus facile à utiliser. Pour montrer « si $n²$ est pair, alors $n$ est pair », on montre plutôt « si $n$ est impair, alors $n²$ est impair » : $n = 2k + 1$, avec $k$ entier, donne $n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1$, impair.</p>`,
  "Par l'absurde et par disjonction de cas":`<p><b>Par l'absurde :</b> on suppose le contraire de ce qu'on veut montrer, et on tombe sur quelque chose d'impossible. Donc le contraire était faux : ce qu'on voulait est vrai.</p>
<p><b>Exemple :</b> « il n'y a pas de plus grand entier ». Supposons qu'il y en ait un, $N$. Alors $N + 1$ est un entier, et $N + 1 &gt; N$ : $N$ n'était pas le plus grand. Contradiction.</p>
<p><b>La première ligne est importante :</b> on écrit exactement la négation de ce qu'on veut montrer. Pour « $∀x$, P(x) ⇒ Q(x) », le contraire est « il existe $x$ tel que P(x) et non Q(x) ».</p>
<p><b>Par disjonction de cas :</b> on coupe en cas qui couvrent toutes les possibilités, et on traite chacun.</p>
<p><b>Exemple :</b> « $n(n + 1)$ est pair pour tout entier $n$ ».</p>
<ul><li>si $n$ est pair, le produit contient un nombre pair : il est pair ;</li><li>si $n$ est impair, alors $n + 1$ est pair : le produit est pair.</li></ul>
<p>Les deux cas couvrent tous les entiers : c'est démontré.</p>`},
 "r-recurrence":{
  "Le schéma":`<p><b>L'image des dominos :</b> si le premier tombe, et si chaque domino qui tombe fait tomber le suivant, alors ils tombent tous.</p>
<p><b>Les 4 étapes, à écrire dans cet ordre :</b></p>
<ol><li><b>Énoncer</b> la propriété : « Pour $n ∈ ℕ$, notons P(n) : $1 + 2 + … + n = n(n + 1)/2$. »</li><li><b>Initialisation</b> (le premier domino) : on vérifie P(0) ou P(1). Pour $n = 1$ : à gauche $1$, à droite $1 × 2/2 = 1$. Vrai.</li><li><b>Hérédité</b> (chaque domino fait tomber le suivant) : « Soit $n$. Supposons P(n). Montrons P(n + 1). » On part de $1 + … + n + (n + 1)$, on remplace $1 + … + n$ par $n(n + 1)/2$ (c'est P(n)), et on calcule : $n(n + 1)/2 + (n + 1) = (n + 1)(n + 2)/2$. C'est P(n + 1).</li><li><b>Conclusion</b> : « Par récurrence, P(n) est vraie pour tout $n ≥ 1$. »</li></ol>
<p><b>L'erreur classique :</b> oublier l'initialisation. Une hérédité seule ne prouve rien : les dominos tombent les uns sur les autres, mais si aucun ne commence, rien ne bouge.</p>`,
  "Inégalités par récurrence":`<p><b>Même schéma, mais avec des inégalités.</b> Dans l'hérédité, on part du terme de rang $n + 1$, on fait apparaître celui de rang $n$, et on utilise l'hypothèse.</p>
<p><b>Exemple :</b> pour tout $n ≥ 1$, $3ⁿ ≥ 2n + 1$.</p>
<ol><li>Initialisation, $n = 1$ : $3¹ = 3$ et $2 × 1 + 1 = 3$. On a bien $3 ≥ 3$.</li><li>Hérédité : on suppose $3ⁿ ≥ 2n + 1$. Alors $3ⁿ⁺¹ = 3 × 3ⁿ ≥ 3(2n + 1) = 6n + 3$.</li><li>Il reste à voir que $6n + 3 ≥ 2(n + 1) + 1 = 2n + 3$ : c'est vrai, car $6n ≥ 2n$.</li><li>Donc $3ⁿ⁺¹ ≥ 2(n + 1) + 1$ : c'est la propriété au rang $n + 1$.</li></ol>
<p><b>La règle à surveiller :</b> on peut multiplier les deux côtés d'une inégalité par un nombre <b>positif</b> sans changer le sens. Ici on a multiplié par $3$.</p>`},
 "r-ensembles":{
  "Décrire un ensemble":`<p><b>Trois façons d'écrire un ensemble :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Façon</th><th>Exemple</th><th>Ce que ça donne</th></tr></thead><tbody>
<tr><td>en listant (extension)</td><td>$\{1, 3, 5\}$</td><td>trois éléments : 1, 3 et 5</td></tr>
<tr><td>par une propriété (compréhension)</td><td>$\{x ∈ ℝ | x² = 4\}$</td><td>les réels dont le carré vaut 4 : $\{−2, 2\}$</td></tr>
<tr><td>avec un paramètre</td><td>$\{3k | k ∈ ℤ\}$</td><td>les multiples de 3 : …, −3, 0, 3, 6, …</td></tr></tbody></table></div>
<p>Dans $\{x ∈ ℝ | x² = 4\}$, la barre « | » se lit « tel que » : « l'ensemble des réels $x$ tels que $x² = 4$ ».</p>
<p><b>Deux symboles à ne pas mélanger :</b></p>
<ul><li><b>$∈$</b> « appartient à » : entre un <b>élément</b> et un ensemble. $3 ∈ \{1, 3, 5\}$.</li><li><b>$⊂$</b> « est inclus dans » : entre deux <b>ensembles</b>. $\{1, 3\} ⊂ \{1, 3, 5\}$ : tous les éléments du premier sont dans le second.</li></ul>
<p><b>Deux ensembles sont égaux</b> quand chacun est inclus dans l'autre : on le montre en deux temps (double inclusion).</p>`,
  "Parties et produit":`<p><b>Les parties d'un ensemble</b> $E$, ce sont tous les ensembles qu'on peut former avec ses éléments, y compris l'ensemble vide $∅$ et $E$ lui-même. On les range dans un nouvel ensemble, noté $P(E)$.</p>
<p><b>Exemple :</b> $E = \{1, 2, 3\}$. Ses parties :</p>
<ul><li>sans élément : $∅$ ;</li><li>un élément : $\{1\}$, $\{2\}$, $\{3\}$ ;</li><li>deux éléments : $\{1, 2\}$, $\{1, 3\}$, $\{2, 3\}$ ;</li><li>trois éléments : $\{1, 2, 3\}$.</li></ul>
<p>Cela fait $8 = 2³$ parties. En général, $n$ éléments donnent $2ⁿ$ parties : pour chaque élément, on choisit de le prendre ou non.</p>
<p><b>Attention aux symboles :</b> $\{1\} ∈ P(E)$ (c'est un élément de $P(E)$) et $\{1\} ⊂ E$ (c'est une partie de $E$).</p>
<p><b>Le produit cartésien</b> $A × B$ est l'ensemble des couples $(a, b)$ avec $a ∈ A$ et $b ∈ B$. Exemple : $\{1, 2\} × \{x, y\} = \{(1, x), (1, y), (2, x), (2, y)\}$.</p>`},
 "r-operations":{
  "Les opérations":`<p><b>Trois opérations</b>, avec $A = \{1, 2, 3, 4\}$ et $B = \{3, 4, 5\}$ :</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Écrit</th><th>Se lit</th><th>Contient</th><th>Ici</th></tr></thead><tbody>
<tr><td>$A ∪ B$</td><td>A union B</td><td>ce qui est dans A <b>ou</b> dans B</td><td>$\{1, 2, 3, 4, 5\}$</td></tr>
<tr><td>$A ∩ B$</td><td>A inter B</td><td>ce qui est dans A <b>et</b> dans B</td><td>$\{3, 4\}$</td></tr>
<tr><td>$A ∖ B$</td><td>A privé de B</td><td>ce qui est dans A <b>mais pas</b> dans B</td><td>$\{1, 2\}$</td></tr></tbody></table></div>
<p><b>Le complémentaire</b> de $A$ dans un ensemble $E$ qui le contient : tout ce qui est dans $E$ mais pas dans $A$. Avec $E = \{1, …, 6\}$, le complémentaire de $A$ est $\{5, 6\}$.</p>
<p>Le cours note $Ā$ (A avec une barre) le complémentaire de $A$, et $x ∉ B$ veut dire « $x$ n'appartient pas à $B$ ».</p>
<p><b>De Morgan, version ensembles :</b> le complémentaire d'une union est l'intersection des complémentaires, et inversement. C'est la même règle que pour « non(P ou Q) ».</p>
<p><b>Avec des intervalles,</b> on dessine une droite et on colorie : c'est le plus sûr.</p>`,
  "Prouver une égalité d'ensembles":`<p><b>Pour montrer que deux ensembles sont égaux, deux méthodes.</b></p>
<p><b>1. Double inclusion.</b> On montre $A ⊂ B$, puis $B ⊂ A$. Pour $A ⊂ B$, la première ligne est toujours : « Soit $x ∈ A$. » Puis on montre que $x ∈ B$.</p>
<p><b>2. Par équivalences.</b> On traduit chaque symbole en logique : $∪$ devient « ou », $∩$ devient « et », $∖$ devient « et non ». Puis on transforme la phrase.</p>
<p><b>Exemple :</b> montrer $A ∖ B = A ∩ B̄$ (le complémentaire de B).</p>
<p>$x ∈ A ∖ B$ ⇔ ($x ∈ A$ et $x ∉ B$) ⇔ ($x ∈ A$ et $x ∈ B̄$) ⇔ $x ∈ A ∩ B̄$.</p>
<p>Chaque flèche est une simple traduction : c'est démontré.</p>
<p><b>Conseil :</b> avant de prouver, teste sur un petit exemple chiffré pour être sûr que l'égalité est vraie.</p>`},
 "r-image":{
  "Les définitions":`<p><b>Une application</b> $f : E → F$ associe à chaque élément $x$ de $E$ un seul élément $f(x)$ de $F$.</p>
<p><b>Deux ensembles à savoir calculer.</b> On prend $f(x) = x + 1$, de $ℤ$ dans $ℤ$.</p>
<ul><li><b>L'image directe</b> $f(A)$ : on applique $f$ à tous les éléments de $A$. Avec $A = \{0, 1, 2\}$ : $f(A) = \{1, 2, 3\}$.</li><li><b>L'image réciproque</b> $f⁻¹(B)$ : les $x$ dont l'image tombe dans $B$. Avec $B = \{5, 10\}$ : on résout $x + 1 = 5$ et $x + 1 = 10$, donc $f⁻¹(B) = \{4, 9\}$.</li></ul>
<p><b>Le piège de la notation :</b> $f⁻¹(B)$ existe <b>toujours</b>, même si $f$ n'a pas de réciproque. Exemple avec $f(x) = x²$ : $f⁻¹(\{9\}) = \{−3, 3\}$, deux antécédents (un antécédent de $y$, c'est un $x$ tel que $f(x) = y$). Et $f⁻¹(\{−1\}) = ∅$ : aucun réel n'a pour carré $−1$.</p>
<p><b>Pour s'y retrouver :</b> $f(A)$ est dans l'ensemble d'arrivée, $f⁻¹(B)$ dans l'ensemble de départ.</p>`},
 "r-injective":{
  "Les trois définitions":`<p><b>On regarde combien de flèches arrivent sur chaque élément de l'ensemble d'arrivée.</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Mot</th><th>Chaque élément d'arrivée reçoit…</th><th>En phrase</th></tr></thead><tbody>
<tr><td>injective</td><td>au plus une flèche</td><td>deux départs différents ne vont jamais au même endroit</td></tr>
<tr><td>surjective</td><td>au moins une flèche</td><td>tout le monde à l'arrivée est atteint</td></tr>
<tr><td>bijective</td><td>exactement une flèche</td><td>les deux à la fois</td></tr></tbody></table></div>
<p><b>Exemples de $ℝ$ dans $ℝ$ :</b></p>
<ul><li>$f(x) = 2x$ : bijective. Chaque $y$ a un seul antécédent, $y/2$.</li><li>$f(x) = x²$ : pas injective ($f(2) = f(−2) = 4$), pas surjective ($−1$ n'est le carré de personne).</li><li>$f(x) = eˣ$ : injective, mais pas surjective ($0$ et les négatifs ne sont jamais atteints).</li></ul>`,
  "Les méthodes":`<p><b>Prouver qu'une application est injective :</b> « Soient $x$ et $x′$ tels que $f(x) = f(x′)$. » Puis on calcule jusqu'à obtenir $x = x′$.</p>
<p>Exemple avec $f(x) = 3x − 2$ : si $3x − 2 = 3x′ − 2$, alors $3x = 3x′$, donc $x = x′$. Injective.</p>
<p><b>Prouver qu'elle est surjective :</b> « Soit $y$ dans l'ensemble d'arrivée. » On résout $f(x) = y$ pour trouver un $x$ qui convient, et on vérifie qu'il est bien dans l'ensemble de départ.</p>
<p>Même exemple : $3x − 2 = y$ donne $x = (y + 2)/3$, qui est un réel. Surjective de $ℝ$ dans $ℝ$.</p>
<p><b>Pour dire non,</b> un contre-exemple : deux éléments différents de même image (pas injective), ou un élément jamais atteint (pas surjective).</p>
<p><b>Les ensembles comptent.</b> $f(x) = 3x − 2$ de $ℤ$ dans $ℤ$ n'est plus surjective : pour $y = 0$, il faudrait $x = 2/3$, qui n'est pas un entier.</p>`,
  "La réciproque":`<p><b>L'idée.</b> Quand $f$ est bijective, chaque $y$ de l'arrivée a exactement un antécédent $x$. La réciproque, notée $f⁻¹$, est l'application qui fait le chemin du retour : elle envoie $y$ sur cet $x$.</p>
<p><b>Ce que disent les deux égalités.</b> $Id_{E}$ est l'application « qui ne fait rien » sur $E$ : elle envoie $x$ sur $x$.</p>
<ul><li>$g ∘ f = Id_{E}$ veut dire : on applique $f$, puis $g$, et on retombe sur le $x$ de départ.</li><li>$f ∘ g = Id_{F}$ veut dire : on applique $g$, puis $f$, et on retombe sur le $y$ de départ.</li></ul>
<p><b>Exemple :</b> $f(x) = 5x − 10$, de $ℝ$ dans $ℝ$.</p>
<ol><li>On résout $5x − 10 = y$ : $5x = y + 10$, donc $x = (y + 10)/5$.</li><li>Donc $f⁻¹(y) = (y + 10)/5$.</li><li>On vérifie dans un sens : $f(f⁻¹(y)) = 5 × (y + 10)/5 − 10 = y$.</li><li>Et dans l'autre : $f⁻¹(f(x)) = (5x − 10 + 10)/5 = x$.</li></ol>
<p><b>Quand il n'y en a pas.</b> $x ↦ x²$, de $ℝ$ dans $ℝ$, n'a pas de réciproque : $4$ a deux antécédents ($2$ et $−2$), et $−1$ n'en a aucun. Elle n'est pas bijective.</p>
<p><b>Une seule réciproque possible.</b> La preuve de l'écran prend deux réciproques $g₁$ et $g₂$ et montre qu'elles donnent la même image à chaque $y$ : c'est la façon habituelle de prouver qu'un objet est unique.</p>
<p><b>Deux écritures qui se ressemblent.</b> $f⁻¹(B)$, avec une partie $B$ entre les parenthèses, est un ensemble qui existe toujours. $f⁻¹$ tout seul, ou $f⁻¹(y)$ avec un élément, n'a de sens que si $f$ est bijective.</p>`},
 "r-composition":{
  "La composée":`<p><b>Composer,</b> c'est enchaîner deux applications : on applique d'abord $f$, puis $g$ au résultat. On note $g ∘ f$, et on lit « $g$ rond $f$ ».</p>
<p><b>On lit de droite à gauche :</b> $(g ∘ f)(x) = g(f(x))$. Celle qui est écrite à droite agit en premier.</p>
<p><b>Exemple :</b> $f(x) = x + 1$ et $g(x) = x²$.</p>
<ul><li>$(g ∘ f)(2) = g(f(2)) = g(3) = 9$ ;</li><li>$(f ∘ g)(2) = f(g(2)) = f(4) = 5$.</li></ul>
<p>Les deux résultats sont différents : en général, $g ∘ f ≠ f ∘ g$.</p>
<p><b>Condition pour que $g ∘ f$ existe :</b> ce qui sort de $f$ doit pouvoir entrer dans $g$. Si $f$ fabrique des couples et que $g$ attend un nombre, on ne peut pas enchaîner.</p>`,
  "Les deux résultats à savoir prouver":`<p><b>Deux résultats du cours, avec leur preuve à connaître.</b></p>
<p><b>1. Si $g ∘ f$ est injective, alors $f$ est injective.</b> Idée : si $f$ envoyait deux éléments au même endroit, $g$ les enverrait encore au même endroit, et $g ∘ f$ ne serait pas injective.</p>
<p>Preuve : « Soient $x$ et $x′$ tels que $f(x) = f(x′)$. On applique $g$ : $g(f(x)) = g(f(x′))$. Comme $g ∘ f$ est injective, $x = x′$. »</p>
<p><b>2. Si $g ∘ f$ est surjective, alors $g$ est surjective.</b> Idée : tout ce qui est atteint par $g ∘ f$ est atteint par $g$, puisque $g$ agit en dernier.</p>
<p>Preuve : « Soit $z$. Comme $g ∘ f$ est surjective, il existe $x$ tel que $g(f(x)) = z$. Alors $y = f(x)$ vérifie $g(y) = z$. »</p>
<p><b>Pour retenir :</b> la première appliquée ($f$) hérite de l'injectivité, la dernière ($g$) de la surjectivité.</p>`}},
geo:{
 "g2-angles-reperes":{
  "L'angle entre deux vecteurs":`<p>Un vecteur, c'est une flèche : une direction, un sens, une longueur. On peut la déplacer sans la tourner, elle reste le même vecteur.</p><p>Pour mesurer l'angle entre deux flèches ${v("u")} et ${v("v")}, on les fait partir du même point O : ${v("u")} va de O à A, ${v("v")} va de O à B. L'angle entre les vecteurs est alors l'angle orienté <span class="ang">AOB</span> : on tourne de la première flèche vers la deuxième.</p><p>Exemple : si ${v("u")} pointe vers la droite et ${v("v")} vers le haut, (${v("u")}, ${v("v")}) = π/2, un quart de tour dans le sens inverse des aiguilles d'une montre, et (${v("v")}, ${v("u")}) = −π/2 : on tourne dans l'autre sens.</p><p>« À 2π près » veut dire qu'un tour complet ne change rien : π/2 et π/2 + 2π désignent le même angle.</p>`,
  "L'angle entre deux droites":`<p>Une droite n'a pas de sens : on peut la parcourir dans un sens ou dans l'autre. Pour mesurer l'angle entre deux droites, on choisit une flèche sur chacune, et on mesure l'angle entre les flèches.</p><p>Mais si on retourne une des flèches, l'angle change de π, un demi-tour. Pour que le résultat ne dépende pas de ce choix, on dit que l'angle entre deux droites est défini « à π près » : π/3 et π/3 + π = 4π/3 désignent le même angle de droites.</p><p>Exemple : deux droites parallèles font un angle nul (à π près) ; deux droites perpendiculaires font un angle de π/2 (à π près).</p>`,
  "Repères et coordonnées":`<p>Un repère sert à repérer un point par deux nombres, comme sur un plan de ville. On choisit un point de départ O et deux flèches ${v("OA")} et ${v("OB")} qui ne vont pas dans la même direction (O, A, B non alignés).</p><p>Pour aller de O à un point M, on avance x fois la flèche ${v("OA")}, puis y fois la flèche ${v("OB")} : ${v("OM")} = x${v("OA")} + y${v("OB")}. Les deux nombres (x, y) sont les coordonnées de M, et il n'y a qu'une seule façon de les choisir.</p><p>Exemple : si ${v("OM")} = 3${v("OA")} + 2${v("OB")}, M a pour coordonnées (3, 2). Si ${v("OM")} = −${v("OA")}, M a pour coordonnées (−1, 0).</p>`,
  "Orthogonal, orthonormé, direct":`<p>Les deux flèches d'un repère peuvent avoir n'importe quelle longueur et faire n'importe quel angle. Trois cas ont un nom :</p><ul><li><b>orthogonal</b> : les deux flèches font un angle droit ;</li><li><b>orthonormé</b> : un angle droit, et les deux flèches mesurent 1, comme le quadrillage habituel ;</li><li><b>direct</b> : on passe de la première flèche à la deuxième en tournant dans le sens inverse des aiguilles d'une montre, de moins d'un demi-tour.</li></ul><p>Exemple : ${v("OA")} vers la droite et ${v("OB")} vers le haut, tous les deux de longueur 1 : repère orthonormé direct. Si ${v("OB")} mesure 2, le repère est seulement orthogonal.</p>`
 },
 "g2-bases":{
  "Médiane, médiatrice, hauteur, bissectrice":`<p><b>Les mots de départ.</b> Le <b>milieu</b> d'un segment $[BC]$ est le point $I$ de ce segment qui est à la même distance de $B$ et de $C$ : $BI = IC$. Deux droites sont <b>perpendiculaires</b> quand elles se coupent à angle droit, comme le coin d'une feuille ; on écrit $(AH) ⊥ (BC)$.</p>
<p><b>Trois droites qui partent d'un sommet.</b> On part de $A$ et on va vers le côté d'en face, $[BC]$ :</p>
<ul><li>la <b>médiane</b> vise le <b>milieu</b> de $[BC]$ ;</li><li>la <b>hauteur</b> arrive sur $(BC)$ <b>à angle droit</b> ;</li><li>la <b>bissectrice</b> coupe <b>l'angle</b> en $A$ en deux angles égaux.</li></ul>
<p>Dans un triangle quelconque, elles arrivent en trois points différents du côté $[BC]$ : sur la figure, $H$, $D$ et $I$.</p>
<p><b>Une droite qui appartient à un côté.</b> La <b>médiatrice</b> de $[BC]$ passe par le milieu de $[BC]$ et lui est perpendiculaire. Elle ne dépend pas de $A$. Tous ses points sont à la même distance de $B$ et de $C$.</p>
<p><b>Pour ne plus confondre.</b> « Médiane » et « médiatrice » commencent pareil parce que les deux passent par un milieu. La médiane part en plus d'un sommet ; la médiatrice est en plus perpendiculaire au segment.</p>
<p><b>Exemple avec des coordonnées.</b> $B(0, 0)$, $C(6, 0)$ et $A(1, 4)$. Le milieu de $[BC]$ est $I(3, 0)$ : la médiane issue de $A$ va de $(1, 4)$ à $(3, 0)$. La hauteur issue de $A$ descend tout droit jusqu'à $H(1, 0)$. La médiatrice de $[BC]$ est la droite verticale qui passe par $(3, 0)$ : elle ne passe pas par $A$.</p>`,
  "Deux triangles isométriques : choisir les bons":`<p><b>Isométriques</b> veut dire « mêmes mesures » : deux triangles isométriques ont les mêmes trois longueurs de côtés et les mêmes trois angles. Découpés dans du papier, on peut poser l'un exactement sur l'autre.</p>
<p><b>Pourquoi c'est utile.</b> Pour savoir que deux triangles sont isométriques, il suffit de vérifier <b>trois</b> égalités bien choisies : c'est l'axiome V. On gagne alors d'un coup toutes les autres égalités, celles des côtés et des angles qu'on ne connaissait pas.</p>
<p><b>Les trois façons de choisir :</b></p>
<ul><li><b>CCC</b> (côté, côté, côté) : les trois côtés sont égaux deux à deux ;</li><li><b>CAC</b> (côté, angle, côté) : deux côtés égaux, et l'angle <b>coincé entre ces deux côtés</b> ;</li><li><b>ACA</b> (angle, côté, angle) : un côté égal et deux angles égaux.</li></ul>
<p><b>Qui correspond à qui.</b> Quand on écrit « $AIC$ et $AJB$ sont isométriques », l'ordre des lettres compte : $A$ correspond à $A$, $I$ correspond à $J$, $C$ correspond à $B$. Le côté $[IC]$ correspond donc au côté $[JB]$, et $IC = JB$.</p>
<p><b>Le piège.</b> Avant de chercher les trois égalités, regarde ce qu'on te demande. Si la question porte sur $IC$ et $BJ$, il te faut un triangle qui a $[IC]$ pour côté et un autre qui a $[BJ]$ pour côté.</p>`,
  "L'inégalité triangulaire":`<p><b>Une distance</b>, c'est la longueur du chemin tout droit entre deux points. On écrit $AB$ pour la distance de $A$ à $B$ : c'est un nombre positif.</p>
<p><b>L'idée.</b> Pour aller de $A$ à $B$, on peut aller tout droit, ou faire un détour par un troisième point $M$. Le détour mesure $AM + MB$. Il n'est jamais plus court que le chemin direct : $AB ≤ AM + MB$.</p>
<p><b>Exemple avec des coordonnées.</b> $A(0, 0)$, $B(4, 0)$ et $M(2, 3)$. Le chemin direct mesure $AB = 4$. Le détour mesure $AM + MB = √13 + √13$, soit environ $7,2$. On a bien $4 ≤ 7,2$.</p>
<p><b>Quand le détour ne coûte rien.</b> Si $M$ est sur le segment $[AB]$, par exemple $M(1, 0)$ : $AM + MB = 1 + 3 = 4 = AB$. C'est le seul cas d'égalité.</p>
<p><b>Lire le symbole.</b> $≤$ se lit « est inférieur ou égal à ». Écrire $x ≥ y$ ou $y ≤ x$, c'est dire la même chose dans l'autre sens : le sujet du CC1 écrit $MA + MB + MC ≥ …$, son corrigé écrit $… ≤ MA + MB + MC$.</p>
<p><b>Additionner des inégalités.</b> Si $a ≤ b$ et $c ≤ d$, alors $a + c ≤ b + d$. C'est ce qui permet d'écrire une inégalité triangulaire par côté, puis de tout additionner.</p>`,
  "« Énoncer », « montrer », « déterminer » : ce que le correcteur attend":`<p>Dans un sujet, le <b>verbe</b> de la question dit ce qu'il faut écrire. Trois verbes reviennent.</p>
<ul><li><b>Énoncer</b> : écrire la règle elle-même, avec ses conditions. Exemple : « Énoncer le théorème de Thalès » (2 points au CC1 2026). On écrit le théorème, et c'est tout.</li><li><b>Montrer</b> (ou démontrer, prouver) : expliquer <b>pourquoi</b> c'est vrai, étape par étape, chaque étape appuyée sur une hypothèse ou sur un résultat déjà connu. Si on te demande de montrer une règle du cours, tu ne peux pas t'appuyer sur cette règle : ce serait répondre « c'est vrai parce que c'est vrai ». Il faut réécrire la démonstration du poly.</li><li><b>Déterminer</b> (ou calculer) : arriver à une <b>valeur</b>, comme $π/6$ ou $5$. Une phrase comme « c'est la moitié de l'angle en $A$ » n'est pas encore une valeur.</li></ul>
<p><b>Une hypothèse</b>, c'est ce que l'énoncé donne comme vrai : « $ABC$ est équilatéral », « $M$ est un point de $[BC]$ ». Un sujet de contrôle ne donne presque jamais une hypothèse pour rien. D'où le test de fin : relis l'énoncé et coche chaque hypothèse que tu as utilisée. S'il en reste une, il manque sans doute une étape.</p>
<p><b>Trois écritures à ne pas mélanger.</b> $AB$ est un nombre (une distance). $[AB]$ est un segment : un morceau de droite, avec ses deux bouts. $(AB)$ est une droite entière. On peut écrire $AB = 5$, mais pas $[AB] = 5$.</p>`},
 "g2-transfo":{
  "Les deux définitions":`<p><b>Une translation fait glisser</b> toute la figure dans une même direction, sur une même longueur. Elle est donnée par un vecteur $<span class="vec">u</span>$ : chaque point $M$ va en $M′$, avec $<span class="vec">MM′</span> = <span class="vec">u</span>$.</p>
<p>Avec des coordonnées : la translation de vecteur $(2, 1)$ envoie $M(1, 3)$ sur $M′(3, 4)$. On ajoute $2$ à l'abscisse et $1$ à l'ordonnée.</p>
<p><b>Une homothétie agrandit ou rétrécit</b> la figure à partir d'un point fixe $K$, le centre, d'un facteur $λ$, le rapport : $<span class="vec">KM′</span> = λ <span class="vec">KM</span>$.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Centre $O(0, 0)$, $M(1, 2)$</th><th>Image $M′$</th><th>Ce qui se passe</th></tr></thead><tbody>
<tr><td>rapport $3$</td><td>$(3, 6)$</td><td>3 fois plus loin, du même côté</td></tr>
<tr><td>rapport $1/2$</td><td>$(1/2, 1)$</td><td>deux fois plus près</td></tr>
<tr><td>rapport $−1$</td><td>$(−1, −2)$</td><td>de l'autre côté de $O$ : c'est la symétrie de centre $O$</td></tr></tbody></table></div>
<p><b>Ce qu'elles conservent :</b> une translation garde les distances ; une homothétie de rapport $λ$ multiplie toutes les distances par $|λ|$, c'est-à-dire $λ$ sans son signe (rapport $−2$ : distances fois $2$). Les deux envoient une droite sur une droite <b>parallèle</b>, et gardent les angles.</p>
<p>Le cours note $t(M)$ l'image de $M$ par la translation $t$, et $h(M)$ son image par l'homothétie $h$ : c'est le point $M′$.</p>`},
 "g2-pythagore":{
  "Le théorème":`<p><b>Le théorème de Pythagore</b> dit deux choses à la fois, une dans chaque sens :</p>
<ul><li><b>sens direct :</b> si $ABC$ est rectangle en $A$, alors $BC² = AB² + AC²$ ;</li><li><b>réciproque :</b> si $BC² = AB² + AC²$, alors $ABC$ est rectangle en $A$.</li></ul>
<p>$BC$ est l'<b>hypoténuse</b> : le côté en face de l'angle droit, le plus long.</p>
<p><b>Exemples :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Côtés</th><th>Calcul</th><th>Rectangle ?</th></tr></thead><tbody>
<tr><td>$6$, $8$, $10$</td><td>$6² + 8² = 36 + 64 = 100 = 10²$</td><td>oui (réciproque)</td></tr>
<tr><td>$4$, $5$, $6$</td><td>$4² + 5² = 16 + 25 = 41$, et $6² = 36$</td><td>non</td></tr>
<tr><td>rectangle, côtés $5$ et $12$</td><td>$BC² = 25 + 144 = 169$</td><td>$BC = 13$ (sens direct)</td></tr></tbody></table></div>
<p><b>Au CC, il faut savoir le démontrer.</b> Le poly fait les deux sens avec deux méthodes différentes : le sens direct avec des triangles semblables (la hauteur issue de $A$ coupe le triangle en deux triangles semblables au grand), la réciproque en construisant un triangle rectangle de mêmes côtés et en montrant qu'il est isométrique. La leçon déroule les deux preuves étape par étape.</p>`},
 "g2-trigo":{
  "Les formules d'addition":`<p>On connaît par cœur le cosinus et le sinus de quelques angles : π/6, π/4, π/3. Les formules d'addition servent à calculer ceux d'une somme ou d'une différence de deux angles connus.</p><p>Attention : cos(x + y) n'est <b>pas</b> cos(x) + cos(y). Par exemple cos(π/2) = 0, alors que cos(π/4) + cos(π/4) = √2, environ 1,41.</p><p>Exemple pas à pas : π/12 = π/3 − π/4. Donc cos(π/12) = cos(π/3) cos(π/4) + sin(π/3) sin(π/4), avec un + car on retire π/4. Cela fait 1/2 × √2/2 + √3/2 × √2/2 = √2/4 + √6/4 = (√2 + √6)/4.</p>`,
  "L'angle double":`<p>« L'angle double », c'est 2x, deux fois l'angle x. On ne peut pas dire que sin(2x) = 2 sin(x) : par exemple sin(2 × π/2) = sin(π) = 0, alors que 2 sin(π/2) = 2.</p><p>On écrit 2x = x + x et on applique les formules d'addition : sin(x + x) = sin(x) cos(x) + cos(x) sin(x) = 2 sin(x) cos(x), et cos(x + x) = cos(x) cos(x) − sin(x) sin(x) = cos(x)² − sin(x)².</p><p>Exemple : si cos(x) = 3/5 et sin(x) = 4/5, alors sin(2x) = 2 × 4/5 × 3/5 = 24/25.</p>`,
  "Les définitions":`<p><b>Dans un triangle rectangle,</b> on regarde un angle aigu, ici $B̂$, et on nomme les côtés par rapport à lui :</p>
<ul><li>l'<b>hypoténuse</b> : en face de l'angle droit ;</li><li>le côté <b>adjacent</b> : celui qui touche $B$, et qui n'est pas l'hypoténuse ;</li><li>le côté <b>opposé</b> : celui qui est en face de $B$.</li></ul>
<p><b>Les trois rapports (CAH SOH TOA) :</b> cos = adjacent / hypoténuse, sin = opposé / hypoténuse, tan = opposé / adjacent.</p>
<p><b>Exemple :</b> $ABC$ rectangle en $A$, avec $AB = 12$, $AC = 5$ et $BC = 13$. Pour l'angle $B̂$ : l'adjacent est $AB = 12$, l'opposé est $AC = 5$.</p>
<div style="overflow-x:auto"><table class="tbl"><tbody>
<tr><td>$cos B̂$</td><td>$12/13$</td></tr><tr><td>$sin B̂$</td><td>$5/13$</td></tr><tr><td>$tan B̂$</td><td>$5/12$</td></tr></tbody></table></div>
<p><b>Pourquoi ça ne dépend que de l'angle :</b> deux triangles rectangles qui ont le même angle aigu sont semblables (l'un est un agrandissement de l'autre), donc leurs rapports de côtés sont les mêmes.</p>`,
  "Valeurs et symétries":`<p><b>Les angles sont en radians.</b> $π$ radians, c'est un demi-tour, $180°$. Donc $π/6 = 30°$, $π/4 = 45°$, $π/3 = 60°$ et $π/2 = 90°$ (l'angle droit).</p>
<p><b>Les valeurs à connaître par cœur :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>$x$</th><th>$0$</th><th>$π/6$</th><th>$π/4$</th><th>$π/3$</th><th>$π/2$</th></tr></thead><tbody>
<tr><td>$cos x$</td><td>$1$</td><td>$√3/2$</td><td>$√2/2$</td><td>$1/2$</td><td>$0$</td></tr>
<tr><td>$sin x$</td><td>$0$</td><td>$1/2$</td><td>$√2/2$</td><td>$√3/2$</td><td>$1$</td></tr></tbody></table></div>
<p><b>Astuce :</b> la ligne du sinus est celle du cosinus à l'envers, car $sin x = cos(π/2 − x)$.</p>
<p><b>Les symétries :</b> $cos(−x) = cos x$ et $sin(−x) = −sin x$. Exemple : $sin(−π/6) = −1/2$.</p>
<p><b>Les formules d'addition</b> (à savoir par cœur) :</p>
<ul><li>$sin(x + y) = sin x cos y + cos x sin y$ ;</li><li>$cos(x + y) = cos x cos y − sin x sin y$.</li></ul>
<p><b>Vérification :</b> $sin(π/3 + π/6) = sin(π/3) cos(π/6) + cos(π/3) sin(π/6) = (√3/2)(√3/2) + (1/2)(1/2) = 3/4 + 1/4 = 1$. Et en effet $π/3 + π/6 = π/2$, et $sin(π/2) = 1$.</p>`},
 "g2-aire-alkashi":{
  "Le théorème de l'aire":`<p><b>La formule :</b> l'aire d'un triangle vaut la moitié du produit de deux côtés, multiplié par le sinus de l'angle entre ces deux côtés.</p>
<p>Aire $= ½ × b × c × sin Â$, où $b$ et $c$ sont les deux côtés qui partent de $A$.</p>
<p><b>Les noms du cours.</b> $Â$ est l'angle au sommet $A$ (de même $B̂$ et $Ĉ$). Chaque côté porte le nom du sommet d'en face, en minuscule : $a = BC$ (en face de $A$), $b = AC$ et $c = AB$.</p>
<p><b>Exemple :</b> deux côtés de longueurs $6$ et $4$, qui font un angle de $π/6$. Aire $= ½ × 6 × 4 × sin(π/6) = ½ × 6 × 4 × ½ = 6$.</p>
<p><b>D'où vient la formule :</b> l'aire, c'est base × hauteur / 2. Si on prend $AB = c$ comme base, la hauteur issue de $C$ vaut $b × sin Â$ (dans le petit triangle rectangle, sin = opposé / hypoténuse). Donc Aire $= c × b sin Â / 2$.</p>
<p><b>Au CC 2025, cette démonstration valait 2 points</b> : la leçon la déroule étape par étape.</p>`,
  "Al-Kashi":`<p><b>Al-Kashi, c'est Pythagore pour un triangle quelconque.</b> On ajoute un terme de correction qui dépend de l'angle :</p>
<p>$a² = b² + c² − 2bc cos Â$, où $a$ est le côté en face de l'angle $Â$.</p>
<p><b>Si l'angle est droit,</b> $cos Â = 0$ et on retrouve Pythagore : $a² = b² + c²$.</p>
<p><b>Exemple 1, trouver un côté :</b> $b = 3$, $c = 5$ et $Â = π/3$. $a² = 9 + 25 − 2 × 3 × 5 × ½ = 34 − 15 = 19$, donc $a = √19$.</p>
<p><b>Exemple 2, trouver un angle :</b> on retourne la formule, $cos Â = (b² + c² − a²)/(2bc)$. Pour un triangle de côtés $5$, $6$ et $7$, l'angle en face de $7$ a pour cosinus $(25 + 36 − 49)/(2 × 5 × 6) = 12/60 = 1/5$.</p>`},
 "g2-rotation-scalaire":{
  "Rotations":`<p><b>Une rotation fait tourner</b> la figure autour d'un point fixe $Z$, le centre, d'un angle $α$. Chaque point reste à la même distance du centre : $ZM′ = ZM$.</p>
<p><b>Exemple :</b> le quart de tour de centre $O(0, 0)$, d'angle $π/2$, dans le sens inverse des aiguilles d'une montre.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>$M$</th><th>$M′$</th></tr></thead><tbody>
<tr><td>$(1, 0)$</td><td>$(0, 1)$</td></tr><tr><td>$(0, 1)$</td><td>$(−1, 0)$</td></tr><tr><td>$(2, 3)$</td><td>$(−3, 2)$</td></tr></tbody></table></div>
<p><b>Ce qu'elle conserve :</b> les distances et les angles. Une droite devient une droite, qui fait avec la première un angle égal à $|α|$. Pour un quart de tour, la droite et son image sont donc perpendiculaires.</p>
<p><b>Cas particulier :</b> la rotation d'angle $π$ (un demi-tour) est la symétrie de centre $Z$. Avec $Z = O$ : $(x, y)$ devient $(−x, −y)$.</p>`,
  "Produit scalaire":`<p><b>Le produit scalaire</b> de deux vecteurs est un <b>nombre</b> qui mesure à quel point ils vont dans la même direction.</p>
<p><b>Les notations.</b> $⟨u, v⟩$ est le produit scalaire de $u$ et $v$. $‖u‖$ est la longueur du vecteur $u$ (on dit aussi sa norme). Un repère <b>orthonormé</b> a deux axes perpendiculaires, avec la même unité sur les deux.</p>
<p><b>Deux façons de le calculer :</b></p>
<ul><li>avec les longueurs et l'angle : $⟨u, v⟩ = ‖u‖ × ‖v‖ × cos(angle)$ ;</li><li>avec les coordonnées, dans un repère orthonormé : $⟨(x, y), (x′, y′)⟩ = xx′ + yy′$.</li></ul>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>$u$</th><th>$v$</th><th>$⟨u, v⟩$</th><th>Ce que ça dit</th></tr></thead><tbody>
<tr><td>$(2, 1)$</td><td>$(1, 3)$</td><td>$2 + 3 = 5$</td><td>positif : angle aigu</td></tr>
<tr><td>$(2, 1)$</td><td>$(−1, 2)$</td><td>$−2 + 2 = 0$</td><td>nul : orthogonaux</td></tr>
<tr><td>$(1, 0)$</td><td>$(−3, 1)$</td><td>$−3$</td><td>négatif : angle obtus</td></tr></tbody></table></div>
<p><b>La longueur (norme)</b> d'un vecteur : $‖(x, y)‖ = √(x² + y²)$. Exemple : $‖(3, 4)‖ = √(9 + 16) = 5$.</p>
<p><b>À retenir :</b> deux vecteurs non nuls sont orthogonaux exactement quand leur produit scalaire vaut $0$.</p>`},
 "g2-cercle":{
  "Les trois cas":`<p><b>Une droite et un cercle :</b> tout dépend de la distance $d$ entre le centre et la droite, comparée au rayon $r$.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Cas</th><th>Exemple, $r = 4$</th><th>Points communs</th></tr></thead><tbody>
<tr><td>$d &gt; r$</td><td>$d = 6$</td><td>aucun : la droite passe à côté</td></tr>
<tr><td>$d = r$</td><td>$d = 4$</td><td>un seul : la droite est <b>tangente</b></td></tr>
<tr><td>$d &lt; r$</td><td>$d = 2$</td><td>deux : la droite coupe le cercle</td></tr></tbody></table></div>
<p><b>La distance $d$</b> se mesure avec le projeté orthogonal $M$ du centre $O$ sur la droite : $M$ est le point de la droite où arrive la perpendiculaire à la droite qui passe par $O$. Alors $d = OM$.</p>
<p><b>Dans le troisième cas,</b> $M$ est le milieu des deux points d'intersection $A$ et $B$. Par Pythagore dans le triangle $OMA$ : $MA² = r² − d² = 16 − 4 = 12$, donc $MA = √12 = 2√3$.</p>
<p><b>Pourquoi ça marche :</b> pour tout point $X$ de la droite, $OX² = OM² + XM² ≥ OM²$. Le point de la droite le plus proche du centre est $M$.</p>`,
  "Les tangentes depuis un point extérieur":`<p><b>D'un point $M$ à l'extérieur du cercle,</b> on peut tracer exactement deux tangentes. Elles touchent le cercle en deux points $T$ et $T′$.</p>
<p><b>La clé :</b> une tangente est perpendiculaire au rayon au point de contact. Le triangle $OTM$ est donc rectangle en $T$.</p>
<p><b>La longueur de la tangente,</b> par Pythagore : $OM² = OT² + MT²$, donc $MT = √(OM² − r²)$.</p>
<p><b>Exemple :</b> rayon $r = 5$, et $M$ à distance $OM = 13$ du centre. $MT = √(169 − 25) = √144 = 12$.</p>
<p><b>La symétrie :</b> les deux tangentes ont la même longueur, $MT = MT′$, et la droite $(MO)$ coupe l'angle $TMT′$ en deux angles égaux.</p>`},
 "g2-angle-centre":{
  "L'angle entre deux sécantes":`<p>On a un cercle de centre O et deux droites qui le traversent : la première le coupe en A et B, la deuxième en C et D.</p><p>Pour trouver l'angle entre ces deux droites, on regarde deux angles au centre : celui de A vers C (un point de la première droite, puis un de la deuxième), et celui de B vers D. On fait leur moyenne : on les additionne, puis on divise par 2.</p><p>Exemple : <span class="ang">AOC</span> = π/2 et <span class="ang">BOD</span> = π/6 donnent ½(π/2 + π/6) = ½ × 2π/3 = π/3. L'angle entre les droites vaut π/3, à π près, puisque c'est un angle de droites.</p>`,
  "L'énoncé":`<p><b>Deux sortes d'angles</b>, avec $A$ et $B$ sur un cercle de centre $O$ :</p>
<ul><li>l'<b>angle au centre</b> $AOB$ : son sommet est le centre ;</li><li>un <b>angle inscrit</b> $AMB$ : son sommet $M$ est sur le cercle.</li></ul>
<p><b>Le théorème :</b> l'angle au centre est le <b>double</b> de l'angle inscrit qui intercepte le même arc.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Angle inscrit $AMB$</th><th>Angle au centre $AOB$</th></tr></thead><tbody>
<tr><td>$π/5$</td><td>$2π/5$</td></tr><tr><td>$π/4$</td><td>$π/2$</td></tr><tr><td>$π/2$</td><td>$π$ : $A$, $O$, $B$ alignés</td></tr></tbody></table></div>
<p><b>Conséquence :</b> tous les angles inscrits qui interceptent le même arc sont égaux. Si tu déplaces $M$ sur le cercle (du même côté), l'angle $AMB$ ne change pas.</p>
<p><b>La démonstration</b> (3 points au CC 2025) utilise des triangles isocèles : $OA = OM = OB$, car ce sont des rayons. La leçon la déroule.</p>`,
  "Ce qu'on en déduit":`<p><b>1. Le cercle de diamètre.</b> Un point $M$ voit $[AB]$ sous un angle droit exactement quand il est sur le cercle de diamètre $[AB]$.</p>
<p>Exemple : $A$ et $B$ à distance $10$. Tous les points $M$ tels que $AMB$ soit rectangle en $M$ forment le cercle de centre le milieu de $[AB]$ et de rayon $5$ (sans $A$ ni $B$).</p>
<p>La raison : l'angle inscrit vaut $π/2$, donc l'angle au centre vaut $π$ : le centre est sur $[AB]$, en son milieu.</p>
<p><b>2. Quatre points sur un même cercle (cocycliques).</b> $A$, $B$, $C$, $D$ sont sur un même cercle (ou alignés) exactement quand $C$ et $D$ voient $[AB]$ sous le même angle. C'est la conséquence « tous les angles inscrits sur le même arc sont égaux », lue à l'envers.</p>`},
 "g-notations":{
  "Quatre écritures, quatre objets différents":`<p><b>Avec deux points $A$ et $B$, on écrit quatre choses différentes :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Écrit</th><th>C'est</th><th>Exemple</th></tr></thead><tbody>
<tr><td>$AB$</td><td>un <b>nombre</b> : la distance de $A$ à $B$</td><td>$AB = 5$</td></tr>
<tr><td>$[AB]$</td><td>un <b>segment</b> : les points entre $A$ et $B$</td><td>$M ∈ [AB]$</td></tr>
<tr><td>$(AB)$</td><td>une <b>droite</b>, infinie des deux côtés</td><td>$(AB) // (CD)$</td></tr>
<tr><td>$[AB)$</td><td>une <b>demi-droite</b> : part de $A$, passe par $B$, continue</td><td></td></tr></tbody></table></div>
<p><b>La faute grave à éviter :</b> diviser des segments. $[AM]/[AB]$ n'a aucun sens, car un segment est un ensemble de points. On divise des longueurs : $AM/AB$. Avec $AM = 2$ et $AB = 6$, $AM/AB = 1/3$.</p>`,
  "Deux sortes d'angles":`<p><b>L'angle orienté</b> $AOB$ dit de combien on tourne pour aller de la demi-droite $[OA)$ à $[OB)$, et dans quel sens. Il a un signe : positif dans le sens inverse des aiguilles d'une montre.</p>
<p><b>L'angle non orienté</b> $|AOB|$ ne donne que l'ouverture, entre $0$ et $π$, sans signe.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Si</th><th>Alors</th></tr></thead><tbody>
<tr><td>$AOB = π/3$</td><td>$BOA = −π/3$ : on échange les lettres, on tourne dans l'autre sens</td></tr>
<tr><td>$AOB = π/3$</td><td>$|AOB| = π/3$</td></tr>
<tr><td>$AOB = −π/3$</td><td>$|AOB| = π/3$ aussi</td></tr></tbody></table></div>
<p><b>À $2π$ près :</b> un tour complet ne change rien. $π/3$ et $π/3 + 2π = 7π/3$ désignent le même angle orienté ; on écrit $[2π]$.</p>`,
  "Parallèles, au sens du cours":`<p><b>Dans ce cours, deux droites sont parallèles</b> si elles n'ont aucun point commun, <b>ou si elles sont confondues</b> (c'est la même droite).</p>
<p><b>Deux droites du plan sont donc toujours dans l'un de ces deux cas :</b></p>
<ul><li><b>parallèles</b> : aucun point commun, ou tous (confondues) ;</li><li><b>sécantes</b> : exactement un point commun.</li></ul>
<p><b>Pourquoi c'est important :</b> une droite est parallèle à elle-même. Et deux droites parallèles qui ont un point commun sont forcément confondues : c'est un argument qui revient souvent dans les démonstrations.</p>`,
  "Les symboles des énoncés":`<p><b>Les symboles qu'on croise dans les énoncés :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Écrit</th><th>Se lit</th></tr></thead><tbody>
<tr><td>$M ∈ [AB]$</td><td>$M$ appartient au segment $[AB]$ : il est dessus</td></tr>
<tr><td>$M ∉ (AB)$</td><td>$M$ n'est pas sur la droite $(AB)$</td></tr>
<tr><td>$Δ ∩ Δ′$</td><td>l'intersection : les points communs à $Δ$ et $Δ′$</td></tr>
<tr><td>$[AM] ⊂ [AB]$</td><td>le segment $[AM]$ est inclus dans $[AB]$</td></tr>
<tr><td>$(AB) ⊥ (CD)$</td><td>les droites sont perpendiculaires</td></tr></tbody></table></div>
<p><b>Exemple :</b> « $Δ ∩ Δ′ = \{I\}$ » veut dire : les deux droites se coupent en un seul point, $I$.</p>`},
 "g-definitions":{
  "Le segment":`<p><b>La définition :</b> le segment $[AB]$, ce sont les points $M$ tels que $AM + MB = AB$.</p>
<p><b>L'idée :</b> passer par $M$ ne rallonge pas le trajet de $A$ à $B$. Si on fait un détour, la somme dépasse $AB$.</p>
<p><b>Exemples avec $AB = 10$ :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>$AM$</th><th>$MB$</th><th>Somme</th><th>$M ∈ [AB]$ ?</th></tr></thead><tbody>
<tr><td>$3$</td><td>$7$</td><td>$10$</td><td>oui</td></tr>
<tr><td>$6$</td><td>$6$</td><td>$12$</td><td>non : détour</td></tr>
<tr><td>$0$</td><td>$10$</td><td>$10$</td><td>oui : c'est $A$ lui-même</td></tr></tbody></table></div>`,
  "Le milieu":`<p><b>La définition :</b> le milieu de $[AB]$ est le point $M$ tel que $AM = MB = AB/2$.</p>
<p><b>Exemple :</b> si $AB = 8$, le milieu est le point du segment avec $AM = MB = 4$.</p>
<p><b>Le piège :</b> $AM = MB$ ne suffit pas. Avec $AB = 8$, un point $M$ hors de la droite peut avoir $AM = MB = 5$ : il est sur la médiatrice de $[AB]$, mais ce n'est pas le milieu. Il faut aussi que $M$ soit sur le segment, ou que les distances valent $AB/2$.</p>`,
  "La demi-droite":`<p><b>La demi-droite $[AB)$</b> part de $A$, passe par $B$ et continue sans fin de ce côté-là. Elle ne va pas de l'autre côté de $A$.</p>
<p><b>La définition :</b> les points $M$ de la droite $(AB)$ tels que $M$ est entre $A$ et $B$ ($M ∈ [AB]$), ou que $B$ est entre $A$ et $M$ ($B ∈ [AM]$).</p>
<p><b>Exemple sur une règle graduée,</b> avec $A$ en $0$ et $B$ en $2$ :</p>
<ul><li>le point en $1$ est dans $[AB)$ : entre $A$ et $B$ ;</li><li>le point en $5$ aussi : au-delà de $B$ ;</li><li>le point en $−3$ non : il est de l'autre côté de $A$.</li></ul>`,
  "Le cercle":`<p><b>Le cercle $C(O, R)$</b> est l'ensemble des points à distance <b>exactement</b> $R$ du centre $O$.</p>
<p><b>Exemples avec $R = 3$ :</b></p>
<ul><li>$OM = 3$ : $M$ est sur le cercle ;</li><li>$OM = 2$ : $M$ est à l'intérieur. Il est dans le <b>disque</b>, mais pas sur le cercle ;</li><li>$OM = 4$ : $M$ est à l'extérieur.</li></ul>
<p><b>Le cercle, c'est seulement le bord.</b> Les points tels que $OM ≤ R$ forment le disque.</p>
<p><b>Cas particulier :</b> si $R = 0$, le seul point à distance $0$ de $O$ est $O$ lui-même (une distance nulle veut dire que les points sont confondus).</p>`},
 "g-thales":{
  "L'énoncé":`<p><b>La situation :</b> un triangle $ABC$, et une droite parallèle au côté $(BC)$ qui coupe $(AB)$ en $M$ et $(AC)$ en $N$. Le petit triangle $AMN$ est alors une réduction du grand $ABC$.</p>
<p><b>Le théorème de Thalès :</b> $AM/AB = AN/AC = MN/BC$.</p>
<p><b>Exemple :</b> $AB = 6$, $AM = 2$, $AC = 9$ et $BC = 12$.</p>
<ul><li>Le rapport vaut $AM/AB = 2/6 = 1/3$.</li><li>Donc $AN = AC × 1/3 = 3$.</li><li>Et $MN = BC × 1/3 = 4$.</li></ul>
<p><b>La démonstration à savoir</b> est celle de la première égalité, $AM/AB = AN/AC$, quand $M$ est sur $[AB]$ et $N$ sur $[AC]$.</p>`,
  "L'idée de la preuve : comparer des aires":`<p><b>L'outil :</b> deux triangles qui ont la même hauteur ont des aires proportionnelles à leurs bases. Si la base double, l'aire double.</p>
<p><b>La preuve compare trois paires de triangles :</b></p>
<ol><li>$AMN$ et $ABN$ ont la même hauteur issue de $N$. Donc le rapport de leurs aires vaut le rapport de leurs bases : $AM/AB$.</li><li>$AMN$ et $ACM$ ont la même hauteur issue de $M$. Le rapport de leurs aires vaut $AN/AC$.</li><li>$BMN$ et $CMN$ ont la même base $[MN]$ et la même hauteur, car $(MN)$ est parallèle à $(BC)$ : ils ont la même aire. Donc $ABN$ et $ACM$ aussi (on ajoute $AMN$ à chacun).</li></ol>
<p>Les deux rapports des points 1 et 2 ont le même numérateur et des dénominateurs égaux : ils sont égaux. D'où $AM/AB = AN/AC$.</p>`},
 "g-reciproque":{
  "Le théorème 2.5.2":`<p><b>La réciproque de Thalès</b> marche dans l'autre sens : si les rapports sont égaux, alors les droites sont parallèles.</p>
<p><b>Énoncé :</b> si $M$ est sur la demi-droite $]AB)$, $N$ sur $]AC)$, et $AM/AB = AN/AC$, alors $(MN) // (BC)$.</p>
<p><b>Exemples avec $AB = 6$ et $AC = 9$ :</b></p>
<ul><li>$AM = 2$ et $AN = 3$ : $2/6 = 1/3$ et $3/9 = 1/3$. Égaux : $(MN) // (BC)$.</li><li>$AM = 2$ et $AN = 4$ : $1/3$ et $4/9$. Différents : les droites ne sont pas parallèles.</li></ul>
<p><b>L'idée de la preuve :</b> on trace la parallèle à $(BC)$ qui passe par $M$ ; elle coupe $(AC)$ en un point $N′$. Thalès donne $AN′ = AN$, donc $N′ = N$.</p>`,
  "Le théorème des milieux (Thm 2.5.3)":`<p><b>Le cas particulier le plus utile :</b> si $M$ est le milieu de $[AB]$ et $N$ le milieu de $[AC]$, alors $(MN) // (BC)$ et $MN = BC/2$.</p>
<p><b>Exemple :</b> si $BC = 10$, le segment qui joint les milieux des deux autres côtés mesure $5$, et il est parallèle à $[BC]$.</p>
<p><b>Pourquoi :</b> c'est la réciproque de Thalès avec $AM/AB = AN/AC = 1/2$.</p>
<p><b>Quand t'en servir :</b> dès qu'un exercice parle de plusieurs milieux. Cherche un triangle dont deux côtés ont leur milieu sur la figure.</p>`},
 "g-symetrie":{
  "Une isométrie":`<p><b>Une isométrie</b> est une transformation du plan qui ne change aucune distance : la distance entre deux points est la même que la distance entre leurs images. On déplace la figure sans la déformer.</p>
<p><b>Exemples :</b> une translation (glisser), une rotation (tourner), une symétrie (retourner).</p>
<p><b>Ce qu'elle conserve, en plus des distances :</b></p>
<ul><li>une droite devient une droite (démonstration à savoir) ;</li><li>les angles non orientés restent les mêmes (par le cas CCC des triangles isométriques).</li></ul>`,
  "La symétrie centrale":`<p><b>La symétrie de centre $O$</b> envoie chaque point $A$ sur le point $A′$ tel que $O$ soit le milieu de $[AA′]$. C'est un demi-tour autour de $O$.</p>
<p><b>Avec des coordonnées,</b> le centre étant $O(0, 0)$ : $A(2, 3)$ va en $A′(−2, −3)$. On change les deux signes.</p>
<p><b>Avec un autre centre,</b> $O(1, 1)$ : $A(3, 2)$ va en $A′(−1, 0)$. On vérifie : le milieu de $(3, 2)$ et $(−1, 0)$ est $(1, 1)$.</p>
<p><b>Deux remarques :</b> le centre ne bouge pas ; et faire deux fois la symétrie ramène au point de départ.</p>
<p><b>La démonstration à savoir</b> (lemme 2.2.1) : ce point $A′$ existe et il est unique.</p>`,
  "Le Thm 2.2.3 : trois propriétés":`<p><b>La symétrie centrale a trois propriétés :</b></p>
<ol><li>c'est une isométrie : elle garde les distances ;</li><li>elle envoie toute droite sur une droite <b>parallèle</b> (ou sur elle-même) ;</li><li>elle garde les angles orientés (un demi-tour ne retourne pas la figure).</li></ol>
<p><b>Exemple</b> avec le centre $O(0, 0)$ : la droite qui passe par $(0, 1)$ et $(1, 2)$ devient la droite qui passe par $(0, −1)$ et $(−1, −2)$. Les deux montent de $1$ quand on avance de $1$ : elles sont parallèles.</p>
<p><b>Un réflexe utile :</b> une droite qui passe par le centre est envoyée sur elle-même.</p>`},
 "g-triangles":{
  "L'axiome V":`<p><b>Deux triangles sont isométriques</b> quand on peut superposer l'un sur l'autre. Pour le prouver, pas besoin de tout comparer : trois informations suffisent.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Cas</th><th>Il suffit de</th><th>Exemple</th></tr></thead><tbody>
<tr><td>CCC</td><td>les trois côtés égaux</td><td>côtés $3$, $4$, $5$ des deux côtés</td></tr>
<tr><td>CAC</td><td>deux côtés égaux, et l'angle <b>entre eux</b></td><td>$AB = 4$, $AC = 6$, $|Â| = π/3$</td></tr>
<tr><td>ACA</td><td>un côté égal, et les deux angles <b>à ses bouts</b></td><td>$AB = 5$, $|Â| = π/4$, $|B̂| = π/3$</td></tr></tbody></table></div>
<p><b>Le piège :</b> deux côtés et un angle qui n'est <b>pas</b> entre eux ne suffisent pas.</p>
<p><b>Ce qu'on en tire :</b> deux triangles isométriques ont tous leurs côtés et tous leurs angles égaux deux à deux.</p>`,
  "La version orientée : l'axiome VI":`<p><b>Avec des angles orientés,</b> on exige en plus le même sens de rotation : on superpose les triangles sans retourner la feuille.</p>
<p>Seuls deux cas existent : CAC (deux côtés et l'angle orienté entre eux) et ACA (un côté et les deux angles orientés à ses bouts).</p>
<p><b>Exemple :</b> un triangle et son reflet dans un miroir sont isométriques au sens ordinaire, mais leurs angles orientés sont de signes opposés.</p>
<p><b>À quoi ça sert :</b> surtout dans les démonstrations sur la symétrie centrale, qui garde les angles orientés.</p>`},
 "g-angles":{
  "L'axiome IV : ce qu'il faut retenir":`<p><b>L'axiome IV, ce sont les règles du rapporteur :</b></p>
<ul><li>un angle de $0$ : les deux demi-droites sont la même ;</li><li>un angle de $π$ : elles sont opposées, $O$ est entre $A$ et $B$ ;</li><li>échanger les lettres change le signe : $BOA = −AOB$ ;</li><li>pour chaque angle voulu, il y a exactement une demi-droite qui le fait (c'est le rapporteur) ;</li><li>Chasles : $AOC = AOB + BOC$. Exemple : $π/6 + π/3 = π/2$.</li></ul>
<p><b>Le vocabulaire :</b> un angle non orienté est aigu s'il est plus petit que $π/2$, droit s'il vaut $π/2$, obtus s'il est plus grand.</p>`,
  "La bissectrice":`<p><b>La bissectrice</b> d'un angle est la demi-droite qui le coupe en deux moitiés égales.</p>
<p><b>Exemple :</b> si $|AOB| = 2π/3$, la bissectrice $[OC)$ donne $|AOC| = |COB| = π/3$.</p>
<p><b>Une règle utile pour additionner des angles :</b> si la demi-droite $[OC)$ est « entre » $[OA)$ et $[OB)$ (elle coupe le segment $[AB]$), alors $|AOB| = |AOC| + |COB|$. Exemple : $π/6 + π/4 = 5π/12$.</p>`,
  "La médiatrice":`<p><b>La médiatrice</b> de $[AB]$ est la droite perpendiculaire à $(AB)$ qui passe par le milieu de $[AB]$.</p>
<p><b>Sa propriété (à citer, TD 1.6) :</b> un point est sur la médiatrice exactement quand il est à la même distance de $A$ et de $B$ : $MA = MB$.</p>
<p><b>Exemple avec des coordonnées :</b> $A(0, 0)$ et $B(4, 0)$. Le milieu est $(2, 0)$ et la médiatrice est la droite verticale $x = 2$. Le point $M(2, 5)$ est dessus, et en effet $MA = MB = √(4 + 25) = √29$.</p>`},
 "g-aires":{
  "L'axiome VIII et la Prop 1.6.1":`<p><b>Les règles de l'aire :</b></p>
<ul><li>un rectangle de côtés $3$ et $5$ a pour aire $3 × 5 = 15$ ;</li><li>si on découpe une figure en morceaux qui ne se chevauchent pas, les aires s'additionnent ;</li><li>deux triangles isométriques ont la même aire ;</li><li>une figure plus petite (incluse dans une autre) a une aire plus petite ou égale.</li></ul>
<p><b>La proposition 1.6.1</b> (à démontrer) : un segment a une aire nulle. L'idée : un segment tient dans des rectangles aussi fins qu'on veut, d'aire aussi petite qu'on veut.</p>`,
  "La hauteur et l'aire":`<p><b>La hauteur issue de $A$</b> est la droite perpendiculaire à $(BC)$ qui passe par $A$. Son pied $H$ est sur la droite $(BC)$.</p>
<p><b>L'aire du triangle :</b> base × hauteur / 2, soit $BC × AH / 2$.</p>
<p><b>Exemple :</b> $BC = 8$ et $AH = 5$ : aire $= 8 × 5 / 2 = 20$.</p>
<p><b>Attention :</b> si le triangle a un angle obtus en $B$ ou en $C$, le pied $H$ tombe <b>hors</b> du segment $[BC]$, sur son prolongement. La formule reste vraie.</p>`,
  "La somme des angles":`<p><b>Dans tout triangle, les trois angles (non orientés) font $π$ en tout</b>, c'est-à-dire un demi-tour.</p>
<p><b>Exemple :</b> si deux angles valent $π/2$ et $π/3$, le troisième vaut $π − π/2 − π/3 = π/6$.</p>
<p><b>L'idée de la preuve :</b> on trace la parallèle à $(BC)$ qui passe par $A$. Grâce aux angles alternes-internes, on retrouve en $A$ les angles $B̂$ et $Ĉ$, collés de part et d'autre de $Â$. Les trois forment un angle plat : $π$.</p>`},
 "g-axiomes":{
  "L'axiome I":`<p><b>Par deux points distincts passe une seule droite.</b></p>
<p><b>Le réflexe qu'il donne :</b> pour montrer que deux droites sont la même, il suffit de trouver deux points distincts qui sont sur les deux.</p>
<p><b>Aligné</b> veut dire : sur une même droite. Trois points sont alignés si l'un est sur la droite qui passe par les deux autres.</p>`,
  "L'axiome II (Euclide)":`<p><b>Par un point, il passe une seule droite parallèle à une droite donnée.</b></p>
<p><b>Le réflexe qu'il donne :</b> si deux droites sont toutes les deux parallèles à $Δ$ et passent par le même point $M$, alors elles sont la même droite.</p>
<p>Rappel : dans ce cours, deux droites confondues comptent comme parallèles.</p>`,
  "L'axiome III : la distance":`<p><b>Les règles des distances :</b></p>
<ul><li><b>inégalité triangulaire :</b> $AB ≤ AM + MB$. Un détour ne raccourcit jamais. Si $AM = 3$ et $MB = 4$, alors $AB ≤ 7$ ;</li><li>$AB = BA$ ;</li><li>$AB = 0$ seulement si $A = B$ ;</li><li><b>aligné ⇔ égalité :</b> trois points sont alignés exactement quand la plus grande distance est la somme des deux autres.</li></ul>
<p><b>Exemples :</b> des distances $2$, $3$ et $5$ : $5 = 2 + 3$, les points sont alignés. Des distances $2$, $3$ et $4$ : $4 &lt; 5$, ils forment un vrai triangle.</p>`},
 "g-paralleles":{
  "Le Cor 2.2.4":`<p><b>Un quadrilatère dont les côtés opposés sont parallèles</b> ($(AB) // (CD)$ et $(AD) // (BC)$) a aussi :</p>
<ul><li>ses côtés opposés de même longueur : $AB = CD$ et $AD = BC$ ;</li><li>ses diagonales $[AC]$ et $[BD]$ qui se coupent en leur milieu.</li></ul>
<p><b>L'idée de la preuve :</b> la symétrie de centre $O$, milieu de $[BD]$, échange $B$ et $D$ et envoie $C$ sur $A$. Comme elle garde les distances, les côtés opposés sont égaux.</p>`,
  "Les angles alternes-internes (Thm 2.3.1)":`<p><b>La situation :</b> deux droites coupées par une troisième, la sécante. Les angles <b>alternes-internes</b> sont entre les deux droites, de part et d'autre de la sécante. Ils dessinent un Z.</p>
<p><b>Le théorème :</b> les deux droites sont parallèles exactement quand ces angles sont égaux.</p>
<ul><li>dans un sens : droites parallèles, donc angles égaux ;</li><li>dans l'autre : angles égaux, donc droites parallèles.</li></ul>
<p><b>Exemple :</b> si les deux angles du Z mesurent $π/5$ tous les deux, les droites sont parallèles.</p>`,
  "La perpendiculaire (Cor 2.3.2)":`<p><b>Par un point, il passe une seule droite perpendiculaire à une droite donnée.</b></p>
<p>Ce n'est pas un axiome : on le démontre avec le rapporteur (axiome IV) et les angles alternes-internes.</p>
<p><b>Il sert à définir :</b> la hauteur d'un triangle, la projection orthogonale (le pied de la perpendiculaire) et la symétrie orthogonale.</p>`},
 "g-rediger":{
  "Les fautes relevées dans les corrigés":`<p><b>Ce qui fait perdre des points, d'après les corrigés :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Faux</th><th>Juste</th></tr></thead><tbody>
<tr><td>$[AM]/[AB]$</td><td>$AM/AB$ : on divise des longueurs</td></tr>
<tr><td>« $ABCD = ABC + CDA$ »</td><td>« $𝒜(ABCD) = 𝒜(ABC) + 𝒜(CDA)$ » : on additionne des aires</td></tr>
<tr><td>« d'après le théorème, … » quand on demande la preuve</td><td>refaire la démonstration</td></tr>
<tr><td>une figure carrée ou isocèle sans raison</td><td>une figure quelconque</td></tr>
<tr><td>utiliser $O$ sans l'avoir défini</td><td>« Soit $O$ le milieu de $[BD]$. »</td></tr>
<tr><td>une égalité sans justification</td><td>citer la source : axiome, théorème, question précédente</td></tr></tbody></table></div>`,
  "Les résultats de TD que tu peux citer sans preuve":`<p><b>Trois résultats du TD peuvent être cités sans être démontrés :</b></p>
<ul><li><b>TD 1.6, la médiatrice :</b> $M$ est sur la médiatrice de $[AB]$ exactement quand $MA = MB$ ;</li><li><b>TD 1.7, le triangle isocèle :</b> si $AB = AC$, les angles en $B$ et $C$ sont égaux, et la médiane, la bissectrice et la hauteur issues de $A$ sont la même droite. Et dans l'autre sens : deux angles égaux, donc isocèle ;</li><li><b>TD 1.3 :</b> deux droites parallèles à une même troisième sont parallèles entre elles (ou confondues).</li></ul>
<p><b>Sur la copie,</b> on écrit par exemple : « D'après le TD 1.6, comme $MA = MB$, $M$ est sur la médiatrice de $[AB]$. »</p>`},
 "g-vecteurs":{
  "La Déf 3.1.1 et la Prop 3.1.2":`<p><b>La définition du cours :</b> $ABCD$ est un parallélogramme si ses diagonales $[AC]$ et $[BD]$ ont le <b>même milieu</b>.</p>
<p><b>Exemple avec des coordonnées :</b> $A(0, 0)$, $B(4, 0)$, $C(5, 2)$, $D(1, 2)$.</p>
<ul><li>milieu de $[AC]$ : $((0 + 5)/2, (0 + 2)/2) = (2,5 ; 1)$ ;</li><li>milieu de $[BD]$ : $((4 + 1)/2, (0 + 2)/2) = (2,5 ; 1)$.</li></ul>
<p>Le même : c'est un parallélogramme.</p>
<p><b>La proposition 3.1.2</b> (à démontrer) : alors les côtés opposés sont parallèles et de même longueur. L'idée : la symétrie de centre le milieu commun échange $A$ et $C$, et $B$ et $D$.</p>`,
  "Reconnaître un parallélogramme (Prop 3.1.3)":`<p><b>Trois façons de prouver qu'un quadrilatère $ABCD$ est un parallélogramme</b> (points distincts, non alignés) :</p>
<ol><li>les côtés opposés sont parallèles deux à deux : $(AB) // (CD)$ et $(AD) // (BC)$ ;</li><li>les côtés opposés ont la même longueur deux à deux, et une diagonale sépare les deux autres sommets ;</li><li>deux côtés opposés sont parallèles <b>et</b> de même longueur, et une diagonale sépare les deux autres sommets.</li></ol>
<p><b>Pourquoi « une diagonale sépare » :</b> sans cette condition, on pourrait avoir un quadrilatère croisé (en forme de nœud papillon) avec des côtés opposés égaux, qui n'est pas un parallélogramme.</p>`,
  "Les couples équipollents (Déf 3.2.1)":`<p><b>Un couple $(A, B)$,</b> c'est une flèche qui part de $A$ et arrive en $B$.</p>
<p><b>Deux flèches sont équipollentes</b> quand elles ont la même direction, le même sens et la même longueur : l'une est l'autre déplacée sans la tourner. Le cours le dit avec un parallélogramme : $(A, B)$ et $(A′, B′)$ sont équipollents quand $ABB′A′$ est un parallélogramme.</p>
<p><b>Exemple :</b> $A(0, 0)$, $B(2, 1)$, $A′(3, 3)$, $B′(5, 4)$. Les deux flèches avancent de $2$ vers la droite et de $1$ vers le haut : elles sont équipollentes.</p>
<p><b>L'ordre des lettres compte :</b> on fait le tour $A → B → B′ → A′$.</p>`,
  "Les vecteurs":`<p><b>Un vecteur,</b> c'est ce qu'ont en commun toutes les flèches équipollentes : une direction, un sens, une longueur. On ne retient pas l'endroit où la flèche commence.</p>
<p><b>Donc $<span class="vec">AB</span> = <span class="vec">A′B′</span>$</b> veut dire : les flèches $(A, B)$ et $(A′, B′)$ sont équipollentes, ou encore $ABB′A′$ est un parallélogramme.</p>
<p><b>Avec des coordonnées,</b> un vecteur, c'est un déplacement : « 2 vers la droite, 1 vers le haut », noté $(2, 1)$.</p>
<p><b>Le lemme 3.2.6</b> (à démontrer) : pour un vecteur et un point de départ $A$ donnés, il existe un seul point d'arrivée $B$. Exemple : en partant de $(1, 1)$ avec le vecteur $(2, 1)$, on arrive en $(3, 2)$.</p>`,
  "La somme de deux vecteurs":`<p><b>Additionner deux vecteurs,</b> c'est enchaîner les déplacements : on fait le premier, puis le second à partir de là où on est arrivé.</p>
<p><b>Avec des coordonnées :</b> $(2, 1) + (1, 3) = (3, 4)$. On additionne coordonnée par coordonnée.</p>
<p><b>La relation de Chasles :</b> $<span class="vec">AB</span> + <span class="vec">BC</span> = <span class="vec">AC</span>$. Aller de $A$ à $B$, puis de $B$ à $C$, revient à aller de $A$ à $C$.</p>
<p><b>La proposition 3.2.8</b> (à démontrer) : le résultat ne dépend pas des flèches choisies pour représenter les vecteurs.</p>`},
 "g-reste":{
  "Triangles semblables (Déf 2.6.1, Thm 2.6.2)":`<p><b>Deux triangles sont semblables</b> quand ils ont les mêmes angles : l'un est un agrandissement ou une réduction de l'autre.</p>
<p><b>Le théorème :</b> mêmes angles ⇔ côtés proportionnels.</p>
<p><b>Exemple :</b> un triangle de côtés $3$, $4$, $5$ et un triangle de côtés $6$, $8$, $10$. Les rapports $6/3 = 8/4 = 10/5 = 2$ sont égaux : ils sont semblables, le second est le premier agrandi deux fois.</p>
<p><b>Deux angles suffisent :</b> le troisième suit, car la somme vaut $π$.</p>`,
  "Demi-plans et convexité (§1.5)":`<p><b>Une droite coupe le plan en deux moitiés,</b> les demi-plans.</p>
<p><b>Deux points sont du même côté</b> de la droite quand le segment qui les relie ne la traverse pas.</p>
<p><b>Une figure est convexe</b> quand, pour deux de ses points, tout le segment qui les relie reste dedans.</p>
<ul><li>un disque, un triangle, un demi-plan : convexes ;</li><li>une forme de croissant de lune : pas convexe (un segment entre les deux pointes sort de la figure).</li></ul>
<p><b>Ce que dit la proposition 1.5.1 :</b> chaque demi-plan est convexe, et un segment qui relie deux points de côtés différents coupe forcément la droite.</p>`,
  "Projection et symétrie orthogonales (Déf 2.3.3)":`<p><b>La projection orthogonale</b> sur une droite $Δ$ envoie un point $M$ sur le pied de la perpendiculaire à $Δ$ qui passe par $M$. C'est l'ombre de $M$ sur $Δ$, avec une lumière perpendiculaire.</p>
<p><b>La symétrie orthogonale</b> par rapport à $Δ$ envoie $M$ de l'autre côté, à la même distance : c'est le reflet dans un miroir posé sur $Δ$.</p>
<p><b>Exemple avec l'axe horizontal comme droite $Δ$ :</b> $M(3, 2)$ a pour projeté $(3, 0)$ et pour symétrique $(3, −2)$. Le projeté est le milieu de $M$ et de son symétrique.</p>
<p><b>La hauteur d'un triangle</b> utilise cette idée : son pied est le projeté du sommet sur le côté opposé.</p>`,
  "Les quadrilatères (Déf 3.1.4) et le segment (Prop 1.2.3)":`<p><b>Les quadrilatères particuliers :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Nom</th><th>Définition</th></tr></thead><tbody>
<tr><td>trapèze</td><td>deux côtés opposés parallèles</td></tr>
<tr><td>rectangle</td><td>quatre angles droits</td></tr>
<tr><td>losange</td><td>quatre côtés de même longueur</td></tr>
<tr><td>carré</td><td>quatre angles droits et quatre côtés égaux</td></tr></tbody></table></div>
<p><b>Trois propriétés des segments</b> (exercice 1.2 du TD) :</p>
<ul><li>$[AB] = [BA]$ ;</li><li>si $M$ est sur $[AB]$, le segment se coupe en $[AM]$ et $[MB]$, qui n'ont que $M$ en commun ;</li><li>si $M$ et $M′$ sont sur $[AB]$, le segment $[MM′]$ est dedans aussi.</li></ul>`,
  "Encore sur les vecteurs (Prop 3.2.10, Déf 3.2.11, Prop 3.2.12)":`<p><b>La règle du parallélogramme :</b> $<span class="vec">AB</span> + <span class="vec">AD</span> = <span class="vec">AE</span>$ exactement quand $ABED$ est un parallélogramme. Les deux flèches partent du même point $A$, et leur somme est la diagonale.</p>
<p><b>Multiplier un vecteur par un nombre $λ$ :</b> on garde la direction, on multiplie la longueur par $|λ|$, et on change le sens si $λ$ est négatif.</p>
<ul><li>$2 · (1, 3) = (2, 6)$ : deux fois plus long ;</li><li>$−1 · (1, 3) = (−1, −3)$ : même longueur, sens opposé ;</li><li>$0 · (1, 3) = (0, 0)$ : le vecteur nul.</li></ul>
<p><b>La proposition 3.2.12 :</b> les vecteurs du plan suivent les mêmes règles de calcul que les vecteurs de $ℝ²$ en algèbre (c'est un espace vectoriel).</p>`}},
usi:{
 "u-intro":{
  "Un système d'exploitation":`<p><b>Un ordinateur, c'est du matériel :</b> un processeur qui calcule, de la mémoire, un disque, un écran, un clavier. Seul, il ne sait rien faire d'utile.</p>
<p><b>Le système d'exploitation</b> (Linux, Windows, macOS…) est le logiciel qui se place entre ce matériel et toi. Il fait trois choses :</p>
<ul><li>il <b>partage</b> le matériel entre tous les programmes qui tournent en même temps (multi-tâches) et entre les utilisateurs (multi-utilisateurs) ;</li><li>il <b>range</b> les données en fichiers et en dossiers, et décide qui a le droit de les lire ;</li><li>il te donne une <b>interface</b> : des fenêtres, ou un terminal où l'on tape des commandes.</li></ul>
<p><b>Exemple :</b> quand tu enregistres un fichier, ce n'est pas ton éditeur de texte qui écrit sur le disque. Il demande au système, qui s'en occupe.</p>`,
  "Les couches d'Unix":`<p><b>Unix est construit en couches</b>, comme un oignon. Chaque couche ne parle qu'à ses voisines.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Couche</th><th>Rôle</th><th>Exemple</th></tr></thead><tbody>
<tr><td>applications</td><td>ce que tu lances</td><td>bash, Firefox, python3</td></tr>
<tr><td>bibliothèques</td><td>des fonctions toutes prêtes</td><td>printf, du C (man 3)</td></tr>
<tr><td>noyau</td><td>le seul qui parle au matériel</td><td>fork, open (man 2)</td></tr>
<tr><td>matériel</td><td>la machine</td><td>processeur, disque</td></tr></tbody></table></div>
<p><b>Un appel noyau</b> (ou appel système), c'est une application qui demande un service au noyau : « ouvre ce fichier », « crée un processus ».</p>
<p><b>Les « man 3 » et « man 2 » du tableau :</b> man affiche le manuel d'une commande ou d'une fonction. Il est rangé en sections numérotées : 1 pour les commandes (man ls), 2 pour les appels noyau (man 2 open), 3 pour les fonctions des bibliothèques (man 3 printf). Le numéro sert quand un nom existe dans deux sections : man printf montre la commande printf, man 3 printf la fonction du C.</p>
<p><b>Le terminal</b> fait tourner un interpréteur de commandes, bash : tu tapes une commande, il l'exécute. Tout le cours se fait comme ça.</p>`},
 "u-chemins":{
  "Un seul arbre":`<p><b>Sous Unix, tous les fichiers sont rangés dans un seul arbre.</b> En haut, la racine, notée /. Dedans, des dossiers, qui contiennent d'autres dossiers et des fichiers.</p>
<p><b>Un chemin</b> dit comment descendre jusqu'à un fichier. /home/dupont/notes.txt : depuis la racine, on entre dans home, puis dans dupont, et on trouve notes.txt.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Écrit</th><th>Veut dire</th></tr></thead><tbody>
<tr><td>/</td><td>la racine</td></tr><tr><td>~</td><td>ton dossier personnel, par exemple /home/dupont</td></tr>
<tr><td>.</td><td>le dossier où tu es</td></tr><tr><td>..</td><td>le dossier au-dessus</td></tr></tbody></table></div>
<p><b>Absolu ou relatif :</b></p>
<ul><li>un chemin <b>absolu</b> commence par / : il marche de n'importe où (/home/dupont/notes.txt) ;</li><li>un chemin <b>relatif</b> part du dossier où tu es. Si tu es dans /home, dupont/notes.txt mène au même fichier.</li></ul>
<p><b>Exemple :</b> tu es dans /home/dupont/tp. Le chemin ../notes.txt remonte d'un cran (dans /home/dupont) et trouve notes.txt.</p>`,
  "Les commandes de base":`<p><b>Les commandes à connaître, avec un exemple chacune :</b></p>
${W.code(`pwd                  # où suis-je ? affiche /home/dupont
cd tp                # entre dans le dossier tp
cd ..                # remonte d'un cran
cd                   # revient dans ton dossier personnel
ls                   # liste le contenu ; ls -l en détail, ls -a avec les cachés
mkdir projet         # crée le dossier projet
cp a.txt b.txt       # copie a.txt en b.txt
mv b.txt c.txt       # renomme b.txt en c.txt (ou le déplace)
rm c.txt             # supprime c.txt, sans corbeille
cat a.txt            # affiche le contenu de a.txt
man ls               # le manuel de ls (q pour quitter)`,"sh")}
<p>Le texte après # est un commentaire : bash ne le lit pas.</p>
<p><b>Attention :</b> rm supprime pour de bon, il n'y a pas de corbeille. rm -r supprime un dossier et tout ce qu'il contient.</p>
<p><b>Plusieurs commandes sur une ligne :</b> on les sépare par ;. mkdir essai ; cd essai crée le dossier puis y entre.</p>`,
  "Les dossiers du système":`<p><b>Chaque dossier sous la racine a un rôle.</b> Les plus utiles :</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Dossier</th><th>Ce qu'il contient</th></tr></thead><tbody>
<tr><td>/bin, /usr/bin</td><td>les commandes : ls, bash, python3…</td></tr>
<tr><td>/etc</td><td>les réglages du système ; /etc/passwd liste les comptes</td></tr>
<tr><td>/home</td><td>un dossier par utilisateur</td></tr>
<tr><td>/tmp</td><td>des fichiers temporaires, effacés au redémarrage</td></tr>
<tr><td>/dev</td><td>les périphériques (disques, clés…), vus comme des fichiers</td></tr>
<tr><td>/proc</td><td>des informations sur les programmes en cours</td></tr></tbody></table></div>
<p><b>Pour savoir où est rangée une commande :</b> which ls répond /usr/bin/ls.</p>`},
 "u-droits":{
  "Une ligne de ls -l":`<p><b>ls -l affiche une ligne par fichier.</b> Prenons celle-ci :</p>
${W.code(`-rwxr-x--- 1 dupont etu 2048 nov. 13 09:30 script.sh`,"sh")}
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Morceau</th><th>Veut dire</th></tr></thead><tbody>
<tr><td>-</td><td>le type : - fichier ordinaire, d dossier, l lien symbolique</td></tr>
<tr><td>rwxr-x---</td><td>les droits : 3 lettres pour le propriétaire, 3 pour le groupe, 3 pour les autres</td></tr>
<tr><td>1</td><td>le nombre de liens (voir la leçon sur les inodes)</td></tr>
<tr><td>dupont etu</td><td>le propriétaire, puis le groupe</td></tr>
<tr><td>2048</td><td>la taille, en octets</td></tr>
<tr><td>nov. 13 09:30</td><td>la date de dernière modification</td></tr>
<tr><td>script.sh</td><td>le nom</td></tr></tbody></table></div>`,
  "Utilisateurs et groupes":`<p><b>Chaque utilisateur a un nom et un numéro</b>, l'uid. whoami affiche ton nom.</p>
<p><b>Chaque utilisateur fait partie d'un ou plusieurs groupes</b> (par exemple le groupe des étudiants). id affiche tout d'un coup : ton uid, ton groupe principal et tous tes groupes.</p>
<p><b>Un fichier appartient</b> à celui qui l'a créé, et à son groupe principal. C'est ce qu'on lit dans ls -l.</p>
<p><b>root</b> (uid 0) est l'administrateur : il a tous les droits sur tout.</p>
<p><b>Pourquoi ça compte :</b> les droits d'un fichier sont donnés à trois catégories, le propriétaire, son groupe et tous les autres. Il faut savoir dans quelle catégorie tu es.</p>`,
  "Les 9 droits et l'octal":`<p><b>Trois droits :</b> r (read) lire, w (write) écrire, x (execute) exécuter. Pour trois catégories : le propriétaire (u), le groupe (g), les autres (o).</p>
<p><b>En chiffres (octal) :</b> r vaut 4, w vaut 2, x vaut 1. On additionne pour chaque catégorie.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Chiffres</th><th>Lettres</th><th>Calcul</th></tr></thead><tbody>
<tr><td>750</td><td>rwx r-x ---</td><td>7 = 4 + 2 + 1, 5 = 4 + 1, 0 = rien</td></tr>
<tr><td>640</td><td>rw- r-- ---</td><td>6 = 4 + 2, 4 = r, 0 = rien</td></tr>
<tr><td>711</td><td>rwx --x --x</td><td>7, puis 1 = x seul</td></tr></tbody></table></div>
<p><b>Changer les droits :</b></p>
${W.code(`chmod 750 script.sh      # en chiffres
chmod u+x script.sh      # ajoute x au propriétaire
chmod go-w notes.txt     # enlève w au groupe et aux autres`,"sh")}`,
  "Les droits sur un répertoire":`<p><b>Sur un dossier, les trois lettres ne veulent pas dire la même chose :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Droit</th><th>Sur un dossier</th></tr></thead><tbody>
<tr><td>r</td><td>voir la liste des noms (ls)</td></tr>
<tr><td>w</td><td>créer, supprimer ou renommer des fichiers dedans</td></tr>
<tr><td>x</td><td>entrer dedans (cd) et atteindre un fichier dont on connaît le nom</td></tr></tbody></table></div>
<p><b>La conséquence surprenante :</b> pour supprimer un fichier, il faut w (et x) sur le <b>dossier</b> qui le contient. Les droits du fichier lui-même ne comptent pas. On peut donc supprimer un fichier qu'on n'a pas le droit de lire, si on a w sur le dossier.</p>`},
 "u-umask":{
  "Le masque":`<p><b>Quand tu crées un fichier,</b> quels droits a-t-il ? Le système part d'une base et retire ce que dit le <b>umask</b>.</p>
<ul><li>base d'un fichier : 666 (rw-rw-rw-) ;</li><li>base d'un dossier : 777 (rwxrwxrwx).</li></ul>
<p><b>Le umask liste les droits à enlever.</b> Chaque chiffre du umask retire ses droits à la catégorie correspondante.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>umask</th><th>Nouveau fichier</th><th>Nouveau dossier</th></tr></thead><tbody>
<tr><td>022</td><td>644 rw-r--r--</td><td>755 rwxr-xr-x</td></tr>
<tr><td>007</td><td>660 rw-rw----</td><td>770 rwxrwx---</td></tr></tbody></table></div>
<p><b>Exemple :</b> umask 007 retire tout aux autres (le 7 de la fin) et rien au propriétaire ni au groupe. Le fichier passe de 666 à 660.</p>
<p><b>Les commandes :</b> umask seul affiche la valeur actuelle ; umask 027 la change pour les fichiers créés ensuite.</p>`},
 "u-inodes":{
  "Inode et répertoire":`<p><b>Sur le disque, chaque fichier a une fiche :</b> son inode. Elle contient tout sur le fichier (type, droits, propriétaire, taille, dates, où sont ses données), <b>sauf son nom</b>. Chaque inode a un numéro.</p>
<p><b>Le nom est rangé dans le dossier.</b> Un dossier, c'est une liste de couples (nom, numéro d'inode), comme un annuaire.</p>
<p><b>Exemple :</b> le dossier tp contient la ligne « exo.py → 1234 ». Pour ouvrir exo.py, le système cherche le nom dans tp, trouve le numéro 1234, puis lit l'inode 1234.</p>
<p><b>Conséquence :</b> deux noms différents peuvent mener au même inode, donc au même fichier. C'est un lien dur.</p>
<p><b>Les commandes :</b> ls -i affiche le numéro d'inode de chaque fichier, ls -l le nombre de noms (liens) qui mènent à lui.</p>`,
  "Lien dur, lien symbolique":`<p><b>Deux façons de donner un autre nom à un fichier.</b></p>
<p><b>Le lien dur</b> (ln original nouveau) : un deuxième nom pour le <b>même inode</b>. Les deux noms sont parfaitement égaux. Supprimer l'un ne touche pas l'autre ; les données ne disparaissent que quand le dernier nom est supprimé.</p>
<p><b>Le lien symbolique</b> (ln -s cible raccourci) : un petit fichier à part, qui contient seulement le chemin de la cible. C'est un raccourci. Si la cible est supprimée, le raccourci pointe dans le vide : il est cassé.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th></th><th>Lien dur</th><th>Lien symbolique</th></tr></thead><tbody>
<tr><td>Inode</td><td>le même</td><td>un nouveau</td></tr>
<tr><td>Vers un dossier</td><td>interdit</td><td>possible</td></tr>
<tr><td>Si l'original est supprimé</td><td>rien ne change</td><td>le lien est cassé</td></tr></tbody></table></div>`},
 "u-taille":{
  "L'arbre des blocs":`<p><b>Le disque est découpé en blocs</b>, de taille fixe (par exemple 4 Kio). Les données d'un fichier occupent des blocs, et l'inode garde leurs adresses.</p>
<p><b>Le problème :</b> l'inode est petit, il ne peut garder que quelques adresses. L'astuce : certaines adresses mènent à des blocs qui contiennent eux-mêmes des adresses.</p>
<ul><li>10 adresses directes : 10 blocs de données ;</li><li>1 simple indirecte : un bloc rempli de n adresses, donc n blocs de données ;</li><li>1 double indirecte : n × n blocs ;</li><li>1 triple indirecte : n × n × n blocs.</li></ul>
<p><b>n</b> est le nombre d'adresses dans un bloc : taille d'un bloc / taille d'une adresse.</p>
<p><b>Exemple :</b> blocs de 1 Kio (1024 octets) et adresses de 4 octets : n = 1024 / 4 = 256. Taille maximale : (10 + 256 + 256² + 256³) blocs de 1 Kio.</p>
<p><b>Rappel :</b> 1 Kio = 2¹⁰ octets, 1 Mio = 2²⁰, 1 Gio = 2³⁰.</p>`},
 "u-processus":{
  "Programme et processus":`<p><b>Un programme</b> est un fichier sur le disque, par exemple /usr/bin/ls. <b>Un processus</b> est ce programme en train de tourner. Si tu lances ls deux fois en même temps, il y a deux processus pour un seul programme.</p>
<p>Chaque processus a un numéro, le <b>PID</b>, et un parent (celui qui l'a lancé), le <b>PPID</b>.</p>
<p><b>Trois états :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>État</th><th>Veut dire</th><th>Exemple</th></tr></thead><tbody>
<tr><td>actif (élu)</td><td>il utilise le processeur en ce moment</td><td>un calcul en cours</td></tr>
<tr><td>prêt</td><td>il n'attend que le processeur</td><td>il attend son tour</td></tr>
<tr><td>bloqué</td><td>il attend autre chose</td><td>une frappe au clavier, une lecture sur le disque</td></tr></tbody></table></div>
<p><b>L'ordonnanceur</b> choisit, parmi les processus prêts, celui qui devient actif. Un processus bloqué ne peut pas devenir actif directement : il redevient d'abord prêt.</p>`,
  "fork, exec, wait":`<p><b>Ce qui se passe quand tu tapes ls dans bash :</b></p>
<ol><li><b>fork</b> : bash se clone. Il y a maintenant deux bash identiques, le parent et l'enfant. fork renvoie le PID de l'enfant au parent, et 0 à l'enfant : c'est comme ça qu'ils savent qui est qui.</li><li><b>exec</b> : l'enfant remplace son propre code par celui de ls. Il devient ls, en gardant le même terminal.</li><li><b>wait</b> : le parent (bash) attend que l'enfant ait fini, récupère son code de retour (le nombre que tout programme renvoie en finissant : 0 si tout s'est bien passé, un autre nombre sinon ; bash le garde dans $?), puis réaffiche l'invite.</li></ol>
<p><b>Avec ls &amp;</b> (arrière-plan), bash n'attend pas : il rend la main tout de suite.</p>
<p><b>Les commandes internes</b> comme cd ou echo sont faites par bash lui-même, sans fork : cd doit changer le dossier de bash, pas celui d'un enfant.</p>`,
  "Premier plan, arrière-plan, arrêter":`<p><b>Les commandes pour gérer les processus :</b></p>
${W.code(`sleep 100 &        # lance en arrière-plan : bash rend la main
jobs               # liste les tâches de fond : [1] sleep 100
%1                 # ramène la tâche 1 au premier plan
ps                 # liste tes processus, avec leur PID
kill 4321          # arrête le processus de PID 4321
kill -9 4321       # l'arrête de force`,"sh")}
<p><b>Au clavier :</b> Ctrl-C arrête le programme au premier plan ; Ctrl-D envoie « fin de fichier » (dans un terminal vide, ça ferme bash).</p>
<p><b>Premier plan</b> veut dire : bash attend la fin avant de te rendre la main. <b>Arrière-plan</b> : le programme tourne pendant que tu continues à taper.</p>`},
 "u-redir":{
  "Trois flux et leurs redirections":`<p><b>Chaque programme a trois « tuyaux » :</b></p>
<ul><li>l'<b>entrée</b> (numéro 0) : ce qu'il lit, d'habitude le clavier ;</li><li>la <b>sortie</b> (numéro 1) : ce qu'il affiche, d'habitude l'écran ;</li><li>la <b>sortie d'erreur</b> (numéro 2) : ses messages d'erreur, à l'écran aussi.</li></ul>
<p><b>Rediriger,</b> c'est brancher un tuyau ailleurs, sur un fichier :</p>
${W.code(`ls > liste.txt        # la sortie va dans liste.txt (vidé avant)
date >> journal.txt   # la sortie s'ajoute à la fin de journal.txt
sort < noms.txt       # sort lit noms.txt au lieu du clavier
ls /rien 2> err.txt   # le message d'erreur va dans err.txt`,"sh")}
<p><b>Le piège :</b> un seul &gt; vide le fichier avant d'écrire. Pour ajouter à la fin, il en faut deux : &gt;&gt;.</p>`,
  "Enchaîner : ; && ||":`<p><b>Chaque commande finit avec un code de retour :</b> 0 si elle a réussi, un autre nombre sinon. On le lit dans $?.</p>
<p><b>Trois façons d'enchaîner deux commandes :</b></p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Écrit</th><th>La deuxième s'exécute…</th></tr></thead><tbody>
<tr><td>a ; b</td><td>toujours</td></tr><tr><td>a &amp;&amp; b</td><td>seulement si a a réussi</td></tr><tr><td>a || b</td><td>seulement si a a échoué</td></tr></tbody></table></div>
${W.code(`mkdir tp && cd tp              # n'entre dans tp que si sa création a marché
cat notes.txt || echo "absent"  # affiche « absent » si le fichier n'existe pas`,"sh")}`,
  "Tubes et filtres":`<p><b>Un tube |</b> branche la sortie d'une commande sur l'entrée de la suivante. Les deux tournent en même temps.</p>
<p><b>Un filtre</b> lit son entrée, la transforme, et écrit le résultat. On enchaîne les filtres pour obtenir ce qu'on veut :</p>
${W.code(`ls | wc -l                         # combien de fichiers ?
cat notes.txt | grep "maths"       # les lignes qui contiennent maths
cat notes.txt | sort | head -n 3   # les 3 premières lignes, une fois triées
cut -d: -f1 /etc/passwd            # le 1er champ de chaque ligne, séparé par :`,"sh")}
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Filtre</th><th>Rôle</th></tr></thead><tbody>
<tr><td>grep motif</td><td>garde les lignes qui contiennent le motif</td></tr>
<tr><td>wc -l</td><td>compte les lignes</td></tr>
<tr><td>sort</td><td>trie (-n en nombres, -r à l'envers)</td></tr>
<tr><td>head, tail</td><td>les premières, les dernières lignes</td></tr>
<tr><td>cut</td><td>garde certains champs</td></tr></tbody></table></div>`},
 "u-find":{
  "La forme de find":`<p><b>find cherche des fichiers</b> dans un dossier et tous ses sous-dossiers. Sa forme : où chercher, quoi chercher, quoi faire.</p>
${W.code(`find . -name "*.pdf"               # tous les .pdf sous le dossier courant
find ~ -type d -name "tp*"          # les dossiers dont le nom commence par tp
find . -name "*.tmp" -exec rm {} \\;  # supprime chaque .tmp trouvé`,"sh")}
<ul><li>le départ : . (ici), ~ (ton dossier), / (tout le disque) ;</li><li>-name "motif" : le nom, avec * (n'importe quoi) et ? (un caractère) ;</li><li>-type f : seulement les fichiers ; -type d : seulement les dossiers ;</li><li>-exec … {} \; : une commande pour chaque fichier trouvé ; {} est remplacé par son nom.</li></ul>
<p><b>Attention :</b> le motif de -name s'écrit comme dans bash (*.pdf), pas comme une expression régulière.</p>`},
 "u-regex":{
  "Les briques":`<p><b>Une expression régulière décrit une forme de texte.</b> On la construit avec des briques :</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Brique</th><th>Sens</th><th>Exemple qui correspond</th></tr></thead><tbody>
<tr><td>.</td><td>un caractère quelconque</td><td>c.t : cat, cot, c4t (mais pas ct)</td></tr>
<tr><td>[0-9]</td><td>un chiffre</td><td>[0-9][0-9] : 42</td></tr>
<tr><td>a*</td><td>a, 0 fois ou plus</td><td>ba* : b, ba, baaa</td></tr>
<tr><td>a+</td><td>a, au moins une fois</td><td>ba+ : ba, baaa (pas b seul)</td></tr>
<tr><td>a?</td><td>a, 0 ou 1 fois</td><td>colou?r : color, colour</td></tr>
<tr><td>{2}</td><td>exactement 2 fois</td><td>[0-9]{2} : 07</td></tr>
<tr><td>(jpg|png)</td><td>l'un ou l'autre</td><td>jpg ou png</td></tr></tbody></table></div>
<p><b>Avec grep,</b> les briques + ? {} | et les parenthèses demandent l'option -E : grep -E "[0-9]+" fichier.</p>`,
  "Ancrer avec ^ et $":`<p><b>Sans ancre,</b> le motif peut être n'importe où dans la ligne : grep pdf garde aussi « monpdfs.txt ».</p>
<ul><li><b>^</b> colle le motif au <b>début</b> : ^Bonjour garde les lignes qui commencent par Bonjour ;</li><li><b>$</b> colle le motif à la <b>fin</b> : \\.pdf$ garde les lignes qui finissent par .pdf (le \\. est un vrai point).</li></ul>
<p><b>Les deux ensemble :</b> toute la ligne doit avoir la forme. ^[0-9]+$ : une ligne faite seulement de chiffres.</p>
<p><b>La méthode pour écrire une expression :</b></p>
<ol><li>écris un exemple qui doit correspondre, comme 2026-11-13 ;</li><li>coupe-le en morceaux : 4 chiffres, un tiret, 2 chiffres, un tiret, 2 chiffres ;</li><li>traduis chaque morceau : [0-9]{4}-[0-9]{2}-[0-9]{2} ;</li><li>ajoute ^ et $ si toute la ligne doit avoir cette forme.</li></ol>`},
 "u-bash1":{
  "Les variables":`<p><b>Une variable bash garde un texte.</b> On l'affecte sans espace autour du =, et on la lit avec $.</p>
${W.code(`ville=Montpellier
echo $ville                # Montpellier
echo "J'habite à $ville"   # J'habite à Montpellier
echo 'Je dis $ville'       # entre apostrophes : affiche Je dis $ville
n=5
n=$((n + 1))               # calcul : n vaut 6
fichiers=$(ls)             # le résultat d'une commande
read nom                   # lit un mot tapé au clavier`,"sh")}
<p><b>Les trois pièges :</b></p>
<ul><li>pas d'espace autour du = : ville = Montpellier est une erreur ;</li><li>entre guillemets " ", la variable est remplacée ; entre apostrophes ' ', non ;</li><li>une variable contient du texte : pour calculer, il faut $(( … )).</li></ul>`,
  "Un script et ses paramètres":`<p><b>Un script</b> est un fichier qui contient des commandes bash, exécutées l'une après l'autre.</p>
${W.code(`#!/bin/bash
# somme.sh : additionne ses deux paramètres
echo "$0 a reçu $# paramètres"
echo "Somme : $(($1 + $2))"`,"sh")}
<p>Pour le lancer : chmod u+x somme.sh (le rendre exécutable), puis ./somme.sh 3 4. Il affiche « ./somme.sh a reçu 2 paramètres », puis « Somme : 7 ».</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Écrit</th><th>Contient</th><th>Ici</th></tr></thead><tbody>
<tr><td>$0</td><td>le nom du script</td><td>./somme.sh</td></tr><tr><td>$1, $2</td><td>les paramètres</td><td>3, puis 4</td></tr>
<tr><td>$#</td><td>leur nombre</td><td>2</td></tr><tr><td>$@</td><td>tous les paramètres</td><td>3 4</td></tr>
<tr><td>$?</td><td>le code de retour de la dernière commande</td><td>0 si elle a réussi</td></tr></tbody></table></div>
<p>La première ligne, #!/bin/bash, dit quel programme doit lire le fichier.</p>`},
 "u-bash2":{
  "if et les tests":`<p><b>if en bash :</b> on teste une condition entre [[ et ]], avec des espaces obligatoires autour.</p>
${W.code(`if [[ -f "$1" ]]
then
  echo "$1 est un fichier"
elif [[ -d "$1" ]]
then
  echo "$1 est un dossier"
else
  echo "$1 n'existe pas"
fi`,"sh")}
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Test</th><th>Vrai si…</th></tr></thead><tbody>
<tr><td>-f "$x"</td><td>x est un fichier ordinaire</td></tr><tr><td>-d "$x"</td><td>x est un dossier</td></tr>
<tr><td>-e "$x"</td><td>x existe</td></tr><tr><td>$a -eq $b</td><td>les nombres sont égaux (-lt plus petit, -gt plus grand)</td></tr>
<tr><td>"$a" == "$b"</td><td>les textes sont égaux</td></tr></tbody></table></div>
<p>Le bloc se ferme par fi (if à l'envers).</p>`,
  "Les boucles":`<p><b>for parcourt une liste</b> de mots ou de fichiers ; le bloc est entre do et done.</p>
${W.code(`for f in *.jpg             # chaque .jpg du dossier courant
do
  echo "image : $f"
done

i=1
while [[ $i -le 3 ]]       # tant que i ≤ 3
do
  echo "tour $i"
  i=$((i + 1))
done`,"sh")}
<p>La deuxième boucle affiche tour 1, tour 2, tour 3, puis s'arrête.</p>
<p><b>À retenir :</b> *.jpg est remplacé par bash par la liste des fichiers : pas besoin d'écrire ls. Et dans while, il faut que quelque chose change (ici i), sinon la boucle ne s'arrête jamais.</p>`},
 "u-py1":{
  "Listes et chaînes":`<p><b>Les listes Python :</b> des éléments entre crochets, numérotés à partir de 0.</p>
${W.code(`notes = [12, 8, 15]
notes.append(10)        # [12, 8, 15, 10]
notes[0]                # 12, le premier
notes[-1]               # 10, le dernier
notes[1:3]              # [8, 15] : de l'indice 1 inclus à 3 exclu
len(notes)              # 4
15 in notes             # True`,"py")}
<p><b>Les chaînes</b> se découpent de la même façon, mais ne se modifient pas :</p>
${W.code(`mot = "Python"
mot[0]                  # 'P'
mot[::-1]               # 'nohtyP', à l'envers
"a;b;c".split(";")      # ['a', 'b', 'c']
"-".join(["a", "b"])    # 'a-b'
int("12") + 1           # 13 : on convertit avant de calculer`,"py")}`,
  "Blocs, boucles, fonctions":`<p><b>En Python, c'est le décalage (l'indentation) qui dit ce qui est dans un bloc,</b> après les deux-points.</p>
${W.code(`def mention(note):
    if note >= 16:
        return "très bien"
    elif note >= 10:
        return "admis"
    else:
        return "ajourné"

for n in [17, 11, 6]:
    print(n, mention(n))`,"py")}
<p>Résultat : 17 très bien, 11 admis, 6 ajourné.</p>
<ul><li>def définit une fonction, return rend son résultat ;</li><li>for v in liste parcourt les valeurs ; for i in range(len(liste)) parcourt les indices ;</li><li>while condition: répète tant que la condition est vraie.</li></ul>`},
 "u-py2":{
  "Les dictionnaires":`<p><b>Un dictionnaire</b> associe une valeur à une clé, comme un vrai dictionnaire associe une définition à un mot.</p>
${W.code(`stock = {}                 # vide
stock["pommes"] = 3        # crée la clé pommes
stock["pommes"] += 2       # 5 : la clé existe déjà

# compter les mots d'une liste
compte = {}
for m in ["a", "b", "a"]:
    if m in compte:
        compte[m] += 1
    else:
        compte[m] = 1
# compte vaut {'a': 2, 'b': 1}

for cle, valeur in compte.items():
    print(cle, valeur)`,"py")}
<p><b>Le piège :</b> compte[m] += 1 sur une clé qui n'existe pas encore provoque une erreur. D'où le test if m in compte.</p>`,
  "Lire un fichier, découper un CSV":`<p><b>Un fichier CSV</b> est un fichier texte où chaque ligne contient des champs séparés par des virgules.</p>
${W.code(`# notes.csv contient :  Léa,14
#                        Tom,9
import sys
fichier = open(sys.argv[1])        # le nom vient de la ligne de commande
for ligne in fichier:
    champs = ligne.strip().split(",")
    nom, note = champs[0], int(champs[1])
    if note >= 10:
        print(nom, "admis")
fichier.close()`,"py")}
<p>Lancé avec python3 admis.py notes.csv, il affiche « Léa admis ».</p>
<ul><li>strip() enlève le retour à la ligne de la fin ;</li><li>split(",") coupe la ligne en champs ;</li><li>tout ce qu'on lit est du texte : int() pour calculer.</li></ul>`},
 "u-py3":{
  "Le squelette du parcours":`<p><b>Le but :</b> traiter tous les fichiers d'un dossier, y compris ceux qui sont dans des sous-dossiers, sur plusieurs étages.</p>
<p><b>L'idée :</b> une fonction qui traite un dossier, et qui se rappelle elle-même pour chaque sous-dossier.</p>
${W.code(`import os, sys

def parcours(dossier):
    for nom in os.listdir(dossier):          # les noms, sans le chemin
        chemin = os.path.join(dossier, nom)
        if os.path.isdir(chemin):
            parcours(chemin)                 # même travail un étage plus bas
        else:
            print(chemin)                    # ici, le traitement d'un fichier

parcours(sys.argv[1])`,"py")}
<p><b>Pourquoi ça s'arrête :</b> un dossier qui ne contient aucun sous-dossier ne fait aucun nouvel appel.</p>
<p><b>Pour adapter :</b> on remplace le print par ce que demande l'énoncé, par exemple « si le nom finit par .csv, l'ouvrir et le lire ».</p>`,
  "Ce qui rapporte des points":`<p><b>À l'examen, ce genre d'exercice rapporte beaucoup sur les gestes de base</b>, même si le programme n'est pas parfait.</p>
<p><b>Ce que les correcteurs cherchent, ligne par ligne :</b></p>
<ul><li>une fonction récursive qui parcourt les dossiers ;</li><li>os.listdir pour lister un dossier ;</li><li>le test qui sélectionne les bons fichiers (par exemple nom.endswith(".csv")) ;</li><li>open, puis une boucle sur les lignes, puis split ;</li><li>un dictionnaire pour regrouper ou compter.</li></ul>
<p><b>Le conseil :</b> écris d'abord le squelette de l'écran précédent, puis ajoute les morceaux un par un. Même si tu bloques sur un détail, chaque geste correct rapporte ses points.</p>`},
 "u-c":{
  "Interpréter ou compiler":`<p><b>Deux façons de faire tourner un programme :</b></p>
<ul><li><b>l'interpréteur</b> (bash, python3) lit le programme et l'exécute directement, à chaque lancement ;</li><li><b>le compilateur</b> (gcc, pour le C) traduit le programme une fois pour toutes en code machine. On lance ensuite ce code, plus rapide.</li></ul>
${W.code(`gcc -Wall bonjour.c -o bonjour    # compile : crée le programme bonjour
./bonjour                         # le lance`,"sh")}
<p><b>Ce que fait gcc, en quatre étapes :</b></p>
<ol><li>le <b>préprocesseur</b> traite les #include et #define (gcc -E) ;</li><li>la <b>compilation</b> traduit le C en assembleur ; c'est là qu'apparaissent les erreurs de syntaxe (gcc -S) ;</li><li>l'<b>assemblage</b> donne un fichier objet .o (gcc -c) ;</li><li>l'<b>édition de liens</b> assemble les .o et les bibliothèques en un programme.</li></ol>`,
  "main, argc, argv":`<p><b>Un programme C commence par la fonction main.</b> Elle reçoit les mots tapés sur la ligne de commande.</p>
${W.code(`#include <stdio.h>
#include <stdlib.h>
int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage : %s nombre\\n", argv[0]);
        return 1;
    }
    int n = atoi(argv[1]);        /* le texte "7" devient le nombre 7 */
    printf("%d\\n", n * n);
    return 0;
}`,"c")}
<p>Avec ./carre 7 : argc vaut 2 (le nom du programme compte), argv[0] est "./carre", argv[1] est "7". Le programme affiche 49.</p>
<ul><li>return 0 : tout s'est bien passé ; un autre nombre signale une erreur (visible dans $?) ;</li><li>%d affiche un entier, %s une chaîne, %f un nombre à virgule.</li></ul>`,
  "Passage par valeur et mémoire":`<p><b>En C, une fonction reçoit toujours une copie</b> de ce qu'on lui donne.</p>
${W.code(`void ajoute_un(int x) {
    x = x + 1;          /* ne change que la copie */
}
int main(void) {
    int n = 5;
    ajoute_un(n);
    /* n vaut toujours 5 */
    return 0;
}`,"c")}
<p><b>Pour modifier une variable de l'appelant,</b> on donne son <b>adresse</b> (un pointeur) : la fonction sait alors où elle est rangée. Un tableau est toujours passé par son adresse : une fonction peut donc modifier ses cases.</p>
<p><b>Un pointeur</b> est une variable qui contient une adresse. Trois écritures :</p>
<ul><li>int *p déclare p comme un pointeur vers un int ;</li><li>&amp;n est l'adresse de n ;</li><li>*p est la case rangée à l'adresse p : on peut la lire et la changer.</li></ul>
${W.code(`void ajoute_un(int *p) {
    *p = *p + 1;        /* change la case de l'appelant */
}
int main(void) {
    int n = 5;
    ajoute_un(&n);
    /* n vaut 6 */
    return 0;
}`,"c")}
<p><b>Dans l'exemple du cours,</b> s et t sont des adresses. s[0]='M' et t[0]=0.0 écrivent dans les vraies cases de ch et de compl : ch devient "Monjour" et compl[0] vaut 0.0. En revanche i=i+1, s=NULL et t++ ne changent que des copies : n vaut toujours 5.</p>
<p><b>Trois endroits en mémoire :</b></p>
<ul><li>la <b>pile</b> : les variables locales, le temps de la fonction ;</li><li>le <b>tas</b> : la mémoire qu'on demande soi-même. malloc(10 * sizeof(int)) réserve la place de 10 entiers et renvoie son adresse ; elle reste réservée jusqu'à ce qu'on la rende avec free ;</li><li>la zone <b>statique</b> : les variables globales, pendant tout le programme.</li></ul>`}}
};
const LES=window.LESSONS||{},MATHS=["calc","lin","ana","geo","rai"];
Object.keys(DEBUT).forEach(sid=>(LES[sid]||[]).forEach(L=>{const M=DEBUT[sid][L.id];if(!M)return;
  L.steps.forEach(s=>{if(s.k==="learn"&&M[s.h])s.debut=MATHS.includes(sid)?W.tx(M[s.h]):M[s.h];});}));
window.DEBUT=DEBUT;
})();
