import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, TextInput, View } from 'react-native';
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
import { formatBookingNaira } from '@features/booking/bookingData';
import { useServiceItem } from '@features/booking/hooks/useServiceItem';
import { useBookingAvailability } from '@features/booking/hooks/useBookings';
import { toAmount } from '@features/deals/utils/offerMapper';
import { formatBookingSlot } from '@utils/formatters';
import { buildDateStrip } from '@features/booking/utils/dateStrip';
import {
  BookingDateStrip,
  BookingHeader,
  BookingProgress,
  MerchantSummary,
  ServiceSummary,
  TimeSlotGrid,
} from '@features/booking/components/BookingComponents';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'ScheduleAppointment'>;

/** How far ahead the strip offers days. The API rejects past dates outright. */
const STRIP_DAYS = 14;

/**
 * `2026-10-20` → "October 2026", the header above the strip. Explicit locale
 * because the month name is the only thing that should vary, not the format.
 */
function monthLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

type Period = 'morning' | 'afternoon' | 'evening';

/** The API returns one flat grid; the period chips are a client-side filter. */
function hourOf(time: string): number {
  return Number.parseInt(time.slice(0, 2), 10);
}

function inPeriod(period: Period, time: string): boolean {
  const hour = hourOf(time);
  if (Number.isNaN(hour)) return false;
  if (period === 'morning') return hour < 12;
  if (period === 'afternoon') return hour >= 12 && hour < 16;
  return hour >= 16;
}

/**
 * Pick a day and a slot for one branch.
 *
 * The slots come from `GET /bookings/availability` for the selected
 * branch/item/date, so the grid shows only times the server will actually
 * accept — the bundled "October 2024" strip and fixed `1:15` cell are gone
 * with it. Nothing is written until checkout confirms.
 */
export function ScheduleAppointmentScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const draft = route.params?.draft;
  const { branchId, itemId, businessName, branchName } = draft ?? {};

  const dates = useMemo(() => buildDateStrip(STRIP_DAYS), []);
  const [date, setDate] = useState(draft?.date || dates[0].id);
  const [time, setTime] = useState(draft?.time ?? '');
  const [notes, setNotes] = useState(draft?.notes ?? '');
  const [period, setPeriod] = useState<Period>('afternoon');

  const item = useServiceItem(itemId, branchId);
  const availability = useBookingAvailability({ branchId, itemId, date });
  const slots = useMemo(() => availability.data?.slots ?? [], [availability.data]);

  /**
   * A time picked on a previous day may not exist on this one. Clearing it
   * rather than leaving it in state keeps the review button honest: it can
   * only be pressed with a slot that is on the server's grid for this day.
   */
  useEffect(() => {
    if (time && !slots.some(slot => slot.time === time && slot.available)) {
      setTime('');
    }
  }, [slots, time]);

  const visibleSlots = useMemo(
    () => slots.filter(slot => inPeriod(period, slot.time)),
    [period, slots],
  );
  const slotIsUsable =
    Boolean(time) && slots.some(slot => slot.time === time && slot.available);

  const share = useCallback(() => {
    Share.share({ message: strings.bookingFlow.shareSlot(item.data?.name) }).catch(
      () => undefined,
    );
  }, [item.data?.name]);

  const review = useCallback(() => {
    navigation.navigate('BookingCheckout', {
      draft: {
        itemId,
        branchId,
        date,
        time,
        notes,
        businessName,
        branchName,
      },
    });
  }, [branchId, businessName, branchName, date, itemId, navigation, notes, time]);

  const header = (
    <SafeAreaView edges={['top']} className="bg-surface">
      <BookingHeader
        title={strings.booking.scheduleHeader}
        onBack={navigation.goBack}
        action="share"
        onAction={share}
      />
    </SafeAreaView>
  );

  if (!branchId) {
    return (
      <View className="flex-1 bg-surface">
        {header}
        <EmptyState
          title={strings.bookingFlow.noBranchTitle}
          description={strings.bookingFlow.noBranchBody}
          onAction={navigation.goBack}
          actionLabel={strings.bookingFlow.noBranchAction}
        />
      </View>
    );
  }

  const price = toAmount(item.data?.price) ?? 0;

  return (
    <View className="flex-1 bg-surface">
      {header}
      <BookingProgress step={1} />

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-52"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-4 py-4">
          <MerchantSummary businessName={businessName} branchName={branchName} />
          {item.data ? (
            <View className="rounded-card border border-border bg-surface p-4">
              <ServiceSummary
                name={item.data.name}
                duration={item.data.duration}
                subtotal={price}
              />
            </View>
          ) : null}

          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Icon name="schedule" size={20} color={colors.primary} />
              <VemtapText
                variant="labelMd"
                className="font-sans-bold uppercase text-text"
              >
                {monthLabel(date)}
              </VemtapText>
            </View>
            <BookingDateStrip dates={dates} selected={date} onSelect={setDate} />
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-1.5">
                <Icon name="schedule" size={20} color={colors.primary} />
                <VemtapText
                  variant="labelMd"
                  className="font-sans-bold uppercase text-text"
                >
                  {strings.booking.availableTimes}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary">
                {strings.booking.timezone}
              </VemtapText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-2"
            >
              {(
                [
                  ['morning', strings.booking.morning],
                  ['afternoon', strings.booking.afternoon],
                  ['evening', strings.booking.evening],
                ] as [Period, string][]
              ).map(([id, label]) => (
                <Pressable
                  key={id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: period === id }}
                  onPress={() => setPeriod(id)}
                  className={`rounded-full px-3 py-1.5 ${period === id ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}`}
                >
                  <VemtapText
                    variant="caption"
                    className={period === id ? 'text-inverse' : 'text-text-secondary'}
                  >
                    {label}
                  </VemtapText>
                </Pressable>
              ))}
            </ScrollView>

            {availability.isLoading ? (
              <LoadingState label={strings.bookingFlow.loadingTimes} />
            ) : availability.isError ? (
              <ErrorState
                title={strings.bookingFlow.timesErrorTitle}
                description={strings.bookingFlow.timesErrorBody}
                onRetry={() => availability.refetch()}
                className="rounded-card border border-border bg-surface p-4"
              />
            ) : availability.data?.isClosed ? (
              <EmptyState
                variant="contained"
                icon="calendar"
                title={strings.bookingFlow.closedTitle}
                description={strings.bookingFlow.closedBody}
              />
            ) : visibleSlots.length === 0 ? (
              <EmptyState
                variant="contained"
                icon="schedule"
                title={strings.bookingFlow.noSlotsTitle}
                description={strings.bookingFlow.noSlotsBody}
              />
            ) : (
              <>
                <TimeSlotGrid selected={time} slots={visibleSlots} onSelect={setTime} />
                <VemtapText variant="caption" tone="tertiary">
                  {strings.bookingFlow.gridNote}
                </VemtapText>
              </>
            )}
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {strings.bookingFlow.notesLabel}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {strings.common.optional}
              </VemtapText>
            </View>
            <TextInput
              accessibilityLabel={strings.bookingFlow.notesLabel}
              value={notes}
              onChangeText={setNotes}
              placeholder={strings.bookingFlow.notesPlaceholder}
              placeholderTextColor={colors.textTertiary}
              multiline
              className="min-h-[96px] rounded-card border border-border bg-surface-muted p-3 text-body-md text-text"
            />
          </View>
        </View>
      </ScrollView>

      <View
        className="bg-surface px-4 pt-3 shadow-xl"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mb-2.5 flex-row items-start justify-between gap-3">
          <View className="shrink-0">
            <VemtapText variant="caption" tone="secondary">
              {strings.bookingFlow.totalPayable}
            </VemtapText>
            <VemtapText variant="headingMd" className="font-sans-bold text-text">
              {item.data ? formatBookingNaira(price) : '—'}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 items-end">
            <View className="max-w-full flex-row items-center gap-1 rounded-field bg-surface-tint px-2.5 py-1">
              <Icon name="eventAvailable" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" className="shrink text-primary">
                {slotIsUsable
                  ? formatBookingSlot(date, time)
                  : strings.bookingFlow.pickTime}
              </VemtapText>
            </View>
          </View>
        </View>
        <Button
          label={strings.booking.reviewBooking}
          rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
          disabled={!slotIsUsable}
          onPress={review}
        />
      </View>
    </View>
  );
}
