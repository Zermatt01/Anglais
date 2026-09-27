/**
 * Repair of segment positions returned by the model (AI-07, docs/ARCHITECTURE.md §6).
 *
 * The model's offsets are not trusted: the segment text is searched in the
 * learner's text, and the occurrence closest to the proposed start is kept. If
 * the segment cannot be found, the error is shown without highlighting.
 *
 * Offsets are UTF-16 code unit indexes, as used by JavaScript string methods.
 */

export interface TextRange {
  readonly start: number;
  readonly end: number;
}

const APOSTROPHE_LIKE = /[‘’‛ʼ`´]/g;
const DOUBLE_QUOTE_LIKE = /[“”„«»]/g;

/**
 * Replaces typographic apostrophes and quotes by their plain equivalents.
 * Every replacement is one code unit for one code unit, so offsets are kept.
 */
function unifyQuotes(text: string): string {
  return text.replace(APOSTROPHE_LIKE, "'").replace(DOUBLE_QUOTE_LIKE, '"');
}

function occurrences(text: string, segment: string): number[] {
  const starts: number[] = [];
  let index = text.indexOf(segment);
  while (index !== -1) {
    starts.push(index);
    index = text.indexOf(segment, index + 1);
  }
  return starts;
}

/**
 * Finds `segment` in `text`, exactly or up to typographic quotes, and returns
 * the occurrence closest to `proposedStart`, or `null` if it is absent.
 */
export function locateSegment(text: string, segment: string, proposedStart = 0): TextRange | null {
  if (segment.length === 0) return null;

  let starts = occurrences(text, segment);
  if (starts.length === 0) starts = occurrences(unifyQuotes(text), unifyQuotes(segment));
  if (starts.length === 0) return null;

  let best = starts[0] ?? 0;
  for (const start of starts) {
    if (Math.abs(start - proposedStart) < Math.abs(best - proposedStart)) best = start;
  }
  return { start: best, end: best + segment.length };
}
