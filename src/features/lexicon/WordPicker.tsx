import { useRef, useState } from 'react';
import { TASK_SETTINGS } from '../../../shared/ai/models.ts';
import { maxCostOfRequest } from '../../../shared/ai/pricing.ts';
import {
  EXPLAIN_WORD_MAX_INPUT_TOKENS,
  MAX_WORD_EXPRESSION,
  MAX_WORD_SENTENCE,
} from '../../../shared/ai/tasks.ts';
import {
  expressionBetween,
  MAX_EXPRESSION,
  MAX_MEANING,
  piecesOf,
  sentenceAround,
} from '../../domain/lexicon.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import type { AiClientError } from '../../services/ai-client/ai-client.ts';
import { Button } from '../../ui/Button.tsx';
import { TextField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { formatMaxUsd, formatUsd } from '../ai/format.ts';
import { aiErrorMessage } from '../ai/messages.ts';
import { useAppServices } from '../app-services.ts';
import { useDraft } from '../drafts/use-draft.ts';
import { useSettings } from '../settings/use-settings.ts';
import { useOnline } from '../use-online.ts';
import './word-picker.css';

const EXPLAIN_SETTINGS = TASK_SETTINGS['explain-word'];
const EXPLAIN_MAX_COST_USD = maxCostOfRequest(EXPLAIN_SETTINGS.model, {
  inputTokens: EXPLAIN_WORD_MAX_INPUT_TOKENS,
  maxTokens: EXPLAIN_SETTINGS.maxTokens,
  cachePrefix: EXPLAIN_SETTINGS.cachePrefix,
});

type Addition =
  'idle' | 'saving' | 'added' | 'added-without-card' | 'duplicate' | 'invalid' | 'failed';

const MESSAGES = {
  added: { tone: 'success', text: 'Ajouté à ton lexique, avec sa carte de révision.' },
  'added-without-card': {
    tone: 'success',
    text: 'Ajouté à ton lexique. Le mot apparaît plusieurs fois dans la phrase : pas de carte.',
  },
  duplicate: { tone: 'error', text: 'Il est déjà dans ton lexique.' },
  invalid: { tone: 'error', text: 'Il faut le mot et son sens en français.' },
  failed: { tone: 'error', text: 'Non ajouté : le stockage du téléphone est peut-être plein.' },
} as const;

/** Longest part of the sentence kept in a draft key (drafts keys have at most 200 characters). */
const KEY_SENTENCE = 100;

/**
 * An English sentence whose unknown word, or expression, can be touched to
 * add it to "Mon lexique" (MOD-09, D-095): its meaning in French, typed by the
 * learner or proposed by the fast model on request, and the sentence that
 * holds it as example; its card is that sentence with a gap. Nothing is
 * written before "Ajouter".
 */
export function WordPicker({ sentence }: { readonly sentence: string }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{ first: number; last: number } | null>(null);
  const [chosen, setChosen] = useState<{ expression: string; sentence: string } | null>(null);
  if (!/\S/.test(sentence)) return null;

  if (!open) {
    return (
      <div className="word-picker">
        <button
          type="button"
          className="word-picker__toggle"
          onClick={() => {
            setOpen(true);
          }}
        >
          Mot inconnu ?
        </button>
      </div>
    );
  }

  const close = () => {
    setOpen(false);
    setRange(null);
    setChosen(null);
  };

  if (chosen !== null) {
    return (
      <div className="word-picker">
        <WordForm
          key={chosen.expression}
          expression={chosen.expression}
          sentence={chosen.sentence}
          onClose={close}
        />
      </div>
    );
  }

  const pieces = piecesOf(sentence);
  // Index of each word among the words of the sentence.
  const wordIndex = (position: number) =>
    pieces.slice(0, position).filter((piece) => piece.word).length;
  const expression = range === null ? '' : expressionBetween(sentence, range.first, range.last);
  return (
    <div className="word-picker">
      <p className="muted">Touche le mot inconnu, puis, pour une expression, son dernier mot.</p>
      <p className="word-picker__sentence" lang="en">
        {pieces.map((piece, position) => {
          if (!piece.word) return <span key={piece.start}>{piece.text}</span>;
          const at = wordIndex(position);
          const selected =
            range !== null &&
            at >= Math.min(range.first, range.last) &&
            at <= Math.max(range.first, range.last);
          return (
            <button
              key={piece.start}
              type="button"
              className={`word-picker__word${selected ? ' word-picker__word--selected' : ''}`}
              aria-pressed={selected}
              onClick={() => {
                setRange((current) =>
                  current === null || current.first !== current.last
                    ? { first: at, last: at }
                    : { first: current.first, last: at },
                );
              }}
            >
              {piece.text}
            </button>
          );
        })}
      </p>
      <div className="button-row">
        <Button
          disabled={range === null || expression === ''}
          onClick={() => {
            if (range === null) return;
            setChosen({ expression, sentence: sentenceAround(sentence, range.first, range.last) });
          }}
        >
          {expression === '' ? 'Choisis un mot' : `Ajouter « ${expression} »`}
        </Button>
        <Button variant="secondary" onClick={close}>
          Annuler
        </Button>
      </div>
    </div>
  );
}

function WordForm({
  expression: picked,
  sentence,
  onClose,
}: {
  readonly expression: string;
  readonly sentence: string;
  readonly onClose: () => void;
}) {
  const { lexicon, drafts, server } = useAppServices();
  const englishVariant = (useSettings()?.values ?? DEFAULT_SETTINGS).englishVariant;
  const online = useOnline();
  const [expression, setExpression] = useState(picked);
  // The meaning is a draft: typed text, or the proposed meaning, is never lost (UI-03).
  const meaningKey = `lexicon-word:${picked}|${sentence.slice(0, KEY_SENTENCE)}`;
  const meaning = useDraft(meaningKey, '');
  const [addition, setAddition] = useState<Addition>('idle');
  const [asking, setAsking] = useState(false);
  // A double tap must not send two requests: the state is only read at the next rendering.
  const askingNow = useRef(false);
  const [askError, setAskError] = useState<AiClientError | null>(null);
  const [proposalCostUsd, setProposalCostUsd] = useState<number | null>(null);

  const ask = async () => {
    const words = expression.trim();
    if (server === null || askingNow.current || words === '') return;
    askingNow.current = true;
    setAsking(true);
    setAskError(null);
    const result = await server.ai.run(
      'explain-word',
      { expression: words, sentence, englishVariant },
      crypto.randomUUID(),
    );
    askingNow.current = false;
    setAsking(false);
    if (!result.ok) {
      setAskError(result.error);
      return;
    }
    const proposed = result.output.meaningFr.trim().slice(0, MAX_MEANING);
    if (proposed === '') {
      setAskError({ code: 'invalid_output' });
      return;
    }
    // Stored at once, even if the form is closed meanwhile: never asked twice (D-095).
    await drafts.save(meaningKey, proposed).catch(() => undefined);
    meaning.setText(proposed);
    setProposalCostUsd(result.costUsd);
  };

  const add = async () => {
    setAddition('saving');
    try {
      await meaning.flush();
      const result = await lexicon.add({
        expression,
        meaningFr: meaning.text,
        example: sentence,
        source: 'exercise',
      });
      if (!result.ok) {
        setAddition(result.reason);
        return;
      }
      meaning.reset('');
      setAddition(result.withCard ? 'added' : 'added-without-card');
    } catch {
      setAddition('failed');
    }
  };

  const message = addition === 'idle' || addition === 'saving' ? null : MESSAGES[addition];
  const done = addition === 'added' || addition === 'added-without-card';
  const words = expression.trim();
  const canAsk =
    server !== null &&
    !done &&
    meaning.ready &&
    meaning.text.trim() === '' &&
    proposalCostUsd === null &&
    words !== '' &&
    words.length <= MAX_WORD_EXPRESSION &&
    sentence.length <= MAX_WORD_SENTENCE;
  return (
    <div className="word-picker__form">
      <p lang="en" className="muted">
        {sentence}
      </p>
      <TextField
        label="Mot ou expression"
        lang="en"
        spellCheck={false}
        maxLength={MAX_EXPRESSION}
        value={expression}
        disabled={done}
        onChange={(event) => {
          setExpression(event.currentTarget.value);
        }}
      />
      <TextField
        label="Sens en français, dans cette phrase"
        maxLength={MAX_MEANING}
        value={meaning.text}
        disabled={!meaning.ready || done || asking}
        onChange={(event) => {
          meaning.setText(event.currentTarget.value);
        }}
      />
      {proposalCostUsd === null || done ? null : (
        <Notice title="Sens proposé par l’IA">
          <p>
            Vérifie-le ou corrige-le, puis ajoute-le à ton lexique. Coût :{' '}
            {formatUsd(proposalCostUsd)}.
          </p>
        </Notice>
      )}
      {askError === null ? null : (
        <Notice tone="error" title="Sens non obtenu">
          <p>{aiErrorMessage(askError)}</p>
        </Notice>
      )}
      {canAsk || asking ? (
        <>
          <p className="muted">
            {online
              ? `Sens proposé par l’IA, que tu confirmes : au plus ${formatMaxUsd(EXPLAIN_MAX_COST_USD)}.`
              : 'Connexion nécessaire pour demander le sens à l’IA.'}
          </p>
          <div className="button-row">
            <Button variant="secondary" disabled={!online || asking} onClick={() => void ask()}>
              {asking ? 'Recherche du sens…' : 'Demander le sens à l’IA'}
            </Button>
          </div>
        </>
      ) : null}
      {message === null ? null : (
        <Notice tone={message.tone}>
          <p>{message.text}</p>
        </Notice>
      )}
      <div className="button-row">
        {done ? null : (
          <Button
            disabled={addition === 'saving' || !meaning.ready || asking}
            onClick={() => void add()}
          >
            Ajouter à mon lexique
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          {done ? 'Fermer' : 'Annuler'}
        </Button>
      </div>
    </div>
  );
}
