/**
 * Registry of the curriculum content (CUR-01): adding a notion means adding
 * its folder and one line here, never changing the logic.
 *
 * Each notion is a separate chunk, loaded when it is opened (the service
 * worker precaches them all for offline use), and validated with its schema
 * the first time (ARC-05).
 */
import type { NotionId } from '../domain/curriculum/notion-id.ts';
import { notionContentSchema, type NotionContent, type NotionContentInput } from './schema.ts';

type Loader = () => Promise<NotionContentInput>;

const LOADERS: Readonly<Partial<Record<NotionId, Loader>>> = {
  'tense-present-continuous': () =>
    import('./notions/tense-present-continuous/index.ts').then((module) => module.CONTENT),
};

/** Notions whose content exists, in any order. */
export const NOTIONS_WITH_CONTENT = Object.keys(LOADERS) as NotionId[];

export function hasContent(notionId: NotionId): boolean {
  return LOADERS[notionId] !== undefined;
}

const cache = new Map<NotionId, Promise<NotionContent>>();

/** Content of a notion, validated; `null` when the notion has no content yet. */
export function loadNotionContent(notionId: NotionId): Promise<NotionContent> | null {
  const loader = LOADERS[notionId];
  if (loader === undefined) return null;
  let loaded = cache.get(notionId);
  if (loaded === undefined) {
    loaded = loader().then((raw) => notionContentSchema.parse(raw));
    // A failed load (offline without the chunk) may be retried later.
    loaded.catch(() => cache.delete(notionId));
    cache.set(notionId, loaded);
  }
  return loaded;
}
