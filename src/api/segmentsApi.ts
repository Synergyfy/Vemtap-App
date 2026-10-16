import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';
import { decimal } from '@api/schemaHelpers';

/**
 * Customer segments (`/segments`). A `dynamic` segment is a rule set whose
 * members are computed on read; a `static` one is a hand-picked member list.
 * Shapes follow `apps/backend/src/modules/contacts` (`SegmentCriteriaDto`,
 * `SegmentsService`). The API rejects unknown keys, so the criteria schema
 * carries only what the backend stores.
 */

export const segmentCriteriaSchema = z.object({
  deals: z
    .object({
      offerIds: z.array(z.string()).optional(),
      redeemedAtLeast: z.number().int().min(1).optional(),
      withinDays: z.number().int().min(1).optional(),
      /** Saved one of the deals and never redeemed it. */
      savedNotRedeemed: z.boolean().optional(),
    })
    .optional(),
  menu: z
    .object({
      itemIds: z.array(z.string()),
      orderedAtLeast: z.number().int().min(1).optional(),
    })
    .optional(),
  location: z
    .object({
      branchIds: z.array(z.string()).optional(),
      /** Customers whose home district is one of these. */
      homeDistrictIds: z.array(z.string()).optional(),
    })
    .optional(),
  recency: z
    .object({
      visitedWithinDays: z.number().int().min(1).optional(),
      notVisitedForDays: z.number().int().min(1).optional(),
      minVisits: z.number().int().min(1).optional(),
      /** A table QR visit or a chat within N days. */
      interactedWithinDays: z.number().int().min(1).optional(),
    })
    .optional(),
  spend: z
    .object({
      minTotal: z.number().min(0).optional(),
      minAverageTicket: z.number().min(0).optional(),
    })
    .optional(),
  /** Unspent loyalty points at the business. */
  loyalty: z.object({ minPoints: z.number().int().min(1) }).optional(),
});
export type SegmentCriteria = z.infer<typeof segmentCriteriaSchema>;

export const segmentTypeSchema = z.enum(['static', 'dynamic']);
export type SegmentType = z.infer<typeof segmentTypeSchema>;

export const segmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  type: segmentTypeSchema.default('static'),
  size: z.number().nullish(),
  criteria: segmentCriteriaSchema.nullish(),
  branchId: z.string().nullish(),
  lastComputedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export type Segment = z.infer<typeof segmentSchema>;

/** Live size and channel reach for a rule set (nothing is saved). */
export const segmentReachSchema = z.object({
  size: z.number(),
  reachableByPush: z.number(),
  reachableBySms: z.number(),
  reachableByEmail: z.number(),
  /** Members out of promotions (opted out, or marketing off); newer API only. */
  excludedFromPromotions: z.number().optional(),
});
export type SegmentReach = z.infer<typeof segmentReachSchema>;

export const segmentInsightPatronSchema = z.object({
  userId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullish(),
  lastVisit: z.string().nullish(),
  spend: decimal(),
});
export type SegmentInsightPatron = z.infer<typeof segmentInsightPatronSchema>;

export const segmentInsightSchema = segmentReachSchema.extend({
  segmentId: z.string(),
  name: z.string(),
  type: segmentTypeSchema,
  totalSpend: decimal(),
  avgOrderValue: decimal(),
  visitFrequency: decimal(),
  /** Members' spend in the last 30 days vs the 30 before, as a fraction. */
  spendDelta: z.number().nullable(),
  aovDelta: z.number().nullable(),
  branchSplit: z.array(
    z.object({ branchId: z.string(), name: z.string(), percent: z.number() }),
  ),
  favourites: z.array(
    z.object({ itemId: z.string(), name: z.string(), orders: z.number() }),
  ),
  samplePatrons: z.array(segmentInsightPatronSchema),
});
export type SegmentInsight = z.infer<typeof segmentInsightSchema>;

const namedOptionSchema = z.object({ id: z.string(), name: z.string() });
const presetOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  criteria: z.record(z.string(), z.unknown()),
});

/** Deals, menu items, branches and presets for the criteria builder. */
export const segmentCriteriaOptionsSchema = z.object({
  deals: z.array(namedOptionSchema),
  menuItems: z.array(namedOptionSchema),
  branches: z.array(namedOptionSchema),
  /** Home districts (older servers: absent). */
  districts: z.array(namedOptionSchema).optional(),
  recency: z.array(presetOptionSchema).optional(),
  spend: z.array(presetOptionSchema).optional(),
});
export type SegmentCriteriaOptions = z.infer<typeof segmentCriteriaOptionsSchema>;

export const createSegmentInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  branchId: z.string().uuid().optional(),
  type: segmentTypeSchema.optional(),
  criteria: segmentCriteriaSchema.optional(),
});
export type CreateSegmentInput = z.input<typeof createSegmentInputSchema>;

export const updateSegmentInputSchema = createSegmentInputSchema
  .omit({ branchId: true })
  .partial();
export type UpdateSegmentInput = z.input<typeof updateSegmentInputSchema>;

/**
 * Every segment read and write is scoped to one branch (the API falls back to
 * the caller's own branch), so callers pass the same `branchId` they created
 * the segment with; otherwise a new segment can vanish from the list.
 */
export interface SegmentScope {
  branchId?: string;
}

export const segmentsApi = {
  /** Every segment of the caller's branch scope, sizes refreshed when stale. */
  async listSegments(
    params: SegmentScope = {},
    options: ApiRequestOptions = {},
  ): Promise<Segment[]> {
    return requestValidated<Segment[]>(
      { method: 'GET', url: '/segments', params, ...options },
      z.array(segmentSchema),
    );
  },

  async getSegment(
    segmentId: string,
    params: SegmentScope = {},
    options: ApiRequestOptions = {},
  ): Promise<Segment> {
    return requestValidated<Segment>(
      { method: 'GET', url: `/segments/${segmentId}`, params, ...options },
      segmentSchema,
    );
  },

  async createSegment(
    input: CreateSegmentInput,
    options: ApiRequestOptions = {},
  ): Promise<Segment> {
    return requestValidated<Segment>(
      {
        method: 'POST',
        url: '/segments',
        data: createSegmentInputSchema.parse(input),
        ...options,
      },
      segmentSchema,
    );
  },

  async updateSegment(
    segmentId: string,
    input: UpdateSegmentInput,
    params: SegmentScope = {},
    options: ApiRequestOptions = {},
  ): Promise<Segment> {
    return requestValidated<Segment>(
      {
        method: 'PATCH',
        url: `/segments/${segmentId}`,
        params,
        data: updateSegmentInputSchema.parse(input),
        ...options,
      },
      segmentSchema,
    );
  },

  async deleteSegment(
    segmentId: string,
    params: SegmentScope = {},
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await requestValidated(
      { method: 'DELETE', url: `/segments/${segmentId}`, params, ...options },
      z.unknown(),
    );
  },

  async previewSegment(
    criteria: SegmentCriteria,
    options: ApiRequestOptions = {},
  ): Promise<SegmentReach> {
    return requestValidated<SegmentReach>(
      {
        method: 'POST',
        url: '/segments/preview',
        data: { criteria: segmentCriteriaSchema.parse(criteria) },
        ...options,
      },
      segmentReachSchema,
    );
  },

  async getSegmentCriteriaOptions(
    options: ApiRequestOptions = {},
  ): Promise<SegmentCriteriaOptions> {
    return requestValidated<SegmentCriteriaOptions>(
      { method: 'GET', url: '/segments/criteria-options', ...options },
      segmentCriteriaOptionsSchema,
    );
  },

  async getSegmentInsights(
    segmentId: string,
    params: SegmentScope = {},
    options: ApiRequestOptions = {},
  ): Promise<SegmentInsight> {
    return requestValidated<SegmentInsight>(
      { method: 'GET', url: `/segments/${segmentId}/insights`, params, ...options },
      segmentInsightSchema,
    );
  },
};
