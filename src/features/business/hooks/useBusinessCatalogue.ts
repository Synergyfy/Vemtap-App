import { useQuery } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';
import { useActiveBranch } from '@features/business/hooks/useActiveBranch';
import type { BusinessCatalogueFeed, CatalogueItemQuery } from '@api/catalogueApi';

/** Pass as `branchScope` to read every location's items in one list. */
export const ALL_BRANCHES_SCOPE = 'all';

/**
 * The owner's own catalogue, any status. Defaults to the active branch;
 * `branchScope` overrides it with a specific branch id or `ALL_BRANCHES_SCOPE`.
 *
 * `GET /catalogue/items` filters by branch only and ignores `itemType`, so the
 * type filter is applied here; otherwise a "services" list shows products too.
 */
export function useBusinessCatalogue(query?: CatalogueItemQuery, branchScope?: string) {
  const { activeBranchId } = useActiveBranch();
  const scope = branchScope ?? activeBranchId ?? '';
  const branchId = scope === ALL_BRANCHES_SCOPE ? undefined : scope;
  const { itemType } = query ?? {};

  return useQuery({
    queryKey: ['catalogue', 'business', scope, query ?? {}],
    queryFn: () => catalogueApi.listBusinessItems(branchId, query ?? {}),
    enabled: Boolean(scope),
    staleTime: 60_000,
    select: (feed: BusinessCatalogueFeed): BusinessCatalogueFeed => {
      if (!itemType) return feed;
      const data = feed.data.filter(item => item.itemType === itemType);
      return { ...feed, data, total: data.length };
    },
  });
}
