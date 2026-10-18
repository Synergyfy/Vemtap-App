import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessModeMark,
  BusinessScreenLayout,
} from '@features/business/components/BusinessPrimitives';
import { BusinessBookingFeed } from '@features/business/components/BusinessBookingFeed';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';
import type { PresentedBooking } from '@features/business/hooks/useBusinessBookings';

cssInterop(Pressable, { className: 'style' });

const copy = strings.businessBookings;
const shell = strings.businessShell;

export interface BusinessBookingsHubScreenProps {
  onOpenBranchSwitcher?: () => void;
  onNewBooking?: () => void;
  onOpenOrders?: () => void;
  onOpenBooking?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  onOpenCalendar?: () => void;
  onOpenNotifications?: () => void;
  /** Live bookings from the route; `undefined` while they load. */
  bookings?: readonly PresentedBooking[];
  branchName?: string;
  orderTotal?: number;
  bookingTotal?: number;
  onSelectDay?: (date?: string) => void;
  onSelectFilter?: (filter: { status?: string; date?: string }) => void;
}

export function BusinessBookingsHubScreen({
  onOpenBranchSwitcher,
  onNewBooking,
  onOpenOrders,
  onOpenBooking,
  onCheckIn,
  onOpenCalendar,
  onOpenNotifications,
  bookings,
  branchName,
  orderTotal,
  bookingTotal,
  onSelectDay,
  onSelectFilter,
}: BusinessBookingsHubScreenProps) {
  const [switcher, setSwitcher] = useState(1);

  const switcherCounts: [string, string] = [
    String(orderTotal ?? 0),
    String(bookingTotal ?? 0),
  ];

  return (
    <BusinessScreenLayout
      header={{
        title: shell.tabs.orders,
        eyebrow: shell.modeLabel,
        centerTitle: false,
        leading: <BusinessModeMark label={shell.modeMark} />,
        showAvatar: true,
        actions: [
          {
            icon: 'notifications',
            label: shell.notificationsLabel,
            onPress: onOpenNotifications,
          },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.branchLabel}
          onPress={onOpenBranchSwitcher}
          className="min-w-0 flex-1 flex-row items-center gap-2 self-start rounded-full bg-surface-container-low px-3 py-1.5 active:scale-95"
        >
          <Icon name="locationOn" size={18} color={colors.primary} />
          <VemtapText
            variant="headingSm"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {branchName ?? copy.branchLabel}
          </VemtapText>
          <Icon name="expandMore" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.calendarLabel}
          onPress={onOpenCalendar}
          className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low active:scale-95"
        >
          <Icon name="calendar" size={20} color={colors.surfaceDark} />
        </Pressable>
        <Button
          label={copy.newBooking}
          labelVariant="labelSm"
          onPress={onNewBooking}
          leftIcon={<Icon name="plus" size={16} color={colors.surface} />}
          className="h-10 shrink-0 rounded-full px-3"
        />
      </View>

      <StatusPillTabs
        variant="switcher"
        labels={copy.switcher}
        counts={switcherCounts}
        selected={switcher}
        onSelect={index => {
          setSwitcher(index);
          if (index === 0) onOpenOrders?.();
        }}
      />

      <BusinessBookingFeed
        bookings={bookings}
        onOpenBooking={onOpenBooking}
        onCheckIn={onCheckIn}
        onSelectDay={onSelectDay}
        onSelectFilter={onSelectFilter}
      />
    </BusinessScreenLayout>
  );
}
