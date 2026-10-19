// Highlights: coloured fills and underlines over the card texts.
//
// A highlight is a character range into the text of one passage (a keyword
// field, a meaning, a comparison, one combination), never a serialized DOM
// range. The texts ship with the app and never change while it runs, so the
// offsets survive every re-render. Ranges of one passage are kept sorted and
// never overlap: painting over a highlight replaces what it covers, so the
// paint you see is always the paint that is stored.
window.Highlights = (function () {
  'use strict';

  const COLORS = [
    { id: 'yellow', label: 'Yellow' },
    { id: 'green', label: 'Green' },
    { id: 'blue', label: 'Blue' },
    { id: 'violet', label: 'Violet' },
    { id: 'rose', label: 'Rose' },
    { id: 'orange', label: 'Orange' },
  ];
  const STYLES = [
    { id: 'fill', label: 'highlight' },
    { id: 'line', label: 'underline' },
  ];
  const COLOR_IDS = new Set(COLORS.map((c) => c.id));
  const STYLE_IDS = new Set(STYLES.map((s) => s.id));

  const STORAGE_KEY = 'lenormand-pairs:highlights:v1';
  const SCHEMA = 'lenormand-pairs/highlights';
  const VERSION = 1;

  // ---------- range algebra ----------

  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  const byStart = (a, b) => a.start - b.start;
  const samePaint = (a, b) => a.color === b.color && a.style === b.style;

  /** Drops [start, end) from every range it touches, splitting where needed. */
  function eraseRange(ranges, start, end) {
    const out = [];
    for (const r of ranges) {
      if (r.end <= start || r.start >= end) {
        out.push(r);
        continue;
      }
      if (r.start < start) out.push({ ...r, end: start });
      if (r.end > end) out.push({ ...r, id: newId(), start: end });
    }
    return out.sort(byStart);
  }

  /** Folds touching ranges with the same colour and style into one. */
  function mergeAdjacent(ranges) {
    const out = [];
    for (const r of [...ranges].sort(byStart)) {
      const prev = out[out.length - 1];
      if (prev && samePaint(prev, r) && prev.end >= r.start) {
        prev.end = Math.max(prev.end, r.end);
        continue;
      }
      out.push({ ...r });
    }
    return out;
  }

  /** Paints [start, end), clearing whatever was under it. */
  function paintRange(ranges, h) {
    if (h.end <= h.start) return ranges;
    return mergeAdjacent([
      ...eraseRange(ranges, h.start, h.end),
      {
        id: h.id || newId(),
        start: h.start,
        end: h.end,
        color: h.color,
        style: h.style,
        createdAt: h.createdAt || new Date().toISOString(),
      },
    ]);
  }

  // ---------- store ----------

  /**
   * Highlights grouped by passage, written to localStorage on every change.
   * Inside a claude.ai artifact viewer they are also kept in the viewer's
   * private record on their account (see connect), which outlives the
   * browser's storage and follows them to other devices.
   */
  function createStore({ onRemoteChange }) {
    let byUnit = new Map();
    let updatedAt = '';
    let remote = null;
    let writeTimer = null;
    let writing = Promise.resolve();

    function fromList(list) {
      const map = new Map();
      for (const h of list) {
        if (!h || typeof h.unit !== 'string') continue;
        const { unit, ...range } = h;
        map.set(unit, [...(map.get(unit) || []), range]);
      }
      for (const [unit, ranges] of map) map.set(unit, ranges.sort(byStart));
      return map;
    }

    function list() {
      const out = [];
      for (const [unit, ranges] of byUnit) {
        for (const r of ranges) out.push({ unit, ...r });
      }
      return out;
    }

    function body() {
      return { version: VERSION, updatedAt, highlights: list() };
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && Array.isArray(saved.highlights)) {
        byUnit = fromList(saved.highlights);
        updatedAt = saved.updatedAt || '';
      }
    } catch (_) { /* unreadable storage must not keep the app from opening */ }

    function saveLocal() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(body())); } catch (_) { /* full or blocked */ }
    }

    function saveRemote() {
      if (!remote) return;
      clearTimeout(writeTimer);
      // One write per pause, and one at a time.
      writeTimer = setTimeout(() => {
        const snapshot = body();
        writing = writing.then(() => remote.set(snapshot)).catch(() => { remote = null; });
      }, 600);
    }

    function changed() {
      updatedAt = new Date().toISOString();
      saveLocal();
      saveRemote();
    }

    function set(unit, ranges) {
      if (ranges.length) byUnit.set(unit, ranges);
      else byUnit.delete(unit);
    }

    async function connect() {
      const claude = window.claude;
      if (!claude || typeof claude.use !== 'function') return false;
      try {
        const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
        const uid = db && user ? await user.id() : null;
        if (!uid) return false;
        const doc = db.doc(`data/users/${uid}/highlights`);
        const snap = await doc.get();
        const theirs = snap.exists ? snap.data() : null;
        remote = doc;
        if (theirs && Array.isArray(theirs.highlights) && (theirs.updatedAt || '') > updatedAt) {
          byUnit = fromList(theirs.highlights);
          updatedAt = theirs.updatedAt;
          saveLocal();
          onRemoteChange();
        } else if (byUnit.size && (!theirs || (theirs.updatedAt || '') < updatedAt)) {
          saveRemote();
        }
        return true;
      } catch (_) {
        remote = null;
        return false;
      }
    }

    return {
      connect,
      isSynced: () => Boolean(remote),
      get: (unit) => byUnit.get(unit) || [],
      list,
      count: () => list().length,
      find(unit, id) {
        return (byUnit.get(unit) || []).find((r) => r.id === id) || null;
      },
      overlaps(unit, start, end) {
        return (byUnit.get(unit) || []).some((r) => r.start < end && r.end > start);
      },
      paint(unit, h) {
        set(unit, paintRange(byUnit.get(unit) || [], h));
        changed();
      },
      erase(unit, start, end) {
        set(unit, eraseRange(byUnit.get(unit) || [], start, end));
        changed();
      },
      remove(unit, id) {
        set(unit, (byUnit.get(unit) || []).filter((r) => r.id !== id));
        changed();
      },
      /** Folds imported highlights in. Returns how many were new. */
      merge(entries) {
        let added = 0;
        for (const e of entries) {
          const ranges = byUnit.get(e.unit) || [];
          const known = ranges.some((r) => r.start === e.start && r.end === e.end && samePaint(r, e));
          if (known) continue;
          set(e.unit, paintRange(ranges, e));
          added += 1;
        }
        if (added) changed();
        return added;
      },
    };
  }

  // ---------- DOM ----------

  /** Wraps the stored ranges of one passage element in <mark>s. */
  function paint(el, ranges) {
    if (!ranges.length) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let pos = 0;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      nodes.push([n, pos]);
      pos += n.data.length;
    }
    for (const [node, base] of nodes) {
      const end = base + node.data.length;
      const hits = ranges.filter((r) => r.start < end && r.end > base);
      // Line breaks between blocks are layout, not text worth painting.
      if (!hits.length || (!node.data.trim() && node.data.includes('\n'))) continue;
      const frag = document.createDocumentFragment();
      let cursor = base;
      for (const r of hits) {
        const from = Math.max(r.start, base);
        const to = Math.min(r.end, end);
        if (from > cursor) frag.append(node.data.slice(cursor - base, from - base));
        const mark = document.createElement('mark');
        mark.className = 'hl';
        mark.dataset.hl = r.id;
        mark.dataset.c = r.color;
        mark.dataset.s = r.style;
        mark.textContent = node.data.slice(from - base, to - base);
        frag.append(mark);
        cursor = to;
      }
      if (cursor < end) frag.append(node.data.slice(cursor - base));
      node.replaceWith(frag);
    }
  }

  function offsetIn(el, node, offset) {
    const r = document.createRange();
    r.setStart(el, 0);
    r.setEnd(node, offset);
    return r.toString().length;
  }

  const WORD = /[\p{L}\p{N}'’]/u;

  const unitOf = (node) => {
    const el = node.nodeType === 1 ? node : node.parentElement;
    return el ? el.closest('[data-unit]') : null;
  };

  /**
   * The current selection as offsets into one passage of `root`, or null.
   * A selection running past the end of its passage stops there.
   */
  function readSelection(root) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return null;
    const first = unitOf(range.startContainer);
    const last = unitOf(range.endContainer);
    const el = first || last;
    if (!el || !root.contains(el)) return null;
    const text = el.textContent;
    let start = first ? offsetIn(el, range.startContainer, range.startOffset) : 0;
    let end = last === el ? offsetIn(el, range.endContainer, range.endOffset) : text.length;
    while (start < end && /\s/.test(text[start])) start += 1;
    while (end > start && /\s/.test(text[end - 1])) end -= 1;
    if (end <= start) return null;
    // A thumb rarely lands a handle between two letters: take whole words.
    while (start > 0 && WORD.test(text[start - 1]) && WORD.test(text[start])) start -= 1;
    while (end < text.length && WORD.test(text[end]) && WORD.test(text[end - 1])) end += 1;
    return { unit: el.dataset.unit, start, end, rect: range.getBoundingClientRect() };
  }

  // ---------- export / import ----------

  function buildExport(list, textOf, whereOf) {
    const highlights = list.map((h) => ({
      ...h,
      where: whereOf(h.unit),
      text: (textOf(h.unit) || '').slice(h.start, h.end),
    }));
    return {
      schema: SCHEMA,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      count: highlights.length,
      highlights,
    };
  }

  function exportFileName(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return `lenormand-highlights-${local.toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
  }

  const isOffset = (v) => Number.isInteger(v) && v >= 0;

  /**
   * Reads an export back. A highlight whose excerpt no longer sits at its
   * offsets is searched for and re-anchored; one whose text is gone is
   * counted as skipped rather than dropped silently.
   */
  function parseImport(raw, textOf) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.highlights)) {
      throw new Error('This is not a Lenormand Pairs highlights export.');
    }
    if (raw.schema && raw.schema !== SCHEMA) {
      throw new Error(`This file comes from another app (${raw.schema}).`);
    }
    if (raw.version > VERSION) {
      throw new Error('This file comes from a newer version of the app.');
    }
    const entries = [];
    let moved = 0;
    let skipped = 0;
    for (const e of raw.highlights) {
      const source = e && typeof e.unit === 'string' ? textOf(e.unit) : null;
      if (!source || !COLOR_IDS.has(e.color) || !isOffset(e.start) || !isOffset(e.end) || e.end <= e.start) {
        skipped += 1;
        continue;
      }
      let { start, end } = e;
      if (typeof e.text === 'string' && e.text && source.slice(start, end) !== e.text) {
        const found = source.indexOf(e.text);
        if (found === -1) {
          skipped += 1;
          continue;
        }
        start = found;
        end = found + e.text.length;
        moved += 1;
      }
      if (end > source.length) {
        skipped += 1;
        continue;
      }
      entries.push({
        unit: e.unit,
        id: typeof e.id === 'string' ? e.id : newId(),
        start,
        end,
        color: e.color,
        style: STYLE_IDS.has(e.style) ? e.style : 'fill',
        createdAt: typeof e.createdAt === 'string' ? e.createdAt : new Date().toISOString(),
      });
    }
    return { entries, moved, skipped };
  }

  return {
    COLORS,
    STYLES,
    createStore,
    paint,
    readSelection,
    buildExport,
    exportFileName,
    parseImport,
  };
}());
