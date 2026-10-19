import React, { useState } from 'react';
import { Clipboard, Linking, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccountHeader,
  ActionGrid,
  PageScroll,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { useBooking, useCancelBooking } from '@features/booking/hooks/useBookings';
import { usePullToRefresh } from '@hooks/usePullToRefresh';
import { Avatar } from '@components/ui/Avatar';
import { showToast } from '@components/shared/toast';
import { RescheduleBookingSheet } from '@features/booking/components/RescheduleBookingSheet';
import { directionsUrl } from '@utils/geo';

const copy = strings.accountScreens.bookingDetail;

/** Booking statuses the customer may still cancel. */
const CANCELLABLE = ['booked', 'confirmed'];

function statusBadgeLabel(status?: string | null): string {
  // The API has no "confirmed" concept on the read path — it stores `booked`
  // (awaiting the business) or `confirmed` (the business acknowledged it).
  return status === 'confirmed' ? copy.confirmed : copy.booked;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * `2026-10-20` → "Tue, Oct 20, 2026". Hand-built like `formatWhen`, since
 * `en-NG` device locales render day-first and would show "Tue, 20 Oct".
 * Returns the raw value when unparseable so a malformed response never
 * blanks the row.
 */
function formatBookingDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return `${WEEKDAYS[parsed.getDay()]}, ${MONTHS[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`;
}

/**
 * `14:30` → "2:30 PM". Built manually so it stays 12-hour regardless of the
 * device locale (`en-NG` default is a 24h clock).
 */
function formatBookingTime(time: string): string {
  const parsed = new Date(`2000-01-01T${time.length === 5 ? `${time}:00` : time}`);
  if (Number.isNaN(parsed.getTime())) return time;
  const hour = parsed.getHours();
  return `${((hour + 11) % 12) + 1}:${String(parsed.getMinutes()).padStart(2, '0')} ${
    hour < 12 ? 'AM' : 'PM'
  }`;
}

function formatDuration(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts: string[] = [];
  if (hours) parts.push(`${hours} hr`);
  if (rest) parts.push(`${rest} mins`);
  return parts.join(' ');
}

export interface BookingDetailScreenProps {
  /** Booking UUID from `GET /me/bookings`. The `reference` code is not routable. */
  bookingId?: string;
  onBack?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onAddCalendar?: () => void;
  onCopy?: (value: string) => void;
  /** Overrides the in-app chat; by default `onOpenChat` gets the branch. */
  onChat?: () => void;
  /** Opens (or starts) the customer's chat with the booking's branch. */
  onOpenChat?: (target: { branchId: string; businessName: string }) => void;
  /** Opens the business's public profile, by its code. */
  onOpenBusiness?: (code: string) => void;
  /** Overrides dialling the branch. */
  onCall?: () => void;
  /** Overrides the built-in reschedule sheet. */
  onReschedule?: () => void;
  onCancel?: () => void;
}

/**
 * One booking, read live from `GET /bookings/:id`.
 *
 * Everything shown comes from the API. Fields the backend has no
 * representation for — ratings, a named therapist, add-on prices, a payment
 * method, a deal-pass code — are omitted rather than filled with design
 * numbers, so the screen never claims more than the record holds. The staff
 * picker behind "specialist" needs an endpoint that does not exist yet.
 */
export function BookingDetailScreen({
  bookingId,
  onBack,
  onShare,
  onMore,
  onAddCalendar,
  onCopy,
  onChat,
  onOpenChat,
  onOpenBusiness,
  onCall,
  onReschedule,
  onCancel,
}: BookingDetailScreenProps) {
  const booking = useBooking(bookingId);
  const [rescheduling, setRescheduling] = useState(false);
  const cancel = useCancelBooking();
  const refresh = usePullToRefresh([['bookings']]);

  const header = (
    <AccountHeader
      title={copy.title}
      onBack={onBack}
      onAction={onShare ?? onMore}
      actionIcon="share"
    />
  );

  if (!bookingId) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-background">
        {header}
        <PageScroll>
          <EmptyState
            title={copy.notFoundTitle}
            description={copy.notFoundBody}
            onAction={onBack}
            actionLabel={copy.notFoundAction}
          />
        </PageScroll>
      </SafeAreaView>
    );
  }

  if (booking.isLoading) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-background">
        {header}
        <LoadingState label={copy.loading} />
      </SafeAreaView>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-background">
        {header}
        <ErrorState
          title={copy.errorTitle}
          description={copy.errorBody}
          onRetry={() => booking.refetch()}
        />
      </SafeAreaView>
    );
  }

  const record = booking.data;
  const duration = formatDuration(record.durationMinutes);
  const canCancel = CANCELLABLE.includes(record.status ?? '');
  const { merchant } = record;
  const businessName = record.businessName ?? record.branchName ?? copy.merchantFallback;
  const address = [merchant?.address, merchant?.city, merchant?.state]
    .filter(Boolean)
    .join(', ');
  const mapsUrl = merchant ? directionsUrl({ ...merchant, address }) : null;
  const phone = merchant?.phone ?? null;

  const chat =
    onChat ??
    (record.branchId && onOpenChat
      ? () => onOpenChat({ branchId: record.branchId as string, businessName })
      : undefined);
  const call =
    onCall ??
    (() => {
      if (!phone) {
        showToast(copy.noPhone, 'info');
        return;
      }
      Linking.openURL(`tel:${phone}`).catch(() => undefined);
    });
  const copyReference = (value: string) => {
    if (onCopy) {
      onCopy(value);
      return;
    }
    Clipboard.setString(value);
    showToast(strings.businessProfilePreview.copied, 'success');
  };

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      {header}
      <PageScroll refreshControl={refresh.refreshControl}>
        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <View className="rounded-full bg-badge-discount-bg px-3 py-1">
              <VemtapText variant="labelSm" tone="success">
                ✓ {statusBadgeLabel(record.status)}
              </VemtapText>
            </View>
            {record.cancelledAt ? (
              <VemtapText variant="caption" tone="tertiary">
                {copy.cancelledOn} {formatBookingDate(record.cancelledAt.slice(0, 10))}
              </VemtapText>
            ) : null}
          </View>
          <View className="gap-2 rounded-field bg-surface-tint p-4">
            <VemtapText variant="caption" tone="secondary">
              DATE &amp; SCHEDULE
            </VemtapText>
            <VemtapText variant="bodyMd" className="font-sans-semibold">
              {formatBookingDate(record.date)}
            </VemtapText>
            <View className="flex-row items-center gap-2">
              <Icon name="schedule" size={18} color={colors.primary} />
              <VemtapText variant="labelSm" tone="secondary">
                {formatBookingTime(record.time)}
              </VemtapText>
              {duration ? (
                <>
                  <View className="h-1 w-1 rounded-full bg-outline" />
                  <VemtapText variant="caption" tone="tertiary">
                    {duration}
                  </VemtapText>
                </>
              ) : null}
            </View>
            <Button
              label={copy.calendar}
              labelVariant="labelSm"
              variant="secondary"
              size="sm"
              onPress={onAddCalendar}
              leftIcon={<Icon name="eventAvailable" size={18} color={colors.primary} />}
            />
          </View>
        </View>

        <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row items-center gap-3">
            <Avatar
              uri={merchant?.logoUrl ?? undefined}
              name={businessName}
              size="lg"
              tone="brand"
            />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="labelMd"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {businessName}
              </VemtapText>
              {record.branchName && record.branchName !== businessName ? (
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {record.branchName}
                </VemtapText>
              ) : null}
              {address ? (
                <VemtapText variant="caption" tone="tertiary" numberOfLines={2}>
                  {address}
                </VemtapText>
              ) : null}
            </View>
            {merchant?.businessCode && onOpenBusiness ? (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={copy.viewBusiness}
                hitSlop={8}
                onPress={() => onOpenBusiness(merchant.businessCode as string)}
                className="shrink-0 flex-row items-center"
              >
                <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                  {copy.viewBusiness}
                </VemtapText>
                <Icon name="forward" size={16} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>

          <View className="gap-2">
            <VemtapText variant="labelSm" tone="tertiary" className="uppercase">
              {copy.reservedService}
            </VemtapText>
            <View className="flex-row justify-between gap-3">
              <View className="min-w-0 flex-1">
                <VemtapText variant="bodyMd" className="font-sans-medium">
                  {record.itemName ?? copy.serviceFallback}
                </VemtapText>
                {duration ? (
                  <VemtapText variant="caption" tone="secondary">
                    {duration}
                  </VemtapText>
                ) : null}
              </View>
            </View>
          </View>

          {record.notes ? (
            <View className="gap-1 rounded-field bg-surface-subtle p-3">
              <VemtapText variant="labelSm" tone="tertiary" className="uppercase">
                {copy.notes}
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary">
                {record.notes}
              </VemtapText>
            </View>
          ) : null}
        </View>

        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row justify-between">
            <VemtapText variant="labelSm" tone="tertiary" className="uppercase">
              {copy.verification}
            </VemtapText>
            <VemtapText variant="caption" tone="brand">
              ✓ {copy.authenticated}
            </VemtapText>
          </View>
          {record.reference ? (
            <View className="flex-row items-center justify-between rounded-field bg-surface-subtle p-3">
              <View>
                <VemtapText variant="caption" tone="secondary">
                  {copy.reference}
                </VemtapText>
                <VemtapText variant="labelMd" className="font-sans-bold">
                  {record.reference}
                </VemtapText>
              </View>
              <Button
                label={copy.copy}
                labelVariant="labelSm"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => copyReference(record.reference as string)}
                leftIcon={<Icon name="copy" size={16} color={colors.primary} />}
              />
            </View>
          ) : null}
        </View>

        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row justify-between gap-2">
            <VemtapText
              variant="bodyMd"
              className="min-w-0 flex-1 font-sans-semibold"
              numberOfLines={2}
            >
              {copy.location}
            </VemtapText>
            <VemtapText variant="labelSm" tone="secondary" className="shrink-0">
              {record.branchName ?? copy.merchantFallback}
            </VemtapText>
          </View>
          {address ? (
            <View className="flex-row items-start gap-2">
              <Icon name="locationOn" size={18} color={colors.primary} />
              <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
                {address}
              </VemtapText>
            </View>
          ) : null}
          <ActionGrid
            actions={[
              { label: copy.chat, icon: 'message', onPress: chat },
              { label: copy.call, icon: 'phone', onPress: call },
              ...(mapsUrl
                ? [
                    {
                      label: copy.directions,
                      icon: 'nearMe' as const,
                      onPress: () => {
                        Linking.openURL(mapsUrl).catch(() => undefined);
                      },
                    },
                  ]
                : []),
            ]}
          />
        </View>

        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row gap-2">
            <Icon name="info" size={20} color={colors.secondary} />
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.policy}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.policyBody}
              </VemtapText>
            </View>
          </View>
          {canCancel ? (
            <Button
              label={copy.reschedule}
              variant="secondary"
              onPress={onReschedule ?? (() => setRescheduling(true))}
              labelVariant="labelMd"
            />
          ) : null}
          {canCancel ? (
            <Pressable
              accessibilityRole="button"
              disabled={cancel.isPending}
              onPress={() => cancel.mutate({ id: record.id }, { onSuccess: onCancel })}
              className="items-center rounded-field py-3"
            >
              <VemtapText variant="labelMd" tone="error">
                {cancel.isPending ? copy.cancelling : copy.cancel}
              </VemtapText>
            </Pressable>
          ) : (
            <VemtapText variant="caption" tone="tertiary">
              {copy.cancelUnavailable}
            </VemtapText>
          )}
        </View>
      </PageScroll>
      <RescheduleBookingSheet
        visible={rescheduling}
        onClose={() => setRescheduling(false)}
        booking={record}
        onRescheduled={() => showToast(copy.rescheduled, 'success')}
      />
    </SafeAreaView>
  );
}
