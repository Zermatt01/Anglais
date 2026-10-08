import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router';
import type { CardDocument } from '../../data/schemas/cards.ts';
import type { CardContent } from '../../domain/cards/content.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { useAppServices } from '../app-services.ts';
import { formatDateTime, startOfLocalDay } from '../dates.ts';
import { PATHS } from '../paths.ts';
import { useSettings } from '../settings/use-settings.ts';
import { usePageTitle } from '../use-page-title.ts';
import { CardReview } from './CardReview.tsx';
import '../path/path.css';

type ReviewedCard = CardDocument & {
  readonly content: Exclude<CardContent, { type: 'pronunciation' }>;
};

/** Pronunciation cards are reviewed aloud, with the oral module (phase 6). */
function isWritten(card: CardDocument): card is ReviewedCard {
  return card.content.type !== 'pronunciation';
}

/**
 * Reprises (MOD-03): the due cards, mixed, within the daily caps of the
 * settings. The queue is read again after each review, so that a card failed
 * a minute ago comes back in the same session.
 */
export function ReviewPage() {
  usePageTitle('Reprises');
  const { cards, clock } = useAppServices();
  const settings = useSettings()?.values ?? DEFAULT_SETTINGS;
  const limits = { newCardsPerDay: settings.newCardsPerDay, reviewsPerDay: settings.reviewsPerDay };
  const [reviewed, setReviewed] = useState(0);
  const session = useLiveQuery(
    () => cards.session(limits, startOfLocalDay(clock.now())),
    // `reviewed` reads the queue again after each review, the clock having moved.
    [cards, clock, limits.newCardsPerDay, limits.reviewsPerDay, reviewed],
  );

  if (session === undefined) {
    return (
      <Page title="Reprises">
        <p role="status">Chargement des cartes…</p>
      </Page>
    );
  }
  const queue = session.queue.filter(isWritten);
  const [card] = queue;
  return (
    <Page
      title="Reprises"
      subtitle={`${String(queue.length)} carte(s) à revoir maintenant · ${String(session.reviewedToday)} revue(s) aujourd’hui`}
    >
      {card === undefined ? (
        <Sheet title="Rien à revoir pour l’instant">
          <p>
            {session.nextDue === null
              ? 'Tes cartes apparaissent ici après tes corrections, et quand une notion est acquise.'
              : `Prochaine carte : ${formatDateTime(session.nextDue)}.`}
          </p>
          {session.nextDue === null ? null : (
            <div className="button-row">
              <Button
                variant="secondary"
                onClick={() => {
                  setReviewed((count) => count + 1);
                }}
              >
                Actualiser
              </Button>
            </div>
          )}
          <Notice title="Et maintenant ?">
            <p>
              Continue la <Link to={PATHS.home}>séance du jour</Link>, ou écris quelques phrases
              dans le <Link to={PATHS.journal}>journal</Link>.
            </p>
          </Notice>
        </Sheet>
      ) : (
        <CardReview
          key={`${card.id}:${String(card.srs.reps)}`}
          card={card}
          onReviewed={() => {
            setReviewed((count) => count + 1);
          }}
        />
      )}
    </Page>
  );
}
