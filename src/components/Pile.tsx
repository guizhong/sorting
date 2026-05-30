import type { CardId, Pile as PileType } from '../game'
import styles from './Pile.module.css'

interface PileProps {
  kind: PileType
  cardIds: CardId[]
}

const LABELS: Record<PileType, string> = {
  larger: 'LARGER',
  smaller: 'SMALLER',
}

export function Pile({ kind, cardIds }: PileProps) {
  return (
    <section className={`${styles.pile} ${styles[kind]}`} aria-label={`${LABELS[kind]} pile`}>
      <h2 className={styles.heading}>{LABELS[kind]}</h2>
      <div className={styles.tokens}>
        {cardIds.length === 0 && <span className={styles.empty}>empty</span>}
        {cardIds.map((id) => (
          <span key={id} className={styles.token}>
            {id}
          </span>
        ))}
      </div>
    </section>
  )
}
