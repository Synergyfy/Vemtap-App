import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  promotionsApi,
  type Promotion,
  type PromotionForecastInput,
} from '@api/promotionsApi';
import { adWalletApi } from '@api/adWalletApi';
import { boostsApi } from '@api/boostsApi';
import { PAYMENT_RETURN_URL } from '@features/business/hooks/useSubscriptions';
import {
  WEEKDAY_NUMBER,
  draftToSaveInput,
  promotionsToLedgerRows,
} from '@features/business/utils/campaignMappers';
import { strings } from '@constants/strings';
import { datedFileName, shareCsv, toCsv } from '@utils/csvExport';
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
    queryFn: () => promotionsApi.list({ limit: 50 }),
    staleTime: 30_000,
  });
}

export function usePromotionSummary() {
  return useQuery({
    queryKey: campaignKeys.summary,
    queryFn: () => promotionsApi.summary(),
    staleTime: 30_000,
  });
}

export function useEligibleAssets() {
  return useQuery({
    queryKey: campaignKeys.assets,
    queryFn: () => promotionsApi.eligibleAssets(),
    staleTime: 60_000,
  });
}

/** One forecast per input (the budget step estimates every tier at once). */
export function usePromotionForecasts(inputs: readonly PromotionForecastInput[]) {
  return useQueries({
    queries: inputs.map(input => ({
      queryKey: campaignKeys.forecast(input),
      queryFn: () => promotionsApi.forecast(input),
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
    ? await promotionsApi.update(draft.promotionId, input)
    : await promotionsApi.create(input);
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
/**
 * Launch a saved boost or campaign. The budget is reserved from the ad wallet;
 * with card funding a shortfall opens Paystack. Confirming the top-up credits
 * the wallet, which launches the campaign server-side, so the app does not
 * have to wait for the webhook (a closed browser is still not proof of failure).
 */
export async function launchWithCheckout(
  kind: SponsoredKind,
  id: string,
  funding: 'wallet' | 'card',
  /**
   * Card funding: `useSavedCard` charges the saved card for the shortfall (no
   * browser); `saveCard` keeps the checkout's card.
   */
  card: { useSavedCard?: boolean; saveCard?: boolean } = {},
): Promise<{ promotion: Promotion; outcome: CampaignLaunchOutcome }> {
  const api = sponsoredApi(kind);
  const launched = await api.launch(id, {
    fundingSource: funding,
    callbackUrl: PAYMENT_RETURN_URL,
    ...(funding === 'card' && card.useSavedCard && { useSavedCard: true }),
    ...(funding === 'card' && !card.useSavedCard && card.saveCard && { saveCard: true }),
  });

  const { checkout } = launched;
  if (!checkout?.authorizationUrl) {
    return {
      promotion: launched,
      outcome: launched.status === 'Active' ? 'live' : 'scheduled',
    };
  }

  const result = await WebBrowser.openAuthSessionAsync(
    checkout.authorizationUrl,
    PAYMENT_RETURN_URL,
  );
  await adWalletApi.confirmTopUp(checkout.reference).catch(() => undefined);
  const after = await api.get(id);
  const outcome: CampaignLaunchOutcome =
    after.status === 'Active'
      ? 'live'
      : after.awaitingPayment
        ? result.type === 'success'
          ? 'awaiting-payment'
          : 'cancelled'
        : 'scheduled';
  return { promotion: after, outcome };
}

/** Save the campaign draft, then launch it (see `launchWithCheckout`). */
export function useLaunchCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { useSavedCard?: boolean } = {}) => {
      const { draft } = useCampaignDraftStore.getState();
      const saved = await persistDraft(draft);
      return launchWithCheckout('promotion', saved.id, draft.funding, {
        useSavedCard: input.useSavedCard,
        saveCard: draft.saveCard,
      });
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
      pause ? promotionsApi.pause(id) : promotionsApi.resume(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}

/** Load a saved draft back into the wizard ("Continue Setup"). */
export async function loadDraftIntoWizard(promotionId: string): Promise<void> {
  const promotion = await promotionsApi.get(promotionId);
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

/* -------------------------------------------------------------------------- */
/* Either kind (boost or promotion campaign)                                  */
/* -------------------------------------------------------------------------- */

export type SponsoredKind = 'boost' | 'promotion';

export function sponsoredApi(kind: SponsoredKind) {
  return kind === 'boost' ? boostsApi : promotionsApi;
}

/** Query-key root per kind; promotions keep the keys above. */
export function sponsoredKeys(kind: SponsoredKind) {
  return kind === 'boost' ? (['boosts'] as const) : campaignKeys.all;
}

export function useSponsoredCampaigns(kind: SponsoredKind) {
  return useQuery({
    queryKey: [...sponsoredKeys(kind), 'list'],
    queryFn: () => sponsoredApi(kind).list({ limit: 50 }),
    staleTime: 30_000,
  });
}

export function useSponsoredCampaign(kind: SponsoredKind, id: string | undefined) {
  return useQuery({
    queryKey: [...sponsoredKeys(kind), 'detail', id ?? ''],
    queryFn: () => sponsoredApi(kind).get(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useSponsoredStats(kind: SponsoredKind, id: string | undefined) {
  return useQuery({
    queryKey: [...sponsoredKeys(kind), 'stats', id ?? ''],
    queryFn: () => sponsoredApi(kind).stats(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

/** Pause, resume or end a launched boost or campaign. */
export function useSponsoredAction(kind: SponsoredKind) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'pause' | 'resume' | 'end' }) =>
      sponsoredApi(kind)[action](id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sponsoredKeys(kind) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.wallet });
    },
  });
}

/**
 * Every campaign, page by page: the ledger must not stop at the first page.
 * Pages are fetched one after another (each says whether another follows).
 */
async function listAllPromotions(
  page = 1,
  collected: Promotion[] = [],
): Promise<Promotion[]> {
  const result = await promotionsApi.list({ page, limit: 100 });
  const all = [...collected, ...result.data];
  return result.hasNextPage && page < 50 ? listAllPromotions(page + 1, all) : all;
}

/** Export every campaign as a CSV ledger through the share sheet. */
export function useExportCampaignLedger() {
  return useMutation({
    mutationFn: async (): Promise<{ count: number }> => {
      const promotions = await listAllPromotions();
      if (promotions.length) {
        const { ledger } = strings.campaignsHub.live;
        await shareCsv(
          datedFileName(ledger.fileName),
          toCsv(ledger.headers, promotionsToLedgerRows(promotions)),
          ledger.title,
        );
      }
      return { count: promotions.length };
    },
  });
}
