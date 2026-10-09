import { useQuery } from '@tanstack/react-query';
import { savingsApi, type SavingsBreakdown, type SavingsPage } from '@api/savingsApi';

export const savingsKeys = {
  ledger: (days?: number, page = 1) =>
    ['savings', 'ledger', days ?? 'all', page] as const,
  categories: (days?: number) => ['savings', 'categories', days ?? 'all'] as const,
};

/** Timeframe chips on Savings History → the `days` window they map to. */
export type SavingsRange = 'month' | 'quarter' | 'allTime';

export const SAVINGS_RANGE_DAYS: Record<SavingsRange, number | undefined> = {
  month: 30,
  quarter: 90,
  allTime: undefined,
};

/**
 * Paginated redemption ledger. An empty `data` array is a valid state (nothing
 * redeemed yet), not an error.
 */
export function useSavingsLedger(
  days: number | undefined,
  page = 1,
  limit = 10,
): ReturnType<typeof useQuery<SavingsPage>> {
  return useQuery<SavingsPage>({
    queryKey: savingsKeys.ledger(days, page),
    queryFn: () => savingsApi.getSavings({ days, page, limit }),
    staleTime: 120_000,
  });
}

/** Spend by category for the share bar and the category list. */
export function useSavingsCategories(
  days: number | undefined,
): ReturnType<typeof useQuery<SavingsBreakdown>> {
  return useQuery<SavingsBreakdown>({
    queryKey: savingsKeys.categories(days),
    queryFn: () => savingsApi.getSavingsByCategory({ days }),
    staleTime: 120_000,
  });
}
