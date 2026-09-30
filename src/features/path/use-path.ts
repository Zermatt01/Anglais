/** Reactive reads of the path: progress, answers, content (MOD-04). */
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { hasContent, loadNotionContent } from '../../content/index.ts';
import type { NotionContent } from '../../content/schema.ts';
import type { StoredProgress } from '../../data/repositories/path-repository.ts';
import type { ExerciseAttempt } from '../../data/schemas/exercise-attempts.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { NotionProgressValues } from '../../domain/curriculum/progress.ts';
import { useAppServices } from '../app-services.ts';

/** Readable progress of every notion; `undefined` while loading. */
export function useAllProgress(): ReadonlyMap<NotionId, NotionProgressValues> | undefined {
  const { path } = useAppServices();
  return useLiveQuery(() => path.allProgress(), [path]);
}

export function useNotionProgress(notionId: NotionId): StoredProgress | undefined {
  const { path } = useAppServices();
  return useLiveQuery(() => path.progress(notionId), [path, notionId]);
}

export function useNotionAttempts(notionId: NotionId): ExerciseAttempt[] | undefined {
  const { path } = useAppServices();
  return useLiveQuery(() => path.attempts(notionId), [path, notionId]);
}

export type ContentState =
  | { readonly state: 'loading' }
  | { readonly state: 'loaded'; readonly content: NotionContent }
  /** The notion arrives in a later phase. */
  | { readonly state: 'missing' }
  /** The chunk could not be loaded (offline before the first visit, for instance). */
  | { readonly state: 'failed' };

/** Content of a notion, loaded on demand. */
export function useNotionContent(notionId: NotionId): ContentState {
  const [loaded, setLoaded] = useState<{ notionId: NotionId; state: ContentState } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loading = loadNotionContent(notionId);
    if (loading === null) return;
    loading.then(
      (content) => {
        if (!cancelled) setLoaded({ notionId, state: { state: 'loaded', content } });
      },
      () => {
        if (!cancelled) setLoaded({ notionId, state: { state: 'failed' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [notionId]);

  if (!hasContent(notionId)) return { state: 'missing' };
  return loaded?.notionId === notionId ? loaded.state : { state: 'loading' };
}
