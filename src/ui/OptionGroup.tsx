import { useId, type ReactNode } from 'react';

export interface Option {
  readonly value: string;
  readonly label: ReactNode;
  /** `en` for English options: shown in the English font, read in English. */
  readonly lang?: 'en' | 'fr';
}

interface OptionGroupProps {
  readonly legend: ReactNode;
  readonly options: readonly Option[];
  readonly value: string | null;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  /** After checking: the right option, marked as such (and the chosen one if wrong). */
  readonly correct?: string;
}

/**
 * One choice among a few options, as large touch targets (UI-01). Native radio
 * buttons, so that the keyboard and screen readers work as usual (UI-04).
 * Correctness is also said in words, never by colour alone.
 */
export function OptionGroup({
  legend,
  options,
  value,
  onChange,
  disabled = false,
  correct,
}: OptionGroupProps) {
  const name = useId();
  return (
    <fieldset className="option-group" disabled={disabled}>
      <legend className="field__label">{legend}</legend>
      {options.map((option) => {
        const checked = option.value === value;
        const status =
          correct === undefined
            ? null
            : option.value === correct
              ? 'correct'
              : checked
                ? 'wrong'
                : null;
        const classes = [
          'option',
          checked ? 'option--selected' : '',
          status === null ? '' : `option--${status}`,
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <label key={option.value} className={classes}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => {
                onChange(option.value);
              }}
            />
            <span lang={option.lang}>{option.label}</span>
            {status === 'correct' ? <span className="option__status">bonne réponse</span> : null}
            {status === 'wrong' ? <span className="option__status">ton choix</span> : null}
          </label>
        );
      })}
    </fieldset>
  );
}
