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
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessLineItem,
  BusinessQrFrame,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import type { ReceiptView } from '@features/business/utils/posMappers';

const copy = strings.digitalEReceipt;

const statusTone = {
  completed: 'success',
  partial_refund: 'warning',
  refunded: 'neutral',
} as const;

export interface DigitalEReceiptScreenProps {
  receipt?: ReceiptView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  canRate?: boolean;
  onBack?: () => void;
  onShare?: () => void;
  onRateAndTip?: () => void;
}

/**
 * Digital e-receipt: receipt identity, line items, totals, how it was paid,
 * and a receipt reference block to share.
 */
export function DigitalEReceiptScreen({
  receipt,
  isLoading,
  isError,
  onRetry,
  canRate,
  onBack,
  onShare,
  onRateAndTip,
}: DigitalEReceiptScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        receipt ? (
          <BusinessActionDock>
            {canRate ? (
              <Button
                label={copy.rateCta}
                labelVariant="labelMd"
                onPress={onRateAndTip}
                leftIcon={<Icon name="rateReview" size={18} color={colors.surface} />}
              />
            ) : null}
            <Button
              label={copy.shareCta}
              labelVariant="labelSm"
              variant="secondary"
              onPress={onShare}
            />
          </BusinessActionDock>
        ) : undefined
      }
    >
      {!receipt ? (
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
            <View className="h-11 w-11 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="checkBold" size={22} color={colors.badgeDiscountText} />
            </View>
            <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={1}>
              {copy.doneTitle}
            </VemtapText>
            {receipt.header ? (
              <VemtapText
                variant="bodyMd"
                tone="secondary"
                className="text-center"
                numberOfLines={2}
              >
                {receipt.header}
              </VemtapText>
            ) : null}
          </View>

          <BusinessPanel className="mt-3" icon="receipt">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText
                variant="micro"
                tone="secondary"
                className="font-sans-semibold uppercase tracking-wider"
                numberOfLines={1}
              >
                {copy.receiptLabel}
              </VemtapText>
              <BusinessStatusPill
                label={copy.status[receipt.status]}
                tone={statusTone[receipt.status]}
              />
            </View>
            <View className="gap-1.5">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {[receipt.storeName, receipt.branchName].filter(Boolean).join(' • ')}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {`${receipt.receiptNumber} · ${receipt.when}`}
              </VemtapText>
              {receipt.address ? (
                <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                  {receipt.address}
                </VemtapText>
              ) : null}
              {receipt.phone || receipt.tin ? (
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {[receipt.phone, receipt.tin ? copy.tinLabel(receipt.tin) : '']
                    .filter(Boolean)
                    .join(' · ')}
                </VemtapText>
              ) : null}
            </View>
            {receipt.customer ? (
              <View className="mt-1 flex-row items-center gap-1.5">
                <Icon name="accountCircle" size={14} color={colors.textTertiary} />
                <VemtapText
                  variant="caption"
                  tone="tertiary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {copy.customerLabel(receipt.customer.name)}
                </VemtapText>
              </View>
            ) : null}
          </BusinessPanel>

          <BusinessPanel
            className="mt-3"
            title={copy.itemsTitle}
            icon="list"
            badge={String(receipt.lines.length)}
            badgeTone="neutral"
          >
            <View className="gap-3">
              {receipt.lines.map(line => (
                <BusinessLineItem
                  key={line.id}
                  name={line.name}
                  modifier={line.note}
                  quantity={`${line.qty}×`}
                  price={line.price}
                />
              ))}
            </View>
          </BusinessPanel>

          <BusinessPanel className="mt-3" title={copy.totalsTitle} icon="payments">
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
            <BusinessGrandTotalRow label={copy.paidLabel} value={receipt.amount} />
            <View className="gap-1.5">
              {receipt.payments.map(row => (
                <BusinessTotalsRow key={row.id} label={row.label} value={row.value} />
              ))}
            </View>
          </BusinessPanel>

          <View className="mt-3 items-center">
            <BusinessQrFrame
              size="sm"
              glyph="receiptLong"
              caption={receipt.receiptNumber}
              label={copy.receiptLabel}
              className="w-full"
            />
          </View>

          <View className="mt-3 items-center gap-1">
            {receipt.footer ? (
              <VemtapText
                variant="caption"
                tone="tertiary"
                className="text-center"
                numberOfLines={3}
              >
                {receipt.footer}
              </VemtapText>
            ) : null}
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="text-center"
              numberOfLines={2}
            >
              {copy.legal}
            </VemtapText>
          </View>
        </>
      )}
    </BusinessScreenLayout>
  );
}
