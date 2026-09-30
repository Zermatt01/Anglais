import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { hasContent } from '../../content/index.ts';
import { NOTION_TITLES, TRACK_TITLES } from '../../content/catalog.ts';
import type { PlacementQuestion } from '../../content/schema.ts';
import { notionsOfTrack, type NotionId, type TrackId } from '../../domain/curriculum/notion-id.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { OptionGroup } from '../../ui/OptionGroup.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { NotFoundPage } from '../not-found/NotFoundPage.tsx';
import { PATHS, pathTo, trackOfSlug } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { SentenceWithGap } from './exercises/SentenceWithGap.tsx';
import { shuffled } from './shuffle.ts';
import { useNotionContent } from './use-path.ts';
import './path.css';

/**
 * Notions of the track that the placement test may still assess: delivered,
 * not started, and never tested before (a failed test is not retaken, so that
 * a notion cannot be passed by guessing twice).
 */
function useCandidates(trackId: TrackId): NotionId[] | undefined {
  const { path } = useAppServices();
  return useLiveQuery(async () => {
    const progress = await path.allProgress();
    const candidates: NotionId[] = [];
    for (const notionId of notionsOfTrack(trackId).filter(hasContent)) {
      const status = progress.get(notionId)?.status ?? 'not_started';
      if (status !== 'not_started') continue;
      const attempts = await path.attempts(notionId);
      if (attempts.some((attempt) => attempt.context === 'placement')) continue;
      candidates.push(notionId);
    }
    return candidates;
  }, [path, trackId]);
}

/** Placement test of a track (CUR-08): a few questions per notion, graded locally. */
export function PlacementPage() {
  const { track } = useParams();
  const trackId = track === undefined ? null : trackOfSlug(track);
  usePageTitle('Test de positionnement');
  if (trackId === null) return <NotFoundPage />;
  return <PlacementView trackId={trackId} />;
}

type Run =
  | { readonly state: 'intro' }
  | { readonly state: 'testing'; readonly notions: readonly NotionId[]; readonly index: number }
  | {
      readonly state: 'result';
      readonly notions: readonly NotionId[];
      readonly index: number;
      readonly passed: boolean;
    }
  | { readonly state: 'finished' };

function PlacementView({ trackId }: { readonly trackId: TrackId }) {
  const candidates = useCandidates(trackId);
  const [run, setRun] = useState<Run>({ state: 'intro' });
  const title = 'Test de positionnement';
  const subtitle = (
    <span>
      <RichText text={TRACK_TITLES[trackId]} /> · <Link to={PATHS.path}>Retour au parcours</Link>
    </span>
  );

  if (run.state === 'testing') {
    const notionId = run.notions[run.index];
    if (notionId === undefined) return null;
    return (
      <Page title={title} subtitle={subtitle}>
        <NotionTest
          key={notionId}
          notionId={notionId}
          position={{ index: run.index, count: run.notions.length }}
          onDone={(passed) => {
            setRun({ state: 'result', notions: run.notions, index: run.index, passed });
          }}
        />
      </Page>
    );
  }

  if (run.state === 'result') {
    const notionId = run.notions[run.index];
    const last = run.index + 1 >= run.notions.length;
    return (
      <Page title={title} subtitle={subtitle}>
        <Sheet title={<RichText text={notionId === undefined ? '' : NOTION_TITLES[notionId]} />}>
          {run.passed ? (
            <Notice tone="success" title="Notion à consolider">
              <p>
                Toutes tes réponses sont justes : cette notion commence directement à l’étape
                Traduire.
              </p>
            </Notice>
          ) : (
            <Notice title="Notion à travailler">
              <p>Tu la commenceras par la leçon, puis les exercices guidés.</p>
            </Notice>
          )}
          <div className="button-row">
            {last ? (
              <Button
                onClick={() => {
                  setRun({ state: 'finished' });
                }}
              >
                Voir le résultat
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setRun({ state: 'testing', notions: run.notions, index: run.index + 1 });
                }}
              >
                Notion suivante
              </Button>
            )}
            {last ? null : (
              <Button
                variant="secondary"
                onClick={() => {
                  setRun({ state: 'finished' });
                }}
              >
                M’arrêter ici
              </Button>
            )}
          </div>
        </Sheet>
      </Page>
    );
  }

  if (run.state === 'finished') {
    return (
      <Page title={title} subtitle={subtitle}>
        <Sheet title="Test terminé">
          <p>
            Tes résultats sont enregistrés. Les notions réussies commencent à l’étape Traduire ; les
            autres, par la leçon.
          </p>
          <div className="button-row">
            <Link className="button button--primary" to={PATHS.path}>
              Retour au parcours
            </Link>
          </div>
        </Sheet>
      </Page>
    );
  }

  return (
    <Page title={title} subtitle={subtitle}>
      <Sheet title="Comment ça marche">
        <p>
          Quelques questions par notion, sans aide. Si toutes les réponses d’une notion sont justes,
          elle passe « à consolider » et commence directement à l’étape Traduire. Sinon, elle reste
          à commencer, par la leçon.
        </p>
        <p className="muted">
          Tu peux t’arrêter à tout moment : chaque notion testée est enregistrée. Une notion déjà
          commencée ou déjà testée n’est pas proposée.
        </p>
        {candidates === undefined ? (
          <p role="status">Chargement…</p>
        ) : candidates.length === 0 ? (
          <Notice title="Rien à tester">
            <p>Toutes les notions de cette piste sont déjà commencées ou testées.</p>
          </Notice>
        ) : (
          <>
            <p>{`${String(candidates.length)} notion(s) à tester.`}</p>
            <div className="button-row">
              <Button
                onClick={() => {
                  setRun({ state: 'testing', notions: candidates, index: 0 });
                }}
              >
                Commencer le test
              </Button>
            </div>
          </>
        )}
      </Sheet>
    </Page>
  );
}

function NotionTest({
  notionId,
  position,
  onDone,
}: {
  readonly notionId: NotionId;
  readonly position: { readonly index: number; readonly count: number };
  readonly onDone: (passed: boolean) => void;
}) {
  const content = useNotionContent(notionId);
  const { path } = useAppServices();
  const [answers, setAnswers] = useState<{ question: PlacementQuestion; answer: string }[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const heading = (
    <>
      {`Notion ${String(position.index + 1)} sur ${String(position.count)} : `}
      <RichText text={NOTION_TITLES[notionId]} />
    </>
  );

  if (content.state !== 'loaded') {
    return (
      <Sheet title={heading}>
        {content.state === 'failed' ? (
          <Notice tone="error" title="Questions indisponibles">
            <p>Reconnecte-toi une fois à Internet pour que l’application les enregistre.</p>
          </Notice>
        ) : (
          <p role="status">Chargement…</p>
        )}
      </Sheet>
    );
  }

  const questions = content.content.placement;
  const question = questions[answers.length];
  if (question === undefined) return null;

  const validate = () => {
    if (choice === null) return;
    const all = [...answers, { question, answer: choice }];
    setAnswers(all);
    setChoice(null);
    if (all.length < questions.length) return;
    path
      .recordPlacement(
        notionId,
        all.map((entry) => ({
          questionId: entry.question.id,
          answer: entry.answer,
          correct: entry.answer === entry.question.answer,
        })),
      )
      .then(
        ({ passed }) => {
          onDone(passed);
        },
        () => {
          setFailed(true);
        },
      );
  };

  return (
    <Sheet title={heading}>
      <p className="muted">{`Question ${String(Math.min(answers.length + 1, questions.length))} sur ${String(questions.length)}`}</p>
      {question.contextFr === undefined ? null : (
        <p className="muted">
          <RichText text={question.contextFr} />
        </p>
      )}
      <SentenceWithGap sentence={question.sentence} />
      <OptionGroup
        key={question.id}
        legend="Choisis la forme"
        options={shuffled(question.options, question.id).map((option) => ({
          value: option,
          label: option,
          lang: 'en',
        }))}
        value={choice}
        onChange={setChoice}
      />
      {failed ? (
        <Notice tone="error" title="Résultat non enregistré">
          <p>Réessaie. Si le problème continue, exporte tes données puis recharge l’application.</p>
        </Notice>
      ) : null}
      <div className="button-row">
        <Button disabled={choice === null} onClick={validate}>
          Valider
        </Button>
        <Link className="button button--secondary" to={pathTo.lesson(notionId)}>
          Voir la leçon
        </Link>
      </div>
    </Sheet>
  );
}
