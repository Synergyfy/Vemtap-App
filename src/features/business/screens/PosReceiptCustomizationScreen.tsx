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
  BusinessSettingRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  receiptPreview,
  receiptPreviewLines,
} from '@features/business/data/businessPosFlowData';

const copy = strings.posReceiptCustomization;

export interface PosReceiptCustomizationScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onToggleSetting?: (settingId: string, value: boolean) => void;
  onEditReceipt?: () => void;
  onPrintTest?: () => void;
}

/**
 * Receipt & order customisation: the thermal typography settings, and a live
 * 80mm slip simulation rendered through the shared line/total primitives so the
 * preview cannot drift from the real receipt layout.
 */
export function PosReceiptCustomizationScreen({
  onBack,
  onOpenProfile,
  onToggleSetting,
  onEditReceipt,
  onPrintTest,
}: PosReceiptCustomizationScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.printCta}
            labelVariant="labelMd"
            onPress={onPrintTest}
            leftIcon={<Icon name="printReceipt" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.editCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={onEditReceipt}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row flex-wrap items-center gap-1.5">
        <BusinessStatusPill label={copy.accessBadge} tone="success" />
        <BusinessStatusPill label={copy.modeBadge} tone="brand" />
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.settingsTitle}
        icon="tune"
        badge={copy.settingsSub}
        badgeTone="neutral"
      >
        <VemtapText
          variant="caption"
          tone="secondary"
          className="leading-relaxed"
          numberOfLines={3}
        >
          {copy.settingsBody}
        </VemtapText>
        <View className="overflow-hidden rounded-field bg-surface-subtle">
          {[
            { id: 'bold', title: 'Bold headings', on: true },
            { id: 'logo', title: 'Print store logo', on: true },
            { id: 'tax', title: 'Print tax breakdown', on: true },
            { id: 'loyalty', title: 'Loyalty handshake block', on: true },
            { id: 'sms', title: 'Auto-send SMS receipt', on: false },
          ].map((setting, index) => (
            <View key={setting.id}>
              {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
              <BusinessSettingRow
                title={setting.title}
                trailing="switch"
                switchValue={setting.on}
                onSwitchChange={value => onToggleSetting?.(setting.id, value)}
                className="px-3 py-2"
              />
            </View>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.previewTitle}
        icon="printerPos"
        badge={copy.previewBadge}
        badgeTone="neutral"
      >
        <View className="items-center rounded-field bg-surface-container-lowest p-3">
          <View className="w-full rounded-field bg-surface p-3">
            <View className="items-center gap-1">
              <VemtapText
                variant="labelMd"
                className="text-center font-sans-bold"
                numberOfLines={1}
              >
                {strings.businessMore.name}
              </VemtapText>
              <VemtapText variant="micro" className="text-center" numberOfLines={1}>
                {receiptPreview.txn}
              </VemtapText>
            </View>

            <View className="mt-2 gap-1.5">
              <VemtapText variant="micro" className="text-center" numberOfLines={2}>
                {receiptPreview.address}
              </VemtapText>
              <VemtapText variant="micro" className="text-center" numberOfLines={1}>
                {receiptPreview.tel}
              </VemtapText>
              <VemtapText variant="micro" className="text-center" numberOfLines={1}>
                {`TIN: ${receiptPreview.tin}`}
              </VemtapText>
              <VemtapText variant="micro" className="text-center" numberOfLines={1}>
                {receiptPreview.stamp}
              </VemtapText>
              <VemtapText variant="micro" className="text-center" numberOfLines={1}>
                {receiptPreview.server}
              </VemtapText>
              <VemtapText variant="micro" className="text-center" numberOfLines={1}>
                {receiptPreview.phone}
              </VemtapText>
            </View>

            <View className="my-2 h-px bg-surface-container-highest" />

            <View className="gap-2">
              {receiptPreviewLines.map(line => (
                <View key={line.id} className="gap-0.5">
                  <View className="flex-row items-start justify-between gap-2">
                    <VemtapText
                      variant="caption"
                      className="min-w-0 flex-1 font-sans-semibold"
                      numberOfLines={2}
                    >
                      {`${line.qty} ${line.name}`}
                    </VemtapText>
                    <VemtapText
                      variant="caption"
                      className="shrink-0 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {line.price}
                    </VemtapText>
                  </View>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {line.note}
                  </VemtapText>
                </View>
              ))}
            </View>

            <View className="my-2 h-px bg-surface-container-highest" />

            <View className="gap-1.5">
              <BusinessTotalsRow label="Subtotal" value={receiptPreview.subtotal} />
              <BusinessTotalsRow label={copy.vatLabel} value={receiptPreview.vat} />
              <BusinessTotalsRow
                label={copy.consumptionTaxLabel}
                value={receiptPreview.consumptionTax}
              />
            </View>
            <BusinessGrandTotalRow
              label={copy.totalDueLabel}
              value={receiptPreview.total}
              divided={false}
            />
            <VemtapText
              variant="caption"
              className="mt-1 text-center font-sans-semibold"
              numberOfLines={1}
            >
              {`${copy.paidLabel}: VEMTAP Smart Tap`}
            </VemtapText>
            <VemtapText variant="micro" className="text-center" numberOfLines={1}>
              {`${copy.authLabel} ${receiptPreview.auth}`}
            </VemtapText>

            <View className="my-2 h-px bg-surface-container-highest" />

            <View className="items-center gap-1">
              <View className="flex-row items-center gap-1.5">
                <Icon name="starFilled" size={14} color={colors.tertiary} />
                <VemtapText
                  variant="caption"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {copy.pointsLabel.replace('{count}', String(receiptPreview.points))}
                </VemtapText>
              </View>
              <VemtapText variant="micro" className="text-center" numberOfLines={1}>
                {copy.scanLabel}
              </VemtapText>
              <VemtapText variant="micro" className="text-center" numberOfLines={2}>
                {copy.thanksLabel}
              </VemtapText>
              <VemtapText
                variant="micro"
                tone="tertiary"
                className="text-center"
                numberOfLines={1}
              >
                {copy.poweredLabel}
              </VemtapText>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.editCta}
          onPress={onEditReceipt}
          className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container active:scale-95"
        >
          <Icon name="edit" size={16} color={colors.text} />
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.editCta}
          </VemtapText>
        </Pressable>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
