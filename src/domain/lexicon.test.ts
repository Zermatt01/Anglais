import { describe, expect, it } from 'vitest';
import { collocationCardOf, expressionBetween, piecesOf, sentenceAround } from './lexicon.ts';

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

describe('sentenceAround (D-095)', () => {
  const text =
    'I joined the team in May. Since then, we have set up a new model! Is it working? "Yes." Next step.';

  it('gives the sentence that holds the words picked, with its punctuation', () => {
    expect(sentenceAround(text, 10, 11)).toBe('Since then, we have set up a new model!');
    expect(sentenceAround(text, 0, 0)).toBe('I joined the team in May.');
    expect(sentenceAround(text, 16, 16)).toBe('Is it working?');
    expect(sentenceAround(text, 18, 18)).toBe('"Yes."');
    expect(sentenceAround(text, 20, 20)).toBe('Next step.');
  });

  it('keeps every sentence that the words picked lie in', () => {
    expect(sentenceAround(text, 6, 5)).toBe(
      'I joined the team in May. Since then, we have set up a new model!',
    );
  });

  it('ends a sentence at a line break', () => {
    const letter = 'Dear Anna,\nThanks for the report.';
    expect(sentenceAround(letter, 2, 2)).toBe('Thanks for the report.');
    expect(sentenceAround(letter, 0, 0)).toBe('Dear Anna,');
  });

  it('gives the whole text when a word does not exist', () => {
    expect(sentenceAround(` ${text} `, 99, 99)).toBe(text);
  });

  it('never ends a sentence at an abbreviation, a decimal point or a full stop without a space', () => {
    expect(sentenceAround('We use open tools, e.g. Python and R.', 6, 6)).toBe(
      'We use open tools, e.g. Python and R.',
    );
    expect(sentenceAround('Use a language (e.g. Python) every day.', 5, 5)).toBe(
      'Use a language (e.g. Python) every day.',
    );
    expect(sentenceAround('I met Dr. Smith at 9 a.m. yesterday.', 8, 8)).toBe(
      'I met Dr. Smith at 9 a.m. yesterday.',
    );
    expect(sentenceAround('Growth was 3.5 percent. Rates fell.', 4, 4)).toBe(
      'Growth was 3.5 percent.',
    );
    expect(sentenceAround('See example.com for details.', 3, 3)).toBe(
      'See example.com for details.',
    );
  });

  it('keeps two sentences together after an abbreviation that ends one: too long, never a fragment', () => {
    expect(sentenceAround('The call ended at 5 p.m. Then we left.', 9, 9)).toBe(
      'The call ended at 5 p.m. Then we left.',
    );
  });
});
