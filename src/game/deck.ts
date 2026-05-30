import { CARD_IDS, DECK_SIZE, type DataCard } from './types'

/**
 * The fixed seed dataset from GDD §3.2 / §7.2.
 * Sorted: 102, 118, 204, 341, 433, 556, 609, 695, 781, 872, 999.
 * Median (6th of 11) is 556 = card E.
 */
export const initialDataCards: DataCard[] = [
  { id: 'A', value: 872, faceUp: false },
  { id: 'B', value: 341, faceUp: false },
  { id: 'C', value: 999, faceUp: false },
  { id: 'D', value: 102, faceUp: false },
  { id: 'E', value: 556, faceUp: false },
  { id: 'F', value: 204, faceUp: false },
  { id: 'G', value: 781, faceUp: false },
  { id: 'H', value: 433, faceUp: false },
  { id: 'I', value: 609, faceUp: false },
  { id: 'J', value: 118, faceUp: false },
  { id: 'K', value: 695, faceUp: false },
]

/** A fresh non-zero 32-bit seed for a newly shuffled deck. */
export function randomSeed(): number {
  // Avoid 0, which would otherwise collide with the unseeded fixed deck path.
  return (Math.floor(Math.random() * 0xffffffff) + 1) >>> 0
}

/** Deterministic PRNG (mulberry32) so seeded decks are reproducible in tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Build a fresh deck of unique 3-digit values assigned to letters A–K.
 * With no seed, returns a clone of the fixed dataset (deterministic, matches GDD).
 * With a seed, generates a reproducible random set of unique values.
 */
export function makeDeck(seed?: number): DataCard[] {
  if (seed === undefined) {
    return initialDataCards.map((c) => ({ ...c }))
  }

  const rng = mulberry32(seed)
  const values = new Set<number>()
  while (values.size < DECK_SIZE) {
    // unique 3-digit values in [100, 999]
    values.add(100 + Math.floor(rng() * 900))
  }

  return CARD_IDS.map((id, i) => ({
    id,
    value: [...values][i],
    faceUp: false,
  }))
}
