import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessLineItem,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import type { ReceiptView } from '@features/business/utils/posMappers';

const copy = strings.posSaleCompleted;

/** A sale saved offline: what the device knows before it syncs. */
export interface OfflineSaleView {
  clientRef: string;
  amount: string;
  tender: string;
  itemNames: string[];
  when: string;
}

export interface PosSaleCompletedScreenProps {
  receipt?: ReceiptView;
  offlineSale?: OfflineSaleView;
  tillLabel?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onViewReceipt?: () => void;
  onSendToMobile?: () => void;
  onNewSale?: () => void;
}

/** Post-tender confirmation: receipt identity, itemised lines, totals, tender breakdown and next actions. */
export function PosSaleCompletedScreen({
  receipt,
  offlineSale,
  tillLabel,
  isLoading,
  isError,
  onRetry,
  onViewReceipt,
  onSendToMobile,
  onNewSale,
}: PosSaleCompletedScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title:
          [tillLabel, receipt?.storeName].filter(Boolean).join(' • ') || copy.headline,
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.newSaleCta}
            labelVariant="labelMd"
            onPress={onNewSale}
            leftIcon={<Icon name="plus" size={18} color={colors.surface} />}
          />
          {receipt ? (
            <View className="flex-row gap-2">
              <View className="min-w-0 flex-1">
                <Button
                  label={copy.receiptCta}
                  labelVariant="labelSm"
                  variant="secondary"
                  onPress={onViewReceipt}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Button
                  label={copy.sendCta}
                  labelVariant="labelSm"
                  variant="secondary"
                  onPress={onSendToMobile}
                />
              </View>
            </View>
          ) : null}
        </BusinessActionDock>
      }
    >
      {offlineSale ? (
        <View className="items-center gap-2">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container">
            <Icon name="cloudOff" size={28} color={colors.textSecondary} />
          </View>
          <BusinessStatusPill label={copy.offlineBadge} tone="warning" />
          <VemtapText
            variant="headingLg"
            className="text-center text-heading-lg"
            numberOfLines={1}
          >
            {copy.offlineHeadline}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="secondary"
            className="text-center"
            numberOfLines={2}
          >
            {copy.paymentLine(offlineSale.amount, offlineSale.tender)}
          </VemtapText>
          <VemtapText
            variant="micro"
            tone="tertiary"
            className="text-center"
            numberOfLines={3}
          >
            {`${offlineSale.when} • ${offlineSale.itemNames.join(', ')}`}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="mt-2 text-center">
            {copy.offlineBody}
          </VemtapText>
        </View>
      ) : !receipt ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="items-center gap-2">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="checkBold" size={28} color={colors.badgeDiscountText} />
            </View>
            <BusinessStatusPill label={copy.statusBadge} tone="success" />
            <VemtapText
              variant="headingLg"
              className="text-center text-heading-lg"
              numberOfLines={1}
            >
              {copy.headline}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="text-center"
              numberOfLines={1}
            >
              {copy.paymentLine(receipt.amount, receipt.tender)}
            </VemtapText>
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={1}
            >
              {`${receipt.when} • ${receipt.receiptNumber}`}
            </VemtapText>
          </View>

          <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm">
            <BusinessIconWell icon="storefront" tone="brand" size="sm" />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {receipt.branchName || receipt.storeName}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.cashierLabel}
              </VemtapText>
            </View>
            <VemtapText
              variant="caption"
              className="shrink-0 font-sans-semibold"
              numberOfLines={1}
            >
              {receipt.cashier}
            </VemtapText>
          </View>

          {receipt.customer ? (
            <View className="mt-2 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
              <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-bold text-primary-foreground"
                  numberOfLines={1}
                >
                  {receipt.customer.initials}
                </VemtapText>
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {receipt.customer.name}
                </VemtapText>
                <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
                  {receipt.customer.phone}
                </VemtapText>
              </View>
              {receipt.pointsEarned > 0 ? (
                <View className="shrink-0 flex-row items-center gap-1">
                  <Icon name="starFilled" size={14} color={colors.primary} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-bold text-primary"
                    numberOfLines={1}
                  >
                    {copy.pointsEarned(receipt.pointsEarned)}
                  </VemtapText>
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="mt-3 gap-3 rounded-card bg-surface p-3 shadow-sm">
            {receipt.lines.map(line => (
              <BusinessLineItem
                key={line.id}
                name={`${line.qty}× ${line.name}`}
                modifier={line.note}
                quantity={undefined}
                price={line.price}
              />
            ))}
          </View>

          <BusinessPanel className="mt-3" title={copy.totalPaidLabel} icon="receipt">
            <View className="gap-1.5">
              {receipt.totals.map(row => (
                <BusinessTotalsRow
                  key={row.id}
                  label={row.label}
                  value={row.value}
                  tone={row.tone}
                />
              ))}
            </View>
            <BusinessGrandTotalRow label={copy.totalPaidLabel} value={receipt.amount} />
            <View className="gap-1.5">
              {receipt.payments.map(row => (
                <BusinessTotalsRow key={row.id} label={row.label} value={row.value} />
              ))}
            </View>
          </BusinessPanel>
        </>
      )}
    </BusinessScreenLayout>
  );
}
