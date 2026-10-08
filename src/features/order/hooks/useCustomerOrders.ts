import { useQuery } from '@tanstack/react-query';
import { ordersApi, type CatalogueOrder } from '@api/ordersApi';

export const customerOrderKeys = {
  all: ['customerOrders'] as const,
  list: () => [...customerOrderKeys.all, 'myOrders'] as const,
  detail: (id: string) => [...customerOrderKeys.all, 'detail', id] as const,
};

export function useCustomerOrders() {
  return useQuery<CatalogueOrder[]>({
    queryKey: customerOrderKeys.list(),
    queryFn: () => ordersApi.getMyOrders(),
    staleTime: 60_000,
  });
}

export function useCustomerOrderDetail(id?: string | null) {
  return useQuery<CatalogueOrder>({
    queryKey: customerOrderKeys.detail(id ?? ''),
    queryFn: () => ordersApi.getOrder(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
