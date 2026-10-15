export function formatCurrency(
  amount: number,
  currency = 'NGN',
  locale = 'en-NG',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function formatPoints(points: number, locale = 'en-NG'): string {
  return new Intl.NumberFormat(locale).format(Math.round(points));
}

function trimTrailingZero(text: string): string {
  return text.replace(/\.0$/, '');
}

export function formatCompactNaira(amount: number, locale = 'en-NG'): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `${sign}₦${trimTrailingZero((abs / 1_000_000).toFixed(1))}m`;
  }
  if (abs >= 1_000) {
    return `${sign}₦${trimTrailingZero((abs / 1_000).toFixed(1))}k`;
  }
  return formatCurrency(amount, 'NGN', locale);
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Ledger-style timestamp: `Today, 10:42 AM` · `Yesterday, 4:15 PM` · `Oct 14, 2:30 PM`. */
export function formatWhen(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const hour = date.getHours();
  const time = `${((hour + 11) % 12) + 1}:${String(date.getMinutes()).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
  const dayStart = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const dayDiff = Math.round((dayStart(now) - dayStart(date)) / 86_400_000);
  if (dayDiff === 0) {
    return `Today, ${time}`;
  }
  if (dayDiff === 1) {
    return `Yesterday, ${time}`;
  }
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${time}`;
}

/** `2026-10-20T…` → "Oct 20". Empty for an unparseable value. */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** `…T14:30…` → "2:30 PM" in the device's time zone. */
export function formatClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hour = date.getHours();
  return `${((hour + 11) % 12) + 1}:${String(date.getMinutes()).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** Whole local calendar days from `iso` to `now` (0 = same day, 1 = yesterday). */
export function calendarDaysAgo(iso: string, now: Date = new Date()): number {
  const date = new Date(iso);
  const dayStart = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  return Math.round((dayStart(now) - dayStart(date)) / 86_400_000);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Booking slots arrive as separate `date` (`2026-10-20`) and `time` (`14:30`)
 * fields, so they need their own pair of formatters.
 *
 * All four below are hand-built like `formatWhen`, never `toLocale*`: an
 * `en-NG` device locale renders day-first on a 24h clock ("Tue, 20 Oct •
 * 14:30"), which drifts from the slot copy everywhere it is shown and makes
 * the output untestable. Unparseable input is returned as sent — a malformed
 * server value should read as itself, not as "Invalid Date".
 */
function parseSlotDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

function parseSlotTime(time: string): Date {
  return new Date(`2000-01-01T${time.length === 5 ? `${time}:00` : time}`);
}

/** `14:30` → "2:30 PM". */
export function formatSlotClock(time: string): string {
  const parsed = parseSlotTime(time);
  if (Number.isNaN(parsed.getTime())) return time;
  const hour = parsed.getHours();
  return `${((hour + 11) % 12) + 1}:${String(parsed.getMinutes()).padStart(2, '0')} ${
    hour < 12 ? 'AM' : 'PM'
  }`;
}

/** `2026-10-20` → "Tue, Oct 20". */
export function formatSlotDay(date: string): string {
  const parsed = parseSlotDate(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return `${WEEKDAYS[parsed.getDay()]}, ${MONTHS[parsed.getMonth()]} ${parsed.getDate()}`;
}

/** `2026-10-20` → "Tue, Oct 20, 2026". */
export function formatSlotDate(date: string): string {
  const parsed = parseSlotDate(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return `${formatSlotDay(date)}, ${parsed.getFullYear()}`;
}

/** `2026-10-20` + `14:30` → "Tue, Oct 20 • 2:30 PM". */
export function formatBookingSlot(date: string, time: string): string {
  if (
    Number.isNaN(parseSlotDate(date).getTime()) ||
    Number.isNaN(parseSlotTime(time).getTime())
  ) {
    return `${date} ${time}`;
  }
  return `${formatSlotDay(date)} • ${formatSlotClock(time)}`;
}
