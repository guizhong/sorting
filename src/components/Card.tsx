import { type CardId, type DataCard } from '../game/types';
import styles from './Card.module.css';

interface CardProps {
  card: DataCard;
  isSelected: boolean;
  isInPile: boolean;
  /** Only relevant when faceUp=true */
  onSelect?: (id: CardId) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: CardId) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: () => void;
}

export function Card({
  card,
  isSelected,
  isInPile,
  onSelect,
  draggable = false,
  onDragStart,
  onDragEnd,
  onClick,
}: CardProps) {
  const classNames = [
    styles.card,
    card.faceUp ? styles.faceUp : styles.faceDown,
    isSelected ? styles.selected : '',
    isInPile ? styles.inPile : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (onClick) onClick();
    else if (onSelect) onSelect(card.id);
  };

  return (
    <div
      className={classNames}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, card.id)}
      onDragEnd={(e) => onDragEnd?.(e)}
      role="button"
      tabIndex={0}
      aria-label={
        card.faceUp
          ? `Card ${card.id}, value ${card.value}`
          : `Card ${card.id}, face down`
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      <div className={styles.cardContent}>
        <span className={styles.letter}>{card.id}</span>
        {card.faceUp && (
          <span className={styles.value}>{card.value}</span>
        )}
      </div>
    </div>
  );
}