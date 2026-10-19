import { useCallback, useState } from 'react';
import { messagingApi } from '@api/messagingApi';
import { useAuthStore } from '@store/authStore';
import { queryClient } from '@store/queryClient';
import { customerMessagingKeys } from '@features/merchantChat/hooks/useCustomerMessaging';

/** The business a customer wants to message, as its profile knows it. */
export interface BusinessChatTarget {
  branchId: string;
  businessName: string;
}

/** Conversation route params: an existing thread, or a new chat with a branch. */
export type BusinessChatParams =
  { threadId: string } | { branchId: string; businessName: string };

/**
 * Opens the customer's chat with a business. When they have talked to this
 * branch before, the existing thread opens. Otherwise an empty chat opens with
 * the business, and the customer's first message starts the thread. Nothing is
 * sent on their behalf.
 */
export function useOpenBusinessChat(onOpened: (params: BusinessChatParams) => void) {
  const accountKey = useAuthStore(state => state.user?.uniqueCode);
  const [opening, setOpening] = useState(false);

  const open = useCallback(
    async (target: BusinessChatTarget) => {
      if (opening) return;
      setOpening(true);
      try {
        const threads = await queryClient.fetchQuery({
          queryKey: customerMessagingKeys.threads(accountKey, target.branchId),
          queryFn: () => messagingApi.getCustomerThreads({ branchId: target.branchId }),
          staleTime: 30_000,
        });
        const existing = threads.find(thread => thread.branchId === target.branchId);
        onOpened(existing ? { threadId: existing.id } : target);
      } catch {
        // The thread list could not load: a new chat still works, and the server
        // reuses an existing thread when the first message is sent.
        onOpened(target);
      } finally {
        setOpening(false);
      }
    },
    [accountKey, onOpened, opening],
  );

  return { open, opening };
}
