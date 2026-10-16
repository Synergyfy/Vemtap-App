import React from 'react';
import { View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { BottomSheet } from '@components/shared/BottomSheet';
import { strings } from '@constants/strings';
import type { BookingRules } from '@api/catalogueApi';
import { BusinessSheetActionRow } from '@features/business/components/BusinessOpsPrimitives';
import { clockLabel, weekdaysLabel } from '@features/business/utils/serviceSchedule';

const copy = strings.serviceFlow.bookingRulesSheet;
const { review } = strings.serviceFlow;

export interface ServiceBookingRulesSheetProps {
  visible: boolean;
  onClose: () => void;
  serviceName: string;
  rules: BookingRules;
  /** Branches that offer the service; `undefined` while they load. */
  branches?: readonly { id: string; name: string }[];
  onEditWeekly: () => void;
  onEditBlockouts: () => void;
  onEditBranch: (branch: { id: string; name: string }) => void;
}

/**
 * Booking Rules for an existing service: what is set, and the way into each
 * editor. Each row closes this sheet and opens its editor (never stacked).
 */
export function ServiceBookingRulesSheet({
  visible,
  onClose,
  serviceName,
  rules,
  branches,
  onEditWeekly,
  onEditBlockouts,
  onEditBranch,
}: ServiceBookingRulesSheetProps) {
  const hours = (entry: { days?: number[]; from?: string; to?: string }) =>
    review.daysHours(
      weekdaysLabel(entry.days, review.everyDay),
      clockLabel(entry.from, '9:00 AM'),
      clockLabel(entry.to, '6:00 PM'),
    );
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      <View className="gap-1 pb-2">
        <VemtapText variant="bodyMd" tone="secondary" numberOfLines={2}>
          {serviceName}
        </VemtapText>
        <BusinessSheetActionRow
          icon="calendarEdit"
          title={copy.weekly}
          subtitle={hours(rules)}
          onPress={onEditWeekly}
        />
        <BusinessSheetActionRow
          icon="doNotDisturb"
          title={copy.blockouts}
          subtitle={strings.serviceFlow.blockouts.summary(rules.blockouts?.length ?? 0)}
          onPress={onEditBlockouts}
        />
        <VemtapText
          variant="labelSm"
          className="mt-2 font-sans-semibold text-text-secondary"
        >
          {copy.branchesTitle}
        </VemtapText>
        {branches === undefined ? (
          <VemtapText variant="caption" tone="tertiary">
            {copy.loadingBranches}
          </VemtapText>
        ) : null}
        {(branches ?? []).map(branch => {
          const own = rules.branchSchedules?.find(entry => entry.branchId === branch.id);
          return (
            <BusinessSheetActionRow
              key={branch.id}
              icon="locationSchedule"
              title={branch.name}
              subtitle={own ? hours(own) : copy.sameAsService}
              onPress={() => onEditBranch(branch)}
            />
          );
        })}
      </View>
    </BottomSheet>
  );
}
