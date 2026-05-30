import type { CardId } from '../game/types';
import styles from './Controls.module.css';

interface ControlsProps {
  selectedCardId: CardId | null;
  comparisonCount: number;
  onDeclare: (id: CardId) => void;
}

export function Controls({
  selectedCardId,
  comparisonCount,
  onDeclare,
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <span className={styles.counter}>
        Comparisons: {comparisonCount}
      </span>

      <button
        className={styles.declareButton}
        disabled={!selectedCardId}
        onClick={() => selectedCardId && onDeclare(selectedCardId)}
      >
        This is the Median
      </button>

      {!selectedCardId && (
        <span className={styles.hint}>
          Select a card to declare it as the median
        </span>
      )}
    </div>
  );
}