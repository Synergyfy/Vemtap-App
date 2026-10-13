import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Avatar } from '@components/ui/Avatar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessInfoStrip,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { posOfflineLines } from '@features/business/data/businessPosLedgerData';

const copy = strings.posOfflineCheckoutTerminal;

export interface PosOfflineCheckoutTerminalScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSearch?: () => void;
  onScan?: () => void;
  onReindex?: () => void;
  onAttachPatron?: () => void;
  onSelectCashTender?: () => void;
  onEnterExternalRef?: () => void;
  onOpenHouseTab?: () => void;
  onCompleteSale?: () => void;
  onOpenQueue?: () => void;
}

/**
 * `pos_offline_sale_local_buffer_terminal` - the register with no network. The
 * encrypted local ledger, cached menu prices and the immediate-kick tender all
 * have to work without a WAN handshake, so nothing here blocks on the cloud.
 */
export function PosOfflineCheckoutTerminalScreen({
  onBack,
  onOpenProfile,
  onSearch,
  onScan,
  onReindex,
  onAttachPatron,
  onSelectCashTender,
  onEnterExternalRef,
  onOpenHouseTab,
  onCompleteSale,
  onOpenQueue,
}: PosOfflineCheckoutTerminalScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        subtitle: copy.headerSubtitle,
        onBack,
        titleVariant: 'labelMd',
        titleAccessory: (
          <View className="mt-1 flex-row items-center gap-1.5">
            <Icon name="lock" size={12} color={colors.textTertiary} />
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.encryptionLabel}
            </VemtapText>
          </View>
        ),
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
          <Button
            label={copy.completeCta}
            accessibilityLabel={copy.completeCta}
            labelVariant="labelMd"
            onPress={onCompleteSale}
            rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
          />
          <View className="mt-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.queueCta}
              onPress={onOpenQueue}
              className="min-h-10 flex-row items-center justify-center gap-1.5 active:opacity-70"
            >
              <Icon name="inventory" size={15} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.queueCta}
              </VemtapText>
            </Pressable>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2.5 rounded-card bg-warning-container p-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface/40">
          <Icon name="cloudOff" size={20} color={colors.tertiary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.offlineTitle}
          </VemtapText>
          <VemtapText variant="caption" numberOfLines={3}>
            {copy.offlineBody}
          </VemtapText>
        </View>
        <BusinessStatusPill
          label={copy.queueBadge}
          tone="tertiary"
          className="shrink-0"
        />
      </View>

      <View className="mt-3 flex-row items-center gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="store" size={16} color={colors.primary} />
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={2}>
            {copy.branchLabel}
          </VemtapText>
        </View>
        <View className="shrink-0 items-end">
          <View className="flex-row items-center gap-1.5 rounded-full bg-error-container px-2.5 py-1">
            <View className="h-2 w-2 rounded-full bg-error" />
            <VemtapText
              variant="micro"
              tone="error"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.branchOffline}
            </VemtapText>
          </View>
          <VemtapText variant="micro" tone="error" className="mt-1" numberOfLines={1}>
            {copy.bufferLabel}
          </VemtapText>
        </View>
      </View>
      <VemtapText variant="caption" tone="secondary" className="mt-1" numberOfLines={1}>
        {copy.tillLabel}
      </VemtapText>

      <View className="mt-3 flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <BusinessSearchTrigger
            placeholder={copy.searchPlaceholder}
            onPress={onSearch}
            onFilterPress={onScan}
            filterLabel={copy.searchPlaceholder}
          />
        </View>
      </View>
      <View className="mt-2 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="checkCircle" size={15} color={colors.success} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.cacheLabel}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.reindexCta}
          onPress={onReindex}
          className="min-h-9 shrink-0 justify-center rounded-lg px-2 active:bg-surface-tint"
        >
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.reindexCta}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-3 overflow-hidden rounded-card bg-surface-tint">
        <View className="flex-row items-start gap-2 p-3">
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.ticketRef}
            </VemtapText>
            <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
              <BusinessStatusPill label={copy.ticketBadge} tone="neutral" />
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {copy.ticketWhen}
              </VemtapText>
            </View>
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="mt-1"
              numberOfLines={1}
            >
              {copy.ticketCashier}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center gap-2 border-t border-surface-container-low bg-surface px-3 py-2.5">
          <Avatar name={copy.guestLabel} size="sm" tone="neutral" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.guestLabel}
            </VemtapText>
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.guestBody}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.attachPatronCta}
            onPress={onAttachPatron}
            className="min-h-9 shrink-0 justify-center rounded-field bg-primary px-3 active:scale-95"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-surface"
              numberOfLines={1}
            >
              {copy.attachPatronCta}
            </VemtapText>
          </Pressable>
        </View>
      </View>

      <View className="mt-3 gap-2.5">
        {posOfflineLines.map(line => (
          <View
            key={line.id}
            className="flex-row items-start gap-2 rounded-card bg-surface p-3 shadow-sm"
          >
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="shrink-0"
              numberOfLines={1}
            >
              {line.qty}
            </VemtapText>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {line.name}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {line.note}
              </VemtapText>
            </View>
            <VemtapText
              variant="labelSm"
              className="shrink-0 font-sans-bold"
              numberOfLines={1}
            >
              {line.price}
            </VemtapText>
          </View>
        ))}
      </View>

      <View className="mt-3 rounded-card bg-surface p-3 shadow-sm">
        <View className="gap-1.5">
          <BusinessTotalsRow label={copy.subtotalLabel} value={copy.subtotalValue} />
          <BusinessTotalsRow label={copy.vatLabel} value={copy.vatValue} />
        </View>
        <BusinessGrandTotalRow label={copy.totalLabel} value={copy.totalValue} />
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.tenderTitle}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1.5">
          <Icon name="bolt" size={14} color={colors.tertiary} />
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.tenderMeta}
          </VemtapText>
        </View>
      </View>
      <VemtapText variant="caption" tone="secondary" className="mt-0.5" numberOfLines={2}>
        {copy.tenderBody}
      </VemtapText>

      <View className="mt-2 rounded-card bg-surface-tint p-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.cashTender}
          onPress={onSelectCashTender}
          className="flex-row items-center gap-2.5 active:scale-[0.99]"
        >
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            <Icon name="wallet" size={19} color={colors.surface} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.cashTender}
            </VemtapText>
            <VemtapText variant="caption" tone="brand" numberOfLines={1}>
              {copy.cashTenderMeta}
            </VemtapText>
          </View>
          <Icon name="checkCircle" size={20} color={colors.primary} />
        </Pressable>
        <View className="mt-2.5 flex-row gap-2 border-t border-surface-container-low pt-2.5">
          <View className="min-w-0 flex-1">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.amountTenderedLabel}
            </VemtapText>
            <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
              {copy.amountTenderedValue}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 items-end">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.changeDueLabel}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              tone="success"
              className="font-sans-bold"
              numberOfLines={1}
            >
              {copy.changeDueValue}
            </VemtapText>
          </View>
        </View>
      </View>

      <View className="mt-2 gap-2">
        <View className="flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
            <Icon name="creditCard" size={19} color={colors.textSecondary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.externalTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.externalBody}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.externalCta}
            onPress={onEnterExternalRef}
            className="min-h-9 shrink-0 justify-center rounded-field bg-surface-tint px-2.5 active:scale-95"
          >
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.externalCta}
            </VemtapText>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.houseTabTitle}
          onPress={onOpenHouseTab}
          className="flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm active:scale-[0.98]"
        >
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
            <Icon name="receiptLong" size={19} color={colors.textSecondary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.houseTabTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.houseTabBody}
            </VemtapText>
          </View>
          <Icon name="forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <BusinessInfoStrip
        className="mt-3"
        icon="verifiedUser"
        title={copy.guaranteeTitle}
        body={copy.guaranteeBody}
        tone="subtle"
      />
    </BusinessScreenLayout>
  );
}
