import React from 'react';
import { Pressable } from 'react-native';
import { cssInterop } from 'nativewind';
import { LikeHeart } from '@components/shared/LikeHeart';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';

cssInterop(Pressable, { className: 'style' });

export interface LikeButtonProps {
  liked: boolean;
  /** `null` while the count is still loading. */
  likesCount: number | null;
  onToggle: () => void;
  /** What is being liked, read out as "Like <label>". */
  accessibilityLabel: string;
}

/** Heart + count for a detail screen (product, service). */
export function LikeButton({
  liked,
  likesCount,
  onToggle,
  accessibilityLabel,
}: LikeButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${strings.likes.likeLabel} ${accessibilityLabel}`}
      accessibilityState={{ selected: liked }}
      hitSlop={8}
      onPress={onToggle}
      className="flex-row items-center gap-1.5 self-start"
    >
      <LikeHeart liked={liked} size={20} />
      {likesCount !== null ? (
        <VemtapText variant="labelSm" tone="secondary">
          {strings.likes.count(likesCount)}
        </VemtapText>
      ) : null}
    </Pressable>
  );
}
