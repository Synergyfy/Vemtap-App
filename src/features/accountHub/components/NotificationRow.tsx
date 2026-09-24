import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

export type NotificationCategory = 'deals' | 'bookings' | 'rewards' | 'system';

export interface NotificationRowProps {
  icon: IconName;
  iconBackground: 'amber' | 'blue' | 'purple' | 'green' | 'system';
  title: string;
  time: string;
  body: string;
  unread?: boolean;
  merchantName?: string;
  merchantMeta?: string;
  merchantImage?: string;
  action?: string;
  actionTone?: 'primary' | 'secondary' | 'success';
  onPress?: () => void;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function NotificationRow({
  icon,
  iconBackground,
  title,
  time,
  body,
  unread = false,
  merchantName,
  merchantMeta,
  merchantImage,
  action,
  actionTone = 'primary',
  onPress,
  onAction,
  children,
}: NotificationRowProps) {
  const iconBackgroundClass = {
    amber: 'bg-tertiary-fixed',
    blue: 'bg-primary-fixed',
    purple: 'bg-secondary-fixed',
    green: 'bg-badge-discount-bg',
    system: 'bg-surface-container-highest',
  }[iconBackground];
  const iconColor = {
    amber: colors.tertiary,
    blue: colors.primary,
    purple: colors.secondary,
    green: colors.badgeDiscountText,
    system: colors.secondary,
  }[iconBackground];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`gap-3 rounded-card p-3.5 shadow-sm ${unread ? 'bg-surface' : 'bg-surface-muted opacity-90'}`}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={`h-11 w-11 shrink-0 items-center justify-center rounded-field ${iconBackgroundClass}`}
        >
          <Icon name={icon} size={24} color={iconColor} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-1">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              {unread ? (
                <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              ) : null}
              <VemtapText variant="headingSm" numberOfLines={1}>
                {title}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="tertiary" className="shrink-0">
              {time}
            </VemtapText>
          </View>
          <VemtapText tone="secondary" className="mt-1">
            {body}
          </VemtapText>
        </View>
      </View>
      {merchantName && merchantMeta && action ? (
        <View
          className={`flex-row items-center gap-2 rounded-lg p-2.5 ${actionTone === 'success' ? 'bg-badge-discount-bg' : 'bg-surface-muted'}`}
        >
          {merchantImage ? (
            <Image
              source={{ uri: merchantImage }}
              className="h-8 w-8 rounded-lg"
              resizeMode="cover"
            />
          ) : null}
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelSm" numberOfLines={1}>
              {merchantName}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone={actionTone === 'success' ? 'success' : 'secondary'}
              numberOfLines={1}
            >
              {merchantMeta}
            </VemtapText>
          </View>
          <Button
            label={action}
            size="sm"
            fullWidth={false}
            variant={
              actionTone === 'primary'
                ? 'primary'
                : actionTone === 'success'
                  ? 'success'
                  : 'secondary'
            }
            onPress={onAction}
            className="min-h-9 px-3"
          />
        </View>
      ) : null}
      {children}
    </Pressable>
  );
}
