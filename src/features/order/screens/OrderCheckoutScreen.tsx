import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { EmptyState } from '@components/shared/EmptyState';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { formatCurrency } from '@utils/formatters';
import type { AppStackParamList } from '@navigation/types';
import { ApiError } from '@api/ApiError';
import { useAuthStore } from '@store/authStore';
import {
  OrderLineItem,
  OrderNotesField,
  OrderPaymentCallout,
  PriceBreakdown,
} from '@features/order/components/OrderComponents';
import { usePlaceOrder } from '@features/order/hooks/useCustomerOrders';

cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'OrderCheckout'>;

const copy = strings.orderCheckout;

/**
 * Pickup checkout for one product at one branch (`POST /catalogue/orders`).
 *
 * The figures here are what the product page showed; the server prices the
 * order itself (branch price less the item's discount) and the confirmation
 * screen shows the server's total, so the two can never silently disagree.
 */
export function OrderCheckoutScreen({ route, navigation }: Props) {
  const draft = route.params?.draft;
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);
  const placeOrder = usePlaceOrder();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState(draft?.instructions ?? '');
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      (draft?.items ?? []).reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [draft],
  );
  const itemCount = (draft?.items ?? []).reduce((sum, line) => sum + line.quantity, 0);

  if (!draft || draft.items.length === 0) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-surface">
        <RegistrationHeader title={copy.headerTitle} onBack={navigation.goBack} />
        <EmptyState
          icon="shoppingBag"
          title={copy.empty.title}
          description={copy.empty.body}
          actionLabel={copy.empty.action}
          onAction={navigation.goBack}
          className="mt-16"
        />
      </SafeAreaView>
    );
  }

  const merchant = [draft.businessName, draft.branchName].filter(Boolean).join(' • ');

  const submit = () => {
    if (placeOrder.isPending) return;
    const contact = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    };
    if (!contact.firstName || !contact.phone) {
      setError(copy.missingContact);
      return;
    }
    setError(null);
    placeOrder.mutate(
      {
        branchId: draft.branchId,
        ...contact,
        // The API requires a last name; a single-name account sends its first.
        lastName: contact.lastName || contact.firstName,
        ...(user?.email ? { email: user.email } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(tableNumber.trim() ? { tableNumber: tableNumber.trim() } : {}),
        items: draft.items.map(line => ({
          itemId: line.itemId,
          quantity: line.quantity,
        })),
      },
      {
        onSuccess: order => {
          navigation.replace('OrderPlaced', {
            orderId: order.id,
            orderNumber: `#${order.id.slice(0, 8).toUpperCase()}`,
            total: Number(order.totalAmount ?? subtotal) || 0,
            itemCount,
            businessName: draft.businessName,
            branchName: draft.branchName,
          });
        },
        onError: failure =>
          setError(
            failure instanceof ApiError && failure.message
              ? failure.message
              : copy.failed,
          ),
      },
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <RegistrationHeader title={copy.headerTitle} onBack={navigation.goBack} />
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-48"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mx-auto w-full max-w-screen gap-4 px-6 pt-2">
          <View className="flex-row items-start gap-3 rounded-field bg-surface-tint p-4">
            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed">
              <Icon name="storefront" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {copy.pickupTitle}
              </VemtapText>
              {merchant ? (
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {merchant}
                </VemtapText>
              ) : null}
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {copy.pickupBody}
              </VemtapText>
            </View>
          </View>

          <View className="gap-3 rounded-field bg-surface p-4 shadow-sm">
            <VemtapText variant="headingSm" className="text-text">
              {copy.itemsTitle(itemCount)}
            </VemtapText>
            {draft.items.map(line => (
              <OrderLineItem
                key={line.itemId}
                image={line.image ? { uri: line.image } : undefined}
                title={line.name}
                description={formatCurrency(line.unitPrice)}
                price={formatCurrency(line.unitPrice * line.quantity)}
                quantity={line.quantity}
              />
            ))}
          </View>

          <View className="gap-3 rounded-field bg-surface p-4 shadow-sm">
            <View className="gap-0.5">
              <VemtapText variant="headingSm" className="text-text">
                {copy.contactTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.contactHint}
              </VemtapText>
            </View>
            <View className="flex-row gap-2">
              <Input
                label={copy.firstName}
                accessibilityLabel={copy.firstName}
                value={firstName}
                onChangeText={setFirstName}
                containerClassName="min-w-0 flex-1"
                autoComplete="given-name"
              />
              <Input
                label={copy.lastName}
                accessibilityLabel={copy.lastName}
                value={lastName}
                onChangeText={setLastName}
                containerClassName="min-w-0 flex-1"
                autoComplete="family-name"
              />
            </View>
            <Input
              label={copy.phone}
              accessibilityLabel={copy.phone}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Input
              label={copy.tableNumber}
              accessibilityLabel={copy.tableNumber}
              placeholder={copy.tablePlaceholder}
              value={tableNumber}
              onChangeText={setTableNumber}
              maxLength={20}
            />
            <View className="gap-1.5">
              <VemtapText variant="labelSm" tone="secondary">
                {copy.notesLabel}
              </VemtapText>
              <OrderNotesField value={notes} onChangeText={setNotes} />
            </View>
          </View>

          <PriceBreakdown
            rows={[
              { label: copy.subtotal(itemCount), value: formatCurrency(subtotal) },
              { label: copy.serviceFee, value: copy.noFee, tone: 'success' },
            ]}
            totalLabel={copy.totalLabel}
            totalCaption={copy.totalCaption}
            total={formatCurrency(subtotal)}
          />

          <OrderPaymentCallout total={formatCurrency(subtotal)} />
        </View>
      </ScrollView>

      <View
        className="bg-surface px-6 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mx-auto w-full max-w-screen gap-2">
          {error ? (
            <VemtapText variant="caption" className="text-error">
              {error}
            </VemtapText>
          ) : null}
          <Button
            label={placeOrder.isPending ? copy.placing : copy.placeOrder}
            loading={placeOrder.isPending}
            disabled={placeOrder.isPending}
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={submit}
          />
        </View>
      </View>
    </View>
  );
}
