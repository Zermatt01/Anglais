import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { createTestServices, renderApp } from '../../test/render.tsx';
import { PROFILE_REMARKS_DRAFT_KEY } from './ProfileRemarksEditor.tsx';

async function openSettings() {
  const rendered = await renderApp('/reglages');
  await screen.findByRole('radio', { name: /Britannique/ });
  return rendered;
}

function section(name: string) {
  return within(screen.getByRole('region', { name }));
}

describe('settings screen', () => {
  it('shows the defaults without storing them', async () => {
    const { services } = await openSettings();
    expect(screen.getByRole('radio', { name: /Britannique/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Automatique/ })).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Objectif quotidien' })).toHaveValue('20');
    expect(screen.getByRole('switch', { name: /Me corriger moi-même/ })).toBeChecked();
    expect(await services.db.table('settings').count()).toBe(0);
  });

  it('saves each choice as soon as it is made', async () => {
    const { services } = await openSettings();

    fireEvent.click(screen.getByRole('radio', { name: /Américain/ }));
    fireEvent.click(screen.getByRole('radio', { name: 'Sombre' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Objectif quotidien' }), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Nouvelles cartes par jour' }), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByRole('switch', { name: /Me corriger moi-même/ }));
    fireEvent.change(screen.getByRole('combobox', { name: 'E-mail guidé' }), {
      target: { value: '0' },
    });

    await waitFor(async () => {
      expect((await services.settings.load()).values).toMatchObject({
        englishVariant: 'en-US',
        theme: 'dark',
        dailyGoalMinutes: 15,
        newCardsPerDay: 5,
        selfCorrection: false,
        emailSessionsPerWeek: 0,
      });
    });
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Sombre' })).toBeChecked();
    });
  });

  it('keeps the learner domains in the order of the list', async () => {
    const { services } = await openSettings();
    const profile = section('Profil d’apprenant');
    fireEvent.click(profile.getByRole('checkbox', { name: 'Enseignement' }));
    await waitFor(async () => {
      expect((await services.settings.load()).values.learnerProfile.domains).toEqual(
        DEFAULT_SETTINGS.learnerProfile.domains.filter((domain) => domain !== 'teaching'),
      );
    });
    fireEvent.click(profile.getByRole('checkbox', { name: 'Enseignement' }));
    await waitFor(async () => {
      expect((await services.settings.load()).values.learnerProfile.domains).toEqual(
        DEFAULT_SETTINGS.learnerProfile.domains,
      );
    });
  });

  it('keeps the profile remarks as a draft until they are saved', async () => {
    const { services, unmount } = await openSettings();
    const remarks = await screen.findByRole('textbox', { name: 'Remarques libres' });
    await waitFor(() => {
      expect(remarks).toBeEnabled();
    });
    fireEvent.change(remarks, { target: { value: 'Stage en finance de marché' } });

    await waitFor(async () => {
      expect(await services.drafts.get(PROFILE_REMARKS_DRAFT_KEY)).toEqual({
        state: 'present',
        text: 'Stage en finance de marché',
      });
    });
    expect(screen.getByText('Brouillon enregistré sur ce téléphone.')).toBeInTheDocument();
    expect((await services.settings.load()).values.learnerProfile.remarks).toBe('');

    // Leaving and coming back restores the draft.
    unmount();
    await renderApp('/reglages', services);
    expect(await screen.findByText('Brouillon restauré')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Remarques libres' })).toHaveValue(
      'Stage en finance de marché',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByText('Profil enregistré.')).toBeInTheDocument();
    expect((await services.settings.load()).values.learnerProfile.remarks).toBe(
      'Stage en finance de marché',
    );
    await waitFor(async () => {
      expect(await services.drafts.get(PROFILE_REMARKS_DRAFT_KEY)).toEqual({ state: 'absent' });
    });
  });

  it('cancels unsaved remarks', async () => {
    const { services } = await openSettings();
    await services.settings.update({
      learnerProfile: { ...DEFAULT_SETTINGS.learnerProfile, remarks: 'Déjà enregistré' },
    });
    const remarks = await screen.findByDisplayValue('Déjà enregistré');
    fireEvent.change(remarks, { target: { value: 'Autre chose' } });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler les modifications' }));
    expect(remarks).toHaveValue('Déjà enregistré');
    await waitFor(async () => {
      expect(await services.drafts.get(PROFILE_REMARKS_DRAFT_KEY)).toEqual({ state: 'absent' });
    });
  });

  it('warns about an unreadable draft and sets it aside before replacing it (NO-06)', async () => {
    const services = await createTestServices();
    const unreadable = { key: PROFILE_REMARKS_DRAFT_KEY, text: 42, updatedAt: 0 };
    await services.db.table('drafts').put(unreadable);
    await renderApp('/reglages', services);

    expect(await screen.findByText('Ancien brouillon illisible')).toBeInTheDocument();
    const remarks = screen.getByRole('textbox', { name: 'Remarques libres' });
    await waitFor(() => {
      expect(remarks).toBeEnabled();
    });
    fireEvent.change(remarks, { target: { value: 'Nouveau texte' } });

    await waitFor(async () => {
      expect(await services.drafts.get(PROFILE_REMARKS_DRAFT_KEY)).toEqual({
        state: 'present',
        text: 'Nouveau texte',
      });
    });
    expect(await services.db.table('quarantine').toArray()).toEqual([
      expect.objectContaining({ table: 'drafts', record: unreadable }),
    ]);
  });

  it('shows a choice at once, and rolls it back if it cannot be saved', async () => {
    const services = await createTestServices();
    const failing = {
      ...services,
      settings: {
        load: () => services.settings.load(),
        update: () => Promise.reject(new Error('QuotaExceededError')),
      },
    };
    await renderApp('/reglages', failing);
    const dark = await screen.findByRole('radio', { name: 'Sombre' });

    fireEvent.click(dark);
    expect(dark).toBeChecked();
    expect(await screen.findByText('Réglage non enregistré')).toBeInTheDocument();
    expect(dark).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Automatique/ })).toBeChecked();
  });

  it('warns when the stored settings cannot be read', async () => {
    const { services } = await renderApp('/reglages');
    await services.db.table('settings').put({ id: 'settings', schemaVersion: 1, theme: 'x' });
    expect(await screen.findByText('Réglages illisibles')).toBeInTheDocument();
  });

  it('previews the correction marks, each named in words', async () => {
    await openSettings();
    const appearance = section('Apparence');
    for (const label of [
      'Faute légère',
      'Faute moyenne',
      'Faute importante',
      'Correct mais peu naturel',
    ]) {
      expect(appearance.getByText(label)).toBeInTheDocument();
    }
    expect(appearance.getByText('I have 25 years')).toHaveClass('mark', 'mark--major');
  });
});
