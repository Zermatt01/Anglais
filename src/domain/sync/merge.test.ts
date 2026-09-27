import { describe, expect, it } from 'vitest';
import { decideDocumentMerge, decideEventMerge, stableStringify } from './merge.ts';

describe('stableStringify', () => {
  it('ignores key order at every level', () => {
    expect(stableStringify({ b: 1, a: { d: [1, { f: 1, e: 2 }], c: null } })).toBe(
      stableStringify({ a: { c: null, d: [1, { e: 2, f: 1 }] }, b: 1 }),
    );
  });

  it('keeps array order, which is meaningful', () => {
    expect(stableStringify([1, 2])).not.toBe(stableStringify([2, 1]));
  });
});

describe('decideDocumentMerge', () => {
  const version = (updatedAt: number, document: unknown = { updatedAt }) => ({
    updatedAt,
    document,
  });

  it('inserts a document that does not exist locally', () => {
    expect(decideDocumentMerge(undefined, version(1))).toBe('insert');
  });

  it('keeps the most recent version', () => {
    expect(decideDocumentMerge(version(1), version(2))).toBe('replace');
    expect(decideDocumentMerge(version(2), version(1))).toBe('keep');
  });

  it('keeps the local document when both versions are identical', () => {
    expect(decideDocumentMerge(version(5, { a: 1, b: 2 }), version(5, { b: 2, a: 1 }))).toBe(
      'keep',
    );
  });

  it('breaks ties deterministically, whatever the side', () => {
    const left = version(5, { text: 'left' });
    const right = version(5, { text: 'right' });
    const onDeviceA = decideDocumentMerge(left, right);
    const onDeviceB = decideDocumentMerge(right, left);
    // Both devices end up with the same document.
    expect(onDeviceA === 'replace' ? right : left).toBe(onDeviceB === 'replace' ? left : right);
  });
});

describe('decideEventMerge', () => {
  it('unions events without ever overwriting one', () => {
    expect(decideEventMerge(false)).toBe('insert');
    expect(decideEventMerge(true)).toBe('keep');
  });
});
