import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ordersApi,
  type BusinessOrdersList,
  type BusinessOrdersQuery,
  type CatalogueOrder,
} from '@api/ordersApi';

export const businessOrderKeys = {
  all: ['businessOrders'] as const,
  list: (query: BusinessOrdersQuery) =>
    [...businessOrderKeys.all, 'list', query] as const,
  detail: (id: string) => [...businessOrderKeys.all, 'detail', id] as const,
};

export function useBusinessOrders(query: BusinessOrdersQuery = {}) {
  return useQuery<BusinessOrdersList>({
    queryKey: businessOrderKeys.list(query),
    queryFn: () => ordersApi.listBusinessOrders(query),
    staleTime: 30_000,
  });
}

export function useBusinessOrderDetail(id?: string | null) {
  return useQuery<CatalogueOrder>({
    queryKey: businessOrderKeys.detail(id ?? ''),
    queryFn: () => ordersApi.getOrder(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateOrderStatus(id, status),
    onSuccess: updated => {
      queryClient.invalidateQueries({ queryKey: businessOrderKeys.all });
      queryClient.setQueryData(businessOrderKeys.detail(updated.id), updated);
    },
  });
}
