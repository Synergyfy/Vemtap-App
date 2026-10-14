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
import { customerMessagingKeys, threadCategoriesFor } from './useCustomerMessaging';

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

interface MessageReceiptPayload {
  threadId?: string;
  messageId?: string;
  messageIds?: string[];
  status?: string;
}

/** Receipt states in the order they may advance; anything else ranks lowest. */
const RECEIPT_RANK: Record<string, number> = { SENT: 1, DELIVERED: 2, READ: 3 };

/**
 * Advance one or more messages' receipt state in the cached transcript. The
 * bubble reads `status`, so this is what flips a single tick into the double
 * tick and then into the blue "read" mark without a refetch. Receipts only move
 * forward: DELIVERED and READ can arrive out of order on different rooms.
 */
function applyReceipt(
  existing: ChatMessage[] | undefined,
  matches: (id: string) => boolean,
  status: string,
): ChatMessage[] | undefined {
  if (!existing) return existing;
  const rank = RECEIPT_RANK[status] ?? 0;
  return existing.map(item =>
    matches(item.id) && rank > (RECEIPT_RANK[item.status ?? ''] ?? 0)
      ? { ...item, status }
      : item,
  );
}

/** The ids a receipt event covers: batched receipts carry `messageIds`. */
function receiptIds(payload: MessageReceiptPayload): Set<string> {
  const ids = new Set(payload.messageIds ?? []);
  if (payload.messageId) ids.add(payload.messageId);
  return ids;
}

/** Collapse bursts of list invalidations triggered by event storms. */
const INVALIDATE_THROTTLE_MS = 2_000;
const DELETED_MESSAGE_TEXT = 'Message deleted';
/** How many recent message ids are remembered to drop duplicate deliveries. */
const SEEN_LIMIT = 200;

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
    if (!enabled) return;

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
     * The same message reaches the customer twice — `newMessage` on the open
     * thread's room and `notification` on their user room — so each id is
     * handled once. Without this the unread count went up by two and the
     * receipt was sent twice.
     */
    const seen = new Set<string>();
    const firstSighting = (id: string) => {
      if (seen.has(id)) return false;
      seen.add(id);
      if (seen.size > SEEN_LIMIT) {
        const oldest = seen.values().next().value;
        if (oldest !== undefined) seen.delete(oldest);
      }
      return true;
    };

    /**
     * Fold an incoming message into the thread list row: latest snippet,
     * activity time, the unread counter the badge and "Unread" chip depend on,
     * and therefore its categories. Left as an optimistic patch — the forced
     * invalidation afterwards reconciles it with the server.
     */
    const patchThreadRow = (message: ChatMessage, isOpenThread: boolean) => {
      const { threadId } = message;
      if (!threadId) return;

      queryClient.setQueryData<ConversationThread[]>(
        customerMessagingKeys.threads(accountKey.current),
        rows => {
          if (!rows) return rows;
          const row = rows.find(candidate => candidate.id === threadId);
          if (!row) return rows;

          // Only the business's reply (OUTBOUND) is unread for the customer, and
          // not while they are looking at the thread it landed in.
          const isUnread = message.direction === 'OUTBOUND' && !isOpenThread;
          const unreadCount = isUnread
            ? (row.customerUnreadCount ?? 0) + 1
            : (row.customerUnreadCount ?? 0);

          const next: ConversationThread = {
            ...row,
            lastMessageContent: message.content,
            lastActivityAt: message.createdAt ?? new Date().toISOString(),
            customerUnreadCount: unreadCount,
            categories: threadCategoriesFor(row, unreadCount),
          };
          return rows.map(candidate => (candidate.id === threadId ? next : candidate));
        },
      );
    };

    const handleMessage = (message: ChatMessage) => {
      const threadId = message.threadId ?? '';
      if (!threadId || !message.id || !firstSighting(message.id)) return;

      const isOpenThread = getActiveMessagingThread() === threadId;
      patchThreadRow(message, isOpenThread);

      // The backend stamps OUTBOUND for what the business wrote: those are the
      // messages addressed to the customer and the only ones they ack. Their own
      // (INBOUND) messages are acked by the business, never by themselves.
      const isForMe = message.direction === 'OUTBOUND';

      if (isOpenThread) {
        // The customer is reading this thread, so show the message rather than
        // waiting for a refetch, and report it read straight away.
        queryClient.setQueryData<ChatMessage[]>(
          customerMessagingKeys.messages(accountKey.current, threadId),
          rows => appendMessage(rows, message),
        );
        if (isForMe) markMessagingRead(threadId, [message.id]);
      } else if (isForMe) {
        // Reached the device but not read yet: the second grey tick.
        markMessagingDelivered(message.id, threadId);
      }

      invalidateLists();
    };

    const handleNotification = (payload: NotificationPayload) => {
      const message = payload?.message;
      if (message?.threadId) {
        // For a thread the customer is not looking at this is the only copy of
        // the message they get, so it goes through the same path as
        // `newMessage` — which is what sends its delivery receipt.
        handleMessage(message);
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

    const handleMessageStatus = (payload: MessageReceiptPayload) => {
      const { threadId, status } = payload ?? {};
      const ids = receiptIds(payload ?? {});
      if (!threadId || ids.size === 0 || !status) return;
      queryClient.setQueryData<ChatMessage[]>(
        customerMessagingKeys.messages(accountKey.current, threadId),
        // A late DELIVERED must never pull an already-read message back to grey.
        old => applyReceipt(old, id => ids.has(id), status),
      );
    };

    const handleMessageRead = (payload: MessageReceiptPayload) => {
      const threadId = payload?.threadId;
      const ids = receiptIds(payload ?? {});
      if (!threadId || ids.size === 0) return;
      queryClient.setQueryData<ChatMessage[]>(
        customerMessagingKeys.messages(accountKey.current, threadId),
        old => applyReceipt(old, id => ids.has(id), payload.status ?? 'READ'),
      );
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
      // The list prefix above also matches messages, but an open conversation is
      // the one the customer is staring at, so refresh it unconditionally.
      const active = getActiveMessagingThread();
      if (active) {
        queryClient.invalidateQueries({
          queryKey: customerMessagingKeys.messages(accountKey.current, active),
        });
        // Anything that landed in it while the socket was down has now been
        // seen, and a read emitted while disconnected was dropped.
        markMessagingRead(active);
      }
    };

    const bind = (socket: Socket) => {
      if (disposed) return;
      bound = socket;
      socket.on('newMessage', handleMessage);
      socket.on('notification', handleNotification);
      socket.on('messageUpdate', handleMessageUpdate);
      socket.on('threadDeleted', handleThreadDeleted);
      socket.on('messageStatus', handleMessageStatus);
      socket.on('messageRead', handleMessageRead);
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
        bound.off('messageStatus', handleMessageStatus);
        bound.off('messageRead', handleMessageRead);
        bound.off('connect', handleConnect);
      }
      disposeMessagingSocket();
    };
  }, [enabled]);
}
