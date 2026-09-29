/** React side of the account and of the synchronization. */
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { readLastSyncAt } from '../../data/sync/meta.ts';
import { countPending, lastPendingSeq } from '../../data/sync/outbox.ts';
import type { Account } from '../../services/backend/account.ts';
import { useAppServices, type ServerServices } from '../app-services.ts';
import type { SyncState } from './sync-controller.ts';

/** Delay after the last write before synchronizing (docs/ARCHITECTURE.md §7). */
export const SYNC_DELAY_AFTER_WRITE_MS = 5_000;

export type AccountState =
  { readonly status: 'loading' } | { readonly status: 'ready'; readonly account: Account | null };

/** The signed-in account, kept up to date. */
export function useAccount(server: ServerServices | null): AccountState {
  const [state, setState] = useState<AccountState>({ status: 'loading' });
  useEffect(() => {
    if (server === null) return;
    let active = true;
    void server.account.current().then((account) => {
      if (active) setState({ status: 'ready', account });
    });
    const unsubscribe = server.account.subscribe((account) => {
      if (active) setState({ status: 'ready', account });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [server]);
  return server === null ? { status: 'ready', account: null } : state;
}

const IDLE: SyncState = { status: { kind: 'idle' }, lastReport: null };

/** State of the synchronization in progress, and of the last one. */
export function useSyncState(server: ServerServices | null): SyncState {
  const subscribe = useCallback(
    (listener: () => void) => (server === null ? () => undefined : server.sync.subscribe(listener)),
    [server],
  );
  const getState = useCallback(() => (server === null ? IDLE : server.sync.getState()), [server]);
  return useSyncExternalStore(subscribe, getState);
}

/** Records waiting to be sent, and the end of the last complete synchronization. */
export function useSyncProgress(): { pending: number; lastSyncAt: number | null } | undefined {
  const { db } = useAppServices();
  return useLiveQuery(
    async () => ({ pending: await countPending(db), lastSyncAt: await readLastSyncAt(db) }),
    [db],
  );
}

/**
 * Synchronizes at the right moments (docs/ARCHITECTURE.md §7): when the app
 * opens, at sign-in, when the network comes back, and five seconds after the
 * last write. Mounted once, by the shell; tests may shorten the delay.
 */
export function useAutoSync(delayAfterWriteMs = SYNC_DELAY_AFTER_WRITE_MS): void {
  const { db, server } = useAppServices();
  const lastSeq = useLiveQuery(() => lastPendingSeq(db), [db]);
  const signedInAs = useRef<string | null>(null);

  useEffect(() => {
    if (server === null) return;
    const request = () => {
      void server.sync.request();
    };
    request();
    window.addEventListener('online', request);
    const unsubscribe = server.account.subscribe((account) => {
      // A new sign-in, not a token refresh of the same session.
      const userId = account?.userId ?? null;
      if (userId !== null && userId !== signedInAs.current) request();
      signedInAs.current = userId;
    });
    return () => {
      window.removeEventListener('online', request);
      unsubscribe();
    };
  }, [server]);

  useEffect(() => {
    if (server === null || lastSeq === undefined || lastSeq === null) return;
    const timer = setTimeout(() => {
      void server.sync.request();
    }, delayAfterWriteMs);
    return () => {
      clearTimeout(timer);
    };
  }, [server, lastSeq, delayAfterWriteMs]);
}
