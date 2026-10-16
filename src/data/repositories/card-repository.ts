/**
 * Card repository. Every card creation goes through `isCardSolvable`
 * (CARD-01, NO-03): an unsolvable card is refused and nothing is written.
 *
 * A review is recorded in one transaction (NO-06): the card's new spaced
 * repetition state and status, its review log, the activity, and the removal
 * of the draft of the answer. A suspended card is never reviewed (CARD-07).
 */
import type { CardContent, CardOrigin, SuspensionReason } from '../../domain/cards/content.ts';
import { notionOfCard } from '../../domain/cards/content.ts';
import {
  cardStandings,
  effectiveCardStatus,
  nextDue,
  reviewQueue,
  type CardStanding,
  type QueueLimits,
  type ReviewsToday,
} from '../../domain/cards/queue.ts';
import { asksTheSame } from '../../domain/cards/same.ts';
import { isCardSolvable, type SolvabilityIssue } from '../../domain/cards/solvability.ts';
import { isNotionStudied } from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import { nextUpdatedAt, type Clock } from '../../domain/primitives.ts';
import { isMastered } from '../../domain/srs/grading.ts';
import type { SpacedRepetitionScheduler } from '../../domain/srs/scheduler.ts';
import type { ReviewGrade } from '../../domain/srs/state.ts';
import type { AnswerResult, Grader } from '../../domain/taxonomy.ts';
import { recordActivity } from '../activity.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, readRecord, writeRecord, type ParsedRecord } from '../records.ts';
import type { CardDocument } from '../schemas/cards.ts';
import type { ProductionModule } from '../schemas/productions.ts';
import type { ReviewLog } from '../schemas/review-logs.ts';
import { createDraftRepository } from './draft-repository.ts';

export interface NewCard {
  readonly content: CardContent;
  readonly origin: CardOrigin;
  readonly sourceErrorId?: string | null;
  /** Created suspended, for example while its notion is not studied yet (D-025). */
  readonly suspensionReason?: Exclude<SuspensionReason, 'unsolvable'> | null;
}

export type CardCreation =
  /** `created` is false when a card asking the same thing already exists: it is that one. */
  | { readonly ok: true; readonly card: CardDocument; readonly created: boolean }
  | { readonly ok: false; readonly issues: readonly SolvabilityIssue[] };

export interface CardReview {
  readonly cardId: string;
  readonly answer: string;
  readonly result: AnswerResult;
  readonly grader: Grader;
  readonly hintUsed: boolean;
  /** Grade proposed from the result (PEDAGOGY §6.1). */
  readonly grade: ReviewGrade;
  /** Grade chosen by the learner, when it differs from the proposed one (CARD-05). */
  readonly adjustedGrade: ReviewGrade | null;
  readonly durationMs: number | null;
  /** Draft of the answer, removed with the review. */
  readonly draftKey?: string;
}

export interface ReviewSession {
  /** Cards to review now, in order. */
  readonly queue: readonly CardDocument[];
  readonly reviewedToday: number;
  /** When the next card is due, if none is due now. */
  readonly nextDue: number | null;
}

/** A card of "Mes cartes": where it stands and where it comes from (D-092). */
export interface CardOverviewEntry {
  readonly card: CardDocument;
  readonly standing: CardStanding;
  /** Module of the production its error comes from, when it comes from one. */
  readonly source: ProductionModule | null;
}

export interface CardRepository {
  create(card: NewCard): Promise<CardCreation>;
  /** Every readable card, with its standing, the newest first. */
  overview(limits: QueueLimits, dayStart: number): Promise<CardOverviewEntry[]>;
  get(id: string): Promise<ParsedRecord<CardDocument> | undefined>;
  /** Readable cards that are not deleted. */
  all(): Promise<CardDocument[]>;
  /** Readable cards made from these errors. */
  fromErrors(errorIds: readonly string[]): Promise<CardDocument[]>;
  /** The cards due now, within the daily caps (MOD-03). */
  session(limits: QueueLimits, dayStart: number): Promise<ReviewSession>;
  review(review: CardReview): Promise<CardDocument>;
  /** Removes a card (logical deletion), for instance with its lexicon entry. */
  remove(id: string): Promise<void>;
}

export function createCardRepository(
  db: AppDatabase,
  clock: Clock,
  scheduler: SpacedRepetitionScheduler,
  /** Whether the app has the lessons of a notion (its content is delivered). */
  hasLesson: (notionId: NotionId) => boolean,
): CardRepository {
  const cards = db.table('cards');
  const logs = db.table('reviewLogs');
  const drafts = createDraftRepository(db, clock);

  function readable(raws: readonly unknown[]): CardDocument[] {
    return raws
      .map((raw) => parseRecord('cards', raw))
      .flatMap((parsed) => (parsed.ok && parsed.value.deletedAt === null ? [parsed.value] : []));
  }

  /**
   * Whether the cards held back for a notion may be shown (D-025): the notion
   * is studied, from the stored progress (unreadable progress: not studied),
   * or it has no lessons yet, so that it could never be studied (D-092).
   */
  async function readiness(): Promise<(notionId: NotionId) => boolean> {
    const raws: unknown[] = await db.table('notionProgress').toArray();
    const studied = new Set<NotionId>();
    for (const raw of raws) {
      const parsed = parseRecord('notionProgress', raw);
      if (parsed.ok && parsed.value.deletedAt === null && isNotionStudied(parsed.value)) {
        studied.add(parsed.value.notionId);
      }
    }
    return (notionId) => studied.has(notionId) || !hasLesson(notionId);
  }

  async function logsOf(query: Promise<unknown[]>): Promise<ReviewLog[]> {
    return (await query)
      .map((raw) => parseRecord('reviewLogs', raw))
      .flatMap((parsed) => (parsed.ok ? [parsed.value] : []))
      .sort((a, b) => a.at - b.at);
  }

  /** Module of the production each error card comes from, by card. */
  async function sourcesOf(all: readonly CardDocument[]): Promise<Map<string, ProductionModule>> {
    const errorIds = all.flatMap((card) =>
      card.sourceErrorId === null ? [] : [card.sourceErrorId],
    );
    const productionOfError = new Map<string, string>();
    for (const raw of await db.table('errors').bulkGet(errorIds)) {
      const parsed = raw === undefined ? undefined : parseRecord('errors', raw);
      if (parsed?.ok) productionOfError.set(parsed.value.id, parsed.value.productionId);
    }
    const moduleOfProduction = new Map<string, ProductionModule>();
    for (const raw of await db
      .table('productions')
      .bulkGet([...new Set(productionOfError.values())])) {
      const parsed = raw === undefined ? undefined : parseRecord('productions', raw);
      if (parsed?.ok) moduleOfProduction.set(parsed.value.id, parsed.value.module);
    }
    const sources = new Map<string, ProductionModule>();
    for (const card of all) {
      const productionId =
        card.sourceErrorId === null ? undefined : productionOfError.get(card.sourceErrorId);
      const module = productionId === undefined ? undefined : moduleOfProduction.get(productionId);
      if (module !== undefined) sources.set(card.id, module);
    }
    return sources;
  }

  function countsOf(today: readonly ReviewLog[]): ReviewsToday {
    let newCards = 0;
    let mastered = 0;
    let reviews = 0;
    for (const log of today) {
      if (log.cardStatus === 'mastered') mastered += 1;
      else if (log.srsLog.phase === 'new') newCards += 1;
      else reviews += 1;
    }
    return { newCards, reviews, mastered };
  }

  return {
    async create({ content, origin, sourceErrorId = null, suspensionReason = null }) {
      const report = isCardSolvable(content);
      if (!report.solvable) return { ok: false, issues: report.issues };
      // One card per question: a sentence failed again is already in the Reprises (D-092).
      const same = readable(await cards.toArray()).find((card) =>
        asksTheSame(card.content, content),
      );
      if (same !== undefined) return { ok: true, card: same, created: false };

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
      await writeRecord(db, 'cards', card, now);
      return { ok: true, card, created: true };
    },

    get(id) {
      return readRecord(db, 'cards', id);
    },

    async all() {
      return readable(await cards.toArray());
    },

    async fromErrors(errorIds) {
      if (errorIds.length === 0) return [];
      return readable(
        await cards
          .where('sourceErrorId')
          .anyOf([...errorIds])
          .toArray(),
      );
    },

    async overview(limits, dayStart) {
      const all = readable(await cards.toArray());
      const isStudied = await readiness();
      const today = await logsOf(logs.where('at').aboveOrEqual(dayStart).toArray());
      const standings = cardStandings({
        cards: all.map((card) => ({ ...card, phase: card.srs.phase })),
        now: clock.now(),
        today: countsOf(today),
        limits,
        isStudied,
      });
      const sources = await sourcesOf(all);
      return all
        .flatMap((card) => {
          const standing = standings.get(card.id);
          return standing === undefined
            ? []
            : [{ card, standing, source: sources.get(card.id) ?? null }];
        })
        .sort((a, b) => b.card.createdAt - a.card.createdAt);
    },

    async session(limits, dayStart) {
      const now = clock.now();
      const all = readable(await cards.toArray());
      const isStudied = await readiness();
      const today = await logsOf(logs.where('at').aboveOrEqual(dayStart).toArray());
      const entries = all.map((card) => ({ ...card, phase: card.srs.phase }));
      const queued = reviewQueue({
        cards: entries,
        now,
        today: countsOf(today),
        limits,
        isStudied,
      });
      const byId = new Map(all.map((card) => [card.id, card]));
      return {
        queue: queued.flatMap((entry) => byId.get(entry.id) ?? []),
        reviewedToday: today.length,
        nextDue: queued.length > 0 ? null : nextDue(entries, now, isStudied),
      };
    },

    review(review) {
      const tables = [
        cards,
        logs,
        db.table('notionProgress'),
        db.table('activity'),
        db.table('drafts'),
        db.table('quarantine'),
        db.table('syncOutbox'),
      ];
      return db.dexie.transaction('rw', tables, async () => {
        const now = clock.now();
        const stored = await readRecord(db, 'cards', review.cardId);
        if (!stored?.ok || stored.value.deletedAt !== null) throw new Error('Unreadable card');
        const card = stored.value;
        const status = effectiveCardStatus(card, await readiness());
        if (status === 'suspended' || !isCardSolvable(card.content).solvable) {
          throw new Error('A suspended or unsolvable card is never reviewed');
        }
        const { state, log } = scheduler.review(
          card.srs,
          review.adjustedGrade ?? review.grade,
          now,
        );
        const previous = await logsOf(logs.where('cardId').equals(card.id).toArray());
        const results = [...previous.map((entry) => entry.result), review.result];
        const updated: CardDocument = {
          ...card,
          srs: state,
          due: state.due,
          status: isMastered(state, results) ? 'mastered' : 'active',
          suspensionReason: null,
          updatedAt: nextUpdatedAt(card.updatedAt, now),
        };
        await writeRecord(db, 'cards', updated, now);
        await writeRecord(
          db,
          'reviewLogs',
          {
            id: crypto.randomUUID(),
            at: now,
            schemaVersion: 1,
            cardId: card.id,
            cardStatus: status,
            answer: review.answer,
            hintUsed: review.hintUsed,
            result: review.result,
            grader: review.grader,
            grade: review.grade,
            adjustedGrade: review.adjustedGrade,
            srsLog: log,
            durationMs: review.durationMs,
          },
          now,
        );
        await recordActivity(db, 'review', review.durationMs, now);
        if (review.draftKey !== undefined) await drafts.remove(review.draftKey);
        return updated;
      });
    },

    async remove(id) {
      await db.dexie.transaction('rw', [cards, db.table('syncOutbox')], async () => {
        const stored = await readRecord(db, 'cards', id);
        if (!stored?.ok || stored.value.deletedAt !== null) return;
        const now = clock.now();
        await writeRecord(
          db,
          'cards',
          {
            ...stored.value,
            deletedAt: now,
            updatedAt: nextUpdatedAt(stored.value.updatedAt, now),
          },
          now,
        );
      });
    },
  };
}
