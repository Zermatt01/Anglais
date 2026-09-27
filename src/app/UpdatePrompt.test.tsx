import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerDraftFlush } from '../features/drafts/draft-registry.ts';
import { UpdatePrompt } from './UpdatePrompt.tsx';

const pwa = vi.hoisted(() => ({
  needRefresh: false,
  offlineReady: false,
  setNeedRefresh: vi.fn<(value: boolean) => void>(),
  setOfflineReady: vi.fn<(value: boolean) => void>(),
  updateServiceWorker: vi.fn<(reload?: boolean) => Promise<void>>(),
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [pwa.needRefresh, pwa.setNeedRefresh],
    offlineReady: [pwa.offlineReady, pwa.setOfflineReady],
    updateServiceWorker: pwa.updateServiceWorker,
  }),
}));

beforeEach(() => {
  pwa.needRefresh = false;
  pwa.offlineReady = false;
  pwa.updateServiceWorker.mockResolvedValue(undefined);
});

describe('UpdatePrompt (D-018)', () => {
  it('shows nothing when there is nothing to announce', () => {
    const { container } = render(<UpdatePrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('saves every draft, then updates, only when asked', async () => {
    pwa.needRefresh = true;
    const order: string[] = [];
    const unregister = registerDraftFlush(async () => {
      await Promise.resolve();
      order.push('draft saved');
    });
    pwa.updateServiceWorker.mockImplementation(() => {
      order.push('update');
      return Promise.resolve();
    });

    render(<UpdatePrompt />);
    expect(screen.getByText('Nouvelle version disponible')).toBeInTheDocument();
    expect(pwa.updateServiceWorker).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
    await waitFor(() => {
      expect(order).toEqual(['draft saved', 'update']);
    });
    expect(pwa.updateServiceWorker).toHaveBeenCalledWith(true);
    unregister();
  });

  it('updates even if a draft could not be saved', async () => {
    pwa.needRefresh = true;
    const unregister = registerDraftFlush(() => Promise.reject(new Error('quota')));
    render(<UpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
    await waitFor(() => {
      expect(pwa.updateServiceWorker).toHaveBeenCalled();
    });
    unregister();
  });

  it('can be postponed', () => {
    pwa.needRefresh = true;
    render(<UpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Plus tard' }));
    expect(pwa.setNeedRefresh).toHaveBeenCalledWith(false);
    expect(pwa.updateServiceWorker).not.toHaveBeenCalled();
  });

  it('announces once that the app works offline', () => {
    pwa.offlineReady = true;
    render(<UpdatePrompt />);
    expect(screen.getByText('L’application est prête à fonctionner sans connexion.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(pwa.setOfflineReady).toHaveBeenCalledWith(false);
  });
});
