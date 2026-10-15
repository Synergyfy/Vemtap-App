import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

export const boostAssetSchema = z.object({
  type: z.enum(['deal', 'product', 'service', 'profile']),
  id: z.string(),
  title: z.string().optional(),
  image: z.string().optional(),
});
export type BoostAsset = z.infer<typeof boostAssetSchema>;

export const boostGoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});
export type BoostGoal = z.infer<typeof boostGoalSchema>;

export const boostForecastSchema = z.object({
  reachMin: z.number(),
  reachMax: z.number(),
  claimsMin: z.number(),
  claimsMax: z.number(),
  estReturn: z.number(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
});
export type BoostForecast = z.infer<typeof boostForecastSchema>;

export const boostOptionSchema = z.object({
  goals: z.array(boostGoalSchema).optional(),
  audienceScopes: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  radiusOptions: z.array(z.object({ value: z.number(), label: z.string() })).optional(),
  placements: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  budgetTiers: z.array(z.object({ value: z.number(), label: z.string() })).optional(),
});
export type BoostOptions = z.infer<typeof boostOptionSchema>;

export const boostStatsSchema = z.object({
  spend: z.number().optional(),
  budget: z.number().optional(),
  left: z.number().optional(),
  redemptions: z.number().optional(),
  grossRevenue: z.number().optional(),
  reach: z.number().optional(),
  funnel: z
    .object({
      impressions: z.number().optional(),
      taps: z.number().optional(),
      saves: z.number().optional(),
      claims: z.number().optional(),
      redeemed: z.number().optional(),
    })
    .optional(),
});
export type BoostStats = z.infer<typeof boostStatsSchema>;

export const boostSchema = z.object({
  id: z.string(),
  asset: boostAssetSchema.optional(),
  goalId: z.string().optional(),
  status: z.string().optional(),
  budget: z.number().optional(),
  days: z.number().optional(),
  startAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export type Boost = z.infer<typeof boostSchema>;

export const boostsApi = {
  async listBoosts(
    params: { status?: string; page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<Boost[]> {
    return requestValidated<Boost[]>(
      {
        method: 'GET',
        url: '/boosts',
        params,
        ...options,
      },
      z.array(boostSchema),
    );
  },

  async getBoost(boostId: string, options: ApiRequestOptions = {}): Promise<Boost> {
    return requestValidated<Boost>(
      { method: 'GET', url: `/boosts/${boostId}`, ...options },
      boostSchema,
    );
  },

  async createBoost(
    input: Record<string, unknown>,
    options: ApiRequestOptions = {},
  ): Promise<Boost> {
    return requestValidated<Boost>(
      {
        method: 'POST',
        url: '/boosts',
        data: input,
        ...options,
      },
      boostSchema,
    );
  },

  async updateBoost(
    boostId: string,
    input: Record<string, unknown>,
    options: ApiRequestOptions = {},
  ): Promise<Boost> {
    return requestValidated<Boost>(
      {
        method: 'PATCH',
        url: `/boosts/${boostId}`,
        data: input,
        ...options,
      },
      boostSchema,
    );
  },

  async launchBoost(
    boostId: string,
    payload: Record<string, unknown> = {},
    options: ApiRequestOptions = {},
  ): Promise<Boost> {
    return requestValidated<Boost>(
      {
        method: 'POST',
        url: `/boosts/${boostId}/launch`,
        data: payload,
        ...options,
      },
      boostSchema,
    );
  },

  async pauseBoost(boostId: string, options: ApiRequestOptions = {}): Promise<Boost> {
    return requestValidated<Boost>(
      { method: 'POST', url: `/boosts/${boostId}/pause`, ...options },
      boostSchema,
    );
  },

  async resumeBoost(boostId: string, options: ApiRequestOptions = {}): Promise<Boost> {
    return requestValidated<Boost>(
      { method: 'POST', url: `/boosts/${boostId}/resume`, ...options },
      boostSchema,
    );
  },

  async endBoost(boostId: string, options: ApiRequestOptions = {}): Promise<Boost> {
    return requestValidated<Boost>(
      { method: 'POST', url: `/boosts/${boostId}/end`, ...options },
      boostSchema,
    );
  },

  async getBoostStats(
    boostId: string,
    options: ApiRequestOptions = {},
  ): Promise<BoostStats> {
    return requestValidated<BoostStats>(
      { method: 'GET', url: `/boosts/${boostId}/stats`, ...options },
      boostStatsSchema,
    );
  },

  async getBoostOptions(options: ApiRequestOptions = {}): Promise<BoostOptions> {
    return requestValidated<BoostOptions>(
      { method: 'GET', url: '/boosts/options', ...options },
      boostOptionSchema,
    );
  },

  async forecastBoost(
    input: Record<string, unknown>,
    options: ApiRequestOptions = {},
  ): Promise<BoostForecast> {
    return requestValidated<BoostForecast>(
      {
        method: 'POST',
        url: '/boosts/forecast',
        data: input,
        ...options,
      },
      boostForecastSchema,
    );
  },
};
