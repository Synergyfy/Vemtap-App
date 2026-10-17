import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dealsApi,
  type BusinessReviewStatus,
  type BusinessReview,
  type BusinessReviewsSummary,
} from '@api/dealsApi';

/**
 * Reviews & reputation queries and the writes behind the moderation screen.
 *
 * `status` is part of the key, so the chips are separate queries rather than one
 * list filtered in the component: a "Pending" chip has to show the moderation
 * queue the server holds, not a client-side slice of whatever was last fetched.
 */
export const businessReviewsKeys = {
  all: ['business-reviews'] as const,
  list: (status?: BusinessReviewStatus) =>
    ['business-reviews', 'list', status ?? 'all'] as const,
  summary: ['business-reviews', 'summary'] as const,
};

/** `GET /deals/business/reviews` — OWNER/MANAGER only, so a 403 is possible. */
export function useBusinessReviews(status?: BusinessReviewStatus, limit = 50) {
  return useQuery<BusinessReview[]>({
    queryKey: businessReviewsKeys.list(status),
    queryFn: async () => {
      const page = await dealsApi.listBusinessReviews({ status, limit });
      return page.reviews;
    },
    staleTime: 30_000,
  });
}

/** `GET /deals/business/reviews/summary` — score, counts and star buckets. */
export function useBusinessReviewsSummary() {
  return useQuery<BusinessReviewsSummary>({
    queryKey: businessReviewsKeys.summary,
    queryFn: () => dealsApi.getBusinessReviewsSummary(),
    staleTime: 60_000,
  });
}

export type ReviewModerationAction = 'approve' | 'reject' | 'delete';

/**
 * Approve / reject / delete a review.
 *
 * The cache is updated optimistically, because the server answers with only
 * `{ id, status }` (or nothing at all for a delete) while the screen needs the
 * whole row to move it between the chips it was rendered under.
 */
export function useModerateBusinessReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { reviewId: string; action: ReviewModerationAction }) => {
      if (input.action === 'approve') {
        await dealsApi.approveBusinessReview(input.reviewId);
        return;
      }
      if (input.action === 'reject') {
        await dealsApi.rejectBusinessReview(input.reviewId);
        return;
      }
      await dealsApi.deleteBusinessReview(input.reviewId);
    },
    onMutate: async ({ reviewId, action }) => {
      await queryClient.cancelQueries({ queryKey: businessReviewsKeys.all });

      // Snapshot every list before touching them, so a failed write can be undone.
      const previousLists = queryClient.getQueriesData<BusinessReview[]>({
        queryKey: businessReviewsKeys.all,
      });

      const status: BusinessReviewStatus | null =
        action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : null;

      previousLists.forEach(([key, rows]) => {
        const row = rows?.find(candidate => candidate.id === reviewId);
        if (!rows || !row) {
          return;
        }

        // The row leaves every list it was in, then rejoins the one its new
        // status belongs to — approved/rejected move, a delete just disappears.
        queryClient.setQueryData<BusinessReview[]>(
          key,
          rows.filter(candidate => candidate.id !== reviewId),
        );
        if (status) {
          const targetKey = businessReviewsKeys.list(status);
          const target = queryClient.getQueryData<BusinessReview[]>(targetKey);
          if (target) {
            queryClient.setQueryData<BusinessReview[]>(targetKey, [
              { ...row, status },
              ...target,
            ]);
          }
        }
      });

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      for (const [key, rows] of context.previousLists) {
        queryClient.setQueryData(key, rows);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: businessReviewsKeys.all });
    },
  });
}

/**
 * Post, replace (`reply` set) or remove (`reply` null) the business's public
 * reply to a review; every review list refetches afterwards.
 */
export function useReplyToBusinessReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { reviewId: string; reply: string | null }) => {
      if (input.reply === null) {
        await dealsApi.removeBusinessReviewReply(input.reviewId);
        return;
      }
      await dealsApi.replyToBusinessReview(input.reviewId, input.reply);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: businessReviewsKeys.all });
    },
  });
}
