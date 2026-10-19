import React from 'react';
import { Alert, View } from 'react-native';
import { Avatar } from '@components/ui/Avatar';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { TwoColumnGrid } from '@components/shared/TwoColumnGrid';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessActionTile,
  BusinessScreenLayout,
  BusinessSectionHeading,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import type { Booking } from '@api/bookingsApi';
import { formatBookingSlot } from '@utils/formatters';

const copy = strings.businessBookingDetail;

const STATUS_LABELS: Record<string, string> = {
  booked: copy.statusBooked,
  confirmed: copy.statusConfirmed,
  completed: copy.statusCompleted,
  cancelled: copy.statusCancelled,
};

/** What the business can do next from each status (`PATCH /bookings/:id/status`). */
const NEXT_ACTIONS: Record<string, ('confirmed' | 'completed' | 'cancelled')[]> = {
  booked: ['confirmed', 'completed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export interface BusinessBookingDetailScreenProps {
  onBack: () => void;
  /** Live booking from `GET /bookings/:id`; absent while it loads. */
  booking?: Booking;
  isError?: boolean;
  onRetry?: () => void;
  onChangeStatus?: (status: 'confirmed' | 'completed' | 'cancelled') => void;
  /** A status change is in flight. */
  updating?: boolean;
  onCallCustomer?: () => void;
  onChatCustomer?: () => void;
}

/**
 * One booking, for the business. Opens from the Orders hub's Bookings tab and
 * the Bookings screen. Bookings used to open the order screen with a booking
 * id, which 404'd. Shows who booked, what and when, and the status actions the
 * server allows from here.
 */
export function BusinessBookingDetailScreen({
  onBack,
  booking,
  isError,
  onRetry,
  onChangeStatus,
  updating = false,
  onCallCustomer,
  onChatCustomer,
}: BusinessBookingDetailScreenProps) {
  const header = {
    title: copy.title,
    titleVariant: 'labelMd' as const,
    onBack,
    showAvatar: true,
  };

  if (!booking) {
    return (
      <BusinessScreenLayout header={header} contentContainerClassName="pb-8">
        {isError ? <ErrorState onRetry={onRetry} /> : <LoadingState />}
      </BusinessScreenLayout>
    );
  }

  const status = (booking.status ?? 'booked').toLowerCase();
  const customerName =
    [booking.customer?.firstName, booking.customer?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || copy.walkInGuest;
  const contact = [booking.customer?.phone, booking.customer?.email]
    .filter(Boolean)
    .join(' • ');
  const next = NEXT_ACTIONS[status] ?? [];

  const confirmCancel = () =>
    Alert.alert(copy.cancelTitle, copy.cancelBody, [
      { text: copy.cancelKeep, style: 'cancel' },
      {
        text: copy.cancelConfirm,
        style: 'destructive',
        onPress: () => onChangeStatus?.('cancelled'),
      },
    ]);

  const actions = next.map(target =>
    target === 'confirmed'
      ? {
          id: target,
          label: copy.confirm,
          icon: 'checkCircle' as IconName,
          tone: 'primary' as const,
          onPress: () => onChangeStatus?.('confirmed'),
        }
      : target === 'completed'
        ? {
            id: target,
            label: copy.checkIn,
            icon: 'eventAvailable' as IconName,
            tone: 'brand' as const,
            onPress: () => onChangeStatus?.('completed'),
          }
        : {
            id: target,
            label: copy.cancel,
            icon: 'close' as IconName,
            tone: 'errorContainer' as const,
            onPress: confirmCancel,
          },
  );

  return (
    <BusinessScreenLayout header={header} contentContainerClassName="pb-8">
      <View className="rounded-card-lg bg-surface-tint p-4 shadow-sm">
        <View className="flex-row items-center gap-2">
          <Icon name="eventAvailable" size={18} color={colors.primary} />
          <VemtapText
            variant="labelSm"
            tone="brand"
            className="font-sans-semibold uppercase"
          >
            {STATUS_LABELS[status] ?? status}
          </VemtapText>
        </View>
        <VemtapText variant="labelMd" className="mt-2 font-sans-semibold">
          {formatBookingSlot(booking.date, booking.time)}
        </VemtapText>
        {booking.branchName ? (
          <VemtapText variant="caption" tone="secondary" className="mt-0.5">
            {booking.branchName}
          </VemtapText>
        ) : null}
      </View>

      <SetupCard className="mt-4 gap-3">
        <BusinessSectionHeading
          title={copy.customerSectionTitle}
          titleVariant="labelMd"
          icon="person"
        />
        <View className="flex-row items-center gap-3">
          <Avatar
            uri={booking.customer?.avatar ?? undefined}
            name={customerName}
            size="lg"
            tone="brand"
            className="bg-surface-container"
          />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {customerName}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {contact || '—'}
            </VemtapText>
          </View>
        </View>
        <TwoColumnGrid
          items={[
            {
              id: 'call',
              label: copy.callCustomer,
              icon: 'phone' as IconName,
              onPress: onCallCustomer,
            },
            {
              id: 'chat',
              label: copy.chat,
              icon: 'message' as IconName,
              onPress: onChatCustomer,
            },
          ]}
          keyExtractor={item => item.id}
          renderItem={item => (
            <BusinessActionTile
              label={item.label}
              icon={item.icon}
              size="sm"
              tone={item.id === 'call' ? 'neutral' : 'brand'}
              onPress={item.onPress}
            />
          )}
        />
      </SetupCard>

      <SetupCard className="mt-4 gap-3">
        <BusinessSectionHeading
          title={copy.appointmentTitle}
          titleVariant="labelMd"
          icon="spa"
        />
        <DetailRow
          label={copy.service}
          value={booking.itemName ?? copy.serviceFallback}
        />
        <DetailRow
          label={copy.when}
          value={formatBookingSlot(booking.date, booking.time)}
        />
        {booking.durationMinutes ? (
          <DetailRow
            label={copy.duration}
            value={copy.durationMinutes(booking.durationMinutes)}
          />
        ) : null}
        {booking.reference ? (
          <DetailRow label={copy.reference} value={booking.reference} />
        ) : null}
        {booking.notes ? (
          <View className="gap-1 rounded-field bg-surface-subtle p-3">
            <VemtapText variant="caption" tone="tertiary">
              {copy.notes}
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary">
              {booking.notes}
            </VemtapText>
          </View>
        ) : null}
        {status === 'cancelled' && booking.cancellationReason ? (
          <DetailRow label={copy.cancelledReason} value={booking.cancellationReason} />
        ) : null}
      </SetupCard>

      {actions.length > 0 ? (
        <SetupCard className="mt-4 gap-3">
          <BusinessSectionHeading
            title={copy.actionsTitle}
            titleVariant="labelMd"
            icon="bolt"
          />
          <TwoColumnGrid
            items={actions}
            keyExtractor={item => item.id}
            renderItem={item => (
              <BusinessActionTile
                label={item.label}
                icon={item.icon}
                size="sm"
                tone={item.tone}
                onPress={updating ? undefined : item.onPress}
              />
            )}
          />
        </SetupCard>
      ) : null}
    </BusinessScreenLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <VemtapText variant="caption" tone="secondary">
        {label}
      </VemtapText>
      <VemtapText
        variant="labelMd"
        className="min-w-0 flex-1 text-right font-sans-medium"
      >
        {value}
      </VemtapText>
    </View>
  );
}
