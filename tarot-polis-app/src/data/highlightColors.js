// Six washes tuned for the dark reading pane: saturated enough to tell apart
// at a glance, transparent enough to keep the text legible underneath.
export const HIGHLIGHT_COLORS = [
  { id: 'amarelo', label: 'Amarelo', hex: '#facc15' },
  { id: 'verde', label: 'Verde', hex: '#4ade80' },
  { id: 'azul', label: 'Azul', hex: '#60a5fa' },
  { id: 'roxo', label: 'Roxo', hex: '#c084fc' },
  { id: 'rosa', label: 'Rosa', hex: '#f472b6' },
  { id: 'laranja', label: 'Laranja', hex: '#fb923c' },
]

export const DEFAULT_COLOR = HIGHLIGHT_COLORS[0].id

const BY_ID = Object.fromEntries(HIGHLIGHT_COLORS.map((color) => [color.id, color]))

export function getColor(colorId) {
  return BY_ID[colorId] ?? BY_ID[DEFAULT_COLOR]
}

/** Inline style for a highlighted run of text. */
export function highlightStyle(colorId) {
  const { hex } = getColor(colorId)
  return {
    backgroundColor: `${hex}40`,
    boxShadow: `inset 0 -2px 0 ${hex}99`,
    color: '#fafafa',
    borderRadius: '2px',
  }
}
