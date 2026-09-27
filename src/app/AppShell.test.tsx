import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderApp } from '../test/render.tsx';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

describe('application shell', () => {
  it('opens on the home screen, in French, with the date', async () => {
    await renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Anglais' })).toBeInTheDocument();
    // The test clock is on Sunday 27 September 2026.
    expect(screen.getByText(/27 septembre/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveAttribute('aria-current', 'page');
  });

  it('navigates to the settings with the bottom navigation', async () => {
    await renderApp('/');
    fireEvent.click(screen.getByRole('link', { name: 'Réglages' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Réglages' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Réglages' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Accueil' })).not.toHaveAttribute('aria-current');
  });

  it('shows a way back for an unknown address', async () => {
    await renderApp('/nulle-part');
    expect(screen.getByRole('heading', { level: 1, name: 'Page introuvable' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Revenir à l’accueil' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Anglais' })).toBeInTheDocument();
  });

  it('applies the theme stored in the settings', async () => {
    const { services } = await renderApp('/');
    expect(document.documentElement).not.toHaveAttribute('data-theme');
    await services.settings.update({ theme: 'dark' });
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });
  });

  it('sets the tab title of each screen', async () => {
    await renderApp('/reglages');
    await waitFor(() => {
      expect(document.title).toBe('Réglages · Anglais');
    });
  });
});
