import React, { useState } from 'react';
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
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import {
  switchCustomerCards,
  switchCustomerDeal,
} from '@features/business/data/businessTrustSettingsData';

const copy = strings.switchToCustomer;

export interface SwitchToCustomerScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onConfirmSwitch?: () => void;
  onStayInBusiness?: () => void;
  onOpenDeal?: (dealId: string) => void;
  /** Logged-in business the user is leaving; falls back to the design copy. */
  merchantName?: string;
  /** The customer identity being joined (same account, customer side). */
  customerName?: string;
  /** Email (or phone) shown under the customer identity. */
  customerMeta?: string;
}

/**
 * Profile switch confirmation: the merchant identity being left, the customer
 * identity being joined, their claim/spot summary, an "always ask" preference,
 * and a nudge toward a deal waiting in the personal wallet.
 */
export function SwitchToCustomerScreen({
  onBack,
  onOpenProfile,
  onConfirmSwitch,
  onStayInBusiness,
  onOpenDeal,
  merchantName: merchantNameProp,
  customerName: customerNameProp,
  customerMeta: customerMetaProp,
}: SwitchToCustomerScreenProps) {
  const [askEveryTime, setAskEveryTime] = useState(true);

  const merchantName = merchantNameProp?.trim() || copy.fromName;
  const customerName = customerNameProp?.trim() || copy.toName;
  const customerMeta = customerMetaProp?.trim() || copy.toMeta;

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
            label={copy.cta}
            labelVariant="labelMd"
            onPress={onConfirmSwitch}
            leftIcon={<Icon name="swapHoriz" size={18} color={colors.surface} />}
          />
          <Button
            label={copy.stayCta}
            labelVariant="labelSm"
            variant="outline"
            onPress={onStayInBusiness}
          />
        </BusinessActionDock>
      }
    >
      <View className="items-center gap-2 rounded-card bg-surface p-4 shadow-sm">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
          <Icon name="swapHoriz" size={26} color={colors.primary} />
        </View>
        <VemtapText
          variant="headingLg"
          className="text-center text-heading-lg"
          numberOfLines={2}
        >
          {copy.title}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="text-center"
          numberOfLines={3}
        >
          {copy.body}
        </VemtapText>
      </View>

      <View className="mt-3 flex-row items-center gap-2 rounded-card bg-surface-subtle p-3">
        <BusinessIconWell icon="storefront" tone="neutral" size="md" />
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {copy.fromLabel}
          </VemtapText>
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {merchantName}
          </VemtapText>
        </View>
        <View className="shrink-0 items-end">
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {copy.fromRole}
          </VemtapText>
          <BusinessStatusPill label={copy.fromStatus} tone="neutral" />
        </View>
      </View>

      <View className="mt-2 flex-row items-center justify-center">
        <Icon name="arrowForward" size={20} color={colors.primary} />
      </View>

      <View className="mt-2 gap-2 rounded-card border border-border bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint">
            <Icon name="person" size={18} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.toLabel}
            </VemtapText>
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
              >
                {customerName}
              </VemtapText>
              <Icon name="verifiedUser" size={15} color={colors.primary} />
            </View>
          </View>
          <View className="shrink-0 items-end">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {copy.toRole}
            </VemtapText>
            <BusinessStatusPill label={copy.toStatus} tone="success" />
          </View>
        </View>
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {customerMeta}
        </VemtapText>

        <View className="mt-1 flex-row gap-2">
          {switchCustomerCards.map(card => (
            <View
              key={card.id}
              className="min-w-0 flex-1 gap-1 rounded-field bg-surface-subtle p-2.5"
            >
              <View className="flex-row items-center gap-1.5">
                <Icon name={card.icon} size={15} color={colors.primary} />
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {card.label}
                </VemtapText>
              </View>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {card.hint}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {card.detail}
              </VemtapText>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-3 overflow-hidden rounded-card bg-surface shadow-sm">
        <BusinessSettingRow
          title={copy.askTitle}
          icon="notificationsActive"
          trailing="switch"
          switchValue={askEveryTime}
          onSwitchChange={setAskEveryTime}
        />
      </View>

      <BusinessPanel className="mt-3" icon="localOffer">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={switchCustomerDeal.name}
          onPress={() => onOpenDeal?.(switchCustomerDeal.id)}
          className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-3 active:bg-surface-container"
        >
          <BusinessIconWell icon="redeem" tone="success" size="md" />
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {switchCustomerDeal.name}
              </VemtapText>
              <BusinessStatusPill label={switchCustomerDeal.discount} tone="success" />
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {switchCustomerDeal.hint}
            </VemtapText>
          </View>
          <View className="shrink-0">
            <Icon name="forward" size={18} color={colors.textTertiary} />
          </View>
        </Pressable>
      </BusinessPanel>

      <View className="mt-3 flex-row items-start gap-1.5 rounded-field bg-surface-subtle p-2.5">
        <Icon name="info" size={14} color={colors.textTertiary} />
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="min-w-0 flex-1"
          numberOfLines={3}
        >
          {copy.footer}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
