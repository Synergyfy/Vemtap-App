import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { creditPlansApi, type CreditPlan } from '@api/creditPlansApi';
import { PAYMENT_RETURN_URL } from '@features/business/hooks/useSubscriptions';

export const creditPlanKeys = { all: ['credit-plans'] as const };

export type CreditChannel = 'sms' | 'ai';

/** Bundles that carry credits for this channel, cheapest first. */
export function plansFor(plans: CreditPlan[] | undefined, channel: CreditChannel) {
  return (plans ?? [])
    .filter(plan => (channel === 'sms' ? plan.smsAmount : plan.aiAmount) > 0)
    .sort((a, b) => a.price - b.price);
}

export function useCreditPlans(enabled = true) {
  return useQuery<CreditPlan[]>({
    queryKey: creditPlanKeys.all,
    queryFn: () => creditPlansApi.list(),
    enabled,
    staleTime: 10 * 60_000,
  });
}

export type CreditPurchaseOutcome = 'completed' | 'pending' | 'cancelled';

/** Pay for a bundle by card, then ask the API whether it landed. */
export function useBuyCreditPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string): Promise<CreditPurchaseOutcome> => {
      const checkout = await creditPlansApi.startCheckout(planId, PAYMENT_RETURN_URL);
      if (!checkout.authorizationUrl) {
        throw new Error('Could not open the payment page. Please try again.');
      }
      const result = await WebBrowser.openAuthSessionAsync(
        checkout.authorizationUrl,
        PAYMENT_RETURN_URL,
      );
      const confirmation = await creditPlansApi
        .confirmCheckout(checkout.reference)
        .catch(() => null);
      return confirmation?.status === 'completed'
        ? 'completed'
        : result.type === 'success'
          ? 'pending'
          : 'cancelled';
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['credits'] }),
  });
}
