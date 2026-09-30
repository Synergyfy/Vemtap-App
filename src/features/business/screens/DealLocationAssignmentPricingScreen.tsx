import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
  BusinessSwitchRow,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessInfoStrip,
  BusinessPanel,
  BusinessScopeCard,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessBranchPricingCard } from '@features/business/components/BusinessLocationPrimitives';
import { SetupCallout } from '@features/business/components/BusinessSetupPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.dealLocationAssignment;

/**
 * Location assignment & pricing matrix for a single deal. Every participating
 * branch gets its own deal price, MSRP reference and daily voucher cap; the
 * header banner keeps the deal context visible while editing.
 */
export function DealLocationAssignmentPricingScreen({
  onBack,
  onMoreActions,
  onSave,
  onCancel,
}: {
  onBack?: () => void;
  onMoreActions?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [pricePerLocation, setPricePerLocation] = useState(true);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    wuse: true,
    maitama: true,
    garki: false,
  });
  const [prices, setPrices] = useState<Record<string, string>>({
    wuse: copy.branch1.dealPrice,
    maitama: copy.branch2.dealPrice,
  });

  const participating = Object.values(enabled).filter(Boolean).length;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.contextTitle,
        onBack,
        titleVariant: 'labelMd',
        actions: [{ icon: 'more', label: copy.contextTitle, onPress: onMoreActions }],
      }}
      contentContainerClassName="pb-8"
      footer={
        <View className="gap-2 pb-2">
          <Button
            label={copy.saveAssignment}
            labelVariant="labelMd"
            onPress={onSave}
            rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.cancelChanges}
            onPress={onCancel}
            className="min-h-11 items-center justify-center"
          >
            <VemtapText variant="labelMd" tone="secondary" numberOfLines={1}>
              {copy.cancelChanges}
            </VemtapText>
          </Pressable>
        </View>
      }
    >
      <View className="mt-1 flex-row items-center justify-between gap-3 rounded-card bg-surface-container-low p-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed">
            <Icon name="catalog" size={17} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="micro"
              tone="secondary"
              className="font-sans-medium uppercase tracking-wider"
            >
              {copy.contextEyebrow}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              className="mt-0.5 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.contextTitle}
            </VemtapText>
          </View>
        </View>
        <BusinessStatusPill label={copy.contextBadge} tone="success" />
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
          {copy.scopeTitle}
        </VemtapText>
        <VemtapText
          variant="caption"
          className="shrink-0 font-sans-semibold text-primary"
        >
          {copy.scopeStep}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2">
        <BusinessScopeCard
          title={copy.selectedAltTitle}
          body={copy.selectedAltBody}
          tag={copy.customMatrix}
          selected={scope === 'selected'}
          onPress={() => setScope('selected')}
        />
        <BusinessScopeCard
          title={copy.allCountTitle}
          body={copy.allBodyAlt}
          tag={copy.uniform}
          selected={scope === 'all'}
          onPress={() => setScope('all')}
        />
      </View>

      <BusinessPanel className="mt-3 flex-row items-start gap-3">
        <SetupCallout
          className="flex-1"
          icon="tune"
          tone="plain"
          iconSurface="circleSm"
          title={copy.pricePerLocationToggle}
          body={copy.pricePerLocationBody}
        />
        <View className="shrink-0">
          <BusinessSwitchRow
            title=""
            accessibilityLabel={copy.pricePerLocationToggle}
            value={pricePerLocation}
            onValueChange={setPricePerLocation}
          />
        </View>
      </BusinessPanel>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.matrixTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {copy.participatingTemplate
              .replace('%s', String(participating))
              .replace('%s', '3')}
          </VemtapText>
        </View>
        <BusinessStatusPill label={copy.syncActive} tone="neutral" icon="checkCircle" />
      </View>

      <View className="mt-2 gap-3">
        <BusinessBranchPricingCard
          name={copy.branch1.name}
          address={copy.branch1.address}
          tag={copy.headquarters}
          tagTone="brandContainer"
          status={copy.operational}
          enabled={enabled.wuse}
          onToggle={value => setEnabled(current => ({ ...current, wuse: value }))}
          priceLabel={copy.dealPriceLabel}
          dealPrice={prices.wuse}
          onChangeDealPrice={value => setPrices(current => ({ ...current, wuse: value }))}
          originalTag={copy.msrp}
          originalPrice={copy.branch1.originalPrice}
          discountLabel={copy.branch1.discount}
          vouchers={copy.branch1.vouchers}
        />
        <BusinessBranchPricingCard
          name={copy.branch2.name}
          address={copy.branch2.address}
          tag={copy.customBranchPrice}
          tagTone="warning"
          status={copy.operational}
          enabled={enabled.maitama}
          onToggle={value => setEnabled(current => ({ ...current, maitama: value }))}
          priceLabel={copy.dealPricePremium}
          dealPrice={prices.maitama}
          onChangeDealPrice={value =>
            setPrices(current => ({ ...current, maitama: value }))
          }
          originalTag={copy.local}
          originalPrice={copy.branch2.originalPrice}
          discountLabel={copy.branch2.discount}
          vouchers={copy.branch2.vouchers}
        />
        <BusinessBranchPricingCard
          name={copy.branch3.name}
          address={copy.branch3.address}
          tag={copy.unavailable}
          tagTone="warning"
          enabled={false}
          disabled
          marker="muted"
          unavailable={
            <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface p-2.5">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Icon name="support" size={17} color={colors.tertiary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {copy.branch3.notice}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="tertiary" className="shrink-0">
                {copy.branch3.noticeStatus}
              </VemtapText>
            </View>
          }
        />
      </View>

      <BusinessInfoStrip
        className="mt-4"
        tone="tint"
        icon="sync"
        title={copy.catalogCalloutTitle}
        body={copy.catalogCalloutBody}
      />
    </BusinessScreenLayout>
  );
}
