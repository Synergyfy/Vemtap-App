import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loyaltyApi,
  type LoyaltyAnalytics,
  type LoyaltyTier,
  type Reward,
} from '@api/loyaltyApi';

export const loyaltyKeys = {
  rewards: (businessId?: string | null) =>
    ['loyalty', 'rewards', businessId ?? 'global'] as const,
  reward: (id: string) => ['loyalty', 'reward', id] as const,
  balance: (businessId: string | null) =>
    ['loyalty', 'balance', businessId ?? 'global'] as const,
  analytics: (days: number | 'allTime') => ['loyalty', 'analytics', days] as const,
  tier: () => ['loyalty', 'tier'] as const,
  logs: (businessId: string | null, page: number, limit: number) =>
    ['loyalty', 'logs', businessId ?? 'global', page, limit] as const,
};

/**
 * Public rewards list (unauthenticated).
 *
 * With no `businessId` the query asks for the platform-wide list
 * (`?global=true`), which the API supports — so it no longer needs to stay
 * disabled while waiting for business context.
 */
export function useRewards(scope: { businessId?: string | null } = {}) {
  const businessId = scope.businessId ?? null;
  return useQuery<Reward[]>({
    queryKey: loyaltyKeys.rewards(businessId),
    queryFn: () => loyaltyApi.listRewards(businessId),
    enabled: true,
    staleTime: 300_000,
  });
}

/**
 * Customer's loyalty tier and progress toward the next one.
 * Auth required. Server-authoritative thresholds — do not resolve locally.
 */
export function useLoyaltyTier(options: { enabled?: boolean } = {}) {
  return useQuery<LoyaltyTier>({
    queryKey: loyaltyKeys.tier(),
    queryFn: () => loyaltyApi.getTier(),
    enabled: options.enabled ?? true,
    staleTime: 300_000,
  });
}

/**
 * Single reward details (public).
 */
export function useReward(id: string) {
  return useQuery<Reward>({
    queryKey: loyaltyKeys.reward(id),
    queryFn: () => loyaltyApi.getReward(id),
    enabled: Boolean(id),
    staleTime: 300_000,
  });
}

/**
 * Customer's loyalty point balance for a business.
 * Omit businessId for global balance across all businesses.
 */
export function useLoyaltyBalance(businessId: string | null) {
  return useQuery<number>({
    queryKey: loyaltyKeys.balance(businessId),
    queryFn: () => loyaltyApi.getBalance(businessId),
    enabled: true, // always run, businessId can be null
    staleTime: 60_000,
  });
}

/**
 * Customer's aggregated visits/points/savings over a window.
 *
 * `totals.netSavings` is naira saved on redeemed claims. Pass `'allTime'` for
 * the "All Time" timeframe chip instead of approximating it with a large `days`.
 */
export function useLoyaltyAnalytics(days: number | 'allTime' = 365) {
  const allTime = days === 'allTime';
  return useQuery<LoyaltyAnalytics>({
    queryKey: loyaltyKeys.analytics(days),
    queryFn: () => loyaltyApi.getAnalytics(allTime ? 365 : days, { allTime }),
    staleTime: 300_000,
  });
}

/**
 * Paginated loyalty transaction logs for the current customer.
 */
export function useLoyaltyLogs(businessId: string | null, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['loyalty', 'logs', businessId ?? 'global', page, limit],
    queryFn: async () => {
      const logs = await loyaltyApi.getLogs({
        businessId: businessId ?? undefined,
        page,
        limit,
      });
      // Schema accepts: {data, total, page, limit} | [...]
      if (Array.isArray(logs)) {
        return { data: logs, total: logs.length, page, limit };
      }
      return {
        data: logs.data ?? [],
        total: logs.total ?? 0,
        page: logs.page ?? page,
        limit: logs.limit ?? limit,
      };
    },
    staleTime: 60_000,
    placeholderData: prev => prev,
  });
}

/**
 * Hook to redeem a 9-digit point code.
 */
export function useUsePointCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => loyaltyApi.usePointCode(code),
    onSuccess: () => {
      // Invalidate balance and logs so UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'logs'] });
    },
  });
}
