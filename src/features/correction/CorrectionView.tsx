import { useState } from 'react';
import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { hasContent } from '../../content/index.ts';
import { CATEGORY_TEXTS } from '../../content/taxonomy.ts';
import { reviewedCorrectionOf } from '../../data/repositories/production-repository.ts';
import type { CardDocument } from '../../data/schemas/cards.ts';
import type { ErrorDocument } from '../../data/schemas/errors.ts';
import type { ProductionDocument } from '../../data/schemas/productions.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import {
  checkSelfCorrection,
  isCountedError,
  type ReviewedCorrection,
  type ReviewedError,
} from '../../domain/production/correction.ts';
import { Button } from '../../ui/Button.tsx';
import { TextField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { SpeakButton } from '../../ui/SpeakButton.tsx';
import { useAppServices } from '../app-services.ts';
import { pathTo } from '../paths.ts';
import { useSettings } from '../settings/use-settings.ts';
import { useSpeech } from '../speech/use-speech.ts';
import { MarkedText, type TextMark } from './MarkedText.tsx';
import { useProduction } from './use-correction.ts';
import './correction.css';

const DIAGNOSIS_NOTES = {
  lapsus: 'Un oubli ponctuel : une carte te la fera revoir.',
  lacune: 'Cette notion mérite une révision guidée ; elle est remise en tête de ton parcours.',
  unstudied:
    'Notion pas encore étudiée : sa carte attendra que tu arrives à l’étape « Traduire » de la notion.',
} as const;

function errorMarks(correction: ReviewedCorrection, withUnnatural: boolean): TextMark[] {
  const marks: TextMark[] = correction.errors.flatMap((error) =>
    error.range === null
      ? []
      : [{ range: error.range, kind: error.severity, number: error.index + 1 }],
  );
  if (!withUnnatural) return marks;
  return [
    ...marks,
    ...correction.unnatural.flatMap((phrase, index) =>
      phrase.range === null
        ? []
        : [
            {
              range: phrase.range,
              kind: 'unnatural' as const,
              number: correction.errors.length + index + 1,
            },
          ],
    ),
  ];
}

/** Notions to practise right away (PED-07): those of the counted errors, with their diagnosis. */
function practiceNotions(errors: readonly ErrorDocument[]) {
  const notions = new Map<NotionId, ErrorDocument['diagnosis']>();
  for (const error of errors) {
    if (error.notionId === null || !isCountedError(error) || !hasContent(error.notionId)) continue;
    if (!notions.has(error.notionId)) notions.set(error.notionId, error.diagnosis);
  }
  return [...notions.entries()];
}

interface CorrectionViewProps {
  readonly productionId: string;
}

/**
 * The correction in two steps (PED-05, PEDAGOGY §5.1): first the marked
 * segments with their category and a hint, for the learner to correct them;
 * then the corrections, the rules, the unnatural phrases, the natural version
 * and the expression of the day. The self-correction step can be skipped, or
 * turned off in the settings.
 */
export function CorrectionView({ productionId }: CorrectionViewProps) {
  const details = useProduction(productionId);
  // The first step depends on the settings: wait for them (PED-05).
  const settings = useSettings();
  if (details === undefined || settings === undefined) {
    return <p role="status">Chargement de la correction…</p>;
  }
  if (details === null) return null;
  if (details.state === 'unreadable') {
    return (
      <Notice tone="error" title="Correction illisible">
        <p>Elle est conservée : mets l’application à jour pour la lire.</p>
      </Notice>
    );
  }
  const correction = reviewedCorrectionOf(details.production);
  if (correction === null) {
    return details.production.correction === null ? null : (
      <Notice tone="error" title="Correction illisible">
        <p>Elle est conservée : mets l’application à jour pour la lire.</p>
      </Notice>
    );
  }
  return (
    <Correction
      key={productionId}
      selfCorrection={settings.values.selfCorrection}
      production={details.production}
      correction={correction}
      errors={details.errors}
      cards={details.cards}
    />
  );
}

function Correction({
  selfCorrection,
  production,
  correction,
  errors,
  cards,
}: {
  readonly selfCorrection: boolean;
  readonly production: ProductionDocument;
  readonly correction: ReviewedCorrection;
  readonly errors: readonly ErrorDocument[];
  readonly cards: readonly CardDocument[];
}) {
  const { productions } = useAppServices();
  const askSelfCorrection =
    selfCorrection && production.selfCorrections === null && correction.errors.length > 0;
  const [step, setStep] = useState<'self' | 'answer'>(askSelfCorrection ? 'self' : 'answer');
  const [attempts, setAttempts] = useState<string[]>(() =>
    correction.errors.map((error) => error.segment),
  );
  const [saveFailed, setSaveFailed] = useState(false);

  if (step === 'self') {
    return (
      <div className="correction">
        <p className="correction__summary">
          {correction.errors.length === 1
            ? 'Un passage est à revoir. Essaie de le corriger toi-même.'
            : `${String(correction.errors.length)} passages sont à revoir. Essaie de les corriger toi-même.`}
        </p>
        <MarkedText text={production.text} marks={errorMarks(correction, false)} />
        <ol className="correction__list">
          {correction.errors.map((error, index) => (
            <li key={error.index} className="correction__item">
              <p className="correction__label">{CATEGORY_TEXTS[error.category].label}</p>
              <p lang="en" className="correction__segment">
                {error.segment}
              </p>
              {/\S/.test(error.hintFr) ? (
                <p className="muted">
                  <RichText text={error.hintFr} />
                </p>
              ) : null}
              <TextField
                label={`Ta correction du passage ${String(error.index + 1)}`}
                lang="en"
                spellCheck={false}
                autoComplete="off"
                maxLength={1_000}
                value={attempts[index] ?? ''}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setAttempts((current) =>
                    current.map((text, at) => (at === index ? value : text)),
                  );
                }}
              />
            </li>
          ))}
        </ol>
        {saveFailed ? (
          <Notice tone="error" title="Corrections non enregistrées">
            <p>
              Le stockage du téléphone est peut-être plein. Tu peux tout de même voir la correction.
            </p>
          </Notice>
        ) : null}
        <div className="button-row">
          <Button
            onClick={() => {
              const selfCorrections = attempts.map((text, errorIndex) => ({ errorIndex, text }));
              productions.saveSelfCorrections(production.id, selfCorrections).then(
                () => {
                  setStep('answer');
                },
                () => {
                  setSaveFailed(true);
                },
              );
            }}
          >
            Vérifier mes corrections
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setStep('answer');
            }}
          >
            Voir la correction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Answer
      production={production}
      correction={correction}
      errors={errors}
      cards={cards}
      attempts={production.selfCorrections}
    />
  );
}

function SelfCorrectionNote({
  error,
  attempt,
}: {
  readonly error: ReviewedError;
  readonly attempt: string | undefined;
}) {
  if (attempt === undefined) return null;
  switch (checkSelfCorrection(attempt, error)) {
    case 'matches':
      return (
        <p className="correction__self correction__self--found">Bien vu : c’est la correction.</p>
      );
    case 'unchanged':
      return <p className="correction__self">Tu avais laissé ce passage tel quel.</p>;
    case 'different':
      return (
        <p className="correction__self">
          Ta proposition : <span lang="en">{attempt}</span>. Elle diffère de la correction
          ci-dessus, sans être forcément fausse.
        </p>
      );
  }
}

function Answer({
  production,
  correction,
  errors,
  cards,
  attempts,
}: {
  readonly production: ProductionDocument;
  readonly correction: ReviewedCorrection;
  readonly errors: readonly ErrorDocument[];
  readonly cards: readonly CardDocument[];
  readonly attempts: ProductionDocument['selfCorrections'];
}) {
  const speech = useSpeech();
  const documents = new Map(errors.map((error) => [error.index, error]));
  const cardOf = (index: number) => {
    const id = documents.get(index)?.id;
    return id === undefined ? undefined : cards.find((card) => card.sourceErrorId === id);
  };
  const active = cards.filter((card) => card.status !== 'suspended').length;
  const waiting = cards.length - active;
  const practice = practiceNotions(errors);
  const unnaturalStart = correction.errors.length;

  return (
    <div className="correction">
      <p className="correction__summary">
        {correction.errors.length === 0
          ? 'Aucune erreur : bravo.'
          : correction.errors.length === 1
            ? 'Une erreur corrigée.'
            : `${String(correction.errors.length)} erreurs corrigées.`}
        {correction.unnatural.length > 0
          ? ` ${String(correction.unnatural.length)} tournure(s) à rendre plus naturelle(s).`
          : ''}
      </p>
      <MarkedText text={production.text} marks={errorMarks(correction, true)} />

      {correction.errors.length > 0 ? (
        <ol className="correction__list">
          {correction.errors.map((error) => {
            const card = cardOf(error.index);
            const diagnosis = documents.get(error.index)?.diagnosis ?? null;
            return (
              <li
                key={error.index}
                className={`correction__item correction__item--${error.severity}`}
              >
                <p className="correction__label">
                  {`${String(error.index + 1)}. ${CATEGORY_TEXTS[error.category].label}`}
                </p>
                <p lang="en" className="correction__change">
                  <s>{error.segment}</s> →{' '}
                  <strong>{error.correction === '' ? '(à supprimer)' : error.correction}</strong>
                </p>
                <p>
                  <RichText text={error.ruleFr} />
                </p>
                <SelfCorrectionNote
                  error={error}
                  attempt={attempts?.find((entry) => entry.errorIndex === error.index)?.text}
                />
                {error.confidence === 'low' ? (
                  <p className="muted">
                    Point à vérifier : l’IA n’en est pas sûre. Il ne compte pas dans tes erreurs.
                  </p>
                ) : null}
                {diagnosis === null ? null : <p className="muted">{DIAGNOSIS_NOTES[diagnosis]}</p>}
                {card === undefined ? null : (
                  <p className="muted">
                    {card.status === 'suspended'
                      ? 'Carte mise de côté pour l’instant.'
                      : 'Carte ajoutée à tes Reprises.'}
                  </p>
                )}
                {error.notionId !== null && hasContent(error.notionId) ? (
                  <p>
                    <Link to={pathTo.lesson(error.notionId)}>
                      Leçon : <RichText text={NOTION_TITLES[error.notionId]} />
                    </Link>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}

      {correction.unnatural.length > 0 ? (
        <section className="correction__section" aria-label="Tournures à rendre plus naturelles">
          <h3 className="correction__heading">Correct, mais peu naturel</h3>
          <ul className="correction__list">
            {correction.unnatural.map((phrase, index) => (
              <li key={phrase.original} className="correction__item">
                <p className="correction__label">{String(unnaturalStart + index + 1)}.</p>
                <p lang="en" className="correction__change">
                  {phrase.original} → <strong>{phrase.alternative}</strong>
                </p>
                <p>
                  <RichText text={phrase.whyFr} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="correction__section" aria-label="Version naturelle">
        <h3 className="correction__heading">Version naturelle</h3>
        <p className="correction__natural">
          <span lang="en">{correction.naturalVersion}</span>
          {speech.available ? (
            <SpeakButton
              text={correction.naturalVersion}
              onSpeak={() => {
                speech.speak(correction.naturalVersion);
              }}
            />
          ) : null}
        </p>
      </section>

      {correction.expressionOfTheDay === null ? null : (
        <ExpressionOfTheDay expression={correction.expressionOfTheDay} />
      )}

      {/\S/.test(correction.evaluation.commentFr) ? (
        <p>
          <RichText text={correction.evaluation.commentFr} />
        </p>
      ) : null}

      {cards.length > 0 ? (
        <p className="muted">
          {[
            active > 0 ? `${String(active)} carte(s) ajoutée(s) à tes Reprises` : null,
            waiting > 0
              ? `${String(waiting)} mise(s) de côté, en attendant que tu étudies leur notion`
              : null,
          ]
            .filter((part) => part !== null)
            .join(', ')}
          .
        </p>
      ) : null}

      {practice.length > 0 ? (
        <section className="correction__section" aria-label="Pratique immédiate">
          <h3 className="correction__heading">Pratique immédiate</h3>
          <p className="muted">
            Deux minutes d’exercices ciblés, tout de suite : c’est facultatif.
          </p>
          <ul className="plain-list">
            {practice.map(([notionId, diagnosis]) => (
              <li key={notionId} className="plain-list__item">
                <span className="plain-list__text">
                  <RichText text={NOTION_TITLES[notionId]} />
                </span>
                <span className="button-row">
                  {diagnosis === 'unstudied' ? (
                    <Link className="button button--secondary" to={pathTo.lesson(notionId)}>
                      Découvrir la leçon
                    </Link>
                  ) : null}
                  <Link className="button button--secondary" to={pathTo.practiceNow(notionId)}>
                    S’entraîner
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ExpressionOfTheDay({
  expression,
}: {
  readonly expression: NonNullable<ReviewedCorrection['expressionOfTheDay']>;
}) {
  const { lexicon } = useAppServices();
  const [added, setAdded] = useState<
    'idle' | 'saving' | 'added' | 'added-without-card' | 'duplicate' | 'failed'
  >('idle');
  const messages = {
    added: 'Ajoutée à ton lexique, avec sa carte.',
    'added-without-card':
      'Ajoutée à ton lexique. L’exemple ne contient pas l’expression telle quelle : pas de carte.',
    duplicate: 'Elle est déjà dans ton lexique.',
    failed: 'Non ajoutée : le stockage du téléphone est peut-être plein.',
  } as const;
  return (
    <section className="correction__section" aria-label="Expression du jour">
      <h3 className="correction__heading">Expression du jour</h3>
      <p>
        <strong lang="en">{expression.expression}</strong> :{' '}
        <RichText text={expression.meaningFr} />
      </p>
      <p lang="en" className="muted">
        {expression.example}
      </p>
      {added === 'idle' || added === 'saving' ? (
        <div className="button-row">
          <Button
            variant="secondary"
            disabled={added === 'saving'}
            onClick={() => {
              setAdded('saving');
              lexicon
                .add({ ...expression, source: 'expression-of-the-day' })
                .then((result) => {
                  if (result.ok) setAdded(result.withCard ? 'added' : 'added-without-card');
                  else setAdded(result.reason === 'duplicate' ? 'duplicate' : 'failed');
                })
                .catch(() => {
                  setAdded('failed');
                });
            }}
          >
            Ajouter à mon lexique
          </Button>
        </div>
      ) : (
        <p role="status">{messages[added]}</p>
      )}
    </section>
  );
}
