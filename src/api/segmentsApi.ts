import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

export const segmentCriteriaSchema = z.object({
  deals: z
    .object({
      offerIds: z.array(z.string()).optional(),
      redeemedAtLeast: z.number().optional(),
      withinDays: z.number().optional(),
    })
    .optional(),
  menu: z
    .object({
      itemIds: z.array(z.string()).optional(),
      orderedAtLeast: z.number().optional(),
    })
    .optional(),
  location: z
    .object({
      branchIds: z.array(z.string()).optional(),
      radiusKm: z.number().optional(),
    })
    .optional(),
  recency: z
    .object({
      visitedWithinDays: z.number().optional(),
      notVisitedForDays: z.number().optional(),
      minVisits: z.number().optional(),
    })
    .optional(),
  spend: z
    .object({
      minTotal: z.number().optional(),
      minAverageTicket: z.number().optional(),
    })
    .optional(),
});
export type SegmentCriteria = z.infer<typeof segmentCriteriaSchema>;

export const segmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['static', 'dynamic']).optional(),
  size: z.number().nullish(),
  criteria: segmentCriteriaSchema.optional(),
  status: z.string().optional(),
  lastComputedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export type Segment = z.infer<typeof segmentSchema>;

export const segmentPreviewSchema = z.object({
  size: z.number(),
  reachableByPush: z.number().optional(),
  reachableBySms: z.number().optional(),
});
export type SegmentPreview = z.infer<typeof segmentPreviewSchema>;

export const segmentInsightPatronSchema = z.object({
  userId: z.string(),
  name: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  lastVisit: z.string().nullish(),
  spend: z.number().nullish(),
});
export type SegmentInsightPatron = z.infer<typeof segmentInsightPatronSchema>;

export const segmentInsightSchema = z.object({
  size: z.number(),
  totalSpend: z.number().nullish(),
  avgOrderValue: z.number().nullish(),
  visitFrequency: z.number().nullish(),
  spendDelta: z.number().nullish(),
  aovDelta: z.number().nullish(),
  branchSplit: z
    .array(
      z.object({
        branchId: z.string(),
        name: z.string().nullish(),
        percent: z.number().nullish(),
      }),
    )
    .optional(),
  favourites: z
    .array(
      z.object({
        itemId: z.string(),
        name: z.string().nullish(),
        orders: z.number().nullish(),
      }),
    )
    .optional(),
  channels: z
    .object({
      push: z.number().nullish(),
      sms: z.number().nullish(),
      email: z.number().nullish(),
    })
    .optional(),
  samplePatrons: z.array(segmentInsightPatronSchema).optional(),
});
export type SegmentInsight = z.infer<typeof segmentInsightSchema>;

export const segmentCriteriaOptionSchema = z.object({
  deals: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  menuItems: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  branches: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  recency: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
});
export type SegmentCriteriaOptions = z.infer<typeof segmentCriteriaOptionSchema>;

export const segmentsPageSchema = z.object({
  data: z.array(segmentSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type SegmentsPage = z.infer<typeof segmentsPageSchema>;

export const createSegmentInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['static', 'dynamic']).default('dynamic').optional(),
  criteria: segmentCriteriaSchema.optional(),
  memberIds: z.array(z.string()).optional(),
});
export type CreateSegmentInput = z.input<typeof createSegmentInputSchema>;

export const updateSegmentInputSchema = createSegmentInputSchema.partial();
export type UpdateSegmentInput = z.input<typeof updateSegmentInputSchema>;

export const segmentsApi = {
  async listSegments(
    params: {
      status?: string;
      search?: string;
      type?: 'static' | 'dynamic';
      page?: number;
      limit?: number;
    } = {},
    options: ApiRequestOptions = {},
  ): Promise<SegmentsPage> {
    return requestValidated<SegmentsPage>(
      {
        method: 'GET',
        url: '/segments',
        params,
        ...options,
      },
      segmentsPageSchema,
    );
  },

  async getSegment(segmentId: string, options: ApiRequestOptions = {}): Promise<Segment> {
    return requestValidated<Segment>(
      { method: 'GET', url: `/segments/${segmentId}`, ...options },
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
    options: ApiRequestOptions = {},
  ): Promise<Segment> {
    return requestValidated<Segment>(
      {
        method: 'PATCH',
        url: `/segments/${segmentId}`,
        data: updateSegmentInputSchema.parse(input),
        ...options,
      },
      segmentSchema,
    );
  },

  async previewSegment(
    input: { criteria: SegmentCriteria; branchId?: string },
    options: ApiRequestOptions = {},
  ): Promise<SegmentPreview> {
    return requestValidated<SegmentPreview>(
      {
        method: 'POST',
        url: '/segments/preview',
        data: {
          criteria: segmentCriteriaSchema.parse(input.criteria),
          ...(input.branchId ? { branchId: input.branchId } : {}),
        },
        ...options,
      },
      segmentPreviewSchema,
    );
  },

  async getSegmentCriteriaOptions(
    options: ApiRequestOptions = {},
  ): Promise<SegmentCriteriaOptions> {
    return requestValidated<SegmentCriteriaOptions>(
      { method: 'GET', url: '/segments/criteria-options', ...options },
      segmentCriteriaOptionSchema,
    );
  },

  async getSegmentInsights(
    segmentId: string,
    options: ApiRequestOptions = {},
  ): Promise<SegmentInsight> {
    return requestValidated<SegmentInsight>(
      { method: 'GET', url: `/segments/${segmentId}/insights`, ...options },
      segmentInsightSchema,
    );
  },
};
