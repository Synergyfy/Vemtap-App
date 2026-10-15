import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState } from '@components/shared/EmptyState';
import { LoadingState } from '@components/shared/LoadingState';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessCheckRow } from '@features/business/components/BusinessPrimitives';
import { formatNaira } from '@features/business/data/businessSetupData';

const copy = strings.dealItemPicker;

/** A live catalogue item that can go into a deal. */
export interface DealPickerItem {
  id: string;
  name: string;
  price: number;
  kind: 'product' | 'service';
  category?: string;
  image?: string;
}

export interface DealItemPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  items: DealPickerItem[];
  /** Pre-ticked when the sheet opens (the deal's current items). */
  selectedIds: string[];
  onConfirm: (items: DealPickerItem[]) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

/**
 * Picks the catalogue items a deal covers. Several items make a bundle, so it
 * is a multi-select; the running total is the price the deal discounts from.
 * Only live items are offered — a deal on an unpublished item is hidden from
 * customers anyway.
 */
export function DealItemPickerSheet({
  visible,
  onClose,
  items,
  selectedIds,
  onConfirm,
  isLoading = false,
  isError = false,
  onRetry,
}: DealItemPickerSheetProps) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>(selectedIds);

  // Each opening starts from the deal's current items and a clear search.
  useEffect(() => {
    if (visible) {
      setPicked(selectedIds);
      setQuery('');
    }
    // Only re-seed on open; `selectedIds` is a new array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const needle = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      needle
        ? items.filter(
            item =>
              item.name.toLowerCase().includes(needle) ||
              (item.category ?? '').toLowerCase().includes(needle),
          )
        : items,
    [items, needle],
  );
  const chosen = items.filter(item => picked.includes(item.id));
  const total = chosen.reduce((sum, item) => sum + item.price, 0);

  const toggle = (id: string) =>
    setPicked(current =>
      current.includes(id) ? current.filter(entry => entry !== id) : [...current, id],
    );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      {isLoading ? (
        <LoadingState label={copy.loading} className="py-10" />
      ) : isError ? (
        <EmptyState title={copy.loadError} actionLabel={copy.retry} onAction={onRetry} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="inventory"
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : (
        <View className="gap-3 pb-4">
          <View className="px-6">
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder={copy.searchPlaceholder}
              accessibilityLabel={copy.searchPlaceholder}
              autoCorrect={false}
              returnKeyType="search"
              leadingIcon={<Icon name="search" size={18} color={colors.textSecondary} />}
              trailingIcon={
                query ? (
                  <Icon name="close" size={18} color={colors.textSecondary} />
                ) : undefined
              }
              onTrailingIconPress={query ? () => setQuery('') : undefined}
              trailingIconLabel={copy.clearSearch}
            />
          </View>
          <ScrollView
            className="max-h-[360px]"
            contentContainerClassName="gap-2 px-6"
            keyboardShouldPersistTaps="handled"
          >
            {shown.length ? (
              shown.map(item => (
                <BusinessCheckRow
                  key={item.id}
                  title={item.name}
                  subtitle={[
                    item.kind === 'service' ? copy.service : copy.product,
                    item.category,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  selected={picked.includes(item.id)}
                  onPress={() => toggle(item.id)}
                  trailing={
                    <VemtapText variant="labelMd" className="font-sans-semibold">
                      {formatNaira(item.price)}
                    </VemtapText>
                  }
                />
              ))
            ) : (
              <EmptyState
                title={copy.noMatchTitle}
                description={copy.noMatchBody}
                className="px-0"
              />
            )}
          </ScrollView>
          <View className="gap-2 px-6">
            <VemtapText variant="caption" tone="secondary" className="text-center">
              {copy.selectedSummary(chosen.length, formatNaira(total))}
            </VemtapText>
            <Button
              label={copy.confirm(chosen.length)}
              labelVariant="labelMd"
              disabled={!chosen.length}
              onPress={() => onConfirm(chosen)}
            />
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
