import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  messagingApi,
  type ChatMessage,
  type ConversationThread,
  type ReplyMessagePayload,
  type StartConversationPayload,
} from '@api/messagingApi';
import { useAuthStore } from '@store/authStore';

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
    refetchInterval: 15_000,
  });
}

export function useSendCustomerReply() {
  const queryClient = useQueryClient();
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
        old => (old ? [...old, newMessage] : [newMessage]),
      );
      queryClient.invalidateQueries({ queryKey: customerMessagingKeys.all });
    },
  });
}

export function useStartCustomerConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartConversationPayload) =>
      messagingApi.startCustomerConversation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerMessagingKeys.all });
    },
  });
}
