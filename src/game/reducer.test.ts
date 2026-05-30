import { describe, expect, it } from 'vitest'
import { createInitialState, gameReducer } from './reducer'
import { DECK_SIZE } from './types'

describe('gameReducer', () => {
  it('starts in the playing phase with a full face-down deck', () => {
    const s = createInitialState()
    expect(s.phase).toBe('playing')
    expect(s.dataCards).toHaveLength(DECK_SIZE)
    expect(s.dataCards.every((c) => !c.faceUp)).toBe(true)
    expect(s.chainTrack).toHaveLength(DECK_SIZE)
    expect(s.comparisonCount).toBe(0)
  })

  it('COMPARE increments the counter and appends history', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'COMPARE', left: 'A', right: 'B' }) // 872 vs 341
    expect(s.comparisonCount).toBe(1)
    expect(s.comparisonHistory).toEqual([{ larger: 'A', smaller: 'B' }])
    s = gameReducer(s, { type: 'COMPARE', left: 'D', right: 'C' }) // 102 vs 999
    expect(s.comparisonCount).toBe(2)
    expect(s.comparisonHistory[1]).toEqual({ larger: 'C', smaller: 'D' })
  })

  it('COMPARE ignores comparing a card with itself', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'COMPARE', left: 'A', right: 'A' })
    expect(s.comparisonCount).toBe(0)
  })

  it('PLACE_IN_PILE records the assignment', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'PLACE_IN_PILE', id: 'A', pile: 'larger' })
    expect(s.piles.A).toBe('larger')
  })

  it('CHAIN_MOVE places, relocates, and removes tokens', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'CHAIN_MOVE', id: 'A', slot: 3 })
    expect(s.chainTrack[3]).toBe('A')
    // Relocating clears the old slot.
    s = gameReducer(s, { type: 'CHAIN_MOVE', id: 'A', slot: 5 })
    expect(s.chainTrack[3]).toBeNull()
    expect(s.chainTrack[5]).toBe('A')
    // Removing returns it to holding.
    s = gameReducer(s, { type: 'CHAIN_MOVE', id: 'A', slot: null })
    expect(s.chainTrack.every((c) => c === null)).toBe(true)
  })

  it('CHAIN_MOVE onto an occupied slot bumps the occupant', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'CHAIN_MOVE', id: 'A', slot: 2 })
    s = gameReducer(s, { type: 'CHAIN_MOVE', id: 'B', slot: 2 })
    expect(s.chainTrack[2]).toBe('B')
    expect(s.chainTrack.filter((c) => c === 'A')).toHaveLength(0)
  })

  it('DECLARE then REVEAL transitions phases and flips all cards', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'DECLARE', id: 'E' })
    expect(s.phase).toBe('verifying')
    expect(s.declaredCardId).toBe('E')
    s = gameReducer(s, { type: 'REVEAL' })
    expect(s.phase).toBe('results')
    expect(s.dataCards.every((c) => c.faceUp)).toBe(true)
  })

  it('ignores gameplay actions once not playing', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'DECLARE', id: 'E' })
    const before = s.comparisonCount
    s = gameReducer(s, { type: 'COMPARE', left: 'A', right: 'B' })
    expect(s.comparisonCount).toBe(before)
  })

  it('RESET starts a fresh round', () => {
    let s = createInitialState()
    s = gameReducer(s, { type: 'COMPARE', left: 'A', right: 'B' })
    s = gameReducer(s, { type: 'DECLARE', id: 'E' })
    s = gameReducer(s, { type: 'RESET' })
    expect(s.phase).toBe('playing')
    expect(s.comparisonCount).toBe(0)
    expect(s.declaredCardId).toBeNull()
  })
})
