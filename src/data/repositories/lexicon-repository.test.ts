import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createFsrsScheduler } from '../../domain/srs/scheduler.ts';
import { createTestClock, createTestDatabase } from '../../test/database.ts';
import { createCardRepository } from './card-repository.ts';
import { createLexiconRepository, lexiconIdOf } from './lexicon-repository.ts';
import { createRuleNoteRepository } from './rule-note-repository.ts';

async function setup() {
  const db = await createTestDatabase();
  const clock = createTestClock();
  const cards = createCardRepository(db, clock, createFsrsScheduler());
  return { db, clock, cards, lexicon: createLexiconRepository(db, clock, cards) };
}

const ENTRY = {
  expression: 'meet a deadline',
  meaningFr: 'respecter une échéance',
  example: 'We managed to meet a deadline that looked impossible.',
  source: 'manual' as const,
};

describe('lexicon repository (MOD-09)', () => {
  it('derives the same identifier from the same expression on every device (D-063)', async () => {
    const id = await lexiconIdOf('meet a deadline');
    expect(z.uuid().safeParse(id).success).toBe(true);
    expect(id[14]).toBe('8');
    expect(await lexiconIdOf('meet a deadline')).toBe(id);
    expect(await lexiconIdOf('meet the deadline')).not.toBe(id);
  });

  it('adds an entry with its collocation card, and refuses a duplicate', async () => {
    const { lexicon, cards } = await setup();
    const added = await lexicon.add(ENTRY);
    expect(added).toMatchObject({ ok: true, withCard: true, entry: { key: 'meet a deadline' } });
    expect(added.ok && added.entry.id).toBe(await lexiconIdOf('meet a deadline'));
    const [card] = await cards.all();
    expect(card).toMatchObject({
      origin: 'lexicon',
      content: { type: 'collocation', context: 'We managed to ___ that looked impossible.' },
    });
    expect(await lexicon.add({ ...ENTRY, expression: 'Meet  a deadline' })).toEqual({
      ok: false,
      reason: 'duplicate',
    });
  });

  it('keeps an entry whose example does not contain the expression, without a card', async () => {
    const { lexicon, cards } = await setup();
    const added = await lexicon.add({ ...ENTRY, example: 'We met the deadline.' });
    expect(added).toMatchObject({ ok: true, withCard: false, entry: { cardId: null } });
    expect(await cards.all()).toEqual([]);
  });

  it('removes an entry with its card, and lets it come back under the same identifier', async () => {
    const { lexicon, cards, clock } = await setup();
    const added = await lexicon.add(ENTRY);
    if (!added.ok) throw new Error('not added');
    clock.advance(1_000);
    await lexicon.remove(added.entry.id);
    expect(await lexicon.list()).toEqual([]);
    expect(await cards.all()).toEqual([]);
    clock.advance(1_000);
    const again = await lexicon.add(ENTRY);
    expect(again.ok && again.entry.id).toBe(added.entry.id);
    expect(await lexicon.list()).toHaveLength(1);
  });

  it('refuses an entry without expression or meaning', async () => {
    const { lexicon } = await setup();
    expect(await lexicon.add({ ...ENTRY, expression: '  ' })).toEqual({
      ok: false,
      reason: 'invalid',
    });
    expect(await lexicon.add({ ...ENTRY, meaningFr: '' })).toEqual({
      ok: false,
      reason: 'invalid',
    });
  });
});

describe('rule notes (MOD-10)', () => {
  it('keeps one note per category, and sets an unreadable one aside before replacing it', async () => {
    const db = await createTestDatabase();
    const clock = createTestClock();
    const notes = createRuleNoteRepository(db, clock);
    await notes.save('articles', 'Pas d’article devant un nom abstrait.');
    clock.advance(1_000);
    await notes.save('articles', 'Pas d’article devant un nom pris au sens général.');
    expect(await notes.all()).toEqual(
      new Map([['articles', 'Pas d’article devant un nom pris au sens général.']]),
    );
    await db.table('ruleNotes').put({ category: 'prepositions', updatedAt: clock.now() + 5_000 });
    await notes.save('prepositions', 'On dit _depend on_.');
    expect((await notes.all()).get('prepositions')).toBe('On dit _depend on_.');
    expect(await db.table('quarantine').count()).toBe(1);
  });
});
