import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import {
  connectNotificationsSocket,
  disconnectNotificationsSocket,
  disposeNotificationsSocket,
  syncNotificationsUnreadCount,
} from '@api/notificationsSocket';
import { useAppState } from '@hooks/useAppState';
import { showInfo } from '@components/shared/toast';
import { queryClient } from '@store/queryClient';
import { logger } from '@utils/logger';
import { notificationKeys } from './useNotifications';

/**
 * Realtime bridge between the `/notifications` socket and the app's notification
 * queries — the reason the bell and the centre move without a refetch.
 *
 * Without it the rows were pull-only: a new notification existed on the server
 * and nothing on the device knew until the screen was reopened, so a bell count
 * could sit on a stale number for the length of a session. This mirrors
 * `useCustomerMessagingRealtime`: connected while foregrounded, dropped on
 * background, with an invalidation throttle so an event storm cannot turn into
 * a fetch storm.
 *
 * The event payloads are treated as a *reason to refetch*, not as data to fold
 * in. That is the deliberate difference from the messaging bridge, which has to
 * patch rows because it streams partial updates all session: here the emit is
 * only ever written together with the row, so a refetch is both simpler and
 * impossible to get wrong. The one thing taken from the payload is the title,
 * for the foreground toast.
 */

interface CreatedPayload {
  notification?: {
    title?: string;
  };
}

interface ReadAllPayload {
  unreadCount?: number;
}

/** Collapse bursts of invalidations triggered by event storms. */
const INVALIDATE_THROTTLE_MS = 2_000;

export function useNotificationsRealtime(enabled = true): void {
  const lastInvalidateRef = useRef(0);

  // Same lifecycle as the messaging bridge: connected while the app is
  // foregrounded, dropped on background. `enabled` is what keeps a signed-out
  // session from holding a socket open.
  useAppState(status => {
    if (status === 'active' && enabled) {
      connectNotificationsSocket().catch(() => undefined);
    } else {
      disconnectNotificationsSocket();
    }
  });

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let bound: Socket | null = null;

    /**
     * Refresh everything a notification can appear in.
     *
     * One prefix (`notificationKeys.all`) covers the caller's list, the unread
     * count, and the venue feed — they are all keys under `notifications`, and
     * invalidating the prefix is what keeps the badge and the list it sits above
     * from disagreeing. The feed is deliberately not refetched here: it is a
     * business-wide view, and this socket is scoped to the signed-in user, so a
     * personal notification says nothing about whether a venue row changed.
     */
    const invalidatePersonal = (force = false) => {
      const now = Date.now();
      if (!force && now - lastInvalidateRef.current < INVALIDATE_THROTTLE_MS) {
        return;
      }
      lastInvalidateRef.current = now;
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    };

    const handleCreated = (payload: CreatedPayload) => {
      const notification = payload?.notification;
      if (notification?.title) {
        // The banner the OS would have shown if the app were closed. Reuses the
        // shared toast so it matches every other in-app message.
        showInfo(notification.title);
      }
      invalidatePersonal();
    };

    const handleReadAll = (payload: ReadAllPayload) => {
      // The count is authoritative from the server, so set it rather than
      // refetching a number we were just told.
      if (typeof payload?.unreadCount === 'number') {
        queryClient.setQueryData(notificationKeys.unreadCount(), payload.unreadCount);
      }
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    };

    const handleConnect = () => {
      // A reconnect missed whatever arrived while it was down.
      invalidatePersonal(true);
      syncNotificationsUnreadCount();
    };

    const bind = (socket: Socket) => {
      if (disposed) return;
      bound = socket;
      socket.on('notification_created', handleCreated);
      socket.on('notifications_read_all', handleReadAll);
      socket.on('connect', handleConnect);
    };

    connectNotificationsSocket()
      .then(socket => {
        if (!socket) return;
        bind(socket);
        // Already connected (a second mount, or a foreground that reconnected)
        // never fires `connect` for this binding, so sync here too rather than
        // leaving the count to a later reconnection.
        if (socket.connected) {
          invalidatePersonal(true);
          syncNotificationsUnreadCount();
        }
      })
      .catch(error => {
        logger.debug('push', `notifications socket unavailable: ${error}`);
      });

    return () => {
      disposed = true;
      if (bound) {
        bound.off('notification_created', handleCreated);
        bound.off('notifications_read_all', handleReadAll);
        bound.off('connect', handleConnect);
      }
      disposeNotificationsSocket();
    };
  }, [enabled]);
}
