import { z } from 'zod';
import { requestValidated } from '@api/client';
import { nullableFlag, nullableText } from '@api/schemaHelpers';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Owner-side branch management.
 *
 * `GET /businesses/my-business` embeds each branch in the `branches[]` array,
 * and that is what the Business Hub reads so the header, the shared branch
 * switcher and this screen never disagree. This module covers the *writes*
 * (`POST /branches`, `PATCH /branches/:id`) plus a standalone `GET /branches`
 * for callers that want the branch list on its own.
 *
 * Mutating a branch has to invalidate `['business', 'my-business']`, because
 * that embedded array is the source of truth everywhere else — see
 * `useCreateBranch` / `useUpdateBranch`.
 */

/**
 * `GET /branches` has no published response DTO (tracked in the catalogue API
 * comments), so the list is read as a bare array or a `{ data }` envelope —
 * the same tolerance the other undocumented list endpoints use.
 */
export const branchSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  uniqueCode: nullableText(),
  username: nullableText(),
  address: nullableText(),
  state: nullableText(),
  city: nullableText(),
  /**
   * Coordinates stay nullish rather than being coerced to 0. `nullableNumber`
   * would turn "never set" into `0, 0` — a real point in the Atlantic — which
   * the details screen would then render as a genuine map pin.
   */
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  phone: nullableText(),
  isActive: nullableFlag(true),
  isMainBranch: nullableFlag(false),
  logoUrl: nullableText(),
  businessId: nullableText(),
  website: nullableText(),
  whatsappNumber: nullableText(),
  officialEmail: nullableText(),
  /**
   * Opening hours as a weekday-keyed object. The column is `jsonb` and its
   * per-day shape is not normalised by the API, so it stays opaque here and the
   * screen reads it defensively.
   */
  businessHours: z.record(z.string(), z.unknown()).nullish(),
});
export type Branch = z.infer<typeof branchSchema>;

const branchListResponse = z.union([
  z.array(branchSchema),
  z.object({ data: z.array(branchSchema) }).transform(payload => payload.data),
]);

/**
 * Create payload — mirrors `CreateBranchDto` field-for-field. The backend runs
 * `forbidNonWhitelisted`, so extra keys are rejected, and `name` is the only
 * required field.
 *
 * `name` trims before the length check because `min(1)` alone accepts a
 * whitespace-only string — and the backend's `@IsNotEmpty()` accepts it too, so
 * the rejection has to happen on this side of the wire to be worth anything.
 */
const branchName = z.string().trim().min(1);

export const createBranchInput = z.object({
  name: branchName,
  username: z.string().min(3).max(30).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  officialEmail: z.string().optional(),
});
export type CreateBranchInput = z.infer<typeof createBranchInput>;

/**
 * Update payload — mirrors `UpdateBranchDto`. Every field is optional because
 * `PATCH` merges into the stored row, and `isActive: true` is how a paused
 * location is reactivated (the backend refuses to pause the business's last
 * active location).
 */
export const updateBranchInput = z.object({
  name: branchName.optional(),
  username: z.string().min(3).max(30).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  officialEmail: z.string().optional(),
  logoUrl: z.string().optional(),
  about: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isMainBranch: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateBranchInput = z.infer<typeof updateBranchInput>;

export const branchApi = {
  /** Every branch on the signed-in owner's business. */
  async list(options: ApiRequestOptions = {}): Promise<Branch[]> {
    return requestValidated<Branch[]>(
      { method: 'GET', url: '/branches', ...options },
      branchListResponse,
    );
  },

  /**
   * One branch in full.
   *
   * The details screen needs more than the branches embedded in
   * `GET /businesses/my-business` carry — opening hours and the branch's own
   * `about` live only on the single-branch response.
   */
  async getOne(branchId: string, options: ApiRequestOptions = {}): Promise<Branch> {
    return requestValidated<Branch>(
      { method: 'GET', url: `/branches/${branchId}`, ...options },
      branchSchema,
    );
  },

  /** Create a location. Plan limits are enforced server-side. */
  async create(
    payload: CreateBranchInput,
    options: ApiRequestOptions = {},
  ): Promise<Branch> {
    return requestValidated<Branch>(
      {
        method: 'POST',
        url: '/branches',
        data: createBranchInput.parse(payload),
        ...options,
      },
      branchSchema,
    );
  },

  /** Patch a location, including `isActive` to pause or reactivate it. */
  async update(
    branchId: string,
    payload: UpdateBranchInput,
    options: ApiRequestOptions = {},
  ): Promise<Branch> {
    return requestValidated<Branch>(
      {
        method: 'PATCH',
        url: `/branches/${branchId}`,
        data: updateBranchInput.parse(payload),
        ...options,
      },
      branchSchema,
    );
  },
};
