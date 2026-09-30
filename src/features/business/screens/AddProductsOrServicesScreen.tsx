import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessCatalogCopy as copy } from '@features/business/businessCopy';
import { catalogItems, type CatalogItem } from '@features/business/businessData';
import {
  PrimaryActionButton,
  SetupStepBar,
  StatusPill,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  AddChoiceCard,
  CatalogItemCard,
} from '@features/business/components/BusinessSetupCards';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface BusinessCatalogValue {
  items: CatalogItem[];
}

export interface AddProductsOrServicesScreenProps {
  onBack?: () => void;
  onContinue?: (value: BusinessCatalogValue) => void;
  onSkip?: () => void;
  onAddProduct?: () => void;
  onAddService?: () => void;
  onAddAnother?: () => void;
  onEditItem?: (item: CatalogItem) => void;
  onRemoveItem?: (item: CatalogItem) => void;
  onFilter?: () => void;
  items?: CatalogItem[];
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/add_products_or_services/code.html
 */
export function AddProductsOrServicesScreen({
  onBack,
  onContinue,
  onSkip,
  onAddProduct,
  onAddService,
  onAddAnother,
  onEditItem,
  onRemoveItem,
  onFilter,
  items = catalogItems,
}: AddProductsOrServicesScreenProps) {
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const onToggleFilter = useCallback(() => onFilter?.(), [onFilter]);

  const visibleItems = useMemo(
    () => items.filter(item => !removedIds.includes(item.id)),
    [items, removedIds],
  );

  const onRemove = useCallback(
    (item: CatalogItem) => {
      setRemovedIds(current =>
        current.includes(item.id) ? current : [...current, item.id],
      );
      onRemoveItem?.(item);
    },
    [onRemoveItem],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader
        title={copy.header}
        onBack={handleBack}
        compactTitle
        progress={{ activeIndex: 1, total: 3 }}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SetupStepBar
          step={copy.step}
          percent={copy.percent}
          progress={75}
          dot
          className="gap-3"
        />

        <View className="gap-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="text-heading-sm"
          >
            {copy.title}
          </VemtapText>
          <VemtapText tone="secondary" className="leading-relaxed">
            {copy.subtitle}
          </VemtapText>
        </View>

        <View className="gap-4">
          <View className="flex-row gap-3">
            <AddChoiceCard
              icon="shoppingBag"
              title={copy.addProduct}
              body={copy.addProductBody}
              tone="brand"
              onPress={onAddProduct}
            />
            <AddChoiceCard
              icon="autoAwesome"
              title={copy.addService}
              body={copy.addServiceBody}
              tone="tertiary"
              onPress={onAddService}
            />
          </View>

          <View className="flex-row items-start gap-3 rounded-card bg-surface-subtle p-4">
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container">
              <Icon name="sync" size={18} color={colors.onSecondaryContainer} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {copy.availabilityTitle}
                </VemtapText>
                <View className="rounded-full bg-badge-discount-bg px-1.5 py-0.5">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold uppercase tracking-wider text-badge-discount-text"
                  >
                    {copy.availabilityBadge}
                  </VemtapText>
                </View>
              </View>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-1 leading-relaxed"
              >
                {copy.availabilityLead}{' '}
                <VemtapText className="font-sans-semibold text-text">
                  {copy.availabilityHighlight}
                </VemtapText>{' '}
                {copy.availabilityTail}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <View className="min-w-0 flex-row items-center gap-1.5">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {copy.currentCatalog}
              </VemtapText>
              <StatusPill
                label={String(visibleItems.length)}
                tone="neutral"
                className="px-2 py-0.5"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.filter}
              onPress={onToggleFilter}
              hitSlop={6}
              className="min-h-[36px] flex-row items-center gap-0.5 px-1 active:opacity-70"
            >
              <Icon name="tune" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" className="text-primary">
                {copy.filter}
              </VemtapText>
            </Pressable>
          </View>

          <View className="gap-3">
            {visibleItems.map(item => (
              <CatalogItemCard
                key={item.id}
                item={item}
                onEdit={() => onEditItem?.(item)}
                onRemove={() => onRemove(item)}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.addAnother}
            onPress={onAddAnother}
            className="mt-1 w-full flex-row items-center justify-center gap-1.5 rounded-field bg-surface-subtle px-4 py-3 active:scale-[0.99]"
          >
            <Icon name="plusCircle" size={20} color={colors.primary} />
            <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
              {copy.addAnother}
            </VemtapText>
          </Pressable>
        </View>
      </ScrollView>

      <View className="gap-3 px-6 pb-3 pt-0">
        <PrimaryActionButton
          label={copy.continue}
          onPress={() => onContinue?.({ items: visibleItems })}
        />
        <TextActionButton label={copy.skip} onPress={onSkip ?? onBack} />
      </View>
    </SafeAreaView>
  );
}
