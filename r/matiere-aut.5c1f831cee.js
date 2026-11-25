/* Automates : « Jouons aux automates » (HAI104I, Anne-Élisabeth Baert).
   Un seul examen écrit en janvier, 1 h, aucun document ni matériel, 100 % de la note, coefficient 3 du bloc info (MCC 2026-2027).
   Sujets : janvier 2026 (1 h, sujet et corrigé officiels), janvier 2025 (2 h, corrigé officiel), janvier 2023 et 2024, juin 2023 et 2024 (2 h) dans Moodle-S1/HAI104I.
   La page de la matière, l'examen en 1 h (express-aut.js), les générateurs (gen-aut.js) et les leçons (lecons-aut.js).
   Couleur saumon : son choix AUT1a du 24/11. */
(function(){
window.SUBJ=window.SUBJ||{};
const infos=`<p><b>L'examen</b> : 1 h, aucun document ni matériel, 100 % de la note de l'UE (coefficient 3 du bloc informatique). Session 1 entre le 4 et le 15 janvier ; le jour n'est pas encore publié. Seconde chance : un écrit d'1 h en juin.</p>
<p><b>La forme du sujet de janvier 2026</b> (même enseignante), barème indicatif :</p>
<ul><li>QCM, 5 points : un sous-mot, deux questions d'expressions régulières, les mots acceptés par un automate. Une mauvaise case coûte 0,5 point.</li>
<li>Exercice 1, 1 point : un automate complet à 3 états pour un langage décrit.</li>
<li>Exercice 2, 2 points : une expression régulière et un automate pour un langage décrit.</li>
<li>Exercice 3, 3 points : déterminiser un automate.</li>
<li>Exercice 4, 9 points : les quotients à gauche L<sub>u</sub> = { v | uv ∈ L } : sur des exemples, tous les quotients d'un langage et l'automate qu'ils forment, la preuve que L<sub>u</sub> est reconnaissable, les règles, le quotient d'une expression.</li></ul>
<p><b>Janvier 2025</b> (2 h, une feuille A4 recto verso permise) : un automate pour « pair de a ou pair de b » (2 points), un système de trois équations de langages (4 points), l'automate combiné pour l'union, l'intersection, la différence, l'inclusion et l'égalité (7,5 points), la fermeture préfixe Pref(L) (7 points).</p>
<p><b>Les sujets de 2023 et 2024</b> (en 2 h) avaient la même forme avec une autre opération à la place du quotient (enlever la première lettre L<sup>−p</sup>, la dernière L<sup>−d</sup>, le miroir, a⁻¹L), plus le complémentaire d'un automate non déterministe et les équations de langages. Les équations sont tombées en 2023, 2024 et 2025, pas en 2026.</p>
<p class="muted">Date de l'examen supposée : le premier jour de la session (lundi 4/01), pour que les révisions soient prêtes quel que soit le jour. Elle sera corrigée quand elle paraîtra dans Prose.</p>`;
SUBJ.aut={name:"Automates",code:"HAI104I",color:"#FF9470",coef:3,share:1,key:"rev-aut-v1",from:"2026-12-18",
 exams:[{id:"exam",label:"Examen",day:"2027-01-04",start:"09:00",end:"10:00",place:"salle à confirmer",dur:"1 h",share:1,unsure:"Date supposée : la session 1 va du 4 au 15 janvier et le jour n'est pas encore publié. J'ai pris le premier jour, pour que tout soit prêt à temps. Je la corrigerai quand elle sera dans Prose."}],
 docs:"aucun",examMinutes:30,examMorning:"Refais de tête une déterminisation et les quotients de a*b* avec leur automate, puis relis la preuve « Lu est reconnaissable ».",
 prog:"Tout le cours : mots et langages (préfixe, suffixe, facteur, sous-mot, ordre lexicographique), expressions régulières, automates déterministes et non déterministes, déterminisation, complémentaire, automate combiné (union, intersection, inclusion, égalité), automates standards, union, produit et étoile, langages reconnaissables et opérations sur les langages (quotient, miroir, préfixes), équations de langages.",
 chapters:{1:"1. Mots et langages",2:"2. Expressions régulières",3:"3. Automates, déterminisation",4:"4. Opérations sur les langages"},
 concepts:[],quiz:[],td:[],ann:[],
 tdTitle:"Exercices corrigés",tdPrefix:"Ex.",
 pages:[{id:"infos",t:"L'examen en bref",html:infos}],
 /* thèmes : points du sujet de janvier 2026 (1 h), le modèle de l'examen */
 themes:[
  {id:"quotients",t:"Quotients à gauche et opérations sur les langages",pts:9,src:"exercice 4 en 2026 (9 points) ; une opération sur les langages tous les ans (9 à 11 points sur 20 en 2023 et 2024, la fermeture préfixe pour 7 points en 2025)"},
  {id:"er",t:"Expressions régulières",pts:3.5,src:"QCM 2 et 3 (2,5 points) et exercice 2 (1 point) en 2026"},
  {id:"det",t:"Déterminiser, complémentaire et automate combiné",pts:3,src:"exercice 3 en 2026 ; 3 à 4 points en 2023 et 2024 ; l'automate combiné (union, intersection, inclusion, égalité) : 7,5 points en 2025, pas en 2026"},
  {id:"construire",t:"Construire un automate pour un langage décrit",pts:2,src:"exercice 1 et exercice 2 en 2026 ; question 1 en 2023 et 2024"},
  {id:"lire",t:"Lire un automate : les mots acceptés",pts:1.25,src:"QCM 4 en 2026"},
  {id:"mots",t:"Mots : préfixe, suffixe, facteur, sous-mot",pts:1.25,src:"QCM 1 en 2026 ; l'ordre lexicographique en 2024"}],
 tasks:[]};
})();
