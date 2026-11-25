/* Chapitre 3 : parallélogrammes et vecteurs ; chapitre 4 : résultats de TD */
(function(){
const {V,D,R,d,dpx,fl,fa,fr,ang,absang,mid,proj,param,inter,sym,rot,reflect,side,onLine,onSeg,onRay,snapLine,near,parallel,unit,perp,add,sub,mul,lerp,segInter,crs,PI}=G;
const an=s=>`<span class="ang">${s}</span>`, m=s=>`<span class="m">${s}</span>`, hl=s=>`<span class="hl">${s}</span>`, vc=s=>`<span class="vec">${s}</span>`;
const C=window.CONCEPTS;
const push3=o=>{o.ch=3;C.push(o);}, push4=o=>{o.ch=4;C.push(o);};
const yes=(b,t1,t2)=>b?`<span class="ok">${t1||"oui"}</span>`:`<span class="no">${t2||"non"}</span>`;
const tri=(A,B,Cc,cl,fill)=>(fill?D.poly([A,B,Cc],fill):"")+D.pline([A,B,Cc,A],cl||"l-ink");
const quad=(A,B,Cc,Dd,cl)=>D.pline([A,B,Cc,Dd,A],cl||"l-ink");
const ctr4=P=>V((P.A.x+P.B.x+P.C.x+(P.D?P.D.x:P.A.x))/4,(P.A.y+P.B.y+P.C.y+(P.D?P.D.y:P.A.y))/4);

/* ---------------- Parallélogramme ---------------- */
push3({id:"parallelogramme",type:"def",ref:"Déf 3.1.1 et 3.1.4",t:"Le parallélogramme",
 plain:`Dans ce cours, ABCD est un parallélogramme quand ${hl("ses deux diagonales [AC] et [BD] se coupent en leur milieu")}. Ce n'est pas la définition du collège (côtés parallèles), mais on retrouve les mêmes figures.`,
 fig:()=>({w:560,h:320,P:{A:[110,250],B:[170,90],C:[440,80],D:[400,260]},
   con:{D:(p,P)=>{const Q=add(P.A,sub(P.C,P.B));return dpx(p,Q)<10?Q:p;}},
   draw:(P)=>{const I=mid(P.A,P.C),J=mid(P.B,P.D),ok=dpx(I,J)<0.5;
     return D.poly([P.A,P.B,P.C,P.D],ok?"f-ok":"f-ink")+quad(P.A,P.B,P.C,P.D,"l-ink")+D.seg(P.A,P.C,"l-cob-d")+D.seg(P.B,P.D,"l-amb-d")+(ok?D.dot(I,"p-ok",6):D.dot(I,"p-cob",5)+D.dot(J,"p-fix",5)+D.lab(I,"milieu de [AC]",J,"t-cob t-up",24)+D.lab(J,"milieu de [BD]",I,"t-amb t-up",24));},
   info:(P)=>{const I=mid(P.A,P.C),J=mid(P.B,P.D),ok=dpx(I,J)<0.5;return R.m([["AB",fl(P.A,P.B)],["CD",fl(P.C,P.D)],["AD",fl(P.A,P.D)],["BC",fl(P.B,P.C)],["écart des milieux",fr(d(I,J))]])+R.v(ok?"Les diagonales ont le même milieu : ABCD est un parallélogramme.":"Les deux milieux sont différents : pas un parallélogramme.",ok?"ok":"");},
   goal:{text:"déplace D pour que les deux milieux se rejoignent.",ok:(P)=>dpx(mid(P.A,P.C),mid(P.B,P.D))<0.5,win:"ABCD est un parallélogramme. Regarde les longueurs : AB = CD et AD = BC (Prop 3.1.2)."}}),
 formal:`<p><b>Définition 3.1.1.</b> Un quadrilatère ABCD est un parallélogramme si les diagonales [AC] et [BD] ont ${hl("même milieu")}.</p><p><b>Définition 3.1.4.</b> ABCD non dégénéré est un trapèze si (AB) // (CD) ou (AD) // (BC) ; un rectangle si ses quatre angles sont droits ; un losange si ses quatre côtés ont même longueur ; un carré si c'est à la fois un rectangle et un losange.</p>`,
 use:`<p>Pour montrer qu'un quadrilatère est un parallélogramme : montre que les diagonales ont le même milieu (définition), ou utilise un critère de la Prop 3.1.3. Ensuite, la Prop 3.1.2 donne côtés parallèles et égaux.</p>`,
 trap:`Attention à l'ordre des sommets : les diagonales de ABCD sont [AC] et [BD]. ABDC n'est pas le même quadrilatère.`,
 q:"Quelle est la définition d'un parallélogramme ABCD dans ce cours ?",a:"ABCD est un parallélogramme si les diagonales [AC] et [BD] ont le même milieu.",
 rel:["demo-3-1-2","criteres-parallelogramme","demo-2-2-4"]});

/* ---------------- Démo 3.1.2 ---------------- */
push3({id:"demo-3-1-2",type:"demo",ref:"Proposition 3.1.2",t:"Démo : les côtés opposés d'un parallélogramme",
 plain:`Dans un parallélogramme, les côtés opposés sont parallèles et de même longueur. Preuve en une idée : ${hl("la symétrie autour du centre O")} envoie A sur C et B sur D, donc le côté [AB] sur le côté [CD].`,
 hyp:"ABCD est un parallélogramme : [AC] et [BD] ont le même milieu O.",concl:"(AB) // (CD), AB = CD, (AD) // (BC) et AD = BC.",
 idea:`s = symétrie de centre O. s(A) = C et s(B) = D, et le Thm 2.2.3 fait tout le reste.`,
 fig:()=>({w:560,h:300,P:{A:[110,240],B:[170,80],C:[440,70]},S:{step:0},
   draw:(P,S)=>{const k=S.step,Dd=add(P.A,sub(P.C,P.B)),O=mid(P.A,P.C);let s=quad(P.A,P.B,P.C,Dd,"l-ink")+D.seg(P.A,P.C,"l-cons")+D.seg(P.B,Dd,"l-cons")+D.pt(Dd,"D",O)+D.pt(O,"O",P.B,"pk1","tk1");
     if(k===0)s+=D.ticks(P.A,O,1,"l-cob")+D.ticks(O,P.C,1,"l-cob")+D.ticks(P.B,O,2,"l-amb")+D.ticks(O,Dd,2,"l-amb");
     if(k===1)s+=D.line(P.A,P.B,"lk3d")+D.line(P.C,Dd,"lk3");
     if(k===2)s+=D.seg(P.A,P.B,"lk3")+D.seg(P.C,Dd,"lk3")+D.ticks(P.A,P.B,1,"l-cob")+D.ticks(P.C,Dd,1,"l-cob");
     if(k===3)s+=D.line(P.A,Dd,"lk5d")+D.line(P.B,P.C,"lk5")+D.ticks(P.A,Dd,2,"l-amb")+D.ticks(P.B,P.C,2,"l-amb");
     return s;},
   info:(P)=>{const Dd=add(P.A,sub(P.C,P.B));return R.m([["AB",fl(P.A,P.B)],["CD",fl(P.C,Dd)],["AD",fl(P.A,Dd)],["BC",fl(P.B,P.C)]]);}}),
 steps:[
  {w:"Soit O le milieu commun de [AC] et [BD], et s = s<sub>O</sub>. Alors s(A) = C et s(B) = D.",why:"O est le milieu de [AC] : par définition (et unicité, Lemme 2.2.1), le symétrique de A est C. Pareil pour B et D."},
  {w:"s((AB)) = (s(A)s(B)) = (CD). D'après le Thm 2.2.3 (2), cette image est parallèle à (AB) : (AB) // (CD).",why:"L'image d'une droite par une symétrie centrale est une droite parallèle."},
  {w:"s est une isométrie (Thm 2.2.3 (1)) : CD = s(A)s(B) = AB.",why:"Les distances sont conservées."},
  {w:"On montre de même, avec s(A) = C et s(D) = B, que (AD) // (BC) et AD = BC.",why:"Même raisonnement avec l'autre paire de côtés."}],
 redac:`<p>Soit O le milieu commun de [AC] et [BD], et s = s<sub>O</sub>. Alors s(A) = C et s(B) = D, donc s((AB)) = (CD), et on en déduit que (AB) // (CD) et AB = s(A)s(B) = CD par 2.2.3. On montre de même que (AD) // (BC) et AD = BC.</p>`,
 rel:["parallelogramme","thm-2-2-3","criteres-parallelogramme"]});

/* ---------------- Prop 3.1.3 ---------------- */
function papillon(P){const I=mid(P.A,P.C),J=add(I,perp(sub(P.C,P.A)));return reflect(P.B,I,J);}
push3({id:"criteres-parallelogramme",type:"th",ref:"Prop 3.1.3",t:"Reconnaître un parallélogramme",short:"Critères du parallélogramme",
 plain:`Trois façons de prouver qu'un quadrilatère est un parallélogramme : ${hl("deux paires de côtés parallèles")} ; ${hl("deux paires de côtés de même longueur")} + une condition de position ; ${hl("une paire de côtés parallèles et de même longueur")} + la même condition.`,
 fig:()=>({w:560,h:320,P:{A:[120,250],B:[170,90],C:[440,80],D:[330,220]},
   buttons:[{label:"Parallélogramme",act:(P)=>{P.D=add(P.A,sub(P.C,P.B));}},{label:"Contre-exemple « papillon »",act:(P)=>{P.D=papillon(P);}}],
   con:{D:(p,P)=>{const Q=add(P.A,sub(P.C,P.B)),Q2=papillon(P);return dpx(p,Q)<9?Q:dpx(p,Q2)<9?Q2:p;}},
   draw:(P)=>{const ok=dpx(mid(P.A,P.C),mid(P.B,P.D))<0.5;return D.poly([P.A,P.B,P.C,P.D],ok?"f-ok":"f-ink")+quad(P.A,P.B,P.C,P.D,"l-ink")+D.seg(P.A,P.C,"l-cons")+D.seg(P.B,P.D,"l-cons");},
   info:(P)=>{const pAB=parallel(P.A,P.B,P.C,P.D,0.003),pAD=parallel(P.A,P.D,P.B,P.C,0.003),eAB=Math.abs(d(P.A,P.B)-d(P.C,P.D))<0.02,eAD=Math.abs(d(P.A,P.D)-d(P.B,P.C))<0.02;
     const sep=side(P.B,P.A,P.C)*side(P.D,P.A,P.C)<0||side(P.A,P.B,P.D)*side(P.C,P.B,P.D)<0,ok=dpx(mid(P.A,P.C),mid(P.B,P.D))<0.5;
     return R.m([["(i) côtés parallèles",yes(pAB&&pAD)],["(ii) côtés égaux",yes(eAB&&eAD)],["une diagonale sépare",yes(sep)],["(iii) une paire // et =",yes(pAB&&eAB)],["parallélogramme ?",yes(ok)]])
      +R.v(ok?"Les diagonales ont le même milieu : c'est un parallélogramme.":(eAB&&eAD&&!sep)?"AB = CD et AD = BC, mais aucune diagonale ne sépare les deux autres sommets : ce n'est PAS un parallélogramme.":"Pas un parallélogramme.",ok?"ok":"");},
   hint:"Essaie les deux boutons, puis déplace D."}),
 formal:`<p><b>Proposition 3.1.3.</b> Soient A, B, C, D quatre points deux à deux distincts et non alignés. Dans chacun des cas suivants, ABCD est un parallélogramme :</p><ul><li>(i) (AB) // (CD) et (AD) // (BC) ;</li><li>(ii) AB = CD, AD = BC, et ${hl("une des diagonales sépare les deux autres points")} ;</li><li>(iii) (AB) // (CD), AB = CD, et une des diagonales sépare les deux autres points.</li></ul><p class="ref">(i) est le Cor 2.2.4. (ii) : triangles ABD et CDB isométriques puis alternes-internes. (iii) : alternes-internes puis (ii).</p>`,
 use:`<p>Choisis le critère qui colle aux hypothèses : des parallèles → (i) ; des longueurs → (ii) ; une paire parallèle et de même longueur → (iii). Le CC1 2024 Ex. 2 (d) finit avec (i).</p>`,
 trap:`AB = CD et AD = BC ne suffisent pas : le « papillon » (bouton) a les mêmes longueurs sans être un parallélogramme. La condition « une diagonale sépare » est indispensable.`,
 q:"AB = CD et AD = BC. ABCD est-il forcément un parallélogramme ?",a:"Non. Il faut en plus qu'une diagonale sépare les deux autres sommets (Prop 3.1.3 (ii)). Sinon, on peut avoir un « papillon ».",
 rel:["parallelogramme","demo-2-2-4","alternes-internes"]});

/* ---------------- Équipollence ---------------- */
push3({id:"equipollence",type:"def",ref:"Déf 3.2.1 et Rem 3.2.5",t:"Couples équipollents",
 plain:`Deux couples de points (A, B) et (A′, B′) sont équipollents quand ${hl("la flèche de A vers B et celle de A′ vers B′ sont « la même flèche » déplacée")} : même direction, même sens, même longueur. Formellement : ABB′A′ est un parallélogramme.`,
 fig:()=>({w:560,h:320,P:{A:[100,230],B:[250,120],Ap:[290,260],Bp:[420,170]},labels:{Ap:"A′",Bp:"B′"},S:{other:false},
   toggles:[{k:"other",label:"Montrer AA′ et BB′"}],
   con:{Bp:(p,P)=>{const Q=add(P.Ap,sub(P.B,P.A));return dpx(p,Q)<10?Q:p;}},
   draw:(P,S)=>{const ok=dpx(mid(P.A,P.Bp),mid(P.B,P.Ap))<0.5;let s=quad(P.A,P.B,P.Bp,P.Ap,"l-cons")+D.seg(P.A,P.Bp,"l-thin")+D.seg(P.B,P.Ap,"l-thin")+D.vec(P.A,P.B,"l-cob","cob")+D.vec(P.Ap,P.Bp,ok?"l-cob":"l-red",ok?"cob":"red");
     if(S.other)s+=D.vec(P.A,P.Ap,"l-amb","amb")+D.vec(P.B,P.Bp,"l-amb","amb");
     s+=D.dot(mid(P.A,P.Bp),"p-cob",4)+D.dot(mid(P.B,P.Ap),"p-fix",4);return s;},
   info:(P)=>{const ok=dpx(mid(P.A,P.Bp),mid(P.B,P.Ap))<0.5;return R.m([["AB",fl(P.A,P.B)],["A′B′",fl(P.Ap,P.Bp)],["milieux de [AB′] et [BA′]",ok?"confondus":"différents"]])+R.v(ok?"ABB′A′ est un parallélogramme : (A, B) ∼ (A′, B′). Et aussi (A, A′) ∼ (B, B′) : c'est la Remarque 3.2.5.":"ABB′A′ n'est pas un parallélogramme.",ok?"ok":"");},
   goal:{text:"place B′ pour que la flèche A′B′ soit la même que AB.",ok:(P)=>dpx(mid(P.A,P.Bp),mid(P.B,P.Ap))<0.5,win:"(A, B) ∼ (A′, B′). Active « Montrer AA′ et BB′ » : ces deux flèches sont aussi égales."}}),
 formal:`<p><b>Définition 3.2.1.</b> (A, B) et (A′, B′) sont équipollents si le quadrilatère ${hl("ABB′A′")} est un parallélogramme. On note (A, B) ∼ (A′, B′).</p><p><b>Remarque 3.2.5.</b> ${vc("AB")} = ${vc("A′B′")} ⇔ ${vc("AA′")} = ${vc("BB′")} : les deux disent que ABB′A′ est un parallélogramme.</p>`,
 gloss:["∼ : « équipollent à »","ABB′A′ : l'ordre des lettres compte"],
 use:`<p>La Remarque 3.2.5 est l'outil de la démo 3.2.8 : on l'utilise trois fois de suite.</p>`,
 trap:`L'ordre des lettres : ABB′A′, pas ABA′B′. Ses diagonales sont [AB′] et [BA′].`,
 q:"(A, B) ∼ (A′, B′) veut dire que quel quadrilatère est un parallélogramme ?",a:"ABB′A′ (diagonales [AB′] et [BA′] de même milieu).",
 rel:["vecteur","parallelogramme","demo-3-2-8"]});

/* ---------------- Vecteur ---------------- */
push3({id:"vecteur",type:"def",ref:"Prop 3.2.2 et Déf 3.2.4",t:"Le vecteur",
 plain:`Un vecteur, c'est ${hl("une flèche qu'on a le droit de faire glisser")} sans la tourner ni l'étirer. Formellement : l'ensemble de tous les couples équipollents à (A, B). Chacun de ces couples est un représentant.`,
 fig:()=>({w:560,h:320,P:{A:[90,240],B:[200,160],P:[330,230]},labels:{P:"P"},
   draw:(P)=>{const u=sub(P.B,P.A);let s="";[[60,70],[200,60],[380,70],[470,200],[300,120],[160,290]].forEach(q=>{const S=V(q[0],q[1]);s+=D.vec(S,add(S,u),"l-cons","ink");});
     return s+D.vec(P.A,P.B,"l-cob","cob")+D.vec(P.P,add(P.P,u),"l-amb","amb")+D.pt(add(P.P,u),"P + u",P.P,"p-fix","t-amb");},
   info:(P)=>R.v("Toutes ces flèches représentent le même vecteur u = "+vc("AB")+". Déplace P : sa flèche reste un représentant de u.","info"),
   hint:"Change u avec A et B, déplace P."}),
 formal:`<p><b>Proposition 3.2.2.</b> L'équipollence est une relation d'équivalence : réflexive ((A, B) ∼ (A, B)), symétrique, et transitive (si (A, B) ∼ (A′, B′) et (A′, B′) ∼ (A″, B″), alors (A, B) ∼ (A″, B″)).</p><p><b>Définition 3.2.4.</b> Un vecteur du plan est une classe d'équipollence de couples de points. Si (A, B) en est un représentant, on note ${vc("u")} = ${vc("AB")}.</p><p>Le vecteur nul ${vc("0")} = ${vc("AA")} : (C, D) le représente si et seulement si C = D.</p>`,
 gloss:["classe d'équivalence : tous les objets « équivalents » à un objet donné","représentant : un couple choisi dans la classe"],
 use:`<p>${vc("AB")} = ${vc("A′B′")} se traduit toujours par « ABB′A′ est un parallélogramme ». C'est cette traduction qu'on utilise dans les démos.</p>`,
 trap:`La transitivité n'est pas évidente (la preuve du poly utilise le théorème des milieux), mais tu peux l'utiliser librement.`,
 q:"Qu'est-ce qu'un vecteur dans ce cours ?",a:"Une classe d'équipollence de couples de points : l'ensemble de tous les couples équipollents à un couple (A, B) donné.",
 rel:["equipollence","demo-3-2-6","somme-vecteurs"]});

/* ---------------- Démo 3.2.6 ---------------- */
push3({id:"demo-3-2-6",type:"demo",ref:"Lemme 3.2.6",t:"Démo : le translaté d'un point par un vecteur",
 plain:`On veut faire partir la flèche ${vc("u")} d'un point A donné. On trouve l'extrémité B grâce à ${hl("un milieu et une symétrie centrale")}, en fabriquant un parallélogramme.`,
 hyp:`${vc("u")} est un vecteur et A un point.`,concl:`il existe un unique point B tel que ${vc("u")} = ${vc("AB")}.`,
 idea:`Prends M le milieu de [AD], puis B le symétrique de C par rapport à M : les diagonales [AD] et [CB] ont le même milieu.`,
 fig:()=>({w:560,h:320,P:{C:[90,250],D:[250,200],A:[230,80]},S:{step:0},
   draw:(P,S)=>{const k=S.step,M=mid(P.A,P.D),B=sym(P.C,M);let s=D.vec(P.C,P.D,"lk1","k1")+D.txt(mid(P.C,P.D),"u","tk1",-6,18);
     if(k>=1)s+=D.seg(P.A,P.D,"l-cons")+D.pt(M,"M",P.C,"pk2","tk2")+D.ticks(P.A,M,1,"l-amb")+D.ticks(M,P.D,1,"l-amb");
     if(k>=1)s+=D.seg(P.C,B,"l-cons")+D.pt(B,"B",M,"pk3","tk3")+D.ticks(P.C,M,2,"l-thin")+D.ticks(M,B,2,"l-thin");
     if(k>=2)s+=quad(P.A,B,P.D,P.C,"l-thin");
     if(k>=3)s+=D.vec(P.A,B,"lk1","k1");
     return s;},
   info:(P)=>{const M=mid(P.A,P.D),B=sym(P.C,M);return R.m([["CD",fl(P.C,P.D)],["AB",fl(P.A,B)],["(AB) // (CD) ?",yes(parallel(P.A,B,P.C,P.D,0.001))]]);},
   hint:"Déplace A, C ou D."}),
 steps:[
  {w:`Soit (C, D) un représentant de ${vc("u")} : ${vc("u")} = ${vc("CD")}.`,why:"Un vecteur a toujours au moins un représentant : on part de lui."},
  {w:"Soit M le milieu de [AD]. D'après le lemme 2.2.1, il existe un unique point B tel que M soit le milieu de [CB].",why:"B est le symétrique de C par rapport à M."},
  {w:"[AD] et [CB] ont le même milieu M, donc ABDC est un parallélogramme.",why:"C'est exactement la définition 3.1.1 : les diagonales de ABDC sont [AD] et [BC]."},
  {w:`Par définition de l'équipollence, (A, B) ∼ (C, D), c'est-à-dire ${vc("AB")} = ${vc("CD")} = ${vc("u")}.`,why:"(A, B) ∼ (C, D) signifie que ABDC est un parallélogramme (Déf 3.2.1)."},
  {w:`Unicité : si ${vc("AB′")} = ${vc("u")}, alors AB′DC est un parallélogramme, donc M est le milieu de [CB′], et B′ = B par l'unicité du lemme 2.2.1.`,why:"Il n'y a qu'un seul point dont M est le milieu avec C."}],
 redac:`<p>Soit (C, D) un représentant de ${vc("u")}. On a donc ${vc("u")} = ${vc("CD")}. Soit M le milieu de [AD]. D'après le lemme 2.2.1, il existe un unique point B tel que M soit le milieu de [CB], c'est-à-dire tel que [AD] et [CB] aient même milieu. Alors ABDC est un parallélogramme, donc (A, B) ∼ (C, D), autrement dit ${vc("AB")} = ${vc("CD")} = ${vc("u")}.</p><p>Si B′ vérifie aussi ${vc("AB′")} = ${vc("u")}, alors AB′DC est un parallélogramme, M est le milieu de [CB′], et B′ = B par l'unicité dans le lemme 2.2.1.</p>`,
 rel:["vecteur","symetrie-centrale","demo-3-2-8"]});

/* ---------------- Somme de vecteurs ---------------- */
push3({id:"somme-vecteurs",type:"def",ref:"Déf 3.2.7, Prop 3.2.9 et 3.2.10",t:"La somme de deux vecteurs, Chasles",short:"Somme de vecteurs et Chasles",
 plain:`Pour ajouter ${vc("u")} et ${vc("v")}, on ${hl("met les flèches bout à bout")} : on fait partir ${vc("v")} du bout de ${vc("u")}. La somme va du départ de la première au bout de la seconde.`,
 fig:()=>({w:560,h:320,P:{A:[80,250],B:[230,160],C:[330,280],D:[430,220]},S:{par:false},
   toggles:[{k:"par",label:"Règle du parallélogramme"}],
   draw:(P,S)=>{const v=sub(P.D,P.C),E=add(P.B,v);let s=D.vec(P.A,P.B,"l-cob","cob")+D.vec(P.C,P.D,"l-amb","amb")+D.vec(P.B,E,"l-amb","amb")+D.vec(P.A,E,"l-ok","ok")+D.pt(E,"E",P.A,"p-ok","t-ok")+D.txt(mid(P.A,P.B),"u","t-cob",-12,-6)+D.txt(mid(P.C,P.D),"v","t-amb",0,18);
     if(S.par){const Dp=add(P.A,v);s+=D.vec(P.A,Dp,"l-amb-d","amb")+D.seg(Dp,E,"l-cons")+D.pt(Dp,"D′",P.B,"p-fix","t-amb");}
     return s;},
   info:(P)=>R.v(`${vc("u")} + ${vc("v")} = ${vc("AE")}, où E est le point tel que ${vc("BE")} = ${vc("v")}. Avec E = C, c'est Chasles : ${vc("AB")} + ${vc("BC")} = ${vc("AC")}.`,"info"),
   hint:"Bleu : u. Orange : v, recopié au bout de u. Vert : la somme."}),
 formal:`<p><b>Définition 3.2.7.</b> Soient ${vc("u")} = ${vc("AB")} et ${vc("v")} = ${vc("CD")}. Soit E l'unique point tel que ${vc("BE")} = ${vc("CD")} (Lemme 3.2.6). On pose ${hl(`${vc("u")} + ${vc("v")} = ${vc("AE")}`)}.</p><p><b>Proposition 3.2.9 (Chasles).</b> ${vc("AC")} = ${vc("AB")} + ${vc("BC")}.</p><p><b>Proposition 3.2.10.</b> ${vc("AB")} + ${vc("AD")} = ${vc("AE")} ⇔ ABED est un parallélogramme.</p><p>Avec la multiplication par un réel (Déf 3.2.11), les vecteurs forment un espace vectoriel réel (Prop 3.2.12).</p>`,
 use:`<p>Chasles sert à décomposer un vecteur en passant par un point intermédiaire. La règle du parallélogramme (3.2.10) relie somme et parallélogramme.</p>`,
 trap:`La définition dépend a priori des représentants choisis : il faut le vérifier, c'est la démo 3.2.8.`,
 q:`Que vaut ${vc("AB")} + ${vc("BC")} ?`,a:`${vc("AC")} : c'est la relation de Chasles (Prop 3.2.9).`,
 rel:["demo-3-2-8","demo-3-2-6","vecteur"]});

/* ---------------- Démo 3.2.8 ---------------- */
push3({id:"demo-3-2-8",type:"demo",ref:"Proposition 3.2.8",t:"Démo : la somme de deux vecteurs est bien définie",
 plain:`On définit ${vc("u")} + ${vc("v")} avec des représentants choisis. Il faut vérifier qu'${hl("un autre choix donne le même résultat")}. La preuve utilise trois fois la Remarque 3.2.5 et la transitivité.`,
 hyp:`${vc("AB")} = ${vc("A′B′")} = ${vc("u")}, ${vc("CD")} = ${vc("C′D′")} = ${vc("v")}, E et E′ tels que ${vc("BE")} = ${vc("CD")} et ${vc("B′E′")} = ${vc("C′D′")}.`,concl:`${vc("AE")} = ${vc("A′E′")} : la somme ne dépend pas des représentants.`,
 idea:`Remarque 3.2.5 : ${vc("AB")} = ${vc("A′B′")} ⇔ ${vc("AA′")} = ${vc("BB′")}. On fait passer l'égalité de B à E, puis de A à E.`,
 fig:()=>({w:580,h:330,P:{A:[60,250],B:[180,170],Ap:[260,290],C:[360,90],Dv:[450,60]},labels:{Ap:"A′",Dv:"D"},S:{step:0},
   draw:(P,S)=>{const k=S.step,u=sub(P.B,P.A),v=sub(P.Dv,P.C),Bp=add(P.Ap,u),E=add(P.B,v),Ep=add(Bp,v);
     let s=D.vec(P.A,P.B,"l-cob","cob")+D.vec(P.Ap,Bp,"l-cob","cob")+D.vec(P.C,P.Dv,"l-amb","amb")+D.vec(P.B,E,"l-amb","amb")+D.vec(Bp,Ep,"l-amb","amb")+D.pt(Bp,"B′",P.Ap,"p-fix")+D.pt(E,"E",P.B,"pk1","tk1")+D.pt(Ep,"E′",Bp,"pk5","tk5");
     if(k===0)s+=D.txt(V(16,26),"BE = CD = B′E′","t-amb t-up");
     if(k>=1)s+=D.vec(P.B,Bp,"l-red","red")+D.vec(E,Ep,"l-red","red");
     if(k>=2)s+=D.vec(P.A,P.Ap,"l-red","red");
     if(k>=4)s+=D.vec(P.A,E,"l-ok","ok")+D.vec(P.Ap,Ep,"l-ok","ok");
     return s;},
   info:(P,S)=>{const k=S.step;const t=["Les deux flèches orange depuis B et B′ représentent v.","Rem 3.2.5 : BE = B′E′ ⇔ BB′ = EE′ (rouges).","Rem 3.2.5 : AB = A′B′ ⇔ AA′ = BB′.","Transitivité : AA′ = BB′ = EE′.","Rem 3.2.5 : AA′ = EE′ ⇔ AE = A′E′ (vertes)."][k];return R.v(t,"info");},
   hint:"Déplace A, B, A′, C ou D."}),
 steps:[
  {w:`${vc("BE")} = ${vc("CD")} = ${vc("C′D′")} = ${vc("B′E′")}, donc ${vc("BE")} = ${vc("B′E′")}.`,why:"Transitivité de l'équipollence (Prop 3.2.2)."},
  {w:`Par la Remarque 3.2.5, ${vc("BB′")} = ${vc("EE′")}.`,why:"BE = B′E′ ⇔ BB′ = EE′ : les deux disent que BEE′B′ est un parallélogramme."},
  {w:`De même, ${vc("AB")} = ${vc("A′B′")} donne ${vc("AA′")} = ${vc("BB′")}.`,why:"Remarque 3.2.5 appliquée au couple (A, B)."},
  {w:`Par transitivité, ${vc("AA′")} = ${vc("EE′")}.`,why:"AA′ = BB′ et BB′ = EE′."},
  {w:`Encore par la Remarque 3.2.5, ${vc("AE")} = ${vc("A′E′")}. Le vecteur somme ne dépend donc pas des représentants choisis.`,why:"AA′ = EE′ ⇔ AE = A′E′."}],
 redac:`<p>Supposons avoir différents représentants : ${vc("AB")} = ${vc("A′B′")} = ${vc("u")} et ${vc("CD")} = ${vc("C′D′")} = ${vc("v")}. Soient E et E′ les points tels que ${vc("BE")} = ${vc("CD")} et ${vc("B′E′")} = ${vc("C′D′")}. Alors ${vc("BE")} = ${vc("B′E′")}, donc ${vc("BB′")} = ${vc("EE′")}. On a aussi ${vc("AB")} = ${vc("A′B′")}, donc ${vc("AA′")} = ${vc("BB′")}. On en déduit ${vc("AA′")} = ${vc("EE′")}, d'où ${vc("AE")} = ${vc("A′E′")} : le vecteur somme ne dépend pas des choix des représentants.</p>`,
 rel:["somme-vecteurs","equipollence","vecteur"]});

/* =============== Chapitre 4 : résultats de TD =============== */
const medA=(p,P)=>{const I=mid(P.B,P.C),J=add(I,perp(sub(P.C,P.B)));return snapLine(p,I,J,9);};

push4({id:"td-isocele",type:"td",ref:"TD 1.7",t:"Le triangle isocèle",short:"Triangle isocèle (TD 1.7)",
 plain:`Isocèle en A veut dire AB = AC. Conséquences à connaître, utilisables sans preuve : ${hl("les angles en B et en C sont égaux")}, et ${hl("la bissectrice, la médiane et la hauteur issues de A sont la même droite")}, perpendiculaire à (BC).`,
 fig:()=>({w:560,h:330,P:{A:[300,60],B:[130,270],C:[440,260]},con:{A:medA},
   draw:(P)=>{const I=mid(P.B,P.C),iso=Math.abs(d(P.A,P.B)-d(P.A,P.C))<0.01;let s=tri(P.A,P.B,P.C,"l-ink","f-ink")+D.marks(P.C,P.B,P.A,26,1,iso?"l-ok":"l-thin")+D.marks(P.A,P.C,P.B,26,1,iso?"l-ok":"l-thin")+D.pt(I,"I",P.A,"p-fix");
     if(iso)s+=D.seg(P.A,I,"l-cob")+D.right(P.C,I,P.A,11,"l-cob")+D.ticks(P.A,P.B,1,"l-ok")+D.ticks(P.A,P.C,1,"l-ok")+D.ticks(P.B,I,2,"l-cob")+D.ticks(I,P.C,2,"l-cob");
     else s+=D.seg(P.A,I,"l-cons");
     return s;},
   info:(P)=>{const iso=Math.abs(d(P.A,P.B)-d(P.A,P.C))<0.01;return R.m([["AB",fl(P.A,P.B)],["AC",fl(P.A,P.C)],["|B̂|",fa(absang(P.A,P.B,P.C))],["|Ĉ|",fa(absang(P.A,P.C,P.B))]])+R.v(iso?"Isocèle en A : |B̂| = |Ĉ|, et (AI) est à la fois médiane, bissectrice et hauteur.":"Pas isocèle en A : les angles en B et C diffèrent.",iso?"ok":"");},
   goal:{text:"rends le triangle isocèle en A.",ok:(P)=>Math.abs(d(P.A,P.B)-d(P.A,P.C))<0.01,win:"A est sur la médiatrice de [BC] : AB = AC (TD 1.6)."}}),
 formal:`<p><b>TD 1.7.</b> (1) Si ABC est isocèle en A : (a) |B̂| = |Ĉ| ; (b) la bissectrice et la médiane issues de A sont confondues ; (c) elles sont perpendiculaires à (BC) ; (d) si N ∈ [BC] n'est pas le milieu, ABN et ACN ne sont pas isométriques ; (e) deux côtés et un angle égaux ne suffisent pas.</p><p>(2) Réciproques : si la médiane issue de A est perpendiculaire à (BC), ou si |B̂| = |Ĉ|, alors ABC est isocèle en A.</p>`,
 use:`<p>Pour montrer AB = AC : montre |B̂| = |Ĉ|, ou que A est sur la médiatrice de [BC] (TD 1.6), ou que les hauteurs issues de B et C sont égales (TD 1.11). Les preuves (CAC et CCC) sont sur la page TD 1.</p>`,
 trap:`« Isocèle » tout court est ambigu : précise toujours le sommet, « isocèle en A ».`,
 q:"ABC est isocèle en A. Que peux-tu dire, sans preuve, de la médiane issue de A ?",a:"C'est aussi la bissectrice et la hauteur issues de A : elle est perpendiculaire à (BC) (TD 1.7).",
 rel:["mediatrice","axiome-5","td-hauteurs","td"]});

push4({id:"td-hauteurs",type:"td",ref:"TD 1.11",t:"Isocèle ⇔ deux hauteurs de même longueur",short:"Hauteurs égales (TD 1.11)",cc:"Tombé en 2025 · 2 pts",
 plain:`L'aire d'un triangle s'écrit de trois façons, une par hauteur. En égalant ${hl("½ AC × BH<sub>B</sub> = ½ AB × CH<sub>C</sub>")}, on voit que AB = AC exactement quand les deux hauteurs ont la même longueur.`,
 fig:()=>({w:560,h:330,P:{A:[290,60],B:[110,270],C:[450,260]},con:{A:medA},
   draw:(P)=>{const HB=proj(P.B,P.A,P.C),HC=proj(P.C,P.A,P.B);return D.line(P.A,P.C,"l-cons")+D.line(P.A,P.B,"l-cons")+tri(P.A,P.B,P.C,"l-ink","f-ink")+D.seg(P.B,HB,"l-cob")+D.seg(P.C,HC,"l-amb")+D.right(P.A,HB,P.B,9,"l-cob")+D.right(P.A,HC,P.C,9,"l-amb")+D.pt(HB,"H<tspan font-size='11' dy='4'>B</tspan>",P.B,"p-cob","t-cob")+D.pt(HC,"H<tspan font-size='11' dy='4'>C</tspan>",P.C,"p-cob","t-amb");},
   info:(P)=>{const HB=proj(P.B,P.A,P.C),HC=proj(P.C,P.A,P.B),bh=d(P.B,HB),ch=d(P.C,HC);return R.m([["BH<sub>B</sub>",fr(bh)],["CH<sub>C</sub>",fr(ch)],["½ AC × BH<sub>B</sub>",fr(d(P.A,P.C)*bh/2)],["½ AB × CH<sub>C</sub>",fr(d(P.A,P.B)*ch/2)],["AB",fl(P.A,P.B)],["AC",fl(P.A,P.C)]])+R.v("Les deux produits sont toujours égaux : c'est l'aire de ABC. Donc BH<sub>B</sub> = CH<sub>C</sub> ⇔ AC = AB.","info");},
   goal:{text:"rends les deux hauteurs égales.",ok:(P)=>{const HB=proj(P.B,P.A,P.C),HC=proj(P.C,P.A,P.B);return Math.abs(d(P.B,HB)-d(P.C,HC))<0.01;},win:"et le triangle est isocèle en A : AB = AC."}}),
 formal:`<p><b>TD 1.11.</b> ABC est isocèle en A si et seulement si les hauteurs issues de B et de C ont même longueur.</p><p>Preuve : par la Prop 2.4.1, AC × BH<sub>B</sub> = AB × CH<sub>C</sub> = 2𝒜(ABC), et toutes ces longueurs sont non nulles si ABC est non dégénéré.</p>`,
 use:`<p>C'est exactement le CC1 2025 Ex. 2 (2 points). Rédige : « La formule de l'aire (Prop 2.4.1) donne 𝒜(ABC) = ½ BH<sub>B</sub> × AC = ½ CH<sub>C</sub> × AB. Comme BH<sub>B</sub> = CH<sub>C</sub> ≠ 0, on obtient AC = AB. »</p>`,
 trap:`Justifie que la hauteur est non nulle avant de diviser : c'est parce que le triangle est non dégénéré.`,
 q:"ABC non dégénéré avec BH_B = CH_C. Que peux-tu conclure, et comment ?",a:"ABC est isocèle en A : l'aire s'écrit ½ AC × BH_B = ½ AB × CH_C, et on simplifie par BH_B = CH_C ≠ 0.",
 rel:["hauteur","demo-2-4-1","td-isocele"]});

push4({id:"td-equilateral",type:"td",ref:"TD 1.13",t:"Le triangle équilatéral",short:"Triangle équilatéral (TD 1.13)",
 plain:`Équilatéral : trois côtés égaux. C'est pareil que ${hl("trois angles égaux, chacun π/3")}. Et si on avance de la même longueur sur chaque côté, le nouveau triangle est encore équilatéral.`,
 fig:()=>({w:560,h:330,P:{A:[280,50],B:[120,290],C:[440,290]},S:{t:0.3,klm:false},
   sliders:[{k:"t",label:"Avance sur chaque côté :",min:0.05,max:0.95,step:0.01,fmt:v=>Math.round(v*100)+" %"}],
   toggles:[{k:"klm",label:"Montrer KLM (question 2c)"}],
   buttons:[{label:"Rendre équilatéral",act:(P)=>{P.A=rot(P.C,P.B,side(P.A,P.B,P.C)>0?-PI/3:PI/3);}}],
   draw:(P,S)=>{const A2=lerp(P.A,P.B,S.t),B2=lerp(P.B,P.C,S.t),C2=lerp(P.C,P.A,S.t);let s=tri(P.A,P.B,P.C,"l-ink","f-ink")+tri(A2,B2,C2,"l-cob","f-cob")+D.pt(A2,"A′",P.C,"p-cob","t-cob")+D.pt(B2,"B′",P.A,"p-cob","t-cob")+D.pt(C2,"C′",P.B,"p-cob","t-cob");
     if(S.klm){const K=inter(P.C,A2,P.A,B2),L=inter(P.A,B2,P.B,C2),M=inter(P.B,C2,P.C,A2);s+=D.seg(P.C,A2,"l-thin")+D.seg(P.A,B2,"l-thin")+D.seg(P.B,C2,"l-thin");if(K&&L&&M)s+=tri(K,L,M,"l-amb","f-amb");}
     return s;},
   info:(P,S)=>{const A2=lerp(P.A,P.B,S.t),B2=lerp(P.B,P.C,S.t),C2=lerp(P.C,P.A,S.t);const eq=Math.abs(d(P.A,P.B)-d(P.B,P.C))<0.02&&Math.abs(d(P.A,P.B)-d(P.A,P.C))<0.02;
     return R.m([["|Â|",fa(absang(P.B,P.A,P.C))],["|B̂|",fa(absang(P.A,P.B,P.C))],["|Ĉ|",fa(absang(P.A,P.C,P.B))],["A′B′",fl(A2,B2)],["B′C′",fl(B2,C2)],["C′A′",fl(C2,A2)]])+R.v(eq?"ABC est équilatéral : chaque angle vaut π/3, et A′B′C′ aussi est équilatéral.":"ABC n'est pas équilatéral : A′B′C′ non plus, en général. Clique sur « Rendre équilatéral ».",eq?"ok":"");}}),
 formal:`<p><b>TD 1.13.</b> (1) ABC est équilatéral ⇔ |Â| = |B̂| = |Ĉ|. (2) Si ABC est équilatéral : (a) |Â| = π/3 ; (b) si A′ ∈ [AB], B′ ∈ [BC], C′ ∈ [CA] avec AA′ = BB′ = CC′, alors A′B′C′ est équilatéral ; (c) le triangle KLM formé par (CA′), (AB′), (BC′) est équilatéral.</p>`,
 use:`<p>(1) se prouve avec le TD 1.7 deux fois. (2b) : les triangles AA′C′, BB′A′, CC′B′ sont isométriques (CAC). Les preuves détaillées sont sur la page TD 1.</p>`,
 trap:`Pour (2b), vérifie que l'angle de CAC est bien entre les deux côtés : en A, entre [AA′) et [AC′).`,
 q:"Combien vaut chaque angle d'un triangle équilatéral ?",a:"π/3 : les trois angles sont égaux (TD 1.13 (1)) et leur somme vaut π.",
 rel:["td-isocele","somme-angles","axiome-5","td"]});

push4({id:"td-paralleles",type:"td",ref:"TD 1.3",t:"Parallèles à une même droite",short:"Parallèles en chaîne (TD 1.3)",
 plain:`Si Δ₁ et Δ₃ sont toutes les deux parallèles à Δ₂, alors ${hl("elles sont parallèles entre elles")} (ou confondues). Raison : si elles avaient un point commun, ce seraient deux parallèles à Δ₂ passant par ce point.`,
 fig:()=>({w:560,h:320,P:{A:[80,170],B:[480,140],P1:[200,70],P3:[320,260]},labels:{P1:"M₁",P3:"M₃"},
   con:{P3:(p,P)=>{const Q=add(P.P1,sub(P.B,P.A));return snapLine(p,P.P1,Q,9);}},
   draw:(P)=>{const u=sub(P.B,P.A),same=dpx(P.P3,proj(P.P3,P.P1,add(P.P1,u)))<0.5;return D.line(P.A,P.B,"l-ink")+D.line(P.P1,add(P.P1,u),"l-cob")+D.line(P.P3,add(P.P3,u),same?"l-amb-d":"l-amb")+D.txt(add(P.A,V(-10,22)),"Δ₂","t-mut")+D.txt(add(P.P1,V(-60,-10)),"Δ₁","t-cob")+D.txt(add(P.P3,V(-60,24)),"Δ₃","t-amb");},
   info:(P)=>{const u=sub(P.B,P.A),same=dpx(P.P3,proj(P.P3,P.P1,add(P.P1,u)))<0.5;return R.v(same?"Δ₁ et Δ₃ passent par le même point et sont parallèles à Δ₂ : elles sont confondues (axiome II).":"Δ₁ et Δ₃ sont parallèles à Δ₂, et elles ne se coupent pas.",same?"ok":"info");},
   goal:{text:"essaie de faire se croiser Δ₁ et Δ₃ (déplace M₃).",ok:(P)=>{const u=sub(P.B,P.A);return dpx(P.P3,proj(P.P3,P.P1,add(P.P1,u)))<0.5;},win:"impossible sans qu'elles se confondent : c'est l'unicité de l'axiome II."}}),
 formal:`<p><b>TD 1.3.</b> Si Δ₁ // Δ₂ et Δ₂ // Δ₃, alors Δ₁ et Δ₃ sont parallèles ou confondues.</p><p>Preuve : si Δ₁ ∩ Δ₃ contient un point M, Δ₁ et Δ₃ sont deux parallèles à Δ₂ passant par M, donc Δ₁ = Δ₃ (axiome II).</p>`,
 use:`<p>Pour enchaîner des parallélismes dans un exercice, ou dans la preuve de la transitivité de l'équipollence.</p>`,
 trap:`Dans ce cours, « parallèles » inclut « confondues » : la conclusion est simplement Δ₁ // Δ₃.`,
 q:"Δ₁ // Δ₂ et Δ₂ // Δ₃. Que dire de Δ₁ et Δ₃ ?",a:"Elles sont parallèles (éventuellement confondues), par l'unicité de l'axiome II (TD 1.3).",
 rel:["axiome-2","deux-droites"]});

push4({id:"td-ccc-cac",type:"td",ref:"TD 1.12",t:"CCC ⇔ CAC, même pour des triangles aplatis",short:"CCC et CAC dégénérés (TD 1.12)",
 plain:`Pour un triangle aplati (dégénéré), l'angle en A vaut ${hl("0 ou π")}, et il se lit sur les longueurs : BC = AB + AC (A entre B et C) ou BC = |AB − AC|. Donc CCC et CAC restent équivalents. Pas ACA.`,
 fig:()=>({w:560,h:260,P:{A:[260,140],B:[100,160],C:[440,120]},
   con:{C:(p,P)=>onLine(p,P.A,P.B)},
   draw:(P)=>D.line(P.A,P.B,"l-cons")+D.seg(P.B,P.C,"l-ink")+D.dot(P.A,"p-cob",5),
   info:(P)=>{const a=absang(P.B,P.A,P.C),between=param(P.A,P.B,P.C)>0&&param(P.A,P.B,P.C)<1;return R.m([["|Â|",fa(a)],["AB",fl(P.A,P.B)],["AC",fl(P.A,P.C)],["BC",fl(P.B,P.C)],[between?"AB + AC":"|AB − AC|",fr(between?d(P.A,P.B)+d(P.A,P.C):Math.abs(d(P.A,P.B)-d(P.A,P.C)))]])+R.v(between?"A est entre B et C : |Â| = π et BC = AB + AC.":"A n'est pas entre B et C : |Â| = 0 et BC = |AB − AC|.","info");},
   hint:"C glisse sur la droite (AB)."}),
 formal:`<p><b>TD 1.12.</b> Pour deux triangles ABC et A′B′C′ quelconques (éventuellement dégénérés), (CCC) et (CAC) sont équivalents.</p><p class="ref">Le poly le signale juste après l'axiome V : c'est faux pour (ACA).</p>`,
 use:`<p>Rarement utile en exercice. Retiens surtout la remarque : sans « non dégénéré », seul ACA pose problème.</p>`,
 trap:`L'axiome V suppose les triangles non dégénérés. Ce TD l'étend à CCC et CAC seulement.`,
 q:"Pour des triangles dégénérés, quel cas d'isométrie ne marche plus ?",a:"(ACA). (CCC) et (CAC) restent équivalents (TD 1.12).",
 rel:["axiome-5","triangles"]});

})();
