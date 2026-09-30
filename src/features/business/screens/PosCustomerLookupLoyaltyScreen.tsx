import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessIconWell,
  BusinessPanel,
  BusinessSearchTrigger,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { posLoyaltyRewards } from '@features/business/data/businessPosCustomerData';
import { cartCustomer } from '@features/business/data/businessPosFlowData';

const copy = strings.posCustomerLookupLoyalty;

export interface PosCustomerLookupLoyaltyScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onSearch?: () => void;
  onScan?: () => void;
  onChangeCustomer?: () => void;
  onOpenRewards?: () => void;
  onRedeem?: (rewardId: string) => void;
  onRegisterCustomer?: () => void;
  onContinueAsGuest?: () => void;
  onAttach?: () => void;
}

/**
 * `pos_customer_lookup_loyalty` - attach a matched pass holder: balance, points
 * earned today and the rewards/deals that are already eligible on this ticket.
 */
export function PosCustomerLookupLoyaltyScreen({
  onBack,
  onOpenProfile,
  onSearch,
  onScan,
  onChangeCustomer,
  onOpenRewards,
  onRedeem,
  onRegisterCustomer,
  onContinueAsGuest,
  onAttach,
}: PosCustomerLookupLoyaltyScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        subtitle: copy.headerSubtitle,
        onBack,
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
            label={copy.attachCta}
            labelVariant="labelMd"
            onPress={onAttach}
            rightIcon={<Icon name="arrowForward" size={17} color={colors.surface} />}
          />
        </BusinessActionDock>
      }
    >
      <View className="flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <BusinessSearchTrigger
            placeholder={copy.searchValue}
            onPress={onSearch}
            surface="bordered"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.searchValue}
          onPress={onScan}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-field bg-surface-tint active:scale-95"
        >
          <Icon name="barcodeScan" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View className="mt-2 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <Icon name="checkCircle" size={15} color={colors.success} />
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.matchedLabel}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.changeCta}
          onPress={onChangeCustomer}
          hitSlop={8}
          className="min-h-9 shrink-0 justify-center px-2"
        >
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {copy.changeCta}
          </VemtapText>
        </Pressable>
      </View>

      <BusinessPanel className="mt-3">
        <View className="flex-row items-start gap-3">
          <BusinessInitialsAvatar
            initials={copy.customerInitials}
            size="lg"
            badgeIcon="verified"
          />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="headingSm"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {cartCustomer.name}
            </VemtapText>
            <BusinessStatusPill
              label={copy.tierBadge}
              tone="brand"
              className="mt-1 self-start"
            />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-1"
              numberOfLines={1}
            >
              {cartCustomer.phone}
            </VemtapText>
          </View>
          <View className="shrink-0 items-end">
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.balanceLabel}
            </VemtapText>
            <VemtapText variant="headingLg" className="font-sans-bold" numberOfLines={1}>
              {copy.balanceValue}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.balanceUnit}
            </VemtapText>
          </View>
        </View>

        <View className="mt-3 flex-row gap-2">
          {[
            { label: copy.visitsLabel, value: copy.visitsValue },
            { label: copy.ordersLabel, value: copy.ordersValue },
            { label: copy.statusLabel, value: copy.statusValue, tone: 'text-primary' },
          ].map(stat => (
            <View
              key={stat.label}
              className="min-w-0 flex-1 items-center rounded-field bg-surface-container-low px-2 py-2.5"
            >
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {stat.label}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className={`font-sans-semibold ${stat.tone ?? ''}`}
                numberOfLines={1}
              >
                {stat.value}
              </VemtapText>
            </View>
          ))}
        </View>
      </BusinessPanel>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.earnedTitle}
        onPress={onOpenRewards}
        className="mt-3 flex-row items-center gap-3 rounded-card bg-surface-tint p-3 active:scale-[0.99]"
      >
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
          <Icon name="star" size={20} color={colors.surface} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.earnedTitle}
          </VemtapText>
          <VemtapText variant="caption" className="text-primary" numberOfLines={1}>
            {copy.earnedBody}
          </VemtapText>
        </View>
        <View className="shrink-0">
          <Icon name="trendingUp" size={18} color={colors.primary} />
        </View>
      </Pressable>

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold uppercase tracking-wide"
          numberOfLines={1}
        >
          {copy.rewardsTitle}
        </VemtapText>
        <VemtapText variant="caption" tone="brand" numberOfLines={1}>
          {copy.rewardsBadge}
        </VemtapText>
      </View>

      <View className="mt-2 gap-2">
        {posLoyaltyRewards.map(reward => (
          <View
            key={reward.id}
            className="flex-row items-center gap-3 rounded-card bg-surface p-3 shadow-sm"
          >
            <BusinessIconWell icon={reward.icon} tone={reward.tone} />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={2}
              >
                {reward.title}
              </VemtapText>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5"
                numberOfLines={2}
              >
                {reward.body}
              </VemtapText>
            </View>
            <View className="shrink-0 items-end gap-1.5">
              <BusinessStatusPill label={reward.cost} tone={reward.tone} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${reward.cta} ${reward.title}`}
                onPress={() => onRedeem?.(reward.id)}
                className="min-h-9 flex-row items-center rounded-field bg-surface-container px-3 active:scale-95"
              >
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {reward.cta}
                </VemtapText>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-3 gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.registerCta}
          onPress={onRegisterCustomer}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-card bg-surface shadow-sm active:scale-[0.98]"
        >
          <Icon name="personAdd" size={18} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.registerCta}
          </VemtapText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.guestCta}
          onPress={onContinueAsGuest}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-card active:scale-[0.98]"
        >
          <VemtapText variant="labelSm" tone="secondary" numberOfLines={2}>
            {copy.guestCta}
          </VemtapText>
          <Icon name="arrowForward" size={15} color={colors.textSecondary} />
        </Pressable>
      </View>
    </BusinessScreenLayout>
  );
}
