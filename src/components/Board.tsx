import { useState, useCallback, useMemo } from 'react';
import { Card } from './Card';
import { ComparePad } from './ComparePad';
import { Pile } from './Pile';
import { ChainTrack } from './ChainTrack';
import { Controls } from './Controls';
import { ResultsModal } from './ResultsModal';
import { buildResult } from '../game/diagnosis';
import type { CardId, PileType } from '../game/types';
import { ALL_CARD_IDS } from '../game/types';
import type { GameState } from '../game/types';
import styles from './Board.module.css';

interface BoardProps {
  state: GameState;
  onCompare: (left: CardId, right: CardId) => void;
  onPlaceInPile: (id: CardId, pile: PileType) => void;
  onChainMove: (id: CardId, slot: number | null) => void;
  onSelectCard: (id: CardId | null) => void;
  onDeclare: (id: CardId) => void;
  onReveal: () => void;
  onReset: () => void;
}

export function Board({
  state,
  onCompare,
  onPlaceInPile,
  onChainMove,
  onSelectCard,
  onDeclare,
  onReveal,
  onReset,
}: BoardProps) {
  const [leftCard, setLeftCard] = useState<CardId | null>(null);
  const [rightCard, setRightCard] = useState<CardId | null>(null);
  const [showRules, setShowRules] = useState(false);

  const handleCompare = useCallback(
    (left: CardId, right: CardId) => {
      onCompare(left, right);
      setLeftCard(null);
      setRightCard(null);
    },
    [onCompare],
  );

  const effectiveLastResult = useMemo(() => {
    if (state.comparisonHistory.length === 0) return null;
    return state.comparisonHistory[state.comparisonHistory.length - 1];
  }, [state.comparisonHistory]);

  const piledIds = useMemo(() => {
    return new Set(
      Object.entries(state.pileAssignments)
        .filter(([, pile]) => pile !== null)
        .map(([id]) => id as CardId),
    );
  }, [state.pileAssignments]);

  const unplacedCards = useMemo(
    () => state.cards.filter((c) => !piledIds.has(c.id)),
    [state.cards, piledIds],
  );

  const largerIds = useMemo(
    () =>
      Object.entries(state.pileAssignments)
        .filter(([, pile]) => pile === 'larger')
        .map(([id]) => id) as CardId[],
    [state.pileAssignments],
  );

  const smallerIds = useMemo(
    () =>
      Object.entries(state.pileAssignments)
        .filter(([, pile]) => pile === 'smaller')
        .map(([id]) => id) as CardId[],
    [state.pileAssignments],
  );

  const handleCardDragStart = useCallback(
    (e: React.DragEvent, id: CardId) => {
      e.dataTransfer.setData('cardId', id);
      e.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  const diagnosisResult = useMemo(() => {
    if (state.phase === 'results') {
      return buildResult(state);
    }
    return null;
  }, [state.phase, state]);

  const handleDeclareAndReveal = useCallback(() => {
    if (state.selectedCardId) {
      onDeclare(state.selectedCardId);
      setTimeout(() => onReveal(), 50);
    }
  }, [state.selectedCardId, onDeclare, onReveal]);

  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <h1 className={styles.title}>Medius</h1>
        <p className={styles.subtitle}>Find the Median</p>
        <button
          className={styles.rulesButton}
          onClick={() => setShowRules(true)}
        >
          How to Play
        </button>
      </header>

      <div className={styles.mainArea}>
        <Pile
          type="larger"
          cards={state.cards}
          assignedIds={largerIds}
          onPlace={onPlaceInPile}
        />

        <div className={styles.centerColumn}>
          <ComparePad
            cards={state.cards}
            leftCard={leftCard}
            rightCard={rightCard}
            lastResult={effectiveLastResult}
            onSetLeft={(id) => setLeftCard(id)}
            onSetRight={(id) => setRightCard(id)}
            onCompare={handleCompare}
          />

          <div className={styles.cardsArea}>
            <div className={styles.cardsLabel}>
              Cards ({unplacedCards.length})
            </div>
            {unplacedCards.length === 0 ? (
              <div className={styles.emptyCards}>
                All cards placed in piles
              </div>
            ) : (
              unplacedCards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  isSelected={state.selectedCardId === card.id}
                  isInPile={false}
                  onSelect={onSelectCard}
                  draggable
                  onDragStart={handleCardDragStart}
                />
              ))
            )}
          </div>

          <div className={styles.controlsSection}>
            <Controls
              selectedCardId={state.selectedCardId}
              comparisonCount={state.comparisonCount}
              onDeclare={handleDeclareAndReveal}
            />
          </div>
        </div>

        <Pile
          type="smaller"
          cards={state.cards}
          assignedIds={smallerIds}
          onPlace={onPlaceInPile}
        />
      </div>

      <div className={styles.trackSection}>
        <ChainTrack
          track={state.chainTrack}
          allIds={[...ALL_CARD_IDS]}
          onMove={onChainMove}
        />
      </div>

      {state.phase === 'results' && diagnosisResult && (
        <ResultsModal result={diagnosisResult} onPlayAgain={onReset} />
      )}

      {showRules && (
        <div
          className={styles.rulesOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRules(false);
          }}
        >
          <div className={styles.rulesPanel}>
            <h2>How to Play Medius</h2>
            <ol>
              <li>
                Each card has a letter (A–K) on its back. The number is hidden.
              </li>
              <li>
                Drag any two face-down cards into the{' '}
                <strong>[L]</strong> and <strong>[R]</strong> slots, then click{' '}
                <strong>Compare</strong>. The Oracle will tell you which is
                larger.
              </li>
              <li>
                Drag the larger card to the <strong>LARGER</strong> pile and the
                smaller to the <strong>SMALLER</strong> pile.
              </li>
              <li>
                Use the <strong>Chain Track</strong> below to record what you've
                learned about the cards relative order. Drag letter tokens left
                (smallest) to right (largest). Rearrange freely!
              </li>
              <li>You may not look at the front of any card until the end.</li>
              <li>
                When confident, click a card and press{' '}
                <strong>&quot;This is the Median&quot;</strong>.
              </li>
            </ol>
            <p style={{ fontSize: 14, marginBottom: 8, color: 'var(--color-text-muted)' }}>
              The median is the middle card — exactly 5 cards are smaller and 5
              are larger. Can you find it with as few comparisons as possible?
            </p>
            <button
              className={styles.closeRules}
              onClick={() => setShowRules(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}