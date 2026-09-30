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
  /**
   * `card` is the Home/Discover treatment (tinted panel, icon, supporting line).
   * `inline` is the spec's featured-deals footer: a plain centred prompt + link
   * with no panel. One owner, two documented presentations (AGENTS rule 17).
   */
  variant?: 'card' | 'inline';
}

export function EnrollmentPrompt({
  onOpenBusinessSetup,
  variant = 'card',
}: EnrollmentPromptProps) {
  if (variant === 'inline') {
    return (
      <View className="flex-row flex-wrap items-center justify-center gap-1.5">
        <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
          {strings.home.enrollmentPrompt}
        </VemtapText>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={strings.home.enrollmentLink}
          onPress={onOpenBusinessSetup}
          className="flex-row items-center gap-0.5 active:opacity-75"
        >
          <VemtapText
            variant="caption"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {strings.home.enrollmentLink}
          </VemtapText>
          <Icon name="arrowForward" size={14} color={colors.primary} />
        </Pressable>
      </View>
    );
  }

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
