import React from 'react';
import { Image, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { PriceBreakdown } from '@features/order/components/OrderComponents';
import {
  bookingDates,
  bookingTherapists,
  bookingTimes,
  formatBookingNaira,
  type BookingAddon,
  type BookingDate,
  type BookingTherapist,
} from '@features/booking/bookingData';

cssInterop(Image, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(Switch, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(View, { className: 'style' });

interface BookingHeaderProps {
  title: string;
  onBack: () => void;
  action?: 'share' | 'help';
  onAction?: () => void;
}

export function BookingHeader({ title, onBack, action, onAction }: BookingHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between bg-surface px-4 py-3"
      style={navbarBottomShadow}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.common.goBack}
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-low"
      >
        <Icon name="back" size={24} color={colors.text} />
      </Pressable>
      <VemtapText
        accessibilityRole="header"
        variant="headingSm"
        className="min-w-0 flex-1 px-2 text-center text-text"
        numberOfLines={1}
      >
        {title}
      </VemtapText>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            action === 'help' ? strings.common.help : strings.common.share
          }
          onPress={onAction}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-low"
        >
          <Icon
            name={action === 'help' ? 'help' : 'share'}
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
      ) : (
        <View className="h-10 w-10" />
      )}
    </View>
  );
}

export function BookingProgress({ step }: { step: 1 | 2 }) {
  return (
    <View className="border-b border-border bg-surface-muted px-4 py-3">
      <View className="flex-row items-center justify-between gap-3">
        <VemtapText variant="labelMd" className="font-sans-semibold text-text">
          {step === 1 ? strings.booking.scheduleStep : strings.booking.checkoutStep}
        </VemtapText>
        <View className="rounded-full bg-surface-container px-2 py-0.5">
          <VemtapText variant="caption" className="font-sans-semibold text-primary">
            {step === 1 ? '1 / 2' : '2 / 2'}
          </VemtapText>
        </View>
      </View>
      <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container">
        <View
          className={`h-full rounded-full bg-primary ${step === 1 ? 'w-1/2' : 'w-full'}`}
        />
      </View>
      <View className="mt-1.5 flex-row items-center justify-between gap-3">
        <VemtapText variant="caption" tone="secondary">
          {strings.booking.activeSelection}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" className="text-right">
          {step === 1 ? strings.booking.nextReview : strings.booking.readyConfirm}
        </VemtapText>
      </View>
    </View>
  );
}

export function MerchantSummary() {
  return (
    <View className="flex-row items-start gap-3 rounded-card bg-surface-container-low p-4 shadow-sm">
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-1">
          <Icon name="star" size={15} color={colors.badgeDiscountText} />
          <VemtapText variant="caption" className="font-sans-semibold text-text">
            {strings.booking.rating}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary">
            {strings.booking.reviews}
          </VemtapText>
        </View>
        <VemtapText variant="bodyLg" className="font-sans-bold text-text">
          {strings.booking.merchant}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {strings.booking.merchantLocation}
        </VemtapText>
        <View className="mt-1 self-start rounded-field border border-border bg-surface px-2.5 py-1">
          <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
            {strings.booking.viewPolicy}
          </VemtapText>
        </View>
      </View>
      <Image
        source={{ uri: strings.booking.interiorImage }}
        className="h-20 w-20 shrink-0 rounded-field bg-surface-container"
        resizeMode="cover"
      />
    </View>
  );
}

export interface ServiceSummaryProps {
  count: number;
  duration: string;
  subtotal: number;
}

export function ServiceSummary({ count, duration, subtotal }: ServiceSummaryProps) {
  return (
    <View className="gap-2.5">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icon name="spa" size={20} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-bold uppercase text-text">
            {strings.booking.selectedServices(count)}
          </VemtapText>
        </View>
        <View className="rounded-full bg-surface-tint px-2 py-0.5">
          <VemtapText variant="caption" className="font-sans-semibold text-primary">
            {duration}
          </VemtapText>
        </View>
      </View>
      {[strings.booking.facialLine, strings.booking.manicureLine].map(line => (
        <View
          key={line}
          className="flex-row items-center justify-between gap-3 rounded-field border border-border bg-surface-muted p-3"
        >
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold text-text"
          >
            {line}
          </VemtapText>
          <View className="h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-container">
            <Icon name="check" size={15} color={colors.badgeDiscountText} />
          </View>
        </View>
      ))}
      <View className="flex-row items-center justify-between border-t border-dashed border-border pt-2">
        <VemtapText variant="caption" tone="secondary">
          {strings.booking.sessionSubtotal}
        </VemtapText>
        <VemtapText variant="labelMd" className="font-sans-bold text-text">
          {formatBookingNaira(subtotal)}
        </VemtapText>
      </View>
    </View>
  );
}

export function AddonSelection({
  addons,
  selected,
  onToggle,
}: {
  addons: BookingAddon[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
      <View className="flex-row items-center justify-between gap-3">
        <VemtapText variant="headingSm" className="text-text">
          {strings.booking.enhanceSession}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary">
          {strings.common.optional}
        </VemtapText>
      </View>
      <VemtapText variant="caption" tone="secondary">
        {strings.booking.enhanceBody}
      </VemtapText>
      {addons.map(addon => {
        const isSelected = selected.includes(addon.id);
        return (
          <Pressable
            key={addon.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            onPress={() => onToggle(addon.id)}
            className={`flex-row items-start gap-3 rounded-field p-3 ${
              isSelected ? 'bg-surface-tint' : 'bg-surface-container-low'
            }`}
          >
            <View
              className={`mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded ${
                isSelected ? 'bg-primary' : 'border border-outline-variant'
              }`}
            >
              {isSelected ? <Icon name="check" size={14} color={colors.surface} /> : null}
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {addon.name}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {addon.description}
              </VemtapText>
            </View>
            <VemtapText
              variant="labelMd"
              className="shrink-0 font-sans-semibold text-primary"
            >
              {`+${formatBookingNaira(addon.price)}`}
            </VemtapText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TherapistCards({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View className="flex-row gap-3">
      {bookingTherapists.map(therapist => (
        <TherapistCard
          key={therapist.id}
          therapist={therapist}
          selected={therapist.id === selected}
          onPress={() => onSelect(therapist.id)}
        />
      ))}
    </View>
  );
}

function TherapistCard({
  therapist,
  selected,
  onPress,
}: {
  therapist: BookingTherapist;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`min-w-[126px] flex-1 items-center rounded-card p-3 ${
        selected ? 'bg-surface-tint' : 'bg-surface-muted'
      }`}
    >
      {therapist.image ? (
        <Image
          source={{ uri: therapist.image }}
          className="mb-2 h-12 w-12 rounded-full bg-surface-container-high"
          resizeMode="cover"
        />
      ) : (
        <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-primary shadow-sm">
          <Icon name="bolt" size={24} color={colors.surface} />
        </View>
      )}
      <VemtapText
        variant="labelMd"
        className="w-full text-center font-sans-semibold text-text"
        numberOfLines={1}
      >
        {therapist.name}
      </VemtapText>
      <VemtapText
        variant="caption"
        className={`w-full text-center ${selected ? 'text-primary' : 'text-text-secondary'}`}
        numberOfLines={1}
      >
        {therapist.role}
      </VemtapText>
    </Pressable>
  );
}

export function BookingDateStrip({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2.5">
      {bookingDates.map(date => (
        <DateCard
          key={date.id}
          date={date}
          selected={date.id === selected}
          onPress={() => onSelect(date.id)}
        />
      ))}
    </ScrollView>
  );
}

function DateCard({
  date,
  selected,
  onPress,
}: {
  date: BookingDate;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`w-16 shrink-0 items-center rounded-card p-2.5 ${
        selected ? 'bg-primary-container shadow-md' : 'border border-border bg-surface'
      }`}
    >
      <VemtapText
        variant="caption"
        className={selected ? 'text-inverse' : 'text-text-secondary'}
      >
        {date.day}
      </VemtapText>
      <VemtapText
        variant="headingSm"
        className={`my-0.5 ${selected ? 'text-inverse' : 'text-text'}`}
      >
        {date.date}
      </VemtapText>
      <VemtapText
        className={`font-sans-semibold text-micro ${selected ? 'text-inverse' : 'text-text-tertiary'}`}
      >
        {date.status}
      </VemtapText>
    </Pressable>
  );
}

export function TimeSlotGrid({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {bookingTimes.map(slot => {
        const isSelected = slot.id === selected;
        return (
          <Pressable
            key={slot.id}
            accessibilityRole="radio"
            accessibilityState={{
              checked: isSelected,
              disabled: slot.status === 'booked',
            }}
            disabled={slot.status === 'booked'}
            onPress={() => onSelect(slot.id)}
            className={`min-w-[30%] flex-1 items-center rounded-card border px-2 py-2.5 ${
              isSelected
                ? 'border-primary bg-primary-container'
                : slot.status === 'booked'
                  ? 'border-border bg-surface-container opacity-60'
                  : 'border-border bg-surface'
            }`}
          >
            <VemtapText
              variant="labelMd"
              className={`${isSelected ? 'text-inverse' : 'text-text'} ${
                slot.status === 'booked' ? 'line-through' : ''
              }`}
            >
              {slot.time}
            </VemtapText>
            <VemtapText
              className={`font-sans-semibold text-micro ${isSelected ? 'text-inverse' : 'text-success'}`}
            >
              {slot.status === 'booked'
                ? strings.booking.booked
                : slot.status === 'selected'
                  ? strings.booking.selected
                  : strings.booking.available}
            </VemtapText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ClientInformation({
  reminders,
  onRemindersChange,
}: {
  reminders: boolean;
  onRemindersChange: (value: boolean) => void;
}) {
  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4 shadow-sm">
      <View className="flex-row items-center justify-between border-b border-border pb-2">
        <View className="flex-row items-center gap-2">
          <Icon name="person" size={20} color={colors.primary} />
          <VemtapText variant="headingSm" className="text-text">
            {strings.booking.clientInformation}
          </VemtapText>
        </View>
        <VemtapText variant="caption" className="font-sans-medium text-primary">
          {strings.booking.edit}
        </VemtapText>
      </View>
      {[
        [strings.booking.fullName, strings.booking.clientName],
        [strings.booking.phoneNumber, strings.booking.clientPhone],
        [strings.booking.email, strings.booking.clientEmail],
      ].map(([label, value]) => (
        <View key={label} className="flex-row items-start justify-between gap-3">
          <VemtapText variant="caption" tone="secondary">
            {label}
          </VemtapText>
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 text-right font-sans-medium text-text"
          >
            {value}
          </VemtapText>
        </View>
      ))}
      <View className="flex-row items-center justify-between gap-3 border-t border-border pt-3">
        <View className="min-w-0 flex-row items-center gap-2">
          <Icon name="notifications" size={20} color={colors.textSecondary} />
          <VemtapText variant="caption" className="font-sans-medium text-text">
            {strings.booking.reminderLabel}
          </VemtapText>
        </View>
        <Switch
          accessibilityLabel={strings.booking.reminderLabel}
          value={reminders}
          onValueChange={onRemindersChange}
          trackColor={{
            false: colors.surfaceContainerHighest,
            true: colors.primaryFixed,
          }}
          thumbColor={reminders ? colors.primary : colors.outline}
        />
      </View>
    </View>
  );
}

export function BookingBreakdown({
  subtotal,
  discount,
  total,
}: {
  subtotal: number;
  discount: number;
  total: number;
}) {
  return (
    <PriceBreakdown
      rows={[
        { label: strings.booking.servicesSubtotal, value: formatBookingNaira(subtotal) },
        {
          label: strings.booking.dealDiscount,
          value: `-${formatBookingNaira(discount)}`,
          tone: 'success',
        },
        {
          label: strings.booking.bookingFee,
          value: strings.booking.zeroFee,
          tone: 'success',
        },
      ]}
      totalLabel={strings.booking.totalAtSalon}
      totalCaption={strings.booking.dueAfter}
      total={formatBookingNaira(total)}
    />
  );
}

export function ArrivalGuide() {
  const items = [
    { title: strings.booking.arriveTitle, body: strings.booking.arriveBody },
    { title: strings.booking.voucherTitle, body: strings.booking.voucherBody },
    { title: strings.booking.settleTitle, body: strings.booking.settleBody },
    { title: strings.booking.relaxTitle, body: strings.booking.relaxBody },
  ];
  return (
    <View className="gap-3">
      {items.map((item, index) => (
        <View
          key={item.title}
          className="flex-row items-start gap-3 rounded-card bg-surface p-4 shadow-sm"
        >
          <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
            <VemtapText variant="headingSm" className="text-inverse">
              {index + 1}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="headingSm" className="text-text">
              {item.title}
            </VemtapText>
            <VemtapText
              variant="bodyMd"
              tone="secondary"
              className="mt-1 leading-relaxed"
            >
              {item.body}
            </VemtapText>
          </View>
        </View>
      ))}
    </View>
  );
}

export function BookingSuccessState() {
  return (
    <View className="items-center gap-3">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-tint">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-success-container shadow-sm">
          <Icon name="checkCircle" size={36} color={colors.badgeDiscountText} />
        </View>
        <View className="absolute right-1 top-0 rounded-full bg-primary px-2 py-0.5">
          <VemtapText className="text-inverse font-sans-bold text-micro">VIP</VemtapText>
        </View>
      </View>
      <VemtapText
        accessibilityRole="header"
        variant="headingXl"
        className="text-center text-heading-xl text-text"
      >
        {strings.booking.confirmedTitle}
      </VemtapText>
      <View className="flex-row items-center gap-1">
        <VemtapText variant="headingSm" tone="secondary">
          {strings.booking.merchant}
        </VemtapText>
        <Icon name="verified" size={18} color={colors.primary} />
      </View>
      <View className="flex-row flex-wrap justify-center gap-2">
        <View className="rounded-full bg-surface-container px-3 py-1">
          <VemtapText variant="labelSm" tone="secondary">
            {strings.booking.reference}{' '}
            <VemtapText className="text-text">#GS-44218</VemtapText>
          </VemtapText>
        </View>
        <View className="rounded-full bg-success-container px-3 py-1">
          <VemtapText variant="labelSm" className="font-sans-medium text-success">
            {strings.booking.bookedNow}
          </VemtapText>
        </View>
      </View>
    </View>
  );
}

export function BookingIconButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      label={label}
      variant="outline"
      size="sm"
      leftIcon={<Icon name={icon} size={19} color={colors.primary} />}
      onPress={onPress}
    />
  );
}
