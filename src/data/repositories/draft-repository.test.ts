import { describe, expect, it } from 'vitest';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createDraftRepository } from './draft-repository.ts';

async function setup() {
  const db = await createTestDatabase();
  return { db, repository: createDraftRepository(db, createTestClock()) };
}

describe('draft repository', () => {
  it('saves, reads and removes a draft', async () => {
    const { repository } = await setup();
    expect(await repository.get('theme:1')).toEqual({ state: 'absent' });
    await repository.save('theme:1', 'I have');
    await repository.save('theme:1', 'I have worked');
    expect(await repository.get('theme:1')).toEqual({ state: 'present', text: 'I have worked' });
    await repository.remove('theme:1');
    expect(await repository.get('theme:1')).toEqual({ state: 'absent' });
  });

  it('keeps drafts of different keys apart', async () => {
    const { repository } = await setup();
    await repository.save('a', 'first');
    await repository.save('b', 'second');
    expect(await repository.get('a')).toEqual({ state: 'present', text: 'first' });
    expect(await repository.get('b')).toEqual({ state: 'present', text: 'second' });
  });

  it('removes the draft when the text is emptied', async () => {
    const { db, repository } = await setup();
    await repository.save('a', 'text');
    await repository.save('a', '');
    expect(await db.table('drafts').count()).toBe(0);
  });

  it('keeps whitespace exactly as typed', async () => {
    const { repository } = await setup();
    await repository.save('a', '  two spaces\nnew line ');
    expect(await repository.get('a')).toEqual({
      state: 'present',
      text: '  two spaces\nnew line ',
    });
  });

  it('reports an unreadable draft as such, never as absent', async () => {
    const { db, repository } = await setup();
    await db.table('drafts').put({ key: 'a', text: 42, updatedAt: 0 });
    expect(await repository.get('a')).toEqual({ state: 'unreadable' });
  });

  it('sets an unreadable draft aside before a new draft replaces it (NO-06)', async () => {
    const { db, repository } = await setup();
    const unreadable = { key: 'a', text: 42, updatedAt: 0 };
    await db.table('drafts').put(unreadable);

    await repository.save('a', 'New text');
    expect(await repository.get('a')).toEqual({ state: 'present', text: 'New text' });
    const [setAside] = await db.table('quarantine').toArray();
    expect(setAside).toMatchObject({ table: 'drafts', key: 'a', record: unreadable });

    // Later writes on the same key set nothing else aside.
    await repository.save('a', 'Newer text');
    expect(await db.table('quarantine').count()).toBe(1);
  });

  it('sets an unreadable draft aside before emptying or removing it', async () => {
    const { db, repository } = await setup();
    await db.table('drafts').put({ key: 'a', text: 42, updatedAt: 0 });
    await repository.save('a', '');
    await db.table('drafts').put({ key: 'b', text: null, updatedAt: 0 });
    await repository.remove('b');

    expect(await db.table('drafts').count()).toBe(0);
    const keys = (await db.table('quarantine').toArray()).map((entry) =>
      typeof entry === 'object' && entry !== null && 'key' in entry ? entry.key : null,
    );
    expect(keys.sort()).toEqual(['a', 'b']);
  });
});
