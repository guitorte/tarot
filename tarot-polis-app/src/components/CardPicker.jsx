import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { CARD_BADGES, CATEGORIES, getCardColor } from '../data/cards.js'
import { searchCards } from '../data/meanings.js'
import { cn } from '../lib/cn.js'

export default function CardPicker({ selectedCards, onSelectCard, maxCards }) {
  const [category, setCategory] = useState('major')
  const [query, setQuery] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo(0, 0)
  }, [category])

  const cards = useMemo(() => {
    if (query.trim()) return searchCards(query)
    return CATEGORIES.find((c) => c.id === category)?.cards ?? []
  }, [category, query])

  const atLimit = selectedCards.length >= maxCards

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: '#a1a1aa' }}
          />
          <input
            type="text"
            placeholder="Buscar carta..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
            style={{
              backgroundColor: '#1e1e2e',
              borderColor: '#27273a',
              color: '#fafafa',
            }}
          />
        </div>
      </div>

      {!query.trim() && (
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((entry) => {
            const isActive = entry.id === category
            return (
              <button
                key={entry.id}
                onClick={() => setCategory(entry.id)}
                className={cn(
                  'touch-target flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                )}
                style={
                  isActive
                    ? { backgroundColor: entry.color, color: '#0a0a0f' }
                    : { backgroundColor: '#1e1e2e', color: '#a1a1aa' }
                }
              >
                {entry.label}
              </button>
            )
          })}
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto min-h-0">
        {cards.map((cardName) => {
          const isSelected = selectedCards.includes(cardName)
          const isBlocked = !isSelected && atLimit
          const color = getCardColor(cardName)
          return (
            <button
              key={cardName}
              onClick={() => {
                if (!isSelected && !isBlocked) onSelectCard(cardName)
              }}
              disabled={isBlocked}
              className={cn(
                'touch-target w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                isBlocked && 'opacity-40',
                isSelected && 'opacity-60',
              )}
              style={{ borderBottom: '1px solid rgba(39, 39, 58, 0.5)' }}
            >
              <span
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {CARD_BADGES[cardName] || '?'}
              </span>
              <span className="flex-1 text-sm font-medium truncate">
                {cardName}
              </span>
              {isSelected && (
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Check className="h-3.5 w-3.5" style={{ color: '#0a0a0f' }} />
                </span>
              )}
            </button>
          )
        })}
        {cards.length === 0 && query.trim() && (
          <div className="text-center py-8 text-sm" style={{ color: '#a1a1aa' }}>
            Nenhuma carta encontrada
          </div>
        )}
      </div>
    </div>
  )
}
