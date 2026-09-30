import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { BottomSheet } from '@components/shared/BottomSheet';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessKeyValueRow,
  BusinessPanel,
  BusinessStatTile,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessInitialsAvatar,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessNumberInput,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  posTransactionItems,
  posTransactionTotals,
} from '@features/business/data/businessPosLedgerData';
import { completedSale } from '@features/business/data/businessPosFlowData';

const copy = strings.posTransactionDetails;

export interface PosTransactionDetailsScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onCopyReference?: () => void;
  onOpenPatron?: () => void;
  onOpenPoints?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onViewEReceipt?: () => void;
  onOpenRefund?: () => void;
  onConfirmVoid?: (pin: string) => void;
}

/**
 * `pos_transaction_details` - one settled receipt in full: the immutable
 * transaction record, the attached patron's awarded points, line items with
 * discounts, the tender breakdown, and the manager-gated refund/void.
 */
export function PosTransactionDetailsScreen({
  onBack,
  onOpenProfile,
  onCopyReference,
  onOpenPatron,
  onOpenPoints,
  onPrint,
  onShare,
  onViewEReceipt,
  onOpenRefund,
  onConfirmVoid,
}: PosTransactionDetailsScreenProps) {
  const [voidVisible, setVoidVisible] = useState(false);
  const [pin, setPin] = useState('');

  return (
    <>
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
            <Button
              label={copy.printCta}
              labelVariant="labelMd"
              onPress={onPrint}
              leftIcon={<Icon name="printerPos" size={17} color={colors.surface} />}
            />
            <View className="mt-2 flex-row gap-2">
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
        }
      >
        <View className="overflow-hidden rounded-card bg-surface shadow-sm">
          <View className="items-center gap-1 px-4 pb-3 pt-4">
            <BusinessStatusPill
              label={copy.statusBadge}
              tone="success"
              icon="checkCircle"
            />
            <VemtapText variant="display" className="font-sans-bold" numberOfLines={1}>
              {completedSale.amount}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.totalLabel}
            </VemtapText>
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-2 border-t border-surface-container-low px-4 py-2.5">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="cloudDone" size={15} color={colors.success} />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.syncLabel}
              </VemtapText>
            </View>
            <BusinessStatusPill label={copy.nodeLabel} tone="neutral" />
          </View>
        </View>

        <BusinessPanel
          className="mt-3"
          title={copy.recordTitle}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.recordValue}
              onPress={onCopyReference}
              className="flex-row items-center gap-1.5"
            >
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold text-primary"
                numberOfLines={1}
              >
                {copy.recordValue}
              </VemtapText>
              <Icon name="copy" size={15} color={colors.primary} />
            </Pressable>
          }
        >
          <View className="gap-3">
            <BusinessKeyValueRow
              icon="qrCode"
              label={copy.uidLabel}
              value={copy.uidValue}
            />
            <BusinessKeyValueRow
              icon="schedule"
              label={copy.timestampLabel}
              value={copy.timestampValue}
            />
            <BusinessKeyValueRow
              icon="person"
              label={copy.cashierLabel}
              value={copy.cashierValue}
            />
            <BusinessKeyValueRow
              icon="store"
              label={copy.outletLabel}
              value={copy.outletValue}
            />
            <BusinessKeyValueRow
              icon="pointOfSale"
              label={copy.hardwareLabel}
              value={copy.hardwareValue}
            />
          </View>
        </BusinessPanel>

        <BusinessPanel
          className="mt-3"
          title={copy.patronTitle}
          icon="personPin"
          badge={copy.patronTier}
          badgeTone="brand"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={completedSale.customer}
            onPress={onOpenPatron}
            className="flex-row items-center gap-3"
          >
            <BusinessInitialsAvatar initials="MJ" size="md" badgeIcon="verified" />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {completedSale.customer}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {completedSale.phone}
              </VemtapText>
              <VemtapText variant="caption" tone="success" numberOfLines={1}>
                {copy.connectedLabel}
              </VemtapText>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.patronPoints}
            onPress={onOpenPoints}
            className="mt-3 flex-row items-center gap-2 rounded-field bg-surface-tint px-2.5 py-2 active:scale-[0.99]"
          >
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
              <Icon name="star" size={15} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.patronPoints}
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {copy.patronBalance}
              </VemtapText>
            </View>
            <BusinessStatusPill label={copy.patronAuto} tone="brand" />
          </Pressable>
        </BusinessPanel>

        <BusinessPanel
          className="mt-3"
          title={copy.itemsTitle}
          icon="receiptLong"
          trailing={
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.itemsMeta}
            </VemtapText>
          }
        >
          <View className="gap-2.5">
            {posTransactionItems.map(item => (
              <View key={item.id} className="flex-row items-start gap-2">
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {item.qty}
                    </VemtapText>
                    <VemtapText
                      variant="labelSm"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {item.name}
                    </VemtapText>
                  </View>
                  <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                    {item.modifier}
                  </VemtapText>
                </View>
                <View className="shrink-0 items-end">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {item.price}
                  </VemtapText>
                  {item.wasPrice ? (
                    <VemtapText
                      variant="micro"
                      tone="tertiary"
                      className="line-through"
                      numberOfLines={1}
                    >
                      {item.wasPrice}
                    </VemtapText>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          <View className="mt-3 gap-1.5">
            {posTransactionTotals.map(row => (
              <BusinessTotalsRow
                key={row.id}
                label={row.label}
                value={row.value}
                tone={row.tone}
              />
            ))}
          </View>
          <BusinessGrandTotalRow
            label={copy.totalPaidLabel}
            value={completedSale.amount}
          />
        </BusinessPanel>

        <BusinessPanel className="mt-3" title={copy.tenderTitle} icon="payments">
          <View className="flex-row gap-2">
            <BusinessStatTile
              label={copy.methodLabel}
              value={copy.methodValue}
              icon="bank"
              accent="brand"
              className="p-2.5"
            />
            <BusinessStatTile
              label={copy.shiftStatusLabel}
              value={copy.shiftStatusValue}
              icon="pointOfSale"
              accent="tertiary"
              className="p-2.5"
            />
          </View>
          <View className="mt-2 flex-row gap-2">
            <BusinessStatTile
              label={copy.cashReceivedLabel}
              value={copy.cashReceivedValue}
              icon="wallet"
              accent="tertiary"
              className="p-2.5"
            />
            <BusinessStatTile
              label={copy.changeDispensedLabel}
              value={copy.changeValue}
              icon="undo"
              accent="success"
              className="p-2.5"
            />
          </View>
        </BusinessPanel>

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
              onPress={() => {
                setPin('');
                onOpenRefund?.();
                setVoidVisible(true);
              }}
              leftIcon={<Icon name="undo" size={16} color={colors.error} />}
            />
          </View>
        </View>
      </BusinessScreenLayout>

      <BottomSheet
        visible={voidVisible}
        onClose={() => setVoidVisible(false)}
        title={copy.voidSheetTitle}
        titleVariant="headingXl"
        titleClassName="text-heading-xl"
      >
        <View className="gap-3">
          <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
            {`${copy.voidSheetBody} ${completedSale.amount}.`}
          </VemtapText>
          <BusinessNumberInput
            label={copy.voidSheetTitle}
            value={pin}
            onChangeText={setPin}
            placeholder="0000"
            keyboardType="number-pad"
            maxLength={4}
          />
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.voidCancelCta}
                labelVariant="labelMd"
                variant="secondary"
                onPress={() => setVoidVisible(false)}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.voidConfirmCta}
                labelVariant="labelMd"
                onPress={() => {
                  onConfirmVoid?.(pin);
                  setVoidVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
