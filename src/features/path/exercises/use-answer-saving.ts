import { useState } from 'react';
import type { ExerciseAnswer, SaveAnswer } from './types.ts';

export type AnswerSaving =
  | { readonly state: 'idle' | 'saved' }
  | { readonly state: 'saving' | 'failed'; readonly answer: ExerciseAnswer };

/**
 * The result of an answer is shown only once the answer is stored: an answer
 * shown as checked is never lost, even if the app is closed right after
 * (NO-06). A failed write keeps the answer, to try again.
 */
export function useAnswerSaving(save: SaveAnswer) {
  const [saving, setSaving] = useState<AnswerSaving>({ state: 'idle' });

  const submit = (answer: ExerciseAnswer) => {
    setSaving({ state: 'saving', answer });
    save(answer).then(
      () => {
        setSaving({ state: 'saved' });
      },
      () => {
        setSaving({ state: 'failed', answer });
      },
    );
  };

  const retry = () => {
    if (saving.state === 'failed') submit(saving.answer);
  };

  return { saving, submit, retry };
}
