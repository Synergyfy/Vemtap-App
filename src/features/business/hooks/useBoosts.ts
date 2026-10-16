import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { boostsApi } from '@api/boostsApi';
import { adWalletApi } from '@api/adWalletApi';
import type { Promotion, PromotionForecastInput } from '@api/promotionsApi';
import { PAYMENT_RETURN_URL } from '@features/business/hooks/useSubscriptions';
import {
  campaignKeys,
  launchWithCheckout,
  sponsoredKeys,
} from '@features/business/hooks/useCampaigns';
import { boostDraftToSaveInput } from '@features/business/utils/boostMappers';
import { useBoostDraftStore, type BoostDraft } from '@store/boostDraftStore';

/** Boosts (`/boosts`) and the ad wallet that funds them. */

const boostKeys = sponsoredKeys('boost');

export function useBoostSummary() {
  return useQuery({
    queryKey: [...boostKeys, 'summary'],
    queryFn: () => boostsApi.summary(),
    staleTime: 30_000,
  });
}

/** The boost currently running, if any (newest first). */
export function useActiveBoost() {
  return useQuery({
    queryKey: [...boostKeys, 'list', 'Active'],
    queryFn: () => boostsApi.list({ status: 'Active', limit: 1 }),
    staleTime: 30_000,
    select: page => page.data[0] ?? null,
  });
}

export function useBoostEligibleAssets() {
  return useQuery({
    queryKey: [...boostKeys, 'eligible-assets'],
    queryFn: () => boostsApi.eligibleAssets(),
    staleTime: 60_000,
  });
}

/** Reach/claims estimates; one request per input (tiers, radii). */
export function useBoostForecasts(inputs: readonly PromotionForecastInput[]) {
  return useQueries({
    queries: inputs.map(input => ({
      queryKey: [...boostKeys, 'forecast', input],
      queryFn: () => boostsApi.forecast(input),
      staleTime: 5 * 60_000,
    })),
  });
}

async function persistBoost(draft: BoostDraft, branchId?: string): Promise<Promotion> {
  const input = boostDraftToSaveInput(draft, branchId);
  const saved = draft.boostId
    ? await boostsApi.update(draft.boostId, input)
    : await boostsApi.create(input);
  useBoostDraftStore.getState().update({ boostId: saved.id });
  return saved;
}

export function useSaveBoostDraft(branchId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => persistBoost(useBoostDraftStore.getState().draft, branchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boostKeys }),
  });
}

/** Save the boost draft, then launch it from the wallet (or card for the rest). */
export function useLaunchBoost(branchId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { draft } = useBoostDraftStore.getState();
      const saved = await persistBoost(draft, branchId);
      return launchWithCheckout('boost', saved.id, draft.funding);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boostKeys });
      queryClient.invalidateQueries({ queryKey: campaignKeys.wallet });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Ad wallet                                                                  */
/* -------------------------------------------------------------------------- */

export function useAdWalletTransactions(limit: number) {
  return useQuery({
    queryKey: [...campaignKeys.wallet, 'transactions', limit],
    queryFn: () => adWalletApi.listTransactions({ limit }),
    staleTime: 30_000,
    placeholderData: previous => previous,
  });
}

export function useAdWalletPrepacks() {
  return useQuery({
    queryKey: [...campaignKeys.wallet, 'prepacks'],
    queryFn: () => adWalletApi.listPrepacks(),
    staleTime: 10 * 60_000,
  });
}

export type TopUpOutcome = 'completed' | 'pending' | 'cancelled';

/**
 * Top up by card: open Paystack, then ask the API whether it paid (the
 * webhook credits it too, so `pending` may still land).
 */
export function useWalletTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { prepackId?: string; amount?: number }) => {
      const topUp = await adWalletApi.topUpWallet({
        ...input,
        callbackUrl: PAYMENT_RETURN_URL,
      });
      if (!topUp.authorizationUrl) {
        throw new Error('Could not open the payment page. Please try again.');
      }
      const result = await WebBrowser.openAuthSessionAsync(
        topUp.authorizationUrl,
        PAYMENT_RETURN_URL,
      );
      const confirmation = await adWalletApi
        .confirmTopUp(topUp.reference)
        .catch(() => null);
      const outcome: TopUpOutcome =
        confirmation?.status === 'completed'
          ? 'completed'
          : result.type === 'success'
            ? 'pending'
            : 'cancelled';
      return { outcome, reference: topUp.reference };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: campaignKeys.wallet }),
  });
}
