import { useState } from 'react';
import { isChoiceCorrect, type ExerciseOf } from '../../../domain/curriculum/exercise.ts';
import { Button } from '../../../ui/Button.tsx';
import { OptionGroup } from '../../../ui/OptionGroup.tsx';
import { RichText } from '../../../ui/RichText.tsx';
import { shuffled } from '../shuffle.ts';
import { Feedback } from './Feedback.tsx';
import { SavingStatus } from './SavingStatus.tsx';
import { SentenceWithGap } from './SentenceWithGap.tsx';
import type { SaveAnswer } from './types.ts';
import { useAnswerSaving } from './use-answer-saving.ts';

interface ChoiceExerciseProps {
  readonly exercise: ExerciseOf<'choice-with-reason'>;
  /** Seed of the order of the options: changes each time the exercise comes back. */
  readonly seed: string;
  /** Stores the answer; its result is shown once it is stored. */
  readonly onAnswered: SaveAnswer;
}

/** Step 2: choose the form, then the reason; both must be right (PEDAGOGY §3.3). */
export function ChoiceExercise({ exercise, seed, onAnswered }: ChoiceExerciseProps) {
  const [form, setForm] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const { saving, submit, retry } = useAnswerSaving(onAnswered);

  const options = shuffled(exercise.options, `${seed}:options`);
  const reasons = shuffled(exercise.reasons, `${seed}:reasons`);
  const locked = checked !== null;
  const done = locked && saving.state === 'saved';

  return (
    <div className="exercise">
      {exercise.contextFr === undefined ? null : (
        <p className="muted">
          <RichText text={exercise.contextFr} />
        </p>
      )}
      <SentenceWithGap sentence={exercise.sentence} />
      <OptionGroup
        legend="1. Choisis la forme"
        options={options.map((option) => ({ value: option, label: option, lang: 'en' }))}
        value={form}
        onChange={setForm}
        disabled={locked}
        {...(done ? { correct: exercise.answer } : {})}
      />
      {form === null ? null : (
        <OptionGroup
          legend="2. Choisis la raison"
          options={reasons.map((entry) => ({ value: entry, label: <RichText text={entry} /> }))}
          value={reason}
          onChange={setReason}
          disabled={locked}
          {...(done ? { correct: exercise.reason } : {})}
        />
      )}
      <SavingStatus saving={saving} onRetry={retry} />
      {done ? (
        <Feedback
          verdict={checked ? 'correct' : 'incorrect'}
          expected={checked ? null : exercise.answer}
          explanation={exercise.explanation}
        />
      ) : locked ? null : (
        <div className="button-row">
          <Button
            disabled={form === null || reason === null}
            onClick={() => {
              if (form === null || reason === null) return;
              const correct = isChoiceCorrect(exercise, form, reason);
              setChecked(correct);
              submit({
                answer: `${form} — ${reason}`,
                result: correct ? 'correct' : 'incorrect',
                grader: 'local',
                hintUsed: false,
              });
            }}
          >
            Vérifier
          </Button>
        </div>
      )}
    </div>
  );
}
