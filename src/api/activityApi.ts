import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableNumber } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * The customer's own activity (`GET /me/activity`): claims, orders, bookings,
 * visits, deal reviews and product comments as one timeline, newest first.
 */

export type ActivityKind = 'claim' | 'order' | 'booking' | 'visit' | 'review' | 'comment';
export type ActivityFilter =
  'all' | 'claims' | 'orders' | 'bookings' | 'visits' | 'reviews';

export const activityRowSchema = z.object({
  kind: z.enum(['claim', 'order', 'booking', 'visit', 'review', 'comment']),
  id: z.string(),
  at: z.string(),
  refId: z.string().nullable().optional(),
  businessId: z.string().nullable().optional(),
  businessName: z.string().nullable().optional(),
  businessCode: z.string().nullable().optional(),
  businessLogo: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
  branchAddress: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  rating: z.number().nullable().optional(),
  body: z.string().nullable().optional(),
  reply: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
});
export type ActivityRow = z.infer<typeof activityRowSchema>;

export const activityPageSchema = z.object({
  data: z.array(activityRowSchema),
  total: nullableNumber(0),
  page: nullableNumber(1),
  limit: nullableNumber(20),
});
export type ActivityPage = z.infer<typeof activityPageSchema>;

export const activitySummarySchema = z.object({
  claimed: nullableNumber(0),
  redeemed: nullableNumber(0),
  orders: nullableNumber(0),
  bookings: nullableNumber(0),
  visits: nullableNumber(0),
  reviews: nullableNumber(0),
  businesses: nullableNumber(0),
});
export type ActivitySummary = z.infer<typeof activitySummarySchema>;

/** The customer side of this account, shown before an owner switches modes. */
export const switchPreviewSchema = z.object({
  activeClaims: z.number().catch(0),
  savedPlaces: z.number().catch(0),
  savedDeals: z.number().catch(0),
  latestClaim: z
    .object({
      offerId: z.string().nullable(),
      title: z.string().nullable(),
      businessName: z.string().nullable(),
    })
    .nullable()
    .catch(null),
});
export type SwitchPreview = z.infer<typeof switchPreviewSchema>;

export const activityApi = {
  async list(
    query: { kind?: ActivityFilter; from?: string; page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<ActivityPage> {
    return requestValidated(
      { method: 'GET', url: '/me/activity', params: query, ...options },
      activityPageSchema,
    );
  },

  async switchPreview(options: ApiRequestOptions = {}): Promise<SwitchPreview> {
    return requestValidated(
      { method: 'GET', url: '/me/activity/switch-preview', ...options },
      switchPreviewSchema,
    );
  },

  async summary(
    query: { from?: string } = {},
    options: ApiRequestOptions = {},
  ): Promise<ActivitySummary> {
    return requestValidated(
      { method: 'GET', url: '/me/activity/summary', params: query, ...options },
      activitySummarySchema,
    );
  },
};
