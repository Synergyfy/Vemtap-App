import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });

interface HowToClaimStepCardProps {
  step: number;
  title: string;
  description: string;
  icon: IconName;
  showDecoration?: boolean;
  children: React.ReactNode;
}

export function HowToClaimStepCard({
  step,
  title,
  description,
  icon,
  showDecoration = false,
  children,
}: HowToClaimStepCardProps) {
  return (
    <View className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      {showDecoration ? (
        <View className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-primary-fixed/40" />
      ) : null}
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-md">
          <VemtapText variant="headingSm" className="text-primary-foreground">
            {step}
          </VemtapText>
        </View>
        <View className="min-w-0 flex-1 pt-0.5">
          <View className="mb-1 flex-row items-center justify-between gap-2">
            <VemtapText variant="headingSm" className="min-w-0 flex-1 text-text">
              {title}
            </VemtapText>
            <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-tint-blue">
              <Icon name={icon} size={18} color={colors.primary} />
            </View>
          </View>
          <VemtapText variant="bodyMd" tone="secondary" className="leading-normal">
            {description}
          </VemtapText>
          <View className="mt-2">{children}</View>
        </View>
      </View>
    </View>
  );
}
