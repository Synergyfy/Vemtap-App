import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { urbanHours } from '@features/discover/data/urbanGrillData';

cssInterop(View, { className: 'style' });

export function HoursList() {
  return (
    <View className="rounded-2xl border border-border bg-surface-canvas p-4 shadow-md">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icon name="schedule" size={20} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-semibold text-text">
            {strings.urbanProfile.openingHours}
          </VemtapText>
        </View>
        <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
          <VemtapText
            variant="caption"
            className="font-sans-semibold text-badge-discount-text"
          >
            {strings.urbanProfile.openNowShort}
          </VemtapText>
        </View>
      </View>
      <View className="gap-1.5 pt-2">
        {urbanHours.map(item => (
          <View
            key={item.day}
            className="flex-row items-center justify-between gap-3 py-1"
          >
            <VemtapText variant="labelSm" className="font-sans-medium text-text">
              {item.day}
            </VemtapText>
            <VemtapText variant="labelSm" tone="secondary" className="text-right">
              {item.hours}
            </VemtapText>
          </View>
        ))}
      </View>
    </View>
  );
}
