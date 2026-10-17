import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productCommentsApi,
  type ProductCommentInput,
  type ProductCommentsPage,
} from '@api/productCommentsApi';
import { businessProductCommentKeys } from '@features/business/hooks/useBusinessProductComments';

/**
 * Comments on one catalogue product. The list carries the product's rating
 * summary, so every write invalidates it and the header stays truthful. The
 * axios client attaches the token when signed in, which is what makes `isMine`
 * come back true on the caller's own comment.
 */

const PAGE_SIZE = 20;

export const productCommentKeys = {
  list: (itemId: string) => ['catalogue', 'item', itemId, 'comments'] as const,
};

export function useProductComments(itemId: string | null) {
  return useQuery<ProductCommentsPage>({
    queryKey: productCommentKeys.list(itemId ?? 'none'),
    queryFn: () => productCommentsApi.list(itemId as string, { limit: PAGE_SIZE }),
    enabled: Boolean(itemId),
    staleTime: 30_000,
  });
}

function useInvalidate(itemId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: productCommentKeys.list(itemId) });
    void queryClient.invalidateQueries({ queryKey: businessProductCommentKeys.all });
  };
}

export function useCreateProductComment(itemId: string) {
  const invalidate = useInvalidate(itemId);
  return useMutation({
    mutationFn: (input: ProductCommentInput) => productCommentsApi.create(itemId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateProductComment(itemId: string) {
  const invalidate = useInvalidate(itemId);
  return useMutation({
    mutationFn: (input: { commentId: string } & Partial<ProductCommentInput>) => {
      const { commentId, ...body } = input;
      return productCommentsApi.update(itemId, commentId, body);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteProductComment(itemId: string) {
  const invalidate = useInvalidate(itemId);
  return useMutation({
    mutationFn: (commentId: string) => productCommentsApi.remove(itemId, commentId),
    onSuccess: invalidate,
  });
}
