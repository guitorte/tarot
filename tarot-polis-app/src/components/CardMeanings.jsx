import { useCallback, useMemo, useState } from 'react'
import { Book, ChevronDown, ChevronUp, User } from 'lucide-react'
import { AUTHORS } from '../data/authors.js'
import { CARD_BADGES, SUITS, getSuit, isMajorArcana } from '../data/cards.js'
import { getMeanings } from '../data/meanings.js'
import { useScrollMemory } from '../hooks/useScrollMemory.js'
import { useTextSelection } from '../hooks/useTextSelection.js'
import HighlightableText from './HighlightableText.jsx'
import HighlightToolbar from './HighlightToolbar.jsx'

export default function CardMeanings({
  cardName,
  expandedAuthors,
  onToggleAuthor,
  onExpandAll,
  onCollapseAll,
  scrollOffsets,
  highlights,
}) {
  const meanings = useMemo(() => getMeanings(cardName), [cardName])
  const badge = CARD_BADGES[cardName]
  const suit = getSuit(cardName)
  const major = isMajorArcana(cardName)
  const suitLabel = major ? 'Arcano Maior' : suit ? SUITS[suit].name : ''
  const accent = major ? '#a78bfa' : suit ? SUITS[suit].color : '#a1a1aa'

  // Scroll offsets are stored per card, so coming back to this tab lands on
  // the paragraph the reader left off at instead of the top of the pane.
  const scroll = useScrollMemory(scrollOffsets, cardName)

  // A pending selection and a tapped highlight both drive the same toolbar.
  const { selection, setSelection, clear: clearSelection } =
    useTextSelection(scroll.ref)
  const [pickedHighlight, setPickedHighlight] = useState(null)
  const target = pickedHighlight ?? selection

  const dismiss = useCallback(() => {
    setPickedHighlight(null)
    clearSelection()
  }, [clearSelection])

  const paint = useCallback(
    (color) => {
      if (target) highlights.highlight(target.card, target.author, { ...target, color })
      dismiss()
    },
    [dismiss, highlights, target],
  )

  const erase = useCallback(() => {
    if (target) highlights.erase(target.card, target.author, target.start, target.end)
    dismiss()
  }, [dismiss, highlights, target])

  const pickHighlight = useCallback(
    (picked) => {
      setSelection(null)
      setPickedHighlight(picked)
    },
    [setSelection],
  )

  if (!meanings) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p style={{ color: '#a1a1aa' }}>
          Interpretações não encontradas para esta carta.
        </p>
      </div>
    )
  }

  const authors = AUTHORS.filter((author) => meanings[author.id])

  return (
    <div
      ref={scroll.ref}
      onScroll={scroll.onScroll}
      onScrollCapture={() => setPickedHighlight(null)}
      className="flex-1 overflow-y-auto pb-24"
    >
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid #27273a' }}
      >
        <span
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          {badge || '?'}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold truncate">{cardName}</h2>
          <p className="text-xs" style={{ color: accent }}>
            {suitLabel} · {authors.length} interpretações
          </p>
        </div>
      </div>

      <div
        className="px-4 py-2 flex gap-4"
        style={{ borderBottom: '1px solid #27273a' }}
      >
        <button
          onClick={onExpandAll}
          className="touch-target text-sm py-2"
          style={{ color: '#a78bfa' }}
        >
          Expandir todas
        </button>
        <button
          onClick={onCollapseAll}
          className="touch-target text-sm py-2"
          style={{ color: '#a1a1aa' }}
        >
          Recolher todas
        </button>
      </div>

      <div>
        {authors.map((author, index) => {
          const meaning = meanings[author.id]
          const isExpanded = expandedAuthors.has(author.id)
          return (
            <div
              key={author.id}
              style={{ borderTop: index > 0 ? '1px solid #27273a' : undefined }}
            >
              <button
                onClick={() => onToggleAuthor(author.id)}
                className="touch-target w-full px-4 py-3 flex items-center gap-3 text-left"
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(to bottom right, rgba(167, 139, 250, 0.3), rgba(99, 102, 241, 0.3))',
                  }}
                >
                  <User className="h-4 w-4" style={{ color: '#a78bfa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{author.name}</h3>
                  <p className="text-xs" style={{ color: '#a1a1aa' }}>
                    {author.description}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: '#a1a1aa' }}
                  />
                ) : (
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: '#a1a1aa' }}
                  />
                )}
              </button>

              {isExpanded && meaning && (
                <div className="px-4 pb-4 pl-16">
                  <div className="flex gap-2">
                    <Book
                      className="h-4 w-4 flex-shrink-0 mt-0.5"
                      style={{ color: '#a78bfa' }}
                    />
                    <HighlightableText
                      text={meaning}
                      ranges={highlights.rangesFor(cardName, author.id)}
                      card={cardName}
                      author={author.id}
                      onPickHighlight={pickHighlight}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <HighlightToolbar
        target={target}
        onPick={paint}
        onErase={erase}
        onDismiss={dismiss}
      />
    </div>
  )
}
