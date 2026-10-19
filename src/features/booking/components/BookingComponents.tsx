import React from 'react';
import { Image, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors, shadowTokens } from '@theme/colors';
import { navbarBottomShadow } from '@theme/shadows';
import { PriceBreakdown } from '@features/order/components/OrderComponents';
import type { BookingSlot } from '@api/bookingsApi';
import { formatSlotClock } from '@utils/formatters';
import { formatBookingNaira } from '@features/booking/bookingData';

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

/**
 * The merchant a booking is with.
 *
 * Takes the names rather than rendering copy: nothing on the booking or the
 * item payload carries a rating, a review count or an address, and the old
 * hard-coded "4.9 • 96 reviews" row is exactly the kind of design number this
 * screen is being cleaned of. The image tile is an icon for the same reason —
 * the branch logo only arrives on the profile endpoint.
 */
export function MerchantSummary({
  businessName,
  branchName,
}: {
  businessName?: string;
  branchName?: string;
}) {
  return (
    <View className="flex-row items-start gap-3 rounded-card bg-surface-container-low p-4 shadow-sm">
      <View className="min-w-0 flex-1 gap-1">
        <VemtapText variant="caption" tone="secondary" className="uppercase">
          {strings.bookingFlow.business}
        </VemtapText>
        <VemtapText
          variant="bodyLg"
          className="font-sans-bold text-text"
          numberOfLines={2}
        >
          {businessName ?? strings.bookingFlow.unnamedBusiness}
        </VemtapText>
        {branchName ? (
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {branchName}
          </VemtapText>
        ) : null}
      </View>
      <View className="h-14 w-14 shrink-0 items-center justify-center rounded-field bg-surface">
        <Icon name="storefront" size={24} color={colors.primary} />
      </View>
    </View>
  );
}

export interface ServiceSummaryProps {
  /** The one catalogue item being booked. */
  name: string;
  /** The item's own duration label, e.g. "1.5 hours"; omit when it has none. */
  duration?: string | null;
  /** Branch price of that item. */
  subtotal: number;
}

export function ServiceSummary({ name, duration, subtotal }: ServiceSummaryProps) {
  return (
    <View className="gap-2.5">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icon name="spa" size={20} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-bold uppercase text-text">
            {strings.bookingFlow.service}
          </VemtapText>
        </View>
        {duration ? (
          <View className="rounded-full bg-surface-tint px-2 py-0.5">
            <VemtapText variant="caption" className="font-sans-semibold text-primary">
              {duration}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className="flex-row items-center justify-between gap-3 rounded-field border border-border bg-surface-muted p-3">
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold text-text"
        >
          {name}
        </VemtapText>
        <View className="h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-container">
          <Icon name="check" size={15} color={colors.badgeDiscountText} />
        </View>
      </View>
      <View className="flex-row items-center justify-between border-t border-dashed border-border pt-2">
        <VemtapText variant="caption" tone="secondary">
          {strings.bookingFlow.sessionSubtotal}
        </VemtapText>
        <VemtapText variant="labelMd" className="font-sans-bold text-text">
          {formatBookingNaira(subtotal)}
        </VemtapText>
      </View>
    </View>
  );
}

/** One day on the strip, generated from today rather than bundled copy. */
export interface BookingDateOption {
  /** `YYYY-MM-DD`, the value `GET /bookings/availability` takes. */
  id: string;
  /** Weekday, e.g. "Tue". */
  day: string;
  /** Day of month, e.g. "20". */
  date: string;
  /** Short note under the day, e.g. the month or "Today". */
  status?: string;
}

export function BookingDateStrip({
  dates,
  selected,
  onSelect,
}: {
  dates: BookingDateOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2.5">
      {dates.map(date => (
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

function dateCardStyle(selected: boolean) {
  return {
    backgroundColor: selected ? colors.primaryContainer : colors.surface,
    borderColor: selected ? colors.primaryContainer : colors.border,
    ...(selected ? shadowTokens.md : shadowTokens.none),
  };
}

function slotStyle(selected: boolean, taken: boolean) {
  return {
    backgroundColor: selected
      ? colors.primaryContainer
      : taken
        ? colors.surfaceContainer
        : colors.surface,
    borderColor: selected ? colors.primary : colors.border,
    opacity: taken ? 0.6 : 1,
  };
}

function DateCard({
  date,
  selected,
  onPress,
}: {
  date: BookingDateOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      // State lives in `style`, never `className`: a class that gains a shadow
      // when picked makes css-interop remount the card and drop the tap.
      className="w-16 shrink-0 items-center rounded-card border p-2.5"
      style={dateCardStyle(selected)}
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

/**
 * The server's slots for the day, straight off `GET /bookings/availability`.
 *
 * `available: false` renders exactly like the old `status: 'booked'` cells —
 * struck through and disabled — because that is what the API reports: a slot
 * someone else already holds, or one the branch cannot fit the service into.
 */
export function TimeSlotGrid({
  slots,
  selected,
  onSelect,
}: {
  slots: BookingSlot[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {slots.map(slot => {
        const isSelected = slot.time === selected;
        const isTaken = !slot.available;
        return (
          <Pressable
            key={slot.time}
            accessibilityRole="radio"
            accessibilityState={{
              checked: isSelected,
              disabled: isTaken,
            }}
            disabled={isTaken}
            onPress={() => onSelect(slot.time)}
            className="min-w-[30%] flex-1 items-center rounded-card border px-2 py-2.5"
            style={slotStyle(isSelected, isTaken)}
          >
            <VemtapText
              variant="labelMd"
              className={`${isSelected ? 'text-inverse' : 'text-text'} ${
                isTaken ? 'line-through' : ''
              }`}
            >
              {formatSlotClock(slot.time)}
            </VemtapText>
            <VemtapText
              className={`font-sans-semibold text-micro ${isSelected ? 'text-inverse' : isTaken ? 'text-text-tertiary' : 'text-success'}`}
            >
              {isTaken ? strings.booking.booked : strings.booking.available}
            </VemtapText>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Who the booking is for.
 *
 * Rows render only when the signed-in account actually has that value, so a
 * customer with no phone on file sees two rows, not a placeholder. The old
 * reminder switch is gone with the fabricated client card it sat under: no
 * endpoint stores a reminder preference, and a toggle that does nothing reads
 * as a setting.
 */
export function ClientInformation({
  name,
  phone,
  email,
}: {
  name?: string;
  phone?: string;
  email?: string;
}) {
  const rows: [string, string | undefined][] = [
    [strings.booking.fullName, name],
    [strings.booking.phoneNumber, phone],
    [strings.booking.email, email],
  ];
  const present = rows.filter(([, value]) => Boolean(value?.trim()));

  if (present.length === 0) return null;

  return (
    <View className="gap-3 rounded-card border border-border bg-surface p-4 shadow-sm">
      <View className="flex-row items-center justify-between border-b border-border pb-2">
        <View className="flex-row items-center gap-2">
          <Icon name="person" size={20} color={colors.primary} />
          <VemtapText variant="headingSm" className="text-text">
            {strings.booking.clientInformation}
          </VemtapText>
        </View>
      </View>
      {present.map(([label, value]) => (
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
    </View>
  );
}

/**
 * Price rows for a booking.
 *
 * No discount row: `POST /bookings` has no price of its own and no deal
 * attaches to a booking, so a "VEMTAP Deal Discount" line would be a number
 * nobody charged. The subtotal is the branch's price for the item and the
 * total is that same figure, which is the honest pair to show.
 */
export function BookingBreakdown({ subtotal }: { subtotal: number }) {
  return (
    <PriceBreakdown
      rows={[
        { label: strings.booking.servicesSubtotal, value: formatBookingNaira(subtotal) },
      ]}
      totalLabel={strings.bookingFlow.totalPayable}
      totalCaption={strings.bookingFlow.payAtBranch}
      total={formatBookingNaira(subtotal)}
    />
  );
}

/**
 * What to do on arrival.
 *
 * Generic steps with the booking's own reference filled in — the previous
 * copy named a specific street address, a valet service, a voucher code and a
 * "discounted total", none of which any endpoint reports about a booking.
 */
export function ArrivalGuide({ reference }: { reference?: string | null }) {
  const items = [
    {
      title: strings.bookingFlow.arriveTitle,
      body: strings.bookingFlow.arriveBody,
    },
    {
      title: strings.bookingFlow.referenceTitle,
      body: reference
        ? strings.bookingFlow.referenceBody(reference)
        : strings.bookingFlow.referenceBodyPending,
    },
    {
      title: strings.bookingFlow.settleTitle,
      body: strings.bookingFlow.settleBody,
    },
    {
      title: strings.bookingFlow.enjoyTitle,
      body: strings.bookingFlow.enjoyBody,
    },
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

/**
 * The success header. Shows the reference the server assigned, so the customer
 * can quote it at reception; a booking without one (the field is nullable)
 * shows the status chip instead of an empty "Booking Ref:".
 */
export function BookingSuccessState({
  reference,
  businessName,
}: {
  reference?: string | null;
  businessName?: string | null;
}) {
  return (
    <View className="items-center gap-3">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-tint">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-success-container shadow-sm">
          <Icon name="checkCircle" size={36} color={colors.badgeDiscountText} />
        </View>
      </View>
      <VemtapText
        accessibilityRole="header"
        variant="headingXl"
        className="text-center text-heading-xl text-text"
      >
        {strings.booking.confirmedTitle}
      </VemtapText>
      {businessName ? (
        <VemtapText variant="headingSm" tone="secondary" numberOfLines={1}>
          {businessName}
        </VemtapText>
      ) : null}
      <View className="flex-row flex-wrap justify-center gap-2">
        {reference ? (
          <View className="rounded-full bg-surface-container px-3 py-1">
            <VemtapText variant="labelSm" tone="secondary">
              {strings.booking.reference}{' '}
              <VemtapText className="text-text">{reference}</VemtapText>
            </VemtapText>
          </View>
        ) : null}
        <View className="rounded-full bg-success-container px-3 py-1">
          <VemtapText variant="labelSm" className="font-sans-medium text-success">
            {strings.bookingFlow.awaitingConfirmation}
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
