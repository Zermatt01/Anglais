import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestServices } from '../../test/render.tsx';
import { AppServicesContext, type AppServices } from '../app-services.ts';
import { flushAllDrafts } from './draft-registry.ts';
import { useDraft } from './use-draft.ts';

const KEY = 'test:field';

function Field({ committed, delayMs }: { readonly committed: string; readonly delayMs: number }) {
  const draft = useDraft(KEY, committed, delayMs);
  return (
    <>
      <label>
        Texte
        <textarea
          value={draft.text}
          disabled={!draft.ready}
          onChange={(event) => {
            draft.setText(event.currentTarget.value);
          }}
        />
      </label>
      <p data-testid="state">{`${draft.saveState}${draft.restored ? ' restored' : ''}`}</p>
      <button
        type="button"
        onClick={() => {
          void draft.discard(committed);
        }}
      >
        Oublier
      </button>
    </>
  );
}

function renderField(services: AppServices, committed = '', delayMs = 20) {
  return render(
    <AppServicesContext value={services}>
      <Field committed={committed} delayMs={delayMs} />
    </AppServicesContext>,
  );
}

async function typeInto(text: string) {
  const field = await screen.findByRole('textbox', { name: 'Texte' });
  await waitFor(() => {
    expect(field).toBeEnabled();
  });
  fireEvent.change(field, { target: { value: text } });
}

describe('useDraft', () => {
  it('saves the text after a typing pause', async () => {
    const services = await createTestServices();
    renderField(services);
    await typeInto('I have been working');
    expect(screen.getByTestId('state')).toHaveTextContent('pending');
    await waitFor(async () => {
      expect(await services.drafts.get(KEY)).toBe('I have been working');
    });
    expect(screen.getByTestId('state')).toHaveTextContent('saved');
  });

  it('restores a saved draft the next time the field appears', async () => {
    const services = await createTestServices();
    await services.drafts.save(KEY, 'Unsent text');
    renderField(services, 'Committed text');
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Texte' })).toHaveValue('Unsent text');
    });
    expect(screen.getByTestId('state')).toHaveTextContent('restored');
  });

  it('shows the committed text when there is no draft', async () => {
    const services = await createTestServices();
    renderField(services, 'Committed text');
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Texte' })).toBeEnabled();
    });
    expect(screen.getByRole('textbox', { name: 'Texte' })).toHaveValue('Committed text');
    expect(screen.getByTestId('state')).not.toHaveTextContent('restored');
  });

  it('saves immediately when the field disappears, without waiting for the pause', async () => {
    const services = await createTestServices();
    const { unmount } = renderField(services, '', 60_000);
    await typeInto('Typed just before leaving');
    unmount();
    await waitFor(async () => {
      expect(await services.drafts.get(KEY)).toBe('Typed just before leaving');
    });
  });

  it('saves every pending draft before an update reloads the application', async () => {
    const services = await createTestServices();
    renderField(services, '', 60_000);
    await typeInto('Typed before the update');
    await act(() => flushAllDrafts());
    expect(await services.drafts.get(KEY)).toBe('Typed before the update');
  });

  it('saves when the page is hidden', async () => {
    const services = await createTestServices();
    renderField(services, '', 60_000);
    await typeInto('Typed before switching apps');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(async () => {
      expect(await services.drafts.get(KEY)).toBe('Typed before switching apps');
    });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  it('keeps no draft for text identical to the committed text', async () => {
    const services = await createTestServices();
    await services.drafts.save(KEY, 'Old draft');
    renderField(services, 'Committed');
    await typeInto('Committed');
    await waitFor(async () => {
      expect(await services.drafts.get(KEY)).toBeNull();
    });
  });

  it('follows a committed text changed elsewhere when nothing is being typed', async () => {
    const services = await createTestServices();
    const { rerender } = renderField(services, 'Version A');
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Texte' })).toBeEnabled();
    });
    rerender(
      <AppServicesContext value={services}>
        <Field committed="Version B" delayMs={20} />
      </AppServicesContext>,
    );
    expect(screen.getByRole('textbox', { name: 'Texte' })).toHaveValue('Version B');
  });

  it('never replaces text being typed when the committed text changes', async () => {
    const services = await createTestServices();
    const { rerender } = renderField(services, 'Version A');
    await typeInto('My unsaved text');
    rerender(
      <AppServicesContext value={services}>
        <Field committed="Version B" delayMs={20} />
      </AppServicesContext>,
    );
    expect(screen.getByRole('textbox', { name: 'Texte' })).toHaveValue('My unsaved text');
    await waitFor(async () => {
      expect(await services.drafts.get(KEY)).toBe('My unsaved text');
    });
  });

  it('forgets the draft on request', async () => {
    const services = await createTestServices();
    await services.drafts.save(KEY, 'To forget');
    renderField(services, 'Committed');
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Texte' })).toHaveValue('To forget');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Oublier' }));
    await waitFor(async () => {
      expect(await services.drafts.get(KEY)).toBeNull();
    });
    expect(screen.getByRole('textbox', { name: 'Texte' })).toHaveValue('Committed');
  });
});
