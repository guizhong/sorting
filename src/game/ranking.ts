import type { CardId, DataCard } from './types';

/** The median is the 6th card in an 11-card 1-indexed sorted list (GDD §4.3). */
export const MEDIAN_RANK = 6;

export interface RankingResult {
  sorted: DataCard[];
  ranks: Record<CardId, number>;
}

/**
 * Returns the cards sorted ascending by value and a 1-indexed rank map.
 */
export function getSortedRanks(cards: DataCard[]): RankingResult {
  const sorted = [...cards].sort((a, b) => a.value - b.value);
  const ranks: Record<string, number> = {};
  sorted.forEach((card, idx) => {
    ranks[card.id] = idx + 1; // 1-indexed
  });
  return { sorted, ranks: ranks as Record<CardId, number> };
}

/**
 * Returns true if the chosen card is the median (rank 6 of 11).
 */
export function checkWin(cards: DataCard[], chosenId: CardId): boolean {
  const { ranks } = getSortedRanks(cards);
  return ranks[chosenId] === MEDIAN_RANK;
}
