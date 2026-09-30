/**
 * Progress of a track, for the progress bars of the path (MOD-04): each notion
 * counts for the share of its five steps already passed.
 */
import type { NotionProgressValues } from './progress.ts';

const STEPS = 5;

/** Share of a notion already done, from 0 (not started) to 1 (acquired). */
export function notionCompletion(progress: NotionProgressValues | null | undefined): number {
  if (progress === null || progress === undefined) return 0;
  switch (progress.status) {
    case 'not_started':
      return 0;
    case 'acquired':
      return 1;
    case 'in_progress':
    case 'to_consolidate':
      return (progress.step - 1) / STEPS;
  }
}

/** Share of a set of notions already done, from 0 to 1; 0 for an empty set. */
export function trackCompletion(
  progress: readonly (NotionProgressValues | null | undefined)[],
): number {
  if (progress.length === 0) return 0;
  return progress.reduce((sum, entry) => sum + notionCompletion(entry), 0) / progress.length;
}
