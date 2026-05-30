/** Card letter identifiers A-K (11 cards per GDD §3.1) */
export type CardId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';

/** All 11 CardId values in alphabetical order */
export const ALL_CARD_IDS: CardId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
];

export interface DataCard {
  id: CardId;
  value: number;
  faceUp: boolean;
}

/** Result of a single comparison query to the Oracle */
export interface Comparison {
  larger: CardId;
  smaller: CardId;
}

export type Phase = 'playing' | 'verifying' | 'results';
export type PileType = 'larger' | 'smaller';

export interface GameState {
  cards: DataCard[];
  phase: Phase;
  comparisonCount: number;
  comparisonHistory: Comparison[];
  /** Which pile each card is assigned to (null = not placed) */
  pileAssignments: Record<CardId, PileType | null>;
  /** Chain track: 11 slots indexed 0 (smallest) to 10 (largest). null = empty. */
  chainTrack: (CardId | null)[];
  /** The card selected for median declaration */
  selectedCardId: CardId | null;
  /** The card the player declared as median (set by DECLARE) */
  declaredCardId: CardId | null;
  /** Diagnosis string set during REVEAL */
  diagnosis: string | null;
}

export type GameAction =
  | { type: 'COMPARE'; left: CardId; right: CardId }
  | { type: 'PLACE_IN_PILE'; id: CardId; pile: PileType }
  | { type: 'CHAIN_MOVE'; id: CardId; slot: number | null }
  | { type: 'SELECT_CARD'; id: CardId | null }
  | { type: 'DECLARE'; id: CardId }
  | { type: 'REVEAL' }
  | { type: 'RESET' };
