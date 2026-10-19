(function () {
  'use strict';

  const D = window.LENORMAND;
  const H = window.Highlights;
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
  let marksOpen = false;

  const el = (id) => document.getElementById(id);
  const app = el('app');
  const reader = el('reader');
  const shade = el('shade');
  const sheet = el('sheet');
  const sheetTitle = el('sheet-title');
  const sheetClose = el('sheet-close');
  const sheetGrid = el('sheet-grid');
  const marks = el('marks');
  const dock = el('dock');
  const tabs = el('tabs');
  const bar = el('hlbar');

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]
  ));

  const fullName = (c) => (c.version ? `${c.name} (${c.version})` : c.name);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // ---------- passages ----------
  //
  // Every highlightable text is one passage, named by a unit id:
  //   rider:note  rider:kw:Activities  rider:meaning  rider:compare
  //   rider~clover  (the Rider page's text for Rider + Clover)

  function unitHTML(unit) {
    const pair = unit.split('~');
    if (pair.length === 2) {
      return POS.has(pair[0]) && POS.has(pair[1]) ? D.pairs[pair[0]][POS.get(pair[1])] : null;
    }
    const [id, kind, label] = unit.split(':');
    const c = POS.has(id) ? byId(id) : null;
    if (!c) return null;
    if (kind === 'note') return c.note || null;
    if (kind === 'meaning') return c.meaning;
    if (kind === 'compare') return c.compare;
    if (kind === 'kw') {
      const field = c.keywords.find(([l]) => l === label);
      return field ? field[1] : null;
    }
    return null;
  }

  const texts = new Map();
  function unitText(unit) {
    if (!texts.has(unit)) {
      const html = unitHTML(unit);
      let text = null;
      if (html !== null) {
        const t = document.createElement('template');
        t.innerHTML = html;
        text = t.content.textContent;
      }
      texts.set(unit, text);
    }
    return texts.get(unit);
  }

  /** Where a passage lives: the view that shows it and its place in the deck. */
  function place(unit) {
    const pair = unit.split('~');
    if (pair.length === 2) {
      const [a, b] = pair;
      if (!POS.has(a) || !POS.has(b)) return null;
      return {
        route: { a, b, section: 'keywords' },
        where: `${fullName(byId(a))} + ${fullName(byId(b))}`,
        order: POS.get(a) * 1000 + 100 + POS.get(b),
      };
    }
    const [id, kind, label] = unit.split(':');
    const c = POS.has(id) ? byId(id) : null;
    const kinds = { note: ['keywords', 'Note', 0], kw: ['keywords', label, 1], meaning: ['meaning', 'Meaning', 60], compare: ['compare', 'Compare', 70] };
    if (!c || !kinds[kind]) return null;
    const [section, title, rank] = kinds[kind];
    const sub = kind === 'kw' ? c.keywords.findIndex(([l]) => l === label) : 0;
    return {
      route: { a: id, b: null, section },
      where: `${fullName(c)} · ${title}`,
      order: POS.get(id) * 1000 + rank + sub,
    };
  }

  // ---------- highlights store ----------

  const store = H.createStore({
    onRemoteChange() {
      repaintAll();
      updateCounts();
      if (marksOpen) renderMarks();
    },
  });

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

  // Passage containers are rendered empty and filled by fillUnit, which
  // also paints their highlights.
  const unitBox = (tag, cls, unit) => `<${tag} class="${cls}" data-unit="${esc(unit)}"></${tag}>`;

  function fillUnit(box) {
    const unit = box.dataset.unit;
    box.innerHTML = unitHTML(unit) || '';
    if (unit.endsWith(':compare')) {
      box.querySelectorAll(`.cmp a[data-card="${unit.split(':')[0]}"]`).forEach((a) => {
        a.closest('li').classList.add('self');
      });
    }
    H.paint(box, store.get(unit));
  }

  function repaintUnit(unit) {
    reader.querySelectorAll('[data-unit]').forEach((box) => {
      if (box.dataset.unit === unit) fillUnit(box);
    });
  }

  function repaintAll() {
    reader.querySelectorAll('[data-unit]').forEach(fillUnit);
  }

  // ---------- views ----------

  function homeView() {
    const n = store.count();
    return `<div class="home">
      <header>
        <h1 class="brand">Lenormand <em>Pairs</em></h1>
        <p class="lede">Tap a card, then its partner, to read the combination. To study one card on its own, tap it and choose <b>Read alone</b>.</p>
      </header>
      <div class="home-grid">${gridHTML()}</div>
      <div class="home-foot">
        <button type="button" class="home-marks" data-open="marks">${highlighterIcon()}<span>${n ? `Your highlights · ${n}` : 'Your highlights'}</span></button>
        <p class="credit">Keywords, meanings, comparisons and combinations from <a href="https://www.annak-tarot.at/" target="_blank" rel="noopener">annak-tarot.at</a>.</p>
      </div>
    </div>`;
  }

  function keywordsView(c) {
    const note = c.note ? unitBox('p', 'note', `${c.id}:note`) : '';
    const rows = c.keywords.map(([label]) => {
      const cls = label === 'Time factor' ? 'kw-row kw-time' : 'kw-row';
      return `<div class="${cls}"><dt>${esc(label)}</dt>${unitBox('dd', '', `${c.id}:kw:${label}`)}</div>`;
    });
    return `${note}<dl class="kw">${rows.join('')}</dl>`;
  }

  function pairsView(c) {
    const items = D.order.map((id) => {
      const p = byId(id);
      return `<li>
        <button type="button" class="pair-open" data-partner="${id}">
          <span class="pl-num">${esc(p.num)}</span>
          <span class="pl-name">${esc(fullName(p))}</span>
          <span class="pl-go" aria-hidden="true">&rarr;</span>
        </button>
        ${unitBox('div', 'pl-text', `${c.id}~${id}`)}
      </li>`;
    });
    return `<ol class="pair-list">${items.join('')}</ol><p class="note pairs-note">${D.pairsNote}</p>`;
  }

  function cardView() {
    const c = byId(state.a);
    const [section, label] = SECTIONS.find(([id]) => id === state.section);
    let body;
    if (section === 'meaning') body = unitBox('div', 'prose', `${c.id}:meaning`);
    else if (section === 'compare') body = unitBox('div', 'prose', `${c.id}:compare`);
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
      ? `<section class="alt"><h2 class="eyebrow">Worded differently on the ${esc(fullName(b))} page</h2>${unitBox('div', '', `${b.id}~${a.id}`)}</section>`
      : '';
    return `<article>
      <h1 class="sr-only">${esc(fullName(a))} and ${esc(fullName(b))}</h1>
      <header class="pair-head">
        ${who(a, 'a')}
        <span class="pair-plus" aria-hidden="true">+</span>
        ${who(b, 'b')}
      </header>
      ${unitBox('div', 'combo', `${a.id}~${b.id}`)}
      ${alt}
      <p class="source">From the ${esc(fullName(a))} combinations on <a href="${esc(a.sources.pairs)}" target="_blank" rel="noopener">annak-tarot.at &#8599;</a></p>
    </article>`;
  }

  function highlighterIcon() {
    return '<svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">'
      + '<path d="M14.6 3.8l5.6 5.6-8.4 8.4H6.2v-5.6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
      + '<path d="M11.8 6.6l5.6 5.6" fill="none" stroke="currentColor" stroke-width="1.7"/>'
      + '<path d="M3.5 21h17" class="icon-ink" stroke-width="2.6" stroke-linecap="round"/></svg>';
  }

  // ---------- render ----------

  function renderDock() {
    dock.hidden = !state.a;
    ['a', 'b'].forEach((s) => {
      const c = state[s] ? byId(state[s]) : null;
      const pick = el(`slot-${s}`);
      const clear = el(`clear-${s}`);
      const slot = pick.parentElement;
      const long = c && fullName(c).length > 9 ? ' long' : '';
      pick.innerHTML = c
        ? `<span class="slot-num">${esc(c.num)}</span><span class="slot-name${long}">${esc(fullName(c))}</span>`
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
    el('marks-btn').setAttribute('aria-expanded', String(marksOpen));
  }

  function syncOverlays() {
    const covered = Boolean(state.picking) || marksOpen;
    shade.classList.toggle('open', covered);
    reader.inert = covered;
  }

  function renderSheet() {
    const open = Boolean(state.picking);
    sheet.classList.toggle('open', open);
    sheet.inert = !open;
    syncOverlays();
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

  function updateCounts() {
    const n = store.count();
    el('marks-count').textContent = n ? String(n) : '';
    el('marks-btn').setAttribute('aria-label', n ? `Highlights, ${n}` : 'Highlights');
    const home = reader.querySelector('.home-marks span');
    if (home) home.textContent = n ? `Your highlights · ${n}` : 'Your highlights';
  }

  function render() {
    closeBar();
    const mode = state.b ? 'pair' : state.a ? 'card' : 'home';
    app.dataset.mode = mode;
    reader.innerHTML = mode === 'pair' ? pairView() : mode === 'card' ? cardView() : homeView();
    if (mode === 'home') markTiles(reader);
    repaintAll();
    renderDock();
    renderSheet();
    updateCounts();
    reader.scrollTop = scrolls.get(viewKey()) || 0;
    const a = state.a && fullName(byId(state.a));
    const b = state.b && fullName(byId(state.b));
    document.title = b ? `${a} + ${b} · Lenormand Pairs` : a ? `${a} · Lenormand Pairs` : 'Lenormand Pairs';
  }

  function setPicking(p) {
    chained = false;
    if (p) {
      closeBar();
      setMarks(false);
    }
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

  // ---------- highlight bar ----------
  //
  // Select text and the bar rises over the dock: a row of fills, a row of
  // underlines, and an eraser. Tapping a highlight reopens it on that one.

  const hl = { mode: null, target: null };
  let barPressedAt = 0;

  el('swatches').innerHTML = H.STYLES.map((s) => H.COLORS.map((c) => (
    `<button type="button" class="sw" data-c="${c.id}" data-s="${s.id}" data-paint="${c.id} ${s.id}" aria-label="${c.label} ${s.label}" aria-pressed="false"><span class="sw-aa">Aa</span></button>`
  )).join('')).join('');

  function clearSelection() {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) sel.removeAllRanges();
  }

  function openBar(mode, target) {
    hl.mode = mode;
    hl.target = target;
    const current = mode === 'edit' ? store.find(target.unit, target.id) : null;
    if (mode === 'edit' && !current) return;
    el('hlbar-title').textContent = mode === 'edit' ? 'Change this highlight' : 'Highlight the selection';
    const erase = el('hl-erase');
    erase.textContent = mode === 'edit' ? 'Remove' : 'Erase';
    erase.disabled = mode === 'new' && !store.overlaps(target.unit, target.start, target.end);
    bar.querySelectorAll('.sw').forEach((sw) => {
      const on = Boolean(current) && sw.dataset.c === current.color && sw.dataset.s === current.style;
      sw.setAttribute('aria-pressed', String(on));
    });
    reader.querySelectorAll('mark.active').forEach((m) => m.classList.remove('active'));
    if (current) {
      reader.querySelectorAll(`mark[data-hl="${CSS.escape(current.id)}"]`).forEach((m) => m.classList.add('active'));
    }
    bar.classList.add('open');
    bar.inert = false;
    // Keep the selected text clear of the bar.
    if (target.rect) {
      const barTop = app.getBoundingClientRect().bottom - bar.offsetHeight;
      const overlap = target.rect.bottom - barTop;
      if (overlap > -12) reader.scrollTop += overlap + 28;
    }
  }

  function closeBar() {
    if (!hl.mode) return;
    hl.mode = null;
    hl.target = null;
    bar.classList.remove('open');
    bar.inert = true;
    reader.querySelectorAll('mark.active').forEach((m) => m.classList.remove('active'));
  }

  function applyPaint(color, style) {
    const { mode, target } = hl;
    if (mode === 'new') {
      store.paint(target.unit, { start: target.start, end: target.end, color, style });
    } else if (mode === 'edit') {
      const r = store.find(target.unit, target.id);
      if (r) store.paint(target.unit, { ...r, color, style });
    } else {
      return;
    }
    clearSelection();
    closeBar();
    repaintUnit(target.unit);
    updateCounts();
  }

  function eraseTarget() {
    const { mode, target } = hl;
    if (mode === 'new') store.erase(target.unit, target.start, target.end);
    else if (mode === 'edit') store.remove(target.unit, target.id);
    else return;
    clearSelection();
    closeBar();
    repaintUnit(target.unit);
    updateCounts();
  }

  let selTimer = null;
  document.addEventListener('selectionchange', () => {
    // selectionchange fires on every step of a handle drag; let it settle.
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      if (state.picking || marksOpen) return;
      const s = H.readSelection(reader);
      if (s) openBar('new', s);
      else if (hl.mode === 'new' && Date.now() - barPressedAt > 800) closeBar();
    }, 140);
  });

  // A tap on the bar collapses the selection before the click lands: the bar
  // keeps its target, and on desktop the selection itself survives.
  bar.addEventListener('pointerdown', () => { barPressedAt = Date.now(); });
  bar.addEventListener('mousedown', (e) => e.preventDefault());

  // ---------- highlights sheet ----------

  function setMarks(open) {
    if (open === marksOpen) return;
    marksOpen = open;
    if (open) {
      closeBar();
      clearSelection();
      if (state.picking) {
        state.picking = null;
        renderSheet();
      }
      renderMarks();
    } else {
      el('export-text').hidden = true;
    }
    marks.classList.toggle('open', open);
    marks.inert = !open;
    syncOverlays();
    renderDock();
    if (open) marks.focus({ preventScroll: true });
  }

  function renderMarks() {
    const list = store.list()
      .map((h) => ({ h, p: place(h.unit) }))
      .filter((x) => x.p)
      .sort((x, y) => x.p.order - y.p.order || x.h.start - y.h.start);
    el('marks-title').textContent = list.length ? `Highlights · ${list.length}` : 'Highlights';
    el('marks-where').textContent = store.isSynced()
      ? 'Saved to your account, so they are there when you come back on any device.'
      : 'Saved in this browser, on this device. Export a file to keep a copy or to move them.';
    if (!list.length) {
      el('marks-list').innerHTML = '<p class="marks-empty">Nothing highlighted yet. Press and hold any text in a card or a combination to select it, then pick a colour at the bottom of the screen.</p>';
      return;
    }
    const groups = [];
    for (const x of list) {
      const last = groups[groups.length - 1];
      if (last && last.unit === x.h.unit) last.items.push(x.h);
      else groups.push({ unit: x.h.unit, where: x.p.where, items: [x.h] });
    }
    el('marks-list').innerHTML = groups.map((g) => {
      const text = unitText(g.unit) || '';
      const items = g.items.map((h) => {
        let excerpt = text.slice(h.start, h.end);
        if (excerpt.length > 240) excerpt = `${excerpt.slice(0, 238).trimEnd()}…`;
        return `<li><button type="button" class="mk-item" data-goto="${esc(g.unit)}" data-id="${esc(h.id)}">`
          + `<mark class="hl" data-c="${esc(h.color)}" data-s="${esc(h.style)}">${esc(excerpt)}</mark></button></li>`;
      });
      return `<section class="mk-group"><h3 class="mk-where">${esc(g.where)}</h3><ul class="mk-items">${items.join('')}</ul></section>`;
    }).join('');
  }

  function gotoHighlight(unit, id) {
    const p = place(unit);
    if (!p) return;
    setMarks(false);
    go(p.route);
    const found = reader.querySelectorAll(`mark[data-hl="${CSS.escape(id)}"]`);
    if (!found.length) return;
    found[0].scrollIntoView({ block: 'center' });
    found.forEach((m) => {
      m.classList.remove('flash');
      void m.offsetWidth;
      m.classList.add('flash');
    });
  }

  // ---------- export / import ----------

  // Inside a claude.ai artifact viewer, files are saved through the viewer.
  const downloadsReady = window.claude && typeof window.claude.use === 'function'
    ? window.claude.use('downloads').catch(() => null)
    : null;

  const status = (msg) => { el('marks-status').textContent = msg; };
  const exportJSON = () => JSON.stringify(
    H.buildExport(store.list(), unitText, (u) => (place(u) || { where: u }).where), null, 2,
  );

  async function saveFile() {
    const n = store.count();
    if (!n) return status('There are no highlights to export yet.');
    const json = exportJSON();
    const name = H.exportFileName();
    const downloads = downloadsReady ? await downloadsReady : null;
    if (downloads) {
      try {
        await downloads.save({ filename: name, data: json });
        status(`Saved ${plural(n, 'highlight', 'highlights')} to ${name}.`);
      } catch (err) {
        status(err && err.code === 'declined' ? 'Not saved.' : 'Saving a file isn’t possible here. Use Copy instead.');
      }
      return undefined;
    }
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return status(`Saved ${plural(n, 'highlight', 'highlights')} to ${name} in your downloads.`);
  }

  function copyExport() {
    const n = store.count();
    if (!n) return status('There are no highlights to export yet.');
    const json = exportJSON();
    const box = el('export-text');
    const fallback = () => {
      box.hidden = false;
      box.value = json;
      box.focus();
      box.select();
      status('Copying is blocked here. The export is selected below: copy it from there.');
    };
    try {
      navigator.clipboard.writeText(json).then(
        () => status(`Copied ${plural(n, 'highlight', 'highlights')}. Paste them into a note or a file to keep them.`),
        fallback,
      );
    } catch (_) {
      fallback();
    }
    return undefined;
  }

  function importText(text) {
    let raw;
    try {
      raw = JSON.parse(text);
    } catch (_) {
      status('That isn’t an export. Use the whole text of the file, from the first { to the last }.');
      return false;
    }
    let result;
    try {
      result = H.parseImport(raw, unitText);
    } catch (err) {
      status(err.message);
      return false;
    }
    const { entries, moved, skipped } = result;
    const added = store.merge(entries);
    const already = entries.length - added;
    const parts = [added ? `Added ${plural(added, 'highlight', 'highlights')}.` : 'No new highlights.'];
    if (already) parts.push(`${plural(already, 'was', 'were')} already here.`);
    if (moved) parts.push(`${plural(moved, 'was', 'were')} found by its text at a new place.`);
    if (skipped) parts.push(`${plural(skipped, 'was', 'were')} skipped: the text is no longer in the app.`);
    status(parts.join(' '));
    repaintAll();
    updateCounts();
    renderMarks();
    return true;
  }

  el('import-file').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    file.text().then(importText, () => status('That file could not be read.'));
  });

  // ---------- input ----------

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!e.target.closest('#hlbar')) {
      const mark = !t && e.target.closest('#reader mark.hl');
      const sel = window.getSelection();
      if (mark && (!sel || sel.isCollapsed)) {
        openBar('edit', { unit: mark.closest('[data-unit]').dataset.unit, id: mark.dataset.hl });
        return;
      }
      if (hl.mode === 'edit') closeBar();
    }
    if (!t) return;
    const d = t.dataset;
    if (d.pick) pick(d.pick);
    else if (d.partner) go({ b: d.partner });
    else if (d.study) go({ a: d.study, b: null, section: 'keywords' });
    else if (d.card) {
      e.preventDefault();
      go({ a: d.card, b: null, section: d.section || 'keywords' });
    } else if (d.paint) {
      const [color, style] = d.paint.split(' ');
      applyPaint(color, style);
    } else if (d.goto) {
      gotoHighlight(d.goto, d.id);
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
    } else if (t.id === 'hl-erase') {
      eraseTarget();
    } else if (t.id === 'hl-done') {
      clearSelection();
      closeBar();
    } else if (t.id === 'marks-btn' || d.open === 'marks') {
      setMarks(!marksOpen);
    } else if (t.id === 'marks-close') {
      setMarks(false);
    } else if (t.id === 'export-file') {
      saveFile();
    } else if (t.id === 'export-copy') {
      copyExport();
    } else if (t.id === 'paste-toggle') {
      const box = el('paste-box');
      box.hidden = !box.hidden;
      t.setAttribute('aria-expanded', String(!box.hidden));
      if (!box.hidden) el('paste-text').focus();
    } else if (t.id === 'paste-import') {
      if (importText(el('paste-text').value)) el('paste-text').value = '';
    }
  });

  shade.addEventListener('click', () => {
    if (state.picking) setPicking(null);
    if (marksOpen) setMarks(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (hl.mode) {
      clearSelection();
      closeBar();
    } else if (state.picking) {
      setPicking(null);
    } else if (marksOpen) {
      setMarks(false);
    }
  });

  // Drag a sheet down to dismiss it.
  function draggable(panel, dismiss) {
    let from = null;
    panel.addEventListener('touchstart', (e) => {
      from = panel.scrollTop <= 0 && !e.target.closest('textarea') ? e.touches[0].clientY : null;
    }, { passive: true });
    panel.addEventListener('touchmove', (e) => {
      if (from === null) return;
      const dy = e.touches[0].clientY - from;
      if (dy > 8) {
        panel.classList.add('dragging');
        panel.style.transform = `translateY(${dy}px)`;
      }
    }, { passive: true });
    panel.addEventListener('touchend', (e) => {
      if (from === null) return;
      const dy = e.changedTouches[0].clientY - from;
      from = null;
      panel.classList.remove('dragging');
      panel.style.transform = '';
      if (dy > 80) dismiss();
    });
  }
  draggable(sheet, () => setPicking(null));
  draggable(marks, () => setMarks(false));

  window.addEventListener('popstate', fromLocation);
  window.addEventListener('hashchange', fromLocation);

  bar.inert = true;
  marks.inert = true;
  Object.assign(state, parseHash());
  render();
  store.connect().then(() => { if (marksOpen) renderMarks(); });
}());
