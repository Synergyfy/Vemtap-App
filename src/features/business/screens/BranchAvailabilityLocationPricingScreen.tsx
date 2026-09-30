import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { businessOpsMedia } from '@features/business/data/businessOpsImages';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessInfoStrip,
  BusinessScopeCard,
  BusinessSegmentTabs,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessBranchPricingCard } from '@features/business/components/BusinessLocationPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.dealLocationAssignment.lamb;

/**
 * Branch availability & pricing step of the product builder. Adds the pricing
 * strategy switch (standard base vs branch dynamic), per-branch selling prices
 * with live telemetry chips, and the network capacity summary.
 */
export function BranchAvailabilityLocationPricingScreen({
  onBack,
  onMoreActions,
  onSaveContinue,
}: {
  onBack?: () => void;
  onMoreActions?: () => void;
  onSaveContinue?: () => void;
}) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [strategy, setStrategy] = useState<'standard' | 'custom'>('custom');
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    wuse: true,
    vi: true,
    garki: false,
  });
  const [prices, setPrices] = useState<Record<string, string>>({
    wuse: copy.branches[0].price,
    vi: copy.branches[1].price,
  });

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'labelMd',
        actions: [{ icon: 'more', label: copy.headerTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <View className="gap-2 pb-2">
          <Button
            label={copy.saveCta}
            labelVariant="labelMd"
            size="lg"
            onPress={onSaveContinue}
            rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
          />
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="electricBolt" size={14} color={colors.badgeDiscountText} />
            <VemtapText
              variant="caption"
              tone="tertiary"
              numberOfLines={2}
              className="text-center"
            >
              {copy.saveHint}
            </VemtapText>
          </View>
        </View>
      }
    >
      <View className="mt-1 flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-6 rounded-full bg-primary" />
          <View className="h-1.5 w-6 rounded-full bg-primary" />
          <View className="h-1.5 w-2 rounded-full bg-surface-container-highest" />
        </View>
        <BusinessStatusPill label={copy.step} tone="brand" />
      </View>

      <View className="mt-3 flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm">
        <View className="h-14 w-14 shrink-0 overflow-hidden rounded-field bg-surface-container">
          <BusinessProductImage
            source={businessOpsMedia.productLamb}
            alt={businessOpsMedia.productLamb.alt}
            className="h-full w-full"
          />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.name}
          </VemtapText>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
              {copy.price}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              •
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={1}
            >
              {copy.category}
            </VemtapText>
          </View>
        </View>
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint">
          <Icon name="catalog" size={18} color={colors.primary} />
        </View>
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        <Icon name="deliveryOptions" size={17} color={colors.primary} />
        <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
          {copy.availabilityTitle}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2">
        <BusinessScopeCard
          title={copy.selected}
          body={copy.selectedBody}
          tag={copy.selectedTag}
          selected={scope === 'selected'}
          onPress={() => setScope('selected')}
        />
        <BusinessScopeCard
          title={copy.all}
          body={copy.allBody}
          selected={scope === 'all'}
          onPress={() => setScope('all')}
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText
          variant="micro"
          tone="secondary"
          className="font-sans-semibold uppercase tracking-wider"
        >
          {copy.pricingStrategy}
        </VemtapText>
        <View className="flex-row items-center gap-1">
          <VemtapText variant="caption" className="font-sans-semibold text-primary">
            {copy.smartTiering}
          </VemtapText>
          <Icon name="autoAwesome" size={14} color={colors.primary} />
        </View>
      </View>

      <BusinessSegmentTabs
        className="mt-2 bg-surface-container-high"
        accessibilityLabel={copy.pricingStrategy}
        value={strategy}
        onChange={key => setStrategy(key as 'standard' | 'custom')}
        tabs={[
          { key: 'standard', label: `${copy.standard} · ${copy.standardBase}` },
          {
            key: 'custom',
            label: `${copy.custom} · ${copy.customBranchDynamic}`,
            icon: 'check',
          },
        ]}
      />

      <View className="mt-2 flex-row items-center gap-1.5">
        <Icon name="info" size={14} color={colors.textTertiary} />
        <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
          {copy.strategyHint}
        </VemtapText>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
          {copy.breakdownTitle}
        </VemtapText>
        <BusinessStatusPill label={copy.nodes} tone="neutral" />
      </View>

      <View className="mt-2 gap-3">
        {copy.branches.map(branch => {
          const { id } = branch;
          const isGarki = id === 'garki';
          const telemetry = copy.telemetry.filter(chip => chip.branch === id);
          return (
            <BusinessBranchPricingCard
              key={branch.name}
              name={branch.name}
              address={branch.address}
              marker={enabled[id] && !isGarki ? 'live' : 'muted'}
              markerLabel={branch.index}
              enabled={enabled[id]}
              disabled={isGarki}
              onToggle={value => setEnabled(current => ({ ...current, [id]: value }))}
              dealPrice={isGarki ? undefined : prices[id]}
              onChangeDealPrice={value =>
                setPrices(current => ({ ...current, [id]: value }))
              }
              priceLabel={copy.sellingPrice}
              priceBadge={branch.modifier || undefined}
              priceBadgeTone={
                branch.modifier === copy.standardBaseBadge ? 'success' : 'brandContainer'
              }
              unavailable={
                isGarki ? (
                  <View className="gap-1 rounded-field bg-surface-container-low p-3">
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold text-text-secondary"
                    >
                      {branch.noticeTitle}
                    </VemtapText>
                    <VemtapText
                      variant="caption"
                      tone="tertiary"
                      className="leading-snug"
                    >
                      {branch.noticeBody}
                    </VemtapText>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {telemetry.map(chip => (
                      <View
                        key={chip.id}
                        className={`flex-row items-center gap-1.5 rounded-field px-2.5 py-1.5 ${
                          chip.tone === 'success'
                            ? 'bg-badge-discount-bg'
                            : 'bg-surface-container-low'
                        }`}
                      >
                        <Icon
                          name={chip.icon as IconName}
                          size={14}
                          color={
                            chip.tone === 'success'
                              ? colors.badgeDiscountText
                              : colors.primary
                          }
                        />
                        <VemtapText variant="caption" numberOfLines={1}>
                          {chip.value}
                        </VemtapText>
                      </View>
                    ))}
                  </View>
                )
              }
            />
          );
        })}
      </View>

      <View className="mt-4 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed">
            <Icon name="hub" size={19} color={colors.secondary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
              {copy.capacityTitle}
            </VemtapText>
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 shrink-0 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="caption"
                className="font-sans-medium text-badge-discount-text"
                numberOfLines={1}
              >
                {copy.capacitySub}
              </VemtapText>
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-2 rounded-field bg-surface-subtle p-2.5">
          <Icon name="sync" size={16} color={colors.primary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1 leading-tight"
          >
            {copy.capacityNote}
          </VemtapText>
        </View>
      </View>

      <BusinessInfoStrip
        className="mt-3"
        tone="tint"
        icon="sync"
        body={strings.dealLocationAssignment.catalogCalloutBody}
      />
    </BusinessScreenLayout>
  );
}
