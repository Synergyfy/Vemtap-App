import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { BottomSheet } from '@components/shared/BottomSheet';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessKeyValueRow,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessInitialsAvatar,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import type { ReceiptView } from '@features/business/utils/posMappers';

const copy = strings.posTransactionDetails;

const statusTone = {
  completed: 'success',
  partial_refund: 'warning',
  refunded: 'neutral',
} as const;

export interface PosTransactionDetailsScreenProps {
  receipt?: ReceiptView;
  /** e.g. `Shift opened 08:30 AM`; null when not rung up in a shift. */
  shiftLabel?: string | null;
  orderTypeLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isRefunding?: boolean;
  canRefund?: boolean;
  onBack?: () => void;
  onCopyReference?: (reference: string) => void;
  onOpenPatron?: () => void;
  onShare?: () => void;
  onViewEReceipt?: () => void;
  onRefund?: (reason: string) => void;
}

/**
 * One settled receipt in full: the transaction record, the attached patron and
 * the points they earned, line items, the tender breakdown and the refund.
 */
export function PosTransactionDetailsScreen({
  receipt,
  shiftLabel,
  orderTypeLabel,
  isLoading,
  isError,
  onRetry,
  isRefunding,
  canRefund,
  onBack,
  onCopyReference,
  onOpenPatron,
  onShare,
  onViewEReceipt,
  onRefund,
}: PosTransactionDetailsScreenProps) {
  const [refundVisible, setRefundVisible] = useState(false);
  const [reason, setReason] = useState('');
  const refundable = canRefund && receipt && receipt.status !== 'refunded';

  return (
    <>
      <BusinessScreenLayout
        header={{ title: copy.headerTitle, onBack, titleVariant: 'labelMd' }}
        contentContainerClassName="pb-8"
        footer={
          receipt ? (
            <BusinessActionDock>
              <View className="flex-row gap-2">
                <View className="min-w-0 flex-1">
                  <Button
                    label={copy.shareCta}
                    labelVariant="labelSm"
                    variant="secondary"
                    onPress={onShare}
                    leftIcon={<Icon name="share" size={15} color={colors.text} />}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Button
                    label={copy.eReceiptCta}
                    labelVariant="labelSm"
                    variant="secondary"
                    onPress={onViewEReceipt}
                    leftIcon={<Icon name="receiptLong" size={15} color={colors.text} />}
                  />
                </View>
              </View>
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
            <View className="overflow-hidden rounded-card bg-surface shadow-sm">
              <View className="items-center gap-1 px-4 pb-3 pt-4">
                <BusinessStatusPill
                  label={copy.status[receipt.status]}
                  tone={statusTone[receipt.status]}
                  icon="checkCircle"
                />
                <VemtapText
                  variant="display"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {receipt.amount}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {copy.totalLabel(receipt.tender)}
                </VemtapText>
              </View>
            </View>

            <BusinessPanel
              className="mt-3"
              title={copy.recordTitle}
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={receipt.receiptNumber}
                  onPress={() => onCopyReference?.(receipt.receiptNumber)}
                  className="flex-row items-center gap-1.5"
                >
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-primary"
                    numberOfLines={1}
                  >
                    {receipt.receiptNumber}
                  </VemtapText>
                  <Icon name="copy" size={15} color={colors.primary} />
                </Pressable>
              }
            >
              <View className="gap-3">
                <BusinessKeyValueRow
                  icon="schedule"
                  label={copy.timestampLabel}
                  value={receipt.when}
                />
                <BusinessKeyValueRow
                  icon="person"
                  label={copy.cashierLabel}
                  value={receipt.cashier}
                />
                <BusinessKeyValueRow
                  icon="store"
                  label={copy.outletLabel}
                  value={receipt.branchName}
                />
                {shiftLabel ? (
                  <BusinessKeyValueRow
                    icon="pointOfSale"
                    label={copy.shiftLabel}
                    value={shiftLabel}
                  />
                ) : null}
              </View>
            </BusinessPanel>

            {receipt.customer ? (
              <BusinessPanel className="mt-3" title={copy.patronTitle} icon="personPin">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={receipt.customer.name}
                  onPress={onOpenPatron}
                  className="flex-row items-center gap-3"
                >
                  <BusinessInitialsAvatar
                    initials={receipt.customer.initials}
                    size="md"
                    badgeIcon="verified"
                  />
                  <View className="min-w-0 flex-1">
                    <VemtapText
                      variant="labelMd"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {receipt.customer.name}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {receipt.customer.phone}
                    </VemtapText>
                  </View>
                </Pressable>
                {receipt.pointsEarned > 0 ? (
                  <View className="mt-3 flex-row items-center gap-2 rounded-field bg-surface-tint px-2.5 py-2">
                    <Icon name="star" size={15} color={colors.primary} />
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {copy.pointsAwarded(receipt.pointsEarned)}
                    </VemtapText>
                  </View>
                ) : null}
              </BusinessPanel>
            ) : null}

            <BusinessPanel
              className="mt-3"
              title={copy.itemsTitle(receipt.lines.length)}
              icon="receiptLong"
              trailing={
                orderTypeLabel ? (
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {orderTypeLabel}
                  </VemtapText>
                ) : undefined
              }
            >
              <View className="gap-2.5">
                {receipt.lines.map(item => (
                  <View key={item.id} className="flex-row items-start gap-2">
                    <View className="min-w-0 flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                          {`${item.qty}×`}
                        </VemtapText>
                        <VemtapText
                          variant="labelSm"
                          className="font-sans-semibold"
                          numberOfLines={1}
                        >
                          {item.name}
                        </VemtapText>
                      </View>
                      {item.note ? (
                        <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                          {item.note}
                        </VemtapText>
                      ) : null}
                    </View>
                    <VemtapText
                      variant="labelSm"
                      className="shrink-0 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {item.price}
                    </VemtapText>
                  </View>
                ))}
              </View>
              <View className="mt-3 gap-1.5">
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
            </BusinessPanel>

            <BusinessPanel className="mt-3" title={copy.tenderTitle} icon="payments">
              <View className="gap-1.5">
                {receipt.payments.map(row => (
                  <BusinessTotalsRow key={row.id} label={row.label} value={row.value} />
                ))}
              </View>
            </BusinessPanel>

            {refundable ? (
              <View className="mt-3 rounded-card bg-error-container p-3">
                <View className="flex-row items-center gap-1.5">
                  <Icon name="adminPanel" size={16} color={colors.error} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-error"
                    numberOfLines={1}
                  >
                    {copy.clearanceTitle}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="caption"
                  className="mt-1 leading-relaxed"
                  numberOfLines={4}
                >
                  {copy.clearanceBody}
                </VemtapText>
                <View className="mt-2.5">
                  <Button
                    label={copy.refundCta}
                    labelVariant="labelMd"
                    variant="secondary"
                    loading={isRefunding}
                    onPress={() => {
                      setReason('');
                      setRefundVisible(true);
                    }}
                    leftIcon={<Icon name="undo" size={16} color={colors.error} />}
                  />
                </View>
              </View>
            ) : null}
          </>
        )}
      </BusinessScreenLayout>

      <BottomSheet
        visible={refundVisible}
        onClose={() => setRefundVisible(false)}
        title={copy.refundSheetTitle}
        titleVariant="headingXl"
        titleClassName="text-heading-xl"
      >
        <View className="gap-3">
          <VemtapText variant="bodyMd" tone="secondary" numberOfLines={3}>
            {copy.refundSheetBody(receipt?.amount ?? '')}
          </VemtapText>
          <Input label={copy.reasonLabel} value={reason} onChangeText={setReason} />
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.cancelCta}
                labelVariant="labelMd"
                variant="secondary"
                onPress={() => setRefundVisible(false)}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.confirmRefundCta}
                labelVariant="labelMd"
                onPress={() => {
                  setRefundVisible(false);
                  onRefund?.(reason.trim());
                }}
              />
            </View>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
