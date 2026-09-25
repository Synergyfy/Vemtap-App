import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import {
  NotificationRow,
  type NotificationCategory,
} from '@features/accountHub/components/NotificationRow';
import { StatusPillTabs } from '@features/accountHub/components/HubPrimitives';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

const copy = strings.notificationsCenter;
const images = {
  grill:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDHKVPsXGSKQzTHPV1aIyWPclujpy2Zr3QbpAJIoYuTWil5GC2bb5tcW-4vSQ1baWlrQlZLmQietjI9ZFjv7wrjW2GKdaXKn-CegdzG_Zilegj-A5rOyFVFH_8v97OX0PJaq0FC0Z0Xqp_4_1fu7TDGJYZIvw6nNmA60U81Mp8bTCxH8uTeSVSs8zyLIEzsRslMmcSbKhfMMcPfsEagNDCkgEeE5fUTiZlPCpkuFBH2_VK0jRPWfwsu_w',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxT_2alTl_vSlWPJiyXlqUWOVg9X823Rzuf08NvaCiUeCBkmPZkuuhkkZnpfvC1Wa1A6p7uaLW7xbQ8VVEaIIfhfrgcu5oITEyLPL_U6pmtRYNkPr7HFhElX9sHYb4WXLxXfk6nY5wRZcLgE_P4WoYEE4Ojo4m9ygMETuHpQIZEIvQLznNCwI6n4LuEZ2hHrRQkbD1r562EM6AQSswN7RVC0KCXY_1KhkUDtd0hCoXIaNp8ZE-RanEfQ',
  cafe: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA61Izv9pEZ9O6CpWwLkcC3OzLM_I2hGQNAVPIMF2ldbvZjDCj-a82gLSEEewaN4q06L8qcgfdhLge7SJLn8RLDwxOoAx8RZPs46n1PVJg1z78p8jNUul4OOsB_5W-w6cbWQe2M9PuArOuXWWccT8waQ1M0O8c1cX9IKaN2T1AC9FrbwXAnBTR5iKQAs_qEbTij7Nxy3m1A2F297csjUFLmUzcLSX7VXKw8MKFnuOOV9_CXyJLWAQZoGw',
};

interface NotificationEntry {
  id: string;
  category: NotificationCategory;
  icon: 'hourglass' | 'spa' | 'gift' | 'trophy' | 'announcement';
  iconBackground: 'amber' | 'blue' | 'purple' | 'green' | 'system';
  title: string;
  time: string;
  body: string;
  unread: boolean;
  merchantName?: string;
  merchantMeta?: string;
  merchantImage?: string;
  action?: string;
  actionTone?: 'primary' | 'secondary' | 'success';
}

const categories: Array<NotificationCategory | 'all'> = [
  'all',
  'deals',
  'bookings',
  'rewards',
  'system',
];

const initialEntries: NotificationEntry[] = [
  {
    id: 'expiry',
    category: 'deals',
    icon: 'hourglass',
    iconBackground: 'amber',
    title: copy.expiryTitle,
    time: copy.expiryTime,
    body: copy.expiryBody,
    unread: true,
    merchantName: copy.expiryMerchant,
    merchantMeta: copy.expiryMeta,
    merchantImage: images.grill,
    action: copy.expiryAction,
  },
  {
    id: 'booking',
    category: 'bookings',
    icon: 'spa',
    iconBackground: 'blue',
    title: copy.bookingTitle,
    time: copy.bookingTime,
    body: copy.bookingBody,
    unread: true,
    merchantName: copy.bookingMeta,
    merchantMeta: copy.bookingLocation,
    merchantImage: images.spa,
    action: copy.bookingAction,
    actionTone: 'secondary',
  },
  {
    id: 'gift',
    category: 'deals',
    icon: 'gift',
    iconBackground: 'purple',
    title: copy.giftTitle,
    time: copy.giftDate,
    body: copy.giftBody,
    unread: true,
    merchantName: copy.giftMeta,
    merchantMeta: copy.giftSubtitle,
    merchantImage: images.cafe,
    action: copy.giftAction,
    actionTone: 'success',
  },
  {
    id: 'reward',
    category: 'rewards',
    icon: 'trophy',
    iconBackground: 'green',
    title: copy.rewardTitle,
    time: copy.rewardDate,
    body: copy.rewardBody,
    unread: false,
  },
  {
    id: 'system',
    category: 'system',
    icon: 'announcement',
    iconBackground: 'system',
    title: copy.systemTitle,
    time: copy.systemDate,
    body: copy.systemBody,
    unread: false,
  },
];

export interface NotificationsCenterScreenProps {
  onBack?: () => void;
  onMore?: () => void;
  onManagePreferences?: () => void;
  onOpenNotification?: (id: string) => void;
  onNotificationAction?: (id: string) => void;
}

export function NotificationsCenterScreen({
  onBack,
  onMore,
  onManagePreferences,
  onOpenNotification,
  onNotificationAction,
}: NotificationsCenterScreenProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [filter, setFilter] = useState(0);
  const unread = entries.filter(item => item.unread).length;
  const visible = useMemo(
    () =>
      filter === 0
        ? entries
        : entries.filter(item => item.category === categories[filter]),
    [entries, filter],
  );
  const today = visible.filter(item => item.id === 'expiry' || item.id === 'booking');
  const earlier = visible.filter(item => !today.includes(item));

  const markAllRead = () =>
    setEntries(current => current.map(item => ({ ...item, unread: false })));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <RegistrationHeader
        title={copy.title}
        onBack={() => onBack?.()}
        showMoreAction
        onMore={onMore}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <VemtapText variant="headingXl" className="text-heading-xl" numberOfLines={1}>
              {copy.inbox}
            </VemtapText>
            <View
              className={`shrink-0 rounded-full px-2 py-0.5 shadow-sm ${unread ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <VemtapText
                variant="caption"
                className={unread ? 'text-primary-foreground' : 'text-text-secondary'}
              >
                {unread ? copy.unread : copy.zeroNew}
              </VemtapText>
            </View>
          </View>
          <Button
            label={unread ? copy.allRead : copy.caughtUp}
            variant="ghost"
            size="sm"
            fullWidth={false}
            disabled={!unread}
            leftIcon={
              <Icon
                name={unread ? 'doneAll' : 'check'}
                size={17}
                color={unread ? colors.primary : colors.textTertiary}
              />
            }
            onPress={markAllRead}
          />
        </View>
        <View className="-mx-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-4"
          >
            <StatusPillTabs
              labels={copy.filters.map((label, index) =>
                copy.counts[index] ? `${label} ${copy.counts[index]}` : label,
              )}
              selected={filter}
              onSelect={setFilter}
            />
          </ScrollView>
        </View>
        {visible.length === 0 ? (
          <View className="items-center px-4 py-12">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
              <Icon name="doNotDisturb" size={32} color={colors.secondary} />
            </View>
            <VemtapText variant="headingSm" className="mt-3 text-center">
              {copy.caughtUpTitle}
            </VemtapText>
            <VemtapText tone="secondary" className="mt-1 text-center">
              {copy.caughtUpBody}
            </VemtapText>
          </View>
        ) : (
          <>
            {today.length ? (
              <NotificationSection
                title={copy.today}
                count={copy.todayCount}
                entries={today}
                onOpen={onOpenNotification}
                onAction={onNotificationAction}
              />
            ) : null}
            {earlier.length ? (
              <NotificationSection
                title={copy.earlier}
                count={copy.earlierCount}
                entries={earlier}
                onOpen={onOpenNotification}
                onAction={onNotificationAction}
              />
            ) : null}
          </>
        )}
        <View className="gap-3 pt-3">
          <Button
            label={copy.preferences}
            variant="secondary"
            onPress={onManagePreferences}
            leftIcon={<Icon name="tune" size={19} color={colors.secondary} />}
            rightIcon={<Icon name="forward" size={18} color={colors.textTertiary} />}
          />
          <VemtapText variant="caption" tone="tertiary" className="text-center">
            {copy.tailored}
          </VemtapText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationSection({
  title,
  count,
  entries,
  onOpen,
  onAction,
}: {
  title: string;
  count: string;
  entries: NotificationEntry[];
  onOpen?: (id: string) => void;
  onAction?: (id: string) => void;
}) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between px-1">
        <VemtapText
          variant="labelSm"
          tone="tertiary"
          className="uppercase tracking-wider"
        >
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="tertiary">
          {count}
        </VemtapText>
      </View>
      {entries.map(item => (
        <NotificationRow
          key={item.id}
          icon={item.icon}
          iconBackground={item.iconBackground}
          title={item.title}
          time={item.time}
          body={item.body}
          unread={item.unread}
          merchantName={item.merchantName}
          merchantMeta={item.merchantMeta}
          merchantImage={item.merchantImage}
          action={item.action}
          actionTone={item.actionTone}
          onPress={() => onOpen?.(item.id)}
          onAction={() => onAction?.(item.id)}
        >
          {item.id === 'reward' ? (
            <View className="gap-1.5 rounded-lg bg-surface p-2.5">
              <View className="flex-row justify-between gap-2">
                <VemtapText variant="caption" tone="secondary">
                  {copy.tierProgress}
                </VemtapText>
                <VemtapText variant="caption" tone="brand">
                  {copy.points}
                </VemtapText>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                <View className="h-full w-[65%] rounded-full bg-primary" />
              </View>
            </View>
          ) : item.id === 'system' ? (
            <View className="flex-row items-center gap-1.5 px-1">
              <Icon name="nearMe" size={16} color={colors.primary} />
              <VemtapText variant="labelSm" tone="brand">
                {copy.systemLocation}
              </VemtapText>
            </View>
          ) : null}
        </NotificationRow>
      ))}
    </View>
  );
}
