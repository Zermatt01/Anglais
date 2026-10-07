/**
 * Exercises of steps 2 to 4 (CUR-03, docs/ARCHITECTURE.md §5): one schema for
 * the core exercises written in `src/content` and for the exercises generated
 * by the model and stored in `generatedExercises` (D-043).
 *
 * The schema checks the shape; `checkExercise` checks that an exercise can be
 * graded locally without ever marking a correct answer wrong (NO-05): its
 * answer is among its options, no anticipated error is an accepted answer, its
 * hint does not give the answer away, and so on. The core test runs it on
 * every exercise of the core (CUR-11); generated exercises failing it are
 * never stored.
 */
import { z } from 'zod';
import { countGaps } from '../cards/content.ts';
import { evaluateAnswer, type LocalEvaluation } from '../correction/evaluate.ts';
import { areEquivalent } from '../correction/forms.ts';
import { containsInflectedPhrase } from '../correction/inflections.ts';
import { tokenize } from '../correction/normalize.ts';
import { CONTEXT_DEPENDENT_SPELLINGS } from '../correction/spelling.ts';
import { visibleTextSchema } from '../primitives.ts';
import type { Step } from './progress.ts';

const MAX_TEXT = 500;
const MAX_ANSWERS = 30;

const textSchema = visibleTextSchema.max(MAX_TEXT);
const answersSchema = z.array(textSchema).min(1).max(MAX_ANSWERS);
const knownErrorsSchema = z.array(textSchema).max(MAX_ANSWERS).default([]);

/** Step 2: choose the form, then the reason (PEDAGOGY §3.2). */
export const choiceWithReasonSchema = z.strictObject({
  kind: z.literal('choice-with-reason'),
  /** English sentence with one gap (`___`). */
  sentence: textSchema,
  /** Situation in French, when the sentence alone would allow two forms (D-035). */
  contextFr: textSchema.optional(),
  options: z.array(textSchema).min(2).max(4),
  answer: textSchema,
  /** Reasons in French. */
  reasons: z.array(textSchema).min(2).max(4),
  reason: textSchema,
  /** Shown after the answer, in French. */
  explanation: textSchema,
});

/** Step 3: complete the sentence with the right form of the given verb. */
export const fillVerbSchema = z.strictObject({
  kind: z.literal('fill-verb'),
  /** English sentence with one gap (`___`). */
  sentence: textSchema,
  /** Base form of the verb to use. */
  verb: textSchema,
  /** The whole sentence in French: the meaning to express. */
  meaningFr: textSchema,
  /** What fills the gap: the canonical answer first, then the variants. */
  accepted: answersSchema,
  /** Wrong fillers anticipated by the author, each wrong in every reading (D-035). */
  knownErrors: knownErrorsSchema,
  explanation: textSchema,
});

/** Step 3: rewrite a sentence as asked (negative, question, another time…). */
export const transformSchema = z.strictObject({
  kind: z.literal('transform'),
  source: textSchema,
  /** What to do, in French. */
  instructionFr: textSchema,
  /** Whole sentences: the canonical answer first, then the variants. */
  accepted: answersSchema,
  knownErrors: knownErrorsSchema,
  explanation: textSchema,
});

/** Step 3: put a word at the right place in the sentence. */
export const placeWordSchema = z.strictObject({
  kind: z.literal('place-word'),
  sentence: textSchema,
  word: textSchema,
  meaningFr: textSchema,
  /** Whole sentences: the canonical answer first, then the variants. */
  accepted: answersSchema,
  knownErrors: knownErrorsSchema,
  explanation: textSchema,
});

/** Step 4: translate a French sentence targeting the notion only. */
export const translateSchema = z.strictObject({
  kind: z.literal('translate'),
  sentenceFr: textSchema,
  /** Shown on request only; it counts as help (PEDAGOGY §3.3). In French. */
  hint: textSchema,
  /** 1 to 3: the core of a step is taken in increasing difficulty. */
  difficulty: z.int().min(1).max(3),
  accepted: answersSchema,
  knownErrors: knownErrorsSchema,
  explanation: textSchema,
});

export const exerciseSchema = z.discriminatedUnion('kind', [
  choiceWithReasonSchema,
  fillVerbSchema,
  transformSchema,
  placeWordSchema,
  translateSchema,
]);
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseInput = z.input<typeof exerciseSchema>;
export type ExerciseKind = Exercise['kind'];
export type ExerciseOf<Kind extends ExerciseKind> = Extract<Exercise, { kind: Kind }>;

/** Step at which each kind of exercise is done (docs/ARCHITECTURE.md §5). */
export const STEP_OF_KIND: Readonly<Record<ExerciseKind, Step>> = {
  'choice-with-reason': 2,
  'fill-verb': 3,
  transform: 3,
  'place-word': 3,
  translate: 4,
};

/** A filler starting with an apostrophe is a contraction ("'s just left"). */
const CONTRACTION_START = /^['‘’‛ʹʼ`´′]/;

/**
 * Replaces the gap of a sentence with `value`. A contraction is attached to
 * the word before the gap: "She ___ left" + "'s" gives "She's left".
 */
export function fillGap(sentence: string, value: string): string {
  const filler = value.trim();
  const gap = CONTRACTION_START.test(filler) ? /\s*_{3,}/ : /_{3,}/;
  // A function, so that "$" in the filler is never read as a replacement pattern.
  return sentence.replace(gap, () => filler);
}

/** Accepted answers as whole sentences (a gap filler is put back in its sentence). */
export function acceptedAnswersOf(exercise: Exclude<Exercise, { kind: 'choice-with-reason' }>) {
  return exercise.kind === 'fill-verb'
    ? exercise.accepted.map((filler) => fillGap(exercise.sentence, filler))
    : exercise.accepted;
}

function knownErrorsOf(exercise: Exclude<Exercise, { kind: 'choice-with-reason' }>) {
  return exercise.kind === 'fill-verb'
    ? exercise.knownErrors.map((filler) => fillGap(exercise.sentence, filler))
    : exercise.knownErrors;
}

/**
 * Grades a typed answer locally. For a gap, the answer is put back in its
 * sentence, so that "She's just left" matches "She has just left".
 */
export function evaluateTypedAnswer(
  exercise: Exclude<Exercise, { kind: 'choice-with-reason' }>,
  answer: string,
): LocalEvaluation {
  if (!/\S/.test(answer)) return { verdict: 'unknown', matched: null };
  const whole = exercise.kind === 'fill-verb' ? fillGap(exercise.sentence, answer) : answer;
  return evaluateAnswer(whole, {
    accepted: acceptedAnswersOf(exercise),
    knownErrors: knownErrorsOf(exercise),
  });
}

/** Both parts of a step-2 answer must be right (PEDAGOGY §3.3). */
export function isChoiceCorrect(
  exercise: ExerciseOf<'choice-with-reason'>,
  form: string,
  reason: string,
): boolean {
  return form === exercise.answer && reason === exercise.reason;
}

export type ExerciseIssue =
  /** A sentence to complete must contain exactly one gap. */
  | 'gap-count'
  | 'answer-contains-gap'
  | 'answer-not-in-options'
  | 'reason-not-in-reasons'
  /** The reasons are not one of the reviewed sets of the notion (D-081). */
  | 'reason-set-not-reviewed'
  /** Two options (or two reasons) are the same answer: the choice is ambiguous. */
  | 'duplicate-option'
  | 'duplicate-reason'
  /** An anticipated error is in fact an accepted answer: it would be marked wrong (NO-05). */
  | 'known-error-accepted'
  | 'hint-reveals-answer'
  /** The French meaning is in fact one of the English answers. */
  | 'meaning-is-answer'
  /** The sentence to transform is already an accepted answer. */
  | 'source-is-answer'
  | 'word-already-placed'
  | 'word-missing-from-answer'
  /** A spelling that depends on the grammar is used without its counterpart (D-057). */
  | 'context-dependent-spelling';

function hasDuplicates(values: readonly string[]): boolean {
  return values.some((value, index) =>
    values.slice(index + 1).some((other) => areEquivalent(value, other)),
  );
}

function containsWord(text: string, word: string): boolean {
  const words = tokenize(word);
  const tokens = tokenize(text);
  return tokens.some((_, start) => words.every((part, index) => tokens[start + index] === part));
}

/**
 * Spellings of CONTEXT_DEPENDENT_SPELLINGS are never merged by the local
 * correction: when accepted answers use one, another accepted answer must use
 * its counterpart. Content avoids these words when only one spelling is right.
 */
function spellingIssues(accepted: readonly string[]): ExerciseIssue[] {
  const tokens = new Set(accepted.flatMap(tokenize));
  const unpaired = CONTEXT_DEPENDENT_SPELLINGS.some(
    ([british, american]) => tokens.has(british) !== tokens.has(american),
  );
  return unpaired ? ['context-dependent-spelling'] : [];
}

function typedAnswerIssues(
  exercise: Exclude<Exercise, { kind: 'choice-with-reason' }>,
): ExerciseIssue[] {
  const issues: ExerciseIssue[] = [];
  const accepted = acceptedAnswersOf(exercise);
  if (exercise.accepted.some((answer) => countGaps(answer) > 0)) issues.push('answer-contains-gap');
  const key = { accepted };
  if (knownErrorsOf(exercise).some((error) => evaluateAnswer(error, key).verdict === 'correct')) {
    issues.push('known-error-accepted');
  }
  issues.push(...spellingIssues(accepted));
  return issues;
}

/** The right reason, then the wrong reasons shown with it. */
export type ReasonSet = readonly [string, ...string[]];

function usesReasonSet(
  exercise: ExerciseOf<'choice-with-reason'>,
  sets: readonly ReasonSet[],
): boolean {
  const wrong = exercise.reasons.filter((reason) => reason !== exercise.reason).sort();
  return sets.some(([right, ...others]) => {
    const expected = [...others].sort();
    return (
      right === exercise.reason &&
      expected.length === wrong.length &&
      expected.every((reason, index) => reason === wrong[index])
    );
  });
}

export interface CheckOptions {
  /**
   * Reviewed reason sets the exercise must use (D-081). Given for generated
   * exercises: wording two reasons that both fit the answer is then impossible.
   */
  readonly reasonSets?: readonly ReasonSet[];
}

/** Everything that would make an exercise unfit for local grading; empty when fit. */
export function checkExercise(exercise: Exercise, options: CheckOptions = {}): ExerciseIssue[] {
  const issues: ExerciseIssue[] = [];
  switch (exercise.kind) {
    case 'choice-with-reason':
      if (options.reasonSets !== undefined && !usesReasonSet(exercise, options.reasonSets)) {
        issues.push('reason-set-not-reviewed');
      }
      if (countGaps(exercise.sentence) !== 1) issues.push('gap-count');
      if (exercise.options.some((option) => countGaps(option) > 0)) {
        issues.push('answer-contains-gap');
      }
      if (!exercise.options.includes(exercise.answer)) issues.push('answer-not-in-options');
      if (!exercise.reasons.includes(exercise.reason)) issues.push('reason-not-in-reasons');
      if (hasDuplicates(exercise.options.map((option) => fillGap(exercise.sentence, option)))) {
        issues.push('duplicate-option');
      }
      if (new Set(exercise.reasons).size !== exercise.reasons.length) {
        issues.push('duplicate-reason');
      }
      break;
    case 'fill-verb':
      if (countGaps(exercise.sentence) !== 1) issues.push('gap-count');
      issues.push(...typedAnswerIssues(exercise));
      if (acceptedAnswersOf(exercise).some((answer) => areEquivalent(exercise.meaningFr, answer))) {
        issues.push('meaning-is-answer');
      }
      break;
    case 'transform':
      issues.push(...typedAnswerIssues(exercise));
      if (exercise.accepted.some((answer) => areEquivalent(exercise.source, answer))) {
        issues.push('source-is-answer');
      }
      break;
    case 'place-word':
      issues.push(...typedAnswerIssues(exercise));
      if (containsWord(exercise.sentence, exercise.word)) issues.push('word-already-placed');
      if (exercise.accepted.some((answer) => !containsWord(answer, exercise.word))) {
        issues.push('word-missing-from-answer');
      }
      if (exercise.accepted.some((answer) => areEquivalent(exercise.meaningFr, answer))) {
        issues.push('meaning-is-answer');
      }
      break;
    case 'translate':
      issues.push(...typedAnswerIssues(exercise));
      if (exercise.accepted.some((answer) => containsInflectedPhrase(exercise.hint, answer))) {
        issues.push('hint-reveals-answer');
      }
      if (exercise.accepted.some((answer) => areEquivalent(exercise.sentenceFr, answer))) {
        issues.push('meaning-is-answer');
      }
      break;
  }
  return [...new Set(issues)];
}
