import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { countableOf } from '../../data/schemas/errors.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import { RECENT_WINDOW_MS } from '../../domain/errors/statistics.ts';
import { isCountedError } from '../../domain/production/correction.ts';
import { pickThemeSeries, type ThemePick } from '../../domain/theme/selection.ts';
import { recommendedTier, type ThemeTier } from '../../domain/theme/tier.ts';
import { Button } from '../../ui/Button.tsx';
import { ChoiceGroup } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { useAppServices } from '../app-services.ts';
import { PATHS } from '../paths.ts';
import { useAllProgress } from '../path/use-path.ts';
import { usePageTitle } from '../use-page-title.ts';
import { ThemeSentence, type SentenceResult } from './ThemeSentence.tsx';
import {
  themeCandidates,
  themeHistory,
  themeSuccesses,
  useThemeItems,
  useThemeProductions,
  type ThemeItemOf,
} from './use-theme.ts';
import '../path/path.css';

const TIER_CHOICES = [
  { value: '1', label: 'Traduire', description: 'Une phrase française à traduire.' },
  {
    value: '2',
    label: 'Exprimer la situation',
    description: 'Une situation décrite en français, sans phrase à traduire mot à mot.',
  },
  { value: '3', label: 'Anglais seul', description: 'Une consigne entièrement en anglais.' },
] as const;

interface Series {
  readonly picks: readonly ThemePick[];
  readonly tier: ThemeTier;
  readonly results: readonly SentenceResult[];
}

/**
 * The Thème (MOD-05): sentences from French to English, from the notions
 * studied, at three tiers of instruction (PED-02). Graded locally whenever an
 * expected answer matches; otherwise the model corrects on request, or the
 * learner compares with the reference (NO-05).
 */
export function ThemePage() {
  usePageTitle('Thème');
  const items = useThemeItems();
  const productions = useThemeProductions();
  const progress = useAllProgress();
  const { productions: repository, clock } = useAppServices();
  const errors = useLiveQuery(
    () => repository.errorsSince(clock.now() - RECENT_WINDOW_MS),
    [repository, clock],
  );

  if (items.state === 'failed') {
    return (
      <Page title="Thème">
        <Notice tone="error" title="Phrases indisponibles">
          <p>
            Elles n’ont pas pu être chargées. Reconnecte-toi une fois à Internet pour que
            l’application les enregistre, puis réessaie.
          </p>
        </Notice>
      </Page>
    );
  }
  if (
    items.state === 'loading' ||
    productions === undefined ||
    progress === undefined ||
    errors === undefined
  ) {
    return (
      <Page title="Thème">
        <p role="status">Chargement…</p>
      </Page>
    );
  }
  const recentErrors = new Map<NotionId, number>();
  for (const error of errors) {
    if (error.notionId === null || !isCountedError(countableOf(error)) || error.reported) continue;
    recentErrors.set(error.notionId, (recentErrors.get(error.notionId) ?? 0) + 1);
  }
  return (
    <Theme
      items={items.items}
      history={themeHistory(productions)}
      successes={themeSuccesses(productions)}
      progress={progress}
      recentErrors={recentErrors}
    />
  );
}

function Theme({
  items,
  history,
  successes,
  progress,
  recentErrors,
}: {
  readonly items: ReadonlyMap<string, ThemeItemOf>;
  readonly history: ReturnType<typeof themeHistory>;
  readonly successes: readonly boolean[];
  readonly progress: NonNullable<ReturnType<typeof useAllProgress>>;
  readonly recentErrors: ReadonlyMap<NotionId, number>;
}) {
  const { clock } = useAppServices();
  // Until the level is estimated (phase 5), the tier starts at 1 (D-084).
  const recommended = recommendedTier(null, successes);
  const [tier, setTier] = useState<ThemeTier>(recommended);
  const [series, setSeries] = useState<Series | null>(null);
  const [empty, setEmpty] = useState(false);

  const start = () => {
    const picks = pickThemeSeries({
      candidates: themeCandidates(items),
      progress,
      history,
      recentErrors,
      now: clock.now(),
    });
    if (picks.length === 0) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    setSeries({ picks, tier, results: [] });
  };

  if (series === null) {
    return (
      <Page title="Thème" subtitle="Du français vers l’anglais, sans traduction mot à mot.">
        <Sheet title="Nouvelle série">
          <p>
            Cinq phrases sur les notions que tu as étudiées, mélangées. Plusieurs traductions sont
            justes : une réponse différente de la référence n’est jamais comptée fausse.
          </p>
          <ChoiceGroup
            legend="Consigne"
            value={String(tier)}
            choices={TIER_CHOICES.map((choice) => ({
              ...choice,
              label:
                Number(choice.value) === recommended ? `${choice.label} (conseillé)` : choice.label,
            }))}
            onChange={(value) => {
              setTier(value === '3' ? 3 : value === '2' ? 2 : 1);
            }}
          />
          {empty ? (
            <Notice title="Pas encore de phrases">
              <p>
                Le Thème s’ouvre dès qu’une notion atteint l’étape « Traduire ». Avance dans le{' '}
                <Link to={PATHS.path}>parcours</Link>, ou passe le test de positionnement.
              </p>
            </Notice>
          ) : null}
          <div className="button-row">
            <Button onClick={start}>Commencer</Button>
          </div>
        </Sheet>
      </Page>
    );
  }

  const index = series.results.length;
  const pick = series.picks[index];
  if (pick === undefined) {
    const good = series.results.filter((result) => result !== 'incorrect').length;
    return (
      <Page title="Thème">
        <Sheet title="Série terminée">
          <p>{`${String(good)} phrase(s) juste(s) sur ${String(series.picks.length)}.`}</p>
          <p className="muted">
            Les erreurs sont devenues des cartes : elles reviendront dans tes Reprises.
          </p>
          <div className="button-row">
            <Button
              onClick={() => {
                setSeries(null);
              }}
            >
              Nouvelle série
            </Button>
            <Link className="button button--secondary" to={PATHS.home}>
              Retour à l’accueil
            </Link>
          </div>
        </Sheet>
      </Page>
    );
  }
  const entry = items.get(pick.itemId);
  if (entry === undefined) return null;
  return (
    <Page title="Thème" subtitle={`Phrase ${String(index + 1)} sur ${String(series.picks.length)}`}>
      <ThemeSentence
        key={`${pick.itemId}:${String(index)}`}
        notionId={entry.notionId}
        notionTitle={NOTION_TITLES[entry.notionId]}
        item={entry.item}
        tier={series.tier}
        unstudied={pick.unstudied}
        onNext={(result) => {
          setSeries({ ...series, results: [...series.results, result] });
        }}
      />
    </Page>
  );
}
