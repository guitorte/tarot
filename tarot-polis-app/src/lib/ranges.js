/**
 * Highlight ranges are character offsets into the interpretation text of one
 * (card, author) pair. The text ships with the app and never changes at
 * runtime, which makes offsets a far steadier anchor than a serialized DOM
 * range: they survive re-renders, font swaps and markup changes alike.
 *
 * Invariant kept by every function here: the ranges of one text are sorted by
 * `start` and never overlap. Painting over an existing highlight replaces it
 * rather than stacking on top of it.
 */

export function newHighlightId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

const byStart = (a, b) => a.start - b.start

export function sortRanges(ranges) {
  return [...ranges].sort(byStart)
}

/** Drops [start, end) from every range it touches, splitting where needed. */
export function eraseRange(ranges, start, end) {
  if (end <= start) return sortRanges(ranges)

  const result = []
  for (const range of ranges) {
    if (range.end <= start || range.start >= end) {
      result.push(range)
      continue
    }
    if (range.start < start) result.push({ ...range, end: start })
    if (range.end > end) {
      result.push({ ...range, id: newHighlightId(), start: end })
    }
  }
  return sortRanges(result)
}

/** Folds touching ranges of the same color into one. */
export function mergeAdjacent(ranges) {
  const sorted = sortRanges(ranges)
  const result = []

  for (const range of sorted) {
    const previous = result[result.length - 1]
    if (previous && previous.color === range.color && previous.end >= range.start) {
      previous.end = Math.max(previous.end, range.end)
      continue
    }
    result.push({ ...range })
  }
  return result
}

/** Paints [start, end) in `color`, clearing whatever was under it. */
export function applyHighlight(ranges, { start, end, color, id, createdAt }) {
  if (end <= start) return sortRanges(ranges)

  return mergeAdjacent([
    ...eraseRange(ranges, start, end),
    {
      id: id ?? newHighlightId(),
      start,
      end,
      color,
      createdAt: createdAt ?? new Date().toISOString(),
    },
  ])
}

export function findRangeAt(ranges, offset) {
  return ranges.find((range) => offset >= range.start && offset < range.end) ?? null
}

/**
 * Cuts `text` into consecutive runs, each either plain or carrying one
 * highlight — the shape the renderer needs.
 */
export function toSegments(text, ranges) {
  const segments = []
  let cursor = 0

  for (const range of sortRanges(ranges)) {
    const start = clamp(range.start, 0, text.length)
    const end = clamp(range.end, 0, text.length)
    if (end <= cursor || end <= start) continue

    if (start > cursor) segments.push(plain(text, cursor, start))
    segments.push({
      start,
      end,
      text: text.slice(start, end),
      highlight: range,
    })
    cursor = end
  }

  if (cursor < text.length) segments.push(plain(text, cursor, text.length))
  return segments
}

function plain(text, start, end) {
  return { start, end, text: text.slice(start, end), highlight: null }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
