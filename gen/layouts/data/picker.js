/* picker.js — folha inferior com grade de fotos + busca.
   Compartilhada pelos protótipos que não têm um seletor próprio.
   Uso:  Picker.open({title:'Carta de origem', selected:nome, onPick:fn}) */
(function(global){
const T=()=>global.TAROT;

const css=`
.pk-scrim{position:fixed;inset:0;z-index:80;background:rgba(24,21,17,.45);
  opacity:0;pointer-events:none;transition:opacity .22s}
.pk-scrim.on{opacity:1;pointer-events:auto}
.pk{position:fixed;left:0;right:0;bottom:0;z-index:81;max-height:86vh;
  background:var(--paper);border-radius:20px 20px 0 0;display:flex;flex-direction:column;
  transform:translateY(102%);transition:transform .28s cubic-bezier(.22,1,.36,1);
  box-shadow:0 -10px 34px rgba(24,21,17,.28);padding-bottom:var(--safe-b)}
.pk.on{transform:none}
.pk-grab{flex:0 0 auto;width:42px;height:5px;border-radius:5px;background:var(--line);margin:9px auto 2px}
.pk-head{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:6px 16px 8px}
.pk-title{font-family:var(--serif);font-size:17px;font-weight:600}
.pk-x{width:44px;height:44px;border-radius:50%;color:var(--muted);font-size:22px}
.pk-search{flex:0 0 auto;margin:0 16px 8px;display:flex;align-items:center;gap:8px;background:var(--paper-2);
  border-radius:12px;padding:0 12px}
.pk-search input{flex:1;border:none;background:none;outline:none;font-size:16px;
  padding:13px 0;color:var(--ink);font-family:var(--sans)}
.pk-tabs{flex:0 0 auto;display:flex;gap:6px;overflow-x:auto;padding:2px 16px 10px;scrollbar-width:none}
.pk-tabs::-webkit-scrollbar{display:none}
.pk-tab{flex:0 0 auto;min-height:36px;padding:7px 12px;border-radius:999px;font-size:13px;
  background:var(--paper-2);color:var(--ink-2)}
.pk-tab.on{background:var(--ink);color:var(--paper)}
.pk-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
  padding:0 12px calc(18px + var(--safe-b))}
.pk-grp{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);
  font-weight:700;padding:14px 4px 8px;position:sticky;top:0;background:var(--paper);z-index:1}
.pk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.pk-cell{text-align:center}
.pk-cell img{width:100%;aspect-ratio:11/18;object-fit:cover;border-radius:10px;
  box-shadow:0 2px 8px rgba(34,31,26,.18)}
.pk-cell.on img{outline:3px solid var(--gold);outline-offset:2px}
.pk-cell span{display:block;font-size:11.5px;color:var(--ink-2);margin:5px 0 0;line-height:1.25}
.pk-none{padding:30px;text-align:center;color:var(--muted)}
`;

let root, scrim, sheet, listEl, searchEl, cfg={}, filterSuit=null;

function build(){
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  root=document.createElement('div');
  root.innerHTML=`<div class="pk-scrim" id="pkScrim"></div>
  <div class="pk" id="pkSheet" role="dialog" aria-modal="true">
    <div class="pk-grab"></div>
    <div class="pk-head"><span class="pk-title" id="pkTitle">Escolher carta</span>
      <button class="pk-x" id="pkX" aria-label="Fechar">×</button></div>
    <div class="pk-search">🔍<input id="pkSearch" type="text" inputmode="search"
        autocomplete="off" placeholder="Buscar carta…"></div>
    <div class="pk-tabs" id="pkTabs"></div>
    <div class="pk-list" id="pkList"></div>
  </div>`;
  document.body.appendChild(root);
  scrim=document.getElementById('pkScrim'); sheet=document.getElementById('pkSheet');
  listEl=document.getElementById('pkList'); searchEl=document.getElementById('pkSearch');
  scrim.onclick=close; document.getElementById('pkX').onclick=close;
  searchEl.oninput=paint;
  const tabs=document.getElementById('pkTabs');
  tabs.innerHTML=`<button class="pk-tab on" data-s="">todas</button>`+
    T().SUIT_ORDER.map(s=>`<button class="pk-tab" data-s="${s}">${T().SUIT_GLYPH[s]} ${s==='Arcanos Maiores'?'Maiores':s}</button>`).join('');
  tabs.onclick=e=>{const b=e.target.closest('.pk-tab'); if(!b)return;
    tabs.querySelectorAll('.pk-tab').forEach(t=>t.classList.toggle('on',t===b));
    filterSuit=b.dataset.s||null; paint(); listEl.scrollTop=0;};
}

function paint(){
  const groups=T().groupedDeck(searchEl.value)
    .filter(g=>!filterSuit||g.suit===filterSuit);
  listEl.innerHTML = groups.length ? groups.map(g=>
    `<div class="pk-grp">${g.suit}</div><div class="pk-grid">`+
    g.cards.map(c=>`<button class="pk-cell${cfg.selected===c.name?' on':''}" data-n="${c.name}">
      <img loading="lazy" decoding="async" src="${T().imgMini(c.name)}" alt="">
      <span>${T().cleanName(c.name)}</span></button>`).join('')+`</div>`).join('')
    : '<div class="pk-none">nenhuma carta encontrada</div>';
}

function open(options){
  cfg=options||{};
  if(!root) build();
  document.getElementById('pkTitle').textContent=cfg.title||'Escolher carta';
  searchEl.value=''; paint();
  scrim.classList.add('on'); sheet.classList.add('on');
  document.documentElement.style.overflow='hidden';
  listEl.onclick=e=>{const b=e.target.closest('.pk-cell'); if(!b)return;
    T().buzz(8); close(); cfg.onPick && cfg.onPick(b.dataset.n);};
}
function close(){
  if(!root)return;
  scrim.classList.remove('on'); sheet.classList.remove('on');
  document.documentElement.style.overflow='';
  if(document.activeElement) document.activeElement.blur();
}
global.Picker={open,close};
})(window);
