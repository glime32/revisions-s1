/* Utilisation des Systèmes Informatiques (HAI103I, Michel Meynard et Pierre Pompidor).
   Un seul examen écrit en janvier, 2 h, aucun document (16/01/2026, 17/01/2025, 15/01/2024 les années passées).
   Partie Pompidor (10 points) : recherches (find, grep), expression régulière, script Bash, script Python ;
   sujets et corrigés 2021-2026 sur lirmm.fr/~pompidor (EXAMENS/examens.html), copiés dans Moodle-S1/usi/annales.
   Partie Meynard (10 points) : aucun ancien sujet trouvé ; le site suit son cours et ses TD.
   Coefficient 4. Révisions planifiées à partir du 18/12 (après le dernier CC), choix de l'utilisateur. */
(function(){
window.SUBJ=window.SUBJ||{};
const hl=s=>`<span class="hl">${s}</span>`,F=s=>`<div class="formula">${s}</div>`;
const k=(s,...v)=>`<code>${W.esc(String.raw(s,...v))}</code>`;
const blk=lang=>(s,...v)=>W.code(String.raw(s,...v),lang);
const SH=blk("sh"),PY=blk("py"),CC=blk("c"),TX=blk("txt");
const tb=(head,rows)=>`<div style="overflow-x:auto"><table class="tbl"><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const concepts=[];const add=(ch,o)=>{o.ch=ch;concepts.push(o);};

/* ---------- 1. fichiers, chemins, droits ---------- */
add(1,{id:"usi-se",type:"def",ref:"Cours Meynard « Introduction », « Les langages », « Matériel et Logiciel » ; TD ex. 1",t:"Le système d'exploitation, Unix et les couches",short:"Système d'exploitation",
 plain:`Un ${hl("système d'exploitation")} (SE) est la « couche logicielle offrant une interface entre la machine matérielle et les utilisateurs ». Unix est écrit ${hl("en C")}.`,
 formal:`<ul><li>Objectifs : convivialité de l'interface (graphique ou en ligne de commande), clarté et généricité des concepts (arborescence de répertoires et fichiers, droits des utilisateurs), efficacité de l'allocation des ressources en temps et en espace.</li><li>Services : multiprogrammé (ou multi-tâches) préemptif, multi-utilisateurs (authentification), pilotage des périphériques, fonctionnalités réseaux.</li><li>Principaux systèmes : Windows ; les Unix (GNU/Linux, BSD, AIX, Solaris) ; Mac OS X et iOS, dérivés d'Unix ; Android, basé sur un noyau Linux.</li><li>Architecture en couches d'Unix : le matériel, puis le noyau, puis les bibliothèques, puis les applications et bash. Une application utilise les fonctions de la bibliothèque standard C (${k`man 3`} : printf…) et les appels noyau (${k`man 2`} : fork, pipe…).</li></ul>${tb(["Niveau","Couche"],[["5","langages d'application (traduits par compilation, ou interprétés)"],["4","langage d'assemblage (traduit par l'assembleur)"],["3","système d'exploitation (appels système)"],["2","machine traditionnelle (jeu d'instructions)"],["1","couche microprogrammée"],["0","couche physique (portes logiques)"]])}<p>Matériel (hardware) : les composants mécaniques et électroniques de la machine. Logiciel (software) : l'ensemble des programmes. Le cours : « Matériel et Logiciel sont conceptuellement équivalents » ; le choix dépend du coût, de la vitesse, de la fiabilité.</p>`,
 use:`<p>Deux modes d'interaction avec Linux : graphique (GUI : fenêtres, menus, souris) et ligne de commande (CLI : un terminal, qui exécute l'interpréteur de commandes, bash par défaut).</p>`,
 trap:`La racine de l'arborescence s'écrit ${k`/`} (slash), à ne pas confondre avec l'anti-slash <code>\\</code>.`,
 q:"Qu'est-ce qu'un système d'exploitation ?",a:"La couche logicielle offrant une interface entre la machine matérielle et les utilisateurs.",rel:["usi-chemins","usi-c-compil"]});

add(1,{id:"usi-chemins",type:"def",ref:"Cours Meynard « L'arborescence Unix » ; poly Pompidor §1.5 ; TD ex. 3, 7 à 11",t:"Arborescence, chemins et commandes de base",short:"Chemins et commandes",
 plain:`Tous les fichiers sont rangés dans ${hl("un seul arbre")} qui part de la racine ${k`/`}. Un chemin ${hl("absolu")} part de ${k`/`}, un chemin ${hl("relatif")} part du dossier où tu es.`,
 formal:`<ul><li>${k`/`} la racine, ${k`~`} ton dossier d'accueil, ${k`.`} le dossier courant, ${k`..`} le dossier parent.</li><li>Absolu : ${k`/usr/bin`}. Relatif : ${k`bin`}, ${k`../toto`}, ${k`../..`}.</li><li>Dossiers à connaître : ${k`/bin`} et ${k`/usr/bin`} (les commandes), ${k`/etc`} (la configuration), ${k`/home`} (les dossiers des utilisateurs), ${k`/tmp`} (temporaire), ${k`/dev`} (les périphériques), ${k`/proc`} (les processus), ${k`/usr/include`} (les en-têtes du C), ${k`/sbin`} (les commandes de l'administrateur), ${k`/lib`} (les bibliothèques), ${k`/mnt`} (les clés USB montées), ${k`/var/log`} (les journaux).</li><li>${k`dirname un/deux.txt`} extrait le répertoire (${k`un`}) ; ${k`basename un/deux.txt`} extrait le nom (${k`deux.txt`}).</li><li>Créer un fichier texte sans éditeur : ${k`echo "Maître Renard" > fable.txt`}, ou ${k`cat > fable.txt`}, on tape le texte, puis Ctrl-D.</li></ul>
 ${tb(["Commande","Rôle"],[[k`pwd`,"affiche le dossier courant"],[k`cd chemin`,"change de dossier ; seul, revient dans ~"],[k`ls -l -a -R`,"liste : détaillé, avec les fichiers cachés, récursivement"],[k`mkdir d`+" / "+k`rmdir d`,"crée / supprime un dossier (vide)"],[k`cp f g`+", "+k`cp -r d e`,"copie un fichier, un dossier entier"],[k`mv f g`,"déplace ou renomme"],[k`rm f`+", "+k`rm -r d`,"supprime un fichier, un dossier et son contenu"],[k`cat f`,"affiche le contenu"],[k`which ls`,"où se trouve la commande"],[k`man ls`,"le manuel (q pour quitter)"]])}`,
 use:`<p>Avant une commande avec un chemin, demande-toi d'où tu pars. Depuis ${k`/usr/bin`}, ${k`cd ../..`} remonte de deux crans : tu arrives à ${k`/`}.</p>`,
 trap:`${k`rmdir`} ne supprime qu'un dossier vide. Pour un dossier plein : ${k`rm -r`}. Et ${k`cp`} sur un dossier demande ${k`-r`}.`,
 q:"Tu es dans /usr/bin. Où mène cd ../.. ?",a:"À la racine /.",rel:["usi-types","usi-droits"]});

add(1,{id:"usi-types",type:"def",ref:"TD ex. 2, 4, 5, 30, 42 ; cours Meynard",t:"Types de fichiers, commandes et PATH",short:"Types de fichiers, PATH",
 plain:`Le 1er caractère de ${k`ls -l`} donne le ${hl("type")} : ${k`-`} fichier régulier, ${k`d`} répertoire, ${k`l`} lien symbolique. Une commande comme ${k`ls`} est ${hl("un fichier exécutable")}, rangé dans un dossier listé par la variable ${k`PATH`}.`,
 formal:`<ul><li>Types : ${k`-`} régulier, ${k`d`} répertoire, ${k`l`} lien symbolique, ${k`c`} et ${k`b`} périphériques (caractère, bloc), ${k`p`} tube nommé, ${k`s`} socket.</li><li>${k`which ls`} affiche où est la commande, par exemple ${k`/usr/bin/ls`}.</li><li>${k`PATH`} : les dossiers où bash cherche le premier mot de la ligne, séparés par ${k`:`}. Pour le voir : ${k`echo $PATH`}.</li><li>Commandes ${hl("internes")} (${k`cd`}, ${k`echo`}, ${k`export`}, ${k`exit`}, ${k`read`}) : elles sont dans bash lui-même, il n'y a pas de fichier.</li><li>Un script du dossier courant se lance avec ${k`./script.sh`}, car le dossier courant n'est pas dans le PATH.</li></ul>`,
 use:`<p>${k`lrwxrwxrwx … codium -> /usr/share/codium/bin/codium`} : le ${k`l`} et la flèche disent que ${k`codium`} est un lien symbolique.</p>`,
 trap:`${k`cd`} ne peut pas être une commande externe : un processus enfant qui change de dossier ne changerait pas celui de bash.`,
 q:"Quelle commande dit dans quel dossier se trouve la commande gcc ?",a:"which gcc",rel:["usi-chemins","usi-fork"]});

add(1,{id:"usi-utilisateur",type:"def",ref:"Cours Meynard « Utilisateur Unix »",t:"Utilisateurs et groupes",short:"Utilisateurs, groupes",
 plain:`Un utilisateur Unix est identifié par un numéro, son ${hl("uid")}, et possède un nom. Il est membre d'un ou plusieurs ${hl("groupes")}. Un fichier qu'il crée lui appartient, ainsi qu'à son groupe primaire.`,
 formal:`<ul><li>${k`whoami`} affiche le nom de l'utilisateur ; ${k`id`} affiche son identité complète : uid, gid (le groupe primaire) et la liste de ses groupes.</li><li>Chaque groupe a un identifiant gid et un nom. À un instant donné, un utilisateur appartient à 1 groupe primaire, par défaut le premier de sa liste ; ${k`newgrp monAutreGroupe`} en change.</li><li>Sous Linux, le groupe primaire d'un utilisateur est un groupe privé qui ne contient que lui.</li><li>${k`root`} (id 0) est l'administrateur de la machine : il a tous les droits. On ne se connecte pas en root : on utilise la commande ${k`sudo`}.</li><li>Ces informations sont dans les fichiers ${k`/etc/passwd`}, ${k`/etc/group`}, ${k`/etc/sudoers`}.</li></ul><p>Exemple du cours (sur Mac OS X, un autre Unix) :</p>${TX`$ id
uid=501(michel) gid=20(staff) groups=20(staff),12(everyone),61(localaccounts)…`}`,
 use:`<p>Dans une ligne de ${k`ls -l`}, la 3e colonne est le propriétaire du fichier et la 4e son groupe : les droits u, g, o se lisent par rapport à eux.</p>`,
 trap:`root a tous les droits : s'enlever ses propres droits sur un fichier ne le protège pas de l'administrateur.`,
 q:"Quelle commande affiche ton uid, ton groupe primaire et tes groupes ?",a:"id (whoami donne seulement le nom).",rel:["usi-droits","usi-chemins"]});

add(1,{id:"usi-droits",type:"meth",ref:"Cours Meynard « Droits Unix » ; TD ex. 16 à 20 ; poly Pompidor §1.5.2",t:"Les droits rwx et chmod",short:"Droits et chmod",
 plain:`Chaque fichier a 9 droits : ${hl("r w x")} pour le ${hl("propriétaire (u)")}, le ${hl("groupe (g)")} et les ${hl("autres (o)")}. En octal, r = 4, w = 2, x = 1 : ${k`rwxr-xr--`} s'écrit 754.`,
 formal:`${TX`-rw-r--r-- 1 meynard p0105 8 août 30 10:54 droits.txt`}
 <p>Dans l'ordre : le type (${k`-`}) et les 9 droits, le nombre de liens, le propriétaire, le groupe, la taille en octets, la date de dernière modification, le nom. Avec ${k`ls -i`}, le numéro d'inode vient en premier.</p>
 ${tb(["Droit","Sur un fichier","Sur un répertoire"],[["r","lire le contenu","lister les noms ("+k`ls`+")"],["w","modifier le contenu","créer, supprimer, renommer des entrées"],["x","exécuter","traverser : "+k`cd`+", atteindre un fichier dedans"]])}
 <ul><li>${k`chmod 755 f`} : rwxr-xr-x. ${k`chmod 644 f`} : rw-r--r--. ${k`chmod 600 f`} : rw-------.</li><li>Symbolique : ${k`chmod u+x f`}, ${k`chmod go-w f`}, ${k`chmod a=r f`} (a : tout le monde).</li><li>À chaque ouverture d'un fichier, le système vérifie l'accès de l'utilisateur à ${hl("chaque répertoire traversé")} du chemin, puis au fichier final.</li></ul>`,
 use:`<p>Pour l'octal, découpe en trois paquets de trois : rwx = 4 + 2 + 1 = 7, r-x = 5, r-- = 4, --- = 0.</p>`,
 trap:`Supprimer un fichier dépend des droits ${hl("du répertoire")} qui le contient (w et x), pas des droits du fichier.`,
 q:"Quels droits la commande chmod 640 donne-t-elle à un fichier ?",a:"rw-r----- : le propriétaire lit et écrit, le groupe lit, les autres n'ont rien.",rel:["usi-umask","usi-inode"]});

add(1,{id:"usi-umask",type:"meth",ref:"Cours Meynard « umask » ; TD § 2.6 et ex. 25",t:"umask : les droits d'un nouveau fichier",short:"umask",
 plain:`Un nouveau fichier part de ${hl("666")} (rw-rw-rw-), un nouveau répertoire de ${hl("777")}. Le umask ${hl("retire")} les droits qu'il contient : avec umask 022, un fichier naît en 644 et un répertoire en 755.`,
 formal:`${F("droits obtenus = (droits de base) ET (NON umask)")}${tb(["umask","nouveau fichier","nouveau répertoire"],[["022","644 rw-r--r--","755 rwxr-xr-x"],["027","640 rw-r-----","750 rwxr-x---"],["077","600 rw-------","700 rwx------"],["024","642 rw-r---w-","753 rwxr-x-wx"],["020","646 rw-r--rw-","757 rwxr-xrwx"]])}<p>${k`umask`} seul affiche la valeur actuelle ; ${k`umask 027`} la change.</p>`,
 use:`<p>Chiffre par chiffre : écris le chiffre de base en binaire (6 = 110, 7 = 111), barre les bits à 1 du umask, relis le résultat.</p>`,
 trap:`On ${hl("enlève des bits")}, on ne soustrait pas : 666 avec umask 033 donne 644 (rw-r--r--), pas 633.`,
 q:"Avec umask 027, quels sont les droits d'un nouveau fichier ? D'un nouveau répertoire ?",a:"640 (rw-r-----) et 750 (rwxr-x---).",rel:["usi-droits"]});

/* ---------- 2. inodes et liens ---------- */
add(2,{id:"usi-inode",type:"def",ref:"Cours Meynard « Table des inodes », « Répertoires » ; TD ex. 17, 22, 26",t:"Inodes et répertoires",short:"Inode",
 plain:`Un ${hl("inode")} est la fiche d'identité d'un fichier : type, droits, propriétaire, taille, dates, ${hl("nombre de liens")} et adresses des blocs de données. ${hl("Le nom n'y est pas")} : il est dans le répertoire, qui n'est qu'une liste de couples (nom, numéro d'inode).`,
 formal:`<ul><li>Un inode contient : son numéro, le type, les droits, le nombre de liens, le propriétaire, le groupe, la taille en octets, les dates (création, modification, accès), les pointeurs (les numéros des blocs de données).</li><li>Dans un répertoire, chaque nom est unique.</li><li>Un répertoire contient des entrées « nom ⇔ numéro d'inode », dont ${k`.`} (lui-même) et ${k`..`} (son parent).</li><li>${k`ls -i`} : le numéro d'inode. ${k`ls -l`} : le nombre de liens (2e colonne). ${k`ls -a`} : les fichiers cachés (leur nom commence par un point).</li><li>Un répertoire a au moins 2 liens (son nom dans le parent et son ${k`.`}), plus 1 par sous-répertoire (leur ${k`..`}).</li></ul>`,
 use:`<p>Un inode qui n'a qu'un seul lien n'est pas un répertoire.</p>`,
 trap:`${k`mv`} dans la même partition ne déplace pas les données : il change seulement une entrée de répertoire.`,
 q:"Un répertoire vide vient d'être créé. Combien a-t-il de liens ?",a:"2 : son nom dans le parent, et l'entrée « . » en lui-même.",rel:["usi-liens","usi-taille"]});

add(2,{id:"usi-liens",type:"meth",ref:"Cours Meynard « Liens durs », « Lien symbolique » ; TD ex. 27 à 29",t:"Liens durs et liens symboliques",short:"ln et ln -s",
 plain:`Un ${hl("lien dur")} est un ${hl("deuxième nom")} pour le même inode. Un ${hl("lien symbolique")} est un petit fichier qui contient ${hl("un chemin")}, comme un raccourci.`,
 formal:`${tb(["","Lien dur","Lien symbolique"],[["Commande",k`ln ancien nouveau`,k`ln -s cible raccourci`],["Inode","le même","un nouvel inode, de type l"],["Compteur de liens","+1","inchangé"],["Vers un répertoire","interdit","possible"],["Autre partition","impossible","possible"],["Si on supprime l'original","le contenu reste là, par l'autre nom","le lien est cassé (il vise un chemin vide)"]])}
 <p>${k`rm`} enlève un nom et retire 1 au compteur. L'inode et le contenu ne sont supprimés que lorsque le nombre de liens est nul.</p><ul><li>Inode d'un lien symbolique : type ${k`l`}, et sa taille est la longueur du chemin visé. Pour ${k`ln -s /etc/passwd ./passwd`}, la taille est 11, le nombre de caractères de ${k`/etc/passwd`}.</li><li>Toute action sur le raccourci agit sur le fichier visé (${k`cat raccourci`}), sauf ${k`rm raccourci`}, qui supprime le raccourci.</li><li>Lien mort : un raccourci dont le chemin n'existe plus. Circuit : ${k`ln -s .. c`}, à ne pas suivre dans un parcours récursif.</li><li>Appels système : link() pour ${k`ln`}, symlink() pour ${k`ln -s`}, unlink() pour ${k`rm`}.</li></ul>`,
 use:`<p>Pour trouver tous les noms d'un inode : ${k`find / -inum 1234`}.</p>`,
 trap:`Un lien dur ne peut viser ni un répertoire, ni un fichier d'une autre partition : un numéro d'inode n'a de sens que dans sa partition.`,
 q:"On fait ln a b, puis rm a. Que devient b ?",a:"b marche toujours : même inode, le compteur passe de 2 à 1, les données restent.",rel:["usi-inode"]});

add(2,{id:"usi-taille",type:"meth",ref:"Cours Meynard « Stockage des données des fichiers » et ses exercices",t:"Taille maximale d'un fichier : blocs directs et indirects",short:"Taille max d'un fichier",
 plain:`L'inode garde ${hl("10 adresses directes")} de blocs, puis 1 adresse ${hl("simple indirecte")} (un bloc rempli d'adresses), 1 ${hl("double")} et 1 ${hl("triple")}. On compte combien de blocs de données on peut atteindre.`,
 formal:`${F("n = taille d'un bloc / taille d'une adresse ;  taille max = (10 + n + n² + n³) × taille d'un bloc")}<p>Selon les Unix, il y a de 10 à 13 pointeurs directs ; l'exemple du cours en prend 10.</p><p>Blocs de 4 Kio, adresses de 4 octets : n = 4 Kio / 4 = 1 Ki = 2¹⁰ adresses par bloc.</p>${tb(["Niveau","Blocs atteints","Taille"],[["10 directs","10","40 Kio"],["simple indirect","2¹⁰","2¹⁰ × 4 Kio = 4 Mio"],["double indirect","2²⁰","4 Gio"],["triple indirect","2³⁰","4 Tio"]])}<p>Total : 40 Kio + 4 Mio + 4 Gio + 4 Tio, environ ${hl("4 Tio")}.</p>`,
 use:`<p>Travaille en puissances de 2 : 1 Kio = 2¹⁰ octets, 1 Mio = 2²⁰, 1 Gio = 2³⁰, 1 Tio = 2⁴⁰.</p>`,
 trap:`Si le champ « taille » de l'inode n'a que 32 bits, un fichier ne dépasse pas 2³² octets = 4 Gio, même si les blocs permettraient plus. Pour 4 Tio = 2⁴² octets, il faut 42 bits.`,
 q:"Un inode a 10 adresses directes et trois niveaux d'indirection. Quand la taille des blocs passe de 4 Kio à 8 Kio (adresses de 4 octets), par combien la taille maximale d'un fichier est-elle multipliée ?",a:"Par 16 : n = 2¹¹, triple indirect (2¹¹)³ × 2¹³ = 2⁴⁶ octets = 64 Tio.",rel:["usi-inode"]});

/* ---------- 3. processus, redirections, tubes ---------- */
add(3,{id:"usi-processus",type:"def",ref:"Cours Meynard « Gestion des processus » ; TD ex. 31 à 38",t:"Processus : états, ps, kill, premier et arrière-plan",short:"Processus",
 plain:`Un ${hl("processus")} est un programme ${hl("en train de s'exécuter")}, avec un numéro (PID) et un parent (PPID). Il est ${hl("actif")} (il a le processeur), ${hl("prêt")} (il n'attend que le processeur) ou ${hl("bloqué")} (il attend autre chose, comme le clavier).`,
 formal:`<ul><li>Actif : il détient la ressource UC (le processeur). Prêt : seule la ressource UC lui manque. Bloqué : il lui manque au moins une autre ressource.</li><li>Les 4 changements d'état du cours : 1 actif → prêt, 2 actif → bloqué, 3 bloqué → prêt, 4 prêt → actif. Le passage à l'état actif ne peut se faire que par l'état prêt.</li><li>L'ordonnanceur élit, parmi les processus prêts, celui de plus haute priorité, et fait un changement de contexte : il sauvegarde le contexte du processus courant et restitue celui de l'élu.</li><li>La table des processus garde, pour chaque processus : son état, son identité, son compteur ordinal, ses fichiers ouverts, son répertoire de travail…</li><li>Dans ${k`ps`}, la colonne STAT donne l'état : ${k`R`} (run) prêt ou élu, ${k`S`} (sleep) en attente d'un événement.</li><li>Deux modes : utilisateur et noyau. Les appels système et les interruptions passent en mode noyau, ce qui protège le matériel et les autres processus.</li><li>${k`ps`}, ${k`ps f`} (arbre parent/enfant), ${k`ps faux`}, ${k`top`} (trié par usage du processeur).</li><li>${k`cmd &`} lance en arrière-plan ; ${k`jobs`} liste ces tâches ; ${k`%1`} ramène la tâche 1 au premier plan.</li><li>${k`Ctrl-C`} tue le processus au premier plan ; ${k`kill 12345`} tue le PID 12345 ; ${k`kill -9 12345`} de force ; ${k`kill %1`} tue la tâche 1.</li><li>${k`Ctrl-D`} envoie une fin de fichier (EOF).</li></ul>`,
 use:`<p>Pour arrêter un programme lancé avec ${k`&`} : ${k`ps`} pour lire son PID, puis ${k`kill PID`}.</p>`,
 trap:`${k`Ctrl-D`} ne tue rien : il signale « fin de fichier ». Dans un terminal vide, il ferme bash.`,
 q:"Donne un exemple où un processus passe de l'état actif à l'état bloqué.",a:"Le processus attend une saisie au clavier (read, input) : il lui manque une ressource autre que le processeur.",rel:["usi-fork","usi-redir"]});

add(3,{id:"usi-fork",type:"meth",ref:"Cours Meynard « Génération » et « Recouvrement de processus » ; TD ex. 30",t:"Comment bash lance une commande : fork, exec, wait",short:"fork, exec, wait",
 plain:`Pour lancer ${k`ls`}, bash ${hl("se clone")} (fork), le clone ${hl("se remplace")} par le code de ls (exec), et bash ${hl("attend")} la fin du clone (wait). Avec ${k`&`}, bash n'attend pas.`,
 formal:`<ol><li>fork() : copie complète du processus. Dans le parent, fork renvoie le PID de l'enfant ; dans l'enfant, il renvoie 0.</li><li>exec() (recouvrement) : l'enfant écrase son segment de code par celui de ${k`/bin/ls`}, génère un nouveau segment de données statiques, vide sa pile et son tas. Il a hérité du terminal de son parent : c'est là qu'il affiche.</li><li>wait() : le parent dort jusqu'à la fin (exit) de l'enfant, puis lit son code de retour, que bash range dans ${k`$?`}.</li></ol><p>Les commandes ${hl("internes")} (${k`cd`}, ${k`echo`}, ${k`export`}, ${k`exit`}) s'exécutent dans bash, sans nouveau processus.</p><p>${k`cmd1 | cmd2`} : bash crée deux enfants qui tournent en même temps.</p>`,
 use:`<p>Compte les processus créés en comptant les commandes ${hl("externes")} de la ligne.</p>`,
 trap:`${k`echo Hello`} ne crée aucun processus : echo est interne à bash.`,
 q:"Combien de nouveaux processus pour ls | grep txt | wc -l ?",a:"3, un par commande externe ; ils tournent en même temps.",rel:["usi-processus","usi-types"]});

add(3,{id:"usi-redir",type:"meth",ref:"Cours Meynard « Utiliser les processus en Bash » ; TD ex. 36, 39 ; poly Pompidor §3.3.3",t:"Redirections, enchaînements et code de retour",short:"> >> < 2> ; && ||",
 plain:`Chaque processus a 3 flux : l'${hl("entrée standard")} (0, le clavier), la ${hl("sortie standard")} (1, l'écran) et la ${hl("sortie d'erreur")} (2, l'écran aussi). On peut les envoyer vers des fichiers.`,
 formal:`${tb(["Écriture","Effet"],[[k`cmd > f`,"la sortie va dans f (f est vidé avant)"],[k`cmd >> f`,"la sortie s'ajoute à la fin de f"],[k`cmd < f`,"cmd lit f au lieu du clavier"],[k`cmd 2> f`,"les messages d'erreur vont dans f"],[k`cmd1 | cmd2`,"la sortie de cmd1 devient l'entrée de cmd2"],[k`cmd1 ; cmd2`,"l'une après l'autre"],[k`cmd1 && cmd2`,"cmd2 seulement si cmd1 a réussi"],[k`cmd1 || cmd2`,"cmd2 seulement si cmd1 a échoué"]])}<p>Code de retour : ${hl("0 = réussite")}, 1 à 255 = erreur. Il est dans ${k`$?`}.</p>`,
 use:`<p>${k`ls /bin /toto > liste`} : la liste de /bin va dans le fichier, mais l'erreur sur /toto reste à l'écran, car c'est la sortie 2.</p>`,
 trap:`${k`cat f > f`} vide f : bash ouvre f en écriture (donc le vide) avant de lancer cat.`,
 q:"Quelle ligne de commande affiche « échec ! » seulement si la commande cat toto échoue ?",a:"cat toto || echo \"échec !\"",rel:["usi-filtres","usi-processus"]});

add(3,{id:"usi-filtres",type:"def",ref:"Cours Meynard « Le mécanisme de tube et les filtres » ; TD § 3.6 et ex. 40",t:"Tubes et filtres : grep, wc, cut, sort, head, tail, sed",short:"Filtres",
 plain:`Un ${hl("filtre")} lit son entrée standard, la transforme et écrit sur sa sortie. Avec le tube ${k`|`}, on les branche les uns derrière les autres.`,
 formal:`${tb(["Filtre","Rôle"],[[k`cat f`,"affiche f (sans fichier : recopie l'entrée)"],[k`grep motif`,"garde les lignes qui contiennent le motif ; -v l'inverse, -c compte, -i ignore les majuscules, -E regex étendue"],[k`wc`,"compte lignes, mots, octets ; "+k`wc -l`+" les lignes"],[k`head -n 5`+", "+k`tail -n 5`,"les 5 premières, les 5 dernières lignes"],[k`sort`,"trie ; -r à l'envers, -n en nombres, -t: -k2 selon le 2e champ"],[k`cut -d, -f1,3`,"garde les champs 1 et 3 (séparateur ,)"],[k`sed "s/il/elle/"`,"remplace (ajoute g pour toutes les fois)"],[k`tr ':' ' '`,"remplace un caractère par un autre"],[k`tee f`,"recopie dans f et laisse passer"],[k`more`+", "+k`less`,"affiche page par page"],[k`pr -3`,"met en page, ici sur 3 colonnes"],[k`nl`,"numérote les lignes"],[k`file f`,"dit le type du contenu de f (ce n'est pas un filtre)"]])}<p>Un tube est un espace mémoire géré comme une file d'attente (FIFO) : un processus écrit des octets à la queue, l'autre les lit en tête, dans le même ordre.</p>${SH`# compter les fichiers .txt du dossier courant
ls | grep "\.txt$" | wc -l
# les noms de comptes, triés
cut -d: -f1 /etc/passwd | sort
# exemple du cours : 2 lignes, 4 mots, 40 octets
tail -4 pair.c | grep return | wc`}`,
 use:`<p>Lis un tube de gauche à droite en disant à voix haute ce qui sort de chaque morceau.</p>`,
 trap:`Les commandes d'un tube tournent ${hl("en même temps")} : celle de droite attend quand le tube est vide.`,
 q:"Quelle commande compte les lignes du fichier log.txt qui contiennent le mot erreur ?",a:"grep erreur log.txt | wc -l (ou grep -c erreur log.txt)",rel:["usi-regex","usi-redir"]});

/* ---------- 4. recherches et regex ---------- */
add(4,{id:"usi-find",type:"meth",ref:"Poly Pompidor §4.3.1 ; TD ex. 12, 14 ; examens 2022 à 2025 (Q1)",t:"Chercher des fichiers avec find",short:"find",cc:"Q1 de presque chaque examen (1 à 1,5 point)",
 plain:`${k`find`} ${hl("parcourt tout l'arbre")} à partir d'un dossier et affiche les fichiers qui correspondent. Le motif du nom se met ${hl("entre guillemets")}.`,
 formal:`${SH`# depuis le dossier d'accueil : les .py (2023)
find ~ -name "*.py"
# depuis le dossier courant : ceux qui commencent par 2023 (2024)
find . -name "2023*"
# depuis le dossier parent : ceux qui contiennent DATA (2025)
find .. -name "*DATA*"
# seulement les fichiers réguliers (d : répertoires)
find . -type f
# supprimer ceux qui finissent par # (juin 2025)
find ~ -name "*#" -exec rm {} \;`}
 <p>Avec ${k`-exec`}, ${k`{}`} est remplacé par chaque fichier trouvé et ${k`\;`} termine la commande.</p><p>Solution acceptée mais moins bonne : ${k`ls -R | grep "^2023"`}.</p>`,
 use:`<p>Repère dans l'énoncé : à partir d'où (${k`~`}, ${k`.`}, ${k`..`}), quel nom (${k`-name`}), quel type (${k`-type`}), et l'action éventuelle (${k`-exec … {} \;`}).</p>`,
 trap:`Le motif de ${k`-name`} est un motif de bash (${k`*`} et ${k`?`}), pas une expression régulière : ${k`"*.py"`}, pas ${k`".*\.py"`}.`,
 q:"Quelle commande cherche, à partir du dossier parent, les fichiers dont le nom contient DATA ?",a:"find .. -name \"*DATA*\" (examen 2025)",rel:["usi-regex","usi-filtres"]});

add(4,{id:"usi-regex",type:"meth",ref:"Poly Pompidor §3.2 ; examens 2022 à 2026 (Q2)",t:"Expressions régulières",short:"Regex",cc:"une question à chaque examen",
 plain:`Une expression régulière décrit ${hl("la forme")} d'une chaîne. ${k`^`} colle au ${hl("début")}, ${k`$`} à la ${hl("fin")}. Sans eux, le motif peut être n'importe où dans la ligne.`,
 formal:`${tb(["Symbole","Sens"],[[k`.`,"un caractère quelconque"],[k`\.`,"un vrai point"],[k`[0-9]`+" ou "+k`\d`,"un chiffre"],[k`[a-z]`+", "+k`[A-Z]`,"une lettre minuscule, majuscule"],[k`[^.]`,"n'importe quel caractère sauf un point"],[k`*`,"le précédent, 0 fois ou plus"],[k`+`,"le précédent, 1 fois ou plus"],[k`?`,"le précédent, 0 ou 1 fois"],[k`{2}`+", "+k`{1,3}`,"exactement 2 fois, de 1 à 3 fois"],[k`(jpg|jpeg)`,"l'un ou l'autre"],[k`^`+" / "+k`$`,"début / fin de la chaîne"]])}<p>Les modèles des annales :</p>${TX`^[0-9]+$                  que des chiffres (2022)
^[0-9].*[0-9]$            commence et finit par un chiffre (2023)
^[^.]*\.[^.]*\.[^.]*$     exactement deux points (2024)
^[0-9]+\.[0-9]+$          deux entiers séparés par un point (2025)
[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+   une adresse IP (juin 2025)
\.jpe?g$                  finit par .jpg ou .jpeg (2026)`}<p>Avec grep, ${k`+`}, ${k`?`}, ${k`|`} et les parenthèses demandent ${k`grep -E`} (ou ${k`egrep`}). En Python : ${k`re.search(motif, chaine)`}.</p><p>${k`\d`} est accepté dans les corrigés quand on demande seulement l'expression. Mais dans une commande grep, écris ${k`[0-9]`} : ${k`grep -E`} ne connaît pas ${k`\d`} (essayé : il cherche la lettre d).</p>`,
 use:`<p>Écris une chaîne exemple et découpe-la en morceaux : chaque morceau devient un bout de regex. Ajoute ${k`^`} et ${k`$`} si toute la chaîne doit avoir cette forme.</p>`,
 trap:`${k`^.*\..*\..*$`} accepte 3 points ou plus. Pour « exactement deux », interdis le point ailleurs avec ${k`[^.]*`}.`,
 q:"Expression régulière d'une chaîne qui ne contient que des chiffres ?",a:"^[0-9]+$ (ou ^\\d+$)",rel:["usi-find","usi-filtres"]});

/* ---------- 5. Bash ---------- */
add(5,{id:"usi-bash-var",type:"def",ref:"Cours Meynard « Bash et les variables », « Script Bash » ; poly Pompidor §9.2 ; examens 2022 et 2023",t:"Bash : variables, paramètres, calculs, scripts",short:"Variables et paramètres",
 plain:`${k`i=1`} crée une variable (${hl("sans espace")} autour du =) et ${k`$i`} lit sa valeur. Dans un script, ${k`$1`} est le premier paramètre, ${k`$#`} leur nombre et ${k`$@`} leur liste.`,
 formal:`${tb(["Écriture","Sens"],[[k`nom=test`,"affecter (jamais d'espace autour de =)"],[k`echo $nom`,"lire la valeur"],[k`"bonjour $nom"`,"entre guillemets, les variables sont remplacées"],[k`'bonjour $nom'`,"entre apostrophes, rien n'est remplacé"],[k`export EDITOR=codium`,"variable d'environnement, transmise aux processus enfants"],[k`liste=$(ls)`,"le résultat d'une commande (ancienne forme : entre accents graves)"],[k`i=$((i+1))`+" ou "+k`let i=i+1`,"calcul entier"],[k`read nom`,"lit une ligne au clavier"],[k`$0`+", "+k`$1`+", "+k`$2`,"le nom du script, le 1er paramètre, le 2e…"],[k`$#`+", "+k`$@`+" (ou "+k`$*`+")","le nombre de paramètres, tous les paramètres"],[k`$?`,"le code de retour de la dernière commande"]])}<p>Un script est un fichier texte qui commence par ${k`#!/bin/bash`}. On le rend exécutable avec ${k`chmod u+x script.sh`}, puis on le lance avec ${k`./script.sh a b`} (ou ${k`bash script.sh a b`}).</p>`,
 use:`<p>Bash et Python sont ${hl("interprétés")} (lus par un interpréteur) et ${hl("typés dynamiquement")} : on ne déclare pas le type des variables (examen 2022).</p>`,
 trap:`${k`i = 1`} avec des espaces lance une commande nommée « i » : erreur. Il faut ${k`i=1`}.`,
 q:"En Bash, comment créer une variable nom qui vaut test, puis afficher sa valeur ?",a:"nom=test puis echo $nom",rel:["usi-bash-ctrl","usi-bash-scripts"]});

add(5,{id:"usi-bash-ctrl",type:"meth",ref:"Poly Pompidor §9.3 à 9.6 ; cours Meynard « Commandes complexes », « Fonctions Bash »",t:"Bash : if, for, while et fonctions",short:"if, for, while",
 plain:`Chaque bloc a ${hl("un mot de début et un mot de fin")} : ${k`then … fi`}, ${k`do … done`}. Les tests s'écrivent entre ${k`[[ ]]`}, ${hl("avec des espaces")} à l'intérieur.`,
 formal:`${SH`if [[ -f "$1" ]]
then
    echo "$1 est un fichier régulier"
elif [[ -d "$1" ]]
then
    echo "$1 est un répertoire"
else
    echo "$1 n'existe pas"
fi

# chaque fichier .txt du dossier courant
for f in *.txt
do
    echo "$f"
done

# chaque ligne d'un fichier
while read ligne
do
    echo "$ligne"
done < fichier.txt

# une fonction : paramètres $1, $2… ;
# son résultat est ce qu'elle affiche
concat() {
    echo "$1$2"
}
concat a b`}<p>Le cours écrit aussi ${k`function concat { … }`}, et ${k`test -f monfic`} ou ${k`[ -f monfic ]`} pour les tests ; il conseille le double crochet ${k`[[ -f monfic ]]`}.</p>${tb(["Test","Vrai si…"],[[k`-f f`+", "+k`-d d`+", "+k`-e x`,"fichier régulier, répertoire, existe"],[k`$a == $b`+", "+k`$a != $b`,"chaînes égales, différentes"],[k`$f == *.txt`,"f finit par .txt (motif)"],[k`$n -eq 3`+", "+k`-ne`+", "+k`-lt`+", "+k`-le`+", "+k`-gt`+", "+k`-ge`,"comparaisons de nombres (=, ≠, <, ≤, >, ≥)"],[k`-z $v`,"v est vide"]])}`,
 use:`<p>Pour parcourir les fichiers d'un dossier sans ${k`ls`} : ${k`for f in *`}, ou ${k`for f in $1/*`} pour le dossier passé en paramètre.</p>`,
 trap:`${k`[[-f $1]]`} sans espaces est une erreur de syntaxe : il faut ${k`[[ -f $1 ]]`}.`,
 q:"En Bash, quels mots ouvrent et ferment le bloc d'un if ? Et celui d'une boucle for ou while ?",a:"then … fi pour un if ; do … done pour for et while.",rel:["usi-bash-var","usi-bash-scripts"]});

add(5,{id:"usi-bash-scripts",type:"code",ref:"Examens 2022 à 2026 (question Bash) ; TD ex. 44 à 46",t:"Les scripts Bash des examens",short:"Scripts d'examen",cc:"2 à 2,5 points chaque année",
 plain:`Presque tous les scripts demandés ont la même forme : ${hl("une boucle for sur des fichiers")}, un ${hl("if")} éventuel, et ${hl("une commande")} (echo, mv, rm) sur chaque fichier.`,
 formal:`${SH`# 2026 : préfixer par "old" les .txt du dossier courant
for fichier in *.txt
do
    mv "$fichier" "old$fichier"
done

# 2025 : supprimer les .txt du dossier passé en paramètre
rm $1/*.txt
# ou avec une boucle, sans autre commande que ls :
for f in $(ls $1)
do
    if [[ $f == *.txt ]]
    then
        rm $1/$f
    fi
done

# 2023 : fichiers qui commencent par $1 et finissent par $2
for fichier in $1*$2
do
    echo $fichier
done

# 2024 : afficher les lignes d'un CSV et sommer le 1er champ
somme=0
for ligne in $(cat $1)
do
    echo $ligne
    nombre=$(echo $ligne | cut -d, -f1)
    somme=$((somme+nombre))
done
echo $somme`}`,
 use:`<p>Mets ${k`"$f"`} entre guillemets si un nom peut contenir des espaces.</p>`,
 trap:`${k`for ligne in $(cat f)`} coupe aussi aux espaces. Pour lire vraiment ligne par ligne : ${k`while read ligne … done < f`}.`,
 q:"Écris une boucle Bash qui renomme chaque fichier .txt du dossier courant en ajoutant old devant son nom.",a:"for f in *.txt; do mv \"$f\" \"old$f\"; done",rel:["usi-bash-ctrl","usi-find"]});

/* ---------- 6. Python ---------- */
add(6,{id:"usi-py-bases",type:"def",ref:"Poly Pompidor ch. 1 et 2 ; examens de janvier 2023 (Q8) et janvier 2024 (Q5)",t:"Python : chaînes, listes, boucles, fonctions",short:"Bases de Python",
 plain:`En Python, ${hl("l'indentation fait les blocs")}, après un ${k`:`}. Une liste se lit par indice à partir de ${hl("0")}, et ${k`liste[-1]`} est le dernier élément.`,
 formal:`${PY`age = int("19")         # int(), str(), float() convertissent
nom = input("Prénom ? ")  # une saisie est toujours une chaîne
print("Bonjour", nom)     # print met un espace entre ses paramètres

liste = [3, 1, 4]
liste.append(1)           # [3, 1, 4, 1]
liste[0], liste[-1]       # 3 et 1
liste[1:3]                # [1, 4] : de l'indice 1 inclus à 3 exclu
len(liste), 4 in liste    # 4 et True
copie = liste[:]          # une vraie copie

mot = "radar"
mot[::-1]                 # le mot à l'envers
"a,b,c".split(",")        # ['a', 'b', 'c']
"".join(["a", "b"])       # "ab"
" texte\n".strip()        # "texte"

for i in range(len(liste)):   # i = 0, 1, 2, 3
    print(i, liste[i])
i = 10
while i > 0:
    i -= 1                # pas de i++ en Python

def somme(a, b):
    return a + b`}`,
 use:`<p>Les fonctions d'examen se font presque toujours avec ${hl("une liste résultat vide")}, remplie dans une boucle, puis renvoyée par ${k`return`}.</p>`,
 trap:`Une chaîne ne se modifie pas : ${k`mot[0] = "M"`} plante. Passe par ${k`list(mot)`}, puis ${k`"".join(...)`}.`,
 q:"Écris en Python une fonction palindrome(c) qui dit si la chaîne c se lit pareil dans les deux sens, sans utiliser reverse().",a:"def palindrome(c): return c == c[::-1] (ou une boucle qui compare c[i] et c[len(c)-1-i])",rel:["usi-py-dico","usi-py-classiques"]});

add(6,{id:"usi-py-classiques",type:"code",ref:"Examens de janvier 2022 (dernière question), janvier 2023 (Q6 à Q8), janvier 2024 (Q5 et Q7)",t:"Python : les petites fonctions des examens",short:"Fonctions d'examen",cc:"2,5 points en 2023",
 plain:`Les petites questions Python reviennent : ${hl("lister un dossier")}, ${hl("numéroter")}, ${hl("intersection")} de deux listes, ${hl("palindrome")}, ${hl("enlever les répétitions")}.`,
 formal:`${PY`import os
for fichier in os.listdir():      # le dossier courant
    print(fichier)

num = 1                           # la même chose, numérotée
for fichier in os.listdir():
    print(num, fichier)
    num += 1

def intersection(liste1, liste2):
    encommun = []
    for v in liste1:
        if v in liste2 and v not in encommun:
            encommun.append(v)
    return encommun

def palindrome(chaine):
    for pos in range(len(chaine)):
        if chaine[pos] != chaine[len(chaine)-pos-1]:
            return False
    return True

# [2, 23, 23, 7, 7, 4] donne [2, 23, 7, 4]
nliste = []
mem = -1
for n in liste:
    if n != mem:
        nliste.append(n)
        mem = n`}`,
 use:`<p>Le barème de 2023 donne des points pour chaque morceau : la fonction et son return, la liste vide, la boucle, le test ${k`in`}, le ${k`not in`}.</p>`,
 trap:`${k`if n != nliste[-1]`} plante au premier tour, car la liste est vide : d'où la variable ${k`mem`}.`,
 q:"Quelle instruction Python affiche la liste des fichiers du dossier dont le nom est dans la variable répertoire ?",a:"print(os.listdir(répertoire))",rel:["usi-py-bases"]});

add(6,{id:"usi-py-dico",type:"meth",ref:"Poly Pompidor §2.1 ; examens 2024 (Q6), 2025 (Q4), 2026 (Q3)",t:"Python : dictionnaires pour compter et regrouper",short:"Dictionnaires",cc:"dans la grosse question Python de 2024, 2025 et 2026",
 plain:`Un dictionnaire range des ${hl("valeurs sous des clés")} : ${k`d["jpg"] = 10`}. Pour compter, on teste si la clé existe ${hl("avant")} d'ajouter.`,
 formal:`${PY`d = {}                    # dictionnaire vide
d["jpg"] = 10             # crée ou remplace

if cle in d:              # compter
    d[cle] += 1
else:
    d[cle] = 1

if cle in d:              # regrouper dans des listes (2025)
    d[cle].append(valeur)
else:
    d[cle] = [valeur]

for cle in d:             # parcourir
    print(cle, d[cle])
for (cle, valeur) in d.items():
    print(cle, ":", valeur)`}`,
 use:`<p>Ligne ${k`DELL Precision=25,Lenovo M900=15`} (2024) : découpe d'abord à la virgule, puis chaque morceau au signe =, et ajoute ${k`int(...)`} au total de ce modèle.</p>`,
 trap:`${k`d[cle] += 1`} sur une clé absente plante (KeyError) : il faut le ${k`if cle in d`}.`,
 q:"Le dictionnaire systèmes associe à chaque système d'exploitation la liste de ses ordinateurs. Quelles instructions Python ajoutent l'ordinateur ordi à la liste du système s, que s soit déjà une clé ou non ?",a:"if s in systèmes: systèmes[s].append(ordi) ; sinon : systèmes[s] = [ordi]",rel:["usi-py-fichiers","usi-py-parcours"]});

add(6,{id:"usi-py-fichiers",type:"meth",ref:"Poly Pompidor §3.1 à 3.3 ; TP quiz des capitales ; examens 2024 à 2026",t:"Python : lire un CSV, écrire un fichier, paramètres",short:"Fichiers et CSV",
 plain:`On ouvre avec ${k`open(nom, "r")`}, on lit ${hl("ligne par ligne")} avec un for, on enlève le retour à la ligne avec ${k`strip()`} et on découpe avec ${k`split(",")`}.`,
 formal:`${PY`import sys
if len(sys.argv) < 2:          # sys.argv[0] : le nom du script
    print("Donne un fichier en paramètre")
    sys.exit()

with open(sys.argv[1], "r") as fd:
    for ligne in fd:           # ou : lignes = fd.readlines()
        champs = ligne.strip().split(",")
        pays = champs[0]
        nombre = int(champs[1])   # on lit toujours des chaînes

fd = open("sortie.txt", "w")   # "w" écrase, "a" ajoute à la fin
fd.write("une ligne\n")        # write n'ajoute pas de retour
fd.close()

try:                           # gérer une erreur
    fd = open("absent.txt")
except OSError as err:
    print("Erreur :", err)`}`,
 use:`<p>Si le fichier a deux lignes à lire différemment (2026 : les extensions, puis les nombres), prends ${k`lignes = fd.readlines()`} et utilise ${k`lignes[0]`} et ${k`lignes[1]`}.</p>`,
 trap:`Sans ${k`strip()`}, le dernier champ garde le retour à la ligne : ${k`"webp\n" == "webp"`} est faux.`,
 q:"Le fichier images.csv a deux lignes : les extensions sur la première, le nombre d'images de chaque extension sur la deuxième, séparés par des virgules. Quelles instructions Python le lisent dans un dictionnaire statistiques (extension → nombre) ?",a:"lignes = fd.readlines() ; ext = lignes[0].strip().split(',') ; nb = lignes[1].strip().split(',') ; for i in range(len(ext)): statistiques[ext[i]] = int(nb[i])",rel:["usi-py-dico","usi-py-parcours"]});

add(6,{id:"usi-py-parcours",type:"code",ref:"Poly Pompidor §4.2 ; TP exploration récursive ; examens 2025 (Q4), juin 2025 (Q4), 2026 (Q3)",t:"Python : parcourir un dossier récursivement",short:"Parcours récursif",cc:"5,5 points en 2025, 6 points en 2026",
 plain:`La fonction ${hl("s'appelle elle-même")} sur chaque sous-dossier. Le piège : tester ${hl("le chemin complet")} (dossier + séparateur + nom), pas le nom seul.`,
 formal:`${PY`import os, sys

def parcours(dossier):
    for nom in os.listdir(dossier):
        chemin = dossier + os.sep + nom   # os.sep vaut "/"
        if os.path.isdir(chemin):
            parcours(chemin)              # appel récursif
        else:
            traiter(chemin)               # compter, lire, écrire…

parcours(sys.argv[1])                     # appel initial`}<p>L'extension d'un nom : ${k`morceaux = nom.split(".")`}, puis si ${k`len(morceaux) > 1`}, c'est ${k`morceaux[-1]`}. Pour reconnaître un .csv, le corrigé de 2025 écrit ${k`".csv" in fichier`} ; ${k`nom.endswith(".csv")`} est plus précis, mais n'est pas dans le poly.</p><p>Les sujets interdisent souvent ${k`os.walk()`} et ${k`os.popen()`} : il faut écrire la récursion soi-même.</p>`,
 use:`<p>Écris d'abord le squelette (import, def, for, if isdir, appel récursif, appel initial), puis le traitement. Le squelette seul rapporte déjà une bonne partie des points.</p>`,
 trap:`${k`os.path.isdir(nom)`} ne marche que si le script tourne dans ce dossier. Même le corrigé officiel de 2025 fait cette erreur. Teste ${k`os.path.isdir(dossier + os.sep + nom)`}.`,
 q:"En Python, quelles fonctions du module os servent à parcourir un dossier et ses sous-dossiers ?",a:"os.listdir(dossier), os.path.isdir(chemin), os.path.isfile(chemin), et os.sep pour coller les chemins.",rel:["usi-py-dico","usi-py-fichiers"]});

/* ---------- 7. le C sous Unix ---------- */
add(7,{id:"usi-c-compil",type:"def",ref:"Cours Meynard « Compilation C » ; TD ex. 47 à 52, 58",t:"Compiler un programme C : gcc, en-têtes, argc et argv",short:"Compilation C",
 plain:`Bash et Python sont ${hl("interprétés")} : un programme lit et exécute le source à chaque lancement. Le C est ${hl("compilé")} : gcc le traduit une fois pour toutes en un ${hl("exécutable")}.`,
 formal:`<ol><li>Prétraitement des directives ${k`#include`}, ${k`#define`}, ${k`#ifdef`} (${k`gcc -E`}).</li><li>Analyse lexicale et syntaxique (« parse error » ou « syntax error »), puis analyse sémantique (correspondance de type, déclaration préalable des objets).</li><li>Compilation proprement dite du source C en langage d'assemblage (${k`gcc -S`}).</li><li>Assemblage en fichier objet ${k`.o`} (${k`gcc -c`}).</li><li>Édition des liens des objets entre eux et avec les bibliothèques, pour réaliser le fichier binaire exécutable.</li></ol>${tb(["Option de gcc","Rôle"],[[k`-c`,"compiler et assembler seulement"],[k`-o xxx`,"nom du fichier de sortie"],[k`-Wall`,"voir tous les avertissements"],[k`-E`,"que le prétraitement"],[k`-S`,"compiler sans assembler"],[k`-lm`,"utiliser la bibliothèque mathématique"],[k`-g`,"informations de débogage pour gdb"],[k`-std=c99`,"permet les définitions de variables dans les for, et les //"]])}${SH`gcc -o fact -Wall fact.c
./fact 12
gcc -o main liste.c main.c -Wall`}${CC`#include <stdio.h>   /* en-tête standard (/usr/include) */
#include "liste.h"  /* en-tête perso (dossier courant) */

int main(int argc, char *argv[]) {
    /* argc compte aussi le nom du programme */
    for (int i = 0; i < argc; i++)
        printf("%s\n", argv[i]);
    return 0;   /* code de retour, visible dans $? */
}`}<ul><li>Un fichier d'en-tête ${k`.h`} contient des ${hl("déclarations")} (prototypes) : du texte, inclus par le préprocesseur. Une bibliothèque contient du ${hl("code compilé")}, ajouté à l'édition de liens (la libc).</li><li>${k`atoi(argv[1])`} convertit un paramètre en entier.</li></ul>`,
 use:`<p>« Interpréteur ou compilateur ? » : bash, python3 sont des interpréteurs ; gcc, g++ des compilateurs ; javac compile en bytecode, que java interprète.</p>`,
 trap:`${k`./argv un 2`} donne argc = 3, pas 2 : argv[0] est le nom du programme.`,
 q:"Quelles sont les étapes par lesquelles gcc transforme un fichier .c en exécutable ?",a:"Prétraitement (#include, #define), analyses et compilation en langage d'assemblage, assemblage en fichier objet .o, édition des liens en exécutable.",rel:["usi-c-memoire","usi-types"]});

add(7,{id:"usi-c-memoire",type:"meth",ref:"Cours Meynard « Passage des paramètres », « Les variables C », « Les types C »",t:"C : passage par valeur, pile, tas, portée",short:"Mémoire en C",
 plain:`En C, une fonction reçoit ${hl("une copie")} de ses paramètres. Elle ne peut donc pas changer une variable de l'appelant, sauf ${hl("à travers un pointeur")} ou un tableau.`,
 formal:`<p>Exemple passageparam.c du cours, appelé avec n = 5, ch qui pointe sur "bonjour" et compl = {1.1, 2.2} :</p>${CC`void modifieur(int i, char* s, float t[2]){
  i=i+1;             /* la copie change : n reste 5        */
  s[0]='M'; s=NULL;  /* la zone pointée change : "Monjour" ;
                        puis la copie du pointeur : sans effet */
  t[0]=0.0; t++;     /* la case du tableau change : 0.0 ;
                        puis la copie du pointeur : sans effet */
  return;
}`}<ul><li>Pile : les variables locales, le temps de la fonction. Tas : les objets de ${k`malloc`}, jusqu'au ${k`free`}. Segment statique : les variables globales, toute la vie du processus.</li><li>Portée : on prend la définition ${hl("la plus proche")} en remontant les blocs.</li><li>Tailles (elles dépendent parfois de la machine) : char 1 octet, short 2, int souvent 4, long 8, float 4, double 8. Une chaîne finit par ${k`'\0'`}.</li><li>${k`struct`} : une séquence d'objets de types différents ; ${k`union`} : un champ parmi plusieurs ; ${k`typedef`} définit un nouveau nom de type.</li><li>Un tableau ne connaît pas sa taille : on la garde à part, comme argc pour argv.</li></ul>`,
 use:`<p>Pour savoir si l'appelant voit un changement : la fonction a-t-elle écrit ${hl("dans la zone pointée")} (${k`s[0]`}, ${k`*p`}) ou seulement dans sa copie ?</p>`,
 trap:`${k`p++`} sur un ${k`int *`} avance de sizeof(int) = 4 octets, pas de 1.`,
 q:"En C, une fonction reçoit un int n, une chaîne ch et un tableau t. Elle fait n = n + 1, ch[0] = 'M' et t[0] = 0. Après l'appel, qu'est-ce qui a changé pour l'appelant ?",a:"n n'a pas changé : la fonction a travaillé sur une copie. La chaîne et le tableau ont changé (premier caractère 'M', première case 0) : ce qui est copié est leur adresse, donc la fonction écrit dans la mémoire de l'appelant.",rel:["usi-c-compil"]});

/* ---------- exercices : TD/TP de Meynard, TP et poly de Pompidor, entraînements ---------- */
const M="TD de Meynard",P="TP de Pompidor",X="entraînement écrit par moi, au format de l'examen",CM="cours de Meynard";
const OFFM="Corrigé de Michel Meynard (fichier déposé sur Moodle)";
const td=[
 /* 1. arborescence */
 {id:"1",s:1,note:M,t:"Le langage d'Unix",en:`<p>En quel langage est écrit le système d'exploitation Unix ?</p>`,link:"usi-se",sol:`<p>En ${hl("C")}. Le cours le dit ainsi : « Unix développé en C donc interface naturelle avec le SE ». C'est pour cela que les appels du noyau (fork, open…) sont des fonctions C.</p>`},
 {id:"2",s:1,note:M,t:"Les types de fichiers Unix",en:`<p>Quels sont les types de fichiers Unix que vous connaissez ?</p>`,link:"usi-types",sol:`<p>Fichier régulier (${k`-`}), répertoire (${k`d`}), lien symbolique (${k`l`}), périphérique caractère (${k`c`}) ou bloc (${k`b`}), tube nommé (${k`p`}), socket (${k`s`}). C'est le premier caractère de ${k`ls -l`}. Parmi les fichiers réguliers, le cours distingue les fichiers textes (lisibles par un humain : C, Python, HTML…) et les fichiers binaires (mp3, jpg, zip, /bin/ls).</p>`},
 {id:"3",s:2,note:M,t:"Un chemin, syntaxiquement",en:`<p>Qu'est ce qu'un chemin (path) au niveau syntaxique ?</p>`,link:"usi-chemins",sol:`<p>Définition du cours : « un path (chemin) représente une succession de répertoires séparés par des slash vous permettant de naviguer dans l'arborescence ». Le dernier nom peut être un fichier.</p><ul><li>S'il débute par ${k`/`}, il est ${hl("absolu")} : ${k`/usr/bin/`}.</li><li>Sinon il est ${hl("relatif")} au répertoire courant : ${k`../../MonProjet/src`} remonte 2 fois sur le parent, puis descend dans MonProjet, puis dans src.</li><li>${k`.`} désigne le répertoire courant et ${k`..`} son parent.</li></ul>`},
 {id:"4",s:1,note:M,t:"Le répertoire /bin",en:`<p>Soit le rendu de la commande suivante :</p>${TX`~$ ls /bin
...
ls
lscpu
lualatex
lxterm
lynx
make
man
...`}<ol><li>Que représente ce répertoire ?</li><li>Citez 2 interpréteurs de commandes</li><li>Quelles commandes permettent de manipuler des répertoires ?</li></ol>`,link:"usi-chemins",sol:`<ol><li>Il contient les commandes externes essentielles du système : ce sont des fichiers binaires exécutables.</li><li>${k`bash`} et ${k`sh`} (aussi zsh, csh, ksh, tcsh).</li><li>${k`mkdir`}, ${k`rmdir`}, ${k`cd`}, ${k`pwd`}, ${k`ls`}, ${k`mv`}, ${k`cp -r`}, ${k`rm -r`}.</li></ol>`},
 {id:"5",s:2,note:M,t:"Exécutables, localisation, PATH",en:`<p>Dans l'exercice précédent, un certain nombre de commandes externes essentielles ont été localisées dans /bin.</p><ol><li>Quelle commande permet de connaître le répertoire où est située une commande ?</li><li>Connaissez-vous un autre répertoire contenant des commandes aussi importantes que mkdir ?</li><li>Quel est le type de fichier contenant une commande ?</li><li>Existe-t-il des commandes non présentes dans l'arborescence des fichiers ?</li><li>Que pensez-vous de l'affichage suivant :${TX`~$ which codium
/usr/bin/codium
~$ ls -l /usr/bin | grep codi
lrwxrwxrwx 1 root root 28 mars 21 11:03 codium -> /usr/share/codium/bin/codium`}Quel est le type de ce fichier /usr/bin/codium ?</li><li>Où se situe la liste des répertoires d'exécution ? Cette liste contient les répertoires dans lesquels bash cherche itérativement un fichier exécutable correspondant au premier mot de la ligne de commande.</li></ol>`,link:"usi-types",sol:`<ol><li>${k`which`} (par exemple ${k`which ls`}).</li><li>${k`/usr/bin`} (et ${k`/usr/local/bin`} ; ${k`/sbin`} pour les commandes réservées à l'administrateur).</li><li>Un fichier régulier exécutable (un binaire compilé, ou un script).</li><li>Oui : les commandes internes de bash (${k`cd`}, ${k`echo`}, ${k`export`}, ${k`exit`}…). Elles sont dans bash lui-même, il n'y a pas de fichier.</li><li>Un lien symbolique : le ${k`l`} au début des droits et la flèche. Il vise ${k`/usr/share/codium/bin/codium`} ; sa taille, 28, est la longueur de ce chemin.</li><li>Dans la variable d'environnement ${k`PATH`} (${k`echo $PATH`}) : des répertoires séparés par ${k`:`}.</li></ol>`},
 {id:"7",s:2,note:M,t:"Cinq commandes ls",en:`<p>Exécutez puis décrivez en une phrase courte ce que fait chacune des commandes suivantes :</p><ol><li>ls ..</li><li>ls -a</li><li>ls -l</li><li>ls -R ~</li><li>ls -R / (Tapez Ctrl-c pour arrêter cette tâche)</li></ol>`,link:"usi-chemins",sol:`<ol><li>Liste le contenu du répertoire parent.</li><li>Liste le répertoire courant avec les fichiers cachés (ceux dont le nom commence par un point, dont ${k`.`} et ${k`..`}).</li><li>Liste en format long : type et droits, nombre de liens, propriétaire, groupe, taille, date, nom.</li><li>Liste récursivement tout le dossier d'accueil : chaque sous-répertoire, puis son contenu.</li><li>Liste récursivement tout le disque depuis la racine : très long, avec des « Permission non accordée ». Ctrl-C tue ce processus.</li></ol>`},
 {id:"8",s:2,note:M,t:"cd et pwd",en:`<p>Décrivez en une phrase courte chacune des commandes suivantes :</p>${TX`pwd
cd / ; pwd ; cd ~ ; pwd
cd / ; pwd ; cd $home ; pwd
cd ~toto ; pwd       (toto est un <nom d'utilisateur>)
cd ~/.. ; pwd
cd /usr ; pwd ;cd ; pwd
cd /home ; pwd
cd ~ ; cd ../.. ; pwd
cd ../toto ; pwd`}`,link:"usi-chemins",sol:`<p>Le ${k`;`} enchaîne des commandes sur une ligne. On suppose que l'accueil est ${k`/home/dupont`}.</p><ol><li>Affiche le répertoire de travail.</li><li>Va à la racine et affiche ${k`/`}, puis va dans l'accueil et affiche ${k`/home/dupont`}.</li><li>Affiche ${k`/`}, puis ${k`/home/dupont`}. Piège : la variable s'appelle ${k`HOME`}, en majuscules. ${k`$home`} n'existe pas, elle est remplacée par rien, et ${k`cd`} sans paramètre retourne dans l'accueil (essayé dans bash).</li><li>Va dans le dossier d'accueil de l'utilisateur toto (erreur s'il n'existe pas).</li><li>Va dans le parent de l'accueil : ${k`/home`}.</li><li>Affiche ${k`/usr`}, puis ${k`cd`} seul revient dans l'accueil : ${k`/home/dupont`}.</li><li>Affiche ${k`/home`}.</li><li>Depuis l'accueil, remonte de deux crans : ${k`/`}.</li><li>Remonte d'un cran, puis descend dans toto : le répertoire « voisin » toto (erreur s'il n'existe pas).</li></ol>`},
 {id:"9",s:2,note:M,t:"Créer fable.txt sans éditeur, et lsparent.sh",en:`<p>Depuis votre répertoire d'accueil :</p><ol><li>créez un fichier fable.txt contenant le mot été (<b>sans éditeur de texte</b>)</li><li>quelle est la taille de ce fichier ?</li><li>créez un script bash lsparent.sh qui affiche <code>"Contenu du répertoire parent de &lt;nom du répertoire de travail&gt;"</code>, puis qui liste son contenu <b>SANS changer de répertoire</b> !</li></ol>`,link:"usi-redir",sol:`<p>1. Avec echo et une redirection de la sortie standard (cours, « Créer un fichier texte ») :</p>${SH`echo été > fable.txt`}<p>(Ou ${k`cat > fable.txt`}, on tape été, Entrée, puis Ctrl-D.)</p><p>2. ${k`ls -l fable.txt`} affiche ${hl("6 octets")} : en UTF-8, chaque é prend 2 octets, le t en prend 1, et echo ajoute un retour à la ligne (essayé : 6 ; avec ${k`echo -n`}, qui n'ajoute pas le retour, 5).</p><p>3.</p>${SH`#!/bin/bash
echo "Contenu du répertoire parent de $(pwd)"
ls ..`}<p>${k`$(pwd)`} est remplacé par ce qu'affiche pwd. ${k`ls ..`} liste le parent sans y aller. Puis ${k`chmod u+x lsparent.sh`} et ${k`./lsparent.sh`}.</p>`},
 {id:"10",s:2,note:M,t:"Créer une sous-arborescence",en:`<p>Afin d'organiser votre espace, vous allez créer votre sous-arborescence :</p>${TX`~
  USI
    Script
      lsparent.sh
    Fable
      fable.txt`}<p>Donnez la liste des commandes nécessaires <b>SANS changer de répertoire</b> (d'accueil) et <b>sans recopier les fichiers réguliers</b>. Que pensez-vous des noms de répertoires contenant des espaces ?</p>`,link:"usi-chemins",sol:`${SH`mkdir USI USI/Script USI/Fable
mv lsparent.sh USI/Script
mv fable.txt USI/Fable`}<p>${k`mv`} déplace sans recopier : seule l'entrée du répertoire change. (${k`mkdir -p USI/Script USI/Fable`} crée aussi le parent.)</p><p>Un nom avec des espaces est à éviter : bash coupe la ligne aux espaces, il faut donc mettre le nom entre guillemets (${k`"Mon dossier"`}) à chaque fois.</p>`},
 {id:"11",s:2,note:M,t:"Commandes récursives",en:`<p>Certaines commandes peuvent agir sur une sous-arborescence !</p><ol><li>Effectuez une copie récursive de votre répertoire USI dans un autre répertoire "Backup" que vous aurez précédemment créé !</li><li>Affichez la liste récursive de vos répertoires contenus dans votre répertoire d'accueil !</li><li>Tentez de supprimer le répertoire Backup ! Que se passe-t-il ? Comment résoudre ce problème ?</li></ol>`,link:"usi-chemins",sol:`${SH`mkdir Backup
cp -r USI Backup
ls -R ~
rmdir Backup     # échoue : le répertoire n'est pas vide
rm -r Backup     # supprime Backup et tout son contenu`}`},
 {id:"12",s:3,note:M,t:"La commande find et -exec",en:`<p>La commande find path [expr] permet de rechercher des fichiers en parcourant récursivement l'arborescence à partir du répertoire path et d'effectuer une action sur les fichiers parcourus. Un exemple simple de recherche des fichiers shells dont le nom termine par sh suit :</p>${TX`$ find /bin -name "*sh"
/bin/csh
/bin/bash
/bin/sh
/bin/tcsh
/bin/ksh
/bin/zsh`}<p>L'action réalisé sur les fichiers sélectionnés est par défaut de les afficher mais on peut réaliser d'autres actions grâce à l'expression -exec suivie de l'action à réaliser puis d'un ${k`\;`}</p><ol><li>Recherchez tous les fichiers textes d'un de vos répertoires et listez leurs noms (print)</li><li>Recherchez tous les fichiers textes d'un de vos répertoires et listez leurs noms suivi de leur contenu</li><li>Comme la mise en page manque d'espace, refaites l'exercice précédent en ajoutant une ligne blanche entre chaque fichier et un soulignement du nom de fichier ...</li></ol>`,link:"usi-find",sol:`${SH`find ~/USI -name "*.txt"
find ~/USI -name "*.txt" -exec echo {} \; -exec cat {} \;
find ~/USI -name "*.txt" -exec echo {} \; -exec echo "--------" \; -exec cat {} \; -exec echo \;`}<p>${k`{}`} est remplacé par chaque fichier trouvé ; ${k`\;`} termine chaque action. On peut mettre plusieurs ${k`-exec`} à la suite : le nom, le soulignement, le contenu, puis un ${k`echo`} seul pour la ligne blanche.</p><p>Essai (deux fichiers, avec l'accueil ${k`/home/dupont`}) :</p>${TX`/home/dupont/USI/notes.txt
--------
un deux

/home/dupont/USI/Fable/fable.txt
--------
Maître Renard
`}`},
 {id:"13",s:1,note:M,t:"Fichiers compressés et archives",en:`<p>Différents algorithmes et formats de compression coexistent (zip, gzip, bzip, . . .). Un fichier régulier toto.txt pourra ainsi être compressé en toto.txt.gz par exemple. De plus, l'archivage de répertoires est possible avec la commande tar qui concatène récursivement tous les fichiers du répertoire cible dans un unique fichier régulier d'extension tar. Sous Unix, les archives tgz (tarballs) sont souvent utilisées comme moyens d'échange ou d'empaquetage. Un fichier d'extension tgz est le résultat d'un archivage de dossier (via tar) puis de la compression de cette archive par gzip.</p><ol><li>Etudier le manuel de gzip puis testez la compression de 2 fichiers textes que vous aurez créés au préalable en une seule commande !</li><li>Que deviennent les fichiers originaux ? Recréez-les !</li><li>Quelle est l'option de gzip qui permet de conserver la version originale ?</li><li>Etudiez le manuel de tar notamment la partie Exemples à la fin puis testez l'archivage de 2 fichiers textes sans compression dans archive.tar. Afficher le contenu de l'archive avec cat puis avec tar -tf archive.tar...</li><li>Archivez avec compression ces deux mêmes fichiers et comparez la taille des archives. Quelle remarque peut-on faire sur les tailles ?</li><li>Archivez avec compression un gros répertoire puis recréez le à un autre endroit.</li><li>Comparez les deux versions du répertoire avec la commande diff récursive.</li></ol>`,link:"usi-chemins",sol:`${SH`gzip a.txt b.txt                  # 1. donne a.txt.gz et b.txt.gz
gunzip a.txt.gz b.txt.gz          # 2. les originaux avaient disparu : gunzip les recrée
gzip -k a.txt                     # 3. -k (keep) garde l'original
tar -cf archive.tar a.txt b.txt   # 4. c : créer, f : dans ce fichier
tar -tf archive.tar               #    t : lister le contenu
tar -czf archive.tgz a.txt b.txt  # 5. z : compresser avec gzip
tar -czf rep.tgz USI              # 6. un répertoire entier
tar -xzf rep.tgz -C ailleurs      #    x : extraire, dans le dossier ailleurs
diff -r USI ailleurs/USI          # 7. n'affiche rien : identiques`}<p>4. ${k`cat archive.tar`} montre le contenu des deux fichiers à la suite, précédés d'en-têtes : tar ne compresse pas, il concatène.</p><p>5. Essai avec deux fichiers texte de 960 octets : archive.tar fait 10 240 octets (tar écrit par gros blocs, donc plus que les fichiers), archive.tgz 155 octets. Du texte répétitif se compresse très bien.</p>`},
 {id:"14",s:1,note:M,t:"find, tar et gzip ensemble",en:`<p>On souhaite constituer une archive compressée de certains fichiers situés dans une arborescence (et pas des autres). Pour cela, on utilisera find pour rechercher ces fichiers et pour les ajouter à un fichier tar qu'on compressera ensuite :</p><ol><li>Trouvez tous les fichiers textes de monRep et ajoutez les dans mesTextes.tar !</li><li>Compressez ce fichier grâce à gzip !</li><li>Réalisez les 2 actions en une seule ligne de commande !</li></ol>`,link:"usi-find",sol:`${SH`find monRep -name "*.txt" -exec tar -rf mesTextes.tar {} \;
gzip mesTextes.tar
find monRep -name "*.txt" -exec tar -rf mesTextes.tar {} \; ; gzip mesTextes.tar`}<p>${k`tar -rf`} ajoute un fichier à la fin d'une archive (et la crée au premier ajout). ${k`gzip`} remplace mesTextes.tar par mesTextes.tar.gz. Pour la question 3, le ${k`\;`} termine le -exec et le ${k`;`} suivant enchaîne la deuxième commande (essayé).</p>`},
 /* 2. système de gestion des fichiers */
 {id:"16",s:3,note:M,t:"Droits d'accès et de suppression de fichiers",en:`<ol><li>Sous unix, quels sont les droits nécessaires pour pouvoir supprimer un fichier ?</li><li>Y a-t-il une relation entre le droit de supprimer un fichier et les droits d'accès à ce fichier ?</li><li>Quels sont les droits nécessaires pour modifier le contenu d'un fichier ?</li><li>Est-ce que le propriétaire d'un fichier peut s'enlever ses propres droits de lecture, écriture et exécution sur un fichier ? Est-ce grave ?</li><li>Obtient-on une meilleure protection si le propriétaire du fichier enlève ses propres droits d'accès ?</li><li>Dans quelle situation ne peut-on écrire sur un fichier alors qu'on a le droit de modifier (w) celui-ci ?</li></ol>`,link:"usi-droits",sol:`<ol><li>w et x sur le ${hl("répertoire")} qui contient le fichier (et x sur les répertoires du chemin). C'est l'algorithme de suppression du cours : « droits de traversée jusqu'au répertoire contenant acquis et droits d'écriture dans répertoire contenant ».</li><li>Aucune : on peut supprimer un fichier qu'on ne peut ni lire ni modifier, si on a w et x sur son répertoire. Supprimer, c'est effacer une entrée du répertoire.</li><li>w sur le fichier, et x sur tous les répertoires traversés pour l'atteindre.</li><li>Oui (${k`chmod u-rwx f`}). Ce n'est pas grave : il reste propriétaire, il peut se les redonner avec chmod.</li><li>Non : le propriétaire (et root) peut toujours remettre les droits. Cela protège seulement contre ses propres fausses manœuvres.</li><li>Quand un répertoire du chemin n'est pas traversable (pas de x) : le cours dit qu'« un fichier lisible par tous, situé dans un répertoire non traversable, ne pourra être lu », et c'est pareil pour l'écriture. Aussi quand le disque est plein ou quand le système de fichiers est en lecture seule.</li></ol>`},
 {id:"17",s:3,note:M,t:"Les colonnes de ls -ali",en:`<p>Créez un fichier USI/droits.txt avec vscodium et saisissez-y du texte puis enregistrez-le. Dans un terminal xfce ou dans un terminal de vscodium testez la commande suivante :</p>${SH`ls -ali | grep droits`}<p>Expliquez à quoi correspond chacune des colonnes de l'affichage suivant ?</p>${TX`3615674885 -rw-r--r-- 1 etudiant@exemple.fr p00000010501 8 août 30 10:54 droits.txt`}`,link:"usi-droits",sol:`<ul><li>${k`3615674885`} : le numéro d'inode (option -i).</li><li>${k`-`} : le type, ici un fichier régulier ; ${k`rw-r--r--`} : le propriétaire lit et écrit, le groupe lit, les autres lisent.</li><li>${k`1`} : le nombre de liens (durs).</li><li>${k`etudiant@exemple.fr`} : le propriétaire ; ${k`p00000010501`} : le groupe.</li><li>${k`8`} : la taille en octets.</li><li>${k`août 30 10:54`} : la date de dernière modification.</li><li>${k`droits.txt`} : le nom. Lui seul vient du répertoire ; tout le reste est dans l'inode.</li></ul>`},
 {id:"18",s:2,note:M,t:"Le droit x sur un répertoire",en:`<p>Que signifie le droit x sur un répertoire ? On veut donner à quelqu'un l'accès à un fichier en lecture et écriture, mais on ne veut pas qu'il puisse prendre connaissance du répertoire contenant. Comment faire ? Que peuvent faire tous les autres utilisateurs ?</p>`,link:"usi-droits",sol:`<p>x sur un répertoire est le droit de le ${hl("traverser")} : y entrer avec cd, et atteindre un fichier dont on connaît le nom.</p><p>On donne ${k`--x`} sur le répertoire (x sans r) et ${k`rw-`} sur le fichier, pour la catégorie de cette personne. Elle ouvre le fichier par son nom exact, mais ${k`ls`} sur le répertoire lui est refusé.</p><p>Si ces droits sont ceux des « autres » (o), tous les autres utilisateurs peuvent en faire autant, à condition de connaître le nom du fichier.</p>`},
 {id:"19",s:2,note:M,t:"Le droit d'écriture sur un répertoire",en:`<p>Quelles sont les possibilités offertes lorsqu'on a le droit d'écriture sur un répertoire ?</p>`,link:"usi-droits",sol:`<p>Cours : « écriture dans le répertoire c-à-d création (creat), suppression (rm), renommage (mv) de fichier ». Il faut aussi x pour traverser. On peut donc supprimer un fichier qui ne nous appartient pas et qu'on ne peut pas modifier : on change la liste des noms, pas le fichier.</p>`},
 {id:"20",s:2,note:M,t:"Manipulations sur les droits des répertoires",en:`<p>Pour les TP, préparer un ensemble de manipulations, afin de mettre en évidence la signification des droits. Par exemple :</p><ul><li>enlever le droit de lecture sur un répertoire et chercher à modifier un fichier dans ce répertoire,</li><li>enlever le droit d'exécution sur un répertoire et chercher à atteindre un fichier inclus,</li><li>enlever le droit d'écriture sur un répertoire et supprimer un fichier inclus (qu'on soit propriétaire de ce fichier ou non),</li><li>etc, à votre imagination.</li></ul>`,link:"usi-droits",sol:`${SH`mkdir rep ; echo bonjour > rep/f
chmod u-r rep
echo suite >> rep/f      # marche : x suffit pour atteindre f
ls rep                   # Permission non accordée : pas de r
chmod u+r,u-x rep
cat rep/f                # Permission non accordée : on ne traverse plus
chmod u+x,u-w rep
rm rep/f                 # Permission non accordée : la liste des noms est figée
chmod u+w rep`}<p>Résultats obtenus en essayant ces commandes. À retenir : r = lister, x = traverser, w = changer la liste des noms. Les droits du fichier f, eux, n'ont jamais changé.</p>`},
 {id:"21",s:2,note:M,t:"Cohérences dans le système de gestion de fichiers",en:`<p>Les situations décrites ci-après correspondent à la vision d'une partie de la gestion de l'espace disque sous unix. Vous devez répondre face à chaque situation si elle vous paraît cohérente ou non. Considérez chaque situation comme un cas séparé et ne pas tenir compte de la colonne type. N'oubliez pas de justifier votre réponse et de signaler toutes les anomalies que vous trouvez.</p><p>les blocs d'allocation seront pris de taille 8 kibi-octets (1Kio=2¹⁰ octets). la notation (0) signifie « libre ». On admettra que tous les blocs qui suivent le premier bloc libre sont libres.</p>${tb(["situation","numéro d'inode","type","taille","blocs d'adressage direct"],[["1","148","","29000","4776 · 4786 · 7021 · 7022 · (0) · (0)"],["","272","","38000","2415 · 4728 · 4014 · 17012 · 30202 · (0)"],["2","2405","","37000","2405 · 4718 · 4004 · 17002 · (0) · (0)"],["3","256","","27000","4102 · 8204 · 2307 · 6409 · (0) · (0)"],["","498","","38000","1205 · 6144 · 4102 · 1025 · 1026 · (0)"]])}<p><b>Exercice 21.</b> Corriger les situations incohérentes et proposer pour chaque situation un ensemble cohérent.</p>`,link:"usi-inode",idea:"Nombre de blocs nécessaires = taille / 8192, arrondi à l'entier au-dessus. Et un bloc ne peut appartenir qu'à un seul fichier.",sol:`<p>Un bloc fait 8 Kio = 8192 octets : 3 blocs = 24 576 octets, 4 blocs = 32 768, 5 blocs = 40 960.</p><ul><li><b>Situation 1.</b> 29 000 octets : entre 3 et 4 blocs, il en faut 4, et il y en a 4. 38 000 octets : entre 4 et 5 blocs, il en faut 5, et il y en a 5. Aucun bloc n'est partagé : ${hl("cohérente")}.</li><li><b>Situation 2.</b> 37 000 octets dépassent 32 768 : il faut 5 blocs, il n'y en a que 4. ${hl("Incohérente")}. Correction : ajouter un 5e bloc libre, ou bien une taille d'au plus 32 768 (et de plus de 24 576). Le bloc 2405 qui porte le même numéro que l'inode n'est pas une anomalie : les inodes et les blocs sont numérotés séparément.</li><li><b>Situation 3.</b> Les nombres de blocs sont bons (4 pour 27 000, 5 pour 38 000), mais le bloc 4102 est donné aux deux inodes. ${hl("Incohérente")}. Correction : remplacer 4102 par un bloc libre dans l'un des deux.</li></ul>`},
 {id:"22",s:2,note:M,t:"Nombre de liens : fichier ou répertoire ?",en:`<p>On regroupe l'ensemble des situations en une seule. On précise en outre les données relatives aux liens.</p>${tb(["inode","nb. liens"],[["148","3"],["272","1"],["2405","1"],["256","5"],["498","2"]])}<p>À la seule vue de ce tableau de liens, peut-on dire si une entrée est un fichier simple ou un répertoire ?</p>`,link:"usi-inode",sol:`<p>En partie seulement. Un répertoire a toujours au moins 2 liens : son nom dans le répertoire parent, et son entrée ${k`.`} en lui-même (puis 1 de plus par sous-répertoire, à cause de leur ${k`..`}). Donc 272 et 2405, qui n'ont qu'un lien, sont des fichiers simples.</p><p>Pour 148, 256 et 498, on ne peut pas conclure : un fichier simple peut aussi avoir plusieurs liens durs. Si 256 était un répertoire, il aurait 5 − 2 = 3 sous-répertoires.</p>`},
 {id:"23",s:2,note:M,t:"Deux organisations de répertoires",en:`<p>On propose maintenant deux organisations possibles de répertoires. Est-ce que chaque organisation (1 puis 2) est cohérente avec les données ci-dessus de l'exercice précédent ?</p><p>(Rappel de l'exercice 22 : inode 148 : 3 liens ; 272 : 1 ; 2405 : 1 ; 256 : 5 ; 498 : 2.)</p>${tb(["organisation","répertoire 1","répertoire 2"],[["1","fibre → 148<br>finioui → 2405","fini → 272<br>fininon → 148"],["2","fibonacci → 498<br>figue → 148<br>filon → 148<br>fichtre → 498","fibonnacci → 498<br>figue → 148"]])}`,link:"usi-liens",idea:"Compte, pour chaque inode, combien de noms le désignent : ce doit être son nombre de liens.",sol:`<ul><li><b>Organisation 1.</b> 272 a 1 nom (fini) pour 1 lien, 2405 a 1 nom (finioui) pour 1 lien : bon. Mais 148 n'a que 2 noms (fibre, fininon) pour 3 liens. Si ces deux répertoires sont tout ce qui existe, c'est ${hl("incohérent")} ; il faudrait un 3e nom pour 148 dans un autre répertoire.</li><li><b>Organisation 2.</b> 148 a 3 noms (figue et filon dans le répertoire 1, figue dans le répertoire 2) pour 3 liens : bon, et deux « figue » dans deux répertoires différents sont permis. Mais 498 a 3 noms (fibonacci, fichtre, fibonnacci) pour 2 liens : ${hl("incohérent")}.</li></ul>`},
 {id:"24",s:1,note:M,t:"La commande chmod et l'appel système chmod()",en:`<p>La commande chmod (man chmod) et l'appel système chmod() (man 2 chmod) existent. Quelle est l'utilité de chacun ?</p>`,link:"usi-droits",sol:`<p>La ${hl("commande")} sert à l'utilisateur, dans un terminal ou un script : ${k`chmod u+x f`}. L'${hl("appel système")} est la fonction du noyau qu'un programme C appelle pour changer des droits (section 2 du manuel : les appels noyau). La commande chmod est elle-même un programme, qui appelle chmod(). Même chose pour ${k`rm`} et unlink(), ${k`ln`} et link(), cités dans le cours.</p>`},
 {id:"25",s:3,note:M,t:"umask en pratique",en:`<p>(Rappel du TD : les droits définitifs sont obtenus par l'opération (droits de base) et (non umask), avec les droits de base rw-rw-rw-, 666 en octal, pour un fichier. Par exemple umask 022 crée les fichiers avec les droits rw-r--r--, umask 024 avec rw-r---w-, umask 066 avec rw-------.)</p><ul><li>Quelle est la valeur courante de votre umask ?</li><li>Changez votre valeur de masque à 020 puis créez un nouveau fichier : quels sont ses droits ?</li><li>Créez maintenant un nouveau répertoire et vérifiez ses droits.</li><li>Peut-on s'interdire à soi-même tout accès à tout fichier nouvellement créé ? Est-ce grave (irréversible) ?</li></ul>`,link:"usi-umask",sol:`<ul><li>${k`umask`} sans paramètre l'affiche : en général ${k`0022`}.</li><li>${k`umask 020`} retire le w du groupe. Fichier : 666 devient ${hl("646")}, ${k`rw-r--rw-`}.</li><li>Répertoire : la base est 777, qui devient ${hl("757")}, ${k`rwxr-xrwx`}.</li><li>Oui, avec ${k`umask 777`} (ou 700) : les nouveaux fichiers naissent sans aucun droit pour leur propriétaire. Ce n'est pas irréversible : le propriétaire peut faire ${k`chmod u+rw f`}, puis remettre ${k`umask 022`}.</li></ul>`},
 {id:"26",s:2,note:M,t:"Voir l'inode, les liens, les fichiers cachés",en:`<p>Quelle commande permet de visualiser le numéro d'inode d'un fichier ? Quelle commande permet de visualiser le nombre de liens (liens physiques dits durs) ? Quelle commande permet de lister les fichiers cachés (commençant par un point) ?</p>`,link:"usi-inode",sol:`<p>${k`ls -i`} pour le numéro d'inode ; ${k`ls -l`} pour le nombre de liens (2e colonne) ; ${k`ls -a`} pour les fichiers cachés. Les trois à la fois : ${k`ls -ali`}.</p>`},
 {id:"27",s:1,note:M,t:"Tous les noms d'un inode",en:`<p>Partant d'un fichier et de son numéro d'inode, comment peut-on trouver l'ensemble des noms qui référencent cet inode ?</p>`,link:"usi-liens",sol:`<p>${k`ls -i f`} donne le numéro, par exemple 1234. Puis ${k`find / -inum 1234`} parcourt l'arborescence et affiche tous les noms qui ont ce numéro d'inode (il faut rester dans la même partition : un numéro d'inode n'a de sens que dans son système de fichiers). On doit trouver autant de noms que le nombre de liens affiché par ${k`ls -l`}.</p>`},
 {id:"28",s:2,note:M,t:"Liens durs en pratique",en:`<ul><li>Créer plusieurs liens durs sur un fichier toto.txt vous appartenant dans le même répertoire et dans un répertoire différent. Peuvent-ils avoir le même nom ?</li><li>vérifiez le compte de liens et l'inode dans chaque répertoire ?</li><li>Supprimez le lien sur toto.txt. Que se passe-t-il ?</li><li>modifiez le contenu du fichier grâce au lien du même répertoire. Que se passe-t-il pour le dernier lien créé ?</li></ul>`,link:"usi-liens",sol:`${SH`ln toto.txt t2
ln toto.txt autre/toto.txt
ls -li toto.txt t2 autre/toto.txt
rm toto.txt
echo suite >> t2
cat autre/toto.txt`}<ul><li>Dans le même répertoire, non : chaque nom y est unique. Dans un autre répertoire, oui.</li><li>Les trois noms montrent le même numéro d'inode et le même compteur, 3.</li><li>Le compteur passe à 2. Les deux autres noms marchent toujours : le contenu n'est libéré que quand le compteur arrive à 0.</li><li>Le dernier lien créé voit la modification : il n'y a qu'un inode et qu'un contenu. Attention au § 2.8 du TD (« Une utilisation dangereuse ») : beaucoup d'éditeurs sauvegardent en renommant l'ancien fichier et en recréant un nouveau, avec un nouvel inode ; les anciens liens durs pointent alors sur l'ancienne version.</li></ul>`},
 {id:"29",s:2,note:M,t:"Liens symboliques en pratique",en:`<p>Créer des répertoires temporaires et faire des liens symboliques sur ces répertoires, toujours par vous-même et par un collègue. Cette fois-ci peut-on savoir qu'un lien existe sur ce répertoire ? Que se passe-t-il :</p><ul><li>lorsqu'on supprime un lien ?</li><li>lorsqu'on supprime le répertoire sans supprimer les liens ?</li><li>Comment produire un circuit de liens symboliques ?</li></ul>`,link:"usi-liens",sol:`<p>Non, on ne peut pas le savoir : un lien symbolique est un autre fichier, de type ${k`l`}, qui contient un chemin. Rien ne change dans l'inode du répertoire visé (son compteur de liens ne bouge pas).</p><ul><li>Supprimer un lien : seul le raccourci disparaît, le répertoire n'est pas touché.</li><li>Supprimer le répertoire : les liens restent, mais ce sont des « liens morts », ils visent un chemin qui n'existe plus.</li><li>Un circuit (exemple du cours) : ${k`touch a; ln -s a b; rm a; ln -s b a; cd a`} provoque une erreur après un certain nombre de résolutions de raccourcis. Autre circuit : ${k`ln -s .. c`}, un lien vers un répertoire ascendant, qu'il ne faut pas suivre dans un parcours récursif.</li></ul>`},
 /* 3. processus */
 {id:"30",s:3,note:M,t:"Une commande crée-t-elle toujours un processus ?",en:`<p>L'exécution d'une commande déclenche-t-elle toujours la génération d'un nouveau processus ? Donnez deux exemples.</p>`,link:"usi-fork",sol:`<p>Non. Cours : chaque ligne donne lieu « à création d'un processus puis exécution de la commande externe ou bien à l'exécution dans le même processus de la commande interne ».</p><ul><li>Commande externe, par exemple ${k`ls`} : bash se duplique (fork), l'enfant se recouvre par ${k`/bin/ls`}, bash attend sa fin (wait).</li><li>Commande interne, par exemple ${k`cd`} ou ${k`echo Hello`} : elle s'exécute dans le processus bash lui-même, sans nouveau processus.</li></ul>`},
 {id:"31",s:2,note:M,t:"Pourquoi deux modes d'exécution ?",en:`<p>Pourquoi tout processus a deux modes d'exécution (utilisateur, noyau (système)) ?</p>`,link:"usi-processus",sol:`<p>Pour la ${hl("protection")}. En mode utilisateur, un processus ne peut ni toucher au matériel, ni modifier les tables du système, ni atteindre la mémoire des autres processus. Quand il a besoin d'un service (ouvrir un fichier, créer un processus), il fait un appel système : il passe en mode noyau, où c'est une fonction du noyau qui s'exécute et qui vérifie les droits ; le retour de l'appel le repasse en mode utilisateur. Les gérants d'interruption font le même passage.</p>`},
 {id:"32",s:1,note:M,t:"Plusieurs utilisateurs sur une machine",en:`<p>Quel est le nom du mécanisme qui permet à plusieurs utilisateurs de travailler en même temps sur une seule machine ? Sur une machine mono-processeur comment est réalisé la commutation de processus ?</p>`,link:"usi-processus",sol:`<p>La ${hl("multiprogrammation")} (système multi-tâches préemptif, et multi-utilisateurs grâce à l'authentification).</p><p>Sur un seul processeur, un seul processus est actif à la fois. La commutation est un ${hl("changement de contexte")} : quand le processus actif passe en mode noyau (appel système ou interruption), son contexte (compteur ordinal, pointeur de pile, registres) est sauvegardé, l'ordonnanceur élit le processus prêt de plus haute priorité, restaure son contexte et le marque actif.</p>`},
 {id:"33",s:1,note:M,t:"Communiquer avec l'extérieur d'un processus",en:`<p>Listez l'ensemble des mécanismes qui permettent à un processus de "communiquer" avec l'extérieur de ce processus.</p>`,link:"usi-processus",sol:`<ul><li>Ce qu'il reçoit à son lancement : les paramètres de la ligne de commande et les variables d'environnement, copiées depuis son parent.</li><li>Ses entrées/sorties : l'entrée standard, la sortie standard, la sortie d'erreur, et tous les fichiers qu'il ouvre.</li><li>Les tubes, qui relient sa sortie à l'entrée d'un autre processus.</li><li>Son code de retour (exit), que le parent lit, et que bash range dans ${k`$?`}.</li><li>Les signaux (Ctrl-C, kill), et le réseau.</li><li>Les appels système, qui sont sa seule porte vers le noyau.</li></ul>`},
 {id:"34",s:2,note:M,t:"Supprimer un processus détaché",en:`<p>Après avoir détaché un processus du terminal courant (vscodium &amp;), on souhaite supprimer ce processus. Comment faire ?</p>`,link:"usi-processus",sol:`<p>${k`ps`} (ou ${k`jobs`}) pour retrouver son PID ou son numéro de tâche, puis ${k`kill PID`} ou ${k`kill %1`} ; ${k`kill -9 PID`} s'il résiste. Autre moyen : le ramener en avant-plan avec ${k`%1`}, puis Ctrl-C. Ctrl-C seul ne suffit pas, car il ne touche que le processus en avant-plan.</p>`},
 {id:"35",s:1,note:M,t:"Observer les processus avec ps",en:`<p>Un échantillonnage concernant l'état des processus à un instant donné (une photographie) est renvoyé par la commande ps. Voir man ps.</p><p>Exécutez les commandes : ps; ps l; ps vx; ps faux</p><p>Essayez de trouver la signification des différents champs (man ps) et options. Repérez la filiation PID - PPID, c'est à dire la relation numéro du processus - numéro du processus père. Repérez votre processus d'ouverture de session !</p>`,link:"usi-processus",sol:`<p>Les champs décrits dans le cours :</p><ul><li>PID : l'identifiant du processus ; PPID : celui de son parent.</li><li>TTY : le terminal d'attachement (${k`pts/0`}, ${k`pts/1`} : deux onglets).</li><li>STAT : l'état. ${k`R`} (run) : éligible (prêt) ou élu ; ${k`S`} (sleep) : en attente d'un événement ; ${k`s`} : leader de session ; ${k`+`} : groupe d'avant-plan ; ${k`l`} : multi-thread.</li><li>TIME : le temps passé sur le processeur. Avec ${k`u`} : USER, %CPU, %MEM, VSZ (mémoire virtuelle en Kio), RSS (mémoire physique en Kio), START.</li></ul><p>Options : ${k`f`} (forest) dessine la relation parent/enfant ; ${k`l`} donne le format long avec le PPID ; ${k`a`} les processus de tous les utilisateurs ; ${k`u`} le format « utilisateur » ; ${k`x`} aussi ceux qui n'ont pas de terminal ; ${k`v`} la mémoire. Le processus d'ouverture de session est le ${k`bash`} marqué ${k`Ss`}, le parent de tes commandes.</p>`},
 {id:"36",s:3,note:M,t:"Enchaînements, enchaînements conditionnels",en:`<ol><li>Enchaînez, en une seule ligne de commande, le listage ( ls ) du répertoire courant puis l'affichage ( cat ) du fichier des mots de passe ( fichier /etc/passwd ) enfin l'affichage de l'heure ( date ).</li><li>Toute commande Unix renvoie un code de retour (status) qui vaut vrai ( 0 ) si la commande s'est déroulée sans échec et faux ( tout entier différent de 0 ) sinon. Enchaînez une commande cat toto, puis en utilisant le caractère spécial convenable ( ; || &amp;&amp; ), une seconde commande echo "échec !".</li><li>même question que la précédente mais avec affichage de "réussite !" si le fichier toto existe</li></ol>`,link:"usi-redir",sol:`${SH`ls ; cat /etc/passwd ; date
cat toto || echo "échec !"
cat toto && echo "réussite !"`}<p>${k`;`} enchaîne toujours. ${k`||`} lance la seconde commande seulement si la première a échoué (code différent de 0) ; ${k`&&`} seulement si elle a réussi (code 0).</p>`},
 {id:"37",s:2,note:M,t:"Processus concurrents : le caractère &",en:`<p>Exécutez la ligne suivante :</p>${SH`( sleep 5 ; echo "fin des 5 s" ; ps f ) &            (sleep 4 ; echo "fin des 4 s" ; ps f ) &`}<ol><li>Combien de nouveaux processus ont été créés ?</li><li>Que signifie les nombres 1 et 2 entre crochets ?</li><li>Peut-on prédire quel nouveau processus à démarré en premier et l'ordre des suivants ?</li><li>Quel parallélisme et entrelacement observez-vous ?</li></ol>`,link:"usi-fork",sol:`<ol><li>Chaque parenthèse est exécutée par un enfant de bash (un sous-shell) : 2 processus. Chacun lance ensuite ${k`sleep`} puis ${k`ps`}, deux commandes externes (${k`echo`} est interne) : 4 de plus. En tout ${hl("6")} nouveaux processus.</li><li>Ce sont les numéros de tâches (jobs) des deux groupes lancés en arrière-plan ; bash affiche à côté leur PID.</li><li>Non : c'est l'ordonnanceur qui élit les processus prêts.</li><li>Les deux groupes tournent en parallèle, et bash a déjà rendu la main. « fin des 4 s » s'affiche au bout de 4 secondes, avant « fin des 5 s » qui a pourtant été lancé en premier ; les affichages se mêlent à l'invite du terminal.</li></ol>`},
 {id:"38",s:2,note:M,t:"Interrompre ou tuer des processus",en:`<p>Exécutez la commande : find / -type d -print</p><p>Cette commande cherche à partir de la racine (/) tous les objets de type répertoire et affiche leur nom. Attention cette commande est récursivement appliquée à tous les répertoires fils de la racine. L'exécution complète est très longue. On est bloqué tant que le processus find n'est pas terminé. Plusieurs moyens permettent de débloquer la situation :</p><ol><li>interrompez le processus find en tapant le caractère Intr généralement Ctrl-C</li><li>On ne peut cependant interrompre que le processus s'exécutant en avant-plan. Exemple : find / -type d -print &amp;. Le processus est lancé en arrière-plan ou tâche de fond. De plus ses sorties polluent la sortie standard. Que faire ? Ramener le processus en question en avant-plan : %1 puis l'interrompre Ctrl-C ou bien l'interrompre directement : kill %1. On suppose que 1 est le numéro de job associé au processus lancé en arrière plan (commande jobs pour les connaître). Parfois, certains processus sont plus coriaces, et ne se laissent pas tuer aussi facilement. On emploie alors la manière forte : kill -9 PID ....</li><li>Lancer un processus vscodium en arrière-plan puis le tuer avec la commande kill.</li><li>Pouvez-vous tuer des processus qui ne vous appartiennent pas ? Essayez.</li><li>Exécutez la commande find / -type d -print. Ouvrez une deuxième fenêtre shell ou un autre onglet, et depuis cette autre fenêtre, observez la liste des processus actifs en utilisant la commande ps. Tuez alors le processus find en utilisant la commande kill -9 en lui passant le numéro de processus de find. Tuez de même le processus shell de l'autre fenêtre. Observez ce qui se passe.</li></ol>`,link:"usi-processus",sol:`<ol start="3"><li>${k`vscodium &`} affiche son numéro de tâche et son PID, par exemple ${k`[1] 12345`}. Puis ${k`kill 12345`} ou ${k`kill %1`}.</li><li>Non : « Opération non permise ». Seuls le propriétaire du processus et root peuvent le tuer.</li><li>Dans l'autre fenêtre, ${k`ps aux | grep find`} (ou ${k`ps faux`}) donne le PID de find ; ${k`kill -9 PID`} le tue immédiatement. Tuer de même le bash de la première fenêtre ferme cette fenêtre (ou cet onglet) : le terminal n'a plus d'interpréteur.</li></ol>`},
 {id:"39",s:3,note:M,t:"Redirection des entrées/sorties",en:`<p>De façon à permettre l'exécution de jobs sans présence d'êtres humains (sans interaction), il est souvent utile de "rediriger" les E/S dans des fichiers.</p><ol><li>Reprenez la commande de la section 3.3 et redirigez les sorties des différents processus concurrents dans un fichier</li><li>Que fait la commande suivante : <code>ls /bin /toto &gt; ~/commandes</code></li><li>Que fait la commande suivante : <code>cat &lt;tempo &gt;tempo2</code> ?</li></ol>`,link:"usi-redir",sol:`<p>1. Une redirection par groupe (avec ${k`>>`} sur un même fichier, les deux sorties s'ajouteraient l'une après l'autre) :</p>${SH`( sleep 5 ; echo "fin des 5 s" ; ps f ) > sortie5.txt &
( sleep 4 ; echo "fin des 4 s" ; ps f ) > sortie4.txt &`}<p>2. La liste de /bin est écrite dans le fichier ${k`~/commandes`} (créé, ou écrasé s'il existait). Le message d'erreur sur /toto, qui n'existe pas, s'affiche quand même à l'écran : il sort par la sortie d'erreur, que ${k`>`} ne redirige pas.</p><p>3. cat lit tempo à la place du clavier et écrit dans tempo2 à la place de l'écran : c'est une copie de tempo dans tempo2.</p>`},
 {id:"40",s:2,note:M,t:"Tubes et filtres",en:`<p>Rappels du TD (§ 3.6) : pr formate le flot en entrée suivant des critères longueur de ligne, taille de la page, en-têtes (cat monfic | pr -3 affiche le fichier en 3 colonnes) ; sort trie un flot de lignes, éventuellement suivant la valeur de champ(s) ; cut « coupe » chaque enregistrement en conservant les seuls champs spécifiés (cut -d: -f 1,3,5) ; more affiche page par page.</p><ol><li>Enchaînez en utilisant le mécanisme de tube : ls, sort, pr, more, avec les bons arguments et les options appropriées pour chaque commande, de façon à obtenir en une seule commande : la liste des fichiers de /dev (ls) dans l'ordre inverse des noms (sort) mise en page par pr sur 3 colonnes avec une largeur de ligne de 60 caractères, 40 lignes par page et un titre "jolie impression" affichés sur l'écran page par page grâce à more.</li><li>Afficher le nom des fichiers de "type texte" de votre répertoire d'accueil. Idée : la commande file fichier ... détermine le "type" de l'argument en examinant le début du contenu de l'argument. Essayez : file * et file /usr/bin/a*.</li><li>De la même façon, affichez le nom des répertoires de votre répertoire d'accueil</li><li>Afficher le nom de connexion, le nom complet et le répertoire d'accueil de tous les utilisateurs triés par ordre du nom complet.</li></ol>`,link:"usi-filtres",sol:`${SH`ls /dev | sort -r | pr -3 -w 60 -l 40 -h "jolie impression" | more
file ~/* | grep text | cut -d: -f1
file ~/* | grep directory | cut -d: -f1
cut -d: -f1,5,6 /etc/passwd | sort -t: -k2`}<ol><li>${k`sort -r`} : ordre inverse ; ${k`pr -3 -w 60 -l 40 -h "…"`} : 3 colonnes, largeur 60, 40 lignes par page, titre.</li><li>${k`file`} affiche « nom: type » : on garde les lignes qui contiennent text, puis seulement le 1er champ, avant le deux-points.</li><li>Pareil avec le mot directory (essayé). Autre solution : ${k`ls -l ~ | grep "^d"`}, qui garde les lignes de ls -l commençant par d.</li><li>Dans /etc/passwd, les champs sont séparés par ${k`:`} ; le 1er est le nom de connexion, le 5e le nom complet, le 6e le répertoire d'accueil. Après le cut, le nom complet est le 2e champ : ${k`sort -t: -k2`}.</li></ol>`},
 /* 4. développement : bash */
 {id:"42",s:3,note:M,t:"Questions sur les scripts bash",en:`<p>Quelques questions et réponses justifiées :</p><ul><li>un script bash est-il :<ul><li>un fichier régulier ?</li><li>un fichier binaire ?</li><li>un fichier ayant l'extension sh obligatoire ?</li><li>un fichier se trouvant obligatoirement dans un des répertoires du PATH ?</li></ul></li><li>le lancement d'un script affiche le message permission denied. Pourquoi ?</li><li>le lancement d'un script affiche le message file not found. Pourquoi ?</li><li>le lancement d'un script affiche le message syntax error. Pourquoi ?</li></ul>`,link:"usi-bash-var",sol:`<ul><li>Un fichier régulier : oui. Binaire : non, c'est un fichier texte. L'extension sh : pas obligatoire. Dans le PATH : non, on peut le lancer avec ${k`./script`} ou ${k`bash script`}.</li><li>permission denied : il n'a pas le droit d'exécution (par défaut les fichiers créés ne l'ont pas). Remède : ${k`chmod u+x script`}.</li><li>file not found : bash ne trouve pas le fichier. Soit on a tapé son nom sans ${k`./`} alors que le répertoire courant n'est pas dans le PATH, soit le chemin est faux, soit l'interpréteur de la première ligne ${k`#!`} n'existe pas.</li><li>syntax error : le script contient une faute de syntaxe bash (un ${k`then`}, ${k`fi`} ou ${k`done`} oublié, des espaces manquants dans ${k`[[ ]]`}). Attention : des espaces autour du ${k`=`} d'une affectation (${k`x = 5`}) donnent « x: command not found », pas « syntax error ».</li></ul>`},
 {id:"43",s:2,note:M,t:"lsparent.sh",en:`<p>créez un script bash lsparent.sh qui, <b>sans changer le répertoire de travail</b>, affiche le nom du répertoire parent du répertoire de travail puis qui liste le contenu complet (même les fichiers cachés) du répertoire parent de façon exhaustive (voir tous les champs). Veillez à ce que ce script soit exécutable par vous-même !</p>`,link:"usi-bash-var",paper:true,sol:`${SH`#!/bin/bash
echo "Répertoire parent : $(dirname $(pwd))"
ls -la ..`}<p>${k`dirname`} (cours) extrait le répertoire d'un chemin : ${k`dirname /home/dupont/USI`} donne ${k`/home/dupont`}. ${k`ls -la ..`} : ${k`-a`} pour les fichiers cachés, ${k`-l`} pour tous les champs, sur le parent ${k`..`} sans y aller. Puis ${k`chmod u+x lsparent.sh`} (essayé).</p>`},
 {id:"44",s:3,note:M,t:"lsarg.sh : afficher ses arguments",en:`<p>Ecrire un script Bash lsarg.sh qui affiche la liste des arguments, <b>y compris la commande</b>, chacun sur une ligne différente numérotée de 0 à n-1 :</p>${TX`$ lsarg.sh a b c
Liste des arguments :
0 : ./lsarg.sh
1 : a
2 : b
3 : c
$`}`,link:"usi-bash-ctrl",paper:true,sol:`${SH`#!/bin/bash
echo "Liste des arguments :"
echo "0 : $0"
i=1
for a in "$@"
do
    echo "$i : $a"
    i=$((i+1))
done`}<p>${k`$0`} est le nom de la commande ; ${k`$@`} la liste des autres arguments. Essai : ${k`./lsarg.sh a b c`} affiche exactement l'exemple.</p>`},
 {id:"45",s:2,note:M,t:"fact.sh : factorielle récursive",en:`<p>Ecrire la fonction <b>récursive</b> factorielle qui calcule le produits des entiers consécutifs inférieurs au paramètre fourni et écrire le script correspondant :</p>${TX`Exemples$ ./fact.sh 5
120`}`,link:"usi-bash-ctrl",paper:true,who:OFFM,sol:`${SH`#!/usr/bin/env bash
function fact(){
  if [[ $1 -le 1 ]]; then
    echo 1
  else
    echo $(( $1 * $( fact $(( $1-1 )) ) )) #
  fi
}

echo $(fact $1)`}<p>Une fonction bash « renvoie » ce qu'elle affiche : ${k`$( fact … )`} récupère ce qu'affiche l'appel récursif, et ${k`$(( … ))`} fait la multiplication. ${k`-le`} veut dire « inférieur ou égal » (less or equal). ${k`#!/usr/bin/env bash`} est une autre façon d'écrire ${k`#!/bin/bash`}.</p>`},
 {id:"46",s:2,note:M,t:"lsrec.sh : parcours récursif d'un répertoire",en:`<p>Ecrire un script bash lsrec.sh qui affiche récursivement la liste des sous-répertoires (et pas les fichiers réguliers) en indentant cette liste afin de la représenter de manière arborescente. On utilisera une fonction récursive parcours qui se rappellera pour chacun des sous-répertoires de l'argument courant en utilisant un second paramètre indent qui grossira au fur et à mesure . . .</p>${TX`Exemples$ lsrec.sh ..
../Exemples
  ../Exemples/Bidon2
  ../Exemples/USI
    ../Exemples/USI/Fable
    ../Exemples/USI/Script
  ../Exemples/bidon`}`,link:"usi-bash-ctrl",paper:true,who:OFFM,sol:`${SH`#!/usr/bin/env bash
# lsrec.sh
function parcours() { # ou parcours(){ SANS LE MOT CLE function
  if [[ -z $1 ]]; then # params d'une fon comme un script
    rep='.'
  else
    rep=$1
  fi
  if [[ -z $2 ]]; then #indentation à partir du second appel
    indent=''
    else
    indent=$2
  fi
  liste=$(ls $rep)
  for fic in $liste;
  do
    if [[ -d "$rep/$fic" ]]; then
      echo "$indent$rep/$fic"
      x="$(parcours "$rep/$fic" "  $indent")"   # sans affectation : erreurs, les guillemets extérieurs sont indispensables
      echo "$x"
    fi
  done
}

parcours $1`}<p>${k`-z`} teste si une chaîne est vide : sans paramètre, on part de ${k`.`}. Pourquoi ${k`x="$(parcours …)"`} ? Dans bash, les variables d'une fonction (rep, indent, liste) sont partagées par tous les appels. Lancé dans ${k`$( )`}, l'appel récursif tourne dans un processus enfant, qui travaille sur des copies : il ne dérègle pas les variables de l'appel en cours. (J'ai enlevé du fichier deux lignes de mise au point en commentaire.)</p><p>Une version plus courte, écrite par moi et essayée (elle affiche exactement l'exemple) :</p>${SH`#!/bin/bash
parcours() {
    for f in "$1"/*
    do
        if [[ -d "$f" ]]
        then
            echo "$2$f"
            parcours "$f" "$2  "
        fi
    done
}
parcours "$1" ""`}`},
 /* 4. développement : C */
 {id:"47",s:2,note:M,t:"Interpréteur ou compilateur",en:`<p>Quelle différence existe-t-il entre un interpréteur et un compilateur ? Citez deux exemples pour chacun d'entre eux.</p>`,link:"usi-c-compil",sol:`<p>Un ${hl("interpréteur")} lit le programme source et l'exécute directement, à chaque lancement : bash, python3. Un ${hl("compilateur")} traduit une fois le source en un autre langage (assembleur, puis code machine), et c'est le fichier exécutable obtenu qu'on lance : gcc, g++.</p><p>Cours : l'interprétation permet un cycle de développement plus rapide, mais l'exécution est plus lente qu'avec du code machine compilé. Solution intermédiaire : Java, compilé par javac puis interprété par java.</p>`},
 {id:"48",s:2,note:M,t:"Fichier d'en-tête ou bibliothèque",en:`<p>Quelles similitudes et quelles différences existe-t-il entre un fichier d'en-tête (toto.h) et une bibliothèque ? Quand les utilise-t-on dans le processus de compilation ? Citez deux exemples pour chacun d'entre eux.</p>`,link:"usi-c-compil",sol:`<p>Similitude : les deux servent à utiliser des fonctions écrites ailleurs.</p><p>Différences : l'en-tête est un fichier ${hl("texte")} de déclarations (prototypes, types, constantes) ; il est inclus par le ${hl("prétraitement")}, tout au début (${k`#include`}). Exemples : stdio.h, stdlib.h. La bibliothèque contient le ${hl("code compilé")} de ces fonctions ; elle est ajoutée à la fin, à l'${hl("édition des liens")}. Exemples : libc.so (la bibliothèque standard), libm.so (mathématiques, option ${k`-lm`}).</p>`},
 {id:"49",s:1,note:M,t:"Inclure un en-tête standard ou personnel",en:`<p>Quelle différence entre l'inclusion d'un fichier d'entête standard tel que stdio.h, stdlib.h, ctype.h et un fichier d'entête personnel monprog.h ?</p>`,link:"usi-c-compil",sol:`<p>${k`#include <stdio.h>`}, avec des chevrons : le fichier est cherché dans les répertoires du système (${k`/usr/include/`}). ${k`#include "monprog.h"`}, avec des guillemets : il est cherché d'abord dans le répertoire du fichier source.</p>`},
 {id:"50",s:2,note:M,t:"Paramètres et environnement en C",en:`<p>Comment les paramètres de la ligne de commande sont-ils passés à un programme C ? Comment l'environnement du processus (variables d'environnement telles que PATH, HOME, ...) est-il atteignable par un programme C ?</p>`,link:"usi-c-compil",sol:`<p>Par les paramètres de la fonction main : ${k`int main(int argc, char *argv[], char *env[])`}.</p><ul><li>${k`argc`} : le nombre de mots de la ligne de commande, nom du programme compris ; ${k`argv`} : le tableau de ces chaînes (${k`argv[0]`} est le nom du programme).</li><li>${k`env`} : un tableau de chaînes « NOM=valeur », terminé par NULL (c'est son « objet terminateur », car un tableau C ne connaît pas sa taille).</li></ul>`},
 {id:"51",s:2,note:M,t:"Le point d'entrée d'un programme C",en:`<p>On souhaite écrire un programme affichant le nombre de paramètres passés à la ligne de commande, ces paramètres, ainsi que les variables d'environnement.</p><ol><li>Ecrire l'algorithme de ce programme.</li><li>Ecrire le programme C correspondant.</li></ol>`,link:"usi-c-compil",paper:true,sol:`<p>1. Algorithme :</p>${TX`afficher argc
pourChaque (i de 0 à argc - 1)
    afficher argv[i]
i = 0
tantQue env[i] != NULL
    afficher env[i]
    i++`}<p>2. Le début est le programme argv.c du cours ; la dernière boucle, pour l'environnement, est de moi.</p>${CC`#include <stdio.h>
int main(int argc, char *argv[], char *env[]) {
  printf("Nombre d'arguments : %i\n\nListe des arguments :\n",argc);
  for (int i=0;i<argc;i++){
    printf("%s\n",argv[i]);
  }
  for (int i=0;env[i]!=NULL;i++){
    printf("%s\n",env[i]);
  }
  return 0;
}`}<p>Exécution du cours : ${k`argv un 2 34.5`} affiche « Nombre d'arguments : 4 », puis argv, un, 2, 34.5.</p>`},
 {id:"52",s:1,note:M,t:"Les étapes de gcc",en:`<p>A l'aide du programme précédent, testez les possibilités du compilateur gcc en produisant :</p><ul><li>le fichier prétraité ;</li><li>le fichier assembleur ;</li><li>le fichier objet ;</li></ul><p>Observez ces différents fichiers.</p>`,link:"usi-c-compil",sol:`${SH`gcc -E argv.c > argv.i   # que le prétraitement
gcc -S argv.c            # compiler sans assembler : argv.s
gcc -c argv.c            # compiler et assembler seulement : argv.o
gcc -o argv argv.o       # édition des liens : l'exécutable`}<p>argv.i est du C où stdio.h a été recopié (des centaines de lignes) ; argv.s est du texte en langage d'assemblage ; argv.o est un fichier binaire.</p>`},
 {id:"53",s:2,note:M,t:"Moyenne de 5 nombres saisis (scanf)",en:`<p>On souhaite réaliser le calcul de la moyenne d'une suite de 5 nombres flottants saisis au clavier.</p><ol><li>Ecrire l'algorithme de ce programme.</li><li>Ecrire le programme C correspondant.</li></ol>`,link:"usi-c-compil",paper:true,who:OFFM+" pour le programme ; l'algorithme est de moi",sol:`<p>1. Algorithme :</p>${TX`m = 0
pourChaque (i de 1 à 5)
    lire un flottant f au clavier
    m = m + f
afficher m / 5`}<p>2. Fichier moyenne.c de Meynard :</p>${CC`#include <stdio.h>
int main(int argc, char *argv[], char *env[]) {
  printf("Saisir 5 nombres S.V.P. :\n");
  float f;
  float m=0;
  for (int i=0;i<5;i++){
    printf("%d : ",i+1);
    scanf("%f",&f);
    m+=f;
  }
  printf("\nMoyenne des 5 nombres : %f\n",m/5);
}`}<p>${k`scanf("%f",&f)`} lit un flottant au clavier et le range dans f. Il faut ${k`&f`}, l'adresse de f : le passage se fait par copie, scanf ne peut donc modifier f qu'à travers un pointeur.</p>`},
 {id:"54",s:3,note:M,t:"Moyenne des paramètres (atoi)",en:`<p>En utilisant la fonction atoi qui convertit une chaîne en entier, réaliser le calcul de la moyenne de la suite des paramètres passés à la ligne de commande : moy 5 8 12 3.</p><ol><li>Ecrire l'algorithme de ce programme.</li><li>Ecrire le programme C correspondant.</li></ol>`,link:"usi-c-compil",paper:true,who:OFFM+" pour le programme ; l'algorithme est de moi",sol:`<p>1. Algorithme :</p>${TX`m = 0
pourChaque (i de 1 à argc - 1)
    m = m + entier(argv[i])
afficher m / (argc - 1)`}<p>2. Fichier moy.c de Meynard :</p>${CC`#include <stdio.h>
#include <stdlib.h>
int main(int argc, char *argv[], char *env[]) {
  float m=0;
  for (int i=1;i<argc;i++){
    m+=atoi(argv[i]);
  }
  printf("\nMoyenne des %d nombres : %.2f\n",argc-1,m/(argc-1));
  return 13;
}`}<ul><li>La boucle part de ${k`i=1`} : ${k`argv[0]`} est le nom du programme, et il y a ${k`argc-1`} nombres.</li><li>${k`m`} est un float : la division ${k`m/(argc-1)`} n'est donc pas une division entière. ${k`moy 5 8 12 3`} affiche « Moyenne des 4 nombres : 7.00 ».</li><li>${k`return 13`} : le code de retour est libre ; après l'exécution, ${k`echo $?`} affiche 13. D'habitude on renvoie 0 quand tout s'est bien passé.</li></ul>`},
 {id:"55",s:2,note:M,t:"Convertir une chaîne en entier",en:`<p>Soit une chaîne de caractères C contenant un nombre entier positif en représentation décimale. On veut écrire une fonction convertissant cette chaîne en un entier.</p><ol><li>Ecrire un algorithme <b>itératif</b> de conversion.</li><li>Ecrire la fonction C correspondante.</li></ol>`,link:"usi-c-memoire",paper:true,sol:`<p>1. On lit les chiffres de gauche à droite ; à chaque chiffre, ce qu'on a déjà est décalé d'un rang (× 10) :</p>${TX`n = 0
pourChaque (caractère c de la chaîne, de gauche à droite)
    n = n * 10 + valeur du chiffre c
retourner n`}<p>Pour "2026" : 2, puis 20, puis 202, puis 2026.</p><p>2.</p>${CC`int chaineVersEntier(char *s) {
    int n = 0;
    for (int i = 0; s[i] != '\0'; i++)
        n = n * 10 + (s[i] - '0');
    return n;
}`}<p>Une chaîne C finit par ${k`'\0'`} : c'est ce qui arrête la boucle. ${k`s[i] - '0'`} donne la valeur du chiffre, car les codes des caractères '0' à '9' se suivent. C'est ce que fait ${k`atoi`} (essayé : "2026" donne 2026).</p>`},
 {id:"56",s:1,note:M,t:"Convertir un entier en chaîne",en:`<p>On veut réaliser la conversion inverse de l'exercice précédent. Soit un nombre entier positif que l'on veut convertir en une chaîne de caractères C contenant sa représentation décimale.</p><ol><li>Ecrire un algorithme de conversion.</li><li>Ecrire la fonction C correspondante.</li></ol>`,link:"usi-c-memoire",paper:true,sol:`<p>1. Le reste de la division par 10 donne le dernier chiffre, le quotient donne le reste du nombre. Les chiffres sortent donc à l'envers : on compte d'abord combien il y en a, puis on remplit la chaîne en partant de la fin.</p>${TX`nb = nombre de chiffres de n
s[nb] = fin de chaîne
pourChaque (i de nb - 1 à 0, en descendant)
    s[i] = chiffre (n modulo 10)
    n = n / 10`}<p>2. Avec le prototype donné dans le cours, ${k`char* itoa(int, char *);`} :</p>${CC`char *itoa(int n, char *s) {
    int nb = 1;
    for (int m = n; m >= 10; m = m / 10)
        nb++;
    s[nb] = '\0';
    for (int i = nb - 1; i >= 0; i--) {
        s[i] = '0' + n % 10;
        n = n / 10;
    }
    return s;
}`}<p>L'appelant fournit la zone ${k`s`}, assez grande : la fonction écrit dans la zone pointée. Essayé : 2026 donne "2026", 90 donne "90", 0 donne "0".</p>`},
 {id:"57",s:1,note:M,t:"À quoi servent ces conversions ?",en:`<p>Ces algorithmes de conversion (entier vers chaîne, chaîne vers flottant, . . .) sont-ils fréquemment employés ? Précisez à quelles occasions.</p>`,link:"usi-c-memoire",sol:`<p>Oui, en permanence, à chaque entrée et à chaque sortie sous forme de texte.</p><ul><li>Chaîne vers nombre : tout ce qui vient du clavier, de la ligne de commande ou d'un fichier texte est une chaîne. ${k`atoi(argv[1])`}, ${k`scanf("%d")`} ; en Python ${k`int(sys.argv[1])`}.</li><li>Nombre vers chaîne : tout ce qu'on affiche ou qu'on écrit dans un fichier texte. ${k`printf("%d")`} ; en Python ${k`str(total)`}.</li></ul>`},
 {id:"58",s:1,note:M,t:"Compilation séparée : pair et impair",en:`<p>Soit la définition des fonctions suivantes :</p>${CC`int pair(unsigned int i){
  if (i==0)
    return 1;
  else
    return impair(i-1);
}
int impair(unsigned int i){
  if (i==0)
    return 0;
  else
    return pair(i-1);
}`}<ol><li>Créer un fichier pair.c (resp. impair.c) qui contienne la définition de la fonction pair (resp. impair). Créer un fichier pair.h (resp. impair.h) qui contienne la déclaration (prototype) de la fonction pair (resp. impair). Créer un programme principal spair.c qui réalise l'algorithme suivant :${TX`lire l'entier positif n passé à la ligne de commande
si pair(n) alors
  afficher : n est pair !
sinon
  afficher : n est impair !`}Bien entendu, il faut réfléchir au différentes inclusions à réaliser dans les différents fichiers puis compiler les 3 sources .c et lier avec le nom spair et enfin tester ce programme.</li><li>Ecrire un fichier ppair.c contenant les trois fonctions pair(), impair() et main(). Compiler et lier cet unique fichier en un exécutable ppair. Tester ppair.</li></ol>`,link:"usi-c-compil",sol:`<p>1. Chaque fichier inclut la déclaration de la fonction qu'il appelle :</p>${CC`/* pair.h */
int pair(unsigned int i);
/* impair.h */
int impair(unsigned int i);

/* pair.c */
#include "impair.h"
int pair(unsigned int i) {
    if (i == 0) return 1;
    else return impair(i - 1);
}
/* impair.c : pareil, avec #include "pair.h" */

/* spair.c */
#include <stdio.h>
#include <stdlib.h>
#include "pair.h"
int main(int argc, char *argv[]) {
    int n = atoi(argv[1]);
    if (pair(n)) printf("%d est pair !\n", n);
    else printf("%d est impair !\n", n);
    return 0;
}`}${SH`gcc -o spair spair.c pair.c impair.c -Wall
./spair 7        # 7 est impair !`}<p>2. Dans un seul fichier, pair() appelle impair() avant qu'elle soit définie : il faut la ${hl("déclarer")} d'abord (cours : « la déclaration d'une fonction doit précéder son appel »).</p>${CC`#include <stdio.h>
#include <stdlib.h>

int impair(unsigned int i);

int pair(unsigned int i) {
    if (i == 0) return 1;
    else return impair(i - 1);
}

int impair(unsigned int i) {
    if (i == 0) return 0;
    else return pair(i - 1);
}

int main(int argc, char *argv[]) {
    int n = atoi(argv[1]);
    if (pair(n)) printf("%d est pair !\n", n);
    else printf("%d est impair !\n", n);
    return 0;
}`}${SH`gcc -o ppair ppair.c -Wall
./ppair 12       # 12 est pair !`}`},
 {id:"59",s:1,note:M,t:"Le triangle de Pascal",en:`<p>Le triangle de Pascal est un demi tableau qui contient les nombres de combinaisons possibles pour n objets dans p places. La combinaison de 4 objets dans 2 places est notée C(4, 2) et vaut 6. Ce triangle est indicé sur les lignes par n et sur les colonnes par p et est infini :</p>${TX`1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
...`}<p>La valeur de combinaison(n,p) : C(n, p) = n! / (p! (n − p)!)</p><p>On souhaite écrire le programme C qui affiche le triangle jusqu'à la ligne n !</p>${TX`$ triangle 4
1
1   1
1   2   1
1   3   3    1
1   4   6    4    1`}<ol><li>Écrire une première version utilisant la fonction factorielle récursive que vous aurez programmé</li><li>L'affichage étant erroné à partir d'un certain rang, écrire une seconde version en utilisant la programmation dynamique . . . On tiendra compte de l'identité remarquable : pour tout p qui n'est ni 0 ni n, C(n, p) = C(n − 1, p − 1) + C(n − 1, p)</li><li>Prouvez l'identité remarquable utilisée ...</li><li>Pourquoi l'affichage devient-il faux dans la première version ? La deuxième version est-elle plus rapide ?</li></ol><p>(Le TD écrit C avec n en indice et p en exposant ; je l'écris C(n, p).)</p>`,link:"usi-c-memoire",sol:`<p>1. Avec la factorielle du cours :</p>${CC`#include <stdio.h>
#include <stdlib.h>

unsigned int fact(unsigned int i) {
    if (i <= 1) return 1;
    else return i * fact(i - 1);
}

int main(int argc, char *argv[]) {
    int n = atoi(argv[1]);
    for (int i = 0; i <= n; i++) {
        for (int p = 0; p <= i; p++)
            printf("%u ", fact(i) / (fact(p) * fact(i - p)));
        printf("\n");
    }
    return 0;
}`}<p>2. Programmation dynamique : on garde les lignes déjà calculées dans un tableau, et chaque case est la somme des deux cases au-dessus.</p>${CC`#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    int n = atoi(argv[1]);
    unsigned int t[n + 1][n + 1];
    for (int i = 0; i <= n; i++) {
        for (int p = 0; p <= i; p++) {
            if (p == 0 || p == i) t[i][p] = 1;
            else t[i][p] = t[i - 1][p - 1] + t[i - 1][p];
            printf("%u ", t[i][p]);
        }
        printf("\n");
    }
    return 0;
}`}<p>3. On met au même dénominateur p! (n − p)! :</p>${F("C(n − 1, p − 1) + C(n − 1, p) = (n − 1)! / ((p − 1)! (n − p)!) + (n − 1)! / (p! (n − 1 − p)!) = (n − 1)! × (p + (n − p)) / (p! (n − p)!) = n! / (p! (n − p)!)")}<p>4. Un unsigned int tient sur 4 octets : il ne dépasse pas 2³² − 1 = 4 294 967 295. Or 12! = 479 001 600 passe, mais 13! = 6 227 020 800 déborde. La première version est donc fausse à partir de la ligne n = 13 (essayé : elle affiche 1 4 24 88… au lieu de 1 13 78 286…). La seconde ne fait qu'une addition par case, au lieu de trois factorielles : elle est plus rapide, et elle reste juste jusqu'à la ligne 34.</p>`},
 {id:"60",s:1,note:M,t:"strsplit : allocation dynamique",en:`<p>Dans certains fichiers structurés, les articles sont représentés sur une ligne dont les champs sont séparés par un caractère séparateur (fichiers .csv). On souhaite écrire une fonction char **strsplit(const char *s, const char sep) qui découpe une chaîne de caractères correspondant à une ligne csv en un tableau de chaînes dynamiques. Par exemple, l'appel à strsplit("/bin:/usr/bin:/usr/local/bin",':') doit générer le tableau suivant :</p>${TX`0 --> /bin
1 --> /usr/bin
2 --> /usr/local/bin
3 NULL`}<p>On écrira également une fonction main qui lira la chaîne et le séparateur depuis la ligne de commande.</p><ol><li>Ecrire l'algorithme de ce programme.</li><li>Ecrire le programme C correspondant.</li></ol>`,link:"usi-c-memoire",sol:`<p>1. Algorithme :</p>${TX`nb = 1 + nombre de séparateurs dans s
t = allouer un tableau de nb + 1 pointeurs
debut = 0 ; k = 0
pourChaque (position i de s, fin de chaîne comprise)
    si s[i] est le séparateur ou la fin de chaîne
        t[k] = copie des caractères de debut à i - 1
        k++ ; debut = i + 1
t[k] = NULL
retourner t`}<p>2.</p>${CC`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char **strsplit(const char *s, const char sep) {
    int nb = 1;
    for (int i = 0; s[i] != '\0'; i++)
        if (s[i] == sep) nb++;
    char **t = malloc((nb + 1) * sizeof(char *));
    int debut = 0, k = 0;
    for (int i = 0; ; i++) {
        if (s[i] == sep || s[i] == '\0') {
            int lg = i - debut;
            t[k] = malloc(lg + 1);
            strncpy(t[k], s + debut, lg);
            t[k][lg] = '\0';
            k++;
            debut = i + 1;
            if (s[i] == '\0') break;
        }
    }
    t[k] = NULL;
    return t;
}

int main(int argc, char *argv[]) {
    char **t = strsplit(argv[1], argv[2][0]);
    int i;
    for (i = 0; t[i] != NULL; i++)
        printf("%d --> %s\n", i, t[i]);
    printf("%d NULL\n", i);
    return 0;
}`}<p>Chaque ${k`malloc`} réserve une zone dans le tas : une pour le tableau de pointeurs, une par champ (longueur + 1 pour le ${k`'\0'`}). Le NULL final sert de terminateur, comme pour env. Essayé : ${k`./strsplit "/bin:/usr/bin:/usr/local/bin" :`} affiche exactement le tableau de l'énoncé.</p>`},
 /* exercices et exemples du cours de Meynard */
 {id:"B1",s:3,note:"exemple du "+CM,t:"Taille maximale d'un fichier",en:`<p>On prend une table d'inodes classique avec 10 pointeurs directs et un seul pointeur pour chacun des 3 niveaux suivants. Données de base : on suppose que</p><ul><li>la taille des blocs de données est 4Ki octets,</li><li>les adresses sont codées sur 32 bits (4 octets).</li></ul><p>Quelle est la taille maximale d'un fichier ? (La question est de moi : le cours déroule ce calcul comme exemple.)</p>`,link:"usi-taille",who:"Calcul du cours de Meynard",sol:`<ol><li>Taille maximale atteinte par les blocs directs : 10 blocs × 4Ki octets = 40Ki octets.</li><li>Nombre d'adresses contenues dans un bloc : taille bloc / taille adresse, ici 4Ki octets / 4 octets = 1Ki adresses.</li><li>1er niveau : 1 pointeur × 1Ki adresses × 4Ki octets = 4Mi octets.</li><li>2e niveau : 1Ki × 1Ki adresses × 4Ki octets = 4Gi octets.</li><li>3e niveau : 1Ki × 1Ki × 1Ki adresses × 4Ki octets = 4Ti octets.</li></ol><p>Total : 40Kio + 4Mio + 4Gio + 4Tio, qu'on peut approximer à ${hl("4Tio")}.</p>`},
 {id:"B2",s:2,note:"exercice 1 du "+CM,t:"Blocs deux fois plus grands",en:`<p>Si la taille des blocs de données est doublée (à 8Kio) calculer le facteur de multiplication de la taille maximale d'un fichier (approximation).</p>`,link:"usi-taille",who:"Réponse du cours de Meynard (« ∗16 donc 64Tio »), détaillée par moi",sol:`<p>Un bloc de 8 Kio contient 8 Kio / 4 octets = 2 Ki = 2¹¹ adresses. Le 3e niveau atteint (2¹¹)³ = 2³³ blocs de 2¹³ octets : 2⁴⁶ octets = 64 Tio.</p><p>C'est ${hl("16 fois")} plus que 4 Tio : 2 × 2 × 2 pour les trois niveaux d'adresses, et encore 2 pour la taille de chaque bloc.</p>`},
 {id:"B3",s:2,note:"exercice 2 du "+CM,t:"Combien de bits pour la taille ?",en:`<p>Avec des blocs de 4Kio, sur quelle longueur faudrait-il coder la taille du fichier dans la table des inodes, afin de satisfaire la taille atteinte par l'adressage des blocs ?</p>`,link:"usi-taille",who:"Réponse du cours de Meynard (« 42 bits »), détaillée par moi",sol:`<p>4 Tio = 4 × 2⁴⁰ = 2⁴² octets : il faut ${hl("42 bits")} pour écrire toutes les tailles jusque-là.</p>`},
 {id:"B4",s:2,note:"exercice 3 du "+CM,t:"Blocs « volés » à l'espace des données",en:`<p>On considère que les blocs non terminaux (ceux contenant des adresses de blocs) sont "volés" à l'espace des données. Combien de blocs sont ainsi subtilisés avec les blocs de 4Kio et un fichier de taille 4Gio ?</p>`,link:"usi-taille",who:"Réponse du cours de Meynard, détaillée par moi",sol:`<p>Réponse du cours : 4 × 2³⁰ / (4 × 2¹⁰) = 2²⁰ adresses de 4 octets, soit 2²² octets = 4 Mo, soit ${hl("2¹⁰ blocs")}.</p><p>En détail : le fichier occupe 4 Gio / 4 Kio = 2²⁰ blocs de données. Il faut donc ranger 2²⁰ adresses de 4 octets, soit 2²² octets d'adresses. Un bloc fait 2¹² octets : 2²² / 2¹² = 2¹⁰ = 1024 blocs d'adresses, à peu près.</p>`},
 {id:"B5",s:1,note:"exercice 4 du "+CM+" (« plus difficile »)",t:"Passer à des fichiers de 32 Gio",en:`<p>Situation de départ : blocs de 4Kio, taille du fichier codée sur 32 bits. On veut agrandir la capacité maximale d'un fichier et passer à 32Gio. Que peut-on proposer ?</p>`,link:"usi-taille",who:"Réponse du cours de Meynard (« taille sur 35 bits donc 40 bits = 5 oct »), détaillée par moi",sol:`<p>Avec une taille sur 32 bits, un fichier ne dépasse pas 2³² octets = 4 Gio, alors que les blocs permettraient 4 Tio : c'est le champ « taille » qui limite. 32 Gio = 2⁵ × 2³⁰ = 2³⁵ octets : il faut coder la taille sur ${hl("35 bits")}, donc en pratique sur 40 bits = 5 octets.</p>`},
 {id:"C1",s:3,note:"exercice du "+CM,t:"Les changements d'état d'un processus",en:`<p>Les états de base : actif (détient la ressource UC), prêt (seule la ressource UC lui manque), bloqué (manque au moins une autre ressource). Le schéma du cours numérote quatre flèches :</p><ul><li>1 : actif → prêt</li><li>2 : actif → bloqué</li><li>3 : bloqué → prêt</li><li>4 : prêt → actif</li></ul><p>Important : le passage à l'état actif ne peut se faire que par l'état prêt.</p><p><b>Exercice : citer un exemple pour chaque cas de changement d'état.</b></p>`,link:"usi-processus",sol:`<ol><li>Actif → prêt : l'ordonnanceur reprend le processeur au processus pour le donner à un autre (son temps est écoulé, ou un processus plus prioritaire est devenu prêt). Il ne lui manque que le processeur.</li><li>Actif → bloqué : le processus demande une ressource qui n'est pas disponible tout de suite. Il attend une saisie au clavier (${k`read`}, ${k`scanf`}, ${k`input`}), une lecture sur le disque, la fin d'un ${k`sleep`}, ou la fin d'un enfant (bash après avoir lancé ${k`ls`} : wait).</li><li>Bloqué → prêt : ce qu'il attendait arrive. L'utilisateur a tapé Entrée, la lecture est finie, l'enfant s'est terminé. Il ne devient pas actif directement.</li><li>Prêt → actif : l'ordonnanceur l'élit, parce qu'il est le plus prioritaire des processus prêts.</li></ol>`},
 {id:"C2",s:1,note:"« interrogation orale » du "+CM,t:"Le changement de contexte",en:`<p>Rappel du cours, « Déroulement d'un appel noyau » :</p><ol><li>passage du processus actif en mode noyau ;</li><li>exécution de l'appel noyau (appelé aussi routine) ;</li><li>cet appel modifie l'état du processus actif, sauvegarde son contexte ;</li><li>appel de l'ordonnanceur qui procède à l'élection ; remarque : la fonction noyau appelée n'est pas terminée ;</li><li>l'ordonnanceur restaure le contexte du processus élu et le marque actif ;</li><li>fin de l'ordonnanceur (return) dans le contexte du nouvel élu ;</li><li>fin de l'appel ayant provoqué précédemment la suspension de l'élu ;</li><li>passage de l'élu en mode utilisateur et suite de son exécution.</li></ol><p>Questions :</p><ol><li>Expliquer pourquoi la fonction noyau appelée n'est pas terminée ;</li><li>Pour tous les processus en attente, c'est-à-dire tous sauf le processus actif, quel est l'état de leur pile ? quelle est la dernière fonction empilée ?</li><li>Dans quel mode d'exécution se trouvent tous les processus en attente ?</li></ol>`,link:"usi-processus",sol:`<ol><li>Parce que c'est elle qui appelle l'ordonnanceur (étape 4), et que le processus perd le processeur pendant cet appel. Son contexte est sauvegardé alors qu'il est encore au milieu de la fonction noyau. Il ne la finira (étape 7) que le jour où il sera élu de nouveau.</li><li>Leur pile contient encore la fonction noyau qu'ils exécutaient (un appel système ou un gérant d'interruption), et par-dessus l'appel à l'ordonnanceur : la dernière fonction empilée est l'ordonnanceur.</li><li>En mode noyau : ils ont tous été suspendus à l'intérieur d'une fonction du noyau. Ils ne repasseront en mode utilisateur qu'à l'étape 8.</li></ol>`},
 {id:"C3",s:3,note:"exemple du "+CM,t:"Qu'affiche passageparam.c ?",en:`<p>Exemple passageparam.c du cours :</p>${CC`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
void modifieur(int i, char* s, float t[2]){
  i=i+1;
  s[0]='M'; s=NULL;
  t[0]=0.0; t++;
  return;
}
int main(int argc, char* argv[], char* env[]){
  int n=5;
  char* ch=malloc(strlen("bonjour")+1);
  // les chaînes littérales sont const!
  strcpy(ch,"bonjour");
  float compl[2]={1.1,2.2};
  printf("AVANT : n=%d ; ch=%s ; compl={%f,%f}\n", n, ch, compl[0], compl[1]);
  modifieur(n,ch,compl);
  printf("APRES : n=%d ; ch=%s ; compl={%f,%f}\n", n, ch, compl[0], compl[1]);
  return 0;
}`}<p>Qu'affiche ce programme ? (Question posée par moi. Dans le cours, les deux printf affichent aussi les adresses &amp;ch et &amp;compl, qui ne changent pas : je les ai enlevées pour raccourcir.)</p>`,link:"usi-c-memoire",who:"Exécution donnée dans le cours de Meynard",sol:`${TX`AVANT : n=5 ; ch=bonjour ; compl={1.100000,2.200000}
APRES : n=5 ; ch=Monjour ; compl={0.000000,2.200000}`}<ul><li>${k`i=i+1`} : i est une copie de n. n reste 5.</li><li>${k`s[0]='M'`} : s est une copie du pointeur ch, mais elle pointe sur la même zone. La zone est modifiée : Monjour.</li><li>${k`s=NULL`} et ${k`t++`} : on change seulement les copies des pointeurs. ch et compl ne bougent pas.</li><li>${k`t[0]=0.0`} : passer un tableau, c'est passer un pointeur sur sa première case. La case est modifiée : 0.000000.</li></ul>`},
 {id:"C4",s:2,note:"exemple du "+CM,t:"Qu'affichent portee.c et fact.c ?",en:`<p>1. Exemple portee.c du cours. Qu'affiche-t-il ?</p>${CC`#include <stdio.h>
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
}`}<p>2. Exemple fact.c du cours. Que donnent les exécutions ${k`fact`}, puis ${k`fact -65`} suivi de ${k`echo $?`}, puis ${k`fact 12`}, puis ${k`fact toto`} suivi de ${k`echo $?`} ?</p>${CC`#include <stdio.h>
#include <stdlib.h>
unsigned int fact(unsigned int);
int main(int argc, char* argv[], char* env[]){
  if(argc!=2){
    fprintf(stderr, "Syntaxe incorrecte : %s <entier>\n", argv[0]);
    return 1;
  }
  int n=atoi(argv[1]);
  if (n<0){
    fprintf(stderr, "L'argument doit être un entier positif !\n");
    return 2;
  }
  printf("%d!=%d\n",n,fact(n));
  exit(0);  /* ou return  0 */
}
unsigned int fact(unsigned int i){
  if (i<=1)
    return 1;
  else
    return i*fact(i-1);
}`}<p>(Les deux questions sont posées par moi sur des exemples du cours.)</p>`,link:"usi-c-memoire",who:"Exécutions données dans le cours de Meynard",sol:`<p>1.</p>${TX`g=1;g=2;g=3;g=4;
g=A
g=10.200000`}<p>Résolution de portée : on remonte les blocs pour trouver la définition la plus proche. Dans le for, g est l'entier de la boucle ; dans le bloc, c'est le caractère 'A' ; tout à la fin, c'est la variable globale.</p><p>2.</p>${TX`Cours$ fact
Syntaxe incorrecte : fact <entier>
Cours$ fact -65
L'argument doit être un entier positif !
Cours$ echo $?
2
Cours$ fact 12
12!=479001600
Cours$ fact toto
0!=1
Cours$ echo $?
0`}<p>Sans paramètre, argc vaut 1 : message sur la sortie d'erreur et code 1. ${k`atoi("toto")`} renvoie 0 quand la chaîne n'est pas un nombre : le programme calcule donc 0! = 1 et finit avec le code 0.</p>`},
 /* TP et poly de Pompidor */
 {id:"Py1",s:2,note:P+" (familiarisation avec Python)",t:"bonjour.py et ses paramètres",en:`<ol><li>Ecrivez un script Python qui affiche "Bonjour !" (fichier bonjour.py, exécuté par : python3 bonjour.py). Nouvelle version avec deux entêtes supplémentaires : l'une à destination de Bash, l'autre de Python.</li><li>Affichez le premier paramètre du script : modifiez le script pour qu'il vérifie qu'un paramètre lui a bien été passé, et dans l'affirmative, l'affiche après "Bonjour". Rappelez-vous que la liste des paramètres se nomme argv accessible via le module sys. Pour contrôler la présence de paramètres, testez le nombre d'éléments de la liste des paramètres par la fonction len(). Si aucun paramètre n'a été donné au script, affichez un message d'erreur.</li><li>Affichez tous les paramètres du script (boucle for parametre in sys.argv :).</li><li>Affichez tous les paramètres du script sauf le premier : rappelez-vous que l'on peut saucissonner (splicer) une liste !</li></ol>`,link:"usi-py-fichiers",paper:true,sol:`${PY`#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys

if len(sys.argv) < 2:
    print("Il faut un paramètre")
else:
    print("Bonjour", sys.argv[1])

for parametre in sys.argv:        # tous, nom du script compris
    print(parametre)

for parametre in sys.argv[1:]:    # tous sauf le premier
    print(parametre)`}<p>Les deux entêtes sont celles du TP : la première évite de taper python3 (avec ${k`chmod +x bonjour.py`}, on lance ${k`./bonjour.py Pierre`}), la seconde garantit l'encodage utf-8. ${k`sys.argv[0]`} est le nom du script ; ${k`sys.argv[1:]`} est la tranche qui commence à l'indice 1.</p>`},
 {id:"Py2",s:2,note:"poly de Pompidor, § 1.10.3 et 2.3.2",t:"Factorielle en itératif, puis en récursif",en:`<p><b>Factorielle en itératif.</b> Ecrivez le script Python fact.py qui calcule la factorielle d'un nombre entier positif. Ce script doit être écrit en mettant en œuvre une structure <b>itérative</b> et en utilisant le moins de variables possibles. Attention : une valeur saisie au clavier, ou donnée en paramètre au script, est considérée par Python comme étant de type "chaîne de caractères". Pour l'utiliser vous devrez donc la transtyper en entier. (Le TP ajoute : il est important de se rappeler que 0! vaut 1.)</p><p><b>Factorielle en récursif.</b> Ecrivez une nouvelle version du script Python de calcul de factoriel (fact2.py) qui calcule la factorielle d'un nombre entier positif en utilisant <b>une fonction récursive</b>.</p>`,link:"usi-py-bases",paper:true,sol:`<p>fact.py :</p>${PY`import sys
n = int(sys.argv[1])        # transtypage obligatoire

f = 1
for i in range(2, n + 1):
    f *= i
print(f)`}<p>fact2.py :</p>${PY`import sys

def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(int(sys.argv[1])))`}<p>Essayé : 5 donne 120, et 0 donne 1 dans les deux versions (pour 0, la boucle ne fait aucun tour).</p>`},
 {id:"Py3",s:2,note:"poly de Pompidor, § 1.10.4 et 1.10.5",t:"Génération de nombres premiers (np.py, np2.py)",en:`<p><b>Sans utilisation de ceux déjà déterminés.</b> Ecrivez le script Python np.py qui : soit génère les nombres premiers inférieurs à la valeur donnée au script ; soit génère les n premiers nombres premiers, n étant égal à la valeur donnée au script. Attention : la génération des nombres premiers <b>ne doit pas se servir des nombres premiers déjà trouvés</b>.</p><p><b>Avec utilisation de ceux déjà déterminés.</b> Ecrivez enfin une nouvelle version du script Python de génération de nombres premiers (np2.py), <b>en réutilisant les nombres premiers déjà déterminés</b> : pour cela implémenter une liste avec comme seule valeur initiale 2. Essayez de comparer les temps d'exécution de np.py et np2.py avec la commande Unix/linux suivante : <code>time &lt;nom du script&gt;</code></p><p>(Le TP de familiarisation ajoute : modifiez le script précédent pour afficher les n premiers nombres premiers.)</p>`,link:"usi-py-bases",paper:true,sol:`<p>np.py, les nombres premiers inférieurs à n :</p>${PY`import sys
n = int(sys.argv[1])

for i in range(2, n):
    premier = True
    for d in range(2, i):
        if i % d == 0:
            premier = False
    if premier:
        print(i)`}<p>np2.py, avec la liste des premiers déjà trouvés :</p>${PY`import sys
n = int(sys.argv[1])

premiers = [2]
for i in range(3, n):
    premier = True
    for p in premiers:
        if i % p == 0:
            premier = False
            break
    if premier:
        premiers.append(i)
print(premiers)`}<p>Les n premiers nombres premiers : on ne sait pas d'avance jusqu'où aller, donc une boucle while sur la longueur de la liste.</p>${PY`import sys
n = int(sys.argv[1])

premiers = []
i = 2
while len(premiers) < n:
    premier = True
    for p in premiers:
        if i % p == 0:
            premier = False
            break
    if premier:
        premiers.append(i)
    i += 1
print(premiers)`}<p>Essayé : avec 20, les deux premières versions donnent 2, 3, 5, 7, 11, 13, 17, 19 ; avec 10, la dernière affiche [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]. np2.py ne divise que par des nombres premiers et s'arrête au premier diviseur (${k`break`}) : il est plus rapide.</p>`},
 {id:"Py4",s:2,note:"poly de Pompidor, § 2.3.1",t:"Un chiffrement très très naïf",en:`<p>Ecrivez un script Python qui :</p><ul><li>crée un dictionnaire qui associe à quelques lettres une lettre de remplacement (par exemple 'a' correspond à 'y', et 'e' à 'z') (cette initialisation sera donnée en "dur" dans le programme) ;</li><li>complète automatiquement ce dictionnaire pour ajouter les correspondances inverses (dans notre cas 'y' correspond à 'a', et 'z' à 'e') ;</li><li>et affiche la chaîne (donnée en paramètre ou saisie au clavier) ainsi chiffrée.</li></ul><p>Plusieurs problèmes devraient survenir qui seront sans doute résolus par l'utilisation de list().</p>`,link:"usi-py-dico",paper:true,sol:`${PY`import sys
code = {"a": "y", "e": "z"}
for cle in list(code.keys()):    # list() : on modifie code dans la boucle
    code[code[cle]] = cle

lettres = list(sys.argv[1])
for i in range(len(lettres)):
    if lettres[i] in code:
        lettres[i] = code[lettres[i]]
print("".join(lettres))`}<p>Les deux problèmes annoncés : on ne peut pas ajouter des clés à un dictionnaire pendant qu'on le parcourt (d'où ${k`list(code.keys())`}, une copie de la liste des clés), et une chaîne ne se modifie pas (d'où ${k`list(sys.argv[1])`}, puis ${k`"".join`}). Essayé : « le chat mange » donne « lz chyt myngz ».</p>`},
 {id:"Py5",s:3,note:P+" n° 1",t:"Le fameux quizz sur les capitales",en:`<p>Ecrivez un script Python qui crée un quizz sur les capitales. Voici les spécifications du script :</p><ul><li>le nombre de questions doit être donné en paramètre au script</li><li>le fichier nommé capitales.csv des pays/capitales est à récupérer sur le Moodle, en voici un fragment :${TX`Afghanistan (l'),Kaboul
Afrique du Sud (l'),Prétoria
Albanie (l'),Tirana`}</li><li>les noms des pays et des capitales doivent être initialement recopiés dans <b>deux listes</b> (pour ne pas être obligé de relire constamment le fichier)</li><li>chaque pays doit être choisi aléatoirement : pour cela utilisez la fonction randint() du module random : random.randint(m, n) renvoie un entier compris entre m et n</li><li>le score de l'internaute doit être affiché : en nombre de bonnes réponses, en pourcentage de bonnes réponses</li><li>et si vous avez le temps, améliorez le script pour : qu'une question ne soit pas reposée lors d'une même session de test ; que l'on puisse aussi choisir de trouver les noms de pays à partir de leurs capitales : dans ce cas-là le script serait appelé avec un second paramètre (par exemple nommé inv).</li></ul>`,link:"usi-py-fichiers",paper:true,sol:`${PY`import sys, random

pays, capitales = [], []
with open("capitales.csv") as fd:
    for ligne in fd:
        champs = ligne.strip().split(",")
        pays.append(champs[0])
        capitales.append(champs[1])

if len(sys.argv) > 2 and sys.argv[2] == "inv":
    pays, capitales = capitales, pays      # on échange les deux listes

n = int(sys.argv[1])
score = 0
dejaPosees = []
for q in range(n):
    i = random.randint(0, len(pays) - 1)
    while i in dejaPosees:                 # pas deux fois la même question
        i = random.randint(0, len(pays) - 1)
    dejaPosees.append(i)
    reponse = input(pays[i] + " ? ")
    if reponse == capitales[i]:
        score += 1
    else:
        print("Non :", capitales[i])
print(score, "bonnes réponses sur", n, ":", 100 * score / n, "%")`}<p>Le pays et sa capitale sont au même indice dans les deux listes. ${k`random.randint(0, len(pays) - 1)`} : les deux bornes sont comprises, d'où le − 1. Essayé avec le fragment de trois lignes, dans les deux sens.</p>`},
 {id:"Py6",s:3,note:P+" n° 2",t:"Exploration d'une arborescence de dossiers (indexation.py)",en:`<p>Ecrivez un script nommé indexation.py qui lancé avec comme paramètre un nom de répertoire, indexe les fichiers qui se trouvent dans l'arborescence définie par ce répertoire suivant leurs suffixes. Ce script comportera <b>une fonction récursive</b> (càd qui s'appelle elle-même) qui sera appelée sur chaque répertoire de l'arborescence. Je vous rappelle la structure générale du programme :</p>${TX`import os, sys
...
def parcours (rep) :
    print "Je suis dans "+rep
    liste = os.listdir(rep)
    for fichier in liste :
        if os.path.isdir(...) :
            ...
        else :
            ...

parcours (sys.argv[1])       # Appel initial de la fonction récursive`}<p>Exemple. Soient les répertoires suivants (le TP les dessine en arbre) :</p>${TX`rep1
  bye.sh
  nihao.pl
  rep2
    bonjour.h
    bonjour.cc
  rep3
    adieu.java
    adieu.class
    hi
    rep4
      buenos_dias.java
      buenos_dias.class`}<p>l'appel suivant : python3 indexation.py rep1 va afficher :</p>${TX`.sh : ['rep1/bye.sh']
.h : ['rep1/rep2/bonjour.h']
.cc : ['rep1/rep2/bonjour.cc']
.java : ['rep1/rep3/adieu.java', 'rep1/rep3/rep4/buenos_dias.java']
.class : ['rep1/rep3/adieu.class', 'rep1/rep3/rep4/buenos_dias.class']
.pl : ['rep1/nihao.pl']
pas de suffixe : ['rep1/rep3/hi']
TOTAL : 9`}<p>Complétez ce programme pour que l'utilisateur, tant qu'il le souhaite, puisse saisir une chaîne de caractères et un nombre arbitraire d'extensions et que le programme puisse afficher les lignes des fichiers (qui ayant une de ces extensions) contiennent la chaîne de caractères.</p>`,link:"usi-py-parcours",paper:true,sol:`${PY`import os, sys
index = {}

def parcours(rep):
    liste = os.listdir(rep)
    for fichier in liste:
        chemin = rep + "/" + fichier
        if os.path.isdir(chemin):
            parcours(chemin)
        else:
            morceaux = fichier.split(".")
            if len(morceaux) > 1:
                suffixe = "." + morceaux[-1]
            else:
                suffixe = "pas de suffixe"
            if suffixe in index:
                index[suffixe].append(chemin)
            else:
                index[suffixe] = [chemin]

parcours(sys.argv[1])
total = 0
for suffixe in index:
    print(suffixe, ":", index[suffixe])
    total += len(index[suffixe])
print("TOTAL :", total)`}<p>C'est exactement la forme des grosses questions de janvier 2025 et janvier 2026. Essayé sur l'arborescence de l'exemple : les mêmes lignes et TOTAL : 9 (l'ordre des lignes dépend de l'ordre dans lequel listdir donne les noms). La ligne ${k`print "Je suis dans "+rep`} du squelette est du vieux Python : aujourd'hui, print prend des parenthèses.</p><p>La suite, à ajouter à la fin :</p>${PY`saisie = input("Chaîne puis extensions (rien pour arrêter) : ")
while saisie != "":
    mots = saisie.split(" ")
    chaine = mots[0]
    for extension in mots[1:]:
        if "." + extension in index:
            for chemin in index["." + extension]:
                fd = open(chemin)
                for ligne in fd:
                    if chaine in ligne:
                        print(chemin, ":", ligne.strip())
                fd.close()
    saisie = input("Chaîne puis extensions (rien pour arrêter) : ")`}<p>On tape par exemple ${k`class java cc`} : la chaîne class est cherchée dans les fichiers .java et .cc de l'index. Une ligne vide arrête la boucle.</p>`},
 {id:"Py7",s:1,note:P+" n° 2, bonus",t:"Jours de connexion des utilisateurs (commande last)",en:`<p>En utilisant la commande last écrire un script python qui liste les jours de connexion des utilisateurs qui ont fréquenté cette machine.</p><p>Imaginons que le résultat de la commande last soit :</p>${TX`pompidor pts/0           :0                Wed Oct 25 13:00 - still logged in
pompidor pts/0           193.52.27.135     Tue Oct 24 08:19 - down   (02:10)
meynard :0                                 Tue Oct 24 08:18 - 10:19 (02:01)
pompidor pts/2           :0                Mon Oct 23 12:27 - 13:09 (00:42)
pompidor pts/1           :0                Mon Oct 23 11:55 - 13:30 (01:35)
pompidor pts/0           :0                Mon Oct 23 11:49 - down   (01:56)
meynard pts/0            :0                Mon Oct 23 11:37 - 11:39 (00:02)
pompidor pts/1           :0                Mon Oct 23 11:07 - down   (00:07)`}<p>Le résultat de l'appel python3 connexions.py serait :</p>${TX`pompidor s'est connecté les : 25 Oct (1 fois), 24 Oct (1 fois), 23 Oct (4 fois)
meynard s'est connecté les : 24 Oct (1 fois), 23 Oct (1 fois)`}<p>Réalisez ce programme en étapes : récupérez le résultat de la commande dans votre script ; mettez en place progressivement l'expression régulière qui extrait le login, le nom du mois et le numéro du jour dans le mois (la date) ; affichez le nombre de connexions par login et par date (via un dictionnaire de dictionnaires).</p><p>(Le TP demande aussi les heures, les minutes et des alertes : je m'arrête à l'affichage de l'exemple. Moodle donne un fichier « last » qui simule la commande.)</p>`,link:"usi-regex",sol:`${PY`import re
connexions = {}
for ligne in open("last"):       # sur une vraie machine : os.popen("last")
    r = re.search(r"^(\S+) .* \w{3} (\w{3}) +(\d+) \d\d:\d\d", ligne)
    if r:
        login = r.group(1)
        date = r.group(3) + " " + r.group(2)
        if login not in connexions:
            connexions[login] = {}
        if date in connexions[login]:
            connexions[login][date] += 1
        else:
            connexions[login][date] = 1

for login in connexions:
    morceaux = []
    for date in connexions[login]:
        morceaux.append(date + " (" + str(connexions[login][date]) + " fois)")
    print(login, "s'est connecté les :", ", ".join(morceaux))`}<p>Les parenthèses de l'expression régulière capturent trois morceaux, lus avec ${k`group(1)`}, ${k`group(2)`}, ${k`group(3)`} : le login (${k`\S+`} : des caractères qui ne sont pas des espaces), le mois (${k`\w{3}`} : trois lettres) et le jour (${k`\d+`}). Le dictionnaire range, pour chaque login, un autre dictionnaire date → nombre. Essayé sur l'exemple : exactement les deux lignes attendues ; et sur le fichier de Moodle, où les logins sont des adresses complètes.</p>`},
 {id:"Py8",s:1,note:P+" n° 4",t:"Indexation arborescente de mots",en:`<p>Le but du TP est d'indexer les mots extraits de différents fichiers sous une forme arborescente (l'arbre étant implémenté sous la forme d'une imbrication de dictionnaires). Imaginons que nous avons les trois mots suivants à indexer : chat, canard et cane, l'index créé aurait cette structure (sans références aux fichiers contenant ces mots) :</p>${TX`{'c':
    {'h':
         {'a':
              {'t': {}}
         },
    'a':
         {'n':
              {'a':
                   {'r':
                        {'d': {}}
                   },
              'e': {}
              }
         }
    }
}`}<p>Première étape : indexeur.py prend en paramètres une suite de mots et crée l'index. Des fonctions récursives à programmer : tant que les premiers caractères du mot à indexer sont dans l'index, descente dans celui-ci ; les caractères suivants ne sont pas dans l'index : création des dictionnaires imbriqués.</p><p>(La seconde étape du TP, indexeur_2.py avec des noms de fichiers, n'est pas corrigée ici.)</p>`,link:"usi-py-dico",sol:`${PY`import sys
index = {}

def ajoute(noeud, mot):
    if mot == "":
        return
    if mot[0] not in noeud:
        noeud[mot[0]] = {}           # création d'un niveau
    ajoute(noeud[mot[0]], mot[1:])   # descente d'un niveau

for mot in sys.argv[1:]:
    ajoute(index, mot)
print(index)`}<p>Une seule fonction récursive fait les deux gestes : si la première lettre n'est pas encore là, on crée son dictionnaire ; puis on descend dedans avec le reste du mot (${k`mot[1:]`}). Essayé avec chat canard cane : ${k`{'c': {'h': {'a': {'t': {}}}, 'a': {'n': {'a': {'r': {'d': {}}}, 'e': {}}}}}`}, la structure de l'énoncé.</p>`},
 {id:"Py9",s:1,note:"poly de Pompidor, § 5.3 (peu probable à l'examen)",t:"Modélisation de titres musicaux : classes Titre et Album",en:`<p>Nous voulons créer des albums de musique composés de titres musicaux.</p><p><b>Création de la classe Titre et des titres.</b> Votre script Python doit définir une classe Titre de telle sorte que ces lignes de codes puissent fonctionner :</p>${PY`lEncreDeTesYeux = Titre("L'encre de tes yeux", "Cabrel", 187)
laDameDeHauteSavoie = Titre("La dame de Haute Savoie", "Cabrel", 182)
jePenseEncoreAToi = Titre("Je pense encore à toi", "Cabrel", 190)`}<p>Le troisième paramètre correspond à la durée du titre en secondes.</p><p><b>Création de la classe Album et des albums.</b> Votre script Python doit définir une classe Album de telle sorte que ces lignes de codes puissent fonctionner (les lignes en commentaires correspondent à l'affichage des appels de méthodes) :</p>${PY`fragile = Album(lEncreDeTesYeux, laDameDeHauteSavoie, jePenseEncoreAToi)

fragile.nbTitres();
# 3
fragile.duree();
# 579 secondes`}`,link:"usi-py-bases",sol:`${PY`class Titre:
    def __init__(self, nom, artiste, duree):
        self.nom = nom
        self.artiste = artiste
        self.duree = duree

class Album:
    def __init__(self, *titres):   # nombre variable de paramètres
        self.titres = titres
    def nbTitres(self):
        print(len(self.titres))
    def duree(self):
        total = 0
        for t in self.titres:
            total += t.duree
        print(total, "secondes")`}<p>${k`__init__`} est appelée à la création de l'objet ; ${k`self`} est l'objet lui-même. Essayé avec les trois titres de l'énoncé : le script affiche 3, puis 559 secondes. Le poly annonce 579, mais 187 + 182 + 190 fait bien 559 : c'est une coquille du poly.</p>`},
 /* entraînements au format de l'examen */
 {id:"X1",s:3,note:X,t:"find : trois recherches",en:`<p>Donne la commande qui :</p><ol><li>cherche depuis le dossier courant les fichiers dont le nom finit par .log ;</li><li>cherche depuis le dossier d'accueil les répertoires dont le nom commence par « tp » ;</li><li>affiche le contenu de tous les fichiers .csv à partir du dossier courant.</li></ol>`,link:"usi-find",sol:`${SH`find . -name "*.log"
find ~ -type d -name "tp*"
find . -name "*.csv" -exec cat {} \;`}`},
 {id:"X2",s:3,note:X,t:"Expressions régulières : quatre formes",en:`<p>Donne l'expression régulière qui vérifie qu'une chaîne :</p><ol><li>ne contient que des lettres minuscules ;</li><li>est un numéro de 10 chiffres qui commence par 0 ;</li><li>est une date jj/mm/aaaa ;</li><li>finit par .py ou .sh.</li></ol>`,link:"usi-regex",sol:`${TX`^[a-z]+$
^0[0-9]{9}$
^[0-9]{2}/[0-9]{2}/[0-9]{4}$
\.(py|sh)$`}<p>Avec grep, utilise ${k`grep -E`} pour ${k`+`}, ${k`{}`}, ${k`|`} et les parenthèses.</p>`},
 {id:"X3",s:3,note:X,t:"Bash : compter les .py d'un dossier",en:`<p>Écris un script Bash qui affiche le nombre de fichiers d'extension .py du dossier passé en paramètre, <b>sans utiliser ls ni wc</b>.</p>`,link:"usi-bash-scripts",paper:true,sol:`${SH`#!/bin/bash
n=0
for f in $1/*.py
do
    if [[ -f "$f" ]]
    then
        n=$((n+1))
    fi
done
echo $n`}<p>Le ${k`-f`} évite de compter le motif lui-même quand il n'y a aucun fichier .py (bash laisse alors ${k`$1/*.py`} tel quel). Essayé : 2 pour un dossier avec a.py, b.py et c.txt, 0 pour un dossier vide.</p>`},
 {id:"X4",s:3,note:X,t:"Bash : sous-dossiers et renommage",en:`<ol><li>Écris un script qui affiche les noms des sous-dossiers du dossier courant.</li><li>Écris un script qui ajoute l'extension .bak à tous les fichiers réguliers du dossier passé en paramètre.</li></ol>`,link:"usi-bash-ctrl",paper:true,sol:`${SH`for f in *
do
    if [[ -d "$f" ]]
    then
        echo "$f"
    fi
done`}${SH`for f in $1/*
do
    if [[ -f "$f" ]]
    then
        mv "$f" "$f.bak"
    fi
done`}`},
 {id:"X5",s:2,note:X,t:"Python : maximum et moyenne sans max()",en:`<p>Écris une fonction maximum(liste) <b>sans utiliser max()</b>, puis une fonction moyenne(liste).</p>`,link:"usi-py-bases",paper:true,sol:`${PY`def maximum(liste):
    m = liste[0]
    for v in liste:
        if v > m:
            m = v
    return m

def moyenne(liste):
    somme = 0
    for v in liste:
        somme += v
    return somme / len(liste)`}<p>Essayé : maximum([3, 9, 2]) vaut 9, moyenne([3, 9, 3]) vaut 5.0.</p>`},
 {id:"X6",s:3,note:X,t:"Python : compter les mots d'un fichier",en:`<p>Écris un script qui lit le fichier passé en paramètre et crée un dictionnaire mots : chaque mot (séparé par des espaces) en clé, son nombre d'apparitions en valeur. Affiche le mot le plus fréquent.</p>`,link:"usi-py-dico",paper:true,sol:`${PY`import sys
mots = {}
with open(sys.argv[1]) as fd:
    for ligne in fd:
        for mot in ligne.strip().split(" "):
            if mot == "":
                continue
            if mot in mots:
                mots[mot] += 1
            else:
                mots[mot] = 1

meilleur = ""
for mot in mots:
    if meilleur == "" or mots[mot] > mots[meilleur]:
        meilleur = mot
print(meilleur, mots[meilleur])`}<p>${k`continue`} passe au tour suivant : il saute les « mots » vides que donnent deux espaces de suite.</p>`},
 {id:"X7",s:3,note:X,t:"Python : fichiers par dossier, récursivement",en:`<p>Écris un script qui parcourt <b>récursivement</b> le dossier passé en paramètre (<b>sans os.walk</b>) et crée un dictionnaire nbFichiers : chaque dossier en clé, son nombre de fichiers réguliers en valeur. Écris ensuite le résultat dans bilan.txt, une ligne par dossier.</p>`,link:"usi-py-parcours",paper:true,sol:`${PY`import os, sys
nbFichiers = {}

def parcours(dossier):
    nbFichiers[dossier] = 0
    for nom in os.listdir(dossier):
        chemin = dossier + os.sep + nom
        if os.path.isdir(chemin):
            parcours(chemin)
        else:
            nbFichiers[dossier] += 1

parcours(sys.argv[1])
fd = open("bilan.txt", "w")
for dossier in nbFichiers:
    fd.write(dossier + " : " + str(nbFichiers[dossier]) + "\n")
fd.close()`}<p>${k`str()`} est obligatoire : on ne colle pas une chaîne et un entier avec +.</p>`}];

/* ---------- annales : la partie de Pierre Pompidor (10 points), corrigés officiels réécrits ---------- */
const MOI="Corrigé écrit par moi (pas de corrigé officiel pour cette session)";
const OFF="Corrigé officiel de Pierre Pompidor";
const ann=[
 {src:"Janvier 2026 · question 1 (2 points)",t:"Les fichiers .jpg ou .jpeg du dossier courant",en:`<p>Donnez une commande linux qui <b>en utilisant une expression régulière</b> affiche les noms de fichiers du dossier courant qui se terminent par .jpg ou .jpeg.</p>`,go:"usi-regex",who:OFF+", avec deux corrections signalées",sol:`${SH`ls | grep -E "\.jpe?g$"
ls | grep -E "\.(jpg|jpeg)$"
ls | grep -E "\.jpe*g$"     # laisse aussi passer jpeeg, jpeeeg…`}<p>${k`\.`} est un vrai point, ${k`?`} rend le e facultatif, ${k`$`} colle à la fin du nom.</p><p>Deux différences avec le corrigé officiel. Il écrit ${k`grep`} sans ${k`-E`} : sur les machines de la fac, ${k`?`} et ${k`|`} ne marchent qu'avec ${k`grep -E`} (ou ${k`egrep`}), comme le corrigé de 2022 le dit pour ${k`+`}. Et deux de ses lignes ont une parenthèse fermante en trop (${k`"\.jpe?g)$"`}) : c'est une coquille.</p>`},
 {src:"Janvier 2026 · question 2 (2 points)",t:"Préfixer par old les fichiers .txt",en:`<p>Ecrire un script Bash qui ajoute le préfixe "old" avant tous les fichiers d'extension ".txt" du dossier courant.</p>`,go:"usi-bash-scripts",who:OFF,sol:`${SH`for fichier in *.txt
do
    mv "$fichier" "old$fichier"
done`}<p>${k`*.txt`} est remplacé par bash par la liste des fichiers du dossier courant qui finissent par .txt. Renommer, c'est ${k`mv`}.</p>`},
 {src:"Janvier 2026 · question 3 (6 points)",t:"Statistiques d'images : CSV, dictionnaire, parcours récursif",en:`<p>Soit un fichier nommé images.csv comptabilisant des images et dont voici un exemple :</p>${TX`jpg,png,gif,webp
10,25,0,12`}<p>Ecrire un script python qui crée un dictionnaire <b>nommé statistiques</b> avec comme clefs les extensions apparaissant dans le fichier et comme valeurs leurs nombres</p><p>puis qui parcourt <b>avec une fonction récursive</b> tous les sous-dossiers d'un dossier donné en paramètre pour mettre à jour le dictionnaire à chaque fois qu'un fichier ayant comme extension une clef du dictionnaire est rencontré.</p>`,go:"usi-py-parcours",who:OFF+", avec le nom de dictionnaire de l'énoncé",sol:`${PY`import os, sys

statistiques = {}
with open("images.csv") as fd:
    lignes = fd.readlines()   # avec for ligne in fd, il faudrait un booléen
                              # pour distinguer les deux lignes
    images = lignes[0].strip().split(",")
    nombres = lignes[1].strip().split(",")
    for i in range(len(images)):
        statistiques[images[i]] = int(nombres[i])

def parcours(dossier):
    fichiers = os.listdir(dossier)
    for fichier in fichiers:
        if os.path.isdir(dossier + os.path.sep + fichier):   # ou dossier + "/" + fichier
            parcours(dossier + os.path.sep + fichier)
        else:
            data = fichier.split(".")
            if len(data) > 1 and data[-1] in statistiques:
                statistiques[data[-1]] += 1

parcours(sys.argv[1])
print(statistiques)`}<p>Le corrigé officiel appelle le dictionnaire ${k`dico`} et n'écrit pas la ligne ${k`import os, sys`} : ici il porte le nom imposé par l'énoncé, et l'import est là, sinon le script ne tourne pas.</p><p>Essai : avec l'exemple et un dossier qui contient a.jpg, s1/b.png et s1/s2/c.jpg, le script affiche ${k`{'jpg': 12, 'png': 26, 'gif': 0, 'webp': 12}`}.</p>`},
 {src:"Janvier 2025 · questions 1 et 2 (1 + 1 point)",t:"find, et l'expression régulière de deux entiers séparés par un point",en:`<ol><li>Donnez la commande qui recherche à partir du dossier parent les fichiers dont le nom contient la chaîne "DATA".</li><li>Donnez l'expression régulière qui vérifie qu'une chaîne ne contient que deux nombres entiers séparés par un point.</li></ol>`,go:"usi-find",who:OFF,sol:`<p>1. Recherche (1 point) :</p>${SH`find .. -name "*DATA*"
ls -R .. | grep DATA     # accepté mais douteux`}<p>2. Expression régulière (1 point) :</p>${TX`^\d+\.\d+$
^[0-9]+\.[0-9]+$
^[0-9]{1,}\.[0-9]{1,}$`}<p>${k`^`} et ${k`$`} parce que la chaîne ne doit contenir <b>que</b> cela ; ${k`\.`} pour un vrai point.</p>`},
 {src:"Janvier 2025 · question 3 (2,5 points)",t:"Supprimer les .txt du dossier passé en paramètre",en:`<p>Ecrire un script Bash qui supprime les fichiers d'extension .txt du dossier dont le nom lui a été passé en paramètre.</p><p><b>(Aucune commande ne peut être utilisée hormis ls).</b></p>`,go:"usi-bash-scripts",who:OFF,sol:`<p>La solution la plus directe :</p>${SH`rm $1/*.txt`}<p>Avec le schéma de programmation qui isole dans une variable chaque nom de fichier :</p>${SH`for f in $(ls $1)
do
    if [[ $1/$f == *.txt ]]      # [ $1/$f = *.txt ] accepté
    then
        rm $1/$f
    fi
done`}<p>${k`ls $1`} donne des noms seuls : pour supprimer, il faut le chemin ${k`$1/$f`}. « Aucune commande hormis ls » vise les commandes de recherche (find, grep) : ${k`rm`} reste nécessaire pour supprimer, et le corrigé l'utilise.</p>`},
 {src:"Janvier 2025 · question 4 (5,5 points)",t:"Les systèmes d'exploitation de parcs d'ordinateurs",en:`<p>Différents fichiers csv contiennent des informations sur les systèmes installés sur différents parcs d'ordinateurs.</p><p>Ecrire un script python qui crée un dictionnaire <b>nommé systèmes</b>, recherche <b>récursivement</b> tous les fichiers d'extension .csv et crée comme clefs dans le dictionnaire les différents systèmes d'exploitation qui y sont mentionnés. Les valeurs correspondantes à ces clefs sont des listes contenant les différents ordinateurs qui possèdent ces systèmes.</p><p>Par exemple, premières lignes du fichier parc1.csv :</p>${TX`PC1,windows11,ubuntu-NobleNumbat
PC2,windows11,ubuntu-NobleNumbat
PC3,windows11,ubuntu-JammyJellyfish
...`}<p>Premières lignes du fichier salles/parc2.csv :</p>${TX`PC41,ubuntu-JammyJellyfish
PC42,ubuntu-JammyJellyfish
...`}<p>Pour cet exemple le contenu du dictionnaire serait celui-ci :</p>${TX`{'windows11':['PC1','PC2','PC3',...],
'ubuntu-NobleNumbat':['PC1','PC2',...],
'ubuntu-JammyJellyfish':['PC3','PC41','PC42',...]}`}<p><b>(Les fonctions popen() et walk() du module os ou du module subprocess ne peuvent pas être utilisées.)</b></p>`,go:"usi-py-parcours",who:OFF+", avec une erreur corrigée et signalée",sol:`${PY`import os, sys

systèmes = {}                                    # 0,5 point

def parcours(rep):                               # récursivité : 1 point
    liste = os.listdir(rep)                      # 0,5 point
    for fichier in liste:
        if os.path.isdir(rep + os.sep + fichier):
            parcours(rep + os.sep + fichier)     # ou rep + "/" + fichier
        else:
            if ".csv" in fichier:                # 0,5 point
                fd = open(rep + os.sep + fichier)        # 0,5 point
                for ligne in fd:                         # 0,5 point
                    data = ligne.strip().split(",")      # 0,5 point
                    ordi = data[0]                       # 0,5 point
                    for système in data[1:]:
                        if système in systèmes:
                            systèmes[système].append(ordi)   # 0,5 point
                        else:
                            systèmes[système] = [ordi]       # 0,5 point

parcours(sys.argv[1])    # aucun paramètre, "." ou os.getcwd() acceptés`}<p><b>Une erreur dans le corrigé officiel.</b> Il teste ${k`os.path.isdir(fichier)`}, avec le nom seul. Cela ne marche que pour le dossier où tourne le script : dans un sous-dossier, le nom seul n'est plus un chemin valable, et les sous-sous-dossiers sont pris pour des fichiers. Il faut tester le chemin complet ${k`rep + os.sep + fichier`}, comme ci-dessus (et comme le corrigé de 2026).</p><p>Pour reconnaître un .csv, le corrigé accepte ${k`".csv" in fichier`} ou ${k`re.search("\.csv$", fichier)`}. Python accepte les accents dans les noms de variables : ${k`systèmes`} est le nom demandé.</p>`},
 {src:"Juin 2025 (session 2) · questions 1 et 2 (1,5 + 1,5 point)",t:"Supprimer les fichiers en #, lignes avec une adresse IP",en:`<ol><li>(1.5 point) Donnez une commande qui supprime à partir du dossier d'accueil (c'est à dire y compris dans les sous-dossiers) tous les fichiers dont les noms se terminent par #</li><li>(1.5 point) Donnez la commande qui affiche les lignes d'un fichier nommé log.txt dans lesquelles apparaîssent au moins une adresse IP numérique (approximativement quatre nombres entiers séparés par des points).</li></ol>`,go:"usi-find",who:MOI,sol:`${SH`find ~ -name "*#" -exec rm {} \;
grep -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" log.txt`}<p>1. ${k`~`} est le dossier d'accueil, et find descend tout seul dans les sous-dossiers. ${k`-exec rm {} \;`} lance rm sur chaque fichier trouvé (${k`find ~ -name "*#" -delete`} marche aussi).</p><p>2. Pas de ${k`^`} ni de ${k`$`} : l'adresse peut être n'importe où dans la ligne. ${k`-E`} est nécessaire pour ${k`+`}.</p>`},
 {src:"Juin 2025 (session 2) · question 3 (2,5 points)",t:"Numéroter tous les fichiers, sans fonction récursive",en:`<p>(2.5 points) Ecrire un script Bash qui parcourt tous les dossiers à partir du dossier dans lequel ce script est exécuté et préfixe le nom de chaque fichier régulier rencontré par un numéro d'ordre commençant à 1.</p><p><b>(Ce script ne doit pas utiliser de fonction récursive).</b></p>`,go:"usi-bash-scripts",who:MOI,sol:`${SH`num=1
for f in $(find . -type f)
do
    dossier=$(dirname $f)
    nom=$(basename $f)
    mv $f $dossier/$num$nom
    num=$((num+1))
done`}<p>Sans fonction récursive, c'est ${k`find`} qui descend dans les dossiers ; ${k`-type f`} ne garde que les fichiers réguliers. ${k`dirname`} et ${k`basename`} (cours de Meynard) coupent un chemin en dossier et en nom : ${k`./a/b.txt`} donne ${k`./a`} et ${k`b.txt`}. La liste de find est calculée avant la boucle, donc un fichier renommé n'est pas revu.</p><p>Essai : avec x.txt, a/y.txt et a/b/z.txt, on obtient 1x.txt, a/2y.txt et a/b/3z.txt.</p>`},
 {src:"Juin 2025 (session 2) · question 4 (4,5 points)",t:"Écrire la liste des fichiers d'une arborescence",en:`<p>(4.5 points) Ecrire un script Python qui crée un fichier nommé listeDesFichiers.txt puis parcourt tous les dossiers à partir de celui qui lui est donné en paramètre et inscrit le nom de chaque fichier régulier dans le fichier précédemment créé. Le nombre total de fichiers retrouvés doit être aussi inscrit dans le fichier.</p><p><b>(Vous ne pouvez pas utiliser la méthode os.walk())</b></p><p>Pour écrire dans le fichier de descripteur fd, utilisez la méthode fd.write()</p>`,go:"usi-py-parcours",who:MOI,sol:`${PY`import os, sys

fd = open("listeDesFichiers.txt", "w")

def parcours(dossier):
    n = 0
    for nom in os.listdir(dossier):
        chemin = dossier + os.sep + nom
        if os.path.isdir(chemin):
            n += parcours(chemin)
        elif os.path.isfile(chemin):
            fd.write(nom + "\n")
            n += 1
    return n

total = parcours(sys.argv[1])
fd.write("Nombre de fichiers : " + str(total) + "\n")
fd.close()`}<p>La fonction renvoie combien de fichiers elle a trouvés : chaque appel ajoute ceux de ses sous-dossiers. Ne pas oublier ${k`"\n"`} (write ne va pas à la ligne tout seul), ${k`str()`} (on ne colle pas une chaîne et un entier) et ${k`fd.close()`}.</p>`},
 {src:"Janvier 2024 · questions 1 et 2",t:"find, et l'expression régulière « deux points, et seulement deux »",en:`<ol><li>Donnez la commande qui recherche à partir du dossier courant tous les fichiers dont les noms commencent par "2023".</li><li>Donnez l'expression régulière qui vérifie qu'une chaîne contient deux fois <b>(et seulement deux fois)</b> le caractère point (.).</li></ol>`,go:"usi-regex",who:OFF,sol:`<p>1. Recherche :</p>${SH`find . -name "2023*"
ls -R | grep "^2023"     # ligne de commande légèrement moins bonne`}<p>2. Expression régulière (deux et seulement deux points) :</p>${TX`^[^.]*\.[^.]*\.[^.]*$`}<p>${k`[^.]*`} veut dire « des caractères qui ne sont pas des points, peut-être aucun ». Le corrigé précise : ${k`^.*\..*\..*$`} n'est « pas vraiment correct », car il autorise plus de deux points.</p>`},
 {src:"Janvier 2024 · questions 3 et 4",t:"Afficher les lignes d'un fichier, puis sommer le premier champ",en:`<ol start="3"><li>Ecrire un script Bash qui affiche une à une <b>(c'est à dire grâce à une boucle)</b> toutes les lignes d'un fichier dont le nom lui est passé en paramètres.</li><li>Imaginons que les fichiers fournis au script précédent soient des CSV et que les premiers champs de chaque ligne soient des nombres, complétez le code du script précédent pour que celui-ci fasse la somme de ces nombres et l'affiche.</li></ol>`,go:"usi-bash-scripts",who:OFF,sol:`<p>Script Bash (regroupement des deux parties) :</p>${SH`somme=0
for ligne in $(cat $1)   # il est possible d'utiliser $@
do
    echo $ligne
    nombre=$(echo $ligne | cut -d, -f1)
    somme=$((somme+nombre))
done
echo $somme`}<p>Pour la question 3 seule : les lignes ${k`for`}, ${k`do`}, ${k`echo $ligne`} et ${k`done`}.</p><p>Remarque de ma part : ${k`for ligne in $(cat $1)`} coupe aussi aux espaces. Si les lignes peuvent en contenir, ${k`while read ligne`} … ${k`done < $1`} lit vraiment ligne par ligne.</p><p>Essai : avec un fichier de trois lignes 3,a puis 4,b puis 10,c, le script affiche les trois lignes puis 17.</p>`},
 {src:"Janvier 2024 · questions 5 à 7",t:"palindrome(), un dictionnaire de modèles, lister un dossier",en:`<ol start="5"><li>Donnez le code d'une fonction écrite en Python nommée palindrome() qui vérifie si la chaîne de caractères d'au moins deux caractères qui est passée en paramètre forme le même mot lu de gauche à droite ou de droite à gauche. Par exemple elle renverrait "True" si cette chaîne de caractères a pour valeur "radar" ou "ressasser". <b>Vous n'avez pas le droit d'utiliser la méthode reverse()</b> mais vous pouvez vous rappeler qu'une chaîne de caractères peut se manipuler comme une liste...</li><li>Soit un fichier f.txt dont les premières lignes pourraient être :${TX`DELL Precision=25,Lenovo M900=15
DELL Precision=20,Lenovo M900=20
Lenovo M900=15,HP Pavillon=12,Lenono M900=13
...`}donnez le code Python qui crée un dictionnaire dont chaque clef est un modèle d'ordinateur et la valeur correspondante le nombre total d'ordinateurs de ce modèle.</li><li>(numérotée 6 une seconde fois dans le sujet) Donnez l'instruction Python qui affiche la liste des fichiers d'un dossier dont le nom est contenu dans la variable répertoire.</li></ol>`,go:"usi-py-dico",who:OFF,sol:`<p>5. Fonction palindrome(), une solution parmi beaucoup d'autres :</p>${PY`def palindrome(chaine):
    for pos in range(len(chaine)):
        if chaine[pos] != chaine[len(chaine)-pos-1]:
            return False
    return True`}<p>Une autre solution, « plus cryptique » dit le corrigé :</p>${PY`def palindrome(chaine):
    return chaine == chaine[::-1]`}<p>6. Script Python :</p>${PY`with open("f.txt", "r") as fd:
    dico = {}
    for ligne in fd:
        ordisNombres = ligne[:-1].split(",")   # ou ligne.strip().split(",")
        for ordiNombre in ordisNombres:
            ordi = ordiNombre.split("=")[0]
            nombre = int(ordiNombre.split("=")[1])
            if ordi in dico:
                dico[ordi] += nombre
            else:
                dico[ordi] = nombre`}<p>Essai avec les trois lignes de l'exemple : ${k`{'DELL Precision': 45, 'Lenovo M900': 50, 'HP Pavillon': 12, 'Lenono M900': 13}`} (« Lenono » est une faute de frappe du sujet : c'est donc une clé à part).</p><p>7. Affichage du contenu d'un dossier :</p>${PY`print(os.listdir(répertoire))`}<p>Avec ${k`import os`} en haut du script.</p>`},
 {src:"Janvier 2023 · questions 1 à 4 (1 + 1 + 0,5 + 1 point)",t:"find, expression régulière, mots d'un bloc, variable",en:`<ol><li>Donnez la commande qui recherche à partir du dossier d'accueil tous les fichiers dont les noms finissent par ".py".</li><li>Donnez l'expression régulière qui vérifie qu'une chaîne de caractères commence et se termine par un chiffre.</li><li>En bash, quels sont les deux mots de début et de fin d'un bloc d'instructions d'une structure conditionnelle (un if) ?</li><li>Ecrire les deux instructions Bash qui créent une variable nommée i initialisée avec 1, puis affiche le valeur de cette variable.</li></ol>`,go:"usi-find",who:OFF+", avec une différence signalée",sol:`<p>1. (1 point)</p>${SH`find ~ -name "*.py"`}<p>« D'autres solutions plus compliquées avec un ls récursif et un grep sont possibles. »</p><p>2. (1 point)</p>${TX`^[0-9].*[0-9]$    ou   ^[0-9].+[0-9]$
^\d.*\d$          ou   ^\d.+\d$`}<p>3. (0,5 point) Pour un if : ${k`then`} et ${k`fi`}. Attention : le corrigé officiel répond ${k`do`} et ${k`done`}, parce qu'il recopie la question avec « structure itérative » (une boucle) à la place de « structure conditionnelle ». Sache les deux : ${k`then`} … ${k`fi`} pour un if, ${k`do`} … ${k`done`} pour for et while.</p><p>4. (1 point)</p>${SH`i=1
echo $i`}`},
 {src:"Janvier 2023 · question 5 (2 points)",t:"Fichiers qui commencent par le 1er paramètre et finissent par le 2e",en:`<p>Ecrire le script Bash qui <b>sans utiliser la commande ls</b> affiche tous les fichiers (répertoires ou fichiers réguliers) du répertoire courant dont les noms commencent par le premier paramètre donné au script et se termine par son second paramètre.</p>`,go:"usi-bash-scripts",who:OFF,sol:`${SH`for fichier in $1*$2
do
    echo $fichier
done`}<p>Autre solution du corrigé :</p>${SH`for fichier in *
do
    echo $fichier | grep "$1.*$2"
done`}<p>Barème : 1 point pour la boucle sur le contenu du dossier et 1 point pour l'utilisation des paramètres.</p><p>Remarque de ma part : dans la seconde solution, ${k`grep "$1.*$2"`} garde aussi un nom qui contient ces morceaux au milieu. Avec ${k`grep "^$1.*$2$"`}, le nom doit vraiment commencer par l'un et finir par l'autre.</p><p>Essai de la première : avec abc.txt, ab.txt, abd.py et xab.txt, ${k`./script ab .txt`} affiche abc.txt et ab.txt.</p>`},
 {src:"Janvier 2023 · questions 6 à 8 (1,5 + 0,5 + 2,5 points)",t:"Lister, numéroter, intersection()",en:`<ol start="6"><li>Ecrire le code Python qui affiche tous les noms des fichiers (répertoires ou fichiers réguliers) du répertoire dans lequel s'exécute le script.</li><li>Faites la même chose que précédemment mais en numérotant à partir de 1 ces fichiers.</li><li>Donnez le code d'une fonction nommée intersection() qui reçoit en paramètre deux listes et qui renvoie une liste contenant <b>une seule fois</b> les éléments en commun à ces deux listes.</li></ol>`,go:"usi-py-classiques",who:OFF,sol:`<p>6. (1,5 point)</p>${PY`import os
for fichier in os.listdir():
    print(fichier)`}<p>Ou avec ${k`for fichier in os.popen("ls"):`}. Barème : 0,5 pour la boucle for … in … (ou une autre boucle valide), 0,5 pour listdir() ou popen("ls"), 0,5 pour l'importation du module os.</p><p>7. (0,5 point)</p>${PY`import os
num = 1
for fichier in os.listdir():
    print(num, fichier)
    num += 1`}<p>8. (2,5 points)</p>${PY`def intersection(liste1, liste2):
    encommun = []
    for v in liste1:
        if v in liste2 and v not in encommun:
            encommun.append(v)
    return encommun`}<p>Barème : 0,5 pour la fonction et son retour, 0,5 pour la création de la liste vide, 0,5 pour le parcours de liste, 0,5 pour le test d'appartenance, 0,5 pour le ${k`not in`} (c'est lui qui garantit « une seule fois »).</p>`},
 {src:"Janvier 2022 · questions 1 à 9 (énoncés lus dans le corrigé)",t:"Neuf questions courtes : commandes, expressions régulières, vocabulaire",en:`<p>Le sujet de 2022 n'est pas en ligne : les questions sont recopiées du corrigé officiel, qui les redonne une par une.</p><ol><li>Quel est le métacaractère de Bash qui permet la transmission à une commande le résultat d'une autre commande ?</li><li>Donnez le nom de la commande qui filtre les lignes d'un fichier par rapport à un motif donné.</li><li>Donnez la commande qui recherche à partir du dossier courant tous les fichiers dont les noms se terminent par ".sh"</li><li>Donnez le symbole qui dans une expression régulière désigne un caractère de valeur quelconque.</li><li>Donnez l'expression régulière qui vérifie qu'une chaîne de caractères ne contient que des chiffres.</li><li>Par quel mot désigne-t-on le typage des langages de scripts Bash et Python ?</li><li>Par quel mot, désigne-t-on les programmes qui exécutent les instructions des scripts Bash et Python ?</li><li>En Bash, quel est le mot réservé qui termine un bloc d'instructions créé par une alternative (un test) ?</li><li>En Bash, comment est désignée la liste des paramètres (deux solutions sont possibles) ?</li></ol>`,go:"usi-bash-var",who:OFF,sol:`<ol><li>${k`|`}</li><li>${k`grep`} ou ${k`egrep`}</li><li>${k`find . -name "*.sh"`} ou ${k`ls -R | grep "\.sh$"`}</li><li>${k`.`}</li><li>${k`^[0-9]+$`} ou ${k`^\d+$`} ou ${k`^[[:digit:]]+$`}. Le corrigé ajoute : le ${k`+`} exige d'utiliser egrep ; il peut être remplacé par ${k`*`}, mais ce serait moins précis car les lignes vides seraient acceptées. Ces expressions peuvent être entourées de guillemets. (Il propose aussi ${k`^[01234789]+$`}, où le 5 et le 6 ont été oubliés : écris ${k`[0123456789]`}.)</li><li>dynamique (« faible » a aussi été accepté)</li><li>interpréteur</li><li>${k`fi`}</li><li>${k`$@`} ou ${k`$*`}</li></ol>`},
 {src:"Janvier 2022 · questions 10 à 14 (énoncés lus dans le corrigé)",t:"Cinq instructions Bash et Python",en:`<ol start="10"><li>Donnez les instructions Bash qui créent une variable nommée nom initialisée avec la valeur "test", puis affichent sa valeur dans le terminal.</li><li>Donnez l'instruction Bash qui crée une variable nommée liste qui contient les noms de tous les éléments du dossier dans lequel s'exécute le script.</li><li>Donnez l'instruction Bash qui incrémente la variable i (c'est à dire lui rajoute 1).</li><li>Donnez le code Bash qui teste si un des paramètres du script commence par un tiret (et correspondrait donc à une chaîne d'options).</li><li>Donnez le code Python qui crée un dictionnaire nommé dico vide.</li></ol>`,go:"usi-bash-var",who:OFF,sol:`<p>10.</p>${SH`nom=test          # nom="test" accepté
echo $nom`}<p>11. Trois réponses acceptées : ${k`liste=*`}, ${k`liste=$(ls)`}, ou ${k`ls`} entre accents graves.</p><p>12.</p>${SH`i=$((i+1))
let i=i+1`}<p>13.</p>${SH`for p in $@
do
    if [[ $p == -* ]]
    then
        echo "$p est une option"
    fi
done`}<p>(Le corrigé met ${k`...`} à la place du echo : seul le test est demandé.)</p><p>14.</p>${PY`dico = {}`}`},
 {src:"Janvier 2022 · question 15 (énoncé lu dans le corrigé)",t:"Enlever les répétitions qui se suivent dans une liste",en:`<p>En Python, soit une liste nommée liste contenant des entiers positifs (par exemple [2, 23, 23, 7, 7, 7, 4, 9, 9, 7]). Donnez le code qui crée une nouvelle liste nommée nliste similaire à la précédente mais qui dans le cas d'une séquence de valeurs identiques, ne conserve qu'une seule occurrence de celles-ci (pour notre exemple, le résultat serait [2, 23, 7, 4, 9, 7]). Une bonne idée serait d'utiliser une variable mémoire...</p>`,go:"usi-py-classiques",who:OFF,sol:`${PY`nliste = []
mem = -1     # ou 0, ou None, ou n'importe quoi sauf un entier positif
for n in liste:
    if n != mem:
        nliste.append(n)
        mem = n`}<p>Le corrigé donne deux solutions plus courtes qui « fonctionnent imparfaitement ». Celle-ci oublie le dernier 7 de l'exemple (et tout entier qui réapparaît plus loin) :</p>${PY`nliste = []
for n in liste:
    if n not in nliste:
        nliste.append(n)`}<p>Celle-là plante, car nliste est vide au premier tour (« index out of range ») :</p>${PY`nliste = []
for n in liste:
    if n != nliste[-1]:
        nliste.append(n)`}`}];

/* ---------- quiz ---------- */
const quiz=[
 {q:"Lequel est un chemin absolu ?",o:["/home/dupont/tp","../tp","tp/exo.py"],a:0,e:"Un chemin absolu commence par la racine /.",link:"usi-chemins"},
 {q:"Quels droits donne la commande chmod 754 ?",o:["rwxr-xr--","rwxr-xr-x","rw-r-xr--"],a:0,e:"Chaque chiffre donne les droits d'une catégorie, dans l'ordre : le propriétaire, le groupe, les autres. Chaque chiffre est une somme : r = 4, w = 2, x = 1. 7 = 4 + 2 + 1, c'est rwx ; 5 = 4 + 1, c'est r-x ; 4, c'est r--. D'où rwxr-xr--.",link:"usi-droits"},
 {q:"Avec umask 022, un nouveau fichier a les droits…",o:["rw-r--r-- (644)","rwxr-xr-x (755)","rw-rw-rw- (666)"],a:0,e:"666 sans les w du groupe et des autres. 755, c'est pour un répertoire.",link:"usi-umask"},
 {q:"Pour supprimer un fichier, il faut…",o:["w et x sur le répertoire qui le contient","w sur le fichier, pour pouvoir l'effacer","r et w sur le fichier, et rien sur le répertoire"],a:0,e:"Supprimer, c'est enlever un nom de la liste du répertoire.",link:"usi-droits"},
 {q:"Le droit x sur un répertoire permet…",o:["de le traverser (cd, atteindre un fichier dedans)","de lister son contenu avec ls","d'y créer et d'y supprimer des fichiers"],a:0,e:"Lister, c'est r ; créer, c'est w (avec x).",link:"usi-droits"},
 {q:"Où est rangé le nom d'un fichier ?",o:["Dans le répertoire qui le contient","Dans son inode","Dans son premier bloc de données"],a:0,e:"Un répertoire est une liste de couples (nom, numéro d'inode).",link:"usi-inode"},
 {q:"On tape ln a b (un lien dur), puis rm a. Alors le fichier b…",o:["marche toujours","est cassé","est supprimé aussi"],a:0,e:"Lien dur : même inode, le compteur passe de 2 à 1.",link:"usi-liens"},
 {q:"On tape ln -s cible lien (un lien symbolique), puis rm cible. Alors lien…",o:["est cassé","marche toujours","est supprimé aussi"],a:0,e:"Un lien symbolique ne contient qu'un chemin, qui ne mène plus à rien.",link:"usi-liens"},
 {q:"Un lien dur peut viser…",o:["un fichier de la même partition","un répertoire","un fichier d'une autre partition"],a:0,e:"Pas de lien dur vers un répertoire ni hors de la partition.",link:"usi-liens"},
 {q:"Un inode contient 10 adresses directes, puis une adresse d'indirection simple, une double et une triple. Avec des blocs de 4 Kio et des adresses de 4 octets, quelle est environ la taille maximale d'un fichier ?",o:["environ 4 Tio","environ 4 Gio","environ 40 Kio"],a:0,e:"Un bloc contient 1024 adresses. Le triple indirect atteint 1024³ = 2³⁰ blocs de 4 Kio, soit 4 Tio ; le reste est négligeable à côté.",link:"usi-taille"},
 {q:"Un processus dans l'état « prêt »…",o:["n'attend que le processeur","attend le clavier","est en train de s'exécuter"],a:0,e:"Attendre le clavier, c'est être bloqué ; s'exécuter, c'est être actif.",link:"usi-processus"},
 {q:"Dans le processus enfant, fork() renvoie…",o:["0","le PID de l'enfant","le PID du parent"],a:0,e:"C'est le parent qui reçoit le PID de l'enfant.",link:"usi-fork"},
 {q:"echo Hello crée-t-il un processus ?",o:["Non, echo est interne à bash","Oui, un fork puis un exec","Oui, deux processus"],a:0,e:"echo est une commande interne de bash, comme cd, export ou exit : bash l'exécute lui-même, sans créer de processus. Une commande externe, comme ls, est un programme à part : bash crée un processus pour la lancer.",link:"usi-fork"},
 {q:"Le dossier /toto n'existe pas. Avec « ls /bin /toto > f », le message d'erreur sur /toto…",o:["s'affiche à l'écran","va dans f","est perdu"],a:0,e:"> ne redirige que la sortie standard (1) ; l'erreur sort par la 2.",link:"usi-redir"},
 {q:"cmd1 && cmd2 lance cmd2…",o:["si cmd1 a réussi (code 0)","si cmd1 a échoué","dans tous les cas"],a:0,e:"cmd1 || cmd2 fait l'inverse : cmd2 est lancée si cmd1 a échoué. Avec cmd1 ; cmd2, cmd2 est lancée dans tous les cas.",link:"usi-redir"},
 {q:"Quelle commande cherche, à partir du dossier d'accueil, les fichiers dont le nom finit par .py ?",o:["find ~ -name \"*.py\"","find . -name \".py\"","grep ~ \"*.py\""],a:0,e:"~ pour l'accueil ; le motif avec * entre guillemets.",link:"usi-find"},
 {q:"Quelle expression régulière reconnaît une chaîne qui contient exactement deux points ?",o:["^[^.]*\\.[^.]*\\.[^.]*$","^.*\\..*\\..*$","^..$"],a:0,e:"« ^.*\\..*\\..*$ » accepte aussi trois points ou plus, car .* peut contenir des points. « ^..$ » accepte deux caractères quelconques.",link:"usi-regex"},
 {q:"Laquelle de ces chaînes l'expression régulière ^[0-9].*[0-9]$ accepte-t-elle ?",o:["« 1abc2 »","« a12b »","« 12a »"],a:0,e:"Il faut un chiffre au tout début et un à la toute fin.",link:"usi-regex"},
 {q:"En Bash, i = 1 avec des espaces…",o:["est une erreur : bash lance une commande nommée i","met 1 dans i : les espaces sont ignorés","compare i et 1, comme un test"],a:0,e:"Jamais d'espace autour du = d'une affectation.",link:"usi-bash-var"},
 {q:"Dans un script, $# vaut…",o:["le nombre de paramètres","le premier paramètre","la liste des paramètres"],a:0,e:"$1 est le premier, $@ la liste.",link:"usi-bash-var"},
 {q:"Le bloc d'un if en Bash s'écrit…",o:["then … fi","do … done","{ … }"],a:0,e:"do … done, c'est pour for et while.",link:"usi-bash-ctrl"},
 {q:"En Bash, la ligne i=$((i+1))…",o:["ajoute 1 à i","affiche i+1","met la chaîne « i+1 » dans i"],a:0,e:"$(( )) calcule ; let i=i+1 aussi.",link:"usi-bash-var"},
 {q:"En Python, os.listdir(d) renvoie…",o:["les noms contenus dans d","les chemins complets","seulement les fichiers réguliers"],a:0,e:"Des noms seuls : il faut coller d + os.sep + nom.",link:"usi-py-parcours"},
 {q:"\"a,b\".split(\",\") donne…",o:["['a', 'b']","\"ab\"","('a', 'b')"],a:0,e:"split renvoie une liste de chaînes.",link:"usi-py-bases"},
 {q:"En Python, que fait d[cle] += 1 quand cle n'est pas une clé du dictionnaire d ?",o:["plante (KeyError)","crée la clé avec 1","crée la clé avec 0"],a:0,e:"Cela lève l'erreur KeyError : on ne peut pas ajouter 1 à une valeur qui n'existe pas. D'où le test : if cle in d … else d[cle] = 1.",link:"usi-py-dico"},
 {q:"En Python, pendant le parcours récursif d'un dossier, pour savoir si un nom lu par os.listdir est un sous-dossier, on teste…",o:["os.path.isdir(dossier + os.sep + nom)","os.path.isdir(nom)","os.listdir(dossier + os.sep + nom)","os.path.isfile(dossier + os.sep + nom)"],a:0,e:"Le nom seul n'est valable que dans le dossier courant.",link:"usi-py-parcours"},
 {q:"En C, ./prog a b donne argc =…",o:["3","2","1"],a:0,e:"argv[0] est le nom du programme.",link:"usi-c-compil"},
 {q:"Les étapes de gcc, dans l'ordre ?",o:["préprocesseur, compilation, assemblage, édition de liens","compilation, préprocesseur, édition de liens, assemblage","assemblage, compilation, édition de liens, préprocesseur"],a:0,e:"#include d'abord, l'exécutable à la fin.",link:"usi-c-compil"},
 {q:"En C, une fonction fait i = i + 1 sur son paramètre int. La variable de l'appelant…",o:["ne change pas","augmente de 1","devient indéfinie"],a:0,e:"Passage par copie : seule la copie change.",link:"usi-c-memoire"},
 {q:"Un système d'exploitation est…",o:["la couche logicielle entre la machine matérielle et les utilisateurs","le processeur et sa mémoire, qui exécutent les programmes","un langage de programmation, dans lequel on écrit les applications"],a:0,e:"Définition du cours : une couche logicielle offrant une interface entre la machine matérielle et les utilisateurs.",link:"usi-se"},
 {q:"En quel langage Unix est-il écrit ? (TD ex. 1)",o:["En C","En Python","En Bash"],a:0,e:"D'où les appels du noyau sous forme de fonctions C (fork, open…).",link:"usi-se"},
 {q:"Quelle commande affiche ton uid, ton groupe primaire et tes groupes ?",o:["id","ps","umask"],a:0,e:"whoami donne seulement le nom ; ps liste les processus.",link:"usi-utilisateur"},
 {q:"ln -s /etc/passwd p. Quelle est la taille du lien p ?",o:["11 octets : la longueur du chemin /etc/passwd","la taille de /etc/passwd : le lien pointe dessus","0 octet : un lien ne contient rien"],a:0,e:"Un lien symbolique contient le chemin visé, rien d'autre.",link:"usi-liens"},
 {q:"Un processus actif demande une saisie au clavier. Il passe à l'état…",o:["bloqué","prêt","il reste actif"],a:0,e:"Il lui manque une autre ressource que le processeur. Quand la saisie arrive, il devient prêt, pas actif.",link:"usi-processus"},
 {q:"Dans ps, un processus dont STAT vaut R est…",o:["prêt ou élu (run)","endormi, en attente d'un événement","terminé"],a:0,e:"S (sleep) : en attente d'un événement.",link:"usi-processus"},
 {q:"echo été > f : quelle est la taille de f ? (TD ex. 9)",o:["6 octets","3 octets","4 octets"],a:0,e:"En UTF-8, chaque é prend 2 octets ; plus le t, plus le retour à la ligne ajouté par echo.",link:"usi-chemins"},
 {q:"Le programme fact fait n = atoi(argv[1]), calcule la factorielle de n et affiche « n!=résultat ». Qu'affiche « fact toto » ?",o:["0!=1","Syntaxe incorrecte","toto!=1"],a:0,e:"atoi(\"toto\") renvoie 0 : le programme calcule 0! = 1 et finit avec le code 0.",link:"usi-c-memoire"},
 {q:"Dans une commande grep -E, un chiffre s'écrit…",o:["[0-9]","\\d","#"],a:0,e:"\\d marche en Python et dans les corrigés d'expressions seules, pas avec grep -E.",link:"usi-regex"},
 {q:"Blocs de 4 Kio, adresses de 4 octets : combien de blocs d'adresses pour un fichier de 4 Gio ?",o:["environ 2¹⁰","environ 2²⁰","10"],a:0,e:"2²⁰ blocs de données, donc 2²⁰ adresses de 4 octets = 2²² octets = 2¹⁰ blocs (exercice 3 du cours).",link:"usi-taille"}];

/* ---------- pages ---------- */
const DOCS=[["usi/cours-meynard.pdf","Cours de Meynard"],["usi/tdtp-meynard.pdf","TD/TP de Meynard"],["usi/td4-exemples-sh-c.zip","Réponses de Meynard au TD 4 (zip)"],["usi/unix-commandes-scripts.pdf","Poly Unix et Bash (Pompidor)"],["usi/python-support-pompidor.pdf","Poly Python (Pompidor)"],["usi/initiation-python.pdf","TP de familiarisation Python"],["usi/tp1-quiz-capitales.pdf","TP 1 capitales"],["usi/tp2-exploration-recursive.pdf","TP 2 exploration"],["usi/tp4-indexation.pdf","TP indexation de mots"],["usi/annales/examen_HAI103I_2025_2026_session_1.pdf","Examen 2026"],["usi/annales/correction_HAI103I_2025_2026_session_1.pdf","Corrigé 2026"],["usi/annales/examen_HAI103I_2024_2025_session_1.pdf","Examen 2025"],["usi/annales/correction_HAI103I_2024_2025_session_1.pdf","Corrigé 2025"]];
const infos=({sec})=>`<div class="title-row"><h1>L'examen d'USI en bref</h1></div>
 ${sec(1,"Quand et où",`<p>En janvier, mais la date n'est pas encore dans Prose. Les années passées : 15/01/2024, 17/01/2025 (13h-15h), 16/01/2026 (9h-11h). Le site suppose le vendredi 15 janvier 2027 de 9h à 11h ; je corrigerai dès que la vraie date sera dans Prose.</p><p>2 h, ${hl("aucun document")}. C'est la seule note de l'UE (« contrôle écrit terminal »). Session 2 en juin.</p>`)}
 ${sec(2,"Deux moitiés de 10 points",`<ul><li><b>Partie Pompidor</b>, toujours la même forme depuis 2022 : une recherche (${k`find`}, ou un filtre ${k`ls | grep`}), une expression régulière, un script Bash, puis un script Python (dictionnaire, fichier CSV, parcours récursif de dossiers) qui vaut 4,5 à 6 points.</li><li><b>Partie Meynard</b> : je n'ai trouvé aucun ancien sujet (sa page perso ne répond pas, rien sur Moodle, revérifié le 11 novembre 2026). Le site couvre tout son cours (190 diapos) et toute sa feuille de TD/TP : système d'exploitation, chemins, utilisateurs, droits et umask, inodes et liens, taille des fichiers, processus, redirections et tubes, scripts bash, compilation C. Ses propres réponses au TD 4 (fact.sh, lsrec.sh, moy.c, moyenne.c), déposées sur Moodle le 7 octobre 2026, sont recopiées dans les exercices corrigés 45, 46, 53 et 54. Si quelqu'un de L2 te passe un ancien sujet de Meynard, envoie-le-moi.</li></ul>`)}
 ${sec(3,"Les années des annales",`<p>« 2025 » veut dire l'examen de janvier 2025 (année 2024-2025) ; « juin 2025 », la session 2. Les sujets et les corrigés viennent de la page de Pierre Pompidor (lirmm.fr/~pompidor, rubrique « Annales d'examens »).</p>`)}
 ${sec(4,"La méthode",`<ol><li>Les leçons, dans l'ordre : elles suivent le cours.</li><li>Pour chaque question d'annale, écris ta réponse sur papier ${hl("avant")} d'ouvrir le corrigé : à l'examen, tu n'as pas de terminal.</li><li>Tous les codes des corrigés ont été essayés sur une machine Linux ; quand un corrigé officiel a une erreur, c'est écrit dessous.</li><li>Apprends l'aide-mémoire par cœur : aucun document n'est autorisé.</li></ol>`)}
 ${sec(5,"Documents",`<p style="display:flex;gap:8px;flex-wrap:wrap">${DOCS.map(f=>`<a class="btn" href="../Moodle-S1/${f[0]}" target="_blank" rel="noopener">${f[1]}</a>`).join("")}</p>`)}`;

const memo=({sec})=>`<div class="title-row"><h1>Aide-mémoire</h1></div><p class="lead">Aucun document à l'examen : ceci est à savoir par cœur. Recopie-le de tête, puis compare.</p>
 ${sec(1,"Fichiers et droits",`${SH`pwd   cd ..   ls -l -a -R   mkdir d   rmdir d
cp -r d e   mv f g   rm -r d   cat f   which ls
chmod 755 f   chmod u+x f   umask 022
ln f lien   ln -s cible raccourci   ls -i`}<p>r = 4, w = 2, x = 1. umask 022 : fichiers 644, répertoires 755. Supprimer : w et x sur le répertoire.</p>`)}
 ${sec(2,"Processus, redirections, tubes",`${SH`ps f   top   kill PID   kill -9 PID   cmd &
cmd > f   cmd >> f   cmd < f   cmd 2> f
cmd1 | cmd2   cmd1 ; cmd2   cmd1 && cmd2   cmd1 || cmd2
grep -E -v -c   wc -l   cut -d, -f1   sort -r -n
head -n 5   tail -n 5   sed "s/a/b/g"   tee f`}<p>$? = 0 : réussite. Ctrl-C tue, Ctrl-D = fin de fichier. fork : 0 dans l'enfant, PID de l'enfant dans le parent.</p>`)}
 ${sec(3,"find et regex",`${SH`find ~ -name "*.py"
find . -type f -name "2023*"
find .. -name "*DATA*" -exec rm {} \;
ls | grep -E "\.jpe?g$"`}${TX`.  un caractère      \.  un point       [0-9] ou \d  un chiffre
[^.]  sauf un point  *  0 ou plus  +  1 ou plus  ?  0 ou 1
^  début   $  fin   (a|b)  l'un ou l'autre   {2,4}  de 2 à 4 fois`}`)}
 ${sec(4,"Bash",`${SH`#!/bin/bash
# $0 nom, $1 $2 paramètres, $# nombre, $@ tous, $? code
i=1
i=$((i+1))
liste=$(ls)
for f in *.txt
do
    if [[ -f "$f" && $f == old* ]]
    then
        echo "$f"
    fi
done
while read ligne
do
    echo "$ligne" | cut -d, -f1
done < fichier.csv`}`)}
 ${sec(5,"Python",`${PY`import os, sys
d = {}
with open(sys.argv[1]) as fd:
    for ligne in fd:
        champs = ligne.strip().split(",")
        if champs[0] in d:
            d[champs[0]] += 1
        else:
            d[champs[0]] = 1

def parcours(dossier):
    for nom in os.listdir(dossier):
        chemin = dossier + os.sep + nom
        if os.path.isdir(chemin):
            parcours(chemin)
        else:
            print(chemin, nom.split(".")[-1])

parcours(sys.argv[1])
fd = open("sortie.txt", "w")
fd.write(str(len(d)) + "\n")
fd.close()`}`)}
 ${sec(6,"C",`${SH`gcc -o prog -Wall prog.c     ./prog a b     # argc = 3
gcc -E (prétraité)   gcc -S (assembleur)   gcc -c (objet .o)`}<p>Préprocesseur, compilation, assemblage, édition de liens. Passage par copie : on ne modifie l'appelant qu'à travers un pointeur. Pile : variables locales ; tas : malloc / free ; statique : globales.</p>`)}`;

SUBJ.usi={name:"USI",code:"HAI103I",color:"#5BF29A",coef:4,share:1,key:"rev-usi-v1",lang:"sh",from:"2026-12-18",
 exams:[{id:"exam",label:"Examen",day:"2027-01-15",start:"09:00",end:"11:00",place:"salle à confirmer",dur:"2 h",share:1,unsure:"Date supposée : mi-janvier comme les années passées (15/01/2024, 17/01/2025, 16/01/2026). Je la corrigerai quand elle sera dans Prose."}],
 docs:"aucun",examMinutes:60,examMorning:"Relis l'aide-mémoire (find, regex, squelettes Bash et Python), réécris de tête le parcours récursif en Python, puis les cartes en rouge.",
 prog:"Tout le cours. Partie Meynard : système d'exploitation, chemins, utilisateurs, droits et umask, inodes et liens, taille des fichiers, processus, redirections et tubes, compilation C. Partie Pompidor : find, grep et regex, scripts Bash, Python (listes, dictionnaires, fichiers, parcours récursif).",
 chapters:{1:"1. Système, fichiers, chemins, droits",2:"2. Inodes et liens",3:"3. Processus, redirections, tubes",4:"4. find et expressions régulières",5:"5. Scripts Bash",6:"6. Python",7:"7. Le C sous Unix"},
 concepts,quiz,td,ann,tdTitle:"Exercices corrigés",tdPrefix:"Ex.",
 tdIntro:"Toute la feuille de TD/TP de Meynard (sauf les exercices 6, 15 et 41, qui ne se font que sur les machines de la fac), les exercices et exemples de son cours, les TP et le poly Python de Pompidor, puis des entraînements au format de l'examen. Les énoncés sont recopiés des feuilles. Les corrigés sont écrits par moi, sauf ceux qui portent une étiquette : les réponses de Meynard au TD 4 (exercices 45, 46, 53, 54) et celles de son cours. Tous les codes ont été essayés. Les ★★★ ressemblent le plus à l'examen.",
 annIntro:"Ce sont les sujets de Pompidor, sa moitié de l'examen (10 points), recopiés mot pour mot avec ses corrigés officiels : fais chaque session en 1 h. Quand le corrigé officiel a une erreur ou une coquille, c'est écrit dessous. Pour la moitié de Meynard, aucun ancien sujet : travaille ses exercices corrigés.",
 pages:[{id:"infos",t:"L'examen en bref",html:infos},{id:"memo",t:"Aide-mémoire",html:memo}],
 /* thèmes de l'examen. Moitié Pompidor : barèmes de 2023 à 2026. Moitié Meynard : aucun ancien sujet,
    points estimés d'après la place de chaque chapitre dans son cours et ses TD. */
 themes:[
  {id:"python",t:"Python : dictionnaires, fichiers CSV, parcours récursif de dossiers",pts:5,src:"4,5 à 6 points à chaque examen",les:["u-py1","u-py2","u-py3"],tasks:["tdpy"],fiches:["usi-py-bases","usi-py-classiques","usi-py-dico","usi-py-fichiers","usi-py-parcours"]},
  {id:"fichiers",t:"Fichiers : chemins, droits, umask, inodes, liens, taille maximale",pts:4.5,src:"estimé : pas d'ancien sujet de cette moitié",les:["u-chemins","u-droits","u-umask","u-inodes","u-taille"],tasks:["tdsgf","tdcoh"],fiches:["usi-chemins","usi-types","usi-utilisateur","usi-droits","usi-umask","usi-inode","usi-liens","usi-taille"]},
  {id:"processus",t:"Processus, redirections, tubes et filtres",pts:3,src:"estimé : pas d'ancien sujet de cette moitié",les:["u-processus","u-redir"],tasks:["tdproc"],fiches:["usi-processus","usi-fork","usi-redir","usi-filtres"]},
  {id:"bash",t:"Scripts Bash",pts:2.5,src:"2 à 2,5 points à chaque examen",les:["u-bash1","u-bash2"],tasks:["tdbash"],fiches:["usi-bash-var","usi-bash-ctrl","usi-bash-scripts"]},
  {id:"recherche",t:"find et expressions régulières",pts:2.5,src:"2 à 3 points à chaque examen",les:["u-find","u-regex"],tasks:["tdrech"],fiches:["usi-find","usi-regex"]},
  {id:"c",t:"Le C sous Unix : compiler, argc et argv, mémoire",pts:2,src:"estimé : pas d'ancien sujet de cette moitié",les:["u-c"],tasks:["tdc"],fiches:["usi-c-compil","usi-c-memoire"]},
  {id:"intro",t:"Le système d'exploitation et Unix : le vocabulaire",pts:0.5,src:"estimé",les:["u-intro"],fiches:["usi-se"]}],
 tasks:[
 {id:"tdsgf",t:"Exercices ★★★ sur les droits, le umask et la taille des fichiers, sur papier",min:40,p:1,td:["16","17","25","B1"],links:[["td","Exercices corrigés"]]},
 {id:"tdproc",t:"Exercices ★★★ sur les processus, les redirections et les scripts",min:35,p:1,td:["30","36","39","42","C1"],links:[["td","Exercices corrigés"]]},
 {id:"tdcoh",t:"Cohérence des blocs, des inodes et des liens (TD ex. 21, 22, 23), sur papier",min:25,p:2,td:["21","22","23"],links:[["td","Exercices corrigés"]]},
 {id:"tdrech",t:"Entraînement find et regex, sur papier",min:25,p:1,td:["12","X1","X2"],links:[["td","Exercices corrigés"]]},
 {id:"tdbash",t:"Scripts Bash sur papier : lsarg.sh et deux entraînements",min:40,p:1,td:["44","X3","X4"],links:[["td","Exercices corrigés"]]},
 {id:"tdpy",t:"Python sur papier : indexation par suffixe et deux entraînements",min:50,p:1,td:["Py6","X6","X7"],links:[["td","Exercices corrigés"]]},
 {id:"tdc",t:"Le C sur papier : moyenne des paramètres (ex. 54), puis ce qu'affichent les exemples du cours (C3, C4)",min:35,p:1,td:["54","C3","C4"],links:[["td","Exercices corrigés"]]},
 {id:"blanc1",t:"Examen blanc : la partie Pompidor de janvier 2026 en 1 h, puis correction",min:70,p:1,manual:true,links:[["annales","Annales et chrono"]],why:"find, regex, Bash et parcours récursif en Python : la forme exacte de l'examen."},
 {id:"blanc2",t:"Annale de janvier 2025 (partie Pompidor) en 1 h, puis correction",min:65,p:1,manual:true,links:[["annales","Annales et chrono"]]},
 {id:"blanc3",t:"Annale de juin 2025 (session 2) en 1 h",min:60,p:2,manual:true,links:[["annales","Annales et chrono"]]},
 {id:"memo",t:"Réécrire l'aide-mémoire de tête, puis comparer",min:25,p:1,manual:true,links:[["p/memo","Aide-mémoire"]]},
 {id:"quiz",t:"Quiz de cours : au moins 80 %",min:15,p:1,quiz:0.8,last:true,links:[["quiz","Quiz de cours"]]},
 {id:"review",t:"Veille de l'examen : « Réviser » jusqu'à 0 carte, puis l'aide-mémoire",min:25,p:1,manual:true,review:true,last:true,links:[["#/reviser","Réviser"]]}]};
})();
