import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = strings.errors.server,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <View
      accessibilityRole="alert"
      className={cn('items-center justify-center gap-3 px-6 py-12', className)}
    >
      <VemtapText variant="headingSm" tone="error" className="text-center">
        {title}
      </VemtapText>
      <VemtapText tone="secondary" className="text-center">
        {description}
      </VemtapText>
      {onRetry ? (
        <Button label={strings.common.retry} onPress={onRetry} fullWidth={false} size="sm" variant="outline" />
      ) : null}
    </View>
  );
}
