import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '@api/dealsApi';
import { savedApi, type SavedItemType, type SavedPage } from '@api/savedApi';
import { useAuthStore } from '@store/authStore';

/**
 * The Saved Hub data layer.
 *
 * Every endpoint behind these hooks is CUSTOMER-only: an owner token gets
 * `403` and anonymous `401`. The list/count queries are therefore gated on the
 * session role so an owner using the consumer shell never fires them; the
 * screens render their empty/unavailable state instead. Mutations are not
 * gated — the buttons only exist on screens that already loaded as a customer.
 *
 * Cache layout: the unified feed gets one key per `type`+page, matching the
 * server contract (`GET /me/saved?type=...`). `useSavedTotals` counts come from
 * one-row pages (`limit: 1`) of the same feed, so browsing a tab warms the
 * count and vice versa. Deleting a save invalidates the whole `['me','saved']`
 * namespace at once — the stores overlap across those views.
 */

/**
 * Gate on the *token's* role, not the profile's. `useCustomerTokenSync` keeps
 * them in step, but until it has run — or if it fails — `user.role` can claim
 * 'Customer' while the stored token authorises nothing. The API decides, so the
 * token decides.
 */
const isCustomerToken = (tokenRole: string | undefined | null) =>
  tokenRole === 'Customer';

/**
 * Scoped by account. A shared key would let one account's saved rows serve
 * another's from cache after a sign-out/sign-in — the Saved Hub showing
 * "mock data" was exactly this, plus a stale owner-side fetch surviving into a
 * customer-mode session.
 */
export const savedHubKeys = {
  all: ['me', 'saved'] as const,
  feed: (
    accountKey: string | null | undefined,
    type: SavedItemType | 'ALL',
    page: number,
  ) => [...savedHubKeys.all, accountKey ?? 'anonymous', 'feed', type, page] as const,
  dealStatus: (accountKey: string | null | undefined, offerId: string) =>
    ['deals', 'saved', accountKey ?? 'anonymous', 'status', offerId] as const,
  businessStatus: (accountKey: string | null | undefined, businessId: string) =>
    [
      ...savedHubKeys.all,
      accountKey ?? 'anonymous',
      'status',
      'business',
      businessId,
    ] as const,
  serviceStatus: (accountKey: string | null | undefined, serviceId: string) =>
    [
      ...savedHubKeys.all,
      accountKey ?? 'anonymous',
      'status',
      'service',
      serviceId,
    ] as const,
};

/**
 * The server caps `limit` at 50. One page is enough for a saved-items hub (the
 * design has no pager); anything beyond it is reachable from the item itself.
 */
const FEED_PAGE_SIZE = 50;
const STALE_MS = 60_000;
const COUNT_STALE_MS = 5 * 60_000;

/** A page of the unified saved feed, optionally filtered to one store. */
export function useSavedFeed(type?: SavedItemType, page = 1) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  const userId = useAuthStore(state => state.user?.uniqueCode);
  return useQuery<SavedPage>({
    queryKey: savedHubKeys.feed(userId, type ?? 'ALL', page),
    queryFn: () => savedApi.listSaved({ type, page, limit: FEED_PAGE_SIZE }),
    enabled: isCustomer,
    staleTime: STALE_MS,
  });
}

/**
 * Per-store totals for the tab labels and the Account badge.
 *
 * `GET /me/saved` already reads all three stores to merge them and reports
 * each one's count, so this is one request rather than a `limit: 1` read per
 * store. The response shape is unchanged for callers: figures stay `undefined`
 * until the query settles, because `AccountHomeScreen` uses that to decide
 * whether to show a badge at all.
 */
export function useSavedTotals() {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  const accountKey = useAuthStore(state => state.user?.uniqueCode);
  const query = useQuery<SavedPage>({
    // Scoped per account like every other key here: the totals are the same
    // data the feed is, so they must not outlive the account they belong to.
    queryKey: [...savedHubKeys.all, accountKey ?? 'anonymous', 'totals'],
    queryFn: () => savedApi.listSaved({ limit: 1 }),
    enabled: isCustomer,
    staleTime: COUNT_STALE_MS,
  });

  const totals = query.data?.totals;
  return {
    deals: totals?.deals,
    businesses: totals?.businesses,
    services: totals?.services,
    all: totals?.all,
    isSuccess: totals !== undefined,
    isLoading: query.isLoading,
  };
}

// ---------------------------------------------------------------------------
// Deal saves
// ---------------------------------------------------------------------------

/** Save status for one deal. Note the server answers `{ isSaved }`. */
export function useDealSaveStatus(offerId: string | null) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  const userId = useAuthStore(state => state.user?.uniqueCode);
  return useQuery<{ isSaved: boolean }>({
    queryKey: savedHubKeys.dealStatus(userId, offerId ?? 'none'),
    queryFn: () => dealsApi.getSaveStatus(offerId as string),
    enabled: isCustomer && Boolean(offerId),
    staleTime: STALE_MS,
  });
}

export function useToggleDealSave() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(state => state.user?.uniqueCode);
  return useMutation({
    mutationFn: (offerId: string) => dealsApi.toggleSave(offerId),
    onSuccess: (_result, offerId) => {
      queryClient.invalidateQueries({ queryKey: savedHubKeys.all });
      queryClient.invalidateQueries({
        queryKey: savedHubKeys.dealStatus(userId, offerId),
      });
      // The offer's counts and the engagement badge can change with the save.
      queryClient.invalidateQueries({ queryKey: ['offers', 'detail', offerId] });
      queryClient.invalidateQueries({ queryKey: ['offers', 'engagement', offerId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Business saves
// ---------------------------------------------------------------------------

export function useBusinessSaveStatus(businessId: string | null) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  const userId = useAuthStore(state => state.user?.uniqueCode);
  return useQuery<{ isSaved: boolean }>({
    queryKey: savedHubKeys.businessStatus(userId, businessId ?? 'none'),
    queryFn: () => savedApi.getBusinessSaveStatus(businessId as string),
    enabled: isCustomer && Boolean(businessId),
    staleTime: STALE_MS,
  });
}

export function useToggleBusinessSave() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(state => state.user?.uniqueCode);
  return useMutation({
    mutationFn: (businessId: string) => savedApi.toggleBusinessSave(businessId),
    onSuccess: (_result, businessId) => {
      queryClient.invalidateQueries({ queryKey: savedHubKeys.all });
      queryClient.invalidateQueries({
        queryKey: savedHubKeys.businessStatus(userId, businessId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Service saves
// ---------------------------------------------------------------------------

export function useServiceSaveStatus(serviceId: string | null) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  const userId = useAuthStore(state => state.user?.uniqueCode);
  return useQuery<{ isSaved: boolean }>({
    queryKey: savedHubKeys.serviceStatus(userId, serviceId ?? 'none'),
    queryFn: () => savedApi.getServiceSaveStatus(serviceId as string),
    enabled: isCustomer && Boolean(serviceId),
    staleTime: STALE_MS,
  });
}

export function useToggleServiceSave() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(state => state.user?.uniqueCode);
  return useMutation({
    mutationFn: (serviceId: string) => savedApi.toggleServiceSave(serviceId),
    onSuccess: (_result, serviceId) => {
      queryClient.invalidateQueries({ queryKey: savedHubKeys.all });
      queryClient.invalidateQueries({
        queryKey: savedHubKeys.serviceStatus(userId, serviceId),
      });
    },
  });
}
