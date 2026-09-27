import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createTestServices } from '../test/render.tsx';
import { App } from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';

describe('App', () => {
  it('shows a loading state, then the application', async () => {
    const services = await createTestServices();
    render(<App open={() => Promise.resolve(services)} />);
    expect(screen.getByRole('status')).toHaveTextContent('Chargement…');
    expect(await screen.findByRole('heading', { level: 1, name: 'Anglais' })).toBeInTheDocument();
  });

  it('explains a database failure and retries on request', async () => {
    const services = await createTestServices();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const open = vi
      .fn<() => Promise<typeof services>>()
      .mockRejectedValueOnce(new Error('QuotaExceededError'))
      .mockResolvedValueOnce(services);

    render(<App open={open} />);
    expect(
      await screen.findByRole('heading', { name: 'Impossible d’ouvrir tes données' }),
    ).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith('Database could not be opened:', 'Error');

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Anglais' })).toBeInTheDocument();
    expect(open).toHaveBeenCalledTimes(2);
  });
});

describe('ErrorBoundary', () => {
  function Broken(): never {
    throw new Error('boom');
  }

  it('replaces a crashed screen with an actionable message', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(
      screen.getByRole('heading', { name: 'Une erreur inattendue est survenue' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recharger l’application' })).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith('Unexpected error:', 'Error: boom');
  });
});
