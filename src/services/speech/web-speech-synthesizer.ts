/**
 * Speech synthesis with the Web Speech API (docs/ARCHITECTURE.md §12). On
 * Chrome Android, the voices of the device's text-to-speech engine are used;
 * the list may be empty until `voiceschanged` fires.
 */
import { chooseVoice, type SpeechSynthesizer, type SpeechVoice } from '../../domain/speech.ts';

function toVoice(voice: SpeechSynthesisVoice): SpeechVoice {
  return { id: voice.voiceURI, name: voice.name, lang: voice.lang, isDefault: voice.default };
}

/** The synthesizer of this browser, or `null` when it has none. */
export function createWebSpeechSynthesizer(
  scope: Partial<
    Pick<typeof globalThis, 'speechSynthesis' | 'SpeechSynthesisUtterance'>
  > = globalThis,
): SpeechSynthesizer | null {
  const synthesis = scope.speechSynthesis;
  const Utterance = scope.SpeechSynthesisUtterance;
  if (synthesis === undefined || Utterance === undefined) return null;

  return {
    voices: () => synthesis.getVoices().map(toVoice),

    onVoicesChanged(listener) {
      synthesis.addEventListener('voiceschanged', listener);
      return () => {
        synthesis.removeEventListener('voiceschanged', listener);
      };
    },

    speak(text, { variant, voiceId, rate }) {
      synthesis.cancel();
      const utterance = new Utterance(text);
      const nativeVoices = synthesis.getVoices();
      const chosen = chooseVoice(nativeVoices.map(toVoice), variant, voiceId);
      const native = nativeVoices.find((voice) => voice.voiceURI === chosen?.id);
      if (native !== undefined) utterance.voice = native;
      utterance.lang = native?.lang ?? variant;
      utterance.rate = rate;
      synthesis.speak(utterance);
    },

    cancel() {
      synthesis.cancel();
    },
  };
}
