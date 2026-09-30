import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { colors } from '@theme/colors';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';

cssInterop(View, { className: 'style' });

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Leading glyph above the title; omit for the plain text treatment. */
  icon?: IconName;
  /**
   * `plain` is the standalone page treatment. `contained` renders inside a
   * tinted card — for an empty region sitting among cards, such as a filtered
   * list inside a dashboard panel.
   */
  variant?: 'plain' | 'contained';
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'When there’s something to show, it will appear here.',
  actionLabel,
  onAction,
  icon,
  variant = 'plain',
  className,
}: EmptyStateProps) {
  const contained = variant === 'contained';
  return (
    <View
      accessibilityRole="summary"
      className={cn(
        'items-center justify-center gap-2',
        contained ? 'rounded-card bg-surface-subtle p-6' : 'px-6 py-12',
        className,
      )}
    >
      {icon ? <Icon name={icon} size={28} color={colors.outline} /> : null}
      <VemtapText variant="labelMd" className="mt-1 text-center font-sans-semibold">
        {title}
      </VemtapText>
      <VemtapText variant="caption" tone="secondary" className="text-center">
        {description}
      </VemtapText>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          fullWidth={false}
          size="sm"
          variant="secondary"
        />
      ) : null}
    </View>
  );
}
