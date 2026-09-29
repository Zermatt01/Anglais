import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SyncReport } from '../../data/sync/engine.ts';
import { createTestServices, renderApp } from '../../test/render.tsx';
import { createFakeServer, TEST_ACCOUNT, type FakeServerOptions } from '../../test/server.ts';

async function openSettings(options: FakeServerOptions | null = {}) {
  const fake = options === null ? null : createFakeServer(options);
  const services = await createTestServices({ server: fake?.server ?? null });
  await renderApp('/reglages', services);
  const region = await screen.findByRole('region', { name: 'Compte et synchronisation' });
  return { fake, services, section: within(region) };
}

describe('account and synchronization', () => {
  it('says that the data stays on the phone when no server is configured', async () => {
    const { section } = await openSettings(null);
    expect(section.getByText(/n’est pas configurée dans cette version/)).toBeInTheDocument();
  });

  it('signs in with a code received by e-mail', async () => {
    const { fake, section } = await openSettings({ account: null });
    const email = await section.findByRole('textbox', { name: 'Adresse e-mail' });
    fireEvent.change(email, { target: { value: ' learner@example.test ' } });
    fireEvent.click(section.getByRole('button', { name: 'Recevoir un code' }));

    const code = await section.findByRole('textbox', { name: 'Code reçu par e-mail' });
    expect(section.getByRole('status')).toHaveTextContent(
      'Un code a été envoyé à learner@example.test',
    );
    expect(fake?.calls.sendCode).toEqual(['learner@example.test']);
    const signIn = section.getByRole('button', { name: 'Se connecter' });
    expect(signIn).toBeDisabled();
    fireEvent.change(code, { target: { value: '123 456' } });
    fireEvent.click(signIn);

    expect(await section.findByText(/Connecté avec/)).toHaveTextContent(TEST_ACCOUNT.email);
    expect(fake?.calls.verifyCode).toEqual([['learner@example.test', '123456']]);
  });

  it.each([
    ['rate_limited', /attends une minute/],
    ['unknown_account', /Aucun compte n’existe pour cette adresse/],
    ['offline', /Pas de connexion/],
  ] as const)('explains a refused code request (%s)', async (error, message) => {
    const { section } = await openSettings({
      account: null,
      sendCode: () => ({ ok: false, error }),
    });
    fireEvent.change(await section.findByRole('textbox', { name: 'Adresse e-mail' }), {
      target: { value: 'learner@example.test' },
    });
    fireEvent.click(section.getByRole('button', { name: 'Recevoir un code' }));
    expect(await section.findByRole('alert')).toHaveTextContent(message);
    expect(section.getByRole('textbox', { name: 'Adresse e-mail' })).toBeInTheDocument();
  });

  it('explains a wrong code and lets the learner ask for another one', async () => {
    const { fake, section } = await openSettings({
      account: null,
      verifyCode: () => ({ ok: false, error: 'invalid_code' }),
    });
    fireEvent.change(await section.findByRole('textbox', { name: 'Adresse e-mail' }), {
      target: { value: 'learner@example.test' },
    });
    fireEvent.click(section.getByRole('button', { name: 'Recevoir un code' }));
    fireEvent.change(await section.findByRole('textbox', { name: 'Code reçu par e-mail' }), {
      target: { value: '000000' },
    });
    fireEvent.click(section.getByRole('button', { name: 'Se connecter' }));
    expect(await section.findByRole('alert')).toHaveTextContent(/Code incorrect ou expiré/);

    fireEvent.click(section.getByRole('button', { name: 'Renvoyer le code' }));
    expect(await section.findByText('Nouveau code envoyé.')).toBeInTheDocument();
    expect(fake?.calls.sendCode).toHaveLength(2);
  });

  it('shows the synchronization, synchronizes on request and signs out', async () => {
    const { fake, services, section } = await openSettings({ account: TEST_ACCOUNT });
    expect(await section.findByText(/Connecté avec/)).toHaveTextContent(TEST_ACCOUNT.email);
    expect(section.getByText(/Pas encore synchronisé/)).toBeInTheDocument();

    await services.settings.update({ theme: 'dark' });
    expect(await section.findByText(/1 modification en attente d’envoi/)).toBeInTheDocument();

    const requestsBefore = fake?.calls.syncRequests ?? 0;
    fireEvent.click(section.getByRole('button', { name: 'Synchroniser maintenant' }));
    expect(fake?.calls.syncRequests).toBe(requestsBefore + 1);

    fireEvent.click(section.getByRole('button', { name: 'Se déconnecter' }));
    expect(await section.findByRole('textbox', { name: 'Adresse e-mail' })).toBeInTheDocument();
    // Signing out keeps every local record.
    expect((await services.settings.load()).values.theme).toBe('dark');
  });

  it('reports what the last synchronization could not apply', async () => {
    const report: SyncReport = {
      applied: 3,
      kept: 0,
      quarantined: 1,
      deferred: 2,
      conflicts: 1,
      sent: 1,
      received: 6,
      unsent: 0,
      complete: true,
    };
    const { section } = await openSettings({
      account: TEST_ACCOUNT,
      syncState: { status: { kind: 'failed' }, lastReport: report },
    });
    expect(await section.findByRole('alert')).toHaveTextContent(
      /Tes données restent sur ce téléphone/,
    );
    expect(section.getByText(/1 élément reçu illisible/)).toBeInTheDocument();
    expect(section.getByText(/2 éléments attendent une mise à jour/)).toBeInTheDocument();
    expect(
      section.getByText(
        /1 modification de ce téléphone a été remplacée par une version plus récente/,
      ),
    ).toBeInTheDocument();
  });
});
