import type { TextRange } from '../../domain/correction/segments.ts';
import { markedPieces } from '../../domain/production/marks.ts';
import type { Severity } from '../../domain/taxonomy.ts';

export type MarkKind = Severity | 'unnatural';

export interface TextMark {
  readonly range: TextRange;
  readonly kind: MarkKind;
  /** Number shown after the mark, the same as in the list below the text. */
  readonly number: number;
}

/**
 * The learner's text with its marks (UI-02): errors underlined by severity,
 * unnatural phrases dotted. Each mark carries its number: colour is never the
 * only information (UI-04).
 */
export function MarkedText({
  text,
  marks,
}: {
  readonly text: string;
  readonly marks: readonly TextMark[];
}) {
  const pieces = markedPieces(
    text,
    marks.map((mark) => ({ range: mark.range, kind: mark.kind, key: mark.number })),
  );
  return (
    <p className="marked-text" lang="en">
      {pieces.map((piece, index) =>
        piece.mark === null ? (
          <span key={index}>{piece.text}</span>
        ) : (
          <span key={index}>
            <span className={`mark mark--${piece.mark.kind}`}>{piece.text}</span>
            <sup className="marked-text__number">{piece.mark.key}</sup>
          </span>
        ),
      )}
    </p>
  );
}
