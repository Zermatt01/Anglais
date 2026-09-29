/**
 * The outbox is fed by every write of a synchronized record, in the same
 * transaction (docs/ARCHITECTURE.md §7, D-045).
 */
import { describe, expect, it } from 'vitest';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { T0, VALID_RECORDS } from '../../test/fixtures.ts';
import type { AppDatabase } from '../database.ts';
import { writeRecord } from '../records.ts';
import { syncOutboxEntrySchema } from '../schemas/local.ts';
import { createDraftRepository } from '../repositories/draft-repository.ts';
import { createSettingsRepository } from '../repositories/settings-repository.ts';
import { EXPORT_APP, EXPORT_FORMAT_VERSION } from '../transfer/envelope.ts';
import { applyImport } from '../transfer/import.ts';
import { SYNCED_TABLE_NAMES, TABLE_NAMES } from '../tables.ts';
import { countPending, enqueueEverything } from './outbox.ts';

async function entries(db: AppDatabase) {
  return syncOutboxEntrySchema.array().parse(await db.table('syncOutbox').toArray());
}

describe('the outbox', () => {
  it('receives an entry for each write of a synchronized record', async () => {
    const db = await createTestDatabase();
    await writeRecord(db, 'cards', VALID_RECORDS.cards, T0);
    await writeRecord(db, 'reviewLogs', VALID_RECORDS.reviewLogs, T0);
    expect(
      (await entries(db)).map(({ table, docId, queuedAt }) => ({ table, docId, queuedAt })),
    ).toEqual([
      { table: 'cards', docId: VALID_RECORDS.cards.id, queuedAt: T0 },
      { table: 'reviewLogs', docId: VALID_RECORDS.reviewLogs.id, queuedAt: T0 },
    ]);
  });

  it('keeps one entry per record, the latest write taking a new place in the queue', async () => {
    const db = await createTestDatabase();
    await writeRecord(db, 'cards', VALID_RECORDS.cards, T0);
    const [first] = await entries(db);
    await writeRecord(db, 'cards', { ...VALID_RECORDS.cards, updatedAt: T0 + 1 }, T0 + 1);
    const after = await entries(db);
    expect(after).toHaveLength(1);
    expect(after[0]?.seq).toBeGreaterThan(first?.seq ?? Infinity);
  });

  it('never receives local records: drafts and set-aside records', async () => {
    const db = await createTestDatabase();
    const clock = createTestClock();
    await createDraftRepository(db, clock).save('theme:1', 'I have');
    await writeRecord(db, 'quarantine', VALID_RECORDS.quarantine, T0);
    expect(await countPending(db)).toBe(0);
  });

  it('receives the settings changed by the repository', async () => {
    const db = await createTestDatabase();
    await createSettingsRepository(db, createTestClock()).update({ theme: 'dark' });
    expect((await entries(db)).map((entry) => entry.docId)).toEqual(['settings']);
  });

  it('is written in the same transaction as the record: a transaction without it fails', async () => {
    const db = await createTestDatabase();
    await expect(
      db.dexie.transaction('rw', [db.table('cards')], () =>
        writeRecord(db, 'cards', VALID_RECORDS.cards, T0),
      ),
    ).rejects.toThrow();
    expect(await db.table('cards').count()).toBe(0);
  });

  it('receives the synchronized records written by an import, not the drafts', async () => {
    const db = await createTestDatabase();
    await applyImport(
      db,
      {
        app: EXPORT_APP,
        formatVersion: EXPORT_FORMAT_VERSION,
        exportedAt: T0,
        databaseVersion: 2,
        tables: { cards: [VALID_RECORDS.cards], drafts: [VALID_RECORDS.drafts] },
      },
      T0,
    );
    expect((await entries(db)).map((entry) => entry.table)).toEqual(['cards']);
  });

  it('can queue every synchronized record for a first synchronization (D-045)', async () => {
    const db = await createTestDatabase();
    for (const name of TABLE_NAMES) await db.table(name).put(VALID_RECORDS[name]);
    const tables = [db.table('syncOutbox'), ...SYNCED_TABLE_NAMES.map((name) => db.table(name))];
    const count = await db.dexie.transaction('rw', tables, () => enqueueEverything(db, T0));
    expect(count).toBe(SYNCED_TABLE_NAMES.length);
    expect((await entries(db)).map((entry) => entry.table).sort()).toEqual(
      [...SYNCED_TABLE_NAMES].sort(),
    );
  });
});
