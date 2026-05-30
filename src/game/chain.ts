import type { CardId, Comparison } from './types'

export interface ChainContradiction {
  /** Token the player placed further left (asserted smaller). */
  trackLeft: CardId
  /** Token the player placed further right (asserted larger). */
  trackRight: CardId
}

/**
 * Build the transitive "<" closure from comparison history.
 * Edge smaller -> larger means "smaller < larger". reachable.get(u) is the set
 * of all v known to be strictly greater than u.
 */
function lessThanClosure(history: Comparison[]): Map<CardId, Set<CardId>> {
  const greater = new Map<CardId, Set<CardId>>()
  const ensure = (id: CardId): Set<CardId> => {
    let s = greater.get(id)
    if (!s) {
      s = new Set()
      greater.set(id, s)
    }
    return s
  }

  for (const { larger, smaller } of history) {
    ensure(smaller).add(larger)
    ensure(larger)
  }

  // Floyd–Warshall-style transitive closure over a small (<=11 node) graph.
  let changed = true
  while (changed) {
    changed = false
    for (const [u, directGreater] of greater) {
      for (const v of [...directGreater]) {
        for (const w of greater.get(v) ?? []) {
          if (!directGreater.has(w)) {
            directGreater.add(w)
            changed = true
          }
        }
      }
      void u
    }
  }

  return greater
}

/**
 * Detect contradictions between the player's Chain Track ordering and what the
 * Oracle actually established (GDD §4.5 "Chain contradiction").
 *
 * The track asserts, for any two placed tokens, that the left one is smaller.
 * If comparison history transitively proves the opposite, that's a contradiction.
 */
export function detectChainContradictions(
  chainTrack: (CardId | null)[],
  comparisonHistory: Comparison[],
): ChainContradiction[] {
  const placed: CardId[] = chainTrack.filter((c): c is CardId => c !== null)
  if (placed.length < 2) return []

  const greater = lessThanClosure(comparisonHistory)
  const contradictions: ChainContradiction[] = []

  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const left = placed[i] // player asserts left < right
      const right = placed[j]
      // History proves right < left  ⇒  left ∈ greater(right).
      if (greater.get(right)?.has(left)) {
        contradictions.push({ trackLeft: left, trackRight: right })
      }
    }
  }

  return contradictions
}
