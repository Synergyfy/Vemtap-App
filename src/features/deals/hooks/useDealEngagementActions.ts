import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi, type DealEngagement, type ReactionStatus } from '@api/dealsApi';
import {
  useLikeToggle,
  type LikeStatus,
  type UseLikeToggleOptions,
} from '@hooks/useLikeToggle';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';
import { savedHubKeys } from '@features/accountHub/hooks/useSavedHub';

/**
 * Like and save for a deal.
 *
 * Both start from the server's answer for the signed-in viewer
 * (`reaction-status` / `save-status`), flip immediately on tap, and take the
 * server's response as the final word. Before this the flags lived only in the
 * client cache, so a liked deal showed as unliked after a restart and the next
 * tap sent the toggle the wrong way.
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

type SavedState = { saved: boolean };

function toLikeStatus(status: ReactionStatus): LikeStatus {
  return { liked: status.type === 'like', likesCount: status.likesCount };
}

export function useDealReaction(offerId: string) {
  const queryClient = useQueryClient();
  const setCount = useCallback(
    (update: (count: number) => number) =>
      // The count every card shows lives in the engagement cache.
      queryClient.setQueryData<DealEngagement>(engagementKeys.counts(offerId), old =>
        old ? { ...old, likesCount: update(old.likesCount) } : old,
      ),
    [offerId, queryClient],
  );

  const options = useMemo<UseLikeToggleOptions>(
    () => ({
      queryKey: engagementKeys.reaction(offerId),
      fetchStatus: async () => {
        const status = toLikeStatus(await dealsApi.getReactionStatus(offerId));
        setCount(() => status.likesCount);
        return status;
      },
      // The endpoint toggles; the sync loop only calls it while the server
      // differs from what the customer wants, and re-checks the answer.
      send: async () => toLikeStatus(await dealsApi.setReaction(offerId, 'like')),
      onCount: setCount,
      onFailed: () =>
        queryClient.invalidateQueries({ queryKey: engagementKeys.counts(offerId) }),
      enabled: Boolean(offerId),
    }),
    [offerId, queryClient, setCount],
  );

  const { liked, toggle, like, needsAuth } = useLikeToggle(options);
  return { liked, toggle, like, needsAuth };
}

export function useDealSave(offerId: string) {
  const queryClient = useQueryClient();
  const status = useAuthStore(state => state.status);
  const isSignedIn = status === 'authenticated';
  const { data: savedState } = useQuery<SavedState>({
    queryKey: engagementKeys.saved(offerId),
    queryFn: async () => ({
      saved: (await dealsApi.getSaveStatus(offerId)).isSaved,
    }),
    enabled: isSignedIn && Boolean(offerId),
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation<
    { saved: boolean } | undefined,
    Error,
    void,
    { previous?: SavedState }
  >({
    mutationFn: () => dealsApi.toggleSave(offerId),

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
      queryClient.setQueryData<SavedState>(
        engagementKeys.saved(offerId),
        context?.previous ?? { saved: false },
      );
      logger.warn('api', 'Save failed, restored previous state', { offerId, error });
    },

    onSuccess: result => {
      // The server decides the direction; its answer is the saved state.
      if (typeof result?.saved === 'boolean') {
        queryClient.setQueryData<SavedState>(engagementKeys.saved(offerId), {
          saved: result.saved,
        });
      }
    },

    onSettled: () => {
      // Without this a save made here would leave the Saved Hub showing the
      // old list until its own cache went stale.
      queryClient.invalidateQueries({ queryKey: savedHubKeys.all });
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
