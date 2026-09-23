import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { navbarBottomShadow } from '@theme/shadows';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { homeAvatar } from '@features/home/data/homeFeed';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export function HomeHeader() {
  return (
    <View style={navbarBottomShadow} className="bg-surface px-6 py-3">
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-col">
          <View className="flex-row items-center gap-1">
            <VemtapText variant="caption" tone="secondary">
              {strings.home.greeting}
            </VemtapText>
            <VemtapText className="text-body-md">👋</VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${strings.home.location}, ${strings.home.radius}`}
            className="flex-row items-center gap-1.5 py-0.5"
          >
            <Icon name="locationOn" size={20} color={colors.primary} />
            <VemtapText className="font-sans-semibold text-button-md text-text">
              {strings.home.location}
            </VemtapText>
            <Icon name="expandMore" size={18} color={colors.textSecondary} />
            <View className="ml-1 rounded-full bg-surface-tint-blue px-2 py-0.5">
              <VemtapText className="text-caption text-primary">
                {strings.home.radius}
              </VemtapText>
            </View>
          </Pressable>
        </View>
        <View className="flex-row items-center gap-2.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.home.notifications}
            className="relative h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm"
          >
            <Icon name="notifications" size={22} color={colors.text} />
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
          </Pressable>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-fixed p-0.5">
            <View className="h-full w-full overflow-hidden rounded-full bg-secondary-fixed">
              <Image
                accessibilityLabel={strings.home.avatar}
                source={homeAvatar}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
