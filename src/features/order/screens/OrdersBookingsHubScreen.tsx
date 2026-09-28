import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { OrderHubCard } from '@features/order/components/OrderHubComponents';
import { orderImages } from '@features/order/orderData';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';

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
              {strings.ordersHub.orders}
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
                {item}
              </VemtapText>
            </Pressable>
          ))}
        </ScrollView>

        {mode === 'orders' ? (
          <View className="gap-4">
            <OrderHubCard
              image={{ uri: orderImages.steak }}
              merchant={strings.urbanProfile.name}
              meta={strings.ordersHub.activeOrderNumber}
              status={strings.ordersHub.preparing}
              statusTone="warning"
              accent
              onPress={() => onOpenOrder?.('VT-ORD-88219')}
              actions={[
                {
                  label: strings.ordersHub.contactKitchen,
                  onPress: onContactKitchen ?? noop,
                },
                {
                  label: strings.ordersHub.trackOrder,
                  onPress: onTrackOrder ?? noop,
                  primary: true,
                },
              ]}
            >
              <View className="gap-2 rounded-xl bg-surface-subtle p-3">
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText variant="labelSm" className="font-sans-medium">
                    <Icon name="restaurant" size={16} color={colors.tertiary} />{' '}
                    {strings.ordersHub.cooking}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    tone="brand"
                    className="font-sans-semibold"
                  >
                    {strings.ordersHub.readyAt}
                  </VemtapText>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-surface-container">
                  <View className="h-full w-2/3 rounded-full bg-primary" />
                </View>
                <VemtapText variant="caption" tone="secondary">
                  {strings.ordersHub.pickupEstimate}
                </VemtapText>
              </View>
              <View className="gap-1 py-1">
                {strings.ordersHub.activeOrderItems.map(([name, price]) => (
                  <View key={name} className="flex-row justify-between gap-3">
                    <VemtapText
                      variant="bodyMd"
                      className="min-w-0 flex-1 font-sans-medium"
                      numberOfLines={1}
                    >
                      {name}
                    </VemtapText>
                    <VemtapText variant="bodyMd" className="shrink-0">
                      {price}
                    </VemtapText>
                  </View>
                ))}
              </View>
              <View className="mt-2 flex-row items-center justify-between gap-2 rounded-xl bg-surface-subtle p-2.5">
                <View className="min-w-0 flex-row items-center gap-2">
                  <VemtapText
                    variant="caption"
                    tone="success"
                    className="rounded bg-success-container px-2 py-0.5 font-sans-semibold"
                  >
                    {strings.ordersHub.dealApplied}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {strings.ordersHub.discount}
                  </VemtapText>
                </View>
                <View className="items-end">
                  <VemtapText variant="caption" tone="secondary">
                    {strings.ordersHub.paidCard}
                  </VemtapText>
                  <VemtapText variant="labelMd" className="font-sans-bold">
                    {strings.ordersHub.activeOrderTotal}
                  </VemtapText>
                </View>
              </View>
            </OrderHubCard>
            <OrderHubCard
              image={{ uri: orderImages.burger }}
              merchant={strings.ordersHub.bakeryName}
              meta={strings.ordersHub.bakeryMeta}
              status={strings.ordersHub.pickedUp}
              onPress={() => onOpenOrder?.('VT-ORD-84102')}
              actions={[
                { label: strings.ordersHub.receipt, onPress: noop },
                { label: strings.ordersHub.review, onPress: noop },
                { label: strings.ordersHub.reorder, onPress: noop },
              ]}
            >
              <VemtapText variant="bodyMd">{strings.ordersHub.bakeryItems}</VemtapText>
              <View className="mt-1 flex-row items-center justify-between">
                <VemtapText variant="caption" tone="secondary">
                  {strings.ordersHub.bakeryDate}
                </VemtapText>
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {strings.ordersHub.bakeryTotal}
                </VemtapText>
              </View>
            </OrderHubCard>
            <OrderHubCard
              image={{ uri: orderImages.merchant }}
              merchant={strings.ordersHub.boutiqueName}
              meta={strings.ordersHub.boutiqueMeta}
              status={strings.ordersHub.delivered}
              statusTone="brand"
              onPress={() => onOpenOrder?.('VT-ORD-79940')}
              actions={[
                { label: strings.ordersHub.needHelp, onPress: noop },
                { label: strings.ordersHub.viewReceipt, onPress: noop },
              ]}
            >
              <VemtapText variant="bodyMd">{strings.ordersHub.boutiqueItem}</VemtapText>
              <View className="mt-1 flex-row items-center justify-between">
                <VemtapText variant="caption" tone="secondary">
                  {strings.ordersHub.boutiqueDate}
                </VemtapText>
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {strings.ordersHub.boutiqueTotal}
                </VemtapText>
              </View>
            </OrderHubCard>
          </View>
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
