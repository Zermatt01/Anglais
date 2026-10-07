/**
 * Personal notes of the rule book (MOD-10, `ruleNotes`): one per category,
 * keyed by the category so that two devices edit the same document (D-044).
 * A note that cannot be read is set aside before being replaced (NO-06).
 */
import { nextUpdatedAt, type Clock } from '../../domain/primitives.ts';
import type { ErrorCategory } from '../../domain/taxonomy.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, setAsideIfUnreadable, writeRecord } from '../records.ts';

export interface RuleNoteRepository {
  /** Notes by category; unreadable or removed ones are left out. */
  all(): Promise<ReadonlyMap<ErrorCategory, string>>;
  save(category: ErrorCategory, note: string): Promise<void>;
}

/** `updatedAt` of a stored record, readable or not. */
function updatedAtOf(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null || !('updatedAt' in raw)) return null;
  return typeof raw.updatedAt === 'number' ? raw.updatedAt : null;
}

export function createRuleNoteRepository(db: AppDatabase, clock: Clock): RuleNoteRepository {
  const table = db.table('ruleNotes');

  return {
    async all() {
      const raws: unknown[] = await table.toArray();
      const notes = new Map<ErrorCategory, string>();
      for (const raw of raws) {
        const parsed = parseRecord('ruleNotes', raw);
        if (parsed.ok && parsed.value.deletedAt === null) {
          notes.set(parsed.value.category, parsed.value.note);
        }
      }
      return notes;
    },

    save(category, note) {
      return db.dexie.transaction(
        'rw',
        [table, db.table('quarantine'), db.table('syncOutbox')],
        async () => {
          const now = clock.now();
          await setAsideIfUnreadable(db, 'ruleNotes', category, now);
          const raw: unknown = await table.get(category);
          const parsed = raw === undefined ? undefined : parseRecord('ruleNotes', raw);
          const previous = parsed?.ok === true ? parsed.value : null;
          await writeRecord(
            db,
            'ruleNotes',
            {
              category,
              createdAt: previous?.createdAt ?? now,
              // Even an unreadable note, just set aside, orders the writes.
              updatedAt: nextUpdatedAt(updatedAtOf(raw), now),
              deletedAt: null,
              schemaVersion: 1,
              note,
            },
            now,
          );
        },
      );
    },
  };
}
