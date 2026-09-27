import { countChanges, type ImportPlan } from '../../data/transfer/import.ts';
import { countOf } from '../dates.ts';
import { TABLE_LABELS } from './labels.ts';

/** What an import will change, table by table, in plain French. */
export function ImportPreview({ plan }: { readonly plan: ImportPlan }) {
  const tables = plan.tables.filter(
    (table) => table.inserted + table.replaced + table.invalid + table.skipped > 0,
  );
  const kept = plan.tables.reduce((total, table) => total + table.kept, 0);
  const unreadable = plan.tables.reduce((total, table) => total + table.invalid, 0);
  const skipped = plan.tables.reduce((total, table) => total + table.skipped, 0);

  return (
    <div className="field">
      <p>
        {countChanges(plan) === 0
          ? 'Rien à importer : tes données sont déjà à jour.'
          : `${countOf(countChanges(plan), 'élément sera ajouté ou mis à jour', 'éléments seront ajoutés ou mis à jour')}.`}
      </p>
      {tables.length === 0 ? null : (
        <ul className="plain-list">
          {tables.map((table) => {
            const parts = [
              table.inserted > 0 ? countOf(table.inserted, 'ajout', 'ajouts') : null,
              table.replaced > 0 ? countOf(table.replaced, 'mise à jour', 'mises à jour') : null,
              table.invalid > 0 ? countOf(table.invalid, 'illisible', 'illisibles') : null,
              table.skipped > 0 ? countOf(table.skipped, 'ignoré', 'ignorés') : null,
            ].filter((part) => part !== null);
            return (
              <li key={table.table} className="plain-list__item">
                <span>{TABLE_LABELS[table.table]}</span>
                <span className="muted">{parts.join(', ')}</span>
              </li>
            );
          })}
        </ul>
      )}
      {kept > 0 ? (
        <p className="muted">
          {countOf(kept, 'élément déjà à jour', 'éléments déjà à jour')} sur ce téléphone.
        </p>
      ) : null}
      {unreadable > 0 ? (
        <p className="muted">Les éléments illisibles du fichier sont laissés de côté.</p>
      ) : null}
      {skipped > 0 ? (
        <p className="muted">
          Les éléments ignorés le sont pour protéger des données déjà présentes sur ce téléphone.
        </p>
      ) : null}
      {plan.suspendedCards > 0 ? (
        <p className="muted">
          {countOf(
            plan.suspendedCards,
            'carte incomplète sera importée suspendue',
            'cartes incomplètes seront importées suspendues',
          )}
          .
        </p>
      ) : null}
    </div>
  );
}
