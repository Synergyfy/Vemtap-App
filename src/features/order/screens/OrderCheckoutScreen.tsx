import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Share, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { AppModal } from '@components/ui/Modal';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { orderImages } from '@features/order/orderData';
import {
  ContactField,
  OrderLineItem,
  OrderNotesField,
  OrderPaymentCallout,
  PriceBreakdown,
} from '@features/order/components/OrderComponents';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'OrderCheckout'>;
type Fulfillment = 'pickup' | 'delivery';

const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-US')}`;

export function OrderCheckoutScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const draft = route.params?.draft;
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const [notes, setNotes] = useState(draft?.instructions ?? '');
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const quantity = draft?.quantity ?? 1;
  const unitPrice = draft?.unitPrice ?? 15200;
  const steakTotal = unitPrice * quantity;
  const subtotal = steakTotal + 6500 + 2500;
  const discount = draft ? Math.round(subtotal * 0.2) : 3040;
  const deliveryFee = fulfillment === 'delivery' ? 1000 : 0;
  const total = subtotal - discount + deliveryFee;
  const itemCount = quantity + 2;

  const steakDescription = draft
    ? `${draft.temperature} • ${draft.side}${draft.addons.length ? ` • ${strings.productOrder.extraSelection(draft.addons.length)}` : ''}`
    : 'Medium Rare • Truffle Parmesan • Peppercorn Sauce';

  const shareOrder = useCallback(() => {
    Share.share({ message: 'https://vemtap.com/orders/checkout/urban-grill' }).catch(
      () => undefined,
    );
  }, []);

  const placeOrder = useCallback(() => {
    setConfirmationVisible(true);
  }, []);

  const viewOrder = useCallback(() => {
    setConfirmationVisible(false);
    navigation.navigate('OrderPlaced', {
      total: formatNaira(total),
      fulfillment,
      orderNumber: '#UG-92841',
    });
  }, [fulfillment, navigation, total]);

  const priceRows = useMemo(
    () => [
      { label: strings.productOrder.subtotal(itemCount), value: formatNaira(subtotal) },
      {
        label: strings.productOrder.vemtapSavings,
        value: `-${formatNaira(discount)}`,
        tone: 'success' as const,
      },
      {
        label: strings.productOrder.serviceFee,
        value: strings.productOrder.noMarkup,
        tone: 'success' as const,
      },
      ...(fulfillment === 'delivery'
        ? [{ label: strings.productOrder.deliveryFee, value: formatNaira(deliveryFee) }]
        : []),
    ],
    [discount, deliveryFee, fulfillment, itemCount, subtotal],
  );

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <RegistrationHeader
          title={strings.productOrder.checkoutHeader}
          onBack={navigation.goBack}
          showShareAction
          onShare={shareOrder}
        />
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-48"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-screen px-6">
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-fixed">
                <VemtapText
                  variant="labelSm"
                  className="text-on-primary-fixed font-sans-semibold"
                >
                  {strings.productOrder.stepNumber}
                </VemtapText>
              </View>
              <VemtapText variant="labelMd" tone="secondary">
                {strings.productOrder.step}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="h-1.5 w-1.5 rounded-full bg-border" />
              <View className="h-1.5 w-1.5 rounded-full bg-border" />
              <View className="h-1.5 w-6 rounded-full bg-primary" />
            </View>
          </View>

          <View className="mb-4 flex-row items-center gap-3 rounded-field bg-surface p-3 shadow-sm">
            <Image
              source={{ uri: orderImages.merchant }}
              className="h-12 w-12 rounded-lg bg-surface-container"
              resizeMode="cover"
            />
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1">
                <VemtapText
                  variant="headingSm"
                  className="min-w-0 flex-1 text-text"
                  numberOfLines={1}
                >
                  {strings.productOrder.merchant}
                </VemtapText>
                <Icon name="verified" size={18} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {strings.productOrder.checkoutAddress}
              </VemtapText>
            </View>
          </View>

          <View className="mb-4 flex-row gap-1 rounded-field bg-surface-container-low p-1.5">
            {(
              [
                {
                  id: 'pickup',
                  icon: 'restaurant',
                  title: strings.productOrder.pickup,
                  caption: strings.productOrder.payAtCashier,
                },
                {
                  id: 'delivery',
                  icon: 'nearMe',
                  title: strings.productOrder.delivery,
                  caption: strings.productOrder.payToDispatch,
                },
              ] as const
            ).map(option => {
              const selected = fulfillment === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setFulfillment(option.id)}
                  className={`min-w-0 flex-1 items-center rounded-lg px-1 py-2.5 ${selected ? 'bg-surface shadow-sm' : 'bg-transparent'}`}
                >
                  <View className="flex-row items-center gap-1">
                    <Icon
                      name={option.icon}
                      size={18}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <VemtapText
                      variant="button"
                      className={`text-center ${selected ? 'font-sans-semibold text-primary' : 'font-sans-medium text-text-secondary'}`}
                    >
                      {option.title}
                    </VemtapText>
                  </View>
                  <VemtapText
                    variant="caption"
                    tone="secondary"
                    className="mt-0.5 text-center"
                  >
                    {option.caption}
                  </VemtapText>
                </Pressable>
              );
            })}
          </View>

          <View className="mb-4 gap-4 rounded-field bg-surface p-4 shadow-sm">
            <View className="flex-row items-start gap-3 rounded-lg bg-surface-tint p-3">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed">
                <Icon
                  name={fulfillment === 'pickup' ? 'storefront' : 'nearMe'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {fulfillment === 'pickup'
                    ? strings.productOrder.readyPickup
                    : strings.productOrder.readyDelivery}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                  {fulfillment === 'pickup'
                    ? strings.productOrder.pickupLocation
                    : strings.productOrder.deliveryLocation}
                </VemtapText>
              </View>
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <VemtapText variant="labelSm" tone="secondary">
                  {strings.productOrder.contactNumber}
                </VemtapText>
                <View className="flex-row items-center gap-1">
                  <Icon name="lock" size={14} color={colors.primary} />
                  <VemtapText variant="labelSm" tone="brand">
                    {strings.productOrder.verified}
                  </VemtapText>
                </View>
              </View>
              <ContactField />
            </View>
            <View className="gap-1.5">
              <VemtapText variant="labelSm" tone="secondary">
                {strings.productOrder.notesLabel}
              </VemtapText>
              <OrderNotesField value={notes} onChangeText={setNotes} />
            </View>
          </View>

          <View className="mb-4 gap-4 rounded-field bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="headingSm" className="text-text">
                {strings.productOrder.orderedItems(itemCount)}
              </VemtapText>
              <VemtapText variant="labelSm" tone="secondary">
                {strings.productOrder.directMenu}
              </VemtapText>
            </View>
            <OrderLineItem
              image={{ uri: orderImages.steak }}
              title={strings.productOrder.steak}
              description={steakDescription}
              price={formatNaira(steakTotal)}
              quantity={quantity}
              badge={strings.productOrder.eligibleVoucher}
            />
            <View className="h-px bg-surface-container" />
            <OrderLineItem
              image={{ uri: orderImages.burger }}
              title={strings.productOrder.burger}
              description={strings.productOrder.burgerDetails}
              price={strings.productOrder.burgerPrice}
              quantity={1}
              badge={strings.productOrder.vemtapSpecial}
            />
            <View className="h-px bg-surface-container" />
            <OrderLineItem
              image={{ uri: orderImages.drink }}
              title={strings.productOrder.zobo}
              description={strings.productOrder.zoboDetails}
              price={strings.productOrder.zoboPrice}
              quantity={1}
            />
          </View>

          <View className="mb-4 flex-row items-center justify-between gap-3 rounded-field bg-success-container p-4 shadow-sm">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-container">
                <Icon name="voucher" size={18} color={colors.badgeDiscountText} />
              </View>
              <View className="min-w-0">
                <VemtapText variant="labelMd" className="font-sans-semibold text-success">
                  {strings.productOrder.voucherApplied}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.productOrder.voucherCode}{' '}
                  {strings.productOrder.voucherReference} •{' '}
                  {strings.productOrder.lifetimeTap}
                </VemtapText>
              </View>
            </View>
            <View className="shrink-0 rounded-full bg-surface px-2 py-1 shadow-sm">
              <VemtapText variant="labelSm" className="font-sans-semibold text-success">
                -{formatNaira(discount)}
              </VemtapText>
            </View>
          </View>

          <View className="mb-6">
            <PriceBreakdown
              rows={priceRows}
              totalLabel={strings.productOrder.totalMerchant}
              totalCaption={strings.productOrder.settlementCaption}
              total={formatNaira(total)}
            />
          </View>

          <View className="mb-6">
            <OrderPaymentCallout total={formatNaira(total)} />
          </View>
        </View>
      </ScrollView>

      <View
        className="bg-surface px-6 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mx-auto w-full max-w-screen">
          <View className="mb-2 flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="caption"
                tone="secondary"
                className="font-sans-semibold uppercase"
              >
                {strings.productOrder.totalToPay}
              </VemtapText>
              <VemtapText variant="headingMd" className="font-sans-bold text-text">
                {formatNaira(total)}
              </VemtapText>
            </View>
            <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-surface-tint px-2.5 py-1">
              <Icon name="localOffer" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" className="text-primary">
                {strings.productOrder.saved(formatNaira(discount))}
              </VemtapText>
            </View>
          </View>
          <Button
            label={strings.productOrder.placeOrder}
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={placeOrder}
          />
          <VemtapText variant="caption" tone="tertiary" className="mt-2 text-center">
            {strings.productOrder.placeOrderTerms}
          </VemtapText>
        </View>
      </View>

      <AppModal
        visible={confirmationVisible}
        onClose={() => setConfirmationVisible(false)}
        className="max-w-sm items-center p-6"
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-success-container">
          <Icon name="checkCircle" size={36} color={colors.badgeDiscountText} />
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingXl"
          className="mt-4 text-center text-heading-xl text-text"
        >
          {strings.productOrder.modalTitle}
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="mt-2 text-center leading-relaxed"
        >
          {strings.productOrder.modalBody}
        </VemtapText>
        <View className="my-4 w-full gap-1 rounded-lg bg-surface-subtle p-3">
          {[
            [strings.productOrder.ticketRef, strings.productOrder.ticketReference],
            [strings.productOrder.expectedBy, strings.productOrder.expectedTime],
            [strings.productOrder.settlement, formatNaira(total)],
          ].map(([label, value]) => (
            <View key={label} className="flex-row items-center justify-between gap-3">
              <VemtapText variant="caption" tone="secondary">
                {label}
              </VemtapText>
              <VemtapText variant="caption" className="font-sans-semibold text-text">
                {value}
              </VemtapText>
            </View>
          ))}
        </View>
        <Button label={strings.productOrder.viewOrder} onPress={viewOrder} />
      </AppModal>
    </View>
  );
}
