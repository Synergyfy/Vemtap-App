import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessLineItem,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import { businessOpsImageById } from '@features/business/data/businessOpsImages';
import { displayOrder } from '@features/business/data/businessAnalyticsData';

const copy = strings.customerDisplayOrderTotal;

export interface CustomerDisplayOrderTotalScreenProps {
  onSplitBill?: () => void;
  onAskStaff?: () => void;
  onAddMoreItems?: () => void;
  onEditOrder?: () => void;
}

/**
 * Customer-facing order total for the table display: line items, totals stack
 * and the grand total, with split-bill / ask-staff / add-more actions.
 */
export function CustomerDisplayOrderTotalScreen({
  onSplitBill,
  onAskStaff,
  onAddMoreItems,
  onEditOrder,
}: CustomerDisplayOrderTotalScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: displayOrder.store, onBack: onEditOrder }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.paySplitCta}
            labelVariant="labelMd"
            onPress={onSplitBill}
            leftIcon={<Icon name="splitBill" size={18} color={colors.surface} />}
          />
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.payAskStaffCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onAskStaff}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.moreItemsCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onAddMoreItems}
              />
            </View>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="rounded-full bg-surface-container px-3 py-1.5">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {`${copy.tableLabel} ${displayOrder.table}`}
          </VemtapText>
        </View>
        <VemtapText
          variant="caption"
          tone="secondary"
          className="shrink-0"
          numberOfLines={1}
        >
          {copy.orderLabel}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-3" icon="receipt">
        <View className="gap-3">
          {displayOrder.items.map((item, index) => {
            const image = businessOpsImageById[displayOrder.itemImageIds[index]];
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

        <View className="mt-3 gap-1.5 border-t border-border pt-3">
          {displayOrder.totals.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              tone={row.tone}
            />
          ))}
        </View>

        <BusinessGrandTotalRow label={copy.orderLabel} value={displayOrder.grandTotal} />
      </BusinessPanel>

      <BusinessPanel className="mt-3" icon="autoAwesome" title={copy.thanksTitle}>
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
          {copy.thanksBody}
        </VemtapText>
      </BusinessPanel>

      <View className="mt-3 flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={2}
        >
          {copy.vatNote}
        </VemtapText>
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="shrink-0"
          numberOfLines={1}
        >
          {copy.footerLegal}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
