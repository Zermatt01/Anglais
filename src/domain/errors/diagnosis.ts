/**
 * Slip or gap (PED-03, docs/PEDAGOGY.md §4, Corder): how an error on a notion
 * is treated depends on whether the notion is studied, and on how often it
 * was missed in the last seven days.
 *
 * - Notion not studied yet (not started, or steps 1 to 3): "unstudied"; its
 *   card is created suspended until the notion reaches step 4 (D-025).
 * - Studied notion, fewer than two productions with a qualifying error on it
 *   in seven days (this one included): "lapsus", an active card.
 * - Studied notion, at least two: "lacune"; a notion to consolidate or
 *   acquired goes back to step 3 (`regressAfterLacuna`).
 *
 * The errors of one production on one notion count as one occurrence, and
 * only qualifying errors count (D-024): a false positive never sends the
 * learner back.
 */
export const LACUNA_RULE = { windowMs: 7 * 24 * 60 * 60 * 1000, minProductions: 2 } as const;

export type Diagnosis = 'lapsus' | 'lacune' | 'unstudied';

/** A past production with a qualifying error on the notion. */
export interface QualifyingOccurrence {
  readonly productionId: string;
  readonly at: number;
}

export function diagnoseNotion({
  studied,
  productionId,
  qualifiesNow,
  past,
  now,
}: {
  readonly studied: boolean;
  readonly productionId: string;
  /** This production has a qualifying error on the notion. */
  readonly qualifiesNow: boolean;
  readonly past: readonly QualifyingOccurrence[];
  readonly now: number;
}): Diagnosis {
  if (!studied) return 'unstudied';
  if (!qualifiesNow) return 'lapsus';
  const productions = new Set(
    past
      .filter(
        (occurrence) =>
          occurrence.productionId !== productionId &&
          occurrence.at > now - LACUNA_RULE.windowMs &&
          occurrence.at <= now,
      )
      .map((occurrence) => occurrence.productionId),
  );
  return productions.size + 1 >= LACUNA_RULE.minProductions ? 'lacune' : 'lapsus';
}
