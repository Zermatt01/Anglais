/**
 * The sentences of a Thème series (MOD-05, docs/PEDAGOGY.md §9.2, D-023).
 *
 * - They come from the studied notions (steps 4 and 5, to consolidate,
 *   acquired), those in progress or to consolidate first, then weighted by
 *   their recent errors and by the time since they were last practised. Each
 *   notion picked weighs half as much afterwards, and two sentences in a row
 *   never come from the same notion when another one is left (interleaving).
 * - Within a notion, the sentence never seen comes first, then the one seen
 *   longest ago.
 * - A notion not studied yet appears at most once in ten sentences, never
 *   twice in a row, always with its hint shown.
 */
import { isNotionStudied } from '../curriculum/engine.ts';
import { NOTION_IDS, type NotionId } from '../curriculum/notion-id.ts';
import type { NotionProgressValues } from '../curriculum/progress.ts';

export const THEME_SERIES_SIZE = 5;
/** At most one sentence of a notion not studied yet among this many (D-023). */
export const UNSTUDIED_EVERY = 10;
/** Position of that sentence in a series: never the first. */
const UNSTUDIED_POSITION = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ThemeCandidate {
  readonly itemId: string;
  readonly notionId: NotionId;
}

export interface ThemeHistoryEntry extends ThemeCandidate {
  readonly at: number;
  readonly unstudied: boolean;
}

export interface ThemePick extends ThemeCandidate {
  /** From a notion not studied yet: its hint is shown. */
  readonly unstudied: boolean;
}

function lastTimes<Key>(
  entries: readonly ThemeHistoryEntry[],
  keyOf: (entry: ThemeHistoryEntry) => Key,
) {
  const times = new Map<Key, number>();
  for (const entry of entries) {
    const key = keyOf(entry);
    times.set(key, Math.max(entry.at, times.get(key) ?? Number.NEGATIVE_INFINITY));
  }
  return times;
}

function weightOf(
  notionId: NotionId,
  progress: NotionProgressValues | undefined,
  recentErrors: number,
  lastPractice: number | undefined,
  now: number,
): number {
  // Steps 4 and 5 and notions to consolidate come first (MOD-05): their weight
  // outranks the errors and staleness of an acquired notion together (at most 5).
  const status = progress?.status === 'acquired' ? 1 : 7;
  const errors = Math.min(3, recentErrors);
  const staleness =
    lastPractice === undefined ? 2 : Math.min(2, Math.max(0, now - lastPractice) / (7 * DAY_MS));
  // Curriculum order breaks ties: earlier notions first.
  return status + errors + staleness - NOTION_IDS.indexOf(notionId) / 1_000;
}

/** The candidate of `notionId` seen longest ago (never seen first), not in `taken`. */
function nextItem(
  candidates: readonly ThemeCandidate[],
  seen: ReadonlyMap<string, number>,
  taken: ReadonlySet<string>,
): ThemeCandidate | undefined {
  let best: ThemeCandidate | undefined;
  for (const candidate of candidates) {
    if (taken.has(candidate.itemId)) continue;
    const time = seen.get(candidate.itemId) ?? Number.NEGATIVE_INFINITY;
    if (best === undefined || time < (seen.get(best.itemId) ?? Number.NEGATIVE_INFINITY)) {
      best = candidate;
    }
  }
  return best;
}

/** The notion not studied yet that may appear: the most advanced in the path, then the earliest. */
function unstudiedNotion(
  notions: readonly NotionId[],
  progress: ReadonlyMap<NotionId, NotionProgressValues>,
): NotionId | undefined {
  const unstudied = notions.filter((notionId) => !isNotionStudied(progress.get(notionId)));
  const stepOf = (notionId: NotionId) => {
    const values = progress.get(notionId);
    return values?.status === 'in_progress' ? values.step : 0;
  };
  return [...unstudied].sort(
    (a, b) => stepOf(b) - stepOf(a) || NOTION_IDS.indexOf(a) - NOTION_IDS.indexOf(b),
  )[0];
}

export function pickThemeSeries({
  candidates,
  progress,
  history,
  recentErrors,
  now,
  size = THEME_SERIES_SIZE,
}: {
  readonly candidates: readonly ThemeCandidate[];
  readonly progress: ReadonlyMap<NotionId, NotionProgressValues>;
  /** Thème answers already given, in any order. */
  readonly history: readonly ThemeHistoryEntry[];
  /** Counted errors of the last weeks, by notion. */
  readonly recentErrors: ReadonlyMap<NotionId, number>;
  readonly now: number;
  readonly size?: number;
}): ThemePick[] {
  const byNotion = new Map<NotionId, ThemeCandidate[]>();
  for (const candidate of candidates) {
    const list = byNotion.get(candidate.notionId) ?? [];
    list.push(candidate);
    byNotion.set(candidate.notionId, list);
  }
  const notions = [...byNotion.keys()];
  const studied = notions.filter((notionId) => isNotionStudied(progress.get(notionId)));
  if (studied.length === 0) return [];

  const seen = lastTimes(history, (entry) => entry.itemId);
  const practised = lastTimes(history, (entry) => entry.notionId);
  const weights = new Map(
    studied.map((notionId) => [
      notionId,
      weightOf(
        notionId,
        progress.get(notionId),
        recentErrors.get(notionId) ?? 0,
        practised.get(notionId),
        now,
      ),
    ]),
  );
  const taken = new Set<string>();
  const picks: ThemePick[] = [];
  while (picks.length < size && weights.size > 0) {
    // Never the same notion twice in a row when another one is left (interleaving).
    const previous = picks.at(-1)?.notionId;
    const ranked = [...weights.entries()].sort((a, b) => b[1] - a[1]);
    const [notionId] = ranked.find(([id]) => id !== previous) ?? ranked[0] ?? [];
    if (notionId === undefined) break;
    const item = nextItem(byNotion.get(notionId) ?? [], seen, taken);
    if (item === undefined) {
      weights.delete(notionId);
      continue;
    }
    taken.add(item.itemId);
    picks.push({ ...item, unstudied: false });
    weights.set(notionId, (weights.get(notionId) ?? 0) / 2);
  }

  const latest = [...history].sort((a, b) => b.at - a.at).slice(0, UNSTUDIED_EVERY - 1);
  const extra = unstudiedNotion(notions, progress);
  if (
    picks.length > UNSTUDIED_POSITION &&
    extra !== undefined &&
    !latest.some((entry) => entry.unstudied)
  ) {
    const item = nextItem(byNotion.get(extra) ?? [], seen, taken);
    if (item !== undefined) picks.splice(UNSTUDIED_POSITION, 1, { ...item, unstudied: true });
  }
  return picks;
}
