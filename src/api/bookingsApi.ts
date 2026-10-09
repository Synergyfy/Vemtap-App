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

export const businessBookingSchema = z.object({
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
});
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
      businessBookingSchema,
    );
  },
};
