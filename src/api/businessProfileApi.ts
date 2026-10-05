import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableFlag } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Public business profile. Both endpoints here need no authentication, so the
 * schemas were captured from live responses on the test API.
 *
 * Watch the naming: this endpoint is keyed on the business **uniqueCode** (the
 * 9-character code), not on a branchCode — passing a branchCode returns
 * "Business not found". The offers feed exposes that code as `business.slug`,
 * while `/public/businesses` uses `slug` for a URL slug and calls the code
 * `branchCode`, so the same field name carries different things per endpoint.
 */

const money = z.union([z.string(), z.number()]).nullish();

export const namedCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
});
export type NamedCategory = z.infer<typeof namedCategorySchema>;

/** One day of opening hours; `isClosed` wins over the from/to pair. */
export const openingHoursDaySchema = z.object({
  from: z.string().nullish(),
  to: z.string().nullish(),
  isClosed: nullableFlag(false),
});
export type OpeningHoursDay = z.infer<typeof openingHoursDaySchema>;

export const openingHoursSchema = z.record(z.string(), openingHoursDaySchema);
export type OpeningHours = z.infer<typeof openingHoursSchema>;

/** A branch as embedded in the business profile. */
export const profileBranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The 9-character branch code; distinct from the business uniqueCode. */
  uniqueCode: z.string().nullish(),
  username: z.string().nullish(),
  address: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  phone: z.string().nullish(),
  isActive: z.boolean().nullish(),
  isMainBranch: z.boolean().nullish(),
  logoUrl: z.string().nullish(),
  about: z.string().nullish(),
  businessId: z.string().nullish(),
});
export type ProfileBranch = z.infer<typeof profileBranchSchema>;

export const businessOwnerSchema = z.object({
  id: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  role: z.string().nullish(),
  jobTitle: z.string().nullish(),
});

export const loyaltyRewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  pointsRequired: z.number().nullish(),
  category: z.string().nullish(),
  audienceType: z.string().nullish(),
  coverImage: z.string().nullish(),
  totalQuantity: z.number().nullish(),
});
export type LoyaltyReward = z.infer<typeof loyaltyRewardSchema>;

export const businessProfileSchema = z.object({
  id: z.string(),
  /** The 9-character code this profile is fetched by. */
  uniqueCode: z.string(),
  name: z.string(),
  status: z.string(),
  isRegistered: nullableFlag(false),
  isVerified: nullableFlag(false),
  verifiedAt: z.string().nullish(),
  isVisible: nullableFlag(true),

  category: namedCategorySchema.nullish(),
  categoryId: z.string().nullish(),
  subcategory: namedCategorySchema.nullish(),
  subcategoryId: z.string().nullish(),

  logoUrl: z.string().nullish(),
  coverImage: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  phone: z.string().nullish(),
  whatsappNumber: z.string().nullish(),
  officialEmail: z.string().nullish(),
  website: z.string().nullish(),
  socials: z.unknown().nullish(),
  description: z.string().nullish(),
  about: z.string().nullish(),

  openingHours: openingHoursSchema.nullish(),
  timezone: z.string().nullish(),

  monthlyVisitors: z.string().nullish(),
  balance: money,
  posSettings: z.record(z.string(), z.unknown()).nullish(),

  branches: z.array(profileBranchSchema).default([]),
  owner: businessOwnerSchema.nullish(),
  rewards: z.array(loyaltyRewardSchema).default([]),
});
export type BusinessProfile = z.infer<typeof businessProfileSchema>;

/** Recently joined businesses. Note the `businesses` key, not `data`. */
export const publicBusinessSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullish(),
  description: z.string().nullish(),
  address: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  categoryId: z.string().nullish(),
  categoryName: z.string().nullish(),
  isVerified: nullableFlag(false),
  /** URL slug here — NOT the uniqueCode. */
  slug: z.string().nullish(),
  /** The 9-character branch code, which is not the business uniqueCode. */
  branchCode: z.string().nullish(),
});
export type PublicBusinessSummary = z.infer<typeof publicBusinessSummarySchema>;

export const publicBusinessListSchema = z.object({
  businesses: z.array(publicBusinessSummarySchema),
});

export const businessProfileApi = {
  /** Fetch by the business uniqueCode. A branchCode returns 404 here. */
  async getByCode(
    uniqueCode: string,
    options: ApiRequestOptions = {},
  ): Promise<BusinessProfile> {
    return requestValidated<BusinessProfile>(
      { method: 'GET', url: `/public/businesses/code/${uniqueCode}`, ...options },
      businessProfileSchema,
    );
  },

  async listRecentlyJoined(
    options: ApiRequestOptions = {},
  ): Promise<PublicBusinessSummary[]> {
    const response = await requestValidated(
      { method: 'GET', url: '/public/businesses', ...options },
      publicBusinessListSchema,
    );
    return response.businesses;
  },
};
