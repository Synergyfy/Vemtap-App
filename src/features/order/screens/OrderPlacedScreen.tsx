import React, { useCallback, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { orderImages } from '@features/order/orderData';
import {
  MerchantActions,
  NumberedInstructions,
  PriceBreakdown,
  type MerchantAction,
  type NumberedInstruction,
} from '@features/order/components/OrderComponents';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'OrderPlaced'>;

export function OrderPlacedScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const order = route.params ?? {
    total: '₦21,160',
    fulfillment: 'pickup' as const,
    orderNumber: '#UG-92841',
  };
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>(
    order.fulfillment,
  );
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const { total } = order;

  const goHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  }, [navigation]);

  const goToOrders = useCallback(() => {
    navigation.navigate('Tabs', {
      screen: 'Account',
      params: { screen: 'OrdersBookings' },
    });
  }, [navigation]);

  const merchantActions = createMerchantActions(() => {
    navigation.navigate('MerchantChat', { dealId: 'urban-grill-lunch' });
  });

  const pickupInstructions: NumberedInstruction[] = [
    { title: strings.productOrder.arriveTitle, body: strings.productOrder.arriveBody },
    {
      title: strings.productOrder.identifyTitle,
      body: strings.productOrder.identifyBody,
    },
    {
      title: strings.productOrder.payCounterTitle(total),
      body: strings.productOrder.payCounterBody,
      emphasized: true,
    },
    { title: strings.productOrder.collectTitle, body: strings.productOrder.collectBody },
  ];

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <View className="flex-row items-center justify-between px-6 py-3">
          <View className="h-10 w-10" />
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="min-w-0 flex-1 text-center text-text"
          >
            {strings.productOrder.confirmationHeader}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.productOrder.closeHome}
            onPress={goHome}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high"
          >
            <Icon name="close" size={20} color={colors.text} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-screen gap-6 px-6">
          <View className="items-center gap-3 pt-1">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-tint">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-success-container shadow-md">
                <Icon name="checkCircle" size={36} color={colors.badgeDiscountText} />
              </View>
            </View>
            <View className="gap-1">
              <VemtapText
                accessibilityRole="header"
                variant="headingXl"
                className="text-center text-heading-xl text-text"
              >
                {strings.productOrder.confirmationTitle}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="text-center">
                {strings.productOrder.placedNow}
              </VemtapText>
            </View>
            <View className="flex-row flex-wrap items-center justify-center gap-1 rounded-full bg-surface-tint px-4 py-2 shadow-sm">
              <View className="h-2.5 w-2.5 rounded-full bg-primary" />
              <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                {strings.productOrder.merchantPreparing}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {strings.productOrder.preparationTime}
              </VemtapText>
            </View>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-1 rounded-field bg-surface-container p-1.5">
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: fulfillment === 'pickup' }}
                onPress={() => setFulfillment('pickup')}
                className={`min-h-[40px] min-w-0 flex-1 items-center justify-center rounded-lg px-1 ${fulfillment === 'pickup' ? 'bg-surface shadow-sm' : ''}`}
              >
                <VemtapText
                  variant="button"
                  className={
                    fulfillment === 'pickup'
                      ? 'text-center text-primary'
                      : 'text-center text-text-secondary'
                  }
                >
                  {strings.productOrder.pickup}{' '}
                  <VemtapText className="text-success">
                    {strings.productOrder.pickupActive}
                  </VemtapText>
                </VemtapText>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: fulfillment === 'delivery' }}
                onPress={() => setFulfillment('delivery')}
                className={`min-h-[40px] min-w-0 flex-1 items-center justify-center rounded-lg px-1 ${fulfillment === 'delivery' ? 'bg-surface shadow-sm' : ''}`}
              >
                <VemtapText variant="button" className="text-center text-text-secondary">
                  {strings.productOrder.ifDelivery}
                </VemtapText>
              </Pressable>
            </View>

            <View className="gap-4 rounded-field bg-surface p-4 shadow-sm">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-tint">
                  <Icon
                    name={fulfillment === 'pickup' ? 'restaurant' : 'nearMe'}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <VemtapText
                  variant="headingSm"
                  className="min-w-0 flex-1 text-heading-sm text-text"
                >
                  {fulfillment === 'pickup'
                    ? strings.productOrder.pickupGuide
                    : strings.productOrder.deliveryGuide}
                </VemtapText>
              </View>
              {fulfillment === 'pickup' ? (
                <NumberedInstructions items={pickupInstructions} />
              ) : (
                <View className="gap-3">
                  <DeliveryNotice
                    icon="phone"
                    text={strings.productOrder.deliveryCallBody}
                  />
                  <View className="flex-row items-start gap-2 rounded-lg bg-success-container p-3">
                    <Icon name="wallet" size={20} color={colors.badgeDiscountText} />
                    <View className="min-w-0 flex-1">
                      <VemtapText
                        variant="labelMd"
                        className="font-sans-semibold text-success"
                      >
                        {strings.productOrder.paymentDeliveryTitle}
                      </VemtapText>
                      <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                        {strings.productOrder.paymentDeliveryBody(total)}
                      </VemtapText>
                    </View>
                  </View>
                  <DeliveryNotice
                    icon="shield"
                    text={strings.productOrder.securityBody}
                  />
                </View>
              )}
            </View>
          </View>

          <View className="gap-4 rounded-field bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1">
                <VemtapText variant="headingSm" className="text-text">
                  {strings.productOrder.merchant}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.productOrder.kitchenDesk}
                </VemtapText>
              </View>
              <View className="shrink-0 rounded-full bg-success-container px-2 py-0.5">
                <VemtapText variant="caption" className="font-sans-semibold text-success">
                  {strings.productOrder.availableNow}
                </VemtapText>
              </View>
            </View>
            <MerchantActions actions={merchantActions} />
            <View className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-subtle p-3">
              <View className="min-w-0 flex-1 flex-row items-start gap-2">
                <Icon name="locationOn" size={18} color={colors.primary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={2}
                >
                  {strings.productOrder.address}
                </VemtapText>
              </View>
              <Button
                label={strings.productOrder.directions}
                variant="ghost"
                size="sm"
                fullWidth={false}
                className="min-h-10 shrink-0 px-2"
                onPress={() =>
                  Linking.openURL('https://maps.google.com').catch(() => undefined)
                }
              />
            </View>
          </View>

          <View className="h-28 overflow-hidden rounded-field shadow-sm">
            <Image
              source={{ uri: orderImages.map }}
              className="h-full w-full"
              resizeMode="cover"
            />
            <View style={styles.mapScrim} />
            <View className="absolute inset-x-3 bottom-3 flex-row items-center gap-1">
              <Icon name="nearMe" size={15} color={colors.surface} />
              <VemtapText variant="caption" className="text-inverse font-sans-semibold">
                {strings.productOrder.distanceTime}
              </VemtapText>
            </View>
          </View>

          <View className="overflow-hidden rounded-field bg-surface shadow-sm">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: detailsExpanded }}
              onPress={() => setDetailsExpanded(value => !value)}
              className="w-full flex-row items-center justify-between gap-3 p-4 active:bg-surface-subtle"
            >
              <View className="min-w-0 flex-1">
                <VemtapText variant="headingSm" className="text-text">
                  {strings.productOrder.orderDetails}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                  {strings.productOrder.detailsSummary(
                    order.fulfillment === 'delivery' ? 4 : 3,
                    total,
                  )}
                </VemtapText>
              </View>
              <View className="shrink-0 flex-row items-center gap-1">
                <View className="rounded bg-success-container px-2 py-0.5">
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold text-success"
                  >
                    {strings.productOrder.voucherAppliedShort(
                      strings.productOrder.voucherReference,
                    )}
                  </VemtapText>
                </View>
                <Icon
                  name="expandMore"
                  size={20}
                  color={colors.textSecondary}
                  style={detailsExpanded ? styles.expandedIcon : undefined}
                />
              </View>
            </Pressable>
            {detailsExpanded ? (
              <View className="gap-4 px-4 pb-4">
                <View className="gap-2">
                  {[
                    [
                      strings.productOrder.detailBurger,
                      strings.productOrder.detailBurgerPrice,
                    ],
                    [
                      strings.productOrder.detailJollof,
                      strings.productOrder.detailJollofPrice,
                    ],
                    [
                      strings.productOrder.detailZobo,
                      strings.productOrder.detailZoboPrice,
                    ],
                  ].map(([label, price]) => (
                    <View
                      key={label}
                      className="flex-row items-center justify-between gap-3"
                    >
                      <VemtapText variant="bodyMd" className="min-w-0 flex-1 text-text">
                        {label}
                      </VemtapText>
                      <VemtapText
                        variant="bodyMd"
                        className="shrink-0 font-sans-medium text-text"
                      >
                        {price}
                      </VemtapText>
                    </View>
                  ))}
                </View>
                <PriceBreakdown
                  rows={[
                    {
                      label: strings.productOrder.detailSubtotal,
                      value: strings.productOrder.detailsSubtotal,
                    },
                    {
                      label: strings.productOrder.loyaltyDiscount,
                      value: strings.productOrder.loyaltyDiscountValue,
                      tone: 'success',
                    },
                  ]}
                  totalLabel={strings.productOrder.cashierTotal}
                  total={total}
                />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        className="gap-3 bg-surface px-6 pt-4 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mx-auto w-full max-w-screen gap-2">
          <Button
            label={strings.productOrder.trackChat}
            leftIcon={<Icon name="message" size={20} color={colors.surface} />}
            onPress={() =>
              navigation.navigate('MerchantChat', { dealId: 'urban-grill-lunch' })
            }
          />
          <Button
            label={strings.accountScreens.moreHub.viewOrders}
            variant="secondary"
            onPress={goToOrders}
          />
          <Button
            label={strings.productOrder.backHome}
            variant="ghost"
            onPress={goHome}
          />
        </View>
      </View>
    </View>
  );
}

function DeliveryNotice({ icon, text }: { icon: 'phone' | 'shield'; text: string }) {
  return (
    <View className="flex-row items-start gap-2 rounded-lg bg-surface-subtle p-3">
      <Icon name={icon} size={20} color={colors.primary} />
      <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
        {text}
      </VemtapText>
    </View>
  );
}

function createMerchantActions(onChat: () => void): MerchantAction[] {
  return [
    {
      icon: 'phone',
      label: strings.productOrder.directCall,
      onPress: () => Linking.openURL('tel:+2348023456789').catch(() => undefined),
    },
    { icon: 'message', label: strings.productOrder.inAppChat, onPress: onChat },
    {
      icon: 'whatsapp',
      label: strings.productOrder.whatsapp,
      success: true,
      onPress: () =>
        Linking.openURL('https://wa.me/2348023456789').catch(() => undefined),
    },
  ];
}

const styles = {
  mapScrim: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  expandedIcon: {
    transform: [{ rotate: '180deg' }],
  },
};
