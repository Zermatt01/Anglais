/**
 * Order in which the options of a question are shown. In the content, the
 * right answer is often written first: the order is mixed, deterministically
 * (the same seed gives the same order, so a re-render never reorders).
 */

/** FNV-1a hash of a string, as an unsigned 32-bit integer. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value;
}

/** A copy of `items` in an order that depends only on `seed`. */
export function shuffled<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  let state = hash(seed) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    // xorshift32: small, deterministic, good enough to mix a few options.
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const other = state % (index + 1);
    const current = result[index];
    const swapped = result[other];
    if (current === undefined || swapped === undefined) continue;
    result[index] = swapped;
    result[other] = current;
  }
  return result;
}
