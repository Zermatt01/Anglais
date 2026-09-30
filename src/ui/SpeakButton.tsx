import { SpeakerIcon } from './icons.tsx';

interface SpeakButtonProps {
  /** What is read, for the accessible name: "Écouter : …". */
  readonly text: string;
  readonly onSpeak: () => void;
}

/** Reads an English example aloud (CUR-03). A 44 px touch target (UI-01). */
export function SpeakButton({ text, onSpeak }: SpeakButtonProps) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={`Écouter : ${text}`}
      title="Écouter"
      onClick={onSpeak}
    >
      <SpeakerIcon />
    </button>
  );
}
