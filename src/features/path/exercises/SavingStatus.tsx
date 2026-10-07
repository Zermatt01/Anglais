import { Button } from '../../../ui/Button.tsx';
import { Notice } from '../../../ui/Notice.tsx';
import type { AnswerSaving } from './use-answer-saving.ts';

/** While an answer is being stored, or when it could not be. */
export function SavingStatus({
  saving,
  onRetry,
}: {
  readonly saving: AnswerSaving;
  readonly onRetry: () => void;
}) {
  if (saving.state === 'saving') return <p role="status">Enregistrement de ta réponse…</p>;
  if (saving.state !== 'failed') return null;
  return (
    <>
      <Notice tone="error" title="Réponse non enregistrée">
        <p>
          Elle est gardée tant que tu restes sur cet écran. Le stockage du téléphone est peut-être
          plein : libère de la place, puis réessaie.
        </p>
      </Notice>
      <div className="button-row">
        <Button onClick={onRetry}>Réessayer</Button>
      </div>
    </>
  );
}
