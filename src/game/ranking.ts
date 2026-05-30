import { MEDIAN_RANK, type CardId, type DataCard } from './types'

export interface RankInfo {
  /** Cards sorted ascending by value (smallest first). */
  sorted: DataCard[]
  /** 1-indexed rank for each card id. */
  ranks: Record<CardId, number>
}

export function getSortedRanks(dataCards: DataCard[]): RankInfo {
  const sorted = [...dataCards].sort((a, b) => a.value - b.value)
  const ranks = {} as Record<CardId, number>
  sorted.forEach((card, idx) => {
    ranks[card.id] = idx + 1 // 1-indexed
  })
  return { sorted, ranks }
}

/** True iff the chosen card is the true median (rank 6 of 11). */
export function checkWin(dataCards: DataCard[], chosenCardId: CardId): boolean {
  const { ranks } = getSortedRanks(dataCards)
  return ranks[chosenCardId] === MEDIAN_RANK
}

/** The card whose rank is the median. */
export function getMedianCard(dataCards: DataCard[]): DataCard {
  const { sorted } = getSortedRanks(dataCards)
  return sorted[MEDIAN_RANK - 1]
}
