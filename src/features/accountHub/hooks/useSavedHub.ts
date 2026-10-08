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

const isCustomerSession = (role: string | undefined | null) => role === 'Customer';

export const savedHubKeys = {
  all: ['me', 'saved'] as const,
  feed: (type: SavedItemType | 'ALL', page: number) =>
    [...savedHubKeys.all, 'feed', type, page] as const,
  counts: (type: SavedItemType) => [...savedHubKeys.all, 'count', type] as const,
  dealStatus: (offerId: string) => ['deals', 'saved', 'status', offerId] as const,
  businessStatus: (businessId: string) =>
    [...savedHubKeys.all, 'status', 'business', businessId] as const,
  serviceStatus: (serviceId: string) =>
    [...savedHubKeys.all, 'status', 'service', serviceId] as const,
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
  const isCustomer = useAuthStore(state => isCustomerSession(state.user?.role));
  return useQuery<SavedPage>({
    queryKey: savedHubKeys.feed(type ?? 'ALL', page),
    queryFn: () => savedApi.listSaved({ type, page, limit: FEED_PAGE_SIZE }),
    enabled: isCustomer,
    staleTime: STALE_MS,
  });
}

/**
 * Per-store totals for the tab labels. Each count is a `limit: 1` read of the
 * same feed, so it shares row parsing with the lists. Three requests, cached
 * for five minutes; `all` is their sum, which is exactly how the server
 * computes the unified total.
 */
export function useSavedTotals() {
  const isCustomer = useAuthStore(state => isCustomerSession(state.user?.role));

  const deals = useQuery<number>({
    queryKey: savedHubKeys.counts('DEAL'),
    queryFn: async () => (await savedApi.listSaved({ type: 'DEAL', limit: 1 })).total,
    enabled: isCustomer,
    staleTime: COUNT_STALE_MS,
  });
  const businesses = useQuery<number>({
    queryKey: savedHubKeys.counts('BUSINESS'),
    queryFn: async () => (await savedApi.listSaved({ type: 'BUSINESS', limit: 1 })).total,
    enabled: isCustomer,
    staleTime: COUNT_STALE_MS,
  });
  const services = useQuery<number>({
    queryKey: savedHubKeys.counts('SERVICE'),
    queryFn: async () => (await savedApi.listSaved({ type: 'SERVICE', limit: 1 })).total,
    enabled: isCustomer,
    staleTime: COUNT_STALE_MS,
  });

  const settled = deals.isSuccess && businesses.isSuccess && services.isSuccess;

  return {
    deals: deals.data,
    businesses: businesses.data,
    services: services.data,
    all: settled
      ? (deals.data ?? 0) + (businesses.data ?? 0) + (services.data ?? 0)
      : undefined,
    isSuccess: settled,
    isLoading: deals.isLoading || businesses.isLoading || services.isLoading,
  };
}

// ---------------------------------------------------------------------------
// Deal saves
// ---------------------------------------------------------------------------

/** Save status for one deal. Note the server answers `{ isSaved }`. */
export function useDealSaveStatus(offerId: string | null) {
  const isCustomer = useAuthStore(state => isCustomerSession(state.user?.role));
  return useQuery<{ isSaved: boolean }>({
    queryKey: savedHubKeys.dealStatus(offerId ?? 'none'),
    queryFn: () => dealsApi.getSaveStatus(offerId as string),
    enabled: isCustomer && Boolean(offerId),
    staleTime: STALE_MS,
  });
}

export function useToggleDealSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => dealsApi.toggleSave(offerId),
    onSuccess: (_result, offerId) => {
      queryClient.invalidateQueries({ queryKey: savedHubKeys.all });
      queryClient.invalidateQueries({ queryKey: savedHubKeys.dealStatus(offerId) });
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
  const isCustomer = useAuthStore(state => isCustomerSession(state.user?.role));
  return useQuery<{ isSaved: boolean }>({
    queryKey: savedHubKeys.businessStatus(businessId ?? 'none'),
    queryFn: () => savedApi.getBusinessSaveStatus(businessId as string),
    enabled: isCustomer && Boolean(businessId),
    staleTime: STALE_MS,
  });
}

export function useToggleBusinessSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessId: string) => savedApi.toggleBusinessSave(businessId),
    onSuccess: (_result, businessId) => {
      queryClient.invalidateQueries({ queryKey: savedHubKeys.all });
      queryClient.invalidateQueries({
        queryKey: savedHubKeys.businessStatus(businessId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Service saves
// ---------------------------------------------------------------------------

export function useServiceSaveStatus(serviceId: string | null) {
  const isCustomer = useAuthStore(state => isCustomerSession(state.user?.role));
  return useQuery<{ isSaved: boolean }>({
    queryKey: savedHubKeys.serviceStatus(serviceId ?? 'none'),
    queryFn: () => savedApi.getServiceSaveStatus(serviceId as string),
    enabled: isCustomer && Boolean(serviceId),
    staleTime: STALE_MS,
  });
}

export function useToggleServiceSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => savedApi.toggleServiceSave(serviceId),
    onSuccess: (_result, serviceId) => {
      queryClient.invalidateQueries({ queryKey: savedHubKeys.all });
      queryClient.invalidateQueries({
        queryKey: savedHubKeys.serviceStatus(serviceId),
      });
    },
  });
}
