/**
 * Drafts of typed text (UI-03, NO-06): saved locally at each typing pause and
 * deleted once the text has been submitted. Never synchronized.
 */
import type { Clock } from '../../domain/primitives.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, writeRecord } from '../records.ts';

export interface DraftRepository {
  /** The saved draft, or `null` when there is none (or it is unreadable). */
  get(key: string): Promise<string | null>;
  /** Saves the text; an empty text removes the draft. */
  save(key: string, text: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export function createDraftRepository(db: AppDatabase, clock: Clock): DraftRepository {
  const table = db.table('drafts');

  return {
    async get(key) {
      const raw = await table.get(key);
      if (raw === undefined) return null;
      const parsed = parseRecord('drafts', raw);
      if (!parsed.ok) {
        // No detail: a draft is the learner's text, which never goes to the logs (SEC-03).
        console.warn('An unreadable draft was ignored.');
        return null;
      }
      return parsed.value.text;
    },

    async save(key, text) {
      if (text.length === 0) {
        await table.delete(key);
        return;
      }
      await writeRecord(db, 'drafts', { key, text, updatedAt: clock.now() });
    },

    async remove(key) {
      await table.delete(key);
    },
  };
}
