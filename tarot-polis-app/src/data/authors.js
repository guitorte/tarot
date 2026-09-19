// The 17 interpreters bundled with the dictionary, in display order.
export const AUTHORS = [
  { id: 'Arrien', name: 'Angeles Arrien', description: 'Princípios e Arquétipos' },
  { id: 'Cowie', name: 'Norma Cowie', description: 'Orientação Espiritual Prática' },
  { id: 'Crowley', name: 'Aleister Crowley', description: 'Tradição Hermética/Esotérica' },
  { id: 'Eakins', name: 'Pamela Eakins', description: 'Consciência e Transformação' },
  { id: 'Fairfield', name: 'Gail Fairfield', description: 'Energia e Consciência' },
  { id: 'Greer', name: 'Mary K. Greer', description: 'Princípios Arquetípicos' },
  { id: 'Noble', name: 'Vicki Noble', description: 'Sombra e Transformação' },
  { id: 'Pollack', name: 'Rachel Pollack', description: 'Dimensões Psicológicas' },
  { id: 'Sharman-Burke', name: 'Juliet Sharman-Burke', description: 'Significados Simbólicos Tradicionais' },
  { id: 'Stewart', name: 'R.J. Stewart', description: 'Trabalho de Energia Espiritual' },
  { id: 'Waite', name: 'Arthur Edward Waite', description: 'Tradição Esotérica Ocidental' },
  { id: 'Walker', name: 'Barbara Walker', description: 'Mitologia e Deusa' },
  { id: 'Wanless', name: 'James Wanless', description: 'Leis Universais' },
  { id: 'Wirth', name: 'Oswald Wirth', description: 'Perspectivas Iniciáticas' },
  { id: 'Riley', name: 'Jana Riley', description: 'Mensagens de Orientação Espiritual' },
  { id: 'Ben Dov', name: 'Yoav Ben-Dov', description: 'Leitura Aberta do Tarô' },
  { id: 'Jodorowsky', name: 'Alejandro Jodorowsky', description: 'A Via do Tarô' },
]

// Authors expanded by default when a card is opened for the first time.
export const DEFAULT_EXPANDED_AUTHORS = new Set(AUTHORS.slice(0, 3).map((a) => a.id))
