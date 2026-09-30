import { useState } from 'react';
import {
  acceptedAnswersOf,
  evaluateTypedAnswer,
  type Exercise,
} from '../../../domain/curriculum/exercise.ts';
import { Button } from '../../../ui/Button.tsx';
import { TextAreaField, TextField } from '../../../ui/fields.tsx';
import { Notice } from '../../../ui/Notice.tsx';
import { RichText } from '../../../ui/RichText.tsx';
import { useDraft } from '../../drafts/use-draft.ts';
import { Feedback } from './Feedback.tsx';
import { SentenceWithGap } from './SentenceWithGap.tsx';
import type { ExerciseAnswer } from './types.ts';

type TypedExercise = Exclude<Exercise, { kind: 'choice-with-reason' }>;

const MAX_ANSWER_LENGTH = 500;

interface TypedExerciseProps {
  readonly exercise: TypedExercise;
  /** Where the draft of the answer is kept (UI-03). */
  readonly draftKey: string;
  readonly onAnswered: (answer: ExerciseAnswer) => void;
}

type Phase =
  | { readonly name: 'answering' }
  /** The answer matches no expected answer: the learner compares (never "wrong", NO-05). */
  | { readonly name: 'comparing'; readonly answer: string }
  | {
      readonly name: 'done';
      readonly answer: string;
      readonly correct: boolean;
      readonly matched: string | null;
      readonly selfAssessed: boolean;
    };

function Prompt({ exercise }: { readonly exercise: TypedExercise }) {
  switch (exercise.kind) {
    case 'fill-verb':
      return (
        <>
          <SentenceWithGap sentence={exercise.sentence} />
          <p>
            Verbe : <span lang="en">{exercise.verb}</span>
          </p>
          <p className="muted">
            <RichText text={exercise.meaningFr} />
          </p>
        </>
      );
    case 'transform':
      return (
        <>
          <p className="exercise__sentence" lang="en">
            {exercise.source}
          </p>
          <p>
            <RichText text={exercise.instructionFr} />
          </p>
        </>
      );
    case 'place-word':
      return (
        <>
          <p>
            Place le mot <strong lang="en">{exercise.word}</strong> dans la phrase.
          </p>
          <p className="muted">
            <RichText text={exercise.meaningFr} />
          </p>
        </>
      );
    case 'translate':
      return (
        <p className="exercise__sentence">
          <RichText text={exercise.sentenceFr} />
        </p>
      );
  }
}

const FIELD_LABELS: Readonly<Record<TypedExercise['kind'], string>> = {
  'fill-verb': 'Ce qui manque',
  transform: 'Ta phrase',
  'place-word': 'La phrase avec le mot',
  translate: 'Ta traduction',
};

/** Steps 3 and 4: the answer is typed, then graded locally (CUR-05). */
export function TypedExercise({ exercise, draftKey, onAnswered }: TypedExerciseProps) {
  const initial = exercise.kind === 'place-word' ? exercise.sentence : '';
  const draft = useDraft(draftKey, initial);
  const [phase, setPhase] = useState<Phase>({ name: 'answering' });
  const [hintShown, setHintShown] = useState(false);
  const [empty, setEmpty] = useState(false);
  const accepted = acceptedAnswersOf(exercise);
  const canonical = accepted[0] ?? '';

  function finish(answer: string, correct: boolean, matched: string | null, selfAssessed: boolean) {
    setPhase({ name: 'done', answer, correct, matched, selfAssessed });
    void draft.discard(answer);
    onAnswered({
      answer,
      result: correct ? 'correct' : 'incorrect',
      grader: selfAssessed ? 'user' : 'local',
      hintUsed: hintShown,
    });
  }

  function check() {
    const answer = draft.text.trim();
    if (answer === '' || answer === initial.trim()) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    const evaluation = evaluateTypedAnswer(exercise, answer);
    if (evaluation.verdict === 'unknown') {
      setPhase({ name: 'comparing', answer });
      return;
    }
    finish(answer, evaluation.verdict === 'correct', evaluation.matched, false);
  }

  const field = {
    label: FIELD_LABELS[exercise.kind],
    value: draft.text,
    disabled: !draft.ready || phase.name !== 'answering',
    lang: 'en',
    spellCheck: false,
    autoComplete: 'off',
    // Stored with the answer (exerciseAttempts): far above any expected answer.
    maxLength: MAX_ANSWER_LENGTH,
    onChange: (event: { currentTarget: { value: string } }) => {
      setEmpty(false);
      draft.setText(event.currentTarget.value);
    },
  };

  return (
    <div className="exercise">
      <Prompt exercise={exercise} />
      {exercise.kind === 'translate' ? (
        <TextAreaField {...field} rows={3} />
      ) : (
        <TextField {...field} />
      )}
      {draft.unreadable ? (
        <Notice tone="error" title="Ancien brouillon illisible">
          <p>Il est conservé à part et reste inclus dans l’export de tes données.</p>
        </Notice>
      ) : null}
      {empty ? (
        <Notice tone="error" title="Réponse vide">
          <p>Écris ta réponse avant de vérifier.</p>
        </Notice>
      ) : null}
      {exercise.kind === 'translate' && hintShown ? (
        <Notice title="Indice">
          <p>
            <RichText text={exercise.hint} />
          </p>
        </Notice>
      ) : null}

      {phase.name === 'answering' ? (
        <div className="button-row">
          <Button onClick={check} disabled={!draft.ready}>
            Vérifier
          </Button>
          {exercise.kind === 'translate' && !hintShown ? (
            <Button
              variant="secondary"
              onClick={() => {
                setHintShown(true);
              }}
            >
              Voir un indice
            </Button>
          ) : null}
        </div>
      ) : null}

      {phase.name === 'comparing' ? (
        <div className="feedback feedback--compare" role="status">
          <p className="feedback__title">Réponse non prévue</p>
          <p>
            Ta réponse ne figure pas parmi les réponses prévues, ce qui ne veut pas dire qu’elle est
            fausse. Compare-la avec la réponse de référence :
          </p>
          <p lang="en" className="feedback__answer">
            {canonical}
          </p>
          <p>Ta réponse dit-elle la même chose, avec la forme travaillée ici, sans autre faute ?</p>
          <div className="button-row">
            <Button
              onClick={() => {
                finish(phase.answer, true, null, true);
              }}
            >
              Oui, ma réponse est juste
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                finish(phase.answer, false, null, true);
              }}
            >
              Non, ma réponse est à revoir
            </Button>
          </div>
        </div>
      ) : null}

      {phase.name === 'done' ? (
        <Feedback
          verdict={phase.correct ? 'correct' : 'incorrect'}
          expected={
            phase.correct && (phase.selfAssessed || phase.matched === canonical) ? null : canonical
          }
          explanation={exercise.explanation}
          selfAssessed={phase.selfAssessed}
        />
      ) : null}
    </div>
  );
}
