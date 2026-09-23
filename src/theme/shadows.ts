import { Platform, StyleSheet, type ViewStyle } from 'react-native';

/**
 * Soft drop shadow that renders only below the navbar — never a round/box shadow
 * and never bleeding above the bar.
 * iOS: shadowOffset.y must be >= shadowRadius or the blur extends above the view.
 * Android: elevation always draws all-around, so we use a hairline bottom edge only.
 */
export const navbarBottomShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0B1220',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(11, 18, 32, 0.12)',
    },
    default: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(11, 18, 32, 0.12)',
    },
  }) ?? {};

/**
 * Soft upward shadow so the bottom tab bar lifts off white page content
 * instead of blending into it. iOS: negative y offset pushes blur above the bar.
 * Android: elevation (all-around) + hairline top edge for a crisp edge.
 */
export const tabBarTopShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0B1220',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(11, 18, 32, 0.14)',
    },
    default: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(11, 18, 32, 0.14)',
    },
  }) ?? {};
