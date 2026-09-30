import { describe, expect, it, vi } from 'vitest';
import { createWebSpeechSynthesizer } from './web-speech-synthesizer.ts';

class FakeUtterance {
  voice: SpeechSynthesisVoice | null = null;
  lang = '';
  rate = 1;
  readonly text: string;
  constructor(text: string) {
    this.text = text;
  }
}

function fakeVoice(voiceURI: string, lang: string, isDefault = false): SpeechSynthesisVoice {
  return { voiceURI, name: voiceURI, lang, default: isDefault, localService: true };
}

function fakeSynthesis(voices: SpeechSynthesisVoice[]) {
  const target = new EventTarget();
  return Object.assign(target, {
    getVoices: () => voices,
    speak: vi.fn<(utterance: FakeUtterance) => void>(),
    cancel: vi.fn(),
  });
}

function create(voices: SpeechSynthesisVoice[]) {
  const synthesis = fakeSynthesis(voices);
  const synthesizer = createWebSpeechSynthesizer({
    speechSynthesis: synthesis as unknown as SpeechSynthesis,
    SpeechSynthesisUtterance: FakeUtterance as unknown as typeof SpeechSynthesisUtterance,
  });
  if (synthesizer === null) throw new Error('expected a synthesizer');
  return { synthesis, synthesizer };
}

describe('createWebSpeechSynthesizer', () => {
  it('returns null when the browser has no speech synthesis', () => {
    expect(createWebSpeechSynthesizer({})).toBeNull();
  });

  it('lists the voices of the browser', () => {
    const { synthesizer } = create([fakeVoice('uk-1', 'en-GB', true)]);
    expect(synthesizer.voices()).toEqual([
      { id: 'uk-1', name: 'uk-1', lang: 'en-GB', isDefault: true },
    ]);
  });

  it('reads a text with the chosen voice and speed, after stopping the previous one', () => {
    const { synthesis, synthesizer } = create([
      fakeVoice('us-1', 'en-US', true),
      fakeVoice('uk-1', 'en-GB'),
    ]);
    synthesizer.speak('I’ve just sent the report.', {
      variant: 'en-GB',
      voiceId: null,
      rate: 0.9,
    });
    expect(synthesis.cancel).toHaveBeenCalledOnce();
    const utterance = synthesis.speak.mock.calls[0]?.[0];
    expect(utterance).toMatchObject({
      text: 'I’ve just sent the report.',
      lang: 'en-GB',
      rate: 0.9,
    });
    expect(utterance?.voice?.voiceURI).toBe('uk-1');
  });

  it('lets the device choose from the language when it has no English voice', () => {
    const { synthesis, synthesizer } = create([]);
    synthesizer.speak('Hello.', { variant: 'en-US', voiceId: 'gone', rate: 1 });
    expect(synthesis.speak.mock.calls[0]?.[0]).toMatchObject({ voice: null, lang: 'en-US' });
  });

  it('notifies when the list of voices changes, until unsubscribed', () => {
    const { synthesis, synthesizer } = create([]);
    const listener = vi.fn();
    const unsubscribe = synthesizer.onVoicesChanged(listener);
    synthesis.dispatchEvent(new Event('voiceschanged'));
    unsubscribe();
    synthesis.dispatchEvent(new Event('voiceschanged'));
    expect(listener).toHaveBeenCalledOnce();
  });
});
