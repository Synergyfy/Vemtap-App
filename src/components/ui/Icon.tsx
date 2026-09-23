import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Icon names used across the VEMTAP design system.
 * Maps semantic glyphs to MaterialCommunityIcons (bundled in Expo Go).
 */
export const iconNames = {
  back: 'chevron-left',
  backIos: 'arrow-left',
  forward: 'chevron-right',
  arrowForward: 'arrow-right',
  nearMe: 'near-me',
  myLocation: 'crosshairs-gps',
  locationOn: 'map-marker',
  bolt: 'lightning-bolt',
  storefront: 'storefront-outline',
  bag: 'shopping-outline',
  shoppingBag: 'shopping',
  localMall: 'shopping',
  fire: 'fire',
  trendingUp: 'trending-up',
  verified: 'check-decagram',
  verifiedUser: 'shield-check',
  mail: 'email-outline',
  mailRead: 'email-check',
  lock: 'lock-outline',
  visibility: 'eye-outline',
  visibilityOff: 'eye-off-outline',
  google: 'google',
  person: 'account',
  edit: 'pencil',
  editLocation: 'map-marker-radius',
  info: 'information',
  check: 'check',
  checkCircle: 'check-circle',
  close: 'close',
  search: 'magnify',
  explore: 'compass',
  radar: 'radar',
  sync: 'sync',
  star: 'star',
  cafeFilled: 'coffee',
  restaurant: 'silverware-fork-knife',
  loyalty: 'sale',
  badge: 'card-account-details',
  expandMore: 'chevron-down',
  autoAwesome: 'star-four-points',
  localOffer: 'tag',
  pin: 'map-marker',
  distance: 'map-marker-distance',
  offer: 'tag-outline',
  devices: 'devices',
  fashion: 'tshirt-crew',
  groceries: 'cart-outline',
  spa: 'spa',
  cafe: 'coffee',
  notifications: 'bell',
  tune: 'tune',
  schedule: 'clock-outline',
  favorite: 'heart-outline',
  favoriteFilled: 'heart',
  comment: 'message-outline',
  share: 'share-variant',
  listView: 'format-list-bulleted',
  gridView: 'view-grid',
  thumbUp: 'thumb-up-outline',
  home: 'home-outline',
  bookmark: 'bookmark-outline',
  accountCircle: 'account-circle-outline',
  fitness: 'weight-lifter',
  homeLiving: 'sofa',
  automotive: 'car-wrench',
  eventAvailable: 'calendar-check',
  hourglass: 'timer-sand',
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
