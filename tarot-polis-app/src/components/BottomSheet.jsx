import { useEffect, useState } from 'react'
import { useSheetDrag } from '../hooks/useSheetDrag.js'

export default function BottomSheet({ isOpen, onClose, children }) {
  const [closing, setClosing] = useState(false)

  function startClosing() {
    setClosing(true)
  }

  function handleAnimationEnd() {
    if (!closing) return
    setClosing(false)
    onClose()
  }

  const { sheetRef, handlers } = useSheetDrag({ onClose: startClosing })

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen && !closing) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        style={{
          animation: closing
            ? 'backdrop-fade-out 200ms ease-out forwards'
            : 'backdrop-fade-in 200ms ease-out forwards',
        }}
        onClick={startClosing}
      />
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl flex flex-col"
        style={{
          backgroundColor: '#161622',
          maxHeight: '85dvh',
          animation: closing
            ? 'sheet-slide-down 300ms ease-in forwards'
            : 'sheet-slide-up 300ms ease-out forwards',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onAnimationEnd={handleAnimationEnd}
        {...handlers}
      >
        <div className="flex justify-center pt-3 pb-2 cursor-grab">
          <div
            className="w-12 h-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(161, 161, 170, 0.4)' }}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
