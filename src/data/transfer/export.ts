/**
 * Complete JSON export (MOD-12): every table holding the learner's data, with
 * records exactly as stored, so that nothing is lost, not even a record the
 * current version cannot read. The export stays on the device (SEC-03).
 */
import type { AppDatabase } from '../database.ts';
import { TABLE_NAMES, TABLES } from '../tables.ts';
import { EXPORT_APP, EXPORT_FORMAT_VERSION, type ExportEnvelope } from './envelope.ts';

export const EXPORTED_TABLES = TABLE_NAMES.filter((name) => TABLES[name].exported);

export async function exportDatabase(db: AppDatabase, now: number): Promise<ExportEnvelope> {
  const tables = EXPORTED_TABLES.map((name) => db.table(name));
  return db.dexie.transaction('r', tables, async () => {
    const content: Record<string, unknown[]> = {};
    for (const name of EXPORTED_TABLES) {
      content[name] = await db.table(name).toArray();
    }
    return {
      app: EXPORT_APP,
      formatVersion: EXPORT_FORMAT_VERSION,
      exportedAt: now,
      databaseVersion: db.dexie.verno,
      tables: content,
    };
  });
}
