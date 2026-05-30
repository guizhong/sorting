import { CARD_IDS, type CardId } from '../game'
import { LetterToken } from './LetterToken'
import styles from './ChainTrack.module.css'

interface ChainTrackProps {
  chainTrack: (CardId | null)[]
  selectedToken: CardId | null
  /** Select a token from the holding area (or deselect). */
  onSelectToken: (id: CardId | null) => void
  /** Place the currently-selected token into a slot. */
  onPlaceSlot: (slot: number) => void
  /** Remove a placed token back to the holding area. */
  onRemoveToken: (id: CardId) => void
}

export function ChainTrack({
  chainTrack,
  selectedToken,
  onSelectToken,
  onPlaceSlot,
  onRemoveToken,
}: ChainTrackProps) {
  const placed = new Set(chainTrack.filter((c): c is CardId => c !== null))
  const holding = CARD_IDS.filter((id) => !placed.has(id))

  return (
    <section className={styles.wrap} aria-label="Chain track">
      <h2 className={styles.heading}>Chain Track — smallest ◂ ▸ largest</h2>

      <ol className={styles.track}>
        {chainTrack.map((occupant, slot) => (
          <li key={slot} className={styles.slot}>
            {occupant ? (
              <button
                type="button"
                className={styles.placed}
                aria-label={`Slot ${slot + 1}, token ${occupant}. Click to remove.`}
                onClick={() => onRemoveToken(occupant)}
              >
                {occupant}
              </button>
            ) : (
              <button
                type="button"
                className={styles.emptySlot}
                aria-label={`Slot ${slot + 1}, empty`}
                disabled={selectedToken === null}
                onClick={() => onPlaceSlot(slot)}
              >
                {slot + 1}
              </button>
            )}
          </li>
        ))}
      </ol>

      <div className={styles.holding} aria-label="Token holding area">
        {holding.length === 0 && (
          <span className={styles.allPlaced}>all tokens placed</span>
        )}
        {holding.map((id) => (
          <LetterToken
            key={id}
            id={id}
            selected={selectedToken === id}
            onClick={(clicked) =>
              onSelectToken(selectedToken === clicked ? null : clicked)
            }
          />
        ))}
      </div>
    </section>
  )
}
