import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { hasContent } from '../../content/index.ts';
import { CATEGORY_TEXTS } from '../../content/taxonomy.ts';
import { ruleBook, type RuleSheet } from '../../domain/errors/statistics.ts';
import type { ErrorCategory } from '../../domain/taxonomy.ts';
import { Button } from '../../ui/Button.tsx';
import { TextAreaField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { errorRecordOf } from '../correction/request.ts';
import { formatDateTime } from '../dates.ts';
import { useDraft } from '../drafts/use-draft.ts';
import { PATHS, pathTo } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import '../correction/correction.css';

const MAX_NOTE = 5_000;

/**
 * The rule book (MOD-10): one sheet per category of the learner's own
 * errors, the most recent trouble first, with examples, the lessons that
 * teach them and a personal note.
 */
export function RuleBookPage() {
  usePageTitle('Carnet de règles');
  const { productions, ruleNotes, clock } = useAppServices();
  const errors = useLiveQuery(() => productions.errorsSince(), [productions]);
  const notes = useLiveQuery(() => ruleNotes.all(), [ruleNotes]);
  if (errors === undefined || notes === undefined) {
    return (
      <Page title="Carnet de règles">
        <p role="status">Chargement…</p>
      </Page>
    );
  }
  const sheets = ruleBook(errors.map(errorRecordOf), clock.now());
  return (
    <Page title="Carnet de règles" subtitle="Tes propres erreurs, rangées par catégorie.">
      {sheets.length === 0 ? (
        <Sheet title="Aucune fiche pour l’instant">
          <p>
            Les fiches se construisent à partir des erreurs relevées dans tes corrections : écris
            quelques phrases dans le <Link to={PATHS.journal}>journal</Link> ou le{' '}
            <Link to={PATHS.theme}>Thème</Link>.
          </p>
        </Sheet>
      ) : (
        sheets.map((sheet) => (
          <CategorySheet
            key={sheet.category}
            sheet={sheet}
            note={notes.get(sheet.category) ?? ''}
          />
        ))
      )}
    </Page>
  );
}

function CategorySheet({ sheet, note }: { readonly sheet: RuleSheet; readonly note: string }) {
  const texts = CATEGORY_TEXTS[sheet.category];
  return (
    <Sheet title={texts.label}>
      <p>
        <RichText text={texts.definition} />
      </p>
      <p className="muted">
        {`${String(sheet.recent)} erreur(s) ces 30 derniers jours, ${String(sheet.total)} en tout.`}
      </p>
      <ul className="correction__list">
        {sheet.examples.map((example) => (
          <li key={`${example.productionId}:${example.segment}`} className="correction__item">
            <p lang="en" className="correction__change">
              <s>{example.segment}</s> → <strong>{example.correction}</strong>
            </p>
            <p>
              <RichText text={example.rule} />
            </p>
            <p className="muted">{formatDateTime(example.at)}</p>
          </li>
        ))}
      </ul>
      {sheet.notions.some(hasContent) ? (
        <p>
          Leçons :{' '}
          {sheet.notions.filter(hasContent).map((notionId, index) => (
            <span key={notionId}>
              {index > 0 ? ', ' : ''}
              <Link to={pathTo.lesson(notionId)}>
                <RichText text={NOTION_TITLES[notionId]} />
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      <NoteEditor category={sheet.category} savedNote={note} />
    </Sheet>
  );
}

function NoteEditor({
  category,
  savedNote,
}: {
  readonly category: ErrorCategory;
  readonly savedNote: string;
}) {
  const { ruleNotes } = useAppServices();
  const draft = useDraft(`rule-note:${category}`, savedNote);
  const [state, setState] = useState<'idle' | 'saved' | 'failed'>('idle');
  const changed = draft.text !== savedNote;
  return (
    <>
      {draft.unreadable ? (
        <Notice tone="error" title="Ancien brouillon illisible">
          <p>Il est conservé à part et reste inclus dans l’export de tes données.</p>
        </Notice>
      ) : null}
      <TextAreaField
        label="Ma note"
        hint="Ta façon de retenir la règle, avec tes mots."
        rows={3}
        maxLength={MAX_NOTE}
        value={draft.text}
        disabled={!draft.ready}
        onChange={(event) => {
          setState('idle');
          draft.setText(event.currentTarget.value);
        }}
        status={
          state === 'saved'
            ? 'Note enregistrée.'
            : state === 'failed'
              ? 'Note non enregistrée : le stockage du téléphone est peut-être plein.'
              : ''
        }
      />
      <div className="button-row">
        <Button
          variant="secondary"
          disabled={!changed}
          onClick={() => {
            const text = draft.text;
            ruleNotes.save(category, text).then(
              async () => {
                await draft.discard(text);
                setState('saved');
              },
              () => {
                setState('failed');
              },
            );
          }}
        >
          Enregistrer la note
        </Button>
      </div>
    </>
  );
}
