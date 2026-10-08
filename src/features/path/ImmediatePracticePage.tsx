import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import type { NotionContent } from '../../content/schema.ts';
import type { ExerciseAttempt } from '../../data/schemas/exercise-attempts.ts';
import { isNotionStudied } from '../../domain/curriculum/engine.ts';
import { STEP_OF_KIND, type Exercise } from '../../domain/curriculum/exercise.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import { immediatePractice } from '../../domain/curriculum/practice.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { NotFoundPage } from '../not-found/NotFoundPage.tsx';
import { pathTo } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { AiTranslationCheck } from './AiTranslationCheck.tsx';
import { GeneratedFailureNotice } from './GeneratedFailureNotice.tsx';
import { TypedExercise } from './exercises/TypedExercise.tsx';
import type { SaveAnswer } from './exercises/types.ts';
import { useNotionAttempts, useNotionContent, useNotionProgress } from './use-path.ts';
import { useNotionParam } from './use-notion-param.ts';
import './path.css';

interface PracticeItem {
  readonly id: string;
  readonly exercise: Exclude<Exercise, { kind: 'choice-with-reason' }>;
  readonly source: 'core' | 'generated';
  /** Identifier of an exercise created by the model, to report it. */
  readonly generatedId: string | null;
}

/**
 * Immediate practice after an error (PED-07, PEDAGOGY §5.2): three controlled
 * exercises of step 3, then a translation of step 4, before going back. It can
 * always be skipped, and its answers never move the step (D-075).
 */
export function ImmediatePracticePage() {
  const notionId = useNotionParam();
  usePageTitle(
    notionId === null ? null : `Pratique : ${NOTION_TITLES[notionId].replaceAll('_', '')}`,
  );
  if (notionId === null) return <NotFoundPage />;
  return <PracticeNow notionId={notionId} />;
}

function PracticeNow({ notionId }: { readonly notionId: NotionId }) {
  const content = useNotionContent(notionId);
  const attempts = useNotionAttempts(notionId);
  const stored = useNotionProgress(notionId);
  const { generatedExercises, clock } = useAppServices();
  const generated = useLiveQuery(
    async () => [
      ...(await generatedExercises.active(notionId, 3)),
      ...(await generatedExercises.active(notionId, 4)),
    ],
    [generatedExercises, notionId],
  );
  // The exercises are chosen once, when the screen opens.
  const [plan, setPlan] = useState<readonly PracticeItem[] | null>(null);
  const title = <RichText text={NOTION_TITLES[notionId]} />;
  const back = <Link to={pathTo.notion(notionId)}>Voir la notion</Link>;

  if (content.state === 'failed') {
    return (
      <Page title={title}>
        <Notice tone="error" title="Exercices indisponibles">
          <p>Reconnecte-toi une fois à Internet pour que l’application les enregistre.</p>
        </Notice>
      </Page>
    );
  }
  if (
    content.state !== 'loaded' ||
    attempts === undefined ||
    generated === undefined ||
    stored === undefined
  ) {
    return (
      <Page title={title}>
        <p role="status">Chargement…</p>
      </Page>
    );
  }
  const items =
    plan ??
    choosePlan(
      content.content,
      generated.map((document) => ({
        id: `generated/${document.id}`,
        exercise: document.exercise,
        generatedId: document.id,
      })),
      attempts,
      clock.now(),
    );
  if (plan === null) setPlan(items);
  const studied = isNotionStudied(stored.state === 'valid' ? stored.values : null);

  return (
    <Page title={title} subtitle={back}>
      {studied ? null : (
        <Notice title="Notion pas encore étudiée">
          <p>
            Deux minutes de <Link to={pathTo.lesson(notionId)}>leçon</Link> avant les exercices
            aident beaucoup.
          </p>
        </Notice>
      )}
      <Run notionId={notionId} items={items} />
    </Page>
  );
}

function choosePlan(
  content: NotionContent,
  generated: readonly {
    readonly id: string;
    readonly exercise: Exercise;
    readonly generatedId: string;
  }[],
  attempts: readonly ExerciseAttempt[],
  now: number,
): PracticeItem[] {
  const all = [
    ...content.exercises.map((exercise) => ({
      id: exercise.id,
      exercise,
      source: 'core' as const,
      generatedId: null,
    })),
    ...generated.map((entry) => ({ ...entry, source: 'generated' as const })),
  ].flatMap((entry) =>
    entry.exercise.kind === 'choice-with-reason'
      ? []
      : [
          {
            id: entry.id,
            exercise: entry.exercise,
            source: entry.source,
            generatedId: entry.generatedId,
          },
        ],
  );
  const ofStep = (step: number) =>
    all.filter((entry) => STEP_OF_KIND[entry.exercise.kind] === step).map((entry) => entry.id);
  const ids = immediatePractice(
    ofStep(3),
    ofStep(4),
    attempts.map(({ exerciseId, at }) => ({ exerciseId, at })),
    now,
  );
  return ids.flatMap((id) => all.find((entry) => entry.id === id) ?? []);
}

function Run({
  notionId,
  items,
}: {
  readonly notionId: NotionId;
  readonly items: readonly PracticeItem[];
}) {
  const { path, generatedExercises, clock } = useAppServices();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shownAt, setShownAt] = useState(() => clock.now());
  const item = items[index];

  if (item === undefined) {
    return (
      <Sheet title="Pratique terminée">
        <p>Bien joué. Cette notion reviendra dans tes Reprises et dans le Thème.</p>
        <div className="button-row">
          <Button
            onClick={() => {
              void navigate(-1);
            }}
          >
            Revenir là où j’étais
          </Button>
          <Link className="button button--secondary" to={pathTo.lesson(notionId)}>
            Relire la leçon
          </Link>
        </div>
      </Sheet>
    );
  }

  const draftKey = `practice:${item.id}`;
  const record: SaveAnswer = async (answer) => {
    await path.recordAnswer(
      {
        notionId,
        exerciseId: item.id,
        source: item.source,
        step: STEP_OF_KIND[item.exercise.kind],
        durationMs: Math.max(0, clock.now() - shownAt),
        ...answer,
      },
      draftKey,
      'immediate-practice',
    );
    setFailed(answer.result === 'incorrect');
    setRecorded(true);
  };

  const nextExercise = () => {
    setRecorded(false);
    setFailed(false);
    setShownAt(clock.now());
    setIndex(index + 1);
  };

  return (
    <Sheet title={`Exercice ${String(index + 1)} sur ${String(items.length)}`}>
      {item.source === 'generated' ? <p className="badge">Exercice créé par l’IA</p> : null}
      <TypedExercise
        key={item.id}
        exercise={item.exercise}
        draftKey={draftKey}
        onAnswered={record}
        aiCheck={
          item.exercise.kind === 'translate'
            ? (check) =>
                item.exercise.kind === 'translate' ? (
                  <AiTranslationCheck
                    {...check}
                    notionId={notionId}
                    exercise={item.exercise}
                    exerciseId={item.id}
                    source={item.source}
                    shownAt={shownAt}
                    draftKey={draftKey}
                    context="immediate-practice"
                    onRecorded={(_events, result) => {
                      setFailed(result === 'incorrect');
                      setRecorded(true);
                    }}
                  />
                ) : null
            : undefined
        }
      />
      {recorded && failed && item.source === 'generated' ? <GeneratedFailureNotice /> : null}
      <div className="button-row">
        {recorded ? (
          <Button onClick={nextExercise}>
            {index + 1 < items.length ? 'Exercice suivant' : 'Terminer'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              void navigate(-1);
            }}
          >
            Passer la pratique
          </Button>
        )}
        {recorded && item.generatedId !== null ? (
          <Button
            variant="secondary"
            onClick={() => {
              const id = item.generatedId;
              if (id !== null) void generatedExercises.report(id).then(nextExercise);
            }}
          >
            Signaler cet exercice
          </Button>
        ) : null}
      </div>
    </Sheet>
  );
}
