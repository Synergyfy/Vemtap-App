import React from 'react';
import { Pressable, View, type RefreshControlProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessActionTile,
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessInfoStrip,
  BusinessLinkRow,
  BusinessMetricTile,
  BusinessPanel,
  BusinessProgressMeter,
} from '@features/business/components/BusinessOpsPrimitives';
import { businessOpsMedia } from '@features/business/data/businessOpsImages';
import type {
  DealPerformanceView,
  DealPricingRole,
} from '@features/business/utils/dealPresentation';

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.dealPerformance;

const pricingTile: Record<
  DealPricingRole,
  { surface: string; label: string; value: string; className: string }
> = {
  original: {
    surface: 'bg-surface-subtle',
    label: 'text-text-secondary',
    value: 'text-text-secondary line-through',
    className: '',
  },
  deal: {
    surface: 'bg-surface-tint',
    label: 'text-primary',
    value: 'text-primary',
    className: 'font-sans-bold',
  },
  savings: {
    surface: 'bg-badge-discount-bg',
    label: 'text-badge-discount-text',
    value: 'text-badge-discount-text',
    className: 'font-sans-semibold',
  },
  fee: {
    surface: 'bg-surface-subtle',
    label: 'text-text-secondary',
    value: 'text-text',
    className: 'font-sans-semibold',
  },
};

const PRICING_ROLES: DealPricingRole[] = ['original', 'deal', 'savings', 'fee'];

/** The Stitch prototype as a view, so standalone renders share the live path. */
const prototypeView: DealPerformanceView = {
  title: copy.heroTitle,
  eyebrow: copy.heroEyebrow,
  statusLabel: copy.activeLive,
  discount: copy.discount,
  image: businessOpsMedia.dealLunchHero,
  isPaused: false,
  canEnd: true,
  pricingBadge: copy.pricingBadge,
  pricing: copy.pricing.map((tile, index) => ({
    role: PRICING_ROLES[index],
    label: tile.label,
    value: tile.value,
  })),
  windowLabel: copy.redemptionWindow,
  daysLeft: copy.daysLeft,
  metrics: copy.metrics.map(metric => ({
    label: metric.label,
    value: metric.value,
    sub: metric.sub,
  })),
  rateValue: copy.redemptionRate,
  ratePercent: 69.5,
  redeemedLabel: copy.redeemedAtPos,
  unclaimedLabel: copy.activeUnclaimed,
  itemsCount: copy.catalogCount,
  items: copy.items.map((item, index) => ({
    id: item.name,
    name: item.name,
    meta: item.meta,
    qty: item.qty,
    image: index === 0 ? businessOpsMedia.itemRibeye : businessOpsMedia.itemMojito,
  })),
  capLabel: copy.capLabel,
  capValue: copy.capValue,
  branchesCount: copy.branchesCount,
  branches: copy.branches.map(branch => ({
    id: branch.name,
    name: branch.name,
    meta: branch.address,
    price: branch.price,
    active: branch.active,
  })),
  copyFields: copy.copyFields.map((field, index) => ({
    eyebrow: field.eyebrow,
    body: field.body,
    kind: index === 2 ? ('steps' as const) : ('text' as const),
  })),
};

export interface DealDetailsPerformanceScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  onBoostDeal?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEdit?: () => void;
  onEnd?: () => void;
  onPreviewCustomerView?: () => void;
  onEditLocationAssignment?: () => void;
  onViewLedger?: () => void;
  /** Live deal; omit to render the Stitch prototype. */
  view?: DealPerformanceView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * Deal drill-down for merchants: settlement breakdown, redemption velocity,
 * bundled catalogue items, per-branch availability and the customer-facing
 * copy that customers see on the deal. Controls without a handler are hidden
 * rather than left dead.
 */
export function DealDetailsPerformanceScreen({
  onBack,
  onMoreActions,
  onBoostDeal,
  onPause,
  onResume,
  onEdit,
  onEnd,
  onPreviewCustomerView,
  onEditLocationAssignment,
  onViewLedger,
  view,
  isLoading = false,
  isError = false,
  onRetry,
  refreshControl,
}: DealDetailsPerformanceScreenProps) {
  const header = {
    title: copy.headerTitle,
    onBack,
    actions: onMoreActions
      ? [{ icon: 'more' as const, label: copy.headerTitle, onPress: onMoreActions }]
      : [],
  };

  if (!view && (isLoading || isError)) {
    return (
      <BusinessScreenLayout header={header} contentContainerClassName="pb-8">
        {isLoading ? (
          <LoadingState className="mt-10" />
        ) : (
          <EmptyState
            title={copy.loadError}
            actionLabel={strings.centralDeals.retry}
            onAction={onRetry}
            className="px-0"
          />
        )}
      </BusinessScreenLayout>
    );
  }

  const deal = view ?? prototypeView;
  const heroImage = deal.image ?? businessOpsMedia.dealLunchHero;

  return (
    <BusinessScreenLayout
      header={header}
      contentContainerClassName="pb-8"
      refreshControl={refreshControl}
      footer={
        <BusinessActionDock>
          <Button
            label={copy.boostCta}
            labelVariant="labelMd"
            onPress={onBoostDeal}
            leftIcon={<Icon name="rocket" size={19} color={colors.surface} />}
          />
          {onPreviewCustomerView ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.preview}
              onPress={onPreviewCustomerView}
              className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field active:bg-surface-tint"
            >
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold text-primary"
                numberOfLines={2}
              >
                {copy.preview}
              </VemtapText>
              <Icon name="northEast" size={16} color={colors.primary} />
            </Pressable>
          ) : null}
        </BusinessActionDock>
      }
    >
      <View className="overflow-hidden rounded-card shadow-sm">
        <View className="relative h-44 w-full bg-surface-container-low">
          <BusinessProductImage
            source={heroImage}
            alt={heroImage.alt}
            className="h-full w-full"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
            locations={[0.3, 0.7, 1]}
            className="absolute inset-0"
          />
          <View className="absolute left-3 right-3 top-3 flex-row items-center justify-between gap-2">
            <View className="min-w-0 shrink flex-row items-center gap-1.5 rounded-full bg-badge-discount-bg px-2.5 py-1">
              <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="labelSm"
                className="min-w-0 shrink font-sans-semibold text-badge-discount-text"
                numberOfLines={1}
              >
                {deal.statusLabel}
              </VemtapText>
            </View>
            <View className="shrink-0 rounded-full bg-surface px-2.5 py-1">
              <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                {deal.discount}
              </VemtapText>
            </View>
          </View>
          <View className="absolute bottom-3 left-3 right-3">
            {deal.eyebrow ? (
              <VemtapText
                variant="labelSm"
                className="uppercase tracking-wide text-surface-container-highest"
                numberOfLines={1}
              >
                {deal.eyebrow}
              </VemtapText>
            ) : null}
            <VemtapText variant="headingMd" className="text-surface" numberOfLines={2}>
              {deal.title}
            </VemtapText>
          </View>
        </View>
      </View>

      <View className="mt-3 gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.boost}
          onPress={onBoostDeal}
          className="min-h-[52px] flex-row items-center justify-between gap-3 rounded-card bg-primary px-4 shadow-md active:scale-[0.99]"
        >
          <View className="min-w-0 flex-row items-center gap-2">
            <Icon name="rocket" size={20} color={colors.surface} />
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold text-surface"
              numberOfLines={1}
            >
              {copy.boost}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 rounded-full bg-surface px-2.5 py-1 sm:max-w-[170px]">
            <VemtapText
              variant="micro"
              className="font-sans-medium text-primary"
              numberOfLines={1}
            >
              {copy.boostHint}
            </VemtapText>
          </View>
        </Pressable>
        <View className="flex-row gap-2">
          {deal.isPaused ? (
            <BusinessActionTile
              label={copy.resume}
              icon="playCircle"
              onPress={onResume}
            />
          ) : (
            <BusinessActionTile label={copy.pause} icon="hourglass" onPress={onPause} />
          )}
          <BusinessActionTile label={copy.edit} icon="edit" onPress={onEdit} />
          {deal.canEnd ? (
            <BusinessActionTile
              label={copy.end}
              icon="blocked"
              tone="error"
              onPress={onEnd}
            />
          ) : null}
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.pricingTitle}
        icon="payments"
        badge={deal.pricingBadge || undefined}
        badgeTone="brand"
      >
        <View className="flex-row flex-wrap gap-2">
          {deal.pricing.map(tile => {
            const style = pricingTile[tile.role];
            return (
              <View
                key={tile.role}
                className={`min-w-0 flex-1 gap-1 rounded-field p-2.5 ${style.surface}`}
              >
                <VemtapText variant="caption" className={style.label} numberOfLines={1}>
                  {tile.label}
                </VemtapText>
                <VemtapText
                  variant="labelMd"
                  className={`font-sans-semibold ${style.value}`}
                  numberOfLines={1}
                >
                  {tile.value}
                </VemtapText>
              </View>
            );
          })}
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="verified" size={14} color={colors.textTertiary} />
          <VemtapText variant="caption" tone="tertiary" className="min-w-0 flex-1">
            {copy.pricingFootnote}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.redemptionTitle} icon="insights">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {deal.windowLabel}
          </VemtapText>
          {deal.daysLeft ? (
            <BusinessStatusPill label={deal.daysLeft} tone="warning" />
          ) : null}
        </View>
        <View className="flex-row flex-wrap gap-2">
          {deal.metrics.map(metric => (
            <BusinessMetricTile
              key={metric.label}
              label={metric.label}
              figure={metric.value}
              subline={metric.sub}
              className="min-w-[45%]"
            />
          ))}
        </View>
        <BusinessProgressMeter
          label={copy.redemptionRateLabel}
          value={deal.rateValue}
          percent={deal.ratePercent}
          filledLabel={deal.redeemedLabel}
          remainingLabel={deal.unclaimedLabel}
        />
        {view ? null : (
          <BusinessInfoStrip
            icon="schedule"
            title={copy.redemptionWindowLabel}
            body={copy.redemptionWindowValue}
          />
        )}
        {onViewLedger ? (
          <BusinessLinkRow label={copy.viewLedger} onPress={onViewLedger} />
        ) : null}
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.catalogTitle} icon="catalog">
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {deal.itemsCount}
        </VemtapText>
        <View className="gap-2">
          {deal.items.map(item => (
            <View
              key={item.id}
              className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-2.5"
            >
              <View className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                {item.image ? (
                  <BusinessProductImage
                    source={item.image}
                    alt={item.image.alt}
                    className="h-full w-full"
                  />
                ) : null}
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {item.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {item.meta}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelSm"
                className="shrink-0 font-sans-semibold text-primary"
              >
                {item.qty}
              </VemtapText>
            </View>
          ))}
        </View>
        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-tint p-2.5">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="productionLimits" size={17} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              className="min-w-0 flex-1 font-sans-medium text-primary"
              numberOfLines={1}
            >
              {deal.capLabel}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelSm"
            className="shrink-0 font-sans-semibold text-primary"
          >
            {deal.capValue}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.branchesTitle}
        icon="store"
        badge={deal.branchesCount}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {deal.branches.map(branch => (
            <View
              key={branch.id}
              className={`flex-row items-center gap-3 rounded-field p-2.5 ${
                branch.active
                  ? 'bg-surface-subtle'
                  : 'bg-surface-container-low opacity-70'
              }`}
            >
              <Icon
                name={branch.active ? 'checkCircle' : 'block'}
                size={19}
                color={branch.active ? colors.badgeDiscountText : colors.outline}
              />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {branch.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {branch.meta}
                </VemtapText>
              </View>
              {branch.active ? (
                <VemtapText variant="labelMd" className="shrink-0 font-sans-semibold">
                  {branch.price}
                </VemtapText>
              ) : (
                <VemtapText variant="caption" tone="tertiary" className="shrink-0">
                  {branch.price}
                </VemtapText>
              )}
            </View>
          ))}
        </View>
        {onEditLocationAssignment ? (
          <BusinessLinkRow
            label={copy.editAssignment}
            onPress={onEditLocationAssignment}
          />
        ) : null}
      </BusinessPanel>

      {deal.copyFields.length ? (
        <BusinessPanel className="mt-3" title={copy.copyTitle} icon="visibility">
          {deal.copyFields.map(field => (
            <View key={field.eyebrow} className="gap-1.5">
              <VemtapText
                variant="micro"
                tone="secondary"
                className="font-sans-semibold uppercase tracking-wider"
              >
                {field.eyebrow}
              </VemtapText>
              {field.kind === 'steps' ? (
                <View className="gap-1 rounded-field bg-surface-subtle p-2.5">
                  {field.body.split('\n').map((line, index) => (
                    <View key={line} className="flex-row items-start gap-2">
                      <View className="mt-0.5 h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-container">
                        <VemtapText variant="micro" className="font-sans-semibold">
                          {String(index + 1)}
                        </VemtapText>
                      </View>
                      <VemtapText
                        variant="caption"
                        tone="secondary"
                        className="min-w-0 flex-1 leading-snug"
                      >
                        {line}
                      </VemtapText>
                    </View>
                  ))}
                </View>
              ) : (
                <VemtapText
                  variant="bodyMd"
                  className="rounded-field bg-surface-subtle p-2.5 leading-snug"
                >
                  {field.body}
                </VemtapText>
              )}
            </View>
          ))}
        </BusinessPanel>
      ) : null}
    </BusinessScreenLayout>
  );
}
