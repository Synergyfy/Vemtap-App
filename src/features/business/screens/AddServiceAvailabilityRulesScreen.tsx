import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import { BusinessSelectionChip } from '@features/business/components/BusinessPrimitives';
import {
  ServiceChoiceCard,
  ServiceFlowFooter,
  ServiceFlowPage,
  ServiceProgress,
  ServiceSection,
  ServiceSectionHeader,
} from '@features/business/components/ServiceFlowPrimitives';
import { serviceBranches } from '@features/business/data/serviceFlowData';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface AddServiceAvailabilityRulesScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
}

export function AddServiceAvailabilityRulesScreen({
  onBack,
  onNext,
  onSaveDraft,
}: AddServiceAvailabilityRulesScreenProps) {
  const [selectedOutlets, setSelectedOutlets] = useState(
    () => new Set<string>(serviceBranches.map(branch => branch.id)),
  );
  const [deselectMode, setDeselectMode] = useState(false);
  const [pricingMode, setPricingMode] = useState('universal');
  const [leadTime, setLeadTime] = useState('same-day');
  const [horizon, setHorizon] = useState('30-days');
  const [capacity, setCapacity] = useState(2);

  const toggleOutlet = (id: string) => {
    setSelectedOutlets(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOutlets = () => {
    const nextDeselectMode = !deselectMode;
    setDeselectMode(nextDeselectMode);
    setSelectedOutlets(
      nextDeselectMode
        ? new Set<string>()
        : new Set(serviceBranches.map(branch => branch.id)),
    );
  };

  return (
    <ServiceFlowPage
      title="Add Service   Step 3: Branch Availability & Appointment Rules"
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      footer={
        <ServiceFlowFooter
          primaryLabel="Review & Publish"
          onPrimary={onNext}
          backLabel="Back"
          onBack={onBack}
        />
      }
      contentContainerClassName="px-6 pb-10 pt-4"
    >
      <View className="gap-8">
        <View className="-mx-6 gap-2 bg-surface-container-low px-6 pb-3 pt-4">
          <ServiceProgress
            stepLabel="Step 3 of 4: Availability & Rules"
            statusLabel="75% Complete"
            progress={75}
            description="Select which branches offer this service and set booking schedule windows."
            stepLabelClassName="text-text"
          />
        </View>

        <View className="gap-3">
          <ServiceSectionHeader
            icon="storefront"
            title="Available Outlets & Studios"
            actionLabel={deselectMode ? 'Deselect all' : 'Select all (2 active)'}
            onAction={toggleAllOutlets}
          />
          <View className="gap-3">
            {serviceBranches.map((branch, index) => {
              const selected = selectedOutlets.has(branch.id);
              return (
                <ServiceSection key={branch.id} className="gap-3">
                  <View className="flex-row items-start gap-3">
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={branch.name}
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggleOutlet(branch.id)}
                      className="h-11 w-11 shrink-0 items-center justify-center"
                    >
                      <View
                        className={cn(
                          'h-5 w-5 items-center justify-center rounded-lg shadow-sm',
                          selected ? 'bg-primary' : 'bg-surface-container',
                        )}
                      >
                        {selected ? (
                          <Icon name="check" size={16} color={colors.surface} />
                        ) : null}
                      </View>
                    </Pressable>
                    <View className="min-w-0 flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <VemtapText
                          variant="bodyMd"
                          className="min-w-0 font-sans-semibold text-text"
                          numberOfLines={1}
                        >
                          {branch.name}
                        </VemtapText>
                        {index === 0 ? (
                          <View className="rounded-full bg-secondary-container px-2 py-0.5">
                            <VemtapText
                              variant="caption"
                              className="font-sans-semibold text-on-secondary-container"
                            >
                              Flagship
                            </VemtapText>
                          </View>
                        ) : null}
                      </View>
                      <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                        {branch.address}
                      </VemtapText>
                      <View className="mt-2 flex-row items-center gap-1.5">
                        <View className="h-2 w-2 rounded-full bg-success" />
                        <VemtapText
                          variant="caption"
                          tone="success"
                          className="font-sans-medium"
                        >
                          {branch.rooms}
                        </VemtapText>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row justify-end pt-1">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit Location Schedule for ${branch.name}`}
                      className="min-h-11 flex-row items-center gap-1 rounded-lg bg-surface-tint px-2.5 active:scale-[0.98]"
                    >
                      <Icon name="locationSchedule" size={16} color={colors.primary} />
                      <VemtapText
                        variant="button"
                        tone="brand"
                        className="font-sans-medium"
                      >
                        Edit Location Schedule
                      </VemtapText>
                    </Pressable>
                  </View>
                </ServiceSection>
              );
            })}
            <View className="flex-row items-start gap-3 rounded-card-lg bg-surface-muted/80 p-4 opacity-70">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
                <Icon name="lock" size={14} color={colors.textTertiary} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-2">
                  <VemtapText
                    variant="bodyMd"
                    className="font-sans-semibold text-text-secondary"
                  >
                    Garki Branch
                  </VemtapText>
                  <View className="rounded-full bg-surface-container-high px-2 py-0.5">
                    <VemtapText variant="caption">Opening June</VemtapText>
                  </View>
                </View>
                <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                  Area 11 Commercial District, Garki
                </VemtapText>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <ServiceSectionHeader icon="payments" title="Branch Pricing Mode" />
          <View accessibilityRole="radiogroup" className="gap-2">
            <ServiceChoiceCard
              title="Universal Session Price"
              description="Uniform ₦16,000 baseline across all active Abuja studios."
              selected={pricingMode === 'universal'}
              onPress={() => setPricingMode('universal')}
              selectionPosition="left"
              selectionStyle="dot"
              selectedTone="surface"
            />
            <ServiceChoiceCard
              title="Tiered Branch Pricing"
              description="Customize per studio (e.g. Maitama VIP suites premium or rent differentials)."
              selected={pricingMode === 'tiered'}
              onPress={() => setPricingMode('tiered')}
              selectionPosition="left"
              selectionStyle="dot"
              selectedTone="surface"
            />
          </View>
        </View>

        <View className="gap-4">
          <ServiceSectionHeader icon="tune" title="Booking Schedule & Slot Rules" />
          <ServiceSection className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              Minimum Lead Notice
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              Earliest time before appointment a guest can book online.
            </VemtapText>
            <View
              accessibilityRole="radiogroup"
              className="mt-2 flex-row flex-wrap gap-2"
            >
              {[
                ['same-day', 'Same day (2 hrs)'],
                ['12-hours', '12 hrs ahead'],
                ['24-hours', '24 hrs ahead'],
              ].map(([value, label]) => (
                <BusinessSelectionChip
                  key={value}
                  label={label}
                  selected={leadTime === value}
                  tone="neutral"
                  onPress={() => setLeadTime(value)}
                />
              ))}
            </View>
          </ServiceSection>
          <ServiceSection className="gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold text-text">
              Maximum Booking Horizon
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              How far into the future reservations are unlocked.
            </VemtapText>
            <View
              accessibilityRole="radiogroup"
              className="mt-2 flex-row flex-wrap gap-2"
            >
              {[
                ['14-days', '14 days'],
                ['30-days', '30 days in advance'],
                ['60-days', '60 days'],
              ].map(([value, label]) => (
                <BusinessSelectionChip
                  key={value}
                  label={label}
                  selected={horizon === value}
                  tone="neutral"
                  onPress={() => setHorizon(value)}
                />
              ))}
            </View>
          </ServiceSection>
          <ServiceSection className="flex-row flex-wrap items-center justify-between gap-3">
            <View className="min-w-[170px] flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                Concurrent Bookings
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                Simultaneous client capacity per time window.
              </VemtapText>
            </View>
            <View className="shrink-0 flex-row items-center gap-1 rounded-card-lg bg-surface-muted p-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease concurrent bookings"
                disabled={capacity <= 1}
                onPress={() => setCapacity(current => Math.max(1, current - 1))}
                className="h-11 w-11 items-center justify-center rounded-lg bg-surface shadow-sm active:bg-surface-container"
              >
                <Icon name="remove" size={18} color={colors.surfaceDark} />
              </Pressable>
              <View className="min-w-[58px] flex-row items-center justify-center gap-1 px-1">
                <VemtapText variant="headingSm" className="font-sans-bold text-primary">
                  {capacity}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  slots
                </VemtapText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase concurrent bookings"
                disabled={capacity >= 12}
                onPress={() => setCapacity(current => Math.min(12, current + 1))}
                className="h-11 w-11 items-center justify-center rounded-lg bg-surface shadow-sm active:bg-surface-container"
              >
                <Icon name="plus" size={18} color={colors.surfaceDark} />
              </Pressable>
            </View>
          </ServiceSection>
        </View>

        <View className="gap-3">
          <ServiceSectionHeader icon="verifiedUser" title="Policies & Automation" />
          <ServiceSection>
            <View className="flex-row items-start gap-3">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-container">
                <Icon name="schedule" size={18} color={colors.badgeDiscountText} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  Free Cancellation Cutoff
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  Complimentary cancellation up to 2 hours before scheduled session start.
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tint">
                <Icon name="hourglass" size={18} color={colors.primary} />
              </View>
              <View className="min-w-0 flex-1">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  Late Arrival Grace Window
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  15 minutes buffer window maintained before the appointment slot is
                  released.
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-start gap-2 rounded-card-lg bg-surface-tint p-3">
              <Icon name="sms" size={20} color={colors.primary} />
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1 leading-relaxed"
              >
                <VemtapText tone="brand" className="font-sans-semibold">
                  Automated WhatsApp Concierge:
                </VemtapText>{' '}
                Reminders are automatically triggered 24 hours and 2 hours prior to the
                session.
              </VemtapText>
            </View>
          </ServiceSection>
        </View>
      </View>
    </ServiceFlowPage>
  );
}
