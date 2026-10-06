import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi, type OfferFeed, type PublicOfferDetail } from '@api/dealsApi';
import { ApiError } from '@api/ApiError';
import { discoveryOrigin } from '@utils/geo';
import { useLocationStore } from '@store/locationStore';
import { resolveDeal, type ResolvedDeal } from '@features/dealDetail/data/dealResolver';
import { mapOfferDetailToResolved } from '@features/dealDetail/utils/liveDealMapper';

/**
 * Resolving a deal id to the page's view model.
 *
 * Order matters and is not interchangeable:
 *
 *  1. **Seed first.** Discover's businesses and the bundled feeds reference
 *     fictional deals (`urban-grill-lunch`, `glow-spa-weekend`). Those are not
 *     on the server at all, and asking the API about one is a **400**, not a
 *     404 — so they must never reach the network.
 *  2. **Live second.** A real offer id is fetched from
 *     `GET /catalogue/offers/public/details/:id`.
 *
 * A miss is reported as `notFound` instead of falling back to some other deal.
 * The resolver used to answer `?? gridDeals[0]`, so tapping a live card opened
 * an unrelated seed offer — a wrong price for a wrong product, silently.
 */
export type DealDetailState =
  | { status: 'resolved'; deal: ResolvedDeal }
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' };

export const dealDetailKeys = {
  live: (offerId: string) => ['offers', 'detail', offerId] as const,
  /** Prefix of the public feed keys, so any cached page can be scanned. */
  feed: ['offers', 'public'] as const,
};

export function useDealDetail(dealId: string): DealDetailState & { retry: () => void } {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  const queryClient = useQueryClient();

  const seed = useMemo(() => resolveDeal(dealId), [dealId]);
  const isSeed = seed !== undefined;

  /**
   * The merchant code to link with.
   *
   * `GET /catalogue/offers/public/details/:id` does **not** return the business's
   * own `uniqueCode` — the only value `/public/businesses/code/:code` accepts.
   * What it calls `business.slug` is the branch's `uniqueCode` (and the search
   * endpoint's `slug` is the branch's username), both of which 404:
   *
   *   details  business.slug → 8GUF52339  (branch uniqueCode)  → 404
   *   search   business.slug → synergyfy   (branch username)    → 404
   *   feed     business.slug → QFN2OX8BJ   (business uniqueCode) → 200
   *
   * The feed *does* carry the right code, and it is already cached whenever the
   * user reached this screen from a deal card, so it is read from the cache
   * rather than sent to the API. The backend fix is to include
   * `business.uniqueCode` in the details payload.
   */
  const feedBusinessCode = useMemo(() => {
    const cached = queryClient.getQueriesData<OfferFeed>({
      queryKey: dealDetailKeys.feed,
    });
    for (const [, feed] of cached) {
      const match = feed?.data?.find(offer => offer.id === dealId);
      if (match?.business?.slug) return match.business.slug;
    }
    return undefined;
  }, [dealId, queryClient]);

  const query = useQuery<PublicOfferDetail>({
    // No request at all for a fictional deal — see the note above.
    queryKey: dealDetailKeys.live(dealId),
    queryFn: () => dealsApi.getPublicOfferDetails(dealId),
    enabled: !isSeed,
    staleTime: 60_000,
    retry: false,
  });

  /**
   * Captured before the branches below narrow away `pending` / `error` / `data`:
   * once those are eliminated, TypeScript narrows the query object to `never`.
   */
  const retry = () => {
    void query.refetch();
  };

  if (seed) {
    return { status: 'resolved', deal: seed, retry: () => undefined };
  }

  if (query.isPending) {
    return { status: 'loading', retry };
  }

  if (query.isError) {
    // A 404 means the offer is gone (or never existed); anything else is a
    // network/server problem worth offering a retry for.
    const status = (query.error as ApiError | undefined)?.status;
    return {
      status: status === 404 ? 'notFound' : 'error',
      retry,
    };
  }

  if (query.data) {
    return {
      status: 'resolved',
      deal: mapOfferDetailToResolved(query.data, origin, feedBusinessCode),
      retry,
    };
  }

  // Enabled query, no error, no data — only reachable if the request was skipped.
  return { status: 'notFound', retry };
}
