/**
 * From an answer to a spaced repetition grade, and mastery of a card
 * (docs/PEDAGOGY.md §6.1, CARD-05, CARD-06).
 */
import type { AnswerResult } from '../taxonomy.ts';
import type { ReviewGrade, SrsState } from './state.ts';

/**
 * Proposed grade for an answer; the learner can always confirm or adjust it,
 * and only the learner may choose "easy".
 * - incorrect → again;
 * - acceptable, or correct after a hint → hard;
 * - correct → good.
 */
export function proposeGrade(result: AnswerResult, hintUsed: boolean): ReviewGrade {
  if (result === 'incorrect') return 'again';
  if (result === 'acceptable' || hintUsed) return 'hard';
  return 'good';
}

/** A card is mastered above this stability (days)… */
export const MASTERY_STABILITY_DAYS = 120;
/** …once its last reviews, this many of them, were all correct. */
export const MASTERY_RECENT_CORRECT = 3;

/**
 * Mastery rule of CARD-06: stability above 120 days and the last three results
 * correct. `recentResults` are ordered from oldest to newest.
 */
export function isMastered(state: SrsState, recentResults: readonly AnswerResult[]): boolean {
  const lastResults = recentResults.slice(-MASTERY_RECENT_CORRECT);
  return (
    state.stability > MASTERY_STABILITY_DAYS &&
    lastResults.length === MASTERY_RECENT_CORRECT &&
    lastResults.every((result) => result === 'correct')
  );
}
