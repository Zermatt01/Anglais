import { describe, expect, it, vi } from 'vitest';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createDraftRepository } from './draft-repository.ts';

async function setup() {
  const db = await createTestDatabase();
  return { db, repository: createDraftRepository(db, createTestClock()) };
}

describe('draft repository', () => {
  it('saves, reads and removes a draft', async () => {
    const { repository } = await setup();
    expect(await repository.get('theme:1')).toBeNull();
    await repository.save('theme:1', 'I have');
    await repository.save('theme:1', 'I have worked');
    expect(await repository.get('theme:1')).toBe('I have worked');
    await repository.remove('theme:1');
    expect(await repository.get('theme:1')).toBeNull();
  });

  it('keeps drafts of different keys apart', async () => {
    const { repository } = await setup();
    await repository.save('a', 'first');
    await repository.save('b', 'second');
    expect(await repository.get('a')).toBe('first');
    expect(await repository.get('b')).toBe('second');
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
    expect(await repository.get('a')).toBe('  two spaces\nnew line ');
  });

  it('ignores an unreadable draft without logging its content', async () => {
    const { db, repository } = await setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await db.table('drafts').put({ key: 'a', text: 42, updatedAt: 0 });
    expect(await repository.get('a')).toBeNull();
    expect(warn).toHaveBeenCalledWith('An unreadable draft was ignored.');
  });
});
