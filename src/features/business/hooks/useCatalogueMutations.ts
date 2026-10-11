import { useMutation, useQuery } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';
import type {
  BusinessCatalogueItem,
  CatalogueOfferDetail,
} from '@api/catalogueApi';
import { useCatalogueDraftStore } from '@store/catalogueDraftStore';
import {
  dealDraftToCreateInput,
  productDraftToCreateInput,
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
  const setPublishedProduct = useCatalogueDraftStore(
    state => state.setPublishedProduct,
  );
  const setPublishedService = useCatalogueDraftStore(
    state => state.setPublishedService,
  );

  return useMutation({
    mutationFn: async ({
      kind,
      status,
    }: {
      kind: CatalogueDraftKind;
      status: 'active' | 'inactive';
    }): Promise<BusinessCatalogueItem> => {
      const state = useCatalogueDraftStore.getState();
      const { primaryBranchId, remainingBranchIds } = splitBranchIds(
        kind === 'product' ? state.product.branchIds : state.service.branchIds,
      );
      if (!primaryBranchId) {
        throw new Error('Select at least one branch before publishing');
      }

      const input =
        kind === 'product'
          ? productDraftToCreateInput(state.product, primaryBranchId)
          : serviceDraftToCreateInput(state.service, primaryBranchId);

      let created = await catalogueApi.createCatalogueItem(input);
      for (const targetBranchId of remainingBranchIds) {
        await catalogueApi.importItemToBranch(created.id, targetBranchId);
      }
      if (status === 'inactive') {
        created = await catalogueApi.updateCatalogueItem(created.id, {
          status: 'inactive',
        });
      }
      return created;
    },
    onSuccess: (created, { kind }) => {
      if (kind === 'product') setPublishedProduct(created.id);
      else setPublishedService(created.id);
    },
  });
}

/** Live/draft toggle from the published-confirmation screens. */
export function useUpdateCatalogueItemStatus() {
  return useMutation({
    mutationFn: ({
      itemId,
      status,
    }: {
      itemId: string;
      status: 'active' | 'inactive';
    }): Promise<BusinessCatalogueItem> =>
      catalogueApi.updateCatalogueItem(itemId, { status }),
  });
}

export function useUpdateOfferStatus() {
  return useMutation({
    mutationFn: ({
      offerId,
      status,
    }: {
      offerId: string;
      status: 'active' | 'inactive';
    }): Promise<CatalogueOfferDetail> =>
      catalogueApi.updateCatalogueOffer(offerId, { status }),
  });
}

/**
 * Publishes the accumulated deal draft. Offers are active-by-default on
 * create, so "save as draft" creates the offer and immediately flips it to
 * `inactive`.
 */
export function usePublishCatalogueOffer() {
  const setPublishedDeal = useCatalogueDraftStore(
    state => state.setPublishedDeal,
  );

  return useMutation({
    mutationFn: async ({
      status,
      itemIds,
      branchId,
    }: {
      status: 'active' | 'inactive';
      /** Pre-resolved catalogue item ids when the draft carries none. */
      itemIds?: string[];
      branchId?: string;
    }): Promise<CatalogueOfferDetail> => {
      const { deal } = useCatalogueDraftStore.getState();
      const resolvedBranchId = branchId ?? deal.branchIds[0];
      if (!resolvedBranchId) {
        throw new Error('Select at least one branch before launching the deal');
      }

      const input = dealDraftToCreateInput(
        { ...deal, itemIds: itemIds?.length ? itemIds : deal.itemIds },
        resolvedBranchId,
      );

      let created = await catalogueApi.createCatalogueOffer(input);
      if (status === 'inactive') {
        created = await catalogueApi.updateCatalogueOffer(created.id, {
          status: 'inactive',
        });
      }
      return created;
    },
    onSuccess: created => {
      setPublishedDeal(created.id);
    },
  });
}
