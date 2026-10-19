import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';

const DOUBLE_TAP_MS = 280;

export interface DoubleTapLikeProps {
  /** Likes the item. Double-tap never unlikes, as on Instagram. */
  onDoubleTap?: () => void;
  /** Single tap, fired only once a second tap can no longer arrive. */
  onSingleTap?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Double-tap a photo to like it: a large heart bursts over the photo and
 * fades. Without `onDoubleTap` it renders the children untouched.
 */
export function DoubleTapLike({
  onDoubleTap,
  onSingleTap,
  style,
  children,
}: DoubleTapLikeProps) {
  const lastTap = useRef(0);
  const singleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burst = useRef(new Animated.Value(0)).current;

  useEffect(
    () => () => {
      if (singleTimer.current) clearTimeout(singleTimer.current);
    },
    [],
  );

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (singleTimer.current) clearTimeout(singleTimer.current);
      singleTimer.current = null;
      onDoubleTap?.();
      burst.setValue(0);
      Animated.sequence([
        Animated.spring(burst, {
          toValue: 1,
          friction: 4,
          tension: 160,
          useNativeDriver: true,
        }),
        Animated.timing(burst, {
          toValue: 2,
          duration: 220,
          delay: 280,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    lastTap.current = now;
    if (onSingleTap) {
      singleTimer.current = setTimeout(() => {
        singleTimer.current = null;
        onSingleTap();
      }, DOUBLE_TAP_MS);
    }
  }, [burst, onDoubleTap, onSingleTap]);

  if (!onDoubleTap) return <View style={style}>{children}</View>;

  return (
    <Pressable
      accessibilityHint={strings.likes.doubleTapHint}
      onPress={handlePress}
      style={style}
    >
      {children}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View
          testID="double-tap-heart"
          style={{
            opacity: burst.interpolate({
              inputRange: [0, 0.2, 1, 2],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              {
                scale: burst.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0.3, 1, 1.15],
                }),
              },
            ],
          }}
        >
          <Icon name="favoriteFilled" size={96} color={colors.surface} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
