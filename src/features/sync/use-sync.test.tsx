import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppServicesContext } from '../app-services.ts';
import { createTestServices, renderApp } from '../../test/render.tsx';
import { createFakeServer, TEST_ACCOUNT } from '../../test/server.ts';
import { SYNC_DELAY_AFTER_WRITE_MS, useAutoSync } from './use-sync.ts';

function AutoSync({ delayMs }: { readonly delayMs: number }) {
  useAutoSync(delayMs);
  return null;
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

async function openApp(signedIn = true) {
  const fake = createFakeServer({ account: signedIn ? TEST_ACCOUNT : null });
  const services = await createTestServices({ server: fake.server });
  await renderApp('/', services);
  await screen.findByRole('heading', { level: 1, name: 'Anglais' });
  return { fake, services };
}

describe('automatic synchronization (docs/ARCHITECTURE.md §7)', () => {
  it('synchronizes when the app opens and when the network comes back', async () => {
    const { fake } = await openApp();
    await waitFor(() => {
      expect(fake.calls.syncRequests).toBeGreaterThan(0);
    });
    const before = fake.calls.syncRequests;
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(fake.calls.syncRequests).toBe(before + 1);
  });

  it('waits five seconds after the last write', () => {
    expect(SYNC_DELAY_AFTER_WRITE_MS).toBe(5_000);
  });

  it('synchronizes once, a delay after the last of several writes', async () => {
    const fake = createFakeServer({ account: TEST_ACCOUNT });
    const services = await createTestServices({ server: fake.server });
    render(
      <AppServicesContext value={services}>
        <AutoSync delayMs={400} />
      </AppServicesContext>,
    );
    await waitFor(() => {
      expect(fake.calls.syncRequests).toBeGreaterThan(0);
    });
    await wait(50);
    const before = fake.calls.syncRequests;

    await services.settings.update({ theme: 'dark' });
    await wait(100);
    await services.settings.update({ dailyGoalMinutes: 30 });
    await wait(100);
    // Less than the delay after the last write: not yet.
    expect(fake.calls.syncRequests).toBe(before);
    await waitFor(() => {
      expect(fake.calls.syncRequests).toBe(before + 1);
    });
    await wait(600);
    expect(fake.calls.syncRequests).toBe(before + 1);
  });

  it('synchronizes after a sign-in', async () => {
    const { fake } = await openApp(false);
    const before = fake.calls.syncRequests;
    await act(async () => {
      await fake.server.account.verifyCode(TEST_ACCOUNT.email, '123456');
    });
    expect(fake.calls.syncRequests).toBe(before + 1);
  });
});
