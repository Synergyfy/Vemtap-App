import { strings } from '@constants/strings';
import type { BookingDateOption } from '@features/booking/components/BookingComponents';

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** A local date as `YYYY-MM-DD`, the value `GET /bookings/availability` takes. */
export function toISODate(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

/** Today and the `count - 1` days after it, as date-strip options. */
export function buildDateStrip(count: number, from = new Date()): BookingDateOption[] {
  return Array.from({ length: count }, (_, index) => {
    const value = new Date(from);
    value.setDate(from.getDate() + index);
    return {
      id: toISODate(value),
      day: WEEKDAY_SHORT[value.getDay()],
      date: String(value.getDate()),
      status: index === 0 ? strings.bookingFlow.today : '',
    };
  });
}
