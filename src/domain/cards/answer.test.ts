import { describe, expect, it } from 'vitest';
import { evaluateCardAnswer, expectedSentenceOf, textWithGapOf } from './answer.ts';
import type { CardContent } from './content.ts';

const cloze: CardContent = {
  type: 'cloze',
  meaningFr: 'Elle vient de partir.',
  text: 'She ___ left.',
  infinitive: null,
  hint: null,
  notionId: 'tense-just-already-yet-still',
  answers: { canonical: 'has just', variants: [] },
};

const notion: CardContent = {
  type: 'notion',
  notionId: 'tense-past-simple',
  meaningFr: 'J’ai envoyé le contrat hier.',
  hint: 'Un moment passé précis.',
  answers: {
    canonical: 'I sent the contract yesterday.',
    variants: ['Yesterday I sent the contract.'],
  },
};

describe('evaluateCardAnswer (CARD-05)', () => {
  it('puts a filler back in its sentence: a contraction matches', () => {
    expect(evaluateCardAnswer(cloze, '’s just').verdict).toBe('correct');
    expect(evaluateCardAnswer(cloze, 'has just').verdict).toBe('correct');
  });

  it('accepts the variants of a whole sentence', () => {
    expect(evaluateCardAnswer(notion, 'yesterday I sent the contract').verdict).toBe('correct');
  });

  it('never declares an unexpected answer wrong (NO-05)', () => {
    expect(evaluateCardAnswer(notion, 'I have sent the contract yesterday.').verdict).toBe(
      'unknown',
    );
    expect(evaluateCardAnswer(cloze, 'just').verdict).toBe('unknown');
    expect(evaluateCardAnswer(notion, '  ').verdict).toBe('unknown');
  });

  it('shows the expected answer as a whole sentence', () => {
    expect(expectedSentenceOf(cloze)).toBe('She has just left.');
    expect(expectedSentenceOf(notion)).toBe('I sent the contract yesterday.');
    expect(textWithGapOf(notion)).toBeNull();
  });
});
