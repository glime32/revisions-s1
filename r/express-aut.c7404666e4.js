/* L'examen d'Automates en 1 h (session 1, entre le 4 et le 15/01, date pas encore publiée ; 100 % de la note, aucun document).
   Modèle : le sujet de janvier 2026 de la même enseignante (A.-E. Baert), 1 h : QCM 5 points (sous-mot, deux questions
   d'expressions régulières, mots acceptés), ex. 1 automate complet à 3 états (1), ex. 2 expression et automate (2),
   ex. 3 déterminisation (3), ex. 4 quotients à gauche (9). Les sujets de 2023 et 2024 (2 h) posent la même chose avec
   une autre opération (L−p, miroir, a⁻¹L, L−d), plus le complémentaire et les équations de langages.
   Les exemples sont refaits par tools/verif/express/aut.js ; les exercices sont tirés de gen-aut.js. */
(()=>{
const U=window.GEN&&window.GEN.aut;if(!U)return;
const E=s=>U.erH(s),D=(noms,init,fin,T)=>U.dessin(U.auto(noms,init,fin,T));
const Lu=u=>`L<sub>${u}</sub>`;
const tab=(tete,L)=>`<table class="tbl"><thead><tr>${tete.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${L.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
(window.EXPRESS=window.EXPRESS||{}).aut={exam:{
 t:"L'examen d'Automates en 1 h",du:"de l'examen",au:"à l'examen",
 lead:"Tout l'examen de janvier, sans document, dans l'ordre de ce qui rapporte le plus au sujet de janvier 2026 (même enseignante, 1 h, barème QCM 5, exercices 1, 2, 3 et 9 points). Les sujets de 2023 et 2024 (en 2 h) posent les mêmes questions avec une autre opération que le quotient : le parcours les signale. Les équations de langages (2023 à 2025) et l'automate combiné (2025), absents du sujet de 2026, n'y sont pas : ils ont leurs entraînements à part, et l'automate combiné a sa leçon. Pour chaque notion : l'essentiel, la méthode sur l'exercice du sujet, puis un exercice à faire toi-même avant de voir la correction. À la fin, un sujet express noté sur 20.",
 carte:"tout l'examen en 1 h, ce qui rapporte le plus d'abord, puis un sujet express noté sur 20.",
 blancLead:"Cinq questions dans l'ordre du sujet de janvier 2026 : une question du QCM, la déterminisation, un automate pour un langage décrit, puis deux questions de quotients. Fais-les sans revenir aux notions. La note qui sort est une estimation.",
 paliers:[[10,"Moyenne assurée"],[14,"Bonne note"]],
 notions:[
 {id:"qfini",t:"Le quotient à gauche sur des exemples",pts:4,ou:"exercice 4, questions 1, 2 et 8 (janvier 2026)",lect:2,exo:{g:"AU6",lv:0},
  ess:`<ul><li>${Lu("u")} = { v | uv ∈ L } : les mots qu'on peut écrire <b>après u</b> pour obtenir un mot de L.</li>
<li>L fini : on garde les mots de L qui commencent par u, et on <b>enlève</b> ce début u.</li>
<li>L décrit par une phrase : on se demande ce qu'il faut encore à v, sachant que u est déjà lu.</li>
<li>Par deux lettres : ${Lu("ab")} = (${Lu("a")})<sub>b</sub>.</li></ul>`,
  meth:`<p>Janvier 2026, L = {abb, bbab} : ${Lu("a")} = {bb}, ${Lu("b")} = {bab}, ${Lu("ab")} = {b}.</p>
<p>L = les mots contenant le facteur ab :</p>
<ol><li>${Lu("b")} = L : un b au début ne commence pas de ab, il faut encore trouver ab dans v.</li>
<li>${Lu("a")} : il suffit que v contienne un b. Le premier b de v suit un a (celui de u ou un a de v). Donc ${Lu("a")} = ${E("(a + b)*b(a + b)*")}. Le corrigé écrit ${E("b(a + b)* + (a + b)*ab(a + b)*")} : c'est le même langage.</li>
<li>${Lu("ab")} = ${E("(a + b)*")} : le facteur ab est déjà lu.</li></ol>
<p>L = les mots commençant et terminant par a : ${Lu("a")} = ${E("ε + (a + b)*a")} (ε, car le mot a est dans L), et ${Lu("b")} = ∅.</p>
<p>L = {aⁿbⁿ | n > 0} : ${Lu("a")} = {aᵏbᵏ⁺¹ | k ≥ 0} (il manque un a, donc un b de plus que de a) et ${Lu("b")} = ∅.</p>
<p>Question 8, L = ${E("(b + aba)*")} : un mot qui commence par a commence par le bloc aba. Donc ${Lu("a")} = ${E("ba(b + aba)*")} et ${Lu("ab")} = ${E("a(b + aba)*")}.</p>`,
  piege:`Si u est lui-même dans L, alors ε ∈ ${Lu("u")} : c'est l'oubli le plus fréquent. Et ${Lu("u")} n'est pas « les mots de L qui commencent par u » : on enlève u.`},
 {id:"qtous",t:"Tous les quotients, puis l'automate qu'ils forment",pts:3,ou:"exercice 4, questions 3 à 5 (janvier 2026)",lect:2,exo:{g:"AU6",lv:3},
  ess:`<ol><li>On part de L = ${Lu("ε")}. On calcule ${Lu("a")} et ${Lu("b")}.</li>
<li>Pour chaque quotient nouveau, on calcule ses deux quotients, jusqu'à ne plus rien trouver de nouveau. ∅ compte comme un quotient.</li>
<li>Un état par quotient distinct. L'état de ${Lu("u")} va, avec la lettre x, vers l'état de ${Lu("ux")}.</li>
<li>Un état est acceptant quand ε est dans son quotient. L'état initial est celui de L.</li></ol>`,
  meth:`<p>Janvier 2026, L = ${E("a*b*")} :</p>
<ol><li>${Lu("a")} = ${E("a*b*")} = L (après un a, on peut encore lire des a puis des b) ; ${Lu("b")} = ${E("b*")} (après un b, plus de a).</li>
<li>Les quotients de ${E("b*")} : par b, ${E("b*")} ; par a, ∅. Ceux de ∅ : ∅.</li>
<li>Trois quotients : q0 = ${E("a*b*")}, q1 = ${E("b*")}, q2 = ∅. ε est dans q0 et q1, pas dans q2.</li></ol>
${tab(["état","a","b","acceptant ?"],[["q0","q0","q1","oui"],["q1","q2","q1","oui"],["q2","q2","q2","non"]])}
${D(["q0","q1","q2"],["q0"],["q0","q1"],[["q0","a","q0"],["q0","b","q1"],["q1","a","q2"],["q1","b","q1"],["q2","a","q2"],["q2","b","q2"]])}`,
  piege:`Ne pas oublier le quotient ∅ : sans lui, l'automate n'est pas complet. Et un état est acceptant si ε est dans son quotient (ici q1 = ${E("b*")} contient ε), pas seulement l'état initial.`},
 {id:"det",t:"Déterminiser un automate",pts:3,ou:"exercice 3 (janvier 2026) ; complémentaire en 2023 et 2024",lect:2,exo:{g:"AU5",lv:0},
  ess:`<ol><li>Les états du nouvel automate sont des <b>ensembles</b> d'états. Le premier est l'ensemble des états initiaux.</li>
<li>Pour un ensemble et une lettre : on réunit les arrivées de chacun de ses états par cette lettre.</li>
<li>Chaque ensemble nouveau a sa ligne ; on s'arrête quand il n'y en a plus. L'ensemble vide ∅ est le puits : il a sa ligne aussi.</li>
<li>Un ensemble est acceptant s'il contient au moins un état acceptant.</li></ol>`,
  meth:`<p>Janvier 2026 : 1 initial, 2 acceptant.</p>
${D(["1","2","3"],["1"],["2"],[["1","a","1"],["1","a","2"],["2","b","1"],["1","b","3"],["2","b","3"],["3","a","2"]])}
${tab(["état","a","b","acceptant ?"],[["{1}","{1, 2}","{3}","non"],["{1, 2}","{1, 2}","{1, 3}","oui"],["{3}","{2}","∅","non"],["{1, 3}","{1, 2}","{3}","non"],["{2}","∅","{1, 3}","oui"],["∅","∅","∅","non"]])}
<p>Par exemple {1, 2} avec b : 1 va en 3, 2 va en 1 et en 3, donc {1, 3}. Les acceptants sont ceux qui contiennent 2 : {1, 2} et {2}.</p>`,
  piege:`On n'écrit que les ensembles atteints depuis {1}, pas toutes les parties. Pour le <b>complémentaire</b> (2023, 2024) : d'abord déterminiser et compléter (la ligne ∅), ensuite seulement échanger acceptant et non acceptant ; échanger sur l'automate non déterministe donne un faux résultat.`},
 {id:"qcmer",t:"QCM : quelles expressions décrivent ce langage ?",pts:2.5,ou:"QCM, questions 2 et 3 (janvier 2026)",lect:1.5,exo:{g:"AU3",lv:1},
  ess:`<ul><li>Une expression est fausse si elle produit un mot de trop (trop large) ou s'il lui manque un mot du langage (trop étroite) : un seul mot suffit pour l'écarter.</li>
<li>On essaie les petits mots : ε, a, b, puis les mots limites (ici, deux b collés, deux b séparés).</li>
<li>Une mauvaise case coûte 0,5 point : ne coche que ce que tu as vérifié.</li></ul>`,
  meth:`<p>Longueur paire : ${E("(a + b)*")} contient a, non ; ${E("(a + b)(a + b)")} ne donne que la longueur 2, non ; ${E("(aa + ab + ba + bb)*")} oui.</p>
<p>Au moins deux b :</p><ul><li>oui : ${E("(a + b)*b(a + b)*b(a + b)*")}, ${E("(a + b)*b(a + ε)*b(a + b)*")} (car ${E("(a + ε)*")} = ${E("a*")}) et ${E("(a + b)*ba*b(a + b)*")} (on regarde les deux derniers b) ;</li>
<li>non : ${E("(a + b)*(ba*b)*")} et ${E("(ba*b)*")} contiennent ε ; ${E("(b*a*b*)*")} donne tous les mots.</li></ul>`,
  piege:`Une étoile autour de tout, <span class="nf">(…)<sup>∗</sup></span>, contient toujours ε : si ε n'est pas dans le langage, l'expression est fausse.`},
 {id:"preuve",t:"Démontrer que l'opération garde « reconnaissable », et les règles",pts:2,ou:"exercice 4, questions 6 et 7 (janvier 2026) ; même question tous les ans",lect:1.5,
  rappel:{min:2,q:`Montre que si L est reconnaissable, alors ${Lu("u")} est reconnaissable : quel automate, et quelle suite d'équivalences ? Puis exprime (L₁ ∪ L₂)<sub>u</sub>, (L₁ ∩ L₂)<sub>u</sub> et le quotient du complémentaire de L.`,
   r:`<p>L est reconnu par un automate déterministe A = ⟨A, Q, q<sub>0</sub>, F, δ⟩. Soit q<sub>u</sub> = δ*(q<sub>0</sub>, u). L'automate A<sub>u</sub> = ⟨A, Q, q<sub>u</sub>, F, δ⟩ est le même, avec q<sub>u</sub> comme état initial. Pour tout mot v :</p>
<p>v ∈ L(A<sub>u</sub>) ⟺ δ*(q<sub>u</sub>, v) ∈ F ⟺ δ*(q<sub>0</sub>, uv) ∈ F ⟺ uv ∈ L ⟺ v ∈ ${Lu("u")}. Donc ${Lu("u")} est reconnaissable.</p>
<p>(L₁ ∪ L₂)<sub>u</sub> = (L₁)<sub>u</sub> ∪ (L₂)<sub>u</sub> ; (L₁ ∩ L₂)<sub>u</sub> = (L₁)<sub>u</sub> ∩ (L₂)<sub>u</sub> ; le quotient du complémentaire est le complémentaire de ${Lu("u")}.</p>
<p class="muted">Corrigé officiel de janvier 2026. Les autres années, la même preuve avec une autre opération : L<sup>−p</sup> (2023 : départs en δ(q<sub>d</sub>, a) et δ(q<sub>d</sub>, b)), le miroir (janvier 2024 : flèches retournées, départs et arrivées échangés), a⁻¹L (juin 2024), L<sup>−d</sup> (juin 2023 : nouveaux acceptants q tels que δ(q, a) ou δ(q, b) est acceptant). L'entraînement AU6, palier 5, les fait toutes.</p>`},
  ess:`<ul><li>On part d'un automate <b>déterministe</b> A qui reconnaît L, et on dit précisément ce qu'on change : l'état initial, les états acceptants ou le sens des flèches.</li>
<li>Puis une chaîne d'équivalences, chacune justifiée par la définition de δ* ou celle du langage.</li>
<li>La clé du quotient : δ*(q<sub>0</sub>, uv) = δ*(δ*(q<sub>0</sub>, u), v). Lire u, c'est arriver en q<sub>u</sub>.</li></ul>`,
  meth:`<p>La rédaction attendue est dans la réponse ci-dessous. Pour les règles : le quotient passe à travers l'union, l'intersection et le complémentaire. Les sujets de 2 h demandaient aussi l'étoile et le produit, avec deux cas pour le produit (selon que ε ∈ L₁ ou non).</p>`,
  piege:`Pour L<sup>−p</sup> et le miroir, l'automate obtenu a plusieurs états initiaux : il n'est plus déterministe, et c'est permis. Écris-le, au lieu de chercher à le rendre déterministe.`},
 {id:"lang",t:"Un langage décrit : son expression et son automate",pts:3,ou:"exercices 1 et 2 (janvier 2026) ; question 1 tous les ans",lect:2,exo:{g:"AU3",lv:2},
  ess:`<ul><li>L'expression : on découpe le mot en blocs qui se répètent. « Un nombre impair de a » s'écrit ${E("a(aa)*")}.</li>
<li>L'automate : chaque état retient ce qu'il faut savoir du début du mot (combien de b, la dernière lettre…). Complet : une flèche a et une flèche b sur chaque état, avec un puits si besoin.</li>
<li>Vérifie avec les exemples de l'énoncé : ceux qui sont dans L et ceux qui n'y sont pas.</li></ul>`,
  meth:`<p>Exercice 1, au moins deux b, complet à 3 états : on compte les b jusqu'à deux.</p>
${D(["q0","q1","q2"],["q0"],["q2"],[["q0","a","q0"],["q0","b","q1"],["q1","a","q1"],["q1","b","q2"],["q2","a","q2"],["q2","b","q2"]])}
<p>Exercice 2 : entre deux b successifs, un nombre impair de a. Entre deux b, le bloc est ${E("a(aa)*b")}. Le corrigé : ${E("a*(ε + b(a(aa)*b)*)a*")}. Le premier ${E("a*")} et le dernier ${E("a*")} servent aux mots sans b ou à un seul b (aabaaa).</p>
<p>L'automate du corrigé retient la parité des a lus depuis le dernier b ; ⊥ est le puits, tous les autres états sont acceptants :</p>
${D(["q0","q1","q2","q3","⊥"],["q0"],["q0","q1","q2","q3"],[["q0","a","q0"],["q0","b","q1"],["q1","a","q2"],["q1","b","⊥"],["q2","a","q3"],["q2","b","q1"],["q3","a","q2"],["q3","b","⊥"],["⊥","a","⊥"],["⊥","b","⊥"]])}
<p>q1 et q3 font le même travail (un nombre pair de a depuis le dernier b) : on peut les fusionner, 4 états suffisent.</p>`,
  piege:`N'oublie pas les mots courts : ε, les mots sans b, les mots à un seul b. Une expression qui commence par un b obligatoire perd aabaaa.`},
 {id:"qcm",t:"QCM : mots acceptés, sous-mots",pts:2.5,ou:"QCM, questions 1 et 4 (janvier 2026)",lect:1.5,exo:{g:"AU2",lv:1},
  ess:`<ul><li>Un mot est accepté s'il existe <b>un</b> chemin de l'état initial à un état acceptant qui le lit. Dans un automate non déterministe, on suit l'ensemble des états possibles, lettre après lettre. Une flèche absente : ce chemin meurt.</li>
<li>Le mot vide ε est accepté si l'état initial est acceptant.</li>
<li>Un sous-mot s'obtient en effaçant des lettres sans changer l'ordre ; un facteur est un morceau d'un seul tenant.</li></ul>`,
  meth:`<p>Question 4 : l'état initial 1 est acceptant, 4 est un puits.</p>
${D(["1","2","3","4"],["1"],["1","3"],[["1","a","2"],["1","b","2"],["2","a","1"],["2","b","3"],["1","b","3"],["1","a","4"],["3","a","3"],["4","a","4"],["4","b","4"]])}
<ul><li>ε : 1 est acceptant, oui. ab : 1 → 2 → 3, oui.</li>
<li>babb : {1} → {2, 3} → {1, 3} → {2, 3} → {3}, oui. aaba : {1} → {2, 4} → {1, 4} → {2, 3, 4} → {1, 3, 4}, oui.</li>
<li>bbab : {1} → {2, 3} → {3} → {3} → ∅, non.</li></ul>
<p>Question 1, sous-mot de abcabcabc : acbac (lettres 1, 3, 5, 7, 9), oui. aabbcc, abcbba, abacbab : non, on tombe à court de lettres.</p>`,
  piege:`Dans un automate non déterministe, un chemin qui échoue ne prouve rien : il faut que tous échouent pour refuser le mot.`}],
 blanc:[
  {t:"QCM : les sous-mots",ou:"QCM, question 1 (janvier 2026)",pts:2,g:"AU1",lv:1},
  {t:"Déterminiser un automate à quatre états",ou:"exercice 3 (janvier 2026)",pts:5,g:"AU5",lv:1},
  {t:"Un automate pour un langage des sujets",ou:"exercice 2 (janvier 2026) ; question 1 (2023, 2024)",pts:4,g:"AU4",lv:2},
  {t:"Les quotients d'un langage décrit",ou:"exercice 4, question 1 (janvier 2026)",pts:5,g:"AU6",lv:1},
  {t:"Quotients par deux lettres",ou:"exercice 4, question 2 (janvier 2026)",pts:4,g:"AU6",lv:5}]
}};})();
