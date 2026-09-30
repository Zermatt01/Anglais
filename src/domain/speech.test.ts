import { describe, expect, it } from 'vitest';
import { chooseVoice, voicesForVariant, type SpeechVoice } from './speech.ts';

const voice = (id: string, lang: string, isDefault = false): SpeechVoice => ({
  id,
  name: id,
  lang,
  isDefault,
});

const VOICES = [
  voice('Paul', 'fr-FR', true),
  voice('Zoe', 'en_US'),
  voice('Arthur', 'en-GB'),
  voice('Amy', 'en-gb'),
  voice('Karen', 'en-AU'),
  voice('Samantha', 'en-US', true),
];

describe('voicesForVariant', () => {
  it('lists the English voices, those of the variant first, whatever the tag spelling', () => {
    expect(voicesForVariant(VOICES, 'en-GB').map((entry) => entry.id)).toEqual([
      'Amy',
      'Arthur',
      'Karen',
      'Samantha',
      'Zoe',
    ]);
    expect(voicesForVariant(VOICES, 'en-US').map((entry) => entry.id)).toEqual([
      'Samantha',
      'Zoe',
      'Amy',
      'Arthur',
      'Karen',
    ]);
  });

  it('never offers a voice of another language', () => {
    expect(voicesForVariant([voice('Paul', 'fr-FR')], 'en-GB')).toEqual([]);
  });
});

describe('chooseVoice', () => {
  it('keeps the chosen voice while it exists', () => {
    expect(chooseVoice(VOICES, 'en-GB', 'Karen')?.id).toBe('Karen');
  });

  it('falls back on the default voice of the variant, then its first voice', () => {
    expect(chooseVoice(VOICES, 'en-US', 'removed-voice')?.id).toBe('Samantha');
    expect(chooseVoice(VOICES, 'en-GB', null)?.id).toBe('Amy');
  });

  it('uses another English voice when the variant has none, and nothing without English', () => {
    expect(chooseVoice([voice('Karen', 'en-AU')], 'en-GB', null)?.id).toBe('Karen');
    expect(chooseVoice([voice('Paul', 'fr-FR')], 'en-GB', null)).toBeNull();
  });
});
