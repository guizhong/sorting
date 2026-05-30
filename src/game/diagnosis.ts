import { detectChainContradictions } from './chain'
import { getSortedRanks } from './ranking'
import { MEDIAN_RANK, type CardId, type GameState } from './types'

/** Below this comparison count, the median cannot be determined (GDD §4.5). */
const PREMATURE_THRESHOLD = 12
/** Above this, the player is close to a full sort (GDD §4.5 / §7.2). */
const EXPENSIVE_THRESHOLD = 28

/**
 * Produce the single most pedagogically useful sentence about the round
 * (GDD §4.5). Returns runtime-substituted strings — real letters, values, and
 * counts — not the placeholder templates from the GDD.
 *
 * Precedence: win outcomes first; then for losses, contradiction and premature
 * checks gate the rank-based diagnoses.
 */
export function generateDiagnosis(
  state: GameState,
  chosenCardId: CardId,
): string {
  const { dataCards, comparisonCount, comparisonHistory, chainTrack, piles } =
    state
  const { ranks } = getSortedRanks(dataCards)
  const chosenRank = ranks[chosenCardId]
  const chosenValue = dataCards.find((c) => c.id === chosenCardId)?.value
  const won = chosenRank === MEDIAN_RANK
  const cmp = comparisonCount

  // --- Win outcomes ---------------------------------------------------------
  if (won && cmp > EXPENSIVE_THRESHOLD) {
    return `Correct, but you used ${cmp} comparisons — close to a full sort. The median can be isolated without fully ordering both halves.`
  }
  if (won) {
    return `Clean win: you correctly placed 5 cards on each side of your declared median (${chosenCardId}) in ${cmp} comparisons.`
  }

  // --- Loss: contradiction gates everything else ----------------------------
  const contradictions = detectChainContradictions(
    chainTrack,
    comparisonHistory,
  )
  if (contradictions.length > 0) {
    const { trackLeft, trackRight } = contradictions[0]
    return `Your Chain Track contradicted your own comparisons: you placed ${trackLeft} to the left of ${trackRight} (smaller), but the Oracle's answers prove ${trackRight} is smaller than ${trackLeft}. The Oracle never lied; your track did.`
  }

  // --- Loss: not enough information to have known ---------------------------
  if (cmp < PREMATURE_THRESHOLD) {
    return `You declared with only ${cmp} comparisons. The median cannot be determined from this little information — at minimum ${PREMATURE_THRESHOLD} carefully chosen comparisons are needed to rule out enough candidates (the optimal algorithm uses ~17; see §4.3).`
  }

  // --- Loss: rank-based diagnoses -------------------------------------------
  if (Math.abs(chosenRank - MEDIAN_RANK) === 1) {
    return `So close — card ${chosenCardId} (value ${chosenValue}) was rank ${chosenRank} of 11, right beside the median at rank ${MEDIAN_RANK}. One more comparison between the two boundary candidates would have resolved it.`
  }

  if (chosenRank < MEDIAN_RANK) {
    // The 5 cards strictly smaller than the true median are ranks 1..5.
    const trueSmaller = Object.keys(ranks).filter(
      (id) => ranks[id as CardId] < MEDIAN_RANK,
    ) as CardId[]
    const placedSmaller = trueSmaller.filter(
      (id) => piles[id] === 'smaller',
    ).length
    return `You declared from the lower half (card ${chosenCardId} was rank ${chosenRank} of 11). Of the 5 cards smaller than the true median, you placed only ${placedSmaller} in the SMALLER pile — your comparisons didn't reach the boundary.`
  }

  // chosenRank > MEDIAN_RANK
  const trueLarger = Object.keys(ranks).filter(
    (id) => ranks[id as CardId] > MEDIAN_RANK,
  ) as CardId[]
  const placedLarger = trueLarger.filter((id) => piles[id] === 'larger').length
  return `You declared from the upper half (card ${chosenCardId} was rank ${chosenRank} of 11). Of the 5 cards larger than the true median, you placed only ${placedLarger} in the LARGER pile — your comparisons didn't reach the boundary.`
}
