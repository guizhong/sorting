import { makeDeck } from './deck'
import { compareCards } from './oracle'
import { DECK_SIZE, type DataCard, type GameAction, type GameState } from './types'

export function createInitialState(seed?: number): GameState {
  return {
    phase: 'playing',
    dataCards: makeDeck(seed),
    comparisonCount: 0,
    comparisonHistory: [],
    chainTrack: new Array<null>(DECK_SIZE).fill(null),
    piles: {},
    declaredCardId: null,
  }
}

export const initialState: GameState = createInitialState()

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'COMPARE': {
      if (state.phase !== 'playing' || action.left === action.right) return state
      const left = state.dataCards.find((c) => c.id === action.left)
      const right = state.dataCards.find((c) => c.id === action.right)
      if (!left || !right) return state
      // The reducer owns the counter and history; the Oracle stays pure (§7.2).
      const result = compareCards(left, right)
      return {
        ...state,
        comparisonCount: state.comparisonCount + 1,
        comparisonHistory: [...state.comparisonHistory, result],
      }
    }

    case 'PLACE_IN_PILE': {
      if (state.phase !== 'playing') return state
      return {
        ...state,
        piles: { ...state.piles, [action.id]: action.pile },
      }
    }

    case 'RETURN_PILE': {
      if (state.phase !== 'playing') return state
      // Move every card in this pile back to the deck by clearing its
      // assignment. Cards currently on the Chain Track keep their slot and
      // assignment (they aren't shown in the pile), so the track is untouched.
      const onTrack = new Set(state.chainTrack.filter((c) => c !== null))
      const piles = { ...state.piles }
      for (const id of Object.keys(piles) as (keyof typeof piles)[]) {
        if (piles[id] === action.pile && !onTrack.has(id)) delete piles[id]
      }
      return { ...state, piles }
    }

    case 'CHAIN_MOVE': {
      if (state.phase !== 'playing') return state
      const track = state.chainTrack.map((c) => (c === action.id ? null : c))
      if (action.slot !== null) {
        if (action.slot < 0 || action.slot >= DECK_SIZE) return state
        // Dropping onto an occupied slot bumps the occupant back to holding.
        track[action.slot] = action.id
      }
      return { ...state, chainTrack: track }
    }

    case 'DECLARE': {
      if (state.phase !== 'playing') return state
      return { ...state, declaredCardId: action.id, phase: 'verifying' }
    }

    case 'REVEAL': {
      if (state.phase !== 'verifying') return state
      return {
        ...state,
        phase: 'results',
        dataCards: state.dataCards.map(
          (c): DataCard => ({ ...c, faceUp: true }),
        ),
      }
    }

    case 'RESET':
      return createInitialState(action.seed)

    default:
      return state
  }
}
