import { useState } from 'react';
import { fallbackHintOf } from '../../content/taxonomy.ts';
import type { ProgressEvent } from '../../domain/curriculum/engine.ts';
import type { ExerciseOf } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { AnswerResult } from '../../domain/taxonomy.ts';
import { Notice } from '../../ui/Notice.tsx';
import { useAppServices } from '../app-services.ts';
import type { NotionUse } from '../../domain/production/notion-use.ts';
import { CorrectionAction } from '../correction/CorrectionAction.tsx';
import { CorrectionView } from '../correction/CorrectionView.tsx';
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
  /** Constructions of the notion: the app proves its use with them (D-094). */
  readonly notionUse: NotionUse | null;
  /** The answer is stored with its correction: its result, the changes of the path, the cards made. */
  readonly onRecorded: (
    events: readonly ProgressEvent[],
    result: AnswerResult,
    cardsCreated: number,
  ) => void;
}

/**
 * A translation of step 4 that matches no expected answer, checked by the
 * model on request (CUR-05, D-076, D-083). It fails with an error on the
 * notion; it is good when the app proves the use of the notion (D-094); its
 * other errors make cards as in any production. When the use cannot be
 * proven, the correction is shown and the learner decides.
 */
export function AiTranslationCheck({
  notionId,
  exercise,
  exerciseId,
  source,
  shownAt,
  draftKey,
  context,
  notionUse,
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
  // The model answered, but the app could not prove the use of the notion.
  const [unproven, setUnproven] = useState(false);
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
        ...(notionUse === null ? {} : { notionUse }),
      },
    );
    if (run.state !== 'done') return;
    if (run.outcome.result === null) {
      setUnproven(true);
      return;
    }
    onRecorded(run.outcome.events, run.outcome.result, run.outcome.cardsCreated);
    onChecked(run.outcome.result, id);
  };

  if (unproven && productionId !== null) {
    return (
      <>
        <Notice title="Emploi de la notion non vérifié">
          <p>
            L’IA ne relève pas d’erreur sur la notion, mais l’app n’a pas retrouvé la forme
            travaillée dans ta phrase. Regarde la correction, puis dis ci-dessous ce qu’il en est.
          </p>
        </Notice>
        <CorrectionView productionId={productionId} />
      </>
    );
  }

  return (
    <>
      {storeFailed ? (
        <Notice tone="error" title="Réponse non enregistrée">
          <p>Le stockage du téléphone est peut-être plein : libère de la place, puis réessaie.</p>
        </Notice>
      ) : null}
      <CorrectionAction
        run={correction.run}
        sending={correction.sending}
        available={correction.available}
        label="Faire vérifier par l’IA"
        onCorrect={() => {
          void correction.once(check);
        }}
      />
    </>
  );
}
