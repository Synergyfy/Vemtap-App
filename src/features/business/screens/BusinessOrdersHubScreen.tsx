import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessModeMark,
  BusinessScreenLayout,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(LinearGradient, { className: 'style' });

const copy = strings.businessOrders;
const shell = strings.businessShell;

type OrderTone = (typeof copy.orders)[number]['channelTone'];
type CtaStyle = NonNullable<(typeof copy.orders)[number]['ctaStyle']>;

const channelIcons: Record<string, IconName> = {
  New: 'bolt',
  POS: 'pointOfSale',
  Processing: 'sync',
  Ready: 'checkCircle',
  Completed: 'checkBold',
};

const channelStyles: Record<
  OrderTone,
  { chip: string; text: string; icon: string; accent: string }
> = {
  brand: {
    chip: 'bg-primary',
    text: 'text-surface',
    icon: colors.surface,
    accent: 'border-l-4 border-primary',
  },
  neutral: {
    chip: 'bg-secondary-fixed',
    text: 'text-on-secondary-container',
    icon: colors.onSecondaryContainer,
    accent: 'border-l-4 border-secondary-fixed',
  },
  warning: {
    chip: 'bg-surface-tint-blue',
    text: 'text-primary',
    icon: colors.primary,
    accent: 'border-l-4 border-surface-tint-blue',
  },
  success: {
    chip: 'bg-badge-discount-bg',
    text: 'text-badge-discount-text',
    icon: colors.badgeDiscountText,
    accent: 'border-l-4 border-badge-discount-text',
  },
  muted: {
    chip: 'bg-surface-container',
    text: 'text-text-secondary',
    icon: colors.textSecondary,
    accent: '',
  },
};

const paymentIcons: Record<string, IconName> = {
  'pos-1049': 'pointOfSale',
  'vg-93988': 'accountBalance',
  'vg-93910': 'payments',
};

const paymentStyles: Record<string, { chip: string; text: string; icon: string }> = {
  'vg-94021': {
    chip: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    icon: colors.primary,
  },
  'pos-1049': {
    chip: 'bg-surface-container-highest',
    text: 'text-secondary',
    icon: colors.secondary,
  },
  'vg-93988': {
    chip: 'bg-badge-discount-bg',
    text: 'text-badge-discount-text',
    icon: colors.badgeDiscountText,
  },
  'vg-93910': {
    chip: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    icon: colors.badgeDiscountText,
  },
};

const defaultPaymentStyle = {
  chip: 'bg-surface-container-low',
  text: 'text-text-secondary',
  icon: colors.textSecondary,
};

const ctaStyles: Record<CtaStyle, { chip: string; text: string; icon: IconName }> = {
  primary: { chip: 'bg-primary', text: 'text-surface', icon: 'check' },
  neutral: {
    chip: 'bg-surface-container',
    text: 'text-text-primary',
    icon: 'restaurant',
  },
  link: { chip: '', text: 'text-primary', icon: 'forward' },
};

export interface BusinessOrdersHubScreenProps {
  onOpenBranchSwitcher?: () => void;
  onOpenBookings?: () => void;
  onOpenPosOrders?: () => void;
  onOpenOrder?: (id: string) => void;
  onAcceptOrder?: (id: string) => void;
  onSendToKitchen?: (id: string) => void;
  onSearchOrders?: () => void;
  onFilterOrders?: () => void;
  onOpenNotifications?: () => void;
}

export function BusinessOrdersHubScreen({
  onOpenBranchSwitcher,
  onOpenBookings,
  onOpenPosOrders,
  onOpenOrder,
  onAcceptOrder,
  onSendToKitchen,
  onSearchOrders,
  onFilterOrders,
  onOpenNotifications,
}: BusinessOrdersHubScreenProps) {
  const [surface, setSurface] = useState(0);
  const [filter, setFilter] = useState(0);

  return (
    <BusinessScreenLayout
      header={{
        title: shell.tabs.orders,
        eyebrow: shell.modeLabel,
        centerTitle: false,
        leading: <BusinessModeMark label={shell.modeMark} />,
        showAvatar: true,
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
      <View className="flex-row items-center justify-between gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.branch}
          onPress={onOpenBranchSwitcher}
          className="min-w-0 flex-1 flex-row items-center gap-2 self-start rounded-full bg-surface-container-low px-3 py-1.5 active:scale-95"
        >
          <Icon name="storefront" size={17} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.branch}
          </VemtapText>
          <Icon name="expandMore" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.searchLabel}
            onPress={onSearchOrders}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low active:scale-95"
          >
            <Icon name="search" size={20} color={colors.surfaceDark} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.filterLabel}
            onPress={onFilterOrders}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low active:scale-95"
          >
            <Icon name="tune" size={20} color={colors.surfaceDark} />
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-container" />
          </Pressable>
        </View>
      </View>

      <StatusPillTabs
        variant="switcher"
        labels={copy.switcher}
        counts={copy.switcherCounts}
        selected={surface}
        onSelect={index => {
          setSurface(index);
          if (index === 1) onOpenBookings?.();
        }}
      />

      <View className="-mx-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-6 py-1"
        >
          {copy.filters.map((chip, index) => (
            <BusinessSelectionChip
              key={chip.label}
              label={`${chip.label} (${chip.count})`}
              selected={index === filter}
              onPress={() => setFilter(index)}
              tone="brand"
              leading={
                chip.dot ? (
                  <View className="h-2 w-2 rounded-full bg-primary-container" />
                ) : undefined
              }
            />
          ))}
        </ScrollView>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.alertTitle}
        onPress={onOpenPosOrders}
        className="mb-3 mt-4 overflow-hidden rounded-card shadow-sm active:scale-[0.99]"
      >
        <LinearGradient
          colors={[
            colors.tertiaryFixed,
            colors.surfaceContainer,
            colors.surfaceContainerLow,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-between gap-3 px-3.5 py-4"
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary-container shadow-sm">
              <Icon name="bolt" size={22} color={colors.surface} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.alertTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.alertBody}
              </VemtapText>
            </View>
          </View>
          <Icon name="arrowForward" size={20} color={colors.textSecondary} />
        </LinearGradient>
      </Pressable>

      <View className="gap-3">
        {copy.orders.map(order => {
          const channel = channelStyles[order.channelTone];
          const payment = paymentStyles[order.id] ?? defaultPaymentStyle;
          const cta = order.cta && order.ctaStyle ? ctaStyles[order.ctaStyle] : null;
          return (
            <Pressable
              key={order.reference}
              accessibilityRole="button"
              accessibilityLabel={order.reference}
              onPress={() => onOpenOrder?.(order.id)}
              className={cn(
                'gap-2 rounded-card bg-surface-container-lowest p-3.5 shadow-sm',
                channel.accent,
                order.muted && 'opacity-90',
              )}
            >
              <View className="flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className={cn(
                      'shrink font-sans-semibold',
                      !order.muted && 'font-sans-bold',
                    )}
                    numberOfLines={1}
                  >
                    {order.reference}
                  </VemtapText>
                  <View
                    className={cn(
                      'flex-row items-center gap-1 self-start rounded-full px-2 py-0.5',
                      channel.chip,
                    )}
                  >
                    {order.channel !== 'New' && order.channel !== 'POS' ? (
                      <Icon
                        name={channelIcons[order.channel] ?? 'receipt'}
                        size={12}
                        color={channel.icon}
                      />
                    ) : null}
                    <VemtapText
                      variant="micro"
                      className={cn(
                        'font-sans-semibold uppercase',
                        channel.text,
                        (order.channel === 'New' || order.channel === 'POS') &&
                          'font-sans-bold',
                      )}
                    >
                      {order.channel}
                    </VemtapText>
                  </View>
                  <View className="max-w-[46%] shrink rounded-full bg-surface-container px-2 py-0.5">
                    <VemtapText
                      variant="micro"
                      className="font-sans-medium text-secondary"
                      numberOfLines={1}
                    >
                      {order.fulfilment}
                    </VemtapText>
                  </View>
                </View>
                <View className="shrink-0 flex-row items-center gap-1">
                  {order.urgent ? (
                    <View className="h-1.5 w-1.5 rounded-full bg-primary-container" />
                  ) : null}
                  <VemtapText
                    variant="caption"
                    className={cn(
                      order.urgent && 'font-sans-semibold text-primary',
                      order.muted && 'text-text-tertiary',
                    )}
                  >
                    {order.time}
                  </VemtapText>
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="shrink font-sans-semibold"
                    numberOfLines={1}
                  >
                    {order.customer}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary" className="shrink-0">
                    •
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="min-w-0 flex-1"
                    numberOfLines={1}
                  >
                    {order.items}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="labelMd"
                  className="shrink-0 pl-1 font-sans-bold"
                  numberOfLines={1}
                >
                  {order.amount}
                </VemtapText>
              </View>

              <View className="flex-row items-center justify-between gap-2 pt-1">
                <View
                  className={cn(
                    'min-w-0 max-w-[62%] shrink flex-row items-center gap-1 self-start rounded-full px-2 py-0.5',
                    payment.chip,
                  )}
                >
                  <Icon
                    name={paymentIcons[order.id] ?? 'creditCard'}
                    size={14}
                    color={payment.icon}
                  />
                  <VemtapText
                    variant="micro"
                    className={cn('font-sans-semibold', payment.text)}
                    numberOfLines={1}
                  >
                    {order.payment}
                  </VemtapText>
                </View>
                {order.cta && cta ? (
                  <View className="shrink-0 flex-row items-center gap-1.5">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={order.cta}
                      onPress={() =>
                        order.channel === 'POS'
                          ? onSendToKitchen?.(order.id)
                          : onAcceptOrder?.(order.id)
                      }
                      className={cn(
                        'h-8 shrink-0 flex-row items-center gap-1 rounded-field px-2.5',
                        cta.chip,
                        cta.chip && 'shadow-sm active:scale-95',
                      )}
                    >
                      <VemtapText
                        variant="labelSm"
                        className={cn('font-sans-semibold', cta.text)}
                        numberOfLines={1}
                      >
                        {order.cta}
                      </VemtapText>
                      <Icon
                        name={cta.icon}
                        size={16}
                        color={order.ctaStyle === 'link' ? channel.icon : colors.surface}
                      />
                    </Pressable>
                    {order.ctaStyle === 'link' ? null : (
                      <Icon name="forward" size={18} color={colors.textTertiary} />
                    )}
                  </View>
                ) : (
                  <Icon name="forward" size={18} color={colors.textTertiary} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </BusinessScreenLayout>
  );
}
