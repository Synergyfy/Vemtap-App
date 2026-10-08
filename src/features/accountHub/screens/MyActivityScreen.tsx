import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import {
  AccountHeader,
  PageScroll,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { activityImages } from '@features/accountHub/data/accountHubImages';
import { useLoyaltyAnalytics } from '@features/accountHub/hooks/useLoyalty';
import { formatCurrency } from '@utils/formatters';

cssInterop(Image, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

function FootprintMetric({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-field bg-surface-canvas p-2.5 shadow-sm">
      <Icon name={icon} size={16} color={colors.primary} />
      <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
        {value}
      </VemtapText>
      <VemtapText variant="caption" tone="tertiary" numberOfLines={2}>
        {label}
      </VemtapText>
    </View>
  );
}

function VisitCard({
  image,
  title,
  subtitle,
  meta,
  location,
  trailing,
  trailingTone = 'neutral',
  verified,
  actions,
}: {
  image: { uri: string; alt: string };
  title: string;
  subtitle: string;
  meta: string;
  location: string;
  trailing: string;
  trailingTone?: 'success' | 'neutral';
  verified?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <View className="gap-3 rounded-card bg-surface-canvas p-4 shadow-sm">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-start gap-3">
          <Image
            source={image}
            accessibilityLabel={image.alt}
            className="h-12 w-12 shrink-0 rounded-field bg-surface-container"
            resizeMode="cover"
          />
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
              >
                {title}
              </VemtapText>
              {verified ? (
                <Icon name="verified" size={16} color={colors.primary} />
              ) : (
                <View className="shrink-0 rounded-full bg-surface-container px-2 py-0.5">
                  <VemtapText variant="caption" tone="secondary">
                    {trailing}
                  </VemtapText>
                </View>
              )}
            </View>
            <VemtapText
              variant="labelSm"
              tone="brand"
              className="mt-0.5"
              numberOfLines={2}
            >
              {subtitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="mt-1"
              numberOfLines={2}
            >
              {meta} • {location}
            </VemtapText>
          </View>
        </View>
        {verified ? (
          <View className="shrink-0 rounded-full bg-badge-discount-bg px-2 py-1">
            <VemtapText
              variant="caption"
              className={
                trailingTone === 'success'
                  ? 'font-sans-semibold text-badge-discount-text'
                  : 'text-text-secondary'
              }
              numberOfLines={1}
            >
              {trailing}
            </VemtapText>
          </View>
        ) : (
          <Icon name="forward" size={20} color={colors.textTertiary} />
        )}
      </View>
      {actions ? (
        <View className="flex-row flex-wrap justify-end gap-2">{actions}</View>
      ) : null}
    </View>
  );
}

function ViewedCard({
  image,
  badge,
  business,
  title,
  price,
  oldPrice,
  note,
  onPress,
}: {
  image: { uri: string; alt: string };
  badge?: string;
  business: string;
  title: string;
  price: string;
  oldPrice?: string;
  note?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-56 shrink-0 overflow-hidden rounded-card bg-surface-canvas shadow-sm"
    >
      <View className="relative h-28 w-full bg-surface-container">
        <Image
          source={image}
          accessibilityLabel={image.alt}
          className="h-full w-full"
          resizeMode="cover"
        />
        {badge ? (
          <View className="absolute left-2 top-2 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
              numberOfLines={1}
            >
              {badge}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className="gap-1 p-3">
        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
          {business}
        </VemtapText>
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
          {title}
        </VemtapText>
        <View className="mt-1 flex-row items-baseline gap-1.5">
          <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
            {price}
          </VemtapText>
          {oldPrice ? (
            <VemtapText variant="caption" tone="tertiary" className="line-through">
              {oldPrice}
            </VemtapText>
          ) : null}
          {note ? (
            <VemtapText variant="caption" tone="success" numberOfLines={1}>
              {note}
            </VemtapText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

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
  const { data: analytics } = useLoyaltyAnalytics(365);
  const trends = analytics?.trends ?? null;
  const totalSaved = trends?.netSavings ?? 0;
  const totalVisited = trends?.totalVisits ?? 0;
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <AccountHeader title={copy.title} onBack={onBack} onAction={onMore} />
      <PageScroll>
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="verifiedUser" size={18} color={colors.primary} />
            <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
              {copy.verified}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.month}
              onPress={onDateFilter}
              className="flex-row items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5"
            >
              <Icon name="eventAvailable" size={15} color={colors.primary} />
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {copy.month}
              </VemtapText>
              <Icon name="expandMore" size={14} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.filter}
              onPress={onMore}
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-low"
            >
              <Icon name="tune" size={17} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View className="gap-3 rounded-card bg-surface-container-low p-4 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelSm"
              tone="secondary"
              className="min-w-0 flex-1 uppercase"
              numberOfLines={1}
            >
              {copy.footprint}
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
              <Icon name="trendingUp" size={12} color={colors.badgeDiscountText} />
              <VemtapText
                variant="caption"
                className="font-sans-semibold text-badge-discount-text"
                numberOfLines={1}
              >
                {copy.topSaver}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row gap-2">
            <FootprintMetric
              icon="wallet"
              value={formatCurrency(totalSaved)}
              label={copy.totalSaved}
            />
            <FootprintMetric icon="localActivity" value="14" label={copy.claimed} />
            <FootprintMetric
              icon="storefront"
              value={String(totalVisited)}
              label={copy.visited}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2"
        >
          {(
            [
              { label: copy.all, icon: 'dynamicFeed' },
              { label: copy.recent, icon: 'history' },
              { label: copy.visits, icon: 'receipt' },
              { label: copy.reviews, icon: 'rateReview' },
            ] as { label: string; icon: IconName }[]
          ).map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === index }}
              onPress={() => setTab(index)}
              className={`h-9 shrink-0 flex-row items-center gap-1.5 rounded-full px-4 shadow-sm ${
                tab === index ? 'bg-surface-tint-blue' : 'bg-surface-canvas'
              }`}
            >
              <Icon
                name={item.icon}
                size={16}
                color={tab === index ? colors.primary : colors.textSecondary}
              />
              <VemtapText variant="labelSm" tone={tab === index ? 'brand' : 'secondary'}>
                {item.label}
              </VemtapText>
            </Pressable>
          ))}
        </ScrollView>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="storefront" size={20} color={colors.primary} />
              <VemtapText variant="bodyMd" className="flex-1 font-sans-semibold">
                {copy.recentHeading}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="tertiary" className="shrink-0">
              {copy.recentMeta}
            </VemtapText>
          </View>
          <View className="gap-3">
            <VisitCard
              image={activityImages.urbanGrill}
              title={copy.urban}
              subtitle={copy.urbanDeal}
              meta="Oct 15, 2024 • 1:15 PM"
              location="Apo Blvd"
              trailing={copy.saved}
              trailingTone="success"
              verified
              actions={
                <>
                  <Button
                    label={copy.receipt}
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                    labelVariant="labelMd"
                    leftIcon={
                      <Icon name="receipt" size={16} color={colors.textSecondary} />
                    }
                    onPress={onViewReceipt}
                  />
                  <Button
                    label={copy.review}
                    size="sm"
                    fullWidth={false}
                    labelVariant="labelMd"
                    labelClassName="text-primary-foreground"
                    leftIcon={<Icon name="editNote" size={16} color={colors.surface} />}
                    onPress={onWriteReview}
                  />
                </>
              }
            />
            <VisitCard
              image={activityImages.bakery}
              title={copy.bakery}
              subtitle={copy.bakeryMeta}
              meta="Oct 11, 2024"
              location="Wuse II"
              trailing="Visited"
            />
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="visibility" size={20} color={colors.primary} />
              <VemtapText variant="bodyMd" className="flex-1 font-sans-semibold">
                {copy.viewed}
              </VemtapText>
            </View>
            <VemtapText variant="labelSm" tone="brand" className="shrink-0">
              {copy.clear}
            </VemtapText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-3"
          >
            <ViewedCard
              image={activityImages.spa}
              badge="Save 25%"
              business="Glow &amp; Serenity Spa"
              title={copy.spa}
              price="₦18,500"
              oldPrice="₦24,500"
              onPress={() => onOpenDeal?.('spa-glow')}
            />
            <ViewedCard
              image={activityImages.skyLounge}
              badge="50% OFF"
              business="The Sky Lounge"
              title={copy.sky}
              price="₦24,500"
              oldPrice="₦49,000"
              onPress={() => onOpenDeal?.('sky-menu')}
            />
            <ViewedCard
              image={activityImages.cafeNeo}
              business="Cafe Neo"
              title={copy.cafe}
              price="₦4,500"
              note="Special Edition"
              onPress={() => onOpenDeal?.('cafe-neo')}
            />
          </ScrollView>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon name="comment" size={20} color={colors.primary} />
              <VemtapText variant="bodyMd" className="flex-1 font-sans-semibold">
                {copy.myReviews}
              </VemtapText>
            </View>
            <VemtapText variant="labelSm" tone="brand" className="shrink-0">
              {copy.seeAll}
            </VemtapText>
          </View>
          <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  Glow &amp; Serenity Spa
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  {copy.reviewedOn}
                </VemtapText>
              </View>
              <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-surface-container-low px-2 py-0.5">
                <Icon name="star" size={15} color={colors.tertiaryContainer} />
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-tertiary"
                >
                  5.0
                </VemtapText>
              </View>
            </View>
            <VemtapText variant="bodyMd" tone="secondary">
              {copy.reviewQuote}
            </VemtapText>
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-row items-center gap-2">
                <VemtapText
                  variant="caption"
                  tone="tertiary"
                  className="font-sans-semibold"
                >
                  {copy.helpful}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  •
                </VemtapText>
                <View className="min-w-0 flex-row items-center gap-1">
                  <Icon name="verified" size={14} color={colors.badgeDiscountText} />
                  <VemtapText variant="caption" tone="success" numberOfLines={1}>
                    {copy.verifiedClaim}
                  </VemtapText>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.reviewOptions}
                onPress={onMore}
                hitSlop={8}
                className="shrink-0 p-1"
              >
                <Icon name="more" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
            <View className="flex-row items-start gap-2 rounded-field bg-surface-container-low p-2.5">
              <Icon name="forward" size={18} color={colors.primary} />
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    Glow &amp; Serenity Spa
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary">
                    {copy.merchantReply}
                  </VemtapText>
                </View>
                <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                  {copy.replyBody}
                </VemtapText>
              </View>
            </View>
          </View>
        </View>

        <View className="items-center gap-2 px-4 pt-2">
          <View className="flex-row flex-wrap items-center justify-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.exportCsv}
              onPress={onMore}
              className="flex-row items-center gap-1"
            >
              <Icon name="download" size={16} color={colors.textSecondary} />
              <VemtapText variant="labelSm" tone="secondary">
                {copy.exportCsv}
              </VemtapText>
            </Pressable>
            <VemtapText variant="caption" tone="tertiary">
              •
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.clearHistory}
              onPress={onMore}
              className="flex-row items-center gap-1"
            >
              <Icon name="delete" size={16} color={colors.error} />
              <VemtapText variant="labelSm" className="text-error">
                {copy.clearHistory}
              </VemtapText>
            </Pressable>
          </View>
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="max-w-[280px] text-center"
          >
            {copy.syncNote}
          </VemtapText>
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}
