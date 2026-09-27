import { describe, expect, it } from 'vitest';
import { createTestDatabase } from '../test/database.ts';
import {
  DATABASE_VERSIONS,
  findNonAdditiveChanges,
  latestVersion,
  parseStoreDeclaration,
  type DatabaseVersion,
} from './database.ts';
import { TABLE_NAMES, TABLES } from './tables.ts';

const latest = DATABASE_VERSIONS.find((entry) => entry.version === latestVersion());

describe('database versions', () => {
  it('declare every registered table in the latest version, and nothing else', () => {
    expect(Object.keys(latest?.stores ?? {}).sort()).toEqual([...TABLE_NAMES].sort());
  });

  it.each(TABLE_NAMES)('use the registered primary key for %s', (name) => {
    const declaration = latest?.stores[name] ?? '';
    expect(parseStoreDeclaration(declaration).primaryKey).toBe(TABLES[name].primaryKey);
  });

  it('are additive only (D-019)', () => {
    expect(findNonAdditiveChanges(DATABASE_VERSIONS)).toEqual([]);
  });
});

describe('findNonAdditiveChanges', () => {
  const v1: DatabaseVersion = { version: 1, stores: { a: 'id, name', b: '++seq' } };

  it('accepts new tables and new indexes', () => {
    const v2 = { version: 2, stores: { a: 'id, name, age', b: '++seq', c: 'key' } };
    expect(findNonAdditiveChanges([v1, v2])).toEqual([]);
  });

  it('reports a removed table, a changed primary key and a removed index', () => {
    const v2 = { version: 2, stores: { a: 'uuid' } };
    expect(findNonAdditiveChanges([v1, v2])).toEqual([
      'version 2 changes the primary key of a',
      'version 2 removes index name of a',
      'version 2 removes table b',
    ]);
  });

  it('reports a change of auto-increment on the primary key', () => {
    expect(
      findNonAdditiveChanges([v1, { version: 2, stores: { ...v1.stores, b: 'seq' } }]),
    ).toEqual(['version 2 changes the primary key of b']);
  });

  it('reports versions out of order', () => {
    expect(findNonAdditiveChanges([v1, { ...v1, version: 1 }])).toEqual([
      'version 1 does not follow 1',
    ]);
  });
});

describe('createDatabase', () => {
  it('opens a database with every table', async () => {
    const db = await createTestDatabase();
    expect(db.dexie.tables.map((table) => table.name).sort()).toEqual([...TABLE_NAMES].sort());
    db.dexie.close();
  });
});
