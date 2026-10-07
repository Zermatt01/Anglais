/**
 * Path repository (CUR-03, CUR-04, CUR-08): the learner's progress on each
 * notion and the answers given to exercises.
 *
 * An answer and the progress it changes are written in one transaction, with
 * their outbox entries (docs/ARCHITECTURE.md §7), and so is the removal of the
 * draft of a typed answer: a recorded answer never leaves its draft behind,
 * and a draft is never removed without its answer (NO-06). The transitions
 * themselves are the pure functions of `domain/curriculum/engine.ts`.
 *
 * A progress document that cannot be read (written by a newer version of the
 * app, for instance) is never overwritten: answers are still recorded, but the
 * notion does not move until the app can read it (NO-06).
 */
import { z } from 'zod';
import {
  afterPathAnswer,
  applyPlacement,
  finishLesson,
  isPlacementPassed,
  startNotion,
  type PathAnswer,
  type Transition,
} from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import {
  notionProgressValuesSchema,
  type NotionProgressValues,
  type Step,
} from '../../domain/curriculum/progress.ts';
import { nextUpdatedAt, type Clock } from '../../domain/primitives.ts';
import type { AnswerResult, Grader } from '../../domain/taxonomy.ts';
import type { AppDatabase } from '../database.ts';
import { parseRecord, writeRecord } from '../records.ts';
import type { ExerciseAttempt } from '../schemas/exercise-attempts.ts';
import type { NotionProgressDocument } from '../schemas/notion-progress.ts';
import { createDraftRepository } from './draft-repository.ts';

/** Stored progress of a notion: absent, readable, or unreadable (kept as is). */
export type StoredProgress =
  | { readonly state: 'absent' }
  | { readonly state: 'valid'; readonly values: NotionProgressValues }
  | { readonly state: 'unreadable' };

export interface NewAnswer {
  readonly notionId: NotionId;
  readonly exerciseId: string;
  readonly source: ExerciseAttempt['source'];
  readonly step: Step;
  readonly answer: string;
  readonly result: AnswerResult;
  readonly grader: Grader;
  readonly hintUsed: boolean;
  readonly durationMs: number | null;
}

export interface PlacementAnswer {
  readonly questionId: string;
  readonly answer: string;
  readonly correct: boolean;
}

export interface AnswerOutcome {
  /** `null` when the progress did not change (or could not be read). */
  readonly transition: Transition | null;
  readonly progressUnreadable: boolean;
}

export interface PathRepository {
  progress(notionId: NotionId): Promise<StoredProgress>;
  /** Readable progress of every notion; unreadable ones are left out. */
  allProgress(): Promise<ReadonlyMap<NotionId, NotionProgressValues>>;
  /** Readable answers given to the exercises of a notion, in any context, oldest first. */
  attempts(notionId: NotionId): Promise<ExerciseAttempt[]>;
  /** Opening a notion from the path: not started → in progress, step 1. */
  start(notionId: NotionId): Promise<AnswerOutcome>;
  /** "J'ai compris": step 1 → step 2. */
  finishLesson(notionId: NotionId): Promise<AnswerOutcome>;
  /**
   * Records an answer given in the path, then applies the step criteria.
   * `draftKey`: the draft of the typed answer, removed in the same transaction.
   */
  recordAnswer(answer: NewAnswer, draftKey?: string): Promise<AnswerOutcome>;
  /** Records the answers of a notion's placement, and starts it at step 4 if passed. */
  recordPlacement(
    notionId: NotionId,
    answers: readonly PlacementAnswer[],
  ): Promise<AnswerOutcome & { readonly passed: boolean }>;
}

/** Answers of the path (context `path`), as the engine sees them. */
export function pathAnswersOf(attempts: readonly ExerciseAttempt[]): PathAnswer[] {
  return attempts
    .filter((attempt) => attempt.context === 'path')
    .map(({ at, step, result, hintUsed }) => ({ at, step, result, hintUsed }));
}

/** Keeps the progress values of a document, without its storage envelope. */
const valuesOfDocument = z.object(notionProgressValuesSchema.shape);

export function createPathRepository(db: AppDatabase, clock: Clock): PathRepository {
  const progressTable = db.table('notionProgress');
  const attemptsTable = db.table('exerciseAttempts');
  const tables = [progressTable, attemptsTable, db.table('syncOutbox')];
  const drafts = createDraftRepository(db, clock);
  const draftTables = [db.table('drafts'), db.table('quarantine')];

  async function readProgress(notionId: NotionId): Promise<{
    stored: StoredProgress;
    document: NotionProgressDocument | null;
  }> {
    const raw: unknown = await progressTable.get(notionId);
    if (raw === undefined) return { stored: { state: 'absent' }, document: null };
    const parsed = parseRecord('notionProgress', raw);
    if (!parsed.ok) return { stored: { state: 'unreadable' }, document: null };
    if (parsed.value.deletedAt !== null) {
      return { stored: { state: 'absent' }, document: parsed.value };
    }
    return {
      stored: { state: 'valid', values: valuesOfDocument.parse(parsed.value) },
      document: parsed.value,
    };
  }

  async function readAttempts(notionId: NotionId): Promise<ExerciseAttempt[]> {
    const raws: unknown[] = await attemptsTable
      .where('[notionId+step]')
      .between([notionId, 1], [notionId, 5], true, true)
      .toArray();
    const attempts: ExerciseAttempt[] = [];
    for (const raw of raws) {
      const parsed = parseRecord('exerciseAttempts', raw);
      if (parsed.ok) attempts.push(parsed.value);
    }
    return attempts.sort((a, b) => a.at - b.at);
  }

  async function writeProgress(
    notionId: NotionId,
    document: NotionProgressDocument | null,
    values: NotionProgressValues,
    now: number,
  ): Promise<void> {
    await writeRecord(
      db,
      'notionProgress',
      {
        ...values,
        notionId,
        createdAt: document?.createdAt ?? now,
        updatedAt: nextUpdatedAt(document?.updatedAt ?? null, now),
        deletedAt: null,
        schemaVersion: 1,
      },
      now,
    );
  }

  /** Reads the progress, computes a transition, and writes it if it changed. */
  async function transition(
    notionId: NotionId,
    compute: (progress: NotionProgressValues | null, now: number) => Transition | null,
  ): Promise<AnswerOutcome> {
    const now = clock.now();
    const { stored, document } = await readProgress(notionId);
    if (stored.state === 'unreadable') return { transition: null, progressUnreadable: true };
    const result = compute(stored.state === 'valid' ? stored.values : null, now);
    if (result?.changed === true) await writeProgress(notionId, document, result.progress, now);
    return { transition: result, progressUnreadable: false };
  }

  function attemptRecord(
    fields: Omit<ExerciseAttempt, 'id' | 'at' | 'schemaVersion'>,
    now: number,
  ): ExerciseAttempt {
    return { id: crypto.randomUUID(), at: now, schemaVersion: 1, ...fields };
  }

  return {
    async progress(notionId) {
      return (await readProgress(notionId)).stored;
    },

    async allProgress() {
      const raws: unknown[] = await progressTable.toArray();
      const progress = new Map<NotionId, NotionProgressValues>();
      for (const raw of raws) {
        const parsed = parseRecord('notionProgress', raw);
        if (!parsed.ok || parsed.value.deletedAt !== null) continue;
        progress.set(parsed.value.notionId, valuesOfDocument.parse(parsed.value));
      }
      return progress;
    },

    attempts: readAttempts,

    start(notionId) {
      return db.dexie.transaction('rw', tables, () => transition(notionId, startNotion));
    },

    finishLesson(notionId) {
      return db.dexie.transaction('rw', tables, () => transition(notionId, finishLesson));
    },

    recordAnswer(answer, draftKey) {
      return db.dexie.transaction('rw', [...tables, ...draftTables], async () => {
        const now = clock.now();
        await writeRecord(
          db,
          'exerciseAttempts',
          attemptRecord({ ...answer, context: 'path' }, now),
          now,
        );
        const answers = pathAnswersOf(await readAttempts(answer.notionId));
        const outcome = await transition(answer.notionId, (progress, at) =>
          progress === null ? null : afterPathAnswer(progress, answers, at),
        );
        if (draftKey !== undefined) await drafts.remove(draftKey);
        return outcome;
      });
    },

    recordPlacement(notionId, answers) {
      return db.dexie.transaction('rw', tables, async () => {
        const now = clock.now();
        for (const { questionId, answer, correct } of answers) {
          await writeRecord(
            db,
            'exerciseAttempts',
            attemptRecord(
              {
                notionId,
                exerciseId: questionId,
                source: 'core',
                // Placement questions are choices of form, like step 2 (CUR-08).
                step: 2,
                answer,
                result: correct ? 'correct' : 'incorrect',
                grader: 'local',
                hintUsed: false,
                context: 'placement',
                durationMs: null,
              },
              now,
            ),
            now,
          );
        }
        const passed = isPlacementPassed(answers.map(({ correct }) => correct));
        const outcome = await transition(notionId, (progress, at) =>
          applyPlacement(progress, passed, at),
        );
        return { ...outcome, passed };
      });
    },
  };
}
