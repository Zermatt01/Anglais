// @vitest-environment node
/**
 * The synchronization store (supabase/migrations/…_sync.sql): Row Level
 * Security, "latest wins" with the server as the only arbiter of ties, union
 * of events, and the pull cursor (docs/ARCHITECTURE.md §7).
 */
import type { PGlite, Transaction } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { asRole, asUser, createMigratedDatabase, createUser } from './database.ts';

let db: PGlite;

beforeAll(async () => {
  db = await createMigratedDatabase();
});

const remoteRowSchema = z.object({
  kind: z.enum(['document', 'event']),
  collection: z.string(),
  id: z.string(),
  doc: z.record(z.string(), z.unknown()),
  schema_version: z.coerce.number(),
  updated_at: z.coerce.number(),
  deleted: z.boolean(),
  server_seq: z.coerce.number(),
});
const pushResultSchema = z.object({ stale: z.array(remoteRowSchema) });

interface PushedDocument {
  collection: string;
  id: string;
  doc: Record<string, unknown>;
  schema_version: number;
  updated_at: number;
  deleted: boolean;
}

interface PushedEvent {
  collection: string;
  id: string;
  doc: Record<string, unknown>;
  schema_version: number;
  occurred_at: number;
}

function documentOf(id: string, updatedAt: number, fields: Record<string, unknown> = {}) {
  return {
    collection: 'cards',
    id,
    doc: { id, updatedAt, ...fields },
    schema_version: 1,
    updated_at: updatedAt,
    deleted: false,
  } satisfies PushedDocument;
}

function eventOf(id: string, fields: Record<string, unknown> = {}) {
  return {
    collection: 'reviewLogs',
    id,
    doc: { id, at: 1, ...fields },
    schema_version: 1,
    occurred_at: 1,
  } satisfies PushedEvent;
}

async function pushWith(
  tx: Transaction,
  documents: readonly PushedDocument[],
  events: readonly PushedEvent[] = [],
) {
  const result = await tx.query<{ result: unknown }>(
    'select public.sync_push($1::jsonb, $2::jsonb) as result',
    [JSON.stringify(documents), JSON.stringify(events)],
  );
  return pushResultSchema.parse(result.rows[0]?.result);
}

function push(
  userId: string,
  documents: readonly PushedDocument[],
  events: readonly PushedEvent[] = [],
) {
  return asUser(db, userId, (tx) => pushWith(tx, documents, events));
}

async function pull(userId: string, cursor = 0, limit = 100) {
  const result = await asUser(db, userId, (tx) =>
    tx.query('select * from public.sync_pull($1, $2)', [cursor, limit]),
  );
  return result.rows.map((row) => remoteRowSchema.parse(row));
}

async function storedDocument(userId: string, id: string) {
  const rows = (await pull(userId)).filter((row) => row.kind === 'document' && row.id === id);
  return rows[0];
}

describe('sync_push and sync_pull', () => {
  it('store documents and events, and return them in sequence order', async () => {
    const user = await createUser(db);
    const card = crypto.randomUUID();
    const log = crypto.randomUUID();
    expect(await push(user, [documentOf(card, 100)], [eventOf(log)])).toEqual({ stale: [] });

    const rows = await pull(user);
    expect(rows.map((row) => [row.kind, row.collection, row.id])).toEqual([
      ['document', 'cards', card],
      ['event', 'reviewLogs', log],
    ]);
    expect(rows[0]).toMatchObject({ doc: { id: card, updatedAt: 100 }, updated_at: 100 });
    expect(rows[1]).toMatchObject({ updated_at: 1, deleted: false });
    expect(rows[1]?.server_seq).toBeGreaterThan(rows[0]?.server_seq ?? Infinity);
  });

  it('accept the natural keys of settings, notionProgress and ruleNotes (D-044)', async () => {
    const user = await createUser(db);
    await push(user, [
      { ...documentOf('settings', 5), collection: 'settings' },
      { ...documentOf('tense-past-simple', 5), collection: 'notionProgress' },
    ]);
    expect((await pull(user)).map((row) => row.id).sort()).toEqual([
      'settings',
      'tense-past-simple',
    ]);
  });

  it('keep the most recent version of a document ("latest wins", D-015)', async () => {
    const user = await createUser(db);
    const id = crypto.randomUUID();
    await push(user, [documentOf(id, 100, { front: 'v1' })]);
    await push(user, [documentOf(id, 200, { front: 'v2' })]);
    expect((await storedDocument(user, id))?.doc).toMatchObject({ front: 'v2' });
  });

  it('return the stored version when the pushed one is older, and keep the stored one', async () => {
    const user = await createUser(db);
    const id = crypto.randomUUID();
    await push(user, [documentOf(id, 200, { front: 'newer' })]);
    const { stale } = await push(user, [documentOf(id, 100, { front: 'older' })]);
    expect(stale).toHaveLength(1);
    expect(stale[0]).toMatchObject({
      kind: 'document',
      id,
      updated_at: 200,
      doc: { front: 'newer' },
    });
    expect((await storedDocument(user, id))?.doc).toMatchObject({ front: 'newer' });
  });

  it('settle a tie the same way whatever the order of the pushes', async () => {
    const first = await createUser(db);
    const second = await createUser(db);
    const id = crypto.randomUUID();
    const a = documentOf(id, 300, { front: 'aaa' });
    const b = documentOf(id, 300, { front: 'bbb' });
    await push(first, [a]);
    await push(first, [b]);
    await push(second, [b]);
    await push(second, [a]);
    const kept = (await storedDocument(first, id))?.doc;
    expect((await storedDocument(second, id))?.doc).toEqual(kept);
    // The loser of the tie gets the winner back, so that every device converges.
    const { stale } = await push(first, [kept?.front === 'aaa' ? b : a]);
    expect(stale[0]?.doc).toEqual(kept);
  });

  it('count a key repeated in one batch once, with its latest version', async () => {
    const user = await createUser(db);
    const id = crypto.randomUUID();
    await push(user, [
      documentOf(id, 100, { front: 'old' }),
      documentOf(id, 150, { front: 'new' }),
    ]);
    expect((await storedDocument(user, id))?.doc).toMatchObject({ front: 'new' });
  });

  it('store a deletion as a tombstone', async () => {
    const user = await createUser(db);
    const id = crypto.randomUUID();
    await push(user, [documentOf(id, 100)]);
    await push(user, [{ ...documentOf(id, 200, { deletedAt: 200 }), deleted: true }]);
    expect(await storedDocument(user, id)).toMatchObject({ deleted: true, updated_at: 200 });
  });

  it('never overwrite an event (union)', async () => {
    const user = await createUser(db);
    const id = crypto.randomUUID();
    await push(user, [], [eventOf(id, { answer: 'first' })]);
    await push(user, [], [eventOf(id, { answer: 'second' }), eventOf(id, { answer: 'third' })]);
    const events = (await pull(user)).filter((row) => row.kind === 'event');
    expect(events).toHaveLength(1);
    expect(events[0]?.doc).toMatchObject({ answer: 'first' });
  });

  it('give an updated document a new sequence number, so that the cursor finds it again', async () => {
    const user = await createUser(db);
    const id = crypto.randomUUID();
    const other = crypto.randomUUID();
    await push(user, [documentOf(id, 100), documentOf(other, 100)]);
    const cursor = Math.max(...(await pull(user)).map((row) => row.server_seq));
    expect(await pull(user, cursor)).toEqual([]);

    await push(user, [documentOf(id, 101)]);
    const changes = await pull(user, cursor);
    expect(changes.map((row) => row.id)).toEqual([id]);
    // A version that loses changes nothing, and is not pulled again.
    await push(user, [documentOf(id, 50)]);
    expect(await pull(user, changes[0]?.server_seq)).toEqual([]);
  });

  it('respect the pull limit, within 1 to 1 000 rows', async () => {
    const user = await createUser(db);
    await push(
      user,
      Array.from({ length: 5 }, (_, index) => documentOf(crypto.randomUUID(), index + 1)),
    );
    expect(await pull(user, 0, 2)).toHaveLength(2);
    expect(await pull(user, 0, 0)).toHaveLength(1);
    const all = await pull(user, 0, 100);
    expect(all.map((row) => row.server_seq)).toEqual(
      [...all.map((row) => row.server_seq)].sort((a, b) => a - b),
    );
  });

  it('refuse a batch that is not a list, or that is too large', async () => {
    const user = await createUser(db);
    await expect(
      asUser(db, user, (tx) => tx.query(`select public.sync_push('{}'::jsonb, '[]'::jsonb)`)),
    ).rejects.toThrow(/invalid batch/);
    const tooMany = Array.from({ length: 501 }, () => documentOf(crypto.randomUUID(), 1));
    await expect(push(user, tooMany)).rejects.toThrow(/invalid batch/);
  });

  it('refuse an event whose identifier is not a UUID', async () => {
    const user = await createUser(db);
    await expect(push(user, [], [eventOf('not-a-uuid')])).rejects.toThrow();
  });
});

describe('Row Level Security of the synchronization (SEC-02)', () => {
  it('shows each user their own rows only', async () => {
    const alice = await createUser(db);
    const bob = await createUser(db);
    const id = crypto.randomUUID();
    await push(alice, [documentOf(id, 100, { owner: 'alice' })], [eventOf(crypto.randomUUID())]);
    await push(bob, [documentOf(id, 50, { owner: 'bob' })]);

    expect((await pull(bob)).map((row) => row.doc.owner)).toEqual(['bob']);
    expect((await storedDocument(alice, id))?.doc).toMatchObject({ owner: 'alice' });
    const visible = await asUser(db, bob, async (tx) => [
      (await tx.query('select 1 from public.sync_documents')).rows.length,
      (await tx.query('select 1 from public.sync_events')).rows.length,
    ]);
    expect(visible).toEqual([1, 0]);
  });

  it('refuses a row written for another user', async () => {
    const alice = await createUser(db);
    const bob = await createUser(db);
    await expect(
      asUser(db, bob, (tx) =>
        tx.query(
          `insert into public.sync_documents (user_id, collection, id, doc, schema_version, updated_at)
           values ($1, 'cards', 'x', '{}', 1, 1)`,
          [alice],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it('refuses deletions: they travel as tombstones', async () => {
    const user = await createUser(db);
    await push(user, [documentOf(crypto.randomUUID(), 1)]);
    await expect(
      asUser(db, user, (tx) => tx.query('delete from public.sync_documents')),
    ).rejects.toThrow(/permission denied/);
  });

  it('refuses the anonymous role, and a request without a user', async () => {
    await expect(
      asRole(db, 'anon', null, (tx) => tx.query('select * from public.sync_pull(0, 10)')),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asRole(db, 'anon', null, (tx) => tx.query('select * from public.sync_documents')),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asRole(db, 'authenticated', null, (tx) => pushWith(tx, [documentOf('x', 1)])),
    ).rejects.toThrow(/not authenticated/);
  });
});
