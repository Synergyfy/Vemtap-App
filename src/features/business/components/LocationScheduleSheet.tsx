import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { VemtapText } from '@components/ui/Text';
import { BottomSheet } from '@components/shared/BottomSheet';
import { strings } from '@constants/strings';
import { BusinessCheckRow } from '@features/business/components/BusinessPrimitives';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import { ServiceWeeklySchedule } from '@features/business/components/ServiceWeeklySchedule';
import { serviceWeekdays } from '@features/business/data/serviceFlowData';
import { parseTime, toHhmm } from '@features/business/utils/serviceSchedule';

const copy = strings.serviceFlow.locationSchedule;

/** `0 = Sunday … 6 = Saturday`, as the API stores weekdays. */
const DAY_NUMBER: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface WeeklyHours {
  days: number[];
  from: string;
  to: string;
}

export interface LocationScheduleSheetProps {
  visible: boolean;
  onClose: () => void;
  branchName: string;
  /** The service-wide schedule ("same as service", and the custom default). */
  serviceSchedule: WeeklyHours;
  /** This branch's own schedule, if it has one. */
  value?: WeeklyHours;
  /** `undefined` = follow the service schedule. */
  onSave: (next: WeeklyHours | undefined) => void;
}

/**
 * Edit Location Schedule: keep the service's days and hours at this branch,
 * or give it its own. Hours are typed inline (this is already a sheet, so no
 * second dialog is stacked on top).
 */
export function LocationScheduleSheet({
  visible,
  onClose,
  branchName,
  serviceSchedule,
  value,
  onSave,
}: LocationScheduleSheetProps) {
  const [custom, setCustom] = useState(Boolean(value));
  const [days, setDays] = useState<Set<string>>(new Set());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Each opening starts from what is saved.
  useEffect(() => {
    if (!visible) return;
    const start = value ?? serviceSchedule;
    setCustom(Boolean(value));
    setDays(new Set(serviceWeekdays.filter(day => start.days.includes(DAY_NUMBER[day]))));
    setFrom(start.from);
    setTo(start.to);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the sheet opens.
  }, [visible]);

  const toggleDay = (day: string) =>
    setDays(current => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  const save = () => {
    if (!custom) {
      onSave(undefined);
      onClose();
      return;
    }
    const start = parseTime(from);
    const end = parseTime(to);
    if (start === null || end === null || end <= start) {
      setError(copy.invalid);
      return;
    }
    if (days.size === 0) {
      setError(copy.pickDay);
      return;
    }
    onSave({
      days: serviceWeekdays.filter(day => days.has(day)).map(day => DAY_NUMBER[day]),
      from: toHhmm(start),
      to: toHhmm(end),
    });
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title(branchName)}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      <ScrollView className="flex-shrink" keyboardShouldPersistTaps="handled">
        <View className="gap-3 pb-2">
          <View accessibilityRole="radiogroup" className="gap-2">
            <BusinessCheckRow
              type="radio"
              title={copy.same}
              subtitle={copy.sameBody}
              selected={!custom}
              onPress={() => setCustom(false)}
            />
            <BusinessCheckRow
              type="radio"
              title={copy.custom}
              subtitle={copy.customBody}
              selected={custom}
              onPress={() => setCustom(true)}
            />
          </View>
          {custom ? (
            <ServiceWeeklySchedule
              activeDays={days}
              onToggleDay={day => {
                setError(null);
                toggleDay(day);
              }}
              startLabel={from}
              endLabel={to}
              hoursEditor={
                <View className="flex-row gap-2">
                  <View className="min-w-0 flex-1">
                    <FieldInput
                      label={copy.startLabel}
                      value={from}
                      onChangeText={text => {
                        setError(null);
                        setFrom(text);
                      }}
                      accessibilityLabel={copy.startLabel}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <FieldInput
                      label={copy.endLabel}
                      value={to}
                      onChangeText={text => {
                        setError(null);
                        setTo(text);
                      }}
                      accessibilityLabel={copy.endLabel}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                    />
                  </View>
                </View>
              }
            />
          ) : null}
          {error ? (
            <VemtapText
              variant="caption"
              className="text-error"
              accessibilityRole="alert"
            >
              {error}
            </VemtapText>
          ) : null}
          <Button label={copy.save} labelVariant="labelMd" onPress={save} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
