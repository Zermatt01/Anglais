import { useRef, useState } from 'react';
import type { CoreThemeItem } from '../../content/schema.ts';
import { fallbackHintOf } from '../../content/taxonomy.ts';
import type { NewProduction } from '../../data/repositories/production-repository.ts';
import { knownErrorCardContent } from '../../domain/cards/from-correction.ts';
import type { ProgressEvent } from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { AnswerResult } from '../../domain/taxonomy.ts';
import { evaluateThemeAnswer, themeInstruction } from '../../domain/theme/item.ts';
import type { ThemeTier } from '../../domain/theme/tier.ts';
import { Button } from '../../ui/Button.tsx';
import { TextAreaField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { Sheet } from '../../ui/Page.tsx';
import { useAppServices } from '../app-services.ts';
import { CorrectionAction } from '../correction/CorrectionAction.tsx';
import { CorrectionView } from '../correction/CorrectionView.tsx';
import { referenceOf } from '../correction/request.ts';
import { useCorrection } from '../correction/use-correction.ts';
import { useDraft } from '../drafts/use-draft.ts';
import { Feedback } from '../path/exercises/Feedback.tsx';
import { eventMessage } from '../path/labels.ts';

export type SentenceResult = AnswerResult;

const MAX_ANSWER = 500;

type Phase =
  | { readonly name: 'answering' }
  | { readonly name: 'saving' }
  /** No expected answer matches: the model corrects on request, or the learner compares (NO-05). */
  | { readonly name: 'compare'; readonly answer: string; readonly productionId: string | null }
  | {
      readonly name: 'done';
      readonly answer: string;
      readonly result: AnswerResult;
      readonly grader: 'local' | 'user' | 'ai';
      readonly matched: string | null;
      readonly productionId: string | null;
      readonly events: readonly ProgressEvent[];
      readonly cardsCreated: number;
    }
  | { readonly name: 'not-saved'; readonly retry: () => void };

interface ThemeSentenceProps {
  readonly notionId: NotionId;
  readonly notionTitle: string;
  readonly item: CoreThemeItem;
  readonly tier: ThemeTier;
  /** From a notion not studied yet: the hint is always shown (D-023). */
  readonly unstudied: boolean;
  readonly onNext: (result: SentenceResult) => void;
}

export function ThemeSentence({
  notionId,
  notionTitle,
  item,
  tier,
  unstudied,
  onNext,
}: ThemeSentenceProps) {
  const { productions, clock } = useAppServices();
  const draftKey = `theme:${item.id}`;
  const draft = useDraft(draftKey, '');
  const shownAt = useRef(clock.now());
  const [hintShown, setHintShown] = useState(unstudied);
  const [empty, setEmpty] = useState(false);
  const [phase, setPhase] = useState<Phase>({ name: 'answering' });
  const { run, correct, available, once, sending } = useCorrection();
  const instruction = themeInstruction(item, tier);
  const canonical = item.accepted[0] ?? '';
  const reference = referenceOf(item.sentenceFr, item.accepted);

  const production = (answer: string): NewProduction => ({
    module: 'theme',
    prompt: instruction,
    context: { notionId, itemId: item.id, tier, unstudied, hintUsed: hintShown },
    text: answer,
    durationMs: clock.now() - shownAt.current,
    draftKey,
  });

  /** Graded without the model: by the local correction, or by the learner. */
  const recordLocally = (
    answer: string,
    result: AnswerResult,
    grader: 'local' | 'user',
    matched: string | null,
  ) => {
    const save = async () => {
      setPhase({ name: 'saving' });
      try {
        const knownError =
          result === 'incorrect' && grader === 'local'
            ? {
                category: item.knownErrorCategory,
                correction: canonical,
                rule: item.explanation,
                card: knownErrorCardContent({
                  meaningFr: item.sentenceFr,
                  hint: item.hint,
                  attempt: answer,
                  category: item.knownErrorCategory,
                  notionId,
                  accepted: item.accepted,
                }),
              }
            : null;
        const outcome = await productions.recordLocalResult(
          production(answer),
          { result, grader },
          knownError,
        );
        draft.reset('');
        setPhase({
          name: 'done',
          answer,
          result,
          grader,
          matched,
          productionId: null,
          events: outcome.events,
          cardsCreated: outcome.cardsCreated,
        });
      } catch {
        setPhase({ name: 'not-saved', retry: () => void save() });
      }
    };
    void save();
  };

  const check = async () => {
    const answer = draft.text.trim();
    if (answer === '') {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    // The pending typing is saved first: no late save brings the draft back.
    await draft.flush();
    const evaluation = evaluateThemeAnswer(item, answer);
    if (evaluation.verdict === 'unknown') {
      setPhase({ name: 'compare', answer, productionId: null });
      return;
    }
    recordLocally(answer, evaluation.verdict, 'local', evaluation.matched);
  };

  const askModel = async (answer: string, productionId: string | null) => {
    let id = productionId;
    if (id === null) {
      try {
        id = (await productions.submit(production(answer))).id;
      } catch {
        setPhase({ name: 'not-saved', retry: () => void askModel(answer, null) });
        return;
      }
      draft.reset('');
      setPhase({ name: 'compare', answer, productionId: id });
    }
    const corrected = await correct(
      id,
      {
        module: 'theme',
        instruction,
        reference,
        targetNotionId: notionId,
        text: answer,
      },
      { reference, fallbackHint: fallbackHintOf },
    );
    if (corrected.state === 'done') {
      setPhase({
        name: 'done',
        answer,
        result: corrected.outcome.result ?? 'acceptable',
        grader: 'ai',
        matched: null,
        productionId: id,
        events: corrected.outcome.events,
        cardsCreated: corrected.outcome.cardsCreated,
      });
    }
  };

  const assess = (answer: string, productionId: string | null, right: boolean) => {
    const result = right ? 'correct' : 'incorrect';
    if (productionId === null) {
      recordLocally(answer, result, 'user', null);
      return;
    }
    productions.assess(productionId, result).then(
      () => {
        setPhase({
          name: 'done',
          answer,
          result,
          grader: 'user',
          matched: null,
          productionId: null,
          events: [],
          cardsCreated: 0,
        });
      },
      () => {
        setPhase({
          name: 'not-saved',
          retry: () => {
            assess(answer, productionId, right);
          },
        });
      },
    );
  };

  return (
    <Sheet
      title={tier === 1 ? 'Traduis' : tier === 2 ? 'Exprime la situation' : 'Consigne en anglais'}
    >
      {unstudied ? (
        <p className="badge">
          Notion pas encore étudiée : <RichText text={notionTitle} />
        </p>
      ) : null}
      <p className="exercise__sentence" lang={instruction.language}>
        <RichText text={instruction.text} />
      </p>
      {hintShown ? (
        <Notice title="Indice">
          <p>
            <RichText text={item.hint} />
          </p>
        </Notice>
      ) : null}
      {draft.unreadable ? (
        <Notice tone="error" title="Ancien brouillon illisible">
          <p>Il est conservé à part et reste inclus dans l’export de tes données.</p>
        </Notice>
      ) : null}
      <TextAreaField
        label="Ta phrase, en anglais"
        lang="en"
        spellCheck={false}
        rows={3}
        maxLength={MAX_ANSWER}
        value={
          phase.name === 'answering'
            ? draft.text
            : phase.name === 'done' || phase.name === 'compare'
              ? phase.answer
              : draft.text
        }
        disabled={!draft.ready || phase.name !== 'answering'}
        onChange={(event) => {
          setEmpty(false);
          draft.setText(event.currentTarget.value);
        }}
      />
      {empty ? (
        <Notice tone="error" title="Réponse vide">
          <p>Écris ta phrase avant de vérifier.</p>
        </Notice>
      ) : null}

      {phase.name === 'answering' ? (
        <div className="button-row">
          <Button
            disabled={!draft.ready}
            onClick={() => {
              void check();
            }}
          >
            Vérifier
          </Button>
          {hintShown ? null : (
            <Button
              variant="secondary"
              onClick={() => {
                setHintShown(true);
              }}
            >
              Voir un indice
            </Button>
          )}
        </div>
      ) : null}
      {phase.name === 'saving' ? <p role="status">Enregistrement de ta réponse…</p> : null}
      {phase.name === 'not-saved' ? (
        <>
          <Notice tone="error" title="Réponse non enregistrée">
            <p>Le stockage du téléphone est peut-être plein : libère de la place, puis réessaie.</p>
          </Notice>
          <div className="button-row">
            <Button onClick={phase.retry}>Réessayer</Button>
          </div>
        </>
      ) : null}

      {phase.name === 'compare' ? (
        <div className="feedback feedback--compare" role="status">
          <p className="feedback__title">Réponse non prévue</p>
          <p>
            Ta phrase ne figure pas parmi les réponses prévues, ce qui ne veut pas dire qu’elle est
            fausse. L’IA peut la corriger, ou tu peux la comparer avec la référence :
          </p>
          <p lang="en" className="feedback__answer">
            {canonical}
          </p>
          <CorrectionAction
            run={run}
            sending={sending}
            available={available}
            onCorrect={() => {
              void once(() => askModel(phase.answer, phase.productionId));
            }}
          />
          {run.state === 'running' || sending ? null : (
            <>
              <p>Ou bien : ta phrase a-t-elle le même sens, sans faute ?</p>
              <div className="button-row">
                <Button
                  variant="secondary"
                  onClick={() => {
                    assess(phase.answer, phase.productionId, true);
                  }}
                >
                  Oui, elle est juste
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    assess(phase.answer, phase.productionId, false);
                  }}
                >
                  Non, elle est à revoir
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {phase.name === 'done' ? (
        <>
          {phase.grader === 'ai' && phase.productionId !== null ? (
            <CorrectionView productionId={phase.productionId} />
          ) : (
            <Feedback
              verdict={phase.result === 'incorrect' ? 'incorrect' : 'correct'}
              expected={
                phase.result !== 'incorrect' &&
                (phase.grader === 'user' || phase.matched === canonical)
                  ? null
                  : canonical
              }
              explanation={item.explanation}
              selfAssessed={phase.grader === 'user'}
            />
          )}
          {phase.grader === 'local' && phase.cardsCreated > 0 ? (
            <p className="muted">Une carte reprendra cette phrase dans tes Reprises.</p>
          ) : null}
          {phase.events.map((event) => {
            const message = eventMessage(event);
            return message === null ? null : (
              <Notice key={event.type} tone="success" title={message.title}>
                <p>{message.body}</p>
              </Notice>
            );
          })}
          <div className="button-row">
            <Button
              onClick={() => {
                onNext(phase.result);
              }}
            >
              Phrase suivante
            </Button>
          </div>
        </>
      ) : null}
    </Sheet>
  );
}
