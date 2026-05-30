import { describe, it, expect } from 'vitest';
import { detectChainContradictions } from './chain';
import type { CardId, Comparison } from './types';

describe('detectChainContradictions', () => {
  it('returns empty for a track consistent with history', () => {
    const track: (CardId | null)[] = [
      'D', null, 'F', 'B', 'H', 'E', 'I', 'K', 'G', 'A', 'C',
    ];
    // History shows D < F, F < B, B < H, etc. — all consistent
    const history: Comparison[] = [
      { larger: 'F', smaller: 'D' },
      { larger: 'B', smaller: 'F' },
      { larger: 'H', smaller: 'B' },
    ];
    const result = detectChainContradictions(track, history);
    expect(result).toHaveLength(0);
  });

  it('detects a direct contradiction', () => {
    // Track says D < F (D at slot 0, F at slot 1), but history says D > F (F < D)
    const track: (CardId | null)[] = ['D', 'F', null, null, null, null, null, null, null, null, null];
    const history: Comparison[] = [
      { larger: 'D', smaller: 'F' }, // D > F, meaning F < D
    ];
    const result = detectChainContradictions(track, history);
    expect(result).toHaveLength(1);
    // Track placed D (slot 1) left of F (slot 2), but comparisons show F < D
    // The contradiction names: x=the one the history says is smaller (F), y=the one the track says is smaller (D)
    expect(result[0].x).toBe('F');
    expect(result[0].y).toBe('D');
  });

  it('detects transitive contradiction', () => {
    // Track says A < B < C
    // History says B < A and C < B → transitively C < A
    // Track slot 0=A, 2=C → asserts A < C, but C < A transitively
    const track: (CardId | null)[] = ['A', 'B', 'C', null, null, null, null, null, null, null, null];
    const history: Comparison[] = [
      { larger: 'A', smaller: 'B' }, // B < A
      { larger: 'B', smaller: 'C' }, // C < B
    ];
    const result = detectChainContradictions(track, history);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty history', () => {
    const track: (CardId | null)[] = ['A', 'B', null, null, null, null, null, null, null, null, null];
    const result = detectChainContradictions(track, []);
    expect(result).toHaveLength(0);
  });

  it('handles empty track (all nulls)', () => {
    const track: (CardId | null)[] = new Array(11).fill(null);
    const history: Comparison[] = [{ larger: 'A', smaller: 'B' }];
    const result = detectChainContradictions(track, history);
    expect(result).toHaveLength(0);
  });

  it('handles single card in track', () => {
    const track: (CardId | null)[] = [null, null, 'A', null, null, null, null, null, null, null, null];
    const history: Comparison[] = [{ larger: 'A', smaller: 'B' }];
    const result = detectChainContradictions(track, history);
    expect(result).toHaveLength(0);
  });

  it('does not flag non-contradictory adjacent pairs', () => {
    const track: (CardId | null)[] = ['D', 'E', null, null, null, null, null, null, null, null, null];
    const history: Comparison[] = [
      { larger: 'E', smaller: 'D' }, // D < E, consistent
    ];
    const result = detectChainContradictions(track, history);
    expect(result).toHaveLength(0);
  });
});
