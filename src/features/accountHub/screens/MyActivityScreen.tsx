import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccountHeader,
  ActivityTimelineRow,
  PageScroll,
  StatCard,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

const copy = strings.accountScreens.activity;

export interface MyActivityScreenProps {
  onBack?: () => void;
  onMore?: () => void;
  onDateFilter?: () => void;
  onViewReceipt?: () => void;
  onWriteReview?: () => void;
  onOpenDeal?: (id: string) => void;
}

export function MyActivityScreen({
  onBack,
  onMore,
  onDateFilter,
  onViewReceipt,
  onWriteReview,
  onOpenDeal,
}: MyActivityScreenProps) {
  const [tab, setTab] = useState(0);
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <AccountHeader title={copy.title} onBack={onBack} onAction={onMore} />
      <PageScroll>
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-row items-center gap-2">
            <Icon name="verifiedUser" size={18} color={colors.primary} />
            <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
              {copy.verified}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={onDateFilter}
              className="flex-row items-center gap-1 rounded-full bg-surface-container-low px-3 py-2"
            >
              <Icon name="eventAvailable" size={15} color={colors.primary} />
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {copy.month}
              </VemtapText>
              <Icon name="expandMore" size={14} color={colors.textSecondary} />
            </Pressable>
            <Button
              label="Filter"
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={onMore}
              leftIcon={<Icon name="tune" size={16} color={colors.primary} />}
            />
          </View>
        </View>
        <View className="gap-3 rounded-card bg-surface-container-low p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <VemtapText variant="labelSm" tone="secondary" className="uppercase">
              {copy.footprint}
            </VemtapText>
            <VemtapText variant="caption" tone="success">
              ↗ {copy.topSaver}
            </VemtapText>
          </View>
          <View className="flex-row gap-2">
            <StatCard icon="wallet" value="₦48,500" label={copy.totalSaved} />
            <StatCard icon="localActivity" value="14" label={copy.claimed} />
            <StatCard icon="storefront" value="8" label={copy.visited} />
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {[copy.all, copy.recent, copy.visits, copy.reviews].map((label, index) => (
            <Pressable
              key={label}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === index }}
              onPress={() => setTab(index)}
              className={`rounded-full px-4 py-2 shadow-sm ${tab === index ? 'bg-surface-tint' : 'bg-surface'}`}
            >
              <VemtapText variant="labelSm" tone={tab === index ? 'brand' : 'secondary'}>
                {label}
              </VemtapText>
            </Pressable>
          ))}
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <View className="flex-row items-center gap-2">
              <Icon name="storefront" size={20} color={colors.primary} />
              <VemtapText variant="headingSm">{copy.recentHeading}</VemtapText>
            </View>
            <VemtapText variant="caption" tone="tertiary">
              {copy.recentMeta}
            </VemtapText>
          </View>
          <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
            <ActivityTimelineRow
              title={copy.urban}
              subtitle={`${copy.urbanDeal} • Oct 15, 2024 • Apo Blvd`}
              amount={copy.saved}
              positive
              icon="restaurant"
            />
            <ActivityTimelineRow
              title={copy.bakery}
              subtitle={`${copy.bakeryMeta} • Oct 11, 2024 • Wuse II`}
              amount="Visited"
              icon="cafe"
            />
          </View>
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <View className="flex-row items-center gap-2">
              <Icon name="visibility" size={20} color={colors.primary} />
              <VemtapText variant="headingSm">{copy.viewed}</VemtapText>
            </View>
            <VemtapText variant="labelSm" tone="brand">
              {copy.clear}
            </VemtapText>
          </View>
          <View className="flex-row gap-3">
            <View className="min-w-0 flex-1 gap-2 rounded-card bg-surface p-3 shadow-sm">
              <View className="h-24 items-center justify-center rounded-field bg-surface-container">
                <Icon name="spa" size={28} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="tertiary">
                Glow &amp; Serenity Spa
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.spa}
              </VemtapText>
              <VemtapText variant="labelSm" tone="brand">
                ₦18,500
              </VemtapText>
              <Button
                label={copy.viewDeal}
                variant="secondary"
                size="sm"
                onPress={() => onOpenDeal?.('spa-glow')}
              />
            </View>
            <View className="min-w-0 flex-1 gap-2 rounded-card bg-surface p-3 shadow-sm">
              <View className="h-24 items-center justify-center rounded-field bg-surface-container">
                <Icon name="restaurant" size={28} color={colors.tertiary} />
              </View>
              <VemtapText variant="caption" tone="tertiary">
                The Sky Lounge
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.sky}
              </VemtapText>
              <VemtapText variant="labelSm" tone="brand">
                ₦24,500
              </VemtapText>
              <Button
                label={copy.viewDeal}
                variant="secondary"
                size="sm"
                onPress={() => onOpenDeal?.('sky-menu')}
              />
            </View>
          </View>
        </View>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <View className="flex-row items-center gap-2">
              <Icon name="comment" size={20} color={colors.primary} />
              <VemtapText variant="headingSm">{copy.myReviews}</VemtapText>
            </View>
            <VemtapText variant="labelSm" tone="brand">
              {copy.seeAll}
            </VemtapText>
          </View>
          <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row justify-between">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                Urban Grill &amp; Bistro
              </VemtapText>
              <VemtapText variant="labelSm" tone="brand">
                ★★★★★
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary">
              Great service and the lunch deal was worth every naira.
            </VemtapText>
            <View className="flex-row gap-2">
              <Button
                label={copy.receipt}
                variant="secondary"
                size="sm"
                onPress={onViewReceipt}
              />
              <Button label={copy.review} size="sm" onPress={onWriteReview} />
            </View>
          </View>
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}
