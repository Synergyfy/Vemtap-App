import React from 'react';
import { Pressable } from 'react-native';
import { cssInterop } from 'nativewind';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { Icon } from './Icon';

cssInterop(Pressable, { className: 'style' });

export interface SearchClearButtonProps {
  onClear: () => void;
  /**
   * Positioned at the call site — `HomeSearchBar` places it inline in its flex
   * row, `HubSearchField` absolutely against the field — so callers add only
   * placement, never a second copy of the button's own styling.
   */
  className?: string;
}

/**
 * The clear ("cancel") affordance shown at the right end of a search field once
 * it holds a value. Owned here so every search field clears the same way: one
 * icon, one hit area, one accessibility label from `strings.search.clearLabel`.
 * Callers decide when it appears (only while a value exists) and what clearing
 * does — they pass the field's own `onChangeText('')`.
 */
export function SearchClearButton({ onClear, className }: SearchClearButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.search.clearLabel}
      hitSlop={8}
      className={cn(
        'h-7 w-7 items-center justify-center rounded-full bg-surface-container active:scale-95',
        className,
      )}
      onPress={onClear}
    >
      <Icon name="close" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}
