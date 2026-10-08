import { describe, expect, it } from 'vitest';
import {
  checkSelfCorrection,
  clampScore,
  isCountedError,
  isPointToCheck,
  isQualifyingError,
  isSameAnswer,
  isWholeSentence,
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

  it('keeps only the sentences found in the text and really corrected, with the answer applied by the app', () => {
    const reviewed = reviewCorrection(
      TEXT,
      correction({
        sentences: [
          {
            original: 'Last week I have presented the results.',
            corrected: 'Last week, I presented the results.',
            variants: ['I like pizza.'],
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
    expect(reviewed.sentences).toEqual([
      {
        original: 'Last week I have presented the results.',
        range: { start: 0, end: 39 },
        meaningFr: 'x',
        // The model's other versions are never kept (D-088).
        answer: 'Last week I presented the results.',
      },
    ]);
  });

  it('keeps out of the cards a part of a sentence (D-088)', () => {
    const text = 'I work here since 2023.';
    const reviewed = reviewCorrection(
      text,
      correction({
        errors: [
          error({
            segment: 'I work',
            correction: 'I have worked',
            notionId: 'tense-for-since-ago',
          }),
        ],
        sentences: [
          { original: 'I work', corrected: 'I have worked', variants: [], meaningFr: 'x' },
        ],
      }),
    );
    expect(reviewed.errors).toHaveLength(1);
    expect(reviewed.sentences).toEqual([]);
  });

  it('keeps out of the cards a sentence the model changed beyond its errors (D-088)', () => {
    const reviewed = reviewCorrection(
      TEXT,
      correction({
        sentences: [
          {
            original: 'Last week I have presented the results.',
            corrected: 'Last week I presented the final results.',
            variants: [],
            meaningFr: 'x',
          },
        ],
      }),
    );
    expect(reviewed.sentences).toEqual([]);
  });

  it('leaves doubtful corrections out of the answer, whether the model applied them or not', () => {
    const text = 'I am agree with you, it is a nice idea.';
    const errors = [
      error({
        segment: 'am agree',
        correction: 'agree',
        notionId: null,
        category: 'calques_du_francais',
      }),
      error({ segment: 'nice', correction: 'good', notionId: null, confidence: 'low' }),
    ];
    for (const corrected of [
      'I agree with you, it is a good idea.',
      'I agree with you, it is a nice idea.',
    ]) {
      const reviewed = reviewCorrection(
        text,
        correction({
          errors,
          sentences: [{ original: text, corrected, variants: [], meaningFr: 'x' }],
        }),
      );
      expect(reviewed.sentences[0]?.answer).toBe('I agree with you, it is a nice idea.');
    }
  });

  it('keeps out of the cards a sentence whose errors overlap or cross its limits', () => {
    const text = 'Last week I have presented the results. She gave me many advices.';
    const reviewed = reviewCorrection(
      text,
      correction({
        errors: [
          error({ segment: 'have presented', correction: 'presented' }),
          error({ segment: 'presented the', correction: 'showed the' }),
        ],
      }),
    );
    expect(reviewed.sentences).toEqual([]);
  });

  it('cleans the spaces left by a deleted word', () => {
    const text = 'He explained me the plan .';
    const reviewed = reviewCorrection(
      text,
      correction({
        errors: [error({ segment: 'me', correction: '', notionId: null })],
        sentences: [
          { original: text, corrected: 'He explained the plan.', variants: [], meaningFr: 'x' },
        ],
      }),
    );
    expect(reviewed.sentences[0]?.answer).toBe('He explained the plan.');
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

describe('isWholeSentence (D-088)', () => {
  const rangeOf = (text: string, part: string) => {
    const start = text.indexOf(part);
    return { start, end: start + part.length };
  };

  it.each([
    ['the whole text', 'I work here.', 'I work here.'],
    ['the whole text without its full stop', 'I work here.', 'I work here'],
    ['a second sentence', 'Hello. I work here! Bye.', 'I work here!'],
    ['a sentence after a line break', 'Dear Sam,\nI work here\nBest', 'I work here'],
    ['a sentence closed by a quote', 'He said “I agree.” Then he left.', 'He said “I agree.”'],
    ['two sentences', 'I work. You rest. We win.', 'I work. You rest.'],
  ])('accepts %s', (_label, text, part) => {
    expect(isWholeSentence(text, rangeOf(text, part))).toBe(true);
  });

  it.each([
    ['the start of a sentence', 'I work here since 2023.', 'I work'],
    ['the end of a sentence', 'I work here since 2023.', 'here since 2023.'],
    ['a clause before a comma', 'Be quiet, the baby sleeps.', 'Be quiet'],
    ['a clause before a semicolon', 'I agree; it works.', 'I agree'],
    ['the middle of a sentence', 'Yesterday I go to the office.', 'I go'],
  ])('rejects %s', (_label, text, part) => {
    expect(isWholeSentence(text, rangeOf(text, part))).toBe(false);
  });
});

describe('counted and qualifying errors (PEDAGOGY §4.1, D-024)', () => {
  const range = { start: 0, end: 4 };

  it.each([
    ['minor', 'high', false],
    ['medium', 'high', true],
    ['major', 'medium', true],
    ['major', 'low', false],
  ] as const)('a %s error of %s confidence counts: %s', (severity, confidence, counted) => {
    expect(isCountedError({ severity, confidence, range })).toBe(counted);
  });

  it('never counts an error the app cannot find in the text, however sure the model is (D-088)', () => {
    expect(isPointToCheck({ severity: 'major', confidence: 'high', range: null })).toBe(true);
    expect(isCountedError({ severity: 'major', confidence: 'high', range: null })).toBe(false);
    expect(
      isQualifyingError({
        severity: 'major',
        confidence: 'high',
        range: null,
        confirmedByUser: true,
        reported: false,
      }),
    ).toBe(false);
  });

  it('qualifies only a medium or major error that is certain or confirmed, and not reported', () => {
    const base = {
      severity: 'medium',
      confidence: 'high',
      range,
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
    const unfound = reviewCorrection(
      TEXT,
      correction({ errors: [error({ segment: 'has present', correction: 'presented' })] }),
    );
    expect(translationResult(unfound, target)).toBe('correct');
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
