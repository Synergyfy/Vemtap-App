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
