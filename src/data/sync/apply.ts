/**
 * Applies the changes received from the server (docs/ARCHITECTURE.md §7,
 * D-063). Nothing is ever lost (NO-06):
 * - a received record that cannot be read is copied into `quarantine`;
 * - a record written by a newer version of the app, or of a table this
 *   version does not know, is left on the server and applied after the app
 *   is updated (the cursor starts again from zero, `SCHEMA_SIGNATURE`);
 * - a local record that cannot be read is set aside before being replaced;
 * - a lexicon entry whose expression already exists locally under another
 *   identifier (unique key, D-044) is copied into `quarantine`.
 *
 * Received records are stored as they are, without being queued again.
 */
import {
  decideRemoteVersion,
  stableStringify,
  type RemoteSource,
} from '../../domain/sync/merge.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, setAsideIfUnreadable, writeRecord } from '../records.ts';
import {
  isSyncedTable,
  isTableName,
  primaryKeyOf,
  SYNCED_TABLE_NAMES,
  TABLES,
  type TableName,
} from '../tables.ts';
import type { RemoteRow } from './protocol.ts';

export interface ApplyCounts {
  applied: number;
  kept: number;
  quarantined: number;
  /** Left on the server until the app is updated. */
  deferred: number;
}

export function emptyCounts(): ApplyCounts {
  return { applied: 0, kept: 0, quarantined: 0, deferred: 0 };
}

/** Tables of a transaction that applies received changes. */
export function applyTables(db: AppDatabase) {
  return [
    ...SYNCED_TABLE_NAMES.map((name) => db.table(name)),
    db.table('quarantine'),
    db.table('syncOutbox'),
    db.table('syncMeta'),
  ];
}

function isNewerThanApp(name: TableName, doc: Readonly<Record<string, unknown>>): boolean {
  const current = TABLES[name].schemaVersion;
  return current !== null && typeof doc.schemaVersion === 'number' && doc.schemaVersion > current;
}

function updatedAtOf(record: unknown): number | undefined {
  if (typeof record !== 'object' || record === null) return undefined;
  const value: unknown = Reflect.get(record, 'updatedAt');
  return typeof value === 'number' ? value : undefined;
}

async function quarantine(
  db: AppDatabase,
  row: RemoteRow,
  reason: string,
  now: number,
): Promise<'quarantined'> {
  await writeRecord(
    db,
    'quarantine',
    {
      id: crypto.randomUUID(),
      table: row.collection,
      key: row.id,
      record: row.doc,
      reason: `received from the server: ${reason}`,
      quarantinedAt: now,
    },
    now,
  );
  return 'quarantined';
}

/** Whether another local lexicon entry already has this expression (unique key). */
async function lexiconKeyTaken(db: AppDatabase, row: RemoteRow): Promise<boolean> {
  const key = row.doc.key;
  if (typeof key !== 'string') return false;
  const owner: unknown = await db.table('lexicon').where('key').equals(key).first();
  return owner !== undefined && primaryKeyOf('lexicon', owner) !== row.id;
}

async function applyRow(
  db: AppDatabase,
  row: RemoteRow,
  source: RemoteSource,
  now: number,
): Promise<keyof ApplyCounts> {
  if (!isTableName(row.collection) || !isSyncedTable(row.collection)) return 'deferred';
  const name = row.collection;
  const definition = TABLES[name];
  if ((definition.syncClass === 'document') !== (row.kind === 'document')) {
    return quarantine(db, row, `${row.kind} received for a ${definition.syncClass} table`, now);
  }
  const parsed = parseRecord(name, row.doc);
  if (!parsed.ok) {
    return isNewerThanApp(name, row.doc) ? 'deferred' : quarantine(db, row, parsed.reason, now);
  }
  if (primaryKeyOf(name, row.doc) !== row.id) {
    return quarantine(db, row, 'the key of the record differs from its identifier', now);
  }

  const table = db.table(name);
  const raw: unknown = await table.get(row.id);

  if (definition.syncClass === 'event') {
    if (raw !== undefined) return 'kept';
    await table.put(row.doc);
    return 'applied';
  }

  const remoteUpdatedAt = updatedAtOf(parsed.value);
  if (remoteUpdatedAt !== row.updated_at) {
    return quarantine(db, row, 'updatedAt differs from the stored time', now);
  }
  const outboxEntry = db.table('syncOutbox').where('[table+docId]').equals([name, row.id]);
  const local = raw === undefined ? undefined : parseRecord(name, raw);
  const localUpdatedAt = local?.ok === true ? updatedAtOf(local.value) : undefined;
  const localVersion =
    localUpdatedAt === undefined
      ? undefined
      : {
          updatedAt: localUpdatedAt,
          pending: (await outboxEntry.count()) > 0,
          sameContent: stableStringify(raw) === stableStringify(row.doc),
        };
  if (decideRemoteVersion(localVersion, remoteUpdatedAt, source) === 'keep') return 'kept';
  if (name === 'lexicon' && (await lexiconKeyTaken(db, row))) {
    return quarantine(db, row, 'this expression already exists under another identifier', now);
  }

  await setAsideIfUnreadable(db, name, row.id, now);
  await table.put(row.doc);
  // The local version waiting to be sent is superseded: nothing left to send.
  await outboxEntry.delete();
  return 'applied';
}

/**
 * Applies received rows. `pushed` gives, for the stale versions returned by a
 * push, the `updatedAt` that was pushed (key: `table/id`). Must run in a
 * transaction covering `applyTables(db)`.
 */
export async function applyRemoteRows(
  db: AppDatabase,
  rows: readonly RemoteRow[],
  now: number,
  pushed?: ReadonlyMap<string, number>,
): Promise<ApplyCounts> {
  const counts = emptyCounts();
  for (const row of rows) {
    const pushedUpdatedAt = pushed?.get(`${row.collection}/${row.id}`);
    const source: RemoteSource =
      pushedUpdatedAt === undefined ? { kind: 'pull' } : { kind: 'stale', pushedUpdatedAt };
    counts[await applyRow(db, row, source, now)] += 1;
  }
  return counts;
}
