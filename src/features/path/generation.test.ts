import { describe, expect, it } from 'vitest';
import { REASON_SETS } from '../../../shared/ai/reasons.ts';
import type { GeneratedExercise } from '../../../shared/ai/tasks.ts';
import { exerciseSchema, type Exercise } from '../../domain/curriculum/exercise.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { checkGeneratedExercises, generationInput } from './generation.ts';

const NOTION = 'tense-present-continuous';
/** A reviewed set of the notion (D-081): "in progress now", then two wrong reasons. */
const [NOW, ...WRONG] = REASON_SETS[NOTION][0] ?? [''];

const choice: GeneratedExercise = {
  kind: 'choice-with-reason',
  sentence: 'Please be quiet: the analyst ___ a call.',
  contextFr: null,
  options: ['is taking', 'are taking', 'taking'],
  answer: 'is taking',
  reasons: [NOW, ...WRONG],
  reason: NOW,
  explanation: 'L’appel a lieu maintenant.',
};

const existing: Exercise[] = [
  exerciseSchema.parse({
    kind: 'choice-with-reason',
    sentence: 'Listen! The alarm ___.',
    options: ['is ringing', 'rings'],
    answer: 'is ringing',
    reasons: ['Maintenant', 'Habitude'],
    reason: 'Maintenant',
    explanation: 'Maintenant.',
  }),
  exerciseSchema.parse({
    kind: 'translate',
    sentenceFr: 'Il pleut.',
    hint: 'Maintenant.',
    difficulty: 1,
    accepted: ['It’s raining.'],
    explanation: 'Présent continu.',
  }),
];

describe('generationInput', () => {
  it('sends the notion, the step, the learner’s variant and domains, and the sentences to avoid', () => {
    expect(generationInput(NOTION, 2, DEFAULT_SETTINGS, existing)).toEqual({
      notionId: 'tense-present-continuous',
      step: 2,
      englishVariant: 'en-GB',
      domains: DEFAULT_SETTINGS.learnerProfile.domains,
      avoid: ['Listen! The alarm ___.'],
    });
  });
});

describe('checkGeneratedExercises', () => {
  it('keeps a well-formed exercise of the step asked for', () => {
    const result = checkGeneratedExercises([choice], NOTION, 2, existing);
    expect(result.dropped).toBe(0);
    expect(result.exercises[0]).toMatchObject({ kind: 'choice-with-reason', answer: 'is taking' });
    expect(result.exercises[0]).not.toHaveProperty('contextFr');
  });

  it('drops an exercise of another step, a malformed one, and one unfit for local grading', () => {
    const wrongAnswer = { ...choice, sentence: 'The desk ___ free.', answer: 'is empty' };
    const noGap = { ...choice, sentence: 'No gap in this sentence.' };
    const translate: GeneratedExercise = {
      kind: 'translate',
      sentenceFr: 'Elle travaille.',
      hint: 'x',
      difficulty: 7,
      accepted: ['She is working.'],
      knownErrors: [],
      explanation: 'x',
    };
    const result = checkGeneratedExercises([wrongAnswer, noGap, translate], NOTION, 2, existing);
    expect(result).toEqual({ exercises: [], dropped: 3 });
    expect(checkGeneratedExercises([translate], NOTION, 4, existing).dropped).toBe(1);
  });

  it('drops an exercise that repeats a sentence the learner already has', () => {
    const repeated = { ...choice, sentence: 'Listen! The alarm ___.' };
    expect(
      checkGeneratedExercises([repeated, choice, choice], NOTION, 2, existing).exercises,
    ).toHaveLength(1);
  });

  it('keeps reasons that are a reviewed set of the notion, in any order (D-081)', () => {
    const reordered = { ...choice, reasons: [...WRONG].reverse().concat(NOW) };
    expect(checkGeneratedExercises([reordered], NOTION, 2, existing).dropped).toBe(0);
  });

  it('drops reasons that are not a reviewed set of the notion (D-081)', () => {
    // A reworded reason could be a second right reason: never shown.
    const reworded = { ...choice, reasons: [NOW, 'Activité en cours en ce moment', ...WRONG] };
    const fewer = { ...choice, reasons: [NOW, WRONG[0] ?? ''] };
    const otherRight = { ...choice, reason: WRONG[0] ?? '' };
    const otherNotion = REASON_SETS['tense-future'][0] ?? [''];
    const fromAnotherNotion = { ...choice, reasons: [...otherNotion], reason: otherNotion[0] };
    const result = checkGeneratedExercises(
      [reworded, fewer, otherRight, fromAnotherNotion],
      NOTION,
      2,
      existing,
    );
    expect(result).toEqual({ exercises: [], dropped: 4 });
  });
});
