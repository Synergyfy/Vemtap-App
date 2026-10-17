import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import type { OpeningHours } from '@api/businessProfileApi';
import { isOpenNow, weeklyHours } from '@features/dealDetail/utils/openingHours';

cssInterop(View, { className: 'style' });

/**
 * The merchant's weekly hours from its profile, with an open/closed badge only
 * when today's hours are known. Renders nothing when there are no usable hours.
 */
export function HoursList({ hours }: { hours?: OpeningHours | null }) {
  const rows = weeklyHours(hours);
  if (rows.length === 0) return null;
  const open = isOpenNow(hours);
  return (
    <View className="rounded-2xl border border-border bg-surface-canvas p-4 shadow-md">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icon name="schedule" size={20} color={colors.primary} />
          <VemtapText variant="labelMd" className="font-sans-semibold text-text">
            {strings.urbanProfile.openingHours}
          </VemtapText>
        </View>
        {open === null ? null : (
          <View
            className={`rounded-full px-2 py-0.5 ${open ? 'bg-badge-discount-bg' : 'bg-surface-container'}`}
          >
            <VemtapText
              variant="caption"
              className={`font-sans-semibold ${open ? 'text-badge-discount-text' : 'text-text-secondary'}`}
            >
              {open
                ? strings.urbanProfile.openNowShort
                : strings.urbanProfile.closedNowShort}
            </VemtapText>
          </View>
        )}
      </View>
      <View className="gap-1.5 pt-2">
        {rows.map(item => (
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
