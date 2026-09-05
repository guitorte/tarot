/* engine.js — a lógica do /gen isolada da interface.
   Todos os protótipos de layout carregam deck.js + img.js + engine.js e só
   mudam o HTML/CSS em volta. Assim dá pra comparar layouts, não motores. */
(function(global){

const DECK = global.DECK;
const CARD_FILE = global.CARD_FILE;

/* ---- naipes ---- */
const SUIT_GLYPH = {Copas:"♥", Espadas:"⚔", Paus:"♣", Ouros:"♦", "Arcanos Maiores":"✦"};
const SUIT_ORDER = ["Arcanos Maiores","Copas","Ouros","Paus","Espadas"];
const SUIT_COLOR = {Copas:"#d1495b", Espadas:"#4a5b7a", Paus:"#c2681c", Ouros:"#9a7b26", "Arcanos Maiores":"#6b4fae"};
function suitOf(name){
  if(/de Copas/.test(name))return"Copas";
  if(/de Espadas/.test(name))return"Espadas";
  if(/de Paus/.test(name))return"Paus";
  if(/de Ouros/.test(name))return"Ouros";
  return"Arcanos Maiores";
}
function cleanName(name){return name.replace(/^\d+\.\s*/,"");}

/* ---- imagens ---- */
const BASE = "../../img/";
function imgMini(name){return BASE+"mini/"+CARD_FILE[name];}   // 110px  (~6 kB) — grades
function imgThumb(name){return BASE+"thumbs/"+CARD_FILE[name];} // 260px (~28 kB) — carta em foco
function imgFull(name){return BASE+CARD_FILE[name];}            // original (~800 kB) — só sob demanda

/* ---- palavras-chave ---- */
const SECTION=new Set(["positivo","negativo"]);
function clean(arr){
  const seen=new Set(),out=[];
  for(let w of arr||[]){if(!w)continue;w=w.trim();const k=w.toLowerCase();
    if(SECTION.has(k)||seen.has(k))continue;seen.add(k);out.push(w);}
  return out;
}
function pos(card){return clean((card.description.find(d=>d.title==="Positivo")||{}).points);}
function neg(card){return clean((card.description.find(d=>d.title==="Negativo")||{}).points);}
function byName(n){return DECK.find(c=>c.name===n);}

/* ---- as cinco lentes ---- */
function tag(w){return '<span class="kw">'+w+'</span>';}
const LENSES=[
  {n:"1",name:"Engendra",ac:"#30b15a",
   gloss:'uma faz a outra nascer. <em>o que a origem faz brotar no destino?</em>',
   short:'uma faz a outra nascer',
   build:(x,y,n)=>seeds(cross(pos(x),pos(y)),'same',(a,b)=>tag(a)+' vira '+tag(b),n)},
  {n:"2",name:"Conflito",ac:"#ff3b30",
   gloss:'as duas se chocam. <em>onde elas brigam?</em>',
   short:'onde elas brigam',
   build:(x,y,n)=>seeds(cross(pos(x),neg(y)).concat(cross(neg(x),pos(y))),'diff',
      (a,b)=>tag(a)+' bate de frente com '+tag(b),n)},
  {n:"3",name:"Estagnado",ac:"#8e94a0",
   gloss:'uma trava diante da outra — por conforto, não por briga. <em>o que faz a origem parar?</em>',
   short:'o que faz a origem parar',
   build:(x,y,n)=>seeds(cross(pos(x),pos(y)),'same',(a,b)=>tag(a)+' estaciona no conforto de '+tag(b),n)},
  {n:"4",name:"Reduz-se",ac:"#ff9500",
   gloss:'a origem encolhe e vira uma versão menor. <em>em que versão pequena ela cai?</em>',
   short:'em que versão pequena ela cai',
   build:(x,y,n)=>seeds(cross(pos(x),neg(y)),'same',(a,b)=>tag(a)+' encolhe até virar '+tag(b),n)},
  {n:"5",name:"Necessita",ac:"#0a84ff",
   gloss:'uma precisa da outra pra se completar. <em>o que falta na origem que o destino tem?</em>',
   short:'o que falta na origem',
   build:(x,y,n)=>seeds(cross(neg(x),pos(y)),'same',(a,b)=>tag(a)+' pede '+tag(b),n)},
];

/* ---- pareamento temático (idêntico ao /gen atual) ---- */
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
const THEMES=[
  ["emocao",["amor","sentiment","emoc","afet","coraca","compaix","intuic","ternura","carinho","sensi","paix","romanc","calor","bondade","empat","devo","nutri","acolhe"]],
  ["controle",["autoridad","controle","controla","discipl","poder","domin","comand","lider","estrutura","ordem","regra","rigid","rigor","contenc","limit","frontei","prote","seguranc","estabilidad","frugal","posse","mesquinh","reprimi"]],
  ["conflito",["conflito","briga","agress","hostil","ataque","viol","raiva","bully","intimid","disput","rivalidad","guerra","competic","desacord","tensao","discuss","vingan","cruel","brutal","desafio","teimos","defensiv"]],
  ["perda",["perda","luto","tristeza","dor","magoa","separac","abandon","decep","lament","vazio","solidao","isolament","desgost","desespero","ruina","fracasso","derrota","traum","sofr","amargura"]],
  ["mente",["clareza","razao","logic","mente","ideia","verdade","foco","visao","analise","intelect","comunica","pensament","conheciment","perce","sabedoria","lucidez","discern","objetiv","critic","estrateg"]],
  ["acao",["acao","energia","moviment","impuls","coragem","iniciativa","entusiasm","aventura","ousad","velocidad","progress","conquist","ambic","determin","vontade","paixao","vital","dinam","rapid"]],
  ["material",["dinheiro","recurso","abundanc","prosperidad","riqueza","material","trabalho","financ","ganho","colheita","heranc","legado","economia","luxo","negocio","provedor","lucr"]],
  ["medo",["medo","ansiedad","inseguranc","preocupac","panico","pesadelo","angust","duvida","hesitac","fragil","vulnerab","incerteza","confus"]],
  ["estagnacao",["estagnac","bloqueio","preso","paralis","parad","inercia","restric","obstac","atraso","monoton","apatia","indecis","procrastin","tedio","impasse","limita","preguic","passiv"]],
  ["crescimento",["cresciment","cura","renovac","esperanc","despertar","transformac","evoluc","amadurec","realizac","manifestac","conclusao","integrac","completude","aprend","perdao","aceitac"]],
  ["uniao",["uniao","parceria","conexao","comunidade","amizade","grupo","colabora","equipe","vinculo","pertenc","harmonia","reuniao","celebrac","social","mediac","diploma"]],
  ["liberdade",["liberdade","independ","autonomia","libertac","escapism","fuga","partir","deixar","espontane","rebel"]],
  ["ilusao",["ilusao","engano","mentira","fantasia","manipula","mascara","segredo","astuc","trama","fraude","devaneio","sonhador","idealism","ingenu"]],
];
function themesOf(w){const n=norm(w),t=[];
  for(const[name,subs]of THEMES){for(const s of subs){if(n.includes(s)){t.push(name);break;}}}
  return t;}
function shuf(arr){const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;}
function cross(a,b){const out=[];for(const x of a)for(const y of b)if(x&&y&&x!==y)out.push([x,y]);return out;}
function seeds(cands,mode,fmt,n=3){
  const pref=[],rest=[];
  for(const[a,b]of cands){
    const ta=themesOf(a),tb=themesOf(b),shared=ta.some(t=>tb.includes(t));
    const fits=mode==='same'?shared:(ta.length&&tb.length&&!shared);
    (fits?pref:rest).push([a,b]);
  }
  const order=[...shuf(pref),...shuf(rest)];
  const seen=new Set(),usedA=new Set(),usedB=new Set(),out=[];
  for(const relax of [false,true]){
    for(const[a,b]of order){
      const s=fmt(a,b);
      if(seen.has(s)||(!relax&&(usedA.has(a)||usedB.has(b))))continue;
      seen.add(s);usedA.add(a);usedB.add(b);out.push(s);
      if(out.length>=n)return out;
    }
  }
  return out;
}

/* ---- atalhos usados pelos protótipos ---- */
function readingFor(nameA,nameB,perLens=3){
  const x=byName(nameA), y=byName(nameB);
  return LENSES.map(L=>({lens:L, seeds:L.build(x,y,perLens)}));
}
function flatSeeds(nameA,nameB,perLens=3){
  const out=[];
  readingFor(nameA,nameB,perLens).forEach(r=>r.seeds.forEach(s=>out.push({lens:r.lens,text:s})));
  return out;
}
function randomPair(){
  let i=Math.floor(Math.random()*DECK.length),j;
  do{j=Math.floor(Math.random()*DECK.length);}while(j===i);
  return [DECK[i].name, DECK[j].name];
}
function groupedDeck(query){
  const q=(query||'').trim().toLowerCase(), groups={};
  DECK.forEach(c=>{
    if(q && !norm(cleanName(c.name)).includes(norm(q)) && !norm(c.name).includes(norm(q)))return;
    const s=suitOf(c.name);(groups[s]=groups[s]||[]).push(c);
  });
  return SUIT_ORDER.filter(s=>groups[s]).map(s=>({suit:s, cards:groups[s]}));
}
function buzz(ms){ if(navigator.vibrate) try{navigator.vibrate(ms||8);}catch(e){} }

function moreSeeds(nameA,nameB,lensIndex,n){
  return LENSES[lensIndex].build(byName(nameA),byName(nameB),n||12);
}

global.TAROT = {DECK, LENSES, moreSeeds, SUIT_GLYPH, SUIT_ORDER, SUIT_COLOR,
  suitOf, cleanName, pos, neg, byName, imgMini, imgThumb, imgFull,
  readingFor, flatSeeds, randomPair, groupedDeck, buzz, tag};

})(window);
