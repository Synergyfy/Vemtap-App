import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { colors } from '@theme/colors';
import { DoubleTapLike } from '@components/shared/DoubleTapLike';

export interface DealHeroGalleryProps {
  /** Unique URLs (the mapper deduplicates them). */
  images: { uri: string }[];
  /** Read out for each photo, with its position. */
  accessibilityLabel: string;
  /** Double-tap a photo to like the deal. */
  onDoubleTap?: () => void;
}

/**
 * The deal's hero photo. With more than one photo it becomes a horizontal
 * pager (one photo per swipe) with dots showing where you are; with one it is
 * a plain image, so a single-photo deal looks exactly as before.
 */
export function DealHeroGallery({
  images,
  accessibilityLabel,
  onDoubleTap,
}: DealHeroGalleryProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  if (images.length <= 1) {
    return (
      <DoubleTapLike onDoubleTap={onDoubleTap} style={StyleSheet.absoluteFill}>
        <Image
          source={images[0]}
          accessibilityLabel={accessibilityLabel}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </DoubleTapLike>
    );
  }

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(images.length - 1, next)));
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <FlatList
        testID="deal-hero-gallery"
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={image => image.uri}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, position) => ({
          length: width,
          offset: width * position,
          index: position,
        })}
        renderItem={({ item, index: position }) => (
          <DoubleTapLike onDoubleTap={onDoubleTap} style={[styles.photo, { width }]}>
            <Image
              source={item}
              accessibilityLabel={`${accessibilityLabel}, ${position + 1} of ${images.length}`}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          </DoubleTapLike>
        )}
      />
      <View pointerEvents="none" style={styles.dots}>
        {images.map((image, position) => (
          <View
            key={image.uri}
            style={[styles.dot, position === index ? styles.dotActive : null]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { height: '100%' },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.surface,
  },
});
