/**
 * The outbox (docs/ARCHITECTURE.md §7, D-045): every write of a synchronized
 * record adds an entry in the same transaction, so that no write escapes the
 * synchronization. An entry names the record, never copies it: the push sends
 * the record as it is when it is sent.
 */
import type { AppDatabase } from '../database.ts';
import { syncOutboxEntrySchema } from '../schemas/local.ts';
import { SYNCED_TABLE_NAMES, type TableName } from '../tables.ts';

/**
 * Queues a write of `table`/`key`. The previous entry of the same record is
 * replaced by a new one, with a higher sequence number: a push that read the
 * previous entry deletes only that one, and the newer write is sent next time.
 * Must run in a transaction covering `syncOutbox`.
 */
export async function enqueueChange(
  db: AppDatabase,
  table: TableName,
  key: string,
  now: number,
): Promise<void> {
  const outbox = db.table('syncOutbox');
  await outbox.where('[table+docId]').equals([table, key]).delete();
  await outbox.add(syncOutboxEntrySchema.parse({ table, docId: key, queuedAt: now }));
}

/**
 * Queues every synchronized record (D-045): the first synchronization of an
 * account sends everything written so far. Must run in a transaction
 * covering `syncOutbox` and the synchronized tables.
 */
export async function enqueueEverything(db: AppDatabase, now: number): Promise<number> {
  const outbox = db.table('syncOutbox');
  await outbox.clear();
  let count = 0;
  for (const table of SYNCED_TABLE_NAMES) {
    const keys = await db.table(table).toCollection().primaryKeys();
    const entries = keys
      .filter((key): key is string => typeof key === 'string')
      .map((docId) => syncOutboxEntrySchema.parse({ table, docId, queuedAt: now }));
    await outbox.bulkAdd(entries);
    count += entries.length;
  }
  return count;
}

/** Number of records waiting to be sent. */
export function countPending(db: AppDatabase): Promise<number> {
  return db.table('syncOutbox').count();
}

/** Sequence number of the latest queued write, or `null`: changes at each write. */
export async function lastPendingSeq(db: AppDatabase): Promise<number | null> {
  const [seq] = await db.table('syncOutbox').toCollection().reverse().limit(1).primaryKeys();
  return typeof seq === 'number' ? seq : null;
}
