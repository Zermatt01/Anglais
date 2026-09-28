import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { VALID_RECORDS } from '../../test/fixtures.ts';
import { readRecord } from '../records.ts';
import { createSettingsRepository } from './settings-repository.ts';

async function setup() {
  const db = await createTestDatabase();
  const clock = createTestClock();
  return { db, clock, repository: createSettingsRepository(db, clock) };
}

describe('settings repository', () => {
  it('returns the defaults without storing them', async () => {
    const { db, repository } = await setup();
    expect(await repository.load()).toEqual({ values: DEFAULT_SETTINGS, stored: 'absent' });
    expect(await db.table('settings').count()).toBe(0);
  });

  it('stores a change on top of the defaults', async () => {
    const { db, clock, repository } = await setup();
    const values = await repository.update({ theme: 'dark' });
    expect(values).toEqual({ ...DEFAULT_SETTINGS, theme: 'dark' });
    expect(await repository.load()).toEqual({ values, stored: 'valid' });

    const stored = await readRecord(db, 'settings', 'settings');
    expect(stored?.ok && stored.value).toMatchObject({
      createdAt: clock.now(),
      updatedAt: clock.now(),
      deletedAt: null,
      schemaVersion: 1,
    });
  });

  it('keeps the creation time and increases updatedAt strictly, even if the clock goes back', async () => {
    const { db, clock, repository } = await setup();
    await repository.update({ theme: 'dark' });
    const createdAt = clock.now();
    clock.advance(-60_000);
    await repository.update({ englishVariant: 'en-US' });

    const stored = await readRecord(db, 'settings', 'settings');
    expect(stored?.ok && stored.value).toMatchObject({
      theme: 'dark',
      englishVariant: 'en-US',
      createdAt,
      updatedAt: createdAt + 1,
    });
  });

  it('merges nested groups, so that quick successive changes keep each other', async () => {
    const { repository } = await setup();
    await Promise.all([
      repository.update({ learnerProfile: { domains: ['finance'] } }),
      repository.update({ learnerProfile: { remarks: 'Stage en finance' } }),
      repository.update({ speech: { rate: 0.8 } }),
    ]);
    expect((await repository.load()).values).toMatchObject({
      learnerProfile: { domains: ['finance'], remarks: 'Stage en finance' },
      speech: { voiceUri: null, rate: 0.8 },
    });
  });

  it('refuses an invalid change and keeps the stored settings', async () => {
    const { repository } = await setup();
    await repository.update({ newCardsPerDay: 15 });
    await expect(repository.update({ newCardsPerDay: -3 })).rejects.toThrow();
    expect((await repository.load()).values.newCardsPerDay).toBe(15);
  });

  it('reports unreadable stored settings and falls back to the defaults', async () => {
    const { db, repository } = await setup();
    await db.table('settings').put({ ...VALID_RECORDS.settings, theme: 'purple', updatedAt: 9e12 });
    expect(await repository.load()).toEqual({ values: DEFAULT_SETTINGS, stored: 'invalid' });

    // A later change replaces them, with an updatedAt that still increases,
    // after setting the unreadable version aside (NO-06).
    await repository.update({ theme: 'light' });
    const stored = await readRecord(db, 'settings', 'settings');
    expect(stored?.ok && stored.value.updatedAt).toBe(9e12 + 1);
    const [setAside] = await db.table('quarantine').toArray();
    expect(setAside).toMatchObject({
      table: 'settings',
      key: 'settings',
      record: { theme: 'purple', updatedAt: 9e12 },
    });
  });

  it('sets nothing aside when the stored settings are readable', async () => {
    const { db, repository } = await setup();
    await repository.update({ theme: 'dark' });
    await repository.update({ theme: 'light' });
    expect(await db.table('quarantine').count()).toBe(0);
  });

  it('treats logically deleted settings as absent', async () => {
    const { db, repository } = await setup();
    await db.table('settings').put({ ...VALID_RECORDS.settings, theme: 'dark', deletedAt: 1 });
    expect(await repository.load()).toEqual({ values: DEFAULT_SETTINGS, stored: 'absent' });
  });
});
