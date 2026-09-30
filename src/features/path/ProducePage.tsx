import { Link } from 'react-router';
import { NOTION_TITLES } from '../../content/catalog.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import { TextAreaField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { useDraft, type DraftSaveState } from '../drafts/use-draft.ts';
import { NotFoundPage } from '../not-found/NotFoundPage.tsx';
import { pathTo } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { useNotionContent } from './use-path.ts';
import { useNotionParam } from './use-notion-param.ts';
import './path.css';

const STATUS: Readonly<Record<DraftSaveState, string>> = {
  idle: '',
  pending: 'Modification en cours…',
  saved: 'Texte enregistré sur ce téléphone.',
  error: 'Texte non enregistré : le stockage du téléphone est peut-être plein.',
};

/** Where the step-5 text of a notion is kept until it can be corrected (D-076). */
const produceDraftKey = (notionId: NotionId) => `path-produce:${notionId}`;

/**
 * Step 5, "Produire": two or three personal sentences using the notion
 * (CUR-03). Their correction by the AI comes with the written production
 * (phase 4, D-076): until then the text is kept on the device, never lost.
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
  const draft = useDraft(produceDraftKey(notionId), '');
  const title = <RichText text={NOTION_TITLES[notionId]} />;

  return (
    <Page title={title} subtitle={<Link to={pathTo.notion(notionId)}>Retour à la notion</Link>}>
      <Sheet title="Étape : Produire">
        <p>Écris deux ou trois phrases personnelles qui emploient cette notion. Par exemple :</p>
        {content.state === 'loaded' ? (
          <ul className="lesson-list">
            {content.content.producePrompts.map((prompt) => (
              <li key={prompt}>
                <RichText text={prompt} />
              </li>
            ))}
          </ul>
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
            draft.setText(event.currentTarget.value);
          }}
          status={STATUS[draft.saveState]}
        />
        <Notice title="Correction à venir">
          <p>
            La correction de tes phrases par l’IA arrive avec la prochaine version de l’application.
            Ton texte est enregistré sur ce téléphone : il sera là pour être corrigé. En attendant,
            tu peux relire la leçon ou avancer sur une autre notion.
          </p>
        </Notice>
        <div className="button-row">
          <Link className="button button--secondary" to={pathTo.lesson(notionId)}>
            Relire la leçon
          </Link>
        </div>
      </Sheet>
    </Page>
  );
}
