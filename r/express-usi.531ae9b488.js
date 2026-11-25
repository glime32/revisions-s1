/* L'examen d'USI en 2 h (vendredi 15/01, date supposée, 100 % de la note, aucun document).
   Moitié Pompidor (10 points) : la forme de ses sujets de 2023 à 2026, regex et find 2 à 3 points, Bash 2 à 2,5,
   Python 4,5 à 6 (CSV, dictionnaire, parcours récursif en 2025 et 2026). Moitié Meynard (10 points) : aucun ancien
   sujet, points estimés d'après la place de chaque chapitre dans son cours et ses TD (thèmes de matiere-usi.js).
   Relecture de menthe (24/11) prise en compte : chaque exercice tiré ne demande que ce que sa notion montre, et le sujet
   express n'utilise pas les paliers des notions. Les exemples des méthodes sont exécutés par tools/verif/express/usi.js
   (vrais bash, python3 et gcc). Les exercices sont tirés de gen-usi.js. */
(()=>{
const d36=h=>String(h).replace(/\$/g,"&#36;");
const bloc=l=>(s,...v)=>d36(W.code(String.raw(s,...v),l)),SH=bloc("sh"),PY=bloc("py"),CC=bloc("c");
const K=(s,...v)=>"<code>"+d36(W.esc(String.raw(s,...v)))+"</code>";
(window.EXPRESS=window.EXPRESS||{}).usi={exam:{
 t:"L'examen d'USI en 2 h",du:"de l'examen",au:"à l'examen",duree:120,
 lead:"Tout le programme de l'examen de janvier, sans document, dans l'ordre de ce qui rapporte le plus. La moitié de Pompidor (10 points) suit ses sujets de 2023 à 2026 : le Python avec un fichier CSV, un dictionnaire et le parcours récursif d'un dossier, puis le script Bash, les expressions régulières et find. La moitié de Meynard (10 points) n'a aucun ancien sujet : ses points sont estimés d'après son cours et ses TD. Pour chaque notion : l'essentiel, la méthode sur un exemple, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20.",
 carte:"tout l'examen en 2 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Les deux moitiés de l'examen : d'abord celle de Pompidor, dans l'ordre de ses sujets (regex, find, Bash, Python), puis celle de Meynard (umask, liens, processus, tubes, un programme C). Fais-les sans revenir aux notions. La note qui sort est une estimation : pour la moitié de Meynard, il n'y a aucun ancien sujet.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"csv",t:"Python : un fichier CSV dans un dictionnaire",pts:2,ou:"Pompidor, dernière question (2025, 2026)",lect:2.5,exo:{g:"US8",lv:2},
  ess:`<ul><li>On ouvre avec ${K`with open("images.csv") as fd:`}, puis on lit les lignes : ${K`fd.readlines()`} (une liste) ou ${K`for ligne in fd:`}.</li>
<li>Chaque ligne se découpe : ${K`ligne.strip().split(",")`} donne la liste des champs.</li>
<li>${K`d[cle] = valeur`} crée ou remplace une entrée. Pour une liste par clé : ${K`if cle in d: d[cle].append(x)`}, sinon ${K`d[cle] = [x]`}.</li>
<li>Le nom du fichier donné au script (${K`python3 recus.py notes.csv`}) est ${K`sys.argv[1]`}, après ${K`import sys`}. S'il manque, ${K`len(sys.argv) < 2`} : on affiche un message et on arrête avec ${K`sys.exit()`}.</li></ul>`,
  piege:`Sans ${K`strip()`}, le dernier champ garde son retour à la ligne (${K`"12\n"`}). Et un nombre lu dans un fichier est du texte : ${K`int("12")`} pour compter avec.`,
  meth:`<p>Le fichier donné en paramètre :</p>${PY`import sys
if len(sys.argv) < 2:
    print("Donne le nom du fichier")
    sys.exit()
print("Je lis", sys.argv[1])`}
<p>Janvier 2026 : le dictionnaire ${K`statistiques`}, avec ce fichier images.csv.</p>${SH`jpg,png,gif,webp
10,25,0,12`}${PY`statistiques = {}
with open("images.csv") as fd:
    lignes = fd.readlines()
    images = lignes[0].strip().split(",")
    nombres = lignes[1].strip().split(",")
    for i in range(len(images)):
        statistiques[images[i]] = int(nombres[i])
print(statistiques)`}
<ol><li>Sans paramètre, le premier script affiche « Donne le nom du fichier » et s'arrête ; avec notes.csv, il affiche « Je lis notes.csv ».</li>
<li>images.csv a deux lignes : la première donne les clés, la seconde les nombres, à la même place.</li>
<li>${K`range(len(images))`} parcourt les places 0, 1, 2, 3. Affichage : ${K`{'jpg': 10, 'png': 25, 'gif': 0, 'webp': 12}`}.</li></ol>`},
 {id:"parcours",t:"Python : le parcours récursif d'un dossier",pts:3,ou:"Pompidor, dernière question (janvier et juin 2025, 2026)",lect:2,
  rappel:{min:5,q:`Écris de mémoire le script qui compte, dans un dictionnaire ${K`nb`}, les fichiers de chaque extension, dans le dossier donné en paramètre et dans tous ses sous-dossiers, avec une fonction récursive.`,
   r:PY`import os, sys

nb = {}

def parcours(dossier):
    for fichier in os.listdir(dossier):
        chemin = dossier + os.path.sep + fichier
        if os.path.isdir(chemin):
            parcours(chemin)
        else:
            data = fichier.split(".")
            if len(data) > 1:
                ext = data[-1]
                if ext in nb:
                    nb[ext] += 1
                else:
                    nb[ext] = 1

parcours(sys.argv[1])
print(nb)`},
  ess:`<ul><li>${K`os.listdir(dossier)`} donne les <b>noms</b> de ce qu'il y a dans le dossier, sans le chemin.</li>
<li>Le chemin complet : ${K`dossier + os.path.sep + nom`} (ou ${K`dossier + "/" + nom`}).</li>
<li>${K`os.path.isdir(chemin)`} : si c'est un dossier, la fonction <b>s'appelle elle-même</b> dessus ; sinon on traite le fichier.</li>
<li>Le dossier donné au script : ${K`sys.argv[1]`}. En haut : ${K`import os, sys`}.</li></ul>`,
  piege:`Écrire ${K`os.path.isdir(nom)`} teste le nom depuis le dossier où tu as lancé le script, pas dans le sous-dossier : passe toujours le chemin complet. Et l'extension, c'est ${K`nom.split(".")[-1]`}, seulement si le nom contient un point.`,
  meth:`<p>Janvier 2026, suite : compter dans ${K`statistiques`} les images trouvées dans tous les sous-dossiers.</p>${PY`def parcours(dossier):
    for fichier in os.listdir(dossier):
        chemin = dossier + os.path.sep + fichier
        if os.path.isdir(chemin):
            parcours(chemin)
        else:
            data = fichier.split(".")
            if len(data) > 1 and data[-1] in statistiques:
                statistiques[data[-1]] += 1

parcours(sys.argv[1])
print(statistiques)`}
<ol><li>Un dossier : on descend dedans, avec le chemin complet.</li>
<li>Un fichier : on prend son extension ; si c'est une clé du dictionnaire, on ajoute 1.</li>
<li>Avec a.jpg, s1/b.png, s1/s2/c.jpg et notes.txt : ${K`{'jpg': 12, 'png': 26, 'gif': 0, 'webp': 12}`}. notes.txt est ignoré : txt n'est pas une clé.</li></ol>
<p>À toi ensuite : le même parcours, de mémoire, qui crée lui-même les clés. Le sujet express te le fera écrire entier.</p>`},
 {id:"bash",t:"Un script Bash : variables, boucle et test",pts:2.5,ou:"Pompidor, question 2 ou 3 (2 à 2,5 points chaque année)",lect:2.5,exo:{g:"US7",lv:2},
  ess:`<ul><li>Une variable : ${K`n=0`}, sans espace autour du =, puis ${K`$n`} pour la lire. Un calcul : ${K`n=$((n + 1))`}.</li>
<li>${K`$1`} est le premier paramètre, ${K`$#`} le nombre de paramètres, et ${K`for p in "$@"`} parcourt tous les paramètres, un par un.</li>
<li>${K`for f in *.txt`} : bash remplace ${K`*.txt`} par les fichiers du dossier courant qui finissent par .txt. ${K`for mot in $(cat $1)`} : les mots du fichier passé en paramètre.</li>
<li>Un test : ${K`if [ -f "$f" ]`} (un fichier ordinaire), ${K`[ -d "$f" ]`} (un répertoire), ${K`[ $# -ne 1 ]`}, puis ${K`then … fi`}. Une boucle : ${K`do … done`}.</li></ul>`,
  piege:`Avec des espaces, ${K`n = 0`} ne marche pas : bash cherche une commande n. À l'inverse, il faut des espaces dans les crochets : ${K`[ $# -eq 1 ]`}. Et ${K`ls $1`} donne des noms seuls : le chemin est ${K`$1/$f`}.`,
  meth:`<p>Janvier 2026 (2 points) : ajouter le préfixe old à tous les fichiers .txt du dossier courant.</p>${SH`for fichier in *.txt
do
    mv "$fichier" "old$fichier"
done`}
<p>Comme en 2023 et 2024 : la somme des nombres du fichier donné en paramètre.</p>${SH`somme=0
for nombre in $(cat $1)
do
    somme=$((somme + nombre))
done
echo $somme`}
<p>Comme en 2023 et juin 2025 : compter les fichiers ordinaires du dossier donné en paramètre.</p>${SH`n=0
for f in $1/*
do
    if [ -f "$f" ]
    then
        n=$((n + 1))
    fi
done
echo $n`}
<ol><li>Avec a.txt, b.txt et c.sh, le premier laisse olda.txt, oldb.txt et c.sh.</li>
<li>Avec un fichier qui contient « 3 5 » puis « 10 », le deuxième affiche 18.</li>
<li>Dans un dossier avec deux fichiers et un sous-dossier, le troisième affiche 2 : le sous-dossier n'est pas un fichier ordinaire.</li></ol>`},
 {id:"droits",t:"Les droits : qui peut faire quoi, chmod et umask",pts:1.5,ou:"Meynard, estimé (TD ex. 16, 17 et 25)",lect:2,exo:{g:"US1",lv:3},
  ess:`<ul><li>Trois groupes de trois lettres : le propriétaire (u), le groupe (g), les autres (o). r = 4, w = 2, x = 1 : rwxr-x--- s'écrit 750.</li>
<li>Sur un fichier : r pour le lire, w pour le modifier. Sur un répertoire : r pour lister, w pour y créer ou supprimer, x pour y entrer ou le traverser.</li>
<li>Supprimer un fichier demande w sur le <b>répertoire</b>, pas sur le fichier.</li>
<li>chmod en chiffres (${K`chmod 750 projet`}) ou en lettres : ${K`chmod g-w tp`} retire w au groupe, ${K`chmod u+x s.sh`} ajoute x au propriétaire, ${K`chmod o=r f`} donne exactement r aux autres.</li>
<li>Le umask retire des droits : un nouveau fichier part de 666, un nouveau répertoire de 777.</li></ul>`,
  piege:`Le umask enlève des bits, il ne se soustrait pas : 666 avec umask 033 donne 644, pas 633.`,
  meth:`<p>Le répertoire tp est en 770 (rwxrwx---).</p>${SH`chmod 750 projet
chmod g-w tp
umask 027
touch f
mkdir d`}
<ol><li>${K`chmod 750 projet`} : 7 = rwx, 5 = r-x, 0 = --- ; projet devient rwxr-x---.</li>
<li>${K`chmod g-w tp`} : le groupe perd w ; tp passe de rwxrwx--- à rwxr-x--- (750). Les autres droits ne bougent pas.</li>
<li>Avec umask 027 : le fichier f naît en 640 (rw-r-----), le répertoire d en 750 (rwxr-x---).</li>
<li>Avec umask 033 : un fichier naît en 644. 6 = 110 et 3 = 011 : on barre le dernier bit, il reste 100 = 4.</li></ol>`},
 {id:"regex",t:"Les expressions régulières avec grep -E",pts:1.5,ou:"Pompidor, question 1 (2024, 2025, 2026)",lect:2,exo:{g:"US6",lv:2},
  ess:`<ul><li>${K`^`} colle au début, ${K`$`} à la fin. ${K`.`} est n'importe quel caractère, ${K`\.`} un vrai point.</li>
<li>${K`[0-9]`} un chiffre, ${K`[a-z]`} une minuscule, ${K`[^/]`} n'importe quel caractère <b>sauf</b> / (la classe niée).</li>
<li>Après un morceau : ${K`+`} une fois ou plus, ${K`*`} zéro fois ou plus, ${K`?`} facultatif, ${K`{2}`} exactement 2 fois, ${K`{1,3}`} de 1 à 3 fois. ${K`(jpg|jpeg)`} : l'un ou l'autre. Ces signes demandent ${K`grep -E`}.</li></ul>`,
  piege:`Sans ${K`^`} ni ${K`$`}, l'expression trouve un morceau n'importe où : ${K`\.jpg`} garde aussi photo.jpg.bak.`,
  meth:`<p>Janvier 2026 (2 points) : les fichiers du dossier courant qui finissent par .jpg ou .jpeg.</p>${SH`ls | grep -E "\.jpe?g$"`}
<ol><li>${K`\.`} pour le vrai point, ${K`e?`} pour le e facultatif, ${K`$`} pour la fin du nom.</li>
<li>Parmi a.jpg, b.jpeg, c.jpg.bak, d.png et xjpg, il garde a.jpg et b.jpeg.</li>
<li>Janvier 2025 : « deux entiers séparés par un point », c'est ${K`^[0-9]+\.[0-9]+$`}. 12.5 passe ; 12.5.3 et .5 ne passent pas.</li>
<li>Janvier 2024 : « deux points, et seulement deux » : ${K`^[^.]*\.[^.]*\.[^.]*$`}. Entre les points, ${K`[^.]*`} : tout sauf un point. a.b.c passe ; a.b et a.b.c.d ne passent pas.</li></ol>`},
 {id:"processus",t:"Les processus, et l'enchaînement des commandes",pts:1.5,ou:"Meynard, estimé (cours et TD ex. 30 à 39)",lect:1.5,exo:{g:"US10",lv:1},
  ess:`<ul><li>Pour une commande externe, bash crée un processus : il se clone (fork), le clone devient la commande (exec), bash attend (wait). Les commandes internes (cd, echo, export, exit) n'en créent pas.</li>
<li>${K`a ; b`} : les deux. ${K`a && b`} : b seulement si a réussit. ${K`a || b`} : b seulement si a échoue.</li>
<li>${K`$?`} est le code de retour de la dernière commande : 0 veut dire réussite.</li></ul>`,
  piege:`La commande ${K`echo`} est interne : aucun processus. Et un code de retour 0 est une réussite, pas un échec.`,
  meth:`${SH`ls /inexistant ; echo $?
false && echo A || echo B
true && echo A || echo B`}
<ol><li>ls échoue (le dossier n'existe pas) : ${K`$?`} vaut 2, et echo affiche 2.</li>
<li>false échoue : echo A est sauté, || lance echo B. On lit B.</li>
<li>true réussit : A s'affiche ; echo A réussit, donc echo B est sauté.</li>
<li>${K`ls | grep txt | wc -l`} crée 3 processus, qui tournent en même temps.</li></ol>`},
 {id:"tubes",t:"Tubes et filtres",pts:1.5,ou:"Meynard, estimé (TD ex. 36 et 39)",lect:1.5,exo:{g:"US4",lv:2},
  ess:`<ul><li>${K`a | b`} : ce que a affiche devient l'entrée de b.</li>
<li>Les filtres : ${K`sort`} (tri en texte ; ${K`-n`} en nombres, ${K`-r`} à l'envers), ${K`head -n 3`}, ${K`tail -n 2`}, ${K`cut -d: -f1`} (le 1<sup>er</sup> champ, séparé par :), ${K`grep motif`}, ${K`wc -l`} (le nombre de lignes).</li>
<li>${K`>`} écrit dans un fichier (en l'écrasant), ${K`>>`} ajoute à la fin, ${K`<`} lit un fichier.</li></ul>`,
  piege:`La commande ${K`sort`} sans ${K`-n`} trie comme des mots : 10 passe avant 9.`,
  meth:`<p>Le fichier notes.txt :</p>${SH`alice:12
bob:9
chloe:15
david:10`}${SH`cut -d: -f2 notes.txt | sort -n | head -n 1
cut -d: -f2 notes.txt | sort | head -n 1`}
<ol><li>${K`cut -d: -f2`} garde les notes : 12, 9, 15, 10.</li>
<li>${K`sort -n`} les range en nombres : 9, 10, 12, 15 ; la première ligne est 9.</li>
<li>Sans -n, le tri est celui des mots : 10, 12, 15, 9 ; la première ligne est 10.</li></ol>`},
 {id:"compil",t:"La chaîne de compilation : gcc, en-têtes, argc et argv",pts:1,ou:"Meynard, estimé (chapitre 5 du cours, TD ex. 47 à 52)",lect:2,exo:{g:"US9",lv:1},
  ess:`<ul><li>Un <b>interpréteur</b> (bash, python3) lit le programme et l'exécute au fur et à mesure ; un <b>compilateur</b> (gcc) le traduit d'abord en entier en un exécutable.</li>
<li>Les étapes de gcc : le prétraitement (les ${K`#include`} sont recopiés ; ${K`gcc -E`}), la compilation en langage d'assemblage (${K`gcc -S`}, fichier .s), l'assemblage en fichier objet (${K`gcc -c`}, fichier .o), puis l'édition des liens, qui donne l'exécutable.</li>
<li>Un fichier d'en-tête (${K`stdio.h`}) <b>déclare</b> les fonctions ; une bibliothèque contient leur code déjà compilé, ajouté à l'édition des liens (${K`-lm`} pour la bibliothèque mathématique). Deux autres options : ${K`-Wall`} affiche tous les avertissements, ${K`-g`} ajoute les informations de débogage pour gdb.</li>
<li>${K`int main(int argc, char *argv[])`} : argc compte les mots de la commande, nom du programme compris ; ${K`argv[0]`} est ce nom, ${K`argv[1]`} le premier paramètre, du texte (${K`atoi`} pour un nombre).</li></ul>`,
  piege:`Sans option, gcc va jusqu'à l'exécutable et l'appelle a.out. Et ${K`-o`} donne le nom du résultat : ${K`gcc -o prog.c prog.c`} écraserait ton fichier source.`,
  meth:`<p>Le fichier double.c :</p>${CC`#include <stdio.h>
#include <stdlib.h>
int main(int argc, char *argv[]) {
  printf("%d %s\n", argc, argv[0]);
  if (argc > 1) printf("%d\n", 2 * atoi(argv[1]));
  return 0;
}`}${SH`gcc -c double.c
gcc -o double double.o
./double 21`}
<ol><li>${K`gcc -c double.c`} s'arrête au fichier objet double.o, sans édition des liens.</li>
<li>${K`gcc -o double double.o`} fait l'édition des liens et nomme l'exécutable double.</li>
<li>${K`./double 21`} : argc vaut 2 et argv[0] est « ./double », donc la première ligne est « 2 ./double ». Puis atoi("21") = 21, et le programme affiche 42.</li></ol>`},
 {id:"c",t:"Le C : passage par valeur, portée et static",pts:1,ou:"Meynard, estimé (cours et TD, aucun ancien sujet)",lect:2.5,exo:{g:"US9",lv:2},
  ess:`<ul><li>En C, une fonction reçoit une <b>copie</b> de ses paramètres : la modifier ne change pas la variable de l'appelant. Pour la changer, on passe son <b>adresse</b> ${K`&a`}, et la fonction écrit ${K`*p = …`}.</li>
<li><b>Portée</b> : un nom désigne la déclaration la plus proche, en remontant les blocs ${K`{ … }`} qui l'entourent. Un x déclaré dans un bloc, ou un paramètre x, cache la variable globale x.</li>
<li>Une variable locale vit dans la pile, le temps de l'appel. ${K`static`} a deux sens : devant une variable locale, elle est créée une seule fois dans le segment statique et garde sa valeur d'un appel à l'autre ; devant une variable globale, elle n'est visible que dans son fichier.</li></ul>`,
  piege:`La fonction ${K`void plus1(int x) { x = x + 1; }`} ne change rien dans main : x est une copie.`,
  meth:`${CC`#include <stdio.h>
void plus1(int x) { x = x + 1; }
void plus1p(int *p) { *p = *p + 1; }
int compte(void) { static int n = 0; n = n + 1; return n; }
int main(void) {
  int a = 5;
  plus1(a);
  printf("%d\n", a);
  plus1p(&a);
  printf("%d\n", a);
  compte(); compte();
  printf("%d\n", compte());
  return 0;
}`}
<ol><li>${K`plus1(a)`} travaille sur une copie : on affiche 5.</li>
<li>${K`plus1p(&a)`} écrit à l'adresse de a : on affiche 6.</li>
<li>n est static : 1, puis 2, puis 3. On affiche 3.</li></ol>
<p>La portée :</p>${CC`#include <stdio.h>
int x = 1;
void f(int x) { printf("%d\n", x); }
int main(void) {
  { int x = 3; printf("%d\n", x); }
  printf("%d\n", x);
  f(7);
  return 0;
}`}
<ol><li>Dans le bloc, le x le plus proche vaut 3 : on affiche 3.</li>
<li>Hors du bloc, on remonte jusqu'à la globale : 1.</li>
<li>Dans f, le paramètre x cache la globale : 7.</li></ol>`},
 {id:"find",t:"find : chercher des fichiers",pts:1,ou:"Pompidor, question 1 (2025)",lect:1,exo:{g:"US5",lv:3},
  ess:`<ul><li>${K`find départ -name "motif"`} : le départ est ${K`.`} (ici), ${K`..`} (le dossier parent) ou ${K`~`} (ta maison) ; le motif utilise ${K`*`}.</li>
<li>${K`-type f`} pour les fichiers, ${K`-type d`} pour les répertoires.</li>
<li>${K`-exec commande {} \;`} lance la commande sur chaque fichier trouvé.</li></ul>`,
  piege:`Le motif se met entre guillemets, sinon bash remplace ${K`*.txt`} avant find. Et ${K`-name DATA`} ne trouve que le nom exact DATA.`,
  meth:`${SH`find .. -name "*DATA*"
find . -type f -name "*.txt" -exec wc -l {} \;`}
<ol><li>Janvier 2025 (1 point) : les fichiers dont le nom contient DATA, à partir du dossier parent.</li>
<li>La 2<sup>e</sup> ligne affiche le nombre de lignes de chaque fichier .txt, dans tous les sous-dossiers.</li></ol>`},
 {id:"liens",t:"Inodes et liens : ln, ln -s, rm",pts:1,ou:"Meynard, estimé (TD ex. 21 à 29)",lect:1.5,exo:{g:"US3",lv:0},
  ess:`<ul><li>Un <b>inode</b> est la fiche d'un fichier : son type, ses droits, sa taille, son nombre de liens et les adresses de ses blocs. Le nom n'y est pas : il est rangé dans le répertoire, avec le numéro de l'inode.</li>
<li>Un <b>lien dur</b> (${K`ln a b`}) est un deuxième nom pour le même inode : le compteur de liens passe à 2.</li>
<li>Un <b>lien symbolique</b> (${K`ln -s a c`}) est un petit fichier qui contient le chemin a.</li>
<li>${K`rm`} enlève un nom ; les données disparaissent quand le compteur arrive à 0.</li>
<li>Un répertoire a 2 + (nombre de ses sous-répertoires) liens : son nom, son ${K`.`} et le ${K`..`} de chaque sous-répertoire. Un inode qui n'a qu'un lien ne peut donc pas être un répertoire.</li></ul>`,
  piege:`Après ${K`rm a`}, le lien symbolique c est cassé, mais le lien dur b marche toujours.`,
  meth:`${SH`echo bonjour > a
ln a b
ln -s a c
rm a
cat b
cat c`}
<ol><li>Après ${K`ln a b`}, a et b sont le même inode, avec 2 liens.</li>
<li>${K`rm a`} : il reste 1 lien, b. ${K`cat b`} affiche bonjour.</li>
<li>c contient le chemin a, qui n'existe plus : ${K`cat c`} donne une erreur.</li>
<li>Un répertoire r qui a deux sous-répertoires s1 et s2 a 4 liens.</li></ol>`},
 {id:"taille",t:"La taille maximale d'un fichier",pts:1,ou:"Meynard, estimé (exercices de son cours)",lect:1.5,exo:{g:"US3",lv:2},
  ess:`<ul><li>L'inode garde 10 adresses directes de blocs, puis une simple indirecte (un bloc rempli d'adresses), une double et une triple.</li>
<li>n = taille d'un bloc ÷ taille d'une adresse : le nombre d'adresses dans un bloc.</li>
<li>Taille maximale = (10 + n + n² + n³) × taille d'un bloc. Avec seulement deux niveaux d'indirection, on s'arrête à n². Calcule en puissances de 2 : 1 Kio = 2¹⁰ octets.</li>
<li>Blocs 2 fois plus grands : n double aussi, donc le terme n³ × bloc est multiplié par 2 × 2 × 2 × 2 = 16 (un facteur par niveau d'adresses, un pour le bloc).</li>
<li>Les blocs qui ne contiennent que des adresses sont « volés » aux données : un fichier de m blocs de données en demande environ m ÷ n de plus.</li></ul>`,
  piege:`Si le champ « taille » de l'inode n'a que 32 bits, un fichier ne dépasse pas 2³² octets = 4 Gio, même quand les blocs permettraient plus.`,
  meth:`<p>Blocs de 1 Kio, adresses de 4 octets.</p>
<ol><li>n = 2¹⁰ ÷ 2² = 2⁸ = 256 adresses par bloc.</li>
<li>Blocs atteints : 10 + 2⁸ + 2¹⁶ + 2²⁴.</li>
<li>Fois 1 Kio : 10 Kio + 256 Kio + 64 Mio + 16 Gio, environ 16 Gio.</li></ol>`},
 {id:"chemins",t:"Les chemins : absolus, relatifs, cd",pts:1,ou:"Meynard, estimé (TD ex. 7 à 11)",lect:1,exo:{g:"US2",lv:1},
  ess:`<ul><li>Un chemin <b>absolu</b> commence par ${K`/`}, la racine. Un chemin <b>relatif</b> part du dossier où tu es.</li>
<li>${K`.`} est le dossier courant, ${K`..`} le parent, ${K`~`} ta maison. ${K`cd`} tout seul ramène à la maison ; ${K`pwd`} affiche où tu es.</li>
<li>Un cd vers un dossier qui n'existe pas, ou vers un fichier, échoue : tu restes où tu étais.</li></ul>`,
  piege:`Un chemin relatif change de sens quand tu changes de dossier : refais le trajet un cd à la fois.`,
  meth:`<p>Tu es dans /home/alice/l1.</p>${SH`cd ../docs
pwd
cd ../../bob/./src/..
pwd`}
<ol><li>${K`..`} remonte à /home/alice, puis on entre dans docs : /home/alice/docs.</li>
<li>Deux .. : /home ; puis bob, ${K`.`} ne bouge pas, src, et .. ressort : /home/bob.</li></ol>`},
 {id:"systeme",t:"Le système d'exploitation : le vocabulaire",pts:0.5,ou:"Meynard, estimé (introduction du cours)",lect:1,
  rappel:{min:2,q:`Qu'est-ce qu'un système d'exploitation ? Donne les couches d'Unix, du matériel jusqu'à toi, et ce que font fork, exec et wait quand bash lance ls.`,
   r:`<p>Un système d'exploitation est la couche logicielle qui sert d'interface entre la machine matérielle et les utilisateurs. Unix est écrit en C.</p><p>Les couches : le matériel, le noyau, les bibliothèques, puis les applications et bash.</p><p>fork : bash se clone. exec : le clone se remplace par le code de ls. wait : bash attend la fin du clone et range son code de retour dans ${K`$?`}.</p>`},
  ess:`<ul><li>Le système d'exploitation est la couche logicielle entre la machine et les utilisateurs. Il partage le processeur et la mémoire entre les programmes, et gère les utilisateurs et les périphériques.</li>
<li>Unix, en couches : le matériel, le noyau, les bibliothèques, les applications et bash.</li>
<li>Une application appelle la bibliothèque C (${K`printf`}, ${K`man 3`}) et le noyau (${K`fork`}, ${K`man 2`}).</li></ul>`,
  piege:`La racine s'écrit ${K`/`}, pas l'anti-slash.`,
  meth:`<p>Quand tu tapes ${K`ls`} dans bash :</p>
<ol><li>bash se clone (fork) ;</li><li>le clone se remplace par le code de /bin/ls (exec), et affiche dans le terminal dont il a hérité ;</li><li>bash attend sa fin (wait) et lit son code de retour.</li></ol>`}],
 blanc:[
  {t:"La commande grep -E entière",ou:"Pompidor, question 1",pts:2,g:"US6",lv:3},
  {t:"Une commande find",ou:"Pompidor, question 1",pts:1,g:"US5",lv:1},
  {t:"Un script Bash avec une boucle et un test",ou:"Pompidor, question 2",pts:2.5,g:"US7",lv:3},
  {t:"Le parcours récursif en Python",ou:"Pompidor, question 3",pts:4.5,g:"US8",lv:3},
  {t:"Le umask",ou:"Meynard",pts:2,g:"US1",lv:2},
  {t:"ln, ln -s, rm",ou:"Meynard",pts:2,g:"US3",lv:1},
  {t:"Combien de processus",ou:"Meynard",pts:2,g:"US10",lv:0},
  {t:"Ce qu'affiche un tube",ou:"Meynard",pts:2,g:"US4",lv:0},
  {t:"Un programme C et son code de retour",ou:"Meynard",pts:2,g:"US9",lv:3}]
}};
window.EXPRESS.usi.exam.notions.forEach(n=>{n.piege="<p>"+n.piege+"</p>";});
})();
