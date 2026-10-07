/**
 * Immediate practice after an error (PED-07, docs/PEDAGOGY.md §5.2): two or
 * three controlled exercises of step 3 of the notion, then one new sentence
 * of step 4, before going back. The exercises not seen recently come first;
 * generated exercises follow the core in the pools.
 */
import { pickNextExercise, type SeenExercise } from './engine.ts';

export const IMMEDIATE_PRACTICE = { controlled: 3, translations: 1 } as const;

/** `count` distinct exercises of a pool, each the next one `pickNextExercise` would choose. */
export function pickSeveral(
  poolIds: readonly string[],
  seen: readonly SeenExercise[],
  count: number,
  now: number,
): string[] {
  const picked: string[] = [];
  const history = [...seen];
  while (picked.length < Math.min(count, poolIds.length)) {
    const next = pickNextExercise(
      poolIds.filter((id) => !picked.includes(id)),
      history,
    );
    if (next === null) break;
    picked.push(next);
    history.push({ exerciseId: next, at: now });
  }
  return picked;
}

/** Identifiers of an immediate practice: the controlled exercises, then the translation. */
export function immediatePractice(
  controlledIds: readonly string[],
  translationIds: readonly string[],
  seen: readonly SeenExercise[],
  now: number,
): string[] {
  return [
    ...pickSeveral(controlledIds, seen, IMMEDIATE_PRACTICE.controlled, now),
    ...pickSeveral(translationIds, seen, IMMEDIATE_PRACTICE.translations, now),
  ];
}
