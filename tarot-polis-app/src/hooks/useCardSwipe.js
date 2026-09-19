import { useCallback, useRef } from 'react'

const DIRECTION_LOCK_PX = 10

/**
 * Horizontal swipe between card tabs. The axis is locked on the first
 * meaningful movement so a vertical scroll through the meanings is never
 * hijacked into a tab change.
 */
export function useCardSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const startX = useRef(0)
  const startY = useRef(0)
  const deltaX = useRef(0)
  const axis = useRef('none')

  const onTouchStart = useCallback((event) => {
    const touch = event.touches[0]
    startX.current = touch.clientX
    startY.current = touch.clientY
    deltaX.current = 0
    axis.current = 'none'
  }, [])

  const onTouchMove = useCallback((event) => {
    const touch = event.touches[0]
    const dx = touch.clientX - startX.current
    const dy = touch.clientY - startY.current

    if (axis.current === 'none') {
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      if (absX < DIRECTION_LOCK_PX && absY < DIRECTION_LOCK_PX) return
      axis.current = absX > absY ? 'horizontal' : 'vertical'
    }

    if (axis.current === 'horizontal') {
      event.preventDefault()
      deltaX.current = dx
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (axis.current === 'horizontal' && Math.abs(deltaX.current) > threshold) {
      if (deltaX.current < 0) onSwipeLeft()
      else onSwipeRight()
    }
    axis.current = 'none'
    deltaX.current = 0
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { handlers: { onTouchStart, onTouchMove, onTouchEnd } }
}
