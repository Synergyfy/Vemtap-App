import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import {
  AccountHeader,
  PageScroll,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(Image, { className: 'style' });

const copy = strings.accountScreens.savings;

/** Merchant imagery for the ledger cards, keyed by `strings.accountScreens.savings.entries` id. */
const entryImages: Record<string, string> = {
  'urban-grill':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCDpJzehdTIakEd1l0aHtXcEENngWKwUL79INnAJtrU09GrivYgMJR4bfgrzFW318ScXl0skr_aEHzNQD7QfiJsaiqoijzaaynQlWxZyBYVXbPuzyXRFL0KhJm_qz0GVXxnnzaYO7EtTpNNxAfyVpFtKxpzJr2p9OsYYpi8vyqER9UYoSuziYcx3K51XiE0wupPjYGE5yh58M5pAMtp1GABh-h5X8PLxP_vgJqz6wg6-gNeyqKdFvUXKA',
  'glow-serenity':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAXMfSfZGmy3oINAHONydpb5CJi5oKMrEIJzLcwXjGwSL5LXAuV1NIoEFEQBwRVTR9qfVCIVXApxL9rJR9Cysn6trPdZ2CZQYtCYWONxf_AGSTYprhNQWKz-LEMe2lXnULPYwdfbUuwbvieSnkuCHrs8z9zu0Q_lY5eLIGg2EeFpBnQgpRA0XPnyDHEltjX5gXIwODoDViuvn9CyvTa272siegnOxY7E2S_dqdSiMzRk25EQPWHuj3uNg',
  'daily-knead':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC16GrqfAPlFKScFIyWtL5Ht6ORXy6PLGkXXX42qPyfLAx1VNz3aRXLC_nm8l550rsb_M_jsAQZy74_g2JGZlEZN2pXJBIuIgoefbc3asRpC4idVjY6fb39GjFKbmlwj2zFgBeVOW8-amrF-gvQhwhBgShtReKeHuonzYu7P0HRdZrKbUZS1IooMD7lGjeJA4u9jv2VD4E57buWekoGkTC2vKmP7TtdS2IfFz4icwQ6SV4qftT0dhwfUw',
  'sole-district':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDeyOzl-DW9E35EiZof0vPXfxq1u2rQ3OTRVxGI0PvxMsUwbYwmacHMinRDAiuipZwtB8vnuTK6DhNAVygBtodPYaGnXUCohJw6NuBK4zF5n7sQC7l-uQszgaoUzlS1w0xkg-v1qZYJta_rwdVEVsWAXqWg1NF8cYciDe6bO50phJmxCx9yIOnLlJDil_IHxxATHKRPYfwTWRtdAAZFcFiQ28h4xAPjW0IGfrpsRWPNElgvlShg1jh9aQ',
};

type ExportPhase = 'idle' | 'preparing' | 'done';

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
  const [timeframe, setTimeframe] = useState(0);
  const [exportPhase, setExportPhase] = useState<ExportPhase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  const runExport = () => {
    if (exportPhase !== 'idle') return;
    setExportPhase('preparing');
    onExport?.();
    timers.current.push(
      setTimeout(() => {
        setExportPhase('done');
        timers.current.push(
          setTimeout(() => {
            setExportPhase('idle');
          }, 2000),
        );
      }, 1200),
    );
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
              selected={timeframe}
              onSelect={setTimeframe}
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
                  {copy.lifetimeTotals[timeframe]}
                </VemtapText>
                <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                  <VemtapText variant="caption" className="text-badge-discount-text">
                    {copy.growthPill}
                  </VemtapText>
                </View>
              </View>
            </View>

            <View className="flex-row gap-1 pt-1">
              <MiniStat
                label={copy.dealsRedeemedLabel}
                value={copy.dealsRedeemedValue}
                unit={copy.dealsRedeemedUnit}
                valueClassName="text-text"
              />
              <MiniStat
                label={copy.avgDiscountLabel}
                value={copy.avgDiscountValue}
                unit={copy.avgDiscountUnit}
                valueClassName="text-primary"
              />
              <MiniStat
                label={copy.pointsLabel}
                value={copy.pointsValue}
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
              {copy.categoryCount}
            </VemtapText>
          </View>
          <View className="gap-4 rounded-card bg-surface-container-lowest p-4 shadow-sm">
            <View className="h-2.5 flex-row overflow-hidden rounded-full bg-surface-container-low">
              {copy.categories.map(category => (
                <View
                  key={category.id}
                  className={cn(
                    'h-full',
                    category.tone === 'brand'
                      ? 'bg-primary'
                      : category.tone === 'secondary'
                        ? 'bg-secondary-container'
                        : 'bg-tertiary-fixed',
                  )}
                  style={{ width: `${category.share}%` }}
                />
              ))}
            </View>
            {copy.categories.map(category => (
              <View
                key={category.id}
                className="flex-row items-center justify-between gap-3"
              >
                <View className="min-w-0 flex-row items-center gap-3">
                  <View
                    className={cn(
                      'h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      category.tone === 'brand'
                        ? 'bg-surface-tint-blue'
                        : category.tone === 'secondary'
                          ? 'bg-surface-container'
                          : 'bg-tertiary-fixed',
                    )}
                  >
                    <Icon
                      name={category.icon}
                      size={18}
                      color={
                        category.tone === 'brand'
                          ? colors.primary
                          : category.tone === 'secondary'
                            ? colors.secondary
                            : colors.tertiary
                      }
                    />
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
                  {copy.ledgerCount}
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

          {copy.entries.map(entry => (
            <View
              key={entry.id}
              className="gap-2 rounded-card bg-surface-container-lowest p-4 shadow-sm"
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row gap-3">
                  <View className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                    <Image
                      source={{ uri: entryImages[entry.id] }}
                      accessibilityLabel={entry.imageAlt}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {entry.merchant}
                    </VemtapText>
                    <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                      {entry.timestamp}
                    </VemtapText>
                    <View className="mt-1 max-w-full self-start rounded bg-surface-container-low px-1.5 py-0.5">
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {`${copy.codeLabel} ${entry.code}`}
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
                    {`${copy.savedPrefix} ${entry.saved}`}
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
                    {entry.item}
                  </VemtapText>
                  <View className="mt-0.5 flex-row flex-wrap items-baseline gap-x-2">
                    <VemtapText
                      variant="caption"
                      tone="tertiary"
                      className="line-through"
                      numberOfLines={1}
                    >
                      {entry.original}
                    </VemtapText>
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-bold"
                      numberOfLines={1}
                    >
                      {`${copy.paidPrefix} ${entry.paid}`}
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
