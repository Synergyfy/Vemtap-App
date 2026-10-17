import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  businessNetworkApi,
  type DiscoveryPresence,
  type DiscoverySettings,
  type ReferralsQuery,
} from '@api/businessNetworkApi';

export const businessNetworkKeys = {
  all: ['business-network'] as const,
  summary: () => ['business-network', 'summary'] as const,
  referrals: (query: ReferralsQuery) =>
    [
      'business-network',
      'referrals',
      query.status ?? 'all',
      query.search ?? '',
      query.page ?? 1,
      query.limit ?? 20,
    ] as const,
  referral: (id: string) => ['business-network', 'referral', id] as const,
  discovery: (branchId?: string) =>
    ['business-network', 'discovery', branchId ?? 'main'] as const,
};

export function useNetworkSummary() {
  return useQuery({
    queryKey: businessNetworkKeys.summary(),
    queryFn: () => businessNetworkApi.summary(),
    staleTime: 60_000,
  });
}

export function useReferrals(query: ReferralsQuery) {
  return useQuery({
    queryKey: businessNetworkKeys.referrals(query),
    queryFn: () => businessNetworkApi.referrals(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useReferral(id: string | undefined) {
  return useQuery({
    queryKey: businessNetworkKeys.referral(id ?? ''),
    queryFn: () => businessNetworkApi.referral(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useDiscoveryPresence(branchId?: string) {
  return useQuery({
    queryKey: businessNetworkKeys.discovery(branchId),
    queryFn: () => businessNetworkApi.discovery(branchId),
    staleTime: 30_000,
  });
}

/** Optimistic toggle of one discovery setting; rolls back on failure. */
export function useUpdateDiscoverySetting(branchId?: string) {
  const queryClient = useQueryClient();
  const key = businessNetworkKeys.discovery(branchId);
  return useMutation({
    mutationFn: (input: { branchId: string; patch: Partial<DiscoverySettings> }) =>
      businessNetworkApi.updateDiscoverySettings(input.branchId, input.patch),
    onMutate: async ({ patch }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DiscoveryPresence>(key);
      if (previous) {
        queryClient.setQueryData<DiscoveryPresence>(key, {
          ...previous,
          settings: { ...previous.settings, ...patch },
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
