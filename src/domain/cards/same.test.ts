import { describe, expect, it } from 'vitest';
import type { CardContent } from './content.ts';
import { asksTheSame } from './same.ts';

const errorCard: CardContent = {
  type: 'error',
  meaningFr: 'Le train part à huit heures.',
  hint: 'Un horaire.',
  previousAttempt: 'The train leave at eight.',
  highlights: [],
  category: 'accord_sujet_verbe',
  notionId: 'tense-present-simple',
  answers: { canonical: 'The train leaves at eight.', variants: [] },
};

const notionCard: CardContent = {
  type: 'notion',
  notionId: 'tense-present-simple',
  meaningFr: 'Le train part à huit heures.',
  hint: 'Un horaire.',
  answers: { canonical: 'The train leaves at 8.', variants: [] },
};

describe('asksTheSame (D-092)', () => {
  it('matches two cards that ask to express the same sentence, whatever the attempt', () => {
    expect(asksTheSame(errorCard, { ...errorCard, previousAttempt: 'The train leaving.' })).toBe(
      true,
    );
    // "8" and "eight" are the same answer for the local correction (D-046).
    expect(asksTheSame(errorCard, notionCard)).toBe(true);
  });

  it('keeps apart another sentence, another answer, or another kind of question', () => {
    expect(
      asksTheSame(errorCard, { ...errorCard, meaningFr: 'Le train part à neuf heures.' }),
    ).toBe(false);
    expect(
      asksTheSame(errorCard, {
        ...errorCard,
        answers: { canonical: 'The train left at eight.', variants: [] },
      }),
    ).toBe(false);
    expect(
      asksTheSame(errorCard, {
        type: 'cloze',
        meaningFr: 'Le train part à huit heures.',
        text: 'The train ___ at eight.',
        infinitive: 'leave',
        hint: null,
        notionId: 'tense-present-simple',
        answers: { canonical: 'leaves', variants: [] },
      }),
    ).toBe(false);
    const said = { type: 'pronunciation', text: 'three', soundCategory: 'th' } as const;
    expect(asksTheSame(said, said)).toBe(false);
  });
});
