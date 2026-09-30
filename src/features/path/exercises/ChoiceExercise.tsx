import { useState } from 'react';
import { isChoiceCorrect, type ExerciseOf } from '../../../domain/curriculum/exercise.ts';
import { Button } from '../../../ui/Button.tsx';
import { OptionGroup } from '../../../ui/OptionGroup.tsx';
import { RichText } from '../../../ui/RichText.tsx';
import { shuffled } from '../shuffle.ts';
import { Feedback } from './Feedback.tsx';
import { SentenceWithGap } from './SentenceWithGap.tsx';
import type { ExerciseAnswer } from './types.ts';

interface ChoiceExerciseProps {
  readonly exercise: ExerciseOf<'choice-with-reason'>;
  /** Seed of the order of the options: changes each time the exercise comes back. */
  readonly seed: string;
  readonly onAnswered: (answer: ExerciseAnswer) => void;
}

/** Step 2: choose the form, then the reason; both must be right (PEDAGOGY §3.3). */
export function ChoiceExercise({ exercise, seed, onAnswered }: ChoiceExerciseProps) {
  const [form, setForm] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);

  const options = shuffled(exercise.options, `${seed}:options`);
  const reasons = shuffled(exercise.reasons, `${seed}:reasons`);
  const done = checked !== null;

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
        disabled={done}
        {...(done ? { correct: exercise.answer } : {})}
      />
      {form === null ? null : (
        <OptionGroup
          legend="2. Choisis la raison"
          options={reasons.map((entry) => ({ value: entry, label: <RichText text={entry} /> }))}
          value={reason}
          onChange={setReason}
          disabled={done}
          {...(done ? { correct: exercise.reason } : {})}
        />
      )}
      {done ? (
        <Feedback
          verdict={checked ? 'correct' : 'incorrect'}
          expected={checked ? null : exercise.answer}
          explanation={exercise.explanation}
        />
      ) : (
        <div className="button-row">
          <Button
            disabled={form === null || reason === null}
            onClick={() => {
              if (form === null || reason === null) return;
              const correct = isChoiceCorrect(exercise, form, reason);
              setChecked(correct);
              onAnswered({
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
