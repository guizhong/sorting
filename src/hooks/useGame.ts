import { useReducer, useCallback } from 'react';
import { gameReducer, createInitialState } from '../game/reducer';
import type { CardId, PileType } from '../game/types';

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const compare = useCallback(
    (left: CardId, right: CardId) =>
      dispatch({ type: 'COMPARE', left, right }),
    [],
  );

  const placeInPile = useCallback(
    (id: CardId, pile: PileType) =>
      dispatch({ type: 'PLACE_IN_PILE', id, pile }),
    [],
  );

  const chainMove = useCallback(
    (id: CardId, slot: number | null) =>
      dispatch({ type: 'CHAIN_MOVE', id, slot }),
    [],
  );

  const selectCard = useCallback(
    (id: CardId | null) => dispatch({ type: 'SELECT_CARD', id }),
    [],
  );

  const declare = useCallback(
    (id: CardId) => dispatch({ type: 'DECLARE', id }),
    [],
  );

  const reveal = useCallback(() => dispatch({ type: 'REVEAL' }), []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    compare,
    placeInPile,
    chainMove,
    selectCard,
    declare,
    reveal,
    reset,
  };
}