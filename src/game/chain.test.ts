import { describe, expect, it } from 'vitest'
import { detectChainContradictions } from './chain'
import type { CardId, Comparison } from './types'

const track = (ids: (CardId | null)[]): (CardId | null)[] => ids

describe('detectChainContradictions', () => {
  it('returns nothing for an empty or single-token track', () => {
    expect(detectChainContradictions([null, null], [])).toEqual([])
    expect(detectChainContradictions(track(['A']), [])).toEqual([])
  })

  it('returns nothing when the track agrees with history', () => {
    const history: Comparison[] = [
      { larger: 'C', smaller: 'A' },
      { larger: 'G', smaller: 'C' },
    ]
    // Track places A < C < G — consistent.
    expect(detectChainContradictions(track(['A', 'C', 'G']), history)).toEqual(
      [],
    )
  })

  it('flags a direct contradiction', () => {
    const history: Comparison[] = [{ larger: 'A', smaller: 'B' }] // B < A
    // Track asserts A < B (A left of B) — contradicts history.
    const result = detectChainContradictions(track(['A', 'B']), history)
    expect(result).toEqual([{ trackLeft: 'A', trackRight: 'B' }])
  })

  it('flags a transitive contradiction', () => {
    // History proves A < B < C, so C is the largest.
    const history: Comparison[] = [
      { larger: 'B', smaller: 'A' },
      { larger: 'C', smaller: 'B' },
    ]
    // Track asserts C < A (C placed left of A) — contradicts transitive A < C.
    const result = detectChainContradictions(track(['C', 'A']), history)
    expect(result).toContainEqual({ trackLeft: 'C', trackRight: 'A' })
  })
})
