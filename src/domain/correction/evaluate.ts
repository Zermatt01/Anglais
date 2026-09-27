/**
 * Local answer checking (COST-02, docs/ARCHITECTURE.md §6).
 *
 * The order of the checks protects NO-05: an answer that matches an accepted
 * answer is always correct, even if it also matches a known error (that would
 * be a content bug, caught by the content tests). An answer that matches
 * nothing is "unknown", never "incorrect": only an explicit user action may then
 * send it to the model.
 */
import { answerForms } from './forms.ts';

export type LocalVerdict = 'correct' | 'incorrect' | 'unknown';

export interface AnswerKey {
  /** Canonical answer first, then the acceptable variants. */
  readonly accepted: readonly string[];
  /** Wrong answers anticipated by the exercise author. */
  readonly knownErrors?: readonly string[];
}

export interface LocalEvaluation {
  readonly verdict: LocalVerdict;
  /** The accepted answer or known error that matched, as written in the key. */
  readonly matched: string | null;
}

function findMatch(forms: ReadonlySet<string>, candidates: readonly string[]): string | null {
  for (const candidate of candidates) {
    for (const form of answerForms(candidate)) {
      if (forms.has(form)) return candidate;
    }
  }
  return null;
}

/** Grades an answer against an answer key, without any network call. */
export function evaluateAnswer(answer: string, key: AnswerKey): LocalEvaluation {
  const forms = answerForms(answer);
  if (forms.has('')) return { verdict: 'unknown', matched: null };

  const accepted = findMatch(forms, key.accepted);
  if (accepted !== null) return { verdict: 'correct', matched: accepted };

  const knownError = findMatch(forms, key.knownErrors ?? []);
  if (knownError !== null) return { verdict: 'incorrect', matched: knownError };

  return { verdict: 'unknown', matched: null };
}
