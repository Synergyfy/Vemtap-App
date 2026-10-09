import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { colors } from '@theme/colors';
import {
  BusinessBranchSwitcher,
  type BusinessBranch,
} from '@features/business/components/BusinessBranchSwitcher';
import {
  BusinessModeMark,
  BusinessScreenLayout,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import type {
  BusinessOrderCounts,
  PresentedOrder,
} from '@features/business/hooks/useBusinessOrders';
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
  /** Fired when the cashier picks a different branch from the shared switcher. */
  onChangeBranch?: (branchId: string) => void;
  onAddBranch?: () => void;
  onOpenBookings?: () => void;
  onOpenPosOrders?: () => void;
  onOpenOrder?: (id: string) => void;
  onAcceptOrder?: (id: string) => void;
  onSendToKitchen?: (id: string) => void;
  /** Live status change (Accept/Mark Ready/Handover) from the order card. */
  onUpdateOrderStatus?: (id: string, status: string) => void;
  onFilterOrders?: () => void;
  /** Status filter selected from the chip row (undefined = All). */
  onSelectStatus?: (status?: string) => void;
  onOpenNotifications?: () => void;
  /** Live data from the route; omitted renders the designed fallback copy. */
  orders?: readonly PresentedOrder[];
  orderCounts?: BusinessOrderCounts['counts'];
  orderTotal?: number;
  bookingTotal?: number;
  branches?: readonly BusinessBranch[];
  activeBranchId?: string;
}

const FILTER_STATUSES: readonly (string | undefined)[] = [
  undefined,
  'new',
  'processing',
  'ready',
  'completed',
  'cancelled',
];

export function BusinessOrdersHubScreen({
  onChangeBranch,
  onAddBranch,
  onOpenBookings,
  onOpenPosOrders,
  onOpenOrder,
  onAcceptOrder,
  onSendToKitchen,
  onUpdateOrderStatus,
  onFilterOrders,
  onSelectStatus,
  onOpenNotifications,
  orders,
  orderCounts,
  orderTotal,
  bookingTotal,
  branches,
  activeBranchId,
}: BusinessOrdersHubScreenProps) {
  const [surface, setSurface] = useState(0);
  const [filter, setFilter] = useState(0);

  /** Design copy, normalised to the live order shape for one render path. */
  const fallbackOrders: PresentedOrder[] = copy.orders.map(order => ({
    id: order.id,
    reference: order.reference,
    status: order.channel.toLowerCase(),
    channel: order.channel,
    channelTone: order.channelTone,
    fulfilment: order.fulfilment,
    time: order.time,
    urgent: order.urgent,
    customer: order.customer,
    items: order.items,
    amount: order.amount,
    payment: order.payment,
    cta: order.cta,
    ctaStyle: order.ctaStyle,
    nextStatus: undefined,
    muted: order.muted,
  }));
  const list = orders ?? fallbackOrders;

  const countFor = (index: number): string => {
    if (!orderCounts) return copy.filters[index]?.count ?? '0';
    const status = FILTER_STATUSES[index];
    if (!status) return String(orderTotal ?? 0);
    return String(orderCounts[status as keyof typeof orderCounts] ?? 0);
  };
  const chipCounts = copy.filters.map((chip, index) => ({
    ...chip,
    count: countFor(index),
  }));

  const switcherCounts: [string, string] = orderCounts
    ? [String(orderTotal ?? 0), String(bookingTotal ?? 0)]
    : [...copy.switcherCounts];

  const requiresAction = orderCounts ? orderCounts.new + orderCounts.processing : null;
  const alertTitle =
    requiresAction === null ? copy.alertTitle : copy.alertTitleFor(requiresAction);
  const alertBody =
    requiresAction === null || !orderCounts
      ? copy.alertBody
      : copy.alertBodyFor(orderCounts.new, orderCounts.processing);

  const handleCta = (order: PresentedOrder) => {
    if (onUpdateOrderStatus && order.nextStatus) {
      onUpdateOrderStatus(order.id, order.nextStatus);
      return;
    }
    if (order.channel === 'POS') {
      onSendToKitchen?.(order.id);
    } else {
      onAcceptOrder?.(order.id);
    }
  };

  return (
    <TypeDensityProvider density="compact">
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
          <BusinessBranchSwitcher
            branches={branches ?? strings.businessBranchSwitcher.branches}
            activeBranchId={activeBranchId}
            className="flex-1"
            onChangeBranch={onChangeBranch}
            onAddBranch={onAddBranch}
          />
          <View className="flex-row items-center gap-2">
            {onFilterOrders ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.filterLabel}
                onPress={onFilterOrders}
                className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low active:scale-95"
              >
                <Icon name="tune" size={20} color={colors.surfaceDark} />
                <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-container" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <StatusPillTabs
          variant="switcher"
          labels={copy.switcher}
          counts={switcherCounts}
          selected={surface}
          disabledTabs={onOpenBookings ? [] : [1]}
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
            {chipCounts.map((chip, index) => (
              <BusinessSelectionChip
                key={chip.label}
                label={`${chip.label} (${chip.count})`}
                selected={index === filter}
                onPress={() => {
                  setFilter(index);
                  onSelectStatus?.(FILTER_STATUSES[index]);
                }}
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
          accessibilityLabel={alertTitle}
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
                  {alertTitle}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {alertBody}
                </VemtapText>
              </View>
            </View>
            <Icon name="arrowForward" size={20} color={colors.textSecondary} />
          </LinearGradient>
        </Pressable>

        {orders && orders.length === 0 ? (
          <View className="items-center gap-1 rounded-card bg-surface-container-lowest p-6 shadow-sm">
            <Icon name="receipt" size={26} color={colors.textTertiary} />
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.emptyTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" className="text-center">
              {copy.emptyBody}
            </VemtapText>
          </View>
        ) : null}

        <View className="gap-3">
          {list.map(order => {
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
                        onPress={() => handleCta(order)}
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
                          color={
                            order.ctaStyle === 'link' ? channel.icon : colors.surface
                          }
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
    </TypeDensityProvider>
  );
}
