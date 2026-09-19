import { applyHighlight, newHighlightId, sortRanges } from './ranges.js'

export const STORAGE_KEY = 'tarot-polis:highlights:v1'
export const EXPORT_SCHEMA = 'tarot-polis/highlights'
export const EXPORT_VERSION = 1

const SEPARATOR = '\u0000'

export function passageKey(card, author) {
  return `${card}${SEPARATOR}${author}`
}

export function splitKey(key) {
  const [card, author] = key.split(SEPARATOR)
  return { card, author }
}

/**
 * In memory highlights are grouped per passage ({ "<card>\0<author>": [range] });
 * on disk they are one flat list, which is what the export file carries too.
 */
export function toFlatList(byPassage) {
  return Object.entries(byPassage).flatMap(([key, ranges]) => {
    const { card, author } = splitKey(key)
    return ranges.map(({ id, start, end, color, createdAt }) => ({
      id,
      card,
      author,
      start,
      end,
      color,
      createdAt,
    }))
  })
}

export function fromFlatList(list) {
  const byPassage = {}
  for (const { card, author, id, start, end, color, createdAt } of list) {
    // card and author live in the key, not in every range under it.
    const key = passageKey(card, author)
    byPassage[key] = [...(byPassage[key] ?? []), { id, start, end, color, createdAt }]
  }
  for (const key of Object.keys(byPassage)) {
    byPassage[key] = sortRanges(byPassage[key])
  }
  return byPassage
}

export function loadHighlights() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    return fromFlatList(Array.isArray(parsed?.highlights) ? parsed.highlights : [])
  } catch {
    // A corrupt or unreadable store must not keep the app from opening.
    return {}
  }
}

export function saveHighlights(byPassage) {
  try {
    const payload = { version: EXPORT_VERSION, highlights: toFlatList(byPassage) }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

/**
 * The export carries the highlighted excerpt next to its offsets. It makes the
 * file readable on its own, and lets an import re-anchor a highlight if the
 * interpretation text ever shifts in a later version of the app.
 */
export function buildExport(byPassage, resolveText) {
  const highlights = toFlatList(byPassage).map((entry) => ({
    ...entry,
    text: resolveText(entry.card, entry.author)?.slice(entry.start, entry.end) ?? '',
  }))

  return {
    schema: EXPORT_SCHEMA,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    count: highlights.length,
    highlights,
  }
}

export function exportFileName(date = new Date()) {
  const stamp = date.toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return `tarot-polis-marcacoes-${stamp}.json`
}

const isOffset = (value) => Number.isInteger(value) && value >= 0

/**
 * Reads an export file back. Entries whose excerpt no longer sits at the
 * recorded offsets are searched for in the text and re-anchored; entries whose
 * text is gone altogether are reported instead of being dropped silently.
 */
export function parseImport(raw, resolveText) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.highlights)) {
    throw new Error('Arquivo não reconhecido: esperado um export de marcações.')
  }
  if (raw.schema && raw.schema !== EXPORT_SCHEMA) {
    throw new Error(`Arquivo de outro app (${raw.schema}).`)
  }
  if (raw.version > EXPORT_VERSION) {
    throw new Error(
      `Arquivo da versão ${raw.version}; este app lê até a ${EXPORT_VERSION}.`,
    )
  }

  const entries = []
  let repaired = 0
  let skipped = 0

  for (const entry of raw.highlights) {
    if (
      !entry?.card ||
      !entry?.author ||
      !entry?.color ||
      !isOffset(entry.start) ||
      !isOffset(entry.end) ||
      entry.end <= entry.start
    ) {
      skipped += 1
      continue
    }

    const source = resolveText(entry.card, entry.author)
    if (!source) {
      skipped += 1
      continue
    }

    let { start, end } = entry
    const excerpt = typeof entry.text === 'string' ? entry.text : null

    if (excerpt && source.slice(start, end) !== excerpt) {
      const found = source.indexOf(excerpt)
      if (found === -1) {
        skipped += 1
        continue
      }
      start = found
      end = found + excerpt.length
      repaired += 1
    }

    if (end > source.length) {
      skipped += 1
      continue
    }

    entries.push({
      id: entry.id ?? newHighlightId(),
      card: entry.card,
      author: entry.author,
      start,
      end,
      color: entry.color,
      createdAt: entry.createdAt ?? new Date().toISOString(),
    })
  }

  return { entries, repaired, skipped }
}

/**
 * Folds imported highlights into what is already stored. Imported ranges win
 * where they overlap, so re-importing your own export changes nothing.
 */
export function mergeImported(byPassage, entries) {
  const merged = { ...byPassage }

  for (const entry of entries) {
    const key = passageKey(entry.card, entry.author)
    merged[key] = applyHighlight(merged[key] ?? [], entry)
  }
  return merged
}
