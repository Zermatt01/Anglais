/**
 * Persistent storage (D-019): asks the browser not to evict IndexedDB, which
 * holds the only copy of the data until the synchronization exists (phase 2).
 * Chrome grants it silently (no prompt), typically to installed apps.
 */

export type PersistenceStatus = 'persisted' | 'not-persisted' | 'unsupported';

/** The subset of `navigator.storage` used here, injectable for tests. */
export interface StorageManagerLike {
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

function defaultStorage(): StorageManagerLike | undefined {
  return typeof navigator === 'undefined' ? undefined : navigator.storage;
}

/** Current state, without asking for anything. */
export async function getPersistenceStatus(
  storage: StorageManagerLike | undefined = defaultStorage(),
): Promise<PersistenceStatus> {
  if (storage?.persisted === undefined) return 'unsupported';
  try {
    return (await storage.persisted()) ? 'persisted' : 'not-persisted';
  } catch {
    return 'unsupported';
  }
}

/** Asks for persistent storage (no prompt in Chrome) and returns the resulting state. */
export async function requestPersistentStorage(
  storage: StorageManagerLike | undefined = defaultStorage(),
): Promise<PersistenceStatus> {
  if (storage?.persist === undefined) return 'unsupported';
  try {
    return (await storage.persist()) ? 'persisted' : 'not-persisted';
  } catch {
    return 'unsupported';
  }
}
