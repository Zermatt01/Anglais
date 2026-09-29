import { describe, expect, it } from 'vitest';
import type { PushResult, RemoteRow, SyncTransport } from '../../data/sync/protocol.ts';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createFakeServer, TEST_ACCOUNT } from '../../test/server.ts';
import { createSyncController, type SyncStatus } from './sync-controller.ts';

/** A server with nothing to send back, that counts the pushes and pulls. */
function emptyTransport() {
  const calls = { push: 0, pull: 0 };
  const transport: SyncTransport = {
    push() {
      calls.push += 1;
      return Promise.resolve<PushResult>({ stale: [] });
    },
    pull() {
      calls.pull += 1;
      return Promise.resolve<RemoteRow[]>([]);
    },
  };
  return { transport, calls };
}

async function controllerWith(
  options: {
    signedIn?: boolean;
    online?: boolean;
    transport?: SyncTransport;
  } = {},
) {
  const db = await createTestDatabase();
  const { server } = createFakeServer({
    account: options.signedIn === false ? null : TEST_ACCOUNT,
  });
  const empty = emptyTransport();
  const controller = createSyncController({
    db,
    clock: createTestClock(),
    account: server.account,
    transport: options.transport ?? empty.transport,
    isOnline: () => options.online ?? true,
  });
  const statuses: SyncStatus['kind'][] = [];
  controller.subscribe(() => statuses.push(controller.getState().status.kind));
  return { controller, calls: empty.calls, statuses };
}

describe('createSyncController', () => {
  it('synchronizes the signed-in account and keeps the report', async () => {
    const { controller, calls, statuses } = await controllerWith();
    await controller.request();
    expect(calls.pull).toBe(1);
    expect(statuses).toEqual(['running', 'idle']);
    expect(controller.getState().lastReport).toMatchObject({ complete: true });
  });

  it('does nothing without an account', async () => {
    const { controller, calls } = await controllerWith({ signedIn: false });
    await controller.request();
    expect(calls).toEqual({ push: 0, pull: 0 });
    expect(controller.getState().status.kind).toBe('idle');
  });

  it('waits for the network without trying', async () => {
    const { controller, calls } = await controllerWith({ online: false });
    await controller.request();
    expect(calls).toEqual({ push: 0, pull: 0 });
    expect(controller.getState().status.kind).toBe('offline');
  });

  it('reports a failure without throwing', async () => {
    const failing: SyncTransport = {
      push: () => Promise.reject(new Error('down')),
      pull: () => Promise.reject(new Error('down')),
    };
    const { controller } = await controllerWith({ transport: failing });
    await expect(controller.request()).resolves.toBeUndefined();
    expect(controller.getState().status.kind).toBe('failed');
  });

  it('never runs two synchronizations at once, and runs once more after a request made during one', async () => {
    let running = 0;
    let maxRunning = 0;
    let pulls = 0;
    const slow: SyncTransport = {
      push: () => Promise.resolve({ stale: [] }),
      async pull() {
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        pulls += 1;
        await new Promise((resolve) => setTimeout(resolve, 5));
        running -= 1;
        return [];
      },
    };
    const { controller } = await controllerWith({ transport: slow });
    await Promise.all([controller.request(), controller.request(), controller.request()]);
    expect(maxRunning).toBe(1);
    // The requests made during the first synchronization are merged into one more.
    expect(pulls).toBe(2);
  });
});
