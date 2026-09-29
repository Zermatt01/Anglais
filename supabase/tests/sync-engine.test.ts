// @vitest-environment node
/**
 * The client synchronization engine (src/data/sync) against the real SQL
 * functions (PGlite, see database.ts): each device is a fresh Dexie database,
 * and the transport calls sync_push and sync_pull as the signed-in user.
 */
import type { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AppDatabase } from '../../src/data/database.ts';
import { readRecord, writeRecord } from '../../src/data/records.ts';
import { createSettingsRepository } from '../../src/data/repositories/settings-repository.ts';
import { PULL_BATCH, synchronize } from '../../src/data/sync/engine.ts';
import { readCursor, readLastSyncAt, writeMeta } from '../../src/data/sync/meta.ts';
import { countPending } from '../../src/data/sync/outbox.ts';
import {
  pullResultSchema,
  pushResultSchema,
  type RemoteRow,
  type SyncTransport,
} from '../../src/data/sync/protocol.ts';
import { createTestClock, createTestDatabase } from '../../src/test/database.ts';
import { FIXTURE_IDS, T0, VALID_RECORDS } from '../../src/test/fixtures.ts';
import { createMigratedDatabase, createUser, rpcAs } from './database.ts';

let server: PGlite;

beforeAll(async () => {
  server = await createMigratedDatabase();
});

function transportFor(userId: string): SyncTransport {
  const rpc = rpcAs(server, 'authenticated', userId);
  return {
    async push(documents, events) {
      return pushResultSchema.parse(
        await rpc('sync_push', { p_documents: documents, p_events: events }),
      );
    },
    async pull(cursor, limit) {
      return pullResultSchema.parse(await rpc('sync_pull', { p_cursor: cursor, p_limit: limit }));
    },
  };
}

interface Device {
  readonly db: AppDatabase;
  readonly clock: ReturnType<typeof createTestClock>;
  readonly settings: ReturnType<typeof createSettingsRepository>;
  sync(transport?: SyncTransport): ReturnType<typeof synchronize>;
}

async function device(accountId: string): Promise<Device> {
  const db = await createTestDatabase();
  const clock = createTestClock();
  return {
    db,
    clock,
    settings: createSettingsRepository(db, clock),
    sync: (transport = transportFor(accountId)) => synchronize(db, transport, { accountId, clock }),
  };
}

function reviewLog(id: string, answer: string) {
  return { ...VALID_RECORDS.reviewLogs, id, answer };
}

async function serverRows(userId: string) {
  return pullResultSchema.parse(
    await rpcAs(server, 'authenticated', userId)('sync_pull', { p_cursor: 0, p_limit: 1000 }),
  );
}

describe('synchronize', () => {
  it('sends everything written before the first synchronization (D-045)', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    // Written in phase 1, before the outbox existed.
    await phone.db.table('cards').put(VALID_RECORDS.cards);
    await phone.db.table('drafts').put(VALID_RECORDS.drafts);
    await phone.settings.update({ theme: 'dark' });

    const report = await phone.sync();
    expect(report).toMatchObject({ sent: 2, complete: true, quarantined: 0 });
    expect((await serverRows(user)).map((row) => row.collection).sort()).toEqual([
      'cards',
      'settings',
    ]);
    expect(await countPending(phone.db)).toBe(0);
    expect(await readLastSyncAt(phone.db)).toBe(phone.clock.now());
    expect(await readCursor(phone.db)).toBeGreaterThan(0);
  });

  it('brings the changes of one device to another', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    const laptop = await device(user);
    await phone.settings.update({ theme: 'dark', dailyGoalMinutes: 30 });
    await phone.sync();

    await laptop.sync();
    expect((await laptop.settings.load()).values).toMatchObject({
      theme: 'dark',
      dailyGoalMinutes: 30,
    });
    // Received changes are not sent back.
    expect(await countPending(laptop.db)).toBe(0);

    laptop.clock.advance(60_000);
    await laptop.settings.update({ theme: 'light' });
    await laptop.sync();
    await phone.sync();
    expect((await phone.settings.load()).values.theme).toBe('light');
  });

  it('keeps the most recent version when both devices changed the same document', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    const laptop = await device(user);
    await phone.settings.update({ theme: 'dark' });
    laptop.clock.advance(5_000);
    await laptop.settings.update({ theme: 'light' });

    await laptop.sync();
    await phone.sync();
    await laptop.sync();
    expect((await phone.settings.load()).values.theme).toBe('light');
    expect((await laptop.settings.load()).values.theme).toBe('light');
  });

  it('converges when two different versions carry the same time (the server decides)', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    const laptop = await device(user);
    await phone.settings.update({ theme: 'dark' });
    await laptop.settings.update({ theme: 'light' });
    expect(phone.clock.now()).toBe(laptop.clock.now());

    await phone.sync();
    await laptop.sync();
    await phone.sync();
    const phoneTheme = (await phone.settings.load()).values.theme;
    expect((await laptop.settings.load()).values.theme).toBe(phoneTheme);
  });

  it('keeps the events of every device (union)', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    const laptop = await device(user);
    const first = crypto.randomUUID();
    const second = crypto.randomUUID();
    await writeRecord(phone.db, 'reviewLogs', reviewLog(first, 'yet'), T0);
    await writeRecord(laptop.db, 'reviewLogs', reviewLog(second, 'already'), T0);

    await phone.sync();
    await laptop.sync();
    await phone.sync();
    for (const { db } of [phone, laptop]) {
      expect((await db.table('reviewLogs').toCollection().primaryKeys()).sort()).toEqual(
        [first, second].sort(),
      );
    }
  });

  it('sends a change made while a push is on its way', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    await phone.settings.update({ theme: 'dark' });
    const real = transportFor(user);
    let changed = false;
    const report = await phone.sync({
      async push(documents, events) {
        if (!changed) {
          changed = true;
          phone.clock.advance(1_000);
          await phone.settings.update({ theme: 'light' });
        }
        return real.push(documents, events);
      },
      pull: (cursor, limit) => real.pull(cursor, limit),
    });
    expect(report.sent).toBe(2);
    const stored = (await serverRows(user)).find((row) => row.collection === 'settings');
    expect(stored?.doc.theme).toBe('light');
    expect(await countPending(phone.db)).toBe(0);
  });

  it('keeps the outbox when the server cannot be reached, and sends it next time', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    await phone.settings.update({ theme: 'dark' });
    const offline: SyncTransport = {
      push: () => Promise.reject(new TypeError('Failed to fetch')),
      pull: () => Promise.reject(new TypeError('Failed to fetch')),
    };
    await expect(phone.sync(offline)).rejects.toThrow('Failed to fetch');
    expect(await countPending(phone.db)).toBe(1);
    expect(await readLastSyncAt(phone.db)).toBeNull();

    await phone.sync();
    expect(await countPending(phone.db)).toBe(0);
    expect((await serverRows(user)).map((row) => row.collection)).toEqual(['settings']);
  });

  it('pulls in batches until everything is received', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    const laptop = await device(user);
    const count = PULL_BATCH * 2 + 17;
    for (let index = 0; index < count; index += 1) {
      await writeRecord(
        phone.db,
        'reviewLogs',
        reviewLog(crypto.randomUUID(), `a${String(index)}`),
        T0,
      );
    }
    expect((await phone.sync()).sent).toBe(count);
    const report = await laptop.sync();
    expect(report).toMatchObject({ applied: count, complete: true });
    expect(await laptop.db.table('reviewLogs').count()).toBe(count);
  });

  it('sends everything again to another account, and pulls it from the start', async () => {
    const first = await createUser(server);
    const second = await createUser(server);
    const phone = await device(first);
    await phone.settings.update({ theme: 'dark' });
    await phone.sync();

    const report = await synchronize(phone.db, transportFor(second), {
      accountId: second,
      clock: phone.clock,
    });
    expect(report.sent).toBe(1);
    expect((await serverRows(second)).map((row) => row.collection)).toEqual(['settings']);
  });

  it('pulls everything again after an update of the app (new schema signature)', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    await phone.settings.update({ theme: 'dark' });
    await phone.sync();
    await writeMeta(phone.db, 'schemaSignature', 'an older version');
    const report = await phone.sync();
    expect(report.received).toBeGreaterThan(0);
    expect(report.kept).toBe(report.received);
  });
});

describe('received records that cannot be applied (NO-06)', () => {
  async function receive(rows: RemoteRow[]) {
    const user = await createUser(server);
    const phone = await device(user);
    const real = transportFor(user);
    let served = false;
    const report = await phone.sync({
      push: (documents, events) => real.push(documents, events),
      pull: () => {
        const batch = served ? [] : rows;
        served = true;
        return Promise.resolve(batch);
      },
    });
    return { phone, report };
  }

  function row(
    fields: Partial<RemoteRow> & Pick<RemoteRow, 'collection' | 'id' | 'doc'>,
  ): RemoteRow {
    return {
      kind: 'document',
      schema_version: 1,
      updated_at: T0,
      deleted: false,
      server_seq: 1,
      ...fields,
    };
  }

  it('sets aside a corrupted record in quarantine, and applies the others', async () => {
    const { phone, report } = await receive([
      row({
        collection: 'cards',
        id: FIXTURE_IDS.card,
        doc: { id: FIXTURE_IDS.card, schemaVersion: 1 },
      }),
      row({ collection: 'settings', id: 'settings', doc: VALID_RECORDS.settings }),
    ]);
    expect(report).toMatchObject({ quarantined: 1, applied: 1 });
    expect(await phone.db.table('cards').count()).toBe(0);
    const [entry] = await phone.db.table('quarantine').toArray();
    expect(entry).toMatchObject({ table: 'cards', key: FIXTURE_IDS.card });
  });

  it('leaves on the server a record of a newer version of the app, or of an unknown table', async () => {
    const { phone, report } = await receive([
      row({
        collection: 'cards',
        id: FIXTURE_IDS.card,
        doc: { ...VALID_RECORDS.cards, schemaVersion: 2 },
      }),
      row({ collection: 'futureTable', id: 'x', doc: { id: 'x' } }),
    ]);
    expect(report).toMatchObject({ deferred: 2, quarantined: 0, applied: 0 });
    expect(await phone.db.table('cards').count()).toBe(0);
    expect(await phone.db.table('quarantine').count()).toBe(0);
  });

  it('refuses a record whose key differs from its identifier', async () => {
    const { report } = await receive([
      row({ collection: 'cards', id: crypto.randomUUID(), doc: VALID_RECORDS.cards }),
    ]);
    expect(report.quarantined).toBe(1);
  });

  it('sets aside an unreadable local record before replacing it', async () => {
    const user = await createUser(server);
    const phone = await device(user);
    const laptop = await device(user);
    await laptop.settings.update({ theme: 'dark' });
    await laptop.sync();
    const broken = { id: 'settings', schemaVersion: 1, theme: 'purple' };
    await phone.db.table('settings').put(broken);

    const report = await phone.sync();
    expect(report.unsent).toBe(1);
    expect((await phone.settings.load()).values.theme).toBe('dark');
    const [entry] = await phone.db.table('quarantine').toArray();
    expect(entry).toMatchObject({ table: 'settings', record: broken });
  });

  it('keeps a lexicon entry whose expression exists locally under another identifier (D-044)', async () => {
    const local = { ...VALID_RECORDS.lexicon, id: crypto.randomUUID() };
    const remote = { ...VALID_RECORDS.lexicon, id: crypto.randomUUID(), updatedAt: T0 + 1 };
    const user = await createUser(server);
    const phone = await device(user);
    await phone.db.table('lexicon').put(local);
    const real = transportFor(user);
    let served = false;
    const report = await phone.sync({
      push: (documents, events) => real.push(documents, events),
      pull: () => {
        const batch = served
          ? []
          : [row({ collection: 'lexicon', id: remote.id, doc: remote, updated_at: T0 + 1 })];
        served = true;
        return Promise.resolve(batch);
      },
    });
    expect(report.quarantined).toBe(1);
    expect(await readRecord(phone.db, 'lexicon', local.id)).toMatchObject({ ok: true });
    expect(await phone.db.table('lexicon').count()).toBe(1);
  });
});
