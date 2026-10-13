import React from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
// Without this the avatar `className` is ignored and the remote image renders
// unsized (invisible) instead of as a circle.
cssInterop(Image, { className: 'style' });

export interface ConversationListCardProps {
  image?: ImageSourcePropType;
  /** Rendered in place of the image when the participant has no portrait. */
  avatarFallback?: React.ReactNode;
  name: string;
  time: string;
  message: string;
  context: string;
  contextIcon: IconName;
  /** Context chip tone; defaults to the brand tint. */
  contextTone?: 'brand' | 'discount' | 'neutral';
  unread?: number;
  online?: boolean;
  verified?: boolean;
  sender?: string;
  onPress: () => void;
}

const contextToneStyles: Record<
  NonNullable<ConversationListCardProps['contextTone']>,
  { chip: string; text: string; icon: string }
> = {
  brand: {
    chip: 'bg-surface-tint',
    text: 'text-primary',
    icon: colors.primary,
  },
  discount: {
    chip: 'bg-badge-discount-bg',
    text: 'text-badge-discount-text',
    icon: colors.badgeDiscountText,
  },
  neutral: {
    chip: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    icon: colors.onSurfaceVariant,
  },
};

export function ConversationListCard({
  image,
  avatarFallback,
  name,
  time,
  message,
  context,
  contextIcon,
  contextTone = 'brand',
  unread = 0,
  online = false,
  verified = false,
  sender = '',
  onPress,
}: ConversationListCardProps) {
  const tone = contextToneStyles[contextTone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      className="w-full min-w-0 flex-row gap-3 overflow-hidden rounded-card border border-border bg-surface p-4 shadow-md active:bg-surface-container-low"
    >
      <View className="relative h-[52px] w-[52px] shrink-0">
        {image ? (
          <Image
            source={image}
            className="h-full w-full rounded-full bg-surface-container"
          />
        ) : (
          avatarFallback
        )}
        {online ? (
          <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
        ) : null}
      </View>
      <View className="min-w-0 flex-1 justify-center">
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1">
            <VemtapText
              variant="labelMd"
              numberOfLines={1}
              className="min-w-0 flex-1 font-sans-semibold"
            >
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
          <View className={`my-1 max-w-full self-start rounded px-2 py-0.5 ${tone.chip}`}>
            <View className="min-w-0 flex-row items-center gap-1">
              <Icon name={contextIcon} size={13} color={tone.icon} />
              <VemtapText
                variant="caption"
                className={`min-w-0 flex-1 font-sans-medium ${tone.text}`}
                numberOfLines={1}
              >
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
            <View className="h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1">
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
