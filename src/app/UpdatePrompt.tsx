import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { flushAllDrafts } from '../features/drafts/draft-registry.ts';
import { Button } from '../ui/Button.tsx';

/**
 * Update banner (D-018): a new version is announced and installed only when
 * the learner asks, after every draft has been saved (NO-06).
 *
 * "Ready to work offline" is deliberately not announced: a banner fixed at the
 * bottom would cover the page for an information that requires no action
 * (UI-01); the home screen already says that the app works offline.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const [updating, setUpdating] = useState(false);

  if (!needRefresh) return null;

  return (
    <div className="update-banner" role="status">
      <p className="notice__title">Nouvelle version disponible</p>
      <p>Tes brouillons sont enregistrés avant la mise à jour.</p>
      <div className="button-row">
        <Button
          disabled={updating}
          onClick={() => {
            setUpdating(true);
            void flushAllDrafts().then(() => updateServiceWorker(true));
          }}
        >
          {updating ? 'Mise à jour…' : 'Mettre à jour'}
        </Button>
        <Button
          variant="secondary"
          disabled={updating}
          onClick={() => {
            setNeedRefresh(false);
          }}
        >
          Plus tard
        </Button>
      </div>
    </div>
  );
}
