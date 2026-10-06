import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableFlag } from '@api/schemaHelpers';
import {
  namedCategorySchema,
  openingHoursSchema,
  profileBranchSchema,
} from '@api/businessProfileApi';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * The public business profile: `GET /public/businesses/code/:code`.
 *
 * This is the endpoint that lets a real offer link to a real merchant. It is
 * keyed by the business's 9-character `uniqueCode`, which reaches us as
 * `business.slug` on an offer — the feed never exposes the business `id` in a
 * form this endpoint accepts.
 *
 * Deliberately modelled to hold only what a consumer profile renders. The live
 * payload also returns `owner`, `balance`, `posSettings`, `documents` and
 * `officialEmail`, and zod strips them here so they never enter app state.
 * (Worth raising with the backend: a *public* endpoint should probably not
 * serialize an owner's personal details to anonymous callers at all.)
 *
 * `namedCategorySchema`, `openingHoursSchema` and `profileBranchSchema` are
 * imported rather than re-declared — they already model the authenticated
 * business profile, and the two payloads agree.
 */
export const publicBusinessDetailSchema = z.object({
  id: z.string(),
  /** The 9-character code this record is keyed by. */
  uniqueCode: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  website: z.string().nullable().optional(),

  category: namedCategorySchema.nullable().optional(),
  subcategory: namedCategorySchema.nullable().optional(),
  otherSubcategoryName: z.string().nullable().optional(),

  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),

  /**
   * The only verification signal the API exposes for a business, so it is what
   * the profile's status pill reflects. Null when never verified.
   */
  isVerified: nullableFlag(false),
  status: z.string().nullable().optional(),
  isVisible: nullableFlag(true),

  openingHours: openingHoursSchema.nullable().optional(),
  branches: z.array(profileBranchSchema).nullish().default([]),
});
export type PublicBusinessDetail = z.infer<typeof publicBusinessDetailSchema>;

export const publicBusinessApi = {
  /**
   * Public and unauthenticated. Verified live: a real code returns 200, an
   * unknown code returns 404.
   */
  async getByCode(
    code: string,
    options: ApiRequestOptions = {},
  ): Promise<PublicBusinessDetail> {
    return requestValidated<PublicBusinessDetail>(
      { method: 'GET', url: `/public/businesses/code/${code}`, ...options },
      publicBusinessDetailSchema,
    );
  },
};
