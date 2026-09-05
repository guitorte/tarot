/* app.js — o /gen de sempre, sem estilo nenhum.
   Mesma lógica, mesmo fluxo e mesmos textos do gen/index.html: dois seletores,
   inverter, sortear par, cinco lentes com três faíscas e o botão "Mais ideias".
   Cada skin só carrega este arquivo e pinta por cima. */
(function(){
const T=window.TAROT;
let sel=[null,null], pickerSlot=0;

/* --- a folha de seleção é criada aqui pra não se repetir em cada skin --- */
const sheetHTML=`
<div class="scrim" id="scrim"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Escolher carta">
  <div class="grab"></div>
  <div class="sheet-head">
    <span class="sheet-title" id="sheetTitle">Escolher carta</span>
    <button class="sheet-x" id="sheetX" aria-label="Fechar">×</button>
  </div>
  <div class="search-wrap">
    <input class="search" id="search" type="text" inputmode="search" autocomplete="off"
           placeholder="Buscar carta…">
  </div>
  <div class="list" id="list"></div>
</div>`;
document.body.insertAdjacentHTML('beforeend',sheetHTML);

const $=id=>document.getElementById(id);
const scrim=$('scrim'), sheet=$('sheet'), search=$('search'), list=$('list');

/* --- seleção --- */
function openPicker(slot){
  pickerSlot=slot;
  $('sheetTitle').textContent = slot===0?'Carta de origem':'Carta de destino';
  search.value=''; renderList();
  scrim.classList.add('open'); sheet.classList.add('open');
  document.documentElement.style.overflow='hidden';
  setTimeout(()=>search.focus(),120);
}
function closePicker(){
  scrim.classList.remove('open'); sheet.classList.remove('open');
  document.documentElement.style.overflow='';
  if(document.activeElement)document.activeElement.blur();
}
function renderList(){
  const groups=T.groupedDeck(search.value);
  list.innerHTML = groups.length ? groups.map(g=>
    `<div class="grp">${g.suit}</div>`+g.cards.map(c=>{
      const on=sel[pickerSlot]===c.name;
      return `<button class="row${on?' sel':''}" data-name="${c.name}">
        <span class="rg">${T.SUIT_GLYPH[g.suit]}</span>${T.cleanName(c.name)}
        ${on?'<span class="chk">✓</span>':''}</button>`;
    }).join('')).join('')
    : '<div class="nohit">nenhuma carta encontrada</div>';
}
list.addEventListener('click',e=>{
  const b=e.target.closest('.row'); if(!b)return;
  sel[pickerSlot]=b.dataset.name; T.buzz(8); closePicker(); render();
});
scrim.addEventListener('click',closePicker);
$('sheetX').addEventListener('click',closePicker);
search.addEventListener('input',renderList);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePicker();});

/* --- botões de carta --- */
function setBtn(slot){
  const btn=$('btn'+slot), name=sel[slot];
  if(!name){
    btn.classList.remove('filled');
    btn.innerHTML='<span class="glyph">✦</span><span class="ph">tocar p/ escolher</span>';
    return;
  }
  const s=T.suitOf(name);
  btn.classList.add('filled');
  btn.innerHTML=`<span class="glyph">${T.SUIT_GLYPH[s]}</span>
    <span class="name">${T.cleanName(name)}</span><span class="suit">${s}</span>`;
}

/* --- leitura --- */
function render(){
  setBtn(0); setBtn(1);
  const results=$('results'), empty=$('empty'), dock=$('dock'), fn=$('footnote');
  if(!sel[0]||!sel[1]){
    results.innerHTML=''; results.classList.remove('show');
    empty.classList.remove('hidden'); dock.classList.add('hidden'); fn.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden'); dock.classList.remove('hidden'); fn.classList.remove('hidden');
  let html=`<p class="pairline"><em>${T.cleanName(sel[0])}</em>
    <span class="ar">→</span><em>${T.cleanName(sel[1])}</em></p>`;
  T.readingFor(sel[0],sel[1]).forEach((r,i)=>{
    html+=`<article class="lens" style="--ac:${r.lens.ac};--d:${(i*0.05).toFixed(2)}s">
      <div class="lens-head"><span class="lens-n">${r.lens.n}</span>
        <span class="lens-name">${r.lens.name}</span></div>
      <p class="lens-gloss">${r.lens.gloss}</p>
      <ul class="seeds">${r.seeds.map(s=>
        `<li class="seed"><span class="dot">✦</span><span class="txt">${s}</span></li>`).join('')}</ul>
    </article>`;
  });
  results.innerHTML=html;
  results.classList.remove('show'); void results.offsetWidth; results.classList.add('show');
}

/* --- ações --- */
const actions={
  pick0:()=>openPicker(0),
  pick1:()=>openPicker(1),
  invert:()=>{sel=[sel[1],sel[0]];T.buzz(8);render();},
  random:()=>{sel=T.randomPair();T.buzz(12);render();},
  more:()=>{if(sel[0]&&sel[1]){T.buzz(8);render();}}
};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]'); if(!el)return;
  const fn=actions[el.dataset.act]; if(fn)fn();
});
$('btn0').addEventListener('click',()=>openPicker(0));
$('btn1').addEventListener('click',()=>openPicker(1));

render();
})();
