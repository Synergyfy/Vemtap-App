import { useQuery } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';
import { useAuthStore } from '@store/authStore';
import type { CatalogueItemQuery } from '@api/catalogueApi';

/**
 * Resolves which branch the business screens should read.
 *
 * `GET /businesses/my-business` does not carry a branchId, but the authenticated
 * user's own profile does (`User.branchId`, a required field on the profile
 * DTO), so the common single-branch case needs no extra request. When a business
 * has more than one branch — which the app already models — `GET /branches` is
 * the authority, so it is only fetched once the profile reports a branch and
 * callers that support switching read `branches`.
 */
export function useActiveBranch() {
  const userBranchId = useAuthStore(state => state.user?.branchId ?? '');
  const businessId = useAuthStore(state => state.user?.businessId ?? '');

  const branches = useQuery({
    queryKey: ['branches', businessId],
    queryFn: () => catalogueApi.listBusinessBranches(),
    // Only worth asking once we know which business we are.
    enabled: Boolean(businessId),
    staleTime: 300_000,
  });

  const branchId = userBranchId || branches.data?.[0]?.id || '';

  return {
    /** Empty string until a branch is known; consumers must handle that. */
    branchId,
    branches: branches.data ?? [],
    hasMultipleBranches: (branches.data?.length ?? 0) > 1,
    isLoading: branches.isLoading,
    isError: branches.isError,
  };
}

/** The owner's own catalogue at the active branch, any status. */
export function useBusinessCatalogue(query: CatalogueItemQuery = {}) {
  const { branchId } = useActiveBranch();

  return useQuery({
    queryKey: ['catalogue', 'business', branchId, query],
    queryFn: () => catalogueApi.listBusinessItems(branchId, query),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}
