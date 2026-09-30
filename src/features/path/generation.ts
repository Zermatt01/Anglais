/**
 * Exercise generation (CUR-07, D-079): what is sent to the model, and how its
 * answer becomes stored exercises. Each generated exercise is checked like the
 * core (schema, then `checkExercise`); one that fails is dropped, never shown.
 */
import {
  GENERATABLE_NOTION_IDS,
  GENERATED_KIND_OF_STEP,
  MAX_AVOIDED_SENTENCE,
  MAX_AVOIDED_SENTENCES,
  type AiTaskInput,
  type GeneratedExercise,
  type GeneratableNotionId,
} from '../../../shared/ai/tasks.ts';
import {
  checkExercise,
  exerciseSchema,
  STEP_OF_KIND,
  type Exercise,
} from '../../domain/curriculum/exercise.ts';
import type { SettingsValues } from '../../domain/settings.ts';

export function isGeneratable(notionId: string): notionId is GeneratableNotionId {
  return GENERATABLE_NOTION_IDS.some((id) => id === notionId);
}

/** Sentence that identifies an exercise, to ask the model not to repeat it. */
export function promptSentenceOf(exercise: Exercise): string {
  switch (exercise.kind) {
    case 'choice-with-reason':
    case 'fill-verb':
    case 'place-word':
      return exercise.sentence;
    case 'transform':
      return exercise.source;
    case 'translate':
      return exercise.sentenceFr;
  }
}

export function generationInput(
  notionId: GeneratableNotionId,
  step: 2 | 3 | 4,
  settings: SettingsValues,
  existing: readonly Exercise[],
): AiTaskInput<'generate-exercises'> {
  const avoid = existing
    .filter((exercise) => STEP_OF_KIND[exercise.kind] === step)
    .map((exercise) => promptSentenceOf(exercise).slice(0, MAX_AVOIDED_SENTENCE))
    .filter((sentence) => /\S/.test(sentence))
    // The most recent ones last: they are the closest to what may come next.
    .slice(-MAX_AVOIDED_SENTENCES);
  return {
    notionId,
    step,
    englishVariant: settings.englishVariant,
    domains: [...settings.learnerProfile.domains],
    avoid,
  };
}

function toExerciseInput(generated: GeneratedExercise): unknown {
  switch (generated.kind) {
    case 'choice-with-reason': {
      const { contextFr, ...rest } = generated;
      return contextFr === null || !/\S/.test(contextFr) ? rest : { ...rest, contextFr };
    }
    case 'fill-verb':
    case 'translate':
      return generated;
  }
}

export interface CheckedGeneration {
  readonly exercises: Exercise[];
  /** Exercises dropped: malformed, of another step, or unfit for local grading. */
  readonly dropped: number;
}

/** Keeps the generated exercises of the step asked for that pass every check. */
export function checkGeneratedExercises(
  generated: readonly GeneratedExercise[],
  step: 2 | 3 | 4,
  existing: readonly Exercise[],
): CheckedGeneration {
  const known = new Set(existing.map((exercise) => promptSentenceOf(exercise).trim()));
  const exercises: Exercise[] = [];
  for (const candidate of generated) {
    if (candidate.kind !== GENERATED_KIND_OF_STEP[step]) continue;
    const parsed = exerciseSchema.safeParse(toExerciseInput(candidate));
    if (!parsed.success || checkExercise(parsed.data).length > 0) continue;
    const sentence = promptSentenceOf(parsed.data).trim();
    if (known.has(sentence)) continue;
    known.add(sentence);
    exercises.push(parsed.data);
  }
  return { exercises, dropped: generated.length - exercises.length };
}
