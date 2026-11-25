/* L'examen de Prog. fonctionnelle en 2 h (lundi 11/01, date supposée, 67 % de la note, une feuille A4 recto-verso).
   Les trois anciens sujets (janvier 2022, juin 2022, janvier 2024) ont la même forme : un type somme à manipuler
   (7 points, 13 en 2024), un exercice d'arithmétique avec une fonction auxiliaire et une exception (7), une fonction
   « de trois façons » (6 ou 7). Les notions suivent cet ordre. Les exemples des méthodes sont exécutés par
   tools/verif/express/pf.js. Les exercices sont tirés de gen-pf.js. */
(()=>{
const ml=s=>W.code(s,"ml"),k=s=>"<code>"+W.esc(s)+"</code>";
(window.EXPRESS=window.EXPRESS||{}).pf={ct:{
 t:"L'examen de Prog. fonctionnelle en 2 h",du:"de l'examen",au:"à l'examen",duree:120,
 lead:"Tout le programme de l'examen de janvier, dans l'ordre de ce qui rapporte le plus aux trois anciens sujets (janvier 2022, juin 2022, janvier 2024) : le type somme, puis l'arithmétique avec une fonction auxiliaire, puis la fonction « de trois façons » (2022 et juin 2022). Pour chaque notion : l'essentiel, la méthode de l'examen sur un vrai exemple, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20. Ta feuille A4 est permise : ce qui est marqué « sur ta feuille » mérite d'y être recopié.",
 carte:"tout l'examen en 2 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Trois exercices dans l'ordre des anciens sujets : l'arithmétique et son exception, le type somme et le filtrage, puis la fonction de trois façons. Fais-les sans revenir aux notions. La note qui sort est une estimation : ici, tu complètes une ligne ou tu donnes une valeur ; à l'examen, tu écriras les fonctions entières.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"valeur",t:"Écrire une valeur d'un type somme",pts:1,ou:"le type somme, tous les ans (exercice 2, ou 3 en juin 2022)",lect:1.5,
  rappel:{min:2,q:`Avec les types nombre, my_string et 'a set, écris : la fraction 3/4 ; l'entier −2 ; la chaîne « ok » ; l'ensemble {5, 7} ; la liste qui contient l'entier 2, puis la fraction 1/2.`,
   r:ml(`Rat (3, 4)
Ent (-2)
Cons ('o', Cons ('k', Empty))
Add (5, Add (7, Empty))
[Ent 2; Rat (1, 2)]`)},
  ess:`<ul><li>Un type somme donne la liste de ses cas : ${k("type nombre = Ent of int | Rat of (int * int)")}. Chaque cas a son <b>constructeur</b> (une majuscule) et, après ${k("of")}, ce qu'il contient.</li>
<li>Une valeur, c'est un constructeur suivi de son contenu : ${k("Ent 3")}, ${k("Rat (1, 2)")}.</li>
<li>Un type <b>récursif</b> se contient lui-même : ${k("type my_string = Empty | Cons of char * my_string")}. On emboîte les constructeurs et on finit par le cas qui ne contient rien : « L1 » s'écrit ${k("Cons ('L', Cons ('1', Empty))")}.</li>
<li>${k("'a")} se lit « un type quelconque » : ${k("'a set")} est un ensemble de n'importe quoi, et un ensemble d'entiers est un ${k("int set")}.</li></ul>`,
  piege:`Un nombre négatif après un constructeur se met entre parenthèses : ${k("Ent (-3)")}. Un caractère s'écrit entre apostrophes, ${k("'L'")}, pas entre guillemets.`,
  meth:`<p>Janvier 2024, exercice 3 : l'ensemble {1, 2, 3} avec ce type.</p>${ml(`type 'a set =
  | Empty
  | Add of 'a * 'a set`)}
<ol><li>On part de l'ensemble vide : ${k("Empty")}.</li>
<li>On ajoute 3, puis 2 : ${k("Add (3, Empty)")}, puis ${k("Add (2, Add (3, Empty))")}.</li>
<li>On ajoute 1 : ${k("Add (1, Add (2, Add (3, Empty)))")}. C'est la valeur du sujet, avec une parenthèse fermante par ${k("Add")}.</li></ol>`},
 {id:"somme",t:"Lire une fonction sur un type somme : ce qu'elle renvoie",pts:2,ou:"le type somme (add_rat, inverse_nombre en 2024)",lect:2,exo:{g:"PF5",lv:1},
  ess:`<ul><li>Une fonction sur un type somme est un ${k("match")} (ou un ${k("function")}) avec <b>une branche par constructeur</b>.</li>
<li>Le motif donne un nom à ce que contient le constructeur : dans ${k("| Rat (p, q) -> …")}, on peut se servir de p et de q.</li>
<li>Avec deux arguments, on filtre le couple : ${k("match x, y with | Rat (a, b), Rat (c, d) -> … | _ -> …")}.</li>
<li>Quand une branche rappelle la fonction, comme ${k("| Cons (_, r) -> 1 + my_length r")}, on déroule les appels jusqu'à ${k("Empty")}, puis on remonte. Pour un arbre, chaque nœud fait deux appels, sur g et sur d.</li></ul>`,
  piege:`Le motif ${k("_")} attrape tous les cas qui restent : mets-le en dernier, sinon les branches d'après ne servent jamais. Et ${k("Rat (1, 2) + Rat (3, 4)")} est une erreur : + ne marche que sur des int.`,
  meth:`<p>Janvier 2024, exercice 2, question 1 : add_rat, la somme de deux rationnels, sinon l'exception Failure "add_rat".</p>${ml(`let add_rat x y = match x, y with
  | Rat (a, b), Rat (c, d) -> Rat (a * d + c * b, b * d)
  | _ -> failwith "add_rat"`)}
<ol><li>Le cas utile : deux ${k("Rat")}. On applique a/b + c/d = (ad + cb)/(bd).</li>
<li>Tous les autres cas : l'exception demandée, en une seule branche ${k("_")}.</li>
<li>On vérifie sur l'exemple du sujet : ${k("add_rat (Rat (1, 2)) (Rat (3, 4))")} = Rat (1 × 4 + 3 × 2, 2 × 4) = ${k("Rat (10, 8)")}. Le sujet ne demande pas de simplifier.</li>
<li>Une fonction récursive se déroule pareil : ${k("my_length (Cons ('r', Cons ('u', Empty)))")} = 1 + (1 + 0) = 2.</li></ol>`},
 {id:"recursif",t:"Écrire une fonction sur un type somme ou récursif",pts:2.5,ou:"le type somme (my_length, mem, union, inverse_nombre)",lect:2,exo:{g:"PF5",lv:2},
  ess:`<ul><li>Même schéma que sur les listes : un <b>cas de base</b> pour le constructeur qui ne contient pas le type (${k("Empty")}), et un <b>cas récursif</b> qui rappelle la fonction sur la partie du même type.</li>
<li>${k("Cons (c, r)")} se lit comme ${k("x :: r")} : c est le premier caractère, r la suite.</li>
<li>Pour un arbre ${k("Node (x, g, d)")}, il y a deux appels : un sur g, un sur d.</li>
<li>Une branche dont le constructeur ne contient pas le type ne rappelle rien : ${k("| Ent n -> Rat (1, n)")}.</li></ul>`,
  piege:`L'appel récursif se fait sur r, la partie plus petite, jamais sur la valeur entière : sinon le calcul ne s'arrête pas. Et pour un arbre, il faut les deux fils.`,
  meth:`<p>Janvier 2024, exercice 3 : mem, puis union.</p>${ml(`let rec mem x e = match e with
  | Empty -> false
  | Add (y, r) -> x = y || mem x r

let rec union e1 e2 = match e1 with
  | Empty -> e2
  | Add (x, r) ->
    if mem x e2 then union r e2
    else Add (x, union r e2)`)}
<ol><li>mem, cas de base : rien n'est dans l'ensemble vide, donc ${k("false")}. Cas ${k("Add (y, r)")} : x est y, ou x est dans le reste r.</li>
<li>Le type de mem (le sujet le demande) : ${k("'a -> 'a set -> bool")}. x est comparé à y, donc ils ont le même type 'a.</li>
<li>union : on prend les éléments de e1 un par un, et on n'ajoute à e2 que ceux qui n'y sont pas encore.</li>
<li>${k("union (Add (1, Add (2, Empty))) (Add (2, Empty))")} : 1 n'est pas dans e2, on le garde ; 2 y est déjà. Résultat : ${k("Add (1, Add (2, Empty))")}.</li></ol>`},
 {id:"chaine",t:"Passer d'une string au type maison, et retour",pts:1,ou:"exercice 2 (janvier 2022), exercice 3 (juin 2022)",lect:1.5,
  rappel:{min:3,q:`Avec ${k("type my_string = Empty | Cons of char * my_string")}, écris to_my_string, qui passe d'une string à un my_string (avec String.length, String.get et String.sub), puis from_my_string, qui fait l'inverse (avec Char.escaped et ^).`,
   r:ml(`let rec to_my_string s =
  if String.length s = 0 then Empty
  else Cons (String.get s 0,
             to_my_string (String.sub s 1 (String.length s - 1)))

let rec from_my_string s = match s with
  | Empty -> ""
  | Cons (c, r) -> Char.escaped c ^ from_my_string r`)},
  ess:`<ul><li>${k("String.length s")} : le nombre de caractères. ${k("String.get s 0")} : le premier caractère, un char.</li>
<li>${k("String.sub s 1 (String.length s - 1)")} : la chaîne sans son premier caractère.</li>
<li>${k("Char.escaped c")} : la string qui contient seulement c. ${k("^")} colle deux strings.</li>
<li>Le sujet donne ces fonctions, mais pas la façon de s'en servir : le schéma de to_my_string mérite d'être sur ta feuille.</li></ul>`,
  piege:`Le 3<sup>e</sup> argument de String.sub est une <b>longueur</b>, pas une position de fin : ${k('String.sub "bonjour" 3 4')} vaut ${k('"jour"')}. Le cas de base est la chaîne vide, testée par ${k("String.length s = 0")}.`,
  meth:`<p>${k('to_my_string "L1"')}, l'exemple du sujet de 2022.</p>
<ol><li>« L1 » n'est pas vide : premier caractère ${k("'L'")}, reste ${k('String.sub "L1" 1 1')} = ${k('"1"')}.</li>
<li>« 1 » : premier caractère ${k("'1'")}, reste ${k('String.sub "1" 1 0')} = ${k('""')}.</li>
<li>La chaîne vide donne ${k("Empty")}. Résultat : ${k("Cons ('L', Cons ('1', Empty))")}, comme dans le sujet.</li>
<li>Retour : ${k("from_my_string")} de cette valeur donne ${k('"L" ^ ("1" ^ "")')} = ${k('"L1"')}.</li></ol>`},
 {id:"puissance",t:"La puissance avec ** et les conversions",pts:1,ou:"l'arithmétique, question 1 (2022, juin 2022)",lect:1,
  rappel:{min:2,q:`Écris puis2 n, qui calcule 2ⁿ en int, avec ${k("**")} (qui ne prend que des float), float_of_int et int_of_float. Puis nbMersenne n, qui vaut 2ⁿ − 1.`,
   r:ml(`let puis2 n = int_of_float (2. ** float_of_int n)
let nbMersenne n = puis2 n - 1`)+`<p>${k("nbMersenne 3")} vaut 7.</p>`},
  ess:`<ul><li>${k("**")} prend deux float et rend un float : ${k("2. ** 3.")} vaut ${k("8.")}.</li>
<li>${k("float_of_int 3")} vaut ${k("3.")} et ${k("int_of_float 8.")} vaut ${k("8")}.</li>
<li>Donc la puissance de deux entiers : ${k("int_of_float (float_of_int x ** float_of_int y)")}.</li></ul>`,
  piege:`Écrire ${k("2 ** n")} est une erreur de type : 2 et n sont des int. Écris ${k("2.")} avec un point, et convertis n. Les opérations sur les float ont aussi un point : +. -. *. /.`,
  meth:`<p>Janvier 2022 : Fₙ = 2<sup>2ⁿ</sup> + 1.</p>${ml(`let pow x y = int_of_float (float_of_int x ** float_of_int y)
let fermat_nbr n = pow 2 (pow 2 n) + 1`)}
<ol><li>${k("fermat_nbr 2")} = pow 2 (pow 2 2) + 1 = pow 2 4 + 1 = 17.</li>
<li>${k("fermat_nbr 3")} = pow 2 8 + 1 = 257. Ce sont bien F₂ et F₃ du sujet.</li></ol>`},
 {id:"auxiliaire",t:"Arithmétique : la fonction auxiliaire « à partir du rang n »",pts:2.5,ou:"l'arithmétique (Fermat 2022 ex. 1, Mersenne juin 2022 ex. 2, Pythagore 2024 ex. 1)",lect:2,
  rappel:{min:4,q:`Janvier 2022 : écris is_fermat_rec p n (existe-t-il un Fₖ égal à p avec k ≥ n ?), puis is_fermat p, avec fermat_nbr. Par exemple, is_fermat_rec 15 2 vaut false, car F₂ = 17 &gt; 15.`,
   r:ml(`let rec is_fermat_rec p n =
  let f = fermat_nbr n in
  if f > p then false
  else f = p || is_fermat_rec p (n + 1)

let is_fermat p = is_fermat_rec p 0`)+`<p>Fermat commence au rang 0 (F₀ = 3), Mersenne au rang 1 (M₁ = 1) : c'est le rang de départ donné à l'auxiliaire.</p>`},
  ess:`<ul><li>Les nombres de Mersenne : Mₙ = 2ⁿ − 1 (M₁ = 1, M₂ = 3, M₃ = 7…), calculés par ${k("nbMersenne n")}. Pour savoir si p en est un, on ne sait pas jusqu'à quel rang chercher. Le sujet fait donc écrire d'abord ${k("estMersenneRec p n")} : « existe-t-il un Mₖ égal à p avec k ≥ n ? ».</li>
<li>Trois cas : Mₙ = p, c'est ${k("true")} ; Mₙ > p, c'est ${k("false")}, car les suivants sont encore plus grands ; sinon, on essaie le rang n + 1.</li>
<li>Puis la fonction demandée appelle l'auxiliaire au premier rang : ${k("estMersenne p = estMersenneRec p 1")}.</li></ul>`,
  piege:`Sans le cas « Mₙ > p », la fonction ne s'arrête jamais quand p n'est pas un nombre de Mersenne. Ce cas marche parce que la suite des Mₙ est croissante.`,
  meth:`<p>Juin 2022, exercice 2, question 3.</p>${ml(`let rec estMersenneRec p n =
  let m = nbMersenne n in
  if m = p then true
  else if m > p then false
  else estMersenneRec p (n + 1)

let estMersenne p = estMersenneRec p 1`)}
<ol><li>${k("estMersenneRec 15 3")} : M₃ = 7 &lt; 15, on passe au rang 4 ; M₄ = 15 : ${k("true")}, comme dans le sujet.</li>
<li>${k("estMersenneRec 15 5")} : M₅ = 31 &gt; 15 : ${k("false")}.</li>
<li>Même idée en 2024 : trouve_pytha x z essaie y = 1, 2, 3… et lève ${k("Not_found")} dès que y × y ≥ z × z. ${k("trouve_pytha 3 5")} vaut 4.</li></ol>`},
 {id:"liste-n",t:"Fabriquer la liste des n premiers",pts:1.5,ou:"la dernière question de l'arithmétique, tous les ans",lect:1.5,
  rappel:{min:3,q:`Écris fermat_list n, la liste des n premiers nombres de Fermat (F₀ à Fₙ₋₁, dans l'ordre que tu veux), avec fermat_nbr.`,
   r:ml(`let rec fermat_list n =
  if n <= 0 then []
  else fermat_nbr (n - 1) :: fermat_list (n - 1)`)+`<p>${k("fermat_list 3")} vaut ${k("[17; 5; 3]")} : les 3 premiers sont F₀, F₁ et F₂, donc le dernier ajouté est de rang n − 1.</p>`},
  ess:`<ul><li>Une liste se fabrique avec ${k("::")} : l'élément de rang n devant la liste des précédents.</li>
<li>Le cas de base : n ≤ 0 donne ${k("[]")}.</li>
<li>La liste sort dans l'ordre décroissant : le sujet accepte les deux ordres.</li></ul>`,
  piege:`Écrire ${k("listeMersenne (n - 1) :: nbMersenne n")} est une erreur de type : à gauche de ${k("::")} un élément, à droite une liste. Et compte les rangs : les n premiers nombres de Fermat vont de F₀ à Fₙ₋₁.`,
  meth:`<p>Juin 2022 : listeMersenne n, avec M₁ = 1, M₂ = 3…</p>${ml(`let rec listeMersenne n =
  if n <= 0 then []
  else nbMersenne n :: listeMersenne (n - 1)`)}
<ol><li>${k("listeMersenne 3")} = 7 :: listeMersenne 2 = 7 :: 3 :: listeMersenne 1 = 7 :: 3 :: 1 :: [].</li>
<li>Résultat : ${k("[7; 3; 1]")}.</li>
<li>En 2024 (genere_pytha 50), même schéma avec un rang qui monte et un arrêt dès qu'un nombre dépasse m : ${k("[(3, 4, 5); (5, 12, 13); (7, 24, 25); (9, 40, 41)]")}.</li></ol>`},
 {id:"exceptions",t:"Lever une exception",pts:1.5,ou:"exercices 1 et 2 (Not_found, Failure, Inversion, Invalid_argument)",lect:1.5,exo:{g:"PF7",lv:0},
  ess:`<ul><li>${k("raise Not_found")} lève une exception d'OCaml ; ${k('failwith "add_rat"')} lève ${k('Failure "add_rat"')} ; ${k('invalid_arg "my_get"')} lève ${k('Invalid_argument "my_get"')}.</li>
<li>Une exception à toi : ${k("exception Inversion of nombre")}, puis ${k("raise (Inversion (Ent 0))")}.</li>
<li>Une exception arrête tout le calcul : il n'y a pas de valeur. ${k("try e with Not_found -> 0")} la rattrape : si e lève Not_found, le tout vaut 0.</li></ul>`,
  piege:`Écrire ${k("raise Inversion (Ent 0)")} est une erreur : il faut les parenthèses, ${k("raise (Inversion (Ent 0))")}.`,
  meth:`<p>Janvier 2024, exercice 2, question 3 : inverser chaque nombre, et lever Inversion avec le nombre nul.</p>${ml(`exception Inversion of nombre

let rec inverse_nombre l = match l with
  | [] -> []
  | Ent 0 :: _ -> raise (Inversion (Ent 0))
  | Ent e :: r -> Rat (1, e) :: inverse_nombre r
  | Rat (0, d) :: _ -> raise (Inversion (Rat (0, d)))
  | Rat (n, d) :: r -> Rat (d, n) :: inverse_nombre r`)}
<ol><li>Les cas nuls d'abord, avant les cas généraux : ${k("Ent 0")} avant ${k("Ent e")}.</li>
<li>${k("inverse_nombre [Ent 2; Rat (1, 2); Rat (3, 4)]")} vaut ${k("[Rat (1, 2); Rat (2, 1); Rat (4, 3)]")}, l'exemple du sujet.</li>
<li>${k("inverse_nombre [Ent 1; Ent 0]")} lève ${k("Inversion (Ent 0)")} : pas de liste en résultat.</li></ol>`},
 {id:"trois",t:"« De trois façons » : List.hd et List.tl, puis le filtrage",pts:2,ou:"exercice 3 (2022), exercice 1 (juin 2022)",lect:2,exo:{g:"PF6",lv:0},
  ess:`<ul><li>Version 1, avec les accesseurs : ${k("if l = [] then … else … List.hd l … (List.tl l)")}.</li>
<li>Version 2, avec le filtrage : ${k("function | [] -> … | e :: tl -> …")}. C'est le même calcul : List.hd l devient e, List.tl l devient tl.</li>
<li>La fonction f est un argument comme les autres : on l'applique, ${k("f e")}, et on la repasse à l'appel récursif.</li></ul>`,
  piege:`Le cas de base d'un produit vaut 1, pas 0. Et sans le test ${k("l = []")}, ${k("List.hd []")} lève ${k('Failure "hd"')}.`,
  meth:`<p>Janvier 2022, exercice 3 : map_sum f [a1; …; an] = (f a1) + … + (f an).</p>${ml(`let rec map_sum f l =
  if l = [] then 0
  else f (List.hd l) + map_sum f (List.tl l)

let rec map_sum2 f = function
  | [] -> 0
  | e :: tl -> f e + map_sum2 f tl`)}
<ol><li>Le cas de base : la somme de rien vaut 0.</li>
<li>Le cas général : f appliquée au premier, plus la somme du reste, avec le même f.</li>
<li>${k("map_sum (fun x -> x * x) [1; 2; 3]")} = 1 + 4 + 9 = 14, avec les deux versions.</li></ol>`},
 {id:"signature",t:"La signature d'une fonction qui prend une fonction",pts:1,ou:"« Quelle est sa signature ? » (2022, juin 2022), le type de mem (2024)",lect:1.5,exo:{g:"PF1",lv:4},
  ess:`<ul><li>On lit le corps et on note ce que chaque opération impose : ${k("x + 1")} force un int, ${k("f e")} force f à être une fonction.</li>
<li>Ce qui n'est contraint par rien reste un type quelconque : ${k("'a")}, ${k("'b")}.</li>
<li>Les flèches suivent l'ordre des arguments, et le dernier type est le résultat. Une fonction passée en argument se met entre parenthèses.</li>
<li>${k("List.map f l")} applique f à chaque élément ; ${k("List.filter p l")} garde les éléments où p vaut true, donc p doit rendre un bool. Les deux prennent une liste en dernier argument.</li></ul>`,
  piege:`Les types ${k("('a -> int) -> 'a list -> int")} et ${k("'a -> int -> 'a list -> int")} ne veulent pas dire la même chose : sans les parenthèses, f ne serait plus un seul argument.`,
  meth:`<p>Juin 2022 : la signature de prodFonc, dont le cas général est ${k("f (List.hd l) * prodFonc f (List.tl l)")}.</p>
<ol><li>${k("*")} impose : ${k("f (List.hd l)")} est un int, et le résultat aussi.</li>
<li>Les éléments de l ne sont contraints par rien : l est une ${k("'a list")}, et f reçoit un 'a. Donc f : ${k("'a -> int")}.</li>
<li>Signature : ${k("('a -> int) -> 'a list -> int")}.</li></ol>`},
 {id:"fold",t:"List.fold_left et List.fold_right",pts:2.5,ou:"3e version de « trois façons » (2022, juin 2022), simplifie_nombre (2024)",lect:2,exo:{g:"PF6",lv:2},
  ess:`<ul><li>${k("List.fold_left f init [a1; …; an]")} = f (… (f (f init a1) a2) …) an. La fonction reçoit <b>l'accumulateur, puis l'élément</b> : ${k("fun acc e -> …")}.</li>
<li>${k("List.fold_right f [a1; …; an] init")} = f a1 (f a2 (… (f an init))). La fonction reçoit <b>l'élément, puis l'accumulateur</b> : ${k("fun e acc -> …")}, et la liste vient <b>avant</b> init.</li>
<li>init est le cas de base de la version récursive : 0 pour une somme, 1 pour un produit, ${k("[]")} pour une liste.</li></ul>`,
  piege:`L'ordre des arguments s'inverse entre les deux : c'est l'erreur la plus courante. Ces deux lignes méritent d'être sur ta feuille A4.`,
  meth:`${ml(`let map_sum3 f l = List.fold_left (fun acc e -> acc + f e) 0 l
let prodFonc3 f l = List.fold_right (fun e acc -> f e * acc) l 1`)}
<ol><li>${k("map_sum3 (fun x -> x * x) [1; 2; 3]")} : acc part de 0, puis 0 + 1 = 1, 1 + 4 = 5, 5 + 9 = 14.</li>
<li>${k("prodFonc3 (fun x -> x + 1) [1; 2; 3]")} = f 1 * (f 2 * (f 3 * 1)) = 2 × 3 × 4 = 24.</li>
<li>Pour garder ou enlever des éléments (simplifie_nombre en 2024) : ${k("fun e acc -> if … then acc else e :: acc")}, avec ${k("[]")} pour init.</li></ol>`},
 {id:"deux-args",t:"Une fonction récursive sur une liste, comme au CC",pts:1,ou:"my_get (2022), union et inter (2024)",lect:1.5,exo:{g:"PF8",lv:3},
  ess:`<ul><li>On filtre la liste : ${k("match li with | [] -> … | x :: r -> …")}. S'il y a un autre argument, il suit, et on le repasse à l'appel récursif.</li>
<li>Souvent les deux diminuent ensemble : on avance dans la liste et le rang baisse de 1.</li>
<li>Deux cas de base possibles : la liste est vide, ou l'autre argument est arrivé à 0.</li>
<li>Pour comparer deux éléments voisins (une liste triée), le motif ${k("x :: y :: r")} nomme les deux premiers.</li></ul>`,
  piege:`N'oublie pas l'autre argument à l'appel récursif : ${k("my_get r (i - 1)")}, pas ${k("my_get r")}.`,
  meth:`<p>Janvier 2022, exercice 2, question 4 : le caractère d'indice i, sinon Invalid_argument.</p>${ml(`let rec my_get s i = match s with
  | Empty -> invalid_arg "my_get"
  | Cons (c, r) -> if i = 0 then c else my_get r (i - 1)`)}
<ol><li>${k("my_get (Cons ('L', Cons ('1', Empty))) 1")} : i n'est pas 0, on passe à ${k("Cons ('1', Empty)")} avec i = 0, donc ${k("'1'")}.</li>
<li>Avec i = 2, on arrive à ${k("Empty")} : l'exception ${k('Invalid_argument "my_get"')}, comme le veut le sujet.</li></ol>`},
 {id:"terminal",t:"La récursivité terminale, avec un accumulateur",pts:0.5,ou:"au programme (TD), jamais une question à part",lect:1.5,exo:{g:"PF6",lv:1},
  ess:`<ul><li>Une fonction est <b>terminale</b> quand l'appel récursif est la toute dernière opération : rien n'est calculé après lui.</li>
<li>On ajoute un accumulateur acc, qui porte le résultat partiel : ${k("let rec aux acc l = match l with | [] -> acc | x :: r -> aux (acc + x) r in aux 0 li")}.</li>
<li>Le cas de base renvoie acc, et acc part du cas de base de la version récursive.</li></ul>`,
  piege:`La version ${k("x + somme r")} n'est pas terminale : le + se fait après l'appel. Et un accumulateur de liste est à l'envers : on finit par ${k("List.rev acc")}.`,
  meth:`${ml(`let rec factI n a =
  if n = 0 then a
  else factI (n - 1) (n * a)`)}
<ol><li>${k("factI 4 1")} : (4, 1), puis (3, 4), (2, 12), (1, 24), (0, 24).</li>
<li>n vaut 0 : on renvoie a = 24 = 4!. Rien n'attend après les appels.</li></ol>`}],
 blanc:[
  {t:"Un test sans récursivité",ou:"exercice 1, question 1",pts:2,g:"PF8",lv:0},
  {t:"Une fonction récursive sur un entier",ou:"exercice 1",pts:3.5,g:"PF8",lv:1},
  {t:"Rattraper une exception",ou:"exercice 1",pts:1.5,g:"PF7",lv:1},
  {t:"Écrire une valeur du type somme",ou:"exercice 2",pts:2,g:"PF5",lv:0},
  {t:"Une branche de match",ou:"exercice 2",pts:2.5,g:"PF3",lv:2},
  {t:"Un cas oublié dans un match",ou:"exercice 2",pts:2.5,g:"PF4",lv:2},
  {t:"Le cas général, avec l'appel récursif",ou:"exercice 3, question 1",pts:2,g:"PF3",lv:1},
  {t:"La signature d'une fonction",ou:"exercice 3, question 1",pts:1.5,g:"PF1",lv:3},
  {t:"La fonction donnée à l'itérateur",ou:"exercice 3, question 3",pts:2.5,g:"PF3",lv:3}]
}};
window.EXPRESS.pf.ct.notions.forEach(n=>{n.piege="<p>"+n.piege+"</p>";});
})();
