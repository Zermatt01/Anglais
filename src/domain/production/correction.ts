/**
 * The correction of a production, as the model returns it, then checked and
 * repaired before anything is shown or stored (AI-07, docs/ARCHITECTURE.md §6).
 *
 * The model's output is never trusted as is (NO-05):
 * - an "error" whose correction is the same answer as its segment (a
 *   contraction, a British or American spelling of the closed lists, another
 *   apostrophe) is not an error: dropped. A change of case or punctuation
 *   only is kept: it is what spelling and punctuation errors are about;
 * - a segment is searched in the learner's text, never taken from the model's
 *   offsets; one that cannot be found is shown without highlighting, as a
 *   point to check that counts nowhere (D-088);
 * - a sentence becomes a card only if it is a whole sentence of the text, and
 *   if the model's corrected sentence is the original with the corrections of
 *   its errors applied; the card's answer is then computed by the app (D-088);
 * - scores are brought back to their scale.
 *
 * The shape mirrors the `correct-production` output schema of `shared/ai`,
 * which validates it first; this module only depends on the domain.
 */
import { areEquivalent } from '../correction/forms.ts';
import { locateSegment, type TextRange } from '../correction/segments.ts';
import type { NotionId } from '../curriculum/notion-id.ts';
import type { AnswerResult, Confidence, ErrorCategory, Severity } from '../taxonomy.ts';
import type { CefrLevel } from '../level.ts';

export interface ModelError {
  readonly segment: string;
  readonly start: number;
  readonly category: ErrorCategory;
  readonly notionId: NotionId | null;
  readonly severity: Severity;
  readonly confidence: Confidence;
  readonly hintFr: string;
  readonly correction: string;
  readonly ruleFr: string;
}

export interface ModelUnnaturalPhrase {
  readonly original: string;
  readonly alternative: string;
  readonly whyFr: string;
  readonly category: ErrorCategory | null;
}

export interface ModelSentence {
  readonly original: string;
  readonly corrected: string;
  readonly variants: readonly string[];
  readonly meaningFr: string;
}

export interface ExpressionOfTheDay {
  readonly expression: string;
  readonly meaningFr: string;
  readonly example: string;
}

export interface Evaluation {
  readonly accuracy: number;
  readonly naturalness: number;
  readonly complexity: number;
  readonly level: CefrLevel;
  readonly commentFr: string;
}

/** What the model answers to `correct-production`. */
export interface ModelCorrection {
  readonly intentFr: string;
  readonly errors: readonly ModelError[];
  readonly unnatural: readonly ModelUnnaturalPhrase[];
  readonly sentences: readonly ModelSentence[];
  readonly correctedText: string;
  readonly naturalVersion: string;
  readonly usesTargetNotion: boolean | null;
  readonly expressionOfTheDay: ExpressionOfTheDay | null;
  readonly evaluation: Evaluation;
}

export interface ReviewedError extends ModelError {
  /** Position in the reviewed list: the key of the error in the production. */
  readonly index: number;
  /** Where the segment is in the learner's text, or `null` when it cannot be found. */
  readonly range: TextRange | null;
}

export interface ReviewedPhrase extends ModelUnnaturalPhrase {
  readonly range: TextRange | null;
}

/** A whole sentence of the text, with its correction checked by the app (D-088). */
export interface ReviewedSentence {
  readonly original: string;
  readonly range: TextRange;
  readonly meaningFr: string;
  /**
   * The original with the corrections of its errors applied, except those the
   * model is not sure of: the answer of its card.
   */
  readonly answer: string;
}

export interface ReviewedCorrection {
  readonly intentFr: string;
  readonly errors: readonly ReviewedError[];
  readonly unnatural: readonly ReviewedPhrase[];
  readonly sentences: readonly ReviewedSentence[];
  readonly correctedText: string;
  readonly naturalVersion: string;
  readonly usesTargetNotion: boolean | null;
  readonly expressionOfTheDay: ExpressionOfTheDay | null;
  readonly evaluation: Evaluation;
}

/** Longest stored text of an error (`errors` table). */
export const MAX_ERROR_TEXT = 1_000;

const hasText = (text: string): boolean => /\S/.test(text);

const APOSTROPHE_LIKE = /[‘’‛ʼ`´]/g;
const DOUBLE_QUOTE_LIKE = /[“”„]/g;

/** The text as written, with one kind of apostrophe and of quote, and single spaces. */
function surface(text: string): string {
  return text
    .normalize('NFKC')
    .replace(APOSTROPHE_LIKE, "'")
    .replace(DOUBLE_QUOTE_LIKE, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lowercase, without punctuation other than apostrophes and hyphens, which belong to words. */
function wordsOnly(text: string): string {
  return surface(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Whether a correction leaves the segment the same answer (NO-05): the same
 * text up to apostrophes and spaces, or an equivalent reading of the local
 * correction (contractions, spelling pairs, small numbers). A difference of
 * case or punctuation alone ("monday" → "Monday", "Really ?" → "Really?")
 * is a real spelling or punctuation error.
 */
export function isSameAnswer(segment: string, correction: string): boolean {
  const before = surface(segment);
  const after = surface(correction);
  if (before === after) return true;
  if (before.toLowerCase() === after.toLowerCase()) return false;
  if (wordsOnly(before) === wordsOnly(after)) return false;
  return areEquivalent(before, after);
}

function proposedStart(start: number): number {
  return Number.isFinite(start) ? Math.max(0, Math.round(start)) : 0;
}

/** A score of the evaluation, as a whole number from 1 to 5. */
export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 1;
  return Math.min(5, Math.max(1, Math.round(score)));
}

function reviewError(text: string, error: ModelError): Omit<ReviewedError, 'index'> | null {
  if (!hasText(error.segment) || error.segment.length > MAX_ERROR_TEXT) return null;
  if (error.correction.length > MAX_ERROR_TEXT) return null;
  if (isSameAnswer(error.segment, error.correction)) return null;
  return {
    ...error,
    hintFr: error.hintFr.slice(0, MAX_ERROR_TEXT),
    ruleFr: error.ruleFr.slice(0, MAX_ERROR_TEXT),
    range: locateSegment(text, error.segment, proposedStart(error.start)),
  };
}

/** Final punctuation of a sentence, with the quotes or brackets that may close it. */
const SENTENCE_END = /[.!?…]["'’”)\]]*$/u;

/**
 * Whether `range` covers whole sentences of `text`: it starts the text, a
 * line or a sentence, and it ends with its own final punctuation, just before
 * the final punctuation, or at the end of a line or of the text. "I work" in
 * "I work here since 2023." is not a sentence.
 */
export function isWholeSentence(text: string, range: TextRange): boolean {
  const before = text.slice(0, range.start).replace(/[^\S\n]+$/u, '');
  const starts = before === '' || before.endsWith('\n') || SENTENCE_END.test(before);
  const covered = text.slice(range.start, range.end).trimEnd();
  const after = text.slice(range.end);
  const ends =
    SENTENCE_END.test(covered) ||
    !hasText(after) ||
    /^[.!?…]/u.test(after) ||
    /^[^\S\n]*\n/u.test(after);
  return starts && ends;
}

/**
 * The text of `range` with the corrections of `errors` applied, or `null`
 * when an error straddles its limits or overlaps another one.
 */
function applyCorrections(
  text: string,
  range: TextRange,
  errors: readonly ReviewedError[],
): string | null {
  const located = errors.flatMap((error) =>
    error.range === null || error.range.end <= range.start || error.range.start >= range.end
      ? []
      : [{ range: error.range, correction: error.correction }],
  );
  located.sort((a, b) => a.range.start - b.range.start);
  let result = '';
  let cursor = range.start;
  for (const error of located) {
    if (error.range.start < cursor || error.range.end > range.end) return null;
    result += text.slice(cursor, error.range.start) + error.correction;
    cursor = error.range.end;
  }
  result += text.slice(cursor, range.end);
  // A deleted word leaves two spaces, or a space before a punctuation mark.
  return result
    .replace(/[^\S\n]{2,}/gu, ' ')
    .replace(/[^\S\n]+([.,;:!?…])/gu, '$1')
    .trim();
}

/**
 * Keeps a sentence for the cards only when the app can check it (D-088): it
 * is a whole sentence of the text, and the model's corrected sentence is the
 * original with the corrections of its errors applied (with or without those
 * the model is not sure of). Any other change could be a wrong answer.
 */
function reviewSentence(
  text: string,
  sentence: ModelSentence,
  errors: readonly ReviewedError[],
): ReviewedSentence | null {
  if (!hasText(sentence.original) || !hasText(sentence.corrected)) return null;
  const range = locateSegment(text, sentence.original);
  if (range === null || !isWholeSentence(text, range)) return null;
  const answer = applyCorrections(
    text,
    range,
    errors.filter((error) => error.confidence !== 'low'),
  );
  const withDoubtful = applyCorrections(text, range, errors);
  if (answer === null || withDoubtful === null) return null;
  if (areEquivalent(answer, sentence.original)) return null;
  if (
    !areEquivalent(sentence.corrected, answer) &&
    !areEquivalent(sentence.corrected, withDoubtful)
  ) {
    return null;
  }
  return { original: sentence.original, range, meaningFr: sentence.meaningFr, answer };
}

function reviewPhrase(text: string, phrase: ModelUnnaturalPhrase): ReviewedPhrase | null {
  if (!hasText(phrase.original) || !hasText(phrase.alternative)) return null;
  if (areEquivalent(phrase.original, phrase.alternative)) return null;
  return { ...phrase, range: locateSegment(text, phrase.original) };
}

/** Checks and repairs a correction of `text` (AI-07). */
export function reviewCorrection(text: string, output: ModelCorrection): ReviewedCorrection {
  const errors = output.errors
    .map((error) => reviewError(text, error))
    .filter((error) => error !== null)
    .map((error, index) => ({ ...error, index }));
  const expression = output.expressionOfTheDay;
  return {
    intentFr: output.intentFr,
    errors,
    unnatural: output.unnatural
      .map((phrase) => reviewPhrase(text, phrase))
      .filter((phrase) => phrase !== null),
    sentences: output.sentences
      .map((sentence) => reviewSentence(text, sentence, errors))
      .filter((sentence) => sentence !== null),
    correctedText: output.correctedText,
    naturalVersion: output.naturalVersion,
    usesTargetNotion: output.usesTargetNotion,
    expressionOfTheDay:
      expression !== null && hasText(expression.expression) && hasText(expression.meaningFr)
        ? expression
        : null,
    evaluation: {
      ...output.evaluation,
      accuracy: clampScore(output.evaluation.accuracy),
      naturalness: clampScore(output.evaluation.naturalness),
      complexity: clampScore(output.evaluation.complexity),
    },
  };
}

/** What decides whether an error counts: its severity, its confidence, and where it is. */
export interface CountableError {
  readonly severity: Severity;
  readonly confidence: Confidence;
  /** `null` when the segment cannot be found in the text. */
  readonly range: TextRange | null;
}

/**
 * A point to check: an error the model is not sure of (AI-05), or whose
 * segment the app cannot find in the text (D-088). It is shown, and it counts
 * nowhere: neither in a result, nor in the statistics, nor in a diagnosis.
 */
export function isPointToCheck(error: CountableError): boolean {
  return error.range === null || error.confidence === 'low';
}

/**
 * An error that counts: medium or major, and not a point to check. It makes
 * cards and counts in the statistics and the step criteria.
 */
export function isCountedError(error: CountableError): boolean {
  return error.severity !== 'minor' && !isPointToCheck(error);
}

/**
 * A qualifying error (docs/PEDAGOGY.md §4.1, D-024): a counted error, with a
 * high confidence or confirmed by the learner, and not reported. Only these
 * can reveal a lacuna: a false positive never sends the learner back.
 */
export function isQualifyingError(
  error: CountableError & { readonly confirmedByUser: boolean; readonly reported: boolean },
): boolean {
  return (
    isCountedError(error) &&
    (error.confidence === 'high' || error.confirmedByUser) &&
    !error.reported
  );
}

/**
 * Result of a translation of step 4 graded by the model (PEDAGOGY §3.3): good
 * when it has no counted error on the target notion. Errors of other notions
 * or minor ones make it "acceptable"; they are handled by the cards. Points to
 * check are left out.
 */
export function translationResult(
  correction: ReviewedCorrection,
  targetNotionId: NotionId,
): AnswerResult {
  const errors = correction.errors.filter((error) => !isPointToCheck(error));
  if (errors.some((error) => error.notionId === targetNotionId && isCountedError(error))) {
    return 'incorrect';
  }
  return errors.length > 0 ? 'acceptable' : 'correct';
}

/** What step 5 needs to know of a corrected production (PEDAGOGY §3.3). */
export function productionCheckOf(
  correction: ReviewedCorrection,
  targetNotionId: NotionId,
): { readonly usesNotion: boolean; readonly hasNotionError: boolean } {
  return {
    usesNotion: correction.usesTargetNotion === true,
    hasNotionError: correction.errors.some(
      (error) => error.notionId === targetNotionId && isCountedError(error),
    ),
  };
}

export type SelfCorrectionCheck =
  /** The learner's correction is the proposed one, up to normalization. */
  | 'matches'
  /** The learner kept the segment as it was. */
  | 'unchanged'
  /** Another correction: shown next to the proposed one, never called wrong (D-026). */
  | 'different';

/** Compares a self-correction with the proposed correction, locally (D-026). */
export function checkSelfCorrection(
  attempt: string,
  error: { readonly segment: string; readonly correction: string },
): SelfCorrectionCheck {
  if (surface(attempt) === surface(error.segment)) return 'unchanged';
  if (isSameAnswer(attempt, error.correction)) return 'matches';
  return 'different';
}
