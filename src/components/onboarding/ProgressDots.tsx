import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });

export interface ProgressDotsProps {
  total: number;
  activeIndex: number;
  className?: string;
}

/** Three-stage onboarding progress indicator. Active = elongated pill, inactive = dot. */
export function ProgressDots({ total, activeIndex, className }: ProgressDotsProps) {
  return (
    <View
      accessibilityLabel={`Onboarding step ${activeIndex + 1} of ${total}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: activeIndex + 1 }}
      className={cn('flex-row items-center justify-center gap-2', className)}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === activeIndex;
        return (
          <View
            key={i}
            className={cn(
              'rounded-full',
              isActive ? 'h-1.5 w-6 bg-primary' : 'h-1.5 w-1.5 bg-border',
            )}
          />
        );
      })}
    </View>
  );
}
