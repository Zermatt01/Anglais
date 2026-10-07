import { describe, expect, it } from 'vitest';
import type { CardContent } from '../../domain/cards/content.ts';
import { createFsrsScheduler } from '../../domain/srs/scheduler.ts';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createCardRepository } from './card-repository.ts';

const clozeCard: CardContent = {
  type: 'cloze',
  meaningFr: 'Tu as déjà fini le rapport ?',
  text: 'Have you finished the report ___?',
  infinitive: null,
  hint: 'Question sur une action attendue : quel mot en fin de phrase ?',
  notionId: 'tense-just-already-yet-still',
  // "already" is also correct here (surprise that it is done so soon).
  answers: { canonical: 'yet', variants: ['already'] },
};

async function setup() {
  const db = await createTestDatabase();
  const clock = createTestClock();
  return { db, clock, repository: createCardRepository(db, clock, createFsrsScheduler()) };
}

describe('card repository', () => {
  it('creates a solvable card, due now, with its index fields', async () => {
    const { clock, repository } = await setup();
    const result = await repository.create({ content: clozeCard, origin: 'error' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.card).toMatchObject({
      status: 'active',
      suspensionReason: null,
      notionId: 'tense-just-already-yet-still',
      due: clock.now(),
      srs: { phase: 'new', due: clock.now() },
      origin: 'error',
    });
    expect(await repository.get(result.card.id)).toEqual({ ok: true, value: result.card });
  });

  it('refuses an unsolvable card and writes nothing (CARD-01)', async () => {
    const { db, repository } = await setup();
    const result = await repository.create({
      content: { ...clozeCard, meaningFr: '' },
      origin: 'error',
    });
    expect(result).toEqual({ ok: false, issues: ['missing-meaning'] });
    expect(await db.table('cards').count()).toBe(0);
  });

  it('refuses a card whose hint gives the answer away', async () => {
    const { repository } = await setup();
    const result = await repository.create({
      content: { ...clozeCard, hint: 'Réponse : yet.' },
      origin: 'error',
    });
    expect(result).toEqual({ ok: false, issues: ['hint-reveals-answer'] });
  });

  it('creates a suspended card while its notion is not studied yet (D-025)', async () => {
    const { repository } = await setup();
    const result = await repository.create({
      content: clozeCard,
      origin: 'error',
      suspensionReason: 'unstudied-notion',
    });
    expect(result.ok && result.card).toMatchObject({
      status: 'suspended',
      suspensionReason: 'unstudied-notion',
    });
  });

  const limits = { newCardsPerDay: 10, reviewsPerDay: 60 };
  const reviewOf = (cardId: string) => ({
    cardId,
    answer: 'yet',
    result: 'correct' as const,
    grader: 'local' as const,
    hintUsed: false,
    grade: 'good' as const,
    adjustedGrade: null,
    durationMs: 20_000,
  });

  it('queues the due cards and records a review with its log, activity and draft', async () => {
    const { db, clock, repository } = await setup();
    const created = await repository.create({ content: clozeCard, origin: 'error' });
    if (!created.ok) throw new Error('not created');
    const drafts = db.table('drafts');
    await drafts.put({ key: `review:${created.card.id}`, text: 'yet', updatedAt: clock.now() });

    const session = await repository.session(limits, clock.now() - 1);
    expect(session.queue.map((card) => card.id)).toEqual([created.card.id]);

    clock.advance(20_000);
    const reviewed = await repository.review({
      ...reviewOf(created.card.id),
      draftKey: `review:${created.card.id}`,
    });
    expect(reviewed.srs.reps).toBe(1);
    expect(reviewed.due).toBeGreaterThan(clock.now());
    expect(await db.table('reviewLogs').count()).toBe(1);
    expect(await db.table('activity').count()).toBe(1);
    expect(await drafts.count()).toBe(0);
    const after = await repository.session(limits, clock.now() - 60_000);
    expect(after.queue).toEqual([]);
    expect(after.reviewedToday).toBe(1);
    expect(after.nextDue).toBe(reviewed.due);
  });

  it('uses the grade chosen by the learner (CARD-05)', async () => {
    const first = await setup();
    const second = await setup();
    const created = await first.repository.create({ content: clozeCard, origin: 'error' });
    const twin = await second.repository.create({ content: clozeCard, origin: 'error' });
    if (!created.ok || !twin.ok) throw new Error('not created');
    first.clock.advance(1_000);
    second.clock.advance(1_000);
    const easy = await first.repository.review({
      ...reviewOf(created.card.id),
      adjustedGrade: 'easy',
    });
    const good = await second.repository.review(reviewOf(twin.card.id));
    expect(easy.due).toBeGreaterThan(good.due);
  });

  it('never reviews a suspended card, but brings one back once its notion is studied', async () => {
    const { db, clock, repository } = await setup();
    const created = await repository.create({
      content: clozeCard,
      origin: 'error',
      suspensionReason: 'unstudied-notion',
    });
    if (!created.ok) throw new Error('not created');
    expect((await repository.session(limits, 0)).queue).toEqual([]);
    await expect(repository.review(reviewOf(created.card.id))).rejects.toThrow();

    await db.table('notionProgress').put({
      notionId: 'tense-just-already-yet-still',
      status: 'in_progress',
      step: 4,
      recall: null,
      stepEnteredAt: clock.now(),
      acquiredAt: null,
      lastRegressionAt: null,
      createdAt: clock.now(),
      updatedAt: clock.now(),
      deletedAt: null,
      schemaVersion: 1,
    });
    expect((await repository.session(limits, 0)).queue).toHaveLength(1);
    const reviewed = await repository.review(reviewOf(created.card.id));
    expect(reviewed).toMatchObject({ status: 'active', suspensionReason: null });
  });

  it('removes a card logically: it is never queued again', async () => {
    const { repository } = await setup();
    const created = await repository.create({ content: clozeCard, origin: 'lexicon' });
    if (!created.ok) throw new Error('not created');
    await repository.remove(created.card.id);
    expect(await repository.all()).toEqual([]);
    expect((await repository.session(limits, 0)).queue).toEqual([]);
  });
});
