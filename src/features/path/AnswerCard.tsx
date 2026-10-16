import { notionCardOf } from '../../domain/cards/notion-cards.ts';
import { englishSentenceOf, type Exercise } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { AnswerResult } from '../../domain/taxonomy.ts';
import { KeepForReview } from '../review/KeepForReview.tsx';
import { WordPicker } from '../lexicon/WordPicker.tsx';

/**
 * Under an answer of the path: the card made of it, or, after an answer to a
 * translation of the core that was not right (a failure, or the notion right
 * with something else to review), the offer to keep the sentence for review
 * (D-092, D-094); and the English sentence, to pick an unknown word (D-095).
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
  const offer =
    !cardCreated && result !== 'correct' && source === 'core' && exercise.kind === 'translate';
  return (
    <>
      {cardCreated ? (
        <p className="muted">Une carte reprendra cette phrase dans tes Reprises.</p>
      ) : null}
      {offer ? <KeepForReview card={notionCardOf(notionId, exercise)} heldBack={false} /> : null}
      <WordPicker sentence={englishSentenceOf(exercise)} />
    </>
  );
}
