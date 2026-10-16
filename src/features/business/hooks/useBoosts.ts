import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { boostsApi } from '@api/boostsApi';
import { Share } from 'react-native';
import {
  adWalletApi,
  type AdWalletInvoice,
  type AdWalletTransaction,
  type AdWalletTransactionType,
} from '@api/adWalletApi';
import { strings } from '@constants/strings';
import { datedFileName, shareCsv, toCsv } from '@utils/csvExport';
import type { Promotion, PromotionForecastInput } from '@api/promotionsApi';
import { PAYMENT_RETURN_URL } from '@features/business/hooks/useSubscriptions';
import {
  campaignKeys,
  launchWithCheckout,
  sponsoredKeys,
} from '@features/business/hooks/useCampaigns';
import {
  boostDraftToSaveInput,
  invoiceText,
  invoicesToCsvRows,
  transactionsToStatementRows,
} from '@features/business/utils/boostMappers';
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

export function useAdWalletTransactions(limit: number, type?: AdWalletTransactionType) {
  return useQuery({
    queryKey: [...campaignKeys.wallet, 'transactions', type ?? 'all', limit],
    queryFn: () => adWalletApi.listTransactions({ limit, ...(type ? { type } : {}) }),
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
    mutationFn: async (input: {
      prepackId?: string;
      amount?: number;
      /** Keep the card for later (owner consent). */
      saveCard?: boolean;
    }) => {
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

/** Top up from the saved card: no browser, the answer is immediate. */
export function useSavedCardTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { prepackId?: string; amount?: number }) =>
      adWalletApi.topUpWithSavedCard(input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: campaignKeys.wallet }),
  });
}

export function useRemoveSavedCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adWalletApi.removeCard(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: campaignKeys.wallet }),
  });
}

export function useSetAutoReload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { enabled: boolean; threshold: number; amount: number }) =>
      adWalletApi.setAutoReload(input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: campaignKeys.wallet }),
  });
}

export function useAdWalletInvoices(limit: number, enabled = true) {
  return useQuery({
    queryKey: [...campaignKeys.wallet, 'invoices', limit],
    queryFn: () => adWalletApi.listInvoices({ limit }),
    staleTime: 30_000,
    enabled,
    placeholderData: previous => previous,
  });
}

/** Share one invoice as text through the share sheet. */
export async function shareInvoice(invoice: AdWalletInvoice): Promise<void> {
  await Share.share({ message: invoiceText(invoice) });
}

/** Every invoice, page by page (an export must be complete). */
async function listAllInvoices(
  page = 1,
  collected: AdWalletInvoice[] = [],
): Promise<AdWalletInvoice[]> {
  const result = await adWalletApi.listInvoices({ page, limit: 100 });
  const all = [...collected, ...result.data];
  return result.hasNextPage && page < 100 ? listAllInvoices(page + 1, all) : all;
}

/** Export every invoice as a CSV through the share sheet. */
export function useExportInvoices() {
  return useMutation({
    mutationFn: async (): Promise<{ count: number }> => {
      const invoices = await listAllInvoices();
      if (invoices.length) {
        const copy = strings.boostWizard.wallet.live.invoices;
        await shareCsv(
          datedFileName(copy.fileName),
          toCsv(copy.headers, invoicesToCsvRows(invoices)),
          copy.title,
        );
      }
      return { count: invoices.length };
    },
  });
}

/** Every wallet transaction, page by page (a statement must be complete). */
async function listAllTransactions(
  page = 1,
  collected: AdWalletTransaction[] = [],
): Promise<AdWalletTransaction[]> {
  const result = await adWalletApi.listTransactions({ page, limit: 100 });
  const all = [...collected, ...result.data];
  return result.hasNextPage && page < 100 ? listAllTransactions(page + 1, all) : all;
}

/** Export the full wallet statement as a CSV through the share sheet. */
export function useExportWalletStatement() {
  return useMutation({
    mutationFn: async (): Promise<{ count: number }> => {
      const transactions = await listAllTransactions();
      if (transactions.length) {
        const { statement } = strings.boostWizard.wallet.live;
        await shareCsv(
          datedFileName(statement.fileName),
          toCsv(statement.headers, transactionsToStatementRows(transactions)),
          statement.title,
        );
      }
      return { count: transactions.length };
    },
  });
}
