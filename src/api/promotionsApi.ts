import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

export const promotionAssetSchema = z.object({
  type: z.enum(['deal', 'product', 'service', 'profile']),
  id: z.string(),
  title: z.string().optional(),
  image: z.string().optional(),
  price: z.number().optional(),
  wasPrice: z.number().optional(),
  priorClaims: z.number().optional(),
});
export type PromotionAsset = z.infer<typeof promotionAssetSchema>;

export const promotionAudienceSchema = z.object({
  strategy: z.enum(['nearby', 'segments']).optional(),
  segmentIds: z.array(z.string()).optional(),
  cohorts: z.array(z.string()).optional(),
  branchIds: z.array(z.string()).optional(),
  clusterIds: z.array(z.string()).optional(),
  radiusKm: z.number().optional(),
});
export type PromotionAudience = z.infer<typeof promotionAudienceSchema>;

export const promotionScheduleSchema = z.object({
  durationDays: z.number().optional(),
  startAt: z.string().optional(),
  instantLaunch: z.boolean().optional(),
  dayparting: z.boolean().optional(),
  windows: z.array(z.string()).optional(),
  weekdays: z.array(z.number()).optional(),
  autoRenew: z.boolean().optional(),
});
export type PromotionSchedule = z.infer<typeof promotionScheduleSchema>;

export const promotionBudgetSchema = z.object({
  mode: z.enum(['total', 'daily']).optional(),
  total: z.number().optional(),
  daily: z.number().optional(),
  funding: z.enum(['wallet', 'card']).optional(),
  autoDebit: z.boolean().optional(),
});
export type PromotionBudget = z.infer<typeof promotionBudgetSchema>;

export const promotionForecastSchema = z.object({
  reachMin: z.number(),
  reachMax: z.number(),
  claimsMin: z.number(),
  claimsMax: z.number(),
  estReturn: z.number(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
});
export type PromotionForecast = z.infer<typeof promotionForecastSchema>;

export const promotionSummarySchema = z.object({
  audienceReached: z.number().optional(),
  claims: z.number().optional(),
  revenue: z.number().optional(),
  liveCount: z.number().optional(),
});
export type PromotionSummary = z.infer<typeof promotionSummarySchema>;

export const promotionStatsSchema = z.object({
  reach: z.number().optional(),
  impressions: z.number().optional(),
  taps: z.number().optional(),
  claims: z.number().optional(),
  spend: z.number().optional(),
  revenue: z.number().optional(),
  series: z
    .array(
      z.object({
        date: z.string(),
        views: z.number().optional(),
        claims: z.number().optional(),
        redeemed: z.number().optional(),
      }),
    )
    .optional(),
});
export type PromotionStats = z.infer<typeof promotionStatsSchema>;

export const promotionSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  status: z.string().optional(),
  objective: z.string().optional(),
  audience: promotionAudienceSchema.optional(),
  schedule: promotionScheduleSchema.optional(),
  budget: promotionBudgetSchema.optional(),
  assets: z.array(promotionAssetSchema).optional(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export type Promotion = z.infer<typeof promotionSchema>;

export const promotionCreateInputSchema = z.object({
  name: z.string().optional(),
  objective: z.string().optional(),
  assets: z.array(promotionAssetSchema).optional(),
  audience: promotionAudienceSchema.optional(),
  schedule: promotionScheduleSchema.optional(),
  budget: promotionBudgetSchema.optional(),
});
export type PromotionCreateInput = z.input<typeof promotionCreateInputSchema>;

export const promotionsApi = {
  async listPromotions(
    params: { status?: string; branchId?: string; page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<Promotion[]> {
    return requestValidated<Promotion[]>(
      {
        method: 'GET',
        url: '/promotions',
        params,
        ...options,
      },
      z.array(promotionSchema),
    );
  },

  async getPromotionSummary(options: ApiRequestOptions = {}): Promise<PromotionSummary> {
    return requestValidated<PromotionSummary>(
      { method: 'GET', url: '/promotions/summary', ...options },
      promotionSummarySchema,
    );
  },

  async createPromotion(
    input: PromotionCreateInput,
    options: ApiRequestOptions = {},
  ): Promise<Promotion> {
    return requestValidated<Promotion>(
      {
        method: 'POST',
        url: '/promotions',
        data: promotionCreateInputSchema.parse(input),
        ...options,
      },
      promotionSchema,
    );
  },

  async getPromotion(
    promotionId: string,
    options: ApiRequestOptions = {},
  ): Promise<Promotion> {
    return requestValidated<Promotion>(
      { method: 'GET', url: `/promotions/${promotionId}`, ...options },
      promotionSchema,
    );
  },

  async updatePromotion(
    promotionId: string,
    input: Partial<PromotionCreateInput>,
    options: ApiRequestOptions = {},
  ): Promise<Promotion> {
    return requestValidated<Promotion>(
      {
        method: 'PATCH',
        url: `/promotions/${promotionId}`,
        data: promotionCreateInputSchema.partial().parse(input),
        ...options,
      },
      promotionSchema,
    );
  },

  async launchPromotion(
    promotionId: string,
    payload: Record<string, unknown> = {},
    options: ApiRequestOptions = {},
  ): Promise<Promotion> {
    return requestValidated<Promotion>(
      {
        method: 'POST',
        url: `/promotions/${promotionId}/launch`,
        data: payload,
        ...options,
      },
      promotionSchema,
    );
  },

  async pausePromotion(
    promotionId: string,
    options: ApiRequestOptions = {},
  ): Promise<Promotion> {
    return requestValidated<Promotion>(
      { method: 'POST', url: `/promotions/${promotionId}/pause`, ...options },
      promotionSchema,
    );
  },

  async resumePromotion(
    promotionId: string,
    options: ApiRequestOptions = {},
  ): Promise<Promotion> {
    return requestValidated<Promotion>(
      { method: 'POST', url: `/promotions/${promotionId}/resume`, ...options },
      promotionSchema,
    );
  },

  async endPromotion(
    promotionId: string,
    options: ApiRequestOptions = {},
  ): Promise<Promotion> {
    return requestValidated<Promotion>(
      { method: 'POST', url: `/promotions/${promotionId}/end`, ...options },
      promotionSchema,
    );
  },

  async getPromotionStats(
    promotionId: string,
    options: ApiRequestOptions = {},
  ): Promise<PromotionStats> {
    return requestValidated<PromotionStats>(
      { method: 'GET', url: `/promotions/${promotionId}/stats`, ...options },
      promotionStatsSchema,
    );
  },

  async listEligibleAssets(options: ApiRequestOptions = {}): Promise<PromotionAsset[]> {
    return requestValidated<PromotionAsset[]>(
      { method: 'GET', url: '/promotions/eligible-assets', ...options },
      z.array(promotionAssetSchema),
    );
  },

  async forecastPromotion(
    input: {
      audience?: PromotionAudience;
      budget?: PromotionBudget;
      schedule?: PromotionSchedule;
    },
    options: ApiRequestOptions = {},
  ): Promise<PromotionForecast> {
    return requestValidated<PromotionForecast>(
      {
        method: 'POST',
        url: '/promotions/forecast',
        data: input,
        ...options,
      },
      promotionForecastSchema,
    );
  },
};
