import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { useBooking } from '@features/booking/hooks/useBookings';
import { formatSlotDate, formatSlotClock } from '@utils/formatters';
import {
  ArrivalGuide,
  BookingSuccessState,
} from '@features/booking/components/BookingComponents';

cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'BookingConfirmed'>;

/**
 * The reservation the checkout just created, read back from
 * `GET /bookings/:id`.
 *
 * The previous version rendered a fixed reference (`#GS-44218`), an assigned
 * specialist, a voucher code, a ₦5,000 discount and a street address — none of
 * which the booking record carries. What is shown now is the server's own
 * reference, slot and merchant; the specialist, payment and address rows are
 * absent rather than filled in, because `GET /bookings/:id` returns no such
 * fields.
 */
export function BookingConfirmedScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [guideExpanded, setGuideExpanded] = useState(true);
  const { bookingId, draft } = route.params ?? {};
  const booking = useBooking(bookingId);

  const goHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  }, [navigation]);

  const goToBookings = useCallback(() => {
    navigation.navigate('Tabs', {
      screen: 'Account',
      params: { screen: 'OrdersBookings' },
    });
  }, [navigation]);

  const share = useCallback(() => {
    const record = booking.data;
    const parts = [
      strings.bookingFlow.shareConfirmed,
      record?.reference ? `${strings.booking.reference} ${record.reference}` : null,
      record ? `${formatSlotDate(record.date)} • ${formatSlotClock(record.time)}` : null,
      record?.businessName,
    ].filter(Boolean);
    Share.share({ message: parts.join('\n') }).catch(() => undefined);
  }, [booking.data]);

  const shareDetails = (
    <View className="mt-2">
      <Button
        label={strings.booking.shareDetails}
        variant="outline"
        size="sm"
        fullWidth={false}
        leftIcon={<Icon name="share" size={20} color={colors.secondary} />}
        onPress={share}
      />
    </View>
  );

  if (!bookingId) {
    return (
      <View className="flex-1 bg-surface">
        <SafeAreaView edges={['top']} className="bg-surface" />
        <ErrorState
          title={strings.bookingFlow.confirmedMissingTitle}
          description={strings.bookingFlow.confirmedMissingBody}
          onRetry={undefined}
        />
        <View className="gap-2 bg-surface px-6 pb-6">
          <Button
            label={strings.accountScreens.moreHub.viewBookings}
            variant="secondary"
            onPress={goToBookings}
          />
          <Button label={strings.booking.backHome} variant="ghost" onPress={goHome} />
        </View>
      </View>
    );
  }

  if (booking.isLoading) {
    return (
      <View className="flex-1 bg-surface">
        <SafeAreaView edges={['top']} className="bg-surface" />
        <LoadingState label={strings.bookingFlow.loadingBooking} />
      </View>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <View className="flex-1 bg-surface">
        <SafeAreaView edges={['top']} className="bg-surface" />
        <ErrorState
          title={strings.bookingFlow.confirmedErrorTitle}
          description={strings.bookingFlow.confirmedErrorBody}
          onRetry={() => booking.refetch()}
        />
        <View className="gap-2 bg-surface px-6 pb-6">
          <Button
            label={strings.accountScreens.moreHub.viewBookings}
            variant="secondary"
            onPress={goToBookings}
          />
          <Button label={strings.booking.backHome} variant="ghost" onPress={goHome} />
        </View>
      </View>
    );
  }

  const record = booking.data;
  const itemName = record.itemName ?? draft?.itemId ?? strings.bookingFlow.service;
  const durationMinutes = record.durationMinutes ?? 0;

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface" />
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="gap-6 px-6 pb-40"
        showsVerticalScrollIndicator={false}
      >
        <BookingSuccessState
          reference={record.reference}
          businessName={record.businessName ?? draft?.businessName}
        />

        <View className="gap-3 rounded-card bg-surface-container-low p-4 shadow-sm">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-primary-fixed">
              <Icon name="eventAvailable" size={22} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelSm"
                tone="secondary"
                className="font-sans-semibold uppercase"
              >
                {strings.booking.reservedSlot}
              </VemtapText>
              <VemtapText variant="headingSm" className="text-text">
                {formatSlotDate(record.date)}
              </VemtapText>
              <View className="mt-0.5 flex-row items-center gap-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
                  {formatSlotClock(record.time)}
                </VemtapText>
                {durationMinutes > 0 ? (
                  <>
                    <VemtapText variant="caption" tone="tertiary">
                      •
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary">
                      {strings.bookingFlow.minutes(durationMinutes)}
                    </VemtapText>
                  </>
                ) : null}
              </View>
            </View>
          </View>
          <View className="flex-row items-center gap-3 rounded-field bg-surface p-3 shadow-sm">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-field bg-surface-container-high">
              <Icon name="storefront" size={20} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelSm" tone="secondary">
                {strings.bookingFlow.business}
              </VemtapText>
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold text-text"
                numberOfLines={1}
              >
                {record.businessName ??
                  record.branchName ??
                  strings.bookingFlow.unnamedBusiness}
              </VemtapText>
              {record.branchName ? (
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  {record.branchName}
                </VemtapText>
              ) : null}
            </View>
          </View>
        </View>

        <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
          <VemtapText variant="headingSm" className="text-text">
            {strings.bookingFlow.service}
          </VemtapText>
          <View className="flex-row items-start justify-between gap-3">
            <VemtapText
              variant="labelMd"
              className="min-w-0 flex-1 font-sans-medium text-text"
            >
              {itemName}
            </VemtapText>
            {durationMinutes > 0 ? (
              <VemtapText
                variant="labelMd"
                className="shrink-0 font-sans-semibold text-text"
              >
                {strings.bookingFlow.minutes(durationMinutes)}
              </VemtapText>
            ) : null}
          </View>
          <View className="flex-row items-start gap-1 rounded-field bg-surface-tint p-3">
            <Icon name="info" size={16} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {strings.bookingFlow.payAtBranch}
            </VemtapText>
          </View>
          {record.notes ? (
            <View className="gap-1 rounded-field bg-surface-subtle p-3">
              <VemtapText variant="caption" tone="tertiary" className="uppercase">
                {strings.bookingFlow.notesLabel}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary">
                {record.notes}
              </VemtapText>
            </View>
          ) : null}
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: guideExpanded }}
            onPress={() => setGuideExpanded(value => !value)}
            className="flex-row items-center justify-between gap-3 px-1 py-1"
          >
            <View className="min-w-0 flex-1">
              <VemtapText variant="headingSm" className="text-text">
                {strings.bookingFlow.arrivalGuide}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {strings.booking.guideSubtitle}
              </VemtapText>
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-container">
              <Icon
                name="expandMore"
                size={20}
                color={colors.textSecondary}
                style={guideExpanded ? { transform: [{ rotate: '180deg' }] } : undefined}
              />
            </View>
          </Pressable>
          {guideExpanded ? <ArrivalGuide reference={record.reference} /> : null}
        </View>

        {shareDetails}
      </ScrollView>

      <View
        className="gap-2 bg-surface px-6 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button
          label={strings.accountScreens.moreHub.viewBookings}
          variant="secondary"
          onPress={goToBookings}
        />
        <Button label={strings.booking.backHome} variant="ghost" onPress={goHome} />
      </View>
    </View>
  );
}
