import { notionCardOf } from '../../domain/cards/notion-cards.ts';
import type { Exercise } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { AnswerResult } from '../../domain/taxonomy.ts';
import { KeepForReview } from '../review/KeepForReview.tsx';

/**
 * Under an answer of the path: the card made of it, or, after a failure on a
 * translation of the core, the offer to keep the sentence for review (D-092).
 */
export function AnswerCard({
  notionId,
  exercise,
  source,
  result,
  cardCreated,
}: {
  readonly notionId: NotionId;
  readonly exercise: Exercise;
  readonly source: 'core' | 'generated';
  readonly result: AnswerResult;
  readonly cardCreated: boolean;
}) {
  if (cardCreated) {
    return <p className="muted">Une carte reprendra cette phrase dans tes Reprises.</p>;
  }
  if (result !== 'incorrect' || source !== 'core' || exercise.kind !== 'translate') return null;
  return <KeepForReview card={notionCardOf(notionId, exercise)} heldBack={false} />;
}
