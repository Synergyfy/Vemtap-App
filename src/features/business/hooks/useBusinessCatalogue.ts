import { useQuery } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import type { CatalogueItemQuery } from '@api/catalogueApi';

/** The owner's own catalogue at the active branch, any status. */
export function useBusinessCatalogue(query: CatalogueItemQuery = {}) {
  const { activeBranchId } = useActiveBranch();
  const branchId = activeBranchId ?? '';

  return useQuery({
    queryKey: ['catalogue', 'business', branchId, query],
    queryFn: () => catalogueApi.listBusinessItems(branchId, query),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}
