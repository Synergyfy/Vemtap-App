import { useQuery } from '@tanstack/react-query';
import { catalogueApi, type CatalogueItemQuery } from '@api/catalogueApi';

export const catalogueKeys = {
  branchItems: (branchId: string, query: CatalogueItemQuery) =>
    ['catalogue', 'branch', branchId, query] as const,
  branchCategories: (branchId: string) => ['catalogue', 'categories', branchId] as const,
};

/** Active products and services for one branch. Public, so no auth is needed. */
export function useBranchCatalogue(
  branchId: string | null,
  query: CatalogueItemQuery = {},
) {
  return useQuery({
    queryKey: catalogueKeys.branchItems(branchId ?? '', query),
    queryFn: () => catalogueApi.listBranchItems(branchId as string, query),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}

/** Categories that currently have active items at the branch. Bare array upstream. */
export function useBranchCatalogueCategories(branchId: string | null) {
  return useQuery({
    queryKey: catalogueKeys.branchCategories(branchId ?? ''),
    queryFn: () => catalogueApi.listBranchCategories(branchId as string),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}
