/** Dates as shown to the learner, in French, in the device's time zone. */

const twoDigits = (value: number) => String(value).padStart(2, '0');

/** Local calendar day of the device, `YYYY-MM-DD`. */
export function localDay(epochMs: number): string {
  const date = new Date(epochMs);
  return `${String(date.getFullYear())}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

const longDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** "samedi 27 septembre" */
export function formatLongDate(epochMs: number): string {
  return longDate.format(epochMs);
}

const dateTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** "27 sept. 2026, 10:00" */
export function formatDateTime(epochMs: number): string {
  return dateTime.format(epochMs);
}

/** French count with its noun: "0 ajout", "1 ajout", "3 ajouts". */
export function countOf(count: number, singular: string, pluralForm: string): string {
  return `${String(count)} ${count > 1 ? pluralForm : singular}`;
}
