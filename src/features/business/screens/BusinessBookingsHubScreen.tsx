import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessModeMark,
  BusinessScreenLayout,
  BusinessSelectionChip,
} from '@features/business/components/BusinessPrimitives';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

const copy = strings.businessBookings;
const shell = strings.businessShell;

type BookingTone = (typeof copy.bookings)[number]['tone'];

const toneStyles: Record<
  BookingTone,
  { time: string; duration: string; accent: string }
> = {
  brand: {
    time: 'text-primary',
    duration: 'bg-surface-tint text-primary',
    accent: 'border-l-4 border-primary',
  },
  neutral: {
    time: 'text-text-primary',
    duration: 'bg-surface-container text-text-secondary',
    accent: '',
  },
  tertiary: {
    time: 'text-tertiary',
    duration: 'bg-tertiary-fixed text-tertiary',
    accent: '',
  },
};

const badgeStyles: Record<string, string> = {
  VIP: 'bg-primary text-primary-foreground',
  Confirmed: 'bg-badge-discount-bg text-badge-discount-text',
  Reserved: 'bg-surface-tint-blue text-primary',
};

export interface BusinessBookingsHubScreenProps {
  onOpenBranchSwitcher?: () => void;
  onNewBooking?: () => void;
  onOpenOrders?: () => void;
  onOpenBooking?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  onOpenCalendar?: () => void;
  onOpenNotifications?: () => void;
}

export function BusinessBookingsHubScreen({
  onOpenBranchSwitcher,
  onNewBooking,
  onOpenOrders,
  onOpenBooking,
  onCheckIn,
  onOpenCalendar,
  onOpenNotifications,
}: BusinessBookingsHubScreenProps) {
  const [switcher, setSwitcher] = useState(1);
  const [day, setDay] = useState(0);
  const [filter, setFilter] = useState(0);

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
          accessibilityLabel={copy.branch}
          onPress={onOpenBranchSwitcher}
          className="min-w-0 flex-1 flex-row items-center gap-2 self-start rounded-full bg-surface-container-low px-3 py-1.5 active:scale-95"
        >
          <Icon name="locationOn" size={18} color={colors.primary} />
          <VemtapText
            variant="headingSm"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {copy.branch}
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
        counts={copy.switcherCounts}
        selected={switcher}
        onSelect={index => {
          setSwitcher(index);
          if (index === 0) onOpenOrders?.();
        }}
      />

      <View className="-mx-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-6 py-1"
        >
          {copy.days.map((item, index) => {
            const isSelected = index === day;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${item.day} ${item.date} ${item.month}`}
                onPress={() => setDay(index)}
                className={cn(
                  'min-w-[62px] items-center justify-center rounded-lg px-2 py-1 active:scale-95',
                  isSelected ? 'bg-primary' : 'bg-surface-container-low',
                )}
              >
                <VemtapText
                  variant="caption"
                  className={cn(
                    'uppercase',
                    isSelected ? 'text-surface' : 'text-text-tertiary',
                  )}
                  numberOfLines={1}
                >
                  {item.day}
                </VemtapText>
                <VemtapText
                  variant="headingSm"
                  className={cn(
                    'font-sans-semibold',
                    isSelected ? 'text-surface' : 'text-text-primary',
                  )}
                >
                  {item.date}
                </VemtapText>
                <VemtapText
                  variant="caption"
                  className={cn(isSelected ? 'text-surface' : 'text-text-secondary')}
                  numberOfLines={1}
                >
                  {item.month}
                </VemtapText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="-mx-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-6 py-1"
        >
          {copy.filters.map((item, index) => (
            <BusinessSelectionChip
              key={`${item.label}-${item.count}`}
              label={`${item.label} ${item.count}`}
              selected={index === filter}
              onPress={() => setFilter(index)}
              tone="brand"
              plain
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-row items-center gap-3 rounded-card bg-surface-container-low p-3.5">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
          <Icon name="calendar" size={20} color={colors.surface} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
            {copy.summaryTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
            {`${copy.summaryMetaLabel} `}
            <VemtapText variant="caption" className="font-sans-semibold text-primary">
              {copy.summaryMeta}
            </VemtapText>
            {` ${copy.summaryMetaHint}`}
          </VemtapText>
        </View>
      </View>

      <View className="gap-3">
        {copy.bookings.map(booking => {
          const tone = toneStyles[booking.tone];
          return (
            <Pressable
              key={booking.id}
              accessibilityRole="button"
              accessibilityLabel={`${booking.time} ${booking.customer}`}
              onPress={() => onOpenBooking?.(booking.id)}
              className={cn(
                'flex-row items-center gap-3 rounded-card bg-surface-container-lowest p-3 shadow-sm',
                tone.accent,
              )}
            >
              <View className="w-[62px] shrink-0 items-center gap-1">
                <VemtapText
                  variant="labelMd"
                  className={cn('font-sans-bold', tone.time)}
                  numberOfLines={1}
                >
                  {booking.time}
                </VemtapText>
                <View
                  className={cn(
                    'flex-row items-center gap-1 rounded-lg px-1.5 py-0.5',
                    tone.duration,
                  )}
                >
                  {booking.startsSoon ? (
                    <Icon name="timer" size={12} color={colors.primary} />
                  ) : null}
                  <VemtapText
                    variant="micro"
                    className="font-sans-medium"
                    numberOfLines={1}
                  >
                    {booking.duration}
                  </VemtapText>
                </View>
              </View>

              <View className="min-w-0 flex-1 gap-1">
                <View className="min-w-0 flex-row items-center gap-1.5">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {booking.customer}
                  </VemtapText>
                  {booking.badge ? (
                    <View
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5',
                        badgeStyles[booking.badge] ??
                          'bg-surface-container text-text-secondary',
                      )}
                    >
                      <VemtapText
                        variant="micro"
                        className={cn(
                          'font-sans-semibold',
                          badgeStyles[booking.badge] ? '' : 'text-text-secondary',
                        )}
                      >
                        {booking.badge}
                      </VemtapText>
                    </View>
                  ) : null}
                </View>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {`${booking.service} \u00b7 ${booking.staff}`}
                </VemtapText>
                {booking.note ? (
                  <VemtapText
                    variant="caption"
                    className="text-tertiary"
                    numberOfLines={1}
                  >
                    {booking.note}
                  </VemtapText>
                ) : null}
              </View>

              {booking.cta ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={booking.cta}
                  onPress={() => onCheckIn?.(booking.id)}
                  className="h-9 shrink-0 flex-row items-center gap-1.5 rounded-full bg-primary px-3 active:scale-95"
                >
                  <Icon name="checkIn" size={16} color={colors.surface} />
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold text-surface"
                  >
                    {booking.cta}
                  </VemtapText>
                </Pressable>
              ) : null}
              <Icon name="forward" size={18} color={colors.textTertiary} />
            </Pressable>
          );
        })}
      </View>
    </BusinessScreenLayout>
  );
}
