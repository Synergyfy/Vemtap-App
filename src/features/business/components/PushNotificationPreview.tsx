import React from 'react';
import { View } from 'react-native';
import { VemtapText } from '@components/ui/Text';

export interface PushNotificationPreviewProps {
  app: string;
  time: string;
  title: string;
  body: string;
}

/**
 * A push notification as it lands on a customer's lock screen. One owner for
 * the boost preview step's "Push Notice" tab and the Campaigns hub's
 * "Preview Push".
 */
export function PushNotificationPreview({
  app,
  time,
  title,
  body,
}: PushNotificationPreviewProps) {
  return (
    <View className="flex-row gap-2.5 rounded-card bg-surface p-3">
      <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
        <VemtapText variant="labelMd" className="font-sans-bold text-primary-foreground">
          V
        </VemtapText>
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={1}>
            {app}
          </VemtapText>
          <VemtapText variant="caption" tone="tertiary" className="shrink-0">
            {time}
          </VemtapText>
        </View>
        <VemtapText variant="labelSm" className="font-sans-semibold" numberOfLines={2}>
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary">
          {body}
        </VemtapText>
      </View>
      <View className="h-12 w-12 shrink-0 rounded-field bg-surface-subtle" />
    </View>
  );
}
