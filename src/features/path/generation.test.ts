import { describe, expect, it } from 'vitest';
import type { GeneratedExercise } from '../../../shared/ai/tasks.ts';
import { exerciseSchema, type Exercise } from '../../domain/curriculum/exercise.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { checkGeneratedExercises, generationInput } from './generation.ts';

const choice: GeneratedExercise = {
  kind: 'choice-with-reason',
  sentence: 'Please be quiet: the analyst ___ a call.',
  contextFr: null,
  options: ['is taking', 'are taking', 'taking'],
  answer: 'is taking',
  reasons: ['Action en cours au moment où l’on parle', 'Habitude'],
  reason: 'Action en cours au moment où l’on parle',
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
    expect(generationInput('tense-present-continuous', 2, DEFAULT_SETTINGS, existing)).toEqual({
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
    const result = checkGeneratedExercises([choice], 2, existing);
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
    const result = checkGeneratedExercises([wrongAnswer, noGap, translate], 2, existing);
    expect(result).toEqual({ exercises: [], dropped: 3 });
    expect(checkGeneratedExercises([translate], 4, existing).dropped).toBe(1);
  });

  it('drops an exercise that repeats a sentence the learner already has', () => {
    const repeated = { ...choice, sentence: 'Listen! The alarm ___.' };
    expect(checkGeneratedExercises([repeated, choice, choice], 2, existing).exercises).toHaveLength(
      1,
    );
  });
});
