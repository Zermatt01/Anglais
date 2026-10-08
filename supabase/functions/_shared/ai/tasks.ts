// Generated from shared/ai/tasks.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * AI tasks and their input and output contracts (AI-01, D-017).
 *
 * The client sends `{ task, input, requestId }`, never a prompt; the Edge
 * Function validates the input with the task's schema, builds the versioned
 * prompt and validates the model's output with the task's output schema.
 *
 * Each phase adds the tasks it needs (docs/ARCHITECTURE.md §10.2):
 * `connection-check` (phase 2, D-066), `generate-exercises` (phase 3, D-079),
 * `correct-production` and `check-card-answer` (phase 4, D-083).
 *
 * Output schemas stay simple, without length or range constraints: structured
 * outputs do not support them (D-010). What they cannot express is checked by
 * the client, exercise by exercise.
 */
import { z } from 'zod';
import { CEFR_LEVELS, CONTRACT_ERROR_CATEGORIES, CONTRACT_NOTION_IDS } from './curriculum.ts';

export const AI_TASK_NAMES = [
  'connection-check',
  'generate-exercises',
  'correct-production',
  'check-card-answer',
] as const;
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

/**
 * Upper bound of the input of one generation call, as the Edge Function
 * estimates it for the largest possible request (contract test). The client
 * shows the highest cost from it, without reading the prompts (D-017, D-081).
 */
export const GENERATE_EXERCISES_MAX_INPUT_TOKENS = 16_000;

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

/** Text that contains at least one visible character. */
const visible = (max: number) => z.string().min(1).max(max).regex(/\S/);

const englishVariantSchema = z.enum(['en-GB', 'en-US']);
const domainsSchema = z.array(z.enum(LEARNER_DOMAIN_IDS)).max(LEARNER_DOMAIN_IDS.length);

/** Where a corrected production comes from (docs/ARCHITECTURE.md §4.2, `productions`). */
export const CORRECTED_MODULES = ['theme', 'journal', 'path-produce', 'path-translate'] as const;
export type CorrectedModule = (typeof CORRECTED_MODULES)[number];

/** Longest learner text sent for a correction: a journal entry of three to five sentences. */
export const MAX_PRODUCTION_TEXT = 2_000;
export const MAX_INSTRUCTION_TEXT = 600;
export const MAX_REFERENCE_ANSWERS = 10;
export const MAX_REFERENCE_ANSWER = 500;
/** The learner's own remarks (settings), shortened before they are sent. */
export const MAX_PROFILE_REMARKS_SENT = 500;
export const MAX_WEAK_ITEMS = 5;

/**
 * Upper bound of the input of one correction, as the Edge Function estimates
 * it for the largest possible request (contract test): the cost shown before
 * "Corriger" is computed from it (COST-10).
 */
export const CORRECT_PRODUCTION_MAX_INPUT_TOKENS = 20_000;

const correctionErrorSchema = z.strictObject({
  /** The erroneous text, copied exactly from the learner's text, as short as possible. */
  segment: z.string(),
  /** Proposed position of the segment; repaired by the client (AI-07). */
  start: z.number(),
  category: z.enum(CONTRACT_ERROR_CATEGORIES),
  notionId: z.enum(CONTRACT_NOTION_IDS).nullable(),
  severity: z.enum(['minor', 'medium', 'major']),
  confidence: z.enum(['low', 'medium', 'high']),
  /** Self-correction hint, in French, that does not give the correction (PED-05). */
  hintFr: z.string(),
  /** What replaces the segment. */
  correction: z.string(),
  ruleFr: z.string(),
});

/** Correct but not natural (PED-06): never an error. */
const unnaturalPhraseSchema = z.strictObject({
  original: z.string(),
  alternative: z.string(),
  whyFr: z.string(),
  category: z.enum(CONTRACT_ERROR_CATEGORIES).nullable(),
});

/** A sentence of the learner's text that contains an error: what a card is made of (AI-08). */
const correctedSentenceSchema = z.strictObject({
  /** The learner's sentence, copied exactly. */
  original: z.string(),
  corrected: z.string(),
  /** Other correct versions with the same meaning. */
  variants: z.array(z.string()),
  /** What the learner meant, in French: the card's meaning (CARD-02). */
  meaningFr: z.string(),
});

export const correctionOutputSchema = z.strictObject({
  /** What the learner meant, in French (AI-08). */
  intentFr: z.string(),
  errors: z.array(correctionErrorSchema),
  unnatural: z.array(unnaturalPhraseSchema),
  sentences: z.array(correctedSentenceSchema),
  /** The text with only its errors corrected. */
  correctedText: z.string(),
  /** How a native speaker would say it, with the same meaning. */
  naturalVersion: z.string(),
  /** Whether the text uses the target notion; `null` without a target notion. */
  usesTargetNotion: z.boolean().nullable(),
  expressionOfTheDay: z
    .strictObject({ expression: z.string(), meaningFr: z.string(), example: z.string() })
    .nullable(),
  evaluation: z.strictObject({
    /** 1 to 5, checked by the client (structured outputs have no ranges, D-010). */
    accuracy: z.number(),
    naturalness: z.number(),
    complexity: z.number(),
    level: z.enum(CEFR_LEVELS),
    commentFr: z.string(),
  }),
});
export type CorrectionOutput = z.infer<typeof correctionOutputSchema>;

/** Card types whose answers the fast model may check (CARD-05); pronunciation is oral (P6). */
export const CHECKED_CARD_TYPES = ['error', 'cloze', 'collocation', 'notion'] as const;
export const MAX_CARD_TEXT = 1_000;
export const MAX_CARD_ANSWERS = 31;
export const MAX_CARD_ANSWER = 500;

/** Upper bound of the input of one card check, as the Edge Function estimates it (contract test). */
export const CHECK_CARD_ANSWER_MAX_INPUT_TOKENS = 20_000;

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
  'correct-production': {
    input: z.strictObject({
      module: z.enum(CORRECTED_MODULES),
      /** Instruction shown to the learner, in French or in English (PED-02). */
      instruction: z.strictObject({
        text: visible(MAX_INSTRUCTION_TEXT),
        language: z.enum(['fr', 'en']),
      }),
      /** Reviewed reference of a translation or a Thème sentence: never the only right answer. */
      reference: z
        .strictObject({
          meaningFr: visible(MAX_INSTRUCTION_TEXT),
          answers: z.array(visible(MAX_REFERENCE_ANSWER)).max(MAX_REFERENCE_ANSWERS),
        })
        .nullable(),
      targetNotionId: z.enum(CONTRACT_NOTION_IDS).nullable(),
      /** Who the learner is (AI-02): the model has no memory. */
      learner: z.strictObject({
        englishVariant: englishVariantSchema,
        domains: domainsSchema,
        /** `null` until the level is estimated (phase 5). */
        level: z.enum(CEFR_LEVELS).nullable(),
        weakCategories: z.array(z.enum(CONTRACT_ERROR_CATEGORIES)).max(MAX_WEAK_ITEMS),
        weakNotions: z.array(z.enum(CONTRACT_NOTION_IDS)).max(MAX_WEAK_ITEMS),
        remarks: z.string().max(MAX_PROFILE_REMARKS_SENT),
      }),
      text: visible(MAX_PRODUCTION_TEXT),
    }),
    output: correctionOutputSchema,
  },
  'check-card-answer': {
    input: z.strictObject({
      cardType: z.enum(CHECKED_CARD_TYPES),
      meaningFr: visible(MAX_CARD_TEXT),
      /** Sentence with its gap (`___`), for cloze and collocation cards. */
      textWithGap: visible(MAX_CARD_TEXT).nullable(),
      infinitive: visible(MAX_CARD_TEXT).nullable(),
      /** Canonical answer first, then the variants. */
      expected: z.array(visible(MAX_CARD_TEXT)).min(1).max(MAX_CARD_ANSWERS),
      answer: visible(MAX_CARD_ANSWER),
      englishVariant: englishVariantSchema,
    }),
    output: z.strictObject({
      verdict: z.enum(['correct', 'acceptable', 'incorrect']),
      /** One short French sentence, shown to the learner. */
      reasonFr: z.string(),
    }),
  },
} as const satisfies Record<AiTaskName, { input: z.ZodType; output: z.ZodType }>;

export type AiTaskInput<Task extends AiTaskName> = z.infer<(typeof TASK_CONTRACTS)[Task]['input']>;
export type AiTaskOutput<Task extends AiTaskName> = z.infer<
  (typeof TASK_CONTRACTS)[Task]['output']
>;
