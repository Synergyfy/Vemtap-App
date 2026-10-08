import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  messagingApi,
  type ChatMessage,
  type ConversationThread,
  type ReplyMessagePayload,
  type StartConversationPayload,
} from '@api/messagingApi';

export const customerMessagingKeys = {
  all: ['customerMessaging'] as const,
  threads: (branchId?: string) =>
    [...customerMessagingKeys.all, 'threads', branchId ?? 'all'] as const,
  messages: (threadId: string) =>
    [...customerMessagingKeys.all, 'messages', threadId] as const,
};

export function useCustomerThreads(branchId?: string) {
  return useQuery<ConversationThread[]>({
    queryKey: customerMessagingKeys.threads(branchId),
    queryFn: () => messagingApi.getCustomerThreads(branchId ? { branchId } : undefined),
    staleTime: 30_000,
  });
}

export function useCustomerThreadMessages(threadId?: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: customerMessagingKeys.messages(threadId ?? ''),
    queryFn: () => messagingApi.getCustomerThreadMessages(threadId!),
    enabled: Boolean(threadId),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useSendCustomerReply() {
  const queryClient = useQueryClient();
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
        customerMessagingKeys.messages(variables.threadId),
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
