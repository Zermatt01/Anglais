import { Dexie } from 'dexie';
import { describe, expect, it } from 'vitest';
import { T0, VALID_RECORDS } from '../test/fixtures.ts';
import { backupBeforeUpgrade, BACKUPS_KEPT, listBackups, readBackup } from './backup.ts';
import { DATABASE_VERSIONS, type DatabaseVersion } from './database.ts';
import { openAppDatabase } from './open.ts';
import { parseExportText } from './transfer/envelope.ts';

function uniqueNames() {
  const suffix = crypto.randomUUID();
  return { name: `app-${suffix}`, backups: `backups-${suffix}` };
}

/** Version 1 of the real schema, plus a fictional additive version 2. */
const WITH_VERSION_2: readonly DatabaseVersion[] = [
  ...DATABASE_VERSIONS,
  { version: 2, stores: { ...DATABASE_VERSIONS[0]?.stores, futureTable: 'id' } },
];

async function createVersion1WithData(name: string): Promise<void> {
  const db = await openAppDatabase({ now: T0, name, backupDatabaseName: `unused-${name}` });
  await db.table('cards').put(VALID_RECORDS.cards);
  await db.table('settings').put(VALID_RECORDS.settings);
  db.dexie.close();
}

describe('backupBeforeUpgrade', () => {
  it('does nothing for a database that does not exist yet', async () => {
    const { name, backups } = uniqueNames();
    expect(
      await backupBeforeUpgrade({
        databaseName: name,
        targetVersion: 1,
        now: T0,
        backupDatabaseName: backups,
      }),
    ).toBe(false);
    expect(await Dexie.exists(name)).toBe(false);
    expect(await listBackups(backups)).toEqual([]);
  });

  it('does nothing when the database is already at the target version', async () => {
    const { name, backups } = uniqueNames();
    await createVersion1WithData(name);
    expect(
      await backupBeforeUpgrade({
        databaseName: name,
        targetVersion: 1,
        now: T0,
        backupDatabaseName: backups,
      }),
    ).toBe(false);
  });

  it('saves every table before an upgrade, in the export format', async () => {
    const { name, backups } = uniqueNames();
    await createVersion1WithData(name);

    expect(
      await backupBeforeUpgrade({
        databaseName: name,
        targetVersion: 2,
        now: T0 + 5,
        backupDatabaseName: backups,
      }),
    ).toBe(true);

    const [summary] = await listBackups(backups);
    expect(summary).toMatchObject({ createdAt: T0 + 5, fromVersion: 1, toVersion: 2 });
    const json = await readBackup(summary?.id ?? -1, backups);
    const parsed = parseExportText(json ?? '');
    expect(parsed.ok && parsed.envelope.tables.cards).toEqual([VALID_RECORDS.cards]);
    expect(parsed.ok && parsed.envelope.tables.settings).toEqual([VALID_RECORDS.settings]);
  });

  it(`keeps the ${String(BACKUPS_KEPT)} most recent backups`, async () => {
    const { name, backups } = uniqueNames();
    await createVersion1WithData(name);
    for (let index = 0; index < BACKUPS_KEPT + 2; index += 1) {
      await backupBeforeUpgrade({
        databaseName: name,
        targetVersion: 2,
        now: T0 + index,
        backupDatabaseName: backups,
      });
    }
    const kept = await listBackups(backups);
    expect(kept.map((backup) => backup.createdAt)).toEqual([T0 + 4, T0 + 3, T0 + 2]);
  });
});

describe('openAppDatabase', () => {
  it('backs up, then upgrades, keeping every record (NO-06)', async () => {
    const { name, backups } = uniqueNames();
    await createVersion1WithData(name);

    const db = await openAppDatabase({
      now: T0 + 1,
      name,
      versions: WITH_VERSION_2,
      backupDatabaseName: backups,
    });
    expect(db.dexie.verno).toBe(2);
    expect(await db.table('cards').toArray()).toEqual([VALID_RECORDS.cards]);
    expect(await listBackups(backups)).toHaveLength(1);
    db.dexie.close();
  });

  it('creates a new database without any backup', async () => {
    const { name, backups } = uniqueNames();
    const db = await openAppDatabase({ now: T0, name, backupDatabaseName: backups });
    expect(db.dexie.verno).toBe(1);
    expect(await listBackups(backups)).toEqual([]);
    db.dexie.close();
  });

  it('returns null for a backup that no longer exists', async () => {
    const { backups } = uniqueNames();
    expect(await readBackup(12345, backups)).toBeNull();
  });
});
