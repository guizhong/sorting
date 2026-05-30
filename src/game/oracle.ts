import type { Comparison, DataCard } from './types';

/**
 * The Oracle: pure function that compares two cards by their hidden values.
 * Returns which is larger. GDD §4.3.
 */
export function compareCards(a: DataCard, b: DataCard): Comparison {
  if (a.value > b.value) {
    return { larger: a.id, smaller: b.id };
  }
  return { larger: b.id, smaller: a.id };
}
