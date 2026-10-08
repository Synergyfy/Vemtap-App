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

/**
 * Resolves one order out of the customer's own list.
 *
 * There is deliberately no `GET /catalogue/orders/{id}` call here: that route
 * is Admin/Staff-only and answers **403 Forbidden** for a customer token
 * (verified against the test server). `my-orders` already returns the complete
 * order — business, branch, lines, totals, status — so the detail screen reads
 * it from the same cached list rather than making a request it is not allowed
 * to make.
 *
 * Refetching the list is safe and cheap, and keeps a screen opened from a
 * notification or deep link working when the list has never been fetched.
 */
export function useCustomerOrderDetail(id?: string | null) {
  const list = useQuery<CatalogueOrder[]>({
    queryKey: customerOrderKeys.list(),
    queryFn: () => ordersApi.getMyOrders(),
    staleTime: 60_000,
  });

  const order = id ? (list.data ?? []).find(candidate => candidate.id === id) : undefined;

  return {
    ...list,
    order,
    /** Distinguishes "still loading" from "loaded, and this order isn't yours". */
    isNotFound: list.isSuccess && Boolean(id) && !order,
  };
}
