import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import { nullableNumber, nullableText, nullableTimestamp } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * The business's referral network (`/business-network`): businesses it
 * brought to VemTap, the milestone ladder their verification climbs, nearby
 * merchants, and how the business appears in consumer discovery.
 */
const num = nullableNumber();

export type ReferralStatus = 'registered' | 'pending' | 'verified' | 'notQualified';
export type ReferralStatusFilter = 'all' | ReferralStatus;

export const referralCardSchema = z.object({
  id: z.string(),
  name: nullableText(),
  logoUrl: z.string().nullable(),
  code: z.string(),
  category: z.string().nullable(),
  location: z.string().nullable(),
  status: z.enum(['registered', 'pending', 'verified', 'notQualified']),
  joinedAt: z.string(),
  verifiedAt: nullableTimestamp(),
});
export type ReferralCard = z.infer<typeof referralCardSchema>;

const tierSchema = z.object({
  id: z.string(),
  name: z.string(),
  threshold: num,
  perks: z.array(z.string()),
  state: z.enum(['unlocked', 'active', 'locked']),
  progress: num,
  remaining: num,
});
export type NetworkTier = z.infer<typeof tierSchema>;

export const networkSummarySchema = z.object({
  referralCode: z.string(),
  referralLink: z.string(),
  counts: z.object({
    total: num,
    registered: num,
    pending: num,
    verified: num,
    notQualified: num,
  }),
  joined: z.object({ current: num, previous: num }),
  conversionRate: num,
  tiers: z.array(tierSchema),
  current: z.object({ id: z.string(), name: z.string() }).nullable(),
  next: z
    .object({
      id: z.string(),
      name: z.string(),
      threshold: num,
      remaining: num,
      progress: num,
    })
    .nullable(),
  recent: z.array(referralCardSchema),
  nearby: z.object({
    total: num,
    radiusMeters: num,
    merchants: z.array(
      z.object({
        branchId: z.string(),
        name: nullableText(),
        businessName: nullableText(),
        category: z.string().nullable(),
        distanceMeters: num,
      }),
    ),
  }),
});
export type NetworkSummary = z.infer<typeof networkSummarySchema>;

const statusCounts = z.object({
  all: num,
  registered: num,
  pending: num,
  verified: num,
  notQualified: num,
});

export const referralsPageSchema = z.object({
  data: z.array(referralCardSchema),
  total: num,
  page: num,
  limit: num,
  hasNextPage: z.boolean(),
  meta: z.object({ statusCounts }),
});
export type ReferralsPage = z.infer<typeof referralsPageSchema>;

export const referralDetailSchema = referralCardSchema.extend({
  creditedTo: z.object({ id: z.string(), name: z.string() }),
  countsTowardMilestone: z.boolean(),
  timeline: z.array(
    z.object({ id: z.string(), at: nullableTimestamp(), done: z.boolean() }),
  ),
});
export type ReferralDetail = z.infer<typeof referralDetailSchema>;

export const discoverySettingsSchema = z.object({
  joinDiscoveryNetwork: z.boolean(),
  receivePartnerRequests: z.boolean(),
  allowPromotions: z.boolean(),
  pushNotifications: z.boolean(),
  smsAlerts: z.boolean(),
  emailSummary: z.boolean(),
});
export type DiscoverySettings = z.infer<typeof discoverySettingsSchema>;

export const discoveryPresenceSchema = z.object({
  branch: z.object({ id: z.string(), name: nullableText() }),
  card: z.object({
    name: nullableText(),
    category: z.string().nullable(),
    logoUrl: z.string().nullable(),
    coverImage: z.string().nullable(),
    locality: z.string().nullable(),
    rating: z.number().nullable(),
    reviews: num,
    topDeal: z
      .object({
        name: nullableText(),
        pricingType: z.string().nullable(),
        discountValue: z.number().nullable(),
        price: z.number().nullable(),
      })
      .nullable(),
  }),
  health: z.object({ score: num, checks: z.record(z.string(), z.boolean()) }),
  engagement: z.object({ current: num, previous: num }),
  index: z.object({
    catalogueItems: num,
    bookableServices: num,
    liveDeals: num,
    hoursSet: z.boolean(),
  }),
  zones: z.array(
    z.object({
      id: z.string(),
      name: nullableText(),
      area: z.string().nullable(),
      active: z.boolean(),
    }),
  ),
  settings: discoverySettingsSchema,
});
export type DiscoveryPresence = z.infer<typeof discoveryPresenceSchema>;

export interface ReferralsQuery {
  status?: ReferralStatusFilter;
  search?: string;
  page?: number;
  limit?: number;
}

export const businessNetworkApi = {
  summary(options: ApiRequestOptions = {}) {
    return requestValidated<NetworkSummary>(
      { method: 'GET', url: '/business-network/summary', ...options },
      networkSummarySchema,
    );
  },
  referrals(query: ReferralsQuery = {}, options: ApiRequestOptions = {}) {
    return requestValidated<ReferralsPage>(
      { method: 'GET', url: '/business-network/referrals', params: query, ...options },
      referralsPageSchema,
    );
  },
  referral(businessId: string, options: ApiRequestOptions = {}) {
    return requestValidated<ReferralDetail>(
      { method: 'GET', url: `/business-network/referrals/${businessId}`, ...options },
      referralDetailSchema,
    );
  },
  discovery(branchId?: string, options: ApiRequestOptions = {}) {
    return requestValidated<DiscoveryPresence>(
      {
        method: 'GET',
        url: '/business-network/discovery',
        params: branchId ? { branchId } : undefined,
        ...options,
      },
      discoveryPresenceSchema,
    );
  },
  /** `PATCH /discovery/settings/:branchId` (Owner only). */
  updateDiscoverySettings(
    branchId: string,
    patch: Partial<DiscoverySettings>,
    options: ApiRequestOptions = {},
  ) {
    return request<unknown>({
      method: 'PATCH',
      url: `/discovery/settings/${branchId}`,
      data: patch,
      ...options,
    });
  },
};
