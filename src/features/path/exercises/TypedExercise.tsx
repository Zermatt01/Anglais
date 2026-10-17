import { useState, type ReactNode } from 'react';
import {
  acceptedAnswersOf,
  anticipatedErrorOf,
  evaluateTypedAnswer,
  type Exercise,
} from '../../../domain/curriculum/exercise.ts';
import { showsNotionAsReference, type NotionUse } from '../../../domain/production/notion-use.ts';
import { Button } from '../../../ui/Button.tsx';
import { TextAreaField, TextField } from '../../../ui/fields.tsx';
import { Notice } from '../../../ui/Notice.tsx';
import { RichText } from '../../../ui/RichText.tsx';
import type { AnswerResult } from '../../../domain/taxonomy.ts';
import { CorrectionView } from '../../correction/CorrectionView.tsx';
import { useDraft } from '../../drafts/use-draft.ts';
import { Feedback } from './Feedback.tsx';
import { SavingStatus } from './SavingStatus.tsx';
import { SentenceWithGap } from './SentenceWithGap.tsx';
import type { SaveAnswer } from './types.ts';
import { useAnswerSaving } from './use-answer-saving.ts';

type TypedExercise = Exclude<Exercise, { kind: 'choice-with-reason' }>;

const MAX_ANSWER_LENGTH = 500;

/** What a check of an unexpected translation by the model needs (D-076, D-083). */
export interface AiCheckProps {
  readonly answer: string;
  readonly hintUsed: boolean;
  /** Saves the pending typing first, so that no late save brings the draft back. */
  readonly prepare: () => Promise<void>;
  /** The answer is stored with its correction, the draft removed in the same transaction. */
  readonly onChecked: (result: AnswerResult, productionId: string) => void;
}

interface TypedExerciseProps {
  readonly exercise: TypedExercise;
  /** Where the draft of the answer is kept (UI-03); removed with the answer when stored. */
  readonly draftKey: string;
  /** Stores the answer; its result is shown once it is stored. */
  readonly onAnswered: SaveAnswer;
  /** For a translation: asking the model, offered next to the comparison (on request only). */
  readonly aiCheck?: ((props: AiCheckProps) => ReactNode) | undefined;
  /** For a translation: the constructions that prove the use of the notion (D-094). */
  readonly notionUse?: NotionUse | null;
}

type Phase =
  | { readonly name: 'answering' }
  /**
   * The answer matches no expected answer: the learner compares (never "wrong",
   * NO-05). `proven`: the app finds the notion in it as in a reviewed answer (D-094).
   */
  | { readonly name: 'comparing'; readonly answer: string; readonly proven: boolean }
  | {
      readonly name: 'done';
      readonly answer: string;
      readonly result: AnswerResult;
      readonly matched: string | null;
      readonly selfAssessed: boolean;
    }
  /** Graded by the model, and already stored with its correction. */
  | {
      readonly name: 'checked';
      readonly answer: string;
      readonly result: AnswerResult;
      readonly productionId: string;
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

const verdictOf = (result: AnswerResult) =>
  result === 'acceptable' ? 'partial' : result === 'correct' ? 'correct' : 'incorrect';

/**
 * How the learner judges a translation that matches no expected answer
 * (D-094): the step is judged on the notion. When the app proves the notion,
 * only whether the rest is right is asked.
 */
function TranslationJudgment({
  proven,
  onJudged,
}: {
  readonly proven: boolean;
  readonly onJudged: (result: AnswerResult, selfAssessed: boolean) => void;
}) {
  return (
    <>
      <p>
        {proven
          ? 'Et le reste de ta phrase ?'
          : 'Ta réponse a-t-elle le même sens ? Et la forme travaillée ici est-elle bien employée ?'}
      </p>
      <div className="button-row">
        <Button
          onClick={() => {
            onJudged('correct', true);
          }}
        >
          Tout est juste
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            // Proven by the app: graded locally; otherwise, the learner's judgment.
            onJudged('acceptable', !proven);
          }}
        >
          Notion juste, autre faute
        </Button>
        {proven ? null : (
          <Button
            variant="secondary"
            onClick={() => {
              onJudged('incorrect', true);
            }}
          >
            Notion à revoir
          </Button>
        )}
      </div>
    </>
  );
}

/** Steps 3 and 4: the answer is typed, then graded locally (CUR-05). */
export function TypedExercise({
  exercise,
  draftKey,
  onAnswered,
  aiCheck,
  notionUse = null,
}: TypedExerciseProps) {
  const initial = exercise.kind === 'place-word' ? exercise.sentence : '';
  const draft = useDraft(draftKey, initial);
  const [phase, setPhase] = useState<Phase>({ name: 'answering' });
  const [hintShown, setHintShown] = useState(false);
  const [empty, setEmpty] = useState(false);
  // The draft is removed in the transaction that stores the answer (NO-06): the
  // pending typing is saved first, so that no late save can bring it back.
  const { saving, submit, retry } = useAnswerSaving(async (answer) => {
    await draft.flush();
    await onAnswered(answer);
    draft.reset(answer.answer);
  });
  const accepted = acceptedAnswersOf(exercise);
  const canonical = accepted[0] ?? '';

  function finish(
    answer: string,
    result: AnswerResult,
    matched: string | null,
    selfAssessed: boolean,
  ) {
    setPhase({ name: 'done', answer, result, matched, selfAssessed });
    submit({ answer, result, grader: selfAssessed ? 'user' : 'local', hintUsed: hintShown });
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
      const proven =
        exercise.kind === 'translate' &&
        notionUse !== null &&
        showsNotionAsReference(answer, exercise.accepted, notionUse);
      setPhase({ name: 'comparing', answer, proven });
      return;
    }
    // An anticipated error off the notion is corrected, but the notion is right (D-093, D-094).
    const offNotion =
      exercise.kind === 'translate' && anticipatedErrorOf(exercise, answer)?.offNotion === true;
    finish(
      answer,
      evaluation.verdict === 'correct' ? 'correct' : offNotion ? 'acceptable' : 'incorrect',
      evaluation.matched,
      false,
    );
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
          <p className="feedback__title">
            {phase.proven ? 'La forme travaillée est juste' : 'Réponse non prévue'}
          </p>
          <p>
            {phase.proven
              ? 'Ta phrase est une réponse de référence, avec un adverbe placé ailleurs. Cette place ne compte pas pour la notion : l’app ne la juge pas.'
              : 'Ta réponse ne figure pas parmi les réponses prévues, ce qui ne veut pas dire qu’elle est fausse. Compare-la avec la réponse de référence :'}
          </p>
          <p lang="en" className="feedback__answer">
            {canonical}
          </p>
          {aiCheck === undefined
            ? null
            : aiCheck({
                answer: phase.answer,
                hintUsed: hintShown,
                prepare: () => draft.flush(),
                onChecked: (result, productionId) => {
                  draft.reset(phase.answer);
                  setPhase({ name: 'checked', answer: phase.answer, result, productionId });
                },
              })}
          {exercise.kind === 'translate' ? (
            <TranslationJudgment
              proven={phase.proven}
              onJudged={(result, selfAssessed) => {
                finish(phase.answer, result, null, selfAssessed);
              }}
            />
          ) : (
            <>
              <p>Ta réponse a-t-elle le même sens, avec la forme travaillée ici bien employée ?</p>
              <div className="button-row">
                <Button
                  onClick={() => {
                    finish(phase.answer, 'correct', null, true);
                  }}
                >
                  Oui, ma réponse est juste
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    finish(phase.answer, 'incorrect', null, true);
                  }}
                >
                  Non, ma réponse est à revoir
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}

      <SavingStatus saving={saving} onRetry={retry} />
      {phase.name === 'done' && saving.state === 'saved' ? (
        <Feedback
          verdict={verdictOf(phase.result)}
          expected={
            phase.result === 'correct' && (phase.selfAssessed || phase.matched === canonical)
              ? null
              : canonical
          }
          explanation={exercise.explanation}
          selfAssessed={phase.selfAssessed}
        />
      ) : null}
      {phase.name === 'checked' ? (
        <>
          <Feedback
            verdict={verdictOf(phase.result)}
            expected={phase.result === 'correct' ? null : canonical}
            explanation={exercise.explanation}
          />
          <CorrectionView productionId={phase.productionId} />
        </>
      ) : null}
    </div>
  );
}
