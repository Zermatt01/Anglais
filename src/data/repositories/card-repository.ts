/**
 * Card repository. Every card creation goes through `isCardSolvable`
 * (CARD-01, NO-03): an unsolvable card is refused and nothing is written.
 */
import type { CardContent, CardOrigin, SuspensionReason } from '../../domain/cards/content.ts';
import { notionOfCard } from '../../domain/cards/content.ts';
import { isCardSolvable, type SolvabilityIssue } from '../../domain/cards/solvability.ts';
import type { Clock } from '../../domain/primitives.ts';
import type { SpacedRepetitionScheduler } from '../../domain/srs/scheduler.ts';
import type { AppDatabase } from '../database.ts';
import { readRecord, writeRecord, type ParsedRecord } from '../records.ts';
import type { CardDocument } from '../schemas/cards.ts';

export interface NewCard {
  readonly content: CardContent;
  readonly origin: CardOrigin;
  readonly sourceErrorId?: string | null;
  /** Created suspended, for example while its notion is not studied yet (D-025). */
  readonly suspensionReason?: Exclude<SuspensionReason, 'unsolvable'> | null;
}

export type CardCreation =
  | { readonly ok: true; readonly card: CardDocument }
  | { readonly ok: false; readonly issues: readonly SolvabilityIssue[] };

export interface CardRepository {
  create(card: NewCard): Promise<CardCreation>;
  get(id: string): Promise<ParsedRecord<CardDocument> | undefined>;
}

export function createCardRepository(
  db: AppDatabase,
  clock: Clock,
  scheduler: SpacedRepetitionScheduler,
): CardRepository {
  return {
    async create({ content, origin, sourceErrorId = null, suspensionReason = null }) {
      const report = isCardSolvable(content);
      if (!report.solvable) return { ok: false, issues: report.issues };

      const now = clock.now();
      const srs = scheduler.initialState(now);
      const card: CardDocument = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        schemaVersion: 1,
        content,
        notionId: notionOfCard(content),
        sourceErrorId,
        status: suspensionReason === null ? 'active' : 'suspended',
        suspensionReason,
        srs,
        due: srs.due,
        origin,
      };
      await writeRecord(db, 'cards', card);
      return { ok: true, card };
    },

    get(id) {
      return readRecord(db, 'cards', id);
    },
  };
}
