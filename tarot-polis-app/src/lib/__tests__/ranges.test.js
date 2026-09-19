import { describe, expect, it } from 'vitest'
import {
  applyHighlight,
  eraseRange,
  findRangeAt,
  mergeAdjacent,
  toSegments,
} from '../ranges.js'

const range = (start, end, color = 'amarelo') => ({
  id: `${start}-${end}`,
  start,
  end,
  color,
  createdAt: '2026-01-01T00:00:00.000Z',
})

describe('applyHighlight', () => {
  it('keeps ranges sorted', () => {
    let ranges = applyHighlight([], { start: 30, end: 40, color: 'azul' })
    ranges = applyHighlight(ranges, { start: 5, end: 10, color: 'verde' })

    expect(ranges.map((r) => [r.start, r.end])).toEqual([
      [5, 10],
      [30, 40],
    ])
  })

  it('replaces what it covers instead of stacking', () => {
    const ranges = applyHighlight([range(10, 20, 'amarelo')], {
      start: 10,
      end: 20,
      color: 'rosa',
    })

    expect(ranges).toHaveLength(1)
    expect(ranges[0].color).toBe('rosa')
  })

  it('splits a range painted over in the middle', () => {
    const ranges = applyHighlight([range(0, 30, 'amarelo')], {
      start: 10,
      end: 20,
      color: 'azul',
    })

    expect(ranges.map((r) => [r.start, r.end, r.color])).toEqual([
      [0, 10, 'amarelo'],
      [10, 20, 'azul'],
      [20, 30, 'amarelo'],
    ])
  })

  it('trims a partially covered neighbour', () => {
    const ranges = applyHighlight([range(0, 20, 'amarelo')], {
      start: 15,
      end: 25,
      color: 'azul',
    })

    expect(ranges.map((r) => [r.start, r.end, r.color])).toEqual([
      [0, 15, 'amarelo'],
      [15, 25, 'azul'],
    ])
  })

  it('folds a touching range of the same color into one', () => {
    const ranges = applyHighlight([range(0, 10, 'verde')], {
      start: 10,
      end: 20,
      color: 'verde',
    })

    expect(ranges.map((r) => [r.start, r.end])).toEqual([[0, 20]])
  })

  it('ignores an empty selection', () => {
    expect(applyHighlight([], { start: 7, end: 7, color: 'azul' })).toEqual([])
  })

  it('never leaves two ranges overlapping', () => {
    let ranges = []
    for (const [start, end, color] of [
      [0, 50, 'amarelo'],
      [20, 30, 'azul'],
      [25, 60, 'rosa'],
      [0, 10, 'verde'],
      [45, 47, 'laranja'],
    ]) {
      ranges = applyHighlight(ranges, { start, end, color })
    }

    for (let i = 1; i < ranges.length; i += 1) {
      expect(ranges[i].start).toBeGreaterThanOrEqual(ranges[i - 1].end)
    }
  })
})

describe('eraseRange', () => {
  it('removes a range covered end to end', () => {
    expect(eraseRange([range(10, 20)], 5, 25)).toEqual([])
  })

  it('leaves untouched ranges alone', () => {
    const ranges = [range(0, 5), range(10, 20)]
    expect(eraseRange(ranges, 10, 20)).toEqual([ranges[0]])
  })

  it('gives the tail piece its own id', () => {
    const [head, tail] = eraseRange([range(0, 30)], 10, 20)
    expect([head.start, head.end]).toEqual([0, 10])
    expect([tail.start, tail.end]).toEqual([20, 30])
    expect(tail.id).not.toBe(head.id)
  })
})

describe('mergeAdjacent', () => {
  it('leaves different colors apart', () => {
    const ranges = mergeAdjacent([range(0, 10, 'azul'), range(10, 20, 'rosa')])
    expect(ranges).toHaveLength(2)
  })
})

describe('toSegments', () => {
  const text = 'O Seis de Espadas atravessa águas calmas.'

  it('returns one plain segment when there is nothing highlighted', () => {
    expect(toSegments(text, [])).toEqual([
      { start: 0, end: text.length, text, highlight: null },
    ])
  })

  it('splits around a highlight', () => {
    const segments = toSegments(text, [range(2, 17, 'azul')])

    expect(segments.map((s) => s.text)).toEqual([
      'O ',
      'Seis de Espadas',
      ' atravessa águas calmas.',
    ])
    expect(segments[1].highlight.color).toBe('azul')
    expect(segments[0].highlight).toBeNull()
  })

  it('reassembles into the original text', () => {
    const segments = toSegments(text, [range(0, 1), range(5, 9, 'verde')])
    expect(segments.map((s) => s.text).join('')).toBe(text)
  })

  it('clamps offsets past the end of the text', () => {
    const segments = toSegments('curto', [range(2, 500)])
    expect(segments.map((s) => s.text).join('')).toBe('curto')
    expect(segments.at(-1).end).toBe(5)
  })
})

describe('findRangeAt', () => {
  it('treats the end offset as outside the range', () => {
    const ranges = [range(10, 20)]
    expect(findRangeAt(ranges, 10)).toBe(ranges[0])
    expect(findRangeAt(ranges, 19)).toBe(ranges[0])
    expect(findRangeAt(ranges, 20)).toBeNull()
  })
})
