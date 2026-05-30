import { useState, useCallback } from 'react';
import { LetterToken } from './LetterToken';
import type { CardId } from '../game/types';
import styles from './ChainTrack.module.css';

interface ChainTrackProps {
  track: (CardId | null)[];
  allIds: CardId[];
  onMove: (id: CardId, slot: number | null) => void;
}

export function ChainTrack({ track, allIds, onMove }: ChainTrackProps) {
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // IDs not currently in the track are in the holding area
  const inTrack = new Set(track.filter((id): id is CardId => id !== null));
  const holding = allIds.filter((id) => !inTrack.has(id));

  const handleDrop = useCallback(
    (e: React.DragEvent, slot: number) => {
      e.preventDefault();
      setDragOverSlot(null);
      const id = e.dataTransfer.getData('tokenId') as CardId;
      if (!id) return;
      onMove(id, slot);
    },
    [onMove],
  );

  const handleHoldingDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverSlot(null);
      const id = e.dataTransfer.getData('tokenId') as CardId;
      if (!id) return;
      onMove(id, null);
    },
    [onMove],
  );

  return (
    <div className={styles.trackContainer}>
      <div className={styles.trackHeader}>
        <span className={styles.trackLabel}>Chain Track</span>
        <span className={styles.trackHint}>
          Smallest → Largest
        </span>
      </div>

      <div className={styles.track}>
        {track.map((id, idx) => (
          <div
            key={idx}
            className={`${styles.slot} ${id ? styles.slotFilled : ''} ${dragOverSlot === idx ? styles.dragOver : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverSlot(idx);
            }}
            onDragLeave={() => setDragOverSlot(null)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {id ? (
              <LetterToken id={id} onMove={onMove} />
            ) : (
              <span className={styles.slotIndex}>{idx + 1}</span>
            )}
          </div>
        ))}
      </div>

      <div
        className={styles.holdingArea}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleHoldingDrop}
      >
        <span className={styles.holdingLabel}>Unplaced:</span>
        {holding.map((id) => (
          <LetterToken key={id} id={id} onMove={onMove} />
        ))}
        {holding.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            All tokens placed
          </span>
        )}
      </div>
    </div>
  );
}