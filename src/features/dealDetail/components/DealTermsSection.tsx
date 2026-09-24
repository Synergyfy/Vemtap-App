import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });

export interface DealTermsRowProps {
  icon: IconName;
  children: React.ReactNode;
  supportingText?: string;
}

export function DealTermsRow({ icon, children, supportingText }: DealTermsRowProps) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
        <Icon name={icon} size={15} color={colors.primary} />
      </View>
      <View className="min-w-0 flex-1">
        <VemtapText variant="bodyMd" className="text-text">
          {children}
        </VemtapText>
        {supportingText ? (
          <VemtapText className="mt-0.5 text-caption text-text-tertiary">
            {supportingText}
          </VemtapText>
        ) : null}
      </View>
    </View>
  );
}

export interface DealTermsSectionProps {
  icon: IconName;
  title: string;
  compact?: boolean;
  children: React.ReactNode;
}

export function DealTermsSection({
  icon,
  title,
  compact = false,
  children,
}: DealTermsSectionProps) {
  return (
    <View className="mt-6 px-6">
      <View className="mb-2 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-surface-tint-blue">
          <Icon name={icon} size={18} color={colors.primary} />
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingSm"
          className="min-w-0 flex-1 text-text"
        >
          {title}
        </VemtapText>
      </View>
      <View
        className={`rounded-xl bg-surface-canvas p-4 shadow-sm ${compact ? 'gap-3' : 'gap-4'}`}
      >
        {children}
      </View>
    </View>
  );
}
