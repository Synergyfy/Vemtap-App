import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leadingIcon?: React.ReactNode;
  showCheck?: boolean;
  tone?: 'default' | 'hot';
  size?: 'sm' | 'md';
}

export function FilterChip({
  label,
  selected = false,
  onPress,
  leadingIcon,
  showCheck = false,
  tone = 'default',
  size = 'sm',
}: FilterChipProps) {
  const isHot = tone === 'hot';
  const height = size === 'md' ? 'h-10' : 'h-9';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'shrink-0 flex-row items-center justify-center gap-1 rounded-full px-4 active:scale-95',
        height,
        selected
          ? 'bg-primary-container shadow-sm'
          : isHot
            ? 'bg-surface-container'
            : size === 'md'
              ? 'bg-surface-canvas shadow-sm'
              : 'bg-surface-container',
      )}
    >
      {selected && showCheck && size === 'sm' ? (
        <Icon name="check" size={16} color="#FFFFFF" />
      ) : null}
      {!selected && isHot ? (
        <Icon name="fire" size={16} color={colors.tertiaryContainer} />
      ) : null}
      {leadingIcon ?? null}
      <VemtapText
        variant="labelMd"
        className={cn(
          selected
            ? 'font-sans-semibold text-primary-foreground'
            : isHot
              ? 'font-sans-semibold text-tertiary-container'
              : 'font-sans-medium text-text-secondary',
        )}
        numberOfLines={1}
      >
        {label}
      </VemtapText>
      {selected && showCheck && size === 'md' ? (
        <Icon name="check" size={16} color="#FFFFFF" />
      ) : null}
    </Pressable>
  );
}
