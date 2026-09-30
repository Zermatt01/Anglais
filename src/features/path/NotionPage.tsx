import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { pathAnswersOf } from '../../data/repositories/path-repository.ts';
import { activeStep, stepStanding } from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { NotionProgressValues } from '../../domain/curriculum/progress.ts';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { NotFoundPage } from '../not-found/NotFoundPage.tsx';
import { PATHS, pathTo } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { describeProgress, stepName } from './labels.ts';
import { useNotionAttempts, useNotionProgress } from './use-path.ts';
import { useNotionParam } from './use-notion-param.ts';
import './path.css';

function NextAction({
  notionId,
  progress,
}: {
  readonly notionId: NotionId;
  readonly progress: NotionProgressValues | null;
}) {
  if (progress === null || progress.status === 'not_started' || progress.step === 1) {
    return (
      <Link className="button button--primary" to={pathTo.lesson(notionId)}>
        Lire la leçon
      </Link>
    );
  }
  if (progress.status === 'acquired') {
    return (
      <Link className="button button--primary" to={pathTo.practice(notionId)}>
        S’entraîner à la traduction
      </Link>
    );
  }
  if (progress.step === 5) {
    return (
      <Link className="button button--primary" to={pathTo.produce(notionId)}>
        Continuer : {stepName(5)}
      </Link>
    );
  }
  return (
    <Link className="button button--primary" to={pathTo.practice(notionId)}>
      Continuer : {stepName(activeStep(progress))}
    </Link>
  );
}

function Standing({
  notionId,
  progress,
}: {
  readonly notionId: NotionId;
  readonly progress: NotionProgressValues;
}) {
  const attempts = useNotionAttempts(notionId);
  if (attempts === undefined) return null;
  const standing = stepStanding(progress, pathAnswersOf(attempts));
  const score = standing.score.toLocaleString('fr-FR');
  return progress.recall === null ? (
    <p className="muted">
      {`Sur tes ${String(standing.counted)} dernières réponses (au plus ${String(standing.window)}) : ${score} bonne(s). Il en faut ${String(standing.needed)} sur ${String(standing.window)} pour passer à l’étape suivante.`}
    </p>
  ) : (
    <p className="muted">
      {`Rappel de l’étape « ${stepName(progress.recall.step)} » : ${score} réussite(s) sur ${String(standing.counted)}. Il en faut ${String(standing.needed)} sur ${String(standing.window)}.`}
    </p>
  );
}

/** A notion: its state, the next step, and the lesson at any time (MOD-04). */
export function NotionPage() {
  const notionId = useNotionParam();
  const title = notionId === null ? null : NOTION_TITLES[notionId].replaceAll('_', '');
  usePageTitle(title);
  if (notionId === null) return <NotFoundPage />;
  return <NotionView notionId={notionId} />;
}

function NotionView({ notionId }: { readonly notionId: NotionId }) {
  const stored = useNotionProgress(notionId);
  const title = <RichText text={NOTION_TITLES[notionId]} />;

  if (stored === undefined) {
    return (
      <Page title={title}>
        <p role="status">Chargement…</p>
      </Page>
    );
  }
  const progress = stored.state === 'valid' ? stored.values : null;
  const counting =
    progress !== null &&
    (progress.status === 'in_progress' || progress.status === 'to_consolidate') &&
    progress.step >= 2 &&
    progress.step <= 4;

  return (
    <Page title={title} subtitle={<Link to={PATHS.path}>Retour au parcours</Link>}>
      <Sheet title="Où tu en es">
        {stored.state === 'unreadable' ? (
          <Notice tone="error" title="Progression illisible">
            <p>
              Ta progression sur cette notion a été enregistrée par une version plus récente de
              l’application. Mets l’application à jour : rien n’est perdu, et tes réponses restent
              enregistrées.
            </p>
          </Notice>
        ) : (
          <p>{describeProgress(progress)}</p>
        )}
        {counting ? <Standing notionId={notionId} progress={progress} /> : null}
        <div className="button-row">
          {stored.state === 'unreadable' ? null : (
            <NextAction notionId={notionId} progress={progress} />
          )}
          <Link className="button button--secondary" to={pathTo.lesson(notionId)}>
            Revoir la leçon
          </Link>
        </div>
      </Sheet>
    </Page>
  );
}
