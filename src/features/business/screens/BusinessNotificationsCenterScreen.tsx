import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { EmptyState } from '@components/shared/EmptyState';
import { colors } from '@theme/colors';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessIconWell,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  businessNotifications,
  notificationCategoryIcon,
  notificationToneIcon,
  notificationToneTile,
  type NotificationCategoryId,
} from '@features/business/data/businessTrustSettingsData';

const copy = strings.businessNotificationsCenter;

export interface BusinessNotificationsCenterScreenProps {
  onBack?: () => void;
  onOpenProfile?: () => void;
  onMarkAllRead?: () => void;
  onOpenCategory?: (categoryId: NotificationCategoryId) => void;
  onOpenNotification?: (notificationId: string) => void;
  onConfigureDispatch?: () => void;
}

/**
 * Notification center: category chips with counts, then a feed of deal, POS,
 * feedback, billing and sync alerts. Each row keeps its kind, time, stat and
 * CTA, and unread rows carry a live dot.
 */
export function BusinessNotificationsCenterScreen({
  onBack,
  onOpenProfile,
  onMarkAllRead,
  onOpenCategory,
  onOpenNotification,
  onConfigureDispatch,
}: BusinessNotificationsCenterScreenProps) {
  const [category, setCategory] = useState<NotificationCategoryId>('all');
  const [readIds, setReadIds] = useState<string[]>([]);

  const visible =
    category === 'all'
      ? businessNotifications
      : businessNotifications.filter(item => item.categories.includes(category));
  const unread = businessNotifications.filter(
    item => item.unread && !readIds.includes(item.id),
  ).length;

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Icon name="notificationsActive" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            className="min-w-0 flex-1 font-sans-semibold"
            numberOfLines={1}
          >
            {unread > 0 ? copy.unreadLabel.replace('2', String(unread)) : copy.emptyTitle}
          </VemtapText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.markAllRead}
          onPress={() => {
            setReadIds(businessNotifications.map(item => item.id));
            onMarkAllRead?.();
          }}
          className="min-h-9 shrink-0 flex-row items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 active:scale-95"
        >
          <Icon name="tune" size={15} color={colors.textSecondary} />
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-text-secondary"
            numberOfLines={1}
          >
            {copy.markAllRead}
          </VemtapText>
        </Pressable>
      </View>

      <BusinessChipScroller className="mt-3">
        {copy.categories.map(item => (
          <BusinessCountChip
            key={item.id}
            label={item.label}
            icon={notificationCategoryIcon[item.id]}
            count={item.count}
            selected={item.id === category}
            onPress={() => {
              setCategory(item.id);
              onOpenCategory?.(item.id);
            }}
          />
        ))}
      </BusinessChipScroller>

      <View className="mt-3 gap-2">
        {visible.map(item => {
          const isUnread = item.unread && !readIds.includes(item.id);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => {
                setReadIds(ids => (ids.includes(item.id) ? ids : [...ids, item.id]));
                onOpenNotification?.(item.id);
              }}
              className="gap-2 rounded-card bg-surface p-3 shadow-sm active:bg-surface-subtle"
            >
              <View className="flex-row items-center gap-2.5">
                <View
                  className={`h-9 w-9 shrink-0 items-center justify-center rounded-lg ${notificationToneTile[item.iconTone]}`}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    color={notificationToneIcon[item.iconTone]}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="caption"
                    className="text-text-tertiary"
                    numberOfLines={1}
                  >
                    {`${copy.kinds[item.kind]} • ${item.time}`}
                  </VemtapText>
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={2}
                  >
                    {item.title}
                  </VemtapText>
                </View>
                {isUnread ? (
                  <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                ) : null}
              </View>

              <VemtapText
                variant="caption"
                tone="secondary"
                className="leading-relaxed"
                numberOfLines={3}
              >
                {item.body}
              </VemtapText>

              {item.stat ? (
                <View className="flex-row flex-wrap items-baseline gap-1.5 rounded-field bg-surface-subtle p-2.5">
                  {item.stat.label ? (
                    <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                      {item.stat.label}
                    </VemtapText>
                  ) : null}
                  <VemtapText
                    variant="headingSm"
                    className="font-sans-bold text-primary"
                    numberOfLines={1}
                  >
                    {item.stat.value}
                  </VemtapText>
                  {item.stat.trend ? (
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {item.stat.trend}
                    </VemtapText>
                  ) : null}
                </View>
              ) : null}

              {item.footnote ? (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                  <VemtapText
                    variant="caption"
                    className="min-w-0 flex-1 text-badge-discount-text"
                    numberOfLines={1}
                  >
                    {item.footnote}
                  </VemtapText>
                </View>
              ) : null}

              <View className="flex-row items-center justify-end gap-1">
                <VemtapText
                  variant="labelSm"
                  className="font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {item.cta}
                </VemtapText>
                <Icon name="forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {visible.length === 0 ? (
        <EmptyState
          icon="notificationsActive"
          variant="contained"
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : null}

      <View className="mt-3 gap-2 rounded-card bg-surface p-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <BusinessIconWell icon="notificationsActive" tone="brand" size="md" />
          <View className="min-w-0 flex-1">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={1}
            >
              {copy.dispatchTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
              {copy.dispatchBody}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-2 rounded-field bg-surface-subtle p-2.5">
          <VemtapText
            variant="labelSm"
            className="min-w-0 flex-1 font-sans-semibold text-primary"
            numberOfLines={2}
          >
            {copy.dispatchCta}
          </VemtapText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.dispatchCta}
            onPress={onConfigureDispatch}
            className="shrink-0"
          >
            <Icon name="forward" size={18} color={colors.primary} />
          </Pressable>
        </View>
        <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
          {copy.dispatchFooter}
        </VemtapText>
      </View>
    </BusinessScreenLayout>
  );
}
