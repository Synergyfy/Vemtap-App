import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessGrandTotalRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  publicPosCartLines,
  publicPosBillRows,
} from '@features/business/data/businessPublicPosData';

const copy = strings.publicPosCartReview;

export interface PublicPosCartReviewScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onAddFood?: () => void;
  onChangeQty?: (lineId: string, qty: number) => void;
  onRemoveLine?: (lineId: string) => void;
  onEditName?: (value: string) => void;
  onEditPhone?: (value: string) => void;
  onEditInstructions?: () => void;
  onSubmitOrder?: () => void;
}

/**
 * `public_pos_cart_review_submit_order` - the guest's tray before it is fired to
 * the kitchen: per-line quantities and notes, the guest's own details, and the
 * bill with the settle-at-table rule spelled out.
 */
export function PublicPosCartReviewScreen({
  onBack,
  onOpenProfile,
  onAddFood,
  onChangeQty,
  onRemoveLine,
  onEditName,
  onEditPhone,
  onEditInstructions,
  onSubmitOrder,
}: PublicPosCartReviewScreenProps) {
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
            label={copy.submitCta}
            labelVariant="labelMd"
            onPress={onSubmitOrder}
            leftIcon={<Icon name="rocketLaunch" size={17} color={colors.surface} />}
          />
          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <Icon name="printerPos" size={13} color={colors.textTertiary} />
            <VemtapText
              variant="micro"
              tone="tertiary"
              className="text-center"
              numberOfLines={1}
            >
              {copy.submitHint}
            </VemtapText>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2.5 rounded-card bg-surface-tint p-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
          <Icon name="tableRestaurant" size={19} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.tableLabel}
            </VemtapText>
            <View className="h-2 w-2 rounded-full bg-success" />
          </View>
          <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
            {copy.tableMeta}
          </VemtapText>
        </View>
        <BusinessStatusPill
          label={copy.verifiedBadge}
          tone="success"
          icon="verified"
          className="shrink-0"
        />
      </View>

      <View className="mt-3 flex-row items-center justify-between gap-2">
        <VemtapText
          variant="labelSm"
          className="font-sans-semibold uppercase tracking-wide"
          numberOfLines={1}
        >
          {copy.dishesTitle}
        </VemtapText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.addFoodCta}
          onPress={onAddFood}
          className="min-h-9 flex-row items-center gap-1 rounded-lg px-2 active:bg-surface-tint"
        >
          <Icon name="plusCircle" size={15} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.addFoodCta}
          </VemtapText>
        </Pressable>
      </View>

      <View className="mt-2 gap-2.5">
        {publicPosCartLines.map(line => (
          <View key={line.id} className="rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-start gap-2.5">
              <View className="h-14 w-14 shrink-0 items-center justify-center rounded-field bg-surface-container">
                <Icon name={line.icon} size={22} color={colors.textSecondary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={2}
                >
                  {line.name}
                </VemtapText>
                <VemtapText
                  variant="bodyMd"
                  className="font-sans-bold text-primary"
                  numberOfLines={1}
                >
                  {line.price}
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${line.name} delete`}
                onPress={() => onRemoveLine?.(line.id)}
                hitSlop={8}
                className="h-8 w-8 shrink-0 items-center justify-center rounded-lg active:bg-surface-container"
              >
                <Icon name="delete" size={17} color={colors.textSecondary} />
              </Pressable>
            </View>

            {line.note ? (
              <View className="mt-2 flex-row items-start gap-1.5 rounded-field bg-surface-tint px-2.5 py-2">
                <View className="mt-0.5 shrink-0">
                  <Icon name="editNote" size={14} color={colors.primary} />
                </View>
                <VemtapText
                  variant="caption"
                  className="min-w-0 flex-1"
                  numberOfLines={2}
                >
                  {line.note}
                </VemtapText>
              </View>
            ) : null}

            <View className="mt-2.5 flex-row items-center justify-between gap-2">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.quantityLabel}
              </VemtapText>
              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${line.name} decrease`}
                  onPress={() => onChangeQty?.(line.id, line.quantity - 1)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-surface-container active:scale-95"
                >
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {'\u2212'}
                  </VemtapText>
                </Pressable>
                <VemtapText
                  variant="labelMd"
                  className="min-w-[18px] text-center font-sans-semibold"
                  numberOfLines={1}
                >
                  {String(line.quantity)}
                </VemtapText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${line.name} increase`}
                  onPress={() => onChangeQty?.(line.id, line.quantity + 1)}
                  className="h-9 w-9 items-center justify-center rounded-full bg-primary active:scale-95"
                >
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold text-surface"
                    numberOfLines={1}
                  >
                    +
                  </VemtapText>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>

      <BusinessPanel
        className="mt-3"
        title={copy.guestTitle}
        icon="personPin"
        badge={copy.guestBadge}
        badgeTone="success"
      >
        <View className="gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.nameLabel}
            onPress={() => onEditName?.(copy.nameValue)}
            className="flex-row items-center gap-2 rounded-field bg-surface-container-low px-3 py-2.5 active:scale-[0.99]"
          >
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {`${copy.nameLabel} ${copy.nameRequired}`}
              </VemtapText>
              <VemtapText
                variant="bodyMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.nameValue}
              </VemtapText>
            </View>
            <Icon name="checkCircle" size={18} color={colors.success} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.phoneLabel}
            onPress={() => onEditPhone?.(copy.phoneValue)}
            className="flex-row items-center gap-2 rounded-field bg-surface-container-low px-3 py-2.5 active:scale-[0.99]"
          >
            <View className="min-w-0 flex-1">
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.phoneLabel}
              </VemtapText>
              <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                {copy.phoneMeta}
              </VemtapText>
              <VemtapText
                variant="bodyMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.phoneValue}
              </VemtapText>
            </View>
            <Icon name="bellRing" size={17} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View className="mt-2 flex-row items-center gap-2.5 rounded-field bg-surface-tint px-3 py-2.5">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
            <Icon name="qrCode" size={17} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.seatTitle}
            </VemtapText>
            <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
              {copy.seatBody}
            </VemtapText>
          </View>
          <Icon name="lock" size={16} color={colors.textSecondary} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.instructionsTitle}
          onPress={onEditInstructions}
          className="mt-2 flex-row items-start gap-2.5 rounded-field bg-surface-container-low px-3 py-2.5 active:scale-[0.99]"
        >
          <View className="mt-0.5 shrink-0">
            <Icon name="potMix" size={17} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.instructionsTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5"
              numberOfLines={3}
            >
              {copy.instructionsValue}
            </VemtapText>
          </View>
        </Pressable>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.billTitle} icon="receiptLong">
        <View className="gap-1.5">
          {publicPosBillRows.map(row => (
            <BusinessTotalsRow
              key={row.id}
              label={row.label}
              value={row.value}
              badge={row.rate ?? undefined}
            />
          ))}
        </View>
        <BusinessGrandTotalRow label={copy.totalLabel} value={copy.totalDue} />
        <View className="mt-2 flex-row items-start gap-2.5 rounded-field bg-surface-tint px-3 py-2.5">
          <View className="mt-0.5 shrink-0">
            <Icon name="pointOfSale" size={17} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.payTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5"
              numberOfLines={3}
            >
              {copy.payBody}
            </VemtapText>
          </View>
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
