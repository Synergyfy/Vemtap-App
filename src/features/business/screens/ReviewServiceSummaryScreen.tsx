import React from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import {
  ServiceFlowPage,
  ServiceInfoRow,
  ServiceProgress,
  ServiceSection,
  ServiceSectionHeader,
} from '@features/business/components/ServiceFlowPrimitives';
import {
  serviceBranches,
  serviceFlowDraft,
  serviceFlowImages,
  servicePolicyRows,
  serviceReviewHighlights,
  serviceTiers,
} from '@features/business/data/serviceFlowData';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface ReviewServiceSummaryScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
}

export function ReviewServiceSummaryScreen({
  onBack,
  onNext,
  onSaveDraft,
  onPreview,
}: ReviewServiceSummaryScreenProps) {
  return (
    <ServiceFlowPage
      title="Add Service   Step 4: Review Service Summary"
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      contentContainerClassName="w-full max-w-[640px] self-center gap-6 px-4 py-4 pb-8"
    >
      <ServiceSection className="gap-3">
        <ServiceProgress
          stepLabel="Step 4 of 4: Final Review"
          statusLabel="100% Complete"
          statusTone="success"
          progress={100}
          leadingIcon="verified"
        />
        <View className="flex-row items-start gap-2 rounded-lg bg-surface-tint p-3">
          <Icon name="checkCircle" size={18} color={colors.primary} />
          <VemtapText
            variant="caption"
            tone="secondary"
            className="min-w-0 flex-1 leading-relaxed"
          >
            <VemtapText tone="brand" className="font-sans-semibold">
              Ready for bookings:
            </VemtapText>{' '}
            All treatment safety protocols and calendar schedules match VEMTAP Instant
            Booking standards.
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection className="gap-0 overflow-hidden p-0">
        <View className="relative h-52 w-full bg-surface-container">
          <BusinessProductImage
            source={{ uri: serviceFlowImages.review.uri }}
            alt={serviceFlowImages.review.alt}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute left-3 top-3 flex-row flex-wrap gap-1.5">
            <View className="flex-row items-center gap-1 rounded-full bg-surface/90 px-2 py-1 shadow-sm">
              <Icon name="photoLibrary" size={14} color={colors.text} />
              <VemtapText variant="caption" className="font-sans-medium text-text">
                3 Photos
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-primary px-2 py-1 shadow-sm">
              <Icon name="spa" size={14} color={colors.surface} />
              <VemtapText variant="caption" className="text-inverse font-sans-medium">
                In-Studio &amp; Mobile
              </VemtapText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit Basics"
            className="absolute bottom-3 right-3 min-h-11 flex-row items-center gap-1 rounded-full bg-surface px-3 py-2 shadow-sm active:bg-surface-muted"
          >
            <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
              Edit Basics
            </VemtapText>
            <Icon name="forward" size={14} color={colors.primary} />
          </Pressable>
        </View>
        <View className="gap-1 p-4">
          <View className="flex-row items-center gap-1">
            <Icon name="storefront" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" tone="tertiary" numberOfLines={1}>
              {serviceFlowDraft.provider}
            </VemtapText>
          </View>
          <VemtapText variant="headingMd" className="text-heading-md text-text">
            {serviceFlowDraft.title}
          </VemtapText>
          <VemtapText variant="bodyMd" tone="secondary">
            {serviceFlowDraft.primaryCategory} &gt; {serviceFlowDraft.subCategory}
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="payments"
          title="Pricing & Session Tiers"
          subtitle="3 customizable options available"
          actionLabel="Edit"
          boxedIcon
        />
        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-muted p-3">
          <View className="min-w-[150px] flex-1">
            <VemtapText variant="labelSm" tone="secondary">
              Base Starting Rate
            </VemtapText>
            <View className="mt-0.5 flex-row flex-wrap items-baseline gap-2">
              <VemtapText variant="headingSm" className="font-sans-bold text-text">
                {serviceFlowDraft.basePriceFormatted}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {serviceFlowDraft.compareAtPriceFormatted}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                • {serviceFlowDraft.duration}
              </VemtapText>
            </View>
          </View>
          <View className="rounded-full bg-success-container px-2 py-1">
            <VemtapText variant="caption" tone="success" className="font-sans-semibold">
              Save ₦4,000
            </VemtapText>
          </View>
        </View>
        <View className="gap-1.5">
          {serviceTiers.map(tier => (
            <View
              key={tier.id}
              className="flex-row items-center justify-between gap-3 rounded-lg bg-surface p-3 shadow-sm"
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-3">
                <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold text-text"
                    numberOfLines={1}
                  >
                    {tier.reviewName}
                  </VemtapText>
                  <VemtapText variant="caption" tone="tertiary">
                    {tier.reviewDescription}
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="labelMd" className="shrink-0 font-sans-bold text-text">
                {tier.price}
              </VemtapText>
            </View>
          ))}
        </View>
        <View className="flex-row items-start gap-2 pt-1">
          <Icon name="badge" size={18} color={colors.primary} />
          <VemtapText variant="labelSm" tone="secondary" className="min-w-0 flex-1">
            {serviceFlowDraft.specialist}
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="locationOn"
          title="Branch Availability"
          subtitle="2 Active Studios Serving This Treatment"
          actionLabel="Edit"
          boxedIcon
        />
        <View className="gap-1.5">
          {serviceBranches.map((branch, index) => (
            <View key={branch.id} className="gap-1 rounded-lg bg-surface-muted p-3">
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                  {branch.name}
                </VemtapText>
                <View
                  className={
                    index === 0
                      ? 'rounded-full bg-surface-container-high px-2 py-0.5'
                      : 'rounded-full bg-surface-tint px-2 py-0.5'
                  }
                >
                  <VemtapText
                    variant="caption"
                    className={
                      index === 0
                        ? 'font-sans-medium text-text'
                        : 'font-sans-medium text-primary'
                    }
                  >
                    {index === 0 ? 'Flagship' : 'Secondary'}
                  </VemtapText>
                </View>
              </View>
              <VemtapText variant="caption" tone="secondary">
                {branch.summary}
              </VemtapText>
            </View>
          ))}
        </View>
        <View className="flex-row items-center gap-2 pt-1">
          <Icon name="schedule" size={18} color={colors.tertiaryContainer} />
          <VemtapText variant="labelSm" tone="secondary" className="min-w-0 flex-1">
            Minimum 2 hours advance booking required
          </VemtapText>
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="policy"
          title="Booking & Safety Policies"
          actionLabel="Edit"
          boxedIcon
        />
        <View className="gap-3">
          {servicePolicyRows.map((policy, index) => (
            <ServiceInfoRow
              key={policy.title}
              icon={policy.icon}
              title={policy.title}
              description={policy.description}
              tone={index === 0 ? 'primary' : index === 1 ? 'success' : 'tertiary'}
            />
          ))}
        </View>
      </ServiceSection>

      <ServiceSection>
        <ServiceSectionHeader
          icon="autoAwesome"
          title="Treatment Highlights"
          actionLabel="Edit"
          boxedIcon
        />
        <VemtapText variant="bodyMd" tone="secondary" className="leading-relaxed">
          {serviceFlowDraft.reviewDescription}
        </VemtapText>
        <View className="flex-row flex-wrap gap-1.5">
          {serviceReviewHighlights.map(highlight => (
            <View key={highlight} className="rounded-full bg-surface-muted px-3 py-1">
              <VemtapText variant="caption" tone="secondary">
                {highlight}
              </VemtapText>
            </View>
          ))}
        </View>
      </ServiceSection>

      <View className="flex-row flex-wrap items-center justify-between gap-3 rounded-card-lg bg-surface-tint p-4 shadow-sm">
        <View className="min-w-[180px] flex-1 flex-row items-center gap-3">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon name="visibility" size={20} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
              Consumer View Preview
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              Simulate live client booking screen
            </VemtapText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Inspect consumer view"
          onPress={onPreview}
          className="min-h-11 shrink-0 justify-center rounded-lg bg-surface px-3 py-2 shadow-sm active:bg-surface-muted"
        >
          <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
            Inspect
          </VemtapText>
        </Pressable>
      </View>

      <View className="gap-3 pt-1">
        <Button
          label="Publish Service to Storefront 🚀"
          labelNumberOfLines={2}
          onPress={onNext}
        />
        <Button label="Save as Draft" variant="ghost" onPress={onSaveDraft} />
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="px-3 text-center leading-relaxed"
        >
          You can edit treatment details, block calendar dates, or convert this service
          into a promotional deal voucher anytime from your merchant portal.
        </VemtapText>
      </View>
    </ServiceFlowPage>
  );
}
