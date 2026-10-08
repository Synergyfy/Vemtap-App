import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dealsApi,
  type CreateDealReviewInput,
  type DealReviewDetail,
  type DealReviewsPage,
  type UpdateDealReviewInput,
} from '@api/dealsApi';

/**
 * Deal review data layer.
 *
 * The offer's `reviewsCount`/`averageRating` are re-synced by the server on
 * every create/update/delete, so the mutations also invalidate the offer
 * detail, the public feed and the engagement summary — anything on screen that
 * shows a review count stays truthful. Only the detail route reports
 * `isAuthor`, so edit/delete affordances hang off `useDealReviewDetail`, which
 * always sends the token (the axios client attaches it).
 *
 * Fictional seed offers have no UUID; callers pass `null` and the queries stay
 * disabled, leaving the designed demo content in place.
 */

const PAGE_SIZE = 20;
const STALE_MS = 30_000;

export const dealReviewKeys = {
  all: (offerId: string) => ['deals', 'reviews', offerId] as const,
  list: (offerId: string) => [...dealReviewKeys.all(offerId), 'list'] as const,
  detail: (offerId: string, reviewId: string) =>
    [...dealReviewKeys.all(offerId), 'detail', reviewId] as const,
};

function invalidateReviewSurfaces(
  queryClient: ReturnType<typeof useQueryClient>,
  offerId: string,
) {
  queryClient.invalidateQueries({ queryKey: dealReviewKeys.all(offerId) });
  queryClient.invalidateQueries({ queryKey: ['offers', 'detail', offerId] });
  queryClient.invalidateQueries({ queryKey: ['offers', 'engagement', offerId] });
  queryClient.invalidateQueries({ queryKey: ['offers', 'public'] });
}

/** Approved reviews for a live offer, newest first. */
export function useDealReviews(offerId: string | null) {
  return useQuery<DealReviewsPage>({
    queryKey: dealReviewKeys.list(offerId ?? 'none'),
    queryFn: () => dealsApi.listReviews(offerId as string, { page: 1, limit: PAGE_SIZE }),
    enabled: Boolean(offerId),
    staleTime: STALE_MS,
  });
}

/** One review; `isAuthor` is only true when the author's token was sent. */
export function useDealReviewDetail(offerId: string | null, reviewId: string | null) {
  return useQuery<DealReviewDetail>({
    queryKey: dealReviewKeys.detail(offerId ?? 'none', reviewId ?? 'none'),
    queryFn: () => dealsApi.getReview(offerId as string, reviewId as string),
    enabled: Boolean(offerId && reviewId),
    staleTime: STALE_MS,
    retry: false,
  });
}

export function useCreateDealReview(offerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDealReviewInput) =>
      dealsApi.createReview(offerId as string, input),
    onSuccess: () => {
      if (offerId) invalidateReviewSurfaces(queryClient, offerId);
    },
  });
}

export function useUpdateDealReview(offerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      input,
    }: {
      reviewId: string;
      input: UpdateDealReviewInput;
    }) => dealsApi.updateReview(offerId as string, reviewId, input),
    onSuccess: updated => {
      if (!offerId) return;
      queryClient.setQueryData(dealReviewKeys.detail(offerId, updated.id), updated);
      invalidateReviewSurfaces(queryClient, offerId);
    },
  });
}

export function useDeleteDealReview(offerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => dealsApi.deleteReview(offerId as string, reviewId),
    onSuccess: (_result, reviewId) => {
      if (!offerId) return;
      queryClient.removeQueries({
        queryKey: dealReviewKeys.detail(offerId, reviewId),
      });
      invalidateReviewSurfaces(queryClient, offerId);
    },
  });
}
