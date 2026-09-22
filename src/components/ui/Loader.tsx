import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

export interface LoaderProps {
  visible?: boolean;
  label?: string;
  className?: string;
}

export function Loader({ visible = true, label, className }: LoaderProps) {
  if (!visible) {
    return null;
  }
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Loading'}
      className={cn('items-center justify-center py-8 gap-2', className)}
    >
      <ActivityIndicator size="large" color="#066CF4" />
      {label ? (
        <VemtapText variant="labelMd" tone="secondary">
          {label}
        </VemtapText>
      ) : null}
    </View>
  );
}
