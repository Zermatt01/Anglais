import { Link } from 'react-router';
import { hasContent } from '../../content/index.ts';
import { NOTION_TITLES, TRACK_TITLES } from '../../content/catalog.ts';
import {
  notionsOfTrack,
  phaseOf,
  TRACK_IDS,
  type NotionId,
  type TrackId,
} from '../../domain/curriculum/notion-id.ts';
import type { NotionProgressValues } from '../../domain/curriculum/progress.ts';
import { trackCompletion } from '../../domain/curriculum/summary.ts';
import { Page, Sheet } from '../../ui/Page.tsx';
import { ProgressBar } from '../../ui/ProgressBar.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { pathTo } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { describeProgress } from './labels.ts';
import { useAllProgress } from './use-path.ts';
import './path.css';

function NotionItem({
  notionId,
  progress,
}: {
  readonly notionId: NotionId;
  readonly progress: NotionProgressValues | undefined;
}) {
  const { path } = useAppServices();
  const title = <RichText text={NOTION_TITLES[notionId]} />;
  if (!hasContent(notionId)) {
    return (
      <li className="plain-list__item">
        <span className="plain-list__text">
          <span>{title}</span>
        </span>
        <span className="badge">Bientôt</span>
      </li>
    );
  }
  return (
    <li className="plain-list__item">
      <span className="plain-list__text">
        <Link
          className="notion-link"
          to={pathTo.notion(notionId)}
          onClick={() => {
            // Opening a notion starts it (PEDAGOGY §3.1); the path shows its step.
            void path.start(notionId);
          }}
        >
          {title}
        </Link>
        <span className="muted">{describeProgress(progress)}</span>
      </span>
      {progress?.status === 'acquired' ? <span className="badge">Acquise</span> : null}
    </li>
  );
}

function TrackSheet({
  trackId,
  progress,
}: {
  readonly trackId: TrackId;
  readonly progress: ReadonlyMap<NotionId, NotionProgressValues>;
}) {
  const notions = notionsOfTrack(trackId);
  const delivered = notions.filter(hasContent);
  const completion = trackCompletion(delivered.map((notionId) => progress.get(notionId)));
  return (
    <Sheet title={<RichText text={TRACK_TITLES[trackId]} />}>
      <ProgressBar value={completion} label="Progression de la piste" />
      <div className="button-row">
        <Link className="button button--secondary" to={pathTo.placement(trackId)}>
          Test de positionnement
        </Link>
      </div>
      <ul className="plain-list">
        {notions.map((notionId) => (
          <NotionItem key={notionId} notionId={notionId} progress={progress.get(notionId)} />
        ))}
      </ul>
    </Sheet>
  );
}

/** The path (MOD-04): tracks, notions and their state; lessons open at any time. */
export function PathPage() {
  usePageTitle('Parcours');
  const progress = useAllProgress();
  const upcoming = TRACK_IDS.filter((trackId) =>
    notionsOfTrack(trackId).every((notionId) => phaseOf(notionId) === 8),
  );
  const current = TRACK_IDS.filter((trackId) => !upcoming.includes(trackId));

  return (
    <Page
      title="Parcours"
      subtitle="Chaque notion en cinq étapes : comprendre, reconnaître, pratiquer, traduire, produire."
    >
      {progress === undefined ? (
        <p role="status">Chargement du parcours…</p>
      ) : (
        current.map((trackId) => <TrackSheet key={trackId} trackId={trackId} progress={progress} />)
      )}
      <Sheet title="Prochaines pistes">
        <ul className="plain-list">
          {upcoming.map((trackId) => (
            <li key={trackId} className="plain-list__item">
              <span className="plain-list__text">
                <span>
                  <RichText text={TRACK_TITLES[trackId]} />
                </span>
                <span className="muted">{`${String(notionsOfTrack(trackId).length)} notions`}</span>
              </span>
              <span className="badge">Bientôt</span>
            </li>
          ))}
        </ul>
      </Sheet>
    </Page>
  );
}
