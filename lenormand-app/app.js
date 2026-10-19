(function () {
  'use strict';

  const D = window.LENORMAND;
  const CARDS = D.cards;
  const POS = new Map(CARDS.map((c, i) => [c.id, i]));
  const byId = (id) => CARDS[POS.get(id)];
  const DIFFERS = new Set(D.differs);
  const SECTIONS = [
    ['keywords', 'Keywords'],
    ['meaning', 'Meaning'],
    ['compare', 'Compare'],
    ['pairs', 'Pairs'],
  ];

  // a, b: the two cards on the table. picking: which of them the open
  // picker sheet will set ('a', 'b' or null when the sheet is closed).
  const state = { a: null, b: null, section: 'keywords', picking: null };
  const scrolls = new Map();
  // True while the sheet asks for a partner right after a card was picked
  // on the home grid; closing it then means "read this card alone".
  let chained = false;

  const el = (id) => document.getElementById(id);
  const app = el('app');
  const reader = el('reader');
  const shade = el('shade');
  const sheet = el('sheet');
  const sheetTitle = el('sheet-title');
  const sheetClose = el('sheet-close');
  const sheetGrid = el('sheet-grid');
  const dock = el('dock');
  const tabs = el('tabs');

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]
  ));

  const fullName = (c) => (c.version ? `${c.name} (${c.version})` : c.name);

  // ---------- location ----------

  function hashOf(s) {
    if (!s.a) return '';
    if (s.b) return `${s.a}~${s.b}`;
    return s.section === 'keywords' ? s.a : `${s.a}.${s.section}`;
  }

  function parseHash() {
    let h = '';
    try { h = decodeURIComponent(location.hash.slice(1)); } catch (_) { /* keep home */ }
    const [pair, section] = h.split('.');
    const [a, b] = (pair || '').split('~');
    const known = SECTIONS.some(([id]) => id === section);
    return {
      a: POS.has(a) ? a : null,
      b: POS.has(a) && POS.has(b) ? b : null,
      section: known ? section : 'keywords',
    };
  }

  const viewKey = () => hashOf(state) || 'home';
  const saveScroll = () => scrolls.set(viewKey(), reader.scrollTop);

  function go(next, replace) {
    saveScroll();
    chained = false;
    const before = hashOf(state);
    Object.assign(state, { picking: null }, next);
    const after = hashOf(state);
    if (after !== before) {
      try {
        const url = after ? `#${after}` : location.pathname + location.search;
        history[replace ? 'replaceState' : 'pushState'](null, '', url);
      } catch (_) { /* history can be locked down in embedded frames */ }
    }
    render();
  }

  function fromLocation() {
    const next = parseHash();
    if (hashOf(next) === hashOf(state) && !state.picking) return;
    saveScroll();
    Object.assign(state, next, { picking: null });
    render();
  }

  // ---------- pieces ----------

  function tile(c) {
    const sub = c.extra && c.version ? `<span class="tile-sub">${esc(c.version)}</span>` : '';
    const long = c.name.length > 8 ? ' long' : '';
    return `<button type="button" class="tile" data-pick="${c.id}" aria-label="${esc(`${c.num} ${fullName(c)}`)}">`
      + `<span class="tile-num">${esc(c.num)}</span>`
      + `<span class="tile-name${long}">${esc(c.name)}</span>${sub}</button>`;
  }

  function gridHTML() {
    return `<div class="grid">${CARDS.filter((c) => !c.extra).map(tile).join('')}</div>`
      + '<p class="grid-label">Second versions &amp; Wild Card</p>'
      + `<div class="grid grid-extra">${CARDS.filter((c) => c.extra).map(tile).join('')}</div>`;
  }

  function markTiles(root) {
    root.querySelectorAll('.tile').forEach((t) => {
      const id = t.dataset.pick;
      t.dataset.on = id === state.a ? 'a' : id === state.b ? 'b' : '';
    });
  }

  function cardHead(c) {
    const chip = c.version ? ` <span class="chip">${esc(c.version)}</span>` : '';
    return `<header class="card-head">
      <span class="card-num" aria-hidden="true">${esc(c.num)}</span>
      <div>
        <h1 class="card-name"><span class="sr-only">${esc(c.num)} </span>${esc(c.name)}${chip}</h1>
        <p class="tagline">${esc(c.tagline)}</p>
      </div>
    </header>`;
  }

  // ---------- views ----------

  function homeView() {
    return `<div class="home">
      <header>
        <h1 class="brand">Lenormand <em>Pairs</em></h1>
        <p class="lede">Tap a card, then its partner, to read the combination. To study one card on its own, tap it and choose <b>Read alone</b>.</p>
      </header>
      <div class="home-grid">${gridHTML()}</div>
      <p class="credit">Keywords, meanings, comparisons and combinations from <a href="https://www.annak-tarot.at/" target="_blank" rel="noopener">annak-tarot.at</a>.</p>
    </div>`;
  }

  function keywordsView(c) {
    const note = c.note ? `<p class="note">${c.note}</p>` : '';
    const rows = c.keywords.map(([label, html]) => {
      const cls = label === 'Time factor' ? 'kw-row kw-time' : 'kw-row';
      return `<div class="${cls}"><dt>${esc(label)}</dt><dd>${html}</dd></div>`;
    });
    return `${note}<dl class="kw">${rows.join('')}</dl>`;
  }

  function pairsView(c) {
    const row = D.pairs[c.id];
    const items = D.order.map((id, j) => {
      const p = byId(id);
      return `<li>
        <button type="button" class="pair-open" data-partner="${id}">
          <span class="pl-num">${esc(p.num)}</span>
          <span class="pl-name">${esc(fullName(p))}</span>
          <span class="pl-go" aria-hidden="true">&rarr;</span>
        </button>
        ${row[j]}
      </li>`;
    });
    return `<ol class="pair-list">${items.join('')}</ol><p class="note pairs-note">${D.pairsNote}</p>`;
  }

  function cardView() {
    const c = byId(state.a);
    const [section, label] = SECTIONS.find(([id]) => id === state.section);
    let body;
    if (section === 'meaning') body = `<div class="prose">${c.meaning}</div>`;
    else if (section === 'compare') body = `<div class="prose">${c.compare}</div>`;
    else if (section === 'pairs') body = pairsView(c);
    else body = keywordsView(c);
    return `<article>
      ${cardHead(c)}
      <h2 class="eyebrow">${label}</h2>
      ${body}
      <p class="source"><a href="${esc(c.sources[section])}" target="_blank" rel="noopener">${esc(fullName(c))} &middot; ${label} on annak-tarot.at &#8599;</a></p>
    </article>`;
  }

  function who(c, slot) {
    return `<button type="button" class="who who-${slot}" data-study="${c.id}" aria-label="${esc(`Study ${fullName(c)}`)}">
      <span class="who-num">${esc(c.num)}</span>
      <span class="who-name">${esc(fullName(c))}</span>
      <span class="who-tag">${esc(c.tagline)}</span>
      <span class="who-open" aria-hidden="true">Open card</span>
    </button>`;
  }

  function pairView() {
    const a = byId(state.a);
    const b = byId(state.b);
    const ia = POS.get(a.id);
    const ib = POS.get(b.id);
    const key = ia <= ib ? `${a.id}~${b.id}` : `${b.id}~${a.id}`;
    const alt = a.id !== b.id && DIFFERS.has(key)
      ? `<section class="alt"><h2 class="eyebrow">Worded differently on the ${esc(fullName(b))} page</h2>${D.pairs[b.id][ia]}</section>`
      : '';
    return `<article>
      <h1 class="sr-only">${esc(fullName(a))} and ${esc(fullName(b))}</h1>
      <header class="pair-head">
        ${who(a, 'a')}
        <span class="pair-plus" aria-hidden="true">+</span>
        ${who(b, 'b')}
      </header>
      <div class="combo">${D.pairs[a.id][ib]}</div>
      ${alt}
      <p class="source">From the ${esc(fullName(a))} combinations on <a href="${esc(a.sources.pairs)}" target="_blank" rel="noopener">annak-tarot.at &#8599;</a></p>
    </article>`;
  }

  // ---------- render ----------

  function renderDock() {
    dock.hidden = !state.a;
    ['a', 'b'].forEach((s) => {
      const c = state[s] ? byId(state[s]) : null;
      const pick = el(`slot-${s}`);
      const clear = el(`clear-${s}`);
      const slot = pick.parentElement;
      pick.innerHTML = c
        ? `<span class="slot-num">${esc(c.num)}</span><span class="slot-name">${esc(fullName(c))}</span>`
        : '<span class="slot-empty">+ Pair with&hellip;</span>';
      pick.setAttribute('aria-label', c
        ? `${s === 'a' ? 'First' : 'Second'} card, ${fullName(c)}. Tap to change.`
        : 'Choose a second card');
      pick.setAttribute('aria-expanded', String(state.picking === s));
      slot.dataset.filled = c ? 'yes' : 'no';
      slot.dataset.active = state.picking === s ? 'yes' : 'no';
      clear.hidden = !c;
      if (c) clear.setAttribute('aria-label', `Remove ${fullName(c)}`);
    });
    tabs.hidden = !state.a || Boolean(state.b);
    tabs.innerHTML = SECTIONS.map(([id, label]) => (
      `<button type="button" class="tab" data-section="${id}" aria-current="${state.section === id ? 'page' : 'false'}">${label}</button>`
    )).join('');
  }

  function renderSheet() {
    const open = Boolean(state.picking);
    sheet.classList.toggle('open', open);
    shade.classList.toggle('open', open);
    sheet.inert = !open;
    reader.inert = open;
    if (!open) return;
    const a = state.a ? byId(state.a) : null;
    const b = state.b ? byId(state.b) : null;
    if (state.picking === 'b') {
      sheetTitle.textContent = b ? `Replace ${fullName(b)}` : `Pair ${fullName(a)} with…`;
      sheetClose.textContent = chained ? 'Read alone' : 'Cancel';
    } else {
      sheetTitle.textContent = a ? `Replace ${fullName(a)}` : 'Choose a card';
      sheetClose.textContent = 'Cancel';
    }
    if (!sheetGrid.firstChild) sheetGrid.innerHTML = gridHTML();
    markTiles(sheetGrid);
  }

  function render() {
    const mode = state.b ? 'pair' : state.a ? 'card' : 'home';
    app.dataset.mode = mode;
    reader.innerHTML = mode === 'pair' ? pairView() : mode === 'card' ? cardView() : homeView();
    if (mode === 'home') markTiles(reader);
    if (mode === 'card' && state.section === 'compare') {
      reader.querySelectorAll(`.cmp a[data-card="${state.a}"]`).forEach((a) => {
        a.closest('li').classList.add('self');
      });
    }
    renderDock();
    renderSheet();
    reader.scrollTop = scrolls.get(viewKey()) || 0;
    const a = state.a && fullName(byId(state.a));
    const b = state.b && fullName(byId(state.b));
    document.title = b ? `${a} + ${b} · Lenormand Pairs` : a ? `${a} · Lenormand Pairs` : 'Lenormand Pairs';
  }

  function setPicking(p) {
    chained = false;
    state.picking = p;
    renderSheet();
    renderDock();
    if (p) sheet.focus({ preventScroll: true });
  }

  function pick(id) {
    if (!state.picking) {
      // From the home grid: show the card and go straight on to its partner.
      go({ a: id, b: null, section: 'keywords', picking: 'b' });
      chained = true;
      renderSheet();
    } else if (state.picking === 'b') {
      go({ b: id });
    } else {
      go({ a: id });
    }
  }

  // ---------- input ----------

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    const d = t.dataset;
    if (d.pick) pick(d.pick);
    else if (d.partner) go({ b: d.partner });
    else if (d.study) go({ a: d.study, b: null, section: 'keywords' });
    else if (d.card) {
      e.preventDefault();
      go({ a: d.card, b: null, section: d.section || 'keywords' });
    } else if (t.classList.contains('tab')) {
      go({ section: d.section }, true);
    } else if (t.id === 'slot-a' || t.id === 'slot-b') {
      const s = t.id.slice(-1);
      setPicking(state.picking === s ? null : s);
    } else if (t.id === 'clear-a') {
      go(state.b ? { a: state.b, b: null } : { a: null, b: null });
    } else if (t.id === 'clear-b') {
      go({ b: null });
    } else if (t.id === 'sheet-close') {
      setPicking(null);
    }
  });

  shade.addEventListener('click', () => setPicking(null));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.picking) setPicking(null);
  });

  // Drag the sheet down to dismiss it.
  let dragFrom = null;
  sheet.addEventListener('touchstart', (e) => {
    dragFrom = sheet.scrollTop <= 0 ? e.touches[0].clientY : null;
  }, { passive: true });
  sheet.addEventListener('touchmove', (e) => {
    if (dragFrom === null) return;
    const dy = e.touches[0].clientY - dragFrom;
    if (dy > 8) {
      sheet.classList.add('dragging');
      sheet.style.transform = `translateY(${dy}px)`;
    }
  }, { passive: true });
  sheet.addEventListener('touchend', (e) => {
    if (dragFrom === null) return;
    const dy = e.changedTouches[0].clientY - dragFrom;
    dragFrom = null;
    sheet.classList.remove('dragging');
    sheet.style.transform = '';
    if (dy > 80) setPicking(null);
  });

  window.addEventListener('popstate', fromLocation);
  window.addEventListener('hashchange', fromLocation);

  Object.assign(state, parseHash());
  render();
}());
