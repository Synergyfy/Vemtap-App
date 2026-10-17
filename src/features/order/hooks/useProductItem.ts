import { useQuery } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';
import { serviceItemKeys } from '@features/booking/hooks/useServiceItem';

/**
 * One product, by uuid, priced for the branch when it is known. Shares the
 * service item's cache key: both are the same public catalogue item.
 */
export function useProductItem(itemId?: string, branchId?: string) {
  return useQuery({
    queryKey: serviceItemKeys.item(itemId ?? '', branchId),
    queryFn: () => catalogueApi.getItem(itemId as string, branchId),
    enabled: Boolean(itemId),
    staleTime: 60_000,
    retry: false,
  });
}
