import { useState, type SyntheticEvent } from 'react';
import type { SyncReport } from '../../data/sync/engine.ts';
import type { AccountError, AccountService } from '../../services/backend/account.ts';
import { Button } from '../../ui/Button.tsx';
import { TextField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Sheet } from '../../ui/Page.tsx';
import { useAppServices, type ServerServices } from '../app-services.ts';
import { countOf, formatDateTime } from '../dates.ts';
import { useAccount, useSyncProgress, useSyncState } from '../sync/use-sync.ts';
import { useOnline } from '../use-online.ts';

const ACCOUNT_ERRORS: Readonly<Record<AccountError, string>> = {
  offline: 'Pas de connexion : réessaie quand tu seras en ligne.',
  rate_limited: 'Trop de demandes : attends une minute avant de demander un nouveau code.',
  invalid_code: 'Code incorrect ou expiré. Vérifie-le, ou demande un nouveau code.',
  unknown_account:
    'Aucun compte n’existe pour cette adresse. Le compte se crée dans le tableau de bord Supabase (voir le guide de déploiement).',
  unexpected: 'Le serveur n’a pas répondu comme prévu. Réessaie dans un moment.',
};

/** Six to ten digits: the length of the code is set in Supabase. */
const CODE_PATTERN = /^\d{6,10}$/;

type SignInStep = { readonly step: 'email' } | { readonly step: 'code'; readonly email: string };

function SignInForm({ account }: { readonly account: AccountService }) {
  const [step, setStep] = useState<SignInStep>({ step: 'email' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountError | null>(null);
  const [resent, setResent] = useState(false);

  async function sendCode(address: string) {
    setBusy(true);
    setError(null);
    const result = await account.sendCode(address);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setStep({ step: 'code', email: address });
    return true;
  }

  async function onEmail(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setResent(false);
    await sendCode(email.trim());
  }

  async function onCode(event: SyntheticEvent<HTMLFormElement>, address: string) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await account.verifyCode(address, code);
    setBusy(false);
    // On success, the account state changes and this form disappears.
    if (!result.ok) setError(result.error);
  }

  return (
    <>
      <p className="muted">
        Connecte-toi pour sauvegarder tes données sur ton compte et les retrouver sur un autre
        appareil. Tout reste utilisable sans connexion.
      </p>
      {step.step === 'email' ? (
        <form className="field" onSubmit={(event) => void onEmail(event)}>
          <TextField
            label="Adresse e-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.currentTarget.value);
            }}
          />
          <div className="button-row">
            <Button type="submit" disabled={busy || email.trim() === ''}>
              Recevoir un code
            </Button>
          </div>
        </form>
      ) : (
        <form className="field" onSubmit={(event) => void onCode(event, step.email)}>
          <p role="status">
            Un code a été envoyé à <strong>{step.email}</strong>. Il reste valable une heure.
          </p>
          <TextField
            label="Code reçu par e-mail"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            required
            value={code}
            onChange={(event) => {
              setCode(event.currentTarget.value.replace(/\s/g, ''));
            }}
          />
          <div className="button-row">
            <Button type="submit" disabled={busy || !CODE_PATTERN.test(code)}>
              Se connecter
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                void sendCode(step.email).then(setResent);
              }}
            >
              Renvoyer le code
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setStep({ step: 'email' });
                setCode('');
                setError(null);
                setResent(false);
              }}
            >
              Changer d’adresse
            </Button>
          </div>
          {resent ? <p className="status-line">Nouveau code envoyé.</p> : null}
        </form>
      )}
      {error === null ? null : (
        <Notice tone="error" title="Connexion impossible">
          <p>{ACCOUNT_ERRORS[error]}</p>
        </Notice>
      )}
    </>
  );
}

function ReportDetails({ report }: { readonly report: SyncReport }) {
  if (
    report.quarantined === 0 &&
    report.deferred === 0 &&
    report.unsent === 0 &&
    report.conflicts === 0
  ) {
    return null;
  }
  return (
    <ul className="muted">
      {report.conflicts > 0 ? (
        <li>
          {countOf(
            report.conflicts,
            'modification de ce téléphone a été remplacée',
            'modifications de ce téléphone ont été remplacées',
          )}{' '}
          par une version plus récente d’un autre appareil ; l’ancienne version est gardée à part,
          dans l’export de tes données.
        </li>
      ) : null}
      {report.quarantined > 0 ? (
        <li>
          {countOf(report.quarantined, 'élément reçu illisible', 'éléments reçus illisibles')} : mis
          de côté, et inclus dans l’export de tes données.
        </li>
      ) : null}
      {report.deferred > 0 ? (
        <li>
          {countOf(report.deferred, 'élément attend', 'éléments attendent')} une mise à jour de
          l’application pour être reçus.
        </li>
      ) : null}
      {report.unsent > 0 ? (
        <li>
          {countOf(report.unsent, 'élément illisible', 'éléments illisibles')} de ce téléphone :{' '}
          {report.unsent > 1 ? 'non envoyés, mais inclus' : 'non envoyé, mais inclus'} dans
          l’export.
        </li>
      ) : null}
    </ul>
  );
}

function SyncPanel({ server, email }: { readonly server: ServerServices; readonly email: string }) {
  const online = useOnline();
  const { status, lastReport } = useSyncState(server);
  const progress = useSyncProgress();
  const running = status.kind === 'running';
  const lastSyncAt = progress?.lastSyncAt ?? null;

  return (
    <>
      <p>
        Connecté avec <strong>{email}</strong>.
      </p>
      <div className="field">
        <p className="field__label">Synchronisation</p>
        <p className="muted" role="status">
          {running
            ? 'Synchronisation en cours…'
            : lastSyncAt === null
              ? 'Pas encore synchronisé.'
              : `Dernière synchronisation : ${formatDateTime(lastSyncAt)}.`}
          {progress !== undefined && progress.pending > 0 && !running
            ? ` ${countOf(progress.pending, 'modification en attente d’envoi', 'modifications en attente d’envoi')}.`
            : ''}
        </p>
        {status.kind === 'offline' || !online ? (
          <p className="muted">
            Hors connexion : la synchronisation reprendra au retour du réseau.
          </p>
        ) : null}
        {status.kind === 'failed' ? (
          <Notice tone="error" title="Synchronisation interrompue">
            <p>
              Tes données restent sur ce téléphone. Réessaie dans un moment ; si le problème
              continue, vérifie que le projet Supabase n’est pas en pause.
            </p>
          </Notice>
        ) : null}
        {lastReport === null ? null : <ReportDetails report={lastReport} />}
      </div>
      <div className="button-row">
        <Button
          disabled={running}
          onClick={() => {
            void server.sync.request();
          }}
        >
          Synchroniser maintenant
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            void server.account.signOut();
          }}
        >
          Se déconnecter
        </Button>
      </div>
      <p className="muted">Se déconnecter laisse toutes tes données sur ce téléphone.</p>
    </>
  );
}

/** Account and synchronization (ARC-02, ARC-03), in the settings. */
export function AccountSection() {
  const { server } = useAppServices();
  const state = useAccount(server);

  return (
    <Sheet title="Compte et synchronisation">
      {server === null ? (
        <p className="muted">
          La synchronisation n’est pas configurée dans cette version : tes données restent sur ce
          téléphone. Pense à les exporter régulièrement.
        </p>
      ) : state.status === 'loading' ? (
        <p className="muted" role="status">
          Vérification du compte…
        </p>
      ) : state.account === null ? (
        <SignInForm account={server.account} />
      ) : (
        <SyncPanel server={server} email={state.account.email} />
      )}
    </Sheet>
  );
}
