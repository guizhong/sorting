import { describe, it, expect } from 'vitest';
import { initialDataCards, SEED_VALUES } from './deck';
import { ALL_CARD_IDS } from './types';

describe('deck', () => {
  describe('initialDataCards', () => {
    it('returns 11 cards', () => {
      const cards = initialDataCards();
      expect(cards).toHaveLength(11);
    });

    it('all cards are face down', () => {
      const cards = initialDataCards();
      for (const c of cards) {
        expect(c.faceUp).toBe(false);
      }
    });

    it('has all letter IDs A-K', () => {
      const cards = initialDataCards();
      const ids = cards.map((c) => c.id).sort();
      expect(ids).toEqual([...ALL_CARD_IDS]);
    });

    it('matches the seed dataset from GDD §3.2', () => {
      const cards = initialDataCards();
      for (const c of cards) {
        expect(c.value).toBe(SEED_VALUES[c.id]);
      }
    });

    it('values are all unique', () => {
      const cards = initialDataCards();
      const values = cards.map((c) => c.value);
      expect(new Set(values).size).toBe(11);
    });
  });

  describe('SEED_VALUES', () => {
    it('median (6th sorted) is 556 / card E', () => {
      const entries = Object.entries(SEED_VALUES).sort(([, a], [, b]) => a - b);
      expect(entries[5][0]).toBe('E');
      expect(entries[5][1]).toBe(556);
    });

    it('sorted order matches GDD §3.2', () => {
      const sorted = Object.entries(SEED_VALUES)
        .sort(([, a], [, b]) => a - b)
        .map(([, val]) => val);
      expect(sorted).toEqual([102, 118, 204, 341, 433, 556, 609, 695, 781, 872, 999]);
    });
  });
});
