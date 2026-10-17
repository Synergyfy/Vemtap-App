import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productCommentsApi,
  type BusinessProductComment,
  type ProductCommentReplyFilter,
  type ProductCommentsSummary,
} from '@api/productCommentsApi';

/**
 * The business's view of comments on its products. The reply filter is part of
 * the key, so "Unreplied" asks the server rather than slicing the last page.
 */
export const businessProductCommentKeys = {
  all: ['business-product-comments'] as const,
  list: (replied: ProductCommentReplyFilter) =>
    ['business-product-comments', 'list', replied] as const,
  summary: ['business-product-comments', 'summary'] as const,
};

export function useBusinessProductComments(
  replied: ProductCommentReplyFilter,
  enabled = true,
) {
  return useQuery<BusinessProductComment[]>({
    queryKey: businessProductCommentKeys.list(replied),
    queryFn: () =>
      productCommentsApi.listForBusiness(replied === 'all' ? {} : { replied }),
    enabled,
    staleTime: 30_000,
  });
}

export function useBusinessProductCommentsSummary(enabled = true) {
  return useQuery<ProductCommentsSummary>({
    queryKey: businessProductCommentKeys.summary,
    queryFn: () => productCommentsApi.summaryForBusiness(),
    enabled,
    staleTime: 60_000,
  });
}

/** Post or replace (`reply`) or remove (`null`) the business's public reply. */
export function useReplyToProductComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, reply }: { commentId: string; reply: string | null }) =>
      reply === null
        ? productCommentsApi.removeReply(commentId)
        : productCommentsApi.reply(commentId, reply),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: businessProductCommentKeys.all }),
  });
}

export function useRemoveProductComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => productCommentsApi.removeByBusiness(commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: businessProductCommentKeys.all }),
  });
}
