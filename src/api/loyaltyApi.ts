import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Loyalty / Rewards endpoints.
 *
 * The public loyalty endpoints are unauthenticated (rewards list, details).
 * The customer-specific endpoints (balance, logs, use-code) require auth.
 */

export const rewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  pointsRequired: z.number(),
  category: z.enum([
    'custom_discount',
    'free_product',
    'service_upgrade',
    'tangible_gifts',
  ]),
  coverImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).nullish().default([]),
  businessId: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});
export type Reward = z.infer<typeof rewardSchema>;

export const rewardListSchema = z.object({
  data: z.array(rewardSchema).nullish().default([]),
});
export type RewardList = z.infer<typeof rewardListSchema>;

export const loyaltyBalanceSchema = z.number();
export type LoyaltyBalance = z.infer<typeof loyaltyBalanceSchema>;

export const loyaltyLogSchema = z.object({
  id: z.string(),
  type: z.enum(['earned', 'spent', 'expired', 'manual']),
  points: z.number(),
  reason: z.string().nullable().optional(),
  businessId: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type LoyaltyLog = z.infer<typeof loyaltyLogSchema>;

export const loyaltyLogsSchema = z.union([
  z.object({
    data: z.array(loyaltyLogSchema).nullish().default([]),
    total: z.number().nullable().optional(),
    page: z.number().nullable().optional(),
    limit: z.number().nullable().optional(),
  }),
  z.array(loyaltyLogSchema),
]);
export type LoyaltyLogs = z.infer<typeof loyaltyLogsSchema>;

export const usePointCodeSchema = z.object({
  success: z.boolean(),
  points: z.number().nullable().optional(),
});
export type UsePointCodeResult = z.infer<typeof usePointCodeSchema>;

/** Coerce one analytics stat (number, "₦1,200", null…) to a finite number. */
function toStat(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (cleaned === '') return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const analyticsStatSchema = z.union([z.number(), z.string()]).nullish().transform(toStat);

const trendPointSchema = z.object({
  totalVisits: analyticsStatSchema,
  rewardPoints: analyticsStatSchema,
  netSavings: analyticsStatSchema,
});
export type LoyaltyTrends = z.infer<typeof trendPointSchema>;

function sumStat(points: unknown[], key: keyof LoyaltyTrends): number | null {
  let total: number | null = null;
  for (const point of points) {
    if (point && typeof point === 'object') {
      const value = toStat((point as Record<string, unknown>)[key]);
      if (value !== null) total = (total ?? 0) + value;
    }
  }
  return total;
}

/**
 * `GET /loyalty/analytics` documents `trends` as `{ totalVisits, rewardPoints,
 * netSavings }`, but older responses have shipped it as an array of points (or
 * null). Normalise every shape to one object so callers can read it without
 * runtime surprises.
 */
function normalizeTrends(raw: unknown): unknown {
  if (Array.isArray(raw)) {
    return {
      totalVisits: sumStat(raw, 'totalVisits'),
      rewardPoints: sumStat(raw, 'rewardPoints'),
      netSavings: sumStat(raw, 'netSavings'),
    };
  }
  if (raw && typeof raw === 'object') return raw;
  return null;
}

/**
 * `GET /loyalty/analytics` returns the customer's totals at the **top level**
 * and change indicators under `trends`. Verified against the live server:
 *
 * ```json
 * { "totalVisits": 1, "currentPointsBalance": 0, "netSavings": 0,
 *   "trends": { "totalVisits": "+1", "rewardPoints": "0", "netSavings": "0" } }
 * ```
 *
 * The schema used to parse only `trends`, so every consumer that asked for
 * "Saved Total" was reading the signed *change* (the `+1`) rather than the
 * total. Totals are now read from the top level, with `trends` kept as the
 * fallback so trends-only payloads (and the array form) still resolve.
 *
 * The exact semantics of `trends` — percent (`"+25%"`) versus absolute
 * (`"+1"`) — is not documented by the backend and is unconfirmed; it is kept
 * parsed for the savings growth indicator but must not be shown as a total.
 */
export const loyaltyAnalyticsSchema = z
  .object({
    totalVisits: analyticsStatSchema,
    currentPointsBalance: analyticsStatSchema,
    netSavings: analyticsStatSchema,
    trends: z.preprocess(normalizeTrends, trendPointSchema.nullable()).catch(null),
  })
  .transform(raw => ({
    totals: {
      totalVisits: raw.totalVisits ?? raw.trends?.totalVisits ?? null,
      // `rewardPoints` is the long-standing internal name for the point
      // balance; the API spells the same total `currentPointsBalance`.
      rewardPoints: raw.currentPointsBalance ?? raw.trends?.rewardPoints ?? null,
      netSavings: raw.netSavings ?? raw.trends?.netSavings ?? null,
    },
    trends: raw.trends,
  }));
export type LoyaltyAnalytics = z.infer<typeof loyaltyAnalyticsSchema>;

export const loyaltyApi = {
  /**
   * Public: list available rewards for a branch/business.
   * Unauthenticated — but the API rejects a scopeless call, so pass a
   * businessId unless the caller has branch context.
   */
  async listRewards(
    businessId?: string | null,
    options: ApiRequestOptions = {},
  ): Promise<Reward[]> {
    const result = await requestValidated<RewardList>(
      {
        method: 'GET',
        url: '/loyalty/rewards',
        params: businessId ? { businessId } : {},
        ...options,
      },
      rewardListSchema,
    );
    return result.data ?? [];
  },

  /**
   * Public: get reward details by ID.
   * Unauthenticated.
   */
  async getReward(id: string, options: ApiRequestOptions = {}): Promise<Reward> {
    return requestValidated<Reward>(
      { method: 'GET', url: `/loyalty/item-details/${id}`, ...options },
      rewardSchema,
    );
  },

  /**
   * Customer: get current point balance for a business.
   * Auth: Bearer JWT, CUSTOMER role.
   * businessId is optional — omit for global balance across all businesses.
   */
  async getBalance(
    businessId: string | null,
    options: ApiRequestOptions = {},
  ): Promise<number> {
    return requestValidated<number>(
      {
        method: 'GET',
        url: '/loyalty/points/balance',
        params: businessId ? { businessId } : {},
        ...options,
      },
      loyaltyBalanceSchema,
    );
  },

  /**
   * Customer: fetch paginated point transaction history.
   * Auth: Bearer JWT, CUSTOMER role.
   */
  async getLogs(
    params: { businessId?: string; page: number; limit: number },
    options: ApiRequestOptions = {},
  ): Promise<LoyaltyLogs> {
    return requestValidated<LoyaltyLogs>(
      {
        method: 'GET',
        url: '/loyalty/points/logs',
        params,
        ...options,
      },
      loyaltyLogsSchema,
    );
  },

  /**
   * Customer: aggregated visits, points and savings over a window.
   * Auth: Bearer JWT, CUSTOMER role.
   */
  async getAnalytics(
    days: number,
    options: ApiRequestOptions = {},
  ): Promise<LoyaltyAnalytics> {
    return requestValidated<LoyaltyAnalytics>(
      {
        method: 'GET',
        url: '/loyalty/analytics',
        params: { days },
        ...options,
      },
      loyaltyAnalyticsSchema,
    );
  },

  /**
   * Customer: redeem a 9-digit point code.
   * Auth: Bearer JWT, CUSTOMER role. Responds 201.
   */
  async usePointCode(
    code: string,
    options: ApiRequestOptions = {},
  ): Promise<UsePointCodeResult> {
    return requestValidated<UsePointCodeResult>(
      {
        method: 'POST',
        url: '/loyalty/points/use-code',
        data: { code },
        ...options,
      },
      usePointCodeSchema,
    );
  },
};
