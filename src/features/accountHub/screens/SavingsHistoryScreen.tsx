import React, { useMemo, useState } from 'react';
import { Image, Linking, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import {
  AccountHeader,
  PageScroll,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';
import {
  SAVINGS_RANGE_DAYS,
  useSavingsCategories,
  useSavingsLedger,
  type SavingsRange,
} from '@features/accountHub/hooks/useSavings';
import {
  useLoyaltyAnalytics,
  useLoyaltyBalance,
} from '@features/accountHub/hooks/useLoyalty';
import { savingsApi } from '@api/savingsApi';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import {
  formatCompactNaira,
  formatCurrency,
  formatPoints,
  formatWhen,
} from '@utils/formatters';

cssInterop(Pressable, { className: 'style' });
cssInterop(Image, { className: 'style' });

const copy = strings.accountScreens.savings;

type ExportPhase = 'idle' | 'preparing' | 'done';

/** Timeframe chips, in design order, mapped to the `days` window they request. */
const RANGE_ORDER: readonly SavingsRange[] = ['month', 'quarter', 'allTime'];

/** Category icons by name; anything unrecognised falls back to a generic tag. */
const CATEGORY_ICONS: Record<string, IconName> = {
  'food & dining': 'restaurant',
  'food & beverage': 'restaurant',
  'wellness & beauty': 'spa',
  'fashion & retail': 'shoppingBag',
};

/** Shared colour/icon treatments cycled across the category rows. */
const CATEGORY_TONES = [
  {
    tone: 'brand',
    iconColor: colors.primary,
    bg: 'bg-surface-tint-blue',
    bar: 'bg-primary',
  },
  {
    tone: 'secondary',
    iconColor: colors.secondary,
    bg: 'bg-surface-container',
    bar: 'bg-secondary-container',
  },
  {
    tone: 'tertiary',
    iconColor: colors.tertiary,
    bg: 'bg-tertiary-fixed',
    bar: 'bg-tertiary-fixed',
  },
] as const;

export interface SavingsHistoryScreenProps {
  onBack?: () => void;
  onExport?: () => void;
  onDisputeHelp?: () => void;
}

export function SavingsHistoryScreen({
  onBack,
  onExport,
  onDisputeHelp,
}: SavingsHistoryScreenProps) {
  const [rangeIndex, setRangeIndex] = useState(0);
  const [exportPhase, setExportPhase] = useState<ExportPhase>('idle');
  const range = RANGE_ORDER[rangeIndex] ?? 'allTime';
  const days = SAVINGS_RANGE_DAYS[range];

  const ledger = useSavingsLedger(days);
  const breakdown = useSavingsCategories(days);
  const analytics = useLoyaltyAnalytics(days ?? 365);
  const balance = useLoyaltyBalance(null);

  const entries = ledger.data?.data ?? [];
  const total = ledger.data?.total ?? 0;
  const loading = ledger.isPending;
  const failed = ledger.isError;
  const empty = !loading && !failed && entries.length === 0;

  // Hero figures: the ledger total is authoritative for naira saved in the
  // window; the analytics call supplies the metrics the ledger has no counter
  // for (redemption count, average discount, growth vs the previous window).
  const totals = analytics.data?.totals ?? null;
  const dealsRedeemed = totals?.dealsRedeemed ?? null;
  const avgDiscount = totals?.avgDiscountPercent ?? null;
  const points = balance.data ?? null;
  const growth = analytics.data?.growth?.netSavings?.percent ?? null;
  const savedTotal = formatCompactNaira(ledger.data?.totalSavedAmount ?? 0);
  const { unknown } = copy;

  const categoryCount = breakdown.data?.data?.length;
  const categories = useMemo(
    () =>
      (breakdown.data?.data ?? []).map((category, index) => {
        const style = CATEGORY_TONES[index % CATEGORY_TONES.length];
        return {
          key: category.id ?? category.name,
          name: category.name,
          icon: CATEGORY_ICONS[category.name.toLowerCase()] ?? 'localOffer',
          amount: formatCurrency(category.savedAmount),
          meta: `${category.redemptions} ${copy.redemptions} • ${Math.round(category.sharePercent ?? 0)}%`,
          share: Math.max(0, category.sharePercent ?? 0),
          ...style,
        };
      }),
    [breakdown.data],
  );

  const runExport = async () => {
    if (exportPhase !== 'idle') return;
    setExportPhase('preparing');
    onExport?.();
    try {
      // The endpoint streams a CSV attachment; the browser handles the download
      // and we have no filesystem/share dependency to write it ourselves.
      await Linking.openURL(savingsApi.exportUrl({ days }));
      setExportPhase('done');
    } catch {
      setExportPhase('idle');
      return;
    }
    setTimeout(() => setExportPhase('idle'), 2000);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <AccountHeader title={copy.title} onBack={onBack} />
      <PageScroll>
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText variant="labelSm" tone="secondary" numberOfLines={1}>
              {copy.audited}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.exportStatement}
            disabled={exportPhase !== 'idle'}
            onPress={runExport}
            className="flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 active:scale-95"
          >
            <Icon name="receipt" size={18} color={colors.primary} />
            <VemtapText variant="labelSm" className="text-primary">
              {copy.exportStatement}
            </VemtapText>
          </Pressable>
        </View>

        <View className="relative overflow-hidden rounded-card bg-surface-container-lowest p-5 shadow-md">
          <View className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-surface-tint-blue opacity-70" />
          <View className="relative z-10 gap-4">
            <StatusPillTabs
              segmented
              labels={copy.timeframes}
              selected={rangeIndex}
              onSelect={setRangeIndex}
            />

            <View className="gap-1 pt-1">
              <View className="flex-row items-center gap-1.5">
                <Icon name="savings" size={16} color={colors.primary} />
                <VemtapText variant="labelMd" tone="secondary">
                  {copy.lifetimeLabel}
                </VemtapText>
              </View>
              <View className="flex-row flex-wrap items-baseline gap-2">
                <VemtapText variant="headingSm" className="text-heading-sm">
                  {loading ? unknown : savedTotal}
                </VemtapText>
                {/* Growth is null when the previous window had no activity —
                    the API deliberately reports no percentage there. */}
                {growth !== null ? (
                  <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                    <VemtapText variant="caption" className="text-badge-discount-text">
                      {copy.growthPill(Math.round(growth))}
                    </VemtapText>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="flex-row gap-1 pt-1">
              <MiniStat
                label={copy.dealsRedeemedLabel}
                value={dealsRedeemed == null ? unknown : formatPoints(dealsRedeemed)}
                unit={copy.dealsRedeemedUnit}
                valueClassName="text-text"
              />
              <MiniStat
                label={copy.avgDiscountLabel}
                value={avgDiscount == null ? unknown : `${Math.round(avgDiscount)}%`}
                unit={copy.avgDiscountUnit}
                valueClassName="text-primary"
              />
              <MiniStat
                label={copy.pointsLabel}
                value={points == null ? unknown : formatPoints(points)}
                unit={copy.pointsUnit}
                valueClassName="text-badge-discount-text"
              />
            </View>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-3">
            <VemtapText variant="headingSm" className="text-heading-sm">
              {copy.categoryTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {categoryCount == null ? unknown : copy.categoryCount(categoryCount)}
            </VemtapText>
          </View>
          <View className="gap-4 rounded-card bg-surface-container-lowest p-4 shadow-sm">
            <View className="h-2.5 flex-row overflow-hidden rounded-full bg-surface-container-low">
              {categories.map(category => (
                <View
                  key={category.key}
                  className={cn('h-full', category.bar)}
                  style={{ width: `${category.share}%` }}
                />
              ))}
            </View>
            {categories.map(category => (
              <View
                key={category.key}
                className="flex-row items-center justify-between gap-3"
              >
                <View className="min-w-0 flex-row items-center gap-3">
                  <View
                    className={cn(
                      'h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      category.bg,
                    )}
                  >
                    <Icon name={category.icon} size={18} color={category.iconColor} />
                  </View>
                  <View className="min-w-0">
                    <VemtapText variant="labelMd" numberOfLines={1}>
                      {category.name}
                    </VemtapText>
                    <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                      {category.meta}
                    </VemtapText>
                  </View>
                </View>
                <VemtapText variant="labelMd" className="shrink-0 font-sans-semibold">
                  {category.amount}
                </VemtapText>
              </View>
            ))}
            {!breakdown.isPending && categories.length === 0 ? (
              <VemtapText variant="caption" tone="tertiary" className="text-center">
                {copy.noCategories}
              </VemtapText>
            ) : null}
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-row items-center gap-1.5">
              <VemtapText variant="headingSm" className="text-heading-sm">
                {copy.ledgerTitle}
              </VemtapText>
              <View className="rounded-full bg-surface-container-high px-2 py-0.5">
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold text-on-secondary-container"
                >
                  {loading ? unknown : copy.ledgerCount(total)}
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0 flex-row items-center gap-0.5">
              <VemtapText variant="caption" className="text-primary">
                {copy.sortLabel}
              </VemtapText>
              <Icon name="expandMore" size={14} color={colors.primary} />
            </View>
          </View>

          {failed ? (
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {copy.loadFailed}
            </VemtapText>
          ) : null}

          {loading ? (
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {strings.common.loading}
            </VemtapText>
          ) : null}

          {empty ? (
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {copy.noRedemptions}
            </VemtapText>
          ) : null}

          {entries.map(entry => (
            <View
              key={entry.id}
              className="gap-2 rounded-card bg-surface-container-lowest p-4 shadow-sm"
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row gap-3">
                  {entry.merchantImageUrl ? (
                    <View className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      <Image
                        source={{ uri: entry.merchantImageUrl ?? '' }}
                        accessibilityLabel={entry.merchantName}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {entry.merchantName}
                    </VemtapText>
                    <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                      {entry.redeemedAt ? formatWhen(entry.redeemedAt) : ''}
                    </VemtapText>
                    <View className="mt-1 max-w-full self-start rounded bg-surface-container-low px-1.5 py-0.5">
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {`${copy.codeLabel} ${entry.claimCode ?? '—'}`}
                      </VemtapText>
                    </View>
                  </View>
                </View>
                <View className="max-w-[45%] shrink-0 rounded-full bg-badge-discount-bg px-2 py-0.5">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-badge-discount-text"
                    numberOfLines={1}
                  >
                    {`${copy.savedPrefix} ${formatCurrency(entry.savedAmount, entry.currency)}`}
                  </VemtapText>
                </View>
              </View>

              <View className="mt-1 flex-row items-center justify-between gap-3 rounded-lg bg-surface-subtle p-2">
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="caption"
                    className="font-sans-medium text-text-secondary"
                    numberOfLines={2}
                  >
                    {entry.offerName}
                  </VemtapText>
                  <View className="mt-0.5 flex-row flex-wrap items-baseline gap-x-2">
                    <VemtapText
                      variant="caption"
                      tone="tertiary"
                      className="line-through"
                      numberOfLines={1}
                    >
                      {formatCurrency(entry.originalAmount, entry.currency)}
                    </VemtapText>
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-bold"
                      numberOfLines={1}
                    >
                      {`${copy.paidPrefix} ${formatCurrency(entry.paidAmount, entry.currency)}`}
                    </VemtapText>
                  </View>
                </View>
                <View className="shrink-0 flex-row items-center gap-1">
                  <Icon name="verified" size={16} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="caption"
                    className="text-badge-discount-text"
                    numberOfLines={1}
                  >
                    {copy.verifiedRedemption}
                  </VemtapText>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="gap-1 rounded-card bg-surface-tint-blue p-4">
          <View className="flex-row items-start gap-1.5">
            <View className="pt-0.5">
              <Icon name="shield" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.integrityTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {copy.integrityBody}
              </VemtapText>
            </View>
          </View>
        </View>

        <View className="gap-2 pt-1">
          <Button
            label={
              exportPhase === 'idle'
                ? copy.downloadLabel
                : exportPhase === 'preparing'
                  ? copy.preparingLabel
                  : copy.downloadedLabel
            }
            leftIcon={
              <Icon
                name={
                  exportPhase === 'idle'
                    ? 'download'
                    : exportPhase === 'preparing'
                      ? 'sync'
                      : 'checkCircle'
                }
                size={18}
                color={colors.surface}
              />
            }
            disabled={exportPhase !== 'idle'}
            className="min-h-[52px]"
            labelVariant="labelMd"
            labelClassName="text-center"
            onPress={runExport}
          />
          <View className="items-center pt-1">
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.disputePrompt}
              onPress={onDisputeHelp}
              className="min-h-9 flex-row items-center justify-center"
            >
              <VemtapText variant="labelMd" tone="secondary" className="text-center">
                {copy.disputePrompt}
              </VemtapText>
              <View className="ml-1">
                <Icon name="arrowForward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          </View>
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}

function MiniStat({
  label,
  value,
  unit,
  valueClassName,
}: {
  label: string;
  value: string;
  unit: string;
  valueClassName?: string;
}) {
  return (
    <View className="min-w-0 flex-1 justify-between rounded-lg bg-surface-subtle p-2">
      <VemtapText variant="caption" tone="tertiary" numberOfLines={2}>
        {label}
      </VemtapText>
      <View className="mt-1 flex-row flex-wrap items-baseline gap-1">
        <VemtapText
          variant="headingSm"
          className={cn('font-sans-semibold', valueClassName)}
        >
          {value}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {unit}
        </VemtapText>
      </View>
    </View>
  );
}
