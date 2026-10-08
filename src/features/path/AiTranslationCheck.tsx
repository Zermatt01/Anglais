import { useState } from 'react';
import { fallbackHintOf } from '../../content/taxonomy.ts';
import type { ProgressEvent } from '../../domain/curriculum/engine.ts';
import type { ExerciseOf } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import { Notice } from '../../ui/Notice.tsx';
import { useAppServices } from '../app-services.ts';
import { CorrectionAction } from '../correction/CorrectionAction.tsx';
import { referenceOf } from '../correction/request.ts';
import { useCorrection } from '../correction/use-correction.ts';
import type { AiCheckProps } from './exercises/TypedExercise.tsx';

interface AiTranslationCheckProps extends AiCheckProps {
  readonly notionId: NotionId;
  readonly exercise: ExerciseOf<'translate'>;
  readonly exerciseId: string;
  readonly source: 'core' | 'generated';
  readonly shownAt: number;
  readonly draftKey: string;
  readonly context: 'path' | 'immediate-practice';
  /** The answer is stored with its correction: the changes of the path it made. */
  readonly onRecorded: (events: readonly ProgressEvent[]) => void;
}

/**
 * A translation of step 4 that matches no expected answer, checked by the
 * model on request (CUR-05, D-076, D-083). It counts as good when it has no
 * error on the notion; its other errors make cards as in any production.
 */
export function AiTranslationCheck({
  notionId,
  exercise,
  exerciseId,
  source,
  shownAt,
  draftKey,
  context,
  answer,
  hintUsed,
  prepare,
  onChecked,
  onRecorded,
}: AiTranslationCheckProps) {
  const { productions, clock } = useAppServices();
  const correction = useCorrection();
  const [productionId, setProductionId] = useState<string | null>(null);
  const [storeFailed, setStoreFailed] = useState(false);
  const instruction = { text: exercise.sentenceFr, language: 'fr' as const };
  const reference = referenceOf(exercise.sentenceFr, exercise.accepted);

  const check = async () => {
    setStoreFailed(false);
    await prepare();
    const durationMs = Math.max(0, clock.now() - shownAt);
    let id = productionId;
    if (id === null) {
      try {
        id = (
          await productions.submit({
            module: 'path-translate',
            prompt: instruction,
            context: { notionId, itemId: exerciseId, tier: null, unstudied: false, hintUsed },
            text: answer,
            durationMs,
          })
        ).id;
      } catch {
        setStoreFailed(true);
        return;
      }
      setProductionId(id);
    }
    const run = await correction.correct(
      id,
      { module: 'path-translate', instruction, reference, targetNotionId: notionId, text: answer },
      {
        reference,
        fallbackHint: fallbackHintOf,
        pathAnswer: { exerciseId, source, hintUsed, durationMs, context, draftKey },
      },
    );
    if (run.state === 'done' && run.outcome.result !== null) {
      onRecorded(run.outcome.events);
      onChecked(run.outcome.result, id);
    }
  };

  return (
    <>
      {storeFailed ? (
        <Notice tone="error" title="Réponse non enregistrée">
          <p>Le stockage du téléphone est peut-être plein : libère de la place, puis réessaie.</p>
        </Notice>
      ) : null}
      <CorrectionAction
        run={correction.run}
        available={correction.available}
        label="Faire vérifier par l’IA"
        onCorrect={() => {
          void check();
        }}
      />
    </>
  );
}
