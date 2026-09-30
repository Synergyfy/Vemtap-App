import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessInfoStrip,
  BusinessLinkRow,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import {
  posShiftAuditLog,
  posStockCountSteps,
} from '@features/business/data/businessPosCustomerData';

const copy = strings.posProductShiftStockStatus;

/** Availability tile tone per shift state. */
const availabilityTone = {
  inStock: 'bg-success-container',
  low: 'bg-surface-container',
  out: 'bg-surface-container',
} as const;

export interface PosProductShiftStockStatusScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onToggleRegisterAvailability?: (available: boolean) => void;
  onMarkSoldOut?: () => void;
  onAdjustCount?: (step: string) => void;
  onOpenSetCount?: () => void;
  onOpenGovernance?: () => void;
  onAddToSale?: () => void;
  onSave?: () => void;
}

/**
 * `pos_product_shift_stock_status` - one product's shift availability: the
 * branch sale price, the three availability states, the live prepped-count
 * stepper, the audit log and the governance hand-off.
 */
export function PosProductShiftStockStatusScreen({
  onBack,
  onOpenProfile,
  onToggleRegisterAvailability,
  onMarkSoldOut,
  onAdjustCount,
  onOpenSetCount,
  onOpenGovernance,
  onAddToSale,
  onSave,
}: PosProductShiftStockStatusScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        titleVariant: 'labelMd',
        actions: [
          {
            icon: 'accountCircle',
            label: copy.profileActionLabel,
            onPress: onOpenProfile,
          },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <View className="flex-row items-center gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={`${copy.addToSaleCta}  ${copy.listPrice}`}
                accessibilityLabel={copy.addToSaleCta}
                labelVariant="labelMd"
                onPress={onAddToSale}
                leftIcon={<Icon name="cartPlus" size={17} color={colors.surface} />}
              />
            </View>
          </View>
          <View className="mt-2">
            <Button
              label={copy.saveCta}
              labelVariant="labelMd"
              variant="secondary"
              onPress={onSave}
              leftIcon={<Icon name="save" size={17} color={colors.text} />}
            />
          </View>
        </BusinessActionDock>
      }
    >
      <BusinessInfoStrip
        icon="cloudDone"
        title={copy.syncBanner}
        body={copy.syncBanner}
        tone="subtle"
      />

      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5 rounded-full bg-surface-tint px-2.5 py-1.5">
          <Icon name="store" size={15} color={colors.primary} />
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {copy.stationLabel}
          </VemtapText>
        </View>
        <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
          {copy.shiftBadge}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-3">
        <View className="flex-row items-start gap-3">
          <View className="h-20 w-20 shrink-0 items-center justify-center rounded-field bg-surface-container">
            <Icon name="grill" size={26} color={colors.textSecondary} />
            <VemtapText variant="micro" className="font-sans-bold" numberOfLines={1}>
              {copy.imageTag}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              Woodfire Ribeye Steak (250g)
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-1"
              numberOfLines={1}
            >
              {`${copy.skuLabel} WRS-01 \u2022 ${copy.barLabel} 8901248019`}
            </VemtapText>
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-success" />
              <VemtapText variant="caption" tone="success" numberOfLines={1}>
                {copy.onlineLabel}
              </VemtapText>
            </View>
          </View>
        </View>
      </BusinessPanel>

      <View className="mt-3 rounded-card bg-surface-tint p-3">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.priceTitle}
          </VemtapText>
          <View className="shrink-0 flex-row items-center gap-1.5">
            <Icon name="localOffer" size={15} color={colors.success} />
            <VemtapText variant="caption" tone="success" numberOfLines={1}>
              {copy.priceBadge}
            </VemtapText>
          </View>
        </View>
        <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
          <VemtapText variant="headingXl" className="font-sans-bold" numberOfLines={1}>
            {'\u20a612,800'}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="tertiary" numberOfLines={1}>
            {'\u20a616,000'}
          </VemtapText>
          <BusinessStatusPill label="20% OFF Active" tone="success" />
        </View>
        <VemtapText
          variant="caption"
          tone="secondary"
          className="mt-1.5"
          numberOfLines={2}
        >
          {copy.priceNote}
        </VemtapText>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.availabilityTitle}
        </VemtapText>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
          {copy.availabilityMeta}
        </VemtapText>
      </View>

      <View className="mt-2 overflow-hidden rounded-card bg-surface shadow-sm">
        <View className="flex-row items-center gap-3 px-3 py-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
            <Icon name="pointOfSale" size={19} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.registerTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="success" numberOfLines={1}>
              {copy.registerBody}
            </VemtapText>
          </View>
          <BusinessSettingRow
            title={copy.registerTitle}
            trailing="switch"
            switchValue
            accessibilityLabel={copy.registerTitle}
            onSwitchChange={(value: boolean) => onToggleRegisterAvailability?.(value)}
            className="p-0"
          />
        </View>
      </View>

      <View className="mt-2 flex-row gap-2">
        {(
          [
            {
              id: 'inStock',
              icon: 'checkCircle',
              label: copy.inStockLabel,
              value: copy.inStockValue,
            },
            { id: 'low', icon: 'alert', label: copy.lowLabel, value: copy.lowValue },
            { id: 'out', icon: 'block', label: copy.outLabel, value: copy.outValue },
          ] satisfies {
            id: 'inStock' | 'low' | 'out';
            icon: IconName;
            label: string;
            value: string;
          }[]
        ).map(state => (
          <View
            key={state.id}
            className={`min-w-0 flex-1 items-center gap-1 rounded-field p-2.5 ${availabilityTone[state.id as keyof typeof availabilityTone]}`}
          >
            <Icon
              name={state.icon}
              size={17}
              color={state.id === 'inStock' ? colors.primary : colors.textSecondary}
            />
            <VemtapText
              variant="caption"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {state.label}
            </VemtapText>
            <VemtapText
              variant="micro"
              tone={state.id === 'inStock' ? 'success' : 'tertiary'}
              numberOfLines={1}
            >
              {state.value}
            </VemtapText>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.soldOutCta}
        onPress={onMarkSoldOut}
        className="mt-2 min-h-11 flex-row items-center justify-center gap-2 rounded-field bg-error-container px-3 active:scale-[0.99]"
      >
        <Icon name="doNotDisturb" size={17} color={colors.error} />
        <VemtapText
          variant="labelSm"
          className="font-sans-semibold text-error"
          numberOfLines={2}
        >
          {copy.soldOutCta}
        </VemtapText>
      </Pressable>

      <BusinessPanel className="mt-3">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.countTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.countMeta}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-baseline gap-1">
            <VemtapText variant="headingXl" className="font-sans-bold" numberOfLines={1}>
              {copy.countValue}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.countUnit}
            </VemtapText>
          </View>
        </View>

        <View className="mt-3 flex-row gap-2">
          {posStockCountSteps.map(step => (
            <Pressable
              key={step}
              accessibilityRole="button"
              accessibilityLabel={`${copy.countTitle} ${step}`}
              onPress={() => onAdjustCount?.(step)}
              className="min-h-11 min-w-0 flex-1 items-center justify-center rounded-field bg-surface-container active:scale-95"
            >
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {step}
              </VemtapText>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.setCta}
            onPress={onOpenSetCount}
            className="min-h-11 shrink-0 justify-center rounded-field bg-surface-container px-3 active:scale-95"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.setCta}
            </VemtapText>
          </Pressable>
        </View>

        <View className="mt-3 flex-row items-start gap-2.5 rounded-field bg-surface-tint p-2.5">
          <View className="mt-0.5 shrink-0">
            <Icon name="sync" size={17} color={colors.primary} />
          </View>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={3}
          >
            {copy.syncNote}
          </VemtapText>
        </View>
      </BusinessPanel>

      <View className="mt-3 rounded-card bg-surface-tint p-3">
        <View className="flex-row items-start gap-2.5">
          <View className="mt-0.5 shrink-0">
            <Icon name="adminPanel" size={19} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {copy.governanceTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5"
              numberOfLines={3}
            >
              {copy.governanceBody}
            </VemtapText>
            <BusinessLinkRow
              label={copy.governanceCta}
              onPress={onOpenGovernance}
              className="mt-1"
            />
          </View>
        </View>
      </View>

      <VemtapText
        variant="micro"
        tone="tertiary"
        className="mt-4 font-sans-semibold uppercase tracking-wider"
        numberOfLines={1}
      >
        {copy.auditTitle}
      </VemtapText>
      <View className="mt-1.5 overflow-hidden rounded-card bg-surface shadow-sm">
        {posShiftAuditLog.map((entry, index) => (
          <View key={entry.id}>
            {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
            <View className="flex-row items-center justify-between gap-2 px-3 py-2.5">
              <VemtapText variant="caption" className="min-w-0 flex-1" numberOfLines={2}>
                {entry.label}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="shrink-0"
                numberOfLines={1}
              >
                {entry.time}
              </VemtapText>
            </View>
          </View>
        ))}
      </View>
    </BusinessScreenLayout>
  );
}
