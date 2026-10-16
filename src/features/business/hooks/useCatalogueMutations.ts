import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';
import type {
  UpdatedCatalogueItem,
  CatalogueCategory,
  CatalogueOfferDetail,
} from '@api/catalogueApi';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import { invalidateDeals } from '@features/business/hooks/useDealsManagement';
import {
  dealDraftToCreateInput,
  dealDraftToUpdateInput,
  productDraftToCreateInput,
  serviceBranchPricingInput,
  serviceDraftToCreateInput,
  splitBranchIds,
} from '@features/business/utils/catalogueDraftMappers';

/** The signed-in business's branches, for every wizard branch picker. */
export function useBusinessBranches() {
  return useQuery({
    queryKey: ['business-branches'],
    queryFn: () => catalogueApi.listBusinessBranches(),
    staleTime: 60_000,
  });
}

export type CatalogueDraftKind = 'product' | 'service';

/**
 * Publishes the accumulated product/service draft: creates the item for the
 * first selected branch, imports it into every remaining branch, and — when
 * the owner chose "save as draft" — flips the freshly created item to
 * `inactive` (items are active-by-default on create).
 */
export function usePublishCatalogueItem() {
  const queryClient = useQueryClient();
  const setPublishedProduct = useCatalogueDraftStore(state => state.setPublishedProduct);
  const setPublishedService = useCatalogueDraftStore(state => state.setPublishedService);

  return useMutation({
    mutationFn: async ({
      kind,
      status,
    }: {
      kind: CatalogueDraftKind;
      status: 'active' | 'inactive';
    }): Promise<UpdatedCatalogueItem> => {
      const state = useCatalogueDraftStore.getState();
      const draft = kind === 'product' ? state.product : state.service;
      const { primaryBranchId, remainingBranchIds } = splitBranchIds(draft.branchIds);
      if (!primaryBranchId) {
        throw new Error('Select at least one branch before publishing');
      }

      const input =
        kind === 'product'
          ? productDraftToCreateInput(state.product, primaryBranchId)
          : serviceDraftToCreateInput(state.service, primaryBranchId);

      // Deduplication: if saving as draft and there's already a published draft item,
      // update it instead of creating a duplicate.
      const existingDraftId =
        kind === 'product'
          ? state.product.publishedItemId
          : state.service.publishedServiceId;

      let created: UpdatedCatalogueItem;
      if (status === 'inactive' && existingDraftId) {
        // Update existing draft item
        created = await catalogueApi.updateCatalogueItem(existingDraftId, {
          ...input,
          status: 'inactive',
        });
      } else {
        // Create new item
        created = await catalogueApi.createCatalogueItem(input);
        await Promise.all(
          remainingBranchIds.map(targetBranchId =>
            catalogueApi.importItemToBranch(created.id, targetBranchId),
          ),
        );
        if (status === 'inactive') {
          created = await catalogueApi.updateCatalogueItem(created.id, {
            status: 'inactive',
          });
        }
      }
      // A service priced per branch: set every branch's own price (and keep
      // the branch set in step when an existing draft is re-saved).
      const branchPricing =
        kind === 'service' ? serviceBranchPricingInput(state.service) : undefined;
      if (branchPricing) {
        await catalogueApi.setItemBranchPricing(created.id, branchPricing);
      }
      return created;
    },
    onSuccess: (created, { kind }) => {
      if (kind === 'product') setPublishedProduct(created.id);
      else setPublishedService(created.id);
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'business'] });
    },
  });
}

/** Live/draft toggle from the published-confirmation screens. */
export function useUpdateCatalogueItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      status,
    }: {
      itemId: string;
      status: 'active' | 'inactive' | 'archived';
    }): Promise<UpdatedCatalogueItem> =>
      catalogueApi.updateCatalogueItem(itemId, { status }),
    // Refetch every catalogue list so status pills and chip filters match the
    // saved row instead of waiting out the 60s staleTime.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'business'] }),
  });
}

/**
 * Quick edit from the hub: patches the fields an owner actually tweaks from a
 * list (name/price) and refreshes every catalogue list that showed the row.
 */
export function useUpdateCatalogueItemDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      name,
      price,
    }: {
      itemId: string;
      name?: string;
      price?: number;
    }): Promise<UpdatedCatalogueItem> =>
      catalogueApi.updateCatalogueItem(itemId, { name, price }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'business'] }),
  });
}

/**
 * Permanent delete: the item is removed everywhere, not just one branch. The
 * hub's sheet action archives (status=archived) instead; this stays for
 * flows that truly destroy the row.
 */
export function useDeleteCatalogueItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string): Promise<{ id: string }> =>
      catalogueApi.deleteCatalogueItem(itemId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'business'] }),
  });
}

/** Rename from the services/categories hub. */
export function useUpdateCatalogueCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      name,
    }: {
      categoryId: string;
      name: string;
    }): Promise<CatalogueCategory> =>
      catalogueApi.updateCatalogueCategory(categoryId, name),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['business-catalogue-categories'],
      }),
  });
}

/**
 * Archive a category: the backend detaches it from every item, then removes
 * the row, so products survive with no category.
 */
export function useDeleteCatalogueCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string): Promise<{ id: string }> =>
      catalogueApi.deleteCatalogueCategory(categoryId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['business-catalogue-categories'],
      }),
  });
}

/**
 * Reorders categories: sends the full ordered list to the backend.
 */
export function useReorderCatalogueCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]): Promise<CatalogueCategory[]> =>
      catalogueApi.reorderCatalogueCategories(orderedIds),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['business-catalogue-categories'],
      }),
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      status,
    }: {
      offerId: string;
      status: 'active' | 'inactive';
    }): Promise<CatalogueOfferDetail> =>
      catalogueApi.updateCatalogueOffer(offerId, { status }),
    onSuccess: () => invalidateDeals(queryClient),
  });
}

/**
 * Publishes the accumulated deal draft. Offers are active-by-default on
 * create, so "save as draft" creates the offer and immediately flips it to
 * `inactive`.
 */
export function usePublishCatalogueOffer() {
  const setPublishedDeal = useCatalogueDraftStore(state => state.setPublishedDeal);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      status,
      itemIds,
      branchId,
      branchIds,
    }: {
      status: 'active' | 'inactive';
      /** Pre-resolved catalogue item ids when the draft carries none. */
      itemIds?: string[];
      branchId?: string;
      /** Every branch to publish to; defaults to the draft's branches. */
      branchIds?: string[];
    }): Promise<CatalogueOfferDetail> => {
      const { deal } = useCatalogueDraftStore.getState();
      const targets = branchIds?.length ? branchIds : deal.branchIds;
      const resolvedBranchId = branchId ?? targets[0];
      if (!resolvedBranchId) {
        throw new Error('Select at least one branch before launching the deal');
      }

      const input = dealDraftToCreateInput(
        { ...deal, itemIds: itemIds?.length ? itemIds : deal.itemIds },
        resolvedBranchId,
        targets,
      );

      const created = await catalogueApi.createCatalogueOffer(input);
      if (status === 'inactive') {
        // A multi-branch create returns the first branch's offer; drafting
        // only that row would leave the other branches live.
        const dealGroupId =
          typeof created.dealGroupId === 'string' ? created.dealGroupId : created.id;
        await catalogueApi.updateOfferGroupStatus(dealGroupId, 'inactive');
        return { ...created, status: 'inactive' };
      }
      return created;
    },
    onSuccess: created => {
      setPublishedDeal(created.id);
      return invalidateDeals(queryClient);
    },
  });
}

/**
 * Saves the edit flow: the draft loaded from an existing deal goes to every
 * branch of that deal through the group endpoint, then the draft is cleared.
 */
export function useSaveDealEdit() {
  const resetDeal = useCatalogueDraftStore(state => state.resetDeal);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { deal } = useCatalogueDraftStore.getState();
      if (!deal.editingDealGroupId) {
        throw new Error('No deal is being edited');
      }
      await catalogueApi.updateOfferGroup(
        deal.editingDealGroupId,
        dealDraftToUpdateInput(deal),
      );
    },
    onSuccess: () => {
      resetDeal();
      return invalidateDeals(queryClient);
    },
  });
}

/** Fetches the business's own catalogue categories (not platform taxonomy). */
export function useCatalogueCategories() {
  return useQuery({
    queryKey: ['business-catalogue-categories'],
    queryFn: () => catalogueApi.listCatalogueCategories(),
    staleTime: 60_000,
  });
}
