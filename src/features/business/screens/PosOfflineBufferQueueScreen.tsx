import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessInfoStrip,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  posBufferFilters,
  posBufferedSales,
} from '@features/business/data/businessPosLedgerData';

const copy = strings.posOfflineBufferQueue;

export interface PosOfflineBufferQueueScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSelectFilter?: (filterId: string) => void;
  onOpenSale?: (saleId: string) => void;
  onPrintTape?: () => void;
  onExportBackup?: () => void;
  onReturnToRegister?: () => void;
}

/**
 * `pos_offline_buffer_local_queue` - the encrypted device queue. Every sale
 * stays on the till until the WAN handshake returns, so the screen leads with
 * what is pending and what must not be touched.
 */
export function PosOfflineBufferQueueScreen({
  onBack,
  onOpenProfile,
  onSelectFilter,
  onOpenSale,
  onPrintTape,
  onExportBackup,
  onReturnToRegister,
}: PosOfflineBufferQueueScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        subtitle: copy.headerSubtitle,
        onBack,
        titleVariant: 'labelMd',
        titleAccessory: (
          <View className="mt-1 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
              {copy.onlineBadge}
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
            label={copy.returnCta}
            accessibilityLabel={copy.returnCta}
            labelVariant="labelMd"
            onPress={onReturnToRegister}
            rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center justify-between gap-2 rounded-card bg-warning-container p-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Icon name="cloudOff" size={18} color={colors.tertiary} />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.tillLabel}
            </VemtapText>
            <VemtapText variant="micro" numberOfLines={1}>
              {copy.tillMeta}
            </VemtapText>
          </View>
        </View>
        <BusinessStatusPill
          label={copy.queueBadge}
          tone="tertiary"
          className="shrink-0"
        />
      </View>

      <View className="mt-3 flex-row gap-2">
        <View className="min-w-0 flex-1 rounded-card bg-surface p-3 shadow-sm">
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="uppercase tracking-wider"
            numberOfLines={1}
          >
            {copy.pendingTitle}
          </VemtapText>
          <VemtapText variant="headingLg" className="font-sans-bold" numberOfLines={1}>
            {copy.pendingValue}
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1 rounded-card bg-surface p-3 shadow-sm">
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="uppercase tracking-wider"
            numberOfLines={1}
          >
            {copy.volumeLabel}
          </VemtapText>
          <VemtapText
            variant="headingLg"
            className="font-sans-bold text-primary"
            numberOfLines={1}
          >
            {copy.volumeValue}
          </VemtapText>
        </View>
      </View>

      <View className="mt-2 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
          <Icon name="save" size={19} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.storageLabel}
          </VemtapText>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Icon name="checkCircle" size={13} color={colors.success} />
            <VemtapText variant="micro" tone="success" numberOfLines={1}>
              {copy.storageMeta}
            </VemtapText>
          </View>
        </View>
        <BusinessStatusPill label={copy.storageBadge} tone="brand" className="shrink-0" />
      </View>

      <BusinessInfoStrip
        className="mt-2"
        icon="cloudQueue"
        body={copy.guaranteeBody}
        tone="subtle"
      />

      <View className="mt-3">
        <BusinessChipScroller>
          {posBufferFilters.map(filter => (
            <BusinessCountChip
              key={filter.id}
              label={filter.label}
              count={filter.count}
              selected={filter.active}
              onPress={() => onSelectFilter?.(filter.id)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <View className="mt-2 gap-2.5">
        {posBufferedSales.map(sale => (
          <Pressable
            key={sale.id}
            accessibilityRole="button"
            accessibilityLabel={`${sale.reference} ${sale.total}`}
            onPress={() => onOpenSale?.(sale.id)}
            className="rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {sale.reference}
                </VemtapText>
                <View className="mt-0.5 flex-row flex-wrap items-center gap-1.5">
                  <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                    {sale.when}
                  </VemtapText>
                  {sale.whenNote ? (
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {sale.whenNote}
                    </VemtapText>
                  ) : null}
                </View>
              </View>
              <View className="shrink-0 items-end">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {sale.total}
                </VemtapText>
                <View className="mt-1 flex-row items-center gap-1.5 rounded-full bg-error-container px-2 py-0.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-error" />
                  <VemtapText variant="micro" tone="error" numberOfLines={1}>
                    {copy.queueBadgeRow}
                  </VemtapText>
                </View>
              </View>
            </View>

            <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <Icon name={sale.methodIcon} size={14} color={colors.textSecondary} />
                <VemtapText variant="caption" numberOfLines={1}>
                  {sale.method}
                </VemtapText>
              </View>
              {sale.sealLabel ? (
                <View className="shrink-0 flex-row items-center gap-1.5">
                  <Icon name="verified" size={13} color={colors.success} />
                  <VemtapText variant="micro" tone="success" numberOfLines={1}>
                    {sale.sealLabel}
                  </VemtapText>
                </View>
              ) : null}
            </View>

            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-1.5"
              numberOfLines={2}
            >
              {sale.detail}
            </VemtapText>
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="mt-0.5"
              numberOfLines={1}
            >
              {sale.cashier}
            </VemtapText>
            {sale.seal ? (
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="mt-0.5"
                numberOfLines={1}
              >
                {sale.seal}
              </VemtapText>
            ) : null}
          </Pressable>
        ))}
      </View>

      <BusinessPanel className="mt-3" title={copy.integrityTitle} icon="verifiedUser">
        <View className="flex-row items-start gap-2.5 rounded-field bg-error-container p-2.5">
          <View className="mt-0.5 shrink-0">
            <Icon name="alert" size={17} color={colors.error} />
          </View>
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 leading-relaxed"
            numberOfLines={4}
          >
            {copy.warningTitle}
          </VemtapText>
        </View>
        <View className="mt-2 gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.printCta}
            onPress={onPrintTape}
            className="min-h-11 flex-row items-center gap-2.5 rounded-field bg-surface-container px-3 active:scale-[0.99]"
          >
            <Icon name="printerPos" size={18} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.printCta}
            </VemtapText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.exportCta}
            onPress={onExportBackup}
            className="min-h-11 flex-row items-center gap-2.5 rounded-field bg-surface-container px-3 active:scale-[0.99]"
          >
            <Icon name="download" size={18} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.exportCta}
            </VemtapText>
          </Pressable>
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
