import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dealsApi, type PublicOfferDetail } from '@api/dealsApi';
import { ApiError } from '@api/ApiError';
import { discoveryOrigin } from '@utils/geo';
import { useLocationStore } from '@store/locationStore';
import type { ResolvedDeal } from '@features/dealDetail/types';
import { mapOfferDetailToResolved } from '@features/dealDetail/utils/liveDealMapper';

/**
 * Resolving a deal id to the page's view model, from
 * `GET /catalogue/offers/public/details/:id`.
 *
 * Offer ids are uuids, and the endpoint answers a non-uuid with a 400, so an id
 * that cannot be an offer (an old link to a retired demo deal) is reported as
 * `notFound` without a request. A miss is never filled with some other deal.
 */
export type DealDetailState =
  | { status: 'resolved'; deal: ResolvedDeal }
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dealDetailKeys = {
  live: (offerId: string) => ['offers', 'detail', offerId] as const,
};

export function useDealDetail(dealId: string): DealDetailState & { retry: () => void } {
  const area = useLocationStore(state => state.area);
  const coords = useLocationStore(state => state.coords);
  const origin = useMemo(() => discoveryOrigin(area, coords), [area, coords]);

  const isOfferId = UUID.test(dealId);

  const query = useQuery<PublicOfferDetail>({
    queryKey: dealDetailKeys.live(dealId),
    queryFn: () => dealsApi.getPublicOfferDetails(dealId),
    enabled: isOfferId,
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

  if (!isOfferId) {
    return { status: 'notFound', retry: () => undefined };
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
      deal: mapOfferDetailToResolved(query.data, origin),
      retry,
    };
  }

  // Enabled query, no error, no data — only reachable if the request was skipped.
  return { status: 'notFound', retry };
}
