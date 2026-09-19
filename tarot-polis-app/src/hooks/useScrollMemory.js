import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'

/**
 * Remembers the vertical offset of a scroll container per key.
 *
 * The meanings pane is remounted whenever the user switches card tabs, so the
 * browser's own scroll restoration never kicks in — the offset has to be kept
 * outside the component that owns the scrollable element.
 *
 * Lives in a ref instead of state: writing an offset must never re-render.
 */
export function useScrollOffsets() {
  const store = useRef(null)
  if (store.current === null) store.current = new Map()
  const offsets = store.current

  return useMemo(
    () => ({
      get: (key) => offsets.get(key) ?? 0,
      set: (key, offset) => offsets.set(key, offset),
      forget: (key) => offsets.delete(key),
    }),
    [offsets],
  )
}

/**
 * Binds a scroll container to the offset stored under `key`: restores it on
 * mount, records it while the user scrolls.
 *
 * Returns the props to spread onto the scrollable element.
 */
export function useScrollMemory(offsets, key) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const element = ref.current
    const target = offsets.get(key)
    if (!element || target === 0) return

    element.scrollTop = target

    // A restore before the pane reaches its final height gets clamped to the
    // bottom of whatever is laid out so far (late web font, long paragraphs
    // reflowing). Re-apply on the next frame if the offset did not stick.
    const frame = requestAnimationFrame(() => {
      if (element.scrollTop !== target) element.scrollTop = target
    })
    return () => cancelAnimationFrame(frame)
  }, [offsets, key])

  const onScroll = useCallback(
    (event) => offsets.set(key, event.currentTarget.scrollTop),
    [offsets, key],
  )

  return { ref, onScroll }
}
