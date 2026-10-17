import { useQuery } from '@tanstack/react-query';
import { dealsApi, type OfferFeed } from '@api/dealsApi';

export const branchOfferKeys = {
  list: (branchId: string, limit: number) =>
    ['offers', 'branch', branchId, limit] as const,
};

/** A branch's active offers, for the business profile's deals section. */
export function useBranchOffers(branchId: string | null, limit = 3) {
  return useQuery<OfferFeed>({
    queryKey: branchOfferKeys.list(branchId ?? '', limit),
    queryFn: () => dealsApi.listBranchOffers(branchId as string, { limit }),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}
