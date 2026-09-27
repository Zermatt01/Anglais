/**
 * Automatic backup before a database upgrade (D-019, NO-06).
 *
 * Before the application opens the database at a newer version, the existing
 * database is opened as it is (Dexie "dynamic mode", no schema declared) and
 * every table is copied into a separate backup database, in the export format.
 * If the backup fails, the upgrade does not happen. The three most recent
 * backups are kept and can be downloaded from the settings.
 */
import { Dexie } from 'dexie';
import { z } from 'zod';
import { epochMsSchema } from '../domain/primitives.ts';
import { EXPORT_APP, EXPORT_FORMAT_VERSION, type ExportEnvelope } from './transfer/envelope.ts';

export const BACKUP_DATABASE_NAME = 'anglais-backups';
export const BACKUPS_KEPT = 3;

const backupSchema = z.strictObject({
  id: z.int().positive(),
  createdAt: epochMsSchema,
  fromVersion: z.int().positive(),
  toVersion: z.int().positive(),
  /** The export envelope, serialized. */
  json: z.string(),
});
export type Backup = z.infer<typeof backupSchema>;
export type BackupSummary = Omit<Backup, 'json'>;

function openBackups(name: string): Dexie {
  const dexie = new Dexie(name);
  dexie.version(1).stores({ backups: '++id, createdAt' });
  return dexie;
}

async function dumpDatabase(name: string, now: number): Promise<ExportEnvelope> {
  const current = new Dexie(name);
  await current.open();
  try {
    const tables: Record<string, unknown[]> = {};
    for (const table of current.tables) {
      tables[table.name] = await table.toArray();
    }
    return {
      app: EXPORT_APP,
      formatVersion: EXPORT_FORMAT_VERSION,
      exportedAt: now,
      databaseVersion: current.verno,
      tables,
    };
  } finally {
    current.close();
  }
}

/**
 * Backs the database up if it exists at a version older than `targetVersion`.
 * Returns whether a backup was made. Throws if the backup could not be saved.
 */
export async function backupBeforeUpgrade(options: {
  readonly databaseName: string;
  readonly targetVersion: number;
  readonly now: number;
  readonly backupDatabaseName?: string;
}): Promise<boolean> {
  const { databaseName, targetVersion, now, backupDatabaseName = BACKUP_DATABASE_NAME } = options;
  if (!(await Dexie.exists(databaseName))) return false;

  const envelope = await dumpDatabase(databaseName, now);
  if (envelope.databaseVersion >= targetVersion) return false;

  const backups = openBackups(backupDatabaseName);
  try {
    await backups.transaction('rw', 'backups', async () => {
      const table = backups.table('backups');
      await table.add({
        createdAt: now,
        fromVersion: envelope.databaseVersion,
        toVersion: targetVersion,
        json: JSON.stringify(envelope),
      });
      const ids = await table.orderBy('createdAt').primaryKeys();
      await table.bulkDelete(ids.slice(0, Math.max(0, ids.length - BACKUPS_KEPT)));
    });
  } finally {
    backups.close();
  }
  return true;
}

/** Backups available on the device, most recent first. */
export async function listBackups(
  backupDatabaseName: string = BACKUP_DATABASE_NAME,
): Promise<BackupSummary[]> {
  if (!(await Dexie.exists(backupDatabaseName))) return [];
  const backups = openBackups(backupDatabaseName);
  try {
    const rows = await backups.table('backups').orderBy('createdAt').reverse().toArray();
    return rows.flatMap((row: unknown) => {
      const parsed = backupSchema.safeParse(row);
      if (!parsed.success) return [];
      const { id, createdAt, fromVersion, toVersion } = parsed.data;
      return [{ id, createdAt, fromVersion, toVersion }];
    });
  } finally {
    backups.close();
  }
}

/** Serialized export envelope of one backup, or `null` if it no longer exists. */
export async function readBackup(
  id: number,
  backupDatabaseName: string = BACKUP_DATABASE_NAME,
): Promise<string | null> {
  const backups = openBackups(backupDatabaseName);
  try {
    const parsed = backupSchema.safeParse(await backups.table('backups').get(id));
    return parsed.success ? parsed.data.json : null;
  } finally {
    backups.close();
  }
}
