import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SKIP_RULE } from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { useAppServices } from '../app-services.ts';
import { pathTo } from '../paths.ts';
import { stepName } from './labels.ts';

/**
 * The way out of step 4 (D-094): after many translations without passing,
 * the learner may go on to step 5, the notion staying "to consolidate".
 * Offered, never imposed; the rule is checked again when it is stored.
 */
export function SkipToProduce({ notionId }: { readonly notionId: NotionId }) {
  const { path } = useAppServices();
  const navigate = useNavigate();
  const [state, setState] = useState<'idle' | 'saving' | 'failed'>('idle');
  return (
    <Notice title="Envie de passer à la suite ?">
      <p>
        {`Tu as déjà fait au moins ${String(SKIP_RULE.minAnswers)} traductions de cette étape. Tu peux continuer ici, ou passer à l’étape « ${stepName(5)} » : la notion restera « à consolider », et le Thème et tes cartes la feront revenir.`}
      </p>
      {state === 'failed' ? (
        <p role="status">Non enregistré : le stockage du téléphone est peut-être plein.</p>
      ) : null}
      <div className="button-row">
        <Button
          variant="secondary"
          disabled={state === 'saving'}
          onClick={() => {
            setState('saving');
            path.skipToProduce(notionId).then(
              (outcome) => {
                if (outcome.transition === null) {
                  setState('idle');
                  return;
                }
                void navigate(pathTo.produce(notionId));
              },
              () => {
                setState('failed');
              },
            );
          }}
        >
          {`Passer à l’étape « ${stepName(5)} »`}
        </Button>
      </div>
    </Notice>
  );
}
