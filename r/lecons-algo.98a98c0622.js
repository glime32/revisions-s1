/* Leçons pas à pas d'algorithmique (HAI101I, CC1 du jeudi 12 novembre, sur papier).
   Programme : TD 1 à 5 (TD 4 jusqu'à l'exercice 15), TP jeu de la vie et pendu, cours jusqu'aux piles et aux files.
   Validité et complexité (diapos 52 à 86) : faites en amphi seulement, deux leçons « au cas où ».
   Pseudo-code écrit exactement comme dans le cours : FONCTION, SPÉCIFICATIONS, Variable, DÉBUT, fin si; fin pour; fin tq; FIN. */
(function(){
const LES=window.LESSONS=window.LESSONS||{};
const L=(h,x,o)=>Object.assign({k:"learn",h,x},o||{});
const Q=(q,o,a,e,x)=>Object.assign({k:"qcm",q,o,a,e},x||{});
const B=(q,code,b,e,x)=>Object.assign({k:"blanks",q,code,b,e,lang:"pseudo"},x||{});
const O=(q,lines,e,x)=>Object.assign({k:"order",q,lines,e,lang:"pseudo"},x||{});
const S=(h,intro,s,x)=>Object.assign({k:"steps",h,intro,s},x||{});
const P=(h,x,sol,check,min,o)=>Object.assign({k:"paper",h,x,sol,check,min},o||{});
const K=(f,b)=>({k:"card",f,b});
const C=s=>W.code(s,"pseudo");
const SQUEL=`FONCTION : nom (E x : entier, E T : tableau d'entiers) : booléen
SPÉCIFICATIONS : ce qu'on suppose sur les paramètres, et ce qu'on renvoie.
Variable : cpt : entier
DÉBUT
    cpt ← 0
    pour i de 0 à taille(T)-1 faire
        si T[i] = x alors
            cpt ← cpt + 1
        fin si;
    fin pour;
    Renvoyer cpt > 0
FIN`;

LES.algo=[
/* ------------------------------------------------------------------ */
{id:"a-forme",t:"La forme d'un algorithme : signature, variables, fin pour",min:18,goal:"Écrire un algorithme sans faute de forme : le conseil de tes camarades, et des points faciles sur chaque question.",steps:[
 Q("Quelle est la bonne signature d'une fonction qui renvoie le plus grand de deux entiers ?",["FONCTION : max2 (E a : entier, E b : entier) : entier","PROCÉDURE : max2 (E a : entier, E b : entier) : entier","FONCTION : max2 (a, b)","FONCTION : max2 : entier"],0,"Une fonction : le mot FONCTION, son nom, chaque paramètre avec E (ou S, ES) et son type, puis le type du résultat après la parenthèse. Une procédure n'a pas de type de résultat."),
 L("Le squelette, toujours le même",`<ul><li><b>FONCTION</b> si l'algorithme renvoie un résultat (avec son type à la fin de la signature), <b>PROCÉDURE</b> s'il affiche ou modifie un paramètre ES.</li><li>Chaque paramètre : E (entrée), S (sortie) ou ES (entrée-sortie), son nom, son type.</li><li><b>SPÉCIFICATIONS</b> : ce qu'on suppose et ce qu'on renvoie, en une phrase.</li><li><b>Variable</b> : les mémoires de travail avec leur type. Ni les paramètres, ni l'indice d'une boucle pour (cours p. 11).</li><li>Chaque si, pour, tant que se ferme par <b>fin si;</b>, <b>fin pour;</b>, <b>fin tq;</b>, aligné sous son ouverture.</li><li><b>Renvoyer</b> une seule fois, après la boucle, sauf pour une recherche (« dès que je trouve, je renvoie »).</li></ul>`,{code:SQUEL}),
 L("Lire cet algorithme ligne par ligne",`<p>Reprends l'algorithme de l'écran précédent. Voici ce que dit chaque ligne.</p><ul><li><b>FONCTION : nom (E x : entier, E T : tableau d'entiers) : booléen</b>. L'algorithme s'appelle nom. Il reçoit un entier x et un tableau d'entiers T. Il renvoie un booléen : true (vrai) ou false (faux).</li><li><b>Variable : cpt : entier</b>. cpt est une mémoire de travail, qui contient un entier.</li><li><b>cpt ← 0</b>. La flèche se lit « reçoit » : cpt vaut maintenant 0.</li><li><b>pour i de 0 à taille(T)-1 faire … fin pour;</b>. On répète les lignes du bloc pour i = 0, puis 1, puis 2… taille(T) est le nombre de cases du tableau. Ses cases sont numérotées à partir de 0 : la dernière porte le numéro taille(T) − 1.</li><li><b>si T[i] = x alors … fin si;</b>. T[i] est la case numéro i. Le bloc n'est fait que si elle vaut x. Ici, « = » compare : il ne range rien.</li><li><b>cpt ← cpt + 1</b>. cpt augmente de 1.</li><li><b>Renvoyer cpt &gt; 0</b>. L'algorithme donne son résultat et s'arrête. Ici : true si x a été trouvé au moins une fois.</li></ul>`),
 Q("Avec T = [4, 7, 4] et x = 4, que vaut cpt quand la boucle est finie ?",["2","1","3","0"],0,"i = 0 : T[0] = 4, cpt passe à 1. i = 1 : T[1] = 7, rien ne change. i = 2 : T[2] = 4, cpt passe à 2. L'algorithme renvoie donc 2 > 0, c'est-à-dire true.",{diag:false,ctx:true}),
 Q("« Afficher un triangle d'étoiles de côté n » : fonction ou procédure ?",["Procédure : elle affiche, elle ne renvoie rien","Fonction : elle renvoie un triangle"],0,"Ce qui est affiché n'est pas renvoyé. Pas de Renvoyer, pas de type de résultat : PROCÉDURE."),
 Q("Dans « pour i de 0 à taille(T)-1 faire », faut-il écrire i dans la ligne « Variable : » ?",["Oui : toute lettre qui change de valeur est une variable","Non : l'indice d'une boucle pour n'est pas une variable","Oui : sinon i n'a pas de valeur au premier tour"],1,"Le cours le dit page 11. En revanche, dans une boucle tant que, le compteur est une vraie variable : on le déclare, on l'initialise et on l'augmente soi-même."),
 O("Remets dans l'ordre la fonction compteEgaux, qui renvoie le nombre d'éléments du tableau T égaux à e.",["FONCTION : compteEgaux (E e : entier, E T : tableau d'entiers) : entier","SPÉCIFICATIONS : renvoie le nombre d'éléments de T égaux à e.","Variable : cpt : entier","DÉBUT","    cpt ← 0","    pour i de 0 à taille(T)-1 faire","        si T[i] = e alors","            cpt ← cpt + 1","        fin si;","    fin pour;","    Renvoyer cpt","FIN"],"L'initialisation avant la boucle, le test dans la boucle, Renvoyer après fin pour;."),
 L("Trouve les erreurs",`<p>Six algorithmes contiennent des fautes typiques : signature incomplète, variable non déclarée, fin pour; mal placé… Clique sur les lignes fausses, puis vérifie. Fais-en au moins trois.</p>`,{fig:"a-pseudo"}),
 B("Ferme chaque bloc. (div : le quotient de la division entière. afficher écrit à l'écran. affEtoile() est une procédure qui affiche une étoile.)",`tant que m ≥ 10 faire
    m ← m div 10
    c ← c + 1
[[0]]
si c > 3 alors
    afficher "grand"
[[1]]
pour i de 1 à n faire
    affEtoile()
[[2]]`,[{o:["fin tq;","fin si;","fin pour;"],a:0},{o:["fin tq;","fin si;","fin pour;"],a:1},{o:["fin tq;","fin si;","fin pour;"],a:2}],"Chaque bloc se ferme avec le mot de son ouverture : tant que … fin tq; · si … fin si; · pour … fin pour;. Le bloc ouvert en dernier se ferme en premier."),
 Q("Dans un algorithme qui additionne les éléments d'un tableau, où se place « Renvoyer som » ?",["Juste après DÉBUT","Dans la boucle, après som ← som + T[i]","Après fin pour;","Avant la boucle"],2,"Dans la boucle, l'algorithme s'arrêterait au premier tour. On renvoie une seule fois, quand la boucle a tout parcouru.",{diag:false}),
 P("Écris une fonction complète","Écris en pseudo-code une fonction somme qui, étant donné un tableau T d'entiers, renvoie la somme de ses éléments. Écris tout : signature, spécifications, variables, corps.",C(`FONCTION : somme (E T : tableau d'entiers) : entier
SPÉCIFICATIONS : renvoie la somme des éléments de T.
Variable : som : entier
DÉBUT
    som ← 0
    pour i de 0 à taille(T)-1 faire
        som ← som + T[i]
    fin pour;
    Renvoyer som
FIN`),["FONCTION, le nom, (E T : tableau d'entiers) et « : entier » à la fin","Une ligne SPÉCIFICATIONS","Variable : som : entier, et pas i","som ← 0 avant la boucle","pour i de 0 à taille(T)-1, fermé par fin pour;","Renvoyer som après fin pour;"],6),
 K("Dans quel ordre s'écrivent les parties d'un algorithme en pseudo-code, de la première ligne à la dernière ?","La signature : FONCTION (ou PROCÉDURE) : nom (E x : type, …) : type du résultat. Puis SPÉCIFICATIONS, puis Variable, puis DÉBUT … FIN. Chaque bloc se ferme : fin si; fin pour; fin tq;."),
 K("Quelle est la différence entre une fonction et une procédure ?","Une fonction renvoie un résultat (Renvoyer) et a un type de résultat. Une procédure ne renvoie rien : elle affiche, ou modifie un paramètre ES."),
 K("Dans un algorithme en pseudo-code, que déclare-t-on sur la ligne « Variable : » ?","Les mémoires de travail de l'algorithme, avec leur type. On n'y met pas les paramètres (ils sont dans la signature), ni l'indice d'une boucle pour. Le compteur d'une boucle tant que, oui.")]},

/* ------------------------------------------------------------------ */
{id:"a-expressions",t:"Types, expressions et cond",min:17,goal:"Trouver le type et la valeur d'une expression, ou dire « erreur » : l'exercice 1 du TD 1.",steps:[
 Q("Que valent 5 / 2 et 5 div 2 en pseudo-code ?",["2,5 et 2","2 et 2,5","2 et 2","2,5 et 2,5"],0,"/ est la division : le résultat est un nombre. div donne le quotient entier, mod le reste : 5 mod 2 = 1."),
 L("Les types : entier, nombre, booléen, chaîne",`<p><b>Type d'une valeur</b> (cours p. 10) : entier, nombre, chaîne, booléen, tableau…</p><ul><li><b>entier</b> : un nombre sans virgule, comme 5, 0 ou −3.</li><li><b>nombre</b> : un nombre qui peut avoir une virgule, comme 2,5. Un entier est aussi un nombre.</li><li><b>booléen</b> : une valeur de vérité. Il n'y en a que deux : true (vrai) et false (faux).</li><li><b>chaîne</b> : du texte entre guillemets, comme "Peachy".</li></ul><p><b>Expression</b> (cours p. 10) : formule contenant constantes, noms de variables, paramètres, appels d'algorithmes et opérations. Exemple : 1 + 5 * 2.</p><p>Trouver le <b>type d'une expression</b>, c'est dire de quelle sorte est sa valeur, une fois le calcul fait.</p>`),
 Q("Quel est le type de l'expression 3 < 5 ?",["booléen","entier","nombre","erreur"],0,"3 < 5 est une comparaison : sa valeur est true. C'est un booléen."),
 L("Les opérateurs du cours (p. 12)",`<ul><li>Opérateurs de calcul : + − * / ^ (puissance), <b>div</b> (quotient), <b>mod</b> (reste).</li><li>Opérateurs de comparaison : = ≠ &lt; ≤ &gt; ≥.</li><li>Opérateurs logiques : non, et, ou. <b>Évaluation paresseuse</b> : dans « a et b », si a est faux, b n'est pas évalué ; dans « a ou b », si a est vrai, b n'est pas évalué.</li><li>Opérateur conditionnel : <b>cond(a, b, c)</b> vaut b si a est vrai, c si a est faux. b et c doivent être <b>du même type</b>. Utilise l'évaluation paresseuse.</li><li>Affectation : variable ← expression.</li></ul><p><b>Le type du résultat.</b> Entre deux entiers, + − * div et mod donnent un entier. / donne un nombre : 5 / 2 = 2,5. Une comparaison donne un booléen. « et », « ou », « non » prennent des booléens et donnent un booléen.</p>`),
 Q("Que vaut true ou (5/0 = 1) ?",["erreur : division par zéro","true","false"],1,"Évaluation paresseuse : true ou … vaut true sans calculer la suite."),
 Q("Que vaut cond(5 mod 2 = 1, 8, 15) ?",["8","15","true","erreur"],0,"5 mod 2 = 1 est vrai : le reste de 5 par 2 vaut bien 1. cond prend donc la première valeur, 8. Son type est entier."),
 L("Appeler une fonction donnée par l'énoncé : proche? et reste",`<p><b>Appel d'algorithme</b> (cours p. 10) : nom de l'algorithme suivi de valeurs, les arguments, entre parenthèses. Si l'algorithme est une fonction, l'appel renvoie son résultat principal.</p><p>L'exercice 1 du TD 1 te donne deux fonctions. Tu ne vois pas leur corps : seulement leur signature et leurs spécifications.</p>`,{code:`FONCTION : proche? (E a : nombre, E b : nombre) : booléen
SPÉCIFICATIONS : renvoie true si |a-b| < 2, false sinon.

FONCTION : reste (E x : entier) : entier
SPÉCIFICATIONS : x est un entier naturel. Renvoie le reste de la division de x par 2.`,after:`<p>Pour calculer un appel :</p><ol><li><b>Compte les arguments.</b> proche? en veut 2, reste en veut 1. Un de trop ou un de moins : c'est une erreur.</li><li><b>Vérifie leur type.</b> reste veut un entier ; proche? veut deux nombres.</li><li><b>Applique les spécifications</b>, en commençant par l'intérieur des parenthèses.</li></ol><p>|a − b| est l'écart entre a et b : |1 − 4| = 3 et |4 − 2| = 2. Le type de l'appel est écrit à la fin de la signature : proche?(1, 2) est un booléen, reste(5) est un entier.</p>`}),
 Q("Que vaut proche?(reste(5), 2) ?",["true","false","1","erreur"],0,"On calcule d'abord l'intérieur : reste(5) = 1. Puis proche?(1, 2) : l'écart |1 − 2| vaut 1, et 1 < 2, donc true.",{diag:false,ctx:true}),
 Q("Que vaut proche?(1, 2, 3) ?",["true","false","erreur"],2,"proche? attend deux arguments : un appel avec trois arguments est une erreur.",{diag:false,ctx:true}),
 Q("Que vaut cond(1 < 3, reste(3), true) ?",["1","true","erreur"],2,"Les deux valeurs possibles de cond doivent avoir le même type. Ici reste(3) = 1 est un entier, et true est un booléen : erreur.",{diag:false,ctx:true}),
 L("Entraîne-toi sur 18 expressions",`<p>Les expressions de l'exercice 1 du TD 1 et de la page 13 du cours. Pour chacune : compte les arguments, regarde les types, puis calcule.</p><p>Rappel : proche?(a, b) vaut true si |a − b| &lt; 2 ; reste(x) est le reste de la division de x par 2.</p>`,{fig:"a-expressions",nolook:true}),
 B("TD 1, exercice 2 : « Écrivez un algorithme max3 qui calcule le maximum de 3 nombres. Vous donnerez deux versions d'algorithme, l'une n'utilisant que l'opérateur conditionnel cond, l'autre n'utilisant que la fonction max qui renvoie le maximum de 2 nombres. » Complète la première version : <b>seulement cond</b> et des comparaisons.",`FONCTION : max3 (E a : nombre, E b : nombre, E c : nombre) : nombre
SPÉCIFICATIONS : renvoie le plus grand des trois nombres.
DÉBUT
    Renvoyer cond(a ≥ b, cond(a ≥ c, [[0]], [[1]]), cond(b ≥ c, [[2]], [[3]]))
FIN`,[{o:["a","b","c"],a:0},{o:["a","b","c"],a:2},{o:["a","b","c"],a:1},{o:["a","b","c"],a:2}],"Si a ≥ b, le plus grand est a ou c : cond(a ≥ c, a, c). Sinon, c'est b ou c : cond(b ≥ c, b, c). La deuxième version demandée, avec seulement max : Renvoyer max(a, max(b, c))."),
 P("TD 1, exercice 3 : ouExcl","Écris l'algorithme ouExcl qui, étant donnés deux booléens, renvoie true si exactement un des deux vaut true, renvoie false sinon. Donne <b>deux versions</b> : la première utilise l'opérateur conditionnel cond, la seconde ne l'utilise pas.",C(`FONCTION : ouExcl (E a : booléen, E b : booléen) : booléen
SPÉCIFICATIONS : renvoie true si exactement un des deux vaut true, false sinon.
DÉBUT
    Renvoyer cond(a, non b, b)
FIN

Sans cond :   Renvoyer (a et non b) ou (non a et b)`)+"<p>Avec cond : si a vaut true, il faut que b vaille false, donc le résultat est « non b ». Si a vaut false, il faut que b vaille true, donc le résultat est b.</p><p>Sans cond : « a et non b » dit que seul a vaut true ; « non a et b » dit que seul b vaut true.</p>",["J'ai écrit les deux versions demandées","La signature complète, avec les types booléen","La version cond : si a est vrai, il faut b faux","La version sans cond avec et, ou, non"],6),
 K("En pseudo-code, que calculent les opérateurs /, div et mod ? Donne l'exemple de 5 et 2.","/ : la division, un nombre (5/2 = 2,5). div : le quotient entier (5 div 2 = 2). mod : le reste (5 mod 2 = 1)."),
 K("Que vaut l'expression cond(a, b, c) ? Quelle condition doivent respecter b et c ?","Elle vaut b si a est vrai, c sinon. b et c doivent avoir le même type, sinon c'est une erreur."),
 K("Dans « a et b » et dans « a ou b », b est-il toujours calculé ? (C'est ce qu'on appelle l'évaluation paresseuse.)","Non. Dans « a et b », si a est faux, b n'est pas calculé. Dans « a ou b », si a est vrai, b n'est pas calculé. Ainsi true ou (5/0 = 1) vaut true, sans erreur."),
 K("Quels sont les quatre types de valeurs du pseudo-code du cours ? Donne un exemple de chacun.","entier (5), nombre (2,5), booléen (true ou false), chaîne (\"Peachy\"). / donne un nombre ; une comparaison donne un booléen."),
 K("Comment calculer une expression où un appel est à l'intérieur d'un autre, comme f(g(5), 2) ?","1. Compter les arguments de chaque appel et les comparer à la signature (un argument en trop ou en moins : erreur). 2. Vérifier leur type. 3. Calculer en partant de l'intérieur : d'abord g(5), puis f avec ce résultat.")]},

/* ------------------------------------------------------------------ */
{id:"a-boucles",t:"Boucles pour et tant que, et la trace",min:14,goal:"Prévoir ce que renvoie ou affiche une boucle, en faisant une trace comme au CC.",steps:[
 Q("Que renvoie ce bloc (cours p. 17) ?",["4","5","9","10"],1,"On s'arrête dès que 2i + 1 ≥ 10. i vaut 0, 1, 2, 3, 4, puis 5 : 2 × 5 + 1 = 11 ≥ 10, on sort. Renvoie 5.",{code:`i ← 0
tant que 2*i+1 < 10 faire
    i ← i+1
fin tq;
Renvoyer i`}),
 L("La syntaxe du cours",`<p><b>pour</b> : quand le nombre de tours est connu à l'avance (a et b compris). <b>tant que</b> : on répète tant que la condition est vraie, et il faut que quelque chose change dans la boucle, sinon elle ne s'arrête jamais.</p><p><b>par pas de</b> : « pour j de 10 à 1 par pas de -3 » fait prendre à j les valeurs 10, 7, 4, 1 ; on s'arrête avant de dépasser la borne.</p><p><b>afficher x</b> écrit la valeur de x à l'écran, et l'algorithme continue. <b>Renvoyer x</b> donne le résultat et arrête l'algorithme.</p>`,{code:`si condition alors
    …
sinon si autre condition alors
    …
sinon
    …
fin si;

pour i de a à b faire
    …
fin pour;

pour i de a à b par pas de p faire
    …
fin pour;

tant que condition faire
    …
fin tq;`}),
 L("Déroule une boucle pas à pas",`<p>Une trace, c'est un tableau avec une colonne par variable et une ligne par tour. Avance pas à pas et regarde m et c changer.</p>`,{fig:"a-boucles"}),
 Q("Que renvoie ce bloc (cours p. 17) ?",["0 : la boucle s'arrête quand i vaut 0","1 : la dernière valeur de i avant 0","−1 : la première valeur de i sous 0","Rien : la boucle ne s'arrête jamais"],3,"i vaut 5, 3, 1, −1, −3… : il n'est jamais égal à 0, donc la condition i ≠ 0 reste vraie pour toujours.",{code:`i ← 5
tant que i ≠ 0 faire
    i ← i-2
fin tq;
Renvoyer i`}),
 Q("Qu'affiche ce bloc (cours p. 19) ?",["8 6 4 2 0","10 8 6 4 2","8 6 4 2","0 2 4 6 8"],0,"La boucle fait prendre à i les valeurs 1, 2, 3, 4, 5 (la borne 5 est comprise). Pour chacune, on affiche 10 − 2 × i : i = 1 donne 8, i = 2 donne 6, puis 4, 2 et enfin 0 pour i = 5. Résultat : 8 6 4 2 0.",{code:`pour i de 1 à 5 faire
    afficher 10 - 2*i
fin pour;`}),
 Q("Qu'affiche ce bloc (cours p. 19) ?",["6 4 12 8 18 12 24 16 30 20","6 12 18 24 30","Rien : 6 est plus grand que 3","6 4 2 12 8 4 18 12 6"],0,"Avec un pas de −2, j prend 6 puis 4 (2 dépasse 3, on s'arrête). Pour chaque i : i × 6 puis i × 4.",{code:`pour i de 1 à 5 faire
    pour j de 6 à 3 par pas de -2 faire
        afficher i*j
    fin pour;
fin pour;`}),
 Q("Qu'affiche ce bloc (cours p. 15) ?",["0","5","7"],2,"Les deux si sont l'un après l'autre : le premier met i à 5, puis le second voit 5 ≥ 4 et met i à 7. Avec « sinon si » dans un seul bloc, on aurait affiché 5.",{code:`i ← 0
si i < 3 alors
    i ← 5
fin si;
si i ≥ 4 alors
    i ← 7
fin si;
afficher i`}),
 P("Une trace sur papier","Fais la trace de nbChiffres(4097) : un tableau avec une colonne m, une colonne c, et une ligne par tour de boucle. Que renvoie l'algorithme ? (« c, m ← 1, n » veut dire : c reçoit 1 et m reçoit n. m div 10 est le quotient entier de m par 10 : 4097 div 10 = 409.)"+C(`FONCTION : nbChiffres (E n : entier) : entier
Variable : c, m : entier
DÉBUT
    c, m ← 1, n
    tant que m ≥ 10 faire
        m ← m div 10
        c ← c + 1
    fin tq;
    Renvoyer c
FIN`),`<table class="tbl"><thead><tr><th>tour</th><th class="var">m</th><th class="var">c</th></tr></thead><tbody><tr><td>départ</td><td>4097</td><td>1</td></tr><tr><td>1</td><td>409</td><td>2</td></tr><tr><td>2</td><td>40</td><td>3</td></tr><tr><td>3</td><td>4</td><td>4</td></tr></tbody></table><p>4 &lt; 10 : on sort de la boucle. L'algorithme renvoie 4, le nombre de chiffres de 4097.</p>`,["Une colonne par variable","Une ligne par tour, plus la ligne de départ","Le test d'arrêt écrit (4 < 10)","La valeur renvoyée"],6),
 K("Quand utilise-t-on une boucle pour, et quand une boucle tant que ?","pour : nombre de tours connu à l'avance (a et b compris). tant que : on répète tant qu'une condition est vraie ; quelque chose doit changer dans la boucle, sinon elle ne s'arrête jamais."),
 K("Comment présenter la trace d'un algorithme, c'est-à-dire les valeurs de ses variables tour après tour ?","Un tableau : une colonne par variable, une ligne par tour (plus la ligne de départ). On écrit le test d'arrêt et la valeur renvoyée.")]},

/* ------------------------------------------------------------------ */
{id:"a-motifs",t:"Afficher un motif d'étoiles",min:14,goal:"Écrire une procédure qui affiche une figure avec des boucles. 4 points au CC PEIP 2023.",steps:[
 Q("Le triangle inversé du TD 1 (ici n = 5). Sur la ligne i (de 1 à n), combien d'espaces avant les étoiles ?",["i","i − 1","n − i","n − i + 1"],1,"Ligne 1 : 0 espace ; ligne 5 : 4 espaces. Donc i − 1 espaces, puis n − i + 1 étoiles.",{code:`*****
 ****
  ***
   **
    *`,lang:"txt"}),
 L("La méthode",`<ol><li>Dessine la figure pour n = 4 et numérote les lignes.</li><li>Pour chaque ligne i, écris combien d'espaces et combien d'étoiles, en fonction de i et de n.</li><li>Traduis : une boucle sur les lignes ; dedans, une boucle par morceau ; puis le retour à la ligne.</li><li>Vérifie sur la première et la dernière ligne.</li></ol><p>Les procédures du TD 1 : <b>affEtoile()</b> affiche une étoile, <b>affEspace()</b> un espace, <b>affRL()</b> passe à la ligne, et <b>ligne(k)</b> affiche k étoiles puis passe à la ligne.</p><p>Choisis une figure et change n.</p>`,{fig:"a-motifs"}),
 O("TD 1, exercice 4, figure 4 : remets dans l'ordre la procédure triangleInverse, qui affiche ce triangle de base n (ici n = 5). Tu peux appeler affEspace(), qui affiche un espace, et ligne(k), qui affiche k étoiles puis passe à la ligne.",["PROCÉDURE : triangleInverse (E n : entier)","SPÉCIFICATIONS : ligne i : i − 1 espaces puis n − i + 1 étoiles.","DÉBUT","    pour i de 1 à n faire","        pour j de 1 à i-1 faire","            affEspace()","        fin pour;","        ligne(n - i + 1)","    fin pour;","FIN"],"La boucle des espaces est dans la boucle des lignes ; ligne(k) affiche k étoiles puis passe à la ligne.",{show:`*****
 ****
  ***
   **
    *`}),
 B("TD 1, exercice 4, figure 5 : complète la procédure qui affiche cette pyramide de base n (ici n = 5). Sur la ligne i : n − i espaces, puis i fois « une étoile puis un espace ». affEspace() affiche un espace, affEtoile() une étoile, affRL() passe à la ligne.",`pour i de 1 à n faire
    pour j de 1 à [[0]] faire
        affEspace()
    fin pour;
    pour j de 1 à [[1]] faire
        affEtoile()
        affEspace()
    fin pour;
    [[2]]
fin pour;`,[{o:["n-i","i","n"],a:0},{o:["i","n-i","n"],a:0},{o:["affRL()","affEspace()","Renvoyer"],a:0}],"Deux boucles l'une après l'autre dans la boucle des lignes, puis affRL() une seule fois par ligne.",{show:`    *
   * *
  * * *
 * * * *
* * * * *`}),
 P("CC PEIP 2023, exercice 3 (4 points)","On dispose des procédures affX() qui affiche un X, affB() qui affiche un espace et alaligne() qui passe à la ligne. Écris une procédure <b>non récursive</b> GrandEt qui, étant donné un entier n, affiche un motif à n lignes comme sur les figures suivantes. GrandEt(5) :"+W.code(`    X
   X X
  X   X
 X     X
X       X`,"txt")+"GrandEt(4) :"+W.code(`   X
  X X
 X   X
X     X`,"txt"),C(`PROCÉDURE : GrandEt (E n : entier)
SPÉCIFICATIONS : n ≥ 1. Affiche un Λ de n lignes, sans récursivité.
DÉBUT
    pour k de 0 à n-1 faire
        pour j de 1 à n-1-k faire
            affB()
        fin pour;
        affX()
        si k > 0 alors
            pour j de 1 à 2*k-1 faire
                affB()
            fin pour;
            affX()
        fin si;
        alaligne()
    fin pour;
FIN`)+"<p>Ligne k (de 0 à n − 1) : n − 1 − k espaces, un X, puis pour k > 0 : 2k − 1 espaces et un second X. Le si traite la pointe, qui n'a qu'un X.</p>",["Aucun appel récursif : seulement des boucles pour","J'ai compté les espaces de chaque ligne en fonction de k","La pointe (un seul X) est traitée à part","alaligne() est dans la boucle des lignes, après les X","Chaque pour a son fin pour;, le si son fin si;"],12),
 K("Quelle méthode suivre pour écrire une procédure qui affiche un motif d'étoiles sur n lignes ?","D'abord, pour la ligne i : combien d'espaces et combien d'étoiles, en fonction de i et de n. Puis une boucle sur les lignes ; dedans, une boucle par morceau (les espaces, puis les étoiles), et un passage à la ligne."),
 K("Un triangle de n lignes a 1 étoile sur la ligne 1, 2 étoiles sur la ligne 2, et ainsi de suite. Avec affEtoile(), qui affiche une étoile, et affRL(), qui passe à la ligne, quelles instructions affichent la ligne i ?","pour j de 1 à i faire affEtoile() fin pour; puis affRL().")]},

/* ------------------------------------------------------------------ */
{id:"a-recursif",t:"Récursivité : écrire un algorithme récursif",min:20,goal:"Écrire un algorithme récursif avec la méthode du TD : cas de base, récurrence, puis cond ou si.",steps:[
 Q("Que vaut mystere(3) (TD 2, exercice 5) ?",["9","14","3","6"],1,"mystere(3) = 9 + mystere(2) = 9 + 4 + mystere(1) = 9 + 4 + 1 + mystere(0) = 14. mystere(n) = 1² + 2² + … + n².",{code:`FONCTION : mystere (E n : entier) : entier
SPÉCIFICATIONS : n est un entier naturel.
DÉBUT
    Renvoyer cond(n = 0, 0, n*n + mystere(n-1))
FIN`}),
 L("La méthode du TD",`<ol><li><b>Cas de base</b> : quand n = 0 (ou la liste est vide…), que vaut f ? Sans appel récursif.</li><li><b>Récurrence</b> : quand n &gt; 0, exprimer f(n) à partir de f(n − 1).</li><li><b>Traduire</b> avec cond, ou avec si … sinon … fin si;.</li></ol><p>Sans cas de base, ou si l'appel ne se rapproche pas du cas de base, l'algorithme se rappelle à l'infini. Regarde l'arbre des appels de FactRec.</p>`,{fig:"a-recursif",code:`FONCTION : FactRec (E n : entier) : entier
SPÉCIFICATIONS : n ∈ ℕ. Renvoie n!, avec 0! = 1.
DÉBUT
    si n = 0 alors
        Renvoyer 1
    sinon
        Renvoyer n * FactRec(n - 1)
    fin si;
FIN`}),
 S("Exemple corrigé : TD 2, exercice 6","Écrire sommeInterv(E a : entier, E b : entier) : entier, avec a ≤ b, qui renvoie la somme des entiers de a à b.",[
  {w:"Cas de base : si a = b, la somme vaut a.",why:"Il n'y a qu'un seul entier entre a et b."},
  {w:"Récurrence : si a < b, sommeInterv(a, b) = a + sommeInterv(a + 1, b).",why:"On met a de côté, et on demande la somme du reste, qui est un problème plus petit."},
  {w:"Traduction : Renvoyer cond(a = b, a, a + sommeInterv(a + 1, b)).",why:"La signature et les spécifications sont données par l'énoncé."}]),
 B("TD 2, exercice 7 : « Écrire un algorithme récursif suiteU qui, étant donné un entier naturel n, calcule le n-ième terme de la suite (Uₙ) définie par U₀ = 1 et, pour n > 0, Uₙ = 2 × Uₙ₋₁ + 3. » Complète. (En pseudo-code, la multiplication s'écrit avec *.)",`FONCTION : suiteU (E n : entier) : entier
SPÉCIFICATIONS : n ∈ ℕ. Renvoie Uₙ.
DÉBUT
    Renvoyer cond(n = 0, [[0]], [[1]])
FIN`,[{o:["1","0","3"],a:0},{o:["2 * suiteU(n - 1) + 3","2 * suiteU(n) + 3","suiteU(n - 1) + 3"],a:0}],"Le cas de base donne U₀ = 1. L'appel récursif calcule 2 fois le terme d'avant, plus 3. Vérification : U₁ = 2 × 1 + 3 = 5, U₂ = 2 × 5 + 3 = 13, U₃ = 2 × 13 + 3 = 29."),
 S("Exemple corrigé : TD 2, exercice 12, la multiplication « du paysan russe »","On souhaite multiplier deux entiers positifs a et b <b>en n'utilisant que des additions, la multiplication par 2 et la division par 2</b>. Soit mul le nom de cet algorithme : mul(a, b) renvoie a × b. Pour définir mul, on utilise un schéma récursif exprimant mul(a, b) en fonction de mul(a div 2, b). Complète ce schéma : le cas de base (a = 0), puis le cas où a est pair, puis le cas où a est impair.",[
  {w:"Cas de base : quand a = 0, mul(a, b) vaut 0.",why:"0 × b = 0. Aucun appel récursif."},
  {w:"Ce que donne l'appel récursif : mul(a div 2, b) vaut (a div 2) × b.",why:"a div 2 est le quotient entier de a par 2 : c'est « la division par 2 » permise par l'énoncé. Exemple : mul(3, 5) vaut 15."},
  {w:"Quand a est pair : a = 2 × (a div 2), donc mul(a, b) vaut 2 * mul(a div 2, b).",why:"Exemple : 6 × 5 = 2 × (3 × 5) = 2 × 15 = 30. On n'a utilisé que la multiplication par 2."},
  {w:"Quand a est impair : a = 2 × (a div 2) + 1, donc mul(a, b) vaut 2 * mul(a div 2, b) + b.",why:"Exemple : 7 × 5 = 2 × (3 × 5) + 5 = 35. Il manquait un b : on l'ajoute, avec une addition."}]),
 O("TD 2, exercice 12 : remets maintenant l'algorithme mul dans l'ordre. Rappel : l'appel mul(a div 2, b) calcule (a div 2) × b, et « a mod 2 = 0 » teste si a est pair (le reste de la division de a par 2 vaut 0).",["FONCTION : mul (E a : entier, E b : entier) : entier","SPÉCIFICATIONS : a, b ∈ ℕ. Renvoie a × b.","DÉBUT","    si a = 0 alors","        Renvoyer 0","    sinon si a mod 2 = 0 alors","        Renvoyer 2 * mul(a div 2, b)","    sinon","        Renvoyer 2 * mul(a div 2, b) + b","    fin si;","FIN"],"Le cas de base d'abord (a = 0), puis le cas pair (le double), puis le cas impair (le double, plus b). Vérification : mul(5, 3) = 2 * mul(2, 3) + 3 = 2 * 6 + 3 = 15."),
 L("Avant d'écrire : ce que l'énoncé impose",`<p>Dans les TD et les CC, l'énoncé ne dit pas seulement quoi calculer. Il dit souvent <b>comment</b> :</p><ul><li>« Écrire un algorithme <b>récursif</b> » (TD 2, exercices 6 à 8) : l'algorithme doit s'appeler lui-même.</li><li>« des procédures <b>récursives non itératives</b> » (TD 2, exercice 9) : aucune boucle.</li><li>« Les <b>seules opérations autorisées</b> sont la soustraction, les comparaisons et l'opérateur ternaire cond » (TD 2, exercice 8) : tout le reste est interdit, donc ni mod, ni div.</li><li>« en n'utilisant <b>que</b> des additions, la multiplication par 2 et la division par 2 » (TD 2, exercice 12) : pas de a * b.</li><li>« une procédure <b>non récursive</b> » (CC PEIP 2023, exercice 3) : des boucles, et aucun appel à elle-même.</li><li>« sous forme récursive ; sous forme <b>itérative</b> » (TD 5, exercice 20) : itérative veut dire avec une boucle.</li></ul><p>Une réponse qui calcule le bon résultat sans respecter ces mots ne répond pas à la question posée.</p>`,{nolook:true}),
 Q("TD 2, exercice 8 : « Écrire un algorithme récursif estPair qui, étant donné un entier naturel n, renvoie true si n est un entier pair, false sinon. Les seules opérations autorisées sont la soustraction, les comparaisons et l'opérateur ternaire cond. » L'idée : n est pair exactement quand n − 2 est pair. Que manque-t-il à ce premier essai ?",["Rien : n − 2 finit toujours par arriver à 0","Le cas n = 1 : sinon estPair(1) appelle estPair(−1), puis estPair(−3)… sans fin","Le cas n = 2 : c'est le plus petit entier pair non nul","Il faut appeler estPair(n − 1) pour passer par tous les entiers"],1,"Pour un entier impair, n − 2 saute par-dessus 0 : 5, 3, 1, −1, −3… Il faut un deuxième cas de base, n = 1, qui renvoie false. Le cas n = 2 n'aide pas les nombres impairs, et estPair(n − 1) ne dit pas si n est pair (5 − 1 = 4 est pair, 5 ne l'est pas).",{code:`Renvoyer cond(n = 0, true, estPair(n - 2))`}),
 P("TD 2, exercice 8, sur papier","Écris un algorithme <b>récursif</b> estPair qui, étant donné un entier naturel n, renvoie true si n est un entier pair, false sinon. <b>Les seules opérations autorisées sont la soustraction, les comparaisons et l'opérateur ternaire cond.</b> (Donc : pas de mod, pas de div, pas de boucle.)",C(`FONCTION : estPair (E n : entier) : booléen
SPÉCIFICATIONS : n ∈ ℕ. Renvoie true si n est pair, false sinon.
DÉBUT
    Renvoyer cond(n = 0, true, cond(n = 1, false, estPair(n - 2)))
FIN`)+"<p>Si tu as écrit « Renvoyer n mod 2 = 0 » : le calcul est juste, mais l'énoncé interdit mod et demande un algorithme récursif. Cette réponse ne répond donc pas à la question posée.</p>",["Mon algorithme s'appelle lui-même, sans boucle","Je n'ai utilisé ni mod ni div : seulement la soustraction, des comparaisons et cond","La signature avec « : booléen »","Deux cas de base : n = 0 (true) et n = 1 (false)","L'appel sur n − 2"],6),
 K("Quelles sont les trois étapes pour écrire un algorithme récursif ?","1. Le cas de base (sans appel). 2. La récurrence : f(n) à partir de f(n − 1) (ou de la queue d'une liste…). 3. La traduction avec cond ou si."),
 K("Dans un algorithme récursif, vers quoi doivent aller les appels successifs pour qu'il s'arrête ?","Vers le cas de base : chaque appel se fait sur une donnée plus petite (n − 1, la queue de la liste…), jusqu'à l'atteindre. Sans cas de base, ou si les appels ne s'en rapprochent pas, l'algorithme se rappelle à l'infini."),
 K("Avant d'écrire un algorithme : que regarder dans l'énoncé ?","Les mots qui imposent une façon de faire : « récursif », « non récursif », « itératif », « seules opérations autorisées », « en n'utilisant que ». Une réponse juste qui ne les respecte pas ne répond pas à la question.")]},

/* ------------------------------------------------------------------ */
{id:"a-affichage",t:"Récursivité : ce qu'affiche une procédure",min:15,goal:"Trouver l'affichage d'une procédure récursive en dessinant l'arbre des appels : 4 points au CC1 2024 et au CC PEIP 2023.",steps:[
 Q("Avec cette procédure G, qu'affiche G(2) ?",["** puis *","* puis **","**","rien"],0,"G(2) fait G(0), qui n'affiche rien, puis affiche **, puis fait G(1), qui affiche *.",{code:`PROCÉDURE : G (E n : entier)
DÉBUT
    si n > 0 alors
        G(n-2)
        afficher n étoiles
        G(n-1)
    fin si;
FIN`}),
 L("La méthode",`<ol><li>Repère quand rien ne s'affiche (ici n ≤ 0).</li><li>Calcule G(1), puis G(2), puis G(3), en suivant l'ordre des instructions.</li><li>Pour G(n), remplace chaque appel par ce que tu as déjà trouvé.</li><li>Écris ces résultats intermédiaires sur ta copie : ils montrent ta méthode au correcteur.</li></ol><p>« afficher n étoiles » écrit n étoiles sur une ligne, puis passe à la ligne. Dans les corrigés, « / » représente ce retour à la ligne (c'est la notation du corrigé officiel du CC1 2024) : « ** / * » veut dire ** sur une ligne, puis * sur la ligne d'en dessous.</p><p>Choisis un exemple et avance pas à pas dans l'arbre des appels.</p>`,{fig:"a-arbre-appels"}),
 S("Exemple corrigé : CC1 2024, exercice 2.2","Avec la même procédure G, qu'affiche G(4) ?",[
  {w:"G(1) : G(−1) n'affiche rien, puis *, puis G(0) rien. Donc G(1) affiche *.",why:"Les appels avec n ≤ 0 n'affichent rien."},
  {w:"G(2) : G(0), puis **, puis G(1). Donc ** puis *.",why:"On réutilise G(1)."},
  {w:"G(3) : G(1), puis ***, puis G(2). Donc * / *** / ** / *.",why:"On réutilise G(1) et G(2)."},
  {w:"G(4) : G(2), puis ****, puis G(3). Donc ** / * / **** / * / *** / ** / *.",why:"Sept lignes, dans l'ordre des instructions."}]),
 Q("CC PEIP 2023 : qu'affiche G(9, 0) ? (affiche(d) écrit d à l'écran sans passer à la ligne ; aLaLigne() passe à la ligne ; n div 2 est le quotient entier de n par 2.)",["3 / 22 / 1111 / 000000000","000000000 / 1111 / 22 / 3","0 / 11 / 222 / 3333","9 / 4 / 2 / 1"],0,"G(9, 0) appelle G(4, 1), qui appelle G(2, 2), puis G(1, 3), puis G(0, 4) qui n'affiche rien. Les affichages se font en remontant : une fois 3, deux fois 2, quatre fois 1, neuf fois 0.",{code:`PROCÉDURE : G (E n : entier, E d : entier)
SPÉCIFICATIONS : n ∈ ℕ.
DÉBUT
    si n ≠ 0 alors
        G(n div 2, d+1)
        pour i de 1 à n faire affiche(d) fin pour;
        aLaLigne()
    fin si;
FIN`}),
 Q("TD 2, exercice 13. Le trajet d'un pingouin sur la banquise est représenté par une suite d'entiers entre 0 et 3, avec la correspondance 0 = ←, 1 = ↑, 2 = →, 3 = ↓. La procédure deplacerPingouin(n) déplace le pingouin d'une case dans la direction n. Le trajet suit l'algorithme ci-dessous, que le TD donne en Python (« if » veut dire « si », « and » veut dire « et »). Quels déplacements fait trajet(2) ?",["0 1 0 2, donc ← ↑ ← →","2 1 0, donc → ↑ ←","0 1 2, donc ← ↑ →","1 0 2, donc ↑ ← →"],0,"trajet(−1) et trajet(−2) ne font rien, car n < 0. trajet(0) fait un seul déplacement : 0. trajet(1) = trajet(0), trajet(−1), puis 1 : 0 1. trajet(2) = trajet(1), trajet(0), puis 2 : 0 1 0 2.",{code:`def trajet(n):
    if n>=0 and n<=3:
        trajet(n-1)
        trajet(n-2)
        deplacerPingouin(n)`,lang:"py"}),
 P("Examen de janvier 2023, exercice 3, question 4 (1,5 point), sur papier","La procédure aLaLigne() passe à la ligne suivante, la procédure affiche(E n : entier) affiche n sans passer à la ligne. Écrire l'affichage que produit l'appel G(6, 0). Écris d'abord ce qu'affichent G(1, d) et G(3, d)."+C(`Procédure : G (E n : entier, E d : entier)
Spécifications : n∈ ℕ.
Début
   Si n≠0 alors
      Pour i de 1 à n faire
         affiche(d)
      finPour
      aLaLigne()
      G(n div 2,d)
      G(n div 2,d+1)
   finSi
Fin`)+"<p>(n div 2 : le quotient de n par 2. 6 div 2 = 3, 3 div 2 = 1, 1 div 2 = 0.)</p>","<ul><li>G(0, d) n'affiche rien.</li><li>G(1, d) : une fois d, retour à la ligne, puis G(0, d) et G(0, d+1), qui n'affichent rien. Donc une seule ligne : d.</li><li>G(3, d) : trois fois d, retour à la ligne, puis G(1, d) et G(1, d+1). Donc ddd / d / d+1.</li><li>G(6, 0) : six fois 0, puis G(3, 0), puis G(3, 1). Donc 000000 / 000 / 0 / 1 / 111 / 1 / 2.</li></ul><p>Corrigé officiel :</p>"+W.code(`000000
000
0
1
111
1
2`,"txt"),["G(1, d) et G(3, d) écrits avant G(6, 0)","Le deuxième appel se fait avec d+1","7 lignes au total"],8),
 K("Comment trouver ce qu'affiche une procédure récursive ?","Chercher d'abord l'affichage pour les petites valeurs (n = 1, puis 2, puis 3), en suivant l'ordre des instructions. Pour n plus grand, remplacer chaque appel récursif par l'affichage déjà trouvé."),
 K("Dans une procédure récursive qui affiche, l'ordre entre les appels récursifs et l'instruction « afficher » change-t-il le résultat ?","Oui. « appel sur n−2, afficher, appel sur n−1 » et « appel sur n−1, afficher, appel sur n−2 » n'affichent pas les lignes dans le même ordre.")]},

/* ------------------------------------------------------------------ */
{id:"a-tableaux",t:"Tableaux 1D : accumuler, chercher, fabriquer",min:16,goal:"Écrire les fonctions de tableaux du TD 3 : 4 à 6 points à chaque CC.",steps:[
 Q("Un tableau T a 5 cases. Quels sont ses indices ?",["1 à 5","0 à 4","0 à 5","1 à 4"],1,"Les cases d'un tableau sont numérotées à partir de 0. Avec 5 cases, les indices sont 0, 1, 2, 3, 4 : le dernier est taille(T) − 1 = 4. T[5] n'existe pas, et l'utiliser est une erreur classique."),
 L("Trois schémas qui couvrent presque tout",`<p><b>Accumuler</b> (somme, produit, compteur) : initialiser avant la boucle, mettre à jour dedans, renvoyer après. <b>Chercher</b> (« tous », « il existe ») : renvoyer dès qu'on a la réponse, et l'autre réponse après la boucle. <b>Fabriquer</b> un nouveau tableau : le déclarer, le remplir case par case, le renvoyer.</p><p>Voici un exemple de chaque schéma, puis la recherche du maximum à dérouler : m garde le plus grand vu jusqu'ici.</p>`,{fig:"a-tableaux",code:`Accumuler (ici : la somme des éléments)
    som ← 0
    pour i de 0 à taille(T)-1 faire
        som ← som + T[i]
    fin pour;
    Renvoyer som

Chercher (ici : tous les éléments sont-ils plus petits que 10 ?)
    pour i de 0 à taille(T)-1 faire
        si T[i] ≥ 10 alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true

Fabriquer (ici : un nouveau tableau R, avec le double de chaque valeur)
    Variable : R : tableau de taille(T) nombres
    pour i de 0 à taille(T)-1 faire
        R[i] ← 2 * T[i]
    fin pour;
    Renvoyer R`}),
 O("CC PEIP 2023, exercice 4 (4 points) : « Écrire une fonction tousDiv3 qui, étant donné un tableau T d'entiers, renvoie true si tous les éléments de T sont divisibles par 3, false sinon. » Remets-la dans l'ordre. (T[i] mod 3 est le reste de la division de T[i] par 3 : il vaut 0 quand T[i] est divisible par 3.)",["FONCTION : tousDiv3 (E T : tableau d'entiers) : booléen","SPÉCIFICATIONS : renvoie true si tous les éléments de T sont divisibles par 3, false sinon.","DÉBUT","    pour i de 0 à taille(T)-1 faire","        si T[i] mod 3 ≠ 0 alors","            Renvoyer false","        fin si;","    fin pour;","    Renvoyer true","FIN"],"Le schéma « chercher » : false dès le premier contre-exemple, true après la boucle."),
 Q("Dans tousDiv3, que se passe-t-il si on ajoute « sinon Renvoyer true » dans la boucle, juste avant fin si; ?",["Rien ne change : true n'est renvoyé que pour une case divisible par 3","L'algorithme répond après avoir regardé seulement T[0]","Il ne s'arrête jamais : la boucle n'a plus de sortie","Il renvoie toujours true, même si une case n'est pas divisible par 3"],1,"Renvoyer arrête tout l'algorithme : au premier tour, il renverrait false ou true sans regarder les autres cases. Le true n'est sûr qu'après avoir tout parcouru.",{diag:false,ctx:true}),
 B("TD 3, exercice 14, question 3 : une fonction qui renvoie « un nouveau tableau contenant les valeurs de tab en ordre inverse ». Complète. (Ici le tableau s'appelle T. La ligne « Variable : R : tableau de taille(T) nombres » déclare un nouveau tableau R, de la même taille que T.)",`FONCTION : inverse (E T : tableau de nombres) : tableau de nombres
SPÉCIFICATIONS : renvoie un nouveau tableau avec les valeurs de T en ordre inverse.
Variable : R : tableau de taille(T) nombres
DÉBUT
    pour i de 0 à taille(T)-1 faire
        R[i] ← T[[[0]]]
    fin pour;
    Renvoyer R
FIN`,[{o:["taille(T)-1-i","taille(T)-i","i-1"],a:0}],"Pour i = 0 on veut la dernière case, d'indice taille(T) − 1 ; pour i = taille(T) − 1, la case 0."),
 S("Exemple corrigé : CC1 2024, exercice 3 (6 points)","<p>Les algorithmes de l'exercice suivant peuvent être écrits en pseudo-code ou en python.</p><p>On veut transporter des cartons par camion. Les cartons sont représentés par trois tableaux de nombres L, W et H, qui contiennent les longueurs, les largeurs et les hauteurs des cartons dans le même ordre (en m). Chaque camion peut porter un certain volume maximal Vmax (en m³).</p><ol><li>Ecrire une fonction Volume qui, étant donnés les trois tableaux L, W et H, renvoie le volume total occupé par les cartons (en m³).</li><li>Ecrire une fonction NbCamionsMin qui, étant donnés les trois tableaux L, W et H et le volume maximal Vmax, renvoie le nombre minimal de camions nécessaires pour transporter tous les cartons. Ce nombre correspond au cas où tous les camions portent le même volume.</li><li>Donner un exemple où il faut plus de camions pour transporter les cartons que ce que NbCamionsMin calcule. On pourra choisir un exemple avec L=[2,2,2] W=[1,1,1] et H=[1,1,1].</li></ol>",[
  {w:"Question 1. Volume : un accumulateur V ← 0, puis pour i de 0 à taille(L)-1 : V ← V + L[i] * W[i] * H[i], fin pour;, puis Renvoyer V.",why:"Le schéma « accumuler »."},
  {w:"Question 2. NbCamionsMin : Renvoyer ⌈Volume(L, W, H) / Vmax⌉, l'arrondi au-dessus.",why:"On réutilise la fonction précédente : c'est permis et attendu. C'est le corrigé officiel."},
  {w:"Question 3. Avec L = [2, 2, 2], W = H = [1, 1, 1] : le volume total est de 6 m³. Si on choisit Vmax = 3 m³, la fonction dit 2 camions, mais il en faut 3 : un carton de 2 m³ ne se coupe pas.",why:"Le volume total ne suffit pas : les cartons ne peuvent pas être fractionnés (corrigé officiel)."}]),
 P("TD 3 sur papier : croissant et compteEgaux","TD 3, exercice 14 (questions 5 et 2). Écris des fonctions qui, étant donné un tableau T de nombres, calculent et renvoient : (a) si la séquence des valeurs des éléments de T est croissante (true ou false) ; (b) le nombre d'éléments de T qui ont une valeur égale à e. Appelle-les croissant(T) et compteEgaux(e, T).",C(`FONCTION : croissant (E T : tableau de nombres) : booléen
SPÉCIFICATIONS : renvoie true si les valeurs de T sont dans l'ordre croissant, false sinon.
DÉBUT
    pour i de 0 à taille(T)-2 faire
        si T[i] > T[i+1] alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN

FONCTION : compteEgaux (E e : nombre, E T : tableau de nombres) : entier
SPÉCIFICATIONS : renvoie le nombre d'éléments de T égaux à e.
Variable : cpt : entier
DÉBUT
    cpt ← 0
    pour i de 0 à taille(T)-1 faire
        si T[i] = e alors
            cpt ← cpt + 1
        fin si;
    fin pour;
    Renvoyer cpt
FIN`),["croissant : la boucle s'arrête à taille(T) − 2, car on lit T[i+1]","croissant : Renvoyer false dans la boucle, Renvoyer true après","compteEgaux : cpt ← 0 avant la boucle","Les deux signatures complètes"],10),
 K("Quels sont les indices des cases d'un tableau T ?","De 0 à taille(T) − 1. T[taille(T)] n'existe pas."),
 K("Dans une fonction qui parcourt un tableau, où placer « Renvoyer » : pour calculer une somme ? pour répondre « tous les éléments vérifient… » ? pour fabriquer un nouveau tableau R ?","Somme (ou compteur) : on initialise avant la boucle, on met à jour dedans, on renvoie après la boucle. « Tous vérifient » : Renvoyer false dans la boucle dès qu'un élément ne vérifie pas, Renvoyer true après la boucle. Nouveau tableau : on déclare R, on remplit ses cases dans la boucle, Renvoyer R après.")]},

/* ------------------------------------------------------------------ */
{id:"a-tableaux2d",t:"Tableaux 2D et jeu de la vie",min:14,goal:"Parcourir un tableau 2D (TD 4, exercice 15) et compter des voisines sans sortir du tableau (TP jeu de la vie).",steps:[
 Q("Comment obtenir le nombre de colonnes d'un tableau 2D T ?",["taille(T) : c'est le nombre de cases du tableau","taille(T[i]), ou taille(T[0]) : toutes les lignes ont la même taille","taille(T) − 1 : le dernier indice d'une ligne","T[0] : la première ligne donne la largeur"],1,"taille(T) est le nombre de lignes. Une ligne T[i] est elle-même un tableau : sa taille est le nombre de colonnes."),
 L("Deux boucles imbriquées",`<p>Un <b>tableau 2D</b> (à deux dimensions) est un tableau dont chaque case est une ligne, et chaque ligne est elle-même un tableau. Exemple : T = [[1, 2, 3], [4, 5, 6]] a 2 lignes et 3 colonnes ; T[0] est la première ligne, [1, 2, 3], et T[1][2] vaut 6. Nombre de lignes : taille(T). Nombre de colonnes : taille(T[0]).</p><p>T[i][j] est la case de la ligne i, colonne j. On parcourt toutes les cases avec deux boucles pour : les lignes, puis dans chaque ligne, les colonnes.</p><p>Le jeu de la vie du TP : une case vivante survit avec 2 ou 3 voisines vivantes ; une case morte naît avec exactement 3 voisines. Les <b>voisines</b> d'une case sont les 8 cases qui la touchent, par un côté ou par un coin (il y en a moins au bord de la grille). Clique sur « Mode : compter les voisines ».</p>`,{fig:"a-tableaux-2d",code:`pour i de 0 à taille(T)-1 faire
    pour j de 0 à taille(T[i])-1 faire
        … T[i][j] …
    fin pour;
fin pour;`}),
 B("La somme des éléments d'un tableau 2D (cours p. 32).",`FONCTION : somElem (E T : tableau 2D d'entiers) : entier
SPÉCIFICATIONS : calcule et renvoie la somme des éléments de T.
Variable : som : entier
DÉBUT
    som ← 0
    pour i de 0 à taille(T)-1 faire
        pour j de 0 à [[0]] faire
            som ← som + T[i][j]
        fin pour;
    fin pour;
    [[1]]
FIN`,[{o:["taille(T[i])-1","taille(T)-1","taille(T[i])"],a:0},{o:["Renvoyer som","Renvoyer T","afficher som"],a:0}],"Les colonnes de la ligne i vont de 0 à taille(T[i]) − 1 ; on renvoie après les deux fin pour;."),
 Q("Jeu de la vie : une case vivante a 4 voisines vivantes. À la génération suivante ?",["Elle reste vivante","Elle meurt"],1,"Une vivante ne survit qu'avec 2 ou 3 voisines : avec 4, elle meurt (surpopulation).",{diag:false,ctx:true}),
 Q("Dans le jeu de la vie, G est la grille (un tableau 2D) et (a, b) est la position d'une voisine de la case (i, j). Pourquoi écrire « a ≥ 0 et a < taille(G) et … » avant de lire G[a][b] ?",["Pour aller plus vite : on évite de lire les cases vides","Pour ne pas lire une case hors du tableau, au bord : le « et » s'arrête au premier faux","Ce n'est pas nécessaire : une case hors du tableau vaut 0","Pour ne pas compter la case (i, j) parmi ses propres voisines"],1,"Au bord, une case a moins de 8 voisines. Grâce à l'évaluation paresseuse, G[a][b] n'est jamais lu si a ou b est hors du tableau. Lire G[a][b] avec a ou b hors du tableau est une erreur, pas un 0. Et la case (i, j) s'exclut avec un autre test."),
 P("TD 4, exercice 15, sur papier","Écris une fonction qui, étant donné un tableau à deux dimensions, calcule sa moyenne arithmétique (somme des valeurs / nombre de valeurs) et sa moyenne géométrique (produit des valeurs puissance (1 / nombre de valeurs)). (On suppose que les valeurs sont des nombres strictement positifs.)",C(`FONCTION : moyennes (E T : tableau 2D de nombres) : tableau de 2 nombres
SPÉCIFICATIONS : les valeurs de T sont > 0. Renvoie [moyenne arithmétique, moyenne géométrique].
Variable : som, prod : nombre ; nb : entier ; R : tableau de 2 nombres
DÉBUT
    som, prod, nb ← 0, 1, 0
    pour i de 0 à taille(T)-1 faire
        pour j de 0 à taille(T[i])-1 faire
            som ← som + T[i][j]
            prod ← prod * T[i][j]
            nb ← nb + 1
        fin pour;
    fin pour;
    R[0] ← som / nb
    R[1] ← prod ^ (1 / nb)
    Renvoyer R
FIN`)+"<p>« som, prod, nb ← 0, 1, 0 » range 0 dans som, 1 dans prod et 0 dans nb. Le signe ^ est la puissance. L'énoncé demande deux résultats : ici la fonction les renvoie dans un tableau R de 2 cases.</p><p>On peut aussi écrire deux fonctions séparées. Avec [[1, 2], [4, 8]] : 15/4 = 3,75 et 64^(1/4) = 2√2 ≈ 2,83.</p>",["som part de 0, prod part de 1","Deux pour imbriqués, chacun avec son fin pour;","Le nombre de valeurs compté ou calculé","Le résultat renvoyé après les boucles"],10),
 K("Comment parcourir toutes les cases d'un tableau 2D T ?","pour i de 0 à taille(T)-1 faire, pour j de 0 à taille(T[i])-1 faire … T[i][j] … fin pour; fin pour;"),
 K("Dans le jeu de la vie, chaque case devient vivante ou morte selon le nombre de ses voisines vivantes. Pourquoi faut-il calculer la génération suivante dans un nouveau tableau ?","Parce que chaque case doit compter ses voisines dans la génération actuelle. Si on modifiait la grille au fur et à mesure, on lirait des cases déjà changées.")]},

/* ------------------------------------------------------------------ */
{id:"a-dicos",t:"Les dictionnaires : clé, valeur, compareDicos",min:13,goal:"Déclarer, lire et parcourir un dictionnaire en pseudo-code, et refaire l'exercice compareDicos du cours (p. 34 à 37).",steps:[
 Q("Dans un tableau, une valeur est repérée par sa position. Et dans un dictionnaire ?",["Par une chaîne de caractères, la clé","Par sa position aussi, comme T[0], T[1]…","Par sa valeur, qu'on cherche dans le dictionnaire","Par un entier, son numéro d'ajout"],0,"Cours p. 34 : chaque valeur est repérée par une clé, une chaîne de caractères."),
 L("Le dictionnaire",`<p>Un <b>dictionnaire</b> représente une donnée qui a plusieurs composantes. Chaque valeur est repérée par une <b>clé</b> (une chaîne de caractères), et non par une position. Une clé avec sa valeur forme un <b>champ</b>. Les valeurs n'ont pas forcément le même type, contrairement à un tableau.</p><p>En pseudo-code (cours p. 35) :</p>${C(`D : dictionnaire('taille': nombre, 'age': entier, 'majeur': booléen)
D['taille'] ← 168
pour k dans D faire
    ...
fin pour;
si k dans D alors
    ...
fin si;`)}<p>D['taille'] donne 168. « pour k dans D » parcourt les <b>clés</b>. « k dans D » teste si la clé k existe.</p>`),
 Q("Que parcourt « pour k dans D faire » ?",["Les clés de D","Les valeurs de D","Les positions 0, 1, 2…"],0,"« pour k dans D » fait prendre à k chaque clé du dictionnaire, une par une, comme 'taille', puis 'age'. Pour obtenir la valeur rangée sous cette clé, on écrit D[k]. La boucle ne parcourt donc pas les valeurs directement."),
 B("Cours p. 36 : complète compareDicos, qui renvoie True si les deux dictionnaires sont identiques (mêmes clés, mêmes valeurs), False sinon. Le cours écrit ici True et False avec une majuscule. « non(…) » inverse un booléen.",`FONCTION : compareDicos (E D1, D2 : dictionnaires) : booléen
SPÉCIFICATIONS : Renvoie True si les deux dictionnaires sont identiques et faux sinon
DÉBUT
    pour k dans D1 faire
        si non(k dans [[0]]) ou non(D1[k] = [[1]]) alors
            Renvoyer False
        fin si;
    fin pour;
    pour k dans [[2]] faire
        si non(k dans D1) alors
            Renvoyer False
        fin si;
    fin pour;
    Renvoyer True
FIN`,[{o:["D1","D2"],a:1},{o:["D2[k]","D1[k]","k"],a:0},{o:["D1","D2"],a:1}],"Première boucle : chaque clé de D1 existe dans D2, avec la même valeur. Deuxième boucle : D2 n'a pas de clé en plus (sinon D1 serait seulement « inclus » dans D2)."),
 Q("Pourquoi faut-il la deuxième boucle de compareDicos ?",["Pour vérifier que D2 n'a pas de clé absente de D1","Pour vérifier les valeurs une deuxième fois","Elle ne sert à rien"],0,"Après la première boucle, on sait seulement que D1 est contenu dans D2. Le prof l'a noté : « D2 a des clés en plus de D1 ».",{diag:false,ctx:true}),
 P("Deux fonctions sur un dictionnaire, sur papier","<p>(Entraînement écrit par moi : la feuille de TD n'a pas d'exercice sur les dictionnaires, et ils ne sont dans aucun ancien sujet de CC1.)</p><ol><li>Écris la fonction sommeValeurs (E D : dictionnaire) : nombre, qui renvoie la somme des valeurs de D. On suppose que toutes les valeurs de D sont des nombres.</li><li>Écris la fonction nbClesCommunes (E D1, D2 : dictionnaires) : entier, qui renvoie le nombre de clés de D1 qui sont aussi des clés de D2.</li></ol>",C(`FONCTION : sommeValeurs (E D : dictionnaire) : nombre
SPÉCIFICATIONS : toutes les valeurs de D sont des nombres ; renvoie leur somme.
Variable : s : nombre
DÉBUT
    s ← 0
    pour k dans D faire
        s ← s + D[k]
    fin pour;
    Renvoyer s
FIN

FONCTION : nbClesCommunes (E D1, D2 : dictionnaires) : entier
SPÉCIFICATIONS : renvoie le nombre de clés de D1 qui sont aussi des clés de D2.
Variable : n : entier
DÉBUT
    n ← 0
    pour k dans D1 faire
        si k dans D2 alors
            n ← n + 1
        fin si;
    fin pour;
    Renvoyer n
FIN`),["« pour k dans D faire » : k prend chaque clé","La valeur s'écrit D[k], pas k","s ← 0 (ou n ← 0) avant la boucle, Renvoyer après","Le test « k dans D2 » pour savoir si une clé existe","Les deux signatures complètes, avec E devant les paramètres"],6),
 K("Avec un dictionnaire D, comment écrit-on : sa déclaration, la modification d'une valeur, le parcours de ses clés, le test « cette clé existe » ?","Déclaration D : dictionnaire('taille': nombre, …) ; modification D['taille'] ← 168 ; parcours des clés « pour k dans D faire … fin pour; » ; test « si k dans D alors »."),
 K("Comment vérifier que deux dictionnaires D1 et D2 ont exactement les mêmes clés, avec les mêmes valeurs ?","Première boucle, sur les clés de D1 : chaque clé doit être dans D2 avec la même valeur. Deuxième boucle, sur les clés de D2 : chaque clé doit être dans D1 (sinon D2 a des clés en plus). Dès qu'un test échoue, Renvoyer false ; à la fin, Renvoyer true.")]},

/* ------------------------------------------------------------------ */
{id:"a-listes",t:"Les listes : tête, queue, cons, et le schéma récursif",min:16,goal:"Évaluer des expressions sur les listes (TD 5) et écrire une fonction récursive sur une liste : 2,5 à 4 points à chaque CC.",steps:[
 Q("Que vaut tête(queue([2, 3, 2, 4])) ?",["2","3","[3, 2, 4]","erreur"],1,"On calcule de l'intérieur vers l'extérieur. queue enlève le premier élément : queue([2, 3, 2, 4]) = [3, 2, 4]. Puis tête prend le premier élément de cette liste : tête([3, 2, 4]) = 3. C'est donc le deuxième élément de la liste de départ."),
 L("Les quatre opérations",`<p>Une <b>liste</b> est une suite d'éléments, écrite entre crochets : [2, 3, 2, 4]. La liste vide s'écrit [ ]. Les feuilles de TD écrivent [2 3 2 4], sans virgules : c'est la même liste.</p><ul><li><b>tête(L)</b> : le premier élément (un élément, pas une liste). Erreur si L est vide.</li><li><b>queue(L)</b> : la liste sans son premier élément. Erreur si L est vide.</li><li><b>cons(x, L)</b> : une nouvelle liste avec x devant.</li><li><b>estVide(L)</b> : true si L = [ ], false sinon.</li></ul><p>Pas d'indice L[2] sur une liste : on n'y accède que par le début. Essaie, puis fais l'exercice du cours pas à pas.</p>`,{fig:"a-listes"}),
 Q("TD 5, exercice 17 : « Dans les expressions suivantes, substituez à li la liste [2 3 2 4], puis calculez la valeur de l'expression obtenue. » Que vaut estVide(tête(li)) ?",["true","false","erreur"],2,"tête(li) = 2 est un nombre, pas une liste : estVide ne s'y applique pas. Erreur de type.",{diag:false}),
 L("Le schéma récursif",`<p>Presque toutes les fonctions sur les listes suivent le même schéma : un <b>cas de base</b> sur la liste vide (ou à un élément), sinon on traite tête(L) et on rappelle la fonction sur queue(L).</p><p>En itératif, on avance dans une copie M de la liste : M ← queue(M), jusqu'à ce qu'elle soit vide (cours p. 40). Choisis un exemple et regarde les appels.</p>`,{fig:"a-listes-rec",code:`Renvoyer cond(estVide(L), cas de base, … tête(L) … f(queue(L)) …)`}),
 B("Cours p. 40 : complète longueurR, qui renvoie la longueur d'une liste (son nombre d'éléments), en récursif.",`FONCTION : longueurR (E L : liste d'entier) : entier
SPÉCIFICATIONS : renvoie la longueur de la liste L.
DÉBUT
    Renvoyer cond(estVide(L), [[0]], 1 + [[1]])
FIN`,[{o:["0","1","[ ]"],a:0},{o:["longueurR(queue(L))","longueurR(L)","queue(L)"],a:0}],"Cas de base : la liste vide a 0 élément. Sinon, la liste a un élément de plus que sa queue : 1 + longueurR(queue(L))."),
 O("CC1 2024, sujet B, exercice 1 (2,5 points) : « Écrire un algorithme en pseudo-code qui renvoie le plus grand élément d'une liste d'entiers. » Remets plusgrand dans l'ordre. (max(a, b) renvoie le plus grand de a et b.)",["FONCTION : plusgrand (E L : liste d'entiers) : entier","SPÉCIFICATIONS : L non vide. Renvoie le plus grand élément de L.","DÉBUT","    si estVide(queue(L)) alors","        Renvoyer tête(L)","    sinon","        Renvoyer max(tête(L), plusgrand(queue(L)))","    fin si;","FIN"],"Le cas de base est la liste à un seul élément : estVide(queue(L)). Le corrigé officiel tient en une ligne : Renvoyer cond(estVide(queue(L)), tête(L), max(tête(L), plusgrand(queue(L))))."),
 Q("CC1 2024, sujet A, exercice 1 (2,5 points) : « Écrire un algorithme en pseudo-code qui renvoie l'avant-dernière valeur d'une liste d'entiers. » On l'appelle avantdernier(L), et L contient au moins 2 éléments. Quel est le cas de base ?",["estVide(L) : alors il n'y a plus rien à lire","estVide(queue(L)) : alors l'avant-dernier est tête(L)","estVide(queue(queue(L))) : alors l'avant-dernier est tête(L)","tête(L) = 0 : une liste se termine par 0"],2,"Si L a exactement deux éléments, l'avant-dernier est le premier. Sinon : avantdernier(queue(L)). Corrigé officiel : Renvoyer cond(estVide(queue(queue(L))), tête(L), avantdernier(queue(L))). Si queue(L) est vide, L n'a qu'un élément : tête(L) est le dernier, pas l'avant-dernier."),
 L("D'un tableau à une liste",`<p>cons ajoute <b>devant</b>. Si on parcourt le tableau dans l'ordre, la liste sort à l'envers : le dernier élément ajouté se retrouve en tête.</p><p>Pour garder l'ordre du tableau, on le parcourt <b>à l'envers</b> :</p>`,{code:`L ← [ ]
pour i de taille(T)-1 à 0 par pas de -1 faire
    L ← cons(T[i], L)
fin pour;`,lang:"pseudo"}),
 P("CC PEIP 2023, exercice 5 (4 points)","Écris une fonction tousles3 qui, étant donné un tableau T d'entiers, renvoie la liste des éléments de T divisibles par 3, dans le même ordre que dans T.",C(`FONCTION : tousles3 (E T : tableau d'entiers) : liste d'entiers
SPÉCIFICATIONS : renvoie la liste des éléments de T divisibles par 3, dans le même ordre que dans T.
Variable : L : liste d'entiers
DÉBUT
    L ← [ ]
    pour i de taille(T)-1 à 0 par pas de -1 faire
        si T[i] mod 3 = 0 alors
            L ← cons(T[i], L)
        fin si;
    fin pour;
    Renvoyer L
FIN`)+"<p>cons ajoute devant : on parcourt le tableau à l'envers pour garder l'ordre.</p>",["L ← [ ] avant la boucle","Le parcours à l'envers, avec « par pas de -1 »","cons(T[i], L), dans le bon ordre des paramètres","Renvoyer L après fin pour;"],8),
 K("Que font les quatre opérations du cours sur une liste L : tête(L), queue(L), cons(x, L) et estVide(L) ?","tête(L) : le premier élément. queue(L) : la liste sans son premier élément. cons(x, L) : la liste L avec x ajouté devant. estVide(L) : vrai si L est la liste vide [ ]. Une liste n'a pas d'indices : L[2] n'existe pas."),
 K("Quelle est la forme générale d'une fonction récursive f sur une liste L ? Comment teste-t-on que L n'a qu'un seul élément ?","cond(estVide(L), valeur du cas de base, un calcul avec tête(L) et f(queue(L))). Un seul élément : estVide(queue(L))."),
 K("cons ajoute un élément devant une liste. Comment ranger les éléments d'un tableau T dans une liste L en gardant le même ordre ?","On part de la liste vide et on parcourt le tableau à l'envers (pour i de taille(T)-1 à 0 par pas de -1), en faisant L ← cons(T[i], L) : le dernier ajouté, T[0], se retrouve en tête.")]},

/* ------------------------------------------------------------------ */
{id:"a-piles",t:"Piles et files : le casse-tête du cours",min:22,goal:"Calculer l'état d'une pile après chaque instruction, en repérant les instructions interdites (cours p. 44 et 46).",steps:[
 Q("On empile 1, puis 2, puis 3, puis on dépile une fois. Que renvoie depiler ?",["1","2","3","[1, 2]"],2,"Une pile : dernier arrivé, premier sorti. On reprend l'assiette posée en dernier."),
 L("Piles et files",`<ul><li>Pile : <b>empiler(E élément, ES pile)</b>, <b>depiler(ES pile) : élément</b> (enlève le sommet et le renvoie), <b>estVide(E pile)</b>.</li><li>File : <b>enfiler(E élément, ES file)</b>, <b>defiler(ES file) : élément</b> (le premier arrivé), estVide.</li><li>Interdit sur une pile : un indice P[1], tête, queue ou cons.</li></ul><p>Vider une pile dans une autre (un <b>transvasement</b>) inverse l'ordre de ses éléments. Fais le casse-tête du cours pas à pas.</p>`,{fig:"a-piles-files"}),
 Q("P contient 1, 2, 3 (3 au sommet). Que fait « afficher tête(P) » ?",["Affiche 3 : tête(P) lit le sommet sans le retirer","Affiche 1 : le premier élément empilé","C'est une erreur : tête est réservé aux listes"],2,"Sur une pile, on n'a que empiler, depiler et estVide. Pour connaître le sommet, il faut le dépiler."),
 Q("Pour inverser l'ordre de P avec deux piles auxiliaires Q et R, combien de transvasements faut-il ?",["1","2","3","4"],2,"Chaque transvasement inverse l'ordre : P vers Q, Q vers R, puis R vers P. Il en faut un nombre impair pour finir dans P, inversée."),
 O("Cours p. 45 : la procédure doublePile double chaque valeur d'une pile P d'entiers, sans changer leur ordre. Remets-la dans l'ordre. (Q ← [ ] crée une pile vide Q ; depiler(P) enlève le sommet de P et le renvoie ; empiler(x, Q) pose x sur Q.)",["PROCÉDURE : doublePile (ES P : pile d'entier)","SPÉCIFICATIONS : double les valeurs de P.","Variable : Q : pile d'entier","DÉBUT","    Q ← [ ]","    tant que non estVide(P) faire","        empiler(2*depiler(P), Q)","    fin tq;","    tant que non estVide(Q) faire","        empiler(depiler(Q), P)","    fin tq;","FIN"],"Le premier transvasement double et inverse ; le second remet dans l'ordre."),
 B("Cours, diapo 50 : complète inverseFile, qui inverse l'ordre des éléments de la file F en se servant d'une pile P.",`PROCÉDURE : inverseFile (ES F : file d'entier)
SPÉCIFICATIONS : Inverse l'ordre des éléments de la file F
Variable : P : pile d'entier
DÉBUT
    P ← [ ];
    tant que non estVide([[0]]) faire
        empiler([[1]], P)
    fin tq;
    tant que non estVide([[2]]) faire
        enfiler([[3]], F)
    fin tq;
FIN`,[{o:["F","P"],a:0},{o:["defiler(F)","depiler(F)","F"],a:0},{o:["P","F"],a:0},{o:["depiler(P)","defiler(P)","P"],a:0}],"On vide la file dans la pile, puis la pile dans la file. La pile rend les éléments dans l'ordre inverse : le dernier empilé ressort le premier. (Réponses du prof sur la diapo annotée.)"),
 P("Cours, diapos 44 et 49 : la pile, puis la file, après chaque étape",`<p>« À vous de jouer ! Calculer la valeur de la pile P après chaque étape »</p>${C(`Variable : P : pile d'entiers
P ← []
Pour i de 1 à 3 faire
   empiler(i,P)
finPour
empiler(depiler(P),P)
empiler(P[1],P)
empiler(P,4)
P ← cons(3,P)
depiler(P)
depiler(P)
depiler(P)
depiler(P)`)}<p>« À vous de jouer ! Calculer la valeur de la file F après chaque étape »</p>${C(`Variable : F : file d'entiers
F ← []
Pour i de 1 à 3 faire
   enfiler(i,F)
finPour
enfiler(defiler(F),F)
enfiler(F[1],F)
enfiler(F,4)
F ← cons(3,F)
defiler(F)
defiler(F)
defiler(F)
defiler(F)`)}<p>(Précisions de ma part : écris la pile entre crochets, le sommet à droite, comme [1, 2, 3] ; pour la file, le premier arrivé à gauche. Quand une instruction est interdite, écris ERREUR et passe à la suivante sans rien changer.)</p>`,`<p>Réponses du prof (cours annoté), d'abord la pile :</p>${C(`Variable : P : pile d'entiers      ?  (pas encore de valeur)
P ← []                             [ ]
Pour i de 1 à 3 faire
   empiler(i,P)                    [1] puis [1, 2] puis [1, 2, 3]
finPour
empiler(depiler(P),P)              [1, 2, 3]
empiler(P[1],P)                    ERREUR
empiler(P,4)                       ERREUR
P ← cons(3,P)                      ERREUR
depiler(P)                         [1, 2]
depiler(P)                         [1]
depiler(P)                         [ ]
depiler(P)                         ERREUR`)}<ul><li>empiler(depiler(P),P) : depiler(P) vaut 3 et P vaut [1, 2] ; puis on exécute « empiler(3, [1, 2]) ». La pile redevient [1, 2, 3].</li><li>empiler(P[1],P) : un indice comme P[1], c'est pour les tableaux seulement.</li><li>empiler(P,4) : les paramètres sont dans le mauvais ordre. L'ordre est empiler(élément, pile).</li><li>P ← cons(3,P) : cons, c'est pour les listes seulement.</li><li>Le dernier depiler(P) : la pile est vide, il n'y a plus rien à dépiler.</li></ul><p>Puis la file :</p>${C(`Variable : F : file d'entiers      ?
F ← []                             [ ]
Pour i de 1 à 3 faire
   enfiler(i,F)                    [1, 2, 3]
finPour
enfiler(defiler(F),F)              [2, 3, 1]
enfiler(F[1],F)                    ERREUR
enfiler(F,4)                       ERREUR
F ← cons(3,F)                      ERREUR
defiler(F)                         [3, 1]
defiler(F)                         [1]
defiler(F)                         [ ]
defiler(F)                         ERREUR`)}<ul><li>enfiler(defiler(F),F) : defiler(F) vaut 1 (le premier arrivé) et F vaut [2, 3] ; puis on exécute « enfiler(1, [2, 3]) ». Le 1 se retrouve à la fin : [2, 3, 1]. C'est la différence avec la pile, qui ne changeait pas.</li><li>Les trois ERREUR ont les mêmes raisons que pour la pile.</li><li>Les defiler enlèvent toujours le premier : 2, puis 3, puis 1.</li></ul>`,["Pile : la boucle donne [1], [1, 2], [1, 2, 3]","Pile : empiler(depiler(P), P) ne change rien à la fin","File : enfiler(defiler(F), F) envoie le premier à la fin, [2, 3, 1]","Trois ERREUR au milieu à chaque fois : l'indice, l'ordre des paramètres, cons","Un dernier ERREUR : on enlève un élément d'une pile ou d'une file vide"],10),
 K("Quelle est la différence entre une pile et une file ?","Pile : dernier arrivé, premier sorti (empiler, depiler). File : premier arrivé, premier sorti (enfiler, defiler)."),
 K("Quelles écritures sont interdites sur une pile P dans le pseudo-code du cours ?","Un indice comme P[1], et les opérations de liste tête, queue, cons. Attention aussi à l'ordre des arguments : on écrit empiler(élément, pile), pas empiler(P, x).")]},

/* ------------------------------------------------------------------ */
/* Validité et complexité : faites en amphi (cours annoté déposé le 9/11, diapos 52 à 86), pas en TD.
   Les CC de 2022 et 2024 avaient des questions dessus : deux leçons « au cas où », après l'examen blanc. */
{id:"a-amphi-preuve",t:"Au cas où : prouver une boucle (vu en amphi)",min:12,goal:"Répondre à une question de cours ou à un exercice sur la validité d'un algorithme, comme aux CC de 2022 et 2024. Fait en amphi, pas en TD : je ne sais pas si ça tombe.",steps:[
 L("Pourquoi cette leçon",`<ul><li>Le prof a déposé sur Moodle son cours annoté jusqu'à la diapo 86 : la validité (prouver qu'un algorithme est juste) et la complexité (compter ses opérations) ont été faites en amphi. Les TD 6 à 8 sur ces chapitres ne sont pas faits.</li><li>Le mail de ton chargé de TD, le 5 novembre : le CC « portera sur les notions abordées jusqu'à présent ».</li><li>CC d'octobre 2022 : deux questions de cours sur ces chapitres, et un exercice de 5 points (trace, arrêt, invariant). CC1 de novembre 2024 : deux questions de cours sur ces chapitres.</li></ul><p><b>Je ne sais pas si ça tombe demain.</b> Cette leçon et la suivante te donnent de quoi répondre : les mots du cours, les réponses des corrigés officiels, et l'exercice de 2022. Si tu manques de temps, recopie seulement les 3 blocs de la page « Au cas où » sur ta feuille, s'il y reste de la place (15 minutes).</p>`),
 L("Les mots du cours",`<p>Une <b>itération</b>, c'est un tour de boucle. Un algorithme <b>itératif</b> est un algorithme qui contient une boucle.</p><p><b>Un algorithme est valide s'il résout le problème qu'il est censé résoudre</b> (diapo 53).</p><p>Vocabulaire (diapo 54) :</p><ul><li><b>équation d'itération</b> : égalité reliant les valeurs des variables d'une itération à la suivante ; ce sera notre <b>vérité</b> ;</li><li><b>invariant de boucle</b> : propriété censée être vraie au début des itérations et à la fin de chaque itération ; ce sera notre <b>hypothèse à prouver</b>.</li></ul><p><b>Notation.</b> var<sub>i</sub> : valeur de var à la fin de l'itération n°i. Si i commence à 1, on ajoute la valeur i = 0 pour le début des itérations.</p><p><b>Méthode</b> (diapo 56) :</p><ol><li>« lire » les équations d'itération sur l'algorithme (vérité) ;</li><li>chercher un invariant de boucle (hypothèse) ;</li><li>prouver l'hypothèse par récurrence en utilisant la vérité : l'hypothèse devient une vérité ;</li><li>écrire cette vérité à la fin des itérations pour prouver l'algorithme.</li></ol><p>Le sujet de 2024 appelait les équations d'itération « équations de récurrence ».</p>`),
 L("L'exemple du cours : F1 calcule n!",`<p>n! (« factorielle de n ») = 1 × 2 × … × n, et 0! = 1.</p>${C(`FONCTION : F1 (E n : entier) : entier
SPÉCIFICATIONS : Calcule n! avec n ∈ ℕ
Variable : res : entier
DÉBUT
    res ← 1
    pour i de 1 à n faire
        res ← res * i
    fin pour;
    Renvoyer res
FIN`)}<p>La preuve du cours (diapo 57). res<sub>i</sub> est la valeur de res à la fin de l'itération i.</p><ol><li><b>Équation d'itération</b> : res<sub>0</sub> = 1 et si i > 0, res<sub>i</sub> = res<sub>i−1</sub> × i.</li><li><b>Invariant proposé</b> : Inv<sub>i</sub> : « res<sub>i</sub> = i! ».</li><li><b>Preuve de l'invariant</b> :<ul><li><b>Initialisation</b> : au début des itérations, res<sub>0</sub> = 1 (vérité) donc res<sub>0</sub> = 0! donc Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : si Inv<sub>i−1</sub> est vrai (1 ≤ i ≤ n), c'est-à-dire si res<sub>i−1</sub> = (i − 1)!, comme res<sub>i</sub> = res<sub>i−1</sub> × i (vérité), alors res<sub>i</sub> = (i − 1)! × i = i!, c'est-à-dire Inv<sub>i</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul></li><li>À la fin des n itérations, l'invariant (nouvelle vérité) s'écrit res<sub>n</sub> = n!. La valeur renvoyée est la valeur attendue : l'algorithme est valide.</li></ol>`),
 Q("Dans la preuve de F1, laquelle de ces égalités est l'équation d'itération ?",["res<sub>i</sub> = res<sub>i−1</sub> × i","res<sub>i</sub> = i!","res<sub>n</sub> = n!"],0,"On la lit sur l'algorithme, à la ligne « res ← res * i » : c'est la vérité. « res<sub>i</sub> = i! » est l'invariant : une hypothèse, qu'il faut prouver. « res<sub>n</sub> = n! » est la conclusion, à la fin des itérations."),
 Q("CC1 de novembre 2024, question de cours : « Dans une preuve de validité d'un algorithme itératif, à quoi servent les équations de récurrence ? » (Cette année, le cours les appelle équations d'itération.)",["Elles traduisent le fonctionnement de l'algorithme en relations entre les variables, et permettent de montrer que l'invariant reste vrai d'une itération à la suivante","Elles prouvent que la boucle s'arrête, en montrant qu'une quantité entière décroît strictement à chaque itération","Elles donnent le nombre d'opérations de l'algorithme, itération par itération, pour en calculer la complexité","Elles donnent la valeur des variables avant la première itération, pour initialiser l'invariant de boucle"],0,"Corrigé officiel, à écrire sur ta copie : « Elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables. Elles permettent de montrer qu'un invariant est héréditaire, c'est à dire que s'il est vrai à l'itération n, alors il est vrai à l'itération n+1. » La terminaison se prouve avec une quantité qui décroît, la complexité en comptant les opérations : ce ne sont pas les équations d'itération."),
 L("Et l'arrêt d'une boucle tant que ?",`<p>Une boucle pour fait un nombre de tours connu d'avance : elle s'arrête toujours. Pour une boucle <b>tant que</b>, il faut le montrer.</p><p>Le modèle du cours (diapo 95, dans le chapitre suivant, pas encore fait en amphi) : on trouve une quantité entière qui <b>décroît strictement à chaque itération</b>, et on dit pour quelle valeur le tant que s'arrête. « Il y a donc un nombre fini d'itérations. Chaque itération se termine. Donc l'algorithme se termine. »</p><p>Exemple, avec la boucle de l'algorithme Cube du cours (diapo 58), où n est un entier naturel :</p>${C(`A, B, C, Z ← 1, 0, n, 0 ;
tant que C > 0 faire
    Z ← Z+A+B ;
    B ← B+A+A+1 ;
    A, C ← A+3, C-1 ;
fin tq;`)}<p>C est un entier naturel, initialisé à n. Il décroît strictement à chaque itération (C ← C-1). Le tant que s'arrête lorsqu'il vaut 0. Il y a donc un nombre fini d'itérations (n itérations), donc l'algorithme se termine.</p><p>Quand la variable du test augmente jusqu'à une borne, on dit la même chose dans l'autre sens : d'où elle part, de combien elle augmente à chaque itération, et après combien d'itérations le test devient faux.</p>`),
 Q("TD 6, exercice 24 (n est un entier positif). Pourquoi cette boucle s'arrête-t-elle ?",["i est initialisé à 0 et augmente de 1 à chaque itération : après n itérations, i = n et le test i ≠ n est faux","r diminue à chaque itération : quand il atteint 0, le test devient faux","Une boucle tant que s'arrête toujours : son test finit par devenir faux","L'invariant est vrai à chaque itération : c'est lui qui garantit l'arrêt"],0,"C'est la phrase à écrire. r ne sert pas au test. Et une boucle tant que peut tourner sans fin : dans la leçon sur les boucles, « i ← 5 » puis « i ← i − 2 » tant que i ≠ 0 ne s'arrête jamais. L'invariant prouve que le résultat est juste, pas que la boucle s'arrête.",{code:`i, r, x ← 0, 1, 0
tant que i ≠ n faire
    i ← i + 1
    r ← r + x - i
    x ← x + 3
fin tq;`}),
 P("CC d'octobre 2022, exercice 3 (5 points), sur papier",`<p>On considère l'algorithme suivant :</p>${C(`Fonction : G (E N : entier) : entier
Spécifications : N est un entier naturel. Calcule (N+1)².
Variables : i, j, k : entier
Début
   i, j, k ← 0, 0, 1
   Tant que i<N faire
      i ← i+1
      j ← i+i
      k ← j+k+1
   finTantQue
   Renvoyer k
Fin`)}<ol><li>On appelle j<sub>i</sub> et k<sub>i</sub> les valeurs de j et k à <b>la fin</b> de la i-ème itération. Compléter la trace de l'algorithme pour N=5 : un tableau à trois colonnes (i, j<sub>i</sub>, k<sub>i</sub>), une ligne pour chaque i de 0 à 5.</li><li>Prouver que l'algorithme se termine.</li><li>Parmi les invariants suivants, lequel semble correct : k<sub>i</sub> = 2i + 1 ; k<sub>i</sub> = 2i − 1 ; k<sub>i</sub> = i² ; k<sub>i</sub> = (i + 1)² ?</li><li>En admettant que cet invariant soit correct, expliquez pourquoi l'algorithme renvoie le bon résultat.</li></ol>`,`<p><b>Corrigé officiel.</b></p><p><b>1.</b></p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th class="var">i</th><th class="var">j<sub>i</sub></th><th class="var">k<sub>i</sub></th></tr></thead><tbody><tr><td>0</td><td>0</td><td>1</td></tr><tr><td>1</td><td>2</td><td>4</td></tr><tr><td>2</td><td>4</td><td>9</td></tr><tr><td>3</td><td>6</td><td>16</td></tr><tr><td>4</td><td>8</td><td>25</td></tr><tr><td>5</td><td>10</td><td>36</td></tr></tbody></table></div><p><b>2.</b> i est initialisé à 0 et augmente de 1 à chaque itération. Après N itérations, i = N donc la boucle se termine et l'algorithme aussi.</p><p><b>3.</b> k<sub>i</sub> = (i + 1)² (lecture sur le tableau de valeurs).</p><p><b>4.</b> À la fin du TantQue, i = N donc l'algorithme renvoie k<sub>N</sub> = (N + 1)².</p><p><b>En plus, si on te demande de prouver l'invariant</b> (écrit par moi, avec la méthode du cours) :</p><ul><li>Équations d'itération : j<sub>0</sub> = 0, k<sub>0</sub> = 1 et, pour i > 0, j<sub>i</sub> = i + i = 2i, k<sub>i</sub> = j<sub>i</sub> + k<sub>i−1</sub> + 1 = k<sub>i−1</sub> + 2i + 1.</li><li>Invariant : Inv<sub>i</sub> : « k<sub>i</sub> = (i + 1)² ».</li><li>Initialisation : k<sub>0</sub> = 1 = (0 + 1)², donc Inv<sub>0</sub> est vrai.</li><li>Récurrence : si Inv<sub>i−1</sub> est vrai, c'est-à-dire si k<sub>i−1</sub> = i², comme k<sub>i</sub> = k<sub>i−1</sub> + 2i + 1, alors k<sub>i</sub> = i² + 2i + 1 = (i + 1)² : Inv<sub>i</sub> est vrai.</li><li>Conclusion : l'invariant est vrai pour toutes les itérations.</li></ul>`,["Le tableau de trace : 6 lignes, de i = 0 à i = 5","L'arrêt : d'où part i, de combien il augmente, quand le test devient faux","L'invariant lu sur le tableau : k<sub>i</sub> = (i + 1)²","La conclusion : à la fin du tant que, i = N, donc k<sub>N</sub> = (N + 1)²"],9),
 K("À quoi servent les équations d'itération (« équations de récurrence » dans le sujet de 2024) ?","Elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables. Elles permettent de montrer qu'un invariant est héréditaire : s'il est vrai à une itération, il est vrai à la suivante. (Corrigé officiel du CC1 2024.)"),
 K("Quelles sont les 4 étapes pour prouver la validité d'un algorithme itératif (avec une boucle) ?","1. Lire les équations d'itération sur l'algorithme (vérité). 2. Chercher un invariant de boucle (hypothèse). 3. Prouver l'hypothèse par récurrence en utilisant la vérité : initialisation, récurrence, conclusion. 4. Écrire cette vérité à la fin des itérations."),
 K("Comment prouver qu'une boucle tant que s'arrête ?","Trouver une quantité entière qui décroît strictement à chaque itération (ou une variable du test qui avance vers sa borne), et dire quand le tant que s'arrête : il y a un nombre fini d'itérations, donc l'algorithme se termine. Exemple (corrigé 2022) : i est initialisé à 0 et augmente de 1 à chaque itération ; après N itérations, i = N, donc la boucle se termine et l'algorithme aussi.")]},

/* ------------------------------------------------------------------ */
{id:"a-amphi-complexite",t:"Au cas où : complexité et master theorem (vu en amphi)",min:12,goal:"Répondre aux questions de cours sur l'ordre de complexité et le master theorem (CC 2022 et CC1 2024). Fait en amphi, pas en TD : je ne sais pas si ça tombe.",steps:[
 L("Compter les opérations",`<p>Idée du cours (diapo 67) : pour mesurer l'efficacité d'un algorithme, on compte son nombre d'opérations et son espace mémoire.</p><ul><li>1 opération élémentaire = 1 unité de temps, 1 variable élémentaire = 1 unité de mémoire.</li><li>Ils dépendent uniquement d'un entier appelé <b>taille de l'entrée</b>, noté n.</li><li>S'ils dépendent de la configuration des données, on regarde uniquement celle qui consomme le plus de ressources (<b>pire cas</b>).</li></ul><p>Notations (diapo 68) : on note <b>T<sub>n</sub></b> le nombre d'opérations élémentaires et <b>V<sub>n</sub></b> l'espace mémoire occupé. T<sub>n</sub> est la <b>complexité en temps</b>, ou complexité de l'algorithme. V<sub>n</sub> est sa <b>complexité en espace</b>.</p><p>Exemple fait en amphi (diapo 69) :</p>${C(`FONCTION : F1 (E n : entier) : entier
Variable : res : entier
DÉBUT
    res ← 1
    pour i de 1 à n faire
        res ← res * i
    fin pour;
    Renvoyer res
FIN`)}<p>Réponse du prof : « res ← 1 » compte 1. « res ← res * i » fait 2 opérations (la multiplication et l'affectation), n fois : 2n. Donc <b>T<sub>n</sub> = 2n + 1</b>. Une variable, res : <b>V<sub>n</sub> = 1</b>.</p>`),
 Q("Avec ce comptage, combien d'opérations fait F1 pour n = 10 ?",["21","10","20","11"],0,"T<sub>10</sub> = 2 × 10 + 1 = 21 : 1 pour « res ← 1 », puis 2 à chacune des 10 itérations."),
 L("L'ordre de complexité : θ, o, ω, O, Ω",`<p>Plutôt que l'expression exacte de T<sub>n</sub>, on la rattache à une <b>suite de référence</b> R<sub>n</sub> qui a la même vitesse de croissance. Cette suite de référence est appelée <b>ordre de complexité</b> de l'algorithme (diapo 75).</p><p>Principales suites de référence, dans l'ordre (diapo 76) : 1 (à coût constant), log(n) (logarithmique), n (linéaire), n.log(n) (pseudo-linéaire), n² (quadratique), n³ (cubique), n<sup>a</sup> avec a > 0 (polynômiale), b<sup>n</sup> avec b > 1 (exponentielle), n! (factorielle).</p><p><b>Trouver l'ordre de complexité</b> (diapo 77). On divise T<sub>n</sub> par une suite de référence R<sub>n</sub> et on fait tendre n vers +∞.</p><ul><li>Si T<sub>n</sub>/R<sub>n</sub> est borné entre deux nombres strictement positifs, en particulier si T<sub>n</sub>/R<sub>n</sub> → a > 0, alors T<sub>n</sub> est équivalente à R<sub>n</sub> ou de l'ordre de complexité R<sub>n</sub>. On note <b>T<sub>n</sub> = θ(R<sub>n</sub>)</b>.</li><li>Si T<sub>n</sub>/R<sub>n</sub> → 0, alors T<sub>n</sub> est strictement dominée par R<sub>n</sub>. On note <b>T<sub>n</sub> = o(R<sub>n</sub>)</b>.</li><li>Si T<sub>n</sub>/R<sub>n</sub> → +∞, alors T<sub>n</sub> domine strictement R<sub>n</sub>. On note <b>T<sub>n</sub> = ω(R<sub>n</sub>)</b>.</li><li>Sinon, T<sub>n</sub> n'est pas comparable à R<sub>n</sub>. C'est rare.</li></ul><p><b>Attention.</b> « Équivalentes » ne veut pas dire « identiques » : si T<sub>n</sub> = 1000000R<sub>n</sub> ou T<sub>n</sub> = R<sub>n</sub> + 1000000 alors T<sub>n</sub> et R<sub>n</sub> sont équivalentes !</p><p><b>Vocabulaire</b> (diapo 78). Domination stricte ou équivalence = domination au sens large. On utilise la majuscule de la domination stricte : T<sub>n</sub> = O(R<sub>n</sub>) veut dire o ou θ ; T<sub>n</sub> = Ω(R<sub>n</sub>) veut dire ω ou θ.</p><p>Le cours écrit θ ; certains sujets écrivent Θ : c'est la même notation.</p>`),
 Q("TD 7, exercice 29 : quel est l'ordre de complexité de f<sub>n</sub> = 3000n + 28 ?",["θ(n)","θ(1)","θ(n²)","θ(log(n))"],0,"f<sub>n</sub>/n = 3000 + 28/n tend vers 3000, un nombre strictement positif : f<sub>n</sub> = θ(n). On ne garde pas la constante 3000 : l'ordre de complexité est une suite de référence."),
 Q("CC1 de novembre 2024, question de cours : « Un algorithme de complexité Θ(n³) peut-il être un million de fois plus lent qu'un autre algorithme de complexité Θ(n³) ? Justifier. »",["Oui : par exemple le premier fait 1000000n³ opérations et le deuxième n³ opérations","Non : deux algorithmes en Θ(n³) font le même nombre d'opérations","Oui, mais seulement pour les petites valeurs de n"],0,"Corrigé officiel : « Oui, si par exemple le premier fait 1000000n³ opérations et le deuxième n³ opérations. » C'est le « Attention » du cours : équivalentes ne veut pas dire identiques. Les autres sujets de 2024 posaient la même question avec Θ(n²), Θ(n.log(n)) et Θ(log(n))."),
 Q("CC d'octobre 2022, question de cours : (a<sub>n</sub>) et (b<sub>n</sub>) sont deux suites strictement positives. Quelle affirmation est vraie ?",["Si a<sub>n</sub> = θ(b<sub>n</sub>) alors a<sub>n</sub> = O(b<sub>n</sub>)","Si a<sub>n</sub> = o(b<sub>n</sub>) alors a<sub>n</sub> = Ω(b<sub>n</sub>)","Si a<sub>n</sub> = Ω(b<sub>n</sub>) alors a<sub>n</sub> = θ(b<sub>n</sub>)","Si a<sub>n</sub> = O(b<sub>n</sub>) alors a<sub>n</sub> = Ω(b<sub>n</sub>)"],0,"Corrigé officiel : « si a est du même ordre que b alors a est dominée par b ». O veut dire o ou θ. Les trois autres sont fausses : n = o(n²) mais n n'est pas Ω(n²) ; n² = Ω(n) mais n² n'est pas θ(n) ; n = O(n²) mais n n'est pas Ω(n²)."),
 L("Le master theorem",`<p><b>Idée</b> (diapo 84) : donner une estimation O de l'ordre de complexité d'un algorithme récursif quand les appels se font avec une taille d'entrée divisée.</p><p><b>Master Theorem</b> : s'il existe quatre entiers a ≥ 0, b > 1, d ≥ 0 et n<sub>0</sub> > 0 tels que, pour tout n ≥ n<sub>0</sub>, T(n) ≤ aT(⌈n/b⌉) + O(n<sup>d</sup>), alors</p><ul><li>T(n) = O(n<sup>d</sup>) si b<sup>d</sup> > a ;</li><li>T(n) = O(n<sup>d</sup> log n) si b<sup>d</sup> = a ;</li><li>T(n) = O(n<sup>log a / log b</sup>) si b<sup>d</sup> &lt; a.</li></ul><p><b>Remarque</b> : a représente le nombre d'appels récursifs dans le corps de l'algorithme, b l'entier par lequel la taille de l'entrée est divisée à chaque appel, O(n<sup>d</sup>) les opérations de l'algorithme en plus des appels récursifs.</p><p>(⌈x⌉ : x arrondi à l'entier du dessus. ⌊x⌋ : x arrondi à l'entier du dessous ; ⌊n/2⌋, c'est n div 2.)</p><p><b>Exemple du cours</b> (diapo 85) :</p>${C(`FONCTION : F3 (E n : entier) : entier
DÉBUT
    si n=0 alors
        Renvoyer 0
    sinon
        Renvoyer n+2*F3(n div 2)
    fin si;
FIN`)}<p>À partir de n=1 (n<sub>0</sub> = 1), F3 fait 1 appel récursif (a = 1) au rang ⌊n/2⌋ (b = 2). En dehors des appels, il effectue O(1) = O(n<sup>0</sup>) opérations (d = 0). On est dans le cas b<sup>d</sup> = a donc T<sub>n</sub> = O(n<sup>0</sup> log(n)) = O(log(n)) : l'algorithme est logarithmique.</p>`),
 Q("CC d'octobre 2022, question de cours : « À quoi sert le master theorem ? »",["À avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel","À prouver qu'un algorithme récursif s'arrête, en montrant que la taille de l'entrée diminue à chaque appel","À calculer le nombre exact d'opérations d'un algorithme itératif, en comptant boucle par boucle"],0,"Corrigé officiel : « Il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel. »"),
 Q("Cours, diapo 86 : trouver a, b, d et un ordre de complexité. (« op élém » : une opération élémentaire.)",["a = 2, b = 2, d = 2 : b<sup>d</sup> = 4 > a, donc O(n²)","a = 2, b = 2, d = 1 : b<sup>d</sup> = 2 = a, donc O(n log n)","a = 2, b = 2, d = 0 : b<sup>d</sup> = 1 &lt; a, donc O(n)"],0,"Réponse du prof : deux appels F(n div 2), donc a = 2 ; la taille est divisée par 2, donc b = 2 ; les deux boucles imbriquées font θ(n²) opérations en dehors des appels, donc d = 2. T<sub>n</sub> = 2T(⌊n/2⌋) + O(n²), b<sup>d</sup> = 4 > a = 2, donc T<sub>n</sub> = O(n<sup>d</sup>) = O(n²) : l'algorithme est quadratique.",{code:`PROCÉDURE : F (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ
DÉBUT
    si n ≠ 1 alors
        pour i de 0 à n-1 faire
            pour j de 0 à n-1 faire
                op élém
            fin pour;
        fin pour;
        F(n div 2)
        F(n div 2)
    fin si;
FIN`}),
 P("Cours, diapo 79 : trouver l'ordre de complexité, sur papier",`<p>Trouver l'ordre de complexité, c'est-à-dire la suite de référence équivalente à T<sub>n</sub> :</p><ol><li>T<sub>n</sub> = 3n³ − 5n + 2</li><li>T<sub>n</sub> = 2<sup>n+1</sup> − 8n³</li><li>T<sub>n</sub> = 3n log(n²) + 5</li><li>T<sub>n</sub> = 2T<sub>n−1</sub></li><li>T<sub>n</sub> = T<sub>n−1</sub> + n</li><li>T<sub>n</sub> = 3n + 1 si n est pair et T<sub>n</sub> = 2n si n est impair</li></ol><p>Rappel : log(n²) = 2 log(n), et 1 + 2 + … + n = n(n + 1)/2.</p>`,`<p><b>Réponses écrites par le prof en amphi.</b></p><ol><li>T<sub>n</sub> = θ(n³).</li><li>2<sup>n+1</sup> = 2 × 2<sup>n</sup> : T<sub>n</sub> = θ(2<sup>n</sup>).</li><li>log(n²) = 2 log n, donc T<sub>n</sub> ≈ 6n log n : T<sub>n</sub> = θ(n log n).</li><li>Avec T<sub>0</sub> = 1 : T<sub>n</sub> = 2 × 2 × 2 × … × T<sub>0</sub>, avec n fois le facteur 2, soit 2<sup>n</sup> : T<sub>n</sub> = θ(2<sup>n</sup>).</li><li>T<sub>n</sub> = n + (n − 1) + (n − 2) + … + 1 + T<sub>0</sub> = n(n + 1)/2 + T<sub>0</sub> = ½n² + ½n + T<sub>0</sub> ∈ θ(n²).</li><li>3n + 1 = θ(n) et 2n = θ(n) : T<sub>n</sub> = θ(n).</li></ol><p><b>Pourquoi</b> (mes explications). On garde le terme qui grandit le plus vite et on oublie sa constante. 1 : T<sub>n</sub>/n³ tend vers 3. 2 : 8n³ est strictement dominée par 2<sup>n</sup>. 6 : T<sub>n</sub>/n reste entre 2 et 4, deux nombres strictement positifs, même s'il n'a pas de limite.</p>`,["Une suite de référence pour chaque ligne, sans constante devant","Ligne 3 : log(n²) = 2 log n","Lignes 4 et 5 : la suite écrite en fonction de n avant de conclure","Ligne 6 : θ(n), même sans limite"],7),
 L("À ajouter sur ta feuille A4",`<p>S'il reste de la place sur ta feuille, recopie ces trois blocs à la main :</p><div class="paper"><p><b>Preuve d'une boucle.</b> 1. Équations d'itération (vérité). 2. Invariant Inv<sub>i</sub> (hypothèse). 3. Récurrence : initialisation (i = 0), récurrence (Inv<sub>i−1</sub> vrai donne Inv<sub>i</sub> vrai, avec les équations), conclusion. 4. À la fin des itérations : la valeur renvoyée. Arrêt d'un tant que : une quantité entière décroît strictement à chaque itération (ou la variable du test part de …, augmente de …), le tant que s'arrête quand elle vaut … : nombre fini d'itérations, donc l'algorithme se termine.</p><p><b>Ordre de complexité.</b> T<sub>n</sub>/R<sub>n</sub> → a > 0 : θ. → 0 : o. → +∞ : ω. O = o ou θ. Ω = ω ou θ. Ordre : 1, log n, n, n log n, n², n³, 2<sup>n</sup>, n!. 1000000n³ = θ(n³).</p><p><b>Master theorem.</b> T(n) ≤ aT(⌈n/b⌉) + O(n<sup>d</sup>) : O(n<sup>d</sup>) si b<sup>d</sup> > a ; O(n<sup>d</sup> log n) si b<sup>d</sup> = a ; O(n<sup>log a / log b</sup>) si b<sup>d</sup> &lt; a. a : nombre d'appels, b : diviseur de la taille, n<sup>d</sup> : opérations hors appels. Sert à estimer la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel.</p></div>`),
 K("Un algorithme en θ(n³) peut-il être un million de fois plus lent qu'un autre en θ(n³) ?","Oui, si par exemple le premier fait 1000000n³ opérations et le deuxième n³ opérations. (Corrigé officiel du CC1 2024.)"),
 K("À quoi sert le master theorem ?","Il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel. (Corrigé officiel du CC 2022.)"),
 K("Que fait le rapport T<sub>n</sub>/R<sub>n</sub> quand T<sub>n</sub> = θ(R<sub>n</sub>) ? Quand T<sub>n</sub> = o(R<sub>n</sub>) ? Quand T<sub>n</sub> = ω(R<sub>n</sub>) ?","θ : il reste entre deux nombres strictement positifs (par exemple il tend vers a > 0). o : il tend vers 0. ω : il tend vers +∞. O = o ou θ ; Ω = ω ou θ."),
 K("Le master theorem part de T(n) ≤ aT(⌈n/b⌉) + O(n<sup>d</sup>). Quels sont ses trois cas, et que représentent a, b et d ?","O(n<sup>d</sup>) si b<sup>d</sup> > a ; O(n<sup>d</sup> log n) si b<sup>d</sup> = a ; O(n<sup>log a / log b</sup>) si b<sup>d</sup> &lt; a. a : nombre d'appels récursifs, b : diviseur de la taille, n<sup>d</sup> : opérations hors appels.")]}
];
/* Ordre des leçons du CC1 : d'abord ce qui rapporte le plus de points dans les sujets 2022 à 2024 (tableaux 4 à 6 points,
   affichage récursif 4, listes 2 à 6, motifs 4), les leçons dont elles ont besoin juste avant.
   Tableaux 2D, dictionnaires et piles ne sont dans aucun sujet : ils passent après l'examen blanc (late).
   Les deux leçons « au cas où » (validité, complexité : faites en amphi, tombées en 2022 et 2024) aussi, mais en premier. */
const ORDRE_CC1=["a-forme","a-expressions","a-boucles","a-tableaux","a-recursif","a-affichage","a-listes","a-motifs","a-amphi-preuve","a-amphi-complexite","a-tableaux2d","a-dicos","a-piles"];
LES.algo.sort((a,b)=>ORDRE_CC1.indexOf(a.id)-ORDRE_CC1.indexOf(b.id));
LES.algo.forEach(L=>{if(["a-amphi-preuve","a-amphi-complexite","a-tableaux2d","a-dicos","a-piles"].includes(L.id))L.late=true;});
/* La priorité des leçons du CC1 vient maintenant des thèmes (matiere-algo.js, page « Où j'en suis »).
   Les deux leçons « au cas où » ne servent que pour le CC1, en « si tu as le temps » ; pour le CC2, les leçons a2-* les remplacent. */
LES.algo.forEach(L=>{if(/^a-amphi-/.test(L.id)){L.ex="cc1x";L.p=2;}});
/* ================== leçons des CC2 (preuves, complexité) et CC3 (recherche, tris) ================== */
const A2=o=>Object.assign(o,{ex:"cc2"}),A3=o=>Object.assign(o,{ex:"cc3"});
LES.algo.push(
/* ------------------------------------------------------------------ */
A2({id:"a2-invariant",t:"Prouver une boucle : équations d'itération et invariant",min:17,goal:"Faire la preuve de validité d'un algorithme itératif avec la méthode en 4 étapes du cours, et prouver qu'un tant que s'arrête (TD 6, CC 2022, examens de 2023).",steps:[
 L("Les mots du cours",`<p>Une <b>itération</b>, c'est un tour de boucle. Un algorithme <b>itératif</b> est un algorithme qui contient une boucle.</p><p><b>Un algorithme est valide s'il résout le problème qu'il est censé résoudre</b> (diapo 53).</p><p>Vocabulaire (diapo 54) :</p><ul><li><b>équation d'itération</b> : égalité reliant les valeurs des variables d'une itération à la suivante ; ce sera notre <b>vérité</b> ;</li><li><b>invariant de boucle</b> : propriété censée être vraie au début des itérations et à la fin de chaque itération ; ce sera notre <b>hypothèse à prouver</b>.</li></ul><p><b>Notation.</b> var<sub>i</sub> : valeur de var à la fin de l'itération n°i. Si i commence à 1, on ajoute la valeur i = 0 pour le début des itérations.</p><p><b>Méthode</b> (diapo 56) :</p><ol><li>« lire » les équations d'itération sur l'algorithme (vérité) ;</li><li>chercher un invariant de boucle (hypothèse) ;</li><li>prouver l'hypothèse par récurrence en utilisant la vérité : l'hypothèse devient une vérité ;</li><li>écrire cette vérité à la fin des itérations pour prouver l'algorithme.</li></ol>`),
 L("Premier exemple du cours : F1 calcule n!",`<p>n! (« factorielle de n ») = 1 × 2 × … × n, et 0! = 1.</p>${C(`FONCTION : F1 (E n : entier) : entier
SPÉCIFICATIONS : Calcule n! avec n ∈ ℕ
Variable : res : entier
DÉBUT
    res ← 1
    pour i de 1 à n faire
        res ← res * i
    fin pour;
    Renvoyer res
FIN`)}<p>La preuve du cours (diapo 57). res<sub>i</sub> est la valeur de res à la fin de l'itération i.</p><ol><li><b>Équation d'itération</b> : res<sub>0</sub> = 1 et si i > 0, res<sub>i</sub> = res<sub>i−1</sub> × i.</li><li><b>Invariant proposé</b> : Inv<sub>i</sub> : « res<sub>i</sub> = i! ».</li><li><b>Preuve de l'invariant</b> :<ul><li><b>Initialisation</b> : au début des itérations, res<sub>0</sub> = 1 (vérité) donc res<sub>0</sub> = 0! donc Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : si Inv<sub>i−1</sub> est vrai (1 ≤ i ≤ n), c'est-à-dire si res<sub>i−1</sub> = (i − 1)!, comme res<sub>i</sub> = res<sub>i−1</sub> × i (vérité), alors res<sub>i</sub> = (i − 1)! × i = i!, c'est-à-dire Inv<sub>i</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul></li><li>À la fin des n itérations, l'invariant (nouvelle vérité) s'écrit res<sub>n</sub> = n!. La valeur renvoyée est la valeur attendue : l'algorithme est valide.</li></ol>`),
 Q("Dans la preuve de F1, à quel moment se sert-on de l'équation d'itération res<sub>i</sub> = res<sub>i−1</sub> × i ?",["Dans la récurrence, pour passer de Inv<sub>i−1</sub> à Inv<sub>i</sub>","Seulement dans la conclusion","Jamais : elle sert à prouver l'arrêt"],0,"C'est elle qui relie une itération à la suivante. Le sujet du CC1 2024 le demandait : « à quoi servent les équations de récurrence ? » (le nom des équations d'itération cette année-là). Corrigé officiel : « Elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables. Elles permettent de montrer qu'un invariant est héréditaire, c'est à dire que s'il est vrai à l'itération n, alors il est vrai à l'itération n+1. »"),
 L("Deuxième exemple du cours : Cube, avec quatre variables",`${C(`FONCTION : Cube (E n : entier) : entier
SPÉCIFICATIONS : Calcule n³ avec n ∈ ℕ.
Variable : A, B, C, Z : entier
DÉBUT
    A, B, C, Z ← 1, 0, n, 0 ;
    tant que C > 0 faire
        Z ← Z+A+B ;
        B ← B+A+A+1 ;
        A, C ← A+3, C-1 ;
    fin tq;
    Renvoyer Z
FIN`)}<p><b>Équations d'itération (vérité)</b> : A<sub>0</sub> = 1, B<sub>0</sub> = 0, C<sub>0</sub> = n, Z<sub>0</sub> = 0, puis</p><div class="formula">A<sub>i+1</sub> = A<sub>i</sub> + 3 &nbsp;;&nbsp; B<sub>i+1</sub> = B<sub>i</sub> + 2A<sub>i</sub> + 1 &nbsp;;&nbsp; C<sub>i+1</sub> = C<sub>i</sub> − 1 &nbsp;;&nbsp; Z<sub>i+1</sub> = Z<sub>i</sub> + A<sub>i</sub> + B<sub>i</sub></div><p>(Z est calculé avec les anciens A et B, et B avec l'ancien A : les lignes sont exécutées dans l'ordre.)</p><p><b>Invariant (hypothèse)</b> : on le cherche sur une « trace », ici pour n = 4 :</p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>itération i</th><th class="var">A<sub>i</sub></th><th class="var">B<sub>i</sub></th><th class="var">C<sub>i</sub></th><th class="var">Z<sub>i</sub></th></tr></thead><tbody><tr><td>0</td><td>1</td><td>0</td><td>4</td><td>0</td></tr><tr><td>1</td><td>4</td><td>3</td><td>3</td><td>1</td></tr><tr><td>2</td><td>7</td><td>12</td><td>2</td><td>8</td></tr><tr><td>3</td><td>10</td><td>27</td><td>1</td><td>27</td></tr><tr><td>4</td><td>13</td><td>48</td><td>0</td><td>64</td></tr></tbody></table></div><p>Invariant proposé : Inv<sub>i</sub> : « A<sub>i</sub> = 3i + 1, B<sub>i</sub> = 3i², C<sub>i</sub> = n − i, Z<sub>i</sub> = i³ ».</p>`),
 L("La preuve de Cube",`<p>Diapo 59. On reprend les équations d'itération (EI) et l'invariant de l'écran précédent.</p><ul><li><b>Initialisation</b> : au début des itérations (i = 0), A<sub>0</sub> = 1 = 3 × 0 + 1, B<sub>0</sub> = 0 = 3 × 0², C<sub>0</sub> = n = n − 0, Z<sub>0</sub> = 0 = 0³ : Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : on suppose Inv<sub>i</sub> vrai et on fait une itération de plus.<br>A<sub>i+1</sub> = A<sub>i</sub> + 3 = 3i + 1 + 3 = 3(i + 1) + 1<br>B<sub>i+1</sub> = B<sub>i</sub> + 2A<sub>i</sub> + 1 = 3i² + 2(3i + 1) + 1 = 3(i + 1)²<br>C<sub>i+1</sub> = C<sub>i</sub> − 1 = n − i − 1 = n − (i + 1)<br>Z<sub>i+1</sub> = Z<sub>i</sub> + A<sub>i</sub> + B<sub>i</sub> = i³ + 3i + 1 + 3i² = (i + 1)³<br>Alors Inv<sub>i+1</sub> est vrai. L'invariant est donc vrai pour toutes les itérations.</li><li><b>Conclusion</b> : à la fin du TantQue, C<sub>i</sub> = 0 = n − i donc i = n. La valeur renvoyée est donc Z<sub>n</sub> = n³ : l'algorithme est valide.</li></ul><p>À chaque ligne de la récurrence : d'abord l'équation d'itération, puis l'invariant au rang i, puis un calcul. (Rappel : (i + 1)² = i² + 2i + 1 et (i + 1)³ = i³ + 3i² + 3i + 1.)</p>`),
 Q("Avec l'invariant de Cube, que valent A et Z à la fin de l'itération 5 (pour n ≥ 5) ?",["A = 16 et Z = 125","A = 15 et Z = 125","A = 16 et Z = 25","A = 13 et Z = 64"],0,"A<sub>5</sub> = 3 × 5 + 1 = 16 et Z<sub>5</sub> = 5³ = 125. Une fois l'invariant prouvé, plus besoin de dérouler la trace."),
 B("Cours, diapo 60 : « À vous de jouer ! Compléter la preuve ». On note n = taille(T). Choisis ce que le prof a écrit dans chaque trou.",`1. Équations d'itération : res₀ = [[0]] et resᵢ₊₁ = [[1]]
2. Invariant : Invᵢ : « resᵢ = [[2]] »
3. Initialisation : avant la boucle, pour i = 0, res₀ = T[0],
   somme des valeurs de T[0] à T[0]. Inv₀ est vrai.
   Récurrence : on suppose Invᵢ vrai pour 0 ≤ i ≤ n − 2
   et on refait une itération.
   Comme resᵢ₊₁ = resᵢ + T[i+1] (EI) et resᵢ = T[0] + T[1] + … + T[i] (Invᵢ),
   on a resᵢ₊₁ = [[3]]. Donc Invᵢ₊₁ est vrai.
   Conclusion : l'invariant est vrai pour toutes les itérations.
4. À la fin du pour, l'algorithme renvoie [[4]]
   par l'invariant : l'algorithme est valide.`,[{o:["T[0]","0","T[1]"],a:0},{o:["resᵢ + T[i+1]","resᵢ + T[i]","resᵢ + 1"],a:0},{o:["T[0] + T[1] + … + T[i]","T[0] + T[1] + … + T[n−1]","T[i]"],a:0},{o:["T[0] + … + T[i] + T[i+1]","T[0] + … + T[i]","T[i] + T[i+1]"],a:0},{o:["res avec l'indice taille(T)−1, égal à T[0] + … + T[taille(T)−1]","res₀ = T[0]","res avec l'indice taille(T), égal à T[0] + … + T[taille(T)]"],a:0}],"Ce sont les réponses écrites par le prof en amphi. Ici res part de T[0] et la boucle commence à i = 1 : à la fin de l'itération i, res contient la somme des cases 0 à i. La dernière itération est i = taille(T) − 1.",{lang:"txt",show:`FONCTION : somTab (E T : tableau d'entiers) : entier
SPÉCIFICATIONS : Renvoie la somme des valeurs de T.
Variable : res : entier
DÉBUT
    res ← T[0]
    pour i de 1 à taille(T)-1 faire
        res ← res+T[i]
    fin pour;
    Renvoyer res
FIN`,showLang:"pseudo"}),
 S("TD 6, exercice 24 : la fonction g","Faire la trace pour n = 5, donner un invariant liant x et i et un invariant liant r et i, les prouver, puis dire ce que calcule g. (« i!=n » veut dire i ≠ n.)",[
  {w:"Trace pour n = 5, une ligne par itération : (i, r, x) = (0, 1, 0), (1, 0, 3), (2, 1, 6), (3, 4, 9), (4, 9, 12), (5, 16, 15). g renvoie 16.",why:"Attention à l'ordre des trois instructions : « r ← r + x - i » utilise le nouveau i, mais l'ancien x."},
  {w:"Équations d'itération : i<sub>0</sub> = 0, r<sub>0</sub> = 1, x<sub>0</sub> = 0, puis i<sub>k+1</sub> = i<sub>k</sub> + 1, r<sub>k+1</sub> = r<sub>k</sub> + x<sub>k</sub> − i<sub>k+1</sub>, x<sub>k+1</sub> = x<sub>k</sub> + 3.",why:"Étape 1 : on les lit sur l'algorithme. C'est la vérité."},
  {w:"Invariant proposé : Inv<sub>k</sub> : « x<sub>k</sub> = 3i<sub>k</sub> et r<sub>k</sub> = (i<sub>k</sub> − 1)² ».",why:"Étape 2 : dans la trace, x vaut toujours 3 fois i, et r vaut 1, 0, 1, 4, 9, 16 : le carré de i − 1."},
  {w:"Initialisation : x<sub>0</sub> = 0 = 3 × 0 et r<sub>0</sub> = 1 = (0 − 1)². Inv<sub>0</sub> est vrai.",why:"Étape 3, début de la récurrence."},
  {w:"Récurrence : on suppose Inv<sub>k</sub> vrai. x<sub>k+1</sub> = x<sub>k</sub> + 3 = 3i<sub>k</sub> + 3 = 3i<sub>k+1</sub>. Et r<sub>k+1</sub> = (i<sub>k</sub> − 1)² + 3i<sub>k</sub> − (i<sub>k</sub> + 1) = i<sub>k</sub>² = (i<sub>k+1</sub> − 1)². Inv<sub>k+1</sub> est vrai : l'invariant est vrai pour toutes les itérations.",why:"On remplace avec les équations d'itération, puis avec l'invariant au rang k. (i − 1)² + 3i − (i + 1) = i² − 2i + 1 + 2i − 1 = i²."},
  {w:"À la fin du tant que, i = n, donc r = (n − 1)² : g calcule (n − 1)².",why:"Étape 4 : la condition i ≠ n est devenue fausse. On écrit l'invariant avec i = n."}],{code:`Fonction : g (E n : entier) : entier
Spécifications : n positif. Renvoie ?
Variables : i, r, x : entier
Début
    i, r, x ← 0, 1, 0
    Tant que i!=n faire
        i ← i + 1
        r ← r + x - i
        x ← x + 3
    finTant que
    Renvoyer r
Fin`}),
 L("Et l'arrêt d'une boucle tant que ?",`<p>La méthode en 4 étapes prouve que le résultat est bon <b>si la boucle s'arrête</b>. Une boucle pour s'arrête toujours. Pour une boucle tant que, les sujets demandent de le prouver (CC 2022, examens de janvier et de mai 2023 ; 2 points en janvier 2023).</p><p>Le modèle du cours (diapo 95, sur la recherche dichotomique) :</p><ul><li>une quantité est un <b>entier naturel</b> ;</li><li>elle <b>décroît strictement</b> à chaque itération ;</li><li>le tant que s'arrête lorsqu'elle vaut 0 ou moins.</li></ul><p>« Il y a donc un nombre fini d'itérations. Chaque itération se termine. Donc l'algorithme se termine. »</p><p>Corrigé officiel de janvier 2023, pour une boucle « tant que a>0 et b>0 » : « L'expression entière a + b vaut initialement i + j et décroît strictement à chaque itération. Comme le tant que s'arrête lorsque a ≤ 0 ou b ≤ 0, il effectue au maximum i + j itérations. Il y a donc un nombre fini d'itérations donc l'algorithme s'arrête. »</p><p>Quand la variable du test monte vers une borne, on le dit dans l'autre sens : d'où elle part, de combien elle augmente, et après combien d'itérations le test devient faux.</p>`),
 Q("Pourquoi la boucle de Cube s'arrête-t-elle ?",["C est un entier naturel qui décroît strictement à chaque itération, et le tant que s'arrête lorsqu'il vaut 0","Parce que Z finit par valoir n³, et la boucle s'arrête quand le résultat est atteint","Parce que l'invariant est vrai au début et reste vrai à la fin de chaque itération"],0,"C part de n et diminue de 1 à chaque itération : après n itérations, C = 0 et le test C > 0 est faux. L'invariant et la valeur de Z prouvent que le résultat est bon, pas que la boucle s'arrête.",{code:`A, B, C, Z ← 1, 0, n, 0 ;
tant que C > 0 faire
    Z ← Z+A+B ;
    B ← B+A+A+1 ;
    A, C ← A+3, C-1 ;
fin tq;`}),
 P("TD 6, exercice 27 : logEntier, sur papier",`<ol><li>Faites une trace de l'algorithme logEntier ci-dessous pour a = 18.</li><li>Donnez un invariant liant les valeurs de p et de i, un autre liant q et i.</li><li>Montrez ces invariants.</li><li>Montrez que l'algorithme est correct.</li></ol>${C(`Fonction : logEntier (E a : entier) : entier
Spécifications : a un entier strictement positif.
     En fin d'exécution, i = partie entière de log2(a),
     i.e. i vérifie que 2^i <= a < 2^(i+1)
Variables : p, q, i : Entier
Début
     i, p, q ← 0, 1, 2
     Tant que q <= a faire
         p ← q
         q ← p + p
         i ← i + 1
     finTant que
     Renvoyer i
Fin`)}<p>(2^i veut dire 2<sup>i</sup>.)</p>`,`<p><b>1.</b></p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>itération</th><th class="var">i</th><th class="var">p</th><th class="var">q</th></tr></thead><tbody><tr><td>0</td><td>0</td><td>1</td><td>2</td></tr><tr><td>1</td><td>1</td><td>2</td><td>4</td></tr><tr><td>2</td><td>2</td><td>4</td><td>8</td></tr><tr><td>3</td><td>3</td><td>8</td><td>16</td></tr><tr><td>4</td><td>4</td><td>16</td><td>32</td></tr></tbody></table></div><p>32 > 18 : la boucle s'arrête, l'algorithme renvoie 4. Et en effet 2⁴ = 16 ≤ 18 &lt; 32 = 2⁵.</p><p><b>2.</b> p = 2<sup>i</sup> et q = 2<sup>i+1</sup>.</p><p><b>3.</b> Équations d'itération : i<sub>0</sub> = 0, p<sub>0</sub> = 1, q<sub>0</sub> = 2 ; puis p<sub>k+1</sub> = q<sub>k</sub>, q<sub>k+1</sub> = p<sub>k+1</sub> + p<sub>k+1</sub> = 2q<sub>k</sub>, i<sub>k+1</sub> = i<sub>k</sub> + 1.</p><ul><li>Initialisation : p<sub>0</sub> = 1 = 2⁰ et q<sub>0</sub> = 2 = 2¹.</li><li>Récurrence : si p<sub>k</sub> = 2<sup>k</sup> et q<sub>k</sub> = 2<sup>k+1</sup>, alors p<sub>k+1</sub> = q<sub>k</sub> = 2<sup>k+1</sup> et q<sub>k+1</sub> = 2 × 2<sup>k+1</sup> = 2<sup>k+2</sup>.</li><li>Conclusion : l'invariant est vrai pour toutes les itérations.</li></ul><p><b>4.</b> À la fin du tant que, la condition q ≤ a est fausse : a &lt; q = 2<sup>i+1</sup>. Il reste à voir que p ≤ a. S'il n'y a eu aucune itération, p = 1 ≤ a car a est strictement positif. Sinon, p est la valeur de q à l'itération d'avant, et cette itération n'a eu lieu que parce que q ≤ a. Dans les deux cas 2<sup>i</sup> = p ≤ a &lt; 2<sup>i+1</sup> : c'est la spécification.</p><p>L'arrêt : q double à chaque itération, donc a − q est un entier qui décroît strictement ; le tant que s'arrête lorsqu'il est négatif. Il y a un nombre fini d'itérations.</p><p>(Corrigé écrit par moi, vérifié par programme pour a de 1 à 2999.)</p>`,["Le tableau de trace : 5 lignes, la dernière avec q = 32","Les équations d'itération écrites avant l'invariant","Initialisation, récurrence, conclusion","La fin : q > a, et p ≤ a (deux cas)"],12),
 K("Quelles sont les définitions du cours pour « équation d'itération » et « invariant de boucle » ?","Équation d'itération : égalité reliant les valeurs des variables d'une itération à la suivante (la vérité). Invariant de boucle : propriété censée être vraie au début des itérations et à la fin de chaque itération (l'hypothèse à prouver)."),
 K("Quelles sont les 4 étapes pour prouver la validité d'un algorithme itératif (avec une boucle) ?","1. « Lire » les équations d'itération sur l'algorithme (vérité). 2. Chercher un invariant de boucle (hypothèse). 3. Prouver l'hypothèse par récurrence en utilisant la vérité : initialisation, récurrence, conclusion. 4. Écrire cette vérité à la fin des itérations pour prouver l'algorithme."),
 K("Comment prouver qu'un tant que s'arrête ?","Une quantité entière décroît strictement à chaque itération, et le tant que s'arrête lorsqu'elle atteint une certaine valeur : il y a un nombre fini d'itérations, donc l'algorithme se termine. Exemple (janvier 2023) : a + b vaut i + j au début et décroît strictement ; la boucle s'arrête quand a ≤ 0 ou b ≤ 0.")]}),

/* ------------------------------------------------------------------ */
A2({id:"a2-recursif",t:"Prouver un algorithme récursif",min:13,goal:"Prouver par récurrence qu'un algorithme récursif renvoie le bon résultat et se termine (cours diapos 61 à 65, TD 6 ex. 25, examens de 2023 : 2 points).",steps:[
 L("Les mots du cours pour un algorithme récursif",`<p>Vocabulaire (diapo 61) :</p><ul><li><b>équation de récurrence</b> : égalité reliant le résultat de l'algorithme avec celui des appels récursifs ; ce sera notre <b>vérité</b> ;</li><li><b>invariant de récursion</b> : propriété censée être vraie à chaque appel récursif. Le plus souvent, ça revient à écrire que l'algorithme renvoie le bon résultat ; ce sera notre <b>hypothèse à prouver</b>.</li></ul><p><b>Méthode</b> (diapo 63) :</p><ol><li>« lire » les équations de récurrence sur l'algorithme (vérité) ;</li><li>poser l'invariant de récursion (hypothèse) ;</li><li>prouver l'hypothèse par récurrence en utilisant la vérité ;</li><li>l'hypothèse devient alors une vérité qui prouve l'algorithme.</li></ol><p>C'est la même méthode que pour une boucle. Ce qui change : la récurrence porte sur le paramètre n de l'algorithme, plus sur le numéro de l'itération.</p>`),
 L("L'exemple du cours : F2, la factorielle récursive",`${C(`FONCTION : F2 (E n : entier) : entier
SPÉCIFICATIONS : calcule la factorielle d'un entier n ∈ ℕ.
DÉBUT
    si n=0 alors
        Renvoyer 1
    sinon
        Renvoyer n*F2(n-1)
    fin si;
FIN`)}<p>La preuve du cours (diapo 64) :</p><ol><li><b>Équation de récurrence (vérité)</b> : F2(0) = 1 et F2(n) = n × F2(n − 1) pour n > 0.</li><li><b>Invariant (hypothèse)</b> : Inv<sub>n</sub> : « F2(n) = n! ».</li><li><b>Preuve de l'invariant</b> :<ul><li><b>Initialisation</b> : pour n = 0, on a F2(0) = 1 (vérité) donc F2(0) = 0! c'est-à-dire Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : pour n > 0, si Inv<sub>n−1</sub> est vrai, c'est-à-dire si F2(n − 1) = (n − 1)!, comme F2(n) = n × F2(n − 1) (vérité) alors F2(n) = n × (n − 1)! = n!. Donc Inv<sub>n</sub> est vrai.</li><li><b>Conclusion</b> : pour tout n ∈ ℕ, F2(n) = n!</li></ul></li><li>L'algorithme renvoie le bon résultat : il est valide.</li></ol>`),
 Q("Dans la preuve de F2, d'où vient l'égalité F2(n) = n × F2(n − 1) ?",["On la lit sur l'algorithme : c'est l'équation de récurrence, la vérité","C'est l'invariant de récursion : on le suppose vrai, c'est l'hypothèse","C'est la conclusion de la preuve : on la démontre à la fin","On la démontre d'abord par récurrence sur n"],0,"C'est la ligne « Renvoyer n*F2(n-1) ». L'hypothèse, c'est « F2(n) = n! » : elle dit que l'algorithme renvoie le bon résultat."),
 B("Cours, diapo 65 : « À vous de jouer ! Compléter la preuve ». Choisis ce que le prof a écrit dans chaque trou.",`Équations de récurrence : si n = 1 alors F4(1) = [[0]]
et si n > 1 alors F4(n) = [[1]]   (*)
Invariant à prouver : Pₙ : F4(n) = [[2]]
Initialisation : pour n = 1, F4(n) = 1
   qui est bien la somme de 1 à 1. Donc P₁ est vrai.
Récurrence : pour n > 1, on suppose Pₙ₋₁ vraie :
   F4(n − 1) = [[3]]
   Comme F4(n) = n + F4(n − 1) (*)
   alors F4(n) = n + 1 + 2 + … + (n − 1). Donc Pₙ est vrai.
Conclusion : pour tout n, F4(n) renvoie 1 + 2 + … + n.
L'algorithme est valide.`,[{o:["1","0","n"],a:0},{o:["n + F4(n − 1)","n × F4(n − 1)","1 + F4(n − 1)"],a:0},{o:["1 + 2 + … + n","n!","n + 1"],a:0},{o:["1 + 2 + … + (n − 1)","1 + 2 + … + n","n − 1"],a:0}],"Réponses écrites par le prof en amphi. Ici le cas de base est n = 1 (n est dans ℕ*, les entiers à partir de 1) : l'initialisation se fait donc pour n = 1.",{lang:"txt",show:`FONCTION : F4 (E n : entier) : entier
SPÉCIFICATIONS : Renvoie la somme des entiers de 1 à n, avec n ∈ ℕ*
DÉBUT
    Renvoyer cond(n=1, 1, n+F4(n-1))
FIN`,showLang:"pseudo"}),
 L("Prouver aussi que l'algorithme se termine",`<p>Les sujets d'examen demandent les deux à la fois : « Prouver par récurrence que la fonction F se termine et renvoie le bon résultat » (janvier et mai 2023, 2 points).</p><p>On ajoute « se termine » dans la propriété, et on le justifie à chaque étape :</p><ul><li><b>Base</b> : le cas de base renvoie une valeur sans appel récursif, donc se termine.</li><li><b>Hérédité</b> : on suppose que l'appel au rang n − 1 se termine et renvoie le bon résultat. L'appel au rang n est constitué d'opérations élémentaires et d'appels au rang n − 1, donc il se termine.</li></ul><p>Les corrigés officiels disent « base » et « hérédité » ; le cours de cette année dit « initialisation » et « récurrence ». C'est la même chose.</p><p>Tu as déjà vu une preuve d'arrêt de ce type pour le CC1 : la procédure G du CC1 2024, avec une récurrence à deux pas (G(n) appelle G(n-1) et G(n-2)).</p>`),
 S("Examen de janvier 2023, exercice 3, question 1 (2 points)","Prouver par récurrence que la fonction F se termine et renvoie le bon résultat. La spécification dit que F renvoie 1/(n+1).",[
  {w:"Base : pour n = 0, F renvoie 1 donc se termine. De plus, comme 1 = 1/(0 + 1), F renvoie le bon résultat.",why:"Le cas de base : les deux choses à dire (se termine, bon résultat)."},
  {w:"Hérédité : supposons que, pour n > 0, F(n − 1) se termine et renvoie le bon résultat, c'est à dire 1/n.",why:"L'hypothèse de récurrence, au rang n − 1 : le bon résultat pour n − 1 est 1/((n − 1) + 1) = 1/n."},
  {w:"Alors l'appel F(n) est constitué d'opérations élémentaires et de deux appels à F(n − 1) donc se termine.",why:"L'arrêt : tout ce que fait F(n) se termine."},
  {w:"De plus, F(n) renvoie F(n−1)/(1 + F(n−1)) = (1/n)/(1 + 1/n) = 1/(n + 1), c'est à dire le bon résultat.",why:"L'équation de récurrence (lue sur l'algorithme), puis l'hypothèse. (1/n)/(1 + 1/n) = (1/n)/((n + 1)/n) = 1/(n + 1)."},
  {w:"Conclusion : pour tout n ∈ ℕ, l'appel F(n) se termine et renvoie le bon résultat.",why:"C'est le corrigé officiel, mot pour mot."}],{code:`Fonction : F (E n : entier) : entier
Spécifications : n∈ ℕ. Renvoie 1/(n+1).
Début
    Si n=0 alors
      Renvoyer 1
    Sinon
      Renvoyer F(n-1) / (1+F(n-1))
    FinSi
Fin`}),
 P("TD 6, exercice 25, questions 3 à 5 : la somme d'un tableau en récursif, sur papier",`<p>Soit T un tableau d'entiers.</p><ol start="3"><li>Écrire un algorithme <b>récursif</b> qui, étant donné un tableau T et un entier n, calcule la somme des éléments de T entre 0 et n-1.</li><li>Prouver cet algorithme.</li><li>Avec quelle valeur de n faut-il l'appeler pour avoir la somme des valeurs de tout le tableau ?</li></ol>`,`<p><b>3.</b></p>${C(`FONCTION : somRec (E T : tableau d'entiers, E n : entier) : entier
SPÉCIFICATIONS : 0 ≤ n ≤ taille(T). Renvoie la somme des éléments de T
                 d'indices 0 à n-1 (0 s'il n'y en a aucun).
DÉBUT
    Renvoyer cond(n=0, 0, somRec(T, n-1) + T[n-1])
FIN`)}<p><b>4.</b></p><ul><li><b>Équations de récurrence</b> (la vérité) : somRec(T, 0) = 0, et pour n > 0, somRec(T, n) = somRec(T, n−1) + T[n−1].</li><li><b>Invariant de récursion</b> (l'hypothèse) : P<sub>n</sub> : « somRec(T, n) = T[0] + … + T[n−1] ».</li><li><b>Initialisation</b> : pour n = 0, somRec(T, 0) = 0, qui est bien la somme de zéro élément. P<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : pour n > 0, on suppose P<sub>n−1</sub> vrai : somRec(T, n−1) = T[0] + … + T[n−2]. Comme somRec(T, n) = somRec(T, n−1) + T[n−1], alors somRec(T, n) = T[0] + … + T[n−2] + T[n−1]. Donc P<sub>n</sub> est vrai.</li><li><b>Conclusion</b> : pour tout n entre 0 et taille(T), somRec(T, n) renvoie T[0] + … + T[n−1]. L'algorithme est valide.</li></ul><p><b>5.</b> Avec n = taille(T) : somRec(T, taille(T)).</p><p>(Corrigé écrit par moi, sur le modèle de la diapo 65.)</p>`,["Un cas de base sans appel récursif (n = 0 renvoie 0)","L'appel récursif sur n-1, et la case T[n-1] (pas T[n])","Les équations de récurrence, puis l'invariant P<sub>n</sub>","Initialisation, récurrence, conclusion"],10),
 K("Quelles sont les définitions du cours pour « équation de récurrence » et « invariant de récursion » ?","Équation de récurrence : égalité reliant le résultat de l'algorithme avec celui des appels récursifs (la vérité). Invariant de récursion : propriété censée être vraie à chaque appel récursif ; le plus souvent, l'algorithme renvoie le bon résultat (l'hypothèse à prouver)."),
 K("Quel est le plan d'une preuve par récurrence qu'un algorithme récursif F se termine et renvoie le bon résultat ?","Base : le cas de base renvoie la bonne valeur sans appel, donc se termine. Hérédité : on suppose que F(n − 1) se termine et renvoie le bon résultat ; F(n) est fait d'opérations élémentaires et d'appels à F(n − 1), donc se termine ; avec l'équation de récurrence, il renvoie le bon résultat. Conclusion : pour tout n.")]}),

/* ------------------------------------------------------------------ */
A2({id:"a2-compter",t:"Compter les opérations : Tₙ, Vₙ, équation de complexité",min:14,goal:"Calculer la complexité en temps et en espace d'un algorithme, itératif ou récursif, comme dans les « À vous de jouer » du cours (diapos 67 à 74) et l'examen de janvier 2023.",steps:[
 L("Ce qu'on compte",`<p><b>Motivation</b> (diapo 67). Un algorithme efficace, une fois traduit en programme, consomme peu de ressources et fonctionne vite. Idée : compter le nombre d'opérations et l'espace mémoire de l'algorithme.</p><ul><li>Simplification : 1 opération élémentaire = 1 unité de temps, 1 variable élémentaire = 1 unité de mémoire.</li><li>Simplification : ils dépendent uniquement d'un entier appelé <b>taille de l'entrée</b>, exceptionnellement deux.</li><li>S'ils dépendent de la configuration des données, on regarde uniquement celle qui consomme le plus de ressources (<b>pire cas</b>).</li></ul><p><b>Notations</b> (diapo 68). On note <b>T<sub>n</sub></b> le nombre d'opérations élémentaires et <b>V<sub>n</sub></b> l'espace mémoire occupé. Ce sont des suites d'entiers positifs. T<sub>n</sub> est la <b>complexité en temps</b>, ou complexité de l'algorithme. V<sub>n</sub> est sa <b>complexité en espace</b>.</p><p>Une opération élémentaire : une affectation (←), un calcul (+, −, *, div…), une comparaison, un accès à une case T[i], un appel.</p>`),
 L("Diapo 69 : compter dans F1",`${C(`FONCTION : F1 (E n : entier) : entier
Variable : res : entier
DÉBUT
    res ← 1
    pour i de 1 à n faire
        res ← res * i
    fin pour;
    Renvoyer res
FIN`)}<p>Réponse écrite par le prof en amphi :</p><ul><li>« res ← 1 » : 1 opération.</li><li>« res ← res * i » : 2 opérations (la multiplication et l'affectation), faites n fois : 2n.</li><li>Donc <b>T<sub>n</sub> = 2n + 1</b>.</li><li>1 variable (res) : <b>V<sub>n</sub> = 1</b>.</li></ul>`),
 S("Diapo 70 : compter dans le pire cas","Calculer Tₙ et Vₙ dans le pire cas. On note n = taille(T). (La diapo imprimée écrit « i&lt;=taille(T) » ; le prof a barré le = en amphi.)",[
  {w:"Pire cas : le cas où il parcourt tout le tableau (toutes les cases valent 0). Il y a alors n tours de boucle.",why:"Le nombre de tours dépend du contenu de T : on prend la configuration qui consomme le plus."},
  {w:"« i ← 0 » : 1 opération.",why:"Une affectation."},
  {w:"Le test du tant que fait 5 opérations : la comparaison de i avec taille(T), l'appel taille(T), le « et », l'accès T[i], la comparaison avec 0. Il est vérifié n + 1 fois : 5(n + 1).",why:"n fois où il est vrai, plus une dernière fois où il est faux et fait sortir de la boucle."},
  {w:"« i ← i+1 » : 2 opérations (l'addition et l'affectation), n fois : 2n.",why:"Une fois par tour."},
  {w:"T<sub>n</sub> = 1 + 5(n + 1) + 2n = 7n + 6 dans le pire cas (ou 7n + 4 avec l'évaluation paresseuse). 1 variable : V<sub>n</sub> = 1.",why:"Évaluation paresseuse : au dernier test, « i<taille(T) » est faux, donc la suite du « et » n'est pas calculée : ni l'accès T[i], ni la comparaison avec 0. Ce dernier test fait 2 opérations de moins : 7n + 6 − 2 = 7n + 4. C'est ce que le prof a écrit en amphi."}],{code:`FONCTION : F4 (E T : tableau d'entier) : entier
Variable : i : nombre
DÉBUT
    i ← 0
    tant que i<taille(T) et T[i]=0 faire
        i ← i+1
    fin tq;
    Renvoyer i
FIN`}),
 Q("Dans F4, quel est le meilleur cas (celui qui fait le moins d'opérations) ?",["T[0] ≠ 0 : le test est faux dès le début, aucun tour de boucle","Toutes les cases valent 0 : chaque test est vite fait","Le tableau est trié : on trouve tout de suite ce qu'on cherche"],0,"Le nombre d'opérations dépend ici des données. Par convention du cours, la complexité est celle du pire cas : toutes les cases valent 0.",{diag:false,ctx:true}),
 L("Compter pour un algorithme récursif : l'équation de complexité",`<p><b>Problématique</b> (diapo 71). Lorsqu'on appelle un algorithme récursif, il effectue des opérations et occupe de l'espace. Puis il s'appelle, et les appels effectuent des opérations et occupent de l'espace…</p><p><b>Solution.</b> T<sub>n</sub> = opérations de l'algorithme + opérations faites dans ses appels. T<sub>n</sub> est une suite définie par une équation récurrente appelée <b>équation de complexité</b>, il reste à l'exprimer directement en fonction de n. C'est pareil pour V<sub>n</sub>.</p><p><b>Exemple</b> (diapo 72), la factorielle récursive :</p>${C(`FONCTION : F2 (E n : entier) : entier
DÉBUT
    si n=0 alors
        Renvoyer 1
    sinon
        Renvoyer n*F2(n-1)
    fin si;
FIN`)}<ul><li><b>Cas de base</b> : si n = 0, 1 comparaison : T<sub>0</sub> = 1.</li><li><b>Équation de complexité</b> : si n > 0 : 1 comparaison, 1 multiplication, 1 appel, 1 soustraction + les opérations de F2(n-1) : T<sub>n</sub> = 4 + T<sub>n−1</sub>.</li><li><b>Résolution</b> : T<sub>n</sub> est une suite arithmétique : T<sub>n</sub> = 4n + 1.</li></ul><p>(Suite arithmétique : on ajoute toujours le même nombre, ici 4. En partant de T<sub>0</sub> = 1, après n fois : 1 + 4n.)</p>`),
 Q("Examen de janvier 2023 : F renvoie F(n-1) / (1+F(n-1)) si n ≠ 0, et on compte seulement les opérations arithmétiques (T<sub>0</sub> = 0). Quelle est l'équation de complexité ?",["T<sub>n</sub> = 2T<sub>n−1</sub> + 4","T<sub>n</sub> = T<sub>n−1</sub> + 4","T<sub>n</sub> = 2T<sub>n−1</sub> + 2"],0,"Corrigé officiel : « 2 appels au rang n − 1, une addition, une division, deux soustractions ». F(n-1) est écrit deux fois : il est calculé deux fois, et chaque n-1 est une soustraction."),
 L("Quand la taille de l'entrée est divisée",`<p>Diapo 73. « n mod 2 » est le reste de la division de n par 2, « n div 2 » son quotient.</p>${C(`FONCTION : F5 (E n : entier) : booléen
SPÉCIFICATIONS : détermine si n ∈ ℕ* est une puissance de 2.
DÉBUT
    si n=1 alors
        Renvoyer true
    sinon si n mod 2 = 1 alors
        Renvoyer false
    sinon
        Renvoyer F5(n div 2)
    fin si;
FIN`)}<ul><li><b>Pire cas</b> : quand n est une puissance de 2 (n = 2<sup>k</sup>) car on fait un maximum d'appels récursifs jusqu'à tomber sur 1.</li><li><b>Cas de base</b> : T<sub>1</sub> = 1 (1 comparaison).</li><li><b>Équation de complexité</b> : si n > 1 : 5 opérations + celles de F5(n div 2) : T<sub>n</sub> = 5 + T<sub>n div 2</sub>.</li><li><b>Résolution</b> : depuis le cas de base, on ajoute 5 autant de fois que n = 2<sup>k</sup> peut être divisé par 2, c'est-à-dire k fois : T<sub>n</sub> = 1 + 5k = 1 + 5 log<sub>2</sub>(n).</li></ul><p><b>log<sub>2</sub>(n)</b> : le nombre de fois qu'il faut diviser n par 2 pour arriver à 1. Si n = 2<sup>k</sup>, alors log<sub>2</sub>(n) = k. Exemples : log<sub>2</sub>(8) = 3, log<sub>2</sub>(128) = 7, log<sub>2</sub>(1024) = 10.</p>`),
 Q("Avec ce comptage, combien d'opérations fait F5(64) ?",["31","64","13","321"],0,"64 = 2⁶, donc log<sub>2</sub>(64) = 6 et T<sub>64</sub> = 1 + 5 × 6 = 31. Pour une entrée 64 fois plus grande que 1, seulement 30 opérations de plus.",{diag:false,ctx:true}),
 P("Cours, diapo 74 : estPair, sur papier",`<p>Complexité en soustractions ? Compléter le raisonnement.</p>${C(`FONCTION : estPair (E n : entier) : booléen
DÉBUT
    Renvoyer cond(n=0, true, cond(n=1, false, estPair(n-2)))
FIN`)}<ul><li><b>Cas de base :</b></li><li><b>Équation de complexité :</b></li><li><b>Résolution :</b> valeurs de T<sub>n</sub> : … Généralisation :</li></ul><p>(On compte seulement les soustractions.)</p>`,`<p>Cette diapo n'est pas annotée dans le fichier du prof : corrigé écrit par moi, vérifié par programme.</p><ul><li><b>Cas de base</b> : pour n = 0 et n = 1, aucune soustraction : T<sub>0</sub> = 0 et T<sub>1</sub> = 0.</li><li><b>Équation de complexité</b> : si n ≥ 2, une soustraction (n-2) + celles de estPair(n-2) : T<sub>n</sub> = 1 + T<sub>n−2</sub>.</li><li><b>Résolution</b> : valeurs de T<sub>n</sub> pour n = 0, 1, 2, 3, 4, 5, 6, 7 : 0, 0, 1, 1, 2, 2, 3, 3.</li><li><b>Généralisation</b> : T<sub>n</sub> = n div 2 (le quotient de n par 2).</li></ul><p>L'ordre de complexité est donc n : l'algorithme est linéaire (leçon suivante).</p>`,["Deux cas de base : n = 0 et n = 1","L'équation relie T<sub>n</sub> à T<sub>n−2</sub>, pas à T<sub>n−1</sub>","Les premières valeurs écrites avant de généraliser","T<sub>n</sub> = n div 2"],7),
 K("Que désignent T<sub>n</sub>, V<sub>n</sub> et le « pire cas » quand on mesure la complexité d'un algorithme ?","T<sub>n</sub> : nombre d'opérations élémentaires, la complexité en temps. V<sub>n</sub> : espace mémoire occupé, la complexité en espace. n : la taille de l'entrée. Si le nombre d'opérations dépend de la configuration des données, on regarde uniquement celle qui consomme le plus de ressources : le pire cas."),
 K("Comment compte-t-on les opérations d'un algorithme récursif ?","T<sub>n</sub> = opérations de l'algorithme + opérations faites dans ses appels : c'est l'équation de complexité. On écrit le cas de base, l'équation, puis on la résout. Exemple : T<sub>0</sub> = 1, T<sub>n</sub> = 4 + T<sub>n−1</sub>, donc T<sub>n</sub> = 4n + 1."),
 K("Que vaut log<sub>2</sub>(n) quand n = 2<sup>k</sup> ?","k : le nombre de fois qu'il faut diviser n par 2 pour arriver à 1. log<sub>2</sub>(128) = 7, log<sub>2</sub>(1024) = 10.")]}),

/* ------------------------------------------------------------------ */
A2({id:"a2-notations",t:"L'ordre de complexité : θ, o, ω, O, Ω",min:15,goal:"Trouver l'ordre de complexité d'une suite, utiliser θ, o, ω, O, Ω, et estimer un temps d'exécution (cours diapos 75 à 80, TD 7, CC 2022 et 2024, examen de janvier 2023).",steps:[
 L("Les suites de référence",`<p><b>Outils mathématiques</b> (diapo 75). T<sub>n</sub> et V<sub>n</sub> sont des suites d'entiers positifs souvent croissantes. Plutôt que leur expression exacte, on va les rattacher à une <b>suite de référence</b> R<sub>n</sub> qui a la même vitesse de croissance (« comparaison asymptotique »). Cette suite de référence est appelée <b>ordre de complexité</b> de l'algorithme.</p><p><b>Principales suites de référence dans l'ordre</b> (diapo 76) :</p><ul><li>1 (à coût constant)</li><li>log(n) (logarithmique)</li><li>n (linéaire)</li><li>n.log(n) (pseudo-linéaire)</li><li>n² (quadratique)</li><li>n³ (cubique)</li><li>n<sup>a</sup> avec a > 0 (polynômiale), n<sup>a</sup> log(n) avec a > 0</li><li>b<sup>n</sup> avec b > 1 (exponentielle)</li><li>n! (factorielle)</li></ul><p>(« Asymptotique » : quand n devient très grand.)</p>`,{fig:"a-complexite"}),
 O("Range ces suites de référence dans l'ordre du cours, de celle qui grandit le moins vite à celle qui grandit le plus vite.",["1","log(n)","n","n.log(n)","n²","n³","2ⁿ","n!"],"1 (coût constant), log(n), n (linéaire), n.log(n) (pseudo-linéaire), n² (quadratique), n³ (cubique), puis les exponentielles comme 2ⁿ, et enfin n!.",{lang:"txt"}),
 L("θ, o, ω : on divise par la suite de référence",`<p><b>Trouver l'ordre de complexité</b> (diapo 77). On divise T<sub>n</sub> par une suite de référence R<sub>n</sub> et on fait tendre n vers +∞.</p><ul><li>si T<sub>n</sub>/R<sub>n</sub> est borné entre deux nombres strictement positifs, en particulier si T<sub>n</sub>/R<sub>n</sub> → a > 0, alors T<sub>n</sub> est équivalente à R<sub>n</sub> ou de l'ordre de complexité R<sub>n</sub>. On note <b>T<sub>n</sub> = θ(R<sub>n</sub>)</b>.</li><li>si T<sub>n</sub>/R<sub>n</sub> → 0 alors T<sub>n</sub> est strictement dominée par R<sub>n</sub>. On note <b>T<sub>n</sub> = o(R<sub>n</sub>)</b>.</li><li>si T<sub>n</sub>/R<sub>n</sub> → +∞ alors T<sub>n</sub> domine strictement R<sub>n</sub>. On note <b>T<sub>n</sub> = ω(R<sub>n</sub>)</b>.</li><li>sinon, T<sub>n</sub> n'est pas comparable à R<sub>n</sub>. C'est rare.</li></ul><p><b>Attention.</b> « Équivalentes » ne veut pas dire « identiques » : si T<sub>n</sub> = 1000000R<sub>n</sub> ou T<sub>n</sub> = R<sub>n</sub> + 1000000 alors T<sub>n</sub> et R<sub>n</sub> sont équivalentes !</p><p>Exemple : T<sub>n</sub> = 2n + 1 (la complexité de F1). T<sub>n</sub>/n = 2 + 1/n tend vers 2 > 0 : T<sub>n</sub> = θ(n). F1 est linéaire.</p><p>Le cours écrit θ ; certains sujets écrivent Θ : c'est la même notation.</p>`),
 Q("CC1 de novembre 2024 (un des 4 sujets) : « Un algorithme de complexité Θ(log(n)) peut-il être mille fois plus lent qu'un autre algorithme de complexité Θ(log(n)) ? Justifier. »",["Oui : par exemple le premier fait 1000 log n opérations et le deuxième log n opérations","Non : deux algorithmes en Θ(log(n)) font le même nombre d'opérations","Non : un algorithme en Θ(log(n)) est toujours rapide, l'écart reste petit","Oui, mais seulement pour les petites valeurs de n"],0,"Corrigé officiel : « Oui, si par exemple le premier fait 1000 log n opérations et le deuxième log n opérations. » C'est le « Attention » du cours : 1000 log n / log n = 1000, un nombre strictement positif, donc les deux sont en θ(log(n)). Les autres sujets posaient la question avec Θ(n³), Θ(n²) et Θ(n.log(n)). Avec 1000 log n contre log n, l'écart de 1000 vaut pour tous les n, pas seulement les petits."),
 L("O et Ω, et trois propriétés",`<p><b>Vocabulaire</b> (diapo 78). Domination stricte ou équivalence = domination au sens large. On utilise la majuscule de la domination stricte :</p><ul><li><b>T<sub>n</sub> = O(R<sub>n</sub>)</b> : T<sub>n</sub> = o(R<sub>n</sub>) ou T<sub>n</sub> = θ(R<sub>n</sub>). T<sub>n</sub> est dominée par R<sub>n</sub> au sens large.</li><li><b>T<sub>n</sub> = Ω(R<sub>n</sub>)</b> : T<sub>n</sub> = ω(R<sub>n</sub>) ou T<sub>n</sub> = θ(R<sub>n</sub>). T<sub>n</sub> domine R<sub>n</sub> au sens large.</li></ul><p><b>Propriétés</b> (diapo 80) :</p><ul><li>tous les logarithmes sont du même ordre de grandeur : log<sub>10</sub>(n) = θ(log<sub>2</sub>(n)) = θ(ln(n)) etc.</li><li>o, O, ω, Ω, θ sont transitives : si a = o(b) et b = o(c) alors a = o(c) et de même pour O, ω, Ω, θ.</li><li>o, O, ω, Ω, θ sont multiplicatives et additives sur les suites > 0 : si a = o(a′) et b = o(b′) alors ab = o(a′b′) et a + b = o(a′ + b′), et de même pour O, ω, Ω, θ.</li></ul><p>En pratique : dans une somme, on garde le terme qui grandit le plus vite, et on oublie sa constante. 3n³ − 5n + 2 = θ(n³).</p>`),
 Q("(a<sub>n</sub>) et (b<sub>n</sub>) sont deux suites strictement positives, avec a<sub>n</sub> = o(b<sub>n</sub>). Laquelle de ces affirmations est vraie ?",["a<sub>n</sub> = O(b<sub>n</sub>)","a<sub>n</sub> = Ω(b<sub>n</sub>)","a<sub>n</sub> = θ(b<sub>n</sub>)"],0,"O veut dire « o ou θ » : si a est strictement dominée par b, elle est dominée au sens large. En revanche a<sub>n</sub>/b<sub>n</sub> tend vers 0 : ce n'est ni θ ni Ω. Le QCM du CC de 2022 testait ce genre d'implication ; sa seule case vraie était « si a<sub>n</sub> = θ(b<sub>n</sub>) alors a<sub>n</sub> = O(b<sub>n</sub>) »."),
 S("TD 7, exercice 30 : A en θ(n²), B en θ(n log n)","L'exécution de A dure 1 seconde avec n = 100, celle de B dure 10 s avec n = 100. (2) On suppose les temps proportionnels à n² et n log(n) : calculer les coefficients. (3) Quel algorithme pour n = 1000 ? (4) Pour n = 10000 ?",[
  {w:"Pour A : 1 = k<sub>A</sub> × 100², donc k<sub>A</sub> = 0,0001.",why:"« Proportionnel à n² » : temps = k<sub>A</sub> × n². On remplace par la mesure connue."},
  {w:"Pour B : 10 = k<sub>B</sub> × 100 × log(100) = k<sub>B</sub> × 200, donc k<sub>B</sub> = 0,05.",why:"Avec le logarithme en base 10, log(100) = 2 car 100 = 10². Une autre base change k<sub>B</sub>, pas les conclusions."},
  {w:"n = 1000 : A met 0,0001 × 1000² = 100 s. B met 0,05 × 1000 × 3 = 150 s. Il faut choisir A.",why:"log(1000) = 3. Pour cette taille, l'algorithme d'ordre le plus grand est encore le plus rapide."},
  {w:"n = 10000 : A met 0,0001 × 10000² = 10 000 s. B met 0,05 × 10000 × 4 = 2000 s. Il faut choisir B.",why:"Pour n assez grand, l'ordre de complexité le plus petit finit toujours par gagner."},
  {w:"Question 1 du TD : pourquoi fallait-il plus d'informations ? Parce que θ ne donne que l'ordre : un temps en θ(n²) peut être n², 1000000n² ou n² + 1000000.",why:"« Équivalentes » ne veut pas dire « identiques »."}]),
 Q("TD 7, exercice 31 : un ordinateur Y est 100 fois plus rapide que X, et le temps d'exécution est proportionnel à n². X traite une taille n<sub>0</sub> en 1 minute. Quelle taille Y traite-t-il dans la même durée ?",["10 n<sub>0</sub>","100 n<sub>0</sub>","n<sub>0</sub> + 100","2 n<sub>0</sub>"],0,"En 1 minute, Y fait 100 fois plus d'opérations : n² = 100 × n<sub>0</sub>², donc n = 10 n<sub>0</sub>. Avec un temps proportionnel à 2<sup>n</sup> (question 2 du TD), on trouve seulement n<sub>0</sub> + 6 : 2<sup>n</sup> = 100 × 2<sup>n<sub>0</sub></sup> donne n = n<sub>0</sub> + log<sub>2</sub>(100), environ n<sub>0</sub> + 6,6."),
 P("Cours, diapo 79 : trouver l'ordre de complexité, sur papier",`<p>Trouver l'ordre de complexité, c'est-à-dire la suite de référence équivalente à T<sub>n</sub> :</p><ol><li>T<sub>n</sub> = 3n³ − 5n + 2</li><li>T<sub>n</sub> = 2<sup>n+1</sup> − 8n³</li><li>T<sub>n</sub> = 3n log(n²) + 5</li><li>T<sub>n</sub> = 2T<sub>n−1</sub></li><li>T<sub>n</sub> = T<sub>n−1</sub> + n</li><li>T<sub>n</sub> = 3n + 1 si n est pair et T<sub>n</sub> = 2n si n est impair</li></ol><p>Rappels : log(n²) = 2 log(n), et 1 + 2 + … + n = n(n + 1)/2.</p>`,`<p><b>Réponses écrites par le prof en amphi.</b></p><ol><li>T<sub>n</sub> = θ(n³).</li><li>2<sup>n+1</sup> = 2 × 2<sup>n</sup> : T<sub>n</sub> = θ(2<sup>n</sup>).</li><li>log(n²) = 2 log n, donc T<sub>n</sub> ≈ 6n log n : T<sub>n</sub> = θ(n log n).</li><li>Avec T<sub>0</sub> = 1 : T<sub>n</sub> = 2 × 2 × 2 × … × T<sub>0</sub>, avec n fois le facteur 2, soit 2<sup>n</sup> : T<sub>n</sub> = θ(2<sup>n</sup>).</li><li>T<sub>n</sub> = n + (n − 1) + (n − 2) + … + 1 + T<sub>0</sub> = n(n + 1)/2 + T<sub>0</sub> = ½n² + ½n + T<sub>0</sub> ∈ θ(n²).</li><li>3n + 1 = θ(n) et 2n = θ(n) : T<sub>n</sub> = θ(n).</li></ol><p><b>Pourquoi</b> (mes explications). On garde le terme qui grandit le plus vite et on oublie sa constante. 1 : T<sub>n</sub>/n³ tend vers 3. 2 : 8n³ est strictement dominée par 2<sup>n</sup>. 6 : T<sub>n</sub>/n reste entre 2 et 4, deux nombres strictement positifs, même s'il n'a pas de limite.</p>`,["Une suite de référence pour chaque ligne, sans constante devant","Ligne 3 : log(n²) = 2 log n","Lignes 4 et 5 : la suite écrite en fonction de n avant de conclure","Ligne 6 : θ(n), même sans limite"],7),
 K("Que fait le rapport T<sub>n</sub>/R<sub>n</sub> quand T<sub>n</sub> = θ(R<sub>n</sub>) ? Quand T<sub>n</sub> = o(R<sub>n</sub>) ? Quand T<sub>n</sub> = ω(R<sub>n</sub>) ?","θ : il reste entre deux nombres strictement positifs (par exemple il tend vers a > 0). o : il tend vers 0. ω : il tend vers +∞. O = o ou θ ; Ω = ω ou θ."),
 K("Quelles sont les suites de référence pour comparer des complexités, de celle qui grandit le moins vite à celle qui grandit le plus vite ?","1, log(n), n, n.log(n), n², n³, n<sup>a</sup>, b<sup>n</sup> (b > 1), n!. Constant, logarithmique, linéaire, pseudo-linéaire, quadratique, cubique, polynômiale, exponentielle, factorielle."),
 K("Un algorithme en θ(n²) peut-il être un million de fois plus lent qu'un autre en θ(n²) ?","Oui, si par exemple le premier fait 1000000n² opérations et le deuxième n² opérations. (Corrigé officiel du CC1 2024.) « Équivalentes » ne veut pas dire « identiques ».")]}),

/* ------------------------------------------------------------------ */
A2({id:"a2-boucles",t:"Boucles imbriquées et master theorem",min:16,goal:"Trouver l'ordre de complexité de boucles pour (somme ou raccourci) et d'un algorithme récursif dont la taille est divisée, avec le master theorem (cours diapos 81 à 86, TD 8, CC 2022, examens de 2023).",steps:[
 L("Une boucle pour, c'est une somme",`<p>Diapo 81. Compter le nombre d'opérations dans un pour revient à calculer une somme ayant les mêmes indices.</p>${C(`pour i de 1 à n faire
    pour j de 1 à i faire
        op élém
    fin pour;
fin pour;`)}<p>(« op élém » : une opération élémentaire.) Pour une valeur de i, la boucle sur j fait i opérations. En tout :</p><div class="formula">T<sub>n</sub> = 1 + 2 + … + n = n(n + 1)/2</div><p>Le cours l'écrit avec le signe Σ (« somme ») : T<sub>n</sub> = Σ<sub>i=1..n</sub> Σ<sub>j=1..i</sub> 1.</p><p><b>Formules utiles</b> :</p><ul><li>1 + 2 + … + n = n(n + 1)/2</li><li>1² + 2² + … + n² = n(n + 1)(2n + 1)/6</li><li>1³ + 2³ + … + n³ = n²(n + 1)²/4</li></ul>`,{fig:"a-calcul-complexite"}),
 Q("TD 8, exercice 34 (5) : combien d'additions fait ce fragment ?",["n(n + 1)/2","n²","n","n(n − 1)/2"],0,"Pour une valeur de i, j va de i à n : n − i + 1 valeurs. La somme vaut n + (n − 1) + … + 1 = n(n + 1)/2, comme quand j va de 1 à i.",{code:`Pour i de 1 à n faire
    Pour j de i à n faire
        som ← som+1`}),
 L("Le raccourci pour des boucles imbriquées",`<p>Diapo 82. En lisant les bornes du pour, on obtient une estimation O de la complexité.</p>${C(`pour i de 1 à n faire
    pour j de 1 à i faire
        op élém
    fin pour;
fin pour;`)}<ul><li>i prend n valeurs,</li><li>j prend moins de n valeurs donc O(n),</li><li>chaque itération fait O(1) opérations (indépendant de n),</li><li>donc T<sub>n</sub> = n × O(n) × O(1) = O(n²).</li></ul><p><b>Remarque</b> : on peut mettre θ à la place de O mais c'est plus difficile à justifier !</p><p>(Le raccourci donne O, « au plus » : il majore le nombre de tours de la boucle du dedans. Le calcul exact de l'écran précédent, n(n + 1)/2, donne θ(n²).)</p>`),
 S("Cours, diapo 83 : trois ordres de complexité","Les réponses écrites par le prof en amphi. Il compte 2 opérations pour « som ← som+1 » (l'addition et l'affectation).",[
  {w:"Fragment 1 : n × n × 2. T<sub>n</sub> = 2n² ∈ θ(n²).",why:"i prend n valeurs, j aussi, et chaque passage fait 2 opérations."},
  {w:"Fragment 2, calcul exact : la somme, pour i de 1 à n, j de 1 à i et k de j à i, de 2. Pour i et j fixés, k prend i − j + 1 valeurs.",why:"Trois pour imbriqués : trois sommes avec les mêmes indices."},
  {w:"En additionnant sur j : 2 × (1 + 2 + … + i) = i(i + 1). Puis sur i : la somme des i² + i, soit n(n + 1)(2n + 1)/6 + n(n + 1)/2 = θ(n³).",why:"On reconnaît les deux premières formules utiles. Le terme qui grandit le plus vite est n³/3."},
  {w:"Fragment 2, version rapide : n × O(n) × O(n) × 2 = O(n³).",why:"Le raccourci : i prend n valeurs, j et k moins de n valeurs chacun."},
  {w:"Fragment 3 : la boucle continue tant que i² &lt; n, c'est-à-dire i &lt; √n. Environ 1 + 4√n opérations : θ(√n).",why:"i augmente de 1 à chaque itération, donc √n itérations ; à chacune, le carré, la comparaison, l'addition et l'affectation ; plus « i ← 0 »."}],{code:`1  Pour i de 1 à n faire
      Pour j de 1 à n faire
         som ← som+1

2  Pour i de 1 à n faire
      Pour j de 1 à i faire
         Pour k de j à i faire
            som ← som+1

3  i ← 0
   TantQue i²<n faire
      i ← i+1
   finTq`}),
 L("Le master theorem",`<p><b>Idée</b> (diapo 84). Donner une estimation O de l'ordre de complexité d'un algorithme récursif quand les appels se font avec une taille d'entrée divisée.</p><p><b>Master Theorem</b> : s'il existe quatre entiers a ≥ 0, b > 1, d ≥ 0 et n<sub>0</sub> > 0 tels que, pour tout n ≥ n<sub>0</sub>, T(n) ≤ aT(⌈n/b⌉) + O(n<sup>d</sup>), alors</p><ul><li>T(n) = O(n<sup>d</sup>) si b<sup>d</sup> > a ;</li><li>T(n) = O(n<sup>d</sup> log n) si b<sup>d</sup> = a ;</li><li>T(n) = O(n<sup>log a / log b</sup>) si b<sup>d</sup> &lt; a.</li></ul><p><b>Remarque</b> : a représente le nombre d'appels récursifs dans le corps de l'algorithme, b l'entier par lequel la taille de l'entrée est divisée à chaque appel, O(n<sup>d</sup>) les opérations de l'algorithme en plus des appels récursifs.</p><p>(⌈x⌉ : x arrondi à l'entier du dessus. ⌊x⌋ : x arrondi à l'entier du dessous ; ⌊n/2⌋, c'est n div 2.)</p><p><b>Exemple du cours</b> (diapo 85) :</p>${C(`FONCTION : F3 (E n : entier) : entier
DÉBUT
    si n=0 alors
        Renvoyer 0
    sinon
        Renvoyer n+2*F3(n div 2)
    fin si;
FIN`)}<p>À partir de n=1 (n<sub>0</sub> = 1), F3 fait 1 appel récursif (a = 1) au rang ⌊n/2⌋ (b = 2). En dehors des appels, il effectue O(1) = O(n<sup>0</sup>) opérations (d = 0). On est dans le cas b<sup>d</sup> = a donc T<sub>n</sub> = O(n<sup>0</sup> log(n)) = O(log(n)) : l'algorithme est logarithmique.</p>`),
 Q("Dans le master theorem, que représente a ?",["Le nombre d'appels récursifs dans le corps de l'algorithme","L'entier par lequel la taille de l'entrée est divisée à chaque appel","L'exposant de n dans les opérations faites en plus des appels"],0,"a : le nombre d'appels. b : l'entier par lequel la taille est divisée. d : l'exposant dans O(n<sup>d</sup>), les opérations en plus des appels. Question de cours du CC de 2022 : « À quoi sert le master theorem ? » Corrigé officiel : « Il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel. »"),
 B("Cours, diapo 86 : « Trouver a, b, d et un ordre de complexité ». Choisis ce que le prof a écrit.",`Les deux pour imbriqués font θ(n²) opérations : d = [[0]]
Deux appels F(n div 2) : a = [[1]]
La taille est divisée par 2 : b = [[2]]
Équation : Tₙ = 2T(⌊n/2⌋) + O(n²)
b^d = [[3]] , à comparer avec a = 2 : b^d > a
Donc Tₙ = O(n^d) = [[4]] : l'algorithme est quadratique.`,[{o:["2","1","0"],a:0},{o:["2","1","4"],a:0},{o:["2","1","4"],a:0},{o:["4","2","1"],a:0},{o:["O(n²)","O(n² log n)","O(n)"],a:0}],"Réponses écrites par le prof en amphi : T<sub>n</sub> = 2T<sub>⌊n/2⌋</sub> + O(n²), b<sup>d</sup> = 4, a = 2, T<sub>n</sub> = O(n<sup>d</sup>) = O(n²), « algo quadratique ».",{lang:"txt",show:`PROCÉDURE : F (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ
DÉBUT
    si n ≠ 1 alors
        pour i de 0 à n-1 faire
            pour j de 0 à n-1 faire
                op élém
            fin pour;
        fin pour;
        F(n div 2)
        F(n div 2)
    fin si;
FIN`,showLang:"pseudo"}),
 Q("Examen de janvier 2023 : pour n ≠ 0, G(n, d) affiche n fois d, passe à la ligne, puis appelle G(n div 2, d) et G(n div 2, d+1). Que donne le master theorem ?",["a = 2, b = 2, d = 1 : b<sup>d</sup> = a, donc O(n log(n))","a = 2, b = 2, d = 1 : b<sup>d</sup> > a, donc O(n)","a = 1, b = 2, d = 0 : b<sup>d</sup> = a, donc O(log(n))"],0,"Corrigé officiel : « Le nombre d'opérations élémentaires T<sub>n</sub> effectuées par l'appel G(n, d) vérifie, pour n > 0 : T<sub>n</sub> = θ(n) + 2T<sub>⌊n/2⌋</sub>. Par application du master theorem avec a = 2, b = 2, d = 1, on a b<sup>d</sup> = a donc T<sub>n</sub> = O(n log(n)). » Attention : le d du théorème n'est pas le paramètre d de G."),
 P("TD 8, exercice 35, algorithmes 1 et 2, sur papier",`<p>Pour chacun des algorithmes suivants, on appelle T<sub>n</sub> le nombre d'opérations élémentaires que fait l'algorithme pour la taille d'entrée n. Déterminer la ou les équations de récurrence régissant T<sub>n</sub> puis les résoudre de manière exacte ou, si c'est impossible, en appliquant le master theorem :</p><p><b>Algorithme 1</b></p>${C(`Fonction : F (E n : entier) : entier
Spécifications : n est un entier naturel
Début
    Si n=0 alors
        Renvoyer 1
    Sinon
        Renvoyer F(n-1)+F(n-1)
    FinSi
Fin`)}<p><b>Indication :</b> montrer que la suite (U<sub>n</sub>) définie par U<sub>n</sub> = T<sub>n</sub> + 6 est géométrique.</p><p><b>Algorithme 2</b></p>${C(`Fonction : G (E n : entier) : entier
Spécifications : n est un entier naturel
Variables : som : nombre
Début
    Si n=0 alors
        Renvoyer 1
    Sinon
        som ← 0
        Pour i de 1 à n faire
            som ← som + i*i
        finPour
        Renvoyer F(n div 2)+som
    FinSi
Fin`)}<p>(Suite géométrique : on multiplie toujours par le même nombre, la raison. Si U<sub>n</sub> = 2U<sub>n−1</sub>, alors U<sub>n</sub> = U<sub>0</sub> × 2<sup>n</sup>.)</p>`,`<p><b>Une remarque d'abord.</b> Dans la feuille, G appelle « F ». L'exercice n'a de sens pour le master theorem que si G s'appelle lui-même : G(n div 2). C'est ce que je suppose. On compte comme dans le cours (diapo 72) : une comparaison, un calcul, une affectation ou un appel comptent chacun pour 1.</p><p><b>Algorithme 1.</b> Cas de base : si n = 0, 1 comparaison : T<sub>0</sub> = 1. Si n > 0 : 1 comparaison, 2 soustractions (n-1 deux fois), 2 appels, 1 addition, plus les opérations des deux appels :</p><div class="formula">T<sub>n</sub> = 6 + 2T<sub>n−1</sub></div><p>Avec U<sub>n</sub> = T<sub>n</sub> + 6 : U<sub>n</sub> = 2T<sub>n−1</sub> + 12 = 2(T<sub>n−1</sub> + 6) = 2U<sub>n−1</sub>. La suite (U<sub>n</sub>) est géométrique de raison 2, et U<sub>0</sub> = 7. Donc U<sub>n</sub> = 7 × 2<sup>n</sup> et <b>T<sub>n</sub> = 7 × 2<sup>n</sup> − 6</b> : l'ordre de complexité est 2<sup>n</sup>, l'algorithme est exponentiel.</p><p><b>Algorithme 2.</b> T<sub>0</sub> = 1. Si n > 0 : 1 comparaison, 1 affectation, n tours de boucle à 3 opérations (une multiplication, une addition, une affectation), puis 1 division entière, 1 appel, 1 addition, plus les opérations de l'appel :</p><div class="formula">T<sub>n</sub> = T<sub>n div 2</sub> + 3n + 5</div><p>La taille est divisée : master theorem. 1 appel récursif (a = 1), taille divisée par 2 (b = 2), O(n) opérations en plus de l'appel (d = 1). Comme b<sup>d</sup> = 2 > a = 1 : <b>T<sub>n</sub> = O(n)</b>.</p><p>(Corrigé écrit par moi. Les valeurs T = 1, 8, 22, 50… de l'algorithme 1 ont été recalculées par programme. Si tu comptes les opérations un peu autrement, les constantes changent, pas les ordres.)</p>`,["Algorithme 1 : T<sub>0</sub>, puis une équation avec 2T<sub>n−1</sub> (deux appels)","U<sub>n</sub> = 2U<sub>n−1</sub> écrit, puis T<sub>n</sub> en fonction de n","Algorithme 2 : l'équation avec T<sub>n div 2</sub> et un terme en n","a, b, d nommés, b<sup>d</sup> comparé à a, puis la conclusion en O"],12),
 K("Le master theorem part de T(n) ≤ aT(⌈n/b⌉) + O(n<sup>d</sup>). Quels sont ses trois cas, et que représentent a, b et d ?","O(n<sup>d</sup>) si b<sup>d</sup> > a ; O(n<sup>d</sup> log n) si b<sup>d</sup> = a ; O(n<sup>log a / log b</sup>) si b<sup>d</sup> &lt; a. a : nombre d'appels récursifs, b : entier par lequel la taille est divisée, O(n<sup>d</sup>) : opérations en plus des appels."),
 K("À quoi sert le master theorem ?","Il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel. (Corrigé officiel du CC 2022.)"),
 K("Quelles sont les formules du cours pour 1 + 2 + … + n, pour 1² + 2² + … + n² et pour 1³ + 2³ + … + n³ ?","1 + 2 + … + n = n(n + 1)/2 ; 1² + 2² + … + n² = n(n + 1)(2n + 1)/6 ; 1³ + 2³ + … + n³ = n²(n + 1)²/4."),
 K("Comment estimer rapidement la complexité de boucles pour imbriquées, sans calculer la somme exacte ?","On lit les bornes : si i prend n valeurs, j au plus n valeurs, et chaque itération O(1) opérations, alors T<sub>n</sub> = n × O(n) × O(1) = O(n²). Il donne une estimation O ; pour θ, il faut calculer la somme.")]}),

/* ------------------------------------------------------------------ */
/* CC3 : recherche et tris (diapos 87 à 114). Ces chapitres ne sont pas encore faits en amphi le 11/11 :
   les « À vous de jouer » sont corrigés par moi (vérifiés par programme), à remplacer par les réponses du prof quand elles seront sur Moodle. */
A3({id:"a3-dicho",t:"Recherche linéaire et recherche dichotomique",min:15,goal:"Dérouler RechLin et RechDic du cours, prouver l'arrêt, donner les complexités (diapos 88 à 98, TD 9, CC1 2024).",steps:[
 L("La recherche linéaire",`<p><b>Principe</b> (diapo 88). Pour chercher un élément e dans un tableau T non trié, on le parcourt case par case jusqu'à trouver e ou atteindre la fin du tableau.</p>${C(`FONCTION : RechLin(E e : nombre, E T : tableau de nombres) : entier
SPÉCIFICATIONS : Si T contient e, renvoie le premier indice de T qui
                 contient e. Sinon, renvoie -1.
Variable : i : entier
DÉBUT
    i ← 0
    tant que i<taille(T) et T[i]≠e faire
        i ← i+1
    fin tq;
    si i=taille(T) alors
        Renvoyer -1
    sinon
        Renvoyer i
    fin si;
FIN`)}<p><b>Complexité</b> (diapo 90) : pire des cas pour e ∉ T (e n'est pas dans T) en notant n = taille(T) : n itérations à coût constant + opérations à coût constant = θ(n).</p>`),
 Q("Que renvoie RechLin(8, [3, 8, 5, 8]) ?",["1","3","8","-1"],0,"i avance tant que T[i] ≠ 8 : T[0] = 3, puis T[1] = 8, la boucle s'arrête avec i = 1. C'est le premier indice qui contient 8.",{diag:false,ctx:true}),
 L("La recherche dichotomique",`<p><b>Principe</b> (diapo 91). Pour chercher un élément e dans un tableau T <b>trié</b>, on compare e à la valeur au milieu du tableau puis on continue à le chercher dans la bonne moitié du tableau.</p>${C(`FONCTION : RechDic (E e : nombre, E T : tableau de nombres) : entier
SPÉCIFICATIONS : T trié. Renvoie le plus petit i tq T[i]=e ou -1.
Variable : deb, mil, fin : entier
DÉBUT
    deb, fin ← 0, taille(T)-1
    tant que deb≤fin faire
        mil ← (deb+fin) div 2
        si T[mil]<e alors
            deb ← mil+1
        sinon
            fin ← mil-1
        fin si;
    fin tq;
    Renvoyer cond(deb<taille(T) et T[deb]=e, deb, -1)
FIN`)}<p>(« tq » : tel que. deb et fin sont les indices du début et de la fin de la partie du tableau où on cherche encore ; mil est l'indice du milieu.)</p><p>Deux choses à remarquer. La boucle ne s'arrête pas quand elle tombe sur e : elle continue jusqu'à deb > fin. Et c'est seulement à la fin qu'on regarde si T[deb] vaut e.</p>`,{fig:"a-recherche"}),
 S("Diapo 93 : trace pour T=[1,2,3,3,3,4,6,9,10] et e=3","Une ligne par itération : deb, mil, fin, et la partie T[deb..fin] où on cherche encore. (Pas encore corrigé en amphi : trace calculée par programme.)",[
  {w:"Avant la boucle : deb = 0, fin = 8. On cherche dans tout le tableau.",why:"taille(T) = 9, donc fin = 8."},
  {w:"Itération 1 : mil = (0+8) div 2 = 4. T[4] = 3 n'est pas < 3, donc fin ← 3. Il reste T[0..3] = [1, 2, 3, 3].",why:"On est tombé sur un 3, mais on continue à gauche : il peut y avoir un 3 plus tôt."},
  {w:"Itération 2 : mil = (0+3) div 2 = 1. T[1] = 2 < 3, donc deb ← 2. Il reste T[2..3] = [3, 3].",why:"Tout ce qui est à gauche de mil est trop petit."},
  {w:"Itération 3 : mil = (2+3) div 2 = 2. T[2] = 3 n'est pas < 3, donc fin ← 1. Maintenant deb = 2 > fin = 1 : la boucle s'arrête.",why:"La partie où on cherche est vide."},
  {w:"deb = 2 < 9 et T[2] = 3 = e : on renvoie 2.",why:"C'est bien le plus petit indice où se trouve 3."}]),
 Q("TD 9, exercice 37 (b) : on cherche e = 5 dans [5, 5, 5, 9]. Que renvoie RechDic ?",["0","1","2","-1"],0,"(deb, fin) vaut (0, 3), puis (0, 0), puis (0, −1) : T[1] = 5 puis T[0] = 5 ne sont pas < 5, donc fin recule deux fois. À la fin deb = 0 et T[0] = 5 : on renvoie 0, le plus petit indice.",{diag:false,ctx:true}),
 L("Arrêt, validité, complexité",`<p><b>Preuve d'arrêt</b> (diapo 95). fin-deb+1 est un entier naturel ; il décroît strictement à chaque itération ; le tant que s'arrête lorsqu'il vaut 0 ou moins. Il y a donc un nombre fini d'itérations. Chaque itération se termine. Donc l'algorithme se termine.</p><p>(fin-deb+1, c'est le nombre de cases où on cherche encore.)</p><p><b>Preuve de validité, principe</b> (diapo 96). Invariant (admis) : à la fin de chaque itération, les cases d'indices 0 à deb−1 contiennent des valeurs &lt; e, et les cases d'indices fin+1 à n−1 des valeurs ≥ e. Conclusion : en sortant du TantQue, deb = fin + 1. Soit deb &lt; n et T[deb] = e : alors deb est le premier indice où se trouve e. Sinon, c'est que e ∉ T. Dans les deux cas, l'algorithme renvoie le bon résultat : l'algorithme est valide.</p><p><b>Complexité</b> (diapo 97). Pire cas : tout le tableau est &lt; e. Simplification pour le calcul : n = 2<sup>k</sup> (pas de perte de généralité). Nombre d'itérations = nombre de divisions de n par 2 jusqu'à tomber sur 0 donc k + 1. Chaque itération est en θ(1) (indépendant de n). T<sub>n</sub> = θ(1) + (k + 1).θ(1) = θ(k) donc T<sub>n</sub> = θ(log(n)). L'algorithme est logarithmique.</p>`),
 Q("CC1 de novembre 2024 : « Princesse Sarah a rangé ses 128 chevaux par ordre de taille (ils ont tous des tailles différentes). Elle cherche Neptune, qui mesure 1m65 au garrot. Combien de chevaux doit-elle mesurer pour trouver Neptune ? »",["7","128","64","8"],0,"Corrigé officiel : « Comme les chevaux sont rangés par taille, Princesse Sarah peut effectuer une recherche dichotomique. A chaque mesure, le nombre de chevaux parmi lesquels chercher est divisé par deux. Dans le pire cas où elle trouve Neptune à la dernière mesure, le nombre de mesures est le nombre de fois qu'il faut diviser 128 par 2 pour trouver 1, c'est à dire 7 fois. »"),
 Q("CC1 de novembre 2024 (autre sujet) : « Les 12000 légos de Mr Bricks sont rangées par taille. Il doit faire 14 essais au maximum pour trouver un modèle en particulier. Combien lui en faudrait-il s'il avait 24000 légos ? »",["15","28","14","24"],0,"Corrigé officiel : « Après son premier essai, le nombre de légos où chercher est divisé par 2, c'est à dire égal à 12000, donc il lui reste 14 essais au maximum. Au total il lui faut au maximum 15 essais. » Doubler la taille n'ajoute qu'un essai."),
 P("Diapos 94 et 98, sur papier",`<p><b>1.</b> (diapo 94) Trace de l'algorithme RechDic pour T=[1,2,3,3,3,4,6,9,10] et e=5 : un tableau avec les colonnes i, deb<sub>i</sub>, mil<sub>i</sub>, fin<sub>i</sub> et T[deb<sub>i</sub>..fin<sub>i</sub>]. Que renvoie l'algorithme ?</p><p><b>2.</b> (diapo 98) Modifier RechDic pour renvoyer le <b>plus grand</b> i tel que T[i] = e (ou -1 si e ∉ T).</p>`,`<p>Ces deux diapos ne sont pas encore corrigées en amphi : corrigé écrit par moi, vérifié par programme.</p><p><b>1.</b></p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th class="var">i</th><th class="var">deb</th><th class="var">mil</th><th class="var">fin</th><th>T[deb..fin]</th></tr></thead><tbody><tr><td>0</td><td>0</td><td></td><td>8</td><td>[1, 2, 3, 3, 3, 4, 6, 9, 10]</td></tr><tr><td>1</td><td>5</td><td>4</td><td>8</td><td>[4, 6, 9, 10]</td></tr><tr><td>2</td><td>5</td><td>6</td><td>5</td><td>[4]</td></tr><tr><td>3</td><td>6</td><td>5</td><td>5</td><td>vide</td></tr></tbody></table></div><p>Itération 1 : T[4] = 3 &lt; 5, deb ← 5. Itération 2 : T[6] = 6 n'est pas &lt; 5, fin ← 5. Itération 3 : T[5] = 4 &lt; 5, deb ← 6. deb = 6 > fin = 5 : fin de la boucle. T[6] = 6 ≠ 5 : l'algorithme renvoie <b>-1</b>.</p><p><b>2.</b> On change le test pour continuer à droite quand on tombe sur e, et c'est fin qui s'arrête sur le dernier e :</p>${C(`DÉBUT
    deb, fin ← 0, taille(T)-1
    tant que deb≤fin faire
        mil ← (deb+fin) div 2
        si T[mil]≤e alors
            deb ← mil+1
        sinon
            fin ← mil-1
        fin si;
    fin tq;
    Renvoyer cond(fin≥0 et T[fin]=e, fin, -1)
FIN`)}<p>À la fin, les cases 0 à deb−1 contiennent des valeurs ≤ e et les cases fin+1 à n−1 des valeurs > e, avec deb = fin + 1 : si e est dans T, sa dernière position est fin. Pour T=[1,2,3,3,3,4,6,9,10] et e=3, on obtient 4.</p>`,["La trace : 4 lignes, de i = 0 à i = 3","La valeur renvoyée : -1, car T[6] ≠ 5","Le test changé en T[mil]≤e","Le Renvoyer avec fin, et le test fin≥0"],10),
 K("Dans la recherche dichotomique du cours (RechDic), on cherche e entre les indices deb et fin d'un tableau trié T. Que fait un tour de boucle ?","mil ← (deb+fin) div 2. Si T[mil] < e alors deb ← mil+1, sinon fin ← mil-1. On continue tant que deb ≤ fin, puis on renvoie deb si deb < taille(T) et T[deb] = e, sinon -1."),
 K("Comment prouve-t-on que la recherche dichotomique, qui cherche entre les indices deb et fin, s'arrête ?","fin-deb+1 est un entier naturel ; il décroît strictement à chaque itération ; le tant que s'arrête lorsqu'il vaut 0 ou moins. Il y a donc un nombre fini d'itérations, donc l'algorithme se termine."),
 K("Quelles sont les complexités de la recherche linéaire et de la recherche dichotomique dans un tableau de taille n ?","Linéaire : θ(n) (pire cas : e n'est pas dans T). Dichotomique, sur un tableau trié : θ(log(n)) (pour n = 2<sup>k</sup>, k + 1 itérations dans le pire cas).")]}),

/* ------------------------------------------------------------------ */
A3({id:"a3-valeurs",t:"Le tri par valeurs et la borne inférieure d'un tri",min:12,goal:"Dérouler TriValeurs, donner sa complexité, et dire quelles complexités sont possibles pour un tri (diapos 99 à 104, CC1 2024, examen de janvier 2023).",steps:[
 L("Pourquoi trier, et deux sortes de tris",`<p><b>Motivation</b> (diapo 100). Trier permet de traiter plus efficacement ensuite.</p><p>On étudie 2 sortes de tris de tableaux 1D de taille n :</p><ul><li>dans le cas particulier où les valeurs du tableau sont concentrées dans un intervalle ⟦0 ; p−1⟧ avec p = O(n) : <b>tri par valeurs</b> en θ(n) ;</li><li>dans le cas général : <b>tri par comparaison</b> en Ω(n log n).</li></ul><p>(⟦0 ; p−1⟧ : les entiers de 0 à p−1. « p = O(n) » : il n'y a pas beaucoup plus de valeurs possibles que de cases. Exemple : un tableau de chiffres, p = 10.)</p>`),
 L("Le tri par valeurs",`<p><b>Idée générale</b> (diapo 101). On compte combien il y a de 0, de 1, de 2 etc. jusqu'à p−1. On mémorise ce comptage dans un deuxième tableau. Puis on remet autant de 0 que ce qu'on a compté au début du tableau, puis on met les 1, les 2 etc. jusqu'aux p−1.</p><p><b>Exemple.</b> Dans le tableau [1,0,0,1,1,1,3,0,2,2,0,1,2,3,2,0,0], on compte six 0, cinq 1, quatre 2, deux 3, donc le tableau trié est [0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,3,3].</p>${C(`PROCÉDURE : TriValeurs (ES T : tableau d'entier de taille n, E p : entier)
SPÉCIFICATIONS : Les valeurs de T sont dans ⟦0 ; p−1⟧. Trie T.
Variable : Cpt : tableau d'entier de taille p
           j, k : entier
DÉBUT
    Initialiser Cpt avec des 0
    pour i de 0 à n-1 faire
        Cpt[T[i]] ← Cpt[T[i]] + 1
    fin pour;
    j,k ← 0,0
    tant que j<n faire
        si Cpt[k]=0 alors
            k ← k+1
        sinon
            T[j] ← k
            j ← j+1
            Cpt[k] ← Cpt[k]-1
        fin si;
    fin tq;
FIN`)}<p><b>Complexité</b> : θ(p + n) ou θ(n) si p = O(n).</p><p>Cpt[v] compte les cases qui valent v. Dans le tant que, k est la valeur qu'on est en train de recopier et j la prochaine case de T à remplir.</p>`,{fig:"a-tri-valeurs"}),
 S("Diapo 103 : trace pour p=4 et T=[1, 0, 3, 2, 2, 2]","D'abord le comptage, puis la recopie. (Pas encore corrigé en amphi : trace calculée par programme.)",[
  {w:"Le pour : on lit 1, 0, 3, 2, 2, 2. À la fin Cpt = [1, 1, 3, 1].",why:"Un 0, un 1, trois 2, un 3. T n'a pas changé."},
  {w:"j, k ← 0, 0. Cpt[0] = 1 : T[0] ← 0, j = 1, Cpt = [0, 1, 3, 1].",why:"On écrit le seul 0."},
  {w:"Cpt[0] = 0 : k ← 1. Puis Cpt[1] = 1 : T[1] ← 1, j = 2, Cpt = [0, 0, 3, 1].",why:"Plus de 0 à écrire : on passe à la valeur suivante."},
  {w:"Cpt[1] = 0 : k ← 2. Puis trois fois : T[2] ← 2, T[3] ← 2, T[4] ← 2. j = 5, Cpt = [0, 0, 0, 1].",why:"Les trois 2."},
  {w:"Cpt[2] = 0 : k ← 3. Puis T[5] ← 3, j = 6 : la boucle s'arrête. T = [0, 1, 2, 2, 2, 3].",why:"j = n = 6 : toutes les cases sont remplies."}]),
 L("Borne inférieure d'un tri de tableau",`<p>Diapo 104.</p><ul><li>Pour trier un tableau, il faut parcourir toutes ses cases.</li><li>Donc sa complexité est au moins n, c'est-à-dire Ω(n).</li><li>Le tri par valeur est en θ(n).</li><li>L'ordre de complexité n est donc une borne inférieure pour un tri de tableau.</li></ul><p>(« Borne inférieure » : aucun tri ne peut faire mieux.)</p>`),
 Q("CC1 de novembre 2024 : « Luc veut ranger ses nombreux vaisseaux spatiaux, de 5 modèles différents, par ordre de taille. Son hangar est immense et il peut les placer comme il veut. Parmi les tris du cours, lequel doit-il adapter pour fournir le moins d'efforts possible ? »",["Le tri par valeurs : une zone par modèle, puis il les remet en ligne","Le tri à bulles : il compare et échange les vaisseaux voisins","Le tri fusion : il trie deux moitiés, puis les fusionne","La recherche dichotomique : il coupe la rangée en deux à chaque fois"],0,"Corrigé officiel : « Comme Luc n'a que 5 modèles différents, il peut utiliser un tri par valeurs : il range chaque modèle dans une zone différente de son hangar, puis il les remet en ligne, en commençant par le plus petit modèle jusqu'au plus grand. Il fait ainsi un tri en θ(n) qui lui garantit un effort minimal. » Le tri à bulles et le tri fusion marchent, mais demandent plus d'efforts (θ(n²) et θ(n log n)). La recherche dichotomique ne trie rien."),
 P("Examen de janvier 2023, exercice 4, question 1 (2 points), sur papier",`<p>Dans cet exercice, un nombre est représenté par un tableau de chiffres. Par exemple, le nombre 2022 est représenté par le tableau [2,0,2,2].</p><p>On souhaite écrire un algorithme qui trie un tableau de chiffres de taille n. Anakin affirme pouvoir l'écrire en θ(n²), Leia en θ(n log(n)), Chewbacca en θ(n) et Luke en θ(1). Parmi ces propositions, lesquelles sont impossibles ? Justifier. Parmi les autres, donner le nom d'un tri du cours qui permet d'obtenir le meilleur ordre de complexité.</p>`,`<p><b>Corrigé officiel</b> (2 pts dont 1,5 pt pour l'ordre de complexité optimal et 0,5 pt pour le nom du tri. −0,5 pt si la complexité optimale proposée est θ(n log(n)) avec un nom de tri cohérent.)</p><p>La proposition de Luke est impossible, car il faut au moins parcourir le tableau pour pouvoir le trier, donc l'algorithme de tri est en Ω(n). La proposition de Chewbacca est possible, car chaque chiffre peut prendre uniquement 10 valeurs, donc on peut trier le tableau par valeurs avec une complexité en temps θ(n). Les propositions d'Anakin et Leia sont moins performantes donc possibles aussi.</p>`,["Luke impossible : il faut au moins parcourir le tableau, Ω(n)","Chewbacca possible : 10 valeurs seulement, tri par valeurs en θ(n)","Anakin et Leia possibles, mais moins performants","Le nom du tri : tri par valeurs"],6),
 K("Quand peut-on utiliser le tri par valeurs, et quelle est sa complexité ?","Quand les valeurs du tableau sont concentrées dans un intervalle ⟦0 ; p−1⟧ avec p = O(n). On compte combien il y a de chaque valeur, puis on les remet dans l'ordre. Complexité θ(p + n), soit θ(n)."),
 K("Peut-on trier un tableau de taille n en θ(1) ?","Non : pour trier un tableau, il faut parcourir toutes ses cases, donc la complexité est au moins n, c'est-à-dire Ω(n). C'est la borne inférieure d'un tri de tableau.")]}),

/* ------------------------------------------------------------------ */
A3({id:"a3-fusion",t:"Tri à bulles et tri fusion",min:17,goal:"Dérouler le tri à bulles et le tri fusion du cours, connaître leurs complexités et leurs propriétés (diapos 105 à 113, CC1 2024).",steps:[
 L("Le tri à bulles",`<p>Un premier tri par comparaison (diapo 105) :</p>${C(`PROCÉDURE : TriBulles (ES T : tableau de nombres de taille n)
SPÉCIFICATIONS : Trie le tableau T par ordre croissant.
DÉBUT
    pour i de 0 à n-2 faire
        pour j de n-1 à i+1 par pas de -1 faire
            si T[j]<T[j-1] alors
                échanger T[j] et T[j-1]
            fin si;
        fin pour;
    fin pour;
FIN`)}<p>Complexité θ(n²). Le tri à bulles n'a pas besoin d'espace supplémentaire (<b>en place</b>) et respecte l'ordre des éléments initiaux en cas d'égalité (<b>stable</b>).</p><p>j part de la fin du tableau et recule (« par pas de -1 »). À chaque fois, on compare la case j avec sa voisine de gauche, et on les échange si elles sont dans le désordre. À la fin de l'itération i, la plus petite valeur restante est arrivée dans la case i.</p>`,{fig:"a-tri-bulles"}),
 S("Diapo 106 : trace pour T=[5,6,2,4,3,1]","Le tableau à la fin de chaque itération de la boucle sur i. (Pas encore corrigé en amphi : trace calculée par programme.)",[
  {w:"i = 0 (j de 5 à 1) : le 1 remonte de la case 5 à la case 0, un échange à chaque fois. T = [1, 5, 6, 2, 4, 3].",why:"1 est plus petit que tous ses voisins de gauche : 5 échanges."},
  {w:"i = 1 (j de 5 à 2) : 3 passe devant 4 ; puis 2 remonte jusqu'à la case 1. T = [1, 2, 5, 6, 3, 4].",why:"La case 0 n'est plus touchée : j s'arrête à i+1 = 2."},
  {w:"i = 2 (j de 5 à 3) : 3 remonte jusqu'à la case 2. T = [1, 2, 3, 5, 6, 4].",why:"4 et 3 étaient déjà dans l'ordre : pas d'échange pour j = 5."},
  {w:"i = 3 (j de 5 à 4) : 4 remonte jusqu'à la case 3. T = [1, 2, 3, 4, 5, 6].",why:"Deux échanges."},
  {w:"i = 4 (j = 5) : 6 n'est pas < 5, aucun échange. T = [1, 2, 3, 4, 5, 6].",why:"En tout 5 + 4 + 3 + 2 + 1 = 15 comparaisons, soit n(n − 1)/2 pour n = 6, et 12 échanges."}]),
 Q("CC1 de novembre 2024 : « Luc veut ranger ses vaisseaux spatiaux par ordre de taille. Sa seule action possible est de permuter deux vaisseaux voisins. Peut-il arriver à ranger ses vaisseaux avec un tri du cours ? »",["Oui, avec le tri à bulles, qui repose entièrement sur la permutation d'éléments voisins","Oui, avec le tri par valeurs, en rangeant chaque modèle dans une zone","Non, aucun tri du cours ne se fait seulement avec des voisins","Oui, avec le tri fusion, qui échange les éléments deux par deux"],0,"Corrigé officiel : « Oui, Luc peut utiliser le tri à bulles, qui repose entièrement sur la permutation d'éléments voisins. » Le tri par valeurs déplace les vaisseaux n'importe où, et le tri fusion recopie les éléments : seul le tri à bulles n'échange que des voisins."),
 L("Le tri fusion : le principe et la fusion",`<p><b>Principe</b> (diapo 107). Algorithme de type « Diviser pour mieux régner » :</p><ul><li>on trie chaque moitié du tableau ;</li><li>on fusionne les deux moitiés triées.</li></ul><p>Il faut 2 algorithmes : l'algorithme de tri et l'algorithme de fusion.</p>${C(`PROCÉDURE : fusion (ES T : tableau de nombre, E deb1, fin1, fin2 : entier)
SPÉCIFICATIONS : T[deb1..fin1] et T[fin1+1..fin2] triés. Trie T[deb1..fin2].
Variable : T1, T2 : tab. de fin1-deb1+1 et fin2-fin1 nombres ; i,j : entiers
DÉBUT
    recopier T[deb1..fin1] dans T1 et T[fin1+1..fin2] dans T2
    i,j ← 0,0
    pour k de deb1 à fin2 faire
        si j>=taille(T2) ou (i<taille(T1) et T1[i]<=T2[j]) alors
            T[k] ← T1[i] ; i ← i+1
        sinon
            T[k] ← T2[j] ; j ← j+1
        fin si;
    fin pour;
FIN`)}<p>T1 et T2 sont les copies des deux moitiés triées. i est la prochaine case à prendre dans T1, j dans T2. À chaque case k de T, on prend le plus petit des deux : T1[i] s'il est ≤ T2[j], ou s'il ne reste plus rien dans T2 (j>=taille(T2)).</p>`),
 S("Diapo 109 : trace de fusion([2,6,8,4,9], 0, 2, 4)","T1 = [2, 6, 8] et T2 = [4, 9]. Une ligne par valeur de k. (Pas encore corrigé en amphi : trace calculée par programme.)",[
  {w:"k = 0 : T1[0] = 2 ≤ T2[0] = 4, donc T[0] ← 2 et i = 1. T = [2, 6, 8, 4, 9].",why:"On prend le plus petit des deux."},
  {w:"k = 1 : T1[1] = 6 > T2[0] = 4, donc T[1] ← 4 et j = 1. T = [2, 4, 8, 4, 9].",why:"Cette fois le plus petit est dans T2."},
  {w:"k = 2 : T1[1] = 6 ≤ T2[1] = 9, donc T[2] ← 6 et i = 2. T = [2, 4, 6, 4, 9].",why:"Les anciennes valeurs de T sont écrasées : c'est pour ça qu'on les a recopiées dans T1 et T2."},
  {w:"k = 3 : T1[2] = 8 ≤ 9, donc T[3] ← 8 et i = 3. T = [2, 4, 6, 8, 9].",why:"T1 est maintenant épuisé : i = taille(T1)."},
  {w:"k = 4 : i<taille(T1) est faux, donc sinon : T[4] ← T2[1] = 9 et j = 2. T = [2, 4, 6, 8, 9].",why:"Il ne reste que T2."}]),
 L("L'algorithme de tri fusion",`<p>Diapo 110.</p>${C(`PROCÉDURE : triFusionAux (ES T : tableau de nombre; E deb, fin : entier)
SPÉCIFICATIONS : Trie T entre les indices deb et fin.
Variable : mil : entier
DÉBUT
    si deb<fin alors
        mil ← (deb+fin) div 2
        triFusionAux(T,deb,mil)
        triFusionAux(T,mil+1,fin)
        fusion(T,deb,mil,fin)
    fin si;
FIN`)}<p>C'est un algorithme récursif : il trie la moitié gauche, puis la moitié droite, puis fusionne. Si deb = fin, il n'y a qu'une case : rien à faire.</p><p><b>Dernière procédure</b> (diapo 112). Pour trier tout le tableau, TriFusion(ES T : tableau de nombres) appelle TriFusionAux(T, 0, taille(T)-1). (Les deux valeurs sont à trouver sur la diapo : c'est la réponse.)</p><p><b>Complexité et propriété.</b> Le tri fusion a une complexité θ(n log(n)) (admis) et il est stable (éléments égaux dans le même ordre qu'au départ). Cependant il a besoin d'espace supplémentaire pour la fusion : il n'est pas en place.</p>`,{fig:"a-tri-fusion"}),
 L("Borne inférieure d'un tri par comparaison, et tris célèbres",`<p>Diapo 113.</p><ul><li>Dans le cas général, on doit comparer les valeurs entre elles pour les ordonner.</li><li>Nombre de comparaisons nécessaires : au moins n log n/4 donc complexité Ω(n log n).</li><li>Il est possible de faire θ(n log n), par exemple avec le tri fusion.</li><li>L'ordre de complexité n log n est donc une borne inférieure d'un tri de tableau par comparaison.</li></ul><p><b>Quelques tris célèbres</b> (diapo 114) : tri par insertion et tri par sélection, en θ(n²) (leçon suivante) ; tri par tas, en θ(n log n) ; tri rapide ou tri par pivot, en θ(n²) dans le pire des cas, θ(n log n) en moyenne.</p>`),
 Q("CC1 de novembre 2024 : « Luc veut ranger ses vaisseaux spatiaux, de modèles tous différents, par ordre de taille. Son hangar est immense et il peut les placer comme il veut. Parmi les tris du cours, lequel doit-il adapter pour fournir le moins d'efforts possible ? »",["Le tri fusion","Le tri par valeurs","Le tri à bulles"],0,"Corrigé officiel : « Comme les modèles sont tous différents, Luc ne peut pas utiliser un tri par valeurs et doit faire un tri par comparaison. Le tri par comparaison le plus efficace du cours est le tri fusion, qui peut être adapté au cas de Luc qui n'a pas de problème de stockage. »"),
 P("Diapo 111 : les appels de triFusionAux([5,6,2,4,3,1],0,5), sur papier",`<p>Représenter les appels de triFusionAux([5,6,2,4,3,1],0,5) : dans l'ordre où ils sont faits, avec le tableau après chaque fusion.</p>`,`<p>Pas encore corrigé en amphi : corrigé écrit par moi, calculé par programme. Chaque décalage vers la droite est un appel fait par la ligne du dessus.</p>${W.code(`triFusionAux(T,0,5)
  triFusionAux(T,0,2)
    triFusionAux(T,0,1)
      triFusionAux(T,0,0)
      triFusionAux(T,1,1)
      fusion(T,0,0,1)      T = [5, 6, 2, 4, 3, 1]
    triFusionAux(T,2,2)
    fusion(T,0,1,2)        T = [2, 5, 6, 4, 3, 1]
  triFusionAux(T,3,5)
    triFusionAux(T,3,4)
      triFusionAux(T,3,3)
      triFusionAux(T,4,4)
      fusion(T,3,3,4)      T = [2, 5, 6, 3, 4, 1]
    triFusionAux(T,5,5)
    fusion(T,3,4,5)        T = [2, 5, 6, 1, 3, 4]
  fusion(T,0,2,5)          T = [1, 2, 3, 4, 5, 6]`,"txt")}<p>11 appels à triFusionAux (dont 6 sur une seule case, qui ne font rien) et 5 fusions. La moitié gauche [5, 6, 2] est triée en [2, 5, 6], la moitié droite [4, 3, 1] en [1, 3, 4], et la dernière fusion donne le tableau trié.</p>`,["mil = 2 au premier appel : moitiés [0..2] et [3..5]","La moitié gauche est entièrement triée avant de toucher à la droite","Chaque fusion vient après les deux appels récursifs","5 fusions, la dernière sur tout le tableau"],10),
 K("Quelles sont la complexité et les propriétés du tri à bulles ?","θ(n²). Il est en place (pas d'espace supplémentaire) et stable (il respecte l'ordre des éléments égaux). Il repose entièrement sur la permutation d'éléments voisins."),
 K("Quels sont le principe, la complexité et les propriétés du tri fusion ?","Diviser pour mieux régner : on trie chaque moitié du tableau, puis on fusionne les deux moitiés triées. θ(n log(n)). Stable, mais pas en place : il a besoin d'espace supplémentaire pour la fusion."),
 K("Quelle est la borne inférieure de la complexité d'un tri par comparaison ?","Ω(n log n) : il faut au moins n log n/4 comparaisons. Le tri fusion l'atteint, en θ(n log n).")]}),

/* ------------------------------------------------------------------ */
A3({id:"a3-tris",t:"Tri par sélection et tri par insertion (TD 10)",min:13,goal:"Écrire le tri par sélection et le tri par insertion, donner leur complexité et l'idée de leur preuve (cours diapo 114, TD 10, examen PEIP de mai 2023).",steps:[
 L("Deux tris célèbres",`<p>Cours, diapo 114 :</p><ul><li><b>Tri par insertion</b> : pour k allant de 1 à taille(T)-1, T[k] est inséré parmi T[0] à T[k-1]. Adapté lorsque les données sont presque triées. Complexité : θ(n²).</li><li><b>Tri par sélection</b> : pour k allant de 0 à taille(T)-2, on cherche le plus petit élément parmi T[k] à T[taille(T)-1] et on l'échange avec T[k]. Adapté pour de petits ensembles de données. Complexité : θ(n²).</li></ul><p>Le cours ne donne pas leur algorithme : c'est le TD 10 qui demande de les écrire (exercices 42 et 43).</p>`,{fig:"a-tri-selection"}),
 O("TD 10, exercice 42 : remets le tri par sélection dans l'ordre.",["PROCÉDURE : TriSelection (ES tab : tableau de nombres de taille n)","Variable : m : entier","DÉBUT","    pour i de 0 à n-2 faire","        m ← i","        pour j de i+1 à n-1 faire","            si tab[j] < tab[m] alors","                m ← j","            fin si;","        fin pour;","        échanger tab[i] et tab[m]","    fin pour;","FIN"],"m retient l'indice du plus petit élément vu depuis la case i. L'échange se fait une seule fois par itération, après la boucle sur j."),
 Q("Combien de comparaisons « tab[j] < tab[m] » fait le tri par sélection sur un tableau de n éléments ?",["n(n − 1)/2, quel que soit le tableau","n si le tableau est déjà trié","n log(n)"],0,"Pour i fixé, j prend n − 1 − i valeurs : (n − 1) + (n − 2) + … + 1 = n(n − 1)/2. Rien ne dépend des données : θ(n²) dans tous les cas."),
 B("TD 10, exercice 43 : complète le tri par insertion. (a garde la valeur à insérer.)",`pour k de 1 à n-1 faire
    a ← tab[k]
    j ← k-1
    tant que j ≥ 0 et tab[j] [[0]] a faire
        tab[[[1]]] ← tab[j]
        j ← j-1
    fin tq;
    tab[j+1] ← [[2]]
fin pour;`,[{o:[">","<","="],a:0},{o:["j+1","j-1","k"],a:0},{o:["a","tab[k]","tab[j]"],a:0}],"Tant que la case de gauche contient une valeur plus grande que a, on la décale d'une case vers la droite. Puis on pose a dans la case libérée. Attention : tab[k] a pu être écrasé par un décalage, c'est pour ça qu'on a gardé sa valeur dans a."),
 Q("Le tri par insertion sur un tableau déjà trié de n éléments fait…",["n − 1 itérations sans aucun décalage : θ(n)","n(n − 1)/2 décalages : θ(n²)","aucune opération"],0,"Le test « tab[j] > a » est faux tout de suite à chaque itération. C'est pour ça que le cours le dit « adapté lorsque les données sont presque triées ». Sa complexité, celle du pire cas (tableau rangé à l'envers), reste θ(n²)."),
 Q("CC1 de novembre 2024 : « Luc veut ranger ses vaisseaux spatiaux par ordre de taille. Sa seule action possible est de permuter deux vaisseaux. Citer deux tris du cours qui lui permettent d'y arriver. »",["Le tri à bulles et le tri par sélection","Le tri par valeurs et le tri fusion","Le tri fusion et le tri par insertion"],0,"Corrigé officiel : « Il peut utiliser le tri à bulles ou le tri par sélection, qui reposent sur la permutation d'éléments. »"),
 P("TD 10, exercice 42, questions 1 et 2, sur papier",`<p>Le tri par sélection consiste, pour trier un tableau tab de n nombres :</p><ul><li>à rechercher le plus petit élément du tableau et à échanger sa valeur avec tab[0] ;</li><li>à rechercher le plus petit élément parmi les n-1 derniers éléments du tableau et à échanger sa valeur avec de tab[1] ;</li><li>et ainsi de suite jusqu'à ce que tous les éléments soient triés.</li></ul><ol><li>Écrivez l'algorithme de tri par sélection.</li><li>Déterminez son ordre de complexité.</li></ol>`,`<p><b>1.</b></p>${C(`PROCÉDURE : TriSelection (ES tab : tableau de nombres de taille n)
SPÉCIFICATIONS : Trie le tableau tab par ordre croissant.
Variable : m : entier
DÉBUT
    pour i de 0 à n-2 faire
        m ← i
        pour j de i+1 à n-1 faire
            si tab[j] < tab[m] alors
                m ← j
            fin si;
        fin pour;
        échanger tab[i] et tab[m]
    fin pour;
FIN`)}<p><b>2.</b> Pour une valeur de i, j prend n − 1 − i valeurs. Le nombre de comparaisons est (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, et chaque itération fait un nombre constant d'opérations : θ(n²). Avec le raccourci du cours : n × O(n) × O(1) = O(n²).</p><p>(Corrigé écrit par moi, vérifié par programme. La question 3, la preuve de validité, est corrigée dans les exercices de TD.)</p>`,["La signature : PROCÉDURE, tab en ES","m ← i avant la boucle sur j, qui commence à i+1","Un seul échange par itération, après la boucle sur j","La somme (n − 1) + … + 1 = n(n − 1)/2, puis θ(n²)"],10),
 K("Quelle est l'idée du tri par sélection, et quelle est sa complexité ?","Pour i de 0 à n-2 : chercher le plus petit élément parmi tab[i] à tab[n-1] et l'échanger avec tab[i]. n(n − 1)/2 comparaisons : θ(n²) dans tous les cas."),
 K("Quelle est l'idée du tri par insertion, et quelle est sa complexité ?","Pour k de 1 à n-1 : insérer tab[k] parmi tab[0] à tab[k-1], déjà triés, en décalant vers la droite les valeurs plus grandes. θ(n²) dans le pire cas ; adapté aux données presque triées."),
 K("Quelles sont les complexités des différents tris du cours ?","Par valeurs : θ(n) (valeurs dans un petit intervalle). Bulles, sélection, insertion : θ(n²). Fusion, tas : θ(n log(n)). Rapide : θ(n²) au pire, θ(n log(n)) en moyenne. Bornes inférieures : Ω(n) pour tout tri, Ω(n log n) pour un tri par comparaison.")]}));

})();
