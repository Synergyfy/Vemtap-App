import { hoursWindow, isOpenNow } from '@features/dealDetail/utils/openingHours';
import type { OpeningHours } from '@api/businessProfileApi';

/**
 * `isOpenNow` answers a claim the page shows ("Open Now"), so unknown data has
 * to read as unknown: no hours, no entry for today, or unusable times all
 * return `null` and the badge stays hidden.
 *
 * Fixed instants are constructed locally: 2026-10-07 is a Wednesday.
 */

const day = (from: string | null, to: string | null, isClosed = false) => ({
  from,
  to,
  isClosed,
});

/** Wednesday 2026-10-07 at the given local time. */
const at = (hours: number, minutes: number) => new Date(2026, 9, 7, hours, minutes);

test('is open inside the window and closed outside it', () => {
  const hours: OpeningHours = { wednesday: day('09:00', '17:00') };

  expect(isOpenNow(hours, at(12, 30))).toBe(true);
  expect(isOpenNow(hours, at(8, 59))).toBe(false);
  expect(isOpenNow(hours, at(9, 0))).toBe(true);
  // The closing time is exclusive: at 17:00 the day's window is over.
  expect(isOpenNow(hours, at(17, 0))).toBe(false);
});

test('a closed flag wins over a usable time pair', () => {
  const hours: OpeningHours = { wednesday: day('09:00', '17:00', true) };

  expect(isOpenNow(hours, at(12, 0))).toBe(false);
});

test('missing hours, a missing day, or unusable times read as unknown', () => {
  expect(isOpenNow(undefined)).toBeNull();
  expect(isOpenNow(null)).toBeNull();
  expect(isOpenNow({})).toBeNull();
  // Tuesday record, Wednesday instant.
  expect(isOpenNow({ tuesday: day('09:00', '17:00') }, at(12, 0))).toBeNull();
  expect(isOpenNow({ wednesday: day(null, null) }, at(12, 0))).toBeNull();
  expect(isOpenNow({ wednesday: day('9am', '5pm') }, at(12, 0))).toBeNull();
});

test('day keys match regardless of casing', () => {
  expect(isOpenNow({ WEDNESDAY: day('09:00', '17:00') }, at(12, 0))).toBe(true);
  expect(isOpenNow({ Wednesday: day('09:00', '17:00') }, at(12, 0))).toBe(true);
});

test('a window that wraps midnight is open on both sides of it', () => {
  const hours: OpeningHours = { wednesday: day('18:00', '02:00') };

  expect(isOpenNow(hours, at(23, 0))).toBe(true);
  expect(isOpenNow(hours, at(1, 0))).toBe(true);
  expect(isOpenNow(hours, at(12, 0))).toBe(false);
});

test('aggregates the week into one window with contiguous days named as a range', () => {
  const hours: OpeningHours = {
    monday: day('10:00', '22:00'),
    tuesday: day('10:00', '22:00'),
    wednesday: day('10:00', '22:00'),
    thursday: day('10:00', '22:00'),
    friday: day('10:00', '22:00'),
    saturday: day('10:00', '23:00'),
    sunday: day(null, null, true),
  };

  expect(hoursWindow(hours)).toEqual({
    window: '10:00 AM – 11:00 PM',
    days: 'Monday through Saturday',
  });
});

test('seven open days collapse to "every day"', () => {
  const hours: OpeningHours = Object.fromEntries(
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
      key => [key, day('08:00', '20:00')],
    ),
  );

  expect(hoursWindow(hours)).toEqual({ window: '8:00 AM – 8:00 PM', days: 'every day' });
});

test('scattered open days are listed instead of claimed as a range', () => {
  const hours: OpeningHours = {
    monday: day('09:00', '17:00'),
    wednesday: day('09:00', '17:00'),
    friday: day('09:00', '17:00'),
  };

  expect(hoursWindow(hours)?.days).toBe('Monday, Wednesday and Friday');
});

test('a single open day is just that day', () => {
  expect(hoursWindow({ friday: day('18:00', '23:00') })).toEqual({
    window: '6:00 PM – 11:00 PM',
    days: 'Friday',
  });
});

test('no usable day yields null rather than an invented window', () => {
  expect(hoursWindow(undefined)).toBeNull();
  expect(hoursWindow(null)).toBeNull();
  expect(hoursWindow({})).toBeNull();
  expect(hoursWindow({ monday: day(null, null, true) })).toBeNull();
  expect(hoursWindow({ monday: day('soon', 'late') })).toBeNull();
});
