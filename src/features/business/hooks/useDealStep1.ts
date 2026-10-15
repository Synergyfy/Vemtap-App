import { useState } from 'react';
import { strings } from '@constants/strings';
import { useCatalogueDraftStore, type DealDraft } from '@store/catalogueDraftStore';
import {
  ALL_BRANCHES_SCOPE,
  useBusinessCatalogue,
} from '@features/business/hooks/useBusinessCatalogue';
import {
  clampDealRate,
  type CreateDealStep1DiscountStrategyScreenProps,
} from '@features/business/screens/CreateDealStep1DiscountStrategyScreen';
import type {
  DealItemPickerSheetProps,
  DealPickerItem,
} from '@features/business/components/DealItemPickerSheet';

const copy = strings.businessCreateDeal.step1;

type Step1Props = Pick<
  CreateDealStep1DiscountStrategyScreenProps,
  'initialValue' | 'item' | 'needsItem' | 'onContinue' | 'onSave' | 'onChangeItem'
>;
type PickerProps = Omit<DealItemPickerSheetProps, 'onClose'> & { onClose: () => void };

/**
 * Step 1 of the deal wizard, shared by the Business-hub and setup-flow
 * navigators: which items the deal covers (via the item picker) and its
 * discount. A deal started with no item opens the picker straight away.
 */
export function useDealStep1(goNext: () => void): {
  screenProps: Step1Props;
  pickerProps: PickerProps;
} {
  const deal = useCatalogueDraftStore(state => state.deal);
  const setDeal = useCatalogueDraftStore(state => state.setDeal);
  const catalogue = useBusinessCatalogue(undefined, ALL_BRANCHES_SCOPE);

  const hasItems = deal.itemIds.length > 0 || Boolean(deal.sourceProductId);
  const [pickerOpen, setPickerOpen] = useState(!hasItems);

  // A deal on an unpublished item never reaches customers, so offer live ones.
  const pickable: DealPickerItem[] = (catalogue.data?.data ?? [])
    .filter(item => item.status === 'active' && !item.isSuspended)
    .map(item => ({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      kind: item.itemType === 'service' ? 'service' : 'product',
      category: item.category?.name ?? undefined,
      image: item.mainImage ?? undefined,
    }));
  const priceOf = new Map(pickable.map(item => [item.id, item.price]));
  const basePrice =
    deal.basePrice ??
    (deal.itemIds.length && deal.itemIds.every(id => priceOf.has(id))
      ? deal.itemIds.reduce((sum, id) => sum + (priceOf.get(id) ?? 0), 0)
      : undefined);

  // Editing starts from the deal as the slider can show it, and only writes
  // back a change — an untouched fixed-price deal keeps its pricing.
  const initial = deal.editingDealGroupId
    ? { strategy: deal.strategy, discountRate: clampDealRate(deal.discountRate) }
    : undefined;
  const commit = (value: { strategy: DealDraft['strategy']; discountRate: number }) => {
    const untouched =
      initial &&
      value.strategy === initial.strategy &&
      value.discountRate === initial.discountRate;
    if (!untouched) {
      setDeal({ strategy: value.strategy, discountRate: value.discountRate });
    }
    goNext();
  };

  const chooseItems = (items: DealPickerItem[]) => {
    const [first, ...rest] = items;
    if (!first) return;
    const label = rest.length ? copy.bundleName(first.name, rest.length) : first.name;
    const autoName = deal.sourceProductName
      ? copy.autoDealName(deal.sourceProductName)
      : '';
    // Keep a name the owner typed; replace one we generated from the old items.
    const keepName = deal.name.trim() !== '' && deal.name !== autoName;
    setDeal({
      itemIds: items.map(item => item.id),
      sourceProductId: items.length === 1 ? first.id : undefined,
      sourceProductName: label,
      name: keepName ? deal.name : copy.autoDealName(label),
      mainImage: items.find(item => item.image)?.image,
      basePrice: items.reduce((sum, item) => sum + item.price, 0),
    });
    setPickerOpen(false);
  };

  return {
    screenProps: {
      initialValue: initial,
      needsItem: !hasItems,
      // Show the real item even before its price loads; never the prototype.
      item: hasItems
        ? {
            name: deal.sourceProductName || deal.name,
            image: deal.mainImage,
            basePrice: basePrice ?? 0,
            meta: copy.itemsMeta(Math.max(1, deal.itemIds.length)),
          }
        : undefined,
      onContinue: commit,
      onSave: commit,
      onChangeItem: () => setPickerOpen(true),
    },
    pickerProps: {
      visible: pickerOpen,
      onClose: () => setPickerOpen(false),
      items: pickable,
      selectedIds: deal.itemIds,
      onConfirm: chooseItems,
      isLoading: catalogue.isLoading,
      isError: catalogue.isError,
      onRetry: () => catalogue.refetch(),
    },
  };
}
