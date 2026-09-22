import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { userApi, type User } from '@api/userApi';
import type { PaginationMeta } from '@app-types/api';

export interface UsePaginatedUsersOptions {
  query?: string;
  perPage?: number;
  enabled?: boolean;
}

/**
 * Standardized infinite pagination via React Query.
 * - Automatic AbortController cancellation on unmount (signal passed through)
 * - Exponential backoff retries (default: 3 attempts)
 * - Cache persists offline via persistQueryClient
 */
export function usePaginatedUsers(options: UsePaginatedUsersOptions = {}) {
  const { query = '', perPage = 20, enabled = true } = options;

  const queryResult = useInfiniteQuery<
    { data: User[]; meta: PaginationMeta },
    Error,
    { pages: { data: User[]; meta: PaginationMeta }[]; users: User[]; meta?: PaginationMeta },
    readonly unknown[],
    number
  >({
    queryKey: ['users', 'list', { query, perPage }],
    initialPageParam: 1,
    enabled,
    queryFn: async ({ pageParam, signal }) => {
      const result = await userApi.fetchUsers(
        { page: pageParam, perPage, query },
        { signal },
      );
      return { data: result.data, meta: result.meta };
    },
    getNextPageParam: lastPage =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    select: data => ({
      pages: data.pages,
      users: data.pages.flatMap(page => page.data),
      meta: data.pages[data.pages.length - 1]?.meta,
    }),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      const status = (error as { status?: number }).status ?? 0;
      if (status >= 400 && status < 500 && status !== 408) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = queryResult;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    ...queryResult,
    users: queryResult.data?.users ?? [],
    meta: queryResult.data?.meta,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
  };
}
