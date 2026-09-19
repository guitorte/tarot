import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildExport,
  loadHighlights,
  mergeImported,
  parseImport,
  passageKey,
  saveHighlights,
} from '../lib/highlightStore.js'
import { applyHighlight, eraseRange, newHighlightId } from '../lib/ranges.js'

const NO_RANGES = []

/** Highlights for every passage, kept in sync with localStorage. */
export function useHighlights() {
  const [byPassage, setByPassage] = useState(loadHighlights)
  const [storageFailed, setStorageFailed] = useState(false)

  useEffect(() => {
    setStorageFailed(!saveHighlights(byPassage))
  }, [byPassage])

  const updatePassage = useCallback((card, author, update) => {
    setByPassage((previous) => {
      const key = passageKey(card, author)
      const next = update(previous[key] ?? NO_RANGES)

      if (next.length === 0) {
        if (!(key in previous)) return previous
        const { [key]: _removed, ...rest } = previous
        return rest
      }
      return { ...previous, [key]: next }
    })
  }, [])

  const actions = useMemo(
    () => ({
      rangesFor: (card, author) => byPassage[passageKey(card, author)] ?? NO_RANGES,

      highlight: (card, author, { start, end, color }) =>
        updatePassage(card, author, (ranges) =>
          applyHighlight(ranges, {
            start,
            end,
            color,
            id: newHighlightId(),
            createdAt: new Date().toISOString(),
          }),
        ),

      erase: (card, author, start, end) =>
        updatePassage(card, author, (ranges) => eraseRange(ranges, start, end)),

      clearAll: () => setByPassage({}),

      exportDocument: (resolveText) => buildExport(byPassage, resolveText),

      importDocument: (raw, resolveText) => {
        const { entries, repaired, skipped } = parseImport(raw, resolveText)
        setByPassage((previous) => mergeImported(previous, entries))
        return { imported: entries.length, repaired, skipped }
      },
    }),
    [byPassage, updatePassage],
  )

  const count = useMemo(
    () => Object.values(byPassage).reduce((total, ranges) => total + ranges.length, 0),
    [byPassage],
  )

  return { byPassage, count, storageFailed, ...actions }
}
