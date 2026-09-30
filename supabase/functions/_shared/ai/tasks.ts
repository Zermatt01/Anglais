// Generated from shared/ai/tasks.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * AI tasks and their input and output contracts (AI-01, D-017).
 *
 * The client sends `{ task, input, requestId }`, never a prompt; the Edge
 * Function validates the input with the task's schema, builds the versioned
 * prompt and validates the model's output with the task's output schema.
 *
 * Each phase adds the tasks it needs (docs/ARCHITECTURE.md §10.2):
 * `connection-check` (phase 2, D-066) and `generate-exercises` (phase 3, D-079).
 *
 * Output schemas stay simple, without length or range constraints: structured
 * outputs do not support them (D-010). What they cannot express is checked by
 * the client, exercise by exercise.
 */
import { z } from 'zod';

export const AI_TASK_NAMES = ['connection-check', 'generate-exercises'] as const;
export const aiTaskNameSchema = z.enum(AI_TASK_NAMES);
export type AiTaskName = z.infer<typeof aiTaskNameSchema>;

/**
 * Notions whose exercises may be generated: the notions delivered so far.
 * `src/content` tests check this list against the curriculum.
 */
export const GENERATABLE_NOTION_IDS = [
  'tense-present-continuous',
  'tense-present-simple',
  'tense-present-simple-vs-continuous',
  'tense-past-simple',
  'tense-past-continuous',
  'tense-present-perfect',
  'tense-just-already-yet-still',
  'tense-for-since-ago',
  'tense-present-perfect-vs-past-simple',
  'tense-future',
  'tense-present-perfect-continuous',
  'tense-past-perfect',
  'tense-review',
] as const;
export type GeneratableNotionId = (typeof GENERATABLE_NOTION_IDS)[number];

/** The learner's domains (USR-05); `src/domain/settings.ts` tests keep them identical. */
export const LEARNER_DOMAIN_IDS = [
  'finance',
  'data-ai',
  'teaching',
  'job-interviews',
  'workplace-communication',
  'daily-life',
] as const;

/** Exercises asked for in one call. */
export const GENERATED_EXERCISES_PER_CALL = 6;

/** Longest sentence sent back to the model as "already used". */
export const MAX_AVOIDED_SENTENCE = 300;
export const MAX_AVOIDED_SENTENCES = 60;

const generatedChoiceSchema = z.strictObject({
  kind: z.literal('choice-with-reason'),
  sentence: z.string(),
  contextFr: z.string().nullable(),
  options: z.array(z.string()),
  answer: z.string(),
  reasons: z.array(z.string()),
  reason: z.string(),
  explanation: z.string(),
});

const generatedFillVerbSchema = z.strictObject({
  kind: z.literal('fill-verb'),
  sentence: z.string(),
  verb: z.string(),
  meaningFr: z.string(),
  accepted: z.array(z.string()),
  knownErrors: z.array(z.string()),
  explanation: z.string(),
});

const generatedTranslateSchema = z.strictObject({
  kind: z.literal('translate'),
  sentenceFr: z.string(),
  hint: z.string(),
  difficulty: z.number(),
  accepted: z.array(z.string()),
  knownErrors: z.array(z.string()),
  explanation: z.string(),
});

export const generatedExerciseSchema = z.discriminatedUnion('kind', [
  generatedChoiceSchema,
  generatedFillVerbSchema,
  generatedTranslateSchema,
]);
export type GeneratedExercise = z.infer<typeof generatedExerciseSchema>;

/** Kind of exercise generated for each step (step 3: fill the verb only, D-079). */
export const GENERATED_KIND_OF_STEP = {
  2: 'choice-with-reason',
  3: 'fill-verb',
  4: 'translate',
} as const satisfies Record<2 | 3 | 4, GeneratedExercise['kind']>;

export const TASK_CONTRACTS = {
  'connection-check': {
    input: z.strictObject({}),
    output: z.strictObject({ status: z.enum(['ok']) }),
  },
  'generate-exercises': {
    input: z.strictObject({
      notionId: z.enum(GENERATABLE_NOTION_IDS),
      step: z.union([z.literal(2), z.literal(3), z.literal(4)]),
      englishVariant: z.enum(['en-GB', 'en-US']),
      domains: z.array(z.enum(LEARNER_DOMAIN_IDS)).max(LEARNER_DOMAIN_IDS.length),
      /** Sentences of the exercises the learner already has, not to be repeated. */
      avoid: z.array(z.string().min(1).max(MAX_AVOIDED_SENTENCE)).max(MAX_AVOIDED_SENTENCES),
    }),
    output: z.strictObject({ exercises: z.array(generatedExerciseSchema) }),
  },
} as const satisfies Record<AiTaskName, { input: z.ZodType; output: z.ZodType }>;

export type AiTaskInput<Task extends AiTaskName> = z.infer<(typeof TASK_CONTRACTS)[Task]['input']>;
export type AiTaskOutput<Task extends AiTaskName> = z.infer<
  (typeof TASK_CONTRACTS)[Task]['output']
>;
