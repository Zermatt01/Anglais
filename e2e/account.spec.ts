import { expect, test } from './fixtures.ts';
import { LEARNER_EMAIL, mockSupabase, signIn } from './supabase-mock.ts';

// The service worker is not needed here, and requests it would handle
// could escape the routes of the fake server.
test.use({ serviceWorkers: 'block' });

const T0 = Date.UTC(2026, 8, 29, 8, 0, 0);

test('signs in with a code received by e-mail, then sends the local changes', async ({ page }) => {
  const mock = await mockSupabase(page);
  await page.goto('/reglages');
  // Written before any account exists: sent by the first synchronization (D-045).
  await page.getByRole('radio', { name: 'Sombre' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await signIn(page);
  expect(mock.codeRequests).toEqual([
    expect.objectContaining({ email: LEARNER_EMAIL, create_user: false }),
  ]);

  await expect(page.getByText(/Dernière synchronisation/)).toBeVisible();
  const documents = mock.pushes.flatMap((push) => push.p_documents);
  expect(documents).toContainEqual(
    expect.objectContaining({
      collection: 'settings',
      id: 'settings',
      doc: expect.objectContaining({ theme: 'dark' }),
    }),
  );
  // Requests carry the session and the publishable key only.
  for (const headers of mock.headers) {
    expect(headers.authorization).toMatch(/^Bearer /);
    expect(headers.apikey).toBe('sb_publishable_e2e');
  }
  expect(mock.unexpected).toEqual([]);
});

test('applies the changes made on another device', async ({ page }) => {
  const mock = await mockSupabase(page, {
    pulled: [
      {
        kind: 'document',
        collection: 'settings',
        id: 'settings',
        doc: {
          id: 'settings',
          createdAt: T0,
          updatedAt: T0,
          deletedAt: null,
          schemaVersion: 1,
          englishVariant: 'en-US',
          speech: { voiceUri: null, rate: 1 },
          dailyGoalMinutes: 25,
          newCardsPerDay: 10,
          reviewsPerDay: 60,
          selfCorrection: true,
          emailSessionsPerWeek: 1,
          theme: 'dark',
          learnerProfile: { domains: ['finance'], remarks: '' },
        },
        schema_version: 1,
        updated_at: T0,
        deleted: false,
        server_seq: 7,
      },
    ],
  });
  await signIn(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('radio', { name: 'Américain' })).toBeChecked();
  expect(mock.unexpected).toEqual([]);
});

test('keeps working without network, and says so', async ({ page, context }) => {
  const mock = await mockSupabase(page);
  await signIn(page);
  await expect(page.getByText(/Dernière synchronisation/)).toBeVisible();
  const pushes = mock.pushes.length;

  await context.setOffline(true);
  await page.getByRole('radio', { name: 'Clair' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByText(/1 modification en attente d’envoi/)).toBeVisible();
  await expect(page.getByText(/Hors connexion : la synchronisation reprendra/)).toBeVisible();
  expect(mock.pushes).toHaveLength(pushes);

  await context.setOffline(false);
  // The pending count is hidden while a synchronization runs: wait for the push itself.
  await expect.poll(() => mock.pushes.length).toBeGreaterThan(pushes);
  await expect(page.getByText(/Dernière synchronisation/)).toBeVisible();
  await expect(page.getByText(/en attente d’envoi/)).toHaveCount(0);
  const sent = mock.pushes.flatMap((push) => push.p_documents);
  expect(sent).toContainEqual(
    expect.objectContaining({ doc: expect.objectContaining({ theme: 'light' }) }),
  );
});

test('shows the usage without calling the model, and tests the AI on request only', async ({
  page,
}) => {
  const mock = await mockSupabase(page, {
    usage: {
      ok: true,
      monthlyBudgetUsd: 10,
      monthStart: '2026-09-01',
      resetsOn: '2026-10-01',
      monthUsd: 1.25,
      todayUsd: 0.0004,
      timeZone: 'Europe/Paris',
      byTask: [{ task: 'connection-check', calls: 3, costUsd: 0.0012 }],
    },
    ai: (body) => ({
      ok: true,
      requestId:
        typeof body === 'object' && body !== null && 'requestId' in body ? body.requestId : null,
      task: 'connection-check',
      model: 'claude-haiku-4-5-20251001',
      promptVersion: 'connection-check@1',
      costUsd: 0.00013,
      output: { status: 'ok' },
    }),
  });
  await signIn(page);
  await page.getByRole('link', { name: 'Voir la consommation' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Consommation' })).toBeVisible();
  await expect(page.getByText('1,25 USD')).toBeVisible();
  await expect(page.getByText(/repart de zéro le 1er octobre/)).toBeVisible();
  // Opening the screen never calls the model (COST-01).
  expect(mock.aiCalls).toEqual([]);

  await page.getByRole('button', { name: 'Tester la connexion' }).click();
  await expect(page.getByText('La connexion à l’IA fonctionne')).toBeVisible();
  expect(mock.aiCalls).toEqual([
    { task: 'connection-check', input: {}, requestId: expect.any(String) as unknown },
  ]);
  expect(mock.unexpected).toEqual([]);
});
