/**
 * Timeline of a tense (CUR-03), drawn in SVG. Positions go from -4 (past) to 4
 * (future); 0 is now. The drawing is described in words for screen readers.
 * Colours come from classes (components.css): the CSP forbids inline styles.
 */

export type TimelineMark =
  | { readonly type: 'point'; readonly at: number; readonly label: string }
  | {
      readonly type: 'span' | 'repeat';
      readonly from: number;
      readonly to: number;
      readonly label: string;
    };

export interface TimelineProps {
  readonly descriptionFr: string;
  readonly marks: readonly TimelineMark[];
}

const WIDTH = 320;
const LEFT = 24;
const RIGHT = WIDTH - 24;
const ROW = 36;
const TOP = 8;
/** Distance between the dots of a repeated action. */
const REPEAT_STEP = 0.8;

const x = (position: number) => LEFT + ((position + 4) / 8) * (RIGHT - LEFT);

/** Keeps a label inside the drawing: anchored at its start or end near the edges. */
function labelPlacement(center: number): { x: number; anchor: 'start' | 'middle' | 'end' } {
  if (center < 100) return { x: Math.max(center - 8, 4), anchor: 'start' };
  if (center > WIDTH - 100) return { x: Math.min(center + 8, WIDTH - 4), anchor: 'end' };
  return { x: center, anchor: 'middle' };
}

function Mark({ mark, y, axisY }: { mark: TimelineMark; y: number; axisY: number }) {
  const center = mark.type === 'point' ? x(mark.at) : (x(mark.from) + x(mark.to)) / 2;
  const label = labelPlacement(center);
  const text = (
    <text
      className="timeline__label"
      x={label.x}
      y={y - 11}
      textAnchor={label.anchor}
      fontSize="12"
      lang="en"
    >
      {mark.label}
    </text>
  );
  switch (mark.type) {
    case 'point':
      return (
        <g>
          <line
            className="timeline__guide"
            x1={x(mark.at)}
            x2={x(mark.at)}
            y1={y}
            y2={axisY}
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <circle className="timeline__mark" cx={x(mark.at)} cy={y} r="6" />
          {text}
        </g>
      );
    case 'span':
      return (
        <g>
          <line
            className="timeline__span"
            x1={x(mark.from)}
            x2={x(mark.to)}
            y1={y}
            y2={y}
            strokeWidth="7"
            strokeLinecap="round"
          />
          {text}
        </g>
      );
    case 'repeat': {
      const count = Math.max(2, Math.floor((mark.to - mark.from) / REPEAT_STEP) + 1);
      const step = (mark.to - mark.from) / (count - 1);
      return (
        <g>
          {Array.from({ length: count }, (_, index) => (
            <circle
              key={index}
              className="timeline__mark"
              cx={x(mark.from + index * step)}
              cy={y}
              r="4"
            />
          ))}
          {text}
        </g>
      );
    }
  }
}

export function Timeline({ descriptionFr, marks }: TimelineProps) {
  const axisY = TOP + marks.length * ROW + 12;
  const height = axisY + 34;
  return (
    <figure className="timeline">
      <svg
        className="timeline__drawing"
        viewBox={`0 0 ${String(WIDTH)} ${String(height)}`}
        role="img"
        aria-label={descriptionFr}
      >
        <line
          className="timeline__now"
          x1={x(0)}
          x2={x(0)}
          y1={TOP}
          y2={axisY + 6}
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <line
          className="timeline__axis"
          x1={LEFT}
          x2={RIGHT}
          y1={axisY}
          y2={axisY}
          strokeWidth="2"
        />
        <polygon
          className="timeline__arrow"
          points={`${String(RIGHT + 8)},${String(axisY)} ${String(RIGHT)},${String(axisY - 5)} ${String(RIGHT)},${String(axisY + 5)}`}
        />
        {marks.map((mark, index) => (
          <Mark key={index} mark={mark} y={TOP + index * ROW + 26} axisY={axisY} />
        ))}
        <text className="timeline__caption" x={LEFT} y={axisY + 22} fontSize="12">
          passé
        </text>
        <text
          className="timeline__caption timeline__caption--now"
          x={x(0)}
          y={axisY + 22}
          textAnchor="middle"
          fontSize="12"
        >
          maintenant
        </text>
        <text className="timeline__caption" x={RIGHT} y={axisY + 22} textAnchor="end" fontSize="12">
          futur
        </text>
      </svg>
    </figure>
  );
}
