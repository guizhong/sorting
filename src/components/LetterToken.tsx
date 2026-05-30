import type { CardId } from '../game'
import styles from './LetterToken.module.css'

interface LetterTokenProps {
  id: CardId
  selected?: boolean
  onClick: (id: CardId) => void
}

export function LetterToken({ id, selected = false, onClick }: LetterTokenProps) {
  return (
    <button
      type="button"
      className={`${styles.token} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      aria-label={`Letter token ${id}`}
      onClick={() => onClick(id)}
    >
      {id}
    </button>
  )
}
