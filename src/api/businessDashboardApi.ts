import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableArray, nullableFlag, nullableText } from '@api/schemaHelpers';
import { profileBranchSchema } from '@api/businessProfileApi';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Owner-side Overview dashboard endpoints.
 *
 * Two of the response shapes are only half-documented in API-BREAKDOWN.md:
 *
 * - `DashboardStatsDto` (the metric tiles) is named but its fields are not
 *   listed, so `stats` parses as a loose record and the screen picks values
 *   through candidate keys (`pickStat`). Any field the backend does not send
 *   renders as "—" rather than silently keeping design placeholder numbers.
 * - `GET /catalogue/offers/claims` declares no response at all, so it accepts
 *   either a bare array or a `{ data }` envelope.
 *
 * Both asks are tracked in backend-fixies.md §10.
 */

/** A record whose keys the docs do not enumerate. */
const looseRecord = z.looseObject({});

/** An array of objects whose fields the docs do not enumerate. */
const looseObjectArray = z.array(looseRecord);

/** Numbers may arrive as JSON numbers or numeric strings. */
const looseCount = z.union([z.number(), z.string(), z.null()]).optional();

/** A count that may arrive as a number, a numeric string, or null. */
const toCount = z
  .union([z.number(), z.string(), z.null()])
  .transform(value => (value === null ? 0 : Number(value) || 0));

const listEnvelope = z.looseObject({
  data: looseObjectArray,
  total: z.union([z.number(), z.string(), z.null()]).optional(),
});

const claimsResponse = z.union([
  looseObjectArray,
  listEnvelope.transform(payload => payload.data),
  z.looseObject({ claims: looseObjectArray }).transform(payload => payload.claims),
]);

export const myBusinessSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  isVerified: nullableFlag(false),
  city: nullableText(),
  state: nullableText(),
  address: nullableText(),
  branches: nullableArray(profileBranchSchema),
});
export type MyBusiness = z.infer<typeof myBusinessSchema>;

export const businessDashboardSchema = z.looseObject({
  businessName: nullableText(),
  businessLogo: nullableText(),
  stats: looseRecord.default({}),
  recentVisitors: nullableArray(looseRecord),
  activityData: nullableArray(looseRecord),
  rewards: nullableArray(looseRecord),
  notifications: nullableArray(looseRecord),
  messages: nullableArray(looseRecord),
  staffMembers: nullableArray(looseRecord),
  devices: nullableArray(looseRecord),
});
export type BusinessDashboard = z.infer<typeof businessDashboardSchema>;

export const posDashboardSchema = z.looseObject({
  revenue: looseCount,
  transactionCount: looseCount,
  averageSaleValue: looseCount,
  paymentBreakdown: z.unknown().optional(),
});
export type PosDashboard = z.infer<typeof posDashboardSchema>;

export const unreadCountSchema = toCount.or(
  z.looseObject({ count: z.number() }).transform(payload => payload.count),
);
export type UnreadCount = z.infer<typeof unreadCountSchema>;

export const newOrdersCountSchema = z.union([
  // List endpoints answer `{ data; total; … }`; tolerate a bare array too.
  listEnvelope.transform(payload =>
    payload.total === null || payload.total === undefined
      ? payload.data.length
      : Number(payload.total) || 0,
  ),
  looseObjectArray.transform(items => items.length),
]);
export type NewOrdersCount = z.infer<typeof newOrdersCountSchema>;

export const pendingClaimsSchema = claimsResponse;
export type PendingClaim = z.infer<typeof looseRecord>;

export const businessDashboardApi = {
  /** The caller's business with its branches — drives the header and switcher. */
  async getMyBusiness(options: ApiRequestOptions = {}): Promise<MyBusiness> {
    return requestValidated<MyBusiness>(
      { method: 'GET', url: '/businesses/my-business', ...options },
      myBusinessSchema,
    );
  },

  /**
   * Overview payload for one branch (`branchId` is required by the API).
   * Stats, activity chart, messages, notifications, staff and devices.
   */
  async getBusinessDashboard(
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<BusinessDashboard> {
    return requestValidated<BusinessDashboard>(
      {
        method: 'GET',
        url: '/business-dashboard',
        params: { branchId },
        ...options,
      },
      businessDashboardSchema,
    );
  },

  /** POS revenue + transaction count; optional branch filter. */
  async getPosDashboard(
    branchId: string | null,
    options: ApiRequestOptions = {},
  ): Promise<PosDashboard> {
    return requestValidated<PosDashboard>(
      {
        method: 'GET',
        url: '/pos/dashboard',
        params: branchId ? { branchId } : {},
        ...options,
      },
      posDashboardSchema,
    );
  },

  /** Unread notification count for the signed-in user (any role). */
  async getUnreadCount(options: ApiRequestOptions = {}): Promise<number> {
    return requestValidated<number>(
      { method: 'GET', url: '/notifications/unread-count', ...options },
      unreadCountSchema,
    );
  },

  /** How many orders are waiting on the business (`status=new`). */
  async getNewOrdersCount(options: ApiRequestOptions = {}): Promise<number> {
    return requestValidated<number>(
      {
        method: 'GET',
        url: '/catalogue/orders',
        params: { status: 'new', limit: 1 },
        ...options,
      },
      newOrdersCountSchema,
    );
  },

  /** Promotion claims for the business; response shape is undocumented. */
  async getClaims(options: ApiRequestOptions = {}): Promise<PendingClaim[]> {
    return requestValidated<PendingClaim[]>(
      { method: 'GET', url: '/catalogue/offers/claims', ...options },
      pendingClaimsSchema,
    );
  },
};
