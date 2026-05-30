import type { CardId } from './types';
import { MEDIAN_RANK, getSortedRanks } from './ranking';
import { detectChainContradictions } from './chain';
import type { GameState } from './types';

/**
 * Generate the full diagnosis string per GDD §4.5.
 * Uses real substituted values, letters, and counts.
 */
export function generateDiagnosis(state: GameState, chosenId: CardId): string {
  const { sorted, ranks } = getSortedRanks(state.cards);
  const chosenRank = ranks[chosenId];
  const won = chosenRank === MEDIAN_RANK;

  // --- Gating checks (order matters per GDD §4.5) ---

  // 1. Chain contradiction check
  if (state.chainTrack.some((id) => id !== null)) {
    const contradictions = detectChainContradictions(
      state.chainTrack,
      state.comparisonHistory,
    );
    if (contradictions.length > 0) {
      const c = contradictions[0];
      return `Your Chain Track contained a contradiction: ${c.description} The Oracle never lied; your track did.`;
    }
  }

  // 2. Premature declaration (< 12 comparisons)
  if (state.comparisonCount < 12) {
    return `You declared with only ${state.comparisonCount} comparisons. The median cannot be determined from this little information — at minimum 12 carefully chosen comparisons are needed to rule out enough candidates (the optimal algorithm uses ~17).`;
  }

  // 3. Rank-based cases
  if (won) {
    if (state.comparisonCount <= 20) {
      return `Clean win! You correctly identified the median in ${state.comparisonCount} comparisons.`;
    }
    if (state.comparisonCount > 28) {
      return `Correct, but you used ${state.comparisonCount} comparisons — close to a full sort. The median can be isolated without fully ordering both halves.`;
    }
    return `Correct! You found the median in ${state.comparisonCount} comparisons.`;
  }

  // Loss cases
  const offset = Math.abs(chosenRank - MEDIAN_RANK);
  if (offset === 1) {
    const medianCard = sorted[MEDIAN_RANK - 1];
    return `So close! Your card was rank ${chosenRank} — just one away from the median (rank ${MEDIAN_RANK}, card ${medianCard.id}). One more comparison between the boundary candidates would have resolved it.`;
  }

  if (chosenRank < MEDIAN_RANK) {
    const placeInLarger = state.pileAssignments[chosenId] === 'larger' ? 'in the LARGER pile' : '(not assigned to a pile)';
    return `You declared from the lower half (card ${chosenId}, rank ${chosenRank} of 11). Your comparisons didn't reach the boundary — card ${chosenId} was ${placeInLarger}, and you hadn't identified all ${MEDIAN_RANK - 1} cards smaller than the true median.`;
  }

  // chosenRank > MEDIAN_RANK — declared from upper half
  const placeInSmaller = state.pileAssignments[chosenId] === 'smaller' ? 'in the SMALLER pile' : '(not assigned to a pile)';
  return `You declared from the upper half (card ${chosenId}, rank ${chosenRank} of 11). Your comparisons didn't reach the boundary — card ${chosenId} was ${placeInSmaller}, and you hadn't identified all ${11 - MEDIAN_RANK} cards larger than the true median.`;
}

/**
 * Build a human-readable result summary for the ResultsModal (§4.5 items 1-7).
 */
export interface DiagnosisResult {
  won: boolean;
  chosenCardId: CardId;
  chosenValue: number;
  chosenRank: number;
  smallerCount: number;
  largerCount: number;
  medianId: CardId;
  medianValue: number;
  sortedCards: { id: CardId; value: number }[];
  comparisonCount: number;
  diagnosis: string;
}

export function buildResult(state: GameState): DiagnosisResult {
  const chosenId = state.declaredCardId!;
  const { sorted, ranks } = getSortedRanks(state.cards);
  const chosenRank = ranks[chosenId];
  const won = chosenRank === MEDIAN_RANK;
  const medianCard = sorted[MEDIAN_RANK - 1];

  return {
    won,
    chosenCardId: chosenId,
    chosenValue: state.cards.find((c) => c.id === chosenId)!.value,
    chosenRank,
    smallerCount: Math.max(0, chosenRank - 1),
    largerCount: Math.max(0, 11 - chosenRank),
    medianId: medianCard.id,
    medianValue: medianCard.value,
    sortedCards: sorted.map((c) => ({ id: c.id, value: c.value })),
    comparisonCount: state.comparisonCount,
    diagnosis: state.diagnosis!,
  };
}