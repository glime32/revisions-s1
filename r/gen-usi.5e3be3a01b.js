/* Générateurs d'USI.
   Un petit bash, un petit find, un petit grep et un petit Python écrits en JavaScript jugent les commandes et les programmes tapés sur des arborescences tirées au hasard.
   Les mêmes commandes sont exécutées par le vrai bash, find, grep et python3 (tools/verif/usi-vrai/vrai-bash.js), et comparées par tools/verif/usi.js. */
(function(){
"use strict";
const G=window.GEN,O=G.outils;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const c=s=>`<code>${esc(s)}</code>`;
const bloc=t=>window.W&&window.W.code?window.W.code(t,"sh"):`<pre>${esc(t)}</pre>`;
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];
const propre=s=>String(s==null?"":s).normalize("NFKC").replace(/[“”«»]/g,'"').replace(/[’‘]/g,"'").replace(/[−–—]/g,"-").replace(/\s+/g," ").trim();

/* ---------- l'arborescence : {n:nom, d:[enfants]} pour un dossier, {n:nom} pour un fichier ---------- */
const ACCUEIL="/home/etu",COURANT="/home/etu/projet";
const dossier=(n,d)=>({n,d}),fichier=n=>({n});
const tri=L=>L.slice().sort((a,b)=>a.n<b.n?-1:1);
function noeud(R,chemin){if(chemin==="/")return R;let t=R;for(const p of chemin.split("/").filter(Boolean)){if(!t.d)return null;t=t.d.find(x=>x.n===p);if(!t)return null;}return t;}
/* dessin comme la commande tree */
function dessin(t,titre){const L=[titre||t.n];const va=(x,pre)=>{const E=tri(x.d||[]);E.forEach((y,i)=>{const der=i===E.length-1;L.push(pre+(der?"└── ":"├── ")+y.n+(y.d?"/":""));if(y.d)va(y,pre+(der?"    ":"│   "));});};va(t,"");return L.join("\n");}

/* ---------- le petit bash : mots, guillemets, ~, $HOME, motifs * ? [ ] développés dans le dossier courant ---------- */
function motifRe(m){let s="^";for(let i=0;i<m.length;i++){const ch=m[i];
    if(ch==="*")s+=".*";else if(ch==="?")s+=".";else if(ch==="["){const j=m.indexOf("]",i+2);if(j<0){s+="\\[";continue;}let k=m.slice(i+1,j);if(k[0]==="!")k="^"+k.slice(1);s+="["+k.replace(/\\/g,"\\\\")+"]";i=j;}
    else if(ch==="\\"&&i+1<m.length){s+=m[++i].replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
    else s+=ch.replace(/[.+^${}()|\\]/g,"\\$&");}
  return new RegExp(s+"$");}
function mots(ligne,R){const W=[];let i=0;const n=ligne.length;
  while(i<n){while(i<n&&ligne[i]===" ")i++;if(i>=n)break;let w="",libre="";
    while(i<n&&ligne[i]!==" "){const ch=ligne[i];
      if(ch==='"'||ch==="'"){const j=ligne.indexOf(ch,i+1);if(j<0)return {err:`Un guillemet ${ch} n'est pas refermé.`};let x=ligne.slice(i+1,j);if(ch==='"')x=x.replace(/\$HOME|\$\{HOME\}/g,ACCUEIL);w+=x;libre+=x.replace(/./g,"_");i=j+1;}
      else if(ch==="\\"&&i+1<n){w+=ligne[i+1];libre+="_";i+=2;}
      else if(ch==="|"||ch===">"||ch==="<"||ch==="&")return {err:`Ici, écris une seule commande find, sans ${ch}.`};
      else if(ch==="~"&&w===""&&(i+1===n||ligne[i+1]===" "||ligne[i+1]==="/")){w+=ACCUEIL;libre+="_".repeat(ACCUEIL.length);i++;}
      else if(ligne.startsWith("$HOME",i)){w+=ACCUEIL;libre+="_".repeat(ACCUEIL.length);i+=5;}
      else{w+=ch;libre+=ch;i++;}}
    /* bash remplace un motif non protégé par les noms qui lui correspondent dans le dossier courant (s'il y en a) */
    if(/[*?[]/.test(libre)&&!w.includes("/")){const re=motifRe(w),C=(noeud(R,COURANT).d||[]).map(x=>x.n).filter(x=>x[0]!=="."&&re.test(x)).sort();
      if(C.length){W.push(...C.map(x=>({w:x,developpe:w})));continue;}}
    W.push({w});}
  return {W};}

/* ---------- le petit find : -name, -iname, -type, -maxdepth, -print, -delete, -exec … {} \; ou + ---------- */
const absolu=p=>{const P=[];(p[0]==="/"?p:COURANT+"/"+p).split("/").forEach(x=>{if(!x||x===".")return;if(x==="..")P.pop();else P.push(x);});return "/"+P.join("/");};
/* rend {err} ou {trouve:[chemins affichés], abs:[chemins absolus], action:{cmd,args,fin}|null} */
function find(ligne,R){ligne=propre(ligne);const M=mots(ligne,R);if(M.err)return {err:M.err};const W=M.W.map(x=>x.w);
  if(W[0]!=="find")return {err:W[0]==="ls"?"Ici, la question demande une commande find : ls ne regarde qu'un dossier (ls -R | grep marche, mais compte moins de points).":"La commande doit commencer par find."};
  let i=1;const departs=[];while(i<W.length&&!/^[-!(]/.test(W[i]))departs.push(W[i++]);if(!departs.length)departs.push(".");
  const tests=[];let action=null,maxd=Infinity;
  while(i<W.length){const w=W[i++];
    if(w==="-name"||w==="-iname"){const m=W[i++];if(m===undefined)return {err:`Il manque le motif après ${w}.`};const re=motifRe(w==="-iname"?m.toLowerCase():m);tests.push(n=>re.test(w==="-iname"?n.nom.toLowerCase():n.nom));}
    else if(w==="-type"){const t=W[i++];if(t!=="f"&&t!=="d")return {err:"Après -type, il faut f (fichier ordinaire) ou d (répertoire)."};tests.push(n=>t==="d"?!!n.t.d:!n.t.d);}
    else if(w==="-maxdepth"){const k=+W[i++];if(!(k>=0))return {err:"Après -maxdepth, il faut un nombre."};maxd=k;}
    else if(w==="-print"){}
    else if(w==="-delete"){action={cmd:"rm",args:["{}"],fin:"delete"};}
    else if(w==="-exec"||w==="-ok"){const A=[];while(i<W.length&&W[i]!==";"&&W[i]!=="+")A.push(W[i++]);if(i>=W.length)return {err:"Il manque la fin de -exec : \\; (ou +)."};
      const fin=W[i++];if(!A.length)return {err:"Il manque la commande après -exec."};if(!A.includes("{}"))return {err:"Il manque {} dans -exec : c'est lui qui est remplacé par chaque fichier trouvé."};action={cmd:A[0],args:A.slice(1),fin};}
    else if(/^-/.test(w))return {err:`find ne connaît pas ${w}.`};
    else return {err:M.W[i-1].developpe?`bash a remplacé le motif ${M.W[i-1].developpe} par les noms du dossier courant qui lui correspondent : find reçoit plusieurs mots au lieu d'un seul motif, et s'arrête (« paths must precede expression »). Mets le motif entre guillemets.`:`find ne sait pas quoi faire de « ${w} » (« paths must precede expression »).`};}
  const trouve=[],abs=[];
  for(const d of departs){const a=absolu(d),t=noeud(R,a);if(!t)return {err:`find : « ${d} » : aucun fichier ou dossier de ce nom.`};
    (function va(x,aff,ab,prof){if(prof>maxd)return;const n={nom:prof?x.n:(a.split("/").pop()||"/"),t:x};if(tests.every(f=>f(n))){trouve.push(aff);abs.push(ab);}
      if(x.d)tri(x.d).forEach(y=>va(y,aff.replace(/\/$/,"")+"/"+y.n,ab.replace(/\/$/,"")+"/"+y.n,prof+1));})(t,d,a,0);}
  return {trouve,abs,action};}

/* ---------- les arborescences : l'accueil /home/etu contient tp (le dossier courant), un autre dossier et des fichiers ---------- */
const NOMSF=["notes.txt","a.log","erreurs.log","log.txt","main.c","tp1.py","calcul.py","2023-photo.jpg","photo2023.jpg","DATA.csv","mesDATA.txt","data.csv","brouillon.txt#","x#","#temp","rapport.pdf","script.sh","tp2.c","2024.txt","resultats.csv","README","old.py"];
const NOMSD=["src","tp2","tps","photos","old","docs","data2023","bin"];
/* vise : [où, nom, dossier?] à placer ; sansD : les noms de dossiers interdits (ils ne doivent pas correspondre au motif) */
function tireArbo(R,vise,sansD){const okD=x=>!(sansD&&sansD(x)),prend=(L,k)=>R.mel(L).slice(0,k);
  const feuille=()=>prend(NOMSF,R.ent(1,3)).map(fichier),sous=()=>dossier(R.choix(NOMSD.filter(okD)),feuille());
  const tp=dossier("projet",[...feuille(),sous()]);if(R()<0.6)tp.d.push(sous());
  const acc=dossier("etu",[tp,dossier(R.choix(["docs","photos","cours"].filter(okD)),feuille()),...feuille()]);
  (vise||[]).forEach(([ou,n,dir])=>{const cible=ou==="courant"?tp:ou==="sous"?(tp.d.find(x=>x.d)||tp):ou==="autre"?acc.d[1]:acc;cible.d.push(dir?dossier(n,feuille()):fichier(n));});
  const uniq=t=>{if(!t.d)return;const vu=new Set();t.d=t.d.filter(x=>vu.has(x.n)?false:(vu.add(x.n),true));t.d.forEach(uniq);};uniq(acc);
  return dossier("",[dossier("home",[acc])]);}

G.usi={mots,find,motifRe,dessin,tireArbo,noeud,ACCUEIL,COURANT};

/* ---------- US5 : find ---------- */
const DEPARTS={courant:[".","du dossier courant"],accueil:["~","du dossier d'accueil"],parent:["..","du dossier parent"]};
const SORTES={finit:[x=>"*"+x,"se termine par","finit par"],commence:[x=>x+"*","commence par","commence par"],contient:[x=>"*"+x+"*","contient","contient"]};
const VALEURS={finit:[".log",".py",".txt",".csv",".jpg","#",".c",".sh",".pdf"],commence:["2023","tp","2024","old","log","rapport","notes","main"],contient:["DATA","2023","tp","log","photo","2024","notes"]};
/* les noms à placer pour qu'une mauvaise commande se trompe : des noms qui correspondent, et d'autres qui en sont proches */
const proches=(sorte,x)=>{const re=motifRe(SORTES[sorte][0](x)),pres=NOMSF.filter(n=>n.includes(x.replace(/^\./,""))||n.toLowerCase().includes(x.toLowerCase()));
  const oui=[...new Set([...pres.filter(n=>re.test(n)),sorte==="finit"?"rapport"+x:sorte==="commence"?x+"-notes.txt":"copie-"+x+".txt"])],non=pres.filter(n=>!re.test(n));return {oui,non};};
const relatif=(abs,dep)=>dep==="~"?abs:dep===".."?abs.replace(/^\/home\/etu/,".."):abs.replace(/^\/home\/etu\/projet/,".");
const ensembles=(a,b)=>a.length===b.length&&a.slice().sort().every((x,i)=>x===b.slice().sort()[i]);
/* juge une commande find tapée sur plusieurs arborescences ; o.type : -type attendu ; o.action : "rm" | "cat" | "ls" */
function jugeFind(texte,A,ref,o){const t=propre(texte);if(!t)return {incomplet:"Écris la commande."};
  const faux=(etape,sorte,titre,msg)=>({ok:false,faux:["c"],resume:"Pas tout à fait : cette commande ne fait pas ce qui est demandé.",diag:{etape,type:sorte,titre,msg}});
  for(const T of A){const r=find(t,T),b=find(ref,T);if(r.err)return faux(1,"commande find mal écrite","Où ça part : la commande ne marche pas.",esc(r.err));
    if(!ensembles(r.abs,b.abs)){const dep=t.split(" ")[1]||".",depB=ref.split(" ")[1];
      const tous=find(`find ${depB}`,T).abs,parti=dep[0]==="-"?".":dep;
      if(absolu(parti.replace(/^~/,ACCUEIL))!==absolu(depB.replace(/^~/,ACCUEIL)))return faux(0,"dossier de départ de find","Où ça part : le dossier de départ.",`Ta commande part de ${c(parti)}. La question demande de partir ${o.depDit}, qui s'écrit ${c(depB)}.`);
      const manque=b.abs.find(x=>!r.abs.includes(x)),trop=r.abs.find(x=>!b.abs.includes(x)),nom=x=>x.split("/").pop();
      if(o.type&&trop&&noeud(T,trop).d&&o.type==="f")return faux(1,"-type f oublié","Où ça part : le type.",`Ta commande trouve aussi le répertoire ${c(relatif(trop,depB))}. Pour ne garder que les fichiers ordinaires : ${c("-type f")}.`);
      if(o.type&&trop&&!noeud(T,trop).d&&o.type==="d")return faux(1,"-type d oublié","Où ça part : le type.",`Ta commande trouve aussi le fichier ${c(relatif(trop,depB))}. Pour ne garder que les répertoires : ${c("-type d")}.`);
      if(manque)return faux(1,"motif de -name","Où ça part : le motif.",`Ta commande ne trouve pas ${c(relatif(manque,depB))}, dont le nom ${o.sortDit}.${tous.includes(manque)&&!/["']/.test(t)?" Pense aussi aux guillemets autour du motif.":""}`);
      return faux(1,"motif de -name","Où ça part : le motif.",`Ta commande trouve aussi ${c(relatif(trop,depB))}, alors que le nom ${c(nom(trop))} ne correspond pas.`);}
    if(o.action){const a=r.action;
      if(!a)return faux(2,"action -exec oubliée","Où ça part : l'action.",`Ta commande ne fait qu'afficher les noms. Pour agir sur chaque fichier trouvé : ${c("-exec commande {} \\;")}.`);
      const bon=o.action==="rm"?a.cmd==="rm":o.action==="cat"?a.cmd==="cat"&&!a.args.some(x=>x!=="{}"):a.cmd==="ls"&&a.args.some(x=>/^-[a-z]*l/.test(x));
      if(!bon)return faux(2,"commande lancée par -exec","Où ça part : la commande de -exec.",`Pour ${o.actionDit}, la commande est ${c(o.action==="ls"?"ls -l":o.action)}.`);}}
  return {ok:true};}
function exoFind(R,palier){
  if(palier===0){/* lire : que trouve cette commande ? */
    const [cmd,dep]=R.choix([[`find . -name "*.log"`,"."],[`find . -name "*.py"`,"."],[`find ~ -name "*.csv"`,"~"],[`find . -type d`,"."],[`find ~ -name "*.py" -type f`,"~"],[`find . -name "tp*"`,"."],[`find .. -name "*DATA*"`,".."],[`find . -name "*.c" -type f`,"."],[`find ~ -type d -name "p*"`,"~"]]);
    const A=tireArbo(R,[["courant","b.log"],["sous","calcul.py"],["accueil","notes.csv"]]),r=find(cmd,A);if(r.err)throw new Error(cmd+" : "+r.err);if(r.trouve.length<1||r.trouve.length>6)return null;
    const voir=dep==="."?dessin(noeud(A,COURANT),"."):dessin(noeud(A,ACCUEIL),"~ (le dossier d'accueil, /home/etu)");
    const E=[{w:`D'où part la recherche : ${c(dep)}, ${dep==="."?"le dossier courant (projet)":dep==="~"?"le dossier d'accueil, /home/etu":"le dossier parent du dossier courant"}. find descend dans tous les sous-dossiers.`,why:`find examine aussi le dossier de départ lui-même, puis chaque fichier et chaque dossier qu'il contient, à tous les niveaux.`,pts:1},
      {w:`Les critères : ${/-name/.test(cmd)?`le nom doit correspondre à ${c(/-name "([^"]*)"/.exec(cmd)[1])}`:""}${/-name/.test(cmd)&&/-type/.test(cmd)?", et ":""}${/-type d/.test(cmd)?"ce doit être un répertoire":/-type f/.test(cmd)?"ce doit être un fichier ordinaire":""}.`,why:`Dans le motif de -name, ${c("*")} veut dire « n'importe quelle suite de caractères, même vide ». ${/-type/.test(cmd)?`${c("-type d")} garde les répertoires, ${c("-type f")} les fichiers ordinaires.`:""}`,pts:1},
      {w:`<b>find affiche ${r.trouve.length>1?"ces chemins":"ce chemin"}&nbsp;:</b>${bloc(r.trouve.join("\n"))}`,why:`Chaque chemin commence par le départ tel qu'il est écrit dans la commande (${c(dep==="~"?"/home/etu":dep)}).`,pts:1}];
    const norm=x=>{x=x.replace(/\/+$/,"");if(dep==="~")x=x.replace(/^~/,ACCUEIL);else if(dep==="."&&x!=="."&&!/^(\.\/|\/|\.\.)/.test(x))x="./"+x;return x;};
    function juge(rep){const L=propre(rep.s).split(/[\s,;]+/).filter(Boolean).map(norm);if(!L.length)return {incomplet:"Écris les chemins affichés, séparés par des espaces."};
      const faux=(etape,sorte,titre,msg)=>({ok:false,faux:["s"],resume:"Pas tout à fait : ce n'est pas ce qu'affiche find.",diag:{etape,type:sorte,titre,msg}});
      if(ensembles(L,r.trouve))return {ok:true};
      const manque=r.trouve.find(x=>!L.includes(x)),trop=L.find(x=>!r.trouve.includes(x));
      if(manque&&manque===dep)return faux(0,"dossier de départ trouvé par find","Où ça part : le départ lui-même.",`find examine aussi le dossier de départ : ${c(dep)} est un répertoire, il est affiché aussi.`);
      if(manque&&manque.split("/").length>(dep==="~"?4:2))return faux(0,"find descend dans les sous-dossiers","Où ça part : les sous-dossiers.",`find descend dans les sous-dossiers : il trouve aussi ${c(manque)}.`);
      if(manque&&r.trouve.length>L.length)return faux(1,"fichier oublié par find","Où ça part : un chemin oublié.",`find trouve aussi ${c(manque)} : il correspond aux critères.`);
      if(trop&&!r.trouve.map(x=>x.split("/").pop()).includes(trop.split("/").pop()))return faux(1,"critère de find","Où ça part : les critères.",`${c(trop)} ne correspond pas aux critères de la commande.`);
      return faux(2,"chemin affiché par find","Où ça part : l'écriture des chemins.",`Écris chaque chemin complet, depuis le départ : par exemple ${c(r.trouve[0])}.`);}
    return {sig:"F0"+cmd+JSON.stringify(A),q:`Voici une arborescence et une commande, lancée depuis le dossier courant ${c(COURANT.replace(ACCUEIL,"~"))}. Qu'affiche ${c(cmd)} ? Écris les chemins, séparés par des espaces, dans n'importe quel ordre.`,corps:bloc(voir),texte:cmd+" — chemins affichés",
      champs:[{k:"champ",id:"s",nom:"chemins",label:"Ce qu'affiche find :",ex:"par exemple ./a.log ./src/b.log",apercu:false,sym:[["./","./"],["/","/"]]}],juge,etapes:E,
      bonne:c(r.trouve.join(" ")),bonneTxt:r.trouve.join(" "),repBonne:{s:r.trouve.join(" ")},repFausse:{s:r.trouve.length>1?r.trouve.slice(1).join(" "):"./rien"},nature:"lire",
      ens:{bash:[{arbo:A,cmd,abs:r.abs.slice().sort()}]}};}
  /* écrire la commande */
  const sorte=R.choix(Object.keys(SORTES)),x=R.choix(VALEURS[sorte]),motif=SORTES[sorte][0](x),re=motifRe(motif),depK=R.choix(Object.keys(DEPARTS)),[dep,depDit]=DEPARTS[depK];
  const typ=palier===2?R.choix(["f","d"]):null,act=palier===3?R.choix([["rm","supprime"],["cat","affiche le contenu de"],["ls","affiche la liste détaillée (ls -l) de"]]):null;
  if(typ==="d"&&!["tp","old","data","2023","photo","log"].some(v=>v===x))return null;
  const P=proches(sorte,x),sansD=typ?null:n=>re.test(n);
  const nomDe=k=>motif.replace(/^\*/,["mes","vieux","new","a"][k]).replace(/\*$/,["2","s","_b","x"][k]);
  const vise=typ?[["courant",typ==="d"?nomDe(2)+".txt":P.oui[0],false],["sous",nomDe(0),typ==="d"],["accueil",nomDe(1),typ!=="d"],["courant",nomDe(3),typ==="d"]]
    :[["courant",P.oui[0]],["sous",P.oui[1]||P.oui[0]],["accueil",P.oui[P.oui.length-1]],["autre",P.oui[0]],...P.non.slice(0,3).map((n,i)=>[["courant","sous","accueil"][i],n])];
  const A=[0,1,2].map(k=>{const T=tireArbo(R,vise.filter((v,i)=>v[1]&&(k===0||R()<0.8||i===0)),sansD);if(k===2&&!typ){const tp=noeud(T,COURANT);if(!tp.d.some(y=>re.test(y.n)))tp.d.push(fichier(P.oui[0]));}return T;});
  const ref=`find ${dep}${typ?` -type ${typ}`:""} -name "${motif}"${act?` -exec ${act[0]==="ls"?"ls -l":act[0]} {} \\;`:""}`;
  const quoi=typ==="d"?"les répertoires":typ==="f"?"les fichiers ordinaires (pas les répertoires)":"les fichiers",q=act?`Donne la commande qui, à partir ${depDit}, ${act[1]} tous ${quoi.replace(/^les /,"les ")} dont le nom ${SORTES[sorte][1]} ${c('"'+x+'"')}.`.replace(" de tous les"," tous les").replace("affiche le contenu tous","affiche le contenu de tous").replace("(ls -l) tous","(ls -l) de tous"):`Donne la commande qui recherche, à partir ${depDit}, ${quoi} dont le nom ${SORTES[sorte][1]} ${c('"'+x+'"')}.`;
  const r0=find(ref,A[0]);if(r0.err)throw new Error(ref+" : "+r0.err);if(!r0.abs.length)return null;
  const o={depDit,sortDit:SORTES[sorte][2]+" « "+x+" »",type:typ,action:act&&act[0],actionDit:act&&act[1].replace(" de","").replace("affiche le contenu","afficher le contenu").replace("supprime","supprimer").replace("affiche la liste détaillée (ls -l)","afficher la liste détaillée")};
  const E=[{w:`Le départ : ${c(dep)}, ${depDit.replace(/^du /,"le ").replace(/^de la /,"la ")}.`,why:`${c(".")} est le dossier courant, ${c("~")} le dossier d'accueil, ${c("..")} le dossier parent. find descend ensuite dans tous les sous-dossiers.`,pts:1},
    {w:`Le nom : ${c(`-name "${motif}"`)}${typ?`, et le type : ${c("-type "+typ)}`:""}.`,why:`Un nom qui ${SORTES[sorte][2]} ${c('"'+x+'"')} : ${c(motif)}, où ${c("*")} remplace n'importe quelle suite de caractères. Les guillemets empêchent bash de remplacer le motif par les noms du dossier courant avant de lancer find.${typ?` ${c("-type d")} garde les répertoires, ${c("-type f")} les fichiers ordinaires.`:""}`,pts:act?1:1.5},
    ...(act?[{w:`L'action : ${c(`-exec ${act[0]==="ls"?"ls -l":act[0]} {} \\;`)}`,why:`${c("{}")} est remplacé par chaque fichier trouvé, et ${c("\\;")} termine la commande lancée. ${act[0]==="rm"?`On peut aussi écrire ${c("-delete")}.`:""}`,pts:1}]:[]),
    {w:`La commande : <b>${c(ref)}</b>`,why:`Sur la première arborescence d'essai, elle ${act?"agit sur":"trouve"} : ${r0.trouve.map(c).join(", ")}.`,pts:0.5}];
  const juge=rep=>jugeFind(rep.c,A,ref,o);
  const fausse=[ref.replace(/"/g,""),ref.replace(` ${dep} `,` ${dep==="."?"~":"."} `),ref.replace(` ${dep} `,` ${dep===".."?".":".."} `),ref.replace(`"${motif}"`,`"${x}"`),ref.replace(/ -type [fd]/,""),ref.replace(/ -exec.*$/,"")].find(f=>f!==ref&&juge({c:f}).ok===false);
  if(!fausse)return null;
  return {sig:"F"+palier+q,q,corps:"",texte:q.replace(/<[^>]+>/g,"").replace(/&quot;/g,'"'),champs:[{k:"champ",id:"c",nom:"commande",label:"La commande :",ex:"find …",apercu:false,sym:[["~","~"],["..",".."],['"','"'],["*","*"],["-name","-name "],["-type","-type "],...(act?[["-exec","-exec "],["{}","{}"],["\\;","\\;"]]:[])]}],juge,etapes:E,
    bonne:c(ref),bonneTxt:ref,repBonne:{c:ref},repFausse:{c:fausse},nature:palier===1?"nom":palier===2?"type":"exec",
    ens:{bash:A.map(T=>({arbo:T,cmd:ref,abs:find(ref,T).abs.slice().sort()})).concat(A.map(T=>{const f=find(fausse,T);return {arbo:T,cmd:fausse,abs:f.err?null:f.abs.slice().sort()};}))}};}
const tireFind=k=>R=>{for(;;){const e=exoFind(R,k);if(e)return e;}};

/* ---------- le petit grep : une expression de grep -E ("E"), de grep seul ("G") ou d'un corrigé qui écrit \d ("P"), traduite pour JavaScript ---------- */
/* le site lit $…$ comme une formule : dans tout ce qui est affiché, le dollar d'une expression est écrit &#36; */
const d36=h=>String(h).replace(/\$/g,"&#36;"),cr=s=>d36(c(s)),blocr=t=>d36(bloc(t));
const POSIX={digit:"0-9",alpha:"a-zA-Z",alnum:"a-zA-Z0-9",upper:"A-Z",lower:"a-z",space:" \\t"};
/* rend {js, avert}, ou {err} si l'expression est mal écrite, ou {inconnu} si elle sort du programme */
function ere(src,mode){const BRE=mode==="G",PY=mode==="P",n=src.length;let i=0,out="",prof=0,rep=0,avert="";
  const KO=m=>{throw {err:m};},NC=m=>{throw {inconnu:m};},lit=x=>/[.*+?^${}()|[\]\\\/]/.test(x)?"\\"+x:x;
  const quant=q=>{if(rep===2)NC(`Deux répétitions à la suite (${q} après une autre) : le site ne sait pas lire ça. Écris-le autrement.`);
    if(!rep)KO(`${q[0]} ne suit rien ici : dans une expression régulière, il répète ce qui est juste avant lui.${q==="*"?" Ce n'est pas le * de bash : « n'importe quelle suite de caractères » s'écrit .*":""}`);out+=q;rep=2;};
  const ouvre=()=>{if(!BRE&&src[i]==="?")NC("Les groupes qui commencent par (? ne sont pas au programme : le site ne sait pas les lire.");out+="(";prof++;rep=0;};
  const ferme=()=>{if(!prof)KO("Une parenthèse fermante est en trop.");prof--;out+=")";rep=1;};
  const inter=()=>{const f=BRE?"\\}":"}",j=src.indexOf(f,i);if(j<0)KO("Une accolade { n'est pas refermée.");const t=src.slice(i,j);i=j+f.length;
    if(/^,\d+$/.test(t))NC(`Le site ne lit pas {${t}} : écris {0${t}}.`);
    if(!/^\d+(,\d*)?$/.test(t))KO("Entre accolades, il faut un nombre, comme {2}, deux nombres, comme {1,3}, ou un nombre et une virgule, comme {2,}.");
    const [a,b]=t.split(",");if(b&&+b<+a)KO(`{${t}} : le premier nombre doit être le plus petit.`);if(+a>60||+b>60)NC("Le site ne lit pas les répétitions de plus de 60 fois.");quant("{"+t+"}");};
  const classe=()=>{let j=i,s="[",vide=true;if(src[j]==="^"){s+="^";j++;}
    for(;;j++){const x=src[j];if(x===undefined)KO("Un crochet [ n'est pas refermé par ].");if(x==="]"&&!vide)break;
      if(x==="["&&src[j+1]===":"){const f=src.indexOf(":]",j+2),C=f<0?null:POSIX[src.slice(j+2,f)];if(!C)NC("Le site ne connaît pas cette classe entre [: et :].");s+=C;j=f+1;}
      else if(x==="\\"&&PY){const y=src[++j];if(y===undefined)KO("Un crochet [ n'est pas refermé par ].");if(/[A-Za-z0-9]/.test(y)&&!/[dws]/.test(y))NC(`\\${y} entre crochets n'est pas au programme : le site ne sait pas le lire.`);s+="\\"+y;}
      else s+=/[\\\][^]/.test(x)?"\\"+x:x;
      vide=false;}
    i=j+1;return s+"]";};
  try{while(i<n){const x=src[i++];
      if(x==="\\"){const d=src[i++];if(d===undefined)KO("L'expression finit par une barre oblique inverse toute seule.");
        if(BRE&&"()|{}+?".includes(d)){if(d==="(")ouvre();else if(d===")")ferme();else if(d==="|"){out+="|";rep=0;}else if(d==="{")inter();else if(d==="}")KO("Une accolade fermante est en trop.");else quant(d);}
        else if(/[0-9<>]/.test(d))NC(`\\${d} n'est pas au programme : le site ne sait pas le lire.`);
        else if(/[wWsS]/.test(d)){out+="\\"+d;rep=1;}
        else if(/[bB]/.test(d)){out+="\\"+d;rep=0;}
        else if(PY&&/[dD]/.test(d)){out+="\\"+d;rep=1;}
        else if(/[A-Za-z]/.test(d)){if(PY)NC(`\\${d} n'est pas au programme : le site ne sait pas le lire.`);avert=avert||d;out+=d;rep=1;}
        else{out+=lit(d);rep=1;}}
      else if(x==="["){out+=classe();rep=1;}
      else if(x==="."){out+=".";rep=1;}
      else if(x==="^"){if(!BRE||i===1||/\\[(|]$/.test(src.slice(0,i-1))){out+="^";rep=0;}else{out+="\\^";rep=1;}}
      else if(x==="$"){if(!BRE||i===n||/^\\[)|]/.test(src.slice(i))){out+="$";rep=0;}else{out+="\\$";rep=1;}}
      else if(x==="*")quant("*");
      else if(!BRE&&(x==="+"||x==="?"))quant(x);
      else if(!BRE&&x==="(")ouvre();
      else if(!BRE&&x===")")ferme();
      else if(!BRE&&x==="|"){out+="|";rep=0;}
      else if(!BRE&&x==="{")inter();
      else{out+=lit(x);rep=1;}}
    if(prof)KO("Une parenthèse ( n'est pas refermée.");
    new RegExp(out);return {js:out,avert};}
  catch(e){return e.err||e.inconnu?e:{err:"L'expression est mal écrite : regarde les crochets (une suite à l'envers comme [z-a], par exemple)."};}}
/* o : deb, fin (ancres ajoutées), x (ligne entière), i (majuscules ignorées), v (tri inversé) */
function filtre(src,mode,o){o=o||{};const r=ere(src,mode);if(r.js===undefined)return r;
  const re=new RegExp((o.deb||o.x?"^(?:":"(?:")+r.js+(o.fin||o.x?")$":")"),o.i?"i":"");return {f:s=>re.test(s)!==!!o.v,avert:r.avert};}
const classeB=(re,mode,B,o)=>{const r=filtre(re,mode,o);return r.f?{mal:B.filter(x=>r.f(x.s)!==x.ok),avert:r.avert}:r;};
const hors=(t,quoi,par)=>t.replace(/\\.|\[\^?\]?[^\]]*\]|[\s\S]/g,m=>m===quoi?par:m);

/* ---------- les formes : une chaîne décrite morceau par morceau, d'où sortent l'expression, des exemples et des pièges ---------- */
/* écriture, caractères pour les exemples, nom au singulier, au pluriel, caractères qui n'en font pas partie */
const CLS={ch:["[0-9]","0123456789","un chiffre","chiffres",["a"]],mi:["[a-z]","abcdefgmnprstuvz","une lettre minuscule","lettres minuscules",["A","7"]],ma:["[A-Z]","ABCDEFGMNPRSTUVZ","une lettre majuscule","lettres majuscules",["a","7"]],
  le:["[a-zA-Z]","abcxyzABCXYZ","une lettre","lettres",["7","-"]],an:["[a-zA-Z0-9]","abxyABXY0189","une lettre ou un chiffre","lettres ou chiffres",["-","_"]],to:[".","abxy0189","un caractère quelconque","caractères quelconques",[]]};
const NEG={".":["un point","abxy0189","."],"0-9":["un chiffre","abxyABXY","5"],"A-Z":["une lettre majuscule","abxy0189","B"]," ":["un espace","abxy0189"," "],"-":["un tiret","abxy0189","-"],"/":["une barre oblique","abxy0189","/"],":":["un deux-points","abxy0189",":"]};
const NOMCAR={".":"un point",",":"une virgule","-":"un tiret","/":"une barre oblique",":":"un deux-points","#":"un dièse","+":"un signe plus","0":"le chiffre 0"};
const Cl=(k,a=1,b=a)=>({t:"c",k,a,b}),Sauf=(x,a=0,b=99)=>({t:"n",x,a,b}),Lit=(s,a=1)=>({t:"l",s,a,b:1}),Alt=L=>({t:"a",L}),Grp=M=>({t:"g",M}),Nb=(a=1,b=99)=>Cl("ch",a,b);
const qre=(a,b)=>a===1&&b===1?"":a===0&&b===99?"*":a===1&&b===99?"+":a===0&&b===1?"?":a===b?`{${a}}`:b===99?`{${a},}`:`{${a},${b}}`;
const lre=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const ecritM=m=>m.t==="c"?CLS[m.k][0]+qre(m.a,m.b):m.t==="n"?`[^${m.x}]`+qre(m.a,m.b):m.t==="l"?(m.a?lre(m.s):m.s.length>1?`(${lre(m.s)})?`:lre(m.s)+"?"):m.t==="a"?`(${m.L.map(lre).join("|")})`:`(${m.M.map(ecritM).join("")})?`;
const ecrit=F=>(F.deb?"^":"")+F.M.map(ecritM).join("")+(F.fin?"$":"");
function nomM(m){
  if(m.t==="l"){const n=m.s.length===1&&NOMCAR[m.s]?NOMCAR[m.s]:`le texte ${cr(m.s)}`;return m.a?n:n+", ou rien";}
  if(m.t==="a")return m.L.map(cr).join(" ou ");
  if(m.t==="g")return "si on veut : "+m.M.map(nomM).join(", puis ");
  const u=m.t==="c"?CLS[m.k][2]:"un caractère autre qu'"+NEG[m.x][0],d=m.t==="c"?CLS[m.k][3]:"caractères autres qu'"+NEG[m.x][0];
  return m.a===1&&m.b===1?u:m.a===1&&m.b===99?u+" ou plus":m.a===0&&m.b===99?"des "+d+", ou aucun":m.a===0&&m.b===1?u+", ou rien":m.a===m.b?`exactement ${m.a} ${d}`:m.b===99?`au moins ${m.a} ${d}`:`de ${m.a} à ${m.b} ${d}`;}
function pourquoi(M,S){S=S||new Set();for(const m of M){
    if(m.t==="g"){S.add(`${cr("( … )?")} : tout le groupe entre parenthèses peut manquer`);pourquoi(m.M,S);continue;}
    if(m.t==="a")S.add(`${cr("(a|b)")} : l'un ou l'autre`);
    if(m.t==="l"&&!/[.+*?()[\]{}^$|\\]/.test(m.s))S.add(`${cr(m.s)} s'écrit tel quel : ${m.s.length>1?"ce sont des caractères ordinaires":"c'est un caractère ordinaire"}`);
    if(m.t==="l"&&/[.+*?()[\]{}^$|\\]/.test(m.s))S.add(m.s.includes(".")?`${cr("\\.")} : un vrai point (le point seul voudrait dire « n'importe quel caractère »)`:`${cr(lre(m.s))} : la barre oblique inverse enlève au caractère son rôle spécial`);
    if(m.t==="n")S.add(`${cr("[^"+m.x+"]")} : n'importe quel caractère sauf ${NEG[m.x][0]}`);
    if(m.t==="c")S.add(m.k==="to"?`${cr(".")} : un caractère quelconque`:`${cr(CLS[m.k][0])} : ${CLS[m.k][2]}, ${/^une /.test(CLS[m.k][2])?"une seule":"un seul"}`);
    const q=m.t==="l"?(m.a?"":"?"):m.t==="a"?"":qre(m.a,m.b);
    if(q==="+")S.add(`${cr("+")} : une fois ou plus`);if(q==="*")S.add(`${cr("*")} : zéro fois ou plus`);if(q==="?")S.add(`${cr("?")} : zéro ou une fois`);
    if(q[0]==="{")S.add(`${cr(q)} : ${m.a===m.b?`exactement ${m.a} fois`:m.b===99?`au moins ${m.a} fois`:`de ${m.a} à ${m.b} fois`}`);}
  return [...S].join(" ; ")+".";}
const hasard=g=>{let a=g>>>0;const f=()=>(a=Math.imul(a,1664525)+1013904223>>>0)/4294967296;f.ent=(x,y)=>x+Math.floor(f()*(y-x+1));f.choix=L=>L[Math.floor(f()*L.length)];return f;};
/* f : {k, n} impose n répétitions au morceau k, {k, intrus} y glisse un caractère interdit, {k, rempl} remplace un texte, plein : aucun morceau vide */
function fab(F,R,f){f=f||{};const tire=(car,nb)=>{let s="";for(let j=0;j<nb;j++)s+=car[R.ent(0,car.length-1)];return s;};
  const fais=(m,k)=>{const moi=f.k===k;
    if(m.t==="l")return moi&&f.rempl!==undefined?f.rempl:m.a||f.plein||R()<0.5?m.s:"";
    if(m.t==="a")return moi&&f.rempl!==undefined?f.rempl:R.choix(m.L);
    if(m.t==="g")return (moi?f.n:f.plein||R()<0.5)?m.M.map(x=>fais(x,-1)).join(""):"";
    const nb=moi&&f.n!==undefined?f.n:m.a===m.b?m.a:R.ent(Math.max(m.a,f.plein?1:0),Math.min(m.b,m.a+2)),s=tire(m.t==="c"?CLS[m.k][1]:NEG[m.x][1],nb);
    return moi&&f.intrus?(s.length>2?s[0]+f.intrus+s.slice(2):f.intrus+s.slice(1)):s;};
  const parts=F.M.map(fais);return {s:parts.join(""),parts};}
/* les chaînes d'essai d'une forme, toujours les mêmes : {s, ok, pq} ; pq dit pourquoi une chaîne refusée l'est */
const BQ={};
function banque(F){const ref=ecrit(F),cle=ref+"|"+(F.plus||[]).length+(F.sans?"s":"")+(F.vide===0?"v":"");if(BQ[cle])return BQ[cle];
  let g=7;for(const x of ref)g=Math.imul(g,31)+x.charCodeAt(0)|0;
  const R=hasard(g),f0=filtre(ref,"E").f,B=[],vu=new Set();
  const met=(s,pq)=>{if(vu.has(s)||!/^[\x20-\x7e]*$/.test(s)||s.length>30||(s===""&&F.vide===0)||(F.sans&&F.sans(s)))return;vu.add(s);B.push({s,ok:f0(s),pq:pq||""});};
  const base=[fab(F,R,{plein:1}).s,fab(F,R).s,fab(F,R).s,fab(F,R).s];base.forEach(s=>met(s));
  F.M.forEach((m,k)=>{const nm=nomM(m);
    if(m.t==="c"||m.t==="n"){
      if(m.a>=1)met(fab(F,R,{k,n:m.a-1,plein:1}).s,m.a===1?`il manque ${nm.replace(/ ou plus$/,"")}`:`il n'y a pas ${nm}`);
      if(m.b<99)met(fab(F,R,{k,n:m.b+1,plein:1}).s,m.b===1?`il y a ${nm.replace(/, ou rien$/,"")} en trop`:`il n'y a pas ${nm}`);
      for(const x of m.t==="c"?CLS[m.k][4]:[NEG[m.x][2]])met(fab(F,R,{k,intrus:x,n:m.a===m.b?m.a:Math.min(m.b,Math.max(m.a,3)),plein:1}).s,m.t==="c"?`${cr(x)} n'est pas ${CLS[m.k][2]}`:`il y a ${NEG[m.x][0]} en trop`);}
    else if(m.t==="l"){const r=/[^a-zA-Z0-9]/.test(m.s)?m.s.replace(/[^a-zA-Z0-9]/,"x"):"xy",nl=nomM(Lit(m.s));
      met(fab(F,R,{k,rempl:r,plein:1}).s,`${cr(r)} remplace ${nl}`);if(m.a)met(fab(F,R,{k,rempl:"",plein:1}).s,`il manque ${nl}`);met(fab(F,R,{k,rempl:m.s+m.s,plein:1}).s,`${nl} est là deux fois`);}
    else if(m.t==="a"){met(fab(F,R,{k,rempl:"xyz",plein:1}).s,`${cr("xyz")} n'est pas dans la liste`);met(fab(F,R,{k,rempl:m.L[0]+m.L[0].slice(-1),plein:1}).s,"il y a une lettre en trop");}
    else{met(fab(F,R,{k,n:1,plein:1}).s);met(fab(F,R,{k,n:0,plein:1}).s);}});
  for(const s of base.slice(0,2)){const p=F.deb?"":"ab",z=F.fin?"":"yz";
    (F.deb?[]:["ab","tp1","notes"]).forEach(x=>met(x+s));(F.fin?[]:["yz","_2"]).forEach(x=>met(s+x));
    if(F.deb)["x","7","-"].forEach(x=>met(x+s+z,"il y a un caractère en trop au début"));
    if(F.fin)["x","7","-"].forEach(x=>met(p+s+x,"il y a un caractère en trop à la fin"));}
  ["abc","ABC","123","a.b","-_-"].forEach(s=>met(s));met("");
  (F.plus||[]).forEach(x=>Array.isArray(x)?met(x[0],x[1]):met(x));
  if(B.filter(x=>x.ok).length<2||B.filter(x=>!x.ok).length<3)throw new Error("banque trop pauvre : "+ref);
  return BQ[cle]=B;}

/* ---------- reconnaître l'erreur : l'expression est retouchée (une ancre, un point protégé…) et rejugée sur les chaînes d'essai ---------- */
const REP=[
  {type:"^ oublié",e:2,si:F=>F.deb,f:(t,o)=>/^\^/.test(t)||o.deb||o.x?null:[t,Object.assign({},o,{deb:1})],m:`il manque ${cr("^")} au début : sans lui, la forme peut commencer n'importe où dans la chaîne`},
  {type:"$ oublié",e:2,si:F=>F.fin,f:(t,o)=>/[^\\]\$$/.test(t)||o.fin||o.x?null:[t,Object.assign({},o,{fin:1})],m:`il manque ${cr("$")} à la fin : sans lui, la forme peut s'arrêter n'importe où dans la chaîne`},
  {type:"^ en trop",e:2,si:F=>!F.deb,f:(t,o)=>/^\^/.test(t)?[t.slice(1),o]:null,m:`${cr("^")} est en trop : il oblige la forme à être tout au début, alors qu'elle peut être n'importe où`},
  {type:"$ en trop",e:2,si:F=>!F.fin,f:(t,o)=>/[^\\]\$$/.test(t)?[t.slice(0,-1),o]:null,m:`${cr("$")} est en trop : il oblige la forme à être tout à la fin, alors qu'elle peut être n'importe où`},
  {type:"point non protégé",e:1,si:()=>1,f:(t,o)=>{const u=t.replace(/\\.|\[\^?\]?[^\]]*\]|\.(?![*+?{])/g,m=>m==="."?"\\.":m);return u===t?null:[u,o];},m:`le point seul veut dire « n'importe quel caractère » : un vrai point s'écrit ${cr("\\.")}, avec une barre oblique inverse devant`},
  {type:"* à la place de +",e:1,si:()=>1,f:(t,o,g)=>{const u=hors(t,"*",g==="G"?"\\{1,\\}":"+");return u===t?null:[u,o];},m:`${cr("*")} accepte aussi zéro fois : « au moins une fois » s'écrit ${cr("+")}`},
  {type:"+ à la place de *",e:1,si:()=>1,f:(t,o,g)=>{const u=g==="G"?t:hors(t,"+","*");return u===t?null:[u,o];},m:`${cr("+")} exige au moins une fois : « peut-être aucune » s'écrit ${cr("*")}`}];
function diagExpr(t,mode,B,F,o){o=o||{};const mal=classeB(t,mode,B,o).mal,a=mal.find(x=>!x.ok),b=mal.find(x=>x.ok),lg=s=>s===""?"la ligne vide":cr(s);
  const quoi="Ton expression ne trie pas bien : "+[a&&`elle accepte ${lg(a.s)}, qui ne doit pas passer${a.pq&&a.s?` (${a.pq})`:""}`,b&&`elle refuse ${lg(b.s)}, qui doit passer`].filter(Boolean).join(", et ")+".";
  const va=L=>{let u=t,p=o;for(const k of L){const x=REP[k].si(F)&&REP[k].f(u,p,mode);if(!x)return false;[u,p]=x;}const z=classeB(u,mode,B,p);return !!z.mal&&!z.mal.length;};
  const C=REP.map((_,k)=>[k]);REP.forEach((_,i)=>REP.forEach((_,j)=>{if(i<j)C.push([i,j]);}));C.push([0,1,4],[0,1,5]);
  const L=C.find(va);
  if(L)return {etape:Math.min(...L.map(k=>REP[k].e)),type:L.map(k=>REP[k].type).join(", "),titre:L.every(k=>REP[k].e===2)?"Où ça part : le début et la fin.":"Où ça part : un morceau de l'expression.",msg:`${quoi} La cause : ${L.map(k=>REP[k].m).join(" ; et ")}.`};
  return {etape:1,type:a&&b?"expression qui trie mal":a?"expression trop large":"expression trop stricte",titre:"Où ça part : un morceau de l'expression.",msg:quoi+(F.astuce?" "+F.astuce:"")};}
function jugeExpr(texte,B,F){const t=propre(texte);if(!t)return {incomplet:"Écris l'expression."};
  if(t.length>1&&/^(["'\/]).*\1$/.test(t))return {incomplet:"Écris l'expression seule, sans guillemets ni barres autour."};
  if(/^(e?grep|ls|cat)( |$)/.test(t))return {incomplet:"Ici, on demande seulement l'expression, pas la commande."};
  const faux=d=>({ok:false,faux:["e"],resume:"Pas tout à fait : cette expression ne garde pas les bonnes chaînes.",diag:d});
  const r=classeB(t,"P",B);if(r.inconnu)return {incomplet:d36(esc(r.inconnu))};
  if(r.err)return faux({etape:1,type:"expression mal écrite",titre:"Où ça part : l'expression est mal écrite.",msg:d36(esc(r.err))});
  return r.mal.length?faux(diagExpr(t,"P",B,F)):{ok:true};}

/* ---------- la ligne de commande : ls, cat et grep reliés par des tubes, jouée sur l'arborescence ---------- */
function tubes(l){const S=[];let cur="",q=null;
  for(let i=0;i<l.length;i++){const x=l[i],d=l[i+1]||"";
    if(q){cur+=x;if(x===q)q=null;else if(q==='"'&&(x==="`"||(x==="\\"&&d&&'\\"$`'.includes(d))||(x==="$"&&/[A-Za-z_{(]/.test(d))))return {inconnu:"Entre guillemets doubles, bash transforme encore $nom, \\$ et \\\\ : mets plutôt l'expression entre guillemets simples."};}
    else if(x==='"'||x==="'"){q=x;cur+=x;}
    else if(x==="\\"&&d){cur+=x+d;i++;}
    else if(x==="|"){if(d==="|")return {err:"|| n'est pas un tube : il en faut un seul."};S.push(cur.trim());cur="";}
    else if(x==="("||x===")")return {err:"Sans guillemets, bash ne comprend pas les parenthèses de l'expression : la commande ne se lance pas. Mets l'expression entre guillemets.",type:"guillemets oubliés"};
    else if(x==="{"&&/^[^} ]*,[^} ]*\}/.test(l.slice(i+1)))return {err:"Sans guillemets, bash développe les accolades {a,b} en plusieurs mots avant de lancer grep. Mets l'expression entre guillemets.",type:"guillemets oubliés"};
    else if(";<>&`".includes(x)||(x==="$"&&/[A-Za-z_{(]/.test(d)))return {inconnu:`Écris une seule ligne de commandes reliées par des tubes, sans ${x}.`};
    else cur+=x;}
  if(q)return {err:`Un guillemet ${q} n'est pas refermé.`};S.push(cur.trim());return {S};}
/* les mots d'une commande, guillemets retirés mais barres obliques inverses gardées : ce que l'expression serait avec des guillemets */
const crus=seg=>{const L=[];let w="",q=null,la=false;for(const x of seg){if(q){if(x===q)q=null;else w+=x;}else if(x==='"'||x==="'"){q=x;la=true;}else if(x===" "){if(la){L.push(w);w="";la=false;}}else{w+=x;la=true;}}if(la)L.push(w);return L;};
const contenu=x=>x.c?x.c.replace(/\n$/,"").split("\n"):[];
/* rend {entree, greps:[{mode, o, re, cru, lit}]}, ou {err}, ou {inconnu} */
function planGrep(t,T){const D=tubes(t);if(!D.S)return D;let L=null;const P={entree:null,greps:[]};
  for(let k=0;k<D.S.length;k++){const seg=D.S[k];if(!seg)return {err:"Il manque une commande d'un côté du tube |."};
    const M=mots(seg,T);if(M.err)return {err:M.err};const W=M.W,C=crus(seg),nom=W[0].w;
    if(nom==="ls"||nom==="cat"){if(k)return {err:`${nom} ne lit pas ce qui arrive par le tube : place-le au début.`};
      const A=W.slice(1).filter(x=>!/^-/.test(x.w)),opt=W.slice(1).filter(x=>/^-/.test(x.w)).map(x=>x.w).join("");
      if(nom==="cat"){if(opt||!A.length)return {inconnu:"Écris cat suivi du nom du fichier."};L=[];for(const a of A){const x=noeud(T,absolu(a.w));if(!x||x.d)return {err:`cat : ${a.w} : aucun fichier de ce nom.`};L.push(...contenu(x));}continue;}
      if(/l/.test(opt))return {inconnu:"Avec ls -l, grep recevrait toute la ligne (droits, taille, date) et l'afficherait : utilise ls seul."};
      if(/R/.test(opt))return {inconnu:"ls -R descend dans les sous-dossiers : ici, seul le dossier courant est demandé. Utilise ls seul."};
      if(A.some(x=>x.developpe||/[*?]/.test(x.w)))return {inconnu:"Après ls, * et ? sont des motifs de bash, pas une expression régulière. Écris ls seul : c'est grep qui trie les noms."};
      if(/[^-1aA]/.test(opt)||A.length>1)return {inconnu:"Ici, écris ls seul (ou ls -a) : c'est grep qui trie les noms."};
      const d=noeud(T,absolu(A.length?A[0].w:"."));if(!d||!d.d)return {err:`ls : ${A[0].w} n'est pas un dossier.`};
      L=tri(d.d).map(x=>x.n).filter(x=>/[aA]/.test(opt)||x[0]!==".");if(/a/.test(opt))L=[".","..",...L];}
    else if(nom==="grep"||nom==="egrep"){const g={mode:nom==="egrep"?"E":"G",o:{},re:null,cru:null,lit:null},F=[];let e=false;
      for(let j=1;j<W.length;j++){const w=W[j].w;
        if(W[j].developpe)return {err:`bash a remplacé ${W[j].developpe} par les noms du dossier courant qui lui correspondent, avant de lancer grep. Mets l'expression entre guillemets.`,type:"guillemets oubliés"};
        if(/^-./.test(w)&&!e){for(const x of w.slice(1)){if("EPG".includes(x))g.mode=x;else if("ivxc".includes(x))g.o[x]=1;else if(x==="e")e=true;else return {inconnu:`Le site ne connaît pas l'option -${x} de grep ici : écris la commande avec grep -E.`};}}
        else if(g.re===null||e){g.re=w;g.cru=C[j];e=false;}else F.push(w);}
      if(g.re===null)return {err:"grep : il manque l'expression régulière."};
      if(F.length>1)return {inconnu:"Donne un seul fichier à grep : avec plusieurs, il écrit le nom du fichier devant chaque ligne."};
      if(F.length){const x=noeud(T,absolu(F[0]));if(!x||x.d)return {err:`grep : ${F[0]} : aucun fichier de ce nom.`};g.lit=contenu(x);}
      else if(L===null&&!P.greps.length)return {err:"grep n'a rien à lire : donne-lui un fichier, ou envoie-lui des lignes par un tube |."};
      if(!P.greps.length)P.entree=g.lit||L;P.greps.push(g);}
    else if(nom==="find")return {err:"find cherche avec un motif de bash (-name), pas avec une expression régulière. Ici, la question demande grep.",type:"find au lieu de grep"};
    else if(k&&P.greps.length&&!/^(sort|wc|head|tail|uniq|cut|tr|less|more)$/.test(nom))return {err:`Sans guillemets, bash a pris la barre | de l'expression pour un tube : il cherche une commande « ${nom} ». Mets l'expression entre guillemets.`,type:"guillemets oubliés"};
    else return {inconnu:`Ici, le site connaît ls, cat et grep, pas ${nom}.`};}
  return P.greps.length?P:{err:"Il manque grep : c'est lui qui lit les expressions régulières.",type:"commande sans grep"};}
function joue(P){let L=P.entree,avert="";for(const g of P.greps){if(g.lit)L=g.lit;const r=filtre(g.re,g.mode,g.o);if(!r.f)return r;avert=avert||r.avert;L=L.filter(r.f);if(g.o.c)L=[String(L.length)];}return {sortie:L,avert};}
function jugeCmd(texte,T,B,O){const t=propre(texte);if(!t)return {incomplet:"Écris la commande."};
  const faux=(etape,type,titre,msg)=>({ok:false,faux:["c"],resume:"Pas tout à fait : cette commande n'affiche pas ce qui est demandé.",diag:{etape,type,titre,msg}});
  const P=planGrep(t,T);if(P.inconnu)return {incomplet:d36(esc(P.inconnu))};
  if(P.err)return faux(/guillemets/.test(P.type||"")?2:0,P.type||"commande mal écrite",P.type?"Où ça part : "+P.type+".":"Où ça part : la commande ne marche pas.",d36(esc(P.err)));
  const bon=B.filter(x=>x.ok).map(x=>x.s),tout=B.map(x=>x.s),J=joue(P);if(J.inconnu)return {incomplet:d36(esc(J.inconnu))};
  if(J.err)return faux(1,"expression mal écrite","Où ça part : l'expression est mal écrite.",d36(esc(J.err)));
  if(ensembles(J.sortie,bon))return {ok:true};
  if(!tout.every(s=>P.entree.includes(s)))return faux(0,"lignes données à grep","Où ça part : ce que grep reçoit.",O.ls?`La question porte sur les noms des fichiers du dossier courant : c'est ${cr("ls")} qui les donne, et le tube ${cr("|")} les envoie à grep.`:`La question porte sur les lignes du fichier ${cr(O.nom)} : ${cr('grep -E "…" '+O.nom)}.`);
  const lg=s=>s===""?"la ligne vide":cr(s),a=B.find(x=>!x.ok&&J.sortie.includes(x.s)),b=B.find(x=>x.ok&&!J.sortie.includes(x.s));
  const quoi="Ta commande "+[a&&`affiche ${lg(a.s)}, qui ne doit pas sortir${a.pq&&a.s?` (${a.pq})`:""}`,b&&`n'affiche pas ${lg(b.s)}, qui doit sortir`].filter(Boolean).join(", et ")+".";
  if(!a&&!b)return faux(0,"lignes en trop données à grep","Où ça part : ce que grep reçoit.",`Ta commande affiche aussi ${lg(J.sortie.find(s=>!tout.includes(s)))}, qui ne fait pas partie de ce qui est demandé.`);
  if(P.greps.length>1)return faux(1,"plusieurs grep à la suite","Où ça part : l'expression.",quoi+" Une seule commande grep -E suffit.");
  const g=P.greps[0];
  if(g.o.c)return faux(3,"-c à la place de l'affichage","Où ça part : l'option -c.",`Avec ${cr("-c")}, grep écrit le nombre de lignes trouvées au lieu de les afficher.`);
  const essai=m=>{const r=joue({entree:P.entree,greps:[Object.assign({},g,m)]});return !!r.sortie&&ensembles(r.sortie,bon);};
  if(g.o.v&&essai({o:Object.assign({},g.o,{v:0})}))return faux(3,"-v en trop","Où ça part : l'option -v.",`${cr("-v")} inverse le tri : grep affiche les lignes qui ne correspondent pas à l'expression.`);
  const ops=["+","?","|","(",")","{","}"].filter(x=>g.re.includes(x)).map(cr);
  const RC=[[g.cru!==g.re,{re:g.cru},"guillemets oubliés",`sans guillemets, bash enlève les barres obliques inverses avant de lancer grep, qui reçoit ${cr(g.re)} au lieu de ${cr(g.cru)}`],
    [g.mode==="G",{mode:"E"},"-E oublié",`sans ${cr("-E")}, grep prend ${ops.length===1?ops[0]+" pour un caractère ordinaire":(ops.join(", ")||"+ ? | ( … ) { … }")+" pour des caractères ordinaires"}`],
    [J.avert==="d",{mode:"P"},"\\d avec grep",`grep ne connaît pas ${cr("\\d")} : il cherche la lettre d. Écris ${cr("[0-9]")}${g.mode==="G"&&ops.length?`, et ajoute ${cr("-E")}`:""}`]];
  const K=[[0],[1],[2],[0,1],[0,2]].filter(L=>L.every(k=>RC[k][0])).find(L=>essai(Object.assign({},...L.map(k=>RC[k][1]))));
  if(K)return faux(2,K.map(k=>RC[k][2]).join(", "),"Où ça part : -E et les guillemets.",`${quoi} La cause : ${K.map(k=>RC[k][3]).join(" ; et ")}.`);
  const d=diagExpr(g.re,g.mode,B,O.F,g.o);d.etape=1;return {ok:false,faux:["c"],resume:"Pas tout à fait : cette commande n'affiche pas ce qui est demandé.",diag:d};}

G.usi.ere=ere;G.usi.filtre=filtre;G.usi.planGrep=planGrep;G.usi.joue=joue;

/* ---------- US6 : expressions régulières ---------- */
/* palier 1 : une expression et sept lignes ; + devant une ligne que grep affiche, - devant les autres, puis la raison ({…} : du code) */
const LIRE=[
 ["^[0-9]+$","+2024","-12a|il y a une lettre à la fin","-a12|il y a une lettre au début","+7","-3.14|le point n'est pas un chiffre","-deux","-20 24|l'espace n'est pas un chiffre"],
 ["[0-9]+","+2024","+12a|12 suffit","+a12|12 suffit","-tp","+x7y|7 suffit","-deux","+3.14"],
 ["^[0-9]","+2024","+12a|le début est un chiffre, la suite est libre","-a12|le premier caractère est une lettre","+7up","-tp3|le chiffre n'est pas au début","-x","+3 pommes"],
 ["[0-9]$","+tp3","-3tp|le chiffre n'est pas à la fin","+a12","-12a|le dernier caractère est une lettre","-note","+v2","-2 fois"],
 ["^[a-z]+$","+note","-Note|N est une majuscule","-tp3|3 n'est pas une lettre","+abc","-a b|l'espace n'est pas une lettre","+x","-a.b"],
 ["^[A-Z]","+Note","-note","+NOTE","-nOTE|le premier caractère est une minuscule","+Tp3","-3A|le premier caractère est un chiffre","+A"],
 ["\\.py$","+tp1.py","-tp1.pyc|il y a un c après {.py}","-copy|il n'y a pas de point","-tp.py.txt|{.py} n'est pas à la fin","+a.py","-xpy|il n'y a pas de point","+.py"],
 [".py$","+tp1.py","+copy|le point accepte n'importe quel caractère, ici o","+xpy|le point accepte n'importe quel caractère, ici x","-py|il faut un caractère avant py","-a.pyc","+happy","-pyx"],
 ["a.c","+abc|le point accepte b","+a.c","-ac|il faut un caractère entre a et c","+aXc","-bac|il n'y a rien entre a et c","-a..c|il y a deux caractères entre a et c","+xa-cx|a-c est au milieu, et rien n'oblige à être au début ou à la fin"],
 ["a\\.c","-abc|b n'est pas un point","+a.c","-ac","+xa.cx|rien n'oblige à être au début ou à la fin","-a..c","-A.c|A est une majuscule","-a,c"],
 ["ab*c","+ac|b peut manquer : * accepte zéro fois","+abc","+abbbc","-ab|il manque c","-abxc|x n'est pas un b","-bc|il manque a","+xacx"],
 ["ab+c","-ac|il faut au moins un b","+abc","+abbbc","-ab","-abxc","+aabcc|abc est au milieu","-a+c|ici + n'est pas un caractère à chercher"],
 ["ab?c","+ac|b peut manquer","+abc","-abbc|un seul b au plus","+xacx","-abxc","-bc","-ab"],
 ["^[^.]*$","+notes","-a.b|il y a un point","+README","-tp1.py","+2024","-.|c'est un point","+a,b"],
 ["^[^.]*\\.[^.]*$","+a.b","-notes|il n'y a pas de point","-a.b.c|il y a deux points","+tp1.py","+.|rien avant, rien après : * accepte zéro fois","-v1.2.3","+a."],
 ["^[0-9]+\\.[0-9]+$","+3.14","-3,14|une virgule n'est pas un point","-12.|il manque des chiffres après le point","-.5|il manque des chiffres avant le point","-10.0.1|il y a deux points","-a1.2","+1.2"],
 ["[0-9]+\\.[0-9]+","+3.14","+v1.2.3|1.2 suffit","-12.","+pi=3.14 ok|3.14 est au milieu","-3,14","-1.x","-.5"],
 ["\\.jpe?g$","+a.jpg","+a.jpeg","-a.jpeeg|un seul e au plus","-a.jpg.txt|{.jpg} n'est pas à la fin","-jpg|il n'y a pas de point","-b.JPG|ce sont des majuscules","-a.jpe"],
 ["\\.(py|sh)$","+a.py","+b.sh","-c.pyc","-sh|il n'y a pas de point","-x.sh.old","-d.zsh|le point n'est pas juste avant sh","+.sh"],
 ["^(tp|td)[0-9]$","+tp1","+td2","-tp12|un seul chiffre","-te1","-tp|il manque le chiffre","-xtp1","-TD1"],
 ["^[0-9]{2}$","+12","-7|un seul chiffre","-123|trois chiffres","-ab","-1a","+00","-1 2"],
 ["[0-9]{2}","+12","-7","+123|12 suffit : rien n'oblige à prendre toute la ligne","-a1b2|les deux chiffres ne se suivent pas","+x45y","-1 2","+2024"],
 ["^[A-Z][a-z]+$","+Paul","-paul","-PAUL|après la majuscule, il faut des minuscules","-P|il faut au moins une minuscule","-Jean3","+Marie","-Jean Paul"],
 ["^[0-9]{2}/[0-9]{2}/[0-9]{4}$","+12/03/2024","-1/3/2024|il faut deux chiffres pour le jour","-12-03-2024","-12/03/24|il faut quatre chiffres pour l'année","+99/99/9999|l'expression ne vérifie pas que la date existe","-le 12/03/2024|il y a du texte avant","-12/03/2024."],
 ["^0[0-9]{9}$","+0612345678","-1612345678|le premier chiffre n'est pas 0","-061234567|neuf chiffres seulement","-06123456789|onze chiffres","-06 12 34 56 78|les espaces ne sont pas des chiffres","+0000000000","-O612345678|c'est la lettre O"],
 ["^-?[0-9]+$","+-12","+12|le signe moins peut manquer","---12|un seul signe moins au plus","--|il manque les chiffres","-1-2","-+12","+0"],
 ["^[a-z]+[0-9]*$","+tp|les chiffres peuvent manquer","+tp12","-12|il faut au moins une lettre au début","-tp12b|il y a une lettre après les chiffres","-TP1","+t1","-tp 1"],
 ["^[^0-9]+$","+notes","-tp3|il y a un chiffre","+a.b","-2024","+A b","+x","-v2"],
 ["^[a-zA-Z0-9]+$","+tp3","-tp_3|_ n'est ni une lettre ni un chiffre","+Tp3","-a.b","+2024","-a b","+X"],
 ["^.{3}$","+abc","-ab|deux caractères seulement","-abcd|quatre caractères","+a.c","+123","+a c|l'espace est un caractère comme un autre","-a"],
 ["^[0-9].*[0-9]$","+2024","+1a2","-12a|le dernier caractère est une lettre","-a12","-7|il faut un chiffre au début et un autre à la fin","+1 et 2","+3.14"],
 ["^[^.]*\\.[^.]*\\.[^.]*$","+a.b.c","-a.b|un seul point","-v1.2.3.4|trois points","+..|deux points, et rien autour","+1.2.3","+a..b","-abc"],
 ["^tp","+tp1.py","-atp.py|tp n'est pas au début","+tp","-Tp1","+tpx","-t p","-1tp"],
 ["txt$","+notes.txt","+txt","-notes.txt.old","+montxt|aucun point n'est demandé","-txt2","-TXT","+a.txt"],
 ["^[a-z]+\\.[a-z]+$","+notes.txt","-Notes.txt","-notes.","-tp1.py|1 n'est pas une lettre","+a.b","-a.b.c","-notes"]];
const NOMCL={"[0-9]":"un chiffre","[a-z]":"une lettre minuscule","[A-Z]":"une lettre majuscule","[a-zA-Z]":"une lettre","[a-zA-Z0-9]":"une lettre ou un chiffre","[^.]":"un caractère autre qu'un point","[^0-9]":"un caractère autre qu'un chiffre"};
function lecture(re){const L=[],J=re.match(/\\.|\[\^?\]?[^\]]*\]|\([^()]*\)|\{[^}]*\}|[\s\S]/g)||[],Q={"*":"zéro fois ou plus","+":"une fois ou plus","?":"zéro ou une fois"};
  for(let i=0;i<J.length;i++){const x=J[i],q=/^([*+?]|\{.*\})$/.test(J[i+1]||"")?J[++i]:"";let sens,texte=false;
    if(x==="^")sens="le début de la ligne";else if(x==="$")sens="la fin de la ligne";else if(x===".")sens="un caractère quelconque";
    else if(x[0]==="\\")sens=x==="\\."?"un vrai point":`le caractère ${cr(x[1])}`;
    else if(x[0]==="[")sens=NOMCL[x]||(x[1]==="^"?"un caractère qui n'est pas dans la liste":"un caractère de la liste");
    else if(x[0]==="(")sens=x.slice(1,-1).split("|").map(cr).join(" ou ");
    else{sens=q?`le caractère ${cr(x)}`:`le texte ${cr(x)}`;texte=!q;}
    if(q){const m=/^\{(\d+)(,(\d*))?\}$/.exec(q);sens+=", "+(Q[q]||(m[2]===undefined?`exactement ${m[1]} fois`:m[3]===""?`au moins ${m[1]} fois`:`de ${m[1]} à ${m[3]} fois`));}
    const d=L[L.length-1];if(texte&&d&&d.texte){d.bout+=x;d.sens=`le texte ${cr(d.bout)}`;}else L.push({bout:x+q,sens,texte});}
  return L;}
const LECT=[
  ["ancres ignorées",re=>/^\^|[^\\]\$$/.test(re)?[re.replace(/^\^/,"").replace(/([^\\])\$$/,"$1"),{}]:null,`${cr("^")} colle l'expression au début de la ligne et ${cr("$")} à la fin : tu as coché des lignes où la forme est seulement quelque part dans la ligne.`],
  ["expression lue comme si elle prenait toute la ligne",re=>/^\^/.test(re)&&/[^\\]\$$/.test(re)?null:[re,{x:1}],`Sans ${cr("^")} au début (ou sans ${cr("$")} à la fin), il suffit qu'un morceau de la ligne ait cette forme : la ligne n'a pas besoin de l'avoir en entier.`],
  ["point lu comme un vrai point",re=>{const u=hors(re,".","\\.");return u===re?null:[u,{}];},`Le point seul veut dire « n'importe quel caractère ». Un vrai point s'écrit ${cr("\\.")}, avec une barre oblique inverse devant.`],
  ["* ou ? lus comme « au moins une fois »",re=>{const u=hors(hors(re,"*","+"),"?","");return u===re?null:[u,{}];},`${cr("*")} veut dire « zéro fois ou plus » et ${cr("?")} « zéro ou une fois » : ce qui les précède peut manquer.`]];
const arboDe=F=>dossier("",[dossier("home",[dossier("etu",[dossier("projet",F)])])]);
const brut=h=>String(h).replace(/<[^>]+>/g,"").replace(/&#36;/g,"$").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&amp;/g,"&");
function exoLire(R){const X=R.choix(LIRE),re=X[0],f=filtre(re,"E").f,T=X.slice(1).map(s=>{const [l,pq]=s.slice(1).split("|");return {s:l,veut:s[0]==="+",pq:d36((pq||"").replace(/\{([^}]*)\}/g,(m,x)=>c(x)))};});
  T.forEach(x=>{if(f(x.s)!==x.veut)throw new Error(re+" : « "+x.s+" » est mal prévue");});
  const L=R.mel(T).slice(0,6),bon=L.map(x=>x.veut),N=bon.filter(Boolean).length;if(!N||N===6)return null;
  const cmd=`grep -E "${re}" lignes.txt`,deb=re[0]==="^",fin=/[^\\]\$$/.test(re),bonnes=L.filter(x=>x.veut).map(x=>x.s),ids=L.map((_,i)=>String(i)).filter(i=>bon[i]);
  function juge(rep){const S=(rep.g||[]).map(String);if(!S.length)return {incomplet:"Coche les lignes que grep affiche."};
    const moi=L.map((_,i)=>S.includes(String(i)));if(moi.every((v,i)=>v===bon[i]))return {ok:true};
    const faux=(etape,type,titre,msg)=>({ok:false,faux:["g"],resume:"Pas tout à fait : ce ne sont pas les lignes que grep affiche.",diag:{etape,type,titre,msg}});
    for(const [type,tr,msg] of LECT){const x=tr(re);if(!x)continue;const r=filtre(x[0],"E",x[1]);if(r.f&&L.every((y,i)=>r.f(y.s)===moi[i]))return faux(0,type,"Où ça part : la lecture de l'expression.",msg);}
    const i=moi.findIndex((v,k)=>v!==bon[k]);
    return faux(1,bon[i]?"ligne affichée oubliée":"ligne cochée à tort","Où ça part : une ligne.",`grep ${bon[i]?"affiche aussi":"n'affiche pas"} ${cr(L[i].s)}${L[i].pq?" : "+L[i].pq:""}.`);}
  const E=[{w:`Lis l'expression morceau par morceau :<br>${lecture(re).map(o=>`${cr(o.bout)} : ${o.sens}`).join("<br>")}`,why:deb&&fin?`Avec ${cr("^")} et ${cr("$")}, c'est la ligne entière qui doit avoir cette forme.`:deb?`Avec ${cr("^")} seul, la ligne doit commencer par cette forme ; la suite est libre.`:fin?`Avec ${cr("$")} seul, la ligne doit finir par cette forme ; le début est libre.`:`Il n'y a ni ${cr("^")} ni ${cr("$")} : il suffit qu'un morceau de la ligne, n'importe où, ait cette forme.`,pts:1},
    {w:`Ligne par ligne :<br>${L.map(x=>`${cr(x.s)} : ${x.veut?"affichée":"pas affichée"}${x.pq?` (${x.pq})`:""}`).join("<br>")}`,why:"grep affiche une ligne dès qu'il y trouve un morceau qui correspond à l'expression, et il l'affiche en entier.",pts:1},
    {w:`<b>grep affiche ${N>1?"ces lignes":"cette ligne"}&nbsp;: ${bonnes.map(cr).join(", ")}</b>`,why:`${N} ligne${N>1?"s":""} sur 6.`,pts:1}];
  return {sig:"R0"+re+"|"+L.map(x=>x.s).sort().join("|"),q:`Le fichier ${cr("lignes.txt")} contient les six lignes proposées plus bas. Coche celles qu'affiche cette commande.`,corps:blocr(cmd),texte:cmd+" — lignes : "+L.map(x=>x.s).join(" | "),
    champs:[{k:"multi",id:"g",o:L.map((x,i)=>[String(i),cr(x.s)])}],juge,etapes:E,bonne:bonnes.map(cr).join(", "),bonneTxt:bonnes.join(" | "),repBonne:{g:ids},repFausse:{g:bon[0]?(ids.length>1?ids.slice(1):[ids[0],String(bon.indexOf(false))]):["0",...ids]},nature:"lire",
    ens:{bash:[{arbo:arboDe([{n:"lignes.txt",c:T.map(x=>x.s).join("\n")+"\n"}]),cmd,abs:T.filter(x=>x.veut).map(x=>x.s).sort(),brut:true}],lignes:L.map(x=>x.s)}};}

/* les énoncés : q finit la phrase « … qui vérifie qu'une chaîne de caractères », F est la forme */
const un=k=>CLS[k][2],des=k=>CLS[k][3],suite=(...M)=>({deb:1,fin:1,M}),E1=[],E2=[],E3=[];
const EXT=[["py","sh"],["c","h"],["jpg","jpeg","\\.jpe?g$",[["photo.jpeeg","il y a un e en trop"]],"examen de janvier 2026"],["jpg","png"],["txt","md"],["htm","html","\\.html?$",[["page.htmll","il y a un l en trop"]]],["csv","txt"],["log","txt"]];
const ext=([a,b,autre,plus,src])=>({F:{fin:1,M:[Lit("."),Alt([a,b])],plus},note:autre?`Autre écriture, plus courte : ${cr(autre)}.`:"",src:src||""});
const FICH=[["tp",".py"],["photo",".jpg"],["log",".txt"],["td",".c"]];
for(const k of ["ch","mi","ma","le"])E1.push({fam:"que",q:`ne contient que des ${des(k)} (au moins ${un(k)})`,F:suite(Cl(k,1,99)),src:k==="ch"?"examen de janvier 2022":""});
for(const k of ["ch","mi","ma"]){
  E1.push({fam:"commence",q:`commence par ${un(k)}`,F:{deb:1,M:[Cl(k)]}},{fam:"finit",q:`se termine par ${un(k)}`,F:{fin:1,M:[Cl(k)]}},{fam:"contient",q:`contient au moins ${un(k)}`,F:{M:[Cl(k)]}});
  for(const n of [2,3,4,5,6])E1.push({fam:"exact",q:`est faite d'exactement ${n} ${des(k)}, et de rien d'autre`,F:suite(Cl(k,n))});}
for(const s of ["tp","2023","log","#","old","IMG"])E1.push({fam:"commenceL",q:`commence par ${cr(s)}`,F:{deb:1,M:[Lit(s)]}});
for(const s of [".py",".txt",".log",".c",".sh",".csv",".jpg","#"])E1.push({fam:"finitL",q:`se termine par ${cr(s)}`,F:{fin:1,M:[Lit(s)]}});
for(const s of [".","+","DATA"])E1.push({fam:"contientL",q:`contient ${s.length>1?cr(s):NOMCAR[s]+" ("+cr(s)+")"}`,F:{M:[Lit(s)]}});
for(const [x,plus] of [[".",[["tp1.py","il y a un point"],["a.b.c","il y a des points"]]],["0-9",[["tp3","il y a un chiffre"],["2024","ce sont des chiffres"]]],["A-Z",[["Notes","N est une majuscule"],["tpA","A est une majuscule"]]],[" ",[["a b","il y a un espace"],["deux mots","il y a un espace"]]]])
  E1.push({fam:"aucun",q:`ne contient ${NEG[x][0].replace(/^une /,"aucune ").replace(/^un /,"aucun ")}`,F:{deb:1,fin:1,vide:0,M:[Sauf(x)],plus}});

for(const [s,nom] of [[".","un point"],[",","une virgule"],["-","un tiret"],["/","une barre oblique"],[":","un deux-points"]])E2.push({fam:"deuxEntiers",q:`ne contient que deux nombres entiers séparés par ${nom}`,F:suite(Nb(),Lit(s),Nb()),src:s==="."?"examen de janvier 2025":""});
E2.push({fam:"nEntiers",q:"ne contient que trois nombres entiers séparés par des points",F:suite(Nb(),Lit("."),Nb(),Lit("."),Nb())},{fam:"nEntiers",q:"ne contient que quatre nombres entiers séparés par des points",F:suite(Nb(),Lit("."),Nb(),Lit("."),Nb(),Lit("."),Nb())});
for(const [s,nom] of [[".","point"],["-","tiret"],["/","barre oblique"],[":","deux-points"]])[1,2,3].forEach(n=>{const M=[Sauf(s)],fois=["une","deux","trois"][n-1];for(let j=0;j<n;j++)M.push(Lit(s),Sauf(s));
  E2.push({fam:"exactCar",q:`contient ${fois} fois (et seulement ${fois} fois) le caractère ${nom} (${cr(s)})`,src:n===2&&s==="."?"examen de janvier 2024":"",
    F:{deb:1,fin:1,M,astuce:`Pour « seulement ${fois} fois », le reste de la chaîne ne doit contenir aucun ${nom} : ${cr("[^"+s+"]*")}, et pas ${cr(".*")}.`}});});
for(const a of ["ch","mi","ma"])for(const b of ["ch","mi","ma"])E2.push({fam:"debFin",q:`commence par ${un(a)} et se termine par ${un(b)}`,F:{deb:1,fin:1,M:[Cl(a),Cl("to",0,99),Cl(b)],sans:a===b?s=>s.length===1:null},src:a==="ch"&&b==="ch"?"examen de janvier 2023":"",
  note:a===b?`Avec un seul caractère, cette expression répond non, comme celle du corrigé de l'examen ; pour l'accepter aussi : ${cr(`^${CLS[a][0]}(.*${CLS[a][0]})?$`)}.`:""});
for(const [f,s,L] of [["jj/mm/aaaa","/",[2,2,4]],["jj-mm-aaaa","-",[2,2,4]],["aaaa-mm-jj","-",[4,2,2]]])E2.push({fam:"date",q:`est une date de la forme ${cr(f)} : ${L.map(n=>(n===2?"deux":"quatre")+" chiffres").join(", "+NOMCAR[s]+", ")} (on ne vérifie pas que le jour et le mois existent)`,F:suite(Nb(L[0],L[0]),Lit(s),Nb(L[1],L[1]),Lit(s),Nb(L[2],L[2]))});
E2.push({fam:"heure",q:`est une heure de la forme ${cr("hh:mm")} : deux chiffres, un deux-points, deux chiffres`,F:suite(Nb(2,2),Lit(":"),Nb(2,2))},{fam:"heure",q:`est une heure de la forme ${cr("hh:mm:ss")} : trois fois deux chiffres, séparés par des deux-points`,F:suite(Nb(2,2),Lit(":"),Nb(2,2),Lit(":"),Nb(2,2))});
for(const [d,p] of [["0","1612345678"],["06","0712345678"],["07","0612345678"]])E2.push({fam:"numero",q:`est un numéro de téléphone : dix chiffres en tout, et il commence par ${cr(d)}`,F:{deb:1,fin:1,M:[Lit(d),Nb(10-d.length,10-d.length)],plus:[[p,`il ne commence pas par ${cr(d)}`]]}});
for(const x of EXT)E2.push(Object.assign({fam:"ext2",q:`se termine par ${cr("."+x[0])} ou par ${cr("."+x[1])}`},ext(x)));
E2.push({fam:"relatif",q:`est un nombre entier, avec ou sans signe moins devant (comme ${cr("-12")} ou ${cr("7")})`,F:suite(Lit("-",0),Nb())});
for(const [s,nom] of [[",","une virgule"],[".","un point"]])E2.push({fam:"decimal",q:`est un nombre : des chiffres, puis, si on veut, ${nom} et d'autres chiffres (comme ${cr("12")} ou ${cr("12"+s+"5")})`,
  F:{deb:1,fin:1,M:[Nb(),Grp([Lit(s),Nb()])],plus:[["12"+s,`il n'y a rien après ${nom}`],[s+"5",`il n'y a rien avant ${nom}`],["12x5",`${cr("x")} remplace ${nom}`],["1"+s+"2"+s+"3",`il y a deux fois ${nom}`]]}});
[["commence par une lettre, et n'a ensuite que des lettres ou des chiffres (ou plus rien)",suite(Cl("le"),Cl("an",0,99))],
 [`est faite d'une lettre majuscule suivie de lettres minuscules (au moins une), comme ${cr("Paul")}`,suite(Cl("ma"),Cl("mi",1,99))],
 [`est faite de lettres minuscules (au moins une) suivies de chiffres (au moins un), comme ${cr("tp12")}`,suite(Cl("mi",1,99),Nb())],
 [`est faite de lettres majuscules (au moins une) suivies de chiffres (au moins un), comme ${cr("AB12")}`,suite(Cl("ma",1,99),Nb())],
 [`est faite de chiffres (au moins un) suivis de lettres minuscules (au moins une), comme ${cr("12ab")}`,suite(Nb(),Cl("mi",1,99))],
 [`est une plaque de la forme ${cr("AB-123-CD")} : deux lettres majuscules, un tiret, trois chiffres, un tiret, deux lettres majuscules`,suite(Cl("ma",2),Lit("-"),Nb(3,3),Lit("-"),Cl("ma",2))]
].forEach(([q,F])=>E2.push({fam:"suite",q,F}));
for(const [a,b] of [["ma","ch"],["mi","ch"],["ch","ma"]])for(const [n,m] of [[2,3],[1,4],[3,2]]){const F=suite(Cl(a,n),Cl(b,m));E2.push({fam:"code",q:`est faite de : ${nomM(F.M[0])}, puis ${nomM(F.M[1])}, et rien d'autre`,F});}
for(const [a,b] of FICH){const F=suite(Lit(a),Nb(),Lit(b));E2.push({fam:"fichier",q:`est un nom de fichier fait de : ${nomM(F.M[0])}, puis un chiffre ou plus, puis ${nomM(F.M[2])} (comme ${cr(a+"12"+b)})`,F});}
for(const [k,a,b] of [["ch",2,4],["mi",3,8],["ma",2,3],["ch",1,3],["ch",3,99],["mi",2,99]])E2.push({fam:"bornes",q:`est faite ${b===99?"d'au moins "+a:"de "+a+" à "+b} ${des(k)}, et de rien d'autre`,F:suite(Cl(k,a,b))});

/* palier 4 : ls donne les noms du dossier courant (ls:1), ou grep lit un fichier ; q finit « … qui » ou « … du fichier X » */
for(const x of EXT)E3.push(Object.assign({fam:"ext2",ls:1,q:`se terminent par ${cr("."+x[0])} ou par ${cr("."+x[1])}`},ext(x)));
for(const s of [".py",".txt",".log",".c",".sh",".csv"])E3.push({fam:"finitL",ls:1,q:`se terminent par ${cr(s)}`,F:{fin:1,M:[Lit(s)]}});
for(const s of ["tp","2023","log","old","IMG"])E3.push({fam:"commenceL",ls:1,q:`commencent par ${cr(s)}`,F:{deb:1,M:[Lit(s)]}});
const NOMS=["notes.txt","tp1.py","Rapport.pdf","README","2024.txt","1er-essai.c","photo2","tp1","Makefile","data.CSV","IMG_2023","main.c","resultats","td3"];
for(const k of ["ch","ma","mi"])E3.push({fam:"commence",ls:1,q:`commencent par ${un(k)}`,F:{deb:1,M:[Cl(k)],plus:NOMS}},{fam:"finit",ls:1,q:`se terminent par ${un(k)}`,F:{fin:1,M:[Cl(k)],plus:NOMS}});
E3.push({fam:"contient",ls:1,q:"contiennent au moins un chiffre",F:{M:[Cl("ch")],plus:NOMS}},{fam:"que",ls:1,q:"ne sont faits que de lettres minuscules",F:{deb:1,fin:1,M:[Cl("mi",1,99)],plus:NOMS}},{fam:"que",ls:1,q:"ne sont faits que de chiffres",F:{deb:1,fin:1,M:[Nb()],plus:[...NOMS,"2024","42"]}});
for(const [a,b] of FICH)E3.push({fam:"fichier",ls:1,q:`sont faits de : ${nomM(Lit(a))}, puis un chiffre ou plus, puis ${nomM(Lit(b))} (comme ${cr(a+"12"+b)})`,F:suite(Lit(a),Nb(),Lit(b))});
E3.push(
 {fam:"ip",q:"dans lesquelles apparaît au moins une adresse IP (à peu près : quatre nombres entiers séparés par des points)",src:"examen de juin 2025",F:{M:[Nb(),Lit("."),Nb(),Lit("."),Nb(),Lit("."),Nb()],
   plus:["connexion depuis 192.168.1.20","ping 8.8.8.8 ok","serveur 10.0.0.1 en panne",["version 2.4.1 du logiciel","il n'y a que trois nombres"],["ticket 1234567 ouvert","il n'y a aucun point"],["prix : 12.50 euros","il n'y a que deux nombres"],["a.b.c.d","ce ne sont pas des nombres"]]}},
 {fam:"dateDans",q:`qui contiennent une date de la forme ${cr("jj/mm/aaaa")} (deux chiffres, une barre oblique, deux chiffres, une barre oblique, quatre chiffres)`,F:{M:[Nb(2,2),Lit("/"),Nb(2,2),Lit("/"),Nb(4,4)],
   plus:["rendu le 12/03/2024","note du 05/11/2026 : 14",["rendu le 12-03-2024","des tirets remplacent les barres obliques"],["le 5/11/2026","le jour n'a qu'un chiffre"],["page 12/03","il manque l'année"]]}},
 {fam:"heureDans",q:`qui contiennent une heure de la forme ${cr("hh:mm")} (deux chiffres, un deux-points, deux chiffres)`,F:{M:[Nb(2,2),Lit(":"),Nb(2,2)],plus:["debut 08:30","fin : 17:45 salle 3",["8h30","il n'y a pas de deux-points"],["score 3:2","il n'y a qu'un chiffre de chaque côté"]]}},
 {fam:"virgule",q:"qui contiennent un nombre à virgule (des chiffres, une virgule, des chiffres)",F:{M:[Nb(),Lit(","),Nb()],plus:["moyenne : 12,5","total 3,14 m",["1, 2 et 3","il y a un espace après la virgule"],["12.5","c'est un point, pas une virgule"]]}},
 {fam:"que",q:"qui ne contiennent que des chiffres (au moins un)",F:suite(Nb())},
 {fam:"commence",q:"qui commencent par un chiffre",F:{deb:1,M:[Cl("ch")],plus:["3 pommes","12 mars",["le 12 mars","le chiffre n'est pas au début"]]}},
 {fam:"commence",q:"qui commencent par une lettre majuscule",F:{deb:1,M:[Cl("ma")],plus:["Bonjour","ERREUR 12",["bonjour Paul","la majuscule n'est pas au début"]]}},
 {fam:"finit",q:"qui se terminent par un point",F:{fin:1,M:[Lit(".")],plus:["Fin du test.",["Fin du test. ok","le point n'est pas à la fin"]]}},
 {fam:"finit",q:"qui se terminent par un chiffre",F:{fin:1,M:[Cl("ch")],plus:["total : 42",["42 points","le chiffre n'est pas à la fin"]]}},
 {fam:"deuxEntiers",q:"qui sont faites de deux nombres entiers séparés par un point, et de rien d'autre",F:suite(Nb(),Lit("."),Nb())},
 {fam:"commenceL",q:`qui commencent par ${cr("ERREUR")}`,F:{deb:1,M:[Lit("ERREUR")],plus:["ERREUR disque plein",["aucune ERREUR ici","ERREUR n'est pas au début"],["erreur 12","c'est écrit en minuscules"]]}},
 {fam:"aucun",q:"qui ne contiennent aucun chiffre",F:{deb:1,fin:1,vide:0,M:[Sauf("0-9")],plus:["rien a signaler",["erreur 12","il y a un chiffre"]]}},
 {fam:"deuxChiffres",q:"qui contiennent au moins deux chiffres à la suite",F:{M:[Cl("ch",2)],plus:["salle 12","en 2024",["a1b2","les deux chiffres ne se suivent pas"],["1 2 3","les chiffres sont séparés par des espaces"]]}});

const SYM=[["^","^"],["＄","$"],["[0-9]","[0-9]"],["[a-z]","[a-z]"],["[A-Z]","[A-Z]"],["[^","[^"],["]","]"],["\\.","\\."],["+","+"],["*","*"],["{","{"],["}","}"]];
function ancres(F,B,s){const tr=B.find(x=>!x.ok&&/en trop au début|en trop à la fin/.test(x.pq)),lg=filtre(ecrit(F),"E",{x:1});
  return F.deb&&F.fin?[`Toute la chaîne doit avoir cette forme : ${cr("^")} au début et ${cr("$")} à la fin.`,`Sans eux, il suffirait qu'un morceau de la chaîne ait cette forme${tr?` : ${cr(tr.s)} passerait`:""}.`]
    :F.deb?[`Seul le début est imposé : ${cr("^")} au début, et pas de ${cr("$")}.`,`${cr("^")} colle l'expression au début de la chaîne ; ce qui suit est libre.`]
    :F.fin?[`Seule la fin est imposée : ${cr("$")} à la fin, et pas de ${cr("^")}.`,`${cr("$")} colle l'expression à la fin de la chaîne ; ce qui précède est libre.`]
    :[`La forme peut être n'importe où dans la chaîne : ni ${cr("^")} ni ${cr("$")}.`,`Avec ${cr("^")} et ${cr("$")}, la chaîne entière devrait avoir cette forme${lg.f("ab"+s+"yz")?"":`, et ${cr("ab"+s+"yz")} serait refusée`}.`];}
const fausses=(F,ref)=>[F.fin&&ref.slice(0,-1),F.deb&&ref.slice(1),ref.replace(/\\\./g,"."),ref.replace(/([\])])\+/g,"$1*"),F.deb&&F.fin?null:"^"+ref.replace(/^\^|\$$/g,"")+"$",ref.replace(/\[0-9\]/g,"[a-z]"),".*"].filter(x=>x&&x!==ref);
function exoExpr(R,p){const X=R.choix(p===1?E1:E2),F=X.F,ref=ecrit(F),B=banque(F),juge=rep=>jugeExpr(rep.e,B,F);
  const q=`Donne l'expression régulière qui vérifie qu'une chaîne de caractères ${X.q}.`,ex=fab(F,R,{plein:1}),s=(F.deb?"":"ab")+ex.s+(F.fin?"":"yz"),an=ancres(F,B,ex.s);
  const oui=B.filter(x=>x.ok&&x.s),non=B.filter(x=>!x.ok&&x.s&&x.pq),parts=ex.parts.filter(Boolean);
  const E=[{w:`Un exemple qui doit passer : ${cr(s)}.${parts.length>1?` Découpe-le en morceaux : ${parts.map(cr).join(" · ")}.`:s!==ex.s?` Le morceau qui compte : ${cr(ex.s)}.`:""}`,why:"C'est la méthode du cours : chaque morceau de l'exemple va devenir un bout de l'expression.",pts:1},
    {w:`Un bout d'expression par morceau :<br>${F.M.map((m,k)=>`${ex.parts[k]?cr(ex.parts[k])+" : ":""}${nomM(m)} → ${cr(ecritM(m))}`).join("<br>")}`,why:"Les signes : "+pourquoi(F.M),pts:1.5},
    {w:an[0],why:an[1],pts:1},
    {w:`L'expression : <b>${cr(ref)}</b>`,why:`Elle accepte ${oui.slice(0,2).map(x=>cr(x.s)).join(" et ")}.${non.length?` Elle refuse ${non.slice(0,3).map(x=>`${cr(x.s)} (${x.pq})`).join(", ")}.`:""}${/\[0-9\]/.test(ref)?` Dans un corrigé, ${cr("[0-9]")} s'écrit aussi ${cr("\\d")} ; dans une commande grep, garde ${cr("[0-9]")}.`:""}${X.note?" "+X.note:""}${X.src?` C'est la question de l'${X.src}.`:""}`,pts:0.5}];
  const cand=fausses(F,ref),fausse=cand.find(x=>juge({e:x}).ok===false);if(!fausse)return null;
  const A=arboDe([{n:"lignes.txt",c:B.map(x=>x.s).join("\n")+"\n"}]),garde=(re,m)=>{const r=filtre(re,m);return r.f?B.map(x=>x.s).filter(r.f).sort():null;};
  return {sig:"R"+p+q,q,corps:"",texte:brut(q),champs:[{k:"champ",id:"e",nom:"expression",label:"L'expression régulière :",ex:"par exemple ^[a-z]+",apercu:false,sym:p===1?SYM:SYM.concat([["?","?"],["(","("],["|","|"],[")",")"]])}],juge,etapes:E,
    bonne:cr(ref),bonneTxt:ref,repBonne:{e:ref},repFausse:{e:fausse},nature:X.fam,
    ens:{F,B,bash:[["E",ref],["G",ref],["P",ref.replace(/\[0-9\]/g,"\\d")],...cand.slice(0,5).map(x=>["E",x])].map(([m,re])=>({arbo:A,cmd:`grep ${m==="G"?"":"-"+m+" "}-e '${re}' lignes.txt`,abs:garde(re,m),brut:true})).filter(x=>x.abs)}};}
function exoCmd(R){const X=R.choix(E3),F=X.F,ref=ecrit(F),ls=!!X.ls,nom=ls?"":R.choix(["log.txt","notes.txt","mesures.txt","journal.log"]);
  const B=ls?banque(F).filter(x=>x.s&&!/[\/ ]/.test(x.s)&&!/^[.-]/.test(x.s)):banque(F),ved=new Set((F.plus||[]).map(x=>Array.isArray(x)?x[0]:x)),devant=L=>L.filter(x=>ved.has(x.s)).concat(L.filter(x=>!ved.has(x.s)));
  const bon=devant(B.filter(x=>x.ok)).map(x=>x.s),non=devant(B.filter(x=>!x.ok&&x.s));if(bon.length<2||non.length<3)return null;
  const T=arboDe(ls?B.map(x=>fichier(x.s)):[{n:nom,c:B.map(x=>x.s).join("\n")+"\n"},{n:"README",c:"projet\n"}]),cmd=ls?`ls | grep -E "${ref}"`:`grep -E "${ref}" ${nom}`,juge=rep=>jugeCmd(rep.c,T,B,{ls,nom,F});
  const q=ls?`Donne une commande qui, en utilisant une expression régulière, affiche les noms des fichiers du dossier courant qui ${X.q}.`:`Donne la commande qui affiche les lignes du fichier ${cr(nom)} ${X.q}.`,an=ancres(F,B,fab(F,R,{plein:1}).s);
  const E=[{w:ls?`D'où viennent les lignes : ${cr("ls")} donne les noms du dossier courant, et le tube ${cr("|")} les envoie à grep.`:`D'où viennent les lignes : grep lit le fichier, dont on écrit le nom à la fin : ${cr("grep … "+nom)}.`,why:ls?"Quand sa sortie part dans un tube, ls écrit un nom par ligne. grep garde les lignes où il trouve l'expression.":`${cr("cat "+nom+" | grep …")} marche aussi : grep lit alors ce qui arrive par le tube.`,pts:1},
    {w:`L'expression : ${cr(ref)}<br>${F.M.map(m=>`${nomM(m)} → ${cr(ecritM(m))}`).join("<br>")}`,why:`${an[0]} Les signes : ${pourquoi(F.M)}`,pts:1.5},
    {w:`L'option ${cr("-E")} et les guillemets : ${cr(`grep -E "${ref}"`)}`,why:`Sans ${cr("-E")}, grep prend + ? | ( … ) { … } pour des caractères ordinaires. Les guillemets empêchent bash de toucher à l'expression : sans eux, il enlève les barres obliques inverses et peut remplacer * ou ? par des noms de fichiers. Dans une commande grep, écris ${cr("[0-9]")} : grep -E ne connaît pas ${cr("\\d")}.`,pts:1},
    {w:`La commande : <b>${cr(cmd)}</b>`,why:`Sur ${ls?"le dossier":"le fichier"} d'essai, elle affiche ${bon.slice(0,3).map(cr).join(", ")}${bon.length>3?"…":""} ; elle n'affiche pas ${non.slice(0,3).map(x=>cr(x.s)+(x.pq?` (${x.pq})`:"")).join(", ")}.${X.src?` C'est la question de l'${X.src}.`:""}${X.note?" "+X.note:""}`,pts:0.5}];
  const avec=re=>cmd.replace(`"${ref}"`,()=>`"${re}"`),cand=[cmd.replace("grep -E","grep"),...fausses(F,ref).map(avec)],fausse=cand.find(x=>juge({c:x}).ok===false);if(!fausse)return null;
  const essais=[cmd,cmd.replace(/"/g,"'"),cmd.replace("grep -E","egrep"),cmd.replace("grep -E","grep"),ls?null:`cat ${nom} | grep -E "${ref}"`,/[{(|]/.test(ref)?null:cmd.replace(/"/g,""),avec(ref.replace(/\[0-9\]/g,"\\d")),...cand.slice(1,4)].filter(Boolean);
  return {sig:"R3"+q,q,corps:"",texte:brut(q),champs:[{k:"champ",id:"c",nom:"commande",label:"La commande :",ex:"… grep …",apercu:false,sym:[["ls","ls "],["|","| "],["grep -E","grep -E "],['"','"'],["^","^"],["＄","$"],["[0-9]","[0-9]"],["[a-z]","[a-z]"],["\\.","\\."],["+","+"],["?","?"],["(","("],[")",")"],["{","{"],["}","}"]]}],juge,etapes:E,
    bonne:cr(cmd),bonneTxt:cmd,repBonne:{c:cmd},repFausse:{c:fausse},nature:X.fam,
    ens:{F,B,bash:[...new Set(essais)].map(x=>{const P=planGrep(x,T),J=P.greps?joue(P):P;return J.sortie?{arbo:T,cmd:x,abs:J.sortie.slice().sort(),brut:true}:null;}).filter(Boolean)}};}
const tireRe=k=>R=>{for(;;){const e=k===0?exoLire(R):k===3?exoCmd(R):exoExpr(R,k);if(e)return e;}};

/* ---------- US4 : tubes et filtres. Un petit shell joue la commande tapée sur trois fichiers de la même forme ---------- */
const ORD=n=>n===1?"1er":n+"e",Maj=s=>s[0].toUpperCase()+s.slice(1),VARB=/^\$(?:\{([A-Za-z_]\w*)\}|([A-Za-z_]\w*))/;
function coupe(l){const S=[];let cur="",q=null;
  for(let i=0;i<l.length;i++){const x=l[i],d=l[i+1]||"";
    if(q){cur+=x;if(x==="\\"&&q==='"'&&d){cur+=d;i++;}else if(x===q)q=null;}
    else if(x==='"'||x==="'"){q=x;cur+=x;}
    else if(x==="\\"&&d){cur+=x+d;i++;}
    else if(x==="|"){if(d==="|")return {err:"|| n'est pas un tube : il en faut un seul."};S.push(cur.trim());cur="";}
    else if(x===">")return {inconnu:"Le résultat doit s'afficher à l'écran : n'écris pas de redirection avec >."};
    else if(";&`".includes(x)||(x==="$"&&d==="("))return {inconnu:`Écris une seule ligne de commandes reliées par des tubes, sans ${x}.`};
    else cur+=x;}
  if(q)return {err:`Un guillemet ${q} n'est pas refermé.`};S.push(cur.trim());return {S};}
/* les mots d'un morceau, comme bash les donne à la commande : guillemets, \, $variable, ~, motifs * ? et < fichier */
function motsT(seg,T,V){const W=[],n=seg.length,SEP="\u0001",val=x=>x==="HOME"?ACCUEIL:V&&V[x]!==undefined?V[x]:null;let i=0,lit=null,red=false;
  while(i<n){if(seg[i]===" "){i++;continue;}
    if(seg[i]==="<"){if(seg[i+1]==="<")return {inconnu:"Le site ne connaît pas << : envoie les lignes par un tube."};red=true;i++;continue;}
    let w="",libre="";
    while(i<n&&seg[i]!==" "&&seg[i]!=="<"){const ch=seg[i],m=ch==="$"&&VARB.exec(seg.slice(i));
      if(ch==="'"){const j=seg.indexOf("'",i+1);if(j<0)return {err:"Un guillemet ' n'est pas refermé."};w+=seg.slice(i+1,j);libre+="_";i=j+1;}
      else if(ch==='"'){let j=i+1;for(;j<n&&seg[j]!=='"';j++){const mv=seg[j]==="$"&&VARB.exec(seg.slice(j));
          if(seg[j]==="\\"&&j+1<n&&'\\"$`'.includes(seg[j+1]))w+=seg[++j];
          else if(mv){const v=val(mv[1]||mv[2]);if(v===null)return {inconnu:`La variable ${mv[0]} n'existe pas ici.`};w+=v;j+=mv[0].length-1;}
          else w+=seg[j];}
        if(j>=n)return {err:'Un guillemet " n\'est pas refermé.'};libre+="_";i=j+1;}
      else if(ch==="\\"&&i+1<n){w+=seg[i+1];libre+="_";i+=2;}
      else if(ch==="~"&&!libre&&(i+1===n||" /".includes(seg[i+1]))){w+=ACCUEIL;libre+="_";i++;}
      else if(m){const v=val(m[1]||m[2]);if(v===null)return {inconnu:`La variable ${m[0]} n'existe pas ici.`};w+=v.trim().replace(/ +/g,SEP);libre+="_";i+=m[0].length;}
      else{w+=ch;libre+=ch;i++;}}
    const L=w.split(SEP);
    if(red){lit=L[0];red=false;continue;}
    if(L.length===1&&/[*?[]/.test(libre)&&!w.includes("/")){let C=[];try{const re=motifRe(w);C=(noeud(T,COURANT).d||[]).map(x=>x.n).filter(x=>x[0]!=="."&&re.test(x)).sort();}catch(e){}
      if(C.length){W.push(...C);continue;}}
    W.push(...L);}
  return red?{err:"Après <, il faut le nom d'un fichier."}:{W,lit};}
function getopt(A,val,drap,num){const o={},F=[];
  for(let i=0;i<A.length;i++){const w=A[i];
    if(num&&/^-\d+$/.test(w)){(o.n=o.n||[]).push(w.slice(1));continue;}
    if(w.length<2||w[0]!=="-"){F.push(w);continue;}
    for(let j=1;j<w.length;j++){const x=w[j];
      if(val.includes(x)){const v=w.slice(j+1)||A[++i];if(v===undefined)return {bad:x,manque:1};(o[x]=o[x]||[]).push(v);break;}
      if(!drap.includes(x))return {bad:x};o[x]=1;}}
  return {o,F};}
const opt=(nom,A,val,drap,num)=>{const g=getopt(A,val,drap,num);return !g.bad?g:g.manque?{err:`${nom} : il manque la valeur après -${g.bad}.`}:{inconnu:`Le site ne connaît pas l'option -${g.bad} de ${nom}.`};};
const lisF=(T,f,nom)=>{const x=noeud(T,absolu(f));return !x?{err:`${nom} : ${f} : aucun fichier de ce nom.`}:x.d?{err:`${nom} : ${f} est un dossier, pas un fichier.`}:{L:contenu(x)};};
const entree=(T,F,E,nom,un)=>{if(un&&F.length>1)return {inconnu:`Donne un seul fichier à ${nom}.`};
  if(!F.length)return E?{L:E}:{err:`${nom} n'a rien à lire : donne-lui un fichier, ou envoie-lui des lignes par un tube.`};
  const L=[];for(const f of F){const r=lisF(T,f,nom);if(!r.L)return r;L.push(...r.L);}return {L};};
const ensTr=s=>{let o="";for(let i=0;i<s.length;i++){const m=/^\[:(lower|upper|digit):\]/.exec(s.slice(i));
    if(m){o+={lower:"abcdefghijklmnopqrstuvwxyz",upper:"ABCDEFGHIJKLMNOPQRSTUVWXYZ",digit:"0123456789"}[m[1]];i+=m[0].length-1;}
    else if(s[i]==="\\"&&i+1<s.length){o+={n:"\n",t:"\t"}[s[i+1]]||s[i+1];i++;}
    else if(s[i+1]==="-"&&i+2<s.length&&s[i]<=s[i+2]){for(let k=s.charCodeAt(i);k<=s.charCodeAt(i+2);k++)o+=String.fromCharCode(k);i+=2;}
    else o+=s[i];}
  return o;};
/* chaque commande : (mots, lignes reçues par le tube ou null, arborescence, nom) → {L: lignes écrites}, {err} ou {inconnu} */
const SHT={
  cat:(A,E,T)=>{const g=opt("cat",A,"","");return g.o?entree(T,g.F,E,"cat"):g;},
  echo:A=>/^-[neE]+$/.test(A[0]||"")?{inconnu:"Écris echo sans option."}:{L:[A.join(" ")]},
  ls:(A,E,T)=>{if(A.some(w=>/^-\w*[lR]/.test(w)))return {inconnu:"Ici, écris ls sans -l ni -R : il donne alors un nom par ligne au tube."};
    const g=opt("ls",A,"","1aAr");if(!g.o)return g;const o=g.o,d=g.F.length<2&&noeud(T,absolu(g.F[0]||"."));let L;
    if(d&&d.d){L=tri(d.d).map(x=>x.n).filter(x=>o.a||o.A||x[0]!==".");if(o.a)L=[".","..",...L];}
    else{for(const f of g.F){const x=noeud(T,absolu(f));if(!x)return {err:`ls : ${f} : aucun fichier ou dossier de ce nom.`};if(x.d)return {inconnu:"Donne à ls un seul dossier, ou seulement des fichiers."};}L=g.F.slice().sort();}
    return {L:o.r?L.reverse():L};},
  grep:(A,E,T,nom)=>{let mode=nom==="egrep"?"E":"G",re=null,e=false;const o={},F=[];
    for(const w of A){
      if(/^-./.test(w)&&!e){for(const x of w.slice(1)){if("EPG".includes(x))mode=x;else if("ivxc".includes(x))o[x]=1;else if(x==="e")e=true;else return {inconnu:`Le site ne connaît pas l'option -${x} de grep.`};}}
      else if(re===null||e){re=w;e=false;}else F.push(w);}
    if(re===null)return {err:"grep : il manque le motif à chercher."};
    const r=entree(T,F,E,"grep",1);if(!r.L)return r;const f=filtre(re,mode,o);if(!f.f)return f;const L=r.L.filter(f.f);return {L:o.c?[String(L.length)]:L};},
  wc:(A,E,T)=>{const g=opt("wc",A,"","lwcm");if(!g.o)return g;const K=Object.keys(g.o);
    if(K.length!==1)return {inconnu:"Dis à wc quoi compter, avec une seule option : wc -l pour les lignes, wc -w pour les mots."};
    const r=entree(T,g.F,E,"wc",1);if(!r.L)return r;const L=r.L,n=K[0]==="l"?L.length:K[0]==="w"?L.join(" ").split(/\s+/).filter(Boolean).length:L.join("").length+L.length;
    return {L:[n+(g.F.length?" "+g.F[0]:"")]};},
  head:(A,E,T,nom)=>{const g=opt(nom,A,"n","",1);if(!g.o)return g;const r=entree(T,g.F,E,nom,1);if(!r.L)return r;
    const v=g.o.n?g.o.n[g.o.n.length-1]:"10",m=/^([+-]?)(\d+)$/.exec(v);if(!m)return {err:`${nom} : ${v} n'est pas un nombre de lignes.`};const k=+m[2],L=r.L;
    return {L:nom==="head"?(m[1]==="-"?L.slice(0,Math.max(0,L.length-k)):L.slice(0,k)):m[1]==="+"?L.slice(Math.max(0,k-1)):k?L.slice(-k):[]};},
  sort:(A,E,T)=>{const g=opt("sort",A,"tk","rnu");if(!g.o)return g;const o=g.o,r=entree(T,g.F,E,"sort");if(!r.L)return r;
    const t=o.t&&o.t[o.t.length-1];if(t!==undefined&&t.length!==1)return {err:"sort : après -t, il faut un seul caractère, le séparateur des champs."};
    let k=null;if(o.k){if(o.k.length>1)return {inconnu:"Le site ne connaît qu'une option -k à la fois."};const m=/^(\d+)([nr]*)(?:,(\d+)([nr]*))?$/.exec(o.k[0]);
      if(!m||m[1]==="0")return {err:`sort : -k ${o.k[0]} : il faut un numéro de champ, compté à partir de 1.`};k={a:+m[1],b:m[3]?+m[3]:1e9,l:m[2]+(m[4]||"")};}
    const cle=s=>!k?s:t!==undefined?s.split(t).slice(k.a-1,k.b).join(t):(s.match(/[ \t]*[^ \t]+/g)||[]).slice(k.a-1,k.b).join("");
    const num=s=>{const v=parseFloat(/^[ \t]*(-?\d*\.?\d*)/.exec(s)[1]);return isNaN(v)?0:v;},oct=(a,b)=>a<b?-1:a>b?1:0;
    const N=k&&k.l?k.l.includes("n"):!!o.n,Rv=k&&k.l?k.l.includes("r"):!!o.r,cmp=(a,b)=>{const x=cle(a),y=cle(b),c=N?Math.sign(num(x)-num(y)):oct(x,y);return Rv?-c:c;};
    let L=r.L.slice().sort((a,b)=>cmp(a,b)||(o.u?0:(o.r?-1:1)*oct(a,b)));if(o.u)L=L.filter((x,i)=>!i||cmp(L[i-1],x)!==0);return {L};},
  cut:(A,E,T)=>{const g=opt("cut",A,"dfc","s");if(!g.o)return g;const o=g.o,liste=o.f||o.c,d=o.d?o.d[o.d.length-1]:"\t",I=[];
    if(!liste||(o.f&&o.c))return {err:"cut : dis quoi garder, avec -f pour des champs ou -c pour des caractères."};
    if(d.length!==1)return {err:"cut : après -d, il faut un seul caractère, le séparateur des champs."};
    for(const x of liste[liste.length-1].split(",")){const m=/^(\d*)(-?)(\d*)$/.exec(x),a=m&&(m[1]?+m[1]:1),b=m&&(m[2]?(m[3]?+m[3]:1e9):+m[1]);
      if(!m||!(m[1]||m[3])||a<1||b<a)return {err:`cut : ${x} n'est pas un numéro de champ. Les champs se comptent à partir de 1.`};I.push([a,b]);}
    const veut=i=>I.some(([a,b])=>i>=a&&i<=b),r=entree(T,g.F,E,"cut");if(!r.L)return r;
    return {L:o.c?r.L.map(s=>[...s].filter((_,i)=>veut(i+1)).join("")):r.L.filter(s=>s.includes(d)||!o.s).map(s=>s.includes(d)?s.split(d).filter((_,i)=>veut(i+1)).join(d):s)};},
  tr:(A,E)=>{const g=opt("tr",A,"","d");if(!g.o)return g;const d=g.o.d;
    if(g.F.length!==(d?1:2))return {err:d?"tr -d attend une seule liste de caractères.":"tr attend deux listes de caractères, et pas de nom de fichier : il lit ce qui arrive par un tube."};
    if(!E)return {err:"tr n'a rien à lire : il ne prend pas de nom de fichier, envoie-lui les lignes par un tube."};
    const a=ensTr(g.F[0]),b=d?"":ensTr(g.F[1]);if(!a||(!d&&!b))return {err:"tr : une liste de caractères est vide."};
    const s=[...E.map(x=>x+"\n").join("")].map(ch=>{const i=a.lastIndexOf(ch);return i<0?ch:d?"":b[Math.min(i,b.length-1)];}).join("");
    return {L:s===""?[]:s.replace(/\n$/,"").split("\n")};},
  sed:(A,E,T)=>{const g=opt("sed",A,"e","n");if(!g.o)return g;const F=g.F.slice(),s=g.o.e?g.o.e[0]:F.shift();if(s===undefined)return {err:"sed : il manque la commande, par exemple s/a/b/."};
    const r=entree(T,F,E,"sed",1);if(!r.L)return r;const L=r.L,n=g.o.n;let m;
    if((m=/^s\/([^\/\\.*^$\[\]&]+)\/([^\/\\&]*)\/(g?)$/.exec(s)))return {L:n?[]:L.map(x=>m[3]?x.split(m[1]).join(m[2]):x.replace(m[1],()=>m[2]))};
    if((m=/^([1-9]\d*)(?:,([1-9]\d*))?([pdq])$/.exec(s))){const a=+m[1],b=m[2]?+m[2]:a,dans=(_,i)=>i+1>=a&&i+1<=b;
      if(m[3]==="p"&&n)return {L:L.filter(dans)};if(m[3]==="d"&&!n)return {L:L.filter((x,i)=>!dans(x,i))};if(m[3]==="q"&&!m[2]&&!n)return {L:L.slice(0,a)};}
    return {inconnu:"Le site ne connaît de sed que s/a/b/, s/a/b/g, -n 'Np' et 'Nd'."};},
  uniq:(A,E,T)=>{const g=opt("uniq",A,"","c");if(!g.o)return g;const r=entree(T,g.F,E,"uniq",1);if(!r.L)return r;const G2=[];
    for(const x of r.L){const d=G2[G2.length-1];if(d&&d[0]===x)d[1]++;else G2.push([x,1]);}return {L:G2.map(([x,k])=>g.o.c?String(k).padStart(7)+" "+x:x)};},
  tee:(A,E)=>E?{L:E}:{err:"tee n'a rien à lire : il se place après un tube."},
  more:(A,E)=>E&&!A.length?{L:E}:{inconnu:"Ici, place more à la fin du tube, sans option ni nom de fichier."},
  less:(A,E,T)=>entree(T,A.filter(x=>x[0]!=="-"),E,"less",1)};
SHT.tail=SHT.head;SHT.egrep=SHT.grep;
/* rend {sortie: lignes affichées, P: ce qui sort de chaque morceau}, ou {err}, ou {inconnu} */
function lanceTube(texte,T,V){const D=coupe(texte);if(!D.S)return D;let E=null;const P=[];
  for(const seg of D.S){if(!seg)return {err:"Il manque une commande d'un côté du tube."};
    const M=motsT(seg,T,V);if(!M.W)return M;const nom=M.W[0];if(nom===undefined)return {err:"Il manque le nom de la commande."};
    if(!Object.prototype.hasOwnProperty.call(SHT,nom))return {inconnu:`Ici, le site connaît ${et(Object.keys(SHT))}, pas ${nom}.`};
    if(M.lit!==null){const r=lisF(T,M.lit,nom);if(!r.L)return r;E=r.L;}
    const r=SHT[nom](M.W.slice(1),E,T,nom);if(!r.L)return r;E=r.L;P.push(E);}
  return {sortie:E,P};}
G.usi.lanceTube=lanceTube;

/* les fichiers d'essai : trois versions par famille, celle de l'énoncé et deux cachées */
const melH=(h,L)=>{L=L.slice();for(let i=L.length-1;i>0;i--){const j=h.ent(0,i);[L[i],L[j]]=[L[j],L[i]];}return L;};
const fic=(nom,L)=>({T:arboDe([{n:nom,c:L.join("\n")+"\n"}]),L});
const genre=g=>g==="f"?{la:"la",gd:"grande",pt:"petite",asc:"de la plus petite à la plus grande",dsc:"de la plus grande à la plus petite",prem:"premières"}:{la:"le",gd:"grand",pt:"petit",asc:"du plus petit au plus grand",dsc:"du plus grand au plus petit",prem:"premiers"};
/* toujours un 9, un autre chiffre et un nombre de 10 à 19 : l'ordre des caractères n'est jamais celui des nombres */
const nombres=(h,n,max)=>{for(;;){const S=new Set([9,h.ent(10,19),h.ent(3,8)]);while(S.size<n)S.add(h.ent(10,max));const L=melH(h,[...S]);if(L.some((x,i)=>i&&x<L[i-1])&&L.some((x,i)=>i&&x>L[i-1]))return L;}};
const FAM=[],TAILLES=[7,6,8],PETIT=[5,6,5],VILLES="paris lyon nice nantes lille rennes reims toulon grenoble dijon angers nimes brest tours amiens metz rouen caen nancy marseille bordeaux toulouse",PRENOMS="alice bruno chloe david emma farid gaelle hugo ines jules karim lea marc nina omar paul rose sami theo zoe louis manon";
[["notes.txt","une note sur 20 par ligne","note","f",20],["ages.txt","un âge par ligne","âge","m",89],["scores.txt","un score par ligne","score","m",150],["tailles.txt","une taille en centimètres par ligne","taille","f",180]]
  .forEach(([nom,desc,un,g,max],a)=>FAM.push(Object.assign({type:"nb",nom,desc,un,pl:un+"s",vers:TAILLES.map((n,v)=>fic(nom,nombres(hasard(101+10*a+v),n,max).map(String)))},genre(g))));
[["villes.txt","un nom de ville par ligne, en minuscules","ville","f",VILLES],["prenoms.txt","un prénom par ligne, en minuscules","prénom","m",PRENOMS],["fruits.txt","un nom de fruit par ligne, en minuscules","fruit","m","pomme poire banane kiwi mangue cerise fraise orange citron raisin prune peche melon figue datte abricot ananas"]]
  .forEach(([nom,desc,un,g,P],a)=>FAM.push(Object.assign({type:"mot",nom,desc,un,pl:un+"s",vers:TAILLES.map((n,v)=>{const h=hasard(201+10*a+v);for(;;){const L=melH(h,P.split(" ")).slice(0,n);if(L.join()!==L.slice().sort().join())return fic(nom,L);}})},genre(g))));
const PREN="Alice Bruno Chloe David Emma Farid Hugo Ines Jules Karim Lea Marc Nina Omar Paul Rose".split(" "),NOMF="Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Michel Garcia".split(" ");
["comptes.txt","utilisateurs.txt"].forEach((nom,a)=>FAM.push({type:"cpt",nom,desc:"une ligne par compte, avec quatre champs séparés par des deux-points : le nom de connexion, le numéro, le nom complet et le dossier d'accueil",vers:PETIT.map((n,v)=>{const h=hasard(301+10*a+v);
  for(;;){const P=melH(h,PREN),N=melH(h,NOMF),U=melH(h,[9,1000,...melH(h,[33,52,107,998,1001,1004,1012,1020]).slice(0,n-2)]),L=U.map((u,i)=>`${N[i].toLowerCase()}:${u}:${P[i]} ${N[i]}:/home/${N[i].toLowerCase()}`);
    const par=k=>L.slice().sort((x,y)=>x.split(":")[k]<y.split(":")[k]?-1:1).join();if(par(0)!==par(2)&&par(0)!==L.join()&&par(2)!==L.join())return fic(nom,L);}})}));
[["ventes.csv","une ligne par produit, avec trois champs séparés par des virgules : le nom du produit, la quantité vendue et le prix en euros","f",["le nom du produit","la quantité vendue","le prix"],"les noms des produits","le nom du produit le plus vendu, c'est-à-dire celui dont le 2e champ est le plus grand","la plus grande quantité vendue","stylo cahier gomme regle classeur trousse agenda crayon feutre colle compas ciseaux",null],
 ["joueurs.csv","une ligne par joueur, avec trois champs séparés par des virgules : le prénom, le score et la ville","m",["le prénom du joueur","le score","la ville"],"les prénoms des joueurs","le prénom du joueur qui a le plus grand score, le score étant le 2e champ","le plus grand score",PRENOMS,VILLES]]
  .forEach(([nom,desc,g,ch,pl1,top,max,P1,P3],a)=>FAM.push(Object.assign({type:"csv",nom,desc,ch,pl1,top,max,vers:PETIT.map((n,v)=>{const h=hasard(401+10*a+v);
    for(;;){const A=melH(h,P1.split(" ")),Q=nombres(h,n,150),L=Q.map((q,i)=>`${A[i]},${q},${P3?h.choix(P3.split(" ")):h.ent(1,9)}`),C=L.map(x=>x.split(",")[0]);if(C.join()!==C.slice().sort().join())return fic(nom,L);}})},genre(g))));
FAM.push({type:"ls",nom:null,vers:["calcul.py copy.c cours.txt liste.txt main.c notes.txt notes.txt.old tp1.py tp2.py util.cpp","bilan.txt copy.c essai.py jeu.c jeu.py lisez.txt lisez.txt.old memo.txt pile.c pile.cpp test.py","agenda.txt copy.c liste.c main.cpp tri.py tri.txt.old util.py zero.c"].map(s=>({T:arboDe(s.split(" ").map(x=>fichier(x))),L:s.split(" ").sort()}))});
FAM.push({type:"ll",nom:"liste.txt",desc:`le résultat de la commande ${c("ls -l")} : une ligne par fichier, et les lignes des répertoires commencent par la lettre d`,
  vers:[[["-",85,"12 10:02","data.csv"],["d",4096,"14 08:30","docs"],["-",730,"20 17:45","main.c"],["-",20480,"11 09:12","memo.pdf"],["-",1200,"25 14:03","notes.txt"],["d",4096,"18 16:20","photos"]],
    [["d",4096,"10 11:00","cours"],["-",12,"13 12:41","dates.csv"],["-",640,"22 18:05","devoir.txt"],["-",734003,"15 21:37","film.mp4"],["-",2210,"19 10:10","index.html"],["d",4096,"12 09:00","old"],["d",4096,"27 15:15","td"]],
    [["d",4096,"16 13:20","bin"],["d",4096,"21 10:44","media"],["-",16824,"21 10:50","prog"],["-",310,"11 08:08","readme"],["-",96,"26 19:30","todo.md"]]]
    .map(D=>{const w=Math.max(...D.map(e=>String(e[1]).length));return fic("liste.txt",D.map(e=>`${e[0]==="d"?"drwxr-xr-x 2":"-rw-r--r-- 1"} etu etu ${String(e[1]).padStart(w)} nov. ${e[2]} ${e[3]}`));})});
FAM.push({type:"ty",nom:"types.txt",desc:`le résultat de la commande ${c("file *")} : sur chaque ligne, un nom, puis un deux-points, puis le type du contenu`,
  vers:[["archive.tar: POSIX tar archive","main.c: C source, ASCII text","notes.txt: ASCII text","photo.jpg: JPEG image data","rapport.pdf: PDF document","tp: directory"],
    ["cours: directory","liste.txt: UTF-8 Unicode text","logo.png: PNG image data","old: directory","son.mp3: Audio file with ID3","tri.py: Python script, ASCII text executable"],
    ["a.out: ELF 64-bit LSB executable","data.csv: CSV text","docs: directory","image.gif: GIF image data","lisezmoi: ASCII text"]].map(L=>fic("types.txt",L))});
const ETATS=["ok","erreur","alerte"],MSG=["disque plein","sauvegarde","connexion alice","reseau coupe","mise a jour","imprimante","mot de passe","demarrage","memoire pleine","copie finie"];
["log.txt","journal.txt"].forEach((nom,a)=>FAM.push({type:"log",nom,desc:"une ligne par événement : l'heure, puis ok, alerte ou erreur, puis un message",vers:TAILLES.map((n,v)=>{const h=hasard(501+10*a+v);
  for(;;){let t=h.ent(480,600);const M=melH(h,MSG),L=M.slice(0,n).map(m=>{t+=h.ent(2,25);return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")} ${h.choix(ETATS)} ${m}`;});
    if(ETATS.every(e=>{const k=L.filter(x=>x.includes(" "+e+" ")).length;return k>=2&&k<=n-2;}))return fic(nom,L);}})}));
[["ligne","une ligne d'un fichier CSV",["Dupont,12,Montpellier","Martin,9,Nimes","Leroy,15,Sete"]],["phrase","une phrase",["le chat dort ici","il pleut","un deux trois quatre cinq"]]]
  .forEach(([nom,desc,X])=>FAM.push({type:"var",nom,desc,vers:X.map(x=>({T:arboDe([]),V:{[nom]:x},L:[x]}))}));

/* les énoncés : [palier, (famille, hasard, version montrée) → {quoi: ce qu'il faut afficher, F: les filtres, alt: autres écritures justes}] ; palier 0 : seulement à lire */
const K23=R=>R.ent(2,3),K24=R=>R.ent(2,4);
const lettreDans=(L,R)=>{const C="aeioulnrst".split("").filter(x=>{const k=L.filter(s=>s.includes(x)).length;return k>0&&k<L.length;});return C.length?R.choix(C):null;};
const initiale=(L,R)=>{const C=[...new Set(L.map(s=>s[0]))].filter(x=>L.filter(s=>s[0]===x).length>1);return C.length?R.choix(C):null;};
const COMMUN=[
  [1,(f,R)=>{const k=K24(R);return {quoi:`les ${k} premières lignes du fichier`,F:[`head -n ${k}`],alt:[`head -${k} ${f.nom}`]};}],
  [1,(f,R)=>{const k=K24(R);return {quoi:`les ${k} dernières lignes du fichier`,F:[`tail -n ${k}`],alt:[`tail -${k} ${f.nom}`]};}],
  [1,()=>({quoi:"le nombre de lignes du fichier",F:["wc -l"]})],
  [2,(f,R)=>{const k=K24(R);return {quoi:`la ${k}e ligne du fichier, et rien d'autre`,F:[`head -n ${k}`,"tail -n 1"],alt:[`sed -n '${k}p' ${f.nom}`]};}],
  [0,(f,R)=>({F:[`tail -n ${K24(R)}`,"head -n 1"]})]];
const ITEMS={
 nb:[
  [1,f=>({quoi:`les ${f.pl}, ${f.asc}`,F:["sort -n"]})],
  [1,f=>({quoi:`les ${f.pl}, ${f.dsc}`,F:["sort -n -r"],alt:[`sort -nr ${f.nom}`,`sort -r -n ${f.nom}`]})],
  [2,f=>({quoi:`${f.la} plus ${f.gd} ${f.un}, et rien d'autre`,F:["sort -n","tail -n 1"],alt:[`sort -n -r ${f.nom} | head -n 1`]})],
  [2,f=>({quoi:`${f.la} plus ${f.pt} ${f.un}, et rien d'autre`,F:["sort -n","head -n 1"],alt:[`sort -n -r ${f.nom} | tail -n 1`]})],
  [2,(f,R)=>{const k=K23(R);return {quoi:`les ${k} plus ${f.gd}s ${f.pl}, ${f.la} plus ${f.gd} en premier`,F:["sort -n -r",`head -n ${k}`]};}],
  [2,(f,R)=>{const k=K23(R);return {quoi:`les ${k} plus ${f.pt}s ${f.pl}, ${f.la} plus ${f.pt} en premier`,F:["sort -n",`head -n ${k}`]};}],
  [2,(f,R)=>{const k=K24(R);return {quoi:`les ${k} premières lignes du fichier, triées ${f.asc}`,F:[`head -n ${k}`,"sort -n"]};}],
  [0,(f,R)=>({F:["sort",`head -n ${K23(R)}`]})],[0,()=>({F:["sort","tail -n 1"]})],[0,(f,R)=>({F:["sort -r",`head -n ${K23(R)}`]})]],
 mot:[
  [1,f=>({quoi:`les ${f.pl} dans l'ordre alphabétique`,F:["sort"]})],
  [1,f=>({quoi:`les ${f.pl} dans l'ordre alphabétique inverse, de z à a`,F:["sort -r"]})],
  [1,(f,R,v)=>{const x=lettreDans(v.L,R);return x&&{quoi:`les ${f.pl} qui contiennent la lettre ${c(x)}`,F:[`grep ${x}`]};}],
  [2,(f,R)=>{const k=K23(R);return {quoi:`les ${k} ${f.prem} ${f.pl} dans l'ordre alphabétique`,F:["sort",`head -n ${k}`]};}],
  [2,f=>({quoi:`${f.la} ${f.un} qui vient en dernier dans l'ordre alphabétique, et rien d'autre`,F:["sort","tail -n 1"],alt:[`sort -r ${f.nom} | head -n 1`]})],
  [2,(f,R,v)=>{const x=lettreDans(v.L,R);return x&&{quoi:`le nombre de ${f.pl} qui contiennent la lettre ${c(x)}`,F:[`grep ${x}`,"wc -l"],alt:[`grep -c ${x} ${f.nom}`]};}],
  [2,(f,R,v)=>{const x=lettreDans(v.L,R);return x&&{quoi:`le nombre de ${f.pl} qui ne contiennent pas la lettre ${c(x)}`,F:[`grep -v ${x}`,"wc -l"],alt:[`grep -v -c ${x} ${f.nom}`]};}],
  [2,(f,R,v)=>{const x=initiale(v.L,R);return x&&{quoi:`les ${f.pl} qui commencent par la lettre ${c(x)}, dans l'ordre alphabétique`,F:[`grep "^${x}"`,"sort"],alt:[`sort ${f.nom} | grep "^${x}"`]};}]],
 cpt:[
  [1,f=>({quoi:"le nom de connexion de chaque compte, c'est-à-dire le 1er champ",F:["cut -d: -f1"],alt:[`cut -d ":" -f 1 ${f.nom}`]})],
  [1,()=>({quoi:"le nom complet de chaque compte, c'est-à-dire le 3e champ",F:["cut -d: -f3"]})],
  [1,()=>({quoi:"le nom de connexion et le nom complet de chaque compte, c'est-à-dire les champs 1 et 3",F:["cut -d: -f1,3"]})],
  [1,()=>({quoi:"le nombre de comptes",F:["wc -l"]})],
  [2,()=>({quoi:"les noms de connexion, dans l'ordre alphabétique",F:["cut -d: -f1","sort"]})],
  [3,()=>({quoi:"les lignes du fichier, triées selon le nom complet, qui est le 3e champ",F:["sort -t: -k3"]})],
  [3,f=>({quoi:"les lignes du fichier, triées selon le numéro, qui est le 2e champ, du plus petit au plus grand",F:["sort -t: -k2 -n"],alt:[`sort -n -t: -k2 ${f.nom}`,`sort -t ":" -k 2n ${f.nom}`]})],
  [3,f=>({quoi:"le nom de connexion, le nom complet et le dossier d'accueil de chaque compte, triés selon le nom complet, comme à l'exercice 40 du TD",F:["cut -d: -f1,3,4","sort -t: -k2"],alt:[`sort -t: -k3 ${f.nom} | cut -d: -f1,3,4`]})],
  [3,f=>({quoi:"le nom de connexion du compte qui a le plus grand numéro, et rien d'autre",F:["sort -t: -k2 -n","tail -n 1","cut -d: -f1"],alt:[`sort -t: -k2 -n -r ${f.nom} | head -n 1 | cut -d: -f1`]})],
  [3,(f,R)=>{const k=K23(R);return {quoi:`les noms de connexion des ${k} comptes qui ont les plus petits numéros, le plus petit en premier`,F:["sort -t: -k2 -n",`head -n ${k}`,"cut -d: -f1"]};}]],
 csv:[
  [1,(f,R)=>{const k=R.ent(1,3);return {quoi:`${f.ch[k-1]} de chaque ligne, c'est-à-dire le ${ORD(k)} champ`,F:[`cut -d, -f${k}`]};}],
  [1,f=>({quoi:`${f.ch[0]} et ${f.ch[2]} de chaque ligne, c'est-à-dire les champs 1 et 3`,F:["cut -d, -f1,3"]})],
  [2,f=>({quoi:`${f.pl1}, dans l'ordre alphabétique`,F:["cut -d, -f1","sort"]})],
  [3,f=>({quoi:`les lignes du fichier, triées selon ${f.ch[1]}, qui est le 2e champ, ${f.asc}`,F:["sort -t, -k2 -n"]})],
  [3,f=>({quoi:`${f.top}, et rien d'autre`,F:["sort -t, -k2 -n","tail -n 1","cut -d, -f1"],alt:[`sort -t, -k2 -n -r ${f.nom} | head -n 1 | cut -d, -f1`]})],
  [3,f=>({quoi:`${f.max}, et rien d'autre`,F:["cut -d, -f2","sort -n","tail -n 1"],alt:[`cut -d, -f2 ${f.nom} | sort -n -r | head -n 1`]})]],
 ls:[
  [1,()=>({quoi:"le nombre de fichiers du dossier courant",F:["wc -l"]})],
  [1,()=>({quoi:"les noms des fichiers du dossier courant dans l'ordre alphabétique inverse, de z à a",F:["sort -r"],alt:["ls -r"]})],
  [1,(f,R)=>{const k=K24(R);return {quoi:`les ${k} premiers noms que donne ls`,F:[`head -n ${k}`]};}],
  [2,(f,R)=>{const x=R.choix([".txt",".py",".c"]);return {quoi:`le nombre de fichiers du dossier courant dont le nom finit par ${c(x)}`,F:[`grep "\\${x}$"`,"wc -l"],alt:[`ls *${x} | wc -l`,`ls | grep -c "\\${x}$"`]};}],
  [2,(f,R)=>{const x=R.choix([".txt",".py",".c"]);return {quoi:`le nombre de fichiers du dossier courant dont le nom ne finit pas par ${c(x)}`,F:[`grep -v "\\${x}$"`,"wc -l"]};}],
  [2,(f,R)=>{const x=R.choix([".txt",".py",".c"]);return {quoi:`les noms des fichiers du dossier courant qui finissent par ${c(x)}, dans l'ordre alphabétique inverse`,F:[`grep "\\${x}$"`,"sort -r"]};}]],
 ll:[
  [1,f=>({quoi:"les lignes des répertoires",F:['grep "^d"'],alt:[`grep ^d ${f.nom}`]})],
  [2,f=>({quoi:"le nombre de répertoires",F:['grep "^d"',"wc -l"],alt:[`grep -c "^d" ${f.nom}`]})],
  [2,()=>({quoi:"le nombre de lignes qui ne sont pas celles d'un répertoire",F:['grep -v "^d"',"wc -l"]})],
  [3,f=>({quoi:"la ligne où la taille est la plus grande, et rien d'autre : la taille est le 5e champ, et ici les champs sont séparés par des espaces",F:["sort -k5 -n","tail -n 1"],alt:[`sort -n -r -k5 ${f.nom} | head -n 1`]})]],
 ty:[
  [2,f=>({quoi:"le nombre de fichiers de type texte : ce sont les lignes qui contiennent le mot text",F:["grep text","wc -l"],alt:[`grep -c text ${f.nom}`]})],
  [3,()=>({quoi:"les noms des fichiers de type texte, comme à l'exercice 40 du TD : leur ligne contient le mot text, et le nom est avant le deux-points",F:["grep text","cut -d: -f1"]})],
  [3,()=>({quoi:"les noms des répertoires : leur ligne contient le mot directory, et le nom est avant le deux-points",F:["grep directory","cut -d: -f1"]})]],
 log:[
  [1,(f,R)=>{const w=R.choix(ETATS);return {quoi:`les lignes qui contiennent le mot ${c(w)}`,F:[`grep ${w}`]};}],
  [2,(f,R)=>{const w=R.choix(ETATS);return {quoi:`le nombre de lignes qui contiennent le mot ${c(w)}`,F:[`grep ${w}`,"wc -l"],alt:[`grep -c ${w} ${f.nom}`]};}],
  [2,(f,R)=>{const w=R.choix(ETATS);return {quoi:`le nombre de lignes qui ne contiennent pas le mot ${c(w)}`,F:[`grep -v ${w}`,"wc -l"]};}],
  [2,(f,R)=>{const w=R.choix(ETATS);return {quoi:`la dernière ligne qui contient le mot ${c(w)}, et rien d'autre`,F:[`grep ${w}`,"tail -n 1"]};}],
  [2,(f,R)=>{const w=R.choix(ETATS);return {quoi:`les 2 premières lignes qui contiennent le mot ${c(w)}`,F:[`grep ${w}`,"head -n 2"]};}],
  [3,(f,R)=>{const w=R.choix(ETATS);return {quoi:`l'heure de chaque ligne qui contient le mot ${c(w)} : l'heure est le 1er champ, et les champs sont séparés par un espace`,F:[`grep ${w}`,'cut -d" " -f1'],alt:[`grep ${w} ${f.nom} | cut -d ' ' -f 1`]};}]],
 var:[
  [3,(f,R)=>{const k=R.ent(1,3);return f.nom==="ligne"?{quoi:`son ${ORD(k)} champ, les champs étant séparés par des virgules`,F:[`cut -d, -f${k}`]}:{quoi:"le nombre de mots qu'elle contient",F:["wc -w"]};}]]};
/* des commandes en plus, seulement pour comparer le petit shell au vrai bash ; @ est le nom du fichier */
const BANC={
 nb:["sort -u @","sort -rn @ | uniq","head -n -2 @","tail -n +3 @","wc -w @","wc -c < @","cat @ | tr 0-9 a-j","sed -n '2,3p' @","sed 2d @","sort -n @ | tee copie.txt | tail -2","cat @ @ | sort -n | uniq -c","sed \"s/1/x/\" @","sed \"s/1/x/g\" @","cut -c1 @ | sort | uniq -c","cut -c2- @","sort -k1,1nr @","tr -d 1 < @","grep -c 1 @","cat @ | more | head -n 2","sed 3q @"],
 mot:["tr a-z A-Z < @","cat @ | tr '[:lower:]' '[:upper:]'","sort @ | uniq","cut -c1-3 @","cut -c-2,4 @","sed \"s/a/o/g\" @ | sort -r","grep -i A @ | sort | head -3","tr -d aeiou < @","tr 'ae' 'x' < @","sort -r @ | tail -n +2 | head -n 2","cat @ | tr '\\n' ' '","wc -l @ | cut -d\" \" -f1","sed -n 3p @","grep -vc a @","sort -ru @","less @ | wc -w"],
 cpt:["cut -d: -f2- @","cut -d: -f-2 @","cut -d: -f2,1 @","cut -f1 @","cut -d: -f5 @","cut -d: -s -f1 @","sort -t: -k2 @","sort -t: -k2,2nr @","sort -t: -k3 -r @","sort -k2 @","tr ':' ' ' < @ | sort -k2 -n","cut -d: -f3 @ | cut -d\" \" -f2 | sort","sort -t: -k4 @ | head -n 2","cut -d: -f3 @ | wc -w","sort -n -t: -k2 -u @","sort -t: -k2n @ | tail -1"],
 csv:["sort -t, -k3 -n @","sort -t, -k3 -n -r @","sort -t, -k3,3n @","cut -d, -f3 @ | sort -n | uniq -c","cut -d, -f3 @ | sort -nu","sort -t, -k2nr @ | cut -d, -f1,2 | tr , \" \"","tr , : < @ | cut -d: -f2","sed \"s/,/ /g\" @ | sort -k2 -n -r | head -n 1","sort -t, -k3 @","sort -t, -k3,3 -u @"],
 ls:["ls -a | head -n 3","ls -r | tail -n 2","ls *.py","ls *.c *.txt | sort -r","ls | grep -c py","ls | cut -d. -f2 | sort | uniq -c","ls | cut -d. -f2 | sort -u","ls | tr . \" \" | wc -w","ls -1 | sort -t. -k2","ls | sed \"s/txt/md/\"","ls ?????.*","ls | grep -v \"\\.\" | wc -l"],
 ll:["sort -k5 @","sort -k5 -n -r @ | head -n 2","sort -k9 @","grep -c etu @","grep -v \"^-\" @ | wc -l","sort -k5,5n -u @","cut -c1 @ | sort | uniq -c","sort -k5,5n @","sort -r -k5,5n @"],
 ty:["cut -d: -f2 @","cut -d: -f2 @ | sort | uniq","grep -v text @ | cut -d: -f1 | sort -r","sort -t: -k2 @","grep -i ascii @ | wc -l","cut -d\" \" -f2 @ | sort -u"],
 log:["cut -d\" \" -f2 @ | sort | uniq -c","cut -d\" \" -f2 @ | sort -u","cut -d\" \" -f3- @","sort -k2 @","sort -k2,2 @","sort -r -k2,2 @","grep -v ok @ | cut -d\" \" -f1 | tail -n 2","cut -d: -f1 @ | sort -n | uniq","wc -w < @","grep -c -v erreur @","sed -n '2,4p' @ | cut -c1-5","tr ' ' '\\n' < @ | grep -c ok","sort -k2,2 -u @"],
 ligne:["echo $ligne | cut -d, -f1,3","echo \"$ligne\" | tr , \"\\n\" | sort","echo \"${ligne}\" | sed \"s/,/;/g\"","echo ${ligne} | cut -d, -f2-","echo $ligne | wc -c"],
 phrase:["echo $phrase | wc -c","echo \"$phrase\" | tr \" \" \"\\n\" | sort | head -n 1","echo \"$phrase\" | cut -d\" \" -f2","echo $phrase | tr -d \" \"","echo a $phrase b | wc -w"]};

/* ce que fait un filtre, à l'infinitif, puis pourquoi ses options */
function role(f){let m;
  if(/^sort/.test(f)){m=/(?: -t(\S))? -k(\d)/.exec(f);return "trier les lignes"+(m?` selon le ${ORD(+m[2])} champ`+(m[1]?`, les champs étant séparés par ${NOMSEP(m[1])}`:""):"")+(/ -n/.test(f)?", en comparant des nombres":m?"":" dans l'ordre alphabétique")+(/ -r/.test(f)?", à l'envers":"");}
  if((m=/^(head|tail) -n (\d+)$/.exec(f)))return m[2]==="1"?`garder la ${m[1]==="head"?"première":"dernière"} ligne`:`garder les ${m[2]} ${m[1]==="head"?"premières":"dernières"} lignes`;
  if(f==="wc -l")return "compter les lignes";if(f==="wc -w")return "compter les mots";
  if((m=/^grep( -v)? (.+)$/.exec(f))){const x=m[2].replace(/"/g,"");return `${m[1]?"enlever":"garder"} les lignes qui ${/^\^/.test(x)?"commencent par":/\$$/.test(x)?"finissent par":"contiennent"} ${cr(x.replace(/^\^|\$$/g,"").replace(/\\/g,""))}`;}
  if((m=/^cut -d(" "|\S+) -f([\d,]+)$/.exec(f))){const L=m[2].split(",");return `garder ${L.length>1?"les champs "+et(L):"le "+ORD(+L[0])+" champ"} de chaque ligne, les champs étant séparés par ${NOMSEP(m[1])}`;}
  return f;}
function raison(f){let m;
  if(/^sort/.test(f))return [(m=/( -t(\S))? -k(\d)/.exec(f))&&(m[1]?`${cr("-t"+m[2])} dit que les champs sont séparés par ${NOMSEP(m[2])}, et ${cr("-k"+m[3])} qu'on trie selon le ${ORD(+m[3])} champ.`:`${cr("-k"+m[3])} dit de trier selon le ${ORD(+m[3])} champ ; sans ${cr("-t")}, les champs sont séparés par des espaces.`),
    / -n/.test(f)?`Avec ${cr("-n")}, sort compare des nombres ; sans lui, il compare caractère par caractère, et 10 passerait avant 9.`:!m&&`Sans ${cr("-n")}, sort compare caractère par caractère, comme dans un dictionnaire.`,/ -r/.test(f)&&`${cr("-r")} renverse l'ordre.`].filter(Boolean).join(" ");
  if(/^(head|tail)/.test(f))return `${cr("head")} garde le début de ce qu'il reçoit, ${cr("tail")} la fin ; le nombre de lignes s'écrit après ${cr("-n")}.`;
  if(/^wc/.test(f))return f==="wc -l"?`${cr("wc -l")} compte les lignes. Quand elles arrivent par un tube, il n'écrit que leur nombre ; quand on lui donne un nom de fichier, il écrit ce nom après le nombre.`:`${cr("wc -w")} compte les mots qu'il reçoit.`;
  if(/^grep/.test(f))return ["grep garde les lignes où il trouve le motif.",/ -v/.test(f)&&`${cr("-v")} inverse : il garde les autres.`,/"\^/.test(f)&&`${cr("^")} colle le motif au début de la ligne.`,/\$"$/.test(f)&&`${cr("$")} colle le motif à la fin de la ligne, et ${cr("\\.")} veut dire un vrai point.`].filter(Boolean).join(" ");
  if(/^cut/.test(f))return `${cr("-d")} donne le séparateur, un seul caractère ; ${cr("-f")} donne les numéros des champs à garder, comptés à partir de 1.`;
  return "";}
/* les erreurs connues : la même commande avec un défaut. e : message pour une commande écrite, l : pour un affichage lu */
function mutantes(F){const M=[];
  F.forEach((f,i)=>{let m;const nom=f.split(" ")[0],avec=x=>F.map((y,j)=>j===i?x:y),aj=(type,F2,e,l,o)=>M.push(Object.assign({k:i,type,F:F2,e,l:l||e,si:new RegExp("(^|[| ])"+F2[i].split(" ")[0]+"( |$)")},o));
    if(nom==="sort"){
      if(/ -n/.test(f))aj("-n oublié",avec(f.replace(" -n","")),`Sans ${cr("-n")}, sort compare les lignes caractère par caractère, comme des mots : 10 passe avant 9, parce que le caractère 1 est avant le caractère 9.`,`Ici, sort a l'option ${cr("-n")} : il compare des nombres, donc 9 passe avant 10.`);
      else if(!/-k/.test(f))aj("sort lu comme sort -n",avec(f+" -n"),`Avec ${cr("-n")}, sort compare des nombres : il ne le faut pas ici.`,`Sans ${cr("-n")}, sort ne compare pas des nombres : il compare caractère par caractère, comme des mots. 10 passe avant 9, parce que le caractère 1 est avant le caractère 9.`);
      if(/ -r/.test(f))aj("-r oublié",avec(f.replace(" -r","")),`Sans ${cr("-r")}, sort range du plus petit au plus grand, ou de a à z.`,`Avec ${cr("-r")}, l'ordre est renversé : le plus grand sort en premier.`);
      else aj("ordre renversé",avec(f+" -r"),`${cr("-r")} renverse l'ordre : il ne le faut pas ici.`,`Il n'y a pas ${cr("-r")} : sort range du plus petit au plus grand, ou de a à z.`);
      if((m=/( -t\S)? -k(\d)/.exec(f))){
        if(m[1])aj("-t oublié",avec(f.replace(m[1],"")),`Sans ${cr(m[1].trim())}, sort croit que les champs sont séparés par des espaces : il ne trouve pas le ${ORD(+m[2])} champ.`,"",{si:/-k/,ecrit:1});
        aj("-k oublié",avec(f.replace(m[0],"")),`Sans ${cr("-k"+m[2])}, sort trie sur la ligne entière, donc d'abord sur son début.`,`${cr("-k"+m[2])} dit à sort de trier selon le ${ORD(+m[2])} champ, pas selon le début de la ligne.`);}}
    if((m=/^(head|tail)( .*)$/.exec(f)))aj("head et tail confondus",avec((m[1]==="head"?"tail":"head")+m[2]),`${cr("head")} garde les premières lignes de ce qu'il reçoit, ${cr("tail")} les dernières.`);
    if(nom==="grep"){
      if(/ -v/.test(f))aj("-v oublié",avec(f.replace(" -v","")),`Sans ${cr("-v")}, grep garde les lignes où il trouve le motif. C'est ${cr("-v")} qui garde les autres.`,`${cr("-v")} inverse le tri : grep garde les lignes où il ne trouve pas le motif.`);
      else aj("-v en trop",avec(f.replace("grep","grep -v")),`${cr("-v")} inverse le tri : grep garde alors les lignes où il ne trouve pas le motif.`,`Il n'y a pas ${cr("-v")} : grep garde les lignes où il trouve le motif.`);
      if((m=/"(\^?)([^"]*?)(\$?)"$/.exec(f))&&(m[1]||m[3]))aj("motif cherché partout",avec(f.replace(m[0],m[2].replace(/\\\.?/g,""))),`Sans ${cr(m[1]||m[3])}, grep cherche le motif n'importe où dans la ligne, pas seulement ${m[1]?"au début":"à la fin"}.`,`${cr(m[1]||m[3])} colle le motif ${m[1]?"au début":"à la fin"} de la ligne : une ligne qui a ces caractères ailleurs ne compte pas.`);}
    if((m=/^cut -d(" "|\S+) -f(\d)([\d,]*)$/.exec(f))){
      aj("-d oublié",avec(`cut -f${m[2]}${m[3]}`),`Sans ${cr("-d")}, cut croit que les champs sont séparés par des tabulations : il n'en trouve pas, et il recopie chaque ligne en entier.`,`${cr("-d")} donne le séparateur : cut coupe chaque ligne à cet endroit et ne garde que les champs demandés.`);
      if(+m[2]>1&&!m[3])aj("champ compté à partir de 0",avec(`cut -d${m[1]} -f${m[2]-1}`),`Les champs se comptent à partir de 1 : le premier est ${cr("-f1")}. Ici, il faut ${cr("-f"+m[2])}.`,`Les champs se comptent à partir de 1 : ${cr("-f"+m[2])} garde le ${ORD(+m[2])} champ.`);}
    if(f==="wc -l")aj("wc -w à la place de wc -l",avec("wc -w"),`${cr("wc -w")} compte les mots. Pour compter les lignes, c'est ${cr("wc -l")}.`,`${cr("wc -l")} compte les lignes, pas les mots.`);
    if(f==="wc -w")aj("wc -l à la place de wc -w",avec("wc -l"),`${cr("wc -l")} compte les lignes. Pour compter les mots, c'est ${cr("wc -w")}.`,`${cr("wc -w")} compte les mots, pas les lignes.`);
    if(i<F.length-1)aj("filtres dans le mauvais ordre",F.map((y,j)=>j===i?F[i+1]:j===i+1?F[i]:y),`Un tube se lit de gauche à droite. Il faut d'abord ${cr(F[i])}, ensuite ${cr(F[i+1])}, qui ne reçoit que ce qui sort du premier.`,`Un tube se lit de gauche à droite : ${cr(F[i])} travaille d'abord, et ${cr(F[i+1])} ne reçoit que ce qui en sort.`);});
  for(let j=F.length-1;j>=0;j--)M.push({k:j,type:"tube incomplet",F:F.slice(0,j),e:`Ta commande s'arrête trop tôt : il reste à ${role(F[j])}.`,l:`Tu t'es arrêté avant la fin du tube : il reste ${cr(F[j])}, c'est-à-dire ${role(F[j])}.`});
  return M;}

const NOMSEP=x=>({":":"des deux-points",",":"des virgules",".":"des points",'" "':"des espaces"})[x]||cr(x);
const pareil=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
/* wc -l fichier écrit aussi le nom du fichier : « 7 notes.txt » vaut « 7 » */
const norme=L=>L.length===1?[L[0].replace(/^(\d+) \S+$/,"$1")]:L;
const pave=L=>blocr(L.length?L.slice(0,8).join("\n")+(L.length>8?"\n…":""):"(rien)");
const montre=L=>!L.length?"rien.":L.length<=5&&L.join("").length<=36&&L.every(x=>x&&!/ /.test(x))?L.map(cr).join(", ")+".":pave(L);
const SYMT=[["|","| "],["sort","sort "],["head","head "],["tail","tail "],["grep","grep "],["cut","cut "],["wc","wc "],["-n","-n "],["-d","-d"],["-f","-f"],['"','"'],["^","^"],["＄","$"]];
const PAR=[[],[],[],[]];
for(const f of FAM)for(const [p,gen] of ITEMS[f.type].concat(/^(nb|mot|log)$/.test(f.type)?COMMUN:[])){if(p)PAR[p].push([f,gen]);PAR[0].push([f,gen]);}
function exoTube(R,p){const [fam,gen]=R.choix(PAR[p]),v=R.ent(0,2),vers=[0,1,2].map(i=>fam.vers[(v+i)%3]),ver=vers[0],it=gen(fam,R,ver);if(!it)return null;
  const lire=p===0,F=it.F,src=fam.type==="ls"?"ls":fam.type==="var"?`echo "$${fam.nom}"`:null,d=src?1:0;
  const cmdDe=F=>src?[src,...F].join(" | "):F.length?[F[0]+" "+fam.nom,...F.slice(1)].join(" | "):"cat "+fam.nom;
  const sur=cmd=>{const S=vers.map(x=>lanceTube(cmd,x.T,x.V));return S.every(s=>s.sortie)?S:null;};
  const ref=cmdDe(F),S=sur(ref);if(!S)throw new Error("commande de référence refusée : "+ref);
  const bon=S.map(s=>norme(s.sortie)),att=S[0].sortie,attP=att.map(propre);
  if(lire&&(!att.length||att.length>5||att.join("").length>40))return null;
  const mut=[];for(const m of mutantes(F)){if(lire&&m.ecrit)continue;const cmd=cmdDe(m.F),Sm=sur(cmd);if(!Sm)continue;const O=Sm.map(s=>norme(s.sortie));
    if(!(lire?pareil(O[0],bon[0]):O.every((o,i)=>pareil(o,bon[i]))))mut.push(Object.assign(m,{cmd,O}));}
  const fausse=mut.find(m=>m.O[0].length);if(!fausse)return null;
  const alt=lire?[]:[...(it.alt||[]),...(src?[]:["cat "+fam.nom+" | "+F.join(" | "),F[0]+" < "+fam.nom+F.slice(1).map(x=>" | "+x).join("")]),...(fam.type==="var"?[`echo $${fam.nom} | ${F.join(" | ")}`]:[])];
  const ici=fam.type==="var"?"Avec la valeur de l'énoncé":fam.type==="ls"?"Dans le dossier de l'énoncé":"Sur le fichier de l'énoncé",segs=ref.split(" | "),sortie=i=>`${ici}, il en sort : ${montre(S[0].P[i])}`;
  const q=fam.type==="var"?(lire?`Dans un script Bash, la variable ${cr(fam.nom)} contient ${cr(ver.L[0])}. Qu'affiche la commande ci-dessous ?`:`Dans un script Bash, la variable ${cr(fam.nom)} contient ${fam.desc}, par exemple ${cr(ver.L[0])}. Donne la commande qui affiche ${it.quoi}.`)
    :fam.type==="ls"?(lire?"Voici les fichiers du dossier courant, puis une commande. Qu'affiche cette commande ?":`Le dossier courant contient les fichiers affichés ci-dessous. Donne la commande qui affiche ${it.quoi}.`)
    :lire?`Le fichier ${cr(fam.nom)} contient ${fam.desc}. Voici le fichier, puis une commande. Qu'affiche cette commande ?`:`Le fichier ${cr(fam.nom)}, affiché ci-dessous, contient ${fam.desc}. Donne la commande qui affiche ${it.quoi}.`;
  const donnees=fam.type==="var"?"":blocr(ver.L.join("\n")),corps=lire?(donnees?donnees+"<p>La commande&nbsp;:</p>":"")+blocr(ref):donnees;
  const origine=src==="ls"?{w:`D'où viennent les lignes : ${cr("ls")} écrit un nom par ligne, et le tube ${cr("|")} les envoie au premier filtre.`,why:"Un tube branche la sortie de la commande de gauche sur l'entrée de celle de droite.",pts:1}
    :src?{w:`D'où viennent les lignes : ${cr(src)} écrit le contenu de la variable, et le tube ${cr("|")} l'envoie au filtre.`,why:"Un filtre lit un fichier, ou ce qui arrive par un tube ; il ne lit pas une variable. C'est echo qui fait le passage, et les guillemets gardent le contenu tel quel.",pts:1}
    :{w:`D'où viennent les lignes : du fichier ${cr(fam.nom)}. Son nom s'écrit après le premier filtre et ses options.`,why:`${cr("cat "+fam.nom+" | "+F[0])} marche aussi : cat envoie le fichier dans le tube.`,pts:1};
  const E=lire?[...segs.map((s,i)=>({w:`${i?"Ensuite":"D'abord"} ${cr(s)} : ${i<d?(src==="ls"?"écrire les noms du dossier courant, un par ligne":"écrire le contenu de la variable"):role(F[i-d])}.`,why:`${i<d?"":raison(F[i-d])+" "}${sortie(i)}`,pts:1})),
      {w:`<b>La commande affiche</b> : ${montre(att)}`,why:"Un tube se lit de gauche à droite : chaque filtre ne reçoit que ce qui sort du précédent.",pts:1}]
    :[origine,...F.map((f,i)=>({w:`${Maj(role(f))} : ${cr((i||d?"| ":"")+f+(i||d?"":" "+fam.nom))}`,why:`${raison(f)} ${sortie(i+d)}`,pts:1})),
      {w:`La commande : <b>${cr(ref)}</b>`,why:`${ici}, elle affiche : ${montre(att)}${it.alt?` On peut aussi écrire ${cr(it.alt[0])}.`:""}`,pts:0.5}];
  const fin=E.length-1,faux=(ch,resume)=>(etape,type,titre,msg)=>({ok:false,faux:[ch],resume,diag:{etape,type,titre,msg}});
  const juge=lire?rep=>{const L0=String(rep.s==null?"":rep.s).split("\n").map(propre).filter(Boolean),non=faux("s","Pas tout à fait : ce n'est pas ce que la commande affiche.");
      if(!L0.length)return {incomplet:"Écris ce que la commande affiche, ligne par ligne."};
      const L=L0.length===1&&att.length>1&&att.every(x=>!/[ ,;]/.test(x))?L0[0].split(/[ ,;]+/).filter(Boolean):L0;
      if(pareil(L,attP)||pareil(norme(L),bon[0]))return {ok:true};
      const m=mut.find(m=>pareil(L,m.O[0].map(propre)));if(m)return non(m.k+d,m.type,"Où ça part : "+m.type+".",m.l);
      if(pareil(L.slice().sort(),attP.slice().sort()))return non(fin,"lignes dans le mauvais ordre","Où ça part : l'ordre des lignes.","Ce sont les bonnes lignes, mais pas dans le bon ordre : à l'écran, l'ordre compte.");
      return non(0,"affichage différent","Où ça part : le tube se lit de gauche à droite.","Écris ce qui sort du premier morceau, puis ce que le morceau suivant en garde, et ainsi de suite : la correction le fait pas à pas.");}
    :rep=>{const t=propre(rep.c),non=faux("c","Pas tout à fait : cette commande n'affiche pas ce qui est demandé.");if(!t)return {incomplet:"Écris la commande."};
      const St=vers.map(x=>lanceTube(t,x.T,x.V)),pb=St.find(s=>!s.sortie);
      if(pb)return pb.inconnu?{incomplet:d36(esc(pb.inconnu))}:non(fin,"commande qui ne marche pas","Où ça part : la commande ne marche pas.",d36(esc(pb.err)));
      const O=St.map(s=>norme(s.sortie));if(O.every((o,i)=>pareil(o,bon[i])))return {ok:true};
      const C=mut.filter(m=>(!m.si||m.si.test(t))&&m.O.every((o,i)=>pareil(o,O[i]))),m=C.find(m=>m.cmd===t)||C[0];if(m)return non(m.k+1,m.type,"Où ça part : "+m.type+".",m.e);
      const i=O.findIndex((o,k)=>!pareil(o,bon[k])),x=vers[i],ailleurs=fam.type==="var"?`avec une autre valeur de la variable, ${cr(x.L[0])},`:`${fam.type==="ls"?"dans cet autre dossier d'essai":"sur cet autre fichier d'essai"} : ${pave(x.L)}`;
      return non(fin,"résultat différent","Où ça part : ce que la commande affiche.",`${i?`${ici}, ta commande tombe juste. Mais ${ailleurs} elle`:`${ici}, ta commande`} affiche : ${pave(St[i].sortie)} Il fallait : ${pave(S[i].sortie)}`);};
  const cas=(x,cmd)=>{const r=lanceTube(cmd,x.T,x.V);return {arbo:x.T,cmd:(x.V?Object.entries(x.V).map(([k,y])=>`${k}='${y}'; `).join(""):"")+cmd,abs:r.sortie||null,brut:true,ordre:true};};
  const banc=BANC[fam.type]||BANC[fam.nom],bash=[...vers.map(x=>cas(x,ref)),...alt.map(a=>cas(ver,a)),...mut.map(m=>cas(ver,m.cmd)),...[0,1].map(()=>cas(ver,R.choix(banc).replace(/@/g,fam.nom)))];
  return {sig:lire?"T0"+ref+"|"+ver.L.join("|"):"T"+p+brut(q),q,corps,texte:brut(q)+(lire?" — "+ref+" — "+ver.L.join(" | "):""),
    champs:lire?[{k:"code",id:"s",nom:"affichage",label:"Ce que la commande affiche, ligne par ligne&nbsp;:",lignes:4}]
      :[{k:"champ",id:"c",nom:"commande",label:"La commande :",ex:"… | …",apercu:false,sym:SYMT,aide:fam.type==="var"?"Ta commande est essayée avec cette valeur, et avec d'autres.":`Ta commande est essayée sur ce ${fam.type==="ls"?"dossier":"fichier"}, et sur d'autres de la même forme.`}],
    juge,etapes:E,bonne:lire?pave(att):cr(ref),bonneTxt:lire?att.join(" ⏎ "):ref,repBonne:lire?{s:att.join("\n")}:{c:ref},repFausse:lire?{s:fausse.O[0].join("\n")}:{c:mut[0].cmd},nature:fam.type,
    ens:{lire,ref,alt,pieges:mut.map(m=>({type:m.type,cmd:m.cmd,sortie:m.O[0]})),bash}};}
const tireTube=p=>R=>{for(;;){const e=exoTube(R,p);if(e)return e;}};

/* ---------- US7 : un petit bash qui joue un script entier : variables, paramètres, $(( )), $( ), if, for, while, [[ ]], [ ], read, et mv, rm, cp, touch, mkdir ---------- */
const PAS7=3000;
/* s[i] est le $ de $( ou de $(( : rend l'indice juste après la parenthèse fermante, ou -1 */
function ferme(s,i){let p=s[i+2]==="("?2:1,j=i+p+1;
  for(;j<s.length;j++){const x=s[j];
    if(x==="\\"){j++;continue;}
    if(x==="'"){const k=s.indexOf("'",j+1);if(k<0)return -1;j=k;continue;}
    if(x==='"'){let k=j+1;for(;k<s.length&&s[k]!=='"';k++)if(s[k]==="\\")k++;if(k>=s.length)return -1;j=k;continue;}
    if(x==="(")p++;else if(x===")"&&--p===0)return j+1;}
  return -1;}
function lexe(src){const T=[],n=src.length;let i=0,l=1,w=null,wl=1;
  const fin=()=>{if(w!==null){T.push({w,l:wl});w=null;}},op=o=>{fin();T.push({op:o,l});},aj=s=>{if(w===null){w="";wl=l;}w+=s;l+=s.split("\n").length-1;};
  while(i<n){const x=src[i],d=src[i+1];
    if(x==="\n"){op("\n");l++;i++;}
    else if(x===" "||x==="\t"||x==="\r"){fin();i++;}
    else if(x==="#"&&w===null){while(i<n&&src[i]!=="\n")i++;}
    else if(x==="\\"){if(d==="\n"){l++;i+=2;}else{aj(x+(d||""));i+=2;}}
    else if(x==="'"){const k=src.indexOf("'",i+1);if(k<0)throw {err:`Ligne ${l} : un guillemet ' n'est pas refermé.`};aj(src.slice(i,k+1));i=k+1;}
    else if(x==='"'){let k=i+1;for(;k<n&&src[k]!=='"';k++){if(src[k]==="\\")k++;else if(src[k]==="$"&&src[k+1]==="("){const f=ferme(src,k);if(f<0){k=n;break;}k=f-1;}}
      if(k>=n)throw {err:`Ligne ${l} : un guillemet " n'est pas refermé.`};aj(src.slice(i,k+1));i=k+1;}
    else if(x==="$"&&d==="("){const f=ferme(src,i);if(f<0)throw {err:`Ligne ${l} : la parenthèse de ${src[i+2]==="("?"$(( … ))":"$( … )"} n'est pas refermée.`};aj(src.slice(i,f));i=f;}
    else if(x==="$"&&d==="{"){const k=src.indexOf("}",i);if(k<0)throw {err:`Ligne ${l} : l'accolade de \${ n'est pas refermée.`};aj(src.slice(i,k+1));i=k+1;}
    else if(x==="|"){op(d==="|"?"||":"|");i+=d==="|"?2:1;}
    else if(x==="&"){if(d!=="&")throw {inconnu:"Le site ne connaît pas & seul : écris les commandes l'une après l'autre."};op("&&");i+=2;}
    else if(x===";"){if(d===";")throw {inconnu:"Le site ne connaît pas case … esac : écris des if."};op(";");i++;}
    else if(x==="<"){if(d==="<")throw {inconnu:"Le site ne connaît pas << : mets les lignes dans un fichier."};op("<");i++;}
    else if(x===">"){if(w==="2"){w=null;op("2>");}else op(d===">"?">>":">");i+=d===">"?2:1;}
    else if(x==="`")throw {inconnu:"Écris le résultat d'une commande avec $( … ), pas entre accents graves."};
    else if(x==="("||x===")")throw {inconnu:x==="("&&d==="("?"Le site ne connaît pas (( … )) : écris un test avec [[ … ]], et un calcul avec $(( … )).":w!==null&&d===")"?"Le site ne connaît pas les fonctions bash : écris le script sans fonction.":"Le site ne connaît pas les parenthèses seules : écris le script sans sous-shell."};
    else{aj(x);i++;}}
  fin();return T;}
function analyse(T){let i=0;
  const lg=()=>(T[i]||T[T.length-1]||{l:1}).l,mot=w=>T[i]&&T[i].w===w,sep=()=>T[i]&&(T[i].op===";"||T[i].op==="\n"),saute=()=>{while(sep())i++;};
  const ici=()=>!T[i]?"la fin du script":T[i].w!==undefined?`« ${T[i].w} »`:T[i].op==="\n"?"la fin de la ligne":`« ${T[i].op} »`;
  const attend=(w,pq)=>{if(!mot(w))throw {err:`Ligne ${lg()} : il manque ${w} ${pq} (bash trouve ${ici()} à la place).`};i++;};
  function liste(stop){const L=[];saute();
    while(i<T.length&&!stop.includes(T[i].w)){L.push(etou());if(i<T.length&&!sep()&&!stop.includes(T[i].w))throw {err:`Ligne ${lg()} : bash ne s'attend pas à ${ici()} ici.`};saute();}
    return L;}
  const bloc=(stop,quoi)=>{const L=liste(stop);if(!L.length)throw {err:`Ligne ${lg()} : ${quoi} est vide : bash veut au moins une commande.`};return L;};
  function etou(){const P=[tube()];while(T[i]&&(T[i].op==="&&"||T[i].op==="||")){P.push(T[i++].op);while(T[i]&&T[i].op==="\n")i++;P.push(tube());}return P;}
  function tube(){const C=[cmd()];while(T[i]&&T[i].op==="|"){i++;while(T[i]&&T[i].op==="\n")i++;C.push(cmd());}
    if(C.length>1&&C.some(c=>!c.simple||(c.W&&c.W[0]==="read")))throw {inconnu:"Le site ne connaît pas un tube vers une boucle ou vers read : écris la boucle avec done < fichier."};return C;}
  function cmd(){const t=T[i];if(!t)throw {err:`Ligne ${lg()} : il manque une commande à la fin.`};
    if(t.op)throw {err:`Ligne ${t.l} : bash ne s'attend pas à ${ici()} ici.`};const w=t.w;
    if(w==="if"){i++;const B=[];let c=bloc(["then"],"la condition du if");attend("then","après la condition du if");B.push([c,bloc(["elif","else","fi"],"le bloc du then")]);
      while(mot("elif")){i++;c=bloc(["then"],"la condition du elif");attend("then","après la condition du elif");B.push([c,bloc(["elif","else","fi"],"le bloc du then")]);}
      let sinon=null;if(mot("else")){i++;sinon=bloc(["fi"],"le bloc du else");}attend("fi","pour fermer le if");return {si:B,sinon};}
    if(w==="for"){i++;const v=T[i]&&T[i].w;
      if(v===undefined||!/^[A-Za-z_]\w*$/.test(v))throw v!==undefined&&/^\(\(/.test(v)?{inconnu:"Le site ne connaît pas for (( … )) : écris for i in $(seq 1 n), ou une boucle while."}:{err:`Ligne ${t.l} : après for, il faut le nom de la variable, sans $ : for f in …`};
      i++;let M=null;if(mot("in")){i++;M=[];while(T[i]&&T[i].w!==undefined)M.push(T[i++].w);}
      if(!sep()&&!mot("do"))throw {err:`Ligne ${lg()} : bash ne s'attend pas à ${ici()} après la liste du for.`};saute();attend("do","après la ligne du for");
      const corps=bloc(["done"],"le corps de la boucle");attend("done","pour fermer la boucle for");return {pour:v,M,corps};}
    if(w==="while"||w==="until"){i++;const c=bloc(["do"],`la condition du ${w}`);attend("do",`après la condition du ${w}`);const corps=bloc(["done"],"le corps de la boucle");attend("done",`pour fermer la boucle ${w}`);
      let lit=null;if(T[i]&&T[i].op==="<"){i++;if(!T[i]||T[i].w===undefined)throw {err:`Ligne ${lg()} : après <, il faut le nom d'un fichier.`};lit=T[i++].w;}
      return {tant:w==="while",c,corps,lit};}
    if(/^(then|do|done|fi|elif|else|in)$/.test(w))throw {err:`Ligne ${t.l} : ${w} arrive au mauvais endroit${/^(then|fi|elif|else)$/.test(w)?", sans if ouvert avant":/^(do|done)$/.test(w)?", sans boucle ouverte avant":""}.`};
    if(/^(case|esac|function|select|\{|\})$/.test(w))throw {inconnu:`Le site ne connaît pas ${w} : écris le script avec if, for et while.`};
    if(w==="[["){i++;const X=[];while(T[i]&&T[i].w!=="]]"&&T[i].op!=="\n"&&T[i].op!==";")X.push(T[i++]);
      if(!mot("]]"))throw {err:`Ligne ${t.l} : il manque ]] pour fermer le test${X.some(x=>/\]\]$/.test(x.w||""))?" : ici ]] est collé au mot d'avant, il faut une espace entre les deux":", avec une espace avant"}.`};i++;return {simple:true,test:X};}
    const W=[],red=[];
    while(T[i]&&(T[i].w!==undefined||/^(<|>|>>|2>)$/.test(T[i].op))){if(T[i].op){const o=T[i++].op;if(!T[i]||T[i].w===undefined)throw {err:`Ligne ${t.l} : après ${o}, il faut le nom d'un fichier.`};red.push([o,T[i++].w]);}else W.push(T[i++].w);}
    return {simple:true,W,red,l:t.l};}
  return liste([]);}
const clone7=t=>JSON.parse(JSON.stringify(t)),ech7=s=>s.replace(/[*?[\]\\]/g,"\\$&");
function param(nm,X){if(nm==="#")return String(X.A.length);if(nm==="?")return String(X.st);if(nm==="0")return X.nom;if(/^\d+$/.test(nm))return X.A[+nm-1]||"";return X.V[nm]!==undefined?X.V[nm]:nm==="HOME"?ACCUEIL:"";}
/* un mot en morceaux : {s, q: entre guillemets, v: vient d'un $} ou {at: les paramètres de $@ et $*} */
function morceaux(w,X){const P=[],n=w.length;let i=0;
  const dollar=(j,q)=>{const d=w[j+1];
    if(d==="("){const f=ferme(w,j),ar=w[j+2]==="(",dedans=w.slice(j+(ar?3:2),f-(ar?2:1));P.push({s:ar?String(arith(dedans,X)):sous(dedans,X),q,v:1});return f;}
    if(d==="{"){const k=w.indexOf("}",j),e=w.slice(j+2,k);let m;
      if((m=/^#([A-Za-z_]\w*|\d)$/.exec(e)))P.push({s:String(param(m[1],X).length),q,v:1});
      else if(e==="@"||e==="*")P.push({at:X.A.slice(),q,etoile:e==="*"});
      else if(/^([A-Za-z_]\w*|\d+|[#?])$/.test(e))P.push({s:param(e,X),q,v:1});
      else throw {inconnu:`Le site ne connaît pas \${${e}} : écris \${nom} ou $nom.`};
      return k+1;}
    if(d==="@"||d==="*"){P.push({at:X.A.slice(),q,etoile:d==="*"});return j+2;}
    const m=/^([A-Za-z_]\w*|[0-9#?])/.exec(w.slice(j+1));if(!m){P.push({s:"$",q:true});return j+1;}
    P.push({s:param(m[1],X),q,v:1});return j+1+m[1].length;};
  while(i<n){const x=w[i];
    if(x==="'"){const k=w.indexOf("'",i+1);P.push({s:w.slice(i+1,k),q:true});i=k+1;}
    else if(x==='"'){const avant=P.length;let j=i+1,b="";const vide=()=>{if(b){P.push({s:b,q:true});b="";}};
      while(j<n&&w[j]!=='"'){if(w[j]==="\\"&&'$`"\\'.includes(w[j+1])){b+=w[j+1];j+=2;}else if(w[j]==="$"){vide();j=dollar(j,true);}else b+=w[j++];}
      vide();if(P.length===avant)P.push({s:"",q:true});i=j+1;}
    else if(x==="\\"){P.push({s:w[i+1]||"",q:true});i+=2;}
    else if(x==="$")i=dollar(i,false);
    else if(x==="~"&&i===0&&(n===1||w[1]==="/")){P.push({s:ACCUEIL,q:true});i++;}
    else{P.push({s:x,q:false});i++;}}
  return P;}
/* les mots que reçoit la commande : découpe aux espaces de ce qui vient d'un $ hors guillemets, puis motifs * ? [ ] */
function champs7(P){const F=[];let c=null;const cur=()=>c||(c={s:"",p:"",g:false}),pousse=()=>{if(c){F.push(c);c=null;}};
  const libre=s=>s.split(/[ \t\n]+/).forEach((m,j)=>{if(j)pousse();if(m){const y=cur();y.s+=m;y.p+=m;if(/[*?[]/.test(m))y.g=true;}});
  for(const x of P){
    if(x.at){if(x.q&&!x.etoile)x.at.forEach((a,j)=>{if(j)pousse();const y=cur();y.s+=a;y.p+=ech7(a);});else if(x.q){const y=cur(),s=x.at.join(" ");y.s+=s;y.p+=ech7(s);}else libre(x.at.join(" "));}
    else if(x.q){const y=cur();y.s+=x.s;y.p+=ech7(x.s);}
    else if(x.v)libre(x.s);
    else{const y=cur();y.s+=x.s;y.p+=x.s;if(/[*?[]/.test(x.s))y.g=true;}}
  pousse();return F;}
function glob7(c,X){if(!c.g)return [c.s];const p=c.p,k=p.lastIndexOf("/"),dir=k<0?"":p.slice(0,k),base=p.slice(k+1);
  if(/(^|[^\\])[*?[]/.test(dir))throw {inconnu:"Le site ne développe *, ? et [ ] que dans le dernier morceau d'un chemin, comme dans dossier/*.txt."};
  const dl=dir.replace(/\\(.)/g,"$1"),x=noeud(X.T,absolu(k<0?".":dl||"/"));if(!x||!x.d||!base)return [c.s];
  let re;try{re=motifRe(base);}catch(e){return [c.s];}
  const L=x.d.map(y=>y.n).filter(m=>(m[0]!=="."||base[0]===".")&&re.test(m)).sort();
  return L.length?L.map(m=>(k<0?"":dl+"/")+m):[c.s];}
const dev7=(w,X)=>champs7(morceaux(w,X)).flatMap(c=>glob7(c,X));
const un7=(w,X)=>morceaux(w,X).map(x=>x.at?x.at.join(" "):x.s).join("");
const motif7=(w,X)=>morceaux(w,X).map(x=>x.at?ech7(x.at.join(" ")):x.q?ech7(x.s):x.s).join("");
function sous(t,X){const Y=Object.assign({},X,{V:Object.assign({},X.V),out:[],entree:null});
  try{jouer(analyse(lexe(t)),Y);}catch(e){if(!e||!e.fin)throw e;}
  X.pas=Y.pas;X.st=Y.st;return Y.out.join("\n").replace(/\n+$/,"");}
/* $(( )) : entiers, variables, + - * / % **, comparaisons, && || !, et la virgule */
function arith(src,X,prof){prof=prof||0;const dit=`Dans $(( ${src.trim()} ))`;
  if(prof>20)throw {err:`${dit}, une variable se calcule à partir d'elle-même, sans fin.`};
  if(/\$\(/.test(src))throw {inconnu:"Le site ne connaît pas $( ) à l'intérieur de $(( )) : range d'abord le résultat dans une variable."};
  const s=src.replace(/\$\{?([A-Za-z_]\w*|[0-9#?])\}?/g,(m,nm)=>param(nm,X)),re=/\s*(\d+|[A-Za-z_]\w*|\*\*|<=|>=|==|!=|&&|\|\||[-+*\/%()<>!,])/y,T=[];let k=0;
  while(k<s.length){if(/^\s*$/.test(s.slice(k)))break;re.lastIndex=k;const m=re.exec(s);
    if(!m)throw {err:`${dit}, bash ne sait pas lire « ${s.slice(k).trim()} » : on n'y écrit que des nombres entiers, des noms de variables et des opérations.`};T.push(m[1]);k=re.lastIndex;}
  if(!T.length)return 0;let i=0;
  const calc=(o,a,b)=>{if((o==="/"||o==="%")&&b===0)throw {err:`${dit}, il y a une division par 0.`};
    return {"*":a*b,"/":Math.trunc(a/b),"%":a%b,"+":a+b,"-":a-b,"<":+(a<b),"<=":+(a<=b),">":+(a>b),">=":+(a>=b),"==":+(a===b),"!=":+(a!==b),"&&":+(!!a&&!!b),"||":+(!!a||!!b),",":b}[o];};
  const prim=()=>{const t=T[i++];if(t===undefined)throw {err:`${dit}, le calcul s'arrête trop tôt : il manque un nombre.`};
    if(t==="("){const v=virg();if(T[i++]!==")")throw {err:`${dit}, une parenthèse n'est pas refermée.`};return v;}
    if(t==="-")return -prim();if(t==="+")return prim();if(t==="!")return prim()?0:1;
    if(/^\d/.test(t))return parseInt(t,10);
    if(/^[A-Za-z_]/.test(t)){const v=X.V[t]!==undefined?X.V[t]:"";return v.trim()===""?0:arith(v,X,prof+1);}
    throw {err:`${dit}, bash ne s'attend pas à « ${t} » ici.`};};
  const niv=(ops,sous2)=>()=>{let v=sous2();while(ops.includes(T[i])){const o=T[i++];v=calc(o,v,sous2());}return v;};
  const pow=()=>{const b=prim();if(T[i]==="**"){i++;return Math.pow(b,pow());}return b;};
  const mul=niv(["*","/","%"],pow),add=niv(["+","-"],mul),cmp=niv(["<","<=",">",">="],add),eq=niv(["==","!="],cmp),et2=niv(["&&"],eq),ou=niv(["||"],et2),virg=niv([","],ou);
  const v=virg();if(i<T.length)throw {err:`${dit}, bash ne s'attend pas à « ${T[i]} » ici.`};return v;}
function unaire(o,s,X){const x=s===""?null:noeud(X.T,absolu(s));
  return {"-f":!!x&&!x.d,"-d":!!x&&!!x.d,"-e":!!x,"-s":!!x&&!x.d&&!!x.c,"-r":!!x,"-w":!!x,"-x":!!x&&!!x.d,"-z":s==="","-n":s!==""}[o];}
function test7(L,X){let i=0;const W=k=>L[k]&&L[k].w;
  const ou=()=>{let v=et2();while(L[i]&&L[i].op==="||"){i++;const b=et2();v=v||b;}return v;},et2=()=>{let v=non();while(L[i]&&L[i].op==="&&"){i++;const b=non();v=v&&b;}return v;};
  const non=()=>{if(W(i)==="!"){i++;return !non();}return prim();};
  const prim=()=>{const a=W(i);if(a===undefined)throw {err:"Le test [[ … ]] est vide ou mal écrit."};
    const b=L[i+1],o=!b?null:b.op==="<"||b.op===">"?b.op:/^(==|=|!=|-eq|-ne|-lt|-le|-gt|-ge|=~)$/.test(b.w||"")?b.w:null;
    if(o&&W(i+2)!==undefined){const y=W(i+2),x=un7(a,X);i+=3;
      if(o==="=~")throw {inconnu:"Le site ne connaît pas =~ : compare avec == et un motif, comme [[ $f == *.txt ]]."};
      if(o==="=="||o==="="||o==="!="){const ok=motifRe(motif7(y,X)).test(x);return o==="!="?!ok:ok;}
      if(o==="<"||o===">"){const z=un7(y,X);return o==="<"?x<z:x>z;}
      const p=arith(x,X),q=arith(un7(y,X),X);return {"-eq":p===q,"-ne":p!==q,"-lt":p<q,"-le":p<=q,"-gt":p>q,"-ge":p>=q}[o];}
    if(/^-[a-zA-Z]$/.test(a)&&W(i+1)!==undefined){const r=unaire(a,un7(W(i+1),X),X);if(r===undefined)throw {inconnu:`Le site ne connaît pas le test ${a}.`};i+=2;return r;}
    i++;return un7(a,X)!=="";};
  const v=ou();if(i<L.length)throw {err:`Le test [[ … ]] est mal écrit près de « ${L[i].w||L[i].op} »${/^-/.test(L[i].w||"")?" : il manque peut-être une valeur, ou un $":""}.`};return v;}
/* [ … ] et test, sur les mots déjà développés, avec les règles de bash selon le nombre de mots */
function posix(A,X){const n=A.length,ent=s=>{if(!/^\s*-?\d+\s*$/.test(s))throw {avert:`[ : ${s||"(vide)"} : il faut un nombre entier (integer expression expected)`};return parseInt(s,10);};
  const bin=(a,o,b)=>o==="="||o==="=="?a===b:o==="!="?a!==b:o==="-a"?a!==""&&b!=="":o==="-o"?a!==""||b!=="":/^-(eq|ne|lt|le|gt|ge)$/.test(o)?(([p,q])=>({"-eq":p===q,"-ne":p!==q,"-lt":p<q,"-le":p<=q,"-gt":p>q,"-ge":p>=q})[o])([ent(a),ent(b)]):undefined;
  if(!n)return false;if(n===1)return A[0]!=="";
  if(n===2){if(A[0]==="!")return A[1]==="";const r=unaire(A[0],A[1],X);if(r===undefined)throw {avert:`[ : ${A[0]} : il faut un test comme -f ou -d (unary operator expected)`};return r;}
  if(n===3){const r=bin(A[0],A[1],A[2]);if(r!==undefined)return r;if(A[0]==="!")return !posix(A.slice(1),X);throw {avert:`[ : ${A[1]} : il faut un opérateur comme = ou -eq (binary operator expected)`};}
  const k=A.lastIndexOf("-o");if(k>0)return posix(A.slice(0,k),X)||posix(A.slice(k+1),X);const j=A.lastIndexOf("-a");if(j>0)return posix(A.slice(0,j),X)&&posix(A.slice(j+1),X);
  if(A[0]==="!")return !posix(A.slice(1),X);throw {avert:"[ : trop de mots dans le test (too many arguments)"};}
const echec=(X,m,st)=>{X.avert.push(m);return {L:[],st:st||1};};
function fichiers7(nom,A,X){const O=A.filter(a=>/^-./.test(a)).join("").replace(/-/g,""),F=A.filter(a=>!/^-./.test(a)),T=X.T;
  if((nom==="rm"&&/[^rRf]/.test(O))||(nom==="mkdir"&&/[^p]/.test(O))||(O&&!/^(rm|mkdir)$/.test(nom)))throw {inconnu:`Le site ne connaît pas l'option -${O} de ${nom}.`};
  const ou=p=>{const a=absolu(p),k=a.lastIndexOf("/"),par=noeud(T,a.slice(0,k)||"/");return {a,n:a.slice(k+1),par:par&&par.d?par:null,x:noeud(T,a)};};
  const ote=o=>o.par.d.splice(o.par.d.indexOf(o.x),1);let st=0;const pb=m=>{X.avert.push(`${nom} : ${m}`);st=1;};
  if(!F.length)return echec(X,`${nom} : il manque le nom du fichier.`);
  if(nom==="touch")for(const f of F){const o=ou(f);if(!o.x){if(o.par)o.par.d.push({n:o.n,c:""});else pb(`${f} : le dossier n'existe pas`);}}
  if(nom==="mkdir")for(const f of F){const o=ou(f);if(o.x){if(!O)pb(`${f} existe déjà`);continue;}
    if(o.par)o.par.d.push({n:o.n,d:[]});
    else if(O){let t=T;for(const s of o.a.split("/").filter(Boolean)){let y=t.d.find(z=>z.n===s);if(!y){y={n:s,d:[]};t.d.push(y);}if(!y.d){pb(`${f} : ${s} n'est pas un dossier`);break;}t=y;}}
    else pb(`${f} : le dossier parent n'existe pas`);}
  if(nom==="rm")for(const f of F){const o=ou(f);if(!o.x){if(!/f/.test(O))pb(`${f} : aucun fichier de ce nom`);continue;}
    if(o.x.d&&!/[rR]/.test(O)){pb(`${f} est un dossier`);continue;}if(o.a===COURANT||COURANT.startsWith(o.a+"/")||!o.par){pb(`${f} : refusé`);continue;}ote(o);}
  if(nom==="mv"||nom==="cp"){if(F.length<2)return echec(X,`${nom} : il manque la destination.`);const D=ou(F[F.length-1]),dans=!!(D.x&&D.x.d);
    if(F.length>2&&!dans)return echec(X,`${nom} : ${F[F.length-1]} n'est pas un dossier`);
    for(const f of F.slice(0,-1)){const S=ou(f);if(!S.x){pb(`${f} : aucun fichier de ce nom`);continue;}if(nom==="cp"&&S.x.d){pb(`${f} est un dossier (il faudrait -r)`);continue;}
      const par=dans?D.x:D.par,n=dans?S.n:D.n;if(!par){pb(`${F[F.length-1]} : le dossier n'existe pas`);continue;}if(par===S.x){pb(`${f} : un dossier ne va pas dans lui-même`);continue;}
      const vieux=par.d.find(z=>z.n===n);if(vieux===S.x)continue;if(vieux&&vieux.d){pb(`${n} est un dossier`);continue;}
      if(vieux)par.d.splice(par.d.indexOf(vieux),1);const y=nom==="cp"?clone7(S.x):S.x;if(nom==="mv")ote(S);y.n=n;par.d.push(y);}}
  return {L:[],st};}
const CMD7=new Set(["echo","read","exit","shift","let","true","false","test","seq","basename","dirname","mv","cp","rm","touch","mkdir","cd"]);
function commande7(W,E,X){const nom=W[0],A=W.slice(1);
  if(nom==="echo"){if(/^-[neE]+$/.test(A[0]||""))throw {inconnu:"Écris echo sans option : le site ne connaît pas echo -n ni echo -e."};return {L:A.join(" ").split("\n"),st:0};}
  if(nom==="read"){const N=A.filter(a=>a!=="-r"),mal=N.find(a=>!/^[A-Za-z_]\w*$/.test(a));if(mal!==undefined)throw {err:`read : « ${mal} » n'est pas un nom de variable. On écrit read ligne, sans $.`};
    const src=E?{L:E,k:0}:X.entree;if(!src||src.k>=src.L.length){N.forEach(a=>{X.V[a]="";});return {L:[],st:1};}
    let s=src.L[src.k++];const ifs=X.V.IFS!==undefined?X.V.IFS:" \t\n",bl=/^[ \t\n]+$/.test(ifs),noms=N.length?N:["REPLY"];
    noms.forEach((a,j)=>{if(bl)s=s.replace(/^[ \t]+/,"");if(j===noms.length-1){X.V[a]=bl?s.replace(/[ \t]+$/,""):s;return;}
      let k=0;while(k<s.length&&!ifs.includes(s[k]))k++;X.V[a]=s.slice(0,k);s=s.slice(k+1);});
    return {L:[],st:0};}
  if(nom==="exit")throw {fin:true,st:+A[0]||0};
  if(nom==="shift"){X.A=X.A.slice(A.length?+A[0]:1);return {L:[],st:0};}
  if(nom==="let"){let v=0;for(const a of A){const m=/^([A-Za-z_]\w*)\s*=(.*)$/.exec(a);if(m){v=arith(m[2],X);X.V[m[1]]=String(v);}else v=arith(a,X);}return {L:[],st:v?0:1};}
  if(nom==="true")return {L:[],st:0};if(nom==="false")return {L:[],st:1};
  if(nom==="test"||nom==="["){if(nom==="["&&A[A.length-1]!=="]")throw {err:`Il manque ] à la fin du test [ … ], avec une espace avant${A.some(a=>/\]$/.test(a))?" : ici ] est collé au mot d'avant":""}.`};
    try{return {L:[],st:posix(nom==="["?A.slice(0,-1):A,X)?0:1};}catch(e){if(e&&e.avert){X.avert.push(e.avert);return {L:[],st:2};}throw e;}}
  if(nom==="seq"){const N=A.map(Number);if(!A.length||A.length>3||N.some(x=>!Number.isInteger(x)))throw {inconnu:"Écris seq n, ou seq début fin, avec des nombres entiers."};
    const [a,p,b]=A.length===1?[1,1,N[0]]:A.length===2?[N[0],1,N[1]]:N,L=[];if(p===0)throw {err:"seq : le pas ne peut pas être 0."};for(let x=a;p>0?x<=b:x>=b;x+=p){L.push(String(x));if(L.length>PAS7)break;}return {L,st:0};}
  if(nom==="basename"||nom==="dirname"){if(!A.length)return echec(X,`${nom} : il manque le chemin.`);let s=A[0].replace(/(.)\/+$/,"$1");
    if(nom==="basename"){s=s.split("/").pop()||"/";if(A[1]&&s!==A[1]&&s.endsWith(A[1]))s=s.slice(0,-A[1].length);}
    else{const k=s.lastIndexOf("/");s=k<0?".":k===0?"/":s.slice(0,k).replace(/\/+$/,"")||"/";}
    return {L:[s],st:0};}
  if(/^(mv|cp|rm|touch|mkdir)$/.test(nom))return fichiers7(nom,A,X);
  if(nom==="cd")throw {inconnu:"Le site ne connaît pas cd dans un script : écris les chemins en entier, par exemple $1/$f."};
  if(Object.prototype.hasOwnProperty.call(SHT,nom)&&!/^(more|less|tee)$/.test(nom)){const r=SHT[nom](A,E,X.T,nom);if(r.L)return {L:r.L,st:nom==="grep"&&(!r.L.length||r.L[0]==="0")?1:0};if(r.err)return echec(X,r.err);throw {inconnu:r.inconnu};}
  return null;}
function ecrit7(X,o,f,L){if(f==="/dev/null")return 0;const a=absolu(f),k=a.lastIndexOf("/"),par=noeud(X.T,a.slice(0,k)||"/");
  if(!par||!par.d){X.avert.push(`${f} : aucun dossier de ce nom`);return 1;}let x=par.d.find(y=>y.n===a.slice(k+1));if(x&&x.d){X.avert.push(`${f} est un dossier`);return 1;}
  if(!x){x={n:a.slice(k+1),c:""};par.d.push(x);}const s=L.map(l=>l+"\n").join("");x.c=o===">>"?(x.c||"")+s:s;return 0;}
const compte=X=>{if(++X.pas>PAS7)throw {err:`Le script ne s'arrête pas : après ${PAS7} commandes, il tourne encore. Regarde ce qui change à chaque tour, et quand la condition devient fausse.`};};
function simple7(c,E,X){compte(X);
  if(c.test)return {L:[],st:test7(c.test,X)?0:1};
  const W0=c.W;let k=0;while(k<W0.length&&/^[A-Za-z_]\w*=/.test(W0[k]))k++;
  const aff=W0.slice(0,k).map(a=>{const j=a.indexOf("=");return [a.slice(0,j),a.slice(j+1)];});
  if(k===W0.length){X.st=0;for(const [n,v] of aff)X.V[n]=un7(v,X);return {L:[],st:X.st};}
  const b=W0[k];
  if(aff.length&&aff[aff.length-1][1]===""&&b!=="read")throw {err:`Ligne ${c.l} : « ${W0[k-1]} ${b} » : il y a une espace après le signe =. Une affectation s'écrit collée : ${W0[k-1]}${b}.`};
  if(/^\$[A-Za-z_]\w*=/.test(b))throw {err:`Ligne ${c.l} : « ${b} » : pour changer une variable, on écrit son nom sans $ devant : ${b.slice(1)}.`};
  if(/^[A-Za-z_]\w*$/.test(b)&&/^=/.test(W0[k+1]||"")&&!SHT[b]&&!CMD7.has(b))throw {err:`Ligne ${c.l} : « ${b} ${W0[k+1]} » : bash lit ${b} comme le nom d'une commande. Une affectation s'écrit sans espace autour du signe = : ${b}${W0[k+1]==="="?"="+(W0[k+2]||"…"):W0[k+1]}.`};
  if(/^\[\[?./.test(b)&&!/^\[\[?$/.test(b))throw {err:`Ligne ${c.l} : « ${b} » : il faut une espace après ${b[1]==="["?"[[":"["}.`};
  const sauve=aff.map(([n])=>[n,X.V[n]]),remet=()=>{for(const [n,v] of sauve)if(v===undefined)delete X.V[n];else X.V[n]=v;};
  for(const [n,v] of aff)X.V[n]=un7(v,X);
  const W=[];for(const w of W0.slice(k))W.push(...dev7(w,X));
  let ent=E,vers=null;
  for(const [o,f0] of c.red){const f=un7(f0,X);
    if(o==="2>"){if(f!=="/dev/null")throw {inconnu:"Le site ne connaît que 2>/dev/null pour les messages d'erreur."};continue;}
    if(o==="<"){const x=noeud(X.T,absolu(f));if(!x||x.d){remet();return echec(X,`${f} : aucun fichier de ce nom`);}ent=contenu(x);}else vers=[o,f];}
  let r=W.length?commande7(W,ent,X):{L:[],st:0};remet();
  if(r===null)throw {err:`Ligne ${c.l} : ${W[0]} : commande introuvable (command not found).${/\.sh$/.test(W[0])?" Le site ne lance pas d'autre script.":""}`};
  if(vers)r={L:[],st:ecrit7(X,vers[0],vers[1],r.L)||r.st};
  return r;}
function jouer(L,X){for(const P of L){tube7(P[0],X);for(let k=1;k<P.length;k+=2)if((P[k]==="&&")===(X.st===0))tube7(P[k+1],X);}}
function tube7(C,X){if(!C[0].simple)return compose(C[0],X);let E=null,r=null;for(const c of C){r=simple7(c,E,X);E=r.L;}X.out.push(...E);X.st=r.st;}
function compose(c,X){
  if(c.si){for(const [cond,corps] of c.si){jouer(cond,X);if(X.st===0)return jouer(corps,X);}if(c.sinon)jouer(c.sinon,X);else X.st=0;return;}
  if(c.pour){const M=c.M===null?X.A.slice():c.M.flatMap(w=>dev7(w,X));X.st=0;for(const v of M){compte(X);X.V[c.pour]=v;jouer(c.corps,X);}return;}
  const avant=X.entree;if(c.lit!==null){const f=un7(c.lit,X),x=noeud(X.T,absolu(f));if(!x||x.d){echec(X,`${f} : aucun fichier de ce nom`);X.st=1;return;}X.entree={L:contenu(x),k:0};}
  let st=0;for(;;){jouer(c.c,X);if((X.st===0)!==c.tant)break;compte(X);jouer(c.corps,X);st=X.st;}X.st=st;X.entree=avant;}
/* rend {sortie: lignes affichées, T: l'arborescence après le script, avert: messages d'erreur de bash}, ou {err}, ou {inconnu} */
function lanceScript(src,T0,A,nom){const X={V:{},A:(A||[]).slice(),nom:"./"+nom,T:clone7(T0),out:[],st:0,pas:0,avert:[],entree:null};
  try{jouer(analyse(lexe(String(src).replace(/\r/g,""))),X);}
  catch(e){if(!(e&&e.fin)){if(e&&(e.err||e.inconnu))return {err:e.err,inconnu:e.inconnu};if(e instanceof RangeError)return {err:"Le script se rappelle sans fin."};throw e;}}
  return {sortie:X.out,T:X.T,avert:X.avert};}
G.usi.lanceScript=lanceScript;
const etat7=T=>{const L=[];(function va(x,p){for(const y of x.d||[]){const q=p+y.n;if(y.d){L.push(q+"/");va(y,q+"/");}else L.push(q);}})(noeud(T,COURANT),"");return L.sort();};

/* les exercices : chaque modèle rend le script de la correction en étapes [code, pourquoi, points], les essais, les autres écritures justes et les pièges [nom, morceau, remplacé par, explication] */
const MOTS7=PRENOMS.split(" "),PROD7="stylo cahier gomme regle classeur trousse agenda crayon feutre colle".split(" ");
const NB7=(R,n,a,b)=>{const S=new Set();while(S.size<n)S.add(R.ent(a,b));return [...S];};
const fx7=x=>typeof x==="string"?{n:x,c:""}:x.d?{n:x.n,d:x.d.map(fx7)}:x,arbo7=L=>arboDe(L.map(fx7)),dos7=(n,L)=>({n,d:L});
const BASES7="notes cours tp1 tp2 calcul main util pile rapport photo data todo essai jeu memo image td3 liste bilan agenda".split(" "),EXTS7=[".txt",".py",".c",".pdf",".jpg",".csv",".sh"];
const noms7=(R,ext,k,j)=>{const B=R.mel(BASES7);return R.mel(B.slice(0,k).map(b=>b+ext).concat(B.slice(k,k+j).map(b=>b+R.choix(EXTS7.filter(e=>e!==ext)))));};
const SHEB=["#!/bin/bash","La première ligne dit quel programme lit le script : bash. Elle n'affiche rien.",0.5];
const BOUCLE7=[[/^(?![\s\S]*\b(for|while|until)\b)/,"L'énoncé demande une boucle : écris-la avec for ou while."]];
const S7=[
[0,"paramètres",R=>{const A=R.mel(MOTS7).slice(0,R.ent(2,4)),n=A.length,k=R.ent(1,n);
  return {nom:"params.sh",A,pas:[SHEB,...R.mel([
    [`echo "$# paramètres"`,`${cr("$#")} est le nombre de paramètres : ${n}. Le nom du script ne compte pas.`],
    [`echo "Le numéro ${k} : $${k}"`,`${cr("$"+k)} est le ${ORD(k)} paramètre, ${cr(A[k-1])}.`],
    [`echo "Lancé par $0"`,`${cr("$0")} est le nom du script, tel qu'on l'a tapé : ${cr("./params.sh")}.`]]).slice(0,R.ent(2,3))],
   mut:[["nom du script compté avec les paramètres",`"$# paramètres"`,`"$(($#+1)) paramètres"`,`${cr("$#")} compte seulement les paramètres : le nom du script, ${cr("$0")}, n'en fait pas partie.`],
    ["paramètres comptés à partir de 0",`: $${k}"`,`: $${k+1}"`,`Les paramètres se comptent à partir de 1 : ${cr("$1")} est le premier mot après le nom du script.`],
    ["nom du script lu comme le premier paramètre",`par $0"`,`par $1"`,`${cr("$0")} est le nom du script lui-même, pas son premier paramètre.`]],
   fin:`Les paramètres sont les mots tapés après le nom du script : ${et(A.map(cr))}.`};}],
[0,"guillemets",R=>{const x=R.choix(["nom","prenom","ami","qui"]),v=R.choix(MOTS7),m=R.choix(["Bonjour","Salut","Coucou"]);
  return {nom:"salut.sh",A:[],pas:[SHEB,[`${x}=${v}`,`Une affectation, sans espace autour de ${cr("=")} : la variable ${cr(x)} contient ${cr(v)}. Rien ne s'affiche.`],...R.mel([
    [`echo "${m} $${x}"`,`Entre guillemets, ${cr("$"+x)} est remplacé par sa valeur : ${cr(m+" "+v)}.`],
    [`echo '${m} $${x}'`,`Entre apostrophes, rien n'est remplacé : la ligne s'affiche telle quelle, avec le ${cr("$")}.`],
    [`echo ${m} ${x}`,`Sans ${cr("$")} devant, ${cr(x)} est un mot comme un autre : il s'affiche tel quel.`]]).slice(0,R.ent(2,3))],
   mut:[["apostrophes lues comme des guillemets",`'${m} $${x}'`,`"${m} $${x}"`,`Entre apostrophes, bash ne remplace rien : ${cr("$"+x)} reste écrit tel quel.`],
    ["guillemets lus comme des apostrophes",`"${m} $${x}"`,`'${m} $${x}'`,`Entre guillemets, bash remplace ${cr("$"+x)} par la valeur de la variable.`],
    ["mot lu comme une variable",`echo ${m} ${x}`,`echo ${m} $${x}`,`Sans ${cr("$")}, ${cr(x)} n'est pas une variable : c'est un simple mot.`]]};}],
[0,"calcul",R=>{const a=R.ent(5,19),b=R.ent(2,6),o=R.choix(["+","-","*","/","%"]),val=o==="+"?a+b:o==="-"?a-b:o==="*"?a*b:o==="/"?Math.trunc(a/b):a%b;
  return {nom:"calcul.sh",A:[],pas:[SHEB,[`a=${a}\nb=${b}`,`Deux affectations : ${cr("a")} contient ${a} et ${cr("b")} contient ${b}. Rien ne s'affiche.`],...R.mel([
    [`echo $a+$b`,`Sans ${cr("$(( ))")}, bash ne calcule rien : il remplace ${cr("$a")} et ${cr("$b")} par leurs valeurs et garde le signe, ce qui donne ${cr(a+"+"+b)}.`],
    [`echo $((a ${o} b))`,`${cr("$(( ))")} calcule sur des entiers : ${cr(a+" "+o+" "+b)} vaut ${val}.${o==="/"?" La division est entière : ce qui est après la virgule est jeté.":o==="%"?` ${cr("%")} donne le reste de la division.`:""}`]]),
    [`c=$((a + b))\necho "c vaut $c"`,`${cr("c")} reçoit ${a+b}, puis, entre guillemets, ${cr("$c")} est remplacé par sa valeur.`]],
   mut:[["calcul sans les doubles parenthèses",`echo $a+$b`,`echo $((a+b))`,`Sans ${cr("$(( ))")}, ${cr("$a+$b")} n'est pas un calcul : bash colle les valeurs et le signe, comme du texte.`],
    ["opération affichée au lieu du résultat",`echo $((a ${o} b))`,`echo "$a ${o} $b"`,`${cr("$(( ))")} fait le calcul : on voit le résultat, pas l'opération.`],
    ...(o==="/"&&a%b?[["division avec virgule",`echo $((a ${o} b))`,`echo ${Math.round(a/b*100)/100}`,`Dans ${cr("$(( ))")}, la division est entière : ${cr(a+" / "+b)} donne ${val}, on jette ce qui est après la virgule.`]]:[])]};}],
[0,"boucle for",R=>{const A=R.mel(MOTS7).slice(0,R.ent(2,4)),d=R.ent(0,1),apres=R.ent(0,1),n=A.length,inc="    n=$((n+1))",aff=`    echo "$n : $p"`,corps=apres?[aff,inc]:[inc,aff];
  return {nom:"liste.sh",A,pas:[SHEB,[`n=${d}`,`Le compteur ${cr("n")} part de ${d}.`],
    [`for p in "$@"\ndo\n${corps.join("\n")}\ndone`,`${cr('"$@"')} donne les paramètres un par un : la boucle fait ${n} tours. ${Maj(A.map((p,j)=>`au tour ${j+1}, ${cr("p")} vaut ${cr(p)} et ${cr("n")} vaut ${d+j+(apres?0:1)} au moment de l'affichage`).join(" ; "))}.`],
    [`echo "total : $n"`,`Après la boucle, ${cr("n")} vaut ${d+n}.`]],
   mut:[["compteur augmenté à l'autre moment",corps.join("\n"),corps.slice().reverse().join("\n"),`Les lignes d'une boucle se font dans l'ordre, à chaque tour : ici, ${apres?"l'affichage vient avant l'augmentation du compteur":"le compteur augmente avant l'affichage"}.`],
    ["nom du script compté dans la boucle",`for p in "$@"`,`for p in "$0" "$@"`,`${cr('"$@"')} donne seulement les paramètres, pas le nom du script.`],
    ["un seul tour pour tous les paramètres",`for p in "$@"`,`for p in "$*"`,`${cr('"$@"')} donne un mot par paramètre, donc un tour par paramètre.`]]};}],
[0,"test",R=>{const a=R.ent(3,9),A=R.mel([a,R.ent(10,Math.min(99,a*10-1))]).map(String),o=R.choix(["-lt","-gt","<",">"]),[x,y]=A.map(Number);
  const vrai=o==="-lt"?x<y:o==="-gt"?x>y:o==="<"?A[0]<A[1]:A[0]>A[1],num=o[0]==="-",dit={"-lt":"plus petit que","-gt":"plus grand que","<":"avant","> ":"après",">":"après"}[o],bloc2=`le bloc du ${vrai?"then":"else"}`;
  return {nom:"compare.sh",A,pas:[SHEB,[`if [[ $1 ${o} $2 ]]\nthen\n    echo "oui"\nelse\n    echo "non"\nfi`,num?`${cr(o)} compare des nombres : ${x} est-il ${dit} ${y} ? ${vrai?"Oui":"Non"}, donc bash fait ${bloc2}.`
      :`Dans ${cr("[[ ]]")}, ${cr(o)} compare des textes, caractère par caractère comme dans un dictionnaire : ${cr(A[0])} vient-il ${dit} ${cr(A[1])} ? On compare d'abord les caractères ${cr(A[0][0])} et ${cr(A[1][0])} : ${vrai?"oui":"non"}, donc bash fait ${bloc2}.`],
    [`echo "fin"`,"Après le fi, le script continue : cette ligne s'affiche dans tous les cas."]],
   mut:num?[["test à l'envers",`$1 ${o} $2`,`$1 ${o==="-lt"?"-gt":"-lt"} $2`,`${cr("-lt")} veut dire plus petit, ${cr("-gt")} plus grand.`],
       ["nombres comparés comme des textes",`$1 ${o} $2`,`$1 ${o==="-lt"?"<":">"} $2`,`${cr(o)} compare des nombres : ${x} est ${x<y?"plus petit":"plus grand"} que ${y}, même si les caractères ${cr(String(x)[0])} et ${cr(String(y)[0])} ne sont pas dans cet ordre.`]]
     :[["textes comparés comme des nombres",`$1 ${o} $2`,`$1 ${o==="<"?"-lt":"-gt"} $2`,`Dans ${cr("[[ ]]")}, ${cr(o)} compare des textes, caractère par caractère : ${cr("10")} vient avant ${cr("9")}, parce que le caractère 1 est avant le caractère 9. Pour des nombres, il faut ${cr("-lt")} ou ${cr("-gt")}.`],
       ["test à l'envers",`$1 ${o} $2`,`$1 ${o==="<"?">":"<"} $2`,`${cr("<")} veut dire avant, ${cr(">")} après.`]],
   fin:"Un seul des deux blocs, then ou else, est fait."};}],
[0,"while",R=>{const d=R.ent(1,3),mult=R.ent(0,1),k=mult?2:R.ent(2,4),S=[];for(let x=d;S.length<6;x=mult?x*2:x+k)S.push(x);const bo=R.choix(S.slice(2,5)),op=R.choix(["-le","-lt"]);
  const calc=mult?"    i=$((i * 2))":`    i=$((i + ${k}))`,aff="    echo $i",vus=S.filter(x=>op==="-le"?x<=bo:x<bo).length,der=S[vus];
  return {nom:"boucle.sh",A:[],pas:[SHEB,[`i=${d}`,`${cr("i")} part de ${d}.`],
    [`while [[ $i ${op} ${bo} ]]\ndo\n${aff}\n${calc}\ndone`,`À chaque tour, on teste d'abord ${cr("$i "+op+" "+bo)} (${op==="-le"?"plus petit ou égal":"strictement plus petit"}), puis on affiche ${cr("i")}, puis il ${mult?"double":"augmente de "+k}. ${cr("i")} prend les valeurs ${et(S.slice(0,vus+1).map(String))} : à ${der}, le test est faux et la boucle s'arrête.`],
    [`echo "après : $i"`,`Après la boucle, ${cr("i")} vaut ${der}.`]],
   mut:[["borne comprise ou pas",`$i ${op} ${bo}`,`$i ${op==="-le"?"-lt":"-le"} ${bo}`,`${cr("-le")} veut dire plus petit ou égal, ${cr("-lt")} strictement plus petit : la valeur ${bo} ${op==="-le"?"passe":"ne passe pas"} le test.`],
    ["affichage après le calcul",`${aff}\n${calc}`,`${calc}\n${aff}`,"Dans le bloc, on affiche d'abord, puis on change la valeur."]]};}],
[0,"motif",R=>{const ext=R.choix([".txt",".py",".c"]),F=noms7(R,ext,R.ent(2,3),R.ent(2,3)),sous2=R.choix(["docs","old","tp"]),ok=F.filter(x=>x.endsWith(ext)).sort();
  return {nom:"cherche.sh",A:[],T:arbo7([...F,dos7(sous2,["vieux"+ext])]),montre:"arbre",pas:[SHEB,["n=0","Le compteur part de 0."],
    [`for f in *${ext}\ndo\n    echo "trouvé : $f"\n    n=$((n+1))\ndone`,`bash remplace ${cr("*"+ext)} par les noms du dossier courant qui finissent par ${cr(ext)}, dans l'ordre alphabétique : ${et(ok.map(cr))}. Il ne descend pas dans ${cr(sous2)}. Un tour par nom.`],
    [`echo "$n fichiers"`,`Après ${ok.length} tours, ${cr("n")} vaut ${ok.length}.`]],
   mut:[["motif entre guillemets",`*${ext}\ndo`,`"*${ext}"\ndo`,`Sans guillemets, bash remplace ${cr("*"+ext)} par les noms qui correspondent. Entre guillemets, il le laisserait tel quel.`],
    ["sous-dossier parcouru aussi",`*${ext}\ndo`,`*${ext} ${sous2}/*${ext}\ndo`,`${cr("*"+ext)} ne regarde que le dossier courant : il ne descend pas dans ${cr(sous2)}.`],
    ["tous les fichiers",`*${ext}\ndo`,`*\ndo`,`${cr("*"+ext)} ne garde que les noms qui finissent par ${cr(ext)}.`]]};}],

[1,"bonjour",R=>{const m=R.choix(["Bonjour","Salut","Coucou","Bienvenue"]),P=R.mel(MOTS7);
  return {nom:R.choix(["salut.sh","bonjour.sh"]),dit:`affiche ${cr(m)}, une espace, puis son premier paramètre`,vers:[{A:[P[0]]},{A:[P[1],P[2]]},{A:[P[3]]}],
   pas:[SHEB,[`echo "${m} $1"`,`${cr("$1")} est le premier paramètre. Entre guillemets, bash le remplace par sa valeur.`]],
   alt:[`echo ${m} $1`,`nom=$1\necho "${m} $nom"`,`echo "${m}" "$1"`],
   mut:[["apostrophes à la place des guillemets",`"${m} $1"`,`'${m} $1'`,`Entre apostrophes, bash ne remplace rien : ${cr("$1")} s'afficherait tel quel. Il faut des guillemets.`],
    ["nom du script à la place du paramètre",`$1"`,`$0"`,`${cr("$0")} est le nom du script ; le premier paramètre, c'est ${cr("$1")}.`],
    ["dollar oublié",`$1"`,`1"`,`Sans ${cr("$")}, ${cr("1")} est juste le chiffre 1 : c'est ${cr("$1")} qui donne le premier paramètre.`],
    ["tous les paramètres au lieu du premier",`$1"`,`$@"`,`${cr("$@")} donne tous les paramètres ; le premier seul, c'est ${cr("$1")}.`]]};}],
[1,"nombre de paramètres",R=>{const [av,ap]=R.choix([["","paramètres"],["Il y a ","paramètres"],["","arguments"],["Nombre de paramètres : ",""],["Reçu : ",""]]),P=R.mel(MOTS7),K=R.mel([1,2,3,4,5]).slice(0,2).concat([0]),fin2=ap?" "+ap:"";let j=0;
  return {nom:"compte.sh",dit:"affiche le nombre de paramètres qu'il reçoit, écrit comme dans l'exemple",vers:K.map(k=>({A:P.slice(j,j+=k)})),
   pas:[SHEB,[`echo "${av}$#${fin2}"`,`${cr("$#")} est le nombre de paramètres. Le nom du script, ${cr("$0")}, n'est pas compté.`]],
   alt:[`n=$#\necho "${av}$n${fin2}"`,`echo ${av}$#${fin2}`],
   mut:[["paramètres au lieu de leur nombre","$#","$@",`${cr("$@")} donne les paramètres eux-mêmes ; leur nombre, c'est ${cr("$#")}.`],
    ["premier paramètre au lieu du nombre","$#","$1",`${cr("$1")} est le premier paramètre ; le nombre de paramètres, c'est ${cr("$#")}.`],
    ["dollar oublié","$#","#",`Sans ${cr("$")}, ${cr("#")} s'affiche tel quel.`]]};}],
[1,"calcul",R=>{const [o,quoi]=R.choix([["+","la somme de ses deux paramètres"],["-","son premier paramètre moins le second"],["*","le produit de ses deux paramètres"],["/","le quotient entier de son premier paramètre par le second"],["%","le reste de la division de son premier paramètre par le second"]]);
  const V=[0,1,2].map(()=>[R.ent(2,40),R.ent(2,9)]);if(V[0][0]<V[0][1]&&"/%".includes(o))V[0].reverse();if(o==="-"&&V[1][0]>V[1][1])V[1].reverse();
  return {nom:"calcul.sh",dit:`affiche ${quoi}, qui sont des nombres entiers`,vers:V.map(x=>({A:x.map(String)})),
   pas:[SHEB,[`echo $(($1 ${o} $2))`,`${cr("$(( ))")} fait le calcul sur des entiers ; ${cr("$1")} et ${cr("$2")} y sont remplacés par les deux paramètres.${o==="/"?" La division est entière : ce qui est après la virgule est jeté.":""}`]],
   alt:[`echo $(( $1 ${o} $2 ))`,`r=$(($1${o}$2))\necho $r`,`a=$1\nb=$2\necho $((a ${o} b))`,...(o==="*"?[]:[`let r=$1${o}$2\necho $r`])],
   mut:[["calcul sans les doubles parenthèses",`echo $(($1 ${o} $2))`,`echo $1${o}$2`,`Sans ${cr("$(( ))")}, bash ne calcule pas : il affiche les deux nombres et le signe, comme du texte.`],
    ...("-/%".includes(o)?[["paramètres dans le mauvais ordre",`$(($1 ${o} $2))`,`$(($2 ${o} $1))`,`L'énoncé part du premier paramètre, ${cr("$1")}.`]]:[]),
    ["dollar oublié devant les paramètres",`$(($1 ${o} $2))`,`$((1 ${o} 2))`,`Dans ${cr("$(( ))")}, ${cr("1")} est le nombre 1 ; le premier paramètre, c'est ${cr("$1")}.`]]};}],
[1,"ordre inverse",R=>{const n=R.ent(2,3),P=R.mel(MOTS7),ref=`echo "${n===3?"$3 ":""}$2 $1"`;
  return {nom:"inverse.sh",dit:`reçoit ${n} paramètres et les affiche dans l'ordre inverse, sur une seule ligne, séparés par une espace`,vers:[0,1,2].map(j=>({A:P.slice(j*n,j*n+n)})),
   pas:[SHEB,[ref,`${cr("$1")}, ${cr("$2")}${n===3?`, ${cr("$3")}`:""} sont les paramètres dans l'ordre où on les a tapés : on les écrit du dernier au premier.`]],
   alt:[ref.replace(/"/g,"")],
   mut:[["ordre gardé",ref,`echo "$1 $2${n===3?" $3":""}"`,`Il faut commencer par le dernier paramètre, ${cr("$"+n)}.`],
    ["nom du script compté comme un paramètre",ref,`echo "${n===3?"$2 ":""}$1 $0"`,`${cr("$0")} est le nom du script ; les paramètres commencent à ${cr("$1")}.`]]};}],
[1,"nom du script",R=>{const nom=R.choix(["infos.sh","test.sh","lance.sh"]),P=R.mel(MOTS7),[a,b]=R.choix([["a reçu","paramètres"],["a été lancé avec","paramètres"],["compte","arguments"]]),K=[R.ent(1,3),0,R.ent(2,4)];let j=0;
  return {nom,dit:"affiche son propre nom, tel qu'on l'a tapé pour le lancer, puis le nombre de ses paramètres, écrits comme dans l'exemple",vers:K.map(k=>({A:P.slice(j,j+=k)})),
   pas:[SHEB,[`echo "$0 ${a} $# ${b}"`,`${cr("$0")} est le nom du script, tel qu'on l'a tapé (ici avec ${cr("./")} devant). ${cr("$#")} est le nombre de paramètres, sans compter ce nom.`]],
   alt:[`echo $0 ${a} $# ${b}`],
   mut:[["premier paramètre à la place du nom du script","$0","$1",`${cr("$1")} est le premier paramètre ; le nom du script, c'est ${cr("$0")}.`],
    ["nom du script compté avec les paramètres","$#","$(($#+1))",`${cr("$#")} ne compte pas le nom du script.`],
    ["paramètres au lieu de leur nombre","$#","$@",`${cr("$@")} donne les paramètres eux-mêmes ; leur nombre, c'est ${cr("$#")}.`]]};}],
[1,"compter dans un fichier",R=>{const [opt,mot]=R.choix([["-l","lignes"],["-w","mots"]]),nf=R.choix(["notes.txt","liste.txt","phrases.txt","memo.txt"]);
  const fic=()=>{const L=[],k=R.ent(3,7);for(let i=0;i<k;i++)L.push(R.mel(MOTS7).slice(0,R.ent(1,3)).join(" "));return L.join("\n")+"\n";};
  return {nom:"taille.sh",dit:`affiche le nom du fichier donné en paramètre, puis son nombre de ${mot}, écrits comme dans l'exemple`,vers:[0,1,2].map(()=>({A:[nf],T:arbo7([{n:nf,c:fic()},"autre.txt"])})),
   pas:[SHEB,[`n=$(wc ${opt} < $1)`,`${cr("$( )")} est remplacé par ce qu'affiche la commande : ${cr("wc "+opt)} compte les ${mot}. Avec ${cr("< $1")}, wc lit le fichier sans connaître son nom, et n'écrit que le nombre.`],[`echo "$1 : $n ${mot}"`,`${cr("$1")} est le nom du fichier, ${cr("$n")} le nombre trouvé.`]],
   alt:[`echo "$1 : $(wc ${opt} < $1) ${mot}"`,`n=$(cat $1 | wc ${opt})\necho "$1 : $n ${mot}"`],
   mut:[["wc avec le nom du fichier",`wc ${opt} < $1`,`wc ${opt} $1`,`Quand on donne à wc le nom du fichier, il l'écrit après le nombre : ${cr("wc "+opt+" "+nf)} affiche par exemple ${cr("7 "+nf)}. Avec ${cr("< $1")}, il n'écrit que le nombre.`],
    ["lignes et mots confondus",`wc ${opt}`,`wc ${opt==="-l"?"-w":"-l"}`,`${cr("wc -l")} compte les lignes, ${cr("wc -w")} les mots.`],
    ["commande écrite au lieu de son résultat",`n=$(wc ${opt} < $1)`,`n="wc ${opt} < $1"`,`Pour ranger ce qu'affiche une commande, il faut ${cr("$( )")} autour.`]]};}],

[2,"chaque paramètre",R=>{const pre=R.choix(["","- ","> ","paramètre : ","→ "]),P=R.mel(MOTS7),K=[R.ent(2,4),R.ent(1,4),R.ent(3,5)];let j=0;
  return {nom:"un-par-ligne.sh",dit:`affiche ses paramètres un par ligne${pre?", chacun précédé de "+cr(pre.trim()):""}, comme dans l'exemple`,vers:K.map(k=>({A:P.slice(j,j+=k)})),
   pas:[SHEB,[`for p in "$@"\ndo\n    echo "${pre}$p"\ndone`,`${cr('"$@"')} donne les paramètres un par un : la boucle fait un tour par paramètre, et ${cr("p")} prend chaque valeur. Les guillemets gardent chaque paramètre entier.`]],
   alt:[`for p\ndo\n    echo "${pre}$p"\ndone`,`for p in $@\ndo\n    echo "${pre}$p"\ndone`,`while [[ $# -gt 0 ]]\ndo\n    echo "${pre}$1"\n    shift\ndone`],
   mut:[["un seul tour pour tous les paramètres",`"$@"`,`"$*"`,`${cr('"$*"')} colle tous les paramètres en un seul mot : la boucle ne fait qu'un tour. ${cr('"$@"')} en donne un par tour.`],
    ["seulement le premier paramètre",`in "$@"`,`in $1`,`${cr("$1")} n'est que le premier paramètre ; tous, c'est ${cr('"$@"')}.`],
    ["dollar oublié devant la variable",`${pre}$p"`,`${pre}p"`,`Sans ${cr("$")}, ${cr("p")} est un simple mot : c'est ${cr("$p")} qui donne la valeur du tour.`],
    ["nom du script en plus",`in "$@"`,`in "$0" "$@"`,`${cr('"$@"')} donne seulement les paramètres.`]],sans:BOUCLE7};}],
[2,"numéroter",R=>{const sep=R.choix([" : ",". ",") "," - "]),d=R.ent(0,1),P=R.mel(MOTS7),K=[R.ent(2,4),R.ent(3,5),R.ent(1,3)],aff=`    echo "$n${sep}$p"`,inc="    n=$((n+1))";let j=0;
  return {nom:"numeros.sh",dit:`affiche ses paramètres un par ligne, chacun précédé de son numéro (le premier a le numéro ${d}), comme dans l'exemple`,vers:K.map(k=>({A:P.slice(j,j+=k)})),
   pas:[SHEB,[`n=${d}`,`Le compteur part de ${d}, le numéro du premier paramètre.`],[`for p in "$@"\ndo\n${aff}\n${inc}\ndone`,`Un tour par paramètre : on affiche le numéro et le paramètre, puis le numéro augmente de 1 avec ${cr("$(( ))")}.`]],
   alt:[`n=${d}\nfor p\ndo\n${aff}\n    let n=n+1\ndone`,`n=${d}\nfor p in $@\ndo\n${aff}\n    n=$(($n + 1))\ndone`],
   mut:[["compteur augmenté avant l'affichage",`${aff}\n${inc}`,`${inc}\n${aff}`,"Dans le bloc, on affiche d'abord, puis on augmente le numéro : sinon le premier paramètre a déjà le numéro suivant."],
    ["compteur jamais augmenté",`\n${inc}`,"",`Il faut augmenter le numéro à chaque tour, avec ${cr("n=$((n+1))")}.`],
    ["calcul sans les doubles parenthèses",inc,"    n=$n+1",`Sans ${cr("$(( ))")}, ${cr("n=$n+1")} colle du texte : ${cr("n")} vaut ${cr(d+"+1")}, puis ${cr(d+"+1+1")}, et ainsi de suite.`],
    ["mauvais numéro de départ",`n=${d}`,`n=${1-d}`,`Le premier paramètre a le numéro ${d}.`]],sans:BOUCLE7};}],
[2,"compter",R=>{const s=R.choix(["monte","descend","pairs"]),[dep,op,pas2,quoi]={monte:["i=1","-le","    i=$((i+1))","les nombres entiers de 1 jusqu'au nombre donné en paramètre"],descend:["i=$1","-ge","    i=$((i-1))","les nombres entiers du nombre donné en paramètre jusqu'à 1, en descendant"],pairs:["i=2","-le","    i=$((i+2))","les nombres pairs de 2 jusqu'au nombre donné en paramètre"]}[s];
  const borne=s==="descend"?"1":"$1",K=R.mel([3,4,5,6,7,8]).slice(0,2).concat([s==="pairs"?R.choix([5,7,9]):1]);
  return {nom:"compte.sh",dit:`affiche, avec une boucle, ${quoi}, un par ligne`,vers:K.map(k=>({A:[String(k)]})),
   pas:[SHEB,[dep,`${cr("i")} part de ${s==="descend"?"la valeur du paramètre":dep.slice(2)}.`],[`while [[ $i ${op} ${borne} ]]\ndo\n    echo $i\n${pas2}\ndone`,`Tant que ${cr("$i "+op+" "+borne)} est vrai (${op==="-le"?"plus petit ou égal":"plus grand ou égal"}), on affiche ${cr("i")} puis on ${s==="monte"?"lui ajoute 1":s==="pairs"?"lui ajoute 2":"lui retire 1"}.`]],
   alt:s==="monte"?[`for i in $(seq 1 $1)\ndo\n    echo $i\ndone`,`i=1\nuntil [[ $i -gt $1 ]]\ndo\n    echo $i\n    i=$((i+1))\ndone`]:s==="pairs"?[`for i in $(seq 2 2 $1)\ndo\n    echo $i\ndone`]:[`for i in $(seq $1 -1 1)\ndo\n    echo $i\ndone`],
   mut:[["borne exclue",`$i ${op} `,`$i ${op==="-le"?"-lt":"-gt"} `,`${op==="-le"?cr("-le")+" veut dire plus petit ou égal":cr("-ge")+" veut dire plus grand ou égal"} : la borne est gardée. ${cr(op==="-le"?"-lt":"-gt")} s'arrêterait un tour trop tôt.`],
    ["affichage après le calcul",`    echo $i\n${pas2}`,`${pas2}\n    echo $i`,"Dans le bloc, on affiche d'abord, puis on passe au nombre suivant."],
    ...(s==="monte"?[["départ à 0","i=1","i=0","La liste commence à 1."]]:[])],sans:BOUCLE7};}],
[2,"somme",R=>{const [quoi,op,dep]=R.choix([["la somme","+","0"],["le produit","*","1"]]),V=[0,1,2].map(()=>NB7(R,R.ent(2,4),1,12).map(String)),tete=`for x in "$@"\ndo`;
  return {nom:R.choix(["somme.sh","calcul.sh"]),dit:`affiche ${quoi} de ses paramètres, qui sont des nombres entiers`,vers:V.map(A=>({A})),
   pas:[SHEB,[`s=${dep}`,`${cr("s")} part de ${dep}${op==="*"?" : avec 0, le produit resterait 0":""}.`],[`${tete}\n    s=$((s ${op} x))\ndone`,`Un tour par paramètre : ${cr("s")} ${op==="+"?"reçoit sa valeur plus":"est multiplié par"} le paramètre ${cr("x")}, avec ${cr("$(( ))")}.`],["echo $s","Après la boucle seulement, on affiche le résultat."]],
   alt:[`s=${dep}\nfor x\ndo\n    s=$(($s ${op} $x))\ndone\necho $s`,`s=${dep}\nwhile [[ $# -gt 0 ]]\ndo\n    s=$((s ${op} $1))\n    shift\ndone\necho "$s"`],
   mut:[["valeur de départ remise à chaque tour",`s=${dep}\n${tete}`,`${tete}\n    s=${dep}`,`${cr("s="+dep)} doit venir avant la boucle : dedans, la valeur repart de ${dep} à chaque tour.`],
    ["affichage dans la boucle","done\necho $s","    echo $s\ndone",`L'${cr("echo")} doit venir après ${cr("done")} : dans la boucle, il afficherait un résultat à chaque tour.`],
    ["calcul écrit comme du texte",`s=$((s ${op} x))`,`s=$s${op}$x`,`Sans ${cr("$(( ))")}, bash colle les nombres et les signes, comme du texte.`],
    ...(op==="*"?[["produit parti de 0","s=1","s=0","Un produit part de 1 : en partant de 0, on reste à 0."]]:[])],sans:BOUCLE7};}],
[2,"fichiers d'un type",R=>{const ext=R.choix([".txt",".py",".c",".sh"]),pre=R.choix(["","fichier : ","- "]),sous2=R.choix(["docs","old","tp"]);
  return {nom:"liste.sh",dit:`affiche, avec une boucle, le nom de chaque fichier ${cr(ext)} du dossier courant, un par ligne${pre?", précédé de "+cr(pre.trim()):""}, comme dans l'exemple`,montre:"arbre",
   vers:[0,1,2].map(()=>({A:[],T:arbo7([...noms7(R,ext,R.ent(1,3),R.ent(1,3)),dos7(sous2,["vieux"+ext])])})),
   pas:[SHEB,[`for f in *${ext}\ndo\n    echo "${pre}$f"\ndone`,`bash remplace ${cr("*"+ext)} par les noms du dossier courant qui finissent par ${cr(ext)}, dans l'ordre alphabétique : un tour par nom. Il ne descend pas dans les sous-dossiers.`]],
   alt:[`for f in *${ext}\ndo\n    echo ${pre}$f\ndone`,`for nom in ./*${ext}\ndo\n    echo "${pre}$(basename $nom)"\ndone`],
   mut:[["motif entre guillemets",`*${ext}\ndo`,`"*${ext}"\ndo`,`Entre guillemets, ${cr("*"+ext)} reste tel quel : la boucle fait un seul tour, avec ce texte. Sans guillemets, bash le remplace par les noms qui correspondent.`],
    ["tous les fichiers",`*${ext}\ndo`,`*\ndo`,`${cr("*")} donne tous les noms ; ${cr("*"+ext)} seulement ceux qui finissent par ${cr(ext)}.`],
    ["boucle sur le mot ls",`in *${ext}`,"in ls",`${cr("for f in ls")} fait un seul tour, avec le mot ls : la commande n'est pas lancée. Le motif ${cr("*"+ext)} suffit, sans ls.`]],sans:BOUCLE7};}],
[2,"compter sans wc",R=>{const ext=R.choix([".py",".txt",".c"]),d=R.choix(["tp","src","cours"]),ks=R.mel([0,1,2,3,4]).slice(0,3);if(!ks[0])ks.push(ks.shift());
  return {nom:"compte.sh",dit:`affiche le nombre de fichiers ${cr(ext)} du dossier dont le nom est donné en paramètre, sans utiliser ${cr("ls")} ni ${cr("wc")}`,
   vers:ks.map(k=>({A:[d],T:arbo7([...noms7(R,ext,1,1),dos7(d,[...noms7(R,ext,k,R.ent(1,2)),dos7("vieux"+ext,[])])])})),
   pas:[SHEB,["n=0","Le compteur part de 0."],[`for f in $1/*${ext}\ndo\n    if [[ -f $f ]]\n    then\n        n=$((n+1))\n    fi\ndone`,`${cr("$1/*"+ext)} donne les chemins des ${cr(ext)} du dossier ${cr("$1")}. Le test ${cr("-f")} ne compte que les vrais fichiers : il écarte un dossier dont le nom finit par ${cr(ext)}, et le motif lui-même quand il n'y a aucun ${cr(ext)}, car bash le laisse alors tel quel.`],["echo $n","Après la boucle, on affiche le compteur."]],
   alt:[`n=0\nfor f in $1/*${ext}\ndo\n    [[ -f $f ]] && n=$((n+1))\ndone\necho $n`,`n=0\nfor f in "$1"/*${ext}\ndo\n    if [ -f "$f" ]\n    then\n        let n=n+1\n    fi\ndone\necho $n`],
   mut:[["test -f oublié",`    if [[ -f $f ]]\n    then\n        n=$((n+1))\n    fi`,"    n=$((n+1))",`Sans le test ${cr("-f")}, on compte aussi les dossiers dont le nom finit par ${cr(ext)}, et le motif lui-même quand il n'y a aucun fichier ${cr(ext)} : bash le laisse alors tel quel, et la boucle fait quand même un tour.`],
    ["dossier courant au lieu du paramètre",`$1/*${ext}`,`*${ext}`,`${cr("*"+ext)} regarde le dossier courant ; le dossier du paramètre, c'est ${cr("$1/*"+ext)}.`],
    ["affichage dans la boucle","done\necho $n","    echo $n\ndone","L'affichage vient après la boucle : dedans, il se répéterait à chaque tour."]],
   sans:[[/\bls\b/,`L'énoncé demande de compter sans ${cr("ls")} : parcours ${cr("$1/*"+ext)} avec une boucle.`],[/\bwc\b/,`L'énoncé demande de compter sans ${cr("wc")} : utilise un compteur.`],...BOUCLE7]};}],
[2,"numéroter les lignes",R=>{const sep=R.choix([" : ",". ",") "]),nf=R.choix(["fruits.txt","villes.txt","liste.txt"]),pool=(nf==="villes.txt"?VILLES:"pomme poire banane kiwi mangue cerise fraise orange citron raisin prune melon figue datte abricot").split(" ");
  const aff=`    echo "$n${sep}$ligne"`,inc="    n=$((n+1))";
  return {nom:"numerote.sh",dit:"affiche chaque ligne du fichier dont le nom est donné en paramètre, précédée de son numéro (la première est la ligne 1), comme dans l'exemple",montre:nf,
   vers:[0,1,2].map(()=>({A:[nf],T:arbo7([{n:nf,c:R.mel(pool).slice(0,R.ent(2,5)).join("\n")+"\n"}])})),
   pas:[SHEB,["n=1","Le numéro de la première ligne."],[`while read ligne\ndo\n${aff}\n${inc}\ndone < $1`,`${cr("read ligne")} lit une ligne à chaque tour et la range dans ${cr("ligne")} ; quand il n'y en a plus, le test est faux et la boucle s'arrête. ${cr("< $1")}, après ${cr("done")}, branche le fichier sur la boucle.`]],
   alt:[`n=1\nfor ligne in $(cat $1)\ndo\n${aff}\n${inc}\ndone`,`n=0\nwhile read l\ndo\n    n=$((n+1))\n    echo "$n${sep}$l"\ndone < "$1"`],
   mut:[["fichier oublié après done","done < $1","done",`Sans ${cr("< $1")} après ${cr("done")}, read lit le clavier, pas le fichier : la boucle ne lit aucune ligne du fichier.`],
    ["compteur jamais augmenté",`\n${inc}`,"","Il faut augmenter le numéro à chaque tour."],
    ["compteur augmenté avant l'affichage",`${aff}\n${inc}`,`${inc}\n${aff}`,"On affiche d'abord, puis on augmente le numéro."]],sans:BOUCLE7};}],

[3,"fichier ou dossier",R=>{const d=R.choix(["docs","tp","cours","photos"]),[mf,md]=R.choix([["fichier","dossier"],["fichier","répertoire"],["F","D"]]);
  const corps=`for f in $1/*\ndo\n    if [[ -d $f ]]\n    then\n        echo "${md} $f"\n    else\n        echo "${mf} $f"\n    fi\ndone`;
  return {nom:"types.sh",dit:`affiche, pour chaque élément du dossier dont le nom est donné en paramètre, ${cr(md)} si c'est un dossier et ${cr(mf)} sinon, suivi de son chemin, comme dans l'exemple`,montre:"arbre",
   vers:[0,1,2].map(()=>({A:[d],T:arbo7(["notes.txt",dos7(d,[...noms7(R,R.choix([".txt",".py"]),R.ent(1,2),R.ent(1,2)),...R.mel(["old","src","images","td"]).slice(0,R.ent(1,2)).map(n=>dos7(n,["a.txt"]))])])})),
   pas:[SHEB,[corps,`${cr("$1/*")} donne les chemins des éléments du dossier, comme ${cr(d+"/notes.txt")}. ${cr("[[ -d $f ]]")} est vrai si ${cr("$f")} est un dossier : bash fait alors le bloc du then, sinon celui du else.`]],
   alt:[`for f in $1/*\ndo\n    if [[ -f $f ]]\n    then\n        echo "${mf} $f"\n    else\n        echo "${md} $f"\n    fi\ndone`,corps.replace("$1/*",'"$1"/*').replace("[[ -d $f ]]",'[ -d "$f" ]')],
   mut:[["tests -f et -d confondus","-d $f","-f $f",`${cr("-d")} est vrai pour un dossier, ${cr("-f")} pour un fichier ordinaire.`],
    ["chemin sans le dossier","for f in $1/*","for f in $(ls $1)",`${cr("ls $1")} donne les noms seuls, sans le dossier devant : le test cherche alors chaque nom dans le dossier courant. ${cr("$1/*")} donne les chemins complets.`],
    ["un seul élément","for f in $1/*","for f in $1",`${cr("for f in $1")} fait un seul tour, sur le dossier lui-même ; ${cr("$1/*")} donne ce qu'il contient.`]],sans:BOUCLE7};}],
[3,"renommer",R=>{const ext=R.choix([".txt",".py",".c"]),[ou,mot]=R.choix([["devant","old"],["devant","bak_"],["devant","2025-"],["fin",".old"],["fin",".bak"]]),sous2=R.choix(["docs","tp"]);
  const vers=[0,1,2].map(()=>({A:[],T:arbo7([...noms7(R,ext,R.ent(2,3),R.ent(1,2)),dos7(sous2,["vieux"+ext])])})),x=noeud(vers[0].T,COURANT).d.map(y=>y.n).filter(n=>n.endsWith(ext)).sort()[0];
  const nv=ou==="devant"?`"${mot}$fichier"`:`"$fichier${mot}"`;
  return {nom:"renomme.sh",etat:true,montre:"arbre",dit:`renomme chaque fichier ${cr(ext)} du dossier courant en ajoutant ${cr(mot)} ${ou==="devant"?"devant":"à la fin de"} son nom : ${cr(x)} devient ${cr(ou==="devant"?mot+x:x+mot)}`,vers,
   pas:[SHEB,[`for fichier in *${ext}\ndo\n    mv "$fichier" ${nv}\ndone`,`${cr("*"+ext)} donne les noms des ${cr(ext)} du dossier courant, sans descendre dans ${cr(sous2)}. Pour chacun, ${cr("mv")} change le nom : le nouveau colle ${ou==="devant"?cr(mot)+" et l'ancien nom":"l'ancien nom et "+cr(mot)}.${ou==="devant"&&mot==="old"&&ext===".txt"?" C'est le corrigé officiel de janvier 2026.":""}`]],
   alt:[`for f in *${ext}\ndo\n    mv $f ${ou==="devant"?mot+"$f":"$f"+mot}\ndone`,`for fichier in *${ext}\ndo\n    mv "$fichier" ${ou==="devant"?`"${mot}\${fichier}"`:`"\${fichier}${mot}"`}\ndone`],
   mut:[["tous les fichiers renommés",`*${ext}\ndo`,"*\ndo",`${cr("*")} prend tous les noms, même les autres fichiers et le dossier ${cr(sous2)} ; il faut ${cr("*"+ext)}.`],
    ["dollar oublié devant la variable",nv,nv.replace("$fichier","fichier"),`Sans ${cr("$")}, ${cr("fichier")} est un simple mot : tous les fichiers reçoivent le même nom, et chacun écrase le précédent.`],
    ["nouveau nom sans l'ancien",nv,`"${mot}"`,`Le nouveau nom doit contenir l'ancien, ${cr("$fichier")} : sinon tous les fichiers prennent le même nom et s'écrasent.`]],sans:BOUCLE7};}],
[3,"supprimer",R=>{const ext=R.choix([".txt",".log",".tmp"]),d=R.choix(["docs","tmp","vieux","brouillons"]),boucle=`for f in $1/*${ext}\ndo\n    rm "$f"\ndone`;
  return {nom:"nettoie.sh",etat:true,montre:"arbre",dit:`supprime, avec une boucle, tous les fichiers ${cr(ext)} du dossier dont le nom est donné en paramètre, sans toucher à ses sous-dossiers`,
   vers:[0,1,2].map(()=>({A:[d],T:arbo7([...noms7(R,ext,1,1),dos7(d,[...noms7(R,ext,R.ent(1,3),R.ent(1,2)),dos7("sous",["garde"+ext])])])})),
   pas:[SHEB,[boucle,`${cr("$1/*"+ext)} donne les chemins des ${cr(ext)} du dossier ${cr("$1")}, comme ${cr(d+"/notes"+ext)} : ${cr("rm")} les trouve. ${cr("*")} ne descend pas dans ${cr("sous")}.`]],
   alt:[`for f in $(ls $1)\ndo\n    if [[ $f == *${ext} ]]\n    then\n        rm $1/$f\n    fi\ndone`,`for f in "$1"/*${ext}\ndo\n    rm $f\ndone`],
   mut:[["dossier courant au lieu du paramètre",`$1/*${ext}`,`*${ext}`,`${cr("*"+ext)} regarde le dossier courant ; le dossier du paramètre, c'est ${cr("$1/*"+ext)}.`],
    ["motif entre guillemets",`$1/*${ext}`,`"$1/*${ext}"`,`Entre guillemets, ${cr("*")} reste tel quel : rm cherche un fichier nommé ${cr("*"+ext)}, qui n'existe pas.`],
    ["chemin sans le dossier",boucle,`for f in $(ls $1)\ndo\n    if [[ $f == *${ext} ]]\n    then\n        rm $f\n    fi\ndone`,`${cr("ls $1")} donne les noms seuls : ${cr("rm $f")} cherche le fichier dans le dossier courant. Il faut ${cr("rm $1/$f")}.`]],sans:BOUCLE7};}],
[3,"somme d'un champ",R=>{const k=R.choix([2,3]),lec=`    n=$(echo $ligne | cut -d, -f${k})`,add="    somme=$((somme+n))",tete="for ligne in $(cat $1)\ndo";
  const fic=()=>R.mel(PROD7).slice(0,R.ent(3,5)).map(p=>`${p},${R.ent(1,20)},${R.ent(1,9)}`).join("\n")+"\n";
  return {nom:"somme.sh",montre:"ventes.csv",dit:`lit le fichier CSV dont le nom est donné en paramètre, et affiche la somme ${k===2?"des quantités vendues, le 2e champ":"des prix, le 3e champ"}. Chaque ligne a trois champs séparés par des virgules : le nom du produit, la quantité vendue et le prix`,
   vers:[0,1,2].map(()=>({A:["ventes.csv"],T:arbo7([{n:"ventes.csv",c:fic()}])})),
   pas:[SHEB,["somme=0","La somme part de 0, avant la boucle."],[`${tete}\n${lec}\n${add}\ndone`,`${cr("$(cat $1)")} donne les lignes du fichier, une par tour, car aucune ne contient d'espace. ${cr("cut -d, -f"+k)} garde le ${ORD(k)} champ de la ligne, et ${cr("$(( ))")} l'ajoute à la somme.`],["echo $somme","On affiche la somme après la boucle. C'est la méthode du corrigé officiel de janvier 2024, qui additionne le 1er champ."]],
   alt:[`somme=0\nwhile read ligne\ndo\n${lec}\n${add}\ndone < $1\necho $somme`,`s=0\nfor n in $(cut -d, -f${k} $1)\ndo\n    s=$((s+n))\ndone\necho $s`,`somme=0\nwhile IFS=, read nom q p\ndo\n    somme=$((somme+${k===2?"q":"p"}))\ndone < $1\necho $somme`],
   mut:[["champ compté à partir de 0",`-f${k}`,`-f${k-1}`,`Les champs se comptent à partir de 1 : le ${ORD(k)} champ, c'est ${cr("-f"+k)}.`],
    ["-d oublié",`cut -d, -f${k}`,`cut -f${k}`,`Sans ${cr("-d,")}, cut cherche des tabulations : il garde la ligne entière, et le calcul ne porte plus sur le bon champ.`],
    ["affichage dans la boucle","done\necho $somme","    echo $somme\ndone","La somme s'affiche une fois, après la boucle."],
    ["somme remise à 0 à chaque tour",`somme=0\n${tete}`,`${tete}\n    somme=0`,`${cr("somme=0")} doit venir avant la boucle.`]],sans:BOUCLE7};}],
[3,"lsarg",R=>{const P=R.mel(MOTS7.concat("a b c x y z".split(" "))),K=[R.ent(2,4),R.ent(1,3),0];let j=0;
  return {nom:"lsarg.sh",dit:`affiche ${cr("Liste des arguments :")}, puis chacun de ses arguments, y compris la commande elle-même, sur une ligne numérotée de 0 à n-1, comme dans l'exemple (TD de Meynard, exercice 44)`,vers:K.map(k=>({A:P.slice(j,j+=k)})),
   pas:[SHEB,[`echo "Liste des arguments :"\necho "0 : $0"`,`L'en-tête, puis la commande elle-même : ${cr("$0")}, avec le numéro 0. Elle n'est pas dans ${cr('"$@"')}, on l'affiche donc à part.`],
     ['i=1\nfor a in "$@"\ndo\n    echo "$i : $a"\n    i=$((i+1))\ndone',"Les paramètres ensuite, numérotés à partir de 1 : un tour par paramètre, et le compteur augmente de 1 à chaque tour."]],
   alt:['echo "Liste des arguments :"\ni=0\nfor a in "$0" "$@"\ndo\n    echo "$i : $a"\n    i=$((i+1))\ndone'],
   mut:[["commande oubliée",'echo "0 : $0"\n',"",`La commande elle-même, ${cr("$0")}, doit s'afficher avec le numéro 0 : ${cr('"$@"')} ne la contient pas.`],
    ["numéros décalés","i=1","i=0","La commande a déjà le numéro 0 : le premier paramètre a le numéro 1."],
    ["compteur jamais augmenté","\n    i=$((i+1))","","Il faut augmenter le numéro à chaque tour."]],sans:BOUCLE7};}],
[3,"filtrer",R=>{const [op,quoi]=R.choix([["-gt","plus grands que"],["-lt","plus petits que"],["-ge","plus grands ou égaux à"],["pair","pairs"]]),N=R.ent(5,15);
  const V=[0,1,2].map(i=>R.mel(NB7(R,R.ent(3,5),1,40).filter(x=>x!==N).concat(i<2&&op!=="pair"?[N]:[]).map(String))),test=op==="pair"?"[[ $((x % 2)) -eq 0 ]]":`[[ $x ${op} ${N} ]]`;
  return {nom:"filtre.sh",dit:`affiche, un par ligne, ceux de ses paramètres qui sont ${quoi}${op==="pair"?"":" "+N}. Les paramètres sont des nombres entiers`,vers:V.map(A=>({A})),
   pas:[SHEB,[`for x in "$@"\ndo\n    if ${test}\n    then\n        echo $x\n    fi\ndone`,op==="pair"?`Un tour par paramètre. Un nombre est pair quand le reste de sa division par 2 vaut 0 : ${cr("$((x % 2))")} calcule ce reste.`:`Un tour par paramètre ; ${cr(op)} compare des nombres (${{"-gt":"strictement plus grand","-lt":"strictement plus petit","-ge":"plus grand ou égal"}[op]}). On n'affiche que si le test est vrai.`]],
   alt:[`for x\ndo\n    ${op==="pair"?"[[ $((x % 2)) -eq 0 ]]":`[ $x ${op} ${N} ]`} && echo $x\ndone`],
   mut:op==="pair"?[["reste égal à 1 au lieu de 0","-eq 0","-eq 1","Pair veut dire : reste 0 dans la division par 2."],["division au lieu du reste","$((x % 2))","$((x / 2))",`${cr("%")} donne le reste ; ${cr("/")} donne le quotient.`],["seulement le premier paramètre",'in "$@"',"in $1",`${cr("$1")} n'est que le premier paramètre ; tous, c'est ${cr('"$@"')}.`]]
     :[["nombres comparés comme des textes",`$x ${op} ${N}`,`$x ${op==="-lt"?"<":">"} ${N}`,`Dans ${cr("[[ ]]")}, ${cr(op==="-lt"?"<":">")} compare des textes, caractère par caractère : ${cr("9")} passe après ${cr("10")}. Pour des nombres, il faut ${cr(op)}.`],
      ["borne comprise ou pas",`$x ${op} `,`$x ${{"-gt":"-ge","-lt":"-le","-ge":"-gt"}[op]} `,`${N} lui-même ${op==="-ge"?"doit":"ne doit pas"} s'afficher : ${cr("-gt")} et ${cr("-lt")} excluent la borne, ${cr("-ge")} et ${cr("-le")} la gardent.`],
      ["seulement le premier paramètre",'in "$@"',"in $1",`${cr("$1")} n'est que le premier paramètre ; tous, c'est ${cr('"$@"')}.`]],sans:BOUCLE7};}],
[3,"maximum",R=>{const [quoi,op]=R.choix([["le plus grand","-gt"],["le plus petit","-lt"]]),V=[NB7(R,R.ent(3,5),1,40),op==="-gt"?NB7(R,R.ent(3,4),-30,-1):NB7(R,R.ent(3,4),2,99),NB7(R,R.ent(2,5),-9,60)];
  return {nom:"extreme.sh",dit:`affiche ${quoi} de ses paramètres, qui sont des nombres entiers`,vers:V.map(L=>({A:R.mel(L).map(String)})),
   pas:[SHEB,["m=$1",`On part du premier paramètre : c'est ${quoi} vu jusqu'ici. Partir de 0 serait faux si ${op==="-gt"?"tous les nombres sont négatifs":"tous les nombres sont plus grands que 0"}.`],
     [`for x in "$@"\ndo\n    if [[ $x ${op} $m ]]\n    then\n        m=$x\n    fi\ndone`,`Un tour par paramètre : s'il est ${op==="-gt"?"plus grand":"plus petit"} que ${cr("m")}, il devient le nouveau ${cr("m")}.`],["echo $m","Après la boucle, on affiche le résultat."]],
   alt:[`m=$1\nshift\nfor x\ndo\n    [[ $x ${op} $m ]] && m=$x\ndone\necho $m`],
   mut:[["valeur de départ prise à 0","m=$1","m=0",`En partant de 0, on se trompe quand ${op==="-gt"?"tous les nombres sont négatifs":"tous les nombres sont plus grands que 0"}. On part du premier paramètre.`],
    ["nombres comparés comme des textes",`$x ${op} $m`,`$x ${op==="-gt"?">":"<"} $m`,`Dans ${cr("[[ ]]")}, ${cr(op==="-gt"?">":"<")} compare des textes, caractère par caractère : ${cr("9")} passe après ${cr("10")}. Pour des nombres, il faut ${cr(op)}.`],
    ["affichage dans la boucle","done\necho $m","    echo $m\ndone","Le résultat s'affiche une fois, après la boucle."],
    ["test à l'envers",`$x ${op} $m`,`$x ${op==="-gt"?"-lt":"-gt"} $m`,`${cr("-gt")} veut dire plus grand, ${cr("-lt")} plus petit.`]],sans:BOUCLE7};}],
[3,"compter les dossiers",R=>{const d=R.choix(["docs","tp","projet2","cours"]),ks=R.mel([0,1,2,3]).slice(0,3);if(!ks[0])ks.push(ks.shift());
  return {nom:"dossiers.sh",dit:"affiche le nombre de sous-dossiers, sans compter les fichiers, du dossier dont le nom est donné en paramètre",
   vers:ks.map(k=>({A:[d],T:arbo7(["a.txt",dos7("old",[]),dos7(d,[...noms7(R,R.choix([".txt",".py",".c"]),R.ent(1,2),R.ent(1,2)),...R.mel(["src","images","td","vieux","bin"]).slice(0,k).map(n=>dos7(n,["x.txt"]))])])})),
   pas:[SHEB,["n=0","Le compteur part de 0."],[`for f in $1/*\ndo\n    if [[ -d $f ]]\n    then\n        n=$((n+1))\n    fi\ndone`,`${cr("$1/*")} donne les chemins de tout ce que contient le dossier. ${cr("-d")} n'est vrai que pour un dossier : eux seuls font augmenter le compteur.`],["echo $n","On affiche le compteur après la boucle."]],
   alt:['n=0\nfor f in "$1"/*\ndo\n    [ -d "$f" ] && n=$((n+1))\ndone\necho $n'],
   mut:[["-f au lieu de -d","-d $f","-f $f",`${cr("-f")} est vrai pour un fichier ordinaire ; pour un dossier, c'est ${cr("-d")}.`],
    ["test oublié",`    if [[ -d $f ]]\n    then\n        n=$((n+1))\n    fi`,"    n=$((n+1))","Sans le test, on compte tout ce que contient le dossier, fichiers compris."],
    ["dossier courant au lieu du paramètre","$1/*","*",`${cr("*")} regarde le dossier courant ; le dossier du paramètre, c'est ${cr("$1/*")}.`],
    ["chemin sans le dossier","for f in $1/*","for f in $(ls $1)",`${cr("ls $1")} donne les noms seuls : le test cherche alors chaque nom dans le dossier courant. ${cr("$1/*")} donne les chemins complets.`]],sans:BOUCLE7};}]];
const S7P=[[],[],[],[]];for(const x of S7)S7P[x[0]].push(x);
const ARBO7=arbo7([{n:"notes.txt",c:"un\ndeux\ntrois\n"},{n:"data.csv",c:"stylo,4,2\ncahier,7,3\ngomme,1,5\n"},{n:"vide.txt",c:""},"a.c","b.c","x.txt",dos7("docs",["b.txt","c.py",dos7("sous",["d.txt"])])]);
/* des scripts en plus, seulement pour comparer le petit bash au vrai, sur ARBO7 */
const BANC7=[
 ['for f in *\ndo\n    if [[ -d $f ]]\n    then\n        echo "d $f"\n    elif [[ -f $f ]]\n    then\n        echo "f $f"\n    fi\ndone',[]],
 ['x="a  b"\necho $x\necho "$x"\nfor m in $x\ndo\n    echo "[$m]"\ndone',[]],
 ['echo $((7/2)) $((7%3)) $((-7/2)) $((2**5)) $((1+2*3)) $(((1+2)*3)) $((5>3)) $((2==3||1))',[]],
 ['echo $# "$1" "${2}" $0\nshift\necho $# $1 ${#1}',["un","deux","trois"]],
 ['for p\ndo\n    echo "<$p>"\ndone\nfor p in "$*"\ndo\n    echo "[$p]"\ndone\nfor p in $@\ndo\n    echo "{$p}"\ndone',["a","b c"]],
 ['[[ 9 < 12 ]] && echo oui || echo non\n[[ 9 -lt 12 ]] && echo oui || echo non\n[[ abc == a* ]] && echo motif\n[[ abc == "a*" ]] || echo texte',[]],
 ['[ "$1" = "a" ] && echo egal\n[ -n "$2" ] || echo vide\n[ $# -ge 1 -a $# -le 2 ] && echo entre\n[ -z "$1" ] || echo plein',["a"]],
 ['i=0\nwhile [[ $i -lt 5 ]]\ndo\n    i=$((i+2))\ndone\necho $i\nuntil [[ $i -le 0 ]]\ndo\n    i=$((i-4))\n    echo $i\ndone',[]],
 ['n=$(ls | wc -l)\necho "il y a $n noms"\necho "$(echo bonjour | tr a-z A-Z)"\nm=$(ls docs)\necho $m\necho "$m"',[]],
 ['for f in *.txt\ndo\n    mv "$f" "old$f"\ndone\nls',[]],
 ['rm nexistepas.txt\necho apres $?\nrm docs\necho $?\nrm -r docs\nls',[]],
 ['mkdir rangement\nmv *.c rangement\nls rangement\ncp notes.txt copie.txt\ntouch neuf.txt\nmv x.txt docs/y.txt\nls\nls docs',[]],
 ['basename /home/etu/projet/a.txt .txt\ndirname docs/sous/d.txt\nbasename docs/\ndirname a.c',[]],
 ['seq 3\nseq 2 4\nseq 10 -3 1',[]],
 ['while read ligne\ndo\n    echo "> $ligne"\ndone < notes.txt\nIFS=, read a b c < data.csv\necho "$b $c $a"',[]],
 ['echo "a\\$b" \'c\\d\' e\\ f "x\'y" \'u"v\'',[]],
 ['x=5\nlet x=x*2\necho $x\nlet "y = x + 1"\necho $y',[]],
 ['if [[ $1 == *.txt ]]\nthen\n    echo texte\nelif [[ $1 == *.c ]]\nthen\n    echo c\nelse\n    echo autre\nfi',["a.c"]],
 ['for f in docs/*\ndo\n    echo $(basename $f)\ndone\nfor f in docs/*.py docs/*.zz\ndo\n    echo "$f"\ndone',[]],
 ['s=0\nfor n in $(cut -d, -f2 data.csv)\ndo\n    s=$((s+n))\ndone\necho $s\nl=$(wc -l < data.csv)\necho $((l * 2))',[]],
 ['echo ${#1} ${#x}\nx=bonjour\necho ${#x} "${x}s"',["abcd"]],
 ['[[ -e docs ]] && echo e\n[[ -s vide.txt ]] || echo vide\n[[ -s notes.txt ]] && echo plein\n[[ -z "" ]] && echo z\n[[ ! -d a.c ]] && echo pas-dossier',[]],
 ['echo debut\nexit 0\necho jamais',[]],
 ['for i in 1 2 3\ndo\n    for j in a b\n    do\n        echo $i$j\n    done\ndone',[]],
 ['echo "$(head -n 2 notes.txt)" > sortie.txt\ncat sortie.txt\necho fin >> sortie.txt\nwc -l < sortie.txt\nls',[]],
 ['grep -c deux notes.txt\nif grep deux notes.txt > /dev/null\nthen\n    echo trouve\nfi\ncat notes.txt | sort | head -n 1',[]],
 ['a=3; b=4\nif [ $a -lt $b ] && [ $b -lt 5 ]\nthen\n    echo ok\nfi\n[ $a -gt 1 ] || echo non; echo fin',[]],
 ['n=0\nfor f in docs/*\ndo\n    [[ -d $f ]] && n=$((n+1))\ndone\necho $n dossiers\nfor f in $(ls docs)\ndo\n    [[ -d $f ]] && echo "vu $f"\ndone\necho fin',[]],
 ['m=$1\nfor x in "$@"\ndo\n    [[ $x > $m ]] && m=$x\ndone\necho $m\nfor x\ndo\n    [ $((x % 2)) -eq 0 ] && echo "$x pair"\ndone',["9","12","-4","30"]]];
const SYMS7={"$":["＄","$"],'"':['"','"'],"$1":["＄1","$1"],"$2":["＄2","$2"],"$0":["＄0","$0"],"$#":["＄#","$#"],"$@":['"＄@"','"$@"'],calc:["＄((…))","$(( ))"],sub:["＄(…)","$( )"],"[[":["[[ ]]","[[  ]]"],
  for:["for","for "],in:["in","in "],do:["do","do"],done:["done","done"],if:["if","if "],then:["then","then"],else:["else","else"],fi:["fi","fi"],while:["while","while "],read:["read","read "],"-le":["-le","-le "],"-gt":["-gt","-gt "],"-f":["-f","-f "],"-d":["-d","-d "],"<":["<","< "],"|":["|","| "]};
const SYMP=["",'$ " $1 $2 $# $0 calc sub','$ " $@ $1 calc for in do done while [[ -le read <','$ " $@ $1 calc sub for in do done if then else fi [[ -gt -f -d |'];
const lance7=(nom,v)=>"./"+nom+(v.A.length?" "+v.A.join(" "):""),vue7=(s,etat)=>etat?s.sortie.concat(["#fichiers"],etat7(s.T)):s.sortie;
const norm7=s=>String(s==null?"":s).normalize("NFKC").replace(/[“”«»]/g,'"').replace(/[’‘]/g,"'").replace(/[−–—]/g,"-").replace(/\u00a0/g," ");
/* pour la correction d'un script écrit, une boucle se note en trois lignes : l'en-tête, le corps, done */
const coupe7=([code,why,pts])=>{const L=code.split("\n"),d=L.indexOf("do"),z=L[L.length-1];
  if(!/^(for|while|until) /.test(L[0])||d<0||!/^done( |$)/.test(z)||d>=L.length-2)return [[code,why,pts]];
  const corps=L.slice(d+1,-1).join("\n");
  return [[L.slice(0,d+1).join("\n"),why],[corps,/^\s*if /.test(corps)||/\]\] && /.test(corps)?"Le corps de la boucle, refait à chaque tour : le test choisit ce qu'on fait de l'élément du tour.":"Le corps de la boucle, refait à chaque tour avec la valeur du tour."],
    [z,z==="done"?"done ferme la boucle : ce qui vient après ne se fait qu'une fois, après le dernier tour.":`done ferme la boucle, et ${cr(z.slice(5))} branche le fichier sur elle : read en lit une ligne à chaque tour.`,0.5]];};
function exoScript(R,p){const [,nat,f]=R.choix(S7P[p]),X=f(R);if(!X)return null;
  const lire=p===0;if(!lire)X.pas=X.pas.flatMap(coupe7);const nom=X.nom,ref=X.pas.map(x=>x[0]).join("\n"),etat=!!X.etat,vers=(X.vers||[{A:X.A,T:X.T}]).map(v=>({A:v.A||[],T:v.T||arboDe([])})),v0=vers[0];
  const joue=src=>vers.map(v=>lanceScript(src,v.T,v.A,nom)),O7=S=>S.map(s=>vue7(s,etat).map(propre));
  const S=joue(ref),pb=S.find(s=>!s.sortie);if(pb)throw new Error("script de référence refusé : "+ref+" → "+(pb.err||pb.inconnu));
  const bon=O7(S),att=S[0].sortie,attP=att.map(propre);
  if(lire?(!att.length||att.length>7||att.some(x=>!propre(x))):(!etat&&!att.length))return null;
  for(const a of X.alt||[]){const Sa=joue(a);if(Sa.some(s=>!s.sortie)||!O7(Sa).every((o,i)=>pareil(o,bon[i])))throw new Error("autre écriture fausse : "+a);}
  const mut=[];for(const [type,de,en,msg] of X.mut||[]){if(!ref.includes(de))continue;const src=ref.replace(de,en),Sm=joue(src);if(Sm.some(s=>!s.sortie))continue;const O=O7(Sm);
    if(lire?pareil(O[0],bon[0]):O.every((o,i)=>pareil(o,bon[i])))continue;
    const k=X.pas.findIndex(x=>x[0].includes(de.split("\n").find(Boolean)||de));mut.push({type,src,O,Sm,msg,k:k<0?X.pas.length:k});}
  const fausse=mut.find(m=>!lire||m.O[0].length);if(!fausse)return null;
  const ex=lance7(nom,v0),arb=T=>blocr(dessin(noeud(T,COURANT),".")),fich=X.montre&&X.montre!=="arbre"?noeud(v0.T,absolu(X.montre)):null,voir=X.montre==="arbre";
  const q=lire?`Le script ${cr(nom)} ci-dessous est lancé par ${cr(ex)}${voir?", dans le dossier affiché":""}. Qu'affiche-t-il ?`:`Écris un script Bash ${cr(nom)} qui ${X.dit}.`;
  const corps=lire?(voir?arb(v0.T)+"<p>Le script&nbsp;:</p>":"")+blocr(ref)
    :(voir?`<p>Le dossier courant&nbsp;:</p>${arb(v0.T)}`:fich?`<p>Le fichier ${cr(X.montre)}&nbsp;:</p>${blocr(contenu(fich).join("\n"))}`:"")
     +`<p>Par exemple, ${etat?`après ${cr(ex)}, le dossier courant devient&nbsp;:</p>${arb(S[0].T)}`:`${cr(ex)} affiche&nbsp;:</p>${pave(att)}`}`;
  const E=[...X.pas.map(([code,why,pts])=>({w:blocr(code),why,pts:pts===undefined?1:pts})),lire
    ?{w:`<b>Le script affiche</b>&nbsp;:${pave(att)}`,why:X.fin||"Les commandes se font dans l'ordre, de haut en bas ; une boucle refait son bloc à chaque tour.",pts:1}
    :{w:`Le script entier&nbsp;:${blocr(ref)}`,why:`${etat?`Après ${cr(ex)}, le dossier courant contient&nbsp;: ${arb(S[0].T)}`:`${cr(ex)} affiche&nbsp;: ${montre(att)}`}${X.alt&&X.alt.length?` On peut aussi écrire&nbsp;:${blocr(X.alt[0])}`:""}`,pts:0.5}];
  const fin=E.length-1,faux=(ch,resume)=>(etape,type,titre,msg)=>({ok:false,faux:[ch],resume,diag:etape==null?{type,titre:d36(titre),msg}:{etape,type,titre:d36(titre),msg}});
  const ecart=(St,i)=>{const v=vers[i],s=St[i],memeArbre=pareil(etat7(s.T),etat7(S[i].T)),ici=`${cr(lance7(nom,v))}${i&&(voir||etat)?`, dans ce dossier&nbsp;: ${arb(v.T)}`:""}`;
    return `${i?`Avec l'exemple de l'énoncé, ton script tombe juste. Mais avec ${ici}`:`Avec ${ici}`}, ${etat&&!memeArbre?`le dossier devient&nbsp;: ${arb(s.T)} Il fallait&nbsp;: ${arb(S[i].T)}`:`il affiche&nbsp;: ${pave(s.sortie)} Il fallait&nbsp;: ${pave(S[i].sortie)}`}${s.avert.length?` bash écrit aussi l'erreur&nbsp;: ${cr(s.avert[0])}`:""}`;};
  const plat=s=>s.replace(/\s+/g," ").trim();
  const juge=lire?rep=>{const L0=String(rep.s==null?"":rep.s).split("\n").map(propre).filter(Boolean),non=faux("s","Pas tout à fait : ce n'est pas ce que le script affiche.");
      if(!L0.length)return {incomplet:"Écris ce que le script affiche, ligne par ligne."};
      const L=L0.length===1&&att.length>1&&att.every(x=>!/[ ,;]/.test(x))?L0[0].split(/[ ,;]+/).filter(Boolean):L0;
      if(pareil(L,attP))return {ok:true};
      const m=mut.find(m=>pareil(L,m.O[0]));if(m)return non(m.k,m.type,"Où ça part : "+m.type+".",m.msg);
      if(pareil(L.slice().sort(),attP.slice().sort()))return non(fin,"lignes dans le mauvais ordre","Où ça part : l'ordre des lignes.","Ce sont les bonnes lignes, mais pas dans le bon ordre : le script se lit de haut en bas, et une boucle fait ses tours dans l'ordre.");
      const j=L.findIndex((x,k)=>x!==attP[k]);
      return non(fin,"affichage différent","Où ça part : ce que le script affiche.",`${j===1?"Ta première ligne est juste. ":j>1?`Tes ${j} premières lignes sont justes. `:""}Reprends le script ligne par ligne, en notant la valeur de chaque variable : la correction le fait pas à pas.`);}
    :rep=>{const t=norm7(rep.c).trim(),non=faux("c","Pas tout à fait : ce script ne fait pas ce que demande l'énoncé.");if(!t)return {incomplet:"Écris le script."};
      const sansNote=t.replace(/(^|\s)#.*$/gm,"$1");for(const [re,m] of X.sans||[])if(re.test(sansNote))return {incomplet:m};
      const St=vers.map(v=>lanceScript(t,v.T,v.A,nom)),pb2=St.find(s=>!s.sortie);
      if(pb2)return pb2.inconnu?{incomplet:d36(esc(pb2.inconnu))}:non(null,"script qui ne marche pas","Où ça part : bash ne peut pas aller au bout de ton script.",d36(esc(pb2.err)));
      const O=O7(St);if(O.every((o,i)=>pareil(o,bon[i])))return {ok:true};
      const i=O.findIndex((o,k)=>!pareil(o,bon[k])),C=mut.filter(m=>m.O.every((o,k)=>pareil(o,O[k]))),m=C.find(m=>plat(m.src)===plat(t))||C[0];
      if(m)return non(m.k,m.type,"Où ça part : "+m.type+".",`${m.msg} ${ecart(St,i)}`);
      return non(fin,"résultat différent","Où ça part : ce que fait le script.",ecart(St,i));};
  const cas=(v,src,et2)=>{const r=lanceScript(src,v.T,v.A,nom);return {arbo:v.T,cmd:src,args:v.A,nom:"./"+nom,script:true,brut:true,ordre:true,etat:et2,abs:r.sortie?(et2?r.sortie.concat(["#fichiers"],etat7(r.T)):r.sortie):null};};
  const bash=[...vers.map(v=>cas(v,ref,etat)),...(X.alt||[]).map(a=>cas(v0,a,etat)),...mut.map(m=>cas(v0,m.src,etat)),...[0,1].map(()=>{const [b,A]=R.choix(BANC7);return cas({T:ARBO7,A},b,true);})].filter(x=>x.abs!==null);
  return {sig:lire?"S0"+ref+"|"+ex+"|"+(voir?etat7(v0.T).join(","):""):"S"+p+brut(q)+"|"+ex+"|"+etat7(v0.T).join(",")+"|"+(fich?contenu(fich).join(","):""),
    q,corps,texte:brut(q)+" — "+(lire?ref.replace(/\n/g," ⏎ "):ex),
    champs:lire?[{k:"code",id:"s",nom:"affichage",label:"Ce que le script affiche, ligne par ligne&nbsp;:",lignes:Math.max(3,att.length+1)}]
      :[{k:"code",id:"c",nom:"script",label:`Le script ${cr(nom)}&nbsp;:`,lignes:Math.max(6,ref.split("\n").length+2),ex:"#!/bin/bash",sym:SYMP[p].split(" ").map(k=>SYMS7[k]).filter(Boolean),aide:`Ton script est lancé avec l'exemple de l'énoncé, puis avec d'autres ${voir||etat?"dossiers":"paramètres"}.`}],
    juge,etapes:E,bonne:lire?pave(att):blocr(ref),bonneTxt:lire?att.join(" ⏎ "):ref.replace(/\n/g," ⏎ "),repBonne:lire?{s:att.join("\n")}:{c:ref},repFausse:lire?{s:fausse.Sm[0].sortie.join("\n")}:{c:fausse.src},nature:nat,
    ens:{lire,nom,ref,alt:X.alt||[],etat,pieges:mut.map(m=>({type:m.type,src:m.src,sortie:m.O[0]})),bash}};}
const tireScript=p=>R=>{for(;;){const e=exoScript(R,p);if(e)return e;}};

/* ---------- US8 : un petit Python qui joue un programme entier : listes, chaînes, dictionnaires, fichiers, sys.argv, os.listdir, récursion, et les erreurs de Python ---------- */
class PE{constructor(t,m,l){this.t=t;this.m=m;this.l=l||0;}}
class NonPris{constructor(m){this.m=m;}}
const pe=(t,m)=>{throw new PE(t,m);},nonPris=m=>{throw new NonPris(m);};
class Fl{constructor(v){this.v=v;}}
class Tu{constructor(a){this.a=a;}}
class Di{constructor(){this.m=new Map();}}
class Rg{constructor(a,b,s){this.a=a;this.b=b;this.s=s;}}
class Vu{constructor(k,d){this.k=k;this.d=d;}}
class Fn{constructor(def,dv,clo){this.def=def;this.dv=dv;this.clo=clo;}}
class Bi{constructor(n,f){this.n=n;this.f=f;}}
class Mo{constructor(n,a,non){this.n=n;this.a=a;this.non=non;}}
class Ex{constructor(n){this.n=n;}}
class Fi{constructor(x,mode,nom){this.x=x;this.mode=mode;this.nom=nom;this.pos=0;this.ouvert=true;}}
class Ma{constructor(m){this.m=m;}}
const BOUCLE8={boucle:true},SORTIE8={sortie:true},PAS8=40000,PROF8=150;
const MOTS8=new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));

function lexPy(src){
  const s=src.replace(/\r\n?/g,"\n")+"\n",T=[],pile=[0];let i=0,l=1,prof=0,debut=true;
  const err=(t,m)=>{throw new PE(t,m,l);},tok=(t,v,x)=>T.push(Object.assign({t,v,l},x));
  const chaine=pre=>{const q=s.startsWith(s[i].repeat(3),i)?s[i].repeat(3):s[i],brut=/r/i.test(pre);i+=q.length;let v="";
    for(;;){if(i>=s.length)err("SyntaxError","unterminated string literal");
      if(s.startsWith(q,i)){i+=q.length;return v;}
      const c=s[i];
      if(c==="\n"){if(q.length===1)err("SyntaxError","unterminated string literal");v+=c;i++;l++;continue;}
      if(c==="\\"){const d=s[i+1];if(d==="\n"){i+=2;l++;if(brut)v+="\\\n";continue;}
        if(brut){v+=c+d;i+=2;continue;}
        const E={n:"\n",t:"\t",r:"\r","\\":"\\","'":"'",'"':'"',"0":"\0",a:"\x07",b:"\b",f:"\f",v:"\v"};
        if(d in E){v+=E[d];i+=2;}else{v+=c;i++;}continue;}
      v+=c;i++;}};
  while(i<s.length){
    if(debut){let w=0,j=i;while(s[j]===" "||s[j]==="\t"){w=s[j]==="\t"?(w>>3<<3)+8:w+1;j++;}
      if(s[j]==="\n"||s[j]==="#"){while(s[j]!=="\n")j++;i=j+1;l++;continue;}
      if(s[j]==="\\"&&s[j+1]==="\n"){i=j+2;l++;continue;}
      i=j;debut=false;const h=pile[pile.length-1];
      if(w>h){pile.push(w);tok("indent");}
      else if(w<h){while(w<pile[pile.length-1]){pile.pop();tok("dedent");}if(w!==pile[pile.length-1])err("IndentationError","unindent does not match any outer indentation level");}
      continue;}
    const c=s[i];
    if(c==="\n"){if(!prof){tok("nl");debut=true;}i++;l++;continue;}
    if(c===" "||c==="\t"||c==="\f"){i++;continue;}
    if(c==="#"){while(s[i]!=="\n")i++;continue;}
    if(c==="\\"&&s[i+1]==="\n"){i+=2;l++;continue;}
    if(c==="'"||c==='"'){const l0=l;tok("str",chaine(""),{l:l0});continue;}
    const id=/^[\p{L}_][\p{L}\p{N}_]*/u.exec(s.slice(i,i+80));
    if(id){const w=id[0];i+=w.length;
      if((s[i]==="'"||s[i]==='"')&&/^(r|f|b|u|rf|fr|br|rb)$/i.test(w)){const l0=l,v=chaine(w);if(/b/i.test(w))nonPris("Les octets (b\"…\") ne servent pas dans ces exercices : écris une chaîne normale.");tok(/f/i.test(w)?"fstr":"str",v,{l:l0});continue;}
      tok("name",w);continue;}
    const n=/^(?:\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)/.exec(s.slice(i,i+60));
    if(n){const w=n[0].replace(/_/g,"");i+=n[0].length;if(/^[\p{L}_]/u.test(s[i]||""))err("SyntaxError","invalid decimal literal");
      if(/^0\d/.test(w)&&!/[.eE]/.test(w)&&+w!==0)err("SyntaxError","leading zeros in decimal integer literals are not permitted");
      tok("num",/[.eE]/.test(w)?new Fl(parseFloat(w)):parseInt(w,10));continue;}
    const o=["**=","//=",">>=","<<=","...","**","//","==","!=","<=",">=","+=","-=","*=","/=","%=","&=","|=","^=","->","<<",">>",":="].find(x=>s.startsWith(x,i))||("+-*/%<>=()[]{},:.;@&|^~".includes(c)?c:null);
    if(!o)err("SyntaxError",c==="!"?"invalid syntax":`invalid character '${c}' (U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")})`);
    if("([{".includes(o))prof++;else if(")]}".includes(o)){if(!prof)err("SyntaxError",`unmatched '${o}'`);prof--;}
    tok("op",o);i+=o.length;}
  if(prof)err("SyntaxError","'(' was never closed");
  if(T.length&&T[T.length-1].t!=="nl")tok("nl");
  while(pile.length>1){pile.pop();tok("dedent");}
  tok("eof");return T;
}

function portee8(body,P){const loc=new Set(P.map(x=>x.n)),glob=new Set(),nonloc=new Set();
  const cib=e=>{if(!e)return;if(e.k==="nom")loc.add(e.n);else if(e.k==="tuple"||e.k==="list")e.L.forEach(cib);else if(e.k==="par")cib(e.e);};
  const va=S=>{for(const s of S)switch(s.k){
    case "assign":s.tg.forEach(cib);break;case "aug":cib(s.tg);break;
    case "for":cib(s.tg);va(s.body);if(s.orelse)va(s.orelse);break;
    case "while":va(s.body);if(s.orelse)va(s.orelse);break;
    case "if":s.tests.forEach(x=>va(x[1]));if(s.orelse)va(s.orelse);break;
    case "with":if(s.as)cib(s.as);va(s.body);break;
    case "try":va(s.body);s.H.forEach(h=>{if(h.as)loc.add(h.as);va(h.body);});if(s.orelse)va(s.orelse);if(s.fin)va(s.fin);break;
    case "def":loc.add(s.n);break;
    case "import":s.N.forEach(([m,a])=>loc.add(a||m.split(".")[0]));break;
    case "from":s.N.forEach(([n,a])=>loc.add(a||n));break;
    case "global":s.N.forEach(n=>(s.non?nonloc:glob).add(n));break;
    case "del":cib(s.tg);break;}};
  va(body);for(const g of [...glob,...nonloc])loc.delete(g);return {loc,glob,nonloc};}

function parsePy(T,exprSeule){let p=0,nf=0,nb=0;
  const est=t=>T[p].t===t,op=v=>T[p].t==="op"&&T[p].v===v,kw=v=>T[p].t==="name"&&T[p].v===v,va=()=>T[p++];
  const synt=m=>{throw new PE("SyntaxError",m||"invalid syntax",T[p].l);};
  const attend=v=>{if(op(v))return va();if(v===":"&&op("="))synt("invalid syntax. Maybe you meant '==' or ':=' instead of '='?");if(v===":")synt("expected ':'");synt(`'${v}' was expected`);};
  const nom=()=>{if(!est("name")||MOTS8.has(T[p].v))synt();return va().v;};
  const AUG=["+=","-=","*=","/=","//=","%=","**="];
  const verif=e=>{if(e.k==="nom"||e.k==="sub"||e.k==="attr")return;if(e.k==="tuple"||e.k==="list"){e.L.forEach(verif);return;}if(e.k==="par"){verif(e.e);return;}
    synt(e.k==="call"?"cannot assign to function call here. Maybe you meant '==' instead of '='?":e.k==="cst"?"cannot assign to literal here. Maybe you meant '==' instead of '='?":"cannot assign to expression here. Maybe you meant '==' instead of '='?");};
  const bloc=quoi=>{if(!est("nl"))return simples();va();
    if(!est("indent"))throw new PE("IndentationError",`expected an indented block after ${quoi}`,T[p].l);
    va();const S=[];while(!est("dedent")&&!est("eof"))S.push(...instr());if(est("dedent"))va();return S;};
  function instr(){const t=T[p];
    if(t.t==="indent")throw new PE("IndentationError","unexpected indent",t.l);
    if(t.t==="nl"){va();return [];}
    if(t.t==="name")switch(t.v){
      case "if":{va();const c=expr();attend(":");const tests=[[c,bloc(`'if' statement on line ${t.l}`)]];let orelse=null;
        while(kw("elif")){const l=va().l;const c2=expr();attend(":");tests.push([c2,bloc(`'elif' statement on line ${l}`)]);}
        if(kw("else")){const l=va().l;attend(":");orelse=bloc(`'else' statement on line ${l}`);}
        return [{k:"if",tests,orelse,l:t.l}];}
      case "while":{va();const c=expr();attend(":");nb++;const body=bloc(`'while' statement on line ${t.l}`);nb--;let orelse=null;if(kw("else")){va();attend(":");orelse=bloc("'else' statement");}return [{k:"while",c,body,orelse,l:t.l}];}
      case "for":{va();const tg=cibles();if(!kw("in"))synt();va();const it=liste();attend(":");nb++;const body=bloc(`'for' statement on line ${t.l}`);nb--;let orelse=null;if(kw("else")){va();attend(":");orelse=bloc("'else' statement");}return [{k:"for",tg,it,body,orelse,l:t.l}];}
      case "def":{va();const n=nom();attend("(");const P=[];
        while(!op(")")){if(op("*")||op("**"))nonPris("Les paramètres *args et **kwargs ne servent pas dans ces exercices.");const q={n:nom(),d:null};if(op(":")){va();expr();}if(op("=")){va();q.d=expr();}P.push(q);if(!op(","))break;va();}
        attend(")");if(op("->")){va();expr();}attend(":");const nb0=nb;nb=0;nf++;const body=bloc(`function definition on line ${t.l}`);nf--;nb=nb0;return [Object.assign({k:"def",n,P,body,l:t.l},portee8(body,P))];}
      case "with":{va();const e=expr();let as=null;if(kw("as")){va();as={k:"nom",n:nom()};}if(op(","))nonPris("Ouvre un seul fichier par with.");attend(":");return [{k:"with",e,as,body:bloc(`'with' statement on line ${t.l}`),l:t.l}];}
      case "try":{va();attend(":");const body=bloc(`'try' statement on line ${t.l}`),H=[];
        while(kw("except")){va();let ty=null,as=null;if(!op(":")){ty=expr();if(kw("as")){va();as=nom();}}attend(":");H.push({ty,as,body:bloc("'except' statement")});}
        let orelse=null,fin=null;if(kw("else")){va();attend(":");orelse=bloc("'else' statement");}if(kw("finally")){va();attend(":");fin=bloc("'finally' statement");}
        if(!H.length&&!fin)synt("expected 'except' or 'finally' block");return [{k:"try",body,H,orelse,fin,l:t.l}];}
      case "class":nonPris("Les classes ne servent pas dans ces exercices : écris des fonctions avec def.");
      case "elif":case "else":case "except":case "finally":synt();
    }
    return simples();}
  function simples(){const S=[simple()];while(op(";")){va();if(est("nl"))break;S.push(simple());}if(!est("nl")&&!est("eof"))synt();if(est("nl"))va();return S;}
  function simple(){const t=T[p];
    if(t.t==="name")switch(t.v){
      case "pass":va();return {k:"pass",l:t.l};
      case "break":if(!nb)synt("'break' outside loop");va();return {k:"break",l:t.l};
      case "continue":if(!nb)synt("'continue' not properly in loop");va();return {k:"continue",l:t.l};
      case "return":{if(!nf)synt("'return' outside function");va();return {k:"return",e:est("nl")||op(";")||est("eof")?null:liste(),l:t.l};}
      case "import":{va();const N=[];for(;;){let m=nom();while(op(".")){va();m+="."+nom();}let a=null;if(kw("as")){va();a=nom();}N.push([m,a]);if(!op(","))break;va();}return {k:"import",N,l:t.l};}
      case "from":{va();let m=nom();while(op(".")){va();m+="."+nom();}if(!kw("import"))synt();va();const N=[];
        if(op("*")){va();N.push(["*",null]);}else{const par=op("(");if(par)va();for(;;){const n=nom();let a=null;if(kw("as")){va();a=nom();}N.push([n,a]);if(!op(","))break;va();if(par&&op(")"))break;}if(par)attend(")");}
        return {k:"from",m,N,l:t.l};}
      case "global":case "nonlocal":{va();const N=[nom()];while(op(",")){va();N.push(nom());}return {k:"global",N,non:t.v==="nonlocal",l:t.l};}
      case "del":{va();const tg=liste();verif(tg);return {k:"del",tg,l:t.l};}
      case "raise":{va();return {k:"raise",e:est("nl")?null:expr(),l:t.l};}
      case "assert":{va();const e=expr();let m=null;if(op(",")){va();m=expr();}return {k:"assert",e,m,l:t.l};}
    }
    const e=liste();
    if(e.k==="nom"&&e.n==="print"&&!est("nl")&&!est("eof")&&!op("=")&&!op(";")&&!AUG.some(op))synt("Missing parentheses in call to 'print'. Did you mean print(...)?");
    if(op("=")){const tg=[e];let v;for(;;){va();v=liste();if(op("="))tg.push(v);else break;}tg.forEach(verif);return {k:"assign",tg,e:v,l:t.l};}
    const a=AUG.find(op);
    if(a){va();if(e.k==="tuple"||e.k==="list")synt(`'${e.k}' is an illegal expression for augmented assignment`);verif(e);return {k:"aug",tg:e,o:a.slice(0,-1),e:liste(),l:t.l};}
    if(op(":="))nonPris("L'opérateur := ne sert pas dans ces exercices : écris l'affectation sur sa propre ligne.");
    return {k:"expr",e,l:t.l};}
  function liste(){const e=expr();if(!op(","))return e;const L=[e];while(op(",")){va();if(est("nl")||est("eof")||op("=")||op(")")||op(":")||op(";")||AUG.some(op))break;L.push(expr());}return {k:"tuple",L};}
  function cibles(){const L=[ou_(true)];while(op(",")){va();if(kw("in"))break;L.push(ou_(true));}const e=L.length===1?L[0]:{k:"tuple",L};verif(e);return e;}
  function expr(){
    if(kw("lambda")){va();const P=[];while(!op(":")){P.push({n:nom(),d:null});if(op(","))va();}va();return {k:"lambda",P,b:expr()};}
    const e=ou_();if(kw("if")){va();const c=ou_();if(!kw("else"))synt("expected 'else' after 'if' expression");va();return {k:"ifexp",c,a:e,b:expr()};}return e;}
  function ou_(cible){if(cible)return bin(0);let e=et_();while(kw("or")){va();e={k:"or",a:e,b:et_()};}return e;}
  function et_(){let e=non_();while(kw("and")){va();e={k:"and",a:e,b:non_()};}return e;}
  function non_(){if(kw("not")){va();return {k:"not",a:non_()};}return comp();}
  function comp(){const E=[bin(0)],O=[];for(;;){let o=null;
      if(["<",">","==","!=","<=",">="].some(op))o=va().v;
      else if(kw("in")){va();o="in";}
      else if(kw("not")&&T[p+1].t==="name"&&T[p+1].v==="in"){p+=2;o="not in";}
      else if(kw("is")){va();o="is";if(kw("not")){va();o="is not";}}
      else break;
      O.push(o);E.push(bin(0));}
    return O.length?{k:"cmp",O,E}:E[0];}
  const NIV=[["|"],["^"],["&"],["<<",">>"],["+","-"],["*","/","//","%","@"]];
  function bin(n){if(n===NIV.length)return unaire();let e=bin(n+1);while(NIV[n].some(op)){const o=va().v;e={k:"bin",o,a:e,b:bin(n+1)};}return e;}
  function unaire(){if(op("-")||op("+")||op("~")){const o=va().v;return {k:"un",o,a:unaire()};}return puiss();}
  function puiss(){const a=postfixe();if(op("**")){va();return {k:"bin",o:"**",a,b:unaire()};}return a;}
  function postfixe(){let e=atome();for(;;){
      if(op("(")){const l=va().l,A=[],K=[];
        while(!op(")")){
          if(op("**"))nonPris("**kwargs ne sert pas dans ces exercices.");
          if(op("*")){va();A.push({k:"etoile",e:expr()});}
          else if(est("name")&&T[p+1].t==="op"&&T[p+1].v==="="){const n=va().v;va();K.push([n,expr()]);}
          else{const x=expr();A.push(kw("for")?compr("list",x,null):x);}
          if(!op(","))break;va();}
        attend(")");e={k:"call",f:e,A,K,l};}
      else if(op("[")){va();const i=indice();attend("]");e={k:"sub",o:e,i};}
      else if(op(".")){va();e={k:"attr",o:e,n:nom()};}
      else return e;}}
  function indice(){const part=()=>op(":")||op("]")?null:expr();const a=part();
    if(!op(":")){if(a===null)synt();if(op(",")){const L=[a];while(op(",")){va();if(op("]"))break;L.push(expr());}return {k:"tuple",L};}return a;}
    va();const b=part();let c=null;if(op(":")){va();c=part();}return {k:"slice",a,b,c};}
  function fstring(u){const s=u.v,P=[];let i=0,lit="";
    while(i<s.length){const c=s[i];
      if(c==="{"&&s[i+1]==="{"){lit+="{";i+=2;continue;}
      if(c==="}"&&s[i+1]==="}"){lit+="}";i+=2;continue;}
      if(c==="}")throw new PE("SyntaxError","f-string: single '}' is not allowed",u.l);
      if(c!=="{"){lit+=c;i++;continue;}
      if(lit)P.push({k:"cst",v:lit});lit="";
      let j=i+1,d=0,q=null;
      for(;j<s.length;j++){const x=s[j];if(q){if(x===q)q=null;continue;}if(x==="'"||x==='"')q=x;else if("([{".includes(x))d++;else if(")]}".includes(x)){if(x==="}"&&!d)break;d--;}else if((x===":"||x==="!"&&s[j+1]!=="=")&&!d)break;}
      const src=s.slice(i+1,j);let conv=null,spec="";
      if(s[j]==="!"){conv=s[j+1];j+=2;}
      if(s[j]===":"){const k=s.indexOf("}",j);if(k<0)throw new PE("SyntaxError","f-string: expecting '}'",u.l);spec=s.slice(j+1,k);j=k;}
      if(s[j]!=="}")throw new PE("SyntaxError","f-string: expecting '}'",u.l);
      if(!src.trim())throw new PE("SyntaxError","f-string: valid expression required before '}'",u.l);
      let e;try{e=parsePy(lexPy("("+src+")"),true);}catch(x){if(x instanceof PE)x.l=u.l;throw x;}
      P.push({k:"fmt",e,conv,spec});i=j+1;}
    if(lit)P.push({k:"cst",v:lit});return {k:"concat",P};}
  function compr(kind,a,b){const G=[];while(kw("for")){va();const tg=cibles();if(!kw("in"))synt();va();const it=ou_(),C=[];while(kw("if")){va();C.push(ou_());}G.push({tg,it,C});}return {k:"compr",kind,a,b,G};}
  function atome(){const t=T[p];
    if(t.t==="num"){va();return {k:"cst",v:t.v};}
    if(t.t==="str"||t.t==="fstr"){const P=[];while(est("str")||est("fstr")){const u=va();P.push(u.t==="str"?{k:"cst",v:u.v}:fstring(u));}return P.length===1?P[0]:{k:"concat",P};}
    if(t.t==="name"){va();if(t.v==="True")return {k:"cst",v:true};if(t.v==="False")return {k:"cst",v:false};if(t.v==="None")return {k:"cst",v:null};
      if(MOTS8.has(t.v)){p--;synt();}return {k:"nom",n:t.v,l:t.l};}
    if(op("(")){va();if(op(")")){va();return {k:"tuple",L:[]};}const e=expr();
      if(kw("for")){const g=compr("list",e,null);attend(")");return g;}
      if(op(",")){const L=[e];while(op(",")){va();if(op(")"))break;L.push(expr());}attend(")");return {k:"tuple",L};}
      attend(")");return {k:"par",e};}
    if(op("[")){va();if(op("]")){va();return {k:"list",L:[]};}const e=expr();
      if(kw("for")){const g=compr("list",e,null);attend("]");return g;}
      const L=[e];while(op(",")){va();if(op("]"))break;L.push(expr());}attend("]");return {k:"list",L};}
    if(op("{")){va();if(op("}")){va();return {k:"dict",P:[]};}const a=expr();
      if(op(":")){va();const b=expr();if(kw("for")){const g=compr("dict",a,b);attend("}");return g;}
        const P=[[a,b]];while(op(",")){va();if(op("}"))break;const k=expr();attend(":");P.push([k,expr()]);}attend("}");return {k:"dict",P};}
      nonPris("Les ensembles (set, entre accolades) ne servent pas dans ces exercices : utilise une liste ou un dictionnaire.");}
    if(t.t==="indent")throw new PE("IndentationError","unexpected indent",t.l);
    synt();}
  if(exprSeule){const e=expr();if(!est("nl")&&!est("eof"))synt();return e;}
  const S=[];while(!est("eof"))S.push(...instr());return S;
}

const estInt8=v=>typeof v==="number"||typeof v==="boolean",estNum8=v=>estInt8(v)||v instanceof Fl,nv8=v=>v instanceof Fl?v.v:+v;
function tn8(v){if(v===null)return "NoneType";if(typeof v==="boolean")return "bool";if(typeof v==="number")return "int";if(typeof v==="string")return "str";if(Array.isArray(v))return "list";
  if(v instanceof Fl)return "float";if(v instanceof Tu)return "tuple";if(v instanceof Di)return "dict";if(v instanceof Rg)return "range";if(v instanceof Vu)return "dict_"+v.k;
  if(v instanceof Fn)return "function";if(v instanceof Bi)return "builtin_function_or_method";if(v instanceof Mo)return "module";if(v instanceof Fi)return "_io.TextIOWrapper";if(v instanceof Ma)return "re.Match";if(v instanceof Ex)return "type";
  if(v&&v.exc)return v.exc;return "object";}
function frepr8(x){if(x===Infinity)return "inf";if(x===-Infinity)return "-inf";if(Number.isNaN(x))return "nan";
  if(Object.is(x,-0))return "-0.0";const a=Math.abs(x);
  if(a!==0&&(a<1e-4||a>=1e16)){const [m,e]=x.toExponential().split("e"),n=+e;return m+"e"+(n<0?"-":"+")+String(Math.abs(n)).padStart(2,"0");}
  const s=String(x);return /[.e]/.test(s)?s:s+".0";}
function srepr8(s){const q=s.includes("'")&&!s.includes('"')?'"':"'";let r=q;
  for(const c of s){const k=c.codePointAt(0);
    if(c==="\\")r+="\\\\";else if(c===q)r+="\\"+q;else if(c==="\n")r+="\\n";else if(c==="\t")r+="\\t";else if(c==="\r")r+="\\r";
    else if(k<32||k===127)r+="\\x"+k.toString(16).padStart(2,"0");else r+=c;}
  return r+q;}
function repr8(v,vus){if(v===null)return "None";if(v===true)return "True";if(v===false)return "False";if(typeof v==="number")return String(v);if(typeof v==="string")return srepr8(v);
  if(v instanceof Fl)return frepr8(v.v);vus=vus||new Set();
  if(Array.isArray(v)){if(vus.has(v))return "[...]";vus.add(v);const r="["+v.map(x=>repr8(x,vus)).join(", ")+"]";vus.delete(v);return r;}
  if(v instanceof Tu)return "("+v.a.map(x=>repr8(x,vus)).join(", ")+(v.a.length===1?",":"")+")";
  if(v instanceof Di){if(vus.has(v))return "{...}";vus.add(v);const r="{"+[...v.m.values()].map(([k,x])=>repr8(k,vus)+": "+repr8(x,vus)).join(", ")+"}";vus.delete(v);return r;}
  if(v instanceof Rg)return `range(${v.a}, ${v.b}${v.s!==1?", "+v.s:""})`;
  if(v instanceof Vu)return `dict_${v.k}(${repr8(vuListe8(v),vus)})`;
  if(v instanceof Fn)return `<function ${v.def.n}>`;if(v instanceof Bi)return `<built-in function ${v.n}>`;if(v instanceof Mo)return `<module '${v.n}'>`;
  if(v instanceof Ex)return `<class '${v.n}'>`;if(v instanceof Fi)return `<_io.TextIOWrapper name='${v.nom}' mode='${v.mode}' encoding='UTF-8'>`;
  if(v instanceof Ma)return `<re.Match object; span=(${v.m.index}, ${v.m.index+v.m[0].length}), match=${srepr8(v.m[0])}>`;
  if(v&&v.exc)return `${v.exc}(${v.m===""?"":srepr8(v.m)})`;return "<object>";}
const str8=v=>typeof v==="string"?v:v&&v.exc?v.m:repr8(v);
const vrai8=v=>{if(v===null||v===false)return false;if(v===true)return true;if(typeof v==="number")return v!==0;if(typeof v==="string"||Array.isArray(v))return v.length>0;
  if(v instanceof Fl)return v.v!==0;if(v instanceof Tu)return v.a.length>0;if(v instanceof Di)return v.m.size>0;if(v instanceof Rg)return lenRg8(v)>0;if(v instanceof Vu)return v.d.m.size>0;return true;};
const lenRg8=r=>Math.max(0,Math.ceil((r.b-r.a)/r.s));
function dk8(k){if(estNum8(k)){const v=nv8(k);return Number.isInteger(v)?"n"+v:"f"+v;}if(typeof k==="string")return "s"+k;if(k===null)return "N";
  if(k instanceof Tu)return "t"+k.a.map(dk8).join("\u0001");if(k instanceof Fn||k instanceof Bi||k instanceof Mo)return "o"+tn8(k);
  pe("TypeError",`unhashable type: '${tn8(k)}'`);}
const dset8=(d,k,v)=>{const c=dk8(k),x=d.m.get(c);if(x)x[1]=v;else d.m.set(c,[k,v]);};
const dget8=(d,k)=>{const x=d.m.get(dk8(k));if(!x)pe("KeyError",repr8(k));return x[1];};
const dhas8=(d,k)=>d.m.has(dk8(k));
const vuListe8=v=>[...v.d.m.values()].map(([k,x])=>v.k==="keys"?k:v.k==="values"?x:new Tu([k,x]));
function eq8(a,b){if(a===b)return true;if(estNum8(a)&&estNum8(b))return nv8(a)===nv8(b);if(typeof a==="string"||typeof b==="string")return false;
  if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((x,i)=>eq8(x,b[i]));
  if(a instanceof Tu&&b instanceof Tu)return a.a.length===b.a.length&&a.a.every((x,i)=>eq8(x,b.a[i]));
  if(a instanceof Di&&b instanceof Di){if(a.m.size!==b.m.size)return false;for(const [c,[,x]] of a.m){const y=b.m.get(c);if(!y||!eq8(x,y[1]))return false;}return true;}
  if(a instanceof Rg&&b instanceof Rg)return eq8([...iter8(a)],[...iter8(b)]);
  if(a instanceof Ex&&b instanceof Ex)return a.n===b.n;return false;}
function ordre8(o,a,b){
  if(estNum8(a)&&estNum8(b)){const x=nv8(a),y=nv8(b);return x<y?-1:x>y?1:0;}
  if(typeof a==="string"&&typeof b==="string")return a<b?-1:a>b?1:0;
  const L=x=>Array.isArray(x)?x:x instanceof Tu?x.a:null,A=L(a),B=L(b);
  if(A&&B&&Array.isArray(a)===Array.isArray(b)){for(let k=0;k<Math.min(A.length,B.length);k++)if(!eq8(A[k],B[k]))return ordre8(o,A[k],B[k]);return A.length-B.length;}
  pe("TypeError",`'${o}' not supported between instances of '${tn8(a)}' and '${tn8(b)}'`);}
function dans8(x,c){
  if(typeof c==="string"){if(typeof x!=="string")pe("TypeError",`'in <string>' requires string as left operand, not ${tn8(x)}`);return c.includes(x);}
  if(Array.isArray(c))return c.some(y=>eq8(x,y));if(c instanceof Tu)return c.a.some(y=>eq8(x,y));
  if(c instanceof Di){dk8(x);return dhas8(c,x);}if(c instanceof Vu){if(c.k==="keys")return dhas8(c.d,x);return vuListe8(c).some(y=>eq8(x,y));}
  if(c instanceof Rg)return estNum8(x)&&Number.isInteger(nv8(x))&&[...iter8(c)].includes(nv8(x));
  if(c instanceof Fi)return [...iter8(c)].some(y=>eq8(x,y));
  pe("TypeError",`argument of type '${tn8(c)}' is not iterable`);}
function cmp8(o,a,b){switch(o){case "==":return eq8(a,b);case "!=":return !eq8(a,b);case "in":return dans8(a,b);case "not in":return !dans8(a,b);
  case "is":return a===b;case "is not":return a!==b;
  case "<":return ordre8(o,a,b)<0;case ">":return ordre8(o,a,b)>0;case "<=":return ordre8(o,a,b)<=0;case ">=":return ordre8(o,a,b)>=0;}}
function* iter8(v){
  if(Array.isArray(v)){for(let k=0;k<v.length;k++)yield v[k];return;}
  if(typeof v==="string"){yield* v;return;}
  if(v instanceof Tu){yield* v.a;return;}
  if(v instanceof Di){const L=[...v.m.values()].map(x=>x[0]),n=v.m.size;for(const k of L){yield k;if(v.m.size!==n)pe("RuntimeError","dictionary changed size during iteration");}return;}
  if(v instanceof Rg){for(let k=v.a;v.s>0?k<v.b:k>v.b;k+=v.s)yield k;return;}
  if(v instanceof Vu){yield* vuListe8(v);return;}
  if(v instanceof Fi){let l;while((l=ligneFi8(v))!=="")yield l;return;}
  pe("TypeError",`'${tn8(v)}' object is not iterable`);}
const tout8=v=>[...iter8(v)];
function binop8(o,a,b){
  if(estNum8(a)&&estNum8(b)){const F=a instanceof Fl||b instanceof Fl,x=nv8(a),y=nv8(b),r=v=>F?new Fl(v):v;
    switch(o){
      case "+":return r(x+y);case "-":return r(x-y);case "*":return r(x*y);
      case "/":if(y===0)pe("ZeroDivisionError","division by zero");return new Fl(x/y);
      case "//":if(y===0)pe("ZeroDivisionError",F?"float floor division by zero":"integer division or modulo by zero");return r(Math.floor(x/y));
      case "%":if(y===0)pe("ZeroDivisionError",F?"float modulo by zero":"integer modulo by zero");{const m=x-Math.floor(x/y)*y;return r(m);}
      case "**":if(!F&&y<0)return new Fl(Math.pow(x,y));return r(Math.pow(x,y));
      case "&":case "|":case "^":case "<<":case ">>":if(F)break;return o==="&"?x&y:o==="|"?x|y:o==="^"?x^y:o==="<<"?x<<y:x>>y;}}
  if(o==="+"){
    if(typeof a==="string"&&typeof b==="string")return a+b;
    if(Array.isArray(a)&&Array.isArray(b))return a.concat(b);
    if(a instanceof Tu&&b instanceof Tu)return new Tu(a.a.concat(b.a));
    if(typeof a==="string")pe("TypeError",`can only concatenate str (not "${tn8(b)}") to str`);
    if(Array.isArray(a))pe("TypeError",`can only concatenate list (not "${tn8(b)}") to list`);}
  if(o==="*"){const [s,n]=estInt8(b)&&!(typeof a==="number")?[a,+b]:estInt8(a)?[b,+a]:[null,0];
    if(typeof s==="string")return n>0?s.repeat(n):"";
    if(Array.isArray(s)){let q=[];for(let k=0;k<n;k++)q=q.concat(s);return q;}
    if(s instanceof Tu){let q=[];for(let k=0;k<n;k++)q=q.concat(s.a);return new Tu(q);}
    if(typeof s==="string"||Array.isArray(s))pe("TypeError",`can't multiply sequence by non-int of type '${tn8(a===s?b:a)}'`);}
  if(o==="*"&&(typeof a==="string"||Array.isArray(a))&&!estInt8(b))pe("TypeError",`can't multiply sequence by non-int of type '${tn8(b)}'`);
  if(o==="%"&&typeof a==="string")return pourcent8(a,b);
  pe("TypeError",`unsupported operand type(s) for ${o}: '${tn8(a)}' and '${tn8(b)}'`);}
function spec8(v,spec){if(!spec)return str8(v);
  const m=/^(?:(.)?([<>^=]))?([+ -])?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/.exec(spec);
  if(!m)pe("ValueError",`Invalid format specifier '${spec}' for object of type '${tn8(v)}'`);
  let [,fill,align,signe,zero,larg,,prec,type]=m;let s;
  const num=estNum8(v);
  if(type==="f"||type==="F"||type==="%"){if(!num)pe("ValueError",`Unknown format code '${type}' for object of type '${tn8(v)}'`);const x=nv8(v)*(type==="%"?100:1);s=x.toFixed(prec===undefined?6:+prec)+(type==="%"?"%":"");}
  else if(type==="d"){if(!estInt8(v))pe("ValueError",`Unknown format code 'd' for object of type '${tn8(v)}'`);s=String(+v);}
  else if(type==="s"||type===undefined&&!num){if(num&&type==="s")pe("ValueError",`Unknown format code 's' for object of type '${tn8(v)}'`);s=str8(v);if(prec!==undefined)s=s.slice(0,+prec);}
  else if(type===undefined){s=prec!==undefined&&v instanceof Fl?String(Number(nv8(v).toPrecision(+prec))):str8(v);}
  else nonPris(`Le format :${spec} ne sert pas dans ces exercices : écris str(x) ou f"{x}".`);
  if(signe==="+"&&num&&nv8(v)>=0)s="+"+s;
  const w=larg?+larg:0;if(s.length>=w)return s;
  if(zero&&!align){fill="0";align="=";}
  fill=fill||" ";align=align||(num?">":"<");const pad=fill.repeat(w-s.length);
  if(align==="<")return s+pad;if(align===">")return pad+s;if(align==="=")return /^[+-]/.test(s)?s[0]+pad+s.slice(1):pad+s;
  const g=Math.floor((w-s.length)/2);return fill.repeat(g)+s+fill.repeat(w-s.length-g);}
function pourcent8(f,b){const A=b instanceof Tu?b.a.slice():[b];let k=0;
  const r=f.replace(/%(\.\d+)?([sdifr%])/g,(t,p,c)=>{if(c==="%")return "%";if(k>=A.length)pe("TypeError","not enough arguments for format string");const v=A[k++];
    if(c==="s")return str8(v);if(c==="r")return repr8(v);if(!estNum8(v))pe("TypeError",`%${c} format: a real number is required, not ${tn8(v)}`);
    if(c==="f")return nv8(v).toFixed(p?+p.slice(1):6);return String(Math.trunc(nv8(v)));});
  if(k<A.length)pe("TypeError","not all arguments converted during string formatting");return r;}
function indice8(n,i,quoi){if(!estInt8(i))pe("TypeError",`${quoi} indices must be integers or slices, not ${tn8(i)}`);let k=+i;if(k<0)k+=n;return k;}
function getItem8(o,i){
  if(Array.isArray(o)||typeof o==="string"||o instanceof Tu){const L=o instanceof Tu?o.a:o,q=tn8(o),k=indice8(L.length,i,q==="str"?"string":q);
    if(k<0||k>=L.length)pe("IndexError",`${q==="str"?"string":q} index out of range`);return L[k];}
  if(o instanceof Di)return dget8(o,i);
  if(o instanceof Rg){const L=tout8(o),k=indice8(L.length,i,"range");if(k<0||k>=L.length)pe("IndexError","range object index out of range");return L[k];}
  if(o instanceof Ma){const g=o.m[+i];return g===undefined?null:g;}
  pe("TypeError",`'${tn8(o)}' object is not subscriptable`);}
function setItem8(o,i,v){
  if(Array.isArray(o)){const k=indice8(o.length,i,"list");if(k<0||k>=o.length)pe("IndexError","list assignment index out of range");o[k]=v;return;}
  if(o instanceof Di){dset8(o,i,v);return;}
  pe("TypeError",`'${tn8(o)}' object does not support item assignment`);}
function bornes8(n,a,b,s){s=s===null?1:s;for(const x of [a,b,s])if(x!==null&&!estInt8(x))pe("TypeError","slice indices must be integers or None or have an __index__ method");
  s=+s;if(s===0)pe("ValueError","slice step cannot be zero");
  const fix=(x,def)=>{if(x===null)return def;x=+x;if(x<0){x+=n;if(x<0)x=s<0?-1:0;}else if(x>=n)x=s<0?n-1:n;return x;};
  const d=fix(a,s<0?n-1:0),f=fix(b,s<0?-1:n),I=[];if(s>0)for(let k=d;k<f;k+=s)I.push(k);else for(let k=d;k>f;k+=s)I.push(k);return I;}
function tranche8(o,a,b,s){
  if(typeof o==="string"){const C=[...o];return bornes8(C.length,a,b,s).map(k=>C[k]).join("");}
  if(Array.isArray(o))return bornes8(o.length,a,b,s).map(k=>o[k]);
  if(o instanceof Tu)return new Tu(bornes8(o.a.length,a,b,s).map(k=>o.a[k]));
  if(o instanceof Rg){const L=tout8(o);return bornes8(L.length,a,b,s).map(k=>L[k]);}
  pe("TypeError",`'${tn8(o)}' object is not subscriptable`);}
const ESP8=" \t\n\r\x0b\x0c";
const coupe8=(s,ch,g,d)=>{const C=ch===null?ESP8:ch;let i=0,j=s.length;if(g)while(i<j&&C.includes(s[i]))i++;if(d)while(j>i&&C.includes(s[j-1]))j--;return s.slice(i,j);};
const ligneFi8=f=>{if(!f.ouvert)pe("ValueError","I/O operation on closed file.");if(f.mode!=="r")pe("io.UnsupportedOperation","not readable");const c=f.x.c,k=c.indexOf("\n",f.pos),fin=k<0?c.length:k+1,l=c.slice(f.pos,fin);f.pos=fin;return l;};
const args8=(A,K,noms,quoi)=>{const r=A.slice();for(const [n,v] of K){const k=noms.indexOf(n);if(k<0)pe("TypeError",`${quoi}() got an unexpected keyword argument '${n}'`);r[k]=v;}return r;};
const nb8=(A,a,b,quoi)=>{if(A.length<a||A.length>b)pe("TypeError",a===b?`${quoi}() takes exactly ${a===1?"one argument":a+" arguments"} (${A.length} given)`:A.length<a?`${quoi}() takes at least ${a} argument${a>1?"s":""} (${A.length} given)`:`${quoi}() takes at most ${b} argument${b>1?"s":""} (${A.length} given)`);};
const cle8=(v,K,X)=>{const f=K.find(x=>x[0]==="key");return f&&f[1]!==null?appel8(f[1],[v],[],X):v;};
function trie8(L,K,X){const rev=K.find(x=>x[0]==="reverse"),inv=rev&&vrai8(rev[1]),C=L.map(v=>[cle8(v,K,X),v]);
  C.sort((x,y)=>inv?ordre8("<",y[0],x[0]):ordre8("<",x[0],y[0]));return C.map(x=>x[1]);}
const METH8={
  str:{
    split:(s,A,K)=>{const [sep,max]=args8(A,K,["sep","maxsplit"],"split");const m=max===undefined?-1:+max;
      if(sep===undefined||sep===null){const P=[];let r=s.replace(/^[ \t\n\r\x0b\x0c]+/,"");while(r!==""){if(m>=0&&P.length===m){P.push(r.replace(/[ \t\n\r\x0b\x0c]+$/,""));break;}const k=r.search(/[ \t\n\r\x0b\x0c]/);if(k<0){P.push(r);break;}P.push(r.slice(0,k));r=r.slice(k).replace(/^[ \t\n\r\x0b\x0c]+/,"");}return P;}
      if(typeof sep!=="string")pe("TypeError",`must be str or None, not ${tn8(sep)}`);if(sep==="")pe("ValueError","empty separator");
      const P=s.split(sep);if(m>=0&&P.length>m+1)return P.slice(0,m).concat([P.slice(m).join(sep)]);return P;},
    rsplit:(s,A,K)=>{const [sep,max]=args8(A,K,["sep","maxsplit"],"rsplit");if(max===undefined||+max<0)return METH8.str.split(s,[sep===undefined?null:sep],[]);
      if(sep===undefined||sep===null)nonPris("rsplit sans séparateur ne sert pas ici : écris split().");const P=s.split(sep),m=+max;return P.length>m+1?[P.slice(0,P.length-m).join(sep)].concat(P.slice(P.length-m)):P;},
    strip:(s,A)=>coupe8(s,A[0]===undefined?null:A[0],1,1),lstrip:(s,A)=>coupe8(s,A[0]===undefined?null:A[0],1,0),rstrip:(s,A)=>coupe8(s,A[0]===undefined?null:A[0],0,1),
    join:(s,A)=>{nb8(A,1,1,"join");return tout8(A[0]).map((x,i)=>{if(typeof x!=="string")pe("TypeError",`sequence item ${i}: expected str instance, ${tn8(x)} found`);return x;}).join(s);},
    upper:s=>s.toUpperCase(),lower:s=>s.toLowerCase(),capitalize:s=>s.slice(0,1).toUpperCase()+s.slice(1).toLowerCase(),
    title:s=>s.toLowerCase().replace(/(^|[^\p{L}])(\p{L})/gu,(t,a,b)=>a+b.toUpperCase()),swapcase:s=>[...s].map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join(""),
    startswith:(s,A)=>{const p=A[0];return p instanceof Tu?p.a.some(x=>s.startsWith(x)):(typeof p!=="string"?pe("TypeError",`startswith first arg must be str or a tuple of str, not ${tn8(p)}`):s.startsWith(p));},
    endswith:(s,A)=>{const p=A[0];return p instanceof Tu?p.a.some(x=>s.endsWith(x)):(typeof p!=="string"?pe("TypeError",`endswith first arg must be str or a tuple of str, not ${tn8(p)}`):s.endsWith(p));},
    replace:(s,A)=>{nb8(A,2,3,"replace");const [a,b,n]=A;if(typeof a!=="string"||typeof b!=="string")pe("TypeError",`replace() argument 1 must be str, not ${tn8(typeof a!=="string"?a:b)}`);
      if(n===undefined||+n<0)return a===""?b+[...s].join(b)+b:s.split(a).join(b);let r="",k=0,c=0;for(;c<+n;c++){const j=s.indexOf(a,k);if(j<0)break;r+=s.slice(k,j)+b;k=j+a.length;}return r+s.slice(k);},
    find:(s,A)=>s.indexOf(A[0],A[1]===undefined?0:+A[1]),rfind:(s,A)=>s.lastIndexOf(A[0]),
    index:(s,A)=>{const k=s.indexOf(A[0],A[1]===undefined?0:+A[1]);if(k<0)pe("ValueError","substring not found");return k;},
    count:(s,A)=>{const a=A[0];if(typeof a!=="string")pe("TypeError",`must be str, not ${tn8(a)}`);if(a==="")return [...s].length+1;return s.split(a).length-1;},
    isdigit:s=>/^\p{Nd}+$/u.test(s),isnumeric:s=>/^\p{N}+$/u.test(s),isdecimal:s=>/^\p{Nd}+$/u.test(s),isalpha:s=>/^\p{L}+$/u.test(s),isalnum:s=>/^[\p{L}\p{N}]+$/u.test(s),isspace:s=>/^\s+$/.test(s),
    isupper:s=>/\p{Lu}/u.test(s)&&!/\p{Ll}/u.test(s),islower:s=>/\p{Ll}/u.test(s)&&!/\p{Lu}/u.test(s),
    splitlines:s=>s===""?[]:s.replace(/\n$/,"").split("\n"),
    zfill:(s,A)=>{const w=+A[0];if(s.length>=w)return s;const g=/^[+-]/.test(s)?s[0]:"";return g+"0".repeat(w-s.length)+s.slice(g.length);},
    ljust:(s,A)=>s.length>=+A[0]?s:s+(A[1]||" ").repeat(+A[0]-s.length),rjust:(s,A)=>s.length>=+A[0]?s:(A[1]||" ").repeat(+A[0]-s.length)+s,
    center:(s,A)=>{const w=+A[0];if(s.length>=w)return s;const t=w-s.length,g=Math.floor(t/2)+(t&w&1);return (A[1]||" ").repeat(g)+s+(A[1]||" ").repeat(t-g);},
    format:(s,A,K)=>{let k=0;return s.replace(/\{\{|\}\}|\{([^{}]*)\}/g,(t,x)=>{if(t==="{{")return "{";if(t==="}}")return "}";const [n,sp]=x.split(":");
      let v;if(n==="")v=A[k++];else if(/^\d+$/.test(n))v=A[+n];else{const f=K.find(y=>y[0]===n);v=f?f[1]:pe("KeyError",srepr8(n));}if(v===undefined)pe("IndexError","Replacement index out of range for positional args tuple");return spec8(v,sp||"");});}},
  list:{
    append:(l,A)=>{nb8(A,1,1,"list.append");l.push(A[0]);return null;},extend:(l,A)=>{l.push(...tout8(A[0]));return null;},
    insert:(l,A)=>{nb8(A,2,2,"insert");let k=+A[0];if(k<0)k=Math.max(0,k+l.length);l.splice(Math.min(k,l.length),0,A[1]);return null;},
    pop:(l,A)=>{if(!l.length)pe("IndexError","pop from empty list");let k=A[0]===undefined?l.length-1:indice8(l.length,A[0],"list");if(k<0||k>=l.length)pe("IndexError","pop index out of range");return l.splice(k,1)[0];},
    remove:(l,A)=>{const k=l.findIndex(x=>eq8(x,A[0]));if(k<0)pe("ValueError","list.remove(x): x not in list");l.splice(k,1);return null;},
    index:(l,A)=>{const k=l.findIndex(x=>eq8(x,A[0]));if(k<0)pe("ValueError",`${repr8(A[0])} is not in list`);return k;},
    count:(l,A)=>l.filter(x=>eq8(x,A[0])).length,
    sort:(l,A,K,X)=>{if(A.length)pe("TypeError","sort() takes no positional arguments");const r=trie8(l,K,X);l.splice(0,l.length,...r);return null;},
    reverse:l=>{l.reverse();return null;},copy:l=>l.slice(),clear:l=>{l.length=0;return null;}},
  dict:{
    keys:d=>new Vu("keys",d),values:d=>new Vu("values",d),items:d=>new Vu("items",d),
    get:(d,A)=>{nb8(A,1,2,"get");const x=d.m.get(dk8(A[0]));return x?x[1]:A[1]===undefined?null:A[1];},
    pop:(d,A)=>{const c=dk8(A[0]),x=d.m.get(c);if(!x){if(A.length>1)return A[1];pe("KeyError",repr8(A[0]));}d.m.delete(c);return x[1];},
    setdefault:(d,A)=>{const x=d.m.get(dk8(A[0]));if(x)return x[1];const v=A[1]===undefined?null:A[1];dset8(d,A[0],v);return v;},
    update:(d,A)=>{const o=A[0];if(o instanceof Di)for(const [k,v] of o.m.values())dset8(d,k,v);else for(const p of iter8(o)){const L=tout8(p);dset8(d,L[0],L[1]);}return null;},
    copy:d=>{const e=new Di();for(const [c,x] of d.m)e.m.set(c,[x[0],x[1]]);return e;},clear:d=>{d.m.clear();return null;}},
  "_io.TextIOWrapper":{
    read:f=>{if(!f.ouvert)pe("ValueError","I/O operation on closed file.");if(f.mode!=="r")pe("io.UnsupportedOperation","not readable");const r=f.x.c.slice(f.pos);f.pos=f.x.c.length;return r;},
    readline:f=>ligneFi8(f),readlines:f=>{const L=[];let l;while((l=ligneFi8(f))!=="")L.push(l);return L;},
    write:(f,A)=>{if(!f.ouvert)pe("ValueError","I/O operation on closed file.");if(f.mode==="r")pe("io.UnsupportedOperation","not writable");if(typeof A[0]!=="string")pe("TypeError",`write() argument must be str, not ${tn8(A[0])}`);f.x.c+=A[0];return [...A[0]].length;},
    writelines:(f,A)=>{for(const x of iter8(A[0]))METH8["_io.TextIOWrapper"].write(f,[x]);return null;},
    close:f=>{f.ouvert=false;return null;}},
  "re.Match":{group:(m,A)=>{const k=A.length?+A[0]:0;if(k>=m.m.length)pe("IndexError","no such group");return m.m[k]===undefined?null:m.m[k];},groups:m=>new Tu(m.m.slice(1).map(x=>x===undefined?null:x)),start:m=>m.m.index,end:m=>m.m.index+m.m[0].length}};
function attr8(o,n){
  if(o instanceof Mo){if(n in o.a)return o.a[n];nonPris(o.non(n));}
  const M=METH8[tn8(o)];if(M&&M[n])return new Bi(n,(A,K,X)=>M[n](o,A,K,X));
  pe("AttributeError",`'${tn8(o)}' object has no attribute '${n}'`);}
const chemin8=(X,p)=>{if(typeof p!=="string")pe("TypeError",`expected str, bytes or os.PathLike object, not ${tn8(p)}`);return absolu(p===""?".":p);};
function ouvre8(X,A,K){const [nom,mode0]=args8(A,K,["file","mode","buffering","encoding"],"open"),mode=(mode0===undefined?"r":mode0).replace(/[bt+]/g,"");
  if(/b/.test(mode0||""))nonPris("Ouvre le fichier en mode texte : \"r\", \"w\" ou \"a\".");
  const a=chemin8(X,nom),x=noeud(X.T,a);
  if(mode==="r"){if(!x)pe("FileNotFoundError",`[Errno 2] No such file or directory: ${srepr8(nom)}`);if(x.d)pe("IsADirectoryError",`[Errno 21] Is a directory: ${srepr8(nom)}`);return new Fi(x,"r",nom);}
  if(mode!=="w"&&mode!=="a")pe("ValueError",`invalid mode: '${mode0}'`);
  const k=a.lastIndexOf("/"),par=noeud(X.T,a.slice(0,k)||"/");if(!par||!par.d)pe("FileNotFoundError",`[Errno 2] No such file or directory: ${srepr8(nom)}`);
  if(x&&x.d)pe("IsADirectoryError",`[Errno 21] Is a directory: ${srepr8(nom)}`);
  let f=x;if(!f){f={n:a.slice(k+1),c:""};par.d.push(f);}else if(mode==="w")f.c="";return new Fi(f,mode,nom);}
function modules8(X){
  const bi=(n,f)=>new Bi(n,f),dir=p=>{const x=noeud(X.T,chemin8(X,p));return x&&x.d?x:null;};
  const path=new Mo("posixpath",{
    join:bi("join",A=>{let r=A[0];for(const p of A.slice(1)){if(typeof p!=="string")pe("TypeError",`join() argument must be str, bytes, or os.PathLike object, not '${tn8(p)}'`);r=p.startsWith("/")?p:r===""||r.endsWith("/")?r+p:r+"/"+p;}return r;}),
    isdir:bi("isdir",A=>!!dir(A[0])),isfile:bi("isfile",A=>{const x=noeud(X.T,chemin8(X,A[0]));return !!x&&!x.d;}),exists:bi("exists",A=>!!noeud(X.T,chemin8(X,A[0]))),
    basename:bi("basename",A=>A[0].slice(A[0].lastIndexOf("/")+1)),dirname:bi("dirname",A=>{const k=A[0].lastIndexOf("/");return k<0?"":A[0].slice(0,k)||"/";}),
    splitext:bi("splitext",A=>{const p=A[0],b=p.lastIndexOf("/")+1,base=p.slice(b),k=base.lastIndexOf("."),s=base.replace(/^\.+/,"").length;return k<=base.length-s||k<0?new Tu([p,""]):new Tu([p.slice(0,b+k),base.slice(k)]);}),
    getsize:bi("getsize",A=>{const x=noeud(X.T,chemin8(X,A[0]));if(!x)pe("FileNotFoundError",`[Errno 2] No such file or directory: ${srepr8(A[0])}`);return x.d?4096:new TextEncoder().encode(x.c||"").length;}),
    sep:"/"},n=>`os.path.${n} ne sert pas dans ces exercices : il suffit de os.path.isdir, os.path.isfile et os.path.join.`);
  const os=new Mo("os",{
    listdir:bi("listdir",A=>{const p=A.length?A[0]:".",x=noeud(X.T,chemin8(X,p));if(!x)pe("FileNotFoundError",`[Errno 2] No such file or directory: ${srepr8(p)}`);if(!x.d)pe("NotADirectoryError",`[Errno 20] Not a directory: ${srepr8(p)}`);return x.d.map(y=>y.n).sort();}),
    getcwd:bi("getcwd",()=>COURANT),sep:"/",path,linesep:"\n"},
    n=>/^(walk|popen|system|scandir)$/.test(n)?`os.${n} est interdit aux examens (« les fonctions popen() et walk() ne peuvent pas être utilisées ») : écris toi-même la fonction récursive avec os.listdir.`:`os.${n} ne sert pas dans ces exercices : il suffit de os.listdir, os.path.isdir, os.path.isfile et os.sep.`);
  const sys=new Mo("sys",{argv:X.argv,exit:bi("exit",A=>{X.code=A.length?A[0]:null;throw SORTIE8;})},n=>`sys.${n} ne sert pas dans ces exercices : il suffit de sys.argv et sys.exit().`);
  const rx=(p,fl)=>{if(typeof p!=="string")pe("TypeError","first argument must be string or compiled pattern");try{return new RegExp(p.replace(/\(\?P</g,"(?<").replace(/\\Z/g,"$"),fl||"");}catch(e){pe("re.error",String(e.message));}};
  const re=new Mo("re",{
    search:bi("search",A=>{const m=rx(A[0]).exec(A[1]);return m?new Ma(m):null;}),
    match:bi("match",A=>{const m=rx(A[0],"y").exec(A[1]);return m?new Ma(m):null;}),
    fullmatch:bi("fullmatch",A=>{const m=rx("(?:"+A[0]+")$","y").exec(A[1]);return m?new Ma(m):null;}),
    findall:bi("findall",A=>[...A[1].matchAll(rx(A[0],"g"))].map(m=>m.length===1?m[0]:m.length===2?m[1]:new Tu(m.slice(1)))),
    sub:bi("sub",A=>A[2].replace(rx(A[0],"g"),A[1].replace(/\\(\d)/g,"$$$1"))),split:bi("split",A=>A[1].split(rx(A[0],"g")))},
    n=>`re.${n} ne sert pas dans ces exercices : re.search(motif, chaine) suffit.`);
  return {os,"os.path":path,sys,re};}
const EXC8="Exception ValueError KeyError IndexError TypeError ZeroDivisionError FileNotFoundError NameError OSError IOError AttributeError RuntimeError LookupError ArithmeticError".split(" ");
const PARENT8={KeyError:"LookupError",IndexError:"LookupError",ZeroDivisionError:"ArithmeticError",FileNotFoundError:"OSError",IsADirectoryError:"OSError",NotADirectoryError:"OSError",IOError:"OSError"};
const attrape8=(t,e)=>{if(t instanceof Tu)return t.a.some(x=>attrape8(x,e));if(!(t instanceof Ex))pe("TypeError","catching classes that do not inherit from BaseException is not allowed");
  if(t.n==="Exception")return !/^(SystemExit|KeyboardInterrupt)$/.test(e);let x=e;while(x){if(x===t.n||t.n==="OSError"&&x==="IOError")return true;x=PARENT8[x];}return false;};
function builtins8(X){const B=Object.create(null),bi=(n,f)=>{B[n]=new Bi(n,f);};
  bi("print",(A,K)=>{let sep=" ",end="\n";for(const [n,v] of K){if(n==="sep")sep=v===null?" ":v;else if(n==="end")end=v===null?"\n":v;else if(n==="file")nonPris("print(…, file=…) ne sert pas dans ces exercices : pour écrire dans un fichier, fd.write(texte).");else if(n!=="flush")pe("TypeError",`'${n}' is an invalid keyword argument for print()`);}
    X.out+=A.map(str8).join(sep)+end;if(X.out.length>200000)throw BOUCLE8;return null;});
  bi("len",A=>{nb8(A,1,1,"len");const v=A[0];if(typeof v==="string")return [...v].length;if(Array.isArray(v))return v.length;if(v instanceof Tu)return v.a.length;if(v instanceof Di)return v.m.size;if(v instanceof Rg)return lenRg8(v);if(v instanceof Vu)return v.d.m.size;pe("TypeError",`object of type '${tn8(v)}' has no len()`);});
  bi("range",A=>{if(!A.length||A.length>3)pe("TypeError",`range expected at ${A.length?"most 3":"least 1"} argument${A.length?"s":""}, got ${A.length}`);for(const x of A)if(!estInt8(x))pe("TypeError",`'${tn8(x)}' object cannot be interpreted as an integer`);
    const [a,b,s]=A.length===1?[0,+A[0],1]:[+A[0],+A[1],A.length>2?+A[2]:1];if(s===0)pe("ValueError","range() arg 3 must not be zero");return new Rg(a,b,s);});
  bi("int",A=>{if(!A.length)return 0;const v=A[0];if(A.length>1)nonPris("int(texte, base) ne sert pas dans ces exercices.");
    if(typeof v==="string"){const t=coupe8(v,null,1,1);if(!/^[+-]?\d+(_\d+)*$/.test(t))pe("ValueError",`invalid literal for int() with base 10: ${srepr8(v)}`);return parseInt(t.replace(/_/g,""),10);}
    if(v instanceof Fl){if(!isFinite(v.v))pe(Number.isNaN(v.v)?"ValueError":"OverflowError","cannot convert float to integer");return Math.trunc(v.v);}if(estInt8(v))return +v;
    pe("TypeError",`int() argument must be a string, a bytes-like object or a real number, not '${tn8(v)}'`);});
  bi("float",A=>{if(!A.length)return new Fl(0);const v=A[0];if(typeof v==="string"){const t=coupe8(v,null,1,1).toLowerCase();
      if(/^[+-]?(inf|infinity)$/.test(t))return new Fl(t[0]==="-"?-Infinity:Infinity);if(/^[+-]?nan$/.test(t))return new Fl(NaN);
      if(!/^[+-]?(\d+(_\d+)*\.?(\d+(_\d+)*)?|\.\d+(_\d+)*)(e[+-]?\d+)?$/.test(t))pe("ValueError",`could not convert string to float: ${srepr8(v)}`);return new Fl(parseFloat(t.replace(/_/g,"")));}
    if(estNum8(v))return new Fl(nv8(v));pe("TypeError",`float() argument must be a string or a real number, not '${tn8(v)}'`);});
  bi("str",A=>A.length?str8(A[0]):"");bi("repr",A=>repr8(A[0]));bi("bool",A=>A.length?vrai8(A[0]):false);
  bi("list",A=>A.length?tout8(A[0]):[]);bi("tuple",A=>new Tu(A.length?tout8(A[0]):[]));
  bi("dict",(A,K)=>{const d=new Di();if(A.length)METH8.dict.update(d,[A[0]]);for(const [n,v] of K)dset8(d,n,v);return d;});
  bi("set",()=>nonPris("Les ensembles (set) ne servent pas dans ces exercices : utilise une liste (in, not in, append) ou un dictionnaire."));
  bi("frozenset",()=>nonPris("Les ensembles ne servent pas dans ces exercices : utilise une liste."));
  bi("sorted",(A,K)=>{nb8(A,1,1,"sorted");return trie8(tout8(A[0]),K,X);});
  bi("reversed",A=>{const v=A[0];if(v instanceof Di||v instanceof Fi||!(typeof v==="string"||Array.isArray(v)||v instanceof Tu||v instanceof Rg))pe("TypeError",`'${tn8(v)}' object is not reversible`);return tout8(v).reverse();});
  bi("sum",A=>{nb8(A,1,2,"sum");let s=A.length>1?A[1]:0;if(typeof s==="string")pe("TypeError","sum() can't sum strings [use ''.join(seq) instead]");for(const v of iter8(A[0]))s=binop8("+",s,v);return s;});
  const extr=(n,signe)=>(A,K)=>{const L=A.length===1?tout8(A[0]):A.slice(),def=K.find(x=>x[0]==="default");if(!A.length)pe("TypeError",`${n} expected at least 1 argument, got 0`);
    if(!L.length){if(def)return def[1];pe("ValueError",`${n}() iterable argument is empty`);}let m=L[0],km=cle8(m,K,X);for(const v of L.slice(1)){const kv=cle8(v,K,X);if(ordre8(signe>0?">":"<",kv,km)*signe>0){m=v;km=kv;}}return m;};
  bi("max",extr("max",1));bi("min",extr("min",-1));
  bi("abs",A=>{const v=A[0];if(v instanceof Fl)return new Fl(Math.abs(v.v));if(estInt8(v))return Math.abs(+v);pe("TypeError",`bad operand type for abs(): '${tn8(v)}'`);});
  bi("round",A=>{const v=A[0],n=A.length>1&&A[1]!==null?+A[1]:null;if(!estNum8(v))pe("TypeError",`type ${tn8(v)} doesn't define __round__ method`);const x=nv8(v);
    if(n===null){const f=Math.floor(x),d=x-f;return d>0.5||d===0.5&&f%2!==0?f+1:f;}if(estInt8(v))return +v;return new Fl(Number(x.toFixed(Math.max(0,Math.min(n,20)))));});
  bi("enumerate",(A,K)=>{const d=A.length>1?+A[1]:K.length?+K[0][1]:0;return tout8(A[0]).map((v,i)=>new Tu([i+d,v]));});
  bi("zip",A=>{const L=A.map(tout8),n=L.length?Math.min(...L.map(x=>x.length)):0;return Array.from({length:n},(_,i)=>new Tu(L.map(x=>x[i])));});
  bi("any",A=>tout8(A[0]).some(vrai8));bi("all",A=>tout8(A[0]).every(vrai8));
  bi("ord",A=>{if(typeof A[0]!=="string"||[...A[0]].length!==1)pe("TypeError","ord() expected a character");return A[0].codePointAt(0);});
  bi("chr",A=>{if(!estInt8(A[0]))pe("TypeError",`'${tn8(A[0])}' object cannot be interpreted as an integer`);return String.fromCodePoint(+A[0]);});
  bi("open",(A,K)=>ouvre8(X,A,K));
  bi("input",()=>pe("EOFError","EOF when reading a line"));
  bi("isinstance",A=>{const t=A[1],ok=x=>x instanceof Bi&&tn8(A[0])===x.n||x instanceof Bi&&x.n==="int"&&typeof A[0]==="boolean";return t instanceof Tu?t.a.some(ok):ok(t);});
  bi("type",A=>{const t=tn8(A[0]);return B[t]||new Bi(t,()=>nonPris("type(…) ne sert pas dans ces exercices."));});
  bi("exit",A=>{X.code=A.length?A[0]:null;throw SORTIE8;});B.quit=B.exit;
  bi("format",A=>spec8(A[0],A[1]||""));
  bi("divmod",A=>new Tu([binop8("//",A[0],A[1]),binop8("%",A[0],A[1])]));
  bi("pow",A=>binop8("**",A[0],A[1]));
  for(const n of [...EXC8,"IsADirectoryError","NotADirectoryError","EOFError","RecursionError","UnboundLocalError","AssertionError"])B[n]=new Ex(n);
  return B;}
const PILE8=[];
function lit8(env,n){let e=env;while(e.compr){if(n in e.V)return e.V[n];e=e.up;}
  for(let f=e;f&&f.loc;f=f.clo){if(f.loc.has(n)){if(n in f.V)return f.V[n];pe(f===e?"UnboundLocalError":"NameError",f===e?`cannot access local variable '${n}' where it is not associated with a value`:`cannot access free variable '${n}' where it is not associated with a value in enclosing scope`);}if(f.glob.has(n))break;}
  const G=e.G;if(n in G.V)return G.V[n];if(n in G.B)return G.B[n];pe("NameError",`name '${n}' is not defined`);}
function range8(env,n,v){if(env.compr||!env.loc){env.V[n]=v;return;}if(env.glob.has(n)){env.G.V[n]=v;return;}
  if(env.nonloc.has(n))for(let f=env.clo;f&&f.loc;f=f.clo)if(f.loc.has(n)){f.V[n]=v;return;}
  env.V[n]=v;}
const base8=env=>{while(env.compr)env=env.up;return env.loc?env:null;};
function affecte8(t,v,env,X){
  switch(t.k){
    case "nom":range8(env,t.n,v);return;
    case "par":affecte8(t.e,v,env,X);return;
    case "sub":{const o=ev8(t.o,env,X);if(t.i.k==="slice")nonPris("Remplacer une tranche (liste[a:b] = …) ne sert pas dans ces exercices.");setItem8(o,ev8(t.i,env,X),v);return;}
    case "attr":{const o=ev8(t.o,env,X);pe("AttributeError",`'${tn8(o)}' object attribute '${t.n}' is read-only`);}
    case "tuple":case "list":{const L=tout8(v);if(L.length>t.L.length)pe("ValueError",`too many values to unpack (expected ${t.L.length})`);if(L.length<t.L.length)pe("ValueError",`not enough values to unpack (expected ${t.L.length}, got ${L.length})`);t.L.forEach((c,i)=>affecte8(c,L[i],env,X));return;}}}
const pas8=X=>{if(++X.pas>PAS8)throw BOUCLE8;};
function execS8(S,env,X){for(const s of S){const r=exec8(s,env,X);if(r)return r;}return null;}
function boucle8(env,X,suivant,corps,orelse){for(;;){pas8(X);if(!suivant())break;const r=execS8(corps,env,X);if(r){if(r.k==="break")return null;if(r.k==="continue")continue;return r;}}return orelse?execS8(orelse,env,X):null;}
const BRK8={k:"break"},CNT8={k:"continue"};
function exec8(s,env,X){X.ligne=s.l||X.ligne;pas8(X);
  switch(s.k){
    case "expr":ev8(s.e,env,X);return null;
    case "assign":{const v=ev8(s.e,env,X);for(const t of s.tg)affecte8(t,v,env,X);return null;}
    case "aug":{const t=s.tg;
      if(t.k==="sub"){const o=ev8(t.o,env,X);if(t.i.k==="slice")nonPris("Remplacer une tranche ne sert pas dans ces exercices.");const i=ev8(t.i,env,X),x=getItem8(o,i);setItem8(o,i,aug8(s.o,x,ev8(s.e,env,X)));return null;}
      if(t.k==="attr")pe("AttributeError",`'${tn8(ev8(t.o,env,X))}' object attribute '${t.n}' is read-only`);
      const x=lit8(env,t.n);affecte8(t,aug8(s.o,x,ev8(s.e,env,X)),env,X);return null;}
    case "if":{for(const [c,b] of s.tests)if(vrai8(ev8(c,env,X)))return execS8(b,env,X);return s.orelse?execS8(s.orelse,env,X):null;}
    case "while":return boucle8(env,X,()=>{X.ligne=s.l;return vrai8(ev8(s.c,env,X));},s.body,s.orelse);
    case "for":{const it=iter8(ev8(s.it,env,X));return boucle8(env,X,()=>{const n=it.next();if(n.done)return false;affecte8(s.tg,n.value,env,X);return true;},s.body,s.orelse);}
    case "def":range8(env,s.n,new Fn(s,s.P.map(q=>q.d?ev8(q.d,env,X):undefined),base8(env)));return null;
    case "return":return {k:"return",v:s.e?ev8(s.e,env,X):null};
    case "break":return BRK8;case "continue":return CNT8;case "pass":return null;
    case "global":return null;
    case "import":for(const [m,a] of s.N){const M=module8(X,m);range8(env,a||m.split(".")[0],a?M:module8(X,m.split(".")[0]));}return null;
    case "from":{const M=module8(X,s.m);for(const [n,a] of s.N){if(n==="*"){for(const k in M.a)range8(env,k,M.a[k]);continue;}if(!(n in M.a)){if(M.non)nonPris(M.non(n));pe("ImportError",`cannot import name '${n}' from '${s.m}'`);}range8(env,a||n,M.a[n]);}return null;}
    case "with":{const v=ev8(s.e,env,X);if(s.as)affecte8(s.as,v,env,X);try{return execS8(s.body,env,X);}finally{if(v instanceof Fi)v.ouvert=false;}}
    case "try":{let r;
      try{r=execS8(s.body,env,X);}
      catch(e){if(!(e instanceof PE)||e.t==="SyntaxError"||e.t==="IndentationError")throw e;const h=s.H.find(h=>!h.ty||attrape8(ev8(h.ty,env,X),e.t));
        if(!h){if(s.fin)execS8(s.fin,env,X);throw e;}if(h.as)range8(env,h.as,{exc:e.t,m:e.m});r=execS8(h.body,env,X);if(s.fin){const r2=execS8(s.fin,env,X);if(r2)return r2;}return r;}
      if(!r&&s.orelse)r=execS8(s.orelse,env,X);if(s.fin){const r2=execS8(s.fin,env,X);if(r2)return r2;}return r;}
    case "raise":{if(!s.e)pe("RuntimeError","No active exception to reraise");const v=ev8(s.e,env,X);if(v instanceof Ex)pe(v.n,"");if(v&&v.exc)pe(v.exc,v.m);pe("TypeError","exceptions must derive from BaseException");}
    case "assert":if(!vrai8(ev8(s.e,env,X)))pe("AssertionError",s.m?str8(ev8(s.m,env,X)):"");return null;
    case "del":{const d=t=>{if(t.k==="nom"){if(!(t.n in env.V))pe("NameError",`name '${t.n}' is not defined`);delete env.V[t.n];}
      else if(t.k==="sub"){const o=ev8(t.o,env,X),i=ev8(t.i,env,X);if(o instanceof Di){const c=dk8(i);if(!o.m.has(c))pe("KeyError",repr8(i));o.m.delete(c);}else if(Array.isArray(o)){const k=indice8(o.length,i,"list");if(k<0||k>=o.length)pe("IndexError","list assignment index out of range");o.splice(k,1);}else pe("TypeError",`'${tn8(o)}' object doesn't support item deletion`);}
      else if(t.k==="tuple")t.L.forEach(d);};d(s.tg);return null;}}}
function aug8(o,x,y){if(o==="+"&&Array.isArray(x)){x.push(...tout8(y));return x;}return binop8(o,x,y);}
function module8(X,m){const M=X.M[m];if(M)return M;
  nonPris(/^(collections|itertools|functools|pathlib|glob|subprocess|shutil|fnmatch)$/.test(m)?`Le module ${m} n'est pas permis aux examens : écris-le avec os.listdir, une boucle et un dictionnaire.`:`Le module ${m} ne sert pas dans ces exercices : les examens n'utilisent que os, sys et re.`);}
function appel8(f,A,K,X){
  if(f instanceof Bi){const l=X.ligne,r=f.f(A,K,X);X.ligne=l;return r===undefined?null:r;}
  if(f instanceof Fn){const d=f.def,P=d.P;if(X.prof>=PROF8)pe("RecursionError","maximum recursion depth exceeded");
    const env={V:Object.create(null),loc:d.loc,glob:d.glob,nonloc:d.nonloc,G:X.G,clo:f.clo};
    if(A.length>P.length)pe("TypeError",`${d.n}() takes ${P.length} positional argument${P.length===1?"":"s"} but ${A.length} ${A.length===1?"was":"were"} given`);
    A.forEach((v,i)=>{env.V[P[i].n]=v;});
    for(const [n,v] of K){const q=P.find(x=>x.n===n);if(!q)pe("TypeError",`${d.n}() got an unexpected keyword argument '${n}'`);if(n in env.V)pe("TypeError",`${d.n}() got multiple values for argument '${n}'`);env.V[n]=v;}
    P.forEach((q,i)=>{if(!(q.n in env.V)&&f.dv[i]!==undefined)env.V[q.n]=f.dv[i];});
    const manque=P.filter(q=>!(q.n in env.V));if(manque.length)pe("TypeError",`${d.n}() missing ${manque.length} required positional argument${manque.length>1?"s":""}: ${manque.map(q=>`'${q.n}'`).join(manque.length>2?", ":" and ")}`);
    const l=X.ligne;X.prof++;try{const r=execS8(d.body,env,X);return r&&r.k==="return"?r.v:null;}finally{X.prof--;X.ligne=l;}}
  if(f instanceof Ex)return {exc:f.n,m:A.length?str8(A[0]):""};
  pe("TypeError",`'${tn8(f)}' object is not callable`);}
function ev8(e,env,X){switch(e.k){
  case "cst":return e.v;
  case "nom":return lit8(env,e.n);
  case "par":return ev8(e.e,env,X);
  case "concat":return e.P.map(q=>q.k==="fmt"?(q.conv==="r"?spec8(repr8(ev8(q.e,env,X)),q.spec):spec8(ev8(q.e,env,X),q.spec)):str8(ev8(q,env,X))).join("");
  case "tuple":return new Tu(etale8(e.L,env,X));
  case "list":return etale8(e.L,env,X);
  case "dict":{const d=new Di();for(const [a,b] of e.P){const k=ev8(a,env,X);dset8(d,k,ev8(b,env,X));}return d;}
  case "compr":{const sub={V:Object.create(null),compr:true,up:env,G:X.G},R=e.kind==="dict"?new Di():[];
    const va=k=>{if(k===e.G.length){if(e.kind==="dict"){const c=ev8(e.a,sub,X);dset8(R,c,ev8(e.b,sub,X));}else R.push(ev8(e.a,sub,X));return;}
      const g=e.G[k];for(const v of tout8(ev8(g.it,k?sub:env,X))){pas8(X);affecte8(g.tg,v,sub,X);if(g.C.every(c=>vrai8(ev8(c,sub,X))))va(k+1);}};
    va(0);return R;}
  case "or":{const a=ev8(e.a,env,X);return vrai8(a)?a:ev8(e.b,env,X);}
  case "and":{const a=ev8(e.a,env,X);return vrai8(a)?ev8(e.b,env,X):a;}
  case "not":return !vrai8(ev8(e.a,env,X));
  case "ifexp":return vrai8(ev8(e.c,env,X))?ev8(e.a,env,X):ev8(e.b,env,X);
  case "cmp":{let a=ev8(e.E[0],env,X);for(let k=0;k<e.O.length;k++){const b=ev8(e.E[k+1],env,X);if(!cmp8(e.O[k],a,b))return false;a=b;}return true;}
  case "bin":return binop8(e.o,ev8(e.a,env,X),ev8(e.b,env,X));
  case "un":{const a=ev8(e.a,env,X);if(e.o==="+"&&estNum8(a))return a instanceof Fl?a:+a;if(e.o==="-"){if(a instanceof Fl)return new Fl(-a.v);if(estInt8(a))return -a;}if(e.o==="~"&&estInt8(a))return ~a;
    pe("TypeError",`bad operand type for unary ${e.o}: '${tn8(a)}'`);}
  case "call":{const f=ev8(e.f,env,X),A=[];for(const a of e.A){if(a.k==="etoile")A.push(...tout8(ev8(a.e,env,X)));else A.push(ev8(a,env,X));}
    const K=e.K.map(([n,v])=>[n,ev8(v,env,X)]);return appel8(f,A,K,X);}
  case "sub":{const o=ev8(e.o,env,X);if(e.i.k==="slice"){const q=x=>x===null?null:ev8(x,env,X);return tranche8(o,q(e.i.a),q(e.i.b),q(e.i.c));}return getItem8(o,ev8(e.i,env,X));}
  case "attr":return attr8(ev8(e.o,env,X),e.n);
  case "lambda":return new Fn({n:"<lambda>",P:e.P,body:[{k:"return",e:e.b}],loc:new Set(e.P.map(q=>q.n)),glob:new Set(),nonloc:new Set()},e.P.map(()=>undefined),base8(env));
  case "slice":pe("TypeError","unhashable type: 'slice'");
}}
function etale8(L,env,X){const r=[];for(const x of L){if(x.k==="etoile")r.push(...tout8(ev8(x.e,env,X)));else r.push(ev8(x,env,X));}return r;}
/* lance le programme src, dans l'arborescence T0, avec les paramètres A : ce qu'il affiche, l'erreur de Python (type, message, ligne), l'arborescence après */
function lancePy(src,T0,A,nom){
  const X={T:clone7(T0),out:"",pas:0,prof:0,ligne:1,argv:[nom,...(A||[])],code:null};
  X.G={V:Object.create(null),loc:null,B:null};X.G.G=X.G;X.G.B=builtins8(X);X.G.V.__name__="__main__";X.M=modules8(X);
  let err=null;
  try{const S=parsePy(lexPy(src));execS8(S,X.G,X);}
  catch(e){
    if(e instanceof NonPris)return {inconnu:e.m};
    if(e===BOUCLE8)return {boucle:true,sortie:null,err:{t:"boucle",m:"",l:X.ligne}};
    if(e===SORTIE8){}
    else if(e instanceof PE)err={t:e.t,m:e.m,l:e.l||X.ligne};
    else if(e instanceof RangeError)err={t:"RecursionError",m:"maximum recursion depth exceeded",l:X.ligne};
    else throw e;}
  const s=X.out,sortie=s===""?[]:s.replace(/\n$/,"").split("\n");
  if(err&&(err.t==="SyntaxError"||err.t==="IndentationError"))return {sortie:[],err,T:X.T,syntaxe:true};
  return {sortie,err,T:X.T};}
const vuePy=r=>r.err?(r.err.t==="RecursionError"?["#erreur RecursionError"]:r.sortie.concat(["#erreur "+r.err.t])):r.sortie;
const BANC8=[
'liste = [4, 7, 9]\nprint(liste[-1], liste[0], liste[1:3], liste[::-1], liste[::2])\nprint(len(liste), 7 in liste, 8 not in liste)',
'mot = "radar"\nprint(mot[::-1] == mot, mot.upper(), mot[1:-1], mot * 2)\nprint("a,b,,c".split(","), " x  y ".split(), "x".join(["1", "2"]))',
'd = {}\nfor m in "le chat et le chien et le rat".split():\n    if m in d:\n        d[m] += 1\n    else:\n        d[m] = 1\nprint(d)\nprint(d.get("le"), d.get("zz"), d.get("zz", 0), len(d))',
'd = {"b": 2, "a": 1}\nfor k, v in d.items():\n    print(k, v)\nprint(list(d.keys()), list(d.values()), d.items())\nprint(sorted(d), sorted(d.items()))',
'print(7 / 2, 7 // 2, -7 // 2, 7 % 3, -7 % 3, 2 ** 10, 10 / 5, 1 / 3, 0.1 + 0.2)\nprint(1e-05, 123456789012345678.0, 2.5e20, round(2.5), round(3.5), round(-2.5), abs(-3), abs(-2.5))',
'print(int("12") + 1, int(" 7\\n"), float("2.5"), str(4) + "2", int(3.9), int(-3.9))\nprint(int("abc"))',
'total = 0\nfor i in range(1, 11):\n    if i % 2 == 0:\n        continue\n    if i > 7:\n        break\n    total += i\nprint(total)\nfor i in range(10, 0, -3):\n    print(i, end=" ")\nprint()',
'i = 0\nwhile i < 5:\n    i += 2\nelse:\n    print("fini", i)\nprint(list(range(5)), list(range(2, 8, 2)), list(range(5, 0, -1)))',
'def f(x, y=10):\n    return x * y\nprint(f(2), f(2, 3), f(y=1, x=5))\nprint(f())',
'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\nprint(fact(0), fact(5), fact(10))',
'def boucle(n):\n    return boucle(n + 1)\nprint("avant")\nboucle(0)',
'compte = 0\ndef plus():\n    compte += 1\nplus()\nprint(compte)',
'compte = 0\ndef plus():\n    global compte\n    compte += 1\nplus()\nplus()\nprint(compte)',
'd = {}\nd["png"] += 1',
'liste = [1, 2]\nprint(liste[2])',
'print("total : " + 3)',
'print(3 + "a")',
'print(nombre)',
'x = [3, 1, 2]\nx.sort()\nprint(x, x.pop(), x, x.index(2), x.count(1))\nx.append([5])\nx.extend((6, 7))\nx.insert(0, 9)\nprint(x)\nx.remove(6)\nprint(x, sorted([3, 1, 2], reverse=True))',
'with open("notes.txt") as fd:\n    for ligne in fd:\n        print(repr(ligne), int(ligne))\nprint(fd.closed if False else "ferme")',
'fd = open("notes.txt", "r")\nlignes = fd.readlines()\nfd.close()\nprint(lignes, len(lignes))\nprint([int(l) for l in lignes if int(l) >= 10])',
'with open("data.csv") as fd:\n    for ligne in fd:\n        data = ligne.strip().split(",")\n        print(data[0], data[1:])',
'with open("absent.txt") as fd:\n    print(fd.read())',
'import os\nprint(os.listdir("photos"))\nprint(os.listdir("."))\nprint(os.path.isdir("photos"), os.path.isdir("vac"), os.path.isdir("photos/vac"), os.path.isfile("notes.txt"), os.path.isfile("photos"))',
'import os, sys\ndef parcours(dossier):\n    for nom in os.listdir(dossier):\n        chemin = dossier + os.sep + nom\n        if os.path.isdir(chemin):\n            parcours(chemin)\n        else:\n            print(chemin)\nparcours("photos")\nprint(os.path.join("a", "b", "c.txt"), os.path.join("a/", "b"), os.path.splitext("x/y.tar.gz"), os.path.basename("x/y.txt"))',
'import os\ndef parcours(dossier):\n    for nom in os.listdir(dossier):\n        if os.path.isdir(nom):\n            parcours(nom)\n        else:\n            print(nom)\nparcours("photos")',
'import os\nprint(os.listdir("notes.txt"))',
'import sys\nprint(sys.argv, len(sys.argv))\nif len(sys.argv) < 3:\n    print("Donne deux fichiers")\n    sys.exit()\nprint("jamais")',
'nom = "zoé"\nn = 3\nprint(f"{nom} a {n} ans", f"{n * 2:>4}|", f"{2 / 3:.2f}", f"{nom!r}", f"{{x}}", "{} et {}".format(1, "a"), "%d %s" % (5, "b"))',
'a, b = 1, 2\na, b = b, a\nprint(a, b)\nc, d = "xy"\nprint(c, d)\nfor (i, v) in enumerate(["a", "b"], 1):\n    print(i, v)\nprint(list(zip([1, 2], "ab")))',
'x, y = [1, 2, 3]',
'print(max([3, 9, 2]), min(4, 1, 7), max(["bb", "a", "ccc"], key=len), sum([1, 2, 3]), sum([0.5, 0.25]))\nprint(max([]))',
'print([x * x for x in range(6) if x % 2 == 1], {k: len(k) for k in ["aa", "b"]}, [c for c in "abc"])\nprint(sum(x for x in range(4)), "".join(c.upper() for c in "ok"))',
'print(True + True, True and 0, 0 or "x", not [], None is None, 1 == 1.0, "a" < "b", [1, 2] < [1, 3], 3 if 2 > 1 else 4)',
'print("a" < 3)',
'if x = 3:\n    print(x)',
'for i in range(3):\nprint(i)',
'def f():\n    print("a")\n  print("b")',
'print "bonjour"',
'liste = [1, 2, 3\nprint(liste)',
'texte = "bonjour\nprint(texte)',
'print("Coucou" .upper(), "abc".replace("b", "X"), "a-b-c".split("-", 1), "  ok ".strip(), "xxhixx".strip("x"), "Bonjour".startswith("Bon"), "f.txt".endswith((".txt", ".py")))\nprint("abcabc".find("c"), "abc".find("z"), "banane".count("an"), "42".isdigit(), "a1".isdigit(), "Abc".lower(), "le chat".title())',
'mots = ["chat", "chien", "oie"]\nprint(sorted(mots, key=len), sorted(mots, key=len, reverse=True), mots[::-1], list(reversed(mots)))\nprint(mots.index("oie"), "chat" in mots, len(mots[1]))',
'x = 5\ndef f():\n    print(x)\n    x = 3\nf()',
'def ajoute(liste, x):\n    liste.append(x)\nl = []\najoute(l, 1)\najoute(l, 2)\nprint(l)\nm = l\nm.append(3)\nprint(l, l is m, l == [1, 2, 3])',
'def compte(n):\n    if n == 0:\n        return\n    print(n)\n    compte(n - 1)\nr = compte(3)\nprint(r)',
'notes = {"ada": [12, 15], "zoe": [9]}\nnotes["zoe"].append(14)\nnotes["leo"] = [10]\nfor nom in notes:\n    print(nom, sum(notes[nom]) / len(notes[nom]))',
'fd = open("sortie.txt", "w")\nfd.write("ligne 1\\n")\nfd.write("ligne 2")\nfd.close()\nwith open("sortie.txt") as f:\n    print(f.read().split("\\n"))\nwith open("sortie.txt", "a") as f:\n    f.write("\\nfin")\nprint(open("sortie.txt").readlines())',
'import re\nprint(re.search("\\\\.csv$", "parc.csv") is not None, re.search("^a", "ba"), bool(re.search("[0-9]+", "x42")))\nprint(re.findall("[0-9]+", "a1b22c333"))',
'print(10 / 0)',
'liste = [5, 3]\nprint(liste.split(","))',
'def f(a, b):\n    return a + b\nprint(f(1))',
'mot = "abc"\nmot[0] = "z"',
'try:\n    n = int("x2")\nexcept ValueError:\n    n = -1\nprint(n)\ntry:\n    print({}["a"])\nexcept KeyError as e:\n    print("clé absente", e)',
'i = 0\nwhile i < 3:\n    print(i)\n    i = i + 1\nprint("i vaut", i)\nl = [0] * 3 + [1]\nprint(l, "ab" * 3, 3 * [2])',
'n = 1234\ns = 0\nwhile n > 0:\n    s += n % 10\n    n //= 10\nprint(s)\nprint(str(1234)[::-1], int("0012"), 17 // 5 * 5 + 17 % 5)',
'liste = [2, 23, 23, 7, 7, 7, 4, 9, 9, 7]\nnliste = []\nmem = -1\nfor n in liste:\n    if n != mem:\n        nliste.append(n)\n        mem = n\nprint(nliste)',
'stats = {"jpg": 0}\nfor f in ["a.jpg", "b.png", "c", "d.e.jpg"]:\n    data = f.split(".")\n    if len(data) > 1 and data[-1] in stats:\n        stats[data[-1]] += 1\nprint(stats, "c".split("."), ".bashrc".split("."))',
'print(type(3) == int, isinstance("a", str), isinstance(2, (int, float)), str(None), repr("l\'eau"), repr(\'dit "oui"\'), [None, True, 1.0, "a\\tb"])',
'x = 3\nif x > 2: print("grand")\nelif x > 1: print("moyen")\nelse: print("petit")\nfor c in "ab": print(c)',
'import os\nfor nom in sorted(os.listdir("photos/vac")):\n    print(nom, os.path.getsize("photos/vac/" + nom))',
'def f(n):\n    if n > 0:\n        return n\nprint(f(2), f(-1))\nprint(f(2) + f(-1))'
];
const blocp=t=>d36(window.W&&window.W.code?window.W.code(t,"py"):`<pre>${esc(t)}</pre>`);
const q8=s=>'"'+s+'"',ls8=L=>"["+L.map(x=>typeof x==="string"?q8(x):String(x)).join(", ")+"]",rang8=k=>k===1?"1er":k+"e";
const uniq8=(R,n,a,b)=>{const L=[];for(let g=0;L.length<n&&g<500;g++){const x=R.ent(a,b);if(!L.includes(x))L.push(x);}return L;};
const PRE8="ada alan anna emma hugo ines jade karim lea lina louis malo nina noah sami theo yanis zoe".split(" ");
const ANI8="chat chien lapin oie rat poule".split(" ");
const MOT8="bonjour python radar maison soleil clavier fenetre jardin".split(" ");
const ARBO8=arboDe([{n:"notes.txt",c:"12\n7\n15\n"},{n:"data.csv",c:"PC1,windows11,ubuntu\nPC2,ubuntu\n"},dos7("photos",[{n:"a.jpg",c:""},{n:"b.png",c:"xx"},dos7("vac",[{n:"c.jpg",c:"abc"},{n:"d.txt",c:"bonjour toi\n"}])]),dos7("vide",[])]);

/* palier 1 : lire un programme */
const PY1=[
 ["indices","indices et tranches",R=>{const L=uniq8(R,R.ent(5,6),1,60),n=L.length,i=R.ent(1,n-2),a=R.ent(0,2),b=R.ent(a+2,n-1);
   const V=R.mel([[`print(liste[${i}])`,`Les indices commencent à 0 : liste[${i}] est le ${rang8(i+1)} élément, ${L[i]}.`],
     ["print(liste[-1])",`liste[-1] est le dernier élément : ${L[n-1]}.`],
     [`print(liste[${a}:${b}])`,`liste[${a}:${b}] va de l'indice ${a} inclus à l'indice ${b} exclu : ${b-a} éléments, ${ls8(L.slice(a,b))}.`],
     ["print(len(liste))",`len donne le nombre d'éléments : ${n}.`]]).slice(0,3);
   return {pas:[[`liste = ${ls8(L)}`,"La liste est créée ; rien ne s'affiche."],...V],
     mut:[["indices comptés à partir de 1",`liste[${i}]`,`liste[${i-1}]`,`En Python, le premier élément est liste[0] : liste[${i}] est le ${rang8(i+1)}.`],
       ["fin de la tranche comprise",`liste[${a}:${b}]`,`liste[${a}:${b+1}]`,`liste[${a}:${b}] s'arrête juste avant l'indice ${b} : l'élément d'indice ${b} n'y est pas.`],
       ["début de la tranche décalé",`liste[${a}:${b}]`,`liste[${a+1}:${b+1}]`,`Les indices commencent à 0 : liste[${a}:${b}] commence au ${rang8(a+1)} élément.`],
       ["dernier élément mal lu","liste[-1]","liste[-2]","liste[-1] est le dernier élément (liste[-2] est l'avant-dernier)."]]};}],
 ["split","chaînes et split",R=>{const sep=R.choix([",",";",":"]),W=R.mel(PRE8).slice(0,R.ent(3,4)),k=R.ent(1,W.length-1),j=R.choix(["-","/","+"]);
   const V=R.mel([[`print(champs[${k}])`,`champs[${k}] est le ${rang8(k+1)} morceau : ${W[k]}.`],
     ["print(len(champs))",`len(champs) compte les morceaux : ${W.length}.`],
     [`print("${j}".join(champs))`,`join recolle les morceaux en mettant ${j} entre eux.`],
     ["print(champs[-1].upper())",`champs[-1] est le dernier morceau, ${W[W.length-1]} ; upper() le met en majuscules.`],
     ["print(champs)","Une liste de chaînes s'affiche entre crochets, chaque chaîne entre apostrophes."]]).slice(0,3);
   return {pas:[[`ligne = "${W.join(sep)}\\n"`,"Une ligne comme celles qu'on lit dans un fichier : elle finit par un retour à la ligne, \\n."],
       [`champs = ligne.strip().split("${sep}")`,`strip() enlève le \\n de la fin, puis split("${sep}") coupe à chaque ${sep} : champs vaut ${ls8(W)}.`],...V],
     mut:[["indices comptés à partir de 1",`champs[${k}]`,`champs[${k-1}]`,`Le premier morceau est champs[0] : champs[${k}] est le ${rang8(k+1)}.`],
       ["longueur de la ligne au lieu du nombre de morceaux","len(champs)","len(ligne)",`len(champs) compte les morceaux de la liste (${W.length}), pas les caractères de la ligne.`]]};}],
 ["accumulateur","somme ou compte dans une boucle",R=>{const s=R.choix([8,10,12]),N=uniq8(R,R.ent(4,6),3,19);if(!N.includes(s))N[R.ent(0,N.length-1)]=s;
   const o=R.choix([">=",">"]),somme=R.ent(0,1)===0,dans=R.ent(0,2)===0,v=somme?"total":"nombre",inc=somme?`${v} += n`:`${v} += 1`;
   return {pas:[[`notes = ${ls8(N)}`,"La liste des notes."],[`${v} = 0`,`${v} part de 0, avant la boucle.`],["for n in notes:","n prend tour à tour chaque valeur de la liste."],
       [`    if n ${o} ${s}:`,o===">="?`On ne garde que les notes d'au moins ${s} : >= veut dire « supérieur ou égal », donc ${s} compte.`:`On ne garde que les notes de plus de ${s} : > est strict, donc ${s} ne compte pas.`],
       [`        ${inc}`,somme?"On ajoute la note gardée.":"On compte une note de plus."],
       dans?[`    print(${v})`,"Ce print est décalé sous le for : il fait partie de la boucle et s'affiche à chaque tour, même quand la note n'est pas gardée."]:[`print(${v})`,"Ce print n'est pas décalé : il se fait une seule fois, après la boucle."]],
     mut:[["> et >= confondus",`n ${o} ${s}`,`n ${o===">="?">":">="} ${s}`,o===">="?`>= garde aussi la note égale à ${s}.`:`> est strict : la note égale à ${s} n'est pas gardée.`],
       dans?["un seul affichage au lieu d'un par tour",`    print(${v})`,`print(${v})`,"Le print est décalé sous le for : il fait partie de la boucle, donc il s'affiche à chaque tour."]:["un affichage à chaque tour",`print(${v})`,`    print(${v})`,"Le print n'est pas décalé : il vient après la boucle et ne s'affiche qu'une fois, à la fin."],
       ["test oublié",`    if n ${o} ${s}:`,"    if True:","Le if ne garde que certaines notes : les autres ne comptent pas."]]};}],
 ["while","boucle while",R=>{const a=R.ent(0,3),p=R.ent(2,3),n=R.ent(2,4),b=a+p*n,o=R.choix(["<","<="]),fin=o==="<"?b:b+p;
   return {pas:[[`i = ${a}`,`i part de ${a}.`],[`while i ${o} ${b}:`,`Le test est refait avant chaque tour ; dès qu'il est faux, la boucle s'arrête.${o==="<="?` Avec <=, le tour où i vaut ${b} se fait.`:` Avec <, le tour où i vaut ${b} ne se fait pas.`}`],
       ["    print(i)","Affiché à chaque tour, avant l'augmentation."],[`    i += ${p}`,`i augmente de ${p} à chaque tour.`],
       ['print("fin :", i)',`Après la boucle, i vaut la première valeur pour laquelle le test est faux : ${fin}. print sépare ses deux valeurs par une espace.`]],
     mut:[["< et <= confondus",`i ${o} ${b}`,`i ${o==="<"?"<=":"<"} ${b}`,o==="<"?`< est strict : quand i vaut ${b}, le test est faux et la boucle s'arrête.`:`<= laisse passer i = ${b} : ce tour-là se fait.`],
       ["valeur de i à la sortie",'print("fin :", i)',`print("fin :", i - ${p})`,"La boucle s'arrête quand le test devient faux : i vaut alors la valeur d'après la dernière affichée."],
       ["affichage après l'augmentation",`    print(i)\n    i += ${p}`,`    i += ${p}\n    print(i)`,`Le print vient avant i += ${p} : chaque tour affiche la valeur, puis l'augmente.`]]};}],
 ["dictionnaire","dictionnaire qui compte",R=>{const A=R.mel(ANI8).slice(0,3),M=Array.from({length:R.ent(5,7)},()=>R.choix(A));if(new Set(M).size<2)return null;
   const x=R.choix(M),D=[];for(const m of M){const e=D.find(y=>y[0]===m);if(e)e[1]++;else D.push([m,1]);}
   const fin=R.choix([[`print(compte["${x}"])`,`compte["${x}"] est la valeur de la clé ${q8(x)} : ${x} apparaît ${D.find(y=>y[0]===x)[1]} fois.`],["print(len(compte))",`len(compte) est le nombre de clés, donc de mots différents : ${D.length}.`]]);
   return {pas:[[`mots = ${ls8(M)}`,"La liste des mots."],["compte = {}","Un dictionnaire vide."],["for m in mots:","Un tour par mot, dans l'ordre de la liste."],
       ["    if m in compte:\n        compte[m] += 1","Si le mot est déjà une clé, on ajoute 1 à sa valeur."],["    else:\n        compte[m] = 1","Sinon, on crée la clé avec la valeur 1."],
       ["print(compte)","Un dictionnaire s'affiche entre accolades, clé: valeur, dans l'ordre où les clés ont été créées."],fin],
     mut:[["clés rangées dans l'ordre alphabétique","print(compte)","print(dict(sorted(compte.items())))","Un dictionnaire garde l'ordre où les clés ont été créées : le premier mot rencontré vient en premier, pas dans l'ordre alphabétique."],
       ["compteur remis à 1","        compte[m] += 1","        compte[m] = 1","compte[m] += 1 ajoute 1 à la valeur déjà là : un mot vu trois fois vaut 3."],
       ["len compte les mots de la liste","print(len(compte))","print(len(mots))","len(compte) est le nombre de clés, donc de mots différents, pas la longueur de la liste."]]};}],
 ["fonction","fonction et return",R=>{const T=R.choix([["x % 2 == 0","x // 2","3 * x + 1",x=>x%2===0?Math.floor(x/2):3*x+1],["x > 10","x - 10","x * 2",x=>x>10?x-10:x*2],["x % 3 == 0","x // 3","x + 2",x=>x%3===0?x/3:x+2]]);
   const [c,r1,r2,f]=T,a=R.ent(2,15),b=R.ent(2,15),fb=f(b);
   if(R.ent(0,1)){const x=R.ent(2,6),y=R.ent(2,6),z=R.ent(2,6),w=R.ent(2,6);
     return {pas:[["def calcule(a, b):","On définit calcule : rien ne s'affiche tant qu'on ne l'appelle pas."],["    print(a + b)","À chaque appel, la fonction affiche a + b…"],["    return a * b","… puis renvoie a * b à celui qui l'a appelée."],
         [`r = calcule(${x}, ${y})`,`L'appel affiche ${x+y}, et r reçoit ${x*y}.`],["print(r)",`Affiche r : ${x*y}.`],[`print(calcule(${z}, ${w}) + 1)`,`L'appel affiche d'abord ${z+w}, puis renvoie ${z*w} ; on affiche ${z*w} + 1 = ${z*w+1}.`]],
       mut:[["affichage dans la fonction oublié","    print(a + b)\n","","Chaque appel fait le print de la fonction : il affiche a + b avant de renvoyer a * b."],
         ["valeur renvoyée confondue avec l'affichage","    return a * b","    return a + b","print affiche a + b, mais la fonction renvoie a * b : r vaut le produit."]]};}
   return {pas:[["def f(x):","On définit f : rien ne s'affiche tant qu'on ne l'appelle pas."],[`    if ${c}:\n        return ${r1}`,`Si ${c}, f renvoie ${r1} et s'arrête là.`],[`    return ${r2}`,`Sinon, f renvoie ${r2}.`],
       [`print(f(${a}))`,`f(${a}) = ${f(a)}.`],[`print(f(f(${b})))`,`D'abord f(${b}) = ${fb}, puis f(${fb}) = ${f(fb)}.`]],
     mut:[["un seul appel au lieu de deux",`print(f(f(${b})))`,`print(f(${b}))`,`f(f(${b})) : on calcule d'abord f(${b}), puis f de ce résultat.`],
       ["return n'arrête pas la fonction",`        return ${r1}`,`        ${r1}`,`return renvoie la valeur et arrête la fonction : quand ${c}, la ligne return ${r2} n'est pas faite.`]]};}],
 ["mot","tranches d'une chaîne",R=>{const m=R.choix(MOT8),n=m.length,a=R.ent(1,3),b=R.ent(a+2,n-1);
   const V=R.mel([["print(mot[0] + mot[-1])",`mot[0] est la première lettre, mot[-1] la dernière : ${m[0]}${m[n-1]}.`],["print(mot[::-1])","[::-1] parcourt la chaîne à l'envers : c'est le mot retourné."],
     [`print(mot[${a}:${b}])`,`De l'indice ${a} inclus à l'indice ${b} exclu : ${m.slice(a,b)}.`],["print(mot.upper())","upper() met tout en majuscules."],["print(len(mot) * 2)",`len(mot) vaut ${n}, fois 2 : ${2*n}.`],["print(mot * 2)","Une chaîne fois 2 : la chaîne répétée deux fois, collée."]]).slice(0,R.ent(3,4));
   return {pas:[[`mot = "${m}"`,`Une chaîne de ${n} lettres, d'indices 0 à ${n-1}.`],...V],
     mut:[["indices comptés à partir de 1",`mot[${a}:${b}]`,`mot[${a-1}:${b-1}]`,`La première lettre est mot[0] : mot[${a}:${b}] commence à la ${rang8(a+1)} lettre.`],
       ["fin de la tranche comprise",`mot[${a}:${b}]`,`mot[${a}:${b+1}]`,`mot[${a}:${b}] s'arrête juste avant l'indice ${b}.`],
       ["[::-1] mal lu","mot[::-1]","mot[::1]","[::-1] avance d'un pas de -1, depuis la fin : la chaîne est lue à l'envers."],
       ["dernière lettre mal lue","mot[-1]","mot[-2]","mot[-1] est la dernière lettre."]]};}],
 ["construire","construire une liste",R=>{const N=uniq8(R,R.ent(5,6),1,20),C=R.choix([["n % 2 == 0","pairs","n % 2 == 1"],["n % 2 == 1","impairs","n % 2 == 0"],[`n > ${R.ent(6,12)}`,"plus grands",null]]),k=R.ent(2,5),t=R.choix([`n * ${k}`,`n + ${k}`,"n"]);
   if(!N.some(n=>C[0].includes("%")?n%2===(C[0].includes("== 0")?0:1):n>+C[0].split(" ")[2]))return null;
   return {pas:[[`nombres = ${ls8(N)}`,"La liste de départ."],["resultat = []","Une liste vide, avant la boucle."],["for n in nombres:","Un tour par nombre."],
       [`    if ${C[0]}:`,C[0].includes("%")?`n % 2 est le reste de la division par 2 : 0 pour un nombre pair, 1 pour un impair.`:`On ne garde que les nombres ${C[0].replace("n ","")}.`],
       [`        resultat.append(${t})`,t==="n"?"append ajoute le nombre à la fin de resultat.":`append ajoute ${t} à la fin de resultat, dans l'ordre des tours.`],
       ["print(resultat)","La liste construite."],["print(len(resultat))","Son nombre d'éléments."]],
     mut:[["test oublié",`    if ${C[0]}:`,"    if True:","Le if trie : seuls les nombres qui vérifient le test sont ajoutés."],
       ...(C[2]?[["pairs et impairs confondus",C[0],C[2],"n % 2 == 0 est vrai pour un nombre pair (le reste de la division par 2 est 0)."]]:[]),
       ...(t!=="n"?[["valeur ajoutée sans le calcul",`resultat.append(${t})`,"resultat.append(n)",`On ajoute ${t}, pas n.`]]:[])]};}],
 ["range","range",R=>{const a=R.ent(1,4),b=a+R.ent(2,4),n=R.ent(2,4),k=R.ent(2,5),S=Array.from({length:b-a},(_,i)=>a+i);
   return {pas:[["total = 0","total part de 0."],[`for i in range(${a}, ${b}):\n    total += i`,`range(${a}, ${b}) donne ${S.join(", ")} : ${b} n'y est pas.`],["print(total)",`${S.join(" + ")} = ${S.reduce((x,y)=>x+y,0)}.`],
       [`for i in range(${n}):\n    print(i * ${k})`,`range(${n}) donne 0 à ${n-1} : ${n} tours, et le premier i vaut 0.`]],
     mut:[["fin du range comprise",`range(${a}, ${b})`,`range(${a}, ${b+1})`,`range(${a}, ${b}) s'arrête juste avant ${b}.`],
       ["range(n) commence à 1",`range(${n})`,`range(1, ${n+1})`,`range(${n}) commence à 0 et finit à ${n-1}.`]]};}]
];

/* palier 2 : écrire une petite fonction */
const ret8=(fn,v)=>["return dans la boucle",`\n    return ${v}`,`\n        return ${v}`,`Le return est dans la boucle : la fonction s'arrête au premier tour. Il va après la boucle, au même retrait que le for.`];
const prt8=v=>["print au lieu de return",`    return ${v}`,`    print(${v})`,`print affiche la valeur, mais ne la renvoie pas : celui qui appelle la fonction reçoit None. Il faut return ${v}.`];
const raz8=(init,boucle)=>["valeur de départ remise à chaque tour",`    ${init}\n    ${boucle}`,`    ${boucle}\n        ${init}`,`${init} est dans la boucle : on repart de zéro à chaque tour. Cette ligne se met avant la boucle.`];
const PY2=[
 ["maximum","maximum ou minimum sans max()",R=>{const mx=R.ent(0,1)===0,fn=mx?"maximum":"minimum",o=mx?">":"<",bi=mx?"max":"min";
   const L1=uniq8(R,R.ent(4,5),1,40),L2=uniq8(R,R.ent(3,4),1,30).map(x=>mx?-x:x+50),L3=uniq8(R,4,1,50).sort((a,b)=>mx?b-a:a-b),L4=L3.slice().reverse(),L5=[R.ent(1,20)],L6=uniq8(R,5,-20,20);
   return {fn,sig:`${fn}(liste)`,dit:`renvoie le ${mx?"plus grand":"plus petit"} élément d'une liste de nombres non vide, sans utiliser ${bi}()`,
     appels:[L1,L2,L3,L4,L5,L6].map(l=>`${fn}(${ls8(l)})`),montre:2,
     pas:[[`def ${fn}(liste):`,"La fonction reçoit la liste.",0.5],["    m = liste[0]",`m retient le ${mx?"plus grand":"plus petit"} vu jusqu'ici. On part du premier élément, pas de 0 : avec des nombres tous ${mx?"négatifs":"plus grands que 0"}, 0 serait faux.`],
       ["    for v in liste:","On regarde chaque valeur."],[`        if v ${o} m:\n            m = v`,`Une valeur ${mx?"plus grande":"plus petite"} que m devient le nouveau m.`],["    return m","Après la boucle, au même retrait que le for : on renvoie m.",1]],
     sans:[[/\b(max|min)\s*\(/,`L'énoncé interdit ${bi}() : écris la boucle toi-même.`],[/\bsort(ed)?\s*\(/,"Écris la boucle toi-même, sans trier : c'est ce que le sujet note."]],
     mut:[["départ à 0","    m = liste[0]","    m = 0",`Avec m = 0 au départ, une liste de nombres tous ${mx?"négatifs":"plus grands que 0"} donne 0 : pars du premier élément, liste[0].`],ret8(fn,"m"),
       [mx?"plus petit au lieu de plus grand":"plus grand au lieu de plus petit",`v ${o} m`,`v ${mx?"<":">"} m`,"Le test garde la mauvaise valeur : la comparaison est dans l'autre sens."],prt8("m")],
     oracle:`def ${fn}(liste):\n    return ${bi}(liste)`};}],
 ["moyenne","moyenne sans sum()",R=>{const A=[[R.ent(8,16),R.ent(8,16)],uniq8(R,3,5,19),uniq8(R,4,0,20),[R.ent(0,20)],uniq8(R,5,1,20),[10,R.ent(11,19)]];
   return {fn:"moyenne",sig:"moyenne(liste)",dit:"renvoie la moyenne d'une liste de nombres non vide, sans utiliser sum()",appels:A.map(l=>`moyenne(${ls8(l)})`),montre:2,
     pas:[["def moyenne(liste):","La fonction reçoit la liste.",0.5],["    somme = 0","La somme part de 0, avant la boucle."],["    for v in liste:\n        somme += v","On ajoute chaque valeur."],
       ["    return somme / len(liste)","Après la boucle : la somme divisée par le nombre d'éléments. / donne un nombre à virgule (12.0, 12.5…).",1.5]],
     sans:[[/\bsum\s*\(/,"Écris la boucle toi-même, sans sum()."]],
     mut:[["division entière","somme / len(liste)","somme // len(liste)","// est la division entière : 12.5 deviendrait 12. La moyenne se calcule avec /."],raz8("somme = 0","for v in liste:"),ret8("moyenne","somme / len(liste)"),prt8("somme / len(liste)")],
     oracle:"def moyenne(liste):\n    return sum(liste) / len(liste)"};}],
 ["palindrome","palindrome, comme en janvier 2024",R=>{const P=R.mel(["radar","kayak","ressasser","elle","non","rotor","sagas","stats"]).slice(0,3),N=R.mel(["python","rare","maison","kayaks","radars","abca","ete"]).slice(0,3);
   const m=P[0],faux=m.slice(0,1)+(m[1]==="z"?"y":"z")+m.slice(2);
   const A=[P[0],N[0],P[1],N[1],faux,R.choix(["a",""]),P[2],N[2]];
   return {fn:"palindrome",sig:"palindrome(chaine)",dit:"renvoie True si la chaîne se lit pareil dans les deux sens, et False sinon, sans utiliser reverse()",appels:A.map(s=>`palindrome(${q8(s)})`),montre:2,
     pas:[["def palindrome(chaine):","La fonction reçoit la chaîne.",0.5],["    for pos in range(len(chaine)):","pos parcourt les indices de la chaîne, de 0 à len(chaine) - 1."],
       ["        if chaine[pos] != chaine[len(chaine) - pos - 1]:\n            return False","La lettre en face de pos est à l'indice len(chaine) - pos - 1. Une seule différence suffit pour répondre False.",1.5],
       ["    return True","Après la boucle : aucune différence, c'est un palindrome."]],
     alt:["def palindrome(chaine):\n    return chaine == chaine[::-1]"],
     sans:[[/\breverse(d)?\s*\(/,"L'énoncé interdit reverse() : compare les lettres toi-même (ou avec chaine[::-1])."]],
     mut:[["indice qui sort de la chaîne","len(chaine) - pos - 1","len(chaine) - pos","La lettre en face de pos est chaine[len(chaine) - pos - 1] : sans le - 1, au premier tour on lit chaine[len(chaine)], qui n'existe pas."],
       ["return True dans la boucle","\n    return True","\n        return True","La fonction répond True dès que la première lettre est égale à la dernière : on ne peut dire True qu'après avoir tout comparé, donc après la boucle."],
       ["test à l'envers","chaine[pos] != chaine","chaine[pos] == chaine","Le test doit chercher une différence : dès que deux lettres en face sont différentes, ce n'est pas un palindrome."]],
     oracle:"def palindrome(chaine):\n    return list(chaine) == list(reversed(chaine))"};}],
 ["intersection","intersection, comme en janvier 2023",R=>{const paire=()=>{const C=uniq8(R,R.ent(1,3),1,30),A=uniq8(R,R.ent(2,4),31,60),B=uniq8(R,R.ent(2,3),61,90),l1=R.mel([...C,...A,C[0]]),l2=R.mel([...C,...B]);return [l1,l2];};
   const P=[paire(),paire(),[uniq8(R,3,1,20),uniq8(R,3,21,40)],paire(),[[R.ent(1,9)],[]],paire()];
   return {fn:"intersection",sig:"intersection(liste1, liste2)",dit:"renvoie la liste des éléments présents à la fois dans liste1 et dans liste2, sans doublon, dans l'ordre de liste1",
     appels:P.map(([a,b])=>`intersection(${ls8(a)}, ${ls8(b)})`),montre:2,
     pas:[["def intersection(liste1, liste2):","La fonction reçoit les deux listes.",0.5],["    encommun = []","La liste résultat, vide au départ."],["    for v in liste1:","On parcourt liste1 : le résultat suit son ordre."],
       ["        if v in liste2 and v not in encommun:\n            encommun.append(v)","On garde v s'il est aussi dans liste2 ; not in encommun évite de l'ajouter deux fois.",1.5],["    return encommun","Après la boucle."]],
     alt:["def intersection(liste1, liste2):\n    encommun = []\n    for v in liste1:\n        if v in liste2:\n            if v not in encommun:\n                encommun.append(v)\n    return encommun"],
     mut:[["doublons gardés"," and v not in encommun","","Un élément présent deux fois dans liste1 serait ajouté deux fois : and v not in encommun l'évite."],ret8("intersection","encommun"),raz8("encommun = []","for v in liste1:"),prt8("encommun")],
     oracle:"def intersection(liste1, liste2):\n    return [v for v in dict.fromkeys(liste1) if v in liste2]"};}],
 ["repetitions","enlever les répétitions, comme en janvier 2022",R=>{const liste=()=>{const V=uniq8(R,R.ent(3,4),1,30),L=[];V.forEach(v=>{for(let k=R.ent(1,3);k;k--)L.push(v);});const r=V[R.ent(0,V.length-2)];L.push(r,r);return L;};
   const A=[[2,23,23,7,7,7,4,9,9,7],liste(),liste(),[],[R.ent(1,9)],liste()];
   return {fn:"sans_repetitions",sig:"sans_repetitions(liste)",dit:"renvoie une nouvelle liste où chaque suite de valeurs égales qui se suivent n'est gardée qu'une fois (les nombres sont des entiers positifs)",
     appels:A.map(l=>`sans_repetitions(${ls8(l)})`),montre:2,
     pas:[["def sans_repetitions(liste):","La fonction reçoit la liste.",0.5],["    nliste = []\n    mem = -1","nliste est le résultat ; mem retient la dernière valeur gardée. -1 ne peut pas être dans la liste (entiers positifs)."],
       ["    for n in liste:","Un tour par valeur."],["        if n != mem:\n            nliste.append(n)\n            mem = n","On garde n s'il est différent de la valeur d'avant, et il devient la nouvelle mémoire.",1.5],["    return nliste","Après la boucle."]],
     alt:["def sans_repetitions(liste):\n    nliste = []\n    for n in liste:\n        if len(nliste) == 0 or n != nliste[-1]:\n            nliste.append(n)\n    return nliste"],
     mut:[["toutes les répétitions enlevées","if n != mem:","if n not in nliste:","Avec not in, une valeur qui revient plus loin serait perdue (le dernier 7 de l'exemple) : on compare seulement à la valeur d'avant. Le corrigé officiel le dit."],
       ["mémoire jamais mise à jour","\n            mem = n","","mem doit retenir la dernière valeur gardée : sans mem = n, elle reste -1 et tout passe."],
       ["nliste[-1] sur une liste vide","if n != mem:","if n != nliste[-1]:","Au premier tour, nliste est vide : nliste[-1] n'existe pas. D'où la variable mem (ou le test len(nliste) == 0 d'abord)."],prt8("nliste")],
     oracle:"def sans_repetitions(liste):\n    return [v for i, v in enumerate(liste) if i == 0 or v != liste[i - 1]]"};}],
 ["compter","compter sans count()",R=>{
   if(R.ent(0,1)){const W=R.mel(["python","banane","rythme","oiseau","bcd","informatique","lit","aeiouy"]).slice(0,5).concat([""]);
     return {fn:"nb_voyelles",sig:"nb_voyelles(mot)",dit:"renvoie le nombre de voyelles (a, e, i, o, u, y) du mot, écrit en minuscules sans accent",appels:W.map(m=>`nb_voyelles(${q8(m)})`),montre:2,
       pas:[["def nb_voyelles(mot):","La fonction reçoit le mot.",0.5],["    n = 0","Le compteur part de 0, avant la boucle."],["    for lettre in mot:","Une boucle for sur une chaîne donne ses lettres une par une."],
         ['        if lettre in "aeiouy":\n            n += 1',"in sur une chaîne teste si la lettre en fait partie.",1.5],["    return n","Après la boucle."]],
       mut:[["une lettre comparée à toute la chaîne",'lettre in "aeiouy"','lettre == "aeiouy"','lettre == "aeiouy" compare une lettre à la chaîne entière, jamais égales : il faut in.'],raz8("n = 0","for lettre in mot:"),ret8("nb_voyelles","n"),["compteur jamais augmenté","            n += 1","            n = 1","n += 1 ajoute 1 ; n = 1 remet le compteur à 1."]],
       oracle:'def nb_voyelles(mot):\n    return sum(1 for c in mot if c in "aeiouy")'};}
   const x=R.ent(1,9),L=()=>Array.from({length:R.ent(4,7)},()=>R.choix([x,x,R.ent(1,9),R.ent(1,9)]));
   const A=[[L(),x],[L(),x],[[x,x,x],x],[[x+1,x+2],x],[[],x],[L(),x+1]];
   return {fn:"compter",sig:"compter(liste, x)",dit:"renvoie le nombre de fois où x apparaît dans la liste, sans utiliser count()",appels:A.map(([l,v])=>`compter(${ls8(l)}, ${v})`),montre:2,
     pas:[["def compter(liste, x):","La fonction reçoit la liste et la valeur cherchée.",0.5],["    n = 0","Le compteur part de 0, avant la boucle."],["    for v in liste:","Un tour par valeur."],
       ["        if v == x:\n            n += 1","== compare ; une valeur égale à x compte une fois de plus.",1.5],["    return n","Après la boucle."]],
     sans:[[/\.count\s*\(/,"L'énoncé interdit count() : écris la boucle toi-même."]],
     mut:[["test à l'envers","v == x","v != x","On compte les valeurs égales à x : ==."],raz8("n = 0","for v in liste:"),ret8("compter","n"),prt8("n")],
     oracle:"def compter(liste, x):\n    return liste.count(x)"};}],
 ["filtrer","construire la liste de ceux qui vérifient un test",R=>{const C=R.choix([["pairs","nombres pairs","x % 2 == 0","x % 2 == 1"],["positifs","nombres strictement positifs","x > 0","x < 0"],["impairs","nombres impairs","x % 2 == 1","x % 2 == 0"]]);
   const L=()=>uniq8(R,R.ent(4,6),-9,20),A=[L(),L(),L(),[],[R.choix([1,3,-5])],L()];
   return {fn:C[0],sig:`${C[0]}(liste)`,dit:`renvoie la liste des ${C[1]} de la liste, dans le même ordre`,appels:A.map(l=>`${C[0]}(${ls8(l)})`),montre:2,
     pas:[[`def ${C[0]}(liste):`,"La fonction reçoit la liste.",0.5],["    resultat = []","Le résultat, vide au départ, avant la boucle."],["    for x in liste:","Un tour par valeur."],
       [`        if ${C[2]}:\n            resultat.append(x)`,C[2].includes("%")?"x % 2 est le reste de la division par 2 : 0 si x est pair, 1 s'il est impair (en Python, même pour un négatif).":"On ne garde que les x qui vérifient le test.",1.5],["    return resultat","Après la boucle."]],
     mut:[["test à l'envers",C[2],C[3],"La condition garde les mauvais éléments."],raz8("resultat = []","for x in liste:"),ret8(C[0],"resultat"),["liste remplacée au lieu d'agrandie","resultat.append(x)","resultat = [x]","resultat = [x] remplace toute la liste ; append(x) ajoute à la fin."]],
     oracle:`def ${C[0]}(liste):\n    return [x for x in liste if ${C[2]}]`};}],
 ["inverse","inverser une liste sans reverse()",R=>{const L=()=>uniq8(R,R.ent(3,6),1,50),A=[L(),L(),[R.ent(1,9)],[],L(),["a","b","c"]];
   return {fn:"inverse",sig:"inverse(liste)",dit:"renvoie une nouvelle liste avec les éléments de la liste dans l'ordre inverse, sans utiliser reverse(), reversed() ni [::-1]",appels:A.map(l=>`inverse(${ls8(l)})`),montre:2,
     pas:[["def inverse(liste):","La fonction reçoit la liste.",0.5],["    resultat = []","Le résultat, vide au départ."],
       ["    for i in range(len(liste) - 1, -1, -1):","i va du dernier indice, len(liste) - 1, jusqu'à 0 : range s'arrête juste avant -1, et le pas -1 fait descendre.",1.5],
       ["        resultat.append(liste[i])","On ajoute les éléments en partant de la fin."],["    return resultat","Après la boucle."]],
     alt:["def inverse(liste):\n    resultat = []\n    for x in liste:\n        resultat.insert(0, x)\n    return resultat"],
     sans:[[/\breverse(d)?\s*\(|\[\s*:\s*:\s*-\s*1\s*\]/,"L'énoncé interdit reverse(), reversed() et [::-1] : écris la boucle toi-même."]],
     mut:[["premier élément oublié","range(len(liste) - 1, -1, -1)","range(len(liste) - 1, 0, -1)","range s'arrête juste avant la borne de fin : avec 0, l'indice 0 n'est jamais atteint. Pour descendre jusqu'à 0, la borne est -1."],
       ["indice qui sort de la liste","range(len(liste) - 1, -1, -1)","range(len(liste), -1, -1)","Le dernier indice est len(liste) - 1 : liste[len(liste)] n'existe pas."],ret8("inverse","resultat")],
     oracle:"def inverse(liste):\n    return liste[::-1]"};}],
 ["plus_long","le mot le plus long",R=>{const W=()=>{const L=R.mel("chat chien oie lapin cheval rat poule souris".split(" ")).slice(0,R.ent(3,5));return L;};
   const A=[W(),W(),["ab","cd","e"],["un"],W(),["zz","aaa","bbb"]];
   return {fn:"plus_long",sig:"plus_long(mots)",dit:"renvoie le mot le plus long d'une liste de mots non vide (le premier rencontré s'il y en a plusieurs de la même longueur)",appels:A.map(l=>`plus_long(${ls8(l)})`),montre:2,
     pas:[["def plus_long(mots):","La fonction reçoit la liste.",0.5],["    meilleur = mots[0]","Le plus long vu jusqu'ici : on part du premier mot."],["    for m in mots:","Un tour par mot."],
       ["        if len(m) > len(meilleur):\n            meilleur = m","On compare les longueurs ; > strict garde le premier en cas d'égalité.",1.5],["    return meilleur","Après la boucle."]],
     sans:[[/\b(max|sorted|sort)\s*\(/,"Écris la boucle toi-même, sans max() ni tri."]],
     mut:[["le dernier gardé en cas d'égalité","len(m) > len(meilleur)","len(m) >= len(meilleur)","Avec >=, un mot de même longueur remplace le précédent : on garderait le dernier, pas le premier."],
       ["mots comparés par ordre alphabétique","len(m) > len(meilleur)","m > meilleur","m > meilleur compare les mots dans l'ordre alphabétique ; on veut comparer len(m) et len(meilleur)."],ret8("plus_long","meilleur")],
     oracle:"def plus_long(mots):\n    return max(mots, key=len)"};}],
 ["arithmetique","factorielle ou nombre premier",R=>{
   if(R.ent(0,1)){const A=R.mel([0,1,3,5,6,7,8,10]).slice(0,6);
     return {fn:"factorielle",sig:"factorielle(n)",dit:"renvoie n! = 1 × 2 × … × n pour un entier n positif ou nul (0! vaut 1)",appels:A.map(n=>`factorielle(${n})`),montre:2,
       pas:[["def factorielle(n):","La fonction reçoit n.",0.5],["    resultat = 1","Le produit part de 1 (avec 0, tout resterait à 0)."],["    for i in range(2, n + 1):\n        resultat *= i","i va de 2 à n : range(2, n + 1) s'arrête juste avant n + 1.",1.5],["    return resultat","Après la boucle. Pour n = 0 ou 1, la boucle ne fait aucun tour : 1."]],
       alt:["def factorielle(n):\n    if n <= 1:\n        return 1\n    return n * factorielle(n - 1)"],
       mut:[["n oublié dans le produit","range(2, n + 1)","range(2, n)","range(2, n) s'arrête avant n : il manque le dernier facteur."],["produit qui part de 0","    resultat = 1","    resultat = 0","Un produit part de 1 : 0 × … donne toujours 0."],ret8("factorielle","resultat")],
       oracle:"import math\ndef factorielle(n):\n    return math.factorial(n)"};}
   const A=R.mel([1,2,7,9,15,17,21,25,29,31]).slice(0,7);if(!A.includes(1))A[R.ent(0,6)]=1;
   return {fn:"est_premier",sig:"est_premier(n)",dit:"renvoie True si l'entier n est premier (il a exactement deux diviseurs, 1 et lui-même), et False sinon",appels:A.map(n=>`est_premier(${n})`),montre:2,
     pas:[["def est_premier(n):","La fonction reçoit n.",0.5],["    if n < 2:\n        return False","0 et 1 ne sont pas premiers."],["    for d in range(2, n):\n        if n % d == 0:\n            return False","Un diviseur d entre 2 et n - 1 suffit pour répondre False : n % d == 0 veut dire que d divise n.",1.5],["    return True","Après la boucle : aucun diviseur trouvé."]],
     mut:[["1 compté comme premier","    if n < 2:\n        return False\n","","1 n'a qu'un diviseur : il n'est pas premier. La boucle ne fait aucun tour pour n = 1, d'où le test n < 2."],
       ["return True dans la boucle","\n    return True","\n        return True","La fonction répond True dès le premier d qui ne divise pas : on ne peut dire True qu'après avoir essayé tous les d, après la boucle."],
       ["diviseur 1 essayé","range(2, n)","range(1, n)","Tout nombre est divisible par 1 : les diviseurs à essayer commencent à 2."]],
     oracle:"def est_premier(n):\n    return n > 1 and all(n % d for d in range(2, n))"};}]
];

/* palier 3 : un fichier et un dictionnaire */
const lignes8=L=>L.join("\n")+"\n";
const PY3=[
 ["mots","compter les mots d'un fichier",R=>{const V=R.mel("le chat la souris un chien mange dort".split(" ")).slice(0,5),txt=()=>Array.from({length:R.ent(2,3)},()=>Array.from({length:R.ent(3,4)},()=>R.choix(V)).join(" "));
   const F=[txt(),txt(),txt()];
   return {nom:"mots.py",dit:"lit le fichier dont le nom est passé en paramètre, crée un dictionnaire mots où chaque mot (les mots sont séparés par une espace) a pour valeur son nombre d'apparitions, puis affiche ce dictionnaire",
     vers:F.map(f=>({A:["texte.txt"],T:arboDe([{n:"texte.txt",c:lignes8(f)}])})),montre:["texte.txt"],
     pas:[["import sys","Pour lire le paramètre : sys.argv[1].",0.5],["mots = {}","Le dictionnaire, vide au départ.",0.5],["with open(sys.argv[1]) as fd:\n    for ligne in fd:","On ouvre le fichier passé en paramètre et on le lit ligne par ligne."],
       ['        for mot in ligne.strip().split(" "):',"strip() enlève le retour à la ligne, split(\" \") coupe aux espaces."],["            if mot in mots:\n                mots[mot] += 1\n            else:\n                mots[mot] = 1","Le mot déjà vu gagne 1 ; un mot nouveau devient une clé qui vaut 1.",1.5],["print(mots)","Les clés s'affichent dans l'ordre où elles ont été créées.",0.5]],
     alt:["import sys\nmots = {}\nfd = open(sys.argv[1])\nfor ligne in fd:\n    for mot in ligne.split():\n        mots[mot] = mots.get(mot, 0) + 1\nfd.close()\nprint(mots)"],
     mut:[["strip() oublié",'ligne.strip().split(" ")','ligne.split(" ")',"Sans strip(), le dernier mot de chaque ligne garde son retour à la ligne : 'chat\\n' et 'chat' deviennent deux clés différentes."],
       ["clé pas encore créée","            if mot in mots:\n                mots[mot] += 1\n            else:\n                mots[mot] = 1","            mots[mot] += 1","mots[mot] += 1 lit d'abord mots[mot] : la première fois, la clé n'existe pas (KeyError). Teste if mot in mots, sinon mets mots[mot] = 1."],
       ["compteur jamais augmenté","mots[mot] += 1","mots[mot] = 1","mots[mot] = 1 remet la valeur à 1 : un mot vu trois fois doit valoir 3."],
       ["mauvais séparateur",'split(" ")','split(",")',"Les mots sont séparés par des espaces : split(\" \"). Avec split(\",\"), toute la ligne reste un seul morceau."]]};}],
 ["images","le fichier images.csv, comme en janvier 2026",R=>{const E=["jpg","png","gif","webp","jpeg","bmp"],f=()=>{const e=R.mel(E).slice(0,R.ent(3,4));return [e.join(","),e.map(()=>R.ent(0,30)).join(",")];};
   const F=[f(),f(),f()];
   return {nom:"stats.py",dit:"lit le fichier images.csv du dossier courant (première ligne : des extensions ; deuxième ligne : le nombre d'images de chaque extension, séparés par des virgules), crée un dictionnaire statistiques avec les extensions en clés et ces nombres (des entiers) en valeurs, puis l'affiche",
     vers:F.map(f=>({A:[],T:arboDe([{n:"images.csv",c:lignes8(f)}])})),montre:["images.csv"],
     pas:[["statistiques = {}","Le dictionnaire, vide au départ.",0.5],['with open("images.csv") as fd:\n    lignes = fd.readlines()',"readlines() donne la liste des lignes : lignes[0] et lignes[1]."],
       ['    images = lignes[0].strip().split(",")\n    nombres = lignes[1].strip().split(",")',"Chaque ligne, sans son retour à la ligne, coupée aux virgules.",1.5],
       ["    for i in range(len(images)):\n        statistiques[images[i]] = int(nombres[i])","L'extension d'indice i va avec le nombre d'indice i ; int() parce qu'on lit du texte.",1.5],["print(statistiques)","Le dictionnaire.",0.5]],
     alt:['statistiques = {}\nfd = open("images.csv")\nimages = fd.readline().strip().split(",")\nnombres = fd.readline().strip().split(",")\nfd.close()\nfor i in range(len(images)):\n    statistiques[images[i]] = int(nombres[i])\nprint(statistiques)'],
     mut:[["int() oublié","int(nombres[i])","nombres[i]","Ce qu'on lit dans un fichier est du texte : sans int(), la valeur est '10', pas le nombre 10."],
       ["lignes inversées","images = lignes[0]","images = lignes[1]","La première ligne, lignes[0], porte les extensions ; la deuxième, lignes[1], les nombres."],
       ["strip() oublié",'lignes[0].strip().split(",")','lignes[0].split(",")',"Sans strip(), la dernière extension garde son retour à la ligne : la clé devient 'gif\\n'."],
       ["dernier élément oublié","range(len(images))","range(len(images) - 1)","range(len(images)) donne tous les indices, de 0 à len(images) - 1 : avec - 1 en plus, le dernier est oublié."]]};}],
 ["modeles","les modèles d'ordinateurs, comme en janvier 2024",R=>{const M=R.mel(["DELL Precision","Lenovo M900","HP Elite","Asus Zen","Acer Swift"]).slice(0,3),f=()=>Array.from({length:R.ent(2,3)},()=>R.mel(M).slice(0,R.ent(1,3)).map(m=>m+"="+R.ent(1,30)).join(","));
   const F=[f(),f(),f()];
   return {nom:"modeles.py",dit:"lit le fichier passé en paramètre, dont chaque ligne est de la forme « DELL Precision=25,Lenovo M900=15 », crée un dictionnaire dico qui associe à chaque modèle le nombre total d'ordinateurs de ce modèle (toutes lignes confondues), puis l'affiche",
     vers:F.map(f=>({A:["parc.txt"],T:arboDe([{n:"parc.txt",c:lignes8(f)}])})),montre:["parc.txt"],
     pas:[["import sys\ndico = {}","Le paramètre, et le dictionnaire vide.",0.5],["with open(sys.argv[1]) as fd:\n    for ligne in fd:","Le fichier, ligne par ligne."],
       ['        for morceau in ligne.strip().split(","):',"Premier découpage, à la virgule : un morceau par modèle."],
       ['            ordi = morceau.split("=")[0]\n            nombre = int(morceau.split("=")[1])',"Second découpage, au signe = : le modèle, puis le nombre, en entier pour pouvoir l'additionner.",1.5],
       ["            if ordi in dico:\n                dico[ordi] += nombre\n            else:\n                dico[ordi] = nombre","On additionne les quantités : on ne compte pas les lignes.",1.5],["print(dico)","Le dictionnaire.",0.5]],
     alt:['import sys\ndico = {}\nwith open(sys.argv[1]) as fd:\n    for ligne in fd:\n        for morceau in ligne.strip().split(","):\n            ordi, nombre = morceau.split("=")\n            dico[ordi] = dico.get(ordi, 0) + int(nombre)\nprint(dico)'],
     mut:[["int() oublié",'int(morceau.split("=")[1])','morceau.split("=")[1]',"Sans int(), les nombres restent du texte : '25' + '15' donne '2515', collés."],
       ["valeur remplacée au lieu d'additionnée","dico[ordi] += nombre","dico[ordi] = nombre","dico[ordi] = nombre remplace la quantité déjà là : il faut l'ajouter, +=."],
       ["compte des lignes au lieu des quantités","dico[ordi] += nombre","dico[ordi] += 1","On veut le nombre d'ordinateurs : on additionne les nombres écrits dans le fichier."]]};}],
 ["systemes","les systèmes d'un parc, comme en janvier 2025",R=>{const S=R.mel(["windows11","ubuntu-NobleNumbat","ubuntu-JammyJellyfish","debian12","fedora40"]).slice(0,3),f=()=>{let k=R.ent(1,40);return Array.from({length:R.ent(3,4)},()=>["PC"+(k++),...R.mel(S).slice(0,R.ent(1,2))].join(","));};
   const F=[f(),f(),f()];
   return {nom:"parc.py",dit:"lit le fichier parc.csv du dossier courant (sur chaque ligne : un ordinateur, puis ses systèmes, séparés par des virgules), crée un dictionnaire systemes qui associe à chaque système la liste des ordinateurs qui l'ont, puis l'affiche",
     vers:F.map(f=>({A:[],T:arboDe([{n:"parc.csv",c:lignes8(f)}])})),montre:["parc.csv"],
     pas:[["systemes = {}","Le dictionnaire, vide au départ.",0.5],['with open("parc.csv") as fd:\n    for ligne in fd:',"Le fichier, ligne par ligne."],
       ['        data = ligne.strip().split(",")\n        ordi = data[0]',"Le premier champ est l'ordinateur.",1],["        for systeme in data[1:]:","data[1:] : tous les champs à partir du deuxième, les systèmes."],
       ["            if systeme in systemes:\n                systemes[systeme].append(ordi)\n            else:\n                systemes[systeme] = [ordi]","Système déjà vu : on ajoute l'ordinateur à sa liste ; sinon on crée la liste [ordi].",1.5],["print(systemes)","Le dictionnaire de listes.",0.5]],
     alt:['systemes = {}\nfd = open("parc.csv")\nfor ligne in fd:\n    data = ligne.strip().split(",")\n    for systeme in data[1:]:\n        if systeme not in systemes:\n            systemes[systeme] = []\n        systemes[systeme].append(data[0])\nfd.close()\nprint(systemes)'],
     mut:[["l'ordinateur pris pour un système","data[1:]","data","data[1:] saute le premier champ : l'ordinateur n'est pas un système."],
       ["liste remplacée au lieu d'agrandie","systemes[systeme].append(ordi)","systemes[systeme] = [ordi]","systemes[systeme] = [ordi] remplace la liste : il faut append(ordi) pour ajouter."],
       ["valeur qui n'est pas une liste","systemes[systeme] = [ordi]","systemes[systeme] = ordi","La valeur doit être une liste, [ordi] : une chaîne n'a pas de append."],
       ["strip() oublié",'ligne.strip().split(",")','ligne.split(",")',"Sans strip(), le dernier système de chaque ligne garde son retour à la ligne : 'debian12\\n' devient une clé à part."]]};}],
 ["recus","les reçus d'un fichier de notes",R=>{const f=()=>{const N=R.mel(PRE8).slice(0,R.ent(3,5)).map(n=>n+","+R.choix([R.ent(2,19),R.ent(2,19),10]));if(!N.some(x=>/,10$/.test(x)))N[0]=N[0].replace(/,\d+$/,",10");return N;};
   const F=[f(),f()];
   return {nom:"recus.py",dit:"lit le fichier passé en paramètre (sur chaque ligne : un nom et une note entière, séparés par une virgule), affiche le nom de chaque étudiant qui a au moins 10, puis le nombre de reçus suivi du mot reçus. Sans paramètre, il affiche seulement Donne un fichier",
     vers:[...F.map(f=>({A:["notes.csv"],T:arboDe([{n:"notes.csv",c:lignes8(f)}])})),{A:[],T:arboDe([{n:"notes.csv",c:lignes8(F[0])}])}],montre:["notes.csv"],
     pas:[["import sys","Pour sys.argv.",0.5],['if len(sys.argv) < 2:\n    print("Donne un fichier")\n    sys.exit()',"sys.argv[0] est le nom du script : sans paramètre, len(sys.argv) vaut 1. sys.exit() arrête le script.",1.5],
       ["recus = 0","Le compteur, avant la boucle.",0.5],["with open(sys.argv[1]) as fd:\n    for ligne in fd:",'Le fichier, ligne par ligne.'],
       ['        nom, note = ligne.strip().split(",")',"Les deux champs dans deux variables."],["        if int(note) >= 10:\n            print(nom)\n            recus += 1","int() : la note lue est du texte. >= 10 : 10 est reçu.",1.5],['print(recus, "reçus")',"Après la boucle : le nombre, une espace, reçus.",0.5]],
     alt:['import sys\nif len(sys.argv) < 2:\n    print("Donne un fichier")\nelse:\n    recus = 0\n    fd = open(sys.argv[1])\n    for ligne in fd:\n        champs = ligne.strip().split(",")\n        if int(champs[1]) >= 10:\n            print(champs[0])\n            recus = recus + 1\n    fd.close()\n    print(recus, "reçus")'],
     mut:[["int() oublié","if int(note) >= 10:","if note >= 10:","Ce qu'on lit dans un fichier est du texte : Python ne compare pas '12' et 10. int(note) d'abord."],
       ["> et >= confondus","int(note) >= 10","int(note) > 10","Au moins 10, c'est >= 10 : la note 10 est reçue."],
       ["le nom du script compté dans sys.argv","len(sys.argv) < 2","len(sys.argv) < 1","sys.argv[0] est le nom du script : sans paramètre, len(sys.argv) vaut déjà 1. Le test est len(sys.argv) < 2."],
       ["compteur hors du test","            print(nom)\n            recus += 1","            print(nom)\n        recus += 1","recus += 1 doit être dans le if, sous le print : sinon on compte tout le monde."]]};}],
 ["villes","compter par valeur d'un champ",R=>{const V=R.mel(["Montpellier","Nîmes","Sète","Lunel","Béziers"]).slice(0,3),f=()=>R.mel(PRE8).slice(0,R.ent(4,6)).map(n=>n+","+R.choix(V));
   const F=[f(),f(),f()];
   return {nom:"villes.py",dit:"lit le fichier inscrits.csv du dossier courant (sur chaque ligne : un nom et une ville, séparés par une virgule), crée un dictionnaire villes qui associe à chaque ville son nombre d'inscrits, puis l'affiche",
     vers:F.map(f=>({A:[],T:arboDe([{n:"inscrits.csv",c:lignes8(f)}])})),montre:["inscrits.csv"],
     pas:[["villes = {}","Le dictionnaire, vide au départ.",0.5],['with open("inscrits.csv") as fd:\n    for ligne in fd:',"Le fichier, ligne par ligne."],
       ['        ville = ligne.strip().split(",")[1]',"Le deuxième champ, d'indice 1, sans le retour à la ligne.",1.5],["        if ville in villes:\n            villes[ville] += 1\n        else:\n            villes[ville] = 1","On compte comme d'habitude.",1.5],["print(villes)","Le dictionnaire.",0.5]],
     alt:['villes = {}\nfd = open("inscrits.csv", "r")\nfor ligne in fd.readlines():\n    nom, ville = ligne.strip().split(",")\n    if ville not in villes:\n        villes[ville] = 0\n    villes[ville] += 1\nfd.close()\nprint(villes)'],
     mut:[["mauvais champ",'split(",")[1]','split(",")[0]',"Le champ d'indice 0 est le nom ; la ville est le champ d'indice 1."],
       ["clé pas encore créée","        if ville in villes:\n            villes[ville] += 1\n        else:\n            villes[ville] = 1","        villes[ville] += 1","La première fois, la ville n'est pas une clé : villes[ville] += 1 donne KeyError. Teste d'abord if ville in villes."],
       ["strip() oublié",'ligne.strip().split(",")[1]','ligne.split(",")[1]',"Sans strip(), la ville garde son retour à la ligne : 'Sète\\n' n'est pas 'Sète'."]]};}],
 ["regrouper","regrouper les notes de chacun",R=>{const N=R.mel(PRE8).slice(0,3),f=()=>Array.from({length:R.ent(4,6)},()=>R.choix(N)+","+R.ent(2,20));
   const F=[f(),f(),f()];
   return {nom:"notes.py",dit:"lit le fichier notes.csv du dossier courant (sur chaque ligne : un nom et une note entière, séparés par une virgule ; un même nom revient plusieurs fois), crée un dictionnaire notes qui associe à chaque nom la liste de ses notes (des entiers, dans l'ordre du fichier), puis l'affiche",
     vers:F.map(f=>({A:[],T:arboDe([{n:"notes.csv",c:lignes8(f)}])})),montre:["notes.csv"],
     pas:[["notes = {}","Le dictionnaire, vide au départ.",0.5],['with open("notes.csv") as fd:\n    for ligne in fd:',"Le fichier, ligne par ligne."],
       ['        nom, note = ligne.strip().split(",")',"Les deux champs."],["        if nom in notes:\n            notes[nom].append(int(note))\n        else:\n            notes[nom] = [int(note)]","Nom déjà vu : on ajoute la note à sa liste ; sinon on crée la liste avec cette note. int() : on veut des entiers.",2],["print(notes)","Le dictionnaire de listes.",0.5]],
     alt:['notes = {}\nfor ligne in open("notes.csv"):\n    champs = ligne.strip().split(",")\n    notes.setdefault(champs[0], []).append(int(champs[1]))\nprint(notes)'],
     mut:[["liste remplacée au lieu d'agrandie","notes[nom].append(int(note))","notes[nom] = [int(note)]","notes[nom] = [...] remplace la liste : on ne garderait que la dernière note. append ajoute."],
       ["int() oublié","notes[nom] = [int(note)]","notes[nom] = [note]","Sans int(), la première note de chacun resterait du texte, '12' au lieu de 12."],
       ["clé pas encore créée","        if nom in notes:\n            notes[nom].append(int(note))\n        else:\n            notes[nom] = [int(note)]","        notes[nom].append(int(note))","La première fois, le nom n'est pas une clé : notes[nom] donne KeyError. Crée d'abord la liste."]]};}]
];

/* palier 4 : parcours récursif, comme aux examens */
const SOUS8=["vacances","2024","famille","td","tp","archives","src","old","cours"];
function foret8(R,exts,autres,prof){const B=R.mel(BASES7),D=R.mel(SOUS8);let b=0,d=0;
  const f=e=>({n:B[b++%B.length]+(b>B.length?b:"")+"."+e,c:""});
  const va=k=>{const L=[];for(let i=R.ent(1,2);i;i--)L.push(f(R.choix(exts)));if(R.ent(0,2)===0&&autres.length)L.push(f(R.choix(autres)));
    if(k<prof)for(let i=k?R.ent(0,1):R.ent(1,2);i;i--)L.push(dos7(D[d++%D.length]+(d>D.length?d:""),va(k+1)));return L;};
  const L=va(0);if(!L.some(x=>x.d&&x.d.some(y=>y.d)))L.push(dos7("profond",[dos7("dedans",[f(R.choix(exts))])]));return L;}
const NOTE8="Ici, os.listdir donne les noms dans l'ordre alphabétique.";
const ARB8={fn:"parcours"};
const isdir8=["nom seul au lieu du chemin","os.path.isdir(chemin)","os.path.isdir(nom)","os.listdir donne des noms seuls : os.path.isdir(nom) cherche le nom dans le dossier où tourne le script, pas dans le dossier visité, et les sous-dossiers sont pris pour des fichiers. Teste le chemin complet. Le corrigé officiel de 2025 fait cette erreur."];
const rec8=["appel récursif avec le nom seul","parcours(chemin)","parcours(nom)","L'appel récursif reçoit le chemin du sous-dossier, dossier + os.sep + nom : avec le nom seul, os.listdir ne le trouve pas."];
const pasrec8=["sous-dossiers pas visités","            parcours(chemin)","            pass","Pour un sous-dossier, la fonction se rappelle elle-même : c'est ce qui fait visiter tous les étages."];
const sep8=["os.sep oublié","dossier + os.sep + nom","dossier + nom","Sans os.sep, le chemin devient photosvacances au lieu de photos/vacances : il n'existe pas."];
const PY4=[
 ["extensions","compter les fichiers par extension",R=>{const E=R.mel(["jpg","png","txt","py","pdf","csv"]).slice(0,3),d=R.choix(["photos","rep","exos"]);
   const V=[0,1,2].map(()=>({A:[d],T:arboDe([{n:"notes.txt",c:""},dos7(d,foret8(R,E,[],2))])}));
   return {nom:"stats.py",dit:`parcourt récursivement (sans os.walk) le dossier passé en paramètre et tous ses sous-dossiers, crée un dictionnaire stats qui associe à chaque extension (ce qui suit le dernier point du nom) le nombre de fichiers qui l'ont, puis l'affiche`,
     vers:V,montre:["arbre"],note:NOTE8,
     pas:[["import os, sys","os pour listdir, sep et path ; sys pour le paramètre.",0.5],["stats = {}","Le dictionnaire, créé une fois, hors de la fonction.",0.5],
       ["def parcours(dossier):\n    for nom in os.listdir(dossier):","La fonction récursive visite un dossier ; os.listdir donne les noms qu'il contient.",1.5],
       ["        chemin = dossier + os.sep + nom","Le chemin complet : sans lui, on ne trouve pas le fichier depuis le dossier du script.",0.5],
       ["        if os.path.isdir(chemin):\n            parcours(chemin)","Un sous-dossier : la fonction se rappelle sur lui, un étage plus bas.",1],
       ['        else:\n            ext = nom.split(".")[-1]',"Un fichier : son extension est le dernier morceau après un point.",0.5],
       ["            if ext in stats:\n                stats[ext] += 1\n            else:\n                stats[ext] = 1","On compte.",1],["parcours(sys.argv[1])\nprint(stats)","L'appel de départ, puis l'affichage, une fois le parcours fini.",0.5]],
     alt:['import os, sys\nstats = {}\ndef parcours(dossier):\n    for nom in os.listdir(dossier):\n        chemin = os.path.join(dossier, nom)\n        if os.path.isfile(chemin):\n            ext = nom.split(".")[-1]\n            stats[ext] = stats.get(ext, 0) + 1\n        else:\n            parcours(chemin)\nparcours(sys.argv[1])\nprint(stats)'],
     mut:[isdir8,rec8,pasrec8,sep8,["clé pas encore créée","            if ext in stats:\n                stats[ext] += 1\n            else:\n                stats[ext] = 1","            stats[ext] += 1","La première fois, l'extension n'est pas une clé : stats[ext] += 1 donne KeyError. Teste d'abord if ext in stats."]]};}],
 ["images","statistiques d'images, comme en janvier 2026",R=>{const E=R.mel(["jpg","png","gif","webp"]).slice(0,3),csv=()=>[E.join(","),E.map(()=>R.ent(0,20)).join(",")];
   const V=[0,1,2].map(()=>({A:["photos"],T:arboDe([{n:"images.csv",c:lignes8(csv())},dos7("photos",foret8(R,E,["txt","pdf"],2))])}));
   return {nom:"images.py",dit:"lit le fichier images.csv du dossier courant (première ligne : des extensions ; deuxième ligne : le nombre d'images de chaque extension) dans un dictionnaire statistiques, puis parcourt avec une fonction récursive (sans os.walk) tous les sous-dossiers du dossier passé en paramètre, ajoute 1 à statistiques[ext] pour chaque fichier dont l'extension ext est une clé du dictionnaire, et affiche le dictionnaire",
     vers:V,montre:["images.csv","arbre"],note:NOTE8+" Les autres extensions (txt, pdf) ne comptent pas.",
     pas:[["import os, sys\nstatistiques = {}","Les modules et le dictionnaire.",0.5],['with open("images.csv") as fd:\n    lignes = fd.readlines()\n    images = lignes[0].strip().split(",")\n    nombres = lignes[1].strip().split(",")',"Les deux lignes du fichier, coupées aux virgules.",1],
       ["    for i in range(len(images)):\n        statistiques[images[i]] = int(nombres[i])","L'extension i va avec le nombre i, en entier.",1],
       ["def parcours(dossier):\n    for fichier in os.listdir(dossier):","La fonction récursive et la liste des noms du dossier.",1],
       ["        if os.path.isdir(dossier + os.sep + fichier):\n            parcours(dossier + os.sep + fichier)","Un sous-dossier : on le visite, avec son chemin complet.",1],
       ['        else:\n            data = fichier.split(".")\n            if len(data) > 1 and data[-1] in statistiques:\n                statistiques[data[-1]] += 1',"Un fichier : son extension est le dernier morceau ; on ne compte que les extensions du dictionnaire.",1],
       ["parcours(sys.argv[1])\nprint(statistiques)","L'appel de départ, puis l'affichage.",0.5]],
     alt:['import os, sys\nstatistiques = {}\nfd = open("images.csv")\nimages = fd.readline().strip().split(",")\nnombres = fd.readline().strip().split(",")\nfd.close()\nfor i in range(len(images)):\n    statistiques[images[i]] = int(nombres[i])\n\ndef parcours(dossier):\n    for fichier in os.listdir(dossier):\n        chemin = dossier + "/" + fichier\n        if os.path.isdir(chemin):\n            parcours(chemin)\n        elif fichier.split(".")[-1] in statistiques:\n            statistiques[fichier.split(".")[-1]] += 1\n\nparcours(sys.argv[1])\nprint(statistiques)'],
     mut:[["nom seul au lieu du chemin","os.path.isdir(dossier + os.sep + fichier)","os.path.isdir(fichier)",isdir8[3]],["int() oublié","int(nombres[i])","nombres[i]","Sans int(), la valeur est du texte, '10' : '10' + 1 n'a pas de sens pour Python."],
       ["extension pas dans le dictionnaire","if len(data) > 1 and data[-1] in statistiques:","if len(data) > 1:","Une extension qui n'est pas une clé (txt, pdf) donnerait KeyError : on ne compte que celles du dictionnaire."],
       ["appel récursif avec le nom seul","parcours(dossier + os.sep + fichier)","parcours(fichier)",rec8[3]]]};}],
 ["parcs","les parcs d'ordinateurs, comme en janvier 2025",R=>{const S=R.mel(["windows11","ubuntu-NobleNumbat","ubuntu-JammyJellyfish","debian12"]).slice(0,3);let k=1;
   const csv=()=>({n:"parc"+(k++)+".csv",c:lignes8(Array.from({length:R.ent(2,3)},()=>["PC"+R.ent(1,60),...R.mel(S).slice(0,R.ent(1,2))].join(",")))});
   const arbre=()=>{k=1;return [csv(),{n:"lisezmoi.txt",c:"rien\n"},dos7("salles",[csv(),dos7(R.choix(["b1","b2","rdc"]),[csv(),{n:"plan.pdf",c:""}])])];};
   const V=[0,1,2].map(()=>({A:["parcs"],T:arboDe([dos7("parcs",arbre())])}));
   return {nom:"systemes.py",dit:`crée un dictionnaire systemes, cherche récursivement (sans os.walk) tous les fichiers ${cr(".csv")} du dossier passé en paramètre et de ses sous-dossiers, et y range chaque système : la clé est le système, la valeur la liste des ordinateurs qui l'ont (sur chaque ligne d'un fichier csv : un ordinateur, puis ses systèmes, séparés par des virgules). Il affiche ensuite le dictionnaire`,
     vers:V,montre:["arbre"],note:NOTE8,
     pas:[["import os, sys\nsystemes = {}","Les modules et le dictionnaire.",0.5],["def parcours(rep):\n    for fichier in os.listdir(rep):","La fonction récursive ; os.listdir donne les noms.",1.5],
       ["        if os.path.isdir(rep + os.sep + fichier):\n            parcours(rep + os.sep + fichier)","Un sous-dossier : on le visite avec son chemin complet."],
       ['        elif fichier.endswith(".csv"):\n            fd = open(rep + os.sep + fichier)',"Un fichier csv : on l'ouvre, avec son chemin complet.",1],
       ['            for ligne in fd:\n                data = ligne.strip().split(",")\n                ordi = data[0]',"Chaque ligne, coupée aux virgules : le premier champ est l'ordinateur.",1.5],
       ["                for systeme in data[1:]:\n                    if systeme in systemes:\n                        systemes[systeme].append(ordi)\n                    else:\n                        systemes[systeme] = [ordi]","Les autres champs sont des systèmes : on ajoute l'ordinateur à leur liste.",1],
       ["            fd.close()\n\nparcours(sys.argv[1])\nprint(systemes)","On ferme le fichier ; l'appel de départ, puis l'affichage.",0.5]],
     alt:['import os, sys\nsystemes = {}\n\ndef parcours(rep):\n    liste = os.listdir(rep)\n    for fichier in liste:\n        chemin = os.path.join(rep, fichier)\n        if os.path.isdir(chemin):\n            parcours(chemin)\n        elif ".csv" in fichier:\n            with open(chemin) as fd:\n                for ligne in fd:\n                    data = ligne.strip().split(",")\n                    for systeme in data[1:]:\n                        if systeme not in systemes:\n                            systemes[systeme] = []\n                        systemes[systeme].append(data[0])\n\nparcours(sys.argv[1])\nprint(systemes)'],
     mut:[["fichier ouvert avec son nom seul","fd = open(rep + os.sep + fichier)","fd = open(fichier)","open(fichier) cherche le fichier dans le dossier où tourne le script : il faut le chemin complet, rep + os.sep + fichier."],
       ["nom seul au lieu du chemin","os.path.isdir(rep + os.sep + fichier)","os.path.isdir(fichier)",isdir8[3]],
       ["l'ordinateur pris pour un système","in data[1:]","in data","data[1:] saute le premier champ : l'ordinateur n'est pas un système."],
       ["liste remplacée au lieu d'agrandie","systemes[systeme].append(ordi)","systemes[systeme] = [ordi]","systemes[systeme] = [ordi] remplace la liste : il faut append(ordi) pour ajouter."]]};}],
 ["par_dossier","le nombre de fichiers de chaque dossier",R=>{const E=["txt","py","jpg","pdf"],d=R.choix(["rep","projet","docs"]);
   const V=[0,1,2].map(()=>({A:[d],T:arboDe([dos7(d,foret8(R,E,[],2))])}));
   return {nom:"compte.py",dit:"parcourt récursivement (sans os.walk) le dossier passé en paramètre et crée un dictionnaire nbFichiers : chaque dossier visité (son chemin, comme rep/td) en clé, le nombre de fichiers qu'il contient directement (sans compter ceux des sous-dossiers) en valeur, puis l'affiche",
     vers:V,montre:["arbre"],note:NOTE8+" Le dossier de départ est une clé, lui aussi.",
     pas:[["import os, sys\nnbFichiers = {}","Les modules et le dictionnaire.",0.5],["def parcours(dossier):\n    nbFichiers[dossier] = 0","Chaque dossier visité devient une clé, à 0 au départ : avant la boucle.",1.5],
       ["    for nom in os.listdir(dossier):\n        chemin = dossier + os.sep + nom","Les noms du dossier, et leur chemin complet.",1],
       ["        if os.path.isdir(chemin):\n            parcours(chemin)","Un sous-dossier : il aura sa propre clé.",1],["        else:\n            nbFichiers[dossier] += 1","Un fichier compte pour le dossier visité.",1],["parcours(sys.argv[1])\nprint(nbFichiers)","L'appel de départ, puis l'affichage.",0.5]],
     alt:['import os, sys\nnbFichiers = {}\n\ndef parcours(dossier):\n    n = 0\n    for nom in sorted(os.listdir(dossier)):\n        if os.path.isfile(os.path.join(dossier, nom)):\n            n += 1\n    nbFichiers[dossier] = n\n    for nom in sorted(os.listdir(dossier)):\n        if os.path.isdir(os.path.join(dossier, nom)):\n            parcours(os.path.join(dossier, nom))\n\nparcours(sys.argv[1])\nprint(nbFichiers)'],
     mut:[isdir8,rec8,sep8,["compteur remis à zéro au mauvais moment","    nbFichiers[dossier] = 0\n    for nom in os.listdir(dossier):","    for nom in os.listdir(dossier):\n        nbFichiers[dossier] = 0","nbFichiers[dossier] = 0 est dans la boucle : le compte repart de 0 à chaque nom. Il se met une fois, avant la boucle."]]};}],
 ["lister","afficher les chemins d'un type de fichiers",R=>{const e=R.choix(["py","txt","pdf"]),E=[e,e,R.choix(["jpg","csv","md"])],d=R.choix(["projet","code","rep1"]);
   const V=[0,1,2].map(()=>({A:[d],T:arboDe([dos7(d,foret8(R,E,["sh"],2))])}));
   return {nom:"liste.py",dit:`parcourt récursivement (sans os.walk) le dossier passé en paramètre et affiche le chemin (comme ${d}/td/a.${e}) de chaque fichier dont le nom finit par ${cr("."+e)}, un par ligne`,
     vers:V,montre:["arbre"],note:NOTE8+" Dans un dossier, les noms sont traités dans cet ordre, sous-dossiers compris.",
     pas:[["import os, sys","Les modules.",0.5],["def parcours(dossier):\n    for nom in os.listdir(dossier):","La fonction récursive ; os.listdir donne les noms.",1.5],["        chemin = dossier + os.sep + nom","Le chemin complet, à afficher et à tester.",0.5],
       ["        if os.path.isdir(chemin):\n            parcours(chemin)","Un sous-dossier : on le visite tout de suite, avant les noms qui suivent.",1],[`        elif nom.endswith(".${e}"):\n            print(chemin)`,`Un fichier ${e} : on affiche son chemin.`,1],["parcours(sys.argv[1])","L'appel de départ.",0.5]],
     alt:[`import os, sys\n\ndef parcours(dossier):\n    for nom in os.listdir(dossier):\n        chemin = os.path.join(dossier, nom)\n        if os.path.isfile(chemin) and nom.split(".")[-1] == "${e}":\n            print(chemin)\n        elif os.path.isdir(chemin):\n            parcours(chemin)\n\nparcours(sys.argv[1])`],
     mut:[["nom affiché au lieu du chemin","            print(chemin)","            print(nom)","L'énoncé demande le chemin : chemin, pas nom."],isdir8,rec8,pasrec8,sep8]};}],
 ["index","l'index des fichiers par extension",R=>{const E=R.mel(["sh","py","txt","java"]).slice(0,3),d=R.choix(["rep1","code","exos"]);
   const V=[0,1,2].map(()=>({A:[d],T:arboDe([dos7(d,foret8(R,E,[],2))])}));
   return {nom:"indexation.py",dit:`parcourt récursivement (sans os.walk) le dossier passé en paramètre, crée un dictionnaire index qui associe à chaque extension (avec son point, comme ${cr(".py")}) la liste des chemins des fichiers qui l'ont, dans l'ordre du parcours, puis l'affiche`,
     vers:V,montre:["arbre"],note:NOTE8,
     pas:[["import os, sys\nindex = {}","Les modules et le dictionnaire.",0.5],["def parcours(dossier):\n    for nom in os.listdir(dossier):\n        chemin = dossier + os.sep + nom","La fonction récursive, les noms, et leur chemin complet.",1.5],
       ["        if os.path.isdir(chemin):\n            parcours(chemin)","Un sous-dossier : on le visite.",1],['        else:\n            ext = "." + nom.split(".")[-1]',"L'extension, avec son point.",0.5],
       ["            if ext in index:\n                index[ext].append(chemin)\n            else:\n                index[ext] = [chemin]","Extension déjà vue : on ajoute le chemin à sa liste ; sinon on crée la liste.",1.5],["parcours(sys.argv[1])\nprint(index)","L'appel de départ, puis l'affichage.",0.5]],
     alt:['import os, sys\nindex = {}\n\ndef parcours(dossier):\n    for nom in os.listdir(dossier):\n        chemin = os.path.join(dossier, nom)\n        if os.path.isdir(chemin):\n            parcours(chemin)\n        else:\n            ext = os.path.splitext(nom)[1]\n            if ext not in index:\n                index[ext] = []\n            index[ext].append(chemin)\n\nparcours(sys.argv[1])\nprint(index)'],
     mut:[["liste remplacée au lieu d'agrandie","index[ext].append(chemin)","index[ext] = [chemin]","index[ext] = [chemin] remplace la liste : il faut append(chemin)."],["nom rangé au lieu du chemin","index[ext] = [chemin]","index[ext] = [nom]","L'énoncé demande les chemins : chemin, pas nom."],isdir8,sep8]};}],
 ["lignes","le total des lignes des fichiers texte",R=>{const d=R.choix(["notes","docs","textes"]),lig=()=>Array.from({length:R.ent(1,4)},(_,i)=>"ligne "+(i+1)).join("\n")+"\n";
   const fill=L=>L.map(x=>x.d?dos7(x.n,fill(x.d)):x.n.endsWith(".txt")?{n:x.n,c:lig()}:x);
   const V=[0,1,2].map(()=>({A:[d],T:arboDe([dos7(d,fill(foret8(R,["txt","txt","pdf"],["jpg"],2)))])}));
   return {nom:"total.py",dit:`parcourt récursivement (sans os.walk) le dossier passé en paramètre, compte les lignes de tous les fichiers ${cr(".txt")} rencontrés, et affiche à la fin ${cr("TOTAL :")} suivi du nombre total de lignes`,
     vers:V,montre:["arbre"],note:NOTE8+" Les fichiers texte de l'exemple ont chacun de 1 à 4 lignes.",
     pas:[["import os, sys\ntotal = 0","Les modules et le compteur, hors de la fonction.",0.5],["def parcours(dossier):\n    global total","La fonction modifie total, créé hors d'elle : global total, sinon Python le prend pour une variable de la fonction.",1.5],
       ["    for nom in os.listdir(dossier):\n        chemin = dossier + os.sep + nom","Les noms du dossier et leur chemin complet.",1],["        if os.path.isdir(chemin):\n            parcours(chemin)","Un sous-dossier : on le visite.",1],
       ['        elif nom.endswith(".txt"):\n            with open(chemin) as fd:\n                for ligne in fd:\n                    total += 1',"Un fichier texte : on compte ses lignes une par une.",1.5],['parcours(sys.argv[1])\nprint("TOTAL :", total)',"L'appel de départ, puis l'affichage.",0.5]],
     alt:['import os, sys\n\ndef parcours(dossier):\n    n = 0\n    for nom in os.listdir(dossier):\n        chemin = os.path.join(dossier, nom)\n        if os.path.isdir(chemin):\n            n += parcours(chemin)\n        elif nom.endswith(".txt"):\n            fd = open(chemin)\n            n += len(fd.readlines())\n            fd.close()\n    return n\n\nprint("TOTAL :", parcours(sys.argv[1]))'],
     mut:[["global oublié","    global total\n","","La fonction fait total += 1 : sans global total, Python prend total pour une variable de la fonction, pas encore créée (UnboundLocalError)."],
       ["fichier ouvert avec son nom seul","open(chemin)","open(nom)","open(nom) cherche le fichier dans le dossier où tourne le script : il faut le chemin complet."],isdir8,pasrec8]};}]
];
const PYP=[PY1,PY2,PY3,PY4];
function explique8(err,src){const m=err.m,t=err.t,L=src.split("\n"),l=err.l&&err.l<=L.length?L[err.l-1].trim():"";
  const nomDe=/'([^']+)'/.exec(m),n=nomDe?nomDe[1]:"";
  const fr=t==="SyntaxError"?(/print/.test(m)&&/parenthes/.test(m)?"En Python 3, print est une fonction : print(...), avec les parenthèses."
      :/'=='/.test(m)?"Dans un test, l'égalité s'écrit == ; un seul = sert à donner une valeur."
      :/expected ':'/.test(m)?"Il manque les deux-points à la fin de la ligne : un if, elif, else, for, while ou def se termine par :."
      :/never closed|unmatched/.test(m)?"Une parenthèse, un crochet ou une accolade n'est pas refermé, ou est fermé en trop."
      :/unterminated string/.test(m)?"Un guillemet n'est pas refermé."
      :/outside function/.test(m)?"return ne s'écrit que dans une fonction, sous un def."
      :/outside loop|not properly in loop/.test(m)?"break et continue ne s'écrivent que dans une boucle."
      :/invalid character/.test(m)?"Un caractère que Python ne connaît pas : un guillemet ou un tiret de traitement de texte, par exemple. Écris-le au clavier."
      :/cannot assign/.test(m)?"À gauche d'un =, il faut une variable : pour comparer, ==."
      :"Python ne comprend pas cette ligne : relis la ponctuation (deux-points, parenthèses, guillemets, virgules).")
    :t==="IndentationError"?(/expected an indented block/.test(m)?"Après une ligne qui finit par :, le bloc doit être décalé vers la droite (4 espaces)."
      :/unexpected indent/.test(m)?"Cette ligne est décalée alors qu'elle ne commence pas un bloc : aligne-la sur la ligne d'au-dessus."
      :"Ce retrait ne correspond à aucun bloc ouvert : aligne la ligne exactement sous le début du bloc.")
    :t==="NameError"?`Python ne connaît pas ${c(n)} : faute de frappe, variable pas encore créée, ou import oublié (import os, sys).`
    :t==="UnboundLocalError"?`La fonction modifie ${c(n)}, créé hors d'elle : écris global ${n} au début de la fonction (ou renvoie la valeur avec return).`
    :t==="KeyError"?`La clé ${c(m)} n'est pas (encore) dans le dictionnaire : pour compter, teste d'abord if cle in d, sinon d[cle] = 1.`
    :t==="IndexError"?"Un indice sort de la liste ou de la chaîne : les indices vont de 0 à len(...) - 1."
    :t==="TypeError"?(/concatenate|unsupported operand/.test(m)?"On ne mélange pas un texte et un nombre : int(...) pour calculer, str(...) pour coller."
      :/not supported between/.test(m)?"Python compare un texte et un nombre : ce qu'on lit dans un fichier est du texte, int(...) d'abord."
      :/not iterable/.test(m)?"Une boucle for parcourt une liste, une chaîne, un dictionnaire ou un fichier : pour compter, range(n)."
      :/not subscriptable/.test(m)?"On prend un indice sur une valeur qui n'est ni une liste, ni une chaîne, ni un dictionnaire."
      :/not callable/.test(m)?"Des parenthèses après une valeur qui n'est pas une fonction."
      :/positional argument|required/.test(m)?"La fonction n'est pas appelée avec le bon nombre de valeurs."
      :/indices must be integers/.test(m)?"Un indice de liste ou de chaîne est un entier : int(...) si tu l'as lu dans un fichier."
      :/expected str instance/.test(m)?"join ne recolle que des chaînes : str(...) sur les nombres d'abord."
      :"Une opération reçoit une valeur du mauvais type.")
    :t==="AttributeError"?(/'str' object has no attribute 'append'/.test(m)?"Une chaîne n'a pas de append : pour ajouter des éléments, la valeur doit être une liste, [x]."
      :`Ce type de valeur n'a pas de ${c(n.split("'").pop()||n)} : vérifie que c'est bien une liste, une chaîne ou un dictionnaire.`)
    :t==="ValueError"?(/invalid literal for int/.test(m)?"int() reçoit un texte qui n'est pas un nombre entier : un mot, un champ mal choisi, ou un morceau vide."
      :/unpack/.test(m)?"Le nombre de variables à gauche du = n'est pas le nombre de morceaux à droite."
      :/not in list/.test(m)?"La valeur cherchée n'est pas dans la liste.":"Une fonction reçoit une valeur qu'elle ne sait pas traiter.")
    :t==="ZeroDivisionError"?"Une division par 0 : une liste vide, ou un compteur resté à 0 ?"
    :t==="FileNotFoundError"?"Ce fichier ou ce dossier n'existe pas à cet endroit : os.listdir donne des noms seuls, il faut recoller le chemin, dossier + os.sep + nom."
    :t==="NotADirectoryError"?"os.listdir reçoit un fichier, pas un dossier : teste os.path.isdir avant de descendre."
    :t==="IsADirectoryError"?"open reçoit un dossier : teste os.path.isdir avant d'ouvrir."
    :t==="RecursionError"?"La fonction se rappelle sans fin : l'appel récursif doit recevoir le chemin du sous-dossier, pas le même dossier."
    :t==="EOFError"?"input() attend le clavier : ici, les valeurs viennent de sys.argv ou du fichier."
    :t==="ImportError"?"Ce nom n'existe pas dans ce module.":"";
  const ou=err.l&&err.l<=L.length?`À la ligne ${err.l}${l?` (${c(l)})`:""}, `:err.l>L.length?"Pendant l'appel du site, ":"";
  return esc(`${ou}Python s'arrête : `)+c(`${t}: ${m}`.slice(0,160))+". "+esc(fr);}
const normL8=x=>{let t=propre(x);if(/^[[{(]/.test(t))t=t.replace(/"/g,"'").replace(/\s*,\s*/g,", ").replace(/\s*:\s*/g,": ").replace(/([[{(])\s+/g,"$1").replace(/\s+([\]})])/g,"$1");return t;};
const SYMPY=[[],[[":",":"],["⇥","    "],["[]","[]"],["()","()"],["==","=="],["!=","!="],["+=","+="],["return","return "]],
  [[":",":"],["⇥","    "],["[]","[]"],["{}","{}"],["==","=="],["+=","+="],["sys.argv[1]","sys.argv[1]"],[".strip()",".strip()"],['.split(",")','.split(",")']],
  [[":",":"],["⇥","    "],["[]","[]"],["{}","{}"],["+=","+="],["os.listdir","os.listdir("],["os.sep","os.sep"],["isdir","os.path.isdir("],["sys.argv[1]","sys.argv[1]"]]];
function exoPy(R,p){const [,nat,f]=R.choix(PYP[p]),X=f(R);if(!X)return null;
  const lire=p===0,fonc=!!X.appels,nom=X.nom||"prog.py",ref=X.pas.map(x=>x[0]).join("\n");
  const vers=fonc?X.appels.map(a=>({A:[],T:arboDe([]),appel:a})):(X.vers||[{}]).map(v=>({A:v.A||[],T:v.T||arboDe([]),appel:null}));
  const prog=(src,v)=>v.appel?src+"\nprint(repr("+v.appel+"))":src;
  const joue=src=>vers.map(v=>lancePy(prog(src,v),v.T,v.A,nom)),vue=r=>{const o=vuePy(r).map(propre);return fonc&&!r.err?o.slice(-1):o;};
  const S=joue(ref),pb=S.find(s=>s.inconnu||s.boucle||s.err);if(pb)throw new Error("programme de référence refusé : "+ref+" → "+JSON.stringify(pb.err||pb.inconnu||"boucle"));
  const bon=S.map(vue),att=S[0].sortie;
  if(lire&&(!att.length||att.length>7))return null;
  if(!lire&&!fonc&&!att.length)return null;
  for(const a of X.alt||[]){const Sa=joue(a);if(!Sa.every((s,i)=>!s.inconnu&&!s.boucle&&pareil(vue(s),bon[i])))throw new Error("autre écriture fausse : "+a+" → "+JSON.stringify(Sa.map(s=>s.inconnu||vuePy(s))));}
  const mut=[];for(const [type,de,en,msg] of X.mut||[]){if(!ref.includes(de))continue;const src=ref.replace(de,en),Sm=joue(src);if(Sm.some(s=>s.inconnu||s.boucle))continue;const O=Sm.map(vue);
    if(lire?(Sm[0].err||pareil(O[0].map(normL8),bon[0].map(normL8))):O.every((o,i)=>pareil(o,bon[i])))continue;
    if(mut.some(m=>m.O.every((o,i)=>pareil(o,O[i]))))continue;
    const k=X.pas.findIndex(x=>x[0].includes(de.split("\n").find(s=>s.trim())||de));mut.push({type,src,O,Sm,msg,k:k<0?X.pas.length:k});}
  const fausse=mut[0];if(!fausse)return null;
  const ex=fonc?"":"python3 "+nom+(vers[0].A.length?" "+vers[0].A.join(" "):""),lance=v=>"python3 "+nom+(v.A.length?" "+v.A.join(" "):"");
  const arb=T=>blocr(dessin(noeud(T,COURANT),".")),fich=(T,x)=>blocr(contenu(noeud(T,absolu(x))).join("\n"));
  const montre8=(T,i)=>(X.montre||[]).map(x=>x==="arbre"?`<p>${i?"Ce":"Le"} dossier courant&nbsp;:</p>${arb(T)}`:`<p>${i?"Ce":"Le"} fichier ${cr(x)}&nbsp;:</p>${fich(T,x)}`).join("");
  const res=i=>S[i].sortie[S[i].sortie.length-1],nm=fonc?Math.min(X.montre||2,vers.length):0;
  const exemples=fonc?vers.slice(0,nm).map((v,i)=>`${cr(v.appel)} renvoie ${cr(res(i))}`).join(", et "):"";
  const q=lire?"Qu'affiche ce programme Python ?":fonc?`Écris une fonction Python ${cr(X.sig)} qui ${X.dit}.`:`Écris un script Python ${cr(nom)} qui ${X.dit}.`;
  const corps=lire?blocp(ref):fonc?`<p>Par exemple, ${exemples}.</p>`
    :montre8(vers[0].T,0)+`<p>Par exemple, ${cr(ex)} affiche&nbsp;:</p>${pave(att)}${X.note?`<p>${esc(X.note)}</p>`:""}`;
  const E=[...X.pas.map(([code,why,pts])=>({w:blocp(code),why:esc(why),pts:pts===undefined?1:pts})),lire
    ?{w:`<b>Le programme affiche</b>&nbsp;:${pave(att)}`,why:"Les lignes se font dans l'ordre, de haut en bas ; une boucle refait son bloc à chaque tour, une fonction ne fait rien tant qu'on ne l'appelle pas.",pts:1}
    :{w:`${fonc?"La fonction entière":"Le script entier"}&nbsp;:${blocp(ref)}`,why:`${fonc?`Par exemple, ${exemples}.`:`${cr(ex)} affiche&nbsp;: ${montre(att)}`}${X.alt&&X.alt.length?` On peut aussi écrire&nbsp;:${blocp(X.alt[0])}`:""}`,pts:0.5}];
  const fin=E.length-1,faux=(ch,resume)=>(etape,type,titre,msg)=>({ok:false,faux:[ch],resume,diag:etape==null?{type,titre:esc(titre),msg}:{etape,type,titre:esc(titre),msg}});
  const ecart=(St,i,t)=>{const s=St[i],v=vers[i],apres=i>=nm&&St.slice(0,nm).every((x,k)=>pareil(vue(x),bon[k]));
    if(fonc){const tete=apres?"Avec les exemples de l'énoncé, ta fonction tombe juste. Mais ":"";
      if(s.err)return `${tete}${tete?"a":"A"}vec ${cr(v.appel)}&nbsp;: ${explique8(s.err,t)}`;
      const plus=s.sortie.slice(0,-1);
      return `${tete}${cr(v.appel)} doit renvoyer ${cr(res(i))} ; ta fonction renvoie ${cr(s.sortie[s.sortie.length-1]||"None")}.${plus.length?` Elle affiche aussi&nbsp;: ${pave(plus)}`:""}`;}
    const ici=`${cr(lance(v))}${i?`, avec ${(X.montre||[]).map(x=>x==="arbre"?"ce dossier":"ce fichier "+cr(x)).join(" et ")||"ces paramètres"}&nbsp;: ${montre8(v.T,1)}`:""}`;
    return `${i?`Avec l'exemple de l'énoncé, ton script tombe juste. Mais avec ${ici}`:`Avec ${ici}`}${i?"":","} il affiche&nbsp;: ${pave(s.sortie)}${s.err?` puis ${explique8(s.err,t)}`:""} Il fallait&nbsp;: ${pave(S[i].sortie)}`;};
  const plat=s=>s.replace(/\s+/g," ").trim();
  const juge=lire?rep=>{const L0=String(rep.s==null?"":rep.s).split("\n").map(normL8).filter(Boolean),attN=att.map(normL8),non=faux("s","Pas tout à fait : ce n'est pas ce que le programme affiche.");
      if(!L0.length)return {incomplet:"Écris ce que le programme affiche, ligne par ligne."};
      if(pareil(L0,attN))return {ok:true};
      const m=mut.find(m=>pareil(L0,m.O[0].map(normL8)));if(m)return non(m.k,m.type,"Où ça part : "+m.type+".",esc(m.msg));
      if(pareil(L0.slice().sort(),attN.slice().sort()))return non(fin,"lignes dans le mauvais ordre","Où ça part : l'ordre des lignes.","Ce sont les bonnes lignes, mais pas dans le bon ordre : le programme se lit de haut en bas, et une boucle fait ses tours dans l'ordre.");
      const j=L0.findIndex((x,k)=>x!==attN[k]);
      return non(fin,"affichage différent","Où ça part : ce que le programme affiche.",`${j===1?"Ta première ligne est juste. ":j>1?`Tes ${j} premières lignes sont justes. `:""}Reprends le programme ligne par ligne, en notant la valeur de chaque variable : la correction le fait pas à pas.`);}
    :rep=>{const t=norm7(rep.c).replace(/\s+$/,""),non=faux("c",`Pas tout à fait : ${fonc?"cette fonction":"ce script"} ne fait pas ce que demande l'énoncé.`);
      if(!t.trim())return {incomplet:fonc?"Écris la fonction.":"Écris le script."};
      const sansNote=t.replace(/#.*$/gm,"");for(const [re,m] of X.sans||[])if(re.test(sansNote))return {incomplet:m};
      const St=joue(t),inc=St.find(s=>s.inconnu);if(inc)return {incomplet:esc(inc.inconnu)};
      if(St.some(s=>s.boucle))return non(null,"programme qui ne s'arrête pas","Où ça part : ton programme ne s'arrête pas.",`Après ${PAS8} instructions, il tourne encore : une boucle while dont la condition reste vraie, ou une fonction qui se rappelle sans fin.`);
      if(St[0].syntaxe)return non(null,"erreur de syntaxe","Où ça part : Python ne peut pas lire ton programme.",explique8(St[0].err,t));
      if(fonc){const nf=St.find(s=>s.err&&s.err.t==="NameError"&&s.err.m===`name '${X.fn}' is not defined`);if(nf)return {incomplet:`Le site appelle ta fonction ${cr(X.fn)} : écris-la avec ${cr("def "+X.sig+":")}.`};}
      const O=St.map(vue);if(O.every((o,i)=>pareil(o,bon[i])))return {ok:true};
      const i=O.findIndex((o,k)=>!pareil(o,bon[k])),C=mut.filter(m=>m.O.every((o,k)=>pareil(o,O[k]))),m=C.find(m=>plat(m.src)===plat(t))||C[0];
      if(m)return non(m.k,m.type,"Où ça part : "+m.type+".",`${esc(m.msg)} ${ecart(St,i,t)}`);
      if(St[i].err)return non(null,"erreur à l'exécution","Où ça part : Python s'arrête sur une erreur.",ecart(St,i,t));
      if(fonc&&St.every(s=>s.sortie[s.sortie.length-1]==="None"))return non(fin,"rien n'est renvoyé","Où ça part : ta fonction ne renvoie rien.",`Ta fonction renvoie None : il manque return (print affiche une valeur, mais ne la renvoie pas à celui qui appelle la fonction). ${ecart(St,i,t)}`);
      return non(fin,"résultat différent",`Où ça part : ce que fait ${fonc?"ta fonction":"ton script"}.`,ecart(St,i,t));};
  const cas=(v,src,a)=>{const r=lancePy(prog(src,v),v.T,v.A,nom);return r.inconnu||r.boucle?null:{arbo:v.T,cmd:prog(src,v),args:v.A,nom,py:true,abs:a||vuePy(r)};};
  const prem=m=>vers[Math.max(0,m.O.findIndex((o,i)=>!pareil(o,bon[i])))];
  const bash=[...vers.map(v=>cas(v,ref)),...(X.alt||[]).flatMap(a=>(fonc?vers:[vers[0]]).map(v=>cas(v,a))),...mut.map(m=>cas(prem(m),m.src)),
    ...(X.oracle?vers.map((v,i)=>cas(v,X.oracle,vuePy(S[i]))):[]),...[0,1].map(()=>cas({A:["x"],T:ARBO8},R.choix(BANC8)))].filter(Boolean);
  const exTxt=fonc?vers.slice(0,nm).map((v,i)=>v.appel+" → "+res(i)).join(" ; "):"";
  return {sig:lire?"Y0"+ref:"Y"+p+brut(q)+"|"+(fonc?exTxt:ex+"|"+(X.montre||[]).map(x=>x==="arbre"?etat7(vers[0].T).join(","):contenu(noeud(vers[0].T,absolu(x))).join(",")).join("|")),
    q,corps,texte:brut(q)+" — "+(lire?ref.replace(/\n/g," ⏎ "):fonc?exTxt:ex),
    champs:lire?[{k:"code",id:"s",nom:"affichage",label:"Ce que le programme affiche, ligne par ligne&nbsp;:",lignes:Math.max(3,att.length+1)}]
      :[{k:"code",id:"c",nom:fonc?"fonction":"script",label:fonc?`La fonction ${cr(X.fn)}&nbsp;:`:`Le script ${cr(nom)}&nbsp;:`,lignes:Math.max(6,ref.split("\n").length+2),ex:fonc?`def ${X.sig}:`:ref.split("\n")[0],sym:SYMPY[p],
        aide:`${fonc?"Ta fonction est appelée avec les exemples de l'énoncé, puis avec d'autres valeurs.":`Ton script est lancé avec l'exemple de l'énoncé, puis avec d'autres ${(X.montre||[]).includes("arbre")?"dossiers":"fichiers"}.`} Le retrait (les espaces en début de ligne) fait les blocs : ⇥ ajoute 4 espaces.`}],
    juge,etapes:E,bonne:lire?pave(att):blocp(ref),bonneTxt:lire?att.join(" ⏎ "):ref.replace(/\n/g," ⏎ "),repBonne:lire?{s:att.join("\n")}:{c:ref},repFausse:lire?{s:fausse.Sm[0].sortie.join("\n")}:{c:fausse.src},nature:nat,
    ens:{lire,fonc,fn:X.fn,nom,ref,alt:X.alt||[],pieges:mut.map(m=>({type:m.type,src:m.src,sortie:m.O[0]})),bash}};}
const tirePy=p=>R=>{for(;;){const e=exoPy(R,p);if(e)return e;}};


/* ---------- US1 : les droits. Un mode tient sur 9 bits (rwx du propriétaire, du groupe, des autres) ; un petit chmod, le umask, et la règle d'accès du noyau ---------- */
const let1=m=>[..."rwxrwxrwx"].map((ch,i)=>m&(256>>i)?ch:"-").join("");
const oct1=m=>[6,3,0].map(s=>(m>>s)&7).join("");
const paq1=(m,k)=>(m>>(6-3*k))&7;
const deP1=(a,b,d)=>(a<<6)|(b<<3)|d;
const CAT1=["le propriétaire","le groupe","les autres"],DU1=["du propriétaire","du groupe","des autres"],VAL1=[4,2,1];
const trip1=d=>"rwx".split("").map((l,i)=>d&VAL1[i]?l:"-").join("");
const dec1=d=>{const P=VAL1.filter(v=>d&v);return P.length>1?`${d} = ${P.join(" + ")}`:String(d);};
const bits1=m=>oct1(m).split("").map(d=>(+d).toString(2).padStart(3,"0")).join(" ");
const parPaq1=(m,f)=>deP1(f(paq1(m,0)),f(paq1(m,1)),f(paq1(m,2)));
const envers1=m=>parPaq1(m,d=>((d&1)<<2)|(d&2)|((d&4)>>2));
const ordre1=m=>deP1(paq1(m,2),paq1(m,1),paq1(m,0));
const compte1=m=>parPaq1(m,d=>(d&4?1:0)+(d&2?1:0)+(d&1?1:0));
const lsl1=(R,m,dir,p,g,nom)=>`${dir?"d":"-"}${let1(m)} ${dir?2:1} ${p} ${g} ${dir?4096:R.ent(80,4000)} nov. ${R.ent(10,19)} ${String(R.ent(8,18)).padStart(2,"0")}:${String(R.ent(0,59)).padStart(2,"0")} ${nom}`;
const NOMS1=["rapport.txt","notes.txt","script.sh","tp1.py","photo.jpg","main.c","data.csv","lsarg.sh","compte.py"];
const SYMD1=[["r","r"],["w","w"],["x","x"],["-","-"]],SYMC1=[["chmod","chmod "],["u","u"],["g","g"],["o","o"],["a","a"],["+","+"],["-","-"],["=","="],["r","r"],["w","w"],["x","x"],[",",","]];
/* un paquet au hasard, parmi ceux qu'on rencontre : rwx, r-x, rw-, r--, --- surtout */
const tirePaq1=(R,dir)=>R.choix(dir?[7,7,5,5,1,0,0,3,6,4]:[6,6,4,4,0,0,7,5,2]);
const tireMode1=(R,dir)=>{for(;;){const m=deP1(R.choix(dir?[7,7,5,3]:[6,6,7,4]),tirePaq1(R,dir),tirePaq1(R,dir));if(paq1(m,1)!==paq1(m,2)||R()<0.25)return m;}};

/* ce que tape l'étudiant : des droits en lettres (rw-r-----, avec ou sans le type) ou en octal (640) */
function lisDr1(s,veut){s=propre(s).replace(/\s/g,"");if(!s)return {vide:1};
  if(/^0?[0-7]{3}$/.test(s))return veut==="let"?{err:"Écris les droits en lettres, comme ls -l : neuf caractères, par exemple rw-r--r--."}:{m:parseInt(s.slice(-3),8)};
  if(/^[0-7]+$/.test(s))return {err:"En octal, il faut trois chiffres : un pour le propriétaire, un pour le groupe, un pour les autres."};
  const t=s.length===10?s.replace(/^[-d]/,""):s;
  if(/^[rwx-]+$/.test(t)){if(veut==="oct")return {err:"Ici, écris le nombre en octal : trois chiffres, par exemple 640."};
    if(t.length!==9)return {err:`Il faut neuf caractères (tu en as écrit ${t.length}) : trois pour le propriétaire, trois pour le groupe, trois pour les autres, avec - pour un droit absent.`};
    for(let i=0;i<9;i++)if(t[i]!=="-"&&t[i]!=="rwx"[i%3])return {err:`Dans chaque paquet de trois, l'ordre est toujours r, w, x, avec - pour un droit absent : ${esc(t.slice(i-i%3,i-i%3+3))} n'est pas dans cet ordre.`};
    let m=0;for(let i=0;i<9;i++)if(t[i]!=="-")m|=256>>i;return {m};}
  return {err:"Écris les droits en lettres (comme rw-r-----) ou en octal (comme 640)."};}

/* le petit chmod : rend {m} ou {err}. um est le umask : il compte quand le mode ne dit ni u, ni g, ni o, ni a.
   lu : une lecture fausse, pour reconnaître une erreur (o pris pour le propriétaire, = lu comme +, + lu comme =, a lu comme les autres, octal ajouté) */
function chmod1(m,arg,um,lu){lu=lu||{};
  if(/^[0-7]+$/.test(arg)){if(arg.length>4||arg.length===4&&arg[0]!=="0")return {err:"Avec quatre chiffres, le premier règle des droits spéciaux, hors programme : écris trois chiffres."};const v=parseInt(arg,8);return {m:lu.ajoute?m|v:v};}
  let r=m;
  for(const cl of arg.split(",")){const M=/^([ugoa]*)((?:[-+=][rwx]*)+)$/.exec(cl);
    if(!M){const S=/^[ugoa]*[-+=][rwx]*([^rwx,])/.exec(cl);return {err:S?`Ici, seulement r, w et x après le signe : chmod ne comprend pas ${c(S[1])} dans ${c(cl)}.`:`chmod ne comprend pas ${c(cl||",")} : écris par exemple u+x, go-w, a=r ou 750.`};}
    let qui=M[1];if(lu.o_u)qui=qui.replace(/o/g,"u");if(lu.a_o)qui=qui.replace(/a/g,"o");
    let aff=!qui||qui.includes("a")?0o777:0;for(const ch of qui)aff|={u:0o700,g:0o070,o:0o007}[ch]||0;
    const filtre=!qui&&!lu.sansMasque?0o777&~um:aff;
    for(const op of M[2].match(/[-+=][rwx]*/g)){let p=0;for(const ch of op.slice(1))p|={r:0o444,w:0o222,x:0o111}[ch];
      let o=op[0];if(lu.egalPlus&&o==="=")o="+";if(lu.plusEgal&&o==="+")o="=";
      if(o==="+")r|=p&filtre;else if(o==="-")r&=~(p&filtre);else r=(r&~aff)|(p&filtre);}}
  return {m:r};}
/* une ligne « chmod MODE fichier… » */
function ligneChmod1(l){const W=propre(l).split(" ").filter(Boolean);if(!W.length)return {vide:1};
  if(W[0]!=="chmod")return {err:W[0]==="umask"?"umask règle seulement les fichiers créés ensuite : pour changer les droits d'un fichier qui existe, c'est chmod.":"La commande doit commencer par chmod."};
  if(W[1]&&/^-/.test(W[1])&&!/^-[rwx]+$/.test(W[1]))return {err:`Ici, pas besoin d'option comme ${esc(W[1])} : chmod, le mode, puis le nom du fichier.`};
  if(W.length<3)return {err:"Il manque quelque chose : chmod, puis le mode, puis le nom du fichier (par exemple chmod u+x script.sh)."};
  return {mode:W[1],cibles:W.slice(2)};}
/* la commande la plus courte en lettres pour passer de a à b : u+x,go-w ou u=rw */
function sym1(a,b){const P=[0,1,2].map(k=>{const x=paq1(a,k),y=paq1(b,k),aj=y&~x,re=x&~y,l=d=>trip1(d).replace(/-/g,"");return x===y?"":aj&&re?"="+l(y):aj?"+"+l(aj):"-"+l(re);});
  const G=[];P.forEach((p,k)=>{if(!p)return;const g=G.find(x=>x.p===p);if(g)g.q+="ugo"[k];else G.push({p,q:"ugo"[k]});});
  return G.map(x=>(x.q==="ugo"?"a":x.q)+x.p).join(",");}
const quiTxt1=q=>!q?"tout le monde, sauf ce que bloque le umask (sans lettre devant le signe)":q.includes("a")?"tout le monde":et([...new Set(q)].map(ch=>({u:"le propriétaire",g:"le groupe",o:"les autres"})[ch]));
function clauses1(m,arg,um){if(/^[0-7]+$/.test(arg)){const v=parseInt(arg,8);return [{w:`${c(arg)} : ${[0,1,2].map(k=>`${dec1(paq1(v,k))} → ${c(trip1(paq1(v,k)))}`).join(", ")}, donc ${c(let1(v))}`,why:"Avec des chiffres, chmod remplace les neuf droits d'un coup : les anciens ne comptent plus."}];}
  const L=[];let r=m;for(const cl of arg.split(",")){const M=/^([ugoa]*)(.*)$/.exec(cl);r=chmod1(r,cl,um).m;
    const ops=M[2].match(/[-+=][rwx]*/g).map(op=>{const p=op.slice(1).split("").join(", ");return op[0]==="+"?`ajoute ${p}`:op[0]==="-"?`retire ${p}`:p?`met exactement ${p} (et retire les autres droits)`:"retire tous les droits";});
    L.push({w:`${c(cl)} : pour ${quiTxt1(M[1])}, ${et(ops)}. On obtient ${c(let1(r))}.`,why:!M[1]?`Sans u, g, o ni a, chmod vise tout le monde mais laisse de côté les droits que le umask (ici ${oct1(um)}) retirerait.`:M[2].includes("=")?`${c("=")} remplace les droits de la catégorie ; ${c("+")} et ${c("-")} ne touchent qu'aux droits cités.`:"Les autres droits ne bougent pas."});}
  return L;}

/* juge des droits tapés : P = [[type, mode faux, message]], le premier qui colle donne le diagnostic ; sinon, le premier paquet faux */
function jugeDr1(s,veut,att,P,id,etape,quoi){const r=lisDr1(s,veut);if(r.vide)return {incomplet:"Écris les droits."};if(r.err)return {incomplet:r.err};
  if(r.m===att)return {ok:true};
  const non=(type,titre,msg)=>({ok:false,faux:[id],resume:`Pas tout à fait : ce ne sont pas ${quoi||"les bons droits"}.`,diag:{etape,type,titre,msg}});
  for(const [type,m,msg] of P)if(m!==att&&m===r.m)return non(type,"Où ça part : la règle.",msg);
  const k=[0,1,2].find(k=>paq1(r.m,k)!==paq1(att,k));
  return non("paquet faux","Où ça part : un paquet de trois droits.",`Pour ${CAT1[k]}, c'est ${c(trip1(paq1(att,k)))}, pas ${c(trip1(paq1(r.m,k)))}.`);}
const MSG1={
  envers:`On compte r = 4, w = 2, x = 1 (r vaut le plus, x le moins) : tu as pris r et x à l'envers.`,
  ordre:`L'ordre est toujours le même : d'abord le propriétaire, puis le groupe, puis les autres. Tu as lu les paquets à l'envers.`,
  compte:`Un chiffre n'est pas le nombre de droits : c'est la somme de leurs valeurs, r = 4, w = 2, x = 1. Ainsi r-- vaut 4, pas 1.`,
  o_u:`${c("o")} veut dire les autres (others), pas le propriétaire (owner) : le propriétaire, c'est ${c("u")} (user).`,
  egalPlus:`${c("=")} met exactement les droits cités et retire les autres. Pour ajouter sans rien retirer, c'est ${c("+")}.`,
  plusEgal:`${c("+")} ajoute les droits cités et garde ceux qui y étaient déjà ; c'est ${c("=")} qui remplace.`,
  a_o:`${c("a")} veut dire tout le monde (all) : le propriétaire, le groupe et les autres. Les autres seuls, c'est ${c("o")}.`,
  ajoute:"Avec des chiffres, chmod remplace les neuf droits : les anciens ne comptent plus.",
  sansMasque:`Sans u, g, o ni a devant le signe, chmod laisse de côté les droits que le umask retirerait. Pour viser vraiment tout le monde, écris ${c("a")} devant.`};
const LU1=[["o lu comme le propriétaire","o_u"],["= lu comme +","egalPlus"],["+ lu comme =","plusEgal"],["a lu comme les autres","a_o"],["octal ajouté aux anciens droits","ajoute"],["umask oublié","sansMasque"]];
const vraiCh1=(cmds,att)=>({arbo:arboDe([]),cmd:"umask 022\n"+cmds.join("\n"),args:[],nom:"./droits.sh",script:true,brut:true,ordre:true,abs:att});

/* palier 1 : lire les droits */
function exoDr0(R){const f=R.choix([0,0,1,1,2,2,2]),nom=R.choix(NOMS1);
  if(f<2){const m=tireMode1(R,R()<0.3),o=oct1(m),L=let1(m),lire=f===0;
    const P=[["r et x échangés",envers1(m),MSG1.envers],["catégories dans le désordre",ordre1(m),MSG1.ordre],...(lire?[]:[["nombre de lettres au lieu de la somme",compte1(m),MSG1.compte]])];
    const juge=rep=>jugeDr1(rep.d,lire?"let":"oct",m,P,"d",lire?1:1),faux=P.map(x=>x[1]).find(x=>x!==m);if(faux===undefined)return null;
    const E=[{w:`Un paquet par catégorie, dans l'ordre : le propriétaire, le groupe, les autres. ${lire?`${c(o)} se lit ${o.split("").map(c).join(" · ")}`:`${c(L)} se coupe en ${[0,1,2].map(k=>c(trip1(paq1(m,k)))).join(" · ")}`}.`,why:"chmod et ls -l rangent toujours les droits dans cet ordre.",pts:1},
      {w:[0,1,2].map(k=>`${CAT1[k]} : ${lire?`${dec1(paq1(m,k))} → ${c(trip1(paq1(m,k)))}`:`${c(trip1(paq1(m,k)))} → ${dec1(paq1(m,k))}`}`).join("<br>"),why:"r = 4, w = 2, x = 1 : chaque chiffre de 0 à 7 s'écrit d'une seule façon comme somme de ces valeurs.",pts:1.5},
      {w:`<b>${lire?c(L):c(o)}</b>`,why:lire?`C'est ce qu'affiche ${c("ls -l")} après le type : ${c("-"+L)}.`:`La commande : ${c("chmod "+o+" "+nom)}.`,pts:0.5}];
    return {sig:"D0"+f+o,q:lire?`Quels droits donne la commande ${c("chmod "+o+" "+nom)} ? Écris-les en lettres, comme ${c("ls -l")} les affiche : neuf caractères, sans le type.`:`Écris en octal les droits ${c(L)} : le nombre à donner à chmod.`,corps:"",texte:lire?`chmod ${o} ${nom} : les droits en lettres ?`:`${L} en octal ?`,
      champs:[{k:"champ",id:"d",nom:"droits",label:lire?"Les droits :":"En octal :",ex:lire?"par exemple rw-r--r--":"par exemple 644",apercu:false,sym:lire?SYMD1:[]}],juge,etapes:E,bonne:c(lire?L:o),bonneTxt:lire?L:o,repBonne:{d:lire?L:o},repFausse:{d:lire?let1(faux):oct1(faux)},nature:lire?"octal vers lettres":"lettres vers octal",
      ens:{fam:lire?"lire":"octal",m,pieges:P.filter(x=>x[1]!==m).map(x=>({type:x[0],d:lire?let1(x[1]):oct1(x[1])})),bash:[vraiCh1([`touch ${nom}`,`chmod ${o} ${nom}`,`stat -c %A ${nom}`],["-"+L])]}};}
  /* une ligne de ls -l et une personne : quels droits a-t-elle ? */
  const dir=R()<0.4,obj=dir?R.choix(["tp","photos","partage","src"]):nom,m=tireMode1(R,dir),grp=R.choix(["etu","l1info","prof"]),qui=R.choix([0,1,1,2,2]);
  const P0=R.choix(["bob","alice","nora"]),nomQ=qui===0?P0:R.choix(["marie","lucas","yanis","emma"].filter(x=>x!==P0)),autreG=R.choix(["staff","l2info","invite"].filter(x=>x!==grp));
  const G=qui===2?[autreG]:qui===1?(R()<0.5?[grp]:[autreG,grp]):[grp],uid=R.ent(1001,1009);
  const idl=`uid=${uid}(${nomQ}) gid=${uid}(${G[0]}) groupes=${G.map((g,i)=>(i?uid+20+i:uid)+"("+g+")").join(",")}`,lsl=lsl1(R,m,dir,P0,grp,obj);
  const att=paq1(m,qui),U=paq1(m,0)|paq1(m,1)|paq1(m,2);
  const P=[["droits de toutes les catégories ajoutés",U,`Une seule catégorie compte pour ${nomQ} : ${qui===0?"le propriétaire":qui===1?"le groupe":"les autres"}. Le système ne cumule jamais les droits de plusieurs catégories.`],
    ...(qui!==0?[["paquet du propriétaire",paq1(m,0),`${nomQ} n'est pas le propriétaire (c'est ${P0}) : le premier paquet n'est pas le sien.`]]:[]),
    ...(qui===1?[["paquet des autres pour un membre du groupe",paq1(m,2),`${nomQ} fait partie du groupe ${grp} (voir ${c("groupes=")}) : c'est le paquet du groupe qui compte, pas celui des autres.`]]:[]),
    ...(qui===0?[["paquet du groupe pour le propriétaire",paq1(m,1),`${nomQ} est le propriétaire : seul le premier paquet compte, même en faisant aussi partie du groupe ${grp}.`]]:[]),
    ...(qui===2?[["paquet du groupe pour un autre",paq1(m,1),`${nomQ} ne fait pas partie du groupe ${grp} : c'est le dernier paquet, celui des autres, qui compte.`]]:[])];
  if(!P.some(x=>x[1]!==att))return null;
  const O=dir?[["r","r : lister les noms (ls)"],["w","w : créer, supprimer, renommer des entrées"],["x","x : traverser (cd, atteindre un fichier dedans)"],["0","aucun droit"]]:[["r","r : lire le contenu"],["w","w : modifier le contenu"],["x","x : l'exécuter"],["0","aucun droit"]];
  const vers=d=>d?"rwx".split("").filter((l,i)=>d&VAL1[i]):["0"],dir1=d=>d?et(O.filter(o=>vers(d).includes(o[0])).map(o=>o[1].replace(/^. : /,""))):"rien";
  function juge(rep){const S=(rep.g||[]).map(String);if(!S.length)return {incomplet:"Coche les droits (ou « aucun droit »)."};
    const d=S.includes("0")?0:S.reduce((a,x)=>a|({r:4,w:2,x:1}[x]||0),0);if(d===att)return {ok:true};
    const non=(type,titre,msg)=>({ok:false,faux:["g"],resume:`Pas tout à fait : ce ne sont pas les droits de ${nomQ}.`,diag:{etape:0,type,titre,msg}});
    for(const [type,v,msg] of P)if(v!==att&&v===d)return non(type,"Où ça part : la catégorie.",msg);
    return non("paquet mal lu","Où ça part : la lecture du paquet.",`Le paquet ${qui===0?"du propriétaire":qui===1?"du groupe":"des autres"} est ${c(trip1(att))} : ${nomQ} a ${att?"le droit "+vers(att).join(", "):"aucun droit"}.`);}
  const E=[{w:qui===0?`${nomQ} est le propriétaire (troisième colonne) : c'est le premier paquet, ${c(trip1(att))}.`:qui===1?`${nomQ} n'est pas le propriétaire (c'est ${P0}), mais fait partie du groupe ${grp} (quatrième colonne) : c'est le deuxième paquet, ${c(trip1(att))}.`:`${nomQ} n'est pas le propriétaire (c'est ${P0}) et ne fait pas partie du groupe ${grp} : c'est le troisième paquet, celui des autres, ${c(trip1(att))}.`,
      why:"Le système prend une seule catégorie : le propriétaire si c'est lui, sinon le groupe s'il en fait partie, sinon les autres. Les droits des autres catégories ne comptent pas, même s'ils sont plus larges.",pts:1.5},
    {w:`${c(trip1(att))}${dir?" sur un répertoire":" sur un fichier"} : ${dir1(att)}.`,why:dir?"Sur un répertoire, r permet de lister les noms, w de changer la liste (créer, supprimer, renommer, avec x en plus), x de le traverser.":"Sur un fichier, r permet de lire le contenu, w de le modifier, x de l'exécuter.",pts:1},
    {w:`<b>${att?vers(att).join(", "):"aucun droit"}</b>`,why:`Le type ${c(dir?"d":"-")} en tête de la ligne dit ${dir?"répertoire":"fichier ordinaire"}.`,pts:0.5}];
  const faux=P.map(x=>x[1]).find(x=>x!==att);
  return {sig:"D02"+oct1(m)+dir+P0+grp+nomQ+G.join(),q:`Voici une ligne affichée par ${c("ls -l")}, puis ce qu'affiche ${c("id "+nomQ)}. Quels droits a ${nomQ} sur ${dir?"le répertoire":"le fichier"} ${c(obj)} ?`,corps:bloc(lsl+"\n"+idl),texte:lsl+" | "+idl,
    champs:[{k:"multi",id:"g",o:O,seul:"0"}],juge,etapes:E,bonne:att?vers(att).join(", "):"aucun droit",bonneTxt:att?vers(att).join(""):"aucun",repBonne:{g:vers(att)},repFausse:{g:vers(faux)},nature:"ls -l et catégorie",
    ens:{fam:"ls",m,dir,proprio:P0,grp,qui:nomQ,G,att,pieges:P.filter(x=>x[1]!==att).map(x=>({type:x[0],g:vers(x[1])}))}};}

/* palier 2 : chmod */
const BUT1=[["u+x","ajoute le droit d'exécution au propriétaire"],["go-w","retire le droit d'écriture au groupe et aux autres"],["o-rwx","retire tous les droits aux autres"],["a+r","donne le droit de lecture à tout le monde"],
  ["g+w","donne au groupe le droit de modifier le fichier"],["a-x","retire le droit d'exécution à tout le monde"],["u-w","retire au propriétaire le droit d'écriture (pour ne pas modifier le fichier par erreur)"],["g-rwx","retire tous les droits au groupe"],
  ["ug+x","ajoute le droit d'exécution au propriétaire et au groupe"],["o+r","donne aux autres le droit de lecture"],["g=r","fait que le groupe puisse seulement lire le fichier"],["go=","retire tous les droits au groupe et aux autres"],["a+x","rend le fichier exécutable par tout le monde"],["o-w","retire aux autres le droit de modifier le fichier"]];
function tireSym1(R){const n=R()<0.35?2:1,L=[];
  if(R()<0.08)return "+x";
  for(let i=0;i<n;i++){const qui=R.choix(["u","g","o","o","a","ug","go","go","uo"]),op=R.choix(["+","-","=","+","-"]);
    const p=R.mel(["r","w","x"]).slice(0,R.ent(op==="="?0:1,op==="="?3:2)).sort((a,b)=>"rwx".indexOf(a)-"rwx".indexOf(b)).join("");L.push(qui+op+p);}
  return L.join(",");}
function jugeCmd1(rep,nom,starts,att,lus){const r=ligneChmod1(rep.c);if(r.vide)return {incomplet:"Écris la commande chmod."};if(r.err)return {incomplet:r.err};
  const ok=x=>x.replace(/^\.\//,"")===nom;if(r.cibles.length!==1||!ok(r.cibles[0]))return {incomplet:`La commande doit viser le fichier ${c(nom)}, et lui seul.`};
  const X=starts.map(s=>chmod1(s,r.mode,0o022));if(X[0].err)return {incomplet:X[0].err};
  if(X.every((x,i)=>x.m===att[i]))return {ok:true};
  const non=(type,titre,msg)=>({ok:false,faux:["c"],resume:"Pas tout à fait : ta commande ne donne pas les bons droits.",diag:{etape:lus.etape,type,titre,msg}});
  const oc=/^[0-7]+$/.test(r.mode);
  if(oc&&starts.length>1)return non("chiffres sans connaître les droits","Où ça part : chiffres ou lettres.",`Avec des chiffres, chmod remplace les neuf droits : il faudrait connaître les droits actuels pour ne rien changer d'autre. Avec des lettres (${c("u")}, ${c("g")}, ${c("o")}, ${c("a")}, puis ${c("+")} ou ${c("-")}), on ne touche qu'à ce qu'on cite.`);
  if(oc){const v=parseInt(r.mode,8)&0o777;for(const [t,f,msg] of [["r et x échangés",envers1,MSG1.envers],["catégories dans le désordre",ordre1,MSG1.ordre],["nombre de lettres au lieu de la somme",compte1,MSG1.compte]])if(f(att[0])===v&&v!==att[0])return non(t,"Où ça part : le calcul en octal.",msg);}
  else for(const [t,k] of LU1){if(k==="ajoute")continue;const Y=starts.map(s=>chmod1(s,r.mode,0o022,{[k]:1}).m);if(Y.every((y,i)=>y===att[i]))return non(t,"Où ça part : le sens d'une lettre ou d'un signe.",MSG1[k]);}
  const i=X.findIndex((x,i)=>x.m!==att[i]),k=[0,1,2].find(k=>paq1(X[i].m,k)!==paq1(att[i],k));
  return non("droits faux","Où ça part : un paquet de trois droits.",`${starts.length>1?`Si ${c(nom)} avait les droits ${c(let1(starts[i]))}, ta commande donnerait`:"Ta commande donne"} ${c(let1(X[i].m))} au lieu de ${c(let1(att[i]))} : pour ${CAT1[k]}, ${c(trip1(paq1(X[i].m,k)))} au lieu de ${c(trip1(paq1(att[i],k)))}.`);}
function exoDr1(R){const f=R.choix([0,0,0,1,1,2,2]),nom=R.choix(NOMS1),m0=tireMode1(R,false);
  if(f===0){const cmd=R()<0.15?R.choix(["640","600","755","644","700","750","444","664"]):tireSym1(R),att=chmod1(m0,cmd,0o022).m;if(att===m0)return null;
    const P=LU1.map(([t,k])=>[t,chmod1(m0,cmd,0o022,{[k]:1}).m,MSG1[k]]).filter(x=>x[1]!==att);if(!P.length)return null;
    const juge=rep=>jugeDr1(rep.d,"let",att,P,"d",1),lsl=lsl1(R,m0,false,"bob","etu",nom);
    const E=[{w:`Avant : ${c(let1(m0))}, c'est-à-dire ${[0,1,2].map(k=>`${c(trip1(paq1(m0,k)))} pour ${CAT1[k]}`).join(", ")}.`,why:"Ce sont les neuf caractères après le type, dans la ligne de ls -l.",pts:1},
      ...clauses1(m0,cmd,0o022).map(x=>Object.assign(x,{pts:1.5})),{w:`<b>${c(let1(att))}</b>`,why:`${c("ls -l")} afficherait ${c("-"+let1(att))}.`,pts:0.5}];
    return {sig:"D10"+oct1(m0)+cmd,q:`Voici la ligne de ${c("ls -l")} pour ${c(nom)}. Quels sont ses droits après la commande ${c("chmod "+cmd+" "+nom)} ? Écris-les en lettres (neuf caractères).`,corps:bloc(lsl),texte:`${let1(m0)} puis chmod ${cmd}`,
      champs:[{k:"champ",id:"d",nom:"droits",label:"Les droits après :",ex:"par exemple rw-r--r--",apercu:false,sym:SYMD1}],juge,etapes:E,bonne:c(let1(att)),bonneTxt:let1(att),repBonne:{d:let1(att)},repFausse:{d:let1(P[0][1])},nature:/^\d/.test(cmd)?"chmod en octal":"chmod en lettres",
      ens:{fam:"apres",m0,cmd,att,pieges:P.map(x=>({type:x[0],d:let1(x[1])})),bash:[vraiCh1([`touch ${nom}`,`chmod ${oct1(m0)} ${nom}`,`chmod ${cmd} ${nom}`,`stat -c %A ${nom}`],["-"+let1(att)])]}};}
  if(f===1){let m1;for(;;){m1=m0;const K=R.mel([0,1,2]).slice(0,R.ent(1,2));for(const k of K)m1=(m1&~(7<<(6-3*k)))|(tirePaq1(R,false)<<(6-3*k));if(m1!==m0)break;}
    if(R()<0.3)m1|=0o100;const s=sym1(m0,m1),o=oct1(m1),eg="u="+trip1(paq1(m1,0)).replace(/-/g,"")+",g="+trip1(paq1(m1,1)).replace(/-/g,"")+",o="+trip1(paq1(m1,2)).replace(/-/g,"");if(m1===m0)return null;
    const juge=rep=>jugeCmd1(rep,nom,[m0],[m1],{etape:1}),fx=[envers1,ordre1].map(g=>g(m1)).find(x=>x!==m1);if(fx===undefined)return null;
    const E=[{w:[0,1,2].map(k=>`${CAT1[k]} : ${c(trip1(paq1(m0,k)))} → ${c(trip1(paq1(m1,k)))}${paq1(m0,k)===paq1(m1,k)?" (rien ne change)":""}`).join("<br>"),why:"On compare paquet par paquet ce qu'on a et ce qu'on veut.",pts:1},
      {w:`En octal : ${c("chmod "+o+" "+nom)}, car ${[0,1,2].map(k=>`${c(trip1(paq1(m1,k)))} = ${paq1(m1,k)}`).join(", ")}.`,why:"Avec des chiffres, on donne les neuf droits d'un coup : r = 4, w = 2, x = 1.",pts:1.5},
      {w:`En lettres : ${c("chmod "+s+" "+nom)}.`,why:`On ne cite que ce qui change : ${c("+")} ajoute, ${c("-")} retire, ${c("=")} remplace. ${c("u")} le propriétaire, ${c("g")} le groupe, ${c("o")} les autres, ${c("a")} tout le monde.`,pts:1},
      {w:`<b>${c("chmod "+o+" "+nom)}</b> (ou ${c("chmod "+s+" "+nom)})`,why:"Les deux écritures donnent les mêmes droits.",pts:0.5}];
    return {sig:"D11"+oct1(m0)+o,q:`Le fichier ${c(nom)} a les droits ${c(let1(m0))}. Écris une commande qui lui donne les droits ${c(let1(m1))}.`,corps:"",texte:`${let1(m0)} → ${let1(m1)} : la commande ?`,
      champs:[{k:"champ",id:"c",nom:"commande",label:"La commande :",ex:"chmod … "+nom,apercu:false,sym:SYMC1}],juge,etapes:E,bonne:c("chmod "+o+" "+nom),bonneTxt:"chmod "+o+" "+nom,repBonne:{c:"chmod "+o+" "+nom},repFausse:{c:"chmod "+oct1(fx)+" "+nom},nature:"écrire chmod",
      ens:{fam:"ecrire",m0,att:m1,nom,alt:["chmod "+s+" "+nom,"chmod "+eg+" "+nom,"chmod 0"+o+" ./"+nom],pieges:[{type:"r et x échangés",c:"chmod "+oct1(envers1(m1))+" "+nom}].filter(x=>envers1(m1)!==m1),
        bash:["chmod "+o+" "+nom,"chmod "+s+" "+nom,"chmod "+eg+" "+nom].map(x=>vraiCh1([`touch ${nom}`,`chmod ${oct1(m0)} ${nom}`,x,`stat -c %A ${nom}`],["-"+let1(m1)]))}};}
  const [ref,phrase]=R.choix(BUT1),S=[m0,m0^0o777,tireMode1(R,false)],att=S.map(s=>chmod1(s,ref,0o022).m);if(att[0]===m0)return null;
  const juge=rep=>jugeCmd1(rep,nom,S,att,{etape:0}),qui=/^[ugoa]*/.exec(ref)[0];
  const P=[["chiffres sans connaître les droits","chmod "+oct1(att[0])+" "+nom],["o lu comme le propriétaire","chmod "+ref.replace(/^u/,"o")+" "+nom],...(ref.includes("+")?[["= lu comme +","chmod "+ref.replace("+","=")+" "+nom]]:[])].filter(([t,x])=>x!=="chmod "+ref+" "+nom&&!S.every((s,i)=>chmod1(s,x.split(" ")[1],0o022).m===att[i]));
  const E=[{w:`Qui : ${quiTxt1(qui)}, donc ${c(qui)}.`,why:`${c("u")} : user, le propriétaire ; ${c("g")} : group, le groupe ; ${c("o")} : others, les autres ; ${c("a")} : all, tout le monde.`,pts:1},
    {w:`Le signe et les droits : ${c(ref.slice(qui.length))}.`,why:`${c("+")} ajoute, ${c("-")} retire, ${c("=")} remplace. On ne connaît pas les droits actuels : avec des chiffres, chmod remplacerait les neuf droits, et on changerait ce qu'il ne fallait pas toucher.`,pts:1.5},
    {w:`<b>${c("chmod "+ref+" "+nom)}</b>`,why:`Par exemple, si ${c(nom)} avait ${c(let1(m0))}, il aurait ensuite ${c(let1(att[0]))}.`,pts:0.5}];
  return {sig:"D12"+ref+nom,q:`Tu ne connais pas les droits actuels de ${c(nom)}. Écris la commande qui ${phrase}, sans rien changer d'autre.`,corps:"",texte:`Sans connaître les droits : ${phrase}`,
    champs:[{k:"champ",id:"c",nom:"commande",label:"La commande :",ex:"chmod … "+nom,apercu:false,sym:SYMC1}],juge,etapes:E,bonne:c("chmod "+ref+" "+nom),bonneTxt:"chmod "+ref+" "+nom,repBonne:{c:"chmod "+ref+" "+nom},repFausse:{c:"chmod "+oct1(att[0])+" "+nom},nature:"sans connaître les droits",
    ens:{fam:"relatif",starts:S,att,nom,ref,pieges:P.map(([type,x])=>({type,c:x})),bash:S.map((s,i)=>vraiCh1([`touch ${nom}`,`chmod ${oct1(s)} ${nom}`,`chmod ${ref} ${nom}`,`stat -c %A ${nom}`],["-"+let1(att[i])]))}};}

/* palier 3 : umask */
const sous1=(b,u)=>{const D=oct1(b).split("").map((x,i)=>+x-+oct1(u)[i]);return D.every(x=>x>=0)?parseInt(D.join(""),8):null;};
const retire1=u=>{const L=[0,1,2].map(k=>{const d=paq1(u,k);return d?(d===7?`tout ${k===2?"aux autres":k===1?"au groupe":"au propriétaire"}`:`${trip1(d).replace(/-/g,"").split("").join(" et ")} ${k===2?"aux autres":k===1?"au groupe":"au propriétaire"}`):null;}).filter(Boolean);return L.length?"il retire "+et(L):"il ne retire rien";};
function exoDr2(R){const f=R.choix([0,0,0,1,1,2,2]);let um;
  for(;;){um=deP1(R.choix([0,0,0,0,2]),R.choix([0,2,2,7,5,3,1,6,4]),R.choix([0,2,2,7,7,5,3,1,6,4]));if(um)break;}
  const F=0o666&~um,D=0o777&~um,ens0=[`umask ${oct1(um)}`,"touch f","mkdir d","stat -c %A f d"];
  if(f===0){const Pf=[["soustraction au lieu de retirer des bits",sous1(0o666,um),`On retire des bits, on ne soustrait pas : 6 = 110 sans le bit 1 reste 110, donc 6 (et 6 − 1 = 5 ferait apparaître un x).`],["base 777 pour un fichier",0o777&~um,"Un nouveau fichier part de 666 (rw-rw-rw-) : il ne naît jamais exécutable. C'est un répertoire qui part de 777."],["umask pris pour les droits",um,"Le umask donne les droits à retirer, pas ceux à donner."]].filter(x=>x[1]!==null&&x[1]!==F);
    const Pd=[["base 666 pour un répertoire",0o666&~um,"Un nouveau répertoire part de 777 (rwxrwxrwx) : sans x, on ne pourrait pas y entrer."],["umask pris pour les droits",um,"Le umask donne les droits à retirer, pas ceux à donner."]].filter(x=>x[1]!==D);
    function juge(rep){const a=lisDr1(rep.f),b=lisDr1(rep.d);if(a.vide||b.vide)return {incomplet:"Donne les deux : les droits du fichier et ceux du répertoire."};if(a.err)return {incomplet:a.err};if(b.err)return {incomplet:b.err};
      if(a.m===F&&b.m===D)return {ok:true};const j=a.m!==F?jugeDr1(rep.f,"",F,Pf,"f",2,"les droits du fichier"):jugeDr1(rep.d,"",D,Pd,"d",3,"les droits du répertoire");
      if(a.m!==F&&b.m!==D)j.faux=["f","d"];return j;}
    const E=[{w:"Les bases : un fichier part de 666 (rw-rw-rw-), un répertoire de 777 (rwxrwxrwx).",why:"Un fichier ne naît jamais exécutable ; un répertoire naît traversable.",pts:1},
      {w:`Le masque ${c(oct1(um))} = ${bits1(um)} : ${retire1(um)}.`,why:"Chaque chiffre fait trois bits, r w x ; un bit à 1 dans le umask est un droit retiré.",pts:1},
      {w:`Fichier : ${bits1(0o666)} sans ${bits1(um)} donne ${bits1(F)} = ${oct1(F)}, ${c(let1(F))}.`,why:"On garde les bits de la base qui ne sont pas dans le masque.",pts:1},
      {w:`Répertoire : ${bits1(0o777)} sans ${bits1(um)} donne ${bits1(D)} = ${oct1(D)}, ${c(let1(D))}.`,why:"Même calcul, avec la base 777.",pts:1},
      {w:`<b>fichier ${c(let1(F))} (${oct1(F)}), répertoire ${c(let1(D))} (${oct1(D)})</b>`,why:`${c("ls -l")} afficherait ${c("-"+let1(F))} et ${c("d"+let1(D))}.`,pts:0.5}];
    const pf=Pf[0]?Pf[0][1]:0o777&~um;
    return {sig:"D20"+oct1(um),q:`Avec ${c("umask "+oct1(um))}, tu crées un fichier (${c("touch f")}) et un répertoire (${c("mkdir d")}). Quels sont leurs droits ? En lettres ou en octal.`,corps:"",texte:`umask ${oct1(um)} : fichier et répertoire ?`,
      champs:[{k:"champ",id:"f",nom:"fichier",label:"Le fichier f :",ex:"par exemple rw-r--r-- ou 644",apercu:false,sym:SYMD1},{k:"champ",id:"d",nom:"répertoire",label:"Le répertoire d :",ex:"par exemple rwxr-xr-x ou 755",apercu:false,sym:SYMD1}],juge,etapes:E,
      bonne:`fichier ${c(let1(F))}, répertoire ${c(let1(D))}`,bonneTxt:`${let1(F)} ${let1(D)}`,repBonne:{f:let1(F),d:oct1(D)},repFausse:{f:let1(pf),d:let1(D)},nature:"umask : les droits",
      ens:{fam:"umask",um,F,D,piegesF:Pf.map(x=>({type:x[0],f:let1(x[1])})),piegesD:Pd.map(x=>({type:x[0],d:let1(x[1])})),bash:[vraiCh1(ens0,["-"+let1(F),"d"+let1(D)])]}};}
  if(f===1){const P=[["droits donnés au lieu du umask",D,`Le umask contient les droits à retirer, pas ceux qu'on veut obtenir : c'est ce qui manque à ${c(let1(D))}.`],["calculé sur le fichier seul",0o666&~F,`En partant du fichier, on ne voit pas les x (un fichier n'en a jamais au départ) : le répertoire ${c(let1(D))} dit aussi quels x retirer.`],["droits du fichier donnés",F,"Le umask contient les droits à retirer, pas ceux qu'on veut obtenir."]].filter(x=>x[1]!==um);
    function juge(rep){let s=propre(rep.u).replace(/^umask\s*/,"").replace(/\s/g,"");if(!s)return {incomplet:"Écris le umask."};if(!/^[0-7]{1,4}$/.test(s)||parseInt(s,8)>0o777)return {incomplet:"Le umask s'écrit en octal, avec trois chiffres (par exemple 022)."};
      const v=parseInt(s,8);if(v===um)return {ok:true};const non=(type,titre,msg)=>({ok:false,faux:["u"],resume:"Pas tout à fait : ce n'est pas le bon umask.",diag:{etape:0,type,titre,msg}});
      for(const [t,x,msg] of P)if(x===v)return non(t,"Où ça part : ce que contient le umask.",msg);
      return non("umask faux","Où ça part : le calcul.",`Avec ${c("umask "+oct1(v))}, un fichier naîtrait en ${c(let1(0o666&~v))} et un répertoire en ${c(let1(0o777&~v))}.`);}
    const E=[{w:`Le répertoire part de 777 : le umask, c'est exactement ce qui manque à ${c(let1(D))}.`,why:"Le umask retire des droits ; pour un répertoire, rien d'autre ne manque au départ.",pts:1.5},
      {w:`Chiffre par chiffre : ${oct1(D).split("").map(d=>`7 − ${d} = ${7-d}`).join(", ")}, donc ${c(oct1(um))}.`,why:"Ici on peut soustraire : 7 = 111, et retirer à 111 les bits d'un chiffre donne 7 moins ce chiffre.",pts:1},
      {w:`On vérifie sur le fichier : ${bits1(0o666)} sans ${bits1(um)} donne ${c(let1(F))}.`,why:"C'est bien ce que demande l'énoncé.",pts:1},
      {w:`<b>${c("umask "+oct1(um))}</b>`,why:retire1(um).replace(/^il/,"Il")+".",pts:0.5}];
    return {sig:"D21"+oct1(um),q:`Quel umask faut-il donner pour que les nouveaux fichiers naissent avec les droits ${c(let1(F))} et les nouveaux répertoires avec ${c(let1(D))} ?`,corps:"",texte:`umask pour ${let1(F)} et ${let1(D)} ?`,
      champs:[{k:"champ",id:"u",nom:"umask",label:"Le umask :",ex:"par exemple 022",apercu:false,sym:[]}],juge,etapes:E,bonne:c(oct1(um)),bonneTxt:oct1(um),repBonne:{u:oct1(um)},repFausse:{u:oct1(P.length?P[0][1]:um^0o001)},nature:"umask à trouver",
      ens:{fam:"umaskInv",um,F,D,pieges:P.map(x=>({type:x[0],u:oct1(x[1])})),bash:[vraiCh1(ens0,["-"+let1(F),"d"+let1(D)])]}};}
  const nom=R.choix(["s.sh","lance.sh","tp.py","job.sh"]),cmd=R.choix(["u+x","+x","+x","a+x","g+w","go-r","ug+x","u+x,g+w","+w"]),att=chmod1(F,cmd,um).m;
  const P=[["base 777 pour un fichier",chmod1(0o777&~um,cmd,um).m,"Un nouveau fichier part de 666 (rw-rw-rw-), pas de 777."],["umask oublié",chmod1(F,cmd,um,{sansMasque:1}).m,MSG1.sansMasque],["umask oublié à la création",chmod1(0o666,cmd,um).m,`Le fichier naît déjà sans les droits du umask : ${c(let1(F))}.`],["soustraction au lieu de retirer des bits",sous1(0o666,um)===null?null:chmod1(sous1(0o666,um),cmd,um).m,"On retire des bits, on ne soustrait pas : 6 sans le bit 1 reste 6."]].filter(x=>x[1]!==null&&x[1]!==att);
  if(!P.length)return null;
  const E=[{w:`Le fichier naît avec 666 sans ${oct1(um)} : ${bits1(0o666)} sans ${bits1(um)} donne ${c(let1(F))}.`,why:"Un nouveau fichier part de 666, et le umask retire ses bits.",pts:1.5},
    ...clauses1(F,cmd,um).map(x=>Object.assign(x,{pts:1.5})),{w:`<b>${c(let1(att))}</b>`,why:"Le umask ne compte qu'à la création et pour un chmod sans u, g, o ni a.",pts:0.5}];
  return {sig:"D22"+oct1(um)+cmd,q:`Avec ${c("umask "+oct1(um))}, tu tapes ${c("touch "+nom)}, puis ${c("chmod "+cmd+" "+nom)}. Quels sont les droits de ${c(nom)} ? Écris-les en lettres.`,corps:"",texte:`umask ${oct1(um)}, touch, chmod ${cmd}`,
    champs:[{k:"champ",id:"d",nom:"droits",label:"Les droits :",ex:"par exemple rwxr--r--",apercu:false,sym:SYMD1}],juge:rep=>jugeDr1(rep.d,"let",att,P,"d",1),etapes:E,bonne:c(let1(att)),bonneTxt:let1(att),repBonne:{d:let1(att)},repFausse:{d:let1(P[0][1])},nature:"umask puis chmod",
    ens:{fam:"umaskChmod",um,cmd,att,pieges:P.map(x=>({type:x[0],d:let1(x[1])})),bash:[vraiCh1([`umask ${oct1(um)}`,`touch ${nom}`,`chmod ${cmd} ${nom}`,`stat -c %A ${nom}`],["-"+let1(att)])]}};}

/* palier 4 : qui peut faire quoi. Une chaîne : /home/bob, /home/bob/tp, /home/bob/tp/note.txt ; une action demande des bits sur des maillons (0, 1, 2) */
const ACT1={lire:{t:"lire note.txt (cat)",b:[[0,1],[1,1],[2,4]],cmd:"cat bob/tp/note.txt"},modifier:{t:"modifier note.txt",b:[[0,1],[1,1],[2,2]],cmd:"echo fin >> bob/tp/note.txt"},
  supprimer:{t:"supprimer note.txt (rm)",b:[[0,1],[1,1],[1,2]],cmd:"rm bob/tp/note.txt"},renommer:{t:"renommer note.txt (mv)",b:[[0,1],[1,1],[1,2]],cmd:"mv bob/tp/note.txt bob/tp/vieux.txt"},
  lister:{t:"lister tp (ls)",b:[[0,1],[1,4]],cmd:"ls bob/tp"},creer:{t:"créer un fichier dans tp",b:[[0,1],[1,1],[1,2]],cmd:"touch bob/tp/nouveau.txt"},entrer:{t:"entrer dans tp (cd)",b:[[0,1],[1,1]],cmd:"cd bob/tp"}};
const lv1=v=>"rwx"[[4,2,1].indexOf(v)],NOMB1=["bob","tp","note.txt"],CHEM1=["/home/bob","/home/bob/tp","/home/bob/tp/note.txt"];
/* eff : le paquet qui compte pour la personne, maillon par maillon ; lu : une règle mal lue */
const peut1=(eff,a,lu)=>{lu=lu||{};let B=ACT1[a].b;
  if(lu.fichier&&(a==="supprimer"||a==="renommer"))B=[[0,1],[1,1],[2,2]];
  if(lu.sansX)B=B.filter(([i,v])=>!(v===1&&i<2));if(lu.rPourX)B=B.map(([i,v])=>v===1&&i<2?[i,4]:[i,v]);
  return B.every(([i,v])=>eff[i]&v);};
const manque1=(eff,a)=>ACT1[a].b.filter(([i,v])=>!(eff[i]&v)).map(([i,v])=>`${lv1(v)} sur ${NOMB1[i]}`);
const cat1=(e,qui)=>e.p===qui.n?0:qui.G.includes(e.g)?1:2;
const effDe1=(ch,qui,lu)=>ch.map(e=>lu&&lu.union?paq1(e.m,0)|paq1(e.m,1)|paq1(e.m,2):lu&&lu.sansGroupe?paq1(e.m,e.p===qui.n?0:2):paq1(e.m,cat1(e,qui)));
const MSGA1={union:"Une seule catégorie compte, maillon par maillon : le propriétaire si c'est la personne, sinon le groupe si elle en fait partie, sinon les autres. Les droits des autres catégories ne s'ajoutent pas.",
  sansGroupe:"La personne fait partie de certains groupes (voir id) : sur un maillon de son groupe, c'est le paquet du groupe qui compte, pas celui des autres.",
  fichier:"Supprimer ou renommer un fichier change la liste des noms du répertoire : il faut w et x sur le répertoire, et les droits du fichier ne comptent pas.",
  sansX:"Pour atteindre quelque chose dans un répertoire, il faut le droit x (traverser) sur chaque répertoire du chemin.",
  rPourX:"Traverser un répertoire demande x, pas r : r sert seulement à lister ses noms."};
function voitChaine1(R,ch,qui){const L=ch.map((e,i)=>lsl1(R,e.m,i<2,e.p,e.g,CHEM1[i]));return `${c("id "+qui.n)} :${bloc(qui.id)}${c("ls -ld")} sur le dossier de bob, sur tp et sur note.txt :${bloc(L.join("\n"))}`;}
function tireQui1(R){const G=R()<0.5?["etu"]:["etu","l1info"];return {n:"alice",G,id:`uid=1003(alice) gid=1003(etu) groupes=${G.map((g,i)=>(1003+i*20)+"("+g+")").join(",")}`};}
function exoDr3(R){const f=R()<0.6?0:1,qui=tireQui1(R);
  if(f===0){const ch=[0,1,2].map(i=>{const p=i===2&&R()<0.35?"alice":i===1&&R()<0.15?"alice":"bob",g=R.choix(["etu","etu","prof"]);
      const m=deP1(p==="alice"?R.choix(i<2?[7,5,3]:[6,4,2]):R.choix(i<2?[7,7,5]:[6,6,4]),tirePaq1(R,i<2),tirePaq1(R,i<2));return {p,g,m};});
    const A=R.mel(Object.keys(ACT1)).slice(0,6),eff=effDe1(ch,qui),bon=A.filter(a=>peut1(eff,a));if(!bon.length||bon.length===A.length)return null;
    const LU=[["droits de toutes les catégories ajoutés",{union:1}],["groupe oublié",{sansGroupe:1}],["supprimer selon les droits du fichier",{fichier:1}],["traversée oubliée",{sansX:1}],["r au lieu de x pour traverser",{rPourX:1}]];
    const vu=lu=>{const e2=effDe1(ch,qui,lu);return A.filter(a=>peut1(e2,a,lu));},key=L=>A.filter(a=>L.includes(a)).join(",");
    const P=LU.map(([t,lu])=>[t,vu(lu),MSGA1[Object.keys(lu)[0]]]).filter(x=>key(x[1])!==key(bon));if(P.length<2)return null;
    function juge(rep){const S=(rep.g||[]).map(String);if(!S.length)return {incomplet:"Coche les actions permises (ou « aucune »)."};
      const moi=S.includes("0")?[]:A.filter(a=>S.includes(a));if(key(moi)===key(bon))return {ok:true};
      const non=(etape,type,titre,msg)=>({ok:false,faux:["g"],resume:"Pas tout à fait : ce ne sont pas les actions permises à alice.",diag:{etape,type,titre,msg}});
      for(const [t,L,msg] of P)if(key(L)===key(moi))return non(t==="droits de toutes les catégories ajoutés"||t==="groupe oublié"?0:1,t,"Où ça part : la règle.",msg);
      const a=A.find(a=>moi.includes(a)!==bon.includes(a));
      return non(2,bon.includes(a)?"action permise oubliée":"action cochée à tort","Où ça part : une action.",`${ACT1[a].t} : ${bon.includes(a)?"alice a tous les droits qu'il faut ("+ACT1[a].b.map(([i,v])=>`${lv1(v)} sur ${NOMB1[i]}`).join(", ")+")":"il manque "+et(manque1(eff,a))}.`);}
    const raison=(e,i)=>{const k=cat1(e,qui);return `${c(NOMB1[i])} : ${k===0?"alice en est propriétaire":k===1?`le groupe est ${e.g}, et alice en fait partie`:`propriétaire ${e.p}, groupe ${e.g} : alice n'est ni l'un ni dans l'autre`} → ${c(trip1(eff[i]))}`;};
    const E=[{w:"Le paquet qui compte pour alice, maillon par maillon :<br>"+ch.map(raison).join("<br>"),why:"Une seule catégorie par maillon : le propriétaire si c'est alice, sinon le groupe si elle en fait partie, sinon les autres. Les autres paquets ne comptent pas.",pts:1.5},
      {w:"Les droits qu'il faut :<br>"+A.map(a=>`${ACT1[a].t} : ${ACT1[a].b.map(([i,v])=>`${lv1(v)} sur ${NOMB1[i]}`).join(", ")}`).join("<br>"),why:"x sur chaque répertoire du chemin pour l'atteindre ; r sur un répertoire pour le lister ; w (et x) sur le répertoire pour créer, supprimer ou renommer, quels que soient les droits du fichier.",pts:1.5},
      {w:A.map(a=>`${ACT1[a].t} : ${bon.includes(a)?"oui":"non, il manque "+et(manque1(eff,a))}`).join("<br>"),why:"On compare avec les paquets de la première étape.",pts:1.5},
      {w:`<b>alice peut : ${et(bon.map(a=>ACT1[a].t))}</b>`,why:`${bon.length} action${bon.length>1?"s":""} sur ${A.length}.`,pts:0.5}];
    /* le vrai bash joue chaque action, sur des copies où le paquet qui compte pour alice est mis au propriétaire */
    const tst=A.map(a=>`t; { ${ACT1[a].cmd==="cd bob/tp"?"(cd bob/tp)":ACT1[a].cmd} ; } >/dev/null 2>&1 && echo ${a}:oui || echo ${a}:non; n`);
    const vrai=vraiCh1([`t(){ mkdir -p bob/tp; echo texte > bob/tp/note.txt; chmod ${eff[2]}00 bob/tp/note.txt; chmod ${eff[1]}00 bob/tp; chmod ${eff[0]}00 bob; }`,"n(){ chmod u+rwx bob; chmod u+rwx bob/tp; rm -rf bob; }",...tst],A.map(a=>a+":"+(bon.includes(a)?"oui":"non")));
    const O=A.map(a=>[a,ACT1[a].t]).concat([["0","aucune"]]);
    return {sig:"D30"+ch.map(e=>e.p+e.g+oct1(e.m)).join("|")+qui.G.join()+A.slice().sort().join(),q:"Coche ce qu'alice peut faire. Sous chaque commande, ce qu'elle affiche :",corps:voitChaine1(R,ch,qui),texte:`alice ${qui.G.join(",")} ; `+ch.map((e,i)=>`${NOMB1[i]} ${let1(e.m)} ${e.p} ${e.g}`).join(" ; "),
      champs:[{k:"multi",id:"g",o:O,seul:"0"}],juge,etapes:E,bonne:et(bon.map(a=>ACT1[a].t)),bonneTxt:bon.join(","),repBonne:{g:bon},repFausse:{g:P[0][1].length?P[0][1]:["0"]},nature:"qui peut faire quoi",
      ens:{fam:"acces",ch,qui,A,bon,pieges:P.map(x=>({type:x[0],g:x[1].length?x[1]:["0"]})),bash:[vrai]}};}
  /* régler les droits : bob, dans /home/bob, tape des chmod pour qu'une personne puisse faire ceci et pas cela */
  const BUTS=[
    {t:"lucas (qui n'est pas dans le groupe etu) puisse lire et modifier tp/note.txt, mais pas lister tp (comme au TD, exercice 18)",k:2,ok:["lire","modifier"],non:["lister"],fixe:[0,1],v:(t,n)=>[1,n|6]},
    {t:"marie (du groupe etu) puisse lister tp et lire tp/note.txt, mais ni modifier note.txt, ni créer ou supprimer de fichier dans tp",k:1,ok:["lister","lire"],non:["modifier","creer","supprimer"],fixe:[0,2],v:(t,n)=>[5,4]},
    {t:"marie (du groupe etu) puisse modifier tp/note.txt, mais pas le supprimer",k:1,ok:["modifier"],non:["supprimer"],fixe:[0,2],v:(t,n)=>[(t|1)&~2,n|2]},
    {t:"ni marie (du groupe etu) ni lucas (qui n'y est pas) ne puissent entrer dans tp",k:-1,ok:[],non:["entrer"],fixe:[0],v:null},
    {t:"lucas (qui n'est pas dans le groupe etu) ne puisse plus rien faire dans tp, ni sur note.txt, sans changer les droits du groupe",k:2,ok:[],non:["lire","modifier","lister","entrer","creer","supprimer"],fixe:[0,1],v:(t,n)=>[0,n]},
    {t:"marie (du groupe etu) puisse créer des fichiers dans tp",k:1,ok:["creer"],non:[],fixe:[0,2],v:(t,n)=>[t|3,n]}];
  const B=R.choix(BUTS),t0=deP1(7,tirePaq1(R,true),tirePaq1(R,true)),n0=deP1(6,tirePaq1(R,false),tirePaq1(R,false));
  const PERS=[{n:"marie",G:["etu"]},{n:"lucas",G:["prof"]}],ks=B.k<0?[1,2]:[B.k];
  const chDe=(t,n)=>[{p:"bob",g:"etu",m:0o711},{p:"bob",g:"etu",m:t},{p:"bob",g:"etu",m:n}];
  const tient=(t,n)=>ks.every(k=>{const e=effDe1(chDe(t,n),PERS[k-1]);return B.ok.every(a=>peut1(e,a))&&B.non.every(a=>!peut1(e,a));})&&B.fixe.every(k=>paq1(t,k)===paq1(t0,k)&&paq1(n,k)===paq1(n0,k));
  if(tient(t0,n0))return null;
  let t1=t0,n1=n0;if(B.v){const [a,b]=B.v(paq1(t0,B.k),paq1(n0,B.k)),sh=6-3*B.k;t1=(t0&~(7<<sh))|(a<<sh);n1=(n0&~(7<<sh))|(b<<sh);}else t1=t0&~0o011;
  if(!tient(t1,n1))throw new Error("US1 : but mal réglé "+B.t);
  const ref=[t1!==t0?`chmod ${sym1(t0,t1)} tp`:null,n1!==n0?`chmod ${sym1(n0,n1)} tp/note.txt`:null].filter(Boolean).join("\n");
  const chem=s=>{s=s.replace(/\/+$/,"").replace(/^(\/home\/bob|~|\.)\//,"");return s==="tp"?1:s==="tp/note.txt"?2:s==="note.txt"?-2:0;};
  function joueRegle(src){let t=t0,n=n0;const L=String(src||"").split("\n").map(x=>x.trim()).filter(Boolean);if(!L.length)return {vide:1};
    for(const l of L){const r=ligneChmod1(l);if(r.err)return {err:r.err};for(const x of r.cibles){const i=chem(x);
        if(i===-2)return {err:`bob est dans /home/bob : note.txt est dans tp, son chemin est ${c("tp/note.txt")}.`};if(!i)return {err:`Ici, les commandes visent tp ou tp/note.txt (bob est dans /home/bob), pas ${c(x)}.`};
        const y=chmod1(i===1?t:n,r.mode,0o022);if(y.err)return {err:y.err};if(i===1)t=y.m;else n=y.m;}}
    return {t,n};}
  const verdict=(t,n)=>{for(const k of ks){const Q=PERS[k-1],e=effDe1(chDe(t,n),Q);for(const a of B.ok)if(!peut1(e,a))return {type:"action encore impossible",msg:`Avec tes commandes, ${Q.n} ne peut pas ${ACT1[a].t.replace(/ \(.*\)/,"")} : il manque ${et(manque1(e,a))} (paquet ${DU1[k]}).`};
      for(const a of B.non)if(peut1(e,a))return {type:a==="lister"?"r laissé sur le répertoire":a==="supprimer"||a==="creer"?"w laissé sur le répertoire":"action encore permise",msg:`Avec tes commandes, ${Q.n} peut encore ${ACT1[a].t.replace(/ \(.*\)/,"")} : ${a==="supprimer"||a==="creer"?"créer et supprimer dépendent de w sur le répertoire tp, pas des droits du fichier":a==="lister"?"lister tp demande r sur tp ; pour seulement le traverser, x suffit":"il faut lui retirer un des droits "+ACT1[a].b.map(([i,v])=>`${lv1(v)} sur ${NOMB1[i]}`).join(", ")}.`};}
    for(const k of B.fixe){if(paq1(t,k)!==paq1(t0,k))return {type:"autre catégorie changée",msg:`Tu as changé le paquet ${DU1[k]} sur tp (${c(trip1(paq1(t0,k)))} devient ${c(trip1(paq1(t,k)))}) : l'énoncé ne demande pas d'y toucher.`};
      if(paq1(n,k)!==paq1(n0,k))return {type:"autre catégorie changée",msg:`Tu as changé le paquet ${DU1[k]} sur note.txt (${c(trip1(paq1(n0,k)))} devient ${c(trip1(paq1(n,k)))}) : l'énoncé ne demande pas d'y toucher.`};}
    return null;};
  function juge(rep){const r=joueRegle(rep.c);if(r.vide)return {incomplet:"Écris les commandes chmod, une par ligne."};if(r.err)return {incomplet:r.err};const v=verdict(r.t,r.n);if(!v)return {ok:true};
    return {ok:false,faux:["c"],resume:"Pas tout à fait : avec ces droits, l'énoncé n'est pas respecté.",diag:{etape:v.type==="autre catégorie changée"?2:1,type:v.type,titre:"Où ça part : une action.",msg:v.msg}};}
  const PI=[];const ajoute=src=>{const r=joueRegle(src);if(r.err||r.vide)return;const v=verdict(r.t,r.n);if(v&&!PI.some(x=>x.c===src))PI.push({type:v.type,c:src});};
  ajoute(`chmod ${"ugo"[ks[0]]}= tp`);ajoute(`chmod ${"ugo"[ks[0]]}=rwx tp`);ajoute("chmod 777 tp\nchmod 666 tp/note.txt");ajoute(`chmod ${"ugo"[ks[0]]}-w tp/note.txt`);
  if(!PI.length)return null;
  const garde=new Set(B.ok.flatMap(a=>ACT1[a].b.map(([i,v])=>i+""+v))),Q=PERS[ks[0]-1],e0=effDe1(chDe(t0,n0),Q),Lsl=[lsl1(R,0o711,true,"bob","etu","/home/bob"),lsl1(R,t0,true,"bob","etu","/home/bob/tp"),lsl1(R,n0,false,"bob","etu","/home/bob/tp/note.txt")];
  const E=[{w:`Qui est visé : ${ks.map(k=>`${PERS[k-1].n} → le paquet ${DU1[k]}`).join(" ; ")}.`,why:`${ks.map(k=>k===1?"marie fait partie du groupe etu, le groupe de tp et de note.txt : pour elle, c'est le paquet du groupe":"lucas ne fait pas partie du groupe etu : pour lui, c'est le paquet des autres").join(" ; ")}. Le dossier de bob (rwx--x--x) se traverse par tous.`,pts:1},
    {w:"Ce qu'il faut :<br>"+[...B.ok.map(a=>`${ACT1[a].t} : ${ACT1[a].b.filter(([i])=>i).map(([i,v])=>`${lv1(v)} sur ${NOMB1[i]}`).join(", ")}`),...B.non.map(a=>`pas ${ACT1[a].t.replace(/ \(.*\)/,"")} : il faut lui retirer ${ACT1[a].b.filter(([i,v])=>i&&!garde.has(i+""+v)).map(([i,v])=>`${lv1(v)} sur ${NOMB1[i]}`).join(" ou ")}`)].join("<br>"),why:"Atteindre un fichier : x sur les répertoires du chemin. Lister : r sur le répertoire. Créer ou supprimer : w et x sur le répertoire, quels que soient les droits du fichier.",pts:1.5},
    {w:`Les droits voulus : tp ${c(let1(t1))}, note.txt ${c(let1(n1))}${B.fixe.length?` ; ${et(B.fixe.map(k=>CAT1[k]))} ne bouge${B.fixe.length>1?"nt":""} pas`:""}.`,why:"On ne change que le paquet de la personne visée.",pts:1},
    {w:`<b>${ref.split("\n").map(c).join("<br>")}</b>`,why:`Avant : tp ${c(let1(t0))}, note.txt ${c(let1(n0))}. ${B.ok.length||B.non.length?"D'autres écritures marchent aussi, par exemple en octal : "+[t1!==t0?c(`chmod ${oct1(t1)} tp`):"",n1!==n0?c(`chmod ${oct1(n1)} tp/note.txt`):""].filter(Boolean).join(" et ")+".":""}`,pts:0.5}];
  const alt=[[t1!==t0?`chmod ${oct1(t1)} tp`:"",n1!==n0?`chmod ${oct1(n1)} tp/note.txt`:""].filter(Boolean).join("\n"),ref.replace(/ tp/g," /home/bob/tp")];
  const bashDe=src=>{const r=joueRegle(src);return vraiCh1(["mkdir tp","touch tp/note.txt",`chmod ${oct1(n0)} tp/note.txt`,`chmod ${oct1(t0)} tp`,...src.split("\n").map(l=>l.replace(/(\/home\/bob\/|~\/)/g,"")),"stat -c %A tp tp/note.txt","chmod u+rwx tp"],["d"+let1(r.t),"-"+let1(r.n)]);};
  return {sig:"D31"+B.t+oct1(t0)+oct1(n0),q:`bob est dans /home/bob. Écris les commandes chmod (une par ligne) pour que ${B.t}.${B.fixe.length?` Ne change pas les droits ${et(B.fixe.map(k=>DU1[k]))}.`:""}`,corps:`${c("ls -ld")} :${bloc(Lsl.join("\n"))}`,texte:`${B.t} ; tp ${let1(t0)} note ${let1(n0)}`,
    champs:[{k:"code",id:"c",nom:"commandes",label:"Les commandes chmod :",lignes:4,ex:"chmod … tp",sym:SYMC1}],juge,etapes:E,bonne:ref.split("\n").map(c).join("<br>"),bonneTxt:ref.replace(/\n/g," ; "),repBonne:{c:ref},repFausse:{c:PI[0].c},nature:"régler les droits",
    ens:{fam:"regler",B:{ok:B.ok,non:B.non,fixe:B.fixe},ks,t0,n0,t1,n1,ref,alt:alt.filter(Boolean),pieges:PI,bash:[ref,...alt.filter(x=>x&&x!==ref)].map(bashDe)}};}
const tireDr=k=>R=>{for(;;){const e=[exoDr0,exoDr1,exoDr2,exoDr3][k](R);if(e)return e;}};

/* ---------- US2 : les chemins. Un chemin se lit morceau par morceau, depuis la racine, l'accueil ou le dossier courant ; un petit shell joue mkdir, rmdir, touch, cp, mv et rm ---------- */
const cw=s=>`<code>${esc(s).replace(/\//g,"/<wbr>")}</code>`;
const ACC2=["home","etu"],COUR2=["home","etu","projet"],ab2=P=>"/"+P.join("/"),meme2=(a,b)=>a.join("/")===b.join("/");
const HAUT2={cours:["usi","algo","maths"],projet:["src","tests","doc"],photos:["2024","vacances","famille"],docs:["factures","cv","banque"]};
const FIC2={usi:["td1.pdf","tp1.sh"],algo:["tri.py","exos.txt"],maths:["dm.tex","exos.pdf"],src:["main.c","outils.c"],tests:["essai.py","test.sh"],doc:["README","guide.md"],"2024":["mer.jpg","fete.jpg"],vacances:["plage.jpg","ski.jpg"],famille:["noel.jpg","mamie.jpg"],factures:["edf.pdf","eau.pdf"],cv:["cv.pdf","lettre.odt"],banque:["releve.pdf"]};
const BAS2={usi:"tp2",algo:"tris",src:"lib",vacances:"ete","2024":"juin",factures:"2023",tests:"vieux",doc:"images"};
const FBAS2={tp2:"exo.sh",tris:"tas.py",lib:"liste.c",ete:"lac.jpg",juin:"bac.jpg","2023":"gaz.pdf",vieux:"old.py",images:"img.png"};
function arbre2(R){const sous=s=>dossier(s,[...R.mel(FIC2[s]).slice(0,R.ent(1,2)).map(fichier),...(BAS2[s]&&R()<0.6?[dossier(BAS2[s],[fichier(FBAS2[BAS2[s]])])]:[])]);
  const acc=dossier("etu",[...["projet",R.choix(["cours","photos","docs"])].map(t=>dossier(t,R.mel(HAUT2[t]).slice(0,2).map(sous))),fichier("todo.txt")]);
  return dossier("",[dossier("etc",[fichier("passwd")]),dossier("home",[dossier("bob",[dossier("tp",[fichier("note.txt")])]),acc]),dossier("tmp",[]),dossier("usr",[dossier("bin",[fichier("ls"),fichier("python3")]),dossier("include",[fichier("stdio.h")])])]);}
const noeuds2=T=>{const L=[];const va=(t,P)=>{for(const x of t.d||[]){const Q=[...P,x.n];L.push({P:Q,dir:!!x.d,n:x.n});if(x.d)va(x,Q);}};va(T,[]);return L;};
const AILLEURS2=`<p>Ailleurs sur le disque : ${["/etc/passwd","/home/bob/tp/note.txt","/tmp","/usr/bin/ls","/usr/include/stdio.h"].map(c).join(", ")}.</p>`;
const voitArbre2=T=>`<p>Ton dossier d'accueil, ${cw("~")} :</p>${bloc(dessin(noeud(T,"/home/etu"),"/home/etu"))}${AILLEURS2}`;
const rel2=(a,b)=>{let k=0;while(k<a.length&&k<b.length&&a[k]===b[k])k++;const L=[...Array(a.length-k).fill(".."),...b.slice(k)];return L.length?L.join("/"):".";};
const dans2=(a,b)=>b.length>a.length&&a.every((x,i)=>x===b[i]);
const nbPP2=s=>s.split("/").filter(x=>x==="..").length;

/* lu : une lecture fausse (depuisRacine, depuisAcc, ppCourant : .. lu comme ., ppMoins : le premier .. oublié, tildeCourant) ; fantome : sans regarder si les noms existent */
function marche2(T,dep,s,lu){lu=lu||{};s=String(s);let P,d0;
  if(s[0]==="/"){P=[];d0="racine";s=s.slice(1);}
  else if(s==="~"||s.slice(0,2)==="~/"){P=lu.tildeCourant?dep.slice():ACC2.slice();d0="accueil";s=s.slice(2);}
  else{P=lu.depuisRacine?[]:lu.depuisAcc?ACC2.slice():dep.slice();d0="courant";}
  const pas=[],M=s.split("/");let haut=false,moins=!!lu.ppMoins,fic=null;
  for(const m of M){
    if(fic)return {err:{ou:ab2(P.slice(0,-1)),nom:fic,fic:true},pas,d0};
    if(m===""||m==="."){if(m===".")pas.push({m,P:P.slice()});continue;}
    if(m===".."){if(lu.ppCourant||moins){moins=false;pas.push({m,P:P.slice()});continue;}if(P.length)P.pop();else haut=true;}
    else{if(!lu.fantome){const t=noeud(T,ab2(P)),y=t&&t.d&&t.d.find(x=>x.n===m);if(!y)return {err:{ou:ab2(P),nom:m},pas,d0};if(!y.d)fic=m;}P.push(m);}
    pas.push({m,P:P.slice()});}
  return {P,p:ab2(P),pas,d0,haut,fic:!!fic};}
const ou2Txt=d0=>d0==="racine"?`commence par ${cw("/")} : on part de la racine`:d0==="accueil"?`commence par ${cw("~")} : on part de ton dossier d'accueil, ${cw("/home/etu")}`:"ne commence ni par / ni par ~ : on part du dossier courant";
const trajet2=(dep,r)=>`${cw(ab2(dep))}${r.pas.map(x=>` → (${cw(x.m)}) ${cw(ab2(x.P))}`).join("")}`;

/* le vrai bash, dans une arborescence temporaire dont la racine est R : les chemins absolus y sont préfixés par R */
const shq2=s=>"'"+s+"'";
const shp2=p=>p[0]==="/"?'"$R"'+shq2(p):p==="~"?"~":p.slice(0,2)==="~/"?"~/"+(p.length>2?shq2(p.slice(2)):""):shq2(p);
const DEB2='R=${HOME%/home/etu}\n',VOIR2='x=${PWD#"$R"}; echo "${x:-/}"';
const vraiOu2=(T,cur,p,att)=>({arbo:T,cmd:DEB2+'cd "$R'+ab2(cur)+'"\np='+shp2(p)+'\nif [ -d "$p" ]; then cd -- "$p"; '+VOIR2+'; elif [ -e "$p" ]; then cd -- "$(dirname -- "$p")"; x=${PWD#"$R"}; echo "${x%/}/$(basename -- "$p")"; else echo ERR; fi',args:[],nom:"./chemin.sh",script:true,abs:[att]});
const vraiCd2=(T,dep,L,att)=>({arbo:T,cmd:DEB2+'cd "$R'+ab2(dep)+'"\n'+L.map(ch=>ch===""?"cd":"cd "+shp2(ch)).join("\n")+"\n"+VOIR2,args:[],nom:"./cd.sh",script:true,abs:[att]});

/* ce que tape l'étudiant : un chemin, avec ou sans la commande devant */
const net2=s=>propre(s).replace(/^(cd|ls|cat|pwd|cp|mv|less|nano)\s+/,"").replace(/["']/g,"").replace(/\s/g,"");
function lisAbs2(s){s=net2(s);if(!s)return {vide:1};
  if(s[0]==="~")return {err:`Écris le chemin depuis la racine : il commence par ${cw("/")} (${cw("~")} veut dire ${cw("/home/etu")}).`};
  if(s[0]!=="/")return {err:`Un chemin absolu commence par ${cw("/")}, la racine.`};
  if(s.split("/").some(x=>x==="."||x===".."))return {err:`Écris le chemin le plus direct, sans ${cw(".")} ni ${cw("..")} : chaque nom, depuis la racine.`};
  return {p:"/"+s.split("/").filter(Boolean).join("/")};}
const MSG2={
  depuisRacine:ch=>`${cw(ch)} ne commence pas par ${cw("/")} : c'est un chemin relatif, il part du dossier courant, pas de la racine.`,
  depuisAcc:ch=>`${cw(ch)} ne commence ni par ${cw("/")} ni par ${cw("~")} : il part du dossier courant, pas de ton dossier d'accueil.`,
  ppCourant:()=>`${cw("..")} n'est pas le dossier courant : il remonte d'un cran, vers le dossier parent. C'est ${cw(".")} qui reste sur place.`,
  ppMoins:ch=>`Chaque ${cw("..")} compte : ${cw(ch)} en a ${nbPP2(ch)}, donc on remonte de ${nbPP2(ch)} cran${nbPP2(ch)>1?"s":""}.`,
  tildeCourant:()=>`${cw("~")} est toujours ton dossier d'accueil, ${cw("/home/etu")}, quel que soit le dossier courant.`};
const LU2=[["parti de la racine","depuisRacine"],["parti de l'accueil","depuisAcc"],[".. lu comme le dossier courant","ppCourant"],["un .. oublié","ppMoins"],["~ lu comme le dossier courant","tildeCourant"]];
function jugeAbs2(s,att,P,etape,quoi){const r=lisAbs2(s);if(r.vide)return {incomplet:"Écris le chemin absolu."};if(r.err)return {incomplet:r.err};if(r.p===att)return {ok:true};
  const non=(type,titre,msg)=>({ok:false,faux:["d"],resume:`Pas tout à fait : ce n'est pas ${quoi}.`,diag:{etape:type==="chemin faux"?etape:0,type,titre,msg}});
  for(const x of P)if(x.p===r.p)return non(x.type,"Où ça part : le point de départ ou un morceau.",x.msg);
  return non("chemin faux","Où ça part : un morceau du chemin.",`Refais le trajet morceau par morceau : chaque ${cw("..")} remonte d'un dossier, ${cw(".")} ne bouge pas, chaque nom descend dans ce dossier.`);}
const SYMP2=[["/","/"],["..",".."],[".","."],["~","~"]];

/* palier 1 : où mène un chemin */
function exoCh0(R){const T=arbre2(R),N=noeuds2(T),f=R.choix([0,1,1,1,2,3,3]);
  const cur=R.choix(N.filter(x=>x.dir&&x.P[1]==="etu"&&x.P.length>=3)).P;let cible,ch;
  if(f===0){const L=N.filter(x=>dans2(cur,x.P));if(!L.length)return null;cible=R.choix(L).P;ch=(R()<0.3?"./":"")+rel2(cur,cible);}
  else if(f===1){const L=N.filter(x=>!dans2(cur,x.P)&&!meme2(x.P,cur)&&(x.P[1]==="etu"||R()<0.12));cible=R.choix(L).P;ch=rel2(cur,cible);}
  else if(f===2){cible=R.choix(N.filter(x=>x.P[0]==="home"&&x.P.length>2)).P;ch=cible[1]==="etu"?"~/"+cible.slice(2).join("/"):"~/../"+cible.slice(1).join("/");}
  else{cible=R.choix(N.filter(x=>x.P[1]==="etu"&&x.P.length>=3&&!meme2(x.P,cur))).P;const M=rel2(cur,cible).split("/"),k=R.ent(0,M.length-1);
    const ici=marche2(T,cur,M.slice(0,k).join("/")||".").P,fils=(noeud(T,ab2(ici)).d||[]).filter(x=>x.d&&x.n!==M[k]);
    if(fils.length&&R()<0.6)M.splice(k,0,R.choix(fils).n,"..");else if(k===0)M.splice(0,0,"..",cur[cur.length-1]);else M.splice(k,0,".");
    ch=M.join("/");}
  const r=marche2(T,cur,ch),att=ab2(cible),dir=!!noeud(T,att).d;if(r.err||r.haut||r.p!==att)return null;
  const P=[];for(const [type,k] of LU2){const x=marche2(T,cur,ch,{[k]:1,fantome:1});if(x.p!==att&&!x.haut&&!P.some(y=>y.p===x.p))P.push({type,p:x.p,msg:MSG2[k](ch)});}
  if(!P.length)return null;
  const E=[{w:`${cw(ch)} ${ou2Txt(r.d0)}${r.d0==="courant"?`, ${cw(ab2(cur))}`:""}.`,why:`Un chemin absolu part de la racine ${cw("/")}, un chemin qui commence par ${cw("~")} part de ton dossier d'accueil, un chemin relatif part du dossier courant.`,pts:1},
    {w:`Morceau par morceau : ${trajet2(r.d0==="racine"?[]:r.d0==="accueil"?ACC2:cur,r)}`,why:`Chaque ${cw("..")} remonte d'un cran, ${cw(".")} reste sur place, chaque nom descend dans ce dossier.`,pts:1.5},
    {w:`<b>${cw(att)}</b>`,why:dir?`C'est ce qu'afficherait ${cw("pwd")} après ${cw("cd "+ch)}.`:"C'est le chemin absolu du fichier : il le désigne depuis n'importe quel dossier.",pts:0.5}];
  return {sig:"C0"+ab2(cur)+"|"+ch+"|"+noeuds2(noeud(T,"/home/etu")).length,q:`Tu es dans ${cw(ab2(cur))}. Quel est le chemin absolu de ${cw(ch)} ?`,corps:voitArbre2(T),texte:`depuis ${ab2(cur)} : ${ch}`,
    champs:[{k:"champ",id:"d",nom:"chemin",label:"Le chemin absolu :",ex:"par exemple /home/etu/cours",apercu:false,sym:SYMP2}],juge:rep=>jugeAbs2(rep.d,att,P,1,`le chemin de ${cw(ch)}`),etapes:E,bonne:cw(att),bonneTxt:att,repBonne:{d:att},repFausse:{d:P[0].p},nature:["descendre","remonter","avec ~","avec un détour"][f],
    ens:{fam:"ou",cur,ch,att,pieges:P.map(x=>({type:x.type,d:x.p})),bash:[vraiOu2(T,cur,ch,att)]}};}

/* palier 2 : une suite de cd, puis pwd (TD ex. 8) */
function suite2(T,dep,L,lu){lu=lu||{};let P=dep.slice();const Q=[];
  for(const ch of L){if(ch===""){if(!lu.cdSeul)P=ACC2.slice();}
    else{const r=marche2(T,P,ch,lu.fantome?Object.assign({},lu,{fantome:1}):lu);if(!r.err&&(lu.fantome||!r.fic))P=r.P;}Q.push(P.slice());}
  return Q;}
const AUTRES2=["tp3","Documents","cours2","bin","src","usi","photos","docs","old"];
function exoCh1(R){const T=arbre2(R),N=noeuds2(T),D=N.filter(x=>x.dir),Dacc=D.filter(x=>x.P[1]==="etu");
  const dep=R.choix(Dacc.filter(x=>x.P.length>=3)).P,n=R.choix([2,3,3,4]),rate=R()<0.55?R.ent(0,n-1):-1,L=[];let P=dep.slice(),seul=false;
  for(let i=0;i<n;i++){let ch;const ici=noeud(T,ab2(P)),noms=new Set((ici.d||[]).map(x=>x.n));
    if(i===rate){const fics=(ici.d||[]).filter(x=>!x.d);ch=fics.length&&R()<0.4?R.choix(fics).n:R.choix(AUTRES2.filter(x=>!noms.has(x)));}
    else{const st=R.choix(["rel","rel","rel","tilde","abs","seul","pp","racine"]);
      if(st==="seul"&&!seul&&!meme2(P,ACC2)){ch="";seul=true;}
      else if(st==="tilde")ch=R()<0.2?"~/..":"~/"+R.choix(Dacc.filter(x=>x.P.length>=3)).P.slice(2).join("/");
      else if(st==="abs")ch=ab2(R.choix(D.filter(x=>!meme2(x.P,P))).P);
      else if(st==="pp"&&P.length>=3)ch=R.choix(["..","../..","../.."]);
      else if(st==="racine"&&i<n-1)ch="/";
      else{const t=R.choix(Dacc.filter(x=>!meme2(x.P,P))).P;ch=rel2(P,t);}}
    const r=ch===""?null:marche2(T,P,ch);if(r&&r.haut)return null;
    if(i===rate&&r&&!r.err&&!r.fic)return null;
    L.push(ch);P=suite2(T,P,[ch])[0];}
  const Q=suite2(T,dep,L),att=ab2(Q[n-1]);
  const LUS=[["parti de la racine",{depuisRacine:1},"Un chemin sans / au début part du dossier où l'on est à ce moment-là, pas de la racine."],[".. lu comme le dossier courant",{ppCourant:1},MSG2.ppCourant()],["~ lu comme le dossier courant",{tildeCourant:1},MSG2.tildeCourant()],
    ["cd seul lu comme sans effet",{cdSeul:1},`${cw("cd")} tout seul n'est pas sans effet : il ramène dans ton dossier d'accueil, ${cw("/home/etu")}.`],
    ["cd raté compté comme fait",{fantome:1},`Un ${cw("cd")} qui échoue ne change pas de dossier : on reste où l'on est, et la commande suivante part de là.`]];
  const PI=[];for(const [type,lu,msg] of LUS){const QQ=suite2(T,dep,L,lu),p=ab2(QQ[n-1]);if(p!==att&&!PI.some(y=>y.p===p))PI.push({type,p,msg,etape:QQ.findIndex((x,i)=>!meme2(x,Q[i]))});}
  if(!PI.length)return null;
  const E=L.map((ch,i)=>{const de=i?Q[i-1]:dep,vers=Q[i],cmd=cw(ch===""?"cd":"cd "+ch);
    if(ch!==""&&meme2(de,vers)&&i===rate){const r=marche2(T,de,ch);return {w:`${cmd} échoue : ${r.fic?`${cw(ch)} est un fichier, pas un dossier (bash dit « Not a directory »)`:`il n'y a pas de ${cw(r.err.nom)} dans ${cw(r.err.ou)} (bash dit « No such file or directory »)`}. On reste dans ${cw(ab2(de))}.`,why:"Un cd qui échoue ne change pas de dossier : la commande suivante part du même endroit.",pts:1};}
    return {w:`${cmd} : ${cw(ab2(de))} → ${cw(ab2(vers))}`,why:ch===""?`${cw("cd")} tout seul ramène dans ton dossier d'accueil.`:ch[0]==="/"?"Un chemin qui commence par / part de la racine, quel que soit le dossier courant.":ch[0]==="~"?`${cw("~")} est ton dossier d'accueil, ${cw("/home/etu")}.`:`Un chemin relatif part du dossier où l'on est à ce moment-là : chaque ${cw("..")} remonte d'un cran.`,pts:1};});
  E.push({w:`<b>${cw(att)}</b>`,why:`${cw("pwd")} affiche le chemin absolu du dossier courant.`,pts:0.5});
  const lignes=[...L.map(ch=>ch===""?"cd":"cd "+ch),"pwd"];
  function juge(rep){const r=lisAbs2(rep.d);if(r.vide)return {incomplet:"Écris ce qu'affiche pwd."};if(r.err)return {incomplet:r.err};if(r.p===att)return {ok:true};
    const x=PI.find(y=>y.p===r.p),non=(etape,type,titre,msg)=>({ok:false,faux:["d"],resume:"Pas tout à fait : ce n'est pas le dossier où l'on arrive.",diag:{etape,type,titre,msg}});
    if(x)return non(Math.max(0,x.etape),x.type,"Où ça part : un cd.",x.msg);
    return non(0,"dossier faux","Où ça part : un cd.","Suis les cd un par un, en notant après chacun le dossier où tu es : un chemin relatif part de là, un chemin qui commence par / part de la racine.");}
  return {sig:"C1"+ab2(dep)+"|"+L.join(";")+"|"+noeuds2(noeud(T,"/home/etu")).length,q:`Tu es dans ${cw(ab2(dep))}. Tu tapes ces commandes, dans l'ordre. Qu'affiche le ${cw("pwd")} de la fin ?`,corps:bloc(lignes.join("\n"))+voitArbre2(T),texte:`depuis ${ab2(dep)} : ${lignes.join(" ; ")}`,
    champs:[{k:"champ",id:"d",nom:"pwd",label:"pwd affiche :",ex:"par exemple /home/etu",apercu:false,sym:SYMP2}],juge,etapes:E,bonne:cw(att),bonneTxt:att,repBonne:{d:att},repFausse:{d:PI[0].p},nature:rate>=0?"avec un cd qui échoue":"suite de cd",
    ens:{fam:"pwd",T,dep,L,att,pieges:PI.map(x=>({type:x.type,d:x.p})),bash:[vraiCd2(T,dep,L,att)]}};}

/* palier 3 : écrire le chemin. mode : rel (relatif), abs (absolu), til (avec ~) */
function exoCh2(R){const T=arbre2(R),N=noeuds2(T),f=R.choix([0,1,1,2,3]),mode=f<2?"rel":f===2?"abs":"til";
  const cur=R.choix(N.filter(x=>x.dir&&x.P[1]==="etu"&&x.P.length>=3)).P,compte={};N.forEach(x=>{compte[x.n]=(compte[x.n]||0)+1;});
  const L=f===0?N.filter(x=>dans2(cur,x.P)):f===1?N.filter(x=>!dans2(cur,x.P)&&!meme2(x.P,cur)&&(x.P[1]==="etu"&&x.P.length>2||R()<0.1)):N.filter(x=>compte[x.n]===1&&(x.P[1]==="etu"&&x.P.length>2||f===3&&x.P[1]==="bob"&&R()<0.3));
  if(!L.length)return null;const ci=R.choix(L),cible=ci.P,att=ab2(cible),dir=ci.dir,par=cible[cible.length-2];
  const ref=mode==="rel"?rel2(cur,cible):mode==="abs"?att:cible[1]==="etu"?"~/"+cible.slice(2).join("/"):"~/../"+cible.slice(1).join("/");
  const quoi=`${dir?"le dossier":"le fichier"} ${mode==="rel"?cw(att):`${cw(ci.n)}, rangé dans ${cw(par)}`}`;
  const cmd=dir?R.choix(["cd","ls"]):R.choix(["cat","less"]);
  const vaA=(dep,s)=>{const r=marche2(T,dep,s);return !r.err&&!r.fic||!r.err&&!dir?r.p:null;};
  const bon=s=>{const r=marche2(T,cur,s);return !r.err&&r.p===att;};
  const cas=s=>{if(mode==="rel"){if(vaA([],s)===att)return ["parti de la racine",`${cw(s)} ne commence pas par ${cw("/")} : il part du dossier courant, ${cw(ab2(cur))}, pas de la racine. Depuis la racine, on écrirait ${cw("/"+s)}.`];
      if(!meme2(cur,ACC2)&&vaA(ACC2,s)===att)return ["parti de l'accueil",`Ce chemin marcherait depuis ton dossier d'accueil, mais tu es dans ${cw(ab2(cur))} : un chemin relatif part du dossier courant.`];
      if(vaA(cur.slice(0,-1),s)===att)return ["un .. de moins",`Ce chemin part de ${cw(ab2(cur.slice(0,-1)))}, le dossier au-dessus. Tu es dans ${cw(ab2(cur))} : il faut d'abord remonter d'un cran de plus avec ${cw("..")}.`];
      if(s.slice(0,3)==="../"&&vaA(cur,s.slice(3))===att)return ["un .. de trop",`Un ${cw("..")} de trop : ${cw(s)} remonte d'un cran de plus qu'il ne faut.`];}
    else if(mode==="abs"){if(vaA(["home"],s.slice(1))===att||vaA(ACC2,s.slice(1))===att)return ["début du chemin oublié",`Un chemin absolu part de la racine et nomme chaque dossier : ${cw("/")}, puis ${cw("home")}, puis ${cw("etu")}… Ici, le début manque.`];
      if(vaA(cur,s.slice(1))===att)return ["dossier courant pris pour la racine",`${cw("/")} au début veut dire la racine, pas le dossier courant : ${cw(s)} cherche ${cw(s.split("/")[1])} directement sous ${cw("/")}.`];}
    else{if(/^~\/home(\/|$)/.test(s)&&vaA([],s.slice(1))===att)return ["accueil écrit deux fois",`${cw("~")} vaut déjà ${cw("/home/etu")} : ${cw(s)} désigne ${cw("/home/etu"+s.slice(1))}, qui n'existe pas.`];
      if(s.slice(0,2)==="~/"&&vaA(cur,s.slice(2))===att)return ["~ lu comme le dossier courant",`${cw("~")} est ton dossier d'accueil, ${cw("/home/etu")}, pas le dossier courant.`];}
    return null;};
  function juge(rep){const s=net2(rep.d);if(!s)return {incomplet:"Écris le chemin."};
    if(mode==="rel"&&s[0]==="/")return {incomplet:`C'est un chemin absolu (il commence par ${cw("/")}) : ici, écris un chemin relatif, qui part du dossier courant.`};
    if(mode==="rel"&&s[0]==="~")return {incomplet:`${cw("~")} part de ton dossier d'accueil : ici, écris un chemin relatif, qui part du dossier courant (avec ${cw("..")} pour remonter).`};
    if(mode==="abs"&&s[0]!=="/")return {incomplet:s[0]==="~"?`${cw("~")} marche aussi, mais ici écris le chemin depuis la racine : il commence par ${cw("/")}.`:`Un chemin absolu commence par ${cw("/")}, la racine.`};
    if(mode==="til"&&s[0]!=="~")return {incomplet:`Ici, écris le chemin avec ${cw("~")} au début (${cw("~")} veut dire ${cw("/home/etu")}).`};
    if(bon(s))return {ok:true};
    const non=(etape,type,msg)=>({ok:false,faux:["d"],resume:`Pas tout à fait : ce chemin ne mène pas à ${quoi}.`,diag:{etape,type,titre:"Où ça part : le chemin.",msg}});
    if(mode==="til"&&/^~[^/]/.test(s))return non(0,"~nom",`${cw(s.split("/")[0])} veut dire le dossier d'accueil de l'utilisateur ${esc(s.split("/")[0].slice(1))} (comme ${cw("~toto")} au TD) : écris ${cw("~/")}, puis le chemin.`);
    const k=cas(s);if(k)return non(0,k[0],k[1]);
    const r=marche2(T,cur,s);if(r.err)return non(1,"nom qui n'existe pas",r.err.fic?`${cw(r.err.nom)} est un fichier : un chemin ne peut pas passer à travers.`:`En suivant ton chemin, on arrive dans ${cw(r.err.ou)}, qui n'a pas de ${cw(r.err.nom)}.`);
    return non(1,"mauvais chemin",`Ton chemin mène à ${cw(r.p)}${r.fic&&dir?", un fichier":""}.`);}
  const PI=[];const ajoute=s=>{if(!s||bon(s)||PI.some(x=>x.d===s))return;const k=mode==="til"&&/^~[^/]/.test(s)?["~nom"]:cas(s);if(k)PI.push({type:k[0],d:s});};
  if(mode==="rel"){ajoute(cible.join("/"));ajoute(cible.slice(2).join("/"));ajoute(rel2(cur.slice(0,-1),cible));ajoute("../"+ref);}
  else if(mode==="abs"){ajoute("/"+cible.slice(1).join("/"));ajoute("/"+cible.slice(2).join("/"));if(dans2(cur,cible))ajoute("/"+rel2(cur,cible));}
  else{ajoute("~/"+cible.join("/"));if(dans2(cur,cible))ajoute("~/"+rel2(cur,cible));if(cible[1]==="etu")ajoute("~"+cible.slice(2).join("/"));}
  if(!PI.length)return null;
  const alt=[...(mode==="rel"&&ref!=="."?["./"+ref]:[]),...(dir?[ref+"/"]:[]),...(mode==="rel"?["../"+cur[cur.length-1]+"/"+ref]:mode==="til"?["~/./"+ref.slice(2)]:[])].filter(bon);
  const r=marche2(T,cur,ref);
  let k0=0;while(k0<cur.length&&k0<cible.length&&cur[k0]===cible[k0])k0++;
  const E=[mode==="rel"?{w:`On part du dossier courant, ${cw(ab2(cur))}. ${dans2(cur,cible)?`${cw(att)} est dedans : on descend, sans ${cw("..")}.`:`Le premier dossier qui contient à la fois ${cw(ab2(cur))} et ${cw(att)} est ${cw(ab2(cur.slice(0,k0)))} : on y remonte avec ${nbPP2(ref)} fois ${cw("..")}.`}`,why:"Un chemin relatif ne commence ni par / ni par ~ : il part du dossier où tu es.",pts:1.5}
      :mode==="abs"?{w:`Sur l'arbre, ${cw(ci.n)} est dans ${et(cible.slice(0,-1).map(c))}, en partant de la racine.`,why:"Un chemin absolu part de la racine / et nomme chaque dossier jusqu'à la cible : il marche depuis n'importe quel dossier.",pts:1.5}
      :{w:`${cw("~")} remplace ${cw("/home/etu")}, ton dossier d'accueil${cible[1]==="etu"?"":` ; ${cw(ab2(cible))} n'est pas dedans : on remonte d'abord dans ${cw("/home")} avec ${cw("~/..")}`}.`,why:`${cw("~/")} au début : on part de l'accueil, puis on nomme les dossiers un par un.`,pts:1.5},
    {w:`Morceau par morceau : ${trajet2(mode==="rel"?cur:mode==="abs"?[]:ACC2,r)}`,why:`Chaque nom descend d'un cran${nbPP2(ref)?`, chaque ${cw("..")} remonte d'un cran`:""}.`,pts:1},
    {w:`<b>${cw(ref)}</b>`,why:`La commande : ${cw(cmd+" "+ref)}.${alt.length?` On peut aussi écrire ${cw(alt[0])}.`:""}`,pts:0.5}];
  const qq=mode==="rel"?"un chemin relatif":mode==="abs"?"un chemin absolu":`un chemin qui commence par ${cw("~")}`;
  const bash=[ref,...alt,...PI.map(x=>x.d)].map(s=>{const x=marche2(T,cur,s);return x.haut?null:vraiOu2(T,cur,s,x.err||x.fic&&s.endsWith("/")?"ERR":x.p);}).filter(Boolean);
  return {sig:"C2"+mode+ab2(cur)+"|"+att+"|"+noeuds2(noeud(T,"/home/etu")).length,q:`Tu es dans ${cw(ab2(cur))}. Pour ${cw(cmd+" …")}, écris ${qq} vers ${quoi}.`,corps:voitArbre2(T),texte:`${mode} depuis ${ab2(cur)} vers ${att}`,
    champs:[{k:"champ",id:"d",nom:"chemin",label:"Le chemin :",ex:mode==="rel"?"par exemple ../src":mode==="abs"?"par exemple /home/etu/cours":"par exemple ~/cours",apercu:false,sym:SYMP2}],juge,etapes:E,bonne:cw(ref),bonneTxt:ref,repBonne:{d:ref},repFausse:{d:PI[0].d},nature:{rel:f===0?"relatif, descendre":"relatif, avec ..",abs:"absolu",til:"avec ~"}[mode],
    ens:{fam:"ecrire",mode,cur,cible,ref,alt,pieges:PI,bash}};}

/* palier 4 : le petit shell. Les chemins partent de /home/etu/projet ; une commande ratée écrit son erreur et la suite continue, comme dans bash */
const clone2=t=>t.d?{n:t.n,d:t.d.map(clone2)}:{n:t.n};
function ou2(T,s){let P;if(s[0]==="/"){P=[];s=s.slice(1);}else if(s==="~"||s.slice(0,2)==="~/"){P=ACC2.slice();s=s.slice(2);}else P=COUR2.slice();
  const M=s.split("/"),barre=M.length>1&&M[M.length-1]==="",Q=M.filter(x=>x&&x!==".");
  for(let i=0;i<Q.length;i++){const m=Q[i];if(m===".."){if(P.length)P.pop();continue;}
    const t=noeud(T,ab2(P)),y=t.d.find(z=>z.n===m);
    if(i===Q.length-1){if(barre&&y&&!y.d)return {err:"fichier",nom:ab2(P)+"/"+m};return {par:t,nom:m,x:y||null,P:[...P,m],barre};}
    if(!y)return {err:"absent",nom:ab2([...P,m])};if(!y.d)return {err:"fichier",nom:ab2([...P,m])};P.push(m);}
  return {par:P.length?noeud(T,ab2(P.slice(0,-1))):null,nom:P[P.length-1],x:noeud(T,ab2(P)),P,barre,point:true};}
const vu2=P=>{const Q=P.join("/"),C=COUR2.join("/")+"/";return Q.startsWith(C)?Q.slice(C.length):"/"+Q;};
function joue2(T0,src){const T=clone2(T0),E=[];
  const pb=(l,type,msg)=>{E.push({l,type,msg});return false;};
  const motif=a=>{if(!/[*?[]/.test(a))return [a];const j=a.lastIndexOf("/"),dd=j<0?"":a.slice(0,j+1),o=ou2(T,(dd||".")+"");if(o.err||!o.x||!o.x.d)return [a];
    const re=motifRe(a.slice(j+1)),L=o.x.d.map(x=>x.n).filter(n=>n[0]!=="."&&re.test(n)).sort();return L.length?L.map(n=>dd+n):[a];};
  const ote=x=>{const t=noeud(T,ab2(x.P.slice(0,-1)));t.d.splice(t.d.indexOf(x.x),1);};
  const sousDe=(a,b)=>b.length>=a.length&&a.every((x,i)=>x===b[i]);
  const fondre=(dst,src)=>{for(const y of src.d){const z=dst.d.find(w=>w.n===y.n);if(z&&z.d&&y.d)fondre(z,y);else{if(z)dst.d.splice(dst.d.indexOf(z),1);dst.d.push(clone2(y));}}};
  function une(l){const W=l.replace(/["']/g,"").split(" ").filter(Boolean),cmd=W[0];let O="";const A=[];
    for(const w of W.slice(1))if(/^-[a-zA-Z]+$/.test(w)&&!A.length)O+=w.slice(1);else A.push(...motif(w));
    if(cmd==="cd")throw {cd:1};
    if(["ls","pwd","tree","echo","cat"].includes(cmd))return true;
    if(!["mkdir","rmdir","touch","cp","mv","rm"].includes(cmd))throw {inconnu:`Le site connaît ici mkdir, rmdir, touch, cp, mv et rm${cmd?`, pas ${esc(cmd)}`:""}.`};
    const opt={mkdir:"p",rm:"rRf",cp:"rR",mv:"",rmdir:"",touch:""}[cmd];for(const ch of O)if(!opt.includes(ch))throw {inconnu:`Le site ne connaît pas l'option -${esc(ch)} de ${cmd}.`};
    const r=/[rR]/.test(O),force=O.includes("f");
    if(!A.length)return pb(l,"argument manquant",`${cw(l)} : il manque le nom du fichier ou du dossier.`);
    let ok=true;
    if(cmd==="mkdir"||cmd==="rmdir"||cmd==="touch"||cmd==="rm"){for(const a of A){
      if(cmd==="mkdir"&&O.includes("p")){let P=a[0]==="/"?[]:a==="~"||a.slice(0,2)==="~/"?ACC2.slice():COUR2.slice();
        for(const m of a.replace(/^~?\/?/,a[0]==="~"||a[0]==="/"?"":"").split("/").filter(x=>x&&x!==".")){if(m===".."){P.pop();continue;}const t=noeud(T,ab2(P));const y=t.d.find(z=>z.n===m);
          if(y&&!y.d){ok=pb(l,"existe déjà",`${cw(l)} échoue : ${cw(m)} est un fichier.`);break;}if(!y)t.d.push(dossier(m,[]));P.push(m);}continue;}
      const o=ou2(T,a);
      if(o.err){ok=cmd==="rm"&&force?ok:pb(l,cmd==="mkdir"?"mkdir avant le parent":"nom qui n'existe pas",cmd==="mkdir"?`${cw(l)} échoue : ${cw(vu2(o.nom.slice(1).split("/")))} n'existe pas encore. Crée d'abord le dossier parent (ou écris ${cw("mkdir -p")}).`:`${cw(l)} échoue : ${cw(vu2(o.nom.slice(1).split("/")))} ${o.err==="fichier"?"est un fichier, pas un dossier":"n'existe pas"}.`);continue;}
      if(cmd==="mkdir"){if(o.x)ok=pb(l,"existe déjà",`${cw(l)} échoue : ${cw(a)} existe déjà.`);else o.par.d.push(dossier(o.nom,[]));continue;}
      if(cmd==="touch"){if(!o.x)o.par.d.push(fichier(o.nom));continue;}
      if(!o.x){if(!(cmd==="rm"&&force))ok=pb(l,"nom qui n'existe pas",`${cw(l)} échoue : ${cw(a)} n'existe pas.`);continue;}
      if(o.point||sousDe(o.P,COUR2)){ok=pb(l,"commande refusée",`${cw(l)} échoue : ${cw(a)} est le dossier courant ou un dossier qui le contient.`);continue;}
      if(cmd==="rmdir"){if(!o.x.d)ok=pb(l,"rmdir sur un fichier",`${cw(l)} échoue : ${cw(a)} est un fichier, et rmdir ne supprime que des dossiers. Pour un fichier, c'est ${cw("rm")}.`);
        else if(o.x.d.length)ok=pb(l,"rmdir sur un dossier plein",`${cw(l)} échoue : ${cw(a)} n'est pas vide, et rmdir ne supprime qu'un dossier vide. Pour un dossier et tout son contenu : ${cw("rm -r "+a)}.`);else ote(o);continue;}
      if(o.x.d&&!r){ok=pb(l,"rm sans -r",`${cw(l)} échoue : ${cw(a)} est un dossier, et rm sans -r refuse les dossiers. Écris ${cw("rm -r "+a)}${o.x.d.length?"":` (ou ${cw("rmdir "+a)}, puisqu'il est vide)`}.`);continue;}
      ote(o);}
      return ok;}
    if(A.length<2)return pb(l,"destination manquante",`${cw(l)} : il manque la destination (${cmd} source destination).`);
    const D=ou2(T,A[A.length-1]);if(D.err)return pb(l,"nom qui n'existe pas",`${cw(l)} échoue : ${cw(vu2(D.nom.slice(1).split("/")))} ${D.err==="fichier"?"est un fichier, pas un dossier":"n'existe pas"}.`);
    const dansD=!!(D.x&&D.x.d);if(A.length>2&&!dansD)return pb(l,"destination absente",`${cw(l)} échoue : avec plusieurs fichiers, la destination doit être un dossier qui existe.`);
    for(const s of A.slice(0,-1)){const S=ou2(T,s);if(S.err||!S.x){ok=pb(l,"nom qui n'existe pas",`${cw(l)} échoue : ${cw(s)} n'existe pas.`);continue;}
      if(cmd==="cp"&&S.x.d&&!r){ok=pb(l,"cp sans -r",`${cw(l)} échoue : ${cw(s)} est un dossier, et cp sans -r ne copie que des fichiers. Écris ${cw("cp -r")}.`);continue;}
      const par=dansD?D.x:D.par,nom=dansD?S.x.n:D.nom,Pc=dansD?[...D.P,S.x.n]:D.P;
      if(S.x.d&&sousDe(S.P,Pc)){ok=pb(l,"commande refusée",`${cw(l)} échoue : on ne peut pas mettre ${cw(s)} dans lui-même.`);continue;}
      if(sousDe(S.P,COUR2)){ok=pb(l,"commande refusée",`${cw(l)} échoue : ${cw(s)} contient le dossier courant.`);continue;}
      const y=par.d.find(z=>z.n===nom);
      if(y===S.x){ok=pb(l,"commande refusée",`${cw(l)} échoue : la source et la destination sont le même fichier.`);continue;}
      if(!dansD&&D.barre&&!S.x.d){ok=pb(l,"destination absente",`${cw(l)} échoue : ${cw(A[A.length-1])} n'est pas un dossier.`);continue;}
      if(y&&y.d&&!S.x.d){ok=pb(l,"commande refusée",`${cw(l)} échoue : ${cw(vu2(Pc))} est un dossier, on ne peut pas le remplacer par un fichier.`);continue;}
      if(y&&!y.d&&S.x.d){ok=pb(l,"commande refusée",`${cw(l)} échoue : ${cw(vu2(Pc))} est un fichier, on ne peut pas le remplacer par un dossier.`);continue;}
      if(y&&y.d&&S.x.d){if(cmd==="cp"){fondre(y,S.x);continue;}if(y.d.length){ok=pb(l,"commande refusée",`${cw(l)} échoue : ${cw(vu2(Pc))} existe déjà et n'est pas vide.`);continue;}}
      if(y)par.d.splice(par.d.indexOf(y),1);
      if(cmd==="mv")ote(S);const z=cmd==="cp"?clone2(S.x):S.x;z.n=nom;par.d.push(z);}
    return ok;}
  for(const l0 of String(src).split("\n")){for(const seg of l0.split(";")){let suite=true;for(const l1 of seg.split("&&")){const l=propre(l1);if(!l||l[0]==="#"||!suite)continue;
    try{suite=une(l);}catch(x){if(x.cd)return {cd:1};if(x.inconnu)return {inconnu:x.inconnu};throw x;}}}}
  return {T,E};}
const liste2=T=>{const L=[];const va=(t,q)=>{for(const e of t.d){if(e.d){L.push(q+e.n+"/");va(e,q+e.n+"/");}else L.push(q+e.n);}};va(noeud(T,ab2(COUR2)),"");return L.sort();};
const vraiCmd2=(T,src)=>({arbo:T,cmd:src,args:[],nom:"./ranger.sh",script:true,etat:1,abs:["#fichiers",...liste2(joue2(T,src).T)]});
const RANGE2=[["USI",["Script","Fable"]],["cours",["usi","algo"]],["rangement",["textes","scripts"]],["S1",["tp","td"]],["archives",["2024","2025"]]];
const FICP2=["lsparent.sh","fable.txt","notes.txt","tp1.py","rapport.pdf","exo.c","liste.txt","photo.jpg"];
function exoCh3(R){const F=R.mel(FICP2).slice(0,4),[A,BC]=R.choix(RANGE2),pl=R.choix(["vieux","tp0","brouillons"]),plF=R.mel(["a.txt","b.txt","old.py","essai.c"]).slice(0,2),vide=R()<0.5?R.choix(["tmp","vide","test"]):null;
  const T=dossier("",[dossier("home",[dossier("etu",[dossier("projet",[...F.map(fichier),dossier(pl,plF.map(fichier)),...(vide?[dossier(vide,[])]:[])])])])]);
  const ops=[],avecA=R()<0.75;
  if(avecA){const subs=R.mel(BC).slice(0,R.ent(1,2)),mk=`mkdir ${subs.map(s=>A+"/"+s).join(" ")}`,mvs=subs.map((s,i)=>`mv ${F[i]} ${A}/${s}`);
    ops.push({k:"A",cmds:[`mkdir ${A}`,mk,...mvs],con:`Crée le dossier ${cw(A)} et, dedans, ${et(subs.map(c))} ; range ${et(subs.map((s,i)=>`${cw(F[i])} dans ${cw(A+"/"+s)}`))}, sans ${subs.length>1?"les":"le"} recopier.`,
      why:`On crée d'abord le parent : sans ${cw("-p")}, ${cw("mkdir")} ne crée pas deux niveaux d'un coup. Puis ${cw("mv")} déplace sans recopier : le fichier change seulement de dossier.`,pts:2,
      pi:[["mkdir avant le parent",[mk,`mkdir ${A}`,...mvs]],["cp au lieu de mv",[`mkdir ${A}`,mk,...mvs.map(x=>x.replace(/^mv/,"cp"))]],["dossier pas créé avant mv",[`mkdir ${A}`,...mvs]]],
      alt:[[`mkdir -p ${subs.map(s=>A+"/"+s).join(" ")}`,...mvs],[`mkdir ${A}`,mk,...subs.map((s,i)=>`mv ./${F[i]} ~/projet/${A}/${s}/`)]],faits:subs.map((s,i)=>`${A}/${s}/${F[i]}`).concat(subs.map((s,i)=>"!"+F[i]))});}
  const reste=F.slice(avecA?2:0),autres=R.mel(["B","C","D","E"]).slice(0,R.ent(avecA?1:2,2));
  if(!avecA&&!autres.includes("B"))autres[0]="B";
  autres.sort();
  for(const o of autres){
    if(o==="B"){const X=avecA?A:pl,Bk=R.choix(["Backup","sauvegarde","copie"]);
      ops.push({k:"B",cmds:[`mkdir ${Bk}`,`cp -r ${X} ${Bk}`],con:`Crée un dossier ${cw(Bk)} et mets-y une copie complète de ${cw(X)}${X===pl&&autres.includes("C")?"":` (${cw(X)} reste en place)`}.`,why:`${cw("cp -r")} copie un dossier et tout son contenu. Comme ${cw(Bk)} existe, la copie va dedans : ${cw(Bk+"/"+X)}.`,pts:1.5,Bk,X,
        pi:[["cp sans -r",[`mkdir ${Bk}`,`cp ${X} ${Bk}`]],["dossier pas créé avant cp -r",[`cp -r ${X} ${Bk}`]]],alt:[[`mkdir ${Bk}`,`cp -R ${X} ${Bk}/`]],faits:[`${Bk}/${X}/`]});}
    else if(o==="C")ops.push({k:"C",cmds:[`rm -r ${pl}`],con:`Supprime le dossier ${cw(pl)} et tout ce qu'il contient.`,why:`${cw("rmdir")} refuse un dossier qui n'est pas vide, et ${cw("rm")} sans ${cw("-r")} refuse un dossier : il faut ${cw("rm -r")}, sans corbeille.`,pts:1,
      pi:[["rmdir sur un dossier plein",[`rmdir ${pl}`]],["rm sans -r",[`rm ${pl}`]]],alt:[[`rm -rf ${pl}`]],faits:["!"+pl+"/"]});
    else if(o==="D"&&vide)ops.push({k:"D",cmds:[`rmdir ${vide}`],con:`Supprime le dossier vide ${cw(vide)}.`,why:`${cw("rmdir")} supprime un dossier vide (${cw("rm -r")} marche aussi).`,pts:1,pi:[["rm sans -r",[`rm ${vide}`]]],alt:[[`rm -r ${vide}`]],faits:["!"+vide+"/"]});
    else if(o==="D"&&reste.length>1)ops.push({k:"D",cmds:[`rm ${reste[1]}`],con:`Supprime le fichier ${cw(reste[1])}.`,why:`${cw("rm")} supprime un fichier, sans corbeille.`,pts:1,pi:[["rmdir sur un fichier",[`rmdir ${reste[1]}`]]],alt:[[`rm ./${reste[1]}`]],faits:["!"+reste[1]]});
    else if(o==="E"){const f=reste[0],nv=f.replace(".","-v2.");ops.push({k:"E",cmds:[`mv ${f} ${nv}`],con:`Renomme ${cw(f)} en ${cw(nv)}.`,why:`${cw("mv")} renomme quand la destination n'est pas un dossier qui existe.`,pts:1,pi:[["cp au lieu de mv",[`cp ${f} ${nv}`]]],alt:[[`mv ./${f} ~/projet/${nv}`]],faits:[nv,"!"+f]});}}
  if(ops.length<2)return null;
  const ref=ops.flatMap(o=>o.cmds).join("\n"),J=joue2(T,ref);if(J.E.length)return null;const cible=liste2(J.T),avant=liste2(T);
  const avec=(i,L)=>ops.map((o,j)=>j===i?L:o.cmds).flat().join("\n");
  const ETAPE={};ops.forEach((o,i)=>o.pi.forEach(([t])=>{if(!(t in ETAPE))ETAPE[t]=i;}));
  const opB=ops.find(o=>o.k==="B");
  function diag(r,L){if(r.E.length){const e=r.E[0];return {etape:ETAPE[e.type]!==undefined?ETAPE[e.type]:0,type:e.type,titre:"une commande échoue.",msg:e.msg};}
    if(opB&&L.includes(opB.Bk+"/")&&!L.includes(opB.Bk+"/"+opB.X+"/")&&cible.includes(opB.Bk+"/"+opB.X+"/"))return {etape:ETAPE["dossier pas créé avant cp -r"]||0,type:"dossier pas créé avant cp -r",titre:"une copie.",msg:`${cw(opB.Bk)} n'existait pas : ${cw("cp -r "+opB.X+" "+opB.Bk)} a fait une copie de ${cw(opB.X)} nommée ${cw(opB.Bk)}, au lieu de la ranger dedans. Crée d'abord ${cw(opB.Bk)} avec ${cw("mkdir")}.`};
    const f=L.find(x=>!x.endsWith("/")&&cible.includes(x+"/"));
    if(f)return {etape:ETAPE["dossier pas créé avant mv"]||0,type:"dossier pas créé avant mv",titre:"un déplacement.",msg:`${cw(f)} est devenu un fichier : quand la destination de ${cw("mv")} n'existe pas, ${cw("mv")} renomme au lieu de ranger. Crée d'abord le dossier ${cw(f)}.`};
    const g=L.find(x=>avant.includes(x)&&!cible.includes(x)&&!x.endsWith("/"));
    if(g&&L.length>cible.length)return {etape:ETAPE["cp au lieu de mv"]||0,type:"cp au lieu de mv",titre:"un déplacement.",msg:`${cw(g)} est encore là : ${cw("cp")} recopie le fichier et garde l'original, ${cw("mv")} le déplace ou le renomme.`};
    const m=cible.find(x=>!L.includes(x)),t=L.find(x=>!cible.includes(x));
    return {etape:0,type:"arbre différent",titre:"le résultat.",msg:m?`À la fin, il manque ${cw(m)}.`:`À la fin, ${cw(t)} est en trop.`};}
  function juge(rep){const src=rep.c==null?"":String(rep.c);if(!src.trim())return {incomplet:"Écris les commandes, une par ligne."};
    const r=joue2(T,src);if(r.cd)return {incomplet:`L'énoncé demande de ne pas changer de dossier : pas de ${cw("cd")}, écris les chemins depuis ${cw("projet")} (par exemple ${cw("mv notes.txt docs")}).`};if(r.inconnu)return {incomplet:r.inconnu};
    const L=liste2(r.T);if(L.join("|")===cible.join("|"))return {ok:true};
    const d=diag(r,L);return {ok:false,faux:["c"],resume:"Pas tout à fait : à la fin, le dossier n'est pas celui qu'on veut.",diag:{etape:d.etape,type:d.type,titre:"Où ça part : "+d.titre,msg:d.msg}};}
  const PI=[];ops.forEach((o,i)=>o.pi.forEach(([type,L])=>{const s=avec(i,L);if(!PI.some(x=>x.c===s))PI.push({type,c:s});}));
  const ALT=ops.flatMap((o,i)=>o.alt.map(L=>avec(i,L)));
  const vers=(i)=>dessin(noeud(joue2(T,ops.slice(0,i+1).flatMap(o=>o.cmds).join("\n")).T,ab2(COUR2)),"projet");
  const E=[...ops.map(o=>({w:o.cmds.map(c).join("<br>"),why:o.why,pts:o.pts})),{w:`À la fin, ${cw("ls -R")} montre :${bloc(vers(ops.length-1))}`,why:"On vérifie : chaque fichier est à sa place, sans copie en trop ni oubli.",pts:0.5}];
  return {sig:"C3"+avant.join(",")+"|"+ref,q:`Tu es dans ${cw("/home/etu/projet")} et tu n'en sors pas : pas de ${cw("cd")}. Écris les commandes, une par ligne, pour faire ce qui est demandé.`,
    corps:`<p>Le dossier courant, avant :</p>${bloc(dessin(noeud(T,ab2(COUR2)),"projet"))}<p>Ce qu'il faut faire, dans l'ordre :</p><ol>${ops.map(o=>`<li>${o.con}</li>`).join("")}</ol><p>Après, il doit être comme ceci :</p>${bloc(vers(ops.length-1))}`,
    texte:ops.map(o=>o.k).join("")+" : "+ref.replace(/\n/g," ; "),
    champs:[{k:"code",id:"c",nom:"commandes",label:"Les commandes :",lignes:ref.split("\n").length+1,ex:"mkdir …",sym:[["mkdir ","mkdir "],["mv ","mv "],["cp -r ","cp -r "],["rm ","rm "],["rmdir ","rmdir "],["/","/"],["..",".."]]}],
    juge,etapes:E,bonne:ref.split("\n").map(c).join("<br>"),bonneTxt:ref.replace(/\n/g," ; "),repBonne:{c:ref},repFausse:{c:PI[0].c},nature:"ranger : "+ops.map(o=>o.k).join(""),
    ens:{fam:"cmd",T,ref,cible,avant,faits:ops.flatMap(o=>o.faits),alt:ALT,pieges:PI,bash:[ref,...ALT,...PI.map(x=>x.c)].map(s=>vraiCmd2(T,s))}};}
const tireCh=k=>R=>{for(;;){const e=[exoCh0,exoCh1,exoCh2,exoCh3][k](R);if(e)return e;}};

/* ---------- US3 : inodes et liens. Des noms qui mènent à un inode (compteur de liens, contenu) ou à un chemin (lien symbolique), rejoués commande par commande ; la taille maximale par les blocs directs et indirects ; la cohérence des tables du TD ---------- */
const grille3=(tete,rows)=>`<div style="overflow-x:auto"><table class="tbl tr"><thead><tr>${tete.map(v=>`<th>${v}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const nl3=n=>n+(n>1?" liens":" lien");
const SUP3="⁰¹²³⁴⁵⁶⁷⁸⁹",pw3=e=>"2"+String(e).split("").map(d=>SUP3[d]).join("");
/* un nombre tapé : 1024, 2^10, 2¹⁰, 4 Tio, 4 Ti octets, 4 Mo, 16 fois, ×16 */
function lisN3(s){s=propre(String(s==null?"":s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,m=>"^"+[...m].map(ch=>SUP3.indexOf(ch)).join(""))).toLowerCase();
  s=s.replace(/environ|à peu près|a peu pres|multipliée par|multipliee par|divisée par|divisee par|fois|bits?\b|blocs?\b|adresses?\b|liens?\b|sous-répertoires?|[≈~]/g,"").replace(/\*\*/g,"^").replace(/\s/g,"").replace(/^[×x*]/,"").replace(/,/g,".");
  if(!s)return {vide:1};let M;
  if((M=/^2\^(\d+)(o|b|octets?)?$/.exec(s)))return {v:2**+M[1]};
  if((M=/^(\d+)[*×x.]2\^(\d+)(o|b|octets?)?$/.exec(s)))return {v:+M[1]*2**+M[2]};
  if((M=/^(\d+(?:\.\d+)?)([kmgtpe])(i)?(o|b|octets?)?$/.exec(s)))return {v:+M[1]*2**(10*("kmgtpe".indexOf(M[2])+1))};
  if((M=/^(\d+)(o|b|octets?)?$/.exec(s)))return {v:+M[1]};
  return {err:"Écris un nombre : par exemple 1024, 2^10, 4 Mio ou 4 Tio."};}
function jugeN3(s,acc,P,id,etape,quoi){const r=lisN3(s);if(r.vide)return {incomplet:"Écris un nombre."};if(r.err)return {incomplet:r.err};
  if(acc.includes(r.v))return {ok:true};
  const non=(type,titre,msg,et)=>({ok:false,faux:[id],resume:`Pas tout à fait : ce n'est pas ${quoi}.`,diag:{etape:et,type,titre,msg}});
  for(const x of P)if(x.v===r.v)return non(x.type,x.titre||"Où ça part : ce qu'on compte.",x.msg,x.etape||0);
  return non("compte faux","Où ça part : le compte.","Refais le compte avec la correction, étape par étape.",etape);}
const unique3=(P,acc)=>{const L=[];for(const x of P)if(x.v!==undefined&&!acc.includes(x.v)&&!L.some(y=>y.v===x.v))L.push(x);return L;};

/* palier 1 : le nombre de liens d'un répertoire */
const SOUS3=["tp1","tp2","td","src","tests","doc","old","images","notes","exos"],FIC3=["main.c","notes.txt","rapport.pdf","script.sh","data.csv","README"];
const vraiNb3=(T,cmd,att)=>({arbo:arboDe([T]),cmd,args:[],nom:"./liens.sh",script:true,abs:[String(att)]});
function exoIn0(R){const f=R.choix([0,0,0,1,1,2,2]);
  if(f<2){const X=R.choix(["tp","cours","usi","photos","rendu"]),s=R.ent(0,4),nf=R.ent(f?0:1,3),noms=R.mel(SOUS3).slice(0,s),fics=R.mel(FIC3).slice(0,nf);let pe=0;
    const sous=noms.map(n=>{const k=R()<0.4?R.ent(1,2):0;pe+=k;return dossier(n,[...[...Array(k)].map((_,j)=>dossier(["v1","v2"][j],[fichier("a.txt")])),...(R()<0.5?[fichier(R.choix(["exo.py","cr.txt","img.png"]))]:[])]);});
    const T=dossier(X,[...sous,...fics.map(fichier)]),k=2+s,bash=[vraiNb3(T,"stat -c %h "+X,k)];
    const deux=`sa propre entrée ${c(".")} et son nom ${c(X)} dans le répertoire parent`;
    if(f===0){const P=unique3([
        {type:"« . » ou le nom oublié",v:1+s,msg:`Un répertoire a déjà 2 liens à lui seul : ${deux}. Puis 1 de plus par sous-répertoire.`},
        {type:"sous-répertoires oubliés",v:2,msg:`Chaque sous-répertoire a une entrée ${c("..")} qui désigne ${c(X)} : un lien de plus par sous-répertoire.`,etape:1},
        {type:"fichiers comptés",v:2+s+nf,msg:`Un fichier n'a pas d'entrée ${c("..")} : il ne fait pas de lien vers le répertoire qui le contient. Seuls les sous-répertoires comptent.`,etape:1},
        {type:"sous-sous-répertoires comptés",v:2+s+pe,msg:`Seuls les sous-répertoires directs comptent : le ${c("..")} d'un sous-sous-répertoire désigne son propre parent, pas ${c(X)}.`,etape:1},
        {type:"seulement les sous-répertoires",v:s,msg:`Il faut ajouter les 2 liens de départ : ${deux}.`}],[k]);
      if(!P.length)return null;
      const E=[{w:`${c(X)} est désigné par ${deux} : 2 liens.`,why:"Même vide, un répertoire a ces deux liens.",pts:1},
        {w:`Ses sous-répertoires directs : ${s?et(noms.map(c)):"aucun"}. ${s?`Chacun a une entrée ${c("..")} qui désigne ${c(X)} : ${nl3(s)} de plus.`:"Aucun lien de plus."}`,why:`Les fichiers n'ont pas d'entrée ${c("..")}, et le ${c("..")} d'un sous-sous-répertoire désigne son propre parent.`,pts:1.5},
        {w:`<b>2 + ${s} = ${k}</b>`,why:`C'est le nombre que ${c("ls -ld "+X)} affiche en 2e colonne.`,pts:0.5}];
      return {sig:"I0"+dessin(T,X),q:`Voici le répertoire ${c(X)}, avec tout ce qu'il contient. Combien de liens a-t-il : quel nombre ${c("ls -ld "+X)} affiche-t-il en 2e colonne ?`,corps:bloc(dessin(T,X)),texte:`liens de ${X} : `+dessin(T,X).replace(/\n/g," "),
        champs:[{k:"champ",id:"n",nom:"liens",label:"Le nombre de liens :",ex:"par exemple 3",apercu:false,sym:[]}],juge:rep=>jugeN3(rep.n,[k],P,"n",1,`le nombre de liens de ${c(X)}`),etapes:E,bonne:String(k),bonneTxt:String(k),repBonne:{n:String(k)},repFausse:{n:String(P[0].v)},nature:"liens d'un répertoire",
        ens:{fam:"nbl",T,X,att:k,pieges:P.map(x=>({type:x.type,n:String(x.v)})),bash}};}
    const P=unique3([{type:"compteur pris pour les sous-répertoires",v:k,msg:`Les 2 premiers liens ne viennent pas de sous-répertoires : ${deux}. Il faut les retirer.`},
      {type:"un seul des deux premiers liens retiré",v:k-1,msg:`Il y a 2 liens qui ne viennent pas des sous-répertoires : ${deux}.`}],[s]);
    const lsl=`drwxr-xr-x ${k} etu etu 4096 nov. ${R.ent(10,19)} ${R.ent(10,18)}:${String(R.ent(10,59))} ${X}`;
    const E=[{w:`Sur les ${nl3(k)}, 2 viennent de ${c(X)} lui-même : ${deux}.`,why:"Tout répertoire a ces deux liens, même vide.",pts:1.5},
      {w:`Les autres viennent des entrées ${c("..")} de ses sous-répertoires : ${k} − 2 = ${s}.`,why:`Chaque sous-répertoire a une entrée ${c("..")} qui désigne son parent ; les fichiers n'en ont pas.`,pts:1},
      {w:`<b>${s} sous-répertoire${s>1?"s":""}</b>`,why:`Les fichiers ne comptent pas : le nombre de liens ne dit rien de leur nombre.`,pts:0.5}];
    return {sig:"I1"+X+k,q:`${c("ls -ld "+X)} affiche cette ligne. Combien ${c(X)} a-t-il de sous-répertoires directs ?`,corps:bloc(lsl),texte:lsl+" : combien de sous-répertoires ?",
      champs:[{k:"champ",id:"n",nom:"sous-répertoires",label:"Le nombre de sous-répertoires :",ex:"par exemple 2",apercu:false,sym:[]}],juge:rep=>jugeN3(rep.n,[s],P,"n",1,`le nombre de sous-répertoires de ${c(X)}`),etapes:E,bonne:String(s),bonneTxt:String(s),repBonne:{n:String(s)},repFausse:{n:String(P[0].v)},nature:"sous-répertoires d'après les liens",
      ens:{fam:"sousrep",X,k,att:s,pieges:P.map(x=>({type:x.type,n:String(x.v)})),bash}};}
  /* le tableau des liens du TD, exercice 22 */
  const nos=R.mel([148,272,2405,256,498,311,1207,736,905,4410]).slice(0,5);let ks;
  for(;;){ks=nos.map(()=>R.choix([1,1,2,2,3,4,5]));if(ks.includes(1)&&ks.includes(2)&&ks.some(x=>x>2))break;}
  const g=R.choix([0,1]),sel=t=>nos.filter((n,i)=>t(ks[i])).map(String),att=g?sel(x=>x>=2):sel(x=>x===1);
  const P=(g?[{type:"répertoire vide oublié",g:sel(x=>x>=3),msg:"Un répertoire vide a exactement 2 liens : son nom dans le parent et son « . ». Avec 2 liens, ce peut donc être un répertoire."},
      {type:"tout coché",g:nos.map(String),msg:"Un répertoire a toujours au moins 2 liens : avec 1 seul lien, c'est forcément un fichier."},
      {type:"à l'envers",g:sel(x=>x===1),msg:"Ce sont les inodes à 1 lien qui ne peuvent pas être des répertoires : un répertoire a au moins 2 liens."}]
    :[{type:"2 liens pris pour un fichier sûr",g:sel(x=>x<=2),msg:"Avec 2 liens, on ne peut pas conclure : ce peut être un répertoire vide (son nom et son « . »), ou un fichier qui a un lien dur."},
      {type:"à l'envers",g:sel(x=>x>=2),msg:"Avec plusieurs liens, on ne peut pas conclure : un fichier peut avoir des liens durs. C'est avec 1 seul lien qu'on est sûr : un répertoire en a au moins 2."}]).filter(x=>x.g.join()!==att.join());
  const tri3=L=>L.slice().sort().join(","),O=[...nos.map(n=>[String(n),"inode "+n]),["0","aucun"]];
  function juge(rep){const S=(rep.g||[]).map(String);if(!S.length)return {incomplet:"Coche les inodes (ou « aucun »)."};const v=S.includes("0")?[]:S;
    if(tri3(v)===tri3(att))return {ok:true};
    const non=(type,titre,msg,et)=>({ok:false,faux:["g"],resume:`Pas tout à fait : ce ne sont pas les inodes qui ${g?"peuvent être des répertoires":"sont sûrement des fichiers"}.`,diag:{etape:et,type,titre,msg}});
    for(const x of P)if(tri3(x.g)===tri3(v))return non(x.type,"Où ça part : la règle des 2 liens.",x.msg,0);
    return non("inode mal classé","Où ça part : un inode.",`Regarde chaque nombre de liens : 1 lien, c'est sûrement un fichier ; 2 liens ou plus, ce peut être un répertoire (ou un fichier avec des liens durs).`,1);}
  const E=[{w:`Un répertoire a au moins 2 liens : son nom dans le répertoire parent et son entrée ${c(".")} en lui-même. Un fichier ordinaire peut avoir 1 lien, ou plus s'il a des liens durs.`,why:"C'est la règle du TD, exercice 22.",pts:1.5},
    {w:nos.map((n,i)=>`inode ${n} : ${nl3(ks[i])}, ${ks[i]===1?"sûrement un fichier":"fichier ou répertoire"}`).join("<br>"),why:"On ne peut conclure que pour 1 lien.",pts:1},
    {w:`<b>${att.length?att.map(x=>"inode "+x).join(", "):"aucun"}</b>`,why:g?"Avec 2 liens ou plus, rien n'interdit un répertoire.":"Seul 1 lien permet de conclure.",pts:0.5}];
  return {sig:"I2"+g+nos.join()+ks.join(),q:`Voici le nombre de liens de cinq inodes (TD, exercice 22). Lesquels ${g?"peuvent être des répertoires":"sont sûrement des fichiers ordinaires, pas des répertoires"} ?`,corps:grille3(["inode","nb. de liens"],nos.map((n,i)=>[n,ks[i]])),texte:nos.map((n,i)=>n+":"+ks[i]).join(" ")+(g?" : répertoires possibles ?":" : fichiers sûrs ?"),
    champs:[{k:"multi",id:"g",o:O,seul:"0"}],juge,etapes:E,bonne:att.map(x=>"inode "+x).join(", "),bonneTxt:att.join(" "),repBonne:{g:att},repFausse:{g:P[0].g},nature:g?"liens : répertoire possible":"liens : fichier sûr",
    ens:{fam:"td22",g,nos,ks,pieges:P.map(x=>({type:x.type,g:x.g}))}};}

/* palier 2 : ln, ln -s, rm, mv, cp, >> ; lu : une lecture fausse des commandes */
function joue3(ops,lu){lu=lu||{};const N=new Map(),I=[];const vise=(x,k)=>{const e=N.get(x);if(!e||(k||0)>8)return null;return e.t==="f"?e.i:vise(e.v,(k||0)+1);};
  for(const [k0,a,b] of ops){let k=k0;if(k==="lns"&&lu.symDur)k="ln";else if(k==="ln"&&lu.durSym)k="lns";else if(k==="ln"&&lu.lnCopie)k="cp";else if(k==="cp"&&lu.cpLien)k="ln";
    if(k==="cree"){I.push({n:1,c:[b],sy:0});N.set(a,{t:"f",i:I.length-1});}
    else if(k==="ln"){const i=vise(a);if(i==null||N.has(b))continue;I[i].n++;N.set(b,{t:"f",i});}
    else if(k==="lns"){if(N.has(b))continue;const i=vise(a);if(lu.symCompte&&i!=null)I[i].sy++;N.set(b,{t:"l",v:a});}
    else if(k==="cp"){const i=vise(a);if(i==null||N.has(b))continue;I.push({n:1,c:I[i].c.slice(),sy:0});N.set(b,{t:"f",i:I.length-1});}
    else if(k==="rm"){const e=N.get(a);if(!e)continue;if(e.t==="f"&&lu.rmTout){for(const [x,y] of [...N])if(y.t==="f"&&y.i===e.i)N.delete(x);I[e.i].n=0;}else{N.delete(a);if(e.t==="f"&&!lu.rmOubli)I[e.i].n--;}}
    else if(k==="mv"){const e=N.get(a);if(!e||N.has(b))continue;N.delete(a);N.set(b,e);if(lu.mvSuit)for(const y of N.values())if(y.t==="l"&&y.v===a)y.v=b;}
    else if(k==="ajoute"){const i=vise(a);if(i!=null)I[i].c.push(b);}}
  return {N,I,vise};}
const cmd3=([k,a,b])=>k==="cree"?`echo ${b} > ${a}`:k==="ln"?`ln ${a} ${b}`:k==="lns"?`ln -s ${a} ${b}`:k==="rm"?`rm ${a}`:k==="mv"?`mv ${a} ${b}`:k==="cp"?`cp ${a} ${b}`:`echo ${b} >> ${a}`;
const nbDe3=(s,x,lu)=>{const e=s.N.get(x);if(!e)return undefined;if(e.t==="l"){if(!(lu&&lu.viseCompte))return 1;const i=s.vise(x);return i==null?undefined:s.I[i].n;}return s.I[e.i].n+s.I[e.i].sy;};
const catDe3=(s,x)=>{const i=s.vise(x);return i==null?"ERR":s.I[i].c.join("\n");};
const LU3=[["ln -s lu comme un lien dur","symDur",`${c("ln -s")} ne crée pas un deuxième nom pour l'inode : il crée un nouveau petit fichier, de type l, qui contient seulement un chemin. Le compteur du fichier visé ne bouge pas, et le raccourci casse quand ce chemin ne mène plus à rien.`],
  ["ln lu comme ln -s","durSym",`Sans ${c("-s")}, ${c("ln")} crée un lien dur : un deuxième nom pour le même inode. Il ne dépend pas de l'ancien nom : supprimer ou renommer l'un laisse l'autre intact.`],
  ["ln lu comme une copie","lnCopie",`${c("ln")} ne copie rien : les deux noms désignent le même inode, donc le même contenu et le même compteur. Ce qu'on ajoute par un nom se voit par l'autre.`],
  ["cp lu comme ln","cpLien",`${c("cp")} crée un nouvel inode avec une copie du contenu : la copie a 1 lien, et elle ne change plus quand on modifie l'original.`],
  ["rm qui efface tous les noms","rmTout",`${c("rm")} enlève un seul nom et retire 1 au compteur. Le contenu n'est effacé que quand le compteur tombe à 0 : les autres noms de l'inode marchent toujours.`],
  ["rm oublié dans le compte","rmOubli",`Chaque ${c("rm")} d'un nom retire 1 au compteur de liens de son inode.`],
  ["raccourci qui suit mv","mvSuit",`Un lien symbolique contient un chemin, pas un numéro d'inode : après ${c("mv")}, l'ancien nom n'existe plus, et le raccourci qui le visait est cassé (il remarche si un fichier reprend ce nom).`],
  ["ln -s ajouté au compteur","symCompte",`Un lien symbolique ne change pas le compteur de liens du fichier visé : seuls les liens durs (${c("ln")} sans ${c("-s")}) comptent.`],
  ["compteur du fichier visé","viseCompte",`${c("ls -l")} sur un lien symbolique montre l'inode du raccourci lui-même, qui n'a qu'un nom : 1 lien. Le compteur du fichier visé n'est pas le sien.`]];
const NOMS3=["t2","lien","copie","sauve","c.txt","raccourci","double","vieux","autre","b2"];
function recit3(ops,no){const L=[];
  for(let t=0;t<ops.length;t++){const av=joue3(ops.slice(0,t)),ap=joue3(ops.slice(0,t+1)),o=ops[t],[k,a,b]=o,cm=c(cmd3(o));
    const noms=i=>[...ap.N].filter(([x,e])=>e.t==="f"&&e.i===i).map(([x])=>c(x));let w;
    if(k==="cree"){const i=ap.I.length-1;w=`${cm} : crée ${c(a)}, ${no(i)}, 1 lien, contenu « ${b} ».`;}
    else if(k==="ln"){const i=ap.N.get(b).i;w=`${cm} : ${c(b)} est un nom de plus pour ${no(i)}, qui a maintenant ${nl3(ap.I[i].n)} (${et(noms(i))}).`;}
    else if(k==="lns")w=`${cm} : ${c(b)} est un raccourci, un nouveau petit fichier qui contient le chemin ${c(a)}. Le compteur de ${c(a)} ne bouge pas.`;
    else if(k==="rm"){const e=av.N.get(a);if(e.t==="l")w=`${cm} : supprime le raccourci ${c(a)} ; le fichier visé n'est pas touché.`;
      else{const n=ap.I[e.i].n;w=`${cm} : le nom ${c(a)} disparaît ; ${no(e.i)} passe à ${n?`${nl3(n)} (il reste ${et(noms(e.i))})`:"0 : son contenu est libéré"}.`;}}
    else if(k==="mv")w=`${cm} : ${no(av.N.get(a).i)} s'appelle maintenant ${c(b)} ; son compteur ne change pas.`;
    else if(k==="cp"){const i=ap.N.get(b).i;w=`${cm} : ${c(b)} est un nouvel inode, ${no(i)} (1 lien), avec une copie du contenu de ${c(a)}.`;}
    else{const i=av.vise(a);w=`${cm} : ajoute la ligne « ${b} » au contenu de ${no(i)}${av.N.get(a).t==="l"?`, en passant par le raccourci ${c(a)}`:""}${noms(i).length>1?` ; ${et(noms(i))} la voient tous${noms(i).length===2?" les deux":""}`:""}.`;}
    for(const [x,e] of ap.N)if(e.t==="l"&&av.N.has(x)){const d0=av.vise(x)==null,d1=ap.vise(x)==null;
      if(!d0&&d1)w+=` Le raccourci ${c(x)}, qui contient le chemin ${c(e.v)}, est cassé.`;else if(d0&&!d1)w+=` Le raccourci ${c(x)} remarche : le nom ${c(e.v)} existe de nouveau.`;}
    L.push(w);}
  return L;}
function exoIn1(R){const ops=[["cree","a.txt","bonjour"]];if(R()<0.4)ops.push(["cree","b.txt","salut"]);
  const libres=R.mel(NOMS3),n=R.ent(3,5);let essais=0;
  for(let t=0;t<n;t++){if(++essais>40)return null;const s=joue3(ops),reg=[...s.N].filter(([x,e])=>e.t==="f").map(([x])=>x),tous=[...s.N.keys()],ok=tous.filter(x=>s.vise(x)!=null);
    const k=t===0?R.choix(["ln","lns"]):R.choix(["ln","ln","lns","lns","rm","rm","rm","ajoute","ajoute","mv","cp"]),neuf=()=>libres.pop();
    if(k==="ln"&&reg.length)ops.push(["ln",R.choix(reg),neuf()]);
    else if(k==="lns"&&reg.length)ops.push(["lns",R.choix(reg),neuf()]);
    else if(k==="rm"&&tous.length>1){const x=R.choix(tous);ops.push(["rm",x]);if(R()<0.4)libres.push(x);}
    else if(k==="ajoute"&&ok.length)ops.push(["ajoute",R.choix(ok),R.choix(["suite","fin","encore"])]);
    else if(k==="mv"&&reg.length){const x=R.choix(reg);ops.push(["mv",x,neuf()]);if(R()<0.4)libres.push(x);}
    else if(k==="cp"&&ok.length)ops.push(["cp",R.choix(ok),neuf()]);
    else t--;}
  if(ops.some(o=>o.includes(undefined)))return null;
  const S=joue3(ops),noms=[...new Set(ops.flatMap(o=>o[0]==="ajoute"||o[0]==="cree"?[o[1]]:[o[1],o[2]]).filter(Boolean))],ex=[...S.N.keys()];
  const nb=R()<0.55,regs=ex.filter(x=>S.N.get(x).t==="f"),syms=ex.filter(x=>S.N.get(x).t==="l");
  const piege=x=>{const att=nb?nbDe3(S,x):catDe3(S,x),P=[];for(const [type,k,msg] of LU3){const v=nb?nbDe3(joue3(ops,{[k]:1}),x,{[k]:1}):catDe3(joue3(ops,{[k]:1}),x);if(v!==undefined&&v!==att&&!P.some(y=>y.v===v))P.push({type,v,msg});}return {x,att,P};};
  const C=(nb?(syms.length&&R()<0.2?R.mel(syms):R.mel(regs)):R.mel(noms)).map(piege).filter(y=>y.P.length);if(!C.length)return null;
  const {x,att,P}=C[0];
  const base=R.ent(41,97)*10,no=i=>"l'inode "+(base+i),L=recit3(ops,no),e=S.N.get(x);
  const script=ops.map(cmd3).join("\n"),fin=nb?`stat -c %h ${x}`:`cat ${x} 2>/dev/null || echo ERR`;
  const voit=v=>v==="ERR"?"une erreur : ce nom ne mène à aucun fichier":v.split("\n").map(c).join("<br>");
  const concl=nb?(e.t==="l"?`À la fin, ${c(x)} est un raccourci : ${c("ls -l")} montre son propre inode, qui n'a qu'un nom.`:`À la fin, ${c(x)} désigne ${no(e.i)}, qui a ${nl3(att)} : ${et([...S.N].filter(([y,f])=>f.t==="f"&&f.i===e.i).map(([y])=>c(y)))}.`)
    :!e?`À la fin, ${c(x)} n'existe plus : ${c("cat")} affiche une erreur.`:e.t==="l"&&att==="ERR"?`À la fin, ${c(x)} est un raccourci vers ${c(e.v)}, qui ne mène plus à aucun fichier : ${c("cat")} affiche une erreur (lien cassé).`
    :`À la fin, ${c(x)} ${e.t==="l"?`mène, par le chemin ${c(e.v)}, à`:"désigne"} ${no(S.vise(x))}, dont le contenu est ${att.split("\n").map(y=>"« "+y+" »").join(" puis ")}.`;
  const E=[{w:L.join("<br>"),why:`${c("ln")} ajoute un nom au même inode, ${c("ln -s")} crée un raccourci qui contient un chemin, ${c("cp")} crée un nouvel inode, ${c("mv")} renomme, ${c("rm")} enlève un nom.`,pts:2},
    {w:concl,why:nb?"Le compteur de liens compte les noms de l'inode : chaque ln ajoute 1, chaque rm retire 1 ; ln -s, cp et mv ne le changent pas.":`${c("cat")} suit les raccourcis jusqu'à un fichier ; si le chemin ne mène à rien, c'est une erreur.`,pts:1},
    {w:`<b>${nb?att:voit(att)}</b>`,why:nb?`C'est le nombre que montrent ${c("ls -l "+x)} (2e colonne) et ${c("stat -c %h "+x)}.`:`C'est ce qu'affiche ${c("cat "+x)}.`,pts:0.5}];
  const q=`Dans un répertoire vide, on tape ces commandes, dans l'ordre. ${nb?`Ensuite, combien de liens ${c("ls -l")} affiche-t-il pour ${c(x)} ?`:`Ensuite, qu'affiche ${c("cat "+x)} ?`}`;
  const bash=[{arbo:arboDe([]),cmd:script+"\n"+fin,args:[],nom:"./liens.sh",script:true,abs:nb?[String(att)]:att.split("\n")}];
  if(nb)return {sig:"I1"+script+"|"+x,q,corps:bloc(script),texte:script.replace(/\n/g," ; ")+" ; liens de "+x+" ?",
    champs:[{k:"champ",id:"n",nom:"liens",label:"Le nombre de liens :",ex:"par exemple 2",apercu:false,sym:[]}],juge:rep=>jugeN3(rep.n,[att],P,"n",0,`le nombre de liens de ${c(x)}`),etapes:E,bonne:String(att),bonneTxt:String(att),repBonne:{n:String(att)},repFausse:{n:String(P[0].v)},nature:"compteur après ln et rm",
    ens:{fam:"compte",ops,x,att,pieges:P.map(y=>({type:y.type,n:String(y.v)})),bash}};
  const V0=[...new Set([att,...P.map(y=>y.v),"ERR"])],deb=att.split("\n")[0];if(V0.length<3&&!V0.includes(deb))V0.push(deb);const V=R.mel(V0),O=V.map((v,i)=>["o"+i,voit(v)]),val=v=>"o"+V.indexOf(v);
  function juge(rep){if(!rep.s)return {incomplet:"Choisis ce qu'affiche cat."};const v=V[+String(rep.s).slice(1)];if(v===att)return {ok:true};
    const y=P.find(z=>z.v===v),non=(type,msg)=>({ok:false,faux:["s"],resume:`Pas tout à fait : ce n'est pas ce qu'affiche ${c("cat "+x)}.`,diag:{etape:0,type,titre:"Où ça part : ce que fait une commande.",msg}});
    return y?non(y.type,y.msg):non("contenu faux","Rejoue les commandes une par une avec la correction : quel inode désigne chaque nom, et quel est son contenu.");}
  return {sig:"I1"+script+"|cat "+x,q,corps:bloc(script),texte:script.replace(/\n/g," ; ")+" ; cat "+x+" ?",
    champs:[{k:"choix",id:"s",o:O}],juge,etapes:E,bonne:voit(att),bonneTxt:att.replace(/\n/g," / "),repBonne:{s:val(att)},repFausse:{s:val(P[0].v)},nature:"cat après ln, ln -s et rm",
    ens:{fam:"cat",ops,x,att,V,pieges:P.map(y=>({type:y.type,s:val(y.v)})),bash}};}

/* palier 3 : la taille maximale ; tout est en puissances de 2 : blocs de 2^b octets, adresses de 2^a octets, L niveaux d'indirection, D adresses directes */
const UN3=[[60,"Eio"],[50,"Pio"],[40,"Tio"],[30,"Gio"],[20,"Mio"],[10,"Kio"],[0,"octets"]];
const taille3=e=>{const u=UN3.find(x=>e>=x[0]);return `${2**(e-u[0])} ${u[1]}`;};
const NIV3=["simple","double","triple"];
function exoIn2(R){const f=R.choix([0,0,0,1,2,3,4]),b=R.choix([10,11,12,12,13]),a=R.choix([2,2,3]),bits=R()<0.4,L=R.choix([3,3,2]),D=R.choix([10,10,12]),x=b-a,n=2**x,e=L*x+b;
  const tot=e2=>{let s=D;for(let j=1;j<=L;j++)s+=2**(j*x);return s*2**e2;},exact=tot(b),Aoct=2**a;
  const don=(bb,aa)=>`<ul><li>${D} adresses directes, puis ${L===3?"une adresse simple indirecte, une double et une triple":"une adresse simple indirecte et une double"} ;</li><li>des blocs de ${taille3(bb)} ;</li><li>des adresses sur ${bits?8*2**aa+" bits":2**aa+" octets"}.</li></ul>`;
  const nTxt=`${bits?`${8*Aoct} bits = ${Aoct} octets, donc `:""}n = ${taille3(b)} / ${Aoct} octets = ${pw3(b)} / ${pw3(a)} = ${pw3(x)} = ${n} adresses par bloc`;
  const niv=`Directs : ${D} blocs. ${NIV3.slice(0,L).map((t,j)=>`${t[0].toUpperCase()+t.slice(1)} indirect : n${j?SUP3[j+1]:""} = ${pw3((j+1)*x)} blocs`).join(". ")}.`;
  const sym=[["^","^"],["Kio"," Kio"],["Mio"," Mio"],["Gio"," Gio"],["Tio"," Tio"],["Pio"," Pio"]];
  const Pn=unique3([{type:"taille du bloc prise pour le nombre d'adresses",v:2**b,msg:`Un bloc de ${taille3(b)} contient ${2**b} octets, mais chaque adresse en prend ${Aoct} : il faut diviser par la taille d'une adresse.`},
    ...(bits?[{type:"bits pris pour des octets",v:2**(b-a-3),msg:`Une adresse sur ${8*Aoct} bits prend ${Aoct} octets (8 bits par octet) : on divise la taille du bloc, en octets, par ${Aoct}.`}]:[]),
    {type:"Kio pas convertis",v:2**(b-10)/Aoct,msg:`Convertis d'abord le bloc en octets : ${taille3(b)} = ${pw3(b)} octets.`}].filter(y=>Number.isInteger(y.v)&&y.v>=1),[n]);
  const Pt=k=>unique3([{type:"nombre de blocs pris pour la taille",v:2**(L*x),msg:`n${SUP3[L]} = ${pw3(L*x)} est un nombre de blocs : il faut le multiplier par la taille d'un bloc, ${pw3(b)} octets.`,etape:k},
    {type:"un niveau oublié",v:2**((L-1)*x+b),msg:`Il y a ${L} niveaux d'indirection : le dernier atteint n${SUP3[L]} blocs, pas n${L>2?SUP3[L-1]:""}.`,etape:k},
    {type:"taille du bloc prise pour le nombre d'adresses",v:2**(L*b+b),msg:`Un bloc d'adresses contient n = ${n} adresses, pas ${2**b} : chaque adresse prend ${Aoct} octets.`,etape:0},
    ...(bits?[{type:"bits pris pour des octets",v:2**(L*(x-3)+b),msg:`Une adresse sur ${8*Aoct} bits prend ${Aoct} octets : n = ${n}.`,etape:0}]:[]),
    {type:"niveaux additionnés au lieu de multipliés",v:(D+L*n)*2**b,msg:`Chaque niveau multiplie par n : le double indirect atteint n × n = n² blocs, pas n.`,etape:k}],[2**e,exact]);
  const fin=(w,why)=>({w,why,pts:0.5}),En={w:nTxt+".",why:"Un bloc d'adresses est rempli d'adresses de blocs : taille du bloc / taille d'une adresse.",pts:1};
  const Ecal={w:`${niv} Le plus gros terme : n${SUP3[L]} × ${pw3(b)} = ${pw3(L*x)} × ${pw3(b)} = ${pw3(e)} octets.`,why:`Total exact : (${D} + ${["n","n²","n³"].slice(0,L).join(" + ")}) × ${taille3(b)} ; le dernier niveau écrase les autres.`,pts:1.5};
  const ens={fam:"taille",f,b,a,L,D,bits},IA=`<p>Un inode a :</p>${don(b,a)}`;
  if(f===0){const P=Pt(1);if(!P.length)return null;
    const juge=rep=>{const jn=jugeN3(rep.n,[n],Pn,"n",0,"le nombre d'adresses par bloc"),jt=jugeN3(rep.t,[2**e,exact],P,"t",1,"la taille maximale");
      if(jn.incomplet||jt.incomplet)return {incomplet:jn.incomplet?"Le nombre d'adresses : "+jn.incomplet:"La taille : "+jt.incomplet};if(jn.ok&&jt.ok)return {ok:true};
      const j=jn.ok?jt:jn;return Object.assign({},j,{faux:[...(jn.ok?[]:["n"]),...(jt.ok?[]:["t"])]});};
    return {sig:"I2"+[f,b,a,bits,L,D].join(),q:"Combien d'adresses tient un bloc, et quelle est la taille maximale d'un fichier, environ ?",corps:IA,texte:`D=${D} L=${L} bloc ${taille3(b)} adresse ${Aoct} o : n et taille max ?`,
      champs:[{k:"champ",id:"n",nom:"adresses",label:"Adresses par bloc :",ex:"par exemple 1024",apercu:false,sym:[]},{k:"champ",id:"t",nom:"taille",label:"Taille maximale :",ex:"par exemple 4 Tio ou 2^42",apercu:false,sym}],
      juge,etapes:[En,Ecal,fin(`<b>n = ${n} ; environ ${taille3(e)}</b>`,`${pw3(e)} octets = ${taille3(e)} : on arrondit au plus gros terme, comme le cours.`)],bonne:`n = ${n}, environ ${taille3(e)}`,bonneTxt:`${n} ; ${taille3(e)}`,
      repBonne:{n:String(n),t:taille3(e)},repFausse:{n:String(n),t:String(P[0].v)},nature:"taille maximale",ens:Object.assign(ens,{pieges:[...Pn.map(y=>({type:y.type,n:String(y.v),t:taille3(e)})),...P.map(y=>({type:y.type,n:String(n),t:String(y.v)}))]})};}
  if(f===1){const adr=a===2&&R()<0.4,r=adr?2:R.choix([2,2,4]),att=adr?2**L:r**(L+1);
    const P=unique3(adr?[{type:"un seul niveau divisé",v:2,msg:`Avec des adresses deux fois plus grandes, un bloc en tient deux fois moins : n est divisé par 2, et n${SUP3[L]} par 2${SUP3[L]} = ${2**L}.`},{type:"taille du bloc comptée",v:2**(L+1),msg:"La taille des blocs ne change pas : seul n change."}]
      :[{type:"seulement la taille d'un bloc",v:r,msg:`n change aussi : un bloc ${r} fois plus grand tient ${r} fois plus d'adresses, et le dernier niveau en atteint ${r}${SUP3[L]} fois plus.`},
        {type:"taille d'un bloc oubliée",v:r**L,msg:`Chaque bloc de données est aussi ${r} fois plus grand : on multiplie encore par ${r}.`},{type:"niveaux additionnés",v:r*L,msg:"Les facteurs se multiplient : un facteur par niveau d'adresses, et un pour la taille du bloc."}],[att]);
    const q=adr?`Les adresses passent à ${bits?"64 bits":"8 octets"}, sans rien changer d'autre. Par combien la taille maximale d'un fichier est-elle divisée, environ ?`:`La taille des blocs passe à ${taille3(b+Math.log2(r))}, sans rien changer d'autre. Par combien la taille maximale d'un fichier est-elle multipliée, environ ?`;
    const E=adr?[{w:`n passe de ${pw3(x)} à ${pw3(x-1)} : divisé par 2.`,why:"Un bloc tient deux fois moins d'adresses de 8 octets.",pts:1},{w:`Le plus gros terme n${SUP3[L]} × taille d'un bloc est divisé par 2${SUP3[L]} = ${2**L}.`,why:"La taille d'un bloc ne change pas.",pts:1.5},fin(`<b>${att}</b>`,`Divisée par ${att}.`)]
      :[{w:`n passe de ${pw3(x)} à ${pw3(x+Math.log2(r))} : multiplié par ${r}.`,why:"Un bloc plus grand tient plus d'adresses.",pts:1},{w:`Le plus gros terme n${SUP3[L]} × taille d'un bloc est multiplié par ${r}${SUP3[L]} × ${r} = ${att}.`,why:`${L} niveaux d'adresses, et des blocs de données ${r} fois plus grands (cours : « ∗16 donc 64Tio » pour 4 → 8 Kio).`,pts:1.5},fin(`<b>${att}</b>`,`De ${taille3(e)} à environ ${taille3(adr?e-L:e+(L+1)*Math.log2(r))}.`)];
    return {sig:"I2"+[f,b,a,bits,L,D,adr,r].join(),q,corps:IA,texte:`D=${D} L=${L} bloc ${taille3(b)} adresse ${Aoct} o : ${adr?"adresses ×2":"blocs ×"+r} ?`,
      champs:[{k:"champ",id:"n",nom:"facteur",label:adr?"Divisée par :":"Multipliée par :",ex:"par exemple 4",apercu:false,sym:[]}],juge:rep=>jugeN3(rep.n,[att],P,"n",1,"le bon facteur"),etapes:E,bonne:String(att),bonneTxt:String(att),repBonne:{n:String(att)},repFausse:{n:String(P[0].v)},nature:"facteur de la taille maximale",
      ens:Object.assign(ens,{adr,r,att,pieges:P.map(y=>({type:y.type,n:String(y.v)}))})};}
  if(f===2){const kb=R.choix([32,35,40,48,64].filter(k=>Math.abs(k-e)>=2)),champ=kb<e,att=champ?[2**kb]:[2**e,exact];
    const P=unique3([champ?{type:"champ taille oublié",v:2**e,msg:`Le champ « taille » ne peut pas écrire plus de ${pw3(kb)} octets : c'est lui qui limite, même si les blocs permettraient ${taille3(e)}.`,etape:2}
      :{type:"blocs oubliés",v:2**kb,msg:`${kb} bits permettent d'écrire jusqu'à ${pw3(kb)}, mais les blocs n'atteignent que ${taille3(e)} : ce sont eux qui limitent.`,etape:2},...Pt(1).filter(y=>y.type!=="niveaux additionnés au lieu de multipliés")],att);
    if(!P.length)return null;
    return {sig:"I2"+[f,b,a,bits,L,D,kb].join(),q:`Le champ « taille » de l'inode est codé sur ${kb} bits. Quelle est la taille maximale d'un fichier, environ ?`,corps:IA,texte:`D=${D} L=${L} bloc ${taille3(b)} adresse ${Aoct} o, taille sur ${kb} bits : taille max ?`,
      champs:[{k:"champ",id:"t",nom:"taille",label:"Taille maximale :",ex:"par exemple 4 Gio ou 2^32",apercu:false,sym}],juge:rep=>jugeN3(rep.t,att,P,"t",1,"la taille maximale"),
      etapes:[En,Ecal,{w:`Le champ « taille » écrit au plus ${pw3(kb)} octets = ${taille3(kb)}. ${champ?`C'est moins que les ${taille3(e)} des blocs : le champ limite.`:`C'est plus que les ${taille3(e)} des blocs : les blocs limitent.`}`,why:"Les deux limites comptent : on garde la plus petite (cours : « taille sur 32 bits », 4 Gio).",pts:1},fin(`<b>environ ${taille3(champ?kb:e)}</b>`,"La plus petite des deux limites.")],
      bonne:`environ ${taille3(champ?kb:e)}`,bonneTxt:taille3(champ?kb:e),repBonne:{t:taille3(champ?kb:e)},repFausse:{t:String(P[0].v)},nature:"champ taille",ens:Object.assign(ens,{kb,pieges:P.map(y=>({type:y.type,t:String(y.v)}))})};}
  if(f===3){const P=unique3([{type:"nombre de blocs pris pour la taille",v:L*x,msg:`${pw3(L*x)} est le nombre de blocs ; la taille en octets est ${pw3(L*x)} × ${pw3(b)} = ${pw3(e)}.`,etape:1},
      {type:"un niveau oublié",v:(L-1)*x+b,msg:`Il y a ${L} niveaux d'indirection : le dernier atteint n${SUP3[L]} blocs.`,etape:1},{type:"taille du bloc prise pour le nombre d'adresses",v:L*b+b,msg:`Un bloc contient n = ${pw3(x)} adresses, pas ${pw3(b)}.`,etape:0}],[e,e+1]);
    return {sig:"I2"+[f,b,a,bits,L,D].join(),q:`Sur combien de bits faut-il coder le champ « taille » de l'inode, pour écrire la taille que l'adressage des blocs permet d'atteindre ?`,corps:IA,texte:`D=${D} L=${L} bloc ${taille3(b)} adresse ${Aoct} o : bits de la taille ?`,
      champs:[{k:"champ",id:"n",nom:"bits",label:"Nombre de bits :",ex:"par exemple 32",apercu:false,sym:[]}],juge:rep=>jugeN3(rep.n,[e,e+1],P,"n",2,"le bon nombre de bits"),
      etapes:[En,Ecal,fin(`<b>${e} bits</b>`,`${taille3(e)} = ${pw3(e)} octets : il faut ${e} bits, comme le cours (« 42 bits » pour 4 Tio). La taille exacte dépasse un peu ${pw3(e)} : ${e+1} bits est accepté aussi.`)],bonne:`${e} bits`,bonneTxt:String(e),repBonne:{n:String(e)},repFausse:{n:String(P[0].v)},nature:"bits du champ taille",
      ens:Object.assign(ens,{pieges:P.map(y=>({type:y.type,n:String(y.v)}))})};}
  const j=R.ent(Math.max(3,x-4),x),s=b+x+j,m=2**(s-b),app=m/n;
  const P=unique3([{type:"blocs de données comptés",v:m,msg:`${m} est le nombre de blocs de données. Les blocs volés sont ceux qui rangent leurs adresses : ${m} adresses, ${n} par bloc.`,etape:1},
    {type:"octets d'adresses pris pour des blocs",v:m*Aoct,msg:`${m} adresses de ${Aoct} octets font ${m*Aoct} octets : il faut encore diviser par la taille d'un bloc, ${2**b} octets.`,etape:1},
    {type:"divisé deux fois par n",v:m/n/n,msg:`Un bloc d'adresses en tient n = ${n} : on divise ${m} par n une seule fois.`,etape:1}].filter(y=>y.v>=1&&Number.isInteger(y.v)),[app,app+1]);
  return {sig:"I2"+[f,b,a,bits,L,D,s].join(),q:`Les blocs qui ne contiennent que des adresses sont « volés » à l'espace des données. Pour un fichier de ${taille3(s)}, combien de blocs sont ainsi volés, environ ?`,corps:IA,texte:`D=${D} bloc ${taille3(b)} adresse ${Aoct} o, fichier ${taille3(s)} : blocs volés ?`,
    champs:[{k:"champ",id:"n",nom:"blocs",label:"Blocs volés :",ex:"par exemple 1024",apercu:false,sym:[]}],juge:rep=>jugeN3(rep.n,[app,app+1],P,"n",1,"le nombre de blocs volés"),
    etapes:[En,{w:`Le fichier occupe ${taille3(s)}, soit ${pw3(s)} octets : ${pw3(s)} / ${pw3(b)} = ${pw3(s-b)} = ${m} blocs de données, donc ${m} adresses à ranger : ${m} / n = ${pw3(s-b)} / ${pw3(x)} = ${app} blocs d'adresses.`,why:`Comme le cours : ${pw3(s-b)} adresses × ${Aoct} octets = ${pw3(s-b+a)} octets, soit ${app} blocs de ${taille3(b)}.`,pts:1.5},
      fin(`<b>environ ${app}</b>`,`En comptant aussi le bloc du haut du double indirect, on trouve ${app+1} : accepté aussi.`)],bonne:`environ ${app}`,bonneTxt:String(app),repBonne:{n:String(app)},repFausse:{n:String(P[0].v)},nature:"blocs volés",
    ens:Object.assign(ens,{s,pieges:P.map(y=>({type:y.type,n:String(y.v)}))})};}

/* palier 4 : la cohérence d'une table d'inodes (TD, exercices 21 à 23) */
const NOS3=[148,272,256,498,2405,311,1207,736,4410,905,1530,627];
const tri3b=L=>L.slice().sort().join(",");
function cocher3(o,att,P,quoi,pourquoi){
  return rep=>{const S=(rep.g||[]).map(String);if(!S.length)return {incomplet:"Coche les anomalies (ou « Tout est cohérent »)."};const v=S.includes("rien")?[]:S.filter(x=>x!=="rien");
    if(tri3b(v)===tri3b(att))return {ok:true};
    const non=(type,titre,msg,et)=>({ok:false,faux:["g"],resume:`Pas tout à fait : ce ne sont pas ${quoi}.`,diag:{etape:et,type,titre,msg}});
    for(const x of P)if(tri3b(x.g)===tri3b(v))return non(x.type,"Où ça part : une règle.",x.msg,x.etape||0);
    const m=att.find(y=>!v.includes(y)),t=v.find(y=>!att.includes(y)),k=m||t;
    return non(m?"anomalie oubliée":"anomalie en trop","Où ça part : une ligne.",pourquoi(k,!!m),0);};}
function coBlocs3(R){const bk=R.choix([1,2,4,8,8]),B=bk*1024,nos=R.mel(NOS3).slice(0,3),pris=new Set();
  const neuf=()=>{for(;;){const y=R.ent(1000,9999);if(!pris.has(y)&&!nos.includes(y)){pris.add(y);return y;}}};
  const I=nos.map(no=>{const k=R.ent(1,4),t=R()<0.15?k*B:R.ent((k-1)*B+1,k*B-1);return {no,t,s:[...Array(k)].map(neuf)};});
  const A=R.mel(["peu","trop","partage","trou"]).slice(0,R.choix([0,1,1,2,2])),libre=R.mel([0,1,2]);
  for(const an of A){const i=libre.pop();if(i===undefined)break;const x=I[i];
    if(an==="peu"&&x.s.length>=2)x.s.pop();else if(an==="trop")x.s.push(neuf());
    else if(an==="partage"){const j=(i+1)%3;x.s[R.ent(0,x.s.length-1)]=R.choix(I[j].s);}
    else if(an==="trou"&&x.s.length>=2&&x.s.length<5)x.s.splice(x.s.length-1,0,0);}
  let meme=null;if(R()<0.45){const i=R.ent(0,2),x=I[i];const J=x.s.map((y,k)=>y?k:-1).filter(k=>k>=0);if(!pris.has(x.no)&&J.length){x.s[R.choix(J)]=x.no;meme=x.no;}}
  for(const x of I)while(x.s.length<6)x.s.push(0);
  const util=x=>x.s.filter(Boolean),vu={};I.forEach(x=>util(x).forEach(y=>vu[y]=(vu[y]||0)+1));
  const flags=besoin=>[...I.filter(x=>util(x).length!==besoin(x.t)).map(x=>"n"+x.no),...(Object.values(vu).some(v=>v>1)?["partage"]:[]),...(I.some(x=>x.s.some((y,k)=>y&&x.s.slice(0,k).includes(0)))?["trou"]:[])];
  const att=flags(t=>Math.ceil(t/B));
  const P=[{type:"arrondi vers le bas",g:flags(t=>Math.floor(t/B)),msg:`Un bloc à moitié rempli compte quand même : le nombre de blocs nécessaires est taille / ${B}, arrondi au-dessus.`},
    {type:"Kio comptés pour 1000 octets",g:flags(t=>Math.ceil(t/(bk*1000))),msg:`1 Kio = 2¹⁰ = 1024 octets, pas 1000 : un bloc de ${bk} Kio fait ${B} octets.`},
    ...(meme?[{type:"même numéro pris pour une anomalie",g:[...att,"meme"],msg:"Les inodes et les blocs sont numérotés à part : un bloc peut porter le même numéro qu'un inode (TD, exercice 21, bloc 2405)."}]:[])].filter((x,i,T)=>tri3b(x.g)!==tri3b(att)&&T.findIndex(y=>tri3b(y.g)===tri3b(x.g))===i);
  const O=[...I.map(x=>["n"+x.no,`inode ${x.no} : le nombre de blocs ne va pas avec la taille`]),["partage","un même bloc sert à deux inodes"],["trou","un bloc utilisé vient après un bloc libre (0)"],...(meme?[["meme",`l'inode ${meme} utilise le bloc ${meme}`]]:[]),["rien","tout est cohérent"]];
  const ligne=x=>{const k=util(x).length,bn=Math.ceil(x.t/B);return `inode ${x.no} : ${x.t} octets, il faut ${bn} bloc${bn>1?"s":""} (${(bn-1)*B} < ${x.t} ≤ ${bn*B}) ; il en a ${k}${k===bn?" : bon":" : incohérent"}.`;};
  const dbl=Object.keys(vu).filter(y=>vu[y]>1),tr=I.filter(x=>x.s.some((y,k)=>y&&x.s.slice(0,k).includes(0)));
  const pourquoi=(k,oubli)=>{if(k[0]==="n")return ligne(I.find(x=>"n"+x.no===k));if(k==="partage")return oubli?`Le bloc ${dbl[0]} apparaît dans deux inodes : un bloc n'appartient qu'à un seul fichier.`:"Aucun numéro de bloc ne se répète d'un inode à l'autre.";
    if(k==="trou")return oubli?`Dans l'inode ${tr[0].no}, un bloc utilisé vient après un (0) : tous les blocs qui suivent le premier bloc libre doivent être libres.`:"Dans chaque inode, les (0) sont tous à la fin.";
    if(k==="meme")return P.find(x=>x.type==="même numéro pris pour une anomalie").msg;return "Il y a au moins une anomalie.";};
  const E=[{w:`Blocs nécessaires = taille / ${B}, arrondi au-dessus.<br>${I.map(ligne).join("<br>")}`,why:`1 Kio = 1024 octets : un bloc de ${bk} Kio fait ${B} octets, et un bloc commencé compte en entier.`,pts:1.5},
    {w:`${dbl.length?`Le bloc ${dbl[0]} sert à deux inodes : incohérent.`:"Aucun bloc ne sert à deux inodes."} ${tr.length?`L'inode ${tr[0].no} a un bloc utilisé après un (0) : incohérent.`:"Les (0) sont tous à la fin."}${meme?` Le bloc ${meme} de l'inode ${meme} n'est pas une anomalie : inodes et blocs sont numérotés à part.`:""}`,why:"Un bloc n'appartient qu'à un seul fichier, et tous les blocs qui suivent le premier bloc libre sont libres.",pts:1},
    {w:`<b>${att.length?att.map(k=>O.find(o=>o[0]===k)[1]).join(" ; "):"tout est cohérent"}</b>`,why:"Chaque anomalie, et seulement elles.",pts:0.5}];
  return {sig:"I3b"+bk+JSON.stringify(I),q:`Voici trois inodes (TD, exercice 21). Les blocs font ${bk} Kio (1 Kio = 2¹⁰ octets) ; (0) veut dire « libre », et tous les blocs qui suivent le premier bloc libre doivent être libres. Coche chaque anomalie.`,
    corps:grille3(["inode","taille (octets)","blocs d'adressage direct"],I.map(x=>[x.no,x.t,x.s.map(y=>y||"(0)").join(" · ")])),texte:`blocs de ${bk} Kio : `+I.map(x=>`${x.no} ${x.t} [${x.s.join(" ")}]`).join(" | "),
    champs:[{k:"multi",id:"g",o:O,seul:"rien"}],juge:cocher3(O,att,P,"les anomalies",pourquoi),etapes:E,bonne:att.length?att.map(k=>O.find(o=>o[0]===k)[1]).join(" ; "):"tout est cohérent",bonneTxt:att.join(" ")||"rien",
    repBonne:{g:att.length?att:["rien"]},repFausse:{g:P.length?(P[0].g.length?P[0].g:["rien"]):att.length?att.slice(1).concat(att.length>1?[]:["rien"]):["partage"]},nature:"cohérence des blocs",
    ens:{fam:"coB",B,I,meme,pieges:P.map(x=>({type:x.type,g:x.g.length?x.g:["rien"]}))}};}
const NOML3=["fibre","fini","finioui","fininon","figue","filon","fichtre","fibonacci","fiole","fiche","filet","fifre"];
function coLiens3(R){const nI=R.ent(3,4),nos=R.mel(NOS3).slice(0,nI),pool=R.mel(NOML3),D=[[],[]],ks=[];
  const libre=(d,nm)=>!D[d].some(y=>y[0]===nm);
  for(const no of nos){const k=R.choix([1,1,2,2,3]);ks.push(k);let r=k;
    if(k>=2&&R()<0.4){const nm=pool.find(y=>libre(0,y)&&libre(1,y));if(nm){D[0].push([nm,no]);D[1].push([nm,no]);r-=2;}}
    for(;r>0;r--){const d=R.ent(0,1),nm=pool.find(y=>libre(d,y)&&!D[1-d].some(z=>z[0]===y));if(!nm)return null;D[d].push([nm,no]);}}
  const A=R.mel(["manque","trop","double"]).slice(0,R.choix([0,1,1,2]));
  for(const an of A){if(an==="manque"){const L=nos.filter(no=>D[0].concat(D[1]).filter(y=>y[1]===no).length>=2);if(!L.length)continue;const no=R.choix(L),d=D[0].some(y=>y[1]===no)?0:1;D[d].splice(D[d].findIndex(y=>y[1]===no),1);}
    else if(an==="trop"){const d=R.ent(0,1),nm=pool.find(y=>libre(0,y)&&libre(1,y));if(nm)D[d].push([nm,R.choix(nos)]);}
    else{const d=D[0].length>=2?0:1;if(D[d].length<2)continue;const L=D[d].filter(y=>!D[1-d].some(z=>z[0]===y[0]));if(L.length<2)continue;L[1][0]=L[0][0];}}
  D.forEach(d=>d.sort((p,q)=>p[0]<q[0]?-1:1));
  const deux=D[0].map(y=>y[0]).find(nm=>D[1].some(z=>z[0]===nm))||null;
  const noms=(no,dist)=>{const L=D[0].concat(D[1]).filter(y=>y[1]===no).map(y=>y[0]);return dist?new Set(L).size:L.length;};
  const dup=D.some(d=>new Set(d.map(y=>y[0])).size<d.length);
  const flags=dist=>[...nos.filter((no,i)=>noms(no,dist)!==ks[i]).map(no=>"l"+no),...(dup?["double"]:[])],att=flags(false);
  const P=[...(deux?[{type:"même nom dans deux répertoires pris pour une anomalie",g:[...att,"deux"],msg:"Un nom est unique dans un répertoire, mais le même nom peut servir dans deux répertoires différents (TD, exercice 23, figue)."},
      {type:"même nom compté une fois",g:flags(true),msg:`Chaque entrée compte : ${c(deux)} dans le répertoire 1 et ${c(deux)} dans le répertoire 2 font deux noms, donc deux liens.`}]:[])].filter((x,i,T)=>tri3b(x.g)!==tri3b(att)&&T.findIndex(y=>tri3b(y.g)===tri3b(x.g))===i);
  const O=[...nos.map(no=>["l"+no,`l'inode ${no} n'a pas autant de noms que de liens`]),["double","un répertoire contient deux fois le même nom"],...(deux?[["deux",`le nom ${deux} est dans les deux répertoires`]]:[]),["rien","tout est cohérent"]];
  const ligne=(no,i)=>{const T=[0,1].flatMap(d=>D[d].filter(y=>y[1]===no).map(y=>[y[0],d])),L=T.map(([nm,d])=>c(nm)+(T.filter(z=>z[0]===nm).length>1?` (répertoire ${d+1})`:""));return `inode ${no} : ${L.length} nom${L.length>1?"s":""}${L.length?" ("+et(L)+")":""} pour ${nl3(ks[i])}${L.length===ks[i]?" : bon":" : incohérent"}.`;};
  const pourquoi=(k,oubli)=>{if(k[0]==="l"){const i=nos.findIndex(no=>"l"+no===k);return ligne(nos[i],i);}if(k==="double")return oubli?"Dans un répertoire, chaque nom est unique : le même nom ne peut pas y être deux fois.":"Aucun répertoire ne contient deux fois le même nom.";
    if(k==="deux")return P[0].msg;return "Il y a au moins une anomalie.";};
  const E=[{w:`Pour chaque inode, on compte les entrées qui le désignent, dans les deux répertoires : ce doit être son nombre de liens.<br>${nos.map(ligne).join("<br>")}`,why:"Chaque nom est un lien dur : le compteur de liens d'un fichier ordinaire est son nombre de noms.",pts:1.5},
    {w:`${dup?"Un répertoire contient deux fois le même nom : incohérent.":"Aucun répertoire ne contient deux fois le même nom."}${deux?` ${c(deux)} dans les deux répertoires n'est pas une anomalie.`:""}`,why:"Un nom est unique dans un répertoire, pas d'un répertoire à l'autre.",pts:1},
    {w:`<b>${att.length?att.map(k=>O.find(o=>o[0]===k)[1]).join(" ; "):"tout est cohérent"}</b>`,why:"Chaque anomalie, et seulement elles.",pts:0.5}];
  const rep=d=>D[d].map(y=>`${y[0]} → ${y[1]}`).join("<br>")||"(vide)";
  return {sig:"I3l"+JSON.stringify([nos,ks,D]),q:`Voici des inodes de fichiers ordinaires, avec leur nombre de liens, et deux répertoires (TD, exercices 22 et 23). Ces deux répertoires contiennent tous les noms de ces inodes (on ne compte pas ${c(".")} et ${c("..")}). Coche chaque anomalie.`,
    corps:grille3(["inode","nb. de liens"],nos.map((no,i)=>[no,ks[i]]))+grille3(["répertoire 1","répertoire 2"],[[rep(0),rep(1)]]),texte:nos.map((no,i)=>no+":"+ks[i]).join(" ")+" | "+D.map(d=>d.map(y=>y.join(">")).join(" ")).join(" | "),
    champs:[{k:"multi",id:"g",o:O,seul:"rien"}],juge:cocher3(O,att,P,"les anomalies",pourquoi),etapes:E,bonne:att.length?att.map(k=>O.find(o=>o[0]===k)[1]).join(" ; "):"tout est cohérent",bonneTxt:att.join(" ")||"rien",
    repBonne:{g:att.length?att:["rien"]},repFausse:{g:P.length?(P[0].g.length?P[0].g:["rien"]):att.length?att.slice(1).concat(att.length>1?[]:["rien"]):["double"]},nature:"cohérence des liens",
    ens:{fam:"coL",nos,ks,D,deux,pieges:P.map(x=>({type:x.type,g:x.g.length?x.g:["rien"]}))}};}
const tireIn=k=>R=>{for(;;){const e=[exoIn0,exoIn1,exoIn2,R=>R()<0.5?coBlocs3(R):coLiens3(R)][k](R);if(e)return e;}};

/* ---------- US10 : les processus. Une ligne jouée comme dans le cours (un processus par commande externe et par parenthèses, ; && || et $?), les états actif, prêt, bloqué rejoués événement par événement, l'arrière-plan avec & et sleep, puis kill ---------- */
const PH10="chat.png",MOTS10=["bonjour","salut","coucou","bravo","merci"];
const env10=w=>arboDe([{n:"notes.txt",c:w+"\n"},dossier("photos",[{n:PH10,c:"x\n"}])]);
const lieu10=w=>`<p>Dans le dossier courant : le fichier ${cr("notes.txt")}, qui contient la seule ligne « ${w} », et le répertoire ${cr("photos")}, qui contient ${cr(PH10)}. Il n'y a pas de fichier ${cr("toto")}.</p>`;
const X10=(s,ok,code,out)=>({k:"x",s,ok:ok!==false,code:ok===false?code||1:0,out:out||[]});
const dit10=it=>it.k==="p"?it.L.map(dit10).join(" | "):it.k==="g"?"( "+ligne10(it.L)+" )"+(it.bg?" &":""):it.s;
const ligne10=L=>L.map(([op,it],i)=>(i?(L[i-1][1].bg?" ":" "+op+" "):"")+dit10(it)).join("");
const passe10=(op,st,lu)=>{if(lu.tout||!op||op===";"||op==="&")return true;const o=lu.inv?(op==="&&"?"||":"&&"):op;return o==="&&"?st===0:st!==0;};
function run10(L,lu,r){const ev=[];
  if(lu.prioC){const seg=[];L.forEach(([op,it],i)=>{if(!i||op===";")seg.push([]);seg[seg.length-1].push([op,it]);});
    for(const S of seg){const ch=[];S.forEach(([op,it],i)=>{if(!i||op==="||")ch.push([]);ch[ch.length-1].push([op,it]);});
      ch.forEach((C,j)=>{let go=!j||r.st!==0;C.forEach(([op,it],i)=>{if(i)go=go&&r.st===0;const e={op,it,go,av:r.st};ev.push(e);if(go){ex10(it,lu,r,e);e.st=r.st;}});});}
    return ev;}
  for(const [op,it] of L){const go=passe10(op,r.st,lu),e={op,it,go,av:r.st};ev.push(e);if(go){ex10(it,lu,r,e);e.st=r.st;}}
  return ev;}
function ex10(it,lu,r,e){
  if(it.k==="x"){r.nx++;r.ran.push(it.s.split(" ")[0]);if(it.ok)it.out.forEach(x=>{r.out.push(x);r.z.push(false);});r.st=r.stN=it.code;}
  else if(it.k==="p"){it.L.forEach((x,j)=>{r.nx++;if(j)r.npx++;r.ran.push(x.s.split(" ")[0]);});r.st=r.stN=0;}
  else if(it.k==="g"){r.ng++;r.ran.push("(");e.sub=run10(it.L,lu,r);if(it.bg)r.st=r.stN=0;}
  else{r.ni++;if(it.k==="q"){const v=lu.qSaute?r.stN:r.st;r.out.push(String(v));r.z.push(v!==0);}else if(it.out)it.out.forEach(x=>{r.out.push(x);r.z.push(false);});r.st=it.ok===false?1:0;if(it.k!=="i"&&it.k!=="q")r.stN=r.st;}}
const joue10=(L,lu)=>{const r={st:0,stN:0,out:[],z:[],ran:[],ni:0,ng:0,nx:0,npx:0};r.ev=run10(L,lu||{},r);r.n=r.nx+r.ng;r.ran.sort();return r;};
const pr10=n=>n+" processus";
const FONC10=["ls","date","ps","cat","wc","sort","head","rm"];
function bashCompte10(ligneB,ran,w){
  const cmd=`L=$PWD/.j;for f in ${FONC10.join(" ")};do eval "$f(){ echo $f >>\\"\\$L\\";command $f \\"\\$@\\";}";done;sleep(){ echo sleep >>"$L";};{ ${ligneB}${/&$/.test(ligneB)?" }":" ; }"} >/dev/null 2>&1;wait;command sort "$L" 2>/dev/null`;
  return {arbo:env10(w),cmd,args:[],nom:"./compte.sh",script:true,abs:ran};}
const ditB10=it=>it.k==="p"?it.L.map(ditB10).join(" | "):it.k==="g"?`( echo "(" >>"$L" ; `+ligneB10(it.L)+" )"+(it.bg?" &":""):it.s;
const ligneB10=L=>L.map(([op,it],i)=>(i?(L[i-1][1].bg?" ":" "+op+" "):"")+ditB10(it)).join("");
const POUR10={"&&":"&& ne lance la commande que si celle d'avant a réussi (code 0)","||":"|| ne lance la commande que si celle d'avant a échoué (code différent de 0)"};
function decrit10(ev,prof){return ev.map(e=>{const s=cr(dit10(e.it));
  if(!e.go)return `${s} : <b>pas lancée</b> : ${POUR10[e.op]}, et ${e.av?"elle a échoué":"elle a réussi"}.`;
  const it=e.it;
  if(it.k==="x")return `${s} : commande externe, 1 processus${it.ok?"":` ; elle échoue (${/toto/.test(it.s)?"toto n'existe pas":"erreur"}), mais elle a bien été lancée`}.`;
  if(it.k==="p")return `${s} : un tube, ${it.L.length} commandes externes qui tournent en même temps : ${pr10(it.L.length)}.`;
  if(it.k==="g")return `${s} : des parenthèses, donc un sous-shell (un enfant de bash) : 1 processus${it.bg?", lancé en arrière-plan":""}. Il exécute :<br>${decrit10(e.sub,prof+1).map(x=>"&nbsp;&nbsp;· "+x).join("<br>")}`;
  return `${s} : commande interne de bash, aucun processus${it.k==="cd"&&!it.ok?" (elle échoue : toto n'existe pas)":""}.`;});}
const non10=(ids,resume)=>(etape,type,titre,msg)=>({ok:false,faux:ids,resume,diag:{etape,type,titre,msg}});
const nb10=s=>{const t=propre(s).toLowerCase().replace(/nouveaux|nouveau|processus|process/g,"").trim();if(!t)return {vide:1};return /^\d+$/.test(t)?{v:+t}:{err:1};};
const uniq10=(P,att,cle)=>{const L=[];for(const x of P){const k=cle(x);if(k!==undefined&&k!==cle({v:att,out:att})&&!L.some(y=>cle(y)===k))L.push(x);}return L;};

/* palier 1 : combien de processus */
const EXT10=["ls","date","ps","ls photos","cat notes.txt","wc -l notes.txt","sort notes.txt","head -1 notes.txt","sleep 1"],RAT10=[["cat toto",1],["ls toto",2],["rm toto",1]];
const INT10=["echo fini",'echo "échec !"',"echo ok","pwd","export N=3"].map(s=>({k:"i",s,out:[]}));
const TUBE10=[["ls","wc -l"],["cat notes.txt","sort"],["sort notes.txt","head -1"],["ps","wc -l"],["ls photos","wc -l"],["cat notes.txt","sort","head -1"]];
const CD10=ok=>({k:"cd",s:ok?"cd photos":"cd toto",ok});
const GR10=[()=>[["",CD10(true)],[";",X10("ls")]],()=>[["",CD10(false)],["&&",X10("ls")]],()=>[["",CD10(true)],[";",{k:"i",s:"pwd"}]],
  ()=>[["",X10("sleep 2")],[";",{k:"i",s:'echo "fin des 2 s"'}],[";",X10("ps f")]],()=>[["",X10("date")],[";",{k:"i",s:"echo ok"}]],
  ()=>[["",X10("cat toto",false,1)],["||",{k:"i",s:'echo "échec !"'}]],()=>[["",X10("cat notes.txt")],["&&",X10("wc -l notes.txt")]]];
function item10(R){const k=R.choix(["x","x","x","r","r","i","i","p","p","g","g"]);
  if(k==="x")return X10(R.choix(EXT10));if(k==="r"){const [s,c0]=R.choix(RAT10);return X10(s,false,c0);}
  if(k==="i")return R.choix(INT10);if(k==="p")return {k:"p",L:R.choix(TUBE10).map(s=>X10(s))};
  return {k:"g",L:R.choix(GR10)(),bg:R()<0.35};}
function exoPr0(R){const w=R.choix(MOTS10),n=R.ent(2,4),L=[];
  for(let i=0;i<n;i++){const it=item10(R),av=L.length?L[L.length-1][1]:null;
    const op=!av?"":av.bg?"&":av.k==="p"||it.k==="p"?";":R.choix([";","&&","||","&&","||"]);
    if(av&&dit10(av)===dit10(it))return null;L.push([op,it]);}
  const r=joue10(L),k=r.n;if(!k)return null;const lig=ligne10(L);
  const P=uniq10([{type:"commandes internes comptées",v:k+r.ni,msg:`${c("echo")}, ${c("cd")}, ${c("pwd")} et ${c("export")} sont des commandes internes : bash les exécute lui-même, sans créer de processus.`,etape:1},
    {type:"parenthèses oubliées",v:k-r.ng,msg:`Des parenthèses ( … ) sont exécutées par un enfant de bash, un sous-shell : c'est un processus de plus, en plus des commandes externes qu'il lance.`,etape:1},
    {type:"tube compté pour un seul processus",v:k-r.npx,msg:`Dans un tube, chaque commande a son propre processus, et ils tournent en même temps : ${c("ls | wc -l")} en crée 2.`,etape:1},
    {type:"&& et || oubliés",v:joue10(L,{tout:1}).n,msg:`Une commande après ${c("&&")} ou ${c("||")} n'est pas toujours lancée : ${c("&&")} seulement si la commande d'avant a réussi, ${c("||")} seulement si elle a échoué. Une commande pas lancée ne crée pas de processus.`,etape:0},
    {type:"&& et || inversés",v:joue10(L,{inv:1}).n,msg:`${c("&&")} lance la suite quand la commande d'avant a réussi (code 0), ${c("||")} quand elle a échoué. Tu as fait l'inverse.`,etape:0},
    {type:"bash compté",v:k+1,msg:`On compte les nouveaux processus : le bash qui lit la ligne existait déjà.`,etape:2}],k,x=>x.v);
  if(!P.length)return null;
  const E=[{w:`Ce qui est lancé, de gauche à droite :<br>${decrit10(r.ev,0).join("<br>")}`,why:`${c(";")} enchaîne toujours ; ${c("&&")} seulement après une réussite (code 0) ; ${c("||")} seulement après un échec. Une commande pas lancée ne crée rien.`,pts:1.5},
    {w:`Commandes externes lancées : ${r.nx} ; parenthèses lancées : ${r.ng}${r.ni?` ; commandes internes (sans processus) : ${r.ni}`:""}.`,why:`Une commande externe : bash fait un fork, puis l'enfant fait un exec. Des parenthèses : un fork de bash, le sous-shell. Une commande interne s'exécute dans bash.`,pts:1},
    {w:`${[r.nx?r.nx+" commande"+(r.nx>1?"s":"")+" externe"+(r.nx>1?"s":""):"",r.ng?r.ng+" sous-shell"+(r.ng>1?"s":""):""].filter(Boolean).join(" + ")} : <b>${pr10(k)}</b>`,why:/&$|& /.test(lig.replace(/&&/g,""))?`Le ${c("&")} ne change pas le compte : bash n'attend pas la fin, c'est tout.`:`Le bash qui lit la ligne n'est pas compté : il existait déjà.`,pts:0.5}];
  return {sig:"R0"+lig,q:`Combien de nouveaux processus cette ligne de commande crée-t-elle ?`,corps:lieu10(w)+blocr(lig),texte:"processus créés : "+lig,
    champs:[{k:"champ",id:"n",nom:"processus",label:"Le nombre de nouveaux processus :",ex:"par exemple 3",apercu:false,sym:[]}],
    juge:rep=>{const v=nb10(rep.n);if(v.vide)return {incomplet:"Écris un nombre."};if(v.err)return {incomplet:"Écris un nombre, par exemple 3."};if(v.v===k)return {ok:true};
      const no=non10(["n"],"Pas tout à fait : ce n'est pas le nombre de nouveaux processus."),x=P.find(p=>p.v===v.v);
      return x?no(x.etape,x.type,"Où ça part : "+x.type+".",x.msg):no(1,"compte faux","Où ça part : le compte.","Reprends la ligne commande par commande : qui est lancé, et chaque commande externe ou parenthèse lancée, c'est 1 processus.");},
    etapes:E,bonne:pr10(k),bonneTxt:String(k),repBonne:{n:String(k)},repFausse:{n:String(P[0].v)},nature:"processus d'une ligne",
    ens:{fam:"compte",L,w,att:k,pieges:P.map(x=>({type:x.type,n:String(x.v)})),bash:[bashCompte10(ligneB10(L),r.ran,w)]}};}

/* palier 2 : ce qu'affiche une ligne avec ; && || et $? */
function brique10(R,w,deb){const k=R.choix(deb?["c","c","t","t","l"]:["c","t","e","e","e","q","q"]);
  if(k==="c")return R()<0.5?X10("cat notes.txt",true,0,[w]):X10("cat toto",false,1);
  if(k==="l")return X10("ls photos",true,0,[PH10]);
  if(k==="t"){const [s,ok]=R.choix([["[ -f notes.txt ]",true],["[ -f toto ]",false],["[ -d photos ]",true],["[ -d notes.txt ]",false],["[ -f photos ]",false]]);return {k:"t",s,ok};}
  if(k==="q")return {k:"q",s:"echo $?"};
  const m=R.choix(["oui","non","fini","ok","raté","encore"]);return {k:"i",s:"echo "+m,out:[m]};}
function exoPr1(R){const w=R.choix(MOTS10),n=R.ent(3,5),L=[];
  for(let i=0;i<n;i++){const it=brique10(R,w,!i||(i===2&&R()<0.4)),av=L.length?L[L.length-1][1]:null;if(av&&av.s===it.s)return null;L.push([i?R.choix([";","&&","||","&&","||"]):"",it]);}
  const r=joue10(L),att=r.out;if(!att.length||att.length>5)return null;
  if(r.ev.every(e=>e.go)&&R()<0.8)return null;
  const nz=r.z;
  const lig=ligne10(L),mem=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const MUT=[["&& et || oubliés",{tout:1},`Une commande après ${c("&&")} ou ${c("||")} n'est pas toujours lancée : ${c("&&")} seulement si la commande d'avant a réussi, ${c("||")} seulement si elle a échoué.`],
    ["&& et || inversés",{inv:1},`${c("&&")} lance la suite quand la commande d'avant a réussi (code 0), ${c("||")} quand elle a échoué. Tu as fait l'inverse.`],
    ["&& lu comme prioritaire",{prioC:1},`Dans bash, ${c("&&")} et ${c("||")} ont la même priorité : ils se lisent de gauche à droite. Chaque ${c("&&")} ou ${c("||")} regarde seulement le code de la dernière commande qui a tourné.`],
    ["$? d'une autre commande",{qSaute:1},`${cr("$?")} est le code de retour de la commande lancée juste avant, même si c'est un ${c("echo")} : un echo réussit toujours, donc 0.`]];
  const P=[];for(const [type,lu,msg] of MUT){const m=joue10(L,lu);if(!mem(m.out,att)&&!P.some(p=>mem(p.out,m.out))){const i=r.ev.findIndex((e,j)=>!m.ev[j]||e.go!==m.ev[j].go);P.push({type,out:m.out,msg,etape:i<0?r.ev.length:i});}}
  if(!P.length)return null;
  const E=r.ev.map(e=>{const s=cr(dit10(e.it)),it=e.it;let w2;
    if(!e.go)w2=`${s} : <b>pas lancée</b> : ${POUR10[e.op]}, et ${e.av?`elle a échoué (code ${e.av})`:"elle a réussi (code 0)"}. ${cr("$?")} reste à ${e.av}.`;
    else if(it.k==="x")w2=it.ok?`${s} : affiche ${it.out.map(x=>"« "+x+" »").join(", ")} et réussit : code 0.`:`${s} : toto n'existe pas, cat échoue : code 1. Son message d'erreur part sur la sortie d'erreur, il ne compte pas ici.`;
    else if(it.k==="t")w2=`${s} : le test est ${it.ok?"vrai : code 0":"faux : code 1"}. Il n'affiche rien.`;
    else if(it.k==="q")w2=`${s} : affiche le code de la commande d'avant : <b>${e.av}</b>. Puis echo réussit : code 0.`;
    else w2=`${s} : affiche « ${it.out[0]} », code 0.`;
    return {w:w2,why:e.go?(e.op==="&&"||e.op==="||"?`${POUR10[e.op]} : c'est le cas.`:e.op===";"?`${c(";")} enchaîne toujours.`:"La première commande est toujours lancée."):`${c("&&")} et ${c("||")} ont la même priorité et se lisent de gauche à droite.`,pts:1};});
  E.push({w:`<b>La ligne affiche</b> :${pave(att)}`,why:`Seule la sortie standard compte : les messages d'erreur partent ailleurs.${att.some((x,i)=>nz[i])?` Un code d'échec différent de 1 est accepté aussi : tout nombre autre que 0 veut dire échec.`:""}`,pts:1});
  const lis=s=>{let L0=String(s==null?"":s).split("\n").map(propre).filter(Boolean);if(L0.length===1&&att.length>1)L0=L0[0].split(/[\s,;]+/).filter(Boolean);return L0;};
  const colle=(L0,A,z)=>L0.length===A.length&&L0.every((x,i)=>x===A[i]||(z&&z[i]&&/^[1-9]\d*$/.test(x)));
  return {sig:"R1"+w+lig,q:`Qu'affiche cette ligne de commande ? Écris les lignes dans l'ordre, sans les messages d'erreur.`,corps:lieu10(w)+blocr(lig),texte:"affichage de : "+lig,
    champs:[{k:"code",id:"s",nom:"affichage",label:"Ce que la ligne affiche, ligne par ligne&nbsp;:",lignes:Math.max(3,att.length+1)}],
    juge:rep=>{const L0=lis(rep.s);if(!L0.length)return {incomplet:"Écris ce que la ligne affiche, ligne par ligne."};if(colle(L0,att,nz))return {ok:true};
      const no=non10(["s"],"Pas tout à fait : ce n'est pas ce que la ligne affiche."),m=P.find(p=>colle(L0,p.out));
      if(m)return no(Math.min(m.etape,E.length-1),m.type,"Où ça part : "+m.type+".",m.msg);
      if(L0.length===att.length&&L0.some((x,i)=>nz[i]&&x==="0"))return no(E.length-1,"échec lu comme une réussite","Où ça part : un code de retour.","Une commande qui échoue renvoie un code différent de 0 : 0 veut dire réussite.");
      return no(E.length-1,"affichage différent","Où ça part : ce que la ligne affiche.","Reprends la ligne de gauche à droite : à chaque commande, note si elle est lancée, ce qu'elle affiche et son code. La correction le fait pas à pas.");},
    etapes:E,bonne:pave(att),bonneTxt:att.join(" ⏎ "),repBonne:{s:att.join("\n")},repFausse:{s:P[0].out.join("\n")||"rien"},nature:"; && || et $?",
    ens:{fam:"aff",L,w,att,nz,pieges:P.map(x=>({type:x.type,s:x.out.join("\n")})).filter(x=>x.s),bash:[{arbo:env10(w),cmd:lig,args:[],nom:"./ligne.sh",script:true,abs:att}]}};}

/* palier 3 : actif, prêt, bloqué */
const ET10={a:"actif",p:"prêt",b:"bloqué"},FL10={dem:2,quant:1,arr:3,elit:4},VERS10={dem:"b",quant:"p",arr:"p",elit:"a"};
const RES10=[{d:"attend que l'utilisateur tape une ligne au clavier (read)",att:"attend le clavier",a:X=>`L'utilisateur tape la ligne attendue par ${X}, puis Entrée.`},
  {d:"demande à lire un fichier sur le disque",att:"attend le disque",a:X=>`La lecture du disque demandée par ${X} est finie.`},
  {d:"lance ls, puis attend sa fin (wait)",att:"attend la fin de son enfant",a:X=>`L'enfant de ${X} se termine.`},
  {d:"appelle sleep(5) : il s'endort 5 secondes",att:"dort 5 secondes",a:X=>`Les 5 secondes de ${X} sont écoulées.`}];
const POURQ10={dem:"Il lui manque une ressource autre que le processeur : il est bloqué.",quant:"Il ne lui manque que le processeur : il redevient prêt.",arr:"Il a sa ressource, mais pas le processeur : il passe par prêt, jamais directement actif.",elit:"L'ordonnanceur choisit l'élu parmi les processus prêts."};
function suite10(R){const N=["P1","P2","P3"],st={},res={},ini={};const A0=R.choix(N);
  for(const X of N){st[X]=X===A0?"a":R.choix(["p","b"]);if(st[X]==="b")res[X]=R.choix(RES10);ini[X]={s:st[X],r:res[X]};}
  const E=[],n=R.ent(4,6);
  for(let t=0;t<n+1;t++){const A=N.find(X=>st[X]==="a"),pr=N.filter(X=>st[X]==="p"),bl=N.filter(X=>st[X]==="b"),O=[];
    if(t>=n&&(A||!pr.length))break;
    if(!A&&pr.length)O.push(...pr.map(X=>["elit",X]));
    else{if(A){O.push(["dem",A],["dem",A]);if(pr.length)O.push(["quant",A]);}bl.forEach(X=>O.push(["arr",X],["arr",X]));}
    if(!O.length)return null;const [k,X]=R.choix(O);let r=null;
    if(k==="dem"){r=R.choix(RES10);res[X]=r;}else if(k==="arr")r=res[X];
    st[X]=VERS10[k];E.push({k,X,r});}
  if(!E.some(e=>e.k==="arr")||!E.some(e=>e.k==="elit")||E.length>7)return null;
  return {N,ini,E,fin:st};}
const texteEv10=e=>e.k==="dem"?`${e.X}, actif, ${e.r.d}.`:e.k==="quant"?`Le temps accordé à ${e.X} sur le processeur est écoulé : l'ordonnanceur le lui reprend.`:e.k==="arr"?e.r.a(e.X):`L'ordonnanceur élit ${e.X}.`;
const etatsDe10=(S,V)=>{const st={};S.N.forEach(X=>st[X]=S.ini[X].s);S.E.forEach(e=>st[e.X]=V[e.k]);return st;};
function exoPr2(R){const S=suite10(R);if(!S)return null;const f=R.choix([0,0,1,1,2]),N=S.N;
  const corps=`<p>Un seul processeur. Au départ :</p>${grille3(["processus","état"],N.map(X=>[X,ET10[S.ini[X].s]+(S.ini[X].r?" ("+S.ini[X].r.att+")":"")]))}<p>Puis, dans l'ordre :</p><ol>${S.E.map(e=>`<li>${texteEv10(e)}</li>`).join("")}</ol><p class="muted">Les flèches du cours : 1 actif → prêt, 2 actif → bloqué, 3 bloqué → prêt, 4 prêt → actif.</p>`;
  const de10=x=>/^[aeiouéè]/.test(x)?"d'"+x:"de "+x;
  const E=S.E.map((e,i)=>({w:`Événement ${i+1} : ${e.X} passe ${de10(ET10[i?(S.E.slice(0,i).reverse().find(x=>x.X===e.X)?VERS10[S.E.slice(0,i).reverse().find(x=>x.X===e.X).k]:S.ini[e.X].s):S.ini[e.X].s])} à <b>${ET10[VERS10[e.k]]}</b> : flèche ${FL10[e.k]}.`,why:POURQ10[e.k],pts:1}));
  const fin=S.fin,texte=N.map(X=>X+":"+S.ini[X].s).join(" ")+" | "+S.E.map(e=>e.k+" "+e.X).join(", ");
  const dernier=X=>{for(let i=S.E.length-1;i>=0;i--)if(S.E[i].X===X)return i;return 0;};
  if(f===1){const att=S.E.map(e=>FL10[e.k]).join(", ");
    const MU=[["prêt et bloqué confondus",{dem:1,quant:2},"Actif → bloqué (flèche 2) : il attend autre chose que le processeur (clavier, disque, fin d'un enfant). Actif → prêt (flèche 1) : on lui reprend le processeur alors qu'il pourrait continuer."],
      ["réveil compté comme une élection",{arr:4},"Quand ce qu'il attendait arrive, un processus bloqué devient prêt (flèche 3), pas actif : il doit encore être élu."],
      ["flèches 3 et 4 inversées",{arr:4,elit:3},"3 : bloqué → prêt (sa ressource arrive). 4 : prêt → actif (l'ordonnanceur l'élit)."]];
    const P=[];for(const [type,m,msg] of MU){const v=S.E.map(e=>m[e.k]||FL10[e.k]).join(", ");if(v!==att&&!P.some(p=>p.v===v))P.push({type,v,msg,etape:S.E.findIndex(e=>m[e.k])});}
    if(!P.length)return null;
    E.push({w:`<b>${att}</b>`,why:"On ne devient actif qu'en passant par prêt.",pts:0.5});
    return {sig:"R2f"+texte,q:`Quelle flèche du cours chaque événement fait-il suivre ? Donne les numéros, dans l'ordre des événements.`,corps,texte:"flèches : "+texte,
      champs:[{k:"champ",id:"f",nom:"flèches",label:"Les numéros des flèches :",ex:"par exemple 2, 4, 3",apercu:false,sym:[]}],
      juge:rep=>{const t=propre(rep.f);if(!t)return {incomplet:"Écris les numéros des flèches."};if(/[^\d\s,;.\-→>]/.test(t)||/[05-9]/.test(t))return {incomplet:"Écris seulement des numéros de 1 à 4, par exemple 2, 4, 3."};
        const v=(t.match(/[1-4]/g)||[]).join(", ");if(v===att)return {ok:true};const no=non10(["f"],"Pas tout à fait : ce ne sont pas les bonnes flèches.");
        if(v.split(", ").length!==S.E.length)return no(0,"nombre de flèches","Où ça part : le nombre de flèches.",`Il y a ${S.E.length} événements : une flèche pour chacun.`);
        const m=P.find(p=>p.v===v);if(m)return no(m.etape,m.type,"Où ça part : "+m.type+".",m.msg);
        const i=v.split(", ").findIndex((x,j)=>+x!==FL10[S.E[j].k]);return no(i,"flèche fausse","Où ça part : l'événement "+(i+1)+".",POURQ10[S.E[i].k]);},
      etapes:E,bonne:att,bonneTxt:att,repBonne:{f:att},repFausse:{f:P[0].v},nature:"états : les flèches",ens:{fam:"fleches",S:{N,ini:S.ini,E:S.E.map(e=>({k:e.k,X:e.X}))},att,pieges:P.map(p=>({type:p.type,f:p.v}))}};}
  const stat=f===2,O=stat?[["R","R"],["S","S"]]:[["a","actif"],["p","prêt"],["b","bloqué"]],val=x=>stat?(x==="b"?"S":"R"):x;
  const att={};N.forEach((X,i)=>att["e"+i]=val(fin[X]));
  const MU=stat?[["prêt lu comme S",x=>x==="a"?"R":"S","Dans ps, R (run) veut dire prêt ou élu : un processus prêt est marqué R lui aussi. S (sleep) : il attend un événement, il est bloqué."],
      ["R et S inversés",x=>x==="b"?"R":"S","R (run) : prêt ou élu. S (sleep) : en attente d'un événement, donc bloqué."]].map(([t,g,m])=>[t,null,m,g])
    :[["réveil direct à actif",{arr:"a"},"Quand ce qu'il attendait arrive, un processus bloqué devient prêt, pas actif : il doit encore être élu par l'ordonnanceur."],
      ["fin du temps lue comme bloqué",{quant:"b"},"Quand son temps est écoulé, il ne lui manque que le processeur : il est prêt, pas bloqué."],
      ["attente lue comme prêt",{dem:"p"},"Un processus qui attend le clavier, le disque ou la fin d'un enfant est bloqué : il ne pourrait pas avancer même avec le processeur."]];
  const P=[];for(const [type,m,msg,g] of MU){const st=m?etatsDe10(S,Object.assign({},VERS10,m)):fin,v={};N.forEach((X,i)=>v["e"+i]=g?g(st[X]):val(st[X]));
    if(JSON.stringify(v)!==JSON.stringify(att)&&!P.some(p=>JSON.stringify(p.v)===JSON.stringify(v)))P.push({type,v,msg,etape:m?Math.max(0,S.E.findIndex(e=>m[e.k])):S.E.length});}
  if(!P.length)return null;
  E.push({w:`<b>À la fin : ${N.map(X=>`${X} ${stat?val(fin[X])+" ("+ET10[fin[X]]+")":ET10[fin[X]]}`).join(", ")}</b>`,why:stat?"Dans ps, la colonne STAT montre R (run) pour un processus prêt ou élu, S (sleep) pour un processus en attente d'un événement.":"L'état d'un processus est celui que lui a donné le dernier événement qui le touche.",pts:stat?1:0.5});
  return {sig:"R2"+f+texte,q:stat?`À la fin, que montre ${c("ps")} dans la colonne STAT pour chaque processus : R ou S ?`:`Dans quel état est chaque processus à la fin ?`,corps,texte:(stat?"STAT : ":"états : ")+texte,
    champs:N.map((X,i)=>({k:"choix",id:"e"+i,titre:X+" :",o:O})),
    juge:rep=>{if(N.some((X,i)=>!rep["e"+i]))return {incomplet:stat?"Choisis R ou S pour chaque processus.":"Choisis l'état de chaque processus."};
      const faux=N.map((X,i)=>"e"+i).filter(k=>rep[k]!==att[k]);if(!faux.length)return {ok:true};
      const no=non10(faux,"Pas tout à fait : "+(faux.length>1?"des états sont faux.":"un état est faux.")),m=P.find(p=>N.every((X,i)=>rep["e"+i]===p.v["e"+i]));
      if(m)return no(Math.min(m.etape,E.length-1),m.type,"Où ça part : "+m.type+".",m.msg);
      const X=N[+faux[0].slice(1)],i=dernier(X);
      return no(stat?E.length-1:i,"état faux","Où ça part : "+X+".",stat?"R (run) : prêt ou élu. S (sleep) : bloqué, en attente d'un événement. Retrouve d'abord l'état de chaque processus, événement par événement.":`Le dernier événement qui touche ${X} est le ${i+1}e : ${POURQ10[S.E[i].k]}`);},
    etapes:E,bonne:N.map(X=>X+" "+(stat?val(fin[X]):ET10[fin[X]])).join(", "),bonneTxt:N.map(X=>X+" "+val(fin[X])).join(" "),repBonne:att,repFausse:P[0].v,nature:stat?"états : ps STAT":"états : à la fin",
    ens:{fam:stat?"stat":"etats",S:{N,ini:S.ini,E:S.E.map(e=>({k:e.k,X:e.X}))},att,pieges:P.map(p=>Object.assign({type:p.type},p.v))}};}

/* palier 4 : l'arrière-plan, comme au TD (exercices 37 et 38) */
const LET10=["A","B","C","D","E"];
const ditT10=it=>it.k==="g"?`( sleep ${it.a} ; echo ${it.X}${it.ps?" ; ps f":""} ) &`:it.k==="e"?`echo ${it.X}`:it.k==="s"?`sleep ${it.b}`:"wait";
const ligneT10=L=>L.map((it,i)=>(i?(L[i-1].k==="g"?" ":" ; "):"")+ditT10(it)).join("");
function temps10(L,lu){lu=lu||{};let t=0;const O=[],fins=[];
  L.forEach((it,i)=>{if(it.k==="g"){if(lu.attend){t+=it.a;O.push({X:it.X,t,i});}else{O.push({X:it.X,t:t+it.a,i,bg:1});fins.push(t+it.a);}}
    else if(it.k==="s")t+=it.b;else if(it.k==="e")O.push({X:it.X,t,i});else if(!lu.sansWait)t=Math.max(t,...fins);});
  return O;}
const ordre10=(O,lu)=>(lu&&lu.lance?O.slice().sort((a,b)=>a.i-b.i):lu&&lu.bashFin?[...O.filter(o=>!o.bg).sort((a,b)=>a.i-b.i),...O.filter(o=>o.bg).sort((a,b)=>a.t-b.t)]:O.slice().sort((a,b)=>a.t-b.t)).map(o=>o.X);
function exoPr3(R){const nG=R.ent(2,3),tue=R()<0.2,X=R.mel(LET10),L=[];let j=0;
  for(let g=0;g<nG;g++)L.push({k:"g",a:R.ent(1,6),X:X[j++],ps:!tue&&R()<0.4});
  if(tue){L.push({k:"e",X:X[j++]});
    const p0=R.ent(2100,8800),pid=L.filter(x=>x.k==="g").map((x,i)=>p0+i*R.ent(1,4)+i*3),G=L.filter(x=>x.k==="g");G.forEach(x=>x.a=R.ent(20,60));
    const q=R.ent(0,nG-1),cible=G[q],jn=q+1,pj=pid[q],ordreFin=G.slice().sort((a,b)=>a.a-b.a);if(new Set(G.map(x=>x.a)).size<nG)return null;
    const k2=ordreFin.indexOf(cible)+1,lig=ligneT10(L);
    const P=[{type:"numéro de tâche pris pour un PID",c:"kill "+jn,msg:`${c("kill "+jn)} vise le processus de PID ${jn}, pas la tâche ${jn} : pour une tâche, il faut le ${c("%")}, ${c("kill %"+jn)}.`},
      ...(k2!==jn?[{type:"tâches numérotées dans l'ordre où elles finissent",c:"kill %"+k2,msg:`Les numéros [1], [2], [3] suivent l'ordre de lancement des ${c("&")}, de gauche à droite, pas l'ordre où les groupes finissent.`}]:[]),
      {type:"Ctrl-C sur une tâche de fond",c:"Ctrl-C",msg:`Ctrl-C n'arrête que le processus au premier plan. Ce groupe est en arrière-plan : il faut ${c("kill")}, ou le ramener d'abord avec ${c("%"+jn)}.`},
      {type:"% devant un PID",c:"kill %"+pj,msg:`Le ${c("%")} se met devant un numéro de tâche (${c("%"+jn)}) ; un PID s'écrit seul : ${c("kill "+pj)}.`},
      {type:"ramené sans être arrêté",c:"%"+jn,msg:`${c("%"+jn)} ramène la tâche au premier plan, sans l'arrêter : il faut ensuite Ctrl-C. Ou directement ${c("kill %"+jn)}.`}];
    const lis=s=>String(s==null?"":s).split("\n").map(x=>propre(x).toLowerCase().replace(/\s+/g," ").replace(/^\$ /,"")).filter(Boolean);
    const ctrlc=x=>/^(ctrl|control|contrôle|ctl)\s*[-+ ]?\s*c$|^\^c$/.test(x);
    const tueOk=x=>{const m=/^kill(?: -(?:9|15|kill|term|sigkill|sigterm))? (%?)(\d+)$/.exec(x);return m&&(m[1]?+m[2]===jn:+m[2]===pj);};
    const juge=rep=>{const T=lis(rep.c);if(!T.length)return {incomplet:"Écris la commande."};
      if(T.length===1&&tueOk(T[0]))return {ok:true};
      if(T.length===1&&ctrlc(T[0]))return non10(["c"],"Pas tout à fait : cette commande n'arrête pas ce groupe.")(2,"Ctrl-C sur une tâche de fond","Où ça part : Ctrl-C sur une tâche de fond.",P.find(p=>p.c==="Ctrl-C").msg);
      if(T.length===1&&(T[0]==="%"+jn||T[0]==="fg %"+jn))return non10(["c"],"Pas tout à fait : cette commande n'arrête pas ce groupe.")(2,"ramené sans être arrêté","Où ça part : ramené sans être arrêté.",P.find(p=>p.c==="%"+jn).msg);
      if(T.length===2&&(T[0]==="%"+jn||T[0]==="fg %"+jn||T[0]==="fg "+jn)&&ctrlc(T[1]))return {ok:true};
      const no=non10(["c"],"Pas tout à fait : cette commande n'arrête pas ce groupe."),t=T.join(" ; ");
      for(const p of P)if(t===p.c.toLowerCase())return no(p.type==="Ctrl-C sur une tâche de fond"||p.type==="ramené sans être arrêté"?2:p.type==="numéro de tâche pris pour un PID"||p.type==="% devant un PID"?2:1,p.type,"Où ça part : "+p.type+".",p.msg);
      const m=/^kill(?: -\S+)? (%?)(\d+)$/.exec(T[0]);
      if(m&&m[1])return no(1,"pas la bonne tâche","Où ça part : le numéro de la tâche.",`Le groupe qui affiche ${it2(cible)} est le ${jn===1?"1er":jn+"e"} lancé avec ${c("&")} : c'est la tâche [${jn}].`);
      if(m)return no(1,"pas le bon PID","Où ça part : le PID.",`Le PID de la tâche [${jn}] est celui que bash a écrit à côté : ${pj}.`);
      return no(2,"commande qui n'arrête rien","Où ça part : la commande.",`Pour arrêter une tâche de fond : ${c("kill %"+jn)} (son numéro de tâche) ou ${c("kill "+pj)} (son PID).`);};
    const it2=x=>"« "+x.X+" »";
    const E=[{w:`Chaque ${c("( … ) &")} est une tâche de fond. bash les numérote [1], [2]${nG>2?", [3]":""} dans l'ordre où il les lance, de gauche à droite, et écrit à côté le PID du sous-shell.`,why:"Ce sont les numéros que montre la commande jobs.",pts:1},
      {w:`Le groupe qui affiche ${it2(cible)} est le ${jn===1?"1er":jn+"e"} : la tâche [${jn}], de PID ${pj}.`,why:`Peu importe quand il finit : le numéro vient du lancement.`,pts:1},
      {w:`<b>${c("kill %"+jn)}</b> ou <b>${c("kill "+pj)}</b>`,why:`Ctrl-C ne touche que le premier plan. On peut aussi ramener la tâche avec ${c("%"+jn)}, puis Ctrl-C ; ${c("kill -9")} s'il résiste.`,pts:1}];
    const dejà=G.map((x,i)=>`[${i+1}] ${pid[i]}`).join("\n");
    return {sig:"R3k"+lig+pid.join()+q,q:`Juste après cette ligne, bash affiche les numéros des tâches. Avant que le groupe qui affiche ${it2(cible)} ait fini, écris une commande qui l'arrête.`,
      corps:blocr(lig)+`<p>bash affiche aussitôt :</p>`+blocr(dejà),texte:lig+" | "+dejà.replace(/\n/g," ")+" | arrêter "+cible.X,
      champs:[{k:"code",id:"c",nom:"commande",label:"La commande :",lignes:2,ex:"kill …",sym:[["kill ","kill "],["%","%"],["kill -9 ","kill -9 "]]}],juge,etapes:E,
      bonne:`${c("kill %"+jn)} ou ${c("kill "+pj)}`,bonneTxt:"kill %"+jn,repBonne:{c:"kill %"+jn},repFausse:{c:P[0].c},nature:"arrêter une tâche de fond",
      ens:{fam:"kill",L,pid,cible:cible.X,att:jn,pj,pieges:P.map(p=>({type:p.type,c:p.c}))}};}
  const nE=R.ent(1,2);for(let e=0;e<nE;e++)L.splice(R.ent(1,L.length),0,{k:"e",X:X[j++]});
  if(R()<0.4)L.splice(R.ent(1,L.length),0,{k:"s",b:R.ent(1,4)});
  if(R()<0.3){L.splice(L.length-1,0,{k:"w"});if(L[L.length-1].k!=="e")return null;}
  if(L[L.length-1].k==="g"&&L.some(x=>x.k==="w"))return null;
  const O=temps10(L);if(new Set(O.map(o=>o.t)).size<O.length)return null;
  const att=ordre10(O),lig=ligneT10(L),G=L.filter(x=>x.k==="g");
  const k=G.length*2+G.filter(x=>x.ps).length+L.filter(x=>x.k==="s").length,nEcho=O.length;
  const MO=[["lancé en premier, affiché en premier",{lance:1},`Le ${c("&")} lance le groupe en arrière-plan : bash n'attend pas sa fin et passe tout de suite à la suite. Chaque groupe affiche après son sleep : c'est le temps qui donne l'ordre.`],
    ["bash attend les &",{attend:1},`Avec ${c("&")}, bash n'attend pas : les groupes tournent en même temps que la suite de la ligne.`],
    ["echo de bash en dernier",{bashFin:1},`Un ${c("echo")} au premier plan s'affiche dès que bash y arrive : il n'attend pas les tâches de fond${L.some(x=>x.k==="s")?", seulement les sleep au premier plan":""}.`],
    ...(L.some(x=>x.k==="w")?[["wait oublié",{sansWait:1},`${c("wait")} fait attendre bash jusqu'à la fin de toutes ses tâches de fond : ce qui vient après s'affiche en dernier.`]]:[])];
  const PO=[];for(const [type,lu,msg] of MO){const v=lu.lance||lu.bashFin?ordre10(O,lu):ordre10(temps10(L,lu));if(v.join()!==att.join()&&!PO.some(p=>p.v.join()===v.join()))PO.push({type,v,msg});}
  const PN=uniq10([{type:"echo compté",v:k+nEcho,msg:`${c("echo")} et ${c("wait")} sont des commandes internes : aucun processus.`},
    {type:"parenthèses oubliées",v:k-G.length,msg:`Chaque ( … ) est exécutée par un enfant de bash, un sous-shell : 1 processus par groupe, en plus de ce qu'il lance.`},
    {type:"sleep pris pour une commande interne",v:k-G.length-L.filter(x=>x.k==="s").length,msg:`${c("sleep")} est une commande externe (${c("/usr/bin/sleep")}) : chaque sleep est un processus.`},
    {type:"seulement les groupes",v:G.length,msg:`Chaque groupe est un processus, mais il en crée d'autres : son sleep${G.some(x=>x.ps)?" et son ps":""}.`}],k,x=>x.v);
  if(!PO.length||!PN.length||PO[0].v.join()===att.join())return null;
  const quand=O.slice().sort((a,b)=>a.t-b.t);
  const E=[{w:`Le temps, ligne lue de gauche à droite :<br>${(()=>{let t=0;const fins=[];return L.map(it=>{const s=cr(ditT10(it));
      if(it.k==="g"){fins.push(t+it.a);return `${s} : lancé à ${t} s, en arrière-plan ; il affiche ${it.X} à ${t+it.a} s.`;}
      if(it.k==="s"){t+=it.b;return `${s} : au premier plan, bash attend : on est à ${t} s.`;}
      if(it.k==="e")return `${s} : bash affiche ${it.X} tout de suite, à ${t} s.`;
      t=Math.max(t,...fins);return `${s} : bash attend la fin de ses tâches de fond : on est à ${t} s.`;}).join("<br>");})()}`,why:`Avec ${c("&")}, bash n'attend pas : la suite de la ligne part aussitôt. Un ${c("sleep")} au premier plan, lui, le fait attendre.`,pts:1.5},
    {w:`Dans l'ordre des temps : ${quand.map(o=>`${o.X} (${o.t} s)`).join(", ")}.`,why:"Les groupes tournent en parallèle : c'est la fin de leur sleep qui décide.",pts:1},
    {w:`Processus : ${G.length} sous-shell${G.length>1?"s":""}, ${G.length} sleep lancé${G.length>1?"s":""} par eux${G.some(x=>x.ps)?`, ${G.filter(x=>x.ps).length} ps`:""}${L.some(x=>x.k==="s")?", 1 sleep au premier plan":""} : <b>${pr10(k)}</b>.`,why:`${c("echo")} et ${c("wait")} sont internes. Comme au TD, exercice 37 : 2 groupes ( sleep ; echo ; ps ) font 6 processus.`,pts:1},
    {w:`<b>${pr10(k)} ; affichage :</b>${pave(att)}`,why:"On ne peut pas prédire l'ordre de départ des processus (c'est l'ordonnanceur qui choisit), mais les sleep de longueurs différentes fixent l'ordre des affichages.",pts:0.5}];
  const lis=s=>{let L0=String(s==null?"":s).split("\n").map(x=>propre(x).toUpperCase()).filter(Boolean);if(L0.length===1&&att.length>1)L0=L0[0].split(/[\s,;]+/).filter(Boolean);return L0;};
  const juge=rep=>{const v=nb10(rep.n),L0=lis(rep.o);if(v.vide||!L0.length)return {incomplet:"Réponds aux deux questions : le nombre de processus et l'ordre des affichages."};if(v.err)return {incomplet:"Écris un nombre de processus, par exemple 4."};
    const okN=v.v===k,okO=L0.join()===att.join();if(okN&&okO)return {ok:true};
    const no=non10([...(okN?[]:["n"]),...(okO?[]:["o"])],"Pas tout à fait : "+(okN?"l'ordre des affichages est faux.":okO?"le nombre de processus est faux.":"le nombre de processus et l'ordre sont faux."));
    if(!okO){const m=PO.find(p=>p.v.join()===L0.join());if(m)return no(0,m.type,"Où ça part : "+m.type+".",m.msg);
      return no(1,"ordre faux","Où ça part : l'ordre des affichages.",L0.slice().sort().join()===att.slice().sort().join()?"Ce sont les bons messages, mais pas dans le bon ordre : note l'heure où chacun s'affiche, comme dans la correction.":`Il y a ${att.length} messages : ${att.slice().sort().join(", ")}, un par echo.`);}
    const m=PN.find(p=>p.v===v.v);if(m)return no(2,m.type,"Où ça part : "+m.type+".",m.msg);
    return no(2,"compte faux","Où ça part : le compte des processus.","Compte 1 processus par groupe ( … ), plus chaque commande externe qu'il lance (sleep, ps), plus les sleep au premier plan.");};
  return {sig:"R3"+lig,q:`Combien de nouveaux processus cette ligne crée-t-elle ? Et dans quel ordre les messages des ${c("echo")} s'affichent-ils (sans la sortie de ps) ?`,corps:blocr(lig),texte:"arrière-plan : "+lig,
    champs:[{k:"champ",id:"n",nom:"processus",label:"Le nombre de nouveaux processus :",ex:"par exemple 4",apercu:false,sym:[]},{k:"code",id:"o",nom:"affichage",label:"Les messages, dans l'ordre où ils s'affichent&nbsp;:",lignes:Math.max(3,att.length+1)}],
    juge,etapes:E,bonne:`${pr10(k)} ; ${att.join(", ")}`,bonneTxt:k+" ; "+att.join(" "),repBonne:{n:String(k),o:att.join("\n")},repFausse:{n:String(PN[0].v),o:PO[0].v.join("\n")},nature:"arrière-plan, comme au TD 37",
    ens:{fam:"td37",L,att,k,piegesO:PO.map(p=>({type:p.type,o:p.v.join("\n")})),piegesN:PN.map(p=>({type:p.type,n:String(p.v)})),
      bash:[bashCompte10(lig.replace(/\( sleep/g,`( echo "(" >>"$L" ; sleep`),[...G.map(()=>"("),...G.map(()=>"sleep"),...G.filter(x=>x.ps).map(()=>"ps"),...L.filter(x=>x.k==="s").map(()=>"sleep")].sort(),"x")]}};}
const tirePr=k=>R=>{for(;;){const e=[exoPr0,exoPr1,exoPr2,exoPr3][k](R);if(e)return e;}};
/* ---------- US9 : le C sous Unix. argc et argv, les étapes de gcc, le passage par valeur et la portée, un programme entier lancé avec ses paramètres ; chaque programme est compilé et lancé par le vrai gcc ---------- */
const blocC=t=>d36(window.W&&window.W.code?window.W.code(t,"c"):`<pre>${esc(t)}</pre>`);
const vraiC9=(src,nom,args,abs)=>({arbo:arboDe([]),cmd:`cat > p.c <<'FIN'\n${src}\nFIN\ngcc -w -o ${nom} p.c -lm || exit 9\n./${nom} "$@"\necho "#code $?"`,args,nom:"./c.sh",script:true,c:true,abs});
const lis9=(s,att)=>{let L=String(s==null?"":s).split("\n").map(x=>propre(x)).filter(Boolean);if(L.length===1&&/^\(?rien\)?$|^-$/i.test(L[0]))L=[];
  if(L.length===1&&att.length>1&&att.every(x=>!/ /.test(x))){const D=L[0].split(/[\s,;]+/).filter(Boolean);if(D.length===att.length)L=D;}return L;};
const plat9=x=>propre(x).replace(/\s+/g,"").replace(/(\d),(\d)/g,"$1.$2").replace(/^"(.*)"$/,"$1");
const memes9=(L,A)=>L.length===A.length&&L.every((x,i)=>plat9(x)===plat9(A[i]));
const no9=(ids,resume)=>(etape,type,titre,msg)=>({ok:false,faux:ids,resume,diag:{etape,type,titre,msg}});
const ent9=s=>{const t=propre(s).replace(/^(argc|\$\?)\s*=\s*/i,"");if(!t)return {vide:1};return /^-?\d+$/.test(t)?{v:+t}:{err:1};};
const pave9=L=>blocr(L.length?L.join("\n"):"(rien)");

/* palier 1 : argc et argv */
const MOTS9=["un","2","34.5","toto","-v","notes.txt","12","bonjour","8","-3"],NOMS9=["prog","argv","moy","affiche","calc"];
function exoC0(R){const nom=R.choix(NOMS9),n=R.ent(2,4),A=R.mel(MOTS9).slice(0,n);
  if(R()<0.4){const i=R.ent(0,n-1);A[i]=R.choix(["deux mots","fin du jeu","a b"]);}
  const lig="./"+nom+" "+A.map(a=>/ /.test(a)?`"${a}"`:a).join(" "),argv=["./"+nom,...A],argc=argv.length,coupe=A.some(a=>/ /.test(a));
  const corps=blocr(lig);
  if(R()<0.5){const k=R.choix([0,...A.map((_,i)=>i+1),...A.map((_,i)=>i+1)]),att=argv[k];
    const PA=[{type:"nom du programme oublié",v:argc-1,msg:`${c("argc")} compte tous les mots de la ligne, nom du programme compris : ${c("argv[0]")} est ${c("./"+nom)}.`},
      ...(coupe?[{type:"guillemets coupés",v:argc+A.filter(a=>/ /.test(a)).length,msg:`Entre guillemets, plusieurs mots ne font qu'un seul paramètre : bash les passe ensemble.`}]:[])];
    const PV=[...(k>0?[{type:"argv compté à partir de 1",v:argv[k-1],msg:`On compte à partir de 0 : ${c("argv[0]")} est le nom du programme, ${c("argv[1]")} le premier paramètre.`}]:[]),
      ...(k+1<argc?[{type:"argv[0] oublié",v:argv[k+1],msg:`${c("argv[0]")} est le nom du programme : les paramètres commencent à ${c("argv[1]")}.`}]:[]),
      ...(/ /.test(att)?[{type:"guillemets coupés",v:att.split(" ")[0],msg:`Entre guillemets, ${c(att)} est un seul paramètre, espace compris.`}]:[])].filter(p=>plat9(p.v)!==plat9(att));
    const E=[{w:`Les mots de la ligne, numérotés à partir de 0 :<br>${argv.map((a,i)=>`${c("argv["+i+"]")} = ${c(a)}`).join("<br>")}`,why:`Le nom du programme est ${c("argv[0]")}. Des mots entre guillemets ne font qu'un paramètre.`,pts:1.5},
      {w:`${c("argc")} = <b>${argc}</b>, et ${c("argv["+k+"]")} = <b>${c(att)}</b>`,why:`${c("argc")} compte aussi le nom du programme.`,pts:1}];
    const juge=rep=>{const v=ent9(rep.n),a=propre(rep.a);if(v.vide||!a)return {incomplet:"Réponds aux deux : argc et argv["+k+"]."};if(v.err)return {incomplet:"Pour argc, écris un nombre."};
      const okN=v.v===argc,okA=plat9(a)===plat9(att)||k===0&&plat9(a)===nom;if(okN&&okA)return {ok:true};
      const no=no9([...(okN?[]:["n"]),...(okA?[]:["a"])],"Pas tout à fait : "+(okN?"argv["+k+"] est faux.":okA?"argc est faux.":"argc et argv["+k+"] sont faux."));
      if(!okN){const m=PA.find(p=>p.v===v.v);return m?no(0,m.type,"Où ça part : "+m.type+".",m.msg):no(0,"argc faux","Où ça part : argc.","Compte les mots de la ligne, nom du programme compris, comme dans la correction.");}
      const m=PV.find(p=>plat9(p.v)===plat9(a));return m?no(0,m.type,"Où ça part : "+m.type+".",m.msg):no(0,"argv faux","Où ça part : argv["+k+"].","Numérote les mots de la ligne à partir de 0, nom du programme compris.");};
    return {sig:"C0a"+lig+k,q:`On lance le programme avec cette ligne. Que valent ${c("argc")} et ${c("argv["+k+"]")} ?`,corps,texte:lig+" : argc et argv["+k+"]",
      champs:[{k:"champ",id:"n",nom:"argc",label:"argc =",ex:"par exemple 3",apercu:false,sym:[]},{k:"champ",id:"a",nom:"argv["+k+"]",label:`argv[${k}] =`,ex:"un mot de la ligne",apercu:false,sym:[]}],
      juge,etapes:E,bonne:`argc = ${argc} ; argv[${k}] = ${c(att)}`,bonneTxt:argc+" ; "+att,repBonne:{n:String(argc),a:att},repFausse:{n:String(PA[0].v),a:att},nature:"argc et argv",
      ens:{fam:"argv",argv,k,pieges:[...PA.map(p=>({type:p.type,n:String(p.v),a:att})),...PV.map(p=>({type:p.type,n:String(argc),a:p.v}))]}};}
  const S=R.choix([0,1,1]),bas=R()<0.3,P=R.choix([1,1,2]),voit=R()<0.4;
  const boucle=bas?`for (int i = argc - 1; i >= ${S}; i${P>1?" -= "+P:"--"})`:`for (int i = ${S}; i < argc; i${P>1?" += "+P:"++"})`;
  const src=`#include <stdio.h>\n\nint main(int argc, char *argv[]) {\n${voit?'  printf("%d\\n", argc);\n':""}  ${boucle}\n    printf("%s\\n", argv[i]);\n  return 0;\n}`;
  const joue=(s0,p0,b0,ac)=>{const o=voit?[String(ac)]:[];if(b0)for(let i=argv.length-1;i>=s0;i-=p0)o.push(argv[i]);else for(let i=s0;i<argv.length;i+=p0)o.push(argv[i]);return o;};
  const att=joue(S,P,bas,argc);if(att.length<2)return null;
  const MU=[["argv[0] oublié ou compté en trop",joue(1-S,P,bas,argc),`${c("argv[0]")} est le nom du programme, ${c(argv[0])} : la boucle l'affiche si elle part de (ou descend jusqu'à) ${c("i = 0")}.`],
    ["nom du programme oublié dans argc",joue(S,P,bas,argc-1),`${c("argc")} compte aussi le nom du programme : ici ${argc}.`],
    ["pas de la boucle oublié",joue(S,1,bas,argc),`${c("i += 2")} saute un paramètre sur deux.`],
    ["sens de la boucle inversé",joue(S,P,!bas,argc),`La boucle ${bas?"descend : elle part de la fin":"monte : elle part du début"}.`]].filter(m=>!memes9(m[1],att));
  const P2=[];for(const [type,out,msg] of MU)if(!P2.some(p=>memes9(p.out,out)))P2.push({type,out,msg});if(!P2.length)return null;
  const E=[{w:`Les mots de la ligne :<br>${argv.map((a,i)=>`${c("argv["+i+"]")} = ${c(a)}`).join("<br>")}<br>donc ${c("argc")} = ${argc}.`,why:`${c("argv[0]")} est le nom du programme.`,pts:1},
    {w:`${c(boucle)} prend i = ${(bas?(()=>{const L=[];for(let i=argc-1;i>=S;i-=P)L.push(i);return L;})():(()=>{const L=[];for(let i=S;i<argc;i+=P)L.push(i);return L;})()).join(", ")}.`,why:"La boucle s'arrête dès que la condition est fausse.",pts:1.5},
    {w:`<b>Le programme affiche</b> :${pave9(att)}`,why:`${c("%d")} affiche un entier, ${c("%s")} une chaîne.`,pts:0.5}];
  return {sig:"C0b"+src+lig,q:`Ce programme est compilé sous le nom ${c(nom)}, puis lancé avec la ligne ci-dessous. Qu'affiche-t-il ?`,corps:blocC(src)+corps,texte:"argv : "+boucle+" | "+lig,
    champs:[{k:"code",id:"s",nom:"affichage",label:"Ce que le programme affiche, ligne par ligne&nbsp;:",lignes:Math.max(3,att.length+1)}],
    juge:rep=>{const L=lis9(rep.s,att);if(!L.length)return {incomplet:"Écris ce que le programme affiche, ligne par ligne."};if(memes9(L,att))return {ok:true};
      const no=no9(["s"],"Pas tout à fait : ce n'est pas ce que le programme affiche."),m=P2.find(p=>memes9(L,p.out));
      return m?no(1,m.type,"Où ça part : "+m.type+".",m.msg):no(1,"affichage différent","Où ça part : la boucle.","Écris la valeur de i à chaque tour, puis argv[i], comme dans la correction.");},
    etapes:E,bonne:pave9(att),bonneTxt:att.join(" ⏎ "),repBonne:{s:att.join("\n")},repFausse:{s:P2[0].out.join("\n")},nature:"une boucle sur argv",
    ens:{fam:"boucle",argv,S,P,bas,voit,att,pieges:P2.map(p=>({type:p.type,s:p.out.join("\n")})),bash:[vraiC9(src,nom,A,[...att,"#code 0"])]}};}

/* palier 2 : les étapes de gcc */
const LH9="int carre(int x);",LC9='#include "liste.h"\nint carre(int x) { return x * x; }',MC9='#include <stdio.h>\n#include "liste.h"\nint main(void) {\n  printf("%d\\n", carre(7));\n  return 0;\n}';
const ETAPE9=[["pre","le prétraitement"],["comp","la compilation (analyses, puis langage d'assemblage)"],["asm","l'assemblage"],["lien","l'édition des liens"]];
const CIBLE9={E:"le fichier prétraité",S:"le fichier en langage d'assemblage",c:"le fichier objet"};
function cmd9(s){const T=propre(s).replace(/^\$\s*/,"").split(" ").filter(Boolean);if(T[0]!=="gcc")return null;
  const r={E:0,S:0,c:0,o:null,red:null,lm:0,g:0,W:0,src:[],autre:[]};
  for(let i=1;i<T.length;i++){const t=T[i];if(t==="-E")r.E=1;else if(t==="-S")r.S=1;else if(t==="-c")r.c=1;else if(t==="-o")r.o=T[++i]||"";else if(t===">")r.red=T[++i]||"";else if(t==="-lm")r.lm=1;else if(t==="-g")r.g=1;else if(t==="-Wall")r.W=1;else if(/\.c$/.test(t))r.src.push(t);else r.autre.push(t);}
  return r;}
function exoC1(R){const f=R.choix([0,0,1,1,2]),F=R.choix(["prog","fact","moy","argv","calcul"]);
  if(f===0){const k=R.choix(["E","S","c","x","x","x"]),X=k==="x"?{nom:R.choix([F,F,"appli","test"]),opt:R.choix(["","lm","g","W"])}:null;
    const fic=k==="E"?F+".i":k==="S"?F+".s":k==="c"?F+".o":X.nom;
    const q=k==="x"?`Écris la commande qui compile ${c(F+".c")} en un exécutable nommé ${c(X.nom)}${X.opt==="lm"?`, avec la bibliothèque mathématique (le programme utilise ${c("sqrt")})`:X.opt==="g"?`, avec les informations de débogage pour gdb`:X.opt==="W"?`, en affichant tous les avertissements`:""}.`
      :`Écris la commande qui produit ${CIBLE9[k]} ${c(fic)} à partir de ${c(F+".c")}${k==="E"?" (gcc -E écrit à l'écran : redirige-le)":""}, sans aller plus loin.`;
    const ref=k==="E"?`gcc -E ${F}.c > ${F}.i`:k==="S"?`gcc -S ${F}.c`:k==="c"?`gcc -c ${F}.c`:`gcc -o ${X.nom} ${F}.c${X.opt==="lm"?" -lm":X.opt==="g"?" -g":X.opt==="W"?" -Wall":""}`;
    const MSG={E:`${c("-E")} s'arrête après le prétraitement : il écrit à l'écran le C où les ${c("#include")} ont été recopiés.`,S:`${c("-S")} s'arrête après la compilation : il produit le fichier en langage d'assemblage ${c(F+".s")}.`,c:`${c("-c")} compile et assemble seulement : il produit le fichier objet ${c(F+".o")}, sans édition des liens.`};
    const juge=rep=>{if(!propre(rep.c))return {incomplet:"Écris la commande."};const r=cmd9(rep.c);if(!r)return {incomplet:"La commande commence par gcc."};
      const no=no9(["c"],"Pas tout à fait : cette commande ne produit pas ce qui est demandé."),N=(et,type,msg)=>no(et,type,"Où ça part : "+type+".",msg);
      if(r.src.join()!==F+".c"||r.autre.length)return r.src.length!==1?N(0,"fichier source","Il faut donner le fichier source "+c(F+".c")+", et lui seul."):{incomplet:"Je ne reconnais pas "+esc(r.autre[0])+" : écris seulement des options vues en cours (-E, -S, -c, -o, -lm, -g, -Wall)."};
      if(r.o===F+".c")return N(1,"-o sur le fichier source",`${c("-o "+F+".c")} donnerait au résultat le nom du source : ton fichier ${c(F+".c")} serait écrasé.`);
      const et=r.E?"E":r.S?"S":r.c?"c":"x";
      if(et!==k)return N(1,et==="x"?"il manque l'option d'arrêt":k==="x"?"option qui s'arrête trop tôt":"mauvaise option d'arrêt",et==="x"?`Sans option d'arrêt, gcc va jusqu'à l'exécutable. ${MSG[k]}`:k==="x"?`${MSG[et]} Pour aller jusqu'à l'exécutable, aucune de ces options.`:MSG[et]+" "+MSG[k]);
      const sortie=k==="E"?(r.red||r.o):(r.o||(k==="x"?"a.out":fic));
      if(k==="E"&&!sortie)return N(2,"prétraitement laissé à l'écran",`${c("gcc -E")} écrit à l'écran : ${c("> "+F+".i")} (ou ${c("-o "+F+".i")}) le range dans le fichier.`);
      if(sortie!==fic)return N(2,k==="x"&&!r.o?"-o oublié":"nom de sortie",k==="x"&&!r.o?`Sans ${c("-o")}, l'exécutable s'appelle ${c("a.out")}.`:`Le fichier produit s'appellerait ${c(sortie)}.`);
      if(k==="x"&&X.opt==="lm"&&!r.lm)return N(2,"-lm oublié",`${c("sqrt")} est dans la bibliothèque mathématique : sans ${c("-lm")}, l'édition des liens échoue (« référence indéfinie vers sqrt »).`);
      if(k==="x"&&X.opt==="g"&&!r.g)return N(2,"-g oublié",`${c("-g")} ajoute les informations de débogage pour gdb.`);
      if(k==="x"&&X.opt==="W"&&!r.W)return N(2,"-Wall oublié",`${c("-Wall")} affiche tous les avertissements.`);
      return {ok:true};};
    const PI=[k!=="c"?{type:"mauvaise option d'arrêt",c:`gcc -c ${F}.c`}:{type:"mauvaise option d'arrêt",c:`gcc -S ${F}.c`},
      ...(k==="x"?[{type:"-o oublié",c:`gcc ${F}.c${X.opt==="lm"?" -lm":X.opt==="g"?" -g":X.opt==="W"?" -Wall":""}`},{type:"-o sur le fichier source",c:`gcc -o ${F}.c ${F}.c`},...(X.opt?[{type:{lm:"-lm oublié",g:"-g oublié",W:"-Wall oublié"}[X.opt],c:`gcc -o ${X.nom} ${F}.c`}]:[])]:[]),
      ...(k==="E"?[{type:"prétraitement laissé à l'écran",c:`gcc -E ${F}.c`}]:[]),...(k==="c"?[{type:"il manque l'option d'arrêt",c:`gcc -o ${F}.o ${F}.c`}]:[]).map(x=>x)].map(p=>p.type==="mauvaise option d'arrêt"&&k==="x"?Object.assign(p,{type:"option qui s'arrête trop tôt"}):p);
    const src=X&&X.opt==="lm"?'#include <stdio.h>\n#include <math.h>\nint main(int argc, char *argv[]) {\n  printf("%f\\n", sqrt(argc));\n  return 0;\n}':'#include <stdio.h>\nint main(void) {\n  printf("bonjour\\n");\n  return 0;\n}';
    const E=[{w:`Les étapes de gcc : prétraitement (${c("-E")}), compilation en langage d'assemblage (${c("-S")}, fichier ${c(".s")}), assemblage (${c("-c")}, fichier objet ${c(".o")}), édition des liens (l'exécutable).`,why:"Chaque option arrête gcc après son étape.",pts:1},
      {w:k==="x"?`On va jusqu'au bout : aucune option d'arrêt, et ${c("-o "+X.nom)} pour le nom${X.opt?` ; ${c({lm:"-lm",g:"-g",W:"-Wall"}[X.opt])} en plus`:""}.`:`On s'arrête après ${k==="E"?"le prétraitement":k==="S"?"la compilation":"l'assemblage"} : ${c("-"+k)}.`,why:k==="x"?`Sans ${c("-o")}, l'exécutable s'appellerait ${c("a.out")}.`:MSG[k],pts:1},
      {w:`<b>${c(ref)}</b>`,why:k==="E"?`On peut aussi écrire ${c(`gcc -E ${F}.c -o ${F}.i`)}.`:"L'ordre des options n'a pas d'importance.",pts:0.5}];
    return {sig:"C1a"+ref,q,corps:"",texte:"gcc : "+ref,champs:[{k:"code",id:"c",nom:"commande",label:"La commande :",lignes:2,ex:"gcc …",sym:[["gcc ","gcc "],["-o ","-o "],["-c","-c"],["-S","-S"],["-E","-E"],[">",">"]]}],
      juge,etapes:E,bonne:c(ref),bonneTxt:ref,repBonne:{c:ref},repFausse:{c:PI[0].c},nature:"écrire la commande gcc",
      ens:{fam:"gcc",k,F,X,ref,pieges:PI,bash:[{arbo:arboDe([{n:F+".c",c:src+"\n"}]),cmd:ref,args:[],nom:"./gcc.sh",script:true,c:true,etat:true,abs:["#fichiers",...[F+".c",fic].sort()]}]}};}
  if(f===1){const ops=[];let o={main:0,liste:0};const n=R.ent(1,3);
    for(let t=0;t<n;t++){const k=t===n-1&&R()<0.7?"x":R.choix(["c","c","S","E"]);
      if(k==="x"){const s=["main","liste"].map(b=>o[b]&&R()<0.8?b+".o":b+".c");ops.push(["x",R.mel(s),R()<0.6?R.choix(["prog","main","appli"]):null]);}
      else if(k==="c"){const s=R()<0.5?["main","liste"]:[R.choix(["main","liste"])];s.forEach(b=>o[b]=1);ops.push(["c",s.map(b=>b+".c")]);}
      else ops.push([k,[R.choix(["main","liste"])+".c"]]);}
    const joue=lu=>{lu=lu||{};const F=new Set();for(const [k,s,nom] of ops){
        if(k==="c")s.forEach(x=>F.add(x.replace(".c",lu.cS?".s":".o")));else if(k==="S")s.forEach(x=>F.add(x.replace(".c",lu.cS?".o":".s")));else if(k==="E")F.add(s[0].replace(".c",".i"));
        else{if(nom||!lu.aout)F.add(nom||"a.out");if(lu.garde)s.filter(x=>/\.c$/.test(x)).forEach(x=>F.add(x.replace(".c",".o")));}}return [...F].sort();};
    const txt=ops.map(([k,s,nom])=>k==="x"?`gcc ${nom?"-o "+nom+" ":""}${s.join(" ")}`:k==="E"?`gcc -E ${s[0]} > ${s[0].replace(".c",".i")}`:`gcc -${k} ${s.join(" ")}`);
    const att=joue(),noms=[...new Set(["main.o","liste.o","main.s","liste.s","main.i","liste.i","a.out",...ops.filter(x=>x[2]).map(x=>x[2])])],O=noms.map(x=>[x,x]);
    const MU=[["-c et -S confondus",{cS:1},`${c("-c")} produit le fichier objet ${c(".o")} ; ${c("-S")} s'arrête avant, au langage d'assemblage ${c(".s")}.`],
      ["a.out oublié",{aout:1},`Sans ${c("-o")}, gcc appelle l'exécutable ${c("a.out")}.`],
      ["fichiers objets gardés",{garde:1},`Quand gcc compile un ${c(".c")} jusqu'à l'exécutable, ses fichiers objets sont temporaires : ils ne restent pas dans le dossier.`]];
    const P=[];for(const [type,lu,msg] of MU){const v=joue(lu);if(v.length&&v.join()!==att.join()&&!P.some(p=>p.g.join()===v.join()))P.push({type,g:v,msg});}
    if(!P.length)return null;
    const tri=L=>L.slice().sort().join();
    const juge=rep=>{const S=(rep.g||[]).map(String);if(!S.length)return {incomplet:"Coche les nouveaux fichiers."};if(tri(S)===tri(att))return {ok:true};
      const no=no9(["g"],"Pas tout à fait : ce ne sont pas les nouveaux fichiers."),m=P.find(p=>tri(p.g)===tri(S));
      return m?no(1,m.type,"Où ça part : "+m.type+".",m.msg):no(1,"fichier en trop ou oublié","Où ça part : une commande.","Reprends les commandes une par une : -c donne un .o, -S un .s, -E rien (sauf redirigé), sans option un exécutable (a.out sans -o).");};
    const E=[{w:`${c("-c")} : un ${c(".o")} par source ; ${c("-S")} : un ${c(".s")} ; ${c("-E")} : écrit à l'écran, ici redirigé ; sans option d'arrêt : l'exécutable, ${c("a.out")} sans ${c("-o")}.`,why:"Chaque option arrête gcc après une étape.",pts:1},
      {w:txt.map(t=>{const i=txt.indexOf(t),[k,s,nom]=ops[i];return `${c(t)} : ${k==="x"?`crée l'exécutable ${c(nom||"a.out")}${s.some(x=>/\.o$/.test(x))?` en liant ${et(s.filter(x=>/\.o$/.test(x)).map(c))}`:""}`:k==="E"?`crée ${c(s[0].replace(".c",".i"))}`:`crée ${et(s.map(x=>c(x.replace(".c",k==="c"?".o":".s"))))}`}.`;}).join("<br>"),why:`Les fichiers objets qui servent à fabriquer l'exécutable ne sont gardés que si on les a demandés avec ${c("-c")}.`,pts:1.5},
      {w:`<b>${et(att.map(c))}</b>`,why:"Les sources et liste.h ne bougent pas.",pts:0.5}];
    return {sig:"C1b"+txt.join(";"),q:`Le dossier contient ${c("main.c")}, ${c("liste.c")} et ${c("liste.h")} (${c("main.c")} utilise la fonction ${c("carre")} de ${c("liste.c")}). On tape ces commandes, qui marchent toutes. Quels fichiers nouveaux y a-t-il ensuite ?`,corps:blocr(txt.join("\n")),texte:"fichiers après : "+txt.join(" ; "),
      champs:[{k:"multi",id:"g",o:O}],juge,etapes:E,bonne:et(att.map(c)),bonneTxt:att.join(" "),repBonne:{g:att},repFausse:{g:P[0].g},nature:"les fichiers que gcc laisse",
      ens:{fam:"fichiers",ops,att,pieges:P.map(p=>({type:p.type,g:p.g})),bash:[{arbo:arboDe([{n:"main.c",c:MC9+"\n"},{n:"liste.c",c:LC9+"\n"},{n:"liste.h",c:LH9+"\n"}]),cmd:txt.join("\n"),args:[],nom:"./gcc.sh",script:true,c:true,etat:true,abs:["#fichiers",...["main.c","liste.c","liste.h",...att].sort()]}]}};}
  const v=R.ent(0,4),fn=R.choix(["carre","cube","somme","moitie"]),va=R.choix(["total","resultat","compte","n"]),vb=va==="n"?"m":va.slice(0,-1);
  const CAS=[{e:"pre",fic:"main.c",src:`#include <stdio.h>\n#include "listes.h"\nint main(void) {\n  printf("%d\\n", ${fn}(7));\n  return 0;\n}`,cmd:"gcc -o prog main.c liste.c",msg:`main.c:2:10: erreur fatale: listes.h : Aucun fichier ou dossier de ce nom`},
    {e:"comp",fic:"main.c",src:`#include <stdio.h>\n#include "liste.h"\nint main(void) {\n  int ${va} = ${fn}(7)\n  printf("%d\\n", ${va});\n  return 0;\n}`,cmd:"gcc -o prog main.c liste.c",msg:`main.c:5:3: erreur: « , » ou « ; » attendu avant « printf »`},
    {e:"comp",fic:"main.c",src:`#include <stdio.h>\n#include "liste.h"\nint main(void) {\n  int ${va} = ${fn}(7);\n  printf("%d\\n", ${vb});\n  return 0;\n}`,cmd:"gcc -o prog main.c liste.c",msg:`main.c:5:19: erreur: « ${vb} » non déclaré (première utilisation dans cette fonction)`},
    {e:"lien",fic:"main.c",src:`#include <stdio.h>\n#include "liste.h"\nint main(void) {\n  printf("%d\\n", ${fn}(7));\n  return 0;\n}`,cmd:"gcc -o prog main.c",msg:`/usr/bin/ld : main.o : dans la fonction « main » : référence indéfinie vers « ${fn} »`},
    {e:"lien",fic:"liste.c",src:null,cmd:"gcc -o prog liste.c",msg:`/usr/bin/ld : (.text+0x1b) : référence indéfinie vers « main »`}],C=CAS[v];
  const lc=`#include "liste.h"\nint ${fn}(int x) { return x * x; }`,lh=`int ${fn}(int x);`,mc=C.src||`#include <stdio.h>\n#include "liste.h"\nint main(void) {\n  printf("%d\\n", ${fn}(7));\n  return 0;\n}`;
  const POUR={pre:`Le préprocesseur traite les ${c("#include")} : il recopie le fichier d'en-tête. S'il ne le trouve pas, gcc s'arrête là (« erreur fatale »).`,
    comp:C===CAS[1]?`L'analyse syntaxique vérifie la grammaire du C : un ${c(";")} qui manque donne « ; attendu » (une erreur de syntaxe).`:`L'analyse sémantique vérifie que chaque nom a été déclaré avant d'être utilisé : ${c(vb)} ne l'est pas.`,
    asm:"L'assemblage traduit le langage d'assemblage en fichier objet : il n'échoue presque jamais.",
    lien:C.e==="lien"&&v===3?`Chaque fichier se compile très bien seul ; c'est l'édition des liens (le programme ${c("ld")}) qui cherche le code de ${c(fn)}. Il est dans ${c("liste.c")}, absent de la commande.`:`L'édition des liens cherche la fonction ${c("main")}, le point d'entrée du programme : ${c("liste.c")} n'en a pas.`};
  const O=ETAPE9.map(([k,t])=>[k,t]),att=C.e;
  const juge=rep=>{if(!rep.s)return {incomplet:"Choisis une étape."};if(rep.s===att)return {ok:true};
    return no9(["s"],"Pas tout à fait : ce n'est pas à cette étape que gcc s'arrête.")(1,{pre:"erreur lue au prétraitement",comp:"erreur lue à la compilation",asm:"erreur lue à l'assemblage",lien:"erreur lue à l'édition des liens"}[rep.s],"Où ça part : l'étape.",`${POUR[att]} ${rep.s==="asm"?POUR.asm:""}`.trim());};
  const E=[{w:`Les messages : « erreur fatale : … Aucun fichier » vient du préprocesseur ; « attendu avant » ou « non déclaré » vient des analyses du compilateur ; « référence indéfinie » vient de l'éditeur de liens ${c("ld")}.`,why:"Chaque étape a ses erreurs.",pts:1},
    {w:POUR[att],why:"On lit le message, et on se demande quelle étape a pu le voir.",pts:1},{w:`<b>${ETAPE9.find(x=>x[0]===att)[1]}</b>`,why:"Le reste n'a pas pu être fait.",pts:0.5}];
  const fic={"main.c":mc,"liste.c":lc,"liste.h":lh};
  return {sig:"C1c"+v+fn+va,q:`On tape ${c(C.cmd)}. gcc écrit cette erreur. À quelle étape s'est-il arrêté ?`,corps:`<p>${c(C.fic)} :</p>`+blocC(C.fic==="main.c"?mc:lc)+blocr(C.msg),texte:"étape de l'erreur : "+C.msg,
    champs:[{k:"choix",id:"s",o:O}],juge,etapes:E,bonne:ETAPE9.find(x=>x[0]===att)[1],bonneTxt:att,repBonne:{s:att},repFausse:{s:att==="lien"?"comp":"lien"},nature:"l'étape d'une erreur",
    ens:{fam:"erreur",att,cmd:C.cmd,fic:C.fic,bash:[{arbo:arboDe(Object.entries(fic).map(([n,x])=>({n,c:x+"\n"}))),cmd:`gcc -E ${C.fic} >/dev/null 2>&1 || { echo pre; exit 0; }\ngcc -fsyntax-only ${C.fic} 2>/dev/null || { echo comp; exit 0; }\ngcc -c ${C.fic} -o /dev/null 2>/dev/null || { echo asm; exit 0; }\n${C.cmd} >/dev/null 2>&1 || { echo lien; exit 0; }\necho ok`,args:[],nom:"./gcc.sh",script:true,c:true,abs:[att]}]}};}

/* palier 3 : passage par valeur, pointeurs, portée */
function exoC2(R){
  if(R()<0.8){const N=R.ent(2,9),M=R.ent(2,9),T=[R.ent(1,9),R.ent(1,9),R.ent(1,9)],ops=[];let off=0,pa=0,ok=false;
    const n=R.ent(3,4);
    for(let i=0;i<n;i++){const k=R.choix(["a","a","t","t","pp","ep","ep","pa"]);
      if(k==="a")ops.push(["a",R.ent(1,5)]);else if(k==="t"){const j=R.ent(0,2-off);ops.push(["t",j,R.ent(10,30)]);}
      else if(k==="pp"){if(off<1){off++;ops.push(["pp"]);}else continue;}else if(k==="ep")ops.push(["ep",R.ent(10,30),R()<0.5]);
      else{if(pa)continue;pa=1;ops.push(["pa"]);}}
    if(!ops.some(o=>o[0]==="t")||!ops.some(o=>o[0]==="ep")||!ops.some(o=>o[0]==="a"||o[0]==="pa"))return null;
    const joue=lu=>{lu=lu||{};let a=N,o2=0,p="m";const st={n:N,m:M,t:T.slice()};
      for(const op of ops){if(op[0]==="a"){a+=op[1];if(lu.copie)st.n=a;}
        else if(op[0]==="t"){if(!lu.tCopie)st.t[o2+op[1]]=op[2];}else if(op[0]==="pp"){if(!lu.pp)o2++;}
        else if(op[0]==="ep"){if(lu.pCopie)continue;const v=op[2]?((p==="m"?st.m:a)+op[1]):op[1];if(p==="m")st.m=v;else{a=v;if(lu.copie)st.n=a;}}
        else if(!lu.pa)p="a";}
      return st;};
    const ligne=op=>op[0]==="a"?`  a = a + ${op[1]};`:op[0]==="t"?`  t[${op[1]}] = ${op[2]};`:op[0]==="pp"?"  t++;":op[0]==="ep"?(op[2]?`  *p = *p + ${op[1]};`:`  *p = ${op[1]};`):"  p = &a;";
    const src=`#include <stdio.h>\n\nvoid f(int a, int t[], int *p) {\n${ops.map(ligne).join("\n")}\n}\n\nint main(void) {\n  int n = ${N}, m = ${M};\n  int tab[3] = {${T.join(", ")}};\n  f(n, tab, &m);\n  printf("n=%d m=%d\\n", n, m);\n  printf("tab = %d %d %d\\n", tab[0], tab[1], tab[2]);\n  return 0;\n}`;
    const st=joue(),att={n:String(st.n),m:String(st.m),t:st.t.join(" ")},V=s=>({n:String(s.n),m:String(s.m),t:s.t.join(" ")});
    const MU=[["paramètre int modifié pour l'appelant",{copie:1},`${c("a")} est une copie de ${c("n")} : la changer ne change pas ${c("n")}.`],
      ["tableau lu comme une copie",{tCopie:1},`Passer un tableau, c'est passer l'adresse de sa première case : ${c("t[…] = …")} écrit dans le tableau ${c("tab")} de main.`],
      ["t++ oublié",{pp:1},`${c("t++")} avance la copie du pointeur d'une case : après, ${c("t[0]")} est ${c("tab[1]")}.`],
      ["p = &a oublié",{pa:1},`Après ${c("p = &a")}, p pointe sur la copie locale ${c("a")}, plus sur ${c("m")} : ${c("*p = …")} ne touche plus m.`],
      ["pointeur lu comme une copie",{pCopie:1},`${c("p")} contient l'adresse de ${c("m")} : ${c("*p = …")} écrit dans m lui-même.`]];
    const P=[];for(const [type,lu,msg] of MU){const v=V(joue(lu));if(JSON.stringify(v)!==JSON.stringify(att)&&!P.some(p=>JSON.stringify(p.v)===JSON.stringify(v)))P.push({type,v,msg});}
    if(!P.length)return null;
    let a=N,o2=0,p="m";const E=[{w:`À l'appel ${c("f(n, tab, &m)")} : ${c("a")} reçoit une copie de n (${N}), ${c("t")} l'adresse de ${c("tab[0]")}, ${c("p")} l'adresse de ${c("m")}.`,why:"En C, tout est passé par valeur : pour un tableau ou un pointeur, la valeur copiée est une adresse.",pts:1},
      ...ops.map(op=>{let w;if(op[0]==="a"){a+=op[1];w=`a vaut ${a}, mais c'est la copie : n ne bouge pas.`}
        else if(op[0]==="t"){w=`t pointe sur tab[${o2}], donc t[${op[1]}] est tab[${o2+op[1]}] : tab[${o2+op[1]}] = ${op[2]}.`}
        else if(op[0]==="pp"){o2++;w=`t avance d'une case : il pointe maintenant sur tab[${o2}]. tab ne bouge pas.`}
        else if(op[0]==="ep"){if(p==="m"){w=`p pointe sur m : m devient ${op[2]?"m + "+op[1]:op[1]}.`;}else{a=op[2]?a+op[1]:op[1];w=`p pointe sur a : a vaut ${a} ; m ne bouge pas.`;}}
        else{p="a";w=`p pointe maintenant sur la copie a, plus sur m.`}
        return {w:`${c(ligne(op).trim())} : ${w}`,why:op[0]==="a"||op[0]==="pp"||op[0]==="pa"?"On change une copie locale à f.":op[0]==="ep"&&p==="a"?"On écrit dans a, la copie locale de f : m ne bouge pas.":"On écrit à une adresse de main.",pts:1};}),
      {w:`<b>n=${att.n} m=${att.m}</b> et <b>tab = ${att.t}</b>`,why:"main affiche ses propres variables.",pts:0.5}];
    const juge=rep=>{const r={n:propre(rep.n),m:propre(rep.m),t:propre(rep.t).replace(/[{},;]/g," ").replace(/\s+/g," ").trim()};
      if(!r.n||!r.m||!r.t)return {incomplet:"Remplis les trois cases : n, m et les trois cases de tab."};
      const faux=["n","m","t"].filter(k=>r[k]!==att[k]);if(!faux.length)return {ok:true};
      const no=no9(faux,"Pas tout à fait : "+faux.map(k=>k==="t"?"tab":k).join(", ")+(faux.length>1?" sont faux.":" est faux.")),m=P.find(p=>p.v.n===r.n&&p.v.m===r.m&&p.v.t===r.t);
      if(m)return no(Math.min(E.length-2,1+ops.findIndex(o=>({"paramètre int modifié pour l'appelant":"a","tableau lu comme une copie":"t","t++ oublié":"pp","p = &a oublié":"pa","pointeur lu comme une copie":"ep"})[m.type]===o[0])),m.type,"Où ça part : "+m.type+".",m.msg);
      return no(E.length-1,"valeur fausse","Où ça part : "+faux.map(k=>k==="t"?"tab":k).join(" et ")+".","Pour chaque ligne de f, demande-toi si elle écrit dans une copie (a, t, p eux-mêmes) ou à une adresse de main (t[…], *p).");};
    return {sig:"C2a"+src,q:`Qu'affiche ce programme ?`,corps:blocC(src),texte:"passage par valeur : "+ops.map(o=>ligne(o).trim()).join(" "),
      champs:[{k:"champ",id:"n",nom:"n",label:"n =",ex:"un entier",apercu:false,sym:[]},{k:"champ",id:"m",nom:"m",label:"m =",ex:"un entier",apercu:false,sym:[]},{k:"champ",id:"t",nom:"tab",label:"tab =",ex:"trois entiers, par exemple 1 2 3",apercu:false,sym:[]}],
      juge,etapes:E,bonne:`n=${att.n} m=${att.m} ; tab = ${att.t}`,bonneTxt:`n=${att.n} m=${att.m} tab=${att.t}`,repBonne:att,repFausse:P[0].v,nature:"passage par valeur et pointeurs",
      ens:{fam:"valeur",N,M,T,ops,att,pieges:P.map(p=>Object.assign({type:p.type},p.v)),bash:[vraiC9(src,"prog",[],[`n=${att.n} m=${att.m}`,`tab = ${att.t}`,"#code 0"])]}};}
  const A=R.ent(1,9),B=R.ent(1,9),D=R.ent(1,5),Ee=R.ent(1,9),C0=R.ent(0,5),S=R.ent(1,4),nc=R.ent(2,3),sh=R()<0.4,st=R()<0.75;
  const src=`#include <stdio.h>\n\nint x = ${A};\n\nint compte(void) {\n  ${st?"static ":""}int c = ${C0};\n  c = c + ${S};\n  return c;\n}\n\nvoid ajoute(int ${sh?"x":"k"}) {\n  x = x + ${sh?Ee:"k"};\n}\n\nint main(void) {\n  int y = ${B};\n  {\n    int x = y + ${D};\n    x = x * 2;\n    printf("%d\\n", x);\n  }\n  ajoute(${sh?R.ent(1,9):Ee});\n  printf("%d\\n", x);\n${"  compte();\n".repeat(nc-1)}  printf("%d\\n", compte());\n  return 0;\n}`;
  const joue=lu=>{lu=lu||{};const l1=(B+D)*2;const l2=(lu.bloc?l1:A)+((sh?!!lu.param:true)?Ee:0);const l3=C0+S*((st?!lu.raz:!!lu.garde)?nc:1);return [l1,l2,l3].map(String);};
  const att=joue();
  const MU=[["bloc qui change la globale",{bloc:1},`${c("int x")} dans le bloc définit une nouvelle variable, qui cache la globale le temps du bloc : la globale x n'est pas touchée.`],
    ...(sh?[["paramètre qui ne cache pas la globale",{param:1},`Dans ${c("ajoute")}, le paramètre s'appelle ${c("x")} : c'est la définition la plus proche, donc ${c("x = x + "+Ee)} change la copie locale, pas la globale.`]]:[]),
    ...(st?[["static remis à zéro",{raz:1},`Une variable ${c("static")} est créée une seule fois, dans le segment statique : elle garde sa valeur d'un appel à l'autre.`]]:[["variable locale qui garde sa valeur",{garde:1},`Sans ${c("static")}, ${c("c")} est sur la pile : elle est recréée à ${C0} à chaque appel.`]])];
  const P=[];for(const [type,lu,msg] of MU){const v=joue(lu);if(v.join()!==att.join()&&!P.some(p=>p.out.join()===v.join()))P.push({type,out:v,msg,etape:type.startsWith("bloc")?0:type.startsWith("param")?1:2});}
  if(!P.length)return null;
  const E=[{w:`Dans le bloc, ${c("int x = y + "+D)} crée un x local : ${B} + ${D} = ${B+D}, puis × 2 : <b>${att[0]}</b>. Il disparaît à la fin du bloc.`,why:"On prend la définition la plus proche en remontant les blocs.",pts:1},
    {w:sh?`Dans ${c("ajoute")}, ${c("x")} est le paramètre : ${c("x = x + "+Ee)} change la copie. La globale reste <b>${A}</b>.`:`${c("ajoute("+Ee+")")} : dans ajoute, x est la globale : ${A} + ${Ee} = <b>${att[1]}</b>.`,why:"Une fonction voit la globale, sauf si un paramètre ou une variable locale porte le même nom.",pts:1},
    {w:st?`${c("c")} est ${c("static")} : créée une fois à ${C0}, elle gagne ${S} à chaque appel. ${nc} appels : ${C0} + ${nc} × ${S} = <b>${att[2]}</b>.`:`${c("c")} est une variable locale : à chaque appel, elle repart de ${C0}. Le dernier appel renvoie ${C0} + ${S} = <b>${att[2]}</b>.`,why:"static : segment statique, toute la vie du programme ; sinon : la pile, le temps de l'appel.",pts:1},
    {w:`<b>Le programme affiche</b> :${pave9(att)}`,why:"Trois printf, trois lignes.",pts:0.5}];
  return {sig:"C2b"+src,q:`Qu'affiche ce programme ?`,corps:blocC(src),texte:`portée : x=${A} y=${B} D=${D} ${sh?"param x":"k"} ${st?"static":"local"} ×${nc}`,
    champs:[{k:"code",id:"s",nom:"affichage",label:"Ce que le programme affiche, ligne par ligne&nbsp;:",lignes:4}],
    juge:rep=>{const L=lis9(rep.s,att);if(!L.length)return {incomplet:"Écris ce que le programme affiche, ligne par ligne."};if(memes9(L,att))return {ok:true};
      const no=no9(["s"],"Pas tout à fait : ce n'est pas ce que le programme affiche."),m=P.find(p=>memes9(L,p.out));if(m)return no(m.etape,m.type,"Où ça part : "+m.type+".",m.msg);
      const i=L.findIndex((x,j)=>plat9(x)!==att[j]);return no(Math.max(0,Math.min(2,i)),"affichage différent","Où ça part : la ligne "+(i+1)+".","Pour chaque x, cherche la définition la plus proche, en remontant les blocs.");},
    etapes:E,bonne:pave9(att),bonneTxt:att.join(" ⏎ "),repBonne:{s:att.join("\n")},repFausse:{s:P[0].out.join("\n")},nature:"portée et static",
    ens:{fam:"portee",A,B,D,Ee,C0,S,nc,sh,st,att,pieges:P.map(p=>({type:p.type,s:p.out.join("\n")})),bash:[vraiC9(src,"prog",[],[...att,"#code 0"])]}};}

/* palier 4 : un programme entier, lancé avec ses paramètres, puis echo $? (fact.c et moy.c du cours) */
function exoC3(R){const t=R.choix(["fact","moy","moy","max"]),r1=R.ent(1,4),r2=r1+R.ent(1,3),r3=R.choix([0,0,13,R.ent(3,9)]);let src,joue,nom=t,A;
  if(t==="fact"){src=`#include <stdio.h>\n#include <stdlib.h>\n\nunsigned int fact(unsigned int n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\n\nint main(int argc, char *argv[]) {\n  if (argc != 2) {\n    fprintf(stderr, "Syntaxe : %s <entier>\\n", argv[0]);\n    return ${r1};\n  }\n  int n = atoi(argv[1]);\n  if (n < 0) {\n    fprintf(stderr, "Il faut un entier positif !\\n");\n    return ${r2};\n  }\n  printf("%d!=%d\\n", n, fact(n));\n  return ${r3};\n}`;
    A=R.choix([[],[String(R.ent(0,7))],[String(R.ent(0,7))],["-"+R.ent(1,9)],["toto"],[String(R.ent(1,5)),String(R.ent(1,5))]]);
    joue=lu=>{const ac=A.length+(lu.argc?0:1);if(ac!==2)return {o:lu.err?[`Syntaxe : ./fact <entier>`]:[],c:r1};const n=parseInt(A[0])||0;if(n<0)return {o:lu.err?["Il faut un entier positif !"]:[],c:r2};
      let f=1;for(let i=2;i<=n;i++)f*=i;return {o:[`${n}!=${f}`],c:lu.zero?0:r3};};}
  else if(t==="moy"){const fl=R()<0.6;nom="moy";A=[...Array(R.ent(2,4))].map(()=>String(R.ent(1,20)));if(R()<0.25)A[R.ent(0,A.length-1)]="toto";
    src=`#include <stdio.h>\n#include <stdlib.h>\n\nint main(int argc, char *argv[]) {\n  ${fl?"float":"int"} m = 0;\n  for (int i = 1; i < argc; i++) {\n    m += atoi(argv[i]);\n  }\n  printf("Moyenne des %d nombres : ${fl?"%.2f":"%d"}\\n", argc - 1, m / (argc - 1));\n  return ${r3};\n}`;
    joue=lu=>{const s=A.reduce((x,a)=>x+(parseInt(a)||0),0),k=A.length+(lu.argc?1:0),kk=lu.toto?A.filter(a=>a!=="toto").length:k;
      const q=(fl&&!lu.ent)||(!fl&&lu.reel)?(s/kk).toFixed(2):String(Math.trunc(s/kk));return {o:[`Moyenne des ${kk} nombres : ${q}`],c:lu.zero?0:r3};};}
  else{nom="max";A=R.choix([[],[0,0,0].map(()=>String(R.ent(-5,30))),[0,0].map(()=>String(R.ent(-5,30))),[0,0,0,0].map(()=>String(R.ent(-5,30)))]);
    src=`#include <stdio.h>\n#include <stdlib.h>\n\nint main(int argc, char *argv[]) {\n  if (argc < 2) {\n    fprintf(stderr, "Usage : %s n1 n2 ...\\n", argv[0]);\n    return ${r1};\n  }\n  int max = atoi(argv[1]);\n  for (int i = 2; i < argc; i++) {\n    if (atoi(argv[i]) > max) max = atoi(argv[i]);\n  }\n  printf("max = %d\\n", max);\n  return max > 10 ? ${r2} : ${r3};\n}`;
    joue=lu=>{if(A.length+(lu.argc?0:1)<2)return {o:lu.err?["Usage : ./max n1 n2 ..."]:[],c:r1};const B=A.length?A:["0"];let m=+B[0];B.forEach(x=>{if(+x>m)m=+x;});
      return {o:[`max = ${m}`],c:lu.zero?0:m>10?r2:r3};};}
  const lig="./"+nom+(A.length?" "+A.join(" "):"")+" ; echo $?",res=joue({}),att=res.o,code=String(res.c);
  if(t==="moy"&&A.length===0)return null;
  const MU=[["message d'erreur compté",{err:1},`${c("fprintf(stderr, …)")} écrit sur la sortie d'erreur, pas sur la sortie standard : il s'affiche à l'écran, mais ce n'est pas ce que le programme affiche avec printf.`],
    ["nom du programme oublié dans argc",{argc:1},`${c("argc")} compte aussi le nom du programme : avec ${A.length} paramètre${A.length>1?"s":""}, argc vaut ${A.length+1}.`],
    ["code de retour lu comme 0",{zero:1},`${cr("echo $?")} affiche le code renvoyé par ${c("return")} dans main, ici ${code} : il n'est pas toujours 0.`],
    ...(t==="moy"?[["division entière ou réelle",{ent:1,reel:1},`${c("m")} est ${src.includes("float m")?"un float : la division est réelle, et %.2f garde 2 décimales":"un int : la division est entière, la partie après la virgule est perdue"}.`],["toto compté comme une erreur",{toto:1},`${c('atoi("toto")')} ne plante pas : il renvoie 0, et toto compte comme un nombre de plus.`]]:[])];
  const P=[];for(const [type,lu,msg] of MU){const r=joue(lu),v={s:r.o,q:String(r.c)};if((!memes9(v.s,att)||v.q!==code)&&!P.some(p=>memes9(p.s,v.s)&&p.q===v.q))P.push({type,s:v.s,q:v.q,msg});}
  if(!P.length)return null;
  const branche=t==="fact"?(A.length!==1?"argc != 2":parseInt(A[0])<0?"n < 0":"ok"):t==="max"?(A.length<1?"argc < 2":"ok"):"ok";
  const E=[{w:`${c(lig.replace(" ; echo $?",""))} : argc = ${A.length+1} (le nom du programme compte), ${A.map((a,i)=>`argv[${i+1}] = ${c(a)}`).join(", ")||"aucun paramètre"}.`,why:`${c("atoi")} convertit une chaîne en entier ; une chaîne qui n'est pas un nombre donne 0.`,pts:1},
    {w:branche!=="ok"?`Le test ${c(branche)} est vrai : le message part sur la sortie d'erreur (${c("stderr")}), et main renvoie ${code}. Rien sur la sortie standard.`:t==="fact"?`n = ${parseInt(A[0])||0}, positif : ${c("fact")} calcule ${att[0].split("=")[0]} = ${att[0].split("=")[1]}.`:t==="moy"?`Somme : ${A.map(a=>parseInt(a)||0).join(" + ")} = ${A.reduce((x,a)=>x+(parseInt(a)||0),0)} ; ${A.length} nombres ; ${src.includes("float m")?"division réelle (m est un float), 2 décimales":"division entière (m est un int)"}.`:`On garde le plus grand de ${et(A)} : ${att[0].split("= ")[1]}.`,why:branche!=="ok"?"return dans main termine le programme : la suite n'est pas exécutée.":"printf écrit sur la sortie standard.",pts:1.5},
    {w:`<b>Le programme affiche</b> :${pave9(att)}puis ${cr("echo $?")} affiche <b>${code}</b>.`,why:`${cr("$?")} est le code de retour de la dernière commande : la valeur du ${c("return")} de main.`,pts:1}];
  const juge=rep=>{const L=lis9(rep.s,att),q=propre(rep.q);if(!q||(!L.length&&!/rien/i.test(String(rep.s||""))&&att.length))return {incomplet:"Réponds aux deux : ce qu'affiche le programme (écris « rien » s'il n'affiche rien) et ce qu'affiche echo $?."};
    const v=ent9(q);if(v.err)return {incomplet:"Pour echo $?, écris un nombre."};
    const okS=memes9(L,att),okQ=String(v.v)===code;if(okS&&okQ)return {ok:true};
    const no=no9([...(okS?[]:["s"]),...(okQ?[]:["q"])],"Pas tout à fait : "+(okS?"le code de retour est faux.":okQ?"l'affichage est faux.":"l'affichage et le code de retour sont faux.")),m=P.find(p=>memes9(L,p.s)&&p.q===String(v.v))||P.find(p=>!okS&&memes9(L,p.s))||P.find(p=>okS&&p.q===String(v.v)&&memes9(p.s,att));
    if(m)return no(m.type.startsWith("code")?2:m.type.startsWith("nom")?0:1,m.type,"Où ça part : "+m.type+".",m.msg);
    return no(okS?2:1,"résultat différent","Où ça part : "+(okS?"le code de retour":"l'affichage")+".",okS?`${cr("$?")} vaut ce que main a renvoyé avec ${c("return")}, dans la branche où le programme est passé.`:"Suis le programme ligne par ligne avec ces paramètres, comme dans la correction.");};
  return {sig:"C3"+src+lig,q:`Ce programme est compilé sous le nom ${c(nom)}. Qu'affiche-t-il sur la sortie standard, et qu'affiche ensuite ${cr("echo $?")} ?`,corps:blocC(src)+blocr(lig),texte:`programme ${nom} : `+lig,
    champs:[{k:"code",id:"s",nom:"affichage",label:"Ce que le programme affiche (sans la sortie d'erreur ; « rien » s'il n'affiche rien)&nbsp;:",lignes:2},{k:"champ",id:"q",nom:"code de retour",label:"echo &#36;? affiche :",ex:"un entier",apercu:false,sym:[]}],
    juge,etapes:E,bonne:`${pave9(att)} puis ${code}`,bonneTxt:(att.join(" ⏎ ")||"rien")+" ; "+code,repBonne:{s:att.length?att.join("\n"):"rien",q:code},repFausse:{s:P[0].s.length?P[0].s.join("\n"):"rien",q:P[0].q},nature:"un programme entier et echo $?",
    ens:{fam:"prog",t,A,att,code,pieges:P.map(p=>({type:p.type,s:p.s.length?p.s.join("\n"):"rien",q:p.q})),bash:[vraiC9(src,nom,A,[...att,"#code "+code])]}};}
const tireC=k=>R=>{for(;;){const e=[exoC0,exoC1,exoC2,exoC3][k](R);if(e)return e;}};
G.add("usi",[
 {id:"US1",t:"Les droits : ls -l, chmod et umask",tache:"droits et umask",th:"fichiers",pts:1.5,lecons:["u-droits","u-umask"],
  paliers:[
   {t:"lire les droits : lettres, octal, ls -l",cc:1,min:150,gen:tireDr(0)},
   {t:"chmod en lettres ou en chiffres",cc:2,min:150,gen:tireDr(1)},
   {t:"umask : les droits d'un nouveau fichier",cc:2,min:100,gen:tireDr(2)},
   {t:"qui peut faire quoi, comme au TD",cc:4,min:200,gen:tireDr(3)}]},
 {id:"US2",t:"Les chemins : absolus, relatifs, cd et les commandes de base",tache:"chemins",th:"fichiers",pts:1,lecons:["u-chemins"],
  paliers:[
   {t:"où mène un chemin",cc:1,min:150,gen:tireCh(0)},
   {t:"une suite de cd, puis pwd, comme au TD",cc:2,min:150,gen:tireCh(1)},
   {t:"écrire le chemin : relatif, absolu, avec ~",cc:1,min:150,gen:tireCh(2)},
   {t:"ranger ses fichiers sans cd, comme au TD",cc:4,min:150,gen:tireCh(3)}]},
 {id:"US3",t:"Inodes et liens : ln, ln -s, rm et la taille maximale",tache:"inodes et liens",th:"fichiers",pts:1.5,lecons:["u-inodes","u-taille"],
  paliers:[
   {t:"le nombre de liens d'un répertoire",cc:1,min:100,gen:tireIn(0)},
   {t:"ln, ln -s, rm : ce qui reste, comme au TD",cc:2,min:150,gen:tireIn(1)},
   {t:"la taille maximale d'un fichier",cc:2,min:100,gen:tireIn(2)},
   {t:"la cohérence des blocs et des liens, comme au TD",cc:4,min:150,gen:tireIn(3)}]},
 {id:"US4",t:"Tubes et filtres",tache:"tubes et filtres",th:"processus",pts:1,lecons:["u-redir"],
  paliers:[
   {t:"ce qu'affiche un tube",cc:2,min:150,gen:tireTube(0)},
   {t:"un seul filtre : sort, head, tail, cut, grep, wc",cc:2,min:60,gen:tireTube(1)},
   {t:"deux filtres à enchaîner",cc:2,min:80,gen:tireTube(2)},
   {t:"trois filtres et des champs, comme au TD",cc:3,min:25,gen:tireTube(3)}]},
 {id:"US5",t:"find : chercher des fichiers",tache:"find",th:"recherche",pts:1.5,lecons:["u-find"],
  paliers:[
   {t:"ce qu'affiche une commande find",cc:2,gen:tireFind(0)},
   {t:"écrire la commande : départ et nom",cc:2,min:60,gen:tireFind(1)},
   {t:"avec -type",cc:2,min:70,gen:tireFind(2)},
   {t:"avec -exec, comme aux examens",cc:2,min:120,gen:tireFind(3)}]},
 {id:"US6",t:"Expressions régulières",tache:"expressions régulières",th:"recherche",pts:1.5,lecons:["u-regex"],
  paliers:[
   {t:"ce que garde une expression",cc:2,min:150,gen:tireRe(0)},
   {t:"écrire l'expression : début, fin, un morceau",cc:2,min:45,gen:tireRe(1)},
   {t:"plusieurs morceaux, comme aux examens",cc:2,min:65,gen:tireRe(2)},
   {t:"la commande grep -E entière",cc:3,min:60,gen:tireRe(3)}]},
 {id:"US7",t:"Scripts Bash",tache:"scripts Bash",th:"bash",pts:2.5,lecons:["u-bash1","u-bash2"],
  paliers:[
   {t:"ce qu'affiche un script",cc:2,min:240,gen:tireScript(0)},
   {t:"écrire : paramètres, variables et calculs",cc:3,min:200,gen:tireScript(1)},
   {t:"écrire une boucle",cc:4,min:230,gen:tireScript(2)},
   {t:"une boucle et un test, comme aux examens",cc:6,min:255,gen:tireScript(3)}]},
 {id:"US8",t:"Python",tache:"Python",th:"python",pts:5,lecons:["u-py1","u-py2","u-py3"],
  paliers:[
   {t:"ce qu'affiche un programme",cc:2,min:200,gen:tirePy(0)},
   {t:"écrire une petite fonction, comme en 2022, 2023 et 2024",cc:5,min:200,gen:tirePy(1)},
   {t:"un fichier et un dictionnaire",cc:8,min:200,gen:tirePy(2)},
   {t:"le parcours récursif d'un dossier, comme aux examens",cc:15,min:200,gen:tirePy(3)}]},
 {id:"US9",t:"Le C sous Unix : argc et argv, gcc, passage par valeur et portée",tache:"le C sous Unix",th:"c",pts:2,lecons:["u-c"],
  paliers:[
   {t:"argc et argv",cc:1,min:150,gen:tireC(0)},
   {t:"les étapes de gcc",cc:1,min:100,gen:tireC(1)},
   {t:"passage par valeur, pointeurs et portée",cc:3,min:150,gen:tireC(2)},
   {t:"un programme entier et son code de retour, comme au cours",cc:4,min:150,gen:tireC(3)}]},
 {id:"US10",t:"Les processus : fork, ; && ||, états, arrière-plan et kill",tache:"processus",th:"processus",pts:1.5,lecons:["u-processus","u-redir"],
  paliers:[
   {t:"combien de processus une ligne crée",cc:1,min:150,gen:tirePr(0)},
   {t:"ce qu'affiche une ligne : ; && || et le code de retour",cc:2,min:150,gen:tirePr(1)},
   {t:"actif, prêt, bloqué : les changements d'état",cc:2,min:150,gen:tirePr(2)},
   {t:"l'arrière-plan et kill, comme au TD",cc:4,min:120,gen:tirePr(3)}]}
]);
})();
