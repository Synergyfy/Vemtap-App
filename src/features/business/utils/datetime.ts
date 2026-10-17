/**
 * Formatting helpers shared by the business mappers.
 *
 * Kept in one place because the same two questions come up on every
 * presentational screen — "how old is this timestamp?" and "how do I write
 * 1,200 without depending on a locale Hermes may not have?" — and answering
 * them twice is how the two screens drift apart.
 */

/**
 * 4-digit grouping without a locale dependency: Hermes on Android ships
 * without full ICU, so `toLocaleString` cannot be relied on to insert commas.
 */
export function formatCount(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Age in the compact form the feeds show (`2h ago`, `3d ago`), falling back to
 * a short date for anything older than a week. `''` when there is no usable
 * timestamp — an unknown age is not the same as "just now".
 */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * `12 Mar 2027` for a raw timestamp. The expiry fields on loyalty rewards are
 * stored as ISO strings but read as dates everywhere they are shown.
 */
export function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
