import { describe, it, expect } from 'vitest';
import { getSortedRanks, checkWin, MEDIAN_RANK } from './ranking';
import { initialDataCards } from './deck';

describe('ranking', () => {
  const cards = initialDataCards();

  describe('getSortedRanks', () => {
    it('sorts cards by value ascending', () => {
      const { sorted } = getSortedRanks(cards);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].value).toBeGreaterThan(sorted[i - 1].value);
      }
    });

    it('returns 1-indexed ranks', () => {
      const { ranks } = getSortedRanks(cards);
      // Smallest value is 102 (card D)
      expect(ranks['D']).toBe(1);
      // Largest value is 999 (card C)
      expect(ranks['C']).toBe(11);
      // Median is 556 (card E), rank 6
      expect(ranks['E']).toBe(6);
    });

    it('has ranks for all 11 cards', () => {
      const { ranks } = getSortedRanks(cards);
      expect(Object.keys(ranks)).toHaveLength(11);
    });
  });

  describe('checkWin', () => {
    it('returns true for the median card E (rank 6)', () => {
      expect(checkWin(cards, 'E')).toBe(true);
    });

    it('returns false for card D (rank 1, smallest)', () => {
      expect(checkWin(cards, 'D')).toBe(false);
    });

    it('returns false for card C (rank 11, largest)', () => {
      expect(checkWin(cards, 'C')).toBe(false);
    });

    it('returns false for card F (rank 2)', () => {
      expect(checkWin(cards, 'F')).toBe(false);
    });

    it('returns false for card A (rank 10)', () => {
      expect(checkWin(cards, 'A')).toBe(false);
    });

    it('returns false for off-by-one cards', () => {
      // Rank 5: H (433), Rank 7: I (609)
      expect(checkWin(cards, 'H')).toBe(false);
      expect(checkWin(cards, 'I')).toBe(false);
    });
  });

  describe('MEDIAN_RANK', () => {
    it('is 6 for an 11-card deck', () => {
      expect(MEDIAN_RANK).toBe(6);
    });
  });
});
