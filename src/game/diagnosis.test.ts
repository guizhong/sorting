import { describe, expect, it } from 'vitest'
import { initialDataCards } from './deck'
import { generateDiagnosis } from './diagnosis'
import { createInitialState } from './reducer'
import type { CardId, Comparison, GameState, Pile } from './types'

// Seed-set ranks: D=1, J=2, F=3, B=4, H=5, E=6, I=7, K=8, G=9, A=10, C=11.

function state(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    dataCards: initialDataCards.map((c) => ({ ...c })),
    ...overrides,
  }
}

describe('generateDiagnosis', () => {
  it('clean win', () => {
    const msg = generateDiagnosis(state({ comparisonCount: 19 }), 'E')
    expect(msg).toMatch(/Clean win/)
    expect(msg).toContain('19 comparisons')
  })

  it('expensive win', () => {
    const msg = generateDiagnosis(state({ comparisonCount: 31 }), 'E')
    expect(msg).toMatch(/close to a full sort/)
    expect(msg).toContain('31 comparisons')
  })

  it('contradiction gates rank-based diagnoses', () => {
    const history: Comparison[] = [{ larger: 'A', smaller: 'B' }] // B < A
    const chainTrack: (CardId | null)[] = ['A', 'B', ...Array(9).fill(null)]
    const msg = generateDiagnosis(
      state({ comparisonCount: 15, comparisonHistory: history, chainTrack }),
      'F',
    )
    expect(msg).toMatch(/contradict/i)
    expect(msg).toContain('A')
    expect(msg).toContain('B')
  })

  it('premature declaration', () => {
    const msg = generateDiagnosis(state({ comparisonCount: 8 }), 'F')
    expect(msg).toMatch(/only 8 comparisons/)
    expect(msg).toMatch(/cannot be determined/)
  })

  it('off-by-one miss', () => {
    const msg = generateDiagnosis(state({ comparisonCount: 15 }), 'H') // rank 5
    expect(msg).toMatch(/right beside the median/)
    expect(msg).toContain('rank 5')
  })

  it('lower half with pile count', () => {
    const piles: Partial<Record<CardId, Pile>> = {
      D: 'smaller',
      J: 'smaller',
      F: 'smaller',
    }
    const msg = generateDiagnosis(
      state({ comparisonCount: 15, piles }),
      'F', // rank 3
    )
    expect(msg).toMatch(/lower half/)
    expect(msg).toContain('only 3 in the SMALLER pile')
  })

  it('upper half with pile count', () => {
    const piles: Partial<Record<CardId, Pile>> = {
      I: 'larger',
      K: 'larger',
    }
    const msg = generateDiagnosis(
      state({ comparisonCount: 15, piles }),
      'G', // rank 9
    )
    expect(msg).toMatch(/upper half/)
    expect(msg).toContain('only 2 in the LARGER pile')
  })
})
