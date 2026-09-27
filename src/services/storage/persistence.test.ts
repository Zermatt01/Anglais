import { describe, expect, it } from 'vitest';
import { getPersistenceStatus, requestPersistentStorage } from './persistence.ts';

describe('persistent storage', () => {
  it('reports the current state', async () => {
    expect(await getPersistenceStatus({ persisted: () => Promise.resolve(true) })).toBe(
      'persisted',
    );
    expect(await getPersistenceStatus({ persisted: () => Promise.resolve(false) })).toBe(
      'not-persisted',
    );
  });

  it('asks for persistence', async () => {
    expect(await requestPersistentStorage({ persist: () => Promise.resolve(true) })).toBe(
      'persisted',
    );
    expect(await requestPersistentStorage({ persist: () => Promise.resolve(false) })).toBe(
      'not-persisted',
    );
  });

  it('handles browsers without the Storage API, or failing calls', async () => {
    expect(await getPersistenceStatus({})).toBe('unsupported');
    expect(await requestPersistentStorage({})).toBe('unsupported');
    expect(
      await requestPersistentStorage({ persist: () => Promise.reject(new Error('denied')) }),
    ).toBe('unsupported');
  });
});
