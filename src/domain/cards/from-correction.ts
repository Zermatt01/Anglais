/**
 * Cards made from a corrected production (CARD-02, PED-04, D-083).
 *
 * One card per sentence of the learner's text that contains a counted error
 * (medium or major, not doubtful): its errors are highlighted in the previous
 * attempt, and the answer is the corrected sentence with its variants. The
 * meaning is the learner's intention for that sentence; when the text is a
 * single sentence answering a reviewed reference (a Thème sentence, a
 * translation), the reference's French meaning and answers are used.
 *
 * The hint is the model's self-correction hint, unless it gives away the
 * correction: then a reviewed hint of the error's category is used. Every
 * draft passes `isCardSolvable` (CARD-01); the others are not made.
 */
import { containsInflectedPhrase } from '../correction/inflections.ts';
import { areEquivalent } from '../correction/forms.ts';
import type { TextRange } from '../correction/segments.ts';
import {
  isCountedError,
  type ReviewedCorrection,
  type ReviewedError,
  type ReviewedSentence,
} from '../production/correction.ts';
import type { ErrorCategory, Severity } from '../taxonomy.ts';
import type { ErrorCardContent } from './content.ts';
import { isCardSolvable } from './solvability.ts';

/** Variants of a card's answer (`cardAnswersSchema`). */
const MAX_CARD_VARIANTS = 30;

export interface Reference {
  readonly meaningFr: string;
  readonly answers: readonly string[];
}

export interface ErrorCardDraft {
  readonly content: ErrorCardContent;
  /** Index of the error that gives the card its category, notion and hint. */
  readonly primaryErrorIndex: number;
  readonly errorIndexes: readonly number[];
}

const SEVERITY_RANK: Readonly<Record<Severity, number>> = { minor: 0, medium: 1, major: 2 };

const hasText = (text: string): boolean => /\S/.test(text);

function inside(range: TextRange, sentence: TextRange): boolean {
  return range.start >= sentence.start && range.end <= sentence.end;
}

/** Whether the sentence is the whole text, apart from spaces and final punctuation. */
function isWholeText(text: string, range: TextRange): boolean {
  return (
    !hasText(text.slice(0, range.start)) && text.slice(range.end).replace(/[\s.!?…]/g, '') === ''
  );
}

function distinctAnswers(canonical: string, candidates: readonly string[]): string[] {
  const variants: string[] = [];
  for (const candidate of candidates) {
    if (!hasText(candidate) || areEquivalent(candidate, canonical)) continue;
    if (variants.some((variant) => areEquivalent(variant, candidate))) continue;
    variants.push(candidate);
    if (variants.length === MAX_CARD_VARIANTS) break;
  }
  return variants;
}

function primaryOf(errors: readonly ReviewedError[]): ReviewedError | undefined {
  let primary: ReviewedError | undefined;
  for (const error of errors) {
    if (primary === undefined || SEVERITY_RANK[error.severity] > SEVERITY_RANK[primary.severity]) {
      primary = error;
    }
  }
  return primary;
}

/** The model's hint, unless it contains the correction in some form. */
function hintOf(error: ReviewedError, fallback: string): string {
  const revealing =
    hasText(error.correction) && containsInflectedPhrase(error.hintFr, error.correction);
  return hasText(error.hintFr) && !revealing ? error.hintFr : fallback;
}

function draftOf(
  text: string,
  sentence: ReviewedSentence,
  errors: readonly ReviewedError[],
  reference: Reference | null,
  fallbackHint: (category: ErrorCategory) => string,
): ErrorCardDraft | null {
  const primary = primaryOf(errors);
  if (primary === undefined) return null;
  const whole = reference !== null && isWholeText(text, sentence.range);
  const meaningFr = whole ? reference.meaningFr : sentence.meaningFr;
  const answers = {
    canonical: sentence.corrected,
    variants: distinctAnswers(sentence.corrected, [
      ...sentence.variants,
      ...(whole ? reference.answers : []),
    ]),
  };
  const base = {
    type: 'error' as const,
    meaningFr,
    previousAttempt: text.slice(sentence.range.start, sentence.range.end),
    highlights: errors.flatMap(({ range }) =>
      range === null
        ? []
        : [{ start: range.start - sentence.range.start, end: range.end - sentence.range.start }],
    ),
    category: primary.category,
    notionId: primary.notionId,
    answers,
  };
  const fallback = fallbackHint(primary.category);
  for (const hint of [hintOf(primary, fallback), fallback]) {
    const content: ErrorCardContent = { ...base, hint };
    if (isCardSolvable(content).solvable) {
      return {
        content,
        primaryErrorIndex: primary.index,
        errorIndexes: errors.map((error) => error.index),
      };
    }
  }
  return null;
}

/** The solvable cards of a corrected production, in the order of the text. */
export function errorCardDrafts({
  text,
  correction,
  reference,
  fallbackHint,
}: {
  readonly text: string;
  readonly correction: ReviewedCorrection;
  readonly reference: Reference | null;
  readonly fallbackHint: (category: ErrorCategory) => string;
}): ErrorCardDraft[] {
  const drafts: ErrorCardDraft[] = [];
  const sentences = [...correction.sentences].sort((a, b) => a.range.start - b.range.start);
  for (const sentence of sentences) {
    const errors = correction.errors.filter(
      (error) =>
        error.range !== null && inside(error.range, sentence.range) && isCountedError(error),
    );
    const draft = draftOf(text, sentence, errors, reference, fallbackHint);
    if (draft !== null) drafts.push(draft);
  }
  return drafts;
}
