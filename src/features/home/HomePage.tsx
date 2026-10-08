import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { hasContent } from '../../content/index.ts';
import { secondsOfDay } from '../../data/activity.ts';
import { localDay, startOfLocalDay } from '../../data/days.ts';
import { isNotionStudied } from '../../domain/curriculum/engine.ts';
import { NOTION_IDS, type NotionId } from '../../domain/curriculum/notion-id.ts';
import {
  dailySession,
  type SessionStep,
  type SessionStepId,
} from '../../domain/session/daily-session.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { Page, Sheet } from '../../ui/Page.tsx';
import { ProgressBar } from '../../ui/ProgressBar.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { formatLongDate } from '../dates.ts';
import { PATHS, pathTo } from '../paths.ts';
import { useSettings } from '../settings/use-settings.ts';
import { usePageTitle } from '../use-page-title.ts';

const STEP_NAMES: Readonly<Record<SessionStepId, string>> = {
  review: 'Reprises',
  path: 'Parcours',
  theme: 'Thème',
  journal: 'Journal',
};

/** Modules coming in later phases (docs/ROADMAP.md). */
const LATER = [
  { name: 'Oral', description: 'Réponses chronométrées, fluidité et prononciation.' },
  { name: 'E-mail guidé', description: 'Du plan au message final, avec un modèle commenté.' },
] as const;

/** The notion to continue in the path: the one practised last, then the first one in progress. */
function currentNotion(
  progress: ReadonlyMap<NotionId, { readonly status: string }>,
  lastPractised: NotionId | null,
): NotionId | null {
  if (lastPractised !== null && progress.get(lastPractised)?.status !== 'acquired') {
    return lastPractised;
  }
  return (
    NOTION_IDS.find(
      (notionId) => hasContent(notionId) && progress.get(notionId)?.status === 'in_progress',
    ) ??
    NOTION_IDS.find((notionId) => hasContent(notionId) && !progress.has(notionId)) ??
    null
  );
}

function stepStatus(step: SessionStep): string {
  if (!step.available) {
    return step.id === 'theme'
      ? 'Il s’ouvre dès qu’une notion atteint l’étape « Traduire ».'
      : 'Il demande un compte connecté pour la correction.';
  }
  if (step.done) return 'Fait aujourd’hui.';
  if (step.id === 'review') return `${String(step.target - step.count)} carte(s) à revoir.`;
  if (step.id === 'journal') return 'Quelques phrases, corrigées en deux temps.';
  return `${String(step.count)} sur ${String(step.target)} aujourd’hui.`;
}

/** Home: the daily session (MOD-02, PED-12), then every module on its own. */
export function HomePage() {
  usePageTitle(null);
  const services = useAppServices();
  const { clock, cards, path, productions, db, server } = services;
  const settings = useSettings()?.values ?? DEFAULT_SETTINGS;
  const limits = { newCardsPerDay: settings.newCardsPerDay, reviewsPerDay: settings.reviewsPerDay };
  const today = useLiveQuery(async () => {
    const now = clock.now();
    const dayStart = startOfLocalDay(now);
    const session = await cards.session(limits, dayStart);
    const attempts = await path.attemptsSince(dayStart);
    const progress = await path.allProgress();
    const ofToday = async (module: 'theme' | 'journal' | 'path-produce') =>
      (await productions.list(module)).filter((entry) => entry.createdAt >= dayStart);
    const lastAttempt = [...attempts].sort((a, b) => b.at - a.at)[0];
    return {
      activity: {
        dueCards: session.queue.filter((card) => card.content.type !== 'pronunciation').length,
        cardsReviewed: session.reviewedToday,
        pathAnswers: attempts.filter((attempt) => attempt.context === 'path').length,
        pathProductions: (await ofToday('path-produce')).filter(
          (entry) => entry.status === 'corrected',
        ).length,
        themeSentences: (await ofToday('theme')).filter((entry) => entry.result !== null).length,
        journalEntries: (await ofToday('journal')).length,
      },
      themeAvailable: [...progress.entries()].some(
        ([notionId, values]) => hasContent(notionId) && isNotionStudied(values),
      ),
      notion: currentNotion(progress, lastAttempt?.notionId ?? null),
      seconds: await secondsOfDay(db, localDay(now)),
    };
  }, [clock, cards, path, productions, db, limits.newCardsPerDay, limits.reviewsPerDay]);

  const session =
    today === undefined
      ? null
      : dailySession(today.activity, { theme: today.themeAvailable, journal: server !== null });
  const linkOf = (id: SessionStepId): string => {
    if (id === 'review') return PATHS.review;
    if (id === 'theme') return PATHS.theme;
    if (id === 'journal') return PATHS.journal;
    return today?.notion == null ? PATHS.path : pathTo.notion(today.notion);
  };
  const minutes = Math.floor((today?.seconds ?? 0) / 60);

  return (
    <Page title="Anglais" subtitle={formatLongDate(clock.now())}>
      <Sheet title="Séance du jour">
        {session === null || today === undefined ? (
          <p role="status">Chargement…</p>
        ) : (
          <>
            <ProgressBar
              value={Math.min(1, minutes / settings.dailyGoalMinutes)}
              label={`${String(minutes)} min sur ${String(settings.dailyGoalMinutes)} aujourd’hui`}
            />
            <ol className="plain-list">
              {session.steps.map((step) => (
                <li key={step.id} className="plain-list__item">
                  <span className="plain-list__text">
                    <Link to={linkOf(step.id)} className="notion-link">
                      {STEP_NAMES[step.id]}
                    </Link>
                    <span className="muted">{stepStatus(step)}</span>
                    {step.id === 'path' && today.notion !== null ? (
                      <span className="muted">
                        <RichText text={NOTION_TITLES[today.notion]} />
                      </span>
                    ) : null}
                  </span>
                  {step.done ? <span className="badge">Fait</span> : null}
                </li>
              ))}
            </ol>
            <div className="button-row">
              {session.next === null ? (
                <p>
                  Séance terminée pour aujourd’hui. Chaque module reste ouvert si tu veux continuer.
                </p>
              ) : (
                <Link className="button button--primary" to={linkOf(session.next)}>
                  {`Continuer : ${STEP_NAMES[session.next]}`}
                </Link>
              )}
            </div>
          </>
        )}
      </Sheet>

      <Sheet title="Modules">
        <ul className="plain-list">
          <li className="plain-list__item">
            <span className="plain-list__text">
              <Link to={PATHS.review} className="notion-link">
                Reprises
              </Link>
              <span className="muted">Tes cartes de révision, au bon moment.</span>
            </span>
          </li>
          <li className="plain-list__item">
            <span className="plain-list__text">
              <Link to={PATHS.path} className="notion-link">
                Parcours
              </Link>
              <span className="muted">Les temps verbaux, notion par notion, en cinq étapes.</span>
            </span>
          </li>
          <li className="plain-list__item">
            <span className="plain-list__text">
              <Link to={PATHS.theme} className="notion-link">
                Thème
              </Link>
              <span className="muted">Du français vers l’anglais, sans traduction mot à mot.</span>
            </span>
          </li>
          <li className="plain-list__item">
            <span className="plain-list__text">
              <Link to={PATHS.journal} className="notion-link">
                Journal
              </Link>
              <span className="muted">Quelques phrases sur ta journée, corrigées.</span>
            </span>
          </li>
          <li className="plain-list__item">
            <span className="plain-list__text">
              <Link to={PATHS.lexicon} className="notion-link">
                Mon lexique
              </Link>
              <span className="muted">Les expressions que tu veux réemployer.</span>
            </span>
          </li>
          <li className="plain-list__item">
            <span className="plain-list__text">
              <Link to={PATHS.ruleBook} className="notion-link">
                Carnet de règles
              </Link>
              <span className="muted">Tes erreurs, rangées par catégorie, avec tes notes.</span>
            </span>
          </li>
          {LATER.map((module) => (
            <li key={module.name} className="plain-list__item">
              <span className="plain-list__text">
                <span className="field__label">{module.name}</span>
                <span className="muted">{module.description}</span>
              </span>
              <span className="badge">Bientôt</span>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet title="Ton objectif">
        <p>
          Mener un entretien d’embauche et écrire des e-mails professionnels en anglais, sans
          traduction mentale.
        </p>
      </Sheet>
    </Page>
  );
}
