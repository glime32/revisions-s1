/* Leçons pas à pas d'USI (HAI103I, Michel Meynard et Pierre Pompidor). Examen écrit en janvier, 2 h, aucun document.
   Partie Pompidor : find, regex, script Bash, script Python (même forme de 2022 à 2026, d'après ses annales).
   Partie Meynard : pas d'ancien sujet trouvé ; les leçons suivent son cours et ses TD. */
(function(){
const LES=window.LESSONS=window.LESSONS||{};
const L=(h,x,o)=>Object.assign({k:"learn",h,x},o||{});
const Q=(q,o,a,e,x)=>Object.assign({k:"qcm",q,o,a,e},x||{});
const S=(h,intro,s,x)=>Object.assign({k:"steps",h,intro,s},x||{});
const P=(h,x,sol,check,min,o)=>Object.assign({k:"paper",h,x,sol,check,min},o||{});
const K=(f,b)=>({k:"card",f,b});
const B=(q,code,b,e,x)=>Object.assign({k:"blanks",q,code,b,e,lang:"sh"},x||{});
const O=(q,lines,e,x)=>Object.assign({k:"order",q,lines,e,lang:"sh"},x||{});
const R=String.raw;
const k=(s,...v)=>`<code>${W.esc(String.raw(s,...v))}</code>`;
const blk=lang=>(s,...v)=>W.code(String.raw(s,...v),lang);
const SH=blk("sh"),PY=blk("py"),CC=blk("c"),TX=blk("txt");
const box=s=>`<div class="formula">${s}</div>`;
const tb=(head,rows)=>`<div style="overflow-x:auto"><table class="tbl"><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

LES.usi=[
/* ------------------------------------------------------------------ */
{id:"u-intro",t:"Le système d'exploitation et Unix",min:9,goal:"Savoir dire ce qu'est un système d'exploitation, à quoi il sert, et comment Unix est organisé en couches (début du cours de Meynard, TD ex. 1).",steps:[
 Q("À ton avis, lequel de ces trois est un système d'exploitation ?",["Linux","Python","Firefox"],0,"Python est un langage et Firefox une application : tous les deux ont besoin d'un système d'exploitation pour tourner."),
 L("Un système d'exploitation",`<p>Définition du cours : un système d'exploitation (SE) est une <b>couche logicielle offrant une interface entre la machine matérielle et les utilisateurs</b>.</p><p>Ses objectifs :</p><ul><li>la convivialité de l'interface (graphique ou en ligne de commande) ;</li><li>la clarté et la généricité des concepts (arborescence de répertoires et fichiers, droits des utilisateurs…) ;</li><li>l'efficacité de l'allocation des ressources, en temps et en espace.</li></ul><p>Ses services : il est <b>multiprogrammé</b> (ou multi-tâches : plusieurs programmes tournent en même temps), <b>multi-utilisateurs</b> (chacun s'authentifie), il pilote les périphériques et gère le réseau.</p><p>Principaux systèmes : Windows ; les Unix (GNU/Linux, BSD…) ; Mac OS X et iOS, dérivés d'Unix ; Android, basé sur un noyau Linux.</p>`),
 Q("Un système d'exploitation est…",["une couche logicielle entre la machine matérielle et les utilisateurs","une pièce de l'ordinateur, comme le processeur ou la mémoire","un langage de programmation, comme C ou Python","une application de bureau, comme un navigateur"],0,"Le système d'exploitation (Linux, Windows…) est un logiciel. Il se place entre le matériel (processeur, mémoire, disques) et les utilisateurs : il partage le matériel entre les programmes et offre des commandes et des services pour s'en servir sans connaître les détails de la machine."),
 L("Les couches d'Unix",`<p>Unix est <b>écrit en C</b> (TD ex. 1). Il est organisé en couches, de la machine vers l'utilisateur :</p><ol><li>le <b>matériel</b> (processeur, mémoires, périphériques) ;</li><li>le <b>noyau</b> d'Unix, qui seul parle au matériel ; un programme lui demande un service par un <b>appel noyau</b> (${k`man 2`} : fork, pipe…) ;</li><li>les <b>bibliothèques</b>, comme la bibliothèque standard du C (${k`man 3`} : printf…) ;</li><li>les <b>applications</b>, dont bash.</li></ol><p>Deux façons de parler au système : en mode graphique (fenêtres, souris), ou en <b>ligne de commande</b> dans un terminal. Le terminal exécute un <b>interpréteur de commandes</b> : bash, par défaut sous Linux. Tout ce cours se fait en ligne de commande.</p>`),
 Q("Qui a le droit de parler directement au matériel ?",["Le noyau","bash","Chaque application"],0,"Seul le noyau, le cœur du système, parle directement au matériel. Les applications ne le font jamais elles-mêmes : elles demandent au noyau, par des appels système (documentés dans la section 2 du manuel, man 2)."),
 Q("man 2 décrit…",["les appels du noyau, comme fork","les commandes de bash","les jeux"],0,"man 3 décrit les fonctions de la bibliothèque standard du C, comme printf."),
 P("Trois questions de cours, sur papier","<ol><li>(TD de Meynard, exercice 1) En quel langage est écrit le système d'exploitation Unix ?</li><li>Qu'est-ce qu'un système d'exploitation ? Cite ses trois objectifs.</li><li>Quel programme le terminal exécute-t-il pour lire tes commandes ?</li></ol><p>(Les questions 2 et 3 sont de moi, sur le cours.)</p>",`<ol><li>En C.</li><li>Une couche logicielle offrant une interface entre la machine matérielle et les utilisateurs. Objectifs : convivialité de l'interface ; clarté et généricité des concepts ; efficacité de l'allocation des ressources en temps et en espace.</li><li>Un interpréteur de commandes : bash, par défaut sous Linux.</li></ol>`,["« En C »","Les mots « couche logicielle » et « interface entre la machine matérielle et les utilisateurs »","Les trois objectifs","Le mot « interpréteur de commandes », et bash"],5),
 K("Quel est le rôle d'un système d'exploitation, entre le matériel et les utilisateurs ?","Une couche logicielle offrant une interface entre la machine matérielle et les utilisateurs."),
 K("Quelles sont les couches d'un système Unix, du matériel jusqu'aux applications ?","Matériel, noyau (appels noyau, man 2), bibliothèques (man 3), applications et bash. Unix est écrit en C.")]},

/* ------------------------------------------------------------------ */
{id:"u-chemins",t:"L'arbre des fichiers, les chemins et les commandes de base",min:16,goal:"Lire un chemin absolu ou relatif et manipuler des fichiers en ligne de commande (TD ex. 3 à 11).",steps:[
 Q("Tu es dans /home/dupont. Où mène cd .. ?",[k`/home`,k`/`,k`/home/dupont/..`],0,`${k`..`} désigne le dossier parent, celui qui contient le dossier courant. Depuis /home/dupont, cd .. remonte d'un cran : on arrive dans /home.`),
 L("Un seul arbre",`<p>Sous Unix, tous les fichiers sont rangés dans <b>un seul arbre</b>, dont la racine s'appelle ${k`/`}.</p><ul><li>${k`/home/dupont/tp/exo.py`} : depuis la racine, on entre dans home, puis dupont, puis tp.</li><li>Un chemin <b>absolu</b> commence par ${k`/`} : il marche de n'importe où.</li><li>Un chemin <b>relatif</b> part du dossier courant : ${k`tp/exo.py`}, ${k`../toto`}.</li></ul>${tb(["Nom","Sens"],[[k`/`,"la racine"],[k`~`,"ton dossier d'accueil, par exemple /home/dupont"],[k`.`,"le dossier courant"],[k`..`,"le dossier parent"]])}`),
 Q("Lequel est un chemin absolu ?",[k`/usr/bin/ls`,k`../bin/ls`,k`bin/ls`],0,"Un chemin absolu part de la racine : il commence par /. Il désigne le même fichier quel que soit le dossier où tu te trouves. Un chemin relatif, sans / au début, part du dossier courant."),
 L("Les commandes de base",`${tb(["Commande","Rôle"],[[k`pwd`,"affiche le dossier courant"],[k`cd chemin`,"change de dossier ; "+k`cd`+" seul revient dans ~"],[k`ls`,"liste ; "+k`-l`+" détaillé, "+k`-a`+" avec les fichiers cachés, "+k`-R`+" récursivement"],[k`mkdir d`,"crée un dossier"],[k`rmdir d`,"supprime un dossier vide"],[k`cp f g`,"copie ; "+k`cp -r`+" pour un dossier entier"],[k`mv f g`,"déplace ou renomme"],[k`rm f`,"supprime ; "+k`rm -r`+" pour un dossier et tout son contenu"],[k`cat f`,"affiche le contenu"],[k`echo bonjour`,"affiche le texte bonjour"],[k`which ls`,"dit où est rangée la commande"],[k`man ls`,"le manuel (q pour quitter)"]])}<p>Attention : ${k`rm`} ne passe pas par une corbeille.</p><p>On peut écrire plusieurs commandes sur une ligne en les séparant par ${k`;`} : ${k`cd /usr ; pwd`} va dans /usr, puis affiche ${k`/usr`}.</p>`),
 Q("Tu es dans /usr/bin. Que donne cd ../.. puis pwd ?",[k`/`,k`/usr`,k`/usr/bin/../..`],0,"Chaque .. remonte d'un dossier. Depuis /usr/bin, le premier .. mène à /usr, le second à /, la racine. pwd affiche donc /."),
 Q("Supprimer le dossier Backup, qui contient des fichiers ?",[k`rm -r Backup`,k`rmdir Backup`,k`rm Backup`],0,"rmdir refuse un dossier non vide, et rm sans -r refuse un dossier (TD ex. 11)."),
 S("Ranger ses fichiers sans changer de dossier (TD ex. 10)",`On est dans ${k`~`}. On veut ${k`~/USI/Script/lsparent.sh`} et ${k`~/USI/Fable/fable.txt`}.`,[
  {w:k`mkdir USI`,why:"On crée d'abord le parent."},
  {w:k`mkdir USI/Script USI/Fable`,why:"Deux dossiers d'un coup, par des chemins relatifs."},
  {w:`${k`mv lsparent.sh USI/Script`} et ${k`mv fable.txt USI/Fable`}`,why:"mv déplace sans recopier : le fichier change seulement de dossier."},
  {w:k`ls -R USI`,why:"On vérifie : ls -R affiche les sous-dossiers et leur contenu."}]),
 L("Les dossiers du système",`<ul><li>${k`/bin`}, ${k`/usr/bin`} : les commandes (ls, bash, gcc…).</li><li>${k`/etc`} : les fichiers de configuration (${k`/etc/passwd`} : les comptes).</li><li>${k`/home`} : les dossiers des utilisateurs.</li><li>${k`/tmp`} : les fichiers temporaires.</li><li>${k`/dev`} : les périphériques, vus comme des fichiers.</li><li>${k`/proc`} : des informations sur les processus.</li><li>${k`/lib`} : les bibliothèques ; ${k`/usr/include`} : les en-têtes du C.</li><li>${k`/sbin`} : les commandes réservées à l'administrateur.</li><li>${k`/mnt`} : là où apparaissent les clés USB ; ${k`/var/log`} : les journaux du système.</li></ul>`),
 Q("Où sont les fichiers de configuration ?",[k`/etc`,k`/bin`,k`/tmp`],0,"Les fichiers de configuration du système sont rangés dans /etc (on le retient comme « et cetera »). Exemple : /etc/passwd, la liste des comptes."),
 P("TD de Meynard, exercice 8, sur papier",`<p>Décrivez en une phrase courte chacune des commandes suivantes :</p>${TX`pwd
cd / ; pwd ; cd ~ ; pwd
cd ~/.. ; pwd
cd /usr ; pwd ;cd ; pwd
cd /home ; pwd
cd ~ ; cd ../.. ; pwd
cd ../toto ; pwd`}<p>(L'exercice a deux autres lignes, avec ${k`$home`} et ${k`~toto`} : elles utilisent des notions vues plus loin, tu les trouveras dans les exercices corrigés. Suppose que ton dossier d'accueil est /home/dupont.)</p>`,`<ol><li>Affiche le répertoire de travail.</li><li>Va à la racine et affiche ${k`/`}, puis va dans l'accueil et affiche ${k`/home/dupont`}.</li><li>Va dans le parent de l'accueil : affiche ${k`/home`}.</li><li>Affiche ${k`/usr`}, puis ${k`cd`} seul revient dans l'accueil : ${k`/home/dupont`}.</li><li>Affiche ${k`/home`}.</li><li>Depuis l'accueil, remonte de deux crans : affiche ${k`/`}.</li><li>Remonte d'un cran, puis descend dans toto : le répertoire « voisin » toto (erreur s'il n'existe pas).</li></ol>`,["Une phrase par ligne, avec ce que pwd affiche","cd seul : retour dans le dossier d'accueil","~/.. : le parent de l'accueil","../.. : deux crans vers la racine"],7),
 K("Quelle est la différence entre un chemin absolu et un chemin relatif ?","Absolu : commence par / (la racine) et marche de partout. Relatif : part du dossier courant, avec . et .."),
 K("Quelle est la différence entre rmdir et rm -r ?","rmdir : seulement un dossier vide. rm -r : un dossier et tout son contenu, sans corbeille.")]},

/* ------------------------------------------------------------------ */
{id:"u-droits",t:"Lire ls -l : type, droits et chmod",min:20,goal:"Lire une ligne de ls -l, écrire un chmod en octal ou en lettres, savoir ce que r, w, x veulent dire sur un répertoire (TD ex. 16 à 19).",steps:[
 Q(`Que veut dire ${k`-rw-r--r--`} ?`,["Fichier régulier : le propriétaire lit et écrit, les autres lisent seulement","Répertoire : le propriétaire lit et écrit, les autres lisent seulement","Fichier régulier : tout le monde lit et écrit, personne n'exécute"],0,"Le - du début dit « fichier régulier » ; puis rw- pour le propriétaire, r-- pour le groupe, r-- pour les autres. Le premier caractère « - » veut dire fichier régulier (d pour un répertoire). Puis rw- pour le propriétaire, r-- pour le groupe, r-- pour les autres."),
 L("Une ligne de ls -l",`${TX`-rw-r--r-- 1 dupont etu 8 août 30 10:54 droits.txt`}<ol><li>Le <b>type</b> : ${k`-`} fichier régulier, ${k`d`} répertoire, ${k`l`} lien symbolique (aussi ${k`c`}, ${k`b`} pour les périphériques, ${k`p`} tube, ${k`s`} socket).</li><li>Les <b>9 droits</b> : 3 pour le propriétaire, 3 pour le groupe, 3 pour les autres.</li><li>Le nombre de liens, puis le propriétaire et le groupe.</li><li>La taille en octets, la date de dernière modification, le nom.</li></ol><p>Avec ${k`ls -i`}, un nombre s'ajoute au début : le numéro d'inode, c'est-à-dire le numéro de la fiche du fichier sur le disque (leçon sur les inodes).</p>`),
 Q("Le premier caractère est d. C'est…",["un répertoire","un fichier supprimé","un périphérique"],0,"Dans ls -l, le premier caractère donne le type : - pour un fichier ordinaire, d pour un répertoire (directory), l pour un lien symbolique."),
 L("Utilisateurs et groupes",`<ul><li>Un utilisateur Unix est identifié par un numéro, son <b>uid</b>, et possède un nom. ${k`whoami`} affiche ce nom.</li><li>Il est membre d'un ou plusieurs <b>groupes</b>. ${k`id`} affiche son identité complète : son uid, son groupe primaire (gid) et tous ses groupes.</li><li>Un fichier appartient à l'utilisateur qui l'a créé et à son groupe primaire : ce sont le propriétaire et le groupe affichés par ${k`ls -l`}.</li><li><b>root</b> (id 0) est l'administrateur de la machine : il a tous les droits.</li></ul>`),
 Q("Quelle commande affiche ton uid et la liste de tes groupes ?",[k`id`,k`whoami`,k`ls -l`],0,"id affiche ton uid (ton numéro d'utilisateur), ton gid et la liste de tes groupes. whoami ne donne que ton nom, et groups seulement les groupes."),
 L("Les 9 droits et l'octal",`<ul><li>r : lire, w : écrire, x : exécuter. Pour <b>u</b> (le propriétaire), <b>g</b> (le groupe), <b>o</b> (les autres).</li><li>En octal, chaque paquet de 3 est un chiffre : <b>r = 4, w = 2, x = 1</b>.</li></ul>${tb(["Écriture","Droits"],[["755","rwx r-x r-x"],["644","rw- r-- r--"],["600","rw- --- ---"],["700","rwx --- ---"]])}<p>En lettres : ${k`chmod u+x f`} (ajoute x au propriétaire), ${k`chmod go-w f`} (enlève w au groupe et aux autres), ${k`chmod a=r f`} (tout le monde : r seulement).</p>`),
 B("Complète : rwxr-x--- en octal",R`chmod [[0]][[1]][[2]] f`,[{o:["7","6","5"],a:0},{o:["5","4","7"],a:0},{o:["0","1","4"],a:0}],"rwx = 4 + 2 + 1 = 7, r-x = 4 + 1 = 5, --- = 0."),
 Q("chmod 640 rapport.txt donne…",[k`rw-r-----`,k`rw-r--r--`,k`rwxr-----`],0,"Chaque chiffre donne les droits d'une catégorie : propriétaire, groupe, autres. r vaut 4, w vaut 2, x vaut 1. 6 = 4 + 2 donne rw- ; 4 donne r-- ; 0 donne ---. D'où rw-r-----."),
 Q("Ajouter le droit d'exécution au propriétaire, sans toucher au reste ?",[k`chmod u+x script.sh`,k`chmod 100 script.sh`,k`chmod +r script.sh`],0,"chmod 100 mettrait --x------ : tous les autres droits seraient perdus."),
 L("Les droits sur un répertoire",`${tb(["Droit","Sur un répertoire"],[["r","lister les noms (ls)"],["w","créer, supprimer, renommer des entrées (avec x)"],["x","traverser : y entrer (cd), atteindre un fichier dont on connaît le nom"]])}<p>Conséquence : <b>supprimer un fichier</b> demande w et x sur le <b>répertoire</b>. Les droits du fichier lui-même ne comptent pas (TD ex. 16).</p>`),
 Q("Tu as rwx sur le dossier tp, mais aucun droit sur tp/note.txt, qui n'est pas à toi. Peux-tu supprimer note.txt ?",["Oui : w et x sur le dossier suffisent","Non : il faut w sur le fichier","Non : il faut en être le propriétaire"],0,"Supprimer, c'est retirer un nom de la liste du dossier : c'est le dossier qu'on modifie."),
 Q("Un dossier a --x pour les autres. Un autre utilisateur peut…",["ouvrir un fichier dedans s'il connaît son nom exact","lister le dossier avec ls, puisqu'il peut y entrer","créer un fichier dedans, puisqu'il peut le traverser"],0,"Pour un répertoire, x permet de le traverser et d'atteindre un fichier dedans, et r permet de lister son contenu. Avec --x seulement, on peut ouvrir un fichier si on connaît son nom exact, mais ls sur le dossier échoue. Lister demande r sur le dossier, créer un fichier demande w : x seul permet seulement de passer."),
 S("Donner accès à un fichier sans montrer le dossier (TD ex. 18)","On veut que les autres puissent lire et modifier rep/f, sans pouvoir lister rep.",[
  {w:`${k`chmod o=x rep`} : les autres ont --x sur le dossier.`,why:"x pour traverser, pas de r pour lister."},
  {w:`${k`chmod o=rw rep/f`} : les autres ont rw- sur le fichier.`,why:"Lire et modifier le contenu."},
  {w:`Ils ouvrent ${k`rep/f`} par son nom exact ; ${k`ls rep`} leur est refusé.`,why:"Tous les « autres » ont ce droit, à condition de connaître le nom."}]),
 P("TD de Meynard, exercices 17 et 16, sur papier",`<p><b>Exercice 17.</b> Expliquez à quoi correspond chacune des colonnes de l'affichage suivant ?</p>${TX`3615674885 -rw-r--r-- 1 etudiant@exemple.fr p00000010501 8 août 30 10:54 droits.txt`}<p>(C'est une ligne affichée par ${k`ls -ali`} : ${k`-a`} pour les fichiers cachés, ${k`-l`} pour le détail, ${k`-i`} pour le numéro d'inode.)</p><p><b>Exercice 16</b>, questions 3 à 5 (les questions 1 et 2, sur la suppression, viennent d'être vues) :</p><ol start="3"><li>Quels sont les droits nécessaires pour modifier le contenu d'un fichier ?</li><li>Est-ce que le propriétaire d'un fichier peut s'enlever ses propres droits de lecture, écriture et exécution sur un fichier ? Est-ce grave ?</li><li>Obtient-on une meilleure protection si le propriétaire du fichier enlève ses propres droits d'accès ?</li></ol>`,`<p><b>Exercice 17.</b></p><ul><li>${k`3615674885`} : le numéro d'inode (option -i).</li><li>${k`-`} : le type, un fichier régulier ; ${k`rw-r--r--`} : le propriétaire lit et écrit, le groupe lit, les autres lisent.</li><li>${k`1`} : le nombre de liens.</li><li>${k`etudiant@exemple.fr`} : le propriétaire ; ${k`p00000010501`} : le groupe.</li><li>${k`8`} : la taille en octets.</li><li>${k`août 30 10:54`} : la date de dernière modification.</li><li>${k`droits.txt`} : le nom.</li></ul><p><b>Exercice 16.</b></p><ol start="3"><li>w sur le fichier, et x sur tous les répertoires traversés pour l'atteindre.</li><li>Oui (${k`chmod u-rwx f`}). Ce n'est pas grave : il reste propriétaire, il peut se les redonner avec chmod.</li><li>Non : le propriétaire (et root) peut toujours remettre les droits. Cela protège seulement contre ses propres fausses manœuvres.</li></ol>`,["Les 7 morceaux de la ligne, dans l'ordre","Le type (-) séparé des 9 droits","Modifier : w sur le fichier (et x sur les répertoires du chemin)","Le propriétaire peut toujours refaire chmod"],9),
 K("Dans chmod, quelles valeurs ont les droits r, w et x ? Que veut dire 754 ?","r = 4, w = 2, x = 1. rwx = 7, r-x = 5, r-- = 4. Exemple : 754 = rwxr-xr--."),
 K("Quels droits faut-il pour supprimer un fichier ?","w et x sur le répertoire qui le contient. Les droits du fichier ne comptent pas.")]},

/* ------------------------------------------------------------------ */
{id:"u-umask",t:"umask : les droits d'un nouveau fichier",min:12,goal:"Calculer les droits d'un fichier et d'un répertoire créés avec un umask donné (TD § 2.6, ex. 25).",steps:[
 Q("Avec umask 022, tu crées un fichier. Ses droits ?",["rw-r--r-- (644)","rwxr-xr-x (755)","rw-rw-rw- (666)"],0,"Un fichier part de 666 ; le masque 022 retire le w du groupe et celui des autres.",{diag:false}),
 L("Le masque",`<ul><li>Un nouveau fichier part de <b>666</b> (rw-rw-rw-) ; un nouveau répertoire part de <b>777</b> (rwxrwxrwx).</li><li>Le umask liste les droits à <b>retirer</b>.</li></ul>${box("droits = (droits de base) ET (NON umask)")}${tb(["umask","fichier","répertoire"],[["022","644 rw-r--r--","755 rwxr-xr-x"],["027","640 rw-r-----","750 rwxr-x---"],["077","600 rw-------","700 rwx------"]])}<p>${k`umask`} seul affiche la valeur ; ${k`umask 027`} la change pour la suite.</p>`),
 S("Calculer umask 027 bit à bit","Fichier : base 666. Répertoire : base 777.",[
  {w:"666 = 110 110 110 ; le masque 027 = 000 010 111.",why:"Chaque chiffre octal fait 3 bits : 0 = 000, 2 = 010, 7 = 111."},
  {w:"On garde les bits de la base qui ne sont pas dans le masque : 110 100 000.",why:"Le 2 enlève le w du groupe ; le 7 enlève tout aux autres."},
  {w:"110 100 000 = 640 = rw-r-----.",why:"On relit chaque paquet de 3 bits."},
  {w:"Répertoire : 111 111 111 sans 000 010 111 donne 111 101 000 = 750 = rwxr-x---.",why:"Même calcul avec la base 777."}]),
 Q("umask 077 : un nouveau répertoire a les droits…",["rwx------ (700)","rw------- (600)","rwxrwxrwx (777)"],0,"Un nouveau répertoire part des droits 777 (rwxrwxrwx), et le umask retire ses bits. 077 retire tout au groupe (7) et aux autres (7), rien au propriétaire (0). Il reste 700, soit rwx------."),
 Q("umask 033 : un nouveau fichier a les droits…",["644 (rw-r--r--)","633 (rw--wx-wx)","744 (rwxr--r--)"],0,"On enlève des bits, on ne soustrait pas : 6 = 110 sans 011 donne 100 = 4."),
 Q("Peut-on se bloquer soi-même avec umask 777 ?",["Oui, mais ça se répare : chmod et umask 022","Non : umask ne peut pas retirer les droits du propriétaire","Oui, et c'est définitif : seul root peut rendre les droits"],0,"Les nouveaux fichiers naissent sans droits, mais le propriétaire peut toujours faire chmod (TD ex. 25). Le propriétaire d'un fichier peut toujours changer ses droits avec chmod, même s'il n'en a plus aucun."),
 P("TD de Meynard, § 2.6 et exercice 25, sur papier","<ol><li>(Exercice 25) Changez votre valeur de masque à 020 puis créez un nouveau fichier : quels sont ses droits ? Créez maintenant un nouveau répertoire et vérifiez ses droits.</li><li>Le TD affirme : « umask 024 crée les fichiers avec les droits rw-r---w- » et « umask 066 crée les fichiers avec les droits rw------- ». Retrouve ces deux résultats par le calcul. (Cette question est de moi, sur les exemples du TD.)</li></ol>",`<ol><li>Le masque 020 = 000 010 000 retire seulement le w du groupe. Fichier : 666 = 110 110 110 devient 110 100 110 = <b>646</b>, ${k`rw-r--rw-`}. Répertoire : 777 = 111 111 111 devient 111 101 111 = <b>757</b>, ${k`rwxr-xrwx`}.</li><li>024 = 000 010 100 : on retire le w du groupe et le r des autres. 110 110 110 devient 110 100 010 = 642, ${k`rw-r---w-`}. 066 = 000 110 110 : on retire r et w au groupe et aux autres. 110 110 110 devient 110 000 000 = 600, ${k`rw-------`}.</li></ol>`,["Base 666 pour un fichier, 777 pour un répertoire","Le masque écrit en binaire, 3 bits par chiffre","On retire les bits du masque, on ne soustrait pas","Le résultat en octal et en lettres"],5),
 K("Avec umask 022, quels droits reçoit un nouveau fichier ? Un nouveau répertoire ? Comment les calcule-t-on ?","Fichier 644 (rw-r--r--), répertoire 755 (rwxr-xr-x). Bases 666 et 777, on retire les bits du masque.")]},

/* ------------------------------------------------------------------ */
{id:"u-inodes",t:"Inodes, liens durs et liens symboliques",min:20,goal:"Dire ce qu'il y a dans un inode et dans un répertoire, prévoir l'effet de ln, ln -s et rm (TD ex. 22 à 29).",steps:[
 Q("Où est écrit le nom d'un fichier ?",["Dans le répertoire qui le contient","Dans son inode","Dans ses blocs de données"],0,"L'inode ne contient pas le nom : c'est ce qui permet d'avoir plusieurs noms pour un même fichier."),
 L("Inode et répertoire",`<p>Un <b>inode</b> est la fiche d'un fichier : son numéro, son type, ses droits, son <b>nombre de liens</b>, son propriétaire et son groupe, sa taille, ses dates, les adresses de ses blocs. <b>Pas son nom.</b></p><p>Un <b>répertoire</b> est une liste de couples (nom, numéro d'inode) :</p>${TX`répertoire tp          inode 1234
.        -> 812        type -, rw-r--r--
..       -> 455        2 liens, dupont
exo.py   -> 1234       312 octets, dates
copie.py -> 1234       blocs 5012, 5013`}<ul><li>${k`ls -i`} affiche les numéros d'inode, ${k`ls -l`} le nombre de liens.</li><li>Un répertoire a au moins 2 liens (son nom dans le parent, et son ${k`.`}), plus 1 par sous-répertoire (leur ${k`..`}).</li></ul>`),
 Q("Un répertoire contient 3 sous-répertoires. Combien a-t-il de liens ?",["5","3","2"],0,"Un répertoire est désigné par son nom dans son parent (1 lien) et par sa propre entrée . (1 lien). Chaque sous-répertoire a une entrée .. qui pointe vers lui : 3 liens de plus. Total : 2 + 3 = 5."),
 L("Lien dur, lien symbolique",`${tb(["","Lien dur","Lien symbolique"],[["Commande",k`ln ancien nouveau`,k`ln -s cible raccourci`],["Inode","le même","un nouvel inode, de type l"],["Compteur de liens","+1","inchangé"],["Vers un répertoire","interdit","possible"],["Autre partition","impossible","possible"],["Si l'original disparaît","rien ne change pour l'autre nom","le lien est cassé"]])}<p>${k`rm`} enlève un nom et retire 1 au compteur. Les données ne sont libérées que quand le compteur tombe à 0.</p><p>Un lien symbolique est un petit fichier de type ${k`l`}, qui contient seulement le chemin visé : après ${k`ln -s /etc/passwd p`}, la taille de p est 11, le nombre de caractères de ${k`/etc/passwd`}.</p>`),
 Q("ln a b, puis rm a. Que devient b ?",["Il marche toujours, avec le même contenu","Il est cassé : il pointait vers le nom a","Il est supprimé aussi : a et b sont le même fichier"],0,"Même inode ; le compteur passe de 2 à 1, donc les données restent. C'est le lien symbolique (ln -s) qui casse quand on supprime sa cible. Un lien dur est un deuxième nom pour le même inode : le contenu reste tant qu'il reste un nom.",{diag:false}),
 Q("ln -s /home/pmartin pm, puis le dossier /home/pmartin est supprimé. cd pm donne…",["Une erreur : le lien vise un chemin qui n'existe plus","On entre dans une copie de l'ancien dossier, gardée par le lien","Une erreur : pm a été supprimé avec le dossier"],0,"Le lien pm existe toujours (ls pm l'affiche, ls -l montre pm -> /home/pmartin), mais le chemin qu'il contient ne mène plus à rien : c'est un « lien mort », et cd pm échoue. Le lien ne garde aucune copie (TD ex. 29).",{diag:false}),
 Q("Pourquoi ln /home/dupont/tp lien échoue-t-il ?",["Un lien dur ne peut pas viser un répertoire","Il faut être root pour créer un lien dur","Le nom lien est déjà pris par un autre fichier"],0,"ln sans option crée un lien dur, et un lien dur ne peut pas viser un répertoire (cela pourrait créer des boucles dans l'arborescence). Pour un répertoire, il faut un lien symbolique : ln -s /home/dupont/tp lien."),
 S("Suivre le compteur de liens (TD ex. 28)",`On part de ${k`echo bonjour > toto.txt`} : le ${k`>`} envoie ce qu'affiche echo dans le fichier toto.txt, qui est créé (leçon sur les redirections).`,[
  {w:`${k`ls -li toto.txt`} : un numéro d'inode, et 1 lien.`,why:"Un seul nom pour l'instant."},
  {w:`${k`ln toto.txt t2`} : toto.txt et t2 ont le même inode et 2 liens.`,why:"Les deux noms montrent le même compteur : c'est le même inode."},
  {w:`${k`ln toto.txt autre/toto.txt`} : 3 liens.`,why:"Le même nom est permis dans un autre répertoire."},
  {w:`${k`rm toto.txt`} : 2 liens ; ${k`cat t2`} affiche toujours bonjour.`,why:"On a seulement enlevé un nom."},
  {w:`${k`echo suite >> t2`} (le ${k`>>`} ajoute à la fin du fichier) : ${k`cat autre/toto.txt`} montre aussi « suite ».`,why:"Une seule fiche, un seul contenu, plusieurs noms."}]),
 Q("Un inode a un seul lien. Peut-il être un répertoire ?",["Non : un répertoire a au moins 2 liens","Oui, s'il est vide : il n'a alors que son nom","On ne peut pas savoir sans ls -l"],0,"Son nom dans le parent et son « . » font déjà 2 (TD ex. 22). Même vide, un répertoire a deux liens : son nom dans le dossier parent, et « . » en lui-même."),
 P("TD de Meynard, exercice 23, sur papier",`<p>Données de l'exercice 22 (numéro d'inode, nombre de liens) :</p>${tb(["inode","nb. liens"],[["148","3"],["272","1"],["2405","1"],["256","5"],["498","2"]])}<p><b>Exercice 23.</b> On propose maintenant deux organisations possibles de répertoires. Est-ce que chaque organisation (1 puis 2) est cohérente avec les données ci-dessus de l'exercice précédent ?</p>${tb(["organisation","répertoire 1","répertoire 2"],[["1","fibre → 148<br>finioui → 2405","fini → 272<br>fininon → 148"],["2","fibonacci → 498<br>figue → 148<br>filon → 148<br>fichtre → 498","fibonnacci → 498<br>figue → 148"]])}`,`<p>Pour chaque inode, on compte les noms qui le désignent : ce doit être son nombre de liens.</p><ul><li><b>Organisation 1.</b> 272 : 1 nom (fini) pour 1 lien. 2405 : 1 nom (finioui) pour 1 lien. Mais 148 n'a que 2 noms (fibre, fininon) pour 3 liens : si ces deux répertoires sont tout ce qui existe, c'est <b>incohérent</b> ; il faudrait un 3e nom pour 148 ailleurs.</li><li><b>Organisation 2.</b> 148 a 3 noms (figue et filon dans le répertoire 1, figue dans le répertoire 2) pour 3 liens : bon. Deux « figue » dans deux répertoires différents, c'est permis. Mais 498 a 3 noms (fibonacci, fichtre, fibonnacci) pour 2 liens : <b>incohérent</b>.</li></ul><p>(Corrigé écrit par moi.)</p>`,["Un décompte des noms pour chaque inode","Comparé au nombre de liens du tableau","Organisation 1 : il manque un nom pour 148","Organisation 2 : un nom de trop pour 498"],8),
 K("Quelle est la différence entre un lien dur (ln) et un lien symbolique (ln -s) ?","Dur (ln) : un 2e nom, même inode, compteur +1, pas vers un répertoire, même partition. Symbolique (ln -s) : un fichier qui contient un chemin, cassé si la cible disparaît."),
 K("Dans un système de fichiers Unix, que contient un répertoire ?","Des couples nom ⇔ numéro d'inode, dont . (lui-même) et .. (le parent).")]},

/* ------------------------------------------------------------------ */
{id:"u-taille",t:"La taille maximale d'un fichier",min:10,goal:"Faire le calcul des blocs directs et indirects du cours de Meynard, puis ses exercices.",steps:[
 Q("Un bloc de 4 Kio rempli d'adresses de 4 octets en contient combien ?",["1024","4096","4"],0,"4 Kio = 4 × 1024 octets = 4096 octets. Chaque adresse prend 4 octets, donc le bloc en contient 4096 / 4 = 1024."),
 L("L'arbre des blocs",`<p>Les données d'un fichier sont dans des blocs. L'inode garde leurs adresses :</p><ul><li><b>10 adresses directes</b> : 10 blocs de données.</li><li><b>1 adresse simple indirecte</b> : un bloc rempli d'adresses de blocs de données.</li><li><b>1 double indirecte</b> : un bloc d'adresses de blocs d'adresses.</li><li><b>1 triple indirecte</b> : un niveau de plus.</li></ul>${box("n = taille d'un bloc / taille d'une adresse ;  taille max = (10 + n + n² + n³) × taille d'un bloc")}<p>Puissances de 2 : 1 Kio = 2¹⁰ octets, 1 Mio = 2²⁰, 1 Gio = 2³⁰, 1 Tio = 2⁴⁰.</p>`),
 S("Le calcul du cours : blocs de 4 Kio, adresses de 4 octets","On compte ce que chaque niveau peut atteindre.",[
  {w:"n = 4 Kio / 4 = 2¹⁰ adresses par bloc.",why:"Tout part de là."},
  {w:"Directs : 10 × 4 Kio = 40 Kio.",why:"10 blocs de données."},
  {w:"Simple indirect : 2¹⁰ × 4 Kio = 2¹⁰ × 2¹² = 2²² octets = 4 Mio.",why:"Un bloc d'adresses, soit 2¹⁰ blocs de données."},
  {w:"Double : 2²⁰ × 4 Kio = 4 Gio. Triple : 2³⁰ × 4 Kio = 4 Tio.",why:"Chaque niveau multiplie par n = 2¹⁰."},
  {w:"Total : 40 Kio + 4 Mio + 4 Gio + 4 Tio, environ 4 Tio.",why:"Le triple indirect domine tout le reste."}]),
 Q("Avec des blocs de 8 Kio, la taille maximale est multipliée par…",["16","2","8"],0,"n double (2¹¹) : le triple indirect atteint 2³ = 8 fois plus de blocs, et chaque bloc est 2 fois plus gros."),
 Q("Si le champ « taille » de l'inode fait 32 bits, un fichier ne dépasse pas…",["4 Gio","4 Tio","32 Kio"],0,"Un champ de 32 bits peut écrire au plus 2³² valeurs différentes. La taille d'un fichier, en octets, ne peut donc pas dépasser 2³² octets = 4 × 2³⁰ octets = 4 Gio, même si les blocs pourraient en contenir plus."),
 P("Les trois exercices du cours de Meynard, sur papier","<ol><li>Si la taille des blocs de données est doublée (à 8Kio) calculer le facteur de multiplication de la taille maximale d'un fichier (approximation).</li><li>Avec des blocs de 4Kio, sur quelle longueur faudrait-il coder la taille du fichier dans la table des inodes, afin de satisfaire la taille atteinte par l'adressage des blocs ?</li><li>On considère que les blocs non terminaux (ceux contenant des adresses de blocs) sont \"volés\" à l'espace des données. Combien de blocs sont ainsi subtilisés avec les blocs de 4Kio et un fichier de taille 4Gio ?</li></ol>",`<p>Réponses du cours, détaillées :</p><ol><li>n = 8 Kio / 4 = 2¹¹ adresses par bloc ; le 3e niveau atteint (2¹¹)³ blocs de 2¹³ octets = 2⁴⁶ octets = 64 Tio. Le facteur est <b>16</b>.</li><li>4 Tio = 2⁴² octets : <b>42 bits</b>.</li><li>4 Gio / 4 Kio = 2²⁰ blocs de données, donc 2²⁰ adresses de 4 octets = 2²² octets = 4 Mio, soit <b>2¹⁰ blocs</b> d'adresses.</li></ol>`,["n calculé d'abord (taille d'un bloc / taille d'une adresse)","Tout écrit en puissances de 2","Le résultat converti en Kio, Mio, Gio ou Tio"],10),
 K("Un inode a 10 adresses directes, puis un bloc d'indirection simple, un double et un triple. Quelle formule donne la taille maximale d'un fichier ?","(10 + n + n² + n³) × taille d'un bloc, avec n = taille d'un bloc / taille d'une adresse. Blocs de 4 Kio, adresses de 4 octets : environ 4 Tio.")]},

/* ------------------------------------------------------------------ */
{id:"u-processus",t:"Processus : fork, exec, états, ps et kill",min:20,goal:"Expliquer comment bash lance une commande et les états d'un processus, savoir arrêter un processus (TD ex. 30 à 38).",steps:[
 Q("echo Hello crée-t-il un nouveau processus ?",["Non : echo est interne à bash","Oui : un par commande","Oui : deux"],0,"Les commandes internes (cd, echo, export, exit) tournent dans bash lui-même."),
 L("Programme et processus",`<ul><li>Un <b>programme</b> est un fichier (par exemple ${k`/usr/bin/ls`}). Un <b>processus</b> est un programme en train de s'exécuter, avec un numéro (PID) et un parent (PPID).</li><li>Trois états de base :<ul><li><b>actif</b> : il a le processeur ;</li><li><b>prêt</b> : il ne lui manque que le processeur ;</li><li><b>bloqué</b> : il attend autre chose (le clavier, le disque).</li></ul></li><li>On ne devient actif <b>qu'en passant par prêt</b> : c'est l'ordonnanceur qui choisit (« élit ») le prochain actif parmi les prêts, et il fait un changement de contexte : il sauvegarde le contexte du processus qui s'arrête et restitue celui de l'élu.</li><li>Deux modes : utilisateur et noyau. Les appels système passent en mode noyau, ce qui protège le matériel et les autres processus.</li></ul>`),
 Q("Un processus attend que tu tapes au clavier. Il est…",["bloqué","prêt","actif"],0,"Un processus est bloqué quand il attend autre chose que le processeur, ici une frappe au clavier. Même si le processeur est libre, il ne peut pas avancer. Prêt veut dire qu'il n'attend que le processeur ; élu, qu'il est en train de s'exécuter.",{diag:false}),
 Q("Un processus bloqué reçoit enfin sa donnée. Il passe…",["prêt, puis actif quand l'ordonnanceur le choisit","directement actif, puisqu'il a ce qu'il attendait","actif, puis prêt quand son temps est écoulé"],0,"Le passage à l'état actif se fait toujours depuis l'état prêt."),
 L("fork, exec, wait",`<p>Quand tu tapes ${k`ls`}, bash :</p><ol><li><b>fork()</b> : se clone. Dans le parent, fork renvoie le PID de l'enfant ; dans l'enfant, il renvoie 0.</li><li><b>exec()</b> : l'enfant remplace son code par celui de ${k`/usr/bin/ls`}. Il garde ses fichiers ouverts, donc le même terminal.</li><li><b>wait()</b> : bash attend la fin de l'enfant, puis range son code de retour dans ${k`$?`} et réaffiche l'invite.</li></ol><p>Avec ${k`ls &`}, bash n'attend pas. Les commandes <b>internes</b> (${k`cd`}, ${k`echo`}, ${k`export`}) se font dans bash, sans fork.</p>`),
 Q("Que renvoie fork() dans l'enfant ?",["0","le PID de l'enfant","le PID du parent"],0,"C'est le parent qui reçoit le PID de l'enfant : chacun sait ainsi qui il est.",{diag:false}),
 Q("Pourquoi cd ne peut-elle pas être une commande externe ?",["Un enfant qui change de dossier ne change pas celui de bash","Parce qu'elle doit être rapide : un programme externe met trop de temps à se lancer","Parce qu'elle doit pouvoir s'utiliser sans paramètre"],0,"Le dossier courant appartient à chaque processus ; l'enfant disparaîtrait avec son changement."),
 L("Premier plan, arrière-plan, arrêter",`${tb(["Écriture","Effet"],[[k`cmd &`,"lance en arrière-plan : bash rend la main tout de suite"],[k`jobs`,"liste les tâches de fond, numérotées [1], [2]…"],[k`%1`,"ramène la tâche 1 au premier plan"],[k`Ctrl-C`,"tue le processus au premier plan"],[k`Ctrl-D`,"envoie « fin de fichier » (dans un terminal vide, ferme bash)"],[k`ps`+", "+k`ps f`+", "+k`top`,"liste les processus, en arbre, triés par usage du processeur"],[k`kill 12345`,"tue le processus de PID 12345 ; "+k`kill -9`+" de force"],[k`sleep 5`,"attend 5 secondes, puis se termine"],[k`( cmd1 ; cmd2 ) &`,"les commandes entre parenthèses sont exécutées par un enfant de bash, ici en arrière-plan"]])}`),
 Q("Tu as lancé codium &. Comment l'arrêter ?",[`${k`ps`} pour lire son PID, puis ${k`kill PID`}`,"Ctrl-C dans le terminal","Ctrl-D"],0,"Ctrl-C n'agit que sur le premier plan (TD ex. 34). kill %1 marche aussi."),
 Q("Combien de nouveaux processus pour ls | grep txt | wc -l ?",["3","1","2"],0,"Chaque commande externe d'un tube tourne dans son propre processus : un pour ls, un pour grep, un pour wc. Les trois tournent en même temps, reliés par les tubes |. Donc 3 nouveaux processus."),
 P("TD de Meynard, exercice 37, sur papier",`<p>Exécutez la ligne suivante :</p>${SH`( sleep 5 ; echo "fin des 5 s" ; ps f ) &            (sleep 4 ; echo "fin des 4 s" ; ps f ) &`}<ol><li>Combien de nouveaux processus ont été créés ?</li><li>Que signifie les nombres 1 et 2 entre crochets ?</li><li>Peut-on prédire quel nouveau processus à démarré en premier et l'ordre des suivants ?</li><li>Quel parallélisme et entrelacement observez-vous ?</li></ol><p>(À l'exécution, bash affiche d'abord deux lignes comme ${k`[1] 4321`} et ${k`[2] 4322`}.)</p>`,`<ol><li>Chaque parenthèse est exécutée par un enfant de bash : 2 processus. Chacun lance ensuite ${k`sleep`} puis ${k`ps`}, deux commandes externes (${k`echo`} est interne) : 4 de plus. En tout <b>6</b> nouveaux processus.</li><li>Ce sont les numéros de tâches (jobs) des deux groupes lancés en arrière-plan ; le nombre à côté est leur PID.</li><li>Non : c'est l'ordonnanceur qui choisit parmi les processus prêts.</li><li>Les deux groupes tournent en parallèle, et bash a déjà rendu la main. « fin des 4 s » s'affiche au bout de 4 secondes, avant « fin des 5 s » qui a pourtant été lancé en premier ; les affichages se mêlent à l'invite du terminal.</li></ol><p>(Corrigé écrit par moi.)</p>`,["2 enfants de bash pour les parenthèses","sleep et ps sont externes, echo est interne : 6 en tout","[1] et [2] : numéros de tâches","L'ordre dépend de l'ordonnanceur"],8),
 K("Quels sont les trois états d'un processus ?","Actif (il a le processeur), prêt (il n'attend que le processeur), bloqué (il attend autre chose). On devient actif seulement depuis prêt."),
 K("Par quelles étapes bash lance-t-il une commande externe comme ls ?","fork (clone), exec dans l'enfant (remplace le code par /usr/bin/ls), wait dans le parent. Avec &, pas de wait.")]},

/* ------------------------------------------------------------------ */
{id:"u-redir",t:"Redirections, enchaînements, tubes et filtres",min:20,goal:"Rediriger entrées et sorties, enchaîner avec ; && ||, combiner des filtres avec | (TD ex. 36, 39, 40).",steps:[
 Q("ls /bin /toto > f : où va le message d'erreur sur /toto ?",["À l'écran","Dans f","Nulle part"],0,"> ne redirige que la sortie standard ; l'erreur sort par la sortie d'erreur (TD ex. 39)."),
 L("Trois flux et leurs redirections",`<p>Chaque processus a 3 flux : l'<b>entrée standard</b> (0, le clavier), la <b>sortie standard</b> (1, l'écran) et la <b>sortie d'erreur</b> (2, l'écran aussi).</p>${tb(["Écriture","Effet"],[[k`cmd > f`,"la sortie va dans f, qui est vidé avant"],[k`cmd >> f`,"la sortie s'ajoute à la fin de f"],[k`cmd < f`,"cmd lit f au lieu du clavier"],[k`cmd 2> f`,"les erreurs vont dans f"]])}<p>${k`cat < tempo > tempo2`} recopie tempo dans tempo2.</p>`),
 Q("Ajouter la date à la fin de journal.txt sans l'effacer ?",[k`date >> journal.txt`,k`date > journal.txt`,k`date < journal.txt`],0,">> ajoute à la fin du fichier, sans effacer ce qui y est déjà. Avec un seul >, le fichier serait vidé avant d'écrire la date : on perdrait le journal."),
 Q("Envoyer les messages d'erreur de find dans erreurs.txt ?",[k`find / -name "*.c" 2> erreurs.txt`,k`find / -name "*.c" > erreurs.txt`,k`find / -name "*.c" | erreurs.txt`],0,"2> vise la sortie d'erreur ; > ne prend que la sortie standard."),
 L("Enchaîner : ; && ||",`<p>Toute commande finit avec un <b>code de retour</b> : <b>0 si elle a réussi</b>, de 1 à 255 sinon. Il est dans ${k`$?`}.</p>${tb(["Écriture","Effet"],[[k`cmd1 ; cmd2`,"cmd1, puis cmd2 dans tous les cas"],[k`cmd1 && cmd2`,"cmd2 seulement si cmd1 a réussi"],[k`cmd1 || cmd2`,"cmd2 seulement si cmd1 a échoué"]])}${SH`ls ; cat /etc/passwd ; date
cat toto || echo "échec !"
cat toto && echo "réussite !"`}`),
 Q(`${k`cat toto && echo "réussite !"`} : quand voit-on « réussite ! » ?`,["Si toto existe (cat a réussi)","Si toto n'existe pas","Toujours"],0,"&& continue seulement après un code de retour 0 (TD ex. 36)."),
 L("Tubes et filtres",`<p>${k`cmd1 | cmd2`} : la sortie de cmd1 devient l'entrée de cmd2. Les deux tournent en même temps. Un <b>filtre</b> lit son entrée, la transforme, écrit le résultat.</p>${tb(["Filtre","Rôle"],[[k`grep motif`,"garde les lignes qui contiennent le motif (-v : les autres, -c : compte)"],[k`wc -l`,"compte les lignes"],[k`head -n 5`+", "+k`tail -n 5`,"les 5 premières, les 5 dernières lignes"],[k`sort`,"trie (-r : à l'envers, -n : en nombres, "+k`-t: -k2`+" : selon le 2e champ, avec : comme séparateur)"],[k`cut -d: -f1`,"garde le 1er champ, avec : comme séparateur ("+k`-f1,3`+" : les champs 1 et 3)"],[k`sed "s/a/b/g"`,"remplace a par b"],[k`tee f`,"recopie dans f et laisse passer"],[k`more`,"affiche page par page"],[k`pr`,"met en page : "+k`-3`+" sur 3 colonnes, "+k`-w 60`+" largeur 60, "+k`-l 40`+" 40 lignes par page, "+k`-h "titre"`+" un titre"]])}<p>Créer un fichier sans éditeur : ${k`echo bonjour > f.txt`}.</p>`),
 B("Complète : compter les fichiers .txt du dossier courant",R`ls [[0]] grep "\.txt$" [[1]] wc [[2]]`,[{o:["|",">","&&"],a:0},{o:["|",">",";"],a:0},{o:["-l","-w","-c"],a:0}],"ls liste, grep garde les .txt, wc -l compte les lignes restantes."),
 Q("cut -d: -f1 /etc/passwd affiche…",["le 1er champ de chaque ligne, ici les noms de comptes","la 1re ligne du fichier, coupée aux deux-points","le fichier entier, sans les deux-points"],0,"cut travaille sur des colonnes séparées par le caractère de -d."),
 S("Les répertoires de ton dossier d'accueil (TD ex. 40)","On veut seulement les lignes des répertoires.",[
  {w:k`ls -l ~`,why:"Chaque ligne commence par le type : d pour un répertoire."},
  {w:k`grep "^d"`,why:"^ colle au début de la ligne : on garde celles qui commencent par d."},
  {w:k`ls -l ~ | grep "^d"`,why:"Le tube branche les deux."}]),
 P("TD de Meynard, exercice 40, sur papier",`<ol><li>Enchaînez en utilisant le mécanisme de tube : ls, sort, pr, more, avec les bons arguments et les options appropriées pour chaque commande, de façon à obtenir en une seule commande : la liste des fichiers de /dev (ls) dans l'ordre inverse des noms (sort) mise en page par pr sur 3 colonnes avec une largeur de ligne de 60 caractères, 40 lignes par page et un titre "jolie impression" affichés sur l'écran page par page grâce à more.</li><li>Afficher le nom des fichiers de "type texte" de votre répertoire d'accueil. Idée : la commande file fichier ... détermine le "type" de l'argument en examinant le début du contenu de l'argument. Essayez : file * et file /usr/bin/a*.</li><li>(La question 3, les répertoires du dossier d'accueil, vient d'être faite.)</li><li>Afficher le nom de connexion, le nom complet et le répertoire d'accueil de tous les utilisateurs triés par ordre du nom complet.</li></ol><p>Indices, qui ne sont pas dans le TD : ${k`file`} affiche une ligne « nom: type », par exemple ${k`notes.txt: UTF-8 text`}. Dans ${k`/etc/passwd`}, les champs sont séparés par ${k`:`} ; le 1er est le nom de connexion, le 5e le nom complet, le 6e le répertoire d'accueil.</p>`,`${SH`ls /dev | sort -r | pr -3 -w 60 -l 40 -h "jolie impression" | more
file ~/* | grep text | cut -d: -f1
cut -d: -f1,5,6 /etc/passwd | sort -t: -k2`}<ol><li>${k`sort -r`} : ordre inverse ; les options de pr dans l'ordre de l'énoncé ; more à la fin.</li><li>On garde les lignes de file qui contiennent text, puis seulement le 1er champ, avant le deux-points : le nom.</li><li>(Faite dans la leçon : ${k`ls -l ~ | grep "^d"`}.)</li><li>Après le cut, il reste 3 champs, et le nom complet est le 2e : ${k`sort -t: -k2`}.</li></ol><p>(Corrigé écrit par moi ; les trois commandes ont été essayées.)</p>`,["Quatre commandes reliées par trois tubes, dans l'ordre ls, sort, pr, more","sort -r, et les quatre options de pr","file, puis grep text, puis cut -d: -f1","cut -d: -f1,5,6 puis sort -t: -k2"],9),
 K("Dans une redirection, quelle est la différence entre > et >> ? À quoi servent 2> et < ?","> remplace le contenu du fichier ; >> ajoute à la fin. 2> pour les erreurs, < pour lire un fichier au lieu du clavier."),
 K("Entre deux commandes, que font cmd1 && cmd2 et cmd1 || cmd2 ?","cmd1 && cmd2 : cmd2 si cmd1 a réussi (code 0). cmd1 || cmd2 : cmd2 si cmd1 a échoué.")]},

/* ------------------------------------------------------------------ */
{id:"u-find",t:"Chercher des fichiers avec find",min:14,goal:"Écrire la commande find des examens : depuis où, quel nom, quel type, quelle action (Q1 de presque chaque examen).",steps:[
 Q("Chercher à partir du dossier courant les fichiers dont le nom commence par 2023 ?",[k`find . -name "2023*"`,k`find 2023*`,k`ls | grep 2023`],0,"find . : depuis le dossier courant, et -name avec un motif entre guillemets. ls | grep ne descend pas dans les sous-dossiers."),
 L("La forme de find",`${box("find DÉPART CRITÈRES ACTION")}${tb(["Morceau","Exemples"],[["Départ",k`~`+" (accueil), "+k`.`+" (courant), "+k`..`+" (parent), "+k`/`+" (tout le disque)"],["Nom",k`-name "*.py"`+", "+k`-name "2023*"`+", "+k`-name "*DATA*"`],["Type",k`-type f`+" fichiers réguliers, "+k`-type d`+" répertoires"],["Action","rien : afficher ; "+k`-exec rm {} \;`+" : supprimer chaque fichier trouvé"]])}<p>${k`{}`} est remplacé par chaque fichier trouvé ; ${k`\;`} termine la commande de -exec. Le motif de -name utilise ${k`*`} et ${k`?`} comme bash : ce n'est pas une regex.</p>`),
 Q("Depuis le dossier d'accueil, les fichiers en .py ?",[k`find ~ -name "*.py"`,k`find ~ -name ".py"`,k`find / -name "*.py"`],0,"Sans *, seul un fichier nommé exactement « .py » sortirait ; / partirait de la racine (janvier 2023)."),
 Q("Le motif de -name est…",["un motif de bash, avec * et ?","une expression régulière","un chemin"],0,"-name utilise les motifs de bash, comme dans ls : * pour n'importe quelle suite de caractères, ? pour un caractère. On écrit -name \"*.py\". Ce n'est pas une expression régulière comme .*\\.py."),
 B("Complète : supprimer, depuis l'accueil, les fichiers dont le nom finit par # (juin 2025)",R`find [[0]] -name [[1]] -exec rm [[2]] \;`,[{o:["~","/",".."],a:0},{o:['"*#"','"#*"','"#"'],a:0},{o:["{}","$1","*"],a:0}],"Départ ~, motif \"*#\", et {} pour chaque fichier trouvé."),
 Q("ls -R | grep \"^2023\" à la place de find ?",["Accepté, mais un peu moins bon","Faux : grep ne peut pas lire la sortie de ls","Meilleur : plus court que find, donc plus de points"],0,"Le corrigé de janvier 2024 l'accepte comme « ligne de commande légèrement moins bonne »."),
 P("TD de Meynard, exercice 12, sur papier",`<p>L'action réalisé sur les fichiers sélectionnés est par défaut de les afficher mais on peut réaliser d'autres actions grâce à l'expression -exec suivie de l'action à réaliser puis d'un ${k`\;`}</p><ol><li>Recherchez tous les fichiers textes d'un de vos répertoires et listez leurs noms (print)</li><li>Recherchez tous les fichiers textes d'un de vos répertoires et listez leurs noms suivi de leur contenu</li><li>Comme la mise en page manque d'espace, refaites l'exercice précédent en ajoutant une ligne blanche entre chaque fichier et un soulignement du nom de fichier ...</li></ol><p>(Prends le répertoire ~/USI, et les fichiers dont le nom finit par .txt. Indice, qui n'est pas dans le TD : on peut écrire plusieurs -exec à la suite ; ${k`echo`} seul affiche une ligne vide.)</p>`,`${SH`find ~/USI -name "*.txt"
find ~/USI -name "*.txt" -exec echo {} \; -exec cat {} \;
find ~/USI -name "*.txt" -exec echo {} \; -exec echo "--------" \; -exec cat {} \; -exec echo \;`}<p>${k`{}`} est remplacé par chaque fichier trouvé ; ${k`\;`} termine chaque action. Pour chaque fichier : son nom, un soulignement, son contenu, puis une ligne vide.</p><p>(Corrigé écrit par moi, essayé sur deux fichiers.)</p>`,["Le départ ~/USI et le motif \"*.txt\" entre guillemets","-exec echo {} \\; pour le nom, -exec cat {} \\; pour le contenu","Chaque -exec finit par \\;","Un echo seul pour la ligne blanche"],7),
 K("Quelles sont les trois parties d'une commande find ?","Le départ (~, ., .., /), les critères (-name \"*.py\", -type f ou d), l'action (-exec cmd {} \\;). Sans action : afficher.")]},

/* ------------------------------------------------------------------ */
{id:"u-regex",t:"Expressions régulières",min:17,goal:"Écrire l'expression régulière demandée à chaque examen : début ^, fin $, classes [0-9] et [^.], répétitions * + ?, alternatives.",steps:[
 Q(`Que vérifie ${k`^[0-9]+$`} ?`,["Que la chaîne ne contient que des chiffres, au moins un","Qu'elle contient un chiffre quelque part","Qu'elle commence par un chiffre"],0,"^ et $ obligent toute la chaîne à avoir la forme [0-9]+ (janvier 2022)."),
 L("Les briques",`${tb(["Symbole","Sens"],[[k`.`,"un caractère quelconque"],[k`\.`,"un vrai point"],[k`[0-9]`+" ou "+k`\d`,"un chiffre"],[k`[a-z]`,"une lettre minuscule"],[k`[^.]`,"un caractère qui n'est pas un point"],[k`*`,"le précédent, 0 fois ou plus"],[k`+`,"le précédent, 1 fois ou plus"],[k`?`,"le précédent, 0 ou 1 fois"],[k`{2}`+", "+k`{1,3}`,"exactement 2 fois, de 1 à 3 fois"],[k`(jpg|jpeg)`,"l'un ou l'autre"]])}<p>Avec grep, ${k`+`}, ${k`?`}, ${k`{}`}, ${k`|`} et les parenthèses demandent ${k`grep -E`}. En Python : ${k`re.search(motif, chaine)`}.</p><p>Dans une commande grep, écris ${k`[0-9]`} : ${k`grep -E`} ne connaît pas ${k`\d`}. Les corrigés acceptent ${k`\d`} quand la question demande seulement l'expression.</p>`),
 Q("Quel motif reconnaît un vrai point ?",[k`\.`,k`.`,k`[^.]`],0,". seul veut dire « n'importe quel caractère » ; [^.] veut dire « tout sauf un point »."),
 Q("a+ et a* : la différence ?","a+ exige au moins un a ; a* accepte aussi zéro a|Aucune : les deux acceptent un ou plusieurs a|a* exige au moins un a ; a+ accepte aussi zéro a".split("|"),0,"Dans une expression régulière, a+ veut dire « au moins un a » (a, aa, aaa…) et a* veut dire « zéro, un ou plusieurs a ». Donc a* accepte aussi un mot sans a, et a+ non."),
 L("Ancrer avec ^ et $",`<ul><li>Sans ancre, le motif peut être <b>n'importe où</b> : ${k`grep txt`} garde aussi « mestxts.pdf ».</li><li>${k`^`} colle au <b>début</b> : ${k`^2023`} = commence par 2023.</li><li>${k`$`} colle à la <b>fin</b> : ${k`\.txt$`} = finit par .txt.</li><li>Les deux : <b>toute</b> la chaîne doit avoir la forme : ${k`^[0-9]+$`}.</li></ul><p>Méthode : écris une chaîne exemple, coupe-la en morceaux, traduis chaque morceau, puis ajoute ^ et $ si la question parle de toute la chaîne.</p>`),
 Q("Garder les noms qui finissent par .txt, avec grep ?",[k`grep "\.txt$"`,k`grep "*.txt"`,k`grep ".txt"`],0,"*.txt est un motif de bash, pas une regex ; .txt sans \\ accepte « atxt » et ne colle pas à la fin."),
 S("Construire « exactement deux points » (janvier 2024)","On veut accepter « a.b.c » ou « .. », mais pas « a.b » ni « a.b.c.d ».",[
  {w:`Avant le premier point : des caractères qui ne sont pas des points, peut-être aucun : ${k`[^.]*`}.`,why:"[^.] interdit le point, * autorise 0 fois ou plus."},
  {w:`Le premier point : ${k`\.`} ; puis encore ${k`[^.]*`}.`,why:"Le \\ fait du point un vrai point."},
  {w:`Le second point et la fin : ${k`\.[^.]*`}.`,why:"Après le 2e point, plus aucun point."},
  {w:`On ancre : ${k`^[^.]*\.[^.]*\.[^.]*$`}.`,why:"Toute la chaîne doit avoir cette forme."},
  {w:`Pourquoi pas ${k`^.*\..*\..*$`} ? Le ${k`.*`} peut avaler d'autres points : « a.b.c.d » passerait.`,why:"Le corrigé officiel le dit « pas vraiment correct »."}]),
 Q("Deux entiers séparés par un point, comme 12.5 (janvier 2025) ?",[k`^[0-9]+\.[0-9]+$`,k`^[0-9]*.[0-9]*$`,k`[0-9]+\.[0-9]+`],0,"* accepterait « . » seul ; un point sans \\ accepte n'importe quel caractère ; sans ^ et $, « a12.5b » passerait."),
 B("Complète : les fichiers qui finissent par .jpg ou .jpeg (janvier 2026)",R`ls | grep -E "[[0]]jpe[[1]]g[[2]]"`,[{o:["\\.",".","*"],a:0},{o:["?","+","*"],a:0},{o:["$","^","."],a:0}],"Un vrai point, un e facultatif (?), et $ pour la fin du nom."),
 Q(`${k`^[0-9].*[0-9]$`} accepte…`,["« 2a7 »","« a27 »","« 27a »"],0,"Il faut un chiffre au tout début et un chiffre à la toute fin (janvier 2023)."),
 Q("Avec grep, pour utiliser + ? | et les parenthèses, il faut…",[k`grep -E`,k`grep -v`,k`grep -c`],0,"Par défaut, grep utilise les expressions régulières de base, où +, ?, | et les parenthèses n'ont pas leur sens spécial. L'option -E active les expressions étendues (comme egrep). À ne pas confondre : -v garde les lignes qui ne correspondent pas, -c compte les lignes."),
 P("Juin 2025, question 2, puis quatre expressions, sur papier","<p><b>Examen de juin 2025, question 2 (1,5 point).</b> Donnez la commande qui affiche les lignes d'un fichier nommé log.txt dans lesquelles apparaîssent au moins une adresse IP numérique (approximativement quatre nombres entiers séparés par des points).</p><p><b>Entraînement écrit par moi.</b> Donne l'expression régulière qui vérifie qu'une chaîne : (1) ne contient que des lettres minuscules ; (2) est un numéro de 10 chiffres qui commence par 0 ; (3) est une date jj/mm/aaaa ; (4) finit par .py ou .sh.</p>",`<p>Juin 2025 (pas de corrigé officiel pour cette session : corrigé écrit par moi, essayé) :</p>${SH`grep -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" log.txt`}<p>Pas de ${k`^`} ni de ${k`$`} : l'adresse peut être n'importe où dans la ligne.</p><p>Les quatre expressions :</p>${TX`^[a-z]+$
^0[0-9]{9}$
^[0-9]{2}/[0-9]{2}/[0-9]{4}$
\.(py|sh)$`}`,["grep -E, et le nom du fichier à la fin","Quatre fois [0-9]+, séparés par trois \\.","^ et $ quand toute la chaîne est concernée","Le bon nombre de répétitions : {9} après le 0","Des parenthèses et | pour « l'un ou l'autre »"],9),
 K("Dans une expression régulière, que veulent dire ^ et $ ?","^ : début de la chaîne ; $ : fin. Avec les deux, toute la chaîne doit avoir la forme. Sans, le motif peut être n'importe où."),
 K("Dans une expression régulière, que reconnaît [^.] ? Et [^.]* ?","Un caractère qui n'est pas un point. [^.]* : une suite sans aucun point.")]},

/* ------------------------------------------------------------------ */
{id:"u-bash1",t:"Bash : variables, paramètres et calculs",min:18,goal:"Écrire un petit script : variables, paramètres $1 $# $@, calculs $(( )), résultat d'une commande $( ), et le rendre exécutable.",steps:[
 Q("Que fait i = 1 (avec des espaces) ?",["Une erreur : bash lance une commande nommée i","Met 1 dans i : les espaces sont ignorés","Compare i et 1, comme un test"],0,"En bash, une affectation s'écrit sans espace : i=1. Avec des espaces, bash comprend « lance la commande i avec les arguments = et 1 », et répond qu'elle n'existe pas."),
 L("Les variables",`${tb(["Écriture","Sens"],[[k`nom=test`,"affecter, sans espace autour de ="],[k`echo $nom`,"lire la valeur avec $"],[k`"Bonjour $nom"`,"entre guillemets, $nom est remplacé"],[k`'Bonjour $nom'`,"entre apostrophes, rien n'est remplacé"],[k`liste=$(ls)`,"le résultat d'une commande (ancienne forme : entre accents graves)"],[k`i=$((i+1))`,"un calcul entier (aussi "+k`let i=i+1`+")"],[k`read nom`,"lit une ligne au clavier"],[k`export EDITOR=codium`,"variable d'environnement, transmise aux processus enfants ("+k`env`+" les liste)"]])}<p>Une variable bash contient toujours une chaîne : bash et Python ont un typage <b>dynamique</b>, et ce sont des langages <b>interprétés</b> (janvier 2022).</p>`),
 Q("nom=Michel ; echo 'Bonjour $nom' affiche…",["Bonjour $nom","Bonjour Michel","Bonjour"],0,"Entre apostrophes, rien n'est remplacé ; avec des guillemets, on aurait Bonjour Michel."),
 B("Complète : i vaut 1, on lui ajoute 1, puis on l'affiche",R`i[[0]]1
i=[[1]]
echo [[2]]`,[{o:["=","==",":="],a:0},{o:["$((i+1))","$i+1","i+1"],a:0},{o:["$i","i","%i"],a:0}],"$i+1 donnerait la chaîne « 1+1 » : il faut $(( )) pour calculer."),
 L("Un script et ses paramètres",`${SH`#!/bin/bash
# bonjour.sh : salue chaque paramètre
echo "Le script $0 a reçu $# paramètres"
for p in "$@"
do
    echo "Bonjour $p"
done`}<ul><li>La 1re ligne ${k`#!/bin/bash`} dit quel interpréteur lit le fichier.</li><li>${k`chmod u+x bonjour.sh`} le rend exécutable, ${k`./bonjour.sh Pierre Paul`} le lance (le ./ car le dossier courant n'est pas dans le PATH).</li><li>${k`$0`} : le nom du script ; ${k`$1`}, ${k`$2`} : les paramètres ; ${k`$#`} : leur nombre ; ${k`$@`} (ou ${k`$*`}) : tous ; ${k`$?`} : le code de retour de la dernière commande.</li></ul>`),
 Q("./bonjour.sh Pierre Paul : que vaut $# ?",["2","3","Pierre"],0,"$# est le nombre d'arguments donnés au script. Ici Pierre et Paul : 2. Le nom du script lui-même, $0, n'est pas compté. $1 vaut Pierre et $2 vaut Paul."),
 Q("Le script affiche « permission denied ». Pourquoi ?",["Il manque le droit x : chmod u+x","Il y a une faute de syntaxe dans le script","Il n'est pas dans le PATH : il faut l'y ajouter"],0,"Sans PATH, ce serait « command not found » ; une faute, « syntax error » (TD ex. 42). Une faute de syntaxe donne un message de bash avec un numéro de ligne, et hors du PATH on a « command not found »."),
 O("Remets dans l'ordre le script qui affiche « Bonjour », puis chacun de ses paramètres",["#!/bin/bash","echo \"Bonjour\"","for p in \"$@\"","do","    echo \"$p\"","done"],"La ligne #! d'abord, puis la boucle : for … do … done."),
 Q("liste=$(ls) met dans liste…",["le résultat affiché par ls","la chaîne « ls »","le code de retour de ls"],0,"$( commande ) est remplacé par ce que la commande affiche. liste=$(ls) range donc dans liste le texte affiché par ls, c'est-à-dire les noms des fichiers du dossier courant."),
 P("TD de Meynard, exercice 44 : lsarg.sh, sur papier",`<p>Ecrire un script Bash lsarg.sh qui affiche la liste des arguments, <b>y compris la commande</b>, chacun sur une ligne différente numérotée de 0 à n-1 :</p>${TX`$ lsarg.sh a b c
Liste des arguments :
0 : ./lsarg.sh
1 : a
2 : b
3 : c
$`}`,`${SH`#!/bin/bash
echo "Liste des arguments :"
echo "0 : $0"
i=1
for a in "$@"
do
    echo "$i : $a"
    i=$((i+1))
done`}<p>${k`$0`} est le nom de la commande : il n'est pas dans ${k`$@`}, on l'affiche donc à part, avec le numéro 0. (Corrigé écrit par moi ; essayé, il affiche exactement l'exemple.)</p>`,["La ligne « Liste des arguments : »","$0 affiché avec le numéro 0","Un compteur qui part de 1 et augmente avec $(( ))","La boucle for … in \"$@\" … do … done"],7),
 K("Dans un script Bash, que contiennent $0, $1, $#, $@ et $? ?","$0 : nom du script ; $1 : 1er paramètre ; $# : nombre de paramètres ; $@ : tous ; $? : code de retour de la dernière commande."),
 K("En Bash, quelle est la différence entre un texte entre guillemets et un texte entre apostrophes ?","\"…\" : les $variables sont remplacées. '…' : tout reste tel quel.")]},

/* ------------------------------------------------------------------ */
{id:"u-bash2",t:"Bash : if, for, while et les scripts d'examen",min:18,goal:"Écrire le script Bash de l'examen (2 à 2,5 points) : une boucle sur des fichiers, un test, une commande.",steps:[
 Q("Le bloc d'un if se ferme par…",[k`fi`,k`done`,k`end`],0,"En bash, un if s'ouvre par if … then et se ferme par fi (if à l'envers). Les boucles for et while ont leur bloc entre do et done.",{diag:false}),
 L("if et les tests",`${SH`if [[ -f "$1" ]]
then
    echo "fichier régulier"
elif [[ -d "$1" ]]
then
    echo "répertoire"
else
    echo "n'existe pas"
fi`}${tb(["Test","Vrai si…"],[[k`[[ -f f ]]`,"f est un fichier régulier"],[k`[[ -d d ]]`,"d est un répertoire"],[k`[[ -e x ]]`,"x existe"],[k`[[ $a == $b ]]`+", "+k`!=`,"chaînes égales, différentes"],[k`[[ $f == *.txt ]]`,"f finit par .txt (motif de bash)"],[k`[[ $n -lt 10 ]]`,"nombres : -eq, -ne, -lt, -le, -gt, -ge"]])}<p>Les espaces dans ${k`[[ … ]]`} sont <b>obligatoires</b>.</p>`),
 Q("Tester si $1 est un répertoire ?",[k`[[ -d $1 ]]`,k`[[ -f $1 ]]`,k`[[-d $1]]`],0,"-f teste un fichier régulier ; sans espaces dans les crochets, c'est une erreur de syntaxe."),
 L("Les boucles",`${SH`# chaque fichier .txt du dossier courant
for f in *.txt
do
    echo "$f"
done

# chaque élément du dossier passé en paramètre
for f in $1/*
do
    echo "$f"
done

# chaque ligne d'un fichier
while read ligne
do
    echo "$ligne"
done < notes.csv`}<p>${k`*.txt`} est remplacé par bash par la liste des fichiers : pas besoin de ls. Une fonction s'écrit ${k`nom() { … }`} : ses paramètres sont ${k`$1`}, ${k`$2`}…, et son résultat est ce qu'elle affiche avec echo.</p>`),
 O("Janvier 2026 : remets dans l'ordre le script qui ajoute old devant les .txt",["for fichier in *.txt","do","    mv \"$fichier\" \"old$fichier\"","done"],"Corrigé officiel : une boucle for et un mv par fichier."),
 B("Janvier 2025 : supprimer les .txt du dossier passé en paramètre, avec une boucle",R`for f in $(ls [[0]])
do
    if [[ $f == [[1]] ]]
    then
        rm [[2]]
    fi
done`,[{o:["$1","$f","*"],a:0},{o:["*.txt",".txt","\\.txt$"],a:0},{o:["$1/$f","$f","$1"],a:0}],"ls $1 donne des noms seuls : pour supprimer, il faut le chemin $1/$f. (La solution la plus directe : rm $1/*.txt.)"),
 S("Juin 2025 : numéroter tous les fichiers, sans fonction récursive","Préfixer chaque fichier régulier, à toutes les profondeurs, par 1, 2, 3…",[
  {w:`${k`find . -type f`} donne tous les fichiers réguliers, dans tous les sous-dossiers.`,why:"C'est find qui fait la récursion à notre place."},
  {w:`${k`num=1`} puis ${k`for f in $(find . -type f)`} … ${k`done`}.`,why:"La liste est calculée une fois avant la boucle : un fichier renommé n'est pas revu."},
  {w:`${k`dossier=$(dirname $f)`} et ${k`nom=$(basename $f)`}.`,why:"./a/b.txt se coupe en ./a et b.txt."},
  {w:`${k`mv $f $dossier/$num$nom`} puis ${k`num=$((num+1))`}.`,why:"On renomme dans le même dossier, puis on passe au numéro suivant."}]),
 Q("Parcourir les fichiers du dossier courant sans ls ?",[k`for f in *`,k`for f in ls`,k`for f in $(.)`],0,"* est remplacé par bash par la liste des fichiers du dossier courant : for f in * fait un tour par fichier. for f in ls ferait un seul tour, avec f égal au mot « ls », car ls n'est pas exécuté."),
 P("Janvier 2024, questions 3 et 4, sur papier","<ol start=\"3\"><li>Ecrire un script Bash qui affiche une à une <b>(c'est à dire grâce à une boucle)</b> toutes les lignes d'un fichier dont le nom lui est passé en paramètres.</li><li>Imaginons que les fichiers fournis au script précédent soient des CSV et que les premiers champs de chaque ligne soient des nombres, complétez le code du script précédent pour que celui-ci fasse la somme de ces nombres et l'affiche.</li></ol>",`${SH`somme=0
for ligne in $(cat $1)
do
    echo $ligne
    nombre=$(echo $ligne | cut -d, -f1)
    somme=$((somme+nombre))
done
echo $somme`}<p>Corrigé officiel. ${k`while read ligne … done < $1`} est plus sûr si les lignes contiennent des espaces.</p>`,["Une boucle sur les lignes ($(cat $1) ou while read)","somme=0 avant la boucle","cut -d, -f1 pour le 1er champ","somme=$((somme+nombre))","echo $somme après done"],8),
 Q("Une fonction bash renvoie son résultat…",["en l'affichant avec echo","avec return résultat","dans $1"],0,"return ne renvoie qu'un code de 0 à 255, rangé dans $? (cours de Meynard)."),
 P("Compter les .py d'un dossier, sur papier","<p>(Entraînement écrit par moi, au format de l'examen.)</p><p>Écris un script Bash qui affiche le nombre de fichiers .py du dossier passé en paramètre, <b>sans utiliser ls ni wc</b>.</p>",`${SH`#!/bin/bash
n=0
for f in $1/*.py
do
    if [[ -f "$f" ]]
    then
        n=$((n+1))
    fi
done
echo $n`}<p>Le test ${k`-f`} évite de compter le motif lui-même quand il n'y a aucun .py.</p>`,["for f in $1/*.py (le dossier du paramètre)","Un compteur initialisé à 0","n=$((n+1)) dans la boucle","echo après done"],6),
 K("En Bash, comment écrire une boucle qui traite chaque fichier .txt du dossier courant ?","for f in *.txt (ou $1/*) ; do ; commandes avec \"$f\" ; done"),
 K("En Bash, comment tester qu'un nom est un fichier régulier, un répertoire, ou qu'il existe ?","[[ -f f ]] fichier régulier ; [[ -d d ]] répertoire ; [[ -e x ]] existe ; [[ $f == *.txt ]] motif. Espaces obligatoires.")]},

/* ------------------------------------------------------------------ */
{id:"u-py1",t:"Python : chaînes, listes et fonctions",min:15,goal:"Écrire les petites fonctions des examens : construire une liste résultat, palindrome, intersection, répétitions.",steps:[
 Q("liste = [4, 7, 9]. Que vaut liste[-1] ?",["9","4","une erreur"],0,"En Python, les indices négatifs comptent depuis la fin : liste[-1] est le dernier élément, liste[-2] l'avant-dernier. Ici liste[-1] = 9."),
 L("Listes et chaînes",`${PY`liste = [3, 1, 4]
liste.append(1)        # [3, 1, 4, 1]
liste[0], liste[-1]    # 3 et 1
liste[1:3]             # [1, 4] : de 1 inclus à 3 exclu
len(liste)             # 4
4 in liste             # True
copie = liste[:]       # une vraie copie

mot = "radar"
mot[::-1]              # le mot à l'envers
"a,b,c".split(",")     # ['a', 'b', 'c']
"".join(["a", "b"])    # "ab"
" texte\n".strip()     # "texte"
int("12"), str(4)      # 12 et "4"`}<p>Une chaîne ne se modifie pas : pour changer une lettre, passe par ${k`list(mot)`}, puis ${k`"".join(...)`}.</p>`),
 Q(`${k`"coursPython.tar.gz".split(".")`} donne…`,[k`['coursPython', 'tar', 'gz']`,k`'gz'`,k`['coursPython.tar', 'gz']`],0,"split coupe à chaque point ; la dernière extension est [-1]."),
 Q("liste[1:3] avec liste = [10, 20, 30, 40] ?",[k`[20, 30]`,k`[10, 20, 30]`,k`[20, 30, 40]`],0,"liste[1:3] prend les éléments de l'indice 1 (inclus) à l'indice 3 (exclu), donc les indices 1 et 2 : 20 et 30. Le résultat est [20, 30]. Les indices commencent à 0 : liste[0] vaut 10."),
 L("Blocs, boucles, fonctions",`${PY`if note >= 10:
    print("reçu")
elif note >= 8:
    print("rattrapage")
else:
    print("ajourné")

for v in liste:              # chaque valeur
    print(v)
for i in range(len(liste)):  # chaque indice
    print(i, liste[i])

i = 0
while i < 5:
    i += 1                   # pas de i++ en Python

def somme(a, b):
    return a + b`}<p>Le ${k`:`} ouvre un bloc ; l'<b>indentation</b> dit ce qui est dedans.</p>`),
 O("Janvier 2023 : remets dans l'ordre intersection()",["def intersection(liste1, liste2):","    encommun = []","    for v in liste1:","        if v in liste2 and v not in encommun:","            encommun.append(v)","    return encommun"],"Liste vide, boucle, test, ajout, puis return après la boucle.",{lang:"py"}),
 B("Janvier 2024 : complète palindrome()",R`def palindrome(chaine):
    for pos in range([[0]]):
        if chaine[pos] != chaine[[[1]]]:
            return [[2]]
    return True`,[{o:["len(chaine)","chaine","len(chaine)-1"],a:0},{o:["len(chaine)-pos-1","pos+1","-pos","len(chaine)-pos"],a:0},{o:["False","True","pos"],a:0}],"On compare la lettre pos à celle qui lui fait face ; une seule différence suffit pour répondre False. (Plus court : return chaine == chaine[::-1].)",{lang:"py"}),
 Q(`mot = "radar" puis mot[0] = "R" donne…`,["une erreur : une chaîne ne se modifie pas","« Radar » : la première lettre est remplacée","« R » : mot ne garde que la lettre affectée"],0,"En Python, une chaîne ne se modifie pas : mot[0] = \"R\" provoque une erreur. Pour changer une lettre, on fabrique une nouvelle chaîne, par exemple \"R\" + mot[1:], ou on passe par list(mot), on change la lettre, puis \"\".join(...)."),
 S("Janvier 2022 : enlever les répétitions consécutives","[2, 23, 23, 7, 7, 7, 4, 9, 9, 7] doit donner [2, 23, 7, 4, 9, 7].",[
  {w:"On garde une valeur si elle est différente de la précédente.",why:"Le dernier 7 revient après un 9 : il faut le garder."},
  {w:`${k`nliste = []`} et ${k`mem = -1`}.`,why:"mem retient la dernière valeur gardée ; -1 ne peut pas être dans la liste (entiers positifs)."},
  {w:`${k`for n in liste:`} ; si ${k`n != mem`} : ${k`nliste.append(n)`} et ${k`mem = n`}.`,why:"La valeur passe et devient la nouvelle mémoire."},
  {w:`Pourquoi pas ${k`if n not in nliste`} ? Le dernier 7 serait perdu.`,why:"Le corrigé officiel explique cette erreur."},
  {w:`Pourquoi pas ${k`if n != nliste[-1]`} ? Au premier tour, la liste est vide : erreur.`,why:"D'où la variable mem."}]),
 P("Maximum et moyenne, sur papier","<p>(Entraînement écrit par moi : les petites fonctions des annales sont toutes dans cette leçon.)</p><p>Écris une fonction maximum(liste) <b>sans utiliser max()</b>, puis une fonction moyenne(liste).</p>",`${PY`def maximum(liste):
    m = liste[0]
    for v in liste:
        if v > m:
            m = v
    return m

def moyenne(liste):
    somme = 0
    for v in liste:
        somme += v
    return somme / len(liste)`}`,["def, deux-points et indentation","Une variable initialisée avant la boucle","return après la boucle, pas dedans"],6),
 K("Quels sont les indices d'une liste Python ? Que valent liste[-1] et liste[a:b] ?","De 0 à len(liste) − 1 ; liste[-1] est le dernier ; liste[a:b] va de a inclus à b exclu."),
 K("En Python, quel est le schéma d'une fonction qui construit la liste des éléments qui vérifient une condition ?","resultat = [] ; for x in liste : if condition : resultat.append(x) ; return resultat")]},

/* ------------------------------------------------------------------ */
{id:"u-py2",t:"Python : dictionnaires et fichiers CSV",min:16,goal:"Lire un fichier ligne par ligne, découper un CSV et remplir un dictionnaire qui compte ou regroupe (examens de 2024 à 2026).",steps:[
 Q("d = {} puis d[\"png\"] += 1 ?",["Une erreur : la clé png n'existe pas encore","d vaut {'png': 1} : une clé absente vaut 0 au départ","d vaut {'png': 0} : la clé est créée avant l'ajout"],0,"d[\"png\"] += 1 veut dire d[\"png\"] = d[\"png\"] + 1 : Python lit d'abord d[\"png\"], qui n'existe pas encore. Erreur KeyError. Il faut d'abord tester : if \"png\" in d, sinon mettre d[\"png\"] = 1.",{diag:false}),
 L("Les dictionnaires",`${PY`d = {}                   # vide
d["jpg"] = 10            # crée ou remplace

if cle in d:             # compter
    d[cle] += 1
else:
    d[cle] = 1

if cle in d:             # regrouper dans des listes
    d[cle].append(valeur)
else:
    d[cle] = [valeur]

for cle in d:            # parcourir
    print(cle, d[cle])
for (cle, valeur) in d.items():
    print(cle, ":", valeur)`}`),
 B("Complète le comptage des extensions",R`if ext [[0]] stats:
    stats[ext] [[1]] 1
else:
    stats[ext] [[2]] 1`,[{o:["in","==","not in"],a:0},{o:["+=","=","=="],a:0},{o:["=","+=","=="],a:0}],"Si la clé existe, on ajoute 1 ; sinon, on la crée avec 1.",{lang:"py"}),
 L("Lire un fichier, découper un CSV",`${PY`import sys
if len(sys.argv) < 2:          # sys.argv[0] : le script
    print("Donne un fichier")
    sys.exit()

with open(sys.argv[1], "r") as fd:
    for ligne in fd:           # ou lignes = fd.readlines()
        champs = ligne.strip().split(",")
        nombre = int(champs[1])

fd = open("sortie.txt", "w")   # "w" écrase, "a" ajoute
fd.write("total\n")            # write n'ajoute pas de retour
fd.close()`}<ul><li>${k`strip()`} enlève le retour à la ligne de la fin ; ${k`split(",")`} coupe en champs.</li><li>Tout ce qu'on lit est une chaîne : ${k`int()`} pour calculer.</li></ul>`),
 Q(`ligne = "PC1,windows11,ubuntu\\n". Que vaut ligne.strip().split(",")[1] ?`,[k`'windows11'`,k`'PC1'`,k`'ubuntu\n'`],0,"strip() enlève les espaces et le retour à la ligne \\n aux deux bouts. split(\",\") coupe à chaque virgule : [\"PC1\", \"windows11\", \"ubuntu\"]. L'indice 1 est le deuxième champ : 'windows11'."),
 S("Janvier 2024 : le dictionnaire des modèles","Lignes de f.txt : « DELL Precision=25,Lenovo M900=15 ». On veut modèle → nombre total.",[
  {w:`${k`ligne.strip().split(",")`} donne ${k`["DELL Precision=25", "Lenovo M900=15"]`}.`,why:"Premier découpage, à la virgule."},
  {w:`Pour chaque morceau, ${k`morceau.split("=")`} donne ${k`["DELL Precision", "25"]`}.`,why:"Second découpage, au signe =."},
  {w:`${k`ordi = …[0]`} et ${k`nombre = int(…[1])`}.`,why:"int car on va additionner."},
  {w:`Si ${k`ordi in dico`} : ${k`dico[ordi] += nombre`} ; sinon ${k`dico[ordi] = nombre`}.`,why:"On additionne les quantités, on ne compte pas les lignes."}]),
 O("Janvier 2026 : remets dans l'ordre la lecture de images.csv (ligne 1 : extensions, ligne 2 : nombres)",["with open(\"images.csv\") as fd:","    lignes = fd.readlines()","    images = lignes[0].strip().split(\",\")","    nombres = lignes[1].strip().split(\",\")","    for i in range(len(images)):","        statistiques[images[i]] = int(nombres[i])"],"readlines donne les deux lignes ; on associe l'extension i au nombre i. (Les lignes images et nombres peuvent s'inverser.)",{lang:"py",alt:[[0,1,3,2,4,5]]}),
 Q("fd.write(\"bonjour\") puis fd.write(\"toi\") écrit…",["« bonjourtoi » sur une seule ligne","deux lignes : chaque write va à la ligne","« bonjour toi » : write ajoute un espace"],0,"write écrit exactement le texte donné, sans retour à la ligne. Les deux appels donnent bonjourtoi, collés sur une seule ligne. Pour aller à la ligne, il faut écrire soi-même \"\\n\" : fd.write(\"bonjour\\n\")."),
 Q("python3 stats.py data.csv : que vaut sys.argv[1] ?",[k`'data.csv'`,k`'stats.py'`,k`['data.csv']`],0,"sys.argv est la liste des mots de la ligne de commande : sys.argv[0] est le nom du script, 'stats.py', et sys.argv[1] le premier argument, 'data.csv'."),
 P("Compter les mots d'un fichier, sur papier","<p>(Entraînement écrit par moi, sur le modèle de la question 6 de janvier 2024.)</p><p>Écris un script qui lit le fichier passé en paramètre et crée un dictionnaire mots : chaque mot (séparé par des espaces) en clé, son nombre d'apparitions en valeur.</p>",`${PY`import sys
mots = {}
with open(sys.argv[1]) as fd:
    for ligne in fd:
        for mot in ligne.strip().split(" "):
            if mot in mots:
                mots[mot] += 1
            else:
                mots[mot] = 1
print(mots)`}`,["import sys et sys.argv[1]","open, puis for ligne in fd","strip().split(\" \")","if mot in mots … else …"],8),
 K("En Python, comment compter le nombre d'apparitions de chaque valeur avec un dictionnaire ?","if cle in d : d[cle] += 1 ; else : d[cle] = 1"),
 K("En Python, comment lire un fichier CSV ligne par ligne et récupérer les champs de chaque ligne ?","with open(nom) as fd : for ligne in fd : champs = ligne.strip().split(\",\")")]},

/* ------------------------------------------------------------------ */
{id:"u-py3",t:"Python : parcourir des dossiers récursivement",min:16,goal:"Écrire la grosse question Python de l'examen (4,5 à 6 points) : une fonction récursive qui visite tous les sous-dossiers.",steps:[
 Q(`os.listdir("photos") renvoie…`,["les noms contenus dans photos, fichiers et dossiers","les chemins complets, comme photos/vacances.jpg","seulement les fichiers, sans les sous-dossiers"],0,"os.listdir(\"photos\") renvoie la liste des noms contenus dans photos, fichiers et dossiers, sans le chemin devant. Pour ouvrir un fichier, il faut recoller le chemin : os.path.join(\"photos\", nom)."),
 L("Le squelette du parcours",`${PY`import os, sys

def parcours(dossier):
    for nom in os.listdir(dossier):
        chemin = dossier + os.sep + nom
        if os.path.isdir(chemin):
            parcours(chemin)      # même travail, un étage plus bas
        else:
            print(chemin)         # le traitement d'un fichier

parcours(sys.argv[1])             # l'appel de départ`}<ul><li>Chaque appel s'occupe d'<b>un</b> dossier ; pour chaque sous-dossier, il se rappelle lui-même.</li><li>Ça s'arrête tout seul : un dossier sans sous-dossier ne fait aucun appel.</li><li>${k`os.sep`} vaut ${k`/`} sous Linux ; ${k`os.path.isfile(chemin)`} teste un fichier régulier.</li></ul>`),
 Q("Pourquoi chemin = dossier + os.sep + nom ?",["os.listdir ne donne que des noms : il faut le chemin pour tester et ouvrir","Pour aller plus vite : Python trouve le fichier sans chercher","Pour éviter les doublons : deux dossiers peuvent contenir le même nom"],0,"os.path.isdir(nom) ne marcherait que si le script tourne dans ce dossier. Même le corrigé officiel de 2025 fait l'erreur."),
 O("Remets le squelette dans l'ordre",["import os, sys","def parcours(dossier):","    for nom in os.listdir(dossier):","        chemin = dossier + os.sep + nom","        if os.path.isdir(chemin):","            parcours(chemin)","        else:","            print(chemin)","parcours(sys.argv[1])"],"Import, définition, boucle, chemin, test, appel récursif, traitement, puis l'appel de départ.",{lang:"py"}),
 S("Dérouler le parcours sur un petit arbre","rep1 contient a.txt et un dossier sous, qui contient b.py et c.txt.",[
  {w:`${k`parcours("rep1")`} : os.listdir donne ${k`["a.txt", "sous"]`}.`,why:"L'ordre de listdir n'est pas garanti, mais ça ne change rien."},
  {w:`a.txt n'est pas un dossier : on affiche ${k`rep1/a.txt`}.`,why:"Branche else."},
  {w:`sous est un dossier : on appelle ${k`parcours("rep1/sous")`}. Le premier appel attend.`,why:"Les appels en attente sont gardés sur la pile."},
  {w:`Dans le 2e appel : ${k`rep1/sous/b.py`} et ${k`rep1/sous/c.txt`} sont affichés, puis l'appel se termine.`,why:"Pas de sous-dossier : aucun nouvel appel."},
  {w:"On revient dans le premier appel : sa boucle est finie, tout est terminé.",why:"Chaque fichier a été vu une fois."}]),
 B("Janvier 2026 : complète la mise à jour du dictionnaire",R`data = fichier.split([[0]])
if len(data) > 1 and data[-1] [[1]] statistiques:
    statistiques[[[2]]] += 1`,[{o:['"."','","','"/"'],a:0},{o:["in","not in","=="],a:0},{o:["data[-1]","fichier","data[0]"],a:0}],"L'extension est le dernier morceau après un point ; on ne compte que les extensions déjà dans le dictionnaire.",{lang:"py"}),
 Q("Le sujet interdit os.walk(). Que faire ?",["Écrire soi-même la fonction récursive avec os.listdir","Utiliser os.popen(\"find\") : find fait le parcours à notre place","Utiliser ls -R dans os.system, qui liste tout récursivement"],0,"os.popen est souvent interdit aussi : la récursion fait partie de ce qui est noté. Appeler find ou ls -R contourne la consigne comme os.walk : ce n'est pas accepté."),
 L("Ce qui rapporte des points",`<p>Barème officiel de janvier 2025 (5,5 points) :</p><ul><li>créer le dictionnaire : 0,5 ;</li><li>la fonction récursive : 1 ;</li><li>${k`os.listdir`} : 0,5 ; le test « est un .csv » : 0,5 ;</li><li>${k`open`} : 0,5 ; la boucle sur les lignes : 0,5 ; le ${k`split`} : 0,5 ;</li><li>prendre l'ordinateur : 0,5 ; ${k`append`} : 0,5 ; créer la liste sinon : 0,5.</li></ul><p>Le squelette et les gestes de base font presque tous les points : même si tu bloques sur un détail, écris tout le reste.</p>`),
 P("Janvier 2025, question 4, sur papier (5,5 points)",`<p>Différents fichiers csv contiennent des informations sur les systèmes installés sur différents parcs d'ordinateurs.</p><p>Ecrire un script python qui crée un dictionnaire <b>nommé systèmes</b>, recherche <b>récursivement</b> tous les fichiers d'extension .csv et crée comme clefs dans le dictionnaire les différents systèmes d'exploitation qui y sont mentionnés. Les valeurs correspondantes à ces clefs sont des listes contenant les différents ordinateurs qui possèdent ces systèmes.</p><p>Par exemple, premières lignes du fichier parc1.csv :</p>${TX`PC1,windows11,ubuntu-NobleNumbat
PC2,windows11,ubuntu-NobleNumbat
PC3,windows11,ubuntu-JammyJellyfish
...`}<p>Premières lignes du fichier salles/parc2.csv :</p>${TX`PC41,ubuntu-JammyJellyfish
PC42,ubuntu-JammyJellyfish
...`}<p>Pour cet exemple le contenu du dictionnaire serait celui-ci :</p>${TX`{'windows11':['PC1','PC2','PC3',...],
'ubuntu-NobleNumbat':['PC1','PC2',...],
'ubuntu-JammyJellyfish':['PC3','PC41','PC42',...]}`}<p><b>(Les fonctions popen() et walk() du module os ou du module subprocess ne peuvent pas être utilisées.)</b></p>`,`<p>Corrigé officiel de Pierre Pompidor, avec une erreur corrigée :</p>${PY`import os, sys

systèmes = {}

def parcours(rep):
    liste = os.listdir(rep)
    for fichier in liste:
        if os.path.isdir(rep + os.sep + fichier):
            parcours(rep + os.sep + fichier)
        else:
            if ".csv" in fichier:
                fd = open(rep + os.sep + fichier)
                for ligne in fd:
                    data = ligne.strip().split(",")
                    ordi = data[0]
                    for système in data[1:]:
                        if système in systèmes:
                            systèmes[système].append(ordi)
                        else:
                            systèmes[système] = [ordi]

parcours(sys.argv[1])`}<p>Le corrigé officiel teste ${k`os.path.isdir(fichier)`}, avec le nom seul : cela ne marche que dans le dossier où tourne le script. Il faut le chemin complet, comme ici. ${k`data[1:]`} : tous les champs après le premier, c'est-à-dire les systèmes de cet ordinateur. Python accepte les accents dans les noms de variables.</p>`,["systèmes = {} (0,5)","La fonction récursive et son appel (1)","os.listdir (0,5) et le test .csv (0,5)","open et la boucle sur les lignes (1)","split et data[0] (1)","append, ou création de la liste (1)","Pas de os.walk ni de os.popen : c'est interdit par l'énoncé"],15),
 K("En Python, quel est le squelette d'une fonction qui parcourt un dossier et tous ses sous-dossiers ?","def parcours(dossier) : for nom in os.listdir(dossier) : chemin = dossier + os.sep + nom ; if os.path.isdir(chemin) : parcours(chemin) ; else : traiter. Puis parcours(sys.argv[1])."),
 K("En Python, comment obtenir l'extension d'un nom de fichier ?","morceaux = nom.split(\".\") ; si len(morceaux) > 1, l'extension est morceaux[-1]. Ou nom.endswith(\".csv\").")]},

/* ------------------------------------------------------------------ */
{id:"u-c",t:"Le C sous Unix : compiler, argc et argv, mémoire",min:24,goal:"Répondre aux questions de cours sur la compilation (étapes de gcc, en-têtes, argc et argv) et sur le passage des paramètres (TD ex. 47 à 58).",steps:[
 Q("Bash et Python sont des langages…",["interprétés","compilés","machine"],0,"Un interpréteur lit et exécute le source à chaque lancement ; le C, lui, est compilé."),
 L("Interpréter ou compiler",`<ul><li><b>Interpréteur</b> (bash, python3) : il lit le source et l'exécute, à chaque lancement. Le cycle d'essai est rapide, l'exécution plus lente.</li><li><b>Compilateur</b> (gcc, g++) : il traduit le source une fois pour toutes en code machine.</li></ul><p>Les étapes de gcc (une seule commande les enchaîne : ${k`gcc monprog.c -o monprog`}) :</p><ol><li><b>prétraitement</b> (le préprocesseur) : il traite ${k`#include`} et ${k`#define`} (${k`gcc -E`}) ;</li><li><b>compilation</b> : après les analyses (c'est là qu'apparaissent les « syntax error »), le C devient du langage d'assemblage (${k`gcc -S`}) ;</li><li><b>assemblage</b> : fichier objet ${k`.o`} (${k`gcc -c`}) ;</li><li><b>édition des liens</b> : les objets et les bibliothèques donnent le fichier binaire exécutable.</li></ol>${SH`gcc -o fact -Wall fact.c
./fact 12`}`),
 Q("Quelle étape traite #include ?",["Le préprocesseur","L'édition de liens","L'assemblage"],0,"Il recopie le fichier d'en-tête à la place de la ligne #include."),
 Q("gcc -c prog.c produit…",["un fichier objet prog.o","un exécutable prog","un fichier assembleur prog.s"],0,"gcc fait plusieurs étapes : compilation, assemblage, édition de liens. -c s'arrête après l'assemblage et produit un fichier objet prog.o, sans exécutable. -S s'arrêterait plus tôt, avec le code assembleur prog.s."),
 L("main, argc, argv",`${CC`#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage : %s entier\n", argv[0]);
        return 1;          /* code d'erreur, visible dans $? */
    }
    int n = atoi(argv[1]); /* chaîne vers entier */
    printf("%d\n", n * 2);
    return 0;
}`}<ul><li>${k`argc`} compte les mots de la ligne de commande, <b>nom du programme compris</b> ; ${k`argv[0]`} est ce nom.</li><li>${k`<stdio.h>`} est cherché dans les dossiers du système ; ${k`"monprog.h"`} d'abord dans le dossier courant.</li><li>Un ${k`.h`} contient des déclarations (du texte) ; une bibliothèque, du code compilé ajouté à l'édition de liens.</li></ul><p>Une boucle en C, dans le programme argv.c du cours, qui affiche tous ses paramètres :</p>${CC`for (int i=0;i<argc;i++){
  printf("%s\n",argv[i]);
}`}<p>${k`int i=0`} : le départ ; ${k`i<argc`} : on continue tant que c'est vrai ; ${k`i++`} : on ajoute 1 à i après chaque tour. ${k`%s`} affiche une chaîne, ${k`%d`} un entier, ${k`%f`} un nombre à virgule (${k`%.2f`} : avec 2 décimales).</p>`),
 Q("./moy 5 8 12 3 : que vaut argc ?",["5","4","3"],0,"argc compte tous les mots de la ligne de commande, y compris le nom du programme : ./moy, 5, 8, 12 et 3. Donc argc = 5, et argv[0] est \"./moy\"."),
 L("Passage par valeur et mémoire",`<p>Exemple passageparam.c du cours :</p>${CC`void modifieur(int i, char* s, float t[2]){
  i=i+1;
  s[0]='M'; s=NULL;
  t[0]=0.0; t++;
  return;
}
/* dans main : n vaut 5, ch pointe sur une zone qui contient "bonjour",
   compl vaut {1.1,2.2} ; puis : modifieur(n,ch,compl); */`}<ul><li>En C, une fonction reçoit toujours <b>une copie</b> de ses paramètres.</li><li>Elle ne modifie l'appelant qu'<b>à travers un pointeur</b>, ou un tableau (passé comme un pointeur sur sa 1re case).</li><li>Pile : les variables locales, le temps de la fonction. Tas : ${k`malloc`} jusqu'au ${k`free`}. Statique : les globales, toute la vie du processus.</li></ul>`),
 Q("Après l'appel, n vaut…",["5 : inchangé","6 : la fonction a ajouté 1 à n","indéfini : n n'existe plus après l'appel"],0,"En C, une fonction reçoit une copie de la valeur de ses arguments. Modifier i dans la fonction ne change que cette copie, pas la variable n de l'appelant : après l'appel, n vaut toujours 5. Pour modifier n, il faudrait passer son adresse.",{diag:false,ctx:true}),
 Q("Et ch, qui valait « bonjour » ?",["« Monjour »","« bonjour »","NULL"],0,"s[0] = 'M' écrit dans la zone que ch désigne aussi ; s = NULL ne change que la copie du pointeur.",{diag:false,ctx:true}),
 Q("Et compl, qui valait {1.1, 2.2} ?",["{0.0, 2.2}","{1.1, 2.2}","{2.2, 1.1}"],0,"t[0] = 0.0 écrit dans la première case du tableau de l'appelant ; t++ ne change que la copie du pointeur. Le cours affiche : APRES : n=5 ; ch=Monjour ; compl={0.000000,2.200000}.",{diag:false,ctx:true}),
 Q("Un fichier .h contient…",["des déclarations (prototypes) : du texte","du code compilé, prêt à être lié","l'exécutable, à lancer avec ./"],0,"Un fichier .h contient des déclarations, comme les prototypes de fonctions : du texte que le compilateur lit pour vérifier les appels. Le code compilé de ces fonctions est ailleurs, dans la bibliothèque (TD, ex. 48)."),
 S("Qu'affiche portee.c ? (exemple du cours)",`${CC`#include <stdio.h>
float g=10.2;
int main(int argc, char* argv[], char* env[]){
  {
    char g='A';
    for(int g=1;g<5;g++){
      printf("g=%d;",g);
    }
    printf("\ng=%c\n",g);
  }
  printf("g=%f\n",g);
  return 0;
}`}Trois variables s'appellent g. Règle du cours : on remonte les blocs pour retrouver la définition la plus proche.`,[
  {w:`Dans le for, g est l'entier de la boucle : ${k`g=1;g=2;g=3;g=4;`}`,why:"La définition la plus proche est int g=1, dans le for. La boucle s'arrête quand g vaut 5."},
  {w:`Après le for, dans le bloc : ${k`g=A`}`,why:"L'entier du for n'existe plus ; la plus proche est char g='A'."},
  {w:`Après le bloc : ${k`g=10.200000`}`,why:"Il ne reste que la variable globale float g=10.2 ; %f affiche 6 décimales."}]),
 P("TD de Meynard, exercice 54, sur papier","<p>En utilisant la fonction atoi qui convertit une chaîne en entier, réaliser le calcul de la moyenne de la suite des paramètres passés à la ligne de commande : moy 5 8 12 3.</p><ol><li>Ecrire l'algorithme de ce programme.</li><li>Ecrire le programme C correspondant.</li></ol>",`<p>1. Algorithme (écrit par moi) :</p>${TX`m = 0
pourChaque (i de 1 à argc - 1)
    m = m + entier(argv[i])
afficher m / (argc - 1)`}<p>2. Corrigé de Michel Meynard (fichier moy.c déposé sur Moodle) :</p>${CC`#include <stdio.h>
#include <stdlib.h>
int main(int argc, char *argv[], char *env[]) {
  float m=0;
  for (int i=1;i<argc;i++){
    m+=atoi(argv[i]);
  }
  printf("\nMoyenne des %d nombres : %.2f\n",argc-1,m/(argc-1));
  return 13;
}`}<ul><li>La boucle part de ${k`i=1`} : ${k`argv[0]`} est le nom du programme, et il y a ${k`argc-1`} nombres.</li><li>${k`m`} est un float : ${k`m/(argc-1)`} n'est donc pas une division entière. ${k`moy 5 8 12 3`} affiche « Moyenne des 4 nombres : 7.00 ».</li><li>${k`return 13`} : le code de retour est libre ; ${k`echo $?`} affiche ensuite 13. D'habitude on renvoie 0 quand tout s'est bien passé.</li></ul>`,["Les deux #include (stdio.h pour printf, stdlib.h pour atoi)","La boucle qui part de 1 et s'arrête avant argc","atoi(argv[i]) pour convertir chaque paramètre","Une somme dans un float (ou une conversion avant de diviser)","La division par argc - 1"],9),
 K("Quelles options de gcc arrêtent la compilation après le prétraitement, après la compilation, après l'assemblage ?","Prétraitement (#include, #define ; gcc -E), compilation en langage d'assemblage (gcc -S), assemblage en fichier objet .o (gcc -c), édition des liens (exécutable)."),
 K("En C, comment les paramètres sont-ils passés à une fonction ? Comment une fonction peut-elle modifier une variable de l'appelant ?","Toujours par copie. On ne modifie l'appelant qu'à travers un pointeur, ou un tableau passé comme un pointeur.")]}
];
})();
