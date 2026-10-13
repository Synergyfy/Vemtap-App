import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { FilterChip } from '@components/filters/FilterChip';
import { FilterSection } from '@components/filters/FilterSection';
import { Button } from '@components/ui/Button';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import type { MyClaim } from '@api/claimApi';
import type { MyGift } from '@api/giftApi';

cssInterop(View, { className: 'style' });

const copy = strings.myDealsHub.filterSheet;

/**
 * Sort options for the My Deals list.
 *
 * Deliberately **only** sorts. The API supports exactly one filter — `status`,
 * which the tabs already drive — so anything else here would be a control that
 * reorders rows client-side while pretending to filter the collection. The
 * sheet is still honest about that: it says what it does.
 */
export const MY_DEALS_SORTS = [
  { id: 'newest', label: copy.sortNewest },
  { id: 'expiring', label: copy.sortExpiring },
  { id: 'priceAsc', label: copy.sortPriceAsc },
  { id: 'priceDesc', label: copy.sortPriceDesc },
] as const;

export type MyDealsSort = (typeof MY_DEALS_SORTS)[number]['id'];

/** What the selected rows are ordered by, before the sheet ever opens. */
export const DEFAULT_MY_DEALS_SORT: MyDealsSort = 'newest';

/** A row the sorter can act on — either side of the tab bar. */
export type SortableRow = MyClaim | MyGift;

export function sortMyDeals<T extends SortableRow>(
  rows: T[],
  sort: MyDealsSort,
  priceOf: (row: T) => number,
  /** ISO timestamp; an empty string sorts a row without an expiry last. */
  expiryOf: (row: T) => string,
): T[] {
  // `newest` is the server's order (`createdAt DESC`), so it is a copy rather
  // than a re-sort — re-sorting it here would need a date the rows do not all
  // share, and would only risk disagreeing with `total`.
  if (sort === 'newest') return [...rows];

  const sorted = [...rows].sort((a, b) => {
    switch (sort) {
      case 'priceAsc':
        return priceOf(a) - priceOf(b);
      case 'priceDesc':
        return priceOf(b) - priceOf(a);
      case 'expiring':
        return expiryOf(a).localeCompare(expiryOf(b));
      default:
        return 0;
    }
  });
  return sorted;
}

export interface MyDealsFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The sort in force when the sheet opens. */
  sort: MyDealsSort;
  onApply: (sort: MyDealsSort) => void;
}

/**
 * The sort sheet opened by the navbar filter icon.
 *
 * Composes the shared `BottomSheet` shell with the shared `FilterSection` /
 * `FilterChip` primitives rather than forking a second set of controls, and
 * follows the `AnalyticsFilterSettingsSheet` pattern of holding the choice in
 * local state until Apply commits it — so closing without applying leaves the
 * list exactly as it was.
 */
export function MyDealsFilterSheet({
  visible,
  onClose,
  sort,
  onApply,
}: MyDealsFilterSheetProps) {
  const [pending, setPending] = useState<MyDealsSort>(sort);

  // Re-seed on every open so the sheet always reflects what is in force, even
  // if it changed elsewhere while the sheet was closed.
  useEffect(() => {
    if (visible) setPending(sort);
  }, [visible, sort]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      titleVariant="headingMd"
    >
      <ScrollView
        className="max-h-[70vh]"
        contentContainerClassName="gap-5 px-6 pb-2"
        showsVerticalScrollIndicator={false}
      >
        <FilterSection title={copy.sortSectionTitle} subtitle={copy.sortSectionSubtitle}>
          <View className="flex-row flex-wrap gap-2">
            {MY_DEALS_SORTS.map(option => (
              <FilterChip
                key={option.id}
                label={option.label}
                selected={option.id === pending}
                showCheck
                size="md"
                onPress={() => setPending(option.id)}
              />
            ))}
          </View>
        </FilterSection>

        <VemtapText variant="caption" tone="tertiary">
          {copy.statusNote}
        </VemtapText>
      </ScrollView>

      <View className="flex-row items-center gap-2 px-6 pb-6 pt-4">
        <Button
          label={copy.reset}
          labelVariant="labelMd"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => setPending(DEFAULT_MY_DEALS_SORT)}
        />
        <Button
          label={copy.apply}
          labelVariant="labelMd"
          size="sm"
          className="min-h-[44px] flex-1"
          onPress={() => {
            onApply(pending);
            onClose();
          }}
        />
      </View>
    </BottomSheet>
  );
}
