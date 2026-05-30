import { describe, it, expect } from 'vitest';
import { generateDiagnosis, buildResult } from './diagnosis';
import { createInitialState } from './reducer';
import type { GameState, CardId } from './types';

/**
 * Build a minimal state for testing specific diagnosis branches.
 */
function makeState(overrides: Partial<GameState> & { cards?: GameState['cards'] }): GameState {
  const base = createInitialState();
  return { ...base, ...overrides };
}

describe('generateDiagnosis', () => {
  const cards = createInitialState().cards;

  it('clean win (≤20 comparisons, correct median)', () => {
    const state = makeState({
      cards,
      comparisonCount: 17,
      comparisonHistory: [{ larger: 'E', smaller: 'D' }],
      chainTrack: new Array(11).fill(null),
    });
    const diag = generateDiagnosis(state, 'E');
    expect(diag).toContain('Clean win');
    expect(diag).toContain('17 comparisons');
  });

  it('win but expensive (>28 comparisons)', () => {
    const state = makeState({
      cards,
      comparisonCount: 31,
      comparisonHistory: [{ larger: 'E', smaller: 'D' }],
      chainTrack: new Array(11).fill(null),
    });
    const diag = generateDiagnosis(state, 'E');
    expect(diag).toContain('31 comparisons');
    expect(diag).toContain('close to a full sort');
  });

  it('win (21-28 comparisons)', () => {
    const state = makeState({
      cards,
      comparisonCount: 24,
      comparisonHistory: [{ larger: 'E', smaller: 'D' }],
      chainTrack: new Array(11).fill(null),
    });
    const diag = generateDiagnosis(state, 'E');
    expect(diag).toContain('Correct!');
  });

  it('off-by-one miss (rank 5)', () => {
    // H has value 433, rank 5
    const state = makeState({
      cards,
      comparisonCount: 20,
      comparisonHistory: [{ larger: 'H', smaller: 'D' }],
      chainTrack: new Array(11).fill(null),
    });
    const diag = generateDiagnosis(state, 'H');
    expect(diag).toContain('rank 5');
    expect(diag).toContain('just one away');
    expect(diag).toContain('card E');
  });

  it('off-by-one miss (rank 7)', () => {
    // I has value 609, rank 7
    const state = makeState({
      cards,
      comparisonCount: 20,
      comparisonHistory: [{ larger: 'C', smaller: 'I' }],
      chainTrack: new Array(11).fill(null),
    });
    const diag = generateDiagnosis(state, 'I');
    expect(diag).toContain('rank 7');
    expect(diag).toContain('just one away');
  });

  it('wrong half — lower half', () => {
    // D has value 102, rank 1 (lower half)
    const state = makeState({
      cards,
      comparisonCount: 15,
      comparisonHistory: [],
      chainTrack: new Array(11).fill(null),
      pileAssignments: { ...createInitialState().pileAssignments, D: 'larger' },
    });
    const diag = generateDiagnosis(state, 'D');
    expect(diag).toContain('lower half');
    expect(diag).toContain('LARGER pile');
  });

  it('wrong half — upper half', () => {
    // C has value 999, rank 11 (upper half)
    const state = makeState({
      cards,
      comparisonCount: 15,
      comparisonHistory: [],
      chainTrack: new Array(11).fill(null),
      pileAssignments: { ...createInitialState().pileAssignments, C: 'smaller' },
    });
    const diag = generateDiagnosis(state, 'C');
    expect(diag).toContain('upper half');
    expect(diag).toContain('SMALLER pile');
  });

  it('premature declaration (<12 comparisons)', () => {
    const state = makeState({
      cards,
      comparisonCount: 8,
      comparisonHistory: [],
      chainTrack: new Array(11).fill(null),
    });
    const diag = generateDiagnosis(state, 'E');
    expect(diag).toContain('8 comparisons');
    expect(diag).toContain('cannot be determined');
  });

  it('chain contradiction detected', () => {
    // Track has F at slot 0 and D at slot 1, but history says D < F
    const track: (CardId | null)[] = ['F', 'D', null, null, null, null, null, null, null, null, null];
    const state = makeState({
      cards,
      comparisonCount: 15,
      comparisonHistory: [{ larger: 'F', smaller: 'D' }], // D < F, so track placing F before D is wrong
      chainTrack: track,
    });
    const diag = generateDiagnosis(state, 'E');
    expect(diag).toContain('contradiction');
    expect(diag).toContain('Oracle never lied');
  });

  it('contradiction gates before rank-based checks', () => {
    // Even with <12 comparisons, contradiction should fire first
    const track: (CardId | null)[] = ['B', 'A', null, null, null, null, null, null, null, null, null];
    const state = makeState({
      cards,
      comparisonCount: 8,
      comparisonHistory: [{ larger: 'B', smaller: 'A' }], // A < B
      chainTrack: track,
    });
    const diag = generateDiagnosis(state, 'E');
    // A < B in history; track places B left of A → contradiction
    expect(diag).toContain('contradiction');
  });

  it('premature declaration gates when no contradiction', () => {
    const state = makeState({
      cards,
      comparisonCount: 5,
      comparisonHistory: [],
      chainTrack: new Array(11).fill(null),
    });
    const diag = generateDiagnosis(state, 'E');
    expect(diag).toContain('5 comparisons');
    expect(diag).toContain('cannot be determined');
  });
});

describe('buildResult', () => {
  it('builds a full result for a winning round', () => {
    const state = makeState({
      cards: createInitialState().cards,
      declaredCardId: 'E' as CardId,
      comparisonCount: 17,
      diagnosis: 'Clean win!',
      phase: 'results',
    });
    const result = buildResult(state);
    expect(result.won).toBe(true);
    expect(result.chosenCardId).toBe('E');
    expect(result.chosenValue).toBe(556);
    expect(result.chosenRank).toBe(6);
    expect(result.smallerCount).toBe(5);
    expect(result.largerCount).toBe(5);
    expect(result.medianId).toBe('E');
    expect(result.medianValue).toBe(556);
    expect(result.sortedCards).toHaveLength(11);
    expect(result.comparisonCount).toBe(17);
    expect(result.diagnosis).toBe('Clean win!');
  });
});
