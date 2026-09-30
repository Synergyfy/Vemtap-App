import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  merchantPosStreamFooterStats,
  merchantPosStreamLines,
  merchantPosStreamTabs,
} from '@features/business/data/businessPublicPosData';

const copy = strings.merchantPosKitchenStream;

export interface MerchantPosKitchenStreamScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSelectTab?: (tabId: string) => void;
  onCallGuest?: () => void;
  onAcceptOrder?: () => void;
  onPrintChit?: () => void;
  onRejectOrder?: () => void;
  onMarkReady?: () => void;
  onReturnToRegister?: () => void;
}

/**
 * `merchant_pos_live_orders_kitchen_stream` - the kitchen display's incoming
 * queue. The merchant side of the same public POS ticket the guest watches, so
 * the guest's own notes and the unpaid flag travel with it.
 */
export function MerchantPosKitchenStreamScreen({
  onBack,
  onOpenProfile,
  onSelectTab,
  onCallGuest,
  onAcceptOrder,
  onPrintChit,
  onRejectOrder,
  onMarkReady,
  onReturnToRegister,
}: MerchantPosKitchenStreamScreenProps) {
  return (
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
            label={copy.returnCta}
            labelVariant="labelMd"
            variant="secondary"
            onPress={onReturnToRegister}
            leftIcon={<Icon name="pointOfSale" size={17} color={colors.text} />}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="store" size={16} color={colors.primary} />
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={1}>
            {copy.branchLabel}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-success" />
          <VemtapText variant="caption" tone="success" numberOfLines={1}>
            {copy.liveBadge}
          </VemtapText>
        </View>
      </View>

      <View className="mt-2">
        <BusinessChipScroller>
          {merchantPosStreamTabs.map(tab => (
            <BusinessCountChip
              key={tab.id}
              label={tab.label}
              count={tab.count ?? undefined}
              selected={tab.id === 'new'}
              onPress={() => onSelectTab?.(tab.id)}
            />
          ))}
        </BusinessChipScroller>
      </View>

      <View className="mt-3 overflow-hidden rounded-card bg-surface shadow-md">
        <View className="h-1.5 w-full bg-primary" />
        <View className="p-3">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Icon name="bolt" size={16} color={colors.primary} />
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {copy.newOrderTitle}
              </VemtapText>
            </View>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="shrink-0"
              numberOfLines={1}
            >
              {copy.newOrderWhen}
            </VemtapText>
          </View>

          <View className="mt-2.5 flex-row items-start gap-2">
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <VemtapText
                  variant="headingSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  Order #UG-1085
                </VemtapText>
                <BusinessStatusPill label="Table 04" tone="neutral" />
              </View>
              <View className="mt-1 flex-row items-center gap-1.5">
                <Icon name="dining" size={15} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {copy.orderTypeLabel}
                </VemtapText>
              </View>
            </View>
            <View className="h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
              <Icon name="tableRestaurant" size={17} color={colors.primary} />
              <VemtapText variant="micro" className="font-sans-bold" numberOfLines={1}>
                T-04
              </VemtapText>
            </View>
          </View>

          <View className="mt-2.5 flex-row items-center gap-2 rounded-field bg-surface-tint px-2.5 py-2">
            <BusinessInitialsAvatar initials="SA" size="sm" />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                Samuel Adeleke
              </VemtapText>
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                +234 802 345 6789
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call Samuel Adeleke"
              onPress={onCallGuest}
              hitSlop={8}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface active:scale-95"
            >
              <Icon name="phone" size={17} color={colors.primary} />
            </Pressable>
          </View>

          <View className="mt-2.5 flex-row items-center justify-between gap-2">
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="uppercase tracking-wider"
              numberOfLines={1}
            >
              {copy.itemsTitle}
            </VemtapText>
            <BusinessStatusPill label={copy.autoSyncBadge} tone="success" />
          </View>

          <View className="mt-1.5 gap-2">
            {merchantPosStreamLines.map(line => (
              <View
                key={line.id}
                className="flex-row items-center gap-2 rounded-field bg-surface-container-low p-2"
              >
                <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface-container">
                  <Icon name="food" size={17} color={colors.textSecondary} />
                </View>
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary">
                      <VemtapText
                        variant="micro"
                        className="font-sans-bold text-surface"
                        numberOfLines={1}
                      >
                        {line.qty}
                      </VemtapText>
                    </View>
                    <VemtapText
                      variant="caption"
                      className="font-sans-semibold"
                      numberOfLines={1}
                    >
                      {line.name}
                    </VemtapText>
                  </View>
                  <VemtapText variant="micro" tone="error" numberOfLines={1}>
                    {line.note}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="caption"
                  className="shrink-0 font-sans-semibold"
                  numberOfLines={1}
                >
                  {line.price}
                </VemtapText>
              </View>
            ))}
          </View>

          <View className="mt-2.5 flex-row items-start gap-2.5 rounded-field bg-surface-tint px-2.5 py-2">
            <View className="mt-0.5 shrink-0">
              <Icon name="info" size={16} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.noteTitle}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5"
                numberOfLines={3}
              >
                {`Allergies: None. ${copy.waiterNote}`}
              </VemtapText>
            </View>
          </View>

          <View className="mt-2.5 flex-row flex-wrap items-center justify-between gap-2 rounded-field bg-surface-container-low px-2.5 py-2">
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.totalLabel}
              </VemtapText>
              <VemtapText variant="labelMd" className="font-sans-bold" numberOfLines={1}>
                {'\u20a627,950'}
              </VemtapText>
            </View>
            <BusinessStatusPill
              label={copy.unpaidBadge}
              tone="warning"
              className="shrink-0"
            />
          </View>

          <View className="mt-3">
            <Button
              label={copy.acceptCta}
              labelVariant="labelMd"
              onPress={onAcceptOrder}
              leftIcon={<Icon name="checkCircle" size={17} color={colors.surface} />}
            />
          </View>
          <View className="mt-2 flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.printCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onPrintChit}
                leftIcon={<Icon name="receiptLong" size={15} color={colors.text} />}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.rejectCta}
                labelVariant="labelSm"
                variant="destructive"
                onPress={onRejectOrder}
                leftIcon={<Icon name="undo" size={15} color={colors.surface} />}
              />
            </View>
          </View>
        </View>
      </View>

      <View className="mt-3 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="fire" size={15} color={colors.tertiary} />
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              Order #UG-1084
            </VemtapText>
          </View>
          <View className="shrink-0 rounded-full bg-error-container px-2.5 py-1">
            <VemtapText
              variant="micro"
              tone="error"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.elapsedBadge}
            </VemtapText>
          </View>
        </View>
        <VemtapText
          variant="labelSm"
          className="mt-1.5 font-sans-semibold"
          numberOfLines={1}
        >
          Fatima Bello
        </VemtapText>
        <View className="mt-0.5 flex-row items-start justify-between gap-2">
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1"
            numberOfLines={2}
          >
            {`${copy.pickupCounter} \u2022 ${copy.pickupItems}`}
          </VemtapText>
          <VemtapText
            variant="labelMd"
            className="shrink-0 font-sans-bold"
            numberOfLines={1}
          >
            {'\u20a69,700'}
          </VemtapText>
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-highest">
          <View className="h-full w-2/3 rounded-full bg-tertiary" />
        </View>
        <View className="mt-2.5 flex-row items-center gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <Icon name="checkCircle" size={15} color={colors.success} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.cookStationLabel}
            </VemtapText>
          </View>
          <View className="min-w-[40%]">
            <Button
              label={copy.markReadyCta}
              accessibilityLabel={copy.markReadyCta}
              labelVariant="labelSm"
              onPress={onMarkReady}
              rightIcon={<Icon name="arrowForward" size={15} color={colors.surface} />}
            />
          </View>
        </View>
      </View>

      <BusinessPanel className="mt-3">
        <View className="flex-row gap-2">
          {merchantPosStreamFooterStats.map(stat => (
            <View key={stat.id} className="min-w-0 flex-1 items-center gap-0.5">
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {stat.label}
              </VemtapText>
              <View className="flex-row items-center gap-1">
                <Icon name={stat.icon} size={14} color={colors.primary} />
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold"
                  numberOfLines={1}
                >
                  {stat.value}
                </VemtapText>
              </View>
            </View>
          ))}
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
