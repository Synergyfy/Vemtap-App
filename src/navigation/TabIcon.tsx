import React from 'react';
import { View, Text as RNText } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(RNText, { className: 'style' });

export function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no">
      <RNText
        className={cn(
          'text-caption font-semibold',
          focused ? 'text-primary' : 'text-text-tertiary',
        )}
      >
        {label}
      </RNText>
    </View>
  );
}
