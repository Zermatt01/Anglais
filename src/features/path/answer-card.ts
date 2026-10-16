/** Cards made of an answer of the path (D-092). */
import type { ErrorCardContent } from '../../domain/cards/content.ts';
import { anticipatedErrorCardContent } from '../../domain/cards/from-correction.ts';
import type { Exercise } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { ExerciseAnswer } from './exercises/types.ts';

/**
 * The card of a local answer to a reviewed translation that matches one of
 * its anticipated errors; `null` otherwise.
 */
export function cardOfAnswer(
  exercise: Exercise,
  notionId: NotionId,
  answer: ExerciseAnswer,
): ErrorCardContent | null {
  if (exercise.kind !== 'translate' || answer.grader !== 'local') return null;
  if (answer.result === 'correct') return null;
  return anticipatedErrorCardContent(exercise, notionId, answer.answer);
}
