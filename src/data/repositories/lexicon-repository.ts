/**
 * "Mon lexique" (MOD-09): one entry per expression, never two (unique key).
 *
 * The identifier of an entry is derived from its normalized expression (D-063,
 * D-085): two devices that add the same expression create the same document,
 * which the synchronization merges instead of setting one aside. An entry
 * comes with its collocation card, created in the same transaction; removing
 * the entry removes its card.
 */
import {
  collocationCardOf,
  lexiconKey,
  MAX_EXAMPLE,
  MAX_EXPRESSION,
  MAX_MEANING,
} from '../../domain/lexicon.ts';
import { nextUpdatedAt, type Clock } from '../../domain/primitives.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, readRecord, writeRecord } from '../records.ts';
import type { LexiconDocument } from '../schemas/lexicon.ts';
import type { CardRepository } from './card-repository.ts';

export interface NewLexiconEntry {
  readonly expression: string;
  readonly meaningFr: string;
  readonly example: string;
  readonly source: LexiconDocument['source'];
}

export type LexiconAddition =
  | { readonly ok: true; readonly entry: LexiconDocument; readonly withCard: boolean }
  | { readonly ok: false; readonly reason: 'duplicate' | 'invalid' };

export interface LexiconRepository {
  add(entry: NewLexiconEntry): Promise<LexiconAddition>;
  remove(id: string): Promise<void>;
  /** Readable entries, the newest first. */
  list(): Promise<LexiconDocument[]>;
}

/**
 * Identifier derived from a key: a version 8 UUID (RFC 9562) made of the
 * SHA-256 digest of the key, the same on every device.
 */
export async function lexiconIdOf(key: string): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`lexicon:${key}`)),
  );
  const bytes = digest.slice(0, 16);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x80;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const hasText = (text: string): boolean => /\S/.test(text);

export function createLexiconRepository(
  db: AppDatabase,
  clock: Clock,
  cards: CardRepository,
): LexiconRepository {
  const table = db.table('lexicon');
  const tables = [table, db.table('cards'), db.table('syncOutbox')];

  return {
    async add({ expression, meaningFr, example, source }) {
      const text = {
        expression: expression.trim(),
        meaningFr: meaningFr.trim(),
        example: example.trim(),
      };
      const key = lexiconKey(text.expression);
      if (
        key === '' ||
        !hasText(text.meaningFr) ||
        text.expression.length > MAX_EXPRESSION ||
        text.meaningFr.length > MAX_MEANING ||
        text.example.length > MAX_EXAMPLE
      ) {
        return { ok: false, reason: 'invalid' };
      }
      // Computed before the transaction: it may only wait for the database.
      const derivedId = await lexiconIdOf(key);
      return db.dexie.transaction('rw', tables, async (): Promise<LexiconAddition> => {
        const now = clock.now();
        const owner: unknown = await table.where('key').equals(key).first();
        const previous = owner === undefined ? undefined : parseRecord('lexicon', owner);
        // An unreadable entry with this key is never replaced (NO-06).
        if (previous !== undefined && !previous.ok) return { ok: false, reason: 'duplicate' };
        if (previous?.ok === true && previous.value.deletedAt === null) {
          return { ok: false, reason: 'duplicate' };
        }
        const card = collocationCardOf(text);
        const created =
          card === null ? null : await cards.create({ content: card, origin: 'lexicon' });
        const entry: LexiconDocument = {
          // A removed entry with this key comes back under its identifier.
          id: previous?.ok === true ? previous.value.id : derivedId,
          createdAt: previous?.ok === true ? previous.value.createdAt : now,
          updatedAt: nextUpdatedAt(previous?.ok === true ? previous.value.updatedAt : null, now),
          deletedAt: null,
          schemaVersion: 1,
          key,
          ...text,
          source,
          cardId: created?.ok === true ? created.card.id : null,
        };
        await writeRecord(db, 'lexicon', entry, now);
        return { ok: true, entry, withCard: entry.cardId !== null };
      });
    },

    remove(id) {
      return db.dexie.transaction('rw', tables, async () => {
        const stored = await readRecord(db, 'lexicon', id);
        if (!stored?.ok || stored.value.deletedAt !== null) return;
        const now = clock.now();
        await writeRecord(
          db,
          'lexicon',
          {
            ...stored.value,
            deletedAt: now,
            updatedAt: nextUpdatedAt(stored.value.updatedAt, now),
          },
          now,
        );
        if (stored.value.cardId !== null) await cards.remove(stored.value.cardId);
      });
    },

    async list() {
      const raws: unknown[] = await table.toArray();
      return raws
        .map((raw) => parseRecord('lexicon', raw))
        .flatMap((parsed) => (parsed.ok && parsed.value.deletedAt === null ? [parsed.value] : []))
        .sort((a, b) => b.createdAt - a.createdAt);
    },
  };
}
