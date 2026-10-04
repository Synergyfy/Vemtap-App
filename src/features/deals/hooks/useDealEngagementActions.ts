import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi, type DealEngagement } from '@api/dealsApi';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

/**
 * Optimistic like/save for a deal.
 *
 * The API documents no response body for the reaction/save toggles, so the
 * cache is treated as the source of truth for the UI: the count and the flag
 * flip immediately, the request reconciles the count on settle, and any failure
 * restores the previous value. That keeps the interaction instant without
 * inventing a response contract.
 *
 * Both endpoints are authenticated, so an anonymous tap is reported through
 * `needsAuth` for the screen to route to sign-in rather than firing a request
 * that can only 401.
 */

export const engagementKeys = {
  counts: (offerId: string) => ['offers', 'engagement', offerId] as const,
  reaction: (offerId: string) => ['offers', 'reaction', offerId] as const,
  saved: (offerId: string) => ['offers', 'saved', offerId] as const,
};

type ReactionState = { liked: boolean };
type SavedState = { saved: boolean };

/**
 * Reads a client-held flag out of the query cache. `enabled: false` keeps this
 * a pure cache subscription — it never fetches, but it does re-render when the
 * optimistic write in `onMutate` lands, which a bare `getQueryData` would miss.
 */
function useClientFlag<T>(queryKey: readonly unknown[], initial: T) {
  const { data } = useQuery<T>({
    queryKey,
    queryFn: async () => initial,
    initialData: initial,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data;
}

export function useDealReaction(offerId: string) {
  const queryClient = useQueryClient();
  const status = useAuthStore(state => state.status);
  const isSignedIn = status === 'authenticated';
  const reaction = useClientFlag<ReactionState>(engagementKeys.reaction(offerId), {
    liked: false,
  });

  type ReactionContext = {
    previousReaction?: ReactionState;
    previousCounts?: DealEngagement;
  };

  const mutation = useMutation<void, Error, void, ReactionContext>({
    mutationFn: () => dealsApi.setReaction(offerId, 'like').then(() => undefined),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: engagementKeys.reaction(offerId) });
      await queryClient.cancelQueries({ queryKey: engagementKeys.counts(offerId) });

      const previousReaction = queryClient.getQueryData<ReactionState>(
        engagementKeys.reaction(offerId),
      );
      const previousCounts = queryClient.getQueryData<DealEngagement>(
        engagementKeys.counts(offerId),
      );

      const wasLiked = previousReaction?.liked ?? false;
      const nextLiked = !wasLiked;

      queryClient.setQueryData<ReactionState>(engagementKeys.reaction(offerId), {
        liked: nextLiked,
      });
      queryClient.setQueryData<DealEngagement>(engagementKeys.counts(offerId), old =>
        old
          ? { ...old, likesCount: Math.max(0, old.likesCount + (nextLiked ? 1 : -1)) }
          : old,
      );

      return { previousReaction, previousCounts, wasLiked };
    },

    onError: (error, _variables, context) => {
      if (context?.previousReaction) {
        queryClient.setQueryData(
          engagementKeys.reaction(offerId),
          context.previousReaction,
        );
      }
      if (context?.previousCounts) {
        queryClient.setQueryData(engagementKeys.counts(offerId), context.previousCounts);
      }
      logger.warn('api', 'Like failed, restored previous state', { offerId, error });
    },

    onSettled: () => {
      // The server is the system of record for the count.
      queryClient.invalidateQueries({ queryKey: engagementKeys.counts(offerId) });
    },
  });

  const toggle = useCallback(() => {
    if (!isSignedIn || mutation.isPending) return;
    mutation.mutate();
  }, [isSignedIn, mutation]);

  return {
    liked: reaction?.liked ?? false,
    toggle,
    isPending: mutation.isPending,
    needsAuth: !isSignedIn,
  };
}

export function useDealSave(offerId: string) {
  const queryClient = useQueryClient();
  const status = useAuthStore(state => state.status);
  const isSignedIn = status === 'authenticated';
  const savedState = useClientFlag<SavedState>(engagementKeys.saved(offerId), {
    saved: false,
  });

  const mutation = useMutation<void, Error, void, { previous?: SavedState }>({
    mutationFn: () => dealsApi.toggleSave(offerId).then(() => undefined),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: engagementKeys.saved(offerId) });
      const previous = queryClient.getQueryData<SavedState>(
        engagementKeys.saved(offerId),
      );
      queryClient.setQueryData<SavedState>(engagementKeys.saved(offerId), {
        saved: !(previous?.saved ?? false),
      });
      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(engagementKeys.saved(offerId), context.previous);
      }
      logger.warn('api', 'Save failed, restored previous state', { offerId, error });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.saved(offerId) });
    },
  });

  const toggle = useCallback(() => {
    if (!isSignedIn || mutation.isPending) return;
    mutation.mutate();
  }, [isSignedIn, mutation]);

  return {
    saved: savedState?.saved ?? false,
    toggle,
    isPending: mutation.isPending,
    needsAuth: !isSignedIn,
  };
}
