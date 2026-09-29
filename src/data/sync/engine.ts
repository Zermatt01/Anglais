/**
 * One synchronization of the device with the server (docs/ARCHITECTURE.md §7).
 *
 * 1. Account: the first synchronization with an account queues every local
 *    record (D-045); a new build of the app pulls everything again (D-063).
 * 2. Push: the outbox is sent in batches; the versions the server kept
 *    instead of the pushed ones come back and are applied; the entries sent
 *    are then deleted, in the same transaction.
 * 3. Pull: the changes after the cursor are applied in batches; the cursor
 *    moves in the same transaction as the changes.
 *
 * Network calls happen between transactions, never inside one. The
 * synchronization never calls the AI (COST-01).
 */
import { z } from 'zod';
import type { Clock } from '../../domain/primitives.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord } from '../records.ts';
import { syncOutboxEntrySchema, type SyncOutboxEntry } from '../schemas/local.ts';
import { isSyncedTable, isTableName, SYNCED_TABLE_NAMES, TABLES } from '../tables.ts';
import { stableStringify } from '../../domain/sync/merge.ts';
import { applyRemoteRows, applyTables, emptyCounts, pushedKey, type ApplyCounts } from './apply.ts';
import { readCursor, readMeta, SCHEMA_SIGNATURE, writeMeta } from './meta.ts';
import { enqueueEverything } from './outbox.ts';
import type { PushedDocument, PushedEvent, SyncTransport } from './protocol.ts';

/** Envelope fields of a stored, readable synchronized record. */
const storedRecordSchema = z.looseObject({
  schemaVersion: z.int().positive(),
  updatedAt: z.int().nonnegative().optional(),
  deletedAt: z.int().nonnegative().nullable().optional(),
  at: z.int().nonnegative().optional(),
});

export const PUSH_BATCH = 200;
export const PULL_BATCH = 200;
/** Batches per direction and per synchronization; the rest waits for the next one. */
export const MAX_ROUNDS = 50;

export interface SyncReport extends ApplyCounts {
  /** Records sent. */
  readonly sent: number;
  /** Changes received (pulled, or returned by a push). */
  readonly received: number;
  /** Local records that could not be read, left unsent (they stay in the export). */
  readonly unsent: number;
  /** Whether everything was sent and received (no batch left for next time). */
  readonly complete: boolean;
}

/** Links the local data to `accountId`, queuing everything the first time. */
async function prepareAccount(db: AppDatabase, accountId: string, now: number): Promise<void> {
  const tables = [
    db.table('syncMeta'),
    db.table('syncOutbox'),
    ...SYNCED_TABLE_NAMES.map((name) => db.table(name)),
  ];
  await db.dexie.transaction('rw', tables, async () => {
    if ((await readMeta(db, 'account')) !== accountId) {
      await enqueueEverything(db, now);
      await writeMeta(db, 'account', accountId);
      await writeMeta(db, 'cursor', 0);
      await writeMeta(db, 'schemaSignature', SCHEMA_SIGNATURE);
    } else if ((await readMeta(db, 'schemaSignature')) !== SCHEMA_SIGNATURE) {
      await writeMeta(db, 'cursor', 0);
      await writeMeta(db, 'schemaSignature', SCHEMA_SIGNATURE);
    }
  });
}

interface Batch {
  readonly seqs: number[];
  readonly documents: PushedDocument[];
  readonly events: PushedEvent[];
  /** Content pushed per record (`pushedKey`), to recognize the stale versions. */
  readonly pushed: Map<string, string>;
  unsent: number;
}

/** Reads the next entries of the outbox and the records they name. */
async function readBatch(db: AppDatabase): Promise<Batch | null> {
  const outbox = db.table('syncOutbox');
  const tables = [outbox, ...SYNCED_TABLE_NAMES.map((name) => db.table(name))];
  return db.dexie.transaction('r', tables, async () => {
    const rawEntries: unknown[] = await outbox.limit(PUSH_BATCH).toArray();
    if (rawEntries.length === 0) return null;
    const batch: Batch = { seqs: [], documents: [], events: [], pushed: new Map(), unsent: 0 };
    for (const rawEntry of rawEntries) {
      const entry = syncOutboxEntrySchema.safeParse(rawEntry);
      if (!entry.success) continue;
      const { seq, table: name, docId } = entry.data satisfies SyncOutboxEntry;
      if (seq !== undefined) batch.seqs.push(seq);
      if (!isTableName(name) || !isSyncedTable(name)) continue;
      const raw: unknown = await db.table(name).get(docId);
      if (raw === undefined) continue;
      const record = storedRecordSchema.safeParse(raw);
      if (!parseRecord(name, raw).ok || !record.success) {
        // Never spread a corrupted record; it stays on the device, in the export.
        batch.unsent += 1;
        continue;
      }
      // Sent as stored, with its own schema version (upgraded when read, D-019).
      const { data: doc } = record;
      if (TABLES[name].syncClass === 'document') {
        batch.documents.push({
          collection: name,
          id: docId,
          doc,
          schema_version: doc.schemaVersion,
          updated_at: doc.updatedAt ?? 0,
          deleted: doc.deletedAt !== undefined && doc.deletedAt !== null,
        });
        batch.pushed.set(pushedKey(name, docId), stableStringify(raw));
      } else {
        batch.events.push({
          collection: name,
          id: docId,
          doc,
          schema_version: doc.schemaVersion,
          occurred_at: doc.at ?? 0,
        });
      }
    }
    return batch;
  });
}

/** Synchronizes the local data with the account `accountId`. */
export async function synchronize(
  db: AppDatabase,
  transport: SyncTransport,
  options: { readonly accountId: string; readonly clock: Clock },
): Promise<SyncReport> {
  const { accountId, clock } = options;
  await prepareAccount(db, accountId, clock.now());

  const counts = emptyCounts();
  const add = (more: ApplyCounts) => {
    counts.applied += more.applied;
    counts.kept += more.kept;
    counts.quarantined += more.quarantined;
    counts.deferred += more.deferred;
    counts.conflicts += more.conflicts;
  };
  let sent = 0;
  let received = 0;
  let unsent = 0;
  let complete = true;

  for (let round = 0; ; round += 1) {
    const batch = await readBatch(db);
    if (batch === null) break;
    if (round >= MAX_ROUNDS) {
      complete = false;
      break;
    }
    const { stale } =
      batch.documents.length + batch.events.length > 0
        ? await transport.push(batch.documents, batch.events)
        : { stale: [] };
    await db.dexie.transaction('rw', applyTables(db), async () => {
      add(await applyRemoteRows(db, stale, clock.now(), batch.pushed));
      await db.table('syncOutbox').bulkDelete(batch.seqs);
    });
    sent += batch.documents.length + batch.events.length;
    received += stale.length;
    unsent += batch.unsent;
  }

  for (let round = 0; ; round += 1) {
    if (round >= MAX_ROUNDS) {
      complete = false;
      break;
    }
    const cursor = await readCursor(db);
    const rows = await transport.pull(cursor, PULL_BATCH);
    if (rows.length === 0) break;
    await db.dexie.transaction('rw', applyTables(db), async () => {
      add(await applyRemoteRows(db, rows, clock.now()));
      const last = Math.max(cursor, ...rows.map((row) => row.server_seq));
      await writeMeta(db, 'cursor', last);
    });
    received += rows.length;
    if (rows.length < PULL_BATCH) break;
  }

  if (complete) await writeMeta(db, 'lastSyncAt', clock.now());
  return { ...counts, sent, received, unsent, complete };
}
