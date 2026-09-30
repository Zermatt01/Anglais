import { RichText } from '../../../ui/RichText.tsx';

interface FeedbackProps {
  readonly verdict: 'correct' | 'incorrect';
  /** Expected answer, shown when the answer was wrong or differed from it. */
  readonly expected: string | null;
  readonly explanation: string;
  /** The learner judged the answer (it matched no expected answer). */
  readonly selfAssessed?: boolean;
}

/** Result of an exercise, with the rule in simple French (PED-05). */
export function Feedback({ verdict, expected, explanation, selfAssessed = false }: FeedbackProps) {
  const title =
    verdict === 'correct'
      ? selfAssessed
        ? 'Noté comme juste'
        : 'Juste !'
      : selfAssessed
        ? 'Noté comme à revoir'
        : 'Pas tout à fait';
  return (
    <div
      className={`feedback feedback--${verdict === 'correct' ? 'correct' : 'incorrect'}`}
      role="status"
    >
      <p className="feedback__title">{title}</p>
      {expected === null ? null : (
        <p>
          {verdict === 'correct' ? 'Réponse de référence : ' : 'Réponse attendue : '}
          <span lang="en" className="feedback__answer">
            {expected}
          </span>
        </p>
      )}
      <p>
        <RichText text={explanation} />
      </p>
    </div>
  );
}
