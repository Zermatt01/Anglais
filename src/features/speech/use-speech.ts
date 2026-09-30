/** Reading English aloud with the voice and speed chosen in the settings (MOD-12). */
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../../domain/settings.ts';
import { voicesForVariant, type SpeechVoice } from '../../domain/speech.ts';
import { useAppServices } from '../app-services.ts';
import { useSettings } from '../settings/use-settings.ts';

export interface Speech {
  /** False when this browser cannot read text aloud. */
  readonly available: boolean;
  speak(text: string): void;
}

export function useSpeech(): Speech {
  const { speech } = useAppServices();
  const values = useSettings()?.values ?? DEFAULT_SETTINGS;
  const { englishVariant } = values;
  const { voiceUri, rate } = values.speech;

  const speak = useCallback(
    (text: string) => {
      speech?.speak(text, { variant: englishVariant, voiceId: voiceUri, rate });
    },
    [speech, englishVariant, voiceUri, rate],
  );

  // Stop reading when the screen goes away.
  useEffect(() => () => speech?.cancel(), [speech]);

  return { available: speech !== null, speak };
}

/** English voices of the device, the chosen variant's first; kept up to date. */
export function useVoices(variant: 'en-GB' | 'en-US'): SpeechVoice[] {
  const { speech } = useAppServices();
  const [voices, setVoices] = useState<readonly SpeechVoice[]>(() => speech?.voices() ?? []);

  useEffect(() => {
    if (speech === null) return;
    return speech.onVoicesChanged(() => {
      setVoices(speech.voices());
    });
  }, [speech]);

  return voicesForVariant(voices, variant);
}
