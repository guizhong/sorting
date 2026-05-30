import { describe, expect, it } from 'vitest'
import { initialDataCards, makeDeck } from './deck'
import { checkWin, getMedianCard, getSortedRanks } from './ranking'

describe('ranking on the GDD seed dataset', () => {
  it('ranks cards 1..11 ascending by value', () => {
    const { ranks, sorted } = getSortedRanks(initialDataCards)
    expect(sorted.map((c) => c.value)).toEqual([
      102, 118, 204, 341, 433, 556, 609, 695, 781, 872, 999,
    ])
    expect(ranks.D).toBe(1) // 102
    expect(ranks.C).toBe(11) // 999
    expect(ranks.E).toBe(6) // 556 = median
  })

  it('identifies E (556) as the median', () => {
    expect(getMedianCard(initialDataCards).id).toBe('E')
    expect(checkWin(initialDataCards, 'E')).toBe(true)
  })

  it('rejects any non-median card', () => {
    expect(checkWin(initialDataCards, 'D')).toBe(false)
    expect(checkWin(initialDataCards, 'C')).toBe(false)
  })
})

describe('makeDeck', () => {
  it('returns the fixed dataset when no seed is given', () => {
    expect(makeDeck()).toEqual(initialDataCards)
  })

  it('is deterministic and unique-valued for a given seed', () => {
    const a = makeDeck(42)
    const b = makeDeck(42)
    expect(a).toEqual(b)
    const values = a.map((c) => c.value)
    expect(new Set(values).size).toBe(11)
    expect(values.every((v) => v >= 100 && v <= 999)).toBe(true)
  })
})
