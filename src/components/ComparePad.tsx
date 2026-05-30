import { useState, useCallback } from 'react';
import { Card } from './Card';
import type { CardId, DataCard, Comparison } from '../game/types';
import styles from './ComparePad.module.css';

interface ComparePadProps {
  cards: DataCard[];
  leftCard: CardId | null;
  rightCard: CardId | null;
  lastResult: Comparison | null;
  onSetLeft: (id: CardId | null) => void;
  onSetRight: (id: CardId | null) => void;
  onCompare: (left: CardId, right: CardId) => void;
}

export function ComparePad({
  cards,
  leftCard,
  rightCard,
  lastResult,
  onSetLeft,
  onSetRight,
  onCompare,
}: ComparePadProps) {
  const [dragOverLeft, setDragOverLeft] = useState(false);
  const [dragOverRight, setDragOverRight] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent, slot: 'L' | 'R') => {
      e.preventDefault();
      const id = e.dataTransfer.getData('cardId') as CardId;
      if (!id) return;
      if (slot === 'L') onSetLeft(id);
      else onSetRight(id);
      setDragOverLeft(false);
      setDragOverRight(false);
    },
    [onSetLeft, onSetRight],
  );

  const leftCardData = leftCard ? cards.find((c) => c.id === leftCard) : null;
  const rightCardData = rightCard ? cards.find((c) => c.id === rightCard) : null;
  const canCompare = leftCard !== null && rightCard !== null;

  const resultText = lastResult
    ? `"${lastResult.larger}" is larger`
    : null;

  return (
    <div className={styles.comparePad}>
      <div
        className={`${styles.slot} ${leftCard ? styles.slotFilled : ''} ${dragOverLeft ? styles.dragOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverLeft(true);
        }}
        onDragLeave={() => setDragOverLeft(false)}
        onDrop={(e) => handleDrop(e, 'L')}
      >
        <span className={styles.label}>L</span>
        {leftCardData ? (
          <Card
            card={leftCardData}
            isSelected={false}
            isInPile={false}
            onClick={() => onSetLeft(null)}
          />
        ) : (
          'Drop card'
        )}
      </div>

      <button
        className={styles.compareButton}
        disabled={!canCompare}
        onClick={() => canCompare && onCompare(leftCard!, rightCard!)}
      >
        Compare
      </button>

      <div
        className={`${styles.slot} ${rightCard ? styles.slotFilled : ''} ${dragOverRight ? styles.dragOver : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverRight(true);
        }}
        onDragLeave={() => setDragOverRight(false)}
        onDrop={(e) => handleDrop(e, 'R')}
      >
        <span className={styles.label}>R</span>
        {rightCardData ? (
          <Card
            card={rightCardData}
            isSelected={false}
            isInPile={false}
            onClick={() => onSetRight(null)}
          />
        ) : (
          'Drop card'
        )}
      </div>

      {resultText && <div className={styles.result}>{resultText}</div>}
    </div>
  );
}