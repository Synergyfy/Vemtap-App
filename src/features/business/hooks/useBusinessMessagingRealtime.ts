/**
 * Realtime bridge between the `/messaging` socket and the React Query cache.
 *
 * Mounted exactly once (business tab navigator). The socket stays connected
 * while the app is foregrounded and is dropped on background; on reconnect the
 * affected queries are refreshed to catch anything missed while offline.
 */

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ChatMessage } from '@api/messagingApi';
import {
  connectMessagingSocket,
  disconnectMessagingSocket,
  disposeMessagingSocket,
  getActiveMessagingThread,
  joinMessagingThread,
  markMessagingDelivered,
  markMessagingRead,
} from '@api/messagingSocket';
import { queryClient } from '@store/queryClient';
import { useAppState } from '@hooks/useAppState';
import { businessMessagingKeys } from './useBusinessMessaging';
import { businessDashboardKeys } from './useBusinessDashboardData';

interface MessageUpdatePayload {
  id?: string;
  type?: string;
  content?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  threadId?: string;
}

interface InboxUpdatePayload {
  type?: string;
  threadId?: string;
  message?: ChatMessage;
  update?: MessageUpdatePayload;
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

export function useBusinessMessagingRealtime(branchId?: string | null): void {
  const lastInvalidateRef = useRef(0);

  useAppState(status => {
    if (status === 'active') {
      connectMessagingSocket().catch(() => undefined);
    } else {
      disconnectMessagingSocket();
    }
  });

  useEffect(() => {
    if (!branchId) return;
    let disposed = false;
    let bound: Socket | null = null;

    const invalidateLists = (force = false) => {
      const now = Date.now();
      if (!force && now - lastInvalidateRef.current < INVALIDATE_THROTTLE_MS) {
        return;
      }
      lastInvalidateRef.current = now;
      queryClient.invalidateQueries({
        queryKey: [...businessMessagingKeys.all, 'threads', branchId],
      });
      queryClient.invalidateQueries({
        queryKey: businessDashboardKeys.dashboard(branchId),
      });
      queryClient.invalidateQueries({
        queryKey: businessDashboardKeys.unreadCount(),
      });
    };

    /**
     * One customer message reaches staff up to three times — `newMessage` on the
     * open thread's room, plus `inboxUpdate` and `notification` on the branch
     * room — so each id is acked once.
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

    const handleNewMessage = (message: ChatMessage) => {
      const threadId = message.threadId ?? '';
      if (!threadId || !message.id) return;
      queryClient.setQueryData<ChatMessage[]>(
        businessMessagingKeys.messages(threadId, branchId),
        old => appendMessage(old, message),
      );
      // INBOUND is what the customer wrote: the only messages staff ack. A read
      // implies delivery, so an open thread skips straight to READ.
      if (message.direction === 'INBOUND' && firstSighting(message.id)) {
        if (getActiveMessagingThread() === threadId) {
          markMessagingRead(threadId, [message.id]);
        } else {
          markMessagingDelivered(message.id, threadId);
        }
      }
      invalidateLists();
    };

    const handleInboxUpdate = (payload: InboxUpdatePayload) => {
      if (payload?.message) {
        handleNewMessage(payload.message);
        return;
      }
      if (payload?.type === 'thread_deleted' && payload.threadId) {
        queryClient.removeQueries({
          queryKey: [...businessMessagingKeys.all, 'messages', payload.threadId],
        });
        invalidateLists(true);
        return;
      }
      if (payload?.type === 'message_update' && payload.threadId) {
        queryClient.setQueryData<ChatMessage[]>(
          businessMessagingKeys.messages(payload.threadId, branchId),
          old => applyMessageUpdate(old, payload.update),
        );
      }
      invalidateLists();
    };

    const handleMessageUpdate = (payload: MessageUpdatePayload) => {
      const threadId = payload?.threadId;
      if (!threadId) return;
      queryClient.setQueryData<ChatMessage[]>(
        businessMessagingKeys.messages(threadId, branchId),
        old => applyMessageUpdate(old, payload),
      );
      invalidateLists(true);
    };

    const handleThreadDeleted = (payload: { threadId?: string }) => {
      if (!payload?.threadId) return;
      queryClient.removeQueries({
        queryKey: [...businessMessagingKeys.all, 'messages', payload.threadId],
      });
      invalidateLists(true);
    };

    const handleMessageStatus = (payload: MessageReceiptPayload) => {
      const { threadId, status } = payload ?? {};
      const ids = receiptIds(payload ?? {});
      if (!threadId || ids.size === 0 || !status) return;
      queryClient.setQueryData<ChatMessage[]>(
        businessMessagingKeys.messages(threadId, branchId),
        old => applyReceipt(old, id => ids.has(id), status),
      );
    };

    const handleMessageRead = (payload: MessageReceiptPayload) => {
      const threadId = payload?.threadId;
      const ids = receiptIds(payload ?? {});
      if (!threadId || ids.size === 0) return;
      queryClient.setQueryData<ChatMessage[]>(
        businessMessagingKeys.messages(threadId, branchId),
        old => applyReceipt(old, id => ids.has(id), payload.status ?? 'READ'),
      );
    };

    const handleConnect = () => {
      invalidateLists(true);
      // `newMessage` and receipts for the open chat go to its thread room, which
      // a reconnect has left; a read emitted while disconnected was dropped too.
      const active = getActiveMessagingThread();
      if (active) {
        joinMessagingThread(active);
        markMessagingRead(active);
        queryClient.invalidateQueries({
          queryKey: businessMessagingKeys.messages(active, branchId),
        });
      }
    };

    const bind = (socket: Socket) => {
      if (disposed) return;
      bound = socket;
      socket.on('newMessage', handleNewMessage);
      socket.on('inboxUpdate', handleInboxUpdate);
      socket.on('notification', handleInboxUpdate);
      socket.on('messageUpdate', handleMessageUpdate);
      socket.on('threadDeleted', handleThreadDeleted);
      socket.on('messageStatus', handleMessageStatus);
      socket.on('messageRead', handleMessageRead);
      socket.on('connect', handleConnect);
    };

    connectMessagingSocket()
      .then(socket => {
        if (socket) bind(socket);
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      if (bound) {
        bound.off('newMessage', handleNewMessage);
        bound.off('inboxUpdate', handleInboxUpdate);
        bound.off('notification', handleInboxUpdate);
        bound.off('messageUpdate', handleMessageUpdate);
        bound.off('threadDeleted', handleThreadDeleted);
        bound.off('messageStatus', handleMessageStatus);
        bound.off('messageRead', handleMessageRead);
        bound.off('connect', handleConnect);
      }
      disposeMessagingSocket();
    };
    // Handlers close over `branchId` and the stable refs above only.
  }, [branchId]);
}
