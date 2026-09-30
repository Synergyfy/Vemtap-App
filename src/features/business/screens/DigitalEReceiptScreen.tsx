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
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessLineItem,
  BusinessQrFrame,
  BusinessRatingStars,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';
import { receiptOrder } from '@features/business/data/businessAnalyticsData';

const copy = strings.digitalEReceipt;

export interface DigitalEReceiptScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onRateAndTip?: () => void;
  onOrderAgain?: () => void;
}

/**
 * Digital e-receipt: receipt identity, line items, totals with the deal
 * discount, the amount actually paid, and a shareable receipt QR.
 */
export function DigitalEReceiptScreen({
  onBack,
  onShare,
  onSave,
  onRateAndTip,
  onOrderAgain,
}: DigitalEReceiptScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.rateCta}
            labelVariant="labelMd"
            onPress={onRateAndTip}
            leftIcon={<Icon name="rateReview" size={18} color={colors.surface} />}
          />
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.shareCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onShare}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.reorderCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onOrderAgain}
              />
            </View>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="items-center gap-2">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-badge-discount-bg">
          <Icon name="checkBold" size={22} color={colors.badgeDiscountText} />
        </View>
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={1}>
          {copy.doneTitle}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="text-center"
          numberOfLines={2}
        >
          {copy.doneBody}
        </VemtapText>
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
          <BusinessStatusPill label={copy.paidLabel} tone="success" />
        </View>
        <View className="gap-1.5">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {receiptOrder.store}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {`${receiptOrder.id} · ${receiptOrder.date}`}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {`${copy.tableLabel} ${receiptOrder.table}`}
          </VemtapText>
        </View>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Icon name="mail" size={14} color={colors.textTertiary} />
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {`${copy.sentLabel} ${receiptOrder.sentTo}`}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.itemsTitle}
        icon="list"
        badge={String(receiptOrder.items.length)}
        badgeTone="neutral"
      >
        <View className="gap-3">
          {receiptOrder.items.map((item, index) => {
            const image = businessOpsImageById[receiptOrder.itemImageIds[index]];
            return (
              <BusinessLineItem
                key={item.id}
                name={item.name}
                modifier={item.modifier}
                quantity={item.qty}
                price={item.price}
                imageUri={image?.uri}
                imageAlt={image?.alt}
              />
            );
          })}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.totalsTitle} icon="payments">
        <View className="gap-1.5">
          {receiptOrder.totals.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              tone={row.tone}
              badge={row.badge}
            />
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.paidLabel} value={receiptOrder.grandTotal} />
        <View className="mt-1 flex-row items-center gap-1.5">
          <Icon name="accountBalance" size={14} color={colors.textTertiary} />
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="min-w-0 flex-1"
            numberOfLines={1}
          >
            {`${copy.paidVia} ${receiptOrder.method}`}
          </VemtapText>
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.ratingTitle} icon="starFilled">
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.ratingSubtitle}
        </VemtapText>
        <View className="mt-1 flex-row items-center gap-2">
          <BusinessRatingStars
            rating={receiptOrder.rating}
            size={18}
            accessibilityLabel={copy.ratingTitle}
          />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.rateCta}
          </VemtapText>
        </View>
      </BusinessPanel>

      <View className="mt-3 items-center">
        <BusinessQrFrame
          size="sm"
          glyph="receiptLong"
          caption={`${receiptOrder.id}`}
          label={copy.receiptLabel}
          className="w-full"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.printCta}
            onPress={onSave}
            className="mt-2 min-h-9 flex-row items-center gap-1.5 px-2"
          >
            <Icon name="download" size={16} color={colors.primary} />
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary"
              numberOfLines={1}
            >
              {copy.printCta}
            </VemtapText>
          </Pressable>
        </BusinessQrFrame>
      </View>

      <View className="mt-3 items-center gap-1">
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="text-center"
          numberOfLines={2}
        >
          {copy.vatNote}
        </VemtapText>
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="text-center"
          numberOfLines={2}
        >
          {copy.legal}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
