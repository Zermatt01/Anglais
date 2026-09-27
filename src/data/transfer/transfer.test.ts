import { describe, expect, it } from 'vitest';
import { createTestDatabase } from '../../test/database.ts';
import { FIXTURE_IDS, T0, VALID_RECORDS } from '../../test/fixtures.ts';
import type { AppDatabase } from '../database.ts';
import { readRecord } from '../records.ts';
import { TABLE_NAMES, TABLES } from '../tables.ts';
import {
  EXPORT_APP,
  EXPORT_FORMAT_VERSION,
  exportFileName,
  parseExportText,
  type ExportEnvelope,
} from './envelope.ts';
import { exportDatabase, EXPORTED_TABLES } from './export.ts';
import { applyImport, countChanges, previewImport } from './import.ts';

const NOW = T0 + 60_000;

async function databaseWithAllFixtures(): Promise<AppDatabase> {
  const db = await createTestDatabase();
  for (const name of TABLE_NAMES) {
    await db.table(name).put(VALID_RECORDS[name]);
  }
  return db;
}

function envelopeWith(tables: ExportEnvelope['tables']): ExportEnvelope {
  return {
    app: EXPORT_APP,
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: T0,
    databaseVersion: 1,
    tables,
  };
}

function summaryOf(plan: Awaited<ReturnType<typeof previewImport>>, table: string) {
  return plan.tables.find((entry) => entry.table === table);
}

describe('exportDatabase', () => {
  it('exports every table of learner data, records as stored, and no technical state', async () => {
    const db = await databaseWithAllFixtures();
    const envelope = await exportDatabase(db, NOW);

    expect(envelope).toMatchObject({ app: 'anglais', formatVersion: 1, exportedAt: NOW });
    expect(envelope.databaseVersion).toBe(db.dexie.verno);
    expect(Object.keys(envelope.tables).sort()).toEqual([...EXPORTED_TABLES].sort());
    expect(envelope.tables.cards).toEqual([VALID_RECORDS.cards]);
    expect(envelope.tables.drafts).toEqual([VALID_RECORDS.drafts]);
    expect(envelope.tables).not.toHaveProperty('syncOutbox');
    expect(envelope.tables).not.toHaveProperty('syncMeta');
    expect(envelope.tables).not.toHaveProperty('usageSnapshot');
  });

  it('exports unreadable records too, so that nothing is lost', async () => {
    const db = await createTestDatabase();
    const broken = { id: 'settings', schemaVersion: 1, theme: 'purple' };
    await db.table('settings').put(broken);
    expect((await exportDatabase(db, NOW)).tables.settings).toEqual([broken]);
  });

  it('names the file after the local day', () => {
    expect(exportFileName('2026-09-27')).toBe('anglais-export-2026-09-27.json');
  });
});

describe('parseExportText', () => {
  it('reads an export', async () => {
    const envelope = await exportDatabase(await databaseWithAllFixtures(), NOW);
    expect(parseExportText(JSON.stringify(envelope))).toEqual({ ok: true, envelope });
  });

  it('explains why a file cannot be imported', () => {
    expect(parseExportText('{ not json')).toEqual({ ok: false, error: 'not-json' });
    expect(parseExportText('{"cards": []}')).toEqual({ ok: false, error: 'not-an-export' });
    expect(parseExportText(JSON.stringify({ ...envelopeWith({}), formatVersion: 2 }))).toEqual({
      ok: false,
      error: 'newer-format',
    });
  });
});

describe('import', () => {
  it('restores a complete export into an empty database', async () => {
    const source = await databaseWithAllFixtures();
    const envelope = await exportDatabase(source, NOW);
    const target = await createTestDatabase();

    const plan = await applyImport(target, envelope, NOW);
    expect(countChanges(plan)).toBe(EXPORTED_TABLES.length);
    expect(plan.suspendedCards).toBe(0);
    for (const name of EXPORTED_TABLES) {
      expect(await target.table(name).toArray()).toEqual([VALID_RECORDS[name]]);
    }
  });

  it('changes nothing when the same file is imported twice', async () => {
    const db = await databaseWithAllFixtures();
    const envelope = await exportDatabase(db, NOW);
    const plan = await applyImport(db, envelope, NOW);
    expect(countChanges(plan)).toBe(0);
    expect(plan.tables.every((table) => table.kept === 1)).toBe(true);
  });

  it('previews without writing anything', async () => {
    const db = await createTestDatabase();
    const plan = await previewImport(db, envelopeWith({ cards: [VALID_RECORDS.cards] }), NOW);
    expect(summaryOf(plan, 'cards')).toMatchObject({ inserted: 1 });
    expect(await db.table('cards').count()).toBe(0);
  });

  it('keeps the most recent version of a document, in both directions', async () => {
    const db = await createTestDatabase();
    const local = { ...VALID_RECORDS.settings, theme: 'dark', updatedAt: T0 + 10 };
    await db.table('settings').put(local);

    const older = { ...VALID_RECORDS.settings, theme: 'light', updatedAt: T0 + 5 };
    let plan = await applyImport(db, envelopeWith({ settings: [older] }), NOW);
    expect(summaryOf(plan, 'settings')).toMatchObject({ kept: 1, replaced: 0 });
    expect(await db.table('settings').get('settings')).toEqual(local);

    const newer = { ...VALID_RECORDS.settings, theme: 'light', updatedAt: T0 + 20 };
    plan = await applyImport(db, envelopeWith({ settings: [newer] }), NOW);
    expect(summaryOf(plan, 'settings')).toMatchObject({ kept: 0, replaced: 1 });
    expect(await db.table('settings').get('settings')).toEqual(newer);
  });

  it('never overwrites an existing event', async () => {
    const db = await createTestDatabase();
    await db.table('activity').put(VALID_RECORDS.activity);
    const altered = { ...VALID_RECORDS.activity, seconds: 999 };
    const plan = await applyImport(db, envelopeWith({ activity: [altered] }), NOW);
    expect(summaryOf(plan, 'activity')).toMatchObject({ kept: 1, inserted: 0 });
    expect(await db.table('activity').get(FIXTURE_IDS.event)).toEqual(VALID_RECORDS.activity);
  });

  it('applies tombstones like any newer version, and never deletes a record', async () => {
    const db = await createTestDatabase();
    await db.table('reports').put(VALID_RECORDS.reports);
    const deleted = { ...VALID_RECORDS.reports, deletedAt: T0 + 1, updatedAt: T0 + 1 };
    await applyImport(db, envelopeWith({ reports: [deleted] }), NOW);
    expect(await db.table('reports').get(FIXTURE_IDS.other)).toEqual(deleted);
    expect(await db.table('reports').count()).toBe(1);
  });

  it('leaves out unreadable records of the file and counts them', async () => {
    const db = await createTestDatabase();
    const plan = await applyImport(
      db,
      envelopeWith({ cards: [VALID_RECORDS.cards, { id: 'x' }, 'text', null] }),
      NOW,
    );
    expect(summaryOf(plan, 'cards')).toMatchObject({ inserted: 1, invalid: 3 });
  });

  it('never overwrites a local record it cannot read (NO-06)', async () => {
    const db = await createTestDatabase();
    const unreadable = { ...VALID_RECORDS.settings, theme: 'purple', updatedAt: 1 };
    await db.table('settings').put(unreadable);
    const plan = await applyImport(db, envelopeWith({ settings: [VALID_RECORDS.settings] }), NOW);
    expect(summaryOf(plan, 'settings')).toMatchObject({ skipped: 1, replaced: 0, inserted: 0 });
    expect(await db.table('settings').get('settings')).toEqual(unreadable);
  });

  it('imports an unsolvable card suspended, with a newer updatedAt (NO-03)', async () => {
    const db = await createTestDatabase();
    const unsolvable = {
      ...VALID_RECORDS.cards,
      content: { ...VALID_RECORDS.cards.content, meaningFr: '' },
    };
    const plan = await applyImport(db, envelopeWith({ cards: [unsolvable] }), NOW);
    expect(plan.suspendedCards).toBe(1);

    const stored = await readRecord(db, 'cards', FIXTURE_IDS.card);
    expect(stored?.ok && stored.value).toMatchObject({
      status: 'suspended',
      suspensionReason: 'unsolvable',
      updatedAt: NOW,
    });
  });

  it('leaves out a lexicon entry whose expression exists under another identifier', async () => {
    const db = await createTestDatabase();
    await db.table('lexicon').put(VALID_RECORDS.lexicon);
    const duplicate = { ...VALID_RECORDS.lexicon, id: FIXTURE_IDS.event, updatedAt: T0 + 5 };
    const plan = await applyImport(db, envelopeWith({ lexicon: [duplicate] }), NOW);
    expect(summaryOf(plan, 'lexicon')).toMatchObject({ skipped: 1, inserted: 0 });
    expect(await db.table('lexicon').count()).toBe(1);
  });

  it('merges a key repeated in the file, keeping its latest version', async () => {
    const db = await createTestDatabase();
    const first = { ...VALID_RECORDS.settings, theme: 'dark', updatedAt: T0 + 1 };
    const second = { ...VALID_RECORDS.settings, theme: 'light', updatedAt: T0 + 2 };
    const plan = await applyImport(db, envelopeWith({ settings: [second, first] }), NOW);
    expect(summaryOf(plan, 'settings')).toMatchObject({ inserted: 1, kept: 1 });
    expect(await db.table('settings').get('settings')).toEqual(second);
  });

  it('ignores unknown tables and technical state', async () => {
    const db = await createTestDatabase();
    const plan = await applyImport(
      db,
      envelopeWith({ futureTable: [{}], syncOutbox: [VALID_RECORDS.syncOutbox] }),
      NOW,
    );
    expect(plan.ignoredTables).toEqual(['futureTable', 'syncOutbox']);
    expect(await db.table('syncOutbox').count()).toBe(0);
  });

  it('leaves out an entry whose expression is held by an unreadable local entry', async () => {
    const db = await createTestDatabase();
    await db.table('lexicon').put({ ...VALID_RECORDS.lexicon, id: FIXTURE_IDS.error, cardId: 7 });
    const plan = await applyImport(db, envelopeWith({ lexicon: [VALID_RECORDS.lexicon] }), NOW);
    expect(summaryOf(plan, 'lexicon')).toMatchObject({ skipped: 1 });
  });

  it('imports nothing at all if a write fails (all or nothing)', async () => {
    const db = await createTestDatabase();
    // Simulates a storage failure on the second table written.
    db.table('lexicon').hook('creating', () => {
      throw new Error('simulated storage failure');
    });
    const envelope = envelopeWith({
      cards: [VALID_RECORDS.cards],
      lexicon: [VALID_RECORDS.lexicon],
    });
    await expect(applyImport(db, envelope, NOW)).rejects.toThrow('simulated storage failure');
    expect(await db.table('cards').count()).toBe(0);
  });

  it('registers every exported table with a sync class', () => {
    for (const name of EXPORTED_TABLES) {
      expect(['document', 'event', 'local']).toContain(TABLES[name].syncClass);
    }
  });
});
