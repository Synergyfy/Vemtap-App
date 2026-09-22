import React from 'react';
import { View, Pressable } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';
import { Icon } from '@components/ui/Icon';
import { ProgressDots } from '@components/onboarding/ProgressDots';
import { cn } from '@utils/cn';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface OnboardingHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
  progress?: { activeIndex: number; total: number };
  center?: 'brand' | 'progress' | 'vemtapPill';
  className?: string;
}

export function OnboardingHeader({
  showBack = true,
  onBack,
  showSkip = true,
  onSkip,
  progress,
  center = 'progress',
  className,
}: OnboardingHeaderProps) {
  const slot = cn('h-11 w-11 items-center justify-center');

  const renderCenter = () => {
    if (center === 'brand') {
      return (
        <View className="flex-row items-center gap-1.5">
          <VemtapText className="font-sans-bold text-xl tracking-wider text-primary">
            VEMTAP
          </VemtapText>
          <View className="h-2 w-2 rounded-full bg-primary" />
        </View>
      );
    }
    if (center === 'vemtapPill') {
      return (
        <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-3 py-1">
          <Icon name="nearMe" size={15} color="#066CF4" />
          <VemtapText className="font-sans-semibold text-label-sm uppercase tracking-wide text-primary">
            VEMTAP
          </VemtapText>
        </View>
      );
    }
    if (progress) {
      return <ProgressDots total={progress.total} activeIndex={progress.activeIndex} />;
    }
    return null;
  };

  return (
    <View className={cn('w-full flex-row items-center justify-between pr-2', className)}>
      <View className={slot}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.goBack}
            onPress={onBack}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high"
          >
            <Icon name="back" size={24} color="#141B2B" />
          </Pressable>
        ) : null}
      </View>

      {renderCenter()}

      <View className={slot}>
        {showSkip ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip"
            onPress={onSkip}
            hitSlop={8}
            className="min-h-[44px] min-w-[44px] items-center justify-center px-2"
          >
            <VemtapText tone="secondary" className="text-label-md">
              {strings.common.skip}
            </VemtapText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
