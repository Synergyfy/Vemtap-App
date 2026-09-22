import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SvgUri } from 'react-native-svg';

interface LocalSvgProps {
  source: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}

export function LocalSvg({ source, style }: LocalSvgProps) {
  const asset = Image.resolveAssetSource(source);

  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      <SvgUri
        uri={asset.uri}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
