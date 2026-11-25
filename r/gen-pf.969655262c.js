/* Générateurs de Programmation fonctionnelle.
   Un petit OCaml écrit en JavaScript lit le code, trouve les types et calcule les valeurs. Il sert aux énoncés, aux corrections,
   et à exécuter ce que l'étudiant tape. Ses réponses sont comparées à celles du vrai OCaml par tools/verif/pf.js. */
(function(){
"use strict";
const G=window.GEN,O=G.outils;
const a_=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const vide=()=>Object.create(null);

const MOTS=new Set("let rec and in if then else fun function match with type of exception try true false mod begin end when as".split(" "));
const OPS=["->","::",";;","<>","<=",">=","&&","||","+.","-.","*.","/.","**","==","!=","(",")","[","]","{","}","|",";",",","=","<",">","+","-","*","/","^","@",":","."];
const normalise=s=>String(s==null?"":s).replace(/[−–—]/g,"-").replace(/→/g,"->").replace(/[’‘`´]/g,"'").replace(/[“”«»]/g,'"').replace(/×/g,"*").replace(/≤/g,"<=").replace(/≥/g,">=").replace(/≠/g,"<>").replace(/[\u00a0\u202f]/g," ");

function jetons(src){const T=[],n=src.length;let i=0;
  const pb=(msg,p,q)=>{throw {faute:"syntaxe",msg,p,q:q==null?p+1:q};};
  while(i<n){const c=src[i];
    if(/\s/.test(c)){i++;continue;}
    if(src.startsWith("(*)",i))pb("« (*) » ouvre un commentaire. Pour la multiplication entre parenthèses, écris ( * ) avec des espaces.",i,i+3);
    if(src.startsWith("(*",i)){let d=1,j=i+2;while(j<n&&d){if(src.startsWith("(*",j)){d++;j+=2;}else if(src.startsWith("*)",j)){d--;j+=2;}else j++;}
      if(d)pb("Ce commentaire « (* » n'est jamais fermé par « *) ».",i,i+2);i=j;continue;}
    const r=src.slice(i);let m;
    if((m=/^\d+\.\d*(?:[eE][-+]?\d+)?|^\d+[eE][-+]?\d+/.exec(r))){T.push({k:"float",v:+m[0],p:i,q:i+m[0].length});i+=m[0].length;continue;}
    if((m=/^\d+/.exec(r))){T.push({k:"int",v:+m[0],p:i,q:i+m[0].length});i+=m[0].length;continue;}
    if(c==='"'){let j=i+1,s="";for(;;){if(j>=n||src[j]==="\n")pb("Cette chaîne n'est pas fermée : il manque un guillemet.",i,j);if(src[j]==='"')break;
        if(src[j]==="\\"){const e=src[j+1];s+=e==="n"?"\n":e==="t"?"\t":e;j+=2;}else s+=src[j++];}
      T.push({k:"str",v:s,p:i,q:j+1});i=j+1;continue;}
    if(c==="'"){if((m=/^'(\\.|[^\\'])'/.exec(r))){const x=m[1];T.push({k:"char",v:x==="\\n"?"\n":x[0]==="\\"?x[1]:x,p:i,q:i+m[0].length});i+=m[0].length;continue;}
      if((m=/^'[a-z][a-z0-9_]*/.exec(r))){T.push({k:"tyvar",v:m[0],p:i,q:i+m[0].length});i+=m[0].length;continue;}
      pb("Cette apostrophe est seule. Un caractère s'écrit 'a', une variable de type s'écrit 'a.",i);}
    if((m=/^[a-z_][A-Za-z0-9_']*/.exec(r))){const w=m[0];T.push({k:MOTS.has(w)?w:w==="_"?"_":"id",v:w,p:i,q:i+w.length});i+=w.length;continue;}
    if((m=/^[A-Z][A-Za-z0-9_']*/.exec(r))){let w=m[0];const m2=/^\.[a-z_][A-Za-z0-9_']*/.exec(r.slice(w.length));
      if(m2){w+=m2[0];T.push({k:"id",v:w,p:i,q:i+w.length});}else T.push({k:"cons",v:w,p:i,q:i+w.length});i+=w.length;continue;}
    const o=OPS.find(x=>src.startsWith(x,i));if(!o)pb(`Le caractère « ${c} » n'existe pas en OCaml.`,i);
    T.push({k:o,v:o,p:i,q:i+o.length});i+=o.length;}
  T.push({k:"fin",v:"",p:n,q:n});return T;}

const OUVRE=["let","if","fun","function","match","try"];
const BIN=[["||"],["&&"],["=","<>","<",">","<=",">=","==","!="],["@","^"],["::"],["+","-","+.","-."],["*","/","mod","*.","/."],["**"]];
const DROITE=[true,true,false,true,true,false,false,true];
/* quoi : "prog" (une suite de phrases), "expr" (une expression seule), "type" (un type seul) */
function analyse(texte,quoi){const src=normalise(texte),T=jetons(src);let i=0;
  const vu=k=>T[i].k===k,av=()=>T[i++],lu=t=>t.k==="fin"?"la fin du code":"« "+src.slice(t.p,t.q)+" »";
  const pb=(msg,t)=>{t=t||T[i];throw {faute:"syntaxe",msg,p:t.p,q:Math.max(t.q,t.p+1)};};
  const veut=(k,msg)=>{if(!vu(k))pb((msg||`Ici, il faut « ${k} »`)+` (je lis ${lu(T[i])}).`);return av();};
  const N=(o,p)=>{o.p=p;o.q=T[i-1].q;return o;};

  function type(){const p=T[i].p,a=typeProd();if(vu("->")){av();return N({k:"c",n:"->",a:[a,type()]},p);}return a;}
  function typeProd(){const p=T[i].p,L=[typeApp()];while(vu("*")){av();L.push(typeApp());}return L.length>1?N({k:"c",n:"*",a:L},p):L[0];}
  function typeApp(){const p=T[i].p;let t;
    if(vu("(")){av();const L=[type()];while(vu(",")){av();L.push(type());}veut(")","Il manque une parenthèse fermante dans ce type");
      if(L.length>1){const n=veut("id","Après (… , …) dans un type, il faut le nom d'un type");t=N({k:"c",n:n.v,a:L},p);}else t=L[0];}
    else if(vu("tyvar"))t=N({k:"n",n:av().v},p);
    else if(vu("id"))t=N({k:"c",n:av().v,a:[]},p);
    else pb(`Ici, il faut un type, comme int, bool ou int list (je lis ${lu(T[i])}).`);
    while(vu("id")){const n=av();t=N({k:"c",n:n.v,a:[t]},p);}
    return t;}

  const debutMotif=d=>["_","id","int","float","str","char","true","false","cons","[","("].includes(T[i+(d||0)].k);
  const nomme=(m,p)=>{while(vu("as")){av();const t=veut("id","Après as, il faut un nom");m=N({k:"pas",pat:m,n:t.v},p);}return m;};
  function motif(){const p=T[i].p;return nomme(motifTuple(),p);}
  function motifTuple(){const p=T[i].p,a=motifCons();if(!vu(","))return a;const L=[a];while(vu(",")){av();L.push(motifCons());}return N({k:"ptuple",L},p);}
  function motifCons(){const p=T[i].p,a=motifApp();if(vu("::")){av();return N({k:"pcons",h:a,t:motifCons()},p);}return a;}
  function motifApp(){const p=T[i].p;if(vu("cons")){const c=av();return N({k:"pctor",n:c.v,arg:debutMotif()?motifAtome():null},p);}return motifAtome();}
  function motifAtome(){const p=T[i].p,t=T[i];
    if(vu("_")){av();return N({k:"pany"},p);}
    if(vu("id")){av();if(t.v.includes("."))pb(`« ${t.v} » est une fonction d'un module : ce n'est pas un nom de paramètre.`,t);return N({k:"pvar",n:t.v},p);}
    if(vu("int")||vu("float")||vu("str")||vu("char")){av();return N({k:"plit",t:t.k,v:t.v},p);}
    if(vu("true")||vu("false")){av();return N({k:"plit",t:"bool",v:t.k==="true"},p);}
    if(vu("-")||vu("-.")){av();const x=T[i];if(!vu("int")&&!vu("float"))pb("Après ce signe moins, il faut un nombre.");av();return N({k:"plit",t:x.k,v:-x.v},p);}
    if(vu("cons")){av();return N({k:"pctor",n:t.v,arg:null},p);}
    if(vu("[")){av();const L=[];while(!vu("]")){L.push(motif());if(vu(";"))av();else break;}veut("]","Il manque le crochet fermant");return N({k:"plist",L},p);}
    if(vu("(")){av();if(vu(")")){av();return N({k:"plit",t:"unit"},p);}let m=motifTuple();
      if(vu("|")){const L=[m];while(vu("|")){av();L.push(motifTuple());}m=N({k:"por",L},p);}
      m=nomme(m,p);if(vu(":")){av();m=N({k:"pannot",pat:m,ty:type()},p);}veut(")","Il manque une parenthèse fermante");return m;}
    pb(`Ici, il faut un paramètre ou un motif : un nom, _, [] ou x :: reste (je lis ${lu(t)}).`);}

  const debutAtome=()=>["int","float","str","char","id","cons","true","false","(","[","begin","{"].includes(T[i].k);
  function expr(){const p=T[i].p,a=niveau(0);if(!vu(","))return a;const L=[a];while(vu(",")){av();L.push(niveau(0));}return N({k:"tuple",L},p);}
  function niveau(k){if(k===BIN.length)return unaire();const p=T[i].p;let a=niveau(k+1);
    while(BIN[k].includes(T[i].k)){const o=av();if(o.k==="=="||o.k==="!=")pb(`En OCaml, on compare avec = et <>. « ${o.k} » existe mais ne compare pas les valeurs : ne l'utilise pas.`,o);
      if(DROITE[k])return N({k:"op",o:o.k,a,b:niveau(k)},p);a=N({k:"op",o:o.k,a,b:niveau(k+1)},p);}
    return a;}
  function unaire(){const p=T[i].p;if(vu("-")||vu("-.")){const o=av(),a=unaire();
      if((a.k==="int"||a.k==="float")&&!a.par&&(o.k==="-"||a.k==="float"))return N({k:a.k,v:-a.v},p);return N({k:"neg",o:o.k,a},p);}
    return appli();}
  function appli(){if(OUVRE.includes(T[i].k))return ouverte();const p=T[i].p;
    if(vu("cons")){const c=av();return N({k:"ctor",n:c.v,arg:debutAtome()?atome():null},p);}
    let f=atome();while(debutAtome())f=N({k:"app",f,a:atome()},p);return f;}
  function atome(){const p=T[i].p,t=T[i];let e;
    if(vu("int")||vu("float")||vu("str")||vu("char")){av();e=N({k:t.k,v:t.v},p);}
    else if(vu("true")||vu("false")){av();e=N({k:"bool",v:t.k==="true"},p);}
    else if(vu("id")){av();e=N({k:"var",n:t.v},p);}
    else if(vu("cons")){av();e=N({k:"ctor",n:t.v,arg:null},p);}
    else if(vu("begin")){av();e=expr();veut("end","Il manque « end » pour fermer « begin »");e=Object.assign({},e,{par:true,p,q:T[i-1].q});}
    else if(vu("[")){av();const L=[];while(!vu("]")){L.push(expr());if(vu(";"))av();else break;}veut("]","Il manque le crochet fermant de la liste");e=N({k:"list",L},p);}
    else if(vu("{")){av();const F=[];while(!vu("}")){const n=veut("id","Ici, il faut un nom de champ");veut("=","Après le nom du champ, il faut « = »");F.push([n.v,niveau(0)]);if(vu(";"))av();else break;}veut("}","Il manque l'accolade fermante");e=N({k:"enr",F},p);}
    else if(vu("(")){av();const o=T[i];
      if(vu(")")){av();e=N({k:"unit"},p);}
      else if(T[i+1].k===")"&&BIN.some(L=>L.includes(o.k))){av();av();e=N({k:"var",n:"("+o.k+")"},p);}
      else{e=expr();if(vu(":")){av();e=N({k:"annot",e,ty:type()},p);}veut(")","Il manque une parenthèse fermante");e=Object.assign({},e,{par:true,p,q:T[i-1].q});}}
    else pb(vu("fin")?"Le code s'arrête trop tôt : il manque la fin de l'expression.":`Ici, il faut une valeur ou un nom (je lis ${lu(t)}).`);
    while(vu(".")&&T[i+1].k==="id"){av();e=N({k:"champ",e,n:av().v},p);}
    return e;}
  const branche=()=>OUVRE.includes(T[i].k)?ouverte():niveau(0);
  function cas(){const C=[];if(vu("|"))av();for(;;){const p=T[i].p,pats=[motif()];while(vu("|")){av();pats.push(motif());}
      let garde=null;if(vu("when")){av();garde=niveau(0);}
      veut("->",garde?"Après la condition du when, il faut « -> »":"Après un motif, il faut « -> »");C.push(N(garde?{pats,garde,e:expr()}:{pats,e:expr()},p));if(vu("|"))av();else break;}return C;}
  function liaisons(){const rec=vu("rec")?(av(),true):false,B=[liaison()];while(vu("and")){av();B.push(liaison());}return {rec,B};}
  function liaison(){const p=T[i].p;
    if(vu("id")&&debutMotif(1)){const f=av(),P=[];while(debutMotif())P.push(motifAtome());let ty=null;if(vu(":")){av();ty=type();}
      veut("=",`Dans la définition de ${f.v}, il faut « = » après les paramètres`);let e=expr();if(ty)e={k:"annot",e,ty,p:e.p,q:e.q};
      return N({pat:{k:"pvar",n:f.v,p:f.p,q:f.q},e:{k:"fun",P,e,p,q:e.q},nom:f.v},p);}
    const pat=motif();let ty=null;if(vu(":")){av();ty=type();}veut("=","Dans un let, il faut « = » après le nom");let e=expr();if(ty)e={k:"annot",e,ty,p:e.p,q:e.q};
    return N({pat,e,nom:pat.k==="pvar"?pat.n:null},p);}
  function ouverte(){const p=T[i].p;
    if(vu("let")){av();const L=liaisons();veut("in","Un let placé dans une expression se termine par « in »");return N({k:"let",rec:L.rec,B:L.B,corps:expr()},p);}
    if(vu("if")){av();const c=expr();veut("then","Après la condition d'un if, il faut « then »");const a=branche();let b=null;if(vu("else")){av();b=branche();}return N({k:"if",c,a,b},p);}
    if(vu("fun")){av();const P=[];while(debutMotif())P.push(motifAtome());if(!P.length)pb("Après fun, il faut au moins un paramètre.");veut("->","Après les paramètres de fun, il faut « -> »");return N({k:"fun",P,e:expr()},p);}
    if(vu("function")){av();return N({k:"function",C:cas()},p);}
    if(vu("match")){av();const e=expr();veut("with","Après « match … », il faut « with »");return N({k:"match",e,C:cas()},p);}
    av();const e=expr();veut("with","Après « try … », il faut « with »");return N({k:"try",e,C:cas()},p);}
  function declType(p){const prm=[];if(vu("tyvar"))prm.push(av().v);else if(vu("(")){av();prm.push(veut("tyvar").v);while(vu(",")){av();prm.push(veut("tyvar").v);}veut(")");}
    const nom=veut("id","Après type, il faut le nom du type, en minuscules").v;veut("=","Après le nom du type, il faut « = »");
    if(vu("{")){av();const F=[];while(!vu("}")){const n=veut("id","Ici, il faut un nom de champ").v;veut(":","Après le nom du champ, il faut « : » puis son type");F.push([n,type()]);if(vu(";"))av();else break;}veut("}","Il manque l'accolade fermante");return N({k:"type",nom,prm,champs:F},p);}
    if(vu("|")||vu("cons")){if(vu("|"))av();const Cs=[];for(;;){const c=veut("cons","Un constructeur commence par une majuscule").v;let arg=null;if(vu("of")){av();arg=type();}Cs.push([c,arg]);if(vu("|"))av();else break;}return N({k:"type",nom,prm,ctors:Cs},p);}
    return N({k:"type",nom,prm,alias:type()},p);}
  function programme(){const D=[];while(!vu("fin")){if(vu(";;")){av();continue;}const p=T[i].p;
      if(vu("let")){av();const L=liaisons();if(vu("in")){av();D.push(N({k:"expr",e:N({k:"let",rec:L.rec,B:L.B,corps:expr()},p)},p));}else D.push(N({k:"def",rec:L.rec,B:L.B},p));}
      else if(vu("type")){av();D.push(declType(p));}
      else if(vu("exception")){av();const c=veut("cons","Le nom d'une exception commence par une majuscule").v;let arg=null;if(vu("of")){av();arg=type();}D.push(N({k:"exc",n:c,arg},p));}
      else D.push(N({k:"expr",e:expr()},p));
      if(!["fin",";;","let","type","exception"].includes(T[i].k))pb(`Je ne comprends pas ${lu(T[i])} à cet endroit.`);}
    return D;}
  let r;
  if(quoi==="type")r=type();else if(quoi==="expr"){r=expr();if(vu(";;"))av();}else r=programme();
  if(!vu("fin"))pb(`Je ne comprends pas ${lu(T[i])} à cet endroit.`);
  return {src,arbre:r};}

const GENE=1e9;
let NV=0;
const tvar=niv=>({k:"v",id:++NV,niv,lien:null});
const TC=(n,...a)=>({k:"c",n,a});
const INT=TC("int"),FLOAT=TC("float"),BOOL=TC("bool"),STRING=TC("string"),CHAR=TC("char"),UNIT=TC("unit"),EXN=TC("exn");
const fleche=(a,b)=>TC("->",a,b),tliste=a=>TC("list",a);
const rac=t=>{while(t.k==="v"&&t.lien)t=t.lien;return t;};
function contient(v,t){t=rac(t);if(t===v)return true;if(t.k==="v"){if(t.niv>v.niv)t.niv=v.niv;return false;}return t.a.some(x=>contient(v,x));}
function unifie(a,b){a=rac(a);b=rac(b);if(a===b)return;
  if(a.k==="v"){if(contient(a,b))throw {conflit:1};a.lien=b;return;}
  if(b.k==="v"){unifie(b,a);return;}
  if(a.n!==b.n||a.a.length!==b.a.length)throw {conflit:1};
  for(let i=0;i<a.a.length;i++)unifie(a.a[i],b.a[i]);}
function inst(t,niv,M){M=M||new Map();const va=t=>{t=rac(t);if(t.k==="v"){if(M.has(t))return M.get(t);if(t.niv!==GENE)return t;const n=tvar(niv);M.set(t,n);return n;}return t.a.length?{k:"c",n:t.n,a:t.a.map(va)}:t;};return va(t);}
/* généralisation ; pour une expression qui calcule (un appel de fonction), seules les variables en position sûre sont généralisées, comme en OCaml */
function generalise(t,niv,calcule){const neg=new Set();
  if(calcule){const va=(t,sens)=>{t=rac(t);if(t.k==="v"){if(!sens)neg.add(t);}else if(t.n==="->"){va(t.a[0],false);va(t.a[1],sens);}else t.a.forEach(x=>va(x,sens));};va(t,true);}
  const va=t=>{t=rac(t);if(t.k==="v"){if(t.niv>niv&&t.niv!==GENE&&!neg.has(t))t.niv=GENE;}else t.a.forEach(va);};va(t);return t;}
function ecrisType(t,noms){noms=noms||{m:new Map(),n:0,w:0};
  const nomV=v=>{if(!noms.m.has(v))noms.m.set(v,v.niv===GENE||!noms.faibles?"'"+(noms.n<26?String.fromCharCode(97+noms.n++):"t"+noms.n++):"'_weak"+(++noms.w));return noms.m.get(v);};
  const va=(t,niv)=>{t=rac(t);if(t.k==="v")return nomV(t);
    if(t.n==="->"){const s=va(t.a[0],1)+" -> "+va(t.a[1],0);return niv>0?"("+s+")":s;}
    if(t.n==="*"){const s=t.a.map(x=>va(x,2)).join(" * ");return niv>1?"("+s+")":s;}
    if(!t.a.length)return t.n;
    return (t.a.length===1?va(t.a[0],2):"("+t.a.map(x=>va(x,0)).join(", ")+")")+" "+t.n;};
  return va(t,0);}
function memeType(a,b){const M=new Map(),R=new Map();
  const va=(a,b)=>{a=rac(a);b=rac(b);if(a.k==="v"||b.k==="v"){if(a.k!==b.k)return false;if(M.has(a))return M.get(a)===b;if(R.has(b))return false;M.set(a,b);R.set(b,a);return true;}
    return a.n===b.n&&a.a.length===b.a.length&&a.a.every((x,i)=>va(x,b.a[i]));};
  return va(a,b);}

const OPT={"+":[INT,INT,INT],"-":[INT,INT,INT],"*":[INT,INT,INT],"/":[INT,INT,INT],"mod":[INT,INT,INT],"+.":[FLOAT,FLOAT,FLOAT],"-.":[FLOAT,FLOAT,FLOAT],"*.":[FLOAT,FLOAT,FLOAT],"/.":[FLOAT,FLOAT,FLOAT],"**":[FLOAT,FLOAT,FLOAT],"^":[STRING,STRING,STRING],"&&":[BOOL,BOOL,BOOL],"||":[BOOL,BOOL,BOOL]};
const NOMT={int:"un int (un entier)",float:"un float (un nombre à virgule)",bool:"un bool (true ou false)",string:"une string (du texte entre guillemets)",char:"un char (un seul caractère)",unit:"unit (rien)"};
const dit=t=>{t=rac(t);const s=ecrisType(t);return t.k==="c"&&!t.a.length&&NOMT[t.n]?NOMT[t.n]:t.k==="c"&&t.n==="list"?"une liste ("+s+")":t.k==="c"&&t.n==="->"?"une fonction ("+s+")":t.k==="c"&&t.n==="*"?"un "+(t.a.length===2?"couple":"n-uplet")+" ("+s+")":"de type "+s;};
const FAUXTYPES={entier:"int",integer:"int",Int:"int",reel:"float",double:"float",boolean:"bool",booleen:"bool",str:"string",chaine:"string",liste:"list"};

const exn=(c,a)=>({exn:{c,a}});
function compare(a,b){if(typeof a==="function"||typeof b==="function")throw exn("Invalid_argument","compare: functional value");
  if(typeof a==="number"||typeof a==="string"||typeof a==="boolean")return a<b?-1:a>b?1:0;
  if(Array.isArray(a)){for(let i=0;i<a.length&&i<b.length;i++){const c=compare(a[i],b[i]);if(c)return c;}return a.length-b.length;}
  if(a.tu){for(let i=0;i<a.tu.length;i++){const c=compare(a.tu[i],b.tu[i]);if(c)return c;}return 0;}
  if(a.en){for(const k of Object.keys(a.en)){const c=compare(a.en[k],b.en[k]);if(c)return c;}return 0;}
  if(a.c!==b.c){if((a.a===undefined)!==(b.a===undefined))return a.a===undefined?-1:1;return a.r-b.r;}
  return a.a===undefined?0:compare(a.a,b.a);}
const egal=(a,b)=>compare(a,b)===0;
function fmtG(x,p){if(x===0)return "0";const ex=x.toExponential(p-1).split("e"),E=+ex[1],sans=s=>s.includes(".")?s.replace(/0+$/,"").replace(/\.$/,""):s;
  if(E<-4||E>=p)return sans(ex[0])+"e"+(E<0?"-":"+")+String(Math.abs(E)).padStart(2,"0");
  return sans(x.toFixed(Math.max(0,p-1-E)));}
function ecrisFloat(x){if(Number.isNaN(x))return "nan";if(x===Infinity)return "inf";if(x===-Infinity)return "neg_infinity";
  let s="";for(const p of [12,15,18]){s=fmtG(x,p);if(parseFloat(s)===x)break;}
  if(Object.is(x,-0))s="-0";return /[.e]/.test(s)?s:s+".";}
const ecrisStr=s=>'"'+s.replace(/[\\"]/g,"\\$&").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+'"';

/* la bibliothèque : le type écrit en OCaml, la valeur en JavaScript (une fonction prend un argument à la fois) */
const BIB={
 "List.hd":["'a list -> 'a",l=>{if(!l.length)throw exn("Failure","hd");return l[0];}],
 "List.tl":["'a list -> 'a list",l=>{if(!l.length)throw exn("Failure","tl");return l.slice(1);}],
 "List.length":["'a list -> int",l=>l.length],
 "List.rev":["'a list -> 'a list",l=>l.slice().reverse()],
 "List.mem":["'a -> 'a list -> bool",x=>l=>l.some(y=>egal(x,y))],
 "List.nth":["'a list -> int -> 'a",l=>n=>{if(n<0)throw exn("Invalid_argument","List.nth");if(n>=l.length)throw exn("Failure","nth");return l[n];}],
 "List.append":["'a list -> 'a list -> 'a list",a=>b=>a.concat(b)],
 "List.concat":["'a list list -> 'a list",l=>[].concat(...l)],
 "List.flatten":["'a list list -> 'a list",l=>[].concat(...l)],
 "List.map":["('a -> 'b) -> 'a list -> 'b list",f=>l=>l.map(x=>f(x))],
 "List.filter":["('a -> bool) -> 'a list -> 'a list",f=>l=>l.filter(x=>f(x))],
 "List.for_all":["('a -> bool) -> 'a list -> bool",f=>l=>l.every(x=>f(x))],
 "List.exists":["('a -> bool) -> 'a list -> bool",f=>l=>l.some(x=>f(x))],
 "List.fold_left":["('a -> 'b -> 'a) -> 'a -> 'b list -> 'a",f=>a=>l=>l.reduce((acc,x)=>f(acc)(x),a)],
 "List.fold_right":["('a -> 'b -> 'b) -> 'a list -> 'b -> 'b",f=>l=>a=>l.reduceRight((acc,x)=>f(x)(acc),a)],
 "fst":["'a * 'b -> 'a",c=>c.tu[0]],"snd":["'a * 'b -> 'b",c=>c.tu[1]],
 "not":["bool -> bool",b=>!b],
 "float_of_int":["int -> float",n=>n],"float":["int -> float",n=>n],"int_of_float":["float -> int",x=>Math.trunc(x)],"truncate":["float -> int",x=>Math.trunc(x)],
 "string_of_int":["int -> string",n=>String(n)],"string_of_bool":["bool -> string",b=>String(b)],"string_of_float":["float -> string",x=>ecrisFloat(x)],
 "int_of_string":["string -> int",s=>{if(!/^-?\d+$/.test(s))throw exn("Failure","int_of_string");return +s;}],
 "String.length":["string -> int",s=>s.length],
 "String.get":["string -> int -> char",s=>i=>{if(i<0||i>=s.length)throw exn("Invalid_argument","index out of bounds");return s[i];}],
 "String.sub":["string -> int -> int -> string",s=>p=>l=>{if(p<0||l<0||p+l>s.length)throw exn("Invalid_argument","String.sub / Bytes.sub");return s.substr(p,l);}],
 "String.make":["int -> char -> string",n=>c=>c.repeat(n)],
 "Char.escaped":["char -> string",c=>c],
 "abs":["int -> int",n=>Math.abs(n)],"succ":["int -> int",n=>n+1],"pred":["int -> int",n=>n-1],
 "max":["'a -> 'a -> 'a",a=>b=>compare(a,b)>=0?a:b],"min":["'a -> 'a -> 'a",a=>b=>compare(a,b)<=0?a:b],
 "sqrt":["float -> float",x=>Math.sqrt(x)],"floor":["float -> float",x=>Math.floor(x)],
 "raise":["exn -> 'a",e=>{throw {exn:e};}],
 "failwith":["string -> 'a",s=>{throw exn("Failure",s);}],"invalid_arg":["string -> 'a",s=>{throw exn("Invalid_argument",s);}]};
const FCT={"+":(a,b)=>a+b,"-":(a,b)=>a-b,"*":(a,b)=>a*b,"/":(a,b)=>{if(b===0)throw exn("Division_by_zero");return Math.trunc(a/b);},"mod":(a,b)=>{if(b===0)throw exn("Division_by_zero");return a%b;},
 "+.":(a,b)=>a+b,"-.":(a,b)=>a-b,"*.":(a,b)=>a*b,"/.":(a,b)=>a/b,"**":(a,b)=>Math.pow(a,b),"^":(a,b)=>a+b,"@":(a,b)=>a.concat(b),"::":(a,b)=>[a].concat(b),
 "=":(a,b)=>egal(a,b),"<>":(a,b)=>!egal(a,b),"<":(a,b)=>compare(a,b)<0,">":(a,b)=>compare(a,b)>0,"<=":(a,b)=>compare(a,b)<=0,">=":(a,b)=>compare(a,b)>=0,"&&":(a,b)=>a&&b,"||":(a,b)=>a||b};
const tete=e=>{const A=[];while(e.k==="app"){A.unshift(e.a);e=e.f;}return [e,A];};
const SANSFIN="Le calcul ne s'arrête pas : les appels s'empilent sans fin.";

/* Une session lit des phrases l'une après l'autre, comme l'interpréteur OCaml. */
function session(){
  const TYPES=Object.assign(vide(),{int:{n:0},float:{n:0},bool:{n:0},string:{n:0},char:{n:0},unit:{n:0},exn:{n:0},list:{n:1},option:{n:1}});
  const CTORS=vide(),CHAMPS=vide(),DEFS=vide(),P=[];
  let niv=0,envT=vide(),envV=vide(),pas=0,prof=0,src="",suivi=null,nExc=10;
  const ctor=(n,prm,arg,res,r)=>{CTORS[n]={prm,arg,res,r};};
  {const a=tvar(GENE);ctor("None",[a],null,TC("option",a),0);ctor("Some",[a],a,TC("option",a),1);}
  [["Not_found"],["Division_by_zero"],["Exit"],["Stack_overflow"],["Failure",STRING],["Invalid_argument",STRING],["Match_failure",TC("*",STRING,INT,INT)]].forEach((x,r)=>ctor(x[0],[],x[1]||null,EXN,r));
  const morceau=e=>src.slice(e.p,e.q).replace(/\s+/g," ");
  const ft=(msg,e,plus)=>{throw Object.assign({faute:"type",msg,p:e.p,q:e.q},plus||{});};

  /* un type écrit dans le code → un type du typeur ; V garde les 'a d'une même phrase */
  function versType(a,V,ouvert){if(a.k==="n"){if(!V[a.n]){if(!ouvert)ft(`La variable de type ${a.n} n'est pas déclarée.`,a);V[a.n]=tvar(niv);}return V[a.n];}
    if(a.n==="->"||a.n==="*")return {k:"c",n:a.n,a:a.a.map(x=>versType(x,V,ouvert))};
    const d=TYPES[a.n];
    if(!d)ft(`Le type « ${a.n} » n'existe pas${a_(FAUXTYPES,a.n)?" : en OCaml, on écrit "+FAUXTYPES[a.n]:""}.`,a);
    if(d.n!==a.a.length)ft(d.n?`Le type ${a.n} s'écrit avec ${d.n===1?"un type devant lui, comme int "+a.n:d.n+" types devant lui"}.`:`Le type ${a.n} s'écrit seul : on ne met rien devant lui.`,a);
    if(d.alias){const M=new Map();d.prm.forEach((v,i)=>M.set(v,versType(a.a[i],V,ouvert)));return inst(d.alias,niv,M);}
    return {k:"c",n:a.n,a:a.a.map(x=>versType(x,V,ouvert))};}
  function declare(d){
    if(d.k==="exc"){ctor(d.n,[],d.arg?versType(d.arg,vide(),false):null,EXN,nExc++);return;}
    const V=vide(),prm=d.prm.map(n=>(V[n]=tvar(GENE)));
    if(d.alias){TYPES[d.nom]={n:prm.length,alias:versType(d.alias,V,false),prm};return;}
    TYPES[d.nom]={n:prm.length};const res={k:"c",n:d.nom,a:prm};
    if(d.champs)d.champs.forEach(([n,t])=>{CHAMPS[n]={prm,t:versType(t,V,false),res,tous:d.champs.map(x=>x[0])};});
    else d.ctors.forEach(([n,t],r)=>ctor(n,prm,t?versType(t,V,false):null,res,r));}

  const attend=(e,trouve,voulu,msg)=>{try{unifie(trouve,voulu);}catch(x){if(!x.conflit)throw x;const noms={m:new Map(),n:0,w:0},a=ecrisType(trouve,noms),b=ecrisType(voulu,noms);ft(msg(trouve,voulu,a,b),e,{trouve:a,voulu:b});}};
  const inconnu=(n,e)=>{const rec=P.includes(n),maj=n.replace(/^list\./,"List.").replace(/^string\./,"String.");
    ft(rec?`« ${n} » n'est pas encore défini à cet endroit. Pour qu'une fonction puisse s'appeler elle-même, il faut écrire let rec ${n}.`:maj!==n&&a_(BIB,maj)?`« ${n} » : le nom du module prend une majuscule, ${maj}.`:`« ${n} » n'est défini nulle part.`,e,{sorte:rec?"rec":"inconnu",nom:n});};
  function typeMotif(m,L,V){
    switch(m.k){
      case "pany":return tvar(niv);
      case "pvar":{if(L[m.n])ft(`Le nom ${m.n} apparaît deux fois dans le même motif.`,m);const t=tvar(niv);L[m.n]=t;m.T=t;return t;}
      case "plit":return {int:INT,float:FLOAT,str:STRING,char:CHAR,bool:BOOL,unit:UNIT}[m.t];
      case "ptuple":return {k:"c",n:"*",a:m.L.map(x=>typeMotif(x,L,V))};
      case "plist":{const t=tvar(niv);m.L.forEach(x=>attend(x,typeMotif(x,L,V),t,(a,b)=>`Dans ce motif de liste, « ${morceau(x)} » est ${dit(a)}, alors que les autres éléments sont ${dit(b)}.`));return tliste(t);}
      case "pcons":{const t=typeMotif(m.h,L,V),r=typeMotif(m.t,L,V);attend(m.t,r,tliste(t),()=>"À droite de :: dans un motif, il faut une liste.");return r;}
      case "pas":{const t=typeMotif(m.pat,L,V);if(L[m.n])ft(`Le nom ${m.n} apparaît deux fois dans le même motif.`,m);L[m.n]=t;m.T=t;return t;}
      case "por":{const avant=Object.keys(L),t=typeMotif(m.L[0],L,V),noms=Object.keys(L).filter(n=>!avant.includes(n));
        m.L.slice(1).forEach(x=>{const Lj=vide();attend(x,typeMotif(x,Lj,V),t,(a,b)=>`Les motifs séparés par | doivent avoir le même type : « ${morceau(x)} » est ${dit(a)}, pas ${dit(b)}.`);
          if(Object.keys(Lj).length!==noms.length||noms.some(n=>!Lj[n]))ft("Les motifs séparés par | doivent utiliser les mêmes noms.",x);
          noms.forEach(n=>attend(x,Lj[n],L[n],()=>`Le nom ${n} n'a pas le même type dans les deux motifs.`));});
        return t;}
      case "pannot":{const t=typeMotif(m.pat,L,V),v=versType(m.ty,V,true);attend(m.pat,t,v,(a,b,sa,sb)=>`« ${morceau(m.pat)} » est annoncé de type ${sb}, ce qui ne colle pas avec ${sa}.`);return v;}
      default:{const c=CTORS[m.n];if(!c)ft(`Le constructeur ${m.n} n'existe pas.`,m);const M=new Map(),res=inst(c.res,niv,M);
        if(c.arg&&!m.arg)ft(`Le constructeur ${m.n} porte une valeur : écris ${m.n} x, ou ${m.n} _ si elle ne sert pas.`,m);
        if(!c.arg&&m.arg)ft(`Le constructeur ${m.n} ne porte pas de valeur : écris seulement ${m.n}.`,m);
        if(c.arg){const ta=inst(c.arg,niv,M);attend(m.arg,typeMotif(m.arg,L,V),ta,(a,b,sa,sb)=>`${m.n} porte une valeur de type ${sb}, pas ${sa}.`);}
        return res;}}}
  const fraiche=t=>{const M=new Map(),va=t=>{t=rac(t);if(t.k==="v"){if(!M.has(t))M.set(t,tvar(niv));return M.get(t);}return t.a.length?{k:"c",n:t.n,a:t.a.map(va)}:t;};return va(t);};
  const estValeur=e=>["val","int","float","str","char","bool","unit","var","fun","function"].includes(e.k)||(e.k==="ctor"&&(!e.arg||estValeur(e.arg)))||((e.k==="tuple"||e.k==="list")&&e.L.every(estValeur))||(e.k==="annot"&&estValeur(e.e))||(e.k==="op"&&e.o==="::"&&estValeur(e.a)&&estValeur(e.b));
  function typeCas(C,sujet,res,env,V,quoi){C.forEach((c,k)=>{const L=vide();
      c.pats.forEach((m,j)=>{const Lj=j?vide():L,t=typeMotif(m,Lj,V);
        attend(m,t,sujet,(a,b)=>`Le motif « ${morceau(m)} » correspond à ${dit(a)}, alors que ${quoi} est ${dit(b)}.`);
        if(j)Object.keys(L).forEach(n=>{if(!Lj[n])ft("Les motifs séparés par | doivent utiliser les mêmes noms.",m);attend(m,Lj[n],L[n],()=>`Le nom ${n} n'a pas le même type dans les deux motifs.`);});});
      const env2=Object.create(env);Object.keys(L).forEach(n=>{env2[n]=L[n];});
      if(c.garde)attend(c.garde,infere(c.garde,env2,V),BOOL,a=>`Après when, il faut une condition, donc un bool. Ici, « ${morceau(c.garde)} » est ${dit(a)}.`);
      attend(c.e,infere(c.e,env2,V),res,(a,b)=>k?`Toutes les branches rendent le même type. Cette branche rend ${dit(a)}, alors que les précédentes rendent ${dit(b)}.`:`Cette branche rend ${dit(a)}, alors qu'on attend ${dit(b)}.`);});}
  function typeLet(rec,B,env,V){const env2=Object.create(env);niv++;let LS;
    try{const pre=B.map(b=>{if(!rec)return null;if(b.pat.k!=="pvar")ft("Après let rec, il faut le nom d'une fonction.",b.pat);const t=tvar(niv);env2[b.pat.n]=t;return t;});
      const TS=B.map((b,k)=>{if(b.nom)P.push(b.nom);let t;try{t=infere(b.e,rec?env2:env,V);}finally{if(b.nom)P.pop();}
        if(rec)attend(b.e,t,pre[k],(x,y)=>`${b.nom} est utilisée comme ${dit(y)}, mais sa définition est ${dit(x)}.`);return t;});
      LS=B.map((b,k)=>{const L=vide();attend(b.e,TS[k],typeMotif(b.pat,L,V),(x,y)=>`« ${morceau(b.pat)} » attend ${dit(y)}, mais la valeur est ${dit(x)}.`);return L;});}
    finally{niv--;}
    const R=vide();B.forEach((b,k)=>Object.keys(LS[k]).forEach(n=>{generalise(LS[k][n],niv,!estValeur(b.e));env2[n]=LS[k][n];R[n]=LS[k][n];}));
    return {env:env2,noms:R};}
  function infere(e,env,V){const t=infere0(e,env,V);e.T=t;return t;}
  function infere0(e,env,V){
    switch(e.k){
      case "val":return fraiche(e.T);
      case "int":return INT;case "float":return FLOAT;case "bool":return BOOL;case "str":return STRING;case "char":return CHAR;case "unit":return UNIT;
      case "var":{if(e.n[0]==="("){const o=e.n.slice(1,-1);if(OPT[o])return fleche(OPT[o][0],fleche(OPT[o][1],OPT[o][2]));const a=tvar(niv);
            return o==="::"?fleche(a,fleche(tliste(a),tliste(a))):o==="@"?fleche(tliste(a),fleche(tliste(a),tliste(a))):fleche(a,fleche(a,BOOL));}
        const t=env[e.n];if(!t)inconnu(e.n,e);return inst(t,niv);}
      case "tuple":return {k:"c",n:"*",a:e.L.map(x=>infere(x,env,V))};
      case "list":{const t=tvar(niv);e.L.forEach((x,k)=>attend(x,infere(x,env,V),t,(a,b)=>`Tous les éléments d'une liste ont le même type. « ${morceau(x)} » est ${dit(a)}, alors que ${k>1?"les éléments d'avant sont":"l'élément d'avant est"} ${dit(b)}.`));return tliste(t);}
      case "ctor":{const c=CTORS[e.n];if(!c)ft(e.n==="True"||e.n==="False"?`En OCaml, ${e.n.toLowerCase()} s'écrit tout en minuscules.`:`Le constructeur ${e.n} n'existe pas.`,e);
        const M=new Map(),res=inst(c.res,niv,M);
        if(c.arg&&!e.arg)ft(`Le constructeur ${e.n} doit porter une valeur : ${e.n} suivi d'une valeur.`,e);
        if(!c.arg&&e.arg)ft(`Le constructeur ${e.n} ne porte pas de valeur.`,e);
        if(c.arg){const ta=inst(c.arg,niv,M);attend(e.arg,infere(e.arg,env,V),ta,(a,b)=>`${e.n} porte ${dit(b)}, mais « ${morceau(e.arg)} » est ${dit(a)}.`);}
        return res;}
      case "neg":{const t=e.o==="-"?INT:FLOAT;attend(e.a,infere(e.a,env,V),t,(a,b)=>`Le signe ${e.o} devant « ${morceau(e.a)} » veut ${dit(b)}, mais c'est ${dit(a)}.${e.o==="-"&&rac(a).n==="float"?" Pour un float, le moins s'écrit -. avec un point.":""}`);return t;}
      case "op":{const o=e.o,ta=infere(e.a,env,V),tb=infere(e.b,env,V);
        if(OPT[o]){const S=OPT[o],conseil=(a,b)=>rac(b).n==="int"&&rac(a).n==="float"&&"+-*/".includes(o)?` Pour des float, l'opérateur s'écrit ${o}. avec un point.`:rac(b).n==="float"&&rac(a).n==="int"?" Un float s'écrit avec un point (2. et non 2) ; un int se convertit avec float_of_int.":"";
          attend(e.a,ta,S[0],(a,b)=>`L'opérateur ${o} veut à gauche ${dit(b)}, mais « ${morceau(e.a)} » est ${dit(a)}.${conseil(a,b)}`);
          attend(e.b,tb,S[1],(a,b)=>`L'opérateur ${o} veut à droite ${dit(b)}, mais « ${morceau(e.b)} » est ${dit(a)}.${conseil(a,b)}`);return S[2];}
        if(o==="::"){attend(e.b,tb,tliste(ta),(a,b,sa,sb)=>rac(a).n==="list"?`À gauche de ::, « ${morceau(e.a)} » est ${dit(ta)} : à droite, il faut donc une liste de type ${sb}. Or « ${morceau(e.b)} » est de type ${sa}.`:`À droite de ::, il faut une liste. « ${morceau(e.b)} » est ${dit(a)}.`);return tb;}
        if(o==="@"){const t=tliste(tvar(niv));attend(e.a,ta,t,a=>`L'opérateur @ colle deux listes. « ${morceau(e.a)} » est ${dit(a)} : pour ajouter un seul élément, mets-le entre crochets, ou utilise ::.`);
          attend(e.b,tb,ta,(a,b,sa,sb)=>rac(a).n==="list"?`L'opérateur @ colle deux listes du même type : ${sb} à gauche, ${sa} à droite.`:`L'opérateur @ colle deux listes. « ${morceau(e.b)} » est ${dit(a)} : pour ajouter un seul élément à la fin, mets-le entre crochets.`);return ta;}
        attend(e.b,tb,ta,(a,b)=>`${o} compare deux valeurs du même type. Ici, « ${morceau(e.a)} » est ${dit(b)} et « ${morceau(e.b)} » est ${dit(a)}.`);return BOOL;}
      case "if":{attend(e.c,infere(e.c,env,V),BOOL,a=>`La condition d'un if est un bool. « ${morceau(e.c)} » est ${dit(a)}.`);const ta=infere(e.a,env,V);
        if(!e.b){attend(e.a,ta,UNIT,a=>`Ce if n'a pas de else. Sans else, la branche then ne doit rien rendre ; ici elle rend ${dit(a)}. Il faut donc un else.`);return UNIT;}
        attend(e.b,infere(e.b,env,V),ta,(a,b)=>`Les deux branches d'un if ont le même type. La branche then rend ${dit(b)}, la branche else rend ${dit(a)}.`);return ta;}
      case "let":return infere(e.corps,typeLet(e.rec,e.B,env,V).env,V);
      case "fun":{const env2=Object.create(env),L=vide(),TP=e.P.map(m=>typeMotif(m,L,V));Object.keys(L).forEach(n=>{env2[n]=L[n];});
        const tr=infere(e.e,env2,V);return TP.reduceRight((r,t)=>fleche(t,r),tr);}
      case "function":{const a=tvar(niv),r=tvar(niv);typeCas(e.C,a,r,env,V,"le paramètre");return fleche(a,r);}
      case "match":{const a=infere(e.e,env,V),r=tvar(niv);typeCas(e.C,a,r,env,V,`« ${morceau(e.e)} »`);return r;}
      case "try":{const r=infere(e.e,env,V);typeCas(e.C,EXN,r,env,V,"une exception");return r;}
      case "annot":{const v=versType(e.ty,V,true);attend(e.e,infere(e.e,env,V),v,(a,b,sa,sb)=>`La signature annonce ${sb}, mais le code est de type ${sa}.`);return v;}
      case "enr":{const c=CHAMPS[e.F[0][0]];if(!c)ft(`Le champ ${e.F[0][0]} n'existe dans aucun type.`,e);const M=new Map(),res=inst(c.res,niv,M);
        e.F.forEach(([n,x])=>{const d=CHAMPS[n];if(!d||d.res!==c.res)ft(`Le champ ${n} n'appartient pas à ce type.`,x);attend(x,infere(x,env,V),inst(d.t,niv,M),(a,b)=>`Le champ ${n} contient ${dit(b)}, mais « ${morceau(x)} » est ${dit(a)}.`);});
        const manque=c.tous.filter(n=>!e.F.some(f=>f[0]===n));if(manque.length)ft(`Il manque le champ ${manque.join(", ")}.`,e);return res;}
      case "champ":{const c=CHAMPS[e.n];if(!c)ft(`Le champ ${e.n} n'existe dans aucun type.`,e);const M=new Map(),res=inst(c.res,niv,M);
        attend(e.e,infere(e.e,env,V),res,(a,b,sa,sb)=>`« .${e.n} » se lit dans une valeur de type ${sb}, mais « ${morceau(e.e)} » est ${dit(a)}.`);return inst(c.t,niv,M);}
      default:{const args=[];let f=e;while(f.k==="app"){args.unshift(f.a);f=f.f;}
        let tf=infere(f,env,V);const nomF=morceau(f);
        args.forEach((a,k)=>{const ta=infere(a,env,V);tf=rac(tf);
          if(tf.k==="c"&&tf.n!=="->")ft(k?`« ${nomF} » reçoit trop d'arguments : ${k===1?"elle n'en prend qu'un":"elle en prend "+k}. « ${morceau(a)} » est en trop. Si c'est un calcul, mets-le entre parenthèses.`:`« ${nomF} » n'est pas une fonction (c'est ${dit(tf)}) : on ne peut pas lui donner d'argument.`,k?a:f,{sorte:"trop"});
          const tp=tvar(niv),tr=tvar(niv);unifie(tf,fleche(tp,tr));
          attend(a,ta,tp,(x,y)=>`« ${nomF} » attend ${args.length>1?"comme argument n° "+(k+1)+" ":""}${dit(y)}, mais « ${morceau(a)} » est ${dit(x)}.`);tf=tr;});
        return tf;}}}

  function filtre(m,v,L){
    switch(m.k){
      case "pany":return true;case "pvar":L[m.n]=v;return true;
      case "plit":return m.t==="unit"||v===m.v;
      case "ptuple":return m.L.every((x,i)=>filtre(x,v.tu[i],L));
      case "plist":return v.length===m.L.length&&m.L.every((x,i)=>filtre(x,v[i],L));
      case "pcons":return v.length>0&&filtre(m.h,v[0],L)&&filtre(m.t,v.slice(1),L);
      case "pannot":return filtre(m.pat,v,L);
      case "pas":if(!filtre(m.pat,v,L))return false;L[m.n]=v;return true;
      case "por":for(const x of m.L){const L2=vide();if(filtre(x,v,L2)){Object.assign(L,L2);return true;}}return false;
      default:return v.c===m.n&&(!m.arg||filtre(m.arg,v.a,L));}}
  const rate=()=>exn("Match_failure",{tu:["//toplevel//",0,0]});
  function choisit(C,v,env){for(const c of C)for(const m of c.pats){const L=vide();if(filtre(m,v,L)){const env2=Object.create(env);Object.assign(env2,L);
      if(c.garde&&evalue(c.garde,env2)!==true)continue;return evalue(c.e,env2);}}throw rate();}
  const applique=(f,a)=>{if(++prof>400)throw {faute:"exec",boucle:true,msg:SANSFIN};try{return f(a);}finally{prof--;}};
  /* note chaque appel complet de la fonction suivie : ses arguments, son résultat, et l'appel qui l'a lancé */
  function espion(f,S){const garde=(g,args)=>a=>{const A=args.concat([a]);
      if(A.length<S.arite){const r=g(a);return typeof r==="function"?garde(r,A):r;}
      const moi={args:A,parent:S.pile[S.pile.length-1]||null,fils:[],n:S.appels.length};S.appels.push(moi);if(moi.parent)moi.parent.fils.push(moi);S.pile.push(moi);
      try{moi.res=g(a);return moi.res;}catch(x){moi.exc=x;throw x;}finally{S.pile.pop();}};
    return garde(f,[]);}
  function lie(rec,B,env){const env2=Object.create(env);
    B.forEach(b=>{const v=evalue(b.e,rec?env2:env),L=vide();if(!filtre(b.pat,v,L))throw rate();
      Object.keys(L).forEach(n=>{env2[n]=suivi&&suivi.nom===n&&typeof L[n]==="function"?espion(L[n],suivi):L[n];});});
    return env2;}
  function evalue(e,env){if(++pas>400000)throw {faute:"exec",boucle:true,msg:"Le calcul ne s'arrête pas."};
    switch(e.k){
      case "int":case "float":case "bool":case "str":case "char":case "val":return e.v;
      case "unit":return {tu:[]};
      case "var":{if(e.n[0]==="("){const g=FCT[e.n.slice(1,-1)];return a=>b=>g(a,b);}return env[e.n];}
      case "tuple":case "list":{const L=new Array(e.L.length);for(let k=e.L.length-1;k>=0;k--)L[k]=evalue(e.L[k],env);return e.k==="list"?L:{tu:L};}
      case "ctor":return e.arg?{c:e.n,r:CTORS[e.n].r,a:evalue(e.arg,env)}:{c:e.n,r:CTORS[e.n].r};
      case "neg":return -evalue(e.a,env);
      case "op":{if(e.o==="&&")return evalue(e.a,env)&&evalue(e.b,env);if(e.o==="||")return evalue(e.a,env)||evalue(e.b,env);
        const b=evalue(e.b,env),a=evalue(e.a,env);return FCT[e.o](a,b);}
      case "if":return evalue(e.c,env)?evalue(e.a,env):e.b?evalue(e.b,env):{tu:[]};
      case "let":return evalue(e.corps,lie(e.rec,e.B,env));
      case "fun":{const va=(k,env2)=>a=>{const L=vide();if(!filtre(e.P[k],a,L))throw rate();const env3=Object.create(env2);Object.assign(env3,L);return k+1<e.P.length?va(k+1,env3):evalue(e.e,env3);};return va(0,env);}
      case "function":return a=>choisit(e.C,a,env);
      case "match":return choisit(e.C,evalue(e.e,env),env);
      case "try":{try{return evalue(e.e,env);}catch(x){if(!x.exn)throw x;for(const c of e.C)for(const m of c.pats){const L=vide();if(filtre(m,x.exn,L)){const env2=Object.create(env);Object.assign(env2,L);
        if(c.garde&&evalue(c.garde,env2)!==true)continue;return evalue(c.e,env2);}}throw x;}}
      case "annot":return evalue(e.e,env);
      case "enr":{const o={};CHAMPS[e.F[0][0]].tous.forEach(n=>{o[n]=evalue(e.F.find(f=>f[0]===n)[1],env);});return {en:o};}
      case "champ":return evalue(e.e,env).en[e.n];
      default:{const a=evalue(e.a,env),f=evalue(e.f,env);return applique(f,a);}}}

  function ecrisVal(v,t,serre){t=rac(t);const par=s=>serre?"("+s+")":s;
    if(t.k==="v")return typeof v==="function"?"<fun>":"<poly>";
    switch(t.n){
      case "int":return v<0?par(String(v)):String(v);
      case "float":return v<0||Object.is(v,-0)?par(ecrisFloat(v)):ecrisFloat(v);
      case "bool":return String(v);case "string":return ecrisStr(v);case "char":return "'"+(v==="\n"?"\\n":v==="'"?"\\'":v)+"'";case "unit":return "()";case "->":return "<fun>";
      case "list":return "["+v.map(x=>ecrisVal(x,t.a[0])).join("; ")+"]";
      case "*":return "("+v.tu.map((x,i)=>ecrisVal(x,t.a[i])).join(", ")+")";
      default:{if(v.en){const n=Object.keys(v.en),M=new Map();CHAMPS[n[0]].prm.forEach((p,i)=>M.set(p,t.a[i]));return "{"+n.map(k=>k+" = "+ecrisVal(v.en[k],inst(CHAMPS[k].t,niv,M))).join("; ")+"}";}
        const c=CTORS[v.c];if(v.a===undefined)return v.c;const M=new Map();c.prm.forEach((p,i)=>M.set(p,t.a[i]));return par(v.c+" "+ecrisVal(v.a,inst(c.arg,niv,M),true));}}}
  const ecrisExn=x=>x.a===undefined?x.c:x.c+" "+ecrisVal(x.a,CTORS[x.c].arg,true);
  const arite=e=>{let n=0;for(;;){if(e.k==="annot")e=e.e;else if(e.k==="fun"){n+=e.P.length;e=e.e;}else if(e.k==="function"){n++;if(e.C.length===1)e=e.C[0].e;else break;}else break;}return n;};

  /* le code réécrit à partir de l'arbre, avec le moins de parenthèses possible */
  const PRI={"||":0,"&&":1,"=":2,"<>":2,"<":2,">":2,"<=":2,">=":2,"@":3,"^":3,"::":4,"+":5,"-":5,"+.":5,"-.":5,"*":6,"/":6,"mod":6,"*.":6,"/.":6,"**":7};
  const ADROITE=new Set(["||","&&","@","^","::","**"]);
  function impM(m,serre){
    switch(m.k){
      case "pany":return "_";case "pvar":return m.n;
      case "plit":return m.t==="unit"?"()":m.t==="str"?ecrisStr(m.v):m.t==="char"?"'"+m.v+"'":m.t==="float"?ecrisFloat(m.v):String(m.v);
      case "ptuple":return "("+m.L.map(x=>impM(x)).join(", ")+")";
      case "plist":return "["+m.L.map(x=>impM(x)).join("; ")+"]";
      case "pcons":{const s=impM(m.h,true)+" :: "+impM(m.t);return serre?"("+s+")":s;}
      case "pannot":return "("+impM(m.pat)+" : "+src.slice(m.ty.p,m.ty.q)+")";
      default:{const s=m.arg?m.n+" "+impM(m.arg,true):m.n;return serre&&m.arg?"("+s+")":s;}}}
  const impCas=(C,min)=>C.map(c=>c.pats.map(m=>impM(m)).join(" | ")+" -> "+imp(c.e,min)).join(" | ");
  function imp(e,min){if(min==null)min=-1;const par=(p,s)=>p<min?"("+s+")":s;
    switch(e.k){
      case "val":return par(typeof e.v==="number"&&(e.v<0||Object.is(e.v,-0))?8:e.v&&e.v.c&&e.v.a!==undefined?9:10,ecrisVal(e.v,e.T));
      case "int":return par(e.v<0?8:10,String(e.v));
      case "float":return par(e.v<0?8:10,ecrisFloat(e.v));
      case "bool":return String(e.v);case "str":return ecrisStr(e.v);case "char":return "'"+e.v+"'";case "unit":return "()";
      case "var":return e.n==="(*)"?"( * )":e.n;
      case "tuple":return "("+e.L.map(x=>imp(x,0)).join(", ")+")";
      case "list":return "["+e.L.map(x=>imp(x,0)).join("; ")+"]";
      case "ctor":return e.arg?par(9,e.n+" "+imp(e.arg,10)):e.n;
      case "neg":return par(8,e.o+imp(e.a,8));
      case "op":{const p=PRI[e.o],d=ADROITE.has(e.o),moins=x=>(x.k==="val"||x.k==="int"||x.k==="float")&&typeof x.v==="number"&&x.v<0;
        return par(p,imp(e.a,moins(e.a)?10:d?p+1:p)+" "+e.o+" "+imp(e.b,moins(e.b)?10:d?p:p+1));}
      case "app":return par(9,imp(e.f,9)+" "+imp(e.a,10));
      case "if":return par(-1,"if "+imp(e.c,0)+" then "+imp(e.a,0)+(e.b?" else "+imp(e.b,e.b.k==="if"?-1:0):""));
      case "let":return par(-1,"let "+(e.rec?"rec ":"")+e.B.map(b=>impM(b.pat)+" = "+imp(b.e,-1)).join(" and ")+" in "+imp(e.corps,-1));
      case "fun":return par(-1,"fun "+e.P.map(m=>impM(m,true)).join(" ")+" -> "+imp(e.e,-1));
      case "function":return par(-1,"function "+impCas(e.C,0));
      case "match":return par(-1,"match "+imp(e.e,-1)+" with "+impCas(e.C,0));
      case "try":return par(-1,"try "+imp(e.e,-1)+" with "+impCas(e.C,0));
      case "annot":return "("+imp(e.e,-1)+" : "+src.slice(e.ty.p,e.ty.q)+")";
      case "enr":return "{"+e.F.map(f=>f[0]+" = "+imp(f[1],0)).join("; ")+"}";
      default:return imp(e.e,10)+"."+e.n;}}

  /* le calcul montré ligne par ligne : à chaque tour, on fait tous les calculs prêts à être faits */
  const VAL=(v,T)=>({k:"val",v,T});
  const varsM=m=>m.k==="pvar"?[m.n]:m.k==="ptuple"||m.k==="plist"?m.L.flatMap(varsM):m.k==="pcons"?varsM(m.h).concat(varsM(m.t)):m.k==="pannot"?varsM(m.pat):m.k==="pctor"&&m.arg?varsM(m.arg):[];
  function subst(e,S){const va=x=>subst(x,S),sans=N=>{const R=Object.assign(vide(),S);N.forEach(n=>{delete R[n];});return R;},avec=o=>Object.assign({},e,o);
    const cas=C=>C.map(c=>Object.assign({},c,{e:subst(c.e,sans(c.pats.flatMap(varsM)))}));
    switch(e.k){
      case "var":return S[e.n]||e;
      case "tuple":case "list":return avec({L:e.L.map(va)});
      case "ctor":return e.arg?avec({arg:va(e.arg)}):e;
      case "neg":return avec({a:va(e.a)});
      case "op":return avec({a:va(e.a),b:va(e.b)});
      case "app":return avec({f:va(e.f),a:va(e.a)});
      case "if":return avec({c:va(e.c),a:va(e.a),b:e.b&&va(e.b)});
      case "let":{const S2=sans(e.B.flatMap(b=>varsM(b.pat)));return avec({B:e.B.map(b=>Object.assign({},b,{e:subst(b.e,e.rec?S2:S)})),corps:subst(e.corps,S2)});}
      case "fun":return avec({e:subst(e.e,sans(e.P.flatMap(varsM)))});
      case "function":return avec({C:cas(e.C)});
      case "match":case "try":return avec({e:va(e.e),C:cas(e.C)});
      case "annot":case "champ":return avec({e:va(e.e)});
      case "enr":return avec({F:e.F.map(f=>[f[0],va(f[1])])});
      default:return e;}}
  function lieMotif(m,x,S){
    if(m.k==="pvar"){S[m.n]=x;return true;}
    if(m.k==="pany")return true;
    if(m.k==="pannot")return lieMotif(m.pat,x,S);
    if(m.k==="ptuple"&&x.k==="tuple")return m.L.every((p,i)=>lieMotif(p,x.L[i],S));
    const L=vide(),TV=vide(),va=p=>{if(p.k==="pvar")TV[p.n]=p.T;else if(p.L)p.L.forEach(va);else if(p.k==="pcons"){va(p.h);va(p.t);}else if(p.pat)va(p.pat);else if(p.arg)va(p.arg);};
    if(!filtre(m,evalue(x,envV),L))return false;va(m);Object.keys(L).forEach(n=>{S[n]=VAL(L[n],TV[n]);});return true;}
  const prim=e=>e.k==="var"&&(e.n[0]==="("||a_(BIB,e.n));
  const sansAnnot=e=>{while(e.k==="annot")e=e.e;return e;};
  const estVal=e=>e.k==="val"||["int","float","bool","str","char","unit","fun","function"].includes(e.k)||prim(e)||(e.k==="var"&&!!DEFS[e.n])||((e.k==="list"||e.k==="tuple")&&e.L.every(estVal))||(e.k==="ctor"&&(!e.arg||estVal(e.arg)))
    ||(e.k==="app"&&e.T&&rac(e.T).n==="->"&&prim(tete(e)[0])&&tete(e)[1].every(estVal));
  function tour(e,F){if(estVal(e))return e;const va=x=>tour(x,F),avec=o=>Object.assign({},e,o);
    switch(e.k){
      case "tuple":case "list":return avec({L:e.L.map(va)});
      case "ctor":return avec({arg:va(e.arg)});
      case "annot":return estVal(e.e)?e.e:avec({e:va(e.e)});
      case "neg":return estVal(e.a)?VAL(-evalue(e.a,envV),e.T):avec({a:va(e.a)});
      case "op":{const o=e.o;
        if(o==="&&"||o==="||"){if(!estVal(e.a))return avec({a:va(e.a)});const g=evalue(e.a,envV),court=g===(o==="||");F.push({quoi:o,a:g,court});return court?VAL(g,BOOL):e.b;}
        if(!estVal(e.a)||!estVal(e.b))return avec({a:va(e.a),b:va(e.b)});
        const a=evalue(e.a,envV),b=evalue(e.b,envV),v=FCT[o](a,b);F.push({quoi:o,a,b,v,sa:imp(e.a,10),sb:imp(e.b,10)});return VAL(v,e.T);}
      case "if":{if(!estVal(e.c))return avec({c:va(e.c)});const c=evalue(e.c,envV);F.push({quoi:"if",a:c});return c?e.a:e.b||{k:"unit"};}
      case "let":{if(e.rec)return VAL(evalue(e,envV),e.T);
        if(!e.B.every(b=>estVal(b.e)))return avec({B:e.B.map(b=>Object.assign({},b,{e:va(b.e)}))});
        const S=vide();e.B.forEach(b=>{if(!lieMotif(b.pat,b.e,S))throw rate();});F.push({quoi:"let",noms:Object.keys(S),vals:Object.keys(S).map(n=>imp(S[n]))});return subst(e.corps,S);}
      case "match":{if(!estVal(e.e))return avec({e:va(e.e)});const v=evalue(e.e,envV);
        for(const c of e.C)for(const m of c.pats)if(filtre(m,v,vide())){const S=vide();lieMotif(m,e.e,S);F.push({quoi:"match",motif:impM(m)});return subst(c.e,S);}
        throw rate();}
      case "app":{let [f,A]=tete(e);const nomF=f.k==="var"?f.n:"";
        if(!estVal(f)||!A.every(estVal)){let r=va(f);A.forEach(a=>{r={k:"app",f:r,a:va(a)};});return r;}
        const reste=(r,k)=>{A.slice(k).forEach(a=>{r={k:"app",f:r,a};});return r;};
        if(f.k==="var"&&DEFS[f.n]&&!DEFS[f.n].rec)f=DEFS[f.n].e;
        if(f.k==="fun"){const n=Math.min(f.P.length,A.length),S=vide();for(let k=0;k<n;k++)if(!lieMotif(f.P[k],A[k],S))throw rate();
          F.push({quoi:"appel"});const c=subst(f.e,S);return reste(n<f.P.length?{k:"fun",P:f.P.slice(n),e:c}:c,n);}
        if(f.k==="function"){const v=evalue(A[0],envV);
          for(const c of f.C)for(const m of c.pats)if(filtre(m,v,vide())){const S=vide();lieMotif(m,A[0],S);F.push({quoi:"appel"});return reste(subst(c.e,S),1);}
          throw rate();}
        if(f.k==="var"&&(f.n==="List.fold_left"||f.n==="List.fold_right")&&A.length===3){const g=f.n==="List.fold_left",li=evalue(A[g?2:1],envV),te=rac(A[g?2:1].T).a[0],fn=evalue(A[0],envV),pasFold=[];
          let acc=evalue(A[g?1:2],envV);(g?li:li.slice().reverse()).forEach(x=>{const n=g?fn(acc)(x):fn(x)(acc);pasFold.push([ecrisVal(acc,e.T),ecrisVal(x,te),ecrisVal(n,e.T)]);acc=n;});
          F.push({quoi:f.n,args:A.map(a=>imp(a,10)),v:ecrisVal(acc,e.T),pasFold});return VAL(acc,e.T);}
        if(f.k==="var"&&f.n==="List.map"&&A.length===2){const te=rac(A[1].T).a[0];F.push({quoi:"List.map"});return {k:"list",L:evalue(A[1],envV).map(x=>({k:"app",f:A[0],a:VAL(x,te)}))};}
        const v=evalue(e,envV);F.push({quoi:nomF||"appel",args:A.map(a=>imp(a,10)),v:ecrisVal(v,e.T)});return VAL(v,e.T);}
      default:return VAL(evalue(e,envV),e.T);}}
  /* Les appels d'une fonction récursive, montrés un par un : ce que chaque appel doit calculer, puis sa valeur quand les appels
     qu'il lance sont connus. S est le suivi rempli par lis(…, {suivi}). */
  function deplie(S){const D=DEFS[S.nom],nom=S.nom;if(!D||!S.appels||!S.appels.length)return null;
    const aRec=e=>{let r=false;const va=x=>{if(r||!x||typeof x!=="object")return;if(x.k==="var"&&x.n===nom){r=true;return;}
        if(x.L)x.L.forEach(va);if(x.B)x.B.forEach(b=>va(b.e));if(x.C)x.C.forEach(y=>va(y.e));["arg","c","a","b","f","e","corps"].forEach(k=>va(x[k]));};va(e);return r;};
    const fils=(x,f)=>{if(x.L)x.L.forEach(f);if(x.B)x.B.forEach(b=>f(b.e));if(x.C)x.C.forEach(y=>f(y.e));["arg","c","a","b","f","e","corps"].forEach(k=>{if(x[k]&&typeof x[k]==="object")f(x[k]);});};
    /* le corps d'un let, où tout ce qui ne dépend pas des noms du let est déjà calculé */
    const fige=(e,env,sauf)=>{const pret=x=>{let ok=true;const va=y=>{if(!ok)return;if(y.k==="var"){if(y.n===nom||sauf.includes(y.n)||env[y.n]===undefined)ok=false;return;}fils(y,va);};va(x);return ok;};
      const va=x=>{if(["app","op","neg","var"].includes(x.k)&&pret(x)&&!(x.k==="var"&&(prim(x)||DEFS[x.n]))){try{return VAL(evalue(x,env),x.T);}catch(z){if(!z.exn)throw z;return x;}}
        const o=Object.assign({},x);if(x.L)o.L=x.L.map(va);if(x.B)o.B=x.B.map(b=>Object.assign({},b,{e:va(b.e)}));if(x.C)o.C=x.C.map(c=>Object.assign({},c,{e:va(c.e)}));
        ["arg","c","a","b","f","e","corps"].forEach(k=>{if(x[k]&&typeof x[k]==="object")o[k]=va(x[k]);});return o;};
      return va(e);};
    function forme(e,env){
      if(!aRec(e))return VAL(evalue(e,env),e.T);
      switch(e.k){
        case "annot":return forme(e.e,env);
        case "if":if(aRec(e.c))break;return forme(evalue(e.c,env)?e.a:e.b,env);
        case "match":{if(aRec(e.e))break;const v=evalue(e.e,env);
          for(const c of e.C)for(const m of c.pats){const B=vide();if(filtre(m,v,B)){const env2=Object.create(env);Object.assign(env2,B);return forme(c.e,env2);}}
          throw rate();}
        case "let":{if(e.rec)break;
          if(e.B.some(b=>aRec(b.e)))return {k:"let",rec:false,B:e.B.map(b=>({pat:b.pat,e:forme(b.e,env)})),corps:fige(e.corps,env,e.B.flatMap(b=>varsM(b.pat))),T:e.T};
          const env2=Object.create(env);e.B.forEach(b=>{if(!filtre(b.pat,evalue(b.e,env),env2))throw rate();});return forme(e.corps,env2);}
        case "op":{if(e.o==="&&"||e.o==="||"){if(aRec(e.a))break;const g=evalue(e.a,env);return g===(e.o==="||")?VAL(g,BOOL):{k:"op",o:e.o,a:VAL(g,BOOL),b:forme(e.b,env),T:e.T};}
          return {k:"op",o:e.o,a:forme(e.a,env),b:forme(e.b,env),T:e.T};}
        case "neg":return {k:"neg",o:e.o,a:forme(e.a,env),T:e.T};
        case "tuple":case "list":return {k:e.k,L:e.L.map(x=>forme(x,env)),T:e.T};
        case "ctor":return {k:"ctor",n:e.n,arg:forme(e.arg,env),T:e.T};
        case "app":{const [f,A]=tete(e);if(f.k!=="var")break;let r=f;A.forEach((a,i)=>{r={k:"app",f:r,a:forme(a,env),T:i===A.length-1?e.T:null};});return r;}}
      return VAL(evalue(e,env),e.T);}
    function depart(args){let e=D.e,k=0;const env=Object.create(envV);
      while(k<args.length){e=sansAnnot(e);
        if(e.k==="fun"){for(const m of e.P)if(!filtre(m,args[k++],env))throw rate();e=e.e;}
        else if(e.k==="function"){const c=e.C.find(c=>c.pats.some(m=>filtre(m,args[k],vide())));if(!c)throw rate();filtre(c.pats.find(m=>filtre(m,args[k],vide())),args[k],env);e=c.e;k++;}
        else return null;}
      return forme(e,env);}
    const pareil=(a,b)=>{try{return egal(a,b);}catch(x){return a===b;}};
    const appelRec=x=>{if(x.k!=="app")return null;const [f,A]=tete(x);return f.k==="var"&&f.n===nom&&A.length===S.arite&&A.every(a=>a.k==="val")?A.map(a=>a.v):null;};
    function resous(x,moi){const a=appelRec(x),avec=o=>Object.assign({},x,o);
      if(a){const fils=moi.fils.find(y=>y.args.every((v,i)=>pareil(v,a[i])));return fils&&!fils.exc?VAL(fils.res,x.T):x;}
      switch(x.k){case "op":return avec({a:resous(x.a,moi),b:resous(x.b,moi)});case "neg":return avec({a:resous(x.a,moi)});
        case "tuple":case "list":return avec({L:x.L.map(y=>resous(y,moi))});case "ctor":return avec({arg:resous(x.arg,moi)});
        case "app":return avec({f:resous(x.f,moi),a:resous(x.a,moi)});case "if":return avec({c:resous(x.c,moi),a:resous(x.a,moi),b:x.b&&resous(x.b,moi)});
        case "let":return avec({B:x.B.map(b=>Object.assign({},b,{e:resous(b.e,moi)})),corps:resous(x.corps,moi)});default:return x;}}
    let t=rac(inst(envT[nom],1));const TA=[];for(let i=0;i<S.arite;i++){t=rac(t);if(t.n!=="->")return null;TA.push(t.a[0]);t=t.a[1];}
    const ecrisAppel=A=>imp(A.reduce((f,v,i)=>({k:"app",f,a:VAL(v,TA[i])}),{k:"var",n:nom})),vus=new Set(),lignes=[],ordre=[];
    const passe=moi=>{const titre=ecrisAppel(moi.args);if(!ordre.includes(titre))ordre.push(titre);moi.fils.forEach(passe);if(vus.has(titre))return;vus.add(titre);
      const f=depart(moi.args);if(!f)throw rate();const parts=[titre,imp(f),imp(resous(f,moi)),moi.exc?"exception":ecrisVal(moi.res,t)].filter((x,i,T)=>!i||x!==T[i-1]);
      lignes.push({parts,appel:titre,base:!moi.fils.length,seul:!!appelRec(f),res:moi.res,args:moi.args,nfils:moi.fils.length});};
    try{S.appels.filter(a=>!a.parent).forEach(passe);}catch(x){if(x.exn||x.faute)return null;throw x;}
    return {ordre,lignes,terminale:lignes.every(l=>l.base||l.seul),arbre:lignes.some(l=>l.nfils>1),tRes:t,tArgs:TA};}
  /* rend les lignes du calcul (du code de départ à la valeur) et la liste des calculs faits ; arbre : l'expression avec le type de chaque morceau */
  function deroule(texte){const A=analyse(texte,"expr");src=A.src;let e=A.arbre;const L=[],faits=[];let exc=null,arbre=null;pas=0;prof=0;
    for(let k=0;k<16;k++){niv=1;try{infere(e,envT,vide());}finally{niv=0;}
      if(!k)arbre=e;const s=k?imp(e):src.trim();if(s!==L[L.length-1])L.push(s);
      if(estVal(e))break;
      try{e=tour(e,faits);}catch(x){if(!x.exn)throw x;exc=ecrisExn(x.exn);break;}}
    return {lignes:L,faits,exc,arbre,src,fini:estVal(e)};}

  Object.keys(BIB).forEach(n=>{niv=1;envT[n]=generalise(versType(analyse(BIB[n][0],"type").arbre,vide(),true),0);niv=0;envV[n]=BIB[n][1];});

  /* lit une suite de phrases ; une entrée par phrase : {sorte:"def"|"expr"|"type", …} ou {faute:"syntaxe"|"type"|"exec", msg, …} */
  function lis(texte,opt){opt=opt||{};let A;try{A=analyse(texte,"prog");}catch(x){if(!x.faute)throw x;const s=normalise(texte);return [Object.assign(x,{code:s,extrait:s.slice(x.p,x.q)})];}
    src=A.src;const R=[];
    for(const d of A.arbre){const V=vide(),morc={p:d.p,q:d.q,code:src.slice(d.p,d.q),arbre:d,src};pas=0;prof=0;P.length=0;niv=0;
      try{
        if(d.k==="type"||d.k==="exc"){declare(d);R.push(Object.assign(morc,{sorte:"type"}));continue;}
        if(d.k==="def"){const X=typeLet(d.rec,d.B,envT,V),S=opt.suivi&&d.B.find(b=>b.nom===opt.suivi.nom);
          if(S)Object.assign(opt.suivi,{arite:arite(S.e),appels:[],pile:[]});
          suivi=S?opt.suivi:null;let env2;try{env2=lie(d.rec,d.B,envV);}finally{suivi=null;}
          envT=X.env;envV=env2;d.B.forEach(b=>{if(b.nom)DEFS[b.nom]={e:sansAnnot(b.e),rec:d.rec,src};});
          R.push(Object.assign(morc,{sorte:"def",noms:Object.keys(X.noms).map(n=>({n,t:X.noms[n],type:ecrisType(X.noms[n],{m:new Map(),n:0,w:0,faibles:true}),val:envV[n],ecrit:ecrisVal(envV[n],X.noms[n])}))}));continue;}
        niv=1;let t;try{t=infere(d.e,envT,V);}finally{niv=0;}generalise(t,0,!estValeur(d.e));
        const type=ecrisType(t,{m:new Map(),n:0,w:0,faibles:true});
        if(opt.suivi&&opt.suivi.appels){opt.suivi.appels=[];opt.suivi.pile=[];}
        let v;try{v=evalue(d.e,envV);}catch(x){if(!x.exn)throw x;R.push(Object.assign(morc,{sorte:"expr",t,type,exc:x.exn,ecritExc:ecrisExn(x.exn)}));continue;}
        R.push(Object.assign(morc,{sorte:"expr",t,type,val:v,ecrit:ecrisVal(v,t)}));
      }catch(x){if(x instanceof RangeError)x={faute:"exec",boucle:true,msg:SANSFIN};
        if(x.exn)x={faute:"exec",exc:x.exn,ecritExc:ecrisExn(x.exn),msg:"Exception : "+ecrisExn(x.exn)};
        if(!x.faute)throw x;
        R.push(Object.assign(morc,x,{extrait:x.p!=null?src.slice(x.p,x.q):""}));}}
    return R;}
  return {lis,ecrisVal,ecrisExn,deroule,deplie,imp,impM,morceau,def:n=>DEFS[n],src:()=>src,type:n=>envT[n],val:n=>envV[n],
    lisType(texte){const A=analyse(texte,"type");src=A.src;niv=1;try{return versType(A.arbre,vide(),true);}finally{niv=0;}}};}

/* le type a peut-il être celui d'une valeur de type b ? ([] tapé pour une int list, par exemple) */
function convient(a,b){const M=new Map(),copie=t=>{t=rac(t);if(t.k==="v"){if(!M.has(t))M.set(t,tvar(1));return M.get(t);}return t.a.length?{k:"c",n:t.n,a:t.a.map(copie)}:t;};
  try{unifie(copie(a),copie(b));return true;}catch(x){if(x.conflit)return false;throw x;}}
const ML={analyse,session,ecrisType,memeType,convient,ecrisFloat,normalise,rac,egal,tete,BIB,OPT,
  /* le résultat de la dernière phrase du code (après un prélude éventuel) */
  calcule(code,prelude){const S=session(),R=S.lis((prelude?prelude+"\n;;\n":"")+code);return Object.assign({S,tout:R},R[R.length-1]);}};
G.pf={ML};

const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const c=s=>`<code>${esc(s)}</code>`;
const bloc=t=>window.W&&window.W.code?window.W.code(t,"ml"):`<pre>${esc(t)}</pre>`;
const et=L=>L.length<2?L.join(""):L.slice(0,-1).join(", ")+" et "+L[L.length-1];
const UN={int:"un int",float:"un float",bool:"un bool",string:"une string",char:"un char"};
const un=t=>UN[t]||"de type "+c(t);

/* ---------- ce qui sert à expliquer un type et une valeur ---------- */
const ARI=`${c("+ - * /")} et ${c("mod")} prennent deux int et rendent un int.`,FLO=`${c("+. -. *. /.")} prennent deux float et rendent un float.`,LOG=`${c("&& ||")} et ${c("not")} prennent des bool et rendent un bool.`;
const SENS={
 "List.hd":`${c("List.hd")} prend une liste et rend son premier élément : un élément, pas une liste.`,
 "List.tl":`${c("List.tl")} prend une liste et rend cette liste sans son premier élément : toujours une liste.`,
 "List.length":`${c("List.length")} prend une liste et rend son nombre d'éléments : un int.`,
 "fst":`${c("fst")} prend un couple et rend son premier élément.`,"snd":`${c("snd")} prend un couple et rend son second élément.`,
 "float_of_int":`${c("float_of_int")} prend un int et rend le même nombre en float.`,
 "int_of_float":`${c("int_of_float")} prend un float et rend un int : il coupe ce qui suit la virgule.`,
 "string_of_int":`${c("string_of_int")} prend un int et rend son écriture, en string.`,
 "String.length":`${c("String.length")} prend une string et rend son nombre de caractères : un int.`,
 "List.map":`${c("List.map f li")} applique la fonction f à chaque élément de li, et rend la liste des résultats.`,
 "List.filter":`${c("List.filter p li")} garde les éléments x de li pour lesquels p x vaut true. La fonction p rend donc un bool.`,
 "List.fold_left":`${c("List.fold_left f a li")} part de la valeur a. Pour chaque élément x de li, de gauche à droite, a est remplacé par f a x. Le résultat est le dernier a.`,
 "List.fold_right":`${c("List.fold_right f li a")} part de la valeur a. Pour chaque élément x de li, de droite à gauche, a est remplacé par f x a. Le résultat est le dernier a.`,
 "max":`${c("max a b")} rend le plus grand des deux, ${c("min a b")} le plus petit : a et b ont le même type.`,"min":`${c("max a b")} rend le plus grand des deux, ${c("min a b")} le plus petit : a et b ont le même type.`,
 "abs":`${c("abs")} prend un int et rend sa valeur absolue, un int.`};
const VEUT={"List.hd":"une liste","List.tl":"une liste","List.length":"une liste","fst":"un couple","snd":"un couple","float_of_int":"un int","int_of_float":"un float","string_of_int":"un int","String.length":"une string","not":"un bool","abs":"un int"};
function regles(arbre){const R=new Map(),met=(k,t)=>{if(!R.has(k))R.set(k,t);};
  const va=e=>{if(!e||typeof e!=="object"||!e.k||e.k[0]==="p")return;
    if(e.L)e.L.forEach(va);if(e.B)e.B.forEach(b=>va(b.e));if(e.C)e.C.forEach(x=>va(x.e));
    ["arg","c","a","b","f","e","corps"].forEach(k=>va(e[k]));
    switch(e.k){
      case "neg":if(e.o==="-")met("ari",ARI);else met("flo",FLO);break;
      case "op":{const o=e.o;
        if(["+","-","*","/","mod"].includes(o)){met("ari",ARI);if(o==="/")met("div",`Entre deux int, ${c("/")} est la division entière : elle ne garde que le quotient.`);if(o==="mod")met("mod",`${c("a mod b")} est le reste de la division entière de a par b.`);}
        else if(["+.","-.","*.","/.","**"].includes(o))met("flo",FLO);
        else if(o==="^")met("cat",`${c("^")} colle deux string et rend une string.`);
        else if(o==="&&"||o==="||")met("log",LOG);
        else if(o==="::")met("cons",`${c("x :: li")} met x devant la liste li. x a le type des éléments de li, et le résultat est une liste.`);
        else if(o==="@")met("arob",`${c("li1 @ li2")} colle deux listes du même type et rend une liste.`);
        else met("cmp",`${c("= <> < > <= >=")} comparent deux valeurs du même type et rendent un bool.`);break;}
      case "list":if(e.L.length)met("liste",`Entre crochets, les éléments sont séparés par des points-virgules et ont tous le même type T. La liste est alors de type ${c("T list")}.`);else met("vide",`${c("[]")} est la liste vide : elle prend le type de liste dont on a besoin.`);break;
      case "tuple":met("tuple",`Des valeurs séparées par des virgules forment un couple. Son type s'écrit avec une étoile : ${c("type1 * type2")}.`);break;
      case "if":met("if","Dans un if, la condition est un bool. Les deux branches ont le même type, et c'est le type du if.");break;
      case "let":met("let",`${c("let x = … in …")} donne le nom x à une valeur. Le type de l'ensemble est celui de ce qui suit in.`+(e.B.length>1?` Avec ${c("and")}, les noms sont créés en même temps : le second ne voit pas le premier.`:""));break;
      case "var":if(e.n==="not")met("log",LOG);else if(a_(SENS,e.n))met(e.n,SENS[e.n]);break;
      case "fun":case "function":met("fun",`${c("fun x -> …")} est une fonction écrite sans lui donner de nom : elle prend x et rend ce qui suit la flèche.`);break;
      case "app":{const f=tete(e)[0];if(f.k!=="var"||!a_(BIB,f.n))met("app","Pour appliquer une fonction, on écrit ses arguments après elle, séparés par des espaces.");break;}}};
  va(arbre);return [...R.values()];}
/* pourquoi l'expression entière a ce type : on regarde l'opération faite en dernier */
const cite=(src,x)=>c((x.k==="ptuple"?"("+src.slice(x.p,x.q)+")":src.slice(x.p,x.q)).replace(/\s+/g," "));
function conclut(e,src,noms){noms=noms||{m:new Map(),n:0,w:0};const m=x=>cite(src,x),t=x=>ecrisType(x.T,noms),T=x=>c(t(x));
  switch(e.k){
    case "int":case "float":case "bool":case "str":case "char":return `${m(e)} est ${un(t(e))}.`;
    case "neg":return `${m(e.a)} est ${un(t(e.a))} : avec le signe moins, on garde ${un(t(e))}.`;
    case "op":{const o=e.o;
      if(a_(OPT,o))return `L'opération faite en dernier est ${c(o)}. À sa gauche, ${m(e.a)} est ${un(t(e.a))} ; à sa droite, ${m(e.b)} aussi. Elle rend ${un(t(e))}.`;
      if(o==="::")return `L'opération faite en dernier est le premier ${c("::")}. À sa gauche, ${m(e.a)} est ${un(t(e.a))}. À sa droite, ${m(e.b)} est une liste de type ${T(e.b)}. Le résultat est de type ${T(e)}.`;
      if(o==="@")return `${m(e.a)} et ${m(e.b)} sont deux listes de type ${T(e)}. Collées par ${c("@")}, elles donnent une liste du même type.`;
      return `L'opération faite en dernier est la comparaison ${c(o)}. ${m(e.a)} et ${m(e.b)} ont le même type, ${T(e.a)}. Une comparaison rend toujours un bool.`;}
    case "if":return e.b?`La condition ${m(e.c)} est un bool. Les deux branches, ${m(e.a)} et ${m(e.b)}, ont le même type : ${T(e.a)}. C'est le type du if.`:"";
    case "let":return `${et(e.B.map(b=>`${m(b.pat)} est ${un(t(b.e))}`))}. Ce qui suit in, ${m(e.corps)}, est ${un(t(e.corps))} : c'est le type de l'ensemble.`;
    case "app":{const [f,A]=tete(e);return `Ici, ${m(f)} est de type ${T(f)}. Avec ${A.length>1?"ses "+A.length+" arguments":"son argument"}, ${et(A.map(m))}, le résultat est ${rac(e.T).n==="->"?"encore une fonction, de type "+T(e):un(t(e))}.`;}
    case "list":return e.L.length?`${e.L.length>1?"Chaque élément":"Son élément"} est ${un(t(e.L[0]))} : la liste est de type ${T(e)}.`:`C'est la liste vide.`;
    case "tuple":return `${et(e.L.map(x=>`${m(x)} est ${un(t(x))}`))} : l'ensemble est de type ${T(e)}.`;
    case "annot":return conclut(e.e,src,noms);
    default:return `${m(e)} est de type ${T(e)}.`;}}
function compareChaines(a,b){let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;
  const base="Deux chaînes se comparent comme dans un dictionnaire, caractère par caractère. ",A=c(ecrisStr(a)),B=c(ecrisStr(b));
  if(i===a.length&&i===b.length)return base+"Ici, les deux chaînes sont identiques.";
  if(i===a.length||i===b.length)return base+`Ici, ${i===a.length?A:B} est le début de ${i===a.length?B:A} : la plus courte vient avant.`;
  const avant=a[i]<b[i];
  return base+`${i?(i>1?`Les ${i} premiers caractères sont les mêmes`:"Le premier caractère est le même")+". Ensuite, ":"Dès le premier caractère, "}« ${a[i]} » vient ${avant?"avant":"après"} « ${b[i]} » : ${A} vient ${avant?"avant":"après"} ${B}.${/^\d/.test(a)&&/^\d/.test(b)?" Ce sont des chaînes, pas des nombres : on compare les caractères, pas les quantités.":""}`;}
/* les calculs faits pendant le déroulé, redits en phrases (une seule fois par sorte de calcul) */
function recit(faits){const V=new Map(),met=(k,t)=>{if(!V.has(k))V.set(k,t);},vu={};
  faits.forEach(f=>{const q=f.quoi,simple=f.a>=0&&f.b>0,n=q==="/"||q==="mod"?(vu[q+f.sa+f.sb]?9:(vu[q+f.sa+f.sb]=1,vu[q]=(vu[q]||0)+1)):0;
    if(n>2)return;
    if(q==="/")met(q+n,simple?`${c(f.sa+" / "+f.sb)} : ${f.a} = ${f.b} × ${Math.trunc(f.a/f.b)} + ${f.a%f.b}. La division entière garde le quotient, ${Math.trunc(f.a/f.b)}.`:`${c(f.sa+" / "+f.sb)} : la division entière coupe ce qui suit la virgule.`);
    else if(q==="mod")met(q+n,simple?`${c(f.sa+" mod "+f.sb)} : ${f.a} = ${f.b} × ${Math.trunc(f.a/f.b)} + ${f.a%f.b}. Le reste est ${f.a%f.b}.`:`${c(f.sa+" mod "+f.sb)} est le reste de la division entière.`);
    else if(["<",">","<=",">="].includes(q)&&typeof f.a==="string")met("chaines",compareChaines(f.a,f.b));
    else if(q==="^")met(q,`${c("^")} colle les deux chaînes bout à bout, sans ajouter d'espace.`);
    else if(q==="::")met(q,`${c("x :: li")} donne la liste qui commence par x et continue avec les éléments de li.`);
    else if(q==="@")met(q,`${c("li1 @ li2")} donne les éléments de li1, puis ceux de li2.`);
    else if(q==="&&")met(q+f.court,f.court?`Dès que le côté gauche de ${c("&&")} vaut false, le tout vaut false.`:`Le côté gauche de ${c("&&")} vaut true : le tout vaut ce que vaut le côté droit.`);
    else if(q==="||")met(q+f.court,f.court?`Dès que le côté gauche de ${c("||")} vaut true, le tout vaut true.`:`Le côté gauche de ${c("||")} vaut false : le tout vaut ce que vaut le côté droit.`);
    else if(q==="if")met(q+f.a,`La condition vaut ${f.a} : le if vaut sa branche ${f.a?"then":"else"}.`);
    else if(q==="let")met(q,"Quand la valeur d'un nom est connue, on remplace ce nom par sa valeur dans ce qui suit in.");
    else if(q==="appel")met(q,"Pour appliquer une fonction, on remplace son paramètre par l'argument, dans ce qui suit la flèche.");
    else if(q==="match")met(q+f.motif,`La valeur a la forme ${c(f.motif)} : c'est cette branche qui est choisie.`);
    else if(f.pasFold)met(q,`On part de a = ${c(f.pasFold.length?f.pasFold[0][0]:f.v)}. `+f.pasFold.map(p=>`Avec x = ${c(p[1])}, a devient ${c(p[2])}.`).join(" "));
    else if(q==="List.map")met(q,`${c("List.map")} applique la fonction à chaque élément, un par un.`);
    else if(q==="List.filter")met(q,`${c("List.filter")} essaie la fonction sur chaque élément, et garde ceux pour lesquels elle rend true : il reste ${c(f.v)}.`);
    else if(f.args){const quoi={"List.hd":"le premier élément","List.tl":"la liste sans son premier élément","List.length":"le nombre d'éléments","int_of_float":"on coupe ce qui suit la virgule, sans arrondir","float_of_int":"le même nombre, écrit en float, avec un point","string_of_int":"le nombre devient du texte","String.length":"le nombre de caractères","fst":"le premier élément du couple","snd":"le second élément du couple","not":"le contraire","max":"le plus grand des deux","min":"le plus petit des deux","abs":"la valeur absolue"}[q];
      if(quoi)met(q,`${c(q+" "+f.args.join(" "))} vaut ${c(f.v)} : ${quoi}.`);}});
  return [...V.values()].join(" ");}
/* comment le type d'un paramètre se lit dans ce que la fonction en fait */
function usage(v,corps,src){const m=x=>cite(src,x),U=[];
  const va=(e,par,role)=>{if(!e||typeof e!=="object")return;
    if(e.k==="var"){if(e.n===v)U.push({par,role});return;}
    switch(e.k){
      case "op":va(e.a,e,"g");va(e.b,e,"d");break;
      case "neg":va(e.a,e,"g");break;
      case "if":va(e.c,e,"cond");va(e.a,e,"br");va(e.b,e,"br");break;
      case "app":{const [f,A]=tete(e);va(f,e,"fn");A.forEach(a=>va(a,e,"arg"));break;}
      case "tuple":case "list":e.L.forEach(x=>va(x,e,e.k));break;
      case "let":e.B.forEach(b=>va(b.e,e,"let"));va(e.corps,par,role);break;
      case "annot":va(e.e,par,role);break;
      case "ctor":va(e.arg,e,"ctor");break;
      case "fun":va(e.e,e,"let");break;
      case "match":va(e.e,e,"let");e.C.forEach(x=>va(x.e,e,"br"));break;
      case "function":e.C.forEach(x=>va(x.e,e,"br"));break;}};
  va(corps,null,"racine");if(!U.length)return `${c(v)} ne sert à aucun calcul : rien ne fixe son type.`;
  const libre=u=>u.role==="racine"||u.role==="tuple"||(u.role==="list"&&u.par.L.length<2),comparaison=u=>(u.role==="g"||u.role==="d")&&u.par.k==="op"&&["=","<>","<",">","<=",">="].includes(u.par.o);
  const force=u=>libre(u)?2:u.role==="br"||u.role==="list"||u.role==="let"||comparaison(u)||(u.role==="arg"&&!a_(VEUT,tete(u.par)[0].n||""))?1:0;
  const u=U.slice().sort((a,b)=>force(a)-force(b))[0],p=u.par;
  switch(u.role){
    case "racine":return `${c(v)} est rendu tel quel, sans calcul : rien ne fixe son type.`;
    case "g":case "d":{const o=p.o;
      if(p.k==="neg"||["+","-","*","/","mod"].includes(o))return `${c(v)} sert dans ${m(p)}, et ${c(o)} veut des int.`;
      if(["+.","-.","*.","/.","**"].includes(o))return `${c(v)} sert dans ${m(p)}, et ${c(o)} veut des float.`;
      if(o==="^")return `${c(v)} sert dans ${m(p)}, et ${c("^")} veut des string.`;
      if(o==="&&"||o==="||")return `${c(v)} sert dans ${m(p)}, et ${c(o)} veut des bool.`;
      if(o==="::")return u.role==="g"?`${c(v)} est mis devant une liste dans ${m(p)} : il a le type des éléments de cette liste.`:`${c(v)} est à droite de ${c("::")} dans ${m(p)} : c'est une liste.`;
      if(o==="@")return `${c(v)} est collé à une autre liste par ${c("@")} dans ${m(p)} : c'est une liste.`;
      return `${c(v)} est comparé à ${m(u.role==="g"?p.b:p.a)} dans ${m(p)} : les deux ont le même type.`;}
    case "cond":return `${c(v)} est la condition du if : c'est un bool.`;
    case "br":return `${c(v)} est le résultat d'une branche du if : il a le même type que l'autre branche.`;
    case "fn":return `${c(v)} est suivi d'un argument dans ${m(p)} : c'est une fonction.`;
    case "arg":{const f=tete(p)[0];return f.k==="var"&&a_(VEUT,f.n)?`${c(v)} est donné à ${c(f.n)} dans ${m(p)}, et ${c(f.n)} veut ${VEUT[f.n]}.`:f.k==="var"?`${c(v)} est donné à ${c(f.n)} dans ${m(p)} : il a le type que ${c(f.n)} attend.`:`${c(v)} est donné comme argument dans ${m(p)}.`;}
    case "tuple":return `${c(v)} est rangé dans un couple, sans calcul : rien ne fixe son type.`;
    case "list":return p.L.length>1?`${c(v)} est rangé dans la liste ${m(p)} : il a le type des autres éléments.`:`${c(v)} est rangé dans une liste, sans calcul : rien ne fixe son type.`;
    default:return `${c(v)} sert dans ${m(p)}.`;}}
const feuilles=m=>m.k==="pvar"?[m]:m.L?m.L.flatMap(feuilles):m.k==="pcons"?feuilles(m.h).concat(feuilles(m.t)):m.pat?feuilles(m.pat):m.arg?feuilles(m.arg):[];
/* les étapes pour trouver la signature d'une fonction écrite avec fun ou function */
function etapesFn(fn,src,T){const m=x=>cite(src,x),noms={m:new Map(),n:0,w:0},sig=ecrisType(T,noms);
  const multi=fn.k==="fun",P=multi?fn.P:[fn.C[0].pats[0]],corps=multi?fn.e:fn.C[0].e,V=P.flatMap(feuilles),couple=P.some(p=>p.k==="ptuple");
  const dit=P.map(p=>p.k==="ptuple"?`le couple ${m(p)}`:m(p));
  return [{w:P.length>1?`Les paramètres : il y en a ${P.length}, donnés l'un après l'autre : ${et(dit)}.`:couple?`Le paramètre : il n'y en a qu'un seul, ${dit[0]}.`:`Le paramètre : il y en a un seul, ${dit[0]}.`,
     why:`Des paramètres donnés l'un après l'autre sont reliés par des flèches : ${c("type1 -> type2 -> résultat")}. Un couple entre parenthèses compte pour un seul paramètre, et son type s'écrit avec une étoile : ${c("type1 * type2 -> résultat")}.`,pts:1},
    {w:`Le type de chaque nom se lit dans ce que la fonction en fait.<br>${V.map(p=>`${usage(p.n,corps,src)} Donc ${c(p.n+" : "+ecrisType(p.T,noms))}.`).join("<br>")}`,
     why:`OCaml trouve les types tout seul, en regardant les opérateurs et les fonctions utilisés.${/'/.test(sig)?` Quand rien ne fixe un type, il l'écrit ${c("'a")} : cela se lit « n'importe quel type ». Deux ${c("'a")} dans la même signature désignent le même type.`:""}`,pts:1},
    {w:`Le résultat : ${m(corps)} est ${un(ecrisType(corps.T,noms))}.`,why:corps.k==="var"?`${m(corps)} est rendu tel quel : le résultat a le type de ce paramètre.`:conclut(corps,src,noms)||"C'est le type des deux branches.",pts:1},
    {w:`La signature : <b>${c(sig)}</b>`,why:`On écrit le type ${P.length>1?"de chaque paramètre, dans l'ordre, avec une flèche après chacun":"du paramètre, puis une flèche"}, et on finit par le type du résultat.`,pts:1}];}

/* ---------- PF1 : type et valeur d'une expression ---------- */
const SYMT=[["int","int"],["float","float"],["bool","bool"],["string","string"],["list"," list"],["->"," -> "],["*"," * "],["'a","'a"],["(","("],[")",")"]];
const SYMV=[["[","["],["]","]"],[";","; "],["true","true"],["false","false"],['"','"'],[".","."],["(","("],[")",")"],["<fun>","<fun>"]];
/* les boutons de symboles d'un palier (choix P0b du 19/11) */
const symDe=(L,noms)=>L.filter(s=>noms.includes(s[0]));
const ST1=["int","float","bool","string"],SV1=["true","false",'"',"."];
const constante=e=>["int","float","bool","str","char","unit"].includes(e.k)||((e.k==="list"||e.k==="tuple")&&e.L.every(constante))||(e.k==="ctor"&&(!e.arg||constante(e.arg)));
function lisTypeRep(S,texte){const t=normalise(texte).trim();if(!t)return {vide:true};
  try{return {t:S.lisType(t)};}catch(x){if(!x.faute)throw x;return {pb:x.msg+(/^Le type « [a-z] »/.test(x.msg)?" Une variable de type s'écrit avec une apostrophe : 'a.":"")};}}
function lisValeurRep(S,texte){const t=normalise(texte).trim();if(!t)return {vide:true};
  if(/^<?\s*(fun|fonction)\s*>?$/i.test(t))return {fun:true};
  let A;try{A=analyse(t,"expr");}catch(x){if(!x.faute)throw x;return {pb:"Je n'arrive pas à lire cette valeur. "+x.msg};}
  if(!constante(A.arbre))return {pb:A.arbre.k==="var"||A.arbre.k==="ctor"?"Écris la valeur comme OCaml l'affiche : une string entre guillemets, true et false en minuscules.":"Écris la valeur finale, une fois tous les calculs faits : un nombre, true ou false, une string entre guillemets, une liste entre crochets."};
  const r=S.lis(t)[0];if(r.faute)return {pb:"Cette valeur n'est pas bien écrite. "+r.msg};
  return {t:r.t,type:r.type,ecrit:r.ecrit};}
function diagType(sR,sT,etape){const sans=s=>s.replace(/[()]/g,""),plat=s=>sans(s).replace(/ \* /g," -> "),fl=s=>(s.match(/->/g)||[]).length;let type="type d'une expression",msg;
  if(sR.replace(/ list/g,"")===sT.replace(/ list/g,"")){type="type : élément et liste confondus";msg=`Regarde ce qui est une liste et ce qui est un élément : ${c("List.hd")} rend un élément, ${c("List.tl")} et ${c("::")} rendent une liste.`;}
  else if(sR.replace(/float/g,"int")===sT.replace(/float/g,"int")){type="type : int et float confondus";msg=`Un nombre écrit avec un point est un float ; sans point, c'est un int. Les opérateurs avec un point (${c("+. *. /.")}) rendent des float, les autres des int.`;}
  else if(plat(sR)===plat(sT)){type="type : couple et paramètres séparés confondus";msg=`${c("function (x, y) -> …")} prend un seul paramètre, un couple : ses types sont reliés par une étoile. ${c("fun x y -> …")} prend deux paramètres : ils sont reliés par une flèche.`;}
  else if(/'/.test(sT)&&!/'/.test(sR)){type="type : 'a oublié";msg=`Rien dans le code n'oblige ce type à être précis : OCaml écrit alors ${c("'a")}, n'importe quel type.`;}
  else if(/'/.test(sR)&&!/'/.test(sT)){type="type : 'a en trop";msg=`Ici, les opérateurs fixent tous les types : il n'y a pas de ${c("'a")}.`;}
  else if(fl(sR)!==fl(sT)){type="type : nombre de flèches";msg="Compte les paramètres : il y a une flèche après chacun, puis le type du résultat.";}
  else msg="Reprends les opérateurs un par un : chacun dit quel type il accepte, et quel type il rend.";
  return {etape,type,titre:"Où ça part : le type.",msg:`Tu as écrit ${c(sR)}. ${msg}`};}
function coupe(code,retrait){retrait=retrait||"  ";return code.split("\n").map(l=>{const L=[];
    while(l.length>40){let prof=0,dans=false,k=-1,k1=-1,mieux=-1;
      for(let i=0;i<40;i++){const ch=l[i];if(ch==='"')dans=!dans;else if(dans)continue;else if("([".includes(ch))prof++;else if(")]".includes(ch))prof--;
        else if(ch===" "&&prof===0&&i>8){k=i;if(/( in|->|=)$/.test(l.slice(0,i)))mieux=i;}
        else if(ch===" "&&prof===1&&i>14&&/[)\]]$/.test(l.slice(0,i)))k1=i;}
      if(mieux>20)k=mieux;if(k<0)k=k1;if(k<0)break;L.push(l.slice(0,k));l=retrait+l.slice(k+1);}
    L.push(l);return L.join("\n");}).join("\n");}
const POURQUOI=`Pour trouver un type, on ne calcule rien : on regarde ce que chaque opérateur ou fonction accepte, et ce qu'il rend.`;
const montreCalcul=d=>bloc(d.lignes.map((l,i)=>coupe((i?"= ":"  ")+l.replace(/\s*\n\s*/g," "),"    ")).concat(d.exc?["= exception "+d.exc]:[]).join("\n"));
/* o : {sig (on demande seulement la signature d'une fonction nommée), fix (ce qu'on pouvait écrire à la place d'une erreur), fun (dire que la valeur d'une fonction s'écrit <fun>)} */
function exoType(code,o){o=o||{};code=coupe(code);const S=ML.session(),r=S.lis(code)[0];
  if(!r||r.faute==="syntaxe"||r.faute==="exec"||r.exc)return null;
  const erreur=r.faute==="type",def=r.sorte==="def";let type="",ecrit="",T=null,E,fn=null;
  if(erreur){if(o.sig||r.sorte==="def")return null;
    E=[{w:`Ce que demande chaque opérateur ou fonction&nbsp;:<br>${regles(r.arbre.e).join("<br>")}`,why:POURQUOI,pts:1},
       {w:`<b>Erreur de type</b>, à cet endroit : ${c(r.extrait)}`,why:esc(r.msg),pts:2}];
    if(o.fix){const f=ML.calcule(o.fix);if(f.faute||f.exc)throw new Error("correction proposée fausse : "+o.fix);E.push({w:`Ce qu'on pouvait écrire : ${c(o.fix)}`,why:`Cette fois, l'expression est ${un(f.type)}, et elle vaut ${c(f.ecrit)}`,pts:0.5});}}
  else{
    if(def){if(r.noms.length!==1)return null;type=r.noms[0].type;T=r.noms[0].t;ecrit=r.noms[0].ecrit;fn=r.arbre.B[0].e;}else{type=r.type;T=r.t;ecrit=r.ecrit;fn=r.arbre.e;}
    while(fn.k==="annot")fn=fn.e;
    const estFn=rac(T).n==="->";if(o.sig&&!estFn)return null;
    if(/_weak/.test(type)||ecrit.length>40||/\d\.\d{5}/.test(ecrit)||/e[-+]\d/.test(ecrit))return null;
    if(estFn&&(fn.k==="fun"||(fn.k==="function"&&fn.C.length===1)))E=etapesFn(fn,r.src,T);
    else{const d=ML.session().deroule(code),R=regles(d.arbre);
      if(!estFn&&(d.exc||!d.fini||d.lignes[d.lignes.length-1]!==ecrit)&&d.lignes.length>1)throw new Error("calcul montré différent de la valeur : "+code+" → "+d.lignes.join(" = ")+" ≠ "+ecrit);
      E=[{w:R.length?`Ce que demande chaque opérateur ou fonction&nbsp;:<br>${R.join("<br>")}`:`Il n'y a ici ni opérateur ni fonction : seulement des valeurs.`,why:POURQUOI,pts:1},
         {w:`Le type : <b>${c(type)}</b>`,why:conclut(d.arbre,d.src),pts:1},
         estFn?{w:`La valeur est une fonction : OCaml affiche <b>${c("<fun>")}</b>`,why:"Une fonction ne s'affiche pas : OCaml montre seulement son type. Il manque encore des arguments pour faire le calcul.",pts:1}
          :d.lignes.length>1?{w:`La valeur, calcul par calcul&nbsp;:${montreCalcul(d)}Donc la valeur est <b>${c(ecrit)}</b>`,why:recit(d.faits)||"On calcule d'abord ce qui est entre parenthèses, puis les opérations dans l'ordre des priorités.",pts:1}
          :{w:`Il n'y a aucun calcul à faire : la valeur est <b>${c(ecrit)}</b>`,why:"L'expression est déjà une valeur : on la recopie comme OCaml l'écrit.",pts:1}];}}
  const iT=o.sig?3:1,iV=2,estFn=!erreur&&rac(T).n==="->",lignes=!erreur&&!estFn?ML.session().deroule(code).lignes:[];
  function juge(rep){
    if(!o.sig){if(rep.ok!=="oui"&&rep.ok!=="non")return {incomplet:"Dis d'abord si l'expression a un type, ou si c'est une erreur de type."};
      if(rep.ok==="non")return erreur?{ok:true}:{ok:false,faux:[],resume:"Pas tout à fait : cette expression est bien typée.",diag:{etape:1,type:"expression correcte prise pour une erreur de type",titre:"Où ça part : il n'y a pas d'erreur ici.",msg:E[1].why}};}
    const lt=lisTypeRep(S,rep.t);if(lt.vide)return {incomplet:o.sig?"Écris la signature : le type du ou des paramètres, une flèche, puis le type du résultat.":"Écris le type de l'expression."};
    if(lt.pb)return {incomplet:"Je n'arrive pas à lire ce type. "+lt.pb};
    let lv=null;if(!o.sig){lv=lisValeurRep(S,rep.v);if(lv.vide)return {incomplet:"Écris aussi la valeur."};if(lv.pb)return {incomplet:lv.pb};}
    if(erreur)return {ok:false,faux:[],resume:"Pas tout à fait : cette expression ne se calcule pas, elle contient une erreur de type.",diag:{etape:1,type:"erreur de type non vue",titre:"Où ça part : il y a une erreur de type.",msg:esc(r.msg)}};
    if(!memeType(lt.t,T))return {ok:false,faux:["t"],resume:o.sig?"Pas tout à fait : ce n'est pas la bonne signature.":"Pas tout à fait : le type n'est pas le bon.",diag:diagType(ecrisType(lt.t),type,iT)};
    if(o.sig)return {ok:true};
    const fauxV=(sorte,msg)=>({ok:false,faux:["v"],resume:"Pas tout à fait : le type est juste, mais pas la valeur.",diag:{etape:iV,type:sorte,titre:"Où ça part : la valeur.",msg}});
    if(estFn)return lv.fun?{ok:true}:fauxV("valeur d'une fonction",`Cette expression est une fonction : il lui manque des arguments, donc aucun calcul ne se fait. OCaml affiche ${c("<fun>")}.`);
    if(lv.fun)return fauxV("valeur d'une expression",`Ce n'est pas une fonction : le type est ${c(type)}, et le calcul va jusqu'au bout.`);
    if(!convient(lv.t,T))return fauxV("valeur écrite avec un autre type",`Tu as écrit ${c(lv.ecrit)}, qui est ${un(lv.type)}. Or la valeur est ${un(type)}.${type==="float"?` Un float s'écrit avec un point, comme ${c("3.")} ou ${c("2.5")}.`:/list$/.test(type)&&/\*/.test(lv.type)?" Dans une liste, les éléments sont séparés par des points-virgules. Avec des virgules, on écrit un couple.":type==="int"&&lv.type==="float"?` Entre deux int, ${c("/")} est la division entière : le résultat reste un int, sans point.`:""}`);
    if(lv.ecrit!==ecrit)return fauxV(lignes.includes(lv.ecrit)?"calcul arrêté en route":"valeur d'une expression",lignes.includes(lv.ecrit)?`${c(lv.ecrit)} apparaît bien pendant le calcul, mais ce n'est pas encore la valeur finale : il reste des opérations à faire.`:`Tu as trouvé ${c(lv.ecrit)}. Reprends le calcul ligne par ligne.${/ \/ | mod /.test(code)?` Attention à ${c("/")} et ${c("mod")} : le quotient et le reste de la division entière.`:""}`);
    return {ok:true};}
  const champs=o.sig?[{k:"champ",id:"t",nom:"signature",label:`Signature de ${r.noms[0].n} :`,ex:"par exemple int -> bool",apercu:false,sym:o.symT?symDe(SYMT,o.symT):SYMT}]
    :[{k:"choix",id:"ok",o:[["oui","Elle a un type"],["non","Erreur de type"]]},{k:"champ",id:"t",nom:"type",label:"Son type :",ex:"par exemple int list",si:{ok:"oui"},apercu:false,sym:o.symT?symDe(SYMT,o.symT):SYMT},{k:"champ",id:"v",nom:"valeur",label:"Sa valeur :",ex:"comme OCaml l'écrit",si:{ok:"oui"},apercu:false,sym:o.symV?symDe(SYMV,o.symV):o.fun?SYMV:SYMV.slice(0,-1)}];
  const autreT=type==="int"?"float":type==="bool"?"int":"bool";
  return {sig:"T"+code,code,
    q:o.sig?`Voici une fonction OCaml. Donne sa signature : le type de son ou de ses paramètres, puis une flèche, puis le type du résultat.`
      :`Voici une expression OCaml. Si elle est bien typée, donne son type et sa valeur. Sinon, réponds « Erreur de type ».${o.fun?` Si c'est une fonction, sa valeur s'écrit ${esc("<fun>")}, comme OCaml l'affiche.`:""}`,
    corps:bloc(code),texte:code.replace(/\s+/g," ")+(o.sig?" — signature":" — type et valeur, ou erreur de type"),champs,juge,etapes:E,
    bonne:erreur?"erreur de type":o.sig?c(type):`type ${c(type)}, valeur ${c(ecrit)}`,bonneTxt:erreur?"erreur de type":o.sig?type:`type ${type}, valeur ${ecrit}`,
    repBonne:erreur?{ok:"non"}:o.sig?{t:type}:{ok:"oui",t:type,v:ecrit},repFausse:erreur?{ok:"oui",t:"int",v:"0"}:o.sig?{t:autreT}:{ok:"oui",t:autreT,v:ecrit},
    nature:erreur?"erreur":estFn?"fonction":/list/.test(type)?"liste":/\*/.test(type)?"couple":type,ens:{code,erreur,type,ecrit,ocaml:[{code:def?code+" in "+r.noms[0].n:code,attendu:erreur?"ERR":"T:"+type+"|V:"+ecrit}]}};}

const MOTSF=["chat","chien","lune","soleil","pomme","poire","lundi","mardi","liste","arbre","mer","un","deux","trois","ab","abc","b","zoo","ami"];
/* une famille rend un code, ou [code, ce qu'on pouvait écrire] pour une expression fausse */
const tireParmi=(R,justes,fausses,part,o)=>{for(;;){const faux=R()<part,x=R.choix(faux?fausses:justes)(R),e=exoType(Array.isArray(x)?x[0]:x,Object.assign({fix:Array.isArray(x)?x[1]:null},o));
    if(e&&(e.ens.erreur===faux))return e;}};
const BASE=[
 R=>{const a=R.ent(7,29),b=R.ent(2,6),k=R.ent(2,9);return R.choix([`${a} / ${b} + ${k}`,`${a} mod ${b} * ${k}`,`${k} + ${a} / ${b}`,`${a} - ${b} * ${k}`,`(${a} + ${k}) / ${b}`,`(${a} + ${k}) mod ${b}`,`${a} / ${b} * ${b}`,`${a} / ${b} + ${a} mod ${b}`,`${k} * ${b} - ${a} / ${b}`,`${a} mod ${b} + ${a} mod ${k}`,`${a} - ${k} - ${b}`,`${a} * ${b} mod ${k}`]);},
 R=>{const a=R.ent(1,9),b=R.choix([2,4,5]),k=R.ent(1,4);return R.choix([`${a}. /. ${b}.`,`${a}.5 +. ${k}.5`,`${a}. *. ${k}.5`,`float_of_int ${a} /. ${b}.`,`${a}.5 -. ${k}.`,`float_of_int (${a} + ${k}) *. 0.5`,`${a}. /. ${b}. +. 1.`,`${a}.5 *. 2. -. ${k}.`]);},
 R=>{const a=R.ent(2,9),b=R.choix([2,4,5]),d=R.choix([5,25,75,9]);return R.choix([`int_of_float ${a}.${d}`,`int_of_float (${a}.${d} +. 0.5)`,`int_of_float ${a}.${d} + ${b}`,`int_of_float (${a*b}. /. ${b}.)`,`float_of_int (${a+7} / ${b})`,`float_of_int ${a} /. float_of_int ${b}`,`int_of_float ${a+2}.${d} / ${b}`,`float_of_int (int_of_float ${a}.${d})`]);},
 R=>{const a=R.ent(1,9),b=R.ent(1,9),k=R.ent(1,9),d=R.ent(2,5);return R.choix([`${a} < ${b} && ${b} < ${k}`,`${a} > ${b} || ${a} = ${k}`,`not (${a} < ${b})`,`${a} + ${b} = ${k} * ${d}`,`${a+10} mod ${d} = 0`,`${a} <> ${b} && ${k} mod 2 = 1`,`not (${a} = ${b}) || ${k} > ${d}`,`${a} * ${d} >= ${b} * ${k}`,`${a} <= ${b} = true`,`${a}. < ${b}.5`,`(${a} < ${b}) = (${k} < ${d})`,`${a} = ${b} || ${a} < ${k} && ${k} < ${d}`]);},
 R=>{const m=R.mel(MOTSF),n=R.ent(11,40),k=R.ent(2,9);return R.choix([`"${m[0]}" ^ "${m[1]}"`,`"${m[0]}" ^ " " ^ "${m[1]}"`,`"${m[0]}" < "${m[1]}"`,`"${m[0]}" ^ string_of_int ${n}`,`String.length "${m[0]}" + ${k}`,`"${m[0]}" = "${m[1]}"`,`"${n}" < "${k}"`,`String.length ("${m[0]}" ^ "${m[1]}")`,`"${m[0]}" <> "${m[0]}"`,`string_of_int (${n} + 1) ^ "${m[0]}"`,`"${m[0]}" > "${m[1]}" || "${m[1]}" > "${m[2]}"`,`"${m[0]}" ^ "${m[1]}" = "${m[0]}${m[1]}"`]);}];
const BASEF=[
 R=>{const a=R.ent(2,9),b=R.ent(2,9);return R.choix([[`${a} + ${b}.5`,`float_of_int ${a} +. ${b}.5`],[`${a}. * ${b}.`,`${a}. *. ${b}.`],[`${a} /. ${b}`,`${a}. /. ${b}.`],[`${a}.0 + ${b}.0`,`${a}.0 +. ${b}.0`],[`${a+5} mod ${b}.`,`${a+5} mod ${b}`],[`${a}. +. ${b}`,`${a}. +. ${b}.`],[`${a} = ${b}.`,`float_of_int ${a} = ${b}.`],[`${a}.5 < ${b}`,`${a}.5 < ${b}.`],[`float_of_int ${a}.`,`float_of_int ${a}`],[`int_of_float ${a}`,`int_of_float ${a}.`],[`- ${a}. + 1.`,`-. ${a}. +. 1.`]]);},
 R=>{const a=R.ent(2,9),b=R.ent(2,9),m=R.choix(MOTSF);return R.choix([[`"${m}" + ${a}`,`"${m}" ^ string_of_int ${a}`],[`"${m}" ^ ${a}`,`"${m}" ^ string_of_int ${a}`],[`${a} ^ "${m}"`,`string_of_int ${a} ^ "${m}"`],[`"${a}" + "${b}"`,`"${a}" ^ "${b}"`],[`${a} = "${a}"`,`string_of_int ${a} = "${a}"`],[`String.length ${a}${b}`,`String.length "${a}${b}"`],[`"${m}" < ${a}`,null],[`String.length "${m}" ^ "a"`,`String.length ("${m}" ^ "a")`]]);},
 R=>{const a=R.ent(2,9),b=R.ent(2,9);return R.choix([[`not ${a}`,`not (${a} = 0)`],[`${a} && true`,null],[`${a} < ${b} < ${a+b}`,`${a} < ${b} && ${b} < ${a+b}`],[`true + ${a}`,null],[`${a} > ${b} && ${a}`,`${a} > ${b} && ${a} > 0`],[`not ${a} < ${b}`,`not (${a} < ${b})`],[`${a} = ${b} = ${a}`,`${a} = ${b} && ${b} = ${a}`],[`${a} || ${b} > 0`,null]]);}];
const IFLET=[
 R=>{const a=R.ent(1,9),b=R.ent(1,9),k=R.ent(2,9),d=R.ent(2,9),m=R.mel(MOTSF);return R.choix([`if ${a} < ${b} then ${k} + 1 else ${d} * 2`,`if ${a+10} mod 2 = 0 then "pair" else "impair"`,`(if ${a} > ${b} then ${a} else ${b}) + ${k}`,`if ${a} < ${b} then ${k}. else ${d}.5`,`if ${a} = ${b} then true else ${k} < ${d}`,`if ${a} > ${b} then (if ${a} > ${k} then ${a} else ${k}) else ${b}`,`if not (${a} < ${b}) then ${a} - ${b} else ${b} - ${a}`,`${k} * (if ${a} < ${b} then 2 else 3)`,`if ${a+7} / ${k} = 0 then ${a} else ${a+7} mod ${k}`,`if "${m[0]}" < "${m[1]}" then 1 else 2`,`if ${a} < ${b} && ${b} < ${k} then "oui" else "non"`,`if ${a} <> ${b} then ${a} * ${b} else ${a} + ${b}`]);},
 R=>{const a=R.ent(2,9),b=R.ent(2,9),k=R.ent(2,5),m=R.choix(MOTSF);return R.choix([`let x = ${a} in x * x + 1`,`let x = ${a} and y = ${b} in x - y * 2`,`let x = ${a} in let y = x + ${b} in x * y`,`let x = ${a}.5 in x *. 2.`,`let x = ${a} in let x = x + 1 in x * 2`,`let a = ${a} in let b = a * 2 in b - a`,`let x = ${a+11} / ${k} in x * ${k} + ${a+11} mod ${k}`,`let s = "${m}" in s ^ s`,`let b = ${a} < ${b} in if b then 1 else 0`,`let x = ${a} in if x mod 2 = 0 then x / 2 else 3 * x + 1`,`let (a, b) = (${a}, ${b}) in a * b - 1`,`let x = ${a} in (let y = x * 2 in y + 1) + x`,`let x = ${a} and y = ${b} in if x < y then y - x else x - y`,`let n = String.length "${m}" in n * n`]);}];
const IFLETF=[
 R=>{const a=R.ent(1,9),b=R.ent(1,9),k=R.ent(2,9);return R.choix([[`if ${a} then 1 else 2`,`if ${a} <> 0 then 1 else 2`],[`if ${a} < ${b} then 1 else 2.`,`if ${a} < ${b} then 1. else 2.`],[`if ${a} < ${b} then "oui" else 0`,`if ${a} < ${b} then "oui" else "non"`],[`if ${a} < ${b} then ${k}`,`if ${a} < ${b} then ${k} else 0`],[`if ${a} = ${b} then true else 0`,`if ${a} = ${b} then true else false`],[`(if ${a} < ${b} then 1 else 2) ^ "a"`,null],[`if ${a} < ${b} then ${k} else ${k} < ${b}`,null],[`${k} + (if ${a} < ${b} then 1.5 else 2.)`,`${k}. +. (if ${a} < ${b} then 1.5 else 2.)`]]);},
 R=>{const a=R.ent(2,9),b=R.ent(2,9);return R.choix([[`let x = ${a} in x +. 1.`,`let x = ${a}. in x +. 1.`],[`let x = ${a} and y = x + 1 in x + y`,`let x = ${a} in let y = x + 1 in x + y`],[`let x = ${a}. in x + 1`,`let x = ${a} in x + 1`],[`let x = ${a} in y + 1`,`let y = ${a} in y + 1`],[`let b = ${a} in if b then 1 else 0`,`let b = ${a} > 0 in if b then 1 else 0`],[`let x = "${a}" in x + ${b}`,`let x = ${a} in x + ${b}`],[`let x = ${a} in x ^ "a"`,`let x = "${a}" in x ^ "a"`],[`let (a, b) = ${a} in a + b`,`let (a, b) = (${a}, ${b}) in a + b`]]);}];
const LISTES=[
 R=>{const a=R.ent(1,9),b=R.ent(2,9),k=R.ent(1,9),d=R.ent(1,9);return R.choix([`${a} :: ${b} :: []`,`(${a+7} / ${b}) :: (${a+7} mod ${b}) :: []`,`List.hd [${a}; ${b}] + ${k}`,`List.tl [${a}; ${b}; ${k}]`,`${a} :: List.tl [${b}; ${k}; ${d}]`,`List.hd (List.tl [${a}; ${b}; ${k}])`,`[${a}; ${b}] @ [${k}]`,`List.hd [${a}.5; ${b}.] > ${k}.`,`[${a}] :: [[${b}; ${k}]]`,`List.tl [${a}]`,`[${a} + ${b}; ${a} * ${b}]`,`List.hd [${a}; ${b}] :: [${k}]`,`List.tl [${a}; ${b}] @ [${k}; ${d}]`,`List.length (${a} :: [${b}; ${k}])`,`[${a} < ${b}; true]`,`List.hd [[${a}; ${b}]; [${k}]]`,`List.tl [[${a}]; [${b}; ${k}]]`,`[${a}; ${b}] = ${a} :: [${b}]`,`List.hd [${a}; ${b}] < List.hd [${k}]`,`List.length [${a}; ${b}] = 2`,`List.length [[${a}]; [${b}; ${k}]]`,`List.tl (List.tl [${a}; ${b}; ${k}])`,`${a} :: [${b}] @ [${k}]`,`List.hd (List.tl [${a}; ${b}]) * ${k}`]);},
 R=>{const a=R.ent(1,9),b=R.ent(1,9),k=R.ent(1,9),m=R.mel(MOTSF);return R.choix([`[${a}, ${b}]`,`(${a}, ${b} < ${k})`,`fst (${a}, "${m[0]}") + 1`,`List.hd ["${m[0]}"; "${m[1]}"] ^ "${m[2]}"`,`snd (${a}, ${b}.5) *. 2.`,`[(${a}, "${m[0]}")]`,`(List.hd [${a}; ${b}], List.tl [${a}; ${b}])`,`"${m[0]}" :: ["${m[1]}"]`,`List.hd ["${m[0]}"; "${m[1]}"] < "${m[2]}"`,`(${a} + ${b}, "${m[0]}" ^ "${m[1]}")`,`fst (${a}, ${b}) :: [snd (${a}, ${b})]`,`List.length ["${m[0]}"; "${m[1]}"; "${m[2]}"]`,`List.hd [(${a}, ${b}); (${k}, ${a})]`,`snd (List.hd [(${a}, true); (${b}, false)])`,`(${a}, ${b}) = (${a}, ${k})`,`String.length (List.hd ["${m[0]}"; "${m[1]}"])`]);}];
const LISTESF=[
 R=>{const a=R.ent(1,9),b=R.ent(1,9),k=R.ent(1,9),m=R.choix(MOTSF);return R.choix([[`[${a}; ${b}.]`,`[${a}.; ${b}.]`],[`${a} :: [[${b}]]`,`[${a}] :: [[${b}]]`],[`[${a}; ${b}] @ ${k}`,`[${a}; ${b}] @ [${k}]`],[`${a} @ [${b}]`,`${a} :: [${b}]`],[`[${a}] :: [${b}]`,`[${a}] @ [${b}]`],[`List.hd [${a}; ${b}] ^ "a"`,null],[`List.hd ${a}`,`List.hd [${a}]`],[`[${a}; "${m}"]`,null],[`${a} :: ${b}`,`${a} :: [${b}]`],[`List.tl [${a}; ${b}] + 1`,`List.hd [${a}; ${b}] + 1`],[`[${a}] @ [${b}.5]`,null],[`fst [${a}; ${b}]`,`fst (${a}, ${b})`],[`List.hd (${a}, ${b})`,`List.hd [${a}; ${b}]`],[`(${a}, ${b}) + 1`,null],[`[${a}; ${b}] = ${a}`,`List.hd [${a}; ${b}] = ${a}`],[`List.length ${a}`,`List.length [${a}]`],[`"${m}" :: [${a}]`,null],[`List.hd [${a}; ${b}] :: ${k}`,`List.hd [${a}; ${b}] :: [${k}]`],[`List.tl [${a}; ${b}] :: [${k}]`,`List.tl [${a}; ${b}] @ [${k}]`],[`[${a}; ${b}] :: ${k}`,null]]);}];
const NOMSP=[["x","y","z"],["a","b","c"],["u","v","w"],["p","q","r"]];
const C1=[x=>`${x} + 1`,x=>`${x} * ${x}`,x=>`${x} mod 2 = 0`,x=>`${x} *. 2.`,x=>`${x} ^ "!"`,x=>`not ${x}`,x=>`${x} :: []`,x=>`List.hd ${x} + 1`,x=>`List.hd ${x}`,x=>`List.tl ${x}`,x=>`List.length ${x}`,x=>`if ${x} then 1 else 0`,x=>`if ${x} > 0 then ${x} else 0 - ${x}`,x=>`(${x}, ${x} + 1)`,x=>`${x} > 0 && ${x} < 10`,x=>`[${x}; 2 * ${x}]`,x=>`float_of_int ${x} /. 2.`,x=>`${x} = []`,x=>`string_of_int ${x} ^ "a"`,x=>`List.hd ${x} = 0`,x=>`List.tl ${x} = []`,x=>`${x}`,x=>`(${x}, ${x})`,x=>`[${x}]`,x=>`List.hd (List.tl ${x})`,x=>`fst ${x} + 1`,x=>`fst ${x}`,x=>`fst ${x} + snd ${x}`,x=>`List.hd ${x} ^ "a"`,x=>`List.hd ${x} :: List.tl ${x}`,x=>`List.length ${x} > 0`,x=>`${x} < 2.5`,x=>`String.length ${x} + 1`,x=>`if List.hd ${x} then 1 else 2`,x=>`(List.hd ${x}, List.tl ${x})`,x=>`${x} +. float_of_int 2`,x=>`int_of_float ${x} + 1`,x=>`${x} = "oui"`];
const C2=[(x,y)=>`${x} + ${y}`,(x,y)=>`${x} < ${y}`,(x,y)=>`if ${y} then ${x} + 1 else 2 * ${x}`,(x,y)=>`${x} + 2 * List.hd ${y}`,(x,y)=>`${x} < List.hd ${y}`,(x,y)=>`${x} :: ${y}`,(x,y)=>`${x} ^ string_of_int ${y}`,(x,y)=>`if ${x} then ${y} else ${y} + 1`,(x,y)=>`${x} :: List.tl ${y}`,(x,y)=>`List.hd ${x} + List.hd ${y}`,(x,y)=>`${x} @ ${y}`,(x,y)=>`(${y}, ${x})`,(x,y)=>`${x} && ${y} > 0`,(x,y)=>`if ${x} = ${y} then 1 else 0`,(x,y)=>`${x} *. float_of_int ${y}`,(x,y)=>`List.length ${x} + ${y}`,(x,y)=>`${x} = List.hd ${y}`,(x,y)=>`if ${x} > 0 then ${y} else "non"`,(x,y)=>`[${x}; ${y}]`,(x,y)=>`if ${x} then ${y} else []`,(x,y)=>`(${x} + 1, not ${y})`,(x,y)=>`${x} mod ${y} = 0`,(x,y)=>`List.hd ${y} :: ${x}`,(x,y)=>`${y}`,(x,y)=>`if List.hd ${x} then ${y} else 0`,(x,y)=>`${x} ^ ${y}`,(x,y)=>`${x} +. ${y}`,(x,y)=>`List.length ${x} = ${y}`,(x,y)=>`${x} :: ${y} :: []`,(x,y)=>`if ${x} < ${y} then ${x} else ${y}`,(x,y)=>`(${x}, List.hd ${y})`,(x,y)=>`${x} || List.hd ${y}`,(x,y)=>`List.tl ${x} @ [${y}]`,(x,y)=>`${x} / ${y} + ${x} mod ${y}`,(x,y)=>`${x} > 0. && ${y}`,(x,y)=>`String.length ${x} > ${y}`];
const C3=[(x,y,z)=>`if ${x} then ${y} else ${z}`,(x,y,z)=>`${x} + ${y} * ${z}`,(x,y,z)=>`if ${x} < ${y} then ${z} else ${z} + 1`,(x,y,z)=>`${x} :: ${y} @ ${z}`,(x,y,z)=>`(${x} + ${y}, ${z})`,(x,y,z)=>`${x} < ${y} && ${z}`,(x,y,z)=>`if ${x} then ${y} :: ${z} else ${z}`,(x,y,z)=>`${x} ^ ${y} = ${z}`,(x,y,z)=>`List.hd ${x} + ${y} > ${z}`];
const plie=(tete,corps)=>(tete+" "+corps).length>40?tete+"\n  "+corps:tete+" "+corps;
function signature(R){for(;;){const [x,y,z]=R.choix(NOMSP),f=R.choix(["f","g","h"]),n=R.choix([1,1,2,2,2,2,3]);let code;
    if(n===1)code=plie(R.choix([`let ${f} = function ${x} ->`,`let ${f} = fun ${x} ->`,`let ${f} ${x} =`]),R.choix(C1)(x));
    else if(n===2)code=plie(R.choix([`let ${f} = function (${x}, ${y}) ->`,`let ${f} = fun ${x} ${y} ->`,`let ${f} = fun ${x} ${y} ->`,`let ${f} ${x} ${y} =`,`let ${f} (${x}, ${y}) =`]),R.choix(C2)(x,y));
    else code=plie(R.choix([`let ${f} = fun ${x} ${y} ${z} ->`,`let ${f} = function (${x}, ${y}, ${z}) ->`,`let ${f} = fun (${x}, ${y}) ${z} ->`,`let ${f} ${x} ${y} ${z} =`]),R.choix(C3)(x,y,z));
    const e=exoType(code,{sig:true,symT:ST1.concat(["list","->","*","'a","(",")"])});if(e)return e;}}
const SUP=[
 R=>{const a=R.ent(2,9),b=R.ent(2,9),k=R.ent(2,5);return R.choix([`(fun x -> x * ${k}) ${a}`,`(fun x y -> x - y) ${a+b} ${b}`,`let f = fun x y -> x + y in f ${a}`,`let f = fun x -> x * ${k} in f (f ${a})`,`(fun (x, y) -> x * y) (${a}, ${b})`,`let double = fun f x -> f (f x) in double (fun n -> n + ${k}) ${a}`,`(fun x -> x > ${k}) ${a}`,`let f = fun x y -> x ^ y in f "a"`,`(fun x -> (x, x + 1)) ${a}`,`let g = fun (x, y) -> x + y in g (${a}, ${b}) * ${k}`,`(fun x y -> x :: y) ${a} [${b}]`,`(fun x y -> x :: y) ${a}`]);},
 R=>{const L=R.mel([1,2,3,4,5,6,7,8,9]).slice(0,R.ent(3,4)),l=`[${L.join("; ")}]`,k=R.ent(2,5),m=R.mel(MOTSF);return R.choix([`List.map (fun x -> x * ${k}) ${l}`,`List.map (fun x -> x > ${k}) ${l}`,`List.filter (fun x -> x mod 2 = 0) ${l}`,`List.filter (fun x -> x > ${k}) ${l}`,`List.fold_left (+) 0 ${l}`,`List.fold_left (fun a x -> a * x) 1 [${L.slice(0,3).join("; ")}]`,`List.map String.length ["${m[0]}"; "${m[1]}"]`,`List.map (fun (a, b) -> a + b) [(${L[0]}, ${L[1]}); (${L[2]}, ${k})]`,`List.map fst [(${L[0]}, "a"); (${L[1]}, "b")]`,`let p = fun x -> x > ${k} in List.length (List.filter p [${L.slice(0,3).join("; ")}])`,`let add = fun x y -> x + y in List.map (add ${k}) ${l}`,`List.fold_left (fun a x -> a + x * x) 0 [${L.slice(0,3).join("; ")}]`,`List.fold_left (fun a x -> x :: a) [] ${l}`,`List.map (fun x -> [x]) [${L.slice(0,3).join("; ")}]`,`List.fold_left max 0 ${l}`]);},
 R=>R.choix([`fun x -> x`,`fun x y -> x`,`fun (x, y) -> (y, x)`,`fun f x -> f (f x)`,`fun f x -> f x + 1`,`fun f li -> List.map f (List.tl li)`,`fun li -> List.hd li :: []`,`fun x li -> x :: li`,`fun p x -> if p x then x else x + 1`,`fun f -> f 0 + 1`,`fun f -> List.map f [1; 2]`,`fun x -> [x; x]`,`fun li -> List.length li > 0`,`fun f (x, y) -> (f x, f y)`,`fun x y -> (y, x)`,`fun f x -> not (f x)`,`fun x -> fun y -> x + y`,`fun p li -> List.length (List.filter p li)`,`fun x li -> List.hd li = x`])];
const SUPF=[
 R=>{const a=R.ent(2,9),b=R.ent(2,9),L=`[${R.mel([1,2,3,4,5,6]).slice(0,3).join("; ")}]`;return R.choix([[`(fun x -> x + 1) true`,null],[`List.map (fun x -> x + 1) ${a}`,`List.map (fun x -> x + 1) [${a}]`],[`(fun x y -> x + y) ${a} ${b} 1`,`(fun x y -> x + y) ${a} ${b}`],[`List.map ${L} (fun x -> x + 1)`,`List.map (fun x -> x + 1) ${L}`],[`List.filter (fun x -> x + 1) ${L}`,`List.filter (fun x -> x > 1) ${L}`],[`List.fold_left (+) ${L} 0`,`List.fold_left (+) 0 ${L}`],[`let f = fun x -> x + 1 in f f`,`let f = fun x -> x + 1 in f (f ${a})`],[`(fun x -> x ^ "a") ${a}`,`(fun x -> x ^ "a") "${a}"`],[`List.map (fun x -> x * 2) ${a} :: ${L}`,`List.map (fun x -> x * 2) (${a} :: ${L})`],[`(fun (x, y) -> x + y) ${a} ${b}`,`(fun (x, y) -> x + y) (${a}, ${b})`],[`List.map (fun x -> x ^ "a") ${L}`,null],[`(fun x -> x) ${a} + (fun x -> x) true`,null]]);}];

/* ---------- PF2 : que renvoie cette fonction pour cette entrée ? ---------- */
const NOMSF=["f","g","h","mystere"];
const lst=L=>`[${L.join("; ")}]`;
const SYMR=SYMV.filter(s=>s[0]!=="<fun>");
const finLigne=s=>s.replace(/\s*\n\s*/g," ");
const estValeur=t=>{try{return constante(analyse(t,"expr").arbre);}catch(x){if(!x.faute)throw x;return false;}};
/* une valeur fausse plausible, du même type, pour les essais */
function voisine(type,ecrit,autres){const a=autres.find(x=>x!==ecrit);if(a!==undefined)return a;
  if(type==="bool")return String(ecrit!=="true");if(type==="string")return ecrit==='"zz"'?'"yy"':'"zz"';
  if(ecrit==="[]")return /^bool/.test(type)?"[true]":/^string/.test(type)?'["a"]':"[0]";
  if(/\d/.test(ecrit))return ecrit.replace(/\d+/,m=>String(+m+1));
  return ecrit.replace(/true|false/,m=>m==="true"?"false":"true");}
/* o : {it:{k,fn,init}} pour une fonction écrite avec un itérateur de List ; nat : la sorte d'exercice */
function exoRenvoie(def,appel,o){o=o||{};
  def=def.replace(/^(let (?:rec )?\w+ : [^\n]*? =) ((?:fun|function)\b[^\n]*)/,(m,a,b)=>m.length>40?a+"\n  "+b:m);
  const avant=def;def=coupe(def);
  const nom=/^let (?:rec )?([a-z_]+)/.exec(def)[1],rec=/^let rec /.test(def);
  const pre=o.pre||"",S=ML.session(),suivi={nom};if(pre&&S.lis(pre).some(x=>x.faute))throw new Error("prélude faux : "+pre);
  const R=S.lis(def+"\n;;\n"+appel,{suivi}),r=R[R.length-1];
  if(R.some(x=>x.faute)||!r||r.sorte!=="expr"||r.exc)return null;
  const type=r.type,ecrit=r.ecrit,T=r.t;
  if(/'|_weak|<fun>|<poly>/.test(type+ecrit)||ecrit.length>40)return null;
  let E,inter=[],base=null,aRebours=null;
  const fin=pourquoi=>({w:`Donc ${c(appel)} vaut <b>${c(ecrit)}</b>`,why:pourquoi+` Son type est ${c(type)} : c'est ce qu'annonce la fin de la signature de ${c(nom)}.`,pts:0.5});
  if(rec){const d=S.deplie(suivi);if(!d||(d.arbre&&!o.arbre)||d.lignes.length<2||d.lignes.length>7)return null;
    const val=l=>l.parts[l.parts.length-1];inter=d.lignes.map(val);base=val(d.lignes[0]);const dernier=d.ordre[d.ordre.length-1];
    if(d.terminale){
      E=[{w:`Les appels, du premier au dernier&nbsp;:${bloc(coupe(d.ordre.join("\n= ")+"\n= "+ecrit,"    "))}`,why:`Chaque appel se contente de rappeler ${c(nom)} avec de nouveaux arguments : le calcul se fait dans les arguments, au fil de la descente. Il ne reste rien à faire en remontant.`,pts:2},
        {w:`Le dernier appel, ${c(dernier)}, est le cas de base : il renvoie ${c(base)}.`,why:"Avec un accumulateur, la valeur du cas de base est déjà la réponse.",pts:0.5},
        fin("C'est la valeur du cas de base, renvoyée telle quelle par chaque appel.")];}
    else{
      const feuille=/Node/.test(dernier);
      E=[{w:`Les appels s'enchaînent jusqu'au cas de base : ${d.ordre.map(c).join(" → ")}${feuille?` → ${c(nom+" Empty")}`:""}.`,why:`Chaque appel attend le résultat de l'appel suivant. ${c(feuille?nom+" Empty":dernier)} répond sans rappeler ${c(nom)} : c'est le cas de base.`,pts:1},
        {w:`On remonte, du cas de base vers le premier appel&nbsp;:${bloc(d.lignes.map(l=>coupe(l.parts.join(" = "),"    ")).join("\n"))}`,why:"Chaque ligne remplace l'appel récursif par sa valeur, trouvée juste au-dessus, puis fait le calcul.",pts:1.5},
        fin("C'est la dernière ligne de la remontée : la valeur du premier appel.")];}}
  else{const S2=ML.session();if(pre)S2.lis(pre);S2.lis(def);const d=S2.deroule(appel);
    if(!d.fini||d.exc||d.lignes[d.lignes.length-1]!==ecrit)throw new Error("calcul montré différent de la valeur : "+appel+" → "+d.lignes.join(" = "));
    if(d.lignes.length<3)return null;
    const sub=bloc(coupe(d.lignes[0]+"\n= "+finLigne(d.lignes[1]),"    "));
    if(o.it){const it=o.it,P=/^fun \(?(\w+)\)? (\w+) ->/.exec(it.fn)||/^fun (\w+) ->/.exec(it.fn),L=JSON.parse(it.L),pas=[],app=(...a)=>{const x=ML.session().deroule(`(${it.fn}) ${a.join(" ")}`);return [finLigne(x.lignes[1]||x.lignes[0]),x.lignes[x.lignes.length-1]];};
      const fr=v=>/^-/.test(v)?"("+v+")":v;let w0,w1,why1;
      if(it.k==="map"){L.forEach(x=>{const [m,v]=app(fr(x));pas.push(`${P[1]} = ${x} : ${m} = ${v}`);inter.push(v);});
        w0=`${c("List.map")} applique ${c(it.fn)} à chaque élément de la liste.`;w1=`Élément par élément, dans l'ordre&nbsp;:`;why1="La liste rendue a autant d'éléments que la liste de départ, dans le même ordre.";}
      else if(it.k==="filter"){const garde=[],jete=[];L.forEach(x=>{const [m,v]=app(fr(x));pas.push(`${P[1]} = ${x} : ${m} vaut ${v}, ${v==="true"?"gardé":"enlevé"}`);(v==="true"?garde:jete).push(x);});
        aRebours=lst(jete);w0=`${c("List.filter")} essaie ${c(it.fn)} sur chaque élément, et garde ceux pour lesquels elle rend ${c("true")}.`;w1=`Le test, élément par élément&nbsp;:`;why1="Les éléments gardés restent dans leur ordre de départ.";}
      else if(it.k==="fold_left"){let a=it.init;pas.push(`${P[1]} = ${a}`);L.forEach(x=>{const [m,v]=app(fr(a),fr(x));pas.push(`${P[2]} = ${x} : ${P[1]} = ${m} = ${v}`);a=v;inter.push(v);});inter.pop();
        w0=`${c("List.fold_left")} part de ${c(P[1]+" = "+it.init)}, puis parcourt la liste de gauche à droite.`;w1=`L'accumulateur ${c(P[1])}, élément par élément&nbsp;:`;why1=`À chaque élément, ${c(it.fn)} calcule le nouveau ${c(P[1])} à partir de l'ancien et de l'élément. La valeur finale est le dernier ${c(P[1])}.`;}
      else{let a=it.init;pas.push(`${P[2]} = ${a}`);L.slice().reverse().forEach(x=>{const [m,v]=app(fr(x),fr(a));pas.push(`${P[1]} = ${x} : ${P[2]} = ${m} = ${v}`);a=v;inter.push(v);});inter.pop();
        w0=`${c("List.fold_right")} part de la fin de la liste, avec ${c(P[2]+" = "+it.init)}.`;w1=`L'accumulateur ${c(P[2])}, du dernier élément au premier&nbsp;:`;why1=`${c("List.fold_right f [a; b; c] x")} calcule ${c("f a (f b (f c x))")} : l'élément le plus à droite est traité en premier.`;}
      E=[{w:`On remplace le paramètre par la liste de l'appel&nbsp;:${sub}`,why:w0,pts:1},{w:w1+bloc(pas.map(l=>coupe(l,"    ")).join("\n")),why:why1,pts:1.5},fin("C'est ce que rend l'itérateur.")];}
    else{const reste=d.lignes.slice(1),re=recit(d.faits.filter(f=>f.quoi!=="appel"));inter=d.lignes.slice(2,-1);
      E=[{w:`On remplace les paramètres par les valeurs de l'appel&nbsp;:${sub}`,why:"Pour appliquer une fonction, on remplace chaque paramètre par l'argument qui est à sa place, dans le corps de la fonction (ce qui suit la flèche).",pts:1},
        reste.length>2?{w:`Puis on calcule&nbsp;:${montreCalcul({lignes:reste})}`,why:re||"On calcule d'abord ce qui est entre parenthèses, puis les opérations dans l'ordre des priorités.",pts:1.5}:null,
        fin("C'est la dernière ligne du calcul.")].filter(Boolean);}}
  const iFin=E.length-1,S0=ML.session();if(pre)S0.lis(pre);
  function juge(rep){const lv=lisValeurRep(S0,rep.v);if(lv.vide)return {incomplet:`Écris la valeur de ${appel}, comme OCaml l'affiche.`};if(lv.pb)return {incomplet:lv.pb};
    const faux=(etape,sorte,titre,msg)=>({ok:false,faux:["v"],resume:"Pas tout à fait : ce n'est pas la valeur renvoyée.",diag:{etape,type:sorte,titre,msg}});
    if(lv.fun)return faux(iFin,"valeur d'un appel complet","Où ça part : l'appel a tous ses arguments.",`${c(appel)} donne à ${c(nom)} tous ses arguments : le calcul va jusqu'au bout, et sa valeur est ${un(type)}.`);
    if(!convient(lv.t,T))return faux(iFin,"type de la valeur renvoyée","Où ça part : le type de la valeur.",`Tu as écrit ${c(lv.ecrit)}, qui est ${un(lv.type)}. Or ${c(nom)} renvoie ${un(type)} : c'est ce qu'annonce la fin de sa signature.`);
    if(lv.ecrit===ecrit)return {ok:true};
    const v=lv.ecrit;
    if(aRebours&&v===aRebours)return faux(1,"filtre inversé","Où ça part : ce qu'on garde.",`Ce sont les éléments pour lesquels le test vaut ${c("false")}. ${c("List.filter")} garde ceux pour lesquels il vaut ${c("true")}.`);
    if(/^\[.*\]$/.test(v)&&v!=="[]"){const inv=v.slice(1,-1).split("; ").reverse().join("; ");if("["+inv+"]"===ecrit)return faux(Math.min(1,iFin),"ordre des éléments d'une liste","Où ça part : l'ordre de la liste.",`Les éléments sont les bons, mais pas leur ordre. ${c("x :: reste")} met x devant reste.`);}
    if(rec&&base!==null&&v===base&&inter.length>1)return faux(1,"valeur du cas de base","Où ça part : la remontée.",`${c(v)} est la valeur du cas de base. Il reste à remonter, appel par appel, jusqu'au premier.`);
    if(inter.includes(v))return faux(Math.min(1,iFin),rec?"remontée arrêtée en route":"calcul arrêté en route","Où ça part : le calcul s'arrête trop tôt.",`${c(v)} apparaît bien pendant le calcul, mais ce n'est pas encore la valeur finale. Va jusqu'au bout.`);
    return faux(Math.min(1,iFin),rec?"valeur d'une fonction récursive":"valeur d'un appel de fonction","Où ça part : un des calculs.",rec?"Reprends la remontée ligne par ligne : chaque appel remplace l'appel récursif par la valeur trouvée juste au-dessus.":"Reprends le calcul ligne par ligne, après avoir remplacé chaque paramètre par sa valeur.");}
  inter=inter.filter(estValeur);
  const fausse=voisine(type,ecrit,inter.filter(x=>{const t=ML.calcule(x);return !t.faute&&!t.exc&&t.type===type;}));
  return {sig:"R"+def.replace(/\s+/g," ")+"|"+appel,code:def,
    q:`Voici une fonction${rec?" récursive":""} OCaml. Que renvoie ${c(appel)} ? Écris la valeur comme OCaml l'affiche.`,
    corps:bloc((pre?pre+"\n\n":"")+def),texte:finLigne((pre?pre+" ":"")+def)+" — valeur de "+appel,
    champs:[{k:"champ",id:"v",nom:"valeur",label:`Valeur de ${esc(appel)} :`,ex:"comme OCaml l'écrit",apercu:false,sym:o.sym?symDe(SYMR,o.sym):SYMR}],juge,etapes:E,
    bonne:c(ecrit),bonneTxt:ecrit,repBonne:{v:ecrit},repFausse:{v:fausse},nature:o.nat||"valeur",
    ens:{code:def,appel,type,ecrit,coupe:(r=>coupe(r)!==r)(avant.split("\n").slice(1).join("\n")),ocaml:[{code:(pre?pre+"\n;;\n":"")+def+" in "+appel,attendu:"T:"+type+"|V:"+ecrit}]}};}
/* une famille rend [définition, appel] ou [définition, appel, itérateur] */
const tireRenvoie=(R,F,nat,sym)=>{for(;;){const x=R.choix(F)(R);if(!x)continue;const e=exoRenvoie(x[0],x[1],{it:x[2],nat,sym});if(e)return e;}};
const nf=R=>R.choix(NOMSF),nc=R=>R.choix(["f","g","h"]),sig=(f,t)=>`let ${f} : ${t} =`;
const SANSREC=[
 R=>{const f=nf(R),b=R.choix([2,3,4,5]),a=R()<0.5?b*R.ent(2,6):R.ent(7,29);return [`${sig(f,"int -> int -> int")} fun a b ->\n  if a mod b = 0 then a / b\n  else a * b`,`${f} ${a} ${b}`];},
 R=>{const f=nf(R),x=R.ent(1,9),y=R.ent(1,9);return [`${sig(f,"int * int -> int")}\n  function (a, b) ->\n  if a > b then a - b else b - a`,`${f} (${x}, ${y})`];},
 R=>{const f=nf(R),k=R.ent(2,3),s=R.choix([10,12,15]),n=R.ent(2,9);return [`${sig(f,"int -> int")} function n ->\n  let m = n * ${k} in\n  if m > ${s} then m - ${s} else m + 1`,`${f} ${n}`];},
 R=>{const f=nf(R),d=R.choix([10,10,3,4,7]),n=R.ent(11,99);return [`${sig(f,"int -> int * int")}\n  function n -> (n / ${d}, n mod ${d})`,`${f} ${n}`];},
 R=>{const f=nf(R),k=R.ent(5,15),op=R.choix(["&&","||"]),n=R.ent(2,20);return [`${sig(f,"int -> bool")} function n ->\n  n mod 2 = 0 ${op} n > ${k}`,`${f} ${n}`];},
 R=>{const f=nf(R),k=R.ent(1,4),m=R.choix(["ab","oc","to","li"]),n=R.ent(0,6);return [`${sig(f,"string -> int -> string")}\n  fun s n ->\n  if n > ${k} then s ^ s else s ^ "!"`,`${f} "${m}" ${n}`];},
 R=>{const f=nf(R),L=[R.ent(1,9),R.ent(1,9),R.ent(1,9)],op=R.choix(["+","*","-"]);return [`${sig(f,"int list -> int")} function li ->\n  List.hd li ${op} List.hd (List.tl li)`,`${f} ${lst(L)}`];},
 R=>{const f=nf(R),L=R.mel([1,2,3,4,5,6,7,8,9]).slice(0,R.ent(3,4));return R.choix([[`${sig(f,"int list -> int list")}\n  function li ->\n  List.hd li :: List.tl (List.tl li)`,`${f} ${lst(L)}`],[`${sig(f,"int list -> int list")}\n  function li ->\n  List.hd (List.tl li) :: List.hd li\n  :: List.tl (List.tl li)`,`${f} ${lst(L)}`]]);},
 R=>{const f=nf(R),a=R.ent(1,5),b=R.ent(1,5);return [`${sig(f,"int -> int -> int")} fun a b ->\n  let c = a + b in\n  c * c - a`,`${f} ${a} ${b}`];},
 R=>{const f=nf(R),a=R.ent(2,9),b=R.ent(2,5);return [`${sig(f,"int * int -> int * int")}\n  function (a, b) ->\n  ${R.choix(["(a + b, a * b)","(b, a - b)","(a / b, a mod b)","(a * a, b + 1)"])}`,`${f} (${a}, ${b})`];},
 R=>{const f=nf(R),n=R.ent(3,20);return [`${sig(f,"int -> string")} function n ->\n  if n mod 3 = 0 then "a"\n  else if n mod 3 = 1 then "b"\n  else "c"`,`${f} ${n}`];},
 R=>{const f=nf(R),a=R.ent(2,15),b=R.ent(2,9);return [`${sig(f,"int -> int -> int")} fun a b ->\n  if a < b then b - a\n  else if a = b then 0\n  else a mod b`,`${f} ${a} ${b}`];},
 R=>{const f=nf(R),a=R.ent(1,30),b=R.ent(1,30);return [`${sig(f,"int -> int -> bool")} fun a b ->\n  a mod 2 = b mod 2`,`${f} ${a} ${b}`];},
 R=>{const f=nf(R),n=R.ent(1,9);return [`${sig(f,"int -> float")} function n ->\n  float_of_int n /. 2.`,`${f} ${n}`];}];
const chiffres=(R,k)=>{let s="";for(let i=0;i<k;i++)s+=R.ent(i?0:1,9);return +s;};
const RECENT=[
 R=>{const f=nf(R);return [`let rec ${f} : int -> int = function n ->\n  if n < 10 then n\n  else n mod 10 + ${f} (n / 10)`,`${f} ${chiffres(R,R.ent(3,4))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int -> int = function n ->\n  if n < 10 then 1\n  else 1 + ${f} (n / 10)`,`${f} ${chiffres(R,R.ent(3,5))}`];},
 R=>{const f=nf(R),k=R.ent(1,3),n=+[...Array(R.ent(3,4))].map(()=>R()<0.75?k:R.ent(1,9)).join("");return [`let rec ${f} : int -> bool = function n ->\n  if n < 10 then n = ${k}\n  else n mod 10 = ${k} && ${f} (n / 10)`,`${f} ${n}`];},
 R=>{const f=nf(R),n=R.choix([12,18,20,24,30,36]),i=R.ent(3,6);return [`let rec ${f} : int -> int -> int =\n  fun n i ->\n  if i = 0 then 1\n  else if n mod i = 0\n  then i * ${f} n (i - 1)\n  else ${f} n (i - 1)`,`${f} ${n} ${i}`];},
 R=>{const f=nf(R),n=R.choix([12,15,16,18,20,24,28,30]),i=R.ent(4,7);return [`let rec ${f} : int -> int -> int =\n  fun n i ->\n  if i = 0 then 0\n  else if n mod i = 0\n  then 1 + ${f} n (i - 1)\n  else ${f} n (i - 1)`,`${f} ${n} ${i}`];},
 R=>{const f=nf(R),n=R.choix([12,15,16,18,20,24,28,30]),i=R.ent(4,7);return [`let rec ${f} : int -> int -> int =\n  fun n i ->\n  if i = 0 then 0\n  else if n mod i = 0\n  then i + ${f} n (i - 1)\n  else ${f} n (i - 1)`,`${f} ${n} ${i}`];},
 R=>{const f=nf(R),x=R.ent(2,3),n=R.ent(3,5);return [`let rec ${f} : int -> int -> int =\n  fun x n ->\n  if n = 0 then 1\n  else x * ${f} x (n - 1)`,`${f} ${x} ${n}`];},
 R=>{const f=nf(R),k=R.ent(2,3),n=R.ent(5,11);return [`let rec ${f} : int -> int = function n ->\n  if n <= 0 then 0\n  else n + ${f} (n - ${k})`,`${f} ${n}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int -> int = function n ->\n  if n = 0 then 0\n  else (if n mod 2 = 0 then 1 else 0)\n    + ${f} (n / 10)`,`${f} ${chiffres(R,R.ent(3,4))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int -> int = function n ->\n  if n < 10 then n\n  else max (n mod 10) (${f} (n / 10))`,`${f} ${chiffres(R,R.ent(3,4))}`];},
 R=>{const f=nf(R),n=R.ent(4,8);return [`let rec ${f} : int -> int = function n ->\n  if n <= 1 then 1\n  else n * ${f} (n - 2)`,`${f} ${n}`];},
 R=>{const f=nf(R),n=R.choix([12,20,24,28,40,48,56,80,96]);return [`let rec ${f} : int -> int = function n ->\n  if n mod 2 <> 0 then 0\n  else 1 + ${f} (n / 2)`,`${f} ${n}`];},
 R=>{const f=nf(R),k=R.ent(2,3),n=R.ent(5,9);return [`let rec ${f} : int -> int = function n ->\n  if n < ${k} then n\n  else ${f} (n - ${k}) + 1`,`${f} ${n}`];}];
const petiteListe=(R,a,b,n1,n2)=>[...Array(R.ent(n1||3,n2||4))].map(()=>R.ent(a,b));
const RECLI=[
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int = function li ->\n  if li = [] then 0\n  else List.hd li + ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int = function li ->\n  if li = [] then 0\n  else 1 + ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9,2,5))}`];},
 R=>{const f=nf(R),k=R.ent(1,3);return [`let rec ${f} : int list -> int list =\n  function li ->\n  if li = [] then []\n  else (List.hd li + ${k})\n    :: ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9))}`];},
 R=>{const f=nc(R);return [`let rec ${f} : int list -> int list =\n  function li ->\n  if li = [] then []\n  else if List.hd li mod 2 = 0\n  then List.hd li :: ${f} (List.tl li)\n  else ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9,4,5))}`];},
 R=>{const f=nc(R);return [`let rec ${f} : int list -> int list =\n  function li ->\n  if li = [] then []\n  else if List.hd li mod 2 = 0\n  then ${f} (List.tl li)\n  else List.hd li :: ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9,4,5))}`];},
 R=>{const f=nf(R),x=R.ent(1,3),L=[...Array(R.ent(4,5))].map(()=>R()<0.4?x:R.ent(1,4));return [`let rec ${f} : int -> int list -> int =\n  fun x li ->\n  if li = [] then 0\n  else if List.hd li = x\n  then 1 + ${f} x (List.tl li)\n  else ${f} x (List.tl li)`,`${f} ${x} ${lst(L)}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int -> int list =\n  fun li n ->\n  if li = [] || n = 0 then []\n  else List.hd li\n    :: ${f} (List.tl li) (n - 1)`,`${f} ${lst(petiteListe(R,1,9,3,5))} ${R.ent(1,4)}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int = function li ->\n  if List.tl li = [] then List.hd li\n  else max (List.hd li)\n    (${f} (List.tl li))`,`${f} ${lst(petiteListe(R,1,9))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int = function li ->\n  if List.tl li = [] then List.hd li\n  else ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9))}`];},
 R=>{const f=nf(R),L=petiteListe(R,1,9),x=R()<0.5?R.choix(L):R.ent(1,9);return [`let rec ${f} : int -> int list -> bool =\n  fun x li ->\n  if li = [] then false\n  else List.hd li = x\n    || ${f} x (List.tl li)`,`${f} ${x} ${lst(L)}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int = function li ->\n  if li = [] then 1\n  else List.hd li * ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,5))}`];},
 R=>{const f=nf(R),k=R.ent(3,6);return [`let rec ${f} : int list -> int = function li ->\n  if li = [] then 0\n  else if List.hd li > ${k}\n  then 1 + ${f} (List.tl li)\n  else ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9,4,5))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> bool = function li ->\n  if li = [] then true\n  else List.hd li > 0\n    && ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,R()<0.5?-2:1,9))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int = function li ->\n  if li = [] then 0\n  else List.hd li - ${f} (List.tl li)`,`${f} ${lst(petiteListe(R,1,9))}`];}];
const MATCHACC=[
 R=>{const f=nf(R),k=R.ent(2,5),e=R.choix([` x + ${f} r`,` x * x + ${f} r`,`\n    if x > ${k} then x + ${f} r\n    else ${f} r`]);return [`let rec ${f} : int list -> int = function\n  | [] -> 0\n  | x :: r ->${e}`,`${f} ${lst(petiteListe(R,1,9))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int = function\n  | [] -> 0\n  | [x] -> x\n  | x :: y :: r -> x - y + ${f} r`,`${f} ${lst(petiteListe(R,1,9,3,5))}`];},
 R=>{const f=nf(R),k=R.ent(0,4);return [`let rec ${f} : int list -> int list =\n  function\n  | [] -> []\n  | x :: r ->\n    if x > ${k} then x :: ${f} r\n    else ${f} r`,`${f} ${lst(petiteListe(R,0,8,4,5))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int -> int list -> int =\n  fun acc li ->\n  match li with\n  | [] -> acc\n  | x :: r -> ${f} (acc + x) r`,`${f} ${R.ent(0,3)} ${lst(petiteListe(R,1,9))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int list -> int list =\n  fun acc li ->\n  match li with\n  | [] -> acc\n  | x :: r -> ${f} (x :: acc) r`,`${f} [] ${lst(petiteListe(R,1,9))}`];},
 R=>{const f=nf(R);let n;do n=chiffres(R,3);while(String(n)===[...String(n)].reverse().join(""));return [`let rec ${f} : int -> int -> int =\n  fun acc n ->\n  if n = 0 then acc\n  else ${f}\n    (acc * 10 + n mod 10) (n / 10)`,`${f} 0 ${n}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int -> int = function\n  | 0 -> 0\n  | n -> n mod 10 + ${f} (n / 10)`,`${f} ${chiffres(R,R.ent(3,4))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int list =\n  function\n  | [] -> []\n  | [x] -> [x]\n  | x :: y :: r -> x :: ${f} r`,`${f} ${lst(petiteListe(R,1,9,4,5))}`];},
 R=>{const f=nc(R);return [`let rec ${f} : int -> int list -> int =\n  fun acc li ->\n  match li with\n  | [] -> acc\n  | x :: r ->\n    if x mod 2 = 0 then ${f} (acc + 1) r\n    else ${f} acc r`,`${f} 0 ${lst(petiteListe(R,1,9,4,5))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int -> int list -> int =\n  fun m li ->\n  match li with\n  | [] -> m\n  | x :: r -> ${f} (max m x) r`,`${f} 0 ${lst(petiteListe(R,1,9,3,5))}`];},
 R=>{const f=nf(R);return [`let rec ${f} : int list -> int list =\n  function\n  | [] -> []\n  | x :: r -> (2 * x) :: ${f} r`,`${f} ${lst(petiteListe(R,1,9))}`];}];
const ITER=[
 R=>{const f=nf(R),k=R.ent(2,4),fn=R.choix([`fun x -> x * ${k} + 1`,`fun x -> x * x`,`fun x -> x mod ${k}`,`fun x -> x - ${k}`]),L=petiteListe(R,1,9);return [`${sig(f,"int list -> int list")}\n  function li ->\n  List.map (${fn}) li`,`${f} ${lst(L)}`,{k:"map",fn,L:JSON.stringify(L)}];},
 R=>{const f=nf(R),k=R.ent(2,4),fn=R.choix([`fun x -> x > ${k}`,`fun x -> x mod ${k} = 0`]),L=petiteListe(R,1,9);return [`${sig(f,"int list -> bool list")}\n  function li ->\n  List.map (${fn}) li`,`${f} ${lst(L)}`,{k:"map",fn,L:JSON.stringify(L)}];},
 R=>{const f=nf(R),k=R.ent(2,5),[fn,p]=R.choix([[`fun x -> x mod ${k} = 0`,x=>x%k===0],[`fun x -> x > ${k}`,x=>x>k],[`fun x -> x mod 2 = 1`,x=>x%2===1],[`fun x -> x <> ${k}`,x=>x!==k]]),L=petiteListe(R,1,9,4,5);if(L.every(p)||!L.some(p))return null;return [`${sig(f,"int list -> int list")}\n  function li ->\n  List.filter (${fn}) li`,`${f} ${lst(L)}`,{k:"filter",fn,L:JSON.stringify(L)}];},
 R=>{const f=nf(R),[fn,init]=R.choix([["fun acc x -> acc + x * x","0"],["fun acc x -> acc * x","1"],["fun m x -> if x > m then x else m","0"],["fun acc x -> acc * 10 + x","0"],["fun acc x -> acc - x",String(R.ent(10,20))],["fun a x -> a + 2 * x","0"]]),L=petiteListe(R,1,fn.includes("* 10")?9:5,3,4);
   return [`${sig(f,"int list -> int")} function li ->\n  List.fold_left\n    (${fn})\n    ${init} li`,`${f} ${lst(L)}`,{k:"fold_left",fn,init,L:JSON.stringify(L)}];},
 R=>{const f=nf(R),L=petiteListe(R,1,9,2,4);return [`${sig(f,"int list -> int list")}\n  function li ->\n  List.fold_left\n    (fun acc x -> x :: acc) [] li`,`${f} ${lst(L)}`,{k:"fold_left",fn:"fun acc x -> x :: acc",init:"[]",L:JSON.stringify(L)}];},
 R=>{const f=nf(R),[fn,init,t]=R.choix([["fun x acc -> x :: x :: acc","[]","int list -> int list"],["fun x acc -> x - acc","0","int list -> int"],["fun x acc -> x + 2 * acc","0","int list -> int"],["fun x acc -> acc @ [x]","[]","int list -> int list"]]),L=petiteListe(R,1,5,2,3);
   return [`${sig(f,t)}\n  function li ->\n  List.fold_right\n    (${fn}) li ${init}`,`${f} ${lst(L)}`,{k:"fold_right",fn,init,L:JSON.stringify(L)}];},
 R=>{const f=nf(R),k=R.ent(2,5),L=petiteListe(R,1,9,4,5);return R.choix([[`${sig(f,"int list -> int")} function li ->\n  List.length\n    (List.filter (fun x -> x > ${k}) li)`,`${f} ${lst(L)}`],[`${sig(f,"int list -> int")} function li ->\n  List.fold_left (+) 0\n    (List.map (fun x -> x * ${k}) li)`,`${f} ${lst(L.slice(0,3))}`]]);}];

/* ---------- PF3 : compléter la ligne effacée ---------- */
const ROLE={base:["le cas de base","la valeur pour la plus petite entrée, sans appel récursif"],rec:["le cas général","il combine un morceau de l'entrée avec l'appel récursif sur une entrée plus petite"],
  branche:["une branche du match","ce que vaut la fonction quand l'entrée a cette forme"],fn:["la fonction donnée à l'itérateur","ce qu'il faut faire avec chaque élément"]};
/* une ligne fausse et plausible : un nombre changé, un opérateur échangé, l'appel récursif qui ne raccourcit plus l'entrée */
function mutations(l){const M=[];const m=/\d+/.exec(l);if(m)M.push(l.slice(0,m.index)+(+m[0]+1)+l.slice(m.index+m[0].length));
  [[" + "," * "],[" * "," + "],[" && "," || "],[" || "," && "],["(List.tl li)","li"],["(n / 10)","n"],["(i - 1)","i"],[" :: "," @ "],["[]","[0]"],[" r"," (x :: r)"],[" acc + 1"," acc"],[" < "," <= "],[" = "," <> "],["true","false"],["false","true"]]
    .forEach(([a,b])=>{if(l.includes(a))M.push(l.replace(a,b));});return M;}
function exoLigne(F,i,o){o=o||{};const L=F.L.slice(),bonne=L[i].trim(),ind=/^\s*/.exec(L[i])[0],def=L.join("\n");
  const S=ML.session(),R=S.lis(def);if(R.some(x=>x.faute))throw new Error("définition fausse : "+def);
  const essais=[...new Set(F.args)].map(a=>F.nom+" "+a),att=essais.map(x=>{const r=S.lis(x)[0];if(r.faute||r.exc)throw new Error("essai impossible : "+x);return r.ecrit;});
  if(att.some(v=>v.length>40))return null;
  const avec=ligne=>{const L2=L.slice();L2[i]=ind+ligne;return L2.join("\n");};
  /* exécute la fonction avec la ligne donnée : rend {err} ou {k, obtenu} pour le premier essai faux, ou {ok:true} */
  function essaie(ligne){const S2=ML.session(),D=S2.lis(avec(ligne));const f=D.find(x=>x.faute);
    if(f)return {err:f.faute==="syntaxe"?"syntaxe":"type",msg:f.msg,extrait:f.extrait};
    for(let k=0;k<essais.length;k++){const r=S2.lis(essais[k])[0];const v=r.faute?(r.boucle||/s'arrête pas/.test(r.msg)?"boucle":"err"):r.exc?"exception "+r.ecritExc:r.ecrit;
      if(v!==att[k])return {k,obtenu:v};}
    return {ok:true};}
  const fausse=mutations(bonne).find(m=>!essaie(m).ok);if(!fausse)return null;
  const num=i+1,[role,sens]=ROLE[F.roles[i][0]],montre=L.map((l,j)=>j===i?ind+"(* ← ligne "+num+" effacée *)":l).join("\n");
  const ex=essais[F.ex||Math.min(2,essais.length-1)],vEx=att[essais.indexOf(ex)];
  const E=[{w:`La ligne ${num} est ${role} : ${sens}.`,why:F.roles[i][2]||"On cherche d'abord à quoi sert la ligne : sa place dans la fonction le dit.",pts:1},
    {w:`La ligne : <b>${c(bonne)}</b>`,why:F.roles[i][1],pts:2},
    {w:`Vérification, avec la ligne remise : ${essais.slice(0,5).map((x,k)=>c(x+" = "+att[k])).join(", ")}.`,why:`Ce sont les valeurs attendues : ${F.dit}.`,pts:0.5}];
  function juge(rep){const t=normalise(rep.l||"").trim();if(!t)return {incomplet:`Écris la ligne ${num}, sans les espaces du début.`};
    if(/^let\b/.test(t)&&!/^let\b/.test(bonne))return {incomplet:`Écris seulement la ligne ${num}, pas toute la fonction.`};
    if(/^\|/.test(bonne)&&!/^\|/.test(t))return {incomplet:"Une branche de match commence par une barre « | »."};
    const r=essaie(t),faux=(type,titre,msg)=>({ok:false,faux:["l"],resume:"Pas tout à fait : avec cette ligne, la fonction ne fait pas ce qu'on attend.",diag:{etape:1,type,titre,msg}});
    if(r.ok)return {ok:true};
    if(r.err==="syntaxe")return faux("ligne mal écrite (syntaxe)","Où ça part : OCaml ne peut pas lire la fonction.",`Avec ta ligne, OCaml ne comprend plus la fonction. ${esc(r.msg)}`);
    if(r.err)return faux("erreur de type dans la ligne écrite","Où ça part : une erreur de type.",`${r.extrait?`À cet endroit, ${c(r.extrait)} : `:""}${esc(r.msg)}`);
    const x=essais[r.k],v=r.obtenu;
    if(v==="boucle")return faux("appel récursif qui ne raccourcit pas l'entrée","Où ça part : la fonction ne s'arrête pas.",`Sur ${c(x)}, le calcul ne s'arrête pas : l'appel récursif doit se faire sur une entrée plus petite, pour finir par arriver au cas de base.`);
    if(/^exception/.test(v))return faux("exception levée par la ligne écrite","Où ça part : une exception.",`Sur ${c(x)}, ta version lève ${c(v.slice(10))}.${/Division_by_zero/.test(v)?" Une division ou un mod par 0 n'a pas de sens : regarde quand le paramètre arrive à 0.":/"(hd|tl)"/.test(v)?` ${c("List.hd")} et ${c("List.tl")} n'ont pas de sens sur la liste vide : le test du cas de base doit passer avant.`:""}`);
    return faux({base:"valeur du cas de base",fn:"fonction donnée à l'itérateur",init:"valeur de départ de l'accumulateur",acc:"pas de l'accumulateur",branche:"branche d'un match"}[F.roles[i][0]]||"cas général d'une fonction récursive","Où ça part : une valeur fausse.",`Sur ${c(x)}, ta version renvoie ${c(v)} au lieu de ${c(att[r.k])}.`);}
  return {sig:"L"+def.replace(/\s+/g," ")+"|"+i,code:def,
    q:`Cette fonction doit renvoyer ${F.dit}. Par exemple, ${c(ex)} vaut ${c(vEx)}. La ligne ${num} a été effacée : écris-la.`,
    corps:bloc(montre),texte:finLigne(montre)+" — ligne "+num+" à écrire",
    champs:[{k:"champ",id:"l",nom:"ligne",label:`La ligne ${num} :`,ex:"sans les espaces du début",apercu:false,sym:o.sym?symDe(SYMV.concat(SYML),o.sym):SYML}],juge,etapes:E,
    bonne:c(bonne),bonneTxt:bonne,repBonne:{l:bonne},repFausse:{l:fausse},nature:F.roles[i][0],
    ens:{code:def,ligne:i,essais,att,ocaml:essais.map((x,k)=>({code:def.replace(/\n(let )/,"\n;;\n$1")+" in "+x,attendu:"T:"+S.lis(x)[0].type+"|V:"+att[k]}))}};}
const SYML=[["::"," :: "],["->"," -> "],["|","| "],["List.hd","List.hd "],["List.tl","List.tl "],["mod"," mod "],["fun","fun "],["[]","[]"],["&&"," && "],["||"," || "]];
/* une fonction écrite comme dans le cours, avec le rôle de chaque ligne à effacer : [rôle, la ligne expliquée, pourquoi ce rôle] */
const entiers=(R,n)=>[0,7,R.ent(10,99),R.ent(100,999),R.ent(1000,9999),R.ent(100,999)].slice(0,n||6);
const listes=(R,a,b)=>["[]",lst([R.ent(a,b)]),lst(petiteListe(R,a,b,3,4)),lst(petiteListe(R,a,b,2,5)),lst(petiteListe(R,a,b,4,5))];
const FL={
 somElem:R=>({nom:"somElem",dit:"la somme des éléments de la liste",L:["let rec somElem : int list -> int =","  function li ->","  if li = [] then 0","  else List.hd li + somElem (List.tl li)"],
   roles:{2:["base","La somme d'une liste vide vaut 0 : 0 ne change pas une somme."],3:["rec","La somme, c'est le premier élément plus la somme des autres. L'appel récursif se fait sur la queue, List.tl li, qui est plus courte."]},args:listes(R,1,9)}),
 longueur:R=>({nom:"longueur",dit:"le nombre d'éléments de la liste",L:["let rec longueur : int list -> int =","  function li ->","  if li = [] then 0","  else 1 + longueur (List.tl li)"],
   roles:{2:["base","La liste vide n'a aucun élément."],3:["rec","Un élément de plus que la queue : on compte 1 pour la tête, sans regarder sa valeur."]},args:listes(R,1,9)}),
 ajout:R=>{const k=R.ent(1,3);return {nom:"ajout"+k,dit:`la liste où ${k} est ajouté à chaque élément`,L:[`let rec ajout${k} : int list -> int list =`,"  function li ->","  if li = [] then []",`  else (List.hd li + ${k})`,`    :: ajout${k} (List.tl li)`],
   roles:{2:["base","Rien à transformer : la liste vide donne la liste vide."]},args:listes(R,1,9)};},
 liPairs:R=>({nom:"pairs",dit:"la liste des éléments pairs, dans le même ordre",L:["let rec pairs : int list -> int list =","  function li ->","  if li = [] then []","  else if List.hd li mod 2 = 0","  then List.hd li :: pairs (List.tl li)","  else pairs (List.tl li)"],
   roles:{2:["base","Aucun élément pair dans la liste vide."],4:["rec","La tête est paire : on la garde devant le résultat de l'appel sur la queue."],5:["rec","La tête est impaire : on ne la garde pas, on continue avec la queue."]},args:listes(R,1,9)}),
 nbOcc:R=>{const x=R.ent(1,3);return {nom:"nbOcc",dit:"le nombre de fois où x apparaît dans la liste",L:["let rec nbOcc : int -> int list -> int =","  fun x li ->","  if li = [] then 0","  else if List.hd li = x","  then 1 + nbOcc x (List.tl li)","  else nbOcc x (List.tl li)"],
   roles:{2:["base","x n'apparaît jamais dans la liste vide."],4:["rec","La tête vaut x : on compte 1, plus les apparitions dans la queue."],5:["rec","La tête ne vaut pas x : on ne compte rien pour elle."]},args:["[]",lst([x]),lst([x,2,x]),lst(petiteListe(R,1,3,4,5)),lst(petiteListe(R,1,3,3,5))].map(l=>x+" "+l)};},
 maxListe:R=>({nom:"maxListe",dit:"le plus grand élément d'une liste non vide",L:["let rec maxListe : int list -> int =","  function li ->","  if List.tl li = [] then List.hd li","  else max (List.hd li)","    (maxListe (List.tl li))"],
   roles:{2:["base","Une liste à un seul élément : c'est lui le plus grand. On teste List.tl li = [] car la fonction n'est pas définie sur la liste vide."]},args:listes(R,1,9).slice(1)}),
 appartient:R=>{const x=R.ent(1,5);return {nom:"appartient",dit:"true si x est dans la liste, false sinon",L:["let rec appartient :","  int -> int list -> bool =","  fun x li ->","  if li = [] then false","  else List.hd li = x","    || appartient x (List.tl li)"],
   roles:{3:["base","La liste vide ne contient rien."],4:["rec","x est dans la liste s'il est la tête, ou s'il est dans la queue : c'est un « ou »."]},args:["[]",lst([x]),lst([x+1,x]),lst(petiteListe(R,1,9,3,4)),lst([1,2,3].map(y=>y+x))].map(l=>x+" "+l)};},
 produit:R=>({nom:"produit",dit:"le produit des éléments de la liste",L:["let rec produit : int list -> int =","  function li ->","  if li = [] then 1","  else List.hd li * produit (List.tl li)"],
   roles:{2:["base","Le produit d'une liste vide vaut 1 : 1 ne change pas un produit (avec 0, tout le produit vaudrait 0)."],3:["rec","Le premier élément fois le produit des autres."]},args:listes(R,1,5)}),
 sommeChiffres:R=>({nom:"sommeChiffres",dit:"la somme des chiffres de n (n ≥ 0)",L:["let rec sommeChiffres : int -> int =","  function n ->","  if n < 10 then n","  else n mod 10 + sommeChiffres (n / 10)"],
   roles:{2:["base","Un nombre d'un seul chiffre : la somme de ses chiffres, c'est lui."],3:["rec","n mod 10 est le dernier chiffre ; n / 10 enlève ce dernier chiffre. On ajoute le dernier chiffre à la somme des autres."]},args:entiers(R)}),
 nbChiffres:R=>({nom:"nbChiffres",dit:"le nombre de chiffres de n (n ≥ 0)",L:["let rec nbChiffres : int -> int =","  function n ->","  if n < 10 then 1","  else 1 + nbChiffres (n / 10)"],
   roles:{2:["base","Un nombre plus petit que 10 s'écrit avec un seul chiffre (0 aussi)."],3:["rec","On compte le dernier chiffre, puis les chiffres de n / 10."]},args:entiers(R)}),
 queDesK:R=>{const k=R.ent(1,3);return {nom:"queDes"+["","Un","Deux","Trois"][k],dit:`true si tous les chiffres de n valent ${k}`,L:[`let rec queDes${["","Un","Deux","Trois"][k]} : int -> bool =`,"  function n ->",`  if n < 10 then n = ${k}`,`  else n mod 10 = ${k}`,`    && queDes${["","Un","Deux","Trois"][k]} (n / 10)`],
   roles:{2:["base",`Un seul chiffre : le test, c'est « ce chiffre vaut ${k} ».`]},args:[String(k),String(k+1),String(k*11),String(k*111),String(k*100+k*10+5),String(k*1000+k*100+k*10+k)]};},
 prodDiv:R=>({nom:"prodDiv",dit:"le produit des diviseurs de n inférieurs ou égaux à i",L:["let rec prodDiv : int -> int -> int =","  fun n i ->","  if i = 0 then 1","  else if n mod i = 0","  then i * prodDiv n (i - 1)","  else prodDiv n (i - 1)"],
   roles:{2:["base","Plus aucun candidat : le produit vide vaut 1."],4:["rec","i divise n : on le multiplie avec le produit des diviseurs plus petits."],5:["rec","i ne divise pas n : on passe au candidat suivant, i - 1, sans rien multiplier."]},args:["12 0","12 1","12 4","20 5","18 6","30 5"]}),
 nbDiv:R=>({nom:"nbDiv",dit:"le nombre de diviseurs de n inférieurs ou égaux à i",L:["let rec nbDiv : int -> int -> int =","  fun n i ->","  if i = 0 then 0","  else if n mod i = 0","  then 1 + nbDiv n (i - 1)","  else nbDiv n (i - 1)"],
   roles:{2:["base","Plus aucun candidat : on n'a rien compté."],4:["rec","i divise n : on le compte, puis on regarde i - 1."],5:["rec","i ne divise pas n : on ne compte rien pour lui."]},args:["12 0","12 1","12 6","20 10","18 9","7 7"]}),
 nbSup:R=>{const k=R.ent(2,7);return {nom:"nbSup"+k,dit:`le nombre d'éléments plus grands que ${k}`,L:[`let rec nbSup${k} : int list -> int =`,"  function li ->","  if li = [] then 0",`  else if List.hd li > ${k}`,`  then 1 + nbSup${k} (List.tl li)`,`  else nbSup${k} (List.tl li)`],
   roles:{2:["base","Aucun élément dans la liste vide, donc aucun plus grand que "+k+"."],4:["rec",`La tête est plus grande que ${k} : on la compte, puis on continue sur la queue.`],5:["rec","La tête ne compte pas : on continue sur la queue sans rien ajouter."]},args:listes(R,1,9)};},
 somme:R=>({nom:"somme",dit:"1 + 2 + … + n (n ≥ 0)",L:["let rec somme : int -> int =","  function n ->","  if n = 0 then 0","  else n + somme (n - 1)"],roles:{2:["base","La somme jusqu'à 0 vaut 0."],3:["rec","La somme jusqu'à n, c'est n plus la somme jusqu'à n − 1."]},args:["0","1","4","6","10"]}),
 fact:R=>({nom:"fact",dit:"la factorielle de n : 1 × 2 × … × n (n ≥ 0)",L:["let rec fact : int -> int =","  function n ->","  if n = 0 then 1","  else n * fact (n - 1)"],roles:{2:["base","Par convention, la factorielle de 0 vaut 1 (le produit vide)."],3:["rec","n! = n × (n − 1)!"]},args:["0","1","3","5","6"]}),
 compte:R=>{const k=R.ent(1,9);return {nom:"compte"+k,dit:`le nombre de chiffres de n égaux à ${k} (n ≥ 0)`,L:[`let rec compte${k} : int -> int =`,"  function n ->","  if n = 0 then 0",`  else if n mod 10 = ${k}`,`  then 1 + compte${k} (n / 10)`,`  else compte${k} (n / 10)`],
   roles:{2:["base","0 n'a plus de chiffre à regarder."],4:["rec",`Le dernier chiffre vaut ${k} : on le compte, puis on regarde n / 10.`],5:["rec",`Le dernier chiffre ne vaut pas ${k} : on regarde les autres, sans compter.`]},args:["0",String(k),String(k*11),String(k*100+3),String(R.ent(1000,9999)),String(k*1000+R.ent(10,99)*10+k)]};},
 sommeDiv:R=>({nom:"sommeDiv",dit:"la somme des diviseurs de n inférieurs ou égaux à i",L:["let rec sommeDiv : int -> int -> int =","  fun n i ->","  if i = 0 then 0","  else if n mod i = 0","  then i + sommeDiv n (i - 1)","  else sommeDiv n (i - 1)"],
   roles:{2:["base","Plus de candidat : la somme vide vaut 0."],4:["rec","i divise n : on l'ajoute à la somme des diviseurs plus petits."],5:["rec","i ne divise pas n : on passe à i − 1 sans rien ajouter."]},args:["12 0","12 1","12 6","20 10","18 9","28 14"]}),
 puissance:R=>({nom:"puissance",dit:"x à la puissance n (n ≥ 0)",L:["let rec puissance : int -> int -> int =","  fun x n ->","  if n = 0 then 1","  else x * puissance x (n - 1)"],
   roles:{2:["base","x puissance 0 vaut 1."],3:["rec","x puissance n, c'est x fois x puissance n − 1."]},args:["2 0","3 1","2 5","3 3","5 2"]})};
/* les mêmes fonctions, écrites avec match */
const FM={
 somElem:R=>({nom:"somElem",dit:"la somme des éléments de la liste",L:["let rec somElem : int list -> int =","  function","  | [] -> 0","  | x :: r -> x + somElem r"],roles:{2:["branche","La liste vide : la somme vaut 0."],3:["branche","Une tête x et une queue r : x plus la somme de r."]},args:listes(R,1,9)}),
 longueur:R=>({nom:"longueur",dit:"le nombre d'éléments de la liste",L:["let rec longueur : int list -> int =","  function","  | [] -> 0","  | _ :: r -> 1 + longueur r"],roles:{2:["branche","La liste vide n'a aucun élément."],3:["branche","Un élément (sa valeur ne sert pas, d'où _) plus ceux de r."]},args:listes(R,1,9)}),
 liPairs:R=>({nom:"liPairs",dit:"la liste des éléments pairs, dans le même ordre",L:["let rec liPairs : int list -> int list =","  function","  | [] -> []","  | x :: r ->","    if x mod 2 = 0 then x :: liPairs r","    else liPairs r"],roles:{2:["branche","Aucun élément pair dans la liste vide."],4:["rec","x est pair : on le garde devant le résultat sur r."]},args:listes(R,1,9)}),
 alterne:R=>({nom:"alterne",dit:"la somme des éléments de rang impair (le 1er, le 3e…)",L:["let rec alterne : int list -> int =","  function","  | [] -> 0","  | [x] -> x","  | x :: _ :: r -> x + alterne r"],roles:{2:["branche","La liste vide : rien à ajouter."],3:["branche","Un seul élément : il est de rang 1, on le garde."],4:["branche","Au moins deux éléments : on garde le premier, on saute le deuxième, et on recommence sur r."]},args:listes(R,1,9)}),
 dernier:R=>({nom:"dernier",dit:"le dernier élément d'une liste non vide",L:["let rec dernier : int list -> int =","  function","  | [x] -> x","  | _ :: r -> dernier r","  | [] -> failwith \"liste vide\""],roles:{2:["branche","Un seul élément : c'est le dernier."],3:["branche","Plus d'un élément : le dernier est dans r."]},args:listes(R,1,9).slice(1)}),
 doubler:R=>({nom:"doubler",dit:"la liste où chaque élément est multiplié par 2",L:["let rec doubler : int list -> int list =","  function","  | [] -> []","  | x :: r -> 2 * x :: doubler r"],roles:{2:["branche","La liste vide donne la liste vide."],3:["branche","On met 2 * x devant le résultat sur r."]},args:listes(R,1,9)}),
 sommeChiffres:R=>({nom:"somChif",dit:"la somme des chiffres de n (n ≥ 0)",L:["let rec somChif : int -> int =","  function","  | 0 -> 0","  | n -> n mod 10 + somChif (n / 10)"],roles:{2:["branche","0 n'a que des chiffres nuls."],3:["branche","Le dernier chiffre plus la somme des autres."]},args:entiers(R)}),
 nbSup:R=>{const k=R.ent(2,7);return {nom:"nbSup"+k,dit:`le nombre d'éléments plus grands que ${k}`,L:[`let rec nbSup${k} : int list -> int =`,"  function","  | [] -> 0","  | x :: r ->",`    if x > ${k} then 1 + nbSup${k} r`,`    else nbSup${k} r`],roles:{2:["branche","Aucun élément dans la liste vide."],4:["rec",`x est plus grand que ${k} : on le compte.`],5:["rec","x ne compte pas : on continue sur r."]},args:listes(R,1,9)};},
 plus:R=>{const k=R.ent(1,9);return {nom:"plus"+k,dit:`la liste où ${k} est ajouté à chaque élément`,L:[`let rec plus${k} : int list -> int list =`,"  function","  | [] -> []",`  | x :: r -> (x + ${k}) :: plus${k} r`],roles:{2:["branche","La liste vide donne la liste vide."],3:["branche",`On met x + ${k} devant le résultat sur r.`]},args:listes(R,1,9)};},
 produit:R=>({nom:"produit",dit:"le produit des éléments de la liste",L:["let rec produit : int list -> int =","  function","  | [] -> 1","  | x :: r -> x * produit r"],roles:{2:["branche","Le produit vide vaut 1."],3:["branche","x fois le produit des éléments de r."]},args:listes(R,1,5)}),
 estDans:R=>{const k=R.ent(1,9);return {nom:"estDans",dit:"true si x est dans la liste",L:["let rec estDans :","  int -> int list -> bool =","  fun x li ->","  match li with","  | [] -> false","  | y :: r -> y = x || estDans x r"],roles:{4:["branche","La liste vide ne contient rien."],5:["branche","x est la tête y, ou bien il est dans r."]},args:["[]",lst([k]),lst([k+1,k]),lst(petiteListe(R,1,9,3,4)),lst([1,2,3].map(y=>y+k))].map(l=>k+" "+l)};},
 somAcc:R=>({nom:"somAcc",dit:"acc plus la somme des éléments de la liste (on l'appelle avec acc = 0)",L:["let rec somAcc :","  int -> int list -> int =","  fun acc li ->","  match li with","  | [] -> acc","  | x :: r -> somAcc (acc + x) r"],roles:{4:["branche","Plus rien à ajouter : l'accumulateur contient déjà la somme."],5:["branche","On ajoute x à l'accumulateur, et on continue sur r."]},args:listes(R,1,9).map(l=>"0 "+l)}),
 miroir:R=>({nom:"miroir",dit:"la liste à l'envers, posée devant acc (on l'appelle avec acc = [])",L:["let rec miroir :","  int list -> int list -> int list =","  fun acc li ->","  match li with","  | [] -> acc","  | x :: r -> miroir (x :: acc) r"],roles:{4:["branche","Plus d'élément : acc contient la liste retournée."],5:["branche","On pose x devant acc : le premier élément finit au fond."]},args:listes(R,1,9).map(l=>"[] "+l)})};
/* avec un itérateur : la fonction donnée à fold ou map */
const FI={
 somme:R=>({nom:"somme",dit:"la somme des éléments de la liste",L:["let somme : int list -> int =","  function li ->","  List.fold_left","    (fun acc x -> acc + x)","    0 li"],roles:{3:["fn","À chaque élément x, le nouvel accumulateur est l'ancien plus x."]},args:listes(R,1,9)}),
 produit:R=>({nom:"produit",dit:"le produit des éléments de la liste",L:["let produit : int list -> int =","  function li ->","  List.fold_left","    (fun acc x -> acc * x)","    1 li"],roles:{3:["fn","À chaque élément, on multiplie l'accumulateur par x (il part de 1)."]},args:listes(R,1,5)}),
 nbPairs:R=>({nom:"nbPairs",dit:"le nombre d'éléments pairs de la liste",L:["let nbPairs : int list -> int =","  function li ->","  List.fold_left","    (fun acc x ->","      if x mod 2 = 0 then acc + 1","      else acc)","    0 li"],roles:{4:["fn","x est pair : on compte 1 de plus."],5:["fn","x est impair : l'accumulateur ne change pas."]},args:listes(R,1,9)}),
 longueur:R=>({nom:"longueur",dit:"le nombre d'éléments de la liste",L:["let longueur : int list -> int =","  function li ->","  List.fold_left","    (fun acc _ -> acc + 1)","    0 li"],roles:{3:["fn","Chaque élément compte pour 1, quelle que soit sa valeur."]},args:listes(R,1,9)}),
 maxi:R=>({nom:"maxi",dit:"le plus grand élément (les éléments sont positifs)",L:["let maxi : int list -> int =","  function li ->","  List.fold_left","    (fun m x -> if x > m then x else m)","    0 li"],roles:{3:["fn","On garde le plus grand de m et de x."]},args:listes(R,1,9)}),
 renverse:R=>({nom:"renverse",dit:"la liste à l'envers",L:["let renverse : int list -> int list =","  function li ->","  List.fold_left","    (fun acc x -> x :: acc)","    [] li"],roles:{3:["fn","Chaque élément est posé devant ceux déjà vus : le premier finit à la fin."]},args:listes(R,1,9)}),
 doubles:R=>({nom:"doubles",dit:"la liste où chaque élément est multiplié par 2",L:["let doubles : int list -> int list =","  function li ->","  List.map (fun x -> 2 * x) li"],roles:{2:["fn","List.map applique la fonction à chaque élément : ici, multiplier par 2."]},args:listes(R,1,9)}),
 garderPairs:R=>({nom:"garderPairs",dit:"les éléments pairs, dans le même ordre",L:["let garderPairs : int list -> int list =","  function li ->","  List.filter","    (fun x -> x mod 2 = 0) li"],roles:{3:["fn","List.filter garde les éléments pour lesquels la fonction rend true : ici, x pair."]},args:listes(R,1,9)}),
 somCarres:R=>({nom:"somCarres",dit:"la somme des carrés des éléments",L:["let somCarres : int list -> int =","  function li ->","  List.fold_left","    (fun acc x -> acc + x * x)","    0 li"],roles:{3:["fn","À chaque élément, on ajoute son carré x * x à l'accumulateur."]},args:listes(R,1,5)}),
 nbSup:R=>{const k=R.ent(2,7);return {nom:"nbSup"+k,dit:`le nombre d'éléments plus grands que ${k}`,L:[`let nbSup${k} : int list -> int =`,"  function li ->","  List.fold_left","    (fun acc x ->",`      if x > ${k} then acc + 1`,"      else acc)","    0 li"],roles:{4:["fn",`x est plus grand que ${k} : on compte 1 de plus.`],5:["fn","Sinon l'accumulateur ne change pas."]},args:listes(R,1,9)};},
 plus:R=>{const k=R.ent(1,9);return {nom:"plus"+k,dit:`la liste où ${k} est ajouté à chaque élément`,L:[`let plus${k} : int list -> int list =`,"  function li ->",`  List.map (fun x -> x + ${k}) li`],roles:{2:["fn",`List.map applique la fonction à chaque élément : ici, ajouter ${k}.`]},args:listes(R,1,9)};},
 sup:R=>{const k=R.ent(2,7);return {nom:"sup"+k,dit:`les éléments plus grands que ${k}, dans le même ordre`,L:[`let sup${k} : int list -> int list =`,"  function li ->","  List.filter",`    (fun x -> x > ${k}) li`],roles:{3:["fn",`List.filter garde les éléments pour lesquels la fonction rend true : ici, x > ${k}.`]},args:listes(R,1,9)};},
 multiples:R=>{const k=R.ent(2,5);return {nom:"multiples"+k,dit:`les multiples de ${k}, dans le même ordre`,L:[`let multiples${k} : int list -> int list =`,"  function li ->","  List.filter",`    (fun x -> x mod ${k} = 0) li`],roles:{3:["fn",`x est un multiple de ${k} quand le reste de sa division par ${k} vaut 0.`]},args:listes(R,1,12)};},
 copie:R=>({nom:"copie",dit:"la même liste, construite avec fold_right",L:["let copie : int list -> int list =","  function li ->","  List.fold_right","    (fun x acc -> x :: acc)","    li []"],roles:{3:["fn","fold_right part de la fin : chaque x est posé devant le reste, l'ordre est gardé."]},args:listes(R,1,9)})};
/* choisit une fonction et une ligne du rôle voulu */
function tireLigne(R,T,roles,sym){for(;;){const F=R.choix(Object.values(T))(R),I=Object.keys(F.roles).map(Number).filter(i=>roles.includes(F.roles[i][0]));if(!I.length)continue;
  const e=exoLigne(F,R.choix(I),{sym});if(e)return e;}}

/* ---------- PF4 : trouver la ligne fausse ---------- */
/* exécute une version de la fonction sur les essais : {err, msg, extrait} ou {k, obtenu} pour le premier essai faux, ou {ok:true} */
function essaieCode(code,essais,att){const S2=ML.session(),D=S2.lis(code);const f=D.find(x=>x.faute);
  if(f)return {err:f.faute==="syntaxe"?"syntaxe":"type",msg:f.msg,extrait:f.extrait};
  for(let k=0;k<essais.length;k++){const r=S2.lis(essais[k])[0];const v=r.faute?(r.boucle||/s'arrête pas/.test(r.msg)?"boucle":"err"):r.exc?"exception "+r.ecritExc:r.ecrit;
    if(v!==att[k])return {k,obtenu:v};}
  return {ok:true};}
const vraiDe=v=>/^exception /.test(v)?"EXC:"+v.slice(10).split(" ")[0]:null;
function mutationsType(l){const M=[];
  [["List.hd li + ","li + "],["List.hd li * ","li * "],["(List.tl li)","(List.hd li)"],[" then []"," then 0"],[" then 0"," then []"],[" then 1"," then []"],[" :: "," @ "],[" + "," +. "],[" * "," *. "],
   [" mod "," /. "],["li = []","li = 0"],["n = 0","n = []"],["(n / 10)","(n /. 10)"],[" acc + 1"," acc ^ 1"],["then false","then 0"],["x = "," x == 0. && x = "],["(fun x -> x > ","(fun x -> x ^ "],["(x + ","(x ^ "]]
    .forEach(([a,b])=>{if(l.includes(a))M.push(l.replace(a,b));});return M;}
function exoFausse(F,i,sorte,o){o=o||{};const L=F.L.slice(),bonne=L[i].trim(),ind=/^\s*/.exec(L[i])[0],def=L.join("\n");
  const S=ML.session();if(S.lis(def).some(x=>x.faute))throw new Error("définition fausse : "+def);
  const essais=[...new Set(F.args)].map(a=>F.nom+" "+a),att=essais.map(x=>{const r=S.lis(x)[0];if(r.faute||r.exc)throw new Error("essai impossible : "+x);return r.ecrit;});
  if(att.some(v=>v.length>40))return null;
  const avec=(j,l)=>{const L2=L.slice();L2[j]=/^\s/.test(l)?l:ind+l;return L2.join("\n");};
  const num=i+1,typeDe=x=>S.lis(x)[0].type,ocaml=essais.map((x,k)=>({code:def+" in "+x,attendu:"T:"+typeDe(x)+"|V:"+att[k]}));
  let E,montre,champs,juge,bonneTxt,repBonne,repFausse,q;
  const verif={w:`Vérification, avec ${sorte==="match"?"la branche ajoutée":"la ligne corrigée"} : ${essais.slice(0,5).map((x,k)=>c(x+" = "+att[k])).join(", ")}.`,why:`Ce sont les valeurs attendues : ${F.dit}.`,pts:0.5};
  const lisLigne=(t,r)=>{if(/^let\b/.test(t)&&!/^let\b/.test(bonne))return {incomplet:"Écris seulement la ligne, pas toute la fonction."};
    if(/^\|/.test(bonne)&&!/^\|/.test(t))return {incomplet:"Une branche de match commence par une barre « | »."};return null;};
  const raconte=(r,x)=>r.err==="syntaxe"?`OCaml ne peut plus lire la fonction. ${esc(r.msg)}`:r.err?`${r.extrait?`À cet endroit, ${c(r.extrait)} : `:""}${esc(r.msg)}`
    :r.obtenu==="boucle"?`Sur ${c(x)}, le calcul ne s'arrête pas : l'appel récursif ne se rapproche pas du cas de base.`
    :/^exception/.test(r.obtenu)?`Sur ${c(x)}, la fonction lève ${c(r.obtenu.slice(10).replace(/^Match_failure.*/,"Match_failure"))}.`:`Sur ${c(x)}, elle renvoie ${c(r.obtenu)} au lieu de ${c(att[r.k])}.`;
  if(sorte==="match"){
    if(!/^\|.*->\s*\S/.test(bonne))return null;
    const L2=L.filter((_,j)=>j!==i),code2=L2.join("\n"),r=essaieCode(code2,essais,att);if(r.ok||r.err)return null;
    const motif=/^\|\s*(.*?)\s*->/.exec(bonne)[1],places=L2.map((l,j)=>/^\s*\|/.test(l)||(j>0&&/^\s*\|/.test(L2[j-1]||"")&&j===L2.length)?j:-1).filter(j=>j>=0).concat([L2.length]);
    montre=code2;q=`Cette fonction doit renvoyer ${F.dit}. Un cas a été oublié dans son match : écris la branche qui manque.`;
    E=[{w:`Le cas ${c(motif)} n'a pas de branche.`,why:`${raconte(r,essais[r.k])} Un match doit prévoir toutes les formes possibles de la valeur : OCaml le signale d'ailleurs par un avertissement (« this pattern-matching is not exhaustive »).`,pts:1},
      {w:`La branche qui manque : <b>${c(bonne)}</b>`,why:F.roles[i][1],pts:2},verif];
    champs=[{k:"champ",id:"l",nom:"branche",label:"La branche qui manque :",ex:"elle commence par |",apercu:false,sym:symDe(SYML,["|","->","::","[]"])}];
    juge=rep=>{const t=normalise(rep.l||"").trim();if(!t)return {incomplet:"Écris la branche qui manque, en commençant par |."};const p=lisLigne(t);if(p)return p;
      let r2=null;for(const j of [...new Set(places.concat([i]))]){const L3=L2.slice();L3.splice(j,0,"  "+t);const x=essaieCode(L3.join("\n"),essais,att);if(x.ok)return {ok:true};if(j===i||!r2)r2=x;}
      return {ok:false,faux:["l"],resume:"Pas tout à fait : avec cette branche, la fonction ne fait pas ce qu'on attend.",diag:{etape:1,type:"branche de match oubliée",titre:"Où ça part : la branche ajoutée.",msg:raconte(r2,essais[r2.k])}};};
    bonneTxt=bonne;repBonne={l:bonne};const ff=["| _ -> 0","| _ -> []","| _ -> 1","| [] -> 1","| _ -> false","| _ -> true"].find(x=>juge({l:x}).ok===false);if(!ff)return null;repFausse={l:ff};
    const v=vraiDe(r.obtenu);if(v)ocaml.push({code:code2+" in "+essais[r.k],attendu:v});}
  else{
    const cand=(sorte==="type"?mutationsType(bonne):mutations(bonne)).map(m=>[m,essaieCode(avec(i,m),essais,att)]).filter(([m,r])=>(ind+m).length<=40&&(sorte==="type"?r.err==="type":!r.ok&&!r.err));
    if(!cand.length)return null;const [fausse,r]=o.R.choix(cand);
    montre=L.map((l,j)=>(j===i?ind+fausse:l)).map((l,j)=>(j+1)+" "+l).join("\n");
    q=`Cette fonction doit renvoyer ${F.dit}. Une de ses lignes est fausse${sorte==="type"?" : OCaml refuse la fonction":""}. Donne le numéro de la ligne fausse, puis écris-la corrigée.`;
    E=[{w:`La ligne fausse est la ligne ${num} : ${c(fausse)}`,why:sorte==="type"?`OCaml refuse la fonction et signale l'erreur ici : ${raconte(r)} L'endroit signalé n'est pas toujours la ligne fausse : OCaml lit la fonction dans l'ordre et s'arrête au premier désaccord. On cherche la ligne qui ne respecte pas la signature.`:raconte(r,essais[r.k]),pts:1},
      {w:`La ligne corrigée : <b>${c(bonne)}</b>`,why:F.roles[i][1],pts:2},verif];
    champs=[{k:"champ",id:"n",nom:"numéro",label:"Numéro de la ligne fausse :",ex:"un nombre",apercu:false},{k:"champ",id:"l",nom:"ligne corrigée",label:"La ligne corrigée :",ex:"sans le numéro",apercu:false,sym:o.sym?symDe(SYMV.concat(SYML),o.sym):SYML}];
    juge=rep=>{const n=String(rep.n||"").trim(),t=normalise(rep.l||"").trim().replace(/^\d+\s+/,"");if(!/^\d+$/.test(n))return {incomplet:"Écris le numéro de la ligne fausse : un nombre."};
      if(!t)return {incomplet:"Écris aussi la ligne corrigée."};const p=lisLigne(t);if(p)return p;
      const j=+n-1;if(j!==i)return {ok:false,faux:["n"],resume:"Pas tout à fait : ce n'est pas la bonne ligne.",diag:{etape:0,type:sorte==="type"?"ligne de l'erreur de type":"ligne de l'erreur de logique",titre:"Où ça part : la ligne fausse est ailleurs.",
        msg:j>=0&&j<L.length?`La ligne ${n} est juste. ${sorte==="type"?"Cherche l'opérateur ou la fonction qui reçoit une valeur du mauvais type.":"Essaie la fonction à la main sur un petit exemple, ligne par ligne."}`:`Il n'y a pas de ligne ${n} qui puisse être en cause.`}};
      const x=essaieCode(avec(i,t),essais,att);if(x.ok)return {ok:true};
      return {ok:false,faux:["l"],resume:"Pas tout à fait : c'est la bonne ligne, mais ta correction ne marche pas.",diag:{etape:1,type:sorte==="type"?"correction d'une erreur de type":"correction d'une erreur de logique",titre:"Où ça part : la correction.",msg:raconte(x,essais[x.k])}};};
    bonneTxt=`ligne ${num} : ${bonne}`;repBonne={n:String(num),l:bonne};repFausse={n:String(num),l:fausse};
    const w=avec(i,fausse);if(sorte==="type")ocaml.push({code:w+" in "+essais[0],attendu:"ERR"});
    else if(r.obtenu!=="boucle"){const v=vraiDe(r.obtenu);ocaml.push({code:w+" in "+essais[r.k],attendu:v||"T:"+typeDe(essais[r.k])+"|V:"+r.obtenu});}}
  return {sig:"F"+sorte+def.replace(/\s+/g," ")+"|"+i+"|"+(repFausse.l||""),code:def,q,corps:bloc(montre),texte:finLigne(montre)+" — "+(sorte==="match"?"branche oubliée":"ligne fausse"),
    champs,juge,etapes:E,bonne:c(bonneTxt),bonneTxt,repBonne,repFausse,nature:sorte,ens:{code:def,montre,essais,att,ocaml}};}
function tireFausse(R,T,sorte,sym){for(;;){const F=R.choix(Object.values(T))(R),I=Object.keys(F.roles).map(Number);if(!I.length)continue;
  const e=exoFausse(F,R.choix(I),sorte,{R,sym});if(e)return e;}}

/* ---------- PF5 : types somme, types récursifs, arbres ---------- */
const TY={nombre:"type nombre =\n  | Ent of int\n  | Rat of (int * int)",chaine:"type my_string =\n  | Empty\n  | Cons of char * my_string",ens:"type 'a set =\n  | Empty\n  | Add of 'a * 'a set",
  arbre:"type 'a tree =\n  | Empty\n  | Node of 'a * 'a tree * 'a tree",number:"type number =\n  | Int of int\n  | Float of float",couleur:"type couleur =\n  | Trefle | Carreau | Coeur | Pique"};
const CTOR={nombre:`${c("Ent")} contient un int ; ${c("Rat")} contient un couple d'int (numérateur, dénominateur), écrit entre parenthèses.`,
  chaine:`${c("Empty")} est la chaîne vide ; ${c("Cons (c, r)")} est le caractère c suivi de la chaîne r. Un caractère s'écrit entre apostrophes : ${c("'a'")}.`,
  ens:`${c("Empty")} est l'ensemble vide ; ${c("Add (x, e)")} est l'ensemble e auquel on ajoute x.`,
  arbre:`${c("Empty")} est l'arbre vide ; ${c("Node (x, g, d)")} est un nœud qui porte x, avec un sous-arbre gauche g et un sous-arbre droit d.`,
  number:`${c("Int")} contient un int ; ${c("Float")} contient un float, écrit avec un point.`};
const ch=s=>s.split("").reduceRight((r,x)=>`Cons ('${x}', ${r})`,"Empty");
const ensDe=L=>L.reduceRight((r,x)=>`Add (${x}, ${r})`,"Empty");
/* un petit arbre d'int : [x, gauche, droite] ou null */
const arbreML=a=>a?`Node (${a[0]}, ${arbreML(a[1])}, ${arbreML(a[2])})`:"Empty";
function arbreDessin(a){const lignes=[];if(!a)return "(arbre vide)";const pos=(a,p)=>a?[...pos(a[1],p*2),[a[0],p],...pos(a[2],p*2+1)]:[];
  const P=pos(a,1),prof=p=>Math.floor(Math.log2(p)),hmax=Math.max(...P.map(x=>prof(x[1])));const larg=4*2**hmax;
  for(let h=0;h<=hmax;h++){let l=" ".repeat(larg),b=" ".repeat(larg);
    P.filter(x=>prof(x[1])===h).forEach(([v,p])=>{const k=p-2**h,pas=larg/2**h,c0=Math.floor(pas*k+pas/2)-1;l=l.slice(0,c0)+String(v).padEnd(2)+l.slice(c0+2);
      if(h<hmax){const g=P.some(y=>y[1]===2*p),d=P.some(y=>y[1]===2*p+1);if(g)b=b.slice(0,c0-1)+"╱"+b.slice(c0);if(d)b=b.slice(0,c0+1)+"╲"+b.slice(c0+2);}});
    lignes.push(l.replace(/\s+$/,""));if(h<hmax)lignes.push(b.replace(/\s+$/,""));}
  return lignes.join("\n");}
const tireArbre=(R,n)=>{const V=R.mel([1,2,3,4,5,6,7,8,9]);let a=null,k=0;const ins=(t,x,p)=>!t?[x,null,null]:p()?[t[0],ins(t[1],x,p),t[2]]:[t[0],t[1],ins(t[2],x,p)];
  for(;k<n;k++)a=ins(a,V[k],()=>R()<0.5);return a;};
/* palier 1 : écrire une valeur du type */
function exoValeur(ty,dit,val,expl,dessin){const pre=TY[ty],S=ML.session();if(S.lis(pre).some(x=>x.faute))throw new Error("type faux "+pre);
  const r=S.lis(val)[0];if(r.faute||r.exc)throw new Error("valeur fausse : "+val);const type=r.type,T=r.t,ecrit=r.ecrit;
  const E=[{w:"Les constructeurs du type&nbsp;:",why:CTOR[ty],pts:1},{w:expl,why:"On construit la valeur de l'intérieur vers l'extérieur : chaque constructeur reçoit ce qu'annonce sa déclaration, après « of ».",pts:1.5},
    {w:`La valeur : <b>${c(ecrit)}</b>`,why:`Son type est ${c(type)}.`,pts:0.5}];
  function juge(rep){const t=normalise(rep.v||"").trim();if(!t)return {incomplet:"Écris la valeur, avec ses constructeurs."};
    const S2=ML.session();S2.lis(pre);const x=S2.lis(t)[0],faux=(type,titre,msg)=>({ok:false,faux:["v"],resume:"Pas tout à fait : ce n'est pas la valeur demandée.",diag:{etape:1,type,titre,msg}});
    if(x.faute==="syntaxe")return {incomplet:"Je n'arrive pas à lire cette valeur. "+x.msg};
    if(x.faute==="type")return faux("valeur mal construite (erreur de type)","Où ça part : un constructeur reçoit autre chose que prévu.",`${x.extrait?`À cet endroit, ${c(x.extrait)} : `:""}${esc(x.msg)}`);
    if(x.faute||x.exc||!x.t)return {incomplet:"Écris une valeur, pas un calcul."};
    if(!ML.convient(x.t,T))return faux("type de la valeur construite","Où ça part : le type.",`Ta valeur est de type ${c(x.type)} ; on attend ${c(type)}.`);
    if(x.ecrit===ecrit)return {ok:true};
    return faux("valeur d'un type somme","Où ça part : la construction.",`Ta valeur ${c(x.ecrit)} n'est pas celle demandée. Reprends ${dit} morceau par morceau.`);}
  const fausse=ecrit.replace(/\d+/,m=>String(+m+1)).replace(/'([a-z])'/,(m,x)=>x==="z"?"'y'":"'z'");
  return {sig:"V"+ty+ecrit,code:pre,q:`Avec ce type, écris la valeur qui représente ${dit}.`,corps:bloc(pre)+(dessin?`<p>L'arbre&nbsp;:</p>`+bloc(dessin):""),texte:finLigne(pre)+" — valeur de "+dit,
    champs:[{k:"champ",id:"v",nom:"valeur",label:"La valeur :",ex:"avec ses constructeurs",apercu:false,sym:symDe(SYMV,["(",")","[","]",";","."]).concat([["'","'"]])}],juge,etapes:E,
    bonne:c(ecrit),bonneTxt:ecrit,repBonne:{v:ecrit},repFausse:{v:fausse===ecrit?"Empty":fausse},nature:ty,
    ens:{code:pre,valeur:ecrit,type,ocaml:[{code:pre+"\n;;\n"+ecrit,attendu:"T:"+type+"|V:"+ecrit}]}};}
const VALEURS=[
 R=>{const p=R.ent(1,9),q=R.ent(2,9);return exoValeur("nombre",`la fraction ${p}/${q}`,`Rat (${p}, ${q})`,`Une fraction se range dans ${c("Rat")}, avec le couple ${c(`(${p}, ${q})`)}.`);},
 R=>{const n=R.ent(-9,20);return exoValeur("nombre",`l'entier ${n}`,`Ent (${n})`.replace(/\((\d+)\)/,"$1"),`Un entier se range dans ${c("Ent")}.${n<0?` Un nombre négatif s'écrit entre parenthèses après un constructeur : ${c(`Ent (${n})`)}.`:""}`);},
 R=>{const a=R.ent(1,9),p=R.ent(1,5),q=R.ent(2,7);return exoValeur("nombre",`la liste qui contient l'entier ${a}, puis la fraction ${p}/${q}`,`[Ent ${a}; Rat (${p}, ${q})]`,`Une liste de nombre : chaque élément est construit avec ${c("Ent")} ou ${c("Rat")}, et les éléments sont séparés par des points-virgules.`);},
 R=>{const m=R.choix(["ab","oc","ou","ami","ok","rue","bus","go"]);return exoValeur("chaine",`la chaîne « ${m} »`,ch(m),`Le premier caractère d'abord : ${c(`Cons ('${m[0]}', …)`)}, où … est la chaîne « ${m.slice(1)} ». La chaîne se termine par ${c("Empty")}.`);},
 R=>{const L=R.mel([1,2,3,4,5,6,7,8,9]).slice(0,R.ent(2,3));return exoValeur("ens",`l'ensemble obtenu en ajoutant ${et(L.slice().reverse().map(String))} à l'ensemble vide, dans cet ordre`,ensDe(L),`Le dernier ajouté est le plus à l'extérieur : on part de ${c("Empty")}, puis chaque ${c("Add")} entoure ce qui est déjà construit.`);},
 R=>{const a=tireArbre(R,R.ent(2,3)),v=arbreML(a);if(v.length>60)return null;return exoValeur("arbre","l'arbre dessiné ci-dessous (un sous-arbre absent est vide)",v,`La racine ${c(String(a[0]))} est le nœud le plus à l'extérieur : ${c(`Node (${a[0]}, gauche, droite)`)}. Un sous-arbre absent s'écrit ${c("Empty")}, une feuille ${c("Node (x, Empty, Empty)")}.`,arbreDessin(a));},
 R=>{const a=R.ent(1,9),f=R.ent(1,9);return exoValeur("number",`la liste qui contient l'entier ${a}, puis le flottant ${f}.5`,`[Int ${a}; Float ${f}.5]`,`${c("Int")} pour l'entier, ${c("Float")} pour le flottant, avec son point.`);}];
const tireValeur=R=>{for(;;){const e=R.choix(VALEURS)(R);if(e)return e;}};
/* palier 2 : ce que renvoie une fonction sur le type */
const SOMMEF=[
 R=>{const m=R.choix(["ab","oca","ami","rue","bus"]);return ["chaine",`let rec my_length : my_string -> int =\n  function\n  | Empty -> 0\n  | Cons (_, r) -> 1 + my_length r`,`my_length (${ch(m)})`];},
 R=>{const m=R.choix(["aba","oca","bab","ana","rue","ici"]),x=R.choix(m.split(""));return ["chaine",`let rec compte :\n  char -> my_string -> int =\n  fun x s -> match s with\n  | Empty -> 0\n  | Cons (y, r) ->\n    if y = x then 1 + compte x r\n    else compte x r`,`compte '${x}' (${ch(m)})`];},
 R=>{const p=R.ent(1,9),q=R.ent(2,9),k=R.ent(1,9);return ["nombre",`let inverse : nombre -> nombre = function\n  | Ent n -> Rat (1, n)\n  | Rat (p, q) -> Rat (q, p)`,R()<0.5?`inverse (Rat (${p}, ${q}))`:`inverse (Ent ${k})`];},
 R=>{const p=R.ent(1,9),q=R.ent(2,9),k=R.ent(1,9);return ["nombre",`let entier : nombre -> bool = function\n  | Ent _ -> true\n  | Rat (p, q) -> p mod q = 0`,R.choix([`entier (Rat (${p*q}, ${q}))`,`entier (Rat (${p}, ${q}))`,`entier (Ent ${k})`])];},
 R=>{const a=R.ent(1,9),b=R.ent(1,9),p=R.ent(1,9),q=R.ent(2,5);return ["nombre",`let ajoute : nombre -> nombre -> nombre =\n  fun x y -> match x, y with\n  | Ent a, Ent b -> Ent (a + b)\n  | Ent a, Rat (p, q)\n  | Rat (p, q), Ent a ->\n    Rat (a * q + p, q)\n  | Rat (p, q), Rat (r, s) ->\n    Rat (p * s + r * q, q * s)`,R.choix([`ajoute (Ent ${a}) (Ent ${b})`,`ajoute (Ent ${a}) (Rat (${p}, ${q}))`,`ajoute (Rat (${p}, ${q})) (Rat (1, 2))`])];},
 R=>{const L=R.mel([1,2,3,4,5,6]).slice(0,3),x=R()<0.5?R.choix(L):R.ent(1,9);return ["ens",`let rec mem : int -> int set -> bool =\n  fun x e -> match e with\n  | Empty -> false\n  | Add (y, r) -> x = y || mem x r`,`mem ${x} (${ensDe(L)})`];},
 R=>{const L=R.mel([1,2,3,4,5,6]).slice(0,R.ent(2,3));return ["ens",`let rec somme : int set -> int = function\n  | Empty -> 0\n  | Add (x, r) -> x + somme r`,`somme (${ensDe(L)})`];},
 R=>{const a=tireArbre(R,R.ent(2,3));return ["arbre",`let rec taille : int tree -> int = function\n  | Empty -> 0\n  | Node (_, g, d) ->\n    1 + taille g + taille d`,`taille a`,a];},
 R=>{const a=tireArbre(R,R.ent(2,3));return ["arbre",`let rec somme : int tree -> int = function\n  | Empty -> 0\n  | Node (x, g, d) ->\n    x + somme g + somme d`,`somme a`,a];},
 R=>{const a=tireArbre(R,R.ent(2,3));return ["arbre",`let rec hauteur : int tree -> int = function\n  | Empty -> 0\n  | Node (_, g, d) ->\n    1 + max (hauteur g) (hauteur d)`,`hauteur a`,a];},
 R=>{const L=[R.ent(1,9),R.ent(1,9)];return ["number",`let rec total : number list -> float =\n  function\n  | [] -> 0.\n  | Int n :: r ->\n    float_of_int n +. total r\n  | Float x :: r -> x +. total r`,`total [Int ${L[0]}; Float ${L[1]}.5]`];},
 R=>{const c0=R.choix(["Trefle","Carreau","Coeur","Pique"]);return ["couleur",`let rouge : couleur -> bool = function\n  | Carreau | Coeur -> true\n  | _ -> false`,`rouge ${c0}`];}];
const tireSomme=R=>{for(;;){const x=R.choix(SOMMEF)(R);if(!x)continue;const [ty,def,appel,a]=x;
  const pre=TY[ty]+(a?`\nlet a =\n  ${coupe(arbreML(a),"    ")}`:"");
  const e=exoRenvoie(def,appel,{pre,arbre:true,nat:ty,sym:["(",")","[","]",";",".","true","false"]});if(!e)continue;
  if(a)e.corps=bloc(TY[ty])+`<p>L'arbre ${c("a")}&nbsp;:</p>`+bloc(arbreDessin(a)+"\n\nlet a =\n  "+coupe(arbreML(a),"    "))+bloc(def);
  return e;}};
/* palier 3 : la branche manquante, sur un type somme */
const tyL=ty=>TY[ty].split("\n");
const FS={
 my_length:R=>({nom:"my_length",dit:"le nombre de caractères de la chaîne",L:[...tyL("chaine"),"let rec my_length : my_string -> int =","  function","  | Empty -> 0","  | Cons (_, r) -> 1 + my_length r"],roles:{5:["branche","La chaîne vide n'a aucun caractère."],6:["branche","Un caractère, plus ceux de r : comme pour la longueur d'une liste."]},args:["Empty","(Cons ('a', Empty))",`(${ch("oui")})`,`(${ch("ab")})`,`(${ch("rue")})`]}),
 inverse:R=>({nom:"inverse",dit:"l'inverse 1/x du nombre x (x non nul)",L:[...tyL("nombre"),"let inverse : nombre -> nombre =","  function","  | Ent n -> Rat (1, n)","  | Rat (p, q) -> Rat (q, p)"],roles:{5:["branche","L'inverse de l'entier n est la fraction 1/n."],6:["branche","L'inverse de p/q est q/p : on échange les deux nombres du couple."]},args:["(Ent 4)","(Ent 1)","(Rat (2, 3))","(Rat (5, 7))","(Rat (1, 9))"]}),
 mem:R=>({nom:"mem",dit:"true si x est dans l'ensemble",L:[...tyL("ens"),"let rec mem : int -> int set -> bool =","  fun x e -> match e with","  | Empty -> false","  | Add (y, r) -> x = y || mem x r"],roles:{5:["branche","L'ensemble vide ne contient rien."],6:["branche","x est dans l'ensemble s'il vaut y, ou s'il est dans le reste r."]},args:["3 Empty",`3 (${ensDe([3])})`,`3 (${ensDe([1,3])})`,`4 (${ensDe([1,2,5])})`,`2 (${ensDe([2,6])})`]}),
 card:R=>({nom:"card",dit:"le nombre d'éléments de l'ensemble (sans doublon)",L:[...tyL("ens"),"let rec card : int set -> int = function","  | Empty -> 0","  | Add (_, r) -> 1 + card r"],roles:{4:["branche","L'ensemble vide a 0 élément."],5:["branche","Un élément de plus que r."]},args:["Empty",`(${ensDe([4])})`,`(${ensDe([1,3])})`,`(${ensDe([1,2,5])})`,`(${ensDe([2,6,7,9])})`]}),
 taille:R=>({nom:"taille",dit:"le nombre de nœuds de l'arbre",L:[...tyL("arbre"),"let rec taille : int tree -> int =","  function","  | Empty -> 0","  | Node (_, g, d) ->","    1 + taille g + taille d"],roles:{5:["branche","L'arbre vide n'a aucun nœud."],7:["rec","Le nœud lui-même, plus les nœuds de ses deux sous-arbres."]},args:["Empty","(Node (1, Empty, Empty))",`(${arbreML([5,[3,null,null],null])})`,`(${arbreML([5,[3,null,null],[8,null,null]])})`,`(${arbreML([2,null,[4,[1,null,null],null]])})`]}),
 somArbre:R=>({nom:"somme",dit:"la somme des nombres portés par l'arbre",L:[...tyL("arbre"),"let rec somme : int tree -> int =","  function","  | Empty -> 0","  | Node (x, g, d) ->","    x + somme g + somme d"],roles:{5:["branche","L'arbre vide ne porte rien."],7:["rec","Le nombre du nœud, plus la somme de chaque sous-arbre."]},args:["Empty","(Node (4, Empty, Empty))",`(${arbreML([5,[3,null,null],null])})`,`(${arbreML([5,[3,null,null],[8,null,null]])})`,`(${arbreML([2,null,[4,[1,null,null],null]])})`]}),
 hauteur:R=>({nom:"hauteur",dit:"la hauteur de l'arbre (l'arbre vide a une hauteur 0)",L:[...tyL("arbre"),"let rec hauteur : int tree -> int =","  function","  | Empty -> 0","  | Node (_, g, d) ->","    1 + max (hauteur g) (hauteur d)"],roles:{5:["branche","L'arbre vide a une hauteur 0."],7:["rec","Un étage pour le nœud, plus la hauteur du plus haut des deux sous-arbres."]},args:["Empty","(Node (4, Empty, Empty))",`(${arbreML([5,[3,null,null],null])})`,`(${arbreML([5,[3,[1,null,null],null],[8,null,null]])})`,`(${arbreML([2,null,[4,[1,null,null],null]])})`]}),
 entier:R=>({nom:"entier",dit:"true si le nombre est un entier",L:[...tyL("nombre"),"let entier : nombre -> bool = function","  | Ent _ -> true","  | Rat (p, q) -> p mod q = 0"],roles:{4:["branche","Un Ent est toujours un entier."],5:["branche","p/q est un entier quand q divise p : le reste de p par q vaut 0."]},args:["(Ent 3)","(Rat (4, 2))","(Rat (3, 2))","(Rat (9, 3))","(Rat (5, 4))"]}),
 somEns:R=>({nom:"somme",dit:"la somme des éléments de l'ensemble",L:[...tyL("ens"),"let rec somme : int set -> int =","  function","  | Empty -> 0","  | Add (x, r) -> x + somme r"],roles:{5:["branche","L'ensemble vide : la somme vaut 0."],6:["branche","x plus la somme des éléments de r."]},args:["Empty",`(${ensDe([4])})`,`(${ensDe([1,3])})`,`(${ensDe([1,2,5])})`,`(${ensDe([2,6,7])})`]}),
 total:R=>({nom:"total",dit:"la somme, en float, des nombres de la liste",L:[...tyL("number"),"let rec total : number list -> float =","  function","  | [] -> 0.","  | Int n :: r ->","    float_of_int n +. total r","  | Float x :: r -> x +. total r"],roles:{5:["branche","La liste vide : la somme vaut 0. (un float)."],7:["rec","Un Int doit être converti en float avant d'être ajouté avec +."],8:["branche","Un Float s'ajoute directement avec +."]},args:["[]","[Int 2]","[Float 1.5]","[Int 1; Float 2.5]","[Float 0.5; Int 3; Int 1]"]}),
 feuilles:R=>({nom:"feuilles",dit:"le nombre de feuilles de l'arbre (nœuds sans enfant)",L:[...tyL("arbre"),"let rec feuilles : int tree -> int =","  function","  | Empty -> 0","  | Node (_, Empty, Empty) -> 1","  | Node (_, g, d) ->","    feuilles g + feuilles d"],roles:{5:["branche","L'arbre vide n'a aucune feuille."],6:["branche","Un nœud sans enfant est une feuille. Cette branche doit venir avant la suivante, plus générale."],8:["rec","Les feuilles sont dans les deux sous-arbres."]},args:["Empty","(Node (1, Empty, Empty))",`(${arbreML([5,[3,null,null],null])})`,`(${arbreML([5,[3,null,null],[8,null,null]])})`,`(${arbreML([2,[7,null,null],[4,[1,null,null],[6,null,null]]])})`]}),
 rouge:R=>({nom:"rouge",dit:"true pour Carreau et Coeur, false sinon",L:[...tyL("couleur"),"let rouge : couleur -> bool = function","  | Carreau | Coeur -> true","  | Trefle | Pique -> false"],roles:{3:["branche","Les deux couleurs rouges, réunies dans une seule branche avec |."],4:["branche","Les deux couleurs noires."]},args:["Trefle","Carreau","Coeur","Pique"]})};

/* ---------- PF6 : « de trois façons » ---------- */
ROLE.init=["la valeur de départ de l'accumulateur","ce que vaut le résultat quand la liste est vide"];
ROLE.acc=["le pas de l'accumulateur","comment l'accumulateur change à chaque élément"];
/* une fonction, écrite en récursif (match), en récursif terminal (fonction aux avec accumulateur), puis avec un itérateur */
const TROIS={
 somme:R=>({nom:"somme",dit:"la somme des éléments de la liste",args:listes(R,1,9),sig:"int list -> int",
   V:[["  function","  | [] -> 0","  | x :: r -> x + somme r"],["  fun li ->","  let rec aux acc l = match l with","    | [] -> acc","    | x :: r -> aux (acc + x) r","  in aux 0 li"],["  fun li ->","  List.fold_left","    (fun acc x -> acc + x) 0 li"]],
   roles:[{2:["base","La somme d'une liste vide vaut 0."],3:["rec","x plus la somme du reste."]},{3:["base","Plus d'élément : l'accumulateur contient la somme."],4:["acc","On ajoute x à l'accumulateur, puis on continue sur r."],5:["init","L'accumulateur part de 0, la somme de rien."]},{3:["fn","À chaque élément, le nouvel accumulateur est l'ancien plus x ; il part de 0."]}]}),
 longueur:R=>({nom:"longueur",dit:"le nombre d'éléments de la liste",args:listes(R,1,9),sig:"int list -> int",
   V:[["  function","  | [] -> 0","  | _ :: r -> 1 + longueur r"],["  fun li ->","  let rec aux acc l = match l with","    | [] -> acc","    | _ :: r -> aux (acc + 1) r","  in aux 0 li"],["  fun li ->","  List.fold_left","    (fun acc _ -> acc + 1) 0 li"]],
   roles:[{2:["base","La liste vide n'a aucun élément."],3:["rec","Un élément, plus ceux du reste."]},{3:["base","Plus d'élément : l'accumulateur contient le compte."],4:["acc","Chaque élément ajoute 1 au compte."],5:["init","Le compte part de 0."]},{3:["fn","Chaque élément compte pour 1 ; le compte part de 0."]}]}),
 produit:R=>({nom:"produit",dit:"le produit des éléments de la liste",args:listes(R,1,5),sig:"int list -> int",
   V:[["  function","  | [] -> 1","  | x :: r -> x * produit r"],["  fun li ->","  let rec aux acc l = match l with","    | [] -> acc","    | x :: r -> aux (acc * x) r","  in aux 1 li"],["  fun li ->","  List.fold_left","    (fun acc x -> acc * x) 1 li"]],
   roles:[{2:["base","Le produit vide vaut 1."],3:["rec","x fois le produit du reste."]},{3:["base","Plus d'élément : l'accumulateur contient le produit."],4:["acc","On multiplie l'accumulateur par x."],5:["init","Le produit part de 1 : avec 0, il vaudrait toujours 0."]},{3:["fn","On multiplie l'accumulateur par x ; il part de 1."]}]}),
 nbPairs:R=>({nom:"nbPairs",dit:"le nombre d'éléments pairs",args:listes(R,1,9),sig:"int list -> int",
   V:[["  function","  | [] -> 0","  | x :: r ->","    if x mod 2 = 0 then 1 + nbPairs r","    else nbPairs r"],["  fun li ->","  let rec aux acc l = match l with","    | [] -> acc","    | x :: r ->","      if x mod 2 = 0","      then aux (acc + 1) r","      else aux acc r","  in aux 0 li"],["  fun li ->","  List.fold_left","    (fun acc x ->","      if x mod 2 = 0 then acc + 1","      else acc) 0 li"]],
   roles:[{2:["base","Aucun élément pair dans la liste vide."],4:["rec","x est pair : on le compte."],5:["rec","x est impair : on ne compte rien pour lui."]},{3:["base","Plus d'élément : l'accumulateur contient le compte."],6:["acc","x est pair : on ajoute 1 à l'accumulateur."],7:["acc","x est impair : l'accumulateur ne change pas."],8:["init","Le compte part de 0."]},{4:["fn","x est pair : un de plus."]}]}),
 nbSup:R=>{const k=R.ent(2,7);return {nom:"nbSup",dit:`le nombre d'éléments plus grands que ${k}`,args:listes(R,1,9),sig:"int list -> int",
   V:[["  function","  | [] -> 0","  | x :: r ->",`    if x > ${k} then 1 + nbSup r`,"    else nbSup r"],["  fun li ->","  let rec aux acc l = match l with","    | [] -> acc","    | x :: r ->",`      if x > ${k} then aux (acc + 1) r`,"      else aux acc r","  in aux 0 li"],["  fun li ->","  List.fold_left","    (fun acc x ->",`      if x > ${k} then acc + 1`,"      else acc) 0 li"]],
   roles:[{2:["base","Aucun élément dans la liste vide."],4:["rec",`x est plus grand que ${k} : on le compte.`]},{3:["base","Plus d'élément : l'accumulateur contient le compte."],5:["acc",`x est plus grand que ${k} : on ajoute 1.`],7:["init","Le compte part de 0."]},{4:["fn",`x plus grand que ${k} : un de plus.`]}]};},
 somCarres:R=>({nom:"somCarres",dit:"la somme des carrés des éléments",args:listes(R,1,5),sig:"int list -> int",
   V:[["  function","  | [] -> 0","  | x :: r -> x * x + somCarres r"],["  fun li ->","  let rec aux acc l = match l with","    | [] -> acc","    | x :: r -> aux (acc + x * x) r","  in aux 0 li"],["  fun li ->","  List.fold_left","    (fun acc x -> acc + x * x) 0 li"]],
   roles:[{2:["base","Rien à ajouter pour la liste vide."],3:["rec","Le carré de x plus la somme des carrés du reste."]},{3:["base","Plus d'élément : l'accumulateur contient la somme."],4:["acc","On ajoute le carré de x à l'accumulateur."],5:["init","La somme part de 0."]},{3:["fn","On ajoute x * x à l'accumulateur."]}]}),
 miroir:R=>({nom:"miroir",dit:"la liste à l'envers",args:listes(R,1,9),sig:"int list -> int list",
   V:[["  function","  | [] -> []","  | x :: r -> miroir r @ [x]"],["  fun li ->","  let rec aux acc l = match l with","    | [] -> acc","    | x :: r -> aux (x :: acc) r","  in aux [] li"],["  fun li ->","  List.fold_left","    (fun acc x -> x :: acc) [] li"]],
   roles:[{2:["base","La liste vide à l'envers est vide."],3:["rec","Le reste à l'envers, puis x à la fin, avec @ (x n'est pas une liste : [x])."]},{3:["base","Plus d'élément : l'accumulateur contient la liste retournée."],4:["acc","On pose x devant l'accumulateur : le premier élément finit au fond."],5:["init","L'accumulateur part de la liste vide."]},{3:["fn","Chaque élément est posé devant ceux déjà vus."]}]}),
 plus:R=>{const k=R.ent(1,9);return {nom:"plus",dit:`la liste où ${k} est ajouté à chaque élément`,args:listes(R,1,9),sig:"int list -> int list",
   V:[["  function","  | [] -> []",`  | x :: r -> (x + ${k}) :: plus r`],["  fun li ->","  let rec aux acc l = match l with","    | [] -> List.rev acc",`    | x :: r -> aux ((x + ${k}) :: acc) r`,"  in aux [] li"],["  fun li ->","  List.fold_right",`    (fun x acc -> (x + ${k}) :: acc)`,"    li []"]],
   roles:[{2:["base","La liste vide donne la liste vide."],3:["rec",`x + ${k} devant le résultat sur le reste.`]},{3:["base","L'accumulateur est à l'envers (le dernier élément traité est devant) : on le remet dans l'ordre avec List.rev."],4:["acc",`On pose x + ${k} devant l'accumulateur.`]},{3:["fn",`fold_right part de la fin : chaque x + ${k} est posé devant le reste, l'ordre est gardé.`]}]};}};
function tireTrois(R,k){for(;;){const T=R.choix(Object.values(TROIS))(R);
  const vers=T.V.map((V,j)=>[`let ${j?"":"rec "}${T.nom} : ${T.sig} =`].concat(V)),F={nom:T.nom,dit:T.dit,args:T.args,L:vers[k],roles:T.roles[k]};
  const I=Object.keys(F.roles).map(Number);if(!I.length)continue;const e=exoLigne(F,R.choix(I),{sym:[["|","->","::","[]"],["|","->","::","[]","acc"],["fun","->","::","acc"]][k]});if(!e)continue;
  const autres=vers.map((L,j)=>`(* ${["récursive","récursive terminale","avec un itérateur"][j]} *)\n`+L.join("\n")).join("\n\n");
  e.etapes[2].w+=`<br>Les trois façons d'écrire ${c(T.nom)}&nbsp;:${bloc(autres)}`;e.ens.trois=vers.map(L=>L.join("\n"));
  const n0=e.ens.ocaml.length;vers.forEach((L,j)=>{if(j!==k)e.ens.essais.forEach((x,m)=>e.ens.ocaml.push({code:L.join("\n")+" in "+x,attendu:e.ens.ocaml[m].attendu}));});e.nature=["récursive","terminale","itérateur"][k]+" · "+F.roles[e.ens.ligne][0];return e;}}

/* ---------- PF7 : exceptions ---------- */
const POURQUOIEXC=x=>/^Failure/.test(x)?`${c("failwith s")} lève l'exception ${c("Failure s")}, avec le même message.`:/^Division_by_zero/.test(x)?`Une division ou un ${c("mod")} par 0 lève ${c("Division_by_zero")}.`
  :/^Not_found/.test(x)?`${c("Not_found")} est l'exception prévue par OCaml pour « pas trouvé ».`:`${c("raise e")} lève l'exception e.`;
/* def : la fonction (avec ses déclarations d'exception) ; appel : l'expression ; essai : [inner, branches] pour un try … with */
function exoExc(def,appel,o){o=o||{};const S=ML.session();if(S.lis(def).some(x=>x.faute))throw new Error("définition fausse : "+def);
  const r=S.lis(appel)[0];if(r.faute)return null;const exc=r.exc?r.ecritExc:null,type=r.type,ecrit=r.ecrit;
  if(!exc&&(/'/.test(type)||ecrit.length>40))return null;
  const fin=exc?{w:`Donc ${c(appel)} <b>lève l'exception ${c(exc)}</b>`,why:"Une exception arrête le calcul : il n'y a pas de valeur.",pts:0.5}:{w:`Donc ${c(appel)} vaut <b>${c(ecrit)}</b>`,why:`Son type est ${c(type)}.`,pts:0.5};
  let E;
  if(o.try){const [inner,B]=o.try,ri=S.lis(inner)[0],S2=ML.session();S2.lis(def);const d=S2.deroule(inner);
    const calc=bloc(d.lignes.map((l,i)=>coupe((i?"= ":"  ")+finLigne(l),"    ")).concat(d.exc?["= exception "+d.exc]:[]).join("\n"));
    let w2,why2;
    if(!ri.exc){w2="Pas d'exception : la partie « with » ne sert pas.";why2=`${c("try e with …")} vaut la valeur de e quand e se calcule sans exception.`;}
    else{const k=B.findIndex(b=>{const t=S.lis(`try ${inner} with ${b}`)[0];return !(t.exc&&t.ecritExc===ri.ecritExc);});
      if(k<0){w2=`Aucune branche du « with » ne correspond à ${c(ri.ecritExc)} : l'exception n'est pas rattrapée, elle continue.`;why2="Chaque branche du with ne rattrape que l'exception écrite dans son motif.";}
      else{const S3=ML.session();S3.lis(def);const b=B[k],m=/^(.*?) -> (.*)$/.exec(b),v=S.lis(`try ${inner} with ${b}`)[0];
        w2=`L'exception ${c(ri.ecritExc)} correspond à la branche ${c(b)}`+(m[2].trim()===(v.ecrit||"")?` : elle vaut ${c(v.ecrit)}.`:` : on calcule ${c(m[2])}${/\b[a-z]\b/.test(m[1].replace(/^\w+/,""))?`, avec ${c(m[1])} = ${c(ri.ecritExc)}`:""}, ce qui donne ${c(v.ecrit||v.ecritExc)}.`);
        why2="Le with essaie ses branches dans l'ordre, comme un match, sur l'exception levée.";}}
    E=[{w:`On calcule d'abord ce qui est entre ${c("try")} et ${c("with")}&nbsp;:${calc}`,why:ri.exc?POURQUOIEXC(ri.ecritExc):"Rien ne lève d'exception dans ce calcul.",pts:1},{w:w2,why:why2,pts:1.5},fin];}
  else{const S2=ML.session();S2.lis(def);const d=S2.deroule(appel);if(d.lignes.length<2)return null;
    E=[{w:`Le calcul&nbsp;:${bloc(d.lignes.map((l,i)=>coupe((i?"= ":"  ")+finLigne(l),"    ")).concat(d.exc?["= exception "+d.exc]:[]).join("\n"))}`,why:exc?POURQUOIEXC(exc):"On remplace les paramètres par les valeurs de l'appel, puis on calcule.",pts:2},fin];}
  const S0=ML.session();S0.lis(def);
  function juge(rep){const faux=(etape,sorte,titre,msg)=>({ok:false,faux:[rep.ok==="exc"?"e":"v"],resume:"Pas tout à fait.",diag:{etape,type:sorte,titre,msg}});
    if(rep.ok!=="val"&&rep.ok!=="exc")return {incomplet:"Dis d'abord si le calcul donne une valeur ou lève une exception."};
    if(rep.ok==="val"){const lv=lisValeurRep(S0,rep.v);if(lv.vide)return {incomplet:"Écris la valeur."};if(lv.pb)return {incomplet:lv.pb};
      if(exc)return faux(E.length-2,"exception non vue","Où ça part : il y a une exception.",`Le calcul lève ${c(exc)} : il n'a pas de valeur.`);
      if(lv.fun||!ML.convient(lv.t,r.t))return faux(E.length-1,"type de la valeur","Où ça part : le type de la valeur.",`La valeur est ${un(type)}.`);
      return lv.ecrit===ecrit?{ok:true}:faux(E.length-2,"valeur après une exception rattrapée","Où ça part : le calcul.","Reprends le calcul : quelle branche s'applique, et ce qu'elle calcule.");}
    let t=normalise(rep.e||"").trim().replace(/^exception\s*:?\s*/i,"").replace(/\.$/,"");if(!t)return {incomplet:"Écris l'exception levée, par exemple Failure \"vide\"."};
    const x=S0.lis(t)[0];if(x.faute)return {incomplet:"Je n'arrive pas à lire cette exception. "+x.msg};if(x.type!=="exn")return {incomplet:`Écris une exception (comme ${c("Not_found")} ou ${c('Failure "vide"')}), pas une valeur.`};
    if(!exc)return faux(E.length-2,"exception imaginée","Où ça part : il n'y a pas d'exception.",o.try?"L'exception est rattrapée par le with : le calcul continue avec la branche qui lui correspond.":"Rien ne lève d'exception dans ce calcul.");
    if(x.ecrit===exc)return {ok:true};
    return faux(0,"exception levée","Où ça part : ce n'est pas cette exception.",x.ecrit.split(" ")[0]===exc.split(" ")[0]?"C'est la bonne exception, mais pas avec le bon argument.":"Regarde quelle exception est levée en premier.");}
  return {sig:"X"+def.replace(/\s+/g," ")+"|"+appel,code:def,q:`Que donne ${c(appel)} ? Une valeur, ou une exception ?`,corps:bloc(def),texte:finLigne(def)+" — "+appel,
    champs:[{k:"choix",id:"ok",o:[["val","Une valeur"],["exc","Une exception"]]},{k:"champ",id:"v",nom:"valeur",label:"La valeur :",ex:"comme OCaml l'écrit",si:{ok:"val"},apercu:false,sym:symDe(SYMV,["[","]",";",'"',"true","false"])},
      {k:"champ",id:"e",nom:"exception",label:"L'exception :",ex:'par exemple Failure "vide"',si:{ok:"exc"},apercu:false,sym:[['"','"'],["Failure","Failure "],["Not_found","Not_found"],["Division_by_zero","Division_by_zero"]]}],juge,etapes:E,
    bonne:exc?`l'exception ${c(exc)}`:c(ecrit),bonneTxt:exc?"exception "+exc:ecrit,repBonne:exc?{ok:"exc",e:exc}:{ok:"val",v:ecrit},repFausse:exc?{ok:"val",v:"0"}:{ok:"exc",e:"Not_found"},
    nature:(o.try?"try":"raise")+" · "+(exc?"exception":"valeur"),ens:{code:def,appel,exc,ecrit,ocaml:[{code:def.replace(/\n(let )/,"\n;;\n$1")+" in "+appel,attendu:exc?"EXC:"+exc.split(" ")[0]:"T:"+type+"|V:"+ecrit}]}};}
const EXCF={
 negatif:R=>{const n=R.choix([-R.ent(1,9),R.ent(0,9)]),k=R.ent(2,3);return ["exception Negatif\nlet f : int -> int = function n ->\n  if n < 0 then raise Negatif\n  else n * "+k,`f ${n<0?"("+n+")":n}`,`f (${-R.ent(1,9)})`,["Negatif -> 0","Negatif -> -1"]];},
 borne:R=>{const n=R.ent(5,15),m=R.ent(5,15);return ["exception Trop_grand of int\nlet borne : int -> int = function n ->\n  if n > 10 then raise (Trop_grand n)\n  else n",`borne ${n}`,`borne ${m}`,["Trop_grand k -> k - 10"]];},
 tete:R=>{const L=R()<0.5?"[]":lst(petiteListe(R,1,9,1,3)),m=R.choix(["vide","rien","liste vide"]);return [`let tete : int list -> int = function\n  | [] -> failwith "${m}"\n  | x :: _ -> x`,`tete ${L}`,"tete []",["Failure s -> String.length s","Failure _ -> 0"]];},
 div:R=>{const a=R.ent(5,20),b=R.choix([0,0,R.ent(2,5)]);return [`let div : int -> int -> int = fun a b ->\n  if b = 0 then failwith "division"\n  else a / b`,`div ${a} ${b}`,`div ${a} 0`,["Failure _ -> 0","Division_by_zero -> 1"]];},
 moyenne:R=>{const s=R.ent(5,20),n=R.choix([0,R.ent(2,4)]);return ["let moyenne : int -> int -> int =\n  fun s n -> s / n",`moyenne ${s} ${n}`,`moyenne ${s} 0`,["Division_by_zero -> 0","Failure _ -> 1"]];},
 premier:R=>{const L=R()<0.5?"[]":lst(petiteListe(R,1,9,1,3));return ["let premier : int list -> int =\n  function li -> List.hd li + 1",`premier ${L}`,"premier []",["Failure _ -> 0","Not_found -> 1"]];},
 position:R=>{const L=petiteListe(R,1,9,2,3),x=R()<0.5?R.choix(L):R.ent(1,9);return ["let rec position :\n  int -> int list -> int =\n  fun x li -> match li with\n  | [] -> raise Not_found\n  | y :: r ->\n    if x = y then 0\n    else 1 + position x r",`position ${x} ${lst(L)}`,`position ${x} ${lst(L)}`,["Not_found -> -1"]];},
 inverse:R=>{const p=R.choix([0,R.ent(1,9)]),q=R.ent(2,9);return [`${TY.nombre}\nlet inverse : nombre -> nombre =\n  function\n  | Ent 0 -> failwith "zero"\n  | Ent n -> Rat (1, n)\n  | Rat (p, q) ->\n    if p = 0 then failwith "zero"\n    else Rat (q, p)`,R()<0.5?`inverse (Rat (${p}, ${q}))`:`inverse (Ent ${p})`,`inverse (Ent 0)`,["Failure _ -> Ent 0"]];}};
function tireExc(R,t){for(;;){const [def,a1,a2,B]=R.choix(Object.values(EXCF))(R);let e;
  if(!t)e=exoExc(def,a1);
  else{const inner=R()<0.6?a2:a1,b=R.choix(B),B2=R()<0.3?[b,R.choix(["Not_found -> 7","Failure _ -> 7","Division_by_zero -> 7"])]:[b];const h=B2.join(" | ");
    e=exoExc(def,`try ${inner} with ${h}`,{try:[inner,B2]});}
  if(e)return e;}}

/* ---------- PF8 : écrire une fonction entière, exécutée sur des dizaines d'entrées ---------- */
const parcours=(x,f)=>{if(!x||typeof x!=="object")return;if(Array.isArray(x)){x.forEach(y=>parcours(y,f));return;}f(x);for(const k in x)if(k!=="T"&&k!=="ty")parcours(x[k],f);};
const recursif=A=>{let r=false;parcours(A,x=>{if((x.k==="def"||x.k==="let")&&x.rec){const N=x.B.map(b=>b.nom).filter(Boolean);x.B.forEach(b=>parcours(b.e,y=>{if(y.k==="var"&&N.includes(y.n))r=true;}));}});return r;};
const modList=A=>{const L=[];parcours(A,x=>{if(x.k==="var"&&/^List\.(?!hd$|tl$)/.test(x.n)&&!L.includes(x.n))L.push(x.n);});return L;};
const emploie=(A,ops)=>{let r=null;parcours(A,x=>{if(r)return;if(x.k==="op"&&ops.includes(x.o))r=x.o;else if(x.k==="var"&&x.n[0]==="("&&ops.includes(x.n.replace(/[() ]/g,"")))r=x.n.replace(/[() ]/g,"");});return r;};
/* la signature est-elle écrite ? null si la fonction n'est pas définie */
function signee(A,nom){let b=null;A.forEach(d=>{if(d.k==="def")d.B.forEach(x=>{if(x.nom===nom)b=x;});});if(!b)return null;
  const e=b.e;return e.k==="annot"||(e.k==="fun"&&e.P.length>0&&e.P.every(p=>p.k==="pannot")&&e.e.k==="annot");}
const ROLE8={base:["Le cas de base",1,"valeur du cas de base"],rec:["Le cas général",1.5,"cas général d'une fonction récursive"],calc:["Le calcul",2,"résultat faux"]};
const SYMF=[["->"," -> "],["mod"," mod "],["&&"," && "],["||"," || "],["<>"," <> "],["let rec","let rec "],["[]","[]"],["::"," :: "],["|","| "],["List.hd","List.hd "],["List.tl","List.tl "],["match","match "],["with"," with"]];
const mut8=(l,nom)=>mutations(l).concat([[" > "," < "],[" >= "," <= "],[" <= "," >= "],[" - "," + "],[" *. "," +. "],[" +. "," -. "],[" / "," * "],["then -n","then n"],["max ","min "],["min ","max "],[nom+" (List.tl li)","List.hd (List.tl li)"],["then []","then [0]"],["-> l2","-> []"],["then a","then b"],["then List.hd li","then 0"]]
  .filter(([a])=>l.includes(a)).map(([a,b])=>l.replace(a,b)));
function exoFonction(F){
  const rec=F.rec?"rec ":"",mot=/ /.test(F.prm)&&F.prm[0]!=="("?"fun":"function",l0=`let ${rec}${F.nom} : ${F.sig} =`;
  const tete=l0.length>40?[`let ${rec}${F.nom} :`,`  ${F.sig} =`]:[l0],H=tete.concat([`  ${mot} ${F.prm} ->`]),L=H.concat(F.corps),def=L.join("\n");
  const S=ML.session();if(S.lis(def).some(x=>x.faute))throw new Error("définition fausse : "+def);
  if(ecrisType(S.type(F.nom))!==F.sig)throw new Error("signature annoncée fausse : "+def);
  const estBase=F.base||(()=>false),args=[...new Set(F.tests)],tests=args.filter(estBase).concat(args.filter(a=>!estBase(a))),nb=args.filter(estBase).length;
  const essais=tests.map(a=>F.nom+" "+a),res=essais.map(x=>{const r=S.lis(x)[0];if(r.faute||r.exc)throw new Error("essai impossible : "+x);return r;}),att=res.map(r=>r.ecrit);
  const autres=(F.alt||[]).map(a=>tete.join("\n")+"\n"+a);
  autres.forEach(a=>{if(!essaieCode(a,essais,att).ok)throw new Error("autre écriture fausse : "+a);});
  const n0=H.length,pas=F.pas.map(([role,[a,b],why,label,pts])=>({role,a:a+n0,b:b+n0,why,label:label||ROLE8[role][0],pts:pts||ROLE8[role][1]}));
  const E=[{w:`Le début, avec la signature&nbsp;:${bloc(H.join("\n"))}`,why:`${F.pq}${F.rec?` Le mot ${c("rec")} est obligatoire : la fonction s'appelle elle-même.`:""} Puis ${c(mot+" "+F.prm+" ->")} nomme ${mot==="fun"?"les paramètres":/^\(/.test(F.prm)?"les deux éléments du couple":"le paramètre"}.`,pts:1}]
    .concat(pas.map(p=>({w:p.b>p.a?`${p.label}&nbsp;:${bloc(L.slice(p.a,p.b+1).map(l=>l.slice(2)).join("\n"))}`:`${p.label}&nbsp;: <b>${c(L[p.a].trim())}</b>`,why:p.why,pts:p.pts})));
  const etapeDe=role=>{const k=pas.findIndex(p=>p.role===role);return 1+(k<0?0:k);},iBase=etapeDe("base"),iGen=F.rec?etapeDe("rec"):etapeDe("calc");
  const lieu=(t,f)=>f.p==null?"":`${/\n/.test(t)?`Ligne ${t.slice(0,f.p).split("\n").length}, à `:"À "}${c(f.extrait||"la fin")}&nbsp;: `;
  function juge(rep){const t=normalise(rep.f||"").trim();
    if(!t)return {incomplet:`Écris la fonction ${c(F.nom)} en entier, avec sa signature.`};
    const faux=(etape,type,titre,msg,resume)=>({ok:false,faux:["f"],resume:resume||"Pas tout à fait : ta fonction ne fait pas ce que demande l'énoncé.",diag:etape==null?{type,titre,msg}:{etape,type,titre,msg}});
    const S2=ML.session(),D=S2.lis(t),f=D.find(x=>x.faute);
    if(f&&f.faute==="syntaxe"){if(/^(==|!=)$/.test(f.extrait||""))return {incomplet:esc(f.msg)};
      return faux(null,"fonction mal écrite (syntaxe)","Où ça part : OCaml ne peut pas lire ta fonction.",lieu(t,f)+esc(f.msg),"Pas tout à fait : telle qu'elle est écrite, OCaml ne peut pas lire ta fonction.");}
    if(f&&f.faute==="type")return faux(null,/let rec/.test(f.msg)?"rec oublié":"erreur de type dans la fonction écrite","Où ça part : une erreur de type.",lieu(t,f)+esc(f.msg),"Pas tout à fait : OCaml refuse ta fonction, à cause d'une erreur de type.");
    if(f)return faux(null,"erreur à l'exécution","Où ça part : une erreur dès la définition.",esc(f.msg));
    const A=ML.analyse(t,"prog").arbre,signe=signee(A,F.nom);
    if(signe===null)return {incomplet:`Ta réponse doit définir une fonction nommée ${c(F.nom)}, comme dans l'énoncé.`};
    if(!signe)return {incomplet:`Il manque la signature de ${c(F.nom)}, que l'énoncé demande. Elle s'écrit dans la définition, juste après le nom : ${c(`let ${rec}${F.nom} : … = …`)}, avec le type à la place des premiers points.`};
    if(F.sans){const o=emploie(A,F.sans);if(o)return {incomplet:`L'énoncé demande d'écrire ${c(F.nom)} sans l'opérateur ${c(o)}.`};}
    if(F.rec){const M=modList(A);
      if(M.length)return {incomplet:`L'énoncé demande d'écrire la récursivité toi-même, sans ${et(M.map(c))}. Du module List, seules ${c("List.hd")} et ${c("List.tl")} sont permises ; le filtrage aussi.`};
      if(!recursif(A))return {incomplet:`L'énoncé demande une fonction <b>récursive</b> : ${c(F.nom)} doit s'appeler elle-même, avec ${c("let rec")}.`};}
    const typeMoi=ecrisType(S2.type(F.nom)),signature=x=>faux(0,"signature fausse","Où ça part : la signature.",`Ta fonction a le type ${c(typeMoi)}, alors que l'énoncé demande ${c(F.sig)}. Du coup, ${c(x)} ne donne pas une valeur du bon type.`);
    let premier=null,justes=0;
    for(let k=0;k<essais.length;k++){const x=essais[k],r=S2.lis(x)[0];
      if(r.faute&&!r.exc&&!r.boucle&&!/s'arrête pas/.test(r.msg))return signature(x);
      const v=r.faute&&!r.exc?"boucle":r.exc?"exception "+r.ecritExc:r.ecrit;
      if(v===att[k]){justes++;continue;}
      if(v!=="boucle"&&!r.exc&&r.type!==res[k].type)return signature(x);
      if(!premier)premier={k,x,v};}
    if(!premier)return {ok:true};
    const {k,x,v}=premier,i=k<nb?iBase:iGen,bilan=justes?` Sur les ${essais.length} entrées essayées, ${justes>1?justes+" donnent":"une seule donne"} le bon résultat.`:` Aucune des ${essais.length} entrées essayées ne donne le bon résultat.`;
    if(v==="boucle")return faux(F.rec?etapeDe("rec"):i,"appel récursif qui ne raccourcit pas l'entrée","Où ça part : la fonction ne s'arrête pas.",`Sur ${c(x)}, le calcul ne s'arrête pas. Soit le cas de base manque ou n'est jamais atteint, soit l'appel récursif ne se fait pas sur une entrée plus petite.`);
    if(/^exception/.test(v))return faux(i,"exception levée par la fonction écrite","Où ça part : une exception.",`Sur ${c(x)}, ta version lève ${c(v.slice(10).replace(/^Match_failure.*/,"Match_failure"))}.${/Match_failure/.test(v)?" Ton filtrage ne prévoit pas ce cas : il manque une branche.":/Division_by_zero/.test(v)?" Une division ou un mod par 0 n'a pas de sens : regarde ce que vaut le diviseur sur cette entrée.":/"(hd|tl)"/.test(v)?` ${c("List.hd")} et ${c("List.tl")} n'ont pas de sens sur la liste vide : le test du cas de base doit passer avant.`:""}`);
    return faux(i,ROLE8[k<nb&&F.rec?"base":F.rec?"rec":"calc"][2],"Où ça part : une valeur fausse.",`Sur ${c(x)}, ta version renvoie ${c(v)} au lieu de ${c(att[k])}.${bilan}`);}
  let fausse=null;
  for(const p of pas.slice().reverse()){for(let i=p.b;i>=p.a&&!fausse;i--)for(const m of mut8(L[i],F.nom)){const L2=L.slice();L2[i]=m;const j=juge({f:L2.join("\n")});
      if(j.ok===false&&j.diag&&j.diag.etape>=0&&/renvoie/.test(j.diag.msg)){fausse=L2.join("\n");break;}}if(fausse)break;}
  if(!fausse)return null;
  const exemples=(F.ex||(nb?[nb,nb+1,0]:[0,1,2])).map(a=>{const i=typeof a==="string"?tests.indexOf(a):a;if(!(i>=0)||!essais[i])throw new Error("exemple absent des essais : "+F.nom+" "+a);return [essais[i],att[i]];});
  const ocaml=[def].concat(autres).flatMap(code=>essais.map((x,k)=>({code:code+" in "+x,attendu:"T:"+res[k].type+"|V:"+att[k]})));
  return {sig:"F"+def.replace(/\s+/g," "),code:def,
    q:`Définis en OCaml la fonction ${F.rec?"<b>récursive</b> ":""}${c(F.nom)}, ${F.dit}. Exemples : ${exemples.map(([x,v])=>`${c(x)} vaut ${c(v)}`).join(" ; ")}. Écris sa signature dans la définition.${F.liste?` Du module List, tu peux utiliser ${c("List.hd")} et ${c("List.tl")}, et aucune autre fonction ; le filtrage est permis.`:""}`,
    corps:"",texte:`Écrire la fonction ${F.nom} : ${F.sig}, ${F.dit}`,
    champs:[{k:"code",id:"f",nom:"fonction",label:`La fonction ${c(F.nom)}, avec sa signature&nbsp;:`,lignes:Math.max(6,L.length+2),sym:symDe(SYMF,F.sym||[])}],juge,etapes:E,
    bonne:bloc(def),bonneTxt:finLigne(def),repBonne:{f:def},repFausse:{f:fausse},nature:F.nature,
    ens:{code:def,nom:F.nom,type:F.sig,rec:!!F.rec,essais,att,nb,exemples,autres,ocaml}};}
const PAIRES=[["4","6"],["3","7"],["4","3"],["0","0"],["0","1"],["1","0"],["1","1"],["7","2"],["10","10"],["9","12"],["12","9"],["5","5"],["8","2"],["2","3"],["13","1"],["6","7"],["20","40"],["15","16"],["100","1"],["33","77"],["2","10"],["9","3"],["12","4"],["7","7"]];
const DEUX=PAIRES.map(x=>x.join(" ")),COUPLES=PAIRES.map(x=>`(${x.join(", ")})`);
const DIVIS=["12 4","12 5","0 3","7 7","7 1","9 3","10 4","100 10","15 5","14 7","1 2","2 1","36 6","36 8","45 9","45 7","8 8","64 16","30 12","21 3","5 10","6 4"];
const TRIPLES=["1 2 3","3 2 1","2 3 1","5 5 5","4 4 1","1 4 4","4 1 4","0 0 7","9 0 0","0 9 0","10 20 15","20 10 15","15 20 10","7 7 8","8 7 7","7 8 7","100 99 98","3 9 6","6 3 9","9 6 3","2 2 1","1 2 2","0 0 0","7 7 7"];
const RELATIFS=["(-5)","0","3","(-1)","1","12","(-12)","7","(-7)","100","(-100)","25","(-25)","9","(-9)","48","(-48)","2","(-2)","60","(-60)"];
const NATURELS=["0","1","2","3","5","6","7","9","10","12","14","15","18","20","21","25","27","30","35","45","49","63","100","105"];
const NB=["123","9999","7","0","3","10","12","99","100","111","405","999","1000","1011","2026","5008","7777","12345","70707","31","58","301","864","1111"];
const P=(role,a,b,why,label,pts)=>[role,[a,b],why,label,pts];
const sigCouple=(nom,ex,t,res)=>`Les exemples écrivent ${c(nom+" "+ex)}, avec une virgule entre parenthèses : la fonction reçoit un seul argument, un couple, de type ${c(t)}. Elle rend ${res}.`;
const sigSuite=(nom,ex,n,res)=>`Les exemples écrivent ${c(nom+" "+ex)}, sans virgule : la fonction reçoit ${n} arguments l'un après l'autre, d'où ${n} flèches avant le résultat. Elle rend ${res}.`;
const SANS1=[
 R=>{const meme=R()<0.5,cp=R()<0.5,nom=meme?"memeParite":"pariteOpposee",op=meme?"=":"<>";
  return {nom,sig:cp?"int * int -> bool":"int -> int -> bool",prm:cp?"(a, b)":"a b",nature:"test",
   dit:`qui teste si deux entiers naturels${cp?", donnés dans un couple,":""} ${meme?"ont la même parité, c'est-à-dire s'ils sont tous les deux pairs ou tous les deux impairs":"sont de parités opposées, c'est-à-dire si l'un est pair et l'autre impair"}`,
   pq:cp?sigCouple(nom,"(4, 6)","int * int","un bool"):sigSuite(nom,"4 6","deux","un bool"),corps:[`  a mod 2 ${op} b mod 2`],
   pas:[P("calc",0,0,`${c("a mod 2")} est le reste de a dans la division par 2 : 0 si a est pair, 1 sinon. Deux entiers ${meme?"ont la même parité quand ces deux restes sont égaux":"sont de parités opposées quand ces deux restes sont différents"}. La comparaison donne déjà un bool : pas besoin de ${c("if")}.`)],
   tests:cp?COUPLES:DEUX,alt:[`  ${cp?"function (a, b)":"fun a b"} ->\n  (a + b) mod 2 ${op} 0`]};},
 R=>R()<0.5?{nom:"estMultiple",sig:"int -> int -> bool",prm:"a b",nature:"test",dit:"qui teste si l'entier naturel a est un multiple de l'entier naturel b (b n'est pas nul)",pq:sigSuite("estMultiple","12 4","deux","un bool"),corps:["  a mod b = 0"],
   pas:[P("calc",0,0,`a est un multiple de b quand la division de a par b tombe juste : le reste ${c("a mod b")} vaut 0.`)],tests:DIVIS,alt:["  fun a b ->\n  if a mod b = 0 then true else false"]}
  :{nom:"divise",sig:"int -> int -> bool",prm:"d n",nature:"test",dit:"qui teste si l'entier naturel d (qui n'est pas nul) divise l'entier naturel n",pq:sigSuite("divise","4 12","deux","un bool"),corps:["  n mod d = 0"],
   pas:[P("calc",0,0,`d divise n quand la division de n par d tombe juste : le reste ${c("n mod d")} vaut 0. Attention à l'ordre : c'est n qu'on divise par d.`)],tests:DIVIS.map(x=>x.split(" ").reverse().join(" ")),alt:["  fun d n ->\n  if n mod d = 0 then true else false"]},
 R=>{const k=R.choix([3,5,7,9]),nom="multipleDe"+k;return {nom,sig:"int -> bool",prm:"n",nature:"test",dit:`qui teste si un entier naturel est un multiple de ${k}`,pq:"Un entier en entrée, un bool en sortie.",corps:[`  n mod ${k} = 0`],
   pas:[P("calc",0,0,`n est un multiple de ${k} quand le reste de sa division par ${k} vaut 0. La comparaison donne déjà un bool.`)],tests:NATURELS,ex:[String(k*3),k===5?"12":"10","0"]};},
 R=>{const grand=R()<0.5,nom=grand?"maxi":"mini";return {nom,sig:"int -> int -> int",prm:"a b",nature:"si-sinon",dit:`qui rend le plus ${grand?"grand":"petit"} de deux entiers`,pq:sigSuite(nom,"4 6","deux","un int"),corps:[`  if a ${grand?">":"<"} b then a else b`],
   pas:[P("calc",0,0,`On compare les deux entiers et on rend ${grand?"le plus grand":"le plus petit"}. Quand ils sont égaux, on rend b, qui a la même valeur.`)],tests:DEUX,alt:[`  fun a b -> ${grand?"max":"min"} a b`]};},
 R=>{const grand=R()<0.5,nom=grand?"maxi3":"mini3",o=grand?">=":"<=";return {nom,sig:"int -> int -> int -> int",prm:"a b c",nature:"si-sinon",dit:`qui rend le plus ${grand?"grand":"petit"} de trois entiers`,pq:sigSuite(nom,"1 2 3","trois","un int"),
   corps:[`  if a ${o} b && a ${o} c then a`,`  else if b ${o} c then b`,"  else c"],
   pas:[P("calc",0,2,`D'abord a : c'est lui si rien ne le dépasse. Sinon a est éliminé, et il reste à comparer b et c.`)],tests:TRIPLES,ex:["1 2 3","4 4 1","10 20 15"],alt:[`  fun a b c -> ${grand?"max":"min"} a (${grand?"max":"min"} b c)`]};},
 R=>R()<0.5?{nom:"valAbs",sig:"int -> int",prm:"n",nature:"si-sinon",dit:"qui calcule la valeur absolue d'un entier relatif : l'entier lui-même s'il est positif ou nul, son opposé sinon",pq:"Un entier en entrée, un entier en sortie.",corps:["  if n < 0 then -n else n"],
   pas:[P("calc",0,0,`Pour un entier négatif, l'opposé ${c("-n")} est positif. Sinon, on rend n tel quel.`)],tests:RELATIFS,alt:["  function n -> abs n"]}
  :{nom:"ecart",sig:"int -> int -> int",prm:"a b",nature:"si-sinon",dit:"qui calcule l'écart entre deux entiers naturels, c'est-à-dire le plus grand moins le plus petit",pq:sigSuite("ecart","4 6","deux","un int"),corps:["  if a > b then a - b else b - a"],
   pas:[P("calc",0,0,"On soustrait toujours le plus petit au plus grand : le résultat n'est jamais négatif.")],tests:DEUX,alt:["  fun a b -> abs (a - b)","  fun a b -> max a b - min a b"]},
 R=>({nom:"signe",sig:"int -> int",prm:"n",nature:"si-sinon",dit:"qui rend le signe d'un entier relatif : 1 s'il est strictement positif, −1 s'il est strictement négatif, 0 s'il est nul",pq:"Un entier en entrée, un entier en sortie.",
   corps:["  if n > 0 then 1","  else if n < 0 then -1","  else 0"],pas:[P("calc",0,2,`Trois cas, donc deux tests : le dernier ${c("else")} récupère le seul cas qui reste, n = 0.`)],tests:RELATIFS,ex:["(-5)","3","0"]}),
 R=>{const large=R()<0.5,o=large?"<=":"<";return {nom:large?"entre":"strictEntre",sig:"int -> int -> int -> bool",prm:"a b x",nature:"test",
   dit:`qui teste si l'entier x est compris entre les entiers a et b, ${large?"au sens large (a ≤ x et x ≤ b)":"au sens strict (a < x et x < b)"}`,pq:sigSuite(large?"entre":"strictEntre","1 5 3","trois","un bool"),corps:[`  a ${o} x && x ${o} b`],
   pas:[P("calc",0,0,`Il faut deux comparaisons reliées par ${c("&&")}. Écrire ${c(`a ${o} x ${o} b`)} ne marche pas en OCaml : ${c(`a ${o} x`)} est un bool, qu'on ne peut pas comparer à l'entier b.`)],
   tests:["1 5 3","1 5 1","1 5 5","1 5 0","1 5 6","0 0 0","2 9 9","2 9 10","2 9 2","2 9 1","10 20 15","10 20 25","10 20 5","10 20 10","10 20 20","3 4 3","3 4 4","3 4 5","0 100 50","0 100 101","7 7 7","7 7 8"],ex:["1 5 3","1 5 5","1 5 6"]};},
 R=>{const k=R.ent(0,2),nom=["unites","dizaines","centaines"][k];return {nom,sig:"int -> int",prm:"n",nature:"calcul",dit:`qui rend le chiffre des ${["unités","dizaines","centaines"][k]} d'un entier naturel`,pq:"Un entier en entrée, un entier (un chiffre) en sortie.",
   corps:[["  n mod 10","  n / 10 mod 10","  n / 100 mod 10"][k]],
   pas:[P("calc",0,0,k?`${c("n / "+10**k)} enlève ${k>1?"les deux derniers chiffres":"le dernier chiffre"} (division entière), puis ${c("mod 10")} garde le dernier chiffre de ce qui reste.`:`Le reste de la division par 10 est le dernier chiffre.`)],
   tests:NB,ex:["2026","405","7"],alt:k?[`  function n -> (n / ${10**k}) mod 10`]:["  function n -> n - 10 * (n / 10)"]};},
 R=>({nom:"bissextile",sig:"int -> bool",prm:"a",nature:"test",dit:"qui teste si une année est bissextile : elle est divisible par 4 mais pas par 100, ou bien elle est divisible par 400",pq:"Une année (un entier) en entrée, un bool en sortie.",
   corps:["  (a mod 4 = 0 && a mod 100 <> 0)","  || a mod 400 = 0"],pas:[P("calc",0,1,`On traduit la phrase mot à mot : « et » devient ${c("&&")}, « ou » devient ${c("||")}, « n'est pas divisible par 100 » devient ${c("a mod 100 <> 0")}.`)],
   tests:["2024","2025","1900","2000","2026","2028","2100","2400","1996","1999","2004","2023","1600","1700","1800","2200","2020","2012","2019","2001","1904","2096"],ex:["2024","1900","2000"]}),
 R=>{const k=R.ent(0,2);return [
   {nom:"moyenne",nature:"calcul",sig:"float -> float -> float",prm:"a b",dit:"qui calcule la moyenne de deux nombres réels",pq:sigSuite("moyenne","1. 2.","deux","un float : avec des nombres à virgule, tout est en float"),corps:["  (a +. b) /. 2."],
    pas:[P("calc",0,0,`Sur les float, les opérateurs prennent un point : ${c("+.")} et ${c("/.")}. Et le nombre 2 s'écrit ${c("2.")}, sinon OCaml refuse le mélange d'un int et d'un float.`)],
    tests:["1. 2.","3. 3.","0. 0.","10. 20.","1.5 2.5","12. 8.","0.5 0.25","7. 8.","2.5 3.","100. 50.","4. 0.","9. 1.","0.25 0.75","15. 12.","6.5 6.5","20. 19.","3. 4.","11. 14.","8. 8.5","1. 0."]},
   {nom:"aire",nature:"calcul",sig:"float * float -> float",prm:"(l, h)",dit:"qui calcule l'aire d'un rectangle dont la longueur et la largeur, deux nombres réels, sont données dans un couple",pq:sigCouple("aire","(2., 3.)","float * float","un float"),corps:["  l *. h"],
    pas:[P("calc",0,0,`L'aire est le produit des deux côtés. Sur les float, la multiplication s'écrit ${c("*.")}, avec un point.`)],
    tests:["(2., 3.)","(1.5, 2.)","(0., 5.)","(4., 4.)","(10., 0.5)","(2.5, 2.5)","(1., 1.)","(8., 0.25)","(3., 7.)","(6., 1.5)","(12., 10.)","(0.5, 0.5)","(9., 2.)","(5., 5.)","(7., 0.)","(20., 3.)","(1.25, 4.)","(16., 0.75)","(3.5, 2.)","(11., 11.)"]},
   {nom:"perimetre",nature:"calcul",sig:"float * float -> float",prm:"(l, h)",dit:"qui calcule le périmètre d'un rectangle dont la longueur et la largeur, deux nombres réels, sont données dans un couple",pq:sigCouple("perimetre","(2., 3.)","float * float","un float"),corps:["  2. *. (l +. h)"],
    pas:[P("calc",0,0,`Le périmètre vaut deux fois la somme des côtés. Sur les float : ${c("*.")} et ${c("+.")}, et 2 s'écrit ${c("2.")}.`)],
    tests:["(2., 3.)","(1.5, 2.)","(0., 5.)","(4., 4.)","(10., 0.5)","(2.5, 2.5)","(1., 1.)","(8., 0.25)","(3., 7.)","(6., 1.5)","(12., 10.)","(0.5, 0.5)","(9., 2.)","(5., 5.)","(7., 0.)","(20., 3.)","(1.25, 4.)","(16., 0.75)","(3.5, 2.)","(11., 11.)"],alt:["  function (l, h) -> l +. h +. l +. h"]}][k];},
 R=>{const [A,B]=R.choix([[6,18],[4,12],[8,16]]),[p1,p2]=R.choix([[5,9],[4,7]]);return {nom:"tarif",sig:"int -> int",prm:"age",nature:"si-sinon",
   dit:`qui calcule le prix d'une entrée, en euros, selon l'âge de la personne : gratuit avant ${A} ans, ${p1} euros de ${A} à ${B-1} ans, ${p2} euros à partir de ${B} ans`,pq:"Un âge (un entier) en entrée, un prix (un entier) en sortie.",
   corps:[`  if age < ${A} then 0`,`  else if age < ${B} then ${p1}`,`  else ${p2}`],
   pas:[P("calc",0,2,`Les tests se suivent du plus jeune au plus âgé. Quand on arrive au deuxième test, on sait déjà que l'âge vaut au moins ${A} : inutile de le redire.`)],
   tests:["0","3","4","5","6","7","8","10","11","12","13","15","16","17","18","19","25","40","65","1","9","14"],ex:[String(A-1),String(A),String(B)]};},
 R=>{const k=R.ent(0,2);return [
   {nom:"ordonne",sig:"int * int -> int * int",prm:"(a, b)",nature:"si-sinon",dit:"qui, étant donné un couple d'entiers, rend le couple des deux mêmes entiers rangés dans l'ordre croissant",pq:sigCouple("ordonne","(4, 3)","int * int","aussi un couple d'entiers"),corps:["  if a <= b then (a, b) else (b, a)"],
    pas:[P("calc",0,0,"Si les deux entiers sont déjà dans l'ordre, on rend le couple tel quel ; sinon, on les échange.")],tests:COUPLES,ex:["(4, 3)","(3, 7)","(5, 5)"],alt:["  function (a, b) -> (min a b, max a b)"]},
   {nom:"sommeProduit",sig:"int -> int -> int * int",prm:"a b",nature:"calcul",dit:"qui, étant donnés deux entiers, rend le couple formé de leur somme et de leur produit",pq:sigSuite("sommeProduit","4 6","deux","un couple d'entiers, de type "+c("int * int")),corps:["  (a + b, a * b)"],
    pas:[P("calc",0,0,"Un couple s'écrit entre parenthèses, avec une virgule : la somme d'abord, le produit ensuite, comme le demande l'énoncé.")],tests:DEUX},
   {nom:"division",sig:"int -> int -> int * int",prm:"a b",nature:"calcul",dit:"qui, étant donnés deux entiers naturels a et b (b n'est pas nul), rend le couple formé du quotient et du reste de la division de a par b",pq:sigSuite("division","12 5","deux","un couple d'entiers, de type "+c("int * int")),corps:["  (a / b, a mod b)"],
    pas:[P("calc",0,0,`Sur les int, ${c("/")} donne le quotient de la division entière et ${c("mod")} son reste.`)],tests:DIVIS,ex:["12 5","45 7","5 10"]}][k];},
 R=>({nom:"estTriangle",sig:"int -> int -> int -> bool",prm:"a b c",nature:"test",dit:"qui teste si trois longueurs entières peuvent être les côtés d'un triangle : chacune doit être strictement plus petite que la somme des deux autres",pq:sigSuite("estTriangle","3 4 5","trois","un bool"),
   corps:["  a < b + c && b < a + c","  && c < a + b"],pas:[P("calc",0,1,`Trois conditions, une par côté, reliées par ${c("&&")} : il les faut toutes.`)],
   tests:["3 4 5","1 2 3","5 5 9","1 1 1","2 3 1","3 1 2","5 5 10","5 10 5","10 5 5","2 2 3","7 3 3","3 7 3","3 3 7","6 8 10","1 1 2","4 4 7","9 2 8","2 9 8","8 2 9","10 1 1","0 0 0","5 12 13"]}),
 R=>({nom:"tousEgaux",sig:"int -> int -> int -> bool",prm:"a b c",nature:"test",dit:"qui teste si trois entiers sont tous égaux",pq:sigSuite("tousEgaux","5 5 5","trois","un bool"),corps:["  a = b && b = c"],
   pas:[P("calc",0,0,`Deux comparaisons reliées par ${c("&&")}. Écrire ${c("a = b = c")} ne marche pas : ${c("a = b")} est un bool, qu'on ne peut pas comparer à l'entier c.`)],tests:TRIPLES,ex:["5 5 5","4 4 1","1 2 3"]}),
 R=>({nom:"secondes",sig:"int -> int -> int -> int",prm:"h m s",nature:"calcul",dit:"qui convertit en secondes une durée donnée par trois entiers naturels : des heures, des minutes et des secondes",pq:sigSuite("secondes","1 1 1","trois","un int"),corps:["  h * 3600 + m * 60 + s"],
   pas:[P("calc",0,0,"Une heure fait 3600 secondes et une minute 60. La multiplication passe avant l'addition : pas besoin de parenthèses.")],
   tests:["1 1 1","2 30 0","0 0 59","0 0 0","0 1 0","1 0 0","0 45 15","10 0 0","23 59 59","3 5 7","0 10 30","5 0 5","1 30 30","12 12 12","0 59 59","7 0 0","0 2 2","4 20 0","6 6 6","8 15 45"]})
];
const u1=a=>/^\d$/.test(a);
const RECENT8=[
 R=>({nom:"sommeChiffres",sig:"int -> int",prm:"n",nature:"chiffres",dit:"qui calcule la somme des chiffres de l'écriture décimale d'un entier naturel",pq:"Un entier en entrée, un entier en sortie.",
   corps:["  if n < 10 then n","  else n mod 10 + sommeChiffres (n / 10)"],base:u1,
   pas:[P("base",0,0,"Un nombre à un seul chiffre : la somme de ses chiffres, c'est lui-même."),P("rec",1,1,`${c("n mod 10")} est le dernier chiffre, et ${c("n / 10")} est le nombre sans son dernier chiffre : on ajoute le dernier chiffre à la somme des chiffres du reste.`)],
   tests:NB,ex:["123","9999","7"],alt:["  function n ->\n  if n = 0 then 0\n  else n mod 10 + sommeChiffres (n / 10)"]}),
 R=>({nom:"nbChiffres",sig:"int -> int",prm:"n",nature:"chiffres",dit:"qui calcule le nombre de chiffres de l'écriture décimale d'un entier naturel",pq:"Un entier en entrée, un entier en sortie.",
   corps:["  if n < 10 then 1","  else 1 + nbChiffres (n / 10)"],base:u1,
   pas:[P("base",0,0,"En dessous de 10, le nombre s'écrit avec un seul chiffre (0 aussi)."),P("rec",1,1,`${c("n / 10")} est le nombre sans son dernier chiffre : il a un chiffre de moins que n. On compte donc 1 de plus que lui.`)],
   tests:NB,ex:["123","9999","7"],alt:["  function n ->\n  if n / 10 = 0 then 1\n  else 1 + nbChiffres (n / 10)"]}),
 R=>{const k=R.choix([1,2,3,5,7,9]),a=k%9+1,nom=k===1?"queDesUn":"queDes"+k;return {nom,sig:"int -> bool",prm:"n",nature:"chiffres",dit:`qui teste si l'écriture décimale d'un entier naturel n'est composée que du chiffre ${k}`,pq:"Un entier en entrée, un bool en sortie.",
   corps:[`  if n < 10 then n = ${k}`,`  else n mod 10 = ${k}`,`    && ${nom} (n / 10)`],base:u1,
   pas:[P("base",0,0,`Un seul chiffre : il doit valoir ${k}. La comparaison donne directement le bool.`),P("rec",1,2,`Le dernier chiffre (${c("n mod 10")}) doit valoir ${k}, et le reste du nombre (${c("n / 10")}) ne doit avoir que des ${k} lui aussi.`)],
   tests:[`${k}${k}${k}${k}`,`${k}${k}0`,`${k}`,"0",`${a}`,"8",`${k}${k}`,`${k}${k}${k}`,`${k}0`,`${a}${k}`,`${k}${a}`,`${k}${k}${a}${k}`,`${k}0${k}`,"10","99","123","1000","42",`${k}${k}${k}${k}${k}`,`${a}${k}${k}${k}`,`${k}${k}${k}${a}`,"606"],ex:[`${k}${k}${k}${k}`,`${k}`,`${k}${k}0`],alt:[`  function n ->\n  if n < 10 then n = ${k}\n  else if n mod 10 = ${k} then ${nom} (n / 10)\n  else false`]};},
 R=>{const k=R.choix([3,5,7,9]),a=k%9+1,nom="contient"+k;return {nom,sig:"int -> bool",prm:"n",nature:"chiffres",dit:`qui teste si le chiffre ${k} apparaît dans l'écriture décimale d'un entier naturel`,pq:"Un entier en entrée, un bool en sortie.",
   corps:[`  if n < 10 then n = ${k}`,`  else n mod 10 = ${k}`,`    || ${nom} (n / 10)`],base:u1,
   pas:[P("base",0,0,`Un seul chiffre : la réponse est oui quand c'est ${k}.`),P("rec",1,2,`Le chiffre ${k} apparaît s'il est le dernier chiffre (${c("n mod 10")}), ou s'il apparaît dans le reste du nombre (${c("n / 10")}).`)],
   tests:[`1${k}2`,"1024",`${k}`,"0",`${a}`,"8",`${k}${k}`,`${k}0`,`${a}${k}`,`${k}${a}`,"10","246","1000","42",`20${k}6`,`${k}000`,`111${k}`,"1111","8642","60",`${a}${a}${k}${a}`,"2468"],ex:[`1${k}2`,"1024",`${k}`],alt:[`  function n ->\n  if n mod 10 = ${k} then true\n  else if n < 10 then false\n  else ${nom} (n / 10)`]};},
 R=>({nom:"maxChiffre",sig:"int -> int",prm:"n",nature:"chiffres",dit:"qui rend le plus grand chiffre de l'écriture décimale d'un entier naturel",pq:"Un entier en entrée, un entier (un chiffre) en sortie.",
   corps:["  if n < 10 then n","  else max (n mod 10)","    (maxChiffre (n / 10))"],base:u1,
   pas:[P("base",0,0,"Un seul chiffre : c'est lui le plus grand."),P("rec",1,2,`Le plus grand chiffre est soit le dernier (${c("n mod 10")}), soit le plus grand chiffre du reste du nombre : ${c("max")} garde le plus grand des deux.`)],
   tests:NB,ex:["405","2026","7"],alt:["  function n ->\n  if n < 10 then n\n  else if n mod 10 > maxChiffre (n / 10) then n mod 10\n  else maxChiffre (n / 10)"]}),
 R=>({nom:"factorielle",sig:"int -> int",prm:"n",nature:"compte à rebours",dit:"qui calcule la factorielle d'un entier naturel n, c'est-à-dire le produit 1 × 2 × … × n (elle vaut 1 pour n = 0)",pq:"Un entier en entrée, un entier en sortie.",
   corps:["  if n = 0 then 1","  else n * factorielle (n - 1)"],base:a=>a==="0",
   pas:[P("base",0,0,"La factorielle de 0 vaut 1 : 1 ne change pas un produit."),P("rec",1,1,"Le produit 1 × 2 × … × n, c'est n fois le produit 1 × 2 × … × (n − 1). L'appel récursif se fait sur n − 1, qui se rapproche de 0.")],
   tests:[..."0123456789"].concat(["10","11","12","13","14","15","16","17","18"]),ex:["4","6","0"],alt:["  function\n  | 0 -> 1\n  | n -> n * factorielle (n - 1)"]}),
 R=>{const carre=R()<0.5,nom=carre?"sommeCarres":"sommeEntiers";return {nom,sig:"int -> int",prm:"n",nature:"compte à rebours",
   dit:carre?"qui calcule la somme des carrés des entiers de 0 à n, c'est-à-dire 0² + 1² + 2² + … + n², pour un entier naturel n":"qui calcule la somme des entiers de 0 à n, c'est-à-dire 0 + 1 + 2 + … + n, pour un entier naturel n",pq:"Un entier en entrée, un entier en sortie.",
   corps:["  if n = 0 then 0",`  else ${carre?"n * n":"n"} + ${nom} (n - 1)`],base:a=>a==="0",
   pas:[P("base",0,0,"Pour n = 0, la somme n'a qu'un terme, 0."),P("rec",1,1,`La somme jusqu'à n, c'est ${carre?"n²":"n"} plus la somme jusqu'à n − 1. L'appel récursif se fait sur n − 1, qui se rapproche de 0.`)],
   tests:[..."0123456789"].concat(["10","11","12","13","14","15","16","17","18","19","20","50","100"]),ex:["4","10","0"],alt:[`  function\n  | 0 -> 0\n  | n -> ${carre?"n * n":"n"} + ${nom} (n - 1)`]};},
 R=>{const k=R.choix([0,2,3]);return k?{nom:"puissance"+k,sig:"int -> int",prm:"n",nature:"compte à rebours",dit:`qui calcule ${k} à la puissance n, pour un entier naturel n (${k} à la puissance 0 vaut 1)`,pq:"Un entier en entrée, un entier en sortie.",
   corps:["  if n = 0 then 1",`  else ${k} * puissance${k} (n - 1)`],base:a=>a==="0",
   pas:[P("base",0,0,"Un nombre à la puissance 0 vaut 1."),P("rec",1,1,`${k} à la puissance n, c'est ${k} fois ${k} à la puissance n − 1.`)],
   tests:[..."0123456789"].concat(["10","11","12","13","14","15","16","17","18","19","20"]),ex:["3","10","0"],alt:[`  function\n  | 0 -> 1\n  | n -> ${k} * puissance${k} (n - 1)`]}
  :{nom:"puissance",sig:"int -> int -> int",prm:"x n",nature:"compte à rebours",dit:"qui calcule x à la puissance n, pour deux entiers naturels x et n (x à la puissance 0 vaut 1)",pq:sigSuite("puissance","2 10","deux","un int"),
   corps:["  if n = 0 then 1","  else x * puissance x (n - 1)"],base:a=>/ 0$/.test(a),
   pas:[P("base",0,0,"Un nombre à la puissance 0 vaut 1."),P("rec",1,1,"x à la puissance n, c'est x fois x à la puissance n − 1. Seul n diminue : x est redonné tel quel à l'appel récursif.")],
   tests:["2 10","3 4","2 0","3 0","9 0","0 0","2 1","5 3","10 6","1 20","0 5","7 2","2 16","4 5","6 1","3 10","2 20","11 2","12 3","5 5"],ex:["2 10","3 4","2 0"],alt:["  fun x n ->\n  match n with\n  | 0 -> 1\n  | _ -> x * puissance x (n - 1)"]};},
 R=>({nom:"mult",sig:"int -> int -> int",prm:"a b",nature:"compte à rebours",dit:"qui calcule le produit de deux entiers naturels a et b avec des additions seulement, sans utiliser l'opérateur de multiplication",pq:sigSuite("mult","4 6","deux","un int"),sans:["*"],
   corps:["  if b = 0 then 0","  else a + mult a (b - 1)"],base:a=>/ 0$/.test(a),
   pas:[P("base",0,0,"a fois 0 vaut 0."),P("rec",1,1,"a × b, c'est a + a × (b − 1) : on ajoute a une fois, et il reste b − 1 additions à faire. Seul b diminue.")],
   tests:DEUX,ex:["4 6","7 2","0 0"],alt:["  fun a b ->\n  if a = 0 then 0\n  else b + mult (a - 1) b"]}),
 R=>{const k=R.ent(0,2),nom=["sommeDiv","nbDiv","prodDiv"][k],quoi=["la somme","le nombre","le produit"][k],plus=["i +","1 +","i *"][k];return {nom,sig:"int -> int -> int",prm:"n i",nature:"diviseurs",
   dit:`qui, étant donnés deux entiers naturels non nuls n et i, calcule ${quoi} des diviseurs de n inférieurs ou égaux à i`,pq:sigSuite(nom,"12 5","deux","un int"),
   corps:[`  if i = 0 then ${k===2?1:0}`,"  else if n mod i = 0",`  then ${plus} ${nom} n (i - 1)`,`  else ${nom} n (i - 1)`],base:a=>/ 1$/.test(a),
   pas:[P("base",0,0,k===2?"Plus aucun candidat à essayer : le produit de rien du tout vaut 1, qui ne change pas un produit.":`Plus aucun candidat à essayer : ${k?"on a compté 0 diviseur":"la somme vaut 0"}. On peut aussi s'arrêter à i = 1, qui divise toujours n.`),
    P("rec",1,2,`i divise n (le reste ${c("n mod i")} est nul) : on ${k===1?"compte 1 pour lui":k?"multiplie par i":"ajoute i"}, puis on continue avec les candidats jusqu'à i − 1.`,"Le cas général, quand i divise n"),
    P("rec",3,3,"i ne divise pas n : on ne fait rien pour lui, et on continue avec i − 1. Dans les deux cas, seul i diminue.","Le cas général, sinon",1)],
   tests:["12 5","45 7","12 1","1 1","12 12","7 7","7 6","10 10","10 4","36 36","36 6","30 15","9 3","9 9","16 8","16 16","28 14","28 28","100 10","13 13","6 2","20 20"],ex:["12 5","45 7","12 1"],alt:[`  fun n i ->\n  if i = 1 then 1\n  else if n mod i = 0 then ${plus} ${nom} n (i - 1)\n  else ${nom} n (i - 1)`]};},
 R=>({nom:"pgcd",sig:"int -> int -> int",prm:"a b",nature:"diviseurs",dit:"qui calcule le plus grand diviseur commun de deux entiers naturels a et b par l'algorithme d'Euclide : le pgcd de a et de 0 est a ; sinon, le pgcd de a et de b est le pgcd de b et du reste de la division de a par b",pq:sigSuite("pgcd","12 8","deux","un int"),
   corps:["  if b = 0 then a","  else pgcd b (a mod b)"],base:a=>/ 0$/.test(a),
   pas:[P("base",0,0,"C'est la première règle de l'énoncé : le pgcd de a et de 0 est a."),P("rec",1,1,`La deuxième règle, mot à mot : on recommence avec b, et le reste ${c("a mod b")}. Ce reste est plus petit que b, donc le deuxième argument diminue jusqu'à 0.`)],
   tests:["12 8","100 75","7 0","0 7","25 0","8 12","17 5","9 3","3 9","1 1","48 36","36 48","13 13","21 14","14 21","1000 10","35 64","81 27","6 4","30 12","45 10","2 2"],ex:["12 8","100 75","7 0"],alt:["  fun a b ->\n  match b with\n  | 0 -> a\n  | _ -> pgcd b (a mod b)"]}),
 R=>{const k=R.choix([2,3]),nom="puissanceDe"+k;return {nom,sig:"int -> bool",prm:"n",nature:"diviseurs",dit:`qui teste si un entier naturel non nul est une puissance de ${k}, c'est-à-dire un des nombres 1, ${k}, ${k*k}, ${k**3}, ${k**4}, et ainsi de suite`,pq:"Un entier en entrée, un bool en sortie.",
   corps:["  if n = 1 then true",`  else n mod ${k} = 0`,`    && ${nom} (n / ${k})`],base:a=>a==="1",
   pas:[P("base",0,0,`1 est une puissance de ${k} : c'est ${k} à la puissance 0.`),P("rec",1,2,`Un nombre plus grand que 1 est une puissance de ${k} quand il est divisible par ${k} et que son quotient par ${k} est encore une puissance de ${k}. Quand il n'est pas divisible, ${c("&&")} s'arrête tout de suite sur false.`)],
   tests:[String(k**4),String(k**4+k),"1","2","3","4","5","6","7","8","9","10","12","16","18","24","27","32","64","81","100","243","1024"],ex:[String(k**4),String(k**4+k),"1"],alt:[`  function n ->\n  if n = 1 then true\n  else if n mod ${k} <> 0 then false\n  else ${nom} (n / ${k})`]};},
 R=>{const [a,k,b]=R.choix([[2,3,1],[1,2,3],[0,2,1],[3,2,5],[1,3,2],[5,2,1]]);return {nom:"u",sig:"int -> int",prm:"n",nature:"compte à rebours",
   dit:`qui calcule le terme de rang n de la suite définie par u₀ = ${a} et, pour tout entier n ≥ 1, uₙ = ${k} × uₙ₋₁ + ${b}`,pq:"Un rang (un entier) en entrée, un terme (un entier) en sortie.",
   corps:[`  if n = 0 then ${a}`,`  else ${k} * u (n - 1) + ${b}`],base:x=>x==="0",
   pas:[P("base",0,0,`C'est le premier terme, donné par l'énoncé : u₀ = ${a}.`),P("rec",1,1,`La formule de l'énoncé, mot à mot : le terme précédent est ${c("u (n - 1)")}, avec des parenthèses autour de n − 1.`)],
   tests:[..."0123456789"].concat(["10","11","12","13","14","15"]),ex:["1","3","0"],alt:[`  function\n  | 0 -> ${a}\n  | n -> ${k} * u (n - 1) + ${b}`]};},
 R=>({nom:"fibo",sig:"int -> int",prm:"n",nature:"compte à rebours",dit:"qui calcule le terme de rang n de la suite de Fibonacci : les deux premiers termes, de rangs 0 et 1, valent 0 et 1, puis chaque terme est la somme des deux précédents",pq:"Un rang (un entier) en entrée, un terme (un entier) en sortie.",
   corps:["  if n < 2 then n","  else fibo (n - 1) + fibo (n - 2)"],base:a=>a==="0"||a==="1",
   pas:[P("base",0,0,"Deux cas de base en un seul test : le terme de rang 0 vaut 0 et celui de rang 1 vaut 1, donc le terme vaut n."),P("rec",1,1,"La somme des deux termes précédents : deux appels récursifs, sur n − 1 et sur n − 2. Il faut donc deux cas de base.")],
   tests:[..."0123456789"].concat(["10","11","12","13","14","15"]),ex:["6","10","1"],alt:["  function\n  | 0 -> 0\n  | 1 -> 1\n  | n -> fibo (n - 1) + fibo (n - 2)"]})
];
const LB=["[6; 9; 5]","[5]","[]","[0]","[2; 4]","[1; 3]","[3; 3]","[1; 2; 3]","[4; 0; 7]","[2; 2; 2]","[7; 2; 9; 4]","[1; 2; 3; 4; 5]","[9; 8; 7; 6]","[2; 3; 2; 4]","[10; 20; 30]","[0; 1; 0; 1]","[5; 5; 1; 5]","[8; 1; 6; 3; 2]","[3; 1; 4; 1; 5; 9]","[12; 7; 15]","[1; 1; 2; 3; 5; 8]","[4; 4; 9; 9; 4]","[11; 2; 13; 4; 6]","[100; 1]"];
const LF=["[1.5; 2.; 0.5]","[4.]","[]","[0.]","[2.; 2.]","[10.; 0.25]","[1.; 2.; 3.; 4.]","[0.5; 0.5; 0.5; 0.5]","[12.; 7.5]","[3.; 0.; 3.]","[8.; 4.; 2.; 1.; 0.5]","[100.; 0.75]","[6.5]","[1.25; 1.25]","[9.; 9.; 9.]","[20.; 15.5; 4.5]","[0.; 0.]","[7.; 1.; 0.5]","[2.5; 2.5; 5.]","[16.; 8.]"];
const vide8=a=>a==="[]",seul=a=>!/;/.test(a);
const tete8=t=>t.replace(/x/g,"List.hd li");
const compte8=(nom,dit,test,si,sinon,ex)=>({nom,ex,sig:"int list -> int",prm:"li",nature:"compter",dit,pq:"Une liste d'entiers en entrée, un entier en sortie.",
  corps:["  if li = [] then 0",`  else if ${tete8(test)}`,`  then 1 + ${nom} (List.tl li)`,`  else ${nom} (List.tl li)`],base:vide8,
  pas:[P("base",0,0,"La liste vide n'a aucun élément, donc aucun à compter."),P("rec",1,2,si+" On compte 1, plus ceux de la queue.","Le cas général, quand la tête compte"),P("rec",3,3,sinon+" On ne compte rien pour elle, et on continue avec la queue.","Le cas général, sinon",1)],
  tests:LB,alt:[`  function\n  | [] -> 0\n  | x :: r ->\n    if ${test} then 1 + ${nom} r\n    else ${nom} r`]});
const filtre8=(nom,dit,test,si,ex)=>({nom,ex,sig:"int list -> int list",prm:"li",nature:"filtrer",dit,pq:"Une liste d'entiers en entrée, une liste d'entiers en sortie.",
  corps:["  if li = [] then []",`  else if ${tete8(test)}`,"  then List.hd li",`    :: ${nom} (List.tl li)`,`  else ${nom} (List.tl li)`],base:vide8,
  pas:[P("base",0,0,"Rien à garder dans la liste vide : le résultat est la liste vide."),P("rec",1,3,si+` On la garde : elle passe devant le résultat de l'appel sur la queue, avec ${c("::")}.`,"Le cas général, quand on garde la tête"),P("rec",4,4,"Sinon, la tête n'est pas gardée : le résultat est celui de la queue, tout seul.","Le cas général, sinon",1)],
  tests:LB,alt:[`  function\n  | [] -> []\n  | x :: r ->\n    if ${test} then x :: ${nom} r\n    else ${nom} r`]});
const transforme8=(nom,dit,calcul,why)=>({nom,sig:"int list -> int list",prm:"li",nature:"transformer",dit,pq:"Une liste d'entiers en entrée, une liste d'entiers en sortie.",
  corps:["  if li = [] then []",`  else (${tete8(calcul)})`,`    :: ${nom} (List.tl li)`],base:vide8,
  pas:[P("base",0,0,"Rien à transformer : la liste vide donne la liste vide."),P("rec",1,2,why+` Le nouvel élément passe devant le résultat de l'appel sur la queue, avec ${c("::")}.`)],
  tests:LB,alt:[`  function\n  | [] -> []\n  | x :: r -> (${calcul}) :: ${nom} r`]});
const tous8=(nom,dit,test,tous,why,ex)=>({nom,ex,sig:"int list -> bool",prm:"li",nature:"tester",dit,pq:"Une liste d'entiers en entrée, un bool en sortie.",
  corps:[`  if li = [] then ${tous}`,`  else ${tete8(test)}`,`    ${tous?"&&":"||"} ${nom} (List.tl li)`],base:vide8,
  pas:[P("base",0,0,tous?"Dans la liste vide, aucun élément ne contredit la propriété : la réponse est true.":"Dans la liste vide, il n'y a aucun élément : la réponse est false."),P("rec",1,2,why)],
  tests:LB,alt:[`  function\n  | [] -> ${tous}\n  | x :: r -> ${test} ${tous?"&&":"||"} ${nom} r`]});
const LISTE8=[
 R=>({nom:"somElem",sig:"int list -> int",prm:"li",nature:"accumuler",dit:"qui calcule la somme des éléments d'une liste d'entiers",pq:"Une liste d'entiers en entrée, un entier en sortie.",
   corps:["  if li = [] then 0","  else List.hd li + somElem (List.tl li)"],base:vide8,
   pas:[P("base",0,0,"La somme d'une liste vide vaut 0 : 0 ne change pas une somme."),P("rec",1,1,`La somme, c'est le premier élément (${c("List.hd li")}) plus la somme des autres. L'appel récursif se fait sur la queue, ${c("List.tl li")}, qui est plus courte.`)],
   tests:LB,alt:["  function\n  | [] -> 0\n  | x :: r -> x + somElem r","  fun li ->\n  match li with\n  | [] -> 0\n  | x :: r -> x + somElem r"]}),
 R=>({nom:"longueur",sig:"int list -> int",prm:"li",nature:"accumuler",dit:"qui calcule le nombre d'éléments d'une liste d'entiers",pq:"Une liste d'entiers en entrée, un entier en sortie.",
   corps:["  if li = [] then 0","  else 1 + longueur (List.tl li)"],base:vide8,
   pas:[P("base",0,0,"La liste vide n'a aucun élément."),P("rec",1,1,"Un élément de plus que la queue : on compte 1 pour la tête, sans regarder sa valeur.")],
   tests:LB,alt:["  function\n  | [] -> 0\n  | _ :: r -> 1 + longueur r"]}),
 R=>({nom:"produit",sig:"int list -> int",prm:"li",nature:"accumuler",dit:"qui calcule le produit des éléments d'une liste d'entiers (le produit de la liste vide vaut 1)",pq:"Une liste d'entiers en entrée, un entier en sortie.",
   corps:["  if li = [] then 1","  else List.hd li * produit (List.tl li)"],base:vide8,
   pas:[P("base",0,0,"Le produit d'une liste vide vaut 1 : 1 ne change pas un produit. Avec 0, tous les produits vaudraient 0."),P("rec",1,1,"Le produit, c'est le premier élément fois le produit des autres.")],
   tests:LB,alt:["  function\n  | [] -> 1\n  | x :: r -> x * produit r"]}),
 R=>{const k=R.ent(0,4);return [
   compte8("nbPairs","qui calcule le nombre d'éléments pairs d'une liste d'entiers","x mod 2 = 0","La tête est paire : son reste dans la division par 2 est nul.","La tête est impaire."),
   compte8("nbImpairs","qui calcule le nombre d'éléments impairs d'une liste d'entiers naturels","x mod 2 = 1","La tête est impaire : son reste dans la division par 2 vaut 1.","La tête est paire."),
   compte8("nbMultiples3","qui calcule le nombre d'éléments d'une liste d'entiers qui sont des multiples de 3","x mod 3 = 0","La tête est un multiple de 3 : son reste dans la division par 3 est nul.","La tête n'est pas un multiple de 3."),
   compte8("nbGrands","qui calcule le nombre d'éléments d'une liste d'entiers qui sont strictement supérieurs à 4","x > 4","La tête est strictement supérieure à 4.","La tête vaut 4 ou moins."),
   compte8("nbZeros","qui calcule le nombre d'éléments nuls d'une liste d'entiers","x = 0","La tête vaut 0.","La tête n'est pas nulle.",["[0; 1; 0; 1]","[4; 0; 7]","[]"])][k];},
 R=>{const pair=R()<0.5,nom=pair?"somPairs":"somImpairs";return {nom,sig:"int list -> int",prm:"li",nature:"accumuler",dit:`qui calcule la somme des éléments ${pair?"pairs":"impairs"} d'une liste d'entiers naturels`,pq:"Une liste d'entiers en entrée, un entier en sortie.",
   corps:["  if li = [] then 0",`  else if List.hd li mod 2 = ${pair?0:1}`,"  then List.hd li",`    + ${nom} (List.tl li)`,`  else ${nom} (List.tl li)`],base:vide8,
   pas:[P("base",0,0,"Rien à ajouter dans la liste vide : la somme vaut 0."),P("rec",1,3,`La tête est ${pair?"paire":"impaire"} : on l'ajoute à la somme calculée sur la queue.`,"Le cas général, quand la tête compte"),P("rec",4,4,`La tête est ${pair?"impaire":"paire"} : on ne l'ajoute pas, la somme est celle de la queue.`,"Le cas général, sinon",1)],
   tests:LB,alt:[`  function\n  | [] -> 0\n  | x :: r ->\n    if x mod 2 = ${pair?0:1} then x + ${nom} r\n    else ${nom} r`]};},
 R=>{const grand=R()<0.5,nom=grand?"maxListe":"minListe",f=grand?"max":"min";return {nom,sig:"int list -> int",prm:"li",nature:"accumuler",dit:`qui rend le plus ${grand?"grand":"petit"} élément d'une liste d'entiers non vide`,pq:"Une liste d'entiers en entrée, un entier en sortie.",
   corps:["  if List.tl li = [] then List.hd li",`  else ${f} (List.hd li)`,`    (${nom} (List.tl li))`],base:seul,
   pas:[P("base",0,0,`La fonction n'est pas définie sur la liste vide : le cas de base est la liste à un seul élément, celle dont la queue est vide. Son plus ${grand?"grand":"petit"} élément, c'est lui.`),P("rec",1,2,`Le plus ${grand?"grand":"petit"} élément est soit la tête, soit le plus ${grand?"grand":"petit"} de la queue : ${c(f)} garde le bon des deux.`)],
   tests:LB.filter(a=>a!=="[]"),ex:["[6; 9; 5]","[7; 2; 9; 4]","[5]"],alt:[`  function\n  | [x] -> x\n  | x :: r -> ${f} x (${nom} r)\n  | [] -> failwith "liste vide"`,`  function li ->\n  if List.tl li = [] then List.hd li\n  else if List.hd li ${grand?">":"<"} ${nom} (List.tl li) then List.hd li\n  else ${nom} (List.tl li)`]};},
 R=>{const k=R.ent(0,3);return [
   filtre8("pairs","qui rend la liste des éléments pairs d'une liste d'entiers, dans le même ordre","x mod 2 = 0","La tête est paire."),
   filtre8("impairs","qui rend la liste des éléments impairs d'une liste d'entiers naturels, dans le même ordre","x mod 2 = 1","La tête est impaire."),
   filtre8("grands","qui rend la liste des éléments strictement supérieurs à 3 d'une liste d'entiers, dans le même ordre","x > 3","La tête est strictement supérieure à 3.",["[1; 2; 3; 4; 5]","[7; 2; 9; 4]","[]"]),
   filtre8("nonNuls","qui rend la liste des éléments non nuls d'une liste d'entiers, dans le même ordre","x <> 0","La tête n'est pas nulle.",["[4; 0; 7]","[0; 1; 0; 1]","[]"])][k];},
 R=>{const k=R.ent(0,4);return [
   transforme8("ajout1","qui rend la liste où 1 est ajouté à chaque élément d'une liste d'entiers","x + 1","On ajoute 1 à la tête."),
   transforme8("ajout5","qui rend la liste où 5 est ajouté à chaque élément d'une liste d'entiers","x + 5","On ajoute 5 à la tête."),
   transforme8("doubles","qui rend la liste des doubles des éléments d'une liste d'entiers","2 * x","On multiplie la tête par 2."),
   transforme8("carres","qui rend la liste des carrés des éléments d'une liste d'entiers","x * x","Le carré de la tête, c'est la tête fois elle-même."),
   transforme8("restes","qui rend la liste des restes dans la division par 3 des éléments d'une liste d'entiers naturels","x mod 3",`Le reste de la tête dans la division par 3 s'écrit avec ${c("mod")}.`)][k];},
 R=>{const k=R.ent(0,3);return [
   tous8("tousPairs","qui teste si tous les éléments d'une liste d'entiers sont pairs (c'est vrai pour la liste vide)","x mod 2 = 0",true,`Tous les éléments sont pairs quand la tête est paire et que tous ceux de la queue le sont aussi : ${c("&&")}.`,["[2; 4]","[6; 9; 5]","[]"]),
   tous8("tousNonNuls","qui teste si aucun élément d'une liste d'entiers n'est nul (c'est vrai pour la liste vide)","x <> 0",true,`Aucun élément n'est nul quand la tête n'est pas nulle et qu'aucun de la queue ne l'est : ${c("&&")}.`,["[6; 9; 5]","[4; 0; 7]","[]"]),
   tous8("existePair","qui teste si une liste d'entiers contient au moins un élément pair","x mod 2 = 0",false,`Il y a un élément pair quand la tête est paire, ou qu'il y en a un dans la queue : ${c("||")}.`,["[6; 9; 5]","[1; 3]","[]"]),
   tous8("existeNul","qui teste si une liste d'entiers contient au moins un élément nul","x = 0",false,`Il y a un élément nul quand la tête vaut 0, ou qu'il y en a un dans la queue : ${c("||")}.`,["[4; 0; 7]","[6; 9; 5]","[]"])][k];},
 R=>({nom:"dernier",sig:"int list -> int",prm:"li",nature:"parcourir",dit:"qui rend le dernier élément d'une liste d'entiers non vide",pq:"Une liste d'entiers en entrée, un entier en sortie.",
   corps:["  if List.tl li = [] then List.hd li","  else dernier (List.tl li)"],base:seul,
   pas:[P("base",0,0,"Une liste à un seul élément (sa queue est vide) : cet élément est le dernier."),P("rec",1,1,"Sinon, le dernier élément de la liste est le dernier de sa queue : la tête ne sert pas.")],
   tests:LB.filter(a=>a!=="[]"),ex:["[6; 9; 5]","[7; 2; 9; 4]","[5]"],alt:['  function\n  | [x] -> x\n  | _ :: r -> dernier r\n  | [] -> failwith "liste vide"']}),
 R=>({nom:"total",sig:"float list -> float",prm:"li",nature:"accumuler",dit:"qui calcule la somme des éléments d'une liste de nombres réels (de type float list)",pq:"Une liste de float en entrée, un float en sortie.",
   corps:["  if li = [] then 0.","  else List.hd li +. total (List.tl li)"],base:vide8,
   pas:[P("base",0,0,`La somme d'une liste vide vaut zéro, mais le résultat est un float : il s'écrit ${c("0.")}, avec le point.`),P("rec",1,1,`La tête plus la somme de la queue. Sur les float, l'addition s'écrit ${c("+.")}.`)],
   tests:LF,alt:["  function\n  | [] -> 0.\n  | x :: r -> x +. total r"]}),
 R=>({nom:"miroir",sig:"int list -> int list",prm:"li",nature:"transformer",dit:"qui rend la liste des éléments d'une liste d'entiers dans l'ordre inverse",pq:"Une liste d'entiers en entrée, une liste d'entiers en sortie.",
   corps:["  if li = [] then []","  else miroir (List.tl li)","    @ [List.hd li]"],base:vide8,
   pas:[P("base",0,0,"La liste vide à l'envers reste la liste vide."),P("rec",1,2,`On retourne la queue, puis on met la tête tout au bout. ${c("@")} colle deux listes : la tête doit donc être mise dans une liste à un élément, ${c("[List.hd li]")}.`)],
   tests:LB,ex:["[6; 9; 5]","[1; 2; 3; 4; 5]","[]"],alt:["  function\n  | [] -> []\n  | x :: r -> miroir r @ [x]"]})
];
const LN=["[3; 2; 4] 0","[3; 2; 4] 2","[3; 2; 4] 5","[3; 2; 4] 1","[3; 2; 4] 3","[] 0","[] 3","[7] 0","[7] 1","[7] 2","[1; 2; 3; 4; 5] 2","[1; 2; 3; 4; 5] 4","[1; 2; 3; 4; 5] 5","[1; 2; 3; 4; 5] 9","[9; 9] 1","[9; 9] 2","[0; 1] 1","[5; 6; 7; 8] 3","[5; 6; 7; 8] 0","[5; 6; 7; 8] 4","[2; 4; 6; 8; 10; 12] 3","[2; 4; 6; 8; 10; 12] 6"];
const XL=["2 [2; 3; 2; 4]","5 [1; 3; 5; 7]","2 []","2 [2]","2 [3]","2 [2; 2; 2]","1 [1; 3; 5; 7]","7 [1; 3; 5; 7]","4 [1; 3; 5; 7]","0 [0; 1; 0; 1]","1 [0; 1; 0; 1]","9 [9; 8; 9]","8 [9; 8; 9]","3 [3; 3; 4; 3; 3]","4 [3; 3; 4; 3; 3]","6 [5; 6]","5 [5; 6]","2 [1; 2; 3; 2; 1; 2]","1 [1; 2; 3; 2; 1; 2]","3 [1; 2; 3; 2; 1; 2]"];
const L2=["[1; 2; 3] [10; 20; 30]","[5] [7]","[] []","[0; 0] [4; 9]","[1; 1; 1; 1] [1; 1; 1; 1]","[2; 4] [6; 8]","[9; 8; 7] [1; 2; 3]","[3] [0]","[10; 20] [30; 40]","[1; 2; 3; 4; 5] [5; 4; 3; 2; 1]","[7; 7] [7; 7]","[0] [0]","[6; 1; 6] [1; 6; 1]","[12; 13] [8; 7]","[2; 2; 2] [3; 3; 3]","[4; 5; 6; 7] [0; 1; 0; 1]","[100] [1]","[8; 6; 4; 2] [1; 3; 5; 7]","[15; 25] [5; 5]","[1; 0; 1; 0; 1] [0; 1; 0; 1; 0]"];
const CC8=[
 R=>({nom:"prefLong",sig:"int list -> int -> int list",prm:"li n",nature:"deux arguments",liste:true,dit:"qui, étant donnés une liste d'entiers li et un entier naturel n, calcule le préfixe de longueur n de li, c'est-à-dire la liste de ses n premiers éléments ; quand li a moins de n éléments, le résultat est li",pq:sigSuite("prefLong","[3; 2; 4] 2","deux","une liste d'entiers"),
   corps:["  match li with","  | [] -> []","  | x :: r ->","    if n = 0 then []","    else x :: prefLong r (n - 1)"],base:a=>/^\[\] | 0$/.test(a),
   pas:[P("base",0,1,"La liste est finie : il n'y a plus rien à prendre, quel que soit n."),P("rec",2,4,"Deuxième cas de base : si n vaut 0, on a pris assez d'éléments. Sinon on garde la tête x, et il reste n − 1 éléments à prendre dans la queue : les deux arguments diminuent ensemble.","Le cas général (liste non vide)",2)],
   tests:LN,ex:["[3; 2; 4] 2","[3; 2; 4] 5","[3; 2; 4] 0"],alt:["  fun li n ->\n  if li = [] || n = 0 then []\n  else List.hd li :: prefLong (List.tl li) (n - 1)"]}),
 R=>({nom:"oterPremiers",sig:"int list -> int -> int list",prm:"li n",nature:"deux arguments",liste:true,dit:"qui, étant donnés une liste d'entiers li et un entier naturel n, calcule la liste li privée de ses n premiers éléments ; quand li a moins de n éléments, le résultat est la liste vide",pq:sigSuite("oterPremiers","[3; 2; 4] 2","deux","une liste d'entiers"),
   corps:["  match li with","  | [] -> []","  | _ :: r ->","    if n = 0 then li","    else oterPremiers r (n - 1)"],base:a=>/^\[\] | 0$/.test(a),
   pas:[P("base",0,1,"La liste est finie : il ne reste rien, même s'il fallait encore enlever des éléments."),P("rec",2,4,"Deuxième cas de base : si n vaut 0, il n'y a plus rien à enlever, on rend la liste entière. Sinon on enlève la tête (elle ne sert pas, d'où _) et il reste n − 1 éléments à enlever dans la queue.","Le cas général (liste non vide)",2)],
   tests:LN,ex:["[3; 2; 4] 2","[3; 2; 4] 5","[3; 2; 4] 0"],alt:["  fun li n ->\n  if li = [] || n = 0 then li\n  else oterPremiers (List.tl li) (n - 1)"]}),
 R=>({nom:"supprimer_elem",sig:"int -> int list -> int list",prm:"e li",nature:"deux arguments",liste:true,dit:"qui, étant donnés un entier e et une liste d'entiers li, calcule la liste li où toutes les occurrences de e ont été supprimées",pq:sigSuite("supprimer_elem","2 [2; 3; 2; 4]","deux","une liste d'entiers"),
   corps:["  match li with","  | [] -> []","  | x :: r ->","    if x = e then supprimer_elem e r","    else x :: supprimer_elem e r"],base:a=>/\[\]$/.test(a),
   pas:[P("base",0,1,"Rien à supprimer dans la liste vide."),P("rec",2,4,"Si la tête vaut e, on ne la remet pas devant : le résultat est celui de la queue. Sinon on la garde devant. Dans les deux cas, e est redonné tel quel à l'appel récursif.","Le cas général (liste non vide)",2)],
   tests:XL,alt:["  fun e li ->\n  if li = [] then []\n  else if List.hd li = e then supprimer_elem e (List.tl li)\n  else List.hd li :: supprimer_elem e (List.tl li)","  fun e -> function\n  | [] -> []\n  | x :: r when x = e -> supprimer_elem e r\n  | x :: r -> x :: supprimer_elem e r"]}),
 R=>({nom:"incr_list",sig:"int list -> bool list -> int list",prm:"li lb",nature:"deux listes",liste:true,dit:"qui, étant données une liste d'entiers li et une liste de booléens lb de mêmes longueurs, rend la liste li où l'élément d'indice k est augmenté de 1 quand l'élément d'indice k de lb vaut true, et reste inchangé sinon",pq:sigSuite("incr_list","[1; 2] [true; false]","deux","une liste d'entiers"),
   corps:["  match li, lb with","  | x :: r, b :: s ->","    (if b then x + 1 else x)","    :: incr_list r s","  | _ -> []"],base:a=>/^\[\] /.test(a),
   pas:[P("rec",0,3,`On avance dans les deux listes en même temps : x va avec b, et l'appel récursif reçoit les deux queues. Le ${c("if")} entre parenthèses choisit la valeur à mettre devant.`,"Le cas général (deux listes non vides)",2),P("base",4,4,"Les deux listes ont la même longueur : quand l'une est vide, l'autre aussi, et le résultat est la liste vide.")],
   tests:["[1; 2; 3; 4; 5] [true; false; false; true; true]","[1; 2] [true; false]","[] []","[7] [true]","[7] [false]","[1; 2] [true; true]","[1; 2] [false; false]","[1; 2] [false; true]","[0; 0; 0] [true; false; true]","[9; 8; 7] [false; true; false]","[5; 5; 5; 5] [true; true; true; true]","[5; 5; 5; 5] [false; false; false; false]","[3; 1; 4] [true; true; false]","[10; 20] [false; true]","[2; 4; 6; 8] [true; false; true; false]","[2; 4; 6; 8] [false; true; false; true]","[1] [true]","[6; 5; 4; 3; 2; 1] [true; true; false; false; true; false]","[99] [true]","[0] [false]"],
   alt:["  fun li lb ->\n  if li = [] then []\n  else (if List.hd lb then List.hd li + 1 else List.hd li)\n    :: incr_list (List.tl li) (List.tl lb)"]}),
 R=>({nom:"appartient",sig:"int -> int list -> bool",prm:"x li",nature:"deux arguments",liste:true,dit:"qui teste si un entier x est un élément d'une liste d'entiers li",pq:sigSuite("appartient","5 [1; 3; 5; 7]","deux","un bool"),
   corps:["  match li with","  | [] -> false","  | y :: r -> y = x || appartient x r"],base:a=>/\[\]$/.test(a),
   pas:[P("base",0,1,"Rien n'appartient à la liste vide."),P("rec",2,2,`x est dans la liste s'il est égal à la tête, ou s'il est dans la queue. Quand la tête convient, ${c("||")} ne regarde même pas la suite.`)],
   tests:XL,ex:["5 [1; 3; 5; 7]","4 [1; 3; 5; 7]","2 []"],alt:["  fun x li ->\n  if li = [] then false\n  else List.hd li = x || appartient x (List.tl li)","  fun x li ->\n  match li with\n  | [] -> false\n  | t :: _ when t = x -> true\n  | _ :: q -> appartient x q"]}),
 R=>({nom:"nbOcc",sig:"int -> int list -> int",prm:"x li",nature:"deux arguments",liste:true,dit:"qui calcule le nombre d'occurrences d'un entier x dans une liste d'entiers li, c'est-à-dire le nombre de fois où x apparaît dans li",pq:sigSuite("nbOcc","2 [2; 3; 2; 4]","deux","un int"),
   corps:["  match li with","  | [] -> 0","  | y :: r ->","    if y = x then 1 + nbOcc x r","    else nbOcc x r"],base:a=>/\[\]$/.test(a),
   pas:[P("base",0,1,"x n'apparaît jamais dans la liste vide."),P("rec",2,4,"Si la tête vaut x, on compte 1, plus les apparitions dans la queue. Sinon, on ne compte rien pour elle.","Le cas général (liste non vide)",2)],
   tests:XL,alt:["  fun x li ->\n  if li = [] then 0\n  else if List.hd li = x then 1 + nbOcc x (List.tl li)\n  else nbOcc x (List.tl li)"]}),
 R=>({nom:"nieme",sig:"int list -> int -> int",prm:"li n",nature:"deux arguments",liste:true,dit:"qui rend l'élément d'indice n d'une liste d'entiers li, le premier élément ayant l'indice 0 ; on suppose que la liste a plus de n éléments",pq:sigSuite("nieme","[5; 6; 7] 2","deux","un int"),
   corps:["  if n = 0 then List.hd li","  else nieme (List.tl li) (n - 1)"],base:a=>/ 0$/.test(a),
   pas:[P("base",0,0,"L'élément d'indice 0, c'est la tête."),P("rec",1,1,"L'élément d'indice n de la liste est l'élément d'indice n − 1 de sa queue : les deux arguments diminuent ensemble.")],
   tests:["[5; 6; 7] 2","[5; 6; 7] 1","[5; 6; 7] 0","[4] 0","[1; 2] 0","[1; 2] 1","[9; 8; 7; 6; 5] 0","[9; 8; 7; 6; 5] 2","[9; 8; 7; 6; 5] 4","[0; 0; 1] 2","[0; 0; 1] 1","[3; 1; 4; 1; 5; 9] 5","[3; 1; 4; 1; 5; 9] 3","[3; 1; 4; 1; 5; 9] 1","[10; 20; 30; 40] 3","[10; 20; 30; 40] 2","[10; 20; 30; 40] 0","[2; 2] 1","[7; 8; 9] 1","[6; 5] 0"],ex:["[5; 6; 7] 2","[5; 6; 7] 1","[5; 6; 7] 0"],
   alt:['  fun li n ->\n  match li with\n  | [] -> failwith "trop court"\n  | x :: r -> if n = 0 then x else nieme r (n - 1)']}),
 R=>({nom:"insere",sig:"int -> int list -> int list",prm:"x li",nature:"deux arguments",liste:true,dit:"qui insère un entier x à sa place dans une liste d'entiers li triée dans l'ordre croissant : le résultat contient x et tous les éléments de li, et il est encore trié",pq:sigSuite("insere","3 [1; 2; 4; 5]","deux","une liste d'entiers"),
   corps:["  match li with","  | [] -> [x]","  | y :: r ->","    if x <= y then x :: li","    else y :: insere x r"],base:a=>/\[\]$/.test(a),
   pas:[P("base",0,1,"Dans la liste vide, x est tout seul : le résultat est la liste à un élément [x]."),P("rec",2,4,"Si x est plus petit que la tête (ou égal), sa place est tout devant : on le met devant la liste entière, et c'est fini. Sinon la tête reste devant, et x s'insère dans la queue.","Le cas général (liste non vide)",2)],
   tests:["3 [1; 2; 4; 5]","0 [1; 2; 4; 5]","1 []","9 [1; 2; 4; 5]","5 [5]","4 [5]","6 [5]","2 [1; 3]","2 [2; 2]","7 [1; 3; 5; 7; 9]","8 [1; 3; 5; 7; 9]","10 [1; 3; 5; 7; 9]","1 [1; 3; 5; 7; 9]","0 [0; 0]","5 [1; 9]","3 [3; 3; 3]","4 [1; 2; 3]","2 [1; 2; 3]","6 [2; 4; 6; 8]","5 [2; 4; 6; 8]"],
   alt:["  fun x li ->\n  if li = [] then [x]\n  else if x <= List.hd li then x :: li\n  else List.hd li :: insere x (List.tl li)"]}),
 R=>({nom:"remplace",sig:"int -> int -> int list -> int list",prm:"a b li",nature:"deux arguments",liste:true,dit:"qui, étant donnés deux entiers a et b et une liste d'entiers li, rend la liste li où chaque élément égal à a est remplacé par b",pq:sigSuite("remplace","1 9 [1; 2; 1; 3]","trois","une liste d'entiers"),
   corps:["  match li with","  | [] -> []","  | x :: r ->","    (if x = a then b else x)","    :: remplace a b r"],base:a=>/\[\]$/.test(a),
   pas:[P("base",0,1,"Rien à remplacer dans la liste vide."),P("rec",2,4,`Le ${c("if")} entre parenthèses choisit l'élément à mettre devant : b quand la tête vaut a, la tête elle-même sinon. Puis on continue sur la queue, avec les mêmes a et b.`,"Le cas général (liste non vide)",2)],
   tests:["1 9 [1; 2; 1; 3]","2 0 [1; 2; 1; 3]","1 9 []","5 7 [1; 2; 1; 3]","4 4 [4; 5]","4 5 [4; 5]","5 4 [4; 5]","0 1 [0; 0; 0]","3 8 [3]","3 8 [2]","7 1 [7; 6; 7; 6; 7]","6 1 [7; 6; 7; 6; 7]","2 3 [1; 2; 3; 2; 1]","9 0 [1; 2; 3]","1 2 [1; 1; 2; 2]","2 1 [1; 1; 2; 2]","5 5 [5; 5]","8 3 [8; 9; 10]","10 3 [8; 9; 10]","0 6 [6; 0; 6]"],
   alt:["  fun a b li ->\n  if li = [] then []\n  else (if List.hd li = a then b else List.hd li)\n    :: remplace a b (List.tl li)"]}),
 R=>({nom:"somme2",sig:"int list -> int list -> int list",prm:"l1 l2",nature:"deux listes",liste:true,dit:"qui, étant données deux listes d'entiers l1 et l2 de même longueur, rend la liste des sommes terme à terme : le premier élément de l1 plus le premier de l2, puis le deuxième de l1 plus le deuxième de l2, et ainsi de suite",pq:sigSuite("somme2","[1; 2; 3] [10; 20; 30]","deux","une liste d'entiers"),
   corps:["  match l1, l2 with","  | x :: r, y :: s ->","    (x + y) :: somme2 r s","  | _ -> []"],base:a=>/^\[\] /.test(a),
   pas:[P("rec",0,2,"On avance dans les deux listes en même temps : la somme des deux têtes passe devant, et l'appel récursif reçoit les deux queues.","Le cas général (deux listes non vides)",2),P("base",3,3,"Les deux listes ont la même longueur : quand l'une est vide, l'autre aussi, et le résultat est la liste vide.")],
   tests:L2,alt:["  fun l1 l2 ->\n  if l1 = [] then []\n  else (List.hd l1 + List.hd l2)\n    :: somme2 (List.tl l1) (List.tl l2)"]}),
 R=>({nom:"conc",sig:"int list -> int list -> int list",prm:"l1 l2",nature:"deux listes",liste:true,sans:["@"],dit:"qui met bout à bout deux listes d'entiers l1 et l2 (les éléments de l1, puis ceux de l2), sans utiliser l'opérateur @",pq:sigSuite("conc","[1; 2; 3] [10; 20; 30]","deux","une liste d'entiers"),
   corps:["  match l1 with","  | [] -> l2","  | x :: r -> x :: conc r l2"],base:a=>/^\[\] /.test(a),
   pas:[P("base",0,1,"Quand l1 est vide, il ne reste que l2."),P("rec",2,2,"La tête de l1 reste devant, suivie de la queue de l1 mise bout à bout avec l2. Seule l1 diminue : l2 est redonnée telle quelle.")],
   tests:L2.concat(["[] [4; 5]","[4; 5] []","[1] [2; 3; 4]"]),ex:["[1; 2; 3] [10; 20; 30]","[5] [7]","[] [4; 5]"],alt:["  fun l1 l2 ->\n  if l1 = [] then l2\n  else List.hd l1 :: conc (List.tl l1) l2"]}),
 R=>({nom:"repete",sig:"int -> int -> int list",prm:"x n",nature:"construire",dit:"qui, étant donnés un entier x et un entier naturel n, rend la liste formée de n fois l'entier x",pq:sigSuite("repete","7 3","deux","une liste d'entiers"),
   corps:["  if n = 0 then []","  else x :: repete x (n - 1)"],base:a=>/ 0$/.test(a),
   pas:[P("base",0,0,"Zéro fois x : la liste vide."),P("rec",1,1,"Un x devant, puis la liste de n − 1 fois x. Ici la récursivité se fait sur l'entier n, pas sur une liste.")],
   tests:["7 3","0 4","7 0","5 0","0 0","3 0","7 1","1 5","9 2","4 6","2 1","3 3","8 4","6 2","1 1","12 3","10 5","11 1","2 7","9 8"],alt:["  fun x n ->\n  match n with\n  | 0 -> []\n  | _ -> x :: repete x (n - 1)"]}),
 R=>R()<0.5?{nom:"rebours",sig:"int -> int list",prm:"n",nature:"construire",dit:"qui rend la liste des entiers de n à 1, dans l'ordre décroissant, pour un entier naturel n (la liste vide pour n = 0)",pq:"Un entier en entrée, une liste d'entiers en sortie.",
   corps:["  if n = 0 then []","  else n :: rebours (n - 1)"],base:a=>a==="0",
   pas:[P("base",0,0,"Pour n = 0, il n'y a aucun entier à mettre dans la liste."),P("rec",1,1,"n est le plus grand : il passe devant la liste des entiers de n − 1 à 1.")],
   tests:[..."0123456789"].concat(["10","11","12","13","14","15","16","17","18","19","25"]),ex:["4","1","0"],alt:["  function\n  | 0 -> []\n  | n -> n :: rebours (n - 1)"]}
  :{nom:"croissant",sig:"int -> int list",prm:"n",nature:"construire",dit:"qui rend la liste des entiers de 1 à n, dans l'ordre croissant, pour un entier naturel n (la liste vide pour n = 0)",pq:"Un entier en entrée, une liste d'entiers en sortie.",
   corps:["  if n = 0 then []","  else croissant (n - 1) @ [n]"],base:a=>a==="0",
   pas:[P("base",0,0,"Pour n = 0, il n'y a aucun entier à mettre dans la liste."),P("rec",1,1,`n est le plus grand : il va tout au bout, après la liste des entiers de 1 à n − 1. ${c("@")} colle deux listes, d'où ${c("[n]")} entre crochets. Avec ${c("::")}, n se retrouverait devant.`)],
   tests:[..."0123456789"].concat(["10","11","12","13","14","15","16","17","18","19","25"]),ex:["4","1","0"],alt:["  function n ->\n  let rec aux i =\n    if i > n then [] else i :: aux (i + 1)\n  in aux 1"]},
 R=>({nom:"estTriee",sig:"int list -> bool",prm:"li",nature:"deux par deux",liste:true,dit:"qui teste si une liste d'entiers est triée dans l'ordre croissant au sens large, c'est-à-dire si chaque élément est inférieur ou égal au suivant (la liste vide et les listes à un seul élément sont triées)",pq:"Une liste d'entiers en entrée, un bool en sortie.",
   corps:["  match li with","  | x :: y :: r ->","    x <= y && estTriee (y :: r)","  | _ -> true"],base:a=>!/;/.test(a),
   pas:[P("rec",0,2,"Au moins deux éléments : les deux premiers doivent être dans l'ordre, et la liste privée de sa tête doit être triée. L'appel récursif garde y : il sera comparé à l'élément d'après.","Le cas général (au moins deux éléments)",2),P("base",3,3,"Toutes les autres listes, c'est-à-dire la liste vide et celles à un élément : elles sont triées.")],
   tests:LB,ex:["[1; 2; 3; 4; 5]","[6; 9; 5]","[5]"],alt:["  function li ->\n  if li = [] || List.tl li = [] then true\n  else List.hd li <= List.hd (List.tl li)\n    && estTriee (List.tl li)"]}),
 R=>({nom:"multiplie",sig:"int -> int list -> int list",prm:"k li",nature:"deux arguments",liste:true,dit:"qui, étant donnés un entier k et une liste d'entiers li, rend la liste où chaque élément de li est multiplié par k",pq:sigSuite("multiplie","2 [2; 3; 2; 4]","deux","une liste d'entiers"),
   corps:["  match li with","  | [] -> []","  | x :: r -> (k * x) :: multiplie k r"],base:a=>/\[\]$/.test(a),
   pas:[P("base",0,1,"Rien à multiplier dans la liste vide."),P("rec",2,2,"La tête multipliée par k passe devant le résultat de l'appel sur la queue. k est redonné tel quel à l'appel récursif.")],
   tests:XL,alt:["  fun k li ->\n  if li = [] then []\n  else (k * List.hd li) :: multiplie k (List.tl li)"]}),
 R=>({nom:"plusGrands",sig:"int -> int list -> int list",prm:"k li",nature:"deux arguments",liste:true,dit:"qui, étant donnés un entier k et une liste d'entiers li, rend la liste des éléments de li strictement supérieurs à k, dans le même ordre",pq:sigSuite("plusGrands","2 [2; 3; 2; 4]","deux","une liste d'entiers"),
   corps:["  match li with","  | [] -> []","  | x :: r ->","    if x > k then x :: plusGrands k r","    else plusGrands k r"],base:a=>/\[\]$/.test(a),
   pas:[P("base",0,1,"Rien à garder dans la liste vide."),P("rec",2,4,"Si la tête dépasse k, on la garde devant le résultat de la queue. Sinon, le résultat est celui de la queue, tout seul.","Le cas général (liste non vide)",2)],
   tests:XL,alt:["  fun k li ->\n  if li = [] then []\n  else if List.hd li > k then List.hd li :: plusGrands k (List.tl li)\n  else plusGrands k (List.tl li)"]})
];
const tireFonction=(R,B,sym,o)=>{for(;;){const e=exoFonction(Object.assign(R.choix(B)(R),{sym},o));if(e)return e;}};

G.add("pf",[
 {id:"PF1",t:"Type et valeur d'une expression",tache:"type et valeur d'une expression",th:"types",pts:3,lecons:["p-types","p-iflet"],
  paliers:[
   {t:"int, float, bool, string",cc:2,gen:R=>tireParmi(R,BASE,BASEF,0.3,{symT:ST1,symV:SV1})},
   {t:"if et let … in",cc:2,gen:R=>tireParmi(R,IFLET,IFLETF,0.28,{symT:ST1,symV:SV1})},
   {t:"listes et couples",cc:2,gen:R=>tireParmi(R,LISTES,LISTESF,0.28,{symT:ST1.concat(["list","*","(",")"]),symV:["[","]",";"].concat(SV1,["(",")"])})},
   {t:"la signature d'une fonction",cc:3,gen:signature,min:150},
   {t:"fun, fonctions en argument, 'a",cc:3,gen:R=>tireParmi(R,SUP,SUPF,0.2,{fun:true,symT:["int","bool","string","list","->","*","'a","(",")"],symV:["[","]",";","true","false",'"',"(",")","<fun>"]}),min:150}]},
 {id:"PF2",t:"Que renvoie cette fonction ?",tache:"que renvoie cette fonction",th:"rec",pts:7,lecons:["p-fonctions","p-rec","p-listes"],apres:["PF1"],
  paliers:[
   {t:"fonction sans récursivité",cc:2,gen:R=>tireRenvoie(R,SANSREC,"sans récursivité",["[","]",";","true","false",'"',".","(",")"])},
   {t:"récursivité sur un entier : chiffres, diviseurs",cc:3,gen:R=>tireRenvoie(R,RECENT,"entier",["true","false"])},
   {t:"récursivité sur une liste",cc:3,gen:R=>tireRenvoie(R,RECLI,"liste",["[","]",";","true","false"])},
   {t:"match et accumulateur",cc:3,gen:R=>tireRenvoie(R,MATCHACC,"match",["[","]",";"])},
   {t:"List.map, List.filter, List.fold_left",cc:3,gen:R=>tireRenvoie(R,ITER,"itérateur",["[","]",";","true","false"])}]},
 {id:"PF3",t:"Compléter la ligne effacée",tache:"compléter la ligne effacée",th:"listes",pts:7,lecons:["p-rec","p-listes","p-schema"],apres:["PF2"],
  paliers:[
   {t:"le cas de base",cc:2,min:30,gen:R=>tireLigne(R,FL,["base"],["[]","List.hd","List.tl","true","false"])},
   {t:"le cas général, avec l'appel récursif",cc:3,min:30,gen:R=>tireLigne(R,FL,["rec"],["List.hd","List.tl","::","mod","&&","||"])},
   {t:"une branche de match",cc:3,min:30,gen:R=>tireLigne(R,FM,["branche","rec"],["|","->","::","[]","mod"])},
   {t:"la fonction donnée à fold, map ou filter",cc:3,min:30,gen:R=>tireLigne(R,FI,["fn"],["fun","->","::","mod"])}]},
 {id:"PF4",t:"Trouver la ligne fausse",tache:"trouver la ligne fausse",th:"listes",pts:3,lecons:["p-rec","p-listes","p-match"],apres:["PF3"],
  paliers:[
   {t:"une erreur de type",cc:3,min:30,gen:R=>tireFausse(R,Object.assign({},FL,FI),"type",["List.hd","List.tl","::","[]"])},
   {t:"une erreur de logique",cc:3,min:30,gen:R=>tireFausse(R,Object.assign({},FL,FM,FI),"logique",["List.hd","List.tl","::","[]","&&","||"])},
   {t:"un cas oublié dans un match",cc:3,min:20,gen:R=>tireFausse(R,FM,"match")}]},
 {id:"PF8",t:"Écrire une fonction entière",tache:"écrire une fonction entière",th:"fonctions",pts:3,lecons:["p-fonctions","p-rec","p-listes","p-schema"],apres:["PF3"],
  paliers:[
   {t:"sans récursivité : un test ou un calcul",cc:4,min:30,gen:R=>tireFonction(R,SANS1,["->","mod","&&","||","<>"])},
   {t:"récursive sur un entier",cc:6,min:28,gen:R=>tireFonction(R,RECENT8,["let rec","->","mod","&&","||"],{rec:true})},
   {t:"récursive sur une liste",cc:6,min:22,gen:R=>tireFonction(R,LISTE8,["let rec","->","[]","::","List.hd","List.tl","|"],{rec:true,liste:true})},
   {t:"comme au CC : une liste et un autre argument",cc:8,min:14,gen:R=>tireFonction(R,CC8,["let rec","->","[]","::","|","match","with","List.hd","List.tl"],{rec:true})}]},
 {id:"PF5",t:"Types somme, types récursifs, arbres",tache:"types somme et arbres",th:"somme",ex:"ct",pts:5.5,lecons:["p2-somme","p2-rectype"],apres:["PF2"],
  paliers:[
   {t:"écrire une valeur du type",cc:2,min:40,gen:tireValeur},
   {t:"ce que renvoie une fonction sur le type",cc:3,min:40,gen:tireSomme},
   {t:"écrire la branche manquante",cc:3,min:18,gen:R=>tireLigne(R,FS,["branche","rec"],["|","->","(",")","Empty"])}]},
 {id:"PF6",t:"« De trois façons » : récursif, terminal, itérateur",tache:"de trois façons",th:"ordre",ex:"ct",pts:4.5,lecons:["p2-match","p2-terminal","p2-iter"],apres:["PF3"],
  paliers:[
   {t:"la version récursive",cc:3,min:20,gen:R=>tireTrois(R,0)},
   {t:"la version terminale, avec un accumulateur",cc:3,min:20,gen:R=>tireTrois(R,1)},
   {t:"la version avec un itérateur",cc:3,min:15,gen:R=>tireTrois(R,2)}]},
 {id:"PF7",t:"Exceptions : la valeur, ou l'exception levée",tache:"exceptions",th:"exceptions",ex:"ct",pts:1,lecons:["p2-exc"],apres:["PF2"],
  paliers:[
   {t:"raise et failwith",cc:2,min:40,gen:R=>tireExc(R,0)},
   {t:"try … with",cc:2,min:40,gen:R=>tireExc(R,1)}]}
]);
})();
