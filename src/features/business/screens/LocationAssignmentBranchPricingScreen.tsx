import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { businessOpsMedia } from '@features/business/data/businessOpsImages';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  BusinessStatusPill,
  BusinessSwitchRow,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessInfoStrip,
  BusinessProgressMeter,
  BusinessScopeCard,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessBranchPricingCard,
  BusinessCheckLine,
  BusinessKeyValueTile,
} from '@features/business/components/BusinessLocationPrimitives';

cssInterop(Pressable, { className: 'style' });

const base = strings.dealLocationAssignment;
const copy = base.productSummary;

/**
 * Product location assignment: pick which branches stock an item and set a
 * per-branch retail rate. Uses the same location-assignment primitives as the
 * deal flow so availability and pricing behave identically in both.
 */
export function LocationAssignmentBranchPricingScreen({
  onBack,
  onSave,
}: {
  onBack?: () => void;
  onSave?: (activeBranches: number) => void;
}) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    maitama: true,
    vi: true,
    garki: false,
  });
  const [customPrice, setCustomPrice] = useState<Record<string, boolean>>({
    maitama: false,
    vi: true,
  });
  const [overrideDeal, setOverrideDeal] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({
    maitama: copy.branches[0].price,
    vi: copy.branches[1].price,
  });

  const activeCount = Object.values(enabled).filter(Boolean).length;
  const saveLabel = copy.saveCta.replace('%s', String(activeCount));

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack, titleVariant: 'headingSm' }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionFooter
          label={saveLabel}
          icon="save"
          hint={copy.saveHint}
          onPress={() => onSave?.(activeCount)}
        />
      }
    >
      <View className="mt-1 flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm">
        <View className="relative h-16 w-16 shrink-0 overflow-hidden rounded-field bg-surface-container">
          <BusinessProductImage
            source={businessOpsMedia.productRibeyeSummary}
            alt={businessOpsMedia.productRibeyeSummary.alt}
            className="h-full w-full"
          />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <Icon name="catalog" size={14} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="font-sans-medium uppercase tracking-wide"
              numberOfLines={1}
            >
              {copy.eyebrow}
            </VemtapText>
          </View>
          <VemtapText
            variant="labelMd"
            className="mt-0.5 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.itemName}
          </VemtapText>
          <View className="mt-1 flex-row items-baseline gap-1.5">
            <VemtapText variant="caption" tone="secondary">
              {copy.baseLabel}
            </VemtapText>
            <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
              {copy.basePrice}
            </VemtapText>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
          {copy.availabilityTitle}
        </VemtapText>
        <BusinessStatusPill label={copy.availabilityStep} tone="brand" />
      </View>

      <View className="mt-2 gap-2">
        <BusinessScopeCard
          title={copy.availabilitySelected}
          body={copy.availabilitySelectedBody}
          selected={scope === 'selected'}
          onPress={() => setScope('selected')}
        />
        <BusinessScopeCard
          title={copy.availabilityAll}
          body={copy.availabilityAllBody}
          selected={scope === 'all'}
          onPress={() => setScope('all')}
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.branchesTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {copy.branchesSubtitle}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.branchesCount} tone="neutral" />
      </View>

      <View className="mt-2 gap-3">
        {copy.branches.map((branch, index) => {
          const id = ['maitama', 'vi', 'garki'][index];
          const isGarki = index === 2;
          return (
            <BusinessBranchPricingCard
              key={branch.name}
              name={branch.name}
              address={branch.location}
              status={branch.status}
              statusTone={isGarki ? 'neutral' : 'success'}
              enabled={enabled[id]}
              disabled={isGarki}
              marker={enabled[id] && !isGarki ? 'live' : 'muted'}
              onToggle={value => setEnabled(current => ({ ...current, [id]: value }))}
              dealPrice={isGarki ? undefined : prices[id]}
              onChangeDealPrice={value =>
                setPrices(current => ({ ...current, [id]: value }))
              }
              priceLabel={copy.customPriceTitle}
              unavailable={
                isGarki ? (
                  <BusinessInfoStrip
                    icon="block"
                    body={'notice' in branch ? branch.notice : ''}
                  />
                ) : (
                  <>
                    <View className="flex-row gap-2">
                      {'meta' in branch && branch.meta
                        ? branch.meta.map(tile => (
                            <BusinessKeyValueTile
                              key={tile.label}
                              icon={tile.icon as never}
                              label={tile.label}
                              value={tile.value}
                            />
                          ))
                        : null}
                    </View>
                    <BusinessCheckLine
                      label={
                        customPrice[id]
                          ? copy.customPriceCheckedTitle
                          : copy.customPriceTitle
                      }
                      checked={customPrice[id]}
                      tone={customPrice[id] ? 'brand' : 'default'}
                      onPress={() =>
                        setCustomPrice(current => ({ ...current, [id]: !current[id] }))
                      }
                    />
                    {customPrice[id] ? (
                      <>
                        <View className="flex-row items-center gap-2 rounded-card bg-surface-tint p-3">
                          <View className="min-w-0 flex-1">
                            <VemtapText
                              variant="labelMd"
                              className="font-sans-semibold text-primary"
                            >
                              {copy.customPriceCheckedTitle}
                            </VemtapText>
                            <VemtapText
                              variant="caption"
                              tone="secondary"
                              className="mt-0.5"
                            >
                              {copy.customPriceCheckedBody}
                            </VemtapText>
                          </View>
                          <BusinessStatusPill
                            label={copy.upliftBadge}
                            tone="success"
                            icon="trendingUp"
                          />
                        </View>
                        <View className="flex-row items-center justify-between gap-2 rounded-card bg-surface p-2.5 shadow-sm">
                          <View className="min-w-0 flex-1 flex-row items-center gap-2">
                            <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-tint">
                              <Icon name="localOffer" size={15} color={colors.primary} />
                            </View>
                            <View className="min-w-0 flex-1">
                              <VemtapText
                                variant="labelSm"
                                className="font-sans-medium"
                                numberOfLines={1}
                              >
                                {copy.overrideDeal}
                              </VemtapText>
                              <VemtapText
                                variant="caption"
                                className="text-badge-discount-text"
                                numberOfLines={1}
                              >
                                {copy.overrideDealSub}
                              </VemtapText>
                            </View>
                          </View>
                          <View className="shrink-0">
                            <BusinessSwitchRow
                              title=""
                              accessibilityLabel={copy.overrideDeal}
                              value={overrideDeal}
                              onValueChange={setOverrideDeal}
                            />
                          </View>
                        </View>
                      </>
                    ) : null}
                  </>
                )
              }
            />
          );
        })}
      </View>

      <BusinessInfoStrip
        className="mt-4"
        icon="sync"
        title={copy.routingTitle}
        body={copy.routingBody}
      />

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="labelSm"
            tone="secondary"
            numberOfLines={1}
            className="min-w-0 flex-1"
          >
            {copy.capacityTitle}
          </VemtapText>
          <VemtapText
            variant="labelSm"
            className="shrink-0 font-sans-semibold text-primary"
          >
            {copy.capacityValue}
          </VemtapText>
        </View>
        <BusinessProgressMeter
          label={copy.capacityTitle}
          value={copy.capacityValue}
          percent={70}
          filledLabel={copy.capacityLegend[0]}
          remainingLabel={copy.capacityLegend[1]}
        />
      </View>
    </BusinessScreenLayout>
  );
}

function BusinessActionFooter({
  label,
  icon,
  hint,
  onPress,
}: {
  label: string;
  icon: 'save';
  hint: string;
  onPress?: () => void;
}) {
  return (
    <View className="gap-2 pb-2">
      <Button
        label={label}
        labelVariant="labelMd"
        size="lg"
        onPress={onPress}
        leftIcon={<Icon name={icon} size={20} color={colors.surface} />}
      />
      <View className="flex-row items-center justify-center gap-1.5">
        <Icon name="shieldLock" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="caption"
          tone="tertiary"
          numberOfLines={2}
          className="text-center"
        >
          {hint}
        </VemtapText>
      </View>
    </View>
  );
}
