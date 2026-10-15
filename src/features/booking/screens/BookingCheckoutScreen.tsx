import React, { useCallback } from 'react';
import { Image, ScrollView, Share, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { OrderLineItem } from '@features/order/components/OrderComponents';
import { useAuthStore } from '@store/authStore';
import { toAmount } from '@features/deals/utils/offerMapper';
import { formatBookingNaira } from '@features/booking/bookingData';
import { useServiceItem } from '@features/booking/hooks/useServiceItem';
import { useCreateBooking } from '@features/booking/hooks/useBookings';
import { formatSlotDate, formatSlotClock } from '@utils/formatters';
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

/**
 * Review the slot, then `POST /bookings`.
 *
 * This is the screen that used to "confirm" a booking without calling
 * anything: it now owns the mutation, and the confirmation screen is only
 * reached with the id of a booking the server actually created. A rejected
 * slot (400 — taken between the availability check and this call) stays on
 * this screen with the reason, so the customer can go back and pick another
 * time instead of seeing a success page for a booking that does not exist.
 */
export function BookingCheckoutScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const draft = route.params?.draft;
  const { branchId, itemId, date, time, notes, businessName, branchName } = draft ?? {};

  const user = useAuthStore(state => state.user);
  const item = useServiceItem(itemId, branchId);
  const create = useCreateBooking();

  const help = useCallback(() => {
    Share.share({ message: strings.bookingFlow.shareSlot(item.data?.name) }).catch(
      () => undefined,
    );
  }, [item.data?.name]);

  const confirm = useCallback(() => {
    if (!branchId) return;
    create.mutate(
      { branchId, itemId, date: date ?? '', time: time ?? '', notes },
      {
        onSuccess: created => {
          navigation.replace('BookingConfirmed', { draft, bookingId: created.id });
        },
      },
    );
  }, [branchId, create, date, draft, itemId, navigation, notes, time]);

  const header = (
    <SafeAreaView edges={['top']} className="bg-surface">
      <BookingHeader
        title={strings.booking.checkoutHeader}
        onBack={navigation.goBack}
        action="help"
        onAction={help}
      />
    </SafeAreaView>
  );

  if (!branchId || !date || !time) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <EmptyState
          title={strings.bookingFlow.checkoutIncompleteTitle}
          description={strings.bookingFlow.checkoutIncompleteBody}
          onAction={navigation.goBack}
          actionLabel={strings.bookingFlow.checkoutIncompleteAction}
        />
      </View>
    );
  }

  if (item.isLoading) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <LoadingState label={strings.bookingFlow.loadingService} />
      </View>
    );
  }

  if (item.isError || !item.data) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <ErrorState
          title={strings.bookingFlow.serviceErrorTitle}
          description={strings.bookingFlow.serviceErrorBody}
          onRetry={() => item.refetch()}
        />
      </View>
    );
  }

  const service = item.data;
  const total = toAmount(service.price) ?? 0;
  const clientName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined;
  const error = create.error as Error | null;

  return (
    <View className="flex-1 bg-surface">
      {header}
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
            <View className="h-16 w-16 shrink-0 items-center justify-center rounded-field border border-border bg-surface-container">
              <Icon name="storefront" size={26} color={colors.primary} />
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold text-text"
                numberOfLines={1}
              >
                {businessName ?? strings.bookingFlow.business}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                {branchName ?? strings.bookingFlow.branch}
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
              value={`${formatSlotDate(date)} • ${formatSlotClock(time)}`}
            />
            {service.duration ? (
              <DetailRow
                icon="hourglass"
                label={strings.bookingFlow.duration}
                value={service.duration}
              />
            ) : null}
            <DetailRow
              icon="storefront"
              label={strings.bookingFlow.branch}
              value={branchName ?? strings.bookingFlow.atTheBranch}
            />
          </View>

          <ClientInformation name={clientName} phone={user?.phone} email={user?.email} />

          <View className="gap-3 rounded-card border border-border bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between gap-3 border-b border-border pb-2">
              <View className="flex-row items-center gap-2">
                <Icon name="spa" size={20} color={colors.primary} />
                <VemtapText variant="headingSm" className="text-text">
                  {strings.booking.selectedServicesCheckout}
                </VemtapText>
              </View>
            </View>
            <OrderLineItem
              image={service.mainImage ? { uri: service.mainImage } : undefined}
              title={service.name}
              description={service.duration ?? ''}
              price={formatBookingNaira(total)}
              quantity={1}
            />
          </View>

          <View className="gap-3 rounded-card border border-border-active bg-surface-tint p-4">
            <View className="flex-row items-start gap-2.5">
              <Icon name="shield" size={22} color={colors.primary} />
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {strings.bookingFlow.payTitle}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-1 leading-relaxed"
                >
                  {strings.bookingFlow.payBody(formatBookingNaira(total))}
                </VemtapText>
              </View>
            </View>
          </View>

          <BookingBreakdown subtotal={total} />

          <View className="flex-row items-start gap-2.5 rounded-field border border-border bg-surface-muted p-3">
            <Icon name="info" size={18} color={colors.textSecondary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {strings.bookingFlow.cancelAnytimeBody}
            </VemtapText>
          </View>

          {error ? (
            <View
              accessibilityRole="alert"
              className="flex-row items-start gap-2.5 rounded-field bg-error-container p-3"
            >
              <Icon name="info" size={18} color={colors.error} />
              <VemtapText variant="caption" tone="error" className="min-w-0 flex-1">
                {strings.bookingFlow.createFailed}
              </VemtapText>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <View
        className="bg-surface px-4 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mb-2 flex-row items-center justify-between gap-3">
          <View>
            <VemtapText variant="caption" tone="secondary">
              {strings.bookingFlow.payAtBranch}
            </VemtapText>
            <VemtapText variant="headingSm" className="text-primary-container">
              {formatBookingNaira(total)}
            </VemtapText>
          </View>
        </View>
        <Button
          label={strings.bookingFlow.confirmBooking}
          loading={create.isPending}
          disabled={create.isPending}
          rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
          onPress={confirm}
        />
        <VemtapText tone="tertiary" className="mt-2 text-center text-micro">
          {strings.bookingFlow.terms}
        </VemtapText>
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: 'schedule' | 'hourglass' | 'storefront';
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-field bg-surface-tint">
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="caption" tone="secondary">
          {label}
        </VemtapText>
        <VemtapText variant="labelMd" className="font-sans-semibold text-text">
          {value}
        </VemtapText>
      </View>
    </View>
  );
}
