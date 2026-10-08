import { describe, expect, it } from 'vitest';
import {
  reviewCorrection,
  type ModelCorrection,
  type ModelError,
} from '../production/correction.ts';
import type { ErrorCategory } from '../taxonomy.ts';
import { errorCardDrafts } from './from-correction.ts';
import { isCardSolvable } from './solvability.ts';

const TEXT =
  'Last week I have presented the results to the board. I work here since 2023. Thanks for you help.';

const fallbackHint = (category: ErrorCategory) => `Indice de la catégorie ${category}.`;

function error(
  fields: Partial<ModelError> & Pick<ModelError, 'segment' | 'correction'>,
): ModelError {
  return {
    start: TEXT.indexOf(fields.segment),
    category: 'temps_verbaux',
    notionId: 'tense-present-perfect-vs-past-simple',
    severity: 'medium',
    confidence: 'high',
    hintFr: 'Regarde le moment indiqué : la période est-elle terminée ?',
    ruleFr: 'Prétérit avec un moment passé terminé.',
    ...fields,
  };
}

function output(fields: Partial<ModelCorrection>): ModelCorrection {
  return {
    intentFr: 'x',
    errors: [],
    unnatural: [],
    sentences: [],
    correctedText: '',
    naturalVersion: '',
    targetNotionUses: null,
    expressionOfTheDay: null,
    evaluation: { accuracy: 3, naturalness: 3, complexity: 3, level: 'A2', commentFr: '' },
    ...fields,
  };
}

const SENTENCES: ModelCorrection['sentences'] = [
  {
    original: 'Last week I have presented the results to the board.',
    corrected: 'Last week I presented the results to the board.',
    meaningFr: 'La semaine dernière, j’ai présenté les résultats au conseil.',
  },
  {
    original: 'I work here since 2023.',
    corrected: 'I have worked here since 2023.',
    meaningFr: 'Je travaille ici depuis 2023.',
  },
  {
    original: 'Thanks for you help.',
    corrected: 'Thanks for your help.',
    meaningFr: 'Merci pour ton aide.',
  },
];

function drafts(model: ModelCorrection, text = TEXT, reference = null) {
  return errorCardDrafts({
    text,
    correction: reviewCorrection(text, model),
    reference,
    fallbackHint,
  });
}

describe('errorCardDrafts (CARD-02)', () => {
  it('makes one solvable card per sentence with a counted error, in the order of the text', () => {
    const cards = drafts(
      output({
        errors: [
          error({
            segment: 'I work',
            correction: 'I have worked',
            notionId: 'tense-for-since-ago',
          }),
          error({ segment: 'have presented', correction: 'presented' }),
          error({
            segment: 'you help',
            correction: 'your help',
            category: 'orthographe',
            notionId: null,
            severity: 'minor',
          }),
        ],
        sentences: SENTENCES,
      }),
    );
    // The minor spelling error makes no card.
    expect(cards.map((card) => card.content.previousAttempt)).toEqual([
      'Last week I have presented the results to the board.',
      'I work here since 2023.',
    ]);
    for (const card of cards) expect(isCardSolvable(card.content).solvable).toBe(true);
    const [first] = cards;
    expect(first?.content).toMatchObject({
      type: 'error',
      meaningFr: 'La semaine dernière, j’ai présenté les résultats au conseil.',
      category: 'temps_verbaux',
      notionId: 'tense-present-perfect-vs-past-simple',
      highlights: [{ start: 12, end: 26 }],
      // The model's other version is not an accepted answer: nothing checks it (D-088).
      answers: { canonical: 'Last week I presented the results to the board.', variants: [] },
    });
  });

  it('never accepts a sentence of the model that its errors do not explain (D-088)', () => {
    const text = 'Yesterday I finish the report.';
    const cardsFor = (corrected: string) =>
      drafts(
        output({
          errors: [error({ segment: 'finish', correction: 'finished', start: 12 })],
          sentences: [{ original: text, corrected, meaningFr: 'Hier, j’ai fini le rapport.' }],
        }),
        text,
      );
    expect(cardsFor('I like pizza.')).toEqual([]);
    expect(cardsFor('Yesterday I finished the report.')[0]?.content.answers).toEqual({
      canonical: 'Yesterday I finished the report.',
      variants: [],
    });
  });

  it('makes no card from a part of a sentence (D-088)', () => {
    const text = 'I work here since 2023.';
    expect(
      drafts(
        output({
          errors: [
            error({ segment: 'I work', correction: 'I have worked', start: 0, notionId: null }),
          ],
          sentences: [{ original: 'I work', corrected: 'I have worked', meaningFr: 'x' }],
        }),
        text,
      ),
    ).toEqual([]);
  });

  it('highlights every counted error of a sentence and takes the most severe as its primary', () => {
    const text = 'Yesterday I have see the client.';
    const cards = drafts(
      output({
        errors: [
          error({
            segment: 'have',
            correction: '',
            start: text.indexOf('have'),
            severity: 'medium',
          }),
          error({
            segment: 'see',
            correction: 'saw',
            start: text.indexOf('see'),
            severity: 'major',
            notionId: 'tense-past-simple',
            hintFr: 'Un verbe irrégulier au passé.',
          }),
        ],
        sentences: [
          {
            original: text,
            corrected: 'Yesterday I saw the client.',
            meaningFr: 'Hier, j’ai vu le client.',
          },
        ],
      }),
      text,
    );
    expect(cards).toHaveLength(1);
    expect(cards[0]?.primaryErrorIndex).toBe(1);
    expect(cards[0]?.errorIndexes).toEqual([0, 1]);
    expect(cards[0]?.content).toMatchObject({
      notionId: 'tense-past-simple',
      hint: 'Un verbe irrégulier au passé.',
      highlights: [
        { start: 12, end: 16 },
        { start: 17, end: 20 },
      ],
    });
  });

  it('replaces a hint that gives the correction away by the reviewed hint of the category', () => {
    const cards = drafts(
      output({
        errors: [
          error({
            segment: 'have presented',
            correction: 'presented',
            hintFr: 'Il faut dire _presented_.',
          }),
        ],
        sentences: SENTENCES,
      }),
    );
    expect(cards[0]?.content.hint).toBe('Indice de la catégorie temps_verbaux.');
  });

  it('makes no card for a doubtful error, nor for an error that cannot be found', () => {
    expect(
      drafts(
        output({
          errors: [
            error({ segment: 'have presented', correction: 'presented', confidence: 'low' }),
            error({ segment: 'I has worked', correction: 'I have worked' }),
          ],
          sentences: SENTENCES,
        }),
      ),
    ).toEqual([]);
  });

  it('makes no card when the corrected sentence is the learner’s own (NO-05)', () => {
    const text = 'I organise the meetings.';
    expect(
      drafts(
        output({
          errors: [error({ segment: 'organise', correction: 'organize', start: 2 })],
          sentences: [{ original: text, corrected: 'I organize the meetings.', meaningFr: 'x' }],
        }),
        text,
      ),
    ).toEqual([]);
  });

  it('uses the reviewed reference for a text of a single sentence', () => {
    const text = 'I work here since 2023.';
    const cards = errorCardDrafts({
      text,
      correction: reviewCorrection(
        text,
        output({
          errors: [
            error({
              segment: 'I work',
              correction: 'I have worked',
              start: 0,
              notionId: 'tense-for-since-ago',
            }),
          ],
          sentences: [SENTENCES[1] ?? { original: '', corrected: '', meaningFr: '' }],
        }),
      ),
      reference: {
        meaningFr: 'Je travaille ici depuis 2023.',
        answers: ['I have worked here since 2023.', 'I have been working here since 2023.'],
      },
      fallbackHint,
    });
    expect(cards[0]?.content.meaningFr).toBe('Je travaille ici depuis 2023.');
    // The reviewed answers are accepted; the model's version is not.
    expect(cards[0]?.content.answers).toEqual({
      canonical: 'I have worked here since 2023.',
      variants: ['I have been working here since 2023.'],
    });
  });
});
