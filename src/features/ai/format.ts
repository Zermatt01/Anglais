/** Amounts and dates of the AI screens, in French. */

const twoDecimals = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fourDecimals = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/**
 * "9,87 USD". Amounts below a cent keep four decimals ("0,0004 USD"), so
 * that a small cost never reads as zero.
 */
export function formatUsd(amount: number): string {
  const format = amount > 0 && amount < 0.01 ? fourDecimals : twoDecimals;
  return `${format.format(amount)} USD`;
}

/**
 * The highest cost of a request, rounded up: "0,05 USD" for 0.0412, so that
 * the cost shown before a request is never below what it can cost.
 */
export function formatMaxUsd(amount: number): string {
  const unit = amount > 0 && amount < 0.01 ? 10_000 : 100;
  // The margin keeps an exact amount (0.18, read 18.000000000000004 cents) as it is.
  return formatUsd(Math.ceil(amount * unit - 1e-9) / unit);
}

const upToTwoDecimals = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/** A cap: "10 USD", "2,5 USD". */
export function formatCap(amount: number): string {
  return `${upToTwoDecimals.format(amount)} USD`;
}

const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' });

/** "1er octobre" for `2026-10-01`, "15 octobre" for `2026-10-15`. */
export function formatDay(isoDay: string): string {
  const [year = 0, month = 1, day = 1] = isoDay.split('-').map(Number);
  const name = monthName.format(Date.UTC(year, month - 1, day));
  return `${day === 1 ? '1er' : String(day)} ${name}`;
}
