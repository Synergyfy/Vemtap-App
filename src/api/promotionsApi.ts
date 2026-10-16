import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';
import { decimal, nullableDecimal } from '@api/schemaHelpers';

/**
 * Sponsored campaigns: promotion campaigns (`/promotions`, the Create Campaign
 * wizard) and boosts (`/boosts`, the Boost wizard). The backend serves both
 * from one controller over one table, differing only in `kind` and in which
 * wizard fields launch requires, so one schema set and one client factory
 * cover both. Shapes follow `apps/backend/src/modules/promotions`
 * (`SaveCampaignDto`, `view()`, `stats()`, `options()`).
 *
 * Not `/campaigns`, which is the WhatsApp/SMS message blast.
 */

export const PROMOTION_STATUSES = [
  'Draft',
  'Pending',
  'Active',
  'Paused',
  'Ended',
] as const;
export const promotionStatusSchema = z.enum(PROMOTION_STATUSES);
export type PromotionStatus = z.infer<typeof promotionStatusSchema>;

export const promotionAssetTypeSchema = z.enum(['deal', 'product', 'service', 'profile']);
export type PromotionAssetType = z.infer<typeof promotionAssetTypeSchema>;

/** A listing the content step can feature (`GET /promotions/eligible-assets`). */
export const promotionEligibleAssetSchema = z.object({
  type: promotionAssetTypeSchema,
  id: z.string(),
  title: z.string(),
  image: z.string().nullish(),
  price: nullableDecimal(),
  wasPrice: nullableDecimal(),
  priorClaims: z.number().nullish(),
});
export type PromotionEligibleAsset = z.infer<typeof promotionEligibleAssetSchema>;

export const promotionAssetRefSchema = z.object({
  type: promotionAssetTypeSchema,
  id: z.string(),
});
export type PromotionAssetRef = z.infer<typeof promotionAssetRefSchema>;

export const promotionAudienceSchema = z.object({
  strategy: z.string().optional(),
  segmentIds: z.array(z.string()).optional(),
  cohorts: z.array(z.string()).optional(),
  branchIds: z.array(z.string()).optional(),
  clusterIds: z.array(z.string()).optional(),
  radiusKm: z.number().optional(),
});
export type PromotionAudience = z.infer<typeof promotionAudienceSchema>;

export const promotionScheduleSchema = z.object({
  durationDays: z.number().int().min(1),
  instantLaunch: z.boolean().optional(),
  startAt: z.string().optional(),
  dayparting: z.boolean().optional(),
  windows: z.array(z.string()).optional(),
  /** 0 = Sunday … 6 = Saturday. */
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  autoRenew: z.boolean().optional(),
});
export type PromotionSchedule = z.infer<typeof promotionScheduleSchema>;

export const promotionBudgetModeSchema = z.enum(['total', 'daily']);
export type PromotionBudgetMode = z.infer<typeof promotionBudgetModeSchema>;

/** `SaveCampaignDto`: create a draft, or patch any step of one. */
export const savePromotionInputSchema = z.object({
  name: z.string().min(1).optional(),
  /** Promotions only. */
  objective: z.string().optional(),
  /** Boosts only. */
  goalId: z.string().optional(),
  /** A boost has exactly one asset. */
  assets: z.array(promotionAssetRefSchema).optional(),
  audience: promotionAudienceSchema.optional(),
  placements: z.array(z.string()).optional(),
  schedule: promotionScheduleSchema.optional(),
  budgetMode: promotionBudgetModeSchema.optional(),
  /** Total budget (₦) when `budgetMode` is `total`. */
  budget: z.number().min(0).optional(),
  /** Per-day budget (₦) when `budgetMode` is `daily`. */
  dailyBudget: z.number().min(0).optional(),
  branchId: z.string().uuid().optional(),
});
export type SavePromotionInput = z.input<typeof savePromotionInputSchema>;

export const promotionSchema = z.object({
  id: z.string(),
  kind: z.string().optional(),
  name: z.string(),
  status: promotionStatusSchema,
  objective: z.string().nullish(),
  goalId: z.string().nullish(),
  assets: z.array(promotionAssetRefSchema).default([]),
  audience: promotionAudienceSchema.nullish(),
  placements: z.array(z.string()).nullish(),
  schedule: promotionScheduleSchema.nullish(),
  budgetMode: promotionBudgetModeSchema.nullish(),
  budget: decimal(),
  dailyBudget: nullableDecimal(),
  spent: decimal(),
  remaining: decimal(),
  fundingSource: z.enum(['wallet', 'card']).nullish(),
  awaitingPayment: z.boolean().optional(),
  paymentReference: z.string().nullish(),
  branchId: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  launchedAt: z.string().nullish(),
  impressions: z.number().nullish(),
  clicks: z.number().nullish(),
  conversions: z.number().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export type Promotion = z.infer<typeof promotionSchema>;

export const promotionsPageSchema = z.object({
  data: z.array(promotionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasNextPage: z.boolean(),
});
export type PromotionsPage = z.infer<typeof promotionsPageSchema>;

/** Hub header numbers (`GET /promotions/summary`). */
export const promotionSummarySchema = z.object({
  live: z.number(),
  scheduled: z.number(),
  paused: z.number(),
  drafts: z.number(),
  ended: z.number(),
  totalBudget: decimal(),
  totalSpent: decimal(),
  audienceReached: z.number(),
  claims: z.number(),
  redemptions: z.number(),
  revenue: decimal(),
});
export type PromotionSummary = z.infer<typeof promotionSummarySchema>;

/** Reach and claims estimate for a budget; an estimate, never a promise. */
export const promotionForecastSchema = z.object({
  budget: decimal(),
  durationDays: z.number(),
  dailyPace: decimal(),
  radiusKm: z.number(),
  reachMin: z.number(),
  reachMax: z.number(),
  claimsMin: z.number(),
  claimsMax: z.number(),
  audienceCapped: z.boolean(),
  /** People within the radius: the most any budget can reach (newer API). */
  audiencePopulation: z.number().optional(),
  isEstimate: z.boolean().optional(),
});
export type PromotionForecast = z.infer<typeof promotionForecastSchema>;

export const promotionForecastInputSchema = z.object({
  budget: z.number().min(0).optional(),
  dailyBudget: z.number().min(0).optional(),
  durationDays: z.number().int().min(1).optional(),
  radiusKm: z.number().optional(),
});
export type PromotionForecastInput = z.input<typeof promotionForecastInputSchema>;

/** The Paystack checkout a card-funded launch opens for the wallet shortfall. */
export const promotionCheckoutSchema = z.object({
  reference: z.string(),
  amount: decimal(),
  bonus: decimal().optional(),
  accessCode: z.string().nullish(),
  authorizationUrl: z.string().nullish(),
});
export type PromotionCheckout = z.infer<typeof promotionCheckoutSchema>;

export const launchedPromotionSchema = promotionSchema.extend({
  checkout: promotionCheckoutSchema.optional(),
});
export type LaunchedPromotion = z.infer<typeof launchedPromotionSchema>;

export const promotionStatsSchema = z.object({
  id: z.string(),
  status: promotionStatusSchema,
  kpis: z.object({
    budget: decimal(),
    spent: decimal(),
    left: decimal(),
    percentConsumed: z.number(),
    redemptions: z.number(),
    grossRevenue: decimal(),
    reach: z.number(),
    returnOnSpend: nullableDecimal(),
  }),
  funnel: z.array(z.object({ id: z.string(), label: z.string(), value: z.number() })),
  /** Views (impressions) and claims per hour of day, Lagos time. */
  rhythm: z.array(
    z.object({ hour: z.number(), views: z.number().optional(), claims: z.number() }),
  ),
  byBranch: z.array(
    z.object({ branchId: z.string(), name: z.string(), claims: z.number() }),
  ),
  series: z.array(z.object({ date: z.string(), spend: decimal(), claims: z.number() })),
  // Optional: servers before run comparison / benchmarks do not send these.
  /** The run to compare with (renewed-from, else the last run of the same deal). */
  previous: z
    .object({
      id: z.string(),
      name: z.string(),
      endDate: z.string().nullish(),
      reach: z.number(),
      claims: z.number(),
      redemptions: z.number(),
      spent: decimal(),
      costPerClaim: nullableDecimal(),
    })
    .nullish(),
  /** Platform-wide cost per claim (last 90 days); null until there is enough data. */
  benchmark: z.object({ costPerClaim: decimal(), campaigns: z.number() }).nullish(),
});
export type PromotionStats = z.infer<typeof promotionStatsSchema>;

const optionSchema = z.object({ id: z.string(), label: z.string() });

/** Wizard option sets (`GET /promotions/options`, `GET /boosts/options`). */
export const sponsoredCampaignOptionsSchema = z.object({
  radiusKm: z.array(z.number()),
  placements: z.array(optionSchema),
  daypartWindows: z.array(optionSchema.extend({ start: z.string(), end: z.string() })),
  durationsDays: z.array(z.number()),
  budgetModes: z.array(z.string()),
  minBudget: z.number(),
  budgetTiers: z.array(
    z.object({ id: z.string(), amount: z.number(), label: z.string() }),
  ),
  /** Boosts. */
  goals: z.array(optionSchema).optional(),
  audienceScopes: z.array(optionSchema).optional(),
  /** Promotions. */
  objectives: z.array(optionSchema).optional(),
  strategies: z.array(optionSchema).optional(),
  cohorts: z.array(optionSchema).optional(),
});
export type SponsoredCampaignOptions = z.infer<typeof sponsoredCampaignOptionsSchema>;

/** One client per resource; `/promotions` and `/boosts` share every route. */
export function createSponsoredCampaignApi(basePath: '/promotions' | '/boosts') {
  return {
    async list(
      params: { status?: PromotionStatus; page?: number; limit?: number } = {},
      options: ApiRequestOptions = {},
    ): Promise<PromotionsPage> {
      return requestValidated<PromotionsPage>(
        { method: 'GET', url: basePath, params, ...options },
        promotionsPageSchema,
      );
    },

    async summary(options: ApiRequestOptions = {}): Promise<PromotionSummary> {
      return requestValidated<PromotionSummary>(
        { method: 'GET', url: `${basePath}/summary`, ...options },
        promotionSummarySchema,
      );
    },

    async options(options: ApiRequestOptions = {}): Promise<SponsoredCampaignOptions> {
      return requestValidated<SponsoredCampaignOptions>(
        { method: 'GET', url: `${basePath}/options`, ...options },
        sponsoredCampaignOptionsSchema,
      );
    },

    async create(
      input: SavePromotionInput,
      options: ApiRequestOptions = {},
    ): Promise<Promotion> {
      return requestValidated<Promotion>(
        {
          method: 'POST',
          url: basePath,
          data: savePromotionInputSchema.parse(input),
          ...options,
        },
        promotionSchema,
      );
    },

    async get(id: string, options: ApiRequestOptions = {}): Promise<Promotion> {
      return requestValidated<Promotion>(
        { method: 'GET', url: `${basePath}/${id}`, ...options },
        promotionSchema,
      );
    },

    async update(
      id: string,
      input: SavePromotionInput,
      options: ApiRequestOptions = {},
    ): Promise<Promotion> {
      return requestValidated<Promotion>(
        {
          method: 'PATCH',
          url: `${basePath}/${id}`,
          data: savePromotionInputSchema.parse(input),
          ...options,
        },
        promotionSchema,
      );
    },

    /**
     * Reserve the budget from the ad wallet and go live (or scheduled). With
     * `card`, a wallet shortfall comes back as a Paystack `checkout`; the paid
     * top-up launches the campaign server-side.
     */
    async launch(
      id: string,
      input: {
        fundingSource?: 'wallet' | 'card';
        callbackUrl?: string;
        /** Card funding: charge the shortfall to the saved card, no checkout. */
        useSavedCard?: boolean;
        /** Card funding through checkout: keep the card (owner consent). */
        saveCard?: boolean;
      } = {},
      options: ApiRequestOptions = {},
    ): Promise<LaunchedPromotion> {
      return requestValidated<LaunchedPromotion>(
        { method: 'POST', url: `${basePath}/${id}/launch`, data: input, ...options },
        launchedPromotionSchema,
      );
    },

    async pause(id: string, options: ApiRequestOptions = {}): Promise<Promotion> {
      return requestValidated<Promotion>(
        { method: 'POST', url: `${basePath}/${id}/pause`, ...options },
        promotionSchema,
      );
    },

    async resume(id: string, options: ApiRequestOptions = {}): Promise<Promotion> {
      return requestValidated<Promotion>(
        { method: 'POST', url: `${basePath}/${id}/resume`, ...options },
        promotionSchema,
      );
    },

    /** End now; the unspent budget returns to the ad wallet. */
    async end(id: string, options: ApiRequestOptions = {}): Promise<Promotion> {
      return requestValidated<Promotion>(
        { method: 'POST', url: `${basePath}/${id}/end`, ...options },
        promotionSchema,
      );
    },

    async stats(id: string, options: ApiRequestOptions = {}): Promise<PromotionStats> {
      return requestValidated<PromotionStats>(
        { method: 'GET', url: `${basePath}/${id}/stats`, ...options },
        promotionStatsSchema,
      );
    },

    async eligibleAssets(
      options: ApiRequestOptions = {},
    ): Promise<PromotionEligibleAsset[]> {
      return requestValidated<PromotionEligibleAsset[]>(
        { method: 'GET', url: `${basePath}/eligible-assets`, ...options },
        z.array(promotionEligibleAssetSchema),
      );
    },

    async forecast(
      input: PromotionForecastInput,
      options: ApiRequestOptions = {},
    ): Promise<PromotionForecast> {
      return requestValidated<PromotionForecast>(
        {
          method: 'POST',
          url: `${basePath}/forecast`,
          data: promotionForecastInputSchema.parse(input),
          ...options,
        },
        promotionForecastSchema,
      );
    },
  };
}

export type SponsoredCampaignApi = ReturnType<typeof createSponsoredCampaignApi>;

export const promotionsApi = createSponsoredCampaignApi('/promotions');
