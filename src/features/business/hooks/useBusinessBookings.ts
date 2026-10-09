import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookingsApi,
  type BusinessBooking,
  type BusinessBookingsPage,
  type BusinessBookingsQuery,
} from '@api/bookingsApi';

export const businessBookingKeys = {
  all: ['businessBookings'] as const,
  list: (query: BusinessBookingsQuery) =>
    [...businessBookingKeys.all, 'list', query] as const,
};

export function useBusinessBookings(query: BusinessBookingsQuery = {}) {
  return useQuery<BusinessBookingsPage>({
    queryKey: businessBookingKeys.list(query),
    queryFn: () => bookingsApi.listBusinessBookings(query),
    staleTime: 30_000,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessBookingKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

export type BookingTone = 'brand' | 'neutral' | 'tertiary';

export interface PresentedBooking {
  id: string;
  time: string;
  duration: string;
  startsSoon: boolean;
  tone: BookingTone;
  customer: string;
  badge?: string;
  service: string;
  /** Staff is not stored on the booking record. */
  staff: string;
  note?: string;
  cta?: string;
  /** Status the Check-In CTA applies via `PATCH /bookings/:id/status`. */
  nextStatus?: string;
}

const STATUS_PRESENTATION: Record<
  string,
  { tone: BookingTone; badge: string; cta?: string; nextStatus?: string }
> = {
  booked: {
    tone: 'brand',
    badge: 'Booked',
    cta: 'Check-In',
    nextStatus: 'completed',
  },
  confirmed: {
    tone: 'neutral',
    badge: 'Confirmed',
    cta: 'Check-In',
    nextStatus: 'completed',
  },
  completed: { tone: 'tertiary', badge: 'Completed' },
  cancelled: { tone: 'tertiary', badge: 'Cancelled' },
};

/** `14:30` → `2:30 PM`. */
function formatBookingTime(time: string): string {
  const [rawHour, rawMinute] = time.split(':').map(part => parseInt(part, 10));
  if (!Number.isFinite(rawHour) || !Number.isFinite(rawMinute)) return time;
  const suffix = rawHour >= 12 ? 'PM' : 'AM';
  const hour = rawHour % 12 === 0 ? 12 : rawHour % 12;
  return `${hour}:${String(rawMinute).padStart(2, '0')} ${suffix}`;
}

/** True when the slot starts within the next hour (today only). */
function startsSoon(booking: BusinessBooking): boolean {
  const start = Date.parse(`${booking.date}T${booking.time}:00`);
  if (!Number.isFinite(start)) return false;
  const delta = start - Date.now();
  return delta >= 0 && delta <= 60 * 60 * 1000;
}

export function presentBooking(booking: BusinessBooking): PresentedBooking {
  const status = (booking.status ?? 'booked').toLowerCase();
  const presentation = STATUS_PRESENTATION[status] ?? STATUS_PRESENTATION.booked;

  const customer = [booking.customer?.firstName, booking.customer?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id: booking.id,
    time: formatBookingTime(booking.time),
    duration: `${booking.durationMinutes ?? 60}m`,
    startsSoon: startsSoon(booking),
    tone: presentation.tone,
    customer: customer || 'Walk-In Guest',
    badge: presentation.badge,
    service: booking.itemName?.trim() || 'Appointment',
    staff: '',
    note: booking.notes ?? undefined,
    cta: presentation.cta,
    nextStatus: presentation.nextStatus,
  };
}
