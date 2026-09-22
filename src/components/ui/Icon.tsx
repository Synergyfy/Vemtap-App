import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Icon names used across the VEMTAP design system.
 * Maps semantic glyphs to MaterialCommunityIcons (bundled in Expo Go).
 */
export const iconNames = {
  back: 'chevron-left',
  forward: 'chevron-right',
  nearMe: 'near-me',
  bolt: 'lightning-bolt',
  storefront: 'storefront-outline',
  bag: 'shopping-outline',
  fire: 'fire',
  trendingUp: 'trending-up',
  verified: 'check-decagram',
  pin: 'map-marker',
  distance: 'map-marker-distance',
  offer: 'tag-outline',
  star: 'star',
  devices: 'devices',
  fashion: 'tshirt-crew',
  groceries: 'cart-outline',
  spa: 'spa',
  cafe: 'coffee',
} as const;

export type IconName = keyof typeof iconNames;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 20, color, style }: IconProps) {
  return (
    <MaterialCommunityIcons
      allowFontScaling={false}
      name={iconNames[name]}
      size={size}
      color={color}
      selectable={false}
      style={style}
    />
  );
}
