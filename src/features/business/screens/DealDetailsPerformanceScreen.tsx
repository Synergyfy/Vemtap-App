import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
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

cssInterop(Pressable, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.dealPerformance;

const pricingTile: Record<
  string,
  { surface: string; label: string; value: string; className: string }
> = {
  'Original Price': {
    surface: 'bg-surface-subtle',
    label: 'text-text-secondary',
    value: 'text-text-secondary line-through',
    className: '',
  },
  'Deal Price': {
    surface: 'bg-surface-tint',
    label: 'text-primary',
    value: 'text-primary',
    className: 'font-sans-bold',
  },
  'Customer Savings': {
    surface: 'bg-badge-discount-bg',
    label: 'text-badge-discount-text',
    value: 'text-badge-discount-text',
    className: 'font-sans-semibold',
  },
  'Platform Fee': {
    surface: 'bg-surface-subtle',
    label: 'text-text-secondary',
    value: 'text-text',
    className: 'font-sans-semibold',
  },
};

export interface DealDetailsPerformanceScreenProps {
  onBack?: () => void;
  onMoreActions?: () => void;
  onBoostDeal?: () => void;
  onPause?: () => void;
  onEdit?: () => void;
  onEnd?: () => void;
  onPreviewCustomerView?: () => void;
  onEditLocationAssignment?: () => void;
}

/**
 * Deal drill-down for merchants: settlement breakdown, redemption velocity,
 * bundled catalogue items, per-branch availability and the customer-facing
 * copy that customers see on the deal.
 */
export function DealDetailsPerformanceScreen({
  onBack,
  onMoreActions,
  onBoostDeal,
  onPause,
  onEdit,
  onEnd,
  onPreviewCustomerView,
  onEditLocationAssignment,
}: DealDetailsPerformanceScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [{ icon: 'more', label: copy.headerTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.boostCta}
            labelVariant="labelMd"
            onPress={onBoostDeal}
            leftIcon={<Icon name="rocket" size={19} color={colors.surface} />}
          />
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
        </BusinessActionDock>
      }
    >
      <View className="overflow-hidden rounded-card shadow-sm">
        <View className="relative h-44 w-full bg-surface-container-low">
          <BusinessProductImage
            source={businessOpsMedia.dealLunchHero}
            alt={businessOpsMedia.dealLunchHero.alt}
            className="h-full w-full"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
            locations={[0.3, 0.7, 1]}
            className="absolute inset-0"
          />
          <View className="absolute left-3 right-3 top-3 flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full bg-badge-discount-bg px-2.5 py-1">
              <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-badge-discount-text"
                numberOfLines={1}
              >
                {copy.activeLive}
              </VemtapText>
            </View>
            <View className="rounded-full bg-surface px-2.5 py-1">
              <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                {copy.discount}
              </VemtapText>
            </View>
          </View>
          <View className="absolute bottom-3 left-3 right-3">
            <VemtapText
              variant="labelSm"
              className="uppercase tracking-wide text-surface-container-highest"
              numberOfLines={1}
            >
              {copy.heroEyebrow}
            </VemtapText>
            <VemtapText variant="headingMd" className="text-surface" numberOfLines={2}>
              {copy.heroTitle}
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
          <BusinessActionTile label={copy.pause} icon="hourglass" onPress={onPause} />
          <BusinessActionTile label={copy.edit} icon="edit" onPress={onEdit} />
          <BusinessActionTile
            label={copy.end}
            icon="blocked"
            tone="error"
            onPress={onEnd}
          />
        </View>
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.pricingTitle}
        icon="payments"
        badge={copy.pricingBadge}
        badgeTone="brand"
      >
        <View className="flex-row flex-wrap gap-2">
          {copy.pricing.map(tile => {
            const style = pricingTile[tile.label];
            return (
              <View
                key={tile.label}
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
            {copy.redemptionWindow}
          </VemtapText>
          <BusinessStatusPill label={copy.daysLeft} tone="warning" />
        </View>
        <View className="flex-row flex-wrap gap-2">
          {copy.metrics.map(metric => (
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
          value={copy.redemptionRate}
          percent={69.5}
          filledLabel={copy.redeemedAtPos}
          remainingLabel={copy.activeUnclaimed}
        />
        <BusinessInfoStrip
          icon="schedule"
          title={copy.redemptionWindowLabel}
          body={copy.redemptionWindowValue}
        />
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.catalogTitle} icon="catalog">
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {copy.catalogCount}
        </VemtapText>
        <View className="gap-2">
          {copy.items.map((item, index) => {
            const image =
              index === 0 ? businessOpsMedia.itemRibeye : businessOpsMedia.itemMojito;
            return (
              <View
                key={item.name}
                className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-2.5"
              >
                <View className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                  <BusinessProductImage
                    source={image}
                    alt={image.alt}
                    className="h-full w-full"
                  />
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
            );
          })}
        </View>
        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-tint p-2.5">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="productionLimits" size={17} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              className="min-w-0 flex-1 font-sans-medium text-primary"
              numberOfLines={1}
            >
              {copy.capLabel}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelSm"
            className="shrink-0 font-sans-semibold text-primary"
          >
            {copy.capValue}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.branchesTitle}
        icon="store"
        badge={copy.branchesCount}
        badgeTone="neutral"
      >
        <View className="gap-2">
          {copy.branches.map(branch => (
            <View
              key={branch.name}
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
                  {branch.address}
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
        <BusinessLinkRow label={copy.editAssignment} onPress={onEditLocationAssignment} />
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.copyTitle} icon="visibility">
        {copy.copyFields.map(field => (
          <View key={field.eyebrow} className="gap-1.5">
            <VemtapText
              variant="micro"
              tone="secondary"
              className="font-sans-semibold uppercase tracking-wider"
            >
              {field.eyebrow}
            </VemtapText>
            {field.eyebrow === copy.copyFields[2].eyebrow ? (
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
                variant={
                  field.eyebrow === copy.copyFields[0].eyebrow ? 'bodyMd' : 'caption'
                }
                tone={
                  field.eyebrow === copy.copyFields[0].eyebrow ? 'default' : 'secondary'
                }
                className="rounded-field bg-surface-subtle p-2.5 leading-snug"
              >
                {field.body}
              </VemtapText>
            )}
          </View>
        ))}
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
