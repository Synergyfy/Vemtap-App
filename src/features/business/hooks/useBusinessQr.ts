import { useMutation, useQuery } from '@tanstack/react-query';
import { businessQrApi, type BusinessQrQuery } from '@api/businessQrApi';

export const businessQrKeys = {
  all: ['business-qr'] as const,
  summary: (query: BusinessQrQuery) =>
    [
      'business-qr',
      'summary',
      query.from ?? '',
      query.to ?? '',
      query.branchId ?? 'all',
    ] as const,
};

/** `GET /business-qr/summary` — codes, artwork and scan counts. */
export function useBusinessQrSummary(query: BusinessQrQuery = {}, enabled = true) {
  return useQuery({
    queryKey: businessQrKeys.summary(query),
    queryFn: () => businessQrApi.summary(query),
    staleTime: 60_000,
    enabled,
  });
}

/** `GET /business-qr/kit` — the printable PDF to share or save. */
export function useBusinessQrKit() {
  return useMutation({
    mutationFn: (query: BusinessQrQuery) => businessQrApi.kit(query),
  });
}
