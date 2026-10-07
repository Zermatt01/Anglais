import { describe, expect, it } from 'vitest';
import { collocationCardOf, lexiconKey } from '../lexicon.ts';
import { NOTION_CARDS_PER_NOTION, notionCardContents } from './notion-cards.ts';

describe('notionCardContents (CUR-09)', () => {
  const source = (
    sentenceFr: string,
    difficulty: number,
    accepted: string[],
    hint = 'Un indice.',
  ) => ({
    sentenceFr,
    hint,
    difficulty,
    accepted,
  });

  it('takes the hardest reviewed translations first, up to three', () => {
    const cards = notionCardContents('tense-past-simple', [
      source('Phrase facile.', 1, ['I sent it.']),
      source('Phrase difficile.', 3, ['I sent it when I arrived.', 'I sent it as I arrived.']),
      source('Phrase moyenne A.', 2, ['I paid it.']),
      source('Phrase moyenne B.', 2, ['I wrote it.']),
    ]);
    expect(cards).toHaveLength(NOTION_CARDS_PER_NOTION);
    expect(cards.map((card) => card.meaningFr)).toEqual([
      'Phrase difficile.',
      'Phrase moyenne A.',
      'Phrase moyenne B.',
    ]);
    expect(cards[0]).toEqual({
      type: 'notion',
      notionId: 'tense-past-simple',
      meaningFr: 'Phrase difficile.',
      hint: 'Un indice.',
      answers: { canonical: 'I sent it when I arrived.', variants: ['I sent it as I arrived.'] },
    });
  });

  it('leaves out a translation that would make an unsolvable card', () => {
    expect(
      notionCardContents('tense-past-simple', [
        source('Phrase.', 2, ['I sent it.'], 'Écris _I sent it_.'),
      ]),
    ).toEqual([]);
  });
});

describe('lexicon (MOD-09)', () => {
  it('keys an expression by its normalized form', () => {
    expect(lexiconKey('  To keep  track of ')).toBe('to keep track of');
    expect(lexiconKey('E-mail follow-up')).toBe('email follow-up');
  });

  it('makes a collocation card from an example that contains the expression once', () => {
    expect(
      collocationCardOf({
        expression: 'keep track of',
        meaningFr: 'suivre',
        example: 'I use a spreadsheet to Keep track of the reports.',
      }),
    ).toEqual({
      type: 'collocation',
      meaningFr: 'suivre',
      context: 'I use a spreadsheet to ___ the reports.',
      hint: null,
      notionId: null,
      answers: { canonical: 'Keep track of', variants: [] },
    });
  });

  it('makes no card when the example does not contain the expression exactly once', () => {
    const entry = { expression: 'to be on the same page', meaningFr: 'être d’accord' };
    expect(collocationCardOf({ ...entry, example: 'We are on the same page.' })).toBeNull();
    expect(
      collocationCardOf({
        expression: 'on time',
        meaningFr: 'à l’heure',
        example: 'Be on time, always on time.',
      }),
    ).toBeNull();
    expect(
      collocationCardOf({ expression: 'on time', meaningFr: ' ', example: 'Be on time.' }),
    ).toBeNull();
  });
});
