import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn.js'

export default function CardTabs({
  selectedCards,
  activeCardIndex,
  onTabChange,
  onRemoveCard,
}) {
  const stripRef = useRef(null)
  const activeTabRef = useRef(null)

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      inline: 'center',
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [activeCardIndex])

  if (selectedCards.length === 0) return null

  return (
    <div
      ref={stripRef}
      className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide"
      style={{ backgroundColor: '#0a0a0f', borderBottom: '1px solid #27273a' }}
    >
      {selectedCards.map((cardName, index) => {
        const isActive = index === activeCardIndex
        return (
          <button
            key={cardName}
            ref={isActive ? activeTabRef : undefined}
            onClick={() => onTabChange(index)}
            className={cn(
              'touch-target flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            )}
            style={
              isActive
                ? { backgroundColor: '#a78bfa', color: '#0a0a0f' }
                : {
                    backgroundColor: '#1e1e2e',
                    color: '#a1a1aa',
                    border: '1px solid #27273a',
                  }
            }
          >
            <span className="truncate max-w-[120px]">{cardName}</span>
            <span
              onClick={(event) => {
                event.stopPropagation()
                onRemoveCard(cardName)
              }}
              className="flex-shrink-0 p-0.5 rounded-full hover:opacity-80"
              style={{
                backgroundColor: isActive
                  ? 'rgba(10, 10, 15, 0.2)'
                  : 'rgba(167, 139, 250, 0.2)',
              }}
            >
              <X className="h-3 w-3" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
