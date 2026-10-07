/**
 * The question of the journal (MOD-07): three to five free sentences answer a
 * question chosen among the reviewed ones, from the learner's domains first,
 * never asked before first, then the one asked longest ago.
 */
import type { LearnerDomain } from './settings.ts';

export interface JournalQuestion {
  readonly id: string;
  readonly domains: readonly LearnerDomain[];
}

export function pickJournalQuestion(
  questions: readonly JournalQuestion[],
  lastAsked: ReadonlyMap<string, number>,
  domains: readonly LearnerDomain[],
  skipped: ReadonlySet<string> = new Set(),
): string | null {
  const available = questions.filter((question) => !skipped.has(question.id));
  const preferred = available.filter((question) =>
    question.domains.some((domain) => domains.includes(domain)),
  );
  const pool = preferred.length > 0 ? preferred : available;
  let best: JournalQuestion | undefined;
  for (const question of pool) {
    const time = lastAsked.get(question.id) ?? Number.NEGATIVE_INFINITY;
    if (best === undefined || time < (lastAsked.get(best.id) ?? Number.NEGATIVE_INFINITY)) {
      best = question;
    }
  }
  return best?.id ?? null;
}
