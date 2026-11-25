/* Programmation fonctionnelle (HAI102I, OCaml) : contrôle écrit du vendredi 13 novembre */
(function(){
window.SUBJ=window.SUBJ||{};
const M=s=>W.code(s,"ml"),hl=s=>`<span class="hl">${s}</span>`,esc=W.esc;
const concepts=[];const add=(ch,o)=>{o.ch=ch;concepts.push(o);};

/* expressions du TD (exercices 1, 3, 22, 36) et du partiel 2021 */
const DRILL=[
 {e:"(3 * (7 - 5))",t:"int",v:"6"},{e:"7.1 +. 2.2",t:"float",v:"9.3"},{e:"7.2 / 2",t:"erreur",why:"/ est la division entière : il faut deux int. Pour des réels, /. avec 2."},
 {e:"7. /. 2.",t:"float",v:"3.5"},{e:"7 / 2",t:"int",v:"3",why:"7 et 2 sont des int, donc / est la division entière : elle ne garde que la partie entière. 7 ÷ 2 = 3,5, donc 7 / 2 vaut 3, de type int. Pour garder la virgule, il faut des float : 7. /. 2. vaut 3.5."},{e:"3 * 4.",t:"erreur",why:"* veut deux int ; 4. est un float."},
 {e:"7. mod 2.",t:"erreur",why:"mod n'existe que pour les int."},{e:"7 mod 2",t:"int",v:"1"},{e:"int_of_float(10.0 /. 2.5)",t:"int",v:"4"},
 {e:"int_of_float(10.0) / int_of_float(2.5)",t:"int",v:"5",why:"10 / 2 = 5 : int_of_float(2.5) tronque à 2."},
 {e:"not (true) && not (false)",t:"bool",v:"false",why:"not s'applique d'abord : false && true."},{e:"(12.0 +. 30. = 42.) && (3 + 4 = 4 + 4)",t:"bool",v:"false"},
 {e:"\"bon\" ^ \"jour\"",t:"string",v:"\"bonjour\""},{e:"not(\"true\")",t:"erreur",why:"not veut un bool, pas une string."},{e:"true = \"true\"",t:"erreur",why:"= compare deux valeurs du même type."},
 {e:"if 1 < 2 then 3+1 else 5/2",t:"int",v:"4"},{e:"if 1 < 3/2 then (if 2 < 3/2 then 1 else 2) else 3",t:"int",v:"3",why:"3/2 = 1, et 1 < 1 est faux."},
 {e:"if 3/2 < 2 then 4.1",t:"erreur",why:"Un if sans else doit être de type unit."},{e:"if 3/2 < 2 then 4 < 5 else 4 + 5",t:"erreur",why:"Les deux branches doivent avoir le même type (bool et int ici)."},
 {e:"let a = 2 and b = 5 in a + 2*b",t:"int",v:"12"},{e:"let a = 1 and b = 1 and c = 2 in a = b = c",t:"erreur",why:"a = b = c se lit (a = b) = c, soit true = 2."},
 {e:"List.hd [4; 2] + 1",t:"int",v:"5"},{e:"(8/3) :: (8 mod 3) :: []",t:"int list",v:"[2; 2]"},{e:"List.hd([\"un\"; \"deux\"]) < \"trois\"",t:"bool",v:"false",why:"Ordre alphabétique : \"un\" vient après \"trois\" (u > t)."},
 {e:"7 :: List.tl [2; 3; 2; 4]",t:"int list",v:"[7; 3; 2; 4]"},{e:"List.hd [\"liste\"; \"entiers\"] :: [\"chaines\"]",t:"string list",v:"[\"liste\"; \"chaines\"]"},
 {e:"3 :: [[1; 2]; [3; 1; 0]]",t:"erreur",why:"La liste contient des int list : on ne peut pas y ajouter l'int 3. [3] :: … marcherait."}];
const CHOICES=["int","float","bool","string","int list","string list","erreur"];

function matchLab(host){
  const cases=[["1","n = 1",n=>n===1,n=>1],["i when i < 0","n < 0",n=>n<0,n=>0],["i when i mod 2 = 0","n pair",n=>n%2===0,n=>Math.trunc(n/2)],["i when i mod 2 = 1","n impair",n=>n%2===1,n=>n+1],["3","n = 3",n=>n===3,n=>0],["_","sinon",n=>true,n=>2]];
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><label>n = <input type="number" value="3" data-n style="width:5em"></label></div><div class="split"><div>${M(`match n with
| 1 -> 1
| i when i < 0 -> 0
| i when i mod 2 = 0 -> n / 2
| i when i mod 2 = 1 -> i + 1
| 3 -> 0
| _ -> 2`)}</div><div class="mcases"></div></div><div class="w-note"></div></div>`;
  const q=s=>host.querySelector(s);
  function draw(){const n=Math.round(+q("[data-n]").value)||0;let hit=-1;cases.forEach((c,i)=>{if(hit<0&&c[2](n))hit=i;});
    q(".mcases").innerHTML=cases.map((c,i)=>`<div class="mc${i===hit?" on":i<hit?" no":""}"><code>| ${esc(c[0])}</code> <span class="muted">${i<hit?"ne correspond pas":i===hit?"premier cas qui correspond":"jamais essayé"}</span></div>`).join("");
    q(".w-note").innerHTML=`<div class="verdict ok">match ${n} vaut <b>${cases[hit][3](n)}</b>. Les cas sont essayés de haut en bas : on prend le premier qui correspond.${n===3?" Le cas « 3 » n'est jamais atteint : « i when i mod 2 = 1 » passe avant.":""}</div>`;}
  host.addEventListener("input",draw);draw();
}

/* ---------- chapitre 1 : expressions et types ---------- */
add(1,{id:"pf-types",type:"def",ref:"Cours, TD ex. 1",t:"Types de base et opérateurs",short:"Types et opérateurs",cc:"3 pts au partiel 2021",
 plain:`En OCaml, ${hl("chaque expression a un type")}, et les opérateurs ne mélangent pas les types : les entiers (int) utilisent + - * / mod, les réels (float) utilisent +. -. *. /. avec un point. Entraîne-toi ci-dessous : choisis le type, puis lis la valeur.`,
 fig:()=>h=>W.drill(h,DRILL,CHOICES),
 figBase:()=>h=>W.drill(h,DRILL.filter(d=>!/^(if|let)\b|List\.|::/.test(d.e)),["int","float","bool","string","erreur"]),
 figListes:()=>h=>W.drill(h,DRILL.filter(d=>/List\.|::/.test(d.e)),["int","bool","int list","string list","erreur"]),
 formal:`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Type</th><th>Valeurs</th><th>Opérations</th></tr></thead><tbody>
 <tr><td>int</td><td>3, -7, 0</td><td>+ - * / (division entière) mod</td></tr>
 <tr><td>float</td><td>3.0, 3., 2.5</td><td>+. -. *. /. sqrt</td></tr>
 <tr><td>bool</td><td>true, false</td><td>&& || not</td></tr>
 <tr><td>string</td><td>"bonjour"</td><td>^ (concaténation)</td></tr>
 <tr><td>comparaisons</td><td>= <> < > <= >=</td><td>entre deux valeurs du même type, résultat bool</td></tr></tbody></table></div><p>Conversions : float_of_int, int_of_float (tronque).</p>`,
 use:`<p>Partiel 2021, question 1 (3 points) : « indiquez les types et valeurs des expressions ». Lis chaque opérateur : il impose le type de ses deux côtés.</p>`,
 trap:`7.2 / 2 et 3 * 4. sont des erreurs de type. Et 7 / 2 vaut 3, pas 3.5.`,
 q:"Quel est le type et la valeur de (8/3) :: (8 mod 3) :: [] ? (partiel 2021)",a:"int list, et la valeur est [2; 2].",rel:["pf-if","pf-erreurs"]});

add(1,{id:"pf-if",type:"def",ref:"Cours, TD ex. 1 et 5",t:"if … then … else : une expression",short:"if then else",
 plain:`En OCaml, ${hl("if then else est une expression")} : elle a une valeur et un type. Les deux branches doivent donc avoir ${hl("le même type")}, et la condition doit être un bool.`,
 fig:()=>h=>W.drill(h,DRILL.filter(d=>/^if/.test(d.e)),CHOICES),
 formal:`${M(`if condition then expression1 else expression2
(* condition : bool ; expression1 et expression2 : même type *)`)}<p>Le type de l'expression est celui des branches. Sans else, la branche then doit être de type unit.</p>`,
 use:`<p>Pour trouver un type (TD ex. 5) : « if x then y else 3 » impose x : bool et y : int.</p>`,
 trap:`« if 3/2 < 2 then 4 < 5 else 4 + 5 » est une erreur : bool d'un côté, int de l'autre.`,
 q:"Quel est le type de l'expression if x then y else 3 ? Quels types doivent avoir x et y ?",a:"int. Les deux branches ont le même type, donc y est un int comme 3. La condition x est un bool.",rel:["pf-types","pf-let"]});

add(1,{id:"pf-let",type:"def",ref:"Cours, TD ex. 3",t:"let … in et let … and",
 plain:`${hl("let x = e1 in e2")} donne un nom local à e1, utilisable seulement dans e2. Avec ${hl("and")}, les définitions sont faites en même temps : l'une ne peut pas utiliser l'autre.`,
 fig:()=>h=>W.drill(h,DRILL.filter(d=>/^let/.test(d.e)).concat([{e:"let x = 5 in x * x",t:"int",v:"25"},{e:"let a = 2 and b = true in b && (a > 0)",t:"bool",v:"true"},{e:"let a = 3 and b = 5 in (a < b) && ((a > b) / 2)",t:"erreur",why:"(a > b) est un bool : on ne peut pas le diviser."}]),CHOICES),
 figIfLet:()=>h=>W.drill(h,DRILL.filter(d=>/^(if|let)\b/.test(d.e)).concat([{e:"let x = 5 in x * x",t:"int",v:"25"},{e:"let a = 2 and b = true in b && (a > 0)",t:"bool",v:"true"},{e:"let a = 5 and b = a + 1 in a + 2 * b",t:"erreur",why:"Avec and, b ne voit pas le a défini en même temps."},{e:"let a = 3 and b = 5 in (a < b) && ((a > b) / 2)",t:"erreur",why:"(a > b) est un bool : on ne peut pas le diviser."}]),["int","float","bool","erreur"]),
 formal:`${M(`let x = 5 in x * x                 (* 25 *)
let a = 2 and b = 5 in a + 2 * b   (* 12 *)
let a = 5 and b = a + 1 in …       (* erreur : a n'existe pas encore pour b *)
let a = 5 in let b = a + 1 in …    (* là, ça marche *)`)}`,
 use:`<p>Utile pour éviter de recalculer : « let m = maxListe (List.tl li) in if List.hd li > m then List.hd li else m ».</p>`,
 trap:`Dans « let a = 5 and b = a + 1 », le a de b n'est pas celui défini juste avant : erreur (ou l'ancien a s'il en existait un).`,
 q:"Que vaut let a = 5 and b = a + 1 in a + 2*b (sans a défini avant) ?",a:"Une erreur : dans un let … and, b ne voit pas le a défini en même temps.",rel:["pf-if"]});

/* ---------- chapitre 2 : fonctions ---------- */
add(2,{id:"pf-fonctions",type:"def",ref:"Cours, TD ex. 6, 7, 20",t:"Définir une fonction : n-uplet ou forme curryfiée",short:"Définir une fonction",
 plain:`Deux façons d'écrire une fonction à deux paramètres : avec ${hl("un couple")}, function (x, y) -> …, de type int * int -> int ; ou ${hl("curryfiée")}, fun x y -> …, de type int -> int -> int. La forme curryfiée est demandée à l'examen dès qu'il y a plusieurs arguments.`,
 fig:()=>h=>{h.innerHTML=`<div class="split"><div><p><b>Avec un couple</b></p>${M(`let g = function (x, y) -> x < y *. y
(* g : float * float -> bool *)
g (3.2, 4.4)`)}</div><div><p><b>Curryfiée</b></p>${M(`let gg = fun x y -> x < y *. y
(* gg : float -> float -> bool *)
gg 3.2 4.4
gg 3.2          (* float -> bool *)`)}</div></div>`;},
 formal:`<ul><li><code>let f = function x -> 2 * x + 1</code> ou <code>let f x = 2 * x + 1</code> : int -> int.</li><li>Couple : <code>function (x, y) -> …</code>, type <code>t1 * t2 -> t</code>, appel <code>f (a, b)</code>.</li><li>Curryfiée : <code>fun x y -> …</code> ou <code>let f x y = …</code>, type <code>t1 -> t2 -> t</code>, appel <code>f a b</code>.</li><li>Application partielle : <code>gg 3.2</code> est une fonction float -> bool.</li></ul>`,
 use:`<p>Le partiel 2021 demande de donner la signature de chaque fonction écrite. L'examen 2024 : « dès qu'une fonction prendra plusieurs arguments, vous écrirez la fonction sous sa forme curryfiée ».</p>`,
 trap:`f (a, b) appelle une fonction à un couple ; f a b une fonction curryfiée. Mélanger les deux est une erreur de type.`,
 q:"Quelle est la signature de let f = function (x, y) -> if y then x + 1 else 2 * x ?",a:"int * bool -> int (partiel 2021 et TD ex. 7).",rel:["pf-signature"]});

add(2,{id:"pf-signature",type:"meth",ref:"Partiel 2021, Q1.2",t:"Trouver la signature d'une fonction",short:"Trouver une signature",cc:"Tombé en 2021",
 plain:`On lit le corps de la fonction et on note ce que ${hl("chaque opérateur impose")} : x + 1 force x : int ; if y force y : bool ; List.hd y force y : liste. Ce qui n'est contraint par rien devient 'a (n'importe quel type).`,
 fig:()=>h=>{h.innerHTML=`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Fonction</th><th>Raisonnement</th><th>Signature</th></tr></thead><tbody>
 <tr><td><code>function (x, y) -> if y then x+1 else 2*x</code></td><td>if y → y : bool ; x+1 → x : int ; résultat int</td><td><code>int * bool -> int</code></td></tr>
 <tr><td><code>function (x, y) -> x + 2 * List.hd(y)</code></td><td>List.hd y est un int → y : int list</td><td><code>int * int list -> int</code></td></tr>
 <tr><td><code>fun x li -> x + List.hd li</code></td><td>x + … → x : int et List.hd li : int, donc li : int list ; curryfiée</td><td><code>int -> int list -> int</code></td></tr>
 <tr><td><code>function (x, y) -> if x > y then x > y else y > 2*x</code></td><td>2*x → x : int ; x > y → y : int ; résultat bool</td><td><code>int * int -> bool</code></td></tr></tbody></table></div>`;},
 formal:`<p>Signature = types des paramètres → type du résultat. Couple : <code>t1 * t2 -> t</code>. Curryfiée : <code>t1 -> t2 -> t</code>. Liste : <code>t list</code>.</p><p>Dans le cours, la signature s'écrit directement dans la définition : c'est la meilleure façon de ne pas l'oublier sur ta copie.</p>${M(`let rec longueur : int list -> int = function
  li -> if li = [] then 0 else 1 + longueur (List.tl li)

let rec prodDiv : int -> int -> int = fun n i -> ...`)}`,
 use:`<p>Dans chaque question du partiel 2021 (2 à 6), il fallait donner la signature de la fonction écrite : c'est une partie des points à chaque fois.</p>`,
 trap:`Une flèche par paramètre en forme curryfiée (int -> int -> int), une étoile entre les paramètres d'un couple (int * int -> int). Ne mélange pas les deux.`,
 q:"Signature de let h = function (x, y) -> x + 2 * List.hd(y) ?",a:"int * int list -> int : List.hd y est ajouté à un int, donc y est une int list.",rel:["pf-fonctions","pf-listes-rec"]});

/* ---------- chapitre 3 : récursivité ---------- */
add(3,{id:"pf-rec",type:"def",ref:"Cours, TD ex. 12 à 17",t:"Fonctions récursives : let rec",short:"Récursivité (let rec)",
 plain:`Une fonction récursive s'écrit avec ${hl("let rec")}. On écrit d'abord la récurrence sur papier : ${hl("cas de base")} (souvent n = 0) et ${hl("équation de récurrence")} (f(n) en fonction de f(n − 1)), puis on traduit. Déroule le calcul ci-dessous.`,
 fig:()=>h=>W.rewrite(h,{params:[{k:"n",label:"som",min:0,max:8,val:4}],gen:p=>{const n=p.n,L=[`som ${n}`];let acc=[];for(let k=n;k>0;k--){acc.push(k);L.push(acc.join(" + (")+" + som "+(k-1)+")".repeat(acc.length-1));}if(n>0){L.push(acc.join(" + (")+" + 0"+")".repeat(acc.length-1));}L.push(String(n*(n+1)/2));return L;}}),
 formal:`${M(`let rec som n = if n = 0 then 0 else n + som (n - 1)
(* som : int -> int *)

let rec f : int -> int = function       (* la forme du cours, signature comprise *)
  n -> if n = 0 then 5 else 2 * n + f (n - 1)       (* f n = n(n+1) + 5 *)

let rec carre n = if n = 0 then 0 else carre (n - 1) + n + n - 1
(* car (n-1)² = n² - 2n + 1 *)`)}`,
 use:`<p>Méthode des TD : « Cas de base quand n = 0, som(n) = … ; Récurrence quand n > 0, som(n) = … ». Écris ces deux lignes avant le code : c'est la moitié de la réponse.</p>`,
 trap:`Sans rec, la fonction ne peut pas s'appeler elle-même. Et écris f (n - 1) avec parenthèses : f n - 1 se lit (f n) - 1, qui boucle à l'infini.`,
 q:"Écris une fonction récursive som : int -> int qui calcule 0 + 1 + … + n.",a:"let rec som n = if n = 0 then 0 else n + som (n - 1)",rel:["pf-rec-ex","pf-erreurs"]});

add(3,{id:"pf-rec-ex",type:"meth",ref:"Partiel 2021 Q3-Q4, TD ex. 18, 21",t:"Récursivité sur les chiffres et les diviseurs",short:"Chiffres et diviseurs",cc:"7 pts au partiel 2021",
 plain:`Deux schémas reviennent : parcourir ${hl("les chiffres")} d'un entier (n mod 10 est le dernier chiffre, n / 10 enlève le dernier chiffre), et parcourir ${hl("les candidats diviseurs")} i de i jusqu'à 1 avec un paramètre en plus.`,
 fig:()=>h=>W.rewrite(h,{params:[{k:"i",label:"prodDiv 45",min:1,max:9,val:7}],gen:p=>{const n=45;const L=[`prodDiv 45 ${p.i}`];let i=p.i,pre=[];while(i>0){const d=45%i===0;pre.push(d?`${i} * `:"");L.push(pre.join("")+`prodDiv 45 ${i-1}`+(d?"":`   (${i} ne divise pas 45)`));i--;}L.push(pre.join("")+"1");let r=1;for(let k=1;k<=p.i;k++)if(45%k===0)r*=k;L.push(String(r));return L;}}),
 formal:`${M(`(* Partiel 2021, Q3 *)
let rec queDesUn n =
  if n < 10 then n = 1
  else (n mod 10 = 1) && queDesUn (n / 10)
(* queDesUn : int -> bool *)

(* Partiel 2021, Q4 : produit des diviseurs de n inférieurs ou égaux à i *)
let rec prodDiv n i =
  if i = 0 then 1
  else if n mod i = 0 then i * prodDiv n (i - 1)
  else prodDiv n (i - 1)
(* prodDiv : int -> int -> int *)

(* TD ex. 21 *)
let rec nbDiv n i = if i = 0 then 0
  else (if n mod i = 0 then 1 else 0) + nbDiv n (i - 1)
let estPremier n = nbDiv n n = 2`)}`,
 use:`<p>Partiel 2021 : queDesUn (3 points) et prodDiv (4 points). Le paramètre i descend jusqu'à 0 (cas de base) ; à chaque étape on teste si i divise n.</p>`,
 trap:`Pour un produit, le cas de base vaut 1 (pas 0). Pour un compte ou une somme, il vaut 0.`,
 q:"prodDiv n k est le produit des diviseurs de n qui sont inférieurs ou égaux à k (question du partiel 2021). Que vaut prodDiv 12 5 ?",a:"24 : les diviseurs de 12 inférieurs ou égaux à 5 sont 1, 2, 3, 4, et 1 × 2 × 3 × 4 = 24.",rel:["pf-rec"]});

/* ---------- chapitre 4 : listes (TD ex. 22 à 31), écrites comme dans le cours : if li = [] … List.hd … List.tl ---------- */
add(4,{id:"pf-listes",type:"def",ref:"Cours p. 50-52, TD ex. 22 et 23",t:"Les listes : [], ::, List.hd, List.tl",short:"Les listes",
 plain:`Une liste OCaml s'écrit ${hl("[2; 3; 2; 4]")} avec des points-virgules. Tous ses éléments ont le même type. ${hl("x :: li")} ajoute x devant, ${hl("List.hd li")} donne le premier élément (la tête), ${hl("List.tl li")} la liste sans le premier (la queue). Essaie les trois opérations.`,
 fig:()=>h=>W.listlab(h,{ml:true,start:[2,3,2,4]}),
 formal:`<ul><li>[] : liste vide. [2; 3] : int list. ["un"; "deux"] : string list.</li><li><code>x :: li</code> : ajout en tête (x du même type que les éléments).</li><li><code>List.hd li</code> : premier élément ; <code>List.tl li</code> : la liste sans le premier. Sur [] : erreur à l'exécution (exception).</li><li><code>List.tl [7] = []</code> vaut true : c'est le test « la liste n'a qu'un élément ».</li></ul>${M(`(* exemples du cours *)
let deuxieme : int list -> int = function
  li -> List.hd (List.tl li)
let oterDeuxieme : int list -> int list = function
  li -> List.hd li :: List.tl (List.tl li)

(* TD ex. 23 : inverser les deux premiers éléments *)
let inverserElem : int list -> int list = function
  li -> List.hd (List.tl li) :: List.hd li :: List.tl (List.tl li)
(* inverserElem [1; 2; 3] = [2; 1; 3] *)`)}`,
 use:`<p>TD ex. 22 et partiel Q1 : évaluer des expressions avec List.hd, List.tl et ::. Écris les étapes intermédiaires : List.tl (List.tl [2; 3; 2; 4]) = List.tl [3; 2; 4] = [2; 4].</p>`,
 trap:`[2, 3] (avec une virgule) n'est pas [2; 3] : c'est une liste à un seul élément, le couple (2, 3). Et 8 :: 3 est une erreur : à droite de ::, il faut une liste (8 :: [3]).`,
 q:"Que vaut List.hd (List.tl (List.tl [2; 3; 2; 4])) ?",a:"2 : List.tl deux fois donne [2; 4], dont la tête est 2.",rel:["pf-listes-rec","p/recettes"]});

const RW={
 som:{lab:"somElem [6; 9; 5]",L:["somElem [6; 9; 5]",["6 + somElem [9; 5]","la liste n'est pas vide : tête + appel sur la queue"],"6 + (9 + somElem [5])","6 + (9 + (5 + somElem []))",["6 + (9 + (5 + 0))","cas de base : somElem [] = 0"],"20"]},
 lon:{lab:"longueur [4; 3; 8]",L:["longueur [4; 3; 8]","1 + longueur [3; 8]","1 + (1 + longueur [8])","1 + (1 + (1 + longueur []))",["1 + (1 + (1 + 0))","cas de base"],"3"]},
 aj1:{lab:"ajout1 [3; 1; 8]",L:["ajout1 [3; 1; 8]",["(3 + 1) :: ajout1 [1; 8]","on construit la liste avec ::"],"4 :: (2 :: ajout1 [8])","4 :: (2 :: (9 :: ajout1 []))",["4 :: (2 :: (9 :: []))","cas de base : la liste vide"],"[4; 2; 9]"]},
 pref:{lab:"prefLong [3; 2; 4] 2",L:["prefLong [3; 2; 4] 2","3 :: prefLong [2; 4] 1","3 :: (2 :: prefLong [4] 0)",["3 :: (2 :: [])","n = 0 : cas de base"],"[3; 2]"]}};
add(4,{id:"pf-listes-rec",type:"meth",ref:"Cours p. 53-57, partiel 2021 Q5-Q6",t:"Le schéma récursif sur les listes",short:"Le schéma récursif",cc:"7 pts au partiel 2021",
 plain:`Toutes les fonctions sur les listes suivent le même schéma : ${hl("si li = [], la valeur de base")} ; ${hl("sinon, on combine List.hd li avec l'appel sur List.tl li")}. La liste raccourcit à chaque appel, donc on finit toujours par arriver à []. Choisis un exemple et déroule-le.`,
 fig:()=>h=>{h.innerHTML=`<div class="w-ctrl"><select data-r>${Object.entries(RW).map(([k,v])=>`<option value="${k}">${v.lab}</option>`).join("")}</select></div><div class="rwh"></div>`;const go=()=>W.rewrite(h.querySelector(".rwh"),{gen:()=>RW[h.querySelector("[data-r]").value].L});h.addEventListener("change",e=>{if(e.target.matches("[data-r]"))go();});go();},
 formal:`${M(`(* le schéma du cours *)
let rec g : int list -> ... = function
  li -> if li = [] then (valeur pour la liste vide)
        else ... List.hd li ... g (List.tl li) ...

let rec longueur : int list -> int = function
  li -> if li = [] then 0
        else 1 + longueur (List.tl li)

let rec somElem : int list -> int = function       (* partiel 2021, Q5 *)
  li -> if li = [] then 0
        else List.hd li + somElem (List.tl li)

let rec ajout1 : int list -> int list = function
  li -> if li = [] then []
        else (List.hd li + 1) :: ajout1 (List.tl li)

let rec prefLong : int list -> int -> int list = fun li n ->   (* partiel 2021, Q6 *)
  if li = [] || n = 0 then []
  else List.hd li :: prefLong (List.tl li) (n - 1)`)}`,
 gloss:["li = [] : le test « la liste est vide »","List.hd li : la tête","List.tl li : la queue","g (List.tl li) : l'appel récursif, toujours entre parenthèses"],
 use:`<p>Au partiel 2021, somElem valait 3 points et prefLong 4. Écris la signature en premier (let rec f : int list -> int = …), puis le cas de base, puis le cas général. Vérifie sur l'exemple de l'énoncé en déroulant comme ci-dessus.</p>`,
 trap:`somElem List.tl li est faux : OCaml lit (somElem List.tl) li. Écris somElem (List.tl li). Et n'appelle jamais List.hd sur une liste qui peut être vide : le test li = [] passe avant.`,
 q:"Écris une fonction récursive somElem : int list -> int qui calcule la somme des éléments d'une liste, avec List.hd et List.tl (sans match).",a:"let rec somElem : int list -> int = function li -> if li = [] then 0 else List.hd li + somElem (List.tl li)",rel:["pf-listes-construire","pf-listes-tests","p/recettes"]});

const RW2={
 lip:{lab:"liPairs [5; 8; 1; 2]",L:["liPairs [5; 8; 1; 2]",["liPairs [8; 1; 2]","5 est impair : on ne le garde pas"],["8 :: liPairs [1; 2]","8 est pair : on le garde devant"],["8 :: liPairs [2]","1 est impair"],"8 :: (2 :: liPairs [])",["8 :: (2 :: [])","cas de base"],"[8; 2]"]},
 otp:{lab:"oterPairs [5; 8; 1; 2]",L:["oterPairs [5; 8; 1; 2]",["5 :: oterPairs [8; 1; 2]","5 impair : on le garde"],["5 :: oterPairs [1; 2]","8 pair : on l'enlève"],"5 :: (1 :: oterPairs [2])",["5 :: (1 :: oterPairs [])","2 pair : on l'enlève"],"5 :: (1 :: [])","[5; 1]"]},
 lent:{lab:"listeEntiers 3",L:["listeEntiers 3","3 :: listeEntiers 2","3 :: (2 :: listeEntiers 1)","3 :: (2 :: (1 :: listeEntiers 0))",["3 :: (2 :: (1 :: [0]))","cas de base : listeEntiers 0 = [0]"],"[3; 2; 1; 0]"]},
 ldiv:{lab:"liDivInf 20 4",L:["liDivInf 20 4",["4 :: liDivInf 20 3","4 divise 20"],["4 :: liDivInf 20 2","3 ne divise pas 20"],"4 :: (2 :: liDivInf 20 1)","4 :: (2 :: (1 :: liDivInf 20 0))",["4 :: (2 :: (1 :: []))","i = 0 : cas de base"],"[4; 2; 1]"]},
 ajf:{lab:"ajouFin 4 [5; 4; 2]",L:["ajouFin 4 [5; 4; 2]","5 :: ajouFin 4 [4; 2]","5 :: (4 :: ajouFin 4 [2])","5 :: (4 :: (2 :: ajouFin 4 []))",["5 :: (4 :: (2 :: [4]))","cas de base : ajouFin x [] = [x]"],"[5; 4; 2; 4]"]},
 inv:{lab:"inverseLi [1; 4; 2]",L:["inverseLi [1; 4; 2]","ajouFin 1 (inverseLi [4; 2])","ajouFin 1 (ajouFin 4 (inverseLi [2]))","ajouFin 1 (ajouFin 4 (ajouFin 2 (inverseLi [])))",["ajouFin 1 (ajouFin 4 (ajouFin 2 []))","cas de base"],"ajouFin 1 (ajouFin 4 [2])","ajouFin 1 [2; 4]","[2; 4; 1]"]}};
add(4,{id:"pf-listes-construire",type:"code",ref:"TD ex. 24, 27, 28, 29, 30",t:"Fabriquer une liste : garder, enlever, ajouter",short:"Fabriquer une liste",
 plain:`Quand le résultat est une liste, le cas de base renvoie ${hl("[]")} (ou une petite liste), et le cas général ${hl("garde l'élément avec ::")} ou ${hl("le saute")} en rappelant simplement la fonction. Déroule un exemple : regarde quand un élément passe devant avec ::.`,
 fig:()=>h=>{h.innerHTML=`<div class="w-ctrl"><select data-r>${Object.entries(RW2).map(([k,v])=>`<option value="${k}">${v.lab}</option>`).join("")}</select></div><div class="rwh"></div>`;const go=()=>W.rewrite(h.querySelector(".rwh"),{gen:()=>RW2[h.querySelector("[data-r]").value].L});h.addEventListener("change",e=>{if(e.target.matches("[data-r]"))go();});go();},
 formal:`${M(`(* TD ex. 24 : listeEntiers 3 = [3; 2; 1; 0] *)
let rec listeEntiers : int -> int list = function
  n -> if n = 0 then [0]
       else n :: listeEntiers (n - 1)

(* TD ex. 27 : garder ou enlever les nombres pairs *)
let rec liPairs : int list -> int list = function
  li -> if li = [] then []
        else if List.hd li mod 2 = 0 then List.hd li :: liPairs (List.tl li)
        else liPairs (List.tl li)

let rec oterPairs : int list -> int list = function
  li -> if li = [] then []
        else if List.hd li mod 2 = 0 then oterPairs (List.tl li)
        else List.hd li :: oterPairs (List.tl li)

(* TD ex. 28 : diviseurs de n inférieurs ou égaux à i *)
let rec liDivInf : int -> int -> int list = fun n i ->
  if i = 0 then []
  else if n mod i = 0 then i :: liDivInf n (i - 1)
  else liDivInf n (i - 1)
let liDiv : int -> int list = function n -> liDivInf n n

(* TD ex. 29 et 30 *)
let rec ajouFin : int -> int list -> int list = fun x li ->
  if li = [] then [x]
  else List.hd li :: ajouFin x (List.tl li)

let rec inverseLi : int list -> int list = function
  li -> if li = [] then []
        else ajouFin (List.hd li) (inverseLi (List.tl li))`)}`,
 use:`<p>Garder : <code>x :: f (reste)</code>. Enlever : <code>f (reste)</code>. Ajouter à la fin : passe par ajouFin, car :: ajoute seulement devant. liDivInf a la même forme que prodDiv du partiel 2021, mais construit une liste au lieu d'un produit.</p>`,
 trap:`Ne confonds pas x :: li (un élément devant une liste) et li @ [x] (deux listes collées). Et le cas de base d'une liste résultat est [], pas 0.`,
 q:"Écris une fonction récursive liPairs : int list -> int list qui renvoie la liste des éléments pairs, dans le même ordre, avec List.hd, List.tl et :: .",a:"let rec liPairs : int list -> int list = function li -> if li = [] then [] else if List.hd li mod 2 = 0 then List.hd li :: liPairs (List.tl li) else liPairs (List.tl li)",rel:["pf-listes-rec","pf-listes-tests"]});

const RW3={
 tp:{lab:"tousPairs [2; 5; 2]",L:["tousPairs [2; 5; 2]","2 mod 2 = 0 && tousPairs [5; 2]",["true && tousPairs [5; 2]","&& : il faut aussi que la suite soit vraie"],"5 mod 2 = 0 && tousPairs [2]",["false && …","&& s'arrête dès qu'un côté est faux"],"false"]},
 ep:{lab:"exiPairs [3; 2; 5]",L:["exiPairs [3; 2; 5]","3 mod 2 = 0 || exiPairs [2; 5]",["false || exiPairs [2; 5]","|| : on regarde la suite"],"2 mod 2 = 0 || exiPairs [5]",["true || …","|| s'arrête dès qu'un côté est vrai"],"true"]},
 mx:{lab:"maxListe [3; 7; 2]",L:["maxListe [3; 7; 2]","max 3 (maxListe [7; 2])",["max 3 (max 7 (maxListe [2]))","List.tl [2] = [] : cas de base, la liste a un seul élément"],"max 3 (max 7 2)","max 3 7","7"]},
 der:{lab:"derListe [3; 5; 1]",L:["derListe [3; 5; 1]","derListe [5; 1]","derListe [1]",["1","List.tl [1] = [] : on renvoie la tête"]]},
 pre:{lab:"prefixe [3; 2] [3; 2; 4]",L:["prefixe [3; 2] [3; 2; 4]","3 = 3 && prefixe [2] [2; 4]","prefixe [2] [2; 4]","2 = 2 && prefixe [] [4]","prefixe [] [4]",["true","[] est préfixe de toute liste"]]}};
add(4,{id:"pf-listes-tests",type:"code",ref:"TD ex. 25, 26, 27, 31",t:"Tester une liste : tous, il existe, max, dernier",short:"Tester une liste",
 plain:`Pour un test, le résultat est un bool. ${hl("« Tous »")} : base true, et on combine avec &&. ${hl("« Il existe »")} : base false, et on combine avec ||. Pour une liste ${hl("non vide")} (max, dernier), le cas de base est la liste à un seul élément : ${hl("List.tl li = []")}.`,
 fig:()=>h=>{h.innerHTML=`<div class="w-ctrl"><select data-r>${Object.entries(RW3).map(([k,v])=>`<option value="${k}">${v.lab}</option>`).join("")}</select></div><div class="rwh"></div>`;const go=()=>W.rewrite(h.querySelector(".rwh"),{gen:()=>RW3[h.querySelector("[data-r]").value].L});h.addEventListener("change",e=>{if(e.target.matches("[data-r]"))go();});go();},
 formal:`${M(`(* TD ex. 27 *)
let rec tousPairs : int list -> bool = function
  li -> if li = [] then true
        else List.hd li mod 2 = 0 && tousPairs (List.tl li)

let rec exiPairs : int list -> bool = function
  li -> if li = [] then false
        else List.hd li mod 2 = 0 || exiPairs (List.tl li)

(* TD ex. 25 et 26 : listes non vides *)
let rec derListe : int list -> int = function
  li -> if List.tl li = [] then List.hd li
        else derListe (List.tl li)

let rec maxListe : int list -> int = function
  li -> if List.tl li = [] then List.hd li
        else max (List.hd li) (maxListe (List.tl li))

(* TD ex. 31 : deux listes *)
let rec prefixe : int list -> int list -> bool = fun l1 l2 ->
  if l1 = [] then true
  else if l2 = [] then false
  else List.hd l1 = List.hd l2 && prefixe (List.tl l1) (List.tl l2)

let rec suffixe : int list -> int list -> bool = fun l1 l2 ->
  l1 = l2 || (l2 <> [] && suffixe l1 (List.tl l2))

let rec facteur : int list -> int list -> bool = fun l1 l2 ->
  prefixe l1 l2 || (l2 <> [] && facteur l1 (List.tl l2))`)}`,
 use:`<p>« Tous » : tousPairs [] vaut true (aucun contre-exemple). « Il existe » : exiPairs [] vaut false. Pour l'exercice 31, réutilise prefixe : l1 est facteur de l2 s'il en est préfixe, ou facteur de la queue de l2.</p>`,
 trap:`maxListe et derListe n'ont pas de cas li = [] : la liste est supposée non vide. Si tu testes li = [] à la place de List.tl li = [], tu appelles List.hd sur la liste vide.`,
 q:"Une fonction récursive exiPairs teste si une liste contient au moins un élément pair. Que renvoie-t-elle pour la liste vide ? Comment combine-t-elle le test du premier élément avec l'appel récursif ?",a:"false pour la liste vide : elle ne contient aucun élément pair. Ensuite : List.hd li mod 2 = 0 || exiPairs (List.tl li).",rel:["pf-listes-rec","pf-listes-construire"]});

/* ---------- chapitre 5 : à relire avant le contrôle ---------- */
add(5,{id:"pf-erreurs",type:"meth",ref:"Synthèse",t:"Les erreurs classiques à éviter",short:"Erreurs classiques",
 plain:`La plupart des points perdus viennent de ${hl("quelques erreurs de type")} toujours les mêmes. Relis cette liste avant le contrôle : sur papier, personne ne te les signale.`,
 fig:()=>h=>{h.innerHTML=`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Faux</th><th>Juste</th><th>Pourquoi</th></tr></thead><tbody>${[["3.5 + 1","3.5 +. 1.","+ est pour les int, +. pour les float"],["7.2 / 2","7.2 /. 2.","pas de mélange int et float"],["let f n = … f (n-1)","let rec f n = …","sans rec, f ne se voit pas elle-même"],["f n - 1","f (n - 1)","l'application passe avant le -"],["somElem List.tl li","somElem (List.tl li)","sans parenthèses, List.tl devient un argument"],["[2, 3]","[2; 3]","la virgule fait un couple"],["x @ li","x :: li","@ colle deux listes, :: ajoute un élément"],["8 :: 3","8 :: [3]","à droite de ::, il faut une liste"],["if c then 1","if c then 1 else 0","un if sans else doit être de type unit"],["a = b = c","a = b && b = c","(a = b) = c compare un bool à un int"],["List.hd li sans test","if li = [] then … else … List.hd li …","List.hd [] provoque une erreur"]].map(r=>`<tr><td><code>${esc(r[0])}</code></td><td><code>${esc(r[1])}</code></td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div>`;},
 formal:`<p>Avant de rendre : vérifie le type de chaque branche, la présence de rec, les parenthèses autour des arguments, et donne la signature de chaque fonction.</p>`,
 use:`<p>Au partiel, chaque fonction doit être accompagnée de sa signature : c'est une vérification gratuite de tes types.</p>`,
 trap:`OCaml ne convertit jamais tout seul entre int et float.`,
 q:"Pourquoi f n - 1 ne calcule-t-il pas f (n − 1) ?",a:"L'application de fonction est prioritaire : f n - 1 se lit (f n) - 1. Dans une fonction récursive, cela boucle à l'infini.",rel:["pf-types","pf-rec","p/recettes"]});

/* ---------- chapitre 6 : pas sûr que ça tombe ---------- */
add(7,{id:"pf-match",ex:"ct",type:"def",out:"Pas au CC du 13/11 : le prof l'a écrit le 5/11, le contrôle porte sur tout jusqu'aux listes incluses, « sans le filtrage ». Garde cette fiche pour l'examen de janvier.",ref:"Cours p. 58, TD ex. 32 à 34",t:"Le filtrage : match … with",short:"Le filtrage (match)",
 plain:`match compare une valeur à ${hl("des motifs, de haut en bas")}, et prend le ${hl("premier qui correspond")}. Sur les listes, les deux motifs de base sont [] et x :: r. when ajoute une condition, _ attrape tout.`,
 fig:()=>matchLab,
 formal:`${M(`match e with
| motif1 -> résultat1
| motif2 when condition -> résultat2
| _ -> résultat_par_défaut

(* exiPairs avec match : même fonction que la version avec if *)
let rec exiPairs li = match li with
  | [] -> false
  | x :: r -> x mod 2 = 0 || exiPairs r`)}<ul><li>Tous les résultats ont le même type.</li><li>x :: r donne directement un nom à la tête (x) et à la queue (r) : x remplace List.hd li, r remplace List.tl li.</li><li>OCaml prévient si un cas manque ou ne sert jamais.</li></ul>`,
 use:`<p>TD ex. 32 : évaluer un match pour n = 0, 6, 3. Teste chaque cas dans l'ordre, sans sauter.</p>`,
 trap:`L'ordre des cas compte : un cas placé après « _ » ou après un cas plus général n'est jamais atteint (le « | 3 -> 0 » de l'exercice 32).`,
 q:"On calcule : match n with | 1 -> 1 | i when i &lt; 0 -> 0 | i when i mod 2 = 0 -> n / 2 | i when i mod 2 = 1 -> i + 1 | 3 -> 0 | _ -> 2. Que vaut le résultat pour n = 6 ?",a:"3 : 6 n'est pas 1, n'est pas négatif, et il est pair, donc n / 2 = 3.",rel:["pf-listes-rec"]});

add(6,{id:"pf-lili",type:"meth",maybe:"Les exercices 35 et 36 sont dans la partie « filtrage » du TD, après les listes : pas sûr qu'ils tombent. Ils s'écrivent quand même sans match, avec le même schéma.",ref:"TD ex. 35 et 36",t:"nbOcc et listes de listes",short:"nbOcc, listes de listes",
 plain:`Une liste peut contenir des listes : [[1; 2]; [3; 1; 0]; []; [8]] est une ${hl("int list list")}. On la parcourt comme une liste ordinaire : la tête est une liste, à laquelle on applique une autre fonction.`,
 fig:()=>h=>W.drill(h,[{e:"List.hd [[1;2]; [3;1;0]; []; [8]]",t:"int list",v:"[1; 2]"},{e:"[3] :: List.tl [[1;2]; [3;1;0]; []; [8]]",t:"int list list",v:"[[3]; [3; 1; 0]; []; [8]]"},{e:"3 :: [[1;2]; [8]]",t:"erreur",why:"3 est un int, les éléments sont des int list."},{e:"List.tl [[1;2]; [8]]",t:"int list list",v:"[[8]]"}],["int","int list","int list list","erreur"]),
 formal:`${M(`(* TD ex. 35 : nbOcc 3 [3; 8; 9; 3; 0] = 2 *)
let rec nbOcc : int -> int list -> int = fun x li ->
  if li = [] then 0
  else (if List.hd li = x then 1 else 0) + nbOcc x (List.tl li)

(* TD ex. 36 *)
let rec nbOccLiLi : int -> int list list -> int = fun n lili ->
  if lili = [] then 0
  else nbOcc n (List.hd lili) + nbOccLiLi n (List.tl lili)

let rec liSuff : int list -> int list list = function
  li -> if li = [] then [[]]
        else li :: liSuff (List.tl li)
(* liSuff [1; 2] = [[1; 2]; [2]; []] *)`)}`,
 use:`<p>Réutilise une fonction déjà écrite (nbOcc) sur chaque sous-liste : c'est ce que demande l'exercice 36.</p>`,
 trap:`3 :: li est une erreur si li est une int list list ; il faut [3] :: li.`,
 q:"Quel est le type de [[1; 2]; []; [8]] ?",a:"int list list.",rel:["pf-listes-rec"]});

/* ---------- pas au contrôle ---------- */
add(8,{id:"pf-poly",ex:"ct",type:"def",out:"Le polymorphisme est au programme de l'examen de janvier. Au CC, le site le disait hors programme, à tort : le CC d'octobre 2025 avait déjà des types 'a.",ref:"Cours, TD ex. 37 et suivants",t:"Le polymorphisme : le type 'a",short:"Polymorphisme ('a)",
 plain:`Quand une fonction ne regarde pas vraiment le type des éléments, OCaml lui donne un type ${hl("'a")} (« alpha »), qui veut dire « n'importe quel type, mais le même partout ». Ainsi derListe marche sur des listes d'entiers, de chaînes, etc.`,
 fig:()=>h=>{h.innerHTML=M(`let rec derListe li = if List.tl li = [] then List.hd li else derListe (List.tl li)
(* derListe : 'a list -> 'a *)
derListe [3; 5; 1]        (* 1 *)
derListe ["a"; "b"]       (* "b" *)
max                        (* 'a -> 'a -> 'a *)
List.hd                    (* 'a list -> 'a *)`);},
 formal:`<p>'a, 'b… sont des variables de type. Dans 'a -> 'a list -> bool, les deux 'a sont le même type.</p>`,
 use:`<p>TD : « modifiez la définition pour qu'elle s'applique à tout type de liste ». Il suffit souvent d'enlever l'annotation int list.</p>`,
 trap:`Si tu utilises + ou mod sur les éléments, le type redevient int : ce n'est plus polymorphe.`,
 q:"Quel est le type de List.hd ?",a:"'a list -> 'a.",rel:["pf-signature"]});

/* ---------- TD ---------- */
const td=[
 {id:"1",s:3,t:"Types et valeurs d'expressions",en:`<p>Vérifiez si les expressions suivantes sont correctes et si c'est le cas donnez leur type et leur valeur :</p>${M(`(3 * (7 - 5))
7.1 +. 2.2
7.2 / 2
7. /. 2.
7 / 2
3 * 4
3. *. 4.
3 * 4.
7. mod 2.
7 mod 2
int_of_float(10.0 /. 2.5)
int_of_float(10.0) / int_of_float(2.5)
(true || false)
true && false
not (true && false)
not (true) && not(false)
(1>2) || (1<2)
(12.0 +. 30. = 42.) && (3 + 4 = 4 + 4)
true = false
"bon" ^ "jour"
not("true")
true = "true"
if 1<2 then 3+1 else 5/2
if 1 < 3/2 then if 2 < 3/2 then 1 else 2 else 3
if 3/2 < 2 then 4.1
if 3/2<2 then 4<5 else 4+5`)}`,link:"pf-types",idea:"Regarde ce que chaque opérateur attend : + - * / mod veulent des int ; +. -. *. /. veulent des float ; not, &amp;&amp; et || veulent des bool ; = compare deux valeurs du même type.",sol:`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Expression</th><th>Type</th><th>Valeur</th></tr></thead><tbody><tr><td>(3 * (7 - 5))</td><td>int</td><td>6</td></tr><tr><td>7.1 +. 2.2</td><td>float</td><td>9.3</td></tr><tr><td>7.2 / 2</td><td>erreur</td><td>/ veut deux int. Avec des float : 7.2 /. 2.</td></tr><tr><td>7. /. 2.</td><td>float</td><td>3.5</td></tr><tr><td>7 / 2</td><td>int</td><td>3 : division entière</td></tr><tr><td>3 * 4</td><td>int</td><td>12</td></tr><tr><td>3. *. 4.</td><td>float</td><td>12.</td></tr><tr><td>3 * 4.</td><td>erreur</td><td>* veut deux int, et 4. est un float</td></tr><tr><td>7. mod 2.</td><td>erreur</td><td>mod n'existe que pour les int</td></tr><tr><td>7 mod 2</td><td>int</td><td>1</td></tr><tr><td>int_of_float(10.0 /. 2.5)</td><td>int</td><td>4</td></tr><tr><td>int_of_float(10.0) / int_of_float(2.5)</td><td>int</td><td>5 : int_of_float(2.5) vaut 2, et 10 / 2 = 5</td></tr><tr><td>(true || false)</td><td>bool</td><td>true</td></tr><tr><td>true &amp;&amp; false</td><td>bool</td><td>false</td></tr><tr><td>not (true &amp;&amp; false)</td><td>bool</td><td>true</td></tr><tr><td>not (true) &amp;&amp; not(false)</td><td>bool</td><td>false : c'est false &amp;&amp; true</td></tr><tr><td>(1&gt;2) || (1&lt;2)</td><td>bool</td><td>true</td></tr><tr><td>(12.0 +. 30. = 42.) &amp;&amp; (3 + 4 = 4 + 4)</td><td>bool</td><td>false : c'est true &amp;&amp; false</td></tr><tr><td>true = false</td><td>bool</td><td>false</td></tr><tr><td>"bon" ^ "jour"</td><td>string</td><td>"bonjour"</td></tr><tr><td>not("true")</td><td>erreur</td><td>not veut un bool, pas une string</td></tr><tr><td>true = "true"</td><td>erreur</td><td>= compare deux valeurs du même type</td></tr><tr><td>if 1&lt;2 then 3+1 else 5/2</td><td>int</td><td>4</td></tr><tr><td>if 1 &lt; 3/2 then if 2 &lt; 3/2 then 1 else 2 else 3</td><td>int</td><td>3 : 3/2 vaut 1, et 1 &lt; 1 est faux</td></tr><tr><td>if 3/2 &lt; 2 then 4.1</td><td>erreur</td><td>sans else, le then doit être de type unit ; 4.1 est un float</td></tr><tr><td>if 3/2&lt;2 then 4&lt;5 else 4+5</td><td>erreur</td><td>les deux branches n'ont pas le même type : bool et int</td></tr></tbody></table></div><p>Les valeurs ont été vérifiées dans OCaml. Pour t'entraîner à l'écran : la page « Entraînement : types et valeurs ».</p>`},
 {id:"2",s:3,note:"comme la question 1 du partiel",t:"Bien typée ou non ? Avec f : int -> bool et g : int * bool -> int",en:"Soient f : int -> bool et g : int * bool -> int. Dire si chaque expression est bien typée et, si oui, donner son type : 2+f(3) ; f(3)||f(4) ; g(2,f(2)) ; f(g(2,f(2))) ; f(2,g(3)) ; g(2,f(2))+f(2) ; if f(2) then g(1,true) else 3/4 ; if f(2) then f(2) else g(2,f(2)) ; if g(1,true)/2 &gt; 5 then f(2) else 5/3&lt;2.",link:"pf-signature",idea:"Remplace chaque appel par le type de son résultat : f(…) est un bool, g(…, …) est un int. Puis regarde ce que chaque opérateur attend.",
  sol:`<ol><li>2+f(3) : <b>erreur</b>. f(3) est un bool, et + veut deux int.</li><li>f(3)||f(4) : <b>bool</b>.</li><li>g(2,f(2)) : <b>int</b>. g reçoit bien un couple (int, bool).</li><li>f(g(2,f(2))) : <b>bool</b>. g(…) est un int, que f accepte.</li><li>f(2,g(3)) : <b>erreur</b>. g attend un couple, pas un seul int ; et f attend un int, pas un couple.</li><li>g(2,f(2))+f(2) : <b>erreur</b>. On additionne un int et un bool.</li><li>if f(2) then g(1,true) else 3/4 : <b>int</b>. Les deux branches sont des int.</li><li>if f(2) then f(2) else g(2,f(2)) : <b>erreur</b>. Une branche est un bool, l'autre un int.</li><li>if g(1,true)/2 &gt; 5 then f(2) else 5/3&lt;2 : <b>bool</b>. La condition compare deux int ; les deux branches sont des bool.</li></ol><p>Vérifié dans OCaml, avec deux fonctions f et g de ces types.</p>`},
 {id:"3",s:2,t:"let … in et let … and",en:`<p>Calculez les types et valeurs des expressions :</p>${M(`let x=5 in x*x
let a=2 and b=true in b && (a>0)
let a=2 and b=5 in a+2*b
let a=5 and b=a+1 in a+2*b
let a=3 and b=5 in (a<b) && ((a>b)/2)
let a=1 and b=1 and c=2 in a=b=c`)}`,link:"pf-let",
  sol:`<ol><li>int, 25</li><li>bool, true</li><li>int, 12</li><li>erreur : a n'est pas encore défini pour b (ou l'ancien a s'il existe)</li><li>erreur : (a&gt;b) est un bool, on ne peut pas le diviser par 2</li><li>erreur : (a=b)=c compare true à 2</li></ol>`},
 {id:"4",s:2,t:"Une seule racine, trois multiplications",en:"1. Écrire en OCaml l'expression √2,5 / (√2,5 + 1) en n'utilisant qu'une fois la fonction sqrt (racine carrée). 2. Écrire x² + x⁴ + x⁵ en n'utilisant que 3 multiplications ; x est de type entier.",link:"pf-let",idea:"Donne un nom au résultat que tu veux réutiliser, avec let … in.",
  sol:`${M(`let r = sqrt 2.5 in r /. (r +. 1.)

let x2 = x * x in
let x4 = x2 * x2 in
x2 + x4 + x4 * x`)}<p>sqrt est une fonction float -> float : on écrit 2.5, et les opérateurs prennent un point. La première expression vaut environ 0,6126. Dans la seconde, les trois multiplications sont x * x, x2 * x2 et x4 * x.</p>`},
 {id:"5",s:3,note:"comme la question 1 du partiel",t:"Quel type pour x et y ? Quelle signature pour f et g ?",en:"1. De quel type doivent être x et y pour que chaque expression soit bien typée : x+1 ; x||y ; (x+1)||y ; x=y ; (x=y)||(x=y+1) ; if x then y else 3 ; not(x)||((x mod 2)=0). 2. Quelle doit être la signature de f et de g : f(1)+1 ; g(1,true)&amp;&amp;f(1) ; f(f(1)) ; f(true)+.g(2) ; g(1+f(3)) ; f(x) || (f(x)=0).",link:"pf-signature",idea:"Chaque opérateur impose le type de ce qu'il reçoit : + veut des int, || veut des bool, +. veut des float.",
  sol:`<p><b>1.</b></p><ol><li>x+1 : x est un int.</li><li>x||y : x et y sont des bool.</li><li>(x+1)||y : <b>impossible</b>. x+1 est un int, et || veut un bool.</li><li>x=y : x et y du même type, n'importe lequel.</li><li>(x=y)||(x=y+1) : x et y sont des int, à cause de y+1.</li><li>if x then y else 3 : x est un bool, y un int (les deux branches ont le même type).</li><li>not(x)||((x mod 2)=0) : <b>impossible</b>. x devrait être à la fois un bool (not) et un int (mod).</li></ol><p><b>2.</b></p><ol><li>f(1)+1 : f : int -> int.</li><li>g(1,true)&amp;&amp;f(1) : g : int * bool -> bool et f : int -> bool.</li><li>f(f(1)) : f : int -> int (son résultat lui est redonné).</li><li>f(true)+.g(2) : f : bool -> float et g : int -> float.</li><li>g(1+f(3)) : f : int -> int ; g prend un int, et son résultat peut être de n'importe quel type.</li><li>f(x) || (f(x)=0) : <b>impossible</b>. f(x) devrait être à la fois un bool et un int.</li></ol><p>Vérifié dans OCaml.</p>`},
 {id:"6",s:3,note:"comme la question 2 du partiel",t:"Définir f, g et cube",en:"Écrire les définitions OCaml de : f : ℤ → ℤ, x ↦ 2x + 1 ; g : ℝ × ℝ → bool, (x, y) ↦ x &lt; y/2 ; cube : ℝ → ℝ, x ↦ x³.",link:"pf-signature",idea:"ℤ se traduit par int, ℝ par float, et ℝ × ℝ par float * float.",
  sol:`${M(`let f : int -> int = function
  x -> 2 * x + 1

let g : float * float -> bool = function
  (x, y) -> x < y /. 2.

let cube : float -> float = function
  x -> x *. x *. x`)}<p>Sur les float, tous les opérateurs prennent un point, et 2 s'écrit 2. ; la comparaison &lt;, elle, marche sur tous les types.</p>`},
 {id:"7",s:2,t:"Signatures de f1 et f2",en:`<p>Quelle est la signature des fonctions :</p>${M(`let f1 = function (x, y) ->
  if y then x+1 else 2*x

let f2 = function (x, y) ->
  if x > y then x > y else y > 2*x`)}`,link:"pf-signature",idea:"Note ce que chaque opérateur impose au type de x et de y, puis regarde le type des deux branches du if.",sol:`<p><b>f1 : int * bool -> int.</b> « if y » impose y : bool ; x+1 impose x : int ; les deux branches sont des int.</p><p><b>f2 : int * int -> bool.</b> 2*x impose x : int ; y est comparé à 2*x, donc y : int ; les deux branches sont des comparaisons, donc des bool.</p>`},
 {id:"8",s:2,t:"Périmètre d'un cercle, même signe",en:"1. Écrire la fonction qui calcule le périmètre d'un cercle de rayon r, sous forme mathématique puis en OCaml (prendre 3.14 pour π). 2. Même chose pour la fonction qui vérifie si deux entiers sont de même signe.",link:"pf-signature",
  sol:`<p>perimetre : ℝ → ℝ, r ↦ 2πr. memeSigne : ℤ × ℤ → bool, (a, b) ↦ vrai si a et b sont tous deux positifs ou tous deux négatifs.</p>${M(`let perimetre : float -> float = function
  r -> 2. *. 3.14 *. r

let memeSigne : int * int -> bool = function
  (a, b) -> (a >= 0 && b >= 0) || (a < 0 && b < 0)`)}<p>Ici 0 est compté avec les positifs : dis-le dans ta réponse.</p>`},
 {id:"9",s:2,t:"Valeur absolue, maximum, médiane",en:"Définir les fonctions qui calculent : la valeur absolue d'un entier ; le maximum de deux entiers ; le maximum de trois entiers ; la valeur médiane de trois entiers.",link:"pf-if",idea:"Réutilise max2 pour écrire max3. La médiane, c'est la somme des trois moins le plus grand et le plus petit.",
  sol:`${M(`let valAbs : int -> int = function
  x -> if x >= 0 then x else -x

let max2 : int * int -> int = function
  (a, b) -> if a >= b then a else b

let max3 : int * int * int -> int = function
  (a, b, c) -> max2 (a, max2 (b, c))

let min2 : int * int -> int = function
  (a, b) -> if a <= b then a else b

let mediane : int * int * int -> int = function
  (a, b, c) -> a + b + c - max3 (a, b, c) - min2 (a, min2 (b, c))`)}<p>mediane (3, 9, 7) = 19 − 9 − 3 = 7. Les fonctions abs et max existent déjà en OCaml (note du TD).</p>`},
 {id:"10",s:2,t:"Trois réels : triangle équilatéral, triangle",en:"Définir les fonctions qui testent si trois réels sont les mesures : d'un triangle équilatéral ; d'un triangle.",link:"pf-if",idea:"Trois longueurs forment un triangle quand chacune est plus petite que la somme des deux autres.",
  sol:`${M(`let equilateral : float * float * float -> bool = function
  (a, b, c) -> a > 0. && a = b && b = c

let triangle : float * float * float -> bool = function
  (a, b, c) -> a < b +. c && b < a +. c && c < a +. b`)}<p>triangle (3., 4., 5.) vaut true ; triangle (1., 2., 5.) vaut false. Pas besoin de if : la comparaison est déjà un bool.</p>`},
 {id:"11",s:2,t:"L'implication",en:"Définir la fonction implication : elle vaut false seulement quand a est true et b est false. Donner une définition avec if … then … else, et une avec seulement not, || et &amp;&amp;.",link:"pf-if",
  sol:`${M(`let implication : bool * bool -> bool = function
  (a, b) -> if a then b else true

let implication : bool * bool -> bool = function
  (a, b) -> not a || b`)}<p>Si a est vrai, le résultat est b ; si a est faux, le résultat est toujours vrai.</p>`},
 {id:"12",s:2,t:"f(n) = 5 si n = 0, 2n + f(n−1) sinon",en:"Soit la fonction f : ℕ → ℕ, qui à n associe 5 si n = 0, et 2n + f(n − 1) sinon. Calculez f(1), f(2), f(3). De manière générale, combien vaut f(n) ? Écrivez cette fonction en OCaml.",link:"pf-rec",sol:`<p>f(1) = 2 + f(0) = 7 ; f(2) = 4 + f(1) = 11 ; f(3) = 6 + f(2) = 17. En général, f(n) = 5 + 2 × (1 + 2 + … + n) = n(n+1) + 5. En OCaml, 2n s'écrit 2 * n.</p>${M(`let rec f : int -> int = function
  n -> if n = 0 then 5 else 2 * n + f (n - 1)`)}`},
 {id:"13",s:3,t:"som : 0 + 1 + 2 + … + n",en:"Définir par récurrence la fonction som : ℕ → ℕ, n ↦ 0 + 1 + 2 + … + n. Donner le cas de base, la récurrence, puis la traduction en OCaml.",link:"pf-rec",
  sol:`<p>Cas de base : som(0) = 0. Récurrence, pour n &gt; 0 : som(n) = n + som(n − 1).</p>${M(`let rec som : int -> int = function
  n -> if n = 0 then 0 else n + som (n - 1)`)}<p>som 4 = 4 + 3 + 2 + 1 + 0 = 10.</p>`},
 {id:"14",s:2,t:"somInt : la somme des entiers de a à b",en:"Écrire somInt : ℕ × ℕ → ℕ, (a, b) ↦ la somme des entiers de l'intervalle [a ; b].",link:"pf-rec",idea:"On met a de côté, et on demande la somme de a + 1 à b. Quand a dépasse b, l'intervalle est vide : la somme vaut 0.",
  sol:`${M(`let rec somInt : int * int -> int = function
  (a, b) -> if a > b then 0 else a + somInt (a + 1, b)`)}<p>somInt (3, 6) = 3 + 4 + 5 + 6 = 18.</p>`},
 {id:"15",s:2,t:"mul sans multiplication",en:"Écrivez la fonction mul qui calcule le produit de 2 entiers naturels, <b>sans utiliser l'opérateur *</b>, en n'utilisant qu'additions et soustractions. Commencez par définir mul(a, b) par récurrence sur a, puis traduisez en OCaml. Cas de base : quand a = 0, mul(a, b) = … Équation de récurrence : quand a > 0, mul(a, b) = …",link:"pf-rec",sol:`<p>Cas de base : quand a = 0, mul(a, b) = 0. Récurrence : quand a > 0, mul(a, b) = b + mul(a − 1, b), car a × b = b + (a − 1) × b.</p>`+M(`let rec mul : int * int -> int = function
  (a, b) -> if a = 0 then 0 else b + mul (a - 1, b)`)},
 {id:"16",s:2,t:"carre sans multiplication",en:"On cherche un algorithme calculant le carré d'un entier naturel, <b>sans utiliser de multiplication</b> (en n'utilisant qu'additions et soustractions). Appelons carre cette fonction. Pour calculer carre(n) on utilise un schéma récursif. Cas de base : quand n = 0, que vaut carre(n) ? Équation de récurrence : quand n ≠ 0, essayez de définir carre(n) en fonction de carre(n − 1) (pour cela développez l'expression (n − 1)²). Écrivez la fonction carre.",link:"pf-rec",sol:`<p>Cas de base : carre(0) = 0. (n − 1)² = n² − 2n + 1, donc n² = (n − 1)² + 2n − 1 : carre(n) = carre(n − 1) + n + n − 1. On écrit n + n pour ne pas multiplier.</p>${M(`let rec carre : int -> int = function
  n -> if n = 0 then 0 else carre (n - 1) + n + n - 1`)}`},
 {id:"17",s:2,t:"estPair sans division",en:"Écrire la fonction estPair, qui teste si un entier naturel est pair, sans utiliser de division (ni mod, ni /).",link:"pf-rec",idea:"0 est pair, et n est pair quand n − 1 ne l'est pas.",
  sol:`${M(`let rec estPair : int -> bool = function
  n -> if n = 0 then true else not (estPair (n - 1))`)}<p>C'est la solution envoyée par ton chargé de TD (9/11). Autre possibilité : deux cas de base, n = 0 (true) et n = 1 (false), puis estPair (n - 2).</p>`},
 {id:"18",s:3,t:"Puissance de 10",en:"Un entier n ∈ ℕ est une puissance de 10 s'il s'écrit n = 10ᵏ (k ∈ ℕ). Vous devez écrire la définition d'une fonction qui teste si un entier est une puissance de 10, <b>sans utiliser l'opération log</b>. Pour cela posez-vous les questions suivantes : quelle est la plus petite puissance de 10 ? Est-ce que les autres puissances de 10 sont des multiples de 10 ? Est-ce qu'un multiple de 10 est une puissance de 10 ? Quelle condition faut-il ajouter pour obtenir une condition nécessaire et suffisante au fait d'être une puissance de 10 ?",link:"pf-rec-ex",sol:`<p>La plus petite est 1 ; une puissance de 10 plus grande est un multiple de 10 dont le quotient par 10 est encore une puissance de 10.</p>${M(`let rec estPuis10 : int -> bool = function
  n -> n = 1 || (n > 0 && n mod 10 = 0 && estPuis10 (n / 10))`)}`},
 {id:"19",s:2,t:"Répartir n objets dans b boîtes",en:"On cherche à calculer le nombre de façons de répartir n objets dans b boîtes. Les boîtes sont différenciées et peuvent être vides. Par exemple les répartitions de 3 objets dans 2 boîtes sont (0, 3), (1, 2), (2, 1), (3, 0), et donc le nombre de répartitions est 4. On appelle nbrep(n, b) ce nombre. Pour trouver l'équation de récurrence définissant nbrep(n, b) on distingue : les répartitions où la première boîte est vide (dans ce cas il faut répartir l'ensemble des objets dans les autres boîtes) ; les répartitions où la première boîte contient au moins 1 objet (dans ce cas il faut répartir les autres objets dans l'ensemble des boîtes). En déduire l'équation de récurrence puis les cas de base (les nombres de boîtes et d'objets sont des entiers naturels). Définissez la fonction OCaml calculant ce nombre de répartitions. Comment modifier la définition pour ne compter que les répartitions dans des boîtes différenciées non vides ? Il n'y a que 2 façons de répartir 3 objets dans 2 boîtes non vides.",link:"pf-rec-ex",sol:`<p>nbrep(n, b) = nbrep(n, b − 1) + nbrep(n − 1, b). Cas de base : b = 0 → 1 si n = 0, sinon 0 ; n = 0 → 1.</p>${M(`let rec nbrep : int * int -> int = function
  (n, b) -> if b = 0 then (if n = 0 then 1 else 0)
            else if n = 0 then 1
            else nbrep (n, b - 1) + nbrep (n - 1, b)
(* nbrep (3, 2) = 4 *)`)}<p><b>Boîtes non vides.</b> On pose d'abord un objet dans chaque boîte, puis on répartit librement les n − b objets qui restent.</p>${M(`let nbrepNV : int * int -> int = function
  (n, b) -> if n < b then 0 else nbrep (n - b, b)
(* nbrepNV (3, 2) = nbrep (1, 2) = 2 *)`)}<p>Attention : dans le fichier TD_Ocaml.zip de ton chargé de TD (mail du 9/11), la fonction pour les boîtes non vides renvoie 3 pour 3 objets et 2 boîtes, alors que l'énoncé annonce 2. Garde la version ci-dessus (vérifiée dans OCaml).</p>`},
 {id:"20",s:3,note:"la forme curryfiée",t:"De g à gg : la forme curryfiée, min, somInt",en:`<p>1. g : ℝ × ℝ → bool, (x, y) ↦ x &lt; y/2 peut aussi s'écrire comme une fonction à un seul paramètre :</p>${M(`let gg : float -> float -> bool = function
  x -> function
    y -> x < (y /. 2.)`)}<p>Quel est le type de gg 3.2 ? Quelle expression avec gg donne la valeur de g(3.2, 4.4) ?</p><p>2. Définir min, de signature int -> int -> int. 3. Définir somInt (exercice 14) avec la signature int -> int -> int.</p>`,link:"pf-signature",
  sol:`<p>1. gg 3.2 est de type <b>float -> bool</b> : c'est une fonction, qui attend encore y. La valeur de g(3.2, 4.4) s'obtient avec <b>gg 3.2 4.4</b>, qui vaut false (3.2 n'est pas plus petit que 2.2). On écrit plus simplement : let gg : float -> float -> bool = fun x y -> x &lt; (y /. 2.).</p>${M(`let min : int -> int -> int = fun
  x y -> if x > y then y else x

let rec somInt : int -> int -> int = fun
  a b -> if a > b then 0 else a + somInt (a + 1) b`)}<p>Dans l'appel récursif curryfié, chaque argument a ses parenthèses : somInt (a + 1) b.</p>`},
 {id:"21",s:3,t:"nbDiv et estPremier",en:"On cherche à définir une fonction vérifiant si un entier est un nombre premier (nombre ayant exactement 2 diviseurs). Pour cela commencez par définir la fonction <b>récursive</b> nbDiv <b>de signature int -> int -> int</b> telle que, n et i étant 2 entiers avec 1 ≤ i ≤ n, l'évaluation de nbDiv n i donne le nombre de diviseurs de n inférieurs ou égaux à i. Écrivez alors la fonction estPremier qui teste si un nombre est premier.",link:"pf-rec-ex",sol:M(`let rec nbDiv : int -> int -> int = fun n i ->
  if i = 0 then 0
  else (if n mod i = 0 then 1 else 0) + nbDiv n (i - 1)
let estPremier : int -> bool = function n -> nbDiv n n = 2`)+`<p>Attention : dans le fichier TD_Ocaml.zip de ton chargé de TD (mail du 9/11), le cas de base de nbDiv est écrit « if n = 1 ». Avec lui, nbDiv 6 6 finit par diviser par 0 (i descend jusqu'à 0). Le cas de base doit porter sur i, comme ici.</p>`},
 {id:"22",s:3,t:"Évaluer des expressions sur [2; 3; 2; 4]",en:`<p>Évaluez les expressions ci-dessous :</p>${M(`let li = [2;3;2;4]
List.tl (List.tl (li))
List.hd (List.tl (List.tl (li)))
List.hd (List.tl (List.tl (List.tl (List.tl (li)))))
7 :: li
7 :: List.tl (li)
List.hd (li) :: List.tl (li)
List.hd (List.tl (li)) :: List.tl (li)
List.hd ["liste"; "entiers"] :: ["chaines"]`)}`,link:"pf-listes",
  sol:`<p>La première ligne donne un nom à la liste. Pour les huit expressions suivantes :</p><ol><li>[2; 4], de type int list</li><li>2, de type int</li><li>erreur à l'exécution : après quatre List.tl, la liste est vide, et List.hd [] échoue</li><li>[7; 2; 3; 2; 4]</li><li>[7; 3; 2; 4]</li><li>[2; 3; 2; 4] : c'est li</li><li>[3; 3; 2; 4]</li><li>["liste"; "chaines"], de type string list</li></ol>`},
 {id:"23",s:2,t:"inverserElem",en:"Écrivez une fonction qui inverse l'ordre des deux premiers éléments d'une liste d'entiers de longueur au moins deux : let inverserElem : int list -> … (La suite de l'exercice, « pour que la fonction s'applique à tout type de liste », est du polymorphisme : d'après ce que tu sais, il n'est pas au CC.)",link:"pf-listes",
  hint:"Pas besoin de récursivité : prends le deuxième (List.hd (List.tl li)), puis le premier, puis le reste à partir du troisième.",
  sol:M(`let inverserElem : int list -> int list = function
  li -> List.hd (List.tl li) :: List.hd li :: List.tl (List.tl li)
(* inverserElem [1; 2; 3] = [2; 1; 3] *)`)},
 {id:"24",s:3,t:"listeEntiers",en:"Soit la fonction listeEntiers qui, étant donné un entier naturel n, calcule la liste [n; n-1; …; 1; 0]. Complétez la récurrence. Cas de base : quand n = 0, que vaut listeEntiers(0) ? Équation de récurrence : quand n > 0, définissez listeEntiers(n) en fonction de listeEntiers(n-1). Écrivez la définition OCaml de la fonction <b>récursive</b> listeEntiers.",link:"pf-listes-construire",
  hint:"Cas de base : listeEntiers 0 = [0]. Récurrence : listeEntiers n = n :: listeEntiers (n − 1).",
  sol:M(`let rec listeEntiers : int -> int list = function
  n -> if n = 0 then [0]
       else n :: listeEntiers (n - 1)`)},
 {id:"25",s:3,t:"derListe",en:"Définissez la fonction derListe qui calcule la valeur du dernier élément d'une liste d'entiers non vide. Commencez par écrire la récurrence. Cas de base : quand li ne contient qu'un élément, que vaut derListe(li) ? Équation de récurrence : quand li contient plus d'un élément, définissez derListe(li) en fonction de derListe(List.tl(li)). Écrivez la définition OCaml de derListe : let rec derListe : int list -> int = … (La fin de l'exercice, « pour tout type de liste », est du polymorphisme : pas au CC d'après ce que tu sais.)",link:"pf-listes-tests",
  hint:"« li n'a qu'un élément » s'écrit List.tl li = [].",
  sol:M(`let rec derListe : int list -> int = function
  li -> if List.tl li = [] then List.hd li
        else derListe (List.tl li)`)},
 {id:"26",s:3,t:"maxListe",en:"On cherche à écrire un algorithme maxListe qui, étant donné li, une liste non vide d'entiers, calcule le plus grand de ses éléments. Pour cela complétez la récurrence. Cas de base : quand li ne contient qu'un élément, que vaut maxListe(li) ? Équation de récurrence : quand li contient plus d'un élément, définissez maxListe(li) en fonction de maxListe(List.tl(li)) <b>en utilisant la fonction max</b> calculant le maximum de 2 nombres. Complétez alors la définition : let rec maxListe : int list -> …",link:"pf-listes-tests",
  hint:"Même cas de base que derListe. Sinon : le max entre la tête et le maxListe de la queue.",
  sol:M(`let rec maxListe : int list -> int = function
  li -> if List.tl li = [] then List.hd li
        else max (List.hd li) (maxListe (List.tl li))`)},
 {id:"27",s:3,t:"tousPairs, exiPairs, liPairs, oterPairs",en:`<p>Définissez les fonctions :</p><ul><li>tousPairs qui, étant donnée une liste d'entiers, vaut true si tous ses éléments sont pairs, false sinon. Par exemple, tousPairs([2;8;2]) et tousPairs([]) valent true, tandis que tousPairs([2;5;2]) vaut false.</li><li>exiPairs qui teste si une liste d'entiers contient au moins un élément pair. Par exemple, exiPairs([2]) et exiPairs([3;2;5]) valent true ; exiPairs([7;5]) et exiPairs([]) valent false.</li><li>liPairs qui extrait d'une liste d'entiers la liste des nombres pairs. Par exemple liPairs([5;8;1;2]) = [8;2].</li><li>oterPairs qui supprime les nombres pairs d'une liste d'entiers. Par exemple oterPairs([5;8;1;2]) = [5;1].</li></ul>`,link:"pf-listes-tests",
  sol:M(`let rec tousPairs : int list -> bool = function
  li -> if li = [] then true
        else List.hd li mod 2 = 0 && tousPairs (List.tl li)

let rec exiPairs : int list -> bool = function
  li -> if li = [] then false
        else List.hd li mod 2 = 0 || exiPairs (List.tl li)

let rec liPairs : int list -> int list = function
  li -> if li = [] then []
        else if List.hd li mod 2 = 0 then List.hd li :: liPairs (List.tl li)
        else liPairs (List.tl li)

let rec oterPairs : int list -> int list = function
  li -> if li = [] then []
        else if List.hd li mod 2 = 0 then oterPairs (List.tl li)
        else List.hd li :: oterPairs (List.tl li)`)},
 {id:"28",s:3,t:"liDivInf et liDiv",en:"On souhaite définir la fonction liDiv qui calcule la liste des diviseurs d'un entier naturel non nul. Commencez par définir la fonction liDivInf : int -> int -> int list, telle que (liDivInf n i) donne comme résultat la liste des diviseurs de n inférieurs ou égaux à i. Par exemple (liDivInf 20 4) = [4;2;1], (liDivInf 7 5) = [1], (liDivInf 4 4) = [4;2;1]. Définissez liDiv à partir de liDivInf.",link:"pf-listes-construire",
  hint:"Même forme que nbDiv (ex. 21) et prodDiv (partiel 2021), mais le cas de base vaut [] et on ajoute i devant avec ::.",
  sol:M(`let rec liDivInf : int -> int -> int list = fun n i ->
  if i = 0 then []
  else if n mod i = 0 then i :: liDivInf n (i - 1)
  else liDivInf n (i - 1)

let liDiv : int -> int list = function n -> liDivInf n n`)},
 {id:"29",s:2,t:"ajouFin",en:`Définissez la fonction ajouFin qui ajoute un élément à la fin d'une liste. Le type de l'élément doit correspondre au type des éléments de la liste, mais peut être quelconque. Par exemple (ajouFin 4 [5;4;2]) = [5;4;2;4] et (ajouFin "deux" ["un"]) = ["un";"deux"].`,link:"pf-listes-construire",
  sol:M(`let rec ajouFin : int -> int list -> int list = fun x li ->
  if li = [] then [x]
  else List.hd li :: ajouFin x (List.tl li)`)+`<p>L'énoncé du TD ajoute que le type de l'élément peut être quelconque (ajouFin "deux" ["un"] = ["un"; "deux"]). Le corps ne change pas : seule la signature devient 'a -> 'a list -> 'a list. C'est du polymorphisme : d'après ce que tu sais, il ne sera pas au CC.</p>`},
 {id:"30",s:2,t:"inverseLi",en:"Définissez la fonction inverseLi qui inverse l'ordre des éléments d'une liste. Par exemple (inverseLi [1;4;2]) = [2;4;1]. Vous pouvez utiliser la fonction ajouFin de la question précédente… ou pas.",link:"pf-listes-construire",
  hint:"Inverse la queue, puis mets la tête à la fin avec ajouFin.",
  sol:M(`let rec inverseLi : int list -> int list = function
  li -> if li = [] then []
        else ajouFin (List.hd li) (inverseLi (List.tl li))`)},
 {id:"31",s:3,t:"prefixe, suffixe, facteur",en:`<p>Définitions : soient l1 et l2 deux listes.</p><ul><li>l1 est <b>préfixe</b> de l2 si l2 est composée des éléments de l1 dans le même ordre, puis d'éléments en nombre et valeur quelconques.</li><li>l1 est <b>suffixe</b> de l2 si l2 est composée d'éléments quelconques, suivis des éléments de l1 dans le même ordre.</li><li>l1 est <b>facteur</b> de l2 si l2 est composée d'éléments quelconques, suivis des éléments de l1 dans le même ordre, suivis d'éléments quelconques.</li></ul><p>Exemples : [3;2;3] est préfixe et facteur de la liste [3;2;3;4;2]. [3;2;3] est préfixe, suffixe et facteur de la liste [3;2;3]. [] est préfixe, suffixe et facteur de toutes les listes. [3;2;3] est suffixe et facteur de la liste [4;3;2;3]. [3;2;3] est facteur de la liste [4;2;3;2;3;8].</p><p>Définissez les fonctions prefixe, suffixe et facteur.</p>`,link:"pf-listes-tests",
  hint:"prefixe : compare les têtes, puis les queues. suffixe : l1 = l2, ou l1 est suffixe de la queue de l2. facteur : préfixe, ou facteur de la queue de l2.",
  sol:M(`let rec prefixe : int list -> int list -> bool = fun l1 l2 ->
  if l1 = [] then true
  else if l2 = [] then false
  else List.hd l1 = List.hd l2 && prefixe (List.tl l1) (List.tl l2)

let rec suffixe : int list -> int list -> bool = fun l1 l2 ->
  l1 = l2 || (l2 <> [] && suffixe l1 (List.tl l2))

let rec facteur : int list -> int list -> bool = fun l1 l2 ->
  prefixe l1 l2 || (l2 <> [] && facteur l1 (List.tl l2))`)},
 {id:"32",s:2,note:"filtrage",out:"pas au CC du 13/11 (sans filtrage)",t:"Évaluer un match",en:"Valeur du match de l'exercice 32 pour n = 0, 6 et 3.",link:"pf-match",sol:`<p>n = 0 → 0 (pair : 0/2). n = 6 → 3. n = 3 → 4 (impair : 3 + 1) ; le cas « 3 » n'est jamais atteint.</p>`},
 {id:"35",s:2,note:"pas sûr",t:"nbOcc",en:"Nombre d'occurrences d'une valeur dans une liste. nbOcc 3 [3;8;9;3;0] = 2.",link:"pf-lili",sol:M(`let rec nbOcc : int -> int list -> int = fun x li ->
  if li = [] then 0
  else (if List.hd li = x then 1 else 0) + nbOcc x (List.tl li)`)},
 {id:"36",s:2,note:"pas sûr",t:"Listes de listes",en:"Évaluer des expressions sur [[1;2];[3;1;0];[];[8]], écrire nbOccLiLi et liSuff.",link:"pf-lili",sol:`<p>List.hd li = [1; 2] ; List.tl li = [[3;1;0]; []; [8]] ; 3 :: li est une erreur ; [3] :: List.tl li = [[3]; [3;1;0]; []; [8]].</p>${M(`let rec nbOccLiLi : int -> int list list -> int = fun n lili ->
  if lili = [] then 0
  else nbOcc n (List.hd lili) + nbOccLiLi n (List.tl lili)

let rec liSuff : int list -> int list list = function
  li -> if li = [] then [[]]
        else li :: liSuff (List.tl li)`)}`}];

/* ---------- annales : partiel d'octobre 2021 (même format : 1 h, aucun document) ---------- */
const ann=[
 {src:"Partiel octobre 2021 · Q1 · 3 pts",t:"Types, valeurs et signatures",en:`<p>1. Indiquez les types et valeurs des expressions suivantes :</p>${M(`List.hd [4;2] + 1
(8/3) :: (8 mod 3) :: []
List.hd(["un";"deux"]) < "trois"`)}<p>2. Quelle est la signature (types du/des paramètre(s) et résultat) des fonctions :</p>${M(`let f = function (x, y) ->
  if y then x+1 else 2*x

let h = function (x, y) ->
  x + 2 * List.hd(y)

let g = fun x y ->
  x < List.hd(y)`)}`,who:"Mon corrigé",
  sol:`<p>int, 5 ; int list, [2; 2] ; bool, false (« un » vient après « trois »).</p><p>f : int * bool -> int ; h : int * int list -> int ; g : 'a -> 'a list -> bool. Le 'a de g, c'est du polymorphisme : n'importe quel type. Le CC d'octobre 2025 en avait aussi, et il est au programme de l'examen de janvier.</p>`,go:"pf-signature"},
 {src:"Partiel octobre 2021 · Q2 · 3 pts",t:"memeParite",en:"Définissez en OCaml la fonction memeParite : ℕ × ℕ → Bool qui vérifie si deux entiers naturels sont de même parité, c'est-à-dire s'ils sont tous les deux pairs ou tous les deux impairs. Exemples : memeParite(4,6) vaut true ; memeParite(3,7) vaut true ; memeParite(4,3) vaut false. (En tête du sujet : « Pour les questions 2, 3, 4, 5, 6 vous devez dans votre réponse donner la signature de la fonction. »)",who:"Mon corrigé",go:"pf-signature",sol:M(`let memeParite : int * int -> bool = function
  (a, b) -> a mod 2 = b mod 2`)+`<p>Deux entiers ont la même parité quand ils ont le même reste dans la division par 2. L'énoncé écrit memeParite(4,6), avec une virgule : la fonction prend un couple, d'où la signature int * int -> bool.</p>`},
 {src:"Partiel octobre 2021 · Q3 · 3 pts",t:"queDesUn",en:"Définissez la fonction queDesUn : ℕ → Bool qui teste si l'écriture décimale d'un entier naturel n'est composée que du chiffre 1. Exemples : queDesUn(1111) et queDesUn(1) valent true ; queDesUn(110) et queDesUn(8) valent false.",who:"Mon corrigé",go:"pf-rec-ex",sol:M(`let rec queDesUn : int -> bool = function
  n -> if n < 10 then n = 1
       else n mod 10 = 1 && queDesUn (n / 10)`)+`<p>Un seul chiffre (n &lt; 10) : il doit valoir 1. Sinon, le dernier chiffre (n mod 10) vaut 1, et le reste du nombre (n / 10) n'a que des 1.</p>`},
 {src:"Partiel octobre 2021 · Q4 · 4 pts",t:"prodDiv",en:"Définissez en OCaml la fonction prodDiv qui étant donnés deux entiers naturels non nuls n et i, calcule le produit des diviseurs de n inférieurs ou égaux à i. Exemples : (prodDiv 45 7) vaut 15 car les diviseurs de 45, inférieurs ou égaux à 7, sont 1, 3, et 5. (prodDiv 12 1) vaut 1 ; (prodDiv 12 2) vaut 2 ; (prodDiv 12 3) vaut 6 ; (prodDiv 12 5) vaut 24.",who:"Mon corrigé",go:"pf-rec-ex",sol:M(`let rec prodDiv : int -> int -> int = fun n i ->
  if i = 0 then 1
  else if n mod i = 0 then i * prodDiv n (i - 1)
  else prodDiv n (i - 1)`)+`<p>L'énoncé écrit (prodDiv 45 7), sans virgule : la fonction est curryfiée, d'où la signature int -> int -> int. i descend jusqu'à 0 ; le cas de base vaut 1, car c'est un produit.</p>`},
 {src:"Partiel octobre 2021 · Q5 · 3 pts",t:"somElem",en:"Définissez la fonction somElem qui calcule la somme des éléments d'une liste d'entiers. Exemples : somElem [6 ; 9 ; 5] vaut 20 ; somElem [3] vaut 3 ; somElem [ ] vaut 0.",who:"Mon corrigé",go:"pf-listes-rec",sol:M(`let rec somElem : int list -> int = function
  li -> if li = [] then 0
        else List.hd li + somElem (List.tl li)`)},
 {src:"Partiel octobre 2021 · Q6 · 4 pts",t:"prefLong",en:"Définissez en OCaml la fonction prefLong qui étant donnés une liste li et un entier naturel n, calcule le préfixe de longueur n de la liste li. Dans le cas où la longueur de li est inférieure à n le résultat est li. Exemples : (prefLong [3;2;4] 0) vaut [ ] ; (prefLong [3;2;4] 1) vaut [3] ; (prefLong [3;2;4] 2) vaut [3;2] ; (prefLong [3;2;4] 3) vaut [3;2;4] ; (prefLong [3;2;4] 5) vaut [3;2;4].",who:"Mon corrigé",go:"pf-listes-rec",sol:M(`let rec prefLong : int list -> int -> int list = fun li n ->
  if li = [] || n = 0 then []
  else List.hd li :: prefLong (List.tl li) (n - 1)
(* deux cas de base : la liste est finie, ou on a pris assez d'éléments *)`)},
 /* ----- sujet blanc n° 2 : inventé sur le modèle du partiel 2021, corrigé exécuté dans OCaml ----- */
 {src:"Sujet blanc n° 2 (inventé, modèle du partiel 2021) · Q1 · 3 pts",t:"Types, valeurs et signatures",en:`<p>1. Types et valeurs de : List.tl [4; 2] ; (7 mod 3) :: [8 / 3] ; List.hd [3.5; 1.] &gt; 2.</p><p>2. Signatures de :</p>${M(`let f = function (x, y) -> if x then y + 1 else y
let h = fun x y -> x ^ string_of_int (List.hd y)
let g = function (x, y) -> x *. 2. < y`)}<p>(string_of_int : int -> string transforme un entier en texte.)</p>`,go:"pf-signature",who:"Sujet et corrigé écrits par moi (vérifiés dans OCaml)",
  sol:`<p>1. int list, [2] ; int list, [1; 2] ; bool, true (3.5 est plus grand que 2.).</p><p>2. f : bool * int -> int. h : string -> int list -> string (^ impose une string, List.hd y passé à string_of_int impose une liste d'int). g : float * float -> bool.</p>`},
 {src:"Sujet blanc n° 2 (inventé, modèle du partiel 2021) · Q2 · 3 pts",t:"divise",en:"Définir en OCaml la fonction divise : ℕ* × ℕ → bool, qui vérifie si a divise b. Exemples : divise(3, 12) vaut true ; divise(5, 12) vaut false. Donner la signature.",go:"pf-signature",who:"Sujet et corrigé écrits par moi (vérifiés dans OCaml)",
  sol:M(`let divise : int * int -> bool = function
  (a, b) -> b mod a = 0`)},
 {src:"Sujet blanc n° 2 (inventé, modèle du partiel 2021) · Q3 · 3 pts",t:"sommeChiffres",en:"Définir la fonction sommeChiffres : ℕ → ℕ, qui calcule la somme des chiffres de l'écriture décimale d'un entier naturel. Exemples : sommeChiffres(4097) vaut 20 ; sommeChiffres(7) vaut 7. Donner la signature.",go:"pf-rec-ex",who:"Sujet et corrigé écrits par moi (vérifiés dans OCaml)",hint:"Le dernier chiffre est n mod 10 ; le reste du nombre est n / 10. Cas de base : un seul chiffre.",
  sol:M(`let rec sommeChiffres : int -> int = function
  n -> if n < 10 then n
       else n mod 10 + sommeChiffres (n / 10)`)},
 {src:"Sujet blanc n° 2 (inventé, modèle du partiel 2021) · Q4 · 4 pts",t:"sommeDiv",en:"Définir la fonction sommeDiv qui, étant donnés deux entiers naturels non nuls n et i, calcule la somme des diviseurs de n inférieurs ou égaux à i. Exemples : (sommeDiv 12 5) vaut 10 car les diviseurs de 12 inférieurs ou égaux à 5 sont 1, 2, 3 et 4 ; (sommeDiv 45 7) vaut 9. Donner la signature.",go:"pf-rec-ex",who:"Sujet et corrigé écrits par moi (vérifiés dans OCaml)",hint:"Même forme que prodDiv, mais avec une somme : le cas de base vaut 0.",
  sol:M(`let rec sommeDiv : int -> int -> int = fun n i ->
  if i = 0 then 0
  else if n mod i = 0 then i + sommeDiv n (i - 1)
  else sommeDiv n (i - 1)`)},
 {src:"Sujet blanc n° 2 (inventé, modèle du partiel 2021) · Q5 · 3 pts",t:"nbPairs",en:"Définir la fonction nbPairs qui calcule le nombre d'éléments pairs d'une liste d'entiers. Exemples : nbPairs [6; 9; 4] vaut 2 ; nbPairs [3] vaut 0 ; nbPairs [] vaut 0. Donner la signature.",go:"pf-listes-rec",who:"Sujet et corrigé écrits par moi (vérifiés dans OCaml)",
  sol:M(`let rec nbPairs : int list -> int = function
  li -> if li = [] then 0
        else if List.hd li mod 2 = 0 then 1 + nbPairs (List.tl li)
        else nbPairs (List.tl li)`)},
 {src:"Sujet blanc n° 2 (inventé, modèle du partiel 2021) · Q6 · 4 pts",t:"oterPremiers",en:"Définir la fonction oterPremiers qui, étant donnés une liste li et un entier naturel n, calcule la liste li privée de ses n premiers éléments. Si li a moins de n éléments, le résultat est la liste vide. Exemples : (oterPremiers [3;2;4] 0) vaut [3;2;4] ; (oterPremiers [3;2;4] 2) vaut [4] ; (oterPremiers [3;2;4] 5) vaut []. Donner la signature.",go:"pf-listes-rec",who:"Sujet et corrigé écrits par moi (vérifiés dans OCaml)",hint:"Deux cas de base : la liste est vide, ou il n'y a plus rien à enlever. Dans les deux cas, on renvoie li.",
  sol:M(`let rec oterPremiers : int list -> int -> int list = fun li n ->
  if li = [] || n = 0 then li
  else oterPremiers (List.tl li) (n - 1)`)},
 {src:"CC octobre 2025 · Q1 · 3 pts",t:"Types, valeurs et signatures",en:`<p>(En tête du sujet de 2025 : 1 h, aucun document. Cette année, le mail du prof autorise une feuille A4 recto-verso.)</p><p>1. Indiquez les types et valeurs des expressions suivantes :</p>${M(`2 + (List.hd [4;2])
(5/4) :: (4/5) :: 0. :: []
List.hd(["100"]) < "2"`)}<p>2. Quelle est la signature (types du/des paramètre(s) et résultat) des fonctions suivantes ?</p>${M(`let f = function x ->
  if x > 10 then x < 100 else x = 0

let g = function (x, y) ->
  if x then List.hd y
  else List.hd (List.tl y)

let rec h = fun n x ->
  if n = 0 then x
  else h (n - 1) x`)}`,who:"Mon corrigé",go:"pf-signature",
  sol:`<p>1. <b>int, 6</b> : List.hd [4;2] vaut 4. <b>Erreur de type</b> : 5/4 et 4/5 sont des int (1 et 0), 0. est un float, et une liste n'a qu'un seul type. <b>bool, true</b> : les chaînes se comparent lettre par lettre, comme dans un dictionnaire, et "1" vient avant "2".</p><p>2. f : <b>int -> bool</b> (x > 10 force x : int ; les deux branches sont des comparaisons). g : <b>bool * 'a list -> 'a</b> (if x force x : bool ; List.hd y force y à être une liste, mais rien ne dit de quoi, d'où 'a). h : <b>int -> 'a -> 'a</b> (n = 0 force n : int ; x est renvoyé sans calcul, il peut être de n'importe quel type).</p><p>'a se lit « alpha » : n'importe quel type. Le site te disait que ce genre de type ne tomberait pas au CC ; ce sujet de 2025 en avait. Sache au moins le lire.</p>`},
 {src:"CC octobre 2025 · Q2 · 3 pts",t:"parite_opposee",en:"Définir en OCaml la fonction parite_opposee : ℕ × ℕ → Bool qui vérifie si deux entiers naturels ont des parités opposées. Attention : la fonction n'est pas récursive. Exemples : parite_opposee(2,7) vaut true ; parite_opposee(2,10) vaut false. (En tête du sujet : pour les questions 2 à 6, indiquer la signature de la fonction.)",who:"Mon corrigé",go:"pf-signature",
  sol:M(`let parite_opposee : int * int -> bool = function
  (x, y) -> x mod 2 <> y mod 2`)+`<p>Parités opposées : les restes dans la division par 2 sont différents. &lt;&gt; veut dire « différent de ». L'énoncé écrit parite_opposee(2,7), avec une virgule : la fonction prend un couple, d'où int * int -> bool. C'est le memeParite du partiel 2021, avec &lt;&gt; à la place de =.</p>`},
 {src:"CC octobre 2025 · Q3 · 4 pts",t:"mult",en:"Définir en OCaml la fonction récursive mult qui, étant donnés deux entiers naturels n et m, calcule le produit n × m sans utiliser la multiplication * sur les entiers d'OCaml (uniquement l'addition). Cela repose sur l'idée que n × m est égal à m + m + … + m (n fois). Exemples : mult 3 4 vaut 12 ; mult 6 7 vaut 42.",who:"Mon corrigé",go:"pf-rec-ex",
  sol:M(`let rec mult : int -> int -> int = fun n m ->
  if n = 0 then 0
  else m + mult (n - 1) m`)+`<p>n × m, c'est m ajouté n fois. Cas de base : 0 × m = 0. Sinon n × m = m + (n − 1) × m. mult 3 4 = 4 + mult 2 4 = 4 + 4 + mult 1 4 = 4 + 4 + 4 + mult 0 4 = 12. Les exemples écrivent mult 3 4, sans virgule : la fonction est curryfiée, d'où fun n m et int -> int -> int. Garde les parenthèses de mult (n - 1) m.</p>`},
 {src:"CC octobre 2025 · Q4 · 4 pts",t:"points_moyenne",en:"Définir en OCaml la fonction récursive points_moyenne qui, étant donnée une liste non vide de réels (de type float list) représentant des notes entre 0 et 20, calcule le nombre de points total au-dessus de la moyenne (10) sur l'ensemble des notes. Exemples : (points_moyenne [3.5; 8.5; 12.; 0.]) vaut 10.5 ; (points_moyenne [3.5; 10.; 8.]) vaut 0. ; (points_moyenne [13.5; 10.25; 8.]) vaut 0.75.",who:"Mon corrigé",go:"pf-listes-rec",
  sol:M(`let rec points_moyenne : float list -> float = function li ->
  if li = [] then 0.
  else (if List.hd li > 10. then List.hd li -. 10. else 0.)
       +. points_moyenne (List.tl li)`)+`<p>Pour chaque note au-dessus de 10, on compte ce qui dépasse : 12. compte pour 2. Tout est en float : 10. et 0. avec un point, -. et +. avec un point. La liste est non vide, mais le cas [] sert quand même d'arrêt.</p><p><b>Attention : les exemples du sujet ne collent pas avec la phrase.</b> Ce code, exécuté dans OCaml, donne 2. pour [3.5; 8.5; 12.; 0.] et 3.75 pour [13.5; 10.25; 8.], pas 10.5 et 0.75 ; le deuxième exemple, 0., est juste. Je n'ai pas trouvé d'autre lecture qui colle : ni la somme des notes au-dessus de 10 (12. et 23.75), ni les points au-dessus de la moyenne de la liste (8.5 et 2.92). Ce sont sans doute des fautes de frappe : avec 18.5 au lieu de 8.5, et 10.5 au lieu de 13.5, on trouve bien 10.5 et 0.75. Le jour du CC, si un exemple ne colle pas, suis la phrase et écris en une ligne ce que tu as compris.</p>`},
 {src:"CC octobre 2025 · Q5 · 4 pts",t:"supprimer_elem",en:"Définir en OCaml la fonction récursive supprimer_elem qui, étant donnés un élément e et une liste l, calcule la liste l où toutes les occurrences de e ont été supprimées. Exemples : (supprimer_elem 2 [2; 3; 2; 4]) vaut [3; 4] ; (supprimer_elem 2. [1.; 3.; 5.; 7.]) vaut [1.; 3.; 5.; 7.] ; (supprimer_elem 'a' []) vaut [].",who:"Mon corrigé",go:"pf-listes-rec",
  sol:M(`let rec supprimer_elem : 'a -> 'a list -> 'a list = fun e li ->
  if li = [] then []
  else if List.hd li = e then supprimer_elem e (List.tl li)
  else List.hd li :: supprimer_elem e (List.tl li)`)+`<p>Le schéma « garder ou enlever » de ta feuille : si la tête vaut e, on l'enlève (on ne la remet pas devant) ; sinon on la garde. Les exemples utilisent des int, des float et un caractère ('a') : la fonction marche pour tout type, d'où 'a -> 'a list -> 'a list. Si tu bloques sur 'a, écris int -> int list -> int list : le code est le même.</p>`},
 {src:"CC octobre 2025 · Q6 · 4 pts",t:"incr_list",en:"Définir en OCaml la fonction récursive incr_list qui, étant données une liste d'entiers li et une liste de booléens lb de mêmes longueurs, rend la liste li où un élément d'indice k est incrémenté si l'élément d'indice k dans lb est égal à true ; l'élément d'indice k dans li est inchangé dans le cas contraire (à savoir si l'élément d'indice k dans lb est égal à false). Exemples : (incr_list [1; 2; 3; 4; 5] [true; false; false; true; true]) vaut [2; 2; 3; 5; 6].",who:"Mon corrigé",go:"pf-listes-rec",
  sol:M(`let rec incr_list : int list -> bool list -> int list = fun li lb ->
  if li = [] then []
  else (if List.hd lb then List.hd li + 1 else List.hd li)
       :: incr_list (List.tl li) (List.tl lb)`)+`<p>On avance dans les deux listes en même temps : List.hd li va avec List.hd lb, et l'appel récursif reçoit les deux queues. « Incrémenter » veut dire ajouter 1. Les deux listes ont la même longueur, donc tester li = [] suffit.</p>`},
 {src:"Examen janvier 2022 · Ex. 1 · 7 pts sur 21",t:"Nombres de Fermat",en:`<p>F<sub>n</sub> = 2^(2^n) + 1 : F₀ = 3, F₁ = 5, F₂ = 17, F₃ = 257. Forme curryfiée dès qu'il y a deux arguments.</p><ol><li>pow x y calcule xʸ avec x ** y (sur des float), float_of_int et int_of_float.</li><li>fermat_nbr n rend F<sub>n</sub>.</li><li>is_fermat_rec p n teste s'il existe un nombre de Fermat égal à p de rang ≥ n (is_fermat_rec 15 2 = false car F₂ = 17 > 15), puis is_fermat p.</li><li>fermat_list n rend la liste des n premiers nombres de Fermat (ordre libre).</li></ol>`,who:"Mon corrigé (examen de janvier, mais ces questions sont dans ton programme)",go:"pf-rec-ex",
  hint:"Pour is_fermat_rec : calcule f = fermat_nbr n avec un let … in. Si f > p, c'est perdu ; sinon f = p, ou on essaie le rang n + 1.",
  sol:M(`let pow : int -> int -> int = fun x y ->
  int_of_float (float_of_int x ** float_of_int y)

let fermat_nbr : int -> int = function
  n -> pow 2 (pow 2 n) + 1

let rec is_fermat_rec : int -> int -> bool = fun p n ->
  let f = fermat_nbr n in
  if f > p then false
  else f = p || is_fermat_rec p (n + 1)

let is_fermat : int -> bool = function p -> is_fermat_rec p 0

let rec fermat_list : int -> int list = function
  n -> if n = 0 then []
       else fermat_nbr (n - 1) :: fermat_list (n - 1)
(* fermat_list 3 = [17; 5; 3] *)`)},
 {src:"Examen janvier 2024 · Ex. 1, questions 1 et 3",t:"Triplets de Pythagore",en:`<p>(x, y, z) est pythagoricien si x² + y² = z². Formule : pour n ≥ 1, (2n + 1, 2n² + 2n, 2n² + 2n + 1) est pythagoricien.</p><ol><li>est_pytha x y z vérifie la relation.</li><li>genere_pytha m rend la liste des triplets de la formule dont x, y, z ≤ m. genere_pytha 50 = [(3, 4, 5); (5, 12, 13); (7, 24, 25); (9, 40, 41)].</li></ol>`,who:"Mon corrigé (la question 2 utilise les exceptions, hors programme)",go:"pf-listes-construire",
  hint:"Écris une fonction auxiliaire avec un paramètre n en plus, qui commence à 1. z est le plus grand des trois : on s'arrête dès que z > m.",
  sol:M(`let est_pytha : int -> int -> int -> bool = fun x y z ->
  x * x + y * y = z * z

let rec genere_rec : int -> int -> (int * int * int) list = fun n m ->
  let x = 2 * n + 1 and y = 2 * n * n + 2 * n and z = 2 * n * n + 2 * n + 1 in
  if z > m then []
  else (x, y, z) :: genere_rec (n + 1) m

let genere_pytha : int -> (int * int * int) list = function m -> genere_rec 1 m`)}];

/* ---------- quiz ---------- */
const quiz=[
 {q:"Quel est le type de 7 / 2 et sa valeur ?",o:["float, 3.5","int, 3","int, 4","erreur"],a:1,e:"7 et 2 sont des int, donc / est la division entière : elle ne garde que la partie entière. 7 ÷ 2 = 3,5, donc 7 / 2 vaut 3, de type int. Pour garder la virgule, il faut des float : 7. /. 2. vaut 3.5.",link:"pf-types"},
 {q:"Quelle expression est bien typée ?",o:["3 * 4.","7. mod 2.","7. /. 2.","7.2 / 2"],a:2,e:"Les opérateurs float prennent un point.",link:"pf-types"},
 {q:"Pourquoi « if 3/2 < 2 then 4 < 5 else 4 + 5 » est-il refusé ?",o:["3/2 n'est pas un entier","Les deux branches n'ont pas le même type","Il manque des parenthèses","< ne marche pas sur les entiers"],a:1,e:"bool d'un côté, int de l'autre.",link:"pf-if"},
 {q:"Signature de function (x, y) -> if y then x + 1 else 2 * x ?",o:["int -> bool -> int","int * bool -> int","bool * int -> int","'a * 'b -> int"],a:1,e:"Question du partiel 2021. Un seul paramètre : le couple (x, y). x + 1 oblige x à être un int. if y oblige y à être un bool. Les deux branches, x + 1 et 2 * x, sont des int : le résultat est un int. Signature : int * bool -> int.",link:"pf-signature"},
 {q:"Quelle est la signature de fun x y -> x < List.hd(y) ?",o:["int -> int list -> bool","'a -> 'a list -> bool","'a * 'a list -> bool","'a -> 'b -> bool"],a:1,e:"< compare deux valeurs du même type quelconque.",link:"pf-poly"},
 {q:"Dans une fonction récursive sur une liste li, quelle condition repère le plus souvent le cas de base ?",o:["li = 0","li = []","List.hd li = []","List.tl li"],a:1,e:"On teste si la liste est vide : c'est la plus petite liste possible, et List.tl en rapproche à chaque appel.",link:"pf-listes-rec"},
 {q:"somElem li calcule la somme des éléments de la liste li. Que manque-t-il dans « else List.hd li + somElem List.tl li » ?",o:["Rien : OCaml applique List.tl à li, puis somElem au résultat","Des parenthèses : somElem (List.tl li)","Un match : List.hd ne s'utilise que dans un filtrage","Un ;; à la fin de la ligne"],a:1,e:"Sinon OCaml passe List.tl comme argument à somElem.",link:"pf-listes-rec"},
 {q:"tousPairs li teste si tous les éléments de la liste li sont pairs. Que vaut tousPairs [] ?",o:["false","true","0","[]"],a:1,e:"« Tous » sur la liste vide : vrai, et on combine avec &&.",link:"pf-listes-tests"},
 {q:"On écrit une fonction récursive maxListe li, qui renvoie le plus grand élément d'une liste non vide. Quelle condition repère le cas de base, celui où on répond sans appel récursif ?",o:["li = [] : la liste est vide","List.tl li = [] : la liste n'a qu'un élément","List.hd li = 0 : le premier élément vaut 0","max li"],a:1,e:"La liste n'est jamais vide : le cas le plus simple est donc la liste à un seul élément, dont le plus grand élément est List.hd li. On la reconnaît à List.tl li = [].",link:"pf-listes-tests"},
 {q:"liPairs li renvoie la liste des éléments pairs de li. Dans sa définition récursive, que renvoie-t-on quand le premier élément, List.hd li, est pair ?",o:["liPairs (List.tl li)","List.hd li :: liPairs (List.tl li)","List.hd li + liPairs (List.tl li)","[List.hd li]"],a:1,e:"On garde le premier élément : on le place devant, avec ::, la liste des éléments pairs du reste.",link:"pf-listes-construire"},
 {q:"En OCaml, que vaut 8 :: 3 ?",o:["[8; 3]","erreur de type","[8]","(8, 3)"],a:1,e:"À droite de ::, il faut une liste : 8 :: [3].",link:"pf-listes"},
 {q:"Quel est le type d'une fonction curryfiée qui prend deux entiers et renvoie un entier ?",o:["int * int -> int","int -> int -> int","(int, int) -> int","int list -> int"],a:1,e:"Curryfiée : les paramètres l'un après l'autre, une flèche par paramètre. On l'appelle par f a b. Le type int * int -> int est celui d'une fonction qui prend un couple.",link:"pf-fonctions"},
 {q:"Que vaut (8/3) :: (8 mod 3) :: [] ?",o:["[2.66; 2]","[2; 2]","[2; 3]","erreur"],a:1,e:"8 / 3 = 2 : la division entière coupe la virgule (8 ÷ 3 = 2,66…). 8 mod 3 = 2 : le reste, car 8 = 3 × 2 + 2. Les :: placent 2, puis 2, devant la liste vide : [2; 2], une int list.",link:"pf-listes"},
 {q:"Que vaut List.hd [\"un\"; \"deux\"] < \"trois\" ?",o:["true","false","erreur","\"un\""],a:1,e:"Ordre alphabétique : u après t.",link:"pf-types"},
 {q:"Que manque-t-il dans « let f n = if n = 0 then 0 else n + f (n - 1) » ?",o:["Un else","Le mot rec","Un match","Rien"],a:1,e:"Sans rec, f ne se connaît pas.",link:"pf-rec"},
 {q:"Pour une fonction récursive qui calcule un produit, le cas de base renvoie…",o:["0","1","n","[]"],a:1,e:"Élément neutre de la multiplication.",link:"pf-rec-ex"},
 {q:"Le cas de base d'une fonction qui fabrique une liste renvoie le plus souvent…",o:["0","[]","true","1"],a:1,e:"Une liste vide, à laquelle on ajoute les éléments avec ::.",link:"pf-listes-construire"},
 {q:"Dans un match, quel cas est choisi ?",o:["Le dernier qui correspond","Le premier qui correspond, de haut en bas","Le plus précis","Tous ceux qui correspondent"],a:1,e:"Le match essaie les cas dans l'ordre, de haut en bas, et prend le premier qui correspond ; les suivants sont ignorés. Un cas général (comme _ ou x) placé en premier cache donc tous ceux d'en dessous : mets les cas particuliers avant les cas généraux.",link:"pf-match"},
 {q:"Quel est le type de [[1; 2]; []; [8]] ?",o:["int list","int list list","'a list","erreur"],a:1,e:"Une liste de listes d'entiers.",link:"pf-lili"},
 {q:"En OCaml, que fait x :: li ?",o:["Ajoute x à la fin","Ajoute x au début","Colle deux listes","Supprime x"],a:1,e:"x est ajouté devant : 7 :: [2; 3] vaut [7; 2; 3].",link:"pf-listes"},
 {q:"Quel est le type de List.hd ?",o:["int list -> int","'a list -> 'a","'a -> 'a list","'a list -> 'a list"],a:1,e:"List.hd marche pour une liste de n'importe quel type 'a, et rend un élément de ce type : elle est polymorphe.",link:"pf-poly"},
 {q:"Que vaut let a = 1 and b = 1 and c = 2 in a = b = c ?",o:["true","false","erreur de type","1"],a:2,e:"(a = b) = c compare un bool à un int.",link:"pf-let"},
 {q:"On écrit une fonction récursive queDesUn n : elle renvoie true si tous les chiffres de l'entier n sont des 1 (comme 111), false sinon (comme 2312). Elle regarde le dernier chiffre, n mod 10, puis se rappelle sur n / 10. Quel est le cas de base ?",o:["n = 0 : renvoyer true","n < 10 : renvoyer n = 1","n = 1 : renvoyer true, et rien d'autre","n mod 10 = 1 : renvoyer true"],a:1,e:"Quand n < 10, il ne reste qu'un chiffre : la réponse est true s'il vaut 1 et false sinon, c'est-à-dire la valeur de n = 1. Avec « n mod 10 = 1 : renvoyer true », 21 serait accepté alors qu'il contient un 2.",link:"pf-rec-ex"}];

const recettes=({sec})=>`<div class="title-row"><h1>Recettes pas à pas</h1></div><p class="lead">Le contrôle est sur papier : pas d'OCaml pour te signaler une erreur. Applique ces étapes dans l'ordre, pour chaque fonction.</p>
 ${sec(1,"Écrire une fonction récursive en 5 étapes",`<div class="recipe"><ol>
  <li><b>La signature d'abord.</b> Quels paramètres, de quels types, et quel résultat ? Écris-la dans la définition, comme dans le cours : <code>let rec somElem : int list -> int = function li -></code>. Plusieurs paramètres : forme curryfiée, <code>fun n i -></code>.</li>
  <li><b>Le cas de base.</b> Que vaut la fonction pour la liste vide (ou pour n = 0, i = 0) ? Sers-toi d'un exemple de l'énoncé : somElem [] = 0.</li>
  <li><b>Le cas général.</b> Suppose que l'appel sur List.tl li (ou n − 1) donne la bonne réponse. Comment obtenir la réponse pour li à partir de List.hd li ? somElem [6; 9; 5] = 6 + somElem [9; 5].</li>
  <li><b>Traduis</b> : <code>if li = [] then (cas de base) else (… List.hd li … f (List.tl li) …)</code>.</li>
  <li><b>Déroule un exemple</b> de l'énoncé à la main, comme dans les fiches. Si tu ne retombes pas sur le résultat attendu, c'est le cas de base ou le cas général qui est faux.</li></ol></div>`)}
 ${sec(2,"Ce que dit l'énoncé, ce que tu écris",`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>L'énoncé demande</th><th>Cas de base</th><th>Cas général</th></tr></thead><tbody>
  <tr><td>une somme, une longueur, un nombre de…</td><td><code>0</code></td><td><code>… + f (List.tl li)</code></td></tr>
  <tr><td>un produit</td><td><code>1</code></td><td><code>… * f (List.tl li)</code></td></tr>
  <tr><td>« tous les éléments vérifient… »</td><td><code>true</code></td><td><code>(test sur List.hd li) && f (List.tl li)</code></td></tr>
  <tr><td>« il existe un élément qui… »</td><td><code>false</code></td><td><code>(test sur List.hd li) || f (List.tl li)</code></td></tr>
  <tr><td>une liste : garder certains éléments</td><td><code>[]</code></td><td><code>if (test) then List.hd li :: f (List.tl li) else f (List.tl li)</code></td></tr>
  <tr><td>une liste : transformer chaque élément</td><td><code>[]</code></td><td><code>(calcul sur List.hd li) :: f (List.tl li)</code></td></tr>
  <tr><td>une liste non vide (max, dernier)</td><td><code>if List.tl li = [] then List.hd li</code></td><td><code>… f (List.tl li) …</code></td></tr>
  <tr><td>les chiffres d'un entier</td><td><code>if n &lt; 10 then …</code></td><td><code>… n mod 10 … f (n / 10)</code></td></tr>
  <tr><td>les diviseurs de n jusqu'à i</td><td><code>if i = 0 then …</code></td><td><code>if n mod i = 0 then … f n (i - 1) else f n (i - 1)</code></td></tr></tbody></table></div>`)}
 ${sec(3,"Trouver un type ou une valeur",`<div class="recipe"><ol><li>Regarde les opérateurs : + - * / mod veulent des int, +. -. *. /. des float, && || not des bool, ^ des string.</li><li>Les deux branches d'un if ont le même type ; la condition est un bool.</li><li>À droite de ::, une liste ; à gauche, un élément du même type que ceux de la liste.</li><li>Calcule la valeur étape par étape, en écrivant chaque résultat intermédiaire.</li></ol><p>Entraîne-toi avec <a href="#/p/types">l'entraînement types et valeurs</a>.</p></div>`)}
 ${sec(4,"Avant de rendre ta copie",`<div class="paper"><b>Pour chaque fonction, vérifie :</b><ul><li>le mot <code>rec</code> si la fonction s'appelle elle-même ;</li><li>la signature écrite (et cohérente : int list, pas int) ;</li><li>la forme curryfiée dès qu'il y a deux paramètres ;</li><li>des parenthèses autour de chaque argument calculé : <code>f (List.tl li)</code>, <code>f (n - 1)</code> ;</li><li>un <code>else</code> pour chaque <code>if</code>, et le même type dans les deux branches ;</li><li>pas de List.hd sans avoir testé que la liste n'est pas vide ;</li><li>les opérateurs à point pour les float : <code>+.</code>, <code>*.</code>.</li></ul></div>`)}`;
const feuille=({sec})=>`<div class="title-row"><h1>Ma feuille à recopier</h1></div>
<p class="lead">Pas d'imprimante : cette feuille est faite pour être recopiée à la main, en écrivant gros. Chaque ligne du modèle est une ligne de ta feuille. Ce que veut dire chaque ligne, avec des exemples : <a href="#/pf/p/feuille2">Ma feuille expliquée</a>.</p>
${sec(1,"Quel format",`<p>Le mail du prof (5 novembre) le dit : « Le seul document autorisé est une feuille A4 recto-verso. » Donc une feuille <b>A4</b>, écrite des deux côtés, tenue en hauteur. Ce n'est pas A5 : tu as deux fois plus de place qu'en algo.</p>`)}
${sec(2,"Recto : les règles (36 lignes)",W.code(`TYPES
int: + - * / mod      7/2 = 3
float: +. -. *. /.    2. et 3.5
jamais int et float mélangés
float_of_int 3 = 3.   int_of_float 2.9 = 2
bool: && || not     = <> < > <= >=
string: "ab" ^ "c"
if c then a else b : c bool, a b même type
let a = 1 and b = 2 in ..  (b ne voit pas a)
FONCTIONS
function x -> ..   1 paramètre ou 1 couple
fun x y -> ..      plusieurs paramètres
let f : int -> int = function n -> 2*n + 1
let g : int * int -> bool =
  function (x, y) -> x < y       g (2, 3)
let h : int -> int -> int =
  fun a b -> a + b               h 2 3
signature: types paramètres -> résultat
RÉCURSIVITÉ  (let rec)
let rec f : int -> int = function n ->
  if n = 0 then base else .. f (n - 1) ..
f (n - 1) avec parenthèses
base: somme 0, produit 1, liste [],
  tous true, existe false
chiffres: n mod 10 dernier chiffre,
  n / 10 le reste, base n < 10
LISTES  [2; 3; 5]   [] vide
x :: li devant    li @ [x] à la fin
List.hd li premier   List.tl li le reste
let rec g : int list -> int = function li ->
  if li = [] then base
  else .. List.hd li .. g (List.tl li) ..
garder: List.hd li :: g (List.tl li)
enlever: g (List.tl li)
tous: test && g (..)  existe: test || g (..)
liste non vide: base List.tl li = []`,"txt"))}
${sec(3,"Verso : des modèles complets (42 lignes)",W.code(`MODÈLES (partiel 2021)
let memeParite : int * int -> bool =
  function (a, b) -> a mod 2 = b mod 2
let rec queDesUn : int -> bool = function n ->
  if n < 10 then n = 1
  else n mod 10 = 1 && queDesUn (n / 10)
(* produit des diviseurs de n qui sont <= i *)
let rec prodDiv : int -> int -> int = fun n i ->
  if i = 0 then 1
  else if n mod i = 0 then i * prodDiv n (i - 1)
  else prodDiv n (i - 1)
let rec somElem : int list -> int =
  function li -> if li = [] then 0
  else List.hd li + somElem (List.tl li)
let rec liPairs : int list -> int list =
  function li -> if li = [] then []
  else if List.hd li mod 2 = 0
  then List.hd li :: liPairs (List.tl li)
  else liPairs (List.tl li)
(* les n premiers éléments de li *)
let rec prefLong : int list -> int -> int list =
  fun li n -> if li = [] || n = 0 then []
  else List.hd li ::
       prefLong (List.tl li) (n - 1)
TYPE ET VALEUR
(8/3) :: (8 mod 3) :: []    int list  [2; 2]
List.hd [3.5; 1.] > 2.      bool  true
3 * 4.     erreur: int et float
if x then y else 3 : int (x bool, y int)
function (x, y) -> if y then x+1 else 2*x
     int * bool -> int
"100" < "2"   bool  true (lettre par lettre)
[1; 2.]    erreur: un seul type par liste
AU CAS OÙ  'a = n'importe quel type
List.hd : 'a list -> 'a
fun n x -> .. x renvoyé sans calcul
     int -> 'a -> 'a
PIÈGES
oublier rec ; f n - 1 sans parenthèses
[2, 3] = un seul élément (un couple)
if sans else ; = pour comparer (pas ==)
2 paramètres ou plus : curryfiée (fun)`,"txt"))}
${sec(4,"Comment la lire",`<p>« .. » remplace ce que tu écris toi-même, « base » la valeur du cas de base. Les modèles du verso sont les fonctions du partiel de 2021, avec mes corrigés : le jour du contrôle, cherche celui qui ressemble le plus à la question (un test sur les chiffres : queDesUn ; un calcul sur les diviseurs : prodDiv ; une somme sur une liste : somElem ; une liste à fabriquer : liPairs ou prefLong) et adapte-le.</p>`)}`;
const F2T=(head,rows,cc=[0,1])=>`<div style="overflow-x:auto"><table class="tbl"><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td>${cc.includes(i)?`<code>${esc(c)}</code>`:c.replace(/<(?![a-z\/])/g,"&lt;")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const F2V=(head,rows)=>F2T(head,rows,[0,1]);
const F2Q=(q,code,ok,ex)=>`<div class="qbox mq" data-ok="${esc(ok.join("§")).replace(/"/g,"&quot;")}"><p class="qtxt">${q}</p>${code?M(code):""}<div class="mq-row"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse" aria-label="Ta réponse"><button type="button" class="btn pri" data-mq="ok">Valider</button><button type="button" class="btn" data-mq="voir">Voir la réponse</button></div><div class="verdict" hidden></div><div class="expl" hidden><b>La réponse : <code>${esc(ok[0])}</code></b><br>${ex}</div></div>`;
const F2E=(titre,ligne,sens,corps)=>`<h3>${titre}</h3><p class="muted">Sur ta feuille :</p>${M(ligne)}<p><b>Ce que ça veut dire.</b> ${sens}</p>${corps}`;
const F2Z=(...q)=>`<p><b>Mini-quiz.</b> Écris ta réponse, puis « Valider ».</p><div style="display:grid;gap:12px;grid-template-columns:minmax(0,1fr)">${q.join("")}</div>`;
const feuille2=({sec})=>[
`<div class="title-row"><h1>Ma feuille expliquée</h1></div>
<p class="lead">Ta feuille A4, morceau par morceau. Pour chaque morceau : la ligne de ta feuille, ce qu'elle veut dire, beaucoup d'exemples, le piège, puis un mini-quiz pour vérifier que tu as compris. Cette page n'est pas à recopier : tu recopies <a href="#/pf/p/feuille">Ma feuille à recopier</a>.</p>
<p>Dans les quiz, écris la réponse comme OCaml l'écrirait : <code>[1; 2]</code> pour une liste, <code>3.</code> pour un float, <code>int -> bool</code> pour une signature. Les espaces ne comptent pas.</p>`,

sec(1,"Les règles d'OCaml à connaître avant tout",`<ol>
<li><b>OCaml calcule des expressions.</b> Une expression, c'est un calcul. Elle a une <b>valeur</b> (le résultat) et un <b>type</b> (la sorte de résultat).</li>
<li><b>Chaque chose a un seul type, et OCaml ne mélange jamais les types.</b> La plupart des erreurs du CC viennent de là.</li>
<li><b>let donne un nom, pour toujours.</b> Il n'y a pas de variable qui change, pas de boucle pour, pas de tant que.</li>
<li><b>Pour répéter, on utilise la récursivité</b> : une fonction qui s'appelle elle-même (let rec).</li>
<li><b>Pour appeler une fonction : son nom, un espace, l'argument.</b> Les parenthèses servent seulement à regrouper un calcul.</li>
<li><b>= compare.</b> Il pose une question et répond true ou false.</li></ol>
<p><b>Les types que tu vas croiser :</b></p>`+
F2T(["Tu écris","Ça vaut","Type","Ce que c'est"],[
["3 + 4","7","int","un entier"],
["2.5 +. 1.","3.5","float","un nombre à virgule"],
["3 < 5","true","bool","vrai ou faux"],
['"ab" ^ "c"','"abc"',"string","du texte"],
["[1; 2]","[1; 2]","int list","une liste d'entiers"],
["(2, true)","(2, true)","int * bool","un couple"]],[0,1,2])+
`<p><b>Appeler une fonction :</b></p>`+F2T(["Tu écris","Ce que ça fait"],[
["f 3","appelle f avec 3"],
["f (n - 1)","appelle f avec n − 1"],
["f n - 1","appelle f avec n, puis enlève 1 au résultat (le piège)"],
["g (2, 3)","appelle g avec le couple (2, 3)"],
["h 2 3","appelle h avec 2, puis avec 3"]],[0])+
F2Z(F2Q("Quel est le type de cette expression ?","10 > 3",["bool"],"Une comparaison répond vrai ou faux : son type est bool. Sa valeur est true."),
F2Q("Que vaut cette expression ?","4 * 5 - 2",["18"],"La multiplication passe avant la soustraction : 4 * 5 = 20, puis 20 − 2 = 18."),
F2Q("Quel est le type de cette expression ?",'"bonjour"',["string"],"Du texte entre guillemets : c'est un string."))),

sec(2,"Recto : les types",
F2E("Les entiers : int","int: + - * / mod      7/2 = 3","Les int sont les nombres sans virgule. <b>/ coupe la virgule</b> (on garde seulement la partie entière). <b>mod donne le reste</b> de la division.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["7 / 2","3","7 ÷ 2 = 3,5, on coupe la virgule"],
["2 / 5","0","2 ÷ 5 = 0,4, on coupe : 0"],
["10 / 3","3","10 ÷ 3 = 3,33…"],
["7 mod 2","1","7 = 2 × 3 + 1 : il reste 1"],
["10 mod 3","1","10 = 3 × 3 + 1"],
["12 mod 4","0","12 = 4 × 3 : il ne reste rien"],
["4725 mod 10","5","le reste par 10, c'est le dernier chiffre"],
["4725 / 10","472","on enlève le dernier chiffre"]])+
`<p><b>À quoi sert mod :</b></p>`+F2T(["Tu écris","Ça veut dire"],[
["n mod 2 = 0","n est pair"],
["n mod 2 = 1","n est impair"],
["n mod 3 = 0","n est divisible par 3"],
["n mod 10","le dernier chiffre de n"]],[0])+
`<p><b>Le piège.</b> Avec des int, 7 / 2 ne vaut pas 3,5. C'est 3.</p>`+
F2Z(F2Q("Que vaut cette expression ?","17 / 5",["3"],"17 ÷ 5 = 3,4. Avec des int, on coupe la virgule : 3."),
F2Q("Que vaut cette expression ?","17 mod 5",["2"],"17 = 5 × 3 + 2 : il reste 2."),
F2Q("Que vaut cette expression ?","9 mod 2",["1"],"9 = 2 × 4 + 1 : il reste 1. C'est normal, 9 est impair.")))+

F2E("Les nombres à virgule : float","float: +. -. *. /.    2. et 3.5","Un float s'écrit <b>toujours avec un point</b> : 2. ou 3.5. Ses opérations ont aussi un point : +. -. *. /.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["2.5 +. 1.","3.5","addition de float : +. avec un point"],
["3. *. 2.","6.","le résultat est un float, il garde son point"],
["7. /. 2.","3.5","avec des float, la division garde la virgule"],
["10. -. 0.5","9.5",""],
["3.5 > 2.","true","les comparaisons n'ont pas de point"]])+
`<p><b>Le piège.</b> 2 et 2. ne sont pas la même chose : 2 est un int, 2. est un float.</p>`+
F2Z(F2Q("Que vaut cette expression ?","7. /. 2.",["3.5"],"Ce sont des float : la division garde la virgule. 3.5."),
F2Q("Que vaut cette expression ?","1.5 +. 1.5",["3.","3.0"],"1,5 + 1,5 = 3. Le résultat est un float, donc il s'écrit 3. avec un point.")))+

F2E("Ne jamais mélanger int et float","jamais int et float mélangés","Un calcul avec un int et un float est une <b>erreur</b>. Il faut deux int avec + - * /, ou deux float avec +. -. *. /.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["3 + 2","5","deux int, opération des int : bon"],
["3. +. 2.5","5.5","deux float, opération des float : bon"],
["3 + 2.5","erreur","2.5 n'est pas un int"],
["3 +. 2.5","erreur","3 n'est pas un float"],
["2 * 3.","erreur","3. n'est pas un int"]])+
`<p><b>Le piège.</b> Au CC, une question « type et valeur » cache souvent ce piège. La bonne réponse est alors « erreur de type ».</p>`+
F2Z(F2Q("Que vaut cette expression ?","4 + 1.",["erreur","~erreur"],"4 est un int, 1. est un float : on ne peut pas les additionner. C'est une erreur de type."),
F2Q("Que vaut cette expression ?","4. +. 1.",["5.","5.0"],"Deux float avec +. : le résultat est le float 5.")))+

F2E("Passer de l'un à l'autre","float_of_int 3 = 3.   int_of_float 2.9 = 2","float_of_int transforme un int en float. int_of_float transforme un float en int, <b>en coupant</b> la virgule (sans arrondir).",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["float_of_int 3","3.","le même nombre, en float"],
["int_of_float 2.9","2","on coupe : 2,9 devient 2, pas 3"],
["int_of_float 7.5","7",""],
["float_of_int 7 /. 2.","3.5","on transforme 7 en 7., puis division de float"]])+
F2Z(F2Q("Que vaut cette expression ?","int_of_float 9.99",["9"],"int_of_float coupe la virgule, il n'arrondit pas : 9."),
F2Q("Que vaut cette expression ?","float_of_int 5",["5.","5.0"],"Le même nombre, transformé en float : 5. avec un point.")))+

F2E("Vrai ou faux : bool","bool: && || not     = <> < > <= >=","Un bool vaut true (vrai) ou false (faux). <b>&amp;&amp;</b> veut dire « et » : il faut que les deux soient vrais. <b>||</b> veut dire « ou » : il suffit qu'un des deux soit vrai. <b>not</b> inverse.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["true && false","false","« et » : il faut les deux"],
["true || false","true","« ou » : un seul suffit"],
["not true","false","not inverse"],
["3 <> 4","true","<> veut dire « différent de »"],
["3 <= 3","true","<= veut dire « plus petit ou égal »"],
["5 > 2 && 1 > 4","false","5 > 2 est vrai, mais 1 > 4 est faux"],
["5 > 2 || 1 > 4","true","5 > 2 est vrai, ça suffit"]])+
F2Z(F2Q("Que vaut cette expression ?","2 < 3 || 5 < 1",["true"],"2 < 3 est vrai. Avec || (ou), un seul vrai suffit : true."),
F2Q("Que vaut cette expression ?","not (4 = 4)",["false"],"4 = 4 est vrai, et not inverse : false."),
F2Q("Que vaut cette expression ?","6 <> 6",["false"],"<> veut dire « différent de ». 6 n'est pas différent de 6 : false.")))+

F2E("Le texte : string",'string: "ab" ^ "c"',"Un string est du texte entre guillemets. <b>^ colle</b> deux textes l'un après l'autre. Deux textes se comparent <b>lettre par lettre</b>, comme dans un dictionnaire.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
['"ab" ^ "c"','"abc"',"on colle"],
['"bon" ^ "jour"','"bonjour"',""],
['"12" ^ "3"','"123"',"ce sont des textes : on colle, on n'additionne pas"],
['"100" < "2"',"true","1re lettre : 1 vient avant 2, c'est fini"],
['"chat" < "chien"',"true","c = c, h = h, puis a vient avant i"]])+
F2Z(F2Q("Que vaut cette expression ?",'"ab" ^ "ab"',['"abab"'],"^ colle les deux textes : \"abab\"."),
F2Q("Que vaut cette expression ?",'"9" < "10"',["false"],"Lettre par lettre : on compare d'abord \"9\" et \"1\". 9 vient après 1, donc \"9\" n'est pas plus petit : false. Ce sont des textes, pas des nombres.")))+

F2E("if … then … else","if c then a else b : c bool, a b même type","if pose une question c (un bool). Si la réponse est vraie, le if vaut a ; sinon il vaut b. Le else est <b>obligatoire</b>, et a et b ont <b>le même type</b>.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
['if 5 > 3 then "oui" else "non"','"oui"',"5 > 3 est vrai : on prend la partie then"],
["if 2 > 3 then 10 else 20","20","2 > 3 est faux : on prend la partie else"],
["if true then 1 else 2.5","erreur","un int d'un côté, un float de l'autre"],
["if 3 then 1 else 2","erreur","3 n'est pas un bool : on ne peut pas poser la question"]])+
F2Z(F2Q("Que vaut cette expression ?",'if 4 mod 2 = 0 then "pair" else "impair"',['"pair"'],"4 mod 2 = 0 est vrai (4 est pair), donc on prend la partie then : \"pair\"."),
F2Q("Quel est le type de cette expression ?","if 1 < 2 then 3. else 4.",["float"],"Les deux branches sont des float (3. et 4.) : le if tout entier est un float.")))+

F2E("let … in","let a = 1 and b = 2 in ..  (b ne voit pas a)","let … in donne un nom à une valeur, pour le calcul qui suit le in. Avec and, on définit plusieurs noms en même temps.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["let a = 1 in a + 2","3","a vaut 1, donc a + 2 = 3"],
["let a = 2 and b = 5 in a * b","10","a vaut 2, b vaut 5"],
["let a = 1 in let b = a + 1 in a + b","3","b = 1 + 1 = 2, puis 1 + 2 = 3"],
["let a = 1 and b = a + 1 in b","erreur","avec and, b ne connaît pas encore a"]])+
`<p><b>Le piège.</b> Si b a besoin de a, n'utilise pas and : enchaîne deux let … in.</p>`+
F2Z(F2Q("Que vaut cette expression ?","let x = 4 in x * x",["16"],"x vaut 4, donc x * x = 16."),
F2Q("Que vaut cette expression ?","let a = 3 in let b = a * 2 in a + b",["9"],"a = 3, puis b = 3 × 2 = 6, puis a + b = 9.")))),

sec(3,"Recto : les fonctions",
F2E("function : un seul paramètre, ou un couple","function x -> ..   1 paramètre ou 1 couple","function x -> … fabrique une fonction : « je reçois x, je rends … ». Elle n'accepte qu'<b>un</b> paramètre. Pour lui en donner deux, on les met dans un <b>couple</b> : (x, y), avec une virgule.",
M(`let double = function x -> 2 * x
double 5        (* vaut 10 *)
double 0        (* vaut 0 *)

let somme2 = function (x, y) -> x + y
somme2 (3, 4)   (* vaut 7 *)
somme2 (10, 1)  (* vaut 11 *)`)+
`<p>(* … *) est un commentaire : OCaml ne le lit pas.</p>`+
F2Z(F2Q("Que vaut triple 4 ?","let triple = function x -> 3 * x",["12"],"triple reçoit 4 et rend 3 × 4 = 12."),
F2Q("Que vaut f (10, 3) ?","let f = function (a, b) -> a - b",["7"],"f reçoit le couple (10, 3) : a = 10, b = 3. Elle rend 10 − 3 = 7.")))+

F2E("fun : plusieurs paramètres","fun x y -> ..      plusieurs paramètres","fun accepte plusieurs paramètres, séparés par des espaces. On l'appelle aussi avec des espaces, sans virgule. On dit que la fonction est « curryfiée ».",
M(`let plus = fun a b -> a + b
plus 2 3        (* vaut 5 *)

let moins = fun a b -> a - b
moins 10 4      (* vaut 6 *)`)+
`<p><b>Comment choisir au CC : regarde les exemples de l'énoncé.</b></p>`+F2T(["L'énoncé écrit","Donc","Tu écris"],[
["parite(2,7)","une virgule : un couple","function (x, y) -> …"],
["mult 3 4","des espaces : deux paramètres","fun n m -> …"]],[0,2])+
F2Z(F2Q("L'énoncé dit : « plusGrand(4, 9) vaut 9 ». Tu écris function (a, b) ou fun a b ?","",["function (a, b)","function","function (x, y)","couple"],"Il y a une virgule entre 4 et 9 : c'est un couple. Donc function (a, b) -> …"),
F2Q("L'énoncé dit : « puissance 2 3 vaut 8 ». Tu écris function (a, b) ou fun a b ?","",["fun a b","fun","fun x y","fun n m"],"Il n'y a pas de virgule : deux paramètres séparés par un espace. Donc fun a b -> …")))+

F2E("Lire une signature","let f : int -> int = function n -> 2*n + 1","La partie « : int -> int » est la <b>signature</b>. Elle dit ce que la fonction reçoit et ce qu'elle rend. Les types avant les flèches sont les paramètres ; le <b>dernier</b> est le résultat. Les sujets demandent de l'écrire : mets-la toujours.",
F2T(["Signature","Se lit"],[
["int -> int","reçoit un int, rend un int"],
["int -> bool","reçoit un int, rend un bool"],
["int * int -> bool","reçoit un couple de deux int, rend un bool (ici * veut dire « et »)"],
["int -> int -> int","reçoit un int, puis un int, rend un int"],
["int list -> int","reçoit une liste d'int, rend un int"],
["float list -> float","reçoit une liste de float, rend un float"]],[0])+
M(`let g : int * int -> bool =
  function (x, y) -> x < y
g (2, 3)        (* vaut true *)

let h : int -> int -> int =
  fun a b -> a + b
h 2 3           (* vaut 5 *)`)+
F2Z(F2Q("Quelle est la signature de cette fonction ?","function n -> n mod 2 = 0",["int -> bool"],"n mod 2 : n est un int. On rend une comparaison (= 0), donc un bool. Signature : int -> bool."),
F2Q("Quelle est la signature de cette fonction ?","fun a b -> a + b",["int -> int -> int"],"Deux paramètres (fun a b). a + b avec + : a et b sont des int, et le résultat aussi. Signature : int -> int -> int."),
F2Q("Quelle est la signature de cette fonction ?","function (x, y) -> x *. y",["float * float -> float"],"Un couple. *. avec un point : x et y sont des float, le résultat aussi. Signature : float * float -> float.")))+

F2E("Trouver une signature : la méthode","signature: types paramètres -> résultat","Trois questions, dans l'ordre.",
`<ol><li><b>Combien de paramètres, et sous quelle forme ?</b> function (x, y) : un couple. fun a b : plusieurs.</li><li><b>Le type de chaque paramètre</b> : regarde ce qu'on en fait.</li><li><b>Le type du résultat</b> : celui de ce que la fonction rend.</li></ol>`+
F2T(["Ce qu'on fait avec x","Donc x est"],[
["x + 1, x * 2, x mod 2","int"],
["x +. 1., x *. 2.","float"],
["if x then …, x && …","bool"],
["List.hd x, List.tl x","une liste"],
['x ^ "a"',"string"]],[0])+
`<p><b>Exemple, en entier.</b></p>`+M(`function (x, y) -> x * 2 < List.hd y`)+
`<ol><li>Un couple (x, y).</li><li>x * 2 : x est un int. List.hd y est comparé à x * 2, un int : y est une liste d'int, int list.</li><li>On rend une comparaison : un bool.</li></ol><p>Signature : <code>int * int list -> bool</code>.</p>`+
F2Z(F2Q("Quelle est la signature de cette fonction ?","function (a, b) -> if a > 0 then b else b +. 1.",["int * float -> float"],"Un couple. a > 0 : a est un int. b +. 1. : b est un float. On rend b ou b +. 1., des float. Signature : int * float -> float."),
F2Q("Quelle est la signature de cette fonction ?","fun li x -> List.hd li + x",["int list -> int -> int"],"Deux paramètres. List.hd li : li est une liste. List.hd li + x avec + : tout est int, donc li est une int list et x un int. On rend un int. Signature : int list -> int -> int.")))),

sec(4,"Recto : la récursivité",
F2E("let rec et le squelette","let rec f : int -> int = function n ->\n  if n = 0 then base else .. f (n - 1) ..","Une fonction récursive s'appelle elle-même. Il faut écrire <b>let rec</b>. Deux cas : quand n = 0, on donne la réponse directement (la « base ») ; sinon, on fait confiance à f (n - 1) et on s'en sert pour fabriquer la réponse pour n.",
`<p><b>Exemple 1 : la somme 1 + 2 + … + n.</b></p>`+M(`let rec somme : int -> int = function n ->
  if n = 0 then 0
  else n + somme (n - 1)`)+`<p>Ce que calcule somme 3, ligne par ligne :</p>`+M(`somme 3
= 3 + somme 2
= 3 + 2 + somme 1
= 3 + 2 + 1 + somme 0
= 3 + 2 + 1 + 0
= 6`)+
`<p><b>Exemple 2 : le produit 1 × 2 × … × n</b> (on l'appelle factorielle).</p>`+M(`let rec fact : int -> int = function n ->
  if n = 0 then 1
  else n * fact (n - 1)`)+M(`fact 4
= 4 * fact 3
= 4 * 3 * fact 2
= 4 * 3 * 2 * fact 1
= 4 * 3 * 2 * 1 * fact 0
= 4 * 3 * 2 * 1 * 1
= 24`)+
`<p><b>Le piège.</b> Sans rec, OCaml ne connaît pas encore le nom de la fonction quand il lit son corps : il répond « Unbound value ».</p>`+
F2Z(F2Q("Que vaut f 3 ?","let rec f = function n ->\n  if n = 0 then 0 else 2 + f (n - 1)",["6"],"f 3 = 2 + f 2 = 2 + 2 + f 1 = 2 + 2 + 2 + f 0 = 2 + 2 + 2 + 0 = 6."),
F2Q("Que vaut g 2 ?","let rec g = function n ->\n  if n = 0 then 1 else 3 * g (n - 1)",["9"],"g 2 = 3 * g 1 = 3 * 3 * g 0 = 3 * 3 * 1 = 9.")))+

F2E("Les parenthèses de f (n - 1)","f (n - 1) avec parenthèses","Un appel de fonction passe toujours avant les calculs autour. Sans parenthèses, f n - 1 se lit (f n) - 1.",
F2T(["Tu écris","OCaml comprend","Résultat"],[
["f (n - 1)","appelle f avec n − 1","bon"],
["f n - 1","appelle f avec n, puis enlève 1","f se rappelle avec n, encore et encore : ne s'arrête jamais"]],[0])+
F2Z(F2Q("Que se passe-t-il quand on calcule f 2 ?","let rec f = function n ->\n  if n = 0 then 0 else 1 + f n - 1",["ça ne s'arrête jamais","~boucle","~infini","~jamais","~arrêtepas","~arretepas"],"f n - 1 se lit (f n) - 1. Donc f 2 appelle f 2, qui appelle f 2… La fonction ne s'arrête jamais. Il fallait écrire f (n - 1).")))+

F2E("Que rendre dans le cas de base ?","base: somme 0, produit 1, liste [],\n  tous true, existe false","La base est la valeur qui ne change rien au calcul.",
F2T(["Ce qu'on calcule","Base","Pourquoi"],[
["une somme","0","ajouter 0 ne change rien"],
["un produit","1","multiplier par 1 ne change rien (avec 0, tout vaudrait 0)"],
["un nombre d'éléments","0","une liste vide a 0 élément"],
["une liste qu'on fabrique","[]","on part de la liste vide"],
["« tous vérifient … »","true","dans une liste vide, personne ne contredit"],
["« il en existe un qui … »","false","dans une liste vide, on n'a trouvé personne"]],[1])+
F2Z(F2Q("Une fonction calcule le produit des éléments d'une liste. Que rend-elle pour la liste vide [] ?","",["1"],"Un produit part de 1 : multiplier par 1 ne change rien. Avec 0, le produit vaudrait toujours 0."),
F2Q("Une fonction répond à « Y a-t-il un nombre négatif dans la liste ? ». Que rend-elle pour [] ?","",["false"],"C'est un « il existe ». Dans une liste vide, il n'y a aucun nombre, donc aucun négatif : false.")))+

F2E("Les chiffres d'un nombre","chiffres: n mod 10 dernier chiffre,\n  n / 10 le reste, base n < 10","Pour travailler sur les chiffres : n mod 10 donne le dernier chiffre, n / 10 enlève le dernier chiffre. On s'arrête quand il ne reste qu'un chiffre : n &lt; 10.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["4725 mod 10","5","le dernier chiffre"],
["4725 / 10","472","le nombre sans son dernier chiffre"],
["472 mod 10","2",""],
["7 < 10","true","7 n'a qu'un chiffre : c'est la base"]])+
`<p><b>Exemple : la somme des chiffres.</b></p>`+M(`let rec sommeChiffres : int -> int = function n ->
  if n < 10 then n
  else n mod 10 + sommeChiffres (n / 10)`)+M(`sommeChiffres 472
= 2 + sommeChiffres 47
= 2 + 7 + sommeChiffres 4
= 2 + 7 + 4
= 13`)+
F2Z(F2Q("Que vaut cette expression ?","368 mod 10",["8"],"Le reste par 10 : le dernier chiffre, 8."),
F2Q("Que vaut cette expression ?","368 / 10",["36"],"On enlève le dernier chiffre : 36."),
F2Q("Avec la fonction sommeChiffres ci-dessus, que vaut sommeChiffres 205 ?","",["7"],"sommeChiffres 205 = 5 + sommeChiffres 20 = 5 + 0 + sommeChiffres 2 = 5 + 0 + 2 = 7.")))),

sec(5,"Recto : les listes",
F2E("Écrire une liste","LISTES  [2; 3; 5]   [] vide","Une liste s'écrit entre crochets, avec des <b>points-virgules</b>. [] est la liste vide. Tous les éléments ont le même type.",
F2V(["Tu écris","Type","Pourquoi"],[
["[2; 3; 5]","int list","une liste d'int"],
["[]","liste vide",""],
["[1.5; 2.]","float list",""],
['["a"; "b"]',"string list",""],
["[1; 2.]","erreur","un int et un float dans la même liste"],
["[2, 3]","(int * int) list","une virgule fait un couple : une liste d'un seul élément, le couple (2, 3)"]])+
F2Z(F2Q("Quel est le type de cette liste ?","[true; false]",["bool list"],"Ses éléments sont des bool : c'est une bool list."),
F2Q("Combien d'éléments a cette liste ?","[4, 5]",["1"],"La virgule fabrique un couple : [4, 5] contient un seul élément, le couple (4, 5). Pour deux éléments, il faut [4; 5].")))+

F2E("Ajouter devant, coller à la fin","x :: li devant    li @ [x] à la fin",":: ajoute <b>un élément devant</b> une liste. @ <b>colle deux listes</b>. Pour ajouter un élément à la fin, il faut le mettre entre crochets.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["1 :: [2; 3]","[1; 2; 3]","1 se met devant"],
["1 :: []","[1]","devant la liste vide"],
["1 :: 2 :: []","[1; 2]","on lit de droite à gauche : 2 devant [], puis 1 devant"],
["[1; 2] @ [3]","[1; 2; 3]","on colle deux listes"],
["[1] @ [2; 3]","[1; 2; 3]",""],
["[1; 2] @ 3","erreur","3 n'est pas une liste : il faut [3]"]])+
F2Z(F2Q("Que vaut cette expression ?","5 :: [6; 7]",["[5; 6; 7]"],"5 se met devant : [5; 6; 7]."),
F2Q("Que vaut cette expression ?","[5; 6] @ [7]",["[5; 6; 7]"],"@ colle les deux listes : [5; 6; 7]."),
F2Q("Que vaut cette expression ?","0 :: 1 :: []",["[0; 1]"],"D'abord 1 :: [] = [1], puis 0 devant : [0; 1].")))+

F2E("Le premier, et le reste","List.hd li premier   List.tl li le reste","List.hd donne le <b>premier élément</b> (un élément). List.tl donne la <b>liste sans le premier</b> (une liste). Les deux font une erreur sur la liste vide.",
F2V(["Tu écris","Ça vaut","Pourquoi"],[
["List.hd [7; 1; 5]","7","le premier élément, un int"],
["List.tl [7; 1; 5]","[1; 5]","le reste, une int list"],
["List.tl [5]","[]","une liste d'un élément : il ne reste rien"],
["List.hd []","erreur","une liste vide n'a pas de premier élément"],
["List.hd (List.tl [7; 1; 5])","1","le reste est [1; 5], son premier est 1"]])+
F2Z(F2Q("Que vaut cette expression ?","List.hd [9; 4; 2]",["9"],"Le premier élément : 9."),
F2Q("Que vaut cette expression ?","List.tl [9; 4; 2]",["[4; 2]"],"La liste sans son premier élément : [4; 2]."),
F2Q("Que vaut cette expression ?","List.hd (List.tl [9; 4; 2])",["4"],"List.tl [9; 4; 2] = [4; 2], puis son premier élément : 4.")))+

F2E("Le squelette pour une liste","let rec g : int list -> int = function li ->\n  if li = [] then base\n  else .. List.hd li .. g (List.tl li) ..","Même idée que pour un entier : la liste vide joue le rôle de 0, et List.tl li celui de n − 1. On s'occupe du premier élément ; la fonction s'occupe du reste.",
`<p><b>Exemple : la longueur d'une liste.</b></p>`+M(`let rec longueur : int list -> int = function li ->
  if li = [] then 0
  else 1 + longueur (List.tl li)`)+M(`longueur [7; 1; 5]
= 1 + longueur [1; 5]
= 1 + 1 + longueur [5]
= 1 + 1 + 1 + longueur []
= 1 + 1 + 1 + 0
= 3`)+
F2Z(F2Q("Que vaut f [3; 4; 5] ?","let rec f = function li ->\n  if li = [] then 0\n  else List.hd li + f (List.tl li)",["12"],"f [3; 4; 5] = 3 + f [4; 5] = 3 + 4 + f [5] = 3 + 4 + 5 + f [] = 3 + 4 + 5 + 0 = 12. C'est la somme des éléments."),
F2Q("Que vaut g [8; 8; 8; 8] ?","let rec g = function li ->\n  if li = [] then 0\n  else 1 + g (List.tl li)",["4"],"g ajoute 1 pour chaque élément, sans regarder sa valeur : c'est la longueur. 4.")))+

F2E("Garder ou enlever des éléments","garder: List.hd li :: g (List.tl li)\nenlever: g (List.tl li)","Pour fabriquer une liste. Garder le premier élément : on le remet devant le résultat du reste. L'enlever : on rend seulement le résultat du reste.",
`<p><b>Exemple : garder les nombres plus grands que 0.</b></p>`+M(`let rec positifs : int list -> int list = function li ->
  if li = [] then []
  else if List.hd li > 0 then List.hd li :: positifs (List.tl li)
  else positifs (List.tl li)`)+M(`positifs [3; -1; 4]
= 3 :: positifs [-1; 4]      (3 > 0 : on garde)
= 3 :: positifs [4]          (-1 : on enlève)
= 3 :: 4 :: positifs []      (4 > 0 : on garde)
= 3 :: 4 :: []
= [3; 4]`)+
F2Z(F2Q("Avec la fonction positifs ci-dessus, que vaut positifs [-2; 5; 0; 7] ?","",["[5; 7]"],"−2 : enlevé. 5 : gardé. 0 : enlevé, car 0 > 0 est faux. 7 : gardé. Résultat : [5; 7].")))+

F2E("« Tous » et « il existe »","tous: test && g (..)  existe: test || g (..)","« Tous vérifient » : le premier vérifie <b>et</b> tous les autres aussi (&amp;&amp;, base true). « Il en existe un » : le premier vérifie <b>ou</b> il y en a un dans le reste (||, base false).",
M(`let rec tousPositifs : int list -> bool = function li ->
  if li = [] then true
  else List.hd li > 0 && tousPositifs (List.tl li)

let rec contientZero : int list -> bool = function li ->
  if li = [] then false
  else List.hd li = 0 || contientZero (List.tl li)`)+M(`tousPositifs [2; 5]
= 2 > 0 && tousPositifs [5]
= true && 5 > 0 && tousPositifs []
= true && true && true
= true`)+
F2Z(F2Q("Que vaut tousPositifs [4; -1; 6] ?","",["false"],"4 > 0 est vrai, mais −1 > 0 est faux. Avec &amp;&amp;, un seul faux suffit : false."),
F2Q("Que vaut contientZero [3; 0; 2] ?","",["true"],"3 = 0 est faux, mais 0 = 0 est vrai. Avec ||, un seul vrai suffit : true.")))+

F2E("Une liste non vide","liste non vide: base List.tl li = []","Quand l'énoncé dit « liste non vide », c'est souvent que la liste vide n'a pas de réponse (son plus grand élément, son dernier…). La base est alors une liste d'<b>un seul</b> élément : List.tl li = [].",
`<p><b>Exemple : le plus grand élément.</b></p>`+M(`let rec maxi : int list -> int = function li ->
  if List.tl li = [] then List.hd li
  else let m = maxi (List.tl li) in
       if List.hd li > m then List.hd li else m`)+M(`maxi [3; 9; 4]
   maxi [4] = 4                 (un seul élément)
   maxi [9; 4] : 9 > 4, donc 9
maxi [3; 9; 4] : 3 > 9 ? non, donc 9`)+
F2Z(F2Q("Que vaut maxi [2; 8; 5] ?","",["8"],"maxi [5] = 5 ; maxi [8; 5] : 8 > 5, donc 8 ; maxi [2; 8; 5] : 2 > 8 ? non, donc 8.")))),

sec(6,"Verso : les six modèles",`<p>Six fonctions complètes et corrigées, celles du partiel 2021. Le jour du CC, cherche celle qui ressemble le plus à la question, et adapte-la.</p>`+
F2E("memeParite","let memeParite : int * int -> bool =\n  function (a, b) -> a mod 2 = b mod 2","Vrai si deux entiers ont la même parité (tous les deux pairs, ou tous les deux impairs) : ils ont le même reste dans la division par 2. Elle n'est pas récursive. <b>Sert pour</b> un test simple sur un couple.",
M(`memeParite (4, 6)
= 4 mod 2 = 6 mod 2
= 0 = 0
= true

memeParite (4, 3)
= 0 = 1
= false`)+`<p>Pour « parités opposées », remplace = par &lt;>.</p>`+
F2Z(F2Q("Que vaut memeParite (7, 2) ?","",["false"],"7 mod 2 = 1 et 2 mod 2 = 0. 1 = 0 est faux : false.")))+
F2E("queDesUn","let rec queDesUn : int -> bool = function n ->\n  if n < 10 then n = 1\n  else n mod 10 = 1 && queDesUn (n / 10)","Vrai si n ne s'écrit qu'avec des 1 (1, 11, 111…). Base : un seul chiffre, qui doit valoir 1. Sinon : le dernier chiffre vaut 1, <b>et</b> le reste n'a que des 1. <b>Sert pour</b> « tous les chiffres vérifient … ».",
M(`queDesUn 111
= 111 mod 10 = 1 && queDesUn 11
= true && (11 mod 10 = 1 && queDesUn 1)
= true && true && (1 = 1)
= true`)+
F2Z(F2Q("Que vaut queDesUn 101 ?","",["false"],"101 mod 10 = 1 : bon. Puis queDesUn 10 : 10 mod 10 = 0, ce n'est pas 1. Donc false.")))+
F2E("prodDiv","let rec prodDiv : int -> int -> int = fun n i ->\n  if i = 0 then 1\n  else if n mod i = 0 then i * prodDiv n (i - 1)\n  else prodDiv n (i - 1)","Multiplie les diviseurs de n qui sont plus petits que i, ou égaux. n ne bouge pas ; i descend jusqu'à 0. Si i divise n (n mod i = 0), on le multiplie ; sinon on passe. Base 1, car c'est un produit. <b>Sert pour</b> parcourir les nombres de i jusqu'à 1 : diviseurs, sommes, comptages.",
M(`prodDiv 6 3
= 3 * prodDiv 6 2        (6 mod 3 = 0 : 3 divise 6)
= 3 * 2 * prodDiv 6 1    (6 mod 2 = 0)
= 3 * 2 * 1 * prodDiv 6 0
= 3 * 2 * 1 * 1
= 6`)+`<p>Pour tous les diviseurs de n, on appelle prodDiv n n.</p>`+
F2Z(F2Q("Que vaut prodDiv 10 10 ?","",["100"],"Les diviseurs de 10 sont 1, 2, 5 et 10. Leur produit : 1 × 2 × 5 × 10 = 100.")))+
F2E("somElem","let rec somElem : int list -> int =\n  function li -> if li = [] then 0\n  else List.hd li + somElem (List.tl li)","La somme des éléments : le premier, plus la somme du reste. Base 0. <b>Sert pour</b> les sommes ; pour compter les éléments, remplace List.hd li par 1.",
F2Z(F2Q("Que vaut somElem [1; 2; 3; 4] ?","",["10"],"1 + 2 + 3 + 4 + 0 = 10.")))+
F2E("liPairs","let rec liPairs : int list -> int list =\n  function li -> if li = [] then []\n  else if List.hd li mod 2 = 0\n  then List.hd li :: liPairs (List.tl li)\n  else liPairs (List.tl li)","Garde les éléments pairs, dans le même ordre. <b>Sert pour</b> toutes les questions « la liste des éléments qui … » ou « supprimer les … ».",
M(`liPairs [1; 4; 6; 7]
= liPairs [4; 6; 7]            (1 impair : enlevé)
= 4 :: liPairs [6; 7]          (4 pair : gardé)
= 4 :: 6 :: liPairs [7]
= 4 :: 6 :: liPairs []         (7 impair : enlevé)
= [4; 6]`)+
F2Z(F2Q("Que vaut liPairs [2; 3; 8] ?","",["[2; 8]"],"2 pair : gardé. 3 impair : enlevé. 8 pair : gardé. [2; 8].")))+
F2E("prefLong","let rec prefLong : int list -> int -> int list =\n  fun li n -> if li = [] || n = 0 then []\n  else List.hd li ::\n       prefLong (List.tl li) (n - 1)","Les n premiers éléments de li. On s'arrête quand la liste est vide, ou quand on en a pris assez (n = 0). Sinon, on garde le premier et on demande les n − 1 suivants. <b>Sert pour</b> les exercices avec une liste et un compteur.",
M(`prefLong [4; 7; 1; 9] 2
= 4 :: prefLong [7; 1; 9] 1
= 4 :: 7 :: prefLong [1; 9] 0
= 4 :: 7 :: []
= [4; 7]`)+
F2Z(F2Q("Que vaut prefLong [5; 6; 7] 5 ?","",["[5; 6; 7]"],"On demande 5 éléments, mais la liste n'en a que 3 : on s'arrête quand elle est vide. [5; 6; 7].")))),

sec(7,"Verso : type et valeur",`<p>Les lignes du verso, expliquées. La méthode pour une question « type et valeur » : calcule pas à pas, de l'intérieur vers l'extérieur, et à chaque étape vérifie que les types vont ensemble.</p>`+
F2V(["Tu écris","Type et valeur","Pourquoi"],[
["(8/3) :: (8 mod 3) :: []","int list, [2; 2]","8/3 = 2, 8 mod 3 = 2, puis :: les met devant []"],
["List.hd [3.5; 1.] > 2.","bool, true","List.hd donne 3.5 ; 3.5 > 2. est une comparaison vraie"],
["3 * 4.","erreur","un int et un float"],
["if x then y else 3","int","x doit être un bool ; le else rend un int, donc y aussi"],
['"100" < "2"',"bool, true","lettre par lettre : 1 avant 2"],
["[1; 2.]","erreur","un seul type par liste"]])+
`<p><b>Au cas où : le type 'a.</b> 'a se lit « alpha ». On l'écrit quand rien n'oblige une valeur à avoir un type précis : elle peut être de n'importe quel type.</p>`+
F2V(["Tu écris","Type","Pourquoi"],[
["List.hd [1; 2]","int","sur une int list, List.hd rend un int"],
['List.hd ["a"]',"string","sur une string list, un string"],
["List.hd","'a list -> 'a","marche sur toutes les listes"],
["fun x -> x","'a -> 'a","x n'est utilisé dans aucun calcul : n'importe quel type"],
["fun n x -> if n = 0 then x else x","int -> 'a -> 'a","n est comparé à 0 (int) ; x est seulement rendu"]])+
F2Z(F2Q("Que vaut cette expression ?","(9/2) :: (9 mod 2) :: []",["[4; 1]"],"9/2 = 4 (on coupe la virgule), 9 mod 2 = 1. Puis :: les met devant [] : [4; 1], une int list."),
F2Q("Quel est le type de cette expression ?","List.hd [2.5; 1.] < 3.",["bool"],"List.hd donne 2.5, puis 2.5 &lt; 3. est une comparaison : bool (elle vaut true)."),
F2Q("Quelle est la signature de cette fonction ?","function (x, y) -> if y then x + 1 else 2 * x",["int * bool -> int"],"Un couple. x + 1 : x est un int. if y : y est un bool. On rend x + 1 ou 2 * x : un int. Signature : int * bool -> int."))),

sec(8,"Verso : les pièges",F2T(["Faux","Juste","Pourquoi"],[
["let f = function n -> .. f (n - 1) ..","let rec f = function n -> ..","sans rec, f ne se connaît pas : « Unbound value »"],
["f n - 1","f (n - 1)","sinon (f n) - 1 : ne s'arrête jamais"],
["[2, 3]","[2; 3]","la virgule fait un couple : un seul élément"],
["if x > 0 then 1","if x > 0 then 1 else 0","toujours un else"],
["x == 3","x = 3","pour comparer, un seul ="],
["mult (3, 4) si l'énoncé écrit mult 3 4","fun n m -> …","sans virgule dans l'énoncé : fonction curryfiée"]],[0,1])),

sec(9,"Au CC : écrire une fonction en 5 étapes",`<ol><li><b>Lis les exemples de l'énoncé</b> : une virgule (f(2,7)) veut dire un couple, function (x, y) ; des espaces (f 3 4) veulent dire fun a b.</li><li><b>Écris la signature</b> : le type de chaque paramètre, puis celui du résultat.</li><li><b>Récursive ?</b> L'énoncé le dit souvent. Si oui : let rec.</li><li><b>Le cas de base</b> : n = 0, n &lt; 10, li = [], ou List.tl li = [] si la liste est non vide.</li><li><b>Le cas général</b>, puis <b>teste</b> à la main sur l'exemple de l'énoncé.</li></ol>
<p><b>Exemple complet.</b> Énoncé : « Écrire la fonction récursive nbGrands qui compte les éléments plus grands que 10 d'une liste d'entiers. Exemple : nbGrands [3; 15; 12] vaut 2. »</p>
<ol><li>nbGrands [3; 15; 12] : un seul paramètre, une liste.</li><li>Une liste d'entiers, et on rend un nombre : <code>int list -> int</code>.</li><li>« récursive » : let rec.</li><li>Base : une liste vide n'a aucun élément plus grand que 10 : 0.</li><li>Si le premier est plus grand que 10, on compte 1 de plus ; sinon, on ne compte rien.</li></ol>`+M(`let rec nbGrands : int list -> int = function li ->
  if li = [] then 0
  else if List.hd li > 10 then 1 + nbGrands (List.tl li)
  else nbGrands (List.tl li)`)+`<p>Le test, à la main :</p>`+M(`nbGrands [3; 15; 12]
= nbGrands [15; 12]          (3 n'est pas > 10)
= 1 + nbGrands [12]          (15 > 10)
= 1 + 1 + nbGrands []        (12 > 10)
= 1 + 1 + 0
= 2`)+`<p>On trouve 2, comme l'énoncé. La fonction est bonne.</p>`)
].join("\n");
const types=({sec})=>`<div class="title-row"><h1>Entraînement : types et valeurs</h1></div><p class="lead">27 expressions tirées du TD et du partiel. Choisis le type, lis la valeur et l'explication. Refais-le jusqu'à ne plus te tromper : c'est 3 points faciles au contrôle.</p><div id="drill"></div>`;
const infos=({sec})=>`<div class="title-row"><h1>Le contrôle de programmation fonctionnelle en bref</h1></div>
 ${sec(1,"Quand et où",`<p>Vendredi 13 novembre à 9h45, d'après le mail de David Delahaye du 5 novembre. Amphi 5.01 si ton nom de famille commence par une lettre de A à M, amphi 5.03 de N à Z. L'épreuve dure 1 h (1 h 20 avec un tiers-temps).</p>`)}
 ${sec(2,"Le poids",`<p>Note finale = 0,30 × contrôle écrit + 0,03 × TP noté + 0,67 × examen de janvier. Coefficient 5 dans le semestre.</p>`)}
 ${sec(3,"À quoi ressemble le sujet",`<ul><li>1 h, sur papier. Le seul document autorisé est une feuille A4 recto-verso, écrite comme tu veux : prépare-la avec la page « Ma feuille à recopier ».</li><li>Types et valeurs d'expressions, signatures de fonctions.</li><li>4 à 5 fonctions à écrire en OCaml (entiers, chiffres, diviseurs, listes), avec leur signature.</li><li>Programme (mail du prof du 5/11) : tout ce qui a été vu jusqu'aux listes incluses, <b>sans le filtrage</b> (TD ex. 1 à 31). Le mail ne parlait pas du polymorphisme, mais le CC d'octobre 2025 avait des types 'a : sache les lire.</li><li>Sur papier : pas d'ordinateur pour vérifier tes types. Écris les fonctions sur les listes avec la forme du cours <code>if li = [] then … else … List.hd li … List.tl li</code>, comme partout sur le site.</li></ul>`)}
 ${sec(4,"Documents",`<p style="display:flex;gap:8px;flex-wrap:wrap">${[["pf/cours.pdf","Cours complet"],["pf/td.pdf","Feuille de TD"],["pf/partiel_oct2021.pdf","Partiel 2021"],["pf/exam_jan2024_sujet.pdf","Examen 2024"]].map(f=>`<a class="btn" href="../Moodle-S1/${f[0]}" target="_blank" rel="noopener">${f[1]}</a>`).join("")}</p>`)}`;

/* ================== examen de janvier (CT, 67 % de la note, 2 h, une feuille A4 recto-verso) ==================
   Programme : tout le cours (plan du PDF : expressions, fonctions, listes et filtrage, typage avancé — polymorphisme,
   types sommes, enregistrements, abréviations —, exceptions, ordre supérieur et itérateurs, récursivité terminale).
   Annales : janvier 2022, juin 2022 (session 2), janvier 2024 (corrigé officiel en .ml sur Moodle).
   Le code est écrit comme le corrigé officiel de 2024 : fonctions curryfiées, function / match, sans signature. */
const ML=(s,...v)=>W.code(String.raw(s,...v),"ml");
const kc=(s,...v)=>`<code>${esc(String.raw(s,...v))}</code>`;
const CT=o=>Object.assign(o,{ex:"ct"});

/* ---------- 7. filtrage ---------- */
add(7,CT({id:"pf-match-ecrire",type:"code",ref:"Cours p. 58 à 67 ; TD ex. 33 à 36 ; tous les examens de janvier",t:"Écrire une fonction avec le filtrage",short:"function | [] -> … | e :: tl -> …",
 plain:`Avec le filtrage, on écrit ${hl("un cas par forme possible")} de la donnée : la liste vide, puis une liste « tête :: queue ». ${kc`function`} filtre directement le dernier paramètre.`,
 formal:`${ML`let rec longueur = function
  | [] -> 0
  | _ :: tl -> 1 + longueur tl

(* deux paramètres : le dernier est filtré par function *)
let rec appartient x = function
  | [] -> false
  | e :: tl -> e = x || appartient x tl

(* filtrer deux valeurs à la fois *)
let rec fusion l1 l2 = match l1, l2 with
  | [], l | l, [] -> l
  | e1 :: t1, e2 :: t2 ->
     if e1 <= e2 then e1 :: fusion t1 l2
     else e2 :: fusion l1 t2`}<ul><li>Motifs : constantes (${kc`0`}, ${kc`true`}), noms (${kc`x`}), ${kc`_`}, couples ${kc`(a, b)`}, listes ${kc`[]`}, ${kc`e :: tl`}, ${kc`[x]`}, ${kc`x :: y :: tl`}.</li><li>${kc`when`} ajoute une condition : ${kc`| e :: tl when e mod 2 = 0 -> …`}.</li><li>${kc`as`} nomme le tout : ${kc`| e :: tl as l -> …`}.</li><li>Les cas sont testés de haut en bas : le cas général en dernier.</li></ul>`,
 use:`<p>Écris toujours d'abord le cas ${kc`[]`}, puis ${kc`e :: tl`} avec l'appel récursif sur ${kc`tl`}.</p>`,
 trap:`Un même nom ne peut pas apparaître deux fois dans un motif : ${kc`| (x, x) -> …`} est refusé ; écris ${kc`| (x, y) when x = y -> …`}.`,
 q:"Écris par filtrage une fonction récursive nbOcc x l, qui compte le nombre de fois que x apparaît dans la liste l.",a:"let rec nbOcc x = function [] -> 0 | e :: tl -> (if e = x then 1 else 0) + nbOcc x tl",rel:["pf-match","pf-listes-rec"]}));

/* ---------- 8. polymorphisme et types ---------- */
add(8,CT({id:"pf-curry",type:"def",ref:"Cours p. 327 à 330 (fonctions curryfiées) ; consigne de tous les examens",t:"Fonctions curryfiées et application partielle",short:"f x y, add 1",
 plain:`Les sujets l'exigent : ${hl("une fonction à plusieurs arguments s'écrit curryfiée")}, ${kc`let f x y = …`}, et s'appelle ${kc`f 3 4`}, pas ${kc`f (3, 4)`}. On peut ne donner que le premier argument : on obtient une fonction.`,
 formal:`${ML`let add x y = x + y        (* int -> int -> int *)
let succ = add 1             (* int -> int : application partielle *)
let add_c (x, y) = x + y     (* int * int -> int : PAS curryfiée *)

let comp f g x = f (g x)
(* ('a -> 'b) -> ('c -> 'a) -> 'c -> 'b *)
let carre_succ = comp (fun x -> x * x) succ   (* carre_succ 1 = 4 *)`}<ul><li>${kc`fun x -> …`} : une fonction sans nom, à passer en paramètre.</li><li>${kc`let f x y = e`} est une écriture courte de ${kc`let f = fun x y -> e`}.</li><li>Le type ${kc`int -> int -> int`} se lit ${kc`int -> (int -> int)`}.</li></ul>`,
 use:`<p>Pour lire un type de fonction : tout ce qui est avant la dernière flèche, ce sont les arguments, dans l'ordre ; après, le résultat.</p>`,
 trap:`Le corrigé officiel de 2024 écrit ${kc`add_rat (Rat (1, 2), Rat (3, 4))`} avec un couple : la consigne demande pourtant la forme curryfiée. Écris ${kc`add_rat a b`}.`,
 q:"Quel est le type de la fonction définie par let add x y = x + y ? Et celui de add 1 ?",a:"int -> int -> int ; add 1 est de type int -> int.",rel:["pf-ordre-sup","pf-fonctions"]}));

add(8,CT({id:"pf-somme",type:"def",ref:"Cours p. 286 à 297 ; TD ex. 41 et 42 ; examen de janvier 2024, ex. 2",t:"Types somme : définir, construire, filtrer",short:"type t = A | B of int",cc:"un exercice à chaque examen de janvier",
 plain:`Un type somme liste ${hl("les formes possibles")} d'une valeur. Chaque forme a un ${hl("constructeur")} (avec une majuscule), qui porte éventuellement une donnée. On le lit avec un ${kc`match`}.`,
 formal:`${ML`type couleur = Bleu | Blanc | Rouge          (* type énuméré *)
type nombre =
  | Ent of int
  | Rat of (int * int)

let x = Rat (1, 2)                           (* construire *)

let est_nul = function                       (* filtrer *)
  | Ent 0 -> true
  | Rat (0, _) -> true
  | _ -> false

let add_number n1 n2 = match n1, n2 with     (* deux valeurs *)
  | Ent a, Ent b -> Ent (a + b)
  | Rat (a, b), Rat (c, d) -> Rat (a * d + c * b, b * d)
  | Ent a, Rat (c, d) | Rat (c, d), Ent a -> Rat (a * d + c, d)`}<ul><li>Les motifs s'imbriquent : ${kc`Carte (Pique, _) :: tl`} filtre une liste, puis une carte, puis une enseigne.</li></ul>`,
 use:`<p>Un cas du ${kc`match`} par constructeur. Pour une liste de valeurs du type : ${kc`| [] -> …`}, ${kc`| Ent e :: tl -> …`}, ${kc`| Rat (x, y) :: tl -> …`}.</p>`,
 trap:`Un constructeur s'écrit avec une majuscule, et ses données entre parenthèses : ${kc`Rat (1, 2)`}, ${kc`Ent 3`}.`,
 q:"Avec type nombre = Ent of int | Rat of (int * int), écris inverse : nombre -> nombre, qui rend 1/x et lève Failure si x est nul.",a:"let inverse = function | Ent 0 | Rat (0, _) -> failwith \"inverse\" | Ent e -> Rat (1, e) | Rat (a, b) -> Rat (b, a)",rel:["pf-rectype","pf-match-ecrire"]}));

add(8,CT({id:"pf-rectype",type:"meth",ref:"Cours p. 294 à 297 ; TD ex. 43 et 44 ; examens 2022 (my_string, chaine) et 2024 ('a set)",t:"Types somme récursifs : entiers de Peano, chaînes maison, ensembles, arbres",short:"type 'a tree = Empty | Node of …",cc:"7 à 8 points en 2022 et 6 en 2024",
 plain:`Un type somme peut ${hl("se contenir lui-même")} : c'est une liste maison. Les fonctions dessus sont ${hl("récursives, avec un cas par constructeur")}, exactement comme sur les listes.`,
 formal:`${ML`type nat = O | S of nat                         (* 2 = S (S O) *)
let rec add_nat n = function
  | O -> n
  | S p -> S (add_nat n p)

type 'a set = Empty | Add of 'a * 'a set
let rec mem x = function                        (* janvier 2024 *)
  | Empty -> false
  | Add (e, tl) -> e = x || mem x tl

type 'a tree = Empty | Node of 'a * 'a tree * 'a tree
let rec height = function                       (* TD ex. 44 *)
  | Empty -> 0
  | Node (_, g, d) -> 1 + max (height g) (height d)`}<p>Deux types qui ont un constructeur ${kc`Empty`} : c'est le dernier défini qui compte pour la suite. Dans un sujet, un seul est défini à la fois.</p>`,
 use:`<p>Le cas de base est le constructeur sans argument (${kc`O`}, ${kc`Empty`}, ${kc`Vide`}) ; dans le cas récursif, on rappelle la fonction sur la partie du même type.</p>`,
 trap:`${kc`type 'a tree = …`} : la variable de type ${kc`'a`} s'écrit avant le nom du type, avec une apostrophe.`,
 q:"Avec type my_string = Empty | Cons of char * my_string, écris my_length, qui rend le nombre de caractères d'une my_string.",a:"let rec my_length = function Empty -> 0 | Cons (_, r) -> 1 + my_length r",rel:["pf-somme","pf-match-ecrire"]}));

add(8,CT({id:"pf-record",type:"def",ref:"Cours p. 298 à 306 ; TD ex. 46",t:"Enregistrements et abréviations de types",short:"{nom : string; age : int}",
 plain:`Un enregistrement regroupe des données ${hl("nommées par des champs")}. On lit un champ avec un point : ${kc`p.age`}.`,
 formal:`${ML`type personne = {nom : string; prenom : string; age : int}

let p = {nom = "Church"; prenom = "Alonzo"; age = 92}
let nom_complet p = p.prenom ^ " " ^ p.nom
let vieillir p = {p with age = p.age + 1}    (* copie modifiée *)
let nom2 = function {nom = n; prenom = pr} -> pr ^ " " ^ n

type entier = int                             (* abréviation *)
type prod = int * int`}`,
 use:`<p>${kc`{p with champ = …}`} fabrique un nouvel enregistrement : rien n'est modifié sur place.</p>`,
 trap:`Les champs s'écrivent avec ${kc`=`} à la construction et ${kc`:`} dans la définition du type.`,
 q:"p1 et p2 sont deux enregistrements qui ont un champ age. Écris plus_age p1 p2, qui dit si p1 est plus âgée que p2.",a:"let plus_age p1 p2 = p1.age > p2.age",rel:["pf-somme"]}));

/* ---------- 9. exceptions ---------- */
add(9,CT({id:"pf-exc",type:"meth",ref:"Cours p. 307 à 325 ; TD ex. 47 à 51 ; tous les examens de janvier",t:"Exceptions : lever, définir, rattraper",short:"raise, failwith, try … with",cc:"dans chaque examen de janvier",
 plain:`Une exception ${hl("interrompt le calcul")}. On la ${hl("lève")} avec ${kc`raise`} (ou ${kc`failwith "message"`}), on la ${hl("rattrape")} avec ${kc`try … with`}.`,
 formal:`${ML`exception Impossible                   (* sans argument *)
exception Inversion of nombre          (* avec un argument *)

let tete = function
  | [] -> failwith "tete"              (* = raise (Failure "tete") *)
  | e :: _ -> e

let rec maxListe = function
  | [] -> invalid_arg "maxListe"       (* = raise (Invalid_argument …) *)
  | [x] -> x
  | x :: tl -> max x (maxListe tl)

let my_tl l = try List.tl l with Failure _ -> []`}<ul><li>Prédéfinies : ${kc`Failure of string`}, ${kc`Invalid_argument of string`}, ${kc`Not_found`}, ${kc`Division_by_zero`}, ${kc`Match_failure`}.</li><li>${kc`try e with | E1 -> e1 | E2 x -> e2`} : si ${kc`e`} lève une exception, on la filtre ; sinon le résultat est celui de ${kc`e`}. Une exception non filtrée continue de remonter.</li><li>${kc`raise`} a le type ${kc`exn -> 'a`} : il convient à n'importe quel type de résultat.</li></ul>`,
 use:`<p>Pour arrêter un parcours dès qu'on a trouvé : ${kc`raise (Found e)`}, et ${kc`try … with Found e -> e`} autour de l'appel (TD ex. 51).</p>`,
 trap:`${kc`try g n with Failure _ -> 0`} ne rattrape pas ${kc`Invalid_argument`} : l'exception passe à travers (TD ex. 47).`,
 q:"Comment lève-t-on l'exception Not_found ? Comment définit-on une exception Trouve qui porte un int ?",a:"raise Not_found ; exception Trouve of int (puis raise (Trouve 3)).",rel:["pf-erreurs","pf-somme"]}));

/* ---------- 10. ordre supérieur ---------- */
add(10,CT({id:"pf-ordre-sup",type:"code",ref:"Cours p. 326 à 336 ; TD ex. 52 et 53 ; examens de janvier 2022 et juin 2022, ex. 3 et 1",t:"Fonctions d'ordre supérieur : map, filter, fold à la main",short:"f en paramètre",cc:"un exercice en 2022 (7 points)",
 plain:`Une fonction peut ${hl("prendre une fonction en paramètre")}. On écrit alors une seule fois le parcours de liste, et la fonction décide du traitement de chaque élément.`,
 formal:`${ML`let rec my_map f = function
  | [] -> []
  | e :: tl -> f e :: my_map f tl
(* ('a -> 'b) -> 'a list -> 'b list *)

let rec my_filter p = function
  | [] -> []
  | e :: tl -> if p e then e :: my_filter p tl else my_filter p tl

let rec my_fold_right f l init = match l with
  | [] -> init
  | e :: tl -> f e (my_fold_right f tl init)

(* janvier 2022 : (f a1) + … + (f an), avec List.hd et List.tl *)
let rec map_sum f l =
  if l = [] then 0 else f (List.hd l) + map_sum f (List.tl l)
(* ('a -> int) -> 'a list -> int *)`}`,
 use:`<p>Pour donner le type : regarde comment chaque paramètre est utilisé. ${kc`f e`} avec ${kc`e : 'a`} donne ${kc`f : 'a -> 'b`}.</p>`,
 trap:`Dans ${kc`map_sum`}, le ${kc`+`} force le résultat de ${kc`f`} à être un ${kc`int`} : le type est ${kc`('a -> int) -> 'a list -> int`}, pas ${kc`('a -> 'b)`}.`,
 q:"Quel est le type de la fonction définie par let f g x = g x ?",a:"('a -> 'b) -> 'a -> 'b",rel:["pf-iter","pf-curry"]}));

add(10,CT({id:"pf-iter",type:"code",ref:"Cours p. 335 à 347 ; TD ex. 57 à 59 ; examens 2022 et 2024",t:"Les itérateurs de List",short:"List.map, filter, fold_left, fold_right",cc:"imposé dans chaque examen",
 plain:`Les itérateurs de ${kc`List`} font le parcours à ta place. Le plus demandé : ${hl("List.fold_right")} et ${hl("List.fold_left")}, qui accumulent un résultat.`,
 formal:`${ML`List.map (fun e -> e + 1) [1; 2; 3]              (* [2; 3; 4] *)
List.filter (fun e -> e >= 0) [1; -2; 3]        (* [1; 3] *)
List.for_all (fun e -> e > 0) [1; 2]            (* true *)
List.exists (fun e -> e < 0) [1; 2]             (* false *)
List.fold_left (fun a e -> a + e) 0 [1; 2; 3]   (* ((0 + 1) + 2) + 3 *)
List.fold_right (fun e a -> e :: a) [1; 2] []   (* 1 :: (2 :: []) *)

(* janvier 2022 : map_sum avec fold_left *)
let map_sum f l = List.fold_left (fun a e -> a + f e) 0 l
(* juin 2022 : prodFonc avec fold_right *)
let prodFonc f l = List.fold_right (fun e a -> f e * a) l 1`}<ul><li>${kc`List.fold_left f init l`} : la fonction reçoit ${hl("(accumulateur, élément)")}.</li><li>${kc`List.fold_right f l init`} : la fonction reçoit ${hl("(élément, accumulateur)")}, et la liste vient avant ${kc`init`}.</li></ul>`,
 use:`<p>Pour fold, demande-toi : que vaut le résultat pour la liste vide (c'est ${kc`init`}) ? Comment l'élément suivant modifie-t-il l'accumulateur (c'est la fonction) ?</p>`,
 trap:`L'ordre des arguments diffère : ${kc`List.fold_left f init l`} mais ${kc`List.fold_right f l init`}.`,
 q:"Écris avec List.fold_left une fonction qui calcule la somme des entiers pairs d'une liste.",a:"let somme_pairs l = List.fold_left (fun a e -> if e mod 2 = 0 then a + e else a) 0 l",rel:["pf-ordre-sup"]}));

/* ---------- 11. récursivité terminale ---------- */
add(11,CT({id:"pf-terminal",type:"meth",ref:"Cours p. 68 à 70 du chapitre « Types » et p. 348 à 392",t:"Récursivité terminale et accumulateurs",short:"Appel terminal, accumulateur",
 plain:`Un appel est ${hl("terminal")} s'il est la toute dernière opération de la fonction. Pour rendre une fonction terminale, on ajoute un ${hl("accumulateur")} qui porte le résultat partiel.`,
 formal:`${ML`let rec fact1 n = if n = 0 then 1 else n * fact1 (n - 1)
(* pas terminale : il reste « n * … » à faire après l'appel *)

let rec factI n a = if n = 0 then a else factI (n - 1) (n * a)
let fact2 n = factI n 1                 (* terminale *)

let inv l =                             (* inverser une liste *)
  let rec aux l acc = match l with
    | [] -> acc
    | t :: q -> aux q (t :: acc)
  in aux l []`}<p>Une fonction terminale ne garde pas de calculs en attente sur la pile : (fact2 n) n'utilise qu'une trame, quand (fact1 n) en empile n + 1.</p>`,
 use:`<p>L'accumulateur part de la valeur du cas de base (1 pour un produit, 0 pour une somme, [] pour une liste).</p>`,
 trap:`Une version avec accumulateur sur une liste rend souvent les éléments ${hl("à l'envers")} : c'est voulu pour ${kc`inv`}, à corriger sinon.`,
 q:"Écris une version récursive terminale de la somme 1 + 2 + … + n, avec un accumulateur.",a:"let rec somI n a = if n = 0 then a else somI (n - 1) (a + n) ; let som n = somI n 0",rel:["pf-rec"]}));

add(11,CT({id:"pf-sujets",type:"def",ref:"Examens de janvier 2022, juin 2022 et janvier 2024",t:"Les fonctions données dans les sujets",short:"String.sub, Char.escaped, **",
 plain:`Les sujets rappellent les fonctions utiles, mais il faut ${hl("savoir les combiner")} : conversions int ↔ float, découpage de chaînes, caractère vers chaîne.`,
 formal:`${ML`2. ** 3.                       (* 8. : puissance de flottants *)
int_of_float (2. ** float_of_int n)   (* 2 puissance n, en int *)
String.length "L1"             (* 2 *)
String.get "L1" 0              (* 'L' *)
String.sub "L1" 1 1            (* "1" : à partir de 1, longueur 1 *)
Char.escaped 'L'               (* "L" *)
"un" ^ "deux"                  (* "undeux" *)
string_of_int 42               (* "42" *)
[1; 2] @ [3]                   (* [1; 2; 3] *)
fst (1, 'a'), snd (1, 'a')     (* 1 et 'a' *)
List.nth [5; 6; 7] 1           (* 6 *)`}`,
 use:`<p>Le reste d'une chaîne s sans son premier caractère : ${kc`String.sub s 1 (String.length s - 1)`}.</p>`,
 trap:`${kc`2 ** 3`} est une erreur de type : ${kc`**`} ne prend que des ${kc`float`}.`,
 q:"Avec String.sub et String.length, comment obtenir la chaîne s privée de son premier caractère ?",a:"String.sub s 1 (String.length s - 1)",rel:["pf-rectype"]}));

/* ---------- exercices de TD 33 à 59 (corrigés écrits pour le site) ---------- */
td.push(
 CT({id:"33",s:1,note:"filtrage",t:"z1, z2, z3",en:"Comparer : let z1 = function x -> if x = 0 then true else false ; let z2 = function x -> match x with 0 -> true | _ -> false ; let z3 = function 0 -> true | _ -> false.",link:"pf-match",sol:`<p>Les trois sont la même fonction ${kc`int -> bool`} : true pour 0, false sinon. z3 est l'écriture la plus courte : ${kc`function`} filtre directement le paramètre, sans le nommer.</p>`}),
 CT({id:"37",s:2,note:"polymorphisme",t:"Inférer des types",en:"Types de : id x = x ; f e l = e :: l ; g c x l = if fst c then snd c :: l else [x] ; h c x y = function [] -> [] | e :: tl as l -> if c then (x, y) :: l else e :: (x, y) :: tl ; let rec j x = j x ; let rec k a = function [] -> a | e :: tl -> if e mod 2 = 0 then k a tl else failwith \"stop\".",link:"pf-poly",sol:`${ML`id : 'a -> 'a
f : 'a -> 'a list -> 'a list
g : bool * 'a -> 'a -> 'a list -> 'a list
h : bool -> 'a -> 'b -> ('a * 'b) list -> ('a * 'b) list
j : 'a -> 'b
k : 'a -> int list -> 'a`}<p>Pour g : ${kc`fst c`} sert de condition, donc c est un couple dont la 1re composante est un bool ; ${kc`snd c :: l`} et ${kc`[x]`} ont le même type. Pour k : ${kc`e mod 2`} force des int.</p>`}),
 CT({id:"38",s:1,note:"polymorphisme",t:"make_couple, proj1, proj2",en:"Écrire make_couple x y = (x, y), proj1 et proj2 (les deux composantes d'un couple). Types ?",link:"pf-poly",sol:`${ML`let make_couple x y = (x, y)      (* 'a -> 'b -> 'a * 'b *)
let proj1 (a, _) = a               (* 'a * 'b -> 'a *)
let proj2 (_, b) = b               (* 'a * 'b -> 'b *)`}`}),
 CT({id:"39",s:3,note:"polymorphisme",t:"mem_assoc",en:"mem_assoc a l : true s'il existe un couple (a, b) dans la liste de couples l. Exemple : mem_assoc 2 [(1, 'a'); (2, 'b')] = true. Type ?",link:"pf-match-ecrire",sol:`${ML`let rec mem_assoc a = function
  | [] -> false
  | (k, _) :: tl -> k = a || mem_assoc a tl
(* 'a -> ('a * 'b) list -> bool *)`}`}),
 CT({id:"40",s:2,note:"polymorphisme",t:"dup_list",en:"dup_list n l : chaque élément de l répété n fois. dup_list 2 [1;2;3] = [1;1;2;2;3;3]. Type ? Que valent dup_list 2 [1;2;3;4;5] et dup_list 3 ['a';'b';'c'] ?",link:"pf-match-ecrire",sol:`${ML`let rec repete n x = if n <= 0 then [] else x :: repete (n - 1) x

let rec dup_list n = function
  | [] -> []
  | e :: tl -> repete n e @ dup_list n tl
(* int -> 'a list -> 'a list *)`}<p>[1;1;2;2;3;3;4;4;5;5] et ['a';'a';'a';'b';'b';'b';'c';'c';'c']. Si n = 0, repete rend [] : la liste résultat est vide.</p>`}),
 CT({id:"41",s:3,note:"types sommes",t:"split_number_list",en:"type number = Int of int | Float of float. split_number_list : le couple (liste des Int, liste des Float). sum_split_number_list : le couple (somme des entiers, somme des flottants).",link:"pf-somme",sol:`${ML`let rec split_number_list = function
  | [] -> ([], [])
  | Int i :: tl ->
     let (li, lf) = split_number_list tl in (Int i :: li, lf)
  | Float f :: tl ->
     let (li, lf) = split_number_list tl in (li, Float f :: lf)

let rec sum_split_number_list = function
  | [] -> (0, 0.)
  | Int i :: tl ->
     let (si, sf) = sum_split_number_list tl in (si + i, sf)
  | Float f :: tl ->
     let (si, sf) = sum_split_number_list tl in (si, sf +. f)`}<p>${kc`let (a, b) = … in`} récupère les deux morceaux du résultat récursif.</p>`}),
 CT({id:"42",s:2,note:"types sommes",t:"Mains de poker",en:"type carte = Carte of enseigne * valeur. Une main est une liste de cartes. Tester : au moins un as ; au moins une carte de valeur v ; au moins deux as ; au moins une paire ; une couleur (5 cartes de même enseigne).",link:"pf-somme",sol:`${ML`let rec contient v = function
  | [] -> false
  | Carte (_, w) :: tl -> w = v || contient v tl

let a_un_as main = contient As main

let rec nb_valeur v = function
  | [] -> 0
  | Carte (_, w) :: tl -> (if w = v then 1 else 0) + nb_valeur v tl

let deux_as main = nb_valeur As main >= 2

let rec a_une_paire = function
  | [] -> false
  | Carte (_, v) :: tl -> contient v tl || a_une_paire tl

let rec meme_enseigne e = function
  | [] -> true
  | Carte (e2, _) :: tl -> e2 = e && meme_enseigne e tl

let couleur = function
  | [] -> true
  | Carte (e, _) :: tl -> meme_enseigne e tl`}`}),
 CT({id:"43",s:2,note:"types sommes",t:"Entiers de Peano",en:"type nat = O | S of nat. to_dec, from_dec, et mul_nat avec mul_nat x O = O et mul_nat x (S y) = add_nat (mul_nat x y) x.",link:"pf-rectype",sol:`${ML`let rec to_dec = function
  | O -> 0
  | S n -> 1 + to_dec n

let rec from_dec n = if n <= 0 then O else S (from_dec (n - 1))

let rec add_nat n = function
  | O -> n
  | S p -> S (add_nat n p)

let rec mul_nat x = function
  | O -> O
  | S y -> add_nat (mul_nat x y) x`}`}),
 CT({id:"44",s:3,note:"types sommes",t:"Hauteur et équilibre d'un arbre",en:"type 'a tree = Empty | Node of 'a * 'a tree * 'a tree. height (l'arbre vide a pour hauteur 0) ; is_balanced : pour tout nœud, les deux fils ont la même hauteur.",link:"pf-rectype",sol:`${ML`let rec height = function
  | Empty -> 0
  | Node (_, g, d) -> 1 + max (height g) (height d)

let rec is_balanced = function
  | Empty -> true
  | Node (_, g, d) ->
     height g = height d && is_balanced g && is_balanced d`}`}),
 CT({id:"46",s:1,note:"enregistrements",t:"Le type personne",en:"type personne = {nom : string; prenom : string; age : int}. afficher_personne, changer_nom, plus_age ; un type personne2 avec le sexe (type somme) et les conversions.",link:"pf-record",sol:`${ML`let afficher_personne p =
  print_endline (p.prenom ^ " " ^ p.nom ^ " a "
                 ^ string_of_int p.age ^ " ans")

let changer_nom n p = {p with nom = n}
let plus_age p1 p2 = p1.age > p2.age

type sexe = Masculin | Feminin
type personne2 = {nom2 : string; prenom2 : string; age2 : int; sexe : sexe}

let p_vers_p2 s p = {nom2 = p.nom; prenom2 = p.prenom; age2 = p.age; sexe = s}
let p2_vers_p p = {nom = p.nom2; prenom = p.prenom2; age = p.age2}`}<p>Des noms de champs différents (nom2…) évitent qu'OCaml confonde les deux types. p_vers_p2 a besoin du sexe en paramètre : personne ne le contient pas.</p>`}),
 CT({id:"47",s:3,note:"exceptions",t:"Que rend f ?",en:"let g n = if n = -1 then failwith \"-1\" else if n > -10 then n else raise (Invalid_argument (string_of_int n)) ; let f n = match n with | i when i >= 0 -> 1 / i | i when i >= -10 && i <= -1 -> (try g n with Failure _ -> 0). Valeur de f pour 2, 0, -1, -5, -10, -11 ?",link:"pf-exc",sol:`<ul><li>f 2 = 1 / 2 = 0 (division entière).</li><li>f 0 : 1 / 0 lève Division_by_zero, non rattrapée.</li><li>f (-1) : g lève Failure "-1", rattrapée : 0.</li><li>f (-5) : g rend -5.</li><li>f (-10) : g lève Invalid_argument "-10" ; le with ne filtre que Failure : l'exception remonte.</li><li>f (-11) : aucun cas du match ne correspond : Match_failure.</li></ul>`}),
 CT({id:"48",s:2,note:"exceptions",t:"som et maxListe qui lèvent des exceptions",en:"som n (somme des n premiers entiers) lève Failure si n < 0 ; maxListe lève Invalid_argument sur la liste vide. Type de maxListe ?",link:"pf-exc",sol:`${ML`let rec som n =
  if n < 0 then failwith "som : entier négatif"
  else if n = 0 then 0
  else n + som (n - 1)

let rec maxListe = function
  | [] -> invalid_arg "maxListe : liste vide"
  | [x] -> x
  | x :: tl -> max x (maxListe tl)
(* 'a list -> 'a *)`}`}),
 CT({id:"49",s:2,note:"exceptions",t:"my_tl et my_nth",en:"my_tl : List.tl, mais [] pour la liste vide (rattraper Failure). my_nth l n : List.nth, mais le dernier élément si n est trop grand (Failure) et le premier si n est négatif (Invalid_argument).",link:"pf-exc",sol:`${ML`let my_tl l = try List.tl l with Failure _ -> []

let my_nth l n =
  try List.nth l n with
  | Failure _ -> List.nth l (List.length l - 1)
  | Invalid_argument _ -> List.hd l`}`}),
 CT({id:"50",s:2,note:"exceptions",t:"somme_sous_liste (essais successifs)",en:"Une sous-liste de l dont la somme vaut s, en levant Impossible s'il n'y en a pas. Liste vide : [] si s = 0, sinon Impossible. Sinon e :: tl : essayer e avec une solution pour s - e dans tl, ou une solution pour s dans tl.",link:"pf-exc",sol:`${ML`exception Impossible

let rec somme_sous_liste s = function
  | [] -> if s = 0 then [] else raise Impossible
  | e :: tl ->
     try e :: somme_sous_liste (s - e) tl
     with Impossible -> somme_sous_liste s tl`}`}),
 CT({id:"51",s:3,note:"exceptions",t:"plus_petit_que avec l'exception Found",en:"plus_petit_que n l : le premier élément de l strictement plus petit que n, ou Not_found. En passant par plus_petit_que_exc qui lève Found e. Puis rendre aussi sa position.",link:"pf-exc",sol:`${ML`exception Found of int

let rec plus_petit_que_exc n = function
  | [] -> raise Not_found
  | e :: tl -> if e < n then raise (Found e) else plus_petit_que_exc n tl

let plus_petit_que n l = try plus_petit_que_exc n l with Found e -> e

exception Found_pos of int * int

let rec ppq_pos n i = function
  | [] -> raise Not_found
  | e :: tl -> if e < n then raise (Found_pos (e, i)) else ppq_pos n (i + 1) tl

let plus_petit_que2 n l = try ppq_pos n 0 l with Found_pos (e, i) -> (e, i)`}<p>Not_found n'est pas rattrapée : elle remonte, comme demandé.</p>`}),
 CT({id:"52",s:2,note:"ordre supérieur",t:"Types de fonctions d'ordre supérieur",en:"let f g x = g x ; let g f x y = f (x, y) ; let h f (x, y) = f x y. Types ? Que font-elles ?",link:"pf-ordre-sup",sol:`${ML`f : ('a -> 'b) -> 'a -> 'b          (* applique g à x *)
g : ('a * 'b -> 'c) -> 'a -> 'b -> 'c  (* curryfie f *)
h : ('a -> 'b -> 'c) -> 'a * 'b -> 'c  (* décurryfie f *)`}<p>Exemples : f succ 1 = 2 ; g fst 1 2 = 1 ; h (+) (1, 2) = 3.</p>`}),
 CT({id:"53",s:3,note:"ordre supérieur",t:"my_map, my_filter, my_fold_right",en:"Sans les fonctions de List : my_map f [a1;…;an] = [f a1;…;f an] ; my_filter p l ; my_fold_right f [a1;…;an] init = f a1 (f a2 (… (f an init))).",link:"pf-ordre-sup",sol:`${ML`let rec my_map f = function
  | [] -> []
  | e :: tl -> f e :: my_map f tl

let rec my_filter p = function
  | [] -> []
  | e :: tl -> if p e then e :: my_filter p tl else my_filter p tl

let rec my_fold_right f l init = match l with
  | [] -> init
  | e :: tl -> f e (my_fold_right f tl init)`}`}),
 CT({id:"54",s:2,note:"ordre supérieur",t:"Le type option",en:"fact_securisee : comme fact, mais Some (fact n), ou None si fact lève une exception. securiser_fonction f : transforme une fonction d'arité 1 de la même façon. Type ? Généraliser à une arité quelconque ?",link:"pf-exc",sol:`${ML`let fact_securisee n = try Some (fact n) with Failure _ -> None

let securiser_fonction f = fun x -> try Some (f x) with _ -> None
(* ('a -> 'b) -> 'a -> 'b option *)

let fact_securisee2 = securiser_fonction fact`}<p>Pas pour une arité quelconque en une seule fonction : le nombre d'arguments fait partie du type. On écrit une version par arité, ou on regroupe les arguments dans un tuple pour revenir à l'arité 1.</p>`}),
 CT({id:"57",s:3,note:"itérateurs",t:"Que font ces fonctions ?",en:"f l = List.fold_left (fun a e -> a ^ Char.escaped e) \"\" l ; g l = List.fold_right (fun e a -> e :: a) l [] ; h l = List.for_all (fun e -> e) (List.map (fun e -> e >= 0) l) ; i e l = List.length (List.filter (fun x -> x = e) l) ; j l = let l1, l2 = List.partition (fun e -> e >= 0) l in List.length l1 >= List.length l2.",link:"pf-iter",sol:`<ul><li>f : ${kc`char list -> string`}, colle les caractères : f ['a'; 'b'] = "ab".</li><li>g : ${kc`'a list -> 'a list`}, recopie la liste à l'identique.</li><li>h : ${kc`int list -> bool`}, tous les éléments sont-ils ≥ 0 ?</li><li>i : ${kc`'a -> 'a list -> int`}, le nombre d'occurrences de e (c'est nbOcc).</li><li>j : ${kc`int list -> bool`}, au moins autant d'éléments ≥ 0 que d'éléments négatifs ?</li></ul>`}),
 CT({id:"58",s:2,note:"itérateurs",t:"tousPairs, exiPairs, liPairs, oterPairs avec des itérateurs",en:"Réécrire les fonctions de l'exercice 27 uniquement avec des itérateurs.",link:"pf-iter",sol:`${ML`let tousPairs l = List.for_all (fun x -> x mod 2 = 0) l
let exiPairs l = List.exists (fun x -> x mod 2 = 0) l
let liPairs l = List.filter (fun x -> x mod 2 = 0) l
let oterPairs l = List.filter (fun x -> x mod 2 <> 0) l`}`}),
 CT({id:"59",s:3,note:"itérateurs",t:"somme_pairs, union, est_triee",en:"Avec des itérateurs seulement : la somme des entiers pairs ; l'union de deux listes sans doublons ; tester si une liste est triée (fold_left avec un couple (réponse, dernier élément)).",link:"pf-iter",sol:`${ML`let somme_pairs l =
  List.fold_left (fun a e -> if e mod 2 = 0 then a + e else a) 0 l

let union l1 l2 =
  l1 @ List.fold_left (fun acc e -> List.filter (fun x -> x <> e) acc) l2 l1

let est_triee = function
  | [] -> true
  | e :: tl ->
     fst (List.fold_left (fun (ok, prec) x -> (ok && prec <= x, x)) (true, e) tl)`}<p>union : on retire de l2 chaque élément de l1, puis on colle. est_triee : l'accumulateur garde la réponse et le dernier élément vu.</p>`}));

/* les exercices 32, 35 et 36 existaient déjà : ils passent au programme de janvier */
td.forEach(x=>{if(x.id==="32"){x.ex="ct";delete x.out;}});

/* ---------- annales de l'examen de janvier ---------- */
const MOI_PF="Corrigé écrit par moi (pas de corrigé officiel), dans le style du corrigé de 2024";
ann.push(
 {src:"Examen janvier 2024 · Ex. 1, question 2",t:"trouve_pytha et l'exception Not_found",en:"Étant donnés x et z, rendre l'entier y tel que (x, y, z) soit pythagoricien (x² + y² = z²), ou lever Not_found. trouve_pytha 3 5 = 4 ; trouve_pytha 2 8 lève Not_found.",go:"pf-exc",who:"Corrigé officiel, adapté : le corrigé rend le triplet (x, y, z), l'énoncé demande y",sol:`${ML`let rec trouve_aux x y z =
  if y * y >= z * z then raise Not_found
  else if est_pytha x y z then y
  else trouve_aux x (y + 1) z

let trouve_pytha x z = trouve_aux x 1 z`}`},
 {src:"Examen janvier 2024 · Ex. 2 · 7 pts",t:"Le type nombre (entiers et rationnels)",en:"type nombre = Ent of int | Rat of (int * int). (1) add_rat : somme de deux Rat, sinon Failure \"add_rat\" (Rat (1, 2) et Rat (3, 4) donnent Rat (10, 8)). (2) somme_nombre : somme d'une liste de nombres, en Rat ([Ent 2; Rat (1, 2); Rat (3, 4)] donne Rat (26, 8)). (3) exception Inversion of nombre ; inverse_nombre : inverse chaque nombre, lève Inversion avec le nombre nul. (4) simplifie_nombre avec List.fold_right seulement : supprimer les nombres nuls, Rat (x, 1) devient Ent x.",go:"pf-somme",who:"Corrigé officiel (fichier .ml), écrit ici en forme curryfiée",sol:`${ML`let add_rat a b = match a, b with
  | Rat (x1, y1), Rat (x2, y2) -> Rat (x1 * y2 + x2 * y1, y1 * y2)
  | _ -> failwith "add_rat"

let rec somme_nombre = function
  | [] -> Rat (0, 1)
  | Ent e :: tl -> add_rat (Rat (e, 1)) (somme_nombre tl)
  | Rat r :: tl -> add_rat (Rat r) (somme_nombre tl)

exception Inversion of nombre

let rec inverse_nombre = function
  | [] -> []
  | Ent e :: tl ->
     if e = 0 then raise (Inversion (Ent e))
     else Rat (1, e) :: inverse_nombre tl
  | Rat (x, y) :: tl ->
     if x = 0 then raise (Inversion (Rat (x, y)))
     else Rat (y, x) :: inverse_nombre tl

let simplifie_nombre l =
  List.fold_right (fun e a -> match e with
    | Ent 0 -> a
    | Rat (0, _) -> a
    | Rat (x, 1) -> Ent x :: a
    | _ -> e :: a) l []`}`},
 {src:"Examen janvier 2024 · Ex. 3 · 6 pts",t:"Ensembles : mem, union, inter",en:"type 'a set = Empty | Add of 'a * 'a set. (1) mem x e ; quel est son type ? (2) union de deux ensembles. (3) inter de deux ensembles.",go:"pf-rectype",who:"Corrigé officiel (fichier .ml)",sol:`${ML`let rec mem x = function
  | Empty -> false
  | Add (e, tl) -> if x = e then true else mem x tl
(* 'a -> 'a set -> bool *)

let rec union e1 e2 = match e1 with
  | Empty -> e2
  | Add (e, tl) -> if mem e e2 then union tl e2 else Add (e, union tl e2)

let rec inter e1 = function
  | Empty -> Empty
  | Add (e, tl) -> if mem e e1 then Add (e, inter e1 tl) else inter e1 tl`}`},
 {src:"Examen janvier 2022 · Ex. 2 · 7 pts",t:"my_string : des chaînes maison",en:"type my_string = Empty | Cons of char * my_string. (1) to_my_string : string vers my_string (avec String.length, String.get, String.sub). (2) from_my_string : l'inverse (avec Char.escaped). (3) my_length. (4) my_get s i : le caractère d'indice i, ou Invalid_argument.",go:"pf-rectype",who:MOI_PF,sol:`${ML`let rec to_my_string s =
  if String.length s = 0 then Empty
  else Cons (String.get s 0,
             to_my_string (String.sub s 1 (String.length s - 1)))

let rec from_my_string = function
  | Empty -> ""
  | Cons (c, r) -> Char.escaped c ^ from_my_string r

let rec my_length = function
  | Empty -> 0
  | Cons (_, r) -> 1 + my_length r

let rec my_get s i = match s with
  | Empty -> invalid_arg "my_get"
  | Cons (c, r) -> if i = 0 then c else my_get r (i - 1)`}<p>Juin 2022, ex. 3 est le même exercice avec Vide, stringVersChaine, chaineVersString, longChaine et iemeCar.</p>`},
 {src:"Examen janvier 2022 · Ex. 3 · 7 pts",t:"map_sum de trois façons",en:"map_sum f [a1; …; an] = (f a1) + … + (f an). (1) Avec List.hd et List.tl seulement ; signature ? (2) Avec le filtrage. (3) Avec List.fold_left seulement.",go:"pf-ordre-sup",who:MOI_PF,sol:`${ML`let rec map_sum f l =
  if l = [] then 0 else f (List.hd l) + map_sum f (List.tl l)
(* ('a -> int) -> 'a list -> int *)

let rec map_sum2 f = function
  | [] -> 0
  | e :: tl -> f e + map_sum2 f tl

let map_sum3 f l = List.fold_left (fun a e -> a + f e) 0 l`}`},
 {src:"Examen juin 2022 (session 2) · Ex. 1 · 6 pts",t:"prodFonc de trois façons",en:"prodFonc f [e1; …; en] = (f e1) * … * (f en). (1) Avec List.hd et List.tl ; signature ? (2) Avec le filtrage. (3) Avec List.fold_right seulement.",go:"pf-iter",who:MOI_PF,sol:`${ML`let rec prodFonc f l =
  if l = [] then 1 else f (List.hd l) * prodFonc f (List.tl l)
(* ('a -> int) -> 'a list -> int *)

let rec prodFonc2 f = function
  | [] -> 1
  | e :: tl -> f e * prodFonc2 f tl

let prodFonc3 f l = List.fold_right (fun e a -> f e * a) l 1`}`},
 {src:"Examen juin 2022 (session 2) · Ex. 2 · 7 pts",t:"Nombres de Mersenne",en:"Mₙ = 2ⁿ − 1 (n ≥ 1). (1) puis2 n avec ** et les conversions. (2) nbMersenne n. (3) estMersenneRec p n : existe-t-il un Mₖ = p avec k ≥ n ? puis estMersenne p. (4) listeMersenne n : les n premiers.",go:"pf-sujets",who:MOI_PF,sol:`${ML`let puis2 n = int_of_float (2. ** float_of_int n)

let nbMersenne n = puis2 n - 1

let rec estMersenneRec p n =
  let m = nbMersenne n in
  if m = p then true
  else if m > p then false
  else estMersenneRec p (n + 1)

let estMersenne p = estMersenneRec p 1

let rec listeMersenne n =
  if n <= 0 then [] else nbMersenne n :: listeMersenne (n - 1)`}<p>Même schéma que les nombres de Fermat de janvier 2022.</p>`});

/* ---------- quiz de l'examen de janvier (cachées avant le CC : elles visent des fiches de l'examen) ---------- */
quiz.push(
 {q:"Quel est le type de la fonction définie par let add x y = x + y ?",o:["int -> int -> int","int * int -> int","int -> int"],a:0,e:"Forme curryfiée : deux flèches.",link:"pf-curry"},
 {q:"On définit let add x y = x + y. L'expression add 1 est…",o:["une fonction int -> int","une erreur : il manque l'argument y","l'entier 1 : y vaut 0 par défaut"],a:0,e:"C'est une application partielle : add 1 attend encore y. C'est la fonction qui ajoute 1.",link:"pf-curry"},
 {q:"Quel est le type de la fonction définie par let id x = x ?",o:["'a -> 'a","int -> int","'a -> 'b"],a:0,e:"x peut être de n'importe quel type, et le résultat a le même.",link:"pf-poly"},
 {q:"Dans un type somme, un nom de constructeur…",o:["commence par une majuscule","commence par une minuscule","s'écrit entre guillemets"],a:0,e:"Ent, Rat, Empty, Node : c'est une contrainte de syntaxe.",link:"pf-somme"},
 {q:"type 'a tree = Empty | Node of 'a * 'a tree * 'a tree. La hauteur vaut 0 pour Empty, et 1 + la plus grande hauteur des deux fils pour un Node. Quelle est la hauteur de Node (1, Empty, Empty) ?",o:["1","0","2"],a:0,e:"Pour Node (v, Empty, Empty), on applique la règle : 1 + max(hauteur de Empty, hauteur de Empty) = 1 + max(0, 0) = 1. Un arbre réduit à une seule feuille a donc une hauteur de 1.",link:"pf-rectype"},
 {q:"failwith \"x\" est la même chose que…",o:["raise (Failure \"x\")","raise Not_found","invalid_arg \"x\""],a:0,e:"invalid_arg lève Invalid_argument.",link:"pf-exc"},
 {q:"try List.tl [] with Failure _ -> [] vaut…",o:["[]","une exception","[[]]"],a:0,e:"List.tl [] lève Failure, rattrapée.",link:"pf-exc"},
 {q:"Quel est le type de raise ?",o:["exn -> 'a","exn -> unit","'a -> exn"],a:0,e:"Le résultat est polymorphe : raise convient partout.",link:"pf-exc"},
 {q:"List.fold_left (fun a e -> a + e) 0 [1; 2; 3] vaut…",o:["6","[1; 2; 3]","0"],a:0,e:"fold_left part de l'accumulateur 0 et parcourt la liste de gauche à droite : 0 + 1 = 1, puis 1 + 2 = 3, puis 3 + 3 = 6. C'est la somme des éléments : ((0 + 1) + 2) + 3 = 6.",link:"pf-iter"},
 {q:"Dans List.fold_right f l init, la fonction f reçoit…",o:["l'élément, puis l'accumulateur","l'accumulateur, puis l'élément","seulement l'élément"],a:0,e:"Dans List.fold_right f l init, f reçoit d'abord l'élément, puis l'accumulateur : f e acc. C'est l'inverse de fold_left, où f reçoit l'accumulateur puis l'élément : f acc e. Exemple : List.fold_right (fun e acc -> e :: acc) [1; 2] [] vaut [1; 2].",link:"pf-iter"},
 {q:"List.filter (fun e -> e > 0) [3; -1; 2] vaut…",o:["[3; 2]","[-1]","true"],a:0,e:"On garde les éléments qui vérifient le prédicat.",link:"pf-iter"},
 {q:"Quel est le type de la fonction définie par let rec my_map f = function [] -> [] | e :: tl -> f e :: my_map f tl ?",o:["('a -> 'b) -> 'a list -> 'b list","('a -> 'a) -> 'a list","'a list -> 'b list"],a:0,e:"my_map applique f à chaque élément. f reçoit un élément de la liste, de type 'a, et rend une valeur d'un type peut-être différent, 'b : f est de type 'a -> 'b. La liste reçue est une 'a list, et le résultat contient les images, donc une 'b list. D'où ('a -> 'b) -> 'a list -> 'b list.",link:"pf-ordre-sup"},
 {q:"La fonction définie par let rec factI n a = if n = 0 then a else factI (n - 1) (n * a) est…",o:["récursive terminale","non terminale","incorrecte"],a:0,e:"L'appel récursif est la toute dernière opération : rien n'est calculé après lui.",link:"pf-terminal"},
 {q:"String.sub \"bonjour\" 3 4 vaut…",o:["\"jour\"","\"njou\"","\"bon\""],a:0,e:"À partir de l'indice 3, longueur 4.",link:"pf-sujets"},
 {q:"p est un enregistrement qui a un champ age. L'expression {p with age = 30}…",o:["crée une copie de p avec age = 30","modifie p : son champ age devient 30","est une erreur : with ne s'utilise que dans un match"],a:0,e:"Rien n'est modifié sur place en OCaml fonctionnel.",link:"pf-record"});

const infosCT=({sec})=>`<div class="title-row"><h1>L'examen de janvier en bref</h1></div>
 ${sec(1,"Quand et où",`<p>En janvier, date pas encore dans Prose. Le site suppose le lundi 11 janvier 2027 de 9h à 11h (le 11 janvier en 2024) ; je corrigerai quand Prose l'affichera. 2 h, sur papier.</p><p>Seul document : ${hl("une feuille A4 recto-verso")}. Il compte pour ${hl("67 %")} de la note de l'UE (le CC 30 %, le TP 3 %).</p>`)}
 ${sec(2,"Le programme",`<p>Tout le cours, en particulier ce qui n'était pas au CC : le filtrage, le polymorphisme, les types somme (dont récursifs : listes maison, ensembles, arbres), les enregistrements, les exceptions, l'ordre supérieur et les itérateurs de List, la récursivité terminale.</p>`)}
 ${sec(3,"La forme des anciens sujets",`<ul><li>3 exercices, environ 7 points chacun.</li><li>Un exercice d'arithmétique (Fermat, Mersenne, Pythagore) avec une fonction auxiliaire récursive et une liste à générer.</li><li>Un type somme à manipuler (my_string, chaine, nombre, 'a set) : conversion, longueur, accès, exceptions.</li><li>Une même fonction écrite de trois façons : List.hd et List.tl, puis filtrage, puis un itérateur (fold_left ou fold_right).</li><li>Consigne de chaque sujet : les fonctions à plusieurs arguments s'écrivent ${hl("curryfiées")}.</li></ul>`)}`;

SUBJ.pf={name:"Prog. fonctionnelle",code:"HAI102I",color:"#8C9BFF",coef:5,share:0.30,key:"rev-pf-v1",lang:"ml",
 exams:[{id:"cc1",label:"CC",day:"2026-11-13",start:"09:45",end:"10:45",place:"amphi 5.01 si ton nom commence par A à M, 5.03 sinon",dur:"1 h",share:0.30,unsure:""},
        {id:"ct",label:"Examen",day:"2027-01-11",start:"09:00",end:"11:00",place:"salle à confirmer",dur:"2 h",share:0.67,covers:["cc1","ct"],from:"2026-11-14",pace:{until:"2026-12-18",perDay:25},docs:"une feuille A4 recto-verso (seul document autorisé)",unsure:"Date supposée (l'examen était le 11 janvier en 2024) : je la corrigerai quand elle sera dans Prose.",prog:"Tout le cours : en plus du programme du CC, le filtrage, le polymorphisme, les types somme (dont récursifs), les enregistrements, les exceptions, l'ordre supérieur et les itérateurs de List, la récursivité terminale (TD ex. 32 à 59)."}],
 docs:"une feuille A4 recto-verso, écrite comme tu veux (seul document autorisé)",examMinutes:60,examMorning:"Refais l'entraînement « types et valeurs » une fois, relis ta feuille A4, puis les erreurs classiques.",
 prog:"Sur papier. D'après le mail du prof (5/11) : tout ce qui a été vu jusqu'aux listes incluses, sans le filtrage (TD ex. 1 à 31). Types, fonctions et signatures, récursivité sur les entiers et les listes. Le mail ne parlait pas du polymorphisme ; le CC d'octobre 2025 avait des types 'a.",
 chapters:{1:"1. Expressions et types",2:"2. Fonctions et signatures",3:"3. Récursivité sur les entiers",4:"4. Listes (TD ex. 22 à 31)",5:"5. À relire avant le contrôle",6:"6. nbOcc et listes de listes",7:"7. Le filtrage",8:"8. Polymorphisme et types",9:"9. Exceptions",10:"10. Ordre supérieur et itérateurs",11:"11. Récursivité terminale et fonctions utiles"},
 concepts,quiz,td,ann,tdTitle:"Exercices de TD corrigés",tdPrefix:"Exercice",
 tdIntro:"Les exercices de la feuille de TD jusqu'aux listes, corrigés par moi en OCaml (pas de corrigé officiel), dans la forme du cours, sans match. Les ★★★ ressemblent le plus au contrôle. Écris ta réponse sur une feuille avant d'ouvrir le corrigé.",
 annIntro:"Le partiel d'octobre 2021 a exactement le format de ton contrôle (1 h ; en 2021 sans document, cette année avec ta feuille A4). Le sujet blanc n° 2 est inventé par moi sur le même modèle, pour t'entraîner une deuxième fois. J'ai ajouté deux exercices d'examens de janvier qui restent dans ton programme. Les corrigés sont les miens.",
 pages:[{id:"infosct",t:"L'examen de janvier en bref",html:infosCT},{id:"infos",t:"Le contrôle en bref",html:infos},{id:"recettes",t:"Recettes pas à pas",html:recettes},{id:"types",t:"Entraînement types et valeurs",html:types,after:true},{id:"feuille",t:"Ma feuille à recopier",html:feuille},{id:"feuille2",t:"Ma feuille expliquée",html:feuille2}],
 /* thèmes du CC et leur poids dans le partiel d'octobre 2021 (sur 20) */
 themes:[
  {id:"rec",t:"Récursivité sur les entiers : chiffres, diviseurs",pts:7,src:"queDesUn et prodDiv au partiel 2021",les:["p-rec","p-chiffres"],fiches:["pf-rec","pf-rec-ex"]},
  {id:"listes",t:"Listes : schéma récursif, fabriquer, tester",pts:7,src:"somElem et prefLong au partiel 2021",les:["p-listes","p-schema","p-fabriquer"],fiches:["pf-listes","pf-listes-rec","pf-listes-construire","pf-listes-tests"]},
  {id:"types",t:"Types et valeurs d'une expression, if, let",pts:3,src:"question 1 du partiel 2021",les:["p-types","p-iflet"],tasks:["drill","tdtypes"],fiches:["pf-types","pf-if","pf-let","pf-erreurs"]},
  {id:"fonctions",t:"Écrire une fonction et sa signature",pts:3,src:"memeParite au partiel 2021, et la signature à chaque question",les:["p-fonctions"],fiches:["pf-fonctions","pf-signature"]},
  /* examen de janvier : barèmes de janvier 2022, juin 2022 et janvier 2024. Environ 6 points sur 20 viennent encore
     de la récursivité sur les entiers (Fermat, Mersenne, Pythagore), qui est dans les thèmes du CC. */
  {id:"somme",ex:"ct",t:"Types somme et types récursifs : chaînes maison, ensembles, arbres",pts:5.5,src:"13 points en janvier 2024, 7 sur 21 en janvier 2022",les:["p2-somme","p2-rectype"],tasks:["cttypes"],fiches:["pf-somme","pf-rectype"]},
  {id:"ordre",ex:"ct",t:"Ordre supérieur, itérateurs de List, récursivité terminale (« de trois façons »)",pts:4.5,src:"7 points sur 21 en janvier 2022, 6 en juin 2022",les:["p2-ordre-sup","p2-iter","p2-terminal"],tasks:["ctiter"],fiches:["pf-ordre-sup","pf-iter","pf-terminal"]},
  {id:"filtrage",ex:"ct",t:"Filtrage : lire et écrire un match",pts:2,src:"dans presque toutes les questions",les:["p-match","p2-match"],tasks:["ctfiltre"],fiches:["pf-match","pf-match-ecrire"]},
  {id:"exceptions",ex:"ct",t:"Exceptions : lever, définir, rattraper",pts:1,src:"une question en janvier 2024",les:["p2-exc"],tasks:["ctexc"],fiches:["pf-exc"]},
  {id:"curry",ex:"ct",t:"Curryfication, fun et polymorphisme",pts:0.5,src:"jamais une question à part",les:["p2-curry","p2-poly"],fiches:["pf-curry","pf-poly"]},
  {id:"record",ex:"ct",t:"Enregistrements",pts:0.5,src:"jamais une question à part",les:["p2-record"],fiches:["pf-record"]}],
 tasks:[
 {id:"feuille",t:"Recopier à la main ta feuille A4 recto-verso et la relire",min:30,p:1,manual:true,links:[["p/feuille","Ma feuille à recopier"]],why:"Mail du prof (5/11) : « le seul document autorisé est une feuille A4 recto-verso ». Pas d'imprimante : la page la donne ligne par ligne."},
 {id:"drill",t:"Entraînement « types et valeurs » sans faute",min:15,p:1,manual:true,links:[["p/types","Entraînement"]]},
 {id:"p21",t:"Examen blanc : partiel 2021 en 1 h, puis correction",min:65,p:1,manual:true,links:[["annales","Annales et chrono"]],why:"Exactement le format de ton contrôle."},
 {id:"tdtypes",t:"TD sur les types et les signatures (exercices 2, 5 et 6)",min:30,p:1,td:["2","5","6"],links:[["td","Exercices de TD"]],why:"Ils ressemblent aux questions 1 et 2 du partiel 2021 (6 points)."},
 {id:"tdex",t:"Exercices de TD ★★★ sur papier",min:60,p:1,td:["18","21","24","26","27","28"],links:[["td","Exercices de TD"]]},
 {id:"blanc2",t:"Deuxième sujet blanc (inventé sur le modèle du partiel 2021), en 1 h",min:65,p:2,manual:true,links:[["annales","Annales et chrono"]],why:"Un deuxième entraînement complet, avec d'autres fonctions que celles du partiel."},
 {id:"tdex2",t:"Exercices ★★★ de plus : derListe, prefixe et suffixe",min:40,p:2,td:["25","31"],links:[["td","Exercices de TD"]]},
 {id:"fermat",t:"Exercices d'examen : Fermat et Pythagore",min:40,p:3,manual:true,links:[["annales","Annales"]]},
 {id:"quiz",t:"Quiz de cours : au moins 80 %",min:15,p:1,quiz:0.8,last:true,links:[["quiz","Quiz de cours"]]},
 {id:"review",t:"Veille du CC : « Réviser » jusqu'à 0 carte, puis les fiches en rouge",min:25,p:1,manual:true,review:true,last:true,links:[["#/reviser","Réviser"]]},
 {id:"ctfiltre",ex:"ct",t:"TD ★★★ du filtrage et du polymorphisme, sur papier",min:40,p:1,td:["39","40","41"],links:[["td","Exercices de TD"]]},
 {id:"cttypes",ex:"ct",t:"TD ★★★ des types somme et des arbres, sur papier",min:45,p:1,td:["42","43","44"],links:[["td","Exercices de TD"]]},
 {id:"ctexc",ex:"ct",t:"TD ★★★ des exceptions, sur papier",min:45,p:1,td:["47","48","50","51"],links:[["td","Exercices de TD"]]},
 {id:"ctiter",ex:"ct",t:"TD ★★★ de l'ordre supérieur et des itérateurs, sur papier",min:50,p:1,td:["53","57","58","59"],links:[["td","Exercices de TD"]]},
 {id:"ctblanc1",ex:"ct",t:"Examen blanc : janvier 2024 en 2 h, puis correction",min:130,p:1,manual:true,links:[["annales","Annales et chrono"]],why:"Exceptions, type nombre, fold_right, ensembles : la forme exacte de l'examen."},
 {id:"ctblanc2",ex:"ct",t:"Annale de janvier 2022 en 2 h, puis correction",min:130,p:1,manual:true,links:[["annales","Annales et chrono"]]},
 {id:"ctblanc3",ex:"ct",t:"Annale de juin 2022 en 2 h",min:120,p:2,manual:true,links:[["annales","Annales et chrono"]]},
 {id:"ctfeuille",ex:"ct",t:"Compléter ta feuille A4 pour janvier (types somme, exceptions, itérateurs)",min:30,p:1,manual:true,links:[["p/feuille","Ma feuille à recopier"]]},
 {id:"ctquiz",ex:"ct",t:"Quiz de cours, questions de janvier comprises : au moins 80 %",min:15,p:1,manual:true,last:true,links:[["quiz","Quiz de cours"]]},
 {id:"ctreview",ex:"ct",t:"Veille de l'examen : « Réviser » jusqu'à 0 carte, puis les fiches en rouge",min:25,p:1,manual:true,review:true,last:true,links:[["#/reviser","Réviser"]]}]};
/* la page d'entraînement monte l'exercice interactif */
SUBJ.pf.pages.find(p=>p.id==="feuille2").render=(root,ctx)=>{root.innerHTML=feuille2(ctx);W.mq(root);};
SUBJ.pf.pages.find(p=>p.id==="types").render=(root,ctx)=>{root.innerHTML=types(ctx);W.drill(root.querySelector("#drill"),DRILL,CHOICES);};
})();
