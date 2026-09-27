import { useEffect, useRef, useState } from 'react';
import { listBackups, readBackup, type BackupSummary } from '../../data/backup.ts';
import {
  exportFileName,
  parseExportText,
  type ExportEnvelope,
} from '../../data/transfer/envelope.ts';
import { exportDatabase } from '../../data/transfer/export.ts';
import {
  applyImport,
  countChanges,
  previewImport,
  type ImportPlan,
} from '../../data/transfer/import.ts';
import {
  getPersistenceStatus,
  requestPersistentStorage,
  type PersistenceStatus,
} from '../../services/storage/persistence.ts';
import { Button } from '../../ui/Button.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Sheet } from '../../ui/Page.tsx';
import { useAppServices } from '../app-services.ts';
import { countOf, formatDateTime, localDay } from '../dates.ts';
import { downloadTextFile } from './download.ts';
import { ImportPreview } from './ImportPreview.tsx';
import { ENVELOPE_ERRORS } from './labels.ts';

/** Largest file the import reads (an export is far smaller). */
const MAX_IMPORT_BYTES = 50 * 1024 * 1024;

type ImportState =
  | { readonly step: 'idle' }
  | { readonly step: 'reading' }
  | { readonly step: 'preview'; readonly envelope: ExportEnvelope; readonly plan: ImportPlan }
  | { readonly step: 'applying' }
  | { readonly step: 'done'; readonly changes: number }
  | { readonly step: 'error'; readonly message: string };

const PERSISTENCE_TEXT: Readonly<Record<PersistenceStatus, string>> = {
  persisted: 'Protégé : le navigateur ne l’effacera pas pour libérer de la place.',
  'not-persisted':
    'Non protégé : en cas de manque de place, le navigateur pourrait l’effacer. Installer l’application sur l’écran d’accueil aide à obtenir la protection.',
  unsupported: 'Ce navigateur ne permet pas de protéger le stockage.',
};

function PersistenceStatusLine() {
  const [status, setStatus] = useState<PersistenceStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPersistenceStatus().then((value) => {
      if (!cancelled) setStatus(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="field">
      <p className="field__label">Stockage sur ce téléphone</p>
      <p className="muted" role="status">
        {status === null ? 'Vérification…' : PERSISTENCE_TEXT[status]}
      </p>
      {status === 'not-persisted' ? (
        <div className="button-row">
          <Button
            variant="secondary"
            onClick={() => {
              void requestPersistentStorage().then(setStatus);
            }}
          >
            Demander la protection
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function BackupList() {
  const [backups, setBackups] = useState<readonly BackupSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    listBackups().then(
      (list) => {
        if (!cancelled) setBackups(list);
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (backups.length === 0) return null;
  return (
    <div className="field">
      <p className="field__label">Sauvegardes automatiques</p>
      <p className="field__hint">
        Faites avant chaque mise à jour du format des données. Les trois plus récentes sont gardées.
      </p>
      <ul className="plain-list">
        {backups.map((backup) => (
          <li key={backup.id} className="plain-list__item">
            <span>{formatDateTime(backup.createdAt)}</span>
            <Button
              variant="secondary"
              onClick={() => {
                void readBackup(backup.id).then((json) => {
                  if (json !== null) {
                    downloadTextFile(`anglais-sauvegarde-${localDay(backup.createdAt)}.json`, json);
                  }
                });
              }}
            >
              Télécharger
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Export, import and storage state (MOD-12, D-019). */
export function DataSection() {
  const { db, clock } = useAppServices();
  const fileInput = useRef<HTMLInputElement>(null);
  const [exportState, setExportState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [importState, setImportState] = useState<ImportState>({ step: 'idle' });

  async function exportData() {
    setExportState('working');
    try {
      const now = clock.now();
      const envelope = await exportDatabase(db, now);
      downloadTextFile(exportFileName(localDay(now)), JSON.stringify(envelope, null, 2));
      setExportState('done');
    } catch {
      setExportState('error');
    }
  }

  async function readFile(file: File) {
    if (file.size > MAX_IMPORT_BYTES) {
      setImportState({ step: 'error', message: 'Ce fichier est trop volumineux pour un export.' });
      return;
    }
    setImportState({ step: 'reading' });
    try {
      const parsed = parseExportText(await file.text());
      if (!parsed.ok) {
        setImportState({ step: 'error', message: ENVELOPE_ERRORS[parsed.error] });
        return;
      }
      const plan = await previewImport(db, parsed.envelope, clock.now());
      setImportState({ step: 'preview', envelope: parsed.envelope, plan });
    } catch {
      setImportState({ step: 'error', message: 'Le fichier n’a pas pu être lu. Réessaie.' });
    }
  }

  async function confirmImport(envelope: ExportEnvelope) {
    setImportState({ step: 'applying' });
    try {
      const plan = await applyImport(db, envelope, clock.now());
      setImportState({ step: 'done', changes: countChanges(plan) });
    } catch {
      setImportState({
        step: 'error',
        message: 'L’import a échoué et rien n’a été modifié. Réessaie.',
      });
    }
  }

  const busy = importState.step === 'reading' || importState.step === 'applying';

  return (
    <Sheet title="Données">
      <PersistenceStatusLine />

      <div className="field">
        <p className="field__label">Exporter</p>
        <p className="field__hint">
          Télécharge une copie complète de tes données (fichier JSON), à garder en lieu sûr.
        </p>
        <div className="button-row">
          <Button
            disabled={exportState === 'working'}
            onClick={() => {
              void exportData();
            }}
          >
            Exporter mes données
          </Button>
        </div>
        {exportState === 'done' ? (
          <Notice tone="success">
            <p>Export prêt : vérifie le fichier dans tes téléchargements.</p>
          </Notice>
        ) : null}
        {exportState === 'error' ? (
          <Notice tone="error" title="Export impossible">
            <p>Les données n’ont pas pu être lues. Recharge l’application, puis réessaie.</p>
          </Notice>
        ) : null}
      </div>

      <div className="field">
        <p className="field__label">Importer</p>
        <p className="field__hint">
          Ajoute le contenu d’un export à tes données. Rien n’est effacé : pour chaque élément
          présent des deux côtés, la version la plus récente est gardée.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="Fichier à importer"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file !== undefined) void readFile(file);
          }}
        />
        <div className="button-row">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              fileInput.current?.click();
            }}
          >
            Choisir un fichier…
          </Button>
        </div>

        {importState.step === 'reading' || importState.step === 'applying' ? (
          <p className="muted" role="status">
            {importState.step === 'reading' ? 'Lecture du fichier…' : 'Import en cours…'}
          </p>
        ) : null}

        {importState.step === 'preview' ? (
          <Notice title="Aperçu de l’import">
            <ImportPreview plan={importState.plan} />
            <div className="button-row">
              {countChanges(importState.plan) > 0 ? (
                <Button
                  onClick={() => {
                    void confirmImport(importState.envelope);
                  }}
                >
                  Importer
                </Button>
              ) : null}
              <Button
                variant="secondary"
                onClick={() => {
                  setImportState({ step: 'idle' });
                }}
              >
                {countChanges(importState.plan) > 0 ? 'Annuler' : 'Fermer'}
              </Button>
            </div>
          </Notice>
        ) : null}

        {importState.step === 'done' ? (
          <Notice tone="success" title="Import terminé">
            <p>
              {countOf(
                importState.changes,
                'élément ajouté ou mis à jour',
                'éléments ajoutés ou mis à jour',
              )}
              .
            </p>
          </Notice>
        ) : null}

        {importState.step === 'error' ? (
          <Notice tone="error" title="Import impossible">
            <p>{importState.message}</p>
          </Notice>
        ) : null}
      </div>

      <BackupList />
    </Sheet>
  );
}
