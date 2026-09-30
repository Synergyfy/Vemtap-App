import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessQrFrame,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  displayOrder,
  displayPaymentMethods,
} from '@features/business/data/businessAnalyticsData';

const copy = strings.customerDisplayTapQrPay;

export interface CustomerDisplayTapQrPayScreenProps {
  onBack?: () => void;
  onChangeMethod?: () => void;
  onContactlessStarted?: () => void;
  onQrScanned?: () => void;
  onAskStaff?: () => void;
}

/**
 * Table payment surface: total due, tap-to-pay instruction, the scannable QR,
 * accepted methods and a fallback affordance for guests who cannot scan.
 */
export function CustomerDisplayTapQrPayScreen({
  onBack,
  onChangeMethod,
  onContactlessStarted,
  onQrScanned,
  onAskStaff,
}: CustomerDisplayTapQrPayScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <View className="gap-2">
          <Button
            label={copy.backCta}
            labelVariant="labelMd"
            variant="secondary"
            onPress={onChangeMethod}
          />
          <VemtapText variant="caption" tone="tertiary" className="text-center">
            {copy.refundNote}
          </VemtapText>
        </View>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="rounded-full bg-surface-container px-3 py-1.5">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {`${copy.tableLabel} ${displayOrder.table}`}
          </VemtapText>
        </View>
        <View className="rounded-full bg-surface-tint px-3 py-1.5">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.totalDueLabel}
          </VemtapText>
        </View>
      </View>

      <VemtapText variant="headingLg" className="mt-2 text-heading-lg" numberOfLines={1}>
        {displayOrder.grandTotal}
      </VemtapText>

      <BusinessPanel className="mt-3" icon="contactless" title={copy.tapTitle}>
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={3}>
          {copy.tapBody}
        </VemtapText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.tapTitle}
          onPress={onContactlessStarted}
          className="mt-3 min-h-[92px] items-center justify-center gap-2 rounded-card bg-surface-tint active:scale-[0.99]"
        >
          <Icon name="contactless" size={34} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.tapTitle}
          </VemtapText>
        </Pressable>
      </BusinessPanel>

      <BusinessPanel className="mt-3" icon="qrCodeScanner" title={copy.qrTitle}>
        <VemtapText variant="caption" tone="secondary" className="mb-2" numberOfLines={2}>
          {copy.qrBody}
        </VemtapText>
        <View className="items-center">
          <BusinessQrFrame
            size="md"
            glyph="contactless"
            caption={copy.qrCaption}
            label={displayOrder.store}
            className="w-full"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.onScanLabel}
          onPress={onQrScanned}
          className="mt-2 min-h-10 flex-row items-center justify-center gap-1.5"
        >
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.onScanLabel}
          </VemtapText>
          <Icon name="northEast" size={15} color={colors.primary} />
        </Pressable>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.methodsTitle} icon="payments">
        <View className="gap-1.5">
          {displayPaymentMethods.map(method => (
            <View
              key={method}
              className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5"
            >
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
                <Icon name="creditCard" size={17} color={colors.text} />
              </View>
              <VemtapText variant="labelMd" className="min-w-0 flex-1" numberOfLines={1}>
                {method}
              </VemtapText>
              <Icon name="checkCircle" size={17} color={colors.badgeDiscountText} />
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" icon="help">
        <BusinessTotalsRow label={copy.tableLabel} value={displayOrder.table} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.customerDisplayOrderTotal.payAskStaffCta}
          onPress={onAskStaff}
          className="mt-1 min-h-10 flex-row items-center justify-center gap-1.5"
        >
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {strings.customerDisplayOrderTotal.payAskStaffCta}
          </VemtapText>
          <Icon name="forward" size={15} color={colors.primary} />
        </Pressable>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
