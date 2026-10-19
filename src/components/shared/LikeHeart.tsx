import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { colors } from '@theme/colors';

export interface LikeHeartProps {
  liked: boolean;
  size: number;
  /** Outline colour while not liked. */
  color?: string;
}

/**
 * The like heart: an outline that fills red and pops when liked, the way
 * Instagram's does. Only the transition to liked animates; unliking is instant.
 */
export function LikeHeart({ liked, size, color = colors.textSecondary }: LikeHeartProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const wasLiked = useRef(liked);

  useEffect(() => {
    if (liked && !wasLiked.current) {
      scale.setValue(0.6);
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 180,
        useNativeDriver: true,
      }).start();
    }
    wasLiked.current = liked;
  }, [liked, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon
        name={liked ? 'favoriteFilled' : 'favorite'}
        size={size}
        color={liked ? colors.error : color}
      />
    </Animated.View>
  );
}
