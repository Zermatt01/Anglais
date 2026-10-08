/**
 * What the learner's own errors say (PED-04): the rule book, sheet by
 * category (MOD-10), and the weak spots given to the correction prompt so
 * that the model knows the learner (AI-02).
 *
 * Only counted errors are used (medium or major, neither doubtful nor out of
 * the text), never a reported one: a false positive must not shape the
 * learner's priorities.
 */
import type { TextRange } from '../correction/segments.ts';
import type { NotionId } from '../curriculum/notion-id.ts';
import { isCountedError } from '../production/correction.ts';
import type { Confidence, ErrorCategory, Severity } from '../taxonomy.ts';
import type { Diagnosis } from './diagnosis.ts';

export const DAY_MS = 24 * 60 * 60 * 1000;
/** Recent errors: the last thirty days. */
export const RECENT_WINDOW_MS = 30 * DAY_MS;
/** Examples shown on a sheet of the rule book. */
export const RULE_BOOK_EXAMPLES = 3;

export interface ErrorRecord {
  readonly productionId: string;
  readonly at: number;
  readonly category: ErrorCategory;
  readonly notionId: NotionId | null;
  readonly segment: string;
  /** Where the segment is in its production, or `null` when it was not found. */
  readonly range: TextRange | null;
  readonly correction: string;
  readonly rule: string;
  readonly severity: Severity;
  readonly confidence: Confidence;
  readonly diagnosis: Diagnosis | null;
  readonly reported: boolean;
}

export interface RuleSheet {
  readonly category: ErrorCategory;
  readonly total: number;
  readonly recent: number;
  /** Notions of these errors, the most frequent first. */
  readonly notions: readonly NotionId[];
  /** The most recent errors, newest first. */
  readonly examples: readonly ErrorRecord[];
}

function counted(errors: readonly ErrorRecord[]): ErrorRecord[] {
  return errors.filter((error) => !error.reported && isCountedError(error));
}

/** Keys ordered by count, then by first appearance. */
function byFrequency<Key>(keys: readonly Key[]): Key[] {
  const counts = new Map<Key, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key);
}

/** One sheet per category with counted errors, the most recent trouble first. */
export function ruleBook(errors: readonly ErrorRecord[], now: number): RuleSheet[] {
  const kept = counted(errors).sort((a, b) => b.at - a.at);
  const categories = new Map<ErrorCategory, ErrorRecord[]>();
  for (const error of kept) {
    const list = categories.get(error.category) ?? [];
    list.push(error);
    categories.set(error.category, list);
  }
  return [...categories.entries()]
    .map(([category, list]) => ({
      category,
      total: list.length,
      recent: list.filter((error) => error.at > now - RECENT_WINDOW_MS).length,
      notions: byFrequency(
        list.flatMap((error) => (error.notionId === null ? [] : [error.notionId])),
      ),
      examples: list.slice(0, RULE_BOOK_EXAMPLES),
    }))
    .sort((a, b) => b.recent - a.recent || b.total - a.total);
}

export interface WeakSpots {
  readonly categories: readonly ErrorCategory[];
  readonly notions: readonly NotionId[];
}

/**
 * The categories and notions of the learner's recent errors, the most
 * frequent first; each production counts once per category and per notion,
 * like the slip-or-gap rule.
 */
export function weakSpots(errors: readonly ErrorRecord[], now: number, limit: number): WeakSpots {
  const recent = counted(errors).filter((error) => error.at > now - RECENT_WINDOW_MS);
  const once = <Key>(keyOf: (error: ErrorRecord) => Key | null): Key[] => {
    const seen = new Set<string>();
    const keys: Key[] = [];
    for (const error of recent) {
      const key = keyOf(error);
      if (key === null) continue;
      const id = `${error.productionId}:${String(key)}`;
      if (seen.has(id)) continue;
      seen.add(id);
      keys.push(key);
    }
    return byFrequency(keys).slice(0, limit);
  };
  return {
    categories: once((error) => error.category),
    notions: once((error) => error.notionId),
  };
}

/**
 * Notions to put first in the path (PEDAGOGY §4.2): those whose recent errors
 * revealed a gap, or were made before the notion was studied.
 */
export function notionsToPrioritize(errors: readonly ErrorRecord[], now: number): Set<NotionId> {
  return new Set(
    counted(errors)
      .filter(
        (error) =>
          error.at > now - RECENT_WINDOW_MS &&
          error.notionId !== null &&
          (error.diagnosis === 'lacune' || error.diagnosis === 'unstudied'),
      )
      .flatMap((error) => (error.notionId === null ? [] : [error.notionId])),
  );
}
