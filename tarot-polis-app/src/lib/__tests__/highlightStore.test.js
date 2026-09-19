import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildExport,
  exportFileName,
  fromFlatList,
  loadHighlights,
  mergeImported,
  parseImport,
  passageKey,
  saveHighlights,
  toFlatList,
} from '../highlightStore.js'

const CARD = '6 de Espadas'
const AUTHOR = 'Waite'
const TEXT = 'Uma viagem por água, uma travessia rumo a águas mais calmas.'

const resolveText = (card, author) =>
  card === CARD && author === AUTHOR ? TEXT : undefined

const stored = {
  [passageKey(CARD, AUTHOR)]: [
    {
      id: 'h1',
      start: 4,
      end: 19,
      color: 'azul',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
}

describe('storage round trip', () => {
  beforeEach(() => localStorage.clear())

  it('reloads what it saved', () => {
    expect(saveHighlights(stored)).toBe(true)
    expect(loadHighlights()).toEqual(stored)
  })

  it('returns nothing when the store is empty', () => {
    expect(loadHighlights()).toEqual({})
  })

  it('survives a corrupt store instead of throwing', () => {
    localStorage.setItem('tarot-polis:highlights:v1', 'not json{{')
    expect(loadHighlights()).toEqual({})
  })

  it('keeps card and author through the flat form', () => {
    const flat = toFlatList(stored)
    expect(flat[0]).toMatchObject({ card: CARD, author: AUTHOR, color: 'azul' })
    expect(fromFlatList(flat)).toEqual(stored)
  })
})

describe('buildExport', () => {
  it('carries the excerpt next to the offsets', () => {
    const doc = buildExport(stored, resolveText)

    expect(doc.schema).toBe('tarot-polis/highlights')
    expect(doc.count).toBe(1)
    expect(doc.highlights[0].text).toBe('viagem por água')
  })

  it('names the file after the moment it was written', () => {
    expect(exportFileName(new Date('2026-09-19T01:02:03Z'))).toBe(
      'tarot-polis-marcacoes-2026-09-19-01-02-03.json',
    )
  })
})

describe('parseImport', () => {
  it('reads back an export unchanged', () => {
    const doc = buildExport(stored, resolveText)
    const { entries, repaired, skipped } = parseImport(doc, resolveText)

    expect(entries).toHaveLength(1)
    expect(repaired + skipped).toBe(0)
    expect(entries[0]).toMatchObject({ start: 4, end: 19, color: 'azul' })
  })

  it('re-anchors an excerpt that moved in the source text', () => {
    const doc = buildExport(stored, resolveText)
    const shifted = `Prefácio. ${TEXT}`

    const { entries, repaired } = parseImport(doc, () => shifted)

    expect(repaired).toBe(1)
    expect(shifted.slice(entries[0].start, entries[0].end)).toBe('viagem por água')
  })

  it('skips an excerpt that is gone from the text', () => {
    const doc = buildExport(stored, resolveText)
    const { entries, skipped } = parseImport(doc, () => 'texto completamente outro')

    expect(entries).toHaveLength(0)
    expect(skipped).toBe(1)
  })

  it('skips a card the app does not know', () => {
    const doc = buildExport(stored, resolveText)
    const { skipped } = parseImport(doc, () => undefined)
    expect(skipped).toBe(1)
  })

  it('skips malformed entries but keeps the good ones', () => {
    const doc = {
      schema: 'tarot-polis/highlights',
      version: 1,
      highlights: [
        { card: CARD, author: AUTHOR, start: 0, end: 4, color: 'verde', text: 'Uma ' },
        { card: CARD, author: AUTHOR, start: 10, end: 5, color: 'verde' },
        { card: CARD, start: 0, end: 3, color: 'verde' },
        null,
      ],
    }

    const { entries, skipped } = parseImport(doc, resolveText)
    expect(entries).toHaveLength(1)
    expect(skipped).toBe(3)
  })

  it('rejects a file from another app', () => {
    expect(() => parseImport({ schema: 'outro/app', highlights: [] }, resolveText))
      .toThrow(/outro app/)
  })

  it('rejects a file written by a newer version', () => {
    expect(() =>
      parseImport({ schema: 'tarot-polis/highlights', version: 99, highlights: [] }, resolveText),
    ).toThrow(/versão 99/)
  })

  it('rejects something that is not an export at all', () => {
    expect(() => parseImport({ hello: 'world' }, resolveText)).toThrow(/não reconhecido/)
    expect(() => parseImport(null, resolveText)).toThrow(/não reconhecido/)
  })
})

describe('mergeImported', () => {
  it('is a no-op when re-importing the same export', () => {
    const doc = buildExport(stored, resolveText)
    const { entries } = parseImport(doc, resolveText)

    expect(mergeImported(stored, entries)).toEqual(stored)
  })

  it('keeps highlights the import does not mention', () => {
    const other = passageKey('Rainha de Copas', 'Greer')
    const existing = {
      ...stored,
      [other]: [{ id: 'h2', start: 0, end: 5, color: 'rosa', createdAt: 'x' }],
    }
    const { entries } = parseImport(buildExport(stored, resolveText), resolveText)

    expect(mergeImported(existing, entries)[other]).toHaveLength(1)
  })

  it('lets the imported color win where the two overlap', () => {
    const doc = {
      schema: 'tarot-polis/highlights',
      version: 1,
      highlights: [
        { id: 'new', card: CARD, author: AUTHOR, start: 4, end: 19, color: 'rosa', text: 'viagem por água' },
      ],
    }
    const { entries } = parseImport(doc, resolveText)
    const merged = mergeImported(stored, entries)

    expect(merged[passageKey(CARD, AUTHOR)]).toHaveLength(1)
    expect(merged[passageKey(CARD, AUTHOR)][0].color).toBe('rosa')
  })
})
