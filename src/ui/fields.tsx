import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

export interface Choice<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
}

interface ChoiceGroupProps<T extends string> {
  readonly legend: string;
  readonly value: T;
  readonly choices: readonly Choice<T>[];
  readonly onChange: (value: T) => void;
  readonly disabled?: boolean;
}

/** Radio buttons in a fieldset. */
export function ChoiceGroup<T extends string>({
  legend,
  value,
  choices,
  onChange,
  disabled = false,
}: ChoiceGroupProps<T>) {
  const name = useId();
  return (
    <fieldset className="field" disabled={disabled}>
      <legend className="field__label">{legend}</legend>
      {choices.map((choice) => (
        <label key={choice.value} className="choice">
          <input
            type="radio"
            name={name}
            value={choice.value}
            checked={choice.value === value}
            onChange={() => {
              onChange(choice.value);
            }}
          />
          <span className="choice__text">
            <span>{choice.label}</span>
            {choice.description === undefined ? null : (
              <span className="choice__description">{choice.description}</span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

interface CheckboxGroupProps<T extends string> {
  readonly legend: string;
  readonly hint?: string;
  readonly values: readonly T[];
  readonly choices: readonly Choice<T>[];
  readonly onChange: (values: T[]) => void;
}

/** Checkboxes in a fieldset; the selected values keep the order of the choices. */
export function CheckboxGroup<T extends string>({
  legend,
  hint,
  values,
  choices,
  onChange,
}: CheckboxGroupProps<T>) {
  const hintId = useId();
  return (
    <fieldset className="field" aria-describedby={hint === undefined ? undefined : hintId}>
      <legend className="field__label">{legend}</legend>
      {hint === undefined ? null : (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {choices.map((choice) => (
        <label key={choice.value} className="choice">
          <input
            type="checkbox"
            checked={values.includes(choice.value)}
            onChange={(event) => {
              const checked = event.currentTarget.checked;
              onChange(
                choices
                  .map((option) => option.value)
                  .filter((option) =>
                    option === choice.value ? checked : values.includes(option),
                  ),
              );
            }}
          />
          <span>{choice.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

interface SelectFieldProps {
  readonly label: string;
  readonly hint?: string;
  readonly value: number;
  readonly options: readonly { readonly value: number; readonly label: string }[];
  readonly onChange: (value: number) => void;
}

/** Drop-down list of numeric values. A current value missing from the options is still shown. */
export function SelectField({ label, hint, value, options, onChange }: SelectFieldProps) {
  const id = useId();
  const hintId = useId();
  const allOptions = options.some((option) => option.value === value)
    ? options
    : [...options, { value, label: String(value) }].sort((a, b) => a.value - b.value);
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint === undefined ? null : (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <select
        id={id}
        className="field__control"
        value={value}
        aria-describedby={hint === undefined ? undefined : hintId}
        onChange={(event) => {
          onChange(Number(event.currentTarget.value));
        }}
      >
        {allOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SwitchFieldProps {
  readonly label: string;
  readonly description?: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

/** On/off setting, announced as a switch. */
export function SwitchField({ label, description, checked, onChange }: SwitchFieldProps) {
  const descriptionId = useId();
  return (
    <div className="field">
      <label className="switch">
        <span className="choice__text">
          <span className="field__label">{label}</span>
          {description === undefined ? null : (
            <span id={descriptionId} className="choice__description">
              {description}
            </span>
          )}
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          aria-describedby={description === undefined ? undefined : descriptionId}
          onChange={(event) => {
            onChange(event.currentTarget.checked);
          }}
        />
      </label>
    </div>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  readonly label: string;
  readonly hint?: string;
  /** Live status under the field, such as "Brouillon enregistré". */
  readonly status?: ReactNode;
}

export function TextAreaField({ label, hint, status, ...props }: TextAreaFieldProps) {
  const id = useId();
  const hintId = useId();
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint === undefined ? null : (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        className="field__control"
        aria-describedby={hint === undefined ? undefined : hintId}
        {...props}
      />
      <p className="status-line" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  readonly label: string;
  readonly hint?: string;
}

/** Single-line text input, with its label and an optional hint. */
export function TextField({ label, hint, ...props }: TextFieldProps) {
  const id = useId();
  const hintId = useId();
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint === undefined ? null : (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <input
        id={id}
        className="field__control"
        aria-describedby={hint === undefined ? undefined : hintId}
        {...props}
      />
    </div>
  );
}

interface TextSelectFieldProps<T extends string> {
  readonly label: string;
  readonly hint?: string;
  readonly value: T;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly onChange: (value: T) => void;
}

/** Drop-down list of text values; a current value missing from the options is still shown. */
export function TextSelectField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: TextSelectFieldProps<T>) {
  const id = useId();
  const hintId = useId();
  const allOptions = options.some((option) => option.value === value)
    ? options
    : [...options, { value, label: value }];
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint === undefined ? null : (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <select
        id={id}
        className="field__control"
        value={value}
        aria-describedby={hint === undefined ? undefined : hintId}
        onChange={(event) => {
          const selected = allOptions.find((option) => option.value === event.currentTarget.value);
          if (selected !== undefined) onChange(selected.value);
        }}
      >
        {allOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
