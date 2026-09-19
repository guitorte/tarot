import { useCallback, useState } from 'react'
import { Highlighter, Plus } from 'lucide-react'
import BottomSheet from './components/BottomSheet.jsx'
import CardMeanings from './components/CardMeanings.jsx'
import CardPicker from './components/CardPicker.jsx'
import CardTabs from './components/CardTabs.jsx'
import EmptyState from './components/EmptyState.jsx'
import HighlightsSheet from './components/HighlightsSheet.jsx'
import { AUTHORS, DEFAULT_EXPANDED_AUTHORS } from './data/authors.js'
import { getMeanings } from './data/meanings.js'
import { useCardSwipe } from './hooks/useCardSwipe.js'
import { useHighlights } from './hooks/useHighlights.js'
import { useScrollOffsets } from './hooks/useScrollMemory.js'

const resolveText = (card, author) => getMeanings(card)?.[author]

const MAX_CARDS = 3

export default function App() {
  const [selectedCards, setSelectedCards] = useState([])
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isSheetOpen, setSheetOpen] = useState(false)
  const [isHighlightsOpen, setHighlightsOpen] = useState(false)
  const [expandedByCard, setExpandedByCard] = useState(new Map())
  const scrollOffsets = useScrollOffsets()
  const highlights = useHighlights()

  const expandedAuthors = useCallback(
    (cardName) => expandedByCard.get(cardName) ?? DEFAULT_EXPANDED_AUTHORS,
    [expandedByCard],
  )

  const toggleAuthor = useCallback((cardName, authorId) => {
    setExpandedByCard((previous) => {
      const next = new Map(previous)
      const expanded = new Set(next.get(cardName) ?? DEFAULT_EXPANDED_AUTHORS)
      if (expanded.has(authorId)) expanded.delete(authorId)
      else expanded.add(authorId)
      next.set(cardName, expanded)
      return next
    })
  }, [])

  const expandAll = useCallback((cardName) => {
    setExpandedByCard((previous) => {
      const next = new Map(previous)
      next.set(cardName, new Set(AUTHORS.map((author) => author.id)))
      return next
    })
  }, [])

  const collapseAll = useCallback((cardName) => {
    setExpandedByCard((previous) => {
      const next = new Map(previous)
      next.set(cardName, new Set())
      return next
    })
  }, [])

  const selectCard = useCallback((cardName) => {
    setSelectedCards((previous) => {
      if (previous.includes(cardName) || previous.length >= MAX_CARDS) {
        return previous
      }
      const next = [...previous, cardName]
      setActiveCardIndex(next.length - 1)
      return next
    })
    setSheetOpen(false)
  }, [])

  const removeCard = useCallback(
    (cardName) => {
      setSelectedCards((previous) => {
        const next = previous.filter((card) => card !== cardName)
        const removedIndex = previous.indexOf(cardName)
        setActiveCardIndex((current) => {
          if (next.length === 0) return 0
          if (current >= next.length) return next.length - 1
          return removedIndex < current ? current - 1 : current
        })
        return next
      })
      setExpandedByCard((previous) => {
        const next = new Map(previous)
        next.delete(cardName)
        return next
      })
      // A card added back later should open at the top, not where the reader
      // left the previous copy.
      scrollOffsets.forget(cardName)
    },
    [scrollOffsets],
  )

  const activeCard = selectedCards[activeCardIndex]
  const hasCards = selectedCards.length > 0
  const canAddCard = selectedCards.length < MAX_CARDS

  const swipe = useCardSwipe({
    onSwipeLeft: () => {
      if (activeCardIndex < selectedCards.length - 1) {
        setActiveCardIndex(activeCardIndex + 1)
      }
    },
    onSwipeRight: () => {
      if (activeCardIndex > 0) setActiveCardIndex(activeCardIndex - 1)
    },
  })

  return (
    <div
      className="app-shell"
      style={{ backgroundColor: '#0a0a0f', color: '#fafafa' }}
    >
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 safe-top"
        style={{ height: '48px', borderBottom: '1px solid #27273a' }}
      >
        <h1
          className="text-lg font-bold bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(to right, #a78bfa, #6366f1)' }}
        >
          Tarot-Polis
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighlightsOpen(true)}
            className="touch-target relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ backgroundColor: '#1e1e2e', color: '#a1a1aa' }}
            aria-label="Marcações"
          >
            <Highlighter className="h-4 w-4" />
            {highlights.count > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: '#a78bfa', color: '#0a0a0f' }}
              >
                {highlights.count}
              </span>
            )}
          </button>
          {hasCards && (
            <span className="text-xs font-medium" style={{ color: '#a1a1aa' }}>
              {selectedCards.length}/{MAX_CARDS}
            </span>
          )}
          {canAddCard && (
            <button
              onClick={() => setSheetOpen(true)}
              className="touch-target flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
              style={{ backgroundColor: '#a78bfa', color: '#0a0a0f' }}
              aria-label="Adicionar carta"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-shrink-0">
        <CardTabs
          selectedCards={selectedCards}
          activeCardIndex={activeCardIndex}
          onTabChange={setActiveCardIndex}
          onRemoveCard={removeCard}
        />
      </div>

      {hasCards && activeCard ? (
        <div className="flex-1 min-h-0 flex flex-col" {...swipe.handlers}>
          <CardMeanings
            key={activeCard}
            cardName={activeCard}
            expandedAuthors={expandedAuthors(activeCard)}
            onToggleAuthor={(authorId) => toggleAuthor(activeCard, authorId)}
            onExpandAll={() => expandAll(activeCard)}
            onCollapseAll={() => collapseAll(activeCard)}
            scrollOffsets={scrollOffsets}
            highlights={highlights}
          />
        </div>
      ) : (
        <EmptyState onOpenSheet={() => setSheetOpen(true)} />
      )}

      {hasCards && canAddCard && (
        <button
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-30"
          style={{
            backgroundColor: '#a78bfa',
            color: '#0a0a0f',
            boxShadow: '0 4px 20px rgba(167, 139, 250, 0.3)',
            marginBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
          aria-label="Adicionar carta"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)}>
        <CardPicker
          selectedCards={selectedCards}
          onSelectCard={selectCard}
          maxCards={MAX_CARDS}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={isHighlightsOpen}
        onClose={() => setHighlightsOpen(false)}
      >
        <HighlightsSheet
          byPassage={highlights.byPassage}
          count={highlights.count}
          storageFailed={highlights.storageFailed}
          resolveText={resolveText}
          onExport={highlights.exportDocument}
          onImport={highlights.importDocument}
          onErase={highlights.erase}
          onClearAll={highlights.clearAll}
        />
      </BottomSheet>
    </div>
  )
}
