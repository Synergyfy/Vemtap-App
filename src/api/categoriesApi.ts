import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * The global category taxonomy. `GET /categories` is public and was verified
 * live; it is the only source of the real `categoryId` / `subcategoryId` UUIDs
 * that `register/owner` requires.
 *
 * This exists because the setup screens offer a *fictional* taxonomy (see
 * `businessData.ts`) that shares no names at all with the API's real one — see
 * `ownerRegistrationMapper` for why that matters.
 *
 * Two things about the live data worth knowing:
 *  - The envelope is `{items, meta}`, distinct from the four other shapes in
 *    this codebase (`{data,total,...}`, `{businesses}`, `{reviews}`, bare array).
 *  - The seeded taxonomy contains junk entries (`Frank`, `Zejab`, `test`,
 *    `txxhhh`) alongside real ones, so callers must not assume a curated list.
 */

export const subcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  categoryId: z.string().nullish(),
});
export type Subcategory = z.infer<typeof subcategorySchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  subcategories: z.array(subcategorySchema).default([]),
});
export type Category = z.infer<typeof categorySchema>;

/** The `{items, meta}` envelope, distinct from the other list shapes in use. */
export const categoryListSchema = z.object({
  items: z.array(categorySchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});
export type CategoryList = z.infer<typeof categoryListSchema>;

export const categoriesApi = {
  /**
   * Paginated — the seeded taxonomy is 24 categories across 3 pages at the
   * default limit of 10, so callers must request a limit or follow `meta`.
   */
  async list(
    params: { page?: number; limit?: number } = {},
    options: ApiRequestOptions = {},
  ): Promise<CategoryList> {
    return requestValidated<CategoryList>(
      {
        method: 'GET',
        url: '/categories',
        params: { page: params.page, limit: params.limit },
        ...options,
      },
      categoryListSchema,
    );
  },
};
