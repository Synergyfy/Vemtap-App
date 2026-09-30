import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface LocationTargetingControlsProps {
  /** District label, e.g. `Apo, Abuja`. Opens the selection page. */
  location: string;
  /** Radius label, e.g. `Within 5 km`. Opens the radius sheet. */
  radius: string;
  onPressLocation: () => void;
  onPressRadius: () => void;
  className?: string;
}

/**
 * The consumer location/radius control pair \u2014 one owner for every surface that
 * shows where the user is browsing from.
 *
 * Two deliberately separate targets: tapping the district name picks a district
 * (full page), tapping the radius pill tunes the discovery range (bottom sheet).
 * They must not be merged into a single control.
 */
export function LocationTargetingControls({
  location,
  radius,
  onPressLocation,
  onPressRadius,
  className,
}: LocationTargetingControlsProps) {
  return (
    <View className={cn('flex-row items-center gap-1.5 py-0.5', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={location}
        onPress={onPressLocation}
        hitSlop={6}
        className="flex-row items-center gap-1"
      >
        <Icon name="locationOn" size={20} color={colors.primary} />
        <VemtapText
          className="font-sans-semibold text-button-md text-text"
          numberOfLines={1}
        >
          {location}
        </VemtapText>
        <Icon name="expandMore" size={18} color={colors.textSecondary} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={radius}
        onPress={onPressRadius}
        hitSlop={6}
        className="ml-1 rounded-full bg-surface-tint-blue px-2 py-0.5 active:opacity-80"
      >
        <VemtapText className="text-caption text-primary" numberOfLines={1}>
          {radius}
        </VemtapText>
      </Pressable>
    </View>
  );
}
