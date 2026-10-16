import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { hasContent } from '../../content/index.ts';
import type { CardOverviewEntry } from '../../data/repositories/card-repository.ts';
import type { CardDocument } from '../../data/schemas/cards.ts';
import type { ProductionModule } from '../../data/schemas/productions.ts';
import type { CardStanding } from '../../domain/cards/queue.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { countOf, formatDateTime, startOfLocalDay } from '../dates.ts';
import { PATHS, pathTo } from '../paths.ts';
import { useSettings } from '../settings/use-settings.ts';
import { usePageTitle } from '../use-page-title.ts';

type Group = 'due' | 'capped' | 'later' | 'waiting' | 'mastered' | 'aside';

const GROUPS: readonly { readonly group: Group; readonly title: string }[] = [
  { group: 'due', title: 'À revoir maintenant' },
  { group: 'capped', title: 'Retenues par le plafond du jour' },
  { group: 'later', title: 'Prévues plus tard' },
  { group: 'waiting', title: 'En attente d’une notion' },
  { group: 'mastered', title: 'Maîtrisées' },
  { group: 'aside', title: 'Mises de côté' },
];

function groupOf(standing: CardStanding): Group {
  switch (standing.kind) {
    case 'due':
    case 'capped':
    case 'waiting':
      return standing.kind;
    case 'later':
      return standing.mastered ? 'mastered' : 'later';
    case 'suspended':
    case 'unsolvable':
      return 'aside';
  }
}

const SOURCES: Readonly<Partial<Record<ProductionModule, string>>> = {
  journal: 'Journal',
  theme: 'Thème',
  'path-translate': 'Parcours, traduction',
  'path-produce': 'Parcours, production',
};

const ORIGINS: Readonly<Record<CardDocument['origin'], string>> = {
  error: 'Erreur corrigée',
  lexicon: 'Mon lexique',
  notion: 'Phrase relue d’une notion',
  pronunciation: 'Prononciation',
  import: 'Importée',
};

/** Why the card is or is not shown now, in plain French. */
function reasonOf(standing: CardStanding, newCardsPerDay: number, reviewsPerDay: number): string {
  switch (standing.kind) {
    case 'due':
      return 'À revoir dès maintenant.';
    case 'capped':
      return standing.cap === 'new'
        ? `Plafond de ${countOf(newCardsPerDay, 'nouvelle carte', 'nouvelles cartes')} par jour atteint : elle viendra un autre jour.`
        : standing.cap === 'review'
          ? `Plafond de ${countOf(reviewsPerDay, 'révision', 'révisions')} par jour atteint : elle viendra un autre jour.`
          : 'Plafond des révisions de maintien atteint : elle viendra un autre jour.';
    case 'later':
      return `${standing.mastered ? 'Révision de maintien' : 'Prochaine révision'} : ${formatDateTime(standing.due)}.`;
    case 'waiting':
      return 'Elle s’activera quand la notion atteindra l’étape « Traduire ».';
    case 'suspended':
      return standing.reason === 'reported'
        ? 'Signalée : elle n’est plus montrée.'
        : 'Non résoluble à l’import : gardée, jamais montrée.';
    case 'unsolvable':
      return 'Elle ne peut pas être résolue sans son contexte : gardée, jamais montrée.';
  }
}

/** What the card asks, as its front shows it. */
function frontOf(card: CardDocument): string {
  return card.content.type === 'pronunciation' ? card.content.text : card.content.meaningFr;
}

/**
 * "Mes cartes" (MOD-03, D-092): every card, grouped by where it stands, with
 * the reason it is shown now or not. Nothing is called, nothing is written.
 */
export function CardsPage() {
  usePageTitle('Mes cartes');
  const { cards, clock } = useAppServices();
  const settings = useSettings()?.values ?? DEFAULT_SETTINGS;
  const { newCardsPerDay, reviewsPerDay } = settings;
  const entries = useLiveQuery(
    () => cards.overview({ newCardsPerDay, reviewsPerDay }, startOfLocalDay(clock.now())),
    [cards, clock, newCardsPerDay, reviewsPerDay],
  );
  if (entries === undefined) {
    return (
      <Page title="Mes cartes">
        <p role="status">Chargement des cartes…</p>
      </Page>
    );
  }
  return (
    <Page title="Mes cartes" subtitle={countOf(entries.length, 'carte', 'cartes')}>
      {entries.length === 0 ? (
        <Sheet title="Aucune carte pour l’instant">
          <p>
            Une carte naît d’une erreur corrigée (Journal, Thème, Parcours), d’une expression
            ajoutée à ton lexique, ou d’une notion acquise.
          </p>
        </Sheet>
      ) : (
        GROUPS.map(({ group, title }) => {
          const inGroup = entries.filter((entry) => groupOf(entry.standing) === group);
          return inGroup.length === 0 ? null : (
            <Sheet key={group} title={`${title} (${String(inGroup.length)})`}>
              <ul className="plain-list">
                {inGroup.map((entry) => (
                  <CardLine
                    key={entry.card.id}
                    entry={entry}
                    reason={reasonOf(entry.standing, newCardsPerDay, reviewsPerDay)}
                  />
                ))}
              </ul>
            </Sheet>
          );
        })
      )}
      <p>
        <Link to={PATHS.review}>Retour aux Reprises</Link>
      </p>
    </Page>
  );
}

function CardLine({
  entry,
  reason,
}: {
  readonly entry: CardOverviewEntry;
  readonly reason: string;
}) {
  const { card, standing, source } = entry;
  const notionId = card.notionId;
  const origin = (source === null ? undefined : SOURCES[source]) ?? ORIGINS[card.origin];
  return (
    <li className="plain-list__item">
      <span className="plain-list__text">
        <span>
          <RichText text={frontOf(card)} />
        </span>
        <span className="muted">
          {`${origin} · ${formatDateTime(card.createdAt)}`}
          {notionId === null ? null : (
            <>
              {' · '}
              <RichText text={NOTION_TITLES[notionId]} />
            </>
          )}
        </span>
        <span className="muted">{reason}</span>
        {standing.kind === 'waiting' && hasContent(standing.notionId) ? (
          <span>
            <Link to={pathTo.notion(standing.notionId)}>
              Voir la notion : <RichText text={NOTION_TITLES[standing.notionId]} />
            </Link>
          </span>
        ) : null}
      </span>
    </li>
  );
}
