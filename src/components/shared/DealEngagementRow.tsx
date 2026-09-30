import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface DealEngagementRowProps {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  onToggleLike?: () => void;
  onOpenComments?: () => void;
  /** `md` for the wide featured card, `sm` for the compact horizontal cards. */
  size?: 'sm' | 'md';
  className?: string;
}

const iconSize = { sm: 14, md: 18 } as const;
const rowGap = { sm: 'gap-2', md: 'gap-4' } as const;

/**
 * Single owner of the like + comment affordance on customer deal cards. Both
 * controls are real buttons: the like fills and bumps the count, the comment
 * count opens the deal's comments sheet. Cards pass their own handlers so the
 * sheet can stay owned by the screen rather than duplicated per card.
 */
export function DealEngagementRow({
  liked,
  likeCount,
  commentCount,
  onToggleLike,
  onOpenComments,
  size = 'md',
  className,
}: DealEngagementRowProps) {
  return (
    <View className={cn('flex-row items-center', rowGap[size], className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Like deal"
        accessibilityState={{ selected: liked }}
        disabled={!onToggleLike}
        hitSlop={6}
        onPress={onToggleLike}
        className={cn(
          'flex-row items-center',
          size === 'sm' ? 'gap-0.5' : 'gap-1.5',
          !onToggleLike && 'opacity-60',
        )}
      >
        <Icon
          name={liked ? 'favoriteFilled' : 'favorite'}
          size={iconSize[size]}
          color={liked ? colors.error : colors.textSecondary}
        />
        <VemtapText variant="caption" tone="secondary">
          {likeCount}
        </VemtapText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open comments"
        disabled={!onOpenComments}
        hitSlop={6}
        onPress={onOpenComments}
        className={cn(
          'flex-row items-center',
          size === 'sm' ? 'gap-0.5' : 'gap-1.5',
          !onOpenComments && 'opacity-60',
        )}
      >
        <Icon name="comment" size={iconSize[size]} color={colors.textSecondary} />
        <VemtapText variant="caption" tone="secondary">
          {commentCount}
        </VemtapText>
      </Pressable>
    </View>
  );
}
