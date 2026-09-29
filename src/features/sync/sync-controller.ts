/**
 * Runs the synchronization (docs/ARCHITECTURE.md §7) one at a time, and
 * exposes its state to the screens. Triggers: opening the app, the return
 * of the network, five seconds after the last write, the "Synchroniser"
 * button (use-auto-sync.ts). The synchronization never calls the AI (COST-01).
 */
import type { AppDatabase } from '../../data/database.ts';
import { synchronize, type SyncReport } from '../../data/sync/engine.ts';
import type { SyncTransport } from '../../data/sync/protocol.ts';
import type { Clock } from '../../domain/primitives.ts';
import type { AccountService } from '../../services/backend/account.ts';

export type SyncStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'running' }
  /** `offline`: no network; `failed`: the server did not answer as expected. */
  | { readonly kind: 'offline' }
  | { readonly kind: 'failed' };

export interface SyncState {
  readonly status: SyncStatus;
  /** Report of the last synchronization that went through. */
  readonly lastReport: SyncReport | null;
}

export interface SyncController {
  getState(): SyncState;
  subscribe(listener: () => void): () => void;
  /**
   * Synchronizes now, or once more after the synchronization in progress.
   * Never throws: failures are in the state.
   */
  request(): Promise<void>;
}

export interface SyncControllerOptions {
  readonly db: AppDatabase;
  readonly clock: Clock;
  readonly account: AccountService;
  readonly transport: SyncTransport;
  readonly isOnline?: () => boolean;
}

export function createSyncController(options: SyncControllerOptions): SyncController {
  const { db, clock, account, transport, isOnline = () => navigator.onLine } = options;
  const listeners = new Set<() => void>();
  let state: SyncState = { status: { kind: 'idle' }, lastReport: null };
  let running: Promise<void> | null = null;
  /** A request arrived during the synchronization in progress. */
  let again = false;
  const takeAgain = () => {
    const value = again;
    again = false;
    return value;
  };

  function set(next: Partial<SyncState>): void {
    state = { ...state, ...next };
    for (const listener of listeners) listener();
  }

  async function runOnce(): Promise<void> {
    const signedIn = await account.current();
    if (signedIn === null) {
      set({ status: { kind: 'idle' } });
      return;
    }
    if (!isOnline()) {
      set({ status: { kind: 'offline' } });
      return;
    }
    set({ status: { kind: 'running' } });
    try {
      const report = await synchronize(db, transport, { accountId: signedIn.userId, clock });
      set({ status: { kind: 'idle' }, lastReport: report });
    } catch (error) {
      // Names only: a message could quote data.
      console.warn('Synchronization failed:', error instanceof Error ? error.name : 'unknown');
      set({ status: isOnline() ? { kind: 'failed' } : { kind: 'offline' } });
    }
  }

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    request() {
      if (running !== null) {
        again = true;
        return running;
      }
      running = (async () => {
        do {
          await runOnce();
        } while (takeAgain());
      })().finally(() => {
        running = null;
      });
      return running;
    },
  };
}
