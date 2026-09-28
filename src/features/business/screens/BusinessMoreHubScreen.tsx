import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { businessHubMedia } from '@features/business/data/businessHubImages';
import {
  BusinessProductImage,
  BusinessScreenLayout,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });

const copy = strings.businessMore;
const shell = strings.businessShell;

const badgeTones: Record<string, string> = {
  HOT: 'bg-tertiary-fixed text-tertiary-container',
  Active: 'bg-badge-discount-bg text-badge-discount-text',
  Insights: 'bg-surface-tint-blue text-primary',
  '3 new': 'bg-primary text-primary-foreground',
  '4 unread': 'bg-primary text-primary-foreground',
  'Tier 3 Verified': 'bg-badge-discount-bg text-badge-discount-text',
};

const actionTones: Record<string, string> = {
  success: 'text-badge-discount-text',
  brand: 'text-primary',
  neutral: 'text-text-secondary',
};

export interface BusinessMoreHubScreenProps {
  onOpenProfileDeck?: () => void;
  onOpenRow?: (id: string) => void;
  onSwitchToCustomer?: () => void;
  onOpenConsumerExperience?: () => void;
  onSignOut?: () => void;
  onOpenBranchSwitcher?: () => void;
  onOpenMasterQr?: () => void;
  onOpenNotifications?: () => void;
}

export function BusinessMoreHubScreen({
  onOpenProfileDeck,
  onOpenRow,
  onSwitchToCustomer,
  onOpenConsumerExperience,
  onSignOut,
  onOpenBranchSwitcher,
  onOpenMasterQr,
  onOpenNotifications,
}: BusinessMoreHubScreenProps) {
  return (
    <BusinessScreenLayout
      header={{
        title: copy.title,
        centerTitle: false,
        showAvatar: true,
        titleAccessory: (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.branchPill}
            onPress={onOpenBranchSwitcher}
            className="ml-1 flex-row items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 active:scale-95"
          >
            <VemtapText
              variant="labelSm"
              className="text-text-primary max-w-[110px] font-sans-semibold"
              numberOfLines={1}
            >
              {copy.branchPill}
            </VemtapText>
            <Icon name="expandMore" size={16} color={colors.onSurfaceVariant} />
          </Pressable>
        ),
        actions: [
          {
            icon: 'notifications',
            label: shell.notificationsLabel,
            onPress: onOpenNotifications,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="overflow-hidden rounded-card-lg bg-surface-container-lowest shadow-sm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.name}
          onPress={onOpenProfileDeck}
          className="flex-row items-center gap-3 p-3.5"
        >
          <View className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-surface-container">
            <BusinessProductImage
              source={{ uri: businessHubMedia.logo.uri }}
              alt={businessHubMedia.logo.alt}
              className="h-full w-full"
            />
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <View className="min-w-0 flex-row items-center gap-1.5">
              <VemtapText
                variant="headingSm"
                className="min-w-0 font-sans-semibold"
                numberOfLines={1}
              >
                {copy.name}
              </VemtapText>
              <Icon name="verified" size={16} color={colors.primary} />
            </View>
            <View className="flex-row flex-wrap items-center gap-1.5">
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {copy.accountId}
              </VemtapText>
              <View className="rounded-full bg-surface-tint-blue px-2 py-0.5">
                <VemtapText
                  variant="micro"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {copy.plan}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="locationOn" size={13} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.location}
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.masterQrLabel}
            onPress={onOpenMasterQr}
            className="h-10 w-10 shrink-0 items-center justify-center rounded-card bg-surface-container"
          >
            <Icon name="qrCode" size={20} color={colors.primary} />
          </Pressable>
        </Pressable>

        <View className="flex-row items-center justify-between gap-2 border-t border-border px-3.5 py-2.5">
          <View className="min-w-0 flex-row items-center gap-1.5">
            <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="caption"
              className="min-w-0 font-sans-medium"
              numberOfLines={1}
            >
              {copy.terminalStatus}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1.5">
            <Icon name="cloudDone" size={14} color={colors.textTertiary} />
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {copy.terminalSynced}
            </VemtapText>
          </View>
        </View>
      </View>

      {copy.sections.map(section => (
        <View key={section.id} className="mt-5 gap-2">
          <View className="flex-row items-center justify-between gap-2 px-1">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-semibold uppercase"
              numberOfLines={1}
            >
              {section.title}
            </VemtapText>
            {section.action.label ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={section.action.label}
                onPress={() => onOpenRow?.(section.id)}
                className="shrink-0 flex-row items-center gap-0.5 active:opacity-75"
              >
                <VemtapText
                  variant="labelSm"
                  className={cn('font-sans-semibold', actionTones[section.action.tone])}
                  numberOfLines={1}
                >
                  {section.action.label}
                </VemtapText>
                {section.action.icon ? (
                  <Icon
                    name={section.action.icon as IconName}
                    size={15}
                    color={
                      section.action.tone === 'brand'
                        ? colors.primary
                        : colors.badgeDiscountText
                    }
                  />
                ) : null}
              </Pressable>
            ) : null}
          </View>

          <SetupCard className="gap-0 overflow-hidden p-0">
            {section.items.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => onOpenRow?.(item.id)}
                className={cn(
                  'flex-row items-center gap-3 p-3.5 active:bg-surface-subtle',
                  index > 0 && 'border-t border-border',
                )}
              >
                <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-tint">
                  <Icon name={item.icon as IconName} size={20} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <View className="min-w-0 flex-row items-center gap-2">
                    <VemtapText
                      variant="labelMd"
                      className="min-w-0 flex-1 font-sans-semibold"
                      numberOfLines={1}
                    >
                      {item.label}
                    </VemtapText>
                    {item.badge ? (
                      <View
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5',
                          badgeTones[item.badge] ??
                            'bg-surface-container text-text-secondary',
                        )}
                      >
                        <VemtapText
                          variant="micro"
                          className="font-sans-semibold"
                          numberOfLines={1}
                        >
                          {item.badge}
                        </VemtapText>
                      </View>
                    ) : null}
                  </View>
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="mt-0.5"
                    numberOfLines={1}
                  >
                    {item.meta}
                  </VemtapText>
                </View>
                <Icon name="forward" size={18} color={colors.textTertiary} />
              </Pressable>
            ))}
          </SetupCard>
        </View>
      ))}

      <View className="mt-5 gap-3 rounded-card-lg bg-surface-tint-blue p-3.5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.switchToCustomer}
          onPress={onSwitchToCustomer}
          className="flex-row items-center gap-3"
        >
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface">
            <Icon name="localMall" size={20} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.switchToCustomer}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.switchToCustomerMeta}
            </VemtapText>
          </View>
        </Pressable>
        <Button
          label={copy.openConsumer}
          labelVariant="labelMd"
          fullWidth
          onPress={onOpenConsumerExperience ?? onSwitchToCustomer}
          rightIcon={<Icon name="arrowForward" size={18} color={colors.surface} />}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.signOut}
        onPress={onSignOut}
        className="mt-6 flex-row items-center justify-center gap-2 py-2 active:opacity-75"
      >
        <Icon name="logout" size={18} color={colors.error} />
        <VemtapText variant="labelMd" tone="error" className="font-sans-semibold">
          {copy.signOut}
        </VemtapText>
      </Pressable>

      <View className="mt-2 items-center gap-1">
        <VemtapText variant="micro" tone="tertiary" className="text-center">
          {copy.buildFootnote}
        </VemtapText>
        <View className="flex-row items-center gap-1">
          <Icon name="lock" size={12} color={colors.textTertiary} />
          <VemtapText variant="micro" tone="tertiary" className="text-center">
            {copy.complianceFootnote}
          </VemtapText>
        </View>
      </View>
    </BusinessScreenLayout>
  );
}
