/**
 * Drafts of typed text (UI-03, NO-06): saved locally at each typing pause and
 * deleted once the text has been submitted. Never synchronized.
 *
 * A draft that cannot be read is reported as such, never mistaken for an
 * absent one, and is set aside in `quarantine` before a new draft replaces it
 * or the field is emptied.
 */
import type { Clock } from '../../domain/primitives.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, setAsideIfUnreadable, writeRecord } from '../records.ts';

export type StoredDraft =
  | { readonly state: 'absent' }
  | { readonly state: 'present'; readonly text: string }
  /** Stored but unreadable: it will be set aside, never silently overwritten. */
  | { readonly state: 'unreadable' };

export interface DraftRepository {
  get(key: string): Promise<StoredDraft>;
  /** Saves the text; an empty text removes the draft. */
  save(key: string, text: string): Promise<void>;
  /**
   * Saves the text only where no draft is stored, readable or not: a text
   * typed meanwhile is never replaced. True when it was saved.
   */
  saveIfAbsent(key: string, text: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

export function createDraftRepository(db: AppDatabase, clock: Clock): DraftRepository {
  const table = db.table('drafts');

  /** Runs a write on `key` after setting an unreadable draft aside. */
  function writeSafely(key: string, write: () => Promise<unknown>): Promise<void> {
    return db.dexie.transaction('rw', [table, db.table('quarantine')], async () => {
      await setAsideIfUnreadable(db, 'drafts', key, clock.now());
      await write();
    });
  }

  return {
    async get(key) {
      const raw: unknown = await table.get(key);
      if (raw === undefined) return { state: 'absent' };
      const parsed = parseRecord('drafts', raw);
      return parsed.ok ? { state: 'present', text: parsed.value.text } : { state: 'unreadable' };
    },

    save(key, text) {
      if (text.length === 0) return writeSafely(key, () => table.delete(key));
      return writeSafely(key, () => {
        const now = clock.now();
        return writeRecord(db, 'drafts', { key, text, updatedAt: now }, now);
      });
    },

    saveIfAbsent(key, text) {
      return db.dexie.transaction('rw', [table], async () => {
        if (text.length === 0 || (await table.get(key)) !== undefined) return false;
        const now = clock.now();
        await writeRecord(db, 'drafts', { key, text, updatedAt: now }, now);
        return true;
      });
    },

    remove(key) {
      return writeSafely(key, () => table.delete(key));
    },
  };
}
