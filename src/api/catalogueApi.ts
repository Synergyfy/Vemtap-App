import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Public catalogue (products and services) endpoints.
 *
 * As with the deals endpoints, the published OpenAPI document declares these
 * paths but documents no 2xx bodies, so the schemas were captured from live
 * responses on the test API. The envelope differs per endpoint and is modelled
 * accordingly: branch items use the same cursor envelope as the offers feed,
 * `GET /products` uses a page/totalPages envelope, and categories come back as
 * a bare array.
 *
 * Note the branch item carries an embedded `category` object as well as
 * `categoryId`; the offers feed's embedded items only had the id.
 */

const money = z.union([z.string(), z.number()]).nullish();

export const catalogueCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  businessId: z.string().nullable().optional(),
});
export type CatalogueCategory = z.infer<typeof catalogueCategorySchema>;

export const catalogueItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: money,
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  mainImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).nullish(),
  businessId: z.string().nullable().optional(),
  category: catalogueCategorySchema.nullish(),
  categoryId: z.string().nullable().optional(),
  status: z.string(),
  /** The API uses `service` for services; products arrive as `product`. */
  itemType: z.string(),
  sku: z.string().nullable().optional(),
  discountType: z.string().nullable().optional(),
  discountValue: money,
  stockQuantity: z.number().nullish(),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  /** `fixed`, `range` or `starting_from`. */
  priceType: z.string().nullable().optional(),
  priceRangeMin: money,
  priceRangeMax: money,
  /** Service duration, e.g. "1.5 hours". */
  duration: z.string().nullable().optional(),
  /** `customer`, `location` or `flexible`. */
  serviceMode: z.string().nullable().optional(),
  isBookable: z.boolean().nullish(),
  bookingMethod: z.string().nullable().optional(),
  externalBookingLink: z.string().nullable().optional(),
  allowBackOrder: z.boolean().nullish(),
  isSuspended: z.boolean().default(false),
  loyaltyPoints: z.number().nullish(),
});
export type CatalogueItem = z.infer<typeof catalogueItemSchema>;

/** Cursor envelope, matching the offers feed. */
export const catalogueItemFeedSchema = z.object({
  data: z.array(catalogueItemSchema),
  total: z.number().default(0),
  page: z.number().nullish(),
  limit: z.number().nullish(),
  cursor: z.string().nullish(),
  nextCursor: z.string().nullish(),
  prevCursor: z.string().nullish(),
  hasNextPage: z.boolean().default(false),
});
export type CatalogueItemFeed = z.infer<typeof catalogueItemFeedSchema>;

/** Page envelope used by `GET /products`; no cursor fields. */
export const publishedProductFeedSchema = z.object({
  data: z.array(catalogueItemSchema),
  total: z.number().default(0),
  page: z.number().nullish(),
  limit: z.number().nullish(),
  totalPages: z.number().nullish(),
  hasNextPage: z.boolean().default(false),
  hasPrevPage: z.boolean().default(false),
});

/** Categories arrive as a bare array, not wrapped. */
export const catalogueCategoryListSchema = z.array(catalogueCategorySchema);

export const productTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
});

export type CatalogueItemQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  itemType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
};

export const catalogueApi = {
  /** Active items for one branch. Public. */
  async listBranchItems(
    branchId: string,
    query: CatalogueItemQuery = {},
    options: ApiRequestOptions = {},
  ): Promise<CatalogueItemFeed> {
    return requestValidated<CatalogueItemFeed>(
      {
        method: 'GET',
        url: `/public/catalogue/items/branch/${branchId}`,
        params: { ...query },
        ...options,
      },
      catalogueItemFeedSchema,
    );
  },

  async getItem(
    itemId: string,
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueItem> {
    return requestValidated<CatalogueItem>(
      {
        method: 'GET',
        url: `/public/catalogue/items/${itemId}`,
        params: { branchId },
        ...options,
      },
      catalogueItemSchema,
    );
  },

  /** A bare array of categories that have active items at the branch. */
  async listBranchCategories(
    branchId: string,
    options: ApiRequestOptions = {},
  ): Promise<CatalogueCategory[]> {
    return requestValidated<CatalogueCategory[]>(
      {
        method: 'GET',
        url: `/public/catalogue/categories/branch/${branchId}`,
        ...options,
      },
      catalogueCategoryListSchema,
    );
  },

  /** Published products across branches. Public. */
  async listPublishedProducts(
    query: CatalogueItemQuery & { sortOrder?: string } = {},
    options: ApiRequestOptions = {},
  ): Promise<z.infer<typeof publishedProductFeedSchema>> {
    return requestValidated(
      { method: 'GET', url: '/products', params: { ...query }, ...options },
      publishedProductFeedSchema,
    );
  },

  /** A bare array of product types. */
  async listProductTypes(
    options: ApiRequestOptions = {},
  ): Promise<z.infer<typeof productTypeSchema>[]> {
    return requestValidated(
      { method: 'GET', url: '/products/types', ...options },
      z.array(productTypeSchema),
    );
  },
};
