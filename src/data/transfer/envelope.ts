/**
 * Format of the JSON export (MOD-12, docs/ARCHITECTURE.md §7):
 * `{ app, formatVersion, exportedAt, databaseVersion, tables }`, where each
 * table holds its records exactly as stored (each with its own `schemaVersion`).
 */
import { z } from 'zod';
import { epochMsSchema } from '../../domain/primitives.ts';

export const EXPORT_APP = 'anglais';
export const EXPORT_FORMAT_VERSION = 1;

export const exportEnvelopeSchema = z.strictObject({
  app: z.literal(EXPORT_APP),
  formatVersion: z.literal(EXPORT_FORMAT_VERSION),
  exportedAt: epochMsSchema,
  databaseVersion: z.int().positive(),
  tables: z.record(z.string(), z.array(z.unknown())),
});
export type ExportEnvelope = z.infer<typeof exportEnvelopeSchema>;

export type EnvelopeError =
  /** The file is not JSON. */
  | 'not-json'
  /** The file is JSON, but not an export of this application. */
  | 'not-an-export'
  /** The file comes from a newer version of the application. */
  | 'newer-format';

export type ParsedEnvelope =
  | { readonly ok: true; readonly envelope: ExportEnvelope }
  | { readonly ok: false; readonly error: EnvelopeError };

/** Reads the text of an export file. */
export function parseExportText(text: string): ParsedEnvelope {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'not-json' };
  }

  const header = z
    .looseObject({ app: z.literal(EXPORT_APP), formatVersion: z.int() })
    .safeParse(json);
  if (header.success && header.data.formatVersion > EXPORT_FORMAT_VERSION) {
    return { ok: false, error: 'newer-format' };
  }
  const envelope = exportEnvelopeSchema.safeParse(json);
  return envelope.success
    ? { ok: true, envelope: envelope.data }
    : { ok: false, error: 'not-an-export' };
}

/** File name of an export made on a given local day (`YYYY-MM-DD`). */
export function exportFileName(day: string): string {
  return `anglais-export-${day}.json`;
}
