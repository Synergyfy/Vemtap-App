import { useQuery, useMutation } from '@tanstack/react-query';
import {
  messagingApi,
  type ChatMessage,
  type ConversationThread,
  type ReplyMessagePayload,
  type StartConversationPayload,
} from '@api/messagingApi';
import { useAuthStore } from '@store/authStore';
import { queryClient } from '@store/queryClient';

/**
 * Scoped by account. A shared key lets one account's threads serve another's
 * from cache after a sign-out/sign-in — the saved hub already had this fixed.
 */
export const customerMessagingKeys = {
  all: ['customerMessaging'] as const,
  threads: (accountKey?: string | null, branchId?: string) =>
    [
      ...customerMessagingKeys.all,
      accountKey ?? 'anonymous',
      'threads',
      branchId ?? 'all',
    ] as const,
  messages: (accountKey: string | null | undefined, threadId: string) =>
    [
      ...customerMessagingKeys.all,
      accountKey ?? 'anonymous',
      'messages',
      threadId,
    ] as const,
};

/**
 * Recompute a thread row's filter categories. `unread` is derived from the
 * unread count and the topic ones from the subject type, exactly as the server
 * builds them, so a locally patched row agrees with a freshly fetched one.
 *
 * Shared with the realtime bridge so a row patched on arrival and a row patched
 * on being read can never disagree about which chip the thread belongs under.
 */
export function threadCategoriesFor(
  thread: ConversationThread,
  unreadCount: number,
): string[] {
  const categories: string[] = [];
  if (unreadCount > 0) categories.push('unread');
  if (thread.subjectType === 'DEAL' || thread.subjectType === 'CLAIM') {
    categories.push('deals');
  } else if (thread.subjectType === 'BOOKING' || thread.subjectType === 'ORDER') {
    categories.push('bookings');
  }
  return categories;
}

/**
 * Clear a thread's unread state in the cache the messages hub reads.
 *
 * Opening a conversation has to drop the badge immediately, and it cannot wait
 * on the server: the customer side has no mark-read endpoint (`markMessagingRead`
 * only emits a socket event, and the bridge is not guaranteed to be listening),
 * so without this patch the badge and the `unread` chip entry both survive the
 * round trip — the count stays put and the Unread filter keeps listing a thread
 * the user has just read.
 */
export function markCustomerThreadReadLocally(threadId: string): void {
  const accountKey = useAuthStore.getState().user?.uniqueCode;
  queryClient.setQueryData<ConversationThread[]>(
    customerMessagingKeys.threads(accountKey),
    rows => {
      if (!rows) return rows;
      return rows.map(row => {
        if (row.id !== threadId) return row;
        const unread = row.customerUnreadCount ?? 0;
        if (unread === 0) return row;
        return {
          ...row,
          customerUnreadCount: 0,
          categories: threadCategoriesFor(row, 0),
        };
      });
    },
  );
}

export function useCustomerThreads(branchId?: string) {
  const accountKey = useAuthStore(state => state.user?.uniqueCode);
  return useQuery<ConversationThread[]>({
    queryKey: customerMessagingKeys.threads(accountKey, branchId),
    queryFn: () => messagingApi.getCustomerThreads(branchId ? { branchId } : undefined),
    staleTime: 30_000,
  });
}

export function useCustomerThreadMessages(threadId?: string | null) {
  const accountKey = useAuthStore(state => state.user?.uniqueCode);
  return useQuery<ChatMessage[]>({
    queryKey: customerMessagingKeys.messages(accountKey, threadId ?? ''),
    queryFn: () => messagingApi.getCustomerThreadMessages(threadId!),
    enabled: Boolean(threadId),
    staleTime: 10_000,
    // No polling interval: `useCustomerMessagingRealtime` pushes new messages
    // and edits, and refreshes this query on reconnect. A `refetchInterval` here
    // would re-fetch every open conversation every 15s for nothing.
  });
}

function appendMessageDedupe(
  existing: ChatMessage[] | undefined,
  message: ChatMessage,
): ChatMessage[] {
  if (!existing) return [message];
  if (existing.some(item => item.id === message.id)) return existing;
  return [...existing, message];
}

export function useSendCustomerReply() {
  const accountKey = useAuthStore(state => state.user?.uniqueCode);
  return useMutation({
    mutationFn: ({
      threadId,
      payload,
    }: {
      threadId: string;
      payload: ReplyMessagePayload;
    }) => messagingApi.replyCustomerThread(threadId, payload),
    onSuccess: (newMessage, variables) => {
      queryClient.setQueryData<ChatMessage[]>(
        customerMessagingKeys.messages(accountKey, variables.threadId),
        old => appendMessageDedupe(old, newMessage),
      );
      queryClient.invalidateQueries({ queryKey: customerMessagingKeys.all });
    },
  });
}

export function useStartCustomerConversation() {
  return useMutation({
    mutationFn: (payload: StartConversationPayload) =>
      messagingApi.startCustomerConversation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerMessagingKeys.all });
    },
  });
}
