import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ChatMessage, ConversationThread } from '@api/messagingApi';
import {
  connectMessagingSocket,
  disconnectMessagingSocket,
  disposeMessagingSocket,
  getActiveMessagingThread,
  joinMessagingThread,
  leaveMessagingThread,
  markMessagingDelivered,
  markMessagingRead,
} from '@api/messagingSocket';
import { useAppState } from '@hooks/useAppState';
import { queryClient } from '@store/queryClient';
import { useAuthStore } from '@store/authStore';
import { customerMessagingKeys } from './useCustomerMessaging';

/**
 * Realtime bridge between the `/messaging` socket and the customer's React
 * Query cache — the mirror of `useBusinessMessagingRealtime`.
 *
 * A customer is addressed directly, so unlike the staff inbox it receives
 * `newMessage` on the open thread plus a `notification` (which also carries the
 * message) for everything else. `inboxUpdate` is a staff-only room event and is
 * deliberately not subscribed here.
 *
 * The thread list is the piece that needs real care: each row exposes
 * `customerUnreadCount` and a `categories` array that the Messages filter chips
 * read, so an inbound message that leaves a stale count keeps showing under the
 * wrong chip — and under "All" with the wrong snippet. Both are patched from the
 * event rather than waiting for the next fetch.
 */
interface NotificationPayload {
  type?: string;
  threadId?: string;
  message?: ChatMessage;
}

interface MessageUpdatePayload {
  id?: string;
  threadId?: string;
  type?: string;
  content?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

/** Collapse bursts of list invalidations triggered by event storms. */
const INVALIDATE_THROTTLE_MS = 2_000;
const DELETED_MESSAGE_TEXT = 'Message deleted';

function appendMessage(
  existing: ChatMessage[] | undefined,
  message: ChatMessage,
): ChatMessage[] {
  if (!existing) return [message];
  if (existing.some(item => item.id === message.id)) return existing;
  return [...existing, message];
}

function applyMessageUpdate(
  existing: ChatMessage[] | undefined,
  update: MessageUpdatePayload | undefined,
): ChatMessage[] | undefined {
  if (!existing || !update?.id) return existing;
  return existing.map(item => {
    if (item.id !== update.id) return item;
    if (update.type === 'DELETE' || update.isDeleted) {
      return { ...item, content: DELETED_MESSAGE_TEXT };
    }
    return { ...item, content: update.content ?? item.content };
  });
}

/**
 * Recompute the row's categories. `unread` is derived from the unread count and
 * the topic ones from the subject type, exactly as the server builds them, so a
 * patched row agrees with a freshly fetched one.
 */
function categoriesFor(thread: ConversationThread, unreadCount: number): string[] {
  const categories: string[] = [];
  if (unreadCount > 0) categories.push('unread');
  if (thread.subjectType === 'DEAL' || thread.subjectType === 'CLAIM') {
    categories.push('deals');
  } else if (thread.subjectType === 'BOOKING' || thread.subjectType === 'ORDER') {
    categories.push('bookings');
  }
  return categories;
}

export function useCustomerMessagingRealtime(enabled = true): void {
  const lastInvalidateRef = useRef(0);
  const accountKey = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    accountKey.current = useAuthStore.getState().user?.uniqueCode;
  }, []);

  // Same lifecycle as the business bridge: connected while the app is
  // foregrounded, dropped on background. `enabled` is what keeps the consumer
  // and business shells from both holding the socket at once.
  useAppState(status => {
    if (status === 'active' && enabled) {
      connectMessagingSocket().catch(() => undefined);
    } else {
      disconnectMessagingSocket();
    }
  });

  useEffect(() => {
    // Disabled (signed out, or the business side is showing): tear the socket
    // down so the business bridge can own it.
    if (!enabled) {
      disposeMessagingSocket();
      return;
    }

    let disposed = false;
    let bound: Socket | null = null;

    const invalidateLists = (force = false) => {
      const now = Date.now();
      if (!force && now - lastInvalidateRef.current < INVALIDATE_THROTTLE_MS) {
        return;
      }
      lastInvalidateRef.current = now;
      // Prefix match: the screen may key the list with a branchId, and this
      // bridge must refresh it either way.
      queryClient.invalidateQueries({
        queryKey: [...customerMessagingKeys.all, accountKey.current ?? 'anonymous'],
      });
    };

    /**
     * Fold an inbound message into the thread list row: latest snippet,
     * activity time, the unread counter the badge and "Unread" chip depend on,
     * and therefore its categories. Left as an optimistic patch — the forced
     * invalidation afterwards reconciles it with the server.
     */
    const patchThreadRow = (message: ChatMessage) => {
      const { threadId } = message;
      if (!threadId) return;

      queryClient.setQueryData<ConversationThread[]>(
        customerMessagingKeys.threads(accountKey.current),
        rows => {
          if (!rows) return rows;
          const row = rows.find(candidate => candidate.id === threadId);
          if (!row) return rows;

          // A message the customer just sent is not theirs to be marked unread.
          const isInbound = message.direction === 'INBOUND';
          const unreadCount = isInbound
            ? (row.customerUnreadCount ?? 0) + 1
            : (row.customerUnreadCount ?? 0);

          const next: ConversationThread = {
            ...row,
            lastMessageContent: message.content,
            lastActivityAt: message.createdAt ?? new Date().toISOString(),
            customerUnreadCount: unreadCount,
            categories: categoriesFor(row, unreadCount),
          };
          return rows.map(candidate => (candidate.id === threadId ? next : candidate));
        },
      );
    };

    const handleMessage = (message: ChatMessage) => {
      const threadId = message.threadId ?? '';
      if (!threadId) return;

      const isOpenThread = getActiveMessagingThread() === threadId;
      patchThreadRow(message);

      if (isOpenThread) {
        // The customer is reading this thread, so show the message rather than
        // waiting for a refetch, and report it read straight away.
        queryClient.setQueryData<ChatMessage[]>(
          customerMessagingKeys.messages(accountKey.current, threadId),
          rows => appendMessage(rows, message),
        );
        if (message.direction === 'INBOUND') {
          markMessagingRead(threadId, [message.id]);
        }
      } else if (message.direction === 'INBOUND') {
        // Delivered at once for a thread the customer is not looking at.
        markMessagingDelivered(message.id, threadId);
      }

      invalidateLists();
    };

    const handleNotification = (payload: NotificationPayload) => {
      const message = payload?.message;
      if (message?.threadId) {
        patchThreadRow(message);
        invalidateLists();
        return;
      }
      // Payload without a message (a read receipt, a typing echo): nothing to
      // fold in, but the row counts may still have moved.
      invalidateLists();
    };

    const handleMessageUpdate = (payload: MessageUpdatePayload) => {
      const threadId = payload?.threadId;
      if (!threadId) return;
      queryClient.setQueryData<ChatMessage[]>(
        customerMessagingKeys.messages(accountKey.current, threadId),
        rows => applyMessageUpdate(rows, payload),
      );
      invalidateLists(true);
    };

    const handleThreadDeleted = (payload: { threadId?: string }) => {
      if (!payload?.threadId) return;
      queryClient.removeQueries({
        queryKey: customerMessagingKeys.messages(accountKey.current, payload.threadId),
      });
      invalidateLists(true);
    };

    /**
     * Re-join the open thread's room. `newMessage` is emitted to the thread
     * room, so a reconnect (or a switch of the active thread) has to re-enter
     * it or the customer stops hearing about messages they are reading.
     */
    const joinOpenThread = () => {
      const active = getActiveMessagingThread();
      if (active && bound?.connected) {
        joinMessagingThread(active);
      }
    };

    const handleConnect = () => {
      // A reconnect may have missed events while the socket was down, and the
      // rooms it belonged to need re-entering.
      invalidateLists(true);
      joinOpenThread();
    };

    const bind = (socket: Socket) => {
      if (disposed) return;
      bound = socket;
      socket.on('newMessage', handleMessage);
      socket.on('notification', handleNotification);
      socket.on('messageUpdate', handleMessageUpdate);
      socket.on('threadDeleted', handleThreadDeleted);
      socket.on('connect', handleConnect);
    };

    connectMessagingSocket()
      .then(socket => {
        if (socket) bind(socket);
        joinOpenThread();
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      const active = getActiveMessagingThread();
      if (active) leaveMessagingThread(active);
      if (bound) {
        bound.off('newMessage', handleMessage);
        bound.off('notification', handleNotification);
        bound.off('messageUpdate', handleMessageUpdate);
        bound.off('threadDeleted', handleThreadDeleted);
        bound.off('connect', handleConnect);
      }
      disposeMessagingSocket();
    };
  }, [enabled]);
}
