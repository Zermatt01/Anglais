import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AiRunResult } from '../../services/ai-client/ai-client.ts';
import { createTestServices, renderApp } from '../../test/render.tsx';
import { usageFigures } from './figures.ts';
import {
  createFakeServer,
  TEST_ACCOUNT,
  TEST_USAGE,
  type FakeServerOptions,
} from '../../test/server.ts';

async function openUsage(options: FakeServerOptions | null = {}, online = true) {
  const fake = options === null ? null : createFakeServer({ account: TEST_ACCOUNT, ...options });
  const services = await createTestServices({
    server: fake?.server ?? null,
    isOnline: () => online,
  });
  await renderApp('/consommation', services);
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Consommation' }),
  ).toBeInTheDocument();
  return { fake, services };
}

describe('"Consommation" screen (COST-08)', () => {
  it('says when the AI is not configured', async () => {
    await openUsage(null);
    expect(screen.getByText(/L’IA n’est pas configurée/)).toBeInTheDocument();
  });

  it('asks to sign in first', async () => {
    await openUsage({ account: null });
    expect(await screen.findByText(/Connecte-toi pour voir la consommation/)).toBeInTheDocument();
  });

  it('shows the spending of the month, of the day and by function, without calling the model', async () => {
    const { fake, services } = await openUsage();
    expect(await screen.findByText('1,25 USD')).toBeInTheDocument();
    expect(screen.getByText(/sur un plafond de 10 USD/)).toBeInTheDocument();
    expect(screen.getByText(/repart de zéro le 1er octobre/)).toBeInTheDocument();
    expect(screen.getByText('Aujourd’hui : 0,0004 USD.')).toBeInTheDocument();
    expect(screen.getByText('Test de connexion')).toBeInTheDocument();
    expect(screen.getByText('3 appels')).toBeInTheDocument();
    // Opening the screen reads the log; it never calls the model (COST-01).
    expect(fake?.calls.usage).toBe(1);
    expect(fake?.calls.run).toEqual([]);
    expect(await services.usage.load()).toMatchObject({ monthUsd: 1.25, monthlyBudgetUsd: 10 });
  });

  it('shows the last known figures, with their date, without network', async () => {
    const fake = createFakeServer({ account: TEST_ACCOUNT });
    const services = await createTestServices({ server: fake.server, isOnline: () => false });
    await services.usage.save(usageFigures(TEST_USAGE), services.clock.now());
    await renderApp('/consommation', services);

    expect(await screen.findByText(/\(hors connexion\)/)).toBeInTheDocument();
    expect(screen.getByText('1,25 USD')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tester la connexion' })).toBeDisabled();
    expect(fake.calls.usage).toBe(0);
  });

  it('tests the connection to the AI only when asked, once per touch', async () => {
    let answer: (result: AiRunResult<'connection-check'>) => void = () => undefined;
    const { fake } = await openUsage({
      run: () =>
        new Promise((resolve) => {
          answer = resolve;
        }),
    });
    await screen.findByText('1,25 USD');
    expect(fake?.calls.run).toEqual([]);

    const button = screen.getByRole('button', { name: 'Tester la connexion' });
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: 'Test en cours…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Test en cours…' }));
    expect(fake?.calls.run).toEqual(['connection-check']);

    answer({
      ok: true,
      output: { status: 'ok' },
      costUsd: 0.00013,
      model: 'claude-haiku-4-5-20251001',
      promptVersion: 'connection-check@1',
    });
    expect(await screen.findByText('La connexion à l’IA fonctionne')).toBeInTheDocument();
    expect(screen.getByText('Coût de ce test : 0,0001 USD.')).toBeInTheDocument();
    // The figures are read again afterwards (still no model call).
    await waitFor(() => {
      expect(fake?.calls.usage).toBe(2);
    });
  });

  it('explains a refused test clearly (COST-06)', async () => {
    await openUsage({
      run: () =>
        Promise.resolve({
          ok: false,
          error: {
            code: 'budget_exceeded',
            budget: { usedUsd: 9.87, limitUsd: 10, resetsOn: '2026-10-01' },
          },
        }),
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Tester la connexion' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Plafond mensuel de 10 USD atteint (9,87 USD utilisés). Les fonctions IA reprendront le 1er octobre.',
    );
  });

  it('reports figures that could not be read', async () => {
    await openUsage({
      usage: () => Promise.resolve({ ok: false, error: { code: 'server_error' } }),
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(/vérifie ses secrets/);
  });
});
