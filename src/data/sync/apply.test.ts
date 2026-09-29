/**
 * Received versions against local ones (D-063, D-069): nothing that no other
 * copy holds is replaced without being set aside first.
 */
import { describe, expect, it } from 'vitest';
import { stableStringify } from '../../domain/sync/merge.ts';
import { createTestDatabase } from '../../test/database.ts';
import { T0, VALID_RECORDS } from '../../test/fixtures.ts';
import type { AppDatabase } from '../database.ts';
import { quarantineEntrySchema } from '../schemas/local.ts';
import { applyRemoteRows, applyTables, pushedKey } from './apply.ts';
import { countPending, enqueueChange } from './outbox.ts';
import type { RemoteRow } from './protocol.ts';

const CARD = VALID_RECORDS.cards;

function version(updatedAt: number, hint: string) {
  return { ...CARD, updatedAt, content: { ...CARD.content, hint } };
}

function rowOf(doc: ReturnType<typeof version>): RemoteRow {
  return {
    kind: 'document',
    collection: 'cards',
    id: CARD.id,
    doc,
    schema_version: 1,
    updated_at: doc.updatedAt,
    deleted: false,
    server_seq: 1,
  };
}

/** A local version, waiting to be sent or not. */
async function deviceWith(local: ReturnType<typeof version>, pending: boolean) {
  const db = await createTestDatabase();
  await db.dexie.transaction('rw', [db.table('cards'), db.table('syncOutbox')], async () => {
    await db.table('cards').put(local);
    if (pending) await enqueueChange(db, 'cards', CARD.id, T0);
  });
  return db;
}

function apply(db: AppDatabase, rows: RemoteRow[], pushed?: Map<string, string>) {
  return db.dexie.transaction('rw', applyTables(db), () =>
    applyRemoteRows(db, rows, T0 + 1_000, pushed),
  );
}

async function stored(db: AppDatabase) {
  return db.table('cards').get(CARD.id);
}

describe('applyRemoteRows', () => {
  it('keeps a change made during a push, even with the same updatedAt (review of phase 2)', async () => {
    const pushed = version(100, 'pushed');
    const changedSince = version(100, 'changed during the push');
    const db = await deviceWith(changedSince, true);
    const counts = await apply(
      db,
      [rowOf(version(100, 'kept by the server'))],
      new Map([[pushedKey('cards', CARD.id), stableStringify(pushed)]]),
    );
    expect(counts).toMatchObject({ kept: 1, applied: 0, conflicts: 0 });
    expect(await stored(db)).toEqual(changedSince);
    expect(await countPending(db)).toBe(1);
  });

  it('adopts the version the server kept, and sets aside the pushed one that lost', async () => {
    const pushed = version(100, 'pushed');
    const db = await deviceWith(pushed, true);
    const winner = version(100, 'kept by the server');
    const counts = await apply(
      db,
      [rowOf(winner)],
      new Map([[pushedKey('cards', CARD.id), stableStringify(pushed)]]),
    );
    expect(counts).toMatchObject({ applied: 1, conflicts: 1 });
    expect(await stored(db)).toEqual(winner);
    const [copy] = await db.table('quarantine').toArray();
    expect(copy).toMatchObject({ table: 'cards', key: CARD.id, record: pushed });
    expect(await countPending(db)).toBe(0);
  });

  it('sets aside a change not sent yet that loses to a more recent version (clock running late)', async () => {
    const offline = version(100, 'written offline, clock late');
    const db = await deviceWith(offline, true);
    const counts = await apply(db, [rowOf(version(200, 'from another device'))]);
    expect(counts).toMatchObject({ applied: 1, conflicts: 1 });
    const [copy] = quarantineEntrySchema.array().parse(await db.table('quarantine').toArray());
    expect(copy).toMatchObject({ record: offline });
    expect(copy?.reason).toMatch(/^conflict:/);
  });

  it('replaces a version already sent by a later one without setting anything aside', async () => {
    const db = await deviceWith(version(100, 'sent'), false);
    const counts = await apply(db, [rowOf(version(200, 'later'))]);
    expect(counts).toMatchObject({ applied: 1, conflicts: 0 });
    expect(await db.table('quarantine').count()).toBe(0);
  });

  it('sets aside a sent version that lost a tie on the server', async () => {
    const db = await deviceWith(version(300, 'mine'), false);
    const counts = await apply(db, [rowOf(version(300, 'the server kept this one'))]);
    expect(counts).toMatchObject({ applied: 1, conflicts: 1 });
  });
});
