import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  claimApi,
  type MyClaim,
  type MyClaimStatus,
  type MyClaimsPage,
} from '@api/claimApi';
import { useAuthStore } from '@store/authStore';

/**
 * The customer's claimed deal passes (`GET /me/claims`).
 *
 * The endpoint is CUSTOMER-only (`403` for an owner token, `401` anonymous),
 * so every query here is gated on the session role; screens render their
 * unavailable/empty state instead of firing a request the server will reject.
 *
 * `status` is the server's *effective* claim status, so tab counts and badges
 * come straight from the response totals rather than a local `expiresAt`
 * comparison. The list caps at the server's 50-row limit — enough for a
 * personal pass wallet — and one extra `limit: 1` read per status provides the
 * tab counts.
 */

const LIST_PAGE_SIZE = 50;
const STALE_MS = 60_000;

export const myClaimKeys = {
  all: ['me', 'claims'] as const,
  list: (status: MyClaimStatus | 'ALL') => [...myClaimKeys.all, 'list', status] as const,
  count: (status: MyClaimStatus) => [...myClaimKeys.all, 'count', status] as const,
};

/**
 * Gate on the token's role — the API authorises on the token, so a profile that
 * has drifted ahead of it (`user.role === 'Customer'` with an owner token) would
 * otherwise fire a request that can only 403. Kept in step by
 * `useCustomerTokenSync`.
 */
const isCustomerToken = (tokenRole: string | undefined | null) =>
  tokenRole === 'Customer';

/** The result shape of a claims list query, for consumers that hold the query. */
export type MyClaimsQueryResult = UseQueryResult<MyClaimsPage, Error>;

export function useMyClaims(status?: MyClaimStatus) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  return useQuery<MyClaimsPage>({
    queryKey: myClaimKeys.list(status ?? 'ALL'),
    queryFn: () => claimApi.listMyClaims({ status, limit: LIST_PAGE_SIZE }),
    enabled: isCustomer,
    staleTime: STALE_MS,
  });
}

/** The active-pass count that drives the dashboard tile and My Deals badge. */
export function useActiveClaimsCount() {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  return useQuery<number>({
    queryKey: myClaimKeys.count('ACTIVE'),
    queryFn: async () =>
      (await claimApi.listMyClaims({ status: 'ACTIVE', limit: 1 })).total,
    enabled: isCustomer,
    staleTime: STALE_MS,
  });
}

/** Per-status totals for the My Deals tab labels. */
export function useClaimsCount(status: MyClaimStatus) {
  const isCustomer = useAuthStore(state => isCustomerToken(state.tokenRole));
  return useQuery<number>({
    queryKey: myClaimKeys.count(status),
    queryFn: async () => (await claimApi.listMyClaims({ status, limit: 1 })).total,
    enabled: isCustomer,
    staleTime: STALE_MS,
  });
}

/**
 * Resolves one pass out of the cached claims list.
 *
 * There is no single-claim GET on the customer API; `GET /me/claims` already
 * returns everything a pass renders. Deep links may carry either a claim id or
 * an offer id, so both are matched. Mirrors `useCustomerOrderDetail`:
 * `isNotFound` distinguishes "still loading" from "not one of yours".
 */
export function useClaimPass(params: { claimId?: string; offerId?: string }) {
  const list = useMyClaims();
  const claim: MyClaim | undefined = (list.data?.data ?? []).find(candidate =>
    params.claimId
      ? candidate.id === params.claimId
      : params.offerId
        ? candidate.offer.id === params.offerId
        : false,
  );

  return {
    ...list,
    claim,
    isNotFound: list.isSuccess && Boolean(params.claimId ?? params.offerId) && !claim,
  };
}
