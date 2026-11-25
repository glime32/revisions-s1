/* Les preuves à savoir refaire (démos exigibles) : le texte du cours, mot pour mot,
   avec une phrase par ligne et les points et droites clés de la même couleur que sur la figure.
   k1 cyan · k2 orange · k3 violet · k4 bleu · k5 rose (les classes lk*, pk*, tk* des figures). */
(function(){
const KEYS={
 "demo-1-1-1":{"Δ′":"k2","Δ":"k1"},
 "demo-1-6-1":{"[AB]":"k1","ε":"k2"},
 "demo-2-1-2":{"s(M)":"k3","N":"k3","λ":"k2"},
 "demo-2-2-1":{"A″":"k5","A′":"k3","Δ":"k1","λ":"k2"},
 "demo-2-2-4":{"(BC)":"k1","(AD)":"k1","(CD)":"k3","(AB)":"k3","s(C)":"k2"},
 "demo-2-3-1":{"Δ′":"k3","Δ":"k1","s(A)":"k2"},
 "demo-2-4-1":{"H<sub>A</sub>":"k1","D":"k2"},
 "demo-2-5-1":{"H<sub>N</sub>":"k1","H<sub>M</sub>":"k2"},
 "demo-2-5-2":{"N′":"k2","N":"k1","Δ":"k3","(BC)":"k4"},
 "demo-3-1-2":{"O":"k1","(AB)":"k3","(CD)":"k3","(AD)":"k5","(BC)":"k5"},
 "demo-3-2-6":{'<span class="vec">u</span>':"k1","M":"k2","B′":"k5","B":"k3"},
 "demo-3-2-8":{"E′":"k5","E":"k1"}};
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
/* colore les objets clés, sans toucher au texte ni aux balises */
function colorKeys(html,map){
  const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
  keys.filter(k=>k.indexOf("<")>=0).forEach(k=>{html=html.split(k).join(`<span class="${map[k]}">${k}</span>`);});
  const plain=keys.filter(k=>k.indexOf("<")<0);if(!plain.length)return html;
  /* une lettre seule est un point si elle n'est pas dans un mot (« On », « L'assertion ») */
  const re=new RegExp(plain.map(k=>/^[A-Z]$/.test(k)?`(?<![a-zà-ÿ])${k}(?![a-zà-ÿ'’′″])`:esc(k)).join("|"),"g");
  let depth=0;
  return html.split(/(<[^>]+>)/).map(seg=>{
    if(seg.charAt(0)==="<"){if(/^<span class="k\d">/.test(seg))depth++;else if(depth&&seg==="</span>")depth--;return seg;}
    return depth?seg:seg.replace(re,m=>`<span class="${map[m]||map[m.charAt(0)]}">${m}</span>`);}).join("");}
/* une phrase par ligne : on coupe seulement après un point final, jamais au milieu d'une phrase */
function sentences(html){
  const one=h=>{const out=[];let cur="",depth=0,i=0;
    while(i<h.length){const ch=h[i];
      if(ch==="<"){const j=h.indexOf(">",i);if(j<0){cur+=h.slice(i);break;}const tag=h.slice(i,j+1);if(tag.charAt(1)==="/")depth=Math.max(0,depth-1);else if(!/\/>$/.test(tag)&&!/^<(br|img|wbr)\b/i.test(tag))depth++;cur+=tag;i=j+1;continue;}
      cur+=ch;i++;let m;
      if(!depth&&/[.!?]/.test(ch)&&(m=h.slice(i).match(/^\s+(?=[A-ZÀ-ÖØ-Þ«(<])/))){out.push(cur);cur="";i+=m[0].length;}}
    if(cur.trim())out.push(cur);return out.length>1?out.map(x=>`<span class="phr">${x}</span>`).join(""):h;};
  if(/<p[ >]/.test(html))return html.replace(/(<p(?: [^>]*)?>)([\s\S]*?)(<\/p>)/g,(all,a,b,c)=>/class="muted"/.test(a)?all:a+one(b)+c);
  return one(html);}
(window.CONCEPTS||[]).forEach(c=>{const map=KEYS[c.id];if(!map)return;
  if(c.redac)c.redac=sentences(colorKeys(c.redac,map));
  ["hyp","concl","idea"].forEach(f=>{if(typeof c[f]==="string")c[f]=colorKeys(c[f],map);});
  (c.steps||[]).forEach(s=>{if(s.w)s.w=colorKeys(s.w,map);});});
})();
