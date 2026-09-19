import { useCallback, useEffect, useState } from 'react'

const SETTLE_MS = 150

function offsetAt(node, offsetInNode) {
  const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  const run = element?.closest?.('[data-offset]')
  if (!run) return null

  const base = Number(run.dataset.offset)
  // An endpoint anchored on the element rather than inside its text lands on
  // one of its edges, depending on which side of the run the caret sits.
  if (node.nodeType !== Node.TEXT_NODE) {
    return offsetInNode === 0 ? base : base + run.textContent.length
  }
  return base + offsetInNode
}

function scopeOf(node) {
  const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  return element?.closest?.('[data-passage]') ?? null
}

/**
 * Reports the current text selection as offsets into one passage's source
 * text, or null when there is nothing usable selected.
 *
 * Selections that straddle two passages are ignored rather than clamped: a
 * highlight belongs to exactly one interpretation.
 */
export function useTextSelection(containerRef) {
  const [selection, setSelection] = useState(null)

  const clear = useCallback(() => {
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }, [])

  useEffect(() => {
    let timer = null

    function read() {
      const active = window.getSelection()
      if (!active || active.rangeCount === 0 || active.isCollapsed) {
        setSelection(null)
        return
      }

      const range = active.getRangeAt(0)
      const container = containerRef.current
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setSelection(null)
        return
      }

      const scope = scopeOf(range.startContainer)
      if (!scope || scope !== scopeOf(range.endContainer)) {
        setSelection(null)
        return
      }

      const start = offsetAt(range.startContainer, range.startOffset)
      const end = offsetAt(range.endContainer, range.endOffset)
      if (start === null || end === null || end <= start) {
        setSelection(null)
        return
      }

      setSelection({
        card: scope.dataset.card,
        author: scope.dataset.author,
        start,
        end,
        rect: range.getBoundingClientRect(),
      })
    }

    // selectionchange fires on every pixel of a handle drag; settle first.
    function onSelectionChange() {
      clearTimeout(timer)
      timer = setTimeout(read, SETTLE_MS)
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [containerRef])

  return { selection, setSelection, clear }
}
