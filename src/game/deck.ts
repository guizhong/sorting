import type { CardId, DataCard } from './types';
import { ALL_CARD_IDS } from './types';

/**
 * Fixed seed dataset per GDD §3.2.
 * Letters A-K map to these values in alphabetical order.
 */
export const SEED_VALUES: Record<CardId, number> = {
  A: 872,
  B: 341,
  C: 999,
  D: 102,
  E: 556,
  F: 204,
  G: 781,
  H: 433,
  I: 609,
  J: 118,
  K: 695,
};

/** Create the initial face-down DataCards from the seed dataset. */
export function initialDataCards(): DataCard[] {
  return ALL_CARD_IDS.map((id) => ({
    id,
    value: SEED_VALUES[id],
    faceUp: false,
  }));
}

/**
 * Create a deck of n cards with randomized values.
 * Returns n unique 3-digit values sorted to a given set of letters.
 * Reserved for V2.0 (variable deck sizes).
 */
export function makeDeck(size: number): DataCard[] {
  const letters = ALL_CARD_IDS.slice(0, size);
  // Generate unique random 3-digit values
  const pool = new Set<number>();
  while (pool.size < size) {
    pool.add(Math.floor(Math.random() * 900) + 100);
  }
  const values = [...pool].sort(() => Math.random() - 0.5);
  return letters.map((id, i) => ({
    id,
    value: values[i],
    faceUp: false,
  }));
}
