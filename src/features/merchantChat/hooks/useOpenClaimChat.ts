import { useCallback } from 'react';
import { useStartCustomerConversation } from '@features/merchantChat/hooks/useCustomerMessaging';
import { strings } from '@constants/strings';
import type { MyClaim } from '@api/claimApi';

/** The params both conversation routes accept for a claim-linked chat. */
export type ClaimConversationParams = { threadId?: string; claimId: string };

/**
 * Opens (or reuses) the customer's conversation with the merchant behind a
 * claimed deal, tagged with the claim so the chat can render its deal card.
 *
 * The backend is find-or-create per (customer, branch), so this is safe to call
 * every time the pass opens a chat: an existing thread is returned with its
 * subject context refreshed rather than duplicated. `subjectType: 'CLAIM'` is
 * what the Messages filter chips read to file the thread under "deals".
 *
 * Kept out of the two navigators because both need it and the payloads are
 * identical — only the destination route name differs.
 */
export function useOpenClaimChat(
  claim: MyClaim | undefined,
  onOpened: (params: ClaimConversationParams) => void,
): () => void {
  const startConversation = useStartCustomerConversation();

  return useCallback(() => {
    // A claim without a branch cannot address the conversation endpoint, and a
    // pass with no branch is not one the merchant can answer on anyway.
    const branchId = claim?.offer.branchId;
    if (!claim || !branchId) return;

    startConversation.mutate(
      {
        branchId,
        content: strings.myClaimedDeal.contact.openerFor(claim.offer.name),
        subjectType: 'CLAIM',
        claimId: claim.id,
      },
      {
        onSuccess: message =>
          onOpened({
            threadId: message.threadId ?? undefined,
            claimId: claim.id,
          }),
      },
    );
  }, [claim, onOpened, startConversation]);
}
