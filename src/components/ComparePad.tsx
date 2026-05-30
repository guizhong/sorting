import type { CardId, Comparison } from '../game'
import styles from './ComparePad.module.css'

interface ComparePadProps {
  left: CardId | null
  right: CardId | null
  /** Result of the most recent comparison for the cards currently in the pad. */
  result: Comparison | null
  onCompare: () => void
  onPlace: (id: CardId, pile: 'larger' | 'smaller') => void
  onClear: () => void
}

export function ComparePad({
  left,
  right,
  result,
  onCompare,
  onPlace,
  onClear,
}: ComparePadProps) {
  const ready = left !== null && right !== null

  return (
    <section className={styles.pad} aria-label="Compare pad">
      <h2 className={styles.heading}>Compare</h2>
      <div className={styles.slots}>
        <div className={styles.slot} data-filled={left !== null}>
          <span className={styles.slotLabel}>L</span>
          <span className={styles.slotCard}>{left ?? '—'}</span>
        </div>
        <div className={styles.slot} data-filled={right !== null}>
          <span className={styles.slotLabel}>R</span>
          <span className={styles.slotCard}>{right ?? '—'}</span>
        </div>
      </div>

      {!result && (
        <button
          type="button"
          className={styles.compareBtn}
          disabled={!ready}
          onClick={onCompare}
        >
          Which is larger?
        </button>
      )}

      {result && (
        <div className={styles.result} role="status">
          <p className={styles.resultText}>
            <strong>{result.larger}</strong> is larger than{' '}
            <strong>{result.smaller}</strong>
          </p>
          <div className={styles.placeRow}>
            <button
              type="button"
              onClick={() => onPlace(result.larger, 'larger')}
            >
              {result.larger} → LARGER
            </button>
            <button
              type="button"
              onClick={() => onPlace(result.smaller, 'smaller')}
            >
              {result.smaller} → SMALLER
            </button>
          </div>
          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Clear pad
          </button>
        </div>
      )}

      {!result && ready && (
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          Clear pad
        </button>
      )}
    </section>
  )
}
