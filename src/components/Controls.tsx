import type { CardId, Phase } from '../game'
import styles from './Controls.module.css'

interface ControlsProps {
  comparisonCount: number
  phase: Phase
  declareMode: boolean
  declaredId: CardId | null
  onToggleDeclareMode: () => void
  onReveal: () => void
}

export function Controls({
  comparisonCount,
  phase,
  declareMode,
  declaredId,
  onToggleDeclareMode,
  onReveal,
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
          Click the card you believe is the median.
        </span>
      )}

      {phase === 'verifying' && (
        <div className={styles.verify} role="status">
          <span>
            You declared card <strong>{declaredId}</strong>.
          </span>
          <button type="button" className={styles.reveal} onClick={onReveal}>
            Reveal &amp; verify
          </button>
        </div>
      )}
    </section>
  )
}
