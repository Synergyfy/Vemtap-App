/**
 * Booking-schedule arithmetic for the Add Service flow, kept beside the API's
 * rules: bookings start on a 30-minute grid, last the service's duration and
 * keep a turnaround buffer after each one.
 */

/** The API's booking grid (`SLOT_MINUTES` in the bookings service). */
export const BOOKING_GRID_MINUTES = 30;

const HHMM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** `"09:30"` or `"9:30"` → minutes after midnight; `null` when not a time. */
export function parseTime(value: string): number | null {
  const match = HHMM.exec(value.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/** Minutes after midnight → `"09:30"` (the API's `HH:mm`). */
export function toHhmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Minutes after midnight → `"9:30 AM"`. */
export function toClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** `"60 mins"` / `"1.5 hrs"` → minutes (the API parses durations the same way). */
export function durationMinutes(duration: string | undefined): number {
  const text = (duration ?? '').toLowerCase();
  const hours = /(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/.exec(text);
  if (hours) return Math.round(parseFloat(hours[1]) * 60);
  const minutes = /(\d+)\s*(min|mins|minute|minutes)/.exec(text);
  return minutes ? Number(minutes[1]) : 60;
}

/**
 * Back-to-back start times a single client slot allows in a day: each booking
 * takes its duration plus the buffer, rounded up to the booking grid.
 */
export function dailySlots(
  from: number,
  to: number,
  duration: number,
  buffer: number,
): number[] {
  const step =
    Math.ceil((duration + buffer) / BOOKING_GRID_MINUTES) * BOOKING_GRID_MINUTES;
  const slots: number[] = [];
  for (let start = from; start + duration <= to; start += step) slots.push(start);
  return slots;
}

/** A local date as the API's `YYYY-MM-DD` (never via UTC, which can shift the day). */
export function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * The bookable window's days, grouped by month: `[0]` is today's month from
 * today, later months run to the window's last day.
 */
export function blockoutMonths(today: Date, windowDays: number): Date[][] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const months: Date[][] = [];
  for (let offset = 0; offset < windowDays; offset += 1) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    const last = months[months.length - 1];
    if (last && last[0].getMonth() === day.getMonth()) last.push(day);
    else months.push([day]);
  }
  return months;
}

/** `Fri 16`. */
export function dayChipLabel(date: Date): string {
  return `${date.toLocaleDateString('en-NG', { weekday: 'short' })} ${date.getDate()}`;
}

/** `25 Dec 2026` for a `YYYY-MM-DD` key. */
export function shortDateLabel(key: string): string {
  return fromDateKey(key).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** `October 2026`. */
export function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** `Mon, Tue, Wed` (API weekdays), or `everyDay` for all seven / none set. */
export function weekdaysLabel(days: number[] | undefined, everyDay: string): string {
  return !days || days.length === 0 || days.length === 7
    ? everyDay
    : [...days]
        .sort((a, b) => a - b)
        .map(day => DAY_SHORT[day])
        .join(', ');
}

/** `HH:mm` → `9:00 AM`, or the fallback when unset/invalid. */
export function clockLabel(value: string | undefined, fallback: string): string {
  const minutes = parseTime(value ?? '');
  return minutes === null ? fallback : toClock(minutes);
}
