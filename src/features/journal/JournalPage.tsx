import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { JOURNAL_QUESTIONS } from '../../content/journal.ts';
import type { JournalQuestion } from '../../content/schema.ts';
import { fallbackHintOf } from '../../content/taxonomy.ts';
import type { ProductionDocument } from '../../data/schemas/productions.ts';
import { pickJournalQuestion } from '../../domain/journal.ts';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { Button } from '../../ui/Button.tsx';
import { TextAreaField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { useAppServices } from '../app-services.ts';
import { CorrectionAction } from '../correction/CorrectionAction.tsx';
import { CorrectionView } from '../correction/CorrectionView.tsx';
import { useCorrection } from '../correction/use-correction.ts';
import { formatDateTime } from '../dates.ts';
import { useDraft, type DraftSaveState } from '../drafts/use-draft.ts';
import { useSettings } from '../settings/use-settings.ts';
import { usePageTitle } from '../use-page-title.ts';

const STATUS: Readonly<Record<DraftSaveState, string>> = {
  idle: '',
  pending: 'Modification en cours…',
  saved: 'Texte enregistré sur ce téléphone.',
  error: 'Texte non enregistré : le stockage du téléphone est peut-être plein.',
};

const MAX_TEXT = 2_000;

/** When each question was last answered. */
function lastAsked(entries: readonly ProductionDocument[]): Map<string, number> {
  const times = new Map<string, number>();
  for (const entry of entries) {
    const id = entry.context.itemId;
    if (id !== null) times.set(id, Math.max(entry.createdAt, times.get(id) ?? 0));
  }
  return times;
}

const journalRequest = (production: ProductionDocument) => ({
  module: 'journal' as const,
  instruction: production.prompt,
  reference: null,
  targetNotionId: null,
  text: production.text,
});

/** The journal (MOD-07): three to five free sentences answering a question, corrected in two steps. */
export function JournalPage() {
  usePageTitle('Journal');
  const { productions } = useAppServices();
  const entries = useLiveQuery(() => productions.list('journal'), [productions]);
  const settings = useSettings();
  if (entries === undefined || settings === undefined) {
    return (
      <Page title="Journal">
        <p role="status">Chargement…</p>
      </Page>
    );
  }
  return <Journal entries={entries} domains={settings.values.learnerProfile.domains} />;
}

function Journal({
  entries,
  domains,
}: {
  readonly entries: readonly ProductionDocument[];
  readonly domains: typeof DEFAULT_SETTINGS.learnerProfile.domains;
}) {
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  // The question is chosen once: a later change of the entries never swaps it while typing.
  const [questionId, setQuestionId] = useState<string | null>(() =>
    pickJournalQuestion(JOURNAL_QUESTIONS, lastAsked(entries), domains),
  );
  const [shown, setShown] = useState<string | null>(null);
  const correction = useCorrection();
  const question = JOURNAL_QUESTIONS.find((entry) => entry.id === questionId) ?? null;

  const other = () => {
    if (questionId === null) return;
    const next = new Set([...skipped, questionId]);
    const id =
      pickJournalQuestion(JOURNAL_QUESTIONS, lastAsked(entries), domains, next) ??
      pickJournalQuestion(JOURNAL_QUESTIONS, lastAsked(entries), domains, new Set([questionId]));
    setSkipped(next.size >= JOURNAL_QUESTIONS.length ? new Set() : next);
    setQuestionId(id);
  };

  return (
    <Page title="Journal" subtitle="Trois à cinq phrases, corrigées en deux temps.">
      {shown === null && question !== null ? (
        <Entry
          key={question.id}
          question={question}
          correction={correction}
          onOther={other}
          onSubmitted={setShown}
        />
      ) : null}
      {shown === null ? null : (
        <Sheet title="Correction">
          <ShownCorrection
            productionId={shown}
            entries={entries}
            correction={correction}
            onNext={() => {
              correction.reset();
              setShown(null);
              setQuestionId(pickJournalQuestion(JOURNAL_QUESTIONS, lastAsked(entries), domains));
            }}
          />
        </Sheet>
      )}
      <Previous entries={entries.filter((entry) => entry.id !== shown)} />
    </Page>
  );
}

type Correction = ReturnType<typeof useCorrection>;

function Entry({
  question,
  correction,
  onOther,
  onSubmitted,
}: {
  readonly question: JournalQuestion;
  readonly correction: Correction;
  readonly onOther: () => void;
  readonly onSubmitted: (productionId: string) => void;
}) {
  const { productions, clock } = useAppServices();
  const draftKey = `journal:${question.id}`;
  const draft = useDraft(draftKey, '');
  const openedAt = useRef(clock.now());
  const [french, setFrench] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [storeFailed, setStoreFailed] = useState(false);
  const { run, correct, available } = correction;

  const submit = async () => {
    const text = draft.text.trim();
    if (text === '') {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    setStoreFailed(false);
    await draft.flush();
    let production: ProductionDocument;
    try {
      production = await productions.submit({
        module: 'journal',
        prompt: { text: question.en, language: 'en' },
        context: {
          notionId: null,
          itemId: question.id,
          tier: null,
          unstudied: false,
          hintUsed: false,
        },
        text,
        durationMs: clock.now() - openedAt.current,
        draftKey,
      });
    } catch {
      setStoreFailed(true);
      return;
    }
    draft.reset('');
    onSubmitted(production.id);
    await correct(production.id, journalRequest(production), {
      reference: null,
      fallbackHint: fallbackHintOf,
    });
  };

  return (
    <Sheet title="Question du jour">
      <p className="exercise__sentence" lang="en">
        {question.en}
      </p>
      {french ? <p className="muted">{question.fr}</p> : null}
      <div className="button-row">
        <Button
          variant="secondary"
          onClick={() => {
            setFrench((value) => !value);
          }}
        >
          {french ? 'Masquer le français' : 'Voir en français'}
        </Button>
        <Button variant="secondary" onClick={onOther}>
          Autre question
        </Button>
      </div>
      {draft.unreadable ? (
        <Notice tone="error" title="Ancien brouillon illisible">
          <p>Il est conservé à part et reste inclus dans l’export de tes données.</p>
        </Notice>
      ) : null}
      <TextAreaField
        label="Ton texte, en anglais"
        hint="Trois à cinq phrases. Écris sans traduire mot à mot : la correction viendra ensuite."
        lang="en"
        spellCheck={false}
        rows={7}
        maxLength={MAX_TEXT}
        value={draft.text}
        disabled={!draft.ready}
        onChange={(event) => {
          setEmpty(false);
          draft.setText(event.currentTarget.value);
        }}
        status={STATUS[draft.saveState]}
      />
      {empty ? (
        <Notice tone="error" title="Texte vide">
          <p>Écris quelques phrases avant de demander la correction.</p>
        </Notice>
      ) : null}
      {storeFailed ? (
        <Notice tone="error" title="Texte non enregistré">
          <p>Le stockage du téléphone est peut-être plein. Ton brouillon est gardé : réessaie.</p>
        </Notice>
      ) : null}
      <CorrectionAction
        run={run}
        available={available}
        disabled={!draft.ready}
        label="Corriger mon texte"
        onCorrect={() => {
          void submit();
        }}
      />
    </Sheet>
  );
}

/** The production just sent: its correction, or what to do if it did not come. */
function ShownCorrection({
  productionId,
  entries,
  correction,
  onNext,
}: {
  readonly productionId: string;
  readonly entries: readonly ProductionDocument[];
  readonly correction: Correction;
  readonly onNext: () => void;
}) {
  const entry = entries.find((production) => production.id === productionId);
  return (
    <>
      {entry === undefined || entry.status === 'corrected' ? (
        <CorrectionView productionId={productionId} />
      ) : (
        <PendingCorrection production={entry} correction={correction} />
      )}
      <div className="button-row">
        <Button variant="secondary" onClick={onNext}>
          Nouvelle entrée
        </Button>
      </div>
    </>
  );
}

/**
 * A production whose correction is running, or did not come (the call failed,
 * or the app was closed during it): "Réessayer", on request only (COST-01).
 */
function PendingCorrection({
  production,
  correction,
}: {
  readonly production: ProductionDocument;
  readonly correction: Correction;
}) {
  const { run, correct, available } = correction;
  return (
    <>
      <p lang="en" className="marked-text">
        {production.text}
      </p>
      {run.state === 'running' ? (
        <p role="status">Correction en cours…</p>
      ) : (
        <CorrectionAction
          run={run}
          available={available}
          label="Réessayer la correction"
          onCorrect={() => {
            void correct(production.id, journalRequest(production), {
              reference: null,
              fallbackHint: fallbackHintOf,
            });
          }}
        />
      )}
    </>
  );
}

function Previous({ entries }: { readonly entries: readonly ProductionDocument[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const correction = useCorrection();
  if (entries.length === 0) return null;
  return (
    <Sheet title="Entrées précédentes">
      <ul className="plain-list">
        {entries.slice(0, 20).map((entry) => (
          <li key={entry.id} className="plain-list__item plain-list__item--stacked">
            <span className="plain-list__text">
              <span className="muted">{formatDateTime(entry.createdAt)}</span>
              <span lang="en">{entry.prompt.text}</span>
            </span>
            {open === entry.id ? (
              entry.status === 'corrected' ? (
                <CorrectionView productionId={entry.id} />
              ) : (
                <PendingCorrection production={entry} correction={correction} />
              )
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setOpen(entry.id);
                }}
              >
                {entry.status === 'corrected' ? 'Voir la correction' : 'Voir et corriger'}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
