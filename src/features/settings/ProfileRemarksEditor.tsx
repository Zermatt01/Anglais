import { useState } from 'react';
import { MAX_PROFILE_REMARKS } from '../../domain/settings.ts';
import { Button } from '../../ui/Button.tsx';
import { TextAreaField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { useDraft, type DraftSaveState } from '../drafts/use-draft.ts';

export const PROFILE_REMARKS_DRAFT_KEY = 'settings:profile-remarks';

const STATUS: Readonly<Record<DraftSaveState, string>> = {
  idle: '',
  pending: 'Modification en cours…',
  saved: 'Brouillon enregistré sur ce téléphone.',
  error: 'Brouillon non enregistré : le stockage du téléphone est peut-être plein.',
};

interface ProfileRemarksEditorProps {
  /** Remarks currently stored in the settings. */
  readonly savedRemarks: string;
  /** Stores the remarks; resolves to false if they could not be saved. */
  readonly onSave: (remarks: string) => Promise<boolean>;
}

/** Free remarks of the learner profile, with a draft kept at each typing pause (UI-03). */
export function ProfileRemarksEditor({ savedRemarks, onSave }: ProfileRemarksEditorProps) {
  const draft = useDraft(PROFILE_REMARKS_DRAFT_KEY, savedRemarks);
  const [justSaved, setJustSaved] = useState(false);
  const changed = draft.text !== savedRemarks;

  return (
    <div className="field">
      {draft.restored && changed ? (
        <Notice title="Brouillon restauré">
          <p>Ces modifications n’ont pas encore été enregistrées dans ton profil.</p>
        </Notice>
      ) : null}
      <TextAreaField
        label="Remarques libres"
        hint="Par exemple le poste visé ou ce qui te met en difficulté. Inutile d’indiquer ton nom ou tes coordonnées."
        value={draft.text}
        maxLength={MAX_PROFILE_REMARKS}
        disabled={!draft.ready}
        onChange={(event) => {
          setJustSaved(false);
          draft.setText(event.currentTarget.value);
        }}
        status={justSaved ? 'Profil enregistré.' : STATUS[draft.saveState]}
      />
      <div className="button-row">
        <Button
          disabled={!changed}
          onClick={() => {
            void (async () => {
              const text = draft.text;
              if (await onSave(text)) {
                await draft.discard(text);
                setJustSaved(true);
              }
            })();
          }}
        >
          Enregistrer
        </Button>
        <Button
          variant="secondary"
          disabled={!changed}
          onClick={() => {
            setJustSaved(false);
            void draft.discard(savedRemarks);
          }}
        >
          Annuler les modifications
        </Button>
      </div>
    </div>
  );
}
