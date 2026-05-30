import type { CardId } from '../game/types';
import tokenStyles from './LetterToken.module.css';

interface LetterTokenProps {
  id: CardId;
  onMove: (id: CardId, slot: number | null) => void;
}

export function LetterToken({ id, onMove }: LetterTokenProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('tokenId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={tokenStyles.token}
      draggable
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      aria-label={`Letter token ${id}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Remove from track on keyboard activation
          onMove(id, null);
        }
      }}
    >
      {id}
    </div>
  );
}