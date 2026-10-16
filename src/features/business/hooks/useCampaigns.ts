import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  promotionsApi,
  type Promotion,
  type PromotionForecastInput,
} from '@api/promotionsApi';
import { adWalletApi } from '@api/adWalletApi';
import { PAYMENT_RETURN_URL } from '@features/business/hooks/useSubscriptions';
import {
  WEEKDAY_NUMBER,
  draftToSaveInput,
} from '@features/business/utils/campaignMappers';
import { useCampaignDraftStore, type CampaignDraft } from '@store/campaignDraftStore';

/** Promotion campaigns (`/promotions`) for the Campaigns hub and wizard. */

export const campaignKeys = {
  all: ['promotions'] as const,
  list: ['promotions', 'list'] as const,
  summary: ['promotions', 'summary'] as const,
  detail: (id: string) => ['promotions', 'detail', id] as const,
  assets: ['promotions', 'eligible-assets'] as const,
  forecast: (input: PromotionForecastInput) => ['promotions', 'forecast', input] as const,
  wallet: ['ad-wallet'] as const,
};

/** Every campaign of the business, newest first (the hub filters locally). */
export function usePromotions() {
  return useQuery({
    queryKey: campaignKeys.list,
    queryFn: () => promotionsApi.listPromotions({ limit: 50 }),
    staleTime: 30_000,
  });
}

export function usePromotionSummary() {
  return useQuery({
    queryKey: campaignKeys.summary,
    queryFn: () => promotionsApi.getPromotionSummary(),
    staleTime: 30_000,
  });
}

export function useEligibleAssets() {
  return useQuery({
    queryKey: campaignKeys.assets,
    queryFn: () => promotionsApi.listEligibleAssets(),
    staleTime: 60_000,
  });
}

/** One forecast per input (the budget step estimates every tier at once). */
export function usePromotionForecasts(inputs: readonly PromotionForecastInput[]) {
  return useQueries({
    queries: inputs.map(input => ({
      queryKey: campaignKeys.forecast(input),
      queryFn: () => promotionsApi.forecastPromotion(input),
      staleTime: 5 * 60_000,
    })),
  });
}

export function useAdWallet() {
  return useQuery({
    queryKey: campaignKeys.wallet,
    queryFn: () => adWalletApi.getWallet(),
    staleTime: 30_000,
  });
}

/**
 * Create the draft on first save, patch it after; the id is kept in the
 * draft store so every step updates the same campaign.
 */
async function persistDraft(draft: CampaignDraft): Promise<Promotion> {
  const input = draftToSaveInput(draft);
  const saved = draft.promotionId
    ? await promotionsApi.updatePromotion(draft.promotionId, input)
    : await promotionsApi.createPromotion(input);
  useCampaignDraftStore.getState().update({ promotionId: saved.id });
  return saved;
}

export function useSaveCampaignDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => persistDraft(useCampaignDraftStore.getState().draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}

export type CampaignLaunchOutcome =
  'live' | 'scheduled' | 'awaiting-payment' | 'cancelled';

/**
 * Save the draft, then launch it. The budget is reserved from the ad wallet;
 * with card funding a shortfall opens Paystack, and the paid top-up launches
 * the campaign server-side (so a closed browser is not proof of failure).
 */
export function useLaunchCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<{
      promotion: Promotion;
      outcome: CampaignLaunchOutcome;
    }> => {
      const { draft } = useCampaignDraftStore.getState();
      const saved = await persistDraft(draft);
      const launched = await promotionsApi.launchPromotion(saved.id, {
        fundingSource: draft.funding,
        callbackUrl: PAYMENT_RETURN_URL,
      });

      const url = launched.checkout?.authorizationUrl;
      if (!url) {
        return {
          promotion: launched,
          outcome: launched.status === 'Active' ? 'live' : 'scheduled',
        };
      }

      const result = await WebBrowser.openAuthSessionAsync(url, PAYMENT_RETURN_URL);
      const after = await promotionsApi.getPromotion(saved.id);
      const outcome: CampaignLaunchOutcome =
        after.status === 'Active'
          ? 'live'
          : after.awaitingPayment
            ? result.type === 'success'
              ? 'awaiting-payment'
              : 'cancelled'
            : 'scheduled';
      return { promotion: after, outcome };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.invalidateQueries({ queryKey: campaignKeys.wallet });
    },
  });
}

/** Pause a live campaign or resume a paused one. */
export function useTogglePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pause }: { id: string; pause: boolean }) =>
      pause ? promotionsApi.pausePromotion(id) : promotionsApi.resumePromotion(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}

/** Load a saved draft back into the wizard ("Continue Setup"). */
export async function loadDraftIntoWizard(promotionId: string): Promise<void> {
  const promotion = await promotionsApi.getPromotion(promotionId);
  const store = useCampaignDraftStore.getState();
  store.start();
  const audience = promotion.audience ?? {};
  const { schedule } = promotion;
  const dayIds = Object.entries(WEEKDAY_NUMBER);
  store.update({
    promotionId: promotion.id,
    objectiveId: promotion.objective ?? undefined,
    // Titles are refilled from the eligible assets on the content step.
    assets: promotion.assets.map(asset => ({ ...asset, title: '' })),
    strategy: audience.strategy === 'segments' ? 'segments' : 'nearby',
    cohorts: audience.cohorts ?? [],
    segmentIds: audience.segmentIds ?? [],
    branchIds: audience.branchIds ?? [],
    radiusKm: audience.radiusKm ?? 3,
    ...(schedule
      ? {
          durationDays: schedule.durationDays,
          instantLaunch: schedule.instantLaunch ?? true,
          dayparting: schedule.dayparting ?? false,
          windows: schedule.windows ?? [],
          weekdays: (schedule.weekdays ?? [])
            .map(day => dayIds.find(([, number]) => number === day)?.[0])
            .filter((day): day is string => Boolean(day)),
          autoRenew: schedule.autoRenew ?? false,
        }
      : {}),
    budgetMode: promotion.budgetMode ?? 'total',
    ...(promotion.budget > 0 ? { total: promotion.budget } : {}),
  });
}
