import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createTestDatabase } from '../test/database.ts';
import { T0, VALID_RECORDS } from '../test/fixtures.ts';
import { parseRecord, parseWithDefinition, readRecord, writeRecord } from './records.ts';
import type { TableDefinition } from './tables.ts';

/** A fictional table at schema version 3, to test the upgrade chain. */
const noteV3: TableDefinition<z.ZodObject> = {
  syncClass: 'document',
  primaryKey: 'id',
  schema: z.strictObject({
    id: z.string(),
    schemaVersion: z.literal(3),
    title: z.string(),
    tags: z.array(z.string()),
  }),
  schemaVersion: 3,
  upgrades: {
    // v1 → v2: `name` renamed to `title`.
    1: ({ name, ...rest }) => ({ ...rest, title: name, schemaVersion: 2 }),
    // v2 → v3: `tags` added.
    2: (record) => ({ ...record, tags: [], schemaVersion: 3 }),
  },
  exported: true,
};

describe('parseWithDefinition', () => {
  it('reads a current record as it is', () => {
    const record = { id: 'n1', schemaVersion: 3, title: 'Note', tags: ['a'] };
    expect(parseWithDefinition(noteV3, record)).toEqual({ ok: true, value: record });
  });

  it('upgrades an old record through every intermediate version', () => {
    expect(parseWithDefinition(noteV3, { id: 'n1', schemaVersion: 1, name: 'Old' })).toEqual({
      ok: true,
      value: { id: 'n1', schemaVersion: 3, title: 'Old', tags: [] },
    });
  });

  it('isolates a record written by a newer version of the app', () => {
    const result = parseWithDefinition(noteV3, { id: 'n1', schemaVersion: 4, title: 'x' });
    expect(result).toEqual({ ok: false, reason: 'written by a newer version of the app (v4)' });
  });

  it('isolates a record without a usable schema version', () => {
    expect(parseWithDefinition(noteV3, { id: 'n1' }).ok).toBe(false);
    expect(parseWithDefinition(noteV3, { id: 'n1', schemaVersion: 1.5 }).ok).toBe(false);
    expect(parseWithDefinition(noteV3, 'text').ok).toBe(false);
    expect(parseWithDefinition(noteV3, null).ok).toBe(false);
  });

  it('isolates a record that is still invalid after upgrading', () => {
    const result = parseWithDefinition(noteV3, { id: 'n1', schemaVersion: 1, name: 42 });
    expect(result.ok).toBe(false);
  });

  it('reports a missing upgrade function', () => {
    const broken = { ...noteV3, upgrades: {} };
    expect(parseWithDefinition(broken, { id: 'n1', schemaVersion: 2, title: 'x' })).toEqual({
      ok: false,
      reason: 'no upgrade from schema version 2',
    });
  });
});

describe('parseRecord', () => {
  it('validates a record of a registered table', () => {
    expect(parseRecord('settings', VALID_RECORDS.settings)).toEqual({
      ok: true,
      value: VALID_RECORDS.settings,
    });
    expect(parseRecord('settings', { ...VALID_RECORDS.settings, theme: 'purple' }).ok).toBe(false);
  });

  it('validates local records, which have no schema version', () => {
    expect(parseRecord('drafts', VALID_RECORDS.drafts).ok).toBe(true);
  });
});

describe('readRecord and writeRecord', () => {
  it('writes a valid record and reads it back', async () => {
    const db = await createTestDatabase();
    await writeRecord(db, 'cards', VALID_RECORDS.cards, T0);
    expect(await readRecord(db, 'cards', VALID_RECORDS.cards.id)).toEqual({
      ok: true,
      value: VALID_RECORDS.cards,
    });
    expect(await readRecord(db, 'cards', crypto.randomUUID())).toBeUndefined();
  });

  it('refuses to write an invalid record and leaves the table unchanged', async () => {
    const db = await createTestDatabase();
    const invalid = { ...VALID_RECORDS.settings, dailyGoalMinutes: -5 };
    await expect(writeRecord(db, 'settings', invalid, T0)).rejects.toThrow(
      /invalid settings record/,
    );
    expect(await db.table('settings').count()).toBe(0);
  });

  it('refuses a document whose updatedAt does not increase (review of phase 2)', async () => {
    const db = await createTestDatabase();
    await writeRecord(db, 'cards', VALID_RECORDS.cards, T0);
    const same = { ...VALID_RECORDS.cards, content: { ...VALID_RECORDS.cards.content, hint: 'x' } };
    await expect(writeRecord(db, 'cards', same, T0)).rejects.toThrow(/does not increase/);
    await expect(writeRecord(db, 'cards', { ...same, updatedAt: T0 - 1 }, T0)).rejects.toThrow(
      /does not increase/,
    );
    expect(await readRecord(db, 'cards', VALID_RECORDS.cards.id)).toEqual({
      ok: true,
      value: VALID_RECORDS.cards,
    });
    // Events and local records carry no updatedAt to compare.
    await writeRecord(db, 'reviewLogs', VALID_RECORDS.reviewLogs, T0);
    await writeRecord(db, 'drafts', VALID_RECORDS.drafts, T0);
    await writeRecord(db, 'drafts', VALID_RECORDS.drafts, T0);
    await writeRecord(db, 'cards', { ...same, updatedAt: T0 + 1 }, T0 + 1);
  });

  it('reports a corrupted stored record instead of returning it', async () => {
    const db = await createTestDatabase();
    await db.table('settings').put({ id: 'settings', schemaVersion: 1, theme: 'purple' });
    const result = await readRecord(db, 'settings', 'settings');
    expect(result?.ok).toBe(false);
  });
});
