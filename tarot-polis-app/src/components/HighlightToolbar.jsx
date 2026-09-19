import { Eraser } from 'lucide-react'
import { HIGHLIGHT_COLORS } from '../data/highlightColors.js'

const WIDTH = 296
const HEIGHT = 48
const MARGIN = 8

function position(rect) {
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - WIDTH / 2, MARGIN),
    window.innerWidth - WIDTH - MARGIN,
  )
  // Above the selection, unless it is too close to the top of the screen.
  const above = rect.top - HEIGHT - MARGIN
  const top = above > MARGIN ? above : rect.bottom + MARGIN

  return { left, top: Math.min(top, window.innerHeight - HEIGHT - MARGIN) }
}

export default function HighlightToolbar({ target, onPick, onErase, onDismiss }) {
  if (!target) return null

  const { left, top } = position(target.rect)

  return (
    <div
      role="toolbar"
      aria-label="Marcar trecho"
      className="fixed z-40 flex items-center gap-2 px-3 rounded-xl shadow-lg"
      style={{
        left,
        top,
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: '#1e1e2e',
        border: '1px solid #27273a',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45)',
      }}
      // Keep the text selection alive while the toolbar is being tapped.
      onMouseDown={(event) => event.preventDefault()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.id}
          onClick={() => onPick(color.id)}
          aria-label={color.label}
          title={color.label}
          className="flex-shrink-0 w-7 h-7 rounded-full transition-transform active:scale-90"
          style={{
            backgroundColor: color.hex,
            border: '2px solid rgba(250, 250, 250, 0.15)',
          }}
        />
      ))}
      <button
        onClick={target.existing ? onErase : onDismiss}
        aria-label={target.existing ? 'Remover marcação' : 'Cancelar'}
        title={target.existing ? 'Remover marcação' : 'Cancelar'}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#27273a', color: '#a1a1aa' }}
      >
        <Eraser className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
