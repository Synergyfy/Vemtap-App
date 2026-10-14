import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  purchasablePlans,
  subscriptionsApi,
  type ActiveSubscription,
  type BillingPeriod,
  type Plan,
} from '@api/subscriptionsApi';
import { businessDashboardKeys } from '@features/business/hooks/useBusinessDashboardData';

/** Where Paystack sends the customer after paying. */
export const PAYMENT_RETURN_URL = 'vemtap://payments/return';
/** How long to wait for the webhook to activate a paid plan. */
const ACTIVATION_TIMEOUT_MS = 30_000;
const ACTIVATION_POLL_MS = 2_500;
/** When Paystack reports no payment, how long to look for an activation anyway. */
const CANCEL_CHECK_MS = 5_000;

export const subscriptionKeys = {
  plans: () => ['subscriptions', 'plans'] as const,
  active: () => ['subscriptions', 'active'] as const,
  billing: (page: number) => ['subscriptions', 'billing', page] as const,
  paymentMethod: () => ['subscriptions', 'payment-method'] as const,
  addons: () => ['subscriptions', 'addons'] as const,
  myAddons: () => ['subscriptions', 'my-addons'] as const,
  preview: (planId: string, period: BillingPeriod) =>
    ['subscriptions', 'preview', planId, period] as const,
};

/** Plans the business can trial or buy, cheapest first. */
export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: subscriptionKeys.plans(),
    queryFn: async () =>
      purchasablePlans(await subscriptionsApi.plans()).sort(
        (a, b) => a.monthlyPrice - b.monthlyPrice,
      ),
    staleTime: 10 * 60_000,
  });
}

export function useActiveSubscription() {
  return useQuery<ActiveSubscription>({
    queryKey: subscriptionKeys.active(),
    queryFn: () => subscriptionsApi.active(),
    staleTime: 60_000,
  });
}

function useRefreshSubscription() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.active() }),
      queryClient.invalidateQueries({ queryKey: businessDashboardKeys.subscription() }),
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'billing'] }),
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethod() }),
    ]);
}

/** Start the business's one free trial. No card, never charged. */
export function useStartTrial() {
  const refresh = useRefreshSubscription();
  return useMutation({
    mutationFn: ({
      planId,
      billingPeriod = 'monthly',
    }: {
      planId: string;
      billingPeriod?: BillingPeriod;
    }) => subscriptionsApi.startTrial(planId, billingPeriod),
    onSuccess: () => refresh(),
  });
}

export type CheckoutOutcome = 'active' | 'pending' | 'cancelled';

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

/** Polls the active subscription until `planId` is active or the deadline passes. */
async function waitForActivation(planId: string, deadline: number): Promise<boolean> {
  const active = await subscriptionsApi.active();
  if (active?.planId === planId && active.status === 'active') return true;
  if (Date.now() >= deadline) return false;
  await sleep(ACTIVATION_POLL_MS);
  return waitForActivation(planId, deadline);
}

/**
 * Pay for a plan: open Paystack, then wait for the webhook to switch the
 * subscription. `pending` means the payment may still land — the webhook
 * activates it even if the app is closed.
 */
export function useCheckout() {
  const refresh = useRefreshSubscription();
  return useMutation({
    mutationFn: async (input: {
      planId: string;
      billingPeriod: BillingPeriod;
      promoCode?: string;
    }): Promise<{ outcome: CheckoutOutcome; reference: string }> => {
      const checkout = await subscriptionsApi.initializePayment({
        ...input,
        callbackUrl: PAYMENT_RETURN_URL,
      });
      if (!checkout.authorization_url) {
        throw new Error('Could not open the payment page. Please try again.');
      }
      const result = await WebBrowser.openAuthSessionAsync(
        checkout.authorization_url,
        PAYMENT_RETURN_URL,
      );
      // Paystack may not follow the app link back, so a closed page is not
      // proof of cancelling: ask Paystack (through the API) whether it paid.
      const paidFlow =
        result.type === 'success' ||
        (await subscriptionsApi
          .verifyPayment(checkout.reference)
          .then(verification => verification.success)
          .catch(() => false));
      const activated = await waitForActivation(
        input.planId,
        Date.now() + (paidFlow ? ACTIVATION_TIMEOUT_MS : CANCEL_CHECK_MS),
      );
      const outcome: CheckoutOutcome = activated
        ? 'active'
        : paidFlow
          ? 'pending'
          : 'cancelled';
      return { outcome, reference: checkout.reference };
    },
    onSettled: () => refresh(),
  });
}

/** Server-side subtotal, tax and total for a plan and billing period. */
export function usePricePreview(
  planId: string | null | undefined,
  billingPeriod: BillingPeriod,
) {
  return useQuery({
    queryKey: subscriptionKeys.preview(planId ?? '', billingPeriod),
    queryFn: () =>
      subscriptionsApi.pricePreview({ planId: planId as string, billingPeriod }),
    enabled: Boolean(planId),
    staleTime: 5 * 60_000,
  });
}

export function useBillingHistory(page = 1) {
  return useQuery({
    queryKey: subscriptionKeys.billing(page),
    queryFn: () => subscriptionsApi.billingHistory(page),
  });
}

export function usePaymentMethod() {
  return useQuery({
    queryKey: subscriptionKeys.paymentMethod(),
    queryFn: () => subscriptionsApi.paymentMethod(),
  });
}

export function useAddons() {
  return useQuery({
    queryKey: subscriptionKeys.addons(),
    queryFn: () => subscriptionsApi.addons(),
    staleTime: 10 * 60_000,
  });
}

export function useMyAddons() {
  return useQuery({
    queryKey: subscriptionKeys.myAddons(),
    queryFn: () => subscriptionsApi.myAddons(),
  });
}

/** Cancel the paid subscription; the business returns to the free plan. */
export function useCancelSubscription() {
  const refresh = useRefreshSubscription();
  return useMutation({
    mutationFn: () => subscriptionsApi.cancel(),
    onSuccess: () => refresh(),
  });
}

/** Which trial screen the business should see, from its subscription. */
export type TrialStage = 'eligible' | 'active' | 'ending' | 'expired' | 'paid' | 'none';

export function trialStageOf(subscription: ActiveSubscription | undefined): TrialStage {
  if (!subscription) return 'none';
  if (subscription.isTrial) {
    return (subscription.daysRemaining ?? 0) <= 3 ? 'ending' : 'active';
  }
  if (subscription.plan?.isFree) {
    if (subscription.trialEligible) return 'eligible';
    return subscription.trialUsedAt ? 'expired' : 'none';
  }
  return 'paid';
}
