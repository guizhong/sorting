import type { Comparison, DataCard } from './types'

/**
 * The Oracle. Answers a single binary comparison and nothing else.
 *
 * Pure and side-effect free: it does NOT increment the comparison counter or
 * touch history — the reducer owns that (GDD §7.2). This keeps the core mechanic
 * (§4.3) honest: the only value-derived output is which id is larger.
 */
export function compareCards(a: DataCard, b: DataCard): Comparison {
  return a.value > b.value
    ? { larger: a.id, smaller: b.id }
    : { larger: b.id, smaller: a.id }
}
