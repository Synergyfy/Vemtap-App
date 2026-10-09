import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, type Booking, type BookingAvailability } from '@api/bookingsApi';

export const bookingKeys = {
  availability: (branchId: string, itemId: string | undefined, date: string) =>
    ['bookings', 'availability', branchId, itemId ?? 'branch', date] as const,
  mine: (status?: string) => ['bookings', 'mine', status ?? 'all'] as const,
};

/**
 * Slots for one branch/date.
 *
 * Disabled until `branchId` and `date` are known. A closed day or a past date
 * resolves to `isClosed`/an error rather than empty slots the user can pick.
 */
export function useBookingAvailability(
  params: { branchId?: string; itemId?: string; date?: string },
  options: { enabled?: boolean } = {},
) {
  const { branchId, itemId, date } = params;
  return useQuery<BookingAvailability>({
    queryKey: bookingKeys.availability(branchId ?? '', itemId, date ?? ''),
    queryFn: () =>
      bookingsApi.getAvailability({
        branchId: branchId as string,
        itemId,
        date: date as string,
      }),
    enabled: (options.enabled ?? true) && Boolean(branchId && date),
    staleTime: 30_000,
  });
}

/**
 * The customer's own bookings.
 *
 * Status filter maps onto the hub's tabs; omit it for everything.
 */
export function useMyBookings(status?: string, options: { enabled?: boolean } = {}) {
  return useQuery<Booking[]>({
    queryKey: bookingKeys.mine(status),
    queryFn: async () => {
      const page = await bookingsApi.getMyBookings({ status });
      return page.data ?? [];
    },
    enabled: options.enabled ?? true,
    staleTime: 30_000,
  });
}

/** Book a slot. Invalidates availability and the list on success. */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      branchId: string;
      itemId?: string;
      date: string;
      time: string;
      notes?: string;
    }) => bookingsApi.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/** Cancel one of the customer's bookings. */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; reason?: string }) =>
      bookingsApi.cancelBooking(input.id, input.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export type { Booking };
