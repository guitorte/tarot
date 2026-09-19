import rawMeanings from './tarot_significados.json'

// { "O Louco": { "Waite": "…", "Crowley": "…" }, … }
const MEANINGS_BY_CARD = Object.fromEntries(
  rawMeanings.map(({ carta, autores }) => {
    const byAuthor = {}
    for (const [authorId, entry] of Object.entries(autores)) {
      if (entry?.significado) byAuthor[authorId] = entry.significado
    }
    return [carta, byAuthor]
  }),
)

export function getMeanings(cardName) {
  return MEANINGS_BY_CARD[cardName]
}

export function searchCards(query) {
  const needle = query.toLowerCase()
  return Object.keys(MEANINGS_BY_CARD).filter((card) =>
    card.toLowerCase().includes(needle),
  )
}
