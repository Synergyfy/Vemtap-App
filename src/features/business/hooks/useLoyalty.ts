import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  loyaltyApi,
  type CreateRewardInput,
  type LoyaltyRule,
  type Reward,
  type UpdateLoyaltyRulesInput,
  type UpdateRewardInput,
} from '@api/loyaltyApi';

/**
 * Owner-side loyalty: the earning-rules row, the branch reward catalogue and
 * the point ledger behind the recent-redemption feed.
 *
 * Rules are keyed by their *scope* rather than always by branch: the backend
 * upserts one row per `{ businessId }` or `{ businessId, branchId }`, so a
 * business-wide read and a branch read are two different rows that must never
 * share a cache entry — a branch edit would otherwise appear to have changed
 * the programme everywhere.
 *
 * Stats deliberately keep the Business Hub's own key
 * (`businessHubKeys.loyalty`): the hub module card and the programme screen
 * show the same numbers and must not fetch or invalidate them separately.
 */
export const loyaltyKeys = {
  rules: (branchId?: string | null) =>
    ['loyalty', 'rules', branchId ?? 'business'] as const,
  rewards: (branchId?: string | null) =>
    ['loyalty', 'rewards', branchId ?? 'none'] as const,
  logs: (businessId?: string | null) =>
    ['loyalty', 'logs', businessId ?? 'none'] as const,
};

/**
 * A reward write moves three things at once: the catalogue the screen lists,
 * the hub stats that count active rewards, and the point feed that records the
 * redemptions it enabled. Invalidating only the first would leave the other two
 * showing yesterday's numbers.
 */
function invalidateRewardCaches(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['loyalty', 'rewards'] });
  void queryClient.invalidateQueries({ queryKey: ['business', 'hub', 'loyalty'] });
  void queryClient.invalidateQueries({ queryKey: ['loyalty', 'logs'] });
}

/** `GET /loyalty/rules` — omitted scope reads the business-wide row. */
export function useLoyaltyRules(branchId?: string | null) {
  return useQuery<LoyaltyRule>({
    queryKey: loyaltyKeys.rules(branchId),
    queryFn: () => loyaltyApi.getRules(branchId),
    staleTime: 60_000,
  });
}

/** `PATCH /loyalty/rules` — OWNER/ADMIN server-side. */
export function useUpdateLoyaltyRules(branchId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UpdateLoyaltyRulesInput) =>
      loyaltyApi.updateRules(patch, branchId),
    onSuccess: () => {
      // Both scopes' rows go with it: an owner who just edited the business-wide
      // rules must not land back on a cached branch copy of the old values.
      void queryClient.invalidateQueries({ queryKey: ['loyalty', 'rules'] });
      void queryClient.invalidateQueries({ queryKey: ['business', 'hub', 'loyalty'] });
    },
  });
}

/** Every reward on a branch — paused and expired rows included, see the API note. */
export function useBranchRewards(branchId: string | null | undefined) {
  return useQuery<Reward[]>({
    queryKey: loyaltyKeys.rewards(branchId),
    queryFn: () => loyaltyApi.listBranchRewards(branchId as string),
    enabled: Boolean(branchId),
    staleTime: 30_000,
  });
}

/** `POST /loyalty/rewards` — requires `marketing` (OWNER/ADMIN bypass). */
export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRewardInput) => loyaltyApi.createReward(input),
    onSuccess: () => invalidateRewardCaches(queryClient),
  });
}

/**
 * `PATCH /loyalty/rewards/:id` — edits and the pause/resume toggle.
 *
 * The toggle is applied to the cached list optimistically so the switch flips
 * with the tap instead of waiting out the round trip, then rolled back on
 * failure and re-synced from the server either way.
 */
export function useUpdateReward(branchId: string | null | undefined) {
  const queryClient = useQueryClient();
  const key = loyaltyKeys.rewards(branchId);

  return useMutation({
    mutationFn: (input: { rewardId: string; patch: UpdateRewardInput }) =>
      loyaltyApi.updateReward(input.rewardId, input.patch),
    onMutate: async ({ rewardId, patch }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Reward[]>(key);
      queryClient.setQueryData<Reward[]>(key, current =>
        current?.map(reward =>
          reward.id === rewardId ? { ...reward, ...patch } : reward,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => invalidateRewardCaches(queryClient),
  });
}

/** `DELETE /loyalty/rewards/:id`. */
export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardId: string) => loyaltyApi.deleteReward(rewardId),
    onSuccess: () => invalidateRewardCaches(queryClient),
  });
}

/**
 * `GET /loyalty/points/business-logs` — OWNER/ADMIN only, so a manager's 403
 * must not retry: the feed simply renders empty for a role that cannot read it.
 */
export function useBusinessPointLogs(businessId: string | null | undefined) {
  return useQuery({
    queryKey: loyaltyKeys.logs(businessId),
    queryFn: () =>
      loyaltyApi.getBusinessLogs({ businessId: businessId as string, limit: 10 }),
    enabled: Boolean(businessId),
    staleTime: 60_000,
    retry: false,
  });
}
