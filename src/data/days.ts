/** Days of the device (docs/ARCHITECTURE.md §4.1): local calendar days, `YYYY-MM-DD`. */

const twoDigits = (value: number) => String(value).padStart(2, '0');

/** Local calendar day of the device, `YYYY-MM-DD`. */
export function localDay(epochMs: number): string {
  const date = new Date(epochMs);
  return `${String(date.getFullYear())}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

/** Start of the local day of `epochMs`, in epoch milliseconds. */
export function startOfLocalDay(epochMs: number): number {
  const date = new Date(epochMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
