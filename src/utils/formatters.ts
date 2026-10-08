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

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}
