import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { UsageSnapshot } from '../../data/schemas/local.ts';
import type { AiClientError } from '../../services/ai-client/ai-client.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { formatCap, formatDay, formatUsd } from '../ai/format.ts';
import { usageFigures } from './figures.ts';
import { aiErrorMessage } from '../ai/messages.ts';
import { useAppServices, type ServerServices } from '../app-services.ts';
import { countOf, formatDateTime } from '../dates.ts';
import { PATHS } from '../paths.ts';
import { useOnline } from '../use-online.ts';
import { useAccount } from '../sync/use-sync.ts';
import { usePageTitle } from '../use-page-title.ts';

/** Names of the AI tasks, as the learner reads them. */
const TASK_LABELS: Readonly<Record<string, string>> = {
  'connection-check': 'Test de connexion',
  'correct-production': 'Corrections',
  'check-card-answer': 'Vérification de réponses',
  'classify-sounds': 'Sons à travailler',
  'generate-exercises': 'Exercices générés',
  diagnose: 'Diagnostic',
  'recalibrate-level': 'Recalibrage du niveau',
  'review-email': 'Révision d’e-mails',
  'interview-turn': 'Simulation d’entretien',
};

function timeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

type Refresh =
  | { readonly state: 'idle' | 'loading' }
  | { readonly state: 'failed'; readonly error: AiClientError };

function UsageFigures({ snapshot }: { readonly snapshot: UsageSnapshot }) {
  const share = snapshot.monthlyBudgetUsd > 0 ? snapshot.monthUsd / snapshot.monthlyBudgetUsd : 1;
  return (
    <>
      <Sheet title="Ce mois-ci">
        <p>
          <strong>{formatUsd(snapshot.monthUsd)}</strong> sur un plafond de{' '}
          {formatCap(snapshot.monthlyBudgetUsd)}.
        </p>
        <meter
          className="usage-meter"
          min={0}
          max={1}
          low={0.5}
          high={0.8}
          optimum={0}
          value={Math.min(share, 1)}
          aria-label="Part du plafond mensuel utilisée"
        />
        <p className="muted">
          Le plafond repart de zéro le {formatDay(snapshot.resetsOn)}. Au-delà, les fonctions IA
          s’arrêtent ; tout le reste de l’application continue.
        </p>
        <p>Aujourd’hui : {formatUsd(snapshot.todayUsd)}.</p>
      </Sheet>
      <Sheet title="Par fonction">
        {snapshot.byTask.length === 0 ? (
          <p className="muted">Aucun appel à l’IA ce mois-ci.</p>
        ) : (
          <ul className="plain-list">
            {snapshot.byTask.map((entry) => (
              <li key={entry.task} className="plain-list__item">
                <span className="plain-list__text">
                  <span>{TASK_LABELS[entry.task] ?? entry.task}</span>
                  <span className="muted">{countOf(entry.calls, 'appel', 'appels')}</span>
                </span>
                <span>{formatUsd(entry.costUsd)}</span>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </>
  );
}

type Check =
  | { readonly state: 'idle' | 'running' }
  | { readonly state: 'done'; readonly costUsd: number }
  | { readonly state: 'failed'; readonly error: AiClientError };

/**
 * The only AI call of this screen: made when the learner touches the button,
 * never on its own (COST-01).
 */
function ConnectionCheck({
  server,
  online,
  onDone,
}: {
  readonly server: ServerServices;
  readonly online: boolean;
  readonly onDone: () => void;
}) {
  const [check, setCheck] = useState<Check>({ state: 'idle' });

  async function run() {
    setCheck({ state: 'running' });
    // One identifier per touch: the same request is never counted twice.
    const result = await server.ai.run('connection-check', {}, crypto.randomUUID());
    setCheck(
      result.ok
        ? { state: 'done', costUsd: result.costUsd }
        : { state: 'failed', error: result.error },
    );
    onDone();
  }

  return (
    <Sheet title="Tester la connexion à l’IA">
      <p className="muted">
        Envoie une très courte demande au modèle le plus économique pour vérifier toute la chaîne :
        compte, clé, crédit et plafond. Coût : moins d’un millième de dollar.
      </p>
      <div className="button-row">
        <Button
          disabled={!online || check.state === 'running'}
          onClick={() => {
            void run();
          }}
        >
          {check.state === 'running' ? 'Test en cours…' : 'Tester la connexion'}
        </Button>
      </div>
      {online ? null : <p className="muted">Connexion nécessaire pour ce test.</p>}
      {check.state === 'done' ? (
        <Notice tone="success" title="La connexion à l’IA fonctionne">
          <p>Coût de ce test : {formatUsd(check.costUsd)}.</p>
        </Notice>
      ) : null}
      {check.state === 'failed' ? (
        <Notice tone="error" title="Le test n’a pas abouti">
          <p>{aiErrorMessage(check.error)}</p>
        </Notice>
      ) : null}
    </Sheet>
  );
}

function SignedInUsage({ server }: { readonly server: ServerServices }) {
  const { usage, clock } = useAppServices();
  const snapshot = useLiveQuery(() => usage.load(), [usage]);
  const online = useOnline();
  const [refresh, setRefresh] = useState<Refresh>({ state: online ? 'loading' : 'idle' });

  // Reads the call log: no model is called (COST-01).
  // Reads the call log and keeps a copy for offline display: no model is called (COST-01).
  const load = useCallback(async (): Promise<Refresh> => {
    const result = await server.ai.usage(timeZone());
    if (!result.ok) return { state: 'failed', error: result.error };
    await usage.save(usageFigures(result.usage), clock.now());
    return { state: 'idle' };
  }, [server, usage, clock]);

  const reload = () => {
    setRefresh({ state: 'loading' });
    void load().then(setRefresh);
  };

  // When the screen opens, and when the network comes back.
  useEffect(() => {
    if (!online) return;
    let active = true;
    void load().then((next) => {
      if (active) setRefresh(next);
    });
    return () => {
      active = false;
    };
  }, [online, load]);

  return (
    <>
      {snapshot === undefined ? null : snapshot === null ? (
        <p className="muted" role="status">
          {refresh.state === 'loading'
            ? 'Chargement de la consommation…'
            : 'Aucune donnée pour le moment.'}
        </p>
      ) : (
        <>
          <p className="muted" role="status">
            {refresh.state === 'loading'
              ? 'Mise à jour…'
              : `Mis à jour le ${formatDateTime(snapshot.fetchedAt)}${online ? '' : ' (hors connexion)'}.`}
          </p>
          <UsageFigures snapshot={snapshot} />
        </>
      )}
      {refresh.state === 'failed' ? (
        <Notice tone="error" title="Consommation non mise à jour">
          <p>{aiErrorMessage(refresh.error)}</p>
        </Notice>
      ) : null}
      <div className="button-row">
        <Button
          variant="secondary"
          disabled={!online || refresh.state === 'loading'}
          onClick={reload}
        >
          Actualiser
        </Button>
      </div>
      <ConnectionCheck server={server} online={online} onDone={reload} />
    </>
  );
}

/** "Consommation" screen (COST-08): the cost of the AI, today and this month. */
export function UsagePage() {
  usePageTitle('Consommation');
  const { server } = useAppServices();
  const account = useAccount(server);

  return (
    <Page title="Consommation" subtitle="Coût des fonctions d’IA">
      {server === null ? (
        <Notice title="IA non configurée">
          <p>
            L’IA n’est pas configurée dans cette version de l’application. Tout le reste fonctionne.
          </p>
        </Notice>
      ) : account.status === 'loading' ? (
        <p className="muted" role="status">
          Vérification du compte…
        </p>
      ) : account.account === null ? (
        <Notice title="Connexion nécessaire">
          <p>Connecte-toi pour voir la consommation de l’IA.</p>
          <div className="button-row">
            <Link className="button button--secondary" to={PATHS.settings}>
              Ouvrir les réglages
            </Link>
          </div>
        </Notice>
      ) : (
        <SignedInUsage server={server} />
      )}
    </Page>
  );
}
