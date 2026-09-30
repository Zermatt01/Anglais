interface ProgressBarProps {
  /** From 0 to 1. */
  readonly value: number;
  readonly label: string;
}

/** Progress shown as a bar and in words (MOD-04). */
export function ProgressBar({ value, label }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div className="progress">
      <progress className="progress__bar" max={100} value={percent} aria-label={label} />
      <span className="progress__text">{`${String(percent)} %`}</span>
    </div>
  );
}
