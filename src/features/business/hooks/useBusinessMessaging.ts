import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  messagingApi,
  type ChatMessage,
  type ConversationThread,
  type ReplyMessagePayload,
} from '@api/messagingApi';
import { isMessagingSocketConnected } from '@api/messagingSocket';

export const businessMessagingKeys = {
  all: ['businessMessaging'] as const,
  threads: (branchId: string, channel: string) =>
    [...businessMessagingKeys.all, 'threads', branchId, channel] as const,
  messages: (threadId: string, branchId: string) =>
    [...businessMessagingKeys.all, 'messages', threadId, branchId] as const,
};

/**
 * Realtime socket first: polling only kicks in while the socket is down, so a
 * broken connection degrades to the old refresh cadence instead of stale data.
 */
function socketFallbackInterval(ms: number) {
  return () => (isMessagingSocketConnected() ? false : ms);
}

export function useBusinessThreads(branchId?: string | null, channel = 'IN_HOUSE') {
  return useQuery<ConversationThread[]>({
    queryKey: businessMessagingKeys.threads(branchId ?? '', channel),
    queryFn: () => messagingApi.getBusinessInboxThreads(branchId!, channel),
    enabled: Boolean(branchId),
    staleTime: 30_000,
    refetchInterval: socketFallbackInterval(30_000),
  });
}

export function useBusinessThreadMessages(
  threadId?: string | null,
  branchId?: string | null,
) {
  return useQuery<ChatMessage[]>({
    queryKey: businessMessagingKeys.messages(threadId ?? '', branchId ?? ''),
    queryFn: () => messagingApi.getBusinessThreadMessages(threadId!, branchId!),
    enabled: Boolean(threadId && branchId),
    staleTime: 10_000,
    refetchInterval: socketFallbackInterval(15_000),
  });
}

export function useSendBusinessReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      threadId,
      branchId,
      payload,
    }: {
      threadId: string;
      branchId: string;
      payload: ReplyMessagePayload;
    }) => messagingApi.replyBusinessThread(threadId, branchId, payload),
    onSuccess: (newMessage, variables) => {
      if (newMessage) {
        queryClient.setQueryData<ChatMessage[]>(
          businessMessagingKeys.messages(variables.threadId, variables.branchId),
          old => (old ? [...old, newMessage] : [newMessage]),
        );
      }
      queryClient.invalidateQueries({ queryKey: businessMessagingKeys.all });
    },
  });
}

export function useMarkBusinessThreadRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, branchId }: { threadId: string; branchId: string }) =>
      messagingApi.markBusinessThreadRead(threadId, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessMessagingKeys.all });
    },
  });
}
