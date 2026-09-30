import type { SettingsPatch, SettingsValues } from '../../domain/settings.ts';
import { Button } from '../../ui/Button.tsx';
import { SelectField, TextSelectField } from '../../ui/fields.tsx';
import { Sheet } from '../../ui/Page.tsx';
import { useSpeech, useVoices } from '../speech/use-speech.ts';

const RATES = [
  { value: 0.75, label: 'Lente' },
  { value: 0.9, label: 'Un peu lente' },
  { value: 1, label: 'Normale' },
  { value: 1.1, label: 'Un peu rapide' },
  { value: 1.25, label: 'Rapide' },
];

const SAMPLE = 'I’ve just sent you the quarterly report.';

/** Voice and speed of the examples read aloud (MOD-12, D-052). */
export function SpeechSection({
  values,
  change,
}: {
  readonly values: SettingsValues;
  readonly change: (patch: SettingsPatch) => void;
}) {
  const speech = useSpeech();
  const voices = useVoices(values.englishVariant);

  if (!speech.available) {
    return (
      <Sheet title="Lecture audio">
        <p className="muted">
          Ce navigateur ne sait pas lire les exemples à voix haute. Sur Android, Chrome le permet
          avec les voix installées sur le téléphone.
        </p>
      </Sheet>
    );
  }

  return (
    <Sheet title="Lecture audio">
      <TextSelectField
        label="Voix"
        hint="Les voix proposées dépendent du téléphone ; celles de la variante choisie viennent d’abord."
        value={values.speech.voiceUri ?? ''}
        options={[
          { value: '', label: 'Voix par défaut du téléphone' },
          ...voices.map((voice) => ({ value: voice.id, label: `${voice.name} (${voice.lang})` })),
        ]}
        onChange={(value) => {
          change({ speech: { voiceUri: value === '' ? null : value } });
        }}
      />
      <SelectField
        label="Vitesse de lecture"
        value={values.speech.rate}
        options={RATES}
        onChange={(rate) => {
          change({ speech: { rate } });
        }}
      />
      <div className="button-row">
        <Button
          variant="secondary"
          onClick={() => {
            speech.speak(SAMPLE);
          }}
        >
          Écouter un exemple
        </Button>
      </div>
    </Sheet>
  );
}
