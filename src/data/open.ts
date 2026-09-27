/**
 * Opening the application database: backup first if an upgrade is pending
 * (D-019), then open at the latest version.
 */
import { backupBeforeUpgrade } from './backup.ts';
import {
  createDatabase,
  DATABASE_NAME,
  DATABASE_VERSIONS,
  latestVersion,
  type AppDatabase,
  type DatabaseVersion,
} from './database.ts';

export async function openAppDatabase(options: {
  readonly now: number;
  readonly name?: string;
  readonly versions?: readonly DatabaseVersion[];
  readonly backupDatabaseName?: string;
}): Promise<AppDatabase> {
  const { now, name = DATABASE_NAME, versions = DATABASE_VERSIONS, backupDatabaseName } = options;
  await backupBeforeUpgrade({
    databaseName: name,
    targetVersion: latestVersion(versions),
    now,
    backupDatabaseName,
  });
  const db = createDatabase(name, versions);
  await db.dexie.open();
  return db;
}
