import { Link } from 'react-router';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { formatUsd } from '../ai/format.ts';
import { aiErrorMessage } from '../ai/messages.ts';
import { PATHS } from '../paths.ts';
import { useOnline } from '../use-online.ts';
import { CORRECTION_MAX_COST_USD } from './request.ts';
import type { CorrectionRun } from './use-correction.ts';

interface CorrectionActionProps {
  readonly run: CorrectionRun;
  /** An action is being sent (`useCorrection().sending`): the button waits. */
  readonly sending?: boolean;
  /** False without a server: the AI cannot be used on this device. */
  readonly available: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly onCorrect: () => void;
}

/**
 * The "Corriger" button (COST-01): its highest cost is shown before, the
 * actual cost after; it is inactive offline, where the text stays stored
 * (docs/ARCHITECTURE.md §8).
 */
export function CorrectionAction({
  run,
  sending = false,
  available,
  disabled = false,
  label = 'Corriger avec l’IA',
  onCorrect,
}: CorrectionActionProps) {
  const online = useOnline();
  if (!available) {
    return (
      <p className="muted">
        La correction par l’IA demande un compte connecté (voir les{' '}
        <Link to={PATHS.settings}>Réglages</Link>). Ton texte est enregistré sur ce téléphone.
      </p>
    );
  }
  return (
    <>
      {run.state === 'failed' ? (
        <Notice tone="error" title="Correction non reçue">
          <p>{aiErrorMessage(run.error)}</p>
          <p>Ton texte est enregistré : tu peux réessayer.</p>
        </Notice>
      ) : null}
      {run.state === 'not-saved' ? (
        <Notice tone="error" title="Correction non enregistrée">
          <p>Le stockage du téléphone est peut-être plein. Libère de la place, puis réessaie.</p>
        </Notice>
      ) : null}
      {online ? (
        <p className="muted">{`Coût : au plus ${formatUsd(CORRECTION_MAX_COST_USD)}, en général bien moins.`}</p>
      ) : (
        <p className="muted">Connexion nécessaire pour la correction. Ton texte est enregistré.</p>
      )}
      <div className="button-row">
        <Button
          disabled={disabled || !online || sending || run.state === 'running'}
          onClick={onCorrect}
        >
          {run.state === 'running' || sending
            ? 'Correction en cours…'
            : run.state === 'failed' || run.state === 'not-saved'
              ? 'Réessayer'
              : label}
        </Button>
      </div>
    </>
  );
}
