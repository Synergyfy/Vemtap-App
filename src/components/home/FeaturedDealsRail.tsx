import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import type { FeaturedDeal } from '@features/home/data/homeFeed';
import { FeaturedDealCard } from './FeaturedDealCard';
import { useEnriched } from './LiveNearbyListCard';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

/** Autoplay cadence. Slow enough to read a card, quick enough to feel alive. */
const AUTOPLAY_INTERVAL_MS = 4500;

/**
 * Home's ScrollView insets its content by this much on each side, which is the
 * widest the card gets while sitting inside the gutters.
 */
const HOME_CONTENT_INSET = 24;

export interface FeaturedDealsRailProps {
  deals: FeaturedDeal[];
  onOpenComments?: (id: string) => void;
  onShare?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  className?: string;
}

/**
 * One deal per page in a horizontal rail. Each item is its own component so the
 * engagement hooks resolve against that deal's id rather than the first one's.
 */
function LiveFeaturedRailItem({
  deal,
  onOpenComments,
  onShare,
  onOpenDetail,
}: {
  deal: FeaturedDeal;
  onOpenComments?: (id: string) => void;
  onShare?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
}) {
  const { deal: enriched, liked, toggleLike } = useEnriched(deal);

  return (
    <FeaturedDealCard
      deal={{ ...enriched, liked }}
      onToggleLike={toggleLike}
      onOpenComments={onOpenComments}
      onShare={onShare}
      onOpenDetail={onOpenDetail}
    />
  );
}

function RailPill({
  active,
  position,
  onPress,
}: {
  active: boolean;
  position: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Go to deal ${position + 1}`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      hitSlop={8}
      className={cn('h-1.5 rounded-full', active ? 'w-4 bg-primary' : 'w-1.5 bg-border')}
    />
  );
}

export function FeaturedDealsRail({
  deals,
  onOpenComments,
  onShare,
  onOpenDetail,
  className,
}: FeaturedDealsRailProps) {
  const listRef = useRef<FlatList<FeaturedDeal>>(null);
  const { width: windowWidth } = useWindowDimensions();
  /**
   * Seeded off the window so the first frame already lays the cards out at
   * their real width; onLayout then corrects this against whatever the rail
   * actually ends up being, which keeps it honest if the rail is reused
   * somewhere with different insets.
   */
  const [pageWidth, setPageWidth] = useState(() =>
    Math.max(0, windowWidth - HOME_CONTENT_INSET * 2),
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const count = deals.length;

  /** Each page is exactly one card wide, so offsets are index * pageWidth. */
  const scrollToPage = useCallback(
    (page: number) => {
      // Before the first layout pass there is nothing to scroll; the index
      // still advances so the dots stay honest.
      if (pageWidth <= 0) return;
      listRef.current?.scrollToOffset({
        offset: page * pageWidth,
        animated: true,
      });
    },
    [pageWidth],
  );

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) setReduceMotion(value);
    });
    return () => {
      active = false;
    };
  }, []);

  // Advancing in an effect keyed on `index` restarts the clock after every
  // slide, so a manual move also buys a full interval before autoplay resumes.
  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const timer = setInterval(() => {
      const next = (index + 1) % count;
      setIndex(next);
      scrollToPage(next);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, paused, reduceMotion, index, scrollToPage]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const next = pageWidth > 0 ? Math.round(offset / pageWidth) : 0;
      setIndex(Math.max(0, Math.min(next, count - 1)));
      setPaused(false);
    },
    [pageWidth, count],
  );

  // A drag released without enough travel to fling fires no momentum event, so
  // resuming here too keeps autoplay from staying paused forever.
  const handleScrollEndDrag = useCallback(() => setPaused(false), []);

  return (
    // Measured on the root rather than the list: the root spans exactly the
    // width the card should take, whatever insets its parent applies.
    <View
      testID="featured-deals-rail-root"
      className={className}
      onLayout={event => setPageWidth(event.nativeEvent.layout.width)}
    >
      <FlatList
        ref={listRef}
        testID="featured-deals-rail"
        data={deals}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageWidth > 0 ? pageWidth : undefined}
        snapToAlignment="start"
        keyExtractor={item => item.id}
        onScrollBeginDrag={() => setPaused(true)}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }) => (
          // The card is `w-full`, which only resolves against a definite width.
          // A horizontal list's cell has none, so the width is pinned here
          // rather than left to percentage resolution.
          <View testID="featured-deals-page" style={{ width: pageWidth }}>
            <LiveFeaturedRailItem
              deal={item}
              onOpenComments={onOpenComments}
              onShare={onShare}
              onOpenDetail={onOpenDetail}
            />
          </View>
        )}
      />

      {count > 1 ? (
        <View className="mt-4 flex-row items-center justify-center gap-1.5">
          {deals.map((deal, position) => (
            <RailPill
              key={deal.id}
              active={position === index}
              position={position}
              onPress={() => {
                setIndex(position);
                scrollToPage(position);
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
