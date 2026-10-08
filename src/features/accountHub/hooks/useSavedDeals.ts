import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '@api/dealsApi';
import type { Offer } from '@api/dealsApi';

/**
 * Hook for deal save/unsave functionality.
 * Uses the existing deal engagement endpoints.
 */
export const savedDealsKeys = {
  status: (offerId: string) => ['deals', 'saved', 'status', offerId] as const,
};

export function useDealSaveStatus(offerId: string | null) {
  return useQuery<{ saved: boolean }>({
    queryKey: offerId
      ? ['deals', 'saved', 'status', offerId]
      : ['deals', 'saved', 'status', 'none'],
    queryFn: () => dealsApi.getSaveStatus(offerId as string),
    enabled: Boolean(offerId),
    staleTime: 60_000,
  });
}

export function useToggleDealSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => dealsApi.toggleSave(offerId),
    onSuccess: (_result, offerId) => {
      // Invalidate the save status for this offer
      queryClient.invalidateQueries({ queryKey: ['deals', 'saved', 'status', offerId] });
      // Also invalidate engagement counts if needed
      queryClient.invalidateQueries({ queryKey: ['offers', 'engagement', offerId] });
    },
  });
}

/**
 * Hook to manage saved state for multiple deals efficiently.
 * Useful when rendering a list of deals where each needs its save status.
 */
export function useSavedDealsMap(offerIds: string[]) {
  const queryClient = useQueryClient();

  const queries = offerIds.map(id => ({
    queryKey: ['deals', 'saved', 'status', id] as const,
    queryFn: () => dealsApi.getSaveStatus(id),
    enabled: true,
    staleTime: 60_000,
  }));

  // For a simple map, we can use useQueries, but for now return individual hooks
  // The consumer should use useDealSaveStatus for individual deals
  return {
    queryClient,
    queries,
  };
}

/**
 * Type for a saved deal item in the Saved Hub.
 * Extends the Offer type with the saved status.
 */
export type SavedDealItem = Offer & { saved: boolean };

/**
 * Hook to fetch a paginated list of user's saved deals.
 * NOTE: This endpoint doesn't exist yet on the backend.
 * This is a placeholder for when the backend implements GET /me/saved/deals.
 */
export function useSavedDealsList() {
  // Placeholder for future implementation
  // return useQuery<SavedDealItem[]>({
  //   queryKey: ['deals', 'saved', 'list'],
  //   queryFn: () => dealsApi.getSavedDeals(),
  // });
  return { data: undefined, isLoading: false, isError: false };
}
