import React from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
});

type CenteredTabButtonProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  href?: string;
  'aria-label'?: string;
  accessibilityLabel?: string;
};

/** Overrides UIKit's top-aligned tab content so icons + labels sit on the midline. */
export function CenteredTabButton({ style, ...props }: CenteredTabButtonProps) {
  return <Pressable {...props} style={[style, styles.centered]} />;
}
