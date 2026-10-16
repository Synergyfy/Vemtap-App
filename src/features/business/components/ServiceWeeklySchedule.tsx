import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { BusinessSelectionChip } from '@features/business/components/BusinessPrimitives';
import { serviceWeekdays } from '@features/business/data/serviceFlowData';
import { strings } from '@constants/strings';

const copy = strings.serviceFlow.weekly;

export interface ServiceWeeklyScheduleProps {
  /** Weekday labels that are on (`Mon` … `Sun`). */
  activeDays: ReadonlySet<string>;
  onToggleDay: (day: string) => void;
  startLabel: string;
  endLabel: string;
  /** Tapping the hours tiles; omit to make them read-only. */
  onPressHours?: () => void;
  /** Replaces the hours tiles (e.g. inline inputs inside a sheet). */
  hoursEditor?: ReactNode;
  /** Under the hours (slot length note). */
  footer?: ReactNode;
}

/**
 * Weekday chips and daily hours for a service. One owner for the Add Service
 * pricing step and the per-branch Location Schedule sheet.
 */
export function ServiceWeeklySchedule({
  activeDays,
  onToggleDay,
  startLabel,
  endLabel,
  onPressHours,
  hoursEditor,
  footer,
}: ServiceWeeklyScheduleProps) {
  return (
    <View className="gap-3 rounded-card-lg bg-surface-container-low p-3">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <VemtapText variant="labelSm" className="font-sans-semibold text-text">
          {copy.title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary">
          {copy.daysActive(activeDays.size)}
        </VemtapText>
      </View>
      <View accessibilityRole="radiogroup" className="flex-row gap-1">
        {serviceWeekdays.map(day => (
          <BusinessSelectionChip
            key={day}
            label={day}
            selected={activeDays.has(day)}
            tone="neutral"
            onPress={() => onToggleDay(day)}
            className="min-w-0 flex-1 rounded-lg px-0"
          />
        ))}
      </View>
      <View className="mt-1 gap-1.5">
        <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
          {copy.hours}
        </VemtapText>
        {hoursEditor ?? (
          <View className="flex-row gap-2">
            {[
              [copy.start, startLabel],
              [copy.end, endLabel],
            ].map(([label, value]) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${value}`}
                disabled={!onPressHours}
                onPress={onPressHours}
                className="min-w-0 flex-1 flex-row items-center justify-between gap-1 rounded-lg border border-border bg-surface px-3 py-2"
              >
                <View className="min-w-0 flex-1">
                  <VemtapText variant="micro" tone="tertiary" className="uppercase">
                    {label}
                  </VemtapText>
                  <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                    {value}
                  </VemtapText>
                </View>
                <Icon name="schedule" size={18} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}
      </View>
      {footer}
    </View>
  );
}
