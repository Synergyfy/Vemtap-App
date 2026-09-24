import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { ProfilePageHeader } from '@components/discover/ProfilePageHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatNaira, type UrbanDeal } from '@features/discover/data/urbanGrillData';
import {
  urbanCover,
  urbanNearbyDeals,
  urbanProfileDeals,
} from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface UrbanGrillAllDealsProps {
  onBack: () => void;
  onOpenDeal: (dealId: string) => void;
}

function StandardDealCard({
  deal,
  onOpen,
}: {
  deal: UrbanDeal;
  onOpen: (id: string) => void;
}) {
  return (
    <View
      testID={`urban-deal-card-${deal.id}`}
      className="mb-4 w-full self-center overflow-hidden rounded-xl border border-border bg-surface-muted shadow-md"
    >
      <View className="relative h-40 bg-surface-container">
        <Image
          source={{ uri: deal.imageUri }}
          accessibilityLabel={deal.imageAlt}
          className="h-full w-full"
          resizeMode="cover"
        />
        <View className="absolute left-3 top-3 flex-row gap-1.5">
          <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText
              variant="labelSm"
              className="font-sans-bold text-badge-discount-text"
            >
              {deal.discount}
            </VemtapText>
          </View>
          <View className="rounded-full bg-surface-canvas px-2 py-0.5">
            <VemtapText variant="labelSm" className="font-sans-medium text-text">
              {deal.badge}
            </VemtapText>
          </View>
        </View>
      </View>
      <View className="gap-3 p-4">
        <View>
          <VemtapText variant="headingSm" className="text-text" numberOfLines={2}>
            {deal.title}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {deal.description}
          </VemtapText>
        </View>
        <View className="flex-row items-end justify-between gap-3">
          <View className="min-w-0 flex-1">
            <View className="min-w-0 flex-row items-baseline gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {formatNaira(deal.price)}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {formatNaira(deal.originalPrice)}
              </VemtapText>
            </View>
            <VemtapText
              variant="caption"
              className="font-sans-medium text-badge-discount-text"
            >
              {strings.urbanDeals.save(deal.save)}
            </VemtapText>
          </View>
          <Button
            label={strings.urbanDeals.claim}
            size="sm"
            fullWidth={false}
            className="shrink-0"
            rightIcon={<Icon name="arrowForward" size={16} color={colors.surface} />}
            onPress={() => onOpen(deal.id)}
          />
        </View>
      </View>
    </View>
  );
}

function NearbyDealCard({
  deal,
  onOpen,
}: {
  deal: UrbanDeal;
  onOpen: (id: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(deal.id)}
      className="flex-none flex-row gap-3 rounded-xl border border-border bg-surface-canvas p-3 shadow-md active:scale-[0.99]"
    >
      <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container">
        <Image
          source={{ uri: deal.imageUri }}
          accessibilityLabel={deal.imageAlt}
          className="h-full w-full"
          resizeMode="cover"
        />
        <View className="absolute bottom-1 left-1 rounded bg-badge-discount-bg px-1.5 py-0.5">
          <VemtapText className="font-sans-bold text-micro text-badge-discount-text">
            {deal.discount}
          </VemtapText>
        </View>
      </View>
      <View className="min-w-0 flex-1 justify-between">
        <View>
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1 truncate"
            >
              {deal.description}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="shrink-0">
              {deal.badge}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelMd"
            className="mt-0.5 font-sans-semibold text-text"
            numberOfLines={1}
          >
            {deal.title}
          </VemtapText>
        </View>
        <View className="mt-2 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-baseline gap-1">
            <VemtapText variant="labelMd" className="font-sans-bold text-text">
              {formatNaira(deal.price)}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="line-through"
              numberOfLines={1}
            >
              {formatNaira(deal.originalPrice)}
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-lg bg-surface-tint px-3 py-1.5">
            <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
              {strings.urbanDeals.viewDeal}
            </VemtapText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function UrbanGrillAllDealsScreen({
  onBack,
  onOpenDeal,
}: UrbanGrillAllDealsProps) {
  const [featured, ...deals] = urbanProfileDeals;
  return (
    <SafeAreaView edges={[]} className="flex-1 bg-surface-canvas">
      <ProfilePageHeader
        title={strings.urbanDeals.merchantDetails}
        onBack={onBack}
        right={
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.urbanDeals.share}
              className="h-11 w-11 items-center justify-center"
            >
              <Icon name="share" size={21} color={colors.textSecondary} />
            </Pressable>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Icon name="person" size={18} color={colors.surface} />
            </View>
          </>
        }
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-screen flex-grow-0 self-center pb-6"
      >
        <View className="px-6 pb-1 pt-4">
          <View className="rounded-xl border border-border bg-surface-muted p-4 shadow-md">
            <View className="flex-row items-center gap-3">
              <View className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-container">
                <Image
                  source={{ uri: urbanCover.uri }}
                  accessibilityLabel={urbanCover.alt}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 right-0 h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Icon name="verified" size={11} color={colors.surface} />
                </View>
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="headingSm" className="text-text" numberOfLines={1}>
                  {strings.urbanDeals.name}
                </VemtapText>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Icon name="star" size={16} color={colors.tertiary} />
                  <VemtapText variant="labelSm" className="font-sans-semibold text-text">
                    {strings.urbanDeals.rating}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary">
                    {strings.urbanDeals.reviews}
                  </VemtapText>
                </View>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-medium text-badge-discount-text"
                    numberOfLines={1}
                  >
                    {strings.urbanDeals.activeOffers}
                  </VemtapText>
                </View>
              </View>
            </View>
            <View className="mt-3 flex-row items-center justify-between gap-2 rounded-lg bg-surface-canvas px-3 py-2">
              <View className="min-w-0 flex-row items-center gap-1.5">
                <Icon name="nearMe" size={16} color={colors.primary} />
                <VemtapText
                  variant="caption"
                  className="font-sans-medium text-text"
                  numberOfLines={1}
                >
                  {strings.urbanDeals.distance}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  •
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {strings.urbanDeals.area}
                </VemtapText>
              </View>
              <View className="shrink-0 flex-row items-center gap-1">
                <Icon name="restaurant" size={14} color={colors.primary} />
                <VemtapText variant="caption" tone="brand" className="font-sans-medium">
                  {strings.urbanDeals.service}
                </VemtapText>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-3 px-6 py-4">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1">
              <VemtapText
                accessibilityRole="header"
                variant="headingSm"
                className="text-text"
              >
                {strings.urbanDeals.currentDeals}
              </VemtapText>
              <VemtapText variant="labelSm" tone="tertiary">
                {strings.urbanDeals.count(urbanProfileDeals.length)}
              </VemtapText>
            </View>
            <View className="min-w-0 flex-row items-center gap-2">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-shrink"
                numberOfLines={1}
              >
                {strings.urbanDeals.exclusive}
              </VemtapText>
              <View className="shrink-0 flex-row items-center rounded-lg bg-surface-muted p-0.5">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={strings.urbanDeals.listView}
                  className="h-8 w-8 items-center justify-center rounded-md bg-surface-canvas shadow-sm"
                >
                  <Icon name="listView" size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={strings.urbanDeals.gridView}
                  className="h-8 w-8 items-center justify-center rounded-md"
                >
                  <Icon name="gridView" size={18} color={colors.textTertiary} />
                </Pressable>
              </View>
            </View>
          </View>
          <View
            testID="urban-deal-featured-card"
            className="w-full self-center overflow-hidden rounded-xl border border-border bg-surface-canvas shadow-md"
          >
            <View className="relative h-48 bg-surface-container">
              <Image
                source={{ uri: featured.imageUri }}
                accessibilityLabel={featured.imageAlt}
                className="h-full w-full"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-surface-dark/60" />
              <View className="absolute left-3 top-3 flex-row gap-1.5">
                <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-bold text-badge-discount-text"
                  >
                    {featured.discount}
                  </VemtapText>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-surface-canvas px-2 py-0.5">
                  <Icon name="schedule" size={14} color={colors.tertiary} />
                  <VemtapText variant="labelSm" className="font-sans-medium text-text">
                    {featured.timing}
                  </VemtapText>
                </View>
              </View>
              <View className="absolute right-3 top-3 rounded-full bg-primary-container px-2 py-0.5">
                <VemtapText variant="labelSm" tone="inverse">
                  {featured.badge}
                </VemtapText>
              </View>
              <View className="absolute inset-x-3 bottom-3">
                <VemtapText
                  variant="caption"
                  className="font-sans-medium text-surface-muted"
                >
                  {featured.description}
                </VemtapText>
                <VemtapText
                  variant="headingSm"
                  className="text-text-inverse"
                  numberOfLines={1}
                >
                  {featured.title}
                </VemtapText>
              </View>
            </View>
            <View className="gap-3 bg-surface-muted p-4">
              <View className="flex-row justify-between gap-3">
                <View>
                  <View className="flex-row items-baseline gap-2">
                    <VemtapText variant="headingMd" className="text-text">
                      {formatNaira(featured.price)}
                    </VemtapText>
                    <VemtapText tone="tertiary" className="line-through">
                      {formatNaira(featured.originalPrice)}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-badge-discount-text"
                  >
                    {strings.urbanDeals.save(featured.save)}
                  </VemtapText>
                </View>
                <View className="shrink-0 items-end">
                  <View className="flex-row items-center gap-1">
                    <Icon name="voucher" size={14} color={colors.textSecondary} />
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {strings.urbanDeals.oneVoucher}
                    </VemtapText>
                  </View>
                  <VemtapText variant="caption" tone="tertiary">
                    {strings.urbanDeals.validLunch}
                  </VemtapText>
                </View>
              </View>
              <Button
                label={strings.urbanDeals.claim}
                leftIcon={<Icon name="localActivity" size={20} color={colors.surface} />}
                onPress={() => onOpenDeal(featured.id)}
              />
            </View>
          </View>
          {deals.map(deal => (
            <StandardDealCard key={deal.id} deal={deal} onOpen={onOpenDeal} />
          ))}
        </View>

        <View className="mt-3 bg-surface-container-low px-6 pb-8 pt-6">
          <View className="mb-4">
            <View className="mb-1 flex-row items-center gap-1.5">
              <Icon name="explore" size={18} color={colors.primary} />
              <VemtapText
                variant="labelSm"
                tone="brand"
                className="font-sans-semibold uppercase tracking-wider"
              >
                {strings.urbanDeals.exploreNeighborhood}
              </VemtapText>
            </View>
            <VemtapText
              accessibilityRole="header"
              variant="headingSm"
              className="text-text"
            >
              {strings.urbanDeals.nearbyTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {strings.urbanDeals.nearbyCopy}
            </VemtapText>
          </View>
          <View className="gap-3">
            {urbanNearbyDeals.map(deal => (
              <NearbyDealCard key={deal.id} deal={deal} onOpen={onOpenDeal} />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            className="mt-6 flex-row flex-wrap items-center justify-center gap-1"
          >
            <VemtapText variant="caption" tone="secondary" className="text-center">
              {strings.urbanDeals.ownBusiness}
            </VemtapText>
            <VemtapText variant="caption" tone="brand" className="font-sans-semibold">
              {strings.urbanDeals.setUp}
            </VemtapText>
            <Icon name="arrowForward" size={14} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
