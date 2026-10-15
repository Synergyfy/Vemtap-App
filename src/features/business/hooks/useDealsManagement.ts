import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  catalogueApi,
  type DealLedgerPage,
  type DealLedgerQuery,
  type UpdateCatalogueOfferInput,
} from '@api/catalogueApi';
import { businessHubKeys } from '@features/business/hooks/useBusinessHubData';

/**
 * Owner-side deals: the Deals & Promotions list, its header numbers, one deal's
 * performance, and the redemption ledger. Every key lives under
 * `['business', 'deals']` so a single invalidation refreshes all of them after
 * a pause, resume or edit.
 */
export const dealsManagementKeys = {
  all: ['business', 'deals'] as const,
  groups: (branchId: string | null) =>
    ['business', 'deals', 'groups', branchId ?? 'all'] as const,
  summary: (branchId: string | null) =>
    ['business', 'deals', 'summary', branchId ?? 'all'] as const,
  stats: (dealGroupId: string) => ['business', 'deals', 'stats', dealGroupId] as const,
  ledger: (query: Omit<DealLedgerQuery, 'page'>) =>
    ['business', 'deals', 'ledger', query] as const,
};

const LEDGER_PAGE_SIZE = 20;

/**
 * Everything a deal change can make stale: this namespace plus the Business
 * hub's Deals module card, which counts the same offers.
 */
function invalidateDeals(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: dealsManagementKeys.all }),
    queryClient.invalidateQueries({ queryKey: businessHubKeys.offers(null).slice(0, 3) }),
  ]);
}

/** One row per deal (multi-branch deals collapsed), optionally for one branch. */
export function useDealGroups(branchId: string | null) {
  return useQuery({
    queryKey: dealsManagementKeys.groups(branchId),
    queryFn: () => catalogueApi.listBusinessOffers(branchId, { groupBy: 'deal' }),
    staleTime: 60_000,
  });
}

/** Live deals, today's claims and 30-day net revenue for the deals header. */
export function useDealsSummary(branchId: string | null) {
  return useQuery({
    queryKey: dealsManagementKeys.summary(branchId),
    queryFn: () => catalogueApi.getOffersSummary(branchId),
    staleTime: 60_000,
  });
}

/** One deal's performance across its branches. */
export function useDealGroupStats(dealGroupId: string | undefined) {
  return useQuery({
    queryKey: dealsManagementKeys.stats(dealGroupId ?? ''),
    queryFn: () => catalogueApi.getDealGroupStats(dealGroupId as string),
    enabled: Boolean(dealGroupId),
    staleTime: 60_000,
  });
}

/** The redemption ledger, paged on scroll. */
export function useDealLedger(query: Omit<DealLedgerQuery, 'page' | 'limit'>) {
  return useInfiniteQuery<DealLedgerPage>({
    queryKey: dealsManagementKeys.ledger(query),
    queryFn: ({ pageParam }) =>
      catalogueApi.getDealLedger({
        ...query,
        page: pageParam as number,
        limit: LEDGER_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.page * last.limit < last.total ? last.page + 1 : undefined,
    staleTime: 30_000,
  });
}

/** Pause (`inactive`) or resume (`active`) a deal at every one of its branches. */
export function useSetDealGroupStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dealGroupId,
      status,
    }: {
      dealGroupId: string;
      status: 'active' | 'inactive';
    }) => catalogueApi.updateOfferGroupStatus(dealGroupId, status),
    onSuccess: () => invalidateDeals(queryClient),
  });
}

/** Apply one edit to every branch of a deal. */
export function useUpdateDealGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dealGroupId,
      input,
    }: {
      dealGroupId: string;
      input: UpdateCatalogueOfferInput;
    }) => catalogueApi.updateOfferGroup(dealGroupId, input),
    onSuccess: () => invalidateDeals(queryClient),
  });
}

export { invalidateDeals };
