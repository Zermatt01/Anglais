/**
 * Fake server services for component tests: an account that signs in with
 * any six-digit code, a synchronization that only counts its requests, and
 * an AI client whose answers each test chooses. Nothing leaves the test.
 */
import type { AiUsage } from '../../shared/ai/protocol.ts';
import type { AiTaskName } from '../../shared/ai/tasks.ts';
import type { ServerServices } from '../features/app-services.ts';
import type { SyncController, SyncState } from '../features/sync/sync-controller.ts';
import type { AiClient, AiRunResult, AiUsageResult } from '../services/ai-client/ai-client.ts';
import type { Account, AccountResult, AccountService } from '../services/backend/account.ts';

export const TEST_ACCOUNT: Account = {
  userId: '6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f',
  email: 'learner@example.test',
};

export const TEST_USAGE: AiUsage = {
  ok: true,
  monthlyBudgetUsd: 10,
  monthStart: '2026-09-01',
  resetsOn: '2026-10-01',
  monthUsd: 1.25,
  todayUsd: 0.0004,
  timeZone: 'Europe/Paris',
  byTask: [{ task: 'connection-check', calls: 3, costUsd: 0.0012 }],
};

export interface FakeServerOptions {
  readonly account?: Account | null;
  readonly sendCode?: (email: string) => AccountResult;
  readonly verifyCode?: (email: string, code: string) => AccountResult;
  /** Answer of the AI; by default, the connection check succeeds. */
  readonly run?: (task: AiTaskName, input: unknown) => Promise<AiRunResult<AiTaskName>>;
  readonly usage?: () => Promise<AiUsageResult>;
  readonly syncState?: SyncState;
}

export interface FakeServer {
  readonly server: ServerServices;
  readonly calls: {
    readonly sendCode: string[];
    readonly verifyCode: [string, string][];
    signOut: number;
    syncRequests: number;
    readonly run: string[];
    usage: number;
  };
}

export function createFakeServer(options: FakeServerOptions = {}): FakeServer {
  let current = options.account ?? null;
  const accountListeners = new Set<(account: Account | null) => void>();
  const notify = () => {
    for (const listener of accountListeners) listener(current);
  };
  const calls: FakeServer['calls'] = {
    sendCode: [],
    verifyCode: [],
    signOut: 0,
    syncRequests: 0,
    run: [],
    usage: 0,
  };

  const account: AccountService = {
    current: () => Promise.resolve(current),
    subscribe(listener) {
      accountListeners.add(listener);
      return () => {
        accountListeners.delete(listener);
      };
    },
    sendCode(email) {
      calls.sendCode.push(email);
      return Promise.resolve(options.sendCode?.(email) ?? { ok: true });
    },
    verifyCode(email, code) {
      calls.verifyCode.push([email, code]);
      const result = options.verifyCode?.(email, code) ?? { ok: true };
      if (result.ok) {
        current = { userId: TEST_ACCOUNT.userId, email };
        notify();
      }
      return Promise.resolve(result);
    },
    signOut() {
      calls.signOut += 1;
      current = null;
      notify();
      return Promise.resolve();
    },
    accessToken: () => Promise.resolve(current === null ? null : 'session-token'),
  };

  const state = options.syncState ?? { status: { kind: 'idle' }, lastReport: null };
  const sync: SyncController = {
    getState: () => state,
    subscribe: () => () => undefined,
    request() {
      calls.syncRequests += 1;
      return Promise.resolve();
    },
  };

  const ai: AiClient = {
    run<Task extends AiTaskName>(task: Task, input: unknown): Promise<AiRunResult<Task>> {
      calls.run.push(task);
      const result =
        options.run?.(task, input) ??
        Promise.resolve({
          ok: true,
          output: { status: 'ok' },
          costUsd: 0.00013,
          model: 'claude-haiku-4-5-20251001',
          promptVersion: 'connection-check@1',
        });
      // Safe in tests: each test answers with the output of the task it runs.
      return result as Promise<AiRunResult<Task>>;
    },
    usage() {
      calls.usage += 1;
      return options.usage?.() ?? Promise.resolve({ ok: true, usage: TEST_USAGE });
    },
  };

  return { server: { account, sync, ai }, calls };
}
