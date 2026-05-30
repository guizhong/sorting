import { useState } from 'react';
import { Card } from './Card';
import type { CardId, DataCard, PileType } from '../game/types';
import styles from './Pile.module.css';

interface PileProps {
  type: PileType;
  cards: DataCard[];
  assignedIds: CardId[];
  onPlace: (id: CardId, pile: PileType) => void;
}

export function Pile({ type, cards, assignedIds, onPlace }: PileProps) {
  const [dragOver, setDragOver] = useState(false);
  const label = type === 'larger' ? 'LARGER' : 'SMALLER';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData('cardId') as CardId;
    if (id) onPlace(id, type);
  };

  const pileCards = cards.filter((c) => assignedIds.includes(c.id));

  return (
    <div
      className={`${styles.pile} ${styles[type]} ${dragOver ? styles.dragOver : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className={styles.pileLabel}>{label}</div>
      <div className={styles.pileCards}>
        {pileCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={false}
            isInPile
          />
        ))}
      </div>
      {pileCards.length === 0 && (
        <div className={styles.emptyHint}>
          Drop {type} cards here
        </div>
      )}
    </div>
  );
}