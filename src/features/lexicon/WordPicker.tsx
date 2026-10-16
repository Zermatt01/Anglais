import { useState } from 'react';
import { expressionBetween, MAX_EXPRESSION, MAX_MEANING, piecesOf } from '../../domain/lexicon.ts';
import { Button } from '../../ui/Button.tsx';
import { TextField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { useAppServices } from '../app-services.ts';
import { useDraft } from '../drafts/use-draft.ts';
import './word-picker.css';

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
 * learner, and the sentence as example; its card is the sentence with a gap.
 * Nothing is written before "Ajouter".
 */
export function WordPicker({ sentence }: { readonly sentence: string }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{ first: number; last: number } | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
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
        <WordForm key={chosen} expression={chosen} sentence={sentence} onClose={close} />
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
          disabled={expression === ''}
          onClick={() => {
            setChosen(expression);
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
  const { lexicon } = useAppServices();
  const [expression, setExpression] = useState(picked);
  // The meaning is a draft: typed text is never lost (UI-03).
  const meaning = useDraft(`lexicon-word:${picked}|${sentence.slice(0, KEY_SENTENCE)}`, '');
  const [addition, setAddition] = useState<Addition>('idle');

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
        disabled={!meaning.ready || done}
        onChange={(event) => {
          meaning.setText(event.currentTarget.value);
        }}
      />
      {message === null ? null : (
        <Notice tone={message.tone}>
          <p>{message.text}</p>
        </Notice>
      )}
      <div className="button-row">
        {done ? null : (
          <Button disabled={addition === 'saving' || !meaning.ready} onClick={() => void add()}>
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
