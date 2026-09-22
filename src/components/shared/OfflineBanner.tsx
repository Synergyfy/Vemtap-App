import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { VemtapText } from '@components/ui/Text';

cssInterop(View, { className: 'style' });

export interface OfflineBannerProps {
  className?: string;
  message?: string;
}

/**
 * Global offline indicator. Rendered once at the app root above navigation.
 * Uses logical `ms-`/`me-` spacing so RTL locales flip correctly.
 */
export function OfflineBanner({
  className,
  message = 'You are offline. Some features may be unavailable.',
}: OfflineBannerProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={cn(
        'w-full flex-row items-center justify-center gap-2',
        'bg-warning py-2 px-4',
        className,
      )}
    >
      <View className="h-2 w-2 rounded-full bg-warning-foreground" />
      <VemtapText variant="labelSm" className="text-warning-foreground text-center">
        {message}
      </VemtapText>
    </View>
  );
}

export default OfflineBanner;
