import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors } from '@theme/colors';

const MIN_REFRESH_MS = 600;

/**
 * Pull-to-refresh for screens backed by React Query.
 *
 * Invalidates every query key the screen depends on, so a drag-down refetches
 * exactly the data that screen renders — no more, no less. Prefix keys
 * (e.g. `['loyalty']`) invalidate every query under that namespace.
 *
 * The spinner stays up for at least `MIN_REFRESH_MS` so a fast refetch doesn't
 * flash the indicator, and `isRefreshing` resets even if a refetch rejects so
 * the control never sticks.
 *
 * `refreshControl` is the one branded control every screen passes to its
 * ScrollView, so spinner colour and offset cannot drift between screens.
 * `colors` tints Android; iOS ignores it and needs `tintColor`.
 */
export function usePullToRefresh(queryKeys: (readonly (string | number)[])[]) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startedAt = useRef(0);

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    startedAt.current = Date.now();
    try {
      await Promise.allSettled(
        queryKeys.map(key =>
          queryClient.invalidateQueries({ queryKey: key, exact: false }),
        ),
      );
    } finally {
      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, MIN_REFRESH_MS - elapsed);
      setTimeout(() => setIsRefreshing(false), remaining);
    }
  }, [isRefreshing, queryClient, queryKeys]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
        progressViewOffset={60}
      />
    ),
    [isRefreshing, onRefresh],
  );

  return { onRefresh, isRefreshing, refreshControl };
}
