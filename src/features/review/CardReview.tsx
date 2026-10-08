import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { TASK_SETTINGS } from '../../../shared/ai/models.ts';
import { maxCostOfRequest } from '../../../shared/ai/pricing.ts';
import { CHECK_CARD_ANSWER_MAX_INPUT_TOKENS } from '../../../shared/ai/tasks.ts';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { hasContent } from '../../content/index.ts';
import { CATEGORY_TEXTS } from '../../content/taxonomy.ts';
import type { CardDocument } from '../../data/schemas/cards.ts';
import {
  acceptedCardAnswers,
  evaluateCardAnswer,
  expectedSentenceOf,
  textWithGapOf,
} from '../../domain/cards/answer.ts';
import type { CardContent } from '../../domain/cards/content.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { proposeGrade } from '../../domain/srs/grading.ts';
import type { ReviewGrade } from '../../domain/srs/state.ts';
import type { AnswerResult, Grader } from '../../domain/taxonomy.ts';
import type { AiClientError } from '../../services/ai-client/ai-client.ts';
import { Button } from '../../ui/Button.tsx';
import { TextAreaField, TextField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { Sheet } from '../../ui/Page.tsx';
import { formatMaxUsd } from '../ai/format.ts';
import { aiErrorMessage } from '../ai/messages.ts';
import { useAppServices } from '../app-services.ts';
import { MarkedText } from '../correction/MarkedText.tsx';
import { useDraft } from '../drafts/use-draft.ts';
import { SentenceWithGap } from '../path/exercises/SentenceWithGap.tsx';
import { pathTo } from '../paths.ts';
import { useSettings } from '../settings/use-settings.ts';
import { useOnline } from '../use-online.ts';

type ReviewedContent = Exclude<CardContent, { type: 'pronunciation' }>;

const CHECK_SETTINGS = TASK_SETTINGS['check-card-answer'];
const CHECK_MAX_COST_USD = maxCostOfRequest(CHECK_SETTINGS.model, {
  inputTokens: CHECK_CARD_ANSWER_MAX_INPUT_TOKENS,
  maxTokens: CHECK_SETTINGS.maxTokens,
  cachePrefix: CHECK_SETTINGS.cachePrefix,
});

const GRADES: readonly { readonly grade: ReviewGrade; readonly label: string }[] = [
  { grade: 'again', label: 'À revoir' },
  { grade: 'hard', label: 'Difficile' },
  { grade: 'good', label: 'Bien' },
  { grade: 'easy', label: 'Facile' },
];

const RESULT_TITLES: Readonly<Record<AnswerResult, string>> = {
  correct: 'Juste !',
  acceptable: 'Presque',
  incorrect: 'À revoir',
};

type Phase =
  | { readonly name: 'answering' }
  /** No accepted answer matches: the model checks it on request, or the learner compares. */
  | { readonly name: 'unknown'; readonly answer: string }
  | {
      readonly name: 'graded';
      readonly answer: string;
      readonly result: AnswerResult;
      readonly grader: Grader;
      readonly reason: string | null;
    };

/** The question of a card: always a meaning to express, never a choice (CARD-04). */
function Question({
  content,
  hintShown,
}: {
  readonly content: ReviewedContent;
  readonly hintShown: boolean;
}) {
  const gapped = textWithGapOf(content);
  return (
    <>
      <p className="exercise__sentence">
        <RichText text={content.meaningFr} />
      </p>
      {gapped === null ? null : <SentenceWithGap sentence={gapped} />}
      {content.type === 'cloze' && content.infinitive !== null ? (
        <p>
          Verbe : <span lang="en">{content.infinitive}</span>
        </p>
      ) : null}
      {hintShown && content.hint !== null ? (
        <Notice title="Indice">
          <p>
            <RichText text={content.hint} />
          </p>
        </Notice>
      ) : null}
    </>
  );
}

interface CardReviewProps {
  readonly card: CardDocument & { readonly content: ReviewedContent };
  /** Called once the review is stored. */
  readonly onReviewed: () => void;
}

/**
 * One card of the Reprises (CARD-02 to CARD-05): the learner produces the
 * answer; it is graded locally when it matches, otherwise by the fast model on
 * request or by the learner; then the learner confirms or adjusts the grade.
 */
export function CardReview({ card, onReviewed }: CardReviewProps) {
  const { cards, server, clock } = useAppServices();
  const settings = useSettings()?.values ?? DEFAULT_SETTINGS;
  const online = useOnline();
  const { content } = card;
  const draftKey = `review:${card.id}`;
  const draft = useDraft(draftKey, '');
  const shownAt = useRef(clock.now());
  const [hintShown, setHintShown] = useState(false);
  const [attemptShown, setAttemptShown] = useState(false);
  const [phase, setPhase] = useState<Phase>({ name: 'answering' });
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<AiClientError | null>(null);
  const [saving, setSaving] = useState<'idle' | 'saving' | 'failed'>('idle');
  const expected = expectedSentenceOf(content);
  const gapped = textWithGapOf(content);

  const check = () => {
    const answer = draft.text.trim();
    if (answer === '') return;
    const evaluation = evaluateCardAnswer(content, answer);
    setPhase(
      evaluation.verdict === 'correct'
        ? { name: 'graded', answer, result: 'correct', grader: 'local', reason: null }
        : { name: 'unknown', answer },
    );
  };

  const askModel = (answer: string) => {
    if (server === null) return;
    setChecking(true);
    setCheckError(null);
    const input = {
      cardType: content.type,
      meaningFr: content.meaningFr,
      textWithGap: gapped,
      infinitive:
        content.type === 'cloze' && content.infinitive !== null && /\S/.test(content.infinitive)
          ? content.infinitive
          : null,
      expected: acceptedCardAnswers(content).filter((text) => /\S/.test(text)),
      answer,
      englishVariant: settings.englishVariant,
    };
    void server.ai.run('check-card-answer', input, crypto.randomUUID()).then((result) => {
      setChecking(false);
      if (!result.ok) {
        setCheckError(result.error);
        return;
      }
      setPhase({
        name: 'graded',
        answer,
        result: result.output.verdict,
        grader: 'ai',
        reason: result.output.reasonFr,
      });
    });
  };

  const save = async (graded: Extract<Phase, { name: 'graded' }>, chosen: ReviewGrade) => {
    setSaving('saving');
    await draft.flush();
    const proposed = proposeGrade(graded.result, hintShown);
    try {
      await cards.review({
        cardId: card.id,
        answer: graded.answer,
        result: graded.result,
        grader: graded.grader,
        hintUsed: hintShown,
        grade: proposed,
        adjustedGrade: chosen === proposed ? null : chosen,
        durationMs: Math.max(0, clock.now() - shownAt.current),
        draftKey,
      });
      draft.reset('');
      onReviewed();
    } catch {
      setSaving('failed');
    }
  };

  const answerField = {
    label: 'Ta réponse, en anglais',
    lang: 'en',
    spellCheck: false,
    autoComplete: 'off',
    maxLength: 500,
    value: phase.name === 'answering' ? draft.text : phase.answer,
    disabled: !draft.ready || phase.name !== 'answering',
    onChange: (event: { currentTarget: { value: string } }) => {
      draft.setText(event.currentTarget.value);
    },
  };

  return (
    <Sheet
      title={
        content.type === 'error' ? `Carte · ${CATEGORY_TEXTS[content.category].label}` : 'Carte'
      }
    >
      <Question content={content} hintShown={hintShown} />
      {content.type === 'error' ? (
        attemptShown ? (
          <div>
            <p className="muted">Ta tentative précédente :</p>
            <MarkedText
              text={content.previousAttempt}
              marks={content.highlights.map((range, index) => ({
                range,
                kind: 'medium',
                number: index + 1,
              }))}
            />
          </div>
        ) : null
      ) : null}
      {gapped === null ? (
        <TextAreaField {...answerField} rows={2} />
      ) : (
        <TextField {...answerField} />
      )}

      {phase.name === 'answering' ? (
        <div className="button-row">
          <Button disabled={!draft.ready || draft.text.trim() === ''} onClick={check}>
            Vérifier
          </Button>
          {content.hint === null || hintShown ? null : (
            <Button
              variant="secondary"
              onClick={() => {
                setHintShown(true);
              }}
            >
              Voir l’indice
            </Button>
          )}
          {content.type === 'error' && !attemptShown ? (
            <Button
              variant="secondary"
              onClick={() => {
                setAttemptShown(true);
              }}
            >
              Voir ma tentative précédente
            </Button>
          ) : null}
        </div>
      ) : null}

      {phase.name === 'unknown' ? (
        <div className="feedback feedback--compare" role="status">
          <p className="feedback__title">Réponse non prévue</p>
          <p>Elle n’est pas forcément fausse. Réponse de référence :</p>
          <p lang="en" className="feedback__answer">
            {expected}
          </p>
          {checkError === null ? null : (
            <Notice tone="error" title="Vérification impossible">
              <p>{aiErrorMessage(checkError)}</p>
            </Notice>
          )}
          {server === null ? null : (
            <>
              <p className="muted">
                {online
                  ? `Vérification rapide par l’IA : au plus ${formatMaxUsd(CHECK_MAX_COST_USD)}.`
                  : 'Connexion nécessaire pour la vérification par l’IA.'}
              </p>
              <div className="button-row">
                <Button
                  disabled={!online || checking}
                  onClick={() => {
                    askModel(phase.answer);
                  }}
                >
                  {checking ? 'Vérification en cours…' : 'Faire vérifier par l’IA'}
                </Button>
              </div>
            </>
          )}
          {checking ? null : (
            <>
              <p>Ou compare toi-même : ta réponse a-t-elle le même sens, sans faute ?</p>
              <div className="button-row">
                {(['correct', 'acceptable', 'incorrect'] as const).map((result) => (
                  <Button
                    key={result}
                    variant="secondary"
                    onClick={() => {
                      setPhase({
                        name: 'graded',
                        answer: phase.answer,
                        result,
                        grader: 'user',
                        reason: null,
                      });
                    }}
                  >
                    {result === 'correct'
                      ? 'Oui, juste'
                      : result === 'acceptable'
                        ? 'Presque'
                        : 'Non, à revoir'}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {phase.name === 'graded' ? (
        <GradeChoice
          phase={phase}
          expected={expected}
          proposed={proposeGrade(phase.result, hintShown)}
          saving={saving}
          onChoose={(grade) => {
            void save(phase, grade);
          }}
        />
      ) : null}

      {content.notionId !== null && hasContent(content.notionId) ? (
        <p>
          <Link to={pathTo.lesson(content.notionId)}>
            Leçon : <RichText text={NOTION_TITLES[content.notionId]} />
          </Link>
        </p>
      ) : null}
    </Sheet>
  );
}

function GradeChoice({
  phase,
  expected,
  proposed,
  saving,
  onChoose,
}: {
  readonly phase: Extract<Phase, { name: 'graded' }>;
  readonly expected: string;
  readonly proposed: ReviewGrade;
  readonly saving: 'idle' | 'saving' | 'failed';
  readonly onChoose: (grade: ReviewGrade) => void;
}) {
  return (
    <div
      className={`feedback feedback--${phase.result === 'incorrect' ? 'incorrect' : 'correct'}`}
      role="status"
    >
      <p className="feedback__title">{RESULT_TITLES[phase.result]}</p>
      <p>
        Réponse de référence :{' '}
        <span lang="en" className="feedback__answer">
          {expected}
        </span>
      </p>
      {phase.reason === null ? null : (
        <p>
          <RichText text={phase.reason} />
        </p>
      )}
      <p>Confirme la note, ou choisis-en une autre : elle fixe quand la carte reviendra.</p>
      {saving === 'failed' ? (
        <Notice tone="error" title="Révision non enregistrée">
          <p>Le stockage du téléphone est peut-être plein : libère de la place, puis réessaie.</p>
        </Notice>
      ) : null}
      <div className="button-row">
        {GRADES.map(({ grade, label }) => (
          <Button
            key={grade}
            variant={grade === proposed ? 'primary' : 'secondary'}
            disabled={saving === 'saving'}
            onClick={() => {
              onChoose(grade);
            }}
          >
            {grade === proposed ? `${label} (proposé)` : label}
          </Button>
        ))}
      </div>
    </div>
  );
}
