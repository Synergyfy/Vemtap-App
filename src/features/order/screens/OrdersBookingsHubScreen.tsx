import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { OrderHubCard } from '@features/order/components/OrderHubComponents';
import { useCustomerOrders } from '@features/order/hooks/useCustomerOrders';
import { orderImages } from '@features/order/orderData';
import { formatCurrency, formatWhen } from '@utils/formatters';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

/**
 * Wire statuses behind each Orders filter chip, in chip order. The API's
 * `CatalogueOrderStatus` is finer-grained than the four chips the design calls
 * for, so the extra states are folded into their nearest chip rather than
 * dropped.
 */
const ORDER_STATUS_GROUPS: readonly (readonly string[])[] = [
  ['new', 'processing'],
  ['completed'],
  ['cancelled', 'rejected'],
  ['refunded', 'partial_refund'],
];

const TERMINAL_STATUSES = new Set([
  'cancelled',
  'rejected',
  'refunded',
  'partial_refund',
]);

function isActiveStatus(status: string | null | undefined): boolean {
  return status === 'new' || status === 'processing';
}

function statusLabel(status: string | null | undefined): string {
  const labels = strings.ordersHub.orderStatusLabels as Record<string, string>;
  const key = status ?? '';
  return labels[key] ?? key;
}

function statusToneFor(
  status: string | null | undefined,
): 'success' | 'brand' | 'warning' | 'neutral' {
  if (isActiveStatus(status)) return 'warning';
  if (status === 'completed') return 'success';
  if (TERMINAL_STATUSES.has(status ?? '')) return 'neutral';
  return 'brand';
}

export interface OrdersBookingsHubScreenProps {
  onBack?: () => void;
  onSearch?: () => void;
  onOpenOrder?: (orderNumber: string) => void;
  onOpenBooking?: (bookingNumber: string) => void;
  onContactKitchen?: () => void;
  onTrackOrder?: () => void;
  onNavigate?: (action: string) => void;
}

export function OrdersBookingsHubScreen({
  onBack,
  onSearch,
  onOpenOrder,
  onOpenBooking,
  onContactKitchen,
  onTrackOrder,
  onNavigate,
}: OrdersBookingsHubScreenProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'orders' | 'bookings'>('orders');
  const [filter, setFilter] = useState(0);
  const noop = () => undefined;
  const filters =
    mode === 'orders' ? strings.ordersHub.orderFilters : strings.ordersHub.bookingFilters;

  const orders = useCustomerOrders();
  const orderList = orders.data ?? [];
  const filterCounts = ORDER_STATUS_GROUPS.map(
    group => orderList.filter(order => group.includes(order.status ?? '')).length,
  );
  const visibleOrders = orderList.filter(order =>
    ORDER_STATUS_GROUPS[filter]?.includes(order.status ?? ''),
  );
  /** Counts appear only once the query has settled, so chips don't flicker 0. */
  const showCounts = orders.data !== undefined;
  const withCount = (label: string, count: number) =>
    showCounts ? `${label} (${count})` : label;

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between bg-surface px-6 pb-3 pt-2"
        style={[navbarBottomShadow, { paddingTop: Math.max(insets.top, 8) }]}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            hitSlop={8}
            onPress={onBack}
            className="-ml-2 h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <Icon name="back" size={24} color={colors.surfaceDark} />
          </Pressable>
          <VemtapText
            accessibilityRole="header"
            variant="labelMd"
            className="font-sans-semibold"
            numberOfLines={1}
          >
            {strings.ordersHub.title}
          </VemtapText>
        </View>
        <View className="shrink-0 flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.ordersHub.search}
            onPress={onSearch}
            className="h-11 w-11 items-center justify-center rounded-full"
          >
            <Icon name="search" size={22} color={colors.textSecondary} />
          </Pressable>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" size={17} color={colors.surface} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row rounded-full bg-surface-container p-1 shadow-sm">
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'orders' }}
            onPress={() => {
              setMode('orders');
              setFilter(0);
            }}
            className={`min-h-10 flex-1 flex-row items-center justify-center gap-1 rounded-full ${mode === 'orders' ? 'bg-primary shadow-sm' : ''}`}
          >
            <Icon
              name="shoppingBag"
              size={18}
              color={mode === 'orders' ? colors.surface : colors.textSecondary}
            />
            <VemtapText
              variant="labelMd"
              tone={mode === 'orders' ? 'inverse' : 'secondary'}
              className="font-sans-semibold"
            >
              {withCount(strings.ordersHub.orders, orderList.length)}
            </VemtapText>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'bookings' }}
            onPress={() => {
              setMode('bookings');
              setFilter(0);
            }}
            className={`min-h-10 flex-1 flex-row items-center justify-center gap-1 rounded-full ${mode === 'bookings' ? 'bg-primary shadow-sm' : ''}`}
          >
            <Icon
              name="eventAvailable"
              size={18}
              color={mode === 'bookings' ? colors.surface : colors.textSecondary}
            />
            <VemtapText
              variant="labelMd"
              tone={mode === 'bookings' ? 'inverse' : 'secondary'}
              className="font-sans-semibold"
            >
              {strings.ordersHub.bookingsTab}
            </VemtapText>
          </Pressable>
        </View>

        {mode === 'orders' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenBooking?.('VT-BK-5019')}
            className="flex-row items-center gap-3 rounded-xl bg-surface-tint p-3 shadow-sm"
          >
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm">
              <Icon name="spa" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <VemtapText variant="caption" tone="brand" className="font-sans-medium">
                  {strings.ordersHub.nextBooking}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  •
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={1}
                  className="flex-1"
                >
                  {strings.ordersHub.nextBookingMerchant}
                </VemtapText>
              </View>
              <VemtapText variant="labelMd" className="mt-0.5 font-sans-semibold">
                {strings.ordersHub.nextBookingDate}
              </VemtapText>
            </View>
            <View className="flex-row items-center">
              <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                {strings.ordersHub.view}
              </VemtapText>
              <Icon name="forward" size={16} color={colors.primary} />
            </View>
          </Pressable>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 py-1"
        >
          {filters.map((item, index) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === index }}
              onPress={() => setFilter(index)}
              className={`h-9 shrink-0 items-center justify-center rounded-full px-4 shadow-sm ${filter === index ? 'bg-surface-tint' : 'bg-surface'}`}
            >
              <VemtapText
                variant="labelMd"
                tone={filter === index ? 'brand' : 'secondary'}
                className={filter === index ? 'font-sans-semibold' : 'font-sans-medium'}
              >
                {mode === 'orders' ? withCount(item, filterCounts[index] ?? 0) : item}
              </VemtapText>
            </Pressable>
          ))}
        </ScrollView>

        {mode === 'orders' ? (
          orders.isLoading ? (
            <LoadingState label={strings.common.loading} />
          ) : orders.isError ? (
            <ErrorState title={strings.common.error} onRetry={orders.refetch} />
          ) : visibleOrders.length === 0 ? (
            <EmptyState
              variant="contained"
              icon="shoppingBag"
              title={
                filter === 0 ? strings.ordersHub.emptyOrdersTitle : strings.common.empty
              }
              description={filter === 0 ? strings.ordersHub.emptyOrdersBody : undefined}
            />
          ) : (
            <View className="gap-4">
              {visibleOrders.map(order => {
                const lineImage = order.items?.[0]?.image;
                return (
                  <OrderHubCard
                    key={order.id}
                    image={lineImage ? { uri: lineImage } : { uri: orderImages.merchant }}
                    merchant={
                      order.branch?.name ?? strings.ordersHub.orderMerchantFallback
                    }
                    meta={`${strings.ordersHub.orderNumberLabel}${order.id.slice(0, 8).toUpperCase()} • ${formatWhen(order.createdAt ?? '')}`}
                    status={statusLabel(order.status)}
                    statusTone={statusToneFor(order.status)}
                    accent={isActiveStatus(order.status)}
                    onPress={() => onOpenOrder?.(order.id)}
                    actions={
                      isActiveStatus(order.status)
                        ? [
                            {
                              label: strings.ordersHub.contactKitchen,
                              onPress: onContactKitchen ?? noop,
                            },
                            {
                              label: strings.ordersHub.trackOrder,
                              onPress: onTrackOrder ?? noop,
                              primary: true,
                            },
                          ]
                        : []
                    }
                  >
                    <View className="gap-1 py-1">
                      {(order.items ?? []).map(item => (
                        <View
                          key={item.id ?? item.itemId ?? ''}
                          className="flex-row justify-between gap-3"
                        >
                          <VemtapText
                            variant="bodyMd"
                            className="min-w-0 flex-1 font-sans-medium"
                            numberOfLines={1}
                          >
                            {`${item.quantity ?? 1}x ${item.name ?? strings.ordersHub.orderItemFallback}`}
                          </VemtapText>
                          <VemtapText variant="bodyMd" className="shrink-0">
                            {item.totalPrice == null
                              ? ''
                              : formatCurrency(item.totalPrice)}
                          </VemtapText>
                        </View>
                      ))}
                    </View>
                    {order.totalAmount == null ? null : (
                      <View className="mt-2 flex-row items-end justify-between gap-2 rounded-xl bg-surface-subtle p-2.5">
                        <VemtapText variant="caption" tone="secondary">
                          {strings.ordersHub.orderTotalLabel}
                        </VemtapText>
                        <VemtapText variant="labelMd" className="font-sans-bold">
                          {formatCurrency(Number(order.totalAmount))}
                        </VemtapText>
                      </View>
                    )}
                  </OrderHubCard>
                );
              })}
            </View>
          )
        ) : (
          <View className="gap-4">
            <OrderHubCard
              image={{ uri: orderImages.merchant }}
              merchant={strings.ordersHub.glowName}
              meta={strings.ordersHub.glowMeta}
              status={strings.ordersHub.bookings.upcoming}
              statusTone="brand"
              onPress={() => onOpenBooking?.('VT-BK-5019')}
              actions={[
                { label: strings.ordersHub.bookings.addCalendar, onPress: noop },
                {
                  label: strings.ordersHub.bookings.directions,
                  onPress: noop,
                  primary: true,
                },
              ]}
            >
              <View className="gap-2 rounded-xl bg-surface-subtle p-3">
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {strings.ordersHub.bookingDate}
                </VemtapText>
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText variant="caption" tone="secondary">
                    {strings.ordersHub.bookingTime}
                  </VemtapText>
                  <VemtapText variant="caption" className="font-sans-medium">
                    {strings.ordersHub.therapist}
                  </VemtapText>
                </View>
              </View>
              <View className="mt-3 gap-1">
                <VemtapText variant="bodyMd" className="font-sans-semibold">
                  {strings.ordersHub.bookings.service}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.ordersHub.bookings.serviceBody}
                </VemtapText>
                <View className="mt-1 flex-row items-center justify-between">
                  <VemtapText
                    variant="caption"
                    tone="success"
                    className="font-sans-semibold"
                  >
                    {strings.ordersHub.bookings.deposit}
                  </VemtapText>
                  <VemtapText variant="labelMd" className="font-sans-bold">
                    {strings.ordersHub.bookingTotal}
                  </VemtapText>
                </View>
              </View>
            </OrderHubCard>
            <OrderHubCard
              image={{ uri: orderImages.steak }}
              merchant={strings.ordersHub.groomingName}
              meta={strings.ordersHub.groomingMeta}
              status={strings.ordersHub.bookings.completed}
              onPress={() => onOpenBooking?.('VT-BK-4811')}
              actions={[
                { label: strings.ordersHub.review, onPress: noop },
                { label: strings.ordersHub.bookings.bookAgain, onPress: noop },
              ]}
            >
              <VemtapText variant="bodyMd">
                {strings.ordersHub.groomingService}
              </VemtapText>
              <View className="mt-1 flex-row items-center justify-between">
                <VemtapText variant="caption" tone="secondary">
                  {strings.ordersHub.groomingDate}
                </VemtapText>
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {strings.ordersHub.groomingTotal}
                </VemtapText>
              </View>
            </OrderHubCard>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate?.('support')}
          className="flex-row items-center gap-3 rounded-xl bg-surface-subtle p-4"
        >
          <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container">
            <Icon name="help" size={20} color={colors.textSecondary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-medium">
              {strings.ordersHub.missingTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {strings.ordersHub.missingBody}
            </VemtapText>
          </View>
          <Icon name="arrowForward" size={20} color={colors.textSecondary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
