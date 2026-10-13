import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableFlag } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * The Saved Hub stores — customer-side saves for deals, businesses and services.
 *
 * Contract notes verified against the backend DTOs
 * (`modules/saved/dto/saved.dto.ts`):
 *
 *  - Every list answers the same page shape: `{ data, total, page, limit }`,
 *    where each row is `{ id, type, savedAt, item }` and `item` is discriminated
 *    by `type`. The typed lists (`/me/saved/deals|businesses|services`) still
 *    wrap rows in that envelope — they do not return a bare item array.
 *  - Toggles return the **resulting** state (`{ saved: true }` when the call
 *    saved it, `{ saved: false }` when it unsaved it), so the client must read
 *    the response rather than assume a flip direction.
 *  - Status endpoints answer `{ isSaved }` — not `{ saved }`. The deal
 *    save-status endpoint shares this shape (see `dealsApi.getSaveStatus`).
 *  - `SavedBusinessItemDto.slug` is the business 9-character code for
 *    `GET /public/businesses/code/:code` — despite the name, it is not a URL
 *    slug.
 *  - Deleting all of a save store (`data: []`, `total: 0`) is a valid empty
 *    state, never an error.
 *
 * All routes here are Bearer + role `CUSTOMER`; an owner token gets `403` and
 * anonymous `401`, which the hooks turn into an empty/absent UI.
 */

const money = z.union([z.string(), z.number()]).nullish();

export const savedItemTypeSchema = z.enum(['DEAL', 'BUSINESS', 'SERVICE']);
export type SavedItemType = z.infer<typeof savedItemTypeSchema>;

export const savedDealItemSchema = z.object({
  offerId: z.string(),
  name: z.string(),
  mainImage: z.string().nullable().optional(),
  businessName: z.string(),
  businessLogo: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
  branchAddress: z.string().nullable().optional(),
  calculatedPrice: money,
  originalPrice: money,
  discountPercent: z.number().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isExpired: nullableFlag(false),
});
export type SavedDealItem = z.infer<typeof savedDealItemSchema>;

export const savedBusinessItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  isVerified: nullableFlag(false),
  /** Business 9-character code — the public profile link key. */
  slug: z.string(),
  branchCode: z.string().nullable().optional(),
});
export type SavedBusinessItem = z.infer<typeof savedBusinessItemSchema>;

export const savedServiceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  mainImage: z.string().nullable().optional(),
  price: money,
  priceType: z.string().nullable().optional(),
  priceRangeMin: money,
  priceRangeMax: money,
  duration: z.string().nullable().optional(),
  businessId: z.string(),
  businessName: z.string(),
  branchId: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
  isBookable: nullableFlag(false),
});
export type SavedServiceItem = z.infer<typeof savedServiceItemSchema>;

const savedRowBase = {
  id: z.string(),
  savedAt: z.string(),
};

export const savedRowSchema = z.discriminatedUnion('type', [
  z.object({ ...savedRowBase, type: z.literal('DEAL'), item: savedDealItemSchema }),
  z.object({
    ...savedRowBase,
    type: z.literal('BUSINESS'),
    item: savedBusinessItemSchema,
  }),
  z.object({
    ...savedRowBase,
    type: z.literal('SERVICE'),
    item: savedServiceItemSchema,
  }),
]);
export type SavedRow = z.infer<typeof savedRowSchema>;

/**
 * Per-store counts, returned by `GET /me/saved` when no `type` filter is sent
 * (a filtered read skips the other stores and cannot count them). Optional for
 * that reason — and because a client may point at a server predating it.
 */
export const savedTotalsSchema = z.object({
  all: z.number(),
  deals: z.number(),
  businesses: z.number(),
  services: z.number(),
});
export type SavedTotals = z.infer<typeof savedTotalsSchema>;

export const savedPageSchema = z.object({
  data: z.array(savedRowSchema),
  total: z.number(),
  page: z.number().nullable().optional(),
  limit: z.number().nullable().optional(),
  // Must be declared here: zod strips unknown keys, so without this the field
  // would arrive and be dropped before the caller ever saw it.
  totals: savedTotalsSchema.nullish(),
});
export type SavedPage = z.infer<typeof savedPageSchema>;

export const saveToggleResponseSchema = z.object({ saved: z.boolean() });
export const saveStatusResponseSchema = z.object({ isSaved: z.boolean() });

type SavedListQuery = {
  page?: number;
  limit?: number;
  type?: SavedItemType;
};

export const savedApi = {
  /** Unified feed across the three stores, newest saved first. */
  async listSaved(
    query: SavedListQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<SavedPage> {
    return requestValidated<SavedPage>(
      {
        method: 'GET',
        url: '/me/saved',
        params: { page: query.page, limit: query.limit, type: query.type },
        ...options,
      },
      savedPageSchema,
    );
  },

  async listSavedDeals(
    query: SavedListQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<SavedPage> {
    return requestValidated<SavedPage>(
      {
        method: 'GET',
        url: '/me/saved/deals',
        params: { page: query.page, limit: query.limit },
        ...options,
      },
      savedPageSchema,
    );
  },

  async listSavedBusinesses(
    query: SavedListQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<SavedPage> {
    return requestValidated<SavedPage>(
      {
        method: 'GET',
        url: '/me/saved/businesses',
        params: { page: query.page, limit: query.limit },
        ...options,
      },
      savedPageSchema,
    );
  },

  async listSavedServices(
    query: SavedListQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<SavedPage> {
    return requestValidated<SavedPage>(
      {
        method: 'GET',
        url: '/me/saved/services',
        params: { page: query.page, limit: query.limit },
        ...options,
      },
      savedPageSchema,
    );
  },

  /** Flips the state; the response is the state after the call. */
  async toggleBusinessSave(
    businessId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ saved: boolean }> {
    return requestValidated<{ saved: boolean }>(
      { method: 'POST', url: `/businesses/${businessId}/save`, ...options },
      saveToggleResponseSchema,
    );
  },

  async getBusinessSaveStatus(
    businessId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ isSaved: boolean }> {
    return requestValidated<{ isSaved: boolean }>(
      { method: 'GET', url: `/businesses/${businessId}/save-status`, ...options },
      saveStatusResponseSchema,
    );
  },

  /** Flips the state; `400` when the catalogue item is not of type `service`. */
  async toggleServiceSave(
    serviceId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ saved: boolean }> {
    return requestValidated<{ saved: boolean }>(
      { method: 'POST', url: `/services/${serviceId}/save`, ...options },
      saveToggleResponseSchema,
    );
  },

  async getServiceSaveStatus(
    serviceId: string,
    options: ApiRequestOptions = {},
  ): Promise<{ isSaved: boolean }> {
    return requestValidated<{ isSaved: boolean }>(
      { method: 'GET', url: `/services/${serviceId}/save-status`, ...options },
      saveStatusResponseSchema,
    );
  },
};
