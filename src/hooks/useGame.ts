import { useMemo, useReducer } from 'react'
import {
  createInitialState,
  gameReducer,
  type CardId,
  type GameState,
  type Pile,
} from '../game'

export interface GameApi {
  state: GameState
  compare: (left: CardId, right: CardId) => void
  placeInPile: (id: CardId, pile: Pile) => void
  returnPile: (pile: Pile) => void
  chainMove: (id: CardId, slot: number | null) => void
  declare: (id: CardId) => void
  reveal: () => void
  reset: (seed?: number) => void
}

/** Wraps the pure game reducer and exposes typed action dispatchers. */
export function useGame(seed?: number): GameApi {
  const [state, dispatch] = useReducer(
    gameReducer,
    seed,
    createInitialState,
  )

  return useMemo<GameApi>(
    () => ({
      state,
      compare: (left, right) => dispatch({ type: 'COMPARE', left, right }),
      placeInPile: (id, pile) => dispatch({ type: 'PLACE_IN_PILE', id, pile }),
      returnPile: (pile) => dispatch({ type: 'RETURN_PILE', pile }),
      chainMove: (id, slot) => dispatch({ type: 'CHAIN_MOVE', id, slot }),
      declare: (id) => dispatch({ type: 'DECLARE', id }),
      reveal: () => dispatch({ type: 'REVEAL' }),
      reset: (s) => dispatch({ type: 'RESET', seed: s }),
    }),
    [state],
  )
}
