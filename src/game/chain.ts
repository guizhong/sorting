import type { CardId, Comparison } from './types';

export interface Contradiction {
  /** The card that ends up to the right in one path but left in another */
  x: CardId;
  /** The card that ends up to the left in one path but right in another */
  y: CardId;
  description: string;
}

/**
 * Build a directed adjacency map from comparison history: smaller → larger.
 */
function buildGraph(history: Comparison[]): Map<CardId, Set<CardId>> {
  const graph = new Map<CardId, Set<CardId>>();
  for (const { smaller, larger } of history) {
    if (!graph.has(smaller)) graph.set(smaller, new Set());
    graph.get(smaller)!.add(larger);
  }
  return graph;
}

/**
 * Returns true if there's a directed path from `from` to `to` in the graph.
 * Uses DFS with visited set to prevent cycles.
 */
function hasPath(
  graph: Map<CardId, Set<CardId>>,
  from: CardId,
  to: CardId,
  visited: Set<CardId> = new Set(),
): boolean {
  if (from === to) return true;
  visited.add(from);
  const neighbors = graph.get(from);
  if (!neighbors) return false;
  for (const next of neighbors) {
    if (!visited.has(next) && hasPath(graph, next, to, visited)) {
      return true;
    }
  }
  return false;
}

/**
 * Detect contradictions between the player's chain track ordering and the
 * comparison history. The track runs smallest (slot 0) to largest (slot 10).
 * For every pair of non-null slots (i < j), we check whether history
 * transitively implies track[j] < track[i] — a contradiction.
 */
export function detectChainContradictions(
  chainTrack: (CardId | null)[],
  history: Comparison[],
): Contradiction[] {
  const graph = buildGraph(history);
  const filled: [number, CardId][] = [];
  chainTrack.forEach((id, idx) => {
    if (id !== null) filled.push([idx, id]);
  });

  const contradictions: Contradiction[] = [];
  for (let a = 0; a < filled.length; a++) {
    for (let b = a + 1; b < filled.length; b++) {
      const [slotI, idI] = filled[a]; // leftmost (smaller) in track
      const [slotJ, idJ] = filled[b]; // rightmost (larger) in track
      // slotI < slotJ means the player asserts idI < idJ.
      // If history transitively says idJ < idI, that's a contradiction.
      if (hasPath(graph, idJ, idI)) {
        contradictions.push({
          x: idJ,
          y: idI,
          description: `Your Chain Track placed ${idI} (slot ${slotI + 1}) left of ${idJ} (slot ${slotJ + 1}), but comparisons show ${idJ} < ${idI}.`,
        });
      }
    }
  }
  return contradictions;
}
