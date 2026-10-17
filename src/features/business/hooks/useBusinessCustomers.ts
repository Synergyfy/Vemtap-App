import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  businessCustomersApi,
  type CustomerDirectoryQuery,
  type SaveCustomerNoteInput,
} from '@api/businessCustomersApi';

export const businessCustomersKeys = {
  all: ['business-customers'] as const,
  directory: (query: Omit<CustomerDirectoryQuery, 'page'>) =>
    [
      'business-customers',
      'directory',
      query.search ?? '',
      query.segment ?? 'all',
      query.branchId ?? 'all',
      query.sort ?? 'recent',
      query.limit ?? 20,
    ] as const,
  dossier: (userId: string) => ['business-customers', 'dossier', userId] as const,
};

/** `GET /business-customers`, a page at a time. */
export function useCustomerDirectory(query: Omit<CustomerDirectoryQuery, 'page'>) {
  return useInfiniteQuery({
    queryKey: businessCustomersKeys.directory(query),
    queryFn: ({ pageParam }) =>
      businessCustomersApi.directory({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: last => (last.hasNextPage ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCustomerDossier(userId: string | undefined) {
  return useQuery({
    queryKey: businessCustomersKeys.dossier(userId ?? ''),
    queryFn: () => businessCustomersApi.dossier(userId as string),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

/** `PUT /business-customers/:id/note` — refreshes the dossier after saving. */
export function useSaveCustomerNote(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveCustomerNoteInput) =>
      businessCustomersApi.saveNote(userId as string, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: businessCustomersKeys.dossier(userId ?? ''),
      });
    },
  });
}

export function useExportCustomers() {
  return useMutation({
    mutationFn: (query: Omit<CustomerDirectoryQuery, 'page' | 'limit'>) =>
      businessCustomersApi.export(query),
  });
}
