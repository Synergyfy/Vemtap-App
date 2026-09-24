import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@navigation/types';
import { bookingAddons, formatBookingNaira } from '@features/booking/bookingData';
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

const defaultDraft = {
  addons: [] as string[],
  therapistId: 'any',
  date: '2024-10-17',
  time: '1:15',
  notes: '',
};

export function ScheduleAppointmentScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const initialDraft = route.params?.draft ?? defaultDraft;
  const [date, setDate] = useState(initialDraft.date);
  const [time, setTime] = useState(initialDraft.time);
  const [therapistId] = useState(initialDraft.therapistId);
  const [addons] = useState(initialDraft.addons);
  const [notes, setNotes] = useState(initialDraft.notes);
  const [period, setPeriod] = useState('afternoon');
  const total = useMemo(
    () =>
      25000 +
      bookingAddons
        .filter(addon => addons.includes(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0),
    [addons],
  );

  const share = useCallback(() => {
    Share.share({
      message: 'https://vemtap.com/bookings/deep-hydration-radiance-facial/schedule',
    }).catch(() => undefined);
  }, []);

  const review = useCallback(() => {
    navigation.navigate('BookingCheckout', {
      draft: { addons, therapistId, date, time, notes },
    });
  }, [addons, date, navigation, notes, therapistId, time]);

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={['top']} className="bg-surface">
        <BookingHeader
          title={strings.booking.scheduleHeader}
          onBack={navigation.goBack}
          action="share"
          onAction={share}
        />
      </SafeAreaView>
      <BookingProgress step={1} />

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="pb-52"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-4 py-4">
          <MerchantSummary />
          <View className="rounded-card border border-border bg-surface p-4">
            <ServiceSummary
              count={2}
              duration={strings.booking.totalDuration}
              subtotal={total}
            />
          </View>

          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Icon name="schedule" size={20} color={colors.primary} />
              <VemtapText
                variant="labelMd"
                className="font-sans-bold uppercase text-text"
              >
                {strings.booking.october}
              </VemtapText>
            </View>
            <BookingDateStrip selected={date} onSelect={setDate} />
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
              {[
                ['morning', strings.booking.morning],
                ['afternoon', strings.booking.afternoon],
                ['evening', strings.booking.evening],
              ].map(([id, label]) => (
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
            <TimeSlotGrid selected={time} onSelect={setTime} />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {strings.booking.notesTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {strings.common.optional}
              </VemtapText>
            </View>
            <TextInput
              accessibilityLabel={strings.booking.notesTitle}
              value={notes}
              onChangeText={setNotes}
              placeholder={strings.booking.notesPlaceholder}
              placeholderTextColor={colors.textTertiary}
              multiline
              className="min-h-[96px] rounded-card border border-border bg-surface-muted p-3 text-body-md text-text"
            />
            <View className="flex-row items-center gap-1">
              <Icon name="checkCircle" size={13} color={colors.badgeDiscountText} />
              <VemtapText tone="secondary" className="min-w-0 flex-1 text-micro">
                {strings.booking.notesHelp}
              </VemtapText>
            </View>
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
              {strings.booking.totalPayable}
            </VemtapText>
            <VemtapText variant="headingMd" className="font-sans-bold text-text">
              {formatBookingNaira(total)}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 items-end">
            <View className="max-w-full flex-row items-center gap-1 rounded-field bg-surface-tint px-2.5 py-1">
              <Icon name="eventAvailable" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" className="shrink text-primary">
                {strings.booking.selectedSlot}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary" className="mt-0.5 text-right">
              {therapistId === 'any'
                ? 'Specialist: Any Available'
                : 'Specialist: Amara K.'}
            </VemtapText>
          </View>
        </View>
        <Button
          label={strings.booking.reviewBooking}
          rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
          onPress={review}
        />
      </View>
    </View>
  );
}
