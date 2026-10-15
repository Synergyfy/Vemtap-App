import { ApiError } from '@api/ApiError';
import { strings } from '@constants/strings';

/**
 * Client mirror of the backend's plan-restriction contract
 * (`apps/backend/src/common/enums/plan-errors.enum.ts`).
 *
 * The slug arrives as the `error` field of the 403 body and is preserved by
 * `normalizeAxiosError` into `ApiError.code`. Matching on it rather than on the
 * human `message` means the copy below can be reworded — or the message
 * localised — without silently dropping the app into its generic fallback.
 */
export const PLAN_ERRORS = {
  FEATURE_NOT_INCLUDED: 'PLAN_FEATURE_NOT_INCLUDED',
  LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
} as const;

export type PlanErrorCode = (typeof PLAN_ERRORS)[keyof typeof PLAN_ERRORS];

/**
 * Is this the server telling us the business's plan refuses the action?
 *
 * `ApiError` narrows `code` from the body when the response parses as the
 * documented error shape, and falls back to `HTTP_403` when it does not — so
 * the status is checked too, otherwise an unlabelled 403 would be reported as a
 * plan problem it may not be.
 */
export function isPlanError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status !== 403) return false;
  return (
    error.code === PLAN_ERRORS.FEATURE_NOT_INCLUDED ||
    error.code === PLAN_ERRORS.LIMIT_REACHED
  );
}

/**
 * Copy worth showing for a refused branch action, or `null` when this is not a
 * plan refusal and the caller should fall back to the server's own wording.
 *
 * Each message says what happened *and* what the business can do about it —
 * a bare "forbidden" leaves the merchant with a dead-end form.
 */
export function branchPlanErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 403) return null;

  if (error.code === PLAN_ERRORS.LIMIT_REACHED) {
    return strings.locationsBranches.planLimitReached;
  }
  if (error.code === PLAN_ERRORS.FEATURE_NOT_INCLUDED) {
    return strings.locationsBranches.planFeatureNotIncluded;
  }
  // A 403 the API did not label: not ours to reinterpret, so the caller's
  // fallback (the server's own message) stands.
  return null;
}
