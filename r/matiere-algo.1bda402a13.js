/* Algorithmique 1 (HAI101I) : CC1 du jeudi 12 novembre */
(function(){
window.SUBJ=window.SUBJ||{};
const C=(s,l)=>W.code(s,l||"pseudo"),P=s=>W.code(s,"py"),hl=s=>`<span class="hl">${s}</span>`,esc=W.esc;
const concepts=[];const add=(ch,o)=>{o.ch=ch;concepts.push(o);};

/* ---------- petits widgets propres à l'algo ---------- */
function growth(host){
  const F=[["log₂ n",n=>Math.log2(n)],["n",n=>n],["n log₂ n",n=>n*Math.log2(n)],["n²",n=>n*n],["n³",n=>n**3],["2ⁿ",n=>2**n]];
  let N=30,logy=true,c=1000,cf=3;
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><label>n jusqu'à <input type="range" min="5" max="60" value="30" data-n> <b data-nv>30</b></label><button class="btn" aria-pressed="true" data-log>Échelle logarithmique</button><label>Constante devant <select data-cf>${F.map((f,i)=>`<option value="${i}"${i===3?" selected":""}>${f[0]}</option>`).join("")}</select> × <select data-c>${[1,10,1000,1000000].map(v=>`<option${v===1000?" selected":""}>${v}</option>`).join("")}</select></label></div><div class="gplot"></div><div class="w-note"></div></div>`;
  const q=s=>host.querySelector(s),cols=["#8FA6CC","#7692FF","#3BE8F0","#FFB547","#D980FF","#FF5470"];
  function draw(){const w=560,h=300;const val=(i,n)=>F[i][1](n)*(i===cf?c:1);let ymax=1;F.forEach((f,i)=>{ymax=Math.max(ymax,val(i,N));});ymax=Math.min(ymax,1e18);
    const tr=y=>logy?Math.log10(Math.max(y,1e-3)):y,ym=logy?Math.log10(ymax)*1.05:ymax*1.05,pl=W.plotter(w,h,0,N,logy?-0.5:0,ym);
    let s=`<svg viewBox="0 0 ${w} ${h}" class="plot">`;s+=pl.axes();F.forEach((f,i)=>{s+=pl.path(n=>n<1?NaN:tr(val(i,n)),"XCLS",1,N).replace('class="XCLS"',`style="stroke:${cols[i]};stroke-width:${i===cf?3:2};fill:none"`);});s+="</svg>";
    q(".gplot").innerHTML=s+`<div class="edt-legend">${F.map((f,i)=>`<span><i class="sdot" style="background:${cols[i]}"></i>${i===cf&&c>1?c+" × ":""}${f[0]}</span>`).join("")}</div>`;
    q(".w-note").innerHTML=`<div class="verdict info">${logy?"En échelle log, chaque graduation multiplie par 10. ":""}Avec n = ${N} : n² = ${N*N}, n³ = ${N**3}, 2ⁿ ≈ ${(2**N).toExponential(1).replace(".",",")}. Une constante ne change pas l'ordre de complexité θ, mais peut rendre un algorithme ${c} fois plus lent.</div>`;q("[data-nv]").textContent=N;}
  host.addEventListener("input",e=>{if(e.target.matches("[data-n]")){N=+e.target.value;draw();}});
  host.addEventListener("change",e=>{if(e.target.matches("[data-c]"))c=+e.target.value;if(e.target.matches("[data-cf]"))cf=+e.target.value;draw();});
  host.addEventListener("click",e=>{const b=e.target.closest("[data-log]");if(b){logy=!logy;b.setAttribute("aria-pressed",logy);draw();}});
  draw();
}
const FRAG=[
 {t:"Pour i de 1 à n : som ← som+1",f:n=>{let c=0;for(let i=1;i<=n;i++)c++;return c;},ex:"n",th:"θ(n)"},
 {t:"Pour i de 1 à n, Pour j de 1 à n : som ← som+1",f:n=>{let c=0;for(let i=1;i<=n;i++)for(let j=1;j<=n;j++)c++;return c;},ex:"n²",th:"θ(n²)"},
 {t:"Pour i de 1 à n, Pour j de 1 à i : som ← som+1",f:n=>{let c=0;for(let i=1;i<=n;i++)for(let j=1;j<=i;j++)c++;return c;},ex:"n(n+1)/2",th:"θ(n²)"},
 {t:"Pour i de 1 à n, Pour j de i à n : som ← som+1",f:n=>{let c=0;for(let i=1;i<=n;i++)for(let j=i;j<=n;j++)c++;return c;},ex:"n(n+1)/2",th:"θ(n²)"},
 {t:"Pour i de 1 à n : som ← som+1 ; Pour j de 1 à n : som ← som+1",f:n=>{let c=0;for(let i=1;i<=n;i++){c++;for(let j=1;j<=n;j++)c++;}return c;},ex:"n + n² = n(n+1)",th:"θ(n²)"},
 {t:"i ← n ; Tant que i > 1 : i ← i div 2 ; som ← som+1",f:n=>{let c=0,i=n;while(i>1){i=Math.floor(i/2);c++;}return c;},ex:"⌊log₂ n⌋",th:"θ(log n)"}];
function counter(host){
  let k=1,n=10;
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><select data-k>${FRAG.map((f,i)=>`<option value="${i}"${i===1?" selected":""}>${f.t}</option>`).join("")}</select><label>n = <input type="range" min="1" max="64" value="10" data-n> <b data-nv>10</b></label></div><div class="w-note"></div></div>`;
  const q=s=>host.querySelector(s);
  function draw(){const F=FRAG[k];q("[data-nv]").textContent=n;q(".w-note").innerHTML=`<div class="verdict info">Nombre d'additions compté en exécutant vraiment les boucles : <b>${F.f(n)}</b>. Formule : ${F.ex}${F.ex.includes("n")?` = ${F.f(n)} pour n = ${n}`:""}. Complexité : <b>${F.th}</b>.</div>`;}
  host.addEventListener("input",e=>{if(e.target.matches("[data-n]")){n=+e.target.value;draw();}});host.addEventListener("change",e=>{if(e.target.matches("[data-k]")){k=+e.target.value;draw();}});draw();
}
function pilefile(host){
  let pile=[3,8],file=[3,8],x=5,log=[];
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><label>Élément x = <input type="number" value="5" data-x style="width:4.5em"></label></div><div class="pf2"><div><h5>Pile (dernier arrivé, premier sorti)</h5><div class="w-ctrl"><button class="btn" data-a="emp">empiler(x)</button><button class="btn" data-a="dep">dépiler</button></div><div class="stack"></div></div><div><h5>File (premier arrivé, premier sorti)</h5><div class="w-ctrl"><button class="btn" data-a="enf">enfiler(x)</button><button class="btn" data-a="def">défiler</button></div><div class="queue"></div></div></div><div class="w-note"></div></div>`;
  const q=s=>host.querySelector(s);
  function draw(){q(".stack").innerHTML=pile.slice().reverse().map((v,i)=>`<span class="${i===0?"top":""}">${v}${i===0?" ← sommet":""}</span>`).join("")||`<span class="muted">pile vide</span>`;q(".queue").innerHTML=file.length?`<span class="muted">sortie ←</span>${file.map((v,i)=>`<span class="${i===0?"top":""}">${v}</span>`).join("")}<span class="muted">← entrée</span>`:`<span class="muted">file vide</span>`;q(".w-note").innerHTML=log.length?`<div class="verdict info">${log[log.length-1]}</div>`:"";}
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;x=+q("[data-x]").value||0;
    if(a==="emp"){pile.push(x);log.push(`empiler(${x}) : ${x} est posé au sommet.`);}if(a==="dep"){log.push(pile.length?`dépiler renvoie ${pile.pop()}, le dernier empilé.`:"Erreur : dépiler une pile vide.");}
    if(a==="enf"){file.push(x);log.push(`enfiler(${x}) : ${x} entre au bout de la file.`);}if(a==="def"){log.push(file.length?`défiler renvoie ${file.shift()}, le premier arrivé.`:"Erreur : défiler une file vide.");}draw();});
  draw();
}

/* ---------- widgets ajoutés pour le CC1 de cette année ---------- */
/* trouve l'erreur : des algorithmes avec des fautes de forme typiques */
const BUGS=[
 {t:"compteEgaux (tableau)",L:["FONCTION : compteEgaux (E e : entier, E T : tableau d'entiers)","SPÉCIFICATIONS : renvoie le nombre d'éléments de T égaux à e.","Variable : cpt : entier, i : entier","DÉBUT","    pour i de 0 à taille(T) faire","        si T[i] = e alors","            cpt ← cpt + 1","        fin si;","    fin pour;","    Renvoyer cpt","FIN"],
  bad:{0:"Il manque le type du résultat d'une fonction : « : entier » à la fin de la signature.",2:"i est l'indice de la boucle pour : ce n'est pas une variable, on ne le déclare pas (cours, page 11).",4:"Les indices vont de 0 à taille(T) − 1 : T[taille(T)] n'existe pas.",6:"cpt est utilisé sans avoir jamais reçu de valeur : il manque la ligne cpt ← 0 juste après DÉBUT, avant la boucle."},alias:{3:6},
  fix:`FONCTION : compteEgaux (E e : entier, E T : tableau d'entiers) : entier
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
FIN`},
 {t:"somElem (tableau 2D)",L:["FONCTION : somElem (E T : tableau 2D d'entiers) : entier","SPÉCIFICATIONS : calcule et renvoie la somme des éléments de T.","Variable : som : entier","DÉBUT","    som ← 0","    pour i de 0 à taille(T)-1 faire","        pour j de 0 à taille(T)-1 faire","            som ← som + T[i][j]","        fin pour;","        Renvoyer som","    fin pour;","FIN"],
  bad:{6:"taille(T) est le nombre de lignes. Pour parcourir les colonnes de la ligne i : taille(T[i]) − 1 (le cours écrit aussi taille(T[0]) − 1 : c'est pareil, toutes les lignes ont la même taille).",9:"Renvoyer est dans la boucle des lignes : l'algorithme s'arrête après la première ligne. Il doit venir après le dernier fin pour;."},alias:{10:9},
  fix:`FONCTION : somElem (E T : tableau 2D d'entiers) : entier
SPÉCIFICATIONS : calcule et renvoie la somme des éléments de T.
Variable : som : entier
DÉBUT
    som ← 0
    pour i de 0 à taille(T)-1 faire
        pour j de 0 à taille(T[i])-1 faire
            som ← som + T[i][j]
        fin pour;
    fin pour;
    Renvoyer som
FIN`},
 {t:"nbChiffres (tant que)",L:["FONCTION : nbChiffres (E n : entier) : entier","SPÉCIFICATIONS : n ∈ ℕ. Renvoie le nombre de chiffres de n.","Variable : c : entier","DÉBUT","    c, m ← 1, n","    tant que m ≥ 10 faire","        c ← c + 1","    fin tq;","    m ← m div 10","    Renvoyer c","FIN"],
  bad:{2:"m est utilisée mais pas déclarée : « Variable : c, m : entier ».",7:"fin tq; arrive trop tôt : m ← m div 10 doit être dans la boucle. Sinon m ne change jamais et la boucle ne s'arrête pas."},alias:{8:7},
  fix:`FONCTION : nbChiffres (E n : entier) : entier
SPÉCIFICATIONS : n ∈ ℕ. Renvoie le nombre de chiffres de n.
Variable : c, m : entier
DÉBUT
    c, m ← 1, n
    tant que m ≥ 10 faire
        c ← c + 1
        m ← m div 10
    fin tq;
    Renvoyer c
FIN`},
 {t:"estPair (récursif)",L:["FONCTION : estPair (E n : entier)","SPÉCIFICATIONS : n ∈ ℕ. Renvoie true si n est pair, false sinon.","DÉBUT","    si n = 0 alors","        Renvoyer true","    sinon si n = 1 alors","        Renvoyer false","    sinon","        Renvoyer estPair(n)","    fin si;","FIN"],
  bad:{0:"Il manque le type du résultat : « : booléen ».",8:"L'appel récursif doit se faire sur un problème plus petit : estPair(n − 2). Avec estPair(n), les appels ne s'arrêtent jamais."},
  fix:`FONCTION : estPair (E n : entier) : booléen
SPÉCIFICATIONS : n ∈ ℕ. Renvoie true si n est pair, false sinon.
DÉBUT
    si n = 0 alors
        Renvoyer true
    sinon si n = 1 alors
        Renvoyer false
    sinon
        Renvoyer estPair(n - 2)
    fin si;
FIN`},
 {t:"ligne (procédure)",L:["PROCÉDURE : ligne (E n : entier) : entier","SPÉCIFICATIONS : affiche n étoiles puis passe à la ligne.","DÉBUT","    pour i de 1 à n faire","        affEtoile()","        affRL()","    fin pour;","FIN"],
  bad:{0:"Une procédure ne renvoie rien : pas de type de résultat après la parenthèse.",5:"affRL() est dans la boucle : on passerait à la ligne après chaque étoile. Il doit venir après fin pour;."},alias:{6:5},
  fix:`PROCÉDURE : ligne (E n : entier)
SPÉCIFICATIONS : affiche n étoiles puis passe à la ligne.
DÉBUT
    pour i de 1 à n faire
        affEtoile()
    fin pour;
    affRL()
FIN`},
 {t:"max3 (si)",L:["FONCTION : max3 (E a : nombre, E b : nombre, E c : nombre) : nombre","SPÉCIFICATIONS : renvoie le plus grand des trois nombres.","DÉBUT","    si a ≥ b et a ≥ c alors","        Renvoyer a","    sinon si b ≥ c alors","        Renvoyer b","    sinon","        Renvoyer c","    fin pour;","FIN"],
  bad:{9:"Un si se ferme par fin si;, pas par fin pour;."},
  fix:`FONCTION : max3 (E a : nombre, E b : nombre, E c : nombre) : nombre
SPÉCIFICATIONS : renvoie le plus grand des trois nombres.
DÉBUT
    si a ≥ b et a ≥ c alors
        Renvoyer a
    sinon si b ≥ c alors
        Renvoyer b
    sinon
        Renvoyer c
    fin si;
FIN`}];
function bugHunt(host){
  let k=0,sel=new Set(),checked=false;
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><select data-k aria-label="Choisir l'algorithme">${BUGS.map((b,i)=>`<option value="${i}">Algorithme ${i+1} : ${b.t}</option>`).join("")}</select></div><p class="muted bh-help" style="margin:0"></p><div class="bugs"></div><div class="w-ctrl"><button class="btn pri" data-a="check">Vérifier</button><button class="btn" data-a="reset">Recommencer</button></div><div class="w-note"></div></div>`;
  const q=s=>host.querySelector(s);
  /* une erreur = un message + les lignes où on peut la voir (une ligne qui manque se voit juste avant, ou là où elle aurait servi) */
  const errsOf=B=>Object.entries(B.bad).map(([m,msg])=>{const main=+m,alt=Object.keys(B.alias||{}).filter(a=>B.alias[a]===main).map(Number);return {main,lines:[main,...alt].sort((a,b)=>a-b),msg};}).sort((a,b)=>a.lines[0]-b.lines[0]);
  const L=a=>a.length===1?`Ligne ${a[0]+1}`:`Lignes ${a.slice(0,-1).map(x=>x+1).join(", ")} et ${a[a.length-1]+1}`;
  function draw(){const B=BUGS[k],E=errsOf(B),nb=E.length,two=E.some(e=>e.lines.length>1);
    const errOfLine=i=>E.find(e=>e.lines.includes(i));
    const found=E.filter(e=>e.lines.some(i=>sel.has(i))),wrong=[...sel].filter(i=>!errOfLine(i)),dbl=E.filter(e=>e.lines.filter(i=>sel.has(i)).length>1);
    q(".bh-help").textContent=`Il y a ${nb} erreur${nb>1?"s":""}. Clique sur la ligne de chaque erreur, puis sur « Vérifier ».${two?" Une ligne qui manque se signale sur la ligne juste avant le trou ou sur celle qui en a besoin : une seule des deux suffit.":""}`;
    q(".bugs").innerHTML=B.L.map((l,i)=>{let c="";if(checked){const e=errOfLine(i);if(sel.has(i))c=e?"good":"bad";else if(e&&!found.includes(e)&&e.main===i)c="miss";}return `<button data-l="${i}" aria-pressed="${sel.has(i)}" class="${c}"><span class="muted" style="user-select:none">${String(i+1).padStart(2," ")}  </span>${esc(l)}</button>`;}).join("");
    q(".w-note").innerHTML=checked?`<div class="verdict ${found.length===nb&&!wrong.length?"ok":"info"}">${found.length} erreur${found.length>1?"s":""} trouvée${found.length>1?"s":""} sur ${nb}.${wrong.length?` ${wrong.length} ligne${wrong.length>1?"s":""} correcte${wrong.length>1?"s":""} marquée${wrong.length>1?"s":""} à tort, en rouge (${wrong.map(i=>i+1).join(", ")}).`:""}${found.length<nb?" Les erreurs oubliées sont en pointillés.":""}${dbl.map(e=>` Tu as marqué ${L(e.lines.filter(i=>sel.has(i))).toLowerCase()} : c'est la même erreur, comptée une fois.`).join("")}</div><ul>${E.map(e=>`<li><b>${L(e.lines)}</b> : ${e.msg}</li>`).join("")}</ul><p class="muted" style="margin:0">La version corrigée :</p>${C(B.fix)}`:"";}
  host.addEventListener("click",e=>{const b=e.target.closest("[data-l]");if(b&&!checked){const i=+b.dataset.l;if(sel.has(i))sel.delete(i);else sel.add(i);draw();return;}const a=e.target.closest("[data-a]")?.dataset.a;if(a==="check"){checked=true;draw();}if(a==="reset"){sel.clear();checked=false;draw();}});
  host.addEventListener("change",e=>{if(e.target.matches("[data-k]")){k=+e.target.value;sel.clear();checked=false;draw();}});
  draw();
}

/* motifs d'étoiles : TD 1 ex. 4 (boucles) et TD 2 ex. 9 (récursif), PEIP 2023 ex. 3 */
const rep=(s,n)=>n>0?s.repeat(n):"";
const MOT=[
 {lab:"TD 1, ex. 4.1 : une ligne",note:"Une boucle pour qui affiche n étoiles, puis un seul retour à la ligne, après la boucle.",out:n=>rep("*",n),code:`PROCÉDURE : ligne (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Affiche n étoiles puis passe à la ligne.
DÉBUT
    pour i de 1 à n faire
        affEtoile()
    fin pour;
    affRL()
FIN`},
 {lab:"TD 1, ex. 4.2 : le carré",note:"La ligne i contient toujours n étoiles : on appelle n fois ligne(n). Chaque algorithme peut appeler les précédents.",out:n=>Array.from({length:n},()=>rep("*",n)).join("\n"),code:`PROCÉDURE : carre (E n : entier)
SPÉCIFICATIONS : affiche n lignes de n étoiles.
DÉBUT
    pour i de 1 à n faire
        ligne(n)
    fin pour;
FIN`},
 {lab:"TD 1, ex. 4.3 : le triangle",note:"La ligne i contient i étoiles : on appelle ligne(i).",out:n=>Array.from({length:n},(_,i)=>rep("*",i+1)).join("\n"),code:`PROCÉDURE : triangle (E n : entier)
SPÉCIFICATIONS : affiche les lignes de 1, 2, …, n étoiles.
DÉBUT
    pour i de 1 à n faire
        ligne(i)
    fin pour;
FIN`},
 {lab:"TD 1, ex. 4.4 : le triangle inversé",note:"Ligne i : i − 1 espaces, puis n − i + 1 étoiles. Vérifie : ligne 1, 0 espace et n étoiles ; ligne n, n − 1 espaces et 1 étoile.",out:n=>Array.from({length:n},(_,i)=>rep(" ",i)+rep("*",n-i)).join("\n"),code:`PROCÉDURE : triangleInverse (E n : entier)
SPÉCIFICATIONS : ligne i : i − 1 espaces puis n − i + 1 étoiles.
DÉBUT
    pour i de 1 à n faire
        pour j de 1 à i-1 faire
            affEspace()
        fin pour;
        ligne(n - i + 1)
    fin pour;
FIN`},
 {lab:"TD 1, ex. 4.5 : la pyramide",note:"Ligne i : n − i espaces, puis i fois « étoile espace ». Deux boucles pour l'une après l'autre dans la boucle des lignes, puis affRL().",out:n=>Array.from({length:n},(_,i)=>rep(" ",n-i-1)+rep("* ",i+1)).join("\n"),code:`PROCÉDURE : pyramide (E n : entier)
SPÉCIFICATIONS : affiche une pyramide de n lignes.
DÉBUT
    pour i de 1 à n faire
        pour j de 1 à n-i faire
            affEspace()
        fin pour;
        pour j de 1 à i faire
            affEtoile()
            affEspace()
        fin pour;
        affRL()
    fin pour;
FIN`},
 {lab:"PEIP 2023, ex. 3 : le grand Λ (affX, affB)",note:"Ligne k (de 0 à n − 1) : n − 1 − k espaces, un X, puis pour k > 0 : 2k − 1 espaces et un second X. Le si traite la pointe, qui n'a qu'un X.",out:n=>Array.from({length:n},(_,k)=>rep(" ",n-1-k)+"X"+(k>0?rep(" ",2*k-1)+"X":"")).join("\n"),code:`PROCÉDURE : GrandEt (E n : entier)
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
FIN`},
 {lab:"TD 2, ex. 9.1 : une ligne, en récursif",note:"Pas de boucle : on affiche une étoile, puis on demande à ligneRec d'afficher les n − 1 autres. Le cas de base n = 0 passe à la ligne.",out:n=>rep("*",n),code:`PROCÉDURE : ligneRec (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Affiche n étoiles puis passe à la ligne.
DÉBUT
    si n = 0 alors
        affRL()
    sinon
        affEtoile()
        ligneRec(n - 1)
    fin si;
FIN`},
 {lab:"TD 2, ex. 9.2 : triangle décroissant, en récursif",note:"On affiche la plus longue ligne, puis on rappelle triDec sur n − 1. Inverse les deux lignes du sinon et le triangle se retourne.",out:n=>Array.from({length:n},(_,i)=>rep("*",n-i)).join("\n"),code:`PROCÉDURE : triDec (E n : entier)
SPÉCIFICATIONS : affiche n, n − 1, …, 1 étoiles, une ligne chacun.
DÉBUT
    si n > 0 alors
        ligneRec(n)
        triDec(n - 1)
    fin si;
FIN`},
 {lab:"TD 2, ex. 9.3 : la diagonale, en récursif",note:"Sur chaque ligne : des espaces (avec affLigneEsp), une seule étoile, un retour à la ligne. La première ligne a n − 1 espaces ; l'appel récursif affiche le reste, avec un espace de moins.",out:n=>Array.from({length:n},(_,i)=>rep(" ",n-i-1)+"*").join("\n"),code:`PROCÉDURE : affLigneEsp (E p : entier)
SPÉCIFICATIONS : p ∈ ℕ. Affiche p espaces.
DÉBUT
    si p > 0 alors
        affEspace()
        affLigneEsp(p - 1)
    fin si;
FIN

PROCÉDURE : diagonale (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Ligne 1 : n − 1 espaces puis une étoile ; … ; ligne n : une étoile seule.
DÉBUT
    si n > 0 alors
        affLigneEsp(n - 1)
        affEtoile()
        affRL()
        diagonale(n - 1)
    fin si;
FIN`},
 {lab:"TD 2, ex. 9.4 : rectangle(p, n), en récursif",note:"Un deuxième paramètre p compte les lignes qui restent. carre(n) = rectangle(n, n).",out:n=>Array.from({length:3},()=>rep("*",n)).join("\n"),code:`PROCÉDURE : rectangle (E p : entier, E n : entier)
SPÉCIFICATIONS : affiche p lignes de n étoiles (ici p = 3).
DÉBUT
    si p > 0 alors
        ligneRec(n)
        rectangle(p - 1, n)
    fin si;
FIN`},
 {lab:"TD 2, ex. 9.5 : pyramideDec(n, p), en récursif",note:"On affiche d'abord la pyramide de n − 1 étages, décalée d'un espace de plus, puis la base : p espaces et 2n − 1 étoiles.",out:n=>Array.from({length:n},(_,i)=>rep(" ",n-i-1)+rep("*",2*i+1)).join("\n"),code:`PROCÉDURE : pyramideDec (E n : entier, E p : entier)
SPÉCIFICATIONS : pyramide de n étages, décalée de p espaces (appel : pyramideDec(n, 0)).
DÉBUT
    si n > 0 alors
        pyramideDec(n - 1, p + 1)
        affLigneEsp(p)
        ligneRec(2*n - 1)
    fin si;
FIN`}];
function motifs(host){
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><select data-m aria-label="Choisir la figure">${MOT.map((m,i)=>`<option value="${i}">${m.lab}</option>`).join("")}</select><label>n = <input type="number" min="1" max="9" value="5" data-n style="width:4em"></label></div><div class="split"><div class="mcode" style="min-width:0"></div><div style="min-width:0"><div class="muted" style="font-size:.85rem">Ce qui s'affiche</div><pre class="console mout"></pre><div class="w-note"></div></div></div></div>`;
  const q=s=>host.querySelector(s);
  const draw=()=>{const m=MOT[+q("[data-m]").value];const n=Math.max(1,Math.min(9,Math.round(+q("[data-n]").value)||5));q(".mcode").innerHTML=C(m.code);q(".mout").textContent=m.out(n);q(".w-note").innerHTML=`<div class="verdict info">${m.note}</div>`;};
  host.addEventListener("input",draw);host.addEventListener("change",draw);draw();
}

/* jeu de la vie (TP) : tableau 2D, voisines, nouvelle grille */
function lifeLab(host){
  const R=8,K=10;let G=Array.from({length:R},()=>Array(K).fill(0)),sel=null,gen=0,count=false;
  const set=cells=>{G=Array.from({length:R},()=>Array(K).fill(0));cells.forEach(([i,j])=>G[i][j]=1);gen=0;sel=null;};
  set([[1,2],[2,3],[3,1],[3,2],[3,3],[5,6],[5,7],[5,8]]);
  const nb=(i,j)=>{let n=0;for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++)if(a>=0&&a<R&&b>=0&&b<K&&(a!==i||b!==j))n+=G[a][b];return n;};
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><button class="btn pri" data-a="step">Génération suivante</button><button class="btn" data-a="count" aria-pressed="false">Mode : compter les voisines</button><button class="btn" data-a="glider">Planeur</button><button class="btn" data-a="blink">Clignotant</button><button class="btn" data-a="clear">Tout effacer</button></div><div class="life" style="grid-template-columns:repeat(${K},26px)"></div><div class="w-note"></div></div>`;
  const q=s=>host.querySelector(s);
  function draw(){
    q(".life").innerHTML=G.map((r,i)=>r.map((v,j)=>{const isS=sel&&sel[0]===i&&sel[1]===j,isN=sel&&!isS&&Math.abs(sel[0]-i)<=1&&Math.abs(sel[1]-j)<=1;return `<button data-i="${i}" data-j="${j}" class="${v?"on":""}${isS?" sel":""}${isN?" nb":""}" aria-label="ligne ${i}, colonne ${j}, ${v?"vivante":"morte"}">${count?nb(i,j):""}</button>`;}).join("")).join("");
    let t;
    if(count&&sel){const[i,j]=sel,v=nb(i,j),al=G[i][j],nx=al?(v===2||v===3):v===3;t=`Case G[${i}][${j}] : ${al?"vivante":"morte"}, ${v} voisine(s) vivante(s) (encadrées en bleu)${i===0||j===0||i===R-1||j===K-1?" ; au bord, il y a moins de 8 voisines":""}. À la génération suivante : <b>${nx?"vivante":"morte"}</b>, car ${al?(nx?"une vivante survit avec 2 ou 3 voisines":"une vivante meurt avec moins de 2 ou plus de 3 voisines"):(nx?"une morte naît avec exactement 3 voisines":"une morte ne naît qu'avec exactement 3 voisines")}.`;}
    else t=count?"Clique sur une case pour voir ses voisines. Le nombre écrit dans chaque case est son nombre de voisines vivantes.":`Génération ${gen}. Clique sur les cases pour les rendre vivantes (vertes) ou mortes, puis passe à la génération suivante.`;
    q(".w-note").innerHTML=`<div class="verdict info">${t}</div>`;
  }
  host.addEventListener("click",e=>{const c=e.target.closest("[data-i]");if(c){const i=+c.dataset.i,j=+c.dataset.j;if(count)sel=[i,j];else G[i][j]=1-G[i][j];draw();return;}
    const a=e.target.closest("[data-a]");if(!a)return;const k=a.dataset.a;
    if(k==="step"){const H=G.map((r,i)=>r.map((v,j)=>{const n=nb(i,j);return (v===1&&(n===2||n===3))||(v===0&&n===3)?1:0;}));G=H;gen++;}
    if(k==="count"){count=!count;a.setAttribute("aria-pressed",count);if(!count)sel=null;}
    if(k==="glider")set([[1,2],[2,3],[3,1],[3,2],[3,3]]);if(k==="blink")set([[3,3],[3,4],[3,5]]);if(k==="clear")set([]);draw();});
  draw();
}

/* pas à pas sur des piles et des listes : les exercices « à vous de jouer » du cours */
const PV=[
 {lab:"Cours p. 44 : la pile P après chaque étape",S:[
  {c:"P ← [ ]",st:{P:[]},n:"P est vide."},
  {c:"pour i de 1 à 3 faire empiler(i, P) fin pour;",st:{P:[1,2,3]},n:"On empile 1, puis 2, puis 3 : 3 est au sommet."},
  {c:"empiler(depiler(P), P)",st:{P:[1,2,3]},n:"depiler(P) enlève 3 et le renvoie, puis on le rempile : P ne change pas."},
  {c:"empiler(P[1], P)",err:1,st:{P:[1,2,3]},n:"Erreur : pas d'indice sur une pile. On n'a accès qu'au sommet, avec depiler."},
  {c:"empiler(P, 4)",err:1,st:{P:[1,2,3]},n:"Erreur : l'ordre des paramètres est empiler(élément, pile)."},
  {c:"P ← cons(3, P)",err:1,st:{P:[1,2,3]},n:"Erreur : cons est une fonction des listes. Pour une pile : empiler(3, P)."},
  {c:"depiler(P)",st:{P:[1,2]},n:"depiler enlève le sommet 3. Il reste 1 et 2, avec 2 au sommet."}]},
 {lab:"Cours p. 46 : inverser une pile avec Q et R",S:[
  {c:"P contient 1, 2, 3 ; Q, R ← [ ], [ ]",st:{P:[1,2,3],Q:[],R:[]},n:"3 est au sommet de P. À la fin, on veut 1 au sommet de P."},
  {c:"tant que non estVide(P) faire empiler(depiler(P), Q) fin tq;",st:{P:[],Q:[3,2,1],R:[]},n:"Vider P dans Q inverse l'ordre : 1 est maintenant au sommet de Q."},
  {c:"tant que non estVide(Q) faire empiler(depiler(Q), R) fin tq;",st:{P:[],Q:[],R:[1,2,3]},n:"Vider Q dans R inverse encore : on est revenu à l'ordre de départ."},
  {c:"tant que non estVide(R) faire empiler(depiler(R), P) fin tq;",st:{P:[3,2,1],Q:[],R:[]},n:"Un troisième transvasement inverse une dernière fois : P est inversée. Chaque transvasement inverse l'ordre : il en faut un nombre impair pour finir dans P, inversée."}]},
 {lab:"Cours p. 45 : doublePile",S:[
  {c:"P contient 1, 2, 3 ; Q ← [ ]",st:{P:[1,2,3],Q:[]},n:"On veut doubler chaque valeur de P, sans changer l'ordre."},
  {c:"tant que non estVide(P) faire empiler(2*depiler(P), Q) fin tq;",st:{P:[],Q:[6,4,2]},n:"Chaque valeur est doublée en passant dans Q, mais l'ordre est inversé."},
  {c:"tant que non estVide(Q) faire empiler(depiler(Q), P) fin tq;",st:{P:[2,4,6],Q:[]},n:"On remet tout dans P : l'ordre est rétabli."}]},
 {lab:"Cours p. 39 : la liste L après chaque étape",list:true,S:[
  {c:"L ← cons(2, [ ])",st:{L:[2]},n:"cons(2, [ ]) est la liste à un élément [2]."},
  {c:"L ← cons(tête(L), queue(L))",st:{L:[2]},n:"tête(L) = 2 et queue(L) = [ ] : on reconstruit la même liste."},
  {c:"L ← cons(3, L)",st:{L:[3,2]},n:"3 est ajouté devant."},
  {c:"pour i de 1 à 5 faire L ← cons(i, L) fin pour;",st:{L:[5,4,3,2,1,3,2]},n:"1, puis 2, …, puis 5 sont ajoutés devant : le dernier ajouté est en tête."},
  {c:"L ← queue(queue(L))",st:{L:[3,2,1,3,2]},n:"On enlève les deux premiers éléments."},
  {c:"L ← cons(L[2], [ ])",err:1,st:{L:[3,2,1,3,2]},n:"Erreur : pas d'indice sur une liste. Le 3e élément s'écrit tête(queue(queue(L)))."},
  {c:"L ← cons([ ], 5)",err:1,st:{L:[3,2,1,3,2]},n:"Erreur : l'ordre est cons(élément, liste), et 5 n'est pas une liste."}]}];
function stepLab(host,which){
  const V=which?PV.filter((v,i)=>which.includes(i)):PV;let vi=0,k=0;
  host.innerHTML=`<div class="widget"><div class="w-ctrl">${V.length>1?`<select data-v aria-label="Choisir l'exercice">${V.map((v,i)=>`<option value="${i}">${v.lab}</option>`).join("")}</select>`:`<b>${V[0].lab}</b>`}<button class="btn" data-a="prev">Précédent</button><button class="btn pri" data-a="next">Suivant</button></div><ol class="steps pv-steps" style="margin:0"></ol><div class="pv-state" style="display:grid;gap:14px"></div><div class="w-note"></div></div>`;
  const q=s=>host.querySelector(s);
  function draw(){const v=V[vi],s=v.S[k];
    q(".pv-steps").innerHTML=v.S.map((x,i)=>`<li class="${i<k?"done":i===k?"cur":"later"}"><div class="w"><code>${esc(x.c)}</code>${x.err&&i<=k?' <span class="r">erreur</span>':""}</div></li>`).join("");
    q(".pv-state").style.gridTemplateColumns=`repeat(${Object.keys(s.st).length},minmax(0,1fr))`;
    q(".pv-state").innerHTML=Object.entries(s.st).map(([nm,a])=>v.list?`<div><h5 style="margin:0 0 6px">${nm}</h5><code style="font-size:1.05rem">[${a.join(", ")}]</code></div>`:`<div><h5 style="margin:0 0 6px">Pile ${nm}</h5><div class="stack">${a.length?a.slice().reverse().map((x,i)=>`<span class="${i===0?"top":""}">${x}${i===0?" ← sommet":""}</span>`).join(""):'<span class="muted">vide</span>'}</div></div>`).join("");
    q(".w-note").innerHTML=`<div class="verdict ${s.err?"no":"info"}">${s.n}</div>`;
    q('[data-a="prev"]').disabled=k===0;q('[data-a="next"]').disabled=k===v.S.length-1;}
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="prev"&&k>0)k--;if(a==="next"&&k<V[vi].S.length-1)k++;if(a)draw();});
  host.addEventListener("change",e=>{if(e.target.matches("[data-v]")){vi=+e.target.value;k=0;draw();}});
  draw();
}

/* ---------- chapitre 1 : écrire du pseudo-code (cours p. 6 à 19, TD 1) ---------- */
add(1,{id:"a-pseudo",type:"code",ref:"Cours p. 8 à 19",t:"La forme d'un algorithme : signature, variables, fin si, fin pour, fin tq",short:"Écrire un algorithme sans faute",cc:"Le conseil de tes camarades",
 plain:`Un algorithme en pseudo-code a toujours la même forme : ${hl("la signature")} (FONCTION ou PROCÉDURE, son nom, ses paramètres avec E, S ou ES et leur type, puis le type du résultat), ${hl("les spécifications")}, ${hl("les variables")}, puis le corps entre DÉBUT et FIN. Chaque si, pour, tant que se ferme par ${hl("fin si; fin pour; fin tq;")}, aligné sous son ouverture. Entraîne-toi : trouve les erreurs.`,
 fig:()=>bugHunt,
 formal:`${C(`FONCTION : compteEgaux (E e : entier, E T : tableau d'entiers) : entier
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
FIN`)}<ul><li><b>Fonction</b> : renvoie un résultat, dont le type vient après la parenthèse. <b>Procédure</b> : ne renvoie rien, pas de type de résultat.</li><li>Chaque paramètre : E (entrée), S (sortie) ou ES (entrée-sortie), son nom, son type.</li><li><b>Variable</b> : toutes les mémoires de travail, avec leur type. Ni l'indice d'une boucle pour, ni les paramètres (cours p. 11).</li><li>Tout ce qui est entre faire et fin pour; est répété. Ce qui se fait une seule fois (initialiser, Renvoyer) est avant ou après la boucle.</li><li>Plusieurs affectations d'un coup : <code>cpt, M ← 0, L</code>.</li></ul>`,
 use:`<p>Écris la signature et les spécifications en premier, avant le corps. Puis trace au crayon un trait vertical de chaque pour jusqu'à son fin pour; : tu vois tout de suite ce qui est répété.</p>`,
 trap:`Un Renvoyer dans une boucle arrête tout l'algorithme au premier passage. Ce n'est voulu que pour une recherche : « dès que je trouve, je renvoie », et le Renvoyer de l'autre cas vient après la boucle.`,
 q:"Dans une fonction qui additionne les éléments d'un tableau, où se place Renvoyer som ?",a:"Après fin pour; : on renvoie une seule fois, quand la boucle a tout parcouru. Et som ← 0 se place avant la boucle.",rel:["a-bases","a-boucles","p/recettes"]});

add(1,{id:"a-bases",type:"def",ref:"Cours p. 6 à 11",t:"Fonction, procédure, paramètres, variables",short:"Fonction, procédure, paramètres",
 plain:`Une ${hl("fonction")} renvoie un résultat (Renvoyer). Une ${hl("procédure")} ne renvoie rien : elle affiche, ou modifie un paramètre ES. Les ${hl("paramètres")} font passer l'information entre l'algorithme et celui qui l'appelle ; les ${hl("variables")} sont les mémoires de travail à l'intérieur.`,
 fig:()=>h=>{h.innerHTML=`<div class="split"><div style="min-width:0">${C(`FONCTION : carre (E x : entier) : entier
SPÉCIFICATIONS : renvoie x au carré.
DÉBUT
    Renvoyer x * x
FIN`)}</div><div style="min-width:0">${C(`PROCÉDURE : doubleTab (ES T : tableau d'entier)
SPÉCIFICATIONS : double les valeurs de T.
DÉBUT
    pour i de 0 à taille(T)-1 faire
        T[i] ← 2*T[i]
    fin pour;
FIN`)}</div></div>`;},
 formal:`<ul><li><b>Fonction</b> : algorithme qui renvoie un résultat principal (« Renvoyer »). <b>Procédure</b> : algorithme qui n'en renvoie pas.</li><li><b>Paramètres</b> : E (entrée, lu seulement), S (sortie, écrit seulement), ES (entrée-sortie : lu et modifié, comme T dans doubleTab).</li><li><b>Variable</b> : mémoire à l'intérieur de l'algorithme, déclarée dans « Variable : » et initialisée dans le corps.</li><li><b>Spécifications</b> : ce que l'algorithme suppose sur ses paramètres et ce qu'il renvoie.</li><li><b>Appel</b> : nom puis arguments entre parenthèses, cos(π) ; <b>appel récursif</b> : l'algorithme s'appelle lui-même.</li></ul>`,
 use:`<p>Questions de cours fréquentes : « différence entre fonction et procédure », « entre variable et paramètre », « une fonction récursive peut-elle utiliser des variables ? » (oui).</p>`,
 trap:`Une variable non initialisée ne peut pas être utilisée : au CC 2022, l'algorithme d'Arya ne renvoie rien de correct car sa liste L n'est pas initialisée.`,
 q:"Quelle est la différence entre une variable d'algorithme et un paramètre d'algorithme ?",a:"Une variable est une mémoire à l'intérieur de l'algorithme. Un paramètre est une mémoire à l'interface entre l'intérieur et l'extérieur : il permet d'échanger des informations avec l'appelant (déclaré dans la signature, initialisé par l'appel, éventuellement en lecture ou écriture seule).",
 rel:["a-pseudo","a-expressions"]});

const EXPR=[
 {e:"(2 + (3 * (7 - 5)))",t:"entier",v:"8",why:"TD 1, ex. 1.1."},
 {e:"2 + (3 * true)",t:"erreur",why:"On ne multiplie pas un booléen."},
 {e:"(2 < 3) et false",t:"booléen",v:"false"},
 {e:"proche?(1, 2, 3)",t:"erreur",why:"proche? prend 2 paramètres, pas 3."},
 {e:"proche?(1, 2) ou proche?((5*48) div 7, 33)",t:"booléen",v:"true",why:"|1 − 2| = 1 < 2 est vrai : « ou » s'arrête là (évaluation paresseuse)."},
 {e:"(reste(3) et reste(5)) < 3",t:"erreur",why:"reste renvoie un entier ; « et » veut deux booléens."},
 {e:"proche?(reste(5), 2)",t:"booléen",v:"true",why:"reste(5) = 1 et |1 − 2| = 1 < 2."},
 {e:"cond(proche?(1, 4), false, proche?(2, 3))",t:"booléen",v:"true",why:"proche?(1, 4) est faux, donc on prend proche?(2, 3), qui est vrai."},
 {e:"cond(1 < 3, reste(3), true)",t:"erreur",why:"Les deux valeurs possibles de cond doivent avoir le même type : ici un entier et un booléen."},
 {e:"1 + 5 * 2",t:"entier",v:"11",why:"La multiplication passe avant l'addition."},
 {e:"1 + 5 / 2",t:"nombre",v:"3.5",why:"/ donne un nombre (réel), pas un entier."},
 {e:"8 div 3 + 7 mod 5",t:"entier",v:"4",why:"8 div 3 = 2 (quotient) et 7 mod 5 = 2 (reste)."},
 {e:"1 = 5 * 2",t:"booléen",v:"false",why:"= est un test en pseudo-code."},
 {e:"true et (true ou false)",t:"booléen",v:"true"},
 {e:"true ou (5/0 = 1)",t:"booléen",v:"true",why:"Évaluation paresseuse : true ou … vaut true sans calculer la suite, donc pas de division par 0."},
 {e:"cond(5 mod 2 = 1, 8, 15)",t:"entier",v:"8"},
 {e:"cond(5 div 2 = 1, true, 0)",t:"erreur",why:"true et 0 n'ont pas le même type."},
 {e:"cond(5 div 2 = 2, cond(5 mod 2 = 0, 3, 8), 11)",t:"entier",v:"8",why:"5 div 2 = 2 est vrai ; 5 mod 2 = 1, donc le cond intérieur vaut 8."}];
add(1,{id:"a-expressions",type:"def",ref:"Cours p. 10 à 13, TD 1 ex. 1",t:"Types et valeurs d'une expression, cond",short:"Types, expressions, cond",
 plain:`Chaque expression a un ${hl("type")} : entier, nombre, booléen, chaîne… Les opérateurs imposent le type de ce qu'ils reçoivent : « et », « ou » veulent des booléens, div et mod des entiers. ${hl("cond(a, b, c)")} vaut b si a est vrai, c sinon, et b et c doivent avoir le même type. Entraîne-toi sur les expressions du TD 1 et du cours (proche?(a, b) teste |a − b| &lt; 2 ; reste(x) est le reste de x par 2).`,
 fig:()=>h=>W.drill(h,EXPR,["entier","nombre","booléen","erreur"],"pseudo",{ask:"Quel est son type ? (erreur si elle n'est pas correcte)",label:"Réponse"}),
 formal:`<ul><li>Calcul : + - * / ^ (puissance), div (quotient entier), mod (reste). Comparaison : = ≠ &lt; ≤ &gt; ≥. Logique : non, et, ou.</li><li><b>Évaluation paresseuse</b> : dans « a et b », si a est faux, b n'est pas calculé ; dans « a ou b », si a est vrai, b n'est pas calculé. cond aussi ne calcule que la valeur choisie.</li><li>Affectation : variable ← expression.</li><li>Python : ^ devient **, div //, mod %, = ==, ≠ !=, et and, ou or, non not, cond(a, b, c) b if a else c, ← =.</li></ul>`,
 use:`<p>TD 1, ex. 1 et cours p. 13 : « quels sont les types et valeurs, mettre erreur s'il n'y en a pas ». Regarde d'abord le nombre d'arguments de chaque appel, puis le type attendu par chaque opérateur, puis calcule.</p>`,
 trap:`/ donne toujours un nombre (5/2 = 2,5) ; div donne le quotient entier (5 div 2 = 2). Et cond(proche?(4, 2), 2/0, 1) vaut 1 sans erreur : proche?(4, 2) est faux (|4 − 2| = 2 n'est pas &lt; 2), donc 2/0 n'est jamais calculé.`,
 q:"L'expression cond(a, b, c) vaut b si a est vrai, c sinon. Que vaut cond(1 < 3, 5, true) ?",a:"C'est une erreur : les deux valeurs possibles de cond doivent avoir le même type. Ici 5 est un entier et true un booléen.",rel:["a-bases","a-boucles"]});

add(1,{id:"a-boucles",type:"def",ref:"Cours p. 14 à 19",t:"si, pour, tant que",
 plain:`${hl("pour")} répète un nombre de fois connu à l'avance. ${hl("tant que")} répète tant qu'une condition est vraie : on ne sait pas toujours combien de fois. Déroule l'exemple pas à pas : m perd un chiffre à chaque tour, c compte les tours.`,
 fig:()=>h=>W.tracer(h,{lang:"pseudo",code:["FONCTION : nbChiffres (E n : entier) : entier","Variable : c, m : entier","DÉBUT","    c, m ← 1, n","    tant que m ≥ 10 faire","        m ← m div 10","        c ← c + 1","    fin tq;","    Renvoyer c","FIN"],cols:["m","c"],params:[{k:"n",label:"n =",min:0,max:99999999,val:4097}],
  gen:p=>{let m=p.n,c=1;const S=[{l:3,v:{m,c},note:"Initialisation : un nombre a au moins un chiffre. On copie n dans la variable m."}];while(m>=10){S.push({l:4,v:{m,c},row:false,note:`${m} ≥ 10 : on refait un tour.`});m=Math.floor(m/10);S.push({l:5,v:{m,c},row:false,note:"On enlève le dernier chiffre (division entière par 10)."});c++;S.push({l:6,v:{m,c},note:"Un chiffre de plus compté."});}S.push({l:4,v:{m,c},row:false,note:`${m} < 10 : la condition est fausse, on sort de la boucle.`});S.push({l:8,v:{m,c},row:false,out:`renvoie ${c}`,note:`Le résultat est ${c}.`});return S;}}),
 formal:`${C(`si condition alors … sinon si autre alors … sinon … fin si;
pour i de a à b faire … fin pour;          (a et b compris)
pour i de b à a par pas de -1 faire … fin pour;
tant que condition faire … fin tq;`)}<p>« tant que » est plus générale que « pour » : toute boucle pour s'écrit avec tant que, mais on ne connaît pas toujours le nombre de tours à l'avance. Dans un tant que, le compteur est une vraie variable : on le déclare, on l'initialise et on l'augmente soi-même.</p>`,
 use:`<p>Pour une trace (« que renvoie ce bloc ? »), fais un tableau avec une colonne par variable et une ligne par tour de boucle, comme ci-dessus.</p>`,
 trap:`« pour i de 6 à 3 par pas de -2 » fait i = 6 puis 4 : on s'arrête quand i dépasse 3. Et en Python, range(a, b) s'arrête à b − 1 : il faut range(a, b+1).`,
 q:"Pourquoi dit-on que la boucle tant que est plus générale que la boucle pour ?",a:"Toute boucle pour peut s'écrire avec tant que (en gérant le compteur à la main), mais pas l'inverse : avec tant que, on peut répéter sans connaître le nombre de tours à l'avance.",
 rel:["a-pseudo","a-motifs"]});

add(1,{id:"a-motifs",type:"code",ref:"TD 1 ex. 4, TD 2 ex. 9, PEIP 2023 ex. 3",t:"Afficher un motif d'étoiles",short:"Motifs d'étoiles",cc:"4 pts en 2023",
 plain:`Pour afficher une figure, cherche ce que contient ${hl("la ligne numéro i")} : combien d'espaces, combien d'étoiles, en fonction de i et de n. Ensuite : une boucle sur les lignes, et dedans une boucle par morceau, puis le retour à la ligne. Change la figure et n.`,
 fig:()=>motifs,
 formal:`<ol><li>Dessine la figure pour n = 4 et numérote les lignes.</li><li>Pour chaque ligne i, écris le nombre d'espaces et d'étoiles. Exemple, pyramide : n − i espaces, puis i fois « * ».</li><li>Traduis : <code>pour i … faire</code> [boucle des espaces] [boucle des étoiles] <code>affRL()</code> <code>fin pour;</code>.</li><li>Vérifie sur la première et la dernière ligne.</li></ol><p>En récursif (TD 2, ex. 9), pas de boucle : on affiche une ligne, et on demande à l'appel récursif d'afficher le reste de la figure.</p>`,
 use:`<p>Au CC PEIP 2023 : 4 points pour un motif « non récursif » avec affX, affB et alaligne. Même méthode.</p>`,
 trap:`affRL() se place après la boucle des étoiles, mais dans la boucle des lignes. Une ligne de trop ou de moins vient presque toujours d'un fin pour; mal placé.`,
 q:"Un triangle inversé de côté n : la ligne 1 a n étoiles, chaque ligne suivante a une étoile de moins et commence un cran plus à droite. Sur la ligne i (de 1 à n), combien d'espaces et combien d'étoiles ?",a:"i − 1 espaces, puis n − i + 1 étoiles. Ligne 1 : 0 espace et n étoiles ; ligne n : n − 1 espaces et 1 étoile.",rel:["a-boucles","a-arbre-appels"]});

add(1,{id:"a-python",type:"meth",ref:"Cours p. 12, 18, 27",t:"Passer du pseudo-code à Python",short:"Pseudo-code et Python",
 plain:`Au CC, on peut parfois écrire ${hl("en pseudo-code ou en Python")}. Les deux disent la même chose avec des mots différents : apprends la correspondance. Sans précision, préfère le pseudo-code du cours.`,
 fig:()=>h=>{h.innerHTML=`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Pseudo-code</th><th>Python</th></tr></thead><tbody>${[["FONCTION : f (E x : entier) : entier","def f(x):"],["Renvoyer r","return r"],["x ← 3","x = 3"],["x = 3 (test)","x == 3"],["x ≠ 3","x != 3"],["a div b, a mod b","a // b, a % b"],["et, ou, non","and, or, not"],["pour i de 0 à n−1 faire","for i in range(n):"],["pour i de a à b faire","for i in range(a, b+1):"],["pour i de n−1 à 0 par pas de −1","for i in range(n-1, -1, -1):"],["tant que c faire","while c:"],["taille(T)","len(T)"],["afficher x","print(x)"],["cond(c, x, y)","x if c else y"]].map(r=>`<tr><td><code>${esc(r[0])}</code></td><td><code>${esc(r[1])}</code></td></tr>`).join("")}</tbody></table></div>`;},
 formal:`<p>En Python, l'indentation (4 espaces) délimite les blocs : pas de fin pour; ni de fin si;. Le « : » termine chaque ligne d'en-tête (def, for, while, if, else).</p>`,
 use:`<p>Si l'énoncé dit « en pseudo-code », donne la signature avec les types et E/S, et ferme chaque bloc. En Python, la signature se réduit à <code>def nom(paramètres):</code>.</p>`,
 trap:`Le « = » du pseudo-code est un test, celui de Python est une affectation. Et range(a, b) n'inclut pas b.`,
 q:"Comment écrire « pour i de 1 à n faire » en Python ?",a:"for i in range(1, n+1):",rel:["a-pseudo","a-tableaux"]});

/* ---------- chapitre 2 : récursivité (cours p. 7-8, TD 2) ---------- */
add(2,{id:"a-recursif",type:"def",ref:"Cours p. 7-8, TD 2",t:"Algorithme récursif : cas de base et appel récursif",short:"Récursivité",
 plain:`Un algorithme récursif ${hl("s'appelle lui-même")} sur un problème plus petit. Il lui faut un ${hl("cas de base")} qui s'arrête sans s'appeler, sinon il tourne à l'infini. Regarde l'arbre des appels de FactRec.`,
 fig:()=>h=>W.calltree(h,{params:[{k:"n",label:"n =",min:0,max:8,val:4}],run:(p,api)=>{const f=n=>api.call(`FactRec(${n})`,()=>n===0?1:n*f(n-1));f(p.n);}}),
 formal:`${C(`FONCTION : FactRec (E n : entier) : entier
SPÉCIFICATIONS : n ∈ ℕ. Calcule et renvoie n! = 1 × 2 × … × n, avec 0! = 1.
DÉBUT
    si n = 0 alors
        Renvoyer 1
    sinon
        Renvoyer n * FactRec(n - 1)
    fin si;
FIN`)}<p>La même chose en une ligne : <code>Renvoyer cond(n = 0, 1, n * FactRec(n - 1))</code>.</p>${C(`TD 2, ex. 6 :  Renvoyer cond(a = b, a, a + sommeInterv(a + 1, b))
TD 2, ex. 7 :  Renvoyer cond(n = 0, 1, 2 * suiteU(n - 1) + 3)
TD 2, ex. 8 :  Renvoyer cond(n = 0, true, cond(n = 1, false, estPair(n - 2)))
TD 2, ex. 12 : Renvoyer cond(a = 0, 0, cond(a mod 2 = 0, 2 * mul(a div 2, b), 2 * mul(a div 2, b) + b))`)}`,
 use:`<p>La méthode du TD : (1) le cas de base, « quand n = 0, f(n) vaut … » ; (2) l'équation de récurrence, « quand n &gt; 0, f(n) = … f(n − 1) … » ; (3) la traduction avec si ou cond. Les deux premières lignes, écrites en français, rapportent déjà des points.</p>`,
 trap:`Sans cas de base, ou si l'appel ne se rapproche pas du cas de base (estPair(n) au lieu de estPair(n − 2)), l'algorithme se rappelle à l'infini.`,
 q:"Que se passe-t-il si un algorithme récursif n'a pas de cas de base ? (CC1 2024)",a:"Il se rappelle récursivement à l'infini, sans pouvoir s'arrêter.",rel:["a-arbre-appels","p/recettes"]});

const GA=`PROCÉDURE : G (E n : entier)
DÉBUT
    si n > 0 alors
        G(n-2)
        afficher n étoiles
        G(n-1)
    fin si;
FIN`,GB=`PROCÉDURE : G (E n : entier)
DÉBUT
    si n > 0 alors
        G(n-1)
        afficher n étoiles
        G(n-2)
    fin si;
FIN`,GC=`PROCÉDURE : G (E n : entier, E d : entier)
SPÉCIFICATIONS : n ∈ ℕ.
DÉBUT
    si n ≠ 0 alors
        G(n div 2, d+1)
        pour i de 1 à n faire affiche(d) fin pour;
        aLaLigne()
    fin si;
FIN`,GP=`(TD 2, ex. 13 : 0 = ←, 1 = ↑, 2 = →, 3 = ↓)
PROCÉDURE : trajet (E n : entier)
DÉBUT
    si n ≥ 0 et n ≤ 3 alors
        trajet(n-1)
        trajet(n-2)
        deplacerPingouin(n)
    fin si;
FIN`;
add(2,{id:"a-arbre-appels",type:"meth",ref:"TD 2 ex. 13, CC1 2024 ex. 2, PEIP 2023 ex. 1",t:"Qu'affiche une procédure récursive ?",short:"Tracer un affichage récursif",cc:"4 pts en 2023 et en 2024",
 plain:`Pour trouver ce qu'affiche G(4), ${hl("on dessine l'arbre des appels")} et on lit les affichages dans l'ordre où ils se produisent. Astuce : calcule d'abord G(1), G(2), G(3), puis réutilise-les. Choisis un exemple et avance pas à pas.`,
 fig:()=>h=>W.calltree(h,{params:[{k:"n",label:"n =",min:1,max:6,val:4}],variants:[
   {label:"CC1 2024 sujet A : G(n-2), affiche, G(n-1)",code:GA,run:(p,api)=>{const g=n=>api.call(`G(${n})`,()=>{if(n>0){g(n-2);api.print("*".repeat(n));g(n-1);}});g(p.n);}},
   {label:"CC1 2024 sujet B : G(n-1), affiche, G(n-2)",code:GB,run:(p,api)=>{const g=n=>api.call(`G(${n})`,()=>{if(n>0){g(n-1);api.print("*".repeat(n));g(n-2);}});g(p.n);}},
   {label:"PEIP 2023 : G(n div 2, d+1) puis n fois d (n = 2 × n + 1)",code:GC,run:(p,api)=>{const g=(n,d)=>api.call(`G(${n}, ${d})`,()=>{if(n!==0){g(Math.floor(n/2),d+1);api.print(String(d).repeat(n));}});g(p.n*2+1,0);}},
   {label:"TD 2, ex. 13 : le pingouin, trajet(n) (n ≤ 3)",code:GP,run:(p,api)=>{const A=["←","↑","→","↓"];const t=n=>api.call(`trajet(${n})`,()=>{if(n>=0&&n<=3){t(n-1);t(n-2);api.print(`${n} ${A[n]}`);}});t(Math.min(p.n,3));}}]}),
 formal:`<p>Méthode : on note ce qu'affichent les petits appels, puis on assemble dans l'ordre des instructions.</p>${C(`G(1) affiche *
G(2) fait G(0), affiche **, fait G(1)   → ** / *
G(3) fait G(1), affiche ***, fait G(2)  → * / *** / ** / *
G(4) fait G(2), affiche ****, fait G(3) → ** / * / **** / * / *** / ** / *`)}<p>Le pingouin : trajet(0) = 0 ; trajet(1) = 0 1 ; trajet(2) = 0 1 0 2 ; trajet(3) = 0 1 0 2 0 1 3, soit ← ↑ ← → ← ↑ ↓.</p>`,
 use:`<p>Écris les résultats intermédiaires G(1), G(2), G(3) : le correcteur voit ta méthode et tu évites les erreurs. Les appels hors du cas « si » n'affichent rien.</p>`,
 trap:`L'ordre compte : « G(n−2) ; afficher ; G(n−1) » et « G(n−1) ; afficher ; G(n−2) » ne donnent pas le même affichage. Change la variante dans la figure pour le voir.`,
 q:"Avec G(n) = « si n > 0 : G(n−2), afficher n étoiles, G(n−1) », qu'affiche G(2) ?",a:"G(0) n'affiche rien, puis ** , puis G(1) qui affiche * : donc ** puis * (deux lignes).",rel:["a-recursif","a-motifs"]});

add(2,{id:"a-arret",type:"meth",maybe:"Tombé au CC1 2024, mais les preuves (TD 6) ne sont pas encore faites cette année : pas sûr que ça tombe. Lis-la s'il te reste du temps.",ref:"CC1 2024, exercice 2.1",t:"Prouver qu'un algorithme récursif s'arrête",short:"Prouver l'arrêt",
 plain:`On prouve l'arrêt ${hl("par récurrence")} sur le paramètre : les cas de base s'arrêtent, et si les appels plus petits s'arrêtent, l'appel courant aussi. Quand G s'appelle sur n−1 et n−2, c'est une récurrence « à deux pas ».`,
 fig:()=>h=>{h.innerHTML=`<div class="redac"><p>Pour n ∈ ℤ, on note P<sub>n</sub> : « G(n) s'arrête ».</p><p><b>Initialisation</b> : si n ≤ 0, G(n) fait uniquement le test « n > 0 », donc s'arrête : P<sub>n</sub> est vraie.</p><p><b>Hérédité</b> (récurrence à deux pas) : pour n ≥ 1, supposons P<sub>n−2</sub> et P<sub>n−1</sub> vraies. Après le test, G(n) appelle G(n − 2) et G(n − 1), qui s'arrêtent par hypothèse, et fait un affichage, qui s'arrête aussi. Donc G(n) s'arrête : P<sub>n</sub> est vraie.</p><p><b>Conclusion</b> : pour tout n ∈ ℤ, G(n) s'arrête.</p></div><p class="muted">Corrigé officiel du CC1 2024.</p>`;},
 formal:`<ul><li>On nomme la propriété : P<sub>n</sub> : « f(n) s'arrête ».</li><li>Initialisation : les cas de base (souvent n ≤ 0 ou n = 0) ne font aucun appel.</li><li>Hérédité : les appels se font sur des valeurs plus petites, qui s'arrêtent par hypothèse ; les autres instructions s'arrêtent.</li><li>Si f(n) appelle f(n − 1) et f(n − 2) : récurrence à deux pas (on suppose P<sub>n−1</sub> et P<sub>n−2</sub>).</li></ul>`,
 use:`<p>4 points au CC1 2024 pour l'arrêt et l'affichage.</p>`,
 trap:`L'initialisation doit couvrir tous les cas sans appel : ici n ≤ 0, pas seulement n = 0, puisque G(n − 2) peut appeler G(−1).`,
 q:"Une procédure récursive G(n) appelle G(n−1) et G(n−2). Pour prouver qu'elle s'arrête, pourquoi faut-il une récurrence « à deux pas » ?",a:"Parce que pour montrer que G(n) s'arrête, on a besoin que G(n−1) ET G(n−2) s'arrêtent : on suppose les deux propriétés précédentes vraies.",rel:["a-arbre-appels"]});

/* ---------- chapitre 3 : tableaux 1D et 2D, dictionnaires (cours p. 21 à 37, TD 3 et 4, TP) ---------- */
add(3,{id:"a-tableaux",type:"def",ref:"Cours p. 22 à 27, TD 3",t:"Tableaux 1D : parcourir, compter, chercher",short:"Tableaux 1D",cc:"6 pts en 2024",
 plain:`Un tableau T contient un nombre fixe de cases, ${hl("numérotées de 0 à taille(T) − 1")}. On le parcourt avec une boucle pour sur les indices. Déroule la recherche du maximum : m garde le plus grand vu jusqu'ici.`,
 fig:()=>h=>W.tracer(h,{lang:"pseudo",code:["FONCTION : maximum (E T : tableau de nombres) : nombre","SPÉCIFICATIONS : renvoie le plus grand élément de T.","Variable : m : nombre","DÉBUT","    m ← T[0]","    pour i de 1 à taille(T)-1 faire","        si T[i] > m alors","            m ← T[i]","        fin si;","    fin pour;","    Renvoyer m","FIN"],cols:["i","T[i]","m"],params:[{k:"g",label:"Exemple n°",min:1,max:4,val:1}],
  gen:p=>{const T=[[15,12,4,9,7],[3,8,2,8,11,5],[9,7,5,3],[1,2,3,4,5]][p.g-1];let m=T[0];const S=[{l:4,v:{i:"",["T[i]"]:"",m},note:`T = [${T.join(", ")}]. On part du premier élément.`}];for(let i=1;i<T.length;i++){S.push({l:6,v:{i,["T[i]"]:T[i],m},note:`T[${i}] = ${T[i]} ${T[i]>m?">":"≤"} ${m}`});if(T[i]>m){m=T[i];S.push({l:7,v:{i,["T[i]"]:T[i],m},note:`Nouveau maximum : ${m}.`});}}S.push({l:10,v:{m},row:false,out:`renvoie ${m}`});return S;}}),
 formal:`<ul><li>taille(T) = nombre de cases ; indices de 0 à taille(T) − 1. Un tableau n'est jamais vide.</li><li>Déclaration : <code>Variable : T : tableau de n entiers</code> (cours p. 25).</li><li>Trois schémas à connaître :</li></ul>${C(`Accumuler (somme, produit, compteur) :
som ← 0
pour i de 0 à taille(T)-1 faire
    som ← som + T[i]
fin pour;
Renvoyer som

Chercher (« tous » ou « il existe ») :
pour i de 0 à taille(T)-1 faire
    si T[i] mod 3 ≠ 0 alors
        Renvoyer false
    fin si;
fin pour;
Renvoyer true

Fabriquer un nouveau tableau :
Variable : R : tableau de taille(T) entiers
pour i de 0 à taille(T)-1 faire
    R[i] ← T[taille(T)-1-i]
fin pour;
Renvoyer R`)}`,
 use:`<p>Le CC1 2024 donnait 6 points sur des fonctions de tableaux (volume total, nombre de camions), le PEIP 2023 4 points (tousDiv3). Un accumulateur initialisé avant la boucle, mis à jour dedans, renvoyé après.</p>`,
 trap:`T[taille(T)] n'existe pas : le dernier indice est taille(T) − 1. Dans le schéma « chercher », Renvoyer true est après fin pour; : si on le met dans la boucle (dans un sinon), on s'arrête au premier élément.`,
 q:"Pour trouver le plus grand élément d'un tableau, on garde en mémoire le plus grand vu jusque-là et on lui compare chaque case, à partir de la deuxième. Pour [3, 8, 2, 8, 11, 5], quel est le résultat et combien de comparaisons sont faites ?",a:"11, en 5 comparaisons : une par case après la première.",rel:["a-tableaux-2d","a-pseudo"]});

add(3,{id:"a-tableaux-2d",type:"code",ref:"Cours p. 28 à 33, TD 4 ex. 15-16, TP jeu de la vie",t:"Tableaux 2D et jeu de la vie",short:"Tableaux 2D, jeu de la vie",
 plain:`Un tableau 2D est un ${hl("tableau de lignes")} : T[i][j] est la case de la ligne i, colonne j. ${hl("taille(T)")} donne le nombre de lignes, ${hl("taille(T[i])")} le nombre de colonnes de la ligne i (toutes les lignes ont la même taille, le cours écrit aussi taille(T[0])). On le parcourt avec deux boucles pour imbriquées. Le jeu de la vie du TP : chaque case regarde ses 8 voisines.`,
 fig:()=>lifeLab,
 formal:`${C(`FONCTION : nbVoisins (E G : tableau 2D d'entiers, E i : entier, E j : entier) : entier
SPÉCIFICATIONS : G contient des 0 (morte) et des 1 (vivante).
    Renvoie le nombre de voisines vivantes de la case (i, j).
Variable : nb : entier
DÉBUT
    nb ← 0
    pour a de i-1 à i+1 faire
        pour b de j-1 à j+1 faire
            si a ≥ 0 et a < taille(G) et b ≥ 0 et b < taille(G[a]) et (a ≠ i ou b ≠ j) alors
                nb ← nb + G[a][b]
            fin si;
        fin pour;
    fin pour;
    Renvoyer nb
FIN

FONCTION : suivante (E G : tableau 2D d'entiers) : tableau 2D d'entiers
SPÉCIFICATIONS : renvoie la génération suivante : une vivante survit avec 2 ou 3 voisines,
    une morte naît avec exactement 3 voisines.
Variable : H : tableau taille(G) x taille(G[0]) d'entiers ; v : entier
DÉBUT
    pour i de 0 à taille(G)-1 faire
        pour j de 0 à taille(G[i])-1 faire
            v ← nbVoisins(G, i, j)
            si G[i][j] = 1 et (v = 2 ou v = 3) alors
                H[i][j] ← 1
            sinon si G[i][j] = 0 et v = 3 alors
                H[i][j] ← 1
            sinon
                H[i][j] ← 0
            fin si;
        fin pour;
    fin pour;
    Renvoyer H
FIN`)}`,
 use:`<p>TD 4, ex. 15 (fait en TD) : moyennes arithmétique et géométrique d'un tableau 2D, et ex. 16.1 : le plus fort dénivelé entre deux voisins. Leurs corrigés sont dans les exercices de TD. Écris toujours i pour les lignes, j pour les colonnes.</p>`,
 trap:`Au bord, une case a moins de 8 voisines : teste a ≥ 0 et a &lt; taille(G) avant de lire G[a][b] (le « et » s'arrête au premier faux, donc pas d'erreur). Et calcule la génération suivante dans un nouveau tableau H : si tu modifies G pendant que tu le lis, les cases suivantes comptent des voisines déjà changées.`,
 q:"Comment obtenir le nombre de colonnes d'un tableau 2D T ?",a:"taille(T[i]) : la taille de la ligne i (ou taille(T[0]), c'est pareil puisque toutes les lignes ont la même taille). taille(T) donne le nombre de lignes.",rel:["a-tableaux","td"]});

add(3,{id:"a-dicos",type:"def",maybe:"Vu en cours (p. 34 à 37), mais sans exercice de TD : une question de cours est possible.",ref:"Cours p. 34 à 37",t:"Dictionnaires : des valeurs repérées par une clé",short:"Dictionnaires",
 plain:`Un dictionnaire regroupe plusieurs valeurs, chacune repérée par ${hl("une clé")} (une chaîne), et non par une position comme dans un tableau. Les valeurs peuvent être de types différents. Une association clé + valeur s'appelle un ${hl("champ")}.`,
 fig:()=>h=>{h.innerHTML=`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Clé</th><th>Valeur</th><th>Type</th></tr></thead><tbody><tr><td>'taille'</td><td>168</td><td>nombre</td></tr><tr><td>'age'</td><td>19</td><td>entier</td></tr><tr><td>'majeur'</td><td>true</td><td>booléen</td></tr></tbody></table></div><p class="muted">D[′taille′] donne 168. Dans un tableau, on écrirait T[0] : ici on écrit le nom du champ.</p>`;},
 formal:`<ul><li>Déclaration : <code>D : dictionnaire('taille' : nombre, 'age' : entier, 'majeur' : booléen)</code>.</li><li>Accès : <code>D['taille']</code> ; modification : <code>D['taille'] ← 168</code>.</li><li>Parcours des clés : <code>pour k dans D faire … fin pour;</code> ; test : <code>si k dans D alors …</code>.</li></ul>${C(`FONCTION : compareDicos (E D1, D2 : dictionnaires) : booléen
SPÉCIFICATIONS : renvoie true si les deux dictionnaires sont identiques, false sinon.
DÉBUT
    pour k dans D1 faire
        si non(k dans D2) ou non(D1[k] = D2[k]) alors
            Renvoyer false
        fin si;
    fin pour;
    pour k dans D2 faire
        si non(k dans D1) alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN`)}`,
 use:`<p>Question de cours possible : « tableau ou dictionnaire ? ». Tableau : des valeurs du même type, repérées par leur position. Dictionnaire : des données de types différents, repérées par un nom.</p>`,
 trap:`Grâce à l'évaluation paresseuse, « non(k dans D2) ou non(D1[k] = D2[k]) » ne lit jamais D2[k] quand la clé k n'existe pas.`,
 q:"Pour vérifier que deux dictionnaires D1 et D2 sont égaux (mêmes clés, mêmes valeurs), pourquoi faut-il deux boucles ?",a:"La première vérifie que chaque clé de D1 est dans D2 avec la même valeur. La seconde vérifie que D2 n'a pas de clé en plus.",rel:["a-tableaux"]});

/* ---------- chapitre 4 : listes (cours p. 38 à 42, TD 5) ---------- */
add(4,{id:"a-listes",type:"def",ref:"Cours p. 38 à 42, TD 5 ex. 17",t:"Les listes : tête, queue, cons, estVide",short:"Les listes",
 plain:`Une liste se manipule ${hl("seulement par le début")} : tête(L) donne le premier élément, queue(L) la liste sans lui, cons(x, L) ajoute x devant. Pas d'indice L[2] sur une liste. Essaie sur [2, 3, 2, 4] (TD 5, ex. 17), puis l'exercice du cours.`,
 fig:()=>[h=>W.listlab(h,{start:[2,3,2,4]}),h=>stepLab(h,[3])],
 formal:`<ul><li><b>tête(L)</b> : premier élément (un élément, pas une liste). Erreur si L est vide.</li><li><b>queue(L)</b> : la liste L privée de son premier élément. Erreur si L est vide.</li><li><b>cons(x, L)</b> : nouvelle liste avec x en tête.</li><li><b>estVide(L)</b> : true si L = [ ].</li></ul><p>Au CC : « vous avez droit uniquement aux fonctions du cours : tête, queue, cons, estVide ».</p>`,
 use:`<p>Pour atteindre le 3e élément : tête(queue(queue(L))). Pour savoir si L a un seul élément : estVide(queue(L)). Au PEIP 2023 (2 pts) : « les 3 premiers éléments de L sont-ils croissants ? » s'écrit tête(L) ≤ tête(queue(L)) et tête(queue(L)) ≤ tête(queue(queue(L))).</p>`,
 trap:`estVide(tête(L)) est une erreur de type : tête(L) est un nombre, pas une liste. Et tête([ ]) n'existe pas.`,
 q:"tête(L) est le premier élément de L, queue(L) est L sans son premier élément, et cons(x, L) ajoute x devant L. Avec li = [2, 3, 2, 4], que vaut cons(tête(queue(li)), queue(li)) ?",a:"tête(queue(li)) = 3 et queue(li) = [3, 2, 4], donc [3, 3, 2, 4].",rel:["a-listes-rec"]});

const LV=[
 {label:"longueurR([4, 7, 1]) (cours p. 40)",code:`FONCTION : longueurR (E L : liste d'entier) : entier
SPÉCIFICATIONS : renvoie la longueur de la liste L.
DÉBUT
    Renvoyer cond(estVide(L), 0, 1 + longueurR(queue(L)))
FIN`,run:(p,api)=>{const f=L=>api.call(`longueurR([${L.join(", ")}])`,()=>L.length===0?0:1+f(L.slice(1)));f([4,7,1]);}},
 {label:"plusgrand([3, 8, 2, 5]) (CC1 2024 B)",code:`FONCTION : plusgrand (E L : liste d'entiers) : entier
SPÉCIFICATIONS : L non vide.
DÉBUT
    Renvoyer cond(estVide(queue(L)), tête(L),
                  max(tête(L), plusgrand(queue(L))))
FIN`,run:(p,api)=>{const f=L=>api.call(`plusgrand([${L.join(", ")}])`,()=>L.length===1?L[0]:Math.max(L[0],f(L.slice(1))));f([3,8,2,5]);}},
 {label:"avantdernier([4, 7, 1, 9]) (CC1 2024 A)",code:`FONCTION : avantdernier (E L : liste d'entiers) : entier
SPÉCIFICATIONS : L a au moins 2 éléments.
DÉBUT
    Renvoyer cond(estVide(queue(queue(L))), tête(L),
                  avantdernier(queue(L)))
FIN`,run:(p,api)=>{const f=L=>api.call(`avantdernier([${L.join(", ")}])`,()=>L.length===2?L[0]:f(L.slice(1)));f([4,7,1,9]);}},
 {label:"insereFin([3, 5, 9], 12) (CC 2022)",code:`FONCTION : insereFin (E L : liste, E x : nombre) : liste
DÉBUT
    Renvoyer cond(estVide(L), cons(x, [ ]),
                  cons(tête(L), insereFin(queue(L), x)))
FIN`,run:(p,api)=>{const f=L=>api.call(`insereFin([${L.join(", ")}], 12)`,()=>L.length===0?"[12]":"["+[L[0]].concat(JSON.parse(f(L.slice(1)).replace(/ /g,""))).join(", ")+"]");f([3,5,9]);}},
 {label:"listeEntiers(3) (TD 5, ex. 18)",code:`FONCTION : listeEntiers (E n : entier) : liste d'entiers
DÉBUT
    Renvoyer cond(n = 0, cons(0, [ ]), cons(n, listeEntiers(n - 1)))
FIN`,run:(p,api)=>{const f=n=>api.call(`listeEntiers(${n})`,()=>n===0?"[0]":"["+[n].concat(JSON.parse(f(n-1))).join(", ")+"]");f(3);}}];
add(4,{id:"a-listes-rec",type:"meth",ref:"Cours p. 40-41, TD 5, CC 2022 et 2024",t:"Écrire une fonction sur une liste : récursive ou itérative",short:"Fonctions sur les listes",cc:"2,5 à 4 pts à chaque CC",
 plain:`En récursif, le schéma est toujours le même : ${hl("cas de base")} sur la liste vide (ou à un élément), sinon on traite la tête et on ${hl("rappelle la fonction sur la queue")}. En itératif, on avance dans une copie M de la liste avec ${hl("M ← queue(M)")} jusqu'à ce qu'elle soit vide.`,
 fig:()=>h=>W.calltree(h,{variants:LV}),
 formal:`${C(`FONCTION : longueurI (E L : liste d'entier) : entier
SPÉCIFICATIONS : renvoie la longueur de la liste L.
Variable : cpt : entier, M : liste d'entiers
DÉBUT
    cpt, M ← 0, L
    tant que non estVide(M) faire
        cpt ← cpt + 1
        M ← queue(M)
    fin tq;
    Renvoyer cpt
FIN

FONCTION : cptEgauxLRec (E e : entier, E L : liste d'entiers) : entier
SPÉCIFICATIONS : compte le nombre d'éléments de L égaux à e (récursif).
DÉBUT
    si estVide(L) alors
        Renvoyer 0
    sinon si tête(L) = e alors
        Renvoyer 1 + cptEgauxLRec(e, queue(L))
    sinon
        Renvoyer cptEgauxLRec(e, queue(L))
    fin si;
FIN`)}<ul><li>Liste vide : estVide(L). Un élément : estVide(queue(L)). Deux éléments : estVide(queue(queue(L))).</li><li>Construire une liste : cons(élément, appel récursif).</li></ul>`,
 use:`<p>2,5 points au CC1 2024 (avantdernier ou plusgrand), 4 points en 2022 (insereFin). Donne la signature, les spécifications (« L non vide »), puis le corps.</p>`,
 trap:`Choisis le bon cas de base : plusgrand d'une liste vide n'a pas de sens, donc on s'arrête à un élément. Et cons ajoute en tête : pour ajouter à la fin, il faut une fonction comme insereFin.`,
 q:"Écris le corps d'une fonction récursive longueurR(L) qui renvoie le nombre d'éléments d'une liste L, avec cond, estVide et queue.",a:"Renvoyer cond(estVide(L), 0, 1 + longueurR(queue(L)))",rel:["a-listes","a-recursif"]});

/* ---------- chapitre 5 : piles et files (cours p. 43 à 51) ---------- */
add(5,{id:"a-piles-files",type:"def",maybe:"« Jusqu'au casse-tête avec les piles », disent tes camarades : ce sont les exercices des pages 44 et 46 du cours, ci-dessous. Les files viennent juste après : moins sûr.",ref:"Cours p. 43 à 51",t:"Piles et files",
 plain:`Une ${hl("pile")} est comme une pile d'assiettes : on prend la dernière posée, et on ne voit que le sommet. Une ${hl("file")} est comme une file d'attente : le premier arrivé sort le premier. Fais le casse-tête du cours pas à pas, puis manipule une pile et une file.`,
 fig:()=>[h=>stepLab(h,[0,1,2]),pilefile],
 formal:`<ul><li>Pile : <code>empiler(E élément, ES pile)</code>, <code>depiler(ES pile) : élément</code> (enlève le sommet et le renvoie), <code>estVide(E pile) : booléen</code>. La lecture du sommet est destructive.</li><li>File : <code>enfiler(E élément, ES file)</code>, <code>defiler(ES file) : élément</code>, <code>estVide(E file) : booléen</code>.</li><li>Pas de tête, de queue, de cons ni d'indice P[2] sur une pile (cours p. 47).</li></ul>${C(`PROCÉDURE : invPileIte (ES P : pile d'entier)
SPÉCIFICATIONS : inverse l'ordre des valeurs de la pile P.
Variable : Q, R : pile d'entier
DÉBUT
    Q, R ← [ ], [ ]
    tant que non estVide(P) faire
        empiler(depiler(P), Q)
    fin tq;
    tant que non estVide(Q) faire
        empiler(depiler(Q), R)
    fin tq;
    tant que non estVide(R) faire
        empiler(depiler(R), P)
    fin tq;
FIN

PROCÉDURE : inverseFile (ES F : file d'entier)
SPÉCIFICATIONS : inverse l'ordre des valeurs de la file F.
Variable : P : pile d'entier
DÉBUT
    P ← [ ]
    tant que non estVide(F) faire
        empiler(defiler(F), P)
    fin tq;
    tant que non estVide(P) faire
        enfiler(depiler(P), F)
    fin tq;
FIN`)}`,
 use:`<p>Question probable : « calculer la valeur de la pile après chaque étape », avec des instructions interdites cachées dedans (P[1], cons, empiler(P, 4)). Écris « erreur » et pourquoi.</p>`,
 trap:`depiler et defiler modifient la structure (paramètre ES) et renvoient l'élément retiré. Vider une pile dans une autre inverse l'ordre : pour inverser P « sur place », il faut trois transvasements (P vers Q, Q vers R, R vers P).`,
 q:"On empile 1, 2, 3 puis on dépile deux fois. Que reste-t-il ? Même chose avec une file.",a:"Pile : 1 (on a retiré 3 puis 2). File : 3 (on a retiré 1 puis 2).",rel:["a-listes"]});

/* ---------- pas au CC1 cette année : preuves, complexité, recherche, tris (rangés au chapitre 7 plus bas) ---------- */
add(3,{id:"a-preuve",type:"meth",ref:"Cours diapos 52 à 65, TD 6",t:"Prouver la validité d'un algorithme : équations, invariant, récurrence",short:"Invariant et preuve",cc:"Tombé en 2022, 2023 et 2024",
 plain:`Un algorithme est ${hl("valide")} s'il résout le problème qu'il est censé résoudre. Pour une boucle : (1) on lit les ${hl("équations d'itération")} sur l'algorithme (la vérité), (2) on cherche un ${hl("invariant de boucle")} (l'hypothèse), (3) on le prouve par récurrence, (4) on l'écrit à la fin des itérations.`,
 fig:()=>h=>W.tracer(h,{lang:"pseudo",code:["Fonction : G (E N : entier) : entier","Spécifications : N entier naturel. Calcule (N+1)².","Variables : i, j, k : entier","Début","  i, j, k ← 0, 0, 1","  Tant que i < N faire","    i ← i + 1","    j ← i + i","    k ← j + k + 1","  finTantQue","  Renvoyer k","Fin"],cols:["i","j","k","(i+1)²","k = (i+1)² ?"],params:[{k:"N",label:"N =",min:0,max:12,val:5}],
  gen:p=>{let i=0,j=0,k=1;const row=()=>({i,j,k,["(i+1)²"]:(i+1)**2,["k = (i+1)² ?"]:k===(i+1)**2?"oui":"non"});const S=[{l:4,v:row(),note:"Avant la boucle : l'invariant est vrai (k = 1 = (0+1)²)."}];while(i<p.N){i++;S.push({l:6,v:row(),row:false});j=i+i;S.push({l:7,v:row(),row:false});k=j+k+1;S.push({l:8,v:row(),note:`Tour ${i} : k = ${k} = (${i}+1)². L'invariant reste vrai.`});}S.push({l:10,v:row(),row:false,out:`renvoie ${k}`,note:`Sortie : i = N, donc k = (N+1)² = ${k}.`});return S;}}),
 formal:`<p><b>Vocabulaire du cours</b> (diapo 54).</p><ul><li><b>équation d'itération</b> : égalité reliant les valeurs des variables d'une itération à la suivante ; ce sera notre vérité ;</li><li><b>invariant de boucle</b> : propriété censée être vraie au début des itérations et à la fin de chaque itération ; ce sera notre hypothèse à prouver.</li></ul><p>Notation : var<sub>i</sub> : valeur de var à la fin de l'itération n°i (i = 0 pour le début des itérations).</p><p><b>Méthode</b> (diapo 56) : 1. « lire » les équations d'itération sur l'algorithme (vérité) ; 2. chercher un invariant de boucle (hypothèse) ; 3. prouver l'hypothèse par récurrence en utilisant la vérité : l'hypothèse devient une vérité ; 4. écrire cette vérité à la fin des itérations pour prouver l'algorithme.</p><p><b>Sur l'algorithme G de la figure</b> (CC 2022) :</p><ul><li>Équations d'itération : j<sub>0</sub> = 0, k<sub>0</sub> = 1 ; pour i > 0, j<sub>i</sub> = 2i et k<sub>i</sub> = k<sub>i−1</sub> + 2i + 1.</li><li>Invariant : Inv<sub>i</sub> : « k<sub>i</sub> = (i + 1)² ».</li><li>Initialisation : k<sub>0</sub> = 1 = (0 + 1)² : Inv<sub>0</sub> est vrai.</li><li>Récurrence : si Inv<sub>i−1</sub> est vrai, c'est-à-dire k<sub>i−1</sub> = i², alors k<sub>i</sub> = i² + 2i + 1 = (i + 1)² : Inv<sub>i</sub> est vrai.</li><li>Conclusion : l'invariant est vrai pour toutes les itérations.</li><li>À la fin du tant que, i = N, donc l'algorithme renvoie k<sub>N</sub> = (N + 1)² : il est valide.</li></ul><p><b>Algorithme récursif</b> (diapos 61 à 63). <b>Équation de récurrence</b> : égalité reliant le résultat de l'algorithme avec celui des appels récursifs (vérité). <b>Invariant de récursion</b> : propriété censée être vraie à chaque appel récursif ; le plus souvent, ça revient à écrire que l'algorithme renvoie le bon résultat (hypothèse). On prouve l'hypothèse par récurrence.</p><p><b>Arrêt d'un tant que</b> (modèle de la diapo 95) : une quantité entière décroît strictement à chaque itération, et le tant que s'arrête quand elle atteint une certaine valeur ; il y a donc un nombre fini d'itérations, donc l'algorithme se termine.</p>`,
 use:`<p>CC1 2024 : « À quoi servent les équations de récurrence ? » (le nom des équations d'itération cette année-là). Réponse officielle : elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables, et permettent de montrer qu'un invariant est héréditaire.</p><p>CC 2022, exercice 3 (5 points) : trace, arrêt, invariant à choisir, conclusion. Examen de janvier 2023 : prouver qu'une boucle se termine (2 points), prouver par récurrence qu'un algorithme récursif se termine et renvoie le bon résultat (2 points).</p>`,
 trap:`L'équation d'itération se lit sur l'algorithme : c'est la vérité. L'invariant reste une hypothèse tant qu'il n'est pas prouvé. Attention aussi à l'ordre des instructions : dans G, « k ← j+k+1 » utilise le nouveau j.`,
 q:"Dans une preuve de validité d'un algorithme itératif, à quoi servent les équations d'itération (« équations de récurrence » dans le sujet de 2024) ?",a:"Elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables. Elles permettent de montrer qu'un invariant est héréditaire : s'il est vrai à une itération, il est vrai à la suivante.",rel:["a-boucles","a-arret"]});

add(3,{id:"a-complexite",type:"def",ref:"Cours diapos 75 à 80, TD 7",t:"Ordre de complexité : θ, o, ω, O, Ω",short:"Notations θ, o, ω, O, Ω",cc:"Tombé en 2022 et 2024",
 plain:`On ne garde pas l'expression exacte du nombre d'opérations T<sub>n</sub> : on la rattache à une ${hl("suite de référence")} qui grandit aussi vite, son ${hl("ordre de complexité")}. ${hl("θ")} : aussi vite. ${hl("o")} : moins vite. ${hl("ω")} : plus vite. ${hl("O")} : aussi vite ou moins vite. ${hl("Ω")} : aussi vite ou plus vite.`,
 fig:()=>growth,
 formal:`<p><b>Suites de référence, dans l'ordre</b> (diapo 76) : 1 (à coût constant), log(n) (logarithmique), n (linéaire), n.log(n) (pseudo-linéaire), n² (quadratique), n³ (cubique), n<sup>a</sup> avec a > 0 (polynômiale), b<sup>n</sup> avec b > 1 (exponentielle), n! (factorielle).</p><p><b>Trouver l'ordre de complexité</b> (diapo 77). On divise T<sub>n</sub> par une suite de référence R<sub>n</sub> et on fait tendre n vers +∞.</p><ul><li>si T<sub>n</sub>/R<sub>n</sub> est borné entre deux nombres strictement positifs, en particulier si T<sub>n</sub>/R<sub>n</sub> → a > 0, alors T<sub>n</sub> est équivalente à R<sub>n</sub> ou de l'ordre de complexité R<sub>n</sub>. On note T<sub>n</sub> = θ(R<sub>n</sub>).</li><li>si T<sub>n</sub>/R<sub>n</sub> → 0 alors T<sub>n</sub> est strictement dominée par R<sub>n</sub>. On note T<sub>n</sub> = o(R<sub>n</sub>).</li><li>si T<sub>n</sub>/R<sub>n</sub> → +∞ alors T<sub>n</sub> domine strictement R<sub>n</sub>. On note T<sub>n</sub> = ω(R<sub>n</sub>).</li><li>sinon, T<sub>n</sub> n'est pas comparable à R<sub>n</sub>. C'est rare.</li></ul><p><b>Domination au sens large</b> (diapo 78) : domination stricte ou équivalence. On utilise la majuscule de la domination stricte : T<sub>n</sub> = O(R<sub>n</sub>) (o ou θ), T<sub>n</sub> = Ω(R<sub>n</sub>) (ω ou θ).</p><p><b>Propriétés</b> (diapo 80).</p><ul><li>Tous les logarithmes sont du même ordre de grandeur : log<sub>10</sub>(n) = θ(log<sub>2</sub>(n)) = θ(ln(n)) etc.</li><li>o, O, ω, Ω, θ sont transitives : si a = o(b) et b = o(c) alors a = o(c), et de même pour O, ω, Ω, θ.</li><li>o, O, ω, Ω, θ sont multiplicatives et additives sur les suites > 0 : si a = o(a′) et b = o(b′) alors ab = o(a′b′) et a + b = o(a′ + b′), et de même pour O, ω, Ω, θ.</li></ul>`,
 use:`<p>CC 2022 (QCM) : « si a<sub>n</sub> = θ(b<sub>n</sub>) alors a<sub>n</sub> = O(b<sub>n</sub>) » est la seule affirmation vraie. CC1 2024 : un algorithme en Θ(n³) peut être un million de fois plus lent qu'un autre en Θ(n³). TD 7 et examen de janvier 2023 : avec un temps proportionnel à l'ordre de complexité, on calcule le coefficient à partir d'une mesure, puis un temps ou une taille d'entrée.</p>`,
 trap:`« Équivalentes » ne veut pas dire « identiques » : si T<sub>n</sub> = 1000000R<sub>n</sub> ou T<sub>n</sub> = R<sub>n</sub> + 1000000 alors T<sub>n</sub> et R<sub>n</sub> sont équivalentes (cours, diapo 77). Mets 1000000 devant n³ dans la figure. Le cours écrit θ, certains sujets Θ : c'est la même notation.`,
 q:"Un algorithme de complexité Θ(n²) peut-il être un million de fois plus lent qu'un autre algorithme de complexité Θ(n²) ? (CC1 2024)",a:"Oui, si par exemple le premier fait 1000000n² opérations et le deuxième n² opérations.",rel:["a-calcul-complexite","a-recherche"]});

add(3,{id:"a-calcul-complexite",type:"meth",ref:"Cours diapos 67 à 74 et 81 à 86, TD 8",t:"Calculer une complexité : compter, sommer, master theorem",short:"Calculer une complexité",cc:"Tombé en 2022 et 2023",
 plain:`On compte les opérations en fonction de la taille n de l'entrée. Une boucle pour : on calcule une ${hl("somme")}. Un algorithme récursif : on écrit une ${hl("équation de complexité")} sur T<sub>n</sub> et on la résout, ou on applique le ${hl("master theorem")} quand la taille est divisée à chaque appel.`,
 fig:()=>counter,
 formal:`<p><b>Compter</b> (diapos 67 et 68). 1 opération élémentaire = 1 unité de temps, 1 variable élémentaire = 1 unité de mémoire. T<sub>n</sub> : nombre d'opérations élémentaires, la complexité en temps. V<sub>n</sub> : espace mémoire occupé, la complexité en espace. S'ils dépendent de la configuration des données, on regarde le pire cas.</p><p><b>Boucles pour</b> (diapo 81). Compter le nombre d'opérations dans un pour revient à calculer une somme ayant les mêmes indices. Formules utiles : 1 + 2 + … + n = n(n + 1)/2 ; 1² + 2² + … + n² = n(n + 1)(2n + 1)/6 ; 1³ + 2³ + … + n³ = n²(n + 1)²/4.</p><p><b>Raccourci</b> (diapo 82). En lisant les bornes du pour, on obtient une estimation O : si i prend n valeurs, j moins de n valeurs, et chaque itération O(1) opérations, alors T<sub>n</sub> = n × O(n) × O(1) = O(n²).</p><p><b>Algorithme récursif</b> (diapo 71). T<sub>n</sub> = opérations de l'algorithme + opérations faites dans ses appels : une équation récurrente appelée <b>équation de complexité</b>. Exemple (diapo 72), la factorielle récursive F2 : T<sub>0</sub> = 1 et T<sub>n</sub> = 4 + T<sub>n−1</sub>, suite arithmétique : T<sub>n</sub> = 4n + 1.</p><p><b>Master Theorem</b> (diapo 84) : s'il existe quatre entiers a ≥ 0, b > 1, d ≥ 0 et n<sub>0</sub> > 0 tels que, pour tout n ≥ n<sub>0</sub>, T(n) ≤ aT(⌈n/b⌉) + O(n<sup>d</sup>), alors T(n) = O(n<sup>d</sup>) si b<sup>d</sup> > a ; T(n) = O(n<sup>d</sup> log n) si b<sup>d</sup> = a ; T(n) = O(n<sup>log a / log b</sup>) si b<sup>d</sup> &lt; a. a représente le nombre d'appels récursifs dans le corps de l'algorithme, b l'entier par lequel la taille de l'entrée est divisée à chaque appel, O(n<sup>d</sup>) les opérations de l'algorithme en plus des appels récursifs.</p>`,
 use:`<p>CC 2022 : « À quoi sert le master theorem ? » Réponse officielle : il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel. Examen de janvier 2023 : T<sub>n</sub> = 2T<sub>n−1</sub> + 4 à résoudre avec une suite géométrique (2 points), puis T<sub>n</sub> = θ(n) + 2T<sub>⌊n/2⌋</sub> par le master theorem (1,5 point).</p>`,
 trap:`F(n-1) + F(n-1) fait deux appels : T<sub>n</sub> = 2T<sub>n−1</sub> + …, donc θ(2<sup>n</sup>). Et le master theorem ne s'applique que si la taille est <b>divisée</b> (n div 2, n div 3), pas si elle diminue de 1.`,
 q:"Combien d'additions fait « Pour i de 1 à n faire Pour j de 1 à i faire som ← som+1 » ? (TD 8, exercice 34)",a:"1 + 2 + … + n = n(n + 1)/2, donc θ(n²).",rel:["a-complexite"]});

/* ---------- chapitre 4 : recherche et tris (cours, diapos 87 à 114 : algorithmes recopiés du cours) ---------- */
const RECHDIC=`FONCTION : RechDic (E e : nombre, E T : tableau de nombres) : entier
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
FIN`;
add(4,{id:"a-recherche",type:"algo",ref:"Cours diapos 88 à 98, TD 9",t:"Recherche linéaire et recherche dichotomique",short:"Recherche dichotomique",cc:"Tombé en 2024",
 plain:`Tableau non trié : ${hl("recherche linéaire")}, case par case, en θ(n). Tableau ${hl("trié")} : on compare e à la valeur au milieu du tableau, puis on continue dans la bonne moitié. C'est la ${hl("recherche dichotomique")}, en θ(log(n)).`,
 fig:()=>h=>W.dicho(h),
 formal:`<p><b>Recherche linéaire</b> (diapos 88 à 90). Pour chercher un élément e dans un tableau T non trié, on le parcourt case par case jusqu'à trouver e ou atteindre la fin du tableau.</p>${C(`FONCTION : RechLin(E e : nombre, E T : tableau de nombres) : entier
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
FIN`)}<p>Complexité : pire des cas pour e ∉ T en notant n = taille(T) : n itérations à coût constant + opérations à coût constant = θ(n).</p><p><b>Recherche dichotomique</b> (diapos 91 et 92). Pour chercher un élément e dans un tableau T trié, on compare e à la valeur au milieu du tableau puis on continue à le chercher dans la bonne moitié du tableau.</p>${C(RECHDIC)}<p><b>Preuve d'arrêt</b> (diapo 95) : fin-deb+1 est un entier naturel ; il décroît strictement à chaque itération ; le tant que s'arrête lorsqu'il vaut 0 ou moins. Il y a donc un nombre fini d'itérations. Chaque itération se termine. Donc l'algorithme se termine.</p><p><b>Complexité</b> (diapo 97). Pire cas : tout le tableau est &lt; e. Simplification pour le calcul : n = 2<sup>k</sup>. Nombre d'itérations = nombre de divisions de n par 2 jusqu'à tomber sur 0, donc k + 1. Chaque itération est en θ(1). T<sub>n</sub> = θ(1) + (k + 1).θ(1) = θ(k) donc T<sub>n</sub> = θ(log(n)). L'algorithme est logarithmique.</p>`,
 use:`<p>CC1 2024 : 128 chevaux rangés par taille, combien de mesures ? « A chaque mesure, le nombre de chevaux parmi lesquels chercher est divisé par deux […] le nombre de fois qu'il faut diviser 128 par 2 pour trouver 1, c'est à dire 7 fois. » Autre sujet : 12000 légos demandent 14 essais au maximum ; 24000 en demandent 15, car après le premier essai il en reste 12000.</p>`,
 trap:`RechDic ne s'arrête pas quand elle tombe sur e : elle continue jusqu'à deb > fin, ce qui lui fait renvoyer le <b>plus petit</b> indice. Et la dichotomie exige un tableau trié.`,
 q:"Les 12000 légos de Mr Bricks sont rangés par taille. Il doit faire 14 essais au maximum pour en trouver un. Combien lui en faudrait-il avec 24000 légos ? (CC1 2024)",a:"15 : après son premier essai, le nombre de légos où chercher est divisé par 2, c'est-à-dire égal à 12000, donc il lui reste 14 essais au maximum.",rel:["a-complexite","a-tri-fusion"]});

const sortConcept=(id,algo,t,plain,formal,use,trap,q,a,extra)=>add(4,Object.assign({id,type:"algo",ref:"Cours diapos 99 à 114, TD 10",t,plain,fig:()=>h=>W.sortviz(h,{algo}),formal,use,trap,q,a,rel:["a-tri-valeurs","a-tri-bulles","a-tri-fusion","a-tri-selection","a-tri-insertion"].filter(x=>x!==id)},extra||{}));
sortConcept("a-tri-valeurs","comptage","Le tri par valeurs",`Quand les valeurs du tableau sont concentrées dans un petit intervalle, on ${hl("compte")} combien il y a de 0, de 1, de 2…, puis on les remet dans l'ordre. Aucune comparaison entre deux éléments : ${hl("θ(n)")}.`,
 `<p><b>Motivation du tri</b> (diapo 100). Trier permet de traiter plus efficacement ensuite. On étudie 2 sortes de tris de tableaux 1D de taille n : dans le cas particulier où les valeurs du tableau sont concentrées dans un intervalle ⟦0 ; p−1⟧ avec p = O(n), tri par valeurs en θ(n) ; dans le cas général, tri par comparaison en Ω(n log n).</p><p><b>Idée générale</b> (diapo 101). On compte combien il y a de 0, de 1, de 2 etc. jusqu'à p−1. On mémorise ce comptage dans un deuxième tableau. Puis on remet autant de 0 que ce qu'on a compté au début du tableau, puis on met les 1, les 2 etc. jusqu'aux p−1.</p><p>Exemple : dans le tableau [1,0,0,1,1,1,3,0,2,2,0,1,2,3,2,0,0], on compte six 0, cinq 1, quatre 2, deux 3, donc le tableau trié est [0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,3,3].</p>${C(`PROCÉDURE : TriValeurs (ES T : tableau d'entier de taille n, E p : entier)
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
FIN`)}<p>Complexité : θ(p + n) ou θ(n) si p = O(n).</p><p><b>Borne inférieure d'un tri de tableau</b> (diapo 104). Pour trier un tableau, il faut parcourir toutes ses cases. Donc sa complexité est au moins n, c'est-à-dire Ω(n). Le tri par valeur est en θ(n). L'ordre de complexité n est donc une borne inférieure pour un tri de tableau.</p>`,
 `<p>CC1 2024 : Luc a de nombreux vaisseaux de 5 modèles différents et un hangar immense. « Il peut utiliser un tri par valeurs : il range chaque modèle dans une zone différente de son hangar, puis il les remet en ligne […] un tri en θ(n). » Examen de janvier 2023 : trier un tableau de chiffres en θ(1) est impossible (Ω(n)), en θ(n) c'est possible avec le tri par valeurs.</p>`,
 `Il faut connaître l'intervalle des valeurs possibles, et qu'il soit petit (p = O(n)). Si les valeurs sont toutes différentes ou quelconques, on revient à un tri par comparaison.`,"Luc a de nombreux vaisseaux, de 5 modèles différents, et un hangar immense. Quel tri du cours adapter pour fournir le moins d'efforts possible ? (CC1 2024)","Le tri par valeurs : une zone du hangar par modèle, puis il les remet en ligne du plus petit modèle au plus grand. C'est un tri en θ(n).",{cc:"Tombé en 2023 et 2024"});
sortConcept("a-tri-bulles","bulles","Le tri à bulles",`On compare ${hl("deux voisins")} et on les échange s'ils sont dans le désordre, en partant de la fin du tableau. À chaque passage, le plus petit élément restant « remonte » à sa place, au début.`,
 `<p>Un premier tri par comparaison (diapo 105) :</p>${C(`PROCÉDURE : TriBulles (ES T : tableau de nombres de taille n)
SPÉCIFICATIONS : Trie le tableau T par ordre croissant.
DÉBUT
    pour i de 0 à n-2 faire
        pour j de n-1 à i+1 par pas de -1 faire
            si T[j]<T[j-1] alors
                échanger T[j] et T[j-1]
            fin si;
        fin pour;
    fin pour;
FIN`)}<p>Complexité θ(n²). Le tri à bulles n'a pas besoin d'espace supplémentaire (<b>en place</b>) et respecte l'ordre des éléments initiaux en cas d'égalité (<b>stable</b>).</p>`,
 `<p>CC1 2024 : Luc ne peut que permuter deux vaisseaux voisins. « Oui, Luc peut utiliser le tri à bulles, qui repose entièrement sur la permutation d'éléments voisins. » Autre sujet (permuter deux vaisseaux quelconques, citer deux tris) : le tri à bulles ou le tri par sélection.</p>`,
 `À la fin de l'itération i, les cases 0 à i contiennent les i + 1 plus petites valeurs, à leur place définitive : c'est pour ça que j s'arrête à i+1.`,"Quel tri du cours repose entièrement sur la permutation d'éléments voisins ? (CC1 2024)","Le tri à bulles.",{cc:"Tombé en 2024"});
sortConcept("a-tri-fusion","fusion","Le tri fusion",`« ${hl("Diviser pour mieux régner")} » : on trie chaque moitié du tableau, puis on ${hl("fusionne")} les deux moitiés triées. C'est le tri par comparaison efficace du cours : ${hl("θ(n log(n))")}.`,
 `<p><b>Principe</b> (diapo 107). Algorithme de type « Diviser pour mieux régner » : on trie chaque moitié du tableau ; on fusionne les deux moitiés triées. Il faut 2 algorithmes : l'algorithme de tri et l'algorithme de fusion.</p>${C(`PROCÉDURE : fusion (ES T : tableau de nombre, E deb1, fin1, fin2 : entier)
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
FIN`)}${C(`PROCÉDURE : triFusionAux (ES T : tableau de nombre; E deb, fin : entier)
SPÉCIFICATIONS : Trie T entre les indices deb et fin.
Variable : mil : entier
DÉBUT
    si deb<fin alors
        mil ← (deb+fin) div 2
        triFusionAux(T,deb,mil)
        triFusionAux(T,mil+1,fin)
        fusion(T,deb,mil,fin)
    fin si;
FIN`)}<p>Pour trier tout le tableau (diapo 112) : la procédure TriFusion(ES T : tableau de nombres) appelle TriFusionAux(T, 0, taille(T)-1) (les deux valeurs sont à trouver sur la diapo).</p><p><b>Complexité et propriété.</b> Le tri fusion a une complexité θ(n log(n)) (admis) et il est stable (éléments égaux dans le même ordre qu'au départ). Cependant il a besoin d'espace supplémentaire pour la fusion : il n'est pas en place.</p><p><b>Borne inférieure d'un tri par comparaison</b> (diapo 113). Dans le cas général, on doit comparer les valeurs entre elles pour les ordonner. Nombre de comparaisons nécessaires : au moins n log n/4 donc complexité Ω(n log n). Il est possible de faire θ(n log n), par exemple avec le tri fusion. L'ordre de complexité n log n est donc une borne inférieure d'un tri de tableau par comparaison.</p>`,
 `<p>CC1 2024 : les vaisseaux de Luc sont de modèles tous différents, et son hangar est immense. « Luc ne peut pas utiliser un tri par valeurs et doit faire un tri par comparaison. Le tri par comparaison le plus efficace du cours est le tri fusion, qui peut être adapté au cas de Luc qui n'a pas de problème de stockage. »</p>`,
 `Le tri fusion a besoin d'un tableau auxiliaire : il n'est pas en place. Dans le TD 7 (exercice 32), c'est ce qui le rend inutilisable quand la mémoire manque.`,"Quel est le tri par comparaison le plus efficace du cours, et quel est son défaut ?","Le tri fusion, en θ(n log(n)). Il a besoin d'espace supplémentaire pour la fusion : il n'est pas en place.",{cc:"Tombé en 2024"});
sortConcept("a-tri-selection","selection","Le tri par sélection",`On ${hl("cherche le plus petit")} élément restant et on l'échange avec la première case pas encore triée. Puis on recommence avec le reste.`,
 `<p>Cours, diapo 114 (« Quelques tris célèbres ») : pour k allant de 0 à taille(T)-2, on cherche le plus petit élément parmi T[k] à T[taille(T)-1] et on l'échange avec T[k]. Adapté pour de petits ensembles de données. Complexité : θ(n²).</p>${C(`PROCÉDURE : TriSelection (ES tab : tableau de nombres de taille n)
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
FIN`)}<p>(Algorithme du TD 10, exercice 42, écrit par moi dans la forme du cours.) Nombre de comparaisons : (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, quel que soit le tableau.</p>`,
 `<p>TD 10, exercice 42 : écrire l'algorithme, donner sa complexité, prouver sa validité. CC1 2024 (un des sujets) : « Citer deux tris du cours » qui ne font que permuter deux éléments : le tri à bulles ou le tri par sélection.</p>`,`Même si le tableau est déjà trié, la sélection fait toutes ses comparaisons : θ(n²) dans tous les cas.`,"Combien de comparaisons fait le tri par sélection sur un tableau de n éléments ?","(n − 1) + (n − 2) + … + 1 = n(n − 1)/2, quel que soit le tableau : θ(n²).");
sortConcept("a-tri-insertion","insertion","Le tri par insertion",`Comme pour ranger des cartes dans sa main : on prend la valeur suivante et on ${hl("l'insère à sa place")} parmi celles de gauche, déjà triées, en décalant les plus grandes.`,
 `<p>Cours, diapo 114 (« Quelques tris célèbres ») : pour k allant de 1 à taille(T)-1, T[k] est inséré parmi T[0] à T[k-1]. Adapté lorsque les données sont presque triées. Complexité : θ(n²).</p>${C(`PROCÉDURE : TriInsertion (ES tab : tableau de nombres de taille n)
SPÉCIFICATIONS : Trie le tableau tab par ordre croissant.
Variable : a : nombre
           j : entier
DÉBUT
    pour k de 1 à n-1 faire
        a ← tab[k]
        j ← k-1
        tant que j ≥ 0 et tab[j] > a faire
            tab[j+1] ← tab[j]
            j ← j-1
        fin tq;
        tab[j+1] ← a
    fin pour;
FIN`)}<p>(Algorithme du TD 10, exercice 43, et de l'examen PEIP de mai 2023.) Pire cas, tableau rangé à l'envers : 1 + 2 + … + (n − 1) = n(n − 1)/2 décalages, θ(n²). Tableau déjà trié : aucun décalage, θ(n).</p><p>La même diapo cite aussi le <b>tri par tas</b> (θ(n log n)) et le <b>tri rapide</b> ou tri par pivot (θ(n²) dans le pire des cas, θ(n log n) en moyenne).</p>`,
 `<p>Examen PEIP de mai 2023 : « Que doit mettre John à la place de ❶ et ❷ ? » dans « j ← ❶ » et « T[❷] ← a » : i-1 et j+1.</p>`,`Le nombre de tours du tant que dépend des données : c'est pour ça que le pire cas et le meilleur cas sont différents. La complexité, c'est celle du pire cas : θ(n²).`,"Pour quelles données le tri par insertion est-il adapté, d'après le cours ?","Lorsque les données sont presque triées : le tant que fait alors très peu de tours. Sa complexité (pire cas) reste θ(n²).",{cc:"Tombé en 2023"});

/* les chapitres pas encore vus en cours cette année */
const OUT_IDS=["a-preuve","a-complexite","a-calcul-complexite","a-recherche","a-tri-valeurs","a-tri-bulles","a-tri-fusion","a-tri-selection","a-tri-insertion"];
concepts.forEach(c=>{if(OUT_IDS.includes(c.id)){c.ch=7;c.out="Pas encore vu en cours cette année : le cours s'arrête aux piles et aux files, et les TD 6 à 10 ne sont pas faits. Ça ne devrait pas tomber au CC1. Garde cette fiche pour le CC2.";}});
concepts.forEach(c=>{if(c.rel)c.rel=c.rel.filter(id=>!OUT_IDS.includes(id)||OUT_IDS.includes(c.id));});

/* ---------- TD ---------- */
const td=[
 {id:"1",s:3,paper:1,t:"Types et valeurs d'expressions (TD 1)",en:`<p>On suppose définis deux algorithmes dont les signatures sont les suivantes :</p>${C(`FONCTION : proche? (E a : nombre, E b : nombre) : booléen
SPÉCIFICATIONS : renvoie true si |a-b| < 2, false sinon.

FONCTION : reste (E x : entier) : entier
SPÉCIFICATIONS : x est un entier naturel. Renvoie le reste de la division de x par 2.`)}<p>Quels sont les types et valeurs des expressions suivantes (mettre « erreur » s'il n'y en a pas) ?</p><ol><li>(2 + (3 * (7 - 5)))</li><li>2 + (3 * true)</li><li>(2 &lt; 3) et false</li><li>proche?(1,2,3)</li><li>proche?(1,2) ou proche?((5*48) div 7,33)</li><li>(reste(3) et reste(5)) &lt; 3</li><li>proche?(reste(5),2)</li><li>cond(proche?(4,2), 2/0, 1)</li><li>cond(proche?(1,4), false, proche?(2,3))</li><li>cond(1 &lt; 3, reste(3), true)</li></ol>`,link:"a-expressions",
  sol:`<ol><li>entier, 8</li><li>erreur : on ne multiplie pas un booléen</li><li>booléen, false</li><li>erreur : proche? a 2 paramètres</li><li>booléen, true : proche?(1, 2) vaut true (|1 − 2| = 1 &lt; 2), donc « ou » s'arrête là sans calculer la suite</li><li>erreur : « et » sur deux entiers</li><li>booléen, true (reste(5) = 1)</li><li>nombre, 1 : proche?(4, 2) vaut false (|4 − 2| = 2 n'est pas &lt; 2), donc cond prend la 3e valeur ; 2/0 n'est jamais calculé (évaluation paresseuse). Les deux valeurs possibles, 2/0 et 1, sont des nombres ; comme la valeur est 1, « entier » se défend aussi</li><li>booléen, true</li><li>erreur : les deux valeurs de cond n'ont pas le même type (entier et booléen)</li></ol>`},
 {id:"2",s:2,paper:1,t:"max3, deux versions",en:"Écrivez un algorithme max3 qui calcule le maximum de 3 nombres. Vous donnerez deux versions d'algorithme, l'une n'utilisant que l'opérateur conditionnel cond, l'autre n'utilisant que la fonction max qui renvoie le maximum de 2 nombres.",link:"a-expressions",
  sol:C(`FONCTION : max3 (E a : nombre, E b : nombre, E c : nombre) : nombre
SPÉCIFICATIONS : renvoie le plus grand des trois nombres.
DÉBUT
    Renvoyer cond(a ≥ b, cond(a ≥ c, a, c), cond(b ≥ c, b, c))
FIN

Deuxième version, avec seulement max :
DÉBUT
    Renvoyer max(a, max(b, c))
FIN`)+`<p>Première version : si a ≥ b, le plus grand est a ou c ; sinon, c'est b ou c. Si l'opérateur « et » est permis, on peut aussi écrire cond(a ≥ b et a ≥ c, a, cond(b ≥ c, b, c)).</p>`},
 {id:"3",s:2,paper:1,t:"ouExcl, avec et sans cond",en:"Écrivez l'algorithme ouExcl qui, étant donnés deux booléens, renvoie true si exactement un des deux vaut true, renvoie false sinon. Vous donnerez deux versions d'algorithme, la première utilisant l'opérateur conditionnel, la seconde ne l'utilisant pas.",link:"a-expressions",
  sol:C(`FONCTION : ouExcl (E a : booléen, E b : booléen) : booléen
SPÉCIFICATIONS : renvoie true si exactement un des deux vaut true, false sinon.
DÉBUT
    Renvoyer cond(a, non b, b)
FIN

Sans cond :   Renvoyer (a et non b) ou (non a et b)`)+`<p>Avec cond : si a vaut true, il faut que b vaille false, donc le résultat est « non b » ; si a vaut false, le résultat est b. Sans cond : « a et non b » dit que seul a vaut true ; « non a et b » dit que seul b vaut true.</p>`},
 {id:"4",s:3,paper:1,t:"Motifs d'étoiles avec des boucles (TD 1)",en:`<p>On dispose de trois procédures affEtoile, affEspace et affRL sans paramètres qui affichent à l'écran une étoile, un espace et un retour à la ligne. Écrivez des algorithmes prenant en paramètre un entier naturel n et affichant les figures suivantes. Chaque figure a une base de n étoiles (n = 5 dans l'exemple). Chaque algorithme peut appeler les algorithmes précédents.</p><p>Figure 1 :</p>${C(`*****`,"txt")}<p>Figure 2 (carré) :</p>${C(`*****
*****
*****
*****
*****`,"txt")}<p>Figure 3 :</p>${C(`*
**
***
****
*****`,"txt")}<p>Figure 4 :</p>${C(`*****
 ****
  ***
   **
    *`,"txt")}<p>Figure 5 (« si vous avez du temps ») :</p>${C(`    *
   * *
  * * *
 * * * *
* * * * *`,"txt")}`,link:"a-motifs",idea:"Pour chaque figure, écris ce que contient la ligne i : combien d'espaces, combien d'étoiles.",
  sol:`<p>Les cinq procédures, dans l'ordre des figures. Tu peux les essayer dans la fiche « Motifs d'étoiles » : choisis la figure et change n.</p><p><b>Figure 1</b></p>${C(MOT[0].code)}<p><b>Figure 2</b></p>${C(MOT[1].code)}<p><b>Figure 3</b></p>${C(MOT[2].code)}<p><b>Figure 4</b> : sur la ligne i, i − 1 espaces puis n − i + 1 étoiles.</p>${C(MOT[3].code)}<p><b>Figure 5</b> : sur la ligne i, n − i espaces, puis i fois « une étoile puis un espace ».</p>${C(MOT[4].code)}`},
 {id:"5",s:2,t:"Que calcule mystere ?",en:`<p>Que calcule l'algorithme suivant ? Exprimez le résultat en fonction du paramètre n.</p>${C(`FONCTION : mystere (E n : entier) : entier
SPÉCIFICATIONS : n ∈ ℕ. Renvoie ???
DÉBUT
    Renvoyer cond(n = 0, 0, n*n + mystere(n-1))
FIN`)}`,idea:"Déroule pour n = 1, 2, 3.",hint:"mystere(3) = 9 + mystere(2) = 9 + 4 + mystere(1) = …",sol:`<p>mystere(n) = n² + (n−1)² + … + 1² = n(n+1)(2n+1)/6. Exemple : mystere(3) = 9 + 4 + 1 = 14.</p>`,link:"a-recursif"},
 {id:"6",s:2,paper:1,t:"sommeInterv(a, b), somme des entiers de a à b",en:`<p>Écrire le corps de l'algorithme récursif dont la spécification est :</p>${C(`FONCTION : sommeInterv (E a : entier, E b : entier) : entier
SPÉCIFICATIONS : a ≤ b. Calcule et renvoie la somme des entiers entre a et b.`)}`,idea:"Cas de base a = b ; sinon a + la somme de a + 1 à b.",sol:C(`FONCTION : sommeInterv (E a : entier, E b : entier) : entier
SPÉCIFICATIONS : a ≤ b. Calcule et renvoie la somme des entiers entre a et b.
DÉBUT
    Renvoyer cond(a = b, a, a + sommeInterv(a + 1, b))
FIN`),link:"a-recursif"},
 {id:"7",s:2,paper:1,t:"suiteU : U₀ = 1, Uₙ = 2 Uₙ₋₁ + 3",en:"Écrire un algorithme récursif suiteU qui, étant donné un entier naturel n, calcule le n-ième terme de la suite (Uₙ) définie par : U₀ = 1 et, pour n > 0, Uₙ = 2 × Uₙ₋₁ + 3.",sol:C(`FONCTION : suiteU (E n : entier) : entier
SPÉCIFICATIONS : n ∈ ℕ. Renvoie Uₙ, avec U₀ = 1 et Uₙ = 2 Uₙ₋₁ + 3.
DÉBUT
    Renvoyer cond(n = 0, 1, 2 * suiteU(n - 1) + 3)
FIN`)+`<p>U₁ = 5, U₂ = 13, U₃ = 29.</p>`,link:"a-recursif"},
 {id:"8",s:2,t:"estPair sans division",en:"Écrire un algorithme <b>récursif</b> estPair qui, étant donné un entier naturel n, renvoie true si n est un entier pair, false sinon. <b>Les seules opérations autorisées sont la soustraction, les comparaisons et l'opérateur ternaire cond.</b>",idea:"n et n − 2 ont la même parité.",sol:C(`FONCTION : estPair (E n : entier) : booléen
SPÉCIFICATIONS : n ∈ ℕ. Renvoie true si n est pair, false sinon.
DÉBUT
    Renvoyer cond(n = 0, true, cond(n = 1, false, estPair(n - 2)))
FIN`)+`<p>Deux cas de base, car n − 2 saute par-dessus 0 quand n est impair. mod et div ne sont pas autorisés ici : « Renvoyer n mod 2 = 0 » calcule le bon résultat, mais ne répond pas à la question posée.</p>`,link:"a-recursif"},
 {id:"9",s:3,paper:1,t:"Motifs d'étoiles en récursif (TD 2)",en:`<p>On dispose de procédures affEspace, affEtoile et affRL qui affichent respectivement un espace, une étoile et un retour à la ligne. Écrire des procédures <b>récursives non itératives</b> qui, étant donné un paramètre n, affichent les figures suivantes. Chaque procédure peut appeler les précédentes. Les figures ont pour base n qui vaut 5 dans les exemples suivants.</p><p>Figure 1 (n étoiles suivies d'un retour à la ligne) :</p>${C(`*****`,"txt")}<p>Figure 2 :</p>${C(`*****
****
***
**
*`,"txt")}<p>Figure 3 (indice : créer une procédure intermédiaire affLigneEsp(E p : entier) qui affiche p espaces) :</p>${C(`    *
   *
  *
 *
*`,"txt")}<p>Figure 4 (indice : utiliser une procédure récursive intermédiaire rectangle(E p : entier, E n : entier) qui affiche p lignes de n étoiles) :</p>${C(`*****
*****
*****
*****
*****`,"txt")}<p>Figure 5 (indice : créer une procédure intermédiaire pyramideDec(n, p) qui affiche une pyramide de n étages décalée de p espaces de la gauche) :</p>${C(`    *
   ***
  *****
 *******
*********`,"txt")}`,link:"a-motifs",idea:"« Récursives non itératives » : aucune boucle. On affiche un morceau, et l'appel récursif affiche le reste de la figure.",
  sol:`<p><b>Figure 1</b></p>${C(`PROCÉDURE : ligneRec (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Affiche n étoiles puis passe à la ligne.
DÉBUT
    si n = 0 alors
        affRL()
    sinon
        affEtoile()
        ligneRec(n - 1)
    fin si;
FIN`)}<p><b>Figure 2</b></p>${C(`PROCÉDURE : triDec (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Affiche des lignes de n, n − 1, …, 1 étoiles.
DÉBUT
    si n > 0 alors
        ligneRec(n)
        triDec(n - 1)
    fin si;
FIN`)}<p><b>Figure 3</b>, avec la procédure intermédiaire de l'indice</p>${C(`PROCÉDURE : affLigneEsp (E p : entier)
SPÉCIFICATIONS : p ∈ ℕ. Affiche p espaces.
DÉBUT
    si p > 0 alors
        affEspace()
        affLigneEsp(p - 1)
    fin si;
FIN

PROCÉDURE : diagonale (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Ligne 1 : n − 1 espaces puis une étoile ; … ; ligne n : une étoile seule.
DÉBUT
    si n > 0 alors
        affLigneEsp(n - 1)
        affEtoile()
        affRL()
        diagonale(n - 1)
    fin si;
FIN`)}<p><b>Figure 4</b>, avec la procédure intermédiaire de l'indice</p>${C(`PROCÉDURE : rectangle (E p : entier, E n : entier)
SPÉCIFICATIONS : p, n ∈ ℕ. Affiche p lignes de n étoiles.
DÉBUT
    si p > 0 alors
        ligneRec(n)
        rectangle(p - 1, n)
    fin si;
FIN

PROCÉDURE : carre (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Affiche n lignes de n étoiles.
DÉBUT
    rectangle(n, n)
FIN`)}<p><b>Figure 5</b>, avec la procédure intermédiaire de l'indice</p>${C(`PROCÉDURE : pyramideDec (E n : entier, E p : entier)
SPÉCIFICATIONS : n, p ∈ ℕ. Affiche une pyramide de n étages décalée de p espaces de la gauche.
DÉBUT
    si n > 0 alors
        pyramideDec(n - 1, p + 1)
        affLigneEsp(p)
        ligneRec(2*n - 1)
    fin si;
FIN

PROCÉDURE : pyramide (E n : entier)
SPÉCIFICATIONS : n ∈ ℕ. Affiche une pyramide de n étages.
DÉBUT
    pyramideDec(n, 0)
FIN`)}<p>pyramideDec(n, p) affiche d'abord les n − 1 étages du dessus, décalés d'un espace de plus, puis son dernier étage : p espaces et 2n − 1 étoiles. Vérifie chaque figure dans la fiche « Motifs d'étoiles ».</p>`},
 {id:"10",s:1,t:"Somme des impairs jusqu'à n (supplémentaire)",en:"Exercice supplémentaire : écrire un algorithme qui renvoie la somme des entiers impairs inférieurs ou égaux à n : 1 + 3 + 5 + … + n (si n est impair) ou 1 + 3 + 5 + … + (n − 1) (si n est pair).",link:"a-recursif",sol:C(`FONCTION : sommeImpairs (E n : entier) : entier
SPÉCIFICATIONS : n ∈ ℕ. Renvoie la somme des impairs inférieurs ou égaux à n.
DÉBUT
    Renvoyer cond(n ≤ 0, 0, cond(n mod 2 = 1, n + sommeImpairs(n - 2), sommeImpairs(n - 1)))
FIN`)},
 {id:"11",s:1,note:"supplémentaire",t:"plusPetitDiv et nombre premier",en:"Compléter l'algorithme plusPetitDiv(E a : entier, E b : entier) : entier, où a et b sont deux entiers naturels tels que a ≤ b : il renvoie le plus petit entier d tel que a ≤ d ≤ b et d divise b. L'utiliser pour tester si un nombre est premier, c'est-à-dire s'il a exactement 2 diviseurs, 1 et lui-même.",link:"a-recursif",idea:"Si a divise b, c'est lui. Sinon, on cherche à partir de a + 1.",
  sol:`${C(`FONCTION : plusPetitDiv (E a : entier, E b : entier) : entier
SPÉCIFICATIONS : a et b sont deux entiers naturels tels que 1 ≤ a ≤ b.
    Renvoie le plus petit entier d tel que a ≤ d ≤ b et d divise b.
DÉBUT
    Renvoyer cond(b mod a = 0, a, plusPetitDiv(a + 1, b))
FIN

FONCTION : estPremier (E n : entier) : booléen
SPÉCIFICATIONS : n ∈ ℕ. Renvoie true si n a exactement 2 diviseurs, 1 et lui-même.
DÉBUT
    Renvoyer n ≥ 2 et plusPetitDiv(2, n) = n
FIN`)}<p>L'appel s'arrête toujours : au pire a arrive à b, et b divise b. n est premier quand son plus petit diviseur à partir de 2 est n lui-même. Exemple : plusPetitDiv(2, 15) = 3, donc 15 n'est pas premier.</p>`},
 {id:"12",s:2,t:"Multiplication du paysan russe",en:`<p>Exercice supplémentaire : multiplication dite « du paysan russe ». On souhaite multiplier deux entiers positifs a et b <b>en n'utilisant que des additions, la multiplication par 2 et la division par 2</b>. Soit mul le nom de cet algorithme. Pour définir mul on utilise un schéma récursif exprimant mul(a, b) en fonction de mul(a div 2, b). Complétez ce schéma :</p><ul><li>Cas de base : quand a = 0, mul(a, b) vaut …</li><li>Équation de récurrence : quand a ≠ 0 il existe 2 cas : quand a est pair, mul(a, b) vaut … ; quand a est impair, mul(a, b) vaut …</li></ul><p>Écrivez l'algorithme mul.</p>`,link:"a-recursif",idea:"L'appel mul(a div 2, b) calcule (a div 2) × b. Si a est pair, a × b est le double de ce résultat. Si a est impair, c'est le double plus b : 7 × 5 = 2 × (3 × 5) + 5.",
  sol:`<p>Le schéma : quand a = 0, mul(a, b) vaut 0. Quand a est pair, mul(a, b) vaut 2 * mul(a div 2, b). Quand a est impair, mul(a, b) vaut 2 * mul(a div 2, b) + b.</p>`+C(`FONCTION : mul (E a : entier, E b : entier) : entier
SPÉCIFICATIONS : a, b ∈ ℕ. Renvoie a × b.
DÉBUT
    si a = 0 alors
        Renvoyer 0
    sinon si a mod 2 = 0 alors
        Renvoyer 2 * mul(a div 2, b)
    sinon
        Renvoyer 2 * mul(a div 2, b) + b
    fin si;
FIN`)+`<p>mul(5, 3) = 2 × mul(2, 3) + 3 = 2 × (2 × mul(1, 3)) + 3 = 2 × 2 × (2 × 0 + 3) + 3 = 15.</p>`},
 {id:"13",s:3,t:"Le trajet du pingouin",en:`<p>Exercice supplémentaire : le trajet d'un pingouin sur la banquise est représenté par une suite d'entiers entre 0 et 3, avec la correspondance 0 = ← ; 1 = ↑ ; 2 = → ; 3 = ↓. Par exemple, la suite 03112 représente le trajet ← ↓ ↑ ↑ →. On dispose de la procédure deplacerPingouin(n) qui déplace le pingouin d'une case dans la direction n ∈ {0, 1, 2, 3}, et on suppose que le trajet du pingouin suit l'algorithme suivant (le TD le donne en Python : « if » veut dire « si », « and » veut dire « et ») :</p>${P(`def trajet(n):
    if n>=0 and n<=3:
        trajet(n-1)
        trajet(n-2)
        deplacerPingouin(n)`)}<p>Dessiner le trajet du pingouin correspondant à l'appel trajet(3).</p>`,link:"a-arbre-appels",hint:"Calcule trajet(0), puis trajet(1), puis trajet(2) : chacun réutilise les précédents.",
  sol:`<p>trajet(−1) et trajet(−2) ne font rien (n &lt; 0). trajet(0) = 0 ; trajet(1) = trajet(0), puis 1 = 0 1 ; trajet(2) = trajet(1), trajet(0), puis 2 = 0 1 0 2 ; trajet(3) = trajet(2), trajet(1), puis 3 = 0 1 0 2 0 1 3.</p><p>Le pingouin fait ← ↑ ← → ← ↑ ↓. Vois l'arbre des appels dans la fiche « Tracer un affichage récursif », exemple « pingouin ».</p>`},
 {id:"14",s:3,paper:1,t:"Fonctions sur un tableau (TD 3)",en:`<p>Écrivez des fonctions qui, étant donné un tableau tab de nombres, calculent et renvoient les résultats suivants :</p><ol><li>la moyenne des éléments de tab ;</li><li>le nombre d'éléments de tab qui ont une valeur égale à e ;</li><li>un nouveau tableau contenant les valeurs de tab en ordre inverse ;</li><li>si tab est injectif, c'est-à-dire si toutes ses valeurs sont différentes : (a) en utilisant la question 2 ; (b) avec une double boucle tant que, sans utiliser la question 2 ; (c) comparer le nombre d'opérations dans les deux cas, pour un tableau d'un milliard de valeurs rempli de 1 ;</li><li>si la séquence des valeurs des éléments de tab est croissante ;</li><li>la deuxième plus petite valeur de tab, supposé injectif.</li></ol><p>Dans le corrigé, le tableau s'appelle T.</p>`,link:"a-tableaux",idea:"Un accumulateur, ou un « Renvoyer false » dès qu'on trouve un contre-exemple.",
  sol:C(`FONCTION : moyenne (E T : tableau de nombres) : nombre
SPÉCIFICATIONS : renvoie la moyenne des éléments de T.
Variable : som : nombre
DÉBUT
    som ← 0
    pour i de 0 à taille(T)-1 faire
        som ← som + T[i]
    fin pour;
    Renvoyer som / taille(T)
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
FIN

FONCTION : inverse (E T : tableau de nombres) : tableau de nombres
SPÉCIFICATIONS : renvoie un nouveau tableau avec les valeurs de T en ordre inverse.
Variable : R : tableau de taille(T) nombres
DÉBUT
    pour i de 0 à taille(T)-1 faire
        R[i] ← T[taille(T)-1-i]
    fin pour;
    Renvoyer R
FIN

FONCTION : injectifA (E T : tableau de nombres) : booléen
SPÉCIFICATIONS : true si toutes les valeurs de T sont différentes (avec compteEgaux).
DÉBUT
    pour i de 0 à taille(T)-1 faire
        si compteEgaux(T[i], T) > 1 alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN

FONCTION : injectifB (E T : tableau de nombres) : booléen
SPÉCIFICATIONS : même chose, avec une double boucle tant que.
Variable : i, j : entier ; inj : booléen
DÉBUT
    i, inj ← 0, true
    tant que inj et i < taille(T)-1 faire
        j ← i + 1
        tant que inj et j < taille(T) faire
            si T[i] = T[j] alors
                inj ← false
            fin si;
            j ← j + 1
        fin tq;
        i ← i + 1
    fin tq;
    Renvoyer inj
FIN

FONCTION : croissant (E T : tableau de nombres) : booléen
SPÉCIFICATIONS : true si les valeurs de T sont dans l'ordre croissant.
DÉBUT
    pour i de 0 à taille(T)-2 faire
        si T[i] > T[i+1] alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN

FONCTION : deuxiemeMin (E T : tableau de nombres) : nombre
SPÉCIFICATIONS : T injectif, avec au moins 2 éléments. Renvoie la deuxième plus petite valeur.
Variable : m1, m2 : nombre
DÉBUT
    si T[0] < T[1] alors
        m1, m2 ← T[0], T[1]
    sinon
        m1, m2 ← T[1], T[0]
    fin si;
    pour i de 2 à taille(T)-1 faire
        si T[i] < m1 alors
            m1, m2 ← T[i], m1
        sinon si T[i] < m2 alors
            m2 ← T[i]
        fin si;
    fin pour;
    Renvoyer m2
FIN`)+`<p>4c, avec un milliard de 1 : injectifA appelle compteEgaux(T[0], T), qui parcourt tout le tableau (10⁹ comparaisons) avant de renvoyer false. injectifB s'arrête après une seule comparaison (T[0] = T[1]). Dans injectifB, i et j sont de vraies variables : une boucle tant que n'a pas d'indice automatique.</p>`},
 {id:"15",s:3,paper:1,t:"Moyennes d'un tableau 2D (TD 4)",en:"Écrire une fonction qui, étant donné un tableau à deux dimensions, calcule sa moyenne arithmétique (somme des valeurs / nombre de valeurs) et sa moyenne géométrique (produit des valeurs puissance (1 / nombre de valeurs)).",link:"a-tableaux-2d",idea:"Une double boucle, deux accumulateurs : som part de 0, prod part de 1.",
  sol:C(`FONCTION : moyennes (E T : tableau 2D de nombres) : tableau de 2 nombres
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
FIN`)+`<p>« som, prod, nb ← 0, 1, 0 » range 0 dans som, 1 dans prod et 0 dans nb. Le signe ^ est la puissance. L'énoncé demande deux résultats : ici la fonction les renvoie dans un tableau R de 2 cases. On suppose les valeurs strictement positives.</p><p>On peut aussi écrire deux fonctions séparées. Exemple : [[1, 2], [4, 8]] donne 15/4 = 3,75 et 64^(1/4) = 2√2 ≈ 2,83.</p>`},
 {id:"16",s:2,note:"pas fini en TD : la question 1",t:"Plus fort dénivelé entre deux voisins (TD 4)",en:"On mémorise les altitudes d'un terrain dans un tableau à deux dimensions. Ainsi T[3][10] = 25 signifie qu'au point de coordonnées (3, 10), l'altitude est de 25 m. Question 1 : écrire une fonction qui, étant donné un tableau d'altitudes, calcule le plus fort dénivelé entre deux points voisins, horizontalement ou verticalement. (Cet exercice vient après l'exercice 15 : il est en dehors du programme annoncé pour le CC1. La question 2, marquée ***, n'est pas corrigée ici.)",link:"a-tableaux-2d",idea:"Pour chaque case, compare-la à sa voisine de droite et à celle du dessous, si elles existent.",
  sol:C(`FONCTION : denivMax (E T : tableau 2D de nombres) : nombre
SPÉCIFICATIONS : renvoie le plus grand écart d'altitude entre deux points voisins.
Variable : d : nombre
DÉBUT
    d ← 0
    pour i de 0 à taille(T)-1 faire
        pour j de 0 à taille(T[i])-1 faire
            si j < taille(T[i])-1 alors
                d ← max(d, abs(T[i][j] - T[i][j+1]))
            fin si;
            si i < taille(T)-1 alors
                d ← max(d, abs(T[i][j] - T[i+1][j]))
            fin si;
        fin pour;
    fin pour;
    Renvoyer d
FIN`)+`<p>Les tests j &lt; taille(T[i]) − 1 et i &lt; taille(T) − 1 évitent de sortir du tableau. abs(x) est la valeur absolue de x (l'écart, sans signe) et max(a, b) le plus grand de a et b : s'ils ne sont pas autorisés, écris-les avec des si.</p>`},
 {id:"TP1",s:3,t:"TP : le jeu de la vie",en:"Grille G de 0 (morte) et de 1 (vivante). 1. nbVoisins(G, i, j) : nombre de voisines vivantes de la case (i, j). 2. suivante(G) : la grille de la génération suivante (une vivante survit avec 2 ou 3 voisines ; une morte naît avec exactement 3).",link:"a-tableaux-2d",hint:"Deux boucles pour a de i − 1 à i + 1 et b de j − 1 à j + 1, en ignorant la case elle-même et les cases hors du tableau.",
  sol:`<p>Le corrigé complet est dans la fiche « Tableaux 2D, jeu de la vie », avec une grille pour tester. Les deux points à ne pas rater : tester les bords avant de lire G[a][b], et remplir un nouveau tableau H au lieu de modifier G.</p>`},
 {id:"TP2",s:2,t:"TP : le pendu, avec des tableaux",en:"Le mot à deviner est une chaîne mot ; vues est un tableau de booléens de même taille (true si la lettre a été trouvée). 1. afficheMot(mot, vues) : affiche les lettres trouvées et un _ pour les autres. 2. propose(c, mot, vues) : marque toutes les cases où mot contient c, et renvoie true si c est dans le mot. 3. gagne(vues).",link:"a-tableaux",
  sol:C(`PROCÉDURE : afficheMot (E mot : chaîne, E vues : tableau de booléens)
SPÉCIFICATIONS : affiche les lettres trouvées, et _ à la place des autres.
DÉBUT
    pour i de 0 à taille(mot)-1 faire
        si vues[i] alors
            afficher mot[i]
        sinon
            afficher "_"
        fin si;
    fin pour;
FIN

FONCTION : propose (E c : caractère, E mot : chaîne, ES vues : tableau de booléens) : booléen
SPÉCIFICATIONS : marque dans vues toutes les positions de c dans mot.
    Renvoie true si c apparaît dans mot.
Variable : trouve : booléen
DÉBUT
    trouve ← false
    pour i de 0 à taille(mot)-1 faire
        si mot[i] = c alors
            vues[i] ← true
            trouve ← true
        fin si;
    fin pour;
    Renvoyer trouve
FIN

FONCTION : gagne (E vues : tableau de booléens) : booléen
SPÉCIFICATIONS : true si toutes les lettres ont été trouvées.
DÉBUT
    pour i de 0 à taille(vues)-1 faire
        si non vues[i] alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN`)+`<p>vues est un paramètre ES : propose le modifie. On ne s'arrête pas à la première lettre trouvée, car la lettre peut apparaître plusieurs fois.</p>`},
 {id:"17",s:3,t:"Expressions sur la liste [2, 3, 2, 4] (TD 5)",en:`<p>Dans les expressions suivantes, substituez à li la liste [2 3 2 4], puis calculez la valeur de l'expression obtenue :</p><ol><li>queue(queue(li))</li><li>tête(queue(queue(li)))</li><li>tête(queue(queue(queue(queue(li)))))</li><li>estVide(queue(queue(queue(queue(li)))))</li><li>estVide(tête(li))</li><li>cons(7, li)</li><li>cons(7, queue(li))</li><li>cons(tête(li), queue(li))</li><li>cons(tête(queue(li)), queue(li))</li></ol>`,link:"a-listes",
  sol:`<ol><li>[2, 4]</li><li>2</li><li>erreur : après quatre queue, la liste est vide, et la liste vide n'a pas de tête</li><li>true : après quatre queue, la liste est vide</li><li>erreur de type : tête(li) = 2 n'est pas une liste</li><li>[7, 2, 3, 2, 4]</li><li>[7, 3, 2, 4]</li><li>[2, 3, 2, 4] : c'est li</li><li>[3, 3, 2, 4]</li></ol><p>Le TD écrit les listes sans virgules, [2 3 2 4] ; les sujets de CC les écrivent avec, [2, 3, 2, 4]. C'est la même liste.</p>`},
 {id:"18",s:3,paper:1,t:"listeEntiers(n) = [n, n−1, …, 0]",en:"Écrire un algorithme récursif listeEntiers qui, étant donné un entier naturel n, renvoie la liste [n n-1 n-2 ... 1 0].",sol:C(`FONCTION : listeEntiers (E n : entier) : liste d'entiers
SPÉCIFICATIONS : n ∈ ℕ. Renvoie la liste [n, n−1, …, 1, 0].
DÉBUT
    Renvoyer cond(n = 0, cons(0, [ ]), cons(n, listeEntiers(n - 1)))
FIN`),link:"a-listes-rec"},
 {id:"19",s:3,paper:1,t:"maxListe",en:"Écrire un algorithme récursif maxListe qui, étant donnée une liste de nombres non vide, renvoie son plus grand élément.",sol:C(`FONCTION : maxListe (E L : liste de nombres) : nombre
SPÉCIFICATIONS : L non vide. Renvoie son plus grand élément.
DÉBUT
    Renvoyer cond(estVide(queue(L)), tête(L), max(tête(L), maxListe(queue(L))))
FIN`)+`<p>max(a, b) renvoie le plus grand de deux nombres. Le cas de base est la liste à un seul élément : estVide(queue(L)).</p>`,link:"a-listes-rec"},
 {id:"20",s:2,t:"listesEgales, récursif et itératif",en:"Écrire un algorithme listesEgales qui teste si deux listes d'entiers sont égales : 1. sous forme récursive ; 2. sous forme itérative.",sol:C(`FONCTION : listesEgales (E L1 : liste d'entiers, E L2 : liste d'entiers) : booléen
SPÉCIFICATIONS : renvoie true si L1 et L2 sont égales (version récursive).
DÉBUT
    Renvoyer cond(estVide(L1), estVide(L2),
             cond(estVide(L2), false,
                  tête(L1) = tête(L2) et listesEgales(queue(L1), queue(L2))))
FIN

Version itérative :
Variable : M1, M2 : liste d'entiers
DÉBUT
    M1, M2 ← L1, L2
    tant que non estVide(M1) et non estVide(M2) et tête(M1) = tête(M2) faire
        M1, M2 ← queue(M1), queue(M2)
    fin tq;
    Renvoyer estVide(M1) et estVide(M2)
FIN`),link:"a-listes-rec"},
 {id:"21",s:2,t:"préfixe, facteur, suffixe",en:"Écrire 3 algorithmes qui prennent en paramètres deux listes d'entiers l1 et l2 et testent respectivement : 1. si l1 est préfixe de l2 (c'est-à-dire si l2 commence par l1 ; par exemple [ ], [1], [1 2] sont préfixes de [1 2]) ; 2. si l1 est facteur de l2 (c'est-à-dire si l2 contient l1 ; par exemple [1 2] est facteur de [1 2], de [3 1 2 1 3], de [3 3 1 2]) ; 3. si l1 est suffixe de l2 (c'est-à-dire si l2 finit par l1 ; par exemple [ ], [2 3], [1 2 3] sont suffixes de [1 2 3]). Indication du TD : « utiliser l'exercice 4 », c'est-à-dire le 4e de cette feuille, listesEgales.",link:"a-listes-rec",hint:"facteur : préfixe, ou facteur de la queue de l2. suffixe : égales, ou suffixe de la queue de l2.",
  sol:C(`FONCTION : prefixe (E l1 : liste d'entiers, E l2 : liste d'entiers) : booléen
DÉBUT
    Renvoyer cond(estVide(l1), true,
             cond(estVide(l2), false,
                  tête(l1) = tête(l2) et prefixe(queue(l1), queue(l2))))
FIN

FONCTION : facteur (E l1 : liste d'entiers, E l2 : liste d'entiers) : booléen
DÉBUT
    Renvoyer prefixe(l1, l2) ou (non estVide(l2) et facteur(l1, queue(l2)))
FIN

FONCTION : suffixe (E l1 : liste d'entiers, E l2 : liste d'entiers) : booléen
DÉBUT
    Renvoyer listesEgales(l1, l2) ou (non estVide(l2) et suffixe(l1, queue(l2)))
FIN`)},
 {id:"22",s:1,t:"Doubler chaque élément (supplémentaire)",en:"Exercice supplémentaire : écrire une fonction qui, étant donné une liste d'entiers, renvoie une nouvelle liste qui contient le double de chacun de ces entiers.",link:"a-listes-rec",sol:C(`FONCTION : double (E L : liste d'entiers) : liste d'entiers
DÉBUT
    Renvoyer cond(estVide(L), [ ], cons(2 * tête(L), double(queue(L))))
FIN`)},
 {id:"23",s:2,t:"Inverser une liste (supplémentaire)",en:"Exercice supplémentaire : écrire une fonction qui, étant donné une liste, renvoie une liste contenant les mêmes éléments dans l'ordre inverse. On pourra écrire une fonction insereFin(e, L) qui renvoie une nouvelle liste constituée de L avec e à la fin.",link:"a-listes-rec",sol:C(`FONCTION : insereFin (E e : entier, E L : liste d'entiers) : liste d'entiers
DÉBUT
    Renvoyer cond(estVide(L), cons(e, [ ]), cons(tête(L), insereFin(e, queue(L))))
FIN

FONCTION : inverseL (E L : liste d'entiers) : liste d'entiers
DÉBUT
    Renvoyer cond(estVide(L), [ ], insereFin(tête(L), inverseL(queue(L))))
FIN`)},
 {id:"24",s:3,out:1,t:"Trace et invariants de g (TD 6)",en:`${C(`FONCTION : g (E n : entier) : entier
Variables : i, r, x : entier
DÉBUT
    i, r, x ← 0, 1, 0
    tant que i ≠ n faire
        i ← i + 1
        r ← r + x - i
        x ← x + 3
    fin tq;
    Renvoyer r
FIN`)}<p>1. Trace pour n = 5. 2. Invariants liant x et i, puis r et i. 3. Les prouver. 4. Que calcule g ?</p>`,idea:"Regarde les colonnes de la trace : x = 3i, et r est un carré.",
  sol:`<table class="tbl"><thead><tr><th class="var">i</th><th class="var">r</th><th class="var">x</th></tr></thead><tbody><tr><td>0</td><td>1</td><td>0</td></tr><tr><td>1</td><td>0</td><td>3</td></tr><tr><td>2</td><td>1</td><td>6</td></tr><tr><td>3</td><td>4</td><td>9</td></tr><tr><td>4</td><td>9</td><td>12</td></tr><tr><td>5</td><td>16</td><td>15</td></tr></tbody></table><p>Invariants : x = 3i et r = (i − 1)². À la sortie i = n, donc g(n) = (n − 1)².</p>`,link:"a-preuve"},
 {id:"34",s:3,out:1,t:"Compter les additions (TD 8)",en:"Complexité en nombre d'additions de boucles imbriquées.",
  sol:`<ol><li>n, Θ(n)</li><li>n², Θ(n²)</li><li>n × n² × n³ = n⁶</li><li>1 + 2 + … + n = n(n+1)/2, Θ(n²)</li><li>n + (n−1) + … + 1 = n(n+1)/2, Θ(n²)</li><li>n × (1 + n) = n² + n, Θ(n²)</li></ol>`,link:"a-calcul-complexite"}];

/* ---------- annales ---------- */
const ann=[
 {src:"CC PEIP février 2023 · Cours · 2 pts",t:"Deux questions de compréhension",en:"1. Une fonction récursive peut-elle utiliser des variables ? 2. Pourquoi dit-on que la boucle tant que est plus générale que la boucle pour ?",who:"Mon corrigé",
  sol:`<ol><li>Oui : rien ne l'interdit. Par exemple, une fonction récursive peut stocker le résultat de l'appel récursif dans une variable pour ne pas le calculer deux fois.</li><li>Toute boucle pour s'écrit avec un tant que (en gérant le compteur à la main), mais pas l'inverse : avec tant que, on n'a pas besoin de connaître le nombre de tours à l'avance.</li></ol>`},
 {src:"CC PEIP février 2023 · Ex. 1 · 4 pts",t:"Qu'affiche G(9, 0) ?",en:`${C(GC)}<p>affiche(d) affiche d sans retour à la ligne, aLaLigne() passe à la ligne.</p>`,go:"a-arbre-appels",who:"Mon corrigé",hint:"G(9, 0) appelle G(4, 1), qui appelle G(2, 2), puis G(1, 3), puis G(0, 4) qui n'affiche rien. Les affichages se font en remontant.",
  sol:`<p>G(1, 3) affiche une fois 3 ; G(2, 2) affiche deux fois 2 ; G(4, 1) quatre fois 1 ; G(9, 0) neuf fois 0 :</p>${C(`3
22
1111
000000000`)}`},
 {src:"CC PEIP février 2023 · Ex. 2 · 2 pts",t:"Les 3 premiers éléments sont-ils croissants ?",en:"L est une liste d'entiers d'au moins 3 éléments. Écrire une expression qui vaut true si les 3 premiers éléments de L sont ordonnés par ordre croissant et false sinon.",go:"a-listes",who:"Mon corrigé",
  sol:C(`tête(L) ≤ tête(queue(L)) et tête(queue(L)) ≤ tête(queue(queue(L)))`)},
 {src:"CC PEIP février 2023 · Ex. 3 · 4 pts",t:"Le motif GrandEt, sans récursivité",en:`<p>On dispose des procédures affX() qui affiche un X, affB() qui affiche un espace et alaligne() qui passe à la ligne. Écrire une procédure <b>non récursive</b> GrandEt qui, étant donné un entier n, affiche un motif à n lignes comme sur les figures suivantes.</p><p>GrandEt(5) :</p>${C(`    X
   X X
  X   X
 X     X
X       X`,"txt")}<p>GrandEt(4) :</p>${C(`   X
  X X
 X   X
X     X`,"txt")}`,go:"a-motifs",who:"Mon corrigé",hint:"Ligne k (de 0 à n − 1) : n − 1 − k espaces, un X, puis pour k > 0 : 2k − 1 espaces et un second X.",
  sol:`${C(MOT[5].code)}<p>Vérifie la figure dans la fiche « Motifs d'étoiles », dernier exemple de la partie boucles.</p>`},
 {src:"CC PEIP février 2023 · Ex. 4 · 4 pts",t:"tousDiv3",en:"Écrire une fonction tousDiv3 qui, étant donné un tableau T d'entiers, renvoie true si tous les éléments de T sont divisibles par 3, false sinon.",go:"a-tableaux",who:"Mon corrigé",
  sol:C(`FONCTION : tousDiv3 (E T : tableau d'entiers) : booléen
SPÉCIFICATIONS : renvoie true si tous les éléments de T sont divisibles par 3, false sinon.
DÉBUT
    pour i de 0 à taille(T)-1 faire
        si T[i] mod 3 ≠ 0 alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN`)},
 {src:"CC PEIP février 2023 · Ex. 5 · 4 pts",t:"tousles3 : du tableau à la liste",en:"Écrire une fonction tousles3 qui, étant donné un tableau T d'entiers, renvoie la liste des éléments de T divisibles par 3, dans le même ordre que dans T.",go:"a-listes",who:"Mon corrigé",hint:"cons ajoute devant : parcours le tableau à l'envers pour garder l'ordre.",
  sol:C(`FONCTION : tousles3 (E T : tableau d'entiers) : liste d'entiers
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
FIN`)},
 /* ----- CC PEIP février 2023 : les trois autres sujets du même PDF (pages 2 à 4) ----- */
 {src:"CC PEIP février 2023, sujet 2 · Cours · 2 pts",t:"cond ou si-alors-sinon ; tableau ou liste",en:"1. Quelle est la différence entre cond et si-alors-sinon ? 2. Citer un cas où il est préférable d'utiliser un tableau plutôt qu'une liste.",who:"Mon corrigé",go:"a-expressions",
  sol:`<ol><li>cond(a, b, c) est une <b>expression</b> : elle a une valeur (b si a est vrai, c si a est faux), et b et c doivent être du même type. si … alors … sinon … fin si; est une <b>instruction</b> : elle n'a pas de valeur, elle fait exécuter un bloc de lignes ou l'autre, et le sinon est facultatif.</li><li>Quand il faut accéder directement à un élément par sa position : T[i] donne n'importe quelle case (la dernière, celle du milieu, une case d'une grille). Sur une liste, on n'accède qu'à la tête : le cours dit « pas de L[2] sur une liste ».</li></ol>`},
 {src:"CC PEIP février 2023, sujet 2 · Ex. 1 · 4 pts",t:"Qu'affiche G(12, 0) ?",en:`${C(`PROCÉDURE : G (E n : entier, E d : entier)
SPÉCIFICATIONS : n ∈ ℕ.
DÉBUT
    si n ≠ 0 alors
        G(n div 3, d)
        pour i de 1 à n faire affiche(d) fin pour;
        aLaLigne()
    fin si;
FIN`)}<p>affiche(d) écrit d à l'écran sans retour à la ligne ; aLaLigne() passe à la ligne.</p>`,go:"a-arbre-appels",who:"Mon corrigé",hint:"G(12, 0) appelle G(4, 0), qui appelle G(1, 0), puis G(0, 0) qui n'affiche rien. Ici d ne change pas : il vaut toujours 0.",
  sol:`<p>Les affichages se font en remontant : G(1, 0) affiche un 0 ; G(4, 0) quatre 0 ; G(12, 0) douze 0.</p>${C(`0
0000
000000000000`,"txt")}`},
 {src:"CC PEIP février 2023, sujet 2 · Ex. 2 · 2 pts",t:"L a-t-elle au moins 3 éléments ?",en:"L est une liste d'entiers. Écrire une expression qui vaut true si L contient au moins 3 éléments, false sinon.",go:"a-listes",who:"Mon corrigé",
  sol:`${C(`non estVide(L) et non estVide(queue(L)) et non estVide(queue(queue(L)))`)}<p>Le « et » est paresseux : si L est vide, queue(L) n'est jamais calculé. Il n'y a donc pas d'erreur.</p>`},
 {src:"CC PEIP février 2023, sujet 2 · Ex. 3 · 4 pts",t:"Le motif GrandV, sans récursivité",en:`<p>Avec affU() (un U), affB() (un espace) et alaligne(), écrire une procédure non récursive GrandV qui affiche un V de n lignes. Pour n = 5 :</p>${C(`U       U
 U     U
  U   U
   U U
    U`,"txt")}`,go:"a-motifs",who:"Mon corrigé",hint:"Ligne k (de 0 à n − 1) : k espaces, un U, puis, sauf sur la dernière ligne, 2(n − 1 − k) − 1 espaces et un second U.",
  sol:`${C(`PROCÉDURE : GrandV (E n : entier)
SPÉCIFICATIONS : n ≥ 1. Affiche un V de n lignes, sans récursivité.
DÉBUT
    pour k de 0 à n-1 faire
        pour j de 1 à k faire
            affB()
        fin pour;
        affU()
        si k < n-1 alors
            pour j de 1 à 2*(n-1-k)-1 faire
                affB()
            fin pour;
            affU()
        fin si;
        alaligne()
    fin pour;
FIN`)}<p>Vérification pour n = 5 : ligne 0, 0 espace, U, 7 espaces, U ; ligne 3, 3 espaces, U, 1 espace, U ; ligne 4, 4 espaces et un seul U.</p>`},
 {src:"CC PEIP février 2023, sujet 2 · Ex. 4 · 4 pts",t:"UnPos",en:"Écrire une fonction UnPos qui, étant donné un tableau T d'entiers, renvoie true si T contient au moins un entier positif, false sinon.",go:"a-tableaux",who:"Mon corrigé",
  sol:`${C(`FONCTION : UnPos (E T : tableau d'entiers) : booléen
SPÉCIFICATIONS : renvoie true si T contient au moins un entier positif, false sinon.
DÉBUT
    pour i de 0 à taille(T)-1 faire
        si T[i] > 0 alors
            Renvoyer true
        fin si;
    fin pour;
    Renvoyer false
FIN`)}<p>C'est le schéma « il existe » : true dès qu'on en trouve un, false après la boucle. Si pour ton prof 0 est positif, écris T[i] ≥ 0 et dis-le dans les spécifications.</p>`},
 {src:"CC PEIP février 2023, sujet 2 · Ex. 5 · 4 pts",t:"touslesPos : d'une liste à une liste",en:"Écrire une fonction touslesPos qui, étant donné une liste L d'entiers, renvoie la liste des éléments positifs de L, dans le même ordre que dans L.",go:"a-listes-rec",who:"Mon corrigé",hint:"Le schéma récursif : liste vide, sinon on garde ou non la tête, et on rappelle sur la queue.",
  sol:`${C(`FONCTION : touslesPos (E L : liste d'entiers) : liste d'entiers
SPÉCIFICATIONS : renvoie la liste des éléments positifs de L, dans le même ordre.
DÉBUT
    si estVide(L) alors
        Renvoyer [ ]
    sinon si tête(L) > 0 alors
        Renvoyer cons(tête(L), touslesPos(queue(L)))
    sinon
        Renvoyer touslesPos(queue(L))
    fin si;
FIN`)}<p>En récursif, l'ordre est gardé tout seul : la tête est remise devant le résultat de la queue.</p>`},
 {src:"CC PEIP février 2023, sujet 3 · Cours · 2 pts",t:"Variables dans un récursif ; cond ou si-alors-sinon",en:"1. Une fonction récursive peut-elle utiliser des variables ? 2. Quelle est la différence entre cond et si-alors-sinon ?",who:"Mon corrigé",go:"a-bases",
  sol:`<ol><li>Oui : rien ne l'interdit. Par exemple, elle peut ranger le résultat de l'appel récursif dans une variable pour ne pas le calculer deux fois.</li><li>cond(a, b, c) est une expression, qui a une valeur ; si … alors … sinon est une instruction, qui fait exécuter un bloc ou l'autre (voir le sujet 2).</li></ol>`},
 {src:"CC PEIP février 2023, sujet 3 · Ex. 1 · 4 pts",t:"Qu'affiche G(5, 0) ?",en:`${C(`PROCÉDURE : G (E n : entier, E d : entier)
SPÉCIFICATIONS : n ∈ ℕ.
DÉBUT
    si n ≠ 0 alors
        G(n-1, d+1)
        pour i de 1 à n faire affiche(n-d) fin pour;
        aLaLigne()
    fin si;
FIN`)}<p>affiche(d) écrit d à l'écran sans retour à la ligne ; aLaLigne() passe à la ligne.</p>`,go:"a-arbre-appels",who:"Mon corrigé",hint:"Les appels : G(5, 0), G(4, 1), G(3, 2), G(2, 3), G(1, 4), G(0, 5). Chacun affiche n fois le nombre n − d.",
  sol:`<p>En remontant : G(1, 4) affiche une fois 1 − 4 = −3 ; G(2, 3) deux fois −1 ; G(3, 2) trois fois 1 ; G(4, 1) quatre fois 3 ; G(5, 0) cinq fois 5.</p>${C(`-3
-1-1
111
3333
55555`,"txt")}`},
 {src:"CC PEIP février 2023, sujet 3 · Ex. 2 · 2 pts",t:"La somme des 3 premiers est-elle paire ?",en:"L est une liste d'entiers d'au moins 3 éléments. Écrire une expression qui vaut true si la somme des 3 premiers éléments de L est paire, false sinon.",go:"a-listes",who:"Mon corrigé",
  sol:C(`(tête(L) + tête(queue(L)) + tête(queue(queue(L)))) mod 2 = 0`)},
 {src:"CC PEIP février 2023, sujet 3 · Ex. 3 · 4 pts",t:"Le motif GrandSup, sans récursivité",en:`<p>Avec affX() (un X), affB() (un espace) et alaligne(), écrire une procédure non récursive GrandSup qui affiche un « &gt; » de n lignes. Pour n = 5 :</p>${C(`X
 X
  X
 X
X`,"txt")}<p>Pour n = 4 :</p>${C(`X
 X
 X
X`,"txt")}`,go:"a-motifs",who:"Mon corrigé",hint:"Ligne i (de 1 à n) : le plus petit de i − 1 et n − i espaces, puis un X.",
  sol:`${C(`PROCÉDURE : GrandSup (E n : entier)
SPÉCIFICATIONS : n ≥ 1. Affiche un « > » de n lignes, sans récursivité.
DÉBUT
    pour i de 1 à n faire
        pour j de 1 à cond(i-1 < n-i, i-1, n-i) faire
            affB()
        fin pour;
        affX()
        alaligne()
    fin pour;
FIN`)}<p>Le nombre d'espaces monte puis redescend : c'est le plus petit de i − 1 et n − i. Pour n = 5 : 0, 1, 2, 1, 0. Pour n = 4 : 0, 1, 1, 0.</p>`},
 {src:"CC PEIP février 2023, sujet 3 · Ex. 4 · 4 pts",t:"palindrome",en:"Écrire une fonction palindrome qui, étant donné un tableau T d'entiers, renvoie true si T peut être lu dans les deux sens. palindrome([2, 3, 3, 2]) et palindrome([2, 3, 2]) renvoient true, palindrome([1, 2, 3, 4]) renvoie false.",go:"a-tableaux",who:"Mon corrigé",hint:"Compare la case i avec la case symétrique, taille(T) − 1 − i.",
  sol:`${C(`FONCTION : palindrome (E T : tableau d'entiers) : booléen
SPÉCIFICATIONS : renvoie true si T se lit de la même façon dans les deux sens.
DÉBUT
    pour i de 0 à taille(T)-1 faire
        si T[i] ≠ T[taille(T)-1-i] alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN`)}<p>S'arrêter à la moitié du tableau suffit, mais aller jusqu'au bout est juste aussi, et plus simple à écrire.</p>`},
 {src:"CC PEIP février 2023, sujet 3 · Ex. 5 · 4 pts",t:"inverse(n) = [n, n − 1, …, 0], en récursif",en:"Écrire une fonction récursive inverse qui, étant donné un entier n, renvoie la liste [n, n−1, …, 0].",go:"a-listes-rec",who:"Mon corrigé",hint:"C'est listeEntiers, l'exercice 18 du TD.",
  sol:C(`FONCTION : inverse (E n : entier) : liste d'entiers
SPÉCIFICATIONS : n ∈ ℕ. Renvoie la liste [n, n-1, …, 1, 0].
DÉBUT
    Renvoyer cond(n = 0, cons(0, [ ]), cons(n, inverse(n - 1)))
FIN`)},
 {src:"CC PEIP février 2023, sujet 4 · Cours · 2 pts",t:"tant que et pour ; tableau ou liste",en:"1. Pourquoi dit-on que la boucle tant que est plus générale que la boucle pour ? 2. Citer un cas où il est préférable d'utiliser un tableau plutôt qu'une liste.",who:"Mon corrigé",go:"a-boucles",
  sol:`<ol><li>Toute boucle pour s'écrit avec un tant que (en gérant le compteur à la main), mais pas l'inverse : avec tant que, on n'a pas besoin de connaître le nombre de tours à l'avance.</li><li>Quand il faut accéder directement à un élément par sa position, T[i] (voir le sujet 2).</li></ol>`},
 {src:"CC PEIP février 2023, sujet 4 · Ex. 1 · 4 pts",t:"Qu'affiche G(11, 0) ? (le piège)",en:`${C(`PROCÉDURE : G (E n : entier, E d : entier)
SPÉCIFICATIONS : n ∈ ℕ.
DÉBUT
    si n ≠ 0 alors
        pour i de 1 à n faire affiche(d) fin pour;
        G(n div 2, d+1)
        aLaLigne()
    fin si;
FIN`)}<p>affiche(d) écrit d à l'écran sans retour à la ligne ; aLaLigne() passe à la ligne.</p>`,go:"a-arbre-appels",who:"Mon corrigé",hint:"Ici l'affichage se fait AVANT l'appel récursif, et le retour à la ligne après.",
  sol:`<p>G(11, 0) affiche onze 0, puis appelle G(5, 1) qui affiche cinq 1, puis G(2, 2) deux 2, puis G(1, 3) un 3, puis G(0, 4) qui ne fait rien. Aucun retour à la ligne n'a encore eu lieu : tout est sur la même ligne. Ensuite seulement, les quatre aLaLigne() s'exécutent en remontant.</p>${C(`0000000000011111223
(puis trois lignes vides)`,"txt")}`},
 {src:"CC PEIP février 2023, sujet 4 · Ex. 2 · 2 pts",t:"Un des 3 premiers est-il négatif ?",en:"L est une liste d'entiers d'au moins 3 éléments. Écrire une expression qui vaut true si au moins un des trois premiers éléments de L est négatif, false sinon.",go:"a-listes",who:"Mon corrigé",
  sol:C(`tête(L) < 0 ou tête(queue(L)) < 0 ou tête(queue(queue(L))) < 0`)},
 {src:"CC PEIP février 2023, sujet 4 · Ex. 3 · 4 pts",t:"Le motif Tribord, sans récursivité",en:`<p>Avec affO() (un O), affB() (un espace) et alaligne(), écrire une procédure non récursive Tribord qui affiche ce motif de n lignes. Pour n = 5 :</p>${C(`    O
   OO
  OOO
 OOOO
OOOOO`,"txt")}`,go:"a-motifs",who:"Mon corrigé",hint:"Ligne i (de 1 à n) : n − i espaces, puis i fois O.",
  sol:C(`PROCÉDURE : Tribord (E n : entier)
SPÉCIFICATIONS : n ≥ 1. Ligne i : n − i espaces, puis i fois O.
DÉBUT
    pour i de 1 à n faire
        pour j de 1 à n-i faire
            affB()
        fin pour;
        pour j de 1 à i faire
            affO()
        fin pour;
        alaligne()
    fin pour;
FIN`)},
 {src:"CC PEIP février 2023, sujet 4 · Ex. 4 · 4 pts",t:"tousIdentiques",en:"Écrire une fonction tousIdentiques qui, étant donné un tableau T d'entiers, renvoie true si toutes les valeurs de T sont les mêmes, false sinon.",go:"a-tableaux",who:"Mon corrigé",hint:"Compare chaque case à la première.",
  sol:C(`FONCTION : tousIdentiques (E T : tableau d'entiers) : booléen
SPÉCIFICATIONS : renvoie true si toutes les valeurs de T sont les mêmes, false sinon.
DÉBUT
    pour i de 1 à taille(T)-1 faire
        si T[i] ≠ T[0] alors
            Renvoyer false
        fin si;
    fin pour;
    Renvoyer true
FIN`)},
 {src:"CC PEIP février 2023, sujet 4 · Ex. 5 · 4 pts",t:"table(n) : les 10 premiers multiples, en récursif",en:"Écrire une fonction récursive table qui, étant donné un entier n, renvoie la liste des 10 premiers multiples de n dans l'ordre. Par exemple, table(3) renvoie [0, 3, 6, 9, 12, 15, 18, 21, 24, 27].",go:"a-listes-rec",who:"Mon corrigé",hint:"Il faut un compteur k qui va de 0 à 9 : écris une fonction auxiliaire récursive à deux paramètres, que table appelle avec k = 0.",
  sol:`${C(`FONCTION : multiples (E n : entier, E k : entier) : liste d'entiers
SPÉCIFICATIONS : 0 ≤ k ≤ 10. Renvoie la liste [k×n, (k+1)×n, …, 9×n].
DÉBUT
    Renvoyer cond(k = 10, [ ], cons(k * n, multiples(n, k + 1)))
FIN

FONCTION : table (E n : entier) : liste d'entiers
SPÉCIFICATIONS : renvoie la liste des 10 premiers multiples de n, dans l'ordre.
DÉBUT
    Renvoyer multiples(n, 0)
FIN`)}<p>multiples(3, 8) = cons(24, multiples(3, 9)) = cons(24, cons(27, [ ])) = [24, 27].</p>`},
 {src:"CC1 novembre 2024 · Cours, question 1",t:"Un récursif sans cas de base",en:"Que se passe-t-il si un algorithme récursif n'a pas de cas de base ? (Les questions 2 à 5 de ce CC portaient sur les tris, la dichotomie, la complexité et les preuves, pas encore vus cette année.)",
  sol:`<p>Il se rappelle récursivement à l'infini, sans pouvoir s'arrêter.</p>`},
 {src:"CC1 novembre 2024 · Ex. 1 · 2,5 pts",t:"avantdernier(L) en pseudo-code",en:"Écrire un algorithme en pseudo-code qui renvoie l'avant-dernière valeur d'une liste d'entiers.",go:"a-listes-rec",
  sol:C(`FONCTION : avantdernier (E L : liste d'entiers) : entier
SPÉCIFICATIONS : L contient au moins 2 éléments. Renvoie l'avant-dernier élément de L.
DÉBUT
    Renvoyer cond(estVide(queue(queue(L))), tête(L), avantdernier(queue(L)))
FIN`)},
 {src:"CC1 novembre 2024 · Ex. 2 · 4 pts",t:"Arrêt et affichage de G",en:`${C(GA)}<p>1. Prouver que la procédure s'arrête (pas sûr cette année). 2. Qu'affiche G(4) ?</p>`,go:"a-arbre-appels",
  sol:`<p>1. P<sub>n</sub> : « G(n) s'arrête ». Si n ≤ 0, G fait seulement le test, donc s'arrête. Pour n ≥ 1, si P<sub>n−2</sub> et P<sub>n−1</sub> sont vraies, G(n) appelle G(n−2) et G(n−1) qui s'arrêtent et fait un affichage : P<sub>n</sub> est vraie (récurrence à deux pas).</p><p>2. G(1) : * ; G(2) : ** / * ; G(3) : * / *** / ** / * ; G(4) : ** / * / **** / * / *** / ** / *.</p>`},
 {src:"CC1 novembre 2024 · Ex. 3 · 6 pts",t:"Cartons et camions",en:"Trois tableaux L, W, H (longueurs, largeurs, hauteurs des cartons) et un volume maximal Vmax par camion. 1. Volume(L, W, H) : volume total. 2. NbCamionsMin : nombre minimal de camions si tous portent le même volume. 3. Exemple où il faut plus de camions (L = [2, 2, 2], W = H = [1, 1, 1]).",go:"a-tableaux",
  sol:`${C(`FONCTION : Volume (E L, W, H : tableaux de nombres) : nombre
SPÉCIFICATIONS : les trois tableaux ont la même taille. Renvoie le volume total des cartons.
Variable : V : nombre
DÉBUT
    V ← 0
    pour i de 0 à taille(L)-1 faire
        V ← V + L[i] * W[i] * H[i]
    fin pour;
    Renvoyer V
FIN

FONCTION : NbCamionsMin (E L, W, H : tableaux de nombres, E Vmax : nombre) : entier
DÉBUT
    Renvoyer ⌈Volume(L, W, H) / Vmax⌉
FIN`)}<p>3. Volume total 6 m³, Vmax = 3 m³ : la fonction dit 2 camions, mais un carton de 2 m³ ne se coupe pas, donc il en faut 3.</p>`},
 {src:"CC1 octobre 2022 · Cours · 3 questions sur 5",t:"Fonction et procédure, récursif et itératif, variable et paramètre",en:"1. Quelle est la différence entre une fonction et une procédure ? 2. Un algorithme peut-il être à la fois récursif et itératif ? Justifier brièvement. 3. Citer une différence entre une variable d'algorithme et un paramètre d'algorithme. (Les questions 4 et 5 portaient sur la complexité, pas encore vue cette année.)",go:"a-bases",
  sol:`<ol><li>Une fonction est un algorithme qui renvoie un résultat principal. Une procédure est un algorithme qui n'en renvoie pas.</li><li>Oui, s'il contient au moins une boucle et au moins un appel récursif.</li><li>Une variable d'algorithme est une mémoire à l'intérieur d'un algorithme. Un paramètre d'algorithme est une mémoire à l'interface de l'intérieur et de l'extérieur de l'algorithme, qui lui permet d'échanger des informations avec l'extérieur. Autres différences : déclarations séparées, initialisations séparées, le paramètre peut être en lecture seule ou en écriture seule.</li></ol>`},
 {src:"CC1 octobre 2022 · Ex. 1 · 6 pts",t:"Arya et Bran : les N premiers éléments d'un tableau",en:`<p>On veut un algorithme F qui, étant donnés un tableau de nombres T et un entier N (avec 0 ≤ N ≤ taille(T)), renvoie une liste contenant les N premiers éléments de T dans le même ordre. Par exemple, F([15, 12, 4, 9, 7], 3) renvoie la liste [15, 12, 4].</p><p>1. Donner la signature de F.</p><p>2. Arya et Bran proposent chacun un corps pour cet algorithme.</p>${C(`Solution d'Arya :
Variable : L : liste de nombres
DÉBUT
    pour i de 0 à N-1 faire
        L ← cons(T[i], L)
    fin pour;
    Renvoyer L
FIN

Solution de Bran :
DÉBUT
    Renvoyer cond(N = 0, [ ], cons(T[N-1], F(T, N-1)))
FIN`)}<p>(a) L'algorithme d'Arya renvoie-t-il un résultat ? Si non, pourquoi ? Si oui, que renvoie F([15, 12, 4, 9, 7], 3) ? (b) Mêmes questions pour Bran.</p><p>3. Corriger l'algorithme d'Arya pour qu'il renvoie le bon résultat.</p>`,go:"a-listes-rec",hint:"Regarde si L a une valeur avant le premier cons. Puis déroule Bran : F(T, 3) = cons(T[2], F(T, 2)).",
  sol:`<p>1. ${C(`FONCTION : F (E T : tableau de nombres, E N : entier) : liste de nombres`)}</p><p>2. (a) La solution d'Arya ne renvoie pas de résultat : la liste L n'est pas initialisée, donc pour i = 0, cons(T[i], L) ne fonctionne pas. Si L était initialisée avec la liste vide, elle renverrait [4, 12, 15], à l'envers.</p><p>(b) L'algorithme de Bran renvoie [4, 12, 15] : F(T, 3) = cons(T[2], F(T, 2)) = cons(4, cons(12, cons(15, [ ]))). C'est aussi à l'envers.</p><p>3. cons ajoute devant : il faut parcourir le tableau en partant de la fin.</p>${C(`Variable : L : liste de nombres
DÉBUT
    L ← [ ]
    pour i de N-1 à 0 par pas de -1 faire
        L ← cons(T[i], L)
    fin pour;
    Renvoyer L
FIN`)}`},
 {src:"CC1 octobre 2022 · Ex. 2 · 4 pts",t:"insereFin, en récursif et en itératif",en:"Écrire un algorithme en pseudo-code insereFin qui, étant donnés une liste de nombres L et un nombre x, renvoie une nouvelle liste constituée des éléments de L suivis de x. Par exemple, insereFin([3, 5, 9], 12) renvoie [3, 5, 9, 12]. Seules les fonctions du cours sont permises : tête, queue, cons, estVide. La liste vide est notée [ ]. (L'exercice 3 portait sur un invariant, pas encore vu cette année.)",go:"a-listes-rec",hint:"Récursif : si L est vide, la réponse est la liste [x] ; sinon on garde la tête et on insère x à la fin de la queue.",
  sol:`${C(`FONCTION : insereFin (E L : liste de nombres, E x : nombre) : liste de nombres
SPÉCIFICATIONS : renvoie la liste des éléments de L suivis de x.
DÉBUT
    Renvoyer cond(estVide(L), cons(x, [ ]), cons(tête(L), insereFin(queue(L), x)))
FIN`)}<p>Version itérative du corrigé officiel : on renverse L dans Q, on met x devant, puis on renverse à nouveau.</p>${C(`Variable : P, Q : listes de nombres
DÉBUT
    P, Q ← L, [ ]
    tant que non estVide(P) faire
        Q ← cons(tête(P), Q)
        P ← queue(P)
    fin tq;
    Q ← cons(x, Q)
    tant que non estVide(Q) faire
        P ← cons(tête(Q), P)
        Q ← queue(Q)
    fin tq;
    Renvoyer P
FIN`)}`}];

/* ---------- quiz ---------- */
const quiz=[
 {q:"Quelle est la différence entre cond et si-alors-sinon ?",o:["cond est une expression, qui a une valeur ; si-alors-sinon est une instruction","Aucune : ce sont deux écritures de la même chose, l'une plus courte","cond ne marche qu'avec des entiers ; si-alors-sinon marche avec tout","si-alors-sinon a une valeur ; cond est une instruction, sans valeur"],a:0,e:"PEIP 2023, sujets 2 et 3. cond(a, b, c) vaut b ou c ; si … alors … sinon fait exécuter un bloc ou l'autre.",link:"a-expressions"},
 {q:"Dans quel cas un tableau est-il préférable à une liste ?",o:["Quand il faut accéder directement à l'élément numéro i","Quand on veut ajouter un élément devant","Quand on ne se sert que du premier élément","Jamais : une liste fait tout ce que fait un tableau"],a:0,e:"PEIP 2023, sujets 2 et 4. T[i] donne n'importe quelle case ; sur une liste, on n'accède qu'à la tête.",link:"a-listes"},
 {q:"Quelle est la différence entre une variable et un paramètre d'algorithme ?",o:["La variable est une mémoire à l'intérieur de l'algorithme ; le paramètre échange des informations avec l'extérieur","Aucune : un paramètre est une variable comme les autres, déclarée ailleurs","Le paramètre se déclare dans la ligne « Variable : », la variable dans la signature","Une variable est toujours un entier, un paramètre peut être de n'importe quel type"],a:0,e:"Question 3 du CC 2022. Un paramètre est donné par celui qui appelle l'algorithme (ou lui est rendu, avec S ou ES) : c'est par lui que l'algorithme échange avec l'extérieur. Une variable est une mémoire de travail, déclarée dans « Variable : », qui n'existe que pendant l'exécution et que l'extérieur ne voit pas.",link:"a-bases"},
 {q:"Que se passe-t-il si un algorithme récursif n'a pas de cas de base ?",o:["Il renvoie 0","Il se rappelle à l'infini","Il devient itératif","Il renvoie une erreur de type"],a:1,e:"Question 1 du CC1 2024. Le cas de base est le seul endroit où l'algorithme répond sans se rappeler. Sans lui, chaque appel lance un nouvel appel, qui en lance un autre, sans fin. En pratique, le programme finit par planter quand la mémoire est pleine.",link:"a-recursif"},
 {q:"Quelle est la différence entre une fonction et une procédure ?",o:["Une fonction a des paramètres, pas une procédure","Une fonction renvoie un résultat principal, une procédure non","Une procédure est récursive","Aucune"],a:1,e:"Question 1 du CC 2022. Une FONCTION calcule un résultat et le rend avec « Renvoyer » ; on écrit le type de ce résultat au bout de la signature. Une PROCÉDURE ne renvoie rien : elle agit, par exemple elle affiche ou modifie un paramètre ES.",link:"a-bases"},
 {q:"Un algorithme peut-il être à la fois récursif et itératif ?",o:["Non, jamais","Oui, s'il contient une boucle et un appel récursif","Seulement en Python","Seulement s'il n'a pas de cas de base"],a:1,e:"Question 2 du CC 2022. Oui : « récursif » veut dire qu'il s'appelle lui-même, « itératif » qu'il contient une boucle. Rien n'empêche les deux à la fois, par exemple une procédure qui affiche une ligne avec une boucle pour, puis s'appelle avec n − 1.",link:"a-recursif"},
 {q:"Une fonction récursive peut-elle utiliser des variables ?",o:["Non, jamais","Oui","Seulement des paramètres ES","Seulement si elle n'a pas de cas de base"],a:1,e:"Sujet PEIP 2023. Oui : chaque appel a ses propres variables, déclarées dans « Variable : » comme d'habitude. Elles ne sont pas partagées entre les appels : chaque appel a sa copie.",link:"a-bases"},
 {q:"Dans « pour i de 0 à taille(T)-1 faire », faut-il déclarer i dans « Variable : » ?",o:["Oui, toujours : i change de valeur à chaque tour","Non : l'indice d'une boucle pour n'est pas une variable","Seulement si T est vide : sinon la boucle déclare i","Oui, comme le compteur d'une boucle tant que"],a:1,e:"Cours p. 11 : l'indice de boucle et les paramètres ne sont pas des variables. Le compteur d'une boucle tant que, lui, se déclare : c'est une vraie variable.",link:"a-pseudo"},
 {q:"Comment se ferme une boucle tant que dans le cours ?",o:["fin si;","fin pour;","fin tq;","FIN"],a:2,e:"Chaque bloc se ferme avec le mot de son ouverture : si … fin si; pour … fin pour; tant que … fin tq;. Pour une boucle tant que, c'est donc « fin tq; », avec le point-virgule. FIN, en majuscules, ferme l'algorithme entier, pas une boucle.",link:"a-pseudo"},
 {q:"Dans une fonction qui calcule une somme sur un tableau, où va « Renvoyer som » ?",o:["Juste après DÉBUT","Dans la boucle","Après fin pour;","Avant la boucle"],a:2,e:"Renvoyer arrête tout de suite l'algorithme. Dans la boucle, il renverrait la somme après le premier tour seulement. Avant la boucle ou juste après DÉBUT, il renverrait une somme encore vide. Il va donc après « fin pour; », quand toutes les cases ont été ajoutées.",link:"a-pseudo"},
 {q:"Quelle signature est correcte pour une procédure ?",o:["PROCÉDURE : ligne (E n : entier) : entier","PROCÉDURE : ligne (E n : entier)","FONCTION : ligne (E n : entier)","PROCÉDURE : ligne (n)"],a:1,e:"Une procédure ne renvoie rien : pas de type de résultat. Une fonction en a toujours un.",link:"a-pseudo"},
 {q:"Que vaut cond(5 div 2 = 1, true, 0) ?",o:["true","0","erreur","false"],a:2,e:"cond(a, b, c) vaut b si a est vrai et c sinon, et b et c doivent avoir le même type. Ici b est un booléen (true) et c un entier (0) : l'expression est mal typée, c'est une erreur, quelle que soit la valeur du test. (5 div 2 vaut 2, donc le test est faux, mais on n'arrive même pas là.)",link:"a-expressions"},
 {q:"Que vaut true ou (5/0 = 1) ?",o:["erreur : division par 0","true","false","1"],a:1,e:"Évaluation paresseuse : dans « a ou b », si a vaut true, le résultat est true et b n'est pas calculé. La division par 0 n'est donc jamais faite : pas d'erreur. Dans l'autre sens, « (5/0 = 1) ou true » serait une erreur, car la division serait calculée en premier.",link:"a-expressions"},
 {q:"Que vaut 1 + 5 / 2 ?",o:["3 (entier)","3.5 (nombre)","erreur","2"],a:1,e:"La division / se fait avant l'addition et donne un nombre à virgule : 5 / 2 = 2.5, puis 1 + 2.5 = 3.5, de type nombre. Avec div, on aurait le quotient entier : 1 + 5 div 2 = 1 + 2 = 3.",link:"a-expressions"},
 {q:"Pourquoi la boucle tant que est-elle plus générale que la boucle pour ?",o:["Elle est plus rapide : elle s'arrête dès que la condition change","On n'a pas besoin de connaître le nombre de tours à l'avance","Elle n'a pas de condition : elle tourne jusqu'à un Renvoyer","Elle est récursive : elle peut s'appeler elle-même"],a:1,e:"Question 2 du sujet PEIP 2023. Une boucle pour exige de connaître le nombre de tours au départ (de a à b). Une boucle tant que s'arrête quand une condition devient fausse : elle marche même quand on ne sait pas d'avance combien de tours il faudra. Et toute boucle pour peut s'écrire avec un tant que.",link:"a-boucles"},
 {q:"Un triangle inversé de côté n a n étoiles sur sa première ligne et une seule sur la dernière. Sur la ligne i (de 1 à n), combien d'étoiles ?",o:["i","n − i","n − i + 1","i − 1"],a:2,e:"On vérifie sur les deux bouts : la ligne 1 doit donner n étoiles, et la ligne n une seule. n − i + 1 donne bien n pour i = 1, et 1 pour i = n. Avec n − i, la dernière ligne serait vide ; avec i, le triangle serait à l'endroit.",link:"a-motifs"},
 {q:"Avec T = [3, 8, 5, 9], que renvoie ce bloc ?",o:["2","3","4","17"],a:0,e:"Seuls 8 et 9 sont strictement plus grands que 5 : le compteur vaut 2.",link:"a-tableaux",code:`cpt ← 0
pour i de 0 à taille(T)-1 faire
    si T[i] > 5 alors
        cpt ← cpt + 1
    fin si;
fin pour;
Renvoyer cpt`},
 {q:"Ce bloc doit répondre true si T contient au moins un nombre négatif. Avec T = [4, −1, 7], que renvoie-t-il ?",o:["false : il répond après avoir regardé seulement T[0]","true : il trouve −1 au deuxième tour","Il ne renvoie rien : aucun Renvoyer n'est atteint"],a:0,e:"Renvoyer arrête tout l'algorithme. Au premier tour, T[0] = 4 n'est pas négatif : il renvoie false sans regarder −1. « Renvoyer false » doit être après la boucle, sans sinon.",link:"a-tableaux",code:`pour i de 0 à taille(T)-1 faire
    si T[i] < 0 alors
        Renvoyer true
    sinon
        Renvoyer false
    fin si;
fin pour;`},
 {q:"Avec T = [4, 9, 2, 7], que vaut m juste après le tour i = 2 ?",o:["9","2","4","7"],a:0,e:"m garde le plus grand vu jusqu'ici : 4 au départ, 9 au tour i = 1. Au tour i = 2, T[2] = 2 n'est pas plus grand que 9 : m reste à 9.",link:"a-tableaux",code:`m ← T[0]
pour i de 1 à taille(T)-1 faire
    si T[i] > m alors
        m ← T[i]
    fin si;
fin pour;
Renvoyer m`},
 {q:"Avec T = [5, 5, 5], que renvoie ce bloc ?",o:["[5, 6, 7]","[6, 7, 8]","[5, 5, 5]","[0, 1, 2]"],a:0,e:"Chaque case de R reçoit T[i] + i : R[0] = 5 + 0 = 5, R[1] = 5 + 1 = 6, R[2] = 5 + 2 = 7. Le bloc renvoie donc [5, 6, 7]. Les indices commencent à 0 : c'est pour ça que la première case garde sa valeur.",link:"a-tableaux",code:`Variable : R : tableau de taille(T) nombres
pour i de 0 à taille(T)-1 faire
    R[i] ← T[i] + i
fin pour;
Renvoyer R`},
 {q:"Comment obtenir le nombre de colonnes d'un tableau 2D T ?",o:["taille(T) : le nombre de cases","taille(T[i]), ou taille(T[0])","taille(T) − 1 : le dernier indice","T[i] : la ligne i entière"],a:1,e:"taille(T) est le nombre de lignes ; toutes les lignes ont la même taille.",link:"a-tableaux-2d"},
 {q:"Jeu de la vie : chaque case de la grille G vit ou meurt selon le nombre de ses voisines vivantes. Pourquoi calculer la génération suivante dans un nouveau tableau H ?",o:["Pour aller plus vite","Sinon on lirait des cases déjà modifiées","Parce que G est un paramètre S","Ce n'est pas nécessaire"],a:1,e:"Chaque case doit compter ses voisines de la génération actuelle.",link:"a-tableaux-2d"},
 {q:"Que vaut tête(queue([2, 3, 2, 4])) ?",o:["2","3","[3, 2, 4]","erreur"],a:1,e:"On calcule de l'intérieur vers l'extérieur. queue enlève le premier élément : queue([2, 3, 2, 4]) = [3, 2, 4]. Puis tête prend le premier élément de cette liste : 3. La réponse [3, 2, 4] oublie d'appliquer tête.",link:"a-listes"},
 {q:"Que vaut estVide(tête([2, 3])) ?",o:["true","false","erreur de type","[3]"],a:2,e:"tête([2, 3]) vaut 2 : c'est un nombre, pas une liste. Or estVide attend une liste : on ne peut pas l'appliquer à un nombre. C'est une erreur de type, comme dans l'exercice 17 du TD 5.",link:"a-listes"},
 {q:"Comment tester qu'une liste L a un seul élément ?",o:["taille(L) = 1","estVide(queue(L))","L[1] = [ ]","tête(L) = queue(L)"],a:1,e:"Une liste d'un seul élément, c'est une tête et plus rien derrière : sa queue est la liste vide, donc estVide(queue(L)) vaut true. taille(L) et L[1] sont réservés aux tableaux : sur une liste, on n'a que tête, queue, cons et estVide.",link:"a-listes"},
 {q:"On empile 1, 2, 3, puis on dépile une fois. Que renvoie depiler ?",o:["1","2","3","[1, 2]"],a:2,e:"Une pile, c'est « dernier arrivé, premier sorti » : on ne peut retirer que l'élément du dessus. Le dernier empilé est 3, donc depiler renvoie 3, et il reste 1 et 2 dans la pile.",link:"a-piles-files"},
 {q:"P est une pile. Que vaut « empiler(P[1], P) » ?",o:["le 2e élément est empilé une deuxième fois","erreur : pas d'indice sur une pile","le sommet est dupliqué, car P[1] est le sommet","rien ne change : P[1] est déjà dans la pile"],a:1,e:"Une pile n'a pas d'indices : on ne peut lire que son sommet. Écrire P[1] est une erreur.",link:"a-piles-files"},
 {q:"On veut que la pile P se retrouve dans l'ordre inverse, en s'aidant de deux piles vides Q et R. Un transvasement vide entièrement une pile dans une autre. Combien de transvasements faut-il ?",o:["1","2","3","4"],a:2,e:"Chaque transvasement inverse l'ordre. P vers Q : inversé, mais dans Q. Q vers R : remis à l'endroit. R vers P : inversé, et de retour dans P. Il en faut donc 3.",link:"a-piles-files"},
 {diag:false,q:"128 chevaux sont rangés par ordre de taille. On cherche celui qui a une taille donnée, en mesurant un cheval à la fois. Avec la meilleure méthode, combien de mesures faut-il au maximum ?",o:["128","64","7","1"],a:2,e:"Recherche dichotomique : chaque mesure divise par deux le nombre de chevaux possibles, et 128 = 2⁷.",link:"a-recherche"},
 {q:"Un algorithme en Θ(n³) peut-il être un million de fois plus lent qu'un autre en Θ(n³) ?",o:["Non : avec la même complexité, ils font le même nombre d'opérations","Oui : Θ ne tient pas compte de la constante placée devant n³","Seulement pour les petites valeurs de n, pas quand n est grand","Seulement si l'un des deux est récursif et l'autre itératif"],a:1,e:"Oui, si par exemple le premier fait 1000000n³ opérations et le deuxième n³ opérations : c'est la réponse du corrigé officiel du CC1 de novembre 2024. Le quotient des deux vaut 1000000, un nombre strictement positif, donc les deux sont en Θ(n³). L'écart d'un million vaut pour tous les n, pas seulement les petits, et il n'a rien à voir avec le fait d'être récursif.",link:"a-complexite"},
 {diag:false,q:"Luc veut ranger ses vaisseaux par ordre de taille, et il ne peut que permuter deux vaisseaux voisins. Quel tri du cours convient ?",o:["Tri par sélection","Tri à bulles","Tri par valeurs","Dichotomie"],a:1,e:"Le tri à bulles n'échange que des voisins.",link:"a-tri-bulles"}];

/* ---------- pages ---------- */
const feuille=({sec})=>`<div class="title-row"><h1>Ma feuille à recopier</h1></div>
<p class="lead">Pas d'imprimante : cette feuille est faite pour être recopiée à la main, en écrivant gros. Chaque ligne du modèle est une ligne de ta feuille (32 caractères au plus). Pour le CC2 du jeudi 26 novembre : les preuves au recto, la complexité au verso.</p>
${sec(1,"Quel format",`<p>C'est confirmé par le mail du responsable de l'UE (24/9) : pour chaque CC, une feuille <b>A5 recto-verso</b>, <b>écrite à la main</b> (pas de photocopie). Une A5, c'est une feuille A4 pliée en deux, tenue en hauteur.</p><p>Tu refais une feuille pour chaque CC. Celle du CC2 est ci-dessous ; celle du CC1 est gardée en bas de la page.</p>`)}
${sec(2,"CC2, recto : prouver (24 lignes)",C(`BOUCLE, 4 étapes
1 Éq. d'itération (vérité) :
  x0 = ..  et  xi = ..x(i-1)..
2 Invariant (hypothèse) :
  Inv_i « xi = .. » (voir trace)
3 Init : x0 = .. : Inv_0 vrai.
  Réc : si Inv_(i-1) vrai, alors
  xi = ..x(i-1).. = .. : Inv_i
  vrai. Concl : l'invariant est
  vrai à toutes les itérations.
4 Fin : i=n, renvoie .. : valide
ARRÊT (tant que) : « L'entier ..
 vaut .. au début et décroît
 strictement à chaque itération.
 Le tant que s'arrête quand .. :
 au plus .. itérations, donc un
 nombre fini : il s'arrête. »
RÉCURSIF. Base : F(0) renvoie ..
 donc se termine : bon résultat.
 Hérédité : si F(n-1) se termine
 et renvoie .., alors F(n) fait
 des op. élém. + appels F(n-1) :
 se termine et renvoie .. : bon.
 Concl : vrai pour tout n.`,"txt"))}
${sec(3,"CC2, verso : compter et complexité (24 lignes)",C(`COMPTER : 1 pour ←, calcul,
 comparaison, appel, case T[i]
 ligne dans un pour de 1 à n: ×n
 tant que : test fait tours + 1
RÉCURSIF : T0=.., Tn = c+T(n-1)
 donne Tn = T0 + c×n
 Tn = 2T(n-1)+c : Un = Tn+c est
 géométrique, Un = U0 × 2^n
 n div 2 : log2(n) appels
1+2+..+n = n(n+1)/2
1²+2²+..+n² = n(n+1)(2n+1)/6
ORDRE : Tn/Rn tend vers a>0 : θ
 vers 0 : o     vers +∞ : ω
 O = o ou θ     Ω = ω ou θ
 1, log n, n, n log n, n², n³,
 2^n, n! : de plus en plus vite
 3n²+5n = θ(n²) : plus gros
 terme, sans le nombre devant
 1000000n³ = θ(n³) aussi
MASTER : T(n) ≤ aT(n/b) + O(n^d)
 a appels, taille ÷b, n^d à côté
 b^d > a : O(n^d)
 b^d = a : O(n^d log n)
 b^d < a : O(n^(log a / log b))`,"txt"))}
${sec(4,"Comment lire la feuille du CC2",`<ul><li><b>« .. »</b> remplace ce que tu écris toi-même le jour du CC : une valeur, une formule, le nom d'une variable.</li><li><b>x0, xi, x(i-1)</b> : x<sub>0</sub> est la valeur de la variable x avant la boucle, x<sub>i</sub> sa valeur à la fin de l'itération numéro i, x<sub>i−1</sub> sa valeur à la fin de l'itération d'avant. Mets le nom de ta variable à la place de x (res, k, Z…).</li><li><b>Inv_i</b> : l'invariant au rang i, c'est-à-dire la phrase « x<sub>i</sub> = … ». « Init », « Réc » et « Concl » sont les trois temps de la preuve par récurrence : initialisation, récurrence, conclusion.</li><li><b>Le bloc ARRÊT</b> est la phrase du corrigé officiel de janvier 2023, avec des trous. « L'entier .. » : la quantité qui diminue. C'est souvent une variable du test, parfois une somme (a + b), ou un écart comme n − i quand la variable i monte vers n.</li><li><b>Le bloc RÉCURSIF</b> est le plan du corrigé officiel de janvier 2023. « op. élém. » : opérations élémentaires. Si le cas de base de l'énoncé est n = 1, écris F(1) à la place de F(0).</li><li><b>COMPTER</b> : la convention du cours (diapos 69 à 72). « ×n » : une ligne placée dans un pour de 1 à n est comptée n fois. « tours + 1 » : le test d'un tant que est fait une fois de plus que le nombre de tours, car la dernière fois il est faux. On ne compte ni la gestion du pour, ni la ligne Renvoyer.</li><li><b>T0, Tn, T(n-1)</b> : T<sub>0</sub>, T<sub>n</sub> et T<sub>n−1</sub>, les nombres d'opérations. « Tn = c+T(n-1) » : chaque appel fait c opérations, puis un appel au rang n − 1 ; on ajoute c à chaque rang (suite arithmétique). « Tn = 2T(n-1)+c » : deux appels au rang n − 1 ; la suite U<sub>n</sub> = T<sub>n</sub> + c est multipliée par 2 à chaque rang (suite géométrique), donc T<sub>n</sub> = U<sub>0</sub> × 2<sup>n</sup> − c.</li><li><b>2^n, n^d, b^d</b> : 2<sup>n</sup>, n<sup>d</sup>, b<sup>d</sup>. Le signe « ^ » veut dire « puissance », comme dans le pseudo-code du cours. « log2(n) » : le nombre de fois qu'on peut diviser n par 2 avant d'arriver à 1.</li><li><b>ORDRE</b> : on divise T<sub>n</sub> par la suite de référence R<sub>n</sub> et on regarde ce que devient le quotient quand n devient très grand.</li><li><b>MASTER</b> : « ÷b » : la taille de l'entrée est divisée par b à chaque appel. « n^d à côté » : O(n<sup>d</sup>) opérations en plus des appels récursifs (d = 0 s'il n'y a pas de boucle, d = 1 pour une boucle de n tours, d = 2 pour deux boucles imbriquées de n tours).</li></ul><p>Chaque bloc est expliqué dans une leçon : <a href="#/lecon/algo/a2-invariant">prouver une boucle</a>, <a href="#/lecon/algo/a2-recursif">prouver un algorithme récursif</a>, <a href="#/lecon/algo/a2-compter">compter les opérations</a>, <a href="#/lecon/algo/a2-notations">l'ordre de complexité</a>, <a href="#/lecon/algo/a2-boucles">le master theorem</a>. Les réponses officielles aux questions de cours déjà posées sont sur la page <a href="#/algo/p/aucasou">Questions de cours déjà tombées</a>.</p><p>Une fois la feuille recopiée, fais un exercice de l'onglet « S'entraîner » avec elle sous les yeux : tu verras tout de suite s'il te manque une ligne.</p>`)}
${sec(5,"La feuille du CC1, pour mémoire",`<p>Le CC2 peut reprendre ce qui précède. S'il te reste de la place, reprends ici les lignes dont tu n'es pas sûr. « .. » remplace ce que tu écris toi-même. « f(L)=cond(…) » est le modèle d'une fonction récursive sur une liste : la valeur du cas de base, puis un calcul avec le premier élément et l'appel sur le reste. « affiche » : pour trouver ce qu'affiche une procédure récursive G, calcule d'abord G(1), G(2), G(3) dans l'ordre des instructions.</p>${C(`FONCTION: f(E x: entier): entier
SPÉCIFICATIONS: ce que f renvoie
Variable: s: entier
 (ni paramètres, ni i du pour)
DÉBUT ... Renvoyer s FIN
PROCÉDURE: ni type ni Renvoyer
si c alors .. sinon .. fin si;
pour i de a à b faire..fin pour;
tant que c faire .. fin tq;
cond(a,b,c) = b si a, sinon c
 (b et c du même type)
7 div 2=3  7 mod 2=1  7/2=3,5
T: indices 0 à taille(T)-1
somme: s←0 avant, Renvoyer après
tous: Renvoyer false dans la
 boucle, Renvoyer true après
tête(L) queue(L) cons(x,L)
estVide(L)
1 seul élt: estVide(queue(L))
f(L)=cond(estVide(L), base,
   ..tête(L)..f(queue(L)))
récursif: cas de base + appel
 sur plus petit (n-1, queue)
affiche: fais G(1),G(2),G(3)`,"txt")}${C(`NOUVEAU TABLEAU
Variable: R: tableau de
 taille(T) nombres
pour i.. R[i] ← ..  Renvoyer R
2D: T[i][j]  lignes: taille(T)
 colonnes: taille(T[0])
DICO: D['clé']
 pour k dans D faire..fin pour;
 si k dans D alors
PILE: empiler(e,P) depiler(P)
 dernier arrivé, 1er sorti
FILE: enfiler(e,F) defiler(F)
 1er arrivé, 1er sorti
MOTIF ligne i: nb d'espaces et
 d'étoiles selon i et n, puis
 passer à la ligne
E entrée  S sortie  ES modifié
true ou (5/0=1) vaut true
LISTE avec une boucle:
 M←L; tant que non estVide(M)
 faire .. M←queue(M) fin tq;
tableau→liste, même ordre:
 de la fin, L←cons(T[i],L)`,"txt")}`)}`;
const recettes=({sec})=>`<div class="title-row"><h1>Recettes pas à pas</h1></div><p class="lead">Le CC est sur papier. Ces étapes te font gagner les points de forme, même quand tu n'es pas sûr du fond.</p>
 ${sec(1,"Écrire un algorithme en 6 étapes",`<div class="recipe"><ol>
  <li><b>La signature.</b> FONCTION ou PROCÉDURE ? Les paramètres : E, S ou ES, nom, type. Le type du résultat (fonction seulement). <a href="#/c/a-pseudo">Fiche</a></li>
  <li><b>Les spécifications</b>, en une phrase : ce que l'algorithme suppose (« L non vide ») et ce qu'il renvoie.</li>
  <li><b>Les variables</b> : chaque mémoire de travail avec son type. Pas l'indice d'une boucle pour, pas les paramètres.</li>
  <li><b>Le corps</b> : choisis le schéma. Accumuler (somme, compte), chercher (tous, il existe), fabriquer (un tableau, une liste), ou récursif (cas de base, puis appel sur plus petit).</li>
  <li><b>Ferme chaque bloc</b> : fin si; fin pour; fin tq;, aligné sous son ouverture. Trace un trait de chaque pour à son fin pour; pour voir ce qui est répété.</li>
  <li><b>Déroule un petit exemple</b> à la main, en tableau (une colonne par variable). Vérifie les bords : première et dernière case, liste vide.</li></ol></div>`)}
 ${sec(2,"Trouver ce qu'affiche un algorithme récursif",`<div class="recipe"><ol><li>Repère le cas où rien ne s'affiche (souvent n ≤ 0 ou n = 0).</li><li>Calcule ce qu'affichent G(1), puis G(2), puis G(3), en suivant l'ordre des instructions.</li><li>Pour G(n), remplace chaque appel par ce que tu as déjà trouvé.</li><li>Écris les résultats intermédiaires sur ta copie : ils montrent ta méthode.</li></ol><p>Entraîne-toi dans la fiche <a href="#/c/a-arbre-appels">Tracer un affichage récursif</a>.</p></div>`)}
 ${sec(3,"Choisir le bon schéma",`<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>L'énoncé demande</th><th>Ce que tu écris</th></tr></thead><tbody>
  <tr><td>une somme, un produit, un nombre de…</td><td>accumulateur à 0 (ou 1 pour un produit) avant la boucle, mis à jour dedans, Renvoyer après</td></tr>
  <tr><td>« tous les éléments… »</td><td>dans la boucle : si contre-exemple alors Renvoyer false fin si; ; après la boucle : Renvoyer true</td></tr>
  <tr><td>« il existe un élément… »</td><td>dans la boucle : si trouvé alors Renvoyer true fin si; ; après : Renvoyer false</td></tr>
  <tr><td>un nouveau tableau</td><td>Variable : R : tableau de taille(T) …, une boucle qui remplit R[i], Renvoyer R</td></tr>
  <tr><td>un tableau 2D</td><td>pour i de 0 à taille(T)-1 faire pour j de 0 à taille(T[i])-1 faire …</td></tr>
  <tr><td>une liste, en récursif</td><td>cond(estVide(L), cas de base, … tête(L) … f(queue(L)) …)</td></tr>
  <tr><td>une liste dans l'ordre d'un tableau</td><td>pour i de taille(T)-1 à 0 par pas de -1 faire L ← cons(T[i], L) fin pour;</td></tr>
  <tr><td>une figure d'étoiles</td><td>ligne i : combien d'espaces, combien d'étoiles ; une boucle par morceau, affRL() à la fin de la ligne</td></tr></tbody></table></div>`)}
 ${sec(4,"Avant de rendre ta copie",`<div class="paper"><b>Pour chaque algorithme, vérifie :</b><ul><li>la signature complète (E/S, types, type du résultat pour une fonction, rien pour une procédure) ;</li><li>les spécifications ;</li><li>chaque variable déclarée et initialisée avant d'être utilisée ;</li><li>chaque si, pour, tant que fermé au bon endroit (fin si; fin pour; fin tq;) ;</li><li>dans un tant que, la variable du test change bien dans la boucle ;</li><li>les indices de 0 à taille(T) − 1 ;</li><li>le Renvoyer au bon endroit (après la boucle, sauf recherche) ;</li><li>en récursif : un cas de base, et un appel sur plus petit.</li></ul></div>`)}`;
const aucasou=({sec})=>`<div class="title-row"><h1>Questions de cours déjà tombées</h1></div><p class="lead">Les questions de cours des CC de 2022 et de novembre 2024 sur les preuves et la complexité, avec la réponse du corrigé officiel. Elles valent 1 à 1,5 point chacune et se préparent par cœur : cache la réponse, écris-la sur une feuille, puis compare mot pour mot.</p>
 ${sec(1,"Les questions, avec la réponse du corrigé officiel",`<ul><li><b>« Dans une preuve de validité d'un algorithme itératif, à quoi servent les équations de récurrence ? »</b> (CC1 de novembre 2024 ; cette année le cours les appelle « équations d'itération »)<br>Elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables. Elles permettent de montrer qu'un invariant est héréditaire, c'est à dire que s'il est vrai à l'itération n, alors il est vrai à l'itération n+1.</li><li><b>« Un algorithme de complexité Θ(n³) peut-il être un million de fois plus lent qu'un autre algorithme de complexité Θ(n³) ? Justifier. »</b> (CC1 de novembre 2024 ; les trois autres sujets posaient la question avec Θ(n²) et un million, Θ(n.log(n)) et mille, Θ(log(n)) et mille)<br>Oui, si par exemple le premier fait 1000000n³ opérations et le deuxième n³ opérations.</li><li><b>« À quoi sert le master theorem ? »</b> (CC de 2022)<br>Il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel.</li><li><b>QCM du CC de 2022</b>, sur deux suites strictement positives (a<sub>n</sub>) et (b<sub>n</sub>) : « si a<sub>n</sub> = θ(b<sub>n</sub>) alors a<sub>n</sub> = O(b<sub>n</sub>) » est la seule affirmation vraie (si a est du même ordre que b, alors a est dominée par b). Fausses : « si a<sub>n</sub> = o(b<sub>n</sub>) alors a<sub>n</sub> = Ω(b<sub>n</sub>) », « si a<sub>n</sub> = Ω(b<sub>n</sub>) alors a<sub>n</sub> = θ(b<sub>n</sub>) », « si a<sub>n</sub> = O(b<sub>n</sub>) alors a<sub>n</sub> = Ω(b<sub>n</sub>) ».</li><li><b>« Prouver que l'algorithme se termine »</b> (CC de 2022, boucle « Tant que i&lt;N » avec i ← i+1)<br>i est initialisé à 0 et augmente de 1 à chaque itération. Après N itérations, i = N donc la boucle se termine et l'algorithme aussi.</li><li><b>« Démontrer que la procédure se termine »</b> (examen de janvier 2023, boucle « tant que a>0 et b>0 », 2 points)<br>L'expression entière a + b vaut initialement i + j et décroît strictement à chaque itération. Comme le tant que s'arrête lorsque a ≤ 0 ou b ≤ 0, il effectue au maximum i + j itérations. Il y a donc un nombre fini d'itérations donc l'algorithme s'arrête.</li><li><b>« En admettant que cet invariant soit correct, expliquez pourquoi l'algorithme renvoie le bon résultat »</b> (CC de 2022, invariant k<sub>i</sub> = (i + 1)²)<br>À la fin du TantQue, i = N donc l'algorithme renvoie k<sub>N</sub> = (N + 1)².</li></ul><p>Les énoncés complets de ces sujets sont dans les <a href="#/algo/annales">annales</a>, en bas de la liste.</p>`)}
 ${sec(2,"Les définitions du cours à savoir écrire",`<ul><li><b>Algorithme valide</b> : il résout le problème qu'il est censé résoudre (diapo 53).</li><li><b>Équation d'itération</b> : égalité reliant les valeurs des variables d'une itération à la suivante (diapo 54).</li><li><b>Invariant de boucle</b> : propriété censée être vraie au début des itérations et à la fin de chaque itération (diapo 54).</li><li><b>Équation de récurrence</b> (algorithme récursif) : égalité reliant le résultat de l'algorithme avec celui des appels récursifs (diapo 61).</li><li><b>Invariant de récursion</b> : propriété censée être vraie à chaque appel récursif ; le plus souvent, ça revient à écrire que l'algorithme renvoie le bon résultat (diapo 61).</li><li><b>T<sub>n</sub></b> : le nombre d'opérations élémentaires, la complexité en temps. <b>V<sub>n</sub></b> : l'espace mémoire occupé, la complexité en espace (diapo 68).</li><li><b>Pire cas</b> : la configuration des données qui consomme le plus de ressources (diapo 67).</li><li><b>Ordre de complexité</b> : la suite de référence qui a la même vitesse de croissance que T<sub>n</sub> (diapo 75).</li><li><b>T<sub>n</sub> = θ(R<sub>n</sub>)</b> : T<sub>n</sub>/R<sub>n</sub> est borné entre deux nombres strictement positifs, en particulier s'il tend vers a > 0. <b>T<sub>n</sub> = o(R<sub>n</sub>)</b> : T<sub>n</sub>/R<sub>n</sub> tend vers 0. <b>T<sub>n</sub> = ω(R<sub>n</sub>)</b> : T<sub>n</sub>/R<sub>n</sub> tend vers +∞. O : o ou θ. Ω : ω ou θ (diapos 77 et 78).</li></ul>`)}
 ${sec(3,"Pour t'entraîner à les écrire",`<p>Dans l'onglet « S'entraîner », trois exercices sur papier reprennent ces questions : les équations d'itération et l'invariant, « mille fois plus lent », le master theorem. Tu écris de mémoire, puis tu coches chaque ligne du corrigé.</p><p>Pour comprendre plutôt que réciter : les leçons <a href="#/lecon/algo/a2-invariant">prouver une boucle</a>, <a href="#/lecon/algo/a2-notations">l'ordre de complexité</a> et <a href="#/lecon/algo/a2-boucles">le master theorem</a>.</p>`)}`;
const infos=({sec,exam})=>`<div class="title-row"><h1>Le CC1 d'algorithmique en bref</h1></div>
 ${sec(1,"Quand et où",`<p>Jeudi 12 novembre, sur papier. Ni l'heure ni la salle n'ont été données par mail. Le jeudi tu as deux créneaux d'algo : le TD de 15h à 16h30, puis le TP de 16h45 à 18h15. D'après un camarade (Discord, 11/11), le prof a dit que le CC serait pendant le deuxième créneau : ce n'est pas confirmé. <b>Sois dans la salle de TD habituelle à 15h</b>, avec ta feuille.</p>`)}
 ${sec(2,"Le poids",`<p>Contrôle continu intégral : 3 CC à 32 %, 34 % et 34 %. Pas d'examen de rattrapage, mais une seconde chance d'après les modalités de contrôle 2026-2027 : la note est aussi calculée sans l'épreuve à 32 %, avec la moyenne des deux autres. Coefficient 5 dans le semestre : c'est l'une des matières qui comptent le plus.</p>`)}
 ${sec(3,"Le programme",`<ul><li>D'après tes camarades : « tout ce qu'on a fait », jusqu'au TD 5 et au casse-tête des piles du cours.</li><li>TD 1 (expressions, cond, motifs), TD 2 (récursivité), TD 3 (tableaux 1D), TD 4 (tableaux 2D, jusqu'à l'exercice 15 compris), TD 5 (listes). TP : le jeu de la vie et le pendu.</li><li>Cours : jusqu'aux piles et aux files (p. 43 à 51).</li><li><b>Appris le 11 novembre</b> : le prof a déposé sur Moodle son cours annoté jusqu'à la diapo 86. La validité (prouver une boucle) et la complexité (θ, O, master theorem) ont donc été faites en amphi, mais pas en TD. Les CC de 2022 et de 2024 avaient des questions de cours sur ces chapitres, et celui de 2022 un exercice de 5 points. <b>Je ne sais pas si ça tombe cette année</b> (d'après toi, la complexité n'est pas au programme du CC1) : la page <a href="#/p/aucasou">Au cas où</a> donne 3 blocs à recopier sur ta feuille s'il y reste de la place (15 minutes), et deux leçons les expliquent si tu as le temps.</li><li>Pas encore vu en amphi : recherche dichotomique, tris. Ces fiches sont rangées à part.</li><li><b>Lu sur ton Discord le 11 novembre</b> : les CMI ont eu leur CC d'algo mardi 10. D'après une camarade, il était « assez simple », s'arrêtait aux tableaux (pas de listes, de piles ni de files) et demandait : trouver le plus petit ou le plus grand élément d'un tableau ; dérouler les appels récursifs d'un algorithme donné et dire ce qu'il fait ; faire des figures avec des étoiles. Le leur était tout en pseudo-code. Elle pense que le vôtre sera plus dur.</li><li>Trois camarades partent du principe que le vôtre porte sur les boucles, la récursivité et les tableaux à une et deux dimensions, sans listes, piles ni files. D'autres avaient dit « jusqu'au TD 5 » (les listes) : garde les listes sur ta feuille.</li><li><b>Python</b> : d'après la même camarade, un sujet peut mêler pseudo-code et Python, « ça dépend du sujet ». Les anciens sujets que j'ai sont tout en pseudo-code. Si une question est en Python, la fiche <a href="#/c/a-python">Pseudo-code et Python</a> donne la correspondance ligne à ligne.</li></ul>`)}
 ${sec(4,"Le conseil de tes camarades",`<p>« Apprends bien comment écrire du pseudo-code : ne pas oublier la signature, et mettre fin pour, fin tant que au bon endroit. » Commence par la fiche <a href="#/c/a-pseudo">Écrire un algorithme sans faute</a> et la page <a href="#/p/recettes">Recettes pas à pas</a>.</p>`)}
 ${sec(5,"Documents",`<p>Une feuille A5 recto-verso, écrite à la main, pas de photocopie (mail du responsable de l'UE, 24/9). Aucun matériel électronique. Prépare-la avec la page « Ma feuille à recopier ».</p><p style="display:flex;gap:8px;flex-wrap:wrap">${[["algo/cours_annote.pdf","Cours annoté"],["algo/td.pdf","Feuilles de TD"],["algo/cc_peip_2023.pdf","CC PEIP 2023"],["algo/cc1_2024_corr.pdf","Corrigé CC1 2024"],["algo/cc1_2022_corr.pdf","Corrigé CC 2022"]].map(f=>`<a class="btn" href="../Moodle-S1/${f[0]}" target="_blank" rel="noopener">${f[1]}</a>`).join("")}</p>`)}`;

/* ================== CC2 et CC3 (dates pas encore annoncées) ==================
   MCC 2026-2027 : 3 CC de 1 h (34 %, 34 %, 32 %), pas d'examen en janvier. Dates supposées (choix de l'utilisateur) :
   CC2 jeudi 26/11 (créneau de TD, mail du 24/9 : « entre le jeudi 26/11 et le mercredi 2/12 »), CC3 entre le lundi 14/12 et le vendredi 18/12 (supposé lundi 14/12 à 15h).
   Partage supposé : CC2 = preuves et complexité (TD 6 à 8), CC3 = recherche et tris (TD 9 et 10) ; chacun reprend aussi ce qui précède. */
const P2=o=>Object.assign(o,{ex:"cc2"}),P3=o=>Object.assign(o,{ex:"cc3"});
const EX2={"a-preuve":1,"a-complexite":1,"a-calcul-complexite":1};
concepts.forEach(c=>{if(OUT_IDS.includes(c.id)){delete c.out;c.ex=EX2[c.id]?"cc2":"cc3";c.ch=EX2[c.id]?6:7;}});

/* ---------- TD 6 à 10 : énoncés recopiés de la feuille, corrigés écrits pour le site avec la méthode du cours ---------- */
/* les exercices 24 et 34 existaient (cachés « pas au CC1 ») : ils passent au CC2 avec leur énoncé complet */
const EN24=`<p>1. Faites la trace d'exécution de la fonction g ci-dessous pour n = 5.</p>${C(`Fonction : g (E n : entier) : entier
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
Fin`)}<p>2. Donnez un invariant liant les valeurs des variables x et i et un invariant liant les valeurs des variables r et i.</p><p>3. Prouvez ces 2 invariants.</p><p>4. En déduire la valeur de la variable r à la fin du tant que. Que calcule la fonction g ?</p><p>(« i!=n » veut dire i ≠ n.)</p>`;
const SOL24=`<p><b>1.</b> Une ligne par itération ; la ligne 0 donne les valeurs avant la boucle.</p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>itération</th><th class="var">i</th><th class="var">r</th><th class="var">x</th></tr></thead><tbody><tr><td>0</td><td>0</td><td>1</td><td>0</td></tr><tr><td>1</td><td>1</td><td>0</td><td>3</td></tr><tr><td>2</td><td>2</td><td>1</td><td>6</td></tr><tr><td>3</td><td>3</td><td>4</td><td>9</td></tr><tr><td>4</td><td>4</td><td>9</td><td>12</td></tr><tr><td>5</td><td>5</td><td>16</td><td>15</td></tr></tbody></table></div><p>À la ligne 5, i = n : la boucle s'arrête et g renvoie 16. Attention à l'ordre des trois instructions : r utilise le nouvel i, mais l'ancien x.</p><p><b>2.</b> Dans la trace, x vaut toujours 3 fois i, et r vaut 1, 0, 1, 4, 9, 16 : le carré de i − 1. Invariants proposés : <b>x = 3i</b> et <b>r = (i − 1)²</b>.</p><p><b>3.</b> Méthode du cours. On note i<sub>k</sub>, r<sub>k</sub>, x<sub>k</sub> les valeurs à la fin de l'itération n° k (k = 0 : avant la boucle).</p><ul><li><b>Équations d'itération</b> (la vérité, lue sur l'algorithme) : i<sub>0</sub> = 0, r<sub>0</sub> = 1, x<sub>0</sub> = 0, puis i<sub>k+1</sub> = i<sub>k</sub> + 1, r<sub>k+1</sub> = r<sub>k</sub> + x<sub>k</sub> − i<sub>k+1</sub>, x<sub>k+1</sub> = x<sub>k</sub> + 3.</li><li><b>Invariant</b> (l'hypothèse) : Inv<sub>k</sub> : « x<sub>k</sub> = 3i<sub>k</sub> et r<sub>k</sub> = (i<sub>k</sub> − 1)² ».</li><li><b>Initialisation</b> : x<sub>0</sub> = 0 = 3 × 0 et r<sub>0</sub> = 1 = (0 − 1)². Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : on suppose Inv<sub>k</sub> vrai et on fait une itération de plus. x<sub>k+1</sub> = x<sub>k</sub> + 3 = 3i<sub>k</sub> + 3 = 3(i<sub>k</sub> + 1) = 3i<sub>k+1</sub>. Et r<sub>k+1</sub> = r<sub>k</sub> + x<sub>k</sub> − i<sub>k+1</sub> = (i<sub>k</sub> − 1)² + 3i<sub>k</sub> − (i<sub>k</sub> + 1) = i<sub>k</sub>² − 2i<sub>k</sub> + 1 + 2i<sub>k</sub> − 1 = i<sub>k</sub>² = (i<sub>k+1</sub> − 1)². Donc Inv<sub>k+1</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul><p><b>4.</b> À la fin du tant que, la condition i ≠ n est fausse : i = n. L'invariant donne r = (n − 1)². <b>La fonction g calcule (n − 1)².</b> (Vérifié par programme pour n de 0 à 29.)</p>`;
const EN34=`<p>Calculer en fonction de n la complexité en nombre d'additions des fragments suivants :</p>${C(`1) Pour i de 1 à n faire
       som ← som+1

2) Pour i de 1 à n faire
       Pour j de 1 à n faire
           som ← som+1

3) Pour i de 1 à n faire
       Pour j de 1 à n^2 faire
           Pour k de 1 à n^3 faire
               som ← som+1

4) Pour i de 1 à n faire
       Pour j de 1 à i faire
           som ← som+1

5) Pour i de 1 à n faire
       Pour j de i à n faire
           som ← som+1

6) Pour i de 1 à n faire
       som ← som+1
       Pour j de 1 à n faire
           som ← som+1`)}`;
const SOL34=`<p>Chaque exécution de « som ← som+1 » fait une addition. On compte combien de fois cette ligne est exécutée (cours, diapo 81 : compter dans un pour, c'est calculer une somme qui a les mêmes indices).</p><ol><li>i prend n valeurs : <b>n</b> additions.</li><li>Pour chacune des n valeurs de i, j prend n valeurs : n × n = <b>n²</b>.</li><li>n valeurs de i, n² valeurs de j, n³ valeurs de k : n × n² × n³ = <b>n⁶</b>.</li><li>Pour une valeur de i, j prend i valeurs : 1 + 2 + … + n = <b>n(n + 1)/2</b>.</li><li>Pour une valeur de i, j va de i à n : il prend n − i + 1 valeurs. La somme vaut n + (n − 1) + … + 1 = <b>n(n + 1)/2</b>, comme au 4.</li><li>À chaque tour de la boucle sur i : 1 addition, puis n additions dans la boucle sur j, soit n + 1. En tout n × (n + 1) = <b>n² + n</b>.</li></ol><p>Ordres de complexité : Θ(n), Θ(n²), Θ(n⁶), Θ(n²), Θ(n²), Θ(n²). (Les six formules ont été vérifiées par programme pour n de 1 à 8.)</p>`;
td.forEach(x=>{
 if(x.id==="24"){delete x.out;Object.assign(x,{ex:"cc2",s:3,note:"TD 6, preuves",t:"Trace et invariants de la fonction g",en:EN24,sol:SOL24,link:"a-preuve"});}
 if(x.id==="34"){delete x.out;Object.assign(x,{ex:"cc2",s:3,note:"TD 8, complexité",t:"Compter les additions de six fragments",en:EN34,sol:SOL34,link:"a-calcul-complexite"});}});
td.push(
 P2({id:"25",s:3,note:"TD 6, preuves",t:"Somme d'un tableau : itératif, récursif, et leurs preuves",en:`<p>Soit T un tableau d'entiers.</p><ol><li>Proposer un algorithme <b>itératif</b> qui calcule la somme des éléments de T.</li><li>Prouver la validité de votre algorithme.</li><li>Écrire un algorithme <b>récursif</b> qui, étant donné un tableau T et un entier n, calcule la somme des éléments de T entre 0 et n-1.</li><li>Prouver cet algorithme.</li><li>Avec quelle valeur de n faut-il l'appeler pour avoir la somme des valeurs de tout le tableau ?</li></ol>`,link:"a-preuve",who:"Questions 1 et 2 : algorithme et preuve du cours (diapo 60, complétée par le prof) ; questions 3 à 5 : corrigé écrit par moi",sol:`<p><b>1.</b> L'algorithme du cours :</p>${C(`FONCTION : somTab (E T : tableau d'entiers) : entier
SPÉCIFICATIONS : Renvoie la somme des valeurs de T.
Variable : res : entier
DÉBUT
    res ← T[0]
    pour i de 1 à taille(T)-1 faire
        res ← res+T[i]
    fin pour;
    Renvoyer res
FIN`)}<p><b>2.</b> On note n = taille(T), et res<sub>i</sub> la valeur de res à la fin de l'itération i (res<sub>0</sub> : avant la boucle).</p><ul><li><b>Équations d'itération</b> : res<sub>0</sub> = T[0], et res<sub>i+1</sub> = res<sub>i</sub> + T[i+1].</li><li><b>Invariant</b> : Inv<sub>i</sub> : « res<sub>i</sub> = T[0] + T[1] + … + T[i] ».</li><li><b>Initialisation</b> : avant la boucle, pour i = 0, res<sub>0</sub> = T[0], somme des valeurs de T[0] à T[0]. Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : on suppose Inv<sub>i</sub> vrai pour 0 ≤ i ≤ n − 2 et on refait une itération. Comme res<sub>i+1</sub> = res<sub>i</sub> + T[i+1] (équation d'itération) et res<sub>i</sub> = T[0] + T[1] + … + T[i] (Inv<sub>i</sub>), on a res<sub>i+1</sub> = T[0] + … + T[i] + T[i+1]. Donc Inv<sub>i+1</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul><p>À la fin du pour, l'algorithme renvoie res<sub>n−1</sub> = T[0] + … + T[n−1] par l'invariant : l'algorithme est valide.</p><p><b>3.</b></p>${C(`FONCTION : somRec (E T : tableau d'entiers, E n : entier) : entier
SPÉCIFICATIONS : 0 ≤ n ≤ taille(T). Renvoie la somme des éléments de T
                 d'indices 0 à n-1 (0 s'il n'y en a aucun).
DÉBUT
    Renvoyer cond(n=0, 0, somRec(T, n-1) + T[n-1])
FIN`)}<p><b>4.</b> Méthode du cours pour un algorithme récursif (diapo 63).</p><ul><li><b>Équations de récurrence</b> (la vérité) : somRec(T, 0) = 0, et pour n > 0, somRec(T, n) = somRec(T, n−1) + T[n−1].</li><li><b>Invariant de récursion</b> (l'hypothèse) : P<sub>n</sub> : « somRec(T, n) = T[0] + … + T[n−1] ».</li><li><b>Initialisation</b> : pour n = 0, somRec(T, 0) = 0, qui est bien la somme de zéro élément. P<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : pour n > 0, on suppose P<sub>n−1</sub> vrai : somRec(T, n−1) = T[0] + … + T[n−2]. Comme somRec(T, n) = somRec(T, n−1) + T[n−1], alors somRec(T, n) = T[0] + … + T[n−2] + T[n−1]. Donc P<sub>n</sub> est vrai.</li><li><b>Conclusion</b> : pour tout n entre 0 et taille(T), somRec(T, n) renvoie T[0] + … + T[n−1]. L'algorithme est valide.</li></ul><p><b>5.</b> Avec n = taille(T) : somRec(T, taille(T)).</p>`}),
 P2({id:"26",s:3,note:"TD 6, preuves",t:"Fibonacci itératif : quels invariants, que renvoyer ?",en:`<p>Parmi les égalités suivantes, quelles sont celles vérifiées par l'itération de l'algorithme f ci-dessous : (r1 = i), (r1 = i − 1), (r1 = fib(i)), (r2 = r1 + 1 si i ≠ 1), (r2 = fib(i + 1)) ? En déduire la valeur à renvoyer pour que l'algorithme soit correct.</p><p>Rappel : fib(0) = 0, fib(1) = 1 et fib(n) = fib(n − 1) + fib(n − 2) pour n > 1.</p>${C(`Fonction : f (E n : entier) : entier
Spécifications : n un entier strictement positif.
     Calcule et renvoie fib(n).
Variables : i, r1, r2, r3 : entier
Début
     i, r1, r2 ← 0, 0, 1
     Tant Que i < n faire
         r3 ← r1
         r1 ← r2
         r2 ← r3 + r2
         i ← i + 1
     Fin Tant Que
     Renvoyer ????
Fin`)}`,link:"a-preuve",sol:`<p><b>La trace</b> donne tout de suite la réponse (fib vaut 0, 1, 1, 2, 3, 5, 8…) :</p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>itération</th><th class="var">i</th><th class="var">r1</th><th class="var">r2</th></tr></thead><tbody><tr><td>0</td><td>0</td><td>0</td><td>1</td></tr><tr><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td>2</td><td>2</td><td>1</td><td>2</td></tr><tr><td>3</td><td>3</td><td>2</td><td>3</td></tr><tr><td>4</td><td>4</td><td>3</td><td>5</td></tr><tr><td>5</td><td>5</td><td>5</td><td>8</td></tr></tbody></table></div><ul><li>r1 = i : faux dès i = 2 (r1 = 1).</li><li>r1 = i − 1 : faux dès i = 0 (r1 = 0, pas −1).</li><li>r2 = r1 + 1 si i ≠ 1 : vrai pour i = 0, 2, 3, mais faux pour i = 4 (r2 = 5 et r1 + 1 = 4).</li><li><b>r1 = fib(i)</b> et <b>r2 = fib(i + 1)</b> : vrais sur toute la trace. Ce sont les deux invariants.</li></ul><p><b>Preuve</b> (méthode du cours). Équations d'itération : i<sub>0</sub> = 0, r1<sub>0</sub> = 0, r2<sub>0</sub> = 1 ; puis r1<sub>k+1</sub> = r2<sub>k</sub>, r2<sub>k+1</sub> = r1<sub>k</sub> + r2<sub>k</sub> (r3 garde l'ancien r1), i<sub>k+1</sub> = i<sub>k</sub> + 1.</p><ul><li>Initialisation : r1<sub>0</sub> = 0 = fib(0) et r2<sub>0</sub> = 1 = fib(1).</li><li>Récurrence : si r1<sub>k</sub> = fib(k) et r2<sub>k</sub> = fib(k + 1), alors r1<sub>k+1</sub> = r2<sub>k</sub> = fib(k + 1), et r2<sub>k+1</sub> = fib(k) + fib(k + 1) = fib(k + 2).</li><li>Conclusion : l'invariant est vrai pour toutes les itérations.</li></ul><p>À la fin du tant que, i = n, donc r1 = fib(n). Il faut écrire <b>Renvoyer r1</b>.</p>`}),
 P2({id:"27",s:2,note:"TD 6, preuves (supplémentaire)",t:"logEntier",en:`<p>Exercice supplémentaire :</p><ol><li>Faites une trace de l'algorithme logEntier ci-dessous pour a = 18.</li><li>Donnez un invariant liant les valeurs de p et de i, un autre liant q et i.</li><li>Montrez ces invariants.</li><li>Montrez que l'algorithme est correct.</li></ol>${C(`Fonction : logEntier (E a : entier) : entier
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
Fin`)}`,link:"a-preuve",sol:`<p><b>1.</b></p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>itération</th><th class="var">i</th><th class="var">p</th><th class="var">q</th></tr></thead><tbody><tr><td>0</td><td>0</td><td>1</td><td>2</td></tr><tr><td>1</td><td>1</td><td>2</td><td>4</td></tr><tr><td>2</td><td>2</td><td>4</td><td>8</td></tr><tr><td>3</td><td>3</td><td>8</td><td>16</td></tr><tr><td>4</td><td>4</td><td>16</td><td>32</td></tr></tbody></table></div><p>32 > 18 : la boucle s'arrête, l'algorithme renvoie 4. Et en effet 2⁴ = 16 ≤ 18 &lt; 32 = 2⁵.</p><p><b>2.</b> Invariants : <b>p = 2<sup>i</sup></b> et <b>q = 2<sup>i+1</sup></b>.</p><p><b>3.</b> Équations d'itération : i<sub>0</sub> = 0, p<sub>0</sub> = 1, q<sub>0</sub> = 2 ; puis p<sub>k+1</sub> = q<sub>k</sub>, q<sub>k+1</sub> = p<sub>k+1</sub> + p<sub>k+1</sub> = 2q<sub>k</sub>, i<sub>k+1</sub> = i<sub>k</sub> + 1.</p><ul><li>Initialisation : p<sub>0</sub> = 1 = 2⁰ et q<sub>0</sub> = 2 = 2¹.</li><li>Récurrence : si p<sub>k</sub> = 2<sup>k</sup> et q<sub>k</sub> = 2<sup>k+1</sup>, alors p<sub>k+1</sub> = q<sub>k</sub> = 2<sup>k+1</sup> et q<sub>k+1</sub> = 2 × 2<sup>k+1</sup> = 2<sup>k+2</sup>.</li><li>Conclusion : l'invariant est vrai pour toutes les itérations.</li></ul><p><b>4.</b> À la fin du tant que, la condition q ≤ a est fausse : a &lt; q = 2<sup>i+1</sup>. Il reste à voir que p ≤ a. S'il n'y a eu aucune itération, p = 1 ≤ a car a est strictement positif. Sinon, p est la valeur de q au tour d'avant, et ce tour n'a eu lieu que parce que q ≤ a. Dans les deux cas 2<sup>i</sup> = p ≤ a &lt; 2<sup>i+1</sup> : c'est la spécification. La boucle s'arrête bien, car q double à chaque tour et finit par dépasser a. (Vérifié par programme pour a de 1 à 2999.)</p>`}),
 P2({id:"28",s:1,note:"TD 6, preuves (supplémentaire)",t:"La procédure h",en:`<p>Exercice supplémentaire : montrez en donnant un invariant que la procédure h ci-dessous est correcte.</p>${C(`Procédure : h (E N : entier, S f : entier)
Spécifications : N positif. En fin d'exécution, f =?
Variable : n : entier
Début
     n ← N ; f ← 7!
     tant que n!=7 faire
         si n > 7 alors
             f ← f × n ; n ← n - 1
         sinon
             n ← n + 1 ; f ← f/n
         fin si
     fin Tant Que
Fin`)}<p>(7! est la factorielle de 7. Dans « n!=7 », le signe != veut dire ≠.)</p>`,link:"a-preuve",sol:`<p><b>Ce que fait h.</b> Si N > 7, on multiplie 7! par N, N − 1, …, 8 : on obtient N!. Si N &lt; 7, on divise 7! par N + 1, …, 7 : on obtient encore N!. On va donc montrer qu'en fin d'exécution <b>f = N!</b>.</p><p><b>Invariant</b> : Inv : « f × n! = 7! × N! ».</p><ul><li><b>Initialisation</b> : n = N et f = 7!, donc f × n! = 7! × N!.</li><li><b>Récurrence</b>, cas n > 7 : le nouveau f vaut f × n et le nouveau n vaut n − 1. Alors (f × n) × (n − 1)! = f × n! : le produit ne change pas.</li><li><b>Récurrence</b>, cas n &lt; 7 : le nouveau n vaut n + 1 et le nouveau f vaut f/(n + 1). Alors (f/(n + 1)) × (n + 1)! = f × n! : le produit ne change pas.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul><p>À la fin du tant que, n = 7 : f × 7! = 7! × N!, donc <b>f = N!</b>. La boucle s'arrête, car n se rapproche de 7 d'un cran à chaque tour. (Vérifié par programme pour N de 0 à 24 ; les divisions tombent toujours juste.)</p>`}),
 P2({id:"29",s:3,note:"TD 7, complexité",t:"Trier des suites par ordre de domination",en:`<p>Trier les suites ci-dessous par ordre de domination au voisinage de +∞.</p><ul><li>a<sub>n</sub> = 0.001n² − 100000n</li><li>b<sub>n</sub> = 2<sup>n/2</sup></li><li>c<sub>n</sub> = log(n² + 1)</li><li>d<sub>n</sub> = n²</li><li>e<sub>n</sub> = n²(log(3n) + 5)</li><li>f<sub>n</sub> = 3000n + 28</li><li>g<sub>n</sub> = 2<sup>n</sup> + 1</li><li>h<sub>n</sub> = 3<sup>n</sup> − 2<sup>n</sup></li></ul>`,link:"a-complexite",sol:`<p>On rattache chaque suite à une suite de référence du cours (diapo 76), en gardant le terme qui grandit le plus vite et en oubliant les constantes.</p><ul><li>c<sub>n</sub> = log(n² + 1) : comme log(n²) = 2 log(n), c'est Θ(log n).</li><li>f<sub>n</sub> = 3000n + 28 = Θ(n).</li><li>a<sub>n</sub> = 0.001n² − 100000n = Θ(n²) : a<sub>n</sub>/n² tend vers 0.001, qui est strictement positif.</li><li>d<sub>n</sub> = n² = Θ(n²) : le même ordre que a<sub>n</sub>.</li><li>e<sub>n</sub> = n²(log(3n) + 5) = Θ(n² log n), car log(3n) = log 3 + log n.</li><li>b<sub>n</sub> = 2<sup>n/2</sup> = (√2)<sup>n</sup> : exponentielle de base √2 ≈ 1,41.</li><li>g<sub>n</sub> = 2<sup>n</sup> + 1 = Θ(2<sup>n</sup>).</li><li>h<sub>n</sub> = 3<sup>n</sup> − 2<sup>n</sup> = Θ(3<sup>n</sup>), car 2<sup>n</sup>/3<sup>n</sup> tend vers 0.</li></ul><p>Du plus petit au plus grand :</p><div class="formula">c<sub>n</sub> ≺ f<sub>n</sub> ≺ a<sub>n</sub> et d<sub>n</sub> (même ordre) ≺ e<sub>n</sub> ≺ b<sub>n</sub> ≺ g<sub>n</sub> ≺ h<sub>n</sub></div><p>(« ≺ » : est strictement dominée par, ce que le cours note o.) Piège : a<sub>n</sub> est négative tant que n &lt; 100 000 000, mais c'est le comportement quand n tend vers +∞ qui compte.</p>`}),
 P2({id:"30",s:3,note:"TD 7, complexité",t:"A en θ(n²), B en θ(n log n) : lequel choisir ?",en:`<p>A et B sont deux algorithmes qui répondent au même problème. La complexité de A est θ(n²) et celle de B est θ(n log n). On implémente A et B sur un même ordinateur. L'exécution du programme correspondant à A dure 1 seconde avec n = 100, celle du programme correspondant à B dure 10s avec n = 100.</p><ol><li>Expliquer pourquoi on a besoin d'informations supplémentaires pour calculer le temps d'exécution de A et B pour différentes valeurs de n.</li><li>On fait l'approximation (raisonnable) que les temps d'exécution sont respectivement proportionnels à n² et n log(n). Calculer les coefficients de proportionnalité.</li><li>L'application prévoit n = 1000. Quel algorithme faut-il choisir ?</li><li>Même question si n = 10000.</li></ol>`,link:"a-complexite",sol:`<ol><li>θ ne donne que l'ordre de grandeur : « équivalentes » ne veut pas dire « identiques » (cours, diapo 77). Un temps en θ(n²) peut être n², 1 000 000 n² ou n² + 1 000 000. Une seule mesure ne suffit pas pour connaître la formule.</li><li>Pour A : 1 = k<sub>A</sub> × 100², donc <b>k<sub>A</sub> = 0,0001</b>. Pour B : 10 = k<sub>B</sub> × 100 × log(100). Avec le logarithme en base 10, log(100) = 2, donc <b>k<sub>B</sub> = 0,05</b>. (Avec le logarithme en base 2, k<sub>B</sub> ≈ 0,015 ; la suite ne change pas.)</li><li>n = 1000 : A met 0,0001 × 1000² = 100 s. B met 0,05 × 1000 × log(1000) = 0,05 × 1000 × 3 = 150 s. <b>Il faut choisir A.</b></li><li>n = 10000 : A met 0,0001 × 10000² = 10 000 s. B met 0,05 × 10000 × 4 = 2000 s. <b>Il faut choisir B.</b></li></ol><p>Pour n assez grand, l'algorithme d'ordre le plus petit finit toujours par gagner, même s'il part avec un mauvais coefficient.</p>`}),
 P2({id:"31",s:3,note:"TD 7, complexité",t:"Un ordinateur 100 fois plus rapide",en:`<p>On implémente un algorithme sur un ordinateur X et sur un ordinateur Y 100 fois plus rapide. On suppose que le temps d'exécution est proportionnel à n².</p><ol><li>L'ordinateur X peut traiter une taille d'entrée n<sub>0</sub> en 1 minute. Quelle taille d'entrée l'ordinateur Y peut-il traiter dans la même durée ?</li><li>Même question si le temps d'exécution est proportionnel à 2<sup>n</sup>.</li></ol>`,link:"a-complexite",sol:`<p>En 1 minute, Y fait 100 fois plus d'opérations que X.</p><ol><li>Le nombre d'opérations est proportionnel à n². On cherche n tel que n² = 100 × n<sub>0</sub>², donc <b>n = 10 n<sub>0</sub></b> : une entrée 10 fois plus grande.</li><li>On cherche n tel que 2<sup>n</sup> = 100 × 2<sup>n<sub>0</sub></sup>, donc n = n<sub>0</sub> + log<sub>2</sub>(100) ≈ n<sub>0</sub> + 6,6. Y traite seulement une taille <b>n<sub>0</sub> + 6</b> : avec un algorithme exponentiel, une machine 100 fois plus rapide ne change presque rien.</li></ol>`}),
 P2({id:"32",s:2,note:"TD 7, complexité",t:"Tri à bulles ou tri fusion, avec 1 Go de mémoire",en:`<p>On souhaite choisir un algorithme pour trier un tableau de n valeurs.</p><p>L'algorithme du tri à bulles a une complexité en temps d'environ n²/2 dans le pire des cas et n'utilise pas d'espace de stockage (à part quelques variables isolées).</p><p>L'algorithme du tri fusion a une complexité en temps d'environ n log<sub>2</sub>(n) et a besoin d'un tableau auxiliaire de n valeurs pour ses calculs. Chaque valeur du tableau occupe 2 octets.</p><p>On peut se permettre d'utiliser au plus 1Go de mémoire vive. Selon les valeurs de n, quel algorithme de tri vaut-il mieux utiliser ?</p>`,link:"a-complexite",sol:`<p><b>La mémoire.</b> 1 Go = 1 000 000 000 octets (un milliard). Le tableau à trier occupe 2n octets.</p><ul><li>Tri à bulles : seulement le tableau, 2n octets. Il faut 2n ≤ 10⁹, donc n ≤ 500 millions.</li><li>Tri fusion : le tableau et le tableau auxiliaire, 4n octets. Il faut 4n ≤ 10⁹, donc n ≤ 250 millions.</li></ul><p><b>Le temps.</b> n log<sub>2</sub>(n) est plus petit que n²/2 dès que n dépasse 4 : le tri fusion est plus rapide, et de très loin pour n grand (pour n = 1 000 000 : environ 20 millions d'opérations contre 500 milliards).</p><p><b>Conclusion.</b></p><ul><li>n ≤ 250 millions : le <b>tri fusion</b>.</li><li>Entre 250 et 500 millions : seul le <b>tri à bulles</b> tient en mémoire (il sera très lent).</li><li>Au-delà de 500 millions : le tableau lui-même ne tient pas dans 1 Go.</li></ul><p>(Avec 1 Go = 2³⁰ octets, les deux seuils deviennent environ 268 et 537 millions.)</p>`}),
 P2({id:"33",s:1,note:"TD 7, complexité (supplémentaire, plus théorique)",t:"Trois questions sur θ et O",en:`<p>Exercice supplémentaire (un peu plus théorique) :</p><ol><li>Réciproque fausse : donner deux suites strictement positives (T<sub>n</sub>) et (U<sub>n</sub>) telles que T<sub>n</sub> = θ(U<sub>n</sub>) mais T<sub>n</sub>/U<sub>n</sub> n'a pas une limite finie.</li><li>Trouver deux suites strictement positives (T<sub>n</sub>) et (U<sub>n</sub>) non comparables, c'est à dire telles que T<sub>n</sub> ≠ O(U<sub>n</sub>) et U<sub>n</sub> ≠ O(T<sub>n</sub>).</li><li>Soient T<sub>n</sub>, U<sub>n</sub> et V<sub>n</sub> trois suites > 0 telles que T<sub>n</sub> = θ(U<sub>n</sub>), V<sub>n</sub> = θ(U<sub>n</sub>) et T<sub>n</sub> > V<sub>n</sub>. A-t-on nécessairement T<sub>n</sub> − V<sub>n</sub> = θ(U<sub>n</sub>) ?</li></ol>`,link:"a-complexite",sol:`<p>Rappel du cours (diapo 77) : T<sub>n</sub> = θ(U<sub>n</sub>) quand T<sub>n</sub>/U<sub>n</sub> reste entre deux nombres strictement positifs.</p><ol><li>U<sub>n</sub> = 1, et T<sub>n</sub> = 1 si n est pair, 3 si n est impair. Le quotient T<sub>n</sub>/U<sub>n</sub> reste entre 1 et 3, donc T<sub>n</sub> = θ(U<sub>n</sub>) ; mais il saute sans cesse de 1 à 3 : il n'a pas de limite. (C'est le cas de la dernière ligne de la diapo 79 : 3n + 1 pour n pair, 2n pour n impair.)</li><li>T<sub>n</sub> = n si n est pair, 1 si n est impair ; U<sub>n</sub> = 1 si n est pair, n si n est impair. Pour n pair, T<sub>n</sub>/U<sub>n</sub> = n, qui n'est pas borné : T<sub>n</sub> ≠ O(U<sub>n</sub>). Pour n impair, U<sub>n</sub>/T<sub>n</sub> = n : U<sub>n</sub> ≠ O(T<sub>n</sub>).</li><li>Non. Contre-exemple : T<sub>n</sub> = n + 1, V<sub>n</sub> = n, U<sub>n</sub> = n. Les deux premières sont en θ(n) et T<sub>n</sub> > V<sub>n</sub>, mais T<sub>n</sub> − V<sub>n</sub> = 1, qui n'est pas en θ(n).</li></ol>`}),
 P2({id:"35",s:3,note:"TD 8, complexité",t:"Équations de récurrence de trois algorithmes récursifs",en:`<p>Pour chacun des algorithmes suivants, on appelle T<sub>n</sub> le nombre d'opérations élémentaires que fait l'algorithme pour la taille d'entrée n. Déterminer la ou les équations de récurrence régissant T<sub>n</sub> puis les résoudre de manière exacte ou, si c'est impossible, en appliquant le master theorem :</p><p><b>Algorithme 1</b></p>${C(`Fonction : F (E n : entier) : entier
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
Fin`)}<p><b>Algorithme 3</b></p>${C(`Fonction : H (E n : entier) : entier
Spécifications : n est un entier naturel
Variables : som : nombre
Début
    Si n=0 alors
        Renvoyer 1
    Sinon
        som ← 0
        Pour i de 1 à n faire
            som ← som + F(i-1)
        finPour
        Renvoyer som
    FinSi
Fin`)}<p><b>Indication :</b> calculer T<sub>n+1</sub> − T<sub>n</sub> à partir de n = 1 puis montrer que la suite (U<sub>n</sub>) définie par U<sub>n</sub> = T<sub>n</sub> + 4 est géométrique.</p>`,link:"a-calcul-complexite",sol:`<p><b>Une remarque d'abord.</b> Dans la feuille, G et H appellent « F ». Les deux indications ne marchent que si chaque algorithme s'appelle lui-même : G(n div 2) dans G, H(i−1) dans H. C'est ce que je suppose ici. On compte comme dans le cours (diapo 72) : une comparaison, une opération de calcul, une affectation ou un appel comptent chacun pour 1.</p><p><b>Algorithme 1.</b> Cas de base : si n = 0, 1 comparaison : T<sub>0</sub> = 1. Si n > 0 : 1 comparaison, 2 soustractions (n−1 deux fois), 2 appels, 1 addition, plus les opérations des deux appels :</p><div class="formula">T<sub>n</sub> = 6 + 2T<sub>n−1</sub></div><p>Avec U<sub>n</sub> = T<sub>n</sub> + 6 : U<sub>n</sub> = 2T<sub>n−1</sub> + 12 = 2(T<sub>n−1</sub> + 6) = 2U<sub>n−1</sub>. La suite (U<sub>n</sub>) est géométrique de raison 2, et U<sub>0</sub> = 7. Donc U<sub>n</sub> = 7 × 2<sup>n</sup> et <b>T<sub>n</sub> = 7 × 2<sup>n</sup> − 6</b> : complexité θ(2<sup>n</sup>).</p><p><b>Algorithme 2.</b> T<sub>0</sub> = 1. Si n > 0 : 1 comparaison, 1 affectation, n tours de boucle à 3 opérations (une multiplication, une addition, une affectation), puis 1 division entière, 1 appel, 1 addition, plus les opérations de l'appel :</p><div class="formula">T<sub>n</sub> = T<sub>n div 2</sub> + 3n + 5</div><p>On ne sait pas résoudre exactement : master theorem. Il y a 1 appel récursif (a = 1), la taille est divisée par 2 (b = 2), et en dehors de l'appel on fait O(n) opérations (d = 1). Comme b<sup>d</sup> = 2 > a = 1 : <b>T<sub>n</sub> = O(n)</b>.</p><p><b>Algorithme 3.</b> T<sub>0</sub> = 1. Si n > 0 : 1 comparaison, 1 affectation, puis pour chaque i de 1 à n : 1 soustraction, 1 appel, 1 addition, 1 affectation, plus les opérations de H(i−1) :</p><div class="formula">T<sub>n</sub> = 2 + 4n + T<sub>0</sub> + T<sub>1</sub> + … + T<sub>n−1</sub></div><p>Suivons l'indication. Pour n ≥ 1 : T<sub>n+1</sub> − T<sub>n</sub> = 4 + T<sub>n</sub> (il y a un tour de boucle de plus, celui de i = n + 1). Donc T<sub>n+1</sub> = 2T<sub>n</sub> + 4, et U<sub>n+1</sub> = T<sub>n+1</sub> + 4 = 2T<sub>n</sub> + 8 = 2U<sub>n</sub> : la suite (U<sub>n</sub>) est géométrique de raison 2 à partir de n = 1. Comme T<sub>1</sub> = 2 + 4 + T<sub>0</sub> = 7, U<sub>1</sub> = 11, donc U<sub>n</sub> = 11 × 2<sup>n−1</sup> et <b>T<sub>n</sub> = 11 × 2<sup>n−1</sup> − 4</b> pour n ≥ 1 : complexité θ(2<sup>n</sup>).</p><p>(Les valeurs T = 1, 8, 22, 50… pour l'algorithme 1 et T = 1, 7, 18, 40… pour l'algorithme 3 ont été recalculées par programme ; pour l'algorithme 2, T<sub>n</sub>/n tend vers 6. Si tu comptes les opérations un peu autrement, les constantes changent, pas les ordres.)</p>`}),
 P2({id:"36",s:1,note:"TD 8, complexité (supplémentaire)",t:"Le sous-tableau de somme maximale",en:`<p>Exercice supplémentaire : recherche du sous-tableau de somme maximale</p><p>On considère un tableau T de n entiers qui peuvent être négatifs. Un sous-tableau de T est formé de valeurs consécutives de T. Par exemple, [2], [2,3,-10] et [1,2,3,-10,6] sont trois sous-tableaux de [1,2,3,-10,6]. En revanche, [1,3,6] n'en est pas un.</p><p>On cherche un sous-tableau de T qui contient la plus grande somme de T. Dans l'exemple précédent, deux sous-tableaux conviennent : [1,2,3] et [6].</p><ol><li>Une première méthode est la suivante : "pour chaque sous-tableau possible de T (repéré par un indice de début et un indice de fin), ajouter les valeurs qu'il contient, puis renvoyer la plus grande des sommes calculées". Écrire un algorithme <b>cubique</b> SomMaxCube qui suit cette méthode et vérifier son ordre de complexité.</li><li>On peut améliorer l'algorithme précédent en mémorisant les sommes intermédiaires. Écrire un algorithme <b>quadratique</b> SomMaxQuad qui utilise cette amélioration et vérifier son ordre de complexité.</li><li>Plus malin : "le sous-tableau cherché est soit inclus dans la première moitié de T, soit inclus dans la deuxième moitié, soit à cheval entre les deux moitiés." Autrement dit, on lance l'algorithme sur la première et sur la deuxième moitié, on cherche la plus grande sous-somme à cheval entre les deux moitiés et on renvoie le plus grand des trois résultats. Écrire un algorithme <b>quasi-linéaire</b> (en O(n log n)) SomMaxQL qui suit cette méthode et vérifier son ordre de complexité. En plus du tableau, cet algorithme prendra en paramètres les indices de début et de fin de la partie du tableau étudiée.</li><li>Encore plus malin : "parcourir le tableau case par case en mettant à jour une variable S telle qu'à la fin de l'itération i, S contient la plus grande somme de tous les sous-tableaux se terminant à l'indice i. A la fin des itérations, renvoyer la plus grande valeur prise par S". Écrire un algorithme <b>linéaire</b> SomMaxLin qui suit cette méthode (algorithme de Kadame) et vérifier son ordre de complexité.</li></ol>`,link:"a-calcul-complexite",sol:`<p>Les quatre fonctions renvoient la plus grande somme (6 pour l'exemple). On suppose T non vide.</p><p><b>1.</b></p>${C(`FONCTION : SomMaxCube (E T : tableau d'entiers) : entier
Variable : best, s : entier
DÉBUT
    best ← T[0]
    pour d de 0 à taille(T)-1 faire
        pour f de d à taille(T)-1 faire
            s ← 0
            pour k de d à f faire
                s ← s + T[k]
            fin pour;
            si s > best alors
                best ← s
            fin si;
        fin pour;
    fin pour;
    Renvoyer best
FIN`)}<p>Trois boucles imbriquées, chacune fait au plus n tours : O(n) × O(n) × O(n) = O(n³) (raccourci du cours, diapo 82).</p><p><b>2.</b> Quand on allonge le sous-tableau d'une case, on ajoute seulement cette case à la somme déjà calculée :</p>${C(`FONCTION : SomMaxQuad (E T : tableau d'entiers) : entier
Variable : best, s : entier
DÉBUT
    best ← T[0]
    pour d de 0 à taille(T)-1 faire
        s ← 0
        pour f de d à taille(T)-1 faire
            s ← s + T[f]
            si s > best alors
                best ← s
            fin si;
        fin pour;
    fin pour;
    Renvoyer best
FIN`)}<p>Deux boucles imbriquées d'au plus n tours : O(n²).</p><p><b>3.</b></p>${C(`FONCTION : SomMaxQL (E T : tableau d'entiers, E deb, fin : entier) : entier
SPÉCIFICATIONS : 0 ≤ deb ≤ fin ≤ taille(T)-1. Renvoie la plus grande somme
                 d'un sous-tableau de T situé entre les indices deb et fin.
Variable : mil, g, dr, s, mg, md : entier
DÉBUT
    si deb = fin alors
        Renvoyer T[deb]
    fin si;
    mil ← (deb + fin) div 2
    g ← SomMaxQL(T, deb, mil)
    dr ← SomMaxQL(T, mil+1, fin)
    s ← 0 ; mg ← T[mil]
    pour k de mil à deb par pas de -1 faire
        s ← s + T[k]
        si s > mg alors
            mg ← s
        fin si;
    fin pour;
    s ← 0 ; md ← T[mil+1]
    pour k de mil+1 à fin faire
        s ← s + T[k]
        si s > md alors
            md ← s
        fin si;
    fin pour;
    Renvoyer max(g, max(dr, mg + md))
FIN`)}<p>mg est la plus grande somme d'un morceau qui finit à l'indice mil, md celle d'un morceau qui commence à mil+1 : mg + md est la meilleure somme « à cheval ». On appelle SomMaxQL(T, 0, taille(T)-1). Complexité : 2 appels récursifs (a = 2), sur une taille divisée par 2 (b = 2), plus O(n) opérations pour les deux boucles (d = 1). Master theorem, cas b<sup>d</sup> = a : <b>O(n log n)</b>.</p><p><b>4.</b> La meilleure somme qui finit à l'indice i est soit T[i] tout seul, soit la meilleure somme qui finit en i − 1 à laquelle on ajoute T[i] (ce qui ne vaut le coup que si elle est positive) :</p>${C(`FONCTION : SomMaxLin (E T : tableau d'entiers) : entier
Variable : S, best : entier
DÉBUT
    S ← T[0]
    best ← T[0]
    pour i de 1 à taille(T)-1 faire
        S ← cond(S < 0, T[i], S + T[i])
        si S > best alors
            best ← S
        fin si;
    fin pour;
    Renvoyer best
FIN`)}<p>Une seule boucle de n − 1 tours, un nombre constant d'opérations par tour : <b>θ(n)</b>.</p><p>(Corrigé écrit par moi. Les quatre algorithmes, traduits en Python, donnent le même résultat sur 3000 tableaux tirés au hasard. « max » et « par pas de -1 » ne sont pas dans le cours : écris deux « si » et une boucle tant que si tu préfères.)</p>`}),
 P3({id:"37",s:3,note:"TD 9, recherche",t:"Dérouler la recherche dichotomique",link:"a-recherche",
  en:`<p>Recherche dichotomique :</p><p><b>1.</b> On rappelle l'algorithme de recherche dichotomique du cours (ici traduit en Python) :</p>${P(`def RechDic (e, T) :
   deb = 0
   fin = len(T)-1
   while (deb<=fin) :
       mil = (deb+fin)//2
       if (T[mil]<e) :
          deb = mil+1
       else :
          fin = mil-1
   if deb<taille(T) and T[deb]==e :
      return deb
   else :
      return -1`)}<p>Donner la suite des valeurs des variables deb et fin lorsqu'on cherche e=5 dans les tableaux suivants, puis donner la valeur renvoyée :</p><ol type="a"><li>[1, 3, 5]</li><li>[5, 5, 5, 9]</li><li>[1, 3, 7, 9]</li><li>[1, 2, 3, 4]</li><li>[6, 7, 8, 9]</li></ol><p><b>2.</b> A présent, on souhaite savoir si un élément est dans un tableau. Est-il plus intéressant, du point de vue de la complexité, de le chercher de manière linéaire, ou de trier d'abord le tableau puis de le chercher de manière dichotomique ?</p>`,
  sol:`<p><b>1.</b> À chaque itération : mil = (deb+fin)//2 ; si T[mil] &lt; 5, deb passe à mil+1, sinon fin passe à mil−1. On note les couples (deb, fin).</p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>tableau</th><th>(deb, fin) successifs</th><th>pourquoi</th><th>renvoie</th></tr></thead><tbody><tr><td>(a) [1, 3, 5]</td><td>(0, 2), (2, 2), (2, 1)</td><td>mil = 1 : 3 &lt; 5 ; mil = 2 : 5 n'est pas &lt; 5</td><td>2</td></tr><tr><td>(b) [5, 5, 5, 9]</td><td>(0, 3), (0, 0), (0, −1)</td><td>mil = 1 : 5 n'est pas &lt; 5 ; mil = 0 : pareil</td><td>0</td></tr><tr><td>(c) [1, 3, 7, 9]</td><td>(0, 3), (2, 3), (2, 1)</td><td>mil = 1 : 3 &lt; 5 ; mil = 2 : 7 n'est pas &lt; 5</td><td>−1</td></tr><tr><td>(d) [1, 2, 3, 4]</td><td>(0, 3), (2, 3), (3, 3), (4, 3)</td><td>2 &lt; 5, 3 &lt; 5, 4 &lt; 5</td><td>−1</td></tr><tr><td>(e) [6, 7, 8, 9]</td><td>(0, 3), (0, 0), (0, −1)</td><td>7 puis 6 ne sont pas &lt; 5</td><td>−1</td></tr></tbody></table></div><ul><li>(a) À la fin deb = 2 &lt; 3 et T[2] = 5 : on renvoie 2.</li><li>(b) deb = 0 et T[0] = 5 : on renvoie 0, le <b>plus petit</b> indice où se trouve 5 (c'est la spécification du cours).</li><li>(c) deb = 2 mais T[2] = 7 ≠ 5 : −1.</li><li>(d) deb = 4 = taille du tableau : le test « deb &lt; taille(T) » est faux, on renvoie −1 sans lire T[4], qui n'existe pas.</li><li>(e) deb = 0 mais T[0] = 6 ≠ 5 : −1.</li></ul><p><b>2.</b> Recherche linéaire : θ(n) dans le pire des cas (cours, diapo 90). Trier d'abord coûte déjà au moins n : θ(n log n) avec un tri par comparaison comme le tri fusion (diapo 113), ou θ(n) avec le tri par valeurs quand il s'applique. La recherche dichotomique ajoute θ(log n). Au total θ(n log n), ou au mieux θ(n) : jamais mieux que la recherche linéaire. Pour <b>une seule</b> recherche, on cherche de manière linéaire.</p><p>(Corrigé écrit par moi ; les cinq traces ont été calculées par programme.)</p>`}),
 P3({id:"38",s:1,note:"TD 9, recherche (supplémentaire)",t:"Recherche aléatoire dans un tableau non trié",link:"a-recherche",
  en:`<p>Exercice supplémentaire : recherche aléatoire dans un tableau non trié</p><p>On dispose d'un tableau T qui contient un certain élément e. On cherche à connaître la position de cet élément en tirant au hasard une position jusqu'à le trouver.</p><p><b>1.</b> Écrire un algorithme de recherche qui suit ce principe. On dispose d'une fonction nombreAlea(E a, b : entier) qui tire un entier au hasard entre a et b. L'algorithme s'arrête-t-il ?</p><p><b>2.</b> Pour que l'algorithme s'arrête à coup sûr, on "raye" les indices déjà tirés de la liste des indices possibles. Proposer un algorithme qui suit ce principe et calculer sa complexité dans le pire des cas. On dispose des fonctions et procédures suivantes sur les listes, toutes les trois d'une complexité θ(longueur(liste)) :</p><ul><li>fonction longueur(E l : liste d'entier) : entier qui renvoie le nombre d'éléments de l</li><li>fonction premiers(E n : entier) : liste d'entier qui renvoie la liste [0, 1, ..., n-1]</li><li>procédure supprime(E e : nombre, ES l : liste d'entier) qui supprime e de l</li><li>fonction element(E n : entier, E l : liste d'entier) : entier qui renvoie l'élément d'indice n de l</li></ul>`,
  sol:`<p><b>1.</b></p>${C(`FONCTION : rechAlea (E e : nombre, E T : tableau de nombres) : entier
SPÉCIFICATIONS : T contient e. Renvoie un indice de T qui contient e.
Variable : i : entier
DÉBUT
    i ← nombreAlea(0, taille(T)-1)
    tant que T[i] ≠ e faire
        i ← nombreAlea(0, taille(T)-1)
    fin tq;
    Renvoyer i
FIN`)}<p>On ne peut pas prouver qu'il s'arrête : aucune quantité ne décroît d'une itération à l'autre, et rien n'empêche de tirer sans fin des positions qui ne contiennent pas e. (En pratique il finit presque toujours par tomber dessus, mais le nombre d'itérations n'a pas de borne.)</p><p><b>2.</b></p>${C(`FONCTION : rechAlea2 (E e : nombre, E T : tableau de nombres) : entier
SPÉCIFICATIONS : T contient e. Renvoie un indice de T qui contient e.
Variable : L : liste d'entier
           i : entier
DÉBUT
    L ← premiers(taille(T))
    i ← element(nombreAlea(0, longueur(L)-1), L)
    tant que T[i] ≠ e faire
        supprime(i, L)
        i ← element(nombreAlea(0, longueur(L)-1), L)
    fin tq;
    Renvoyer i
FIN`)}<p><b>Arrêt</b> : longueur(L) est un entier naturel qui décroît strictement à chaque itération (on supprime un indice). Un indice qui contient e n'est jamais supprimé, donc L n'est jamais vide, et au pire il ne reste que lui. Il y a un nombre fini d'itérations.</p><p><b>Complexité dans le pire des cas</b> (e est tiré en dernier), avec n = taille(T) : premiers(n) coûte θ(n). Ensuite la liste a n éléments, puis n − 1, … puis 1, et chaque passage fait un nombre constant d'appels en θ(longueur(L)). Le total est proportionnel à n + (n − 1) + … + 1 = n(n + 1)/2 : <b>θ(n²)</b>. C'est pire que la recherche linéaire, qui est en θ(n).</p><p>(Corrigé écrit par moi, essayé par programme.)</p>`}),
 P3({id:"39",s:2,note:"TD 10, tris",t:"La valeur médiane d'un tableau",link:"a-tri-fusion",
  en:`<p>La valeur médiane d'un tableau de nombres est la valeur qui serait située au milieu du tableau si le tableau était trié. Plus précisément la valeur médiane d'un tableau injectif tab est la valeur m de tab telle que le nombre de valeurs dans tab inférieures strictement à m est ⌊n/2⌋. Par exemple la valeur médiane du tableau [9 3 5 2 8 1 7] est 5.</p><ol><li>Écrire une fonction nbInf(E tab : tableau d'entiers, E e : entier) qui renvoie le nombre de valeurs strictement inférieures à e dans tab.</li><li>En déduire une fonction mediane1 qui renvoie la médiane d'un tableau tab supposé injectif. Quelle est sa complexité ?</li><li>Écrire une fonction mediane2 qui calcule la médiane d'un tableau en commençant par le trier. Quelle est sa complexité ?</li><li>Conclure.</li></ol><p>(Tableau injectif : toutes ses valeurs sont différentes. ⌊n/2⌋ : n div 2.)</p>`,
  sol:`<p><b>1.</b></p>${C(`FONCTION : nbInf (E tab : tableau d'entiers, E e : entier) : entier
SPÉCIFICATIONS : Renvoie le nombre de valeurs de tab strictement inférieures à e.
Variable : cpt : entier
DÉBUT
    cpt ← 0
    pour i de 0 à taille(tab)-1 faire
        si tab[i] < e alors
            cpt ← cpt + 1
        fin si;
    fin pour;
    Renvoyer cpt
FIN`)}<p><b>2.</b> On essaie les valeurs une par une jusqu'à trouver celle qui a exactement n div 2 valeurs plus petites qu'elle.</p>${C(`FONCTION : mediane1 (E tab : tableau d'entiers) : entier
SPÉCIFICATIONS : tab est injectif et non vide. Renvoie sa valeur médiane.
Variable : i : entier
DÉBUT
    i ← 0
    tant que nbInf(tab, tab[i]) ≠ taille(tab) div 2 faire
        i ← i + 1
    fin tq;
    Renvoyer tab[i]
FIN`)}<p>Sur l'exemple : n = 7, n div 2 = 3, et 5 a bien trois valeurs plus petites (3, 2 et 1).</p><p>Complexité : nbInf fait n itérations à coût constant, θ(n). Dans le pire des cas, mediane1 appelle nbInf n fois : n × θ(n) = <b>θ(n²)</b>.</p><p><b>3.</b></p>${C(`FONCTION : mediane2 (E tab : tableau d'entiers) : entier
SPÉCIFICATIONS : tab est non vide. Renvoie sa valeur médiane.
Variable : T2 : tableau de taille(tab) entiers
DÉBUT
    pour i de 0 à taille(tab)-1 faire
        T2[i] ← tab[i]
    fin pour;
    TriFusion(T2)
    Renvoyer T2[taille(tab) div 2]
FIN`)}<p>Complexité : la copie est en θ(n), le tri fusion en θ(n log(n)) (cours, diapo 112), l'accès à une case en θ(1). Au total <b>θ(n log(n))</b>.</p><p><b>4.</b> n log(n) est strictement dominée par n² : trier d'abord est plus efficace, à condition de choisir un tri en θ(n log(n)). Avec le tri à bulles, en θ(n²), on ne gagnerait rien. C'est la phrase du cours : « trier permet de traiter plus efficacement ensuite ».</p><p>(Corrigé écrit par moi ; mediane1 a été vérifiée par programme sur 2000 tableaux.)</p>`}),
 P3({id:"40",s:2,note:"TD 10, tris",t:"k recherches : faut-il trier d'abord ?",link:"a-recherche",
  en:`<ol><li>Pour un tableau quelconque de n entiers, quel est l'ordre de complexité pour effectuer k recherches par l'algorithme de recherche itérative ?</li><li>Pour un tableau de n entiers, quel est l'ordre de complexité pour trier ce tableau et effectuer k recherches par l'algorithme de recherche dichotomique ?</li><li>Pour de grandes valeurs de n, donner une condition suffisante sur k pour qu'il soit intéressant en termes de complexité de trier le tableau avant d'effectuer les k recherches.</li></ol>`,
  sol:`<ol><li>Une recherche linéaire est en θ(n) dans le pire des cas. k recherches : <b>θ(k × n)</b>.</li><li>Le tri (tri fusion) est en θ(n log(n)). Une recherche dichotomique est en θ(log(n)), donc k recherches en θ(k log(n)). Au total <b>θ(n log(n) + k log(n))</b>.</li><li>On compare k × n avec (n + k) × log(n). Si k grandit strictement plus vite que log(n), c'est-à-dire si log(n) = o(k), alors n log(n) est strictement dominée par k × n ; et k log(n) aussi, puisque log(n) = o(n). Trier d'abord est donc intéressant <b>dès que k domine strictement log(n)</b> : par exemple k = √n ou k = n. Pour un nombre de recherches fixé (k = 1, k = 10), ça ne vaut pas le coup : on retrouve l'exercice 37.</li></ol><p>(Corrigé écrit par moi. Pour n = 1 000 000, log<sub>2</sub>(n) vaut environ 20 : à partir de quelques dizaines de recherches, le tri est rentable.)</p>`}),
 P3({id:"41",s:1,note:"TD 10, tris",t:"Trier une liste avec un tri de tableau",link:"a-tri-fusion",
  en:`<p>Proposer un algorithme qui, étant donnée une liste d'entiers et sa taille, trie la liste en utilisant un tri de tableau. Quelle est sa complexité ?</p>`,
  sol:`<p>On recopie la liste dans un tableau, on trie le tableau, puis on reconstruit une liste. Pour que la liste soit dans le bon ordre, on parcourt le tableau de la fin vers le début : cons ajoute en tête.</p>${C(`FONCTION : triListe (E L : liste d'entiers, E n : entier) : liste d'entiers
SPÉCIFICATIONS : n est le nombre d'éléments de L.
                 Renvoie la liste des éléments de L par ordre croissant.
Variable : T : tableau de n entiers
           M, R : liste d'entiers
DÉBUT
    M ← L
    pour i de 0 à n-1 faire
        T[i] ← tête(M)
        M ← queue(M)
    fin pour;
    TriFusion(T)
    R ← [ ]
    pour i de n-1 à 0 par pas de -1 faire
        R ← cons(T[i], R)
    fin pour;
    Renvoyer R
FIN`)}<p>Complexité : les deux boucles pour font n itérations à coût constant, θ(n). Le tri fusion est en θ(n log(n)). Au total <b>θ(n log(n))</b>. (Si les valeurs sont dans un petit intervalle, le tri par valeurs donne θ(n).)</p><p>(Corrigé écrit par moi.)</p>`}),
 P3({id:"42",s:3,note:"TD 10, tris",t:"Tri par sélection : algorithme, complexité, validité",link:"a-tri-selection",
  en:`<p>Le tri par sélection consiste, pour trier un tableau tab de n nombres :</p><ul><li>à rechercher le plus petit élément du tableau et à échanger sa valeur avec tab[0] ;</li><li>à rechercher le plus petit élément parmi les n-1 derniers éléments du tableau et à échanger sa valeur avec de tab[1] ;</li><li>et ainsi de suite jusqu'à ce que tous les éléments soient triés.</li></ul><ol><li>Écrivez l'algorithme de tri par sélection.</li><li>Déterminez son ordre de complexité.</li><li>Prouvez la validité de cet algorithme.</li></ol>`,
  sol:`<p><b>1.</b></p>${C(`PROCÉDURE : TriSelection (ES tab : tableau de nombres de taille n)
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
FIN`)}<p>m est l'indice du plus petit élément vu depuis la case i. On s'arrête à i = n-2 : quand les n − 1 premières cases sont à leur place, la dernière aussi.</p><p><b>2.</b> Pour une valeur de i, j prend n − 1 − i valeurs. Le nombre de comparaisons est (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, et chaque itération fait un nombre constant d'opérations : <b>θ(n²)</b>, quel que soit le tableau (c'est ce que dit le cours, diapo 114). Avec le raccourci : n × O(n) × O(1) = O(n²).</p><p><b>3.</b> Avec la méthode du cours. On regarde le tableau à la fin de chaque itération i de la boucle extérieure.</p><ul><li><b>Ce que fait une itération</b> (la vérité, lue sur l'algorithme) : la boucle sur j met dans m l'indice du plus petit élément de tab[i..n-1], puis ce plus petit élément est échangé avec tab[i].</li><li><b>Invariant</b> : Inv<sub>i</sub> : « à la fin de l'itération i, tab[0..i] contient les i + 1 plus petites valeurs du tableau, par ordre croissant ».</li><li><b>Initialisation</b> : à la fin de l'itération 0, tab[0] est le plus petit élément du tableau. Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : on suppose Inv<sub>i−1</sub> vrai. Les valeurs de tab[i..n-1] sont donc toutes supérieures ou égales à celles de tab[0..i-1]. L'itération i place en tab[i] la plus petite d'entre elles : tab[0..i] contient les i + 1 plus petites valeurs, et reste croissant car tab[i] ≥ tab[i-1]. Inv<sub>i</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul><p>À la fin (i = n-2), tab[0..n-2] contient les n − 1 plus petites valeurs par ordre croissant ; la valeur restante, tab[n-1], est la plus grande. Le tableau est trié, et il contient toujours les mêmes valeurs, puisqu'on ne fait que des échanges. L'algorithme est valide. Il se termine : ce sont deux boucles pour.</p><p>(Corrigé écrit par moi ; l'algorithme a été vérifié par programme, avec ses n(n − 1)/2 comparaisons.)</p>`}),
 P3({id:"43",s:3,note:"TD 10, tris",t:"Tri par insertion : algorithme, complexité, validité",link:"a-tri-insertion",
  en:`<p>Le tri par insertion consiste, pour trier un tableau tab de n nombres, à insérer chaque valeur non triée du tableau parmi les valeurs déjà triées :</p><ul><li>si tab[0]>tab[1], on les permute ;</li><li>on insère tab[2] parmi tab[0] et tab[1] de telle sorte que tab[0], tab[1] et tab[2] soient dans le bon ordre ;</li><li>et ainsi de suite : à chaque nouvelle valeur tab[k], on l'insère parmi les valeurs tab[0] à tab[k-1].</li></ul><ol><li>Écrivez l'algorithme de tri par insertion.</li><li>Déterminez son ordre de complexité.</li><li>Prouvez la validité de cet algorithme.</li></ol>`,
  sol:`<p><b>1.</b></p>${C(`PROCÉDURE : TriInsertion (ES tab : tableau de nombres de taille n)
SPÉCIFICATIONS : Trie le tableau tab par ordre croissant.
Variable : a : nombre
           j : entier
DÉBUT
    pour k de 1 à n-1 faire
        a ← tab[k]
        j ← k-1
        tant que j ≥ 0 et tab[j] > a faire
            tab[j+1] ← tab[j]
            j ← j-1
        fin tq;
        tab[j+1] ← a
    fin pour;
FIN`)}<p>a garde la valeur à insérer. Tant que la case de gauche contient une valeur plus grande, on la décale d'une case vers la droite. On pose a dans la case libre. Le test « j ≥ 0 » est écrit en premier : quand j = −1, la suite du « et » n'est pas évaluée et on ne lit pas tab[-1]. (C'est l'algorithme « triJohn » de l'examen de mai 2023.)</p><p><b>2.</b> Pire cas, le tableau est rangé à l'envers : à l'itération k, le tant que fait k tours. En tout 1 + 2 + … + (n − 1) = n(n − 1)/2 décalages : <b>θ(n²)</b> (cours, diapo 114). Si le tableau est déjà trié, le tant que ne fait aucun tour : n − 1 itérations à coût constant, θ(n). C'est pour ça que le cours le dit « adapté lorsque les données sont presque triées ».</p><p><b>3.</b> On regarde le tableau à la fin de chaque itération k de la boucle pour.</p><ul><li><b>Invariant</b> : Inv<sub>k</sub> : « tab[0..k] contient les k + 1 premières valeurs du tableau de départ, par ordre croissant ».</li><li><b>Initialisation</b> : avant la boucle (k = 0), tab[0..0] ne contient qu'une valeur : il est trié. Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : on suppose Inv<sub>k−1</sub> vrai : tab[0..k-1] est croissant. Le tant que décale d'une case vers la droite toutes les valeurs strictement plus grandes que a, et s'arrête quand j = −1 ou tab[j] ≤ a. On pose a en tab[j+1] : à sa gauche, des valeurs inférieures ou égales à a ; à sa droite, des valeurs plus grandes. tab[0..k] est croissant et contient les anciennes valeurs de tab[0..k-1] plus a. Inv<sub>k</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul><p>À la fin (k = n-1), tab[0..n-1] contient toutes les valeurs de départ par ordre croissant : l'algorithme est valide. Le tant que s'arrête : j est un entier qui décroît strictement à chaque itération, et la boucle s'arrête au plus tard quand j vaut −1.</p><p>(Corrigé écrit par moi, vérifié par programme.)</p>`}));

/* ---------- annales des CC2 et CC3 : énoncés recopiés des sujets, corrigés officiels quand ils existent ---------- */
const OFF="Corrigé officiel",MOI="Corrigé écrit par moi (pas de corrigé officiel sur Moodle), vérifié par programme";
const F23=`Fonction : F (E n : entier) : entier
Spécifications : n∈ ℕ. Renvoie 1/(n+1).
Début
    Si n=0 alors
      Renvoyer 1
    Sinon
      Renvoyer F(n-1) / (1+F(n-1))
    FinSi
Fin`;
const QF23=`<p>(Dans le sujet, « 1/(n+1) » est écrit en fraction.)</p>`;
const SOLF1=`<ul><li><b>Base</b> : pour n = 0, F renvoie 1 donc se termine. De plus, comme 1 = 1/(0 + 1), F renvoie le bon résultat.</li><li><b>Hérédité</b> : supposons que, pour n > 0, F(n − 1) se termine et renvoie le bon résultat, c'est à dire 1/n. Alors l'appel F(n) est constitué d'opérations élémentaires et de deux appels à F(n − 1) donc se termine. De plus, F(n) renvoie F(n−1)/(1 + F(n−1)) = (1/n)/(1 + 1/n) = 1/(n + 1) c'est à dire le bon résultat.</li><li><b>Conclusion</b> : pour tout n ∈ ℕ, l'appel F(n) se termine et renvoie le bon résultat.</li></ul>`;
const SOLF2=`<p>On a T<sub>0</sub> = 0 et pour n > 0, T<sub>n</sub> = 2T<sub>n−1</sub> + 4 (2 appels au rang n − 1, une addition, une division, deux soustractions).</p><p>Par suite, U<sub>n</sub> = T<sub>n</sub> + 4 = 2T<sub>n−1</sub> + 8 = 2(T<sub>n−1</sub> + 4) = 2U<sub>n−1</sub> donc la suite U<sub>n</sub> est géométrique. Son premier terme est U<sub>0</sub> = T<sub>0</sub> + 4 = 4 et sa raison vaut 2. D'où U<sub>n</sub> = 4 × 2<sup>n</sup> et finalement <b>T<sub>n</sub> = 4 × 2<sup>n</sup> − 4</b>.</p><p>(Le corrigé officiel écrit « + 4 » dans la dernière formule : c'est une coquille, puisque T<sub>n</sub> = U<sub>n</sub> − 4. On le vérifie : T<sub>0</sub> = 0, T<sub>1</sub> = 4, T<sub>2</sub> = 12.)</p>`;
const BL2="Sujet et corrigé écrits par moi (barème inventé), chaque résultat vérifié par programme",
 TRL=(h,L)=>`<div style="overflow-x:auto"><table class="tbl tr"><thead><tr>${h.map(x=>`<th class="var">${x}</th>`).join("")}</tr></thead><tbody>${L.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
ann.push(
 {src:"Sujet blanc du CC2 (écrit par moi, comme un CC2, 1 h, sur 20) · Ex. 1 · Questions de cours · 3 pts · pour le CC2",t:"o, θ, Ω, un θ(n²) plus rapide qu'un θ(n), l'arrêt d'un tant que",go:"a-complexite",who:BL2,
  en:`<p><i>Le sujet entier : 5 exercices, 1 h, sur 20. Seul document : ta feuille A5. Compte environ 8 minutes pour l'exercice 1, 18 pour le 2, 9 pour le 3, 18 pour le 4 et 6 pour le 5.</i></p><p><b>1.</b> (1 point) On pose f(n) = 3n² + 5n log(n). Cocher la ou les affirmations vraies.</p><ul><li>☐ f(n) = O(n³) ;</li><li>☐ f(n) = θ(n²) ;</li><li>☐ f(n) = o(n²) ;</li><li>☐ f(n) = Ω(n³) ;</li><li>☐ aucune des précédentes.</li></ul><p><b>2.</b> (1 point) Un algorithme de complexité θ(n²) est-il toujours plus lent qu'un algorithme de complexité θ(n) ? Justifier.</p><p><b>3.</b> (1 point) Pour montrer qu'une boucle « tant que » s'arrête, que faut-il trouver, et que faut-il montrer ?</p>`,
  sol:`<p><b>1. Deux cases : f(n) = O(n³) et f(n) = θ(n²).</b></p><ol><li>On divise par n² : f(n)/n² = 3 + 5 log(n)/n. Comme log(n)/n tend vers 0, f(n)/n² tend vers 3, un nombre &gt; 0 : <b>f(n) = θ(n²)</b>.</li><li>On divise par n³ : f(n)/n³ = 3/n + 5 log(n)/n² tend vers 0 : f(n) = o(n³), donc <b>f(n) = O(n³)</b> (O = o ou θ).</li><li>f(n) = o(n²) est faux : f(n)/n² tend vers 3, pas vers 0.</li><li>f(n) = Ω(n³) est faux : f(n)/n³ tend vers 0 (Ω = ω ou θ, il faudrait une limite &gt; 0 ou +∞).</li></ol><p>Raccourci de ta feuille : 3n² + 5n log(n) = θ(n²), on garde le plus gros terme sans le nombre devant.</p><p><b>Barème</b> : 0,5 point par bonne case, 0,5 point en moins par case fausse cochée (jamais moins de 0).</p><p><b>2. Non.</b> θ dit seulement comment le temps grandit quand n est grand, sans le nombre devant. Par exemple, si le premier fait n² opérations et le deuxième 1000n opérations : pour n = 100, le premier fait 10 000 opérations et le deuxième 100 000. Le θ(n²) est 10 fois plus rapide. Le θ(n) ne gagne qu'à partir de n = 1000.</p><p><b>Barème</b> : 0,5 point pour « non », 0,5 point pour un exemple avec des nombres.</p><p><b>3.</b> Il faut trouver un <b>entier</b> qui change à chaque itération (une variable, ou une différence de deux variables). Il faut montrer qu'il <b>décroît strictement</b> à chaque itération et qu'il ne peut pas descendre sous une valeur fixe tant que la condition du tant que est vraie. Un entier qui perd au moins 1 à chaque tour ne peut le faire qu'un nombre fini de fois : la boucle s'arrête.</p><p>C'est la phrase de ta feuille : « L'entier … vaut … au début et décroît strictement à chaque itération. Le tant que s'arrête quand … : au plus … itérations, donc un nombre fini : il s'arrête. »</p><p><b>Barème</b> : 0,5 point pour « un entier qui décroît strictement », 0,5 point pour la borne tant que la condition est vraie.</p>`},
 {src:"Sujet blanc du CC2 · Ex. 2 · Trace, invariant, preuve, complexité · 6 pts · pour le CC2",t:"La fonction K : trace, invariant de boucle, preuve, ce qu'elle calcule",go:"a-preuve",who:BL2,
  en:`<p>On considère l'algorithme suivant :</p>${C(`Fonction : K (E n : entier) : entier
Spécifications : n ∈ ℕ.
Variables : x, y : entier
Début
   x, y ← 1, 0
   Pour i de 1 à n faire
      y ← y + x
      x ← 3*x
   finPour
   Renvoyer y
Fin`)}<ol><li>(1,5 point) Faire une trace de K pour n = 4 : les valeurs de x et de y à la fin de chaque itération. Que renvoie K(4) ?</li><li>(1 point) On note x<sub>i</sub> et y<sub>i</sub> les valeurs de x et de y à la fin de l'itération i (x<sub>0</sub> et y<sub>0</sub> : avant la boucle). Écrire les équations d'itération, puis proposer un invariant de boucle qui donne x<sub>i</sub> et y<sub>i</sub> en fonction de i.</li><li>(2 points) Prouver cet invariant par récurrence.</li><li>(0,5 point) Que renvoie K(n) ? Écrire le résultat sans « + … + ».</li><li>(1 point) Combien d'opérations arithmétiques (additions et multiplications) les lignes de la boucle font-elles en tout, en fonction de n ? Quel est l'ordre de complexité de K ?</li></ol>`,
  sol:`<p><b>1.</b> Attention à l'ordre des lignes : y est calculé avec l'<b>ancien</b> x, puis x change.</p>${TRL(["i","x<sub>i</sub>","y<sub>i</sub>"],[[0,1,0],[1,3,1],[2,9,4],[3,27,13],[4,81,40]])}<p>Par exemple, à l'itération 3 : y ← 4 + 9 = 13, puis x ← 3 × 9 = 27. <b>K(4) renvoie 40.</b></p><p><b>Barème</b> : 1 point pour le tableau (0,5 point en moins par ligne fausse), 0,5 point pour 40.</p><p><b>2.</b> Équations d'itération : x<sub>0</sub> = 1, y<sub>0</sub> = 0 et, pour i ≥ 1, y<sub>i</sub> = y<sub>i−1</sub> + x<sub>i−1</sub> et x<sub>i</sub> = 3x<sub>i−1</sub>.</p><p>Dans la trace, x vaut 1, 3, 9, 27, 81 : ce sont les puissances de 3. Et 2y + 1 vaut 1, 3, 9, 27, 81 : c'est x. Donc y = (x − 1)/2.</p><p>Invariant : Inv<sub>i</sub> « x<sub>i</sub> = 3<sup>i</sup> et y<sub>i</sub> = (3<sup>i</sup> − 1)/2 ».</p><p><b>Barème</b> : 0,5 point pour les équations, 0,5 point pour l'invariant.</p><p><b>3.</b></p><ol><li><b>Initialisation</b> : x<sub>0</sub> = 1 = 3<sup>0</sup> et y<sub>0</sub> = 0 = (3<sup>0</sup> − 1)/2. Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : soit i ≥ 1. Supposons Inv<sub>i−1</sub> vrai : x<sub>i−1</sub> = 3<sup>i−1</sup> et y<sub>i−1</sub> = (3<sup>i−1</sup> − 1)/2. Alors x<sub>i</sub> = 3x<sub>i−1</sub> = 3 × 3<sup>i−1</sup> = 3<sup>i</sup>, et y<sub>i</sub> = y<sub>i−1</sub> + x<sub>i−1</sub> = (3<sup>i−1</sup> − 1)/2 + 3<sup>i−1</sup> = (3<sup>i−1</sup> − 1 + 2 × 3<sup>i−1</sup>)/2 = (3 × 3<sup>i−1</sup> − 1)/2 = (3<sup>i</sup> − 1)/2. Inv<sub>i</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai à toutes les itérations, de 0 à n.</li></ol><p>Le calcul de y se fait avec x<sub>i−1</sub>, pas x<sub>i</sub> : c'est l'équation d'itération du 2 qui le dit.</p><p><b>Barème</b> : 0,5 point pour l'initialisation, 1 point pour la récurrence (dont 0,5 point pour le calcul de y<sub>i</sub>), 0,5 point pour la conclusion.</p><p><b>4.</b> À la fin de la boucle, i = n : K renvoie y<sub>n</sub> = <b>(3<sup>n</sup> − 1)/2</b>. C'est la somme 1 + 3 + 9 + … + 3<sup>n−1</sup>. Vérification : pour n = 4, (81 − 1)/2 = 40, comme dans la trace.</p><p><b>5.</b> Chaque itération fait une addition (y + x) et une multiplication (3*x) : 2 opérations. La boucle fait n itérations : <b>2n opérations</b>. 2n/n tend vers 2, un nombre &gt; 0 : K est en <b>θ(n)</b>.</p><p>Si tu as aussi compté les affectations (« 1 pour ← » sur ta feuille), tu trouves un autre nombre de la forme cn + d, et l'ordre reste θ(n). Mais l'énoncé ne demandait que les additions et les multiplications.</p><p><b>Barème</b> : 0,5 point pour 2n, 0,5 point pour θ(n).</p>`},
 {src:"Sujet blanc du CC2 · Ex. 3 · L'arrêt d'un tant que · 3 pts · pour le CC2",t:"La fonction D : faire tourner, prouver l'arrêt, compter les itérations",go:"a-preuve",who:BL2,
  en:`<p>On considère l'algorithme suivant :</p>${C(`Fonction : D (E n : entier) : entier
Spécifications : n ∈ ℕ.
Variables : a, b : entier
Début
   a, b ← n, 0
   Tant que a > b faire
      a ← a - 2
      b ← b + 1
   finTantQue
   Renvoyer b
Fin`)}<ol><li>(1 point) Faire tourner D(10) : les valeurs de a et de b à la fin de chaque itération. Que renvoie D(10) ?</li><li>(1,5 point) Montrer que la boucle s'arrête pour tout n ∈ ℕ.</li><li>(0,5 point) Combien la boucle fait-elle d'itérations, en fonction de n ?</li></ol>`,
  sol:`<p><b>1.</b></p>${TRL(["itération","a","b"],[[0,10,0],[1,8,1],[2,6,2],[3,4,3],[4,2,4]])}<p>Après l'itération 4, le test 2 &gt; 4 est faux : on sort. <b>D(10) renvoie 4.</b> Le test a été fait 5 fois, un de plus que le nombre d'itérations.</p><p><b>Barème</b> : 0,5 point pour le tableau, 0,5 point pour 4.</p><p><b>2.</b> La condition compare a et b : on suit leur écart, l'entier a − b.</p><ol><li>Au début, a − b = n − 0 = n.</li><li>À chaque itération, a perd 2 et b gagne 1 : (a − 2) − (b + 1) = (a − b) − 3. L'entier a − b <b>décroît strictement</b>, de 3 à chaque itération.</li><li>Tant que la boucle continue, a &gt; b, donc a − b ≥ 1. Un entier qui part de n et perd 3 à chaque tour devient ≤ 0 au bout d'au plus n itérations : le test a &gt; b devient faux.</li></ol><p>Avec la phrase de ta feuille : « L'entier a − b vaut n au début et décroît strictement à chaque itération (de 3). Le tant que s'arrête quand a − b ≤ 0 : au plus n itérations, donc un nombre fini : il s'arrête. »</p><p>On peut aussi suivre a seul : tant que a &gt; b ≥ 0, a ≥ 1, et a perd 2 à chaque itération. Cette preuve vaut aussi tous les points. Écrire seulement « a décroît » ne suffit pas : il faut aussi dire pourquoi a ne peut pas descendre sans fin.</p><p><b>Barème</b> : 0,5 point pour l'entier choisi, 0,5 point pour la décroissance avec le calcul, 0,5 point pour la conclusion.</p><p><b>3.</b> Après k itérations, a − b = n − 3k. La boucle continue tant que n − 3k &gt; 0. Elle s'arrête au premier k tel que 3k ≥ n : <b>⌈n/3⌉ itérations</b> (n/3 arrondi au-dessus). Vérification : n = 10 donne 4, comme au 1 ; n = 9 donne 3 ; n = 0 donne 0 (le test est faux tout de suite). D(n) renvoie b, qui compte les itérations : D(n) = ⌈n/3⌉.</p>`},
 {src:"Sujet blanc du CC2 · Ex. 4 · Récursivité, équations de récurrence, master theorem · 6 pts · pour le CC2",t:"R : preuve par récurrence, Tₙ, trois appels au lieu d'un ; B : le master theorem",go:"a-calcul-complexite",who:BL2,
  en:`<p>On considère l'algorithme suivant :</p>${C(`Fonction : R (E n : entier) : entier
Spécifications : n ∈ ℕ. Renvoie 3^n - 1.
Début
   Si n = 0 alors
      Renvoyer 0
   Sinon
      Renvoyer 3*R(n-1) + 2
   FinSi
Fin`)}<ol><li>(2 points) Prouver par récurrence que la fonction R se termine et renvoie le bon résultat.</li><li>(1 point) On note T<sub>n</sub> le nombre d'opérations arithmétiques (additions, soustractions, multiplications) faites par l'appel R(n). Donner T<sub>0</sub>, puis T<sub>n</sub> en fonction de T<sub>n−1</sub>. En déduire T<sub>n</sub> et l'ordre de complexité de R.</li><li>(1,5 point) Un camarade remplace la ligne « Renvoyer 3*R(n-1) + 2 » par « Renvoyer R(n-1) + R(n-1) + R(n-1) + 2 ». On note T′<sub>n</sub> le nombre d'opérations arithmétiques de sa version. Montrer que T′<sub>n</sub> = 3T′<sub>n−1</sub> + 6, puis que la suite U<sub>n</sub> = T′<sub>n</sub> + 3 est géométrique. En déduire T′<sub>n</sub> et l'ordre de complexité.</li></ol><p>On considère maintenant :</p>${C(`Fonction : B (E n : entier) : entier
Spécifications : n ∈ ℕ.
Variables : s, i : entier
Début
   Si n ≤ 1 alors
      Renvoyer 1
   Sinon
      s ← 0
      Pour i de 1 à n faire
         s ← s + i
      finPour
      Renvoyer B(n div 2) + B(n div 2) + s
   FinSi
Fin`)}<ol start="4"><li>(1,5 point) On note T(n) le nombre d'opérations faites par l'appel B(n). Écrire une inégalité de la forme T(n) ≤ aT(n/b) + O(n<sup>d</sup>) en donnant a, b et d. En déduire l'ordre de complexité de B avec le master theorem.</li></ol>`,
  sol:`<p><b>1.</b></p><ol><li><b>Base</b> : pour n = 0, R renvoie 0, donc se termine. Et 3<sup>0</sup> − 1 = 1 − 1 = 0 : c'est le bon résultat.</li><li><b>Hérédité</b> : soit n &gt; 0. Supposons que R(n − 1) se termine et renvoie 3<sup>n−1</sup> − 1. L'appel R(n) fait des opérations élémentaires et un appel à R(n − 1), donc il se termine. Il renvoie 3(3<sup>n−1</sup> − 1) + 2 = 3<sup>n</sup> − 3 + 2 = 3<sup>n</sup> − 1 : c'est le bon résultat.</li><li><b>Conclusion</b> : pour tout n ∈ ℕ, R(n) se termine et renvoie 3<sup>n</sup> − 1.</li></ol><p><b>Barème</b> : 0,5 point pour la base, 1 point pour l'hérédité (dont 0,5 point pour le calcul), 0,5 point pour la conclusion. Il faut parler de l'arrêt <b>et</b> du résultat dans la base et dans l'hérédité.</p><p><b>2.</b> T<sub>0</sub> = 0 : R(0) renvoie 0 sans calcul. Pour n &gt; 0, R(n) fait une soustraction (n − 1), une multiplication et une addition, plus l'appel R(n − 1), qui fait T<sub>n−1</sub> opérations : <b>T<sub>n</sub> = T<sub>n−1</sub> + 3</b>.</p><p>On ajoute 3 à chaque rang : T<sub>n</sub> = T<sub>0</sub> + 3n = <b>3n</b>. R est en <b>θ(n)</b>. Vérification : pour n = 4, le programme compte 12 opérations.</p><p><b>Barème</b> : 0,5 point pour T<sub>0</sub> et l'équation, 0,5 point pour 3n et θ(n).</p><p><b>3.</b></p><ol><li>Pour n &gt; 0, la nouvelle ligne fait 3 appels à R(n − 1), chacun fait T′<sub>n−1</sub> opérations. Elle calcule n − 1 trois fois (3 soustractions) et fait 3 additions : <b>T′<sub>n</sub> = 3T′<sub>n−1</sub> + 6</b>, avec T′<sub>0</sub> = 0.</li><li>U<sub>n</sub> = T′<sub>n</sub> + 3 = 3T′<sub>n−1</sub> + 6 + 3 = 3T′<sub>n−1</sub> + 9 = 3(T′<sub>n−1</sub> + 3) = 3U<sub>n−1</sub>. La suite (U<sub>n</sub>) est géométrique de raison 3, de premier terme U<sub>0</sub> = 0 + 3 = 3.</li><li>Donc U<sub>n</sub> = 3 × 3<sup>n</sup> = 3<sup>n+1</sup>, et <b>T′<sub>n</sub> = 3<sup>n+1</sup> − 3</b>. T′<sub>n</sub>/3<sup>n</sup> tend vers 3 : la version du camarade est en <b>θ(3<sup>n</sup>)</b>.</li></ol><p>Elle renvoie le même résultat, mais pour n = 4 elle fait 240 opérations au lieu de 12 : appeler trois fois R(n − 1) refait trois fois le même calcul. Sur ta feuille, la règle « U<sub>n</sub> = T<sub>n</sub> + c » est celle de deux appels ; avec trois appels, on ajoute c/2 = 3, et l'énoncé le donne.</p><p><b>Barème</b> : 0,5 point pour l'équation, 0,5 point pour la suite géométrique, 0,5 point pour T′<sub>n</sub> et l'ordre.</p><p><b>4.</b></p><ol><li>B(n) fait <b>2 appels</b> (a = 2) sur une entrée de taille n div 2, la moitié (b = 2). Les deux appels sont écrits pareil, mais ils sont faits tous les deux : a = 2.</li><li>À côté des appels, la boucle fait n additions, plus 2 divisions et 2 additions dans le Renvoyer : n + 4 opérations, donc O(n) : <b>d = 1</b>.</li><li>T(n) ≤ 2T(n/2) + O(n). b<sup>d</sup> = 2<sup>1</sup> = 2 = a : c'est le cas du milieu, <b>T(n) = O(n log n)</b>.</li></ol><p>Vérification par programme : pour n = 1024, B fait 14 332 opérations, et 14 332/(1024 × 10) ≈ 1,4. Ce rapport se rapproche de 1 quand n grandit : on est bien en n log n.</p><p><b>Barème</b> : 0,5 point pour a et b, 0,5 point pour d, 0,5 point pour le cas et la conclusion.</p>`},
 {src:"Sujet blanc du CC2 · Ex. 5 · Un ordinateur plus rapide · 2 pts · pour le CC2",t:"Un ordinateur 64 fois plus rapide, pour n³ et pour 2ⁿ opérations",go:"a-complexite",who:BL2,
  en:`<p>Un algorithme fait exactement n³ opérations pour une entrée de taille n. En une minute, un ordinateur A traite une entrée de taille 1000. Un ordinateur B est 64 fois plus rapide que A.</p><ol><li>(1 point) Quelle taille d'entrée l'ordinateur B traite-t-il en une minute ?</li><li>(1 point) Même question pour un autre algorithme, qui fait exactement 2<sup>n</sup> opérations, quand A traite en une minute une entrée de taille 40.</li></ol>`,
  sol:`<p><b>1.</b> En une minute, A fait 1000³ opérations. B en fait 64 fois plus : 64 × 1000³ = 4³ × 1000³ = (4 × 1000)³ = 4000³. B traite une entrée de taille <b>4000</b>, 4 fois plus grande, et pas 64 fois.</p><p><b>2.</b> En une minute, A fait 2<sup>40</sup> opérations. B en fait 64 × 2<sup>40</sup> = 2<sup>6</sup> × 2<sup>40</sup> = 2<sup>46</sup>. B traite une entrée de taille <b>46</b>, seulement 6 de plus.</p><p>À retenir : plus l'algorithme est lent, moins un ordinateur plus rapide aide.</p><p><b>Barème</b> : 0,5 point pour le calcul, 0,5 point pour la taille, à chaque question.</p>`},
 {src:"CC1 octobre 2022 · Cours, questions 4 et 5 · pour le CC2",t:"o, Ω, θ et le master theorem",go:"a-complexite",who:OFF+" ; les contre-exemples sont de moi",
  en:`<p><b>4.</b> (a<sub>n</sub>) et (b<sub>n</sub>) sont deux suites strictement positives. Cocher la ou les affirmations vraies.</p><ul><li>☐ Si a<sub>n</sub> = o(b<sub>n</sub>) alors a<sub>n</sub> = Ω(b<sub>n</sub>) ;</li><li>☐ Si a<sub>n</sub> = Ω(b<sub>n</sub>) alors a<sub>n</sub> = θ(b<sub>n</sub>) ;</li><li>☐ Si a<sub>n</sub> = θ(b<sub>n</sub>) alors a<sub>n</sub> = O(b<sub>n</sub>) ;</li><li>☐ Si a<sub>n</sub> = O(b<sub>n</sub>) alors a<sub>n</sub> = Ω(b<sub>n</sub>) ;</li><li>☐ aucun des précédents.</li></ul><p><b>5.</b> A quoi sert le master theorem ?</p><p>(Les questions 1 à 3 de ce CC sont plus haut dans la liste. Les cinq questions valaient 5 points.)</p>`,
  sol:`<p><b>4.</b> Une seule case à cocher : « Si a<sub>n</sub> = θ(b<sub>n</sub>) alors a<sub>n</sub> = O(b<sub>n</sub>) » (si a est du même ordre que b alors a est dominée par b).</p><p>Les autres sont fausses. Contre-exemples : n = o(n²) mais n n'est pas Ω(n²) ; n² = Ω(n) mais n² n'est pas θ(n) ; n = O(n²) mais n n'est pas Ω(n²).</p><p><b>5.</b> Il permet d'avoir une approximation de la complexité d'un algorithme récursif dont la taille de l'entrée est divisée à chaque appel.</p>`},
 {src:"CC1 octobre 2022 · Ex. 3 · 5 pts · pour le CC2",t:"Trace, arrêt et invariant de G, qui calcule (N+1)²",go:"a-preuve",who:OFF+" ; la preuve de l'invariant, à la fin, est de moi",
  en:`<p>On considère l'algorithme suivant :</p>${C(`Fonction : G (E N : entier) : entier
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
Fin`)}<ol><li>On appelle j<sub>i</sub> et k<sub>i</sub> les valeurs de j et k à <b>la fin</b> de la i-ème itération. Compléter la trace de l'algorithme pour N=5 (un tableau à trois colonnes i, j<sub>i</sub>, k<sub>i</sub>, avec une ligne pour chaque i de 0 à 5).</li><li>Prouver que l'algorithme se termine.</li><li>Parmi les invariants suivants, cochez celui qui semble correct : ☐ k<sub>i</sub> = 2i + 1 ; ☐ k<sub>i</sub> = 2i − 1 ; ☐ k<sub>i</sub> = i² ; ☐ k<sub>i</sub> = (i + 1)².</li><li>En admettant que cet invariant soit correct, expliquez pourquoi l'algorithme renvoie le bon résultat.</li></ol>`,
  sol:`<p><b>1.</b></p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th class="var">i</th><th class="var">j<sub>i</sub></th><th class="var">k<sub>i</sub></th></tr></thead><tbody><tr><td>0</td><td>0</td><td>1</td></tr><tr><td>1</td><td>2</td><td>4</td></tr><tr><td>2</td><td>4</td><td>9</td></tr><tr><td>3</td><td>6</td><td>16</td></tr><tr><td>4</td><td>8</td><td>25</td></tr><tr><td>5</td><td>10</td><td>36</td></tr></tbody></table></div><p><b>2.</b> i est initialisé à 0 et augmente de 1 à chaque itération. Après N itérations, i = N donc la boucle se termine et l'algorithme aussi.</p><p><b>3.</b> k<sub>i</sub> = (i + 1)² (lecture sur le tableau de valeurs).</p><p><b>4.</b> À la fin du TantQue, i = N donc l'algorithme renvoie k<sub>N</sub> = (N + 1)².</p><p><b>En plus, si on te demande de prouver l'invariant</b> (méthode du cours de cette année) :</p><ul><li>Équations d'itération : j<sub>0</sub> = 0, k<sub>0</sub> = 1 et, pour i > 0, j<sub>i</sub> = i + i = 2i, k<sub>i</sub> = j<sub>i</sub> + k<sub>i−1</sub> + 1 = k<sub>i−1</sub> + 2i + 1.</li><li>Invariant : Inv<sub>i</sub> : « k<sub>i</sub> = (i + 1)² ».</li><li>Initialisation : k<sub>0</sub> = 1 = (0 + 1)², donc Inv<sub>0</sub> est vrai.</li><li>Récurrence : si Inv<sub>i−1</sub> est vrai, c'est-à-dire si k<sub>i−1</sub> = i², comme k<sub>i</sub> = k<sub>i−1</sub> + 2i + 1, alors k<sub>i</sub> = i² + 2i + 1 = (i + 1)² : Inv<sub>i</sub> est vrai.</li><li>Conclusion : l'invariant est vrai pour toutes les itérations.</li></ul>`},
 {src:"CC1 novembre 2024 · Cours, questions 4 et 5 (les 4 sujets) · pour le CC2",t:"Un million de fois plus lent ? À quoi servent les équations de récurrence ?",go:"a-complexite",who:OFF,
  en:`<p><b>4.</b> Un algorithme de complexité Θ(n³) peut-il être un million de fois plus lent qu'un autre algorithme de complexité Θ(n³) ? Justifier.</p><p>Dans les trois autres sujets, la même question avec : Θ(n²) et « un million de fois » ; Θ(n.log(n)) et « mille fois » ; Θ(log(n)) et « mille fois ».</p><p><b>5.</b> Dans une preuve de validité d'un algorithme itératif, à quoi servent les équations de récurrence ?</p><p>(Les 5 questions de cours valaient 7,5 points. La question 1 est plus haut dans la liste, les questions 2 et 3 plus bas. Cette année, le cours appelle « équations d'itération » les équations de la question 5.)</p>`,
  sol:`<p><b>4.</b> Oui, si par exemple le premier fait 1000000n³ opérations et le deuxième n³ opérations.</p><p>Autres sujets : « Oui, si par exemple le premier fait 1000000n² opérations et le deuxième n² opérations. » ; « Oui, si par exemple le premier fait 1000 log n opérations et le deuxième log n opérations. » Pour Θ(n.log(n)), le corrigé écrit 1000000n log n alors que la question dit « mille fois » : 1000 n log n suffit.</p><p><b>5.</b> Elles traduisent le fonctionnement de l'algorithme sous forme de relations entre les variables. Elles permettent de montrer qu'un invariant est héréditaire, c'est à dire que s'il est vrai à l'itération n, alors il est vrai à l'itération n+1.</p>`},
 {src:"Examen janvier 2023 · Ex. 1 · 3,5 pts · pour le CC2",t:"La procédure Dessin : le dessin, puis l'arrêt",go:"a-preuve",who:OFF+" (figure et preuve) ; le tableau et les explications sont de moi",
  en:`<p>On dispose de la procédure Dessin ci-dessous. Elle appelle la procédure Segment(E x1, y1, x2, y2 : entier) qui dessine un segment entre le point de coordonnées (x1,y1) et le point de coordonnées (x2,y2).</p>${C(`Procédure : Dessin (E i,j : entier)
Variables : a, b, c, d : entier
Début
   a, b ← i, j
   tant que a>0 et b>0 faire
      si a mod 2 = 0 alors
         c ← a div 2
         d ← b-1
      sinon
         c ← b
         d ← a-1
      finSi
      Segment (a,b,c,d)
      a, b ← c, d
   finTantQue
Fin`)}<ol><li>Sur la feuille réponse, représenter le dessin produit par l'appel Dessin(10,10). (La feuille réponse donne un repère, avec x et y gradués de 0 à 10.)</li><li>Démontrer que la procédure Dessin se termine.</li></ol>`,
  sol:`<p><b>1.</b> (1,5 pt) Une ligne par itération :</p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>a, b</th><th>a pair ?</th><th>c, d</th><th>segment tracé</th></tr></thead><tbody><tr><td>10, 10</td><td>oui</td><td>5, 9</td><td>de (10,10) à (5,9)</td></tr><tr><td>5, 9</td><td>non</td><td>9, 4</td><td>de (5,9) à (9,4)</td></tr><tr><td>9, 4</td><td>non</td><td>4, 8</td><td>de (9,4) à (4,8)</td></tr><tr><td>4, 8</td><td>oui</td><td>2, 7</td><td>de (4,8) à (2,7)</td></tr><tr><td>2, 7</td><td>oui</td><td>1, 6</td><td>de (2,7) à (1,6)</td></tr><tr><td>1, 6</td><td>non</td><td>6, 0</td><td>de (1,6) à (6,0)</td></tr></tbody></table></div><p>Ensuite a, b = 6, 0 : b n'est plus > 0, la boucle s'arrête. Le dessin est une ligne brisée :</p><svg viewBox="0 0 215 205" style="max-width:300px;width:100%;height:auto;display:block;margin:6px 0" role="img" aria-label="Dessin(10,10) : une ligne brisée de (10,10) à (6,0)"><g stroke="currentColor" fill="none"><path stroke-width="1" d="M30.0 186.0L201.2 186.0"/><path stroke-width="1" d="M30.0 186.0L30.0 14.8"/><path stroke-width="1" d="M46.0 187.9L46.0 184.1"/><path stroke-width="1" d="M62.0 187.9L62.0 184.1"/><path stroke-width="1" d="M78.0 187.9L78.0 184.1"/><path stroke-width="1" d="M94.0 187.9L94.0 184.1"/><path stroke-width="1" d="M110.0 187.9L110.0 184.1"/><path stroke-width="1" d="M126.0 187.9L126.0 184.1"/><path stroke-width="1" d="M142.0 187.9L142.0 184.1"/><path stroke-width="1" d="M158.0 187.9L158.0 184.1"/><path stroke-width="1" d="M174.0 187.9L174.0 184.1"/><path stroke-width="1" d="M190.0 187.9L190.0 184.1"/><path stroke-width="1" d="M28.1 170.0L31.9 170.0"/><path stroke-width="1" d="M28.1 154.0L31.9 154.0"/><path stroke-width="1" d="M28.1 138.0L31.9 138.0"/><path stroke-width="1" d="M28.1 122.0L31.9 122.0"/><path stroke-width="1" d="M28.1 106.0L31.9 106.0"/><path stroke-width="1" d="M28.1 90.0L31.9 90.0"/><path stroke-width="1" d="M28.1 74.0L31.9 74.0"/><path stroke-width="1" d="M28.1 58.0L31.9 58.0"/><path stroke-width="1" d="M28.1 42.0L31.9 42.0"/><path stroke-width="1" d="M28.1 26.0L31.9 26.0"/><path stroke-width="1.8" d="M190.0 26.0L110.0 42.0L174.0 122.0L94.0 58.0L62.0 74.0L46.0 90.0L126.0 186.0"/></g><g fill="currentColor" stroke="none"><circle cx="190.0" cy="26.0" r="2"/><circle cx="110.0" cy="42.0" r="2"/><circle cx="174.0" cy="122.0" r="2"/><circle cx="94.0" cy="58.0" r="2"/><circle cx="62.0" cy="74.0" r="2"/><circle cx="46.0" cy="90.0" r="2"/><circle cx="126.0" cy="186.0" r="2"/></g><g fill="currentColor" stroke="none" font-size="11"><text x="43.0" y="199.0">1</text><text x="59.0" y="199.0">2</text><text x="75.0" y="199.0">3</text><text x="91.0" y="199.0">4</text><text x="107.0" y="199.0">5</text><text x="123.0" y="199.0">6</text><text x="139.0" y="199.0">7</text><text x="155.0" y="199.0">8</text><text x="171.0" y="199.0">9</text><text x="184.0" y="199.0">10</text><text x="15.0" y="174.0">1</text><text x="15.0" y="158.0">2</text><text x="15.0" y="142.0">3</text><text x="15.0" y="126.0">4</text><text x="15.0" y="110.0">5</text><text x="15.0" y="94.0">6</text><text x="15.0" y="78.0">7</text><text x="15.0" y="62.0">8</text><text x="15.0" y="46.0">9</text><text x="11.0" y="30.0">10</text><text x="19.0" y="199.0">0</text><text x="203.2" y="190.0">x</text><text x="26.0" y="11.8">y</text></g></svg><p><b>2.</b> (2 pts) L'expression entière a + b vaut initialement i + j et décroît strictement à chaque itération. Comme le tant que s'arrête lorsque a ≤ 0 ou b ≤ 0, il effectue au maximum i + j itérations. Il y a donc un nombre fini d'itérations donc l'algorithme s'arrête.</p><p>Pourquoi a + b décroît : si a est pair, le nouveau a + b vaut a div 2 + b − 1, plus petit que a + b. Sinon il vaut b + a − 1.</p>`},
 {src:"Examen janvier 2023 · Ex. 2 · 3 pts · pour le CC2",t:"Un ordinateur 200 fois plus rapide",go:"a-complexite",who:OFF,
  en:`<p>On implémente sur ordinateur un algorithme avec un temps d'exécution proportionnel à n log<sub>10</sub>(n), où n est la taille de l'entrée.</p><p>Un premier ordinateur A traite une entrée de taille 100 en une minute. L'ordinateur B est 200 fois plus rapide que A, quelle taille d'entrée peut-il traiter pendant la même durée ?</p><p>Pour faciliter les calculs, on donne les valeurs de n log<sub>10</sub>(n) pour quelques valeurs de n.</p><div style="overflow-x:auto"><table class="tbl tr"><tbody><tr><td>n</td><td>1</td><td>10</td><td>100</td><td>1000</td><td>10000</td><td>100000</td></tr><tr><td>n log<sub>10</sub>(n)</td><td>0</td><td>10</td><td>200</td><td>3000</td><td>40000</td><td>500000</td></tr></tbody></table></div>`,
  sol:`<p>(3 pts dont 1,5 pt raisonnement, 1,5 pt calculs.)</p><p>On note k le coefficient de proportionnalité entre le temps d'exécution (en minutes) sur l'ordinateur A et n log<sub>10</sub>(n). Les informations sur l'ordinateur A s'écrivent 1 = k × 100 log<sub>10</sub>(100) = k × 200 donc k = 1/200.</p><p>On note n<sub>1</sub> la taille d'entrée traitée par B en une minute. Les informations sur l'ordinateur B s'écrivent 1 = (k/200) × n<sub>1</sub> log<sub>10</sub>(n<sub>1</sub>) d'où n<sub>1</sub> log<sub>10</sub>(n<sub>1</sub>) = 40000 et finalement <b>n<sub>1</sub> = 10000</b>.</p>`},
 {src:"Examen janvier 2023 · Ex. 3 · 8,5 pts · pour le CC2",t:"F et G : récurrence, équation de récurrence, affichage, master theorem",go:"a-calcul-complexite",who:OFF+" (une coquille signalée)",
  en:`<p>On dispose des deux algorithmes F et G suivants. La procédure aLaLigne() passe à la ligne suivante, la procédure affiche(E n : entier) affiche n sans passer à la ligne.</p>${C(F23)}${C(`Procédure : G (E n : entier, E d : entier)
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
Fin`)}${QF23}<ol><li>Prouver par récurrence que la fonction F se termine et renvoie le bon résultat.</li><li>On note T<sub>n</sub> le nombre d'opérations arithmétiques (additions, soustractions, multiplications, divisions) faites par F lorsqu'on l'appelle avec le paramètre n. Ecrire l'équation de récurrence vérifiée par T<sub>n</sub> puis exprimer T<sub>n</sub> en fonction de n.<br><b>Indication :</b> montrer que U<sub>n</sub> = T<sub>n</sub> + 4 est une suite géométrique.</li><li>Quel est l'ordre de complexité en temps de F ? Proposer un algorithme radicalement plus efficace que F qui renvoie le même résultat.</li><li>Sur la feuille réponse, écrire l'affichage que produit l'appel G(6, 0).</li><li>En utilisant le master theorem, donner un ordre de grandeur de la complexité en temps de G en fonction de n. Les procédures affiche et aLaLigne ont une complexité en temps θ(1).</li></ol>`,
  sol:`<p><b>1.</b> (2 pts)</p>${SOLF1}<p><b>2.</b> (2 pts : 1 pt pour l'équation, 1 pt pour la résolution)</p>${SOLF2}<p><b>3.</b> (1,5 pt dont 0,5 pt pour l'ordre de complexité et 1 pt pour l'algo plus efficace. −0,5 si l'amélioration consiste à mémoriser F(n−1) dans une variable.)</p><p>L'ordre de complexité en temps de F est θ(2<sup>n</sup>). Un algorithme en θ(1) renvoyant le même résultat est : <code>Renvoyer 1 / (n+1)</code></p><p><b>4.</b> (1,5 pt)</p>${C(`000000
000
0
1
111
1
2`)}<p>Explication (de moi) : G(6,0) affiche six 0, puis lance G(3,0) et G(3,1). G(3,0) affiche 000, puis lance G(1,0), qui affiche 0, et G(1,1), qui affiche 1. G(3,1) affiche 111, puis lance G(1,1) et G(1,2), qui affichent 1 et 2. Un appel avec n = 0 n'affiche rien.</p><p><b>5.</b> (1,5 pt : 1 pt pour l'équation, 0,5 pt pour la résolution)</p><p>Le nombre d'opérations élémentaires T<sub>n</sub> effectuées par l'appel G(n, d) vérifie, pour n > 0 : T<sub>n</sub> = θ(n) + 2T<sub>⌊n/2⌋</sub>. Par application du master theorem avec a = 2, b = 2, d = 1, on a b<sup>d</sup> = a donc T<sub>n</sub> = O(n log(n)).</p><p>L'exercice 5 de l'examen PEIP de mai 2023 (5 pts) reprend F avec les questions 1 à 3, et demande seulement l'ordre de complexité à la fin.</p>`},
 {src:"Examen PEIP mai 2023 · Ex. 1 · 3 pts · pour le CC2",t:"La procédure Dessin, avec des cercles",go:"a-preuve",who:MOI,
  en:`<p>On dispose de la procédure Dessin ci-dessous. Elle appelle la procédure Cercle(E x, y : entier) qui dessine un cercle de centre (x,y) et de rayon 1.</p>${C(`Procédure : Dessin (E i,j : entier)
Variables : x, y, a, b, r : entier
Début
   x, y ← i, j
   tant que x>0 et y>0 faire
      si x mod 2 = 0 alors
         x ← x div 2
         y ← y-1
      sinon
         x ← y
         y ← x-1
      finSi
      Cercle (x,y)
   finTantQue
Fin`)}<ol><li>Sur la feuille réponse, représenter à main levée le dessin produit par l'appel Dessin(7,7).</li><li>Démontrer que la procédure Dessin se termine.</li></ol>`,
  sol:`<p><b>1.</b> Le piège est dans le sinon : « x ← y » est exécuté d'abord, puis « y ← x-1 » utilise le <b>nouveau</b> x. Si x est impair, (x, y) devient donc (y, y − 1).</p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th>x, y au début du tour</th><th>x pair ?</th><th>nouveaux x, y</th><th>cercle de centre</th></tr></thead><tbody><tr><td>7, 7</td><td>non</td><td>7, 6</td><td>(7,6)</td></tr><tr><td>7, 6</td><td>non</td><td>6, 5</td><td>(6,5)</td></tr><tr><td>6, 5</td><td>oui</td><td>3, 4</td><td>(3,4)</td></tr><tr><td>3, 4</td><td>non</td><td>4, 3</td><td>(4,3)</td></tr><tr><td>4, 3</td><td>oui</td><td>2, 2</td><td>(2,2)</td></tr><tr><td>2, 2</td><td>oui</td><td>1, 1</td><td>(1,1)</td></tr><tr><td>1, 1</td><td>non</td><td>1, 0</td><td>(1,0)</td></tr></tbody></table></div><p>Ensuite y = 0 : la boucle s'arrête. Sept cercles de rayon 1 :</p><svg viewBox="0 0 185 180" style="max-width:300px;width:100%;height:auto;display:block;margin:6px 0" role="img" aria-label="Dessin(7,7) : sept cercles de rayon 1"><g stroke="currentColor" fill="none"><path stroke-width="1" d="M30.0 150.0L169.2 150.0"/><path stroke-width="1" d="M30.0 150.0L30.0 26.8"/><path stroke-width="1" d="M46.0 151.9L46.0 148.1"/><path stroke-width="1" d="M62.0 151.9L62.0 148.1"/><path stroke-width="1" d="M78.0 151.9L78.0 148.1"/><path stroke-width="1" d="M94.0 151.9L94.0 148.1"/><path stroke-width="1" d="M110.0 151.9L110.0 148.1"/><path stroke-width="1" d="M126.0 151.9L126.0 148.1"/><path stroke-width="1" d="M142.0 151.9L142.0 148.1"/><path stroke-width="1" d="M158.0 151.9L158.0 148.1"/><path stroke-width="1" d="M28.1 134.0L31.9 134.0"/><path stroke-width="1" d="M28.1 118.0L31.9 118.0"/><path stroke-width="1" d="M28.1 102.0L31.9 102.0"/><path stroke-width="1" d="M28.1 86.0L31.9 86.0"/><path stroke-width="1" d="M28.1 70.0L31.9 70.0"/><path stroke-width="1" d="M28.1 54.0L31.9 54.0"/><path stroke-width="1" d="M28.1 38.0L31.9 38.0"/><circle cx="142.0" cy="54.0" r="16.0" stroke-width="1.6"/><circle cx="126.0" cy="70.0" r="16.0" stroke-width="1.6"/><circle cx="78.0" cy="86.0" r="16.0" stroke-width="1.6"/><circle cx="94.0" cy="102.0" r="16.0" stroke-width="1.6"/><circle cx="62.0" cy="118.0" r="16.0" stroke-width="1.6"/><circle cx="46.0" cy="134.0" r="16.0" stroke-width="1.6"/><circle cx="46.0" cy="150.0" r="16.0" stroke-width="1.6"/></g><g fill="currentColor" stroke="none"><circle cx="142.0" cy="54.0" r="2"/><circle cx="126.0" cy="70.0" r="2"/><circle cx="78.0" cy="86.0" r="2"/><circle cx="94.0" cy="102.0" r="2"/><circle cx="62.0" cy="118.0" r="2"/><circle cx="46.0" cy="134.0" r="2"/><circle cx="46.0" cy="150.0" r="2"/></g><g fill="currentColor" stroke="none" font-size="11"><text x="43.0" y="163.0">1</text><text x="59.0" y="163.0">2</text><text x="75.0" y="163.0">3</text><text x="91.0" y="163.0">4</text><text x="107.0" y="163.0">5</text><text x="123.0" y="163.0">6</text><text x="139.0" y="163.0">7</text><text x="155.0" y="163.0">8</text><text x="15.0" y="138.0">1</text><text x="15.0" y="122.0">2</text><text x="15.0" y="106.0">3</text><text x="15.0" y="90.0">4</text><text x="15.0" y="74.0">5</text><text x="15.0" y="58.0">6</text><text x="15.0" y="42.0">7</text><text x="19.0" y="163.0">0</text><text x="171.2" y="154.0">x</text><text x="26.0" y="23.8">y</text></g></svg><p><b>2.</b> Sur le modèle du corrigé de janvier 2023. L'entier y vaut initialement j et décroît strictement à chaque itération : il diminue de 1 dans les deux cas (si x est pair, y ← y-1 ; sinon y reçoit le nouveau x moins 1, c'est-à-dire l'ancien y moins 1). Comme le tant que s'arrête lorsque x ≤ 0 ou y ≤ 0, il effectue au maximum j itérations. Il y a donc un nombre fini d'itérations donc la procédure se termine.</p><p>(Les variables a, b et r sont déclarées dans le sujet mais ne servent pas.)</p>`},
 {src:"Examen PEIP mai 2023 · Ex. 2 · 3 pts · pour le CC2",t:"La plus grande somme de p éléments qui se suivent, en temps linéaire",go:"a-calcul-complexite",who:MOI,
  en:`<p>On souhaite écrire une fonction qui, étant donnés une liste d'entiers L et un entier p compris entre 1 et la taille de la liste, calcule et renvoie la plus grande somme possible de p éléments qui se suivent dans la liste. Par exemple, pour L = [5, 2, −8, 9, 0, 4] et p = 4, l'algorithme renvoie 8, c'est à dire 5 + 2 − 8 + 9.</p><p>Proposer un algorithme de complexité <b>linéaire</b> répondant au problème.</p>`,
  sol:`<p><b>L'idée.</b> Recalculer chaque somme de p éléments coûterait environ n × p additions : ce n'est pas linéaire. On fait <b>glisser</b> la somme : pour passer d'un groupe de p éléments au suivant, on ajoute l'élément qui entre et on retire celui qui sort. Avec des listes, on garde deux listes : gauche commence au premier élément du groupe, droite commence juste après le groupe.</p>${C(`FONCTION : sommeMaxP (E L : liste d'entiers, E p : entier) : entier
SPÉCIFICATIONS : p est compris entre 1 et le nombre d'éléments de L.
                 Renvoie la plus grande somme de p éléments qui se suivent dans L.
Variable : gauche, droite : liste d'entiers
           s, best : entier
DÉBUT
    s ← 0
    droite ← L
    pour i de 1 à p faire
        s ← s + tête(droite)
        droite ← queue(droite)
    fin pour;
    best ← s
    gauche ← L
    tant que non estVide(droite) faire
        s ← s + tête(droite) - tête(gauche)
        gauche ← queue(gauche)
        droite ← queue(droite)
        si s > best alors
            best ← s
        fin si;
    fin tq;
    Renvoyer best
FIN`)}<p><b>Sur l'exemple</b> : après le pour, s = 5 + 2 − 8 + 9 = 8. Puis s = 8 + 0 − 5 = 3, puis s = 3 + 4 − 2 = 5. Le plus grand est 8.</p><p><b>Complexité</b> : on note n le nombre d'éléments de L. Le pour fait p itérations, le tant que n − p itérations, chacune avec un nombre constant d'opérations : n itérations à coût constant, donc θ(n). L'algorithme est linéaire.</p>`},
 {src:"Examen PEIP mai 2023 · Ex. 3 · 3 pts · pour le CC2",t:"Trois ordres de complexité",go:"a-calcul-complexite",who:MOI,
  en:`<p>Déterminer l'ordre de complexité des morceaux de code suivants en fonction de l'entier n. Justifier brièvement. On prendra en compte uniquement le nombre d'opérations élémentaires <code>&lt;op elem&gt;</code>.</p><p><b>1.</b></p>${C(`Pour i de 1 à √n faire
   Pour j de 1 à n² faire
      <op elem>
   finPour
finPour`)}<p><b>2.</b></p>${C(`i, j ← 0, 0
Tant que i<n faire
   <op elem>
   j ← j+1
   si j=n alors
      i ← i+1
      j ← 0
   finSi
finTantQue`)}<p><b>3.</b></p>${C(`Procédure F(E n : entier)
   si n=0 alors
      <op elem>
   sinon
      F(n div 3)
      <op elem>
      F(n div 3)
   finSi`)}`,
  sol:`<ol><li>i prend √n valeurs et, pour chacune, j prend n² valeurs : √n × n² opérations élémentaires. L'ordre de complexité est <b>θ(n²√n)</b>, c'est-à-dire θ(n<sup>2,5</sup>).</li><li>j augmente de 1 à chaque itération ; quand il atteint n, il revient à 0 et i augmente de 1. Il faut donc n itérations pour que i augmente de 1, et i doit aller de 0 à n : n × n = n² itérations, une opération élémentaire à chaque fois. <b>θ(n²)</b>.</li><li>Équation de complexité : T<sub>0</sub> = 1 et, pour n > 0, T<sub>n</sub> = 2T<sub>n div 3</sub> + 1. Master theorem : 2 appels récursifs (a = 2), la taille est divisée par 3 (b = 3), une opération en dehors des appels, O(1) = O(n<sup>0</sup>) (d = 0). b<sup>d</sup> = 1 &lt; a, donc <b>T<sub>n</sub> = O(n<sup>log 2 / log 3</sup>)</b>, environ O(n<sup>0,63</sup>).</li></ol><p>Vérification par programme : pour le 1, exactement √n × n² opérations quand n est un carré ; pour le 2, exactement n² ; pour le 3, T<sub>n</sub> = 2<sup>k+2</sup> − 1 quand n = 3<sup>k</sup> (3, 7, 15, 31…).</p>`},
 {src:"Examen PEIP mai 2023 · Ex. 6 · 5 pts · pour le CC2",t:"Trace, invariant et preuve de la fonction G",go:"a-preuve",who:MOI,
  en:`<p>On considère l'algorithme suivant :</p>${C(`Fonction G(E n : entier) : entier
Variables : a, b : entier
Début
   a, b ← 0, 0
   Pour i de 1 à n faire
      a ← a + 3*b + 3*i + 1
      b ← b + 2*i + 1
   finPour
   Renvoyer a
Fin`)}<ol><li>Faire une trace de l'algorithme pour n=4.</li><li>On revient au cas général et on appelle a<sub>i</sub> et b<sub>i</sub> les valeurs de a et b à la fin de l'itération i. Proposer un invariant de boucle exprimant a<sub>i</sub> et b<sub>i</sub> en fonction de i.</li><li>Prouver cet invariant par récurrence.</li><li>Que calcule la fonction G ?</li></ol>`,
  sol:`<p><b>1.</b> Attention à l'ordre : a est calculé avec l'<b>ancien</b> b, puis b change.</p><div style="overflow-x:auto"><table class="tbl tr"><thead><tr><th class="var">i</th><th class="var">a<sub>i</sub></th><th class="var">b<sub>i</sub></th></tr></thead><tbody><tr><td>0</td><td>0</td><td>0</td></tr><tr><td>1</td><td>4</td><td>3</td></tr><tr><td>2</td><td>20</td><td>8</td></tr><tr><td>3</td><td>54</td><td>15</td></tr><tr><td>4</td><td>112</td><td>24</td></tr></tbody></table></div><p>G(4) renvoie 112.</p><p><b>2.</b> Pour b : 3, 8, 15, 24, c'est un de moins que les carrés 4, 9, 16, 25. Donc b<sub>i</sub> = (i + 1)² − 1 = i² + 2i. Pour a : 4 = 1 × 4, 20 = 4 × 5, 54 = 9 × 6, 112 = 16 × 7, donc a<sub>i</sub> = i²(i + 3) = i³ + 3i².</p><p>Invariant proposé : Inv<sub>i</sub> : « a<sub>i</sub> = i³ + 3i² et b<sub>i</sub> = i² + 2i ».</p><p><b>3.</b> Équations d'itération (la vérité) : a<sub>0</sub> = 0, b<sub>0</sub> = 0 et, pour i > 0, a<sub>i</sub> = a<sub>i−1</sub> + 3b<sub>i−1</sub> + 3i + 1 et b<sub>i</sub> = b<sub>i−1</sub> + 2i + 1.</p><ul><li><b>Initialisation</b> : a<sub>0</sub> = 0 = 0³ + 3 × 0² et b<sub>0</sub> = 0 = 0² + 2 × 0. Inv<sub>0</sub> est vrai.</li><li><b>Récurrence</b> : on suppose Inv<sub>i−1</sub> vrai (1 ≤ i ≤ n) : a<sub>i−1</sub> = (i − 1)³ + 3(i − 1)² et b<sub>i−1</sub> = (i − 1)² + 2(i − 1) = i² − 1.<br>Alors b<sub>i</sub> = i² − 1 + 2i + 1 = i² + 2i.<br>Et a<sub>i</sub> = (i − 1)³ + 3(i − 1)² + 3(i² − 1) + 3i + 1 = (i³ − 3i² + 3i − 1) + (3i² − 6i + 3) + (3i² − 3) + 3i + 1 = i³ + 3i².<br>Donc Inv<sub>i</sub> est vrai.</li><li><b>Conclusion</b> : l'invariant est vrai pour toutes les itérations.</li></ul><p><b>4.</b> À la fin des n itérations, a<sub>n</sub> = n³ + 3n². <b>G calcule n³ + 3n²</b>, c'est-à-dire n²(n + 3). (Vérifié par programme pour n de 0 à 39.)</p>`},
 {src:"CC1 novembre 2024 · Cours, questions 2 et 3 (les 4 sujets) · pour le CC3",t:"Quel tri pour Luc ? Combien de mesures pour Sarah, d'essais pour Mr Bricks ?",go:"a-tri-bulles",who:OFF,
  en:`<p><b>2.</b> Quatre versions, une par sujet :</p><ul><li>(a) Luc veut ranger ses vaisseaux spatiaux par ordre de taille. Sa seule action possible est de permuter deux vaisseaux voisins. Peut-il arriver à ranger ses vaisseaux avec un tri du cours ? Justifier.</li><li>(b) Luc veut ranger ses nombreux vaisseaux spatiaux, de 5 modèles différents, par ordre de taille. Son hangar est immense et il peut les placer comme il veut. Parmi les tris du cours, lequel doit-il adapter pour fournir le moins d'efforts possible ? Justifier.</li><li>(c) Luc veut ranger ses vaisseaux spatiaux par ordre de taille. Sa seule action possible est de permuter deux vaisseaux. Citer deux tris du cours qui lui permettent d'y arriver.</li><li>(d) Luc veut ranger ses vaisseaux spatiaux, de modèles tous différents, par ordre de taille. Son hangar est immense et il peut les placer comme il veut. Parmi les tris du cours, lequel doit-il adapter pour fournir le moins d'efforts possible ? Justifier.</li></ul><p><b>3.</b> Deux versions :</p><ul><li>(a) Princesse Sarah a rangé ses 128 chevaux par ordre de taille (ils ont tous des tailles différentes). Elle cherche Neptune, qui mesure 1m65 au garrot. Combien de chevaux doit-elle mesurer pour trouver Neptune ? Justifier.</li><li>(b) Les 12000 légos de Mr Bricks sont rangées par taille. Il doit faire 14 essais au maximum pour trouver un modèle en particulier. Combien lui en faudrait-il s'il avait 24000 légos ? Justifier.</li></ul>`,
  sol:`<p><b>2.</b></p><ul><li>(a) Oui, Luc peut utiliser le tri à bulles, qui repose entièrement sur la permutation d'éléments voisins.</li><li>(b) Comme Luc n'a que 5 modèles différents, il peut utiliser un tri par valeurs : il range chaque modèle dans une zone différente de son hangar, puis il les remet en ligne, en commençant par le plus petit modèle jusqu'au plus grand. Il fait ainsi un tri en θ(n) qui lui garantit un effort minimal.</li><li>(c) Il peut utiliser le tri à bulles ou le tri par sélection, qui reposent sur la permutation d'éléments.</li><li>(d) Comme les modèles sont tous différents, Luc ne peut pas utiliser un tri par valeurs et doit faire un tri par comparaison. Le tri par comparaison le plus efficace du cours est le tri fusion, qui peut être adapté au cas de Luc qui n'a pas de problème de stockage.</li></ul><p><b>3.</b></p><ul><li>(a) Comme les chevaux sont rangés par taille, Princesse Sarah peut effectuer une recherche dichotomique. A chaque mesure, le nombre de chevaux parmi lesquels chercher est divisé par deux. Dans le pire cas où elle trouve Neptune à la dernière mesure, le nombre de mesures est le nombre de fois qu'il faut diviser 128 par 2 pour trouver 1, c'est à dire 7 fois.</li><li>(b) Comme les légos sont rangés par taille, Mr Bricks peut effectuer une recherche par dichotomie. Après son premier essai, le nombre de légos où chercher est divisé par 2, c'est à dire égal à 12000, donc il lui reste 14 essais au maximum. Au total il lui faut au maximum 15 essais.</li></ul>`},
 {src:"Examen janvier 2023 · Ex. 4 · 5 pts · pour le CC3",t:"Trier un tableau de chiffres, puis listeDiff",go:"a-tri-valeurs",who:OFF+" (un oubli signalé dans la question 2)",
  en:`<p>Dans cet exercice, un nombre est représenté par un tableau de chiffres. Par exemple, le nombre 2022 est représenté par le tableau [2,0,2,2].</p><ol><li>On souhaite écrire un algorithme qui trie un tableau de chiffres de taille n. Anakin affirme pouvoir l'écrire en θ(n²), Leia en θ(n log(n)), Chewbacca en θ(n) et Luke en θ(1). Parmi ces propositions, lesquelles sont impossibles ? Justifier. Parmi les autres, donner le nom d'un tri du cours qui permet d'obtenir le meilleur ordre de complexité.</li><li>Ecrire une fonction listeDiff qui, étant donné un tableau de chiffres T, calcule et renvoie la liste des chiffres différents qu'il contient. L'ordre des éléments dans la liste est sans importance. Par exemple, listeDiff([2,0,2,2]) renvoie la liste [2,0] ou la liste [0,2]. Vous pourrez utiliser la fonction nbOccurrences(e, T) qui renvoie le nombre de fois où l'élément e est présent dans le tableau T (complexité : θ(taille(T))).</li><li>Quel est l'ordre de complexité en temps de votre fonction listeDiff ?</li></ol>`,
  sol:`<p><b>1.</b> (2 pts dont 1,5 pt pour l'ordre de complexité optimal et 0,5 pt pour le nom du tri. −0,5 pt si la complexité optimale proposée est θ(n log(n)) avec un nom de tri cohérent.)</p><p>La proposition de Luke est impossible, car il faut au moins parcourir le tableau pour pouvoir le trier, donc l'algorithme de tri est en Ω(n). La proposition de Chewbacca est possible, car chaque chiffre peut prendre uniquement 10 valeurs, donc on peut trier le tableau par valeurs avec une complexité en temps θ(n). Les propositions d'Anakin et Leia sont moins performantes donc possibles aussi.</p><p><b>2.</b> (2 pts. Utilisation des listes à la python avec append, + etc. sanctionnée.) Une correction linéaire sans nbOccurrences :</p>${C(`Fonction : listeDiff (E T : tableau d'entiers) : liste d'entiers
Spécifications : renvoie la liste des chiffres différents de T
Variables : L : liste d'entiers, T2 : tableau de taille(T) entiers
Début
   L ← [ ]
   Pour i de 0 à taille(T)-1 faire
      T2[i] ← T[i]
   finPour
   triValeurs(T2,10)
   Pour i de 1 à taille(T)-1 faire
      si T2[i]≠T2[i-1] alors
         L ← cons(T2[i], L)
      finSi
   finPour
   Renvoyer L
Fin`)}<p><b>Attention, un oubli dans ce corrigé officiel</b> : la deuxième boucle commence à i = 1 et n'ajoute T2[i] que s'il est différent du précédent. Le plus petit chiffre, T2[0], n'est donc jamais ajouté : pour [2,0,2,2], T2 = [0,2,2,2] et la fonction renvoie [2] au lieu de [2,0] (vérifié par programme). Il suffit de remplacer « L ← [ ] » par « L ← cons(T2[0], [ ]) », après le tri, pour un tableau non vide.</p><p><b>3.</b> (1 pt) Le tri par valeurs est en θ(n) et les deux boucles pour aussi, d'où une complexité en temps θ(n).</p>`},
 {src:"Examen PEIP mai 2023 · Ex. 4 · 3 pts · pour le CC3",t:"Le tri de John : deux trous à remplir",go:"a-tri-insertion",who:MOI,
  en:`<p>John propose l'algorithme de tri suivant :</p>${C(`Procédure : triJohn (E T : tableau d'entier)
Spécifications : trie le tableau T par ordre croissant
Début
   Pour i de 0 à taille(T)-1 faire
      a ← T[i]
      j ← ❶
      Tant que j>=0 et T[j]>a faire
         T[j+1] ← T[j]
         j ← j-1
      FinTantQue
      T[❷] ← a
   FinPour
Fin`)}<p>Que doit mettre John à la place de ❶ et ❷ pour que l'algorithme fonctionne ?</p>`,
  sol:`<p><b>❶ : i-1</b> et <b>❷ : j+1</b>.</p><p>C'est le tri par insertion (cours, diapo 114 : « T[k] est inséré parmi T[0] à T[k-1] »). À l'itération i, les cases T[0] à T[i-1] sont déjà triées.</p><ul><li>a garde la valeur de T[i].</li><li>j part de la case juste à gauche : i-1. Tant que T[j] est plus grand que a, on le décale d'une case vers la droite (T[j+1] ← T[j]) et on recule.</li><li>La boucle s'arrête quand j = −1 ou quand T[j] ≤ a : la place libre est juste à droite de j, donc T[j+1] ← a.</li></ul><p>Vérifié par programme sur 1000 tableaux tirés au hasard. Remarque : le sujet écrit « E T » dans la signature ; pour que le tableau soit modifié, il faudrait ES.</p>`});

ann.forEach(x=>{const k=/pour le (CC[23])$/.exec(x.src);if(k)x.ex=k[1].toLowerCase();});

/* ---------- quiz ---------- */
quiz.push(
 {q:"Un invariant de boucle, d'après le cours, est une propriété censée être vraie…",o:["au début des itérations et à la fin de chaque itération","seulement à la fin, quand la boucle est terminée","seulement au début, avant la première itération","au milieu de chaque itération, entre deux instructions"],a:0,e:"C'est la définition du cours (diapo 54). On le prouve par récurrence : il est vrai au début des itérations (initialisation), et s'il est vrai à la fin d'une itération, il l'est à la fin de la suivante (récurrence). Au milieu d'une itération, il peut être faux : une variable a déjà changé, l'autre pas encore.",link:"a-preuve"},
 {q:"Dans la méthode du cours pour prouver une boucle, qu'est-ce qui est « la vérité », qu'on lit directement sur l'algorithme ?",o:["Les équations d'itération : elles recopient ce que fait un tour de boucle","L'invariant de boucle : il est vrai dès qu'on l'a vu sur la trace","La spécification : elle dit ce que l'algorithme doit renvoyer"],a:0,e:"Les équations d'itération sont lues sur l'algorithme, ligne par ligne : elles sont sûres. L'invariant est seulement une hypothèse tant qu'il n'est pas prouvé par récurrence : une trace ne montre que quelques valeurs. La spécification est ce qu'on veut prouver, pas ce qu'on sait.",link:"a-preuve"},
 {q:"Pour prouver qu'un tant que s'arrête, on montre…",o:["qu'une quantité entière décroît strictement à chaque itération, jusqu'à la valeur qui arrête la boucle","que l'invariant est vrai au début et à la fin de chaque itération","que la trace s'arrête sur un exemple, comme n = 5, puis on généralise","que le résultat est juste au moment où la boucle se termine"],a:0,e:"Un entier qui décroît strictement ne peut pas diminuer sans fin : il y a un nombre fini d'itérations. C'est le modèle de la diapo 95 et du corrigé de janvier 2023 (« l'expression entière a + b décroît strictement à chaque itération »). L'invariant prouve que le résultat est bon, pas que la boucle s'arrête, et un exemple ne prouve rien pour les autres valeurs.",link:"a-preuve"},
 {q:"On exécute ce bloc avec n = 4. Quelle valeur renvoie-t-il ?",o:["17","16","10","26"],a:0,e:"r vaut 1 avant la boucle, puis 2, 5, 10 et 17 à la fin des tours 1, 2, 3 et 4 (on ajoute 1, puis 3, puis 5, puis 7). La boucle s'arrête quand i = 4. 16 oublie que r part de 1 ; 10 s'arrête un tour trop tôt ; 26 fait un tour de trop.",link:"a-preuve",code:`i ← 0
r ← 1
tant que i < n faire
    i ← i + 1
    r ← r + 2*i - 1
fin tq;
Renvoyer r`},
 {q:"Dans une boucle, ces trois lignes s'exécutent dans cet ordre : « i ← i + 1 », puis « r ← r + x - i », puis « x ← x + 3 ». Avant le tour, i = 2, r = 1 et x = 6. Que valent i, r et x après le tour ?",o:["i = 3, r = 4, x = 9","i = 3, r = 5, x = 9","i = 3, r = 7, x = 9","i = 3, r = 8, x = 9"],a:0,e:"Les lignes s'exécutent l'une après l'autre. i passe à 3. Puis r ← 1 + 6 − 3 = 4 : le calcul de r utilise le nouvel i (3), mais l'ancien x (6), qui n'a pas encore changé. Enfin x passe à 9. On trouve 5 en prenant l'ancien i, 7 en prenant le nouvel x, 8 en faisant les deux erreurs. C'est le piège de l'exercice 24 du TD 6.",link:"a-preuve"},
 {q:"Pour un algorithme récursif, qu'appelle-t-on « équation de récurrence » dans le cours ?",o:["Une égalité reliant le résultat de l'algorithme avec celui des appels récursifs","Une égalité reliant les valeurs des variables d'une itération à la suivante","Une propriété censée être vraie à chaque appel récursif"],a:0,e:"Diapo 61. Exemple : pour la factorielle récursive, F2(n) = n × F2(n − 1). On la lit sur la ligne « Renvoyer ». L'égalité entre deux itérations est l'équation d'itération (pour une boucle). La propriété vraie à chaque appel est l'invariant de récursion : c'est l'hypothèse à prouver.",link:"a-preuve"},
 {q:"On prouve par récurrence qu'une fonction récursive F se termine. Que dit-on dans l'hérédité, d'après les corrigés officiels de 2023 ?",o:["L'appel F(n) est constitué d'opérations élémentaires et d'appels à F(n − 1), qui se terminent par hypothèse","L'appel F(n) est plus court que l'appel F(n − 1), donc il finit forcément avant lui","L'appel F(n) atteint le cas de base en une seule étape, donc il se termine tout de suite"],a:0,e:"On suppose que F(n − 1) se termine (hypothèse de récurrence). F(n) fait quelques opérations élémentaires et des appels à F(n − 1) : tout cela se termine, donc F(n) aussi. F(n) n'est pas « plus court » que F(n − 1) : il le contient. Et il n'atteint le cas de base qu'après n appels emboîtés.",link:"a-preuve"},
 {q:"(a<sub>n</sub>) et (b<sub>n</sub>) sont deux suites strictement positives. Si a<sub>n</sub> = θ(b<sub>n</sub>), alors…",o:["a<sub>n</sub> = O(b<sub>n</sub>)","a<sub>n</sub> = o(b<sub>n</sub>)","a<sub>n</sub> = ω(b<sub>n</sub>)"],a:0,e:"O veut dire « o ou θ » : si a est du même ordre que b, alors a est dominée par b au sens large. C'était la seule case vraie du QCM du CC de 2022. En revanche θ exclut o et ω : le quotient a<sub>n</sub>/b<sub>n</sub> reste entre deux nombres strictement positifs, il ne tend ni vers 0 ni vers +∞.",link:"a-complexite"},
 {q:"T<sub>n</sub> = 3n³ − 5n + 2. Quel est son ordre de complexité ?",o:["θ(n³)","θ(n)","θ(3ⁿ)"],a:0,e:"On divise par n³ : T<sub>n</sub>/n³ = 3 − 5/n² + 2/n³, qui tend vers 3, un nombre strictement positif. Donc T<sub>n</sub> = θ(n³) (cours, diapo 79). En pratique : on garde le terme qui grandit le plus vite, sans sa constante. 3ⁿ est une exponentielle : ce n'est pas la même chose que n³.",link:"a-complexite"},
 {q:"T<sub>n</sub> = 5n + 2 et R<sub>n</sub> = n². Que fait le quotient T<sub>n</sub>/R<sub>n</sub> quand n tend vers +∞, et qu'en conclut-on ?",o:["Il tend vers 0 : T<sub>n</sub> = o(R<sub>n</sub>)","Il tend vers 5 : T<sub>n</sub> = θ(R<sub>n</sub>)","Il tend vers +∞ : T<sub>n</sub> = ω(R<sub>n</sub>)"],a:0,e:"T<sub>n</sub>/R<sub>n</sub> = 5/n + 2/n², qui tend vers 0 : T<sub>n</sub> est strictement dominée par n². On obtiendrait 5 en divisant par n (alors T<sub>n</sub> = θ(n)), et +∞ en divisant par une suite plus lente, comme log(n).",link:"a-complexite"},
 {q:"Que peut-on dire des suites log<sub>10</sub>(n) et log<sub>2</sub>(n) ?",o:["Elles sont du même ordre : elles ne diffèrent que d'un facteur constant","Elles ne sont pas comparables : leurs bases sont différentes","Elles ne sont pas du même ordre : log<sub>2</sub>(n) domine strictement log<sub>10</sub>(n)"],a:0,e:"Tous les logarithmes sont du même ordre de grandeur (diapo 80) : log<sub>2</sub>(n) = log<sub>10</sub>(n) × 3,32 environ, pour tout n. Le quotient est une constante strictement positive, donc log<sub>10</sub>(n) = θ(log<sub>2</sub>(n)). C'est pour ça qu'on écrit θ(log(n)) sans préciser la base.",link:"a-complexite"},
 {q:"Un algorithme fait 7n + 6 opérations dans le pire cas. Comment écrit-on son ordre de complexité ?",o:["θ(n) : la suite de référence seule, l'algorithme est linéaire","θ(7n) : on garde la constante 7, qui dit qu'il est 7 fois plus lent","θ(n + 6) : on garde le terme constant, qui compte pour les petits n"],a:0,e:"(7n + 6)/n = 7 + 6/n tend vers 7, un nombre strictement positif : 7n + 6 = θ(n). L'ordre de complexité est une suite de référence (1, log(n), n, n.log(n), n²…) : on l'écrit sans constante devant et sans terme plus petit.",link:"a-complexite"},
 {q:"Le temps d'exécution d'un algorithme est proportionnel à n³. Sur un ordinateur 8 fois plus rapide, dans le même temps, on peut traiter une entrée…",o:["2 fois plus grande","8 fois plus grande","512 fois plus grande","3 fois plus grande"],a:0,e:"En même temps, l'ordinateur fait 8 fois plus d'opérations. On cherche n tel que n³ = 8 × n<sub>0</sub>³ : n = 2n<sub>0</sub>, car 2³ = 8. La taille n'est multipliée que par 2. (8 fois plus grande : ce serait vrai pour un temps proportionnel à n. 512 = 8³ : c'est le calcul dans le mauvais sens.) Même raisonnement que le TD 7, exercice 31.",link:"a-complexite"},
 {q:"Que veut dire « pire cas » quand on compte les opérations d'un algorithme ?",o:["La configuration des données qui consomme le plus de ressources","La plus grande entrée possible, celle où n est maximal","Le cas où l'algorithme s'arrête sur une erreur"],a:0,e:"Diapo 67 : si le nombre d'opérations dépend de la configuration des données, on regarde uniquement celle qui en consomme le plus. Exemple : pour chercher une valeur dans un tableau de taille n, le pire cas est celui où elle n'y est pas. Ce n'est pas une question de taille : on compare des entrées de même taille n.",link:"a-calcul-complexite"},
 {q:"Que mesure V<sub>n</sub>, la complexité en espace d'un algorithme ?",o:["L'espace mémoire occupé par ses variables","Le nombre d'opérations élémentaires qu'il effectue","La taille de l'entrée qu'on lui donne, notée n"],a:0,e:"Diapo 68 : V<sub>n</sub> est l'espace mémoire occupé, avec 1 unité de mémoire par variable élémentaire. Pour la factorielle avec une boucle, une seule variable res : V<sub>n</sub> = 1. Le nombre d'opérations, c'est T<sub>n</sub>, la complexité en temps.",link:"a-calcul-complexite"},
 {q:"On compte comme en cours : 1 par affectation, par calcul, par comparaison, et rien pour la gestion du « pour ». Combien d'opérations fait ce bloc ?",o:["2n + 1","n + 1","2n","3n + 1"],a:0,e:"« res ← 1 » : 1 opération. « res ← res * i » : 2 opérations (la multiplication et l'affectation), faites n fois. Total : 2n + 1, ce que le prof a écrit en amphi (diapo 69). n + 1 oublie la multiplication ; 2n oublie la première ligne ; 3n + 1 compte en plus la gestion du pour.",link:"a-calcul-complexite",code:`res ← 1
pour i de 1 à n faire
    res ← res * i
fin pour;`},
 {q:"Combien d'additions fait « Pour i de 1 à n faire Pour j de 1 à i faire som ← som+1 » ?",o:["n(n + 1)/2","n²","2n"],a:0,e:"Pour une valeur de i, la boucle sur j fait i tours, donc i additions. En tout : 1 + 2 + … + n = n(n + 1)/2 (TD 8, exercice 34). n² serait le résultat si j allait de 1 à n à chaque fois.",link:"a-calcul-complexite"},
 {q:"En lisant seulement les bornes de deux boucles « pour » imbriquées (i de 1 à n, puis j de 1 à i), quelle estimation le raccourci du cours donne-t-il ?",o:["O(n²) : i prend n valeurs et j au plus n valeurs","θ(n²) : le raccourci donne toujours l'ordre exact","O(n) : la boucle sur j s'arrête à i, pas à n"],a:0,e:"Diapo 82 : i prend n valeurs, j moins de n valeurs donc O(n), chaque itération fait O(1) opérations : n × O(n) × O(1) = O(n²). Le raccourci majore, il donne donc un O. Pour écrire θ, il faut calculer la somme exacte : ici n(n + 1)/2, qui est bien θ(n²).",link:"a-calcul-complexite"},
 {q:"La factorielle récursive F2 renvoie 1 si n = 0, et n*F2(n-1) sinon. On compte 1 par comparaison, par calcul et par appel. Quelle est son équation de complexité ?",o:["T<sub>0</sub> = 1 et T<sub>n</sub> = 4 + T<sub>n−1</sub>","T<sub>0</sub> = 1 et T<sub>n</sub> = 4 × T<sub>n−1</sub>","T<sub>0</sub> = 0 et T<sub>n</sub> = n + T<sub>n−1</sub>","T<sub>0</sub> = 1 et T<sub>n</sub> = 2T<sub>n−1</sub> + 4"],a:0,e:"Si n = 0 : une comparaison, T<sub>0</sub> = 1. Si n > 0 : 1 comparaison, 1 multiplication, 1 appel, 1 soustraction, plus les opérations de l'appel F2(n-1) : T<sub>n</sub> = 4 + T<sub>n−1</sub> (diapo 72). Les opérations de l'appel s'ajoutent, elles ne se multiplient pas. Et il n'y a qu'un appel récursif : pas de 2 devant T<sub>n−1</sub>.",link:"a-calcul-complexite"},
 {q:"Une équation de complexité donne T<sub>0</sub> = 0 et T<sub>n</sub> = 2T<sub>n−1</sub> + 4. Alors…",o:["T<sub>n</sub> = 4 × 2ⁿ − 4, d'ordre 2ⁿ","T<sub>n</sub> = 4n, d'ordre n","T<sub>n</sub> = 2n + 4, d'ordre n"],a:0,e:"On pose U<sub>n</sub> = T<sub>n</sub> + 4. Alors U<sub>n</sub> = 2T<sub>n−1</sub> + 8 = 2U<sub>n−1</sub> : suite géométrique de raison 2, avec U<sub>0</sub> = 4. Donc U<sub>n</sub> = 4 × 2ⁿ et T<sub>n</sub> = 4 × 2ⁿ − 4 (examen de janvier 2023). Vérification : T<sub>1</sub> = 4, T<sub>2</sub> = 12. Le 2 devant T<sub>n−1</sub> double le travail à chaque rang : c'est une exponentielle, pas une suite arithmétique.",link:"a-calcul-complexite"},
 {q:"Une fonction récursive renvoie F(n-1) + F(n-1) quand n > 0, et 1 quand n = 0. Quel est son ordre de complexité ?",o:["θ(2ⁿ) : deux appels au rang n − 1, donc T<sub>n</sub> = 2T<sub>n−1</sub> + une constante","θ(n) : la taille diminue de 1 à chaque appel, donc il y a n appels","θ(n²) : deux appels par niveau et n niveaux, donc 2 × n × n opérations"],a:0,e:"F(n-1) est écrit deux fois : il est calculé deux fois. Chaque appel en lance deux, qui en lancent chacun deux : 1 + 2 + 4 + … + 2ⁿ appels. C'est l'algorithme 1 de l'exercice 35 du TD 8 : T<sub>n</sub> = 6 + 2T<sub>n−1</sub>, donc T<sub>n</sub> = 7 × 2ⁿ − 6. Il n'y aurait n appels que si F(n-1) était écrit une seule fois.",link:"a-calcul-complexite"},
 {q:"Combien de fois faut-il diviser 1024 par 2 pour arriver à 1 ? (C'est log<sub>2</sub>(1024).)",o:["10","11","512","32"],a:0,e:"1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1 : dix divisions, car 1024 = 2¹⁰. Un algorithme qui divise la taille par 2 à chaque appel ne fait donc que log<sub>2</sub>(n) appels. 512 est le résultat de la première division ; 32 est la racine carrée de 1024.",link:"a-calcul-complexite"},
 {q:"T(n) ≤ 2T(⌈n/2⌉) + O(n) : que donne le master theorem ?",o:["O(n log n)","O(n²)","O(log n)"],a:0,e:"On lit a = 2 (deux appels), b = 2 (taille divisée par 2), d = 1 (O(n) = O(n¹) opérations en plus des appels). b<sup>d</sup> = 2 = a : c'est le cas d'égalité, T(n) = O(n<sup>d</sup> log n) = O(n log n). C'est la question 5 de l'exercice 3 de janvier 2023.",link:"a-calcul-complexite"},
 {q:"T(n) ≤ 4T(⌈n/2⌉) + O(n) : que donne le master theorem ?",o:["O(n²)","O(n log n)","O(n)","O(n⁴)"],a:0,e:"a = 4, b = 2, d = 1. b<sup>d</sup> = 2 est plus petit que a = 4 : les appels l'emportent, T(n) = O(n<sup>log a / log b</sup>). Et log 4 / log 2 = 2, car 2² = 4. Donc O(n²). O(n log n) serait le cas b<sup>d</sup> = a, O(n) le cas b<sup>d</sup> > a.",link:"a-calcul-complexite"},
 {q:"T(n) ≤ T(⌈n/2⌉) + O(n) : que donne le master theorem ?",o:["O(n)","O(n log n)","O(log n)"],a:0,e:"Rien n'est écrit devant T : a = 1. b = 2 et d = 1. b<sup>d</sup> = 2 est plus grand que a = 1 : le travail fait en dehors des appels l'emporte, T(n) = O(n<sup>d</sup>) = O(n). C'est l'algorithme 2 de l'exercice 35 du TD 8. O(log n) serait la réponse avec O(1) à la place de O(n).",link:"a-calcul-complexite"},
 {q:"Dans le master theorem, que représente b ?",o:["L'entier par lequel la taille de l'entrée est divisée à chaque appel","Le nombre d'appels récursifs dans le corps de l'algorithme","L'exposant de n dans les opérations faites en plus des appels"],a:0,e:"Dans T(n) ≤ aT(⌈n/b⌉) + O(n<sup>d</sup>) : a est le nombre d'appels récursifs, b l'entier par lequel la taille de l'entrée est divisée à chaque appel, et O(n<sup>d</sup>) compte les opérations de l'algorithme en plus des appels récursifs (diapo 84).",link:"a-calcul-complexite"},
 {q:"Pour lequel de ces algorithmes récursifs le master theorem ne s'applique-t-il pas ?",o:["F(n) qui appelle F(n − 1) : la taille diminue de 1, elle n'est pas divisée","F(n) qui appelle deux fois F(n div 2) : il y a plus d'un appel récursif","F(n) qui appelle F(n div 3) : la taille n'est pas divisée par 2"],a:0,e:"Le master theorem demande que la taille de l'entrée soit divisée par un entier b > 1 à chaque appel : n div 2, n div 3… Le nombre d'appels a peut être 1, 2 ou plus, et b n'est pas forcément 2. Avec F(n − 1), on résout l'équation de complexité à la main (suite arithmétique ou géométrique).",link:"a-calcul-complexite"},
 {q:"Recherche dichotomique du cours (RechDic) : on cherche e entre les indices deb et fin d'un tableau trié T, et mil est l'indice du milieu. Que fait-on quand T[mil] < e ?",o:["deb ← mil+1","fin ← mil-1","Renvoyer mil"],a:0,e:"e ne peut être qu'à droite de mil. Sinon, fin ← mil-1 : on continue à gauche, même si T[mil] = e, pour trouver le plus petit indice.",link:"a-recherche"},
 {q:"La recherche linéaire dans un tableau de taille n est en…",o:["θ(n)","θ(log(n))","θ(1)"],a:0,e:"Pire des cas : e n'est pas dans T, n itérations à coût constant (diapo 90).",link:"a-recherche"},
 {q:"Quel tri du cours est en θ(n) quand les valeurs sont concentrées dans un petit intervalle ?",o:["Le tri par valeurs","Le tri fusion","Le tri à bulles"],a:0,e:"θ(p + n), ou θ(n) si p = O(n) (diapo 102).",link:"a-tri-valeurs"},
 {q:"Peut-on trier un tableau de n valeurs en θ(1) ?",o:["Non : il faut au moins parcourir toutes ses cases, Ω(n)","Oui, avec le tri par valeurs : une zone par valeur","Oui, si le tableau est petit : peu de cases, peu de travail"],a:0,e:"Borne inférieure d'un tri de tableau (diapo 104, examen de janvier 2023). Le tri par valeurs est en θ(n), pas θ(1). Et θ décrit ce qui se passe quand n devient grand : « petit tableau » n'a pas de sens ici.",link:"a-tri-valeurs"},
 {q:"Quel est le tri par comparaison le plus efficace du cours ?",o:["Le tri fusion, en θ(n log(n))","Le tri à bulles, en θ(n²)","Le tri par sélection, en θ(n²)"],a:0,e:"Corrigé du CC1 2024 : « Le tri par comparaison le plus efficace du cours est le tri fusion. »",link:"a-tri-fusion"},
 {q:"Le tri fusion est-il en place ?",o:["Non : il a besoin d'espace supplémentaire pour la fusion","Oui : il trie le tableau sans en créer d'autre","Seulement si le tableau est déjà trié : il n'a rien à fusionner"],a:0,e:"Diapo 112 : il est stable, mais il n'est pas en place.",link:"a-tri-fusion"},
 {q:"Quelle est la borne inférieure d'un tri de tableau par comparaison ?",o:["Ω(n log n)","Ω(n)","Ω(n²)"],a:0,e:"Diapo 113 : au moins n log n/4 comparaisons.",link:"a-tri-fusion"},
 {q:"Le tri par insertion sur un tableau déjà trié est en…",o:["θ(n)","θ(n²)","θ(1)"],a:0,e:"Aucun décalage : un seul test par élément. Le cours le dit adapté aux données presque triées.",link:"a-tri-insertion"},
 {q:"Le tri par sélection est en…",o:["θ(n²) dans tous les cas","θ(n) si le tableau est trié","θ(n log n)"],a:0,e:"Il cherche toujours le minimum de tout ce qui reste : n(n − 1)/2 comparaisons.",link:"a-tri-selection"});

const infos23=({sec})=>`<div class="title-row"><h1>Les CC2 et CC3 en bref</h1></div>
 ${sec(1,"Quand",`<p>D'après le mail du responsable de l'UE (24/9) : le <b>CC2</b> a lieu pendant un créneau de TD entre le jeudi 26/11 et le mercredi 2/12, donc pour toi le <b>jeudi 26 novembre</b>, pendant ton TD (15h ou 16h45 : sois là à 15h). Le <b>CC3</b> a lieu entre le lundi 14/12 et le vendredi 18/12 ; le site suppose le <b>lundi 14 décembre à 15h</b>, ton seul créneau d'Algo cette semaine-là. Je corrige dès qu'il y a plus précis.</p><p>Modalités 2026-2027 : 3 CC d'1 h, qui comptent chacun pour un tiers de la note environ (32 %, 34 % et 34 %), pas d'examen en janvier. Pour chaque CC : une feuille A5 recto-verso écrite à la main. Celle du CC2 est prête à recopier sur la page <a href="#/algo/p/feuille">Ma feuille à recopier</a>.</p>`)}
 ${sec(2,"Le programme supposé",`<p>CC2 : validité (prouver une boucle ou un algorithme récursif, arrêt d'un tant que) et complexité (compter les opérations, ordre de complexité θ, O, Ω, boucles, équation de complexité, master theorem) : diapos 52 à 86 du cours, TD 6 à 8. CC3 : recherche (linéaire, dichotomique) et tris (par valeurs, à bulles, fusion dans le cours ; sélection et insertion en TD) : diapos 87 à 114, TD 9 et 10. Chaque CC peut aussi reprendre ce qui précède.</p>`)}
 ${sec(3,"Ce qui tombe aux annales",`<ul><li>Des questions de cours : « Θ(n³) peut-il être un million de fois plus lent ? », « à quoi servent les équations de récurrence ? », « à quoi sert le master theorem ? », un QCM sur o, O, Ω, θ. Leurs réponses officielles sont sur la page <a href="#/algo/p/aucasou">Questions de cours déjà tombées</a>.</li><li>Une preuve de boucle : trace, invariant à trouver ou à choisir, récurrence, conclusion (5 points en 2022 et en mai 2023), et l'arrêt d'une boucle tant que (2 points en janvier et en mai 2023).</li><li>Un algorithme récursif : prouver par récurrence qu'il se termine et renvoie le bon résultat, écrire son équation de récurrence, la résoudre avec une suite géométrique, donner l'ordre de complexité, appliquer le master theorem (8,5 points en janvier 2023).</li><li>Un temps d'exécution sur un ordinateur plus rapide (3 points).</li><li>Pour le CC3 : un tri à choisir ou à compléter, sa complexité, une recherche dichotomique.</li></ul>`)}
 ${sec(4,"Les documents",`<p style="display:flex;gap:8px;flex-wrap:wrap">${[["algo/cours_annote_validite_complexite.pdf","Cours annoté : validité, complexité"],["algo/cours_trous.pdf","Cours à trous (recherche, tris)"],["algo/td.pdf","Feuilles de TD"],["algo/exam_jan2023_corr.pdf","Corrigé janvier 2023"],["algo/exam_mai2023.pdf","Sujet PEIP mai 2023"],["algo/cc1_2022_corr.pdf","Corrigé CC 2022"],["algo/cc1_2024_corr.pdf","Corrigé CC1 2024"]].map(f=>`<a class="btn" href="../Moodle-S1/${f[0]}" target="_blank" rel="noopener">${f[1]}</a>`).join("")}</p>`)}`;

SUBJ.algo={name:"Algorithmique 1",code:"HAI101I",color:"#3BE8F0",coef:5,share:0.32,key:"rev-algo-v1",lang:"pseudo",
 exams:[{id:"cc1",label:"CC1",day:"2026-11-12",start:"15:00",end:"16:00",place:"salle de TD 5.212 (supposée ; heure pas sûre : 15h ou 16h45, sois là à 15h)",dur:"1 h",share:0.32,covers:["cc1","cc1x"],unsure:"Date confirmée par le mail de ton chargé de TD (5/11) : premier CC jeudi 12/11, sur tout ce qui a été vu. Ni l'heure ni la salle n'ont été données par mail. D'après un camarade (Discord, 11/11), le prof a dit que ce serait pendant le deuxième créneau, celui du TP (16h45-18h15) : pas confirmé, viens dès 15h."},
        {id:"cc2",label:"CC2",day:"2026-11-26",start:"15:00",end:"16:00",place:"salle TD36.315 (bâtiment 36, 3e étage), d'après Prose",dur:"1 h",share:0.34,covers:["cc1","cc2"],unsure:"Mail du responsable de l'UE (24/9) : CC2 pendant un créneau de TD entre le jeudi 26/11 et le mercredi 2/12. Ton TD d'Algo tombe le jeudi 26/11 (15h-16h30 puis 16h45-18h15) : c'est donc ce jour-là. Le créneau exact (le premier ou le second) n'est pas donné : sois là à 15h. Programme supposé : preuves et complexité (TD 6 à 8).",prog:"Supposé : preuves de validité (invariants, terminaison) et complexité (O, Ω, Θ, compter les opérations, équations de récurrence, master theorem), TD 6 à 8, plus ce qui précède."},
        {id:"cc3",label:"CC3",day:"2026-12-14",start:"15:00",end:"16:00",place:"à confirmer",dur:"1 h",share:0.34,covers:["cc1","cc2","cc3"],unsure:"Mail du responsable de l'UE (24/9) : CC3 entre le lundi 14/12 et le vendredi 18/12, sans plus de précision. Ton seul créneau d'Algo cette semaine-là est le cours du lundi 14/12 à 15h : date et heure supposées. Programme supposé : recherche et tris (TD 9 et 10).",prog:"Supposé : recherche séquentielle et dichotomique, tris (sélection, insertion, bulles, par valeurs) avec leur complexité et leur preuve, TD 9 et 10, plus ce qui précède."}],
 docs:"une feuille A5 recto-verso, écrite à la main, pas de photocopie (mail du responsable de l'UE, 24/9)",examMinutes:60,
 get examMorning(){const e=window.APP&&window.APP.exam?window.APP.exam(this):null,id=e?e.id:"cc2";
  return id==="cc1"?"Relis ta feuille. Refais de tête ce que les CMI ont eu mardi (d'après une camarade) : le plus petit et le plus grand élément d'un tableau, dérouler les appels d'un algorithme récursif et dire ce qu'il calcule, une figure d'étoiles. Puis les fiches en rouge."
   :id==="cc2"?"Prends ta feuille A5. Relis-la une fois en entier : la preuve d'une boucle en 4 étapes, la phrase d'arrêt d'un tant que, le plan base, hérédité, conclusion pour un récursif, puis θ, o, ω et les trois cas du master theorem. Redis de tête les trois réponses officielles (équations d'itération, « un million de fois plus lent », master theorem). Pendant l'épreuve : pour une trace, une ligne par itération et les instructions dans l'ordre."
   :"Prends ta feuille A5 et relis-la une fois en entier. Refais de tête la recherche dichotomique sur un petit tableau, puis redis la complexité de chaque tri du cours. Puis les fiches en rouge.";},
 prog:"Sur papier. Jusqu'au TD 5 et aux piles : pseudo-code, expressions et cond, boucles et motifs, récursivité, tableaux 1D et 2D (TD 4 jusqu'à l'ex. 15), listes, piles. TP : jeu de la vie, pendu. Preuves et complexité : faites en amphi seulement, deux leçons « au cas où ». Pas de recherche dichotomique ni de tris.",
 chapters:{1:"1. Écrire du pseudo-code (TD 1)",2:"2. Récursivité (TD 2)",3:"3. Tableaux 1D et 2D (TD 3, 4, TP)",4:"4. Listes (TD 5)",5:"5. Piles et files",6:"6. Preuves et complexité (CC2)",7:"7. Recherche et tris (CC3)"},
 concepts,quiz,td,tdTitle:"Exercices de TD corrigés",
 /* les sujets de la prochaine épreuve d'abord ; pour le CC2 : le sujet blanc, puis les examens, puis les CC qui n'ont que quelques questions du CC2 */
 get ann(){const e=window.APP&&window.APP.exam?window.APP.exam(this).id:"cc2",r=x=>/^Sujet blanc/.test(x.src)?0:/^Examen/.test(x.src)?1:2;
  return [...ann.filter(x=>x.ex===e).sort((x,y)=>r(x)-r(y)),...ann.filter(x=>x.ex!==e)];},set ann(v){},
 get annIntro(){const e=window.APP&&window.APP.exam?window.APP.exam(this).id:"cc2";
  return e==="cc2"?"Pour le CC2, commence par le sujet blanc du CC2 : il est écrit pour le site et corrigé pas à pas avec un barème sur 20. Viennent ensuite l'examen de janvier 2023 (corrigé officiel) et l'examen PEIP de mai 2023 (corrigé écrit par moi), qui ont le programme du CC2 : preuves et complexité. Les CC de 2022 et de 2024 n'ont que quelques questions de ce programme. Les sujets du CC1 (CC PEIP 2023) sont en bas, car le CC2 peut reprendre ce qui précède.":this.annIntroCC1;},tdPrefix:"TD, ex.",
 tdIntro:"Les exercices des TD 1 à 5 et des TP, corrigés par moi en pseudo-code, dans la forme du cours (pas de corrigé officiel sur Moodle). Les ★★★ ressemblent le plus aux CC. Écris ta réponse sur une feuille avant d'ouvrir le corrigé, puis compare la forme ligne par ligne. Pour le CC2 : les TD 6 à 8 en entier (exercices 24 à 36), corrigés avec la méthode de preuve et le comptage du cours. Pour le CC3 : les TD 9 et 10 en entier (exercices 37 à 43).",
 annIntroCC1:"Le CC PEIP 2023 a exactement le programme de cette année : ses quatre sujets sont là (corrigés par moi). Le sujet 1 sert d'examen blanc ; prends dans les trois autres les exercices du type que tu rates. Pour le CC1 2024 et le CC 2022, j'ai gardé les exercices de ton programme (corrigés officiels, réécrits). En bas de la liste, pour les CC2 et CC3 : le CC de 2022 et l'examen de janvier 2023 (corrigés officiels), l'examen PEIP de mai 2023 (corrigés écrits par moi).",quizIntro:"Des questions de cours des CC 2022, 2023 et 2024, et des questions sur la forme du pseudo-code.",
 pages:[{id:"infos23",t:"Les CC2 et CC3 en bref",html:infos23},{id:"feuille",t:"Ma feuille à recopier",html:feuille},{id:"aucasou",t:"Questions de cours déjà tombées",html:aucasou},{id:"recettes",t:"Recettes pas à pas",html:recettes},{id:"infos",t:"Le CC1 en bref (passé le 12/11)",html:infos}],
 /* thèmes du CC1 et leur poids moyen dans les sujets de 2022, PEIP 2023 et 2024 (sur 20).
    self0 : ce qu'il a dit le 11/11 (« presque tout juste » sur l'entraînement) ; il peut le changer dans « Où j'en suis ». */
 themes:[
  {id:"listes",t:"Listes : tête, queue, cons",pts:5,src:"2 à 8 points selon l'année",les:["a-listes"],fiches:["a-listes","a-listes-rec"],self0:2},
  {id:"tableaux",t:"Tableaux 1D : accumuler, chercher, fabriquer",pts:5,src:"4 à 6 points",les:["a-tableaux"],fiches:["a-tableaux"],self0:2},
  {id:"recursif",t:"Écrire un algorithme récursif",pts:3,src:"2,5 à 4 points",les:["a-recursif"],fiches:["a-recursif"],self0:2},
  {id:"affichage",t:"Ce qu'affiche une procédure récursive, et son arrêt",pts:3,src:"4 points en 2023 et en 2024",les:["a-affichage"],fiches:["a-arbre-appels","a-arret"],self0:2},
  {id:"forme",t:"La forme du pseudo-code, les expressions, les questions de cours",pts:2,src:"1,5 à 3 points",les:["a-forme","a-expressions"],fiches:["a-pseudo","a-bases","a-expressions"],self0:2},
  {id:"boucles",t:"Boucles pour et tant que",pts:1,src:"dans tous les exercices",les:["a-boucles"],fiches:["a-boucles"],self0:2},
  {id:"motifs",t:"Motifs d'étoiles",pts:1,src:"4 points en 2023, rien les autres années",les:["a-motifs"],fiches:["a-motifs"],self0:2},
  {id:"reste",t:"Tableaux 2D, dictionnaires, piles et files",pts:0.5,src:"jamais tombés",les:["a-tableaux2d","a-dicos","a-piles"],fiches:["a-tableaux-2d","a-dicos","a-piles-files"],self0:2},
  /* CC2 et CC3 : programme et barème pas annoncés. Points estimés d'après les exercices de ces chapitres
     dans l'examen de janvier 2023, l'examen PEIP de mai 2023 et le CC de 2022. */
  {id:"preuves",ex:"cc2",t:"Prouver un algorithme : une boucle (trace, arrêt, invariant) ou une récursivité (récurrence)",pts:8.5,src:"5 points au CC de 2022 et à l'examen PEIP de 2023, la moitié de l'exercice à 8,5 points de janvier 2023",les:["a2-invariant","a2-recursif"],tasks:["td6"],fiches:["a-preuve"]},
  {id:"compter",ex:"cc2",t:"Compter les opérations, équation de complexité",pts:4.5,src:"dans l'exercice à 8,5 points de janvier 2023",les:["a2-compter"],tasks:["td78"],fiches:["a-calcul-complexite"]},
  {id:"notations",ex:"cc2",t:"Ordres de complexité : θ, o, ω, O, Ω",pts:4,src:"3 points en janvier 2023 et à l'examen PEIP de 2023",les:["a2-notations"],fiches:["a-complexite"]},
  {id:"master",ex:"cc2",t:"Boucles imbriquées et master theorem",pts:3,src:"une question de cours en 2022, une question en janvier 2023",les:["a2-boucles"]},
  {id:"tris",ex:"cc3",t:"Tri par sélection et tri par insertion",pts:6,src:"estimé : le TD 10",les:["a3-tris"],tasks:["td910"],fiches:["a-tri-selection","a-tri-insertion"]},
  {id:"dicho",ex:"cc3",t:"Recherche linéaire et recherche dichotomique",pts:6,src:"estimé : le TD 9, et une question de cours au CC1 de 2024",les:["a3-dicho"],fiches:["a-recherche"]},
  {id:"fusion",ex:"cc3",t:"Tri à bulles et tri fusion",pts:5,src:"estimé : 3 points à l'examen PEIP de 2023",les:["a3-fusion"],fiches:["a-tri-bulles","a-tri-fusion"]},
  {id:"valeurs",ex:"cc3",t:"Tri par valeurs et borne inférieure d'un tri",pts:3,src:"5 points en janvier 2023",les:["a3-valeurs"],fiches:["a-tri-valeurs"]}],
 tasks:[
 {id:"feuille",ex:"cc1x",t:"Recopier ta feuille à la main (A5, en écrivant gros) et la relire",min:30,p:1,manual:true,links:[["p/feuille","Ma feuille à recopier"]],why:"Pas d'imprimante : la page donne la feuille ligne par ligne. Format confirmé par le mail du 24/9 : A5 recto-verso, écrite à la main."},
 {id:"amphia4",ex:"cc1x",t:"Au cas où (preuves, complexité) : recopier 3 blocs sur ta feuille, s'il reste de la place",min:15,p:2,manual:true,links:[["p/aucasou","Les blocs à recopier"]],why:"Fait en amphi, tombé aux CC de 2022 et 2024. Avec la feuille, recopier suffit pour répondre."},
 {id:"peip",t:"Examen blanc : CC PEIP 2023 en 1 h, puis correction",min:70,p:2,manual:true,links:[["annales","Annales et chrono"]],why:"Le sujet le plus proche de ton programme."},
 {id:"tdex",t:"Exercices de TD ★★★ sur papier",min:60,p:2,td:["4","9","14","15","18","19"],links:[["td","Exercices de TD"]]},
 {id:"peip2",t:"CC PEIP 2023, sujets 2, 3 et 4 : les exercices du type que tu rates",min:60,p:2,manual:true,links:[["annales","Annales et chrono"]],why:"Trois autres sujets au format exact du tien : 15 exercices corrigés."},
 {id:"cc24",t:"Annale CC1 2024, exercices 1 à 3",min:50,p:2,manual:true,links:[["annales","Annales et chrono"]]},
 {id:"tdex2",t:"Autres exercices de TD sur papier",min:50,p:2,td:["2","3","7","13","16","TP2"],links:[["td","Exercices de TD"]]},
 {id:"quiz",ex:"cc1x",t:"Quiz de cours : au moins 80 %",min:15,p:1,quiz:0.8,last:true,links:[["quiz","Quiz de cours"]]},
 {id:"review",ex:"cc1x",t:"Veille du CC : « Réviser » jusqu'à 0 carte, puis les fiches en rouge",min:25,p:1,manual:true,review:true,last:true,links:[["#/reviser","Réviser"]]},
 {id:"feuille2",ex:"cc2",t:"Recopier ta feuille du CC2 à la main (A5) : les preuves au recto, la complexité au verso",min:35,p:1,manual:true,links:[["p/feuille","Ma feuille à recopier"]],why:"Une feuille A5 recto-verso écrite à la main est autorisée à chaque CC (mail du 24/9). La page donne les 24 lignes de chaque face, puis explique chaque ligne. Fais-la tôt : tu t'en serviras pendant les exercices."},
 {id:"cours2",ex:"cc2",t:"Questions de cours déjà tombées : les écrire de mémoire, puis comparer au corrigé officiel",min:20,p:1,manual:true,links:[["p/aucasou","Questions de cours déjà tombées"]],why:"1 à 1,5 point par question aux CC de 2022 et de novembre 2024, et les réponses officielles tiennent en deux lignes."},
 {id:"td6",ex:"cc2",t:"TD 6 : preuves (somme d'un tableau, Fibonacci), sur papier",min:45,p:1,td:["25","26"],links:[["td","Exercices de TD"]]},
 {id:"td78",ex:"cc2",t:"TD 7 et 8 : suites à trier, temps d'exécution, additions, équations de récurrence, sur papier",min:60,p:1,td:["29","31","32","34","35"],links:[["td","Exercices de TD"]]},
 {id:"ann2",ex:"cc2",t:"Annales : examen de janvier 2023, exercices 1 à 3, en 1 h 10",min:80,p:1,manual:true,links:[["annales","Annales et chrono"]],why:"15 points sur 20 de l'examen : arrêt d'une boucle, temps d'exécution, preuve par récurrence, équation de récurrence, master theorem. Corrigé officiel avec le barème."},
 {id:"ann2b",ex:"cc2",t:"Annales : CC de 2022 (questions 4 et 5, exercice 3) et questions de cours du CC1 2024",min:30,p:1,manual:true,links:[["annales","Annales et chrono"]],why:"Les questions de cours déjà posées, avec les réponses officielles."},
 {id:"ann2c",ex:"cc2",t:"Annales : examen PEIP de mai 2023, exercices 1, 2, 3 et 6",min:70,p:2,manual:true,links:[["annales","Annales et chrono"]],why:"Même format que janvier 2023, sans corrigé officiel : corrigés écrits par moi, vérifiés par programme."},
 {id:"blanc2",ex:"cc2",suj:"Sujet blanc du CC2",t:"Sujet blanc du CC2 en 1 h, sur papier et chronométré, puis correction et note sur 20",min:75,p:1,manual:true,links:[["annales","Annales et chrono"]],why:"Un sujet neuf, écrit pour le site, que tu n'as vu nulle part : les questions de cours, une boucle à prouver, l'arrêt d'un tant que, un récursif avec ses équations de récurrence, le master theorem. De préférence après l'examen de janvier 2023, pour voir ce que tu sais vraiment."},
 {id:"tdsup",ex:"cc2",t:"TD 6 à 8 : les exercices supplémentaires (28, 33, 36)",min:45,p:2,td:["28","33","36"],links:[["td","Exercices de TD"]]},
 {id:"quiz2",ex:"cc2",t:"Quiz de cours, questions des CC2 et CC3 comprises : au moins 80 %",min:15,p:1,manual:true,last:true,links:[["quiz","Quiz de cours"]]},
 {id:"review2",ex:"cc2",t:"Veille du CC2 : « Réviser » jusqu'à 0 carte, puis les fiches en rouge",min:25,p:1,manual:true,review:true,last:true,links:[["#/reviser","Réviser"]]},
 {id:"td910",ex:"cc3",t:"TD 9 et 10 : dichotomie, tri par sélection, tri par insertion, sur papier",min:60,p:1,td:["37","42","43"],links:[["td","Exercices de TD"]]},
 {id:"td910b",ex:"cc3",t:"TD 9 et 10 : médiane, k recherches, tri d'une liste, recherche aléatoire",min:45,p:2,td:["39","40","41","38"],links:[["td","Exercices de TD"]]},
 {id:"ann3",ex:"cc3",t:"Annales : questions 2 et 3 du CC1 2024, tri de chiffres (janvier 2023), tri de John (mai 2023)",min:25,p:1,manual:true,links:[["annales","Annales et chrono"]]},
 {id:"review3",ex:"cc3",t:"Veille du CC3 : « Réviser » jusqu'à 0 carte, puis les fiches en rouge",min:25,p:1,manual:true,review:true,last:true,links:[["#/reviser","Réviser"]]}]};
})();
