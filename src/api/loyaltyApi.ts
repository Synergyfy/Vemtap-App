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
 * One labelled period-over-period comparison from `growthVsPreviousPeriod`.
 * `percent` is `null` when the previous period had no activity — the backend
 * deliberately does not report a misleading 0% (or Infinity), so callers must
 * render nothing rather than coerce it to zero.
 */
const savingsGrowthMetricSchema = z.object({
  current: z.number().nullish(),
  previous: z.number().nullish(),
  percent: z.number().nullable().optional(),
});
export type SavingsGrowthMetric = z.infer<typeof savingsGrowthMetricSchema>;

const savingsGrowthSchema = z.object({
  periodDays: z.number().nullish(),
  netSavings: savingsGrowthMetricSchema.nullish(),
  dealsRedeemed: savingsGrowthMetricSchema.nullish(),
});
export type SavingsGrowth = z.infer<typeof savingsGrowthSchema>;

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
 * **`netSavings` is now naira** — the real amount saved on redeemed claims.
 * The old points proxy is published separately as `redeemedPoints`, so the
 * point figure keeps its own name here.
 *
 * The exact semantics of `trends` — percent (`"+25%"`) versus absolute
 * (`"+1"`) — is not documented by the backend and is unconfirmed; it is kept
 * parsed for the savings growth indicator but must not be shown as a total.
 * Prefer `growth`, which is labelled and naira-based.
 */
export const loyaltyAnalyticsSchema = z
  .object({
    totalVisits: analyticsStatSchema,
    currentPointsBalance: analyticsStatSchema,
    netSavings: analyticsStatSchema,
    redeemedPoints: analyticsStatSchema,
    dealsRedeemed: analyticsStatSchema,
    avgDiscountPercent: analyticsStatSchema,
    growthVsPreviousPeriod: savingsGrowthSchema.nullish(),
    trends: z.preprocess(normalizeTrends, trendPointSchema.nullable()).catch(null),
  })
  .transform(raw => ({
    totals: {
      totalVisits: raw.totalVisits ?? raw.trends?.totalVisits ?? null,
      // `rewardPoints` is the long-standing internal name for the point
      // balance; the API spells the same total `currentPointsBalance`.
      rewardPoints: raw.currentPointsBalance ?? raw.trends?.rewardPoints ?? null,
      // Naira saved on redeemed claims (was a points proxy before Phase 3).
      netSavings: raw.netSavings ?? raw.trends?.netSavings ?? null,
      redeemedPoints: raw.redeemedPoints ?? null,
      dealsRedeemed: raw.dealsRedeemed ?? null,
      avgDiscountPercent: raw.avgDiscountPercent ?? null,
    },
    /** Labelled period-over-period comparison; `percent` is null without a baseline. */
    growth: raw.growthVsPreviousPeriod ?? null,
    trends: raw.trends,
  }));
export type LoyaltyAnalytics = z.infer<typeof loyaltyAnalyticsSchema>;

/**
 * `GET /loyalty/points/tier` — server-authoritative tier for the customer's
 * point balance. The thresholds match the app's former `rewardTiers.ts`, which
 * can now be dropped in favour of this endpoint.
 */
export const loyaltyTierThresholdSchema = z.object({
  name: z.string(),
  minPoints: z.number(),
});
export type LoyaltyTierThreshold = z.infer<typeof loyaltyTierThresholdSchema>;

export const loyaltyTierSchema = z.object({
  points: z.number().nullish().default(0),
  tier: z.string().nullish(),
  nextTier: z.string().nullable().optional(),
  pointsToNext: z.number().nullable().optional(),
  progressPercent: z.number().nullable().optional(),
  thresholds: z.array(loyaltyTierThresholdSchema).nullish().default([]),
});
export type LoyaltyTier = z.infer<typeof loyaltyTierSchema>;

/** Business-side loyalty stats (Business hub Loyalty module). */
export const loyaltyBusinessStatsSchema = z.looseObject({
  stats: z
    .array(
      z.looseObject({
        label: z.string().nullish(),
        value: z.string().nullish(),
        change: z.number().nullish(),
      }),
    )
    .nullish()
    .transform(value => value ?? []),
  growthForecast: z.string().nullish(),
});
export type LoyaltyBusinessStats = z.infer<typeof loyaltyBusinessStatsSchema>;

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
    // No business context (e.g. the Rewards card on the customer dashboard)?
    // `global=true` returns platform-wide rewards. Without a scope the API
    // rejects the call with 400.
    const params: Record<string, string> = businessId
      ? { businessId }
      : { global: 'true' };
    const result = await requestValidated<RewardList>(
      {
        method: 'GET',
        url: '/loyalty/rewards',
        params,
        ...options,
      },
      rewardListSchema,
    );
    return result.data ?? [];
  },

  /**
   * Public: platform-wide rewards, for callers with no business context.
   * Unauthenticated.
   */
  async listGlobalRewards(options: ApiRequestOptions = {}): Promise<Reward[]> {
    const result = await requestValidated<RewardList>(
      {
        method: 'GET',
        url: '/loyalty/rewards',
        params: { global: 'true' },
        ...options,
      },
      rewardListSchema,
    );
    return result.data ?? [];
  },

  /**
   * Customer: tier for the current point balance.
   * Auth: Bearer JWT, CUSTOMER role. Server-authoritative thresholds.
   */
  async getTier(options: ApiRequestOptions = {}): Promise<LoyaltyTier> {
    return requestValidated<LoyaltyTier>(
      { method: 'GET', url: '/loyalty/points/tier', ...options },
      loyaltyTierSchema,
    );
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
    options: ApiRequestOptions & { allTime?: boolean } = {},
  ): Promise<LoyaltyAnalytics> {
    const { allTime, ...requestOptions } = options;
    return requestValidated<LoyaltyAnalytics>(
      {
        method: 'GET',
        url: '/loyalty/analytics',
        // `allTime` is the backend's escape hatch for the "All Time" timeframe
        // chip; when set it wins over `days`.
        params: allTime ? { allTime: 'true' } : { days },
        ...requestOptions,
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

  /**
   * Owner: business loyalty stats (customers, points issued, redemptions,
   * active programmes). Auth: Bearer JWT, OWNER/MANAGER/STAFF/ADMIN.
   */
  async getBusinessStats(
    branchId?: string | null,
    options: ApiRequestOptions = {},
  ): Promise<LoyaltyBusinessStats> {
    return requestValidated<LoyaltyBusinessStats>(
      {
        method: 'GET',
        url: '/loyalty/business-stats',
        params: branchId ? { branchId } : {},
        ...options,
      },
      loyaltyBusinessStatsSchema,
    );
  },
};
