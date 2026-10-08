/** What the Thème reads: the reviewed sentences of every notion, and the learner's history. */
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { loadNotionContent, NOTIONS_WITH_CONTENT } from '../../content/index.ts';
import type { CoreThemeItem } from '../../content/schema.ts';
import type { ProductionDocument } from '../../data/schemas/productions.ts';
import type { NotionId } from '../../domain/curriculum/notion-id.ts';
import type { ThemeCandidate, ThemeHistoryEntry } from '../../domain/theme/selection.ts';
import { useAppServices } from '../app-services.ts';

export type ThemeItems =
  | { readonly state: 'loading' }
  | { readonly state: 'failed' }
  | { readonly state: 'loaded'; readonly items: ReadonlyMap<string, ThemeItemOf> };

export interface ThemeItemOf {
  readonly notionId: NotionId;
  readonly item: CoreThemeItem;
}

/** Every Thème sentence, by identifier; loaded once, offline too (D-078). */
export function useThemeItems(): ThemeItems {
  const [items, setItems] = useState<ThemeItems>({ state: 'loading' });
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      NOTIONS_WITH_CONTENT.map(async (notionId) => ({
        notionId,
        content: await loadNotionContent(notionId),
      })),
    ).then(
      (loaded) => {
        if (cancelled) return;
        const map = new Map<string, ThemeItemOf>();
        for (const { notionId, content } of loaded) {
          for (const item of content?.theme ?? []) map.set(item.id, { notionId, item });
        }
        setItems({ state: 'loaded', items: map });
      },
      () => {
        if (!cancelled) setItems({ state: 'failed' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);
  return items;
}

export function themeCandidates(items: ReadonlyMap<string, ThemeItemOf>): ThemeCandidate[] {
  return [...items.entries()].map(([itemId, { notionId }]) => ({ itemId, notionId }));
}

/** Thème answers already given, as the selection reads them. */
export function themeHistory(productions: readonly ProductionDocument[]): ThemeHistoryEntry[] {
  return productions.flatMap((production) =>
    production.context.itemId === null || production.context.notionId === null
      ? []
      : [
          {
            itemId: production.context.itemId,
            notionId: production.context.notionId,
            at: production.createdAt,
            unstudied: production.context.unstudied,
          },
        ],
  );
}

/** Results of the graded Thème answers, oldest first, for the calibration (PEDAGOGY §6.2). */
export function themeSuccesses(productions: readonly ProductionDocument[]): boolean[] {
  return [...productions]
    .sort((a, b) => a.createdAt - b.createdAt)
    .flatMap((production) =>
      production.result === null ? [] : [production.result !== 'incorrect'],
    );
}

/** The learner's Thème answers, newest first. */
export function useThemeProductions(): ProductionDocument[] | undefined {
  const { productions } = useAppServices();
  return useLiveQuery(() => productions.list('theme'), [productions]);
}
