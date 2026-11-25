/* Leçons pas à pas de programmation fonctionnelle (HAI102I, OCaml, contrôle du vendredi 13 novembre, sur papier).
   Programme : jusqu'aux listes comprises (TD ex. 1 à 31). Pas de polymorphisme ; sans le filtrage (mail du prof du 5/11).
   Les fonctions sont écrites comme dans le cours : let rec f : type = function x -> if … then … else … */
(function(){
const LES=window.LESSONS=window.LESSONS||{};
const L=(h,x,o)=>Object.assign({k:"learn",h,x},o||{});
const Q=(q,o,a,e,x)=>Object.assign({k:"qcm",q,o,a,e},x||{});
const B=(q,code,b,e,x)=>Object.assign({k:"blanks",q,code,b,e,lang:"ml"},x||{});
const O=(q,lines,e,x)=>Object.assign({k:"order",q,lines,e,lang:"ml"},x||{});
const P=(h,x,sol,check,min,o)=>Object.assign({k:"paper",h,x,sol,check,min},o||{});
const K=(f,b)=>({k:"card",f,b});
const M=s=>W.code(s,"ml");

LES.pf=[
/* ------------------------------------------------------------------ */
{id:"p-types",t:"Types et opérateurs",min:19,goal:"Donner le type et la valeur d'une expression, ou « erreur » : 3 points au partiel 2021.",steps:[
 Q("Que vaut 7 / 2 en OCaml ?",["3.5","3","4","erreur"],1,"Avec deux int, / est la division entière : 7 / 2 = 3. Pour obtenir 3.5, il faut des float : 7. /. 2.",{diag:false}),
 L("OCaml répond un type, puis une valeur",`<p>Les expressions de OCaml sont <b>typées</b>. Un type est défini par un domaine (l'ensemble des valeurs que peuvent prendre les objets du type) et des opérations (les fonctions et opérations qu'on peut appliquer aux valeurs du type).</p><p><b>Typage statique</b> : avant d'évaluer une expression, OCaml vérifie si son typage est correct, c'est-à-dire si l'application des fonctions et opérateurs est conforme à leur signature (cours p. 11).</p><p>Quand tu donnes une expression à OCaml, il répond son type, puis sa valeur :</p>`,{code:`# 7 / 3;;
- : int = 2
# 7 mod 3;;
- : int = 1
# 2.3 +. 3.1;;
- : float = 5.4
# 2.3 + 3.1;;
Error: This expression has type float but an expression was expected of type int`,after:`<p>Une <b>erreur de type</b>, c'est quand OCaml refuse l'expression avant même de la calculer : elle n'a alors ni type ni valeur. Le cours dit : « ne pas confondre erreur et false ». not true vaut false, alors que not 1 n'a pas de sens, et donc pas de valeur.</p>`}),
 Q("Que répond OCaml à 2.3 + 3.1 ?",["Une erreur : + veut deux int, il faut écrire 2.3 +. 3.1","5.4 : + additionne aussi les float","5 : les deux nombres sont arrondis à l'entier avant l'addition"],0,"Le + sans point est l'addition des int. Pour des float, l'opérateur s'écrit avec un point : 2.3 +. 3.1 vaut 5.4."),
 L("Chaque expression a un type",`<ul><li><b>int</b> : les entiers relatifs, comme 3 ou −7. Opérations : + − * / mod. Attention : / et mod désignent le quotient et le reste de la division entière. 7 / 3 vaut 2 et 7 mod 3 vaut 1.</li><li><b>float</b> : les réels. Le point est obligatoire : 2 est de type int et 2. de type float. Opérations : <b>+. −. *. /.</b> avec un point (et ** pour la puissance). 2.3 + 3.1 n'est pas correct.</li><li><b>bool</b> : true et false. Opérations : not (non), &amp;&amp; (et), || (ou).</li><li><b>string</b> : les chaînes de caractères, entre guillemets. Opération : ^ (concaténation). "au" ^ "semestre 1" vaut "ausemestre 1".</li><li><b>Comparaisons</b> : = &lt;&gt; (différent) &lt; &gt; &lt;= &gt;=. Le résultat est un bool ; les deux opérandes sont <b>du même type</b>. 1 &lt;&gt; 4 vaut true ; "trois" &lt; "un" vaut true (ordre alphabétique) ; 4 = 4.0 et "un" = 1 ne sont pas corrects.</li></ul><p><b>Conversions</b> : les types int et float sont disjoints. float_of_int : int → float ; int_of_float : float → int, qui coupe les décimales : int_of_float(4.7) vaut 4, et int_of_float(-4.7) vaut -4. Ainsi 3.2 *. float_of_int(2) est correct.</p><p>L'application d'une fonction passe <b>avant</b> les opérations : int_of_float 2.5 + 1 se lit (int_of_float 2.5) + 1, qui vaut 3.</p>`),
 Q("Que vaut 3 * 4. ?",["12.","12","erreur de type"],2,"* veut deux int, et 4. est un float. On écrirait 3. *. 4. = 12."),
 Q("Que vaut float_of_int 3 +. 1.5 ?",["4.5","4","erreur"],0,"L'application passe avant les opérations : (float_of_int 3) +. 1.5 = 3. +. 1.5 = 4.5."),
 Q("Que vaut int_of_float 2.9 ?",["3","2","erreur"],1,"int_of_float tronque : il enlève la partie décimale, sans arrondir."),
 Q("Que vaut true = \"true\" ?",["true","false","erreur de type"],2,"= compare deux valeurs du même type ; ici un bool et une string."),
 L("Entraîne-toi : 15 expressions du TD",`<p>Les expressions de l'exercice 1 du TD qui n'utilisent que les types et les opérateurs de cette leçon. Choisis le type, puis lis la valeur et l'explication. Refais-le jusqu'à ne plus te tromper : ce sont des points faciles.</p>`,{fig:"pf-types",figKey:"figBase",nolook:true}),
 P("TD, exercice 1, sur papier, comme la question 1 du partiel","Vérifie si les expressions suivantes sont correctes et, si c'est le cas, donne leur type et leur valeur. Fais un tableau à trois colonnes sur ta feuille : expression, type, valeur. Écris « erreur » quand l'expression n'est pas correcte."+M(`7.2 / 2
7. /. 2.
3 * 4.
7 mod 2
int_of_float(10.0) / int_of_float(2.5)
not (true) && not(false)
(12.0 +. 30. = 42.) && (3 + 4 = 4 + 4)
true = "true"`),`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Expression</th><th>Type</th><th>Valeur</th></tr></thead><tbody><tr><td>7.2 / 2</td><td>erreur</td><td>/ veut deux int. Avec des float : 7.2 /. 2.</td></tr><tr><td>7. /. 2.</td><td>float</td><td>3.5</td></tr><tr><td>3 * 4.</td><td>erreur</td><td>* veut deux int, et 4. est un float</td></tr><tr><td>7 mod 2</td><td>int</td><td>1</td></tr><tr><td>int_of_float(10.0) / int_of_float(2.5)</td><td>int</td><td>5, car int_of_float(2.5) vaut 2, et 10 / 2 = 5</td></tr><tr><td>not (true) &amp;&amp; not(false)</td><td>bool</td><td>false : c'est false &amp;&amp; true</td></tr><tr><td>(12.0 +. 30. = 42.) &amp;&amp; (3 + 4 = 4 + 4)</td><td>bool</td><td>false : c'est true &amp;&amp; false</td></tr><tr><td>true = "true"</td><td>erreur</td><td>= compare deux valeurs du même type ; ici un bool et une string</td></tr></tbody></table></div>`,["Un type et une valeur pour chaque expression correcte","« erreur » quand un opérateur ne reçoit pas le bon type","Les float écrits avec un point : 3.5"],8),
 K("En OCaml, quels opérateurs s'utilisent sur les int, et lesquels sur les float ?","int : + − * / (division entière) mod. float : +. −. *. /. avec un point. Jamais de mélange : float_of_int, int_of_float (tronque)."),
 K("Que vaut 7 / 2 ? Et 7. /. 2. ?","7 / 2 = 3 (int, division entière). 7. /. 2. = 3.5 (float).")]},

/* ------------------------------------------------------------------ */
{id:"p-iflet",t:"if, let … in et let … and",min:13,goal:"Savoir qu'un if a un type, et lire un let … and sans se faire piéger.",steps:[
 Q("Pourquoi « if 3/2 < 2 then 4 < 5 else 4 + 5 » est-il refusé ?",["3/2 n'est pas un entier : la division donne 1.5","Les deux branches n'ont pas le même type","Il manque des parenthèses autour de la condition"],1,"then donne un bool (4 < 5), else un int (4 + 5). Les deux branches d'un if doivent avoir le même type. En OCaml, 3/2 est la division entière : elle vaut 1, un int."),
 L("if est une expression, let donne un nom",`<p><b>if c then e1 else e2</b> : c est un bool, e1 et e2 ont le même type, qui est le type du if. Le else est obligatoire, sauf si le then est de type unit.</p><p><b>unit</b> est le type des expressions qui ne calculent rien, comme un affichage ; il n'a qu'une valeur, notée (). C'est pourquoi « if 3/2 &lt; 2 then 4.1 », sans else, est une erreur : 4.1 est un float, pas un unit.</p><p><b>let x = e1 in e2</b> : x vaut e1, seulement dans e2. Avec <b>and</b>, les définitions sont faites en même temps : l'une ne voit pas l'autre.</p><p>Les comparaisons se lisent de gauche à droite : x = y = z se lit (x = y) = z. On compare d'abord x et y, ce qui donne un bool, puis ce bool à z.</p><p>Dans les exemples, ce qui est écrit entre (* et *) est un <b>commentaire</b> : OCaml ne le lit pas.</p>`,{code:`if 1 < 2 then 3 + 1 else 5 / 2      (* int, 4 *)
let x = 5 in x * x                  (* 25 *)
let a = 2 and b = 5 in a + 2 * b    (* 12 *)
let a = 5 in let b = a + 1 in a + b (* 11 : ici b voit a *)`,lang:"ml"}),
 L("Entraîne-toi",`<p>Les expressions avec if et avec let des exercices 1 et 3 du TD. Pour chacune : son type, puis sa valeur.</p>`,{fig:"pf-let",figKey:"figIfLet"}),
 Q("Que vaut let a = 5 and b = a + 1 in a + 2 * b, si aucun a n'a été défini avant ?",["17 : a = 5, b = 6, puis 5 + 2 × 6","Une erreur : dans un let … and, b ne voit pas le a défini en même temps","Une erreur : il faudrait écrire 2 * (b), avec des parenthèses"],1,"Avec and, les deux définitions sont simultanées. Il faudrait let a = 5 in let b = a + 1 in … Avec deux let l'un après l'autre (let a = 5 in let b = a + 1 in …), on aurait bien 17."),
 Q("Que vaut let a = 1 and b = 1 and c = 2 in a = b = c ?",["false : a = b est vrai, mais b = c est faux","true : a = b = c se lit « a = b et b = c », et a = b","Une erreur de type : (a = b) est un bool, comparé à c qui est un int"],2,"a = b = c se lit (a = b) = c, c'est-à-dire true = 2 : un bool comparé à un int."),
 Q("Que vaut if 1 < 3/2 then (if 2 < 3/2 then 1 else 2) else 3 ?",["1","2","3"],2,"3/2 = 1 (division entière), et 1 < 1 est faux : on prend le else, qui vaut 3."),
 P("TD, exercices 1 et 3, sur papier","Calcule les types et valeurs des expressions suivantes. Fais un tableau à trois colonnes sur ta feuille : expression, type, valeur. Écris « erreur » quand l'expression n'est pas correcte."+M(`if 1<2 then 3+1 else 5/2
if 3/2 < 2 then 4.1
if 3/2<2 then 4<5 else 4+5
let x=5 in x*x
let a=2 and b=true in b && (a>0)
let a=2 and b=5 in a+2*b
let a=5 and b=a+1 in a+2*b
let a=3 and b=5 in (a<b) && ((a>b)/2)`),`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Expression</th><th>Type</th><th>Valeur</th></tr></thead><tbody><tr><td>if 1&lt;2 then 3+1 else 5/2</td><td>int</td><td>4</td></tr><tr><td>if 3/2 &lt; 2 then 4.1</td><td>erreur</td><td>sans else, le then doit être de type unit ; 4.1 est un float</td></tr><tr><td>if 3/2&lt;2 then 4&lt;5 else 4+5</td><td>erreur</td><td>les deux branches n'ont pas le même type : bool et int</td></tr><tr><td>let x=5 in x*x</td><td>int</td><td>25</td></tr><tr><td>let a=2 and b=true in b &amp;&amp; (a&gt;0)</td><td>bool</td><td>true</td></tr><tr><td>let a=2 and b=5 in a+2*b</td><td>int</td><td>12</td></tr><tr><td>let a=5 and b=a+1 in a+2*b</td><td>erreur</td><td>avec and, b ne voit pas le a défini en même temps</td></tr><tr><td>let a=3 and b=5 in (a&lt;b) &amp;&amp; ((a&gt;b)/2)</td><td>erreur</td><td>(a&gt;b) est un bool : on ne peut pas le diviser par 2</td></tr></tbody></table></div>`,["Un type et une valeur pour chaque expression correcte","Les deux if refusés : pas de else avec un float, et deux branches de types différents","let … and : les définitions sont faites en même temps"],8),
 K("Dans if c then e1 else e2, quels types doivent avoir c, e1 et e2 ? Quel est le type de l'expression entière ?","if c then e1 else e2 : c est un bool, e1 et e2 ont le même type, et c'est le type du if."),
 K("Quelle est la différence entre « let a = … and b = … in » et « let a = … in let b = … in » ?","let a = … and b = … : définitions simultanées, b ne voit pas a. let a = … in let b = … : b voit a.")]},

/* ------------------------------------------------------------------ */
{id:"p-fonctions",t:"Fonctions et signatures",min:21,goal:"Écrire une fonction à un ou plusieurs arguments, et donner sa signature : demandé à chaque question du partiel.",steps:[
 Q("Quelle est la signature de function (x, y) -> if y then x + 1 else 2 * x ?",["int -> bool -> int","int * bool -> int","bool * int -> int","'a * 'b -> int"],1,"if y impose y : bool ; x + 1 impose x : int ; le résultat est un int. Avec un couple, on écrit int * bool -> int."),
 L("Définir une fonction, puis l'appeler",`<p>Pour définir la fonction f : A → B, qui à x associe r, on écrit (cours p. 26) :</p>`,{code:`let f : A -> B = function
  x -> r`,after:`<p>f est le nom de la fonction ; x est son paramètre ; A et B sont des noms de type ; r est une expression. <b>Le type d'une fonction est sa signature</b> : ici A -> B.</p><p>Exemple du cours :</p>${M(`# let double : int -> int = function x -> 2 * x;;
val double : int -> int = <fun>
# double (3);;
- : int = 6`)}<p>La signature n'est pas obligatoire : si elle manque, OCaml la calcule à partir des opérations utilisées. Mais le cours demande de l'écrire, et le partiel aussi (« vous devez donner la signature de la fonction »).</p><p>Pour appeler une fonction : son nom, puis l'argument. double (3) et double 3 veulent dire la même chose.</p>`}),
 Q("Avec let cube : float -> float = function x -> x *. x *. x, que vaut cube 2. ?",["8.","8","6.","une erreur"],0,"cube 2. = 2. *. 2. *. 2. = 8. La signature dit float -> float : le résultat est un float, écrit avec un point."),
 L("Deux façons d'écrire une fonction à deux paramètres",`<p>Un <b>couple</b> (v1, v2) range deux valeurs ensemble. Son type se note avec une étoile : (1, true) est de type int * bool (cours p. 28).</p><p>Une fonction dont la signature est A × B → C peut aussi être définie comme une fonction de signature A → B → C (cours p. 45). Exemple du cours, la plus grande valeur parmi 2 entiers :</p>`,{code:`let maxi_a : int * int -> int =
  function (x, y) -> if x < y then y else x

let maxi_b : int -> int -> int =
  function x -> function y -> if x < y then y else x

# maxi_a (5, 2);;
- : int = 5
# maxi_b 5 2;;
- : int = 5`,after:`<p><b>Avec un couple</b> (maxi_a) : function (x, y) -> …, de type t1 * t2 -> t, appelée f (a, b). <b>Curryfiée</b> (maxi_b) : de type t1 -> t2 -> t, appelée f a b, sans virgule.</p><p>Pour alléger l'écriture, la séquence « function x -> function y -> » peut être remplacée par « <b>fun x y -></b> » (cours p. 47). C'est la forme que tu écriras le plus souvent : let maxi_b : int -> int -> int = fun x y -> if x &lt; y then y else x.</p><p><b>Au contrôle, l'énoncé décide.</b> Au partiel 2021, memeParite(4,6) est écrite avec un couple (signature int * int -> bool), et (prodDiv 45 7) est curryfiée (int -> int -> int). Regarde comment l'énoncé appelle la fonction. L'examen de janvier 2024, lui, l'exige : « dès qu'une fonction prendra plusieurs arguments, vous écrirez la fonction sous sa forme curryfiée ».</p><p>Dans le cours, la signature s'écrit dans la définition : <code>let f : int -> int = function n -> 2 * n + 1</code>. C'est la meilleure façon de ne pas l'oublier sur ta copie.</p><p><b>Application partielle</b> : une fonction curryfiée peut recevoir ses arguments un par un. maxi_b 5 est la fonction qui fait correspondre à x le maximum entre 5 et x : son type est int -> int. Avec un couple, maxi_a 5 est une erreur.</p>`,fig:"pf-fonctions"}),
 L("Trouver une signature",`<p>Lis le corps de la fonction et note ce que <b>chaque opérateur impose</b> : x + 1 force x : int ; if y force y : bool ; +. force des float ; List.hd y, le premier élément de la liste y, force y à être une liste (les listes sont expliquées dans une leçon plus loin : pour l'instant, retiens seulement cette règle).</p>`,{fig:"pf-signature"}),
 Q("Quelle est la signature de fun x y -> x + 2 * y ?",["int -> int -> int","int * int -> int","float -> float -> float"],0,"fun x y : forme curryfiée, une flèche par paramètre. + et * imposent des int."),
 Q("g : int * int -> bool. Comment l'appeler avec 2 et 3 ?",["g 2 3","g (2, 3)","g [2; 3]"],1,"Une fonction qui prend un couple s'appelle avec un couple. g 2 3 serait pour une fonction curryfiée."),
 Q("h : int -> int -> int. Que vaut h 2, sans deuxième argument ?",["Une erreur : il manque le deuxième argument","Une fonction de type int -> int","Le nombre 2 : sans deuxième argument, h renvoie le premier"],1,"h attend deux int. Si on ne lui en donne qu'un, h 2 n'est pas une erreur : c'est une nouvelle fonction qui attend le deuxième int et rend un int. Son type est donc int -> int. C'est l'application partielle."),
 B("Complète la signature.","let moyenne : [[0]] = fun a b -> (a +. b) /. 2.",[{o:["float -> float -> float","int -> int -> int","float * float -> float"],a:0}],"+. et /. sont des opérateurs float ; fun a b est curryfiée : une flèche par paramètre."),
 P("TD, exercice 6, sur papier","Écris les définitions OCaml des fonctions f, g et cube définies par : f : ℤ → ℤ, x ↦ 2x + 1 ; g : ℝ × ℝ → bool, (x, y) ↦ x &lt; y/2 ; cube : ℝ → ℝ, x ↦ x³. <b>Écris la signature dans chaque définition</b> : le partiel la demande à chaque question.",M(`let f : int -> int = function
  x -> 2 * x + 1

let g : float * float -> bool = function
  (x, y) -> x < y /. 2.

let cube : float -> float = function
  x -> x *. x *. x`)+"<p>ℤ se traduit par int, ℝ par float, et ℝ × ℝ par float * float : g prend un couple. Sur les float, les opérateurs prennent un point, et 2 s'écrit 2. ; la comparaison &lt;, elle, marche sur tous les types. En OCaml, 2x s'écrit 2 * x, et x³ s'écrit x *. x *. x.</p>",["Les trois signatures : int -> int, float * float -> bool, float -> float","g prend un couple : function (x, y)","Pour les float : /. et *. avec un point, et 2. au lieu de 2","2 * x, et non 2x"],8),
 K("Une fonction à deux paramètres peut prendre un couple, ou être curryfiée. Dans chaque cas, comment s'écrivent la définition, le type et l'appel ?","Couple : function (x, y) -> …, type t1 * t2 -> t, appel f (a, b). Curryfiée : fun x y -> …, type t1 -> t2 -> t, appel f a b."),
 K("Comment trouver la signature (le type) d'une fonction à partir de son code ?","On note ce que chaque opérateur impose (+ : int, +. : float, if : bool, List.hd : liste), puis on écrit les types des paramètres et du résultat.")]},

/* ------------------------------------------------------------------ */
{id:"p-rec",t:"Récursivité sur les entiers",min:12,goal:"Écrire une fonction récursive avec let rec, à partir du cas de base et de la récurrence.",steps:[
 Q("Que manque-t-il à let f n = if n = 0 then 0 else n + f (n - 1) ?",["Un else","Le mot rec","Un match","Rien"],1,"Sans rec, la fonction ne peut pas s'appeler elle-même : OCaml répond que f n'est pas définie."),
 L("La méthode du TD",`<ol><li><b>Cas de base</b> : que vaut f 0 ?</li><li><b>Récurrence</b> : pour n &gt; 0, f n à partir de f (n − 1).</li><li><b>Traduire</b> : let rec f : int -> … = function n -> if n = 0 then … else … f (n - 1) …</li></ol><p>Déroule le calcul de som.</p>`,{fig:"pf-rec",code:`let rec som : int -> int = function
  n -> if n = 0 then 0 else n + som (n - 1)`,lang:"ml"}),
 B("TD, exercice 12 : soit la fonction f : ℕ → ℕ, qui à n associe 5 si n = 0, et 2n + f(n − 1) sinon. Écris cette fonction en OCaml. (En OCaml, 2n s'écrit 2 * n.)",`let rec f : int -> int = function
  n -> if n = 0 then [[0]] else [[1]]`,[{o:["5","0","2 * n"],a:0},{o:["2 * n + f (n - 1)","2 * n + f n - 1","f (n - 1)"],a:0}],"f(1) = 7, f(2) = 11, f(3) = 17, et f(n) = n(n + 1) + 5."),
 Q("Pourquoi écrire f (n - 1) et pas f n - 1 ?",["C'est pareil : OCaml calcule n - 1 avant d'appeler f","f n - 1 se lit (f n) - 1 : la fonction se rappelle sur n, à l'infini","Pour que ce soit plus lisible : OCaml comprend les deux"],1,"L'application d'une fonction passe avant les opérations : il faut des parenthèses autour de l'argument calculé."),
 P("TD, exercices 15 et 16, sur papier","<b>Exercice 15.</b> Écris la fonction mul qui calcule le produit de 2 entiers naturels, <b>sans utiliser l'opérateur *</b>, en n'utilisant qu'additions et soustractions. Commence par définir mul(a, b) par récurrence sur a (le cas de base quand a = 0, puis l'équation de récurrence quand a > 0), puis traduis en OCaml. <b>Exercice 16.</b> On cherche un algorithme calculant le carré d'un entier naturel, <b>sans utiliser de multiplication</b> (en n'utilisant qu'additions et soustractions). Appelons carre cette fonction. Cas de base : quand n = 0, que vaut carre(n) ? Équation de récurrence : quand n ≠ 0, essaie de définir carre(n) en fonction de carre(n − 1) (pour cela, développe l'expression (n − 1)²). Écris la fonction carre.","<p><b>mul.</b> Quand a = 0, mul(a, b) = 0. Quand a > 0, mul(a, b) = b + mul(a − 1, b), car a × b = b + (a − 1) × b.</p><p><b>carre.</b> carre(0) = 0. Comme (n − 1)² = n² − 2n + 1, on a n² = (n − 1)² + 2n − 1, donc carre(n) = carre(n − 1) + n + n − 1. On écrit n + n pour ne pas multiplier.</p>"+M(`let rec mul : int * int -> int = function
  (a, b) -> if a = 0 then 0 else b + mul (a - 1, b)

let rec carre : int -> int = function
  n -> if n = 0 then 0 else carre (n - 1) + n + n - 1`),["Aucun opérateur * dans mes deux fonctions : seulement + et −","let rec dans les deux","Les signatures écrites","Le cas de base n = 0 (ou a = 0)","Des parenthèses autour des arguments des appels"],8),
 K("Quelles sont les étapes pour écrire une fonction récursive sur un entier n ?","Cas de base (n = 0), récurrence (f n à partir de f (n − 1)), puis let rec f : int -> … = function n -> if n = 0 then … else …"),
 K("Quel mot faut-il ajouter à let pour qu'une fonction puisse s'appeler elle-même ?","rec : let rec f = … Sans rec, le nom f n'est pas connu à l'intérieur de sa propre définition.")]},

/* ------------------------------------------------------------------ */
{id:"p-chiffres",t:"Chiffres et diviseurs",min:15,goal:"Écrire queDesUn et prodDiv : 7 points au partiel 2021.",steps:[
 Q("Pour n = 4097, que valent n mod 10 et n / 10 ?",["7 et 409","409 et 7","7 et 409.7"],0,"n mod 10 est le dernier chiffre ; n / 10, en division entière, enlève le dernier chiffre."),
 L("Deux schémas qui reviennent",`<p><b>Les chiffres</b> d'un entier : cas de base n &lt; 10 (un seul chiffre), sinon on regarde n mod 10 et on rappelle sur n / 10.</p><p><b>Les diviseurs</b> de n jusqu'à i : i est un diviseur de n quand le reste de la division de n par i vaut 0, ce qui s'écrit n mod i = 0. La fonction a un paramètre i de plus, qui descend jusqu'à 0 ; à chaque étape, on teste n mod i = 0.</p><p>Le cas de base dépend de ce qu'on calcule : 0 pour une somme ou un compte, 1 pour un produit (multiplier par 1 ne change rien).</p><p>Déroule prodDiv.</p>`,{fig:"pf-rec-ex"}),
 B("Partiel 2021, question 3 (3 points) : « Définissez la fonction queDesUn : ℕ → Bool qui teste si l'écriture décimale d'un entier naturel n'est composée que du chiffre 1. Exemples : queDesUn(1111) et queDesUn(1) valent true ; queDesUn(110) et queDesUn(8) valent false. » Complète.",`let rec queDesUn : int -> bool = function
  n -> if n < 10 then [[0]]
       else [[1]] && queDesUn (n / 10)`,[{o:["n = 1","n = 0","true"],a:0},{o:["n mod 10 = 1","n / 10 = 1","n = 1"],a:0}],"Un seul chiffre : il doit valoir 1. Sinon, le dernier chiffre vaut 1, et le reste n'a que des 1."),
 O("Partiel 2021, question 4 (4 points) : « Définissez en OCaml la fonction prodDiv qui étant donnés deux entiers naturels non nuls n et i, calcule le produit des diviseurs de n inférieurs ou égaux à i. Exemples : (prodDiv 45 7) vaut 15 car les diviseurs de 45, inférieurs ou égaux à 7, sont 1, 3, et 5. (prodDiv 12 1) vaut 1 ; (prodDiv 12 2) vaut 2 ; (prodDiv 12 3) vaut 6 ; (prodDiv 12 5) vaut 24. » Remets-la dans l'ordre.",["let rec prodDiv : int -> int -> int = fun n i ->","  if i = 0 then 1","  else if n mod i = 0 then i * prodDiv n (i - 1)","  else prodDiv n (i - 1)"],"i descend jusqu'à 0 ; si i divise n, il entre dans le produit. L'énoncé écrit (prodDiv 45 7), sans virgule : la fonction est donc curryfiée, de signature int -> int -> int."),
 Q("Pour un produit comme prodDiv, que renvoie le cas de base ?",["0","1","n"],1,"1 est neutre pour la multiplication. Pour une somme ou un compte (nbDiv), ce serait 0.",{diag:false,ctx:true}),
 Q("Que vaut prodDiv 12 5 ?",["24","60","12"],0,"Les diviseurs de 12 inférieurs ou égaux à 5 sont 1, 2, 3, 4 : leur produit vaut 24.",{diag:false,ctx:true}),
 P("TD, exercice 21, sur papier","On cherche à définir une fonction vérifiant si un entier est un nombre premier (nombre ayant exactement 2 diviseurs). Pour cela, commence par définir la fonction <b>récursive</b> nbDiv, <b>de signature int -> int -> int</b>, telle que, n et i étant 2 entiers avec 1 ≤ i ≤ n, l'évaluation de nbDiv n i donne le nombre de diviseurs de n inférieurs ou égaux à i. Écris alors la fonction estPremier qui teste si un nombre est premier.",M(`let rec nbDiv : int -> int -> int = fun n i ->
  if i = 0 then 0
  else (if n mod i = 0 then 1 else 0) + nbDiv n (i - 1)

let estPremier : int -> bool = function n -> nbDiv n n = 2`),["La signature imposée, int -> int -> int : donc la forme curryfiée, fun n i","nbDiv est récursive : let rec","Cas de base i = 0 qui renvoie 0","Le test n mod i = 0","estPremier : nbDiv n n = 2"],8),
 K("Avec quelles opérations obtient-on le dernier chiffre d'un entier n, et n privé de son dernier chiffre ? Quel est le cas de base d'une récursivité sur les chiffres ?","n mod 10 : le dernier chiffre. n / 10 : n sans son dernier chiffre. Cas de base : n < 10, il ne reste qu'un chiffre."),
 K("Dans une fonction récursive, que renvoie le cas de base quand on calcule un produit ? Et quand on calcule une somme ou un compte ?","Un produit : 1 (multiplier par 1 ne change rien). Une somme ou un compte : 0.")]},

/* ------------------------------------------------------------------ */
{id:"p-listes",t:"Les listes : [], ::, List.hd, List.tl",min:15,goal:"Évaluer des expressions sur les listes (TD, exercice 22) sans erreur.",steps:[
 Q("Que vaut List.hd (List.tl [2; 3; 2; 4]) ?",["2","3","[3; 2; 4]","erreur"],1,"On calcule de l'intérieur vers l'extérieur. List.tl enlève le premier élément : List.tl [2; 3; 2; 4] = [3; 2; 4]. Puis List.hd prend le premier élément de cette liste : 3."),
 L("Construire et défaire une liste",`<ul><li>[2; 3; 2; 4] avec des <b>points-virgules</b> ; [] est la liste vide. Attention : la virgule fabrique un <b>couple</b>, comme (2, 3).</li><li><b>x :: li</b> : x ajouté devant li (x du même type que les éléments).</li><li><b>List.hd li</b> : le premier élément ; <b>List.tl li</b> : la liste sans lui. Sur [] : erreur à l'exécution.</li><li><b>List.tl li = []</b> : le test « la liste n'a qu'un élément ».</li></ul><p>Essaie les trois opérations.</p>`,{fig:"pf-listes"}),
 Q("Que vaut 8 :: 3 ?",["[8; 3] : :: met les deux nombres dans une liste","Une erreur : à droite de ::, il faut une liste","(8, 3) : :: fabrique un couple"],1,":: ajoute un élément devant une liste : à sa droite, il faut une liste. 3 est un int, pas une liste : 8 :: 3 est une erreur de type. Il faut écrire 8 :: [3], qui vaut [8; 3]. :: ajoute un élément devant une liste : 8 :: [3] = [8; 3]. Un couple s'écrit avec une virgule : (8, 3)."),
 Q("Combien d'éléments a la liste [2, 3] ?",["2 : les nombres 2 et 3","Un seul : le couple (2, 3)","Aucun : une virgule dans une liste est une erreur"],1,"La virgule fait un couple. La liste de deux entiers s'écrit [2; 3]. Dans une liste, on sépare avec des points-virgules : [2; 3] a deux éléments. La virgule fabrique un couple : ce n'est pas une erreur."),
 Q("TD, exercice 22 : avec let li = [2; 3; 2; 4], que vaut List.hd (List.tl li) :: List.tl li ?",["[3; 3; 2; 4]","[2; 3; 2; 4]","[3; 2; 4]"],0,"List.hd (List.tl li) = 3, ajouté devant List.tl li = [3; 2; 4]."),
 Q("Que vaut List.tl [7] ?",["[]","7","erreur"],0,"List.tl enlève le premier élément et rend le reste. Dans [7], il n'y a que 7 : une fois enlevé, il ne reste rien. List.tl [7] = [], la liste vide (ce n'est pas une erreur)."),
 L("Entraîne-toi : les expressions sur les listes",`<p>Six expressions de la question 1 du partiel 2021 et de l'exercice 22 du TD. Choisis le type, puis lis la valeur et l'explication.</p><p>Tous les éléments d'une liste doivent être de même type, mais ce type est quelconque. Une liste peut donc contenir des listes : [[1; 2]; [3; 1; 0]] est une liste de listes d'entiers, de type int list list.</p>`,{fig:"pf-types",figKey:"figListes",nolook:true}),
 B("TD, exercice 23 : « Écrivez une fonction qui inverse l'ordre des deux premiers éléments d'une liste d'entiers de longueur au moins deux. » Complète.",`let inverserElem : int list -> int list = function
  li -> List.hd (List.tl li) :: [[0]] :: List.tl (List.tl li)`,[{o:["List.hd li","List.tl li","li"],a:0}],"Le deuxième, puis le premier, puis le reste à partir du troisième : inverserElem [1; 2; 3] = [2; 1; 3]."),
 P("TD, exercice 22, sur papier","Évalue les expressions ci-dessous. Pour chacune, écris sur ta feuille son type et sa valeur, ou « erreur »."+M(`let li = [2;3;2;4]
List.tl (List.tl (li))
List.hd (List.tl (List.tl (li)))
List.hd (List.tl (List.tl (List.tl (List.tl (li)))))
7 :: li
7 :: List.tl (li)
List.hd (li) :: List.tl (li)
List.hd (List.tl (li)) :: List.tl (li)
List.hd ["liste"; "entiers"] :: ["chaines"]`),`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Expression</th><th>Type</th><th>Valeur</th></tr></thead><tbody><tr><td>List.tl (List.tl (li))</td><td>int list</td><td>[2; 4]</td></tr><tr><td>List.hd (List.tl (List.tl (li)))</td><td>int</td><td>2</td></tr><tr><td>List.hd (List.tl (List.tl (List.tl (List.tl (li)))))</td><td>int, mais…</td><td>erreur à l'exécution : après quatre List.tl, la liste est vide, et List.hd [] échoue</td></tr><tr><td>7 :: li</td><td>int list</td><td>[7; 2; 3; 2; 4]</td></tr><tr><td>7 :: List.tl (li)</td><td>int list</td><td>[7; 3; 2; 4]</td></tr><tr><td>List.hd (li) :: List.tl (li)</td><td>int list</td><td>[2; 3; 2; 4] : c'est li</td></tr><tr><td>List.hd (List.tl (li)) :: List.tl (li)</td><td>int list</td><td>[3; 3; 2; 4]</td></tr><tr><td>List.hd ["liste"; "entiers"] :: ["chaines"]</td><td>string list</td><td>["liste"; "chaines"]</td></tr></tbody></table></div>`,["List.tl rend une liste, List.hd rend un élément","Les listes écrites avec des points-virgules","La troisième expression : erreur, car List.hd de la liste vide","Le type string list pour la dernière"],8),
 K("Que font x :: li, List.hd li et List.tl li ? Que se passe-t-il avec List.hd ou List.tl sur la liste vide ?","x :: li : la liste li avec x ajouté devant. List.hd li : le premier élément. List.tl li : la liste sans son premier élément. Sur [], List.hd et List.tl donnent une erreur."),
 K("Quelle est la différence entre [2; 3] et [2, 3] en OCaml ?","[2; 3] est une liste de deux entiers. [2, 3] est une liste à un seul élément, le couple (2, 3).")]},

/* ------------------------------------------------------------------ */
{id:"p-schema",t:"Le schéma récursif sur les listes",min:15,goal:"Écrire somElem et prefLong : 7 points au partiel 2021.",steps:[
 Q("Que doit valoir somElem [] ?",["0","1","[]","erreur"],0,"Pour la liste vide, il n'y a aucun nombre à additionner : la somme vaut 0. C'est le cas de base de la récursion. Avec 0, ajouter les éléments un par un donne bien la somme : 3 + 5 + 0 = 8.",{diag:false,ctx:true}),
 L("Le schéma du cours",`<p>Si la liste est vide : la valeur de base. Sinon : on combine <b>List.hd li</b> avec l'appel sur <b>List.tl li</b>. La liste raccourcit à chaque appel, donc on arrive toujours à []. Choisis un exemple et déroule-le.</p>`,{fig:"pf-listes-rec",code:`let rec g : int list -> … = function
  li -> if li = [] then (valeur pour la liste vide)
        else … List.hd li … g (List.tl li) …`,lang:"ml"}),
 B("Partiel 2021, question 5 (3 points) : « Définissez la fonction somElem qui calcule la somme des éléments d'une liste d'entiers. Exemples : somElem [6 ; 9 ; 5] vaut 20 ; somElem [3] vaut 3 ; somElem [ ] vaut 0. » Complète.",`let rec somElem : int list -> int = function
  li -> if li = [] then [[0]]
        else [[1]] + somElem (List.tl li)`,[{o:["0","1","[]"],a:0},{o:["List.hd li","List.tl li","li"],a:0}],"somElem [6; 9; 5] = 6 + somElem [9; 5] = 6 + 9 + 5 + 0 = 20."),
 Q("Que manque-t-il dans « else List.hd li + somElem List.tl li » ?",["Rien : OCaml applique List.tl à li, puis somElem au résultat","Des parenthèses : somElem (List.tl li)","Un match : List.hd ne s'utilise que dans un filtrage"],1,"Sans parenthèses, OCaml lit (somElem List.tl) li : List.tl devient l'argument de somElem."),
 O("Remets ces deux fonctions dans l'ordre. longueur li calcule le nombre d'éléments de la liste li. ajout1 li calcule la liste où chaque élément de li est augmenté de 1 : ajout1 [5; 0] vaut [6; 1].",["let rec longueur : int list -> int = function","  li -> if li = [] then 0","        else 1 + longueur (List.tl li)","let rec ajout1 : int list -> int list = function","  li -> if li = [] then []","        else (List.hd li + 1) :: ajout1 (List.tl li)"],"Une liste résultat (ajout1) a [] comme cas de base, et se construit avec ::."),
 Q("Que vaut ajout1 [3; 1; 8] ?",["[4; 2; 9]","[3; 1; 8; 1]","12"],0,"ajout1 ajoute 1 à chaque élément, en gardant l'ordre : 3 devient 4, 1 devient 2, 8 devient 9. En détail : (3 + 1) :: (1 + 1) :: (8 + 1) :: [] = [4; 2; 9].",{diag:false,ctx:true}),
 P("Partiel 2021, Q5 et Q6 (7 points)","Le sujet dit : « Pour les questions 2, 3, 4, 5, 6 vous devez dans votre réponse <b>donner la signature de la fonction</b> (le type de son/ses paramètre(s) et de son résultat). » <b>Question 5.</b> Définis la fonction somElem qui calcule la somme des éléments d'une liste d'entiers. Exemples : somElem [6 ; 9 ; 5] vaut 20 ; somElem [3] vaut 3 ; somElem [ ] vaut 0. <b>Question 6.</b> Définis en OCaml la fonction prefLong qui, étant donnés une liste li et un entier naturel n, calcule le préfixe de longueur n de la liste li. Dans le cas où la longueur de li est inférieure à n, le résultat est li. Exemples : (prefLong [3;2;4] 0) vaut [ ] ; (prefLong [3;2;4] 1) vaut [3] ; (prefLong [3;2;4] 2) vaut [3;2] ; (prefLong [3;2;4] 3) vaut [3;2;4] ; (prefLong [3;2;4] 5) vaut [3;2;4].",M(`let rec somElem : int list -> int = function
  li -> if li = [] then 0
        else List.hd li + somElem (List.tl li)

let rec prefLong : int list -> int -> int list = fun li n ->
  if li = [] || n = 0 then []
  else List.hd li :: prefLong (List.tl li) (n - 1)`)+"<p>Le préfixe de longueur n, ce sont les n premiers éléments. prefLong a deux cas de base : la liste est finie, ou on a pris assez d'éléments. L'énoncé écrit (prefLong [3;2;4] 2), sans virgule : la fonction est curryfiée.</p>",["let rec et les signatures","somElem : cas de base 0","prefLong : forme curryfiée fun li n","prefLong : les deux cas de base","Parenthèses autour de List.tl li et de n - 1"],10),
 K("Quelle est la forme générale d'une fonction récursive g sur une liste li, écrite avec if, List.hd et List.tl ?","let rec g = function li -> if li = [] then (base) else … List.hd li … g (List.tl li) …"),
 K("Pour une fonction récursive sur une liste, que renvoie le cas de base (la liste vide) selon ce qu'on calcule : une somme, un produit, une liste, « tous les éléments vérifient… », « il existe un élément qui vérifie… » ?","Une somme ou un compte : 0. Un produit : 1. Une liste : []. « Tous » : true. « Il existe » : false.")]},

/* ------------------------------------------------------------------ */
{id:"p-fabriquer",t:"Fabriquer et tester des listes",min:15,goal:"Écrire les fonctions des exercices 24 à 31 du TD : garder, enlever, tous, il existe, max.",steps:[
 Q("Quelle valeur de base pour tousPairs [] (tous les éléments sont-ils pairs) ?",["true","false","0","[]"],0,"« Tous les éléments de la liste vide sont pairs » est vrai : il n'y a aucun contre-exemple. On combine ensuite avec &&.",{diag:false}),
 L("Ce que dit l'énoncé, ce que tu écris",`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>L'énoncé demande</th><th>Cas de base</th><th>Cas général</th></tr></thead><tbody><tr><td>une somme, un compte</td><td>0</td><td>… + g (List.tl li)</td></tr><tr><td>« tous vérifient »</td><td>true</td><td>(test) && g (List.tl li)</td></tr><tr><td>« il en existe un »</td><td>false</td><td>(test) || g (List.tl li)</td></tr><tr><td>garder certains éléments</td><td>[]</td><td>if (test) then List.hd li :: g (List.tl li) else g (List.tl li)</td></tr><tr><td>liste non vide (max, dernier)</td><td>if List.tl li = [] then List.hd li</td><td>… g (List.tl li) …</td></tr></tbody></table></div><p>Déroule les exemples.</p>`,{fig:"pf-listes-construire"}),
 B("TD, exercice 27 : liPairs « extrait d'une liste d'entiers la liste des nombres pairs. Par exemple liPairs([5;8;1;2]) = [8;2]. » Complète. (List.hd li mod 2 = 0 teste si le premier élément est pair.)",`let rec liPairs : int list -> int list = function
  li -> if li = [] then [[0]]
        else if List.hd li mod 2 = 0 then [[1]]
        else [[2]]`,[{o:["[]","0","true"],a:0},{o:["List.hd li :: liPairs (List.tl li)","liPairs (List.tl li)","List.hd li + liPairs (List.tl li)","[List.hd li] :: liPairs (List.tl li)"],a:0},{o:["liPairs (List.tl li)","List.hd li :: liPairs (List.tl li)","[]"],a:0}],"Garder : la tête passe devant avec ::. Enlever : on rappelle simplement la fonction sur la queue."),
 Q("TD, exercice 27 : exiPairs « teste si une liste d'entiers contient au moins un élément pair ». Que vaut exiPairs [] ?",["true","false"],1,"Dans la liste vide, il n'existe aucun élément, donc aucun pair. On combine ensuite avec ||."),
 L("Tester une liste",`<p>Pour une liste <b>non vide</b> (maximum, dernier élément), le cas de base est la liste à un seul élément : List.tl li = []. Déroule les exemples.</p>`,{fig:"pf-listes-tests"}),
 O("TD, exercices 25 et 26. derListe calcule la valeur du dernier élément d'une liste d'entiers non vide. maxListe calcule le plus grand élément d'une liste non vide d'entiers, « en utilisant la fonction max calculant le maximum de 2 nombres » : max a b. Remets les deux fonctions dans l'ordre.",["let rec derListe : int list -> int = function","  li -> if List.tl li = [] then List.hd li","        else derListe (List.tl li)","let rec maxListe : int list -> int = function","  li -> if List.tl li = [] then List.hd li","        else max (List.hd li) (maxListe (List.tl li))"],"Les deux ont le même cas de base : un seul élément, c'est la réponse."),
 P("TD 27 et 28, sur papier","<b>Exercice 27.</b> Définis tousPairs qui, étant donnée une liste d'entiers, vaut true si tous ses éléments sont pairs, false sinon. Par exemple, tousPairs([2;8;2]) et tousPairs([]) valent true, tandis que tousPairs([2;5;2]) vaut false. Définis oterPairs qui supprime les nombres pairs d'une liste d'entiers. Par exemple oterPairs([5;8;1;2]) = [5;1]. <b>Exercice 28.</b> Définis la fonction liDivInf : int -> int -> int list, telle que (liDivInf n i) donne comme résultat la liste des diviseurs de n inférieurs ou égaux à i. Par exemple (liDivInf 20 4) = [4;2;1], (liDivInf 7 5) = [1] et (liDivInf 4 4) = [4;2;1].",M(`let rec tousPairs : int list -> bool = function
  li -> if li = [] then true
        else List.hd li mod 2 = 0 && tousPairs (List.tl li)

let rec oterPairs : int list -> int list = function
  li -> if li = [] then []
        else if List.hd li mod 2 = 0 then oterPairs (List.tl li)
        else List.hd li :: oterPairs (List.tl li)

let rec liDivInf : int -> int -> int list = fun n i ->
  if i = 0 then []
  else if n mod i = 0 then i :: liDivInf n (i - 1)
  else liDivInf n (i - 1)`),["tousPairs : base true, combiné avec &&","oterPairs : base [], la tête gardée seulement si impaire","liDivInf : la signature imposée, int -> int -> int list, donc fun n i","liDivInf : même forme que nbDiv, mais avec :: et la base []","Les signatures et les parenthèses"],12),
 K("Comment écrire une fonction récursive g qui teste si tous les éléments d'une liste vérifient une propriété ? Et s'il en existe au moins un ?","Tous : true pour la liste vide, puis (test sur List.hd li) && g (List.tl li). Il existe : false pour la liste vide, puis (test sur List.hd li) || g (List.tl li)."),
 K("Une fonction récursive g fabrique une liste en gardant certains éléments de li. Qu'écrit-on quand on garde le premier élément ? Et quand on l'enlève ?","Pour la liste vide : []. On garde le premier : List.hd li :: g (List.tl li). On l'enlève : g (List.tl li).")]},

/* ------------------------------------------------------------------ */
{id:"p-match",ex:"ct",t:"Lire un filtrage (match)",min:8,p:3,goal:"Pour l'examen de janvier (le CC du 13/11 est sans filtrage, mail du prof) : savoir évaluer un match (TD, exercice 32).",steps:[
 L("match … with",`<p>match compare une valeur à des <b>motifs, de haut en bas</b>, et prend le <b>premier qui correspond</b>. when ajoute une condition, _ attrape tout. Sur les listes, x :: r donne un nom à la tête (x) et à la queue (r).</p><p>Les premières leçons sont écrites avec if, les leçons de la deuxième partie avec match : apprends d'abord la forme avec if.</p>`,{fig:"pf-match"}),
 Q("Avec le match de l'exercice 32, que vaut le résultat pour n = 6 ?",["3","7","0","2"],0,"6 n'est pas 1, n'est pas négatif, et il est pair : on prend n / 2 = 3.",{code:`match n with
| 1 -> 1
| i when i < 0 -> 0
| i when i mod 2 = 0 -> n / 2
| i when i mod 2 = 1 -> i + 1
| 3 -> 0
| _ -> 2`,lang:"ml"}),
 Q("Et pour n = 3 ?",["0","4","2"],1,"3 est impair : le cas « i when i mod 2 = 1 » passe avant « 3 », donc on obtient 3 + 1 = 4. Le cas « 3 » n'est jamais atteint.",{diag:false,ctx:true}),
 K("Dans un match qui a plusieurs cas, lequel est choisi ?","Le premier qui correspond, de haut en bas. Un cas placé après un cas plus général n'est jamais atteint.")]}
];
/* ================== leçons de l'examen de janvier (ex:"ct") ==================
   Tout le cours après les listes : filtrage, curryfication, polymorphisme, types somme et récursifs,
   enregistrements, exceptions, ordre supérieur et itérateurs, récursivité terminale.
   Le code suit le style du corrigé officiel de janvier 2024 (function / match, fonctions curryfiées). */
const MLr=(s,...v)=>String.raw(s,...v);
const kc=(s,...v)=>`<code>${W.esc(String.raw(s,...v))}</code>`;
const CT=o=>Object.assign(o,{ex:"ct"});
const St=(h,intro,s,x)=>Object.assign({k:"steps",h,intro,s},x||{});
LES.pf.forEach(L=>{if(L.id==="p-match")L.p=1;});
LES.pf.push(
/* ------------------------------------------------------------------ */
CT({id:"p2-match",t:"Écrire une fonction par filtrage",min:14,goal:"Écrire une fonction sur les listes avec function et match, comme dans les corrigés de janvier (TD ex. 33 à 36, 39).",steps:[
 Q("Que vaut (function [] -> 0 | _ :: tl -> 1 + List.length tl) [4; 5; 6] ?",["3","2","[5; 6]"],0,"La liste n'est pas vide : 1 + longueur de [5; 6], soit 1 + 2."),
 L("Un cas par forme",`<p>Une liste est soit <b>vide</b> ([]), soit <b>une tête suivie d'une queue</b> (e :: tl). Avec le filtrage, on écrit un cas pour chaque forme :</p>${M(MLr`let rec longueur = function
  | [] -> 0
  | _ :: tl -> 1 + longueur tl

let rec appartient x = function
  | [] -> false
  | e :: tl -> e = x || appartient x tl`)}<ul><li>${kc`function`} filtre le dernier paramètre sans le nommer ; ${kc`match l with`} filtre une valeur nommée.</li><li>Les cas sont essayés de haut en bas : le premier qui correspond gagne.</li><li>${kc`_`} attrape tout sans donner de nom.</li></ul>`),
 Q("Dans | e :: tl -> …, que vaut tl si la liste est [7] ?",["[]","7","[7]"],0,"La liste [7] s'écrit aussi 7 :: [] : la tête est 7 et le reste est la liste vide. Le motif e :: tl donne donc e = 7 et tl = []."),
 L("Motifs utiles",`<ul><li>${kc`[x]`} : exactement un élément ; ${kc`x :: y :: tl`} : au moins deux.</li><li>${kc`(a, b) :: tl`} : une liste de couples, déjà découpés.</li><li>${kc`| e :: tl when e mod 2 = 0 -> …`} : une condition en plus.</li><li>${kc`| e :: tl as l -> …`} : l est la liste entière.</li><li>Deux valeurs à la fois : ${kc`match l1, l2 with | [], _ -> … | _ :: _, [] -> …`}.</li></ul><p>Un même nom ne peut pas apparaître deux fois dans un motif : ${kc`(x, x)`} est refusé, on écrit ${kc`(x, y) when x = y`}.</p>`),
 B("Complète nbOcc (TD ex. 35)",MLr`let rec nbOcc x = function
  | [[0]] -> 0
  | e :: tl -> (if e = x then 1 else 0) + [[1]]`,[{o:["[]","[x]","_"],a:0},{o:["nbOcc x tl","nbOcc tl","nbOcc x e"],a:0}],"Le cas de base est la liste vide ; l'appel récursif garde x et avance sur tl."),
 O("Remets mem_assoc dans l'ordre (TD ex. 39)",["let rec mem_assoc a = function","  | [] -> false","  | (k, _) :: tl -> k = a || mem_assoc a tl"],"Le motif (k, _) :: tl découpe directement le premier couple."),
 Q("Que se passe-t-il si on écrit | n -> … avant | 0 -> … ?",["Le cas 0 n'est jamais atteint","OCaml les réordonne","Erreur de syntaxe"],0,"n attrape aussi 0. OCaml prévient : « this match case is unused »."),
 P("Listes de couples et suffixes, sur papier","(1) somme_couples : la liste des sommes a + b d'une liste de couples [(1, 2); (3, 4)] → [3; 7]. (2) liSuff (TD ex. 36) : la liste des suffixes, liSuff [1; 2; 3] = [[1; 2; 3]; [2; 3]; [3]; []].",`${M(MLr`let rec somme_couples = function
  | [] -> []
  | (a, b) :: tl -> (a + b) :: somme_couples tl

let rec liSuff = function
  | [] -> [[]]
  | _ :: tl as l -> l :: liSuff tl`)}`,["Un cas [] et un cas e :: tl","Le motif (a, b) pour lire un couple","liSuff [] = [[]] (la liste vide est un suffixe)"],8),
 K("Quel est le squelette d'une fonction récursive sur une liste, écrite par filtrage (match) ?","let rec f … = function | [] -> cas de base | e :: tl -> … e … (f … tl) …"),
 K("Dans quel ordre faut-il écrire les cas d'un match ?","De haut en bas, le premier qui correspond. Les cas particuliers d'abord, le cas général (_ ou un nom) en dernier.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-curry",t:"Curryfication, fun et application partielle",min:10,goal:"Écrire les fonctions à plusieurs arguments sous forme curryfiée, comme l'exige chaque sujet, et lire leur type.",steps:[
 Q("Les sujets demandent la forme curryfiée. Laquelle l'est ?",[kc`let add x y = x + y`,kc`let add (x, y) = x + y`,kc`let add = (x, y) -> x + y`],0,"Curryfiée : les arguments l'un après l'autre, sans couple. Appel : add 3 4."),
 L("Curryfiée ou pas",`${M(MLr`let add x y = x + y        (* int -> int -> int *)
let add_c (x, y) = x + y     (* int * int -> int *)`)}<ul><li>${kc`add`} prend x, puis y : type ${kc`int -> int -> int`}, qui se lit ${kc`int -> (int -> int)`}.</li><li>${kc`add_c`} prend <b>un seul</b> argument, un couple.</li><li>Appels : ${kc`add 3 4`} ; ${kc`add_c (3, 4)`}.</li></ul>`),
 Q("Type de add 1, avec add x y = x + y ?",[kc`int -> int`,kc`int`,"une erreur"],0,"On n'a donné qu'un argument : il en manque un, le résultat est une fonction."),
 L("fun et application partielle",`${M(MLr`let succ = add 1              (* application partielle *)
let double = fun x -> 2 * x     (* fonction anonyme *)
List.map (fun x -> x + 1) [1; 2; 3]   (* [2; 3; 4] *)

let comp f g x = f (g x)
(* ('a -> 'b) -> ('c -> 'a) -> 'c -> 'b *)`)}<p>${kc`let f x y = e`} est une écriture courte de ${kc`let f = fun x y -> e`}.</p>`),
 Q("Type de let comp f g x = f (g x) ?",[kc`('a -> 'b) -> ('c -> 'a) -> 'c -> 'b`,kc`('a -> 'b) -> ('b -> 'c) -> 'a -> 'c`,kc`('a -> 'b) -> ('c -> 'a) -> 'b`,kc`'a -> 'b -> 'c -> 'b`],0,"comp f g x calcule f (g x) : on applique g à x, puis f au résultat. Si x est de type 'c, g doit prendre un 'c et rendre quelque chose, disons un 'a. f prend ce 'a et rend un 'b. D'où ('a -> 'b) -> ('c -> 'a) -> 'c -> 'b. Le type ('a -> 'b) -> ('b -> 'c) -> 'a -> 'c serait celui de fun f g x -> g (f x), l'autre ordre. Sans le 'c -> du milieu, on oublierait l'argument x."),
 K("Qu'est-ce qu'une fonction curryfiée ? Quelle est la différence avec une fonction qui prend un couple ?","let f x y = … : type a -> b -> c, appel f x y. Avec un couple, let f (x, y) = …, type a * b -> c : pas curryfiée.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-poly",t:"Polymorphisme : deviner le type",min:12,goal:"Trouver le type d'une fonction avec des 'a (TD ex. 37 à 40), et écrire des fonctions qui marchent pour tout type de liste.",steps:[
 Q("Type de let f e l = e :: l ?",[kc`'a -> 'a list -> 'a list`,kc`int -> int list -> int list`,kc`'a -> 'b -> 'a list`],0,"e :: l met e devant la liste l. Donc l est une liste d'éléments du même type que e. Rien d'autre n'impose ce type : c'est 'a. f prend un 'a, puis une 'a list, et rend une 'a list."),
 L("Les 'a",`<p>Quand rien n'impose un type précis, OCaml met une <b>variable de type</b> : ${kc`'a`}, ${kc`'b`}… La fonction marche alors pour <b>tous</b> les types.</p>${M(MLr`let id x = x                 (* 'a -> 'a *)
let cons_last x l = l @ [x]  (* 'a -> 'a list -> 'a list *)
let proj1 (a, _) = a         (* 'a * 'b -> 'a *)`)}<p>Méthode : un type par paramètre, puis chaque opération ajoute une contrainte. ${kc`e mod 2`} force int ; ${kc`if c then`} force bool ; ${kc`e :: l`} force « même type que les éléments de l ».</p>`),
 Q("Type de let rec k a = function [] -> a | e :: tl -> if e mod 2 = 0 then k a tl else failwith \"stop\" ?",[kc`'a -> int list -> 'a`,kc`int -> int list -> int`,kc`'a -> 'a list -> 'a`],0,"e mod 2 force des int dans la liste ; a ne subit aucune contrainte, et c'est le résultat (TD ex. 37)."),
 Q("Type de let g c x l = if fst c then snd c :: l else [x] ?",[kc`bool * 'a -> 'a -> 'a list -> 'a list`,kc`'a * 'b -> 'a -> 'b list`,kc`bool -> 'a -> 'a list -> 'a list`],0,"fst c sert de condition, donc c'est un couple (bool, 'a) ; snd c :: l et [x] ont le même type."),
 P("TD ex. 40 : dup_list, sur papier","dup_list n l : chaque élément de l répété n fois (dup_list 2 [1; 2; 3] = [1; 1; 2; 2; 3; 3]). Donne aussi son type.",`${M(MLr`let rec repete n x = if n <= 0 then [] else x :: repete (n - 1) x

let rec dup_list n = function
  | [] -> []
  | e :: tl -> repete n e @ dup_list n tl
(* int -> 'a list -> 'a list *)`)}`,["Une fonction auxiliaire repete","@ pour coller deux listes","Le type avec 'a : ça marche aussi pour des char"],8),
 K("Comment trouver le type d'une fonction polymorphe à partir de son code ?","Un type inconnu par paramètre, puis chaque opération ajoute une contrainte (mod : int, if : bool, :: : même type). Ce qui reste libre devient 'a, 'b.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-somme",t:"Types somme : définir, construire, filtrer",min:15,goal:"Manipuler un type somme comme celui de l'examen de janvier 2024 (type nombre = Ent of int | Rat of (int * int)).",steps:[
 Q("type nombre = Ent of int | Rat of (int * int). Lequel est une valeur de type nombre ?",[kc`Rat (1, 2)`,kc`Rat 1 2`,kc`rat (1, 2)`],0,"Le constructeur, puis sa donnée entre parenthèses. Majuscule obligatoire."),
 L("Définir et construire",`${M(MLr`type couleur = Bleu | Blanc | Rouge   (* type énuméré *)

type nombre =
  | Ent of int
  | Rat of (int * int)

let a = Ent 3
let b = Rat (1, 2)`)}<ul><li>Chaque cas a un <b>constructeur</b> (majuscule) ; ${kc`of`} indique la donnée qu'il porte.</li><li>Une valeur de type nombre est soit un ${kc`Ent`}, soit un ${kc`Rat`}.</li></ul>`),
 L("Filtrer",`${M(MLr`let est_nul = function
  | Ent 0 -> true
  | Rat (0, _) -> true
  | _ -> false

let rec compte_rat = function          (* une liste de nombres *)
  | [] -> 0
  | Rat _ :: tl -> 1 + compte_rat tl
  | Ent _ :: tl -> compte_rat tl`)}<p>Les motifs s'emboîtent : ${kc`Rat _ :: tl`} filtre une liste dont la tête est un Rat.</p>`),
 B("Complète add_rat (janvier 2024, forme curryfiée)",MLr`let add_rat a b = match a, b with
  | Rat (x1, y1), Rat (x2, y2) -> Rat ([[0]], y1 * y2)
  | _ -> [[1]] "add_rat"`,[{o:["x1 * y2 + x2 * y1","x1 + x2","x1 * x2"],a:0},{o:["failwith","raise","invalid_arg"],a:0}],"a/b + c/d = (ad + cb)/(bd). failwith lève Failure \"add_rat\", comme demandé."),
 Q("somme_nombre [Ent 2; Rat (1, 2); Rat (3, 4)] doit donner Rat (26, 8). Que vaut Rat (2, 1) + Rat (10, 8) avec add_rat ?",[kc`Rat (26, 8)`,kc`Rat (12, 9)`,kc`Rat (13, 4)`],0,"2 × 8 + 10 × 1 = 26 et 1 × 8 = 8 : add_rat ne simplifie pas.",{diag:false,ctx:true}),
 St("Janvier 2024, ex. 2.3 : inverse_nombre","Inverser chaque nombre d'une liste ; lever Inversion avec le nombre nul s'il y en a un.",[
  {w:kc`exception Inversion of nombre`,why:"Une exception qui porte un nombre."},
  {w:kc`| [] -> []`,why:"Rien à inverser."},
  {w:kc`| Ent e :: tl -> if e = 0 then raise (Inversion (Ent e)) else Rat (1, e) :: inverse_nombre tl`,why:"L'inverse de l'entier e est 1/e."},
  {w:kc`| Rat (x, y) :: tl -> if x = 0 then raise (Inversion (Rat (x, y))) else Rat (y, x) :: inverse_nombre tl`,why:"On échange numérateur et dénominateur."}]),
 P("TD ex. 41 : split_number_list, sur papier","type number = Int of int | Float of float. split_number_list l rend le couple (liste des Int, liste des Float).",`${M(MLr`let rec split_number_list = function
  | [] -> ([], [])
  | Int i :: tl ->
     let (li, lf) = split_number_list tl in (Int i :: li, lf)
  | Float f :: tl ->
     let (li, lf) = split_number_list tl in (li, Float f :: lf)`)}`,["Le cas [] rend un couple de listes vides","let (li, lf) = … in pour lire le résultat récursif","Int i :: tl filtre la tête et la queue"],10),
 K("Comment définit-on un type somme, comment construit-on une de ses valeurs, et comment la lit-on ?","type t = A | B of int | C of (int * int). Constructeurs avec une majuscule ; on construit B 3 ; on lit avec match, un cas par constructeur.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-rectype",t:"Types récursifs : chaînes maison, ensembles, arbres",min:16,goal:"Écrire les fonctions sur un type somme récursif : my_string, chaine (2022), 'a set (2024), arbres (TD ex. 44).",steps:[
 Q("type my_string = Empty | Cons of char * my_string. Comment s'écrit \"L1\" ?",[kc`Cons ('L', Cons ('1', Empty))`,kc`Cons ("L1", Empty)`,kc`['L'; '1']`],0,"Un Cons par caractère, et Empty à la fin : c'est une liste maison."),
 L("Une liste maison",`<p>Un type somme peut se contenir lui-même :</p>${M(MLr`type my_string = Empty | Cons of char * my_string
type 'a set = Empty | Add of 'a * 'a set
type 'a tree = Empty | Node of 'a * 'a tree * 'a tree`)}<p>Les fonctions s'écrivent <b>comme sur les listes</b> : Empty joue le rôle de [], et Cons (c, r) celui de c :: r.</p>${M(MLr`let rec my_length = function
  | Empty -> 0
  | Cons (_, r) -> 1 + my_length r`)}`),
 B("Complète from_my_string (janvier 2022)",MLr`let rec from_my_string = function
  | Empty -> [[0]]
  | Cons (c, r) -> [[1]] c ^ from_my_string r`,[{o:["\"\"","Empty","[]"],a:0},{o:["Char.escaped","String.get","string_of_int"],a:0}],"Le résultat est une string : la chaîne vide pour Empty. Char.escaped transforme un char en string."),
 St("Janvier 2022 : to_my_string","Transformer une string en my_string avec String.length, String.get et String.sub.",[
  {w:kc`if String.length s = 0 then Empty`,why:"La chaîne vide devient Empty."},
  {w:kc`else Cons (String.get s 0, …)`,why:"Le premier caractère devient la tête."},
  {w:kc`to_my_string (String.sub s 1 (String.length s - 1))`,why:"Le reste : à partir de l'indice 1, de longueur la taille moins 1."}]),
 O("Remets mem dans l'ordre (janvier 2024)",["let rec mem x = function","  | Empty -> false","  | Add (e, tl) -> if x = e then true else mem x tl"],"Le même schéma que appartient sur les listes."),
 Q("type 'a tree = Empty | Node of 'a * 'a tree * 'a tree. Hauteur (vide = 0) ?",[kc`| Empty -> 0 | Node (_, g, d) -> 1 + max (height g) (height d)`,kc`| Empty -> 1 | Node (_, g, d) -> height g + height d`,kc`| Node (e, _, _) -> e`],0,"L'arbre vide a une hauteur 0. Un nœud compte pour 1 étage, auquel on ajoute la hauteur de son plus haut sous-arbre : 1 + max (height g) (height d). Exemple : un nœud seul, avec deux sous-arbres vides, a une hauteur 1 + max 0 0 = 1."),
 P("Janvier 2024, ex. 3.2 : union, sur papier","Avec type 'a set = Empty | Add of 'a * 'a set et la fonction mem, écrire union e1 e2 (sans doublon ajouté).",`${M(MLr`let rec union e1 e2 = match e1 with
  | Empty -> e2
  | Add (e, tl) -> if mem e e2 then union tl e2 else Add (e, union tl e2)`)}<p>Corrigé officiel. inter suit la même idée : on garde e seulement s'il est dans l'autre ensemble.</p>`,["Un match sur e1 (deux arguments)","mem pour éviter les doublons","Add (e, …) pour construire"],8),
 K("Comment écrit-on une fonction sur un type récursif (une liste maison, un arbre) ?","Comme sur une liste : un cas par constructeur ; le constructeur sans donnée est le cas de base ; on rappelle la fonction sur la partie du même type.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-record",t:"Enregistrements",min:8,goal:"Définir un type enregistrement, lire un champ, fabriquer une copie modifiée (TD ex. 46).",steps:[
 Q("p a le type {nom : string; age : int}. Comment lire son âge ?",[kc`p.age`,kc`age p`,kc`p[age]`],0,"Pour lire un champ d'un enregistrement, on écrit le nom de la variable, un point, puis le nom du champ : p.age. De même, p.nom donne le nom."),
 L("Champs nommés",`${M(MLr`type personne = {nom : string; prenom : string; age : int}

let p = {nom = "Church"; prenom = "Alonzo"; age = 92}
let nom_complet p = p.prenom ^ " " ^ p.nom
let vieillir p = {p with age = p.age + 1}`)}<ul><li>Dans le type : ${kc`champ : type`} ; dans la valeur : ${kc`champ = valeur`}.</li><li>${kc`{p with age = …}`} crée une copie modifiée ; p ne change pas.</li><li>Un type abréviation donne un autre nom à un type : ${kc`type entier = int`}.</li></ul>`),
 Q("Que fait {p with age = 30} ?",["Une copie de p avec age = 30","Modifie p : son champ age vaut maintenant 30","Une erreur : with ne s'utilise que dans un match"],0,"{p with age = 30} fabrique un nouvel enregistrement : une copie de p où seul le champ age vaut 30. p lui-même n'est pas modifié, car en OCaml les valeurs ne changent pas. Le with des enregistrements n'a rien à voir avec match … with : il fabrique une copie."),
 K("Pour un enregistrement : comment définit-on le type, crée-t-on une valeur, lit-on un champ, fait-on une copie modifiée ?","type t = {a : int; b : string} ; valeur {a = 1; b = \"x\"} ; lecture v.a ; copie modifiée {v with a = 2}.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-exc",t:"Exceptions : lever, définir, rattraper",min:16,goal:"Lever Failure, Invalid_argument, Not_found ou ta propre exception, et la rattraper avec try … with (TD ex. 47 à 51, tous les examens).",steps:[
 Q("Que fait failwith \"vide\" ?",["Il lève l'exception Failure \"vide\"","Il affiche « vide »","Il rend la chaîne \"vide\""],0,"failwith \"vide\" lève (« raise ») l'exception Failure \"vide\" : le calcul s'arrête, et le message apparaît si personne ne rattrape l'exception avec try … with. failwith s est un raccourci pour raise (Failure s).",{diag:false}),
 L("Lever une exception",`${M(MLr`let tete = function
  | [] -> failwith "tete"            (* Failure "tete" *)
  | e :: _ -> e

let rec maxListe = function
  | [] -> invalid_arg "maxListe"     (* Invalid_argument *)
  | [x] -> x
  | x :: tl -> max x (maxListe tl)

exception Negatif of int             (* ta propre exception *)
let verifie x = if x < 0 then raise (Negatif x) else x`)}<ul><li>Prédéfinies : Failure, Invalid_argument, Not_found, Division_by_zero, Match_failure.</li><li>Un nom d'exception commence par une majuscule ; ${kc`of`} pour un argument.</li><li>${kc`raise`} a le type ${kc`exn -> 'a`} : il convient à n'importe quel résultat.</li></ul>`),
 L("Rattraper avec try … with",`${M(MLr`let my_tl l = try List.tl l with Failure _ -> []

let plus_petit_que n l =
  try plus_petit_que_exc n l with Found e -> e`)}<ul><li>Si l'expression du ${kc`try`} ne lève rien, c'est son résultat.</li><li>Sinon l'exception est filtrée par les cas du ${kc`with`} ; si aucun ne correspond, elle continue de remonter.</li></ul>`),
 Q("f n = match n with i when i >= 0 -> 1 / i | i when i >= -10 && i <= -1 -> (try g n with Failure _ -> 0). g (-10) lève Invalid_argument. Que donne f (-10) ?",["L'exception Invalid_argument, qui n'est pas rattrapée","0 : le try … with rattrape l'erreur de g","-10 : f renvoie n quand g échoue"],0,"Le with ne filtre que Failure : Invalid_argument passe à travers (TD ex. 47). try … with Failure _ ne rattrape que Failure : Invalid_argument passe au travers."),
 Q("Et f (-11) ?",["Match_failure : aucun cas ne correspond","0 : le try … with rattrape tout","Invalid_argument : g (-11) échoue comme g (-10)"],0,"Le match de f n'a que deux cas : les nombres ≥ 0, et ceux entre -10 et -1. -11 n'entre dans aucun des deux. Quand aucun cas ne correspond, OCaml lève l'exception Match_failure. −11 n'est ni ≥ 0 ni entre −10 et −1 : on n'entre dans aucun cas, donc g n'est même pas appelée.",{diag:false,ctx:true}),
 B("Complète somme_sous_liste (TD ex. 50)",MLr`exception Impossible

let rec somme_sous_liste s = function
  | [] -> if s = 0 then [] else [[0]] Impossible
  | e :: tl ->
     try e :: somme_sous_liste (s - e) tl
     with [[1]] -> somme_sous_liste s tl`,[{o:["raise","failwith","try"],a:0},{o:["Impossible","Failure _","Not_found"],a:0}],"On essaie avec e ; si c'est impossible, on recommence sans lui."),
 P("Janvier 2024, ex. 1.2 : trouve_pytha, sur papier","est_pytha x y z teste x² + y² = z². Écrire trouve_pytha x z qui rend y tel que (x, y, z) soit pythagoricien, ou lève Not_found. trouve_pytha 3 5 = 4.",`${M(MLr`let rec trouve_aux x y z =
  if y * y >= z * z then raise Not_found
  else if est_pytha x y z then y
  else trouve_aux x (y + 1) z

let trouve_pytha x z = trouve_aux x 1 z`)}`,["Une fonction auxiliaire qui essaie y = 1, 2, 3…","Un test d'arrêt (y² ≥ z²) qui lève Not_found","raise Not_found, sans failwith"],10),
 K("Comment lève-t-on une exception, comment en définit-on une nouvelle, et comment la rattrape-t-on ?","raise E, failwith \"…\", invalid_arg \"…\" ; exception E of int ; try expr with E x -> … | Failure _ -> …"),
 K("Que devient une exception que le with ne filtre pas ?","Elle continue de remonter jusqu'au try suivant (ou arrête le programme).")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-ordre-sup",t:"Ordre supérieur : map, filter, fold à la main",min:14,goal:"Écrire une fonction qui prend une fonction en paramètre et donner son type (TD ex. 52 et 53, examens 2022 : map_sum et prodFonc).",steps:[
 Q("Type de let f g x = g x ?",[kc`('a -> 'b) -> 'a -> 'b`,kc`'a -> 'b -> 'c`,kc`('a -> 'a) -> 'a`],0,"g est appliquée à x : g prend le type de x et rend autre chose."),
 L("Une fonction en paramètre",`${M(MLr`let rec my_map f = function
  | [] -> []
  | e :: tl -> f e :: my_map f tl
(* ('a -> 'b) -> 'a list -> 'b list *)

let rec my_filter p = function
  | [] -> []
  | e :: tl -> if p e then e :: my_filter p tl else my_filter p tl`)}<p>Le parcours est écrit une fois ; la fonction passée en paramètre décide du traitement : ${kc`my_map (fun x -> x * 2) [1; 2]`} = [2; 4].</p>`),
 St("Janvier 2022, ex. 3.1 : map_sum avec List.hd et List.tl","map_sum f [a1; …; an] = (f a1) + … + (f an).",[
  {w:kc`let rec map_sum f l =`,why:"Deux arguments : la fonction et la liste, curryfiés."},
  {w:kc`if l = [] then 0`,why:"La somme vide vaut 0."},
  {w:kc`else f (List.hd l) + map_sum f (List.tl l)`,why:"f sur la tête, plus la somme du reste."},
  {w:`Type : ${kc`('a -> int) -> 'a list -> int`}`,why:"Le + force f à rendre des int."}]),
 Q("Version filtrage de map_sum ?",[kc`let rec map_sum f = function [] -> 0 | e :: tl -> f e + map_sum f tl`,kc`let rec map_sum = function [] -> 0 | e :: tl -> e + map_sum tl`,kc`let map_sum f l = f l`],0,"Même calcul que la version avec if, mais écrit avec un cas par forme de liste : la liste vide donne 0, et une liste e :: tl donne f e plus le résultat sur le reste tl (question 2).",{diag:false,ctx:true}),
 B("Complète my_fold_right (TD ex. 53)",MLr`let rec my_fold_right f l init = match l with
  | [] -> [[0]]
  | e :: tl -> f e ([[1]])`,[{o:["init","[]","0"],a:0},{o:["my_fold_right f tl init","my_fold_right f l init","f tl init"],a:0}],"f a1 (f a2 (… (f an init))) : init pour la liste vide."),
 K("Qu'est-ce qu'une fonction d'ordre supérieur ?","Elle prend une fonction en paramètre (ou en rend une). my_map f l, my_filter p l : le parcours est écrit une fois, f décide du traitement.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-iter",t:"Les itérateurs de List",min:16,goal:"Utiliser List.map, filter, for_all, exists, fold_left et fold_right, imposés dans chaque examen.",steps:[
 Q("List.fold_left (fun a e -> a + e) 0 [1; 2; 3] vaut…",["6","[1; 2; 3]","0"],0,"fold_left part de l'accumulateur 0 et parcourt la liste de gauche à droite : 0 + 1 = 1, puis 1 + 2 = 3, puis 3 + 3 = 6. C'est la somme des éléments : ((0 + 1) + 2) + 3 = 6."),
 L("Les itérateurs",`${M(MLr`List.map (fun e -> e + 1) [1; 2; 3]            (* [2; 3; 4] *)
List.filter (fun e -> e >= 0) [1; -2; 3]      (* [1; 3] *)
List.for_all (fun e -> e > 0) [1; 2]          (* true *)
List.exists (fun e -> e < 0) [1; 2]           (* false *)
List.fold_left (fun a e -> a + e) 0 [1; 2; 3] (* 6 *)
List.fold_right (fun e a -> e :: a) [1; 2] [] (* [1; 2] *)`)}`),
 L("fold_left et fold_right",`<ul><li>${kc`List.fold_left f init [b1; …; bn]`} = f (… (f (f init b1) b2) …) bn : la fonction reçoit <b>(accumulateur, élément)</b>.</li><li>${kc`List.fold_right f [b1; …; bn] init`} = f b1 (f b2 (… (f bn init))) : la fonction reçoit <b>(élément, accumulateur)</b>, et la liste vient <b>avant</b> init.</li></ul><p>Méthode : init = le résultat pour la liste vide ; la fonction dit comment un élément change l'accumulateur.</p>`),
 B("Janvier 2022, ex. 3.3 : map_sum avec List.fold_left",MLr`let map_sum f l = List.fold_left (fun a e -> [[0]]) [[1]] l`,[{o:["a + f e","f a + e","a + e"],a:0},{o:["0","1","[]"],a:0}],"L'accumulateur a garde la somme ; on lui ajoute f e."),
 B("Juin 2022, ex. 1.3 : prodFonc avec List.fold_right",MLr`let prodFonc f l = List.fold_right (fun e a -> [[0]]) l [[1]]`,[{o:["f e * a","a * e","f a * e"],a:0},{o:["1","0","[]"],a:0}],"Un produit vide vaut 1 ; fold_right donne l'élément d'abord."),
 Q("Que fait let i e l = List.length (List.filter (fun x -> x = e) l) ?",["Elle compte les occurrences de e dans l","Elle supprime e de l","Elle teste si e est dans l"],0,"filter garde les x égaux à e, length les compte (TD ex. 57)."),
 St("Janvier 2024, ex. 2.4 : simplifie_nombre avec List.fold_right","Supprimer les nombres nuls ; Rat (x, 1) devient Ent x.",[
  {w:kc`List.fold_right (fun e a -> match e with … ) l []`,why:"On reconstruit la liste de droite à gauche ; [] pour la liste vide."},
  {w:kc`| Ent 0 -> a  | Rat (0, _) -> a`,why:"Un nombre nul : on ne l'ajoute pas."},
  {w:kc`| Rat (x, 1) -> Ent x :: a`,why:"Dénominateur 1 : on le transforme en entier."},
  {w:kc`| _ -> e :: a`,why:"Sinon on le garde tel quel."}]),
 P("TD ex. 59 : somme_pairs et est_triee, sur papier","Avec des itérateurs seulement : (1) la somme des entiers pairs d'une liste ; (2) est_triee l (fold_left, l'accumulateur est le couple (réponse, dernier élément) ; la liste vide à part).",`${M(MLr`let somme_pairs l =
  List.fold_left (fun a e -> if e mod 2 = 0 then a + e else a) 0 l

let est_triee = function
  | [] -> true
  | e :: tl ->
     fst (List.fold_left (fun (ok, prec) x -> (ok && prec <= x, x)) (true, e) tl)`)}`,["init correct (0, puis (true, e))","Ordre des arguments de la fonction de fold_left : a, puis e","fst pour sortir la réponse du couple"],12),
 K("Comment s'écrivent List.fold_left et List.fold_right ? Dans quel ordre leur fonction reçoit-elle l'élément et l'accumulateur ?","List.fold_left (fun a e -> …) init l ; List.fold_right (fun e a -> …) l init. init = résultat pour la liste vide."),
 K("Que font List.map, List.filter, List.for_all, List.exists, List.iter et List.length ?","List.map f l, List.filter p l, List.for_all p l, List.exists p l, List.iter f l (effets), List.length l.")]}),

/* ------------------------------------------------------------------ */
CT({id:"p2-terminal",t:"Récursivité terminale et accumulateurs",min:10,goal:"Reconnaître un appel terminal et écrire une version terminale avec un accumulateur (fin du cours).",steps:[
 Q("Dans let rec fact n = if n = 0 then 1 else n * fact (n - 1), l'appel fact (n - 1) est-il terminal ?",["Non : il reste la multiplication par n après","Oui : fact (n - 1) est le dernier appel écrit","Seulement pour n = 1 : c'est le dernier appel avant le cas de base"],0,"Terminal = dernière opération. Ici, on multiplie encore après l'appel."),
 L("Appel terminal, accumulateur",`<p>Un appel est <b>terminal</b> s'il est la toute dernière opération : son résultat devient directement celui de la fonction, et rien ne reste en attente sur la pile.</p>${M(MLr`let rec factI n a = if n = 0 then a else factI (n - 1) (n * a)
let fact2 n = factI n 1

let inv l =
  let rec aux l acc = match l with
    | [] -> acc
    | t :: q -> aux q (t :: acc)
  in aux l []`)}<p>L'<b>accumulateur</b> porte le résultat partiel ; il part de la valeur du cas de base (1 pour un produit, 0 pour une somme, [] pour une liste).</p>`),
 Q("fact2 3 = factI 3 1. Quel appel vient ensuite ?",[kc`factI 2 3`,kc`factI 2 1`,kc`3 * factI 2 1`],0,"n − 1 = 2 et n × a = 3 × 1 = 3. Puis factI 1 6, factI 0 6, résultat 6.",{diag:false,ctx:true}),
 P("Une somme terminale, sur papier","Écrire som n = 0 + 1 + … + n de façon récursive terminale.",`${M(MLr`let rec somI n a = if n = 0 then a else somI (n - 1) (a + n)
let som n = somI n 0`)}`,["Un accumulateur initialisé à 0","L'appel récursif est la dernière opération"],5),
 K("Qu'est-ce qu'une fonction récursive terminale, et comment en obtient-on une ?","L'appel récursif est la dernière opération. On y arrive avec un accumulateur initialisé à la valeur du cas de base : factI n a, puis fact n = factI n 1.")]}));

})();
