/** State of the synchronization in the local table `syncMeta`. */
import type { z } from 'zod';
import { DATABASE_VERSIONS, latestVersion, type AppDatabase } from '../database.ts';
import { syncMetaSchema } from '../schemas/local.ts';
import { SYNCED_TABLE_NAMES, TABLES } from '../tables.ts';

type SyncMeta = z.infer<typeof syncMetaSchema>;
export type SyncMetaKey = SyncMeta['key'];

/** Value stored under `key`, or `undefined` if absent or unreadable. */
export async function readMeta(db: AppDatabase, key: SyncMetaKey): Promise<unknown> {
  const parsed = syncMetaSchema.safeParse(await db.table('syncMeta').get(key));
  return parsed.success ? parsed.data.value : undefined;
}

export async function writeMeta(
  db: AppDatabase,
  key: SyncMetaKey,
  value: SyncMeta['value'],
): Promise<void> {
  await db.table('syncMeta').put(syncMetaSchema.parse({ key, value }));
}

/**
 * Schema versions of this build of the app. When it changes (new table, new
 * record version), everything is pulled again: records skipped because they
 * came from a newer version of the app are then applied (D-063).
 */
export const SCHEMA_SIGNATURE = [
  `db${String(latestVersion(DATABASE_VERSIONS))}`,
  ...SYNCED_TABLE_NAMES.map((name) => `${name}${String(TABLES[name].schemaVersion)}`),
].join(';');

/** Where the last pull stopped. */
export async function readCursor(db: AppDatabase): Promise<number> {
  const cursor = await readMeta(db, 'cursor');
  return typeof cursor === 'number' && Number.isSafeInteger(cursor) && cursor >= 0 ? cursor : 0;
}

/** End of the last complete synchronization, or `null`. */
export async function readLastSyncAt(db: AppDatabase): Promise<number | null> {
  const value = await readMeta(db, 'lastSyncAt');
  return typeof value === 'number' ? value : null;
}
