import { describe, expect, it } from 'vitest';
import { FIXTURE_IDS, T0, VALID_RECORDS } from '../../test/fixtures.ts';
import { TABLE_NAMES, TABLES } from '../tables.ts';

describe('table schemas', () => {
  it.each(TABLE_NAMES)('accept a valid %s record unchanged', (name) => {
    const record = VALID_RECORDS[name];
    expect(TABLES[name].schema.parse(record)).toEqual(record);
  });

  it.each(TABLE_NAMES)('reject a %s record with an unknown field', (name) => {
    expect(TABLES[name].schema.safeParse({ ...VALID_RECORDS[name], extra: 1 }).success).toBe(false);
  });

  it('keeps the errors fixture consistent with its production text', () => {
    const { text } = VALID_RECORDS.productions;
    const { segment } = VALID_RECORDS.errors;
    expect(text.slice(segment.range?.start, segment.range?.end)).toBe(segment.text);
  });
});

describe('cards schema', () => {
  const card = VALID_RECORDS.cards;

  it('requires the notionId index copy to match the content', () => {
    expect(TABLES.cards.schema.safeParse({ ...card, notionId: null }).success).toBe(false);
  });

  it('requires the due index copy to match the spaced repetition state', () => {
    expect(TABLES.cards.schema.safeParse({ ...card, due: T0 + 1 }).success).toBe(false);
  });

  it('requires a reason for, and only for, a suspended card', () => {
    const schema = TABLES.cards.schema;
    expect(schema.safeParse({ ...card, status: 'suspended' }).success).toBe(false);
    expect(schema.safeParse({ ...card, suspensionReason: 'reported' }).success).toBe(false);
    expect(
      schema.safeParse({ ...card, status: 'suspended', suspensionReason: 'unsolvable' }).success,
    ).toBe(true);
  });

  it('stores an unsolvable card, so that an import never loses one (MOD-14)', () => {
    const unsolvable = {
      ...card,
      content: { ...card.content, meaningFr: '' },
      status: 'suspended',
      suspensionReason: 'unsolvable',
    };
    expect(TABLES.cards.schema.safeParse(unsolvable).success).toBe(true);
  });
});

describe('lexicon schema', () => {
  it('requires the unique key to be the normalized expression', () => {
    const entry = VALID_RECORDS.lexicon;
    expect(
      TABLES.lexicon.schema.safeParse({ ...entry, expression: 'Meet a deadline!' }).success,
    ).toBe(true);
    expect(TABLES.lexicon.schema.safeParse({ ...entry, key: 'meet the deadline' }).success).toBe(
      false,
    );
  });
});

describe('events', () => {
  it('require a UUID identifier', () => {
    const attempt = { ...VALID_RECORDS.exerciseAttempts, id: 'not-a-uuid' };
    expect(TABLES.exerciseAttempts.schema.safeParse(attempt).success).toBe(false);
    expect(FIXTURE_IDS.event).toMatch(/^[0-9a-f-]{36}$/);
  });
});
