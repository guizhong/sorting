import type { DataCard, Pile } from '../game'
import styles from './Card.module.css'

interface CardProps {
  card: DataCard
  onClick?: (id: DataCard['id']) => void
  selected?: boolean
  declared?: boolean
  pile?: Pile
  disabled?: boolean
}

export function Card({
  card,
  onClick,
  selected = false,
  declared = false,
  pile,
  disabled = false,
}: CardProps) {
  const classes = [
    styles.card,
    card.faceUp ? styles.faceUp : styles.faceDown,
    selected ? styles.selected : '',
    declared ? styles.declared : '',
    pile ? styles[pile] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || !onClick}
      aria-pressed={selected}
      aria-label={
        card.faceUp
          ? `Card ${card.id}, value ${card.value}`
          : `Card ${card.id}, face down`
      }
      onClick={onClick ? () => onClick(card.id) : undefined}
    >
      <span className={styles.letter}>{card.id}</span>
      {/* The value is only ever in the DOM when the card is face up (§4.3). */}
      {card.faceUp && <span className={styles.value}>{card.value}</span>}
      {declared && <span className={styles.badge}>median?</span>}
    </button>
  )
}
