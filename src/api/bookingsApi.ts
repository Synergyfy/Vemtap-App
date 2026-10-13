import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/** Business-side booking (GET /bookings), verified against the live payload. */
const bookingCustomerSchema = z
  .object({
    id: z.string().optional(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    phone: z.string().nullish(),
  })
  .nullish();

/**
 * One booking. Shared by the customer and business endpoints — only the
 * `customer` field differs (it is populated on the business view and `null` on
 * the customer's own list).
 */
export const bookingSchema = z.object({
  id: z.string(),
  reference: z.string().nullish(),
  status: z.string().nullish().default('booked'),
  date: z.string(),
  time: z.string(),
  durationMinutes: z.number().nullish().default(60),
  branchId: z.string().nullish(),
  branchName: z.string().nullish(),
  businessName: z.string().nullish(),
  itemId: z.string().nullish(),
  itemName: z.string().nullish(),
  notes: z.string().nullish(),
  customer: bookingCustomerSchema,
  cancelledAt: z.string().nullish(),
  cancellationReason: z.string().nullish(),
  createdAt: z.string().nullish(),
});
export type Booking = z.infer<typeof bookingSchema>;

const bookingPageSchema = z.object({
  data: z.array(bookingSchema),
  total: z.number().nullish(),
  page: z.number().nullish(),
  limit: z.number().nullish(),
});

/** A single bookable slot from `GET /bookings/availability`. */
export const bookingSlotSchema = z.object({
  time: z.string(),
  available: z.boolean(),
});
export type BookingSlot = z.infer<typeof bookingSlotSchema>;

export const bookingAvailabilitySchema = z.object({
  date: z.string(),
  branchId: z.string(),
  itemId: z.string().nullish(),
  /** The server generates slots on a 30-minute grid. */
  slotMinutes: z.number().nullish().default(30),
  durationMinutes: z.number().nullish().default(30),
  /** Non-opening day: no slots, and `isClosed` explains why. */
  isClosed: z.boolean().nullish().default(false),
  slots: z.array(bookingSlotSchema).nullish().default([]),
});
export type BookingAvailability = z.infer<typeof bookingAvailabilitySchema>;

export const businessBookingSchema = bookingSchema;
export type BusinessBooking = z.infer<typeof businessBookingSchema>;

export const businessBookingsPageSchema = z.union([
  z.object({
    data: z.array(businessBookingSchema),
    total: z.number().nullish(),
    page: z.number().nullish(),
    limit: z.number().nullish(),
  }),
  z.array(businessBookingSchema).transform(items => ({
    data: items,
    total: items.length,
    page: 1,
    limit: items.length,
  })),
]);
export type BusinessBookingsPage = z.infer<typeof businessBookingsPageSchema>;

export interface BusinessBookingsQuery {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: string;
  date?: string;
  from?: string;
  to?: string;
}

export interface MyBookingsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export interface BookingPage {
  data: Booking[];
  total?: number | null;
  page?: number | null;
  limit?: number | null;
}

export const bookingsApi = {
  /** Business bookings with branch/date/status filters. */
  async listBusinessBookings(
    query: BusinessBookingsQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<BusinessBookingsPage> {
    return requestValidated<BusinessBookingsPage>(
      { method: 'GET', url: '/bookings', params: query, ...options },
      businessBookingsPageSchema,
    );
  },

  /** Business-side status change: confirm / check-in / cancel. */
  async updateBookingStatus(
    id: string,
    status: string,
    options: ApiRequestOptions = {},
  ): Promise<BusinessBooking> {
    return requestValidated<BusinessBooking>(
      {
        method: 'PATCH',
        url: `/bookings/${id}/status`,
        data: { status },
        ...options,
      },
      bookingSchema,
    );
  },

  // Customer-facing -------------------------------------------------------
  /**
   * Public: bookable slots for a branch on a date.
   *
   * `branchId` is required; pass `itemId` to get slots that fit that service's
   * duration. Closed days return `isClosed: true` with no slots, and a past
   * date is rejected with 400 — treat both as "nothing to book", not an error.
   */
  async getAvailability(
    query: { branchId: string; itemId?: string; date: string },
    options: ApiRequestOptions = {},
  ): Promise<BookingAvailability> {
    return requestValidated<BookingAvailability>(
      {
        method: 'GET',
        url: '/bookings/availability',
        params: query,
        ...options,
      },
      bookingAvailabilitySchema,
    );
  },

  /**
   * Book a slot (CUSTOMER). Creates a `booked` booking on the 30-minute grid.
   * A slot taken between the availability check and this call returns 400 —
   * surface it and re-fetch availability rather than retrying blindly.
   */
  async createBooking(
    payload: {
      branchId: string;
      itemId?: string;
      date: string;
      time: string;
      notes?: string;
    },
    options: ApiRequestOptions = {},
  ): Promise<Booking> {
    return requestValidated<Booking>(
      {
        method: 'POST',
        url: '/bookings',
        data: payload,
        ...options,
      },
      bookingSchema,
    );
  },

  /** The customer's own bookings, newest first. */
  async getMyBookings(
    query: MyBookingsQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<BookingPage> {
    return requestValidated<BookingPage>(
      {
        method: 'GET',
        url: '/me/bookings',
        params: query,
        ...options,
      },
      bookingPageSchema,
    );
  },

  /**
   * Cancel a booking the customer made. Only `booked`/`confirmed` bookings can
   * be cancelled; a completed one returns 400.
   */
  async cancelBooking(
    id: string,
    cancellationReason?: string,
    options: ApiRequestOptions = {},
  ): Promise<Booking> {
    return requestValidated<Booking>(
      {
        method: 'PATCH',
        url: `/bookings/${id}/cancel`,
        data: cancellationReason ? { cancellationReason } : {},
        ...options,
      },
      bookingSchema,
    );
  },
};
