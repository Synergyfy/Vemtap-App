import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { AppModal } from '@components/ui/Modal';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { BusinessAnalyticsRow } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessPanel,
  BusinessSegmentTabs,
  BusinessToggleChip,
  type BusinessSegmentTab,
} from '@features/business/components/BusinessOpsPrimitives';

const copy = strings.businessIntelligence.filters;

const contextTabs: BusinessSegmentTab[] = [
  { key: 'deals', label: copy.contextTabs[0] },
  { key: 'pos', label: copy.contextTabs[1] },
  { key: 'customers', label: copy.contextTabs[2] },
];

export interface AnalyticsFilterSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (selection: AnalyticsFilterSelection) => void;
}

export interface AnalyticsFilterSelection {
  range: string;
  location: string;
  context: string;
  contextValue: string;
  till: string;
  cohort: string;
}

/**
 * Analytics Filter Settings.
 * stitch_vemtap_mobile_app_design/analytics_filter_settings — the source is a
 * centered scrim'd card (no bottom anchor, no grabber), so it uses the shared
 * modal shell rather than the bottom sheet, and composes the shared business
 * chips/tabs/rows instead of forking a second set of filter controls.
 */
export function AnalyticsFilterSettingsSheet({
  visible,
  onClose,
  onApply,
}: AnalyticsFilterSettingsSheetProps) {
  const [range, setRange] = useState<string>(copy.ranges[2]);
  const [location, setLocation] = useState<string>(copy.locations[0].id);
  const [context, setContext] = useState<string>('deals');
  const [dealStatus, setDealStatus] = useState<string>(copy.dealsContext[0]);
  const [till, setTill] = useState<string>(copy.till[0]);
  const [cohort, setCohort] = useState<string>(copy.customersContext[0]);

  const contextValue =
    context === 'deals' ? dealStatus : context === 'pos' ? till : cohort;

  // Only the visible context tab can contribute, so an inactive tab counts 0
  // rather than reading as a change.
  const activeCount =
    (range === copy.ranges[2] ? 0 : 1) +
    (location === copy.locations[0].id ? 0 : 1) +
    (context !== 'deals' || dealStatus === copy.dealsContext[0] ? 0 : 1) +
    (context !== 'pos' || till === copy.till[0] ? 0 : 1) +
    (context !== 'customers' || cohort === copy.customersContext[0] ? 0 : 1);

  function reset() {
    setRange(copy.ranges[2]);
    setLocation(copy.locations[0].id);
    setContext('deals');
    setDealStatus(copy.dealsContext[0]);
    setTill(copy.till[0]);
    setCohort(copy.customersContext[0]);
  }

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={copy.title}
      className="max-h-[86%]"
    >
      <ScrollView
        className="max-h-[68vh]"
        contentContainerClassName="gap-4 pb-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.scope}
            </VemtapText>
            <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
              {copy.scopeMeta}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
            <View className="h-1.5 w-1.5 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="micro"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.liveBadge}
            </VemtapText>
          </View>
        </View>

        <BusinessPanel tone="subtle" className="gap-2">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.rangeTitle}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.rangeMeta}
            </VemtapText>
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {copy.ranges.map(option => (
              <BusinessToggleChip
                key={option}
                label={option}
                icon="calendar"
                selected={option === range}
                onPress={() => setRange(option)}
              />
            ))}
          </View>
          {range === copy.ranges[copy.ranges.length - 1] ? (
            <View className="gap-2">
              <VemtapText variant="micro" tone="secondary">
                {copy.customTitle}
              </VemtapText>
              <View className="flex-row items-center gap-2">
                <View className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface p-2">
                  <VemtapText variant="micro" tone="tertiary">
                    {copy.startDate}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {copy.startValue}
                  </VemtapText>
                </View>
                <View className="min-w-0 flex-1 gap-0.5 rounded-field bg-surface p-2">
                  <VemtapText variant="micro" tone="tertiary">
                    {copy.endDate}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {copy.endValue}
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="micro" tone="tertiary">
                {copy.customMeta}
              </VemtapText>
            </View>
          ) : null}
        </BusinessPanel>

        <BusinessPanel tone="subtle" className="gap-2">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.locationsTitle}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.locationsMeta}
            </VemtapText>
          </View>
          {copy.locations.map(option => (
            <BusinessAnalyticsRow
              key={option.id}
              title={option.label}
              subtitle={option.meta}
              icon={option.id === 'all' ? 'layers' : 'storefront'}
              trailing={option.id === location ? copy.selected : undefined}
              trailingTone="brand"
              onPress={() => setLocation(option.id)}
            />
          ))}
        </BusinessPanel>

        <BusinessPanel tone="subtle" className="gap-2">
          <VemtapText variant="labelSm" className="font-sans-semibold">
            {copy.contextTitle}
          </VemtapText>
          <BusinessSegmentTabs
            tabs={contextTabs}
            value={context}
            onChange={setContext}
            accessibilityLabel={copy.contextTitle}
          />

          {context === 'deals' ? (
            <View className="gap-1.5">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText variant="micro" tone="secondary">
                  {copy.dealsContextTitle}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.dealsContextMeta}
                </VemtapText>
              </View>
              {copy.dealsContext.map(option => (
                <BusinessToggleChip
                  key={option}
                  label={option}
                  icon="localOffer"
                  selected={option === dealStatus}
                  onPress={() => setDealStatus(option)}
                />
              ))}
            </View>
          ) : null}

          {context === 'pos' ? (
            <View className="gap-2">
              <VemtapText variant="micro" tone="secondary">
                {copy.posContextTitle}
              </VemtapText>
              <View className="flex-row flex-wrap gap-1.5">
                {copy.posContext.map(option => (
                  <View key={option} className="rounded-full bg-surface px-2.5 py-1">
                    <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                      {option}
                    </VemtapText>
                  </View>
                ))}
              </View>
              <VemtapText variant="micro" tone="secondary">
                {copy.tillTitle}
              </VemtapText>
              {copy.till.map(option => (
                <BusinessToggleChip
                  key={option}
                  label={option}
                  icon="pointOfSale"
                  selected={option === till}
                  onPress={() => setTill(option)}
                />
              ))}
            </View>
          ) : null}

          {context === 'customers' ? (
            <View className="gap-1.5">
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                  {copy.customersContextTitle}
                </VemtapText>
                <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                  {copy.cohortMeta}
                </VemtapText>
              </View>
              {copy.customersContext.map(option => (
                <BusinessToggleChip
                  key={option}
                  label={option}
                  icon="group"
                  selected={option === cohort}
                  onPress={() => setCohort(option)}
                />
              ))}
            </View>
          ) : null}
        </BusinessPanel>
      </ScrollView>

      <View className="flex-row items-center gap-2 pt-4">
        <Button
          label={copy.reset}
          labelVariant="labelMd"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={reset}
        />
        <Button
          label={
            activeCount > 0
              ? copy.applyActive.replace('{count}', String(activeCount))
              : copy.apply
          }
          labelVariant="labelMd"
          size="sm"
          className="min-h-[44px] flex-1"
          leftIcon={<Icon name="check" size={18} color={colors.surface} />}
          onPress={() => {
            onApply?.({ range, location, context, contextValue, till, cohort });
            onClose();
          }}
        />
      </View>
    </AppModal>
  );
}
