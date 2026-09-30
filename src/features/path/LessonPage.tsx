import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { NOTION_REFERENCES, NOTION_TITLES } from '../../content/catalog.ts';
import { formatReferences } from '../../content/references.ts';
import type { Lesson } from '../../content/schema.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { RichText } from '../../ui/RichText.tsx';
import { SpeakButton } from '../../ui/SpeakButton.tsx';
import { Timeline } from '../../ui/Timeline.tsx';
import { useAppServices } from '../app-services.ts';
import { NotFoundPage } from '../not-found/NotFoundPage.tsx';
import { pathTo } from '../paths.ts';
import { useSpeech } from '../speech/use-speech.ts';
import { usePageTitle } from '../use-page-title.ts';
import { useNotionContent, useNotionProgress } from './use-path.ts';
import { useNotionParam } from './use-notion-param.ts';
import './path.css';

function FormTable({ form }: { readonly form: Lesson['form'] }) {
  return (
    <div className="table-scroll">
      <table className="lesson-table">
        <caption>{form.caption}</caption>
        <thead>
          <tr>
            {form.columns.map((column) => (
              <th key={column} scope="col">
                <RichText text={column} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {form.rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    <RichText text={cell} />
                  </th>
                ) : (
                  <td key={index}>
                    <RichText text={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Examples({ examples }: { readonly examples: Lesson['examples'] }) {
  const speech = useSpeech();
  return (
    <ul className="plain-list">
      {examples.map((example) => (
        <li key={example.en} className="plain-list__item example">
          <span className="plain-list__text">
            <span lang="en" className="example__en">
              {example.en}
            </span>
            <span className="muted">{example.fr}</span>
          </span>
          {speech.available ? (
            <SpeakButton
              text={example.en}
              onSpeak={() => {
                speech.speak(example.en);
              }}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Step 1, "Comprendre": the lesson, readable in 2 to 3 minutes (CUR-03). */
export function LessonPage() {
  const notionId = useNotionParam();
  usePageTitle(notionId === null ? null : `Leçon : ${NOTION_TITLES[notionId].replaceAll('_', '')}`);
  if (notionId === null) return <NotFoundPage />;
  return <LessonView notionId={notionId} />;
}

function LessonView({ notionId }: { readonly notionId: NotionId }) {
  const content = useNotionContent(notionId);
  const stored = useNotionProgress(notionId);
  const { path } = useAppServices();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const title = <RichText text={NOTION_TITLES[notionId]} />;
  const references = formatReferences(NOTION_REFERENCES[notionId] ?? []);

  if (content.state !== 'loaded') {
    return (
      <Page title={title}>
        {content.state === 'failed' ? (
          <Notice tone="error" title="Leçon indisponible">
            <p>
              La leçon n’a pas pu être chargée. Reconnecte-toi une fois à Internet pour que
              l’application l’enregistre, puis réessaie.
            </p>
          </Notice>
        ) : (
          <p role="status">Chargement de la leçon…</p>
        )}
      </Page>
    );
  }

  const { lesson } = content.content;
  const progress = stored?.state === 'valid' ? stored.values : null;
  const atLesson =
    stored?.state === 'absent' ||
    (progress !== null && (progress.status === 'not_started' || progress.step === 1));

  return (
    <Page title={title} subtitle={<Link to={pathTo.notion(notionId)}>Retour à la notion</Link>}>
      <Sheet title="L’essentiel">
        <p>
          <RichText text={lesson.intro} />
        </p>
        <ul className="lesson-list">
          {lesson.usage.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
        {lesson.timeline === undefined ? null : (
          <Timeline descriptionFr={lesson.timeline.descriptionFr} marks={lesson.timeline.marks} />
        )}
      </Sheet>

      <Sheet title="La forme">
        <FormTable form={lesson.form} />
      </Sheet>

      <Sheet title={<RichText text={lesson.contrast.title} />}>
        <ul className="lesson-list">
          {lesson.contrast.points.map((point) => (
            <li key={point}>
              <RichText text={point} />
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet title="Pièges pour les francophones">
        <ul className="lesson-list">
          {lesson.pitfalls.map((pitfall) => (
            <li key={pitfall}>
              <RichText text={pitfall} />
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet title="Exemples">
        <Examples examples={lesson.examples} />
        {references === null ? null : <p className="muted">{references}</p>}
      </Sheet>

      {atLesson ? (
        <div className="button-row">
          {failed ? (
            <Notice tone="error" title="Étape non enregistrée">
              <p>
                Réessaie. Si le problème continue, exporte tes données puis recharge l’application.
              </p>
            </Notice>
          ) : null}
          <Button
            onClick={() => {
              path.finishLesson(notionId).then(
                () => {
                  void navigate(pathTo.practice(notionId));
                },
                () => {
                  setFailed(true);
                },
              );
            }}
          >
            J’ai compris, je passe à la reconnaissance
          </Button>
        </div>
      ) : null}
    </Page>
  );
}
