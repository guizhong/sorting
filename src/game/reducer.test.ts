import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialState } from './reducer';
import type { CardId } from './types';

describe('gameReducer', () => {
  describe('initial state', () => {
    it('has 11 face-down cards', () => {
      const state = createInitialState();
      expect(state.cards).toHaveLength(11);
      expect(state.cards.every((c) => !c.faceUp)).toBe(true);
    });

    it('starts in playing phase', () => {
      expect(createInitialState().phase).toBe('playing');
    });

    it('has zero comparisons', () => {
      expect(createInitialState().comparisonCount).toBe(0);
      expect(createInitialState().comparisonHistory).toEqual([]);
    });

    it('has empty pile assignments', () => {
      const state = createInitialState();
      expect(Object.values(state.pileAssignments).every((v) => v === null)).toBe(true);
    });

    it('has empty 11-slot chain track', () => {
      const state = createInitialState();
      expect(state.chainTrack).toHaveLength(11);
      expect(state.chainTrack.every((s) => s === null)).toBe(true);
    });

    it('has no selected or declared card', () => {
      const state = createInitialState();
      expect(state.selectedCardId).toBeNull();
      expect(state.declaredCardId).toBeNull();
    });
  });

  describe('COMPARE', () => {
    it('increments comparisonCount', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'COMPARE', left: 'A', right: 'B' });
      expect(next.comparisonCount).toBe(1);
    });

    it('appends to comparisonHistory with correct direction', () => {
      const state = createInitialState();
      // A=872, B=341, so A is larger
      const next = gameReducer(state, { type: 'COMPARE', left: 'A', right: 'B' });
      expect(next.comparisonHistory).toHaveLength(1);
      expect(next.comparisonHistory[0]).toEqual({ larger: 'A', smaller: 'B' });
    });

    it('works regardless of left/right order', () => {
      const state = createInitialState();
      // B=341, A=872, so A is larger even though it's on the right
      const next = gameReducer(state, { type: 'COMPARE', left: 'B', right: 'A' });
      expect(next.comparisonHistory[0]).toEqual({ larger: 'A', smaller: 'B' });
    });

    it('does nothing if card not found', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'COMPARE', left: 'Z' as CardId, right: 'A' });
      expect(next.comparisonCount).toBe(0);
      expect(next.comparisonHistory).toEqual([]);
    });

    it('accumulates history across multiple comparisons', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'COMPARE', left: 'A', right: 'B' });
      state = gameReducer(state, { type: 'COMPARE', left: 'C', right: 'D' });
      expect(state.comparisonCount).toBe(2);
      expect(state.comparisonHistory).toHaveLength(2);
    });
  });

  describe('PLACE_IN_PILE', () => {
    it('assigns a card to larger pile', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'PLACE_IN_PILE', id: 'A', pile: 'larger' });
      expect(next.pileAssignments['A']).toBe('larger');
    });

    it('assigns a card to smaller pile', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'PLACE_IN_PILE', id: 'B', pile: 'smaller' });
      expect(next.pileAssignments['B']).toBe('smaller');
    });
  });

  describe('CHAIN_MOVE', () => {
    it('places a token in an empty slot', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'CHAIN_MOVE', id: 'A', slot: 3 });
      expect(next.chainTrack[3]).toBe('A');
    });

    it('removes a token when slot is null', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'CHAIN_MOVE', id: 'A', slot: 3 });
      state = gameReducer(state, { type: 'CHAIN_MOVE', id: 'A', slot: null });
      expect(state.chainTrack[3]).toBeNull();
    });

    it('moves a token from one slot to another', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'CHAIN_MOVE', id: 'A', slot: 2 });
      state = gameReducer(state, { type: 'CHAIN_MOVE', id: 'A', slot: 7 });
      expect(state.chainTrack[2]).toBeNull();
      expect(state.chainTrack[7]).toBe('A');
    });

    it('evicts existing token when placing in occupied slot', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'CHAIN_MOVE', id: 'A', slot: 3 });
      state = gameReducer(state, { type: 'CHAIN_MOVE', id: 'B', slot: 3 });
      // A was evicted, B is now in slot 3
      expect(state.chainTrack[3]).toBe('B');
      // A should not be anywhere
      expect(state.chainTrack.filter((s) => s === 'A')).toHaveLength(0);
    });

    it('ignores out-of-bounds slot', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'CHAIN_MOVE', id: 'A', slot: 11 });
      expect(state.chainTrack.every((s) => s === null)).toBe(true);
    });
  });

  describe('SELECT_CARD', () => {
    it('sets selected card', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'SELECT_CARD', id: 'E' });
      expect(next.selectedCardId).toBe('E');
    });

    it('deselects when null', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'SELECT_CARD', id: 'E' });
      state = gameReducer(state, { type: 'SELECT_CARD', id: null });
      expect(state.selectedCardId).toBeNull();
    });
  });

  describe('DECLARE', () => {
    it('sets declaredCardId and transitions to verifying', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'DECLARE', id: 'E' });
      expect(next.declaredCardId).toBe('E');
      expect(next.phase).toBe('verifying');
    });

    it('is ignored if not in playing phase', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'DECLARE', id: 'E' });
      // Already verifying, another DECLARE should be ignored
      state = gameReducer(state, { type: 'DECLARE', id: 'A' });
      expect(state.declaredCardId).toBe('E');
    });
  });

  describe('REVEAL', () => {
    it('flips all cards face-up', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'DECLARE', id: 'E' });
      state = gameReducer(state, { type: 'REVEAL' });
      expect(state.cards.every((c) => c.faceUp)).toBe(true);
    });

    it('transitions to results phase', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'DECLARE', id: 'E' });
      state = gameReducer(state, { type: 'REVEAL' });
      expect(state.phase).toBe('results');
    });

    it('sets diagnosis (a win with sufficient comparisons)', () => {
      let state = createInitialState();
      // Add comparisons so it passes the premature-declaration gate
      for (let i = 0; i < 15; i++) {
        state = gameReducer(state, { type: 'COMPARE', left: 'E', right: 'D' });
      }
      state = gameReducer(state, { type: 'DECLARE', id: 'E' });
      state = gameReducer(state, { type: 'REVEAL' });
      expect(state.diagnosis).toBeTruthy();
      expect(state.diagnosis).toContain('Clean win');
    });

    it('is ignored if not in verifying phase', () => {
      const state = createInitialState();
      const next = gameReducer(state, { type: 'REVEAL' });
      expect(next.phase).toBe('playing');
    });

    it('is ignored if no card declared', () => {
      // Force verifying without declaration (shouldn't happen normally)
      let state = createInitialState();
      state = { ...state, phase: 'verifying', declaredCardId: null };
      const next = gameReducer(state, { type: 'REVEAL' });
      expect(next.phase).toBe('verifying');
    });
  });

  describe('RESET', () => {
    it('returns a fresh initial state', () => {
      let state = createInitialState();
      state = gameReducer(state, { type: 'COMPARE', left: 'A', right: 'B' });
      state = gameReducer(state, { type: 'DECLARE', id: 'E' });
      state = gameReducer(state, { type: 'REVEAL' });
      expect(state.phase).toBe('results');

      const next = gameReducer(state, { type: 'RESET' });
      expect(next.comparisonCount).toBe(0);
      expect(next.phase).toBe('playing');
      expect(next.cards.every((c) => !c.faceUp)).toBe(true);
      expect(next.selectedCardId).toBeNull();
      expect(next.declaredCardId).toBeNull();
      expect(next.diagnosis).toBeNull();
    });
  });
});
