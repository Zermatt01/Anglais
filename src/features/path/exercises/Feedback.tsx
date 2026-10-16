import { RichText } from '../../../ui/RichText.tsx';

interface FeedbackProps {
  /** `partial`: the notion is right, something else is to be reviewed (D-094). */
  readonly verdict: 'correct' | 'partial' | 'incorrect';
  /** Expected answer, shown when the answer was wrong or differed from it. */
  readonly expected: string | null;
  readonly explanation: string;
  /** The learner judged the answer (it matched no expected answer). */
  readonly selfAssessed?: boolean;
}

const TITLES: Readonly<Record<FeedbackProps['verdict'], readonly [string, string]>> = {
  correct: ['Juste !', 'Noté comme juste'],
  partial: ['Notion juste, autre chose à revoir', 'Noté : notion juste, autre chose à revoir'],
  incorrect: ['Pas tout à fait', 'Noté comme à revoir'],
};

/** Result of an exercise, with the rule in simple French (PED-05). */
export function Feedback({ verdict, expected, explanation, selfAssessed = false }: FeedbackProps) {
  const [graded, judged] = TITLES[verdict];
  return (
    <div className={`feedback feedback--${verdict}`} role="status">
      <p className="feedback__title">{selfAssessed ? judged : graded}</p>
      {expected === null ? null : (
        <p>
          {verdict === 'incorrect' ? 'Réponse attendue : ' : 'Réponse de référence : '}
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
