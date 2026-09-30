import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  cartCustomer,
  cartGrandTotal,
  cartLines,
  cartTotals,
} from '@features/business/data/businessPosFlowData';

const copy = strings.posCurrentSaleCart;

export interface PosCurrentSaleCartScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onChangeCustomer?: () => void;
  onReorder?: () => void;
  onChangeQty?: (lineId: string, qty: number) => void;
  onRemoveLine?: (lineId: string) => void;
  onAddKitchenNote?: () => void;
  onAddDiscount?: () => void;
  onHold?: () => void;
  onCharge?: () => void;
}

/** Current ticket: customer context, editable line items, totals and hold/charge actions. */
export function PosCurrentSaleCartScreen({
  onBack,
  onOpenProfile,
  onChangeCustomer,
  onReorder,
  onChangeQty,
  onRemoveLine,
  onAddKitchenNote,
  onAddDiscount,
  onHold,
  onCharge,
}: PosCurrentSaleCartScreenProps) {
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
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.holdTicketCta}
                labelVariant="labelMd"
                variant="secondary"
                onPress={onHold}
                leftIcon={<Icon name="pauseCircle" size={17} color={colors.text} />}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.chargeCta}
                labelVariant="labelMd"
                onPress={onCharge}
                rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
              />
            </View>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.storeLabel}
          </VemtapText>
          <View className="flex-row items-center gap-1.5">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {`${copy.ticketLabel} #TK-108`}
            </VemtapText>
            <View className="h-1 w-1 rounded-full bg-outline" />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.tableLabel}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="schedule" size={14} color={colors.textTertiary} />
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="shrink-0"
            numberOfLines={1}
          >
            14:32
          </VemtapText>
        </View>
      </View>

      <View className="mt-3 flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <BusinessIconWell icon="starFilled" tone="brand" size="sm" />
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="labelMd"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {cartCustomer.name}
          </VemtapText>
          <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
            {cartCustomer.tier}
          </VemtapText>
          <VemtapText variant="micro" className="text-primary" numberOfLines={1}>
            {cartCustomer.phone}
          </VemtapText>
        </View>
        <View className="shrink-0 items-end">
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {`${cartCustomer.points} ${copy.pointsLabel}`}
          </VemtapText>
          <VemtapText variant="micro" className="text-primary" numberOfLines={1}>
            {copy.pointsAvailable}
          </VemtapText>
          <VemtapText
            variant="micro"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {`${copy.pointsEarns}`}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.changeCta}
          onPress={onChangeCustomer}
          className="shrink-0"
        >
          <Icon name="edit" size={17} color={colors.primary} />
        </Pressable>
      </View>

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="list" size={16} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.itemsTitle}
          </VemtapText>
          <View className="rounded-full bg-surface-container px-1.5 py-0.5">
            <VemtapText variant="micro" className="font-sans-bold" numberOfLines={1}>
              {String(cartLines.length)}
            </VemtapText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.reorderCta}
          onPress={onReorder}
          className="min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface-container px-3 active:scale-95"
        >
          <Icon name="history" size={14} color={colors.text} />
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {copy.reorderCta}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-2 gap-2">
        {cartLines.map(line => (
          <View key={line.id} className="gap-2 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-start justify-between gap-2">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={2}
              >
                {line.name}
              </VemtapText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${line.name} delete`}
                onPress={() => onRemoveLine?.(line.id)}
                className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container"
              >
                <Icon name="delete" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {`${copy.unitLabel}: ${line.unit}`}
            </VemtapText>
            {line.note ? (
              <VemtapText variant="caption" tone="tertiary" numberOfLines={2}>
                {line.note}
              </VemtapText>
            ) : null}
            {line.discountNote ? (
              <View className="flex-row items-center gap-1.5">
                <Icon name="localOffer" size={13} color={colors.badgeDiscountText} />
                <VemtapText
                  variant="micro"
                  className="min-w-0 flex-1 text-badge-discount-text"
                  numberOfLines={2}
                >
                  {line.discountNote}
                </VemtapText>
              </View>
            ) : null}
            {line.station ? (
              <View className="flex-row items-center gap-1.5">
                <Icon name="glassCocktail" size={13} color={colors.textTertiary} />
                <VemtapText
                  variant="micro"
                  tone="tertiary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {line.station}
                </VemtapText>
              </View>
            ) : null}
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${line.name} decrease`}
                  onPress={() => onChangeQty?.(line.id, line.qty - 1)}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                >
                  <Icon name="remove" size={16} color={colors.text} />
                </Pressable>
                <VemtapText
                  variant="labelMd"
                  className="w-5 text-center font-sans-semibold"
                  numberOfLines={1}
                >
                  {String(line.qty)}
                </VemtapText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${line.name} increase`}
                  onPress={() => onChangeQty?.(line.id, line.qty + 1)}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                >
                  <Icon name="plus" size={16} color={colors.text} />
                </Pressable>
              </View>
              <View className="items-end">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {line.lineTotal}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.lineTotalLabel}
                </VemtapText>
              </View>
            </View>
          </View>
        ))}
      </View>

      {cartLines.length === 0 ? (
        <EmptyState
          icon="list"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

      <View className="mt-3 flex-row flex-wrap gap-2">
        {[
          {
            id: 'note',
            label: copy.noteCta,
            icon: 'editNote' as const,
            onPress: onAddKitchenNote,
          },
          {
            id: 'discount',
            label: copy.discountCta,
            icon: 'percentBadge' as const,
            onPress: onAddDiscount,
          },
          {
            id: 'hold',
            label: copy.holdCta,
            icon: 'pauseCircle' as const,
            onPress: onHold,
          },
        ].map(action => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            className="min-h-10 min-w-[45%] flex-1 flex-row items-center justify-center gap-1.5 rounded-field bg-surface-container px-2.5 active:scale-95"
          >
            <Icon name={action.icon} size={15} color={colors.text} />
            <VemtapText
              variant="labelSm"
              className="min-w-0 font-sans-semibold"
              numberOfLines={1}
            >
              {action.label}
            </VemtapText>
          </Pressable>
        ))}
      </View>

      <BusinessPanel className="mt-3" title={copy.totalDueLabel} icon="receipt">
        <View className="gap-1.5">
          {cartTotals.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              tone={row.tone}
            />
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.totalDueLabel} value={cartGrandTotal} />
        <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
          {copy.totalDueNote}
        </VemtapText>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
