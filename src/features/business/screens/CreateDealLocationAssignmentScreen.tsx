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
  BusinessSelectField,
  BusinessStatusPill,
  BusinessSwitchRow,
} from '@features/business/components/BusinessPrimitives';
import { SetupStepBar } from '@features/business/components/BusinessSetupPrimitives';
import {
  BusinessPanel,
  BusinessScopeCard,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessBranchPricingCard,
  BusinessCheckLine,
} from '@features/business/components/BusinessLocationPrimitives';

cssInterop(Pressable, { className: 'style' });

const base = strings.dealLocationAssignment;
const copy = base.createDeal;

/**
 * Create-deal wizard, step 2: choose which branches honour the voucher, set
 * per-branch pricing and allocation, then hand off to review & launch.
 */
export function CreateDealLocationAssignmentScreen({
  onBack,
  onMoreActions,
  onReviewLaunch,
  onSaveDraft,
  onManageMerchantTier,
  onCustomPriceToggle,
}: {
  onBack?: () => void;
  onMoreActions?: () => void;
  onReviewLaunch?: () => void;
  onSaveDraft?: () => void;
  onManageMerchantTier?: () => void;
  onCustomPriceToggle?: (branchId: string) => void;
}) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [participating, setParticipating] = useState<Record<string, boolean>>({
    wuse: true,
    vi: true,
    garki: false,
  });
  const [customPrice, setCustomPrice] = useState<Record<string, boolean>>({
    wuse: false,
    vi: true,
  });
  const [gift, setGift] = useState(true);
  const [boost, setBoost] = useState(true);

  const branchIds = ['wuse', 'vi', 'garki'] as const;
  const participatingCount = Object.values(participating).filter(Boolean).length;

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
        <View className="gap-2.5 pb-2">
          <Button
            label={copy.review}
            labelVariant="labelMd"
            onPress={onReviewLaunch}
            rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.saveDraft}
            onPress={onSaveDraft}
            className="min-h-11 items-center justify-center"
          >
            <VemtapText variant="labelMd" tone="secondary" numberOfLines={1}>
              {copy.saveDraft}
            </VemtapText>
          </Pressable>
          <View className="flex-row items-center justify-center gap-1">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.helperPrefix}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.helperLink}
              hitSlop={8}
              onPress={onManageMerchantTier}
            >
              <VemtapText variant="caption" className="font-sans-semibold text-primary">
                {copy.helperLink}
              </VemtapText>
            </Pressable>
          </View>
        </View>
      }
    >
      <SetupStepBar step={copy.step} percent={copy.stepRight} progress={66} />

      <View className="mt-3 flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm">
        <View className="relative h-16 w-16 shrink-0 overflow-hidden rounded-field bg-surface-container">
          <BusinessProductImage
            source={businessOpsMedia.productRibeyeSummary}
            alt={businessOpsMedia.productRibeyeSummary.alt}
            className="h-full w-full"
          />
          <View className="absolute left-1 top-1 rounded-full bg-badge-discount-bg px-1.5 py-0.5">
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.discountChip}
            </VemtapText>
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={1}
            >
              {copy.dealName}
            </VemtapText>
            <BusinessStatusPill label={copy.draft} tone="brand" />
          </View>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="mt-0.5"
            numberOfLines={1}
          >
            {copy.dealMeta}
          </VemtapText>
          <View className="mt-1 flex-row items-baseline gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.dealPrice}
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary" className="line-through">
              {copy.dealWas}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="ml-auto font-sans-medium text-badge-discount-text"
            >
              {copy.dealSave}
            </VemtapText>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="min-w-0 flex-1 font-sans-semibold">
          {base.scopeTitle}
        </VemtapText>
        <Icon name="storefront" size={18} color={colors.textTertiary} />
      </View>

      <View className="mt-2 gap-2">
        <BusinessScopeCard
          title={base.selectedTitle}
          body={base.selectedBody}
          selected={scope === 'selected'}
          onPress={() => setScope('selected')}
        />
        <BusinessScopeCard
          title={base.allTitle}
          body={base.allBody}
          tag={base.autoSyncTag}
          selected={scope === 'all'}
          onPress={() => setScope('all')}
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {base.participationTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {base.participatingTemplate
              .replace('%s', String(participatingCount))
              .replace('%s', '3')}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={base.selectAll}
          hitSlop={8}
          onPress={() => setParticipating({ wuse: true, vi: true, garki: true })}
          className="min-h-9 justify-center rounded-field px-2 active:bg-surface-tint"
        >
          <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
            {base.selectAll}
          </VemtapText>
        </Pressable>
      </View>

      <View className={`mt-2 gap-3 ${scope === 'all' ? 'opacity-50' : ''}`}>
        {copy.branches.map((branch, index) => {
          const id = branchIds[index];
          const disabled = index === 2;
          const enabled = participating[id];
          return (
            <BusinessBranchPricingCard
              key={branch.name}
              name={branch.name}
              address={branch.address}
              tag={branch.badge}
              tagTone={'badgeTone' in branch ? branch.badgeTone : 'success'}
              enabled={enabled}
              disabled={disabled}
              marker={enabled && !disabled ? 'live' : 'muted'}
              onToggle={value =>
                setParticipating(current => ({ ...current, [id]: value }))
              }
              unavailable={
                'notice' in branch && branch.notice ? (
                  <View className="flex-row items-start gap-2 rounded-field bg-surface-container p-2.5">
                    <Icon name="info" size={17} color={colors.textTertiary} />
                    <VemtapText
                      variant="caption"
                      tone="secondary"
                      className="min-w-0 flex-1 leading-snug"
                    >
                      {branch.notice}
                    </VemtapText>
                  </View>
                ) : null
              }
            >
              {'price' in branch && branch.price ? (
                <View
                  className={`gap-2 rounded-field p-3 ${customPrice[id] ? 'bg-surface-tint' : 'bg-surface-subtle'}`}
                >
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="min-w-0 flex-1">
                      <VemtapText
                        variant="caption"
                        tone={customPrice[id] ? 'brand' : 'secondary'}
                        numberOfLines={1}
                      >
                        {branch.priceLabel}
                      </VemtapText>
                      {'priceNote' in branch && branch.priceNote ? (
                        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                          {branch.priceNote}
                        </VemtapText>
                      ) : null}
                    </View>
                    <VemtapText
                      variant="labelMd"
                      className={
                        customPrice[id]
                          ? 'font-sans-bold text-primary'
                          : 'font-sans-semibold'
                      }
                      numberOfLines={1}
                    >
                      {branch.price}
                    </VemtapText>
                  </View>
                  <View className="flex-row items-center justify-between gap-2">
                    <VemtapText variant="caption" tone="secondary">
                      {copy.weeklyAllocation}
                    </VemtapText>
                    <View className="rounded bg-surface-container px-2 py-0.5">
                      <VemtapText variant="labelSm">{branch.allocation}</VemtapText>
                    </View>
                  </View>
                </View>
              ) : null}
              {'checkbox' in branch && branch.checkbox ? (
                <BusinessCheckLine
                  label={branch.checkbox}
                  checked={customPrice[id]}
                  tone={customPrice[id] ? 'brand' : 'default'}
                  onPress={() => {
                    setCustomPrice(current => ({ ...current, [id]: !current[id] }));
                    onCustomPriceToggle?.(id);
                  }}
                />
              ) : null}
            </BusinessBranchPricingCard>
          );
        })}
      </View>

      <View className="mt-4">
        <VemtapText variant="labelMd" className="font-sans-semibold">
          {copy.redemptionTitle}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-2">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.claimLimit}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="mt-0.5">
              {copy.claimLimitHint}
            </VemtapText>
          </View>
          <BusinessSelectField
            value={copy.claimLimitValue}
            onPress={() => undefined}
            accessibilityLabel={copy.claimLimit}
            className="min-h-9 shrink-0 px-3 py-1.5"
          />
        </View>
        <View className="h-px w-full bg-surface-container" />
        <BusinessSwitchRow
          title={copy.giftingTitle}
          subtitle={copy.giftingBody}
          value={gift}
          onValueChange={setGift}
          icon="gift"
        />
        <View className="h-px w-full bg-surface-container" />
        <View className="gap-2 rounded-field bg-surface-container-low p-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <VemtapText variant="labelMd" className="min-w-0 font-sans-bold">
                {copy.boostTitle}
              </VemtapText>
              <View className="rounded-full bg-tertiary-fixed px-2 py-0.5">
                <VemtapText variant="micro" className="font-sans-semibold text-tertiary">
                  {copy.boostBadge}
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0">
              <BusinessSwitchRow
                title=""
                accessibilityLabel={copy.boostTitle}
                value={boost}
                onValueChange={setBoost}
              />
            </View>
          </View>
          <VemtapText variant="caption" tone="secondary" className="leading-snug">
            {copy.boostBodyPrefix}
          </VemtapText>
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
