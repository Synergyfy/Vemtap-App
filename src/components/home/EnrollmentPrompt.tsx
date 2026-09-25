import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface EnrollmentPromptProps {
  onOpenBusinessSetup?: () => void;
}

export function EnrollmentPrompt({ onOpenBusinessSetup }: EnrollmentPromptProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-surface-tint-blue p-4 shadow-md">
      <View className="min-w-0 flex-1 flex-col">
        <VemtapText variant="caption" tone="secondary">
          {strings.home.enrollmentPrompt}
        </VemtapText>
        <Pressable
          accessibilityRole="link"
          onPress={onOpenBusinessSetup}
          className="flex-row items-center gap-1 py-0.5"
        >
          <VemtapText variant="labelMd" className="font-sans-semibold text-primary">
            {strings.home.enrollmentLink}
          </VemtapText>
          <Icon name="arrowForward" size={16} color={colors.primary} />
        </Pressable>
        <VemtapText className="pt-0.5 font-sans text-caption text-text-tertiary">
          {strings.home.enrollmentMeta}
        </VemtapText>
      </View>
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed">
        <Icon name="storefront" size={22} color={colors.primary} />
      </View>
    </View>
  );
}
