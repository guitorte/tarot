import { useCallback, useRef } from 'react'

const GRAB_AREA_PX = 48

/** Drag the bottom sheet down by its handle to dismiss it. */
export function useSheetDrag({ onClose, threshold = 0.3 }) {
  const sheetRef = useRef(null)
  const startY = useRef(0)
  const offset = useRef(0)
  const dragging = useRef(false)

  const onTouchStart = useCallback((event) => {
    const touch = event.touches[0]
    const bounds = sheetRef.current?.getBoundingClientRect()
    if (!bounds || touch.clientY - bounds.top > GRAB_AREA_PX) return

    dragging.current = true
    startY.current = touch.clientY
    offset.current = 0
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }, [])

  const onTouchMove = useCallback((event) => {
    if (!dragging.current || !sheetRef.current) return
    const dy = event.touches[0].clientY - startY.current
    offset.current = Math.max(0, dy)
    sheetRef.current.style.transform = `translateY(${offset.current}px)`
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!dragging.current || !sheetRef.current) return
    dragging.current = false
    sheetRef.current.style.transition = 'transform 300ms ease-out'

    if (offset.current > sheetRef.current.offsetHeight * threshold) onClose()
    else sheetRef.current.style.transform = 'translateY(0)'

    offset.current = 0
  }, [onClose, threshold])

  return { sheetRef, handlers: { onTouchStart, onTouchMove, onTouchEnd } }
}
