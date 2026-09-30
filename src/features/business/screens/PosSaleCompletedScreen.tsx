import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
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
import {
  completedCashBreakdown,
  completedLines,
  completedSale,
  completedTotals,
} from '@features/business/data/businessPosFlowData';

const copy = strings.posSaleCompleted;

export interface PosSaleCompletedScreenProps {
  onOpenProfile?: () => void;
  onPrint?: () => void;
  onSendToMobile?: () => void;
  onNewSale?: () => void;
}

/** Post-tender confirmation: receipt identity, itemised lines, totals, tender breakdown and next actions. */
export function PosSaleCompletedScreen({
  onOpenProfile,
  onPrint,
  onSendToMobile,
  onNewSale,
}: PosSaleCompletedScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: `${completedSale.tillLabel} • ${copy.storeLabel}`,
        actions: [
          { icon: 'accountCircle', label: copy.headline, onPress: onOpenProfile },
        ],
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
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.printCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onPrint}
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
        </BusinessActionDock>
      }
    >
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
          {`${copy.paymentOf} ${completedSale.amount} ${copy.tenderSuffix} ${completedSale.tender}`}
        </VemtapText>
        <VemtapText
          variant="micro"
          tone="tertiary"
          className="text-center"
          numberOfLines={1}
        >
          {`${completedSale.date} • ${completedSale.receiptId}`}
        </VemtapText>
      </View>

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface p-3 shadow-sm">
        <BusinessIconWell icon="storefront" tone="brand" size="sm" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.storeLabel}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {`${completedSale.tillLabel} • ${copy.cashLabel}ier`}
          </VemtapText>
        </View>
        <VemtapText
          variant="caption"
          className="shrink-0 font-sans-semibold"
          numberOfLines={1}
        >
          {completedSale.cashier}
        </VemtapText>
      </View>

      <View className="mt-2 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
          <VemtapText
            variant="labelSm"
            className="font-sans-bold text-primary-foreground"
            numberOfLines={1}
          >
            MJ
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {completedSale.customer}
          </VemtapText>
          <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
            {completedSale.phone}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1">
          <Icon name="starFilled" size={14} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-bold text-primary"
            numberOfLines={1}
          >
            {completedSale.points}
          </VemtapText>
          <VemtapText variant="micro" className="text-primary" numberOfLines={1}>
            {copy.pointsLabel}
          </VemtapText>
        </View>
      </View>

      <View className="mt-3 gap-3 rounded-card bg-surface p-3 shadow-sm">
        {completedLines.map(line => (
          <BusinessLineItem
            key={line.id}
            name={`${line.qty} ${line.name}`}
            modifier={line.note}
            quantity={undefined}
            price={line.price}
          />
        ))}
      </View>

      <BusinessPanel className="mt-3" title={copy.totalPaidLabel} icon="receipt">
        <View className="gap-1.5">
          {completedTotals.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              tone={row.tone}
            />
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.totalPaidLabel} value={completedSale.amount} />
        <View className="gap-1.5">
          {completedCashBreakdown.map(row => (
            <BusinessTotalsRow key={row.id} label={row.label} value={row.value} />
          ))}
        </View>
      </BusinessPanel>

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell icon="printReceipt" tone="brand" size="sm" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.printCta}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.printSub}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.printCta}
            onPress={onPrint}
            className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary active:scale-95"
          >
            <Icon name="arrowForward" size={18} color={colors.surface} />
          </Pressable>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
