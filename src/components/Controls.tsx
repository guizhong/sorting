import type { Phase } from '../game'
import styles from './Controls.module.css'

interface ControlsProps {
  comparisonCount: number
  phase: Phase
  declareMode: boolean
  onToggleDeclareMode: () => void
}

export function Controls({
  comparisonCount,
  phase,
  declareMode,
  onToggleDeclareMode,
}: ControlsProps) {
  return (
    <section className={styles.controls} aria-label="Controls">
      <div className={styles.counter}>
        Comparisons: <strong>{comparisonCount}</strong>
      </div>

      {phase === 'playing' && (
        <button
          type="button"
          className={declareMode ? styles.declareActive : ''}
          onClick={onToggleDeclareMode}
        >
          {declareMode ? 'Cancel' : 'Declare the median…'}
        </button>
      )}

      {phase === 'playing' && declareMode && (
        <span className={styles.hint} role="status">
          Click the card you believe is the median — all cards flip and the
          round is scored.
        </span>
      )}
    </section>
  )
}
