import {
  MEDIAN_RANK,
  generateDiagnosis,
  getSortedRanks,
  type CardId,
  type GameState,
} from '../game'
import styles from './ResultsModal.module.css'

interface ResultsModalProps {
  state: GameState
  onPlayAgain: () => void
}

export function ResultsModal({ state, onPlayAgain }: ResultsModalProps) {
  const declaredId = state.declaredCardId as CardId
  const { sorted, ranks } = getSortedRanks(state.dataCards)
  const declaredRank = ranks[declaredId]
  const declaredCard = state.dataCards.find((c) => c.id === declaredId)!
  const won = declaredRank === MEDIAN_RANK
  const median = sorted[MEDIAN_RANK - 1]
  const smallerCount = declaredRank - 1
  const largerCount = sorted.length - declaredRank
  const diagnosis = generateDiagnosis(state, declaredId)

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Round results"
    >
      <div className={styles.modal}>
        <h2 className={`${styles.outcome} ${won ? styles.win : styles.loss}`}>
          {won ? 'You win!' : 'Not the median'}
        </h2>

        <p>
          You chose card <strong>{declaredId}</strong> (value{' '}
          {declaredCard.value}), which was rank <strong>{declaredRank}</strong>{' '}
          of {sorted.length} — {smallerCount} smaller, {largerCount} larger.
        </p>

        <p>
          The median was card <strong>{median.id}</strong> (value{' '}
          {median.value}).
        </p>

        <div className={styles.sortedRow} aria-label="Full sorted order">
          {sorted.map((c) => (
            <span
              key={c.id}
              className={`${styles.sortedCard} ${
                c.id === median.id ? styles.medianCard : ''
              } ${c.id === declaredId ? styles.declaredCard : ''}`}
            >
              <span className={styles.sortedLetter}>{c.id}</span>
              <span className={styles.sortedValue}>{c.value}</span>
            </span>
          ))}
        </div>

        <p className={styles.count}>
          Comparisons used: <strong>{state.comparisonCount}</strong>
        </p>
        <p className={styles.theory}>
          The median is solvable in as few as ~17 comparisons. A full sort
          requires at least 26.
        </p>

        <p className={styles.diagnosis}>{diagnosis}</p>

        <button type="button" className={styles.again} onClick={onPlayAgain}>
          Play again
        </button>
      </div>
    </div>
  )
}
