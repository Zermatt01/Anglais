/**
 * The three tiers of the Thème instruction (PED-02, docs/PEDAGOGY.md §9.1):
 * 1. translate a French sentence; 2. express a situation described in
 * French; 3. follow an instruction entirely in English.
 *
 * The tier follows the written level (tier 1 up to A2+, 2 from B1, 3 from
 * B2), and the calibration of §6.2 moves it by one tier at most: after each
 * block of 20 answers, a success rate above 85 % raises it, below 75 % lowers
 * it. Until the level is estimated (phase 5), the base tier is 1 (D-084).
 */
export type ThemeTier = 1 | 2 | 3;

export const TIER_CALIBRATION = { block: 20, raiseAbove: 0.85, lowerBelow: 0.75 } as const;

/** Base tier of a written level on the numeric scale (A1 = 1 … C2 = 6), or 1 without one. */
export function baseTier(level: number | null): ThemeTier {
  if (level === null || level < 3) return 1;
  return level < 4 ? 2 : 3;
}

/**
 * Shift from the base tier, after every full block of answers, oldest first:
 * it moves by one step per block and stays between -1 and +1.
 */
export function calibrationShift(successes: readonly boolean[]): -1 | 0 | 1 {
  let shift: -1 | 0 | 1 = 0;
  const { block, raiseAbove, lowerBelow } = TIER_CALIBRATION;
  for (let start = 0; start + block <= successes.length; start += block) {
    const rate = successes.slice(start, start + block).filter(Boolean).length / block;
    if (rate > raiseAbove && shift < 1) shift = shift === -1 ? 0 : 1;
    else if (rate < lowerBelow && shift > -1) shift = shift === 1 ? 0 : -1;
  }
  return shift;
}

/** The tier proposed for the next series. */
export function recommendedTier(level: number | null, successes: readonly boolean[]): ThemeTier {
  const tier = baseTier(level) + calibrationShift(successes);
  return tier <= 1 ? 1 : tier >= 3 ? 3 : 2;
}
