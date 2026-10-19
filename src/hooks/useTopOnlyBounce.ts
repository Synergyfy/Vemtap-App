import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Keeps a feed from scrolling past its last item.
 *
 * iOS lets a ScrollView be dragged on past its end (bounce), which shows a
 * blank screen under the last card. Bounce is still needed at the very top,
 * where pull-to-refresh lives, so it is enabled only while the list sits at
 * the top and switched off as soon as the user scrolls down. Android gets
 * `overScrollMode="never"` (pull-to-refresh there does not use overscroll).
 *
 * Spread the result onto the ScrollView.
 */
export function useTopOnlyBounce() {
  const [atTop, setAtTop] = useState(true);
  const atTopRef = useRef(true);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y <= 0;
    if (next !== atTopRef.current) {
      atTopRef.current = next;
      setAtTop(next);
    }
  }, []);

  return {
    bounces: atTop,
    alwaysBounceVertical: atTop,
    overScrollMode: 'never' as const,
    onScroll,
    scrollEventThrottle: 16,
  };
}
