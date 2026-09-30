import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { typeMetrics } from '@theme/typography';
import { colors } from '@theme/colors';
import {
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessSelectionChip,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

const copy = strings.businessPos;

const channelTone: Record<string, string> = {
  brand: 'bg-primary text-primary-foreground',
  neutral: 'bg-surface-container text-text-secondary',
  success: 'bg-badge-discount-bg text-badge-discount-text',
};

export interface BusinessPosOrdersViewScreenProps {
  onBack: () => void;
  onOpenBranchSwitcher?: () => void;
  onOpenPos?: () => void;
  onOpenOrder?: (id: string) => void;
  onPrintReceipt?: (id: string) => void;
}

export function BusinessPosOrdersViewScreen({
  onBack,
  onOpenBranchSwitcher,
  onOpenPos,
  onOpenOrder,
  onPrintReceipt,
}: BusinessPosOrdersViewScreenProps) {
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');

  const visible = copy.orders.filter(order => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return `${order.reference} ${order.method} ${order.meta} ${order.total}`
      .toLowerCase()
      .includes(term);
  });

  // This is a dense register list: scanning many tickets, not reading prose.
  // The compact density tightens the whole subtree — navbar included — instead
  // of hand-tuning sizes per row.
  return (
    <TypeDensityProvider density="compact">
      <BusinessScreenLayout
        header={{
          title: copy.title,
          onBack,
          showAvatar: true,
          // A crowded bar drops the navbar title a step rather than shrinking
          // every glyph on the page.
          titleVariant: 'labelMd',
          accessory: (
            <BusinessInlineAction
              label={copy.branch}
              icon="storefront"
              onPress={onOpenBranchSwitcher}
            />
          ),
        }}
        contentContainerClassName="pb-8"
      >
        <View className="relative">
          <View className="absolute left-3 top-3 z-10">
            <Icon name="search" size={18} color={colors.textTertiary} />
          </View>
          <TextInput
            accessibilityLabel={copy.searchPlaceholder}
            value={query}
            onChangeText={setQuery}
            placeholder={copy.searchPlaceholder}
            placeholderTextColor={colors.textTertiary}
            className="h-11 w-full rounded-field bg-surface-container-lowest pl-10 pr-3 text-text shadow-sm"
            style={typeMetrics('label-md', 'compact')}
          />
        </View>

        <View className="-mx-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-6 py-1"
          >
            {copy.filters.map((item, index) => (
              <BusinessSelectionChip
                key={item.label}
                label={`${item.label} (${item.count})`}
                selected={index === filter}
                onPress={() => setFilter(index)}
                tone="neutral"
              />
            ))}
          </ScrollView>
        </View>

        <View className="rounded-card bg-surface-container-low p-3.5 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                {copy.terminalName}
              </VemtapText>
              <View className="mt-0.5 flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full bg-success" />
                <VemtapText variant="caption" className="text-success" numberOfLines={1}>
                  {copy.terminalStatus}
                </VemtapText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.openPos}
              onPress={onOpenPos}
              className="shrink-0 items-end"
            >
              <VemtapText
                variant="caption"
                tone="brand"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.openPos}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {copy.volumeValue}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.volumeMeta}
              </VemtapText>
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.activityTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary">
            {copy.today}
          </VemtapText>
        </View>

        <View className="gap-3">
          {visible.map(order => (
            <SetupCard key={order.reference} className="gap-3">
              <View className="flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-bold"
                    numberOfLines={1}
                  >
                    {order.reference}
                  </VemtapText>
                  <View
                    className={cn(
                      'rounded-full px-2 py-0.5',
                      channelTone[order.channelTone] ?? channelTone.neutral,
                    )}
                  >
                    <VemtapText variant="micro" className="font-sans-semibold">
                      {order.channel}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText variant="caption" tone="tertiary" className="shrink-0">
                  {order.time}
                </VemtapText>
              </View>

              {order.items.length ? (
                <View className="gap-1.5">
                  {order.items.map(item => (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between gap-2"
                    >
                      <VemtapText
                        variant="labelSm"
                        tone="secondary"
                        className="min-w-0 flex-1"
                        numberOfLines={1}
                      >
                        {item.name}
                      </VemtapText>
                      <VemtapText
                        variant="labelSm"
                        className="shrink-0 font-sans-semibold"
                      >
                        {item.price}
                      </VemtapText>
                    </View>
                  ))}
                </View>
              ) : null}

              {order.dealTitle ? (
                <View className="flex-row items-start gap-2 rounded-lg bg-badge-discount-bg p-2.5">
                  <View className="pt-0.5">
                    <Icon name="localOffer" size={15} color={colors.badgeDiscountText} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-badge-discount-text"
                      numberOfLines={1}
                    >
                      {order.dealTitle}
                    </VemtapText>
                    <VemtapText
                      variant="micro"
                      className="text-badge-discount-text"
                      numberOfLines={1}
                    >
                      {order.dealMeta}
                    </VemtapText>
                  </View>
                </View>
              ) : null}

              <View className="flex-row items-start gap-2">
                <View className="pt-0.5">
                  <Icon name="payments" size={14} color={colors.textSecondary} />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                    {order.method}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {order.meta}
                  </VemtapText>
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-2 border-t border-border pt-2.5">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={order.reference}
                  onPress={() => onOpenOrder?.(order.id)}
                  className="min-w-0 flex-1 flex-row items-center gap-1.5"
                >
                  <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
                    {order.totalLabel}
                  </VemtapText>
                  <Icon name="arrowForward" size={14} color={colors.textTertiary} />
                </Pressable>
                <VemtapText
                  variant="labelMd"
                  className="shrink-0 font-sans-bold text-primary"
                >
                  {order.total}
                </VemtapText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${order.reference} receipt`}
                  onPress={() => onPrintReceipt?.(order.id)}
                  className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container"
                >
                  <Icon name="receipt" size={15} color={colors.primary} />
                </Pressable>
              </View>
            </SetupCard>
          ))}
        </View>
      </BusinessScreenLayout>
    </TypeDensityProvider>
  );
}
