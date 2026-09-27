/**
 * Zod schemas for the primitive values shared by every model
 * (docs/ARCHITECTURE.md §4.1).
 */
import { z } from 'zod';

/** Milliseconds since the Unix epoch. */
export const epochMsSchema = z.int().nonnegative();

/** Identifier generated on the device (`crypto.randomUUID()`). */
export const uuidSchema = z.uuid();

/** Local calendar day of the device, `YYYY-MM-DD`. */
export const daySchema = z.iso.date();

/**
 * Text containing at least one visible character. It is validated, never
 * trimmed: parsing a stored document must not change it.
 */
export const visibleTextSchema = z.string().regex(/\S/, 'must contain visible text');

/** Current time source, injected so that domain logic stays deterministic. */
export interface Clock {
  now(): number;
}

/**
 * Next `updatedAt` of a document: strictly greater than the previous one, even
 * if the device clock went backwards (docs/ARCHITECTURE.md §4.1, D-015).
 */
export function nextUpdatedAt(previous: number | null, now: number): number {
  return previous === null ? now : Math.max(now, previous + 1);
}
