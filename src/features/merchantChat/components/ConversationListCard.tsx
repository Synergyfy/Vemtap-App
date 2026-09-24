import React from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

export interface ConversationListCardProps {
  image: ImageSourcePropType;
  name: string;
  time: string;
  message: string;
  context: string;
  contextIcon: IconName;
  unread?: number;
  online?: boolean;
  verified?: boolean;
  sender?: string;
  onPress: () => void;
}

export function ConversationListCard({
  image,
  name,
  time,
  message,
  context,
  contextIcon,
  unread = 0,
  online = false,
  verified = false,
  sender = '',
  onPress,
}: ConversationListCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      className="w-full flex-row gap-3 rounded-xl bg-surface p-4 shadow-sm active:bg-surface-container-low"
    >
      <View className="relative h-[52px] w-[52px] shrink-0">
        <Image
          source={image}
          className="h-full w-full rounded-full bg-surface-container"
        />
        {online ? (
          <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
        ) : null}
      </View>
      <View className="min-w-0 flex-1 justify-center">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-row items-center gap-1">
            <VemtapText variant="headingSm" numberOfLines={1} className="min-w-0 flex-1">
              {name}
            </VemtapText>
            {verified ? <Icon name="verified" size={17} color={colors.primary} /> : null}
          </View>
          <VemtapText
            variant="caption"
            tone={unread ? 'brand' : 'tertiary'}
            className={`shrink-0 ${unread ? 'font-sans-semibold' : ''}`}
          >
            {time}
          </VemtapText>
        </View>
        {context ? (
          <View className="my-1 self-start rounded bg-surface-tint px-2 py-0.5">
            <View className="flex-row items-center gap-1">
              <Icon name={contextIcon} size={13} color={colors.primary} />
              <VemtapText variant="caption" tone="brand" className="font-sans-medium">
                {context}
              </VemtapText>
            </View>
          </View>
        ) : null}
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="bodyMd"
            tone="secondary"
            numberOfLines={1}
            className="min-w-0 flex-1"
          >
            {sender ? (
              <VemtapText className="font-sans-medium text-text">{sender}</VemtapText>
            ) : null}
            {message}
          </VemtapText>
          {unread ? (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1">
              <VemtapText variant="caption" tone="inverse" className="font-sans-bold">
                {unread}
              </VemtapText>
            </View>
          ) : (
            <Icon name="doneAll" size={16} color={colors.primary} />
          )}
        </View>
      </View>
    </Pressable>
  );
}
