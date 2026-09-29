import { describe, expect, it } from 'vitest';
import {
  decideDocumentMerge,
  decideEventMerge,
  decideRemoteVersion,
  discardsLocalVersion,
  stableStringify,
} from './merge.ts';

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

describe('decideRemoteVersion (synchronization, D-063, D-069)', () => {
  const local = (
    updatedAt: number,
    fields: { pending?: boolean; sameContent?: boolean; unchangedSincePush?: boolean } = {},
  ) => ({
    updatedAt,
    pending: fields.pending ?? false,
    sameContent: fields.sameContent ?? false,
    unchangedSincePush: fields.unchangedSincePush ?? false,
  });

  it('inserts a document absent or unreadable locally', () => {
    expect(decideRemoteVersion(undefined, 5, 'pull')).toBe('insert');
  });

  it('keeps the most recent version, pending or not', () => {
    expect(decideRemoteVersion(local(1), 2, 'pull')).toBe('replace');
    expect(decideRemoteVersion(local(1, { pending: true }), 2, 'pull')).toBe('replace');
    expect(decideRemoteVersion(local(2), 1, 'pull')).toBe('keep');
    expect(decideRemoteVersion(local(4, { pending: true }), 3, 'stale')).toBe('keep');
  });

  it('does nothing for the same version', () => {
    expect(decideRemoteVersion(local(3, { sameContent: true }), 3, 'pull')).toBe('keep');
    expect(decideRemoteVersion(local(3, { sameContent: true }), 3, 'stale')).toBe('keep');
  });

  it('adopts the version the server kept at equal time', () => {
    // Pulled: another device won the tie on the server.
    expect(decideRemoteVersion(local(3), 3, 'pull')).toBe('replace');
    // Returned by a push: the local version, unchanged since, lost the tie.
    expect(
      decideRemoteVersion(local(3, { pending: true, unchangedSincePush: true }), 3, 'stale'),
    ).toBe('replace');
  });

  it('lets the server settle a tie with a local version not sent yet', () => {
    expect(decideRemoteVersion(local(3, { pending: true }), 3, 'pull')).toBe('keep');
  });

  it('keeps a version changed during the push, even with the same updatedAt (review of phase 2)', () => {
    // The time alone would say "unchanged": the content says otherwise.
    expect(
      decideRemoteVersion(local(3, { pending: true, unchangedSincePush: false }), 3, 'stale'),
    ).toBe('keep');
  });
});

describe('discardsLocalVersion (NO-06, D-069)', () => {
  const version = (updatedAt: number, pending: boolean, sameContent = false) => ({
    updatedAt,
    pending,
    sameContent,
    unchangedSincePush: false,
  });

  it('flags a local change not sent yet, even against a more recent version', () => {
    // A device whose clock runs late: its change carries an older time.
    expect(discardsLocalVersion(version(100, true), 200)).toBe(true);
  });

  it('flags a concurrent version with the same time', () => {
    expect(discardsLocalVersion(version(300, false), 300)).toBe(true);
  });

  it('does not flag the normal replacement of a sent version, nor an identical one', () => {
    expect(discardsLocalVersion(version(100, false), 200)).toBe(false);
    expect(discardsLocalVersion(version(300, true, true), 300)).toBe(false);
    expect(discardsLocalVersion(undefined, 300)).toBe(false);
  });
});
