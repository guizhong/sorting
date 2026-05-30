import { useState } from 'react'
import type { GameApi } from '../hooks/useGame'
import type { CardId, Comparison } from '../game'
import { Card } from './Card'
import { ComparePad } from './ComparePad'
import { Pile } from './Pile'
import { ChainTrack } from './ChainTrack'
import { Controls } from './Controls'
import styles from './Board.module.css'

interface PadState {
  left: CardId | null
  right: CardId | null
}

function findComparison(
  history: Comparison[],
  a: CardId,
  b: CardId,
): Comparison | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const c = history[i]
    if (
      (c.larger === a && c.smaller === b) ||
      (c.larger === b && c.smaller === a)
    ) {
      return c
    }
  }
  return null
}

export function Board({ game }: { game: GameApi }) {
  const { state } = game
  const [pad, setPad] = useState<PadState>({ left: null, right: null })
  const [selectedToken, setSelectedToken] = useState<CardId | null>(null)
  const [declareMode, setDeclareMode] = useState(false)

  const padResult =
    pad.left && pad.right
      ? findComparison(state.comparisonHistory, pad.left, pad.right)
      : null

  const handleCardClick = (id: CardId) => {
    if (state.phase !== 'playing') return
    if (declareMode) {
      // Declaring the median flips every card and goes straight to results.
      game.declare(id)
      game.reveal()
      setDeclareMode(false)
      return
    }
    // Toggle the card in/out of the compare pad.
    setPad((prev) => {
      if (prev.left === id) return { ...prev, left: null }
      if (prev.right === id) return { ...prev, right: null }
      if (prev.left === null) return { ...prev, left: id }
      if (prev.right === null) return { ...prev, right: id }
      return prev // both slots full
    })
  }

  // A card lives in exactly one place. Once it is on the Chain Track it is
  // removed from the deck and from its pile; the underlying pile assignment
  // is retained so the card returns to its pile when taken off the track.
  const tracked = new Set(
    state.chainTrack.filter((c): c is CardId => c !== null),
  )

  const largerPile = (Object.keys(state.piles) as CardId[]).filter(
    (id) => state.piles[id] === 'larger' && !tracked.has(id),
  )
  const smallerPile = (Object.keys(state.piles) as CardId[]).filter(
    (id) => state.piles[id] === 'smaller' && !tracked.has(id),
  )

  return (
    <div className={styles.board}>
      <div className={styles.middle}>
        <Pile
          kind="smaller"
          cardIds={smallerPile}
          onReturnAll={game.returnPile}
        />

        <div className={styles.center}>
          <div className={styles.deck} aria-label="Data cards">
            {state.dataCards.map((card) =>
              tracked.has(card.id) ? (
                // Vacated: this card is currently on the Chain Track.
                <div
                  key={card.id}
                  className={styles.deckSlotEmpty}
                  aria-label={`Card ${card.id}, on the chain track`}
                />
              ) : (
                <Card
                  key={card.id}
                  card={card}
                  onClick={handleCardClick}
                  selected={pad.left === card.id || pad.right === card.id}
                  declared={state.declaredCardId === card.id}
                  pile={state.piles[card.id]}
                  disabled={
                    state.phase !== 'playing' || state.piles[card.id] != null
                  }
                />
              ),
            )}
          </div>

          <ComparePad
            left={pad.left}
            right={pad.right}
            result={padResult}
            onCompare={() => {
              if (pad.left && pad.right) game.compare(pad.left, pad.right)
            }}
            onPlace={(id, pile) => {
              game.placeInPile(id, pile)
              // Free the pad slot the placed card occupied so a new card
              // can be compared without manually clearing the pad.
              setPad((prev) => ({
                left: prev.left === id ? null : prev.left,
                right: prev.right === id ? null : prev.right,
              }))
            }}
            onClear={() => setPad({ left: null, right: null })}
          />
        </div>

        <Pile kind="larger" cardIds={largerPile} onReturnAll={game.returnPile} />
      </div>

      <ChainTrack
        chainTrack={state.chainTrack}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
        onPlaceSlot={(slot) => {
          if (selectedToken) {
            const moved = selectedToken
            game.chainMove(moved, slot)
            setSelectedToken(null)
            // If this card was staged in the compare pad, free that slot too.
            setPad((prev) => ({
              left: prev.left === moved ? null : prev.left,
              right: prev.right === moved ? null : prev.right,
            }))
          }
        }}
        onRemoveToken={(id) => game.chainMove(id, null)}
      />

      <Controls
        comparisonCount={state.comparisonCount}
        phase={state.phase}
        declareMode={declareMode}
        onToggleDeclareMode={() => setDeclareMode((m) => !m)}
      />
    </div>
  )
}
