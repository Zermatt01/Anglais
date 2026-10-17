import { useState } from 'react';
import type { NotionCardContent } from '../../domain/cards/content.ts';
import { Button } from '../../ui/Button.tsx';
import { useAppServices } from '../app-services.ts';

type State = 'idle' | 'saving' | 'added' | 'present' | 'failed';

const MESSAGES: Readonly<Record<Exclude<State, 'idle' | 'saving'>, string>> = {
  added: 'Ajoutée à tes Reprises.',
  present: 'Cette phrase est déjà dans tes Reprises.',
  failed: 'Non ajoutée : le stockage du téléphone est peut-être plein.',
};

/**
 * "Revoir cette phrase dans mes Reprises" (D-092): after a failure that made
 * no card, the learner keeps the reviewed sentence as a card, on request. It
 * is held back while its notion is not studied, as the stored progress says
 * (D-025, D-096).
 */
export function KeepForReview({ card }: { readonly card: NotionCardContent | null }) {
  const { cards } = useAppServices();
  const [state, setState] = useState<State>('idle');
  const [heldBack, setHeldBack] = useState(false);
  if (card === null) return null;
  if (state !== 'idle' && state !== 'saving') {
    return (
      <p role="status" className="muted">
        {state === 'added' && heldBack
          ? 'Ajoutée à tes Reprises : elle attendra que tu étudies sa notion.'
          : MESSAGES[state]}
      </p>
    );
  }
  return (
    <div className="button-row">
      <Button
        variant="secondary"
        disabled={state === 'saving'}
        onClick={() => {
          setState('saving');
          cards.create({ content: card, origin: 'notion', waitForNotion: true }).then(
            (created) => {
              if (!created.ok) {
                setState('failed');
                return;
              }
              setHeldBack(created.card.suspensionReason === 'unstudied-notion');
              setState(created.created ? 'added' : 'present');
            },
            () => {
              setState('failed');
            },
          );
        }}
      >
        Revoir cette phrase dans mes Reprises
      </Button>
    </div>
  );
}
