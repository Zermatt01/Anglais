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
});
