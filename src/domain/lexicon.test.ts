import { describe, expect, it } from 'vitest';
import { collocationCardOf, expressionBetween, piecesOf } from './lexicon.ts';

describe('piecesOf (D-095)', () => {
  it('splits a sentence into its words and what lies between them', () => {
    expect(piecesOf('We’ve set up a follow-up call.')).toEqual([
      { text: 'We’ve', start: 0, word: true },
      { text: ' ', start: 5, word: false },
      { text: 'set', start: 6, word: true },
      { text: ' ', start: 9, word: false },
      { text: 'up', start: 10, word: true },
      { text: ' ', start: 12, word: false },
      { text: 'a', start: 13, word: true },
      { text: ' ', start: 14, word: false },
      { text: 'follow-up', start: 15, word: true },
      { text: ' ', start: 24, word: false },
      { text: 'call', start: 25, word: true },
      { text: '.', start: 29, word: false },
    ]);
    expect(piecesOf('')).toEqual([]);
    expect(piecesOf('— ok').map((piece) => piece.word)).toEqual([false, true]);
  });
});

describe('expressionBetween (D-095)', () => {
  const sentence = 'We set up a company in 2020.';

  it('gives the words between two picked words, as written, in either order', () => {
    expect(expressionBetween(sentence, 1, 1)).toBe('set');
    expect(expressionBetween(sentence, 1, 2)).toBe('set up');
    expect(expressionBetween(sentence, 2, 1)).toBe('set up');
  });

  it('gives nothing for a word that does not exist', () => {
    expect(expressionBetween(sentence, 1, 9)).toBe('');
  });

  it('makes a solvable card of a word picked in its sentence', () => {
    const expression = expressionBetween(sentence, 1, 2);
    expect(
      collocationCardOf({ expression, meaningFr: 'créer, fonder', example: sentence }),
    ).toMatchObject({
      type: 'collocation',
      context: 'We ___ a company in 2020.',
      answers: { canonical: 'set up' },
    });
  });
});
