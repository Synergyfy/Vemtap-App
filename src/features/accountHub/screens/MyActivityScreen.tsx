import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import {
  AccountHeader,
  PageScroll,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { ActivityFilter } from '@api/activityApi';
import { useLoyaltyAnalytics } from '@features/accountHub/hooks/useLoyalty';
import { useActivity, useActivitySummary } from '@features/accountHub/hooks/useActivity';
import {
  ACTIVITY_CSV_HEADER,
  activityCsvRows,
  toActivityCard,
  type ActivityCardView,
} from '@features/accountHub/utils/activityMapper';
import { datedFileName, shareCsv, toCsv } from '@utils/csvExport';
import { formatCurrency } from '@utils/formatters';

cssInterop(Image, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

const copy = strings.accountScreens.activity;

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

function ActivityCard({
  card,
  actionLabel,
  onAction,
}: {
  card: ActivityCardView;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="gap-3 rounded-card bg-surface-canvas p-4 shadow-sm">
      <View className="flex-row items-start gap-3">
        {card.image ? (
          <Image
            source={{ uri: card.image }}
            accessibilityLabel={card.title}
            className="h-12 w-12 shrink-0 rounded-field bg-surface-container"
            resizeMode="cover"
          />
        ) : (
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-field bg-surface-container">
            <Icon name={card.icon} size={22} color={colors.primary} />
          </View>
        )}
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {card.title}
            </VemtapText>
            {card.pill ? (
              <View
                className={`shrink-0 rounded-full px-2 py-0.5 ${
                  card.pillTone === 'success'
                    ? 'bg-badge-discount-bg'
                    : 'bg-surface-container'
                }`}
              >
                <VemtapText
                  variant="caption"
                  className={
                    card.pillTone === 'success'
                      ? 'font-sans-semibold text-badge-discount-text'
                      : 'text-text-secondary'
                  }
                  numberOfLines={1}
                >
                  {card.pill}
                </VemtapText>
              </View>
            ) : null}
          </View>
          <VemtapText variant="labelSm" tone="brand" className="mt-0.5" numberOfLines={2}>
            {card.subtitle}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="mt-1"
            numberOfLines={1}
          >
            {card.meta}
          </VemtapText>
        </View>
      </View>
      {card.rating ? (
        <View className="flex-row items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Icon
              key={star}
              name="star"
              size={14}
              color={
                star <= (card.rating ?? 0)
                  ? colors.tertiaryContainer
                  : colors.textTertiary
              }
            />
          ))}
        </View>
      ) : null}
      {card.body ? (
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={4}>
          {card.body}
        </VemtapText>
      ) : null}
      {card.reply ? (
        <View className="flex-row items-start gap-2 rounded-field bg-surface-container-low p-2.5">
          <Icon name="forward" size={18} color={colors.primary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="caption" tone="tertiary">
              {`${card.businessName} • ${copy.merchantReply}`}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {card.reply}
            </VemtapText>
          </View>
        </View>
      ) : null}
      {actionLabel && onAction ? (
        <View className="flex-row justify-end">
          <Button
            label={actionLabel}
            variant="secondary"
            size="sm"
            fullWidth={false}
            labelVariant="labelMd"
            onPress={onAction}
          />
        </View>
      ) : null}
    </View>
  );
}

export interface MyActivityScreenProps {
  onBack?: () => void;
  /** A claim row opens its pass. */
  onOpenClaim?: (offerId: string) => void;
  onOpenOrder?: (orderId: string) => void;
  onOpenBooking?: (bookingId: string) => void;
  /** A deal review opens its deal. */
  onOpenDeal?: (offerId: string) => void;
  /** A product comment opens its product. */
  onOpenProduct?: (itemId: string) => void;
}

/**
 * Everything the customer has done on VemTap (`GET /me/activity`), with the
 * period's counts (`GET /me/activity/summary`) and lifetime savings from the
 * loyalty analytics. Each card opens the thing it is about.
 */
export function MyActivityScreen({
  onBack,
  onOpenClaim,
  onOpenOrder,
  onOpenBooking,
  onOpenDeal,
  onOpenProduct,
}: MyActivityScreenProps) {
  const [tab, setTab] = useState<ActivityFilter>('all');
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = copy.periods[periodIndex];
  const from = useMemo(() => {
    if (period.days === null) return null;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - period.days);
    return start.toISOString();
  }, [period.days]);

  const { data: analytics } = useLoyaltyAnalytics(period.days ?? 'allTime');
  const summary = useActivitySummary(from);
  const list = useActivity(tab, from);
  const rows = list.data?.data ?? [];
  const cards = rows.map(toActivityCard);

  const actionFor = (
    card: ActivityCardView,
  ): { label: string; run: () => void } | null => {
    const ref = card.refId;
    if (!ref) return null;
    switch (card.kind) {
      case 'claim':
        return onOpenClaim ? { label: copy.viewPass, run: () => onOpenClaim(ref) } : null;
      case 'order':
        return onOpenOrder
          ? { label: copy.viewOrder, run: () => onOpenOrder(ref) }
          : null;
      case 'booking':
        return onOpenBooking
          ? { label: copy.viewBooking, run: () => onOpenBooking(ref) }
          : null;
      case 'review':
        return onOpenDeal ? { label: copy.viewDeal, run: () => onOpenDeal(ref) } : null;
      case 'comment':
        return onOpenProduct
          ? { label: copy.viewProduct, run: () => onOpenProduct(ref) }
          : null;
      default:
        return null;
    }
  };

  const exportCsv = () => {
    shareCsv(
      datedFileName('vemtap-activity'),
      toCsv(ACTIVITY_CSV_HEADER, activityCsvRows(rows)),
      copy.exportTitle,
    );
  };

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <AccountHeader title={copy.title} onBack={onBack} />
      <PageScroll>
        <View className="flex-row items-center justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.periodLabel}
            onPress={() => setPeriodIndex(index => (index + 1) % copy.periods.length)}
            className="flex-row items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5"
          >
            <Icon name="eventAvailable" size={15} color={colors.primary} />
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {period.label}
            </VemtapText>
            <Icon name="expandMore" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View className="gap-3 rounded-card bg-surface-container-low p-4 shadow-sm">
          <VemtapText
            variant="labelSm"
            tone="secondary"
            className="uppercase"
            numberOfLines={1}
          >
            {copy.footprint}
          </VemtapText>
          <View className="flex-row gap-2">
            <FootprintMetric
              icon="wallet"
              value={formatCurrency(analytics?.totals?.netSavings ?? 0)}
              label={copy.totalSaved}
            />
            <FootprintMetric
              icon="localActivity"
              value={String(summary.data?.claimed ?? 0)}
              label={copy.claimed}
            />
            <FootprintMetric
              icon="storefront"
              value={String(summary.data?.visits ?? 0)}
              label={copy.visited}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2"
        >
          {copy.tabs.map(item => {
            const selected = tab === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected }}
                onPress={() => setTab(item.key)}
                className={`h-9 shrink-0 flex-row items-center gap-1.5 rounded-full px-4 shadow-sm ${
                  selected ? 'bg-surface-tint-blue' : 'bg-surface-canvas'
                }`}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  color={selected ? colors.primary : colors.textSecondary}
                />
                <VemtapText variant="labelSm" tone={selected ? 'brand' : 'secondary'}>
                  {item.label}
                </VemtapText>
              </Pressable>
            );
          })}
        </ScrollView>

        {list.isLoading ? (
          <LoadingState label={copy.loading} />
        ) : list.isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={() => list.refetch()}
          />
        ) : cards.length === 0 ? (
          <EmptyState
            icon="history"
            title={copy.empty.title}
            description={copy.empty.body}
          />
        ) : (
          <View className="gap-3">
            <VemtapText variant="caption" tone="tertiary">
              {copy.countLabel(list.data?.total ?? cards.length)}
            </VemtapText>
            {cards.map(card => {
              const action = actionFor(card);
              return (
                <ActivityCard
                  key={card.id}
                  card={card}
                  actionLabel={action?.label}
                  onAction={action?.run}
                />
              );
            })}
          </View>
        )}

        {cards.length > 0 ? (
          <View className="items-center px-4 pt-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.exportCsv}
              onPress={exportCsv}
              className="flex-row items-center gap-1"
            >
              <Icon name="download" size={16} color={colors.textSecondary} />
              <VemtapText variant="labelSm" tone="secondary">
                {copy.exportCsv}
              </VemtapText>
            </Pressable>
          </View>
        ) : null}
      </PageScroll>
    </SafeAreaView>
  );
}
