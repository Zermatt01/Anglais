import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportDatabase } from '../../data/transfer/export.ts';
import { T0, VALID_RECORDS } from '../../test/fixtures.ts';
import { createTestServices, renderWithServices } from '../../test/render.tsx';
import { DataSection } from './DataSection.tsx';

let downloads: { name: string; blob: Blob }[] = [];

beforeEach(() => {
  downloads = [];
  let lastBlob: Blob | null = null;
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    lastBlob = blob instanceof Blob ? blob : null;
    return 'blob:test';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    if (lastBlob !== null) downloads.push({ name: this.download, blob: lastBlob });
  });
});

function importInput(): HTMLInputElement {
  const input = screen.getByLabelText('Fichier à importer');
  if (!(input instanceof HTMLInputElement)) throw new Error('file input not found');
  return input;
}

function chooseFile(content: string, name = 'export.json') {
  fireEvent.change(importInput(), {
    target: { files: [new File([content], name, { type: 'application/json' })] },
  });
}

describe('data section', () => {
  it('exports every table to a dated JSON file', async () => {
    const services = await createTestServices();
    await services.db.table('cards').put(VALID_RECORDS.cards);
    await renderWithServices(<DataSection />, { services });

    fireEvent.click(screen.getByRole('button', { name: 'Exporter mes données' }));
    expect(await screen.findByText(/Export prêt/)).toBeInTheDocument();

    expect(downloads).toHaveLength(1);
    const [download] = downloads;
    expect(download?.name).toMatch(/^anglais-export-\d{4}-\d{2}-\d{2}\.json$/);
    const content: unknown = JSON.parse((await download?.blob.text()) ?? '');
    expect(content).toMatchObject({ app: 'anglais', tables: { cards: [VALID_RECORDS.cards] } });
  });

  it('previews an import, then applies it on confirmation', async () => {
    const source = await createTestServices();
    await source.db.table('cards').put(VALID_RECORDS.cards);
    await source.db.table('settings').put(VALID_RECORDS.settings);
    const file = JSON.stringify(await exportDatabase(source.db, T0));

    const { services } = await renderWithServices(<DataSection />);
    chooseFile(file);

    expect(await screen.findByText('Aperçu de l’import')).toBeInTheDocument();
    expect(screen.getByText('2 éléments seront ajoutés ou mis à jour.')).toBeInTheDocument();
    const list = within(screen.getByRole('list'));
    expect(list.getByText('Cartes')).toBeInTheDocument();
    expect(list.getByText('Réglages')).toBeInTheDocument();
    expect(await services.db.table('cards').count()).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Importer' }));
    expect(await screen.findByText('Import terminé')).toBeInTheDocument();
    expect(screen.getByText('2 éléments ajoutés ou mis à jour.')).toBeInTheDocument();
    expect(await services.db.table('cards').toArray()).toEqual([VALID_RECORDS.cards]);
  });

  it('cancels an import without writing anything', async () => {
    const source = await createTestServices();
    await source.db.table('cards').put(VALID_RECORDS.cards);
    const file = JSON.stringify(await exportDatabase(source.db, T0));

    const { services } = await renderWithServices(<DataSection />);
    chooseFile(file);
    fireEvent.click(await screen.findByRole('button', { name: 'Annuler' }));
    expect(screen.queryByText('Aperçu de l’import')).not.toBeInTheDocument();
    expect(await services.db.table('cards').count()).toBe(0);
  });

  it('says when there is nothing to import', async () => {
    const services = await createTestServices();
    await services.db.table('cards').put(VALID_RECORDS.cards);
    const file = JSON.stringify(await exportDatabase(services.db, T0));
    await renderWithServices(<DataSection />, { services });

    chooseFile(file);
    expect(
      await screen.findByText('Rien à importer : tes données sont déjà à jour.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Importer' })).not.toBeInTheDocument();
  });

  it('explains why a file cannot be imported', async () => {
    await renderWithServices(<DataSection />);
    chooseFile('{ "not": "an export" }');
    expect(
      await screen.findByText('Ce fichier n’est pas un export de cette application.'),
    ).toBeInTheDocument();

    chooseFile('not json at all');
    await waitFor(() => {
      expect(screen.getByText('Ce fichier n’est pas un fichier JSON lisible.')).toBeInTheDocument();
    });
  });

  it('reports that this browser cannot protect the storage', async () => {
    await renderWithServices(<DataSection />);
    expect(
      await screen.findByText('Ce navigateur ne permet pas de protéger le stockage.'),
    ).toBeInTheDocument();
  });
});
