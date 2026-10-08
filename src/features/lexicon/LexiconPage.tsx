import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import type { LexiconDocument } from '../../data/schemas/lexicon.ts';
import { MAX_EXAMPLE, MAX_EXPRESSION, MAX_MEANING } from '../../domain/lexicon.ts';
import { Button } from '../../ui/Button.tsx';
import { TextField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { useAppServices } from '../app-services.ts';
import { usePageTitle } from '../use-page-title.ts';

const SOURCES: Readonly<Record<LexiconDocument['source'], string>> = {
  correction: 'Correction',
  'expression-of-the-day': 'Expression du jour',
  manual: 'Ajoutée par toi',
  import: 'Importée',
};

type Addition =
  'idle' | 'saving' | 'added' | 'added-without-card' | 'duplicate' | 'invalid' | 'failed';

const ADDITION_MESSAGES = {
  added: { tone: 'success', text: 'Ajoutée, avec sa carte de révision.' },
  'added-without-card': {
    tone: 'success',
    text: 'Ajoutée. L’exemple ne contient pas l’expression telle quelle : pas de carte de révision.',
  },
  duplicate: { tone: 'error', text: 'Cette expression est déjà dans ton lexique.' },
  invalid: { tone: 'error', text: 'Il faut une expression et son sens en français.' },
  failed: { tone: 'error', text: 'Non ajoutée : le stockage du téléphone est peut-être plein.' },
} as const;

/**
 * "Mon lexique" (MOD-09): lexical chunks rather than isolated words (PED-10),
 * each with its meaning, an example, its source and a card. No duplicates.
 */
export function LexiconPage() {
  usePageTitle('Mon lexique');
  const { lexicon } = useAppServices();
  const entries = useLiveQuery(() => lexicon.list(), [lexicon]);
  return (
    <Page title="Mon lexique" subtitle="Expressions, collocations et formules à réemployer.">
      <AddEntry />
      <Sheet title="Mes expressions">
        {entries === undefined ? (
          <p role="status">Chargement…</p>
        ) : entries.length === 0 ? (
          <p className="muted">
            Aucune expression pour l’instant. Ajoute celles du jour depuis tes corrections, ou les
            tiennes ci-dessus.
          </p>
        ) : (
          <ul className="plain-list">
            {entries.map((entry) => (
              <Entry key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </Sheet>
    </Page>
  );
}

function AddEntry() {
  const { lexicon } = useAppServices();
  const [expression, setExpression] = useState('');
  const [meaningFr, setMeaningFr] = useState('');
  const [example, setExample] = useState('');
  const [addition, setAddition] = useState<Addition>('idle');

  const add = () => {
    setAddition('saving');
    lexicon.add({ expression, meaningFr, example, source: 'manual' }).then(
      (result) => {
        if (!result.ok) {
          setAddition(result.reason);
          return;
        }
        setAddition(result.withCard ? 'added' : 'added-without-card');
        setExpression('');
        setMeaningFr('');
        setExample('');
      },
      () => {
        setAddition('failed');
      },
    );
  };

  const message = addition === 'idle' || addition === 'saving' ? null : ADDITION_MESSAGES[addition];
  return (
    <Sheet title="Ajouter une expression">
      <TextField
        label="Expression"
        lang="en"
        spellCheck={false}
        maxLength={MAX_EXPRESSION}
        value={expression}
        onChange={(event) => {
          setExpression(event.currentTarget.value);
        }}
      />
      <TextField
        label="Sens en français"
        maxLength={MAX_MEANING}
        value={meaningFr}
        onChange={(event) => {
          setMeaningFr(event.currentTarget.value);
        }}
      />
      <TextField
        label="Exemple, qui contient l’expression"
        hint="Il sert à fabriquer la carte de révision : l’expression y est remplacée par un blanc."
        lang="en"
        spellCheck={false}
        maxLength={MAX_EXAMPLE}
        value={example}
        onChange={(event) => {
          setExample(event.currentTarget.value);
        }}
      />
      {message === null ? null : (
        <Notice tone={message.tone}>
          <p>{message.text}</p>
        </Notice>
      )}
      <div className="button-row">
        <Button disabled={addition === 'saving'} onClick={add}>
          Ajouter
        </Button>
      </div>
    </Sheet>
  );
}

function Entry({ entry }: { readonly entry: LexiconDocument }) {
  const { lexicon } = useAppServices();
  const [confirm, setConfirm] = useState(false);
  return (
    <li className="plain-list__item">
      <span className="plain-list__text">
        <strong lang="en">{entry.expression}</strong>
        <span>{entry.meaningFr}</span>
        {entry.example === '' ? null : (
          <span lang="en" className="muted">
            {entry.example}
          </span>
        )}
        <span className="muted">
          {SOURCES[entry.source]}
          {entry.cardId === null ? ' · sans carte' : ' · avec carte'}
        </span>
      </span>
      {confirm ? (
        <span className="button-row">
          <Button
            onClick={() => {
              void lexicon.remove(entry.id);
            }}
          >
            Retirer
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setConfirm(false);
            }}
          >
            Garder
          </Button>
        </span>
      ) : (
        <Button
          variant="secondary"
          aria-label={`Retirer ${entry.expression}`}
          onClick={() => {
            setConfirm(true);
          }}
        >
          Retirer…
        </Button>
      )}
    </li>
  );
}
