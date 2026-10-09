import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Avatar } from '@components/ui/Avatar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { useCurrentUserDisplay } from '@hooks/useCurrentUserDisplay';
import { OrderHubCard } from '@features/order/components/OrderHubComponents';
import { useCustomerOrders } from '@features/order/hooks/useCustomerOrders';
import { useMyBookings } from '@features/booking/hooks/useBookings';
import type { Booking } from '@api/bookingsApi';
import { isActiveStatus, statusLabel, statusToneFor } from '@features/order/orderStatus';
import { orderImages } from '@features/order/orderData';
import { formatCurrency, formatWhen } from '@utils/formatters';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

/**
 * Booking statuses behind each Bookings filter chip, in chip order. The API's
 * `booked`/`confirmed` are both still upcoming; `completed` and `cancelled` are
 * terminal and cannot be rescheduled (cancel + rebook instead).
 */
const BOOKING_STATUS_GROUPS: readonly (readonly string[])[] = [
  ['booked', 'confirmed'],
  ['completed'],
  ['cancelled'],
];

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

/** Chip label for a booking status; unknown values fall back to the raw status. */
function bookingStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'booked':
    case 'confirmed':
      return strings.ordersHub.bookings.upcoming;
    case 'completed':
      return strings.ordersHub.bookings.completed;
    case 'cancelled':
      return strings.ordersHub.bookings.cancelled;
    default:
      return status ?? strings.common.empty;
  }
}

export interface OrdersBookingsHubScreenProps {
  onBack?: () => void;
  onSearch?: () => void;
  /** Optional portrait; absent, the navbar falls back to customer initials. */
  avatarUri?: string | null;
  onOpenOrder?: (orderId: string) => void;
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
  avatarUri,
}: OrdersBookingsHubScreenProps) {
  const insets = useSafeAreaInsets();
  const display = useCurrentUserDisplay();
  const [mode, setMode] = useState<'orders' | 'bookings'>('orders');
  const [filter, setFilter] = useState(0);
  const noop = () => undefined;
  const filters =
    mode === 'orders' ? strings.ordersHub.orderFilters : strings.ordersHub.bookingFilters;

  const bookings = useMyBookings();
  const bookingList = bookings.data ?? [];
  const bookingFilterCounts = BOOKING_STATUS_GROUPS.map(
    group => bookingList.filter(booking => group.includes(booking.status ?? '')).length,
  );
  const visibleBookings = bookingList.filter(booking =>
    BOOKING_STATUS_GROUPS[filter]?.includes(booking.status ?? ''),
  );
  const showBookingCounts = bookings.data !== undefined;

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
  const withBookingCount = (label: string, count: number) =>
    showBookingCounts ? `${label} (${count})` : label;

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
          <Avatar uri={avatarUri} name={display.fullName} size="sm" tone="brand" />
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
                {mode === 'orders'
                  ? withCount(item, filterCounts[index] ?? 0)
                  : withBookingCount(item, bookingFilterCounts[index] ?? 0)}
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
        ) : bookings.isLoading ? (
          <LoadingState label={strings.common.loading} />
        ) : bookings.isError ? (
          <ErrorState title={strings.common.error} onRetry={bookings.refetch} />
        ) : visibleBookings.length === 0 ? (
          <EmptyState
            variant="contained"
            icon="spa"
            title={
              filter === 0 ? strings.ordersHub.emptyBookingsTitle : strings.common.empty
            }
            description={filter === 0 ? strings.ordersHub.emptyBookingsBody : undefined}
          />
        ) : (
          <View className="gap-4">
            {visibleBookings.map((booking: Booking) => (
              <OrderHubCard
                key={booking.id}
                image={{ uri: orderImages.merchant }}
                actions={
                  booking.status === 'cancelled' || booking.status === 'completed'
                    ? [
                        {
                          label: strings.ordersHub.bookings.bookAgain,
                          onPress: noop,
                        },
                      ]
                    : [
                        { label: strings.ordersHub.bookings.addCalendar, onPress: noop },
                        {
                          label: strings.ordersHub.bookings.directions,
                          onPress: noop,
                          primary: true,
                        },
                      ]
                }
                merchant={
                  booking.businessName ?? strings.ordersHub.bookings.merchantFallback
                }
                meta={
                  booking.branchName
                    ? `${booking.branchName} • ${booking.date} ${booking.time}`
                    : `${booking.date} ${booking.time}`
                }
                status={bookingStatusLabel(booking.status)}
                statusTone={
                  booking.status === 'completed'
                    ? 'neutral'
                    : booking.status === 'cancelled'
                      ? 'warning'
                      : 'brand'
                }
                onPress={() => onOpenBooking?.(booking.reference ?? booking.id)}
              >
                <View className="gap-1 py-1">
                  <VemtapText variant="bodyMd" className="font-sans-semibold">
                    {booking.itemName ?? strings.ordersHub.bookings.merchantFallback}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {`${strings.ordersHub.bookings.duration}: ${booking.durationMinutes ?? 30} min`}
                  </VemtapText>
                  {booking.reference ? (
                    <VemtapText variant="caption" tone="tertiary">
                      {`${strings.ordersHub.bookingRef}: ${booking.reference}`}
                    </VemtapText>
                  ) : null}
                  {booking.status === 'cancelled' && booking.cancellationReason ? (
                    <VemtapText variant="caption" tone="tertiary" numberOfLines={2}>
                      {booking.cancellationReason}
                    </VemtapText>
                  ) : null}
                </View>
              </OrderHubCard>
            ))}
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
