/**
 * A sentence of the Thème (MOD-05, PED-02): one meaning, given at three tiers
 * of instruction, with its reviewed answers (CUR-01, CUR-06).
 *
 * The accepted answers must be right for all three instructions, and each
 * anticipated error wrong in every reading of all three (D-035): a sentence
 * that matches neither is never declared wrong; the model corrects it on
 * request, or the learner compares it with the reference.
 */
import { z } from 'zod';
import { evaluateAnswer, type LocalEvaluation } from '../correction/evaluate.ts';
import { containsInflectedPhrase } from '../correction/inflections.ts';
import { checkExercise, type ExerciseIssue } from '../curriculum/exercise.ts';
import { visibleTextSchema } from '../primitives.ts';
import { errorCategorySchema } from '../taxonomy.ts';
import type { ThemeTier } from './tier.ts';

const textSchema = visibleTextSchema.max(500);

export const themeItemSchema = z.strictObject({
  /** Tier 1: the French sentence to translate. */
  sentenceFr: textSchema,
  /** Tier 2: the situation, described in French, without a sentence to translate word for word. */
  situationFr: textSchema,
  /** Tier 3: the instruction, entirely in English. */
  instructionEn: textSchema,
  /** In French; shown on request, or always for a notion not studied yet (D-023). */
  hint: textSchema,
  /** Whole sentences: the canonical answer first, then the variants. */
  accepted: z.array(textSchema).min(1).max(30),
  knownErrors: z.array(textSchema).max(30).default([]),
  /** Category of the anticipated errors, for the error they record (TAX-03). */
  knownErrorCategory: errorCategorySchema,
  /** In French, shown after the answer. */
  explanation: textSchema,
});
export type ThemeItem = z.infer<typeof themeItemSchema>;
export type ThemeItemInput = z.input<typeof themeItemSchema>;

export interface ThemeInstruction {
  readonly text: string;
  readonly language: 'fr' | 'en';
}

/** The instruction shown at a tier (PEDAGOGY §9.1). */
export function themeInstruction(item: ThemeItem, tier: ThemeTier): ThemeInstruction {
  switch (tier) {
    case 1:
      return { text: item.sentenceFr, language: 'fr' };
    case 2:
      return { text: item.situationFr, language: 'fr' };
    case 3:
      return { text: item.instructionEn, language: 'en' };
  }
}

export function evaluateThemeAnswer(item: ThemeItem, answer: string): LocalEvaluation {
  if (!/\S/.test(answer)) return { verdict: 'unknown', matched: null };
  return evaluateAnswer(answer, { accepted: item.accepted, knownErrors: item.knownErrors });
}

export type ThemeItemIssue =
  | ExerciseIssue
  /** The English instruction of tier 3 contains an accepted answer: it would give it away. */
  | 'instruction-reveals-answer'
  | 'situation-reveals-answer';

/** Everything that would make a Thème sentence unfit for local grading; empty when fit. */
export function checkThemeItem(item: ThemeItem): ThemeItemIssue[] {
  const issues: ThemeItemIssue[] = checkExercise({
    kind: 'translate',
    sentenceFr: item.sentenceFr,
    hint: item.hint,
    difficulty: 1,
    accepted: item.accepted,
    knownErrors: item.knownErrors,
    explanation: item.explanation,
  });
  if (item.accepted.some((answer) => containsInflectedPhrase(item.instructionEn, answer))) {
    issues.push('instruction-reveals-answer');
  }
  if (item.accepted.some((answer) => containsInflectedPhrase(item.situationFr, answer))) {
    issues.push('situation-reveals-answer');
  }
  return issues;
}
