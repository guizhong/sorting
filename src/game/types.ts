/**
 * Core domain types for Medius. This module is pure data — no React, no DOM.
 * See GDD §7.2.
 */

export type CardId =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'

export const CARD_IDS: readonly CardId[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
]

/** Number of cards in the deck (GDD §3.1). */
export const DECK_SIZE = 11

/** The median is the 6th of 11 in a 1-indexed sorted list (GDD §4.3). */
export const MEDIAN_RANK = 6

export interface DataCard {
  id: CardId
  value: number
  faceUp: boolean
}

/** A single resolved comparison: which id was larger, which was smaller. */
export interface Comparison {
  larger: CardId
  smaller: CardId
}

/** Which pile a card has been assigned to by the player. */
export type Pile = 'larger' | 'smaller'

/** Phase of the round. */
export type Phase = 'playing' | 'verifying' | 'results'

export interface GameState {
  phase: Phase
  dataCards: DataCard[]
  comparisonCount: number
  comparisonHistory: Comparison[]
  /** length DECK_SIZE; null = empty slot. Index 0 = smallest, last = largest. */
  chainTrack: (CardId | null)[]
  /** Player's pile assignments, keyed by card id. */
  piles: Partial<Record<CardId, Pile>>
  declaredCardId: CardId | null
}

export type GameAction =
  | { type: 'COMPARE'; left: CardId; right: CardId }
  | { type: 'PLACE_IN_PILE'; id: CardId; pile: Pile }
  | { type: 'CHAIN_MOVE'; id: CardId; slot: number | null }
  | { type: 'DECLARE'; id: CardId }
  | { type: 'REVEAL' }
  | { type: 'RESET'; seed?: number }
