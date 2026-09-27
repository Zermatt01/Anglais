import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { flushAllDrafts } from '../features/drafts/draft-registry.ts';
import { Button } from '../ui/Button.tsx';

/**
 * Service worker banners (D-018): a new version is announced and installed
 * only when the learner asks, after every draft has been saved (NO-06).
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();
  const [updating, setUpdating] = useState(false);

  if (needRefresh) {
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

  if (offlineReady) {
    return (
      <div className="update-banner" role="status">
        <p>L’application est prête à fonctionner sans connexion.</p>
        <div className="button-row">
          <Button
            variant="secondary"
            onClick={() => {
              setOfflineReady(false);
            }}
          >
            OK
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
