/* Composants interactifs pour l'algo, la programmation fonctionnelle et le calculus.
   Tout est en JavaScript pur, sans dépendance. */
(function(){
"use strict";
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
/* écriture mathématique d'un texte : a^(b), a^{b}, a^b en exposant ; a_{b}, y_p en indice */
const sup=h=>String(h).replace(/\^\(((?:[^()]|\([^()]*\))*)\)/g,"<sup>$1</sup>").replace(/\^\{([^{}]*)\}/g,"<sup>$1</sup>").replace(/\^([0-9A-Za-zα-ωπ′−+]+)/g,"<sup>$1</sup>").replace(/_\{([^{}]*)\}/g,"<sub>$1</sub>").replace(/([A-Za-z])_([0-9A-Za-z])(?![0-9A-Za-z])/g,"$1<sub>$2</sub>");
const mth=s=>sup(esc(s));
const KW={py:["def","return","for","in","range","while","if","else","elif","and","or","not","True","False","None","len","import","from","with","as","try","except","finally","class","break","continue","pass","is","lambda","yield","del","global"],
 sh:["if","then","elif","else","fi","for","while","in","do","done","case","esac","function","return","echo","read","export","exit","local","let","test"],
 c:["#include","#define","int","char","float","double","void","unsigned","long","short","const","static","extern","struct","union","typedef","sizeof","return","if","else","for","while","NULL"],
 pseudo:["Fonction","Procédure","Début","Fin","FONCTION","PROCÉDURE","DÉBUT","FIN","SPÉCIFICATIONS","Renvoyer","Si","si","alors","sinon","finSi","Pour","pour","de","à","faire","finPour","fin","tq","Tant","tant","que","finTantQue","finTQ","Variable","Variables","Spécifications","par","pas","et","ou","non","cond","tete","tête","queue","cons","estVide","dans","empiler","depiler","enfiler","defiler"],
 ml:["let","rec","in","fun","function","match","with","when","if","then","else","and","true","false","not","List.hd","List.tl","int","float","bool","string","list","mod","type","of","exception","raise","try","failwith","invalid_arg","as","List.map","List.filter","List.fold_left","List.fold_right","List.for_all","List.exists","List.iter","List.length"]};
/* coloration en un seul passage : commentaires et chaînes d'abord, sur le texte d'origine,
   puis les mots-clés dans le reste ; on ne recolore jamais une balise déjà posée */
function hlCode(src,lang){
  const kws=(KW[lang]||[]).slice().sort((a,b)=>b.length-a.length).map(k=>k.replace(/\./g,"\\."));
  const kwRe=kws.length?new RegExp("(^|[^\\w.&])("+kws.join("|")+")(?![\\wéèà])","g"):null;
  const kw=t=>kwRe?t.replace(kwRe,'$1<span class="c-kw">$2</span>'):t;
  const parts=[];if(lang==="ml")parts.push("\\(\\*[\\s\\S]*?\\*\\)");if(lang==="py")parts.push("#[^\\n]*");if(lang==="sh")parts.push("(?:^|[ \\t])#[^\\n]*");if(lang==="c")parts.push("/\\*[\\s\\S]*?\\*/","//[^\\n]*");parts.push('"[^"\\n]*"');
  const re=new RegExp(parts.join("|"),"gm");let out="",last=0,m;src=String(src);
  while((m=re.exec(src))){out+=kw(esc(src.slice(last,m.index)));out+=`<span class="${m[0].charAt(0)==='"'?"c-str":"c-com"}">${esc(m[0])}</span>`;last=re.lastIndex;}
  return out+kw(esc(src.slice(last)));
}
function code(src,lang){return `<pre class="code" data-lang="${lang||""}"><code>${hlCode(src.replace(/^\n/,""),lang)}</code></pre>`;}

/* ------------------------------------------------------------------
   Traceur pas à pas : une ligne surlignée, un tableau des variables, une sortie.
   spec = { code:[lignes], lang, params:[{k,label,min,max,val}], gen:(p)=>[{l,v:{},out,note}], cols:[noms] }
------------------------------------------------------------------ */
function tracer(host,spec){
  const P={};(spec.params||[]).forEach(p=>P[p.k]=p.val);
  let steps=[],k=0;
  host.innerHTML=`<div class="widget"><div class="w-ctrl">${(spec.params||[]).map(p=>`<label>${p.label} <input type="number" min="${p.min}" max="${p.max}" value="${p.val}" data-p="${p.k}"></label>`).join("")}<button class="btn" data-a="prev">Étape précédente</button><button class="btn pri" data-a="next">Étape suivante</button><button class="btn" data-a="end">Tout dérouler</button><button class="btn" data-a="reset">Recommencer</button><span class="muted" data-a="cnt"></span></div>
   <div class="w-grid"><div class="w-code"></div><div class="w-side"><div class="w-table"></div><div class="w-out"></div><div class="w-note"></div></div></div></div>`;
  const $=s=>host.querySelector(s);
  function gen(){steps=spec.gen(P);k=0;draw();}
  function draw(){
    const s=steps[k]||{};
    $(".w-code").innerHTML=`<pre class="code"><code>${spec.code.map((L,i)=>`<span class="ln${i===s.l?" on":""}">${hlCode(L,spec.lang)||" "}</span>`).join("\n")}</code></pre>`;
    const cols=spec.cols||Object.keys(s.v||{});
    const rows=steps.slice(0,k+1).filter(x=>x.row!==false&&x.v);
    $(".w-table").innerHTML=cols.length?`<table class="tbl tr"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r,i)=>`<tr class="${i===rows.length-1?"on":""}">${cols.map(c=>`<td>${r.v[c]===undefined?"":esc(r.v[c])}</td>`).join("")}</tr>`).join("")}</tbody></table>`:"";
    const out=steps.slice(0,k+1).map(x=>x.out||"").join("");
    $(".w-out").innerHTML=spec.noOut?"":`<div class="muted" style="font-size:.85rem">Affichage / résultat</div><pre class="console">${esc(out)||" "}</pre>`;
    $(".w-note").innerHTML=s.note?`<div class="verdict info">${s.note}</div>`:"";
    $('[data-a="cnt"]').textContent=`Étape ${k+1} sur ${steps.length}`;
    $('[data-a="prev"]').disabled=k===0;$('[data-a="next"]').disabled=k>=steps.length-1;
  }
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;if(a==="prev"&&k>0)k--;if(a==="next"&&k<steps.length-1)k++;if(a==="end")k=steps.length-1;if(a==="reset")k=0;draw();});
  host.addEventListener("change",e=>{const p=e.target.dataset.p;if(!p)return;const d=(spec.params||[]).find(x=>x.k===p);let v=Math.round(+e.target.value);v=Math.max(d.min,Math.min(d.max,isNaN(v)?d.val:v));e.target.value=v;P[p]=v;gen();});
  gen();
}

/* ------------------------------------------------------------------
   Arbre d'appels récursifs : chaque appel, chaque affichage, dans l'ordre d'exécution.
   spec = { params, run:(p,api)=>{}, title }  api.call(label, corps), api.print(texte), api.ret(valeur)
------------------------------------------------------------------ */
function calltree(host,spec){
  const P={};(spec.params||[]).forEach(p=>P[p.k]=p.val);
  let ev=[],k=0;
  host.innerHTML=`<div class="widget"><div class="w-ctrl">${(spec.params||[]).map(p=>`<label>${p.label} <input type="number" min="${p.min}" max="${p.max}" value="${p.val}" data-p="${p.k}"></label>`).join("")}${spec.variants?`<select data-v>${spec.variants.map((v,i)=>`<option value="${i}">${v.label}</option>`).join("")}</select>`:""}<button class="btn" data-a="prev">Précédent</button><button class="btn pri" data-a="next">Suivant</button><button class="btn" data-a="end">Tout</button><button class="btn" data-a="reset">Recommencer</button><span class="muted" data-a="cnt"></span></div>
   ${spec.variants?`<div class="w-vcode"></div>`:""}<div class="w-grid"><div class="w-tree"></div><div class="w-side"><div class="muted" style="font-size:.85rem">Ce qui s'affiche</div><pre class="console w-out"></pre><div class="w-note"></div></div></div></div>`;
  const $=s=>host.querySelector(s);let vi=0;
  function run(){
    ev=[];let depth=0,id=0;const api={
      call:(label,body)=>{const me=id++;ev.push({t:"call",label,depth,id:me});depth++;let r;try{r=body();}finally{depth--;}ev.push({t:"ret",label,depth,id:me,val:r});return r;},
      print:(txt)=>{ev.push({t:"print",txt,depth});}
    };
    const R=spec.variants?spec.variants[vi].run:spec.run;
    try{R(P,api);}catch(e){ev.push({t:"print",txt:"(trop d'appels)",depth:0});}
    if(ev.length>600){ev=ev.slice(0,600);}
    k=0;draw();
  }
  function draw(){
    if(spec.variants)$(".w-vcode").innerHTML=code(spec.variants[vi].code,spec.lang||"pseudo");
    const shown=ev.slice(0,k+1);
    let html="";shown.forEach((e,i)=>{if(e.t==="call")html+=`<div class="tn${i===k?" on":""}" style="padding-left:${e.depth*18}px">${e.depth?"└ ":""}<b>${esc(e.label)}</b></div>`;
      else if(e.t==="print")html+=`<div class="tn pr${i===k?" on":""}" style="padding-left:${e.depth*18}px">${e.depth?"  ":""}affiche <code>${esc(e.txt)}</code></div>`;
      else if(e.t==="ret"&&e.val!==undefined)html+=`<div class="tn rt${i===k?" on":""}" style="padding-left:${e.depth*18}px">${e.depth?"  ":""}${esc(e.label)} renvoie <b>${esc(e.val)}</b></div>`;});
    $(".w-tree").innerHTML=html||" ";
    $(".w-out").textContent=shown.filter(e=>e.t==="print").map(e=>e.txt).join("\n")||" ";
    const cur=ev[k];$(".w-note").innerHTML=cur?`<div class="verdict info">${cur.t==="call"?`Appel de ${esc(cur.label)}`:cur.t==="print"?`Affichage de ${esc(cur.txt)}`:`Fin de ${esc(cur.label)}${cur.val!==undefined?` : il renvoie ${esc(cur.val)}`:""}`}</div>`:"";
    $('[data-a="cnt"]').textContent=`Événement ${k+1} sur ${ev.length}`;
    $('[data-a="prev"]').disabled=k===0;$('[data-a="next"]').disabled=k>=ev.length-1;
    const on=host.querySelector(".tn.on");if(on){const t=$(".w-tree");if(on.offsetTop<t.scrollTop||on.offsetTop>t.scrollTop+t.clientHeight-30)t.scrollTop=on.offsetTop-60;}
  }
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;if(a==="prev"&&k>0)k--;if(a==="next"&&k<ev.length-1)k++;if(a==="end")k=ev.length-1;if(a==="reset")k=0;draw();});
  host.addEventListener("change",e=>{if(e.target.matches("[data-v]")){vi=+e.target.value;run();return;}const p=e.target.dataset.p;if(!p)return;const d=spec.params.find(x=>x.k===p);let v=Math.round(+e.target.value);v=Math.max(d.min,Math.min(d.max,isNaN(v)?d.val:v));e.target.value=v;P[p]=v;run();});
  run();
}

/* ------------------------------------------------------------------
   Tris pas à pas : bulles (sens du cours), fusion, sélection, insertion, par valeurs.
------------------------------------------------------------------ */
const SORTS={
 bulles:{t:"Tri à bulles",gen:function*(a){const n=a.length;for(let i=0;i<n-1;i++){for(let j=n-1;j>i;j--){yield{a:a.slice(),cmp:[j-1,j],fixed:i,msg:`i = ${i}, j = ${j} : on compare T[${j}] = ${a[j]} et T[${j-1}] = ${a[j-1]}.`};if(a[j]<a[j-1]){[a[j],a[j-1]]=[a[j-1],a[j]];yield{a:a.slice(),swap:[j-1,j],fixed:i,msg:"T[j] < T[j-1] : on échange ces deux voisins."};}}}yield{a:a.slice(),fixed:n,msg:"Trié. À chaque itération de i, le plus petit restant est remonté au début."};}},
 fusion:{t:"Tri fusion",gen:function*(a){const n=a.length,plage=(d,f)=>Array.from({length:f-d+1},(_,k)=>d+k);function* tri(deb,fin){if(deb<fin){const mil=Math.floor((deb+fin)/2);yield* tri(deb,mil);yield* tri(mil+1,fin);const T1=a.slice(deb,mil+1),T2=a.slice(mil+1,fin+1);let i=0,j=0;yield{a:a.slice(),cmp:plage(deb,fin),msg:`fusion(T, ${deb}, ${mil}, ${fin}) : T[${deb}..${mil}] = [${T1.join(", ")}] et T[${mil+1}..${fin}] = [${T2.join(", ")}] sont triés.`};for(let k=deb;k<=fin;k++){if(j>=T2.length||(i<T1.length&&T1[i]<=T2[j]))a[k]=T1[i++];else a[k]=T2[j++];}yield{a:a.slice(),swap:plage(deb,fin),msg:`Après la fusion : T[${deb}..${fin}] = [${a.slice(deb,fin+1).join(", ")}].`};}}yield* tri(0,n-1);yield{a:a.slice(),fixed:n,msg:"Trié, en θ(n log(n)). Les fusions ont eu besoin de tableaux auxiliaires : le tri fusion n'est pas en place."};}},
 selection:{t:"Tri par sélection",gen:function*(a){const n=a.length;for(let i=0;i<n-1;i++){let m=i;for(let j=i+1;j<n;j++){yield{a:a.slice(),cmp:[m,j],fixed:i,msg:`Plus petit trouvé jusqu'ici : T[${m}] = ${a[m]}. On le compare à T[${j}] = ${a[j]}.`};if(a[j]<a[m])m=j;}if(m!==i){[a[i],a[m]]=[a[m],a[i]];yield{a:a.slice(),swap:[i,m],fixed:i+1,msg:`On place le minimum ${a[i]} en position ${i}.`};}else yield{a:a.slice(),fixed:i+1,msg:`T[${i}] = ${a[i]} est déjà le minimum : il reste en place.`};}yield{a:a.slice(),fixed:n,msg:"Trié."};}},
 insertion:{t:"Tri par insertion",gen:function*(a){const n=a.length;for(let i=1;i<n;i++){let j=i;yield{a:a.slice(),cmp:[j],fixed:i,msg:`On insère T[${i}] = ${a[i]} dans la partie déjà triée T[0..${i-1}].`};while(j>0&&a[j-1]>a[j]){yield{a:a.slice(),cmp:[j-1,j],fixed:i,msg:`${a[j-1]} > ${a[j]} : on décale.`};[a[j-1],a[j]]=[a[j],a[j-1]];yield{a:a.slice(),swap:[j-1,j],fixed:i+1,msg:"Échange avec le voisin de gauche."};j--;}}yield{a:a.slice(),fixed:n,msg:"Trié."};}},
 comptage:{t:"Tri par valeurs",gen:function*(a){const max=Math.max(...a);const c=new Array(max+1).fill(0);for(let i=0;i<a.length;i++){c[a[i]]++;yield{a:a.slice(),cmp:[i],cnt:c.slice(),msg:`On compte la valeur ${a[i]} : elle a été vue ${c[a[i]]} fois.`};}const r=[];for(let v=0;v<=max;v++){for(let k=0;k<c[v];k++){r.push(v);}if(c[v])yield{a:r.concat(a.slice(r.length).map(()=>null)),cnt:c.slice(),msg:`On recopie ${c[v]} fois la valeur ${v}.`};}yield{a:r,cnt:c,fixed:a.length,msg:"Trié en un passage de comptage et un passage de recopie : θ(p + n), où p est le nombre de valeurs possibles."};}}
};
function sortviz(host,opts){
  opts=opts||{};let algo=opts.algo||"bulles",arr=[],steps=[],k=0;
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><select data-s>${Object.entries(SORTS).map(([k2,v])=>`<option value="${k2}"${k2===algo?" selected":""}>${v.t}</option>`).join("")}</select><button class="btn" data-a="new">Nouveau tableau</button><button class="btn" data-a="prev">Précédent</button><button class="btn pri" data-a="next">Suivant</button><button class="btn" data-a="end">Tout</button><span class="muted" data-a="cnt"></span></div>
   <div class="bars"></div><div class="w-note"></div><div class="meas-line"></div></div>`;
  const $=s=>host.querySelector(s);
  function newArr(){const n=opts.n||8;arr=Array.from({length:n},()=>1+Math.floor(Math.random()*(algo==="comptage"?6:12)));build();}
  function build(){steps=[...SORTS[algo].gen(arr.slice())];k=0;draw();}
  function draw(){const s=steps[k]||{a:arr};const mx=Math.max(...arr,1);
    $(".bars").innerHTML=s.a.map((v,i)=>{let c="";if(s.swap&&s.swap.includes(i))c=" sw";else if(s.cmp&&s.cmp.includes(i))c=" cp";else if(s.fixed!=null&&i<s.fixed)c=" ok";return `<div class="bar${c}${v==null?" empty":""}"><i style="height:${v==null?4:Math.max(8,v/mx*120)}px"></i><span>${v==null?"":v}</span><small>${i}</small></div>`;}).join("");
    const shown=steps.slice(0,k+1);const nc=shown.filter(x=>x.cmp&&x.cmp.length===2).length,ns=shown.filter(x=>x.swap).length;
    $(".w-note").innerHTML=`<div class="verdict info">${s.msg||""}</div>`+(s.cnt?`<div class="muted" style="margin-top:6px">Compteurs : ${s.cnt.map((c,v)=>c?`${v}→${c}`:"").filter(Boolean).join(", ")}</div>`:"");
    $(".meas-line").innerHTML=algo==="comptage"||algo==="fusion"?"":`<span class="muted">Comparaisons : <b>${nc}</b>, échanges : <b>${ns}</b></span>`;
    $('[data-a="cnt"]').textContent=`Étape ${k+1} sur ${steps.length}`;}
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;if(a==="new")return newArr();if(a==="prev"&&k>0)k--;if(a==="next"&&k<steps.length-1)k++;if(a==="end")k=steps.length-1;draw();});
  host.addEventListener("change",e=>{if(e.target.matches("[data-s]")){algo=e.target.value;newArr();}});
  newArr();
}

/* ------------------------------------------------------------------
   Recherche dichotomique dans un tableau trié
------------------------------------------------------------------ */
function dicho(host){
  let n=32,T=[],x=0,steps=[],k=0;
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><label>Taille n <input type="number" min="4" max="1024" value="32" data-n></label><label>Valeur cherchée <input type="number" value="0" data-x></label><button class="btn" data-a="rand">Valeur au hasard</button><button class="btn" data-a="prev">Précédent</button><button class="btn pri" data-a="next">Suivant</button><button class="btn" data-a="end">Tout</button></div>
   <div class="dstrip"></div><div class="w-note"></div></div>`;
  const $=s=>host.querySelector(s);
  /* RechDic du cours : pas de sortie au milieu, on renvoie le plus petit indice */
  function build(){T=Array.from({length:n},(_,i)=>2*i+1);steps=[];let g=0,d=n-1,c=0;steps.push({g,d,c,msg:`deb = 0, fin = ${d}. On cherche e = ${x}.`});
    while(g<=d){const m=Math.floor((g+d)/2);c++;if(T[m]<x){g=m+1;steps.push({g,d,m,c,msg:`Itération ${c} : mil = ${m}, T[${m}] = ${T[m]} < ${x}, donc deb ← ${g}. Il reste ${Math.max(0,d-g+1)} case(s).`});}else{d=m-1;steps.push({g,d,m,c,msg:`Itération ${c} : mil = ${m}, T[${m}] = ${T[m]} n'est pas < ${x}, donc fin ← ${d}. Il reste ${Math.max(0,d-g+1)} case(s).`});}}
    const ok=g<n&&T[g]===x;steps.push({g:ok?g:0,d:ok?g:-1,m:ok?g:null,c,found:ok,msg:ok?`deb = ${g} > fin = ${d} : fin du tant que. T[${g}] = ${x} : on renvoie ${g}, après ${c} itération(s). Une recherche linéaire aurait pu en faire ${n}.`:`deb = ${g} > fin = ${d} : fin du tant que. ${g<n?`T[${g}] = ${T[g]} ≠ ${x}`:"deb = taille(T)"} : on renvoie -1, après ${c} itération(s).`});k=0;draw();}
  function draw(){const s=steps[k];const W=Math.min(n,64),scale=n/W;let h="";for(let i=0;i<W;i++){const lo=Math.floor(i*scale),hi=Math.floor((i+1)*scale)-1;const inside=hi>=s.g&&lo<=s.d;const mid=s.m!=null&&s.m>=lo&&s.m<=hi;h+=`<i class="${inside?"in":""}${mid?(s.found?" found":" mid"):""}" title="${n<=64?"T["+lo+"] = "+T[lo]:""}">${n<=32?T[lo]:""}</i>`;}
    $(".dstrip").innerHTML=h;$(".w-note").innerHTML=`<div class="verdict ${s.found?"ok":"info"}">${s.msg}</div>`;
    host.querySelector('[data-a="prev"]').disabled=k===0;host.querySelector('[data-a="next"]').disabled=k>=steps.length-1;}
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;if(a==="rand"){x=2*Math.floor(Math.random()*n)+1;$("[data-x]").value=x;return build();}if(a==="prev"&&k>0)k--;if(a==="next"&&k<steps.length-1)k++;if(a==="end")k=steps.length-1;draw();});
  host.addEventListener("change",e=>{if(e.target.matches("[data-n]")){n=Math.max(4,Math.min(1024,Math.round(+e.target.value)||32));e.target.value=n;}if(e.target.matches("[data-x]"))x=Math.round(+e.target.value)||0;build();});
  x=2*Math.floor(n*0.7)+1;$("[data-x]").value=x;build();
}

/* ------------------------------------------------------------------
   Listes : tête, queue, cons, estVide (pseudo-code) ou List.hd, List.tl, :: (OCaml)
------------------------------------------------------------------ */
function listlab(host,opts){
  const ml=opts&&opts.ml;let L=(opts&&opts.start)||[2,3,2,4],hist=[];
  const show=l=>ml?"["+l.join("; ")+"]":"["+l.join(", ")+"]";
  const N=ml?{hd:"List.hd",tl:"List.tl",cons:"::",vide:"= []"}:{hd:"tete",tl:"queue",cons:"cons",vide:"estVide"};
  host.innerHTML=`<div class="widget"><div class="w-ctrl"><span>Liste courante : <b class="lcur"></b></span></div>
   <div class="w-ctrl"><button class="btn" data-a="hd">${N.hd}</button><button class="btn" data-a="tl">${N.tl}</button><label>x = <input type="number" value="7" data-x style="width:4.5em"></label><button class="btn" data-a="cons">${ml?"x :: liste":"cons(x, liste)"}</button><button class="btn" data-a="empty">${ml?"liste = []":"estVide(liste)"}</button><button class="btn" data-a="reset">Revenir à ${show((opts&&opts.start)||[2,3,2,4])}</button></div>
   <div class="w-out2"></div></div>`;
  const $=s=>host.querySelector(s);
  function draw(){$(".lcur").textContent=show(L);$(".w-out2").innerHTML=hist.length?`<table class="tbl"><thead><tr><th>Expression</th><th>Valeur</th></tr></thead><tbody>${hist.slice(-8).map(h=>`<tr><td><code>${esc(h[0])}</code></td><td>${h[1]}</td></tr>`).join("")}</tbody></table>`:`<p class="muted">Clique sur une opération.</p>`;}
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;const x=+$("[data-x]").value||0;
    if(a==="hd"){hist.push([ml?`List.hd ${show(L)}`:`tete(${show(L)})`,L.length?`<b>${L[0]}</b> (un élément, pas une liste)`:`<span style="color:var(--rouge)">erreur : liste vide${ml?" (exception Failure \"hd\")":""}</span>`]);}
    if(a==="tl"){if(L.length){const r=L.slice(1);hist.push([ml?`List.tl ${show(L)}`:`queue(${show(L)})`,`<b>${show(r)}</b> (une liste) : elle devient la liste courante`]);L=r;}else hist.push([ml?"List.tl []":"queue([])",`<span style="color:var(--rouge)">erreur : liste vide</span>`]);}
    if(a==="cons"){const r=[x].concat(L);hist.push([ml?`${x} :: ${show(L)}`:`cons(${x}, ${show(L)})`,`<b>${show(r)}</b> : ajout en tête`]);L=r;}
    if(a==="empty"){hist.push([ml?`${show(L)} = []`:`estVide(${show(L)})`,`<b>${L.length===0}</b>`]);}
    if(a==="reset"){L=((opts&&opts.start)||[2,3,2,4]).slice();hist=[];}
    draw();});
  draw();
}

/* ------------------------------------------------------------------
   Exercice « type et valeur » (OCaml) : on choisit le type, puis on voit la valeur
   items = [{e, t, v, why}]
------------------------------------------------------------------ */
function drill(host,items,choices,lang,o){o=o||{};
  const val=x=>lang==="math"?`<span class="mth">${mth(x)}</span>`:`<code>${esc(x)}</code>`;
  let order=items.map((_,i)=>i).sort(()=>Math.random()-0.5),i=0,score=0,ans=null;
  host.innerHTML=`<div class="widget drill"></div>`;const box=host.querySelector(".drill");
  function draw(){
    if(i>=order.length){box.innerHTML=`<p class="score">${score} sur ${order.length}</p><button class="btn pri" data-a="again">Recommencer</button>`;return;}
    const it=items[order[i]];
    box.innerHTML=`<p class="muted">${lang==="math"?"Question":"Expression"} ${i+1} sur ${order.length}, score ${score}</p>${lang==="math"?`<p class="mathq">${sup(it.e)}</p>`:code(it.e,lang||"ml")}<p>${o.ask||(lang==="math"?"Quelle méthode ?":"Quel est son type ?")}</p><div class="opts">${choices.map(c=>{let cl="";if(ans!==null){if(c===it.t)cl="good";else if(c===ans)cl="bad";}return `<button data-c="${esc(c)}" class="${cl}" ${ans!==null?"disabled":""}>${val(c)}</button>`;}).join("")}</div>
     ${ans!==null?`<div class="expl${ans===it.t?"":" no"}"><b>${ans===it.t?"Exact.":"Non."}</b> ${o.label||(lang==="math"?"Réponse":"Type")} : ${val(it.t)}. ${it.v!=null?`Valeur : ${val(it.v)}. `:""}${it.why||""}</div><button class="btn pri" data-a="next">Suivante</button>`:""}`;
  }
  box.addEventListener("click",e=>{const c=e.target.closest("[data-c]");if(c&&ans===null){ans=c.dataset.c;if(ans===items[order[i]].t)score++;draw();return;}const a=e.target.closest("[data-a]")?.dataset.a;if(a==="next"){i++;ans=null;draw();}if(a==="again"){order.sort(()=>Math.random()-0.5);i=0;score=0;ans=null;draw();}});
  draw();
}

/* ------------------------------------------------------------------
   Réécriture pas à pas d'un calcul récursif (ex. som 3 = 3 + som 2 = …)
   spec = { params, gen:(p)=>[lignes] }
------------------------------------------------------------------ */
function rewrite(host,spec){
  const P={};(spec.params||[]).forEach(p=>P[p.k]=p.val);let L=[],k=0;
  host.innerHTML=`<div class="widget"><div class="w-ctrl">${(spec.params||[]).map(p=>`<label>${p.label} <input type="number" min="${p.min}" max="${p.max}" value="${p.val}" data-p="${p.k}"></label>`).join("")}<button class="btn" data-a="prev">Précédent</button><button class="btn pri" data-a="next">Suivant</button><button class="btn" data-a="end">Tout</button></div><div class="rw"></div></div>`;
  const $=s=>host.querySelector(s);
  function gen(){L=spec.gen(P);k=0;draw();}
  function draw(){$(".rw").innerHTML=L.slice(0,k+1).map((x,i)=>{const t=Array.isArray(x)?x:[x,""];return `<div class="rwl${i===k?" on":""}">${i&&!spec.math?"= ":""}${spec.math?`<span class="mth">${mth(t[0])}</span>`:`<code>${esc(t[0])}</code>`}${t[1]?` <span class="muted">${spec.math?mth(t[1]):esc(t[1])}</span>`:""}</div>`;}).join("");$('[data-a="prev"]').disabled=k===0;$('[data-a="next"]').disabled=k>=L.length-1;}
  host.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;if(a==="prev"&&k>0)k--;if(a==="next"&&k<L.length-1)k++;if(a==="end")k=L.length-1;draw();});
  host.addEventListener("change",e=>{const p=e.target.dataset.p;if(!p)return;const d=spec.params.find(x=>x.k===p);let v=Math.round(+e.target.value);v=Math.max(d.min,Math.min(d.max,isNaN(v)?d.val:v));e.target.value=v;P[p]=v;gen();});
  gen();
}

/* ------------------------------------------------------------------
   Tracés de fonctions pour le calculus (sur le moteur de figures G)
------------------------------------------------------------------ */
function plotter(w,h,xmin,xmax,ymin,ymax){
  const X=x=>(x-xmin)/(xmax-xmin)*w,Y=y=>h-(y-ymin)/(ymax-ymin)*h,ix=px=>xmin+px/w*(xmax-xmin),iy=py=>ymin+(h-py)/h*(ymax-ymin);
  const fmt=v=>String(Math.round(v*100)/100).replace(".",",");
  function axes(){let s="";const step=(r)=>{const raw=r/8,p=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/p;return(m<1.5?1:m<3.5?2:m<7.5?5:10)*p;};const sx=step(xmax-xmin),sy=step(ymax-ymin);
    for(let x=Math.ceil(xmin/sx)*sx;x<=xmax;x+=sx){s+=`<line x1="${X(x)}" y1="0" x2="${X(x)}" y2="${h}" class="grid"/>`;if(Math.abs(x)>1e-9)s+=`<text x="${X(x)}" y="${Math.min(h-4,Math.max(14,Y(0)+16))}" class="t-mut t-up" text-anchor="middle">${fmt(x)}</text>`;}
    for(let y=Math.ceil(ymin/sy)*sy;y<=ymax;y+=sy){s+=`<line x1="0" y1="${Y(y)}" x2="${w}" y2="${Y(y)}" class="grid"/>`;if(Math.abs(y)>1e-9)s+=`<text x="${Math.min(w-20,Math.max(4,X(0)+6))}" y="${Y(y)+4}" class="t-mut t-up">${fmt(y)}</text>`;}
    if(ymin<=0&&ymax>=0)s+=`<line x1="0" y1="${Y(0)}" x2="${w}" y2="${Y(0)}" class="l-thin"/>`;if(xmin<=0&&xmax>=0)s+=`<line x1="${X(0)}" y1="0" x2="${X(0)}" y2="${h}" class="l-thin"/>`;return s;}
  function path(f,cls,a,b){a=a==null?xmin:a;b=b==null?xmax:b;let d="",pen=false;const n=400;for(let i=0;i<=n;i++){const x=a+(b-a)*i/n;let y;try{y=f(x);}catch(e){y=NaN;}if(!isFinite(y)||y<ymin-(ymax-ymin)*3||y>ymax+(ymax-ymin)*3){pen=false;continue;}d+=(pen?"L":"M")+X(x).toFixed(1)+" "+Y(y).toFixed(1);pen=true;}return `<path d="${d}" class="${cls||"l-cob"}"/>`;}
  function area(f,a,b,cls){let d=`M${X(a).toFixed(1)} ${Y(0).toFixed(1)}`;const n=200;for(let i=0;i<=n;i++){const x=a+(b-a)*i/n;let y=f(x);if(!isFinite(y))y=0;y=Math.max(ymin,Math.min(ymax,y));d+=`L${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;}d+=`L${X(b).toFixed(1)} ${Y(0).toFixed(1)}Z`;return `<path d="${d}" class="${cls||"f-cob"}"/>`;}
  return {X,Y,ix,iy,axes,path,area,fmt};
}

/* ------------------------------------------------------------------
   Formules au fil du texte : une formule écrite dans une phrase passe en police mathématique.
   Le texte est coupé en mots. Un mot « fort » porte un signe de maths (=, +, ′, une lettre grecque, f(x), 4t…) ;
   un mot « faible » est une lettre seule, un nombre, un nom de fonction. Une suite de mots forts et faibles
   qui contient au moins un mot fort est une formule ; une lettre seule (sauf « a » et « y ») aussi.
   tout = false : seulement les titres en police Gloock.
------------------------------------------------------------------ */
const FORT=/[=+−×÷<>≤≥≠≈±⇒⇔→←↔⟶↦∈∉⊂⊆∪∩∀∃∞∫√′″∑∏∘∖∅ℝℕℤℚℂα-ωΑ-Ω⁰¹²³⁴-⁹ⁿˣʸᵘᵉⁱᵏᵗᵃᵇ⁺⁻₀-₉ₐₑₙₚₓₖ]/;
const FONC=/^(ln|log|exp|cos|sin|tan|lim|arg|max|min|det|ker|im|Re|Im|Vect|Card|dx|dt|du|dy|dθ)$/;
const FR2=new Set("et ou si on en de du la le il un ne se ce te me je tu au ça où or ni va as es eu lu vu su pu dû né ma ta sa là ah oh eh ex cf vs no ok km cm mm kg id tp td cc".split(" "));
const SUJET=new Set(["on","il","elle","qui","y","ça","cela","ceci","l'on","qu'on","qu'il","n'y","l’on","qu’on","qu’il","n’y"]);
const HORS=".nf,pre,code,kbd,svg,select,textarea,input,script,style,.vec,.mi,.badge,.tag,.btn,.w-ctrl,.console,.blankcode,.bugs,.mono,.lp-kicker,.kicker";
function genre(brut,avant,apres){
  const t=brut.replace(/^[«(\[]+/,"").replace(/[.,;:!?…»)\]]+$/,"");
  if(!t)return "x";
  if((!avant&&/^[a-z]\)$/.test(brut))||/^\([a-z]\)[.,:]?$/.test(brut)||brut==="p."||/^\d+h\d*$/.test(t)||/^\d+(e|er|re|nd|de|ème|ʳᵉ|ᵉʳ|ᵉ|ᵈᵉ|ⁿᵈ)$/.test(t))return "x";
  avant=avant.replace(/^[«(\[]+/,"");
  if(/[A-Za-zÀ-ÿ]{3,}/.test(t.replace(/\b(ln|log|exp|cos|sin|tan|lim|arg|max|min|det|ker|Vect|Card)\b/g,""))&&!/^[A-Za-z]′*\(/.test(t))return "x";
  if(t==="a")return SUJET.has(avant.toLowerCase())?"x":"f";
  if(t==="y")return /^(il|ils|on|nous|vous|elle|elles|tu|je|pour|faut|peut|va|qu'il|qu’il|s'il|s’il)$/i.test(avant)&&!FORT.test(apres)?"x":"L";
  if(FORT.test(t)||/^[A-Za-z]′*\(/.test(t)||/^[−-]?\d+[a-zA-Z]{1,2}$/.test(t)||/^(ln|log|exp|cos|sin|tan|arg|det|ker|Vect|Card)\(/.test(t))return "F";
  if(/^\(?[A-Za-z0-9]{1,2}(\/\(?[A-Za-z0-9]{1,2}\)?)+$/.test(t)&&/[A-Za-z]/.test(t)&&!t.toLowerCase().split("/").some(x=>FR2.has(x)))return "F";
  if(/[()]/.test(t)&&/[A-Za-z0-9]/.test(t))return "F";
  if(/^[A-Za-z]$/.test(t))return /^\d/.test(avant)&&/^[hsmg]$/.test(t)?"x":"L";
  if(/^[−-]?\d+([.,]\d+)?(\/\d+)?$/.test(t)||FONC.test(t)||/^[A-Z]{1,3}\d{0,2}$/.test(t))return "f";
  if(/^[a-z]{2}$/.test(t)&&!FR2.has(t))return "f";
  return "x";
}
/* exposants et indices écrits en caractères (x², e⁻ˣ, v₁) : remis en vraies balises, pour que les lettres puissent être en italique */
const HAUT={"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁺":"+","⁻":"−","⁼":"=","⁽":"(","⁾":")","ⁿ":"n","ⁱ":"i","ˣ":"x","ʸ":"y","ᵘ":"u","ᵉ":"e","ᵏ":"k","ᵗ":"t","ᵃ":"a","ᵇ":"b","ᶜ":"c","ᵈ":"d","ᵐ":"m","ᵖ":"p","ʳ":"r","ˢ":"s","ᵛ":"v","ʷ":"w","ᶻ":"z","ʰ":"h","ʲ":"j","ˡ":"l","ᵒ":"o","ᶠ":"f","ᵍ":"g","ᶿ":"θ","ᵅ":"α","′":"′","″":"′′"};
const BAS={"₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","₊":"+","₋":"−","₌":"=","₍":"(","₎":")","ₐ":"a","ₑ":"e","ₒ":"o","ₓ":"x","ₕ":"h","ₖ":"k","ₗ":"l","ₘ":"m","ₙ":"n","ₚ":"p","ₛ":"s","ₜ":"t","ᵢ":"i","ⱼ":"j","ᵣ":"r","ᵤ":"u","ᵥ":"v"};
const DROIT=new Set("ln log exp cos sin tan cotan ch sh th lim arg max min sup inf det ker im Re Im Vect Card Mat Id rg dim Tr mod pgcd ppcm et ou si donc sur pour avec CC TD TP".split(" "));
const ATOME=/[0-9A-Za-zÀ-ÿα-ωΑ-Ω′″∞√-]/;
const textes=el=>{const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),L=[];let n;while((n=w.nextNode()))L.push(n);return L;};
function unGroupe(x){if(x[0]!=="("||x[x.length-1]!==")")return false;let p=0;for(let k=0;k<x.length;k++){if(x[k]==="(")p++;else if(x[k]===")"&&--p===0&&k<x.length-1)return false;}return p===0;}
/* coupe « a/b » en numérateur et dénominateur : un opérande est une suite collée de lettres, chiffres et groupes entre parenthèses ;
   ℓ et la factorielle en font partie (« ℓ²/4 », « 1/n! ») ; hb : les marques d'un exposant ou d'un indice, qui ne commencent jamais un opérande */
const at=c=>ATOME.test(c)||c==="ℓ"||c==="!";
function fractions(t,hb){
  const out=[];let debut=0;
  const chiffre=(k,d)=>(t[k]===","||t[k]===".")&&/\d/.test(t[k-1]||"")&&/\d/.test(t[k+1]||"");
  for(let k=1;k<t.length-1;k++){
    if(t[k]!=="/")continue;
    let a=k-1;
    while(a>=debut){const c=t[a];
      if(at(c)||chiffre(a))a--;
      else if(c===")"){let p=1,m=a-1;while(m>=debut&&p){if(t[m]===")")p++;else if(t[m]==="(")p--;m--;}if(p)break;a=m;}
      else break;}
    let b=k+1;
    while(b<t.length){const c=t[b];
      if(at(c)||chiffre(b))b++;
      else if(c==="("){let p=1,m=b+1;while(m<t.length&&p){if(t[m]==="(")p++;else if(t[m]===")")p--;m++;}if(p)break;b=m;}
      else break;}
    let n=t.slice(a+1,k),d=t.slice(k+1,b);
    if(!n||!d||n.includes("/")||t[b]==="/"||t[a]==="/"||hb&&(hb.has(n[0])||hb.has(d[0])))continue;
    if(unGroupe(n))n=n.slice(1,-1);if(unGroupe(d))d=d.slice(1,-1);
    /* « (2/3) u » : la fraction empilée n'a plus besoin de ses parenthèses, sauf après un nom de fonction
       ou devant un exposant ou un indice : (2/7)ⁿ n'est pas 2/7ⁿ */
    if(t[a]==="("&&t[b]===")"&&!(a>0&&ATOME.test(t[a-1]))&&!(hb&&hb.has(t[b+1]))){a--;b++;}
    out.push(t.slice(debut,a+1),{n:fractions(n,hb),d:fractions(d,hb)});debut=b;k=b-1;}
  out.push(t.slice(debut));return out;
}
/* mise en forme d'une formule déjà repérée : exposants, fractions, lettres en italique */
function orne(span){
  textes(span).forEach(nd=>{if(!nd.nodeValue.includes("≠")||nd.parentNode.closest(".ne"))return;const f=document.createDocumentFragment();
    nd.nodeValue.split("≠").forEach((x,k)=>{if(k){const e=document.createElement("span");e.className="ne";e.textContent="≠";f.appendChild(e);}if(x)f.appendChild(document.createTextNode(x));});
    nd.parentNode.replaceChild(f,nd);});
  textes(span).forEach(nd=>{const v=nd.nodeValue;if(!/[′″⁰¹²³⁴-⁹⁺⁻⁼⁽⁾ⁿⁱˣʸᵘᵉᵏᵗᵃᵇᶜᵈᵐᵖʳˢᵛʷᶻʰʲˡᵒᶠᵍᶿᵅ₀-₉₊₋₌₍₎ₐₑₒₓₕₖₗₘₙₚₛₜᵢⱼᵣᵤᵥ]/.test(v))return;
    const f=document.createDocumentFragment();let cur=null,genre="";
    for(const c of v){const g=HAUT[c]?"sup":BAS[c]?"sub":"";
      if(g!==genre||!cur){cur=g?document.createElement(g):document.createTextNode("");f.appendChild(cur);genre=g;}
      if(g)cur.textContent+=g==="sup"?HAUT[c]:BAS[c];else cur.nodeValue+=c;}
    nd.parentNode.replaceChild(f,nd);});
  if(span.textContent.includes("/")&&!span.closest("sup,sub")){
    const E=[];let t="";span.childNodes.forEach(c=>{if(c.nodeType===3)t+=c.nodeValue;else{t+=String.fromCharCode(0xE000+E.length);E.push(c);}});
    const P=fractions(t,new Set(E.map((e,k)=>/^SU[PB]$/.test(e.nodeName)?String.fromCharCode(0xE000+k):"").filter(Boolean)));
    if(P.length>1){
      const pose=(hote,L)=>L.forEach(x=>{if(typeof x==="string"){let tx="";const vide=()=>{if(tx){hote.appendChild(document.createTextNode(tx));tx="";}};
          for(const c of x){const k=c.charCodeAt(0)-0xE000;if(k>=0&&k<E.length){vide();hote.appendChild(E[k]);}else tx+=c;}vide();return;}
        const fr=document.createElement("span");fr.className="fr";["fn","fs","fd"].forEach(cl=>{const e=document.createElement("span");e.className=cl;fr.appendChild(e);});
        pose(fr.children[0],x.n);fr.children[1].textContent="/";pose(fr.children[2],x.d);hote.appendChild(fr);});
      const f=document.createDocumentFragment();pose(f,P);span.textContent="";span.appendChild(f);}}
  textes(span).forEach(nd=>{const v=nd.nodeValue,p=nd.parentNode;if(p.closest("i,.fs")||!/[A-Za-zα-ω]/.test(v))return;
    const f=document.createDocumentFragment();let k=0;
    v.replace(/[A-Za-zÀ-ÖØ-öø-ÿα-ω]+/g,(m,pos)=>{if(DROIT.has(m)||/[À-ÿ]/.test(m)||/^[a-zA-Z]{4,}$/.test(m))return m;
      f.appendChild(document.createTextNode(v.slice(k,pos)));const i=document.createElement("i");i.textContent=m;f.appendChild(i);k=pos+m.length;return m;});
    if(!k)return;f.appendChild(document.createTextNode(v.slice(k)));p.replaceChild(f,nd);});
  pile(span);
}
/* écriture explicite : $…$ marque une formule ; dedans, ^{…} exposant, _{…} indice, ∫_{a}^{b} et ]_{a}^{b} avec bornes empilées */
const BORNES='<span class="ib"><sup>$2</sup><sub>$1</sub></span>';
function tx(s){return String(s).replace(/\$([^$]+)\$/g,(m,x)=>`<span class="mx">${x.replace(/∫_\{([^}]*)\}\^\{([^}]*)\}/g,'<span class="ig"><span class="is">∫</span>'+BORNES+'</span>').replace(/\]_\{([^}]*)\}\^\{([^}]*)\}/g,"]"+BORNES).replace(/lim_\{([^}]*)\}/g,'<span class="lm"><span>lim</span><span class="lb">$1</span></span>').replace(/\^\{([^}]*)\}/g,"<sup>$1</sup>").replace(/_\{([^}]*)\}/g,"<sub>$1</sub>")}</span>`);}
/* ∫ ou ] suivi d'un indice et d'un exposant : les deux bornes empilées, comme en LaTeX */
function pile(span){
  span.querySelectorAll("sub,sup").forEach(e=>{
    if(!e.isConnected||e.closest(".ib"))return;
    const p=e.previousSibling,n=e.nextSibling;if(!p||p.nodeType!==3||!n||n.nodeType!==1||!n.matches("sub,sup")||n.tagName===e.tagName)return;
    const c=p.nodeValue.slice(-1);if(c!=="∫"&&c!=="]")return;
    const haut=e.tagName==="SUP"?e:n,bas=haut===e?n:e,ib=document.createElement("span"),h=document.createElement("sup"),b=document.createElement("sub");
    ib.className="ib";while(haut.firstChild)h.appendChild(haut.firstChild);while(bas.firstChild)b.appendChild(bas.firstChild);ib.append(h,b);
    if(c==="∫"){p.nodeValue=p.nodeValue.slice(0,-1);const ig=document.createElement("span"),is=document.createElement("span");ig.className="ig";is.className="is";is.textContent="∫";ig.append(is,ib);e.before(ig);}
    else e.before(ib);
    e.remove();n.remove();});
}
function formules(root,tout){
  if(!root||root.closest(HORS))return;
  [...(root.matches(".mx")?[root]:[]),...root.querySelectorAll(".mx")].forEach(m=>{m.className="mi";orne(m);});
  const ferme=e=>{const d=e.parentElement&&e.parentElement.closest("details");return d&&!d.open&&e.tagName!=="SUMMARY"&&!e.closest("summary");};
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>e.matches(HORS)||ferme(e)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const L=[];let e=root;do{if(e.nodeType===1&&!e.matches(HORS))L.push(e);}while((e=tw.nextNode()));
  L.forEach(P=>{
    if(P.closest(".mi"))return;
    let ok=false;for(const c of P.childNodes)if(c.nodeType===3&&/\S/.test(c.nodeValue)){ok=true;break;}
    if(!ok)return;
    const cs=getComputedStyle(P);
    if(/flex|grid/.test(cs.display)||(!tout&&!cs.fontFamily.includes("Gloock")))return;
    const txt=[...P.childNodes].filter(c=>c.nodeType===3).map(c=>c.nodeValue).join(" ");
    if(!FORT.test(txt)&&!P.querySelector(":scope>sup,:scope>sub,:scope>.vec")&&!/(^|[\s(])[A-Za-z]($|[\s.,;:)])/.test(txt))return;
    /* un nœud par mot et par espace */
    [...P.childNodes].forEach(c=>{if(c.nodeType!==3)return;const m=c.nodeValue.split(/(\s+)/).filter(x=>x!=="");if(m.length<2)return;
      const f=document.createDocumentFragment();m.forEach(x=>f.appendChild(document.createTextNode(x)));P.replaceChild(f,c);});
    const N=[...P.childNodes];
    const voisin=(i,d)=>{for(let j=i+d;j>=0&&j<N.length;j+=d){if(N[j].nodeType!==3)return "";if(/\S/.test(N[j].nodeValue))return N[j].nodeValue;}return "";};
    const G=N.map((c,i)=>c.nodeType===3?(/\S/.test(c.nodeValue)?genre(c.nodeValue,voisin(i,-1).replace(/[.,;:]+$/,""),voisin(i,1)):"e"):c.nodeType===1&&c.matches("sup,sub,.vec")?"F":"x");
    /* un mot ordinaire qui porte un exposant ou un indice fait partie de la formule */
    N.forEach((c,k)=>{if(k&&c.nodeType===1&&c.matches("sup,sub")&&G[k-1]==="x"&&N[k-1].nodeType===3)G[k-1]="F";});
    const faits=[];
    const enrobe=(a,b)=>{const s=document.createElement("span");s.className="mi";P.insertBefore(s,N[a]);for(let k=a;k<=b;k++)s.appendChild(N[k]);faits.push(s);};
    let i=0;while(i<N.length){
      if(G[i]!=="F"&&G[i]!=="f"&&G[i]!=="L"){i++;continue;}
      let j=i,fin=i,fort=false;
      /* une parenthèse ouverte sur un mot faible, « (TD 2) », ferme la formule */
      while(j<N.length&&G[j]!=="x"&&!(j>i&&G[j]!=="F"&&G[j]!=="e"&&N[j].nodeValue[0]==="(")){if(G[j]!=="e"){fin=j;if(G[j]==="F")fort=true;}j++;}
      /* sans signe de maths : une liste de lettres (« x, y ») passe en entier, sinon chaque lettre seule */
      const lettres=()=>{let l=false;for(let k=i;k<=fin;k++){if(G[k]==="e")continue;if(G[k]==="L")l=true;else if(!/^[A-Za-z][.,;:]?$/.test(N[k].nodeValue))return false;}return l;};
      if(fort||lettres())enrobe(i,fin);else for(let k=i;k<=fin;k++)if(G[k]==="L")enrobe(k,k);
      i=G[j]==="x"||j>=N.length?j+1:j;}
    P.normalize();faits.forEach(orne);});
}

function mq(root){
  const norm=s=>String(s).normalize("NFKC").toLowerCase().replace(/[−–—]/g,"-").replace(/→/g,"->").replace(/[“”«»"]/g,"").replace(/[’‘′]/g,"'").replace(/\s+/g,"").replace(/;;$/,"")
    .replace(/sqrt/g,"√").replace(/^[a-z]_?[a-z]?'?(\([a-z]\))?=/,"").replace(/[\^*×·{}()]/g,"").replace(/dx$/,"").replace(/\+[ck]$/,"");
  root.querySelectorAll(".mq").forEach(b=>{
    const inp=b.querySelector("input"),ver=b.querySelector(".verdict"),ex=b.querySelector(".expl"),ok=b.dataset.ok.split("§");
    const valider=()=>{const v=norm(inp.value);ver.hidden=false;
      if(!v){ver.className="verdict info";ver.textContent="Écris d'abord ta réponse.";return;}
      const bon=ok.some(a=>a[0]==="~"?v.includes(norm(a.slice(1))):v===norm(a));
      ver.className="verdict "+(bon?"ok":"no");
      ver.textContent=bon?"Juste !":"Pas ça. Réessaie, ou clique sur « Voir la réponse ».";
      if(bon)ex.hidden=false;};
    b.querySelector('[data-mq="ok"]').addEventListener("click",valider);
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")valider();});
    b.querySelector('[data-mq="voir"]').addEventListener("click",()=>{ex.hidden=false;});
    const pow=b.querySelector('[data-mq="pow"]'),ap=b.querySelector(".mq-apercu");
    const maj=()=>{if(!ap)return;const t=inp.value;ap.hidden=!/[\^⁰¹²³⁴⁵⁶⁷⁸⁹⁻ⁿˣ]/.test(t);if(!ap.hidden)ap.innerHTML="Ce que tu as écrit : "+mth(t);};
    inp.addEventListener("input",maj);
    if(pow)pow.addEventListener("click",()=>{const a=inp.selectionStart==null?inp.value.length:inp.selectionStart,z=inp.selectionEnd==null?a:inp.selectionEnd,p=z+2;
      inp.value=inp.value.slice(0,a)+"^("+inp.value.slice(a,z)+")"+inp.value.slice(z);inp.focus();inp.setSelectionRange(p,p);maj();});
  });
}
const de=n=>(/^[aeiouyàâäéèêëîïôöûüAEIOUYÀÂÄÉÈÊËÎÏÔÖÛÜ]/.test(n)?"d'":"de ")+n;
window.W={de,mq,tx,esc,sup,mth,formules,code,hlCode,tracer,calltree,sortviz,dicho,listlab,drill,rewrite,plotter};
})();
