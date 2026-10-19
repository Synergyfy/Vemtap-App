import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Button } from '@components/ui/Button';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import {
  BookingDateStrip,
  TimeSlotGrid,
} from '@features/booking/components/BookingComponents';
import {
  useBookingAvailability,
  useRescheduleBooking,
  type Booking,
} from '@features/booking/hooks/useBookings';
import { buildDateStrip } from '@features/booking/utils/dateStrip';
import { formatBookingSlot } from '@utils/formatters';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

const copy = strings.accountScreens.bookingDetail.rescheduleSheet;
const flow = strings.bookingFlow;
const STRIP_DAYS = 14;

export interface RescheduleBookingSheetProps {
  visible: boolean;
  onClose: () => void;
  booking: Booking;
  /** Called with the moved booking once the server accepts the new slot. */
  onRescheduled?: (booking: Booking) => void;
}

/**
 * Move a booking to another slot. Days and times come from the branch's live
 * availability for the same service, so only slots the server will accept can
 * be picked. The booking's own current slot is not offered again.
 */
export function RescheduleBookingSheet({
  visible,
  onClose,
  booking,
  onRescheduled,
}: RescheduleBookingSheetProps) {
  const dates = useMemo(() => buildDateStrip(STRIP_DAYS), []);
  const [date, setDate] = useState(dates[0].id);
  const [time, setTime] = useState('');
  const reschedule = useRescheduleBooking();
  const availability = useBookingAvailability(
    {
      branchId: booking.branchId ?? undefined,
      itemId: booking.itemId ?? undefined,
      date,
    },
    { enabled: visible },
  );
  const slots = useMemo(
    () =>
      (availability.data?.slots ?? []).map(slot =>
        // The slot it already holds is not a move.
        date === booking.date && slot.time === booking.time
          ? { ...slot, available: false }
          : slot,
      ),
    [availability.data, booking.date, booking.time, date],
  );
  const usable =
    Boolean(time) && slots.some(slot => slot.time === time && slot.available);

  // A time picked on one day may not exist on the next.
  useEffect(() => {
    if (time && !slots.some(slot => slot.time === time && slot.available)) setTime('');
  }, [slots, time]);

  useEffect(() => {
    if (!visible) {
      reschedule.reset();
      setTime('');
    }
    // `reschedule` is a stable mutation object; only the visibility matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const confirm = () => {
    if (!usable || reschedule.isPending) return;
    reschedule.mutate(
      { id: booking.id, date, time },
      {
        onSuccess: moved => {
          onRescheduled?.(moved);
          onClose();
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      <ScrollView
        className="shrink"
        contentContainerClassName="gap-4 px-6 pb-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VemtapText variant="bodyMd" tone="secondary" className="-mt-1">
          {copy.current(formatBookingSlot(booking.date, booking.time))}
        </VemtapText>

        <View className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.pickDate}
          </VemtapText>
          <BookingDateStrip dates={dates} selected={date} onSelect={setDate} />
        </View>

        <View className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.pickTime}
          </VemtapText>
          {availability.isLoading ? (
            <LoadingState />
          ) : availability.isError ? (
            <ErrorState
              title={flow.timesErrorTitle}
              description={flow.timesErrorBody}
              onRetry={() => availability.refetch()}
            />
          ) : availability.data?.isClosed ? (
            <EmptyState
              variant="contained"
              icon="schedule"
              title={flow.closedTitle}
              description={flow.closedBody}
            />
          ) : slots.some(slot => slot.available) ? (
            <TimeSlotGrid slots={slots} selected={time} onSelect={setTime} />
          ) : (
            <EmptyState
              variant="contained"
              icon="schedule"
              title={flow.noSlotsTitle}
              description={flow.noSlotsBody}
            />
          )}
        </View>

        {reschedule.isError ? (
          <VemtapText variant="caption" tone="error">
            {copy.failed}
          </VemtapText>
        ) : (
          <VemtapText variant="caption" tone="tertiary">
            {copy.needsConfirmation}
          </VemtapText>
        )}
        <Button
          label={reschedule.isPending ? copy.saving : copy.confirm}
          onPress={confirm}
          disabled={!usable || reschedule.isPending}
        />
      </ScrollView>
    </BottomSheet>
  );
}
