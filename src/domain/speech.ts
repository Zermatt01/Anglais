/**
 * Speech synthesis, to read the lesson examples aloud (CUR-03,
 * docs/ARCHITECTURE.md §12). The domain defines the interface and chooses the
 * voice; `services/speech` implements it with the Web Speech API.
 */
import type { EnglishVariant } from './settings.ts';

export interface SpeechVoice {
  /** Stable identifier (`voiceURI`), stored in the settings. */
  readonly id: string;
  readonly name: string;
  /** BCP 47 language tag, such as `en-GB`. */
  readonly lang: string;
  readonly isDefault: boolean;
}

export interface SpeakOptions {
  readonly variant: EnglishVariant;
  /** Chosen voice, or `null` for the device's default voice of the variant. */
  readonly voiceId: string | null;
  /** 1 is the normal speed. */
  readonly rate: number;
}

export interface SpeechSynthesizer {
  voices(): readonly SpeechVoice[];
  /** The list of voices may arrive after start-up; returns an unsubscribe function. */
  onVoicesChanged(listener: () => void): () => void;
  /** Stops what is being read, then reads `text`. */
  speak(text: string, options: SpeakOptions): void;
  cancel(): void;
}

/** `en_GB`, `en-gb` and `en-GB` are the same language tag. */
function normalizedLang(lang: string): string {
  return lang.replace('_', '-').toLowerCase();
}

/**
 * English voices, those of the chosen variant first (sorted by name), then the
 * other English voices: some phones only offer one English voice.
 */
export function voicesForVariant(
  voices: readonly SpeechVoice[],
  variant: EnglishVariant,
): SpeechVoice[] {
  const wanted = normalizedLang(variant);
  const english = voices.filter((voice) => normalizedLang(voice.lang).startsWith('en'));
  const byName = (a: SpeechVoice, b: SpeechVoice) => a.name.localeCompare(b.name);
  return [
    ...english.filter((voice) => normalizedLang(voice.lang) === wanted).sort(byName),
    ...english.filter((voice) => normalizedLang(voice.lang) !== wanted).sort(byName),
  ];
}

/**
 * Voice used for reading: the chosen one if it still exists, otherwise the
 * device's default voice of the variant, otherwise its first voice of the
 * variant, otherwise any English voice. `null`: let the device decide from
 * the language alone.
 */
export function chooseVoice(
  voices: readonly SpeechVoice[],
  variant: EnglishVariant,
  voiceId: string | null,
): SpeechVoice | null {
  const candidates = voicesForVariant(voices, variant);
  const chosen = candidates.find((voice) => voice.id === voiceId);
  if (chosen !== undefined) return chosen;
  const ofVariant = candidates.filter(
    (voice) => normalizedLang(voice.lang) === normalizedLang(variant),
  );
  return ofVariant.find((voice) => voice.isDefault) ?? ofVariant[0] ?? candidates[0] ?? null;
}
