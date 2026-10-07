import { describe, expect, it } from 'vitest';
import {
  checkSelfCorrection,
  clampScore,
  isCountedError,
  isQualifyingError,
  isSameAnswer,
  productionCheckOf,
  reviewCorrection,
  translationResult,
  type ModelCorrection,
  type ModelError,
} from './correction.ts';

const TEXT = 'Last week I have presented the results. She gave me many advices.';

function error(
  fields: Partial<ModelError> & Pick<ModelError, 'segment' | 'correction'>,
): ModelError {
  return {
    start: TEXT.indexOf(fields.segment),
    category: 'temps_verbaux',
    notionId: 'tense-present-perfect-vs-past-simple',
    severity: 'medium',
    confidence: 'high',
    hintFr: 'Regarde le moment indiqué.',
    ruleFr: 'Prétérit avec un moment passé.',
    ...fields,
  };
}

function correction(fields: Partial<ModelCorrection> = {}): ModelCorrection {
  return {
    intentFr: 'La semaine dernière, j’ai présenté les résultats.',
    errors: [error({ segment: 'have presented', correction: 'presented' })],
    unnatural: [],
    sentences: [
      {
        original: 'Last week I have presented the results.',
        corrected: 'Last week I presented the results.',
        variants: [],
        meaningFr: 'La semaine dernière, j’ai présenté les résultats.',
      },
    ],
    correctedText: 'Last week I presented the results. She gave me a lot of advice.',
    naturalVersion: 'Last week I presented the results. She gave me a lot of advice.',
    usesTargetNotion: null,
    expressionOfTheDay: null,
    evaluation: { accuracy: 3, naturalness: 3, complexity: 2, level: 'A2', commentFr: 'Bien.' },
    ...fields,
  };
}

describe('isSameAnswer (NO-05)', () => {
  it.each([
    ['a contraction', "don't", 'do not'],
    ['a British and an American spelling of the closed list', 'organise', 'organize'],
    ['another apostrophe', 'don’t', "don't"],
    ['a double space', 'the  report', 'the report'],
    ['a soldered spelling of the closed list', 'e-mail', 'email'],
    ['the same words', 'have presented', 'have presented'],
  ])('takes %s for the same answer', (_label, segment, corrected) => {
    expect(isSameAnswer(segment, corrected)).toBe(true);
  });

  it.each([
    ['a missing capital', 'monday', 'Monday'],
    ['the pronoun I', 'i', 'I'],
    ['a space before a question mark', 'Really ?', 'Really?'],
    ['a comma', 'However the', 'However, the'],
    ['another tense', 'have presented', 'presented'],
    ['a homophone', 'its', 'it’s'],
    ['a misspelling that is not a variant', 'exercize', 'exercise'],
    ['a hyphen that changes the word', 'follow up', 'follow-up'],
  ])('keeps %s as a real correction', (_label, segment, corrected) => {
    expect(isSameAnswer(segment, corrected)).toBe(false);
  });
});

describe('reviewCorrection (AI-07)', () => {
  it('locates each segment in the text, whatever offset the model proposes', () => {
    const reviewed = reviewCorrection(
      TEXT,
      correction({
        errors: [error({ segment: 'many advices', correction: 'a lot of advice', start: 3 })],
      }),
    );
    const start = TEXT.indexOf('many advices');
    expect(reviewed.errors[0]?.range).toEqual({ start, end: start + 'many advices'.length });
    expect(reviewed.errors[0]?.index).toBe(0);
  });

  it('keeps an error whose segment cannot be found, without highlighting', () => {
    const reviewed = reviewCorrection(
      TEXT,
      correction({ errors: [error({ segment: 'has present', correction: 'presented' })] }),
    );
    expect(reviewed.errors).toHaveLength(1);
    expect(reviewed.errors[0]?.range).toBeNull();
  });

  it('drops an "error" whose correction is the same answer, and renumbers the others', () => {
    const reviewed = reviewCorrection(
      'I organise the meetings and I have presented the results.',
      correction({
        errors: [
          error({ segment: 'organise', correction: 'organize', category: 'orthographe' }),
          error({ segment: 'have presented', correction: 'presented' }),
          error({ segment: ' ', correction: '' }),
        ],
      }),
    );
    expect(reviewed.errors.map((kept) => [kept.segment, kept.index])).toEqual([
      ['have presented', 0],
    ]);
  });

  it('keeps a spelling error of case only', () => {
    const reviewed = reviewCorrection(
      'See you on monday.',
      correction({
        errors: [
          error({
            segment: 'monday',
            correction: 'Monday',
            category: 'orthographe',
            notionId: null,
            severity: 'minor',
          }),
        ],
        sentences: [],
      }),
    );
    expect(reviewed.errors).toHaveLength(1);
  });

  it('keeps only the sentences found in the text and really corrected, with distinct variants', () => {
    const reviewed = reviewCorrection(
      TEXT,
      correction({
        sentences: [
          {
            original: 'Last week I have presented the results.',
            corrected: 'Last week I presented the results.',
            variants: [
              'Last week, I presented the results.',
              'Last week I have presented the results.',
              'I presented the results last week.',
              '  ',
            ],
            meaningFr: 'x',
          },
          {
            original: 'A sentence I never wrote.',
            corrected: 'Another.',
            variants: [],
            meaningFr: 'x',
          },
          {
            original: 'She gave me many advices.',
            corrected: 'She gave me many advices',
            variants: [],
            meaningFr: 'x',
          },
        ],
      }),
    );
    expect(reviewed.sentences.map((sentence) => sentence.original)).toEqual([
      'Last week I have presented the results.',
    ]);
    // Same words as the corrected sentence, or the original itself: not a variant.
    expect(reviewed.sentences[0]?.variants).toEqual(['I presented the results last week.']);
  });

  it('drops an unnatural phrase whose alternative is the same answer', () => {
    const reviewed = reviewCorrection(
      'According to me, it is fine.',
      correction({
        errors: [],
        sentences: [],
        unnatural: [
          { original: 'According to me', alternative: 'In my opinion', whyFr: 'x', category: null },
          { original: 'it is', alternative: "it's", whyFr: 'x', category: null },
        ],
      }),
    );
    expect(reviewed.unnatural.map((phrase) => phrase.original)).toEqual(['According to me']);
    expect(reviewed.unnatural[0]?.range).toEqual({ start: 0, end: 15 });
  });

  it('brings the scores back to whole numbers from 1 to 5', () => {
    expect([clampScore(0), clampScore(3.4), clampScore(9), clampScore(Number.NaN)]).toEqual([
      1, 3, 5, 1,
    ]);
    const reviewed = reviewCorrection(
      TEXT,
      correction({
        evaluation: { accuracy: 7, naturalness: -1, complexity: 2.6, level: 'B1', commentFr: '' },
      }),
    );
    expect(reviewed.evaluation).toMatchObject({ accuracy: 5, naturalness: 1, complexity: 3 });
  });

  it('drops an expression of the day without text', () => {
    expect(
      reviewCorrection(
        TEXT,
        correction({ expressionOfTheDay: { expression: ' ', meaningFr: 'x', example: 'x' } }),
      ).expressionOfTheDay,
    ).toBeNull();
  });
});

describe('counted and qualifying errors (PEDAGOGY §4.1, D-024)', () => {
  it.each([
    ['minor', 'high', false],
    ['medium', 'high', true],
    ['major', 'medium', true],
    ['major', 'low', false],
  ] as const)('a %s error of %s confidence counts: %s', (severity, confidence, counted) => {
    expect(isCountedError({ severity, confidence })).toBe(counted);
  });

  it('qualifies only a medium or major error that is certain or confirmed, and not reported', () => {
    const base = {
      severity: 'medium',
      confidence: 'high',
      confirmedByUser: false,
      reported: false,
    } as const;
    expect(isQualifyingError(base)).toBe(true);
    expect(isQualifyingError({ ...base, confidence: 'medium' })).toBe(false);
    expect(isQualifyingError({ ...base, confidence: 'medium', confirmedByUser: true })).toBe(true);
    expect(isQualifyingError({ ...base, reported: true })).toBe(false);
    expect(isQualifyingError({ ...base, severity: 'minor' })).toBe(false);
  });
});

describe('results of the path', () => {
  const target = 'tense-present-perfect-vs-past-simple';

  it('a translation with a counted error on the target notion is incorrect', () => {
    expect(translationResult(reviewCorrection(TEXT, correction()), target)).toBe('incorrect');
  });

  it('a translation whose errors are elsewhere, minor or doubtful is still good', () => {
    const elsewhere = reviewCorrection(
      TEXT,
      correction({
        errors: [
          error({
            segment: 'many advices',
            correction: 'a lot of advice',
            category: 'indenombrables_pluriels',
            notionId: 'nouns-countable-uncountable',
          }),
        ],
      }),
    );
    expect(translationResult(elsewhere, target)).toBe('acceptable');
    const doubtful = reviewCorrection(
      TEXT,
      correction({
        errors: [error({ segment: 'have presented', correction: 'presented', confidence: 'low' })],
      }),
    );
    expect(translationResult(doubtful, target)).toBe('correct');
    const minor = reviewCorrection(
      TEXT,
      correction({
        errors: [error({ segment: 'have presented', correction: 'presented', severity: 'minor' })],
      }),
    );
    expect(translationResult(minor, target)).toBe('acceptable');
    expect(translationResult(reviewCorrection(TEXT, correction({ errors: [] })), target)).toBe(
      'correct',
    );
  });

  it('step 5 needs the notion used and no counted error on it', () => {
    expect(
      productionCheckOf(reviewCorrection(TEXT, correction({ usesTargetNotion: true })), target),
    ).toEqual({ usesNotion: true, hasNotionError: true });
    expect(
      productionCheckOf(
        reviewCorrection(TEXT, correction({ errors: [], usesTargetNotion: false })),
        target,
      ),
    ).toEqual({ usesNotion: false, hasNotionError: false });
  });
});

describe('checkSelfCorrection (D-026)', () => {
  const tense = { segment: 'have presented', correction: 'presented' };

  it('recognizes the proposed correction, contractions and case included', () => {
    expect(checkSelfCorrection('presented', tense)).toBe('matches');
    expect(
      checkSelfCorrection("I've worked", { segment: 'I work', correction: 'I have worked' }),
    ).toBe('matches');
    expect(checkSelfCorrection('Monday', { segment: 'monday', correction: 'Monday' })).toBe(
      'matches',
    );
  });

  it('never calls another correction wrong', () => {
    expect(checkSelfCorrection('had presented', tense)).toBe('different');
    expect(checkSelfCorrection('have presented', tense)).toBe('unchanged');
    expect(checkSelfCorrection('monday', { segment: 'monday', correction: 'Monday' })).toBe(
      'unchanged',
    );
  });
});
