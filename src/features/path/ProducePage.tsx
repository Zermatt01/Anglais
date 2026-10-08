import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import { NOTION_USES } from '../../content/notion-use.ts';
import type { NotionContent } from '../../content/schema.ts';
import { fallbackHintOf } from '../../content/taxonomy.ts';
import type { ProductionDocument } from '../../data/schemas/productions.ts';
import { notionCardContents } from '../../domain/cards/notion-cards.ts';
import type { ProgressEvent } from '../../domain/curriculum/engine.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { NotionProgressValues } from '../../domain/curriculum/progress.ts';
import { TextAreaField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useAppServices } from '../app-services.ts';
import { CorrectionAction } from '../correction/CorrectionAction.tsx';
import { CorrectionView } from '../correction/CorrectionView.tsx';
import { useCorrection } from '../correction/use-correction.ts';
import { formatDateTime } from '../dates.ts';
import { useDraft, type DraftSaveState } from '../drafts/use-draft.ts';
import { NotFoundPage } from '../not-found/NotFoundPage.tsx';
import { pathTo } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { eventMessage } from './labels.ts';
import { useNotionContent, useNotionProgress } from './use-path.ts';
import { useNotionParam } from './use-notion-param.ts';
import './path.css';

const STATUS: Readonly<Record<DraftSaveState, string>> = {
  idle: '',
  pending: 'Modification en cours…',
  saved: 'Texte enregistré sur ce téléphone.',
  error: 'Texte non enregistré : le stockage du téléphone est peut-être plein.',
};

/** Where the step-5 text of a notion is kept until it is sent (D-076). */
const produceDraftKey = (notionId: NotionId) => `path-produce:${notionId}`;

/** Productions needed in a row to acquire the notion (PEDAGOGY §3.3). */
const GOOD_IN_A_ROW = 2;

function instructionOf(notionId: NotionId, content: NotionContent) {
  const title = NOTION_TITLES[notionId].replaceAll('_', '');
  return {
    text: `Écris deux ou trois phrases personnelles qui emploient la notion « ${title} ». Pistes : ${content.producePrompts.join(' ')}`.slice(
      0,
      600,
    ),
    language: 'fr' as const,
  };
}

function requestOf(notionId: NotionId, production: ProductionDocument) {
  return {
    module: 'path-produce' as const,
    instruction: production.prompt,
    reference: null,
    targetNotionId: notionId,
    text: production.text,
  };
}

/**
 * Good productions in a row since the notion entered step 5, the most recent
 * last. A production whose use of the notion is not proven counts neither way (D-088).
 */
function goodInARow(
  productions: readonly ProductionDocument[],
  progress: NotionProgressValues | null,
): number {
  if (progress === null) return 0;
  const counted = productions
    .filter(
      (entry) =>
        entry.status === 'corrected' &&
        entry.result !== null &&
        entry.createdAt >= progress.stepEnteredAt,
    )
    .sort((a, b) => a.createdAt - b.createdAt);
  let streak = 0;
  for (const entry of counted) streak = entry.result === 'correct' ? streak + 1 : 0;
  return Math.min(streak, GOOD_IN_A_ROW);
}

/**
 * Step 5, "Produire" (CUR-03): two or three personal sentences using the
 * notion, corrected by the model on request (D-076). Two good productions in
 * a row make the notion acquired, and its cards enter the Reprises (CUR-09).
 */
export function ProducePage() {
  const notionId = useNotionParam();
  usePageTitle(
    notionId === null ? null : `Production : ${NOTION_TITLES[notionId].replaceAll('_', '')}`,
  );
  if (notionId === null) return <NotFoundPage />;
  return <ProduceView notionId={notionId} />;
}

function ProduceView({ notionId }: { readonly notionId: NotionId }) {
  const content = useNotionContent(notionId);
  const stored = useNotionProgress(notionId);
  const { productions } = useAppServices();
  const entries = useLiveQuery(
    async () =>
      (await productions.list('path-produce')).filter(
        (entry) => entry.context.notionId === notionId,
      ),
    [productions, notionId],
  );
  const title = <RichText text={NOTION_TITLES[notionId]} />;
  const back = <Link to={pathTo.notion(notionId)}>Retour à la notion</Link>;
  if (content.state === 'failed') {
    return (
      <Page title={title} subtitle={back}>
        <Notice tone="error" title="Notion indisponible">
          <p>
            Reconnecte-toi une fois à Internet pour que l’application l’enregistre, puis réessaie.
          </p>
        </Notice>
      </Page>
    );
  }
  if (content.state !== 'loaded' || stored === undefined || entries === undefined) {
    return (
      <Page title={title} subtitle={back}>
        <p role="status">Chargement…</p>
      </Page>
    );
  }
  const progress = stored.state === 'valid' ? stored.values : null;
  return (
    <Page title={title} subtitle={back}>
      <Produce
        notionId={notionId}
        content={content.content}
        progress={progress}
        entries={entries}
      />
    </Page>
  );
}

function Produce({
  notionId,
  content,
  progress,
  entries,
}: {
  readonly notionId: NotionId;
  readonly content: NotionContent;
  readonly progress: NotionProgressValues | null;
  readonly entries: readonly ProductionDocument[];
}) {
  const { productions, clock } = useAppServices();
  const draftKey = produceDraftKey(notionId);
  const draft = useDraft(draftKey, '');
  const openedAt = useRef(clock.now());
  const correction = useCorrection();
  const [shown, setShown] = useState<string | null>(null);
  const [events, setEvents] = useState<readonly ProgressEvent[]>([]);
  const [empty, setEmpty] = useState(false);
  const [storeFailed, setStoreFailed] = useState(false);
  const atStepFive =
    progress !== null &&
    progress.step === 5 &&
    (progress.status === 'in_progress' || progress.status === 'to_consolidate');
  const sources = content.exercises.flatMap((exercise) =>
    exercise.kind === 'translate' ? [exercise] : [],
  );
  const context = {
    reference: null,
    fallbackHint: fallbackHintOf,
    notionCards: notionCardContents(notionId, sources),
    notionUse: NOTION_USES[notionId],
  };

  const send = async (production: ProductionDocument) => {
    const run = await correction.correct(production.id, requestOf(notionId, production), context);
    if (run.state === 'done') setEvents(run.outcome.events);
  };

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
        module: 'path-produce',
        prompt: instructionOf(notionId, content),
        context: { notionId, itemId: null, tier: null, unstudied: false, hintUsed: false },
        text,
        durationMs: clock.now() - openedAt.current,
        draftKey,
      });
    } catch {
      setStoreFailed(true);
      return;
    }
    draft.reset('');
    setShown(production.id);
    setEvents([]);
    await send(production);
  };

  const shownEntry = entries.find((entry) => entry.id === shown);

  return (
    <>
      <Sheet title="Étape : Produire">
        <p>Écris deux ou trois phrases personnelles qui emploient cette notion. Par exemple :</p>
        <ul className="lesson-list">
          {content.producePrompts.map((prompt) => (
            <li key={prompt}>
              <RichText text={prompt} />
            </li>
          ))}
        </ul>
        {atStepFive ? (
          <p className="muted">
            {`Productions réussies d’affilée : ${String(goodInARow(entries, progress))} sur ${String(GOOD_IN_A_ROW)}. Une production réussie emploie la notion, sans erreur sur elle.`}
          </p>
        ) : null}
        {draft.unreadable ? (
          <Notice tone="error" title="Ancien brouillon illisible">
            <p>Il est conservé à part et reste inclus dans l’export de tes données.</p>
          </Notice>
        ) : null}
        <TextAreaField
          label="Tes phrases"
          lang="en"
          spellCheck={false}
          rows={6}
          maxLength={2_000}
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
            <p>Écris tes phrases avant de demander la correction.</p>
          </Notice>
        ) : null}
        {storeFailed ? (
          <Notice tone="error" title="Texte non enregistré">
            <p>Le stockage du téléphone est peut-être plein. Ton brouillon est gardé : réessaie.</p>
          </Notice>
        ) : null}
        <CorrectionAction
          run={shown === null ? correction.run : { state: 'idle' }}
          sending={correction.sending}
          available={correction.available}
          disabled={!draft.ready || correction.run.state === 'running'}
          label="Corriger mes phrases"
          onCorrect={() => {
            void correction.once(submit);
          }}
        />
        <div className="button-row">
          <Link className="button button--secondary" to={pathTo.lesson(notionId)}>
            Relire la leçon
          </Link>
        </div>
      </Sheet>

      {shownEntry === undefined ? null : (
        <Sheet title="Correction">
          <ProductionResult
            production={shownEntry}
            correction={correction}
            onRetry={() => {
              void correction.once(() => send(shownEntry));
            }}
          />
          {events.map((event) => {
            const message = eventMessage(event);
            return message === null ? null : (
              <Notice key={event.type} tone="success" title={message.title}>
                <p>{message.body}</p>
              </Notice>
            );
          })}
        </Sheet>
      )}

      <PreviousProductions
        notionId={notionId}
        entries={entries.filter((entry) => entry.id !== shown)}
        context={context}
      />
    </>
  );
}

function ProductionResult({
  production,
  correction,
  onRetry,
}: {
  readonly production: ProductionDocument;
  readonly correction: ReturnType<typeof useCorrection>;
  readonly onRetry: () => void;
}) {
  if (production.status !== 'corrected') {
    return (
      <>
        <p lang="en" className="marked-text">
          {production.text}
        </p>
        {correction.run.state === 'running' ? (
          <p role="status">Correction en cours…</p>
        ) : (
          <CorrectionAction
            run={correction.run}
            sending={correction.sending}
            available={correction.available}
            label="Réessayer la correction"
            onCorrect={onRetry}
          />
        )}
      </>
    );
  }
  return (
    <>
      {production.correction === null ? null : (
        <p className="correction__summary">
          {production.result === 'correct'
            ? 'Production réussie : la notion est bien employée, sans erreur sur elle.'
            : production.result === null
              ? 'L’application n’a pas pu vérifier que ton texte emploie la notion : cette production ne compte pas pour l’étape, ni en bien ni en mal. Emploie-la clairement, comme dans les exemples de la leçon.'
              : 'La notion a une erreur dans ton texte : on la revoit dans la correction.'}
        </p>
      )}
      <CorrectionView productionId={production.id} />
    </>
  );
}

function PreviousProductions({
  notionId,
  entries,
  context,
}: {
  readonly notionId: NotionId;
  readonly entries: readonly ProductionDocument[];
  readonly context: Parameters<ReturnType<typeof useCorrection>['correct']>[2];
}) {
  const correction = useCorrection();
  const [open, setOpen] = useState<string | null>(null);
  if (entries.length === 0) return null;
  return (
    <Sheet title="Productions précédentes">
      <ul className="plain-list">
        {entries.slice(0, 10).map((entry) => (
          <li key={entry.id} className="plain-list__item plain-list__item--stacked">
            <span className="muted">{formatDateTime(entry.createdAt)}</span>
            {open === entry.id ? (
              <ProductionResult
                production={entry}
                correction={correction}
                onRetry={() => {
                  void correction.once(() =>
                    correction.correct(entry.id, requestOf(notionId, entry), context),
                  );
                }}
              />
            ) : (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  setOpen(entry.id);
                }}
              >
                {entry.status === 'corrected' ? 'Voir la correction' : 'Voir et corriger'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
