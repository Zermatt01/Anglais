import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import {
  createQuarantineRepository,
  type SetAsideKind,
} from '../../data/repositories/quarantine-repository.ts';
import { isTableName } from '../../data/tables.ts';
import { exportFileName } from '../../data/transfer/envelope.ts';
import { exportDatabase } from '../../data/transfer/export.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { useAppServices } from '../app-services.ts';
import { countOf, formatDateTime, localDay } from '../dates.ts';
import { downloadTextFile } from './download.ts';
import { TABLE_LABELS } from './labels.ts';

const KIND_LABELS: Readonly<Record<SetAsideKind, string>> = {
  conflict: 'Version remplacée par celle d’un autre appareil',
  'received-unreadable': 'Reçu du serveur, illisible',
  unreadable: 'Illisible sur ce téléphone',
};

type Removal =
  | { readonly step: 'idle' }
  /** An export was just downloaded, at `exportedAt`: waiting for the learner. */
  | { readonly step: 'confirm'; readonly exportedAt: number; readonly fileName: string }
  | { readonly step: 'done'; readonly removed: number }
  | { readonly step: 'error' };

/**
 * Records set aside so that nothing is lost (NO-06, D-070). They can be
 * removed from the phone only through an export that holds them.
 */
export function SetAsideList() {
  const { db, clock } = useAppServices();
  const repository = useMemo(() => createQuarantineRepository(db), [db]);
  const entries = useLiveQuery(() => repository.list(), [repository]);
  const [removal, setRemoval] = useState<Removal>({ step: 'idle' });

  async function exportFirst() {
    try {
      const exportedAt = clock.now();
      const envelope = await exportDatabase(db, exportedAt);
      const fileName = exportFileName(localDay(exportedAt));
      downloadTextFile(fileName, JSON.stringify(envelope, null, 2));
      setRemoval({ step: 'confirm', exportedAt, fileName });
    } catch {
      setRemoval({ step: 'error' });
    }
  }

  async function remove(exportedAt: number) {
    try {
      setRemoval({ step: 'done', removed: await repository.removeExportedUpTo(exportedAt) });
    } catch {
      setRemoval({ step: 'error' });
    }
  }

  if (entries === undefined || (entries.length === 0 && removal.step !== 'done')) return null;

  return (
    <div className="field">
      <p className="field__label">Éléments mis de côté</p>
      {entries.length > 0 ? (
        <>
          <p className="field__hint">
            Des versions remplacées lors d’une synchronisation, ou des enregistrements illisibles,
            gardés pour que rien ne se perde. Ils sont inclus dans chaque export.
          </p>
          <ul className="plain-list">
            {entries.map((entry) => (
              <li key={entry.id} className="plain-list__item">
                <span className="plain-list__text">
                  <span>{KIND_LABELS[entry.kind]}</span>
                  <span className="muted">
                    {isTableName(entry.table) ? TABLE_LABELS[entry.table] : entry.table} ·{' '}
                    {formatDateTime(entry.setAsideAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {removal.step === 'confirm' ? (
        <Notice title="Vérifie l’export avant de retirer">
          <p>
            Vérifie que le fichier {removal.fileName} est bien dans tes téléchargements : il
            contient ces éléments. Ensuite seulement, retire-les du téléphone.
          </p>
          <div className="button-row">
            <Button
              onClick={() => {
                void remove(removal.exportedAt);
              }}
            >
              Retirer du téléphone
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRemoval({ step: 'idle' });
              }}
            >
              Garder
            </Button>
          </div>
        </Notice>
      ) : entries.length > 0 ? (
        <div className="button-row">
          <Button
            variant="secondary"
            onClick={() => {
              void exportFirst();
            }}
          >
            Exporter puis retirer du téléphone
          </Button>
        </div>
      ) : null}

      {removal.step === 'done' ? (
        <Notice tone="success">
          <p>
            {countOf(removal.removed, 'élément retiré', 'éléments retirés')} du téléphone ; ils
            restent dans ton export.
          </p>
        </Notice>
      ) : null}
      {removal.step === 'error' ? (
        <Notice tone="error" title="Rien n’a été retiré">
          <p>L’opération a échoué. Réessaie ; les éléments restent sur le téléphone.</p>
        </Notice>
      ) : null}
    </div>
  );
}
