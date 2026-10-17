import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import { nullableText } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Loyalty / Rewards endpoints.
 *
 * The public loyalty endpoints are unauthenticated (rewards list, details).
 * The customer-specific endpoints (balance, logs, use-code) require auth.
 *
 * None of these controllers are `@FosEnvelope()`-marked, so every payload here
 * arrives bare — the `{ success, data }` envelope is opt-in for the FOS modules
 * only (see `fos-envelope.interceptor.ts`).
 */

/**
 * `.catch()` rather than `.optional()`: these are entity columns with column
 * defaults, so a missing or `null` value means "read it as the default" instead
 * of "the caller must handle undefined". `expires`/`isActive` decide a card's
 * status, and a silent `undefined` there would render every reward as active.
 */
const defaultedNumber = (fallback: number) => z.number().catch(fallback);

export const rewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  pointsRequired: z.number().catch(0),
  category: z.enum([
    'custom_discount',
    'free_product',
    'service_upgrade',
    'tangible_gifts',
  ]),
  coverImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).nullish().default([]),
  businessId: z.string().nullable().optional(),
  /** Platform-wide (`global=true`) lists join the business and branch names. */
  business: z.looseObject({ id: z.string(), name: z.string().nullish() }).nullish(),
  branch: z.looseObject({ id: z.string(), name: z.string().nullish() }).nullish(),
  branchId: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),

  // Management fields — sent by every reward entity, but only read by the
  // owner-side catalogue. Present on the public list too, so one schema serves
  // both without the customer flows growing fields they never render.
  /** `-1` means unlimited stock. */
  totalQuantity: z.number().nullish().catch(null),
  remainingQuantity: z.number().nullish().catch(null),
  /** Paused rewards vanish from the public list but stay in the branch list. */
  isActive: z.boolean().optional().catch(true),
  expiryDate: z.string().nullish().catch(null),
  audienceType: z.string().optional().catch('all'),
});
export type Reward = z.infer<typeof rewardSchema>;

export const rewardListSchema = z.object({
  data: z.array(rewardSchema).nullish().default([]),
});
export type RewardList = z.infer<typeof rewardListSchema>;

export const loyaltyBalanceSchema = z.number();
export type LoyaltyBalance = z.infer<typeof loyaltyBalanceSchema>;

/**
 * One row of `GET /loyalty/points/logs`. The API sends a signed `amount` and a
 * lowercase `type` (`earned` | `redeemed`); the app reads an unsigned `points`
 * and `earned` | `spent` | `expired` | `manual`, so the row is normalised here.
 */
export const loyaltyLogSchema = z
  .looseObject({
    id: z.string(),
    type: z.string().catch('manual'),
    amount: z.union([z.number(), z.string()]).nullish(),
    points: z.number().nullish(),
    reason: z.string().nullable().optional(),
    businessId: z.string().nullable().optional(),
    branchId: z.string().nullable().optional(),
    branch: z.looseObject({ id: z.string(), name: z.string().nullish() }).nullish(),
    createdAt: z.string(),
  })
  .transform(raw => {
    const signed = Number(raw.points ?? raw.amount) || 0;
    const kind = raw.type.toLowerCase();
    const type: 'earned' | 'spent' | 'expired' | 'manual' =
      kind === 'redeemed' || kind === 'spent'
        ? 'spent'
        : kind === 'earned' || kind === 'expired'
          ? kind
          : 'manual';
    return {
      id: raw.id,
      type,
      points: Math.abs(signed),
      reason: raw.reason ?? null,
      businessId: raw.businessId ?? null,
      branchId: raw.branchId ?? raw.branch?.id ?? null,
      branchName: raw.branch?.name ?? null,
      createdAt: raw.createdAt,
    };
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

/**
 * `GET /loyalty/rules` — the single `loyalty_rules` row for a business or one
 * branch. The endpoint creates it on first read with the column defaults, so a
 * brand-new business always answers with a row rather than `null`.
 *
 * One row carries every earning rule the programme screen shows: the spend
 * rate, the visit award and cooldown, and the one-off bonuses. There is no
 * per-rule `isActive` — the row's own flag is the master switch.
 */
export const loyaltyRuleSchema = z.looseObject({
  id: z.string().catch(''),
  businessId: nullableText(),
  branchId: nullableText(),
  ruleType: z.enum(['spending', 'visit', 'hybrid']).catch('hybrid'),
  isActive: z.boolean().catch(true),
  spendingBaseAmount: defaultedNumber(10),
  spendingBasePoints: defaultedNumber(1),
  visitPoints: defaultedNumber(50),
  visitCooldownHours: defaultedNumber(24),
  firstVisitBonus: defaultedNumber(100),
  birthdayBonus: defaultedNumber(500),
  referralBonus: defaultedNumber(200),
});
export type LoyaltyRule = z.infer<typeof loyaltyRuleSchema>;

/** Rule numbers as the editor sheet holds them — every key optional, as PATCH's DTO is. */
export type LoyaltyRuleFieldKey =
  | 'spendingBaseAmount'
  | 'spendingBasePoints'
  | 'visitPoints'
  | 'visitCooldownHours'
  | 'firstVisitBonus'
  | 'birthdayBonus'
  | 'referralBonus';

/**
 * `PATCH /loyalty/rules` body — mirrors `UpdateLoyaltyRuleDto`, whose
 * `forbidNonWhitelisted` rejects any key not declared there, so nothing may be
 * added here without the DTO matching.
 */
export const updateLoyaltyRulesInput = z.object({
  ruleType: z.enum(['spending', 'visit', 'hybrid']).optional(),
  isActive: z.boolean().optional(),
  spendingBaseAmount: z.number().min(1).optional(),
  spendingBasePoints: z.number().min(1).optional(),
  visitPoints: z.number().min(0).optional(),
  visitCooldownHours: z.number().min(0).optional(),
  firstVisitBonus: z.number().min(0).optional(),
  birthdayBonus: z.number().min(0).optional(),
  referralBonus: z.number().min(0).optional(),
});
export type UpdateLoyaltyRulesInput = z.infer<typeof updateLoyaltyRulesInput>;

/**
 * `POST /loyalty/rewards` body — mirrors `CreateRewardDto`, whose required
 * `branchId`, `totalQuantity` and `expiryDate` are exactly the three the create
 * sheet has to collect. `totalQuantity: -1` is the API's "unlimited".
 */
export const createRewardInput = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  pointsRequired: z.number().min(1),
  category: z.enum([
    'custom_discount',
    'free_product',
    'service_upgrade',
    'tangible_gifts',
  ]),
  branchId: z.string().min(1),
  totalQuantity: z.number().refine(value => value !== 0, 'Quantity cannot be 0'),
  /** ISO date string (`YYYY-MM-DD` is accepted by `@IsDateString`). */
  expiryDate: z.string().min(4),
  audienceType: z.enum(['new', 'returning', 'all']).optional(),
});
export type CreateRewardInput = z.infer<typeof createRewardInput>;

/** Partial `PATCH /loyalty/rewards/:id` — same whitelist, every key optional. */
export const updateRewardInput = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  pointsRequired: z.number().min(1).optional(),
  totalQuantity: z
    .number()
    .refine(value => value !== 0, 'Quantity cannot be 0')
    .optional(),
  expiryDate: z.string().min(4).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateRewardInput = z.infer<typeof updateRewardInput>;

/**
 * `GET /loyalty/points/business-logs` — the owner-side point ledger, joined to
 * the customer and the branch it was booked against. This is what feeds the
 * "recent member redemptions" list: `amount` + `type` say which way the points
 * moved and `customer` says who.
 *
 * `type` is stored lowercase (`earned` | `redeemed`) even though the OpenAPI
 * example shouts `EARNED`, so it is kept as text here and compared
 * case-insensitively by the mapper.
 */
export const businessPointLogSchema = z.looseObject({
  id: z.string().catch(''),
  amount: z
    .union([z.number(), z.string()])
    .catch(0)
    .transform(value => Number(value) || 0),
  type: z.string().catch(''),
  reason: nullableText(),
  referenceCode: nullableText(),
  createdAt: z.string().nullable().catch(null),
  customer: z
    .looseObject({
      id: z.string().catch(''),
      firstName: nullableText(),
      lastName: nullableText(),
      avatar: nullableText(),
    })
    .nullish()
    .catch(null),
  branch: z
    .looseObject({ id: z.string().catch(''), name: nullableText() })
    .nullish()
    .catch(null),
});
export type BusinessPointLog = z.infer<typeof businessPointLogSchema>;

export const businessPointLogsResponse = z.object({
  data: z.array(businessPointLogSchema).nullish().default([]),
  total: z.number().catch(0),
  page: z.number().catch(1),
  limit: z.number().catch(10),
});
export type BusinessPointLogsResponse = z.infer<typeof businessPointLogsResponse>;

/** One business's points in the customer's wallet (`GET /loyalty/me/wallet`). */
export const walletEntrySchema = z.object({
  businessId: z.string(),
  businessName: z.string().nullable().optional(),
  businessLogo: z.string().nullable().optional(),
  points: z.number().catch(0),
});
export type WalletEntry = z.infer<typeof walletEntrySchema>;

/** A reward the customer redeemed (`GET /loyalty/me/redemptions`). */
export const customerRedemptionSchema = z.object({
  code: z.string(),
  redeemedAt: z.string().nullable().optional(),
  rewardId: z.string(),
  rewardName: z.string(),
  rewardImage: z.string().nullable().optional(),
  pointsSpent: z.number().catch(0),
  expiresAt: z.string().nullable().optional(),
  businessId: z.string(),
  businessName: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
});
export type CustomerRedemption = z.infer<typeof customerRedemptionSchema>;

export const loyaltyApi = {
  async getWallet(options: ApiRequestOptions = {}): Promise<WalletEntry[]> {
    return requestValidated(
      { method: 'GET', url: '/loyalty/me/wallet', ...options },
      z.array(walletEntrySchema),
    );
  },

  async getMyRedemptions(options: ApiRequestOptions = {}): Promise<CustomerRedemption[]> {
    return requestValidated(
      { method: 'GET', url: '/loyalty/me/redemptions', ...options },
      z.array(customerRedemptionSchema),
    );
  },

  /** Spend points on a reward (`POST /loyalty/redemption/redeem-reward`). */
  async redeemReward(
    rewardId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ success?: boolean; reward?: string; redemptionCode?: string }> {
    return requestValidated(
      {
        method: 'POST',
        url: '/loyalty/redemption/redeem-reward',
        data: { rewardId },
        ...options,
      },
      z.looseObject({
        success: z.boolean().optional(),
        reward: z.string().optional(),
        redemptionCode: z.string().optional(),
      }),
    );
  },

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

  /**
   * Owner/Manager/Admin: the business's (or one branch's) earning rules.
   *
   * Scoped by `branchId` only when one is picked — omit it to read the
   * business-wide row, which is what the backend upserts under
   * `{ businessId }` when no branch is given.
   */
  async getRules(
    branchId?: string | null,
    options: ApiRequestOptions = {},
  ): Promise<LoyaltyRule> {
    return requestValidated<LoyaltyRule>(
      {
        method: 'GET',
        url: '/loyalty/rules',
        params: branchId ? { branchId } : {},
        ...options,
      },
      loyaltyRuleSchema,
    );
  },

  /**
   * Owner/Admin: partial update of the earning rules (`PATCH /loyalty/rules`).
   *
   * The scope must match the `GET` that produced the values — a patch aimed at
   * the business-wide row sent with a `branchId` would silently create (and
   * then diverge from) a second row.
   */
  async updateRules(
    patch: UpdateLoyaltyRulesInput,
    branchId?: string | null,
    options: ApiRequestOptions = {},
  ): Promise<LoyaltyRule> {
    return requestValidated<LoyaltyRule>(
      {
        method: 'PATCH',
        url: '/loyalty/rules',
        params: branchId ? { branchId } : {},
        data: updateLoyaltyRulesInput.parse(patch),
        ...options,
      },
      loyaltyRuleSchema,
    );
  },

  /**
   * Every reward **on one branch**, including paused and expired ones.
   *
   * Deliberately the branch route rather than `GET /loyalty/rewards`: the
   * public listing hard-filters `isActive: true` and `expiryDate >= now`, so a
   * reward paused from this screen would disappear from it and could never be
   * resumed again. This route is the unfiltered management view.
   */
  async listBranchRewards(
    branchId: string,
    query: { page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<Reward[]> {
    const listSchema = z
      .union([
        z.array(rewardSchema),
        z.object({ data: z.array(rewardSchema).nullish().default([]) }),
      ])
      .transform(payload => (Array.isArray(payload) ? payload : (payload.data ?? [])));
    return requestValidated<Reward[]>(
      {
        method: 'GET',
        url: `/loyalty/rewards/branch/${branchId}`,
        params: { page: query.page ?? 1, limit: query.limit ?? 50 },
        ...options,
      },
      listSchema,
    );
  },

  /** Owner: `POST /loyalty/rewards` — a reward for exactly one branch. */
  async createReward(
    input: CreateRewardInput,
    options: ApiRequestOptions = {},
  ): Promise<Reward> {
    return requestValidated<Reward>(
      {
        method: 'POST',
        url: '/loyalty/rewards',
        data: createRewardInput.parse(input),
        ...options,
      },
      rewardSchema,
    );
  },

  /** `PATCH /loyalty/rewards/:id` — also how a reward is paused and resumed. */
  async updateReward(
    rewardId: string,
    patch: UpdateRewardInput,
    options: ApiRequestOptions = {},
  ): Promise<Reward> {
    return requestValidated<Reward>(
      {
        method: 'PATCH',
        url: `/loyalty/rewards/${rewardId}`,
        data: updateRewardInput.parse(patch),
        ...options,
      },
      rewardSchema,
    );
  },

  /** `DELETE /loyalty/rewards/:id` — answers `{ affected: 1 }`. */
  async deleteReward(rewardId: string, options: ApiRequestOptions = {}): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/loyalty/rewards/${rewardId}`,
      ...options,
    });
  },

  /**
   * Owner/Admin: `GET /loyalty/points/business-logs` — recent point movements
   * for the business, newest first. `businessId` is required by the DTO.
   */
  async getBusinessLogs(
    query: {
      businessId: string;
      branchId?: string | null;
      page?: number;
      limit?: number;
    },
    options: ApiRequestOptions = {},
  ): Promise<BusinessPointLogsResponse> {
    return requestValidated<BusinessPointLogsResponse>(
      {
        method: 'GET',
        url: '/loyalty/points/business-logs',
        params: {
          businessId: query.businessId,
          ...(query.branchId ? { branchId: query.branchId } : {}),
          page: query.page ?? 1,
          limit: query.limit ?? 10,
        },
        ...options,
      },
      businessPointLogsResponse,
    );
  },
};
