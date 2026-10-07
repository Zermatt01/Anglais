/**
 * Productions and their correction (PED-04, PED-05, docs/PEDAGOGY.md §4,
 * docs/ARCHITECTURE.md §8, D-083).
 *
 * A production is stored before the model is called (step 1 of §8), with the
 * removal of its draft in the same transaction: the text is never lost, and a
 * failed call leaves it with a "Réessayer" button.
 *
 * A correction is applied in one transaction (NO-06): the production and its
 * output, one document per error with its diagnosis (slip, gap or notion not
 * studied yet), the solvable cards, the progress that changes (a notion sent
 * back to step 3 after a gap, a step of the path, an acquired notion with its
 * notion cards), the answer of a path translation, and the activity. Either
 * everything is stored, or nothing.
 *
 * The stored output is the model's, validated again against the output schema
 * each time it is read, then reviewed by `reviewCorrection`.
 */
import { z } from 'zod';
import { correctionOutputSchema } from '../../../shared/ai/tasks.ts';
import type { NotionCardContent } from '../../domain/cards/content.ts';
import {
  errorCardDrafts,
  type ErrorCardDraft,
  type Reference,
} from '../../domain/cards/from-correction.ts';
import {
  afterProduction,
  isNotionStudied,
  regressAfterLacuna,
  type ProgressEvent,
} from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import {
  notionProgressValuesSchema,
  type NotionProgressValues,
} from '../../domain/curriculum/progress.ts';
import { diagnoseNotion, LACUNA_RULE, type Diagnosis } from '../../domain/errors/diagnosis.ts';
import { nextUpdatedAt, type Clock } from '../../domain/primitives.ts';
import {
  isCountedError,
  isQualifyingError,
  productionCheckOf,
  reviewCorrection,
  translationResult,
  type ModelCorrection,
  type ReviewedCorrection,
} from '../../domain/production/correction.ts';
import type { TextRange } from '../../domain/correction/segments.ts';
import type {
  AnswerResult,
  Confidence,
  ErrorCategory,
  Grader,
  Severity,
} from '../../domain/taxonomy.ts';
import { recordActivity } from '../activity.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, readRecord, writeRecord, type ParsedRecord } from '../records.ts';
import type { ErrorDocument } from '../schemas/errors.ts';
import type { NotionProgressDocument } from '../schemas/notion-progress.ts';
import type { ProductionDocument, ProductionModule } from '../schemas/productions.ts';
import type { CardRepository } from './card-repository.ts';
import { createDraftRepository } from './draft-repository.ts';
import type { PathRepository } from './path-repository.ts';

export type CorrectedModule = Extract<
  ProductionModule,
  'theme' | 'journal' | 'path-produce' | 'path-translate'
>;

export interface NewProduction {
  readonly module: CorrectedModule;
  readonly prompt: ProductionDocument['prompt'];
  readonly context: ProductionDocument['context'];
  readonly text: string;
  readonly durationMs: number | null;
  /** Draft of the text, removed in the transaction that stores the production. */
  readonly draftKey?: string;
}

export interface ReceivedCorrection {
  readonly output: ModelCorrection;
  readonly model: string;
  readonly promptVersion: string;
  readonly costUsd: number;
}

/** A translation of the path whose answer is recorded with its correction. */
export interface PathAnswerToRecord {
  readonly exerciseId: string;
  readonly source: 'core' | 'generated';
  readonly hintUsed: boolean;
  readonly durationMs: number | null;
  readonly context: 'path' | 'immediate-practice';
  readonly draftKey?: string;
}

export interface CorrectionContext {
  /** Reviewed reference of a Thème sentence or a translation: the cards' meaning. */
  readonly reference: Reference | null;
  /** Reviewed hint of a category, when the model's hint gives the correction away. */
  readonly fallbackHint: (category: ErrorCategory) => string;
  readonly pathAnswer?: PathAnswerToRecord;
  /** Cards of the target notion, created if the production makes it acquired (CUR-09). */
  readonly notionCards?: readonly NotionCardContent[];
}

/** An answer to a reviewed sentence that matches one of its anticipated errors. */
export interface KnownError {
  readonly category: ErrorCategory;
  readonly correction: string;
  readonly rule: string;
  readonly card: ErrorCardDraft['content'] | null;
}

export interface CorrectionOutcome {
  readonly production: ProductionDocument;
  readonly result: AnswerResult | null;
  /** Changes of the path: a gap, a step passed, an acquired notion. */
  readonly events: readonly ProgressEvent[];
  readonly cardsCreated: number;
}

export interface ProductionRepository {
  /** Stores a production to correct, and removes its draft, in one transaction. */
  submit(production: NewProduction): Promise<ProductionDocument>;
  /** The model's answer did not come: the text stays, with "Réessayer". */
  markFailed(id: string): Promise<void>;
  applyCorrection(
    id: string,
    received: ReceivedCorrection,
    context: CorrectionContext,
  ): Promise<CorrectionOutcome>;
  /** A Thème sentence graded without the model: by the local correction or by the learner. */
  recordLocalResult(
    production: NewProduction,
    graded: { readonly result: AnswerResult; readonly grader: Grader },
    knownError: KnownError | null,
  ): Promise<CorrectionOutcome>;
  /** The learner judges a production whose correction did not come (never "wrong" by default). */
  assess(id: string, result: 'correct' | 'incorrect'): Promise<void>;
  saveSelfCorrections(
    id: string,
    selfCorrections: NonNullable<ProductionDocument['selfCorrections']>,
  ): Promise<void>;
  get(id: string): Promise<ParsedRecord<ProductionDocument> | undefined>;
  /** Readable productions of a module, newest first. */
  list(module: ProductionModule): Promise<ProductionDocument[]>;
  errorsOf(productionId: string): Promise<ErrorDocument[]>;
  /** Readable errors made since `since` (all of them by default). */
  errorsSince(since?: number): Promise<ErrorDocument[]>;
}

/** The reviewed correction of a stored production, or `null` (none, or unreadable). */
export function reviewedCorrectionOf(production: ProductionDocument): ReviewedCorrection | null {
  if (production.correction === null) return null;
  const output = correctionOutputSchema.safeParse(production.correction.output);
  return output.success ? reviewCorrection(production.text, output.data) : null;
}

/** Module of the activity a production counts for. */
function activityModule(module: CorrectedModule): 'theme' | 'journal' | 'path' {
  return module === 'theme' || module === 'journal' ? module : 'path';
}

/** An error to store, from a correction or an anticipated error. */
interface ErrorToRecord {
  readonly index: number;
  readonly segment: string;
  readonly range: TextRange | null;
  readonly category: ErrorCategory;
  readonly notionId: NotionId | null;
  readonly severity: Severity;
  readonly confidence: Confidence;
  readonly correction: string;
  readonly rule: string;
}

/** Readable progress of a notion (`values` is `null` when absent) and its document. */
interface StoredNotion {
  readonly values: NotionProgressValues | null;
  readonly document: NotionProgressDocument | null;
}

/** Keeps the progress values of a document, without its storage envelope. */
const valuesOfDocument = z.object(notionProgressValuesSchema.shape);

/** A card to create, with the index of its primary error. */
interface CardToCreate {
  readonly content: ErrorCardDraft['content'];
  readonly primaryErrorIndex: number;
}

/** Result of a production graded by the model, outside the path. */
function productionResult(correction: ReviewedCorrection): AnswerResult {
  const errors = correction.errors.filter((error) => error.confidence !== 'low');
  if (errors.some(isCountedError)) return 'incorrect';
  return errors.length > 0 ? 'acceptable' : 'correct';
}

export function createProductionRepository(
  db: AppDatabase,
  clock: Clock,
  dependencies: { readonly cards: CardRepository; readonly path: PathRepository },
): ProductionRepository {
  const productions = db.table('productions');
  const errorsTable = db.table('errors');
  const progressTable = db.table('notionProgress');
  const drafts = createDraftRepository(db, clock);
  const tables = [
    productions,
    errorsTable,
    db.table('cards'),
    progressTable,
    db.table('exerciseAttempts'),
    db.table('activity'),
    db.table('drafts'),
    db.table('quarantine'),
    db.table('syncOutbox'),
  ];

  async function readProduction(id: string): Promise<ProductionDocument> {
    const stored = await readRecord(db, 'productions', id);
    if (!stored?.ok) throw new Error('Unreadable or missing production');
    return stored.value;
  }

  async function writeProduction(
    previous: ProductionDocument,
    changes: Partial<ProductionDocument>,
    now: number,
  ): Promise<ProductionDocument> {
    const document: ProductionDocument = {
      ...previous,
      ...changes,
      updatedAt: nextUpdatedAt(previous.updatedAt, now),
    };
    await writeRecord(db, 'productions', document, now);
    return document;
  }

  function newDocument(production: NewProduction, now: number): ProductionDocument {
    return {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      schemaVersion: 1,
      module: production.module,
      prompt: production.prompt,
      context: production.context,
      text: production.text,
      intentFr: null,
      correction: null,
      result: null,
      grader: null,
      selfCorrections: null,
      durationMs: production.durationMs,
      status: 'submitted',
    };
  }

  /** Stores a new production, its activity, and removes its draft. */
  async function store(production: NewProduction, now: number): Promise<ProductionDocument> {
    const document = newDocument(production, now);
    await writeRecord(db, 'productions', document, now);
    await recordActivity(db, activityModule(production.module), production.durationMs, now);
    if (production.draftKey !== undefined) await drafts.remove(production.draftKey);
    return document;
  }

  /** Progress of a notion; `undefined` when unreadable, which is never overwritten (NO-06). */
  async function readProgress(notionId: NotionId): Promise<StoredNotion | undefined> {
    const raw: unknown = await progressTable.get(notionId);
    if (raw === undefined) return { values: null, document: null };
    const parsed = parseRecord('notionProgress', raw);
    if (!parsed.ok) return undefined;
    const values = parsed.value.deletedAt === null ? valuesOfDocument.parse(parsed.value) : null;
    return { values, document: parsed.value };
  }

  async function writeProgress(
    notionId: NotionId,
    stored: StoredNotion,
    values: NotionProgressValues,
    now: number,
  ): Promise<void> {
    await writeRecord(
      db,
      'notionProgress',
      {
        ...values,
        notionId,
        createdAt: stored.document?.createdAt ?? now,
        updatedAt: nextUpdatedAt(stored.document?.updatedAt ?? null, now),
        deletedAt: null,
        schemaVersion: 1,
      },
      now,
    );
  }

  /** Productions of the last days with a qualifying error on `notionId`. */
  async function pastQualifying(notionId: NotionId, now: number) {
    const raws: unknown[] = await errorsTable
      .where('[notionId+at]')
      .between([notionId, now - LACUNA_RULE.windowMs], [notionId, now], true, true)
      .toArray();
    const occurrences: { productionId: string; at: number }[] = [];
    for (const raw of raws) {
      const parsed = parseRecord('errors', raw);
      if (!parsed.ok || parsed.value.deletedAt !== null) continue;
      if (isQualifyingError(parsed.value)) {
        occurrences.push({ productionId: parsed.value.productionId, at: parsed.value.at });
      }
    }
    return occurrences;
  }

  /**
   * Stores the errors of a production with their diagnosis, sends a notion
   * back to step 3 after a gap, and creates the cards (PEDAGOGY §4.2).
   */
  async function recordErrors(
    productionId: string,
    errors: readonly ErrorToRecord[],
    cards: readonly CardToCreate[],
    now: number,
  ): Promise<{ events: ProgressEvent[]; cardsCreated: number }> {
    const events: ProgressEvent[] = [];
    const diagnoses = new Map<NotionId, Diagnosis>();
    const notions = new Set(
      errors
        .filter(isCountedError)
        .flatMap((error) => (error.notionId === null ? [] : [error.notionId])),
    );
    for (const notionId of notions) {
      const progress = await readProgress(notionId);
      // An unreadable progress is never overwritten: its notion counts as not studied.
      const studied = progress !== undefined && isNotionStudied(progress.values);
      const qualifiesNow = errors.some(
        (error) =>
          error.notionId === notionId &&
          isQualifyingError({ ...error, confirmedByUser: false, reported: false }),
      );
      const diagnosis = diagnoseNotion({
        studied,
        productionId,
        qualifiesNow,
        past: await pastQualifying(notionId, now),
        now,
      });
      diagnoses.set(notionId, diagnosis);
      if (diagnosis === 'lacune' && progress !== undefined) {
        const transition = regressAfterLacuna(progress.values, now);
        if (transition !== null) {
          await writeProgress(notionId, progress, transition.progress, now);
          events.push(transition.event);
        }
      }
    }

    const errorIds = new Map<number, string>();
    for (const error of errors) {
      const id = crypto.randomUUID();
      errorIds.set(error.index, id);
      const document: ErrorDocument = {
        id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        schemaVersion: 1,
        productionId,
        index: error.index,
        at: now,
        category: error.category,
        notionId: error.notionId,
        segment: { text: error.segment, range: error.range },
        correction: error.correction,
        rule: error.rule,
        severity: error.severity,
        confidence: error.confidence,
        diagnosis:
          error.notionId !== null && isCountedError(error)
            ? (diagnoses.get(error.notionId) ?? null)
            : null,
        confirmedByUser: false,
        reported: false,
      };
      await writeRecord(db, 'errors', document, now);
    }

    let cardsCreated = 0;
    for (const card of cards) {
      const notionId = card.content.notionId;
      const unstudied = notionId !== null && diagnoses.get(notionId) === 'unstudied';
      const created = await dependencies.cards.create({
        content: card.content,
        origin: 'error',
        sourceErrorId: errorIds.get(card.primaryErrorIndex) ?? null,
        // A form never taught is not asked for yet (D-025).
        suspensionReason: unstudied ? 'unstudied-notion' : null,
      });
      if (created.ok) cardsCreated += 1;
    }
    return { events, cardsCreated };
  }

  /** Step 5: two good productions in a row make the notion acquired, with its cards (CUR-09). */
  async function afterStepFive(
    notionId: NotionId,
    notionCards: readonly NotionCardContent[],
    now: number,
  ): Promise<ProgressEvent[]> {
    const progress = await readProgress(notionId);
    if (progress?.values == null) return [];
    const { values } = progress;
    const raws: unknown[] = await productions.where('module').equals('path-produce').toArray();
    const checks: { usesNotion: boolean; hasNotionError: boolean }[] = [];
    const corrected = raws
      .map((raw) => parseRecord('productions', raw))
      .flatMap((parsed) => (parsed.ok ? [parsed.value] : []))
      .filter(
        (production) =>
          production.deletedAt === null &&
          production.status === 'corrected' &&
          production.context.notionId === notionId &&
          production.createdAt >= values.stepEnteredAt,
      )
      .sort((a, b) => a.createdAt - b.createdAt);
    for (const production of corrected) {
      // `correct` means the notion was used without a counted error on it.
      const good = production.result === 'correct';
      checks.push({ usesNotion: good, hasNotionError: !good });
    }
    const transition = afterProduction(values, checks, now);
    if (transition === null) return [];
    await writeProgress(notionId, progress, transition.progress, now);
    for (const content of notionCards) {
      await dependencies.cards.create({ content, origin: 'notion' });
    }
    return [transition.event];
  }

  return {
    submit(production) {
      return db.dexie.transaction('rw', tables, () => store(production, clock.now()));
    },

    markFailed(id) {
      return db.dexie.transaction('rw', tables, async () => {
        const production = await readProduction(id);
        if (production.status === 'corrected') return;
        await writeProduction(production, { status: 'correction-failed' }, clock.now());
      });
    },

    applyCorrection(id, received, context) {
      return db.dexie.transaction('rw', tables, async () => {
        const now = clock.now();
        const stored = await readProduction(id);
        if (stored.status === 'corrected') {
          return { production: stored, result: stored.result, events: [], cardsCreated: 0 };
        }
        const correction = reviewCorrection(stored.text, received.output);
        const targetNotionId = stored.context.notionId;
        const module = stored.module;
        let result: AnswerResult | null = null;
        if (module === 'path-translate' && targetNotionId !== null) {
          result = translationResult(correction, targetNotionId);
        } else if (module === 'path-produce' && targetNotionId !== null) {
          const check = productionCheckOf(correction, targetNotionId);
          result = check.usesNotion && !check.hasNotionError ? 'correct' : 'incorrect';
        } else if (module === 'theme') {
          result = productionResult(correction);
        }
        const production = await writeProduction(
          stored,
          {
            status: 'corrected',
            intentFr: correction.intentFr.slice(0, 2_000),
            correction: {
              promptVersion: received.promptVersion,
              model: received.model,
              receivedAt: now,
              costUsd: received.costUsd,
              // Plain JSON, as stored (the schema checks it again on writing).
              output: z.json().parse(received.output),
            },
            result,
            grader: result === null ? null : 'ai',
          },
          now,
        );
        const cardDrafts = errorCardDrafts({
          text: stored.text,
          correction,
          reference: context.reference,
          fallbackHint: context.fallbackHint,
        });
        const recorded = await recordErrors(
          id,
          correction.errors.map((error) => ({ ...error, rule: error.ruleFr })),
          cardDrafts,
          now,
        );
        const events = [...recorded.events];

        const { pathAnswer } = context;
        if (pathAnswer !== undefined && targetNotionId !== null && result !== null) {
          const outcome = await dependencies.path.recordAnswer(
            {
              notionId: targetNotionId,
              exerciseId: pathAnswer.exerciseId,
              source: pathAnswer.source,
              step: 4,
              answer: stored.text,
              result,
              grader: 'ai',
              hintUsed: pathAnswer.hintUsed,
              durationMs: pathAnswer.durationMs,
            },
            pathAnswer.draftKey,
            pathAnswer.context,
          );
          if (outcome.transition !== null) events.push(outcome.transition.event);
        }
        if (module === 'path-produce' && targetNotionId !== null) {
          events.push(...(await afterStepFive(targetNotionId, context.notionCards ?? [], now)));
        }
        return { production, result, events, cardsCreated: recorded.cardsCreated };
      });
    },

    recordLocalResult(production, graded, knownError) {
      return db.dexie.transaction('rw', tables, async () => {
        const now = clock.now();
        const stored = await store(production, now);
        const document = await writeProduction(
          stored,
          { status: 'corrected', result: graded.result, grader: graded.grader },
          now,
        );
        if (knownError === null) {
          return { production: document, result: graded.result, events: [], cardsCreated: 0 };
        }
        const recorded = await recordErrors(
          document.id,
          [
            {
              index: 0,
              segment: production.text,
              range: production.text.length > 0 ? { start: 0, end: production.text.length } : null,
              category: knownError.category,
              notionId: production.context.notionId,
              // An anticipated error is reviewed: wrong in every reading (D-035).
              severity: 'medium',
              confidence: 'high',
              correction: knownError.correction,
              rule: knownError.rule,
            },
          ],
          knownError.card === null ? [] : [{ content: knownError.card, primaryErrorIndex: 0 }],
          now,
        );
        return {
          production: document,
          result: graded.result,
          events: recorded.events,
          cardsCreated: recorded.cardsCreated,
        };
      });
    },

    assess(id, result) {
      return db.dexie.transaction('rw', tables, async () => {
        const production = await readProduction(id);
        if (production.status === 'corrected') return;
        await writeProduction(
          production,
          { status: 'corrected', result, grader: 'user' },
          clock.now(),
        );
      });
    },

    saveSelfCorrections(id, selfCorrections) {
      return db.dexie.transaction('rw', tables, async () => {
        const production = await readProduction(id);
        await writeProduction(production, { selfCorrections }, clock.now());
      });
    },

    get(id) {
      return readRecord(db, 'productions', id);
    },

    async list(module) {
      const raws: unknown[] = await productions.where('module').equals(module).toArray();
      return raws
        .map((raw) => parseRecord('productions', raw))
        .flatMap((parsed) => (parsed.ok && parsed.value.deletedAt === null ? [parsed.value] : []))
        .sort((a, b) => b.createdAt - a.createdAt);
    },

    async errorsOf(productionId) {
      const raws: unknown[] = await errorsTable
        .where('productionId')
        .equals(productionId)
        .toArray();
      return raws
        .map((raw) => parseRecord('errors', raw))
        .flatMap((parsed) => (parsed.ok && parsed.value.deletedAt === null ? [parsed.value] : []))
        .sort((a, b) => a.index - b.index);
    },

    async errorsSince(since = 0) {
      const raws: unknown[] = await errorsTable.toArray();
      return raws
        .map((raw) => parseRecord('errors', raw))
        .flatMap((parsed) =>
          parsed.ok && parsed.value.deletedAt === null && parsed.value.at >= since
            ? [parsed.value]
            : [],
        );
    },
  };
}
