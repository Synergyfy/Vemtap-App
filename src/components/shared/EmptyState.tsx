import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';

cssInterop(View, { className: 'style' });

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'When there’s something to show, it will appear here.',
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View
      accessibilityRole="summary"
      className={cn('items-center justify-center gap-3 px-6 py-12', className)}
    >
      <VemtapText variant="headingSm" className="text-center">
        {title}
      </VemtapText>
      <VemtapText tone="secondary" className="text-center">
        {description}
      </VemtapText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} size="sm" variant="secondary" />
      ) : null}
    </View>
  );
}
