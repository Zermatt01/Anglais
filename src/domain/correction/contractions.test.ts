import { describe, expect, it } from 'vitest';
import { expandContraction } from './contractions.ts';

describe('expandContraction', () => {
  it('leaves ordinary words unchanged', () => {
    expect(expandContraction('market')).toEqual([['market']]);
    expect(expandContraction("o'clock")).toEqual([["o'clock"]]);
  });

  it('expands regular negative contractions', () => {
    expect(expandContraction("don't")).toEqual([['do', 'not']]);
    expect(expandContraction("doesn't")).toEqual([['does', 'not']]);
    expect(expandContraction("didn't")).toEqual([['did', 'not']]);
    expect(expandContraction("haven't")).toEqual([['have', 'not']]);
    expect(expandContraction("isn't")).toEqual([['is', 'not']]);
    expect(expandContraction("wouldn't")).toEqual([['would', 'not']]);
    expect(expandContraction("mustn't")).toEqual([['must', 'not']]);
  });

  it('expands irregular negative contractions', () => {
    expect(expandContraction("won't")).toEqual([['will', 'not']]);
    expect(expandContraction("shan't")).toEqual([['shall', 'not']]);
    expect(expandContraction("can't")).toEqual([['cannot'], ['can', 'not']]);
    expect(expandContraction('cannot')).toEqual([['cannot'], ['can', 'not']]);
    expect(expandContraction("ain't")).toEqual([["ain't"]]);
  });

  it('expands unambiguous verb contractions', () => {
    expect(expandContraction("i'm")).toEqual([['i', 'am']]);
    expect(expandContraction("they're")).toEqual([['they', 'are']]);
    expect(expandContraction("we've")).toEqual([['we', 'have']]);
    expect(expandContraction("she'll")).toEqual([['she', 'will']]);
    expect(expandContraction("let's")).toEqual([['let', 'us']]);
  });

  it("gives both readings of 'd, and 'did' after a question word", () => {
    expect(expandContraction("i'd")).toEqual([
      ['i', 'would'],
      ['i', 'had'],
    ]);
    expect(expandContraction("where'd")).toEqual([
      ['where', 'would'],
      ['where', 'had'],
      ['where', 'did'],
    ]);
  });

  it("gives both readings of 's after a pronoun", () => {
    expect(expandContraction("he's")).toEqual([
      ['he', 'is'],
      ['he', 'has'],
    ]);
    expect(expandContraction("there's")).toEqual([
      ['there', 'is'],
      ['there', 'has'],
    ]);
  });

  it("keeps the possessive reading of 's after an indefinite pronoun", () => {
    expect(expandContraction("everyone's")).toEqual([
      ["everyone's"],
      ['everyone', 'is'],
      ['everyone', 'has'],
    ]);
  });

  it("never expands a possessive 's after a noun", () => {
    expect(expandContraction("company's")).toEqual([["company's"]]);
    expect(expandContraction("anna's")).toEqual([["anna's"]]);
  });

  it("does not expand 'm after anything but I", () => {
    expect(expandContraction("ma'm")).toEqual([["ma'm"]]);
  });
});
