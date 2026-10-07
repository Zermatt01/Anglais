/**
 * The learner's text cut into pieces for display (UI-02): the error segments,
 * underlined by severity, and the unnatural phrases, dotted. A mark that
 * overlaps an earlier one is left out of the text (it stays in the list).
 */
import type { TextRange } from '../correction/segments.ts';

export interface Mark<Kind extends string> {
  readonly range: TextRange;
  readonly kind: Kind;
  /** Which error or phrase it is, for its label. */
  readonly key: number;
}

export interface TextPiece<Kind extends string> {
  readonly text: string;
  readonly mark: Mark<Kind> | null;
}

export function markedPieces<Kind extends string>(
  text: string,
  marks: readonly Mark<Kind>[],
): TextPiece<Kind>[] {
  const sorted = [...marks]
    .filter(({ range }) => range.start < range.end && range.end <= text.length)
    .sort((a, b) => a.range.start - b.range.start || b.range.end - a.range.end);
  const pieces: TextPiece<Kind>[] = [];
  let position = 0;
  for (const mark of sorted) {
    if (mark.range.start < position) continue;
    if (mark.range.start > position) {
      pieces.push({ text: text.slice(position, mark.range.start), mark: null });
    }
    pieces.push({ text: text.slice(mark.range.start, mark.range.end), mark });
    position = mark.range.end;
  }
  if (position < text.length) pieces.push({ text: text.slice(position), mark: null });
  return pieces;
}
