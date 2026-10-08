import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import type { NotionContent } from '../../content/schema.ts';
import { pathAnswersOf } from '../../data/repositories/path-repository.ts';
import type { ExerciseAttempt } from '../../data/schemas/exercise-attempts.ts';
import {
  activeStep,
  isPoolExhausted,
  pickNextExercise,
  stepStanding,
  type ProgressEvent,
} from '../../domain/curriculum/engine.ts';
import { STEP_OF_KIND, type Exercise } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { NotionProgressValues, Step } from '../../domain/curriculum/progress.ts';
import type { AnswerResult } from '../../domain/taxonomy.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { NotFoundPage } from '../not-found/NotFoundPage.tsx';
import { pathTo } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { ChoiceExercise } from './exercises/ChoiceExercise.tsx';
import { TypedExercise, type AiCheckProps } from './exercises/TypedExercise.tsx';
import type { SaveAnswer } from './exercises/types.ts';
import { AiTranslationCheck } from './AiTranslationCheck.tsx';
import { GenerateExercises } from './GenerateExercises.tsx';
import { GeneratedFailureNotice } from './GeneratedFailureNotice.tsx';
import { eventMessage, stepName } from './labels.ts';
import { useNotionAttempts, useNotionContent, useNotionProgress } from './use-path.ts';
import { useNotionParam } from './use-notion-param.ts';
import './path.css';

interface PoolItem {
  /** Identifier recorded with the answers: the core identifier, or `generated/<id>`. */
  readonly id: string;
  readonly exercise: Exercise;
  readonly source: 'core' | 'generated';
  readonly generatedId: string | null;
}

interface Shown {
  readonly item: PoolItem;
  /** Seed of the order of the options: the exercise's id and how often it was seen. */
  readonly seed: string;
  readonly shownAt: number;
}

/** Step practised on this screen, or where the learner must go instead. */
type Target = { readonly step: Step } | { readonly go: 'lesson' | 'produce' };

function targetOf(progress: NotionProgressValues | null): Target {
  if (progress === null || progress.status === 'not_started' || progress.step === 1) {
    return { go: 'lesson' };
  }
  // An acquired notion can still be practised, at the translation step.
  if (progress.status === 'acquired') return { step: 4 };
  if (progress.step === 5) return { go: 'produce' };
  return { step: activeStep(progress) };
}

function corePool(content: NotionContent, step: Step): PoolItem[] {
  return content.exercises
    .filter((exercise) => STEP_OF_KIND[exercise.kind] === step)
    .map((exercise) => ({ id: exercise.id, exercise, source: 'core', generatedId: null }));
}

/** Draft of a typed answer: removed with the answer, in the same transaction. */
function draftKeyOf(item: PoolItem): string {
  return `path:${item.id}`;
}

function choose(
  pool: readonly PoolItem[],
  attempts: readonly ExerciseAttempt[],
  avoid: string | null,
  now: number,
): Shown | null {
  const seen = attempts.map(({ exerciseId, at }) => ({ exerciseId, at }));
  const id = pickNextExercise(
    pool.map((item) => item.id),
    seen,
    avoid,
  );
  const item = pool.find((entry) => entry.id === id);
  if (item === undefined) return null;
  const times = seen.filter((entry) => entry.exerciseId === item.id).length;
  return { item, seed: `${item.id}:${String(times)}`, shownAt: now };
}

/** Steps 2 to 4: exercises of the current step, graded locally (CUR-05). */
export function PracticePage() {
  const notionId = useNotionParam();
  usePageTitle(
    notionId === null ? null : `Exercices : ${NOTION_TITLES[notionId].replaceAll('_', '')}`,
  );
  if (notionId === null) return <NotFoundPage />;
  return <PracticeView notionId={notionId} />;
}

function PracticeView({ notionId }: { readonly notionId: NotionId }) {
  const content = useNotionContent(notionId);
  const stored = useNotionProgress(notionId);
  const attempts = useNotionAttempts(notionId);
  const { generatedExercises } = useAppServices();
  const progress = stored?.state === 'valid' ? stored.values : null;
  const target = targetOf(progress);
  const step = 'step' in target ? target.step : null;
  // Tagged with its step: a list read before the progress, or for another step, is
  // never taken for this one, and the first exercise is chosen among all of them.
  const created = useLiveQuery(
    async () => ({
      step,
      documents: step === null ? [] : await generatedExercises.active(notionId, step),
    }),
    [generatedExercises, notionId, step],
  );
  const generated = stored === undefined || created?.step !== step ? undefined : created.documents;
  const title = <RichText text={NOTION_TITLES[notionId]} />;
  const back = <Link to={pathTo.notion(notionId)}>Retour à la notion</Link>;

  if (stored?.state === 'unreadable') {
    return (
      <Page title={title} subtitle={back}>
        <Notice tone="error" title="Progression illisible">
          <p>Mets l’application à jour pour continuer cette notion : rien n’est perdu.</p>
        </Notice>
      </Page>
    );
  }
  if (content.state === 'failed') {
    return (
      <Page title={title} subtitle={back}>
        <Notice tone="error" title="Exercices indisponibles">
          <p>
            Ils n’ont pas pu être chargés. Reconnecte-toi une fois à Internet pour que l’application
            les enregistre, puis réessaie.
          </p>
        </Notice>
      </Page>
    );
  }
  if (
    content.state !== 'loaded' ||
    stored === undefined ||
    attempts === undefined ||
    generated === undefined
  ) {
    return (
      <Page title={title} subtitle={back}>
        <p role="status">Chargement des exercices…</p>
      </Page>
    );
  }
  if (step === null) {
    return (
      <Page title={title} subtitle={back}>
        {'go' in target && target.go === 'produce' ? (
          <Notice title={`Étape suivante : ${stepName(5)}`}>
            <p>
              <Link to={pathTo.produce(notionId)}>Écris tes propres phrases</Link> avec cette
              notion.
            </p>
          </Notice>
        ) : (
          <Notice title="Commence par la leçon">
            <p>
              <Link to={pathTo.lesson(notionId)}>Lis la leçon</Link> : deux ou trois minutes
              suffisent.
            </p>
          </Notice>
        )}
      </Page>
    );
  }

  const pool: PoolItem[] = [
    ...corePool(content.content, step),
    ...generated.map((document) => ({
      id: `generated/${document.id}`,
      exercise: document.exercise,
      source: 'generated' as const,
      generatedId: document.id,
    })),
  ];

  return (
    <Page title={title} subtitle={back}>
      <Session
        key={notionId}
        notionId={notionId}
        step={step}
        pool={pool}
        attempts={attempts}
        progress={progress}
      />
    </Page>
  );
}

function Session({
  notionId,
  step,
  pool,
  attempts,
  progress,
}: {
  readonly notionId: NotionId;
  readonly step: Step;
  readonly pool: readonly PoolItem[];
  readonly attempts: readonly ExerciseAttempt[];
  readonly progress: NotionProgressValues | null;
}) {
  const { path, generatedExercises, clock } = useAppServices();
  const [shown, setShown] = useState<Shown | null>(() => choose(pool, attempts, null, clock.now()));
  const [generated, setGenerated] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<
    | { readonly state: 'idle' }
    | {
        readonly state: 'recorded';
        readonly event: ProgressEvent | null;
        readonly result: AnswerResult;
      }
  >({ state: 'idle' });

  const next = () => {
    setOutcome({ state: 'idle' });
    setGenerated(null);
    setShown(choose(pool, attempts, shown?.item.id ?? null, clock.now()));
  };

  // Resolves once the answer is stored: the exercise shows its result only then.
  const record: SaveAnswer = async (answer) => {
    if (shown === null) return;
    const typed = shown.item.exercise.kind !== 'choice-with-reason';
    const { transition } = await path.recordAnswer(
      {
        notionId,
        exerciseId: shown.item.id,
        source: shown.item.source,
        step: STEP_OF_KIND[shown.item.exercise.kind],
        durationMs: Math.max(0, clock.now() - shown.shownAt),
        ...answer,
      },
      typed ? draftKeyOf(shown.item) : undefined,
    );
    setOutcome({ state: 'recorded', event: transition?.event ?? null, result: answer.result });
  };

  const standing = progress === null ? null : stepStanding(progress, pathAnswersOf(attempts));
  const exhausted = isPoolExhausted(
    pool.map((item) => item.id),
    attempts.map(({ exerciseId, at }) => ({ exerciseId, at })),
  );
  const message =
    outcome.state === 'recorded' && outcome.event !== null ? eventMessage(outcome.event) : null;
  const reachedProduce = progress?.step === 5 && progress.status !== 'acquired';
  // A translation that matches no expected answer may be checked by the model (D-076).
  const translation =
    shown?.item.exercise.kind === 'translate'
      ? { item: shown.item, exercise: shown.item.exercise }
      : null;
  const aiCheck =
    translation === null || shown === null
      ? undefined
      : (check: AiCheckProps) => (
          <AiTranslationCheck
            {...check}
            notionId={notionId}
            exercise={translation.exercise}
            exerciseId={translation.item.id}
            source={translation.item.source}
            shownAt={shown.shownAt}
            draftKey={draftKeyOf(translation.item)}
            context="path"
            onRecorded={(events, result) => {
              setOutcome({ state: 'recorded', event: events.at(-1) ?? null, result });
            }}
          />
        );

  return (
    <>
      <Sheet
        title={`Étape : ${stepName(shown === null ? step : STEP_OF_KIND[shown.item.exercise.kind])}`}
      >
        {progress?.recall ? (
          <p className="muted">
            {`Rappel de l’étape « ${stepName(progress.recall.step)} », avant de revenir à l’étape « ${stepName(progress.step)} ».`}
          </p>
        ) : null}
        {standing === null || progress?.status === 'acquired' ? null : (
          <p className="muted">
            {`Score : ${standing.score.toLocaleString('fr-FR')} sur ${String(standing.counted)} (il en faut ${String(standing.needed)} sur ${String(standing.window)})`}
          </p>
        )}
        {shown === null ? (
          <p>Aucun exercice pour cette étape pour l’instant.</p>
        ) : (
          <>
            {shown.item.source === 'generated' ? (
              <p className="badge">Exercice créé par l’IA</p>
            ) : null}
            {shown.item.exercise.kind === 'choice-with-reason' ? (
              <ChoiceExercise
                key={shown.seed}
                exercise={shown.item.exercise}
                seed={shown.seed}
                onAnswered={record}
              />
            ) : (
              <TypedExercise
                key={shown.seed}
                exercise={shown.item.exercise}
                draftKey={draftKeyOf(shown.item)}
                onAnswered={record}
                aiCheck={aiCheck}
              />
            )}
          </>
        )}
        {outcome.state === 'recorded' &&
        outcome.result === 'incorrect' &&
        shown?.item.source === 'generated' ? (
          <GeneratedFailureNotice />
        ) : null}
        {message === null ? null : (
          <Notice tone="success" title={message.title}>
            <p>{message.body}</p>
          </Notice>
        )}
        {outcome.state === 'recorded' ? (
          <div className="button-row">
            {reachedProduce ? (
              <Link className="button button--primary" to={pathTo.produce(notionId)}>
                Continuer : {stepName(5)}
              </Link>
            ) : (
              <Button onClick={next}>Exercice suivant</Button>
            )}
            {outcome.event?.type === 'lesson-suggested' ? (
              <Link className="button button--secondary" to={pathTo.lesson(notionId)}>
                Relire la leçon
              </Link>
            ) : null}
            {shown?.item.generatedId == null ? null : (
              <Button
                variant="secondary"
                onClick={() => {
                  const id = shown.item.generatedId;
                  if (id !== null) void generatedExercises.report(id).then(next);
                }}
              >
                Signaler cet exercice
              </Button>
            )}
          </div>
        ) : null}
      </Sheet>
      {exhausted ? (
        <GenerateExercises
          notionId={notionId}
          step={step}
          existing={pool.map((item) => item.exercise)}
          onGenerated={setGenerated}
        />
      ) : null}
      {generated === null || exhausted ? null : (
        <Notice tone="success" title="Exercices créés">
          <p>{generated}</p>
        </Notice>
      )}
    </>
  );
}
