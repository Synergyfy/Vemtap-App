import { useQuery } from '@tanstack/react-query';
import {
  activityApi,
  type ActivityFilter,
  type ActivityPage,
  type ActivitySummary,
  type SwitchPreview,
} from '@api/activityApi';
import { useAuthStore } from '@store/authStore';

/** The API authorises on the token's role, so only a customer token asks. */
const isCustomerToken = (tokenRole: string | undefined | null) =>
  tokenRole === 'Customer';

export const activityKeys = {
  all: ['me', 'activity'] as const,
  list: (kind: ActivityFilter, from: string | null) =>
    ['me', 'activity', 'list', kind, from ?? 'all'] as const,
  summary: (from: string | null) => ['me', 'activity', 'summary', from ?? 'all'] as const,
};

/** The timeline for one filter and period. CUSTOMER tokens only. */
export function useActivity(kind: ActivityFilter, from: string | null, limit = 50) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  return useQuery<ActivityPage>({
    queryKey: activityKeys.list(kind, from),
    queryFn: () => activityApi.list({ kind, from: from ?? undefined, limit }),
    enabled: isCustomer,
    staleTime: 60_000,
  });
}

export function useActivitySummary(from: string | null) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  return useQuery<ActivitySummary>({
    queryKey: activityKeys.summary(from),
    queryFn: () => activityApi.summary(from ? { from } : {}),
    enabled: isCustomer,
    staleTime: 60_000,
  });
}

/** Active claims and saved counts for the profile-switch screen (any role). */
export function useSwitchPreview() {
  const signedIn = useAuthStore(state => Boolean(state.user));
  return useQuery<SwitchPreview>({
    queryKey: [...activityKeys.all, 'switch-preview'],
    queryFn: () => activityApi.switchPreview(),
    enabled: signedIn,
    staleTime: 60_000,
  });
}
