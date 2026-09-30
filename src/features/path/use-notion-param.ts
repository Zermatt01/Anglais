import { useParams } from 'react-router';
import { hasContent } from '../../content/index.ts';
import { isNotionId, type NotionId } from '../../domain/curriculum/notion-id.ts';

/** The notion of the address, or `null` when it is unknown or has no content yet. */
export function useNotionParam(): NotionId | null {
  const { notionId } = useParams();
  return notionId !== undefined && isNotionId(notionId) && hasContent(notionId) ? notionId : null;
}
