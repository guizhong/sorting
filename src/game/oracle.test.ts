import { describe, it, expect } from 'vitest';
import { compareCards } from './oracle';
import type { DataCard } from './types';

function card(id: string, value: number): DataCard {
  return { id, value, faceUp: false } as DataCard;
}

describe('compareCards', () => {
  it('returns larger/smaller correctly when left > right', () => {
    const result = compareCards(card('A', 500), card('B', 200));
    expect(result.larger).toBe('A');
    expect(result.smaller).toBe('B');
  });

  it('returns larger/smaller correctly when right > left', () => {
    const result = compareCards(card('A', 100), card('B', 900));
    expect(result.larger).toBe('B');
    expect(result.smaller).toBe('A');
  });

  it('returns right as larger when left === right (should not happen with unique values)', () => {
    const result = compareCards(card('A', 500), card('B', 500));
    expect(result.larger).toBe('B');
    expect(result.smaller).toBe('A');
  });

  it('is deterministic', () => {
    const a = card('C', 555);
    const b = card('D', 444);
    const r1 = compareCards(a, b);
    const r2 = compareCards(a, b);
    expect(r1).toEqual(r2);
  });
});
