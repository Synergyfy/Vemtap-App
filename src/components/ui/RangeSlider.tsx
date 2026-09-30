import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, View, type LayoutChangeEvent } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface RangeSliderProps {
  /** Controlled value in km. */
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Tick labels under the rail — numbers (`5`) or pre-formatted text. */
  ticks?: readonly (number | string)[];
  /** Formats a tick label; defaults to `String(value)`. */
  formatTick?: (value: number | string) => string;
  /** Formats the announced value; defaults to the raw number. */
  formatValue?: (value: number) => string;
  accessibilityLabel: string;
  icon?: React.ReactNode;
  /** Renders the current value as a pill above the rail. */
  showValuePill?: boolean;
  className?: string;
}

/**
 * The single owner of the single-value rail: drag to scrub, tap to seek, an
 * `adjustable` accessibility role with increment/decrement actions, optional
 * tick labels and an optional value pill.
 *
 * AGENTS rule 17: this pattern appears as a discovery radius in the consumer
 * filter sheet and the home location sheet, and as a branch radius / discount
 * range in business setup. All of them render this instead of hand-rolling
 * their own slider.
 */
export function RangeSlider({
  value,
  onChange,
  min = 1,
  max = 25,
  step = 1,
  ticks,
  formatTick,
  formatValue,
  accessibilityLabel,
  icon,
  showValuePill = false,
  className,
}: RangeSliderProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const boundsRef = useRef({ min, max, step });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    boundsRef.current = { min, max, step };
  }, [max, min, step]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const commit = useCallback((x: number) => {
    const trackWidth = widthRef.current;
    if (trackWidth <= 0) {
      return;
    }
    const { min: lo, max: hi, step: increment } = boundsRef.current;
    const ratio = Math.min(1, Math.max(0, x / trackWidth));
    const raw = lo + ratio * (hi - lo);
    const snapped = Math.round(raw / increment) * increment;
    const next = Math.min(hi, Math.max(lo, snapped));
    if (next !== valueRef.current) {
      valueRef.current = next;
      onChangeRef.current(next);
    }
  }, []);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => commit(event.nativeEvent.locationX),
        onPanResponderMove: event => commit(event.nativeEvent.locationX),
      }),
    [commit],
  );

  const onTrackLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    widthRef.current = next;
    setWidth(next);
  }, []);

  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <View className={cn('gap-2', className)}>
      {showValuePill ? (
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1">
            {ticks?.[0] !== undefined ? (
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {formatTick ? formatTick(ticks[0]) : String(ticks[0])}
              </VemtapText>
            ) : null}
          </View>
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-primary px-2.5 py-1 shadow-sm">
            {icon ?? <Icon name="nearMe" size={14} color={colors.surface} />}
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-primary-foreground"
              numberOfLines={1}
            >
              {formatValue ? formatValue(value) : String(value)}
            </VemtapText>
          </View>
          <View className="min-w-0 flex-1 items-end">
            {ticks?.[ticks.length - 1] !== undefined ? (
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {formatTick
                  ? formatTick(ticks[ticks.length - 1])
                  : String(ticks[ticks.length - 1])}
              </VemtapText>
            ) : null}
          </View>
        </View>
      ) : null}

      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={event => {
          const delta = step;
          if (event.nativeEvent.actionName === 'increment') {
            onChange(Math.min(max, value + delta));
          }
          if (event.nativeEvent.actionName === 'decrement') {
            onChange(Math.max(min, value - delta));
          }
        }}
        onLayout={onTrackLayout}
        className="justify-center py-2"
        {...responder.panHandlers}
      >
        <View className="h-2 justify-center rounded-full bg-surface-container">
          <View
            className="absolute left-0 h-2 rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
          {width > 0 ? (
            <View
              className="absolute h-5 w-5 rounded-full border-2 border-surface bg-primary shadow-sm"
              style={[
                { left: Math.min(Math.max(percent, 0), 100) * (width / 100) - 10 },
                { top: 6 },
              ]}
            />
          ) : null}
        </View>
      </View>

      {ticks && ticks.length > 0 ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="flex-row items-center justify-between gap-1"
        >
          {ticks.map(tick => (
            <VemtapText
              key={tick}
              variant="caption"
              tone="tertiary"
              numberOfLines={1}
              className={tick === value ? 'font-sans-semibold text-primary' : undefined}
            >
              {formatTick ? formatTick(tick) : String(tick)}
            </VemtapText>
          ))}
        </View>
      ) : null}
    </View>
  );
}
