import type { GameAction, GameState } from './types';
import { initialDataCards } from './deck';
import { compareCards } from './oracle';
import { generateDiagnosis } from './diagnosis';

/** Create the initial game state for a new round. */
export function createInitialState(): GameState {
  const cards = initialDataCards();
  const pileAssignments = Object.fromEntries(
    cards.map((c) => [c.id, null]),
  ) as GameState['pileAssignments'];

  return {
    cards,
    phase: 'playing',
    comparisonCount: 0,
    comparisonHistory: [],
    pileAssignments,
    chainTrack: new Array(11).fill(null),
    selectedCardId: null,
    declaredCardId: null,
    diagnosis: null,
  };
}

export const initialState = createInitialState();

/**
 * Pure game reducer. Handles all game actions per GDD §7.2.
 * Does not import React or DOM.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'COMPARE': {
      const leftCard = state.cards.find((c) => c.id === action.left);
      const rightCard = state.cards.find((c) => c.id === action.right);
      if (!leftCard || !rightCard) return state;

      const result = compareCards(leftCard, rightCard);
      return {
        ...state,
        comparisonCount: state.comparisonCount + 1,
        comparisonHistory: [...state.comparisonHistory, result],
      };
    }

    case 'PLACE_IN_PILE': {
      return {
        ...state,
        pileAssignments: {
          ...state.pileAssignments,
          [action.id]: action.pile,
        },
      };
    }

    case 'CHAIN_MOVE': {
      const newTrack = [...state.chainTrack];

      // Remove token from any slot it currently occupies
      for (let i = 0; i < newTrack.length; i++) {
        if (newTrack[i] === action.id) {
          newTrack[i] = null;
        }
      }

      // Place in new slot if provided (and not null)
      if (action.slot !== null && action.slot >= 0 && action.slot < 11) {
        newTrack[action.slot] = action.id;
      }

      return {
        ...state,
        chainTrack: newTrack,
      };
    }

    case 'SELECT_CARD': {
      return {
        ...state,
        selectedCardId: action.id,
      };
    }

    case 'DECLARE': {
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        declaredCardId: action.id,
        phase: 'verifying',
      };
    }

    case 'REVEAL': {
      if (state.phase !== 'verifying' || !state.declaredCardId) return state;
      const diagnosis = generateDiagnosis(state, state.declaredCardId);
      return {
        ...state,
        phase: 'results',
        diagnosis,
        cards: state.cards.map((c) => ({ ...c, faceUp: true })),
      };
    }

    case 'RESET': {
      return createInitialState();
    }

    default:
      return state;
  }
}
