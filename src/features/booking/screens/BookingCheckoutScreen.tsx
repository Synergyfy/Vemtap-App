import React, { useCallback, useState } from 'react';
import { Image, ScrollView, Share, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { OrderLineItem } from '@features/order/components/OrderComponents';
import {
  bookingAddons,
  bookingImages,
  formatBookingNaira,
} from '@features/booking/bookingData';
import {
  BookingBreakdown,
  BookingHeader,
  BookingProgress,
  ClientInformation,
} from '@features/booking/components/BookingComponents';

cssInterop(Image, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'BookingCheckout'>;

const defaultDraft = {
  addons: ['led-light-therapy'] as string[],
  therapistId: 'any',
  date: '2024-10-17',
  time: '1:15',
  notes: '',
};

export function BookingCheckoutScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const draft = route.params?.draft ?? defaultDraft;
  const [reminders, setReminders] = useState(true);
  const selectedAddons = bookingAddons.filter(addon => draft.addons.includes(addon.id));
  const subtotal = 25000 + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const discount = Math.min(5000, subtotal);
  const total = subtotal - discount;
  const treatmentCount = 2 + selectedAddons.length;

  const help = useCallback(() => {
    Share.share({ message: 'VEMTAP booking support: https://vemtap.com/help' }).catch(
      () => undefined,
    );
  }, []);

  const confirm = useCallback(() => {
    navigation.replace('BookingConfirmed', { draft });
  }, [draft, navigation]);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <BookingHeader
          title={strings.booking.checkoutHeader}
          onBack={navigation.goBack}
          action="help"
          onAction={help}
        />
      </SafeAreaView>
      <BookingProgress step={2} />

      <View className="gap-4 bg-surface px-4 py-4">
        <View className="flex-row items-center justify-center gap-2">
          <View className="h-1.5 w-6 rounded-full bg-primary-container" />
          <View className="h-1.5 w-6 rounded-full bg-primary-container" />
        </View>
        <VemtapText variant="caption" tone="secondary" className="text-center">
          {strings.booking.checkoutStep}
        </VemtapText>
      </View>

      <View className="min-h-0 flex-1">
        <ScrollView
          className="h-full bg-surface"
          contentContainerClassName="gap-4 px-4 pb-48"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center gap-3 rounded-card border border-border bg-surface-muted p-3.5">
            <Image
              source={{ uri: bookingImages.reception }}
              className="h-16 w-16 shrink-0 rounded-field border border-border bg-surface-container"
              resizeMode="cover"
            />
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1">
                <VemtapText
                  variant="labelMd"
                  className="min-w-0 flex-1 font-sans-semibold text-text"
                  numberOfLines={1}
                >
                  {strings.booking.merchant}
                </VemtapText>
                <Icon name="verified" size={18} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                {strings.booking.checkoutAddress}
              </VemtapText>
            </View>
          </View>

          <View className="gap-3 rounded-card border border-border bg-surface p-4 shadow-sm">
            <View className="flex-row items-center gap-2 border-b border-border pb-2">
              <Icon name="eventAvailable" size={20} color={colors.primary} />
              <VemtapText variant="headingSm" className="text-text">
                {strings.booking.appointmentSchedule}
              </VemtapText>
            </View>
            <DetailRow
              icon="schedule"
              label={strings.booking.dateTime}
              value={strings.booking.appointmentDateTime}
              caption={strings.booking.appointmentDuration}
            />
            <DetailRow
              icon="person"
              label={strings.booking.specialistAssigned}
              value={`Amara K. (${strings.booking.amaraRole})`}
            />
            <DetailRow
              icon="storefront"
              label={strings.booking.bookingType}
              value={strings.booking.bookingTypeValue}
              success
            />
          </View>

          <ClientInformation reminders={reminders} onRemindersChange={setReminders} />

          <View className="gap-3 rounded-card border border-border bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between gap-3 border-b border-border pb-2">
              <View className="flex-row items-center gap-2">
                <Icon name="spa" size={20} color={colors.primary} />
                <VemtapText variant="headingSm" className="text-text">
                  {strings.booking.selectedServicesCheckout}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary">
                {treatmentCount} Treatments
              </VemtapText>
            </View>
            <OrderLineItem
              image={{ uri: bookingImages.hero }}
              title={strings.booking.facialLine}
              description="60 mins"
              price={formatBookingNaira(16000)}
              quantity={1}
              badge={strings.booking.voucherEligible}
            />
            <View className="h-px bg-surface-container" />
            <OrderLineItem
              image={{ uri: bookingImages.interior }}
              title={strings.booking.manicureLine}
              description="45 mins"
              price={formatBookingNaira(9000)}
              quantity={1}
            />
            {selectedAddons.map(addon => (
              <View
                key={addon.id}
                className="-mx-4 flex-row items-start justify-between gap-3 border-t border-dashed border-border bg-surface-muted px-4 py-2"
              >
                <View className="min-w-0 flex-1">
                  <VemtapText variant="caption" className="font-sans-semibold text-text">
                    +{' '}
                    {addon.id === 'led-light-therapy'
                      ? strings.booking.ledBooster
                      : addon.name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {addon.id === 'led-light-therapy'
                      ? strings.booking.ledBoosterMeta
                      : addon.description}
                  </VemtapText>
                </View>
                <VemtapText
                  variant="labelMd"
                  className="shrink-0 font-sans-medium text-text"
                >
                  {formatBookingNaira(addon.price)}
                </VemtapText>
              </View>
            ))}
          </View>

          <View className="flex-row items-center justify-between gap-3 rounded-card border border-success-container bg-success-container p-3.5 shadow-sm">
            <View className="min-w-0 flex-row items-center gap-3">
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm">
                <Icon name="loyalty" size={20} color={colors.badgeDiscountText} />
              </View>
              <View className="min-w-0">
                <VemtapText variant="labelMd" className="font-sans-semibold text-success">
                  {strings.booking.dealApplied}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  {strings.booking.voucherCode} • {strings.booking.lifetimeTap}
                </VemtapText>
              </View>
            </View>
            <VemtapText variant="headingSm" className="shrink-0 text-success">
              -{formatBookingNaira(discount)}
            </VemtapText>
          </View>

          <View className="gap-3 rounded-card border border-border-active bg-surface-tint p-4">
            <View className="flex-row items-start gap-2.5">
              <Icon name="shield" size={22} color={colors.primary} />
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.booking.payDirectlyTitle}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-1 leading-relaxed"
                >
                  {strings.booking.payDirectlyBody(formatBookingNaira(total))}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {[
                strings.booking.posReady,
                strings.booking.cashAccepted,
                strings.booking.bankTransfer,
              ].map(label => (
                <View
                  key={label}
                  className="rounded-full border border-border bg-surface px-2.5 py-1"
                >
                  <VemtapText className="text-micro" tone="secondary">
                    {label}
                  </VemtapText>
                </View>
              ))}
            </View>
          </View>

          <BookingBreakdown subtotal={subtotal} discount={discount} total={total} />
          <View className="flex-row items-start gap-2.5 rounded-field border border-border bg-surface-muted p-3">
            <Icon name="info" size={18} color={colors.textSecondary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              <VemtapText className="font-sans-semibold text-text">
                {strings.booking.clientInformation}:{' '}
              </VemtapText>
              {strings.booking.cancellationCheckout}
            </VemtapText>
          </View>
        </ScrollView>
      </View>

      <View
        className="bg-surface px-4 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mb-2 flex-row items-center justify-between gap-3">
          <View>
            <VemtapText variant="caption" tone="secondary">
              {strings.booking.payAtReception}
            </VemtapText>
            <VemtapText variant="headingSm" className="text-primary-container">
              {formatBookingNaira(total)}
            </VemtapText>
          </View>
          <View className="rounded-full border border-success-container bg-success-container px-2 py-0.5">
            <VemtapText variant="caption" className="font-sans-medium text-success">
              {strings.booking.youSave(formatBookingNaira(discount))}
            </VemtapText>
          </View>
        </View>
        <Button
          label={strings.booking.confirmBooking}
          rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
          onPress={confirm}
        />
        <VemtapText tone="tertiary" className="mt-2 text-center text-micro">
          {strings.booking.bookingTerms}
        </VemtapText>
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  caption,
  success = false,
}: {
  icon: 'schedule' | 'person' | 'storefront';
  label: string;
  value: string;
  caption?: string;
  success?: boolean;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View
        className={`mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-field ${success ? 'bg-success-container' : 'bg-surface-tint'}`}
      >
        <Icon
          name={icon}
          size={18}
          color={success ? colors.badgeDiscountText : colors.primary}
        />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="caption" tone="secondary">
          {label}
        </VemtapText>
        <VemtapText
          variant="labelMd"
          className={success ? 'text-text' : 'font-sans-semibold text-text'}
        >
          {value}
        </VemtapText>
        {caption ? (
          <VemtapText variant="caption" tone="secondary">
            {caption}
          </VemtapText>
        ) : null}
      </View>
    </View>
  );
}
