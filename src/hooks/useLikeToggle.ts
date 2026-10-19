import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@store/authStore';
import { logger } from '@utils/logger';

/**
 * Instagram-style like: the heart flips the moment it is tapped, the server
 * catches up in the background, and the server's answer has the last word.
 *
 * Taps are never dropped or queued one request per tap. The cache holds the
 * state the customer *wants*; one sync loop per item sends a request only while
 * that differs from what the server last confirmed. Tapping like-unlike-like
 * fast therefore ends liked, with at most one request in flight per item, and a
 * failure snaps the heart back to the last confirmed state.
 */

export interface LikeStatus {
  liked: boolean;
  likesCount: number;
}

export interface UseLikeToggleOptions {
  /** Cache key for this item's `LikeStatus`; every view of the item shares it. */
  queryKey: readonly unknown[];
  /** Loads the viewer's state. Runs only when signed in unless `publicStatus`. */
  fetchStatus: () => Promise<LikeStatus>;
  /** The status endpoint is public (count for everyone, `liked` when signed in). */
  publicStatus?: boolean;
  /** Moves the server to `liked` and answers with the resulting state. */
  send: (liked: boolean) => Promise<LikeStatus>;
  /** Mirrors the count into another cache (e.g. deal cards' engagement counts). */
  onCount?: (update: (count: number) => number) => void;
  /** Called after a failed sync so dependent caches can refetch. */
  onFailed?: () => void;
  enabled?: boolean;
}

interface SyncEntry {
  /** What the server last confirmed. */
  server: boolean;
  busy: boolean;
}

/** One sync loop per item, per query client. */
const syncsByClient = new WeakMap<QueryClient, Map<string, SyncEntry>>();

function syncsFor(queryClient: QueryClient) {
  let syncs = syncsByClient.get(queryClient);
  if (!syncs) {
    syncs = new Map();
    syncsByClient.set(queryClient, syncs);
  }
  return syncs;
}

async function flush(
  queryClient: QueryClient,
  id: string,
  queryKey: readonly unknown[],
  options: UseLikeToggleOptions,
) {
  const syncs = syncsFor(queryClient);
  const entry = syncs.get(id);
  if (!entry || entry.busy) return;
  entry.busy = true;
  try {
    for (;;) {
      const wanted = queryClient.getQueryData<LikeStatus>(queryKey)?.liked;
      if (wanted === undefined || wanted === entry.server) break;
      // eslint-disable-next-line no-await-in-loop -- one request in flight per item
      const result = await options.send(wanted);
      entry.server = result.liked;
      const latest = queryClient.getQueryData<LikeStatus>(queryKey);
      // Keep the heart where the customer left it; only the count is the
      // server's. If they changed their mind mid-flight the loop goes again
      // and the next answer fixes the count.
      queryClient.setQueryData<LikeStatus>(queryKey, {
        liked: latest?.liked ?? result.liked,
        likesCount: result.likesCount,
      });
      options.onCount?.(() => result.likesCount);
    }
  } catch (error) {
    const latest = queryClient.getQueryData<LikeStatus>(queryKey);
    if (latest && latest.liked !== entry.server) {
      queryClient.setQueryData<LikeStatus>(queryKey, {
        liked: entry.server,
        likesCount: Math.max(0, latest.likesCount + (entry.server ? 1 : -1)),
      });
      options.onCount?.(count => Math.max(0, count + (entry.server ? 1 : -1)));
    }
    options.onFailed?.();
    logger.warn('api', 'Like failed, restored the last confirmed state', { error });
  } finally {
    syncs.delete(id);
  }
}

export function useLikeToggle(options: UseLikeToggleOptions) {
  const queryClient = useQueryClient();
  const isSignedIn = useAuthStore(state => state.status) === 'authenticated';
  const { fetchStatus, publicStatus = false, enabled = true } = options;
  // Signing in changes `liked`, so a public status is cached per auth state.
  const queryKey = useMemo(
    () => (publicStatus ? [...options.queryKey, isSignedIn] : options.queryKey),
    [isSignedIn, options.queryKey, publicStatus],
  );

  const { data } = useQuery<LikeStatus>({
    queryKey,
    queryFn: fetchStatus,
    enabled: (isSignedIn || publicStatus) && enabled,
    staleTime: 5 * 60_000,
  });

  const toggle = useCallback(() => {
    if (!isSignedIn) return;
    const id = JSON.stringify(queryKey);
    const current = queryClient.getQueryData<LikeStatus>(queryKey) ?? {
      liked: false,
      likesCount: 0,
    };
    // A status fetch landing after the tap would undo it. `revert: false`
    // stops the cancel itself from rolling the cache back over the tap.
    queryClient.cancelQueries({ queryKey }, { revert: false });
    const syncs = syncsFor(queryClient);
    if (!syncs.has(id)) syncs.set(id, { server: current.liked, busy: false });

    const next = !current.liked;
    const delta = next ? 1 : -1;
    queryClient.setQueryData<LikeStatus>(queryKey, {
      liked: next,
      likesCount: Math.max(0, current.likesCount + delta),
    });
    options.onCount?.(count => Math.max(0, count + delta));
    flush(queryClient, id, queryKey, options);
  }, [isSignedIn, options, queryClient, queryKey]);

  /** Double-tap: only ever likes, like Instagram's photo double-tap. */
  const like = useCallback(() => {
    if (queryClient.getQueryData<LikeStatus>(queryKey)?.liked) return;
    toggle();
  }, [queryClient, queryKey, toggle]);

  return {
    liked: data?.liked ?? false,
    likesCount: data?.likesCount ?? null,
    toggle,
    like,
    needsAuth: !isSignedIn,
  };
}
