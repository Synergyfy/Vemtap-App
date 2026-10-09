import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { navbarBottomShadow } from '@theme/shadows';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { homeAvatar } from '@features/home/data/homeFeed';
import { LocationTargetingControls } from '@components/home/LocationTargetingControls';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface HomeHeaderProps {
  /**
   * Overline text. Defaults to the greeting; the Deals feed passes its own
   * section name so both surfaces render this one bar.
   */
  title?: string;
  /** Shows the greeting wave. Off by default once a custom `title` is given. */
  showGreeting?: boolean;
  /** District name — opens the full location-selection page. */
  onPressLocation?: () => void;
  /** Radius pill — opens the Change Location & Radius bottom sheet. */
  onPressRadius?: () => void;
  location?: string;
  radius?: string;
  onPressNotifications?: () => void;
  onPressAvatar?: () => void;
}

/**
 * The consumer top navbar — the single owner shared by the Home feed and the
 * Deals feed, which differ only in the overline text.
 *
 * The district name and the radius pill are two separate controls with two
 * different destinations: tapping the name picks a district (full page), tapping
 * the radius tunes the discovery range (bottom sheet). They must not be merged.
 */
export function HomeHeader({
  title,
  showGreeting = title === undefined,
  onPressLocation,
  onPressRadius,
  location = strings.home.location,
  radius = strings.home.radius,
  onPressNotifications,
  onPressAvatar,
}: HomeHeaderProps = {}) {
  return (
    <View style={navbarBottomShadow} className="bg-surface px-6 py-1">
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-col">
          <View className="flex-row items-center gap-1">
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {title ?? strings.home.greeting}
            </VemtapText>
            {showGreeting ? <VemtapText className="text-body-md">👋</VemtapText> : null}
          </View>
          <LocationTargetingControls
            location={location}
            radius={radius}
            onPressLocation={() => onPressLocation?.()}
            onPressRadius={() => onPressRadius?.()}
          />
        </View>
        <View className="flex-row items-center gap-2.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.home.notifications}
            onPress={onPressNotifications}
            className="relative h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm"
          >
            <Icon name="notifications" size={22} color={colors.text} />
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.home.avatar}
            onPress={onPressAvatar}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-fixed p-0.5"
          >
            <View className="h-full w-full overflow-hidden rounded-full bg-secondary-fixed">
              <Image source={homeAvatar} className="h-full w-full" resizeMode="cover" />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
