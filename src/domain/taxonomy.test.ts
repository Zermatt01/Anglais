import { describe, expect, it } from 'vitest';
import { CONTRACT_ERROR_CATEGORIES, CONTRACT_NOTION_IDS } from '../../shared/ai/curriculum.ts';
import { NOTION_IDS } from './curriculum/notion-id.ts';
import { ERROR_CATEGORIES } from './taxonomy.ts';

describe('closed lists given to the model (AI-03)', () => {
  it('are the categories of the taxonomy, in the same order (TAX-01)', () => {
    expect([...CONTRACT_ERROR_CATEGORIES]).toEqual([...ERROR_CATEGORIES]);
    expect(ERROR_CATEGORIES).toHaveLength(15);
  });

  it('are the notions of the curriculum, in the same order (docs/PEDAGOGY.md §11)', () => {
    expect([...CONTRACT_NOTION_IDS]).toEqual([...NOTION_IDS]);
  });
});
