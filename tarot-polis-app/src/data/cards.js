export const MAJOR_ARCANA = [
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Amantes', 'O Carro', 'A Justiça', 'O Eremita',
  'A Roda da Fortuna', 'A Força', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol', 'O Julgamento',
  'O Mundo',
]

const RANKS = [
  ['Ás', 'A'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['10', '10'], ['Valete', 'V'],
  ['Cavaleiro', 'C'], ['Rainha', 'R'], ['Rei', 'K'],
]

const suitCards = (suit) => RANKS.map(([rank]) => `${rank} de ${suit}`)

export const CUPS = suitCards('Copas')
export const PENTACLES = suitCards('Ouros')
export const WANDS = suitCards('Paus')
export const SWORDS = suitCards('Espadas')

export const MINOR_ARCANA = [...CUPS, ...PENTACLES, ...WANDS, ...SWORDS]

export const SUITS = {
  copas: { name: 'Copas', color: '#3b82f6', element: 'Água' },
  ouros: { name: 'Ouros', color: '#eab308', element: 'Terra' },
  paus: { name: 'Paus', color: '#ef4444', element: 'Fogo' },
  espadas: { name: 'Espadas', color: '#a1a1aa', element: 'Ar' },
}

export const CATEGORIES = [
  { id: 'major', label: 'Maiores', color: '#a78bfa', cards: MAJOR_ARCANA },
  { id: 'copas', label: 'Copas', color: SUITS.copas.color, cards: CUPS },
  { id: 'ouros', label: 'Ouros', color: SUITS.ouros.color, cards: PENTACLES },
  { id: 'paus', label: 'Paus', color: SUITS.paus.color, cards: WANDS },
  { id: 'espadas', label: 'Espadas', color: SUITS.espadas.color, cards: SWORDS },
]

const MAJOR_NUMERALS = [
  '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
  'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI',
]

// Short badge shown next to each card name ("XIII", "6", "R", ...).
export const CARD_BADGES = {
  ...Object.fromEntries(MAJOR_ARCANA.map((card, i) => [card, MAJOR_NUMERALS[i]])),
  ...Object.fromEntries(
    ['Copas', 'Ouros', 'Paus', 'Espadas'].flatMap((suit) =>
      RANKS.map(([rank, badge]) => [`${rank} de ${suit}`, badge]),
    ),
  ),
}

export function getSuit(cardName) {
  if (cardName.includes('Copas')) return 'copas'
  if (cardName.includes('Ouros')) return 'ouros'
  if (cardName.includes('Paus')) return 'paus'
  if (cardName.includes('Espadas')) return 'espadas'
  return null
}

export function isMajorArcana(cardName) {
  return MAJOR_ARCANA.includes(cardName)
}

export function getCardColor(cardName) {
  if (isMajorArcana(cardName)) return '#a78bfa'
  const suit = getSuit(cardName)
  return suit ? SUITS[suit].color : '#a1a1aa'
}
