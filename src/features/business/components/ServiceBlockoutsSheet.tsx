import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { BottomSheet } from '@components/shared/BottomSheet';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessSelectionChip } from '@features/business/components/BusinessPrimitives';
import {
  FieldInput,
  HorizontallyScrollableRow,
} from '@features/business/components/BusinessSetupPrimitives';
import type { ServiceBookingRules } from '@store/catalogueDraftStore';
import {
  blockoutMonths,
  dateKey,
  dayChipLabel,
  monthLabel,
  shortDateLabel,
} from '@features/business/utils/serviceSchedule';

const copy = strings.serviceFlow.blockouts;

/** How far ahead owners can block (matches the longest booking horizon offered). */
export const BLOCKOUT_WINDOW_DAYS = 90;

type Blockout = NonNullable<ServiceBookingRules['blockouts']>[number];

export interface ServiceBlockoutsSheetProps {
  visible: boolean;
  onClose: () => void;
  value: readonly Blockout[];
  onSave: (next: Blockout[]) => void;
  /** Clock (tests pin it). */
  now?: Date;
}

/**
 * Specific Dates & Blockouts: tap days in a month strip to block or unblock
 * them; newly blocked days take the optional reason. Built on the shared
 * BottomSheet with the same selection chips the schedule uses.
 */
export function ServiceBlockoutsSheet({
  visible,
  onClose,
  value,
  onSave,
  now,
}: ServiceBlockoutsSheetProps) {
  const months = useMemo(
    () => blockoutMonths(now ?? new Date(), BLOCKOUT_WINDOW_DAYS),
    [now],
  );
  const [month, setMonth] = useState(0);
  const [blocked, setBlocked] = useState<Blockout[]>([...value]);
  const [reason, setReason] = useState('');

  // Each opening starts from what is saved.
  useEffect(() => {
    if (!visible) return;
    setBlocked([...value]);
    setReason('');
    setMonth(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the sheet opens.
  }, [visible]);

  const keys = new Set(blocked.map(entry => entry.date));
  const toggle = (key: string) =>
    setBlocked(current =>
      keys.has(key)
        ? current.filter(entry => entry.date !== key)
        : [
            ...current,
            { date: key, ...(reason.trim() ? { reason: reason.trim() } : {}) },
          ],
    );
  const sorted = [...blocked].sort((a, b) => a.date.localeCompare(b.date));
  const days = months[month] ?? [];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      <ScrollView className="flex-shrink" keyboardShouldPersistTaps="handled">
        <View className="gap-4 pb-2">
          <VemtapText variant="bodyMd" tone="secondary">
            {copy.intro}
          </VemtapText>

          <View className="flex-row items-center justify-between gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.previousMonth}
              accessibilityState={{ disabled: month === 0 }}
              disabled={month === 0}
              onPress={() => setMonth(current => Math.max(0, current - 1))}
              className={`h-11 w-11 items-center justify-center rounded-full ${month === 0 ? 'opacity-40' : ''}`}
            >
              <Icon name="back" size={20} color={colors.text} />
            </Pressable>
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {days[0] ? monthLabel(days[0]) : ''}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.nextMonth}
              accessibilityState={{ disabled: month >= months.length - 1 }}
              disabled={month >= months.length - 1}
              onPress={() =>
                setMonth(current => Math.min(months.length - 1, current + 1))
              }
              className={`h-11 w-11 items-center justify-center rounded-full ${month >= months.length - 1 ? 'opacity-40' : ''}`}
            >
              <Icon name="forward" size={20} color={colors.text} />
            </Pressable>
          </View>

          <HorizontallyScrollableRow>
            {days.map(day => {
              const key = dateKey(day);
              return (
                <BusinessSelectionChip
                  key={key}
                  label={dayChipLabel(day)}
                  selected={keys.has(key)}
                  onPress={() => toggle(key)}
                />
              );
            })}
          </HorizontallyScrollableRow>

          <FieldInput
            label={copy.reasonLabel}
            value={reason}
            onChangeText={setReason}
            placeholder={copy.reasonPlaceholder}
            accessibilityLabel={copy.reasonLabel}
            maxLength={80}
          />

          <View className="gap-2">
            <VemtapText
              variant="labelSm"
              className="font-sans-semibold text-text-secondary"
            >
              {copy.blockedTitle(sorted.length)}
            </VemtapText>
            {sorted.length === 0 ? (
              <VemtapText variant="caption" tone="tertiary">
                {copy.none}
              </VemtapText>
            ) : null}
            {sorted.map(entry => {
              const label = shortDateLabel(entry.date);
              return (
                <View
                  key={entry.date}
                  className="flex-row items-center gap-2 rounded-field bg-surface-subtle px-3 py-2"
                >
                  <View className="min-w-0 flex-1">
                    <VemtapText variant="labelMd" className="font-sans-semibold">
                      {label}
                    </VemtapText>
                    {entry.reason ? (
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {entry.reason}
                      </VemtapText>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.remove(label)}
                    onPress={() => toggle(entry.date)}
                    className="h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  >
                    <Icon name="close" size={18} color={colors.textSecondary} />
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Button
            label={copy.save}
            labelVariant="labelMd"
            onPress={() => {
              onSave(sorted);
              onClose();
            }}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
