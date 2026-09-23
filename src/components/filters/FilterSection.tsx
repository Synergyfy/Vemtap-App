import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { VemtapText } from '@components/ui/Text';

cssInterop(View, { className: 'style' });

export interface FilterSectionProps {
  title: string;
  subtitle?: string;
  meta?: string;
  value?: string;
  children: React.ReactNode;
}

export function FilterSection({
  title,
  subtitle,
  meta,
  value,
  children,
}: FilterSectionProps) {
  return (
    <View className="flex-col gap-2">
      <View className="flex-col">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            accessibilityRole="header"
            variant="headingSm"
            className="min-w-0 flex-1 text-text"
          >
            {title}
          </VemtapText>
          {value ? (
            <VemtapText className="shrink-0 font-sans-semibold text-label-sm text-primary">
              {value}
            </VemtapText>
          ) : null}
          {meta ? (
            <VemtapText className="shrink-0 font-sans text-caption text-text-tertiary">
              {meta}
            </VemtapText>
          ) : null}
        </View>
        {subtitle ? (
          <VemtapText variant="caption" tone="secondary">
            {subtitle}
          </VemtapText>
        ) : null}
      </View>
      {children}
    </View>
  );
}
