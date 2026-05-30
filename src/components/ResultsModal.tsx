import type { DiagnosisResult } from '../game/diagnosis';
import styles from './ResultsModal.module.css';

interface ResultsModalProps {
  result: DiagnosisResult;
  onPlayAgain: () => void;
}

export function ResultsModal({ result, onPlayAgain }: ResultsModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={result.won ? styles.winTitle : styles.loseTitle}>
          {result.won ? '🎉 You Win!' : 'Not quite!'}
        </h2>

        {/* 1. Outcome already shown above */}

        {/* 2. Declared card's actual rank */}
        <p className={styles.stat}>
          You chose card <strong>{result.chosenCardId}</strong> (value{' '}
          {result.chosenValue}), which was{' '}
          <strong>rank {result.chosenRank} of 11</strong> —{' '}
          {result.smallerCount} cards smaller, {result.largerCount} larger.
        </p>

        {/* 3. True median */}
        <p className={styles.stat}>
          The true median was card <strong>{result.medianId}</strong> (value{' '}
          {result.medianValue}).
        </p>

        {/* 4. Full sorted order */}
        <div className={styles.sortedRow}>
          <span className={styles.sortedLabel}>Sorted order:</span>
          <div className={styles.sortedCards}>
            {result.sortedCards.map((c) => (
              <span
                key={c.id}
                className={`${styles.sortedCard} ${
                  c.id === result.medianId ? styles.medianCard : ''
                } ${c.id === result.chosenCardId ? styles.chosenCard : ''}`}
              >
                <span className={styles.sortedLetter}>{c.id}</span>
                <span className={styles.sortedValue}>{c.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 5 & 6. Comparisons used + theoretical minimum */}
        <p className={styles.stat}>
          Comparisons used: <strong>{result.comparisonCount}</strong>. The
          median is solvable in as few as ~17 comparisons. A full sort requires
          at least 26.
        </p>

        {/* 7. Diagnosis line */}
        <div
          className={`${styles.diagnosis} ${
            result.won ? styles.winDiagnosis : styles.loseDiagnosis
          }`}
        >
          {result.diagnosis}
        </div>

        <button className={styles.playAgain} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}