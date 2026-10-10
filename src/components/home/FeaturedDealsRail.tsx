import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
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
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const count = deals.length;

  /** Each page is exactly one rail wide, so offsets are index * width. */
  const scrollToPage = useCallback(
    (page: number) => {
      // Before the first layout pass there is nothing to scroll; the index still
      // advances so the dots stay honest.
      if (width <= 0) return;
      listRef.current?.scrollToOffset({
        offset: page * width,
        animated: true,
      });
    },
    [width],
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
      const next = width > 0 ? Math.round(offset / width) : 0;
      setIndex(Math.max(0, Math.min(next, count - 1)));
      setPaused(false);
    },
    [width, count],
  );

  // A drag released without enough travel to fling fires no momentum event, so
  // resuming here too keeps autoplay from staying paused forever.
  const handleScrollEndDrag = useCallback(() => setPaused(false), []);

  return (
    <View className={className}>
      {/* Bleeds past the screen's gutters so a card sits flush to the edge —
          the rail is the one part of Home that is wider than its section. */}
      <View className="-mx-6">
        <FlatList
          ref={listRef}
          testID="featured-deals-rail"
          data={deals}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={width > 0 ? width : undefined}
          snapToAlignment="start"
          onLayout={event => setWidth(event.nativeEvent.layout.width)}
          keyExtractor={item => item.id}
          onScrollBeginDrag={() => setPaused(true)}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumEnd}
          renderItem={({ item }) => (
            <LiveFeaturedRailItem
              deal={item}
              onOpenComments={onOpenComments}
              onShare={onShare}
              onOpenDetail={onOpenDetail}
            />
          )}
        />
      </View>

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
