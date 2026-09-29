import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router';
import { openAppDatabase } from '../data/open.ts';
import type { Clock } from '../domain/primitives.ts';
import {
  AppServicesContext,
  createAppServices,
  type AppServices,
} from '../features/app-services.ts';
import { Button } from '../ui/Button.tsx';
import { AppRoutes } from './AppShell.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { createServerServices } from './server.ts';

const systemClock: Clock = { now: () => Date.now() };

async function openServices(): Promise<AppServices> {
  const db = await openAppDatabase({ now: systemClock.now() });
  return createAppServices(db, systemClock, { server: createServerServices(db, systemClock) });
}

type BootState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly services: AppServices }
  | { readonly status: 'failed' };

interface AppProps {
  /** Opens the database and builds the services; replaced in tests. */
  readonly open?: () => Promise<AppServices>;
}

/** Opens the local database, then shows the application. */
export function App({ open = openServices }: AppProps) {
  const [attempt, setAttempt] = useState(0);
  const [boot, setBoot] = useState<BootState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let opened: AppServices | null = null;
    open().then(
      (services) => {
        opened = services;
        if (cancelled) services.db.dexie.close();
        else setBoot({ status: 'ready', services });
      },
      (error: unknown) => {
        console.error(
          'Database could not be opened:',
          error instanceof Error ? error.name : 'unknown',
        );
        if (!cancelled) setBoot({ status: 'failed' });
      },
    );
    return () => {
      cancelled = true;
      opened?.db.dexie.close();
    };
  }, [open, attempt]);

  if (boot.status === 'loading') {
    return (
      <main className="boot-screen">
        <p role="status">Chargement…</p>
      </main>
    );
  }

  if (boot.status === 'failed') {
    return (
      <main className="boot-screen">
        <h1>Impossible d’ouvrir tes données</h1>
        <p>
          Le stockage du navigateur est peut-être plein ou bloqué (navigation privée). Rien n’a été
          modifié. Libère de la place ou quitte la navigation privée, puis réessaie.
        </p>
        <div className="button-row">
          <Button
            onClick={() => {
              setBoot({ status: 'loading' });
              setAttempt((count) => count + 1);
            }}
          >
            Réessayer
          </Button>
        </div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      <AppServicesContext value={boot.services}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppServicesContext>
    </ErrorBoundary>
  );
}
